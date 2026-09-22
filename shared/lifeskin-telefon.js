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

// HIER STAND EINE LISTE ERLAUBTER ZIERZEICHEN.
//
// Leerzeichen, Striche, Schraegstriche, Punkte, Klammern - alles, was
// Menschen zwischen die Ziffern schreiben. Sie fielen weg, und ALLES
// ANDERE war ein Fehler.
//
// Eine Liste des Erlaubten ist an dieser Stelle die falsche Richtung:
// Sie kennt nur, was jemand vorher aufgeschrieben hat, und weist alles
// ab, woran niemand gedacht hat - das naechste Telefon, die naechste
// App, die naechste Tastatur. Jetzt wird umgekehrt gearbeitet: Die
// Ziffern werden herausgeholt, alles andere faellt weg, ohne zu
// fragen, was es war.

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

// UND ZIFFERN, DIE KEINE ASCII-ZIFFERN SIND.
//
// GEMESSEN: "０４４ 123 456" mit breiten Ziffern kam als "123456"
// heraus - die drei ersten Ziffern fielen weg, WEIL sie Ziffern sind,
// nur eben andere. Das ist schlimmer als eine Absage: In Heart stuende
// eine Nummer, die aussieht wie eine, und niemand koennte sie anrufen.
//
// Unicode kennt Ziffern in vielen Schriften (breite Ziffern von
// ostasiatischen Tastaturen, arabisch-indische aus dem Tuerkischen und
// Arabischen). Der Wert einer solchen Ziffer ist immer ihr Abstand zur
// Null ihres eigenen Blocks - also wird rueckwaerts gesucht, bis das
// Zeichen davor keine Ziffer mehr ist. Das gilt fuer jedes System, auch
// fuer eines, das erst noch dazukommt.
function ziffernNormal(text) {
  return text.replace(/\p{Nd}/gu, (zeichen) => {
    const code = zeichen.codePointAt(0);
    for (let zurueck = 0; zurueck <= 9; zurueck += 1) {
      const hier = code - zurueck;
      if (!/\p{Nd}/u.test(String.fromCodePoint(hier))) break;
      if (!/\p{Nd}/u.test(String.fromCodePoint(hier - 1))) return String(zurueck);
    }
    return zeichen;
  });
}

// Und der Kopf, den ein Link mitbringt: Wer eine Nummer aus einem
// "Anrufen"-Knopf kopiert, hat "tel:" davor stehen.
const LINKKOPF = /^(tel|callto|sms|whatsapp):(\/\/)?/i;

// WIE LANG EINE NUMMER SEIN DARF: so lang, wie sie jemand eintippt.
//
// Hier standen 8 und 15 (die internationale Regel E.164). Beide sind
// fachlich richtig und trotzdem an dieser Stelle falsch:
//
// Wer eine Nummer eintippt, WILL erreicht werden. Ihn wegen der Laenge
// abzuweisen heisst, jemanden zu verlieren, der schon zugesagt hatte -
// und zwar endgueltig, denn ein zweites Mal tippt niemand. Was dabei
// herauskommt, wenn wir uns irren, ist in beide Richtungen ungleich:
// Eine Nummer, unter der niemand abhebt, kostet einen Anruf. Ein
// Patient, der aufgibt, kostet den Patienten.
//
// Also: jede Laenge, mit und ohne Plus, mit und ohne fuehrende Null.
// Geprueft wird nur noch das Eine, was wirklich nichts ist - dass
// ueberhaupt keine Ziffer dasteht.
//
// EINE EINZIGE GRENZE BLEIBT, und die ist keine Meinung: Die
// Firestore-Regeln lassen fuer `phone` hoechstens 40 Zeichen zu. Was
// laenger ist, wuerde den GANZEN Schreibvorgang abweisen - lautlos,
// mit allem anderen darin. Gekuerzt wird deshalb beim Speichern und
// nicht beim Pruefen: "Vazhdo" geht so oder so weiter, und 40 Zeichen
// sind mehr als das Doppelte der laengsten Nummer, die es gibt.
const SPEICHER_MAX = 40;

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
  // Auch hier nur, wenn hinter den zwei Nullen etwas steht: Aus "00"
  // allein wuerde sonst ein blosses "+" - eine "Nummer" ganz ohne
  // Ziffer, und die haette in Heart nichts zu suchen.
  if (ziffern.startsWith("00") && ziffern.length > 2) return `+${ziffern.slice(2)}`;
  if (ziffern.startsWith("+")) return ziffern;
  const land = String(vorwahl || "").trim();
  // Nur, wenn hinter der Null auch etwas steht. Sonst wuerde aus einer
  // einzelnen "0" die blosse Vorwahl "+383" - die einzige Ziffer, die
  // jemand getippt hat, waere weg, und in Heart stuende eine Nummer,
  // die er nie geschrieben hat.
  if (land && ziffern.length > 1 && ziffern.startsWith("0")) {
    return `${land}${ziffern.slice(1)}`;
  }
  return ziffern;
}

// Prueft und vereinheitlicht eine getippte Nummer.
//
// Gibt IMMER einen Grund zurueck, wenn etwas nicht stimmt: Ein Feld, das
// rot wird, ohne zu sagen warum, wird nicht korrigiert, sondern verlassen.
//
//   { ok: true,  nummer }          so wird sie gespeichert
//   { ok: false, grund }           nur noch "leer" - keine Ziffer dabei
//
// "kurz", "lang" und "zeichen" gibt es nicht mehr. Die Stellen, die
// daraus eine Meldung machen (astra.js, der Fragenweg), tragen sie
// weiter in ihren Zuordnungen - sie laufen jetzt ins Leere und fallen
// auf "leer" zurueck. Nichts daran ist kaputt, und wenn eine Grenze je
// wiederkommt, steht ihr Satz noch da.
export function telefonPruefen(roh, vorwahl = "") {
  // Erst das Unsichtbare weg, DANN trimmen: Sonst bleibt eine
  // Laufrichtungsmarke am Rand stehen, die trim() nicht als Leerraum
  // kennt, und die Nummer faellt durch, obwohl sie richtig dasteht.
  // NFKC macht aus breiten Zeichen ihre gewoehnlichen - damit sind
  // breite Klammern und ein breites Plus erledigt, bevor irgendetwas
  // gezaehlt wird. Die Ziffern selbst nimmt ziffernNormal(), weil NFKC
  // arabisch-indische nicht anfasst.
  let getippt = String(roh ?? "")
    .normalize("NFKC")
    .replace(UNSICHTBAR, "")
    .replace(STRICHE, "-");
  getippt = ziffernNormal(getippt).replace(LINKKOPF, "").trim();
  if (!getippt) return { ok: false, grund: "leer" };

  // DAS PLUS VORNE, DANN ALLE ZIFFERN - und alles andere faellt weg.
  //
  // Hier stand eine Pruefung, die bei jedem fremden Zeichen nein sagte.
  // Sie traf nicht nur "044 oder 045", sondern auch alles, was ein
  // Telefon oder eine App beim Einfuegen mitbringt und was wir noch
  // nicht kennen. Wegwerfen ist hier besser als abweisen: Was keine
  // Ziffer ist, war nie Teil der Nummer.
  const plus = getippt.trimStart().startsWith("+");
  const ziffern = getippt.replace(/\D/g, "");

  // Das Einzige, was wirklich nichts ist: keine einzige Ziffer. Dann
  // steht dort ein Satz ("nuk e di") oder ein Versehen, und daran
  // aendert Weitergehen nichts - der Mensch bliebe unerreichbar.
  if (!ziffern) return { ok: false, grund: "leer" };

  const ganz = vereinheitlichen(plus ? `+${ziffern}` : ziffern, vorwahl);
  return { ok: true, nummer: ganz.slice(0, SPEICHER_MAX) };
}
