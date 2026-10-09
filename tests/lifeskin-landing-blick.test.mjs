// Der erste Blick der Landingpage endet nicht mehr am Bildschirmrand:
// echte Vorher/Nachher-Faelle schauen herein, damit man weiterscrollt.
//
// SEIT 28.09. ZWEI FORMEN: /lifeskin traegt keine eigene Reihe mehr - die
// dokumentierten Faelle (mit Produkten und Preis) stehen selbst gleich
// unter dem Knopf, statt einmal oben als Reihe und zwei Abschnitte tiefer
// noch einmal. /lifeskin2 (apps/lifeskin-2) behaelt die Reihe; deren
// Tests pruefen deshalb diese Seite. Stilblatt und Skripte teilen sich
// beide.
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { RASTE_STANDARD } from "../shared/lifeskin-raste.js";

const lies = (pfad) => readFileSync(new URL(`../${pfad}`, import.meta.url), "utf8");
// Die Seite, die die Reihe noch traegt.
const MIT_REIHE = "apps/lifeskin-2/index.html";

test("der erste Blick: Inhalt oben, ein kleiner Fall quer, keine halbe Karte daneben", () => {
  const css = lies("apps/lifeskin-landing/landing.css");
  const regel = (wahl) => css.slice(css.indexOf(`\n${wahl} {`), css.indexOf("}", css.indexOf(`\n${wahl} {`)));
  const held = regel(".held");
  assert.doesNotMatch(held, /justify-content: center/, "der Inhalt steht wieder in der Mitte");
  assert.doesNotMatch(held, /min-height/, "der erste Blick fuellt wieder den Bildschirm - dann schaut nichts herein");
  const fall = regel(".blick__fall");
  assert.match(fall, /flex: 0 0 100%/, "neben dem Fall schaut wieder eine halbe Karte herein");
  assert.match(fall, /aspect-ratio: 2 \/ 1/, "der Fall ist nicht mehr klein und quer");
  assert.match(regel(".blick__bahn"), /gap: var\(--rand\)/, "die naechste Karte ragt in den Rand");
  assert.match(regel(".blick__bahn"), /scroll-snap-type: x mandatory/);
});

test("was beim Oeffnen unter dem ersten Blick schon im Bild ist, steht ohne Animation da", () => {
  const js = lies("apps/lifeskin-landing/landing.js");
  assert.match(js, /!stuecke\[j\]\.closest\("\.held"\) && stuecke\[j\]\.getBoundingClientRect\(\)\.top < fensterH/);
  assert.match(js, /classList\.add\("ein", "sofort"\)/);
  assert.match(lies("apps/lifeskin-landing/landing.css"), /\.js \[data-anim\]\.sofort \{ transition: none; \}/);
});

test("jede Haelfte hat ihr eigenes Schild", () => {
  const html = lies(MIT_REIHE);
  const reihe = html.slice(html.indexOf('id="blick"'), html.indexOf('id="pse"'));
  assert.equal((reihe.match(/class="blick__etiket" aria-hidden="true">PARA</g) || []).length, 4);
  assert.equal((reihe.match(/class="blick__etiket blick__etiket--pas" aria-hidden="true">PAS</g) || []).length, 4);
  assert.doesNotMatch(reihe, /PARA · PAS/);
});

test("kein Flackern: Bilder blenden erst ein, wenn feststeht, welche es sind", () => {
  const html = lies(MIT_REIHE);
  assert.match(html, /<div class="blick" data-wartet data-anim/);
  const css = lies("apps/lifeskin-landing/landing.css");
  assert.match(css, /\.js \.blick\[data-wartet\] \.blick__halb img \{ opacity: 0; \}/);
  const js = lies("apps/lifeskin-landing/raste.js");
  assert.match(js, /if \(blick && oben\.length && !wieImHtml\(oben\)\)/, "gleiche Faelle werden neu eingesetzt und laden noch einmal");
  const tausch = js.indexOf("blick.innerHTML = oben.map(blickFall)");
  assert.ok(tausch > -1);
  assert.ok(js.lastIndexOf("vorladen(r.para)", tausch) > -1, "getauscht wird, bevor die neuen Bilder da sind");
  assert.match(js, /setTimeout\(zeigen, 1800\)/);
  assert.match(lies("apps/lifeskin-landing/landing.js"), /\.blick\[data-wartet\]"\);\s*if \(reihe\) reihe\.removeAttribute\("data-wartet"\)/,
    "ohne Modul bliebe die Reihe leer");
});

test("die Faelle im HTML sind die Standardfaelle - sonst tauscht die Seite beim Laden", async () => {
  const { RASTE_STANDARD } = await import("../shared/lifeskin-raste.js");
  const html = lies(MIT_REIHE);
  const reihe = html.slice(html.indexOf('id="blick"'), html.indexOf('id="pse"'));
  const bilder = [...reihe.matchAll(/<img src="([^"]+)"/g)].map((m) => m[1]);
  assert.deepEqual(bilder, RASTE_STANDARD.flatMap((r) => [r.para, r.pas]));
  assert.equal((reihe.match(/loading="lazy"/g) || []).length, 4, "die zwei vorderen Faelle muessen sofort laden");
});

test("unter dem Knopf laufen die Faelle, zum Fall verlinkt", () => {
  const html = lies(MIT_REIHE);
  const held = html.slice(html.indexOf('id="held"'), html.indexOf('id="pse"'));
  assert.ok(held.indexOf('id="ls-start"') < held.indexOf('id="blick"'), "die Reihe steht nicht unter dem Knopf");
  const faelle = [...held.matchAll(/<a class="blick__fall" href="#rezultatet" data-blick="(\d+)"/g)].map((m) => m[1]);
  assert.deepEqual(faelle, ["1", "2", "3", "4"], "die Kennungen passen nicht zu den Faellen unten (data-rasti)");
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

test("Heart bestimmt, welche Faelle oben stehen - der Tipp findet den Fall ueber die Kennung", async () => {
  const { rastiNormalisieren, rasteFuer } = await import("../shared/lifeskin-raste.js");
  const liste = [
    { id: "a", landing: true, oben: false },
    { id: "b", landing: true },
    { id: "c", landing: false, oben: true }
  ].map(rastiNormalisieren);
  assert.equal(liste[1].oben, true, "Faelle von vorher verschwinden oben");
  assert.deepEqual(rasteFuer(liste, "oben").map((r) => r.id), ["b"], "oben ohne Landing oder abgeschaltet steht trotzdem da");
  assert.deepEqual(rasteFuer(liste, "landing").map((r) => r.id), ["a", "b"], "ein Fall nur ohne 'Oben' faellt unten weg");
  const html = lies(MIT_REIHE);
  for (const n of [1, 2, 3, 4]) assert.ok(html.includes(`data-rasti="${n}"`) && html.includes(`data-blick="${n}"`));
  assert.match(lies("apps/lifeskin-landing/landing.js"), /karten\[k\]\.getAttribute\("data-rasti"\) === kennung/);
  const js = lies("apps/lifeskin-landing/raste.js");
  assert.match(js, /data-blick="\$\{e\(r\.id\)\}"/);
  assert.match(js, /blick\.innerHTML = oben\.map\(blickFall\)/);
  const heart = lies("apps/mnyra-heart/heart-lifeskin-raste.js");
  assert.match(heart, /ort\("oben", "Oben"\)/);
  assert.match(heart, /data-rastifeld-an="oben"/);
  assert.match(lies("apps/mnyra-heart/heart.js"), /\["landing", "oben", "analiza", "shop"\]\.includes\(ort\)/);
});

// Approved compact revision replaces the old single-pair frame.
test("/lifeskin: analysis explanation precedes the swipeable comparison rail", () => {
  const html = lies("apps/lifeskin-landing/index.html");
  assert.ok(html.indexOf('id="hero-title"') < html.indexOf('id="pse"'));
  assert.ok(html.indexOf('id="pse"') < html.indexOf('id="rezultatet"'));
  assert.equal((html.match(/class="rail cases-rail"/g) || []).length, 1);
  assert.doesNotMatch(html, /id="rastet"|data:image|lf-screenshotcrop/);
});

test("/lifeskin: fallback pairs use compact frames without vertical letterboxes", () => {
  const html = lies("apps/lifeskin-landing/index.html");
  const comparison = html.slice(html.indexOf('id="cases"'), html.indexOf('class="gallery-bottom"'));
  assert.equal((comparison.match(/<img /g) || []).length, 8);
  for (const r of RASTE_STANDARD) {
    assert.ok(comparison.includes(r.para.replace(/\.jpg$/, '.webp')));
    assert.ok(comparison.includes(r.pas.replace(/\.jpg$/, '.webp')));
  }
  // Feste Rahmen, das Bild fuellt sie (object-fit: cover) - kein Balken
  // oben oder unten. Seit der freigegebenen Mobil-Fassung vom 09.10.
  // 263 px hoch, auf sehr kleinen Telefonen 238 px (vorher 168 px).
  const css = lies("apps/lifeskin-landing/redesign.css");
  assert.match(css, /#lf-preview \.pair\{display:flex;height:263px\}/);
  assert.match(css, /@media\(max-width:360px\)\{#lf-preview \.pair\{height:238px\}/);
  assert.match(css, /#lf-preview \.photo img\{display:block;width:100%;height:100%;object-fit:cover/);
  assert.match(css, /scroll-snap-type:x mandatory/);
});
