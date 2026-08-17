import assert from "node:assert/strict";
import test from "node:test";

import {
  GO_BOOKING_STATUS,
  GO_SHORT_CODE_ALPHABET,
  buildGoBookingCodeRecord,
  buildGoBookingRecord,
  buildGoBookingSnapshot,
  buildGoCapacitySlotKey,
  buildGoIdempotencyKey,
  canTransitionGoBooking,
  createGoShortCode,
  findConflictingGoReservation,
  goBookingBusinessStatusLabel,
  goBookingStatusLabel,
  goCapacityWeight,
  goExpectedArrivalLabel,
  isGoBookingOpen,
  normalizeGoBooking,
  resolveGoBookingClosure
} from "../shared/go/go-booking-core.js";
import { normalizeGoOffer } from "../shared/go/go-offer-core.js";
import { toGoMillis } from "../shared/go/go-time-core.js";

const THURSDAY_19H = toGoMillis("2026-08-13T17:00:00.000Z"); // 19:00 Ortszeit
const OPENING = [{ start: 660, end: 1320 }]; // 11:00 - 22:00

const OFFER = normalizeGoOffer({
  id: "offer-1",
  restaurantId: "rest-1",
  benefit: { kind: "percent", percent: 20 },
  partyRanges: ["2-4"],
  bookingType: "reservation"
});

const BUSINESS = { id: "rest-1", name: "Casa Rita", city: "Prishtina" };

function makeBooking(overrides = {}) {
  const snapshot = buildGoBookingSnapshot({
    offer: OFFER,
    business: BUSINESS,
    request: { partySize: 4, requestedAt: THURSDAY_19H },
    nowMs: THURSDAY_19H
  });
  return buildGoBookingRecord({
    bookingId: "bk-1",
    snapshot,
    request: { partySize: 4, requestedAt: THURSDAY_19H },
    guest: { guestId: "guest-1" },
    tokenHash: "hash",
    shortCode: "A7K2",
    idempotencyKey: "idem-1",
    nowMs: THURSDAY_19H,
    ...overrides
  });
}

// ===========================================================================
// Punkt 92: Was der Gast angenommen hat, bleibt seins.
// ===========================================================================

test("the snapshot freezes the deal, the offer may change afterwards", () => {
  const snapshot = buildGoBookingSnapshot({
    offer: OFFER,
    business: BUSINESS,
    request: { partySize: 4, requestedAt: THURSDAY_19H },
    nowMs: THURSDAY_19H
  });
  assert.equal(snapshot.benefitLabel, "-20%");
  assert.equal(snapshot.benefit.percent, 20);
  assert.equal(snapshot.businessName, "Casa Rita");
  assert.equal(snapshot.bookingType, "reservation");

  // Das Lokal stellt danach auf -10 % um. Die Kopie kennt das Angebot nicht
  // mehr - sie traegt ihre Bedingungen selbst.
  const changed = normalizeGoOffer({ ...OFFER, benefit: { kind: "percent", percent: 10 } });
  assert.equal(changed.benefitLabel, "-10%");
  assert.equal(snapshot.benefitLabel, "-20%");
});

test("a booking carries the day and slot of the expected arrival", () => {
  const booking = makeBooking();
  assert.equal(booking.dayKey, "2026-08-13");
  // 19:00 faellt in die Scheibe 1900, 19:20 faellt in dieselbe.
  assert.equal(booking.slotKey, "rest-1__main__2026-08-13__1900");
  const later = buildGoCapacitySlotKey({
    restaurantId: "rest-1",
    expectedArrivalAt: THURSDAY_19H + 20 * 60 * 1000
  });
  assert.equal(later, booking.slotKey);
  const halfPast = buildGoCapacitySlotKey({
    restaurantId: "rest-1",
    expectedArrivalAt: THURSDAY_19H + 35 * 60 * 1000
  });
  assert.equal(halfPast, "rest-1__main__2026-08-13__1930");
});

test("the long token is never stored in the clear, the short code is not a key", () => {
  const booking = makeBooking();
  assert.equal(booking.tokenHash, "hash");
  assert.equal(booking.token, undefined);
  // Und der Kurzcode steht ueberhaupt nicht in der Buchung: Das Lokal darf
  // seine eigenen Buchungen lesen, den Code aber nicht - sonst koennte es
  // ohne Gast bestaetigen. Er liegt in einem eigenen Dokument, das nur der
  // Server liest (buildGoBookingCodeRecord).
  assert.equal(booking.shortCode, undefined);
  // Der Kurzcode meidet 0/O und 1/I - er wird vorgelesen und abgetippt.
  const code = createGoShortCode((size) => new Uint8Array(size).fill(0));
  assert.equal(code.length, 5);
  assert.ok([...code].every((letter) => GO_SHORT_CODE_ALPHABET.includes(letter)));
  assert.equal(/[01OIL]/.test(GO_SHORT_CODE_ALPHABET), false);
});

test("a fresh booking has not been seen by the venue yet", () => {
  const booking = makeBooking();
  assert.equal(booking.businessSeenAt, null);
  assert.equal(booking.status, GO_BOOKING_STATUS.confirmed);
  assert.equal(isGoBookingOpen(booking), true);
});

// ===========================================================================
// Punkt 71 bis 76: keine Zeitstrafe.
// ===========================================================================

test("arriving late does not close a booking", () => {
  const booking = makeBooking();
  // 35 Minuten nach der erwarteten Ankunft - die Buchung steht.
  const late = resolveGoBookingClosure(booking, {
    nowMs: THURSDAY_19H + 35 * 60 * 1000,
    openingWindows: OPENING
  });
  assert.equal(late.shouldClose, false);
  assert.equal(late.reason, "day_running");

  // Auch zwei Stunden spaeter, solange das Lokal offen hat.
  const muchLater = resolveGoBookingClosure(booking, {
    nowMs: THURSDAY_19H + 2 * 60 * 60 * 1000,
    openingWindows: OPENING
  });
  assert.equal(muchLater.shouldClose, false);
});

test("the booking closes with the operating day, not with a stopwatch", () => {
  const booking = makeBooking();
  // 22:00 Ortszeit ist Feierabend; eine Minute danach laeuft die Buchung aus.
  const afterClosing = resolveGoBookingClosure(booking, {
    nowMs: toGoMillis("2026-08-13T20:01:00.000Z"),
    openingWindows: OPENING
  });
  assert.equal(afterClosing.shouldClose, true);
  assert.equal(afterClosing.nextStatus, GO_BOOKING_STATUS.expired);
});

test("a guest who checked in ends the day as completed, never as a no-show", () => {
  const booking = { ...makeBooking(), status: GO_BOOKING_STATUS.checkedIn };
  const closure = resolveGoBookingClosure(booking, {
    nowMs: toGoMillis("2026-08-13T20:01:00.000Z"),
    openingWindows: OPENING
  });
  assert.equal(closure.nextStatus, GO_BOOKING_STATUS.completed);
  assert.equal(closure.reason, "visit_finished");
});

test("only the venue may mark a no-show, and only as a final state", () => {
  assert.equal(canTransitionGoBooking(GO_BOOKING_STATUS.confirmed, GO_BOOKING_STATUS.notArrived), true);
  // Wer eingecheckt hat, kann nicht mehr "nicht erschienen" sein.
  assert.equal(canTransitionGoBooking(GO_BOOKING_STATUS.checkedIn, GO_BOOKING_STATUS.notArrived), false);
  // Eine abgeschlossene Buchung wird nicht wiederbelebt.
  assert.equal(canTransitionGoBooking(GO_BOOKING_STATUS.completed, GO_BOOKING_STATUS.checkedIn), false);
  assert.equal(canTransitionGoBooking(GO_BOOKING_STATUS.confirmed, GO_BOOKING_STATUS.checkedIn), true);
  // Punkt 91: der zweite Scan macht keinen zweiten Check-in.
  assert.equal(canTransitionGoBooking(GO_BOOKING_STATUS.checkedIn, GO_BOOKING_STATUS.checkedIn), false);
});

// ===========================================================================
// Punkt 34/35: ein Tisch zur Zeit, aber beliebig viele Angebote.
// ===========================================================================

test("a second table at the same hour collides", () => {
  const existing = [{
    ...makeBooking(),
    offerId: "offer-1",
    restaurantId: "rest-1",
    type: "reservation",
    status: GO_BOOKING_STATUS.confirmed
  }];
  const result = findConflictingGoReservation({
    bookings: existing,
    bookingType: "reservation",
    expectedArrivalAt: THURSDAY_19H + 30 * 60 * 1000,
    offerId: "offer-9",
    restaurantId: "rest-2"
  });
  assert.equal(result.reason, "overlapping_reservation");
});

test("a table three hours later is a different evening", () => {
  const existing = [{ ...makeBooking(), type: "reservation" }];
  const result = findConflictingGoReservation({
    bookings: existing,
    bookingType: "reservation",
    expectedArrivalAt: THURSDAY_19H + 3 * 60 * 60 * 1000,
    offerId: "offer-9",
    restaurantId: "rest-2"
  });
  assert.equal(result.conflict, null);
});

test("coffee now and dessert later are both allowed", () => {
  const existing = [{ ...makeBooking(), offerId: "offer-coffee", type: "claim" }];
  const result = findConflictingGoReservation({
    bookings: existing,
    bookingType: "claim",
    expectedArrivalAt: THURSDAY_19H,
    offerId: "offer-dessert",
    restaurantId: "rest-2"
  });
  assert.equal(result.conflict, null);
});

test("the same offer twice is a double tap, not a second booking", () => {
  const existing = [{ ...makeBooking(), offerId: "offer-1", restaurantId: "rest-1", type: "claim" }];
  const result = findConflictingGoReservation({
    bookings: existing,
    bookingType: "claim",
    expectedArrivalAt: THURSDAY_19H,
    offerId: "offer-1",
    restaurantId: "rest-1"
  });
  assert.equal(result.reason, "duplicate");
});

test("a cancelled booking blocks nothing", () => {
  const existing = [{ ...makeBooking(), type: "reservation", status: GO_BOOKING_STATUS.cancelledByUser }];
  const result = findConflictingGoReservation({
    bookings: existing,
    bookingType: "reservation",
    expectedArrivalAt: THURSDAY_19H,
    offerId: "offer-9",
    restaurantId: "rest-2"
  });
  assert.equal(result.conflict, null);
});

test("the idempotency key is bound to the guest, not only to the client", () => {
  const first = buildGoIdempotencyKey({ guestId: "guest-1", offerId: "offer-1", clientKey: "abc" });
  const second = buildGoIdempotencyKey({ guestId: "guest-2", offerId: "offer-1", clientKey: "abc" });
  assert.notEqual(first, second);
  assert.equal(first, buildGoIdempotencyKey({ guestId: "guest-1", offerId: "offer-1", clientKey: "abc" }));
});

// ===========================================================================
// Was der Mensch liest.
// ===========================================================================

test("technical states never reach the surface", () => {
  assert.equal(goBookingStatusLabel({ status: "confirmed", type: "reservation" }), "Tavolina është konfirmuar");
  assert.equal(goBookingStatusLabel({ status: "confirmed", type: "claim" }), "Oferta është e juaja");
  assert.equal(goBookingStatusLabel({ status: "checked_in" }), "Je këtu");
  assert.equal(goBookingBusinessStatusLabel({ status: "confirmed" }), "Po vijnë");
  assert.equal(goBookingBusinessStatusLabel({ status: "cancelled_by_user" }), "Anuluar nga klienti");
});

test("the arrival reads as approximate, because that is what it is", () => {
  const booking = normalizeGoBooking(makeBooking());
  assert.equal(goExpectedArrivalLabel(booking, { nowMs: THURSDAY_19H }), "Tani");
  assert.equal(
    goExpectedArrivalLabel(booking, { nowMs: THURSDAY_19H - 2 * 60 * 60 * 1000 }),
    "Rreth 19:00"
  );
});

test("only a table takes capacity", () => {
  assert.deepEqual(goCapacityWeight({ type: "reservation", partySize: 4 }), { groups: 1, guests: 4 });
  assert.deepEqual(goCapacityWeight({ type: "claim", partySize: 4 }), { groups: 0, guests: 0 });
});

test("the code lives in its own record, keyed by venue and booking", () => {
  // Getrennt, damit das Lokal einen Code PRUEFEN, aber nicht NACHSCHLAGEN
  // kann. Daran haengt die Abrechnung.
  const record = buildGoBookingCodeRecord({
    bookingId: "bk-1",
    restaurantId: "rest-1",
    shortCode: "a7k2",
    nowMs: Date.parse("2026-08-13T14:00:00.000Z")
  });
  assert.equal(record.bookingId, "bk-1");
  assert.equal(record.restaurantId, "rest-1");
  // Immer gross - der Kellner tippt, wie er will.
  assert.equal(record.shortCode, "A7K2");
  assert.ok(record.createdAt);
});
