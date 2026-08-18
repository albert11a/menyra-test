import assert from "node:assert/strict";
import test from "node:test";

import {
  GO_PERIOD_KEYS,
  buildGoCohortFunnel,
  countGoVisitors,
  goPeriodLabel,
  normalizeGoPeriod,
  resolveGoPeriodRange,
  sumGoEarnedCents
} from "../shared/go/go-period-core.js";
import {
  GO_FORECAST_SHRINKAGE,
  buildGoForecast,
  goExpectedRevenueCents,
  goFinalizationRates,
  goMedianFinalizationLatency,
  smoothGoRate
} from "../shared/go/go-forecast-core.js";
import { goCommissionCents } from "../shared/go/go-commission-core.js";

// Donnerstag, 13.08.2026, 16:00 Ortszeit in Prishtina (14:00 UTC).
const THURSDAY_16H = Date.parse("2026-08-13T14:00:00.000Z");
const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

function booking(overrides = {}) {
  return {
    status: "accepted",
    acceptedAt: new Date(THURSDAY_16H).toISOString(),
    partySizeRequested: 4,
    ...overrides
  };
}

// ===========================================================================
// Punkt 56: die fuenf Zeitraeume.
// ===========================================================================

test("the five periods are the same everywhere", () => {
  assert.deepEqual([...GO_PERIOD_KEYS], ["sot", "dje", "week", "month", "year"]);
  assert.equal(normalizeGoPeriod(""), "sot");
  assert.equal(normalizeGoPeriod("gibt-es-nicht"), "sot");
  assert.equal(goPeriodLabel("week"), "1 javë");
});

test("today is a calendar day, not the last 24 hours", () => {
  // Wer um 23:00 auf "Sot" tippt, will den Tag sehen, der gleich zu Ende
  // geht - nicht die Zeit seit gestern Abend.
  const range = resolveGoPeriodRange({ period: "sot", nowMs: THURSDAY_16H });
  // 00:00 Ortszeit in Prishtina ist 22:00 UTC am Vortag.
  assert.equal(new Date(range.fromMs).toISOString(), "2026-08-12T22:00:00.000Z");
  assert.equal(range.toMs, THURSDAY_16H);
});

test("yesterday ends at midnight, because yesterday is over", () => {
  const range = resolveGoPeriodRange({ period: "dje", nowMs: THURSDAY_16H });
  assert.equal(new Date(range.fromMs).toISOString(), "2026-08-11T22:00:00.000Z");
  assert.equal(new Date(range.toMs).toISOString(), "2026-08-12T22:00:00.000Z");
});

test("a week is seven days including today, not seven days back", () => {
  const range = resolveGoPeriodRange({ period: "week", nowMs: THURSDAY_16H });
  // Sechs ganze Tage plus der laufende.
  assert.equal(new Date(range.fromMs).toISOString(), "2026-08-06T22:00:00.000Z");
  assert.equal(range.toMs, THURSDAY_16H);
  assert.equal(range.dayCount, 7);
});

test("the day belongs to the venue, not to Greenwich", () => {
  const belgrade = resolveGoPeriodRange({ period: "sot", nowMs: THURSDAY_16H });
  const iceland = resolveGoPeriodRange({ period: "sot", nowMs: THURSDAY_16H, timeZone: "Atlantic/Reykjavik" });
  // Zwei Lokale, zwei Zonen, zwei verschiedene Mitternachten.
  assert.notEqual(belgrade.fromMs, iceland.fromMs);
  assert.equal(new Date(iceland.fromMs).toISOString(), "2026-08-13T00:00:00.000Z");
});

// ===========================================================================
// Punkt 33: der Trichter ist eine Kohorte.
// ===========================================================================

test("the funnel counts the bookings accepted in the period, and follows them", () => {
  const range = resolveGoPeriodRange({ period: "sot", nowMs: THURSDAY_16H });
  const funnel = buildGoCohortFunnel({
    bookings: [
      booking(),
      booking({ status: "activated", activatedAt: new Date(THURSDAY_16H + HOUR).toISOString() }),
      booking({
        status: "finalized",
        activatedAt: new Date(THURSDAY_16H + HOUR).toISOString(),
        finalizedAt: new Date(THURSDAY_16H + 2 * HOUR).toISOString()
      })
    ],
    fromMs: range.fromMs,
    toMs: range.toMs
  });
  assert.equal(funnel.accepted, 3);
  // Eine finalisierte Oferta wurde aktiviert - sie aus der Zahl zu nehmen
  // hiesse, den Trichter oben zu verjuengen.
  assert.equal(funnel.activated, 2);
  assert.equal(funnel.finalized, 1);
  assert.equal(funnel.activatedNotFinalized, 1);
});

test("a number can never stand above the one before it", () => {
  const range = resolveGoPeriodRange({ period: "sot", nowMs: THURSDAY_16H });
  // Eine gestern angenommene Buchung, die heute finalisiert wurde: Sie
  // gehoert NICHT in den Trichter von heute, sonst stuende dort
  // "Pranuara 1 / Finalizuara 2".
  const funnel = buildGoCohortFunnel({
    bookings: [
      booking(),
      booking({
        status: "finalized",
        acceptedAt: new Date(THURSDAY_16H - DAY).toISOString(),
        finalizedAt: new Date(THURSDAY_16H).toISOString()
      })
    ],
    fromMs: range.fromMs,
    toMs: range.toMs
  });
  assert.equal(funnel.accepted, 1);
  assert.equal(funnel.finalized, 0);
  assert.ok(funnel.accepted >= funnel.activated);
  assert.ok(funnel.activated >= funnel.finalized);
});

// ===========================================================================
// Punkt 34 und 11: Besucher rechnen anders, und sie sind Personen.
// ===========================================================================

test("visitors count by the day they were finalized, not accepted", () => {
  const range = resolveGoPeriodRange({ period: "sot", nowMs: THURSDAY_16H });
  const result = countGoVisitors({
    bookings: [
      // Gestern angenommen, heute eingeloest: ein Gast von heute.
      booking({
        status: "finalized",
        acceptedAt: new Date(THURSDAY_16H - DAY).toISOString(),
        finalizedAt: new Date(THURSDAY_16H - HOUR).toISOString(),
        partySizeVerified: 3
      }),
      // Heute angenommen, noch nicht eingeloest: kein Gast.
      booking()
    ],
    fromMs: range.fromMs,
    toMs: range.toMs
  });
  assert.equal(result.visits, 1);
  assert.equal(result.visitors, 3);
});

test("seven finalized offers are seven offers and eighteen guests", () => {
  // Das Beispiel aus dem Konzept: 2, 4, 1, 3, 2, 4, 2.
  const range = resolveGoPeriodRange({ period: "sot", nowMs: THURSDAY_16H });
  const bookings = [2, 4, 1, 3, 2, 4, 2].map((size) => booking({
    status: "finalized",
    finalizedAt: new Date(THURSDAY_16H - HOUR).toISOString(),
    partySizeVerified: size
  }));
  const result = countGoVisitors({ bookings, fromMs: range.fromMs, toMs: range.toMs });
  assert.equal(result.visits, 7);
  assert.equal(result.visitors, 18);
});

test("the verified party size is what counts, not the guess", () => {
  const range = resolveGoPeriodRange({ period: "sot", nowMs: THURSDAY_16H });
  const result = countGoVisitors({
    bookings: [booking({
      status: "finalized",
      finalizedAt: new Date(THURSDAY_16H).toISOString(),
      partySizeRequested: 4,
      partySizeVerified: 2
    })],
    fromMs: range.fromMs,
    toMs: range.toMs
  });
  assert.equal(result.visitors, 2);
});

test("money comes from the bookings, where it was born in one transaction", () => {
  const range = resolveGoPeriodRange({ period: "sot", nowMs: THURSDAY_16H });
  const earned = sumGoEarnedCents({
    bookings: [
      booking({
        status: "finalized",
        finalizedAt: new Date(THURSDAY_16H).toISOString(),
        commission: { amountCents: 150 }
      }),
      booking({
        status: "finalized",
        finalizedAt: new Date(THURSDAY_16H).toISOString(),
        commission: { amountCents: 50 }
      }),
      // Nicht finalisiert: kostet nichts.
      booking({ status: "activated" })
    ],
    fromMs: range.fromMs,
    toMs: range.toMs
  });
  assert.equal(earned, 200);
});

// ===========================================================================
// Punkt 44: keine 100 Prozent nach drei Buchungen.
// ===========================================================================

test("three out of three is not a hundred percent", () => {
  const rates = goFinalizationRates({
    own: { accepted: 3, activated: 3, finalized: 3 },
    global: { accepted: 1000, activated: 800, finalized: 600 }
  });
  assert.ok(rates.acceptedToFinalized < 1);
  // Es liegt deutlich naeher am Durchschnitt als an der eigenen Quote.
  assert.ok(rates.acceptedToFinalized < 0.75);
  assert.ok(rates.acceptedToFinalized > rates.global.acceptedToFinalized);
});

test("a venue with a long history speaks for itself", () => {
  const rates = goFinalizationRates({
    own: { accepted: 1000, activated: 900, finalized: 900 },
    global: { accepted: 1000, activated: 800, finalized: 500 }
  });
  // Bei tausend eigenen Buchungen faellt die Beimischung kaum ins Gewicht.
  assert.ok(rates.acceptedToFinalized > 0.87);
});

test("a venue with no history at all gets the average, not a zero", () => {
  const rates = goFinalizationRates({
    own: { accepted: 0, activated: 0, finalized: 0 },
    global: { accepted: 1000, activated: 800, finalized: 600 }
  });
  assert.equal(rates.acceptedToFinalized, 0.6);
});

test("without any history anywhere there is still an honest starting point", () => {
  const rates = goFinalizationRates({ own: {}, global: {} });
  assert.equal(rates.acceptedToFinalized, 0.55);
  assert.equal(rates.activatedToFinalized, 0.8);
});

test("smoothing moves without jumping", () => {
  const step = (n) => smoothGoRate({ part: n, whole: n, globalRate: 0.5 });
  // Jede weitere Buchung schiebt die Quote ein Stueck - keine verdoppelt sie.
  assert.ok(step(1) < step(2));
  assert.ok(step(12) < step(13));
  assert.ok(step(13) - step(12) < 0.02);
});

test("someone who already swiped is worth more than someone who only accepted", () => {
  const rates = { acceptedToFinalized: 0.5, activatedToFinalized: 0.9 };
  const commissionFor = (size) => goCommissionCents(size);
  const accepted = goExpectedRevenueCents({
    openBookings: [booking({ status: "accepted" })], rates, commissionFor
  });
  const activated = goExpectedRevenueCents({
    openBookings: [booking({ status: "activated" })], rates, commissionFor
  });
  // Vier Personen kosten 150 Cent.
  assert.equal(accepted, 75);
  assert.equal(activated, 135);
});

test("a closed booking is worth nothing to the forecast", () => {
  const value = goExpectedRevenueCents({
    openBookings: [
      booking({ status: "finalized" }),
      booking({ status: "cancelled" }),
      booking({ status: "expired" })
    ],
    rates: { acceptedToFinalized: 1, activatedToFinalized: 1 },
    commissionFor: () => 150
  });
  assert.equal(value, 0);
});

// ===========================================================================
// Punkt 45: wie lange es dauert.
// ===========================================================================

test("the latency is a median, so one straggler does not move it", () => {
  const at = (hours) => ({
    status: "finalized",
    acceptedAt: new Date(THURSDAY_16H).toISOString(),
    finalizedAt: new Date(THURSDAY_16H + hours * HOUR).toISOString()
  });
  const result = goMedianFinalizationLatency([at(1), at(2), at(3), at(25)]);
  // Der Durchschnitt laege bei 7,75 Stunden - der Median bei 2,5.
  assert.equal(result.medianMs, 2.5 * HOUR);
  assert.equal(result.sampleSize, 4);
});

test("without any finalized booking there is no latency, and it says so", () => {
  const result = goMedianFinalizationLatency([booking()]);
  assert.equal(result.medianMs, 0);
  assert.equal(result.sampleSize, 0);
});

// ===========================================================================
// Punkt 43: was gemessen ist, wird nicht geschaetzt.
// ===========================================================================

test("the forecast keeps the measured half apart from the guessed one", () => {
  const forecast = buildGoForecast({
    earnedCents: 1450,
    expectedCents: 390,
    rates: { sampleSize: 3 }
  });
  assert.equal(forecast.earnedCents, 1450);
  assert.equal(forecast.expectedOpenCents, 390);
  assert.equal(forecast.forecastCents, 1840);
  // Drei Buchungen sind keine Grundlage - und Heart darf das sagen duerfen.
  assert.equal(forecast.confident, false);
  assert.equal(buildGoForecast({ rates: { sampleSize: GO_FORECAST_SHRINKAGE } }).confident, true);
});
