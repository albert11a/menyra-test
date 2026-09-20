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
    produktOffen: "", produktStatus: "", zeitraum: "max", fach: "neu", art: "", vorschau: {}
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
  assert.match(html, /<h4>Seine Frage/);
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
  assert.match(trup, /<h4>Sein Hautproblem/);

  // Ein Block, der immer da ist und meistens leer, wird nach zwei Tagen
  // ueberlesen.
  const scan = zeichne({ sitzungen: [fall("s1", { typ: "scan", photos: ["gerade"] })], offen: "s1" });
  assert.ok(!scan.includes("heart-lifeskin-anliegen"),
    "Der Scan bekommt einen leeren Kasten fuer einen Text, den es dort nie gibt");
});

test("ein Fall ohne Text sagt das, statt leer dazustehen", () => {
  const html = zeichne({ sitzungen: [fall("t1", { typ: "trup" })], offen: "t1" });
  assert.match(html, /<h4>Sein Hautproblem/);
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
  assert.match(zurueck, /Zurueck in die Liste/);

  // Und der Knopf fuehrt zu einer Operation, die es gibt.
  assert.match(EVENTS, /action === "lifeskin-spaeter"/);
  assert.match(EVENTS, /\{ spaeter: target\.getAttribute\("data-wert"\) === "ja" \}/);
  assert.match(HEART, /"spaeter" in marken/,
    "Heart sagt nach dem Zuruecklegen dasselbe wie nach dem Abhaken");
});

test("der Filter nach Art fuehrt zu einer Operation, die es gibt", () => {
  assert.match(EVENTS, /action === "lifeskin-art"/);
  assert.match(EVENTS, /operations\.setLifeskinArt\?\./);
  assert.match(HEART, /setLifeskinArt\(id\)/);
  // Ein Wechsel der Art laesst den Zustand darunter stehen: Sonst
  // springt man von "Foto · Ready" zurueck nach "Neu", ohne es zu
  // wollen.
  const setzen = HEART.slice(HEART.indexOf("setLifeskinArt(id)"), HEART.indexOf("setLifeskinArt(id)") + 200);
  assert.ok(!setzen.includes("fach:"), "Der Wechsel der Art setzt das Fach zurueck");
});

// ---------------------------------------------------------------------------
// 3. Die vier Trichter
// ---------------------------------------------------------------------------

test("unter dem gemeinsamen Trichter stehen die vier Wege", () => {
  const html = zeichne({
    sitzungen: [
      ...Array.from({ length: 4 }, (_, i) => fall(`s${i}`, { typ: "scan", photos: ["gerade"] })),
      fall("f1", { typ: "foto", step: "fotogati", photos: ["zona"] })
    ]
  });
  const block = html.slice(html.indexOf('<div class="heart-lifeskin-zweige">'));
  for (const label of ["Me skanim", "Me foto", "Trup", "Pytje"]) {
    assert.ok(block.includes(label), `Der Weg "${label}" fehlt`);
  }
  // EIN WEG, DEN NIEMAND GENOMMEN HAT, VERSCHWINDET NICHT - er wird
  // blass. Ein Kasten, der aus der Anzeige faellt, sobald ihn niemand
  // nimmt, ist genau der, den man uebersieht.
  assert.match(block, /data-leer="ja"/);
  assert.match(block, /Diesen Weg hat noch niemand genommen/);
  assert.match(block, /data-leer="nein"/);
  // Und der Uebergang steht an der Zeile: nicht "wie viele kamen an",
  // sondern "wie viele von denen, die eine Zeile darueber standen".
  assert.match(block, /heart-lifeskin-stufe__anteil">\d+\s*%/);
});

test("ohne einen einzigen Besucher steht der Kasten gar nicht da", () => {
  // Vier Trichter aus lauter Nullen sehen aus wie ein Fehler. Gesucht
  // wird die Reihe der Kaesten und nicht die Ueberschrift: "Mënyra"
  // steht auch als Stufe im gemeinsamen Trichter darueber.
  assert.ok(!zeichne().includes('<div class="heart-lifeskin-zweige">'));
});

// ---------------------------------------------------------------------------
// 4. Die Hauptflaeche
// ---------------------------------------------------------------------------

test("was nicht jeden Tag gelesen wird, steht zugeklappt", () => {
  // Die Hauptflaeche beantwortet drei Fragen: Was ist neu? Was muss ich
  // bearbeiten? Was hat der Kunde danach gemacht? Alles andere wird
  // hoechstens einmal in der Woche angefasst.
  const html = zeichne({ sitzungen: [fall("a")], produkte: [] });
  const mehr = html.indexOf('<details class="heart-lifeskin-mehr">');
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
