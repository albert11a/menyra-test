// DERGESAT IN HEART - Firestore (Auftrag 05.10.). Regeln und Rechnung:
// shared/lifeskin-dergesat.js, Zeichnen: heart-lifeskin-dergesat-render.js,
// Knoepfe und Abgleich: heart-lifeskin-dergesat.js.

import { db } from "/shared/firebase-config.js";
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  runTransaction,
  setDoc,
  updateDoc
} from "/shared/vendor/firebase/11.0.0/firebase-firestore.js";
import { dergesaLesen, ndryshimi, postaBekiGueltig } from "../../shared/lifeskin-dergesat.js";

const TENANT = "lifeskin";
const dergesaRef = (kennung) => doc(db, "lifeskin", TENANT, "dergesat", kennung);
const berichtRef = (kennung) => doc(db, "lifeskin", TENANT, "reports", kennung);

// Live: jede Aenderung von /dergesat (Riba tippt "Te Beki") steht sofort
// in Heart.
export function horcheDergesat(beiAenderung) {
  return onSnapshot(collection(db, "lifeskin", TENANT, "dergesat"), (snap) => {
    const alle = {};
    for (const d of snap.docs) alle[d.id] = dergesaLesen(d.data() || {}, d.id);
    beiAenderung(alle);
  }, () => beiAenderung(null));
}

// Posta Beki speichern. Legt die Bestellung auf /dergesat an (Chip
// Porosiat) oder aendert nur Nummer, Produkte und Preis - der Stand bleibt.
// Leer und noch Porosi: Die Bestellung verschwindet wieder von /dergesat.
export async function postaBekiRuaj({ kennung, postaBeki, kodi = "", produkte = [], cmimi = 0, jetzt = new Date().toISOString() }) {
  const nummer = postaBekiGueltig(postaBeki);
  return runTransaction(db, async (tx) => {
    const snap = await tx.get(dergesaRef(kennung));
    const alt = snap.exists() ? dergesaLesen(snap.data() || {}, kennung) : null;
    if (!nummer) {
      if (!alt) return { was: "nichts" };
      if (alt.statusi !== "porosi") throw new Error(`Steht schon auf „${alt.statusi}“ – Posta Beki kann nicht mehr leer sein.`);
      tx.delete(dergesaRef(kennung));
      return { was: "entfernt" };
    }
    const felder = {
      postaBeki: nummer,
      kodi: String(kodi || "").slice(0, 40),
      produkte: (produkte || []).map((p) => String(p).slice(0, 80)).filter(Boolean).slice(0, 20),
      cmimi: Math.max(0, Math.round((Number(cmimi) || 0) * 100) / 100),
      updatedAt: jetzt,
      nga: "heart"
    };
    if (alt) {
      tx.update(dergesaRef(kennung), felder);
      return { was: "geaendert" };
    }
    tx.set(dergesaRef(kennung), { ...felder, statusi: "porosi", createdAt: jetzt });
    return { was: "neu" };
  });
}

// Ein Schritt als Heart (Inhaber) - mit derselben Pruefung wie auf
// /dergesat. Im Vorgang gelesen: Was Riba gerade getippt hat, wird nicht
// ueberschrieben.
export async function statusSetzen(kennung, ne, { jetzt = new Date().toISOString() } = {}) {
  return runTransaction(db, async (tx) => {
    const snap = await tx.get(dergesaRef(kennung));
    if (!snap.exists()) return false;
    const felder = ndryshimi(dergesaLesen(snap.data() || {}, kennung), ne, { roli: "heart", jetzt });
    if (!felder) return false;
    tx.update(dergesaRef(kennung), felder);
    return true;
  });
}

export async function dergesaLoeschen(kennung) {
  await deleteDoc(dergesaRef(kennung));
}

// Den Stand auf der Therapieseite des Kunden nachziehen (wie die Knoepfe
// "Als versendet/zugestellt melden" in der Akte).
export async function berichtVersand(kennung, felder) {
  await setDoc(berichtRef(kennung), felder, { merge: true });
}

export async function dergesaFelder(kennung, felder) {
  await updateDoc(dergesaRef(kennung), felder);
}
