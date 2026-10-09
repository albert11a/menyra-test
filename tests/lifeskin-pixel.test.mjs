import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

import { Pixel, PIXEL_EREIGNISSE, PIXEL_SCHRITTE, PIXEL_LEAD, pixelDaten, ereignisKennung, leadKennung, warteKennung } from "../apps/lifeskin/lifeskin-pixel.js";
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
  // Seit 07.10. (Pixel-Aenderung erlaubt von Albert am 07.10.2026): erst
  // nach "Pranoj" im Cookie-Fenster (shared/lifeskin-zustimmung.js).
  assert.equal(LIFESKIN_PIXEL_EINWILLIGUNG_NOETIG, true,
    "Der Pixel meldet wieder ohne Zustimmung");

  // Ohne Zustimmung: nichts. Mit "Pranoj": er meldet.
  const { fbq, rufe } = schreiber();
  const pixel = new Pixel({ fbq, dokument: null });
  assert.equal(pixel.aktiv, false, "Ohne Zustimmung darf der Pixel nicht aktiv sein");
  assert.equal(pixel.melde("opened"), false);
  assert.equal(rufe.length, 0, "Ohne Zustimmung ging etwas an Meta");
  pixel.erlaube(true);
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
    const pixel = new Pixel({ kennung: "111122223333444", fbq, dokument: null, seite, einwilligung: true });
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
    // Seit dem 01.10. mit der Fallnummer: Daran legt Meta das Lead aus dem
    // Browser mit dem vom Server zusammen (api/lifeskin-capi.js).
    assert.match(umfeld, /meldeLead\(this\.sitzung\?\.code\)/,
      "Eine Stelle nimmt die Nummer an, ohne Lead (mit Fallnummer) zu melden - dort optimiert Meta ins Leere");
  }
});


// ══ DAS COOKIE-FENSTER (07.10.) ══════════════════════════════════════
// Pixel-Aenderung erlaubt von Albert am 07.10.2026: Pixel und Conversions
// API erst nach "Pranoj". "Refuzo" heisst: nichts an Meta, auch vom Server.
test("Cookie-Fenster: Pranoj startet den Pixel und meldet die Seite nach, Refuzo nie", async () => {
  const z = await import("../shared/lifeskin-zustimmung.js");
  const speicher = new Map();
  const lager = { getItem: (k) => speicher.get(k) ?? null, setItem: (k, v) => speicher.set(k, String(v)) };
  assert.equal(z.zustimmungLesen(lager), "");
  assert.equal(z.zustimmungSetzen("ja", lager), "ja");
  assert.equal(z.zustimmungLesen(lager), "ja");
  assert.equal(z.zustimmungSetzen("irgendwas", lager), "nein", "alles ausser ja ist nein");

  const horcher = [];
  const altAdd = globalThis.addEventListener;
  globalThis.addEventListener = (name, f) => horcher.push([name, f]);
  try {
    const { fbq, ereignisse } = schreiber();
    const pixel = new Pixel({ kennung: "111122223333444", fbq, dokument: null, einwilligung: false });
    assert.equal(pixel.starte(), false);
    assert.deepEqual(ereignisse(), []);
    assert.equal(horcher.filter(([n]) => n === z.ZUSTIMMUNG_EREIGNIS).length, 1, "wartet nicht auf die Wahl");
    horcher[0][1]({ detail: "nein" });
    assert.equal(pixel.aktiv, false);
    assert.deepEqual(ereignisse(), [], "nach Refuzo ging etwas an Meta");
    horcher[0][1]({ detail: "ja" });
    assert.equal(pixel.aktiv, true);
    assert.deepEqual(ereignisse(), ["PageView"], "nach Pranoj fehlt die Seite");
  } finally {
    globalThis.addEventListener = altAdd;
  }
});

// ══ JEDES EREIGNIS MIT eventID (Pixel-Aenderung erlaubt von Albert am 09.10.2026)
//
// Meta meldete "lifeskin_body_problem_completed" und
// "lifeskin_instagram_proof_view" als "vom Server, nicht dedupliziert, da
// kein event_id". Ohne Kennung kann Meta eine Kopie im Server-Kanal nie mit
// der Meldung aus dem Browser zusammenlegen.
test("jede Meldung traegt eine eventID; Kauf, Lead und Warteseite behalten ihre feste", () => {
  const { fbq, rufe } = schreiber();
  const pixel = new Pixel({ kennung: "111122223333444", fbq, dokument: null, einwilligung: true });
  pixel.starte();
  pixel.melde("opened");
  for (const schritt of Object.keys(PIXEL_SCHRITTE)) pixel.melde(schritt, { code: "LS-0910-ABCDE" });
  pixel.meldeWeg("trup");
  pixel.meldeAbgabe("problemi");
  pixel.meldeKorb(25);
  pixel.meldeKasse(25);
  pixel.meldeLead("LS-0910-ABCDE");
  pixel.melde("ordered", { order: { total: 25, orderId: "LS-0910-ABCDE" } });
  const meldungen = rufe.filter((r) => r[0] === "track" || r[0] === "trackCustom");
  assert.ok(meldungen.length > 10);
  for (const [, name, , anhang] of meldungen) {
    assert.ok(typeof anhang?.eventID === "string" && anhang.eventID.length > 0, `${name} ohne eventID`);
  }
  const id = (name) => meldungen.find((r) => r[1] === name)[3].eventID;
  assert.equal(id("Purchase"), "LS-0910-ABCDE", "der Kauf behaelt die Bestellnummer (Server-Purchase)");
  assert.equal(id("Lead"), leadKennung("LS-0910-ABCDE"), "der Lead behaelt die Kennung des Server-Leads");
  assert.equal(id("lifeskin_waiting_reached"), warteKennung("LS-0910-ABCDE"));
  assert.ok(id("lifeskin_body_problem_completed").startsWith("lifeskin_body_problem_completed."));
  // Einmalig: zwei Meldungen teilen nie eine Kennung - sonst legte Meta sie zusammen.
  const alle = meldungen.map((r) => r[3].eventID);
  assert.equal(new Set(alle).size, alle.length);
});

test("ereignisKennung ist einmalig und kommt auch ohne crypto aus", () => {
  assert.notEqual(ereignisKennung("x"), ereignisKennung("x"));
  const ohne = ereignisKennung("lifeskin_method_view", null);
  assert.match(ohne, /^lifeskin_method_view\.[a-z0-9]{8,}$/);
  assert.match(ereignisKennung("y", { randomUUID: () => { throw new Error("nein"); } }), /^y\.[a-z0-9]{8,}$/);
});

test("die Abschnitte der Landingpage melden mit eventID", () => {
  const wurzel = join(dirname(fileURLToPath(import.meta.url)), "..");
  const js = readFileSync(join(wurzel, "apps/lifeskin-landing/landing.js"), "utf8");
  const aufrufe = js.match(/window\.fbq\([^;]*\);/g) || [];
  assert.equal(aufrufe.length, 1, "genau eine Stelle meldet auf der Landingpage");
  assert.match(aufrufe[0], /window\.fbq\("trackCustom", name, \{\}, \{ eventID: kennung\(name\) \}\)/);
});
