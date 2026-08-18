"use strict";

// Generated from ../../../shared/go/go-forecast-core.js. Do not edit manually.
// Run: node functions/scripts/sync-go-shared.cjs

// Mnyra GO - was Mnyra voraussichtlich verdient. Pur.
//
// "Pritshme" ist eine Schaetzung, und sie steht neben einer Zahl, die keine
// ist ("E fituar"). Damit das ehrlich bleibt, gelten hier drei Regeln:
//
//  1. WAS SCHON PASSIERT IST, WIRD NICHT GESCHAETZT.
//     Pritshme = bereits entstandene Gebuehren + erwarteter Wert der noch
//     offenen Buchungen (Punkt 43). Der erste Teil ist gemessen, nur der
//     zweite ist geraten.
//
//  2. EINE QUOTE AUS DREI BUCHUNGEN IST KEINE QUOTE.
//     Ein Lokal, das dreimal finalisiert hat, hat 100 % - und das waere eine
//     Prognose, die naechste Woche zusammenbricht. Deshalb wird jede Quote
//     zum allgemeinen GO-Durchschnitt hin geglaettet, und zwar umso staerker,
//     je weniger Buchungen dahinterstehen (Punkt 44).
//
//  3. AKTIVIERT IST NICHT DASSELBE WIE ANGENOMMEN.
//     Wer schon gewischt hat, steht im Lokal. Seine Wahrscheinlichkeit, dass
//     daraus eine Finalisierung wird, ist eine andere - deshalb zwei Quoten
//     und nicht eine.

const { normalizeGoBookingStatus } = require("./go-booking-core.cjs");
const { toGoMillis } = require("./go-time-core.cjs");

// Wie stark geglaettet wird: Die Quote eines Lokals zaehlt erst dann voll,
// wenn genug Buchungen dahinterstehen. Bei k = 20 hat ein Lokal mit 20
// Buchungen halb sein eigenes Verhalten und halb den Durchschnitt.
//
// Zwanzig ist eine Wahl und keine Wahrheit. Sie ist so gesetzt, dass ein
// junges Lokal nach etwa einer Woche Betrieb anfaengt, fuer sich selbst zu
// sprechen - und nicht schon nach drei Gaesten.
const GO_FORECAST_SHRINKAGE = 20;

// Woran sich ein Lokal ohne jede Historie misst, solange es auch von GO
// insgesamt noch keine gibt. Bewusst nicht optimistisch: Eine Prognose, die
// zu hoch anfaengt, faellt - und eine fallende Prognose liest sich wie ein
// Problem, obwohl nur die Annahme falsch war.
const GO_FORECAST_FALLBACK = Object.freeze({
  acceptedToFinalized: 0.55,
  activatedToFinalized: 0.8
});

function rate(part, whole) {
  const top = Math.max(0, Math.trunc(Number(part) || 0));
  const bottom = Math.max(0, Math.trunc(Number(whole) || 0));
  if (!bottom) return null;
  return Math.min(1, top / bottom);
}

/**
 * Eine Quote, zum Durchschnitt hin geglaettet.
 *
 * Die Rechnung ist (x + k·global) / (n + k): Das Lokal bringt seine eigenen
 * n Buchungen mit, und dazu kommen k erfundene, die sich wie der Durchschnitt
 * verhalten haben. Je mehr echte es hat, desto weniger faellt die Erfindung
 * ins Gewicht.
 *
 * Bei n = 0 kommt genau der Durchschnitt heraus, bei n = 1000 fast nur noch
 * das Lokal selbst. Dazwischen wandert es, ohne zu springen - und genau das
 * ist der Punkt: Die dreizehnte Buchung soll die Prognose nicht verdoppeln.
 */
function smoothGoRate({ part = 0, whole = 0, globalRate = 0, shrinkage = GO_FORECAST_SHRINKAGE } = {}) {
  const n = Math.max(0, Math.trunc(Number(whole) || 0));
  const x = Math.min(n, Math.max(0, Math.trunc(Number(part) || 0)));
  const k = Math.max(0, Number(shrinkage) || 0);
  const global = Math.min(1, Math.max(0, Number(globalRate) || 0));
  if (!n && !k) return global;
  return (x + k * global) / (n + k);
}

/**
 * Die beiden Quoten eines Lokals, geglaettet.
 *
 * @param {object} params.own     { accepted, activated, finalized } des Lokals
 * @param {object} params.global  dieselben drei Zahlen ueber alle Lokale
 */
function goFinalizationRates({ own = {}, global = {} } = {}) {
  const globalAccepted = rate(global.finalized, global.accepted) ?? GO_FORECAST_FALLBACK.acceptedToFinalized;
  const globalActivated = rate(global.finalized, global.activated) ?? GO_FORECAST_FALLBACK.activatedToFinalized;

  return {
    acceptedToFinalized: smoothGoRate({
      part: own.finalized,
      whole: own.accepted,
      globalRate: globalAccepted
    }),
    activatedToFinalized: smoothGoRate({
      part: own.finalized,
      whole: own.activated,
      globalRate: globalActivated
    }),
    // Was die Glaettung ueberhaupt beigemischt hat. Heart soll unterscheiden
    // koennen zwischen "dieses Lokal ist so" und "wir wissen es noch nicht".
    global: { acceptedToFinalized: globalAccepted, activatedToFinalized: globalActivated },
    sampleSize: Math.max(0, Math.trunc(Number(own.accepted) || 0))
  };
}

/**
 * Wie lange es normalerweise dauert, bis aus einer Annahme eine Finalisierung
 * wird - als Median (Punkt 45).
 *
 * Der Median und nicht der Durchschnitt: Eine einzige Buchung, die am letzten
 * Ende ihrer 26 Stunden eingeloest wird, zieht einen Durchschnitt um Stunden
 * nach oben. Der Median steht dort, wo die Haelfte darueber und die Haelfte
 * darunter liegt, und er interessiert sich nicht fuer Ausreisser.
 *
 * Gebraucht wird das fuer die Frage, die ohne "Kur?" niemand mehr direkt
 * stellt: Welche der offenen Buchungen werden voraussichtlich noch HEUTE
 * finalisiert?
 */
function goMedianFinalizationLatency(bookings = []) {
  const samples = (Array.isArray(bookings) ? bookings : [])
    .filter((booking) => normalizeGoBookingStatus(booking?.status) === "finalized")
    .map((booking) => toGoMillis(booking?.finalizedAt) - toGoMillis(booking?.acceptedAt))
    .filter((delta) => Number.isFinite(delta) && delta > 0)
    .sort((a, b) => a - b);

  if (!samples.length) return { medianMs: 0, sampleSize: 0 };
  const middle = Math.floor(samples.length / 2);
  return {
    medianMs: samples.length % 2
      ? samples[middle]
      : Math.round((samples[middle - 1] + samples[middle]) / 2),
    sampleSize: samples.length
  };
}

/**
 * Was von den offenen Buchungen voraussichtlich noch kommt, in Cent.
 *
 * Jede offene Buchung wird mit ihrer Quote gewichtet - eine aktivierte
 * schwerer als eine bloss angenommene, weil ihr Gast schon im Lokal stand.
 *
 * Der Betrag je Buchung kommt von aussen (commissionFor), weil die Preisliste
 * in go-commission-core.js steht und dieses Modul rein bleiben soll. Gerechnet
 * wird mit der ANGEFRAGTEN Personenzahl: Eine bestaetigte gibt es noch nicht,
 * sonst waere die Buchung nicht offen.
 */
function goExpectedRevenueCents({
  openBookings = [],
  rates = {},
  commissionFor = () => 0
} = {}) {
  const acceptedRate = Math.min(1, Math.max(0, Number(rates.acceptedToFinalized) || 0));
  const activatedRate = Math.min(1, Math.max(0, Number(rates.activatedToFinalized) || 0));

  return Math.round((Array.isArray(openBookings) ? openBookings : []).reduce((total, booking) => {
    const status = normalizeGoBookingStatus(booking?.status);
    if (status !== "accepted" && status !== "activated") return total;
    const partySize = Math.max(1, Math.trunc(Number(booking?.partySizeRequested) || 1));
    const cents = Math.max(0, Math.trunc(Number(commissionFor(partySize, booking)) || 0));
    return total + cents * (status === "activated" ? activatedRate : acceptedRate);
  }, 0));
}

/**
 * "Pritshme" - was im Zeitraum voraussichtlich zusammenkommt.
 *
 * Zwei Teile, und nur einer davon ist geraten: das schon Verdiente steht
 * fest, der Rest ist Erwartung. Sie werden getrennt zurueckgegeben, damit
 * Heart beides zeigen kann, ohne das eine als das andere auszugeben.
 */
function buildGoForecast({ earnedCents = 0, expectedCents = 0, rates = {} } = {}) {
  const earned = Math.max(0, Math.trunc(Number(earnedCents) || 0));
  const expected = Math.max(0, Math.trunc(Number(expectedCents) || 0));
  return {
    earnedCents: earned,
    expectedOpenCents: expected,
    // Die Zahl, die oben auf der Kachel steht.
    forecastCents: earned + expected,
    rates,
    // Ab wann die Prognose fuer sich selbst spricht. Darunter ist sie im
    // Wesentlichen der Durchschnitt aller Lokale, und Heart sollte das sagen
    // duerfen, statt eine Zahl hinzustellen, die nach Messung aussieht.
    confident: Math.max(0, Math.trunc(Number(rates.sampleSize) || 0)) >= GO_FORECAST_SHRINKAGE
  };
}

module.exports = {
  GO_FORECAST_SHRINKAGE,
  GO_FORECAST_FALLBACK,
  smoothGoRate,
  goFinalizationRates,
  goMedianFinalizationLatency,
  goExpectedRevenueCents,
  buildGoForecast
};
