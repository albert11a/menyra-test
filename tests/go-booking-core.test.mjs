import assert from "node:assert/strict";
import test from "node:test";

import {
  GO_BOOKING_STATUS,
  GO_EXPIRED_REASON,
  GO_SHORT_CODE_ALPHABET,
  buildGoBookingCodeRecord,
  buildGoBookingRecord,
  buildGoBookingSnapshot,
  buildGoIdempotencyKey,
  canTransitionGoBooking,
  createGoShortCode,
  findOpenGoBookingForRestaurant,
  goBookingBusinessStatusLabel,
  goBookingStatusLabel,
  goCapacityWeight,
  goValidUntilLabel,
  isGoBookingLive,
  isGoBookingOpen,
  normalizeGoBooking,
  normalizeGoBookingStatus,
  resolveGoBookingClosure,
  resolveGoBookingDeadlines
} from "../shared/go/go-booking-core.js";
import { normalizeGoOffer } from "../shared/go/go-offer-core.js";
import { toGoMillis } from "../shared/go/go-time-core.js";

const THURSDAY_19H = toGoMillis("2026-08-13T17:00:00.000Z"); // 19:00 Ortszeit
const HOUR = 60 * 60 * 1000;

const OFFER = normalizeGoOffer({
  id: "offer-1",
  restaurantId: "rest-1",
  benefit: { kind: "percent", percent: 20 },
  partyRanges: ["2-4"]
});

const BUSINESS = { id: "rest-1", name: "Casa Rita", city: "Prishtina" };

function makeBooking(overrides = {}) {
  const snapshot = buildGoBookingSnapshot({
    offer: OFFER,
    business: BUSINESS,
    request: { partySize: 4 },
    nowMs: THURSDAY_19H
  });
  return {
    ...buildGoBookingRecord({
      bookingId: "bk-1",
      snapshot,
      request: { partySize: 4 },
      guest: { guestId: "guest-1" },
      tokenHash: "hash",
      idempotencyKey: "idem-1",
      nowMs: THURSDAY_19H
    }),
    ...overrides
  };
}

// ===========================================================================
// Punkt 92: Was der Gast angenommen hat, bleibt seins.
// ===========================================================================

test("the snapshot freezes the deal, the offer may change afterwards", () => {
  const snapshot = buildGoBookingSnapshot({
    offer: OFFER,
    business: BUSINESS,
    request: { partySize: 4 },
    nowMs: THURSDAY_19H
  });
  assert.equal(snapshot.benefitLabel, "-20%");
  assert.equal(snapshot.benefit.percent, 20);
  assert.equal(snapshot.businessName, "Casa Rita");

  // Das Lokal stellt danach auf -10 % um. Die Kopie kennt das Angebot nicht
  // mehr - sie traegt ihre Bedingungen selbst.
  const changed = normalizeGoOffer({ ...OFFER, benefit: { kind: "percent", percent: 10 } });
  assert.equal(changed.benefitLabel, "-10%");
  assert.equal(snapshot.benefitLabel, "-20%");
});

// ===========================================================================
// Die Uhr einer Buchung: 24 Stunden, plus 2 fuer das Lokal.
// ===========================================================================

test("a booking gets its two deadlines from the moment it was accepted", () => {
  const booking = makeBooking();
  assert.equal(booking.acceptedAt, "2026-08-13T17:00:00.000Z");
  assert.equal(booking.activationDeadline, "2026-08-14T17:00:00.000Z");
  assert.equal(booking.finalizationDeadline, "2026-08-14T19:00:00.000Z");
  // Der Tag ist der Tag der ANNAHME, in der Zeitzone des Lokals.
  assert.equal(booking.dayKey, "2026-08-13");
});

test("the grace hangs on the deadline, not on the swipe", () => {
  // Sonst haette ein Gast, der in der 24. Stunde wischt, dem Lokal bis Stunde
  // 26 Zeit verschafft - und einer, der sofort wischt, nur bis Stunde 2.
  const early = resolveGoBookingDeadlines({ acceptedAtMs: THURSDAY_19H });
  assert.equal(early.finalizationDeadlineMs - early.activationDeadlineMs, 2 * HOUR);
});

test("the arrival time, the slot key and the booking type are gone", () => {
  const booking = makeBooking();
  assert.equal("expectedArrivalAt" in booking, false);
  assert.equal("slotKey" in booking, false);
  assert.equal("type" in booking, false);
  assert.equal("checkedInAt" in booking, false);
  assert.equal("completedAt" in booking, false);
});

// ===========================================================================
// Regel 8/9: Der Code gehoert nicht in die Buchung.
// ===========================================================================

test("the long token is never stored in the clear, the short code is not a key", () => {
  const booking = makeBooking();
  assert.equal(booking.tokenHash, "hash");
  assert.equal(booking.token, undefined);
  // Der Kurzcode steht ueberhaupt nicht in der Buchung: Das Lokal darf seine
  // eigenen Buchungen lesen, den Code aber nicht - sonst koennte es ohne Gast
  // finalisieren. Er liegt in einem eigenen Dokument, das nur der Server liest.
  assert.equal(booking.shortCode, undefined);
  // Der Kurzcode meidet 0/O und 1/I - er wird vorgelesen und abgetippt.
  const code = createGoShortCode((size) => new Uint8Array(size).fill(0));
  assert.equal(code.length, 5);
  assert.ok([...code].every((letter) => GO_SHORT_CODE_ALPHABET.includes(letter)));
  assert.equal(/[01OIL]/.test(GO_SHORT_CODE_ALPHABET), false);
});

test("the code lives in its own record, keyed by venue and booking", () => {
  const record = buildGoBookingCodeRecord({
    bookingId: "bk-1",
    restaurantId: "rest-1",
    shortCode: "a7k2m",
    nowMs: Date.parse("2026-08-13T14:00:00.000Z")
  });
  assert.equal(record.bookingId, "bk-1");
  assert.equal(record.restaurantId, "rest-1");
  // Immer gross - der Kellner tippt, wie er will.
  assert.equal(record.shortCode, "A7K2M");
  assert.ok(record.createdAt);
});

test("a fresh booking is accepted, unseen, and counted for nobody yet", () => {
  const booking = makeBooking();
  assert.equal(booking.status, GO_BOOKING_STATUS.accepted);
  assert.equal(booking.businessSeenAt, null);
  assert.equal(booking.activatedAt, null);
  assert.equal(booking.finalizedAt, null);
  // Zwei Personenzahlen: geschaetzt und bestaetigt. Null heisst "noch niemand
  // hat nachgezaehlt" und ist etwas anderes als eine Null-Gruppe.
  assert.equal(booking.partySizeRequested, 4);
  assert.equal(booking.partySizeVerified, null);
  // Eine nicht finalisierte Oferta kostet das Lokal nichts.
  assert.equal(booking.commission, null);
  assert.equal(isGoBookingOpen(booking), true);
});

// ===========================================================================
// "Offen" ist ein Status. "Lebendig" ist ein Status plus eine Frist.
// ===========================================================================

test("a booking lives for 24 hours, then it stops locking anything", () => {
  const booking = makeBooking();
  assert.equal(isGoBookingLive(booking, THURSDAY_19H), true);
  assert.equal(isGoBookingLive(booking, THURSDAY_19H + 23 * HOUR), true);
  assert.equal(isGoBookingLive(booking, THURSDAY_19H + 25 * HOUR), false);
});

test("an activated booking lives two hours longer than an accepted one", () => {
  const activated = makeBooking({ status: GO_BOOKING_STATUS.activated });
  // Der Gast hat in der letzten Minute gewischt: das Lokal hat noch zwei
  // Stunden, um den Code einzutippen.
  assert.equal(isGoBookingLive(activated, THURSDAY_19H + 25 * HOUR), true);
  assert.equal(isGoBookingLive(activated, THURSDAY_19H + 27 * HOUR), false);
});

test("a finalized or cancelled booking is never live", () => {
  assert.equal(isGoBookingLive(makeBooking({ status: GO_BOOKING_STATUS.finalized }), THURSDAY_19H), false);
  assert.equal(isGoBookingLive(makeBooking({ status: GO_BOOKING_STATUS.cancelled }), THURSDAY_19H), false);
});

test("expiring says WHY, because that is half the answer for Heart", () => {
  const notActivated = resolveGoBookingClosure(makeBooking(), { nowMs: THURSDAY_19H + 25 * HOUR });
  assert.equal(notActivated.shouldClose, true);
  assert.equal(notActivated.nextStatus, GO_BOOKING_STATUS.expired);
  assert.equal(notActivated.expiredReason, GO_EXPIRED_REASON.notActivated);

  const notFinalized = resolveGoBookingClosure(
    makeBooking({ status: GO_BOOKING_STATUS.activated }),
    { nowMs: THURSDAY_19H + 27 * HOUR }
  );
  assert.equal(notFinalized.shouldClose, true);
  assert.equal(notFinalized.expiredReason, GO_EXPIRED_REASON.notFinalized);
});

test("no stopwatch closes a booking early", () => {
  // Weder Verspaetung noch Feierabend des Lokals: Die einzige Grenze sind die
  // 24 Stunden ab der Annahme.
  const booking = makeBooking();
  assert.equal(resolveGoBookingClosure(booking, { nowMs: THURSDAY_19H + 4 * HOUR }).shouldClose, false);
  assert.equal(resolveGoBookingClosure(booking, { nowMs: THURSDAY_19H + 20 * HOUR }).shouldClose, false);
});

// ===========================================================================
// Regel 6/7: ein Lokal einmal, verschiedene Lokale beliebig.
// ===========================================================================

test("a second offer from the same venue is refused", () => {
  const result = findOpenGoBookingForRestaurant({
    bookings: [makeBooking()],
    restaurantId: "rest-1",
    nowMs: THURSDAY_19H
  });
  assert.equal(result.reason, "restaurant_locked");
});

test("four different venues at the same time are fine", () => {
  const result = findOpenGoBookingForRestaurant({
    bookings: [makeBooking()],
    restaurantId: "rest-2",
    nowMs: THURSDAY_19H
  });
  assert.equal(result.conflict, null);
});

test("after 24 hours the venue appears in the search again", () => {
  // Punkt 15. Ohne diese Regel waere ein Lokal fuer diesen Gast fuer immer
  // verschwunden: Es gibt keinen Cronjob, der das Dokument umschreibt, und
  // "accepted" stuende dort bis in alle Ewigkeit.
  const stale = makeBooking();
  assert.equal(
    findOpenGoBookingForRestaurant({
      bookings: [stale],
      restaurantId: "rest-1",
      nowMs: THURSDAY_19H + 25 * HOUR
    }).conflict,
    null
  );
});

test("a cancelled or finalized booking locks nothing", () => {
  ["cancelled", "finalized", "expired"].forEach((status) => {
    assert.equal(
      findOpenGoBookingForRestaurant({
        bookings: [makeBooking({ status })],
        restaurantId: "rest-1",
        nowMs: THURSDAY_19H
      }).conflict,
      null,
      `status ${status} darf nichts sperren`
    );
  });
});

// ===========================================================================
// Regel 1 bis 5: was niemals zweimal passieren darf.
// ===========================================================================

test("the guest walks accepted, activated, finalized - and no other way", () => {
  const { accepted, activated, finalized, cancelled, expired } = GO_BOOKING_STATUS;
  assert.equal(canTransitionGoBooking(accepted, activated), true);
  assert.equal(canTransitionGoBooking(activated, finalized), true);
  // Ohne Wischen keine Finalisierung: Der Code ist bis dahin nirgends
  // sichtbar gewesen.
  assert.equal(canTransitionGoBooking(accepted, finalized), false);
  // Regel 2: der zweite Wisch ist kein zweiter Wisch.
  assert.equal(canTransitionGoBooking(activated, activated), false);
  // Regel 4: derselbe Code finalisiert nicht zweimal.
  assert.equal(canTransitionGoBooking(finalized, finalized), false);
  assert.equal(canTransitionGoBooking(finalized, activated), false);
  // Terminal ist terminal.
  assert.equal(canTransitionGoBooking(cancelled, activated), false);
  assert.equal(canTransitionGoBooking(expired, finalized), false);
});

test("after the swipe there is no ordinary cancellation", () => {
  // Punkt 23. Sonst gaebe es das Wettrennen: Der Gast zeigt seinen Code, der
  // Kellner tippt ihn ein, der Gast storniert im selben Augenblick.
  assert.equal(canTransitionGoBooking(GO_BOOKING_STATUS.accepted, GO_BOOKING_STATUS.cancelled), true);
  assert.equal(canTransitionGoBooking(GO_BOOKING_STATUS.activated, GO_BOOKING_STATUS.cancelled), false);
});

test("there is no no-show state left for anyone to press", () => {
  // Punkt 25: Das Lokal entscheidet nicht darueber, ob Mnyra Geld bekommt.
  assert.equal(Object.values(GO_BOOKING_STATUS).includes("not_arrived"), false);
  assert.equal(Object.values(GO_BOOKING_STATUS).includes("cancelled_by_business"), false);
});

test("the idempotency key is bound to the guest, not only to the client", () => {
  const first = buildGoIdempotencyKey({ guestId: "guest-1", offerId: "offer-1", clientKey: "abc" });
  const second = buildGoIdempotencyKey({ guestId: "guest-2", offerId: "offer-1", clientKey: "abc" });
  assert.notEqual(first, second);
  assert.equal(first, buildGoIdempotencyKey({ guestId: "guest-1", offerId: "offer-1", clientKey: "abc" }));
});

// ===========================================================================
// Die Namen von damals bleiben lesbar.
// ===========================================================================

test("old status names are read, never written", () => {
  assert.equal(normalizeGoBookingStatus("confirmed"), GO_BOOKING_STATUS.accepted);
  // Der alte Check-in war der Augenblick, in dem Geld entstand - das heisst
  // heute Finalisierung, nicht Aktivierung.
  assert.equal(normalizeGoBookingStatus("checked_in"), GO_BOOKING_STATUS.finalized);
  assert.equal(normalizeGoBookingStatus("completed"), GO_BOOKING_STATUS.finalized);
  assert.equal(normalizeGoBookingStatus("cancelled_by_user"), GO_BOOKING_STATUS.cancelled);
  assert.equal(normalizeGoBookingStatus("cancelled_by_business"), GO_BOOKING_STATUS.cancelled);
  assert.equal(normalizeGoBookingStatus("not_arrived"), GO_BOOKING_STATUS.expired);
});

test("a booking from before carries its old party size over", () => {
  const legacy = normalizeGoBooking({ id: "old", status: "confirmed", partySize: 3 });
  assert.equal(legacy.partySizeRequested, 3);
  assert.equal(legacy.status, GO_BOOKING_STATUS.accepted);
});

// ===========================================================================
// Was der Mensch liest.
// ===========================================================================

test("technical states never reach the surface", () => {
  assert.equal(goBookingStatusLabel({ status: "accepted" }), "Oferta është e jotja");
  assert.equal(goBookingStatusLabel({ status: "activated" }), "Oferta u aktivizua");
  assert.equal(goBookingStatusLabel({ status: "finalized" }), "Finalizuar");
  assert.equal(goBookingStatusLabel({ status: "cancelled" }), "E anuluar");
  assert.equal(goBookingStatusLabel({ status: "expired" }), "Oferta ka skaduar");
  // Aus der Sicht des Lokals: eine angenommene Oferta ist noch keine
  // Ankuendigung, dass jemand kommt.
  assert.equal(goBookingBusinessStatusLabel({ status: "accepted" }), "Ka pranuar");
  assert.equal(goBookingBusinessStatusLabel({ status: "activated" }), "Aktivizuar");
  assert.equal(goBookingBusinessStatusLabel({ status: "finalized" }), "Finalizuar");
});

test("the guest reads a day and a clock, never a date", () => {
  const booking = makeBooking();
  // 24 Stunden reichen nie ueber zwei Kalendertage - "nesër" genuegt.
  assert.equal(goValidUntilLabel(booking, { nowMs: THURSDAY_19H }), "E vlefshme deri nesër, 19:00");
  assert.equal(
    goValidUntilLabel(booking, { nowMs: THURSDAY_19H + 20 * HOUR }),
    "E vlefshme deri sot, 19:00"
  );
});

test("every booking weighs the same in the day counter", () => {
  // Frueher wogen nur Tischreservierungen etwas. "Hoechstens zwanzig
  // GO-Gruppen am Tag" meint jetzt alle zwanzig.
  assert.deepEqual(goCapacityWeight({ partySizeRequested: 4 }), { groups: 1, guests: 4 });
  // Nach der Finalisierung zaehlt die bestaetigte Zahl.
  assert.deepEqual(
    goCapacityWeight({ partySizeRequested: 4, partySizeVerified: 3 }),
    { groups: 1, guests: 3 }
  );
});
