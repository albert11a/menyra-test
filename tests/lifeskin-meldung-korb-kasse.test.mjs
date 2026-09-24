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
