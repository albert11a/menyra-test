// DIE NEUEN FELDER - und die Falle, in die sie fallen koennen.
//
// hasOnly() in firestore.rules weist das GANZE Dokument ab, sobald ein
// Feld darin steht, das die Regel nicht kennt. Nach aussen sieht dann
// alles richtig aus: Der Trichter wartet auf kein Ja, der naechste
// Schreibvorgang kommt wieder durch, und in Heart steht eine Null, die
// nichts bedeutet. Genau so sind hier schon dreimal Daten verschwunden.
//
// Diese Datei haelt fest, dass die Regeln jedes Feld kennen, das der
// Trichter und der Laden seit der Umstellung schreiben:
//
//   kameraOk         ob die Systemfrage der Kamera mit Ja beantwortet
//                    wurde - die groesste einzelne Luecke der zwei Wege
//                    mit Aufnahme
//   produkteGesehen  wer die Mittel auf der Landingpage wirklich
//   imKorb           angesehen, etwas hineingelegt, die Anschrift
//   korbWert         angefangen und bezahlt hat - der Kauftrichter
//   korbStueck
//   adresseBegonnen
//   shopKauf
//   problemi         der eigene Bildschirm fuer das Anliegen, als Schritt
//   numri            und im Bericht die Marke, dass die Nummer schon da
//                    ist (nicht die Nummer selbst - der Link zur Analyse
//                    ist zum Weitergeben gemacht)

import test, { after, before, beforeEach } from "node:test";
import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
} from "@firebase/rules-unit-testing";

const repoRoot = dirname(
  fileURLToPath(new URL("../../package.json", import.meta.url)),
);
// Eigenes Projekt im Emulator: Der Laeufer startet die Dateien
// nebeneinander, und jede raeumt vor jedem Test auf.
const projectId = `${process.env.MNYRA_RULES_PROJECT_ID || "mnyra-local"}-lifeskin-felder`;
const firestoreHost = process.env.FIRESTORE_EMULATOR_HOST || "127.0.0.1:8080";
const [host, portText] = firestoreHost.split(":");

const KENNUNG = "0123456789abcdef0123456789abcdef";
const SITZUNG = `lifeskin/lifeskin/sessions/${KENNUNG}`;
const BERICHT = `lifeskin/lifeskin/reports/${KENNUNG}`;

let testEnv;

before(async () => {
  const rules = await readFile(resolve(repoRoot, "firestore.rules"), "utf8");
  testEnv = await initializeTestEnvironment({
    projectId,
    firestore: { host, port: Number(portText || 8080), rules },
  });
});

beforeEach(async () => {
  await testEnv.clearFirestore();
});

after(async () => {
  if (testEnv) await testEnv.cleanup();
});

const gast = () => testEnv.unauthenticatedContext().firestore();

// Eine Sitzung, wie der Trichter sie anlegt.
async function sitzungAnlegen(db) {
  return db.doc(SITZUNG).set({
    createdAt: "2026-09-19T14:58:00.000Z",
    code: "LS-2609-ABC",
    step: "opened",
    updatedAt: "2026-09-19T14:58:00.000Z",
  });
}

test("der Trichter darf die Kameramarke nachtragen", async () => {
  const db = gast();
  await assertSucceeds(sitzungAnlegen(db));
  await assertSucceeds(db.doc(SITZUNG).update({
    kameraOk: true, updatedAt: "2026-09-19T14:59:00.000Z",
  }));
});

test("der Laden darf seine vier Marken schreiben", async () => {
  const db = gast();
  await assertSucceeds(sitzungAnlegen(db));
  // Einzeln, wie der Laden es tut: Ein brandneues Feld reist nie mit
  // Daten, die ankommen muessen.
  await assertSucceeds(db.doc(SITZUNG).update({ produkteGesehen: true }));
  await assertSucceeds(db.doc(SITZUNG).update({ imKorb: true }));
  await assertSucceeds(db.doc(SITZUNG).update({ korbWert: 66, korbStueck: 2 }));
  await assertSucceeds(db.doc(SITZUNG).update({ adresseBegonnen: true }));
  await assertSucceeds(db.doc(SITZUNG).update({ shopKauf: true }));
});

test("ein Warenkorbwert bleibt eine Zahl, und eine plausible", async () => {
  const db = gast();
  await assertSucceeds(sitzungAnlegen(db));
  await assertFails(db.doc(SITZUNG).update({ korbWert: "66" }));
  await assertFails(db.doc(SITZUNG).update({ korbWert: -1 }));
  await assertFails(db.doc(SITZUNG).update({ korbStueck: 999 }));
});

test("der eigene Bildschirm fuer das Anliegen ist ein bekannter Schritt", async () => {
  const db = gast();
  await assertSucceeds(sitzungAnlegen(db));
  await assertSucceeds(db.doc(SITZUNG).update({
    step: "problemi", updatedAt: "2026-09-19T15:00:00.000Z",
  }));
  // Und ein Schritt, den es nicht gibt, kommt weiter nicht durch.
  await assertFails(db.doc(SITZUNG).update({ step: "sqaroni" }));
});

test("der Bericht traegt die Marke, dass die Nummer da ist - aber nie die Nummer", async () => {
  const db = gast();
  await assertSucceeds(db.doc(BERICHT).set({
    createdAt: "2026-09-19T14:58:00.000Z",
    code: "LS-2609-ABC",
    name: "Arta",
    sprache: "sq",
    status: "wartet",
    typ: "scan",
    photos: 3,
    numri: true,
  }));
  // Die Nummer selbst hat im Bericht nichts zu suchen: Der Link zur
  // Analyse ist zum Weitergeben gemacht.
  await testEnv.clearFirestore();
  await assertFails(db.doc(BERICHT).set({
    createdAt: "2026-09-19T14:58:00.000Z",
    code: "LS-2609-ABC",
    status: "wartet",
    phone: "+38344123456",
  }));
});

test("ein Feld, das die Regeln nicht kennen, weist das ganze Dokument ab", async () => {
  // Die Regel selbst - sie ist der Grund, warum jedes neue Feld einzeln
  // geschrieben wird.
  const db = gast();
  await assertSucceeds(sitzungAnlegen(db));
  await assertFails(db.doc(SITZUNG).update({ erfundenesFeld: true }));
});
