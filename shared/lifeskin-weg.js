// UEBER WELCHE LANDINGPAGE EIN FALL KAM - an einer Stelle.
//
// "" ist der bisherige Weg (/lifeskin, "Analiza falas"). "lifeskin2" ist
// LifeSkin 2 (/lifeskin2, "Shiko nëse të përshtatet"): derselbe Trichter
// und dieselbe Analyse, dem Kunden aber als Pruefung verkauft, ob die
// Therapie passt (docs/lifeskin-2.md).
//
// Wo der Weg steht:
//   - Landingpage:  <html data-ls-landing="lifeskin2">
//   - Sitzung:      source.weg (source ist in den Regeln eine freie Karte)
//   - Warteseite:   ?weg=lifeskin2 (der Trichter haengt es an, die Seite
//                   liest die Sitzung nicht)
//   - Bericht:      weg (schreibt Heart beim Freigeben - der Patient darf
//                   den Bericht nur anlegen, nicht erweitern)
//
// Nur bekannte Namen gelten. Alles andere ist "", also der bisherige Weg:
// Ein Tippfehler in einer Adresse darf keinen Fall in den falschen Tab
// schieben.
// "lifeskinshop" ist der Laden unter /lifeskinshop (28.09.): Sets und
// Einzelmittel direkt kaufen, dazu "Gjeni setin" in dieselbe Analyse wie
// /lifeskin (Lead bei der Nummer) - getrennt gezaehlt, eigener Heart-Tab
// (docs/lifeskin-shop.md).
export const LIFESKIN_WEGE = Object.freeze(["lifeskin2", "lifeskinshop"]);

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

// AB WANN EIN WEG IN HEART ZAEHLT - Zuruecksetzen ohne Loeschen, wie beim
// Zuruecksetzen eines Lokals (heart-landing-adapter.js).
//
// Der Laden (/lifeskinshop) steht seit dem 28.09. abends auf 0 (Wunsch
// Inhaber): Was davor lag, waren eigene Probelaeufe. Geloescht wird
// nichts - Heart blendet die aelteren Besuche im Tab "Lifeskin Shop" aus
// und sagt, wie viele es sind. Zurueck: den Eintrag hier entfernen.
// Ohne lesbaren Anlegezeitpunkt zaehlt ein Besuch (lieber einer zu viel
// als einer, der still verschwindet).
export const WEG_ZAEHLT_AB = Object.freeze({ lifeskinshop: "2026-09-28T18:00:00.000Z" });

export function zaehltImWeg(sitzung, weg = "") {
  const ab = Date.parse(WEG_ZAEHLT_AB[wegGueltig(weg)] || "");
  if (!Number.isFinite(ab)) return true;
  const am = Date.parse(String(sitzung?.createdAt || ""));
  return !Number.isFinite(am) || am >= ab;
}

// Name fuer Heart und Berichte.
export const WEG_NAMEN = Object.freeze({ "": "Lifeskin", lifeskin2: "Lifeskin 2", lifeskinshop: "Lifeskin Shop" });
