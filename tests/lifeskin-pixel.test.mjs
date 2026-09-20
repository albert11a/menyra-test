import test from "node:test";
import assert from "node:assert/strict";

import { Pixel, PIXEL_EREIGNISSE, PIXEL_SCHRITTE, PIXEL_LEAD, pixelDaten } from "../apps/lifeskin/lifeskin-pixel.js";
import { Sitzung } from "../apps/lifeskin/lifeskin-session.js";

// Ein Ersatz fuer fbq, der aufschreibt statt zu senden.
function schreiber() {
  const rufe = [];
  const fbq = (...argumente) => rufe.push(argumente);
  return {
    fbq, rufe,
    ereignisse: () => rufe.filter((r) => r[0] === "track").map((r) => r[1]),
    // Unsere eigenen Namen gehen als trackCustom hinaus - Meta verwirft
    // sie sonst, weil es sie nicht kennt.
    eigene: () => rufe.filter((r) => r[0] === "trackCustom").map((r) => r[1])
  };
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

// Die Nummer allein schaltet nichts ein. Der Pixel laedt fremden Code und
// meldet Verhalten weiter; dafuer braucht es die Zustimmung des Besuchers,
// und die kann eine Zahl in der Konfiguration nicht geben.
test("mit Kennung, aber ohne Einwilligung passiert nichts", () => {
  const { fbq, rufe } = schreiber();
  const pixel = new Pixel({ kennung: "111122223333444", fbq, dokument: null });
  assert.equal(pixel.aktiv, false);
  assert.equal(pixel.starte(), false);
  assert.equal(pixel.melde("ordered", { order: { total: 53 } }), false);
  assert.equal(pixel.meldeLead(), false);
  assert.equal(rufe.length, 0);
});

test("erlaube schaltet ihn ein - und wieder aus", () => {
  const { fbq, ereignisse } = schreiber();
  const pixel = new Pixel({ kennung: "111122223333444", fbq, dokument: null });
  pixel.erlaube();
  assert.equal(pixel.aktiv, true);
  pixel.starte();
  pixel.melde("offer");
  assert.deepEqual(ereignisse(), ["AddToCart"]);
  pixel.erlaube(false);
  assert.equal(pixel.aktiv, false);
  assert.equal(pixel.melde("ordered", { order: { total: 53 } }), false);
});

// Ohne Kennung bleibt er aus, auch mit Zustimmung: Zwei Bedingungen, nicht
// eine, die die andere ersetzt.
test("Einwilligung ohne Kennung reicht nicht", () => {
  const { fbq } = schreiber();
  const pixel = new Pixel({ kennung: "", fbq, einwilligung: true });
  assert.equal(pixel.aktiv, false);
});

test("jeder Trichterschritt meldet sein Meta-Ereignis", () => {
  const { fbq, ereignisse } = schreiber();
  const pixel = new Pixel({ kennung: "111122223333444", fbq, dokument: null, einwilligung: true });
  pixel.starte();
  for (const schritt of Object.keys(PIXEL_EREIGNISSE)) pixel.melde(schritt, { order: { total: 53 } });
  // Die Standardnamen stehen alle darin. Dazwischen liegen unsere
  // eigenen (siehe darunter) - geprueft wird hier nur, dass keiner der
  // Standardnamen fehlt und keiner doppelt kommt.
  assert.deepEqual(ereignisse().filter((e) => Object.values(PIXEL_EREIGNISSE).includes(e)),
    Object.values(PIXEL_EREIGNISSE));
});

// UNSERE EIGENEN EREIGNISSE - eines je Bildschirm, eines je Weg.
//
// Metas fuenf Standardnamen koennen nicht sagen, WO jemand weggegangen
// ist: "ViewContent" heisst beim Scan etwas anderes als beim Foto, und
// Trup und Pytje kommen darin gar nicht vor. In einem Topf waeren die
// vier Wege eine einzige, unlesbare Zahl.
test("jeder Bildschirm meldet ausserdem seinen eigenen Namen", () => {
  const { fbq, rufe } = schreiber();
  const pixel = new Pixel({ kennung: "111122223333444", fbq, dokument: null, einwilligung: true });
  pixel.starte();
  for (const schritt of Object.keys(PIXEL_SCHRITTE)) pixel.melde(schritt);
  const eigene = rufe.filter((r) => r[0] === "trackCustom").map((r) => r[1]);
  assert.deepEqual(eigene, Object.values(PIXEL_SCHRITTE));

  // EIGENE NAMEN GEHEN ALS trackCustom HINAUS. Mit "track" verwirft Meta
  // einen Namen, den es nicht kennt - die Meldung waere weg, und im
  // Ereignismanager stuende nichts, was darauf hinweist.
  const standard = rufe.filter((r) => r[0] === "track").map((r) => r[1]);
  for (const name of standard) {
    assert.ok(Object.values(PIXEL_EREIGNISSE).includes(name) || name === "Lead",
      `${name} geht als Standardereignis hinaus, ist aber keines`);
  }
});

test("der gewaehlte Weg und die Abgaben melden sich einzeln", () => {
  const { fbq, ereignisse, eigene } = schreiber();
  const pixel = new Pixel({ kennung: "111122223333444", fbq, dokument: null, einwilligung: true });
  pixel.starte();
  assert.equal(pixel.meldeWeg("foto"), true);
  assert.equal(pixel.meldeWeg("foto"), false, "Derselbe Weg meldet sich zweimal");
  assert.equal(pixel.meldeWeg("gibtsnicht"), false);
  assert.equal(pixel.meldeAbgabe("pyetja"), true);
  assert.equal(pixel.meldeAbgabe("telefon"), true);
  assert.equal(pixel.meldeAbgabe("gibtsnicht"), false);
  // Eigene Namen gehen als trackCustom hinaus, nicht als track.
  assert.deepEqual(eigene(),
    ["lifeskin_method_photo", "lifeskin_question_completed", "lifeskin_phone_completed"]);
  assert.deepEqual(ereignisse(), []);
});

test("ein Schritt, den keine Liste kennt, meldet nichts", () => {
  const { fbq, ereignisse } = schreiber();
  const pixel = new Pixel({ kennung: "111122223333444", fbq, dokument: null, einwilligung: true });
  pixel.starte();
  for (const schritt of ["camera", "pyetja1", "aufbereitung"]) {
    assert.equal(pixel.melde(schritt), false);
  }
  assert.deepEqual(ereignisse(), []);
});

test("die Bestellung traegt Betrag, Waehrung und Kennung", () => {
  const { fbq, rufe } = schreiber();
  const pixel = new Pixel({ kennung: "111122223333444", fbq, dokument: null, einwilligung: true });
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
  const pixel = new Pixel({ kennung: "111122223333444", fbq, dokument: null, einwilligung: true });
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
    dokument: null,
    einwilligung: true
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
