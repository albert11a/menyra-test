"use strict";

// Generated from ../../../shared/go/go-commission-core.js. Do not edit manually.
// Run: node functions/scripts/sync-go-shared.cjs

// Mnyra GO - was eine bestaetigte Oferta kostet. Pur.
//
// Hier steht der einzige Ort, an dem eine Zahl zu Geld wird. Drei Regeln
// stehen ueber allem, und alle drei haben denselben Grund: An dieser Datei
// haengt eine Rechnung, und eine Rechnung muss man nachrechnen koennen.
//
//  1. GANZE CENT, NIE KOMMAZAHLEN.
//     0.1 + 0.2 ist in JavaScript nicht 0.3. Wer Geld in Gleitkommazahlen
//     rechnet, bekommt irgendwann eine Rechnung ueber 1.4999999999999998 Euro.
//     Deshalb sind alle Betraege hier ganze Cent, und aus Cent wird erst ganz
//     am Ende ein lesbarer Satz.
//
//  2. PREISE HABEN EINE FASSUNG, UND ALTE FASSUNGEN BLEIBEN STEHEN.
//     Die Fassung wird bei der Buchung eingefroren. Aendert sich die Tabelle,
//     bekommt sie einen neuen Namen und die alte bleibt hier liegen. Sonst
//     wuerde eine neue Preisliste rueckwirkend alte Rechnungen umschreiben -
//     und das waere kein Preis, sondern eine Behauptung.
//
//  3. DIE PERSONENZAHL IST DIE BESTAETIGTE.
//     Der Gast schaetzt beim Zugreifen, der Kellner sieht beim Bestaetigen die
//     Gruppe vor sich. Gerechnet wird mit dem, was beide gesehen haben.

const { GO_PARTY_SIZE_MAX, GO_PARTY_SIZE_MIN } = require("./go-feature-config.cjs");

const GO_COMMISSION_CURRENCY = "EUR";

// Die geltende Fassung. Wird die Tabelle geaendert, kommt ein neuer Schluessel
// dazu und DIESE Zeile zeigt darauf - der alte Eintrag bleibt unberuehrt.
const GO_COMMISSION_VERSION = "2026-08";

// Cent je Personenzahl. Der Platz in der Liste ist die Personenzahl minus eins.
//
// Die Reihe steigt ab zwei Personen um genau 50 Cent. Das ist Absicht: Ein
// Wirt, der nachrechnet, soll einen Schritt sehen und keine Kurve. Der erste
// Schritt ist kleiner (40), weil ein einzelner Gast fast umsonst ist - er
// soll die Oferta ausprobieren duerfen.
const GO_COMMISSION_TABLES = Object.freeze({
  "2026-08": Object.freeze([10, 50, 100, 150, 200, 250, 300, 350, 400, 450])
});

function clampPartySize(value) {
  const parsed = Math.trunc(Number(value) || 0);
  if (!Number.isFinite(parsed) || parsed < GO_PARTY_SIZE_MIN) return GO_PARTY_SIZE_MIN;
  return Math.min(GO_PARTY_SIZE_MAX, parsed);
}

function isGoCommissionVersion(value = "") {
  return Object.prototype.hasOwnProperty.call(GO_COMMISSION_TABLES, String(value || "").trim());
}

/**
 * Die Tabelle einer Fassung.
 *
 * Eine unbekannte Fassung faellt auf die geltende zurueck. Das ist die
 * freundlichere Haelfte einer unangenehmen Wahl: Eine Buchung mit einer
 * Fassung, die es hier nicht gibt, ist ein Fehler in unserem Code - und dann
 * ist ein Preis nach heutiger Liste besser als eine Rechnung ueber null.
 * Sichtbar bleibt es trotzdem, weil resolveGoCommission die tatsaechlich
 * benutzte Fassung zurueckgibt.
 */
function resolveGoCommissionVersion(version = "") {
  const key = String(version || "").trim();
  return isGoCommissionVersion(key) ? key : GO_COMMISSION_VERSION;
}

/**
 * Was eine Gruppe dieser Groesse kostet, in ganzen Cent.
 */
function goCommissionCents(partySize = 1, version = GO_COMMISSION_VERSION) {
  const table = GO_COMMISSION_TABLES[resolveGoCommissionVersion(version)];
  return table[clampPartySize(partySize) - 1] || 0;
}

/**
 * Der ganze Posten, so wie er an der Buchung eingefroren wird.
 *
 * Er traegt die Fassung mit sich. Wer die Rechnung spaeter nachrechnet,
 * braucht dafuer nichts weiter zu wissen als das, was hier steht.
 */
function resolveGoCommission({ partySize = 1, version = "" } = {}) {
  const usedVersion = resolveGoCommissionVersion(version);
  const size = clampPartySize(partySize);
  return {
    version: usedVersion,
    currency: GO_COMMISSION_CURRENCY,
    partySize: size,
    amountCents: goCommissionCents(size, usedVersion)
  };
}

/**
 * Cent als Satz, den ein Mensch liest: 150 wird "1,50 €".
 *
 * Komma statt Punkt - hier wird in Kosovo und Albanien gelesen, und dort
 * trennt das Komma.
 */
function formatGoCommission(amountCents = 0) {
  const cents = Math.max(0, Math.trunc(Number(amountCents) || 0));
  const euros = Math.trunc(cents / 100);
  const rest = String(cents % 100).padStart(2, "0");
  return `${euros},${rest} €`;
}

/**
 * Was eine Reihe von Posten zusammen ausmacht.
 *
 * Summiert wird in Cent und nur in Cent - eine Zwischensumme in Euro waere
 * genau die Stelle, an der sich ein halber Cent verliert.
 */
function sumGoCommissionCents(entries = []) {
  return (Array.isArray(entries) ? entries : []).reduce((total, entry) => {
    const cents = Math.trunc(Number(entry?.amountCents ?? entry) || 0);
    return total + (cents > 0 ? cents : 0);
  }, 0);
}

module.exports = {
  GO_COMMISSION_CURRENCY,
  GO_COMMISSION_VERSION,
  isGoCommissionVersion,
  resolveGoCommissionVersion,
  goCommissionCents,
  resolveGoCommission,
  formatGoCommission,
  sumGoCommissionCents
};
