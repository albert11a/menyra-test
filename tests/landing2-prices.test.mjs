import test from "node:test";
import assert from "node:assert/strict";

import {
  GO_COMMISSION_VERSION,
  goCommissionCents
} from "../shared/go/go-commission-core.js";
import {
  LANDING2_GO_COMMISSION_CENTS,
  LANDING2_GO_COMMISSION_VERSION,
  LANDING2_ORDER_CENTS_PER_ITEM,
  goPriceRows
} from "../apps/menyra-social/lead-landing-2/landing2-prices.js";
import { formatCents } from "../apps/menyra-social/lead-landing-2/landing2-format.js";

// Eine Verkaufsseite darf an genau einer Stelle nicht ungefaehr sein: beim
// Preis. Landing 2 importiert nichts aus /shared/ (die Isolation ist der
// Grund), also steht die GO-Tabelle dort abgeschrieben. Dieser Test ist die
// Klammer um die beiden Fassungen: Wer die echte Tabelle aendert und die
// Seite vergisst, faellt hier auf - nicht beim Wirt.

test("die GO-Tabelle von Landing 2 ist die echte", () => {
  assert.equal(
    LANDING2_GO_COMMISSION_VERSION,
    GO_COMMISSION_VERSION,
    "Landing 2 zeigt eine andere Preisfassung als shared/go/go-commission-core.js"
  );

  LANDING2_GO_COMMISSION_CENTS.forEach((cents, index) => {
    const partySize = index + 1;
    assert.equal(
      cents,
      goCommissionCents(partySize, GO_COMMISSION_VERSION),
      `Der Preis fuer ${partySize} Person(en) weicht ab`
    );
  });
});

test("Preise sind ganze Cent", () => {
  // Wer Geld in Kommazahlen rechnet, zeigt irgendwann 1.4999999999999998 €.
  LANDING2_GO_COMMISSION_CENTS.forEach((cents) => {
    assert.ok(Number.isInteger(cents), `${cents} ist keine ganze Zahl`);
  });
  assert.ok(Number.isInteger(LANDING2_ORDER_CENTS_PER_ITEM));
});

test("die Zeilen der GO-Tabelle stimmen mit der Tabelle ueberein", () => {
  const rows = goPriceRows((cents) => formatCents(cents, "EUR"));
  assert.ok(rows.length >= 3, "eine Preistabelle mit weniger als drei Zeilen zeigt keine Regel");
  assert.deepEqual(rows[0], { label: "1 person", price: "0,10 €" });
  assert.deepEqual(rows[1], { label: "2 persona", price: "0,50 €" });
});

test("der Order-Preis wird als 0,02 € gezeigt", () => {
  assert.equal(formatCents(LANDING2_ORDER_CENTS_PER_ITEM, "EUR"), "0,02 €");
});

test("Betraege werden aus ganzen Cent gerechnet, nicht aus Kommazahlen", () => {
  assert.equal(formatCents(450, "EUR"), "4,50 €");
  assert.equal(formatCents(0, "EUR"), "0,00 €");
  assert.equal(formatCents(null, "EUR"), "");
});
