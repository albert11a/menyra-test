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

// Landing 2 misst, wie weit ein Wirt auf seiner Praesentation gekommen ist.
//
// Die Seite ist oeffentlich und der Betrachter nicht angemeldet - was er
// schreiben darf, steht deshalb ausschliesslich hier in den Regeln. Zwei
// Dinge muessen sie leisten:
//
//   1. Der Wirt (nicht angemeldet) darf seine eigene Sitzung anlegen und
//      fortschreiben. Ohne das gaebe es keine Messung.
//   2. Dieses Recht darf nicht mehr sein als das. Kein fremdes Feld, kein
//      Ueberschreiben der Startzeit, kein Lesen durch Dritte, kein Loeschen -
//      und vor allem kein Weg von hier in die Daten des Lokals.

const repoRoot = dirname(
  fileURLToPath(new URL("../../package.json", import.meta.url)),
);
// Eigenes Projekt im Emulator, nicht "mnyra-local".
//
// Der Testlaeufer startet die Dateien nebeneinander, und jede raeumt vor
// jedem Test die Datenbank auf. Im selben Projekt loeschen sie sich dabei
// gegenseitig die Daten unter den Fuessen weg - die Tests fallen dann
// abwechselnd und aus einem Grund, der mit ihnen nichts zu tun hat. Ein
// eigenes Projekt ist eine eigene Datenbank; die Regeln sind dieselben.
const projectId = `${process.env.MNYRA_RULES_PROJECT_ID || "mnyra-local"}-landing2`;
const firestoreHost = process.env.FIRESTORE_EMULATOR_HOST || "127.0.0.1:8080";
const [host, portText] = firestoreHost.split(":");
const seed = JSON.parse(
  await readFile(resolve(repoRoot, "seed/data/mnyra-local-seed.json"), "utf8"),
);

const RESTAURANT_ID = "pidhi-madh";
const PATH = `restaurants/${RESTAURANT_ID}/landing2Sessions/session-1`;

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
  await testEnv.withSecurityRulesDisabled(async (context) => {
    const db = context.firestore();
    const batch = db.batch();
    for (const document of seed.documents || []) {
      batch.set(db.doc(document.path), document.data || {});
    }
    await batch.commit();
  });
});

after(async () => {
  if (testEnv) await testEnv.cleanup();
});

function session(overrides = {}) {
  return {
    slug: "pidhi-madh",
    surface: "landing2",
    events: { landing2_open: 1200, landing2_profile_seen: 8400 },
    outcome: "",
    totalMs: 9600,
    eventCount: 2,
    startedAt: "2026-08-21T10:00:00.000Z",
    updatedAt: "2026-08-21T10:00:09.600Z",
    ...overrides,
  };
}

test("der Wirt kann seine Sitzung anlegen, ohne angemeldet zu sein", async () => {
  const db = firestoreFor(testEnv, AUTH_FIXTURES.guest);
  await assertSucceeds(db.doc(PATH).set(session()));
});

test("die Sitzung darf beliebig oft nachgetragen werden", async () => {
  const db = firestoreFor(testEnv, AUTH_FIXTURES.guest);
  await assertSucceeds(db.doc(PATH).set(session()));
  await assertSucceeds(
    db.doc(PATH).set(
      session({
        outcome: "claim",
        events: { landing2_open: 1200, landing2_claim_click: 1 },
        totalMs: 1201,
      }),
    ),
  );
});

test("die Startzeit einer Sitzung bleibt stehen", async () => {
  // Sonst liessen sich zwei Sitzungen zu einer verschmelzen und die
  // Auswertung waere nicht mehr nachvollziehbar.
  const db = firestoreFor(testEnv, AUTH_FIXTURES.guest);
  await assertSucceeds(db.doc(PATH).set(session()));
  await assertFails(
    db.doc(PATH).set(session({ startedAt: "2026-01-01T00:00:00.000Z" })),
  );
});

test("fremde Felder kommen nicht durch", async () => {
  const db = firestoreFor(testEnv, AUTH_FIXTURES.guest);
  await assertFails(db.doc(PATH).set(session({ ownerUid: "outside-demo" })));
  await assertFails(db.doc(PATH).set(session({ plan: "pro" })));
});

test("die Seite kann sich nicht als etwas anderes ausgeben", async () => {
  const db = firestoreFor(testEnv, AUTH_FIXTURES.guest);
  await assertFails(db.doc(PATH).set(session({ surface: "landing1" })));
  await assertFails(db.doc(PATH).set(session({ surface: "" })));
});

test("unsinnige Werte werden abgewiesen", async () => {
  const db = firestoreFor(testEnv, AUTH_FIXTURES.guest);
  await assertFails(db.doc(PATH).set(session({ totalMs: -1 })));
  await assertFails(db.doc(PATH).set(session({ totalMs: 21600001 })));
  await assertFails(db.doc(PATH).set(session({ totalMs: 12.5 })));
  await assertFails(db.doc(PATH).set(session({ outcome: "gekauft" })));
  await assertFails(db.doc(PATH).set(session({ slug: "x".repeat(121) })));
});

test("die Sitzung kann nicht geloescht werden", async () => {
  const db = firestoreFor(testEnv, AUTH_FIXTURES.guest);
  await assertSucceeds(db.doc(PATH).set(session()));
  await assertFails(db.doc(PATH).delete());
});

test("nur der Inhaber und das CEO-Konto lesen die Sitzungen", async () => {
  await testEnv.withSecurityRulesDisabled(async (context) => {
    await context.firestore().doc(PATH).set(session());
  });
  await assertSucceeds(
    firestoreFor(testEnv, AUTH_FIXTURES.owner).doc(PATH).get(),
  );
  await assertFails(firestoreFor(testEnv, AUTH_FIXTURES.guest).doc(PATH).get());
  await assertFails(
    firestoreFor(testEnv, AUTH_FIXTURES.outsider).doc(PATH).get(),
  );
});

test("von der Messung fuehrt kein Weg in die Daten des Lokals", async () => {
  // Der eine Schreibpfad, den Landing 2 hat, darf nicht mehr oeffnen als
  // dieses eine Dokument.
  const db = firestoreFor(testEnv, AUTH_FIXTURES.guest);
  await assertFails(
    db
      .doc(`restaurants/${RESTAURANT_ID}`)
      .set({ name: "Uebernommen" }, { merge: true }),
  );
  await assertFails(
    db
      .doc(`restaurants/${RESTAURANT_ID}/public/menu`)
      .set({ items: [] }, { merge: true }),
  );
  await assertFails(
    db
      .doc(`restaurants/${RESTAURANT_ID}/socialPosts/neu`)
      .set({ caption: "x" }),
  );
  await assertFails(
    db
      .doc(`restaurants/${RESTAURANT_ID}/landingSessions/session-1`)
      .set(session()),
  );
});
