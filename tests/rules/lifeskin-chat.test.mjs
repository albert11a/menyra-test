// DIE REGELN DES CHATS - gegen den Emulator, mit den ECHTEN Bausteinen
// (shared/lifeskin-chat.js). Was "nein" sein muss: fremde Chats aufzaehlen,
// Team-Nachrichten oder Status als Kunde, Nachrichten nachtraeglich
// aendern, Nachrichten in einen Chat, den es nicht gibt.

import test, { after, before, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { assertFails, assertSucceeds, initializeTestEnvironment } from "@firebase/rules-unit-testing";
import { collection, doc, getDoc, getDocs, serverTimestamp, setDoc, Timestamp, updateDoc } from "firebase/firestore";

import {
  chatAnlegen, kundenText, kundenBild, kundenAntwort, teamText, teamProdukte, teamFormular,
  nachrichtKennung, vorschauVon
} from "../../shared/lifeskin-chat.js";

const repoRoot = dirname(fileURLToPath(new URL("../../package.json", import.meta.url)));
const projectId = `${process.env.MNYRA_RULES_PROJECT_ID || "mnyra-local"}-chat`;
const firestoreHost = process.env.FIRESTORE_EMULATOR_HOST || "127.0.0.1:8080";
const [host, portText] = firestoreHost.split(":");
const Z = "0123456789abcdef0123456789abcdef";
const CHAT = `lifeskin/lifeskin/chats/${Z}`;

let testEnv;
before(async () => {
  const rules = await readFile(resolve(repoRoot, "firestore.rules"), "utf8");
  testEnv = await initializeTestEnvironment({ projectId, firestore: { host, port: Number(portText || 8080), rules } });
});
beforeEach(async () => {
  await testEnv.clearFirestore();
  await testEnv.withSecurityRulesDisabled(async (ctx) => {
    await setDoc(doc(ctx.firestore(), "superadmins/heart-demo"), { active: true });
  });
});
after(async () => { await testEnv?.cleanup(); });

const heart = () => testEnv.authenticatedContext("heart-demo", { email: "heart.local@example.test", email_verified: true }).firestore();
const kunde = () => testEnv.unauthenticatedContext().firestore();
// "at" ist die Serverzeit - jede Nachricht traegt sie (Regel: == request.time).
const nachricht = (db, n, id = nachrichtKennung()) => setDoc(doc(db, `${CHAT}/nachrichten/${id}`), { ...n, at: serverTimestamp() });

test("Kunde legt seinen Chat an und schreibt Text, Foto und Formular-Antwort", async () => {
  const db = kunde();
  await assertSucceeds(setDoc(doc(db, CHAT), chatAnlegen({ sessionId: "abc123", code: "LS-0710-ABCDE", geraet: { os: "ios" } })));
  const text = kundenText("Përshëndetje, a është për lëkurë të yndyrshme?");
  await assertSucceeds(nachricht(db, text));
  await assertSucceeds(nachricht(db, kundenBild("data:image/jpeg;base64,/9j/4AAQ")));
  await assertSucceeds(nachricht(db, kundenAntwort("0abcdefgh", { emri: "Arta", telefoni: "044 123" })));
  // Liste in Heart, Entwurf, gelesen bis
  await assertSucceeds(updateDoc(doc(db, CHAT), {
    letzte: { ...vorschauVon(text), at: serverTimestamp() }, entwurf: { text: "dhe a", t: new Date().toISOString() },
    kundeGelesenAt: serverTimestamp(), updatedAt: new Date().toISOString()
  }));
  // Lesen mit dem Zugang
  await assertSucceeds(getDoc(doc(db, CHAT)));
  const alle = await assertSucceeds(getDocs(collection(db, `${CHAT}/nachrichten`)));
  assert.equal(alle.size, 3);
});

test("Kunde darf nicht: aufzaehlen, Status setzen, als Team schreiben, aendern, in fremde/leere Chats", async () => {
  const db = kunde();
  await setDoc(doc(db, CHAT), chatAnlegen({ sessionId: "s", code: "c" }));
  await assertFails(getDocs(collection(db, "lifeskin/lifeskin/chats")));
  await assertFails(updateDoc(doc(db, CHAT), { status: "erledigt", updatedAt: new Date().toISOString() }));
  await assertFails(updateDoc(doc(db, CHAT), { teamGelesenAt: new Date().toISOString(), updatedAt: new Date().toISOString() }));
  await assertFails(updateDoc(doc(db, CHAT), { letzte: { ...vorschauVon(kundenText("x")), von: "team", at: serverTimestamp() }, updatedAt: new Date().toISOString() }));
  // Eine erfundene Zeit (Uhr des Telefons) zaehlt nicht - nur die des Servers.
  await assertFails(setDoc(doc(db, `${CHAT}/nachrichten/${nachrichtKennung()}`), { ...kundenText("x"), at: Timestamp.fromMillis(Date.now() + 3600000) }));
  await assertFails(setDoc(doc(db, `${CHAT}/nachrichten/${nachrichtKennung()}`), kundenText("ohne at")));
  await assertFails(updateDoc(doc(db, CHAT), { kundeGelesenAt: Timestamp.fromMillis(Date.now() + 3600000), updatedAt: new Date().toISOString() }));
  await assertFails(nachricht(db, teamText("Ich bin Dr. Gashi")));
  await assertFails(nachricht(db, { ...kundenText("x"), von: "team" }));
  await assertFails(nachricht(db, { ...kundenText("x"), art: "produkte", produkte: [{ id: "a", name: "A", preis: 1 }] }));
  await assertFails(nachricht(db, kundenText("x"), "BÖSE-ID"));
  await assertFails(nachricht(db, { ...kundenText("x"), extra: 1 }));
  await assertFails(nachricht(db, { ...kundenBild("data:image/jpeg;base64,AA"), bild: "javascript:alert(1)" }));
  await assertFails(nachricht(db, { ...kundenText("x"), text: "a".repeat(2001) }));
  const id = nachrichtKennung();
  await nachricht(db, kundenText("erste"), id);
  await assertFails(setDoc(doc(db, `${CHAT}/nachrichten/${id}`), { ...kundenText("geaendert"), at: serverTimestamp() }));
  // Ein Chat, der nicht angelegt ist, nimmt nichts an.
  const fremd = "fedcba9876543210fedcba9876543210";
  await assertFails(setDoc(doc(db, `lifeskin/lifeskin/chats/${fremd}/nachrichten/${nachrichtKennung()}`), { ...kundenText("x"), at: serverTimestamp() }));
  // Ein neuer Chat beginnt immer "offen".
  await assertFails(setDoc(doc(db, `lifeskin/lifeskin/chats/${fremd}`), { ...chatAnlegen(), status: "bestellt" }));
  // Kein kurzer/erfundener Zugang.
  await assertFails(setDoc(doc(db, "lifeskin/lifeskin/chats/abc"), chatAnlegen()));
});

test("Heart: listet, schreibt Text/Produkte/Formular, setzt Status und gelesen", async () => {
  await setDoc(doc(kunde(), CHAT), chatAnlegen({ sessionId: "s", code: "c" }));
  const db = heart();
  await assertSucceeds(getDocs(collection(db, "lifeskin/lifeskin/chats")));
  await assertSucceeds(nachricht(db, teamText("Mirëdita! Si mund t’ju ndihmoj?", "Dr. Gashi")));
  await assertSucceeds(nachricht(db, teamProdukte([{ id: "lf-acne", name: "LF ACNE", preis: 15 }, { id: "lf-moistur", name: "LF MOISTUR", preis: 15 }], 19)));
  await assertSucceeds(nachricht(db, teamFormular(["emri", "telefoni", "adresa"])));
  await assertSucceeds(updateDoc(doc(db, CHAT), { status: "erledigt", teamGelesenAt: new Date().toISOString(), teamTipptAt: new Date().toISOString() }));
  // Der Kunde sieht die Team-Nachrichten.
  const alle = await getDocs(collection(kunde(), `${CHAT}/nachrichten`));
  assert.equal(alle.size, 3);
});
