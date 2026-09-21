// Oeffentliche Firebase-Angaben fuer den Lifeskin-Trichter.
//
// Bewusst hier und nicht aus /shared/firebase-config.js importiert: Jener
// Pfad zieht firebase-app, firebase-auth und firebase-firestore und richtet
// einen IndexedDB-Zwischenspeicher mit Mehrfenster-Abstimmung ein. Der
// Trichter liest und schreibt ueber REST und beruehrt die App nicht.
//
// Beide Werte sind oeffentliche Clientangaben und stehen ohnehin im
// ausgelieferten Bundle. tests/lifeskin-config.test.mjs haelt sie mit
// /shared/firebase-config.js gleich.

export const LIFESKIN_PROJECT_ID = "menyra-c0e68";
export const LIFESKIN_API_KEY = "AIzaSyAq5kzdGITDekgajC0uUBny63JjS1DIPEU";

export const LIFESKIN_FIRESTORE_BASE =
  `https://firestore.googleapis.com/v1/projects/${LIFESKIN_PROJECT_ID}/databases/(default)/documents`;

// Der Mandant. Von Beginn an vorhanden, damit derselbe Trichter spaeter einem
// zweiten Kosmetikkunden verkauft werden kann, ohne dass die Sammlungen
// umgezogen werden muessen.
export const LIFESKIN_TENANT = "lifeskin";

export const LIFESKIN_BASISPFAD = "/lifeskin";

// Wer hinter Lifeskin steht.
//
// Die Befundseite nimmt Namen, Telefonnummer und Anschrift entgegen und
// schliesst damit einen Kauf ab - und nennt bisher niemanden, der dafuer
// geradesteht. Ein Gesicht hat sie (Dr. Gashi) und einen echten
// Kontaktweg auch; was fehlt, ist die Stelle, an die sich jemand wendet,
// wenn etwas schiefgeht. Genau diesen Unterschied beschreiben die
// Untersuchungen zur Glaubwuerdigkeit von Webseiten als den zwischen
// einer Marke mit Verantwortlichem und einer Marke mit Formular.
//
// LEER BEDEUTET AUS, wie ueberall hier: Ein Feld ohne Inhalt wird nicht
// gezeichnet, und sind alle drei leer, erscheint der ganze Block nicht.
// Es wird NICHTS erfunden - kein Firmenname, keine Anschrift, keine
// Adresse. Was hier nicht steht, steht auch nicht auf der Seite.
//
//   name       wie das Unternehmen oder die Praxis wirklich heisst
//   anschrift  eine Zeile, so wie sie auf Post stehen wuerde
//   email      eine Adresse, die auch gelesen wird
export const LIFESKIN_ANBIETER = Object.freeze({
  name: "",
  anschrift: "",
  email: ""
});

// Der dokumentierte Fall - zwei Aufnahmen, Tag 1 und Tag 28.
//
// WARUM STATISCHE DATEIEN und nicht Firestore, wo die Produktfotos liegen:
// Ein Produktfoto ist eine Datenzeile von bis zu 700.000 Zeichen. Zwei
// davon sprengen ein Firestore-Dokument - das steht so im Kommentar von
// gibBerichtFrei() und ist der Grund, warum die Bilder dort in einer
// eigenen Sammlung stehen. Hier waere es schlimmer als unpraktisch: Diese
// zwei Aufnahmen sind fuer JEDEN Patienten dieselben. Als Daten-URI lieg
// bei jedem einzelnen Berichtaufruf rund 1,4 MB zusaetzlich in der
// Leitung - auf genau den langsamen Telefonen, fuer die diese ganze
// Anwendung gebaut ist. Als Datei holt der Browser sie einmal und danach
// nie wieder.
//
// LEER BEDEUTET AUS, wie ueberall hier: Fehlt eine der beiden Aufnahmen,
// erscheint der ganze Abschnitt nicht. Es wird NICHTS erfunden - kein
// Ergebnis, kein Zeitraum, kein Fall.
//
// Die Daten stehen daneben, weil ein Vorher-Nachher ohne Zeitraum keine
// Dokumentation ist, sondern eine Behauptung.
//
//   vorher / nachher  Pfad zur Aufnahme, so wie der Browser sie holt
//   tageVorher        welcher Tag der Therapie das ist (fast immer 1)
//   tageNachher       welcher Tag der Therapie das ist (fast immer 28)
// WIE DIE BEIDEN AUFNAHMEN ZUGESCHNITTEN SIND, und warum das nicht
// beliebig ist:
//
// Beide sind aus derselben Quelle nur BESCHNITTEN UND VERKLEINERT -
// nicht geglaettet, nicht aufgehellt, nicht retuschiert. Der Satz
// "pa perpunim" / "unbearbeitet" steht auf der Seite; er muss stimmen,
// sonst faellt mit ihm der ganze Befund darueber.
//
// Und beide tragen DENSELBEN AUSSCHNITT RELATIV ZUM GESICHT: gleiche
// Gesichtshoehe, gleiche Augenhoehe. Ohne das vergleicht der Blick
// Abstand und Kopfhaltung statt Haut - und ein Vergleich, bei dem sich
// zwei Dinge gleichzeitig aendern, beweist keines von beiden. Die
// Vorlage war im Nachher rund neun Prozent naeher; der Ausschnitt
// gleicht das aus.
export const LIFESKIN_VORHER_NACHHER = Object.freeze({
  vorher: "/apps/lifeskin/fall-vorher.jpg",
  nachher: "/apps/lifeskin/fall-nachher.jpg",
  tageVorher: 1,
  tageNachher: 28
});

// Die Kennung des Meta-Pixels.
//
// Leer bedeutet aus: Es wird kein fremdes Skript geladen und kein Ereignis
// gemeldet. Hier steht die Nummer des Datensatzes "LF WEB".
//
// Kein Geheimnis. Die Nummer steht bei jedem Shop im Quelltext; sie sagt nur,
// welchem Konto die Messung gehoert.
//
// DER BASISCODE AUS DEM EREIGNISMANAGER GEHOERT NICHT IN DEN <head>.
// lifeskin-pixel.js baut ihn selbst - dieselbe Warteschlange, dasselbe
// fbevents.js, nur hinter dem Schalter darunter und mit den Ereignissen
// des Trichters daran. Wer den kopierten Schnipsel ZUSAETZLICH einsetzt,
// bekommt zwei "init" und zwei "PageView" je Besucher: Meta zaehlt dann
// jeden doppelt, und keine Zahl auf dieser Seite stimmt mehr.
export const LIFESKIN_PIXEL_ID = "1347571994123884";

// Ob der Pixel auf eine Zustimmung wartet.
//
// DIE SPERRE BLEIBT IM CODE, AUCH WENN SIE OFFEN STEHT. Pixel.aktiv
// verlangt zwei Dinge: die Nummer darueber UND eine Einwilligung. Steht
// hier false, gilt die Einwilligung als gegeben und der Pixel laedt beim
// ersten Aufruf - so, wie es fuer diese Seite entschieden wurde.
//
// Auf true gestellt, wartet er wieder auf pixel.erlaube(true) aus einer
// Zustimmungsabfrage, und bis dahin wird kein fremdes Skript geladen und
// kein Ereignis gemeldet. Das ist der Weg, wenn eine Abfrage dazukommt -
// eine Zeile, kein Umbau.
//
// Der Unterschied ist eine Rechtsfrage und keine technische: Kosovo und
// Albanien haben eigene, an die DSGVO angelehnte Gesetze, und Besucher aus
// der Diaspora sitzen in der EU.
export const LIFESKIN_PIXEL_EINWILLIGUNG_NOETIG = false;

// Die WhatsApp-Nummer von Dr. Gashi, in der Form, die wa.me verlangt:
// nur Ziffern, mit Landesvorwahl, ohne Plus und ohne Leerzeichen.
//
// WARUM DIE NUMMER UND NICHT DER KURZLINK (wa.me/message/...):
// Der Kurzlink oeffnet den Chat mit der Nachricht, die im
// WhatsApp-Business-Konto hinterlegt ist - wir koennen ihm keinen eigenen
// Text mitgeben. Genau den brauchen wir aber: Ohne die Fallnummer in der
// Nachricht kann die Aerztin sie keinem Fall zuordnen, und der Patient
// muesste sie abtippen. Der Nummernlink nimmt ?text= zuverlaessig an.
//
// Leer bedeutet aus: Dann bleibt der Weg ueber das Nummernfeld, und der
// Trichter laeuft vollstaendig weiter.
export const LIFESKIN_WHATSAPP = "436508564879";

// Was in der vorbefuellten Nachricht steht.
//
// Der Patient SIEHT diesen Text, bevor er auf Senden tippt - das ist der
// heikelste Satz im ganzen Trichter. Drei Regeln:
//
// 1. Kurz. Je laenger, desto mehr Leute lesen ihn zu Ende, denken nach und
//    loeschen ihn wieder.
// 2. Er muss klingen wie etwas, das ein Mensch selbst schreiben wuerde.
//    Ein Werbetext im eigenen Mund fuehlt sich falsch an.
// 3. Die Fallnummer muss drin sein, sonst faengt das Gespraech mit
//    Suchen an.
export const LIFESKIN_WHATSAPP_TEXT = Object.freeze({
  sq: "Përshëndetje Dr. Gashi! Bëra analizën. Kodi im: {code}",
  de: "Hallo Dr. Gashi! Ich habe die Analyse gemacht. Mein Code: {code}"
});

// Die Landesvorwahl im Telefonfeld der Bestellung.
//
// Leer heisst: nichts vorgeben. Das ist die richtige Voreinstellung,
// solange derselbe Trichter Kosovo UND Albanien bedient - ein falsches
// "+383" vor einer albanischen Nummer ist schlimmer als gar keines.
// Laeuft eine Kampagne nur in einem Land, kann hier "+383" oder "+355"
// stehen; dann ist ein Feld weniger zu tippen.
export const LIFESKIN_TELEFON_VORWAHL = "";
