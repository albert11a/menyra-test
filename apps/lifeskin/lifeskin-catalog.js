// Preise, Produkte und Texte an einer Stelle.
//
// Das hier ist die Fassung, mit der gebaut und getestet wird. Im Betrieb
// ueberschreibt sie der CEO-Bereich aus Firestore (lifeskin/{tenant}/config
// und /products) - deshalb hat jede Angabe hier denselben Aufbau wie das
// Firestore-Dokument. Wer nichts pflegt, bekommt diese Werte; wer pflegt,
// bekommt seine eigenen.
//
// Die Einzelpreise sind der Anker: Sie stehen im Angebot ueber dem Setpreis
// und muessen echt sein - sie tauchen auch in der Produktansicht auf.

// Die Altersgruppen zum Antippen.
//
// Standen frueher im Regelwerk, weil sie den Befund gewichteten. Das
// Regelwerk gibt es nicht mehr - die Gruppen bleiben, weil Dr. Gashi sie
// im Fall sehen will.
export const ALTERSGRUPPEN = Object.freeze(["18-24", "25-34", "35-44", "45-54", "55+"]);

export const STANDARD_KONFIG = Object.freeze({
  tenantId: "lifeskin",
  waehrung: "EUR",
  // 53 EUR. Stand hier auf 43 - das war der Preis aus dem ersten Gespraech
  // und ist seither ueberholt. Der Trichter haette zehn Euro je Set
  // verschenkt, ohne dass es irgendwo aufgefallen waere.
  // tests/lifeskin-zaehlung.test.mjs haelt ihn mit dem Bericht zusammen.
  setPreis: 53,
  setGroesse: 2,
  // Reichweite des Sets. 30 ml je Produkt reichen rund vier Wochen - daraus
  // faellt die Tagesrechnung im Angebot. Wird hier geaendert, aendert sich
  // der angezeigte Tagespreis mit; er wird nirgends von Hand geschrieben.
  reichweiteTage: 28,
  versandKosten: 0,
  zahlarten: ["nachnahme"],
  lieferzeitTage: [2, 3],
  rueckgabeTage: 30,
  sprache: "sq",
  // Wie lange die Ladeanzeige der Analyse laeuft.
  //
  // Kuerzer als frueher, und zwar aus einem Grund: Die sichtbare Arbeit
  // passiert inzwischen waehrend der Aufnahme. Wer den Ring gedreht und
  // dabei die Messwerte hat wachsen sehen, hat die Arbeit schon gesehen -
  // sieben Sekunden Ladeanzeige danach sind kein Vertrauen mehr, sondern
  // Wartezeit, und Wartezeit kostet an dieser Stelle Bestellungen.
  analyseAnzeigeMs: 4200
});

// Zwei Produkte, wie besprochen. Die Einzelpreise ergeben zusammen 68 EUR,
// das Set 53 - eine Ersparnis von 15 EUR oder 22 Prozent, also im Band, das
// glaubwuerdig bleibt.
export const STANDARD_PRODUKTE = Object.freeze([
  {
    id: "serum-01",
    name: "Serum",
    kurztext: { de: "Beruhigt und gleicht aus", sq: "Qetëson dhe barazon" },
    beschreibung: {
      de: "Leichtes Serum für gereizte Haut und ungleichmäßigen Hautton. Morgens und abends auf die gereinigte Haut.",
      sq: "Serum i lehtë për lëkurë të irrituar dhe ngjyrë të pabarabartë. Në mëngjes dhe në mbrëmje."
    },
    inhalt: "30 ml",
    einzelpreis: 34,
    order: 1,
    routine: "both",
    availability: "visible",
    photoRef: "",
    triggers: [
      { befund: "roetung", abStufe: 1 },
      { befund: "pigment", abStufe: 1 },
      { befund: "linien", abStufe: 2 }
    ]
  },
  {
    id: "creme-01",
    name: "Creme",
    kurztext: { de: "Pflegt und schützt", sq: "Ushqen dhe mbron" },
    beschreibung: {
      de: "Reichhaltige Creme für trockene, spannende Haut. Abends großzügig, morgens dünn auftragen.",
      sq: "Krem ushqyes për lëkurë të thatë dhe të shtrënguar. Në mbrëmje bujarisht, në mëngjes hollë."
    },
    inhalt: "30 ml",
    einzelpreis: 34,
    order: 2,
    routine: "both",
    availability: "visible",
    photoRef: "",
    triggers: [
      { befund: "trockenheit", abStufe: 1 },
      { befund: "linien", abStufe: 1 }
    ]
  }
]);

// Was mit diesen zwei Produkten offenbleibt: Glanz und Poren.
//
// Das steht hier nicht als Mangel, sondern als Hinweis fuer den CEO-Bereich:
// Die Abdeckungsansicht zeigt genau diese beiden Zeilen rot, und darunter
// steht, welche Art Produkt fehlt. Zwei Produkte koennen sechs Befunde nicht
// abdecken - das ist keine Panne, sondern eine Sortimentsentscheidung, die
// jemand bewusst treffen soll.
export const ABDECKUNG_HINWEIS = Object.freeze({
  glanz: {
    de: "Für fettige T-Zone fehlt ein Produkt — üblicherweise eine Reinigung oder ein mattierendes Fluid.",
    sq: "Mungon një produkt për zonën T të yndyrshme — zakonisht një pastrues."
  },
  poren: {
    de: "Für vergrößerte Poren fehlt ein Produkt — üblicherweise ein Peeling oder Tonikum.",
    sq: "Mungon një produkt për poret e zgjeruara — zakonisht një peeling ose tonik."
  }
});

// Der Tagespreis wird gerechnet, nicht geschrieben.
export function tagespreis(konfig = STANDARD_KONFIG) {
  const tage = Number(konfig.reichweiteTage) || 28;
  return Math.round((Number(konfig.setPreis) / tage) * 100) / 100;
}

export function einzelpreisSumme(produkte = STANDARD_PRODUKTE) {
  return produkte
    .filter((p) => p.availability !== "hidden")
    .reduce((summe, p) => summe + (Number(p.einzelpreis) || 0), 0);
}

export function ersparnis(produkte = STANDARD_PRODUKTE, konfig = STANDARD_KONFIG) {
  const summe = einzelpreisSumme(produkte);
  const gespart = summe - Number(konfig.setPreis);
  return {
    summe,
    gespart,
    prozent: summe > 0 ? Math.round((gespart / summe) * 100) : 0
  };
}
