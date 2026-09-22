// Der Meta-Pixel fuer den Lifeskin-Trichter.
//
// Getrennt vom Rest, weil er eine andere Natur hat: Alles andere in diesem
// Ordner rechnet oder fuehrt vor und funktioniert ohne Netz. Der Pixel ist
// Messtechnik fuer Werbung, laedt fremden Code und darf unter keinen
// Umstaenden den Verkauf anhalten. Deshalb faengt hier jede Zeile ihren
// eigenen Fehler.
//
// Ohne Pixel-Kennung passiert nichts. Kein Skript wird geladen, kein
// Ereignis gemeldet. Der Trichter laeuft vollstaendig weiter - das ist der
// Normalzustand, solange die Kennung in lifeskin-config.js leer steht.
//
// Warum diese Ereignisse und nicht andere:
//
// Meta lernt aus Ereignissen. Damit eine Anzeigengruppe die Lernphase
// verlaesst, braucht sie ungefaehr 50 Ereignisse pro Woche. Bei den geplanten
// Werbeausgaben liegen die Bestellungen darunter, die abgegebenen Nummern
// deutlich darueber. Darum wird auf "Lead" optimiert und "Purchase" nur
// gemessen. Beide muessen trotzdem gemeldet werden: Ohne Purchase weiss
// niemand, ob die Leads etwas wert waren.

import {
  LIFESKIN_PIXEL_ID,
  LIFESKIN_PIXEL_EINWILLIGUNG_NOETIG
} from "./lifeskin-config.js";

// Welcher Schritt des Trichters welches Meta-Ereignis ausloest.
//
// Die Namen links sind unsere, die rechts sind Metas Standardereignisse.
// Eigene Namen waeren ehrlicher, aber Meta kann nur auf die Standardnamen
// optimieren - und genau das ist der Zweck der Uebung.
export const PIXEL_EREIGNISSE = Object.freeze({
  opened: "PageView",
  // Der Befund steht. Ab hier hat der Besucher etwas gesehen, das nur er
  // sieht - der erste Schritt mit echtem Wert.
  captured: "ViewContent",
  offer: "AddToCart",
  address: "InitiateCheckout",
  ordered: "Purchase"
});

// "Lead" haengt nicht am Schritt, sondern an der Nummer. Wer sie abgibt,
// laesst sich schreiben - auch wenn er das Formular nie oeffnet.
export const PIXEL_LEAD = "Lead";

// UNSERE EIGENEN EREIGNISSE - eines je Bildschirm, eines je Weg.
//
// Die fuenf Standardnamen darueber sind das, worauf Meta optimieren kann,
// und sie sind bewusst wenige. Was sie NICHT koennen, ist sagen, wo
// jemand weggegangen ist: "ViewContent" heisst beim Scan etwas anderes
// als beim Foto, und "Trup" und "Pytje" kommen darin gar nicht vor. In
// einem Topf waeren die vier Wege eine einzige, unlesbare Zahl.
//
// Deshalb hier eigene Namen, die genau einen Bildschirm meinen. Sie
// gehen als trackCustom hinaus - Meta optimiert nicht darauf, aber im
// Ereignismanager stehen sie einzeln, und dieselben Namen stehen im
// Bericht in Heart. Wer die zwei nebeneinanderlegt, vergleicht dieselbe
// Sache.
//
// GENAU EINMAL JE BESUCH: Dieselbe Sperre wie bei den Standardnamen -
// wer zurueckblaettert und wieder vor, hat den Bildschirm nicht zweimal
// erreicht.
export const PIXEL_SCHRITTE = Object.freeze({
  // "opened" steht hier NICHT. Es haengt an der Seite, nicht am Schritt -
  // siehe PIXEL_SEITEN darunter.
  wahl: "lifeskin_method_view",
  named: "lifeskin_scan_prepare",
  captured: "lifeskin_scan_completed",
  fotopara: "lifeskin_photo_prepare",
  fotogati: "lifeskin_photo_completed",
  result: "lifeskin_waiting_reached"
});

// WELCHE SEITE GEOEFFNET WURDE, und warum das drei Namen braucht.
//
// GEMESSEN, NICHT VERMUTET: Alle drei Seiten riefen melde("opened"), und
// alle drei meldeten damit denselben eigenen Namen - "lifeskin_landing_view".
// In dieser Zahl steckten also die Landingpage, die Warteseite und die
// Befundseite zusammen. Sie sah nach Reichweite aus und sagte nichts:
// Wer aus WhatsApp auf seinen Befund zurueckkommt, wurde darin als neuer
// Besucher der Landingpage gezaehlt.
//
// PageView geht weiter von jeder Seite hinaus - das ist richtig, eine
// Seite ist eine Seite. Nur der eigene Name unterscheidet jetzt, welche.
export const PIXEL_SEITEN = Object.freeze({
  trichter: "lifeskin_landing_view",
  warteseite: "lifeskin_waiting_view",
  befund: "lifeskin_report_view"
});

// Welcher Weg gewaehlt wurde. Der eine Tipp, der den Bildschirm
// "Menyra" ueberhaupt erst rechtfertigt - ohne ihn steht dort eine Zahl
// fuer alle vier zusammen.
export const PIXEL_WEGE = Object.freeze({
  scan: "lifeskin_method_scan",
  foto: "lifeskin_method_photo",
  trup: "lifeskin_method_body",
  pytje: "lifeskin_method_question"
});

// Und was der Besucher abgegeben hat. Kein Bildschirm, sondern eine
// Handlung: Name und Alter stehen, der Text steht, die Nummer steht.
export const PIXEL_ABGABEN = Object.freeze({
  details: "lifeskin_details_completed",
  problemi: "lifeskin_body_problem_completed",
  pyetja: "lifeskin_question_completed",
  telefon: "lifeskin_phone_completed"
});

// DER LADEN AUF DER LANDINGPAGE.
//
// Er hat zwei Handlungen, die Meta kennt und auf die es optimieren kann -
// und die es auf dieser Seite bisher nirgends gab: etwas in den Korb
// legen und die Kasse oeffnen. "AddToCart" hing bisher am Schritt
// "offer", und den ruft niemand (siehe unten); "InitiateCheckout" hing
// an "address", und den auch nicht.
//
// Sie tragen Betrag und Waehrung, weil Meta daraus den Wert einer
// Anzeigengruppe rechnet. Was sie NICHT tragen, ist irgendetwas ueber
// die Person.
export const PIXEL_KORB = "AddToCart";
export const PIXEL_KASSE = "InitiateCheckout";

// Was an das Ereignis drangehaengt wird.
//
// Rein und ohne Nebenwirkung, damit es sich ohne Browser pruefen laesst.
export function pixelDaten(schritt, zusatz = {}, waehrung = "EUR") {
  if (schritt === "ordered") {
    const betrag = Number(zusatz?.order?.total);
    const daten = { currency: waehrung, value: Number.isFinite(betrag) ? betrag : 0 };
    const nummer = zusatz?.order?.orderId;
    return nummer ? { daten, kennung: String(nummer) } : { daten, kennung: null };
  }
  return { daten: {}, kennung: null };
}

// Betrag und Waehrung fuer Korb und Kasse. Eine eigene Zeile, weil sie
// aus etwas anderem kommen als eine fertige Bestellung - und weil ein
// Betrag, der keiner ist, gar nicht erst mitgeschickt wird: "value: 0"
// an einem vollen Korb waere eine Zahl, die Meta glaubt.
export function pixelBetrag(betrag, waehrung = "EUR") {
  const zahl = Number(betrag);
  return Number.isFinite(zahl) && zahl > 0 ? { currency: waehrung, value: zahl } : {};
}

// ══ METAS EIGENE KENNUNGEN, FUER DIE MELDUNG VOM SERVER ═════════════
//
// Die Conversions API meldet eine Bestellung ein zweites Mal - vom
// Server, damit sie ankommt, wenn der Browser sie nicht loswird (iOS,
// Werbeblocker, Tracking-Schutz verschlucken 20 bis 40 Prozent).
//
// Damit Meta die zwei Meldungen als EINE erkennt, braucht es zweierlei:
// dieselbe eventID (die haengt am Kauf) und mindestens eine Angabe
// darueber, WER das war. Ohne sie verwirft Meta das Ereignis vom
// Server.
//
// HIER GEHT KEINE TELEFONNUMMER UND KEIN NAME MIT, auch nicht gehasht.
// Was mitgeht, sind zwei Cookies, die Metas eigenes Skript ohnehin
// gesetzt hat:
//
//   _fbp  die Browser-Kennung, die der Pixel beim ersten Aufruf vergibt
//   _fbc  die Klick-Kennung, wenn der Besuch aus einer Anzeige kam
//
// Beide beschreiben den Browser und nicht den Menschen; sie stammen von
// Meta, gehen an Meta zurueck und sagen nichts, was Meta nicht schon
// wusste. Genau das ist der Unterschied zu Advanced Matching, das hier
// deshalb nicht stattfindet.
//
// LEER IST IN ORDNUNG. Wer den Pixel blockiert, hat kein _fbp - dann
// meldet der Server mit dem, was da ist, und Meta entscheidet selbst,
// was es damit anfaengt. Ein Kauf ohne Kennung ist immer noch besser
// als kein Kauf.
export function pixelKennungen(keks) {
  const roh = typeof keks === "string"
    ? keks
    : (typeof document !== "undefined" ? document.cookie : "");
  const lies = (name) => {
    const treffer = new RegExp("(?:^|;\\s*)" + name + "=([^;]*)").exec(roh || "");
    if (!treffer) return "";
    try { return decodeURIComponent(treffer[1]); } catch { return treffer[1]; }
  };
  const raus = {};
  const fbp = lies("_fbp");
  const fbc = lies("_fbc");
  if (fbp) raus.fbp = fbp;
  if (fbc) raus.fbc = fbc;
  return raus;
}

export class Pixel {
  // fbq wird durchgereicht, damit der Test nicht das halbe Fenster nachbauen
  // muss. Im Betrieb steht dort nichts und es gilt globalThis.fbq.
  constructor({
    kennung = LIFESKIN_PIXEL_ID,
    fbq,
    dokument,
    // Die Einwilligung gilt als gegeben, solange keine Abfrage verlangt
    // ist. Welcher der zwei Zustaende gilt, steht an einer Stelle in
    // lifeskin-config.js - nicht an jedem Aufrufer.
    einwilligung = !LIFESKIN_PIXEL_EINWILLIGUNG_NOETIG,
    // Von welcher Seite aus gemeldet wird. Sie entscheidet nur, welchen
    // eigenen Namen "opened" bekommt; PageView geht von jeder hinaus.
    seite = "trichter"
  } = {}) {
    this.kennung = (kennung || "").trim();
    this.seite = PIXEL_SEITEN[seite] ? seite : "trichter";
    this.eigenesFbq = fbq || null;
    this.dokument = dokument || (typeof document !== "undefined" ? document : null);
    // Jedes Ereignis hoechstens einmal je Sitzung. Wer vom Angebot zurueck
    // zum Befund blaettert und wieder vor, hat nicht zweimal gekauft.
    this.gemeldet = new Set();
    this.laeuft = false;
    // Aus, solange niemand ausdruecklich zugestimmt hat. Siehe #aktiv.
    this.einwilligung = einwilligung === true;
  }

  // Die Einwilligung setzen. Das ist der Haken, an dem spaeter die
  // Zustimmungsabfrage haengt - sie ruft erlaube(true), sonst niemand.
  erlaube(ja = true) {
    this.einwilligung = ja === true;
    return this.einwilligung;
  }

  // ZWEI Bedingungen, nicht eine.
  //
  // Vorher war die Kennung die einzige: Wer sie in lifeskin-config.js
  // eintraegt, hatte damit auch schon Meta-Skript und Ereignisse
  // eingeschaltet - "der einzige Handgriff", so stand es dort. Genau das
  // ist die Falle. Der Pixel laedt fremden Code und meldet das Verhalten
  // eines Besuchers weiter; das braucht seine Zustimmung, und die kann
  // eine Nummer in einer Konfigurationsdatei nicht geben.
  //
  // Heute aendert diese Zeile nichts: Die Kennung ist leer, es passiert so
  // oder so nichts. Sie kostet jetzt zwei Zeilen - und spaeter, wenn die
  // Kampagne laeuft und der Pixel schon meldet, waere es ein Umbau.
  //
  // Und nie im stillen Modus (shared/lifeskin-still.js): Ein eigener
  // Besuch ist kein Besucher, auch nicht fuer Meta.
  get aktiv() {
    if (globalThis.__mnyraStill === true) return false;
    return Boolean(this.kennung) && this.einwilligung === true;
  }

  #fbq() {
    return this.eigenesFbq || globalThis.fbq || null;
  }

  // Metas Ladeschnipsel, von Hand gesetzt statt kopiert.
  //
  // Der offizielle Schnipsel ist ein einzeiliger Klumpen, den niemand liest.
  // Was er tut, ist simpel: eine Warteschlange anlegen, damit Aufrufe vor dem
  // Laden nicht verloren gehen, und dann das Skript nachladen.
  starte() {
    if (!this.aktiv || this.laeuft) return false;
    this.laeuft = true;
    try {
      if (!globalThis.fbq) {
        const warteschlange = function (...argumente) {
          if (warteschlange.callMethod) warteschlange.callMethod(...argumente);
          else warteschlange.queue.push(argumente);
        };
        warteschlange.queue = [];
        warteschlange.loaded = true;
        warteschlange.version = "2.0";
        globalThis.fbq = warteschlange;
        globalThis._fbq = globalThis._fbq || warteschlange;

        if (this.dokument) {
          const skript = this.dokument.createElement("script");
          skript.async = true;
          skript.src = "https://connect.facebook.net/en_US/fbevents.js";
          (this.dokument.head || this.dokument.body)?.appendChild(skript);
        }
      }
      this.#fbq()?.("init", this.kennung);
      return true;
    } catch (fehler) {
      globalThis.console?.warn?.("[lifeskin] Pixel nicht gestartet:", fehler?.message);
      this.laeuft = false;
      return false;
    }
  }

  // Ein Schritt des Trichters. Wird von Sitzung.schritt aufgerufen.
  //
  // ZWEI MELDUNGEN JE SCHRITT, nicht eine: der Standardname fuer Metas
  // Lernphase, und - wo es einen gibt - unser eigener fuer die Frage,
  // wo die Leute weggehen. Sie schliessen sich nicht aus; ein Schritt
  // ohne Standardnamen meldet trotzdem seinen eigenen.
  melde(schritt, zusatz = {}) {
    const eigen = schritt === "opened"
      ? PIXEL_SEITEN[this.seite]
      : PIXEL_SCHRITTE[schritt];
    let etwas = eigen ? this.#senden(eigen, {}, null) : false;
    const ereignis = PIXEL_EREIGNISSE[schritt];
    if (ereignis) {
      const { daten, kennung } = pixelDaten(schritt, zusatz);
      etwas = this.#senden(ereignis, daten, kennung) || etwas;
    }
    return etwas;
  }

  // Welcher der vier Wege gewaehlt wurde.
  meldeWeg(weg) {
    const ereignis = PIXEL_WEGE[weg];
    return ereignis ? this.#senden(ereignis, {}, null) : false;
  }

  // Was der Besucher abgegeben hat: Angaben, Text, Nummer.
  meldeAbgabe(was) {
    const ereignis = PIXEL_ABGABEN[was];
    return ereignis ? this.#senden(ereignis, {}, null) : false;
  }

  // Die abgegebene Nummer. Das Ereignis, auf das die Anzeigen optimieren.
  meldeLead() {
    return this.#senden(PIXEL_LEAD, {}, null);
  }

  // Etwas in den Korb gelegt - im Laden auf der Landingpage oder, auf der
  // Befundseite, den Preis des Sets gesehen. Beides ist fuer Meta
  // dieselbe Handlung: Der Besucher hat einen Preis vor sich und ist
  // nicht weggegangen.
  meldeKorb(betrag) {
    return this.#senden(PIXEL_KORB, pixelBetrag(betrag), null);
  }

  // Die Kasse steht offen. Das letzte Ereignis vor dem Kauf, und das
  // engste Publikum, auf das sich eine Anzeigengruppe richten laesst.
  meldeKasse(betrag) {
    return this.#senden(PIXEL_KASSE, pixelBetrag(betrag), null);
  }

  #senden(ereignis, daten, kennung) {
    if (!this.aktiv) return false;
    if (this.gemeldet.has(ereignis)) return false;
    this.gemeldet.add(ereignis);
    try {
      // Die Kennung der Bestellung ist Metas Schutz gegen Doppelzaehlung,
      // falls spaeter noch eine serverseitige Meldung dazukommt.
      const anhang = kennung ? { eventID: kennung } : undefined;
      // EIGENE NAMEN GEHEN ANDERS HINAUS ALS METAS EIGENE.
      //
      // "track" mit einem Namen, den Meta nicht kennt, wird verworfen -
      // die Meldung ist weg, und im Ereignismanager steht nichts, was
      // darauf hinweist. Eigene Namen brauchen "trackCustom", und woran
      // man beide unterscheidet, steht in PIXEL_EREIGNISSE: Was dort
      // rechts steht, ist ein Standardname.
      const standard = Object.values(PIXEL_EREIGNISSE).includes(ereignis)
        || ereignis === PIXEL_LEAD
        || ereignis === PIXEL_KORB
        || ereignis === PIXEL_KASSE;
      this.#fbq()?.(standard ? "track" : "trackCustom", ereignis, daten, anhang);
      return true;
    } catch (fehler) {
      globalThis.console?.warn?.("[lifeskin] Pixel-Ereignis nicht gemeldet:", fehler?.message);
      return false;
    }
  }
}
