"use strict";

// Generated from ../../../shared/go/go-booking-core.js. Do not edit manually.
// Run: node functions/scripts/sync-go-shared.cjs

// Mnyra GO - die Buchung. Pur.
//
// Eine GO-Buchung ist das, was entsteht, wenn ein Gast auf "Prano ofertën"
// tippt. Zwei Arten, eine Domaene (Spezifikation Punkt 26):
//
//   claim        Das Angebot ist gesichert. Kein Tisch versprochen.
//   reservation  Das Angebot ist gesichert und ein Tisch dazu.
//
// Der wichtigste Satz dieses Moduls steht in resolveGoBookingClosure():
// Eine Buchung verfaellt NICHT, weil der Gast zehn oder dreissig Minuten
// spaeter kommt. Die angegebene Uhrzeit ist eine erwartete Ankunft. Geschlossen
// wird eine Buchung durch einen Check-in, durch eine Absage, durch das Lokal
// selbst - oder spaetestens am Ende des Betriebstages (Punkt 71 bis 76).
//
// Und: Der Kurzcode (A7K2) ist ein Erkennungszeichen fuer die Theke, kein
// Schluessel. Wer eine Buchung oeffnen will, braucht den langen, zufaelligen
// Token (Punkt 39, 40).

const {
  GO_BOOKING_TYPE_CLAIM,
  GO_BOOKING_TYPE_RESERVATION,
  GO_CAPACITY_SLOT_MINUTES,
  GO_RESERVATION_CONFLICT_MINUTES
} = require("./go-feature-config.cjs");
const { cleanGoText, normalizeGoBookingType } = require("./go-offer-core.cjs");
const {
  GO_DEFAULT_TIME_ZONE,
  floorGoMinutesToSlot,
  formatGoClock,
  goArrivalsOverlap,
  resolveGoLocalTime,
  resolveGoOperatingDayEndMs,
  toGoIso,
  toGoMillis
} = require("./go-time-core.cjs");

const GO_BOOKINGS_COLLECTION = "goBookings";
const GO_CAPACITY_COLLECTION = "goCapacity";
const GO_GUEST_SESSIONS_COLLECTION = "goGuestSessions";
const GO_SETTINGS_DOC_ID = "goSettings";

const GO_BOOKING_STATUS = Object.freeze({
  confirmed: "confirmed",
  checkedIn: "checked_in",
  completed: "completed",
  cancelledByUser: "cancelled_by_user",
  cancelledByBusiness: "cancelled_by_business",
  notArrived: "not_arrived",
  expired: "expired"
});

// Offen heisst: die Buchung belegt Kapazitaet und steht beim Lokal in der
// Liste. Alles andere ist Geschichte.
const GO_OPEN_BOOKING_STATUSES = Object.freeze([
  GO_BOOKING_STATUS.confirmed,
  GO_BOOKING_STATUS.checkedIn
]);

const ALLOWED_TRANSITIONS = Object.freeze({
  [GO_BOOKING_STATUS.confirmed]: [
    GO_BOOKING_STATUS.checkedIn,
    GO_BOOKING_STATUS.completed,
    GO_BOOKING_STATUS.cancelledByUser,
    GO_BOOKING_STATUS.cancelledByBusiness,
    GO_BOOKING_STATUS.notArrived,
    GO_BOOKING_STATUS.expired
  ],
  [GO_BOOKING_STATUS.checkedIn]: [
    GO_BOOKING_STATUS.completed,
    GO_BOOKING_STATUS.cancelledByBusiness
  ],
  [GO_BOOKING_STATUS.completed]: [],
  [GO_BOOKING_STATUS.cancelledByUser]: [],
  [GO_BOOKING_STATUS.cancelledByBusiness]: [],
  [GO_BOOKING_STATUS.notArrived]: [],
  [GO_BOOKING_STATUS.expired]: []
});

// Der Kurzcode meidet 0/O, 1/I/L und S/5 - er wird am Telefon vorgelesen und
// von Hand abgetippt.
const GO_SHORT_CODE_ALPHABET = "ACDEFGHJKMNPQRTUVWXY23479";
const GO_SHORT_CODE_LENGTH = 4;

function normalizeGoBookingStatus(value = "") {
  const key = String(value || "").trim().toLowerCase();
  return Object.values(GO_BOOKING_STATUS).includes(key) ? key : GO_BOOKING_STATUS.confirmed;
}

function isGoBookingOpen(booking = {}) {
  return GO_OPEN_BOOKING_STATUSES.includes(normalizeGoBookingStatus(booking?.status));
}

function canTransitionGoBooking(fromStatus, toStatus) {
  const from = normalizeGoBookingStatus(fromStatus);
  const to = String(toStatus || "").trim().toLowerCase();
  return (ALLOWED_TRANSITIONS[from] || []).includes(to);
}

/**
 * Der Kurzcode. Der Zufall kommt von aussen (crypto), damit dieses Modul
 * pur bleibt und der Test denselben Code zweimal erzeugen kann.
 *
 * @param {(size:number)=>Uint8Array|number[]} randomBytes
 */
function createGoShortCode(randomBytes, length = GO_SHORT_CODE_LENGTH) {
  const size = Math.max(4, Math.min(8, Math.trunc(Number(length) || GO_SHORT_CODE_LENGTH)));
  const bytes = typeof randomBytes === "function" ? randomBytes(size) : null;
  const alphabet = GO_SHORT_CODE_ALPHABET;
  let code = "";
  for (let index = 0; index < size; index += 1) {
    const value = bytes && Number.isFinite(Number(bytes[index]))
      ? Number(bytes[index])
      : Math.floor(Math.random() * 256);
    code += alphabet[value % alphabet.length];
  }
  return code;
}

// Der Schluessel einer Kapazitaetsscheibe: Ort, Tag und halbe Stunde der
// erwarteten Ankunft. Er ist ein Planungsraster fuer das Lokal - er sagt nicht,
// wann ein Gast durch die Tuer darf (Punkt 78).
function buildGoCapacitySlotKey({
  restaurantId = "",
  locationId = "main",
  expectedArrivalAt = Date.now(),
  timeZone = GO_DEFAULT_TIME_ZONE,
  slotMinutes = GO_CAPACITY_SLOT_MINUTES
} = {}) {
  const local = resolveGoLocalTime(expectedArrivalAt, timeZone);
  const slotStart = floorGoMinutesToSlot(local.minutes, slotMinutes);
  const slot = formatGoClock(slotStart).replace(":", "");
  return [
    cleanGoText(restaurantId, 180) || "unknown",
    cleanGoText(locationId, 180) || "main",
    local.dayKey || "unknown",
    slot
  ].join("__");
}

function buildGoDayKey({ expectedArrivalAt = Date.now(), timeZone = GO_DEFAULT_TIME_ZONE } = {}) {
  return resolveGoLocalTime(expectedArrivalAt, timeZone).dayKey;
}

/**
 * Die eingefrorene Kopie der Bedingungen (Punkt 92, 93).
 *
 * Sie ist der Grund, warum ein Gast, der -20 % genommen hat, auch dann -20 %
 * behaelt, wenn das Lokal sein Angebot danach auf -10 % stellt oder es ganz
 * loescht. Die Buchung liest nie wieder das Angebot - sie traegt ihre
 * Bedingungen selbst.
 */
function buildGoBookingSnapshot({
  offer = {},
  business = {},
  request = {},
  nowMs = Date.now()
} = {}) {
  const bookingType = normalizeGoBookingType(offer?.bookingType);
  return {
    capturedAt: toGoIso(nowMs) || new Date().toISOString(),
    offerId: cleanGoText(offer?.id, 180),
    restaurantId: cleanGoText(offer?.restaurantId || business?.id, 180),
    locationId: cleanGoText(offer?.locationId, 180) || "main",
    businessName: cleanGoText(business?.name, 120),
    businessCity: cleanGoText(business?.city, 120),
    businessAddress: cleanGoText(business?.address, 240),
    logoUrl: cleanGoText(business?.logoUrl, 500),
    title: cleanGoText(offer?.title, 120),
    description: cleanGoText(offer?.description, 400),
    terms: cleanGoText(offer?.terms, 400),
    // Genau der Text, den der Gast auf der Karte gesehen hat. Er ist die
    // Zusage - nicht der Rabattwert, aus dem er einmal gerechnet wurde.
    benefitLabel: cleanGoText(offer?.benefitLabel, 160),
    benefit: {
      kind: cleanGoText(offer?.benefit?.kind, 40),
      percent: Math.max(0, Math.trunc(Number(offer?.benefit?.percent) || 0)),
      itemId: cleanGoText(offer?.benefit?.itemId, 180),
      itemName: cleanGoText(offer?.benefit?.itemName, 160),
      priceText: cleanGoText(offer?.benefit?.priceText, 60)
    },
    category: cleanGoText(offer?.category, 40),
    bookingType,
    partySize: Math.max(1, Math.trunc(Number(request?.partySize) || 1)),
    expectedArrivalAt: toGoIso(request?.requestedAt) || toGoIso(nowMs),
    limits: {
      slotGroups: Math.max(0, Math.trunc(Number(offer?.limits?.slotGroups) || 0)),
      slotGuests: Math.max(0, Math.trunc(Number(offer?.limits?.slotGuests) || 0)),
      dailyGroups: Math.max(0, Math.trunc(Number(offer?.limits?.dailyGroups) || 0)),
      totalRedemptions: Math.max(0, Math.trunc(Number(offer?.limits?.totalRedemptions) || 0))
    }
  };
}

/**
 * Die Buchung, wie sie geschrieben wird.
 *
 * Der lange Token steht hier nur als Hash. Im Klartext bekommt ihn allein der
 * Gast, einmal, in der Antwort - wer die Datenbank liest, kann damit keine
 * fremde Buchung oeffnen.
 */
function buildGoBookingRecord({
  bookingId = "",
  snapshot = {},
  request = {},
  guest = {},
  tokenHash = "",
  shortCode = "",
  idempotencyKey = "",
  timeZone = GO_DEFAULT_TIME_ZONE,
  nowMs = Date.now(),
  serverTimestamp = null
} = {}) {
  const expectedArrivalAt = toGoMillis(snapshot?.expectedArrivalAt) || toGoMillis(request?.requestedAt) || nowMs;
  const bookingType = normalizeGoBookingType(snapshot?.bookingType);
  const restaurantId = cleanGoText(snapshot?.restaurantId, 180);
  const locationId = cleanGoText(snapshot?.locationId, 180) || "main";
  const record = {
    id: cleanGoText(bookingId, 180),
    restaurantId,
    locationId,
    offerId: cleanGoText(snapshot?.offerId, 180),
    // Wer gebucht hat: die anonyme Gastkennung, und - falls angemeldet - die
    // Kontokennung. Keine IP, kein Geraetefingerabdruck (Punkt 32, 38).
    guestId: cleanGoText(guest?.guestId, 180),
    uid: cleanGoText(guest?.uid, 180),
    tokenHash: cleanGoText(tokenHash, 200),
    shortCode: cleanGoText(shortCode, 12).toUpperCase(),
    type: bookingType,
    status: GO_BOOKING_STATUS.confirmed,
    partySize: Math.max(1, Math.trunc(Number(snapshot?.partySize || request?.partySize) || 1)),
    expectedArrivalAt: new Date(expectedArrivalAt).toISOString(),
    dayKey: buildGoDayKey({ expectedArrivalAt, timeZone }),
    slotKey: buildGoCapacitySlotKey({ restaurantId, locationId, expectedArrivalAt, timeZone }),
    timeZone: cleanGoText(timeZone, 60) || GO_DEFAULT_TIME_ZONE,
    snapshot,
    idempotencyKey: cleanGoText(idempotencyKey, 120),
    // Das Lokal hat diesen Vorgang noch nicht gesehen - daraus wird das
    // Abzeichen im Panel (Punkt 114).
    businessSeenAt: null,
    checkedInAt: null,
    completedAt: null,
    cancelledAt: null,
    cancelReason: "",
    createdAt: serverTimestamp || new Date(nowMs).toISOString(),
    updatedAt: serverTimestamp || new Date(nowMs).toISOString()
  };
  return record;
}

function normalizeGoBooking(raw = {}, fallbackId = "") {
  const source = raw && typeof raw === "object" ? raw : {};
  const snapshot = source.snapshot && typeof source.snapshot === "object" ? source.snapshot : {};
  return {
    id: cleanGoText(source.id || fallbackId, 180),
    restaurantId: cleanGoText(source.restaurantId || snapshot.restaurantId, 180),
    locationId: cleanGoText(source.locationId || snapshot.locationId, 180) || "main",
    offerId: cleanGoText(source.offerId || snapshot.offerId, 180),
    guestId: cleanGoText(source.guestId, 180),
    uid: cleanGoText(source.uid, 180),
    shortCode: cleanGoText(source.shortCode, 12).toUpperCase(),
    type: normalizeGoBookingType(source.type || snapshot.bookingType),
    status: normalizeGoBookingStatus(source.status),
    partySize: Math.max(1, Math.trunc(Number(source.partySize || snapshot.partySize) || 1)),
    expectedArrivalAt: toGoIso(source.expectedArrivalAt || snapshot.expectedArrivalAt),
    expectedArrivalMs: toGoMillis(source.expectedArrivalAt || snapshot.expectedArrivalAt),
    dayKey: cleanGoText(source.dayKey, 10),
    slotKey: cleanGoText(source.slotKey, 240),
    timeZone: cleanGoText(source.timeZone, 60) || GO_DEFAULT_TIME_ZONE,
    snapshot,
    businessName: cleanGoText(snapshot.businessName, 120),
    benefitLabel: cleanGoText(snapshot.benefitLabel, 160),
    logoUrl: cleanGoText(snapshot.logoUrl, 500),
    businessSeenAt: toGoIso(source.businessSeenAt),
    checkedInAt: toGoIso(source.checkedInAt),
    completedAt: toGoIso(source.completedAt),
    cancelledAt: toGoIso(source.cancelledAt),
    cancelReason: cleanGoText(source.cancelReason, 200),
    createdAt: toGoIso(source.createdAt),
    updatedAt: toGoIso(source.updatedAt)
  };
}

/**
 * Wann eine Buchung technisch geschlossen wird (Punkt 74).
 *
 * NICHT nach "+15 Minuten". Der Gast, der um 19:35 zu einer 19:00-Buchung
 * kommt, hat eine gueltige Buchung - das Lokal entscheidet, nicht die Uhr.
 * Geschlossen wird erst nach dem Ende des Betriebstages.
 */
function resolveGoBookingClosure(booking = {}, {
  nowMs = Date.now(),
  openingWindows = [],
  timeZone = ""
} = {}) {
  const normalized = normalizeGoBooking(booking);
  if (!isGoBookingOpen(normalized)) {
    return { shouldClose: false, reason: "already_closed", dayEndMs: 0 };
  }
  const zone = cleanGoText(timeZone, 60) || normalized.timeZone;
  const dayEndMs = resolveGoOperatingDayEndMs({
    referenceMs: normalized.expectedArrivalMs || nowMs,
    timeZone: zone,
    windows: openingWindows
  });
  const now = toGoMillis(nowMs) || Date.now();
  if (now <= dayEndMs) return { shouldClose: false, reason: "day_running", dayEndMs };
  return {
    shouldClose: true,
    // Wer da war, hat seinen Besuch abgeschlossen. Wer nicht eingecheckt hat,
    // laeuft aus - ohne Strafpunkt, ohne "No-Show" von selbst (Punkt 75, 76).
    reason: normalized.status === GO_BOOKING_STATUS.checkedIn ? "visit_finished" : "day_ended",
    nextStatus: normalized.status === GO_BOOKING_STATUS.checkedIn
      ? GO_BOOKING_STATUS.completed
      : GO_BOOKING_STATUS.expired,
    dayEndMs
  };
}

/**
 * Darf dieser Gast noch eine Tischreservierung dazunehmen?
 *
 * Vier Tische um 19:00 in vier Lokalen sind keine Verabredung, sondern eine
 * Blockade (Punkt 34). Fuer Angebote ohne Tisch gilt das nicht - Kaffee jetzt
 * und Dessert spaeter ist voellig in Ordnung (Punkt 35).
 *
 * Geprueft wird die Gastkennung, nie die IP (Punkt 32).
 */
function findConflictingGoReservation({
  bookings = [],
  bookingType = GO_BOOKING_TYPE_CLAIM,
  expectedArrivalAt = Date.now(),
  offerId = "",
  restaurantId = "",
  conflictMinutes = GO_RESERVATION_CONFLICT_MINUTES
} = {}) {
  const list = (Array.isArray(bookings) ? bookings : []).map((entry) => normalizeGoBooking(entry));
  const open = list.filter((entry) => isGoBookingOpen(entry));

  // Dasselbe Angebot im selben Lokal zweimal zu sichern, ist immer ein
  // Doppelklick - egal welcher Typ.
  const duplicate = open.find((entry) => (
    entry.offerId
    && entry.offerId === cleanGoText(offerId, 180)
    && entry.restaurantId === cleanGoText(restaurantId, 180)
  ));
  if (duplicate) return { conflict: duplicate, reason: "duplicate" };

  if (normalizeGoBookingType(bookingType) !== GO_BOOKING_TYPE_RESERVATION) {
    return { conflict: null, reason: "" };
  }
  const overlapping = open.find((entry) => (
    entry.type === GO_BOOKING_TYPE_RESERVATION
    && goArrivalsOverlap(entry.expectedArrivalMs, expectedArrivalAt, conflictMinutes)
  ));
  return overlapping
    ? { conflict: overlapping, reason: "overlapping_reservation" }
    : { conflict: null, reason: "" };
}

// Der Schluessel gegen Doppelbuchungen (Punkt 99). Er kommt vom Client, wird
// aber serverseitig gebunden: Gast + Angebot + Schluessel. Ein zweiter Versuch
// mit demselben Schluessel gibt dieselbe Buchung zurueck, statt eine neue
// anzulegen.
function buildGoIdempotencyKey({ guestId = "", offerId = "", clientKey = "" } = {}) {
  const parts = [
    cleanGoText(guestId, 180) || "anon",
    cleanGoText(offerId, 180) || "offer",
    cleanGoText(clientKey, 120) || "none"
  ];
  return parts.join("::").slice(0, 400);
}

// Was der Gast liest. Technische Zustaende stehen nie so in der Oberflaeche
// (Punkt 136).
function goBookingStatusLabel(booking = {}) {
  const status = normalizeGoBookingStatus(booking?.status);
  const type = normalizeGoBookingType(booking?.type);
  if (status === GO_BOOKING_STATUS.confirmed) {
    return type === GO_BOOKING_TYPE_RESERVATION ? "Tavolina është konfirmuar" : "Oferta është e juaja";
  }
  if (status === GO_BOOKING_STATUS.checkedIn) return "Je këtu";
  if (status === GO_BOOKING_STATUS.completed) return "Përfunduar";
  if (status === GO_BOOKING_STATUS.cancelledByUser) return "E anuluar";
  if (status === GO_BOOKING_STATUS.cancelledByBusiness) return "Anuluar nga lokali";
  if (status === GO_BOOKING_STATUS.notArrived) return "Nuk erdhën";
  return "Përfunduar";
}

// Dieselbe Buchung aus der Sicht des Lokals.
function goBookingBusinessStatusLabel(booking = {}) {
  const status = normalizeGoBookingStatus(booking?.status);
  if (status === GO_BOOKING_STATUS.confirmed) return "Po vijnë";
  if (status === GO_BOOKING_STATUS.checkedIn) return "Këtu";
  if (status === GO_BOOKING_STATUS.completed) return "Përfunduar";
  if (status === GO_BOOKING_STATUS.cancelledByUser) return "Anuluar nga klienti";
  if (status === GO_BOOKING_STATUS.cancelledByBusiness) return "Anuluar nga ju";
  if (status === GO_BOOKING_STATUS.notArrived) return "Nuk erdhën";
  return "Skaduar";
}

// "Rreth 19:00" - "rreth", weil es eine erwartete Ankunft ist und keine
// Stechuhr.
function goExpectedArrivalLabel(booking = {}, { nowMs = Date.now() } = {}) {
  const normalized = normalizeGoBooking(booking);
  if (!normalized.expectedArrivalMs) return "";
  const zone = normalized.timeZone;
  const arrival = resolveGoLocalTime(normalized.expectedArrivalMs, zone);
  const now = resolveGoLocalTime(nowMs, zone);
  const clock = formatGoClock(arrival.minutes);
  if (arrival.dayKey === now.dayKey && Math.abs(normalized.expectedArrivalMs - toGoMillis(nowMs)) < 15 * 60 * 1000) {
    return "Tani";
  }
  return arrival.dayKey === now.dayKey ? `Rreth ${clock}` : `${arrival.dayKey} · rreth ${clock}`;
}

// Wieviele Plaetze eine Buchung belegt. Angebote ohne Tisch belegen keine -
// sie sind eine Zusage, kein Sitzplatz.
function goCapacityWeight(booking = {}) {
  if (normalizeGoBookingType(booking?.type || booking?.bookingType) !== GO_BOOKING_TYPE_RESERVATION) {
    return { groups: 0, guests: 0 };
  }
  return {
    groups: 1,
    guests: Math.max(1, Math.trunc(Number(booking?.partySize) || 1))
  };
}

module.exports = {
  GO_BOOKINGS_COLLECTION,
  GO_CAPACITY_COLLECTION,
  GO_GUEST_SESSIONS_COLLECTION,
  GO_SETTINGS_DOC_ID,
  GO_BOOKING_STATUS,
  GO_OPEN_BOOKING_STATUSES,
  GO_SHORT_CODE_ALPHABET,
  GO_SHORT_CODE_LENGTH,
  normalizeGoBookingStatus,
  isGoBookingOpen,
  canTransitionGoBooking,
  createGoShortCode,
  buildGoCapacitySlotKey,
  buildGoDayKey,
  buildGoBookingSnapshot,
  buildGoBookingRecord,
  normalizeGoBooking,
  resolveGoBookingClosure,
  findConflictingGoReservation,
  buildGoIdempotencyKey,
  goBookingStatusLabel,
  goBookingBusinessStatusLabel,
  goExpectedArrivalLabel,
  goCapacityWeight
};
