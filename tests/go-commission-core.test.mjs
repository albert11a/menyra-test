import assert from "node:assert/strict";
import test from "node:test";

import {
  GO_COMMISSION_CURRENCY,
  GO_COMMISSION_VERSION,
  formatGoCommission,
  goCommissionCents,
  isGoCommissionVersion,
  resolveGoCommission,
  resolveGoCommissionVersion,
  sumGoCommissionCents
} from "../shared/go/go-commission-core.js";

// ===========================================================================
// Die Preisliste.
//
// Das ist der einzige Ort, an dem eine Zahl zu Geld wird - und die einzige
// Stelle in GO, an der ein Fehler eine Rechnung falsch macht statt nur eine
// Anzeige. Deshalb steht hier die ganze Tabelle noch einmal, von Hand
// geschrieben: Ein Test, der dieselbe Schleife wie der Code benutzt, prueft
// nur, dass der Code sich selbst gleicht.
// ===========================================================================

const TABLE = [
  [1, 10],
  [2, 50],
  [3, 100],
  [4, 150],
  [5, 200],
  [6, 250],
  [7, 300],
  [8, 350],
  [9, 400],
  [10, 450]
];

test("every party size costs exactly what the price list says", () => {
  TABLE.forEach(([partySize, cents]) => {
    assert.equal(goCommissionCents(partySize), cents, `${partySize} Personen`);
  });
});

test("the step is fifty cents from two people on", () => {
  // Ein Wirt, der nachrechnet, soll einen Schritt sehen und keine Kurve.
  for (let index = 2; index < TABLE.length; index += 1) {
    assert.equal(
      TABLE[index][1] - TABLE[index - 1][1],
      50,
      `${TABLE[index - 1][0]} -> ${TABLE[index][0]}`
    );
  }
});

test("a party size outside the range falls back into it", () => {
  // Null oder minus zwei Personen gibt es nicht; mehr als zehn nimmt GO
  // ohnehin nicht an. Beides darf keine Rechnung ueber null ergeben.
  assert.equal(goCommissionCents(0), 10);
  assert.equal(goCommissionCents(-5), 10);
  assert.equal(goCommissionCents(999), 450);
  assert.equal(goCommissionCents("drei"), 10);
});

test("the frozen version decides, not the current one", () => {
  assert.equal(isGoCommissionVersion(GO_COMMISSION_VERSION), true);
  assert.equal(isGoCommissionVersion("1999-01"), false);
  // Eine unbekannte Fassung faellt auf die geltende zurueck - und sagt es.
  assert.equal(resolveGoCommissionVersion("1999-01"), GO_COMMISSION_VERSION);
  assert.equal(resolveGoCommissionVersion(""), GO_COMMISSION_VERSION);
});

test("a resolved item carries everything needed to recheck the bill", () => {
  const item = resolveGoCommission({ partySize: 4, version: GO_COMMISSION_VERSION });
  assert.deepEqual(item, {
    version: GO_COMMISSION_VERSION,
    currency: GO_COMMISSION_CURRENCY,
    partySize: 4,
    amountCents: 150
  });
});

test("cents become a sentence a human reads", () => {
  assert.equal(formatGoCommission(10), "0,10 €");
  assert.equal(formatGoCommission(150), "1,50 €");
  assert.equal(formatGoCommission(450), "4,50 €");
  assert.equal(formatGoCommission(0), "0,00 €");
  assert.equal(formatGoCommission(1005), "10,05 €");
  // Kein Cent verschwindet hinter einem Rundungsfehler.
  assert.equal(formatGoCommission(99), "0,99 €");
});

test("a day is summed in cents, never in euros", () => {
  // Genau der Fall, an dem Gleitkommazahlen scheitern: 0,10 + 0,20 ist dort
  // nicht 0,30. In Cent ist es 30.
  assert.equal(sumGoCommissionCents([{ amountCents: 10 }, { amountCents: 20 }]), 30);
  assert.equal(sumGoCommissionCents([10, 20, 450]), 480);
  assert.equal(sumGoCommissionCents([]), 0);
  // Was kein Betrag ist, zaehlt nicht mit.
  assert.equal(sumGoCommissionCents([{ amountCents: -5 }, { amountCents: "x" }, 10]), 10);
});

test("three confirmed groups of four cost what they should", () => {
  const day = [4, 4, 4].map((partySize) => resolveGoCommission({ partySize }));
  assert.equal(sumGoCommissionCents(day), 450);
  assert.equal(formatGoCommission(sumGoCommissionCents(day)), "4,50 €");
});
