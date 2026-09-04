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

import { LIFESKIN_PIXEL_ID } from "./lifeskin-config.js";

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

export class Pixel {
  // fbq wird durchgereicht, damit der Test nicht das halbe Fenster nachbauen
  // muss. Im Betrieb steht dort nichts und es gilt globalThis.fbq.
  constructor({ kennung = LIFESKIN_PIXEL_ID, fbq, dokument } = {}) {
    this.kennung = (kennung || "").trim();
    this.eigenesFbq = fbq || null;
    this.dokument = dokument || (typeof document !== "undefined" ? document : null);
    // Jedes Ereignis hoechstens einmal je Sitzung. Wer vom Angebot zurueck
    // zum Befund blaettert und wieder vor, hat nicht zweimal gekauft.
    this.gemeldet = new Set();
    this.laeuft = false;
  }

  get aktiv() {
    return Boolean(this.kennung);
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
  melde(schritt, zusatz = {}) {
    const ereignis = PIXEL_EREIGNISSE[schritt];
    if (!ereignis) return false;
    const { daten, kennung } = pixelDaten(schritt, zusatz);
    return this.#senden(ereignis, daten, kennung);
  }

  // Die abgegebene Nummer. Das Ereignis, auf das die Anzeigen optimieren.
  meldeLead() {
    return this.#senden(PIXEL_LEAD, {}, null);
  }

  #senden(ereignis, daten, kennung) {
    if (!this.aktiv) return false;
    if (this.gemeldet.has(ereignis)) return false;
    this.gemeldet.add(ereignis);
    try {
      // Die Kennung der Bestellung ist Metas Schutz gegen Doppelzaehlung,
      // falls spaeter noch eine serverseitige Meldung dazukommt.
      const anhang = kennung ? { eventID: kennung } : undefined;
      this.#fbq()?.("track", ereignis, daten, anhang);
      return true;
    } catch (fehler) {
      globalThis.console?.warn?.("[lifeskin] Pixel-Ereignis nicht gemeldet:", fehler?.message);
      return false;
    }
  }
}
