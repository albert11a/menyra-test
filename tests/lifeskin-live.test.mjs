import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

import {
  baueLive, baueLiveReihe, istGeradeAktiv,
  LIVE_ANALYSE_PUNKTE, LIVE_BESTELL_PUNKTE, LIVE_FENSTER_MS
} from "../apps/mnyra-heart/heart-lifeskin-live.js";
import { normalisiere } from "../apps/mnyra-heart/heart-lifeskin-berechnung.js";

const wurzel = join(dirname(fileURLToPath(import.meta.url)), "..");
const lies = (p) => readFileSync(join(wurzel, p), "utf8");

const JETZT = Date.parse("2026-09-18T12:00:00.000Z");
const vor = (ms) => new Date(JETZT - ms).toISOString();

function sitzung(step, { alterMs = 5000, ...rest } = {}) {
  return normalisiere(`s-${step}-${alterMs}-${Math.random()}`, {
    createdAt: vor(alterMs + 60000), updatedAt: vor(alterMs), step, ...rest
  });
}

// DER UNTERSCHIED ZUM TRICHTER IST DIE RECHNUNG, NICHT DIE ZEIT.
//
// Der Trichter zaehlt kumulativ - wer bestellt hat, steht in jeder Stufe
// davor. Hier steht jeder in GENAU EINEM Punkt: dort, wo er gerade ist.
// Sonst leuchteten beim ersten Besucher alle Punkte gleichzeitig, und die
// Reihe saehe immer gleich aus.

test("jeder steht in genau einem Punkt - dort, wo er gerade ist", () => {
  const live = baueLive([
    sitzung("opened"),
    sitzung("camera"),
    sitzung("emri"),
    sitzung("result")
  ], JETZT);

  const zahlen = Object.fromEntries(live.analysen.punkte.map((p) => [p.id, p.anzahl]));
  assert.deepEqual(zahlen, { landing: 1, zgjedhja: 0, skanimi: 1, numri: 1, pritja: 1 });
  assert.equal(live.analysen.gesamt, 4);
});

// DER WAHLBILDSCHIRM HAT SEINEN EIGENEN PUNKT.
//
// Er ist die Stelle, an der sich der Weg teilt - mit Kamera oder ohne -,
// und damit die einzige, an der man beim Zusehen etwas lernen kann: Wer
// hier steht, entscheidet gerade. In "Landingpage" mitgezaehlt waere das
// nicht zu sehen, und genau dafuer gibt es diesen Bildschirm.
test("wer gerade waehlt, steht bei Zgjedhja und nirgends sonst", () => {
  const live = baueLive([sitzung("wahl")], JETZT);
  const zahlen = Object.fromEntries(live.analysen.punkte.map((p) => [p.id, p.anzahl]));
  assert.deepEqual(zahlen, { landing: 0, zgjedhja: 1, skanimi: 0, numri: 0, pritja: 0 });
});

test("wer die Nummer tippt, leuchtet NICHT auch bei der Kamera", () => {
  // Genau das waere passiert, haette die Live-Reihe wie der Trichter
  // gerechnet - und dann sagte sie nichts ueber "wo steckt er gerade".
  const live = baueLive([sitzung("numri")], JETZT);
  const zahlen = Object.fromEntries(live.analysen.punkte.map((p) => [p.id, p.anzahl]));
  assert.deepEqual(zahlen, { landing: 0, zgjedhja: 0, skanimi: 0, numri: 1, pritja: 0 });
});

// NAME UND NUMMER SIND EIN ABSCHNITT, NICHT ZWEI.
//
// Der Name bekommt keinen eigenen Punkt - sonst waeren es fuenf, und die
// Reihe waere wieder eine Liste. In "Skanimi" gehoert er aber auch nicht:
// Wer seinen Namen tippt, scannt nicht mehr.
test("wer den Namen tippt, steht schon bei Numri", () => {
  const live = baueLive([sitzung("emri")], JETZT);
  const an = live.analysen.punkte.filter((p) => p.aktiv).map((p) => p.id);
  assert.deepEqual(an, ["numri"], "Der Namensschirm leuchtet am falschen Punkt");
  // Und er faellt nicht durch: Eine Person, die gerade tippt, muss oben
  // mitgezaehlt werden, sonst steht dort "Gerade ist niemand unterwegs".
  assert.equal(live.analysen.gesamt, 1);
});

test("ein Punkt leuchtet nur, wenn dort wirklich jemand steht", () => {
  const live = baueLive([sitzung("camera")], JETZT);
  const an = live.analysen.punkte.filter((p) => p.aktiv).map((p) => p.id);
  assert.deepEqual(an, ["skanimi"], "Es leuchtet mehr als der eine Punkt");
  // Und die Bestellreihe ist dabei still.
  assert.equal(live.bestellungen.gesamt, 0);
  assert.ok(!live.bestellungen.punkte.some((p) => p.aktiv));
});

// WAS NICHT VON SELBST KOMMT, IST DAS VERSCHWINDEN.
//
// Wer aufhoert, schreibt nichts mehr. Ohne ein Zeitfenster bliebe sein
// Punkt stehen, bis irgendwann irgendwer etwas anderes tut - und die Reihe
// zeigte Leute, die laengst weg sind.
test("wer laenger nichts getan hat, faellt aus der Reihe", () => {
  const gerade = baueLive([sitzung("camera", { alterMs: 30 * 1000 })], JETZT);
  assert.equal(gerade.analysen.gesamt, 1);

  const laengstWeg = baueLive([sitzung("camera", { alterMs: LIVE_FENSTER_MS + 1000 })], JETZT);
  assert.equal(laengstWeg.analysen.gesamt, 0, "Ein alter Lauf steht noch in der Reihe");
});

test("das Fenster traegt den laengsten Bildschirm", () => {
  // Die Aufnahme dauert: Wer den Ring dreht, schreibt in dieser Zeit
  // nichts. Waere das Fenster enger als der Bildschirm, verschwaende er
  // mitten dabei.
  assert.ok(LIVE_FENSTER_MS >= 120000, "Das Fenster ist kuerzer als eine Aufnahme dauert");
  assert.ok(istGeradeAktiv({ updatedAt: vor(110 * 1000) }, JETZT));
});

test("eine Uhr, die vorgeht, macht keine ewig aktive Sitzung", () => {
  // Der Zeitstempel kommt vom Geraet des Besuchers. Geht dessen Uhr eine
  // Stunde vor, stuende er sonst fuer immer in der Reihe.
  assert.equal(istGeradeAktiv({ updatedAt: new Date(JETZT + 3600000).toISOString() }, JETZT), false);
  // Ein paar Sekunden Abweichung sind dagegen normal und zaehlen mit.
  assert.equal(istGeradeAktiv({ updatedAt: new Date(JETZT + 5000).toISOString() }, JETZT), true);
});

test("ohne Zeitstempel steht niemand in der Reihe", () => {
  assert.equal(istGeradeAktiv({}, JETZT), false);
  assert.equal(istGeradeAktiv(null, JETZT), false);
  assert.equal(baueLive(null, JETZT).analysen.gesamt, 0);
  assert.equal(baueLive([{}], JETZT).analysen.gesamt, 0);
});

// ---------- Die zweite Reihe ----------

test("die Bestellreihe zaehlt die drei Schritte vor dem Geld", () => {
  const live = baueLive([
    sitzung("offer"),
    sitzung("address"),
    sitzung("ordered"),
    // Und einer, der noch gar nicht so weit ist - er gehoert nicht dazu.
    sitzung("pyetja1")
  ], JETZT);

  const zahlen = Object.fromEntries(live.bestellungen.punkte.map((p) => [p.id, p.anzahl]));
  assert.deepEqual(zahlen, { kasse: 1, anschrift: 1, bestellt: 1 });
  assert.equal(live.bestellungen.gesamt, 3);
  // Der bei Frage 1 steht in der anderen Reihe.
  assert.equal(live.analysen.gesamt, 1);
});

test("der Bestellschirm zaehlt auch ueber seine Marke", () => {
  // Er schreibt keinen eigenen Schritt, sondern kasseGeoeffnet. Ohne das
  // stuende niemand je im ersten Punkt der Bestellreihe.
  const kasse = LIVE_BESTELL_PUNKTE.find((p) => p.id === "kasse");
  assert.equal(kasse.marke, "kasseGeoeffnet");
  const live = baueLive([sitzung("result", { kasseGeoeffnet: true })], JETZT);
  assert.equal(live.bestellungen.punkte[0].anzahl, 1);
});

// ---------- Der Chip ----------

test("im Chip steht die Zahl aller gerade Aktiven", () => {
  // "So weiss ich, aha, da tut sich grad was." Eine Null heisst ruhig,
  // eine Eins heisst: jemand ist dabei.
  assert.equal(baueLive([], JETZT).analysen.gesamt, 0);
  assert.equal(baueLive([sitzung("camera"), sitzung("emri")], JETZT).analysen.gesamt, 2);

  const render = lies("apps/mnyra-heart/heart-lifeskin-render.js");
  assert.match(render, /id: "analysen", label: "Live-Analysen", anzahl: live\?\.analysen\?\.gesamt/);
  assert.match(render, /id: "bestellungen", label: "Live-Bestellungen", anzahl: live\?\.bestellungen\?\.gesamt/);
});

// ---------- Die Reihe auf dem Bildschirm ----------

test("die Punkte haengen an Strichen und leuchten nur, wenn jemand da ist", () => {
  const render = lies("apps/mnyra-heart/heart-lifeskin-render.js");
  // EINE ZUSTANDSKLASSE JE HALT, und Punkt, Strich und Wort lesen sie.
  assert.match(render, /if \(p\.aktiv\) klassen\.push\("heart-live__halt--an"\)/,
    "Der Halt sagt nicht, ob dort jemand steht");
  // Der Strich haengt am Halt und liegt nicht als eigenes Stueck dazwischen:
  // So ist er ueberall gleich lang, egal wie breit das Wort darunter ist.
  assert.ok(!/heart-live__strich/.test(render),
    "Die Striche liegen wieder als eigene Stuecke zwischen den Punkten");

  const css = lies("apps/mnyra-heart/heart.css");
  assert.match(css, /\.heart-live__halt--an \.heart-live__punkt \{[\s\S]{0,240}animation: heart-live-puls/,
    "Ein aktiver Punkt pulsiert nicht");
  assert.match(css, /@keyframes heart-live-puls/);
  // Vor dem ersten Halt gibt es keinen Strich.
  assert.match(css, /\.heart-live__halt:first-child::before \{ content: none; \}/,
    "Vor dem ersten Punkt laeuft ein Strich ins Leere");
  // Alle Halte gleich breit - daran haengt, dass die Striche gleich lang sind.
  assert.match(css, /\.heart-live__halt \{[\s\S]{0,200}flex: 1 1 0/,
    "Die Halte sind wieder so breit wie ihre Beschriftung");
  // Wer Bewegung abbestellt hat, sieht den Punkt trotzdem - nur ohne Puls.
  assert.match(css, /prefers-reduced-motion[\s\S]{0,400}\.heart-live__halt--an \.heart-live__punkt \{\s*animation: none/);
});

test("die Reihe ist auch fuer Vorleseprogramme lesbar", () => {
  // Punkte auf einer Linie sind ein Bild. Ohne Beschriftung waeren sie
  // fuer den, der sie nicht sieht, gar nichts.
  const render = lies("apps/mnyra-heart/heart-lifeskin-render.js");
  assert.match(render, /role="img" aria-label="\$\{escapeHtml\(punkte\.map/);
});

// ---------- Live heisst live ----------

test("die Ansicht haengt an einem Zuhoerer, nicht an einer Nachfrage", () => {
  const adapter = lies("apps/mnyra-heart/heart-lifeskin-adapter.js");
  assert.match(adapter, /export function horcheLive\(/);
  assert.match(adapter, /abmelden = onSnapshot\(abfrage,/,
    "Die Live-Ansicht fragt nach, statt zuzuhoeren");
  // Und sie holt nur den Ausschnitt, nicht die ganze Sammlung: Ein
  // Zuhoerer auf dreitausend Sitzungen laedt beim Anmelden dreitausend
  // Dokumente und rechnet bei jeder Aenderung alles neu.
  assert.match(adapter, /where\("updatedAt", ">=", seit\)/);
  assert.doesNotMatch(adapter, /limit\(300\)/);
  // Ein Fehler darf Heart nicht anhalten - die Zahlen darunter kommen aus
  // einer eigenen Abfrage.
  assert.match(adapter, /beiAenderung\(null\);/);
});

test("der Takt raeumt weg, was der Zuhoerer nicht meldet", () => {
  // Wer aufhoert, schreibt nichts mehr - Firestore meldet also nichts.
  // Ohne eigenen Takt bliebe sein Punkt stehen.
  const heart = lies("apps/mnyra-heart/heart.js");
  assert.match(heart, /liveTakt = globalThis\.setInterval\(liveRechnen, 1000\)/,
    "Die Reihe rechnet nicht von selbst nach");
  // Aber nur zeichnen, wenn sich etwas geaendert hat: Ein Zustandswechsel
  // je Sekunde zeichnete den ganzen Bereich neu.
  assert.match(heart, /if \(gleich\) return;/,
    "Die Reihe zeichnet jede Sekunde neu, auch wenn nichts passiert ist");
  // Und beim Verlassen abmelden.
  assert.match(heart, /export function liveAnhalten\(\)/);
  assert.match(heart, /globalThis\.clearInterval\(liveTakt\)/);
});

// DER LETZTE PUNKT BEDEUTET ETWAS ANDERES ALS DIE DREI DAVOR.
//
// In den ersten drei ist jemand unterwegs und man sieht ihm zu. Auf
// "Pritja" ist er fertig und wartet - auf Dr. Gashi. Das ist der einzige
// Punkt der Reihe, bei dem jemand etwas TUN muss, und er sieht deshalb
// anders aus.
test("Pritja leuchtet in einer eigenen Farbe - und nur Pritja", () => {
  const live = baueLive([sitzung("result"), sitzung("camera")], JETZT);
  const toene = Object.fromEntries(live.analysen.punkte.map((p) => [p.id, p.ton]));
  assert.equal(toene.pritja, "warten", "Pritja traegt keine eigene Farbe");
  for (const id of ["landing", "skanimi", "numri"]) {
    assert.equal(toene[id], "", `${id} traegt eine Sonderfarbe, obwohl dort nur gewartet wird`);
  }

  // Der Zeichner haengt die Farbe an den Ton und nicht an den Namen des
  // Punktes: Sonst veraendert der naechste Umbau den Namen und nicht die
  // Farbe, und niemand merkt es.
  const render = lies("apps/mnyra-heart/heart-lifeskin-render.js");
  assert.match(render, /klassen\.push\(`heart-live__halt--\$\{escapeHtml\(p\.ton\)\}`\)/,
    "Die Farbe haengt nicht am Ton des Punktes");
  assert.ok(!/p\.id === "pritja"/.test(render), "Im Zeichner steht eine Abfrage auf den Namen");

  // Und es gibt die Farbe wirklich - eine Klasse ohne Regel faerbt nichts.
  const css = lies("apps/mnyra-heart/heart.css");
  assert.match(css, /\.heart-live__halt--warten \.heart-live__punkt \{/,
    "Fuer den wartenden Punkt gibt es keine Regel");
  assert.match(css, /@keyframes heart-live-puls-warten/,
    "Der wartende Punkt pulsiert weiter in Gruen");
  // Auch der Strich davor faerbt sich mit - ein bernsteinfarbener Punkt am
  // Ende eines gruenen Strichs sieht aus wie ein Fehler.
  assert.match(css, /\.heart-live__halt--warten::before \{ background:/,
    "Der Strich laeuft in einer anderen Farbe auf den Punkt zu");
  // Die Regel muss NACH der gruenen stehen: gleiche Staerke, spaetere gewinnt.
  assert.ok(css.indexOf(".heart-live__halt--warten .heart-live__punkt")
    > css.indexOf(".heart-live__halt--an .heart-live__punkt"),
    "Die gruene Regel steht spaeter und ueberschreibt die Sonderfarbe");
});

// DIE CHIPS STEHEN UEBER DER KARTE, NICHT DARIN.
//
// Drinnen sahen sie aus wie eine Ueberschrift: zwei Woerter mit Zahlen,
// die zum Inhalt darunter zu gehoeren schienen. Sie gehoeren aber nicht
// dazu - sie WAEHLEN ihn aus, dieselbe Stelle wie die Zeitraeume weiter
// unten.
test("die Umschalter stehen ueber der Karte und nicht darin", () => {
  const render = lies("apps/mnyra-heart/heart-lifeskin-render.js");
  const rumpf = render.slice(render.indexOf("function renderLive(live"),
    render.indexOf("function renderLive(live") + 1400);
  const chips = rumpf.indexOf('renderChips(chips, art, "lifeskin-live")');
  const kasten = rumpf.indexOf('<section class="heart-lifeskin-block heart-live"');
  assert.ok(chips > -1 && kasten > -1, "Die Chips oder der Kasten fehlen");
  assert.ok(chips < kasten, "Die Chips stehen wieder im Kasten statt darueber");

  // Und die Karte ist ein Kasten wie die anderen: Sie hatte kurz eine
  // eigene, helle Fassung - die fiel zu stark aus der Seite.
  const css = lies("apps/mnyra-heart/heart.css");
  assert.ok(!/\.heart-live \{/.test(css),
    "Die Karte hat wieder eine eigene Fassung statt der gemeinsamen");
  assert.ok(!/\.heart-live \.heart-lifeskin-chip/.test(css),
    "Die Chips werden immer noch von der Karte umgefaerbt - sie stehen gar nicht mehr darin");
  // Punkt, Strich und Wort lesen die Farbnamen der Seite, damit ein
  // Themenwechsel sie mitnimmt.
  for (const regel of [".heart-live__punkt {", ".heart-live__name {", ".heart-live__halt::before {"]) {
    const block = css.slice(css.indexOf(regel), css.indexOf("}", css.indexOf(regel)));
    assert.match(block, /var\(--heart-/, `${regel} benutzt feste Farben statt der Namen der Seite`);
  }
});

// DAS WORT UNTER DEM PUNKT MUSS EIN WORT BLEIBEN.
//
// GESEHEN, NICHT BEFUERCHTET: Mit vier Halten war ein Halt 88 Punkte
// breit und "Landingpage" passte bei 11px hinein. Der fuenfte Halt (die
// Wahl) machte daraus 71 - und "overflow-wrap: anywhere" tat genau das,
// was dort steht: Es brach mitten im Wort um, "Landingpa" ueber "ge".
// Ein Wort, das mitten durchgeschnitten ist, liest sich als Fehler der
// Seite und nicht als Beschriftung.
test("die Beschriftung eines Halts bricht nicht mitten im Wort", () => {
  const css = lies("apps/mnyra-heart/heart.css");
  const block = css.slice(css.indexOf(".heart-live__name {"),
    css.indexOf("}", css.indexOf(".heart-live__name {")));
  assert.ok(!/overflow-wrap:\s*anywhere/.test(block),
    "Die Beschriftung bricht wieder mitten im Wort um");
  assert.match(block, /font-size: clamp\(/,
    "Die Schrift steht fest - auf einem schmalen Telefon passt das laengste Wort dann nicht");
});

test("die fuenf Punkte sind die fuenf Abschnitte des Wegs", () => {
  // Sie heissen nach den Bildschirmen, die es WIRKLICH GIBT: Landingpage,
  // Wahl, Scan, Kontaktdaten, Warteseite. Hier standen "Fillo skanimin"
  // fuer einen Ladebildschirm und "Pyetjet" fuer vier Fragen - beides
  // zeigt der Trichter seit dem Umbau nicht mehr, und man suchte den
  // Menschen dort, wo er nicht sein kann.
  //
  // ES WAREN VIER. Der fuenfte ist die Wahl zwischen Scan und ohne Scan -
  // der Bildschirm, an dem sich der Weg teilt.
  assert.deepEqual(LIVE_ANALYSE_PUNKTE.map((p) => p.id),
    ["landing", "zgjedhja", "skanimi", "numri", "pritja"]);
  assert.deepEqual(LIVE_ANALYSE_PUNKTE.map((p) => p.label),
    ["Landingpage", "Zgjedhja", "Skanimi", "Numri", "Pritja"]);
  // Jeder Schritt des Trichters liegt in genau einem Punkt - sonst faellt
  // jemand aus der Reihe, ohne dass es auffaellt.
  const alle = LIVE_ANALYSE_PUNKTE.flatMap((p) => p.schritte);
  assert.equal(new Set(alle).size, alle.length, "Ein Schritt steht in zwei Punkten");
  for (const schritt of ["opened", "wahl", "named", "camera", "captured",
    "pyetja1", "pyetja2", "pyetja3", "pyetja4", "emri", "numri", "aufbereitung", "result"]) {
    assert.ok(alle.includes(schritt), `Der Schritt ${schritt} liegt in keinem Punkt`);
  }
});
