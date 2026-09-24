// "CASH" IM LIVE-KAUF HEISST: HAT GERADE BESTELLT (24.09.)
//
// Ein Kunde von vorhin, der seine Seite wieder oeffnet, schreibt
// berichtGeoeffnet und stand damit als "1 Person gerade dabei" bei Cash.
import test from "node:test";
import assert from "node:assert/strict";
import { baueLive } from "../apps/mnyra-heart/heart-lifeskin-live.js";

const jetzt = Date.parse("2026-09-24T18:09:00.000Z");
const vor = (min) => new Date(jetzt - min * 60000).toISOString();
const bestellt = (id, bestelltVorMin, extra = {}) => ({
  id, name: id, step: "ordered", hatBestellt: true, order: { orderId: id, total: 29 },
  updatedAt: vor(1), createdAt: vor(600),
  timings: { ereignisse: { "2026-09-24": { hatBestellt: vor(bestelltVorMin) } } }, ...extra
});
const cash = (live) => live.bestellungen.punkte.find((p) => p.id === "bestellt").anzahl;

test("wer gerade bestellt hat, steht bei Cash - mit Namen", () => {
  const live = baueLive([bestellt("Arta", 1)], jetzt);
  assert.equal(cash(live), 1);
  assert.deepEqual(live.bestellungen.leute.map(({ id, name, punkt }) => ({ id, name, punkt })), [{ id: "Arta", name: "Arta", punkt: "bestellt" }]);
});

test("wer vorhin bestellt hat und nur wieder schaut, steht nicht bei Cash", () => {
  const live = baueLive([bestellt("Besa", 120)], jetzt);
  assert.equal(cash(live), 0);
  assert.equal(live.bestellungen.gesamt, 0);
  // ...und auch nicht in der Analyse-Reihe.
  assert.equal(live.analysen.gesamt, 0);
});

test("eine Bestellung ohne bekannte Zeit (Laden) zaehlt wie bisher", () => {
  const laden = { id: "L", name: "Lira", step: "ordered", order: { orderId: "L", kind: "shop" }, updatedAt: vor(1), createdAt: vor(2) };
  assert.equal(cash(baueLive([laden], jetzt)), 1);
});

test("die Live-Karte nennt die Leute, antippen oeffnet den Fall", async () => {
  const { renderLifeskin } = await import("../apps/mnyra-heart/heart-lifeskin-render.js");
  const {
    baueKennzahlen, baueTrichter, baueLesetiefe, baueHerkunft, baueVerteilung
  } = await import("../apps/mnyra-heart/heart-lifeskin-berechnung.js");
  const html = renderLifeskin({
    status: "ready", loadedFrom: "network", sitzungen: [], tests: [], berichte: {}, produkte: [], abdeckung: [],
    kennzahlen: baueKennzahlen([]), trichter: baueTrichter([]), lesetiefe: baueLesetiefe([]), herkunft: baueHerkunft([]),
    verteilung: baueVerteilung([]), verlauf: [], offen: "", fotos: {}, zeitraum: "heute", fach: "alle", vorschau: {},
    live: baueLive([bestellt("Arta", 1)], jetzt)
  });
  assert.match(html, /class="heart-live__person" data-action="lifeskin-sitzung" data-id="Arta">\s*<b>Arta<\/b><span>Cash<\/span>/);
});

test("ohne Namen: Besucher mit Quelle, nicht antippbar", async () => {
  const { renderLifeskin } = await import("../apps/mnyra-heart/heart-lifeskin-render.js");
  const b = await import("../apps/mnyra-heart/heart-lifeskin-berechnung.js");
  const besucher = { id: "v1", step: "opened", source: { utmSource: "ig" }, updatedAt: vor(1), createdAt: vor(1) };
  const html = renderLifeskin({
    status: "ready", loadedFrom: "network", sitzungen: [], tests: [], berichte: {}, produkte: [], abdeckung: [],
    kennzahlen: b.baueKennzahlen([]), trichter: b.baueTrichter([]), lesetiefe: b.baueLesetiefe([]), herkunft: b.baueHerkunft([]),
    verteilung: b.baueVerteilung([]), verlauf: [], offen: "", fotos: {}, zeitraum: "heute", fach: "alle", vorschau: {},
    live: baueLive([besucher], jetzt)
  });
  assert.match(html, /heart-live__person--anonym">\s*<b>Besucher<\/b><span>Landing · [^<]+<\/span>/);
  assert.doesNotMatch(html, /Ohne Namen/);
  assert.doesNotMatch(html, /data-action="lifeskin-sitzung" data-id="v1"/);
});
