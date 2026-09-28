// DIE PËRPUTHJA - wie sehr die Therapie zu seiner Haut passt, in Prozent.
//
// DIE ZAHL SETZT DR. GASHI. Sie traegt sie in Mnyra Heart beim Befund ein
// (Feld "Përputhja %", nur bei Faellen aus dem Laden /lifeskinshop), Heart
// legt sie beim Freigeben in den Bericht (reports/{id}.perputhja), und die
// Therapieseite zeigt sie. Keine Software rechnet sie aus, schlaegt sie vor
// oder rundet sie schoen - hier wird nur geprueft, dass eine Zahl eine ist
// (docs/lifeskin-shop-perputhja.md).
//
// Was nicht zwischen 1 und 100 liegt, gilt nicht: null. Die Seite laesst
// den Block dann weg - lieber keine Zahl als eine, die niemand gesetzt hat.

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
