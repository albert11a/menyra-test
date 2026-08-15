// Mnyra GO - der Weg zum Server.
//
// Ein duennes Stueck: Es laedt Firebase erst beim ersten Aufruf nach (also
// erst, wenn jemand GO wirklich benutzt), haengt den Gast-Token an jede
// Anfrage und uebersetzt einen Fehler in etwas, das die Oberflaeche zeigen
// kann.
//
// Zwei Dinge, die hier NICHT passieren:
//
//  - Es wird nichts entschieden. Kein Preis, keine Kapazitaet, keine
//    Gueltigkeit (Punkt 146).
//  - Es wird kein Erfolg vorgetaeuscht. Ein Zeitablauf ist kein "gebucht",
//    sondern eine offene Frage, die mit demselben Schluessel nachgefragt wird
//    (Punkt 100).

import { readGoGuestToken, writeGoGuestToken } from "./go-client-store.js";

const REGION = "us-central1";
const CALL_TIMEOUT_MS = 15000;

let callablesPromise = null;
const connectedInstances = new WeakSet();

async function loadCallables() {
  if (!callablesPromise) {
    // Dieselben literalen Import-Pfade wie im Bestellweg: Vite fuehrt sie im
    // gebuendelten Betrieb auf dieselben Firebase-Module zusammen, statt eine
    // zweite Kopie zu laden.
    callablesPromise = Promise.all([
      import("/shared/firebase-config.js?v=2026-05-02-public-startup-diet-01"),
      import("/shared/vendor/firebase/11.0.0/firebase-functions.js")
    ])
      .then(([configModule, functionsModule]) => {
        const firebaseApp = configModule?.app;
        if (!firebaseApp) throw new Error("go-firebase-app-unavailable");
        const instance = functionsModule.getFunctions(firebaseApp, REGION);
        const emulator = configModule.getLocalFirebaseEmulatorSettings?.();
        if (emulator && !connectedInstances.has(instance)) {
          functionsModule.connectFunctionsEmulator(instance, emulator.host, emulator.functionsPort);
          connectedInstances.add(instance);
        }
        return (name) => functionsModule.httpsCallable(instance, name, { timeout: CALL_TIMEOUT_MS });
      })
      .catch((error) => {
        callablesPromise = null;
        throw error;
      });
  }
  return callablesPromise;
}

// Ein Fehler des Servers traegt bereits einen Satz fuer den Gast. Alles
// andere - Netz weg, Firebase nicht geladen - bekommt den einen allgemeinen
// Satz, und GO bleibt fuer den Rest der App unsichtbar (Punkt 131).
function toGoError(error) {
  const code = String(error?.code || "").replace(/^functions\//, "");
  const message = String(error?.message || "").trim();
  const details = error?.details && typeof error.details === "object" ? error.details : {};
  return {
    code: code || "unavailable",
    message: message || "Mnyra GO është përkohësisht i padisponueshëm.",
    details,
    soldOut: details.soldOut === true || code === "resource-exhausted",
    requiresSignIn: details.requiresSignIn === true,
    alternatives: Array.isArray(details.alternatives) ? details.alternatives : []
  };
}

async function call(name, payload = {}) {
  const factory = await loadCallables();
  try {
    const response = await factory(name)(payload);
    return response?.data || {};
  } catch (error) {
    const goError = toGoError(error);
    const wrapped = new Error(goError.message);
    Object.assign(wrapped, goError);
    throw wrapped;
  }
}

export function createGoApiClient({ storageObj = null, callFn = call } = {}) {
  // Der Gast-Token wird bei jeder Antwort nachgezogen: Beim allerersten
  // Aufruf gibt der Server einen neuen aus.
  function rememberToken(data = {}) {
    const token = String(data?.guestToken || "").trim();
    if (token) writeGoGuestToken(token, storageObj);
    return token;
  }

  function guestToken() {
    return readGoGuestToken(storageObj);
  }

  return {
    async ensureGuestSession() {
      const data = await callFn("goEnsureGuestSession", { guestToken: guestToken() });
      rememberToken(data);
      return data;
    },

    async search(request = {}) {
      const data = await callFn("goSearch", { request, guestToken: guestToken() });
      return { results: Array.isArray(data.results) ? data.results : [], total: Number(data.total) || 0 };
    },

    async createBooking({ offerId = "", restaurantId = "", request = {}, idempotencyKey = "" } = {}) {
      const data = await callFn("goCreateBooking", {
        offerId,
        restaurantId,
        request,
        idempotencyKey,
        guestToken: guestToken()
      });
      rememberToken(data);
      return data;
    },

    async getBooking(bookingToken = "") {
      const data = await callFn("goGetBooking", { bookingToken });
      return data?.booking || null;
    },

    async cancelBooking(bookingToken = "") {
      const data = await callFn("goCancelBooking", { bookingToken, guestToken: guestToken() });
      return data?.booking || null;
    },

    async checkIn({ bookingToken = "", shortCode = "", restaurantId = "" } = {}) {
      return callFn("goCheckIn", { bookingToken, shortCode, restaurantId });
    },

    // Alles, was das Lokal an einer Buchung aendert, geht ueber den Server:
    // gesehen, eingecheckt, abgeschlossen, nicht erschienen, abgesagt. Die
    // Buchung selbst ist fuer den Browser nur lesbar.
    async businessBookingAction({ bookingId = "", restaurantId = "", action = "", reason = "" } = {}) {
      const data = await callFn("goBusinessBookingAction", { bookingId, restaurantId, action, reason });
      return data?.booking || null;
    }
  };
}

export const goApiInternals = { toGoError, loadCallables };
