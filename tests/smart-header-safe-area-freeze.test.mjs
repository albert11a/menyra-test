import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";

const html = readFileSync(new URL("../apps/menyra-social/index.html", import.meta.url), "utf8");
const ohneKommentare = html.replace(/\/\*[\s\S]*?\*\//g, " ").replace(/^\s*\/\/.*$/gm, " ");

const regelInhalt = (selektor) => {
  const start = ohneKommentare.indexOf(selektor);
  assert.notEqual(start, -1, `Regel fehlt: ${selektor}`);
  const auf = ohneKommentare.indexOf("{", start);
  const zu = ohneKommentare.indexOf("}", auf);
  return ohneKommentare.slice(auf + 1, zu);
};

// ===========================================================================
// Die Hoehe der Kopfzeile darf beim Scrollen nicht wandern
//
// viewport-fit=cover gilt hier bedingungslos, also hat
// env(safe-area-inset-top) auch im Browser-Tab einen Wert. iOS aendert ihn
// WAEHREND des Scrollens, sobald die Adressleiste ein- oder ausfaehrt. Hing
// die Polsterung der Kopfzeile direkt daran, aenderte sich mitten im Wischen
// ihre Hoehe - und was oben dazukam, hatte der Compositor auf seiner Ebene
// nicht gemalt. Auf dem Geraet stand dort ein Band, in dem der Seiteninhalt
// durchschien.
// ===========================================================================

test("die Kopfzeile polstert mit der eingefrorenen Safe-Area, nicht mit der lebenden", () => {
  const inhalt = regelInhalt(".smart-header-top");
  assert.match(inhalt, /padding-top:\s*max\(0\.5rem,\s*var\(--smart-header-safe-top\)\)/);
  assert.doesNotMatch(
    inhalt,
    /padding-top:[^;]*var\(--safe-area-top\)/,
    "die lebende Safe-Area darf die Hoehe nicht mehr bestimmen"
  );
});

test("ohne JS bleibt es beim alten Verhalten", () => {
  // Der Startwert zeigt auf die lebende Variable: laeuft das Boot-Skript nicht,
  // sieht die Kopfzeile genauso aus wie vorher.
  assert.match(
    ohneKommentare,
    /--smart-header-safe-top:\s*var\(--safe-area-top\)\s*;/,
    "der Startwert faellt auf --safe-area-top zurueck"
  );
});

test("gemessen wird beim Start und bei einer Drehung - sonst nie", () => {
  assert.match(ohneKommentare, /DOMContentLoaded",\s*friereSafeAreaTopEin/, "einmal beim Start");
  assert.match(ohneKommentare, /addEventListener\("orientationchange"/, "und nach einer Drehung");

  // Der Kern: an resize und visualViewport haengt es ausdruecklich NICHT.
  // Beide melden sich auf iOS mitten im Scrollen, sobald die Adressleiste
  // einfaehrt - also genau in dem Moment, den das hier verhindern soll.
  const bootSkript = ohneKommentare.slice(
    ohneKommentare.indexOf("const messeSafeAreaTop"),
    ohneKommentare.indexOf("scrollRestoration")
  );
  assert.ok(bootSkript.length > 0, "das Boot-Skript ist auffindbar");
  assert.doesNotMatch(bootSkript, /addEventListener\("resize"/, "kein resize");
  assert.doesNotMatch(bootSkript, /visualViewport/, "und schon gar kein visualViewport");
});

test("geschrieben wird nur bei echter Aenderung", () => {
  // Am <html> haengt der MutationObserver, der die Meta-Tags nachzieht.
  // setProperty schreibt das style-Attribut auch mit unveraendertem Wert neu.
  const block = ohneKommentare.slice(
    ohneKommentare.indexOf("const friereSafeAreaTopEin"),
    ohneKommentare.indexOf("__MENYRA_SOCIAL_FREEZE_SAFE_AREA_TOP__")
  );
  assert.match(block, /getPropertyValue\("--smart-header-safe-top"\)\s*===\s*wert\)\s*return/);
});
