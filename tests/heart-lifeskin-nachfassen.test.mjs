// Nachfassen per WhatsApp im Befund: drei Lagen, kurze Nachrichten von
// Dr. Gashi, die passende Taste hervorgehoben, nie nach der Bestellung.
import test from "node:test";
import assert from "node:assert/strict";
globalThis.__LIFESKIN_TEST__ = true;
const { nachfassArt, nachfassNachricht, NACHFASS_ARTEN } = await import("../apps/mnyra-heart/heart-lifeskin-render.js");

const B = { status: "fertig", raport: { shitja: { problemet: [{ gjetja: "Akne aktive", ku: "në faqe" }, { gjetja: "Skuqje", ku: "në mjekër" }] } } };

test("die passende Lage", () => {
  assert.equal(nachfassArt({ berichtGeoeffnet: true, kasseGeoeffnet: true }, B), "kasse");
  assert.equal(nachfassArt({ berichtGeoeffnet: true }, B), "gesehen");
  assert.equal(nachfassArt({}, B), "ungesehen");
  assert.equal(nachfassArt({ hatBestellt: true }, B), "");
  assert.equal(nachfassArt({}, { status: "versandt" }), "");
});

test("kurz, mit Namen, Befund, Link und ohne erfundenen Druck", () => {
  for (const { id } of NACHFASS_ARTEN) {
    const t = nachfassNachricht({ id: "x1", name: "arta k" }, B, id);
    assert.match(t, /^Përshëndetje Arta, Dr\. Gashi këtu\./, id);
    assert.ok(t.includes("https://www.mnyra.com/analiza/x1"), id);
    assert.ok(t.length < 420, `${id}: ${t.length} Zeichen - kein Referat`);
    assert.doesNotMatch(t, /vetëm sot|ofert|mbeten vetëm|nxitoni|garantuar|100 ?%|28 ditë|puçrra/i, id);
  }
  assert.match(nachfassNachricht({ id: "x", name: "A" }, B, "gesehen"), /për akne aktive në faqe dhe skuqje në mjekër/);
  assert.match(nachfassNachricht({ id: "x", name: "A" }, B, "gesehen"), /„Po“/);
  assert.match(nachfassNachricht({ id: "x", name: "A" }, B, "ungesehen"), /Gjeta dy gjëra/);
  assert.match(nachfassNachricht({ id: "x", name: "A" }, B, "kasse"), /më dërgoni vetëm adresën/);
});
