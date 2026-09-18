// Die Nummer, unter der Dr. Gashi zurueckruft.
//
// EIN EIGENES MODUL, weil hier genau eine Frage entschieden wird, und weil
// eine falsche Antwort darauf teuer ist: Eine Nummer, die zu streng
// geprueft wird, weist einen echten Patienten ab - und der ist dann
// endgueltig weg, denn ein zweites Mal tippt niemand. Eine Nummer, die zu
// lax durchgeht, steht in Heart und laesst sich nicht anrufen.
//
// Also pruefen wir NUR das, was sicher falsch ist, und raten nirgends.
//
// WAS WIR NICHT TUN: kein Laendererraten ueber die Vorwahl, keine Liste
// gueltiger Netzbetreiber, keine Laengenregel je Land. Der Trichter
// bedient Kosovo und Albanien, und ein guter Teil der Patienten sitzt in
// Deutschland und der Schweiz - jede dieser Regeln haette genau die
// weggeworfen.

// Was an Zeichen erlaubt ist, bevor gerechnet wird.
//
// Leerzeichen, Striche, Schraegstriche, Punkte und Klammern: Menschen
// schreiben Nummern so auf, wie sie sie im Kopf haben ("044 123 456",
// "+383 (0)44-123-456"). Das alles faellt weg und nichts davon ist ein
// Fehler des Patienten.
const ZIERAT = /[\s\-./()]/g;

// Kuerzer als das kann keine erreichbare Nummer sein, laenger als das
// erlaubt die internationale Regel (E.164) nicht.
const MINDESTENS = 8;
const HOECHSTENS = 15;

// Die Nummer, wie sie gespeichert wird.
//
// Fuehrende Nullen werden zur internationalen Form, WENN eine Vorwahl
// bekannt ist - sonst bleibt die Null stehen. Eine "044 123 456" ohne
// gesetzte Landesvorwahl zu einer "+383 44 123 456" zu machen waere
// geraten: Dieselbe Nummer gibt es in Albanien auch, und ein Anruf ins
// falsche Land kommt nicht an.
function vereinheitlichen(ziffern, vorwahl) {
  // "00383..." ist dieselbe Nummer wie "+383..." - das ist keine Annahme,
  // sondern die Regel.
  if (ziffern.startsWith("00")) return `+${ziffern.slice(2)}`;
  if (ziffern.startsWith("+")) return ziffern;
  const land = String(vorwahl || "").trim();
  if (land && ziffern.startsWith("0")) return `${land}${ziffern.slice(1)}`;
  return ziffern;
}

// Prueft und vereinheitlicht eine getippte Nummer.
//
// Gibt IMMER einen Grund zurueck, wenn etwas nicht stimmt: Ein Feld, das
// rot wird, ohne zu sagen warum, wird nicht korrigiert, sondern verlassen.
//
//   { ok: true,  nummer }          so wird sie gespeichert
//   { ok: false, grund }           "leer" | "kurz" | "lang" | "zeichen"
export function telefonPruefen(roh, vorwahl = "") {
  const getippt = String(roh ?? "").trim();
  if (!getippt) return { ok: false, grund: "leer" };

  const ohneZierat = getippt.replace(ZIERAT, "");
  // Das Plus darf nur ganz vorne stehen. Alles andere ausser Ziffern ist
  // keine Nummer - auch nicht "044 oder 045", was Leute tatsaechlich
  // hineinschreiben, wenn sie unsicher sind.
  if (!/^\+?\d+$/.test(ohneZierat)) return { ok: false, grund: "zeichen" };

  const ziffern = ohneZierat.replace(/^\+/, "");
  if (ziffern.length < MINDESTENS) return { ok: false, grund: "kurz" };
  if (ziffern.length > HOECHSTENS) return { ok: false, grund: "lang" };

  return { ok: true, nummer: vereinheitlichen(ohneZierat, vorwahl) };
}
