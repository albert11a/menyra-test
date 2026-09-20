import test, { after, before, beforeEach } from "node:test";
import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
} from "@firebase/rules-unit-testing";
import { AUTH_FIXTURES, firestoreFor } from "./auth-fixtures.mjs";

// DIE MINIATUREN DER WARTESEITE - und die Linie, die sie nicht ueberschreiten.
//
// Auf der Warteseite sieht der Patient seine eigenen Aufnahmen als Kacheln
// zum Wischen. Das geht nur, weil daneben eine zweite, kleine Fassung
// liegt: reports/<kennung>/thumbs, oeffentlich lesbar wie der Bericht,
// den sie beschreibt.
//
// WAS DABEI NICHT PASSIEREN DARF, steht in dieser Datei. Die Aufnahmen in
// voller Aufloesung liegen in der Sitzung, und in der Sitzung stehen
// Telefonnummer und Anschrift. Der Link zur Analyse ist zum Weitergeben
// gemacht - waere von dort aus die Sitzung lesbar, verschickte jeder
// Patient beim Teilen seine Adresse mit.
//
// Drei Dinge muessen die Regeln also leisten:
//
//   1. Der Trichter (nicht angemeldet) darf Miniaturen ablegen, und die
//      Warteseite darf sie lesen und aufzaehlen. Ohne beides bleibt die
//      Reihe bei ihren Ersatzkacheln.
//   2. Klein heisst klein. Was hier durchkommt, ist oeffentlich - eine
//      Aufnahme in voller Aufloesung darf es nicht sein.
//   3. Die Sitzung bleibt zu. Weder ihre Felder noch ihre Fotos sind von
//      aussen lesbar, auch jetzt nicht.

const repoRoot = dirname(
  fileURLToPath(new URL("../../package.json", import.meta.url)),
);
// Eigenes Projekt im Emulator, aus demselben Grund wie bei den anderen
// Regelpruefungen: Der Laeufer startet die Dateien nebeneinander, und jede
// raeumt vor jedem Test auf. Im selben Projekt loeschten sie sich die
// Daten gegenseitig unter den Fuessen weg.
const projectId = `${process.env.MNYRA_RULES_PROJECT_ID || "mnyra-local"}-lifeskin-minis`;
const firestoreHost = process.env.FIRESTORE_EMULATOR_HOST || "127.0.0.1:8080";
const [host, portText] = firestoreHost.split(":");

const KENNUNG = "0123456789abcdef0123456789abcdef";
const BERICHT = `lifeskin/lifeskin/reports/${KENNUNG}`;
const MINIATUR = `${BERICHT}/thumbs/gerade`;
const SITZUNG = `lifeskin/lifeskin/sessions/${KENNUNG}`;
const FOTO = `${SITZUNG}/photos/gerade`;

// Ein Bild in der Groesse, die wirklich hinausgeht: 160 Punkte breit,
// kraeftig komprimiert, rund fuenf Kilobyte.
const jpegMit = (zeichen) => `data:image/jpeg;base64,${"A".repeat(zeichen)}`;

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

function miniatur(overrides = {}) {
  return {
    createdAt: "2026-09-19T14:58:00.000Z",
    blick: "gerade",
    jpeg: jpegMit(5000),
    breite: 160,
    hoehe: 213,
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// 1. Der Weg muss offen sein
// ---------------------------------------------------------------------------

test("der Trichter legt eine Miniatur ab, ohne angemeldet zu sein", async () => {
  // Wer aus einer Anzeige kommt, hat kein Konto. Ginge das nicht, gaebe es
  // die Reihe auf der Warteseite gar nicht.
  const db = firestoreFor(testEnv, AUTH_FIXTURES.guest);
  await assertSucceeds(db.doc(MINIATUR).set(miniatur()));
});

test("ein zweiter Versuch derselben Aufnahme scheitert nicht am ersten", async () => {
  // Wie bei den Fotos: Wer sie zweimal schickt, schickt dasselbe.
  const db = firestoreFor(testEnv, AUTH_FIXTURES.guest);
  await assertSucceeds(db.doc(MINIATUR).set(miniatur()));
  await assertSucceeds(db.doc(MINIATUR).set(miniatur()));
});

test("die Warteseite darf die Miniaturen lesen UND aufzaehlen", async () => {
  // Aufzaehlen ist hier nicht Bequemlichkeit: Die Seite weiss nicht, welche
  // Blickrichtungen es in diesem Fall gibt - drei, sechs oder gar keine.
  await testEnv.withSecurityRulesDisabled(async (context) => {
    await context.firestore().doc(MINIATUR).set(miniatur());
  });
  const db = firestoreFor(testEnv, AUTH_FIXTURES.guest);
  await assertSucceeds(db.doc(MINIATUR).get());
  await assertSucceeds(db.collection(`${BERICHT}/thumbs`).get());
});

// ---------------------------------------------------------------------------
// 2. Klein heisst klein
// ---------------------------------------------------------------------------

test("eine Aufnahme in voller Aufloesung kommt hier nicht durch", async () => {
  // DER GANZE GRUND FUER ZWEI GRENZEN. Die Fotos duerfen 900.000 Zeichen -
  // sie liegen in der Sitzung und werden nur vom Konto der Aerztin
  // gelesen. Hier liest jeder mit, der den Link bekommt; waere die Grenze
  // dieselbe, landete an dieser Stelle dasselbe Bild.
  const db = firestoreFor(testEnv, AUTH_FIXTURES.guest);
  await assertFails(db.doc(MINIATUR).set(miniatur({ jpeg: jpegMit(200000) })));
  await assertFails(db.doc(MINIATUR).set(miniatur({ jpeg: jpegMit(60001) })));
  await assertSucceeds(db.doc(MINIATUR).set(miniatur({ jpeg: jpegMit(59000) })));
});

test("nur JPEG als Datenzeile - keine fremde Adresse", async () => {
  // Eine fremde Adresse waere eine Ladequelle, die niemand geprueft hat -
  // und sie stuende auf dem Bildschirm, den jeder Patient sieht.
  const db = firestoreFor(testEnv, AUTH_FIXTURES.guest);
  await assertFails(db.doc(MINIATUR).set(miniatur({ jpeg: "https://example.test/x.jpg" })));
  await assertFails(db.doc(MINIATUR).set(miniatur({ jpeg: "data:text/html;base64,AAAA" })));
  await assertFails(db.doc(MINIATUR).set(miniatur({ jpeg: "<svg onload=alert(1)>" })));
});

test("nur die Blickrichtungen, die es wirklich gibt", async () => {
  const db = firestoreFor(testEnv, AUTH_FIXTURES.guest);
  // "zona" ist die eine Aufnahme der Wege mit Foto: eine Stelle der
  // Haut, kein Gesicht aus vier Richtungen.
  for (const blick of ["gerade", "rechts", "links", "oben", "rechts-2", "oben-9", "zona"]) {
    await assertSucceeds(
      db.doc(`${BERICHT}/thumbs/${blick}`).set(miniatur({ blick })),
    );
  }
  for (const blick of ["hinten", "gerade-", "gerade-1", "gerade-10", ""]) {
    if (!blick) continue;
    await assertFails(
      db.doc(`${BERICHT}/thumbs/${blick}`).set(miniatur({ blick })),
    );
  }
});

test("fremde Felder kommen nicht durch", async () => {
  // Dieselbe Lehre wie ueberall hier: Ein Feld, das die Regeln nicht
  // kennen, weist mit hasOnly den GANZEN Schreibvorgang ab.
  const db = firestoreFor(testEnv, AUTH_FIXTURES.guest);
  await assertFails(db.doc(MINIATUR).set(miniatur({ phone: "+38344123456" })));
  await assertFails(db.doc(MINIATUR).set(miniatur({ status: "fertig" })));
});

test("niemand von aussen loescht eine Miniatur", async () => {
  await testEnv.withSecurityRulesDisabled(async (context) => {
    await context.firestore().doc(MINIATUR).set(miniatur());
  });
  const db = firestoreFor(testEnv, AUTH_FIXTURES.guest);
  await assertFails(db.doc(MINIATUR).delete());
});

// ---------------------------------------------------------------------------
// 3. Die Sitzung bleibt zu
// ---------------------------------------------------------------------------

test("die Aufnahmen in voller Aufloesung bleiben beim Konto der Aerztin", async () => {
  // DAS IST DIE LINIE. Sie war der einzige Grund, ueberhaupt eine zweite,
  // kleine Fassung zu bauen - und ein Test, der sie nicht prueft, laesst
  // ihren Wegfall still durchgehen.
  await testEnv.withSecurityRulesDisabled(async (context) => {
    await context.firestore().doc(FOTO).set({
      createdAt: "2026-09-19T14:58:00.000Z",
      blick: "gerade",
      jpeg: jpegMit(400000),
      breite: 1440,
      hoehe: 1920,
    });
  });
  const db = firestoreFor(testEnv, AUTH_FIXTURES.guest);
  await assertFails(db.doc(FOTO).get());
  await assertFails(db.collection(`${SITZUNG}/photos`).get());
});

test("und die Sitzung selbst erst recht - dort stehen Nummer und Anschrift", async () => {
  await testEnv.withSecurityRulesDisabled(async (context) => {
    await context.firestore().doc(SITZUNG).set({
      createdAt: "2026-09-19T14:58:00.000Z",
      phone: "+38344123456",
      phoneConsent: true,
    });
  });
  const db = firestoreFor(testEnv, AUTH_FIXTURES.guest);
  await assertFails(db.doc(SITZUNG).get());
  // Auch nicht als angemeldeter Besucher ohne Rolle: Ein Konto zu haben
  // ist hier kein Recht.
  await assertFails(firestoreFor(testEnv, AUTH_FIXTURES.user).doc(SITZUNG).get());
});
