// KUNDENFOTOS ("Nga klientët tanë") auf der Therapieseite.
//
// Aus, bis Dr. Gashi sie im Befund einschaltet (bericht.klientet === true).
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const lies = (p) => fs.readFileSync(p, "utf8");
const HTML = lies("apps/lifeskin-verkauf/terapia.html");
const JS = lies("apps/lifeskin-verkauf/terapia.js");
const ADAPTER = lies("apps/mnyra-heart/heart-lifeskin-adapter.js");
const HEART = lies("apps/mnyra-heart/heart.js");

test("der Abschnitt steht vor dem Preis und ist versteckt", () => {
  const abschnitt = /<section class="pjese klientet" id="klientet"[^>]*>/.exec(HTML)?.[0] || "";
  assert.match(abschnitt, /\shidden>/, "Der Abschnitt ist ohne Schalter sichtbar");
  assert.ok(HTML.indexOf('id="klientet"') < HTML.indexOf('id="vendimi"'), "Er steht nicht vor dem Preis");
  assert.equal((HTML.match(/class="klienti"/g) || []).length, 4);
  for (let i = 1; i <= 4; i += 1) {
    assert.ok(fs.statSync(`apps/lifeskin-landing/fotot/klienti-${i}.jpg`).size < 150 * 1024, `klienti-${i}.jpg ist zu gross`);
  }
});

test("gezeigt nur, wenn der Befund es sagt", () => {
  assert.match(JS, /zeigen\(\$\("#klientet"\), mitProdukten && this\.daten\?\.klientet === true\)/);
});

test("Heart schreibt den Schalter mit der Freigabe", async () => {
  assert.match(ADAPTER, /klientet: klientet === true/);
  assert.match(HEART, /klientet: document\.querySelector\("\[data-befund-klientet\]"\)\?\.checked === true/);
  const { renderLifeskin } = await import("../apps/mnyra-heart/heart-lifeskin-render.js");
  assert.equal(typeof renderLifeskin, "function");
});

test("im Befund steht der Schalter - aus, ausser der Befund hat ihn an", async () => {
  const { renderSitzungDetail } = await import("../apps/mnyra-heart/heart-lifeskin-render.js");
  const fall = { id: "k1", typ: "scan", photos: [], createdAt: new Date().toISOString() };
  const aus = renderSitzungDetail(fall, {}, "ready", [], { status: "wartet" });
  assert.match(aus, /<input type="checkbox" data-befund-klientet \/>/);
  const an = renderSitzungDetail(fall, {}, "ready", [], { status: "fertig", klientet: true });
  assert.match(an, /<input type="checkbox" data-befund-klientet checked \/>/);
});
