// Der erste Blick der Landingpage endet nicht mehr am Bildschirmrand:
// echte Vorher/Nachher-Faelle schauen herein, damit man weiterscrollt.
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const lies = (pfad) => readFileSync(new URL(`../${pfad}`, import.meta.url), "utf8");

test("der erste Blick ist so hoch wie sein Inhalt und steht oben", () => {
  const css = lies("apps/lifeskin-landing/landing.css");
  const held = css.slice(css.indexOf("\n.held {"), css.indexOf("}", css.indexOf("\n.held {")));
  assert.doesNotMatch(held, /min-height/, "der erste Blick fuellt wieder genau einen Bildschirm");
  assert.doesNotMatch(held, /justify-content: center/, "der Inhalt steht wieder in der Mitte");
  assert.doesNotMatch(css, /\.held \{ min-height: calc\(100svh/);
});

test("unter dem Knopf laufen die Faelle - dieselben Dateien wie unten, zum Fall verlinkt", () => {
  const html = lies("apps/lifeskin-landing/index.html");
  const held = html.slice(html.indexOf('id="held"'), html.indexOf('id="pse"'));
  assert.ok(held.indexOf('id="ls-start"') < held.indexOf('id="blick"'), "die Reihe steht nicht unter dem Knopf");
  const faelle = [...held.matchAll(/<a class="blick__fall" href="#rezultatet" data-blick="(\d+)"/g)].map((m) => m[1]);
  assert.deepEqual(faelle, ["0", "1", "2", "3"]);
  for (const n of [1, 2, 3, 4]) {
    for (const d of [1, 28]) assert.ok(held.includes(`fotot/rasti-${n}-dita${d}.webp`) && html.lastIndexOf(`fotot/rasti-${n}-dita${d}.jpg`) > html.indexOf('id="rastet"'));
  }
  assert.match(lies("apps/lifeskin-landing/landing.js"), /closest\("\[data-blick\]"\)/);
});

test("aus Heart gepflegte Faelle ersetzen auch die Reihe oben", () => {
  const js = lies("apps/lifeskin-landing/raste.js");
  assert.match(js, /blick\.innerHTML = faelle\.map\(blickFall\)\.join\(""\)/);
  assert.match(js, /reihe\.hidden = true/, "ohne Faelle bliebe eine leere Reihe stehen");
});
