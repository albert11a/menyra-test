// DIE PËRPUTHJA - wie sehr die Therapie zu seiner Haut passt, in Prozent.
//
// DIE ZAHL SETZT DR. GASHI (oder, im Modus Auto, Heart vor - siehe
// unten). Sie traegt sie in Mnyra Heart beim Befund ein
// (Feld "Përputhja %", nur bei Faellen aus dem Laden /lifeskinshop), Heart
// legt sie beim Freigeben in den Bericht (reports/{id}.perputhja), und die
// Therapieseite zeigt sie. Keine Software rechnet sie aus, schlaegt sie vor
// oder rundet sie schoen - hier wird nur geprueft, dass eine Zahl eine ist
// (docs/lifeskin-shop-perputhja.md).
//
// Was nicht zwischen 1 und 100 liegt, gilt nicht: null. Die Seite laesst
// den Block dann weg - lieber keine Zahl als eine, die niemand gesetzt hat.
//
// AUTO ODER MANUELL (03.10., Wunsch Inhaber): Ein Schalter in Heart am
// Feld. "Manuell" ist der Stand von oben - das Feld ist leer, Dr. Gashi
// traegt die Zahl ein. "Auto" fuellt das Feld vor mit einer Zahl von 95
// bis 99 (perputhjaAuto). Sie haengt nur an der Fallnummer, also steht
// bei einem Fall immer dieselbe - auf jedem Geraet, bei jedem Oeffnen.
// Gerechnet wird sie aus keinen Daten des Kunden; Dr. Gashi sieht sie im
// Feld und kann sie vor dem Freigeben aendern. Der Schalter steht in
// lifeskin/lifeskin/config/perputhja ({ modus: "auto" | "hand" }).
export const PERPUTHJA_DOK = "perputhja";
export const PERPUTHJA_AUTO_VON = 95;
export const PERPUTHJA_AUTO_BIS = 99;

export function perputhjaModusGueltig(modus) {
  return modus === "auto" ? "auto" : "hand";
}

export function perputhjaAuto(fallId) {
  const text = String(fallId || "");
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i += 1) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  const spanne = PERPUTHJA_AUTO_BIS - PERPUTHJA_AUTO_VON + 1;
  return PERPUTHJA_AUTO_VON + ((h >>> 0) % spanne);
}

export function perputhjaGueltig(wert) {
  if (wert === null || wert === undefined || wert === "") return null;
  const zahl = Number(String(wert).replace(",", ".").replace("%", "").trim());
  if (!Number.isFinite(zahl)) return null;
  const ganz = Math.round(zahl);
  return ganz >= 1 && ganz <= 100 ? ganz : null;
}

// Wie die Seite die Zahl in Worte fasst. Die Stufe folgt der Zahl, die
// Dr. Gashi gesetzt hat - sie ersetzt sie nicht.
export function perputhjaStufe(wert) {
  const zahl = perputhjaGueltig(wert);
  if (zahl === null) return "";
  if (zahl >= 85) return "larte";
  if (zahl >= 65) return "mire";
  return "pjesshme";
}
