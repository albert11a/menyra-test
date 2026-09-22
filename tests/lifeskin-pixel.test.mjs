import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

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
// DIE SPERRE GIBT ES WEITER, AUCH WENN SIE OFFEN STEHT.
//
// Fuer diese Seite ist entschieden, dass der Pixel ohne Abfrage laedt
// (LIFESKIN_PIXEL_EINWILLIGUNG_NOETIG = false), und der Standard des
// Konstruktors folgt dieser einen Stelle. Der Mechanismus bleibt
// trotzdem vollstaendig - kommt eine Abfrage dazu, ist es eine Zeile in
// der Konfiguration und kein Umbau. Dieser Test haelt ihn am Leben.
test("mit Kennung, aber ohne Einwilligung passiert nichts", () => {
  const { fbq, rufe } = schreiber();
  const pixel = new Pixel({ kennung: "111122223333444", fbq, dokument: null,
    einwilligung: false });
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

// ══ DER PIXEL IST SCHARF ═════════════════════════════════════════════
//
// Drei Dinge muessen zusammenstehen, sonst meldet die Seite nichts oder
// das Falsche. Sie stehen an drei verschiedenen Stellen, und keine
// davon meldet sich, wenn sie auseinanderlaufen.
test("Kennung und Schalter stehen so, dass der Pixel wirklich laeuft", async () => {
  const { LIFESKIN_PIXEL_ID, LIFESKIN_PIXEL_EINWILLIGUNG_NOETIG } =
    await import("../apps/lifeskin/lifeskin-config.js");

  assert.match(LIFESKIN_PIXEL_ID, /^\d{15,16}$/,
    "Die Pixel-Kennung ist keine Nummer mehr - der Pixel laedt dann gar nicht");
  assert.equal(LIFESKIN_PIXEL_EINWILLIGUNG_NOETIG, false,
    "Der Pixel wartet wieder auf eine Zustimmung, die es auf dieser Seite nicht gibt - er bliebe stumm");

  // Und der Standard des Konstruktors folgt dieser einen Stelle.
  const { fbq, rufe } = schreiber();
  const pixel = new Pixel({ fbq, dokument: null });
  assert.equal(pixel.aktiv, true, "Mit der Kennung aus der Konfiguration ist er trotzdem aus");
  assert.equal(pixel.melde("opened"), true);
  assert.ok(rufe.length > 0, "Es geht nichts hinaus");
});

// ══ DER BASISCODE DARF NICHT ZWEIMAL DASTEHEN ════════════════════════
//
// lifeskin-pixel.js baut Metas Ladeschnipsel selbst. Wer den kopierten
// Code aus dem Ereignismanager ZUSAETZLICH in den <head> setzt, bekommt
// zwei "init" und zwei "PageView" je Besucher - Meta zaehlt dann jeden
// doppelt, und keine Zahl stimmt mehr. Das faellt niemandem auf: Im
// Ereignismanager sieht die doppelte Reichweite aus wie Erfolg.
test("der kopierte Basiscode steht in keiner Seite", async () => {
  const { readFileSync } = await import("node:fs");
  const { join, dirname } = await import("node:path");
  const { fileURLToPath } = await import("node:url");
  const wurzel = join(dirname(fileURLToPath(import.meta.url)), "..");

  for (const seite of [
    "apps/lifeskin-landing/index.html",
    "apps/lifeskin-astra/index.html",
    "apps/lifeskin-bericht/index.html",
    "apps/lifeskin-trichter/index.html"
  ]) {
    let aufbau;
    try { aufbau = readFileSync(join(wurzel, seite), "utf8"); }
    catch { continue; }
    assert.ok(!/connect\.facebook\.net/.test(aufbau),
      `${seite} laedt fbevents.js selbst - zusammen mit lifeskin-pixel.js waere das ein doppelter Pixel`);
    assert.ok(!/fbq\(\s*['"]init['"]/.test(aufbau),
      `${seite} ruft fbq("init") selbst - der Pixel zaehlt dann jeden Besucher doppelt`);
  }
});

// ══ JEDE SEITE MELDET SICH MIT IHREM EIGENEN NAMEN ═══════════════════
//
// Alle drei riefen melde("opened") und meldeten damit denselben eigenen
// Namen. In "lifeskin_landing_view" steckten also Landingpage,
// Warteseite und Befundseite zusammen - wer aus WhatsApp auf seinen
// Befund zurueckkam, wurde darin als neuer Besucher der Landingpage
// gezaehlt.
test("Landingpage, Warteseite und Befund melden drei verschiedene Namen", () => {
  const gemeldet = ["trichter", "warteseite", "befund"].map((seite) => {
    const { fbq, ereignisse, eigene } = schreiber();
    const pixel = new Pixel({ kennung: "111122223333444", fbq, dokument: null, seite });
    pixel.melde("opened");
    // PageView geht von jeder Seite hinaus - eine Seite ist eine Seite.
    assert.deepEqual(ereignisse(), ["PageView"], `${seite} meldet kein PageView`);
    const namen = eigene();
    assert.equal(namen.length, 1, `${seite} meldet nicht genau einen eigenen Namen`);
    return namen[0];
  });
  assert.equal(new Set(gemeldet).size, 3,
    `Zwei Seiten melden denselben Namen: ${gemeldet.join(", ")}`);
});

// ══ KORB UND KASSE ═══════════════════════════════════════════════════
//
// Zwei von Metas fuenf Standardereignissen. Sie standen seit jeher in
// PIXEL_EREIGNISSE (an den Schritten "offer" und "address") und wurden
// nie gemeldet - diese Schritte ruft im ganzen Trichter niemand auf.
test("Korb und Kasse melden Standardereignisse mit Betrag", () => {
  const { fbq, rufe, ereignisse } = schreiber();
  const pixel = new Pixel({ kennung: "111122223333444", fbq, dokument: null });
  pixel.erlaube();

  assert.equal(pixel.meldeKorb(66), true);
  assert.equal(pixel.meldeKasse(66), true);
  assert.deepEqual(ereignisse(), ["AddToCart", "InitiateCheckout"]);

  // "track" und nicht "trackCustom": Ein Standardname, der als eigener
  // hinausgeht, wird von Meta verworfen.
  for (const ruf of rufe) assert.equal(ruf[0], "track", `${ruf[1]} geht als eigener Name hinaus`);
  for (const ruf of rufe) assert.deepEqual(ruf[2], { currency: "EUR", value: 66 });

  // Und genau einmal je Besuch.
  assert.equal(pixel.meldeKorb(99), false);
});

test("ein Betrag, der keiner ist, wird nicht mitgeschickt", () => {
  const { fbq, rufe } = schreiber();
  const pixel = new Pixel({ kennung: "111122223333444", fbq, dokument: null });
  pixel.erlaube();
  pixel.meldeKorb(0);
  // "value: 0" an einem vollen Korb waere eine Zahl, die Meta glaubt.
  assert.deepEqual(rufe[0][2], {});
});

// ══ DIE NUMMER MELDET IMMER "Lead" - AUCH AUF DEM ALTEN WEG ══════════
//
// "Lead" ist das Ereignis, auf das die Anzeigen optimieren: Es faellt,
// wenn jemand seine Nummer abgibt, und das tut auf jedem Weg jeder, der
// eine Analyse zu Ende bringt. Auf EINEM Weg fiel es nicht.
//
// Die alte Vorlage ("pa-skanim", ein Link, den es noch gibt) fragt die
// Nummer als FRAGE und nicht auf dem Nummernbildschirm. Der
// Schreibvorgang dort setzte phone, phoneConsent und nummerGegeben -
// und meldete nichts. Wer so hereinkam, war fuer Meta kein Lead.
test("jede Stelle, die phoneConsent setzt, meldet auch Lead", () => {
  const quelle = readFileSync(
    join(dirname(fileURLToPath(import.meta.url)), "..",
      "apps/lifeskin/lifeskin-app.js"), "utf8");
  const ohneNotizen = quelle.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");

  const stellen = [...ohneNotizen.matchAll(/phoneConsent: true|phoneConsent = true/g)];
  assert.ok(stellen.length >= 2,
    "Es gibt nur noch eine Stelle mit der Einwilligung - der Test prueft dann zu wenig");

  for (const treffer of stellen) {
    // Innerhalb desselben Blocks muss die Meldung stehen: 900 Zeichen
    // reichen fuer den Zweig, in dem die Nummer geprueft wird.
    const umfeld = ohneNotizen.slice(treffer.index, treffer.index + 900);
    assert.match(umfeld, /meldeLead\(\)/,
      "Eine Stelle nimmt die Nummer an, ohne Lead zu melden - dort optimiert Meta ins Leere");
  }
});
