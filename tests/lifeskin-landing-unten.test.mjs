// DIE FESTE LEISTE UNTEN AUF /lifeskin STEHT NICHT MEHR MITTEN IM BILD.
//
// Gemeldet 28.09. (iPhone): Der Knopf "Zbuloni rutinën tuaj" samt der
// Still-Pille stand mitten im Bildschirm, Inhalt darunter - derselbe Fehler
// wie am 26.09. auf der Therapieseite. Dieselbe Ursache und dieselbe
// Loesung:
//
//   1. Kasse und Mittel-Blatt sind eigene Ansichten an der Stelle der
//      Seite (shared/lifeskin-ansicht.js), kein festes Fenster mit
//      Feldern und Scroll-Sperre darueber.
//   2. Versteckt heisst unsichtbar, nicht nur unter den Rand geschoben.
//   3. Das Nachrechnen fuer iOS scrollt SOFORT (die Seite scrollt sonst
//      sanft, und dann geschah im Moment des Aufrufs nichts) - auch nach
//      der Rueckkehr aus einer anderen App und beim Wechsel zurueck auf
//      die Landingpage.
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { einPunktHinUndZurueck } from "../shared/lifeskin-unten.js";

const lies = (pfad) => readFileSync(new URL(`../${pfad}`, import.meta.url), "utf8");
const CSS = lies("apps/lifeskin-landing/landing.css");
const SHOP = lies("apps/lifeskin-landing/shop.js");

const regel = (wahl) => {
  const start = CSS.indexOf(`\n${wahl} {`);
  return start < 0 ? "" : CSS.slice(start, CSS.indexOf("}", start));
};

test("Kasse und Mittel-Blatt oeffnen als Ansicht - ohne Scroll-Sperre", () => {
  assert.match(SHOP, /import \{ ansichtOeffnen, ansichtSchliessen \} from "\.\.\/\.\.\/shared\/lifeskin-ansicht\.js"/);
  assert.match(SHOP, /ansichtOeffnen\(blatt, "kasse"/);
  assert.match(SHOP, /ansichtOeffnen\(blatt, "mjeti"/);
  assert.doesNotMatch(SHOP, /shporta-hapur/, "die Scroll-Sperre ist wieder da");
  assert.doesNotMatch(CSS, /shporta-hapur/);
  // Waehrend eine Ansicht offen ist, sind Seite und Leiste weg.
  assert.match(CSS, /:root\[data-ansicht\] #lp,\n:root\[data-ansicht\] #dock \{ display: none !important; \}/);
  // Und die Ansicht selbst liegt nicht mehr fest ueber der Seite.
  const ansicht = CSS.slice(CSS.indexOf("\n.shporta,\n.mjetiblatt {"));
  assert.match(ansicht.slice(0, 500), /position: relative;/);
  assert.match(ansicht.slice(0, 500), /min-height: 100vh;/);
});

test("die Therapieseite nutzt dieselbe Ansicht weiter", () => {
  assert.match(lies("apps/lifeskin-verkauf/ansicht.js"), /from "\.\.\/\.\.\/shared\/lifeskin-ansicht\.js"/);
});

test("die versteckte Leiste ist unsichtbar, nicht nur geschoben", () => {
  assert.match(CSS, /\.dock:not\(\[data-sichtbar="ja"\]\) \.dock__leib \{ visibility: hidden; \}/);
  assert.match(CSS, /\.dock\[data-sichtbar="ja"\] \.dock__leib \{ visibility: visible;/);
  assert.match(regel(".dock"), /position: fixed/);
});

test("das Nachrechnen scrollt sofort und ruft sich auch nach der Rueckkehr auf", () => {
  const aufrufe = [];
  const fenster = { scrollX: 0, scrollY: 400, scrollTo: (o) => aufrufe.push(o) };
  einPunktHinUndZurueck(fenster);
  assert.deepEqual(aufrufe.map((a) => [a.top, a.behavior]), [[399, "instant"], [400, "instant"]],
    "sanft gescrollt geschieht im Moment des Aufrufs nichts");
  aufrufe.length = 0;
  einPunktHinUndZurueck({ ...fenster, scrollY: 0, scrollTo: (o) => aufrufe.push(o) });
  assert.deepEqual(aufrufe.map((a) => a.top), [1, 0]);
  const unten = lies("shared/lifeskin-unten.js");
  assert.match(unten, /addEventListener\("visibilitychange"/);
  assert.match(unten, /addEventListener\("pageshow"/);
  assert.match(unten, /attributeFilter: \["data-aktiv"\]/, "beim Zurueck auf die Landingpage wird nicht nachgerechnet");
  assert.match(lies("apps/lifeskin/lifeskin-app.js"), /untenNachziehenStarten\(\);/);
});

// ══ 28.09., ZWEITE MELDUNG: AUCH OHNE KASSE MITTEN IM BILD ════════════
// Leiste und Still-Pille standen um dieselbe Strecke zu hoch - beide an
// "bottom". iOS merkt sich nach der Tastatur (auch aus dem Trichter im
// selben Dokument) eine zu kleine Hoehe fuer alles Feste. Jetzt haengen
// beide oben und reichen 100dvh tief; dvh folgt der Tastatur nicht.
test("die Leiste haengt oben und ist ein Fenster hoch - nicht an bottom", () => {
  const dock = regel(".dock");
  assert.match(dock, /top: 0;/);
  assert.match(dock, /height: 100dvh;/);
  assert.match(dock, /justify-content: flex-end;/);
  assert.doesNotMatch(dock, /bottom: 0/, "die Leiste haengt wieder an der Hoehe, die iOS falsch behaelt");
  // Ein Kasten ueber das ganze Fenster darf keine Tipps abfangen.
  assert.match(CSS, /\.dock\[data-sichtbar="ja"\] \{ pointer-events: none; \}/);
  assert.match(CSS, /\.dock\[data-sichtbar="ja"\] \.dock__leib \{ pointer-events: auto; \}/);
  const still = lies("shared/lifeskin-still.js");
  assert.match(still, /"top:calc\(100dvh - 8px\)",\s*"transform:translateY\(-100%\)"/);
  assert.doesNotMatch(still, /"left:8px", "bottom:8px"/);
});
