import assert from "node:assert/strict";
import test from "node:test";

import { createGoService } from "../functions/go/go-service.js";
import { createFakeFirestore } from "./go-fake-firestore.mjs";

// ===========================================================================
// Der GO-Dienst mit einer Firestore-Attrappe.
//
// Hier stehen die Faelle aus der "Definition of Done" der Spezifikation: Gast
// ohne Konto, Doppeltap im schwachen Netz, letzter freier Platz fuer zwei
// Gaeste gleichzeitig, geaendertes Angebot nach der Buchung, spaete Ankunft.
// ===========================================================================

// Donnerstag, 13.08.2026, 16:00 Ortszeit in Prishtina.
const THURSDAY_16H = Date.parse("2026-08-13T14:00:00.000Z");

const OFFER = {
  restaurantId: "rest-1",
  locationId: "main",
  cityKey: "prishtina",
  title: "Dreka e grupit",
  benefit: { kind: "percent", percent: 20 },
  benefitLabel: "-20%",
  category: "food",
  partyRanges: ["2-4"],
  minParty: 2,
  maxParty: 4,
  schedule: { mode: "windows", days: ["mon", "tue", "wed", "thu"], windows: [{ start: 840, end: 1140 }] },
  limits: { dailyGroups: 1, totalRedemptions: 0 },
  channels: ["go"],
  status: "active",
  redeemedCount: 0
};

const HOUR = 60 * 60 * 1000;

const RESTAURANT = {
  name: "Casa Rita",
  city: "Prishtina",
  openingHours: "Hene - Diel: 11:00 - 22:00",
  coords: { lat: 42.6629, lng: 21.1655 },
  logoUrl: "https://cdn.example/casa-rita.png",
  ownerUid: "owner-1"
};

function setup(overrides = {}) {
  const db = createFakeFirestore({
    "restaurants/rest-1": { ...RESTAURANT, ...(overrides.restaurant || {}) },
    "restaurants/rest-1/goSettings/config": { enabled: true, ...(overrides.settings || {}) },
    "restaurants/rest-1/goOffers/offer-1": { ...OFFER, ...(overrides.offer || {}) },
    ...(overrides.extra || {})
  });
  const service = createGoService({
    db,
    now: () => overrides.nowMs || THURSDAY_16H
  });
  return { db, service };
}

const REQUEST = { city: "Prishtina", partySize: 4, category: "food" };

// Der ganze Weg des Gastes in einem Aufruf: annehmen, wischen, und - wenn
// gewuenscht - im Lokal finalisieren. Er steht hier, weil ihn fast jeder Test
// braucht: Ohne Wischen gibt es keinen Code, und ohne Code kein Geld.
async function acceptAndActivate(service, { offerId = "offer-1", restaurantId = "rest-1", guestToken, idempotencyKey = "a" } = {}) {
  const booked = await service.createBooking({
    offerId, restaurantId, request: REQUEST, guestToken, idempotencyKey
  });
  const activated = await service.activateBooking({
    bookingToken: booked.bookingToken,
    guestToken
  });
  return { ...booked, booking: activated.booking, shortCode: activated.booking.shortCode };
}

// Zaehlen laeuft beilaeufig: Der Dienst wartet bewusst NICHT darauf, damit
// eine langsame Zahl nie eine Suche oder eine Buchung aufhaelt (Punkt 115).
// Der Test muss deshalb selbst kurz warten, sonst prueft er den Zaehler,
// bevor er geschrieben hat - und faellt irgendwann grundlos.
async function settle() {
  await new Promise((resolve) => setImmediate(resolve));
  await new Promise((resolve) => setImmediate(resolve));
}


// ---------------------------------------------------------------------------

test("a guest without an account searches, books and finds it again", async () => {
  const { service } = setup();

  const session = await service.ensureGuestSession({});
  assert.ok(session.guestToken);
  assert.equal(session.created, true);

  const found = await service.search({ request: REQUEST, guestToken: session.guestToken });
  assert.equal(found.results.length, 1);
  assert.equal(found.results[0].benefitLabel, "-20%");
  assert.equal(found.results[0].businessName, "Casa Rita");

  const booked = await service.createBooking({
    offerId: "offer-1",
    restaurantId: "rest-1",
    request: REQUEST,
    guestToken: session.guestToken,
    idempotencyKey: "tap-1"
  });
  assert.equal(booked.booking.status, "accepted");
  assert.equal(booked.booking.partySizeRequested, 4);
  assert.ok(booked.bookingToken);
  // Noch kein Code: Der Gast hat noch nicht gewischt (Punkt 4, Regel 8).
  assert.equal(booked.booking.shortCode, "");

  // Safari zu, Safari auf: die Buchung ist da, weil sie auf dem Server liegt.
  const reopened = await service.getBooking({ bookingToken: booked.bookingToken });
  assert.equal(reopened.booking.id, booked.booking.id);
  assert.equal(reopened.booking.benefitLabel, "-20%");
  assert.equal(reopened.booking.shortCode, "");

  // Erst der Wisch im Lokal macht den Code sichtbar.
  const activated = await service.activateBooking({
    bookingToken: booked.bookingToken,
    guestToken: session.guestToken
  });
  assert.equal(activated.booking.status, "activated");
  assert.equal(activated.booking.shortCode.length, 5);
});

// ===========================================================================
// Der Wisch. Regel 2: er zaehlt genau einmal.
// ===========================================================================

test("the code stays hidden until the guest swipes", async () => {
  const { service } = setup();
  const session = await service.ensureGuestSession({});
  const booked = await service.createBooking({
    offerId: "offer-1", restaurantId: "rest-1", request: REQUEST,
    guestToken: session.guestToken, idempotencyKey: "a"
  });
  // Weder beim Anlegen noch beim Lesen - und der Gast hat hier den Token, also
  // ist es nicht der Zugriff, der fehlt, sondern der Handgriff im Lokal.
  assert.equal(booked.booking.shortCode, "");
  assert.equal((await service.getBooking({ bookingToken: booked.bookingToken })).booking.shortCode, "");

  // Das Lokal findet ihn auch nicht: Ohne Aktivierung gibt es nichts zu
  // finalisieren, und der Satz sagt genau das.
  const stored = await service.getBooking({ bookingToken: booked.bookingToken });
  assert.equal(stored.booking.status, "accepted");
});

test("swiping ten times activates once and returns the same code", async () => {
  const { db, service } = setup();
  const session = await service.ensureGuestSession({});
  const booked = await service.createBooking({
    offerId: "offer-1", restaurantId: "rest-1", request: REQUEST,
    guestToken: session.guestToken, idempotencyKey: "a"
  });

  const first = await service.activateBooking({ bookingToken: booked.bookingToken, guestToken: session.guestToken });
  assert.equal(first.alreadyActivated, false);

  // Seite neu geladen, noch dreimal gewischt: derselbe Code, keine zweite
  // Aktivierung, kein zweiter Zaehlschritt.
  for (let index = 0; index < 3; index += 1) {
    const again = await service.activateBooking({ bookingToken: booked.bookingToken, guestToken: session.guestToken });
    assert.equal(again.alreadyActivated, true);
    assert.equal(again.booking.shortCode, first.booking.shortCode);
  }
  await settle();
  const stats = db.__all("restaurants/rest-1/goStats/")[0];
  assert.equal(stats.data.activated, 1);
});

test("a booking never gets a second code", async () => {
  // Regel 3. Der Code entsteht mit der Buchung und nicht mit dem Wisch - sonst
  // haenge an genau dem Handgriff im Lokal noch ein Schreibvorgang.
  const { db, service } = setup();
  const session = await service.ensureGuestSession({});
  const booked = await acceptAndActivate(service, { guestToken: session.guestToken });
  assert.equal(db.__all("goBookingCodes/").length, 1);
  assert.equal(db.__all("goBookingCodes/")[0].data.shortCode, booked.shortCode);
});

test("a swipe at home costs nothing and keeps the same code for later", async () => {
  // Punkt 6: Der versehentliche Wisch zuhause ist kein Schaden. Er erzeugt
  // keinen Besuch, keine Gebuehr - und der Gast geht spaeter mit demselben
  // Code hin.
  const { db, service } = setup();
  const session = await service.ensureGuestSession({});
  const activated = await acceptAndActivate(service, { guestToken: session.guestToken });
  await settle();
  assert.equal(db.__read(`goBookings/${activated.booking.id}`).commission, null);
  const stats = db.__all("restaurants/rest-1/goStats/")[0];
  assert.equal(stats.data.finalized, undefined);
  assert.equal(stats.data.visitors, undefined);

  // Vier Stunden spaeter im Lokal: derselbe Code oeffnet dieselbe Buchung.
  const later = createGoService({ db, now: () => THURSDAY_16H + 4 * HOUR });
  const finalized = await later.finalizeBooking({
    shortCode: activated.shortCode,
    restaurantId: "rest-1",
    partySize: 4
  });
  assert.equal(finalized.booking.status, "finalized");
});

test("a swipe after 24 hours is refused, and the booking says why", async () => {
  const { db, service } = setup();
  const session = await service.ensureGuestSession({});
  const booked = await service.createBooking({
    offerId: "offer-1", restaurantId: "rest-1", request: REQUEST,
    guestToken: session.guestToken, idempotencyKey: "a"
  });
  const late = createGoService({ db, now: () => THURSDAY_16H + 25 * HOUR });
  await assert.rejects(
    () => late.activateBooking({ bookingToken: booked.bookingToken, guestToken: session.guestToken }),
    (error) => error.message === "Oferta ka skaduar."
  );
  const stored = db.__read(`goBookings/${booked.booking.id}`);
  assert.equal(stored.status, "expired");
  assert.equal(stored.expiredReason, "expired_not_activated");
});

test("no account is ever required, and the booking token is the only key", async () => {
  const { service } = setup();
  const session = await service.ensureGuestSession({});
  const booked = await service.createBooking({
    offerId: "offer-1",
    restaurantId: "rest-1",
    request: REQUEST,
    guestToken: session.guestToken,
    idempotencyKey: "tap-1"
  });
  // Ein erfundener Token oeffnet nichts - auch nicht mit der richtigen Nummer.
  await assert.rejects(
    () => service.getBooking({ bookingToken: `b1.${booked.booking.id}.${"x".repeat(43)}` }),
    (error) => error.code === "not-found"
  );
});

test("a double tap on a weak connection creates one booking, not two", async () => {
  const { db, service } = setup();
  const session = await service.ensureGuestSession({});

  const first = await service.createBooking({
    offerId: "offer-1",
    restaurantId: "rest-1",
    request: REQUEST,
    guestToken: session.guestToken,
    idempotencyKey: "same-tap"
  });
  const second = await service.createBooking({
    offerId: "offer-1",
    restaurantId: "rest-1",
    request: REQUEST,
    guestToken: session.guestToken,
    idempotencyKey: "same-tap"
  });

  assert.equal(second.reused, true);
  assert.equal(second.booking.id, first.booking.id);
  assert.equal(db.__all("goBookings/").length, 1);
  // Und der Platz wurde nur einmal belegt.
  const day = db.__all("restaurants/rest-1/goCapacity/").find((entry) => entry.path.includes("day__"));
  assert.equal(day.data.groups, 1);
});

test("the last free seat goes to exactly one of two guests", async () => {
  const { db, service } = setup();
  const first = await service.ensureGuestSession({});
  const second = await service.ensureGuestSession({});
  assert.notEqual(first.guestToken, second.guestToken);

  const [firstResult, secondResult] = await Promise.allSettled([
    service.createBooking({
      offerId: "offer-1",
      restaurantId: "rest-1",
      request: REQUEST,
      guestToken: first.guestToken,
      idempotencyKey: "a"
    }),
    service.createBooking({
      offerId: "offer-1",
      restaurantId: "rest-1",
      request: REQUEST,
      guestToken: second.guestToken,
      idempotencyKey: "b"
    })
  ]);

  const fulfilled = [firstResult, secondResult].filter((entry) => entry.status === "fulfilled");
  const rejected = [firstResult, secondResult].filter((entry) => entry.status === "rejected");
  assert.equal(fulfilled.length, 1);
  assert.equal(rejected.length, 1);
  // Der zweite bekommt kein technisches Rauschen, sondern den einen Satz, der
  // stimmt - und daran haengt im Aufrufer die Liste der Alternativen.
  assert.equal(rejected[0].reason.message, "Kjo ofertë sapo u plotësua.");
  assert.equal(rejected[0].reason.details.soldOut, true);
  assert.equal(db.__all("goBookings/").length, 1);
});

test("two guests in the same network are independent", async () => {
  // Es gibt keine IP im Spiel: Zwei Sitzungen sind zwei Sitzungen, egal
  // woher sie kommen. Bei zwei freien Plaetzen bekommen beide einen.
  const { db, service } = setup({ offer: { limits: { dailyGroups: 2 } } });
  const first = await service.ensureGuestSession({});
  const second = await service.ensureGuestSession({});
  await service.createBooking({
    offerId: "offer-1", restaurantId: "rest-1", request: REQUEST, guestToken: first.guestToken, idempotencyKey: "a"
  });
  await service.createBooking({
    offerId: "offer-1", restaurantId: "rest-1", request: REQUEST, guestToken: second.guestToken, idempotencyKey: "b"
  });
  assert.equal(db.__all("goBookings/").length, 2);
});

test("one guest holds one open offer per venue, and no more", async () => {
  // Regel 6. Zwei Oferten desselben Lokals waeren derselbe Besuch zweimal
  // abgerechnet - und zwar auch dann, wenn es zwei verschiedene Angebote sind.
  const { service } = setup({
    offer: { limits: {} },
    extra: {
      "restaurants/rest-1/goOffers/offer-1b": { ...OFFER, limits: {}, benefitLabel: "-10%" }
    }
  });
  const session = await service.ensureGuestSession({});
  await service.createBooking({
    offerId: "offer-1", restaurantId: "rest-1", request: REQUEST, guestToken: session.guestToken, idempotencyKey: "a"
  });
  await assert.rejects(
    () => service.createBooking({
      offerId: "offer-1b", restaurantId: "rest-1", request: REQUEST, guestToken: session.guestToken, idempotencyKey: "b"
    }),
    (error) => error.code === "already-exists" && error.details.reason === "restaurant_locked"
  );
});

test("after 24 hours the venue is free for that guest again", async () => {
  // Punkt 15. Es gibt keinen Cronjob: Im Dokument steht bis in alle Ewigkeit
  // "accepted". Nur die Frist entscheidet.
  //
  // Das Angebot gilt hier "Gjithmonë" - sonst pruefte der Test nebenbei die
  // Oeffnungszeiten mit, und 25 Stunden spaeter ist ein anderer Wochentag.
  const { db, service } = setup({ offer: { limits: {}, schedule: { mode: "always" } } });
  const session = await service.ensureGuestSession({});
  await service.createBooking({
    offerId: "offer-1", restaurantId: "rest-1", request: REQUEST, guestToken: session.guestToken, idempotencyKey: "a"
  });
  const nextDay = createGoService({ db, now: () => THURSDAY_16H + 25 * HOUR });
  const again = await nextDay.createBooking({
    offerId: "offer-1", restaurantId: "rest-1", request: REQUEST, guestToken: session.guestToken, idempotencyKey: "b"
  });
  assert.equal(again.booking.status, "accepted");
  assert.equal(db.__all("goBookings/").length, 2);
});

test("the locked venue disappears from the guest's next search", async () => {
  // Punkt 14: nicht das Angebot verschwindet, sondern das ganze Lokal - sonst
  // stuende dort eine Karte, die der Gast antippen kann und die ihn abweist.
  const { service } = setup({
    offer: { limits: {} },
    extra: {
      "restaurants/rest-2": { ...RESTAURANT, name: "Soma" },
      "restaurants/rest-2/goSettings/config": { enabled: true },
      "restaurants/rest-2/goOffers/offer-2": { ...OFFER, restaurantId: "rest-2", limits: {} }
    }
  });
  const session = await service.ensureGuestSession({});
  assert.equal((await service.search({ request: REQUEST, guestToken: session.guestToken })).results.length, 2);

  await service.createBooking({
    offerId: "offer-1", restaurantId: "rest-1", request: REQUEST, guestToken: session.guestToken, idempotencyKey: "a"
  });
  const after = await service.search({ request: REQUEST, guestToken: session.guestToken });
  assert.equal(after.results.length, 1);
  assert.equal(after.results[0].restaurantId, "rest-2");
});

test("four different venues at the same time are allowed", async () => {
  // Regel 7. Wer abends losgeht, darf sich aussuchen, wo er landet.
  const { db, service } = setup({
    offer: { limits: {} },
    extra: {
      "restaurants/rest-2": { ...RESTAURANT, name: "Prince Coffee" },
      "restaurants/rest-2/goSettings/config": { enabled: true },
      "restaurants/rest-2/goOffers/offer-2": { ...OFFER, restaurantId: "rest-2", limits: {} }
    }
  });
  const session = await service.ensureGuestSession({});
  await service.createBooking({
    offerId: "offer-1", restaurantId: "rest-1", request: REQUEST, guestToken: session.guestToken, idempotencyKey: "a"
  });
  await service.createBooking({
    offerId: "offer-2", restaurantId: "rest-2", request: REQUEST, guestToken: session.guestToken, idempotencyKey: "b"
  });
  assert.equal(db.__all("goBookings/").length, 2);
  // Es gibt nur noch Tageszaehler - keine Scheiben zu einer halben Stunde.
  const slots = db.__all("restaurants/rest-1/goCapacity/").filter((entry) => entry.path.includes("slot__"));
  assert.equal(slots.length, 0);
});

test("what the guest accepted stays, even after the venue lowers the deal", async () => {
  const { db, service } = setup();
  const session = await service.ensureGuestSession({});
  const booked = await service.createBooking({
    offerId: "offer-1",
    restaurantId: "rest-1",
    request: REQUEST,
    guestToken: session.guestToken,
    idempotencyKey: "a"
  });

  // Das Lokal stellt danach auf -10 % um.
  await db.collection("restaurants").doc("rest-1").collection("goOffers").doc("offer-1")
    .set({ benefit: { kind: "percent", percent: 10 }, benefitLabel: "-10%" }, { merge: true });

  const reopened = await service.getBooking({ bookingToken: booked.bookingToken });
  assert.equal(reopened.booking.benefitLabel, "-20%");
  assert.equal(reopened.booking.snapshot.benefit.percent, 20);
});

test("the guest is never turned away by a stopwatch", async () => {
  // Frueher stand hier "35 Minuten zu spaet". Es gibt keine erwartete Ankunft
  // mehr, gegen die man zu spaet sein koennte - die einzige Grenze sind die 24
  // Stunden ab der Annahme, und danach zwei fuer das Lokal.
  const { db, service } = setup();
  const session = await service.ensureGuestSession({});
  const activated = await acceptAndActivate(service, { guestToken: session.guestToken });

  // Zwanzig Stunden spaeter: alles gilt noch.
  const later = createGoService({ db, now: () => THURSDAY_16H + 20 * HOUR });
  const finalized = await later.finalizeBooking({
    shortCode: activated.shortCode, restaurantId: "rest-1", partySize: 4
  });
  assert.equal(finalized.booking.status, "finalized");
});

test("an activated offer survives past the 24 hours, but not past 26", async () => {
  const { db, service } = setup();
  const session = await service.ensureGuestSession({});
  const activated = await acceptAndActivate(service, { guestToken: session.guestToken });

  // Der Gast hat in der letzten Minute gewischt; das Lokal hat noch zwei
  // Stunden. Nach 25 Stunden geht es also noch.
  const inGrace = createGoService({ db, now: () => THURSDAY_16H + 25 * HOUR });
  const ok = await inGrace.finalizeBooking({
    shortCode: activated.shortCode, restaurantId: "rest-1", partySize: 4
  });
  assert.equal(ok.booking.status, "finalized");
});

test("after the grace the code is dead, and the reason is recorded", async () => {
  const { db, service } = setup();
  const session = await service.ensureGuestSession({});
  const activated = await acceptAndActivate(service, { guestToken: session.guestToken });

  const tooLate = createGoService({ db, now: () => THURSDAY_16H + 27 * HOUR });
  await assert.rejects(
    () => tooLate.finalizeBooking({ shortCode: activated.shortCode, restaurantId: "rest-1", partySize: 4 }),
    (error) => error.message === "Oferta ka skaduar."
  );
  const stored = db.__read(`goBookings/${activated.booking.id}`);
  assert.equal(stored.status, "expired");
  // Der Unterschied ist fuer Heart die halbe Auskunft: Dieser Gast stand im
  // Lokal, er wurde nur nicht finalisiert.
  assert.equal(stored.expiredReason, "expired_not_finalized");
  assert.equal(stored.commission, null);
});

test("the venue finalizes with the short code, a stranger may not", async () => {
  const { service } = setup();
  const session = await service.ensureGuestSession({});
  const activated = await acceptAndActivate(service, { guestToken: session.guestToken });

  // Der Code eines anderen Lokals findet nichts - er ist keine Kennung ueber
  // Lokale hinweg (Regel 10).
  await assert.rejects(
    () => service.finalizeBooking({ shortCode: activated.shortCode, restaurantId: "rest-9", partySize: 4 }),
    (error) => error.code === "not-found"
  );

  const done = await service.finalizeBooking({
    shortCode: activated.shortCode, restaurantId: "rest-1", partySize: 4
  });
  assert.equal(done.booking.status, "finalized");
});

test("a code that was never swiped is refused with an honest sentence", async () => {
  // Der Gast steht daneben und muss noch wischen. Ein "nicht gefunden"
  // schickte den Kellner auf Fehlersuche bei sich selbst.
  const { db, service } = setup();
  const session = await service.ensureGuestSession({});
  await service.createBooking({
    offerId: "offer-1", restaurantId: "rest-1", request: REQUEST,
    guestToken: session.guestToken, idempotencyKey: "a"
  });
  const code = db.__all("goBookingCodes/")[0].data.shortCode;
  await assert.rejects(
    () => service.finalizeBooking({ shortCode: code, restaurantId: "rest-1", partySize: 4 }),
    (error) => error.details.needsActivation === true
  );
});

test("cancelling gives the seat back", async () => {
  const db = createFakeFirestore({
    "restaurants/rest-1": RESTAURANT,
    "restaurants/rest-1/goSettings/config": { enabled: true },
    "restaurants/rest-1/goOffers/offer-1": OFFER
  });
  const service = createGoService({ db, now: () => THURSDAY_16H });
  const session = await service.ensureGuestSession({});
  const booked = await service.createBooking({
    offerId: "offer-1", restaurantId: "rest-1", request: REQUEST, guestToken: session.guestToken, idempotencyKey: "a"
  });

  const dayPath = db.__all("restaurants/rest-1/goCapacity/").find((entry) => entry.path.includes("day__")).path;
  assert.equal(db.__read(dayPath).groups, 1);

  await service.cancelBookingByGuest({
    bookingToken: booked.bookingToken,
    guestToken: session.guestToken
  });
  assert.equal(db.__read(dayPath).groups, 0);
  assert.equal(db.__read(`goBookings/${booked.booking.id}`).status, "cancelled");

  // Und der Platz ist wirklich wieder zu haben.
  const other = await service.ensureGuestSession({});
  const next = await service.createBooking({
    offerId: "offer-1", restaurantId: "rest-1", request: REQUEST, guestToken: other.guestToken, idempotencyKey: "b"
  });
  assert.equal(next.booking.status, "accepted");
});

test("an expired offer does NOT give the seat back", async () => {
  // Eine abgesagte Oferta gibt ihren Platz sofort zurueck - eine abgelaufene
  // nicht. Sie hat dem Lokal den Platz den ganzen Tag blockiert, und ein Wirt
  // mit einer Tagesgrenze von zwanzig will nicht am Abend feststellen, dass er
  // dreissig Karten verteilt hat.
  const { db, service } = setup();
  const session = await service.ensureGuestSession({});
  const booked = await service.createBooking({
    offerId: "offer-1", restaurantId: "rest-1", request: REQUEST,
    guestToken: session.guestToken, idempotencyKey: "a"
  });
  const dayPath = db.__all("restaurants/rest-1/goCapacity/").find((entry) => entry.path.includes("day__")).path;
  assert.equal(db.__read(dayPath).groups, 1);

  const nextDay = createGoService({ db, now: () => THURSDAY_16H + 25 * HOUR });
  await nextDay.getBooking({ bookingToken: booked.bookingToken });
  assert.equal(db.__read(`goBookings/${booked.booking.id}`).status, "expired");
  assert.equal(db.__read(dayPath).groups, 1);
});

test("after the swipe there is no ordinary cancellation", async () => {
  // Punkt 23: Sonst gaebe es das Wettrennen zwischen dem Kellner, der den Code
  // eintippt, und dem Gast, der im selben Augenblick storniert.
  const { service } = setup();
  const session = await service.ensureGuestSession({});
  const activated = await acceptAndActivate(service, { guestToken: session.guestToken });
  await assert.rejects(
    () => service.cancelBookingByGuest({
      bookingToken: activated.bookingToken, guestToken: session.guestToken
    }),
    (error) => error.code === "failed-precondition"
  );
});

test("a paused venue takes no new bookings but keeps the existing ones", async () => {
  const db = createFakeFirestore({
    "restaurants/rest-1": RESTAURANT,
    "restaurants/rest-1/goSettings/config": { enabled: true },
    "restaurants/rest-1/goOffers/offer-1": { ...OFFER, limits: {} }
  });
  const service = createGoService({ db, now: () => THURSDAY_16H });
  const session = await service.ensureGuestSession({});
  const booked = await service.createBooking({
    offerId: "offer-1", restaurantId: "rest-1", request: REQUEST, guestToken: session.guestToken, idempotencyKey: "a"
  });

  await db.collection("restaurants").doc("rest-1").collection("goSettings").doc("config")
    .set({ pausedUntil: THURSDAY_16H + 60 * 60 * 1000 }, { merge: true });

  const other = await service.ensureGuestSession({});
  await assert.rejects(
    () => service.createBooking({
      offerId: "offer-1", restaurantId: "rest-1", request: REQUEST, guestToken: other.guestToken, idempotencyKey: "b"
    }),
    (error) => error.code === "failed-precondition"
  );
  // Die bestehende Buchung bleibt gueltig (Punkt 62).
  const existing = await service.getBooking({ bookingToken: booked.bookingToken });
  assert.equal(existing.booking.status, "accepted");
  // Und die Suche zeigt das Lokal nicht mehr an.
  const found = await service.search({ request: REQUEST });
  assert.equal(found.results.length, 0);
});

test("the venue may mark a booking seen - and nothing else", async () => {
  const db = createFakeFirestore({
    "restaurants/rest-1": RESTAURANT,
    "restaurants/rest-1/goSettings/config": { enabled: true },
    "restaurants/rest-1/goOffers/offer-1": OFFER
  });
  const service = createGoService({ db, now: () => THURSDAY_16H });
  const session = await service.ensureGuestSession({});
  const booked = await service.createBooking({
    offerId: "offer-1", restaurantId: "rest-1", request: REQUEST, guestToken: session.guestToken, idempotencyKey: "a"
  });
  assert.equal(db.__read(`goBookings/${booked.booking.id}`).businessSeenAt, null);

  await service.businessUpdateBooking({ bookingId: booked.booking.id, restaurantId: "rest-1", action: "seen" });
  assert.ok(db.__read(`goBookings/${booked.booking.id}`).businessSeenAt);

  // Punkt 25: Das Lokal entscheidet nicht darueber, ob Mnyra Geld bekommt.
  // Absagen, abschliessen und "nicht gekommen" gibt es nicht mehr - wer nicht
  // finalisiert wird, laeuft von selbst aus.
  for (const action of ["cancel", "complete", "notArrived", "finalize", "checkin"]) {
    await assert.rejects(
      () => service.businessUpdateBooking({
        bookingId: booked.booking.id, restaurantId: "rest-1", action, reason: "mbyllur"
      }),
      (error) => error.code === "invalid-argument",
      `${action} darf es nicht mehr geben`
    );
  }
  assert.equal(db.__read(`goBookings/${booked.booking.id}`).status, "accepted");

  // Ein fremdes Lokal fasst die Buchung nicht an.
  await assert.rejects(
    () => service.businessUpdateBooking({
      bookingId: booked.booking.id, restaurantId: "rest-9", action: "seen"
    }),
    (error) => error.code === "permission-denied"
  );
});

test("a sold out offer is answered with alternatives, not with a dead end", async () => {
  const db = createFakeFirestore({
    "restaurants/rest-1": RESTAURANT,
    "restaurants/rest-1/goSettings/config": { enabled: true },
    "restaurants/rest-1/goOffers/offer-1": { ...OFFER, limits: { dailyGroups: 1 } },
    "restaurants/rest-2": { ...RESTAURANT, name: "Bro Pizza" },
    "restaurants/rest-2/goSettings/config": { enabled: true },
    "restaurants/rest-2/goOffers/offer-2": { ...OFFER, restaurantId: "rest-2", limits: {} }
  });
  const service = createGoService({ db, now: () => THURSDAY_16H });
  const first = await service.ensureGuestSession({});
  await service.createBooking({
    offerId: "offer-1", restaurantId: "rest-1", request: REQUEST, guestToken: first.guestToken, idempotencyKey: "a"
  });

  const alternatives = await service.findAlternatives({ request: REQUEST, excludeRestaurantId: "rest-1" });
  assert.equal(alternatives.length, 1);
  assert.equal(alternatives[0].businessName, "Bro Pizza");
});

test("the search never returns an offer the booking step would reject", async () => {
  // Das ist die Eigenschaft, wegen der Suche und Buchung dieselbe Domaene
  // benutzen: Was in der Liste steht, ist buchbar - und was nicht buchbar
  // ist, steht nicht in der Liste.
  const db = createFakeFirestore({
    "restaurants/rest-1": RESTAURANT,
    "restaurants/rest-1/goSettings/config": { enabled: true },
    "restaurants/rest-1/goOffers/offer-1": { ...OFFER, limits: { dailyGroups: 1 } }
  });
  const service = createGoService({ db, now: () => THURSDAY_16H });
  const first = await service.ensureGuestSession({});
  await service.createBooking({
    offerId: "offer-1", restaurantId: "rest-1", request: REQUEST, guestToken: first.guestToken, idempotencyKey: "a"
  });
  const found = await service.search({ request: REQUEST });
  assert.equal(found.results.length, 0);
});

test("an offer saved without a cityKey is still found", async () => {
  // Der Schluessel am Angebot ist eine Abkuerzung fuer die Abfrage, keine
  // Bedingung. Angebote, die vor dieser Abkuerzung gespeichert wurden, haben
  // das Feld gar nicht - und ein fehlendes Feld faellt aus jeder
  // Gleichheitsabfrage heraus. Genau daran hat GO nichts mehr gefunden.
  const { cityKey, ...offerWithoutCityKey } = OFFER;
  assert.equal(cityKey, "prishtina");
  const db = createFakeFirestore({
    "restaurants/rest-1": RESTAURANT,
    "restaurants/rest-1/goSettings/config": { enabled: true },
    "restaurants/rest-1/goOffers/offer-1": offerWithoutCityKey
  });
  const service = createGoService({ db, now: () => THURSDAY_16H });

  const found = await service.search({ request: REQUEST });
  assert.equal(found.results.length, 1);
  assert.equal(found.results[0].businessName, "Casa Rita");

  // Und der Gast, der die Stadt albanisch gewaehlt hat, findet es auch.
  const albanian = await service.search({ request: { ...REQUEST, city: "Prishtinë" } });
  assert.equal(albanian.results.length, 1);
});

test("the fallback widens the query, it does not widen the answer", async () => {
  // Ohne Schluessel am Angebot wird ohne Einengung nachgefragt - aber das
  // Profil des Lokals entscheidet weiterhin. Ein Gast in Prizren bekommt
  // deshalb kein Lokal aus Prishtina zu sehen.
  const { cityKey: _cityKey, ...offerWithoutCityKey } = OFFER;
  const db = createFakeFirestore({
    "restaurants/rest-1": RESTAURANT,
    "restaurants/rest-1/goSettings/config": { enabled: true },
    "restaurants/rest-1/goOffers/offer-1": offerWithoutCityKey
  });
  const service = createGoService({ db, now: () => THURSDAY_16H });
  const found = await service.search({ request: { ...REQUEST, city: "Prizren" } });
  assert.equal(found.results.length, 0);
});

test("a city with offers is answered without the second query", async () => {
  // Ist der Schluessel da, bleibt es bei einer Abfrage - die Einengung ist
  // der Normalfall und der Grund, warum es den Index gibt.
  const db = createFakeFirestore({
    "restaurants/rest-1": RESTAURANT,
    "restaurants/rest-1/goSettings/config": { enabled: true },
    "restaurants/rest-1/goOffers/offer-1": OFFER
  });
  const service = createGoService({ db, now: () => THURSDAY_16H });
  const found = await service.search({ request: { ...REQUEST, city: "Prishtinë" } });
  assert.equal(found.results.length, 1);
});

// ===========================================================================
// Was das Lokal von seinen Angeboten sieht.
//
// Zwei Zahlen pro Tag: wie oft eine Oferta vorgezeigt wurde und wie oft
// zugegriffen wurde. Sie stehen nebeneinander, weil erst das Verhaeltnis
// etwas sagt - eine Reichweite ohne Annahme ist eine Oferta, die niemanden
// ueberzeugt, und eine Annahme ohne Reichweite gibt es nicht.
// ===========================================================================

test("a search counts what the guest was really shown, per day of the venue", async () => {
  const { db, service } = setup();
  await service.search({ request: REQUEST });

  // 13.08.2026 in Prishtina - der Tag des Lokals, nicht der von Greenwich.
  await settle();
  const stats = db.__read("restaurants/rest-1/goStats/2026-08-13");
  assert.equal(stats.impressions, 1);
  assert.equal(stats.restaurantId, "rest-1");
  assert.equal(stats.dayKey, "2026-08-13");

  // Zweimal gesucht, zweimal vorgezeigt: gezaehlt wird jede Anzeige.
  await service.search({ request: REQUEST });
  await settle();
  assert.equal(db.__read("restaurants/rest-1/goStats/2026-08-13").impressions, 2);
});

test("an offer that did not pass the check was shown to nobody", async () => {
  // Der Gast sucht in Prizren, das Lokal steht in Prishtina. Es stand nicht in
  // den Ergebnissen - also hat es auch niemand gesehen.
  const { db, service } = setup();
  const found = await service.search({ request: { ...REQUEST, city: "Prizren" } });
  assert.equal(found.results.length, 0);
  await settle();
  assert.equal(db.__read("restaurants/rest-1/goStats/2026-08-13"), undefined);
});

test("accepting counts on the day of the tap, not on the day of the arrival", async () => {
  const { db, service } = setup();
  const session = await service.ensureGuestSession({});
  await service.createBooking({
    offerId: "offer-1",
    restaurantId: "rest-1",
    request: REQUEST,
    guestToken: session.guestToken,
    idempotencyKey: "tap-1"
  });
  await settle();
  assert.equal(db.__read("restaurants/rest-1/goStats/2026-08-13").accepted, 1);
});

test("a double tap is one acceptance, because it is one booking", async () => {
  const { db, service } = setup();
  const session = await service.ensureGuestSession({});
  for (const attempt of ["same-tap", "same-tap"]) {
    await service.createBooking({
      offerId: "offer-1",
      restaurantId: "rest-1",
      request: REQUEST,
      guestToken: session.guestToken,
      idempotencyKey: attempt
    });
  }
  await settle();
  assert.equal(db.__read("restaurants/rest-1/goStats/2026-08-13").accepted, 1);
});

test("a broken counter never breaks a search or a booking", async () => {
  // Zaehlen ist beilaeufig (Punkt 115). Faellt der Zaehler aus, faellt die
  // Zahl aus - nicht die Antwort an den Gast.
  const { db, service } = setup();
  const service2 = createGoService({
    db,
    now: () => THURSDAY_16H,
    increment: () => { throw new Error("counter is down"); }
  });
  const found = await service2.search({ request: REQUEST });
  assert.equal(found.results.length, 1);
  const session = await service.ensureGuestSession({});
  const booked = await service2.createBooking({
    offerId: "offer-1",
    restaurantId: "rest-1",
    request: REQUEST,
    guestToken: session.guestToken,
    idempotencyKey: "tap-1"
  });
  assert.equal(booked.booking.status, "accepted");
});

// ===========================================================================
// Der Kurzcode und die Bestaetigung.
//
// An der Bestaetigung haengt Geld. Sie soll nur gelingen, wenn ein Gast
// davorsteht und seinen Code zeigt. Das Lokal darf einen Code deshalb PRUEFEN,
// aber nicht NACHSCHLAGEN - sonst koennte es ohne Gast bestaetigen und die
// Abrechnung waere wertlos.
// ===========================================================================

test("the code is not in the booking the venue can read", async () => {
  const { db, service } = setup();
  const session = await service.ensureGuestSession({});
  const activated = await acceptAndActivate(service, { guestToken: session.guestToken });
  assert.equal(activated.shortCode.length, 5);

  // Das Dokument, das dem Lokal offensteht, traegt den Code nicht.
  const stored = db.__all("goBookings/")[0].data;
  assert.equal(stored.shortCode, undefined);
  assert.equal(JSON.stringify(stored).includes(activated.shortCode), false);

  // Er liegt in der Sammlung, die kein Browser lesen darf.
  const code = db.__read(`goBookingCodes/${activated.booking.id}`);
  assert.equal(code.shortCode, activated.shortCode);
  assert.equal(code.restaurantId, "rest-1");
});

test("the guest gets the code back through the token - once activated", async () => {
  // Sein Link ist der einzige Weg zurueck zu seiner Oferta - im
  // Inkognito-Fenster ist er der einzige ueberhaupt. Vor dem Wischen gibt aber
  // auch er den Code nicht her.
  const { service } = setup();
  const session = await service.ensureGuestSession({});
  const activated = await acceptAndActivate(service, { guestToken: session.guestToken });
  const reopened = await service.getBooking({ bookingToken: activated.bookingToken });
  assert.equal(reopened.booking.shortCode, activated.shortCode);
});

test("a double tap returns the booking that already exists, still without a code", async () => {
  const { service } = setup();
  const session = await service.ensureGuestSession({});
  const first = await service.createBooking({
    offerId: "offer-1", restaurantId: "rest-1", request: REQUEST, guestToken: session.guestToken, idempotencyKey: "same"
  });
  const second = await service.createBooking({
    offerId: "offer-1", restaurantId: "rest-1", request: REQUEST, guestToken: session.guestToken, idempotencyKey: "same"
  });
  assert.equal(second.reused, true);
  assert.equal(second.booking.id, first.booking.id);
  assert.equal(second.booking.shortCode, "");
});

test("looking a code up changes nothing, and never gives the code back", async () => {
  const { service } = setup();
  const session = await service.ensureGuestSession({});
  const activated = await acceptAndActivate(service, { guestToken: session.guestToken });
  const found = await service.findBookingByCode({
    shortCode: activated.shortCode,
    restaurantId: "rest-1"
  });
  assert.equal(found.booking.id, activated.booking.id);
  assert.equal(found.booking.status, "activated");
  // Das Nachschlagen finalisiert nicht, und der Code geht nicht zurueck: Das
  // Lokal hat ihn gerade selbst getippt (Regel 9).
  assert.equal(found.booking.shortCode, "");
});

test("a wrong code finds nothing, and neither does a code of another venue", async () => {
  const { service } = setup();
  const session = await service.ensureGuestSession({});
  const activated = await acceptAndActivate(service, { guestToken: session.guestToken });
  await assert.rejects(
    () => service.findBookingByCode({ shortCode: "ZZZZZ", restaurantId: "rest-1" }),
    (error) => error.code === "not-found"
  );
  await assert.rejects(
    () => service.findBookingByCode({ shortCode: activated.shortCode, restaurantId: "rest-9" }),
    (error) => error.code === "not-found"
  );
});

test("the venue cannot finalize through the booking id, only through the code", async () => {
  // Das ist der Kern: Wer die Liste sieht, sieht Kennungen. Wenn eine Kennung
  // zum Finalisieren reichte, waere der Code Zierrat.
  const { service } = setup();
  const session = await service.ensureGuestSession({});
  const activated = await acceptAndActivate(service, { guestToken: session.guestToken });
  await assert.rejects(
    () => service.businessUpdateBooking({
      bookingId: activated.booking.id,
      restaurantId: "rest-1",
      action: "finalize"
    }),
    (error) => error.code === "invalid-argument"
  );
  // Mit dem Code geht es.
  const done = await service.finalizeBooking({
    shortCode: activated.shortCode, restaurantId: "rest-1", partySize: 4
  });
  assert.equal(done.booking.status, "finalized");
});

test("a finalized offer cannot be redeemed a second time", async () => {
  // Regel 4. Der zweite Kellner, der denselben Code tippt, bekommt eine ruhige
  // Auskunft - und keine zweite Rechnung.
  const { db, service } = setup();
  const session = await service.ensureGuestSession({});
  const activated = await acceptAndActivate(service, { guestToken: session.guestToken });
  await service.finalizeBooking({ shortCode: activated.shortCode, restaurantId: "rest-1", partySize: 4 });

  await assert.rejects(
    () => service.finalizeBooking({ shortCode: activated.shortCode, restaurantId: "rest-1", partySize: 4 }),
    (error) => error.details.alreadyFinalized === true
  );
  await assert.rejects(
    () => service.findBookingByCode({ shortCode: activated.shortCode, restaurantId: "rest-1" }),
    (error) => error.details.alreadyFinalized === true
  );

  // Regel 5: eine Buchung, eine Gebuehr.
  const stored = db.__read(`goBookings/${activated.booking.id}`);
  assert.equal(stored.commission.amountCents, 150);
  // Der Code traegt jetzt seinen Vermerk.
  assert.ok(db.__read(`goBookingCodes/${activated.booking.id}`).usedAt);
});

test("a cancelled offer is not found by its code at all", async () => {
  const { db, service } = setup();
  const session = await service.ensureGuestSession({});
  const booked = await service.createBooking({
    offerId: "offer-1", restaurantId: "rest-1", request: REQUEST, guestToken: session.guestToken, idempotencyKey: "a"
  });
  const code = db.__all("goBookingCodes/")[0].data.shortCode;
  await service.cancelBookingByGuest({ bookingToken: booked.bookingToken });
  await assert.rejects(
    () => service.findBookingByCode({ shortCode: code, restaurantId: "rest-1" }),
    (error) => error.code === "failed-precondition"
  );
});

test("the waiter corrects the party size, within the allowed range", async () => {
  const { db, service } = setup();
  const session = await service.ensureGuestSession({});
  const activated = await acceptAndActivate(service, { guestToken: session.guestToken });
  assert.equal(activated.booking.partySizeRequested, 4);

  const done = await service.finalizeBooking({
    shortCode: activated.shortCode,
    restaurantId: "rest-1",
    partySize: 3
  });
  assert.equal(done.booking.partySizeVerified, 3);
  // Die angefragte Zahl bleibt daneben stehen - Heart soll sehen koennen, wie
  // weit Schaetzung und Wirklichkeit auseinanderliegen.
  const stored = db.__read(`goBookings/${activated.booking.id}`);
  assert.equal(stored.partySizeRequested, 4);
  assert.equal(stored.partySizeVerified, 3);
});

test("a nonsense party size leaves the number of the guest standing", async () => {
  for (const nonsense of [0, -2, 99, "viele"]) {
    const { service } = setup();
    const session = await service.ensureGuestSession({});
    const activated = await acceptAndActivate(service, { guestToken: session.guestToken });
    const done = await service.finalizeBooking({
      shortCode: activated.shortCode,
      restaurantId: "rest-1",
      partySize: nonsense
    });
    assert.equal(done.booking.partySizeVerified, 4, String(nonsense));
  }
});

// ===========================================================================
// Die Provision.
//
// Sie entsteht bei der Finalisierung und nirgends sonst. Eine nicht
// finalisierte Oferta kostet das Lokal nichts - auch eine aktivierte nicht.
// Der Wisch allein ist kein Besuch.
// ===========================================================================

test("an unfinalized booking costs the venue nothing at all", async () => {
  const { db, service } = setup();
  const session = await service.ensureGuestSession({});
  const activated = await acceptAndActivate(service, { guestToken: session.guestToken });
  const stored = db.__read(`goBookings/${activated.booking.id}`);
  // "Noch nichts entstanden" - nicht "kostet null".
  assert.equal(stored.commission, null);
  // Aber die Preisliste steht schon fest.
  assert.equal(stored.commissionVersion, "2026-08");
  await settle();
  assert.equal(db.__read("restaurants/rest-1/goStats/2026-08-13")?.commissionCents, undefined);
});

test("finalizing freezes the item on the booking, in one go with the status", async () => {
  const { db, service } = setup();
  const session = await service.ensureGuestSession({});
  const activated = await acceptAndActivate(service, { guestToken: session.guestToken });
  await service.finalizeBooking({ shortCode: activated.shortCode, restaurantId: "rest-1", partySize: 4 });

  const stored = db.__read(`goBookings/${activated.booking.id}`);
  assert.equal(stored.status, "finalized");
  assert.ok(stored.finalizedAt);
  // Vier Personen - 1,50 Euro.
  assert.equal(stored.commission.amountCents, 150);
  assert.equal(stored.commission.partySize, 4);
  assert.equal(stored.commission.currency, "EUR");
  assert.equal(stored.commission.version, "2026-08");
  assert.equal(stored.commission.status, "pending");
  assert.ok(stored.commission.confirmedAt);
});

test("the corrected party size is what gets billed", async () => {
  // Der Gast sagte vier, am Tisch sitzen drei. Gerechnet wird mit drei.
  const { db, service } = setup();
  const session = await service.ensureGuestSession({});
  const activated = await acceptAndActivate(service, { guestToken: session.guestToken });
  await service.finalizeBooking({
    shortCode: activated.shortCode, restaurantId: "rest-1", partySize: 3
  });
  const stored = db.__read(`goBookings/${activated.booking.id}`);
  assert.equal(stored.partySizeVerified, 3);
  assert.equal(stored.commission.partySize, 3);
  assert.equal(stored.commission.amountCents, 100);
});

test("a later price list does not rewrite a booking that already exists", async () => {
  // Die Fassung wird beim Zugreifen eingefroren. Steht dort eine, die es
  // nicht mehr gibt, faellt sie auf die geltende zurueck - aber sie wird
  // nicht stillschweigend als die eingefrorene ausgegeben.
  const { db, service } = setup();
  const session = await service.ensureGuestSession({});
  const activated = await acceptAndActivate(service, { guestToken: session.guestToken });
  db.__store.get(`goBookings/${activated.booking.id}`).commissionVersion = "1999-01";
  await service.finalizeBooking({ shortCode: activated.shortCode, restaurantId: "rest-1", partySize: 4 });
  const stored = db.__read(`goBookings/${activated.booking.id}`);
  assert.equal(stored.commission.version, "2026-08");
  assert.equal(stored.commission.amountCents, 150);
});

test("the day of the venue counts the funnel, the visitors and the money", async () => {
  const { db, service } = setup({ offer: { limits: {} } });
  const first = await service.ensureGuestSession({});
  const second = await service.ensureGuestSession({});
  const a = await acceptAndActivate(service, { guestToken: first.guestToken, idempotencyKey: "a" });
  const b = await service.createBooking({
    offerId: "offer-1", restaurantId: "rest-1",
    request: { ...REQUEST, partySize: 2 }, guestToken: second.guestToken, idempotencyKey: "b"
  });
  const bActive = await service.activateBooking({ bookingToken: b.bookingToken, guestToken: second.guestToken });

  await service.finalizeBooking({ shortCode: a.shortCode, restaurantId: "rest-1", partySize: 4 });
  await service.finalizeBooking({ shortCode: bActive.booking.shortCode, restaurantId: "rest-1", partySize: 2 });
  await settle();

  const stats = db.__read("restaurants/rest-1/goStats/2026-08-13");
  assert.equal(stats.accepted, 2);
  assert.equal(stats.activated, 2);
  assert.equal(stats.finalized, 2);
  // Punkt 11: Besucher sind Personen, nicht Oferten.
  assert.equal(stats.visitors, 6);
  // 4 Personen (150) + 2 Personen (50).
  assert.equal(stats.commissionCents, 200);
});

test("finalizing writes the fee into the book, not only onto the booking", async () => {
  // Zwei Stellen, eine Wahrheit und ihr Abbild: Die Buchung sagt, was dieser
  // Gast gekostet hat. Das Buch sagt, was das Lokal insgesamt schuldet - und
  // nur dort kann es bezahlt werden.
  const { db, service } = setup();
  const session = await service.ensureGuestSession({});
  const activated = await acceptAndActivate(service, { guestToken: session.guestToken });
  await service.finalizeBooking({ shortCode: activated.shortCode, restaurantId: "rest-1", partySize: 3 });
  await settle();

  const ledger = db.__all("goLedger/");
  assert.equal(ledger.length, 1);
  const charge = ledger[0].data;
  assert.equal(charge.kind, "charge");
  assert.equal(charge.restaurantId, "rest-1");
  assert.equal(charge.bookingId, activated.booking.id);
  // Drei Personen - 1,00 Euro, nach der eingefrorenen Preisliste.
  assert.equal(charge.amountCents, 100);
  assert.equal(charge.partySize, 3);
  assert.equal(charge.commissionVersion, "2026-08");
  // Und dieselbe Zahl steht an der Buchung: Faellt die Zeile im Buch aus,
  // laesst sie sich von dort wiederherstellen (Regel 20).
  assert.equal(db.__read(`goBookings/${activated.booking.id}`).commission.amountCents, 100);
});

test("an unfinalized booking never reaches the book", async () => {
  const { db, service } = setup();
  const session = await service.ensureGuestSession({});
  await acceptAndActivate(service, { guestToken: session.guestToken });
  await settle();
  assert.equal(db.__all("goLedger/").length, 0);
});

test("finalizing twice does not bill twice", async () => {
  const { db, service } = setup();
  const session = await service.ensureGuestSession({});
  const activated = await acceptAndActivate(service, { guestToken: session.guestToken });
  await service.finalizeBooking({ shortCode: activated.shortCode, restaurantId: "rest-1", partySize: 4 });
  await assert.rejects(
    () => service.finalizeBooking({ shortCode: activated.shortCode, restaurantId: "rest-1", partySize: 4 }),
    (error) => error.details.alreadyFinalized === true
  );
  await settle();

  const stats = db.__read("restaurants/rest-1/goStats/2026-08-13");
  assert.equal(stats.finalized, 1);
  assert.equal(stats.visitors, 4);
  assert.equal(stats.commissionCents, 150);
});

test("a cancelled booking never grew an item to begin with", async () => {
  const { db, service } = setup();
  const session = await service.ensureGuestSession({});
  const booked = await service.createBooking({
    offerId: "offer-1", restaurantId: "rest-1", request: REQUEST, guestToken: session.guestToken, idempotencyKey: "a"
  });
  await service.cancelBookingByGuest({ bookingToken: booked.bookingToken });
  await settle();
  const stored = db.__read(`goBookings/${booked.booking.id}`);
  assert.equal(stored.commission, null);
  assert.equal(db.__read("restaurants/rest-1/goStats/2026-08-13")?.confirmed, undefined);
});

test("cancelling really reaches the database, not just the test double", async () => {
  // Dieser Fall ist einmal durch alle Tests gerutscht und in Produktion jedes
  // Mal abgebrochen: Der Statuswechsel wurde geschrieben, und die Zaehler
  // sollten DANACH gelesen werden. Firestore laesst das nicht zu.
  //
  // Die Attrappe lehnt es seitdem genauso ab. Faellt dieser Test mit
  // "reads before writes", steht in applyStatus wieder ein get() hinter einem
  // set().
  const { db, service } = setup();
  const session = await service.ensureGuestSession({});
  const booked = await service.createBooking({
    offerId: "offer-1", restaurantId: "rest-1", request: REQUEST, guestToken: session.guestToken, idempotencyKey: "a"
  });

  const result = await service.cancelBookingByGuest({ bookingToken: booked.bookingToken });
  assert.equal(result.booking.status, "cancelled");
  // Und der Zustand steht wirklich in der Datenbank, nicht nur im Rueckgabewert.
  assert.equal(db.__read(`goBookings/${booked.booking.id}`).status, "cancelled");
  // Der Platz ist zurueck.
  const day = db.__all("restaurants/rest-1/goCapacity/").find((entry) => entry.path.includes("day__"));
  assert.equal(day.data.groups, 0);
});

test("only accepting and cancelling ever move the day counter", async () => {
  // Der Weg durch applyStatus liest alles, bevor er das erste Mal schreibt -
  // daran ist das Absagen frueher gescheitert. Hier steht die andere Haelfte
  // derselben Regel: Aktivieren und Finalisieren fassen den Zaehler gar nicht
  // an. Der Platz war mit der Annahme belegt und bleibt es.
  const { db, service } = setup({ offer: { limits: {} } });
  const session = await service.ensureGuestSession({});
  const dayPath = () => db.__all("restaurants/rest-1/goCapacity/")
    .find((entry) => entry.path.includes("day__")).path;

  const activated = await acceptAndActivate(service, { guestToken: session.guestToken });
  assert.equal(db.__read(dayPath()).groups, 1);
  assert.equal(db.__read(dayPath()).guests, 4);

  await service.finalizeBooking({ shortCode: activated.shortCode, restaurantId: "rest-1", partySize: 2 });
  // Auch die berichtigte Personenzahl schreibt den Zaehler nicht um: Er zaehlt
  // die Belegung des Tages, nicht die Rechnung.
  assert.equal(db.__read(dayPath()).groups, 1);
  assert.equal(db.__read(dayPath()).guests, 4);
});

// ===========================================================================
// Die Suche: welche Angebote sie ueberhaupt in die Hand nimmt.
// ===========================================================================

// Ein zweites Lokal in derselben Stadt, dessen Angebot KEINEN cityKey traegt.
// So sieht jedes Angebot aus, das gespeichert wurde, bevor der Schluessel
// mitgeschrieben wurde - oder dessen Lokal die Stadt erst spaeter eintrug.
function setupTwoVenues() {
  const db = createFakeFirestore({
    "restaurants/rest-1": RESTAURANT,
    "restaurants/rest-1/goSettings/config": { enabled: true },
    "restaurants/rest-1/goOffers/offer-1": { ...OFFER, cityKey: "prishtina" },
    "restaurants/rest-2": { ...RESTAURANT, name: "Te Zeka", ownerUid: "owner-2" },
    "restaurants/rest-2/goSettings/config": { enabled: true },
    "restaurants/rest-2/goOffers/offer-2": (() => {
      const copy = { ...OFFER, restaurantId: "rest-2", benefitLabel: "-15%" };
      delete copy.cityKey;
      return copy;
    })()
  });
  return { db, service: createGoService({ db, now: () => THURSDAY_16H }) };
}

test("an offer without a cityKey still shows up next to one that has it", async () => {
  const { service } = setupTwoVenues();
  const found = await service.search({ request: REQUEST });
  const names = found.results.map((entry) => entry.businessName).sort();
  // Frueher genuegte ein einziges Angebot MIT Schluessel, um jedes Angebot
  // OHNE Schluessel aus der Antwort zu draengen - auch aus derselben Stadt.
  assert.deepEqual(names, ["Casa Rita", "Te Zeka"]);
});

test("the same is true when no city was given at all", async () => {
  const { service } = setupTwoVenues();
  const found = await service.search({ request: { ...REQUEST, city: "" } });
  assert.equal(found.results.length, 2);
});

test("a venue in another city stays out, cityKey or not", async () => {
  const db = createFakeFirestore({
    "restaurants/rest-1": RESTAURANT,
    "restaurants/rest-1/goSettings/config": { enabled: true },
    "restaurants/rest-1/goOffers/offer-1": { ...OFFER, cityKey: "prishtina" },
    "restaurants/rest-9": { ...RESTAURANT, name: "Prizren Lokal", city: "Prizren" },
    "restaurants/rest-9/goSettings/config": { enabled: true },
    "restaurants/rest-9/goOffers/offer-9": { ...OFFER, restaurantId: "rest-9", cityKey: "prizren" }
  });
  const service = createGoService({ db, now: () => THURSDAY_16H });
  const found = await service.search({ request: REQUEST });
  assert.deepEqual(found.results.map((entry) => entry.businessName), ["Casa Rita"]);
});

test("the search does not read capacity for offers it has already ruled out", async () => {
  // Ein Angebot fuer 2-4 Personen, eine Anfrage fuer 9 - es faellt an der
  // Gruppengroesse. Die Zaehler dafuer zu lesen waere ein Weg zur Datenbank
  // fuer eine Antwort, die schon feststeht.
  const { db, service } = setup();
  await service.search({ request: { ...REQUEST, partySize: 9 } });
  const capacityReads = db.__readCounts.docs;
  const { db: db2, service: service2 } = setup();
  await service2.search({ request: REQUEST });
  assert.ok(
    capacityReads < db2.__readCounts.docs,
    "ein aussortiertes Angebot darf keine Kapazitaet kosten"
  );
});

test("more venues do not mean more round trips", async () => {
  function build(count) {
    const seed = {};
    for (let index = 0; index < count; index += 1) {
      const id = `rest-${index}`;
      seed[`restaurants/${id}`] = { ...RESTAURANT, name: `Lokal ${index}` };
      seed[`restaurants/${id}/goSettings/config`] = { enabled: true };
      seed[`restaurants/${id}/goOffers/offer-a`] = { ...OFFER, restaurantId: id, cityKey: "prishtina" };
    }
    const db = createFakeFirestore(seed);
    return { db, service: createGoService({ db, now: () => THURSDAY_16H }) };
  }

  const small = build(3);
  await small.service.search({ request: REQUEST });
  const large = build(30);
  await large.service.search({ request: REQUEST });

  // Die Zahl der Dokumente waechst mit den Lokalen - die Zahl der WEGE nicht.
  // Genau daraus besteht die Wartezeit des Gastes.
  assert.equal(large.db.__readCounts.queries, small.db.__readCounts.queries);
  assert.equal(large.db.__readCounts.getAll, small.db.__readCounts.getAll);
  assert.ok(large.db.__readCounts.docs > small.db.__readCounts.docs);
});
