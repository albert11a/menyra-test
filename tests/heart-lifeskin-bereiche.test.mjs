// SKINREACT · LIFESKIN · ACNE DUO (02.10., Wunsch Inhaber).
//
// Unter dem Kopf drei Chips wie in "Faelle" (kaum gerundet). Lifeskin ist
// beim Oeffnen gewaehlt. Nach links wischen fuehrt zu Acne duo, nach
// rechts zu Skinreact - mit Bewegung.

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

import {
  BEREICHE, STANDARD_BEREICH, bereichGueltig, bereichNachbar, renderBereichChips
} from "../apps/mnyra-heart/heart-lifeskin-bereiche.js";
import { renderLifeskin } from "../apps/mnyra-heart/heart-lifeskin-render.js";
import { createHeartInitialState } from "../apps/mnyra-heart/heart-state.js";

const wurzel = join(dirname(fileURLToPath(import.meta.url)), "..");
const lies = (p) => readFileSync(join(wurzel, p), "utf8");

const GELADEN = { kennzahlen: { analysenHeute: 0 }, trichter: [], sitzungen: [], produkte: [], berichte: {} };
const chipsIn = (html) => [...html.matchAll(/data-action="lifeskin-bereich" data-wert="([^"]+)"/g)].map((m) => m[1]);
const gewaehlt = (html) => html.match(/heart-lifeskin-chip--an"\s+data-action="lifeskin-bereich" data-wert="([^"]+)"/)?.[1];

test("drei Bereiche in dieser Reihenfolge, Lifeskin ist Standard", () => {
  assert.deepEqual(BEREICHE.map((b) => b.label), ["Skinreact", "Lifeskin", "Acne duo"]);
  assert.equal(STANDARD_BEREICH, "lifeskin");
  assert.equal(bereichGueltig(undefined), "lifeskin");
  assert.equal(bereichGueltig("quatsch"), "lifeskin");
  assert.equal(bereichGueltig("acneduo"), "acneduo");
  // Ein frisch geoeffnetes Heart hat keinen Bereich gesetzt -> Lifeskin.
  assert.equal(bereichGueltig(createHeartInitialState().lifeskin?.bereich), "lifeskin");
});

test("links wischen -> Acne duo, rechts wischen -> Skinreact, am Rand nichts", () => {
  // richtung +1 = nach links gewischt (der rechte Nachbar kommt).
  assert.equal(bereichNachbar("lifeskin", 1), "acneduo");
  assert.equal(bereichNachbar("lifeskin", -1), "skinreact");
  assert.equal(bereichNachbar("skinreact", 1), "lifeskin");
  assert.equal(bereichNachbar("acneduo", -1), "lifeskin");
  assert.equal(bereichNachbar("acneduo", 1), null);
  assert.equal(bereichNachbar("skinreact", -1), null);
});

test("die Chips stehen oben in der Uebersicht - in der Form der Faelle-Chips", () => {
  const html = renderLifeskin(GELADEN);
  assert.deepEqual(chipsIn(html), ["skinreact", "lifeskin", "acneduo"]);
  assert.equal(gewaehlt(html), "lifeskin");
  assert.ok(html.includes("heart-lifeskin-kacheln"), "die Kacheln fehlen");
  assert.ok(html.indexOf("heart-bereich-chips") < html.indexOf("heart-lifeskin-kacheln"), "die Chips stehen nicht ganz oben");
  assert.match(renderBereichChips("lifeskin"), /class="heart-lifeskin-chips heart-lifeskin-chips--shop heart-bereich-chips"/);
  assert.match(html, /<div class="heart-bereich" data-bereich="lifeskin">/);
  // Auch beim Laden stehen sie schon da.
  assert.deepEqual(chipsIn(renderLifeskin({})), ["skinreact", "lifeskin", "acneduo"]);
  assert.match(renderLifeskin({}), /Wird geladen/);
});

test("Skinreact und Acne duo: eigener, noch leerer Bereich ohne die Lifeskin-Zahlen", () => {
  for (const [id, name] of [["skinreact", "Skinreact"], ["acneduo", "Acne duo"]]) {
    const html = renderLifeskin({ ...GELADEN, bereich: id });
    assert.equal(gewaehlt(html), id);
    assert.match(html, new RegExp(`data-bereich="${id}"`));
    assert.match(html, new RegExp(`Hier kommen bald die Zahlen von ${name}`));
    assert.doesNotMatch(html, /Fälle|Mehr anzeigen/);
  }
});

test("eine offene Akte steht weiter allein da - ohne Chips", () => {
  const html = renderLifeskin({ ...GELADEN, offen: "abc" });
  assert.deepEqual(chipsIn(html), []);
});

test("Heart: Tippen und Wischen sind verdrahtet, Lifeskin beim Oeffnen", () => {
  const heart = lies("apps/mnyra-heart/heart.js");
  assert.match(heart, /lifeskinBereich\(id\) \{/);
  assert.match(heart, /bindBereichWischen\(\{/);
  assert.match(heart, /if \(safeViewKey === "lifeskin"\) actions\.patchLifeskin\(\{ bereich: STANDARD_BEREICH \}\);/);
  assert.match(lies("apps/mnyra-heart/heart-events.js"), /action === "lifeskin-bereich"/);
  const css = lies("apps/mnyra-heart/heart.css");
  for (const regel of [".heart-bereich-chips {", "html.heart-wischt .heart-bereich {", "html.heart-wischt--gleitet .heart-bereich {", ".heart-bereich { touch-action: pan-y; }"]) {
    assert.ok(css.includes(regel), `${regel} fehlt`);
  }
  // Bewegt wird ueber <html>, nicht ueber ein style am Bereich: Heart
  // gleicht beim Neuzeichnen die Attribute ab (heart-morph.js).
  const modul = lies("apps/mnyra-heart/heart-lifeskin-bereiche.js");
  assert.match(modul, /document\.documentElement/);
  assert.match(modul, /addEventListener\("touchmove", bewegen, \{ passive: false \}\)/);
});
