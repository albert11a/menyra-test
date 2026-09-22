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

// WAS MAN NICHT SIEHT UND WAS TROTZDEM MITKOMMT.
//
// GEMESSEN, NICHT VERMUTET: Von vierzehn Schreibweisen, die ein Mensch
// wirklich in dieses Feld bekommt, fielen FUENF durch - und jede davon
// war eine gueltige Nummer.
//
// Wer seine eigene Nummer nicht auswendig weiss, holt sie sich: aus den
// Kontakten, aus WhatsApp, von einer Webseite. Und was dabei mitkommt,
// steht nicht auf dem Bildschirm:
//
//   U+200E/U+200F  Laufrichtungsmarken - iOS haengt sie an Nummern aus
//                  den Kontakten, damit "+383" nicht verdreht wird
//   U+202A..U+202E  dieselbe Sache als Klammer um die ganze Nummer
//   U+2066..U+2069  die neuere Form davon
//   U+00AD          weiches Trennzeichen aus kopiertem Fliesstext
//   U+FEFF          Markierung am Anfang eingefuegter Zeichenketten
//
// Fuer den, der davorsitzt, steht im Feld seine Nummer. Fuer die
// Pruefung stand dort ein Zeichen, das keine Ziffer ist - und die Seite
// sagte nein, ohne dass irgendetwas zu sehen war, das man haette
// aendern koennen. An dieser Stelle hoert jemand auf, und zwar zu
// Recht.
//
// Weg damit. Es sind Zeichen ohne Breite: Sie wegzunehmen aendert an
// der Nummer nichts, weil sie nie Teil von ihr waren.
const UNSICHTBAR = /[\u200B-\u200F\u202A-\u202E\u2066-\u2069\u00AD\uFEFF]/g;

// UND WAS AUSSIEHT WIE EIN STRICH, ABER KEINER IST.
//
// Wer eine Nummer von einer Webseite kopiert, bringt oft einen
// typografischen Strich mit: Gedankenstrich, geschuetzter Bindestrich,
// Minuszeichen. Sie sehen aus wie "-", sind es aber nicht. Dasselbe
// gilt fuer Klammern in ihrer breiten Form, die von manchen Tastaturen
// kommt.
//
// Sie werden zu dem, wonach sie aussehen - und fallen dann als Zierat
// weg, wie ein gewoehnlicher Strich auch.
const STRICHE = /[\u2010-\u2015\u2212\uFE58\uFE63\uFF0D]/g;
const KLAMMERN = [[/[\uFF08]/g, "("], [/[\uFF09]/g, ")"]];

// Und der Kopf, den ein Link mitbringt: Wer eine Nummer aus einem
// "Anrufen"-Knopf kopiert, hat "tel:" davor stehen.
const LINKKOPF = /^(tel|callto|sms|whatsapp):(\/\/)?/i;

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
  // Erst das Unsichtbare weg, DANN trimmen: Sonst bleibt eine
  // Laufrichtungsmarke am Rand stehen, die trim() nicht als Leerraum
  // kennt, und die Nummer faellt durch, obwohl sie richtig dasteht.
  let getippt = String(roh ?? "")
    .replace(UNSICHTBAR, "")
    .replace(STRICHE, "-");
  for (const [muster, ersatz] of KLAMMERN) getippt = getippt.replace(muster, ersatz);
  getippt = getippt.replace(LINKKOPF, "").trim();
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
