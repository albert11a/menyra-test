// Wann eine Sitzung eine Meldung verdient - ohne Firestore, ohne Netz.
//
// WARUM DAS EINE EIGENE DATEI IST. Der Waechter selbst redet mit Firestore
// und mit FCM; davon laesst sich nichts aus einem Test heraus aufrufen. Was
// wirklich schiefgehen kann, ist aber nicht der Aufruf, sondern die
// Entscheidung davor: WELCHE Sitzung gemeldet wird, und vor allem welche
// NICHT. Ein Fehler an dieser Stelle schickt hundertneununddreissig alte
// Analysen auf ein Telefon, und das kann man nicht zurueckholen.

// Dieselbe Folge wie im Trichter (apps/lifeskin/lifeskin-session.js) und in
// den Cloud Functions. Drei Kopien derselben Liste waeren frueher oder
// spaeter drei verschiedene - tests/lifeskin-meldungs-waechter.test.mjs
// haelt sie zusammen.
export const SCHRITTE = Object.freeze([
  "opened", "wahl", "named", "camera", "captured",
  "fotopara", "fotokamera", "fotogati",
  "pyetja1", "pyetja2", "pyetja3", "pyetja4", "emri", "problemi", "numri",
  "aufbereitung",
  "result", "offer", "address", "ordered"
]);

// Was gemeldet wird. Wortgleich mit LIFESKIN_MELDUNGEN in functions/index.js:
// Sobald die Cloud Function laeuft, soll auf dem Telefon derselbe Satz
// stehen wie vorher - sonst sieht es aus wie zwei verschiedene Meldungen.
export const MELDUNGEN = Object.freeze([
  {
    // GEMELDET WIRD DER FERTIGE FALL, NICHT DIE AUFNAHME.
    //
    // Hier stand "captured" - der Augenblick, in dem die Bilder des
    // Scans liegen. Das war richtig, solange es EINEN Weg gab. Seit der
    // Menyra gibt es vier, und drei davon machen nie eine Aufnahme:
    // Ihre Schritte sprangen an dieser Stufe vorbei, und die Meldung
    // fiel stattdessen beim naechsten Schritt, den die Liste kannte -
    // also beim blossen ANSEHEN des Anliegenschirms. Dr. Gashi bekam
    // eine Meldung ueber einen Fall, den noch niemand abgeschickt hat.
    //
    // "result" ist die Stufe, die auf allen vier Wegen dasselbe
    // bedeutet: Der Fall ist vollstaendig und liegt bei ihr. Auf dem
    // Weg mit Scan sind das sieben Sekunden spaeter als vorher - die
    // Aufbereitung dazwischen; dafuer meldet keine der vier Meldungen
    // mehr etwas, das es noch nicht gibt.
    schritt: "result",
    type: "lifeskin_analyse",
    text: (name) => (name ? `Sie haben eine neue Analyse, ${name}` : "Sie haben eine neue Analyse")
  },
  {
    schritt: "ordered",
    type: "lifeskin_porosia",
    text: (name) => (name ? `Neue Bestellung, ${name}` : "Neue Bestellung")
  }
]);

// Wie weit zurueck geschaut wird.
//
// DAS IST DIE WICHTIGSTE ZAHL HIER. Der Waechter sieht nur den Zustand
// einer Sitzung, nicht den Uebergang - er kann also nicht unterscheiden, ob
// eine Analyse gerade ankam oder vor drei Wochen. Ohne Fenster meldete der
// erste Lauf jede Sitzung, die je bis zum Scan kam.
//
// 75 MINUTEN bei stuendlichem Lauf (vorher 45 bei viertelstuendlichem). Ein Lauf
// darf sich verspaeten, ohne dass etwas durchfaellt; aelter ist keine Nachricht mehr: "Sie haben eine
// neue Analyse" ueber einem Fall von heute frueh ist keine Meldung, sondern
// eine falsche Behauptung - und wer sie bekommt, glaubt der naechsten
// weniger. GEMESSEN, NICHT GESCHAETZT: Ein Trockenlauf mit sechs Stunden
// Fenster haette heute frueh sechs Faelle auf einmal gemeldet, davon fuenf
// laengst gesehene.
export const FENSTER_MS = 75 * 60 * 1000;

// Und ein Deckel je Lauf. Wenn doch einmal etwas durcheinandergeraet, sind
// drei falsche Meldungen ein Aergernis und dreissig ein Grund, Meldungen
// ganz abzuschalten.
export const HOECHSTENS_JE_LAUF = 5;

export function schrittIndex(wert) {
  const index = SCHRITTE.indexOf(String(wert || "").trim().toLowerCase());
  return index < 0 ? -1 : index;
}

// Firestore-Zeitstempel, ISO-Zeichenkette oder gar nichts.
//
// Der Trichter schreibt beides: Die Sitzungen aus dem Browser tragen einen
// echten Zeitstempel, die aus der REST-Schnittstelle eine Zeichenkette. Wer
// hier nur eine Form kennt, haelt die andere fuer "keine Zeit" - und
// meldet sie entweder nie oder immer.
export function zeitAus(wert) {
  if (!wert) return 0;
  if (typeof wert === "object" && typeof wert.toDate === "function") {
    const datum = wert.toDate();
    return Number.isFinite(datum?.getTime?.()) ? datum.getTime() : 0;
  }
  if (typeof wert === "object" && Number.isFinite(wert._seconds)) return wert._seconds * 1000;
  const gelesen = Date.parse(String(wert));
  return Number.isFinite(gelesen) ? gelesen : 0;
}

export function sitzungsZeit(sitzung = {}) {
  const daten = sitzung || {};
  return Math.max(zeitAus(daten.updatedAt), zeitAus(daten.createdAt));
}

// Die Kennung des Meldungsdokuments - DIESELBE, die die Cloud Function
// bildet (sanitizeNotificationDocId in functions/index.js).
//
// Daran haengt alles: Steht das Dokument schon da, wurde schon gemeldet.
// Weicht die Kennung ab, meldet der Waechter ein zweites Mal, was die
// Funktion gerade gemeldet hat - und der Kunde bekommt jede Analyse doppelt.
export function meldungsKennung(type, sessionId) {
  const roh = `${String(type || "").trim()}_${String(sessionId || "").trim()}`;
  return roh.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 180);
}

// Was fuer diese Sitzung jetzt faellig waere - ohne zu wissen, was schon
// gemeldet wurde. Das entscheidet der Waechter am Dokument.
export function faelligeMeldungen(sitzung = {}, { jetzt = Date.now(), fensterMs = FENSTER_MS } = {}) {
  // Auch null und Unfug muessen hier ruhig enden: Der Waechter laeuft ohne
  // Aufsicht, und eine Ausnahme mitten im Durchgang laesst die Sitzungen
  // dahinter ungemeldet.
  const daten = sitzung && typeof sitzung === "object" ? sitzung : {};
  const stand = schrittIndex(daten.step);
  if (stand < 0) return [];
  const zeit = sitzungsZeit(daten);
  // Ohne Zeit keine Meldung. Eine Sitzung ohne Zeitstempel ist entweder
  // uralt oder kaputt, und beides ist kein Grund, ein Telefon zu wecken.
  if (!zeit) return [];
  if (jetzt - zeit > fensterMs) return [];
  return MELDUNGEN.filter((vorlage) => schrittIndex(vorlage.schritt) <= stand);
}

// Der fertige Satz und das Dokument dazu. Dieselben Felder, die
// baueLifeskinMeldung() in den Cloud Functions schreibt: Heart liest die
// Meldungsliste aus derselben Sammlung, und ein Dokument mit anderen
// Feldern faellt dort als leere Zeile auf.
export function baueMeldung({ vorlage, sessionId = "", sitzung = {}, uid = "" }) {
  const daten = sitzung && typeof sitzung === "object" ? sitzung : {};
  const name = String(daten.name || "").trim().slice(0, 120);
  const text = vorlage.text(name);
  return {
    type: vorlage.type,
    user: "",
    text,
    body: text,
    name,
    sessionId: String(sessionId || ""),
    step: String(daten.step || ""),
    read: false,
    serverAuth: true,
    source: "waechter",
    createdByUid: "system",
    userUid: String(uid || ""),
    link: "/heart/#lifeskin"
  };
}
