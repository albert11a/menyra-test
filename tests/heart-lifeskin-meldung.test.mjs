// Die Meldung auf dem Telefon, wenn eine neue Analyse ankommt.
//
// DREI TEILE, DIE ZUSAMMENPASSEN MUESSEN - und die einzeln nichts tun:
//
//   1. Heart legt einen FCM-Token unter users/{uid}/devices/{id} ab.
//   2. Ein Firestore-Trigger schreibt beim Uebergang auf "captured" bzw.
//      "ordered" ein Meldungsdokument unter users/{uid}/notifications/{id}.
//   3. sendWebPushOnNotificationCreate liest die Geraete und schickt hinaus,
//      sw.js zeigt an.
//
// Faellt ein Teil aus, passiert nichts - und zwar still. Deshalb haelt diese
// Datei die Nahtstellen fest: die Feldnamen, nach denen die Cloud Function
// sucht, die Uebergaenge, bei denen gemeldet wird, und die Zusage, dass ein
// Fehlschlag Heart nie anhaelt.

import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

import {
  AUFFRISCHUNG_MS, geraetePaket, istFrisch, kannPush, stilllegenPaket
} from "../apps/mnyra-heart/heart-push-utils.js";

const lies = (p) => fs.readFileSync(path.join(process.cwd(), p), "utf8");
const FUNKTIONEN = lies("functions/index.js");
const PUSH = lies("apps/mnyra-heart/heart-push.js");
const HEART = lies("apps/mnyra-heart/heart.js");
const HEART_SW = lies("apps/mnyra-heart/sw.js");
const REGELN = lies("firestore.rules");
const EVENTS = lies("apps/mnyra-heart/heart-events.js");
const LIFESKIN_RENDER = lies("apps/mnyra-heart/heart-lifeskin-render.js");

// ---------------------------------------------------------------------------
// 1. Was Heart ueber dieses Geraet ablegt
// ---------------------------------------------------------------------------

test("das Geraetedokument traegt genau die Felder, nach denen die Funktion sucht", () => {
  const paket = geraetePaket({ token: " abc ", userAgent: "UA", sprache: "de-DE", stempel: "STEMPEL" });
  // enabled == true ist das Feld, nach dem sendWebPushOnNotificationCreate
  // filtert. Ohne es findet sie das Geraet nicht, und es faellt niemandem
  // auf - es kommt einfach keine Meldung.
  assert.equal(paket.enabled, true, "Ohne enabled findet die Funktion das Geraet nicht");
  assert.match(FUNKTIONEN, /collection\("devices"\)\s*\n?\s*\.where\("enabled", "==", true\)/,
    "Die Funktion filtert nicht mehr auf enabled - dann passt dieses Feld nicht mehr");
  assert.equal(paket.token, "abc", "Der Token wird nicht beschnitten");
  assert.equal(paket.app, "mnyra-heart",
    "Ohne eigene App-Kennung ist dasselbe Telefon in Heart und Social nicht zu unterscheiden");
  assert.equal(paket.platform, "web");
  assert.equal(paket.updatedAt, "STEMPEL");
});

test("abmelden legt still, es loescht nicht", () => {
  // Geloescht muesste der Token beim naechsten Anmelden neu geholt werden.
  const paket = stilllegenPaket({ stempel: "STEMPEL" });
  assert.equal(paket.enabled, false);
  assert.equal(paket.token, undefined, "Der Token wird mitgeloescht statt stillgelegt");
});

test("lange Werte sprengen das Dokument nicht", () => {
  const paket = geraetePaket({ token: "t", userAgent: "x".repeat(400), sprache: "y".repeat(80) });
  assert.equal(paket.userAgent.length, 190);
  assert.equal(paket.locale.length, 24);
});

// ---------------------------------------------------------------------------
// 2. Wann ueberhaupt registriert wird
// ---------------------------------------------------------------------------

test("ohne die Voraussetzungen wird gar nicht erst gefragt", () => {
  const voll = {
    isSecureContext: true,
    navigator: { serviceWorker: {} },
    Notification: {},
    PushManager: {}
  };
  assert.equal(kannPush(voll), true);
  assert.equal(kannPush({ ...voll, isSecureContext: false }), false, "Ohne HTTPS geht Push nicht");
  assert.equal(kannPush({ ...voll, navigator: {} }), false, "Ohne Service Worker geht Push nicht");
  // DAS IST DER IPHONE-FALL. Apple laesst Web Push nur in der ueber "Zum
  // Home-Bildschirm" installierten Fassung zu; im Safari-Tab fehlt
  // Notification im Fenster. Hier faellt es auf, und es passiert nichts -
  // statt dass Heart nach einer Erlaubnis fragt, die dort nichts bewirkt.
  const ohneNotification = { ...voll };
  delete ohneNotification.Notification;
  assert.equal(kannPush(ohneNotification), false, "Im Safari-Tab wird trotzdem gefragt");
  const ohnePush = { ...voll };
  delete ohnePush.PushManager;
  assert.equal(kannPush(ohnePush), false);
  assert.equal(kannPush(undefined), false, "Ohne Umgebung wirft es statt false zu liefern");
});

test("derselbe Token wird nicht bei jedem Start neu geschrieben", () => {
  const jetzt = 1_000_000_000;
  assert.equal(istFrisch({ token: "a", ts: jetzt - 1000 }, "a", jetzt), true);
  assert.equal(istFrisch({ token: "a", ts: jetzt - AUFFRISCHUNG_MS - 1 }, "a", jetzt), false,
    "Nach einem Tag muss neu geschrieben werden - sonst faellt ein gedrehter Token nie auf");
  assert.equal(istFrisch({ token: "a", ts: jetzt }, "b", jetzt), false,
    "Ein neuer Token muss geschrieben werden");
  assert.equal(istFrisch(null, "a", jetzt), false);
  assert.equal(istFrisch({ token: "a", ts: jetzt }, "", jetzt), false);
});

test("beim Start wird nicht von selbst nach der Erlaubnis gefragt", () => {
  // Ein Erlaubnisfenster, das ungefragt aufgeht, wird weggetippt - und
  // danach steht "denied" und laesst sich nur noch in den
  // Systemeinstellungen aendern. Eine einzige falsche Zeile hier kostet die
  // Meldungen dauerhaft.
  assert.match(PUSH, /if \(stand !== "default" \|\| !interaktiv\) return false;/,
    "Es wird auch ohne Beruehrung nach der Erlaubnis gefragt");
  assert.match(HEART, /meldeGeraetAn\(state\.auth\.user\?\.uid\)/,
    "Heart meldet das Geraet nicht an");
  // Der Start-Aufruf uebergibt keine Optionen - also kein interaktiv. Der
  // Knopf darf es, und nur er: Er ist die eine Gelegenheit zu fragen, und
  // die wird nicht an einen Seitenaufruf verschenkt.
  const startAufruf = HEART.match(/meldeGeraetAn\(state\.auth\.user\?\.uid[^)]*\)/)[0];
  assert.ok(!/interaktiv/.test(startAufruf),
    `Heart fragt beim Start interaktiv nach der Erlaubnis: ${startAufruf}`);
});

test("gefragt wird nur auf eine Beruehrung hin - und genau an einer Stelle", () => {
  // Ohne diesen Knopf fragt nie jemand nach der Erlaubnis, und die ganze
  // Strecke bleibt still: Heart registriert keinen Token, die Funktion
  // findet kein Geraet, es kommt keine Meldung. Genau diese Luecke ist beim
  // Bauen einmal entstanden.
  assert.match(LIFESKIN_RENDER, /data-action="heart-push-einschalten"/,
    "In den Analysen fehlt der Knopf, der die Meldungen einschaltet");
  assert.match(EVENTS, /action === "heart-push-einschalten"/, "Der Knopf ist nicht verdrahtet");
  assert.match(HEART, /async schalteHeartPushEin\(\)/, "Es gibt keinen Handler fuer den Knopf");
  assert.match(HEART, /meldeGeraetAn\(uid, \{ interaktiv: true, erzwingen: true \}\)/,
    "Der Knopf fragt nicht nach der Erlaubnis");
  // Und genau EINE Stelle fragt interaktiv.
  const interaktiv = (HEART.match(/interaktiv: true/g) || []).length;
  assert.equal(interaktiv, 1, `Es fragen ${interaktiv} Stellen interaktiv, nicht eine`);
});

test("der Knopf sagt die Wahrheit ueber dieses Geraet", () => {
  // Sein Text kommt aus dem Browser und nicht aus dem Zustand: Wer die
  // Erlaubnis in den Systemeinstellungen aendert, sieht es nach dem
  // naechsten Zeichnen - ein Wert im Speicher waere dann eine zweite
  // Wahrheit, die von der ersten abweicht.
  assert.match(HEART, /function pushSchalterAuffrischen\(/, "Der Knopf wird nie beschriftet");
  assert.match(HEART, /globalThis\.Notification\?\.permission/,
    "Der Stand kommt nicht aus dem Browser");
  // Kann das Geraet gar nicht, verschwindet der Knopf ganz. Ein Schalter,
  // der nichts schaltet, ist schlimmer als keiner.
  assert.match(HEART, /if \(!kannPush\(\)\) \{ kasten\.hidden = true; return; \}/,
    "Auf einem Geraet ohne Push steht trotzdem ein Schalter");
  // Bei "denied" hilft kein Knopf mehr - der Browser fragt nicht noch einmal.
  assert.match(HEART, /Einstellungen des Telefons/,
    "Bei abgelehnter Erlaubnis steht nicht da, wo man sie wieder einschaltet");
  // Und der iPhone-Hinweis steht da, wo er gebraucht wird.
  assert.match(HEART, /Home-Bildschirm/,
    "Auf dem iPhone fehlt der Hinweis, dass Heart installiert sein muss");
});

test("ein Fehlschlag haelt Heart nicht an", () => {
  // Ein Arbeitsplatz, der wegen einer Benachrichtigung nicht aufgeht, ist
  // schlimmer als einer ohne Benachrichtigung.
  assert.match(HEART, /meldeGeraetAn\([^)]*\)\.catch\(\(\) => \{\}\)/,
    "Ein Fehler beim Anmelden schlaegt bis in Heart durch");
  assert.match(PUSH, /\.catch\(\(\) => false\)/, "meldeGeraetAn kann werfen");
  // Und jeder einzelne Schritt endet in false statt in einer Ausnahme.
  for (const stelle of ["navigator.serviceWorker.ready", "firebase-messaging.js", "setDoc("]) {
    assert.ok(PUSH.includes(stelle), `${stelle} fehlt`);
  }
  assert.ok((PUSH.match(/} catch \{/g) || []).length >= 5,
    "Nicht jeder Weg nach draussen ist abgefangen");
});

test("eine Kennung je Geraet, nicht je Anmeldung", () => {
  // Ohne sie legte jeder Start ein neues Geraet an, und dasselbe Telefon
  // bekaeme dieselbe Meldung fuenfmal.
  assert.match(PUSH, /export function geraeteId\(\)/);
  assert.match(PUSH, /mnyra_heart_push_device_id/);
});

// ---------------------------------------------------------------------------
// 3. Wann der Server meldet
// ---------------------------------------------------------------------------

test("gemeldet wird beim Uebergang, nicht bei jedem Schreibvorgang", () => {
  // Der Trichter schreibt auch nach "captured" weiter - Messwerte,
  // Verhaeltnisse, Zeiten. Ohne den Vergleich mit dem Stand davor kaeme bei
  // jedem dieser Schreibvorgaenge eine neue Meldung.
  assert.match(FUNKTIONEN, /exports\.notifyCeoOnLifeskinSessionWrite/,
    "Der Trigger fehlt");
  assert.match(FUNKTIONEN, /firestore\.document\("lifeskin\/\{tenantId\}\/sessions\/\{sessionId\}"\)/,
    "Der Trigger haengt am falschen Pfad");
  assert.match(FUNKTIONEN, /if \(jetzt < 0 \|\| jetzt <= vorher\) return;/,
    "Es wird auf den Zustand gemeldet statt auf den Uebergang");
  // onWrite und nicht onCreate: Die Sitzung entsteht bei "opened" und wird
  // danach fortgeschrieben.
  const block = FUNKTIONEN.slice(FUNKTIONEN.indexOf("exports.notifyCeoOnLifeskinSessionWrite"));
  assert.match(block.slice(0, 400), /\.onWrite\(/,
    "onCreate faengt nur den ersten Seitenaufruf, nicht die fertige Analyse");
});

test("gemeldet wird bei den Fotos und bei der Bestellung - nicht beim ersten Klick", () => {
  const block = FUNKTIONEN.slice(
    FUNKTIONEN.indexOf("const LIFESKIN_MELDUNGEN"),
    FUNKTIONEN.indexOf("const LIFESKIN_MELDUNG_CEO_UID")
  );
  assert.match(block, /schritt: "captured"/, "Die neue Analyse wird nicht gemeldet");
  assert.match(block, /schritt: "ordered"/, "Die Bestellung wird nicht gemeldet");
  assert.ok(!/schritt: "opened"/.test(block),
    "Es wird bei jedem Anzeigenklick gemeldet - ohne Namen und ohne Analyse");
  assert.ok(!/schritt: "named"/.test(block),
    "Es wird gemeldet, bevor eine Analyse vorliegt");
  // Der Satz, den der Kunde auf dem Sperrbildschirm liest.
  assert.match(block, /Sie haben eine neue Analyse, \$\{name\}/);
  assert.match(block, /Neue Bestellung, \$\{name\}/);
  // Ohne Namen bleibt der Satz ein Satz.
  assert.match(block, /name \? .* : "Sie haben eine neue Analyse"/);
});

test("die Schrittfolge stimmt mit der des Trichters ueberein", () => {
  // Steht hier eine andere Reihenfolge als in lifeskin-session.js, zeigt der
  // Vergleich "vorher/jetzt" auf die falsche Stufe - und es wird entweder
  // nie oder bei jedem Schreibvorgang gemeldet.
  const ausFunktion = FUNKTIONEN
    .slice(FUNKTIONEN.indexOf("const LIFESKIN_SCHRITTE"))
    .match(/\[([\s\S]*?)\]/)[1]
    .match(/"[a-z]+"/g)
    .map((x) => x.replace(/"/g, ""));
  const ausTrichter = lies("apps/lifeskin/lifeskin-session.js")
    .slice(lies("apps/lifeskin/lifeskin-session.js").indexOf("const SCHRITTE"))
    .match(/\[([\s\S]*?)\]/)[1]
    .match(/"[a-z]+"/g)
    .map((x) => x.replace(/"/g, ""));
  assert.deepEqual(ausFunktion, ausTrichter,
    "Die Schrittfolge der Funktion weicht von der des Trichters ab");
});

test("zweimal dieselbe Meldung geht nicht hinaus", () => {
  // Die Kennung des Meldungsdokuments steht fest, und
  // sendWebPushOnNotificationCreate haengt an onCreate: Ein zweites set()
  // auf dieselbe Kennung ist eine Aenderung und schickt nichts mehr.
  assert.match(FUNKTIONEN, /sanitizeNotificationDocId\(`\$\{vorlage\.type\}_\$\{sessionId\}`\)/,
    "Die Kennung der Meldung ist nicht mehr fest - dann kommt sie mehrfach");
  assert.match(FUNKTIONEN, /\.firestore\.document\("users\/\{userId\}\/notifications\/\{notificationId\}"\)\s*\n?\s*\.onCreate/,
    "Der Versand haengt nicht mehr an onCreate - dann traegt die feste Kennung nichts mehr");
});

test("die beiden Typen duerfen wirklich hinaus", () => {
  // Ein Typ, der nicht in der Liste steht, wird von der Versandfunktion
  // stillschweigend verworfen - das Dokument steht dann da und nichts
  // passiert.
  const liste = FUNKTIONEN.slice(
    FUNKTIONEN.indexOf("const PUSH_NOTIFICATION_ALLOWED_TYPES"),
    FUNKTIONEN.indexOf("// LifeSkin: die Hautanalyse")
  );
  const ganz = FUNKTIONEN.slice(FUNKTIONEN.indexOf("const PUSH_NOTIFICATION_ALLOWED_TYPES"));
  assert.match(ganz.slice(0, 700), /"lifeskin_analyse"/, "lifeskin_analyse wird verworfen");
  assert.match(ganz.slice(0, 700), /"lifeskin_porosia"/, "lifeskin_porosia wird verworfen");
  // Und die bisherigen bleiben drin.
  for (const typ of ["chat_message", "follow", "like", "comment", "restaurant_order"]) {
    assert.ok(liste.includes(`"${typ}"`), `${typ} ist aus der Liste gefallen`);
  }
});

test("der Satz kommt unveraendert an, ohne Namen davor", () => {
  // resolveNotificationBody stellt sonst den Akteur vor den Text, und
  // "Valmire Sie haben eine neue Analyse" ist kein Satz.
  assert.match(FUNKTIONEN, /if \(type === "lifeskin_analyse" \|\| type === "lifeskin_porosia"\) \{\s*\n\s*return text/,
    "Der fertige Satz wird wieder zusammengebaut");
  assert.match(FUNKTIONEN, /user: "",/, "Es wird ein Akteur gesetzt, der dann vor den Satz rutscht");
  // Und die Ueberschrift sagt, worum es geht.
  assert.match(FUNKTIONEN, /return "LifeSkin";/, "Ueber der Meldung steht weiter nur 'Menyra'");
});

test("der Empfaenger steht fest, auch ohne Einrichtung", () => {
  assert.match(FUNKTIONEN, /const LIFESKIN_MELDUNG_CEO_UID = "aklBkkIuZ7Nrpx266TJn63rrxX62"/,
    "Ohne festen Empfaenger kommt am ersten Tag nichts an");
  // Dieselbe Kennung wie ueberall sonst.
  assert.match(lies("shared/ceo-access.js"), /ALBERT_CEO_UID = "aklBkkIuZ7Nrpx266TJn63rrxX62"/,
    "Die Kennung in den Funktionen passt nicht mehr zu shared/ceo-access.js");
  // Und ein Ausfall beim Lesen der Zweitzugaenge nimmt ihn nicht mit.
  const laden = FUNKTIONEN.slice(FUNKTIONEN.indexOf("async function ladeLifeskinEmpfaenger"));
  assert.match(laden.slice(0, 700), /catch \(error\)/,
    "Ein unlesbares superadmins reisst die ganze Meldung mit");
});

// ---------------------------------------------------------------------------
// 4. Wo die Meldung ankommt
// ---------------------------------------------------------------------------

test("Heart nimmt die Meldung in seinem eigenen Worker entgegen", () => {
  // Heart meldet einen eigenen Service Worker an; ein Push kommt immer bei
  // dem Worker an, der das Abonnement haelt. Ohne diese Handler zeigte iOS
  // eine leere Platzhaltermeldung, und Antippen fuehrte nirgendwohin.
  assert.match(HEART_SW, /addEventListener\('push'/, "Heart hat keinen push-Handler");
  assert.match(HEART_SW, /addEventListener\('notificationclick'/, "Antippen tut nichts");
  assert.match(HEART_SW, /showNotification\(/);
  assert.match(PUSH, /serviceWorkerRegistration: anmeldung/,
    "FCM registriert sich selbst einen dritten Worker, der von Heart nichts weiss");
});

test("das Antippen fuehrt nach Heart und macht kein zweites Fenster auf", () => {
  const klick = HEART_SW.slice(HEART_SW.indexOf("addEventListener('notificationclick'"));
  assert.match(klick, /pathname\.startsWith\('\/heart'\)/, "Ein offenes Heart wird nicht gefunden");
  assert.match(klick, /openWindow/, "Ohne offenes Heart passiert nichts");
  assert.match(FUNKTIONEN, /link: "\/heart\/#lifeskin"/, "Die Meldung fuehrt nicht zu den Analysen");
});

test("Heart darf sein Geraet eintragen, aber niemand die Meldung erfinden", () => {
  // Ohne die erste Regel steht der Token nirgends; ohne die zweite koennte
  // jeder Angemeldete sich selbst Meldungen schreiben, und die Funktion
  // schickte sie hinaus.
  const geraete = REGELN.slice(REGELN.indexOf("match /devices/{deviceId}"));
  assert.match(geraete.slice(0, 200), /allow get, list, create, update, delete: if isSelf\(userId\)/,
    "Heart darf seinen Token nicht mehr ablegen");
  const meldungen = REGELN.slice(REGELN.indexOf("match /notifications/{notificationId}"));
  assert.match(meldungen.slice(0, 200), /allow create: if false/,
    "Meldungen lassen sich vom Browser aus erfinden");
  assert.match(FUNKTIONEN, /if \(data\.serverAuth !== true\)/,
    "Die Versandfunktion prueft die Herkunft nicht mehr");
  assert.match(FUNKTIONEN, /serverAuth: true/, "Die LifeSkin-Meldung wird als untrusted verworfen");
});
