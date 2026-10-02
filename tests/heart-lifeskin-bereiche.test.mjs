// SKINREACT · LIFESKIN · ACNE DUO (02.10., Wunsch Inhaber).
//
// Unter dem Kopf drei Chips wie in "Faelle" (kaum gerundet). Skinreact ist
// das bisherige Lifeskin (/lifeskin), Acne duo der bisherige Lifeskin Shop
// (/lifeskinshop), Lifeskin in der Mitte bekommt eigene Karten und ist beim
// Oeffnen gewaehlt. Nach links wischen fuehrt zu Acne duo, nach rechts zu
// Skinreact - mit Bewegung. Die Karten bleiben, wie sie waren.

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

import {
  BEREICHE, STANDARD_BEREICH, bereichGueltig, bereichNachbar, renderBereichChips, wegDesBereichs, bereichDesWegs
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
  // Ein frisch geoeffnetes Heart steht auf Lifeskin in der Mitte.
  assert.equal(createHeartInitialState().lifeskin?.bereich, "lifeskin");
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

test("Skinreact = /lifeskin, Acne duo = /lifeskinshop, Lifeskin ohne Weg", () => {
  assert.equal(wegDesBereichs("skinreact"), "");
  assert.equal(wegDesBereichs("acneduo"), "lifeskinshop");
  assert.equal(wegDesBereichs("lifeskin"), null);
  assert.equal(bereichDesWegs(""), "skinreact");
  assert.equal(bereichDesWegs("lifeskinshop"), "acneduo");
});

const SHOP = { id: "s-shop", createdAt: new Date().toISOString(), source: { weg: "lifeskinshop" } };
const ALT = { id: "s-alt", createdAt: new Date().toISOString(), source: {} };

test("die Chips stehen oben - in der Form der Faelle-Chips", () => {
  const html = renderLifeskin({ ...GELADEN, bereich: "lifeskin" });
  assert.deepEqual(chipsIn(html), ["skinreact", "lifeskin", "acneduo"]);
  assert.equal(gewaehlt(html), "lifeskin");
  assert.match(renderBereichChips("lifeskin"), /class="heart-lifeskin-chips heart-lifeskin-chips--shop heart-bereich-chips"/);
  assert.match(html, /<div class="heart-bereich" data-bereich="lifeskin">/);
  // Auch beim Laden stehen sie schon da.
  assert.deepEqual(chipsIn(renderLifeskin({ bereich: "lifeskin" })), ["skinreact", "lifeskin", "acneduo"]);
  assert.deepEqual(chipsIn(renderLifeskin({})), ["skinreact", "lifeskin", "acneduo"]);
  assert.match(renderLifeskin({ bereich: "skinreact" }), /Wird geladen/);
});

test("Lifeskin in der Mitte: eigene Flaeche, noch ohne die alten Karten", () => {
  const html = renderLifeskin({ ...GELADEN, bereich: "lifeskin" });
  assert.match(html, /Hier kommen die eigenen Lifeskin-Karten hin/);
  assert.doesNotMatch(html, /heart-lifeskin-kacheln|Mehr anzeigen/);
});

test("Skinreact zeigt die Karten von /lifeskin, Acne duo die von /lifeskinshop", () => {
  const daten = { ...GELADEN, sitzungen: [SHOP, ALT] };
  const skin = renderLifeskin({ ...daten, bereich: "skinreact", weg: "" });
  assert.equal(gewaehlt(skin), "skinreact");
  assert.ok(skin.includes("heart-lifeskin-kacheln"), "die Kacheln fehlen");
  assert.ok(skin.indexOf("heart-bereich-chips") < skin.indexOf("heart-lifeskin-kacheln"), "die Chips stehen nicht ganz oben");
  assert.match(skin, /Mehr anzeigen/);
  assert.doesNotMatch(skin, /renderShopHero|data-action="lifeskin-shopset"/);

  const shop = renderLifeskin({ ...daten, bereich: "acneduo", weg: "lifeskinshop" });
  assert.equal(gewaehlt(shop), "acneduo");
  assert.ok(shop.includes("heart-lifeskin-kacheln"), "die Kacheln fehlen");
  // Nur im Shop: die Sets des Ladens.
  assert.match(shop, /data-action="lifeskin-shopset"/);

  // Der Bereich entscheidet, auch wenn zustand.weg noch nachhinkt.
  const nachhinkend = renderLifeskin({ ...daten, bereich: "acneduo", weg: "" });
  assert.match(nachhinkend, /data-action="lifeskin-shopset"/);
});

test("ohne gesetzten Bereich gilt der Bereich des Wegs - der Weg bleibt", () => {
  const daten = { ...GELADEN, sitzungen: [SHOP, ALT] };
  assert.equal(gewaehlt(renderLifeskin(daten)), "skinreact");
  assert.equal(gewaehlt(renderLifeskin({ ...daten, weg: "lifeskinshop" })), "acneduo");
  assert.match(renderLifeskin({ ...daten, weg: "lifeskinshop" }), /data-action="lifeskin-shopset"/);
});

test("eine offene Akte steht weiter allein da - ohne Chips", () => {
  const html = renderLifeskin({ ...GELADEN, offen: "abc" });
  assert.deepEqual(chipsIn(html), []);
});

test("die Karten behalten ihre Abstaende: der Bereich traegt den Aufbau von .heart-lifeskin", () => {
  const css = lies("apps/mnyra-heart/heart.css");
  assert.match(css, /\.heart-lifeskin \{ display: flex; flex-direction: column; gap: 14px; \}/);
  assert.match(css, /\.heart-bereich \{ display: flex; flex-direction: column; gap: 14px;/);
  // Die Chips selbst ohne eigenen Aussenabstand - den macht das gap.
  assert.match(css, /\.heart-bereich-chips \{[^}]*margin: 0;/);
});

test("Heart: Tippen und Wischen setzen Bereich und Weg, Lifeskin beim Oeffnen", () => {
  const heart = lies("apps/mnyra-heart/heart.js");
  assert.match(heart, /lifeskinBereich\(id\) \{/);
  assert.match(heart, /function lifeskinBereichSetzen\(id, weg = wegDesBereichs\(id\)\)/);
  assert.match(heart, /wechseln\(id\) \{ lifeskinBereichSetzen\(id\); \}/);
  assert.match(heart, /: STANDARD_BEREICH;\n\s+lifeskinBereichSetzen\(bereich/);
  // Ein Fall oeffnet in seinem Bereich.
  assert.match(heart, /const ziel = bereichDesWegs\(wegDerSitzung\(fall\)\);/);
  assert.match(lies("apps/mnyra-heart/heart-events.js"), /action === "lifeskin-bereich"/);
  const css = lies("apps/mnyra-heart/heart.css");
  for (const regel of ["html.heart-wischt .heart-bereich {", "html.heart-wischt--gleitet .heart-bereich {"]) {
    assert.ok(css.includes(regel), `${regel} fehlt`);
  }
  // Bewegt wird ueber <html>, nicht ueber ein style am Bereich: Heart
  // gleicht beim Neuzeichnen die Attribute ab (heart-morph.js).
  const modul = lies("apps/mnyra-heart/heart-lifeskin-bereiche.js");
  assert.match(modul, /document\.documentElement/);
  assert.match(modul, /addEventListener\("touchmove", bewegen, \{ passive: false \}\)/);
});
