// Oeffentliche Firebase-Web-Konfiguration fuer die Lead-Landing.
//
// Bewusst als eigene Konstanten und NICHT aus /shared/firebase-config.js
// importiert: jener Modulpfad zieht firebase-app, firebase-auth und
// firebase-firestore (zusammen ~679 KB) und initialisiert Firestore mit
// persistentem IndexedDB-Cache und Multi-Tab-Manager. Die Landing wuerde
// damit an der Persistenz-Koordination der echten App teilnehmen. Die
// Landing liest stattdessen ueber die REST-API - kein SDK, keine geteilte
// Firebase-Instanz, keine Beruehrung mit der App.
//
// Beide Werte sind oeffentliche Client-Konfiguration und stehen ohnehin im
// ausgelieferten App-Bundle. tests/lead-landing-config.test.mjs stellt
// sicher, dass sie nicht von /shared/firebase-config.js abweichen.

export const LEAD_LANDING_PROJECT_ID = "menyra-c0e68";
export const LEAD_LANDING_API_KEY = "AIzaSyAq5kzdGITDekgajC0uUBny63JjS1DIPEU";

export const LEAD_LANDING_FIRESTORE_BASE =
  `https://firestore.googleapis.com/v1/projects/${LEAD_LANDING_PROJECT_ID}/databases/(default)/documents`;
