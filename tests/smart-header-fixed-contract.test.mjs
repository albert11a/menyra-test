import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";

const html = readFileSync(new URL("../apps/menyra-social/index.html", import.meta.url), "utf8");
const controller = readFileSync(
  new URL("../apps/menyra-social/core/app-shell/app-shell-runtime-controller.js", import.meta.url),
  "utf8"
);
const css = html.replace(/\/\*[\s\S]*?\*\//g, " ");

const regelInhalt = (selektor) => {
  const start = css.indexOf(selektor);
  assert.notEqual(start, -1, `Regel fehlt: ${selektor}`);
  const auf = css.indexOf("{", start);
  const zu = css.indexOf("}", auf);
  return css.slice(auf + 1, zu);
};

// ===========================================================================
// Die Kopfzeile haengt am Bild, nicht am Scroll-Offset
//
// position: sticky wird aus dem Scroll-Offset gerechnet. Waehrend Chrome iOS
// seine Adressleiste ein- und ausfaehrt, verschiebt es die WebView nativ - fuer
// diese Bilder ist der Offset veraltet, und die Kopfzeile hinkt sichtbar
// hinterher. Auf dem Geraet stand dann ein Streifen Seiteninhalt ueber ihr,
// und zwar beim Scrollen NACH OBEN, weil die Leiste dann wieder ausfaehrt.
//
// position: fixed ist in WebKit viewport-gebunden: die Kopfzeile wird waehrend
// solcher Uebergaenge und waehrend des Overscroll-Gummibands an der Ansicht
// gehalten. Sie verschwindet damit auch beim Overscroll nicht mehr.
// ===========================================================================

test("die Kopfzeile steht fest am Bild", () => {
  const inhalt = regelInhalt(".smart-header-shell {");
  assert.match(inhalt, /position:\s*fixed/, "sie ist fixed");
  assert.doesNotMatch(inhalt, /position:\s*(-webkit-)?sticky/, "und nirgends mehr sticky");
  assert.match(inhalt, /top:\s*0/, "oben am Bild");
});

// Fest allein reichte nicht. Auf dem Geraet gemessen wanderte die Oberkante
// der fest stehenden Kopfzeile zwischen -247px und +138px - ein Element, das
// der Scrolling-Thread haelt, kann das nicht. Sie hing am Hauptthread, und der
// hinkt auf iOS beim Momentum-Scrollen mehrere Bilder hinterher.
test("sie bekommt eine eigene Compositing-Ebene erzwungen", () => {
  const inhalt = regelInhalt(".smart-header-shell {");
  assert.match(inhalt, /transform:\s*translateZ\(0\)/, "eigene Ebene erzwungen");
  assert.match(inhalt, /will-change:\s*transform/, "und vorher angesagt");
  assert.match(inhalt, /backface-visibility:\s*hidden/, "Schrift bleibt scharf");
  // Auf der Karte steht sie im Fluss - dort waere ein transform der
  // Bezugsrahmen fuer alles, was darauf fest steht.
  const karte = regelInhalt(".map-fixed-page-header .smart-header-shell {");
  assert.match(karte, /transform:\s*none/);
});

test("sie bleibt so breit und so zentriert wie die Seite darunter", () => {
  const inhalt = regelInhalt(".smart-header-shell {");
  // Links und rechts gesetzt, Breite auto, Raender auto: die max-width klemmt,
  // der Rest verteilt sich gleichmaessig - dieselbe Zentrierung wie mx-auto.
  assert.match(inhalt, /left:\s*var\(--safe-area-left\)/, "Safe-Area links mitgerechnet");
  assert.match(inhalt, /right:\s*var\(--safe-area-right\)/, "und rechts");
  assert.match(inhalt, /width:\s*auto/);
  assert.match(inhalt, /margin-left:\s*auto/);
  assert.match(inhalt, /margin-right:\s*auto/);
  assert.match(inhalt, /max-width:\s*var\(--app-shell-max-width/, "Breite kommt von der Huelle");
  // Die Variable muss es an der Huelle auch wirklich geben - fixed haengt am
  // Bild, erbt Custom Properties aber weiter ueber den DOM.
  assert.match(css, /\.app-shell\s*\{[^}]*--app-shell-max-width:\s*28rem/);
  assert.match(css, /\.app-shell--map\s*\{[^}]*--app-shell-max-width:\s*none/);
});

test("der Platzhalter haelt genau ihren Platz", () => {
  const inhalt = regelInhalt(".smart-header-spacer {");
  // Fest im CSS: Safe-Area-Polsterung + h-16 + die 1px Trennlinie.
  assert.match(inhalt, /height:\s*calc\(max\(0\.5rem,\s*var\(--smart-header-safe-top\)\)\s*\+\s*4rem\s*\+\s*1px\)/);
  // Er darf nie selbst Abstand erzeugen - sonst verschoebe er, was er halten soll.
  assert.doesNotMatch(inhalt, /(^|[;\s])(margin|padding)/, "er polstert nichts");
});

// DAS ist der Kern: an einem gemessenen Wert darf die Hoehe nicht haengen.
//
// --smart-header-top-height wird bei jedem Render neu gemessen, und die
// Kopfzeile wird hoeher, sobald die Location-Zeile aufklappt. Hing der
// Platzhalter daran, aenderte er mitten im Scrollen seine Hoehe: die ganze
// Seite darunter sprang, und die Beitraege mussten neu rechnen. Auf dem
// Geraet sah man die Kacheln blitzen.
test("die Hoehe des Platzhalters haengt an keinem gemessenen Wert", () => {
  const inhalt = regelInhalt(".smart-header-spacer {");
  assert.doesNotMatch(
    inhalt,
    /--smart-header-top-height|--smart-header-tabs-height|--smart-header-total-height/,
    "keine zur Laufzeit gemessene Groesse"
  );
});

test("beide Kopfzeilen-Zweige liefern den Platzhalter mit", () => {
  const treffer = controller.match(/\$\{renderSmartHeaderSpacer\(\)\}/g) || [];
  assert.equal(treffer.length, 2, "Business-Zweig und Haupt-Zweig");
  // Und er steht VOR der Kopfzeile, an genau ihrer alten Stelle.
  const spacerVorShell = /renderSmartHeaderSpacer\(\)\}\s*<div class="smart-header-shell/;
  const alleVor = controller.split("renderSmartHeaderSpacer()}").slice(1)
    .every((rest) => /^\s*<div class="smart-header-shell/.test(rest));
  assert.ok(spacerVorShell.test(controller) && alleVor, "immer direkt vor der Kopfzeile");
});

test("die Karte behaelt ihre Kopfzeile im Fluss", () => {
  // Dort ist die Kopfzeile Teil des Flex-Aufbaus, der die Karte den Rest
  // fuellen laesst. Ein fester Header wuerde die Karte unter sich schieben.
  const inhalt = regelInhalt(".map-fixed-page-header .smart-header-shell {");
  assert.match(inhalt, /position:\s*relative/);
  assert.match(css, /\.map-fixed-page-header \.smart-header-spacer\s*\{\s*display:\s*none/);
});
