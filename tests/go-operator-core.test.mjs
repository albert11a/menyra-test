import assert from "node:assert/strict";
import test from "node:test";

import {
  buildGoOperatorOverview,
  sumGoOperatorCommissions
} from "../shared/go/go-operator-core.js";

// ===========================================================================
// Was Mnyra selbst sieht.
//
// Die wichtigste Zahl hier ist nicht das Geld, sondern die Luecke: angenommen
// minus bestaetigt. Ein Lokal, das nicht bestaetigt, spart keine Provision -
// es verschenkt Rabatte, weil die Oferta gueltig bleibt. Genau darum ist die
// Luecke ein Gespraechsanlass und keine Anklage.
// ===========================================================================

const DAYS = [
  { restaurantId: "r1", impressions: 200, accepted: 30, confirmed: 27 },
  { restaurantId: "r1", impressions: 100, accepted: 10, confirmed: 7 },
  { restaurantId: "r2", impressions: 180, accepted: 22, confirmed: 7 }
];

const COMMISSIONS = [
  { restaurantId: "r1", amountCents: 150, status: "pending" },
  { restaurantId: "r1", amountCents: 150, status: "pending" },
  { restaurantId: "r1", amountCents: 100, status: "settled" },
  { restaurantId: "r2", amountCents: 450, status: "pending" }
];

const NAMES = { r1: "Casarita", r2: "Bro Pizza" };

test("counts come from the days, money comes from the bookings", () => {
  const view = buildGoOperatorOverview({ days: DAYS, commissions: COMMISSIONS, names: NAMES });
  assert.equal(view.totals.impressions, 480);
  assert.equal(view.totals.accepted, 62);
  assert.equal(view.totals.confirmed, 41);
  // 150 + 150 + 450 offen, 100 abgerechnet.
  assert.equal(view.totals.pendingCents, 750);
  assert.equal(view.totals.settledCents, 100);
  assert.equal(view.totals.earnedCents, 850);
  assert.equal(view.totals.restaurants, 2);
});

test("the gap is the number that catches a venue not confirming", () => {
  const view = buildGoOperatorOverview({ days: DAYS, commissions: COMMISSIONS, names: NAMES });
  assert.equal(view.totals.missingConfirmations, 21);

  const bro = view.restaurants.find((row) => row.restaurantId === "r2");
  assert.equal(bro.accepted, 22);
  assert.equal(bro.confirmed, 7);
  assert.equal(bro.missingConfirmations, 15);
  // 7 von 22 - knapp ein Drittel.
  assert.equal(bro.confirmRatePercent, 31.8);

  const casa = view.restaurants.find((row) => row.restaurantId === "r1");
  assert.equal(casa.confirmed, 34);
  assert.equal(casa.confirmRatePercent, 85);
});

test("a missing count never turns into a negative gap", () => {
  // Die Tagesdokumente werden beilaeufig geschrieben. Faellt eine Zaehlung
  // aus, kann "bestaetigt" groesser als "angenommen" wirken - daraus darf
  // keine Zahl werden, die niemand erklaeren kann.
  const view = buildGoOperatorOverview({
    days: [{ restaurantId: "r1", accepted: 2, confirmed: 5 }],
    commissions: []
  });
  assert.equal(view.restaurants[0].missingConfirmations, 0);
  assert.equal(view.totals.missingConfirmations, 0);
});

test("the venues are sorted by what they bring in, then by the gap", () => {
  const view = buildGoOperatorOverview({ days: DAYS, commissions: COMMISSIONS, names: NAMES });
  // Bro Pizza bringt 450 (eine Zehnergruppe), Casarita 400 (150+150+100) -
  // also steht Bro Pizza oben, obwohl es die schlechtere Quote hat. Das ist
  // Absicht: Die Liste sortiert nach Umsatz, die Quote steht daneben.
  assert.equal(view.restaurants[0].restaurantId, "r2");
  assert.equal(view.restaurants[0].pendingCents + view.restaurants[0].settledCents, 450);
  assert.equal(view.restaurants[1].restaurantId, "r1");
  assert.equal(view.restaurants[1].pendingCents + view.restaurants[1].settledCents, 400);
});

test("at equal money the bigger gap comes first, because that is the call to make", () => {
  const view = buildGoOperatorOverview({
    days: [
      { restaurantId: "a", accepted: 10, confirmed: 9 },
      { restaurantId: "b", accepted: 30, confirmed: 9 }
    ],
    commissions: [
      { restaurantId: "a", amountCents: 100, status: "pending" },
      { restaurantId: "b", amountCents: 100, status: "pending" }
    ]
  });
  assert.equal(view.restaurants[0].restaurantId, "b");
  assert.equal(view.restaurants[0].missingConfirmations, 21);
});

test("a venue with counts but no confirmations still shows up", () => {
  // Sonst waere ausgerechnet das Lokal unsichtbar, ueber das zu reden waere.
  const view = buildGoOperatorOverview({
    days: [{ restaurantId: "r9", impressions: 90, accepted: 12, confirmed: 0 }],
    commissions: [],
    names: { r9: "Nie bestätigt" }
  });
  assert.equal(view.restaurants.length, 1);
  assert.equal(view.restaurants[0].name, "Nie bestätigt");
  assert.equal(view.restaurants[0].missingConfirmations, 12);
  assert.equal(view.restaurants[0].confirmRatePercent, 0);
});

test("the rates say what they say, and nothing when there is nothing", () => {
  const view = buildGoOperatorOverview({ days: DAYS, commissions: COMMISSIONS, names: NAMES });
  // 62 von 480 haben angenommen.
  assert.equal(view.totals.acceptRatePercent, 12.9);
  // 41 von 62 wurden bestaetigt.
  assert.equal(view.totals.confirmRatePercent, 66.1);

  const empty = buildGoOperatorOverview({});
  assert.equal(empty.totals.acceptRatePercent, 0);
  assert.equal(empty.totals.confirmRatePercent, 0);
  assert.equal(empty.totals.earnedCents, 0);
  assert.deepEqual(empty.restaurants, []);
});

test("an entry without a venue is dropped instead of becoming a ghost row", () => {
  const view = buildGoOperatorOverview({
    days: [{ restaurantId: "", accepted: 5 }, { accepted: 3 }],
    commissions: [{ amountCents: 100, status: "pending" }]
  });
  assert.deepEqual(view.restaurants, []);
  assert.equal(view.totals.pendingCents, 0);
});

test("pending and settled are two sentences, not one", () => {
  const sums = sumGoOperatorCommissions(COMMISSIONS);
  assert.equal(sums.pendingCents, 750);
  assert.equal(sums.settledCents, 100);
  assert.equal(sums.pendingCount, 3);
  assert.equal(sums.settledCount, 1);
});
