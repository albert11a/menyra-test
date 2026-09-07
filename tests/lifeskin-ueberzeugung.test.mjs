import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { TEXTE } from "../apps/lifeskin-bericht/bericht-texte.js";

const wurzel = join(dirname(fileURLToPath(import.meta.url)), "..");
const bericht = readFileSync(join(wurzel, "apps/lifeskin-bericht/bericht.js"), "utf8");
const markup = readFileSync(join(wurzel, "apps/lifeskin-bericht/index.html"), "utf8");

// Die Befundseite muss dreiundfuenfzig Euro tragen.
//
// Sie ist aufgebaut wie ein Arztbrief und nicht wie eine Werbeseite: erst
// was geprueft wurde, dann was gefunden wurde, dann die Messwerte - und
// erst als SCHLUSS daraus die Diagnose. Diese Reihenfolge ist der ganze
// Trick, und deshalb steht sie hier fest.

test("jeder Text, den die Seite abruft, steht im Verzeichnis - in beiden Sprachen", () => {
  const abgerufen = new Set(
    [...bericht.matchAll(/this\.text\("([a-zA-Z0-9]+)"/g)].map((m) => m[1])
  );
  // Die Stufennamen werden zusammengesetzt, nicht buchstabiert.
  for (const stufe of [0, 1, 2, 3, 4]) abgerufen.add(`niveli${stufe}`);
  abgerufen.delete("niveli${Math");

  assert.ok(abgerufen.size > 25, `Zu wenige Textschluessel gefunden (${abgerufen.size})`);
  const fehlend = [...abgerufen].filter((k) => !TEXTE[k]);
  assert.deepEqual(fehlend, [], "Diese Schluessel ruft die Seite ab, es gibt sie aber nicht");

  const halb = [...abgerufen].filter((k) => !TEXTE[k]?.sq || !TEXTE[k]?.de);
  assert.deepEqual(halb, [], "Diese Texte fehlen in einer der beiden Sprachen");
});

test("die Reihenfolge ist Beweis, Fund, Messung - und ERST DANN die Diagnose", () => {
  // Eine Diagnose, die vor den Zahlen kommt, ist eine Behauptung. Eine, die
  // danach kommt, ist der Schluss aus Zahlen, die der Patient gerade selbst
  // gelesen hat - und die hinterfragt er nicht.
  const reihe = ["lb-pillen", "lb-ekztext", "lb-gjettext", "lb-messteil", "lb-diagnose",
                 "lb-erklaerteil", "lb-ohneteil", "lb-produkte", "lb-preis"];
  const stellen = reihe.map((id) => markup.indexOf(id));
  for (const [i, stelle] of stellen.entries()) {
    assert.ok(stelle > 0, `"${reihe[i]}" fehlt auf der Seite`);
  }
  assert.deepEqual(stellen, [...stellen].sort((a, b) => a - b),
    `Die Reihenfolge stimmt nicht: ${reihe.join(" -> ")}`);
});

test("die Seite belegt die Arbeit, bevor sie etwas behauptet", () => {
  // Drei Pillen: Aufnahmen, Zonen, Zeitpunkt. Sie stehen VOR jeder Aussage -
  // wer sieht, wie viel geprueft wurde, liest das Folgende anders.
  assert.ok(markup.includes('id="lb-pillen"'), "Die Pillen fehlen");
  assert.match(bericht, /#pillenZeichnen/, "Die Pillen werden nicht gezeichnet");
  assert.ok(markup.indexOf("lb-pillen") < markup.indexOf("lb-ekztext"),
    "Die Pillen stehen hinter dem ersten Text statt davor");

  // Und die Zahlen kommen aus der Analyse, nicht aus der Seite.
  const koerper = bericht.slice(bericht.indexOf("#pillenZeichnen()"), bericht.indexOf("#pille(zeichen"));
  assert.match(koerper, /raport\.fotot/, "Die Zahl der Aufnahmen ist erfunden");
  assert.match(koerper, /raport\.zonat/, "Die Zahl der Zonen ist erfunden");
});

test("der Fachbefund darf leicht sagen - die Zeile darunter nennt die Handlung", () => {
  // Achtmal "e lehtë" liest sich als "mir fehlt nichts". Deshalb traegt die
  // Stufe eine HANDLUNG und kein Adjektiv. Zwanzig verstopfte Poren sind
  // fachlich leicht und brauchen trotzdem etwas.
  for (const stufe of [0, 1, 2, 3, 4]) {
    const text = TEXTE[`niveli${stufe}`];
    assert.ok(text?.sq && text?.de, `Stufe ${stufe} fehlt`);
  }
  for (const stufe of [1, 2, 3, 4]) {
    assert.match(TEXTE[`niveli${stufe}`].sq, /^Kërkon/,
      `Stufe ${stufe} beschreibt einen Zustand statt eine Handlung`);
  }
  assert.match(TEXTE.niveli0.sq, /ruajtje/,
    "Auch die ruhige Haut braucht eine Handlung - sonst hat die Haelfte der Gescannten keinen Grund");
});

test("Messwerte ohne Befund fallen nicht weg, sie bekommen einen Haken", () => {
  // Eine Seite, auf der alles schlecht ist, ist ein Verkaufszettel - und
  // dann wird auch der schlechte Teil nicht geglaubt. Der gute Wert ist der
  // Kontrast, der die schlechten scharf macht.
  const koerper = bericht.slice(bericht.indexOf("#messZeichnen() {"), bericht.indexOf("#diagnoseZeichnen() {"));
  assert.match(koerper, /stufe === 0/, "Ein Wert ohne Befund wird nicht besonders behandelt");
  assert.match(koerper, /lb-haken/, "Der gute Wert bekommt keinen Haken");
  assert.match(koerper, /slice\(0, 5\)/, "Es werden nicht genau fuenf Werte gezeigt");
});

test("was ohne Pflege geschieht, steht unmittelbar vor der Therapie", () => {
  // Der rote Kasten sagt, was nicht von selbst zurueckgeht; im naechsten
  // Atemzug steht, was das loest. Das ist der Uebergang, an dem entschieden
  // wird - dazwischen darf nichts stehen.
  const ohne = markup.indexOf('id="lb-ohneteil"');
  const produkte = markup.indexOf('id="lb-produkte"');
  assert.ok(ohne > 0 && produkte > ohne, "Der Verlauf steht nicht vor der Therapie");
  for (const marke of ["ohneZbehet", "ohneNukZbehet", "ohnePas6"]) {
    assert.ok(TEXTE[marke]?.sq, `${marke} fehlt`);
  }
});

test("die Seite erfindet nichts und laesst Leeres weg", () => {
  // Was Dr. Gashi nicht eingetragen hat, faellt ersatzlos weg. Eine
  // kuerzere Seite ist immer besser als eine mit leeren Zeilen darauf.
  for (const [name, methode] of [
    ["Messwerte", "#messZeichnen() {"],
    ["Diagnose", "#diagnoseZeichnen() {"],
    ["Erklaerung", "#erklaerungZeichnen() {"],
    ["Verlauf", "#ohneZeichnen() {"]
  ]) {
    const start = bericht.indexOf(methode);
    assert.ok(start > 0, `${name}: Methode fehlt`);
    const koerper = bericht.slice(start, start + 900);
    assert.match(koerper, /ls-verstecken/, `${name}: bleibt ohne Inhalt trotzdem stehen`);
  }
  assert.ok(!/Math\.random|beispiel|dummy/i.test(bericht), "Hier werden Werte erfunden");
});

test("die Aufnahmen des Patienten wandern nicht mit dem Link", () => {
  // Der Link zu dieser Seite wird weitergegeben - wir bitten sogar darum.
  // Ein Gesicht, das mitwandert, waere der teuerste Fehler dieses Systems.
  // Das Blatt zeigt deshalb, WAS aufgenommen wurde, nicht die Bilder.
  assert.ok(!bericht.includes("/photos/"), "Die Befundseite fragt die Aufnahmen an");
  const koerper = bericht.slice(bericht.indexOf("#fotoblatt(auf) {"), bericht.indexOf("#produkteZeichnen() {"));
  assert.ok(!/createElement\("img"\)|<img/.test(koerper), "Das Fotoblatt zeigt Bilder");
  assert.match(TEXTE.fotoUnter.sq, /nuk udhëtojnë me linkun/,
    "Der Seite fehlt der Satz, dass die Aufnahmen nicht mitwandern");
});
