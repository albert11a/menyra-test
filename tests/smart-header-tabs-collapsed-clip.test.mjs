import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";

const html = readFileSync(new URL("../apps/menyra-social/index.html", import.meta.url), "utf8");

const regelInhalt = (selektor) => {
  const start = html.indexOf(selektor);
  assert.notEqual(start, -1, `Regel fehlt: ${selektor}`);
  const auf = html.indexOf("{", start);
  const zu = html.indexOf("}", auf);
  return html.slice(auf + 1, zu);
};

// Zugemacht hat die Zeile keine Hoehe - aber ihre Pill-Reihe hat sehr wohl
// eine. Ohne Beschneiden quillt sie heraus und liegt ohne jeden Abstand auf
// dem Text darunter: die Zeile ist "zu" und trotzdem zu sehen. Genau das ist
// schon einmal passiert, als das Beschneiden nur waehrend der Fahrt lag.
test("the closed row clips its pills instead of letting them spill onto the content", () => {
  const regel = regelInhalt("html.smart-header-tabs-collapsed .smart-header-tabs--main");
  assert.match(regel, /height:\s*0/, "zugemacht hat die Zeile keine Hoehe");
  assert.match(regel, /overflow:\s*hidden/, "und beschneidet, was darin steht");
});

// Waehrend der Fahrt ebenso - dort faehrt die Hoehe von 0 auf ihren Wert.
test("the gliding row clips while it moves", () => {
  const regel = regelInhalt("html.smart-header-tabs-animating .smart-header-tabs--main");
  assert.match(regel, /overflow:\s*hidden/);
  assert.match(regel, /transition:\s*height/);
});
