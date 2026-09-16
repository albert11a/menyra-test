// Die Meldung auf dem Telefon, wenn eine neue Analyse ankommt.
//
// WAS DIESES MODUL TUT, UND WAS NICHT.
//
// Es tut genau eine Sache: Es holt fuer dieses Geraet einen FCM-Token und
// legt ihn unter users/{uid}/devices/{geraeteId} ab. Alles andere steht
// schon:
//
//   functions/index.js  sendWebPushOnNotificationCreate liest genau diese
//                       Sammlung und schickt die Meldung hinaus.
//   sw.js               nimmt sie entgegen und zeigt sie an.
//
// Ohne diesen Eintrag findet die Funktion kein Geraet und schickt nichts -
// das war der einzige fehlende Schritt, nicht die halbe Strecke.
//
// ES DARF HEART NIE ANHALTEN. Jeder Weg hier endet in false, nicht in einer
// Ausnahme: kein sicherer Kontext, keine Erlaubnis, kein Service Worker,
// Firestore streikt - Heart laeuft unveraendert weiter, nur ohne Meldung.
// Ein Arbeitsplatz, der wegen einer Benachrichtigung nicht aufgeht, ist
// schlimmer als einer ohne Benachrichtigung.
//
// AUF DEM IPHONE GEHT DAS NUR ALS INSTALLIERTE APP. Apple laesst Web Push
// ab iOS 16.4 zu, aber ausschliesslich, wenn die Seite ueber "Zum
// Home-Bildschirm" hinzugefuegt wurde. Im Safari-Tab gibt es kein
// Notification-Objekt, hier faellt dann `!("Notification" in window)` und
// es passiert nichts. Das ist keine Luecke in diesem Modul - das ist Apple,
// und kein Code umgeht es.

import { db } from "/shared/firebase-config.js";
import {
  doc,
  setDoc,
  serverTimestamp
} from "/shared/vendor/firebase/11.0.0/firebase-firestore.js";
import {
  geraetePaket,
  istFrisch,
  kannPush,
  stilllegenPaket
} from "./heart-push-utils.js";

// Derselbe oeffentliche Schluessel wie in der Social-App. Er ist oeffentlich
// (er steht im Browser jedes Besuchers) und gehoert zum Projekt, nicht zum
// Konto - zwei verschiedene waeren zwei Push-Zustellungen fuer dieselbe
// Firebase-App.
const VAPID_KEY = "BERxbC5-yX8miGIVaFJGAapzd0-jL0D9HQf3swOJiKZcAJsAO_FoC-8v7DCCcDgmfgkKcMVd0X6VVq8zD2hePqk";

const GERAETE_SCHLUESSEL = "mnyra_heart_push_device_id";
const MERKER_SCHLUESSEL = "mnyra_heart_push_token_meta";

let laeuft = null;

function leseSpeicher(schluessel) {
  try {
    return globalThis.localStorage?.getItem(schluessel) || "";
  } catch {
    // Privater Modus, gesperrte Website-Daten: Dann wird eben jedes Mal neu
    // geschrieben. Das ist der teurere, aber nie der kaputte Weg.
    return "";
  }
}

function schreibeSpeicher(schluessel, wert) {
  try {
    globalThis.localStorage?.setItem(schluessel, wert);
  } catch {
    // Siehe oben.
  }
}

// Eine Kennung je Geraet, nicht je Anmeldung.
//
// Ohne sie legte jeder Start ein neues Geraet an, und die Funktion schickte
// dieselbe Meldung fuenfmal an dasselbe Telefon.
export function geraeteId() {
  const vorhanden = leseSpeicher(GERAETE_SCHLUESSEL);
  if (vorhanden) return vorhanden;
  const neu = `heart_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36)}`;
  schreibeSpeicher(GERAETE_SCHLUESSEL, neu);
  return neu;
}

function leseMerker() {
  try {
    return JSON.parse(leseSpeicher(MERKER_SCHLUESSEL) || "null");
  } catch {
    return null;
  }
}

async function holeErlaubnis({ interaktiv = false } = {}) {
  const stand = globalThis.Notification?.permission || "denied";
  if (stand === "granted") return true;
  // NUR AUF EINE BERUEHRUNG HIN FRAGEN. Ein Erlaubnisfenster, das beim
  // Laden von selbst aufgeht, wird weggetippt - und danach ist die Antwort
  // "denied" und laesst sich nicht mehr aendern, ausser in den
  // Systemeinstellungen. Beim Start wird deshalb nur registriert, wenn die
  // Erlaubnis schon steht.
  if (stand !== "default" || !interaktiv) return false;
  try {
    return (await globalThis.Notification.requestPermission()) === "granted";
  } catch {
    return false;
  }
}

// Wie lange auf den Service Worker gewartet wird, bevor aufgegeben wird.
//
// Ohne Frist kann die Anmeldung still haengen bleiben: navigator.service-
// Worker.ready wartet auf den Worker, der DIESE Seite steuert - und unter
// /heart/ gibt es den nicht (siehe holeAnmeldung). Ein haengendes ready
// belegt ausserdem "laeuft", und dann versucht es auch der Knopf nicht mehr.
const WARTEZEIT_MS = 8000;

// Hearts eigener Bereich: /apps/mnyra-heart/. Genau der Bereich, unter dem
// heart.js "./sw.js" anmeldet - ein anderer waere eine zweite Wahrheit.
const SW_BEREICH = new URL("./", import.meta.url).toString();

function mitFrist(versprechen, ms = WARTEZEIT_MS) {
  return Promise.race([
    Promise.resolve(versprechen),
    new Promise((fertig) => { globalThis.setTimeout?.(() => fertig(null), ms); })
  ]).catch(() => null);
}

// Warten, bis der Worker wirklich laeuft.
//
// Ein Push-Abonnement haengt an einem aktiven Worker; frisch angemeldet ist
// er erst "installing". Ohne dieses Warten scheitert getToken beim ersten
// Start nach dem Installieren - also genau dann, wenn jemand die Meldungen
// gerade einschaltet.
function wirdAktiv(anmeldung, ms = WARTEZEIT_MS) {
  if (!anmeldung) return Promise.resolve(null);
  if (anmeldung.active) return Promise.resolve(anmeldung);
  return mitFrist(new Promise((fertig) => {
    const pruefen = () => { if (anmeldung.active) fertig(anmeldung); };
    try {
      (anmeldung.installing || anmeldung.waiting)?.addEventListener?.("statechange", pruefen);
      anmeldung.addEventListener?.("updatefound", () => {
        anmeldung.installing?.addEventListener?.("statechange", pruefen);
      });
    } catch {
      // Ein Browser, der hier mauert, faellt in die Frist - nicht in eine
      // Ausnahme.
    }
    pruefen();
  }), ms);
}

// DER SERVICE WORKER VON HEART, nicht der der Hauptseite.
//
// FCM haengt das Abonnement an die Anmeldung, die es hier bekommt, und der
// Push landet spaeter bei genau dem Worker, der es haelt. Zwei Fallen:
//
//   Ohne Uebergabe sucht FCM sich selbst einen ("/firebase-messaging-sw.js")
//   und legt einen dritten daneben, der von Heart nichts weiss.
//
//   navigator.serviceWorker.ready liefert nicht Hearts Worker, sondern den,
//   der DIESE Seite steuert. In der installierten Fassung ist das Hearts
//   eigener - unter /heart/ aber nicht: Heart meldet seinen Worker unter
//   /apps/mnyra-heart/ an, und ein Bereich, der die Seite nicht deckt,
//   steuert sie auch nicht. Dort antwortet dann der Worker der Hauptseite
//   (die Meldung kaeme als "Menyra" und fuehrte in die Social-App) oder
//   ueberhaupt niemand, und die Anmeldung wartet bis zum Neuladen.
//
// Deshalb wird nach Hearts Bereich gefragt und nicht danach, wer gerade
// diese Seite steuert.
async function holeAnmeldung() {
  if (!globalThis.navigator?.serviceWorker) return null;
  let eigene = null;
  try {
    eigene = await mitFrist(globalThis.navigator.serviceWorker.getRegistration(SW_BEREICH));
  } catch {
    eigene = null;
  }
  const aktiv = await wirdAktiv(eigene);
  if (aktiv) return aktiv;

  // Heart hat seinen Worker noch nicht angemeldet - heart.js tut das beim
  // "load", und beim ersten Start kann die Anmeldung frueher dran sein.
  // Dann nimmt sie, was diese Seite steuert: eine Meldung ueber den Worker
  // der Hauptseite ist immer noch besser als keine, und beim naechsten
  // Start steht Hearts eigener da und uebernimmt.
  try {
    return await mitFrist(globalThis.navigator.serviceWorker.ready);
  } catch {
    return null;
  }
}

// Der eigentliche Weg. Gibt true zurueck, wenn ein Token in Firestore steht.
async function registriereWirklich(uid, { interaktiv = false, erzwingen = false } = {}) {
  const konto = String(uid || "").trim();
  if (!konto || !kannPush()) return false;
  if (!(await holeErlaubnis({ interaktiv }))) return false;

  const anmeldung = await holeAnmeldung();
  if (!anmeldung) return false;

  let token = "";
  try {
    const messaging = await import("/shared/vendor/firebase/11.0.0/firebase-messaging.js");
    if (typeof messaging.isSupported === "function" && !(await messaging.isSupported())) return false;
    token = String(await messaging.getToken(messaging.getMessaging(), {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: anmeldung
    }) || "").trim();
  } catch {
    // Kein Push-Dienst erreichbar, Schluessel abgelehnt, Browser kann es
    // nicht: Heart laeuft weiter.
    return false;
  }
  if (!token) return false;

  if (!erzwingen && istFrisch(leseMerker(), token)) return true;

  try {
    await setDoc(
      doc(db, "users", konto, "devices", geraeteId()),
      geraetePaket({
        token,
        userAgent: globalThis.navigator?.userAgent || "",
        sprache: globalThis.navigator?.language || "",
        stempel: serverTimestamp()
      }),
      { merge: true }
    );
  } catch {
    return false;
  }

  schreibeSpeicher(MERKER_SCHLUESSEL, JSON.stringify({ token, ts: Date.now() }));
  return true;
}

// Von aussen: einmal je Anmeldung anstossen.
//
// Mehrere Aufrufe gleichzeitig teilen sich einen Lauf - Heart zeichnet bei
// jeder Zustandsaenderung neu, und ohne das liefen fuenf Registrierungen
// nebeneinander.
export function meldeGeraetAn(uid, optionen = {}) {
  if (laeuft) return laeuft;
  laeuft = registriereWirklich(uid, optionen)
    .catch(() => false)
    .finally(() => { laeuft = null; });
  return laeuft;
}

// Beim Abmelden wird der Token nicht geloescht, sondern stillgelegt.
//
// Geloescht waere er beim naechsten Anmelden neu zu holen; stillgelegt
// bleibt er stehen und die Funktion ueberspringt ihn, weil sie nur nach
// enabled == true sucht.
export async function meldeGeraetAb(uid) {
  const konto = String(uid || "").trim();
  if (!konto) return;
  try {
    await setDoc(
      doc(db, "users", konto, "devices", geraeteId()),
      stilllegenPaket({ stempel: serverTimestamp() }),
      { merge: true }
    );
  } catch {
    // Wer sich abmeldet, wartet nicht darauf.
  }
}
