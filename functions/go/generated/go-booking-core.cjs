"use strict";

// Generated from ../../../shared/go/go-booking-core.js. Do not edit manually.
// Run: node functions/scripts/sync-go-shared.cjs

// Mnyra GO - die Buchung. Pur.
//
// Eine GO-Buchung ist das, was entsteht, wenn ein Gast auf "Prano ofertën"
// tippt. Danach geht sie durch genau drei Zustaende:
//
//   accepted   Die Oferta gehoert dem Gast. 24 Stunden lang.
//   activated  Der Gast hat im Lokal gewischt. Jetzt gibt es einen Code.
//   finalized  Das Lokal hat den Code eingetippt. Jetzt entsteht Geld.
//
// Der wichtigste Begriff dieses Moduls ist isGoBookingLive(). "Offen" ist ein
// Status, "lebendig" ist ein Status PLUS eine Frist - und nur das zweite ist
// die Wahrheit. Es gibt keinen Cronjob, der abgelaufene Buchungen wegraeumt
// (Spezifikation Punkt 58): Ein Gast, der seinen Link nie wieder oeffnet,
// hinterlaesst ein Dokument, in dem bis in alle Ewigkeit "accepted" steht.
// Wer danach fragt, ob dieser Gast in diesem Lokal noch eine offene Oferta
// hat, bekaeme "ja" - und das Lokal waere fuer ihn fuer immer gesperrt, statt
// nach 24 Stunden wieder aufzutauchen.
//
// Und: Der Kurzcode (A7K2M) ist ein Erkennungszeichen fuer die Theke, kein
// Schluessel. Wer eine Buchung oeffnen will, braucht den langen, zufaelligen
// Token (Punkt 39, 40).

const {
  GO_ACTIVATION_WINDOW_HOURS,
  GO_FINALIZATION_GRACE_HOURS
} = require("./go-feature-config.cjs");
const { cleanGoText } = require("./go-offer-core.cjs");
const {
  GO_DEFAULT_TIME_ZONE,
  formatGoClock,
  resolveGoLocalTime,
  toGoIso,
  toGoMillis
} = require("./go-time-core.cjs");

const GO_BOOKINGS_COLLECTION = "goBookings";
const GO_CAPACITY_COLLECTION = "goCapacity";
const GO_GUEST_SESSIONS_COLLECTION = "goGuestSessions";
const GO_SETTINGS_DOC_ID = "goSettings";

const GO_BOOKING_STATUS = Object.freeze({
  accepted: "accepted",
  activated: "activated",
  finalized: "finalized",
  cancelled: "cancelled",
  expired: "expired"
});

// Die Namen von damals. Sie werden gelesen und nie geschrieben.
//
// GO lief nirgends produktiv, als die Zustaende umgestellt wurden - es gibt
// also keine echten Buchungen zu uebersetzen. Was es gibt, sind Testdaten,
// Emulator-Staende und der eine Browser, der seinen alten localStorage noch
// hat. Zehn Zeilen sind billiger als die Frage, warum eine Buchung im Seed
// ploetzlich als "accepted" gilt, obwohl sie laengst eingeloest war.
//
// "checked_in" wird "finalized" und nicht "activated": Der alte Check-in war
// der Augenblick, in dem das Lokal den Code eintippte und Geld entstand. Genau
// das heisst heute Finalisierung. Was heute "activated" heisst - der Gast hat
// selbst gewischt - gab es damals ueberhaupt nicht.
const GO_LEGACY_BOOKING_STATUS = Object.freeze({
  confirmed: GO_BOOKING_STATUS.accepted,
  checked_in: GO_BOOKING_STATUS.finalized,
  completed: GO_BOOKING_STATUS.finalized,
  cancelled_by_user: GO_BOOKING_STATUS.cancelled,
  cancelled_by_business: GO_BOOKING_STATUS.cancelled,
  not_arrived: GO_BOOKING_STATUS.expired
});

// Warum eine Buchung abgelaufen ist. Der Gast liest das nie - er liest
// "Oferta ka skaduar". Fuer Heart ist der Unterschied dagegen die halbe
// Auskunft: Wer nicht aktiviert hat, ist gar nicht erst hingegangen. Wer
// aktiviert hat und trotzdem nicht finalisiert wurde, stand im Lokal.
const GO_EXPIRED_REASON = Object.freeze({
  notActivated: "expired_not_activated",
  notFinalized: "expired_not_finalized"
});

// Offen heisst: die Buchung steht beim Lokal in der Liste und sperrt es fuer
// weitere Oferten desselben Gastes. Alles andere ist Geschichte.
//
// ACHTUNG: Offen ist nicht dasselbe wie lebendig. Ein Status allein weiss
// nichts von der Uhr - dafuer gibt es isGoBookingLive().
const GO_OPEN_BOOKING_STATUSES = Object.freeze([
  GO_BOOKING_STATUS.accepted,
  GO_BOOKING_STATUS.activated
]);

// Was aus einem Zustand werden kann.
//
// Aus "activated" fuehrt kein Weg mehr zu "cancelled", und das ist die ganze
// Absicht (Punkt 23): Sonst gaebe es das Wettrennen, bei dem der Gast seinen
// Code zeigt, der Kellner ihn eintippt und der Gast im selben Augenblick
// storniert. Wer gewischt hat, hat sich entschieden.
const ALLOWED_TRANSITIONS = Object.freeze({
  [GO_BOOKING_STATUS.accepted]: [
    GO_BOOKING_STATUS.activated,
    GO_BOOKING_STATUS.cancelled,
    GO_BOOKING_STATUS.expired
  ],
  [GO_BOOKING_STATUS.activated]: [
    GO_BOOKING_STATUS.finalized,
    GO_BOOKING_STATUS.expired
  ],
  [GO_BOOKING_STATUS.finalized]: [],
  [GO_BOOKING_STATUS.cancelled]: [],
  [GO_BOOKING_STATUS.expired]: []
});

// Der Kurzcode meidet 0/O, 1/I/L und S/5 - er wird am Telefon vorgelesen und
// von Hand abgetippt.
const GO_SHORT_CODE_ALPHABET = "ACDEFGHJKMNPQRTUVWXY23479";
// Fuenf Zeichen, nicht vier. An diesem Code haengt seit der Provision eine
// Rechnung: Vier Zeichen waren 390.625 Moeglichkeiten, fuenf sind 9,7
// Millionen. Ein Code ist damit nichts, was man nebenbei errraet - und
// abgetippt wird er immer noch in einem Atemzug.
const GO_SHORT_CODE_LENGTH = 5;

function normalizeGoBookingStatus(value = "") {
  const key = String(value || "").trim().toLowerCase();
  if (Object.values(GO_BOOKING_STATUS).includes(key)) return key;
  if (GO_LEGACY_BOOKING_STATUS[key]) return GO_LEGACY_BOOKING_STATUS[key];
  return GO_BOOKING_STATUS.accepted;
}

function isGoBookingOpen(booking = {}) {
  return GO_OPEN_BOOKING_STATUSES.includes(normalizeGoBookingStatus(booking?.status));
}

/**
 * Die zwei Fristen einer Buchung, gerechnet aus dem Augenblick der Annahme.
 *
 * Sie stehen am Dokument, statt bei jedem Lesen neu gerechnet zu werden. Der
 * Grund ist nicht Geschwindigkeit: Wuerde man sie rechnen, entschiede die
 * Konstante von heute ueber eine Buchung von gestern. Aendert Mnyra die 24
 * Stunden auf 12, sollen die Gaeste, die schon zugegriffen haben, ihre 24
 * behalten - dieselbe Regel wie bei der Provisionsfassung.
 */
function resolveGoBookingDeadlines({ acceptedAtMs = Date.now() } = {}) {
  const accepted = toGoMillis(acceptedAtMs) || Date.now();
  const activationDeadlineMs = accepted + GO_ACTIVATION_WINDOW_HOURS * 60 * 60 * 1000;
  return {
    acceptedAtMs: accepted,
    activationDeadlineMs,
    // Die Finalisierungsfrist haengt an der Aktivierungsfrist, nicht an der
    // Aktivierung selbst. Sonst haette ein Gast, der in der 24. Stunde wischt,
    // dem Lokal bis Stunde 26 Zeit verschafft - und ein Gast, der sofort
    // wischt, nur bis Stunde 2.
    finalizationDeadlineMs: activationDeadlineMs + GO_FINALIZATION_GRACE_HOURS * 60 * 60 * 1000
  };
}

/**
 * Lebt diese Buchung noch?
 *
 * Offen ist ein Status. Lebendig ist ein Status PLUS eine Frist - und weil
 * kein Cronjob abgelaufene Buchungen umschreibt, ist nur das zweite eine
 * Auskunft, auf die man etwas bauen kann. Jeder Ort, der "offen" meint, meint
 * in Wahrheit das hier: die Suche, der Restaurant-Lock, die Code-Suche, der
 * Tageszaehler.
 *
 * Der Status im Dokument wird nachgezogen, wenn ihn das naechste Mal jemand
 * anfasst. Bis dahin luegt er, und das ist hinnehmbar, solange ihn niemand
 * fragt.
 */
function isGoBookingLive(booking = {}, nowMs = Date.now()) {
  const status = normalizeGoBookingStatus(booking?.status);
  if (!GO_OPEN_BOOKING_STATUSES.includes(status)) return false;
  const now = toGoMillis(nowMs) || Date.now();
  const deadline = status === GO_BOOKING_STATUS.activated
    ? toGoMillis(booking?.finalizationDeadline)
    : toGoMillis(booking?.activationDeadline);
  // Eine Buchung ohne Frist ist eine von damals. Sie gilt als lebendig - die
  // andere Richtung hiesse, einen alten Bestand stillschweigend fuer
  // abgelaufen zu erklaeren, und das ist keine Entscheidung, die eine
  // Hilfsfunktion treffen darf.
  if (!deadline) return true;
  return now <= deadline;
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

// Der Tag, unter dem eine Buchung im Buch des Lokals steht: der Tag der
// ANNAHME, in der Zeitzone des Lokals.
//
// Frueher war das der Tag der erwarteten Ankunft. Den gibt es nicht mehr, und
// er war ohnehin die schwierigere Zahl: Ein Gast, der am Freitagabend fuer
// Samstag zugriff, stand im Buch des Samstags, obwohl das Lokal ihn am Freitag
// gewonnen hatte.
function buildGoDayKey({ atMs = Date.now(), timeZone = GO_DEFAULT_TIME_ZONE } = {}) {
  return resolveGoLocalTime(atMs, timeZone).dayKey;
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
    // Die Zahl, die der Gast beim Zugreifen genannt hat. Sie ist eine
    // Schaetzung und bleibt eine - gerechnet wird spaeter mit der, die der
    // Kellner vor sich sieht.
    partySize: Math.max(1, Math.trunc(Number(request?.partySize) || 1)),
    limits: {
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
  idempotencyKey = "",
  commissionVersion = "",
  timeZone = GO_DEFAULT_TIME_ZONE,
  nowMs = Date.now(),
  serverTimestamp = null
} = {}) {
  const restaurantId = cleanGoText(snapshot?.restaurantId, 180);
  const locationId = cleanGoText(snapshot?.locationId, 180) || "main";
  const deadlines = resolveGoBookingDeadlines({ acceptedAtMs: nowMs });
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
    // Der Kurzcode steht NICHT in diesem Dokument. Das Lokal darf seine
    // eigenen Buchungen lesen - stuende der Code hier, koennte es ihn
    // abschreiben und ohne Gast finalisieren. Er liegt deshalb in einem
    // eigenen Dokument, das nur der Server liest
    // (siehe buildGoBookingCodeRecord).
    status: GO_BOOKING_STATUS.accepted,
    // Zwei Personenzahlen, und das ist kein Versehen. Die erste hat der Gast
    // genannt, als er noch zuhause sass; die zweite sieht der Kellner. Nur die
    // zweite wird zu Geld, und nur getrennt kann Heart spaeter sehen, wie weit
    // Schaetzung und Wirklichkeit auseinanderliegen.
    partySizeRequested: Math.max(1, Math.trunc(Number(snapshot?.partySize || request?.partySize) || 1)),
    partySizeVerified: null,
    dayKey: buildGoDayKey({ atMs: nowMs, timeZone }),
    timeZone: cleanGoText(timeZone, 60) || GO_DEFAULT_TIME_ZONE,
    snapshot,
    idempotencyKey: cleanGoText(idempotencyKey, 120),
    // Die Fassung der Preisliste, festgehalten in dem Augenblick, in dem der
    // Gast zugreift. Gerechnet wird erst beim Finalisieren - aber nach DIESER
    // Liste. Eine neue Preisliste soll nichts umschreiben, was schon im Buch
    // des Lokals steht.
    commissionVersion: cleanGoText(commissionVersion, 40),
    // Der Posten selbst entsteht erst mit der Finalisierung. Bis dahin steht
    // hier nichts - eine nicht finalisierte Oferta kostet das Lokal nichts.
    commission: null,
    // Das Lokal hat diesen Vorgang noch nicht gesehen - daraus wird das
    // Abzeichen im Panel (Punkt 114).
    businessSeenAt: null,
    // Die Uhr der Buchung. Alle vier kommen vom Server; das Telefon des Gastes
    // hat hier keine Stimme (Punkt 57).
    acceptedAt: new Date(deadlines.acceptedAtMs).toISOString(),
    activationDeadline: new Date(deadlines.activationDeadlineMs).toISOString(),
    activatedAt: null,
    finalizationDeadline: new Date(deadlines.finalizationDeadlineMs).toISOString(),
    finalizedAt: null,
    cancelledAt: null,
    expiredAt: null,
    expiredReason: "",
    createdAt: serverTimestamp || new Date(nowMs).toISOString(),
    updatedAt: serverTimestamp || new Date(nowMs).toISOString()
  };
  return record;
}

/**
 * Der Kurzcode, getrennt von der Buchung.
 *
 * Warum ueberhaupt getrennt: Die Bestaetigung im Lokal ist der Augenblick, in
 * dem Geld entsteht. Sie soll nur gelingen, wenn ein Gast wirklich davorsteht
 * und seinen Code zeigt. Stuende der Code in der Buchung, koennte das Lokal
 * ihn dort ablesen - im Panel oder mit den Entwicklerwerkzeugen direkt aus der
 * Datenbank - und ohne Gast bestaetigen.
 *
 * In diesem Dokument steht er allein. Die Regeln geben es weder dem Lokal noch
 * dem Gast frei; nur der Server liest es. Das Lokal kann einen Code damit
 * PRUEFEN, aber nicht NACHSCHLAGEN - und genau darauf beruht die Abrechnung.
 *
 * Der Gast bekommt seinen Code weiter ueber seinen Buchungs-Token.
 */
function buildGoBookingCodeRecord({
  bookingId = "",
  restaurantId = "",
  shortCode = "",
  nowMs = Date.now(),
  serverTimestamp = null
} = {}) {
  return {
    bookingId: cleanGoText(bookingId, 180),
    restaurantId: cleanGoText(restaurantId, 180),
    shortCode: cleanGoText(shortCode, 12).toUpperCase(),
    createdAt: serverTimestamp || new Date(nowMs).toISOString()
  };
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
    status: normalizeGoBookingStatus(source.status),
    // Die angefragte Zahl liest auch die alten Dokumente, in denen sie noch
    // schlicht "partySize" hiess.
    partySizeRequested: Math.max(1, Math.trunc(
      Number(source.partySizeRequested || source.partySize || snapshot.partySize) || 1
    )),
    // Null heisst "noch niemand hat nachgezaehlt" und ist etwas anderes als
    // eine Null-Gruppe.
    partySizeVerified: Number.isFinite(Number(source.partySizeVerified)) && Number(source.partySizeVerified) > 0
      ? Math.trunc(Number(source.partySizeVerified))
      : null,
    dayKey: cleanGoText(source.dayKey, 10),
    timeZone: cleanGoText(source.timeZone, 60) || GO_DEFAULT_TIME_ZONE,
    snapshot,
    businessName: cleanGoText(snapshot.businessName, 120),
    benefitLabel: cleanGoText(snapshot.benefitLabel, 160),
    logoUrl: cleanGoText(snapshot.logoUrl, 500),
    businessSeenAt: toGoIso(source.businessSeenAt),
    acceptedAt: toGoIso(source.acceptedAt || source.createdAt),
    activationDeadline: toGoIso(source.activationDeadline),
    activatedAt: toGoIso(source.activatedAt),
    finalizationDeadline: toGoIso(source.finalizationDeadline),
    finalizedAt: toGoIso(source.finalizedAt || source.completedAt),
    cancelledAt: toGoIso(source.cancelledAt),
    expiredAt: toGoIso(source.expiredAt),
    expiredReason: cleanGoText(source.expiredReason, 40),
    commissionVersion: cleanGoText(source.commissionVersion, 40),
    // Was diese Bestaetigung das Lokal kostet. Steht erst da, wenn bestaetigt
    // wurde - vorher ist es null und nicht null Euro. Der Unterschied zaehlt:
    // "noch nichts entstanden" ist etwas anderes als "kostet nichts".
    commission: source.commission && typeof source.commission === "object"
      ? {
        version: cleanGoText(source.commission.version, 40),
        currency: cleanGoText(source.commission.currency, 8),
        partySize: Math.max(1, Math.trunc(Number(source.commission.partySize) || 1)),
        amountCents: Math.max(0, Math.trunc(Number(source.commission.amountCents) || 0)),
        status: cleanGoText(source.commission.status, 20),
        confirmedAt: toGoIso(source.commission.confirmedAt)
      }
      : null,
    createdAt: toGoIso(source.createdAt),
    updatedAt: toGoIso(source.updatedAt)
  };
}

// Was mit einem Posten passieren kann, nachdem er entstanden ist.
//
// "pending" heisst: bestaetigt, offen, gehoert in die naechste Rechnung.
// "settled" heisst: abgerechnet. Mehr gibt es nicht - ein Posten, der einmal
// entstanden ist, verschwindet nicht wieder. Wird eine Bestaetigung
// rueckgaengig gemacht, ist das ein eigener Vorgang und kein Loeschen.
const GO_COMMISSION_STATUS = Object.freeze({
  pending: "pending",
  settled: "settled"
});

/**
 * Wann eine Buchung technisch geschlossen wird.
 *
 * Frueher stand hier das Ende des Betriebstages, weil eine Buchung eine
 * erwartete Ankunft trug und der Tag ihr natuerliches Ende war. Jetzt traegt
 * sie zwei eigene Fristen, und die haengen an nichts als dem Augenblick der
 * Annahme - keine Oeffnungszeiten, keine Zeitzone, kein Lokal. Das ist die
 * ganze Vereinfachung: Wer wissen will, ob eine Buchung noch gilt, braucht
 * dafuer nur die Buchung und eine Uhr.
 *
 * Ausgelaufen wird ohne Strafpunkt und ohne "No-Show" (Punkt 75, 76). Der
 * Unterschied zwischen "gar nicht erst aktiviert" und "aktiviert, aber nie
 * finalisiert" bleibt trotzdem festgehalten: Er ist fuer Heart der Anfang
 * jeder Frage danach, ob ein Lokal mitspielt.
 */
function resolveGoBookingClosure(booking = {}, { nowMs = Date.now() } = {}) {
  const normalized = normalizeGoBooking(booking);
  if (!isGoBookingOpen(normalized)) {
    return { shouldClose: false, reason: "already_closed" };
  }
  const now = toGoMillis(nowMs) || Date.now();
  const isActivated = normalized.status === GO_BOOKING_STATUS.activated;
  const deadline = toGoMillis(
    isActivated ? normalized.finalizationDeadline : normalized.activationDeadline
  );
  if (!deadline || now <= deadline) {
    return { shouldClose: false, reason: "still_valid", deadlineMs: deadline };
  }
  return {
    shouldClose: true,
    reason: isActivated ? "finalization_window_ended" : "activation_window_ended",
    nextStatus: GO_BOOKING_STATUS.expired,
    expiredReason: isActivated
      ? GO_EXPIRED_REASON.notFinalized
      : GO_EXPIRED_REASON.notActivated,
    deadlineMs: deadline
  };
}

/**
 * Hat dieser Gast in diesem Lokal schon eine laufende Oferta?
 *
 * Das ist die einzige Sperre, die GO noch kennt (Punkt 13, 16). Vier Oferten
 * in vier verschiedenen Lokalen sind ausdruecklich erlaubt - wer abends
 * losgeht, darf sich aussuchen, wo er landet. Zwei im selben Lokal sind es
 * nicht: Das waere derselbe Besuch zweimal abgerechnet.
 *
 * Geprueft wird gegen isGoBookingLive und nicht gegen den Status. Eine
 * Buchung, deren 24 Stunden herum sind, sperrt nichts mehr, auch wenn in ihrem
 * Dokument noch "accepted" steht - sonst waere das Lokal fuer diesen Gast fuer
 * immer verschwunden (Punkt 15).
 *
 * Geprueft wird die Gastkennung, nie die IP (Punkt 32).
 */
function findOpenGoBookingForRestaurant({
  bookings = [],
  restaurantId = "",
  nowMs = Date.now()
} = {}) {
  const wanted = cleanGoText(restaurantId, 180);
  if (!wanted) return { conflict: null, reason: "" };
  const conflict = (Array.isArray(bookings) ? bookings : [])
    .map((entry) => normalizeGoBooking(entry))
    .find((entry) => entry.restaurantId === wanted && isGoBookingLive(entry, nowMs));
  return conflict
    ? { conflict, reason: "restaurant_locked" }
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
  if (status === GO_BOOKING_STATUS.accepted) return "Oferta është e jotja";
  if (status === GO_BOOKING_STATUS.activated) return "Oferta u aktivizua";
  if (status === GO_BOOKING_STATUS.finalized) return "Finalizuar";
  if (status === GO_BOOKING_STATUS.cancelled) return "E anuluar";
  return "Oferta ka skaduar";
}

// Dieselbe Buchung aus der Sicht des Lokals.
//
// "Ka pranuar" und nicht "Po vijnë": Eine angenommene Oferta ist keine
// Ankuendigung mehr, dass jemand kommt - sie ist erst einmal nur ein Zugriff.
// Wer wirklich vor der Tuer steht, hat gewischt.
function goBookingBusinessStatusLabel(booking = {}) {
  const status = normalizeGoBookingStatus(booking?.status);
  if (status === GO_BOOKING_STATUS.accepted) return "Ka pranuar";
  if (status === GO_BOOKING_STATUS.activated) return "Aktivizuar";
  if (status === GO_BOOKING_STATUS.finalized) return "Finalizuar";
  if (status === GO_BOOKING_STATUS.cancelled) return "Anuluar nga klienti";
  return "Skaduar";
}

/**
 * Bis wann die Oferta gilt, als Satz fuer den Gast.
 *
 * "E vlefshme deri sot, 18:00" oder "... deri nesër, 18:00". Weiter als bis
 * morgen kann es nicht gehen - 24 Stunden reichen nie ueber zwei Kalendertage
 * hinaus -, deshalb braucht es kein Datum. Ein Datum waere hier sogar
 * schlechter: "20.08." muss man mit dem Kalender im Kopf abgleichen, "nesër"
 * nicht.
 */
function goValidUntilLabel(booking = {}, { nowMs = Date.now() } = {}) {
  const normalized = normalizeGoBooking(booking);
  const deadlineMs = toGoMillis(normalized.activationDeadline);
  if (!deadlineMs) return "";
  const zone = normalized.timeZone;
  const deadline = resolveGoLocalTime(deadlineMs, zone);
  const now = resolveGoLocalTime(nowMs, zone);
  const clock = formatGoClock(deadline.minutes);
  if (deadline.dayKey === now.dayKey) return `E vlefshme deri sot, ${clock}`;
  return `E vlefshme deri nesër, ${clock}`;
}

// Wieviele Plaetze eine Buchung im Tageszaehler belegt.
//
// Jede Buchung wiegt jetzt gleich. Frueher wogen nur Tischreservierungen etwas
// und blosse Zusagen nichts - eine Unterscheidung, die mit der Buchungsart
// weggefallen ist. Ein Lokal, das sagt "hoechstens zwanzig GO-Gruppen am Tag",
// meint alle zwanzig.
function goCapacityWeight(booking = {}) {
  return {
    groups: 1,
    guests: Math.max(1, Math.trunc(
      Number(booking?.partySizeVerified || booking?.partySizeRequested || booking?.partySize) || 1
    ))
  };
}

module.exports = {
  GO_BOOKINGS_COLLECTION,
  GO_CAPACITY_COLLECTION,
  GO_GUEST_SESSIONS_COLLECTION,
  GO_SETTINGS_DOC_ID,
  GO_BOOKING_STATUS,
  GO_LEGACY_BOOKING_STATUS,
  GO_EXPIRED_REASON,
  GO_OPEN_BOOKING_STATUSES,
  GO_SHORT_CODE_ALPHABET,
  GO_SHORT_CODE_LENGTH,
  normalizeGoBookingStatus,
  isGoBookingOpen,
  resolveGoBookingDeadlines,
  isGoBookingLive,
  canTransitionGoBooking,
  createGoShortCode,
  buildGoDayKey,
  buildGoBookingSnapshot,
  buildGoBookingRecord,
  buildGoBookingCodeRecord,
  normalizeGoBooking,
  GO_COMMISSION_STATUS,
  resolveGoBookingClosure,
  findOpenGoBookingForRestaurant,
  buildGoIdempotencyKey,
  goBookingStatusLabel,
  goBookingBusinessStatusLabel,
  goValidUntilLabel,
  goCapacityWeight
};
