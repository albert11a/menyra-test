import test from "node:test";
import assert from "node:assert/strict";

import { Pixel, PIXEL_EREIGNISSE, PIXEL_LEAD, pixelDaten } from "../apps/lifeskin/lifeskin-pixel.js";
import { Sitzung } from "../apps/lifeskin/lifeskin-session.js";

// Ein Ersatz fuer fbq, der aufschreibt statt zu senden.
function schreiber() {
  const rufe = [];
  const fbq = (...argumente) => rufe.push(argumente);
  return { fbq, rufe, ereignisse: () => rufe.filter((r) => r[0] === "track").map((r) => r[1]) };
}

test("ohne Kennung passiert nichts", () => {
  const { fbq, rufe } = schreiber();
  const pixel = new Pixel({ kennung: "", fbq });
  assert.equal(pixel.aktiv, false);
  assert.equal(pixel.starte(), false);
  assert.equal(pixel.melde("ordered", { order: { total: 53 } }), false);
  assert.equal(pixel.meldeLead(), false);
  assert.equal(rufe.length, 0);
});

test("jeder Trichterschritt meldet sein Meta-Ereignis", () => {
  const { fbq, ereignisse } = schreiber();
  const pixel = new Pixel({ kennung: "111122223333444", fbq, dokument: null });
  pixel.starte();
  for (const schritt of Object.keys(PIXEL_EREIGNISSE)) pixel.melde(schritt, { order: { total: 53 } });
  assert.deepEqual(ereignisse(), Object.values(PIXEL_EREIGNISSE));
});

test("Schritte ohne eigenes Ereignis melden nichts", () => {
  const { fbq, ereignisse } = schreiber();
  const pixel = new Pixel({ kennung: "111122223333444", fbq, dokument: null });
  pixel.starte();
  for (const schritt of ["named", "camera", "result"]) assert.equal(pixel.melde(schritt), false);
  assert.deepEqual(ereignisse(), []);
});

test("die Bestellung traegt Betrag, Waehrung und Kennung", () => {
  const { fbq, rufe } = schreiber();
  const pixel = new Pixel({ kennung: "111122223333444", fbq, dokument: null });
  pixel.starte();
  pixel.melde("ordered", { order: { total: 53, orderId: "LS-ABC123" } });
  const kauf = rufe.find((r) => r[1] === "Purchase");
  assert.deepEqual(kauf[2], { currency: "EUR", value: 53 });
  assert.deepEqual(kauf[3], { eventID: "LS-ABC123" });
});

test("ein fehlender Betrag wird zu null und nicht zu NaN", () => {
  assert.deepEqual(pixelDaten("ordered", {}).daten, { currency: "EUR", value: 0 });
  assert.deepEqual(pixelDaten("ordered", { order: { total: "dreiundfuenfzig" } }).daten, { currency: "EUR", value: 0 });
});

test("kein Ereignis wird zweimal gemeldet", () => {
  const { fbq, ereignisse } = schreiber();
  const pixel = new Pixel({ kennung: "111122223333444", fbq, dokument: null });
  pixel.starte();
  pixel.melde("offer");
  pixel.melde("offer");
  pixel.meldeLead();
  pixel.meldeLead();
  assert.deepEqual(ereignisse(), ["AddToCart", PIXEL_LEAD]);
});

test("ein stolperndes fbq reisst den Trichter nicht mit", () => {
  const pixel = new Pixel({
    kennung: "111122223333444",
    fbq: () => { throw new Error("Werbeblocker"); },
    dokument: null
  });
  pixel.starte();
  assert.equal(pixel.melde("offer"), false);
});

test("Sitzung meldet den Schritt weiter - aber nur vorwaerts", async () => {
  const gesehen = [];
  const sitzung = new Sitzung({
    fetchFn: async () => ({ ok: true }),
    beiSchritt: (name) => gesehen.push(name)
  });
  await sitzung.starte({ sprache: "sq" });
  await sitzung.schritt("named", { name: "Arta" });
  await sitzung.schritt("offer");
  // Zurueckblaettern zaehlt nicht noch einmal.
  await sitzung.schritt("named");
  assert.deepEqual(gesehen, ["named", "offer"]);
});

test("eine stolpernde Meldung haelt die Sitzung nicht an", async () => {
  let geschrieben = 0;
  const sitzung = new Sitzung({
    fetchFn: async () => { geschrieben += 1; return { ok: true }; },
    beiSchritt: () => { throw new Error("kaputt"); }
  });
  await sitzung.starte({ sprache: "sq" });
  await sitzung.schritt("named", { name: "Arta" });
  assert.equal(geschrieben, 2);
  assert.equal(sitzung.stand.step, "named");
});
