import assert from "node:assert/strict";
import test from "node:test";

import {
  GO_OFFER_STATUS_ARCHIVED,
  GO_OFFER_STATUS_PAUSED,
  buildGoBenefitLabel,
  buildGoBenefitView,
  describeGoPartyRanges,
  describeGoSchedule,
  formatGoPrice,
  formatGoPriceInput,
  isGoOfferBookable,
  isGoOfferWithinDateRange,
  normalizeGoBenefit,
  normalizeGoOffer,
  parseGoPriceCents,
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
  assert.equal(offer.benefitLabel, "-10%");
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
  assert.equal(buildGoBenefitLabel({ kind: "percent", percent: 15 }), "-15%");
  assert.equal(buildGoBenefitLabel({ kind: "freeItem", itemName: "Cookie" }), "Cookie FALAS");
  assert.equal(buildGoBenefitLabel({ kind: "bundle", itemName: "Kafe + Cookie", priceText: "2,50 €" }), "Kafe + Cookie 2,50 €");
  // Eigener Text schlaegt jede Ableitung - das Lokal hat das letzte Wort.
  assert.equal(buildGoBenefitLabel({ kind: "percent", percent: 10, text: "Vetëm sot" }), "Vetëm sot");
  // Die Art entscheidet, nicht ein Prozentsatz, der aus einer frueheren
  // Fassung des Angebots noch danebensteht.
  assert.equal(buildGoBenefitLabel({ kind: "bundle", itemName: "1 Kafe", priceText: "2,50 €", percent: 10 }), "1 Kafe 2,50 €");
});

// ===========================================================================
// "ÇKA PO OFRON?" - vier Arten, und der Satz des Gastes entsteht aus den
// Eingaben. Das Lokal schreibt ihn nicht (Punkt 8, 25).
// ===========================================================================

test("mnyra writes the guest line, the venue only answers the questions", () => {
  // Zbritje %: die Zahl und der Bereich, auf den sie sich bezieht.
  assert.equal(
    normalizeGoOffer({ ...CASA_RITA, benefit: { kind: "discount", percent: 20, scope: "food" } }).benefitLabel,
    "-20% në ushqim"
  );
  assert.equal(
    buildGoBenefitLabel({ kind: "percent", percent: 20, scope: "drinks" }),
    "-20% në pije"
  );
  // Die ganze Rechnung braucht keinen Halbsatz - "-20%" ist der ganze Satz.
  assert.equal(buildGoBenefitLabel({ kind: "percent", percent: 20, scope: "all" }), "-20%");

  // Paketë GO: Inhalt und GO-Preis.
  assert.equal(
    buildGoBenefitLabel({
      kind: "bundle",
      itemName: "2 Burger + 2 Pije",
      regularPrice: "20,00",
      goPrice: "14,90"
    }),
    "2 Burger + 2 Pije 14,90 €"
  );

  // Falas: was es gratis gibt, und unter welcher Bedingung.
  assert.equal(
    buildGoBenefitLabel({ kind: "free_item", itemName: "1 Pije", conditionType: "food" }),
    "1 Pije FALAS me porosi ushqimi"
  );
  assert.equal(
    buildGoBenefitLabel({ kind: "freeItem", itemName: "1 Kroasan", conditionType: "drink" }),
    "1 Kroasan FALAS me porosi të pijes"
  );
  assert.equal(
    buildGoBenefitLabel({ kind: "freeItem", itemName: "1 Kafe", conditionType: "any_order" }),
    "1 Kafe FALAS me çdo porosi"
  );
  assert.equal(
    buildGoBenefitLabel({
      kind: "freeItem",
      itemName: "1 Pije",
      conditionType: "custom",
      customCondition: "kur porosit 2 pizza"
    }),
    "1 Pije FALAS kur porosit 2 pizza"
  );

  // Çmim special: Produkt und GO-Preis.
  assert.equal(
    buildGoBenefitLabel({
      kind: "special_price",
      itemName: "Pizza Margherita",
      regularPrice: 8,
      goPrice: 5.9
    }),
    "Pizza Margherita 5,90 €"
  );
});

test("prices are whole cents, and the saving is computed - never entered", () => {
  // Ein Wirt tippt "14,90", ein anderer "14.90", ein dritter "14,90 €".
  assert.equal(parseGoPriceCents("14,90"), 1490);
  assert.equal(parseGoPriceCents("14.90"), 1490);
  assert.equal(parseGoPriceCents("14,90 €"), 1490);
  assert.equal(parseGoPriceCents("20"), 2000);
  assert.equal(parseGoPriceCents("1.234,50"), 123450);
  assert.equal(parseGoPriceCents(""), 0);
  assert.equal(parseGoPriceCents("abc"), 0);
  assert.equal(formatGoPrice(1490), "14,90 €");
  assert.equal(formatGoPriceInput(1490), "14,90");
  assert.equal(formatGoPriceInput(0), "");

  const bundle = normalizeGoBenefit({
    kind: "bundle",
    itemName: "2 Burger + 2 Pije",
    regularPrice: "20,00",
    goPrice: "14,90"
  });
  assert.equal(bundle.regularPriceCents, 2000);
  assert.equal(bundle.goPriceCents, 1490);
  // 5,10 € - und nicht 5,099999999999999, wie es mit Kommazahlen herauskaeme.
  assert.equal(bundle.savingCents, 510);
  assert.equal(bundle.savingPercent, 25.5);

  const special = normalizeGoBenefit({ kind: "specialPrice", itemName: "Pizza", regularPrice: 8, goPrice: 5.9 });
  assert.equal(special.savingCents, 210);
  assert.equal(special.savingPercent, 26.25);

  // Ein GO-Preis ueber dem normalen ist keine Ersparnis - und keine
  // Bewertung des Angebots, sondern nur nichts zu rechnen (Punkt 30).
  const upsideDown = normalizeGoBenefit({ kind: "bundle", itemName: "X", regularPrice: 10, goPrice: 12 });
  assert.equal(upsideDown.savingCents, 0);
  assert.equal(upsideDown.savingPercent, 0);
});

test("the guest card gets the same lines everywhere", () => {
  // Die Karte entscheidet nichts: Hier steht schon, was auf welcher Zeile
  // stehen soll - in der Vorschau des Wirts wie im Ergebnis des Gastes.
  const discount = buildGoBenefitView({ kind: "percent", percent: 20, scope: "food" });
  assert.equal(discount.headline, "-20%");
  assert.equal(discount.note, "në ushqim");
  assert.equal(discount.priceGo, "");

  const bundle = buildGoBenefitView({
    kind: "bundle",
    itemName: "2 Burger + 2 Pije",
    regularPrice: "20,00",
    goPrice: "14,90"
  });
  assert.equal(bundle.eyebrow, "Paketë GO");
  assert.equal(bundle.headline, "2 Burger + 2 Pije");
  assert.equal(bundle.priceRegular, "20,00 €");
  assert.equal(bundle.priceGo, "14,90 €");
  assert.equal(bundle.savingLabel, "Kursen 5,10 €");

  const free = buildGoBenefitView({ kind: "freeItem", itemName: "1 Pije", conditionType: "food" });
  // FALAS ist das Wort, um das es geht - und der Artikel gehoert dazu.
  assert.equal(free.headline, "1 PIJE FALAS");
  assert.equal(free.note, "me porosi ushqimi");

  const special = buildGoBenefitView({ kind: "specialPrice", itemName: "Pizza Margherita", regularPrice: 8, goPrice: 5.9 });
  assert.equal(special.eyebrow, "Çmim special GO");
  assert.equal(special.headline, "Pizza Margherita");
  assert.equal(special.savingLabel, "Kursen 2,10 €");
});

test("each kind is told only what its own form is missing", () => {
  // Punkt 12 bis 15: kurze Saetze, jeder an seinem Feld.
  const discount = validateGoOffer({ ...CASA_RITA, benefit: { kind: "percent", percent: 0 } });
  assert.equal(discount.ok, false);
  assert.equal(discount.errors.find((entry) => entry.field === "benefitPercent")?.message, "Shkruaj zbritjen.");

  const bundle = validateGoOffer({ ...CASA_RITA, benefit: { kind: "bundle" } });
  assert.equal(bundle.errors.find((entry) => entry.field === "benefitItem")?.message, "Shkruaj çka përfshin paketa.");
  assert.equal(bundle.errors.find((entry) => entry.field === "regularPrice")?.message, "Shkruaj çmimin normal.");
  assert.equal(bundle.errors.find((entry) => entry.field === "goPrice")?.message, "Shkruaj çmimin GO.");

  // Logik, keine Meinung: Ein GO-Preis ueber dem normalen ergibt keinen Sinn.
  const upsideDown = validateGoOffer({
    ...CASA_RITA,
    benefit: { kind: "bundle", itemName: "2 Burger", regularPrice: 10, goPrice: 12 }
  });
  assert.equal(
    upsideDown.errors.find((entry) => entry.field === "goPrice")?.message,
    "Çmimi GO duhet të jetë më i ulët se çmimi normal."
  );

  const free = validateGoOffer({ ...CASA_RITA, benefit: { kind: "freeItem" } });
  assert.equal(free.errors.find((entry) => entry.field === "benefitItem")?.message, "Shkruaj çka merr klienti falas.");
  assert.equal(free.errors.find((entry) => entry.field === "benefitCondition")?.message, "Zgjidh kushtin e ofertës.");
  const freeCustom = validateGoOffer({
    ...CASA_RITA,
    benefit: { kind: "freeItem", itemName: "1 Pije", conditionType: "custom" }
  });
  assert.equal(freeCustom.errors.find((entry) => entry.field === "benefitCondition")?.message, "Shkruaj kushtin e ofertës.");

  const special = validateGoOffer({ ...CASA_RITA, benefit: { kind: "specialPrice" } });
  assert.equal(special.errors.find((entry) => entry.field === "benefitItem")?.message, "Shkruaj produktin.");

  // Und was vollstaendig ist, geht durch.
  assert.equal(validateGoOffer({
    ...CASA_RITA,
    benefit: { kind: "specialPrice", itemName: "Pizza Margherita", regularPrice: 8, goPrice: 5.9 }
  }).ok, true);
  assert.equal(validateGoOffer({
    ...CASA_RITA,
    benefit: { kind: "freeItem", itemName: "1 Pije", conditionType: "any_order" }
  }).ok, true);
});

test("an offer from before keeps what it had", () => {
  // Die alten "Aksion"-Angebote trugen ihren Preis als Text. Das Formular
  // fragt heute nach zwei Preisen - aber ein Angebot, das nur den Text hat,
  // darf nicht beim naechsten Speichern daran scheitern.
  const legacy = { ...CASA_RITA, benefit: { kind: "bundle", itemName: "1 Kafe + 1 kroasan", priceText: "2,50 €" } };
  assert.equal(normalizeGoOffer(legacy).benefitLabel, "1 Kafe + 1 kroasan 2,50 €");
  assert.equal(validateGoOffer(legacy).ok, true);
  // Und der eigene Satz von damals steht weiter oben auf der Karte.
  assert.equal(normalizeGoOffer({ ...CASA_RITA, benefit: { kind: "percent", percent: 10, text: "Vetëm sot" } }).benefitLabel, "Vetëm sot");
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
  assert.equal(payload.benefitLabel, "-10%");
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
