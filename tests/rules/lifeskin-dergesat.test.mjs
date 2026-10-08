// DIE REGELN VON /dergesat - gegen den Emulator. Riba (eingetragen in
// dergesatZugang/riba) liest und geht nur vorwaerts; Barazuar, Riba
// ausbezahlt, Posta Beki und Zuruecknehmen bleiben bei Heart. Ein
// fremdes Konto sieht nichts.

import test, { after, before, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
} from "@firebase/rules-unit-testing";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  deleteDoc,
  setDoc,
  updateDoc,
} from "firebase/firestore";

import { austriDok, dergesaLesen, kthimNeDepo, levizjeDok, mbylljeDok, ndryshimi } from "../../shared/lifeskin-dergesat.js";

const repoRoot = dirname(
  fileURLToPath(new URL("../../package.json", import.meta.url)),
);
const projectId = `${process.env.MNYRA_RULES_PROJECT_ID || "mnyra-local"}-dergesat`;
const firestoreHost = process.env.FIRESTORE_EMULATOR_HOST || "127.0.0.1:8080";
const [host, portText] = firestoreHost.split(":");
const POROSI = "lifeskin/lifeskin/dergesat/fall1";
const ZUGANG = "lifeskin/lifeskin/dergesatZugang/riba";
const T = "2026-10-05T10:00:00.000Z";

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
    const db = ctx.firestore();
    await setDoc(doc(db, "superadmins/heart-demo"), { active: true });
    await setDoc(doc(db, ZUGANG), { uid: "riba-uid", perdoruesi: "kadrija" });
    await setDoc(doc(db, POROSI), {
      postaBeki: "PB-1",
      kodi: "A1",
      produkte: ["Acne Gel"],
      cmimi: 39,
      statusi: "porosi",
      createdAt: T,
      updatedAt: T,
      nga: "heart",
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
const riba = () =>
  testEnv
    .authenticatedContext("riba-uid", { email: "kadrija@dergesat.mnyra.com" })
    .firestore();
const fremd = () =>
  testEnv
    .authenticatedContext("jemand", { email: "jemand@example.test" })
    .firestore();
const gast = () => testEnv.unauthenticatedContext().firestore();

async function stand() {
  let d = null;
  await testEnv.withSecurityRulesDisabled(async (ctx) => {
    d = (await getDoc(doc(ctx.firestore(), POROSI))).data();
  });
  return dergesaLesen(d, "fall1");
}

async function setze(felder) {
  await testEnv.withSecurityRulesDisabled(async (ctx) => {
    await updateDoc(doc(ctx.firestore(), POROSI), felder);
  });
}

test("Riba und Heart lesen die Liste, Fremde und Gaeste nicht", async () => {
  await assertSucceeds(
    getDocs(collection(riba(), "lifeskin/lifeskin/dergesat")),
  );
  await assertSucceeds(
    getDocs(collection(heart(), "lifeskin/lifeskin/dergesat")),
  );
  await assertFails(getDocs(collection(fremd(), "lifeskin/lifeskin/dergesat")));
  await assertFails(getDocs(collection(gast(), "lifeskin/lifeskin/dergesat")));
  await assertFails(getDoc(doc(fremd(), POROSI)));
});

test("Zugang: Riba liest den eigenen Eintrag, Fremde nicht, schreiben nur Heart", async () => {
  await assertSucceeds(getDoc(doc(riba(), ZUGANG)));
  await assertSucceeds(getDoc(doc(heart(), ZUGANG)));
  await assertFails(getDoc(doc(fremd(), ZUGANG)));
  await assertFails(setDoc(doc(fremd(), ZUGANG), { uid: "jemand" }));
  await assertFails(setDoc(doc(riba(), ZUGANG), { uid: "riba-uid", x: 1 }));
  await assertSucceeds(setDoc(doc(heart(), ZUGANG), { uid: "riba-uid" }));
});

test("Riba: Gati, Te Beki, dann Pranuar - mit genau den Feldern aus shared/lifeskin-dergesat.js", async () => {
  await assertSucceeds(
    updateDoc(
      doc(riba(), POROSI),
      ndryshimi(await stand(), "gati", { roli: "riba", jetzt: T }),
    ),
  );
  assert.equal((await stand()).statusi, "gati");
  await assertSucceeds(
    updateDoc(
      doc(riba(), POROSI),
      ndryshimi(await stand(), "derguar", { roli: "riba", jetzt: T }),
    ),
  );
  assert.equal((await stand()).statusi, "derguar");
  await assertSucceeds(
    updateDoc(
      doc(riba(), POROSI),
      ndryshimi(await stand(), "pranuar", { roli: "riba", jetzt: T }),
    ),
  );
  assert.equal((await stand()).statusi, "pranuar");
});

test("Riba: Dërguar -> Anuluar geht", async () => {
  await setze({ statusi: "derguar", derguarAt: T });
  await assertSucceeds(
    updateDoc(
      doc(riba(), POROSI),
      ndryshimi(await stand(), "anuluar", { roli: "riba", jetzt: T }),
    ),
  );
});

test("Riba: eine Anuluar, die unterwegs war, kommt einmal zurueck in die Depo", async () => {
  await setze({ statusi: "anuluar", derguarAt: T, anuluarAt: T });
  const r = doc(riba(), POROSI);
  // Mit anderem Stand oder fremdem Feld nicht.
  await assertFails(
    updateDoc(r, { kthyerAt: T, updatedAt: T, nga: "riba", statusi: "porosi" }),
  );
  await assertFails(
    updateDoc(r, { kthyerAt: T, updatedAt: T, nga: "riba", cmimi: 1 }),
  );
  await assertSucceeds(
    updateDoc(r, kthimNeDepo(await stand(), { roli: "riba", jetzt: T })),
  );
  assert.equal((await stand()).kthyerAt, T);
  // Ein zweites Mal nicht.
  await assertFails(
    updateDoc(r, { kthyerAt: "2026-10-06T10:00:00.000Z", updatedAt: T, nga: "riba" }),
  );
});

test("Riba: eine Anuluar ohne Versand hat nichts zurueckzubringen", async () => {
  await setze({ statusi: "anuluar", anuluarAt: T });
  await assertFails(
    updateDoc(doc(riba(), POROSI), { kthyerAt: T, updatedAt: T, nga: "riba" }),
  );
});

test("Riba darf nicht springen, zuruecknehmen, abrechnen oder Daten aendern", async () => {
  const r = doc(riba(), POROSI);
  // Porosi direkt auf Dërguar (ohne Gati).
  await assertFails(
    updateDoc(r, {
      statusi: "derguar",
      derguarAt: T,
      updatedAt: T,
      nga: "riba",
    }),
  );
  // Porosi direkt auf Pranuar oder Anuluar.
  await assertFails(
    updateDoc(r, {
      statusi: "pranuar",
      pranuarAt: T,
      updatedAt: T,
      nga: "riba",
    }),
  );
  await assertFails(
    updateDoc(r, {
      statusi: "anuluar",
      anuluarAt: T,
      updatedAt: T,
      nga: "riba",
    }),
  );
  await setze({ statusi: "gati", gatiAt: T });
  // Te Beki, aber mit geaendertem Preis oder Posta Beki.
  await assertFails(
    updateDoc(r, {
      statusi: "derguar",
      derguarAt: T,
      updatedAt: T,
      nga: "riba",
      cmimi: 1,
    }),
  );
  await assertFails(
    updateDoc(r, {
      statusi: "derguar",
      derguarAt: T,
      updatedAt: T,
      nga: "riba",
      postaBeki: "X",
    }),
  );
  // Ohne "nga: riba".
  await assertFails(
    updateDoc(r, {
      statusi: "derguar",
      derguarAt: T,
      updatedAt: T,
      nga: "heart",
    }),
  );
  // Gati zurueck auf Porosi.
  await assertFails(
    updateDoc(r, { statusi: "porosi", gatiAt: "", updatedAt: T, nga: "riba" }),
  );
  // Pranuar zurueck, Barazuar, ausbezahlt.
  await setze({ statusi: "pranuar", derguarAt: T, pranuarAt: T });
  await assertFails(
    updateDoc(r, { statusi: "derguar", updatedAt: T, nga: "riba" }),
  );
  await assertFails(updateDoc(r, { barazuarAt: T, updatedAt: T, nga: "riba" }));
  await assertFails(
    updateDoc(r, { ribaPaguarAt: T, updatedAt: T, nga: "riba" }),
  );
  // Anlegen und loeschen.
  await assertFails(
    setDoc(doc(riba(), "lifeskin/lifeskin/dergesat/neu"), {
      statusi: "porosi",
    }),
  );
});

test("Ein Konto mit Ribas Adresse, aber ohne Eintrag, ist nicht Riba", async () => {
  const falsch = testEnv
    .authenticatedContext("anderes-konto", {
      email: "kadrija@dergesat.mnyra.com",
    })
    .firestore();
  await assertFails(getDoc(doc(falsch, POROSI)));
  await assertFails(
    updateDoc(doc(falsch, POROSI), {
      statusi: "derguar",
      derguarAt: T,
      updatedAt: T,
      nga: "riba",
    }),
  );
});

test("Heart legt an, aendert Posta Beki, rechnet ab und nimmt zurueck", async () => {
  const h = doc(heart(), "lifeskin/lifeskin/dergesat/fall2");
  await assertSucceeds(
    setDoc(h, {
      postaBeki: "PB-2",
      statusi: "porosi",
      cmimi: 39,
      produkte: [],
      createdAt: T,
      updatedAt: T,
      nga: "heart",
    }),
  );
  await assertSucceeds(
    updateDoc(h, { postaBeki: "PB-2b", updatedAt: T, nga: "heart" }),
  );
  await setze({ statusi: "pranuar", derguarAt: T, pranuarAt: T });
  await assertSucceeds(
    updateDoc(doc(heart(), POROSI), {
      barazuarAt: T,
      ribaPaguarAt: T,
      updatedAt: T,
      nga: "heart",
    }),
  );
  await setze({ statusi: "derguar", barazuarAt: "", ribaPaguarAt: "" });
  await assertSucceeds(
    updateDoc(
      doc(heart(), POROSI),
      ndryshimi(await stand(), "gati", { roli: "heart", jetzt: T }),
    ),
  );
  assert.equal((await stand()).statusi, "gati");
  await assertSucceeds(
    updateDoc(
      doc(heart(), POROSI),
      ndryshimi(await stand(), "porosi", { roli: "heart", jetzt: T }),
    ),
  );
  assert.equal((await stand()).statusi, "porosi");
});

// FINANCA (08.10.): Heart schreibt Ueberweisungen und eigene Eintraege,
// Riba liest mit, niemand sonst. Aendern gibt es nicht.
test("Financa: Heart schreibt, Riba liest, fremd und Gast nichts", async () => {
  const austri = austriDok({ kennungen: ["fall1"], bruto: 120, wu: 8.5, jetzt: T });
  const levizje = levizjeDok({ shuma: -20, arsyeja: "Benzinë", jetzt: T });
  await assertSucceeds(setDoc(doc(heart(), "lifeskin/lifeskin/dergesatFinanca/t1"), austri));
  await assertSucceeds(setDoc(doc(heart(), "lifeskin/lifeskin/dergesatFinanca/l1"), levizje));
  await assertSucceeds(getDocs(collection(riba(), "lifeskin/lifeskin/dergesatFinanca")));
  await assertFails(getDocs(collection(fremd(), "lifeskin/lifeskin/dergesatFinanca")));
  await assertFails(getDocs(collection(gast(), "lifeskin/lifeskin/dergesatFinanca")));
  // Riba schreibt nichts, auch nicht im Namen von Heart.
  await assertFails(setDoc(doc(riba(), "lifeskin/lifeskin/dergesatFinanca/r1"), levizje));
  await assertFails(deleteDoc(doc(riba(), "lifeskin/lifeskin/dergesatFinanca/l1")));
  // Aendern gibt es nicht, Loeschen nur Heart.
  await assertFails(updateDoc(doc(heart(), "lifeskin/lifeskin/dergesatFinanca/l1"), { shuma: -5 }));
  await assertSucceeds(deleteDoc(doc(heart(), "lifeskin/lifeskin/dergesatFinanca/l1")));
  // Kaputte Eintraege: WU groesser als der Betrag, fremde Felder, Null-Betrag, ohne Grund.
  await assertFails(setDoc(doc(heart(), "lifeskin/lifeskin/dergesatFinanca/x1"), { ...austri, wu: 200 }));
  await assertFails(setDoc(doc(heart(), "lifeskin/lifeskin/dergesatFinanca/x2"), { ...austri, extra: 1 }));
  await assertFails(setDoc(doc(heart(), "lifeskin/lifeskin/dergesatFinanca/x3"), { ...levizje, shuma: 0 }));
  await assertFails(setDoc(doc(heart(), "lifeskin/lifeskin/dergesatFinanca/x4"), { ...levizje, arsyeja: "" }));
  // Periode abschliessen: nur Heart, "deri" nach "prej".
  const mbyllje = mbylljeDok({ prej: "", deri: T, jetzt: "2026-10-06T10:00:00.000Z" });
  await assertSucceeds(setDoc(doc(heart(), "lifeskin/lifeskin/dergesatFinanca/m1"), mbyllje));
  await assertFails(setDoc(doc(riba(), "lifeskin/lifeskin/dergesatFinanca/m2"), mbyllje));
  await assertFails(setDoc(doc(heart(), "lifeskin/lifeskin/dergesatFinanca/m3"), { ...mbyllje, prej: "2026-10-09T10:00:00.000Z" }));
});
