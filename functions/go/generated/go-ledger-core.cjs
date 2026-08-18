"use strict";

// Generated from ../../../shared/go/go-ledger-core.js. Do not edit manually.
// Run: node functions/scripts/sync-go-shared.cjs

// Mnyra GO - das Finanzbuch. Pur.
//
// Bis hierher gab es eine einzige finanzielle Wahrheit: ein Feld `commission`
// an der Buchung, mit einem Zustand "pending" oder "settled". Es hat nie
// jemand auf "settled" gesetzt, und das war kein Versehen - es ging gar nicht.
// Ein Haekchen sagt "bezahlt", aber nicht WANN, nicht ZU WELCHEM BETRAG und
// nicht ZUSAMMEN MIT WELCHEN. Genau das braucht man aber, wenn ein Lokal in
// drei Monaten fragt, wofuer es bezahlt hat.
//
// Also ein Buch statt eines Haekchens. Vier Arten von Zeilen, und keine wird
// je geaendert oder geloescht:
//
//   charge      Eine Gebuehr ist entstanden. Mit der Finalisierung.
//   payment     Geld ist eingegangen.
//   allocation  Diese Zahlung deckt diese Gebuehr - ganz oder zum Teil.
//   reversal    Etwas wird zurueckgenommen. Als eigene Zeile.
//
// Drei Regeln stehen darueber:
//
//  1. GANZE CENT. Wie in go-commission-core.js, und aus demselben Grund:
//     0.1 + 0.2 ist in JavaScript nicht 0.3.
//
//  2. NICHTS WIRD UEBERSCHRIEBEN. Eine falsche Zahlung wird durch eine
//     Ruecknahme ausgeglichen, nicht durch das Entfernen der Zeile. Sonst kann
//     in drei Monaten niemand mehr sagen, was passiert ist (Punkt 53).
//
//  3. DER SALDO WIRD GERECHNET, NICHT GESPEICHERT. "Hapur" und "Barazuar"
//     sind Summen ueber dieses Buch. Stuenden sie zusaetzlich irgendwo als
//     Zahl, gaebe es zwei Antworten auf dieselbe Frage - und irgendwann
//     widersprechen sie sich.

const GO_LEDGER_COLLECTION = "goLedger";

const GO_LEDGER_KIND = Object.freeze({
  charge: "charge",
  payment: "payment",
  allocation: "allocation",
  reversal: "reversal"
});

// Wie ein Lokal bezahlt hat. Es steht am Beleg, weil die Frage "wie kam das
// Geld herein" spaeter niemand mehr aus dem Kopf beantwortet.
const GO_PAYMENT_METHODS = Object.freeze(["cash", "bank", "other"]);

function normalizeGoPaymentMethod(value = "") {
  const key = String(value || "").trim().toLowerCase();
  return GO_PAYMENT_METHODS.includes(key) ? key : "other";
}

function cents(value) {
  const parsed = Math.trunc(Number(value) || 0);
  return parsed > 0 ? parsed : 0;
}

function text(value, maxLength = 180) {
  return String(value === null || value === undefined ? "" : value).trim().slice(0, maxLength);
}

function stamp(nowMs, serverTimestamp) {
  return serverTimestamp || new Date(Number(nowMs) || Date.now()).toISOString();
}

/**
 * Eine entstandene Gebuehr.
 *
 * Sie traegt die Buchung mit, aus der sie stammt - nicht als Verweis, den
 * jemand aufloesen muesste, sondern damit man von der Rechnung zurueck zu
 * genau einem Gast kommt.
 */
function buildGoChargeEntry({
  restaurantId = "",
  bookingId = "",
  amountCents = 0,
  commissionVersion = "",
  partySize = 0,
  dayKey = "",
  nowMs = Date.now(),
  serverTimestamp = null
} = {}) {
  return {
    kind: GO_LEDGER_KIND.charge,
    restaurantId: text(restaurantId),
    bookingId: text(bookingId),
    amountCents: cents(amountCents),
    currency: "EUR",
    // Nach welcher Preisliste gerechnet wurde. Wer die Zeile in einem Jahr
    // nachrechnet, braucht dafuer nichts weiter zu wissen als das, was hier
    // steht.
    commissionVersion: text(commissionVersion, 40),
    partySize: Math.max(0, Math.trunc(Number(partySize) || 0)),
    dayKey: text(dayKey, 10),
    createdAt: stamp(nowMs, serverTimestamp)
  };
}

/**
 * Eine eingegangene Zahlung.
 *
 * Sie steht fuer sich und nicht an einer Gebuehr: Ein Lokal zahlt einen
 * Betrag, keine Liste von Buchungen. Welche Gebuehren davon gedeckt sind,
 * entscheidet die Verteilung darunter - und die ist ihre eigene Zeile.
 */
function buildGoPaymentEntry({
  restaurantId = "",
  amountCents = 0,
  method = "other",
  actorUid = "",
  note = "",
  nowMs = Date.now(),
  serverTimestamp = null
} = {}) {
  return {
    kind: GO_LEDGER_KIND.payment,
    restaurantId: text(restaurantId),
    amountCents: cents(amountCents),
    currency: "EUR",
    method: normalizeGoPaymentMethod(method),
    // Wer sie entgegengenommen hat. Bargeld ohne Namen ist eine Zahlung, die
    // niemand bestaetigen kann.
    actorUid: text(actorUid),
    note: text(note, 240),
    createdAt: stamp(nowMs, serverTimestamp)
  };
}

/**
 * Eine Zuordnung: dieser Teil dieser Zahlung deckt diese Gebuehr.
 *
 * Sie ist eine eigene Zeile und kein Feld an der Gebuehr, weil eine Zahlung
 * mehrere Gebuehren deckt und eine Gebuehr von mehreren Zahlungen gedeckt
 * werden kann. Ein Feld koennte immer nur eine Seite davon festhalten.
 */
function buildGoAllocationEntry({
  restaurantId = "",
  paymentId = "",
  chargeId = "",
  bookingId = "",
  amountCents = 0,
  nowMs = Date.now(),
  serverTimestamp = null
} = {}) {
  return {
    kind: GO_LEDGER_KIND.allocation,
    restaurantId: text(restaurantId),
    paymentId: text(paymentId),
    chargeId: text(chargeId),
    bookingId: text(bookingId),
    amountCents: cents(amountCents),
    currency: "EUR",
    createdAt: stamp(nowMs, serverTimestamp)
  };
}

/**
 * Eine Ruecknahme.
 *
 * Sie loescht nichts. Sie steht daneben und sagt, dass eine fruehere Zeile
 * nicht gelten soll - mit einem Grund und einem Namen daran. Wer das Buch
 * spaeter liest, sieht beides: was passiert ist, und dass es zurueckgenommen
 * wurde.
 */
function buildGoReversalEntry({
  restaurantId = "",
  targetId = "",
  targetKind = "",
  amountCents = 0,
  reason = "",
  actorUid = "",
  nowMs = Date.now(),
  serverTimestamp = null
} = {}) {
  return {
    kind: GO_LEDGER_KIND.reversal,
    restaurantId: text(restaurantId),
    targetId: text(targetId),
    targetKind: text(targetKind, 20),
    amountCents: cents(amountCents),
    currency: "EUR",
    reason: text(reason, 240),
    actorUid: text(actorUid),
    createdAt: stamp(nowMs, serverTimestamp)
  };
}

/**
 * Eine Zahlung auf die offenen Gebuehren verteilen - aelteste zuerst.
 *
 * FIFO und nicht "der Wirt sucht sich aus, was er bezahlt" (Punkt 52). Der
 * Grund ist nicht Bequemlichkeit: Wer aussuchen darf, laesst die aeltesten
 * Posten liegen, und dann steht nach einem Jahr eine Gebuehr von 1,50 Euro aus
 * dem Januar in einem Buch, das sonst aktuell ist.
 *
 * Bleibt Geld uebrig - ein Lokal zahlt mehr, als offen ist -, steht das im
 * Ergebnis als `remainderCents`. Es verschwindet nicht: Der Aufrufer schreibt
 * die Zahlung trotzdem, und der Ueberschuss steht beim naechsten Mal zur
 * Verfuegung. Eine Zahlung stillschweigend zu kuerzen waere die schlechtere
 * Antwort.
 *
 * @param {Array} openCharges  { id, bookingId, amountCents, allocatedCents, createdAt }
 */
function allocateGoPaymentFifo({ openCharges = [], amountCents = 0 } = {}) {
  let left = cents(amountCents);
  const allocations = [];

  const sorted = (Array.isArray(openCharges) ? openCharges : [])
    .map((charge) => ({
      id: text(charge?.id),
      bookingId: text(charge?.bookingId),
      openCents: Math.max(0, cents(charge?.amountCents) - cents(charge?.allocatedCents)),
      createdAt: String(charge?.createdAt || "")
    }))
    .filter((charge) => charge.id && charge.openCents > 0)
    // Aelteste zuerst; bei gleichem Zeitpunkt entscheidet die Kennung, damit
    // zwei Laeufe ueber dieselben Daten dieselbe Verteilung ergeben.
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt) || a.id.localeCompare(b.id));

  sorted.forEach((charge) => {
    if (left <= 0) return;
    const take = Math.min(left, charge.openCents);
    left -= take;
    allocations.push({
      chargeId: charge.id,
      bookingId: charge.bookingId,
      amountCents: take,
      // Deckt diese Zuordnung die Gebuehr vollstaendig? Der Aufrufer schreibt
      // danach den Zustand an der Buchung fort - "settled" ist eine Antwort
      // auf diese Frage und keine eigene Wahrheit.
      settlesCharge: take === charge.openCents
    });
  });

  return {
    allocations,
    allocatedCents: cents(amountCents) - left,
    remainderCents: left
  };
}

/**
 * Was offen ist und was ausgeglichen wurde.
 *
 * Gerechnet aus dem ganzen Buch, nicht aus einem gespeicherten Saldo. Das ist
 * der Punkt der Uebung: Business und Heart lesen dieselben Zeilen und kommen
 * deshalb auf dieselbe Zahl (Punkt 54, Regel 13).
 *
 * Ruecknahmen zaehlen mit ihrem Vorzeichen: Eine zurueckgenommene Zahlung
 * macht den Betrag wieder offen, eine zurueckgenommene Gebuehr laesst ihn
 * verschwinden.
 */
function sumGoLedgerBalance(entries = []) {
  const list = Array.isArray(entries) ? entries : [];
  const reversedIds = new Set(
    list
      .filter((entry) => entry?.kind === GO_LEDGER_KIND.reversal)
      .map((entry) => text(entry?.targetId))
      .filter(Boolean)
  );

  let chargedCents = 0;
  let paidCents = 0;
  let allocatedCents = 0;
  let chargeCount = 0;

  list.forEach((entry) => {
    if (!entry || reversedIds.has(text(entry.id))) return;
    const amount = cents(entry.amountCents);
    if (entry.kind === GO_LEDGER_KIND.charge) {
      chargedCents += amount;
      chargeCount += 1;
      return;
    }
    if (entry.kind === GO_LEDGER_KIND.payment) {
      paidCents += amount;
      return;
    }
    if (entry.kind === GO_LEDGER_KIND.allocation) allocatedCents += amount;
  });

  return {
    chargedCents,
    paidCents,
    // Barazuar: was von den Gebuehren wirklich gedeckt ist. Nicht dasselbe wie
    // "eingegangen" - ein Lokal kann mehr gezahlt haben, als offen war.
    settledCents: Math.min(allocatedCents, chargedCents),
    // Hapur: was noch aussteht. Nie negativ - eine Ueberzahlung ist kein
    // negativer offener Betrag, sie ist ein Guthaben.
    openCents: Math.max(0, chargedCents - allocatedCents),
    creditCents: Math.max(0, paidCents - allocatedCents),
    chargeCount
  };
}

/**
 * Der Verlauf, wie ihn das Lokal unter "Pagesat" liest.
 *
 * Gebuehren mit Plus, Zahlungen mit Minus - aus der Sicht dessen, der etwas
 * schuldet. Zuordnungen stehen nicht darin: Sie sind Buchhaltung zwischen zwei
 * Zeilen, die beide schon dastehen, und wuerden den Verlauf verdoppeln.
 */
function buildGoLedgerHistory(entries = [], { limit = 60 } = {}) {
  return (Array.isArray(entries) ? entries : [])
    .filter((entry) => entry?.kind === GO_LEDGER_KIND.charge
      || entry?.kind === GO_LEDGER_KIND.payment
      || entry?.kind === GO_LEDGER_KIND.reversal)
    .map((entry) => ({
      id: text(entry.id),
      kind: entry.kind,
      // Eine Gebuehr erhoeht die Schuld, eine Zahlung senkt sie.
      signedCents: entry.kind === GO_LEDGER_KIND.charge
        ? cents(entry.amountCents)
        : -cents(entry.amountCents),
      createdAt: String(entry.createdAt || ""),
      method: entry.kind === GO_LEDGER_KIND.payment ? normalizeGoPaymentMethod(entry.method) : "",
      bookingId: text(entry.bookingId)
    }))
    .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)))
    .slice(0, Math.max(1, Math.trunc(Number(limit) || 60)));
}

module.exports = {
  GO_LEDGER_COLLECTION,
  GO_LEDGER_KIND,
  GO_PAYMENT_METHODS,
  normalizeGoPaymentMethod,
  buildGoChargeEntry,
  buildGoPaymentEntry,
  buildGoAllocationEntry,
  buildGoReversalEntry,
  allocateGoPaymentFifo,
  sumGoLedgerBalance,
  buildGoLedgerHistory
};
