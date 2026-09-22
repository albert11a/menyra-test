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
//   3. Die fuenf Faecher: neu (Arbeit), ready (freigegeben), seen (der
//      Kunde hat es geoeffnet), spaeter (von Hand zurueckgelegt),
//      archiviert (von Hand abgehakt).
//   4. Eine einzelne Analyse laesst sich loeschen - in zwei Stufen, weil
//      Firestore keinen Papierkorb kennt.

import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

import {
  ZEITRAEUME, findeSitzung, imZeitraum, davorZeitraum, istTest, teileTests, zustandVon,
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
// Die fuenf Faecher
// ---------------------------------------------------------------------------

test("neu, ready, seen - und was von Hand gesetzt wurde, schlaegt alles", () => {
  assert.equal(zustandVon(sitzung("a"), null), "neu");
  assert.equal(zustandVon(sitzung("a"), { status: "wartet" }), "neu");
  assert.equal(zustandVon(sitzung("a"), { status: "vorschau" }), "neu", "eine Vorschau ist noch nicht freigegeben");
  assert.equal(zustandVon(sitzung("a"), { status: "fertig" }), "ready");
  assert.equal(zustandVon(sitzung("a"), { status: "bestellt" }), "ready");

  // DER UNTERSCHIED, WEGEN DEM ES DAS FACH "seen" GIBT.
  //
  // "Freigegeben" heisst nur, dass der Kunde es sehen KANN. Von 32
  // fertigen Analysen haben 13 ihre je geoeffnet - und ohne dieses Fach
  // stehen beide Gruppen in derselben Liste.
  //
  // Gezaehlt wird berichtGeoeffnet, und die Marke faellt allein auf dem
  // Bildschirm "fertig" der Patientenseite: nicht auf der Warteseite,
  // nicht beim Verschicken einer Nachricht, nicht beim Erstellen eines
  // Links.
  assert.equal(zustandVon(sitzung("a", { berichtGeoeffnet: true }), { status: "fertig" }), "seen");
  assert.equal(zustandVon(sitzung("a", { warteseiteGeoeffnet: true }), { status: "fertig" }), "ready",
    "Die Warteseite ist nicht die Antwort");
  assert.equal(zustandVon(sitzung("a", { waSent: true }), { status: "fertig" }), "ready",
    "Eine verschickte Nachricht ist keine geoeffnete Antwort");
  // Wer bestellt hat, hat sie zwangslaeufig gesehen - auch wenn die
  // Marke aus einer Zeit stammt, in der es sie noch nicht gab.
  assert.equal(zustandVon(sitzung("a", { hatBestellt: true }), { status: "bestellt" }), "seen");

  // Von Hand gesetzt schlaegt alles: Wer einen Fall zurueckgelegt hat,
  // will ihn nicht am naechsten Tag wieder in "neu" finden.
  assert.equal(zustandVon(sitzung("a"), { spaeter: true }), "spaeter");
  assert.equal(zustandVon(sitzung("a", { berichtGeoeffnet: true }), { status: "fertig", spaeter: true }), "spaeter");
  assert.equal(zustandVon(sitzung("a"), { status: "fertig", archiviert: true }), "archiviert");
  assert.equal(zustandVon(sitzung("a"), { spaeter: true, archiviert: true }), "archiviert",
    "Abgehakt schlaegt zurueckgelegt");
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
    produktOffen: "", produktStatus: "", zeitraum: "heute", fach: "alle"
  };
  return renderLifeskin({ ...grund, ...zusatz });
}

// Ein eigener Testlauf, angetippt.
//
// ER WAR WEG. Gesucht wurde nur in den echten Sitzungen, und der Lauf, den
// man gerade selbst gemacht hatte, meldete "Diese Analyse gibt es nicht
// mehr" - waehrend er zwei Bildschirmlaengen weiter oben in der Liste
// stand.
test("ein eigener Testlauf laesst sich aufschlagen wie jede andere Analyse", () => {
  const lauf = sitzung("eigen", { name: "Probe" });
  const html = zeichne({ sitzungen: [], tests: [lauf], offen: "eigen" });
  assert.ok(!html.includes("gibt es nicht mehr"), "Der eigene Testlauf gilt als verschwunden");
  assert.ok(html.includes("Probe"));
});

test("findeSitzung schaut in beiden Listen und erfindet nichts", () => {
  const a = sitzung("a");
  const b = sitzung("b");
  const zustand = { sitzungen: [a], tests: [b] };
  assert.equal(findeSitzung(zustand, "a")?.id, "a");
  assert.equal(findeSitzung(zustand, "b")?.id, "b");
  assert.equal(findeSitzung(zustand, "weg"), null);
  assert.equal(findeSitzung(zustand, ""), null);
  assert.equal(findeSitzung({}, "a"), null);
});

test("die Reihe der Zeitraeume steht ueber den Zahlen", () => {
  const html = zeichne();
  for (const z of ZEITRAEUME) {
    assert.ok(html.includes(`data-action="lifeskin-zeitraum" data-wert="${z.id}"`), `${z.id} fehlt`);
  }
  assert.match(html, /aria-pressed="true"[^>]*>\s*Heute/, "Der gewaehlte Zeitraum ist nicht zu erkennen");
});

test("die Liste zeigt genau das gewaehlte Fach", () => {
  const sitzungen = [sitzung("neu1"), sitzung("ready1"), sitzung("seen1", { berichtGeoeffnet: true }),
    sitzung("spaeter1"), sitzung("archiv1")];
  const berichte = {
    ready1: { status: "fertig" },
    seen1: { status: "fertig" },
    spaeter1: { spaeter: true },
    archiv1: { status: "fertig", archiviert: true }
  };
  const imFach = (fach) => {
    const html = zeichne({ sitzungen, berichte, fach });
    return [...html.matchAll(/data-action="lifeskin-sitzung" data-id="([^"]+)"/g)].map((m) => m[1]);
  };
  // Das Fach der unbeantworteten Faelle heisst jetzt "alle" - es ist
  // das, mit dem die Liste aufmacht.
  assert.deepEqual(imFach("alle"), ["neu1"]);
  assert.deepEqual(imFach("ready"), ["ready1"]);
  assert.deepEqual(imFach("seen"), ["seen1"]);
  assert.deepEqual(imFach("spaeter"), ["spaeter1"]);
  assert.deepEqual(imFach("neu"), [], "ein unbekanntes Fach zeigt nichts, statt alles");
  assert.deepEqual(imFach("archiv"), [], "ein unbekanntes Fach zeigt nichts, statt alles");
  assert.deepEqual(imFach("archiviert"), ["archiv1"]);
});

// DIE ERSTE FILTEREBENE: die Art des Falls.
//
// ALLE WEGE IN EINER LISTE.
//
// Hier standen zwei Chipreihen uebereinander: erst die ART des Falls
// (Scan, Foto, Trup, Pytje), darunter sein ZUSTAND. Zehn Chips fuer
// eine Liste - und die obere Reihe beantwortete eine Frage, die niemand
// stellt: Ein Fall ist ein Fall, egal ueber welchen Weg er hereinkam.
// Die Arbeit daran ist dieselbe, und WELCHER Weg es war, steht an der
// Zeile selbst.
test("es gibt nur noch eine Chipreihe, und die sagt, wie weit ein Fall ist", () => {
  const sitzungen = [
    sitzung("s1", { typ: "scan" }), sitzung("s2", { typ: "scan" }),
    sitzung("f1", { typ: "foto" }),
    sitzung("t1", { typ: "trup", photos: [] }),
    sitzung("p1", { typ: "pytje", photos: [] })
  ];
  const html = zeichne({ sitzungen, zeitraum: "max", fach: "alle" });
  assert.ok(!html.includes('data-action="lifeskin-art"'), "Die Chipreihe nach Art steht noch da");

  // Sechs Chips, in dieser Reihenfolge.
  const chips = [...html.matchAll(/data-action="lifeskin-fach" data-wert="([a-z]+)"/g)]
    .map((m) => m[1]);
  assert.deepEqual(chips, ["alle", "ready", "seen", "bestellt", "spaeter", "archiviert"]);

  // "Alle" heisst: jeder Weg. Es heisst NICHT: jeder Zustand - ein Fall
  // liegt in genau einem Fach und wandert weiter, sobald sich etwas an
  // ihm aendert.
  assert.match(html,
    /data-action="lifeskin-fach" data-wert="alle"[\s\S]{0,160}<span>5<\/span>/);
  const block = html.slice(html.indexOf(">Fälle<"), html.indexOf(">Bestellungen<"));
  const drin = [...block.matchAll(/data-action="lifeskin-sitzung" data-id="([^"]+)"/g)]
    .map((m) => m[1]).sort();
  assert.deepEqual(drin, ["f1", "p1", "s1", "s2", "t1"]);
});

// EIN FALL LIEGT IN GENAU EINEM FACH.
//
// GEMELDET, NICHT BEFUERCHTET: Die Chips waren als Sichten auf dieselbe
// Liste gebaut - wer seine Antwort geoeffnet hatte, stand in "Seen" UND
// in "Alle". Eine Liste, aus der nichts herauswandert, waechst nur und
// wird nicht abgearbeitet.
test("wer seine Antwort gesehen hat, steht in Seen und nicht mehr in Alle", () => {
  const sitzungen = [
    sitzung("neu1"),
    sitzung("ready1"),
    sitzung("seen1", { berichtGeoeffnet: true }),
    sitzung("kauf1", { berichtGeoeffnet: true, hatBestellt: true, order: { orderId: "o1", total: 53 } }),
    sitzung("spaet1"),
    sitzung("archiv1")
  ];
  const berichte = {
    ready1: { status: "fertig" },
    seen1: { status: "fertig" },
    kauf1: { status: "fertig" },
    spaet1: { spaeter: true },
    archiv1: { status: "fertig", archiviert: true }
  };
  const inFach = (fach) => {
    const html = zeichne({ sitzungen, berichte, fach });
    const block = html.slice(html.indexOf(">Fälle<"), html.indexOf(">Bestellungen<"));
    return [...block.matchAll(/data-action="lifeskin-sitzung" data-id="([^"]+)"/g)]
      .map((m) => m[1]).sort();
  };

  assert.deepEqual(inFach("alle"), ["neu1"], "In Alle steht mehr als das Unbeantwortete");
  assert.deepEqual(inFach("ready"), ["ready1"]);
  assert.deepEqual(inFach("seen"), ["seen1"], "Der Bestellte steht auch noch in Seen");
  assert.deepEqual(inFach("bestellt"), ["kauf1"]);
  assert.deepEqual(inFach("spaeter"), ["spaet1"]);
  assert.deepEqual(inFach("archiviert"), ["archiv1"]);

  // Und die Zahlen an den Chips addieren sich zur Gesamtzahl: Wenn ein
  // Fall zweimal gezaehlt wird, faellt es hier auf.
  const html = zeichne({ sitzungen, berichte, fach: "alle" });
  const zahlen = [...html.matchAll(/data-action="lifeskin-fach" data-wert="[a-z]+"[\s\S]{0,160}?<span>(\d+)<\/span>/g)]
    .map((m) => Number(m[1]));
  assert.equal(zahlen.reduce((a, b) => a + b, 0), sitzungen.length,
    `Die Faecher zaehlen zusammen ${zahlen.reduce((a, b) => a + b, 0)} statt ${sitzungen.length} Faelle`);
});

// BESTELLT IST EIN EIGENER CHIP.
//
// Er beantwortet die Frage, die nach der Freigabe kommt: Wer hat danach
// wirklich gekauft? Sie stand bisher in keiner Sicht auf diese Liste.
test("der Chip Bestellt zeigt die Faelle, aus denen ein Kauf wurde", () => {
  const sitzungen = [
    sitzung("k1", { hatBestellt: true, order: { orderId: "o1", total: 53 } }),
    sitzung("n1", {})
  ];
  const html = zeichne({ sitzungen, fach: "bestellt" });
  assert.match(html,
    /data-action="lifeskin-fach" data-wert="bestellt"[\s\S]{0,160}<span>1<\/span>/);
  // Nur im Block der Faelle gesucht: Derselbe Fall steht darunter noch
  // einmal in den Bestellungen, und das ist richtig so.
  const block = html.slice(html.indexOf(">Fälle<"), html.indexOf(">Bestellungen<"));
  const drin = [...block.matchAll(/data-action="lifeskin-sitzung" data-id="([^"]+)"/g)]
    .map((m) => m[1]);
  assert.deepEqual(drin, ["k1"]);
});

// WAS ZURUECKGELEGT ODER ABGEHAKT IST, LIEGT NICHT MEHR IM WEG.
//
// Es steht in seinem eigenen Fach daneben - und nur dort.
test("Alle zeigt nicht, was zurueckgelegt oder abgehakt wurde", () => {
  const sitzungen = [sitzung("a"), sitzung("s"), sitzung("x")];
  const berichte = { s: { spaeter: true }, x: { archiviert: true } };
  const html = zeichne({ sitzungen, berichte, fach: "alle" });
  const block = html.slice(html.indexOf(">Fälle<"), html.indexOf(">Bestellungen<"));
  const drin = [...block.matchAll(/data-action="lifeskin-sitzung" data-id="([^"]+)"/g)]
    .map((m) => m[1]);
  assert.deepEqual(drin, ["a"]);
  assert.match(html, /data-action="lifeskin-fach" data-wert="spaeter"[\s\S]{0,160}<span>1<\/span>/);
  assert.match(html, /data-action="lifeskin-fach" data-wert="archiviert"[\s\S]{0,160}<span>1<\/span>/);
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
  // Und in der Vorschau wird nichts gezaehlt. Die Pruefung sitzt jetzt in
  // #markeSetzen statt an einer einzelnen Schreibstelle: Seit die Marken
  // am gezeigten Bildschirm haengen, laufen alle durch diese Methode, und
  // eine Ausnahme nur an einer Stelle haette die anderen durchgelassen.
  const marke = astra.slice(astra.indexOf("#markeSetzen(feld) {"));
  assert.match(marke.slice(0, 900), /if \(this\.nurVorschau\) return;/,
    "Ein eigener Blick zaehlt als Patient, der die Seite geoeffnet hat");
  // Und die Marken haengen wirklich am Bildschirm - nicht am Laden der
  // Seite, sonst waere die Warteseite wieder ein gelesener Befund.
  assert.match(astra, /if \(name === "prit"\) this\.#markeSetzen\("warteseiteGeoeffnet"\);/);
  assert.match(astra, /if \(name === "fertig"\) this\.#markeSetzen\("berichtGeoeffnet"\);/);
});
