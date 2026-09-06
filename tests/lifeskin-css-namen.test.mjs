import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const wurzel = join(dirname(fileURLToPath(import.meta.url)), "..");

// Ein Name, zwei Bedeutungen - und die zweite gewinnt.
//
// GEMESSEN, NICHT GESCHAETZT: ".lb-frage" hiess seit jeher die Frage ueber
// dem WhatsApp-Knopf auf der Warteseite. Als derselbe Name spaeter fuer das
// runde Fragezeichen am Befund vergeben wurde, schrumpfte der Absatz auf
// achtzehn Pixel Breite und lief quer ueber den Knopf. Kein Test hat das
// gesehen, kein Bau hat gewarnt - es fiel erst auf dem Telefon auf.
//
// Zwei nackte Bloecke fuer denselben Klassennamen in EINER Datei sind
// praktisch immer ein Versehen. Zustaende (:hover), Abwandlungen (--klein)
// und Abfragen nach Fenstergroesse sind ausgenommen: Die sind Absicht.

const DATEIEN = [
  "apps/lifeskin-bericht/bericht.css",
  "apps/lifeskin/lifeskin-styles.css"
];

function nackteKlassenbloecke(css) {
  // Alles innerhalb von @media und Kommentaren weg - dort ist eine
  // Wiederholung gewollt.
  const ohneKommentare = css.replace(/\/\*[\s\S]*?\*\//g, "");
  let tiefe = 0;
  let ausserhalb = "";
  for (let i = 0; i < ohneKommentare.length; i++) {
    const zeichen = ohneKommentare[i];
    if (zeichen === "@") {
      // Bis zur zugehoerigen schliessenden Klammer ueberspringen.
      const auf = ohneKommentare.indexOf("{", i);
      if (auf < 0) break;
      let stand = 1, j = auf + 1;
      while (j < ohneKommentare.length && stand > 0) {
        if (ohneKommentare[j] === "{") stand++;
        else if (ohneKommentare[j] === "}") stand--;
        j++;
      }
      i = j - 1;
      continue;
    }
    if (zeichen === "{") tiefe++;
    else if (zeichen === "}") tiefe--;
    else if (tiefe === 0) ausserhalb += zeichen;
    if (zeichen === "{" && tiefe === 1) ausserhalb += "{";
  }

  // Nur der nackte Block: EINE Klasse allein vor der Klammer. Eine
  // gemeinsame Regel ("a, b { flex: none }") ist Absicht und darf sich
  // wiederholen; ein zweiter Block fuer denselben einzelnen Namen ist es
  // fast nie.
  const zaehler = new Map();
  for (const treffer of ausserhalb.matchAll(/([^{};]+)\{/g)) {
    const rein = treffer[1].trim();
    if (!/^\.[a-z0-9-]+$/i.test(rein)) continue;
    zaehler.set(rein, (zaehler.get(rein) || 0) + 1);
  }
  return [...zaehler].filter(([, n]) => n > 1).map(([name, n]) => `${name} (${n}x)`);
}

for (const datei of DATEIEN) {
  test(`kein Klassenname wird in ${datei} zweimal vergeben`, () => {
    const css = readFileSync(join(wurzel, datei), "utf8");
    assert.deepEqual(
      nackteKlassenbloecke(css),
      [],
      "Diese Namen tragen zwei verschiedene Bedeutungen. Die spaetere gewinnt "
      + "und macht die fruehere kaputt - genau so lief ein ganzer Absatz "
      + "einmal quer ueber den WhatsApp-Knopf."
    );
  });
}

// Und der Fall selbst, als Merkposten.
test("die Frage auf der Warteseite und das Fragezeichen am Befund sind zweierlei", () => {
  const css = readFileSync(join(wurzel, "apps/lifeskin-bericht/bericht.css"), "utf8");
  const markup = readFileSync(join(wurzel, "apps/lifeskin-bericht/index.html"), "utf8");
  const js = readFileSync(join(wurzel, "apps/lifeskin-bericht/bericht.js"), "utf8");

  // Der Absatz behaelt seinen alten Namen ...
  assert.match(markup, /<p class="lb-frage" id="lb-benachrichtigen">/,
    "Die Frage ueber dem WhatsApp-Knopf hat ihren Namen verloren");
  assert.match(css, /\.lb-frage\s*\{[^}]*font-size/,
    "Die Frage ist kein Textabsatz mehr");

  // ... und die Knoepfe tragen einen eigenen.
  assert.ok(!/class="lb-frage"[^>]*data-info/.test(markup + js),
    "Ein Hilfeknopf traegt wieder den Namen des Absatzes");
  assert.match(css, /\.lb-hilfe\s*\{[^}]*border-radius:\s*50%/,
    "Der Hilfeknopf ist nicht mehr rund - der Name stimmt nicht");
});
