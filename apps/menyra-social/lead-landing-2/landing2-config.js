// Oeffentliche Firebase-Web-Konfiguration fuer Landing 2.
//
// Bewusst eigene Konstanten - weder aus /shared/firebase-config.js noch aus
// der Lead-Landing importiert.
//
// Der Grund ist derselbe wie dort: /shared/firebase-config.js zieht
// firebase-app, firebase-auth und firebase-firestore (zusammen ~679 KB) und
// initialisiert Firestore mit persistentem IndexedDB-Cache und
// Multi-Tab-Manager. Landing 2 wuerde damit an der Persistenz-Koordination
// der echten App teilnehmen. Sie liest stattdessen ueber die REST-API - kein
// SDK, keine geteilte Firebase-Instanz, keine Beruehrung mit der App.
//
// Und nicht aus der Lead-Landing: Landing 1 bleibt unangetastet, aber sie
// bleibt auch aenderbar. Ein Import von dort waere eine Leitung, durch die
// eine Aenderung an Landing 1 Landing 2 zerbrechen koennte - und umgekehrt.
// Die beiden Seiten teilen bewusst keine einzige Datei.
//
// Beide Werte sind oeffentliche Client-Konfiguration und stehen ohnehin im
// ausgelieferten App-Bundle. tests/landing2-isolation.test.mjs stellt sicher,
// dass sie nicht von /shared/firebase-config.js abweichen.

export const LANDING2_PROJECT_ID = "menyra-c0e68";
export const LANDING2_API_KEY = "AIzaSyAq5kzdGITDekgajC0uUBny63JjS1DIPEU";

export const LANDING2_FIRESTORE_BASE =
  `https://firestore.googleapis.com/v1/projects/${LANDING2_PROJECT_ID}/databases/(default)/documents`;
