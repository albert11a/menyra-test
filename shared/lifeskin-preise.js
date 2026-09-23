// DIE PREISE NACH DER ZAHL DER PRODUKTE - an einer Stelle.
//
//   1 Produkt   29 €
//   2 Produkte  39 €
//   3 Produkte  49 €
//   4 Produkte  59 €   (jedes weitere +10 €)
//
// Unter den Schwellen 30 und 40, und jedes Produkt mehr kostet sichtbar
// wenig dazu. Der Anker bleibt die Summe der Einzelpreise (33 € je
// Produkt) - bei zwei Produkten also "66 €", daneben 39 €.
//
// AB WANN: Ein freigegebener Befund traegt seinen Preis selbst
// (reports/{id}.preis) - alte Befunde behalten also, was sie zeigen.
// Fuer Faelle, die VOR dem Umstieg angekommen sind und noch warten,
// schlaegt Heart weiter die alten Preise vor (PREISE_ALT). Wer anders
// will, tippt eine Zahl ins Feld "Setpreis".

export const PREISE_AB = "2026-09-23T14:45:00.000Z";

export const PREISE = Object.freeze({ 1: 29, 2: 39, 3: 49, 4: 59 });
export const PREISE_ALT = Object.freeze({ 1: 33, 2: 53, 3: 85, 4: 118 });

function aus(tabelle, schritt, anzahl) {
  const n = Math.max(0, Math.round(Number(anzahl) || 0));
  if (!n) return 0;
  if (tabelle[n]) return tabelle[n];
  return tabelle[4] + (n - 4) * schritt;
}

// Der Preis fuer n Produkte, ab jetzt.
export function preisFuer(anzahl) {
  return aus(PREISE, 10, anzahl);
}

// Der Vorschlag fuer einen Fall: neue Preise, ausser der Fall kam vor
// dem Umstieg an.
export function preisFuerFall(anzahl, angelegtAm = "") {
  const zeit = Date.parse(String(angelegtAm || ""));
  const alt = Number.isFinite(zeit) && zeit < Date.parse(PREISE_AB);
  return alt ? aus(PREISE_ALT, 33, anzahl) : preisFuer(anzahl);
}

// Alle Zahlen, die je als Vorschlag im Feld standen - damit Heart eine
// eigene Zahl von einem blossen Vorschlag unterscheiden kann.
export function istPreisVorschlag(wert) {
  const zahl = Number(wert);
  return [1, 2, 3, 4, 5, 6].some((n) => preisFuer(n) === zahl || aus(PREISE_ALT, 33, n) === zahl);
}
