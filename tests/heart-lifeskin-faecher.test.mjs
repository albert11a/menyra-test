// Was Heart im Lifeskin-Reiter zeigt - und was es NICHT mitzaehlt.
//
// Vier Dinge, die zusammengehoeren:
//
//   1. Eigene Testlaeufe stehen in keiner Zahl. Wer seinen Trichter
//      zwanzigmal am Tag durchlaeuft, steht sonst in jeder: "Seite
//      geoeffnet" waechst, die Abschlussquote faellt, und die Kaufquote
//      sieht schlechter aus als sie ist.
//   2. Der Zeitraum gilt fuer ALLES darunter - Kacheln, Trichter,
//      Lesetiefe. Zwei Bloecke mit verschiedenen Zeitraeumen nebeneinander
//      liest niemand richtig.
//   3. Die drei Faecher: neu (Arbeit), fertig (freigegeben), archiviert.
//   4. Eine einzelne Analyse laesst sich loeschen - in zwei Stufen, weil
//      Firestore keinen Papierkorb kennt.

import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

import {
  ZEITRAEUME, imZeitraum, davorZeitraum, istTest, teileTests, zustandVon,
  baueKennzahlen, baueTrichter, baueLesetiefe, baueHerkunft, baueVerteilung,
  GESCHAEFTSZONE
} from "../apps/mnyra-heart/heart-lifeskin-berechnung.js";
import { renderLifeskin } from "../apps/mnyra-heart/heart-lifeskin-render.js";
import { herkunftAuslesen } from "../apps/lifeskin/lifeskin-session.js";

const lies = (p) => fs.readFileSync(path.join(process.cwd(), p), "utf8");

const TAG = new Intl.DateTimeFormat("sv-SE", { timeZone: GESCHAEFTSZONE });
const tagVor = (tage) => {
  const jetzt = new Date();
  const heute = new Date(`${TAG.format(jetzt)}T12:00:00Z`);
  heute.setUTCDate(heute.getUTCDate() - tage);
  return TAG.format(heute);
};

const sitzung = (id, extra = {}) => ({
  id, createdAt: new Date().toISOString(), tag: tagVor(0), step: "result",
  name: id, code: `LS-${id}`, photos: ["gerade"], source: {}, device: {},
  hatBestellt: false, hatAnschrift: false, hatTelefon: false, ...extra
});

// ---------------------------------------------------------------------------
// Eigene Tests
// ---------------------------------------------------------------------------

test("mit ?test=1 traegt der Lauf die Kampagne 'test'", () => {
  const herkunft = herkunftAuslesen({ search: "?test=1" }, "");
  assert.equal(herkunft.utmCampaign, "test");
  // Eine echte Kampagne gewinnt - sonst wuerde ein Anzeigenlauf mit
  // angehaengtem test=1 still aus den Zahlen fallen.
  assert.equal(herkunftAuslesen({ search: "?test=1&utm_campaign=insta" }, "").utmCampaign, "insta");
  assert.equal(herkunftAuslesen({ search: "" }, "").utmCampaign, "");
});

test("ein Testlauf zaehlt nicht mit - vorher markiert oder nachher", () => {
  assert.equal(istTest(sitzung("a", { source: { utmCampaign: "test" } })), true);
  assert.equal(istTest(sitzung("b", { source: { utmCampaign: "TEST " } })), true);
  assert.equal(istTest(sitzung("c"), { test: true }), true);
  assert.equal(istTest(sitzung("d"), { test: false }), false);
  assert.equal(istTest(sitzung("e", { source: { utmCampaign: "insta" } })), false);
});

test("die Zahlen rechnen ohne die Tests, verlieren sie aber nicht", () => {
  const alle = [sitzung("echt"), sitzung("test1", { source: { utmCampaign: "test" } }), sitzung("test2")];
  const { echte, tests } = teileTests(alle, { test2: { test: true } });
  assert.deepEqual(echte.map((s) => s.id), ["echt"]);
  assert.deepEqual(tests.map((s) => s.id), ["test1", "test2"]);
});

// ---------------------------------------------------------------------------
// Zeitraeume
// ---------------------------------------------------------------------------

test("jeder Zeitraum nimmt genau seinen Ausschnitt", () => {
  const liste = [0, 1, 3, 10, 40].map((t) => sitzung(`t${t}`, { tag: tagVor(t) }));
  const ids = (z) => imZeitraum(liste, z).map((s) => s.id).sort();
  assert.deepEqual(ids("heute"), ["t0"]);
  assert.deepEqual(ids("gestern"), ["t1"]);
  assert.deepEqual(ids("woche"), ["t0", "t1", "t3"]);
  assert.deepEqual(ids("monat"), ["t0", "t1", "t10", "t3"]);
  assert.deepEqual(ids("max"), ["t0", "t1", "t10", "t3", "t40"]);
});

test("der Vergleich darunter nimmt den gleich langen Zeitraum davor", () => {
  const liste = [0, 1, 2, 8].map((t) => sitzung(`t${t}`, { tag: tagVor(t) }));
  assert.deepEqual(davorZeitraum(liste, "heute").map((s) => s.id), ["t1"]);
  assert.deepEqual(davorZeitraum(liste, "gestern").map((s) => s.id), ["t2"]);
  // Sieben Tage: die sieben davor, also Tag 7 bis 13.
  assert.deepEqual(davorZeitraum(liste, "woche").map((s) => s.id), ["t8"]);
  // "Max" hat kein Davor - ein Vergleich waere dort erfunden.
  assert.deepEqual(davorZeitraum(liste, "max"), []);
});

test("die Kacheln folgen dem gewaehlten Zeitraum", () => {
  const liste = [sitzung("heute1"), sitzung("heute2"), sitzung("alt", { tag: tagVor(5) })];
  assert.equal(baueKennzahlen(liste, { zeitraum: "heute" }).analysen, 2);
  assert.equal(baueKennzahlen(liste, { zeitraum: "woche" }).analysen, 3);
  // Ohne gewaehlten Zeitraum bleibt es beim alten Verhalten.
  assert.equal(baueKennzahlen(liste).analysenHeute, 2);
});

// ---------------------------------------------------------------------------
// Die drei Faecher
// ---------------------------------------------------------------------------

test("neu, fertig, archiviert - und archiviert schlaegt alles", () => {
  assert.equal(zustandVon(sitzung("a"), null), "neu");
  assert.equal(zustandVon(sitzung("a"), { status: "wartet" }), "neu");
  assert.equal(zustandVon(sitzung("a"), { status: "vorschau" }), "neu", "eine Vorschau ist noch nicht freigegeben");
  assert.equal(zustandVon(sitzung("a"), { status: "fertig" }), "fertig");
  assert.equal(zustandVon(sitzung("a"), { status: "bestellt" }), "fertig");
  assert.equal(zustandVon(sitzung("a"), { status: "fertig", archiviert: true }), "archiviert");
});

// ---------------------------------------------------------------------------
// Was daraus gezeichnet wird
// ---------------------------------------------------------------------------

function zeichne(zusatz = {}) {
  const grund = {
    status: "ready", loadedFrom: "network", sitzungen: [], tests: [], berichte: {},
    produkte: [], abdeckung: [], kennzahlen: baueKennzahlen([]), trichter: baueTrichter([]),
    lesetiefe: baueLesetiefe([]), herkunft: baueHerkunft([]), verteilung: baueVerteilung([]), verlauf: [],
    offen: "", fotos: {}, fotosStatus: "", resetGefragt: false, resetStatus: "",
    produktOffen: "", produktStatus: "", zeitraum: "heute", fach: "neu"
  };
  return renderLifeskin({ ...grund, ...zusatz });
}

test("die Reihe der Zeitraeume steht ueber den Zahlen", () => {
  const html = zeichne();
  for (const z of ZEITRAEUME) {
    assert.ok(html.includes(`data-action="lifeskin-zeitraum" data-wert="${z.id}"`), `${z.id} fehlt`);
  }
  assert.match(html, /aria-pressed="true"[^>]*>\s*Heute/, "Der gewaehlte Zeitraum ist nicht zu erkennen");
});

test("die Liste zeigt genau das gewaehlte Fach", () => {
  const sitzungen = [sitzung("neu1"), sitzung("fertig1"), sitzung("archiv1")];
  const berichte = { fertig1: { status: "fertig" }, archiv1: { status: "fertig", archiviert: true } };
  const imFach = (fach) => {
    const html = zeichne({ sitzungen, berichte, fach });
    return [...html.matchAll(/data-action="lifeskin-sitzung" data-id="([^"]+)"/g)].map((m) => m[1]);
  };
  assert.deepEqual(imFach("neu"), ["neu1"]);
  assert.deepEqual(imFach("fertig"), ["fertig1"]);
  assert.deepEqual(imFach("archiv"), [], "ein unbekanntes Fach zeigt nichts, statt alles");
  assert.deepEqual(imFach("archiviert"), ["archiv1"]);
});

test("die eigenen Tests stehen unten, mit dem Weg dorthin", () => {
  const html = zeichne({ tests: [sitzung("t1", { source: { utmCampaign: "test" } })] });
  assert.match(html, /Eigene Tests/);
  assert.match(html, /lifeskin\?test=1/, "Es steht nicht da, wie man einen Test startet");
  // Ohne Tests steht der Block gar nicht da - ein leerer Kasten ist Laerm.
  assert.ok(!zeichne().includes("Eigene Tests"));
});

// ---------------------------------------------------------------------------
// Loeschen und markieren
// ---------------------------------------------------------------------------

test("eine einzelne Analyse laesst sich loeschen - in zwei Stufen", () => {
  const heart = lies("apps/mnyra-heart/heart.js");
  assert.match(heart, /stand\.loeschGefragt !== kennung/, "Es gibt keine zweite Stufe");
  assert.match(heart, /await loescheSitzung\(kennung\)/, "Es wird nichts geloescht");
  // Und die Fotos und der Bericht muessen mit.
  const adapter = lies("apps/mnyra-heart/heart-lifeskin-adapter.js");
  const block = adapter.slice(adapter.indexOf("export async function loescheSitzung"));
  assert.match(block.slice(0, 900), /"photos"/, "Die Fotos bleiben liegen");
  assert.match(block.slice(0, 900), /"reports"/, "Der Befund des Patienten bleibt stehen");
});

test("die Vorschau zeigt dem Patienten weiter seine Warteseite", () => {
  const astra = lies("apps/lifeskin-astra/astra.js");
  assert.match(astra, /this\.nurVorschau && !this\.vorschauErlaubt.*#pritZeigen/s,
    "Eine Vorschau waere fuer den Patienten schon der fertige Befund");
  assert.match(astra, /get vorschauErlaubt[\s\S]{0,200}vorschau"\) === "1"/,
    "Es gibt keinen Weg, die Vorschau anzusehen");
  // Und in der Vorschau wird nichts gezaehlt.
  assert.match(astra, /if \(!this\.nurVorschau\) \{[\s\S]{0,160}berichtGeoeffnet: true/,
    "Ein eigener Blick zaehlt als Patient, der die Seite geoeffnet hat");
});
