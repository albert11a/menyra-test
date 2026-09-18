import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const wurzel = join(dirname(fileURLToPath(import.meta.url)), "..");

// Der Trichter und die Firestore-Regeln muessen dasselbe Dokument meinen.
//
// Sie taten es nicht, und der Fehler war unsichtbar: hasOnly weist das GANZE
// Dokument ab, sobald ein einziges unbekanntes Feld darin steht. Der Schritt
// "captured" schrieb neun Felder, die die Liste nicht kannte - also ging er
// jedes Mal verloren, mitsamt metrics und ratios.
//
// Nach aussen sah nichts kaputt aus. Der Trichter zaehlte weiter, weil der
// naechste Schritt wieder durchkam und den Stand mitzog. Nur die Messwerte,
// um die es bei einer Hautanalyse geht, kamen nie an.
//
// Ein Fehler, den niemand sieht, wird nicht bemerkt, sondern gefunden -
// deshalb dieser Test.

// Kommentarzeilen weg, bevor gesucht wird.
//
// Ohne das findet die Suche nur Schluessel, vor denen unmittelbar ein Komma
// steht - und in dieser Datei steht vor fast jedem Schluessel eine Erklaerung.
// Genau daran hat der Test beim ersten Versuch vorbeigeschaut: Er war gruen,
// obwohl ringAnteil in den Regeln fehlte. Ein Test, der den Fehler nicht
// findet, den er sucht, ist schlimmer als keiner.
function ohneKommentare(quelle) {
  return quelle.replace(/^[ \t]*\/\/.*$/gm, "");
}

const app = ohneKommentare(readFileSync(join(wurzel, "apps/lifeskin/lifeskin-app.js"), "utf8"));
const session = readFileSync(join(wurzel, "apps/lifeskin/lifeskin-session.js"), "utf8");
const regeln = readFileSync(join(wurzel, "firestore.rules"), "utf8");

// Die Feldliste aus lifeskinSessionShapeOk.
function erlaubteFelder() {
  const anfang = regeln.indexOf("function lifeskinSessionShapeOk()");
  assert.notEqual(anfang, -1, "lifeskinSessionShapeOk nicht gefunden");
  const hasOnly = regeln.indexOf("hasOnly([", anfang);
  const ende = regeln.indexOf("])", hasOnly);
  const block = regeln.slice(hasOnly, ende);
  return new Set([...block.matchAll(/"([a-zA-Z][a-zA-Z0-9_]*)"/g)].map((m) => m[1]));
}

// Alles, was schritt() und ergaenze() als Feld mitgeben.
function geschriebeneFelder() {
  const felder = new Set();
  // Was Sitzung.starte() immer selbst setzt.
  for (const fest of ["createdAt", "updatedAt", "step", "sprache", "source", "device"]) felder.add(fest);

  const aufrufe = [...app.matchAll(/sitzung\.(?:schritt|ergaenze)\(/g)];
  for (const treffer of aufrufe) {
    // Vom Aufruf bis zur schliessenden Klammer der Ebene - grob, aber es
    // reicht: gesucht sind nur Schluessel auf der obersten Ebene.
    let i = treffer.index + treffer[0].length;
    let tiefe = 1;
    let objekttiefe = 0;
    let stueck = "";
    while (i < app.length && tiefe > 0) {
      const z = app[i];
      if (z === "(") tiefe += 1;
      else if (z === ")") tiefe -= 1;
      else if (z === "{") { objekttiefe += 1; if (objekttiefe === 1) { i += 1; continue; } }
      else if (z === "}") objekttiefe -= 1;
      if (objekttiefe === 1) stueck += z;
      i += 1;
    }
    for (const m of stueck.matchAll(/(?:^|[,{\n])\s*([a-zA-Z][a-zA-Z0-9_]*)\s*:/g)) felder.add(m[1]);
  }
  return felder;
}

test("die Regeln kennen jedes Feld, das der Trichter schreibt", () => {
  const erlaubt = erlaubteFelder();
  const geschrieben = geschriebeneFelder();
  assert.ok(geschrieben.size > 10, `Zu wenige Felder gefunden (${geschrieben.size}) - die Suche greift nicht mehr`);

  const fehlend = [...geschrieben].filter((f) => !erlaubt.has(f)).sort();
  assert.deepEqual(
    fehlend,
    [],
    `Diese Felder schreibt der Trichter, aber firestore.rules weist sie ab.\n`
    + `hasOnly verwirft das ganze Dokument - der Schritt geht komplett verloren:\n  ${fehlend.join(", ")}`
  );
});

test("die Felder, um die es geht, sind wirklich dabei", () => {
  const erlaubt = erlaubteFelder();
  // Ohne diese beiden ist eine Hautanalyse keine.
  for (const feld of ["metrics", "ratios", "skinType", "findings", "photos"]) {
    assert.ok(erlaubt.has(feld), `${feld} fehlt in den Regeln`);
  }
});

test("jeder Schritt, den der Trichter kennt, ist in den Regeln erlaubt", () => {
  const ausSession = session.match(/const SCHRITTE = Object\.freeze\(\[([^\]]+)\]/);
  assert.ok(ausSession, "SCHRITTE nicht gefunden");
  const schritte = [...ausSession[1].matchAll(/"([a-z]+)"/g)].map((m) => m[1]);

  const anfang = regeln.indexOf("function lifeskinSessionShapeOk()");
  const stelle = regeln.indexOf("data.step in [", anfang);
  const ende = regeln.indexOf("]", stelle);
  const erlaubt = [...regeln.slice(stelle, ende).matchAll(/"([a-z]+)"/g)].map((m) => m[1]);

  assert.deepEqual(schritte, erlaubt, "Trichter und Regeln kennen nicht dieselben Schritte");
});

// ---------------------------------------------------------------------------
// Die andere Richtung: Marken, die Heart LIEST und niemand SCHREIBT
// ---------------------------------------------------------------------------
//
// Der Test oben haelt fest, dass jedes geschriebene Feld erlaubt ist. Die
// Gegenrichtung fehlte - und darin lag der zweite Fehler derselben Art:
//
// sahSchnitt, sahTherapie, sahPreis und kasseGeoeffnet stehen in den
// Regeln, Heart liest sie, zaehlt sie und zeichnet daraus die Lesetiefe -
// "wo im Bericht bleibt Geld liegen". Geschrieben hat sie nie eine Zeile.
// Sie konnten gar nichts anderes sein als "nein".
//
// Sichtbar war davon: Jeder Fall riss bei "Befund gelesen" ab, auch der,
// der bis zur Kasse gekommen war. Die ganze Lesetiefe stand auf null. Eine
// Zahl, die immer dasselbe sagt, sagt nichts - aber sie sieht aus wie eine
// Aussage, und danach werden Entscheidungen getroffen.
//
// Ein Fehler, den niemand sieht, wird nicht bemerkt, sondern gefunden.

const astra = ohneKommentare(readFileSync(join(wurzel, "apps/lifeskin-astra/astra.js"), "utf8"));
const heartRender = readFileSync(join(wurzel, "apps/mnyra-heart/heart-lifeskin-render.js"), "utf8");
const heartRechnung = readFileSync(join(wurzel, "apps/mnyra-heart/heart-lifeskin-berechnung.js"), "utf8");

// Die zehn Marken, die Heart zu jedem Fall anzeigt - aus der Quelle gelesen
// und nicht abgeschrieben. Waere sie hier abgeschrieben, ginge eine neue
// Marke genauso still verloren wie diese vier.
function markenDerFallansicht() {
  const anfang = heartRender.indexOf("const weg = [");
  assert.notEqual(anfang, -1, "Die Marken der Fallansicht sind nicht mehr auffindbar");
  const block = heartRender.slice(anfang, heartRender.indexOf("];", anfang));
  return [...block.matchAll(/sitzung\.([a-zA-Z][a-zA-Z0-9_]*)/g)].map((m) => m[1]);
}

test("jede Marke, die Heart anzeigt, wird von einer Seite auch geschrieben", () => {
  // Drei werden nicht geschrieben, sondern abgeleitet - aus Feldern, die es
  // wirklich gibt (siehe normalisiere in heart-lifeskin-berechnung.js).
  // hatTelefon kam dazu, als die Warteseite anfing, Nummern entgegen-
  // zunehmen: Geschrieben wird "phone", angezeigt wird, ob eine da ist.
  const abgeleitet = new Set(["hatBestellt", "hatAnschrift", "hatTelefon"]);
  for (const feld of abgeleitet) {
    assert.match(heartRechnung, new RegExp(`${feld}: `),
      `${feld} gilt als abgeleitet, wird aber nirgends abgeleitet`);
  }

  const quellen = `${app}\n${session}\n${astra}`;
  const tot = markenDerFallansicht()
    .filter((feld) => !abgeleitet.has(feld))
    .filter((feld) => !new RegExp(`\\b${feld}\\b`).test(quellen));

  assert.deepEqual(tot, [],
    `Heart zeigt diese Marken an, aber keine Seite schreibt sie - sie stehen fuer immer auf "nein": ${tot.join(", ")}`);
});

test("die Lesetiefe rechnet nicht mit Feldern, die nie ankommen", () => {
  // Dieselbe Pruefung fuer das Diagramm: Jede Marke darin muss von einer
  // Seite geschrieben oder nachweislich abgeleitet werden.
  const anfang = heartRechnung.indexOf("export const LESEMARKEN");
  const block = heartRechnung.slice(anfang, heartRechnung.indexOf("]);", anfang));
  const felder = [...block.matchAll(/id: "([a-zA-Z][a-zA-Z0-9_]*)"/g)].map((m) => m[1]);
  assert.ok(felder.length >= 5, "Die Lesemarken sind nicht mehr auffindbar");

  const quellen = `${app}\n${session}\n${astra}`;
  const tot = felder
    .filter((feld) => feld !== "hatBestellt")
    .filter((feld) => !new RegExp(`\\b${feld}\\b`).test(quellen));

  assert.deepEqual(tot, [],
    `Die Lesetiefe zaehlt Felder, die nie geschrieben werden: ${tot.join(", ")}`);
});

test("jede Marke wird hoechstens einmal geschrieben", () => {
  // Ein IntersectionObserver meldet bei jedem Scrollen zurueck und wieder
  // hin. Ohne Sperre waeren das Dutzende Firestore-Anfragen je Bericht -
  // auf einem Mobilnetz die teuerste Art, dieselbe Wahrheit zu wiederholen.
  assert.match(astra, /if \(!feld \|\| this\.markenGesetzt\?\.has\(feld\)\) return;/,
    "Dieselbe Marke wird mehrfach geschrieben");
  assert.match(astra, /beobachter\.unobserve\(eintrag\.target\)/,
    "Der Beobachter laeuft nach der ersten Meldung weiter");
});

test("die Lesemarken haengen nicht am Beobachter der Seitenleiste", () => {
  // Jener ist auf das Hervorheben im Inhaltsverzeichnis eingestellt
  // (-65 % unten). Wer daran dreht, wuerde sonst die Zahlen mitverschieben,
  // ohne es zu merken.
  assert.match(astra, /#lesemarken\(\)/, "Es gibt keinen eigenen Beobachter fuer die Marken");
  // Die METHODE, nicht die Aufrufstelle - die steht weiter oben im Ablauf.
  const anfang = astra.indexOf("#lesemarken() {");
  assert.notEqual(anfang, -1, "Die Methode #lesemarken ist nicht auffindbar");
  const marken = astra.slice(anfang, astra.indexOf("#navBeobachten() {", anfang));
  assert.ok(marken.length > 200, "Der Beobachter der Marken ist leer");
  assert.match(marken, /threshold: 0\.25/, "Vorbeiscrollen zaehlt als gesehen");
  assert.ok(!/rootMargin/.test(marken),
    "Die Marken uebernehmen die Einstellung der Seitenleiste");
});
