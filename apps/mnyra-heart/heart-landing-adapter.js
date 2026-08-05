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
//
// Zum Tempo, denn darum ging es zuletzt:
//
// 1. Firestore haelt schon einen Speicher auf dem Geraet (persistentLocalCache
//    in /shared/firebase-config.js). getDocs fragt trotzdem immer erst den
//    Server - der Speicher half also nur offline. Jetzt wird zuerst aus dem
//    Geraetespeicher gelesen und sofort angezeigt, und erst danach der echte
//    Stand geholt. Wer den Bereich schon einmal offen hatte, sieht ihn beim
//    naechsten Mal ohne Warten.
//
// 2. Die Namen der Lokale wurden in Zehnerpaketen nacheinander geholt - bei
//    hundert Lokalen zehn Abfragen, eine nach der anderen, jede mit voller
//    Wartezeit. Sie laufen jetzt nebeneinander.

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
  getDocsFromCache,
  limit,
  query,
  setDoc,
  where
} from "/shared/vendor/firebase/11.0.0/firebase-firestore.js";
import {
  chunkList,
  mapWithLimit
} from "./heart-async-utils.js";

const SESSION_LIMIT = 1500;
const NAME_CHUNK = 10;
// Wie viele Namenspakete gleichzeitig unterwegs sein duerfen. Alle auf einmal
// waere bei sehr vielen Lokalen unhoeflich; einzeln war zu langsam.
const NAME_PARALLEL = 8;
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

async function readNames(leser, ids) {
  const pakete = chunkList(Array.from(new Set(ids.filter(Boolean))), NAME_CHUNK);

  const gelesen = await mapWithLimit(pakete, NAME_PARALLEL, async (paket) => {
    try {
      const snap = await leser(query(collection(db, "restaurants"), where(documentId(), "in", paket)));
      const eintraege = [];
      snap.forEach((eintrag) => {
        const data = eintrag.data() || {};
        eintraege.push([eintrag.id, {
          name: asText(data.name) || asText(data.restaurantName) || eintrag.id,
          city: asText(data.city),
          slug: asText(data.publicSlug) || asText(data.landingSlug)
        }]);
      });
      return eintraege;
    } catch {
      // Ein Lokal ohne Namen ist kein Grund, die ganze Liste fallen zu lassen.
      return [];
    }
  });

  return new Map(gelesen.flat());
}

// Welche Landings abgelegt sind. Faellt das weg - etwa weil die Regel es
// verbietet -, ist das kein Grund, die Auswertung nicht zu zeigen: Dann ist
// eben nichts abgelegt.
async function readArchive(leser) {
  try {
    const snap = await leser(query(collection(db, ARCHIVE_COLLECTION), limit(SESSION_LIMIT)));
    const abgelegt = [];
    snap.forEach((eintrag) => {
      if (eintrag.data()?.archived === true) abgelegt.push(eintrag.id);
    });
    return abgelegt;
  } catch {
    return [];
  }
}

function benennen(sessions, names) {
  return sessions.map((session) => {
    const info = names.get(session.restaurantId) || null;
    return {
      ...session,
      name: info ? info.name : session.slug || session.restaurantId,
      city: info ? info.city : "",
      publicSlug: info ? info.slug : session.slug
    };
  });
}

async function ladeMit(leser) {
  const [snap, archived] = await Promise.all([
    leser(query(collectionGroup(db, "landingSessions"), limit(SESSION_LIMIT))),
    readArchive(leser)
  ]);
  const sessions = [];
  snap.forEach((eintrag) => sessions.push(normalizeSession(eintrag)));
  if (!sessions.length) return { archived, sessions: [], abgeschnitten: false, grenze: SESSION_LIMIT };

  // Die Abfrage holt hoechstens SESSION_LIMIT Sitzungen, und sie ist bewusst
  // unsortiert - sonst braeuchte sie einen Index, den erst jemand anlegen
  // muesste. Ist die Grenze erreicht, fehlt also ein beliebiger Teil, und
  // jede Zahl darunter ist zu klein. Das muss dann auch dastehen: Eine
  // Auswertung, die stillschweigend die Haelfte weglaesst, ist schlimmer als
  // gar keine, weil man ihr glaubt.
  const abgeschnitten = sessions.length >= SESSION_LIMIT;

  const names = await readNames(leser, sessions.map((session) => session.restaurantId));
  return {
    archived,
    abgeschnitten,
    grenze: SESSION_LIMIT,
    sessions: benennen(sessions, names)
  };
}

// Was schon auf dem Geraet liegt. Liegt nichts da, kommt eine leere Liste
// zurueck und kein Fehler - dann wird eben gewartet wie beim ersten Mal.
export async function loadLandingSessionsFromCache() {
  try {
    return await ladeMit(getDocsFromCache);
  } catch {
    return { archived: [], sessions: [], abgeschnitten: false, grenze: SESSION_LIMIT };
  }
}

export async function loadLandingSessions() {
  return ladeMit(getDocs);
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
