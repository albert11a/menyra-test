// Die Kaufleiste der Therapieseite auf dem iPhone.
//
// Drei Fehler lagen hier, alle drei vom Telefon gemeldet ("steht mitten im
// Bildschirm", "erscheint, wenn ich oben ueberscrolle"):
// 1. Versteckt war die Leiste nur 110 % unter die Unterkante geschoben -
//    rechnete iOS "unten" falsch, ragte sie ins Bild.
// 2. Der Trick "1 Punkt scrollen und zurueck" tat nichts, weil
//    html { scroll-behavior: smooth } jedes scrollTo sanft macht.
// 3. Nach der Rueckkehr aus einer anderen App wurde nichts neu gerechnet.
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { einPunktHinUndZurueck } from "../shared/lifeskin-unten.js";

const lies = (pfad) => readFileSync(new URL(`../${pfad}`, import.meta.url), "utf8");

function fenster(y, protokoll) {
  const dokument = { documentElement: { style: { scrollBehavior: "" } } };
  const f = {
    scrollX: 0,
    scrollY: y,
    scrollTo(x, ziel) {
      protokoll.push({ ziel, verhalten: dokument.documentElement.style.scrollBehavior });
      f.scrollY = ziel;
    }
  };
  return { f, dokument };
}

test("der Punkt hin und zurueck laeuft sofort, auch bei sanftem Scrollen", () => {
  const protokoll = [];
  const { f, dokument } = fenster(1500, protokoll);
  dokument.documentElement.style.scrollBehavior = "smooth";
  einPunktHinUndZurueck(f, dokument);
  assert.deepEqual(protokoll.map((p) => p.ziel), [1499, 1500], "nicht hin und wieder zurueck");
  assert.ok(protokoll.every((p) => p.verhalten === "auto"), "scrollTo lief sanft - dann rechnet iOS nichts neu");
  assert.equal(dokument.documentElement.style.scrollBehavior, "smooth", "das sanfte Scrollen der Seite ist danach weg");
  assert.equal(f.scrollY, 1500, "die Seite steht danach woanders");
});

test("ganz oben geht der Punkt nach unten, sonst passiert nichts", () => {
  const protokoll = [];
  const { f, dokument } = fenster(0, protokoll);
  einPunktHinUndZurueck(f, dokument);
  assert.deepEqual(protokoll.map((p) => p.ziel), [1, 0]);
});

test("versteckt heisst unsichtbar - nicht unter den Rand geschoben", () => {
  const css = lies("apps/lifeskin-verkauf/verkauf.css");
  const versteckt = css.slice(css.indexOf('.leiste[data-an="nein"] {'), css.indexOf("}", css.indexOf('.leiste[data-an="nein"] {')));
  assert.match(versteckt, /visibility: hidden/, "die versteckte Leiste ist sichtbar, sobald iOS 'unten' falsch rechnet");
  assert.match(versteckt, /opacity: 0/);
  assert.match(versteckt, /pointer-events: none/);
  assert.doesNotMatch(versteckt, /110%/, "wieder nur unter den Rand geschoben");
  assert.doesNotMatch(css, /--unten/, "die Rechnung mit innerHeight ist zurueck - sie verschob die Leiste auf iOS");
});

test("die Therapieseite rechnet auch nach der Rueckkehr aus einer anderen App neu", () => {
  const js = lies("apps/lifeskin-verkauf/terapia.js");
  assert.match(js, /untenNachziehenStarten\(\{\s*beimZurueckkommen: true/);
  const helfer = lies("shared/lifeskin-unten.js");
  assert.match(helfer, /visibilitychange/);
  assert.match(helfer, /pageshow/);
});
