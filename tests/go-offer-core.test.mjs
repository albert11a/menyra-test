import assert from "node:assert/strict";
import test from "node:test";

import {
  GO_OFFER_STATUS_ARCHIVED,
  GO_OFFER_STATUS_PAUSED,
  buildGoBenefitLabel,
  describeGoPartyRanges,
  describeGoSchedule,
  isGoOfferBookable,
  isGoOfferWithinDateRange,
  normalizeGoOffer,
  resolveGoOfferWindowsForDay,
  resolveGoPartyBounds,
  toGoOfferStoragePayload,
  validateGoOffer
} from "../shared/go/go-offer-core.js";

// ===========================================================================
// Das Angebot ist die Zusage, die das Lokal im Voraus gibt. Alles daran muss
// aus jeder Quelle gleich herauskommen - aus dem Editor, aus Firestore, aus
// einem Test.
// ===========================================================================

const CASA_RITA = {
  id: "offer-1",
  restaurantId: "rest-1",
  benefit: { kind: "percent", percent: 10 },
  category: "food",
  partyRanges: ["2-4"],
  schedule: { mode: "windows", days: ["mon", "tue", "wed", "thu"], windows: [{ start: "14:00", end: "19:00" }] },
  bookingType: "reservation",
  limits: { slotGroups: 2 }
};

test("an offer comes out of any source in one shape", () => {
  const offer = normalizeGoOffer(CASA_RITA);
  assert.equal(offer.benefitLabel, "–10 %");
  assert.equal(offer.minParty, 2);
  assert.equal(offer.maxParty, 4);
  assert.equal(offer.bookingType, "reservation");
  assert.equal(offer.status, "active");
  // Ohne Filialangabe gehoert ein Angebot zur Hauptadresse - nie zu "irgendwo
  // im Unternehmen" (Punkt 124).
  assert.equal(offer.locationId, "main");
  assert.deepEqual(offer.channels, ["go"]);
});

test("the benefit line is written once and read everywhere", () => {
  assert.equal(buildGoBenefitLabel({ kind: "percent", percent: 15 }), "–15 %");
  assert.equal(buildGoBenefitLabel({ kind: "freeItem", itemName: "Cookie" }), "Cookie falas");
  assert.equal(buildGoBenefitLabel({ kind: "bundle", itemName: "Kafe + Cookie", priceText: "2,50 €" }), "Kafe + Cookie 2,50 €");
  // Eigener Text schlaegt jede Ableitung - das Lokal hat das letzte Wort.
  assert.equal(buildGoBenefitLabel({ kind: "percent", percent: 10, text: "Vetëm sot" }), "Vetëm sot");
});

test("party ranges become plain numbers for matching", () => {
  assert.deepEqual(resolveGoPartyBounds(["1-2", "2-4"]), { min: 1, max: 4 });
  // Nichts gewaehlt heisst nicht "niemand", sondern "alle".
  assert.deepEqual(resolveGoPartyBounds([]), { min: 1, max: 99 });
});

test("a schedule without days or windows means always", () => {
  const offer = normalizeGoOffer({ ...CASA_RITA, schedule: { mode: "windows", days: [], windows: [] } });
  assert.equal(offer.schedule.mode, "always");
  assert.equal(describeGoSchedule(offer), "Gjithmonë");
  const day = resolveGoOfferWindowsForDay(offer, "sun");
  assert.equal(day.open, true);
  // "Immer" heisst nicht "rund um die Uhr": Die Grenze setzt dann allein die
  // Oeffnungszeit des Lokals.
  assert.deepEqual(day.windows, []);
});

test("a day outside the weekly plan is closed", () => {
  const offer = normalizeGoOffer(CASA_RITA);
  assert.equal(resolveGoOfferWindowsForDay(offer, "sat").open, false);
  assert.deepEqual(resolveGoOfferWindowsForDay(offer, "tue").windows, [{ start: 840, end: 1140 }]);
  assert.equal(describeGoSchedule(offer), "Hën, Mar, Mër, Enj · 14:00-19:00");
  assert.equal(describeGoPartyRanges(offer), "2–4 persona");
});

test("a date range is read in calendar days of the venue", () => {
  const offer = normalizeGoOffer({ ...CASA_RITA, dateRange: { startDate: "2026-08-15", endDate: "2026-08-20" } });
  assert.equal(isGoOfferWithinDateRange(offer, "2026-08-14"), false);
  assert.equal(isGoOfferWithinDateRange(offer, "2026-08-15"), true);
  assert.equal(isGoOfferWithinDateRange(offer, "2026-08-20"), true);
  assert.equal(isGoOfferWithinDateRange(offer, "2026-08-21"), false);
  // Ohne Zeitraum gilt das Angebot an jedem Tag.
  assert.equal(isGoOfferWithinDateRange(normalizeGoOffer(CASA_RITA), "2030-01-01"), true);
});

test("paused and archived offers take no new bookings", () => {
  assert.equal(isGoOfferBookable(normalizeGoOffer({ ...CASA_RITA, status: GO_OFFER_STATUS_PAUSED })), false);
  assert.equal(isGoOfferBookable(normalizeGoOffer({ ...CASA_RITA, status: GO_OFFER_STATUS_ARCHIVED })), false);
  assert.equal(isGoOfferBookable(normalizeGoOffer(CASA_RITA)), true);
});

test("the editor is told what is missing, in albanian", () => {
  const empty = validateGoOffer({ restaurantId: "" });
  assert.equal(empty.ok, false);
  assert.ok(empty.errors.some((error) => error.field === "restaurantId"));
  assert.ok(empty.errors.some((error) => error.field === "benefit"));
  assert.equal(validateGoOffer(CASA_RITA).ok, true);
});

test("what is stored carries the numbers the server sorts by", () => {
  const payload = toGoOfferStoragePayload(CASA_RITA, { serverTimestamp: "SERVER_TIME" });
  // minParty/maxParty/benefitLabel sind abgeleitet - aber ein Index kann nur
  // lesen, was wirklich im Dokument steht.
  assert.equal(payload.minParty, 2);
  assert.equal(payload.maxParty, 4);
  assert.equal(payload.benefitLabel, "–10 %");
  assert.equal(payload.updatedAt, "SERVER_TIME");
  assert.equal(payload.createdAt, "SERVER_TIME");
  // Ein bereits bestehendes Angebot bekommt kein neues Anlagedatum.
  const existing = toGoOfferStoragePayload({ ...CASA_RITA, createdAt: "2026-01-01T00:00:00.000Z" }, { serverTimestamp: "SERVER_TIME" });
  assert.equal(existing.createdAt, undefined);
});

test("normalizing twice changes nothing", () => {
  // Der Editor normalisiert, der Server normalisiert noch einmal, der Test
  // ein drittes Mal. Waere das nicht dasselbe, wuerde aus einem 14:00-Fenster
  // beim zweiten Lauf ein 08:40-Fenster - und niemand faende den Grund.
  const once = normalizeGoOffer(CASA_RITA);
  const twice = normalizeGoOffer(once);
  assert.deepEqual(twice, once);
  assert.deepEqual(twice.schedule.windows, [{ start: 840, end: 1140 }]);
});

test("limits of zero mean no limit, never zero allowed", () => {
  const offer = normalizeGoOffer({ ...CASA_RITA, limits: {} });
  assert.deepEqual(offer.limits, { slotGroups: 0, slotGuests: 0, dailyGroups: 0, totalRedemptions: 0 });
});
