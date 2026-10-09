"use strict";

const { createHash } = require("node:crypto");

// Was die Conversions API an Meta schickt - und sonst nichts.
// ══════════════════════════════════════════════════════════════════════
//
// Pixel-Aenderung erlaubt von Albert am 02.10.2026: Telefonnummernabgleich
// fuer Lead/Purchase, serverseitig normalisiert und SHA-256-gehasht.
// Auf ausdruecklichen Wunsch ohne zusaetzliche Checkbox oder UI-Aenderung.
// Keine Aufnahmen, Befunde, Namen, Anschriften oder Antworten uebermitteln.

const PIXEL_ID = "1347571994123884";
// DIE VERSION DER SCHNITTSTELLE. v21.0 war bei Meta seit dem 09.09.2025
// abgelaufen; auf /events gibt es keine Zusage, dass Meta alte Aufrufe
// stillschweigend anhebt. v26.0 erschien am 29.07.2026. Pixel-Aenderung
// erlaubt von Albert am 01.10.2026: CAPI-Version v21.0 -> v26.0.
// Wenn Meta eine neue Fassung bringt: hier anheben (tests/lifeskin-capi.test.mjs).
const API_VERSION = "v26.0";
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
//
// DER BROWSER, DER GERADE ANFRAGT (01.10., Pixel-Aenderung erlaubt von Albert
// am 01.10.2026): Meldet api/lifeskin-capi.js, kommt die Anfrage vom Browser
// des Kunden selbst - Sekunden nach dem Speichern. Seine Adresse und sein
// User-Agent sind genau das, was der Pixel im Browser ohnehin an Meta
// schickt; ohne sie ordnet Meta das Ereignis vom Server schlechter zu. Was
// in der Bestellung steht, geht vor (es ist der Kauf-Browser); die Anfrage
// fuellt nur, was fehlt.
function besucherDaten(order, herkunft = null, browser = null) {
  const daten = {};
  const fbp = text(order?.fbp) || text(browser?.fbp);
  const fbc = text(order?.fbc) || text(herkunft?.fbc) || text(browser?.fbc);
  const ua = (text(order?.ua) || text(browser?.ua)).slice(0, 400);
  const ip = text(browser?.ip);
  if (fbp) daten.fbp = fbp;
  if (fbc) daten.fbc = fbc;
  if (ua) daten.client_user_agent = ua;
  if (ip) daten.client_ip_address = ip;
  return daten;
}

// Kosovo/Albanien/Oesterreich: internationale Nummern erhalten ihren
// Laendercode, lokale Kosovo-Nummern bekommen 383. Keine geratenen Fremdnummern.
//
// WIE GETIPPT WIRD (Pixel-Aenderung erlaubt von Albert am 09.10.2026):
// "044/123/456" fiel wegen der Schraegstriche ganz weg, und "+383 (0)44 ..."
// wurde zu "383044..." - einer Nummer, die es nicht gibt. Die Null nach der
// Laendervorwahl ist die Inlandsvorwahl und gehoert nie zur Nummer.
function telefonNormalisieren(wert) {
  const roh = text(wert);
  if (!roh || !/^[+\d\s()./-]+$/.test(roh)) return "";
  let nummer = roh.replace(/\(0\)/g, "").replace(/[^\d]/g, "");
  if (roh.startsWith("+")) {
    if (!/^\s*\+[^+]*$/.test(roh)) return "";
  } else if (nummer.startsWith("00")) nummer = nummer.slice(2);
  else if (/^0[34]\d{7}$/.test(nummer)) nummer = `383${nummer.slice(1)}`;
  else if (/^[34]\d{7}$/.test(nummer)) nummer = `383${nummer}`;
  else if (!/^(383|355|43)/.test(nummer)) return "";
  nummer = nummer.replace(/^(383|355|43|49|41)0/, "$1");
  return /^[1-9]\d{7,14}$/.test(nummer) ? nummer : "";
}

function kundenDaten(sitzung) {
  const telefon = telefonNormalisieren(sitzung?.phone);
  if (!telefon) return {};
  return { ph: [createHash("sha256").update(telefon).digest("hex")] };
}

// Was der Browser in seiner Anfrage mitbringt - geprueft, nicht geglaubt.
// Nur Metas eigene Kennungen in Metas Form, ein User-Agent und eine Adresse,
// die wie eine aussieht. Alles andere faellt weg.
const FBP_FORM = /^fb\.\d\.\d{10,16}\.\d{1,24}$/;
const FBC_FORM = /^fb\.\d\.\d{10,16}\.[\w.-]{1,400}$/;
const IP_FORM = /^[0-9a-f:.]{3,45}$/i;
function browserAusAnfrage({ fbp = "", fbc = "", ua = "", ip = "", seite = "" } = {}) {
  const raus = {};
  if (FBP_FORM.test(text(fbp))) raus.fbp = text(fbp);
  if (FBC_FORM.test(text(fbc))) raus.fbc = text(fbc);
  const agent = text(ua).slice(0, 400);
  if (agent) raus.ua = agent;
  const adresse = text(String(ip || "").split(",")[0]);
  if (IP_FORM.test(adresse)) raus.ip = adresse;
  if (EIGENE_SEITE.test(text(seite))) raus.seite = text(seite);
  return raus;
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
function baueKauf(sitzung, { quelleUrl = "https://mnyra.com/lifeskin", browser = null } = {}) {
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
    user_data: { ...besucherDaten(order, sitzung?.source, browser), ...kundenDaten(sitzung) },
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

// ══ LEAD VOM SERVER (01.10., Pixel-Aenderung erlaubt von Albert am
// 01.10.2026: Lead zusaetzlich ueber die Conversions API) ══════════════
//
// Lead ist das Ereignis, auf das die Anzeigen lernen - und bisher kam es nur
// aus dem Browser, wo iOS und Blocker einen Teil verschlucken. Jetzt kommt
// es zweimal, und Meta legt die zwei an derselben Kennung zusammen.
//
// DIE KENNUNG: die Fallnummer mit "-lead" - im Browser (lifeskin-pixel.js,
// leadKennung) und hier dieselbe Rechnung. Die Kennung der Sitzung geht
// nie hinaus: Sie oeffnet den Befund.
function leadKennung(code) {
  const nummer = text(code);
  return nummer ? `${nummer}-lead` : "";
}

// Ein Lead ist: die Nummer mit Einwilligung (Trichter, Warteseite) oder der
// Griff zu WhatsApp auf der Warteseite (wer dort keine Nummer gab).
// DIE ZUSTIMMUNG (Pixel-Aenderung erlaubt von Albert am 07.10.2026): Die
// Conversions API meldet nur, wer im Cookie-Fenster "Pranoj" gedrueckt hat
// (shared/lifeskin-zustimmung.js -> device.zustimmung in der Sitzung).
// Fehlt die Wahl oder ist sie "nein", geht nichts an Meta.
function metaErlaubt(sitzung) {
  return sitzung?.device?.zustimmung === "ja";
}

function istLead(sitzung) {
  return metaErlaubt(sitzung) && Boolean((sitzung?.phoneConsent === true && text(sitzung?.phone)) || sitzung?.waClick === true);
}

function baueLead(sitzung, { browser = null, quelleUrl = "https://mnyra.com/lifeskin", jetzt = Date.now() } = {}) {
  return {
    event_name: "Lead",
    event_time: Math.floor(jetzt / 1000),
    event_id: leadKennung(sitzung?.code),
    action_source: "website",
    event_source_url: seiteAus({ seite: browser?.seite }, quelleUrl),
    user_data: { ...besucherDaten({}, sitzung?.source, browser), ...kundenDaten(sitzung) }
  };
}

// Pixel-Aenderung erlaubt von Albert am 02.10.2026: bestehendes
// Warteseiten-Ereignis zusaetzlich vom Server, gleiche Kennung im Browser.
function warteKennung(code) {
  const nummer = text(code);
  return nummer ? `${nummer}-waiting` : "";
}

function istWarten(davor, danach) {
  return metaErlaubt(danach) && text(danach?.step) === "result" && text(davor?.step) !== "result"
    && danach?.order?.still !== true && Boolean(text(danach?.device?.ua))
    && Boolean(warteKennung(danach?.code));
}

function baueWarten(sitzung, { browser = null, quelleUrl = "https://mnyra.com/lifeskin" } = {}) {
  return {
    event_name: "lifeskin_waiting_reached",
    event_id: warteKennung(sitzung?.code),
    event_time: sekundenAus(sitzung?.updatedAt),
    action_source: "website",
    event_source_url: seiteAus({ seite: browser?.seite }, quelleUrl),
    user_data: {
      ...besucherDaten({ ua: sitzung?.device?.ua }, sitzung?.source, browser),
      ...kundenDaten(sitzung)
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
  if (!metaErlaubt(danach)) return false;
  return Boolean(danach?.order);
}


module.exports = {
  PIXEL_ID,
  API_VERSION,
  SCHRITT_KAUF,
  text,
  sekundenAus,
  besucherDaten,
  telefonNormalisieren,
  kundenDaten,
  browserAusAnfrage,
  seiteAus,
  baueKauf,
  leadKennung,
  istLead,
  metaErlaubt,
  baueLead,
  istKauf,
  warteKennung,
  istWarten,
  baueWarten
};
