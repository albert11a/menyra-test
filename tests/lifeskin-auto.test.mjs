// AUTO-MODUS (docs/lifeskin-auto.md) - vom neuen Fall bis zum freigegebenen
// Bericht, ohne Netz und ohne echte Datenbank.
//
// Geprueft wird:
//   - Der Server baut Zeichen fuer Zeichen denselben Prompt wie Heart.
//   - Aus einer Antwort wird der Bericht, den Heart beim Freigeben schreibt -
//     oder ein Grund, den Fall an Heart zurueckzugeben.
//   - Die Abschriften fuer die Function sind aktuell.
//   - Die Function selbst: Schalter aus, Schalter an, Pruefung faellt durch,
//     schon von Hand freigegeben, Tageslimit - mit einer Datenbank im
//     Speicher und einer vorgetaeuschten OpenAI-Antwort.
//   - Die Warteseite spricht im Auto-Modus von der Vorbereitung und faellt
//     nach 10 Minuten oder bei "manuell" auf die gewohnte Fassung zurueck.
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import Module from "node:module";
import path from "node:path";

import { FRAGEN } from "../apps/lifeskin/lifeskin-content.js";
import { STANDARD_PRODUKTE } from "../apps/lifeskin/lifeskin-catalog.js";
import { promptV8Fuellen as promptHeart } from "../apps/mnyra-heart/heart-lifeskin-prompt.js";
import { promptV8Fuellen, fragenFuerPrompt } from "../shared/lifeskin-prompt.js";
import { autoBefund, autoArt } from "../shared/lifeskin-auto-befund.js";

const require = createRequire(import.meta.url);
const lies = (p) => readFileSync(new URL(`../${p}`, import.meta.url), "utf8");
const ANTWORT = lies("tests/fixtures/lifeskin-auto-antwort.json");
const VORLAGE = lies("docs/lifeskin-prompt-v9.txt");
const SITZUNG = Object.freeze({
  name: "Arta", ageBand: "18-24", typ: "foto", createdAt: "2026-09-27T20:00:00.000Z",
  source: { weg: "lifeskin2", utmCampaign: "k" },
  anamnese: { anliegen: ["pucrrat"], kohezgjatja: "vit", perdorimi: ["mjek", "farmaci"], gatishmeria: "tani" }
});

test("der Server baut denselben Prompt wie Heart - auch mit der Abschrift der Fragen", () => {
  const heart = promptHeart(VORLAGE, SITZUNG, STANDARD_PRODUKTE, []);
  assert.equal(promptV8Fuellen(VORLAGE, SITZUNG, STANDARD_PRODUKTE, [], FRAGEN), heart);
  assert.equal(promptV8Fuellen(VORLAGE, SITZUNG, STANDARD_PRODUKTE, [], fragenFuerPrompt(FRAGEN)), heart);
  const abschrift = JSON.parse(lies("functions/lifeskin-auto/generated/fragen.json"));
  assert.equal(promptV8Fuellen(VORLAGE, SITZUNG, STANDARD_PRODUKTE, [], abschrift), heart);
  assert.doesNotMatch(heart, /\{\{(PATIENT_NAME|ANAMNESIS|VERIFIED_PRODUCTS)\}\}/);
});

test("aus der Antwort wird der Bericht, den Heart beim Freigeben schreibt", () => {
  const r = autoBefund({ antwort: ANTWORT, sitzung: SITZUNG, katalog: STANDARD_PRODUKTE, jetzt: new Date("2026-09-27T20:02:00Z") });
  assert.equal(r.ok, true, r.grund);
  const b = r.bericht;
  assert.equal(b.status, "fertig");
  assert.deepEqual(b.produkte.map((p) => p.id), ["lf-acne", "lf-moistur"]);
  assert.equal(b.produkte[0].satz, "LF ACNE qetëson puçrrat aktive në ballë.");
  assert.equal(b.preis, 39);
  assert.equal(b.weg, "lifeskin2");
  assert.equal(b.ohneBild, false);
  assert.match(b.befund, /Puçrra aktive/);
  assert.ok(b.raport?.parametrat?.length >= 3);
  // Die Gesundheitsangabe (Arzt/Roaccutane) geht nicht in den oeffentlichen Bericht.
  assert.deepEqual(b.antworten?.perdorimi, ["farmaci"]);
  assert.equal(b.freigabeAt, "2026-09-27T20:02:00.000Z");
  // Dieselben Felder wie gibBerichtFrei (heart-lifeskin-adapter.js).
  for (const feld of ["status", "bereit", "befund", "produkte", "preis", "schwere", "raport", "texte", "ohneBild",
    "antworten", "weg", "raste", "klientet", "analyse", "freigabeAt"]) assert.ok(feld in b, feld);
});

test("im Zweifel an Heart: Abklaerung, keine Messwerte, kein Produkt, kein JSON", () => {
  const d = JSON.parse(ANTWORT);
  const mit = (aendern) => { const k = structuredClone(d); aendern(k); return JSON.stringify(k); };
  const pruefe = (antwort, erwartet) => {
    const r = autoBefund({ antwort, sitzung: SITZUNG, katalog: STANDARD_PRODUKTE });
    assert.equal(r.ok, false);
    assert.match(r.grund, erwartet);
  };
  pruefe(mit((k) => { k.vleresimi.statusi = "kontroll_mjekesor"; }), /Abklaerung/);
  pruefe(mit((k) => { k.parametrat = []; }), /Messwerte/);
  pruefe(mit((k) => { k.nevojat = [{ produkt_id: "gibt-es-nicht" }]; }), /Produkt/);
  pruefe("Leider kann ich dazu nichts sagen.", /nicht lesbar|Befund/);
  // Ohne Foto (Trup/Pytje) sind Messwerte keine Pflicht.
  const ohne = autoBefund({ antwort: mit((k) => { k.parametrat = []; }), sitzung: { ...SITZUNG, typ: "trup", photos: [] }, katalog: STANDARD_PRODUKTE });
  assert.equal(ohne.ok, true, ohne.grund);
  assert.equal(ohne.bericht.ohneBild, true);
  assert.equal(autoArt({ typ: "pytje", photos: ["zona"] }), "foto");
});

test("die Abschriften fuer die Function sind aktuell", async () => {
  const sync = require("../functions/scripts/sync-lifeskin-auto.cjs");
  for (const datei of await sync.generate()) {
    let aufPlatte = "";
    try { aufPlatte = readFileSync(path.join(sync.outputDir, datei.fileName), "utf8"); } catch { aufPlatte = ""; }
    assert.equal(aufPlatte, datei.contents,
      `functions/lifeskin-auto/generated/${datei.fileName} ist veraltet. Ausfuehren: node functions/scripts/sync-lifeskin-auto.cjs`);
  }
});

test("die Anfrage an OpenAI: Prompt, Fotos in Reihenfolge, JSON", () => {
  const a = require("../functions/lifeskin-auto-anfrage.js");
  const jpeg = (n) => `data:image/jpeg;base64,${n}`;
  const fotos = a.fotosWaehlen([
    { blick: "rechts-2", jpeg: jpeg("r2") }, { blick: "links", jpeg: jpeg("l") }, { blick: "gerade", jpeg: jpeg("g") },
    { blick: "rechts", jpeg: jpeg("r") }, { blick: "oben", jpeg: "kaputt" }
  ], 3);
  assert.deepEqual(fotos.map((f) => f.blick), ["gerade", "rechts", "links"]);
  const anfrage = a.baueAnfrage({ modell: "gpt-5.4", prompt: "P", fotos });
  assert.equal(anfrage.model, "gpt-5.4");
  assert.deepEqual(anfrage.text, { format: { type: "json_object" } });
  assert.deepEqual(anfrage.input[0].content.map((c) => c.type), ["input_text", "input_image", "input_image", "input_image"]);
  assert.equal(a.antwortText({ output: [{ type: "reasoning" }, { type: "message", content: [{ type: "output_text", text: "{\"a\":1}" }] }] }), "{\"a\":1}");
  assert.deepEqual(a.einstellungen({}), { autoAn: false, autoModell: "gpt-5.4", autoTagesLimit: 40, autoMaxFotos: 6 });
  assert.equal(a.einstellungen({ autoAn: "ja" }).autoAn, false, "nur ein echtes true schaltet ein");
  assert.equal(a.kostenUsd("gpt-5.4", { input_tokens: 15000, output_tokens: 5000, input_tokens_details: { cached_tokens: 11000 } }), 0.088);
});

// ── Die Function mit einer Datenbank im Speicher ──────────────────────
function speicherDb() {
  const docs = new Map();
  const kopie = (x) => (x === undefined ? undefined : structuredClone(x));
  const ref = (pfad) => ({
    id: pfad.split("/").at(-1), pfad,
    async get() { return { exists: docs.has(pfad), id: pfad.split("/").at(-1), data: () => kopie(docs.get(pfad)), ref: ref(pfad) }; },
    async set(daten, { merge } = {}) { docs.set(pfad, merge ? { ...(docs.get(pfad) || {}), ...kopie(daten) } : kopie(daten)); },
    async create(daten) { if (docs.has(pfad)) throw new Error("ALREADY_EXISTS"); docs.set(pfad, kopie(daten)); },
    collection: (name) => sammlung(`${pfad}/${name}`)
  });
  const sammlung = (pfad) => {
    const kinder = () => [...docs.keys()].filter((k) => k.startsWith(`${pfad}/`) && !k.slice(pfad.length + 1).includes("/"));
    return {
      doc: (id) => ref(`${pfad}/${id}`),
      async get() { const l = kinder(); return { docs: await Promise.all(l.map((k) => ref(k).get())) }; },
      where: (feld, _op, wert) => ({ count: () => ({ async get() { return { data: () => ({ count: kinder().filter((k) => docs.get(k)?.[feld] === wert).length }) }; } }) })
    };
  };
  return {
    docs,
    collection: (name) => sammlung(name),
    async runTransaction(fn) {
      const schreiben = [];
      const erg = await fn({ get: (r) => r.get(), set: (r, d, o) => schreiben.push([r, d, o]) });
      for (const [r, d, o] of schreiben) await r.set(d, o);
      return erg;
    }
  };
}

function functionLaden(db) {
  const fake = {
    "firebase-functions": {
      region() { return this; }, runWith() { return this; },
      firestore: { document: () => ({ onCreate: (h) => h, onWrite: (h) => h }) },
      logger: { info() {}, warn() {}, error() {} }
    },
    "firebase-admin": Object.assign({ apps: [1], initializeApp() {}, firestore: Object.assign(() => db, { FieldValue: { serverTimestamp: () => "ts" } }) })
  };
  const alt = Module._load;
  Module._load = function (anfrage, ...rest) { return anfrage in fake ? fake[anfrage] : alt.call(this, anfrage, ...rest); };
  try {
    for (const k of Object.keys(require.cache)) if (/functions[\\/](lifeskin-auto|logging)/.test(k)) delete require.cache[k];
    return require("../functions/lifeskin-auto.js").lifeskinAutoAnalyse;
  } finally {
    Module._load = alt;
  }
}

async function lauf({ autoAn = true, antwort = ANTWORT, bericht = {}, limit, vorher } = {}) {
  const db = speicherDb();
  const T = "lifeskin/lifeskin";
  db.docs.set(`${T}/config/ablauf`, { autoAn, ...(limit ? { autoTagesLimit: limit } : {}) });
  for (const p of STANDARD_PRODUKTE) db.docs.set(`${T}/products/${p.id}`, p);
  db.docs.set(`${T}/sessions/f1`, { ...SITZUNG });
  db.docs.set(`${T}/sessions/f1/photos/gerade`, { jpeg: "data:image/jpeg;base64,AAAA" });
  const start = { status: "wartet", photos: 1, createdAt: "2026-09-27T20:00:00Z", code: "LS-1", ...bericht };
  db.docs.set(`${T}/reports/f1`, start);
  vorher?.(db);
  const anfragen = [];
  const fetchAlt = globalThis.fetch;
  globalThis.fetch = async (url, init) => {
    anfragen.push({ url, body: JSON.parse(init.body) });
    if (vorher?.nachAnfrage) vorher.nachAnfrage(db);
    return { ok: true, json: async () => ({ output: [{ type: "message", content: [{ type: "output_text", text: antwort }] }], usage: { input_tokens: 14000, output_tokens: 4000 } }) };
  };
  const schluesselAlt = process.env.OPENAI_API_KEY;
  process.env.OPENAI_API_KEY = "test-schluessel";
  try {
    const handler = functionLaden(db);
    const ref = db.collection(`${T}/reports`).doc("f1");
    await handler({ data: () => structuredClone(start), ref }, { params: { tenantId: "lifeskin", reportId: "f1" }, eventId: "e1" });
  } finally {
    globalThis.fetch = fetchAlt;
    if (schluesselAlt === undefined) delete process.env.OPENAI_API_KEY; else process.env.OPENAI_API_KEY = schluesselAlt;
  }
  return { bericht: db.docs.get(`${T}/reports/f1`), lauf: db.docs.get(`${T}/ablaeufe/f1`), anfragen };
}

test("Function: Schalter aus - nichts passiert, keine Anfrage", async () => {
  const r = await lauf({ autoAn: false });
  assert.equal(r.anfragen.length, 0);
  assert.equal(r.bericht.status, "wartet");
  assert.equal(r.bericht.vorbereitung, undefined);
});

test("Function: Schalter an - Prompt und Foto gehen hinaus, der Bericht ist freigegeben", async () => {
  const r = await lauf();
  assert.equal(r.anfragen.length, 1);
  assert.equal(r.anfragen[0].url, "https://api.openai.com/v1/responses");
  const inhalt = r.anfragen[0].body.input[0].content;
  assert.match(inhalt[0].text, /Arta/);
  assert.equal(inhalt[1].image_url, "data:image/jpeg;base64,AAAA");
  assert.equal(r.bericht.status, "fertig");
  assert.equal(r.bericht.vorbereitung.stand, "fertig");
  assert.equal(r.bericht.weg, "lifeskin2");
  assert.equal(r.bericht.code, "LS-1", "was der Trichter angelegt hat, bleibt");
  assert.equal(r.lauf.stand, "fertig");
  assert.equal(r.lauf.kostenUsd, 0.095);
  // Nichts ueber die Automatik im oeffentlichen Bericht ausser dem Stand.
  assert.deepEqual(Object.keys(r.bericht.vorbereitung).sort(), ["at", "stand"]);
});

test("Function: Pruefung faellt durch - der Fall bleibt wartend und geht an Heart", async () => {
  const r = await lauf({ antwort: ANTWORT.replace('"i_vleresueshem"', '"kontroll_mjekesor"') });
  assert.equal(r.bericht.status, "wartet");
  assert.deepEqual({ stand: r.bericht.vorbereitung.stand, code: r.bericht.vorbereitung.code }, { stand: "manuell", code: "pruefung" });
  assert.equal(r.lauf.stand, "manuell");
});

test("Function: wer in Heart schneller freigegeben hat, wird nicht ueberschrieben", async () => {
  const vorher = () => {};
  vorher.nachAnfrage = (db) => db.docs.set("lifeskin/lifeskin/reports/f1", { status: "fertig", befund: "von Hand" });
  const r = await lauf({ vorher });
  assert.equal(r.bericht.befund, "von Hand");
  assert.equal(r.lauf.stand, "uebersprungen");
});

test("Function: Tageslimit - danach wieder von Hand", async () => {
  const tag = require("../functions/lifeskin-auto-anfrage.js").tagVon();
  const r = await lauf({ limit: 1, vorher: (db) => db.docs.set("lifeskin/lifeskin/ablaeufe/alt", { tag }) });
  assert.equal(r.anfragen.length, 0);
  assert.equal(r.bericht.status, "wartet");
  assert.equal(r.bericht.vorbereitung.code, "limit");
});

test("Warteseite: im Auto-Modus 'po përgatitet', sonst die gewohnte Fassung", async () => {
  globalThis.__LIFESKIN_TEST__ = true;
  const { Analiza } = await import("../apps/lifeskin-astra/astra.js");
  const seite = (search = "") => new Analiza({ ort: { pathname: "/analiza/x", search }, pixel: {} });
  const jetzt = new Date().toISOString();

  const a = seite();
  a.daten = { status: "wartet", createdAt: jetzt };
  a.autoAn = true;
  assert.equal(a.text("pritTitel", { name: "Arta" }), "Analiza juaj po përgatitet sipas metodës së Dr. Gashit, Arta.");
  assert.equal(a.text("pritDauerAuto"), "Gati për 2–5 minuta");
  assert.equal(a.text("pritWarum"), "", "'Nuk është një makinë' erscheint im Auto-Modus nie");

  const b = seite("?weg=lifeskin2");
  b.daten = { status: "wartet", createdAt: jetzt };
  b.autoAn = true;
  assert.match(b.text("pritTitel", { name: "Arta" }), /nëse terapia ju përshtatet/);

  a.daten = { status: "wartet", createdAt: jetzt, vorbereitung: { stand: "manuell" } };
  assert.equal(a.text("pritTitel", { name: "Arta" }), "Dr. Gashi po e shikon analizën tuaj, Arta.");
  a.daten = { status: "wartet", createdAt: new Date(Date.now() - 11 * 60000).toISOString() };
  assert.equal(a.imAuto, false, "nach 10 Minuten wieder die gewohnte Fassung");
  a.autoAn = false;
  a.daten = { status: "wartet", createdAt: jetzt };
  assert.equal(a.text("pritTitel", { name: "Arta" }), "Dr. Gashi po e shikon analizën tuaj, Arta.");
});

test("der Pixel wird im Auto-Modus nicht beruehrt", () => {
  for (const datei of ["functions/lifeskin-auto.js", "functions/lifeskin-auto-anfrage.js", "shared/lifeskin-auto-befund.js", "shared/lifeskin-prompt.js"]) {
    assert.doesNotMatch(lies(datei), /fbq\(|graph\.facebook|lifeskinCapi|\bpixel\.\w+\(/, datei);
  }
});
