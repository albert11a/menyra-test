// Der erste Blick der Landingpage endet nicht mehr am Bildschirmrand:
// echte Vorher/Nachher-Faelle schauen herein, damit man weiterscrollt.
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const lies = (pfad) => readFileSync(new URL(`../${pfad}`, import.meta.url), "utf8");

test("der erste Blick endet in den Faellen: Inhalt oben, Reihe fuellt bis unter die Kante", () => {
  const css = lies("apps/lifeskin-landing/landing.css");
  const regel = (wahl) => css.slice(css.indexOf(`\n${wahl} {`), css.indexOf("}", css.indexOf(`\n${wahl} {`)));
  const held = regel(".held");
  assert.doesNotMatch(held, /justify-content: center/, "der Inhalt steht wieder in der Mitte");
  assert.match(held, /min-height: calc\(100vh - var\(--kopf-h\) - env\(safe-area-inset-top\) \+ 56px\)/,
    "die Reihe reicht nicht mehr unter die Kante - dann steht 'Si funksionon' im ersten Bild");
  assert.match(css, /\.held \{ min-height: calc\(100svh - var\(--kopf-h\) - env\(safe-area-inset-top\) \+ 56px\); \}/);
  assert.match(regel(".blick"), /flex: 1 0 auto/);
  assert.match(regel(".blick__bahn"), /flex: 1 0 190px/);
  assert.match(regel(".blick__halb img"), /position: absolute/, "die Bilder bestimmen wieder die Hoehe");
});

test("jede Haelfte hat ihr eigenes Schild, oben", () => {
  const html = lies("apps/lifeskin-landing/index.html");
  const reihe = html.slice(html.indexOf('id="blick"'), html.indexOf('id="pse"'));
  assert.equal((reihe.match(/class="blick__etiket" aria-hidden="true">PARA</g) || []).length, 4);
  assert.equal((reihe.match(/class="blick__etiket blick__etiket--pas" aria-hidden="true">PAS</g) || []).length, 4);
  assert.doesNotMatch(reihe, /PARA · PAS/);
  const css = lies("apps/lifeskin-landing/landing.css");
  assert.match(css.slice(css.indexOf("\n.blick__etiket {")), /^[\s\S]*?top: 8px/);
});

test("kein Flackern: Bilder blenden erst ein, wenn feststeht, welche es sind", () => {
  const html = lies("apps/lifeskin-landing/index.html");
  assert.match(html, /<div class="blick" data-wartet data-anim/);
  const css = lies("apps/lifeskin-landing/landing.css");
  assert.match(css, /\.js \.blick\[data-wartet\] \.blick__halb img \{ opacity: 0; \}/);
  const js = lies("apps/lifeskin-landing/raste.js");
  assert.match(js, /if \(blick && !wieImHtml\(faelle\)\)/, "gleiche Faelle werden neu eingesetzt und laden noch einmal");
  const tausch = js.indexOf("blick.innerHTML = faelle.map(blickFall)");
  assert.ok(js.lastIndexOf("vorladen(r.para)", tausch) > -1, "getauscht wird, bevor die neuen Bilder da sind");
  assert.match(js, /setTimeout\(zeigen, 1800\)/);
  assert.match(lies("apps/lifeskin-landing/landing.js"), /\.blick\[data-wartet\]"\);\s*if \(reihe\) reihe\.removeAttribute\("data-wartet"\)/,
    "ohne Modul bliebe die Reihe leer");
});

test("die Faelle im HTML sind die Standardfaelle - sonst tauscht die Seite beim Laden", async () => {
  const { RASTE_STANDARD } = await import("../shared/lifeskin-raste.js");
  const html = lies("apps/lifeskin-landing/index.html");
  const reihe = html.slice(html.indexOf('id="blick"'), html.indexOf('id="pse"'));
  const bilder = [...reihe.matchAll(/<img src="([^"]+)"/g)].map((m) => m[1]);
  assert.deepEqual(bilder, RASTE_STANDARD.flatMap((r) => [r.para, r.pas]));
  assert.equal((reihe.match(/loading="lazy"/g) || []).length, 4, "die zwei vorderen Faelle muessen sofort laden");
});

test("unter dem Knopf laufen die Faelle, zum Fall verlinkt", () => {
  const html = lies("apps/lifeskin-landing/index.html");
  const held = html.slice(html.indexOf('id="held"'), html.indexOf('id="pse"'));
  assert.ok(held.indexOf('id="ls-start"') < held.indexOf('id="blick"'), "die Reihe steht nicht unter dem Knopf");
  const faelle = [...held.matchAll(/<a class="blick__fall" href="#rezultatet" data-blick="(\d+)"/g)].map((m) => m[1]);
  assert.deepEqual(faelle, ["0", "1", "2", "3"]);
  assert.match(lies("apps/lifeskin-landing/landing.js"), /closest\("\[data-blick\]"\)/);
});

test("aus Heart gepflegte Faelle ersetzen auch die Reihe oben", async () => {
  const { blickFall } = await import("../apps/lifeskin-landing/raste.js");
  const vorn = blickFall({ para: "/apps/lifeskin-landing/fotot/rasti-1-dita1.jpg", pas: "data:image/jpeg;base64,x", emri: "<b>", gjetja: "y" }, 0);
  assert.doesNotMatch(vorn, /loading="lazy"/);
  assert.match(vorn, /aria-label="&lt;b&gt;: y, para dhe pas 28 ditësh"/);
  assert.match(blickFall({ para: "/a.jpg", pas: "/b.jpg" }, 2), /loading="lazy"/);
  const js = lies("apps/lifeskin-landing/raste.js");
  assert.match(js, /reihe\.hidden = true/, "ohne Faelle bliebe eine leere Reihe stehen");
});
