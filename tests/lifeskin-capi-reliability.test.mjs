import test from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import { Pixel, warteKennung } from "../apps/lifeskin/lifeskin-pixel.js";
const require = createRequire(import.meta.url);
const payload = require("../functions/lifeskin-capi-payload.js");
const versand = require("../functions/lifeskin-capi-versand.js");
const jetzt = Date.now();
const sitzung = { step: "result", code: "LS-TEST-ABC", phone: "044111222", updatedAt: new Date(jetzt).toISOString(),
  device: { ua: "TestBrowser", zustimmung: "ja" }, source: { fbc: "fb.1.1790000000000.click" } };

// Firestore-Transaktionen werden atomar serialisiert; Netzverkehr bleibt ausserhalb.
function datenbank() {
  const daten = new Map();
  let kette = Promise.resolve();
  const ref = (pfad) => ({ id: pfad.split("/").at(-1), pfad,
    get: async () => ({ exists: daten.has(pfad), data: () => daten.get(pfad) }),
    update: async (neu) => { if (!daten.has(pfad)) throw Error("not found"); daten.set(pfad, { ...daten.get(pfad), ...neu }); },
    collection: (name) => sammlung(`${pfad}/${name}`) });
  const sammlung = (pfad) => ({ doc: (id) => ref(`${pfad}/${id}`),
    where: (feld, op, wert) => ({ limit: (anzahl) => ({ get: async () => ({ docs: [...daten.entries()]
      .filter(([p, d]) => p.startsWith(`${pfad}/`) && d[feld] === wert).slice(0, anzahl)
      .map(([p, d]) => ({ ref: ref(p), data: () => d })) }) }) }) });
  const db = { collection: sammlung, runTransaction: (fn) => {
    const aus = kette.then(async () => {
      const writes = [];
      const result = await fn({ get: (r) => r.get(), create: (r, d) => writes.push(() => {
        if (daten.has(r.pfad)) throw Error("already exists"); daten.set(r.pfad, d);
      }), update: (r, d) => writes.push(() => r.update(d)) });
      for (const write of writes) await write();
      return result;
    });
    kette = aus.catch(() => {}); return aus;
  } };
  return { db, daten, ref };
}
const antwort = (status, body) => ({ ok: status >= 200 && status < 300, status, json: async () => body });

test("Warteseite: identischer Name und ID im Browser/Server, ohne vertrauliche Inhalte", () => {
  const rufe = [];
  const pixel = new Pixel({ kennung: payload.PIXEL_ID, fbq: (...args) => rufe.push(args), dokument: null, einwilligung: true });
  pixel.starte(); pixel.melde("result", { code: sitzung.code }); pixel.melde("result", { code: sitzung.code });
  const server = payload.baueWarten(sitzung);
  assert.deepEqual(rufe.filter(r => r[0] === "trackCustom"), [
    ["trackCustom", "lifeskin_waiting_reached", {}, { eventID: server.event_id }]
  ]);
  assert.equal(warteKennung(sitzung.code), server.event_id);
  assert.equal(server.user_data.client_user_agent, "TestBrowser");
  assert.ok(server.user_data.ph[0].length === 64);
  assert.ok(!JSON.stringify(server).includes(sitzung.phone));
  assert.equal(payload.istWarten({ step: "aufbereitung" }, sitzung), true);
  assert.equal(payload.istWarten(sitzung, sitzung), false);
  assert.equal(payload.istWarten({}, { ...sitzung, order: { still: true } }), false);
  assert.equal(payload.istWarten({}, { ...sitzung, device: {} }), false, "alte Browser ohne eventID nicht doppelt zaehlen");
});

test("zwei Sender und zwei Wiederholungsarbeiter: nur einer sendet", async () => {
  const { db, ref } = datenbank(); const marke = ref("capi/test"); let sends = 0;
  const args = { db, marke, sessionId: "session", nutzlast: payload.baueWarten(sitzung), token: "test",
    fetchFn: async () => { sends++; return antwort(200, { events_received: 1 }); } };
  const result = await Promise.all([versand.versenden(args), versand.versenden(args)]);
  assert.equal(sends, 1); assert.equal(result.filter(r => r.status === "gesendet").length, 1);
  await versand.versenden(args); assert.equal(sends, 1);
});

test("eindeutige Ablehnung: erneuter Versuch, gleiche ID und Zeit, hoechstens drei", async () => {
  const { db, ref } = datenbank(); const marke = ref("capi/test"); const gesendet = [];
  const args = { db, marke, sessionId: "session", nutzlast: payload.baueWarten(sitzung), token: "test",
    fetchFn: async (url, options) => { gesendet.push(JSON.parse(options.body).data[0]); return antwort(503, { error: { message: "unavailable" } }); } };
  for (let i = 0; i < 5; i++) await versand.versenden(args);
  assert.equal(gesendet.length, 3); assert.deepEqual(gesendet[0], gesendet[2]);
});

test("keine Antwort oder keine Annahmebestaetigung: sichtbar unklar, keine Doppelzaehlung durch Wiederholung", async () => {
  for (const fetchFn of [async () => { throw Error("network"); }, async () => antwort(200, {})]) {
    const { db, ref } = datenbank(); const marke = ref("capi/test"); let sends = 0;
    const args = { db, marke, sessionId: "session", nutzlast: payload.baueWarten(sitzung), token: "test",
      fetchFn: (...args) => { sends++; return fetchFn(...args); } };
    assert.equal((await versand.versenden(args)).status, "unklar");
    await versand.versenden(args); assert.equal(sends, 1);
  }
});

test("ohne Token und bei Firestore-Ausfall wird nie an Meta gesendet", async () => {
  const { db, ref } = datenbank(); let sends = 0;
  const args = { db, marke: ref("capi/test"), nutzlast: payload.baueWarten(sitzung), token: "",
    fetchFn: async () => { sends++; } };
  assert.equal((await versand.versenden(args)).status, "skipped");
  await assert.rejects(versand.versenden({ ...args, token: "test", db: { runTransaction: async () => { throw Error("offline"); } } }));
  assert.equal(sends, 0);
});

// Statt 45 s zu warten, geht es sofort weiter; "gewartet" schreibt mit, wie
// lange die Function wartet, "beimWarten" spielt, was in der Zeit geschieht.
function hintergrund(db, { gewartet = [], beimWarten = () => {} } = {}) {
  const exports = {};
  const functions = { region: () => functions, runWith: () => functions,
    firestore: { document: () => ({ onWrite: (fn) => fn }) },
    pubsub: { schedule: () => ({ onRun: (fn) => fn }) } };
  vm.runInNewContext(readFileSync(new URL("../functions/lifeskin-capi.js", import.meta.url), "utf8"), {
    exports, process: { env: { META_CAPI_TOKEN: "test" } },
    setTimeout: (fertig, ms) => { gewartet.push(ms); Promise.resolve(beimWarten()).then(fertig); },
    require: (name) => name === "firebase-functions" ? functions : name === "firebase-admin"
      ? { apps: [true], firestore: () => db } : name === "./logging"
      ? { buildEventLogContext: () => ({}), logFunctionInfo() {}, logFunctionError() {} }
      : name === "./lifeskin-capi-payload" ? payload : versand
  });
  return exports;
}

test("Kaufablehnung wird ohne offenen Browser vom Hintergrund erneut gesendet; ID, Zeit und Wert bleiben", async () => {
  const { db, daten } = datenbank(); const fn = hintergrund(db);
  const kauf = { ...sitzung, step: "ordered", order: { orderId: "ORDER-1", total: 54, createdAt: new Date(jetzt).toISOString(), ua: "KaufBrowser" } };
  const sessionId = "abcdef123456"; const pfad = `lifeskin/lifeskin/sessions/${sessionId}`;
  daten.set(pfad, kauf);
  const original = globalThis.fetch; const gesendet = [];
  globalThis.fetch = async (url, options) => { gesendet.push(JSON.parse(options.body).data[0]);
    return gesendet.length === 1 ? antwort(503, { error: { message: "temporary" } }) : antwort(200, { events_received: 1 }); };
  try {
    await fn.lifeskinCapiPurchase({ before: { exists: false }, after: { exists: true, data: () => kauf } }, { params: { tenantId: "lifeskin", sessionId } });
    assert.equal(daten.get(`lifeskin/lifeskin/capiEvents/${sessionId}`).status, "fehler");
    kauf.order.total = 99;
    await fn.lifeskinCapiRetry(); await fn.lifeskinCapiRetry();
    assert.equal(gesendet.length, 2);
    assert.deepEqual(gesendet[0], gesendet[1]);
    assert.equal(daten.get(`lifeskin/lifeskin/capiEvents/${sessionId}`).status, "gesendet");
  } finally { globalThis.fetch = original; }
});

test("Warteseite wird durch Firestore gemeldet, auch ohne Browser-Anstoss", async () => {
  const { db, daten } = datenbank(); const fn = hintergrund(db); const original = globalThis.fetch; const gesendet = [];
  globalThis.fetch = async (url, options) => { gesendet.push(JSON.parse(options.body).data[0]); return antwort(200, { events_received: 1 }); };
  try {
    const change = { before: { exists: true, data: () => ({ step: "aufbereitung" }) }, after: { exists: true, data: () => sitzung } };
    await fn.lifeskinCapiWaiting(change, { params: { tenantId: "lifeskin", sessionId: "abc123456" } });
    await fn.lifeskinCapiWaiting(change, { params: { tenantId: "lifeskin", sessionId: "abc123456" } });
    assert.equal(gesendet.length, 1); assert.equal(gesendet[0].event_id, warteKennung(sitzung.code));
    assert.equal(daten.get("lifeskin/lifeskin/capiEvents/abc123456_waiting").status, "gesendet");
  } finally { globalThis.fetch = original; }
});

// ══ VERCEL ZUERST (Pixel-Aenderung erlaubt von Albert am 09.10.2026) ═══
//
// Meta meldete "IP-Adressparameter fehlt" und "User-Data-Parameter fehlt":
// Der Firestore-Ausloeser sieht den Browser nie und gewann oft das Rennen
// um die Marke gegen api/lifeskin-capi.js, das IP und _fbp kennt.
test("Firestore-Ausloeser laesst Vercel den Vortritt: liegt die Marke nach dem Warten, sendet er nicht", async () => {
  const { db, daten } = datenbank(); const sessionId = "vortritt123456";
  const kauf = { ...sitzung, step: "ordered", order: { orderId: "ORDER-V", total: 54, createdAt: new Date(jetzt).toISOString(), ua: "KaufBrowser" } };
  const gewartet = [];
  // Waehrend die Function wartet, meldet der Browser ueber Vercel - mit IP.
  const fn = hintergrund(db, { gewartet, beimWarten: () => daten.set(`lifeskin/lifeskin/capiEvents/${sessionId}`,
    { status: "gesendet", versuche: 1, sender: "vercel", eventId: "ORDER-V" }) });
  const original = globalThis.fetch; let sends = 0;
  globalThis.fetch = async () => { sends++; return antwort(200, { events_received: 1 }); };
  try {
    await fn.lifeskinCapiPurchase({ before: { exists: false }, after: { exists: true, data: () => kauf } }, { params: { tenantId: "lifeskin", sessionId } });
    assert.deepEqual(gewartet, [45000], "die Function wartet, bevor sie die Marke anlegt");
    assert.equal(sends, 0, "Vercel hat schon gemeldet - kein zweites, IP-loses Purchase");
    assert.equal(daten.get(`lifeskin/lifeskin/capiEvents/${sessionId}`).sender, "vercel");
  } finally { globalThis.fetch = original; }
});

test("Firestore-Ausloeser bleibt Ersatz: ohne Vercel-Marke sendet er nach dem Warten", async () => {
  const { db, daten } = datenbank(); const gewartet = []; const fn = hintergrund(db, { gewartet });
  const original = globalThis.fetch; const gesendet = [];
  globalThis.fetch = async (url, options) => { gesendet.push(JSON.parse(options.body).data[0]); return antwort(200, { events_received: 1 }); };
  try {
    const change = { before: { exists: true, data: () => ({ step: "aufbereitung" }) }, after: { exists: true, data: () => sitzung } };
    await fn.lifeskinCapiWaiting(change, { params: { tenantId: "lifeskin", sessionId: "ersatz123456" } });
    assert.deepEqual(gewartet, [45000]);
    assert.equal(gesendet.length, 1);
    assert.equal(daten.get("lifeskin/lifeskin/capiEvents/ersatz123456_waiting").status, "gesendet");
  } finally { globalThis.fetch = original; }
});

test("Wiederholung im Hintergrund behaelt IP, User-Agent und Kennungen aus der Vercel-Marke", async () => {
  const { db, daten } = datenbank(); const fn = hintergrund(db);
  const sessionId = "wiederholung1234";
  const kauf = { ...sitzung, step: "ordered", order: { orderId: "ORDER-W", total: 54, createdAt: new Date(jetzt).toISOString() } };
  daten.set(`lifeskin/lifeskin/sessions/${sessionId}`, kauf);
  const marke = { status: "fehler", versuche: 1, sender: "vercel", sessionId, eventId: "ORDER-W", eventName: "Purchase",
    eventTime: Math.floor(jetzt / 1000), value: 54 };
  daten.set(`lifeskin/lifeskin/capiEvents/${sessionId}`, { ...marke,
    browser: { ip: "203.0.113.7", ua: "Mozilla/5.0 (Kauf)", fbp: "fb.1.1790000000000.42", seite: "https://www.mnyra.com/lifeskinshop" } });
  // Eine Marke von vor dem 09.10.: Browser als Text. Sie geht weiter hinaus, nur ohne Browserangaben.
  daten.set("lifeskin/lifeskin/capiEvents/alt123456789", { ...marke, sessionId: "alt123456789", browser: "[object Object]" });
  daten.set("lifeskin/lifeskin/sessions/alt123456789", kauf);
  const original = globalThis.fetch; const gesendet = [];
  globalThis.fetch = async (url, options) => { gesendet.push(JSON.parse(options.body).data[0]); return antwort(200, { events_received: 1 }); };
  try {
    await fn.lifeskinCapiRetry();
    assert.equal(gesendet.length, 2);
    const neu = gesendet.find((e) => e.user_data.client_ip_address);
    assert.equal(neu.user_data.client_ip_address, "203.0.113.7");
    assert.equal(neu.user_data.client_user_agent, "Mozilla/5.0 (Kauf)");
    assert.equal(neu.user_data.fbp, "fb.1.1790000000000.42");
    assert.equal(daten.get(`lifeskin/lifeskin/capiEvents/${sessionId}`).mitIp, true);
  } finally { globalThis.fetch = original; }
});
