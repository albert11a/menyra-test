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

// Die Kennung des Meta-Pixels.
//
// Leer bedeutet aus: Es wird kein fremdes Skript geladen und kein Ereignis
// gemeldet. Sobald der Pixel im Werbekonto angelegt ist, steht hier seine
// fuenfzehnstellige Nummer.
//
// SIE ALLEIN SCHALTET IHN NICHT EIN, und das ist Absicht. Der Pixel laedt
// fremden Code und meldet das Verhalten eines Besuchers weiter - das
// braucht dessen Zustimmung, und die kann eine Zahl in dieser Datei nicht
// geben. Pixel.aktiv verlangt deshalb beides: die Nummer hier UND einen
// Aufruf von pixel.erlaube(true) aus einer Zustimmungsabfrage. Solange es
// die Abfrage nicht gibt, bleibt der Pixel aus, auch mit Nummer.
//
// Kein Geheimnis. Die Nummer steht bei jedem Shop im Quelltext; sie sagt nur,
// welchem Konto die Messung gehoert.
export const LIFESKIN_PIXEL_ID = "";

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
