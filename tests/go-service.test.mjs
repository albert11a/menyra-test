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
  assert.equal(booked.booking.shortCode.length, 5);

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
  assert.equal(booked.booking.status, "confirmed");
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
  const booked = await service.createBooking({
    offerId: "offer-1", restaurantId: "rest-1", request: REQUEST, guestToken: session.guestToken, idempotencyKey: "a"
  });
  assert.equal(booked.booking.shortCode.length, 5);

  // Das Dokument, das dem Lokal offensteht, traegt den Code nicht.
  const stored = db.__all("goBookings/")[0].data;
  assert.equal(stored.shortCode, undefined);
  assert.equal(JSON.stringify(stored).includes(booked.booking.shortCode), false);

  // Er liegt in der Sammlung, die kein Browser lesen darf.
  const code = db.__read(`goBookingCodes/${booked.booking.id}`);
  assert.equal(code.shortCode, booked.booking.shortCode);
  assert.equal(code.restaurantId, "rest-1");
});

test("the guest gets the code back through the token, always", async () => {
  // Sein Link ist der einzige Weg zurueck zu seiner Oferta - im
  // Inkognito-Fenster ist er der einzige ueberhaupt.
  const { service } = setup();
  const session = await service.ensureGuestSession({});
  const booked = await service.createBooking({
    offerId: "offer-1", restaurantId: "rest-1", request: REQUEST, guestToken: session.guestToken, idempotencyKey: "a"
  });
  const reopened = await service.getBooking({ bookingToken: booked.bookingToken });
  assert.equal(reopened.booking.shortCode, booked.booking.shortCode);
});

test("a double tap returns the code of the booking that already exists", async () => {
  const { service } = setup();
  const session = await service.ensureGuestSession({});
  const first = await service.createBooking({
    offerId: "offer-1", restaurantId: "rest-1", request: REQUEST, guestToken: session.guestToken, idempotencyKey: "same"
  });
  const second = await service.createBooking({
    offerId: "offer-1", restaurantId: "rest-1", request: REQUEST, guestToken: session.guestToken, idempotencyKey: "same"
  });
  assert.equal(second.reused, true);
  assert.equal(second.booking.shortCode, first.booking.shortCode);
});

test("looking a code up changes nothing, and never gives the code back", async () => {
  const { service } = setup();
  const session = await service.ensureGuestSession({});
  const booked = await service.createBooking({
    offerId: "offer-1", restaurantId: "rest-1", request: REQUEST, guestToken: session.guestToken, idempotencyKey: "a"
  });
  const found = await service.findBookingByCode({
    shortCode: booked.booking.shortCode,
    restaurantId: "rest-1"
  });
  assert.equal(found.booking.id, booked.booking.id);
  assert.equal(found.booking.status, "confirmed");
  // Das Nachschlagen loest nicht ein.
  assert.equal(found.booking.shortCode, "");
});

test("a wrong code finds nothing, and neither does a code of another venue", async () => {
  const { service } = setup();
  const session = await service.ensureGuestSession({});
  const booked = await service.createBooking({
    offerId: "offer-1", restaurantId: "rest-1", request: REQUEST, guestToken: session.guestToken, idempotencyKey: "a"
  });
  await assert.rejects(
    () => service.findBookingByCode({ shortCode: "ZZZZ", restaurantId: "rest-1" }),
    (error) => error.code === "not-found"
  );
  await assert.rejects(
    () => service.findBookingByCode({ shortCode: booked.booking.shortCode, restaurantId: "rest-9" }),
    (error) => error.code === "not-found"
  );
});

test("the venue cannot confirm through the booking id, only through the code", async () => {
  // Das ist der Kern: Wer die Liste sieht, sieht Kennungen. Wenn eine Kennung
  // zum Bestaetigen reichte, waere der Code Zierrat.
  const { service } = setup();
  const session = await service.ensureGuestSession({});
  const booked = await service.createBooking({
    offerId: "offer-1", restaurantId: "rest-1", request: REQUEST, guestToken: session.guestToken, idempotencyKey: "a"
  });
  await assert.rejects(
    () => service.businessUpdateBooking({
      bookingId: booked.booking.id,
      restaurantId: "rest-1",
      action: "checkin"
    }),
    (error) => error.code === "invalid-argument"
  );
  // Mit dem Code geht es.
  const done = await service.checkIn({ shortCode: booked.booking.shortCode, restaurantId: "rest-1" });
  assert.equal(done.booking.status, "checked_in");
});

test("a confirmed offer cannot be redeemed a second time", async () => {
  const { service } = setup();
  const session = await service.ensureGuestSession({});
  const booked = await service.createBooking({
    offerId: "offer-1", restaurantId: "rest-1", request: REQUEST, guestToken: session.guestToken, idempotencyKey: "a"
  });
  await service.checkIn({ shortCode: booked.booking.shortCode, restaurantId: "rest-1" });

  // Der Gast sitzt noch am Tisch - der Vorgang laeuft, also findet der Code
  // ihn weiter. Zwei Kellner, die denselben Code tippen, sollen nicht
  // ratlos dastehen (Punkt 91, 123).
  const again = await service.findBookingByCode({
    shortCode: booked.booking.shortCode,
    restaurantId: "rest-1"
  });
  assert.equal(again.booking.status, "checked_in");

  // Aber ein zweites Mal eingeloest wird er nicht - und im Panel traegt eine
  // bestaetigte Buchung deshalb auch keinen Knopf mehr.
  const second = await service.checkIn({ shortCode: booked.booking.shortCode, restaurantId: "rest-1" });
  assert.equal(second.alreadyCheckedIn, true);
});

test("a closed offer is not found by its code at all", async () => {
  const { service } = setup();
  const session = await service.ensureGuestSession({});
  const booked = await service.createBooking({
    offerId: "offer-1", restaurantId: "rest-1", request: REQUEST, guestToken: session.guestToken, idempotencyKey: "a"
  });
  await service.cancelBookingByGuest({ bookingToken: booked.bookingToken });
  await assert.rejects(
    () => service.findBookingByCode({ shortCode: booked.booking.shortCode, restaurantId: "rest-1" }),
    (error) => error.code === "not-found"
  );
});

test("the waiter corrects the party size, within the allowed range", async () => {
  const { service } = setup();
  const session = await service.ensureGuestSession({});
  const booked = await service.createBooking({
    offerId: "offer-1", restaurantId: "rest-1", request: REQUEST, guestToken: session.guestToken, idempotencyKey: "a"
  });
  assert.equal(booked.booking.partySize, 4);
  const done = await service.checkIn({
    shortCode: booked.booking.shortCode,
    restaurantId: "rest-1",
    partySize: 3
  });
  assert.equal(done.booking.partySize, 3);
});

test("a nonsense party size leaves the guest's number standing", async () => {
  for (const nonsense of [0, -2, 99, "viele"]) {
    const { service } = setup();
    const session = await service.ensureGuestSession({});
    const booked = await service.createBooking({
      offerId: "offer-1", restaurantId: "rest-1", request: REQUEST, guestToken: session.guestToken, idempotencyKey: "a"
    });
    const done = await service.checkIn({
      shortCode: booked.booking.shortCode,
      restaurantId: "rest-1",
      partySize: nonsense
    });
    assert.equal(done.booking.partySize, 4, String(nonsense));
  }
});

// ===========================================================================
// Die Provision.
//
// Sie entsteht bei der Bestaetigung und nirgends sonst. Eine unbestaetigte
// Oferta kostet das Lokal nichts - das ist der Grund, warum Bestaetigen fuer
// das Lokal guenstiger ist als Nichtbestaetigen: Die Oferta bleibt sonst
// gueltig und der Gast kann sie wieder einloesen oder weitergeben.
// ===========================================================================

test("an unconfirmed booking costs the venue nothing at all", async () => {
  const { db, service } = setup();
  const session = await service.ensureGuestSession({});
  const booked = await service.createBooking({
    offerId: "offer-1", restaurantId: "rest-1", request: REQUEST, guestToken: session.guestToken, idempotencyKey: "a"
  });
  const stored = db.__read(`goBookings/${booked.booking.id}`);
  // "Noch nichts entstanden" - nicht "kostet null".
  assert.equal(stored.commission, null);
  // Aber die Preisliste steht schon fest.
  assert.equal(stored.commissionVersion, "2026-08");
  await settle();
  assert.equal(db.__read("restaurants/rest-1/goStats/2026-08-13")?.commissionCents, undefined);
});

test("confirming freezes the item on the booking, in one go with the status", async () => {
  const { db, service } = setup();
  const session = await service.ensureGuestSession({});
  const booked = await service.createBooking({
    offerId: "offer-1", restaurantId: "rest-1", request: REQUEST, guestToken: session.guestToken, idempotencyKey: "a"
  });
  await service.checkIn({ shortCode: booked.booking.shortCode, restaurantId: "rest-1" });

  const stored = db.__read(`goBookings/${booked.booking.id}`);
  assert.equal(stored.status, "checked_in");
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
  const booked = await service.createBooking({
    offerId: "offer-1", restaurantId: "rest-1", request: REQUEST, guestToken: session.guestToken, idempotencyKey: "a"
  });
  await service.checkIn({
    shortCode: booked.booking.shortCode,
    restaurantId: "rest-1",
    partySize: 3
  });
  const stored = db.__read(`goBookings/${booked.booking.id}`);
  assert.equal(stored.partySize, 3);
  assert.equal(stored.commission.partySize, 3);
  assert.equal(stored.commission.amountCents, 100);
});

test("a later price list does not rewrite a booking that already exists", async () => {
  // Die Fassung wird beim Zugreifen eingefroren. Steht dort eine, die es
  // nicht mehr gibt, faellt sie auf die geltende zurueck - aber sie wird
  // nicht stillschweigend als die eingefrorene ausgegeben.
  const { db, service } = setup();
  const session = await service.ensureGuestSession({});
  const booked = await service.createBooking({
    offerId: "offer-1", restaurantId: "rest-1", request: REQUEST, guestToken: session.guestToken, idempotencyKey: "a"
  });
  db.__store.get(`goBookings/${booked.booking.id}`).commissionVersion = "1999-01";
  await service.checkIn({ shortCode: booked.booking.shortCode, restaurantId: "rest-1" });
  const stored = db.__read(`goBookings/${booked.booking.id}`);
  assert.equal(stored.commission.version, "2026-08");
  assert.equal(stored.commission.amountCents, 150);
});

test("the day of the venue counts the confirmations and what they are worth", async () => {
  const { db, service } = setup({ offer: { limits: {} } });
  const first = await service.ensureGuestSession({});
  const second = await service.ensureGuestSession({});
  const a = await service.createBooking({
    offerId: "offer-1", restaurantId: "rest-1", request: REQUEST, guestToken: first.guestToken, idempotencyKey: "a"
  });
  const b = await service.createBooking({
    offerId: "offer-1", restaurantId: "rest-1", request: { ...REQUEST, partySize: 2 }, guestToken: second.guestToken, idempotencyKey: "b"
  });
  await service.checkIn({ shortCode: a.booking.shortCode, restaurantId: "rest-1" });
  await service.checkIn({ shortCode: b.booking.shortCode, restaurantId: "rest-1" });
  await settle();

  const stats = db.__read("restaurants/rest-1/goStats/2026-08-13");
  assert.equal(stats.confirmed, 2);
  // 4 Personen (150) + 2 Personen (50).
  assert.equal(stats.commissionCents, 200);
});

test("confirming twice does not bill twice", async () => {
  const { db, service } = setup();
  const session = await service.ensureGuestSession({});
  const booked = await service.createBooking({
    offerId: "offer-1", restaurantId: "rest-1", request: REQUEST, guestToken: session.guestToken, idempotencyKey: "a"
  });
  await service.checkIn({ shortCode: booked.booking.shortCode, restaurantId: "rest-1" });
  const again = await service.checkIn({ shortCode: booked.booking.shortCode, restaurantId: "rest-1" });
  assert.equal(again.alreadyCheckedIn, true);
  await settle();

  const stats = db.__read("restaurants/rest-1/goStats/2026-08-13");
  assert.equal(stats.confirmed, 1);
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
  assert.equal(result.booking.status, "cancelled_by_user");
  // Und der Zustand steht wirklich in der Datenbank, nicht nur im Rueckgabewert.
  assert.equal(db.__read(`goBookings/${booked.booking.id}`).status, "cancelled_by_user");
  // Der Platz ist zurueck.
  const slot = db.__all("restaurants/rest-1/goCapacity/").find((entry) => entry.path.includes("slot__"));
  assert.equal(slot.data.groups, 0);
});

test("the venue can cancel too, and that path reads before it writes as well", async () => {
  const { db, service } = setup();
  const session = await service.ensureGuestSession({});
  const booked = await service.createBooking({
    offerId: "offer-1", restaurantId: "rest-1", request: REQUEST, guestToken: session.guestToken, idempotencyKey: "a"
  });
  await service.businessUpdateBooking({
    bookingId: booked.booking.id,
    restaurantId: "rest-1",
    action: "cancel",
    reason: "Mbyllur sot"
  });
  assert.equal(db.__read(`goBookings/${booked.booking.id}`).status, "cancelled_by_business");
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
      const copy = { ...OFFER, restaurantId: "rest-2", benefitLabel: "–15 %" };
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
