"use strict";

// Mnyra GO - die Aussenseite des Servers.
//
// Duenn mit Absicht: Jede dieser Funktionen nimmt eine Anfrage entgegen,
// prueft die Zugehoerigkeit, ruft den Dienst und uebersetzt einen Fehler in
// eine Antwort. Die Regeln selbst stehen in go-service.js und in der Domaene -
// nicht hier.
//
// Alle sind Callables. Ein Gast ohne Konto darf sie aufrufen: GO funktioniert
// vollstaendig ohne Anmeldung (Spezifikation Punkt 30). Nur die Business-Wege
// verlangen ein angemeldetes Konto mit Zugriff auf das Lokal.

const admin = require("firebase-admin");
const functions = require("firebase-functions");
const { FieldValue } = require("firebase-admin/firestore");
const {
  buildCallableLogContext,
  logFunctionInfo,
  logFunctionWarn,
  logFunctionError
} = require("../logging");
const { createGoService, GoServiceError } = require("./go-service");

if (!admin.apps.length) {
  admin.initializeApp();
}

const REGION = "us-central1";
const db = admin.firestore();

let serviceInstance = null;

function getService() {
  if (!serviceInstance) {
    serviceInstance = createGoService({
      db,
      serverTimestamp: FieldValue.serverTimestamp(),
      // Damit zwei Suchen in derselben Millisekunde sich nicht gegenseitig
      // ueberschreiben: Firestore zaehlt selbst hoch, nicht wir.
      increment: (amount) => FieldValue.increment(amount),
      now: () => Date.now()
    });
  }
  return serviceInstance;
}

function asText(value, maxLength = 240) {
  return String(value === null || value === undefined ? "" : value).trim().slice(0, maxLength);
}

// Ein Fehler des Dienstes traegt bereits einen Satz fuer den Gast und einen
// Code. Alles andere wird zu "internal" - ein Stapelabzug gehoert ins Log,
// nicht in die Antwort.
function toHttpsError(error, flow, logContext) {
  if (error instanceof functions.https.HttpsError) return error;
  if (error instanceof GoServiceError || error?.name === "GoServiceError") {
    logFunctionWarn(flow, { ...logContext, status: error.code, reason: error.message });
    return new functions.https.HttpsError(error.code, error.message, error.details || {});
  }
  logFunctionError(flow, error, { ...logContext, status: "failed" });
  return new functions.https.HttpsError("internal", "Mnyra GO është përkohësisht i padisponueshëm.");
}

function callable(handler) {
  return functions.region(REGION).https.onCall(handler);
}

// Darf dieses Konto das Panel dieses Lokals bedienen? Dieselbe Wahrheit wie
// in den Rules: der Inhaber, oder ein Mitarbeiter mit Business-Zugang.
async function assertBusinessAccess(restaurantId, context) {
  const uid = asText(context?.auth?.uid, 180);
  if (!uid) throw new functions.https.HttpsError("unauthenticated", "Authentication required.");
  const id = asText(restaurantId, 180);
  if (!id) throw new functions.https.HttpsError("invalid-argument", "restaurantId is required.");

  // Beide Dokumente zusammen holen statt nacheinander.
  //
  // Der Mitarbeitereintrag wurde bisher erst geholt, NACHDEM der Inhaber
  // ausgeschlossen war - ein zweiter Weg zur Datenbank, den jeder Kellner an
  // jedem Codeeintrag bezahlt hat. Er wird ohnehin nur gelesen, nie ohne
  // Pruefung verwendet: Wer Inhaber ist, kommt unten durch, bevor der Eintrag
  // ueberhaupt angesehen wird.
  const [restaurantSnapshot, staffSnapshot] = await Promise.all([
    db.collection("restaurants").doc(id).get(),
    db.collection("restaurants").doc(id).collection("staff").doc(uid).get()
  ]);
  if (!restaurantSnapshot.exists) {
    throw new functions.https.HttpsError("not-found", "Restaurant was not found.");
  }
  const data = restaurantSnapshot.data() || {};
  const email = asText(context?.auth?.token?.email, 240).toLowerCase();
  const ownerUid = asText(data.ownerUid || data.uid || data.userUid, 180);
  const ownerEmails = [data.ownerEmail, data.email, data.contactEmail]
    .map((entry) => asText(entry, 240).toLowerCase())
    .filter(Boolean);
  if (ownerUid === uid || (email && ownerEmails.includes(email))) return { uid, restaurantId: id };

  const staff = staffSnapshot.exists ? (staffSnapshot.data() || {}) : null;
  const hasAccess = !!staff
    && staff.active !== false
    && staff.status !== "disabled"
    && (staff.businessAccess === true || staff.permissions?.businessAccess === true);
  if (!hasAccess) throw new functions.https.HttpsError("permission-denied", "Forbidden.");
  return { uid, restaurantId: id };
}

// ---------------------------------------------------------------------------
// Gast
// ---------------------------------------------------------------------------

exports.goEnsureGuestSession = callable(async (data, context) => {
  const flow = "go.guest.ensure";
  const logContext = buildCallableLogContext(context, { endpoint: "goEnsureGuestSession" });
  try {
    const session = await getService().ensureGuestSession({
      guestToken: asText(data?.guestToken, 400),
      uid: asText(context?.auth?.uid, 180)
    });
    return { ok: true, guestToken: session.guestToken, created: session.created };
  } catch (error) {
    throw toHttpsError(error, flow, logContext);
  }
});

exports.goSearch = callable(async (data, context) => {
  const flow = "go.search";
  const logContext = buildCallableLogContext(context, { endpoint: "goSearch" });
  try {
    const result = await getService().search({
      request: data?.request || {},
      guestToken: asText(data?.guestToken, 400),
      uid: asText(context?.auth?.uid, 180)
    });
    logFunctionInfo(flow, { ...logContext, status: "completed", results: result.total });
    return { ok: true, results: result.results, total: result.total };
  } catch (error) {
    throw toHttpsError(error, flow, logContext);
  }
});

exports.goCreateBooking = callable(async (data, context) => {
  const flow = "go.booking.create";
  const restaurantId = asText(data?.restaurantId, 180);
  const offerId = asText(data?.offerId, 180);
  const logContext = buildCallableLogContext(context, {
    endpoint: "goCreateBooking",
    restaurantId,
    offerId
  });
  try {
    const result = await getService().createBooking({
      offerId,
      restaurantId,
      request: data?.request || {},
      guestToken: asText(data?.guestToken, 400),
      uid: asText(context?.auth?.uid, 180),
      idempotencyKey: asText(data?.idempotencyKey, 120)
    });
    logFunctionInfo(flow, {
      ...logContext,
      status: "completed",
      bookingId: result.booking.id,
      reused: result.reused,
      type: result.booking.type
    });
    return {
      ok: true,
      booking: result.booking,
      bookingToken: result.bookingToken,
      guestToken: result.guestToken,
      reused: result.reused
    };
  } catch (error) {
    // Ist das Angebot gerade voll geworden, bekommt der Gast keine Sackgasse,
    // sondern sofort Alternativen (Punkt 28, 98).
    if (error?.name === "GoServiceError" && error.details?.soldOut) {
      let alternatives = [];
      try {
        alternatives = await getService().findAlternatives({
          request: data?.request || {},
          excludeRestaurantId: restaurantId
        });
      } catch {
        alternatives = [];
      }
      logFunctionWarn(flow, { ...logContext, status: "sold_out" });
      throw new functions.https.HttpsError("resource-exhausted", error.message, {
        ...(error.details || {}),
        alternatives
      });
    }
    throw toHttpsError(error, flow, logContext);
  }
});

exports.goGetBooking = callable(async (data, context) => {
  const flow = "go.booking.read";
  const logContext = buildCallableLogContext(context, { endpoint: "goGetBooking" });
  try {
    const result = await getService().getBooking({ bookingToken: asText(data?.bookingToken, 400) });
    return { ok: true, booking: result.booking };
  } catch (error) {
    throw toHttpsError(error, flow, logContext);
  }
});

exports.goCancelBooking = callable(async (data, context) => {
  const flow = "go.booking.cancel";
  const logContext = buildCallableLogContext(context, { endpoint: "goCancelBooking" });
  try {
    const result = await getService().cancelBookingByGuest({
      bookingToken: asText(data?.bookingToken, 400),
      guestToken: asText(data?.guestToken, 400)
    });
    logFunctionInfo(flow, { ...logContext, status: "completed", bookingId: result.booking.id });
    return { ok: true, booking: result.booking };
  } catch (error) {
    throw toHttpsError(error, flow, logContext);
  }
});

// Check-in. Drei Wege fuehren hierher: der Tisch-QR des Lokals, der
// allgemeine GO-QR am Eingang und der Code des Gastes, den das Lokal scannt
// (Punkt 88 bis 90). Alle drei landen in derselben Pruefung.
exports.goCheckIn = callable(async (data, context) => {
  const flow = "go.booking.checkin";
  const restaurantId = asText(data?.restaurantId, 180);
  const logContext = buildCallableLogContext(context, { endpoint: "goCheckIn", restaurantId });
  try {
    const shortCode = asText(data?.shortCode, 12);
    // Der Kurzcode ist kein Schluessel: Wer ihn benutzt, muss am Panel des
    // Lokals angemeldet sein (Punkt 40).
    if (!asText(data?.bookingToken, 400) && shortCode) {
      await assertBusinessAccess(restaurantId, context);
    }
    const result = await getService().checkIn({
      bookingToken: asText(data?.bookingToken, 400),
      shortCode,
      restaurantId,
      // Die berichtigte Gruppengroesse kommt nur vom Lokal - der Gast hat
      // seine beim Zugreifen genannt und aendert sie hier nicht mehr.
      partySize: asText(data?.bookingToken, 400) ? 0 : Number(data?.partySize) || 0
    });
    logFunctionInfo(flow, {
      ...logContext,
      status: "completed",
      alreadyCheckedIn: result.alreadyCheckedIn
    });
    return { ok: true, booking: result.booking, alreadyCheckedIn: result.alreadyCheckedIn };
  } catch (error) {
    throw toHttpsError(error, flow, logContext);
  }
});

// ---------------------------------------------------------------------------
// Business
// ---------------------------------------------------------------------------

// Den Code eines Gastes nachschlagen, ohne etwas zu veraendern.
//
// Das ist der einzige Weg, auf dem eine Buchung im Panel bestaetigbar wird:
// Der Kellner tippt den Code, den der Gast ihm zeigt. Ohne Code kein Treffer,
// ohne Treffer kein Knopf - und deshalb keine Bestaetigung ohne Gast.
exports.goBusinessFindBooking = callable(async (data, context) => {
  const flow = "go.business.booking.find";
  const restaurantId = asText(data?.restaurantId, 180);
  const logContext = buildCallableLogContext(context, {
    endpoint: "goBusinessFindBooking",
    restaurantId
  });
  try {
    await assertBusinessAccess(restaurantId, context);
    const result = await getService().findBookingByCode({
      shortCode: asText(data?.shortCode, 12),
      restaurantId
    });
    logFunctionInfo(flow, { ...logContext, status: "completed" });
    return { ok: true, booking: result.booking };
  } catch (error) {
    throw toHttpsError(error, flow, logContext);
  }
});

exports.goBusinessBookingAction = callable(async (data, context) => {
  const flow = "go.business.booking.action";
  const restaurantId = asText(data?.restaurantId, 180);
  const logContext = buildCallableLogContext(context, {
    endpoint: "goBusinessBookingAction",
    restaurantId
  });
  try {
    await assertBusinessAccess(restaurantId, context);
    const result = await getService().businessUpdateBooking({
      bookingId: asText(data?.bookingId, 180),
      restaurantId,
      action: asText(data?.action, 40),
      reason: asText(data?.reason, 200)
    });
    logFunctionInfo(flow, { ...logContext, status: "completed", action: asText(data?.action, 40) });
    return { ok: true, booking: result.booking };
  } catch (error) {
    throw toHttpsError(error, flow, logContext);
  }
});
