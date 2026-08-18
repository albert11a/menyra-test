import assert from "node:assert/strict";
import test from "node:test";

import {
  GO_LEDGER_KIND,
  allocateGoPaymentFifo,
  buildGoAllocationEntry,
  buildGoChargeEntry,
  buildGoLedgerHistory,
  buildGoPaymentEntry,
  buildGoReversalEntry,
  normalizeGoPaymentMethod,
  sumGoLedgerBalance
} from "../shared/go/go-ledger-core.js";

// ===========================================================================
// Das Finanzbuch. Vier Arten von Zeilen, und keine wird je geaendert.
//
// Die Faelle hier sind die aus dem Konzept: Vollzahlung, Teilzahlung, FIFO
// ueber drei Tage, und die Frage, was "Hapur" und "Barazuar" eigentlich
// heissen.
// ===========================================================================

const DAY = "2026-08-13";

function charge(id, amountCents, createdAt, allocatedCents = 0) {
  return { id, bookingId: `bk-${id}`, amountCents, allocatedCents, createdAt };
}

test("a charge carries the booking it came from, and the price list it used", () => {
  const entry = buildGoChargeEntry({
    restaurantId: "rest-1",
    bookingId: "bk-1",
    amountCents: 150,
    commissionVersion: "2026-08",
    partySize: 4,
    dayKey: DAY,
    nowMs: Date.parse("2026-08-13T18:00:00.000Z")
  });
  assert.equal(entry.kind, GO_LEDGER_KIND.charge);
  assert.equal(entry.amountCents, 150);
  assert.equal(entry.bookingId, "bk-1");
  // Wer die Zeile in einem Jahr nachrechnet, braucht nichts weiter zu wissen.
  assert.equal(entry.commissionVersion, "2026-08");
  assert.equal(entry.partySize, 4);
  assert.equal(entry.currency, "EUR");
});

test("a payment stands for itself, with a method and a name on it", () => {
  const entry = buildGoPaymentEntry({
    restaurantId: "rest-1",
    amountCents: 2350,
    method: "Cash",
    actorUid: "heart-1",
    note: "marrë në lokal"
  });
  assert.equal(entry.kind, GO_LEDGER_KIND.payment);
  assert.equal(entry.amountCents, 2350);
  // Bargeld ohne Namen ist eine Zahlung, die niemand bestaetigen kann.
  assert.equal(entry.actorUid, "heart-1");
  assert.equal(entry.method, "cash");
  assert.equal(normalizeGoPaymentMethod("Bankë"), "other");
  assert.equal(normalizeGoPaymentMethod("bank"), "bank");
});

// ===========================================================================
// Punkt 50 und 51: ganz bezahlt, halb bezahlt.
// ===========================================================================

test("paying everything leaves nothing open", () => {
  const result = allocateGoPaymentFifo({
    openCharges: [charge("c1", 2350, "2026-08-13T18:00:00.000Z")],
    amountCents: 2350
  });
  assert.equal(result.allocatedCents, 2350);
  assert.equal(result.remainderCents, 0);
  assert.equal(result.allocations.length, 1);
  assert.equal(result.allocations[0].settlesCharge, true);
});

test("paying part of it leaves the rest open, not the whole", () => {
  const result = allocateGoPaymentFifo({
    openCharges: [charge("c1", 2350, "2026-08-13T18:00:00.000Z")],
    amountCents: 1500
  });
  assert.equal(result.allocatedCents, 1500);
  assert.equal(result.allocations[0].amountCents, 1500);
  // Die Gebuehr ist angezahlt, nicht ausgeglichen.
  assert.equal(result.allocations[0].settlesCharge, false);
});

test("a second payment finishes what the first one started", () => {
  const partly = [charge("c1", 2350, "2026-08-13T18:00:00.000Z", 1500)];
  const result = allocateGoPaymentFifo({ openCharges: partly, amountCents: 850 });
  assert.equal(result.allocatedCents, 850);
  assert.equal(result.allocations[0].settlesCharge, true);
});

// ===========================================================================
// Punkt 52: die aeltesten zuerst.
// ===========================================================================

test("five euros walk through three days, oldest first", () => {
  // Das Beispiel aus dem Konzept: 1 € am 12., 3 € am 13., 4 € am 14.
  const result = allocateGoPaymentFifo({
    openCharges: [
      charge("c3", 400, "2026-08-14T10:00:00.000Z"),
      charge("c1", 100, "2026-08-12T10:00:00.000Z"),
      charge("c2", 300, "2026-08-13T10:00:00.000Z")
    ],
    amountCents: 500
  });
  assert.deepEqual(
    result.allocations.map((entry) => [entry.chargeId, entry.amountCents, entry.settlesCharge]),
    [["c1", 100, true], ["c2", 300, true], ["c3", 100, false]]
  );
  assert.equal(result.remainderCents, 0);
});

test("two runs over the same book allocate the same way", () => {
  // Bei gleichem Zeitpunkt entscheidet die Kennung - sonst haengt die
  // Verteilung an der Reihenfolge, in der die Datenbank gerade antwortet.
  const charges = [
    charge("cB", 100, "2026-08-13T10:00:00.000Z"),
    charge("cA", 100, "2026-08-13T10:00:00.000Z")
  ];
  const first = allocateGoPaymentFifo({ openCharges: charges, amountCents: 100 });
  const second = allocateGoPaymentFifo({ openCharges: [...charges].reverse(), amountCents: 100 });
  assert.equal(first.allocations[0].chargeId, "cA");
  assert.deepEqual(first.allocations, second.allocations);
});

test("overpaying keeps the surplus instead of swallowing it", () => {
  const result = allocateGoPaymentFifo({
    openCharges: [charge("c1", 100, "2026-08-12T10:00:00.000Z")],
    amountCents: 500
  });
  assert.equal(result.allocatedCents, 100);
  // Eine Zahlung stillschweigend zu kuerzen waere die schlechtere Antwort.
  assert.equal(result.remainderCents, 400);
});

test("a charge that is already settled takes nothing more", () => {
  const result = allocateGoPaymentFifo({
    openCharges: [charge("c1", 100, "2026-08-12T10:00:00.000Z", 100)],
    amountCents: 500
  });
  assert.deepEqual(result.allocations, []);
  assert.equal(result.remainderCents, 500);
});

// ===========================================================================
// Punkt 38, 39, 54: was Hapur und Barazuar heissen.
// ===========================================================================

test("the balance is summed from the book, never stored beside it", () => {
  const book = [
    { id: "c1", kind: "charge", amountCents: 1000 },
    { id: "c2", kind: "charge", amountCents: 1350 },
    { id: "p1", kind: "payment", amountCents: 1500 },
    { id: "a1", kind: "allocation", amountCents: 1000 },
    { id: "a2", kind: "allocation", amountCents: 500 }
  ];
  const balance = sumGoLedgerBalance(book);
  assert.equal(balance.chargedCents, 2350);
  assert.equal(balance.paidCents, 1500);
  assert.equal(balance.settledCents, 1500);
  assert.equal(balance.openCents, 850);
  assert.equal(balance.chargeCount, 2);
});

test("an overpayment is a credit, never a negative open amount", () => {
  const balance = sumGoLedgerBalance([
    { id: "c1", kind: "charge", amountCents: 100 },
    { id: "p1", kind: "payment", amountCents: 500 },
    { id: "a1", kind: "allocation", amountCents: 100 }
  ]);
  assert.equal(balance.openCents, 0);
  assert.equal(balance.creditCents, 400);
});

test("nothing is settled when nothing was paid", () => {
  const balance = sumGoLedgerBalance([
    { id: "c1", kind: "charge", amountCents: 150 },
    { id: "c2", kind: "charge", amountCents: 200 }
  ]);
  assert.equal(balance.openCents, 350);
  assert.equal(balance.settledCents, 0);
});

// ===========================================================================
// Regel 14 und 19: nichts wird geloescht.
// ===========================================================================

test("a reversal cancels a line without removing it", () => {
  const reversal = buildGoReversalEntry({
    restaurantId: "rest-1",
    targetId: "p1",
    targetKind: "payment",
    amountCents: 1500,
    reason: "gabim",
    actorUid: "heart-1"
  });
  assert.equal(reversal.kind, GO_LEDGER_KIND.reversal);
  assert.equal(reversal.targetId, "p1");

  const book = [
    { id: "c1", kind: "charge", amountCents: 2350 },
    { id: "p1", kind: "payment", amountCents: 1500 },
    { id: "a1", kind: "allocation", amountCents: 1500 },
    { ...reversal, id: "r1" },
    // Die Zuordnung der zurueckgenommenen Zahlung wird ebenfalls
    // zurueckgenommen - sonst bliebe eine Gebuehr gedeckt, deren Geld weg ist.
    { id: "r2", kind: "reversal", targetId: "a1", amountCents: 1500 }
  ];
  const balance = sumGoLedgerBalance(book);
  // Das Geld ist wieder offen, und die Zeilen stehen alle noch da.
  assert.equal(balance.openCents, 2350);
  assert.equal(balance.paidCents, 0);
  assert.equal(book.length, 5);
});

test("the history reads as a running account, allocations stay out of it", () => {
  const history = buildGoLedgerHistory([
    { id: "c1", kind: "charge", amountCents: 350, createdAt: "2026-08-17T10:00:00.000Z", bookingId: "bk-1" },
    { id: "c2", kind: "charge", amountCents: 200, createdAt: "2026-08-16T10:00:00.000Z", bookingId: "bk-2" },
    { id: "p1", kind: "payment", amountCents: 2000, createdAt: "2026-08-15T10:00:00.000Z", method: "cash" },
    // Buchhaltung zwischen zwei Zeilen, die beide schon dastehen.
    { id: "a1", kind: "allocation", amountCents: 200, createdAt: "2026-08-15T10:00:00.000Z" }
  ]);
  assert.equal(history.length, 3);
  // Neueste zuerst - so liest man einen Kontoauszug.
  assert.deepEqual(history.map((entry) => entry.id), ["c1", "c2", "p1"]);
  // Eine Gebuehr erhoeht die Schuld, eine Zahlung senkt sie.
  assert.equal(history[0].signedCents, 350);
  assert.equal(history[2].signedCents, -2000);
  assert.equal(history[2].method, "cash");
});

test("an allocation names both sides, because neither alone is enough", () => {
  // Eine Zahlung deckt mehrere Gebuehren, und eine Gebuehr kann von mehreren
  // Zahlungen gedeckt werden. Ein Feld koennte immer nur eine Seite halten.
  const entry = buildGoAllocationEntry({
    restaurantId: "rest-1",
    paymentId: "p1",
    chargeId: "c1",
    bookingId: "bk-1",
    amountCents: 150
  });
  assert.equal(entry.paymentId, "p1");
  assert.equal(entry.chargeId, "c1");
  assert.equal(entry.bookingId, "bk-1");
  assert.equal(entry.amountCents, 150);
});

test("money is whole cents everywhere, never a comma number", () => {
  assert.equal(buildGoChargeEntry({ amountCents: 1.5 }).amountCents, 1);
  assert.equal(buildGoPaymentEntry({ amountCents: -50 }).amountCents, 0);
  assert.equal(buildGoPaymentEntry({ amountCents: "nichts" }).amountCents, 0);
});
