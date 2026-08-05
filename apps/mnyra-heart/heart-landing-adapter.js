// Liest, was auf den Lead-Landings passiert ist.
//
// Geschrieben werden die Sitzungen von der Landing selbst, ohne Anmeldung und
// eng begrenzt durch die Firestore-Regeln. Hier wird nur gelesen - mit den
// Rechten des angemeldeten Kontos, also ueber dieselben Regeln wie alles
// andere in Heart.
//
// Eine einzige Abfrage ueber alle Sitzungen aller Lokale, ohne Sortierung und
// ohne Filter: So braucht sie keinen zusammengesetzten Index, den erst jemand
// anlegen muesste. Sortiert und gruppiert wird danach hier - bei der Menge,
// um die es geht, ist das nicht der Rede wert und dafuer gibt es nichts, was
// im Betrieb fehlen kann.

import {
  db
} from "/shared/firebase-config.js";
import {
  collectionGroup,
  collection,
  deleteDoc,
  doc,
  documentId,
  getDocs,
  limit,
  query,
  setDoc,
  where
} from "/shared/vendor/firebase/11.0.0/firebase-firestore.js";

const SESSION_LIMIT = 1500;
const NAME_CHUNK = 10;
const ARCHIVE_COLLECTION = "landingArchive";

function asText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function asNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

// Aus dem Pfad restaurants/{id}/landingSessions/{sessionId} das Lokal holen.
function restaurantIdFromRef(ref) {
  return asText(ref?.parent?.parent?.id);
}

function normalizeSession(doc) {
  const data = doc.data() || {};
  const steps = data.steps && typeof data.steps === "object" ? data.steps : {};
  const answers = data.answers && typeof data.answers === "object" ? data.answers : {};
  const cleanSteps = {};
  Object.keys(steps).forEach((key) => {
    cleanSteps[key] = asNumber(steps[key]);
  });
  return {
    id: doc.id,
    restaurantId: restaurantIdFromRef(doc.ref),
    slug: asText(data.slug),
    steps: cleanSteps,
    answers: {
      q1: asText(answers.q1),
      q2: asText(answers.q2),
      q3: asText(answers.q3)
    },
    outcome: asText(data.outcome),
    totalMs: asNumber(data.totalMs),
    startedAt: asText(data.startedAt),
    updatedAt: asText(data.updatedAt)
  };
}

async function readNames(ids) {
  const out = new Map();
  const list = Array.from(new Set(ids.filter(Boolean)));
  for (let index = 0; index < list.length; index += NAME_CHUNK) {
    const chunk = list.slice(index, index + NAME_CHUNK);
    try {
      const snap = await getDocs(query(collection(db, "restaurants"), where(documentId(), "in", chunk)));
      snap.forEach((doc) => {
        const data = doc.data() || {};
        out.set(doc.id, {
          name: asText(data.name) || asText(data.restaurantName) || doc.id,
          city: asText(data.city),
          slug: asText(data.publicSlug) || asText(data.landingSlug)
        });
      });
    } catch {
      // Ein Lokal ohne Namen ist kein Grund, die ganze Liste fallen zu lassen.
    }
  }
  return out;
}

// Welche Landings abgelegt sind. Faellt das weg - etwa weil die Regel es
// verbietet -, ist das kein Grund, die Auswertung nicht zu zeigen: Dann ist
// eben nichts abgelegt.
async function readArchive() {
  try {
    const snap = await getDocs(query(collection(db, ARCHIVE_COLLECTION), limit(SESSION_LIMIT)));
    const abgelegt = [];
    snap.forEach((eintrag) => {
      if (eintrag.data()?.archived === true) abgelegt.push(eintrag.id);
    });
    return abgelegt;
  } catch {
    return [];
  }
}

export async function loadLandingSessions() {
  const [snap, archived] = await Promise.all([
    getDocs(query(collectionGroup(db, "landingSessions"), limit(SESSION_LIMIT))),
    readArchive()
  ]);
  const sessions = [];
  snap.forEach((eintrag) => sessions.push(normalizeSession(eintrag)));

  const names = await readNames(sessions.map((session) => session.restaurantId));
  return {
    archived,
    sessions: sessions.map((session) => {
      const info = names.get(session.restaurantId) || null;
      return {
        ...session,
        name: info ? info.name : session.slug || session.restaurantId,
        city: info ? info.city : "",
        publicSlug: info ? info.slug : session.slug
      };
    })
  };
}

// Ablegen und zurueckholen. Zurueckgeholt wird durch Loeschen des Eintrags -
// dann steht im Archiv nur, was auch wirklich abgelegt ist, statt einer
// wachsenden Liste von "nein, doch nicht".
export async function setLandingArchived(restaurantId = "", archived = true) {
  const id = String(restaurantId || "").trim();
  if (!id) throw new Error("Ohne Lokal laesst sich nichts ablegen.");
  const ziel = doc(db, ARCHIVE_COLLECTION, id);
  if (archived) await setDoc(ziel, { archived: true, updatedAt: new Date().toISOString() });
  else await deleteDoc(ziel);
}
