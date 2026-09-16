// Der Meldungs-Waechter: eine Zwischenloesung, und sie sagt es selbst.
//
// WARUM ES IHN GIBT.
//
// Eine Meldung zu SCHICKEN ist einfach - dafuer reicht der Admin-Schluessel,
// und es dauert eine Sekunde. Schwer ist das MERKEN: Jemand muss in dem
// Augenblick wach sein, in dem die Analyse ankommt. Genau dafuer gibt es
// notifyCeoOnLifeskinSessionWrite - eine Cloud Function, die bei jedem
// Schreibvorgang von selbst anspringt. Sie steht fertig im Code und ist
// nicht deployt, und bis jemand mit Deploy-Rechten sie hochschickt, gibt es
// niemanden, der es merkt.
//
// Dieser Waechter ist der Ersatz dafuer, und er ist schlechter: Er springt
// nicht an, er schaut nach - alle fuenfzehn Minuten, angestossen von einem
// GitHub-Zeitplan. Eine Analyse um 09:01 meldet er um 09:15. Dafuer braucht
// er nur, was der Admin-Schluessel ohnehin darf: Firestore lesen und
// schreiben und Push schicken.
//
// ER GEHOERT WIEDER WEG, sobald die Functions deployt sind. Doppelt meldet
// er dann zwar nicht - er schreibt dasselbe Dokument, das die Funktion
// schreibt, und wer zuerst kommt, gewinnt -, aber ein Zeitplan, der jede
// Viertelstunde nachsieht, ob eine Funktion ihre Arbeit getan hat, ist kein
// Zustand, den man behaelt. Der Schalter dafuer steht in
// .github/workflows/mnyra-lifeskin-meldungen.yml.
//
// Aufruf:
//   node scripts/meldungs-waechter/waechter.mjs            (schickt wirklich)
//   node scripts/meldungs-waechter/waechter.mjs --trocken  (sagt nur, was waere)

import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { getMessaging } from "firebase-admin/messaging";
import { readFileSync } from "node:fs";

import {
  FENSTER_MS,
  HOECHSTENS_JE_LAUF,
  baueMeldung,
  faelligeMeldungen,
  meldungsKennung
} from "./meldungs-regeln.mjs";

// Dieselbe Kennung wie in shared/ceo-access.js und in den Cloud Functions.
const CEO_UID = "aklBkkIuZ7Nrpx266TJn63rrxX62";
const TENANT = "lifeskin";
const ICON = "/apps/mnyra-heart/assets/icon-192.png?v=2026-03-20-heart-icon-normal-2";
const START = "https://mnyra.com";

const trocken = process.argv.includes("--trocken");

function schluesselLesen() {
  const roh = process.env.MNYRA_FIREBASE_ADMIN_KEY || "";
  const pfad = process.env.GOOGLE_APPLICATION_CREDENTIALS || "";
  if (roh.trim()) return JSON.parse(roh);
  if (pfad.trim()) return JSON.parse(readFileSync(pfad, "utf8"));
  throw new Error("Kein Schluessel: MNYRA_FIREBASE_ADMIN_KEY oder GOOGLE_APPLICATION_CREDENTIALS setzen.");
}

const schluessel = schluesselLesen();
initializeApp({ credential: cert(schluessel), projectId: schluessel.project_id });
const db = getFirestore();

function sagen(...teile) {
  console.log("[waechter]", ...teile);
}

// Wer die Meldung bekommt - dieselbe Regel wie ladeLifeskinEmpfaenger() in
// den Cloud Functions: der feste Empfaenger immer, die Zweitzugaenge, wenn
// sie lesbar sind.
async function empfaenger() {
  const uids = new Set([CEO_UID]);
  try {
    const snap = await db.collection("superadmins").limit(20).get();
    snap.forEach((doc) => { if (doc.id) uids.add(doc.id); });
  } catch (fehler) {
    sagen("superadmins nicht lesbar:", fehler?.message);
  }
  return Array.from(uids);
}

// Nur Sitzungen, die ueberhaupt bis zum Scan gekommen sind. Alles davor -
// "opened", "named", "camera" - ist ein Seitenaufruf und keine Analyse.
async function sitzungen() {
  const snap = await db
    .collection("lifeskin").doc(TENANT).collection("sessions")
    .where("step", "in", ["captured", "result", "offer", "address", "ordered"])
    .get();
  return snap.docs.map((doc) => ({ id: doc.id, ...(doc.data() || {}) }));
}

async function geraeteTokens(uid) {
  const snap = await db
    .collection("users").doc(uid).collection("devices")
    .where("enabled", "==", true)
    .limit(30)
    .get();
  const tokens = [];
  snap.forEach((doc) => {
    const token = String(doc.get("token") || "").trim();
    if (token) tokens.push({ token, ref: doc.ref });
  });
  return tokens;
}

// Das Dokument ANLEGEN, nicht schreiben.
//
// create() scheitert, wenn es schon da steht - und genau daran haengt die
// Entscheidung, ob geschickt wird. Ein set({ merge: true }) wuerde jedes
// Mal gelingen und jede Viertelstunde dieselbe Meldung schicken. Und
// sobald die Cloud Function laeuft, legt SIE das Dokument an: Dann
// scheitert der Waechter hier und schweigt, ohne dass jemand ihn abstellen
// muss.
async function meldungAnlegen(uid, kennung, nutzlast) {
  const ref = db.collection("users").doc(uid).collection("notifications").doc(kennung);
  try {
    await ref.create({
      ...nutzlast,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp()
    });
    return true;
  } catch (fehler) {
    // ALREADY_EXISTS (Code 6) ist der Normalfall, kein Fehler.
    if (fehler?.code === 6 || /already exists/i.test(fehler?.message || "")) return false;
    throw fehler;
  }
}

async function schicken(uid, kennung, nutzlast) {
  const geraete = await geraeteTokens(uid);
  if (!geraete.length) {
    sagen(`${uid}: kein Geraet mit Meldungen`);
    return { gesendet: 0, fehlgeschlagen: 0 };
  }
  const antwort = await getMessaging().sendEachForMulticast({
    tokens: geraete.map((g) => g.token),
    notification: { title: "LifeSkin", body: nutzlast.text },
    data: {
      notificationId: kennung,
      userId: uid,
      type: nutzlast.type,
      link: nutzlast.link
    },
    webpush: {
      fcmOptions: { link: `${START}${nutzlast.link}` },
      notification: {
        title: "LifeSkin",
        body: nutzlast.text,
        icon: ICON,
        badge: ICON,
        silent: false,
        vibrate: [180, 90, 180],
        renotify: true,
        // DIESELBE MARKE wie in sendWebPushOnNotificationCreate. Sollten
        // Waechter und Funktion einmal beide schicken, legt das Telefon die
        // zweite Meldung auf die erste, statt zwei anzuzeigen.
        tag: `menyra_notif_${kennung}`
      }
    }
  });

  // Tote Tokens stilllegen - sonst waechst die Liste, und jeder Lauf
  // schickt an Geraete, die es nicht mehr gibt.
  const aufraeumen = [];
  antwort.responses.forEach((eintrag, i) => {
    if (eintrag.success) return;
    const code = String(eintrag.error?.code || "");
    if (!/registration-token-not-registered|invalid-registration-token|invalid-argument/.test(code)) return;
    aufraeumen.push(geraete[i].ref.set({
      enabled: false,
      token: "",
      lastErrorCode: code,
      updatedAt: FieldValue.serverTimestamp()
    }, { merge: true }));
  });
  if (aufraeumen.length) await Promise.allSettled(aufraeumen);

  return { gesendet: antwort.successCount, fehlgeschlagen: antwort.failureCount };
}

async function lauf() {
  const jetzt = Date.now();
  const alle = await sitzungen();
  const ziele = await empfaenger();
  sagen(`${alle.length} Sitzungen ab "captured", ${ziele.length} Empfaenger, Fenster ${Math.round(FENSTER_MS / 60000)} min`);

  let geschickt = 0;
  for (const sitzung of alle) {
    const faellig = faelligeMeldungen(sitzung, { jetzt });
    if (!faellig.length) continue;

    for (const vorlage of faellig) {
      // DER DECKEL ZAEHLT MELDUNGEN, NICHT EMPFAENGER. Eine Analyse geht an
      // den CEO und an jeden Zweitzugang - das sind heute neun Dokumente
      // fuer einen Fall. Zaehlte der Deckel die, bliebe er mitten in einem
      // Fall stehen: Die Haelfte der Empfaenger wuesste Bescheid, die
      // andere nie, denn beim naechsten Lauf steht das Dokument schon da.
      if (geschickt >= HOECHSTENS_JE_LAUF) {
        sagen(`Deckel erreicht (${HOECHSTENS_JE_LAUF} Meldungen). Der Rest wartet auf den naechsten Lauf.`);
        return;
      }
      const kennung = meldungsKennung(vorlage.type, sitzung.id);
      let etwasGetan = false;
      for (const uid of ziele) {
        const nutzlast = baueMeldung({ vorlage, sessionId: sitzung.id, sitzung, uid });
        if (trocken) {
          const ref = db.collection("users").doc(uid).collection("notifications").doc(kennung);
          const da = (await ref.get()).exists;
          sagen(`[trocken] ${uid} ${kennung}: ${da ? "steht schon da" : "WUERDE MELDEN"} - "${nutzlast.text}"`);
          etwasGetan = etwasGetan || !da;
          continue;
        }
        const neu = await meldungAnlegen(uid, kennung, nutzlast);
        if (!neu) continue;
        etwasGetan = true;
        const ergebnis = await schicken(uid, kennung, nutzlast);
        sagen(`gemeldet: ${kennung} an ${uid} (${ergebnis.gesendet} Geraete, ${ergebnis.fehlgeschlagen} Fehler)`);
      }
      if (etwasGetan) geschickt += 1;
    }
  }
  if (!geschickt) sagen("Nichts Neues.");
  else sagen(`${geschickt} Meldung(en)${trocken ? " waeren" : ""} hinaus.`);
}

lauf()
  .then(() => process.exit(0))
  .catch((fehler) => {
    console.error("[waechter] FEHLER:", fehler?.message || fehler);
    process.exit(1);
  });
