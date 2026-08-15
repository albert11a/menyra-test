import assert from "node:assert/strict";
import test from "node:test";

import {
  GO_MATCH_REASONS,
  buildGoResultCard,
  goDistanceKm,
  isGoBusinessOpenForNewBookings,
  matchGoOffer,
  normalizeGoSearchRequest,
  rankGoMatches
} from "../shared/go/go-matching-core.js";
import { normalizeGoOffer } from "../shared/go/go-offer-core.js";
import { toGoMillis } from "../shared/go/go-time-core.js";

// ===========================================================================
// Die Matching-Engine ist die einzige Stelle, die entscheidet, ob ein Angebot
// einem Gast gezeigt werden darf. Sie laeuft zweimal: bei der Suche und noch
// einmal beim Zugreifen (Punkt 27). Deshalb muss sie ohne Zustand auskommen -
// dieselben Eingaben, dieselbe Antwort.
// ===========================================================================

// Samstag, 15.08.2026, 19:00 Ortszeit in Prishtina.
const SATURDAY_19H = toGoMillis("2026-08-15T17:00:00.000Z");
// Donnerstag, 13.08.2026, 16:00 Ortszeit.
const THURSDAY_16H = toGoMillis("2026-08-13T14:00:00.000Z");

const BUSINESS = {
  id: "rest-1",
  name: "Casa Rita",
  city: "Prishtina",
  openingHours: "Hene - Diel: 11:00 - 22:00",
  coords: { lat: 42.6629, lng: 21.1655 },
  logoUrl: "https://cdn.example/logo.png"
};

const OFFER = normalizeGoOffer({
  id: "offer-1",
  restaurantId: "rest-1",
  benefit: { kind: "percent", percent: 10 },
  category: "food",
  partyRanges: ["2-4"],
  schedule: { mode: "windows", days: ["mon", "tue", "wed", "thu"], windows: [{ start: "14:00", end: "19:00" }] },
  bookingType: "reservation",
  limits: { slotGroups: 2 }
});

function run(overrides = {}) {
  const request = normalizeGoSearchRequest({
    city: "Prishtina",
    partySize: 4,
    category: "food",
    requestedAt: THURSDAY_16H,
    ...(overrides.request || {})
  }, { nowMs: overrides.nowMs || THURSDAY_16H });
  return matchGoOffer({
    offer: overrides.offer || OFFER,
    business: { ...BUSINESS, ...(overrides.business || {}) },
    settings: { enabled: true, ...(overrides.settings || {}) },
    usage: overrides.usage || {},
    entitlements: overrides.entitlements || null,
    request,
    nowMs: overrides.nowMs || THURSDAY_16H
  });
}

test("the happy path: four people, thursday afternoon, food", () => {
  const result = run();
  assert.equal(result.ok, true, JSON.stringify(result.reasons));
  assert.deepEqual(result.reasons, []);
});

test("a request without a time is a request for now", () => {
  const request = normalizeGoSearchRequest({ city: "Prishtina" }, { nowMs: THURSDAY_16H });
  assert.equal(request.requestedAt, THURSDAY_16H);
  assert.equal(request.isNow, true);
  // Vorausgewaehlt ist "Krejt" und zwei Personen - der Gast muss nichts tun.
  assert.equal(request.category, "all");
  assert.equal(request.partySize, 2);
});

test("a time in the past is treated as now, not as an error", () => {
  const request = normalizeGoSearchRequest(
    { requestedAt: THURSDAY_16H - 3 * 60 * 60 * 1000 },
    { nowMs: THURSDAY_16H }
  );
  assert.equal(request.requestedAt, THURSDAY_16H);
});

test("saturday is outside the weekly plan", () => {
  const result = run({ request: { requestedAt: SATURDAY_19H }, nowMs: SATURDAY_19H });
  assert.equal(result.ok, false);
  assert.ok(result.reasons.includes(GO_MATCH_REASONS.scheduleClosed));
});

// ===========================================================================
// Punkt 18: Die Oeffnungszeit schlaegt den Angebotsplan.
// ===========================================================================

test("after closing time the offer disappears, even if its own plan runs on", () => {
  const lateOffer = normalizeGoOffer({
    ...OFFER,
    schedule: { mode: "windows", days: ["thu"], windows: [{ start: "14:00", end: "23:00" }] }
  });
  // 22:30 Ortszeit, Lokal schliesst um 22:00.
  const lateMs = toGoMillis("2026-08-13T20:30:00.000Z");
  const result = run({ offer: lateOffer, request: { requestedAt: lateMs }, nowMs: lateMs });
  assert.equal(result.ok, false);
  assert.ok(result.reasons.includes(GO_MATCH_REASONS.scheduleClosed));
  // Und das gekuerzte Fenster steht im Ergebnis - 14:00 bis 22:00.
  assert.deepEqual(result.windows, [{ start: 840, end: 1320 }]);
});

test("unreadable opening hours never hide a venue", () => {
  // "Orari se shpejti" heisst: unbekannt. Daraus darf keine Sperre werden.
  const result = run({ business: { openingHours: "Orari se shpejti" } });
  assert.equal(result.ok, true, JSON.stringify(result.reasons));
});

test("party size, category and city each say no on their own", () => {
  assert.ok(run({ request: { partySize: 6 } }).reasons.includes(GO_MATCH_REASONS.partyMismatch));
  assert.ok(run({ request: { category: "coffee" } }).reasons.includes(GO_MATCH_REASONS.categoryMismatch));
  assert.ok(run({ request: { city: "Prizren" } }).reasons.includes(GO_MATCH_REASONS.cityMismatch));
  // "Krejt" passt auf alles.
  assert.equal(run({ request: { category: "all" } }).ok, true);
  // Ein Lokal ohne Stadtangabe wird nicht aussortiert.
  assert.equal(run({ business: { city: "" } }).ok, true);
});

test("a paused business takes no new bookings but stays a business", () => {
  const pausedUntil = THURSDAY_16H + 30 * 60 * 1000;
  const result = run({ settings: { pausedUntil } });
  assert.ok(result.reasons.includes(GO_MATCH_REASONS.goPaused));
  // Und die Pause endet von selbst.
  const later = run({ settings: { pausedUntil }, nowMs: pausedUntil + 1000, request: { requestedAt: pausedUntil + 1000 } });
  assert.equal(later.ok, true, JSON.stringify(later.reasons));
});

test("pausing without an end stays paused", () => {
  const state = isGoBusinessOpenForNewBookings({ enabled: true, paused: true }, THURSDAY_16H);
  assert.equal(state.ok, false);
  assert.equal(state.reason, GO_MATCH_REASONS.goPaused);
});

test("a full slot reads as sold out, not as a mismatch", () => {
  const result = run({ usage: { slotGroups: 2 } });
  assert.equal(result.ok, false);
  assert.equal(result.soldOut, true);
  assert.ok(result.reasons.includes(GO_MATCH_REASONS.capacityFull));
});

test("guest limits count the group that is about to arrive", () => {
  const offer = normalizeGoOffer({ ...OFFER, limits: { slotGuests: 10 } });
  // Acht sitzen schon, vier wollen kommen - das sind zwoelf.
  assert.equal(run({ offer, usage: { slotGuests: 8 } }).soldOut, true);
  assert.equal(run({ offer, usage: { slotGuests: 6 } }).ok, true);
});

test("an offer without a table ignores slot capacity", () => {
  // Ein Kaffee-Angebot belegt keinen Tisch - eine volle Tischscheibe darf es
  // nicht ausblenden (Punkt 24).
  const claimOffer = normalizeGoOffer({ ...OFFER, bookingType: "claim", limits: { slotGroups: 2 } });
  assert.equal(run({ offer: claimOffer, usage: { slotGroups: 5 } }).ok, true);
});

test("entitlements are asked, not hard coded", () => {
  const result = run({ entitlements: { go_reservations_enabled: false } });
  assert.ok(result.reasons.includes(GO_MATCH_REASONS.reservationsNotAllowed));
  assert.ok(run({ entitlements: { go_enabled: false } }).reasons.includes(GO_MATCH_REASONS.goDisabled));
});

// ===========================================================================
// Reihenfolge und Nutzlast.
// ===========================================================================

test("sponsored moves a matching offer up, never an unfitting one", () => {
  const plain = { match: run(), business: BUSINESS };
  const sponsoredOffer = normalizeGoOffer({ ...OFFER, id: "offer-2", sponsored: true });
  const sponsored = { match: run({ offer: sponsoredOffer }), business: BUSINESS };
  const ranked = rankGoMatches([plain, sponsored], { request: { category: "food", partySize: 4 } });
  assert.equal(ranked[0].match.offer.id, "offer-2");

  // Dasselbe bezahlte Angebot fuer sechs Personen: es passt nicht und steht
  // deshalb gar nicht erst in der Liste.
  const tooBig = { match: run({ offer: sponsoredOffer, request: { partySize: 6 } }), business: BUSINESS };
  const rankedTooBig = rankGoMatches([plain, tooBig], { request: {} });
  assert.equal(rankedTooBig.length, 1);
  assert.equal(rankedTooBig[0].match.offer.id, "offer-1");
});

test("the result payload stays small", () => {
  const match = run();
  const request = normalizeGoSearchRequest(
    { city: "Prishtina", partySize: 4, requestedAt: THURSDAY_16H, lat: 42.66, lng: 21.16 },
    { nowMs: THURSDAY_16H }
  );
  const card = buildGoResultCard({ match, business: BUSINESS, request });
  assert.deepEqual(Object.keys(card).sort(), [
    "benefitLabel", "bookingType", "businessName", "category", "city", "description",
    "distanceKm", "expectedArrivalAt", "isNow", "locationId", "logoUrl", "offerId",
    "partySize", "priceLevel", "restaurantId", "sponsored", "terms"
  ]);
  // Kein Menue, keine Beitraege, keine Bewertungen (Punkt 102).
  assert.equal(JSON.stringify(card).length < 600, true, JSON.stringify(card));
});

test("distance is only computed when the guest shared a location", () => {
  const withCoords = normalizeGoSearchRequest({ lat: 42.66, lng: 21.16 }, { nowMs: THURSDAY_16H });
  assert.ok(withCoords.coords);
  const withoutCoords = normalizeGoSearchRequest({ city: "Prishtina" }, { nowMs: THURSDAY_16H });
  assert.equal(withoutCoords.coords, null);
  assert.equal(run({ request: { city: "Prishtina" } }).distanceKm, -1);
  assert.equal(Math.round(goDistanceKm({ lat: 42.66, lng: 21.16 }, { lat: 42.67, lng: 21.17 })), 1);
});
