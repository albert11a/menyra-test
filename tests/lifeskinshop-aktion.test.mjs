// LIFESKIN SHOP - AKTION HEUTE (08.10., Inhaber): echter Normalpreis
// 2 x 29 = 58 EUR, bis 24:00 fuer 25 EUR, echtes Lager von 2 Sets.
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const lies = (p) => readFileSync(new URL(`../${p}`, import.meta.url), "utf8");

test("Restzeit und Lagertext", async () => {
  const { restzeit, lagerText } = await import("../apps/lifeskin-shop/aktion.js");
  assert.equal(restzeit(10_000_000, 0), "02:46:40");
  assert.equal(restzeit(0, 5), "00:00:00");
  assert.match(lagerText(2).html, /Vetëm edhe <b>2 sete<\/b> në stok/);
  assert.match(lagerText(1).html, /Vetëm edhe <b>1 set<\/b> në stok/);
  assert.deepEqual(lagerText(0), { leer: true, html: "Shitur – setet e radhës vijnë së shpejti" });
});

test("Lager zaehlt nur echte Laden-Bestellungen seit Beginn", async () => {
  const { istLagerBestellung, restSete, LAGER_START } = await import("../api/lifeskin-lager.js");
  const s = (o) => ({ order: { mapValue: { fields: Object.fromEntries(Object.entries(o).map(([k, v]) => [k, typeof v === "boolean" ? { booleanValue: v } : { stringValue: v }])) } } });
  const ab = LAGER_START.ab;
  assert.equal(istLagerBestellung(s({ burimi: "lifeskinshop", createdAt: "2026-10-08T18:00:00.000Z" }), ab), true);
  assert.equal(istLagerBestellung(s({ burimi: "lifeskinshop", createdAt: "2026-10-08T10:00:00.000Z" }), ab), false, "vor der Aktion");
  assert.equal(istLagerBestellung(s({ burimi: "lifeskinshop", createdAt: "2026-10-08T18:00:00.000Z", still: true }), ab), false, "stiller Modus");
  assert.equal(istLagerBestellung(s({ burimi: "befund", createdAt: "2026-10-08T18:00:00.000Z" }), ab), false, "nicht aus dem Laden");
  const test = { ...s({ burimi: "lifeskinshop", createdAt: "2026-10-08T18:00:00.000Z" }), source: { mapValue: { fields: { utmCampaign: { stringValue: "test" } } } } };
  assert.equal(istLagerBestellung(test, ab), false, "Testbestellung");
  assert.equal(LAGER_START.sete, 2);
  assert.deepEqual([restSete(0), restSete(1), restSete(2), restSete(5)], [2, 1, 0, 0]);
});

function fakeDok() {
  const els = {};
  const el = (id, extra = {}) => (els[id] = { id, hidden: false, textContent: "", innerHTML: "", dataset: {}, attrs: new Set(),
    toggleAttribute(n, an) { an ? this.attrs.add(n) : this.attrs.delete(n); }, ...extra });
  el("aktion", { dataset: { aktionBis: "2026-10-08T23:59:59+02:00" } });
  el("aktion-mbetur"); el("aktion-stok", { hidden: true }); el("aktion-stok-tekst");
  const knopf = { disabled: false, dataset: {} };
  return { els, knopf, getElementById: (id) => els[id], querySelectorAll: () => [knopf], addEventListener() {} };
}

test("bei 0 Sets: Shitur und Kaufknoepfe gesperrt; nach 24:00 verschwindet alles", async () => {
  const { aktionStarten } = await import("../apps/lifeskin-shop/aktion.js");
  const dok = fakeDok();
  let jetzt = Date.parse("2026-10-08T20:00:00Z");
  const holen = async () => ({ ok: true, json: async () => ({ ok: true, sete: 0 }) });
  const a = aktionStarten({ dok, jetzt: () => jetzt, holen });
  await a.lager();
  assert.equal(dok.els["aktion-mbetur"].textContent, "01:59:59");
  assert.equal(dok.els["aktion-stok"].hidden, false);
  assert.ok(dok.els["aktion-stok"].attrs.has("data-leer"));
  assert.equal(dok.knopf.disabled, true);
  jetzt = Date.parse("2026-10-08T22:00:00Z");
  a.ticken();
  assert.equal(dok.els.aktion.hidden, true);
  assert.equal(dok.knopf.disabled, false, "nach der Aktion wieder kaufbar");
  a.stopp();
});

test("ohne Antwort vom Lager keine Lagerzeile; nach Ablauf gar kein Block", async () => {
  const { aktionStarten } = await import("../apps/lifeskin-shop/aktion.js");
  const dok = fakeDok();
  const a = aktionStarten({ dok, jetzt: () => Date.parse("2026-10-08T20:00:00Z"), holen: async () => ({ ok: false }) });
  await a.lager();
  assert.equal(dok.els["aktion-stok"].hidden, true);
  assert.equal(dok.knopf.disabled, false);
  a.stopp();
  const spaet = fakeDok();
  assert.equal(aktionStarten({ dok: spaet, jetzt: () => Date.parse("2026-10-09T08:00:00Z") }), null);
  assert.equal(spaet.els.aktion.hidden, true);
});

test("HTML: echte Angaben, Ende heute 24:00 Kosovo, kein Pixel im Aktionscode", () => {
  const html = lies("apps/lifeskin-shop/index.html");
  assert.match(html, /data-aktion-bis="2026-10-08T23:59:59\+02:00"/);
  assert.match(html, /Çmimi normal: 2 produkte × 29 € = 58 €/);
  assert.match(html, /<del>58 €<\/del>/);
  assert.match(html, /id="aktion-stok" hidden/);
  assert.match(html, /<script type="module" src="\/apps\/lifeskin-shop\/aktion\.js"><\/script>/);
  for (const datei of ["apps/lifeskin-shop/aktion.js", "api/lifeskin-lager.js"]) {
    assert.doesNotMatch(lies(datei), /fbq\(|lifeskin-pixel|capi/i);
  }
});
