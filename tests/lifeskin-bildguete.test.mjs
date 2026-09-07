import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const wurzel = join(dirname(fileURLToPath(import.meta.url)), "..");
const app = readFileSync(join(wurzel, "apps/lifeskin/lifeskin-app.js"), "utf8");

// Die Aufnahmen sind das Einzige, worauf die ganze Analyse steht.
//
// Was hier an Bildpunkten verloren geht, kommt nie wieder: Eine Pore, die
// im Bild nicht aufgeloest ist, kann keine spaetere Rechnung
// zurueckholen. Diese Datei haelt die Stellen fest, an denen frueher
// stillschweigend verkleinert wurde.

test("die Kamera wird nach dem Maximum gefragt, nicht nach 1440", () => {
  // Frueher stand hier "ideal: 1440" - und damit war 1440 auch die
  // Obergrenze auf einem Geraet, das dreitausend haette liefern koennen.
  const stelle = app.indexOf("getUserMedia");
  const block = app.slice(stelle, stelle + 2400);
  const breite = block.match(/width:\s*\{\s*ideal:\s*(\d+)/);
  assert.ok(breite, "Keine Breitenforderung an die Kamera gefunden");
  assert.ok(Number(breite[1]) >= 2560,
    `Die Kamera wird nur nach ${breite[1]} Bildpunkten gefragt - das deckelt jedes bessere Geraet`);

  // Und es wird nachgefasst: Manche Geraete beachten "ideal" nur
  // halbherzig und liefern erst auf eine ausdrueckliche Untergrenze ihr
  // Bestes.
  assert.match(app, /applyConstraints/,
    "Es wird nicht nachgefasst - Geraete, die 'ideal' ignorieren, bleiben klein");
});

test("das Foto kommt aus dem Video, nicht aus der Messleinwand", () => {
  // Die Messleinwand ist gedeckelt, weil die Hautmessung jedes Bild Punkt
  // fuer Punkt ausliest. Kaeme das Foto von dort, waere es mitgedeckelt -
  // und genau das war es jahrelang.
  assert.match(app, /#fotoAusschnitt\(\)/, "Es gibt keinen eigenen Weg fuer das Foto");
  // Die Methodendefinition, nicht der Aufruf weiter oben.
  const stelle = app.indexOf("#fotoMerken(messleinwand, { frontal = false");
  const koerper = app.slice(stelle, app.indexOf("\n  }", stelle));
  assert.match(koerper, /#fotoAusschnitt\(\)/,
    "Das Foto wird weiterhin aus der Messleinwand kopiert und damit mitgedeckelt");
  assert.match(koerper, /quelle\.video/, "Es wird nicht aus dem Videobild gezeichnet");
});

test("die Messung ist gedeckelt, das Foto nicht", () => {
  const mess = app.match(/const MESS_HOECHSTBREITE = (\d+)/);
  assert.ok(mess, "Die Messleinwand hat keine Obergrenze - dann stockt der Ring auf grossen Geraeten");
  assert.equal(Number(mess[1]), 1440,
    "1440 ist die Grenze, ab der Poren und feine Linien messbar sind");

  const foto = app.match(/const FOTO_BREITE = (\d+)/);
  assert.ok(foto, "FOTO_BREITE fehlt");
  assert.equal(Number(foto[1]), 0, "Das Foto ist wieder gedeckelt - jeder Deckel ist verlorener Befund");
});

test("beim Ausweichen wird nicht halbiert und nie unter 1440 gegangen", () => {
  // Der alte Weg halbierte: Aus 2560 wurden 1280 - schlechter als vor
  // jeder Verbesserung. Jetzt geht es stufenweise herunter und endet dort,
  // wo die Messbarkeit endet.
  const breiten = app.match(/const FOTO_BREITEN = Object\.freeze\(\[([^\]]+)\]\)/);
  assert.ok(breiten, "Es gibt keine Ausweichbreiten");
  const werte = breiten[1].split(",").map((x) => Number(x.trim()));
  assert.deepEqual(werte, [...werte].sort((a, b) => b - a), "Die Breiten stehen nicht absteigend");
  assert.equal(Math.min(...werte), 1440, "Es wird unter 1440 ausgewichen - dort ist nichts mehr messbar");

  const stelle = app.indexOf("#kodiereSoGutWieMoeglich(foto)");
  const koerper = app.slice(stelle, app.indexOf("\n  }", stelle));
  assert.ok(!/\/ 2\b/.test(koerper), "Es wird wieder halbiert statt stufenweise verkleinert");
});

test("sechs Aufnahmen, und jede hat ihre eigene Richtung", () => {
  const block = app.match(/const FOTO_BLICKE = Object\.freeze\(\[([\s\S]*?)\]\)/);
  assert.ok(block, "FOTO_BLICKE fehlt");
  const blicke = [...block[1].matchAll(/blick:\s*"([a-z_]+)"/g)].map((m) => m[1]);
  // Fuenf auf dem Kreis plus "gerade", das nicht darauf liegt.
  assert.equal(blicke.length + 1, 6, `Es sind ${blicke.length + 1} Aufnahmen statt sechs`);
  assert.equal(new Set(blicke).size, blicke.length, "Zwei Richtungen tragen denselben Namen");
  // Die Kieferlinie ist der Grund fuer die Erweiterung: frontal liegt sie
  // im Schatten des eigenen Kiefers, im vollen Profil ist sie angeschnitten.
  assert.ok(blicke.includes("lart"), "Die Aufnahme mit angehobenem Kinn fehlt - die Kieferlinie bleibt ungesehen");
  assert.ok(blicke.includes("djathtas_lart") && blicke.includes("majtas_lart"),
    "Die beiden Halbprofile fehlen");
});

test("die Toleranz passt zur Zahl der Ziele", () => {
  // Fuenf Ziele liegen einen Achtelkreis auseinander. Mit der alten
  // Viertelkreis-Toleranz haette jede Aufnahme zu zwei Richtungen gepasst.
  const teiler = app.match(/const FOTO_TOLERANZ = Math\.PI \/ (\d+)/);
  assert.ok(teiler, "FOTO_TOLERANZ fehlt");
  assert.ok(Number(teiler[1]) >= 8,
    "Die Toleranz ist zu weit - benachbarte Richtungen ueberschneiden sich");

  // Und es wird das NAECHSTE Ziel genommen, nicht das erste passende.
  const stelle = app.indexOf("#blickAus({ frontal, stand })");
  const koerper = app.slice(stelle, app.indexOf("\n  }", stelle));
  assert.match(koerper, /abstand < bestes\.abweichung/,
    "Es wird das erste passende Ziel genommen - dann landet ein Halbprofil beim vollen Profil");
});

test("Heart kennt alle sechs Richtungen beim Namen", () => {
  // Ein Bild ohne Beschriftung sagt der Aerztin nicht, welche Wange sie
  // sieht. Und die alten Sitzungen duerfen nicht namenlos werden.
  const render = readFileSync(join(wurzel, "apps/mnyra-heart/heart-lifeskin-render.js"), "utf8");
  const block = app.match(/const FOTO_BLICKE = Object\.freeze\(\[([\s\S]*?)\]\)/);
  const blicke = [...block[1].matchAll(/blick:\s*"([a-z_]+)"/g)].map((m) => m[1]);
  for (const blick of ["gerade", ...blicke]) {
    assert.match(render, new RegExp(`\\b${blick}:`), `Heart hat keinen Namen fuer "${blick}"`);
    assert.match(render, new RegExp(`"${blick}"`), `Heart zeigt "${blick}" nicht an`);
  }
  for (const alt of ["rechts", "links"]) {
    assert.match(render, new RegExp(`\\b${alt}:`), `Die alte Richtung "${alt}" wurde namenlos`);
  }
});
