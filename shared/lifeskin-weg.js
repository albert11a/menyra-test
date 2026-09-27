// UEBER WELCHE LANDINGPAGE EIN FALL KAM - an einer Stelle.
//
// "" ist der bisherige Weg (/lifeskin, "Analiza falas"). "lifeskin2" ist
// LifeSkin 2 (/lifeskin2, "Shiko nëse të përshtatet"): derselbe Trichter
// und dieselbe Analyse, dem Kunden aber als Pruefung verkauft, ob die
// Therapie passt (docs/lifeskin-2.md).
//
// Wo der Weg steht:
//   - Landingpage:  <html data-ls-weg="lifeskin2">
//   - Sitzung:      source.weg (source ist in den Regeln eine freie Karte)
//   - Warteseite:   ?weg=lifeskin2 (der Trichter haengt es an, die Seite
//                   liest die Sitzung nicht)
//   - Bericht:      weg (schreibt Heart beim Freigeben - der Patient darf
//                   den Bericht nur anlegen, nicht erweitern)
//
// Nur bekannte Namen gelten. Alles andere ist "", also der bisherige Weg:
// Ein Tippfehler in einer Adresse darf keinen Fall in den falschen Tab
// schieben.
export const LIFESKIN_WEGE = Object.freeze(["lifeskin2"]);

export function wegGueltig(weg) {
  const w = String(weg || "").trim();
  return LIFESKIN_WEGE.includes(w) ? w : "";
}

export function wegAusSuche(suche = "") {
  try { return wegGueltig(new URLSearchParams(String(suche || "")).get("weg")); }
  catch { return ""; }
}

// Aus einer Sitzung, wie Heart sie liest (source.weg).
export function wegDerSitzung(sitzung) {
  return wegGueltig(sitzung?.source?.weg);
}

// Name fuer Heart und Berichte.
export const WEG_NAMEN = Object.freeze({ "": "Lifeskin", lifeskin2: "Lifeskin 2" });
