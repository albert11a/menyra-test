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

// Die Kennung des Meta-Pixels.
//
// Leer bedeutet aus: Es wird kein fremdes Skript geladen und kein Ereignis
// gemeldet. Sobald der Pixel im Werbekonto angelegt ist, steht hier seine
// fuenfzehnstellige Nummer - das ist der einzige Handgriff.
//
// Kein Geheimnis. Die Nummer steht bei jedem Shop im Quelltext; sie sagt nur,
// welchem Konto die Messung gehoert.
export const LIFESKIN_PIXEL_ID = "";
