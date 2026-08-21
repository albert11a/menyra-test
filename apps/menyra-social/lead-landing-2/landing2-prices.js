// Die Preise, die Landing 2 zeigt.
//
// Eine Verkaufsseite darf an genau einer Stelle nicht ungefaehr sein: beim
// Preis. Wer beim ersten Preis merkt, dass er nicht stimmt, glaubt der Seite
// auch die kostenlosen Sachen nicht mehr.
//
// Deshalb steht hier keine geschaetzte Zahl. Die GO-Tabelle ist Zeile fuer
// Zeile dieselbe wie in shared/go/go-commission-core.js - abgeschrieben, weil
// Landing 2 nichts aus /shared/ importiert (die Isolation ist der Grund, sie
// steht in landing2-config.js). Damit die beiden nicht auseinanderlaufen,
// haelt tests/landing2-prices.test.mjs sie gegeneinander: Aendert jemand die
// echte Tabelle und diese nicht, faellt der Test.
//
// Beitraege sind ganze Cent - dieselbe Regel wie in go-commission-core.js.
// Wer Geld in Kommazahlen rechnet, zeigt irgendwann 1.4999999999999998 €.

// Mnyra GO: Was eine bestaetigte Oferta kostet, in ganzen Cent, nach
// Personenzahl. Der Platz in der Liste ist die Personenzahl minus eins.
export const LANDING2_GO_COMMISSION_VERSION = "2026-08";
export const LANDING2_GO_COMMISSION_CENTS = Object.freeze([10, 50, 100, 150, 200, 250, 300, 350, 400, 450]);

// Mnyra Order: je tatsaechlich bestelltem Produkt. Zwei Cent.
//
// Dieser Preis steht heute nirgends im Code - Order rechnet noch nicht ab.
// Er kommt aus der Produktentscheidung und steht deshalb hier an einer
// Stelle, nicht in drei Saetzen verteilt.
export const LANDING2_ORDER_CENTS_PER_ITEM = 2;

// Was kostenlos bleibt, auch wenn nichts davon aktiviert wird.
export const LANDING2_FREE_FEATURES = Object.freeze([
  "Profili",
  "Menuja",
  "Postimet",
  "Story",
  "Ofertat",
  "QR"
]);

// Die Zeilen der GO-Tabelle, wie sie auf der Seite stehen.
//
// Nicht alle zehn: Ein Wirt liest keine Preisliste mit zehn Zeilen, er sucht
// die Zeile, die zu seinem Abend passt. Vier reichen, um die Regel zu sehen -
// und die Regel ist der Punkt, nicht die einzelne Zahl.
export function goPriceRows(formatCents) {
  const pick = [1, 2, 4, 6];
  return pick.map((partySize) => ({
    label: partySize === 1 ? "1 person" : `${partySize} persona`,
    price: formatCents(LANDING2_GO_COMMISSION_CENTS[partySize - 1])
  }));
}
