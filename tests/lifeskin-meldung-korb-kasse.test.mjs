// MELDUNGEN FUER WARENKORB UND KASSE (24.09.)
//
// imKorb (Laden) und kasseGeoeffnet (Therapie-/Analyseseite, Laden) wecken
// das Telefon - einmal je Sitzung, nur frisch und nur, solange nicht
// bestellt wurde.
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { faelligeMeldungen, baueMeldung, MELDUNGEN, meldungsKennung } from "../scripts/meldungs-waechter/meldungs-regeln.mjs";
import { meldungenFuer } from "../api/lifeskin-meldung.js";

const jetzt = Date.now();
const frisch = new Date(jetzt - 60 * 1000).toISOString();
const typen = (liste) => liste.map((v) => v.type);

test("Warenkorb im Laden: gemeldet, auch ohne Analyse-Schritt", () => {
  const s = { step: "opened", imKorb: true, korbWert: 39, updatedAt: frisch };
  assert.deepEqual(typen(faelligeMeldungen(s, { jetzt })), ["lifeskin_korb"]);
  assert.deepEqual(typen(meldungenFuer(s, jetzt)), ["lifeskin_korb"]);
});

test("Kasse: gemeldet neben der Analyse", () => {
  const s = { step: "result", kasseGeoeffnet: true, updatedAt: frisch };
  assert.deepEqual(typen(faelligeMeldungen(s, { jetzt })), ["lifeskin_analyse", "lifeskin_kasse"]);
});

test("schon bestellt: keine Korb- oder Kassenmeldung mehr", () => {
  const s = { step: "ordered", imKorb: true, kasseGeoeffnet: true, hatBestellt: true, updatedAt: frisch };
  assert.deepEqual(typen(faelligeMeldungen(s, { jetzt })).filter((t) => /korb|kasse/.test(t)), []);
});

test("alt oder ohne Marke: nichts", () => {
  const alt = { step: "result", kasseGeoeffnet: true, updatedAt: new Date(jetzt - 3 * 3600 * 1000).toISOString() };
  assert.deepEqual(faelligeMeldungen(alt, { jetzt }), []);
  assert.deepEqual(typen(faelligeMeldungen({ step: "result", updatedAt: frisch }, { jetzt })), ["lifeskin_analyse"]);
});

test("die Saetze auf dem Telefon", () => {
  const korb = MELDUNGEN.find((v) => v.type === "lifeskin_korb");
  const kasse = MELDUNGEN.find((v) => v.type === "lifeskin_kasse");
  assert.equal(baueMeldung({ vorlage: korb, sessionId: "s", sitzung: { name: "Arta", korbWert: 39 } }).text, "Warenkorb (39 €), Arta");
  assert.equal(korb.text("", {}), "Jemand hat etwas in den Warenkorb gelegt");
  assert.equal(kasse.text("Arta"), "An der Kasse, Arta");
  assert.equal(kasse.text(""), "Jemand ist an der Kasse");
  // Je Sitzung und Art genau ein Meldungsdokument.
  assert.equal(meldungsKennung("lifeskin_kasse", "abc"), "lifeskin_kasse_abc");
});

test("die Seiten stossen die Meldung an, sobald die Marke steht", () => {
  const sitzung = fs.readFileSync("apps/lifeskin/lifeskin-session.js", "utf8");
  assert.match(sitzung, /const MELDE_MARKEN = "imKorb kasseGeoeffnet"\.split/);
  assert.match(sitzung.slice(sitzung.indexOf("  ergaenze(daten) {")), /meldungAnstossen\(id, this\.fetchFn\)/);
  const daten = fs.readFileSync("apps/lifeskin-astra/astra-daten.js", "utf8");
  assert.match(daten, /daten\?\.step === "ordered" \|\| daten\?\.kasseGeoeffnet === true/);
  const laden = fs.readFileSync("apps/lifeskin-landing/shop.js", "utf8");
  assert.match(laden, /#merke\(\{ kasseGeoeffnet: true, kasseGeoeffnetAt: [^}]+\}, "kasseGeoeffnet"\)/);
});

test("zur Laufzeit: Korb und Kasse stossen genau einmal an", async () => {
  const { AnalyseDaten } = await import("../apps/lifeskin-astra/astra-daten.js");
  const { Sitzung } = await import("../apps/lifeskin/lifeskin-session.js");
  globalThis.location = { protocol: "https:", origin: "https://mnyra.com", pathname: "/terapia/x", search: "" };
  const warte = () => new Promise((r) => setTimeout(r, 20));
  const meldungen = (liste) => liste.filter((a) => a.endsWith("/api/lifeskin-meldung")).length;
  try {
    const laden = [];
    const s = new Sitzung({ speicher: null, fetchFn: async (url) => { laden.push(String(url)); return { ok: true, status: 200 }; } });
    await s.ergaenze({ imKorb: true });
    await s.ergaenze({ korbWert: 39, korbStueck: 1 });
    await s.ergaenze({ imKorb: true });
    await warte();
    assert.equal(meldungen(laden), 1, "Warenkorb: nicht genau eine Meldung");
    await s.ergaenze({ kasseGeoeffnet: true });
    await warte();
    assert.equal(meldungen(laden), 2, "Kasse im Laden: keine Meldung");

    const seite = [];
    const d = new AnalyseDaten({ kennung: "abc123def456", fetchFn: async (url) => { seite.push(String(url)); return { ok: true, status: 200 }; } });
    await d.merken({ kasseGeoeffnet: true });
    await warte();
    assert.equal(meldungen(seite), 1, "Kasse auf der Therapieseite: keine Meldung");
  } finally {
    delete globalThis.location;
  }
});

// 01.10.: Der Warenkorb der Therapieseite setzt bewusst nicht
// imKorb, sondern timings.kauf.knopf - und weckte deshalb kein Telefon.
test("Warenkorb der Therapieseite: gemeldet, solange der Kaufknopf frisch ist", () => {
  const s = { step: "result", timings: { kauf: { knopf: frisch } }, updatedAt: frisch };
  assert.deepEqual(typen(faelligeMeldungen(s, { jetzt })), ["lifeskin_analyse", "lifeskin_korb"]);
  assert.deepEqual(typen(meldungenFuer(s, jetzt)), ["lifeskin_analyse", "lifeskin_korb"]);
  const korb = MELDUNGEN.find((v) => v.type === "lifeskin_korb");
  assert.equal(baueMeldung({ vorlage: korb, sessionId: "s", sitzung: { name: "Arta", ...s } }).text, "Warenkorb, Arta");

  // Ein Korb von vor drei Tagen ist keine Meldung, auch wenn die Sitzung
  // gerade geschrieben wurde (etwa beim naechsten Besuch).
  const alt = { step: "result", timings: { kauf: { knopf: new Date(jetzt - 3 * 86400000).toISOString() } }, updatedAt: frisch };
  assert.deepEqual(typen(faelligeMeldungen(alt, { jetzt })), ["lifeskin_analyse"]);
  // Schon bestellt: die Bestellmeldung, nicht der Korb.
  const bestellt = { ...s, step: "ordered", hatBestellt: true };
  assert.deepEqual(typen(faelligeMeldungen(bestellt, { jetzt })).filter((t) => /korb/.test(t)), []);
  // Ohne Zeit oder mit Unfug: nichts.
  assert.deepEqual(typen(faelligeMeldungen({ step: "result", timings: { kauf: { knopf: "x" } }, updatedAt: frisch }, { jetzt })), ["lifeskin_analyse"]);
});

test("zur Laufzeit: der Kaufknopf der Therapieseite stoesst die Meldung an, die anderen Kaufmarken nicht", async () => {
  const { AnalyseDaten } = await import("../apps/lifeskin-astra/astra-daten.js");
  globalThis.location = { protocol: "https:", origin: "https://mnyra.com", pathname: "/terapia/x", search: "" };
  const warte = () => new Promise((r) => setTimeout(r, 20));
  const meldungen = (liste) => liste.filter((a) => a.endsWith("/api/lifeskin-meldung")).length;
  try {
    const seite = [];
    const d = new AnalyseDaten({ kennung: "abc123def456", fetchFn: async (url) => { seite.push(String(url)); return { ok: true, status: 200 }; } });
    await d.kaufMarke("geoeffnet", { version: "v1" });
    await d.kaufMarke("knopf", { version: "v1" });
    await warte();
    assert.equal(meldungen(seite), 1, "Warenkorb auf der Therapieseite: keine Meldung");
    assert.ok(seite.some((a) => a.includes("timings.kauf.knopf")), "Kaufknopf nicht geschrieben");

    // Nicht gespeichert: keine Meldung - sie laese dort nichts.
    const fehl = [];
    const f = new AnalyseDaten({ kennung: "abc123def456", fetchFn: async (url) => { fehl.push(String(url)); return { ok: false, status: 403 }; } });
    await f.kaufMarke("knopf", { version: "v1" });
    await warte();
    assert.equal(meldungen(fehl), 0);
  } finally {
    delete globalThis.location;
  }
});

test("die Therapieseite schreibt den Warenkorb als eigenes Ereignis in den Klickpfad", () => {
  const terapia = fs.readFileSync("apps/lifeskin-verkauf/terapia.js", "utf8");
  const korb = terapia.slice(terapia.indexOf("  #korb(auf) {"), terapia.indexOf("  #korbZeichnen() {"));
  assert.match(korb, /this\.klickpfad\?\.melde\("korb", /);
  // Nicht in der Vorschau: das Ereignis steht hinter der Vorschau-Sperre.
  assert.ok(korb.indexOf('melde("korb"') > korb.indexOf("if (this.nurVorschau) return;"));
});
