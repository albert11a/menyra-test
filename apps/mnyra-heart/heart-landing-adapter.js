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
// Abgelegt und vorgemerkt liegen in derselben Sammlung.
//
// Der Grund ist kein schoener, aber ein tragfaehiger: Eine eigene Sammlung
// braeuchte eine eigene Firestore-Regel, und die wird von Hand deployt - bis
// dahin lehnt der Server jeden Zugriff ab, und "Next" waere eine Ansicht, die
// beim ersten Antippen einen Rechtefehler zeigt. Diese Sammlung hat ihre Regel
// schon lange (nur das CEO-Konto darf lesen und schreiben), und es ist dieselbe
// Art von Notiz: Ordnung fuer den, der Heart bedient.
//
// Damit sich beides nicht ins Gehege kommt, tragen die Vormerkungen ein
// Praefix in der Dokumentkennung. Ein Lokal kann also gleichzeitig abgelegt und
// vorgemerkt sein, ohne dass ein Schreibvorgang den anderen ueberschreibt - und
// beides kommt mit einer einzigen Abfrage herein statt mit zweien, was auf
// langsamer Verbindung den Unterschied macht.
const ARCHIVE_COLLECTION = "landingArchive";
const NEXT_PREFIX = "next__";

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
          slug: asText(data.publicSlug) || asText(data.landingSlug),
          // Das Profilbild fuer die Karte. Kommt es aus derselben Abfrage wie
          // der Name, kostet es keine einzige zusaetzliche Runde.
          logoUrl: asText(data.logoUrl) || asText(data.logo) || asText(data.imageUrl)
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

// Was abgelegt und was vorgemerkt ist, in einer Abfrage.
//
// Die Vormerkungen tragen Name, Ort, Slug und Bild bei sich: Was vorgemerkt
// ist, hat noch niemand geoeffnet, es gibt also keine Sitzung, aus der sich das
// ableiten liesse. So ist die Karte sofort vollstaendig, ohne zweite Runde zum
// Server.
//
// Faellt das hier weg - etwa weil die Regel es verbietet -, ist das kein Grund,
// die Auswertung nicht zu zeigen: Dann ist eben nichts abgelegt und nichts
// vorgemerkt.
async function readBoard(leser) {
  try {
    const snap = await leser(query(collection(db, ARCHIVE_COLLECTION), limit(SESSION_LIMIT)));
    const archived = [];
    const next = [];
    snap.forEach((eintrag) => {
      const data = eintrag.data() || {};
      if (eintrag.id.startsWith(NEXT_PREFIX)) {
        if (data.next !== true) return;
        next.push({
          restaurantId: eintrag.id.slice(NEXT_PREFIX.length),
          name: asText(data.name),
          city: asText(data.city),
          publicSlug: asText(data.publicSlug),
          logoUrl: asText(data.logoUrl),
          addedAt: asText(data.addedAt)
        });
        return;
      }
      if (data.archived === true) archived.push(eintrag.id);
    });
    return {
      archived,
      // Zuletzt vorgemerkt steht oben - das ist das, woran man gerade arbeitet.
      next: next
        .filter((eintrag) => eintrag.restaurantId)
        .map((eintrag) => ({ ...eintrag, name: eintrag.name || eintrag.restaurantId }))
        .sort((a, b) => String(b.addedAt).localeCompare(String(a.addedAt)))
    };
  } catch {
    return { archived: [], next: [] };
  }
}

function benennen(sessions, names) {
  return sessions.map((session) => {
    const info = names.get(session.restaurantId) || null;
    return {
      ...session,
      name: info ? info.name : session.slug || session.restaurantId,
      city: info ? info.city : "",
      publicSlug: info ? info.slug : session.slug,
      logoUrl: info ? info.logoUrl : ""
    };
  });
}

async function ladeMit(leser) {
  const [snap, { archived, next }] = await Promise.all([
    leser(query(collectionGroup(db, "landingSessions"), limit(SESSION_LIMIT))),
    readBoard(leser)
  ]);
  const sessions = [];
  snap.forEach((eintrag) => sessions.push(normalizeSession(eintrag)));
  if (!sessions.length) return { archived, next, sessions: [], abgeschnitten: false, grenze: SESSION_LIMIT };

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
    next,
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
    return { archived: [], next: [], sessions: [], abgeschnitten: false, grenze: SESSION_LIMIT };
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

// Vormerken und wieder entfernen. Wie beim Archiv wird das Entfernen als
// Loeschen geschrieben - in der Liste steht dann nur, was auch wirklich
// vorgemerkt ist.
export async function setLandingNext(entry = {}, vorgemerkt = true) {
  const id = String(entry?.restaurantId || "").trim();
  if (!id) throw new Error("Ohne Lokal laesst sich nichts vormerken.");
  const ziel = doc(db, ARCHIVE_COLLECTION, `${NEXT_PREFIX}${id}`);
  if (!vorgemerkt) {
    await deleteDoc(ziel);
    return;
  }
  await setDoc(ziel, {
    next: true,
    name: asText(entry.name) || id,
    city: asText(entry.city),
    publicSlug: asText(entry.publicSlug),
    logoUrl: asText(entry.logoUrl),
    addedAt: asText(entry.addedAt) || new Date().toISOString()
  });
}
