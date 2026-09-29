"use strict";

// Was die Conversions API an Meta schickt - und sonst nichts.
// ══════════════════════════════════════════════════════════════════════
//
// GETRENNT VON DER FUNKTION, weil hier die eine Frage entschieden wird,
// auf die es ankommt: WAS VERLAESST DAS HAUS. Diese Datei zieht kein
// firebase-functions und kein Netz; sie laesst sich deshalb ohne
// Emulator pruefen, und tests/lifeskin-capi.test.mjs tut das - unter
// anderem mit einer Sitzung, in der Name, Telefonnummer und Anschrift
// stehen, gegen die Zusicherung, dass nichts davon in der Nutzlast
// landet.

const PIXEL_ID = "1347571994123884";
const API_VERSION = "v21.0";
const SCHRITT_KAUF = "ordered";

function text(wert) {
  return typeof wert === "string" ? wert.trim() : "";
}

// Metas Zeitstempel sind Sekunden, nicht Millisekunden - und sie duerfen
// nicht aelter als sieben Tage sein, sonst verwirft Meta das Ereignis.
// Ein unlesbares Datum wird zu "jetzt": Lieber ein Ereignis mit einem
// Zeitpunkt, der eine Stunde danebenliegt, als gar keines.
function sekundenAus(iso) {
  const zeit = Date.parse(text(iso));
  const jetzt = Math.floor(Date.now() / 1000);
  if (!Number.isFinite(zeit)) return jetzt;
  const sekunden = Math.floor(zeit / 1000);
  const aeltesteErlaubt = jetzt - 6 * 24 * 60 * 60;
  return sekunden < aeltesteErlaubt || sekunden > jetzt + 60 ? jetzt : sekunden;
}

// Was Meta ueber den Besucher bekommt - und das ist alles.
//
// Ohne wenigstens eine dieser Angaben weist Meta das Ereignis ab. Sind
// beide leer (Pixel blockiert), wird trotzdem gemeldet: Meta entscheidet
// dann selbst, was es damit anfaengt, und ein Kauf ohne Zuordnung ist
// immer noch besser als kein Kauf.
//
// DIE KLICK-KENNUNG AUS DEM ERSTEN BESUCH. Gekauft wird meist Tage spaeter
// in Safari/Chrome (WhatsApp-Link) - dort gibt es kein _fbc, und ohne es
// ordnet Meta den Kauf keiner Anzeige zu. Der Trichter hat es beim ersten
// Besuch in der Herkunft gespeichert (source.fbc, lifeskin-session.js);
// liegt am Kauf keines, wird dieses genommen. Das des Kauf-Browsers geht
// vor: Es ist das frischere, wenn der Kauf selbst aus einer Anzeige kam.
//
// DER USER-AGENT DES BROWSERS (29.09., Pixel-Aenderung erlaubt von Albert
// am 29.09.2026). Meta verlangt ihn fuer jedes Website-Ereignis vom Server
// (client_user_agent). Der Ausloeser kennt die Anfrage des Browsers nicht;
// der Browser gibt ihn deshalb in der Bestellung mit (order.ua,
// browserAngaben in apps/lifeskin/lifeskin-pixel.js). Er beschreibt den
// Browser, nicht den Menschen.
function besucherDaten(order, herkunft = null) {
  const daten = {};
  const fbp = text(order?.fbp);
  const fbc = text(order?.fbc) || text(herkunft?.fbc);
  const ua = text(order?.ua).slice(0, 400);
  if (fbp) daten.fbp = fbp;
  if (fbc) daten.fbc = fbc;
  if (ua) daten.client_user_agent = ua;
  return daten;
}

// DIE SEITE, AUF DER GEKAUFT WURDE (order.seite) - nur unsere eigene
// Adresse und ohne Kennung im Pfad; alles andere wird zur festen Adresse.
// Jeder kann eine Sitzung schreiben: Eine fremde Seite geht nicht an Meta.
const EIGENE_SEITE = /^https:\/\/(www\.)?mnyra\.com(\/[a-z0-9-]*)?$/i;

function seiteAus(order, ersatz) {
  const seite = text(order?.seite);
  return EIGENE_SEITE.test(seite) ? seite : ersatz;
}

// Die Nutzlast fuer ein Purchase.
//
// Rein und ohne Nebenwirkung, damit sie sich ohne Netz pruefen laesst -
// und weil genau hier entschieden wird, was das Haus verlaesst.
function baueKauf(sitzung, { quelleUrl = "https://mnyra.com/lifeskin" } = {}) {
  const order = sitzung?.order || {};
  const betrag = Number(order.total);
  return {
    event_name: "Purchase",
    event_time: sekundenAus(order.createdAt || sitzung?.updatedAt),
    // DIESELBE KENNUNG WIE IM BROWSER. Daran und nur daran erkennt Meta,
    // dass die zwei Meldungen eine einzige Bestellung sind. Fehlt sie,
    // zaehlt Meta doppelt - und der gemessene Umsatz waere das Doppelte
    // des wirklichen.
    event_id: text(order.orderId),
    action_source: "website",
    event_source_url: seiteAus(order, quelleUrl),
    user_data: besucherDaten(order, sitzung?.source),
    custom_data: {
      currency: "EUR",
      value: Number.isFinite(betrag) && betrag > 0 ? betrag : 0,
      // Woher der Kauf kam - der Laden auf der Landingpage oder das
      // Angebot am Ende der Analyse. Im Ereignismanager laesst sich das
      // danach trennen.
      content_type: "product",
      order_id: text(order.orderId)
    }
  };
}

// Ob dieser Uebergang ueberhaupt eine Meldung ist.
function istKauf(davor, danach) {
  if (text(danach?.step) !== SCHRITT_KAUF) return false;
  if (text(davor?.step) === SCHRITT_KAUF) return false;
  // Bestellungen aus dem stillen Modus (order.still, shared/lifeskin-still.js)
  // sind eigene Probelaeufe - Meta bekommt sie nicht. Erlaubt von Albert
  // (Inhaber) am 28.09.2026.
  if (danach?.order?.still === true) return false;
  return Boolean(danach?.order);
}


module.exports = {
  PIXEL_ID,
  API_VERSION,
  SCHRITT_KAUF,
  text,
  sekundenAus,
  besucherDaten,
  seiteAus,
  baueKauf,
  istKauf
};
