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
const gewaehlt = (html) => html.match(/class="heart-lifeskin-chips heart-lifeskin-chips--shop heart-bereich-chips"[^>]*data-gewaehlt="([^"]+)"/)?.[1];
// Das Element eines Bereichs (alle drei stehen im Markup).
function bereichHtml(html, id) {
  const start = html.lastIndexOf("<div", html.indexOf(`data-bereich="${id}"`));
  if (start < 0) return "";
  const re = /<\/?div\b/g;
  re.lastIndex = start;
  let tiefe = 0;
  for (let m = re.exec(html); m; m = re.exec(html)) {
    tiefe += m[0] === "<div" ? 1 : -1;
    if (tiefe === 0) return html.slice(start, m.index + 6);
  }
  return "";
}
const offenerBereich = (html) => html.match(/class="heart-bereich heart-bereich--an" data-bereich="([^"]+)"/)?.[1];

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
  assert.equal(offenerBereich(html), "lifeskin");
  // Auch beim Laden stehen sie schon da.
  assert.deepEqual(chipsIn(renderLifeskin({ bereich: "lifeskin" })), ["skinreact", "lifeskin", "acneduo"]);
  assert.deepEqual(chipsIn(renderLifeskin({})), ["skinreact", "lifeskin", "acneduo"]);
  assert.match(renderLifeskin({ bereich: "skinreact" }), /Wird geladen/);
});

test("Lifeskin in der Mitte: eigene Flaeche, noch ohne die alten Karten", () => {
  const mitte = bereichHtml(renderLifeskin({ ...GELADEN, bereich: "lifeskin" }), "lifeskin");
  assert.match(mitte, /Hier kommen die eigenen Lifeskin-Karten hin/);
  assert.doesNotMatch(mitte, /heart-lifeskin-kacheln|Mehr anzeigen/);
});

test("schnell wischen: alle drei Bereiche liegen fertig nebeneinander", () => {
  const html = renderLifeskin({ ...GELADEN, sitzungen: [SHOP, ALT], bereich: "skinreact", weg: "" });
  const reihe = [...html.matchAll(/data-bereich="([^"]+)"\s+data-morph-key="bereich-\1"/g)].map((m) => m[1]);
  assert.deepEqual(reihe, ["skinreact", "lifeskin", "acneduo"]);
  assert.equal(offenerBereich(html), "skinreact");
  // Der Inhalt jedes Bereichs traegt einen Fingerabdruck: Unveraendert
  // laesst Heart ihn beim Neuzeichnen in Ruhe.
  assert.equal((html.match(/<div data-morph-hash="[^"]+" class="heart-bereich__inhalt">/g) || []).length, 3);
  // Ein Wechsel aendert nur, welcher Bereich offen ist - nicht ihren Inhalt.
  const danach = renderLifeskin({ ...GELADEN, sitzungen: [SHOP, ALT], bereich: "acneduo", weg: "lifeskinshop" });
  const abdruecke = (h) => [...h.matchAll(/data-morph-hash="([^"]+)" class="heart-bereich__inhalt"/g)].map((m) => m[1]);
  assert.deepEqual(abdruecke(danach), abdruecke(html));
  // Der Nachbar Acne duo traegt schon seine eigenen Karten (die Sets des Ladens).
  assert.match(bereichHtml(html, "acneduo"), /data-action="lifeskin-shopset"/);
  // Ohne gesetzten Bereich (alte Aufrufe): nur einer.
  assert.equal((renderLifeskin({ ...GELADEN }).match(/data-morph-key="bereich-/g) || []).length, 1);
});

test("der nicht offene Bereich zeigt seine eigenen Live-Reihen (liveWege)", () => {
  const live = (gesamt) => ({ gesamt, leute: [], punkte: [{ id: "landing", label: "Landing", anzahl: gesamt, aktiv: gesamt > 0 }] });
  const html = renderLifeskin({ ...GELADEN, bereich: "skinreact", weg: "",
    live: { analysen: live(1), bestellungen: live(0) },
    liveWege: { lifeskin: { analysen: live(1), bestellungen: live(0) }, lifeskinshop: { shop: live(7), trichter: live(0), analyse: live(0) } } });
  assert.ok(bereichHtml(html, "acneduo").includes("heart-live"), "Acne duo ohne Live-Karte");
  assert.notEqual(bereichHtml(html, "acneduo"), bereichHtml(html, "skinreact"));
});

test("Skinreact zeigt die Karten von /lifeskin, Acne duo die von /lifeskinshop", () => {
  const daten = { ...GELADEN, sitzungen: [SHOP, ALT] };
  const skin = bereichHtml(renderLifeskin({ ...daten, bereich: "skinreact", weg: "" }), "skinreact");
  assert.ok(skin.includes("heart-lifeskin-kacheln"), "die Kacheln fehlen");
  assert.match(skin, /Mehr anzeigen/);
  assert.doesNotMatch(skin, /renderShopHero|data-action="lifeskin-shopset"/);

  const shopGanz = renderLifeskin({ ...daten, bereich: "acneduo", weg: "lifeskinshop" });
  assert.equal(gewaehlt(shopGanz), "acneduo");
  assert.equal(offenerBereich(shopGanz), "acneduo");
  const shop = bereichHtml(shopGanz, "acneduo");
  assert.ok(shop.includes("heart-lifeskin-kacheln"), "die Kacheln fehlen");
  // Nur im Shop: die Sets des Ladens.
  assert.match(shop, /data-action="lifeskin-shopset"/);

  // Der Bereich entscheidet, auch wenn zustand.weg noch nachhinkt.
  const nachhinkend = bereichHtml(renderLifeskin({ ...daten, bereich: "acneduo", weg: "" }), "acneduo");
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
  assert.match(css, /\.heart-bereich__inhalt \{ display: flex; flex-direction: column; gap: 14px;/);
  // Die Chips selbst ohne eigenen Aussenabstand - den macht das gap.
  assert.match(css, /\.heart-bereich-chips \{[^}]*margin: 0;/);
});

test("Heart: Tippen und Wischen setzen Bereich und Weg, Lifeskin beim Oeffnen", () => {
  const heart = lies("apps/mnyra-heart/heart.js");
  assert.match(heart, /lifeskinBereich\(id\) \{/);
  assert.match(heart, /bereichSpringen\(jetzt, bereichGueltig\(id\), \(b\) => lifeskinBereichSetzen\(b\)\)/);
  // Nach jedem Zeichnen wird das Bild auf den Zustand gebracht.
  assert.match(heart, /bereichAbgleichen\(bereichGueltig\(state\.lifeskin\?\.bereich\)\)/);
  // Live auch fuer den Bereich, der nicht offen ist.
  assert.match(heart, /actions\.patchLifeskin\(\{ live: stand, liveWege \}\);/);
  assert.match(heart, /function lifeskinBereichSetzen\(id, weg = wegDesBereichs\(id\)\)/);
  assert.match(heart, /wechseln\(id\) \{ lifeskinBereichSetzen\(id\); \}/);
  assert.match(heart, /: STANDARD_BEREICH;\n\s+lifeskinBereichSetzen\(bereich/);
  // Ein Fall oeffnet in seinem Bereich.
  assert.match(heart, /const ziel = bereichDesWegs\(wegDerSitzung\(fall\)\);/);
  assert.match(lies("apps/mnyra-heart/heart-events.js"), /action === "lifeskin-bereich"/);
  const css = lies("apps/mnyra-heart/heart.css");
  for (const regel of [
    ".heart-bereich:not(.heart-bereich--an),\nhtml[data-heart-bereich] .heart-bereich {", "content-visibility: hidden;",
    'html[data-heart-bereich="acneduo"] .heart-bereich[data-bereich="acneduo"] {',
    'html[data-heart-bereich="acneduo"] .heart-bereich-chips [data-wert="acneduo"],',
    "html.heart-wischt .heart-bereiche__band {", "html.heart-wischt--gleitet .heart-bereiche__band {"
  ]) {
    assert.ok(css.includes(regel), `${regel} fehlt`);
  }
  // Bewegt wird ueber <html>, nicht ueber ein style am Bereich: Heart
  // gleicht beim Neuzeichnen die Attribute ab (heart-morph.js).
  const modul = lies("apps/mnyra-heart/heart-lifeskin-bereiche.js");
  assert.match(modul, /document\.documentElement/);
  assert.match(modul, /addEventListener\("touchmove", bewegen, \{ passive: false \}\)/);
  // Ein neuer Wisch wartet nicht auf das Gleiten des vorigen.
  assert.match(modul, /gleitenBeenden\(\);\n\s+const stand = lesen\?\.\(\);/);
  // Der Wechsel steht sofort im Bild; gemerkt wird, wenn nicht mehr gewischt wird.
  assert.match(modul, /function tauschen\(wechseln, ziel\) \{[\s\S]*?bereichZeigen\(ziel\);[\s\S]*?merken\(wechseln, ziel\);/);
});
