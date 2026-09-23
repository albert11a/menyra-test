// KOMMT JEDE ANALYSE, JEDE ANSCHRIFT, JEDE BESTELLUNG AN?
//
// Hier laeuft der ECHTE Code - Sitzung (Trichter, Laden), AnalyseDaten
// (Warteseite, Therapieseite) - gegen den Emulator mit den ECHTEN Regeln.
// Keine nachgebauten Daten: Was diese Klassen schicken, schicken sie auch
// im Betrieb. hasOnly() weist ein ganzes Dokument ab, sobald ein Feld
// darin steht, das die Regel nicht kennt - und der Besucher merkt davon
// nichts. Genau das faengt diese Datei.
//
// Gelesen wird danach mit abgeschalteten Regeln, so wie Heart mit dem
// CEO-Konto liest.

import test, { after, before, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { initializeTestEnvironment } from "@firebase/rules-unit-testing";
import { doc, getDoc, setDoc } from "firebase/firestore";

import { Sitzung } from "../../apps/lifeskin/lifeskin-session.js";
import { AnalyseDaten } from "../../apps/lifeskin-astra/astra-daten.js";
import { LIFESKIN_FIRESTORE_BASE } from "../../apps/lifeskin/lifeskin-config.js";
import { normalisiere } from "../../apps/mnyra-heart/heart-lifeskin-berechnung.js";

const repoRoot = dirname(fileURLToPath(new URL("../../package.json", import.meta.url)));
const projectId = `${process.env.MNYRA_RULES_PROJECT_ID || "mnyra-local"}-schreibwege`;
const firestoreHost = process.env.FIRESTORE_EMULATOR_HOST || "127.0.0.1:8080";
const [host, portText] = firestoreHost.split(":");
const EMU = `http://${host}:${portText || 8080}/v1/projects/${projectId}/databases/(default)/documents`;

// Dieselbe Anfrage, nur an den Emulator statt an Firestore.
const umleiten = (url, optionen) => globalThis.fetch(String(url).replace(LIFESKIN_FIRESTORE_BASE, EMU), optionen);
const dokumentStub = { visibilityState: "visible", addEventListener() {}, removeEventListener() {}, referrer: "" };

let testEnv;
before(async () => {
  const rules = await readFile(resolve(repoRoot, "firestore.rules"), "utf8");
  testEnv = await initializeTestEnvironment({ projectId, firestore: { host, port: Number(portText || 8080), rules } });
});
beforeEach(async () => { await testEnv.clearFirestore(); });
after(async () => { await testEnv?.cleanup(); });

async function lies(pfad) {
  let daten = null;
  await testEnv.withSecurityRulesDisabled(async (ctx) => {
    const s = await getDoc(doc(ctx.firestore(), pfad));
    daten = s.exists() ? s.data() : null;
  });
  return daten;
}

function neueSitzung() {
  return new Sitzung({ basis: EMU, fetchFn: (...a) => globalThis.fetch(...a), speicher: null });
}

const ok = (antwort, was) => assert.ok(antwort?.ok, `${was}: ${antwort?.status ?? "keine Antwort"}`);

test("eine Analyse kommt an: Sitzung, Name, Nummer, Anamnese, Foto, Bericht, Klickpfad", async () => {
  const s = neueSitzung();
  ok(await s.starte({ dokument: dokumentStub }), "starte");
  ok(await s.schritt("wahl", { typ: "foto", paSkanim: true }), "wahl");
  ok(await s.schritt("fotopara"), "fotopara");
  ok(await s.schritt("fotokamera", { kameraOk: true }), "kamera");
  ok(await s.schritt("fotogati", { photos: ["zona"] }), "fotogati");
  ok(await s.ergaenze({ anamnese: { anliegen: ["pucrrat"], lekura: "yndyrshme", mosha: "25-34" } }), "anamnese");
  ok(await s.schritt("emri", { name: "Arta", ageBand: "25-34" }), "name");
  ok(await s.schritt("numri", { phone: "+383 44 123 456", phoneConsent: true }), "nummer");
  ok(await s.schritt("result"), "result");
  s.fotosSpeichern({ zona: { jpeg: "data:image/jpeg;base64,/9j/AAAA", breite: 10, hoehe: 10 } });
  assert.equal(await s.berichtAnlegen({ name: "Arta", typ: "foto", photos: 1, numri: true }), true, "Bericht");
  ok(await s.klickpfadSchreiben([{ id: "e1", t: new Date().toISOString(), s: "Trichter", e: "klick", d: "Weiter" }]), "Klickpfad");

  const sitzung = await lies(`lifeskin/lifeskin/sessions/${s.id}`);
  assert.ok(sitzung, "Sitzung fehlt");
  assert.equal(sitzung.step, "result");
  assert.equal(sitzung.name, "Arta");
  assert.equal(sitzung.phone, "+383 44 123 456");
  assert.deepEqual(sitzung.anamnese.anliegen, ["pucrrat"]);
  assert.ok(sitzung.timings.pfad.e1, "Klickpfad fehlt");
  assert.ok(await lies(`lifeskin/lifeskin/sessions/${s.id}/photos/zona`), "Foto fehlt");
  const bericht = await lies(`lifeskin/lifeskin/reports/${s.id}`);
  assert.equal(bericht?.status, "wartet");
  assert.equal(bericht?.numri, true);
  // Und Heart zaehlt sie als Analyse.
  assert.equal(normalisiere(s.id, sitzung).step, "result");
});

test("Warteseite und Therapieseite: Marken, Anschrift, Bestellung und Status kommen an", async () => {
  const s = neueSitzung();
  ok(await s.starte({ dokument: dokumentStub }), "starte");
  ok(await s.schritt("result"), "result");
  assert.equal(await s.berichtAnlegen({ name: "Arta", typ: "scan" }), true);

  const seite = new AnalyseDaten({ fetchFn: umleiten, kennung: s.id });
  // Warteseite
  ok(await seite.merken({ warteseiteGeoeffnet: true }), "warteseite");
  ok(await seite.merken({ timings: { live: "prit" } }), "live");
  // Heart gibt frei (CEO-Konto).
  await testEnv.withSecurityRulesDisabled((ctx) => setDoc(doc(ctx.firestore(), `lifeskin/lifeskin/reports/${s.id}`),
    { status: "fertig", preis: 53 }, { merge: true }));
  // Therapieseite - dieselben Daten wie terapia.js
  ok(await seite.merken({ berichtGeoeffnet: true }), "berichtGeoeffnet");
  ok(await seite.merken({ sahPreis: true }), "sahPreis");
  ok(await seite.merken({ kasseGeoeffnetAt: new Date().toISOString() }), "kasseGeoeffnetAt");
  ok(await seite.merken({ kasseGeoeffnet: true }), "kasseGeoeffnet");
  ok(await seite.merken({ timings: { live: "porosia" } }), "porosia");
  const address = { name: "Arta Krasniqi", telefon: "+383 44 123 456", strasse: "Rruga B", ort: "Prishtinë" };
  ok(await seite.merken({ address, timings: { live: "address" } }), "anschrift");
  ok(await seite.klickpfadSchreiben([{ id: "e9", t: new Date().toISOString(), s: "Therapieseite", e: "feld", d: "Adresa" }]), "pfad");
  const jetzt = new Date().toISOString();
  ok(await seite.merken({
    address, phone: address.telefon.slice(0, 40), timings: { live: "ordered" },
    order: { createdAt: jetzt, total: 53, payment: "nachnahme", status: "neu", orderId: "LS-TEST", fbp: "fb.1.x" },
    step: "ordered"
  }), "bestellung");
  assert.equal(await seite.zustandSchreiben({ status: "bestellt", bestelltAt: jetzt }), true, "Status bestellt");

  const sitzung = await lies(`lifeskin/lifeskin/sessions/${s.id}`);
  const n = normalisiere(s.id, sitzung);
  assert.equal(n.hatBestellt, true, "Bestellung nicht erkannt");
  assert.equal(n.hatAnschrift, true, "Anschrift nicht erkannt");
  assert.equal(sitzung.address.strasse, "Rruga B");
  assert.equal(sitzung.order.total, 53);
  assert.equal(n.kasseGeoeffnet, true);
  assert.equal(n.berichtGeoeffnet, true);
  assert.equal(n.warteseiteGeoeffnet, true);
  const bericht = await lies(`lifeskin/lifeskin/reports/${s.id}`);
  assert.equal(bericht.status, "bestellt");
});

test("eine angefangene Anschrift kommt an, auch ohne Bestellung (Nachfassen)", async () => {
  const s = neueSitzung();
  ok(await s.starte({ dokument: dokumentStub }), "starte");
  const seite = new AnalyseDaten({ fetchFn: umleiten, kennung: s.id });
  ok(await seite.merken({ address: { name: "", telefon: "", strasse: "", ort: "Pejë" }, timings: { live: "address" } }), "teil-anschrift");
  const n = normalisiere(s.id, await lies(`lifeskin/lifeskin/sessions/${s.id}`));
  assert.equal(n.hatAnschrift, true);
});

test("Laden auf der Landingpage: Warenkorb, Anschrift begonnen, Bestellung kommen an", async () => {
  const s = neueSitzung();
  ok(await s.starte({ dokument: dokumentStub }), "starte");
  ok(await s.ergaenze({ produkteGesehen: true }), "gesehen");
  ok(await s.ergaenze({ imKorb: true, korbWert: 66, korbStueck: 2 }), "korb");
  ok(await s.ergaenze({ adresseBegonnen: true }), "adresse begonnen");
  const werte = { name: "Besa", telefon: "044 555 666", strasse: "Rr. A", ort: "Ferizaj" };
  ok(await s.schritt("ordered", {
    name: werte.name.slice(0, 80), phone: werte.telefon.slice(0, 40), address: werte,
    order: { kind: "shop", createdAt: new Date().toISOString(), total: 66, payment: "nachnahme", status: "neu",
      orderId: s.code, items: [{ id: "lf-acne", name: "LF ACNE", cmimi: 33, sasia: 2 }] }
  }), "shop-bestellung");
  ok(await s.ergaenze({ shopKauf: true }), "shopKauf");
  const n = normalisiere(s.id, await lies(`lifeskin/lifeskin/sessions/${s.id}`));
  assert.equal(n.hatBestellt, true);
  assert.equal(n.imKorb, true);
  assert.equal(n.korbWert, 66);
  assert.equal(n.adresseBegonnen, true);
  assert.equal(n.shopKauf, true);
  assert.equal(n.order.items.length, 1);
});

test("Bestellung aus dem stillen Modus (order.still) wird von den Regeln angenommen", async () => {
  const s = neueSitzung();
  ok(await s.starte({ dokument: dokumentStub }), "starte");
  ok(await s.schritt("ordered", { order: { createdAt: new Date().toISOString(), total: 53, orderId: s.code, still: true } }), "still-bestellung");
  const n = normalisiere(s.id, await lies(`lifeskin/lifeskin/sessions/${s.id}`));
  assert.equal(n.hatBestellt, true);
  assert.equal(n.order.still, true);
});

test("Gegenprobe: die Regeln greifen wirklich - ein unbekanntes Feld wird abgewiesen", async () => {
  const s = neueSitzung();
  ok(await s.starte({ dokument: dokumentStub }), "starte");
  const abgewiesen = await s.ergaenze({ gibtsNicht: true });
  assert.ok(!abgewiesen?.ok, "Ein unbekanntes Feld kam durch - dann prueft diese Datei nichts");
  const seite = new AnalyseDaten({ fetchFn: umleiten, kennung: s.id });
  // Den Status darf der Besucher nur von "fertig" auf "bestellt" setzen.
  assert.equal(await seite.zustandSchreiben({ status: "fertig" }), false);
});
