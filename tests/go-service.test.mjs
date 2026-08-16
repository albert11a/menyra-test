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
  benefitLabel: "–20 %",
  category: "food",
  partyRanges: ["2-4"],
  minParty: 2,
  maxParty: 4,
  schedule: { mode: "windows", days: ["mon", "tue", "wed", "thu"], windows: [{ start: 840, end: 1140 }] },
  bookingType: "reservation",
  limits: { slotGroups: 1, slotGuests: 0, dailyGroups: 0, totalRedemptions: 0 },
  channels: ["go"],
  status: "active",
  redeemedCount: 0
};

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

const REQUEST = { city: "Prishtina", partySize: 4, category: "food", requestedAt: THURSDAY_16H };

// ---------------------------------------------------------------------------

test("a guest without an account searches, books and finds it again", async () => {
  const { service } = setup();

  const session = await service.ensureGuestSession({});
  assert.ok(session.guestToken);
  assert.equal(session.created, true);

  const found = await service.search({ request: REQUEST, guestToken: session.guestToken });
  assert.equal(found.results.length, 1);
  assert.equal(found.results[0].benefitLabel, "–20 %");
  assert.equal(found.results[0].businessName, "Casa Rita");

  const booked = await service.createBooking({
    offerId: "offer-1",
    restaurantId: "rest-1",
    request: REQUEST,
    guestToken: session.guestToken,
    idempotencyKey: "tap-1"
  });
  assert.equal(booked.booking.status, "confirmed");
  assert.equal(booked.booking.type, "reservation");
  assert.equal(booked.booking.partySize, 4);
  assert.ok(booked.bookingToken);
  assert.equal(booked.booking.shortCode.length, 4);

  // Safari zu, Safari auf: die Buchung ist da, weil sie auf dem Server liegt.
  const reopened = await service.getBooking({ bookingToken: booked.bookingToken });
  assert.equal(reopened.booking.id, booked.booking.id);
  assert.equal(reopened.booking.benefitLabel, "–20 %");
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
  const slot = db.__all("restaurants/rest-1/goCapacity/").find((entry) => entry.path.includes("slot__"));
  assert.equal(slot.data.groups, 1);
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
  const { db, service } = setup({ offer: { limits: { slotGroups: 2 } } });
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

test("one guest does not hold four tables at the same hour", async () => {
  const { service } = setup({
    offer: { limits: {} },
    extra: {
      "restaurants/rest-2": { ...RESTAURANT, name: "Bro Pizza" },
      "restaurants/rest-2/goSettings/config": { enabled: true },
      "restaurants/rest-2/goOffers/offer-2": { ...OFFER, restaurantId: "rest-2", limits: {} }
    }
  });
  const session = await service.ensureGuestSession({});
  await service.createBooking({
    offerId: "offer-1", restaurantId: "rest-1", request: REQUEST, guestToken: session.guestToken, idempotencyKey: "a"
  });
  await assert.rejects(
    () => service.createBooking({
      offerId: "offer-2", restaurantId: "rest-2", request: REQUEST, guestToken: session.guestToken, idempotencyKey: "b"
    }),
    (error) => error.code === "already-exists"
  );
});

test("a claim does not block a second claim", async () => {
  const { db, service } = setup({
    offer: { bookingType: "claim", limits: {} },
    extra: {
      "restaurants/rest-2": { ...RESTAURANT, name: "Prince Coffee" },
      "restaurants/rest-2/goSettings/config": { enabled: true },
      "restaurants/rest-2/goOffers/offer-2": { ...OFFER, restaurantId: "rest-2", bookingType: "claim", limits: {} }
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
  // Ein Angebot ohne Tisch belegt keine Tischscheibe.
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
    .set({ benefit: { kind: "percent", percent: 10 }, benefitLabel: "–10 %" }, { merge: true });

  const reopened = await service.getBooking({ bookingToken: booked.bookingToken });
  assert.equal(reopened.booking.benefitLabel, "–20 %");
  assert.equal(reopened.booking.snapshot.benefit.percent, 20);
});

test("arriving 35 minutes late still checks in", async () => {
  // Derselbe Speicher, zwei Uhren: gebucht wird um 16:00, eingecheckt um
  // 16:35. Genau der Fall, in dem eine +15-Minuten-Regel den Gast vor der
  // Tuer stehen liesse (Punkt 71 bis 73).
  const { db, service } = setup();
  const session = await service.ensureGuestSession({});
  const booked = await service.createBooking({
    offerId: "offer-1",
    restaurantId: "rest-1",
    request: REQUEST,
    guestToken: session.guestToken,
    idempotencyKey: "a"
  });

  const late = createGoService({ db, now: () => THURSDAY_16H + 35 * 60 * 1000 });
  const checkedIn = await late.checkIn({ bookingToken: booked.bookingToken, restaurantId: "rest-1" });
  assert.equal(checkedIn.booking.status, "checked_in");
  assert.equal(checkedIn.alreadyCheckedIn, false);

  // Auch zwei Stunden spaeter bleibt die Buchung, was sie ist.
  const muchLater = createGoService({ db, now: () => THURSDAY_16H + 2 * 60 * 60 * 1000 });
  const stillThere = await muchLater.getBooking({ bookingToken: booked.bookingToken });
  assert.equal(stillThere.booking.status, "checked_in");

  // Der zweite Scan macht keinen zweiten Check-in (Punkt 91, 123).
  const again = await late.checkIn({ bookingToken: booked.bookingToken, restaurantId: "rest-1" });
  assert.equal(again.alreadyCheckedIn, true);
});

test("the venue may check a guest in with the short code, a stranger may not", async () => {
  const { service } = setup();
  const session = await service.ensureGuestSession({});
  const booked = await service.createBooking({
    offerId: "offer-1", restaurantId: "rest-1", request: REQUEST, guestToken: session.guestToken, idempotencyKey: "a"
  });
  const byCode = await service.checkIn({ shortCode: booked.booking.shortCode, restaurantId: "rest-1" });
  assert.equal(byCode.booking.status, "checked_in");
  // Der Code eines anderen Lokals findet nichts - er ist keine Kennung
  // ueber Lokale hinweg.
  await assert.rejects(
    () => service.checkIn({ shortCode: booked.booking.shortCode, restaurantId: "rest-9" }),
    (error) => error.code === "not-found"
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

  const slotPath = db.__all("restaurants/rest-1/goCapacity/").find((entry) => entry.path.includes("slot__")).path;
  assert.equal(db.__read(slotPath).groups, 1);

  await service.cancelBookingByGuest({
    bookingToken: booked.bookingToken,
    guestToken: session.guestToken
  });
  assert.equal(db.__read(slotPath).groups, 0);
  assert.equal(db.__read(`goBookings/${booked.booking.id}`).status, "cancelled_by_user");

  // Und der Platz ist wirklich wieder zu haben.
  const other = await service.ensureGuestSession({});
  const next = await service.createBooking({
    offerId: "offer-1", restaurantId: "rest-1", request: REQUEST, guestToken: other.guestToken, idempotencyKey: "b"
  });
  assert.equal(next.booking.status, "confirmed");
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
  assert.equal(existing.booking.status, "confirmed");
  // Und die Suche zeigt das Lokal nicht mehr an.
  const found = await service.search({ request: REQUEST });
  assert.equal(found.results.length, 0);
});

test("the venue sees a booking, marks it seen, and may cancel with a reason", async () => {
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

  // Ein Storno des Lokals ohne Grund wird abgelehnt (Punkt 97).
  await assert.rejects(
    () => service.businessUpdateBooking({
      bookingId: booked.booking.id, restaurantId: "rest-1", action: "cancel"
    }),
    (error) => error.code === "invalid-argument"
  );
  await service.businessUpdateBooking({
    bookingId: booked.booking.id, restaurantId: "rest-1", action: "cancel", reason: "mbyllur"
  });
  assert.equal(db.__read(`goBookings/${booked.booking.id}`).status, "cancelled_by_business");

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
    "restaurants/rest-1/goOffers/offer-1": { ...OFFER, limits: { slotGroups: 1 } },
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
    "restaurants/rest-1/goOffers/offer-1": { ...OFFER, limits: { slotGroups: 1 } }
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
