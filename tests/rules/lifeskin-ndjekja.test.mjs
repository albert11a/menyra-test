// DIE REGELN DER BEGLEITUNG - gegen den Emulator, mit dem ECHTEN Code des
// Kundenbereichs (ndjekja-daten.js, REST ohne Anmeldung) und Heart als
// CEO-Konto. Was hier "nein" sein muss, steht im Auftrag vom 26.09.:
// keine fremden Verlaeufe, keine erfundenen Arztnachrichten, keine interne
// Notiz beim Kunden, kein Termin, den ein Kunde abhakt.

import test, { after, before, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { initializeTestEnvironment } from "@firebase/rules-unit-testing";
import { doc, getDoc, setDoc, collection, getDocs } from "firebase/firestore";

import { NdjekjaDaten } from "../../apps/lifeskin-verkauf/ndjekja-daten.js";
import { felder } from "../../apps/lifeskin/lifeskin-session.js";

const repoRoot = dirname(
  fileURLToPath(new URL("../../package.json", import.meta.url)),
);
const projectId = `${process.env.MNYRA_RULES_PROJECT_ID || "mnyra-local"}-ndjekja`;
const firestoreHost = process.env.FIRESTORE_EMULATOR_HOST || "127.0.0.1:8080";
const [host, portText] = firestoreHost.split(":");
const EMU = `http://${host}:${portText || 8080}/v1/projects/${projectId}/databases/(default)/documents`;
const Z = "0123456789abcdef0123456789abcdef";
const FALL = `lifeskin/lifeskin/ndjekja/${Z}`;

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
  await testEnv.withSecurityRulesDisabled(async (ctx) => {
    await setDoc(doc(ctx.firestore(), "superadmins/heart-demo"), {
      active: true,
    });
  });
});
after(async () => {
  await testEnv?.cleanup();
});

const heart = () =>
  testEnv
    .authenticatedContext("heart-demo", {
      email: "heart.local@example.test",
      email_verified: true,
    })
    .firestore();
const kunde = (zugang = Z) =>
  new NdjekjaDaten({
    zugang,
    basis: EMU,
    fetchFn: (...a) => globalThis.fetch(...a),
  });

async function fallAnlegen(extra = {}) {
  await setDoc(doc(heart(), FALL), {
    kennung: "k1",
    code: "LS-1",
    emri: "Arta",
    statusi: "aktiv",
    porosia: { statusi: "konfirmuar" },
    startAt: "",
    startVon: "",
    kontrollet: {},
    kontrolliRadhes: "",
    fundit: { dita: 0, at: "", blickAt: "" },
    createdAt: "2026-09-26T10:00:00Z",
    updatedAt: "2026-09-26T10:00:00Z",
    ...extra,
  });
}

async function rest(pfad, optionen = {}) {
  return globalThis.fetch(`${EMU}/${pfad}`, optionen);
}

async function commit(writes) {
  return globalThis.fetch(`${EMU}:commit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ writes }),
  });
}

const name = (pfad) =>
  `projects/${projectId}/databases/(default)/documents/${pfad}`;

test("Heart legt an - ein Besucher nicht", async () => {
  await fallAnlegen();
  const fremd = await rest(
    `lifeskin/lifeskin/ndjekja?documentId=${"a".repeat(32)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fields: felder({ statusi: "aktiv" }) }),
    },
  );
  assert.equal(fremd.status, 403);
});

test("mit dem Zugang: lesen ja - aufzaehlen nein, falscher Zugang nichts", async () => {
  await fallAnlegen();
  const f = await kunde().fall();
  assert.equal(f.status, "ok");
  assert.equal(f.fall.emri, "Arta");
  assert.equal(
    (await rest("lifeskin/lifeskin/ndjekja")).status,
    403,
    "Faelle nicht auflistbar",
  );
  assert.equal((await kunde("f".repeat(32)).fall()).status, "fehlt");
  assert.equal(
    (await rest("lifeskin/lifeskin/ndjekja/kurz")).status,
    403,
    "Nur 32 Hexzeichen",
  );
});

test("der Start: einmal vom Kunden, danach nur noch Heart", async () => {
  await fallAnlegen();
  assert.equal((await kunde().starten("2026-09-26")).ok, true);
  assert.equal(
    (await kunde().starten("2026-09-20")).ok,
    false,
    "Ein zweites Mal nicht",
  );
  const falsch = await rest(
    `${FALL}?updateMask.fieldPaths=startAt&updateMask.fieldPaths=startVon&updateMask.fieldPaths=updatedAt`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fields: felder({
          startAt: "2026-09-26",
          startVon: "ekipi",
          updatedAt: "x",
        }),
      }),
    },
  );
  assert.equal(falsch.status, 403, "Der Kunde gibt sich nicht als Team aus");
  await setDoc(
    doc(heart(), FALL),
    { startAt: "2026-09-25", startVon: "ekipi" },
    { merge: true },
  );
  assert.equal((await kunde().fall()).fall.startAt, "2026-09-25");
});

test("ein Eintrag: angelegt, korrigiert - mit fundit im selben Commit", async () => {
  await fallAnlegen({ startAt: "2026-09-25" });
  const erst = await kunde().eintragSpeichern({
    dita: 1,
    data: "2026-09-25",
    perdorimi: "pjeserisht",
    ndjesia: ["thatesi"],
    mesazh: "A duhet?",
  });
  assert.equal(erst.ok, true);
  const zweit = await kunde().eintragSpeichern(
    { dita: 1, data: "2026-09-25", perdorimi: "po" },
    { vorhanden: erst.eintrag, altFundit: erst.fundit },
  );
  assert.equal(zweit.ok, true);
  const liste = await kunde().eintraege();
  assert.equal(liste.length, 1);
  assert.equal(liste[0].perdorimi, "po");
  assert.equal(liste[0].createdAt, erst.eintrag.createdAt);
  const f = (await kunde().fall()).fall;
  assert.equal(
    f.fundit.blickAt,
    erst.fundit.blickAt,
    "Die offene Frage bleibt markiert",
  );
  // Zwei Geraete: "neu" auf ein bestehendes Dokument scheitert sauber.
  const doppelt = await kunde().eintragSpeichern({
    dita: 1,
    data: "2026-09-25",
    perdorimi: "jo",
  });
  assert.deepEqual([doppelt.ok, doppelt.grund], [false, "stand"]);
});

test("Eintraege nur in der Form - und nur zu einem bestehenden Fall", async () => {
  await fallAnlegen({ startAt: "2026-09-25" });
  const eintrag = (id, felderWerte) =>
    commit([
      {
        update: {
          name: name(`${FALL}/shenime/${id}`),
          fields: felder(felderWerte),
        },
        currentDocument: { exists: false },
      },
    ]);
  const gut = {
    dita: 3,
    data: "2026-09-27",
    perdorimi: "po",
    ndjesia: [],
    mesazh: "",
    createdAt: "t",
    updatedAt: "t",
  };
  assert.equal(
    (await eintrag("t05", gut)).status,
    403,
    "Kennung passt nicht zum Tag",
  );
  assert.equal(
    (await eintrag("t03", { ...gut, diagnose: "akne" })).status,
    403,
    "Kein fremdes Feld",
  );
  assert.equal(
    (await eintrag("t03", { ...gut, ndjesia: ["hack"] })).status,
    403,
    "Nur die fuenf Antworten",
  );
  assert.equal(
    (await eintrag("t03", { ...gut, mesazh: "a".repeat(501) })).status,
    403,
    "Hoechstens 500 Zeichen",
  );
  assert.equal(
    (await eintrag("t03", { ...gut, perdorimi: "vielleicht" })).status,
    403,
  );
  assert.equal((await eintrag("t03", gut)).status, 200);
  const ohneFall = await commit([
    {
      update: {
        name: name(`lifeskin/lifeskin/ndjekja/${"e".repeat(32)}/shenime/t03`),
        fields: felder(gut),
      },
    },
  ]);
  assert.equal(ohneFall.status, 403, "Kein Eintrag ohne Fall");
});

test("was nur Heart darf: Status, Termine, Rueckmeldungen, Internes", async () => {
  await fallAnlegen({ startAt: "2026-09-19" });
  const patch = (felderWerte, maske) =>
    rest(
      `${FALL}?${maske.map((m) => `updateMask.fieldPaths=${m}`).join("&")}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fields: felder(felderWerte) }),
      },
    );
  assert.equal(
    (await patch({ statusi: "perfunduar" }, ["statusi"])).status,
    403,
  );
  assert.equal(
    (
      await patch(
        { kontrollet: { 7: { statusi: "kryer", nga: "Dr. Fake" } } },
        ["kontrollet"],
      )
    ).status,
    403,
    "Kein Termin, den der Kunde abhakt",
  );
  assert.equal(
    (
      await patch(
        {
          fundit: { dita: 1, at: "t", blickAt: "t", extra: 1 },
          updatedAt: "t",
        },
        ["fundit", "updatedAt"],
      )
    ).status,
    403,
  );
  const fakeArzt = await commit([
    {
      update: {
        name: name(`${FALL}/pergjigjet/x1`),
        fields: felder({
          tekst: "Gjithçka në rregull",
          nga: "Dr. Violeta Gashi",
          createdAt: "t",
        }),
      },
    },
  ]);
  assert.equal(fakeArzt.status, 403, "Keine erfundene Arztnachricht");
  // Heart darf.
  await setDoc(doc(heart(), `${FALL}/pergjigjet/p1`), {
    tekst: "Po.",
    nga: "Ekipi",
    lloji: "pergjigje",
    createdAt: "2026-09-26T12:00:00Z",
  });
  assert.equal(
    (await kunde().pergjigjet())[0].tekst,
    "Po.",
    "Der Kunde liest die Rueckmeldung",
  );
  await setDoc(
    doc(heart(), FALL),
    { kontrollet: { 7: { statusi: "kryer", at: "t", nga: "Ekipi" } } },
    { merge: true },
  );
  assert.equal((await kunde().fall()).fall.kontrollet["7"].statusi, "kryer");
});

test("ndjekjaIntern: nur Heart - weder lesen noch schreiben von aussen", async () => {
  await setDoc(doc(heart(), "lifeskin/lifeskin/ndjekjaIntern/k1"), {
    zugang: Z,
    shenimet: [{ tekst: "GEHEIM" }],
  });
  assert.equal((await rest("lifeskin/lifeskin/ndjekjaIntern/k1")).status, 403);
  assert.equal((await rest("lifeskin/lifeskin/ndjekjaIntern")).status, 403);
  const schreiben = await commit([
    {
      update: {
        name: name("lifeskin/lifeskin/ndjekjaIntern/k1"),
        fields: felder({ zugang: "x" }),
      },
    },
  ]);
  assert.equal(schreiben.status, 403);
  assert.equal(
    (await getDoc(doc(heart(), "lifeskin/lifeskin/ndjekjaIntern/k1"))).data()
      .shenimet[0].tekst,
    "GEHEIM",
  );
  assert.equal(
    (await getDocs(collection(heart(), "lifeskin/lifeskin/ndjekja"))).size,
    0,
  );
});
