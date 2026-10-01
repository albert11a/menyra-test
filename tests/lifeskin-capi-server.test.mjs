// DIE CONVERSIONS API UEBER VERCEL (01.10.) - Kauf und Lead vom Server.
//
// Pixel-Aenderung erlaubt von Albert am 01.10.2026: CAPI v26.0, Lead
// zusaetzlich vom Server. Was hier feststeht:
//   - nie doppelt an Meta (Meta legt zwei gleiche SERVER-Ereignisse nicht
//     zusammen) - dieselbe Marke wie die Cloud Function
//   - ein zweiter Versuch nur, wenn Meta ausdruecklich abgelehnt hat
//   - Browser und Server tragen dieselbe eventID
//   - keine Nummer, kein Name, keine Anschrift, nie die Kennung der Sitzung
import test from "node:test";
import assert from "node:assert/strict";
import { generateKeyPairSync } from "node:crypto";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import lifeskinCapi, { ereignisseFuer, markeUebernehmen, markenKennung } from "../api/lifeskin-capi.js";
import { leadKennung as leadImBrowser } from "../apps/lifeskin/lifeskin-pixel.js";

const capi = createRequire(import.meta.url)("../functions/lifeskin-capi-payload.js");
const lies = (p) => readFileSync(new URL(`../${p}`, import.meta.url), "utf8");
const jetztIso = (minus = 0) => new Date(Date.now() - minus).toISOString();

const SITZUNG_ID = "a1b2c3d4e5f6a7b8c9d0";

function sitzungKauf(zusatz = {}) {
  return {
    code: "LS-0110-ABCDE", step: "ordered", name: "Arta Berisha", phone: "044111222", phoneConsent: true,
    createdAt: jetztIso(3600000), updatedAt: jetztIso(),
    address: { name: "Arta Berisha", strasse: "Rruga B 12", ort: "Prishtinë" },
    source: { utmSource: "ig", fbc: "fb.1.1790000000000.IwErsterBesuch" },
    order: { createdAt: jetztIso(1000), total: 49, orderId: "LS-0110-ABCDE", ua: "Mozilla/5.0 (Kauf)", seite: "https://www.mnyra.com/terapia", ...zusatz }
  };
}

test("die Schnittstelle ist v26.0, nicht mehr die abgelaufene v21.0", () => {
  assert.equal(capi.API_VERSION, "v26.0");
  assert.match(lies("functions/lifeskin-capi.js"), /graph\.facebook\.com\/\$\{API_VERSION\}/);
});

test("Lead: dieselbe eventID im Browser und am Server - die Fallnummer, nie die Sitzung", () => {
  assert.equal(capi.leadKennung("LS-0110-ABCDE"), "LS-0110-ABCDE-lead");
  assert.equal(leadImBrowser("LS-0110-ABCDE"), capi.leadKennung("LS-0110-ABCDE"));
  assert.equal(leadImBrowser(""), null);
  assert.equal(capi.leadKennung(""), "");
  for (const datei of ["apps/lifeskin/lifeskin-app.js", "apps/lifeskin-astra/astra.js"]) {
    const quelle = lies(datei);
    assert.ok(!/pixel\.meldeLead\(\)/.test(quelle), `${datei}: Lead ohne Fallnummer - Meta koennte Browser und Server nicht zusammenlegen`);
  }
});

test("Lead-Nutzlast: Metas Kennungen, User-Agent, Adresse - sonst nichts", () => {
  const browser = capi.browserAusAnfrage({ fbp: "fb.1.1790000000000.123456789", ua: "Mozilla/5.0 (Lead)", ip: "203.0.113.7, 10.0.0.1", seite: "https://www.mnyra.com/lifeskin" });
  const lead = capi.baueLead(sitzungKauf({}), { browser });
  assert.equal(lead.event_name, "Lead");
  assert.equal(lead.event_id, "LS-0110-ABCDE-lead");
  assert.equal(lead.action_source, "website");
  assert.equal(lead.event_source_url, "https://www.mnyra.com/lifeskin");
  assert.deepEqual(lead.user_data, {
    fbp: "fb.1.1790000000000.123456789", fbc: "fb.1.1790000000000.IwErsterBesuch",
    client_user_agent: "Mozilla/5.0 (Lead)", client_ip_address: "203.0.113.7"
  });
  const alles = JSON.stringify(lead);
  for (const heikel of ["Arta", "Berisha", "044111222", "Rruga", "Prishtin", SITZUNG_ID]) assert.ok(!alles.includes(heikel), heikel);
});

test("aus der Anfrage nur, was wie Metas Kennung aussieht - und nur unsere Seite", () => {
  assert.deepEqual(capi.browserAusAnfrage({ fbp: "Arta 044", fbc: "<script>", ip: "kein ip", seite: "https://boese.example/x" }), {});
  assert.deepEqual(capi.browserAusAnfrage({ seite: "https://www.mnyra.com/terapia/a1b2c3d4" }), {}, "die Kennung im Pfad geht nie an Meta");
});

test("Kauf: Bestellung geht vor, die Anfrage fuellt nur, was fehlt", () => {
  const kauf = capi.baueKauf(sitzungKauf({ fbp: "fb.1.1790000000000.111" }), {
    browser: { fbp: "fb.1.1790000000000.999", ua: "Mozilla/5.0 (Anfrage)", ip: "203.0.113.7" }
  });
  assert.equal(kauf.event_id, "LS-0110-ABCDE");
  assert.equal(kauf.user_data.fbp, "fb.1.1790000000000.111");
  assert.equal(kauf.user_data.client_user_agent, "Mozilla/5.0 (Kauf)");
  assert.equal(kauf.user_data.client_ip_address, "203.0.113.7");
  assert.equal(kauf.user_data.fbc, "fb.1.1790000000000.IwErsterBesuch");
});

test("was faellig ist: frische Kaeufe und Leads, nie Probelaeufe, nie Altes", () => {
  assert.deepEqual(ereignisseFuer(sitzungKauf(), "kauf"), ["kauf"]);
  assert.deepEqual(ereignisseFuer(sitzungKauf({ still: true }), "kauf"), []);
  assert.deepEqual(ereignisseFuer(sitzungKauf({ createdAt: jetztIso(2 * 86400000) }), "kauf"), []);
  assert.deepEqual(ereignisseFuer({ ...sitzungKauf(), step: "result" }, "kauf"), []);
  const lead = { code: "LS-1", phone: "044", phoneConsent: true, createdAt: jetztIso(600000), updatedAt: jetztIso() };
  assert.deepEqual(ereignisseFuer(lead, "lead"), ["lead"]);
  assert.deepEqual(ereignisseFuer({ ...lead, updatedAt: jetztIso(2 * 3600000) }, "lead"), [], "ein Lead von heute frueh ist keine Meldung mehr");
  assert.deepEqual(ereignisseFuer({ ...lead, phoneConsent: false }, "lead"), []);
  assert.deepEqual(ereignisseFuer({ ...lead, phoneConsent: false, waClick: true }, "lead"), ["lead"]);
  assert.deepEqual(ereignisseFuer({ ...lead, code: "" }, "lead"), []);
  assert.deepEqual(ereignisseFuer(lead, "irgendwas"), []);
});

test("Marke: nur nach einer Ablehnung neu, nie nach einer verlorenen Antwort", () => {
  assert.equal(markeUebernehmen({ status: "fehler", versuche: 1 }), true);
  assert.equal(markeUebernehmen({ status: "fehler", versuche: 3 }), false);
  for (const stand of ["gesendet", "unklar", "laeuft"]) assert.equal(markeUebernehmen({ status: stand, versuche: 1 }), false, stand);
  assert.equal(markeUebernehmen({ eventId: "LS-1" }), false, "die Marke der Cloud Function gehoert ihr");
  assert.equal(markenKennung("kauf", "abc"), "abc", "dieselbe Marke wie die Cloud Function");
  assert.equal(markenKennung("lead", "abc"), "abc_lead");
});

// ══ ZUR LAUFZEIT, mit Firestore und Meta nachgebaut ═══════════════════
function welt({ meta = () => ({ status: 200, body: { events_received: 1 } }) } = {}) {
  const docs = new Map();
  const anMeta = [];
  let zeit = 0;
  const stempel = () => `2026-10-01T00:00:${String(++zeit).padStart(2, "0")}.000000Z`;
  const fetchFn = async (url, optionen = {}) => {
    const u = new URL(String(url));
    const antwort = (status, body) => ({ ok: status >= 200 && status < 300, status, json: async () => body });
    if (u.hostname === "oauth2.googleapis.com") return antwort(200, { access_token: "zugang", expires_in: 3600 });
    if (u.hostname === "graph.facebook.com") {
      if (optionen.method === "POST") {
        anMeta.push({ pfad: u.pathname, koerper: JSON.parse(optionen.body) });
        const r = meta(anMeta.length);
        if (r === "netz") throw new Error("Verbindung weg");
        return antwort(r.status, r.body);
      }
      return antwort(200, { name: "LF WEB", last_fired_time: "2026-10-01T10:00:00+0000" });
    }
    const pfad = decodeURIComponent(u.pathname.split("/documents/")[1] || "");
    const methode = optionen.method || "GET";
    if (methode === "GET") {
      const d = docs.get(pfad);
      return d ? antwort(200, d) : antwort(404, {});
    }
    if (methode === "POST") {
      const ziel = `${pfad}/${u.searchParams.get("documentId")}`;
      if (docs.has(ziel)) return antwort(409, {});
      const d = { fields: JSON.parse(optionen.body).fields, updateTime: stempel() };
      docs.set(ziel, d);
      return antwort(200, d);
    }
    if (methode === "PATCH") {
      const alt = docs.get(pfad) || { fields: {} };
      const bedingung = u.searchParams.get("currentDocument.updateTime");
      if (bedingung && bedingung !== alt.updateTime) return antwort(412, {});
      const neu = JSON.parse(optionen.body).fields;
      for (const f of u.searchParams.getAll("updateMask.fieldPaths")) alt.fields[f] = neu[f];
      alt.updateTime = stempel();
      docs.set(pfad, alt);
      return antwort(200, alt);
    }
    return antwort(500, {});
  };
  return { docs, anMeta, fetchFn };
}

function alsFelder(o) {
  const f = (v) => typeof v === "string" ? { stringValue: v } : typeof v === "boolean" ? { booleanValue: v }
    : typeof v === "number" ? { integerValue: String(v) } : { mapValue: { fields: alsFelder(v) } };
  return Object.fromEntries(Object.entries(o).map(([k, v]) => [k, f(v)]));
}

async function aufruf(w, koerper, { methode = "POST", headers = {} } = {}) {
  const altFetch = globalThis.fetch;
  globalThis.fetch = w.fetchFn;
  let status = 0;
  let text = "";
  try {
    await lifeskinCapi(
      { method: methode, body: koerper, headers: { "user-agent": "Mozilla/5.0 (Test)", "x-forwarded-for": "203.0.113.9", ...headers } },
      { setHeader() {}, set statusCode(s) { status = s; }, get statusCode() { return status; }, end(t) { text = t; } }
    );
  } finally {
    globalThis.fetch = altFetch;
  }
  return { status, daten: JSON.parse(text || "{}") };
}

const { privateKey } = generateKeyPairSync("rsa", { modulusLength: 2048 });
const SCHLUESSEL = JSON.stringify({ client_email: "test@x.iam.gserviceaccount.com", private_key: privateKey.export({ type: "pkcs8", format: "pem" }) });

async function mitUmgebung(werte, fn) {
  const alt = {};
  for (const [k, v] of Object.entries(werte)) { alt[k] = process.env[k]; if (v == null) delete process.env[k]; else process.env[k] = v; }
  try { return await fn(); } finally {
    for (const [k, v] of Object.entries(alt)) { if (v == null) delete process.env[k]; else process.env[k] = v; }
  }
}

const SESSION_PFAD = `lifeskin/lifeskin/sessions/${SITZUNG_ID}`;
const MARKE = `lifeskin/lifeskin/capiEvents/${SITZUNG_ID}`;

test("Kauf: genau einmal an Meta, auch wenn die Seite dreimal anstoesst", async () => {
  await mitUmgebung({ MNYRA_FIREBASE_ADMIN_KEY: SCHLUESSEL, META_CAPI_TOKEN: "tok", META_CAPI_TEST_CODE: null }, async () => {
    const w = welt();
    w.docs.set(SESSION_PFAD, { fields: alsFelder(sitzungKauf()), updateTime: "x" });
    const erst = await aufruf(w, { id: SITZUNG_ID, art: "kauf", fbp: "fb.1.1790000000000.555" });
    assert.equal(erst.status, 200);
    await aufruf(w, { id: SITZUNG_ID, art: "kauf" });
    await aufruf(w, { id: SITZUNG_ID, art: "kauf" });
    assert.equal(w.anMeta.length, 1, "Meta bekam den Kauf mehrfach - vom Server zaehlt Meta jeden");
    const gesendet = w.anMeta[0];
    assert.equal(gesendet.pfad, "/v26.0/1347571994123884/events");
    const e = gesendet.koerper.data[0];
    assert.equal(e.event_name, "Purchase");
    assert.equal(e.event_id, "LS-0110-ABCDE");
    assert.equal(e.custom_data.value, 49);
    assert.equal(e.user_data.client_ip_address, "203.0.113.9");
    assert.ok(!("test_event_code" in gesendet.koerper));
    assert.ok(!/Arta|044111222|Rruga|Prishtin|a1b2c3d4e5f6/.test(JSON.stringify(gesendet.koerper)));
    assert.equal(w.docs.get(MARKE).fields.status.stringValue, "gesendet");
  });
});

test("Lead: einmal, mit eigener Marke neben der des Kaufs", async () => {
  await mitUmgebung({ MNYRA_FIREBASE_ADMIN_KEY: SCHLUESSEL, META_CAPI_TOKEN: "tok" }, async () => {
    const w = welt();
    w.docs.set(SESSION_PFAD, { fields: alsFelder({ code: "LS-0110-ABCDE", phone: "044111222", phoneConsent: true, createdAt: jetztIso(300000), updatedAt: jetztIso(), step: "numri" }), updateTime: "x" });
    await aufruf(w, { id: SITZUNG_ID, art: "lead" });
    await aufruf(w, { id: SITZUNG_ID, art: "lead" });
    assert.equal(w.anMeta.length, 1);
    assert.equal(w.anMeta[0].koerper.data[0].event_name, "Lead");
    assert.equal(w.anMeta[0].koerper.data[0].event_id, "LS-0110-ABCDE-lead");
    assert.equal(w.docs.get(`${MARKE}_lead`).fields.status.stringValue, "gesendet");
    // Ein Kauf-Anstoss bringt kein Lead mit, ein Lead-Anstoss keinen Kauf.
    assert.equal((await aufruf(w, { id: SITZUNG_ID, art: "kauf" })).daten.ergebnisse.length, 0);
  });
});

test("Meta lehnt ab: 503 (die Seite versucht es noch einmal), dann geht es durch - hoechstens dreimal", async () => {
  await mitUmgebung({ MNYRA_FIREBASE_ADMIN_KEY: SCHLUESSEL, META_CAPI_TOKEN: "tok" }, async () => {
    const w = welt({ meta: (n) => (n === 1 ? { status: 400, body: { error: { message: "Invalid parameter" } } } : { status: 200, body: { events_received: 1 } }) });
    w.docs.set(SESSION_PFAD, { fields: alsFelder(sitzungKauf()), updateTime: "x" });
    assert.equal((await aufruf(w, { id: SITZUNG_ID, art: "kauf" })).status, 503);
    assert.equal(w.docs.get(MARKE).fields.status.stringValue, "fehler");
    assert.equal((await aufruf(w, { id: SITZUNG_ID, art: "kauf" })).status, 200);
    assert.equal(w.docs.get(MARKE).fields.status.stringValue, "gesendet");
    await aufruf(w, { id: SITZUNG_ID, art: "kauf" });
    assert.equal(w.anMeta.length, 2, "nach der Ablehnung genau ein zweiter Versuch");

    const immer = welt({ meta: () => ({ status: 500, body: { error: { message: "down" } } }) });
    immer.docs.set(SESSION_PFAD, { fields: alsFelder(sitzungKauf()), updateTime: "x" });
    for (let i = 0; i < 6; i += 1) await aufruf(immer, { id: SITZUNG_ID, art: "kauf" });
    assert.equal(immer.anMeta.length, 3, "nie mehr als drei Versuche");
  });
});

test("keine Antwort von Meta: kein zweiter Versuch (es koennte angekommen sein)", async () => {
  await mitUmgebung({ MNYRA_FIREBASE_ADMIN_KEY: SCHLUESSEL, META_CAPI_TOKEN: "tok" }, async () => {
    const w = welt({ meta: () => "netz" });
    w.docs.set(SESSION_PFAD, { fields: alsFelder(sitzungKauf()), updateTime: "x" });
    assert.equal((await aufruf(w, { id: SITZUNG_ID, art: "kauf" })).status, 200);
    await aufruf(w, { id: SITZUNG_ID, art: "kauf" });
    assert.equal(w.anMeta.length, 1);
    assert.equal(w.docs.get(MARKE).fields.status.stringValue, "unklar");
  });
});

test("hat die Cloud Function schon gemeldet, meldet Vercel nicht noch einmal", async () => {
  await mitUmgebung({ MNYRA_FIREBASE_ADMIN_KEY: SCHLUESSEL, META_CAPI_TOKEN: "tok" }, async () => {
    const w = welt();
    w.docs.set(SESSION_PFAD, { fields: alsFelder(sitzungKauf()), updateTime: "x" });
    w.docs.set(MARKE, { fields: alsFelder({ eventId: "LS-0110-ABCDE", value: 49 }), updateTime: "y" });
    await aufruf(w, { id: SITZUNG_ID, art: "kauf" });
    assert.equal(w.anMeta.length, 0);
  });
});

test("nicht eingerichtet: 424 ohne Wiederholung; GET sagt, was fehlt - ohne Geheimnis", async () => {
  await mitUmgebung({ MNYRA_FIREBASE_ADMIN_KEY: SCHLUESSEL, META_CAPI_TOKEN: null }, async () => {
    const w = welt();
    const r = await aufruf(w, { id: SITZUNG_ID, art: "kauf" });
    assert.equal(r.status, 424);
    assert.equal(r.daten.grund, "kein-meta-token");
    const d = await aufruf(w, undefined, { methode: "GET" });
    assert.deepEqual({ firebase: d.daten.firebaseSchluessel, meta: d.daten.metaToken, version: d.daten.version }, { firebase: true, meta: false, version: "v26.0" });
  });
  await mitUmgebung({ MNYRA_FIREBASE_ADMIN_KEY: SCHLUESSEL, META_CAPI_TOKEN: "geheim-123" }, async () => {
    const d = await aufruf(welt(), undefined, { methode: "GET" });
    assert.equal(d.daten.meta.tokenGilt, true);
    assert.ok(!JSON.stringify(d.daten).includes("geheim-123"), "das Token steht in der Diagnose");
  });
  assert.equal((await aufruf(welt(), { id: "x", art: "kauf" })).status, 400);
  assert.equal((await aufruf(welt(), { id: SITZUNG_ID, art: "alles" })).status, 400);
});

test("die Seiten stossen an, sobald Bestellung oder Nummer gespeichert ist", async () => {
  const { AnalyseDaten } = await import("../apps/lifeskin-astra/astra-daten.js");
  const { Sitzung } = await import("../apps/lifeskin/lifeskin-session.js");
  globalThis.location = { protocol: "https:", origin: "https://www.mnyra.com", href: "https://www.mnyra.com/terapia/abc", pathname: "/terapia/abc", search: "" };
  const warte = () => new Promise((r) => setTimeout(r, 20));
  const capiAufrufe = (liste) => liste.filter((a) => a.url.endsWith("/api/lifeskin-capi")).map((a) => JSON.parse(a.body));
  try {
    const seite = [];
    const d = new AnalyseDaten({ kennung: "abc123def456", fetchFn: async (url, o = {}) => { seite.push({ url: String(url), body: o.body }); return { ok: true, status: 200 }; } });
    await d.merken({ step: "ordered", order: { orderId: "LS-1" } });
    await d.merken({ phone: "044", phoneConsent: true });
    await d.merken({ sahPreis: true });
    await warte();
    const auf = capiAufrufe(seite);
    assert.deepEqual(auf.map((a) => a.art), ["kauf", "lead"]);
    assert.equal(auf[0].seite, "https://www.mnyra.com/terapia", "die Seite ohne Fallkennung");

    const trichter = [];
    const s = new Sitzung({ speicher: null, fetchFn: async (url, o = {}) => { trichter.push({ url: String(url), body: o.body }); return { ok: true, status: 200 }; } });
    await s.ergaenze({ phone: "044", phoneConsent: true });
    await s.ergaenze({ phone: "044", phoneConsent: true });
    await warte();
    assert.deepEqual(capiAufrufe(trichter).map((a) => a.art), ["lead"], "Lead aus dem Trichter: genau ein Anstoss");

    // Nicht gespeichert: kein Anstoss.
    const fehl = [];
    const f = new AnalyseDaten({ kennung: "abc123def456", fetchFn: async (url, o = {}) => { fehl.push({ url: String(url), body: o.body }); return { ok: false, status: 403 }; } });
    await f.merken({ step: "ordered", order: { orderId: "LS-1" } });
    await warte();
    assert.equal(capiAufrufe(fehl).length, 0);
  } finally {
    delete globalThis.location;
  }
});

// 01.10.: Mit createRequire fand Vercel (@vercel/nft) die Nutzlast-Datei beim
// Buendeln nicht - die Funktion brach live beim Laden ab. Jede Vercel-Funktion
// laedt ihre Helfer deshalb mit einem statischen import.
test("Vercel-Funktionen laden ihre Helfer statisch (sonst fehlen sie im Paket)", () => {
  for (const datei of ["api/lifeskin-capi.js", "api/lifeskin-meldung.js"]) {
    const quelle = lies(datei).replace(/^\s*\/\/.*$/gm, "");
    assert.ok(!/createRequire|require\(/.test(quelle), `${datei}: createRequire/require - Vercel buendelt die Datei dann nicht mit`);
  }
  assert.match(lies("api/lifeskin-capi.js"), /^import capi from "\.\.\/functions\/lifeskin-capi-payload\.js";$/m);
});
