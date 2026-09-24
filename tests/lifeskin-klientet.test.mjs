// KUNDENFOTOS ("Nga klientët tanë") auf der Therapieseite.
//
// Eine eigene Sparte im Befund: Dr. Gashi waehlt die Bilder einzeln.
// Keines gewaehlt - kein Abschnitt (reports/{id}.klientet).
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { KLIENTET, klientetFuerBericht } from "../shared/lifeskin-klientet.js";

const lies = (p) => fs.readFileSync(p, "utf8");
const HTML = lies("apps/lifeskin-verkauf/terapia.html");
const JS = lies("apps/lifeskin-verkauf/terapia.js");
const ADAPTER = lies("apps/mnyra-heart/heart-lifeskin-adapter.js");
const HEART = lies("apps/mnyra-heart/heart.js");

test("der Abschnitt steht vor dem Preis, ist versteckt und traegt jedes Bild der Liste", () => {
  const abschnitt = /<section class="pjese klientet" id="klientet"[^>]*>/.exec(HTML)?.[0] || "";
  assert.match(abschnitt, /\shidden>/, "Der Abschnitt ist ohne Wahl sichtbar");
  assert.ok(HTML.indexOf('id="klientet"') < HTML.indexOf('id="vendimi"'), "Er steht nicht vor dem Preis");
  for (const k of KLIENTET) {
    assert.ok(HTML.includes(`data-klienti="${k.id}"`), `${k.id} fehlt auf der Seite`);
    assert.ok(HTML.includes(k.text), `Der Text von ${k.id} weicht von der Liste ab`);
    assert.ok(fs.statSync(`.${k.bild}`).size < 150 * 1024, `${k.bild} ist zu gross`);
  }
});

test("welche Bilder ein Befund zeigt", () => {
  assert.deepEqual(klientetFuerBericht(undefined), []);
  assert.deepEqual(klientetFuerBericht([]), []);
  assert.deepEqual(klientetFuerBericht(["klienti-3", "klienti-1", "gibtsnicht", "klienti-3"]), ["klienti-3", "klienti-1"]);
  // Die erste Fassung war ein einziger Schalter: true heisst alle.
  assert.deepEqual(klientetFuerBericht(true), KLIENTET.map((k) => k.id));
});

test("die Seite zeigt nur die gewaehlten, und ohne Wahl nichts", () => {
  assert.match(JS, /klientetFuerBericht\(this\.daten\?\.klientet\)/);
  assert.match(JS, /zeigen\(\$\("#klientet"\), mitProdukten && klientet\.length > 0\)/);
});

test("Heart schreibt die Wahl mit der Freigabe", () => {
  assert.match(HEART, /klientet: \[\.\.\.document\.querySelectorAll\("\[data-befund-klienti\]:checked"\)\]/);
  assert.match(ADAPTER, /klientet: \(Array\.isArray\(klientet\) \? klientet : \[\]\)/);
});

test("im Befund eine eigene Sparte mit den Bildern zum Antippen", async () => {
  const { renderSitzungDetail } = await import("../apps/mnyra-heart/heart-lifeskin-render.js");
  const fall = { id: "k1", typ: "scan", photos: [], createdAt: new Date().toISOString() };
  const aus = renderSitzungDetail(fall, {}, "ready", [], { status: "wartet" });
  assert.match(aus, /data-klapp="fall:befund:klientet"/, "Keine eigene Sparte");
  assert.equal((aus.match(/data-befund-klienti value=/g) || []).length, KLIENTET.length);
  assert.doesNotMatch(aus, /data-befund-klienti value="[^"]+" checked/);
  const an = renderSitzungDetail(fall, {}, "ready", [], { status: "fertig", klientet: ["klienti-2"] });
  assert.match(an, /data-befund-klienti value="klienti-2" checked/);
  assert.doesNotMatch(an, /data-befund-klienti value="klienti-1" checked/);
});
