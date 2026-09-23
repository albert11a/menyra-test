// VIER ARTEN, EIN SYSTEM - was Heart daraus macht.
//
// Vorne bedient LifeSkin vier Beduerfnisse, hinten laeuft EIN System:
// Jeder Fall ist derselbe Fall, nur mit einem Typ daran. Das ist die
// Entscheidung, an der alles haengt - vier getrennte Bereiche waeren
// viermal dieselbe Liste, und dreimal davon fast immer leer.
//
// Diese Datei haelt fest, was daran auseinanderlaufen kann:
//
//   1. DIE CASE CARD veraendert ihren Inhalt mit dem Typ, nicht ihren
//      Aufbau. Bei einem Scan sieht man auf das Bild, bei einer Frage
//      auf den Satz.
//   2. DIE AKTE zeigt den Text von Trup und Pytje GANZ OBEN. Dort gibt
//      es kein Gesicht anzusehen; was er geschrieben hat, IST der Fall.
//   3. DIE VIER TRICHTER stehen neben dem gemeinsamen und zeigen je
//      Uebergang, wo die Leute weggehen.
//   4. DIE HAUPTFLAECHE beantwortet drei Fragen. Alles andere liegt
//      zugeklappt darunter.

import test from "node:test";
import assert from "node:assert/strict";

import {
  baueKennzahlen, baueTrichter, baueLesetiefe, baueHerkunft, baueVerteilung, normalisiere
} from "../apps/mnyra-heart/heart-lifeskin-berechnung.js";
import { renderLifeskin } from "../apps/mnyra-heart/heart-lifeskin-render.js";
import { lies } from "./lifeskin-quelle.mjs";

const HEART = lies("apps/mnyra-heart/heart.js");
const EVENTS = lies("apps/mnyra-heart/heart-events.js");

const fall = (id, extra = {}) => normalisiere(id, {
  createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  step: "result", name: id, code: `LS-${id}`, ...extra
});

function zeichne(zusatz = {}) {
  const grund = {
    status: "ready", loadedFrom: "network", sitzungen: [], tests: [], berichte: {},
    produkte: [], abdeckung: [], kennzahlen: baueKennzahlen([]), trichter: baueTrichter([]),
    lesetiefe: baueLesetiefe([]), herkunft: baueHerkunft([]), verteilung: baueVerteilung([]), verlauf: [],
    offen: "", fotos: {}, fotosStatus: "", resetGefragt: false, resetStatus: "",
    produktOffen: "", produktStatus: "", zeitraum: "max", fach: "alle", vorschau: {}
  };
  return renderLifeskin({ ...grund, ...zusatz });
}

// ---------------------------------------------------------------------------
// 1. Die Case Card
// ---------------------------------------------------------------------------

test("die Fallnummer traegt ihre Art - LS-1548 · FOTO", () => {
  // Damit sich ein Fall am Telefon oder in WhatsApp in einem Wort
  // benennen laesst: "Der Fotofall von heute Mittag".
  const html = zeichne({
    sitzungen: [fall("f1", { typ: "foto", photos: ["zona"] }), fall("p1", { typ: "pytje" })]
  });
  assert.match(html, /heart-lifeskin-art heart-lifeskin-art--foto">FOTO</);
  assert.match(html, /heart-lifeskin-art heart-lifeskin-art--pytje">PYTJE</);
  assert.match(html, /LS-f1/, "Die Fallnummer steht nicht mehr da");
});

test("bei Trup und Pytje steht sein Text in der Zeile, nicht die Marken", () => {
  // Bei einem Scan sagt die zweite Zeile, wie weit der Kunde gekommen
  // ist. Bei einer Frage ist das nicht die Frage - dort will man wissen,
  // worum es geht, bevor man den Fall aufmacht.
  const html = zeichne({
    sitzungen: [
      fall("t1", { typ: "trup", problemi: "Kam njolla te shpina prej dy javësh, kruhen." }),
      fall("s1", { typ: "scan", photos: ["gerade"] })
    ]
  });
  const teile = html.slice(html.indexOf(">Fälle<")).split('class="heart-lifeskin-fall"');
  const trup = teile.find((t) => t.includes('data-id="t1"')) || "";
  const scan = teile.find((t) => t.includes('data-id="s1"')) || "";
  assert.match(trup, /Kam njolla te shpina/, "Der Text des Falls steht nicht in der Zeile");
  assert.ok(!trup.includes("heart-lifeskin-pill--wa"), "Neben dem Text stehen auch noch die Marken");
  assert.match(scan, /heart-lifeskin-pill--wa/, "Dem Scan fehlen seine Marken");

  // Ein langer Text wird gekuerzt, nicht umgebrochen: Die Liste bleibt
  // scrollbar, und wer mehr will, tippt den Fall an.
  const lang = zeichne({ sitzungen: [fall("t2", { typ: "trup", problemi: "a".repeat(400) })] });
  assert.match(lang, /a{110}…/);
  assert.ok(!lang.includes("a".repeat(120)));
});

// ---------------------------------------------------------------------------
// 2. Die Akte
// ---------------------------------------------------------------------------

test("die Akte eines Pytje-Falls zeigt die Frage ueber allem anderen", () => {
  const html = zeichne({
    sitzungen: [fall("p1", { typ: "pytje", pyetja: "A mund të përdor retinol gjatë shtatzënisë?" })],
    offen: "p1"
  });
  assert.match(html, /heart-fall-karte__titel">Seine Frage/);
  assert.match(html, /A mund të përdor retinol/);
  // GANZ OBEN: vor den Aufnahmen und vor dem Befundbogen. Wer die Akte
  // oeffnet, soll die Frage lesen, bevor er irgendetwas anderes sieht.
  assert.ok(html.indexOf("heart-lifeskin-anliegen") < html.indexOf("heart-lifeskin-fotos")
    || !html.includes("heart-lifeskin-fotos"));
  assert.ok(html.indexOf("heart-lifeskin-anliegen") < html.indexOf("Seine Antworten"),
    "Der Text steht unter der Anamnese statt darueber");
});

test("bei Trup heisst derselbe Block anders - und bei Scan gibt es ihn nicht", () => {
  const trup = zeichne({
    sitzungen: [fall("t1", { typ: "trup", problemi: "Skuqje në bërryl." })], offen: "t1"
  });
  assert.match(trup, /heart-fall-karte__titel">Sein Hautproblem/);

  // Ein Block, der immer da ist und meistens leer, wird nach zwei Tagen
  // ueberlesen.
  const scan = zeichne({ sitzungen: [fall("s1", { typ: "scan", photos: ["gerade"] })], offen: "s1" });
  assert.ok(!scan.includes("heart-lifeskin-anliegen"),
    "Der Scan bekommt einen leeren Kasten fuer einen Text, den es dort nie gibt");
});

test("ein Fall ohne Text sagt das, statt leer dazustehen", () => {
  const html = zeichne({ sitzungen: [fall("t1", { typ: "trup" })], offen: "t1" });
  assert.match(html, /heart-fall-karte__titel">Sein Hautproblem/);
  assert.match(html, /Er hat nichts geschrieben/);
});

test("aus der Akte laesst sich ein Fall zuruecklegen - und wieder holen", () => {
  // ZURUECKLEGEN IST NICHT ABHAKEN. Ein Fall, der heute nicht drankommt,
  // gehoert nicht ins Archiv (dort sucht ihn niemand mehr) und nicht
  // nach "Neu" (dort steht er morgen wieder oben).
  const offen = zeichne({ sitzungen: [fall("a")], offen: "a" });
  assert.match(offen, /data-action="lifeskin-spaeter"\s+data-id="a" data-wert="ja"/);
  assert.match(offen, /Für später zurücklegen/);

  const zurueck = zeichne({
    sitzungen: [fall("a")], berichte: { a: { spaeter: true } }, offen: "a"
  });
  assert.match(zurueck, /data-action="lifeskin-spaeter"\s+data-id="a" data-wert="nein"/);
  assert.match(zurueck, /Zurück in die Liste/);

  // Und der Knopf fuehrt zu einer Operation, die es gibt.
  assert.match(EVENTS, /action === "lifeskin-spaeter"/);
  assert.match(EVENTS, /\{ spaeter: target\.getAttribute\("data-wert"\) === "ja" \}/);
  assert.match(HEART, /"spaeter" in marken/,
    "Heart sagt nach dem Zuruecklegen dasselbe wie nach dem Abhaken");
});

// DEN FILTER NACH ART GIBT ES NICHT MEHR.
//
// Er war die obere von zwei Chipreihen ueber derselben Liste und
// beantwortete eine Frage, die niemand stellt: Ein Fall ist ein Fall,
// egal ueber welchen Weg er hereinkam - die Arbeit daran ist dieselbe.
// WELCHER Weg es war, steht weiter an der Zeile selbst (artMarke).
test("die Faelle werden nicht mehr nach Art gefiltert", () => {
  assert.ok(!/action === "lifeskin-art"/.test(EVENTS),
    "Der Chip nach Art wird noch aufgefangen");
  assert.ok(!/setLifeskinArt/.test(HEART), "Die Operation zum Filtern nach Art steht noch da");
  const html = zeichne({
    sitzungen: [fall("a", { typ: "scan", photos: ["gerade"] }), fall("b", { typ: "trup" })]
  });
  assert.ok(!html.includes('data-action="lifeskin-art"'), "Die Chipreihe nach Art steht noch da");
  // Und beide Faelle stehen trotzdem in derselben Liste.
  assert.match(html, /data-action="lifeskin-sitzung" data-id="a"/);
  assert.match(html, /data-action="lifeskin-sitzung" data-id="b"/);
});

// ---------------------------------------------------------------------------
// 3. Die vier Trichter
// ---------------------------------------------------------------------------

// SECHS TRICHTER, EINER JE CHIP.
//
// Sie lagen als drei Bloecke untereinander - ein gemeinsamer Trichter,
// vier Kaesten daneben, die Lesetiefe darunter. Jetzt ist es ein Block
// mit einer Chipreihe darueber, und in jedem Chip steht die Zahl, um
// die es in diesem Trichter geht.
test("ueber dem Trichter stehen sechs Chips, jeder mit seiner Zahl", () => {
  const html = zeichne({
    sitzungen: [
      ...Array.from({ length: 4 }, (_, i) =>
        fall(`s${i}`, { typ: "scan", kameraOk: true, photos: ["gerade"], warteseiteGeoeffnet: true })),
      fall("f1", { typ: "foto", step: "fotogati", photos: ["zona"] })
    ]
  });
  const chips = [...html.matchAll(/data-action="lifeskin-trichter" data-wert="([a-z]+)"/g)]
    .map((m) => m[1]);
  assert.deepEqual(chips, ["main", "scan", "foto", "trup", "kauf", "bericht"]);
  // Der offene steht darunter, mit seiner Ueberschrift.
  assert.match(html, /Trichter · Main/);
  assert.match(html, /aria-pressed="true"[\s\S]{0,80}Main/);
  // Und die Zahl im Chip ist die, die ganz durchgekommen ist.
  assert.match(html,
    /data-action="lifeskin-trichter" data-wert="main"[\s\S]{0,200}<span>4<\/span>/);
});

test("der Chip schaltet um, was darunter steht", () => {
  const html = zeichne({
    sitzungen: [fall("s1", { typ: "scan", kameraOk: true, photos: ["gerade"] })],
    trichterOffen: "scan"
  });
  assert.match(html, /Trichter · Skanim/);
  for (const label of ["Anleitung", "Kamera akzeptiert", "Scan", "Emri &amp; Mosha",
    "Nummri", "Loading", "Patient"]) {
    assert.ok(html.includes(label), `Die Stufe "${label}" fehlt im Trichter des Scans`);
  }
});

test("der zusammengefuehrte Weg hat einen Trichter und heisst nach sich selbst", () => {
  const html = zeichne({
    sitzungen: [fall("t1", { typ: "trup", step: "problemi", problemi: "x" })],
    trichterOffen: "trup"
  });
  assert.match(html, /Trichter · Për trupin ose vetëm pyetje/);
  for (const label of ["Emri &amp; Mosha", "Sqaroni problemet", "Nummri", "Patient"]) {
    assert.ok(html.includes(label), `Die Stufe "${label}" fehlt`);
  }
});

test("der Chip des Trichters fuehrt zu einer Operation, die es gibt", () => {
  // Ein Knopf im Markup, den niemand auffaengt, sieht aus wie ein Knopf
  // und ist keiner.
  assert.match(EVENTS, /action === "lifeskin-trichter"/);
  assert.match(EVENTS, /operations\.setLifeskinTrichter\?\./);
  assert.match(HEART, /setLifeskinTrichter\(id\)/);
  assert.match(HEART, /trichterOffen: String\(id \|\| "main"\)\.trim\(\)/);
  // Und der Anfangszustand kennt ihn, sonst steht beim ersten Oeffnen
  // gar kein Trichter da.
  assert.match(lies("apps/mnyra-heart/heart-state.js"), /trichterOffen: "main"/);
});

test("ohne einen einzigen Besucher steht der Trichter trotzdem da", () => {
  // Er zeigt dann lauter Nullen - und das ist richtig: Der Aufbau soll
  // von Anfang an vertraut sein. Was fehlt, sagt der Satz darueber.
  const html = zeichne();
  assert.match(html, /data-action="lifeskin-trichter"/);
  assert.match(html, /Trichter · Main/);
});

// ---------------------------------------------------------------------------
// 4. Die Hauptflaeche
// ---------------------------------------------------------------------------

test("was nicht jeden Tag gelesen wird, steht zugeklappt", () => {
  // Die Hauptflaeche beantwortet drei Fragen: Was ist neu? Was muss ich
  // bearbeiten? Was hat der Kunde danach gemacht? Alles andere wird
  // hoechstens einmal in der Woche angefasst.
  const html = zeichne({ sitzungen: [fall("a")], produkte: [] });
  const mehr = html.indexOf('<details class="heart-lifeskin-mehr"');
  assert.ok(mehr > -1, "Es gibt keinen zugeklappten Bereich");
  assert.ok(html.indexOf(">Fälle<") < mehr, "Die Faelle liegen im zugeklappten Bereich");
  assert.ok(html.indexOf(">Nachfassen<") < mehr, "Nachfassen liegt im zugeklappten Bereich");
  for (const titel of [">Herkunft je Anzeige<", ">Produkte<", ">Verteilung<", ">Anbieter<"]) {
    assert.ok(html.indexOf(titel) > mehr, `${titel} steht noch auf der Hauptflaeche`);
  }
});

test("Nachfassen nimmt nur auf, wer wirklich abgebrochen hat", () => {
  const lange = new Date(Date.now() - 2 * 3600 * 1000).toISOString();
  const html = zeichne({
    sitzungen: [
      // Hat gelesen und eine Nummer hinterlassen - und nie auf
      // Bestellen getippt. Ein Leser, kein Abbrecher.
      fall("leser", { berichtGeoeffnet: true, sahPreis: true, phone: "+383 44 1", updatedAt: lange }),
      // Kasse offen, nicht bestellt, zwei Stunden her.
      fall("weg", {
        berichtGeoeffnet: true, kasseGeoeffnet: true, kasseGeoeffnetAt: lange,
        phone: "+383 44 2", updatedAt: lange
      })
    ]
  });
  const block = html.slice(html.indexOf(">Nachfassen<"));
  assert.ok(block.includes('data-id="weg"'), "Der echte Abbrecher fehlt");
  assert.ok(!block.slice(0, block.indexOf("</section>")).includes('data-id="leser"'),
    "Ein Leser steht in der Liste zum Anrufen");
});
