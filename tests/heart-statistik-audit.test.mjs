import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { statistikPatch, statistikTag } from "../shared/lifeskin-statistik.js";
import { AnalyseDaten, dokument } from "../apps/lifeskin-astra/astra-daten.js";
import { Sitzung } from "../apps/lifeskin/lifeskin-session.js";
import {
  normalisiere, baueLesetiefe, heuteSchluessel, davorZeitraum, imZeitraum,
  baueKennzahlen, baueTagesverlauf, bestellungenImZeitraum, entdopple,
  aktualisiereLifeskinSitzungen, baueTrichter
} from "../apps/mnyra-heart/heart-lifeskin-berechnung.js";
import { baueLive } from "../apps/mnyra-heart/heart-lifeskin-live.js";
import { renderLifeskin } from "../apps/mnyra-heart/heart-lifeskin-render.js";

const heute = () => heuteSchluessel();
const zeit = (tag = heute()) => `${tag}T10:00:00.000Z`;
const leseZahl = (sessions, range, key) => baueLesetiefe(sessions, range).find((m) => m.id === key);
const fall = (id, data = {}) => normalisiere(id, {
  createdAt: zeit(heuteSchluessel(2)), updatedAt: new Date().toISOString(), step: "result", ...data
});

test("checkout on an older scan appears today, while the scan cohort stays unchanged", () => {
  const s = fall("older", { berichtGeoeffnet: true, kasseGeoeffnet: true,
    timings: { ereignisse: { [heute()]: { berichtGeoeffnet: zeit(), kasseGeoeffnet: zeit() } } } });
  assert.equal(imZeitraum([s], "heute").length, 0);
  assert.equal(leseZahl([s], "heute", "kasseGeoeffnet").anzahl, 1);
  assert.equal(leseZahl([s], "heute", "kasseGeoeffnet").geschaetzt, 0);
  const html = renderLifeskin({ status: "ready", sitzungen: [s], zeitraum: "heute",
    kennzahlen: baueKennzahlen([s]), trichter: baueTrichter([s]), produkte: [], berichte: {} });
  // Der Block traegt keine Fussnote mehr, also wird er an dem erkannt, was
  // er zeigt: seiner Ueberschrift und der Zeile, um die es geht.
  assert.ok(html.includes("Wie weit im Bericht gelesen wird"));
  assert.match(html, /Kasse geoeffnet<\/span>[\s\S]*?__zahl">1<\/b>/);
});

test("revisits count on each event day, but only once per case in a wider period", () => {
  const gestern = heuteSchluessel(1);
  const s = fall("repeat", { kasseGeoeffnet: true, timings: { ereignisse: {
    [gestern]: { kasseGeoeffnet: zeit(gestern) }, [heute()]: { kasseGeoeffnet: zeit() }
  } } });
  assert.equal(leseZahl([s], "gestern", "kasseGeoeffnet").anzahl, 1);
  assert.equal(leseZahl([s], "heute", "kasseGeoeffnet").anzahl, 1);
  assert.equal(leseZahl([s], "woche", "kasseGeoeffnet").anzahl, 1);
});

test("a later unrelated update cannot move a timestamped checkout into today", () => {
  const gestern = heuteSchluessel(1);
  const s = fall("old-checkout", { kasseGeoeffnet: true, timings: { ereignisse: {
    [gestern]: { kasseGeoeffnet: zeit(gestern) }
  } } });
  assert.equal(leseZahl([s], "heute", "kasseGeoeffnet").anzahl, 0);
});

test("legacy report flags are explicitly estimated; max remains an exact stored flag count", () => {
  const s = fall("legacy", { kasseGeoeffnet: true });
  assert.equal(leseZahl([s], "heute", "kasseGeoeffnet").geschaetzt, 1);
  assert.equal(leseZahl([s], "max", "kasseGeoeffnet").anzahl, 1);
  assert.equal(leseZahl([s], "max", "kasseGeoeffnet").geschaetzt, 0);
});

test("event PATCH uses leaf masks and preserves unrelated timings and other event days", () => {
  const patch = statistikPatch({ kasseGeoeffnet: true }, "2026-09-18T22:30:00.000Z");
  assert.equal(statistikTag("2026-09-18T22:30:00.000Z"), "2026-09-19");
  assert.deepEqual(patch.masken, ["kasseGeoeffnet", "updatedAt", "timings.ereignisse.`2026-09-19`.kasseGeoeffnet"]);
  assert.equal(patch.daten.timings.ereignisse["2026-09-19"].kasseGeoeffnet, "2026-09-18T22:30:00.000Z");
});

test("typing an address records progress before order submission without exposing its contents", () => {
  const patch = statistikPatch({ timings: { live: "address" } }, zeit());
  const s = fall("typing", patch.daten);
  assert.equal(s.hatAnschrift, true);
  assert.equal(s.hatBestellt, false);
  assert.equal(s.address, null);
  const live = baueLive([s], Date.parse(zeit()));
  assert.equal(live.bestellungen.punkte.find((p) => p.id === "anschrift").anzahl, 1);
  assert.equal(live.analysen.gesamt, 0);
});

test("checkout belongs to just one live row; return to report clears the checkout position", () => {
  const s = fall("checkout", { kasseGeoeffnet: true });
  assert.equal(baueLive([s]).analysen.gesamt, 0);
  assert.equal(baueLive([s]).bestellungen.gesamt, 1);
  s.timings = { live: "fertig" };
  assert.equal(baueLive([s]).bestellungen.gesamt, 0);
});

test("both premarked and retrospectively marked tests are excluded from live", () => {
  const sessions = [fall("real"), fall("campaign", { source: { utmCampaign: "test" } }), fall("marked")];
  const live = baueLive(sessions, Date.now(), undefined, { marked: { test: true } });
  assert.equal(live.analysen.gesamt, 1);
});

test("live updates reconcile detail and overview, preserving report order dates and tests", () => {
  const state = { sitzungen: [fall("a")], tests: [], berichte: { a: { bestelltAt: zeit() }, t: { test: true } } };
  const next = aktualisiereLifeskinSitzungen(state, [fall("a", { kasseGeoeffnet: true }), fall("t")]);
  assert.equal(next.sitzungen.length, 1);
  assert.equal(next.sitzungen[0].kasseGeoeffnet, true);
  assert.equal(next.sitzungen[0].bestelltAt, zeit());
  assert.equal(leseZahl(next.sitzungen, "heute", "kasseGeoeffnet").anzahl, 1);
  assert.equal(next.tests.length, 1);
});

test("distinct IDs with the same name/device retain their independent flags and orders", () => {
  const a = fall("a", { name: "Same", kasseGeoeffnet: true });
  const b = fall("b", { name: "Same", order: { orderId: "b", total: 33 } });
  const result = entdopple([a, b, { ...a, updatedAt: "2000-01-01T00:00:00Z", kasseGeoeffnet: false }]);
  assert.equal(result.length, 2);
  assert.equal(result[0].kasseGeoeffnet, true);
  assert.equal(result[1].hatBestellt, true);
});

test("previous week and previous month include every boundary day, without overlap", () => {
  const list = Array.from({ length: 61 }, (_, i) => ({ id: i, tag: heuteSchluessel(i) }));
  assert.deepEqual(davorZeitraum(list, "woche").map((s) => s.id), [7, 8, 9, 10, 11, 12, 13]);
  assert.equal(davorZeitraum(list, "monat").length, 30);
  assert.equal(davorZeitraum(list, "monat")[0].id, 30);
  assert.equal(davorZeitraum(list, "monat").at(-1).id, 59);
  assert.equal(imZeitraum([{ tag: "2999-01-01" }], "heute").length, 0);
});

test("orders and revenue use purchase day in cards, list and daily series", () => {
  const s = fall("order", { order: { orderId: "new", total: 54, createdAt: zeit() } });
  const stats = baueKennzahlen([s], { zeitraum: "heute" });
  assert.equal(stats.analysen, 0);
  assert.equal(stats.bestellungenHeute, 1);
  assert.equal(stats.umsatzHeute, 54);
  assert.equal(bestellungenImZeitraum([s], "heute").length, 1);
  const day = baueTagesverlauf([s]).find((d) => d.tag === heute());
  assert.equal(day.umsatz, 54);
  assert.equal(day.bestellungen, 1);
});

test("HTTP failures are retried and never returned as a successful saved order", async () => {
  let calls = 0;
  const source = new AnalyseDaten({ kennung: "aabbccdd", fetchFn: async () => { calls++; return { ok: false, status: 403 }; } });
  assert.equal(await source.merken({ order: { orderId: "x" } }), undefined);
  assert.equal(calls, 2);
});

test("serialized report writes cannot overtake one another and rejected writes do not block later ones", async () => {
  const calls = [];
  let release;
  const source = new AnalyseDaten({ kennung: "aabbccdd", fetchFn: async (url, options) => {
    calls.push(dokument(JSON.parse(options.body)));
    if (calls.length === 1) await new Promise((resolve) => { release = resolve; });
    return { ok: true };
  } });
  const first = source.merken({ timings: { live: "porosia" } });
  const second = source.merken({ timings: { live: "address" } });
  await new Promise((resolve) => setImmediate(resolve));
  assert.equal(calls.length, 1);
  release();
  await Promise.all([first, second]);
  assert.deepEqual(calls.map((c) => c.timings.live), ["porosia", "address"]);
});

test("resumed scan writes only duration leaves, preserving report activity", async () => {
  const calls = [];
  const session = new Sitzung({ fetchFn: async (url) => { calls.push(String(url)); return { ok: true }; } });
  await session.schritt("camera");
  const mask = new URL(calls.at(-1)).searchParams.getAll("updateMask.fieldPaths");
  assert.ok(mask.includes("timings.live"));
  assert.ok(!mask.includes("timings"));
  assert.ok(!mask.some((m) => m.includes("ereignisse")));
});

test("adapter paginates beyond 3,000 sessions and retains order dates from reports", async () => {
  const root = new URL("../", import.meta.url);
  let code = readFileSync(new URL("apps/mnyra-heart/heart-lifeskin-adapter.js", root), "utf8");
  code = code.replace(/import \{ db \} from "\/shared\/firebase-config.js";/, "const db = {};");
  code = code.replace(/import \{([\s\S]*?)\} from "\/shared\/vendor\/firebase\/11.0.0\/firebase-firestore.js";/,
    (match, names) => {
      // Start at the vendor import, not the preceding calculation import.
      const index = match.lastIndexOf("import {");
      return match.slice(0, index) + `const { ${match.slice(index + 8).split("} from")[0]} } = globalThis.__heartFirestoreMock;`;
    });
  code = code.replace(/from "\.\/([^"]+)"/g, (_, path) => `from "${new URL(`apps/mnyra-heart/${path}`, root)}"`);
  const docs = Array.from({ length: 3001 }, (_, i) => ({ id: `s${String(i).padStart(4, "0")}`, data: () => ({ createdAt: zeit(), step: "opened" }) }));
  let pageReads = 0;
  const listeners = [];
  let unsubscriptions = 0;
  const mock = {
    collection: (_db, ...path) => ({ path: path.at(-1) }),
    where: (...args) => ({ where: args }),
    onSnapshot: (query, next, error) => {
      listeners.push({ query, next, error });
      return () => { unsubscriptions++; };
    },
    documentId: () => "id", orderBy: () => ({}), limit: (n) => ({ limit: n }), startAfter: (last) => ({ after: last.id }),
    query: (col, ...parts) => Object.assign({}, col, ...parts),
    getDocs: async (q) => {
      if (q.path === "sessions") { pageReads++; return { docs: q.after ? docs.slice(3000) : docs.slice(0, 3000) }; }
      if (q.path === "reports") return { docs: [{ id: "s0000", data: () => ({ bestelltAt: zeit() }) }] };
      return { docs: [] };
    }
  };
  globalThis.__heartFirestoreMock = mock;
  try {
    const adapter = await import(`data:text/javascript;base64,${Buffer.from(code).toString("base64")}`);
    const loaded = await adapter.ladeLifeskin();
    assert.equal(pageReads, 2);
    assert.equal(loaded.sitzungen.length, 3001);
    assert.equal(loaded.trichter[0].anzahl, 3001);
    assert.equal(loaded.sitzungen.find((s) => s.id === "s0000").bestelltAt, zeit());
    const originalSet = globalThis.setInterval;
    const originalClear = globalThis.clearInterval;
    let tick, cleared;
    const events = [];
    try {
      globalThis.setInterval = (fn) => { tick = fn; return 123; };
      globalThis.clearInterval = (id) => { cleared = id; };
      const stop = adapter.horcheLive((value) => events.push(value));
      assert.equal(listeners[0].query.limit, undefined, "No silent 300-person cap");
      listeners[0].next({ docs: docs.slice(0, 301) });
      assert.equal(events[0].length, 301);
      tick();
      assert.equal(unsubscriptions, 1);
      assert.equal(listeners.length, 2);
      listeners[0].next({ docs: [] });
      assert.equal(events.length, 1, "Retired listener cannot overwrite the new window");
      listeners[1].error(new Error("offline"));
      assert.equal(events.at(-1), null);
      stop();
      assert.equal(unsubscriptions, 2);
      assert.equal(cleared, 123);
      listeners[1].next({ docs: [] });
      assert.equal(events.length, 2, "Unmounted listener must remain silent");
    } finally {
      globalThis.setInterval = originalSet;
      globalThis.clearInterval = originalClear;
    }
  } finally { delete globalThis.__heartFirestoreMock; }
});
