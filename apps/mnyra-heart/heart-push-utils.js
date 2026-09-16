// Die Entscheidungen hinter der Push-Anmeldung - ohne Firebase, ohne Browser.
//
// WARUM EINE EIGENE DATEI. heart-push.js laedt /shared/firebase-config.js
// beim Import; damit laesst sich dort keine einzige Zeile aus einem Test
// heraus aufrufen. Was wirklich schiefgehen kann, ist aber nicht der
// Firestore-Aufruf, sondern die Entscheidung davor: ob dieses Geraet
// ueberhaupt Meldungen kann, ob der Token schon frisch genug dasteht, was
// im Dokument landet.
//
// Dieselbe Trennung fuehrt die Social-App
// (core/push/push-device-registration-utils.js) und aus demselben Grund.

// Wie oft der Token neu geschrieben wird, wenn er sich nicht geaendert hat.
// FCM dreht Tokens von selbst; einmal am Tag reicht, um mitzubekommen, dass
// dieses Geraet noch da ist, ohne bei jedem Start zu schreiben.
export const AUFFRISCHUNG_MS = 24 * 60 * 60 * 1000;

// Kann dieses Geraet ueberhaupt Meldungen empfangen?
//
// Die Reihenfolge ist Absicht: erst das, was gar nicht geht, dann erst die
// Frage nach der Erlaubnis (die stellt heart-push.js). Sonst fragte Heart
// auf einem iPhone im Safari-Tab nach einer Erlaubnis, die dort niemandem
// etwas nuetzt - denn Apple laesst Web Push nur in der ueber "Zum
// Home-Bildschirm" installierten Fassung zu. Dort fehlt "Notification" im
// Fenster, und genau daran faellt es hier auf.
export function kannPush(umgebung = globalThis) {
  if (!umgebung?.isSecureContext) return false;
  if (!umgebung?.navigator || !("serviceWorker" in umgebung.navigator)) return false;
  if (!("Notification" in umgebung)) return false;
  if (!("PushManager" in umgebung)) return false;
  return true;
}

// Steht derselbe Token schon frisch genug in Firestore?
export function istFrisch(merker, token, jetzt = Date.now(), fensterMs = AUFFRISCHUNG_MS) {
  if (!merker || typeof merker !== "object") return false;
  const sauber = String(token || "").trim();
  if (!sauber) return false;
  if (String(merker.token || "").trim() !== sauber) return false;
  const stand = Math.max(0, Number(merker.ts || 0) || 0);
  return (jetzt - stand) < fensterMs;
}

// Was in users/{uid}/devices/{id} steht.
//
// "app" unterscheidet dieses Geraet von demselben Telefon in der
// Social-App: Beide schreiben in dieselbe Sammlung, und wer spaeter sucht,
// warum eine Meldung zweimal ankam, sieht hier sofort, welche App gemeint
// ist. "enabled" ist das Feld, nach dem die Cloud Function filtert - ohne
// es findet sie das Geraet nicht.
export function geraetePaket({ token = "", userAgent = "", sprache = "", stempel = null } = {}) {
  return {
    token: String(token || "").trim(),
    enabled: true,
    platform: "web",
    app: "mnyra-heart",
    userAgent: String(userAgent || "").slice(0, 190),
    locale: String(sprache || "").slice(0, 24),
    updatedAt: stempel,
    lastSeenAt: stempel
  };
}

// Abmelden heisst stilllegen, nicht loeschen.
//
// Geloescht waere der Token beim naechsten Anmelden neu zu holen;
// stillgelegt bleibt er stehen und die Cloud Function ueberspringt ihn,
// weil sie nur nach enabled == true sucht.
export function stilllegenPaket({ stempel = null } = {}) {
  return { enabled: false, updatedAt: stempel };
}
