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
  assert.deepEqual(zahlen, { landing: 1, menyra: 0, fotot: 1, pyetje: 0, numri: 1, pritja: 1 });
  assert.equal(live.analysen.gesamt, 4);
});

// DER WAHLBILDSCHIRM HAT SEINEN EIGENEN PUNKT.
//
// Er ist die Stelle, an der sich der Weg teilt - mit Kamera oder ohne -,
// und damit die einzige, an der man beim Zusehen etwas lernen kann: Wer
// hier steht, entscheidet gerade. In "Landingpage" mitgezaehlt waere das
// nicht zu sehen, und genau dafuer gibt es diesen Bildschirm.
test("wer gerade waehlt, steht bei Mënyra und nirgends sonst", () => {
  const live = baueLive([sitzung("wahl")], JETZT);
  const zahlen = Object.fromEntries(live.analysen.punkte.map((p) => [p.id, p.anzahl]));
  assert.deepEqual(zahlen, { landing: 0, menyra: 1, fotot: 0, pyetje: 0, numri: 0, pritja: 0 });
});

test("wer die Nummer tippt, leuchtet NICHT auch bei der Kamera", () => {
  // Genau das waere passiert, haette die Live-Reihe wie der Trichter
  // gerechnet - und dann sagte sie nichts ueber "wo steckt er gerade".
  const live = baueLive([sitzung("numri")], JETZT);
  const zahlen = Object.fromEntries(live.analysen.punkte.map((p) => [p.id, p.anzahl]));
  assert.deepEqual(zahlen, { landing: 0, menyra: 0, fotot: 0, pyetje: 0, numri: 1, pritja: 0 });
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
  assert.deepEqual(an, ["fotot"], "Es leuchtet mehr als der eine Punkt");
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
  assert.deepEqual(zahlen, { rezultati: 0, kasse: 1, anschrift: 1, bestellt: 1 });
  assert.equal(live.bestellungen.gesamt, 3);
  // Der bei Frage 1 steht in der anderen Reihe.
  assert.equal(live.analysen.gesamt, 1);
});

test("der Bestellschirm zaehlt auch ueber seine Marke", () => {
  // Er schreibt keinen eigenen Schritt, sondern kasseGeoeffnet. Ohne das
  // stuende niemand je im ersten Punkt der Bestellreihe.
  // ZWEI MARKEN, ZWEI LAEDEN: die Kasse auf der Befundseite und der
  // Korb im Laden auf der Landingpage. Beide heissen fuer den, der
  // zusieht, dasselbe.
  const kasse = LIVE_BESTELL_PUNKTE.find((p) => p.id === "kasse");
  assert.deepEqual(kasse.marken, ["kasseGeoeffnet", "imKorb"]);
  const live = baueLive([sitzung("result", { kasseGeoeffnet: true })], JETZT);
  assert.equal(live.bestellungen.punkte.find((p) => p.id === "kasse").anzahl, 1);
});

test("der Laden: wer nach einem Analyse-Schritt in den Korb legt, steht bei N'shport", () => {
  // Gemessen (29.09.): Wer im Laden erst die Menyra ansah oder den Scan
  // anfing und dann doch in den Korb legte, stand weiter in der
  // Analyse-Reihe - die Marke zaehlt nicht, sobald ein Live-Stand da ist.
  // Jetzt schreibt der Laden seinen Stand (Sitzung.liveMerken).
  const zahlen = (live) => Object.fromEntries(live.bestellungen.punkte.map((p) => [p.id, p.anzahl]));
  const korb = baueLive([sitzung("wahl", { imKorb: true, timings: { live: "offer" } })], JETZT);
  assert.deepEqual(zahlen(korb), { rezultati: 0, kasse: 1, anschrift: 0, bestellt: 0 });
  assert.equal(korb.analysen.gesamt, 0);
  const anschrift = baueLive([sitzung("named", { imKorb: true, adresseBegonnen: true, timings: { live: "address" } })], JETZT);
  assert.deepEqual(zahlen(anschrift), { rezultati: 0, kasse: 0, anschrift: 1, bestellt: 0 });
  // Und wer danach wieder den Scan anfaengt, steht wieder dort.
  const scan = baueLive([sitzung("named", { imKorb: true, timings: { live: "named" } })], JETZT);
  assert.equal(scan.bestellungen.gesamt, 0);
  assert.equal(scan.analysen.gesamt, 1);
});

// ---------- Der Chip ----------

test("im Chip steht die Zahl aller gerade Aktiven", () => {
  // "So weiss ich, aha, da tut sich grad was." Eine Null heisst ruhig,
  // eine Eins heisst: jemand ist dabei.
  assert.equal(baueLive([], JETZT).analysen.gesamt, 0);
  assert.equal(baueLive([sitzung("camera"), sitzung("emri")], JETZT).analysen.gesamt, 2);

  // Und die Zahl steht unter der Reihe, in einem Satz: Die zwei Chips,
  // die sie einmal trugen, sind weg - beide Reihen stehen jetzt
  // gleichzeitig da (siehe unten).
  const render = lies("apps/mnyra-heart/heart-lifeskin-render.js");
  assert.match(render, /\$\{reihe\.gesamt\} \$\{reihe\.gesamt === 1 \? "Person ist" : "Personen sind"\}/);
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
  assert.match(css, /\.heart-live__halt--an \.heart-live__punkt::after \{[\s\S]{0,240}animation: heart-live-puls/,
    "Ein aktiver Punkt pulsiert nicht");
  // Der Puls ist ein Ring aus transform/opacity - kein Schatten, der auf
  // iOS nach dem Gehen des Besuchers als Rest stehen blieb.
  assert.doesNotMatch(css.slice(css.indexOf("@keyframes heart-live-puls"), css.indexOf("}", css.indexOf("@keyframes heart-live-puls") + 40) + 60), /box-shadow/,
    "Der Puls laeuft wieder ueber box-shadow");
  assert.match(css, /@keyframes heart-live-puls/);
  // Vor dem ersten Halt gibt es keinen Strich.
  assert.match(css, /\.heart-live__halt:first-child::before \{ content: none; \}/,
    "Vor dem ersten Punkt laeuft ein Strich ins Leere");
  // Alle Halte gleich breit - daran haengt, dass die Striche gleich lang sind.
  assert.match(css, /\.heart-live__halt \{[\s\S]{0,200}flex: 1 1 0/,
    "Die Halte sind wieder so breit wie ihre Beschriftung");
  // Wer Bewegung abbestellt hat, sieht den Punkt trotzdem - nur ohne Puls.
  assert.match(css, /prefers-reduced-motion[\s\S]{0,400}\.heart-live__halt--an \.heart-live__punkt::after \{\s*animation: none/);
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
  for (const id of ["landing", "fotot", "numri"]) {
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
  assert.match(css, /\.heart-live__halt--warten \.heart-live__punkt::after \{ border-color: #f0b429; \}/,
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

// ZWEI KARTEN, KEINE UMSCHALTER.
//
// Die zwei Reihen lagen auf EINEM Platz, und zwei Chips darueber
// schalteten um. Das war ein Handgriff zu viel fuer die Frage, wegen
// der man abends noch einmal hinsieht: Tut sich gerade etwas? Wer
// umschalten muss, sieht immer nur die Haelfte - und die andere
// Haelfte ist genau die, in der Geld liegt.
test("beide Reihen stehen gleichzeitig da, ohne Umschalter", () => {
  const render = lies("apps/mnyra-heart/heart-lifeskin-render.js");
  const rumpf = render.slice(render.indexOf("function renderLive(live"),
    render.indexOf("function renderLive(live") + 600);
  assert.match(rumpf, /renderLiveKarte\(live\?\.analysen, "analysen"/);
  assert.match(rumpf, /renderLiveKarte\(live\?\.bestellungen, "bestellungen"/);
  assert.ok(!/lifeskin-live"/.test(render), "Die Chipreihe zum Umschalten steht noch da");
  const events = lies("apps/mnyra-heart/heart-events.js");
  assert.ok(!/action === "lifeskin-live"/.test(events),
    "Der Umschalter wird noch aufgefangen");

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
  // Sie heissen nach den Bildschirmen, die es WIRKLICH GIBT: Landing,
  // Menyra, alles vor einer Kamera, die Angaben mit der Nummer, die
  // Warteseite.
  //
  // ES WAREN SECHS, JETZT FUENF: "Skanimi" und "Fotoja" heissen fuer
  // den, der zusieht, dasselbe - steht gerade vor der Kamera. WELCHEN
  // Weg jemand genommen hat, steht im Trichter darunter, je Weg und mit
  // jedem Bildschirm einzeln.
  // SEIT 27.09. SECHS: die vier Fragen nach Scan und Foto sind wieder im
  // Weg und bekommen ihren eigenen Punkt ("Pyetjet").
  assert.deepEqual(LIVE_ANALYSE_PUNKTE.map((p) => p.id),
    ["landing", "menyra", "fotot", "pyetje", "numri", "pritja"]);
  assert.deepEqual(LIVE_ANALYSE_PUNKTE.map((p) => p.label),
    ["Landing", "Mënyra", "Fotot", "Pyetjet", "Nummri", "Patient"]);
  // Jeder Schritt des Trichters liegt in genau einem Punkt - sonst faellt
  // jemand aus der Reihe, ohne dass es auffaellt.
  const alle = LIVE_ANALYSE_PUNKTE.flatMap((p) => p.schritte);
  assert.equal(new Set(alle).size, alle.length, "Ein Schritt steht in zwei Punkten");
  for (const schritt of ["opened", "wahl", "named", "camera", "captured",
    "fotopara", "fotokamera", "fotogati",
    "pyetja1", "pyetja2", "pyetja3", "pyetja4", "emri", "problemi", "numri",
    "aufbereitung", "result"]) {
    assert.ok(alle.includes(schritt), `Der Schritt ${schritt} liegt in keinem Punkt`);
  }
});

// WER VOR EINER KAMERA STEHT, STEHT BEI "Fotot" - auf beiden Wegen.
test("beide Wege mit Aufnahme leuchten am selben Punkt", () => {
  for (const schritt of ["fotokamera", "camera"]) {
    const live = baueLive([sitzung(schritt)], JETZT);
    const zahlen = Object.fromEntries(live.analysen.punkte.map((p) => [p.id, p.anzahl]));
    assert.deepEqual(zahlen, { landing: 0, menyra: 0, fotot: 1, pyetje: 0, numri: 0, pritja: 0 },
      `Der Schritt ${schritt} leuchtet am falschen Punkt`);
  }
});

// DIE ZWEITE REIHE: N'shport, Adresa, Cash.
test("der Laden auf der Landingpage steht in derselben Reihe wie die Kasse", () => {
  const korb = { ...sitzung("opened"), imKorb: true };
  const adresse = { ...sitzung("opened"), imKorb: true, adresseBegonnen: true };
  const live = baueLive([korb, adresse], JETZT);
  const zahlen = Object.fromEntries(live.bestellungen.punkte.map((p) => [p.id, p.anzahl]));
  assert.deepEqual(zahlen, { rezultati: 0, kasse: 1, anschrift: 1, bestellt: 0 });
  assert.deepEqual(LIVE_BESTELL_PUNKTE.map((p) => p.label), ["Rezultati", "N'shport", "Adresa", "Cash"]);
});

// WER SEINE ERGEBNISSEITE LIEST, STEHT IN DER KAUFREIHE (29.09.).
//
// Die Seite schreibt beim Oeffnen live "fertig". Dieser Schritt lag in
// keinem Punkt - der Kunde mit dem Preis vor sich war in Live unsichtbar.
test("wer seine Ergebnisseite liest, steht bei Rezultati - mit dem Kaufknopf bei N'shport", () => {
  const liest = sitzung("result", { timings: { live: "fertig" } });
  const kasse = sitzung("result", { kasseGeoeffnet: true, timings: { live: "porosia" } });
  const tippt = sitzung("result", { kasseGeoeffnet: true, timings: { live: "address" } });
  const wartet = sitzung("result", { timings: { live: "prit" } });
  const live = baueLive([liest, kasse, tippt, wartet], JETZT);
  const kauf = Object.fromEntries(live.bestellungen.punkte.map((p) => [p.id, p.anzahl]));
  assert.deepEqual(kauf, { rezultati: 1, kasse: 1, anschrift: 1, bestellt: 0 });
  // Wer noch auf Dr. Gashi wartet, bleibt Patient - und steht nicht doppelt.
  const analyse = Object.fromEntries(live.analysen.punkte.map((p) => [p.id, p.anzahl]));
  assert.equal(analyse.pritja, 1);
  assert.equal(live.analysen.gesamt + live.bestellungen.gesamt, 4);
});

// EINE ALTE MARKE MACHT AUS EINEM LAUFENDEN SCAN KEINEN KAUF.
test("wer nach dem Warenkorb einen Scan anfaengt, steht im Analyseweg", () => {
  const live = baueLive([{ ...sitzung("camera"), imKorb: true }], JETZT);
  const analyse = Object.fromEntries(live.analysen.punkte.map((p) => [p.id, p.anzahl]));
  assert.equal(analyse.fotot, 1, "Der laufende Scan faellt aus der Reihe");
  assert.equal(live.analysen.gesamt, 1);
});

test("Versand ist noch kein Patient: Live-Anzeige und Analysezahl stimmen ueberein", () => {
  const s = sitzung("aufbereitung", { timings: { live: "aufbereitung" } });
  const live = baueLive([s], JETZT);
  assert.equal(live.analysen.punkte.find(p => p.id === "pritja").anzahl, 0);
  assert.equal(live.analysen.punkte.find(p => p.id === "numri").anzahl, 1);
});

test("derselbe Patient beim erneuten Oeffnen erhoeht die Analysezahl nicht erneut", async () => {
  const { aktualisiereLifeskinSitzungen, baueKennzahlen } = await import('../apps/mnyra-heart/heart-lifeskin-berechnung.js');
  const s = sitzung('aufbereitung', { timings: { live: 'prit' } });
  let zustand = aktualisiereLifeskinSitzungen({ sitzungen: [], berichte: {} }, [s]);
  assert.equal(baueKennzahlen(zustand.sitzungen, { zeitraum: 'max' }).analysen, 1);
  zustand = aktualisiereLifeskinSitzungen(zustand, [{ ...s, updatedAt: vor(0) }]);
  assert.equal(baueKennzahlen(zustand.sitzungen, { zeitraum: 'max' }).analysen, 1);
  assert.equal(baueLive(zustand.sitzungen, JETZT).analysen.punkte.find(p => p.id === 'pritja').anzahl, 1);
});

// DIE VIER FRAGEN NACH SCAN UND FOTO (27.09.) haben ihren eigenen Punkt.
test("wer die Fragen beantwortet, steht bei Pyetjet - nicht bei Nummri", () => {
  for (const schritt of ["pyetja1", "pyetja2", "pyetja3", "pyetja4"]) {
    const live = baueLive([sitzung(schritt)], JETZT);
    const an = live.analysen.punkte.filter((p) => p.aktiv).map((p) => p.id);
    assert.deepEqual(an, ["pyetje"], schritt);
    assert.equal(live.analysen.gesamt, 1);
  }
});

// ---------- Der Laden: drei Reihen (29.09., Wunsch Inhaber) ----------
//
// "Live Shop: Landing - N'shport - Adresa - Gotat. Live Trichter: Mënyra -
// Foto - Pytjet - Nummri - Patient. Live Analyse: Analyse - N'shport -
// Adresa - Gotat. So haben wir keinen Mismatch."

test("Lifeskin Shop: drei Reihen mit genau den Punkten des Inhabers", async () => {
  const { baueLiveShop } = await import("../apps/mnyra-heart/heart-lifeskin-live.js");
  const live = baueLiveShop([], JETZT);
  assert.deepEqual(live.shop.punkte.map((p) => p.label), ["Landing", "N'shport", "Adresa", "Gotat"]);
  assert.deepEqual(live.trichter.punkte.map((p) => p.label), ["Mënyra", "Fotot", "Pyetjet", "Nummri", "Patient"]);
  assert.deepEqual(live.analyse.punkte.map((p) => p.label), ["Analyse", "N'shport", "Adresa", "Gotat"]);
});

test("Lifeskin Shop: jeder steht in genau einem Punkt genau einer Reihe", async () => {
  const { baueLiveShop } = await import("../apps/mnyra-heart/heart-lifeskin-live.js");
  const wo = (daten) => {
    const live = baueLiveShop([sitzung(daten.step || "opened", daten)], JETZT);
    const treffer = ["shop", "trichter", "analyse"].flatMap((r) => live[r].punkte.filter((p) => p.anzahl).map((p) => `${r}:${p.label}`));
    assert.ok(treffer.length <= 1, `an zwei Stellen: ${treffer.join(", ")}`);
    return treffer[0] || "";
  };
  // Der Laden: Landing, Korb, Kasse, Anschrift, bestellt.
  assert.equal(wo({ step: "opened" }), "shop:Landing");
  assert.equal(wo({ imKorb: true, timings: { live: "offer" } }), "shop:N'shport");
  assert.equal(wo({ imKorb: true, kasseGeoeffnet: true, timings: { live: "kasa" } }), "shop:Adresa");
  assert.equal(wo({ step: "ordered", shopKauf: true, order: { kind: "shop", total: 39 }, timings: { live: "ordered" } }), "shop:Gotat");
  // Wer vorher die Analyse angetippt hatte und dann in den Korb legt: Laden.
  assert.equal(wo({ step: "wahl", imKorb: true, timings: { live: "offer" } }), "shop:N'shport");
  // Der Trichter - ohne Landing.
  assert.equal(wo({ step: "wahl", timings: { live: "wahl" } }), "trichter:Mënyra");
  assert.equal(wo({ step: "camera", timings: { live: "camera" } }), "trichter:Fotot");
  assert.equal(wo({ step: "pyetja2", timings: { live: "pyetja2" } }), "trichter:Pyetjet");
  assert.equal(wo({ step: "numri", timings: { live: "numri" } }), "trichter:Nummri");
  assert.equal(wo({ step: "result", timings: { live: "prit" } }), "trichter:Patient");
  // Die Ergebnisseite: liest, Warenkorb, Kasse, Anschrift, bestellt.
  const befund = { step: "result", berichtGeoeffnet: true };
  assert.equal(wo({ ...befund, timings: { live: "fertig" } }), "analyse:Analyse");
  assert.equal(wo({ ...befund, timings: { live: "shporta", kauf: { knopf: "x" } } }), "analyse:N'shport");
  assert.equal(wo({ ...befund, kasseGeoeffnet: true, timings: { live: "porosia" } }), "analyse:Adresa");
  assert.equal(wo({ ...befund, kasseGeoeffnet: true, timings: { live: "address" } }), "analyse:Adresa");
  assert.equal(wo({ ...befund, step: "ordered", order: { total: 39, orderId: "LS-1" }, timings: { live: "ordered" } }), "analyse:Gotat");
  // Besuche von vor den eigenen Namen: die Marken des Ladens.
  assert.equal(wo({ imKorb: true }), "shop:N'shport");
  assert.equal(wo({ imKorb: true, adresseBegonnen: true }), "shop:Adresa");
});

test("Lifeskin Shop: Gotat heisst gerade bestellt, nicht gestern", async () => {
  const { baueLiveShop } = await import("../apps/mnyra-heart/heart-lifeskin-live.js");
  const gestern = new Date(JETZT - 26 * 3600000).toISOString();
  const live = baueLiveShop([sitzung("ordered", {
    order: { total: 39, orderId: "LS-1" }, timings: { live: "ordered", ereignisse: { "2026-09-17": { hatBestellt: gestern } } }
  })], JETZT);
  assert.equal(live.analyse.gesamt, 0);
});

test("Lifeskin Shop: Heart zeichnet die drei Karten, die anderen Tabs ihre zwei", () => {
  const render = lies("apps/mnyra-heart/heart-lifeskin-render.js");
  assert.match(render, /if \(live\?\.shop\) return renderLiveLaden\(live\);/);
  const laden = render.slice(render.indexOf("function renderLiveLaden(live"), render.indexOf("function renderLive(live"));
  assert.match(laden, /renderLiveKarte\(live\.shop, "shop", "Live · Shop"\)/);
  assert.match(laden, /renderLiveKarte\(live\.trichter, "trichter", "Live · Trichter"\)/);
  assert.match(laden, /renderLiveKarte\(live\.analyse, "analyse", "Live · Analyse"\)/);
  const heart = lies("apps/mnyra-heart/heart.js");
  assert.match(heart, /const bauen = weg === "lifeskinshop" \? baueLiveShop : baueLive;/);
});
