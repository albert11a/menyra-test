"use strict";

// Generated from ../../../shared/go/go-analytics-core.js. Do not edit manually.
// Run: node functions/scripts/sync-go-shared.cjs

// Mnyra GO - was gezaehlt wird. Pur.
//
// Die Namen stehen hier und nicht im Tracker, weil sie an drei Stellen
// gebraucht werden: im Browser beim Ausloesen, im Analytics-Schema beim
// Pruefen und im Panel beim Anzeigen. Ein Name, eine Stelle.
//
// Zwei Regeln stehen ueber allem:
//
//  1. Zaehlen darf nie eine Buchung aufhalten (Spezifikation Punkt 115). Jeder
//     dieser Aufrufe ist beilaeufig; faellt er aus, faellt nur die Zahl aus.
//
//  2. Kein erfundener Umsatz (Punkt 117). Wenn der Gast nicht ueber Mnyra
//     bestellt hat, gibt es keinen Umsatz zu berichten - dann stehen dort
//     bestaetigte Gaeste, und sonst nichts.

const GO_ANALYTICS_EVENTS = Object.freeze([
  "go_card_view",
  "go_open",
  "go_search",
  "go_results",
  "go_offer_view",
  "go_offer_accept",
  "go_booking_created",
  "go_cancel",
  // Der Wisch des Gastes und die Finalisierung durch das Lokal sind zwei
  // verschiedene Ereignisse - und nur das zweite kostet etwas. Frueher stand
  // hier "go_checkin" und "go_completed" fuer einen Vorgang, den es so nicht
  // mehr gibt.
  "go_activated",
  "go_finalized",
  "go_expired",
  "go_offer_created",
  "go_offer_paused"
]);

const GO_EVENT_SET = new Set(GO_ANALYTICS_EVENTS);

function isGoAnalyticsEvent(name = "") {
  return GO_EVENT_SET.has(String(name || "").trim());
}

function num(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? Math.trunc(parsed) : 0;
}

/**
 * Die GO-Zeile im Business-Analytics.
 *
 * Umsatz erscheint nur, wenn er wirklich gemessen wurde - also wenn der Gast
 * ueber die QR-Bestellung von Mnyra bezahlt hat. Sonst bleibt das Feld leer
 * und die Zeile darunter sagt, was tatsaechlich bekannt ist: wieviele Gaeste
 * bestaetigt eingecheckt haben.
 */
function buildGoBusinessSummary(counters = {}) {
  const source = counters && typeof counters === "object" ? counters : {};
  const checkedIn = num(source.finalized ?? source.checkedIn);
  const guests = num(source.guests);
  const measuredRevenueCents = num(source.measuredRevenueCents);
  return {
    matchedSearches: num(source.matchedSearches),
    impressions: num(source.impressions),
    accepted: num(source.accepted),
    checkedIn,
    guests,
    cancelledByUser: num(source.cancelledByUser),
    cancelledByBusiness: num(source.cancelledByBusiness),
    // Nur was durch eine Mnyra-Bestellung belegt ist.
    measuredRevenueCents,
    hasMeasuredRevenue: measuredRevenueCents > 0,
    verifiedGuestsLabel: guests > 0 ? `${guests} vizitorë të verifikuar` : "",
    conversionPercent: (() => {
      const shown = num(source.impressions);
      if (!shown) return 0;
      return Math.round((num(source.accepted) / shown) * 1000) / 10;
    })()
  };
}

module.exports = {
  GO_ANALYTICS_EVENTS,
  isGoAnalyticsEvent,
  buildGoBusinessSummary
};
