// Was der Trichter ueber sich selbst festhaelt.
//
// Ohne SDK, ueber die REST-Schnittstelle - aus demselben Grund wie bei der
// Lead-Landing: /shared/firebase-config.js zieht rund 680 KB und nimmt die
// Seite an der Persistenz-Koordination der App teil. Eine Seite, die in einer
// Sekunde stehen muss, kann sich das nicht leisten.
//
// Geschrieben wird ohne Anmeldung - wer aus einer Anzeige kommt, hat kein
// Konto. Die Firestore-Regeln begrenzen das eng: nur bekannte Felder, nur
// anlegen und ergaenzen, kein Lesen, kein Loeschen. Wer die Adresse kennt,
// kann erfundene Sitzungen eintragen; der Schaden bleibt auf falsche Zahlen
// im eigenen Bericht begrenzt.
//
// Der wichtigste Satz in diesem Modul: Ein Schreibfehler darf den Trichter
// nie anhalten. Wenn die Zaehlung ausfaellt, verkauft die Seite weiter.

import {
  LIFESKIN_FIRESTORE_BASE,
  LIFESKIN_TENANT
} from "./lifeskin-config.js";

const SCHRITTE = Object.freeze([
  "opened", "named", "camera", "captured",
  "result", "offer", "address", "ordered"
]);

function jetzt() {
  return new Date().toISOString();
}

// Firestore-REST erwartet getypte Werte.
function wert(v) {
  if (v === null || v === undefined) return { nullValue: null };
  if (typeof v === "boolean") return { booleanValue: v };
  if (typeof v === "number") {
    return Number.isInteger(v) ? { integerValue: String(v) } : { doubleValue: v };
  }
  if (Array.isArray(v)) return { arrayValue: { values: v.map(wert) } };
  if (typeof v === "object") return { mapValue: { fields: felder(v) } };
  return { stringValue: String(v) };
}

function felder(objekt) {
  const raus = {};
  for (const [schluessel, v] of Object.entries(objekt)) {
    if (v === undefined) continue;
    raus[schluessel] = wert(v);
  }
  return raus;
}

function kennung() {
  const puffer = new Uint8Array(16);
  (globalThis.crypto || {}).getRandomValues?.(puffer);
  return Array.from(puffer, (b) => b.toString(16).padStart(2, "0")).join("");
}

// Woher der Besucher kommt.
//
// Ohne diese vier Felder laesst sich spaeter nicht sagen, welche Anzeige
// verkauft hat und welche nur Klicks gebracht hat - und genau das ist die
// Frage, die ueber das Werbebudget entscheidet.
export function herkunftAuslesen(ort = globalThis.location, verweis = globalThis.document?.referrer) {
  let suche;
  try {
    suche = new URLSearchParams(ort?.search || "");
  } catch {
    suche = new URLSearchParams();
  }
  return {
    utmSource: suche.get("utm_source") || "",
    utmCampaign: suche.get("utm_campaign") || "",
    utmContent: suche.get("utm_content") || "",
    referrer: String(verweis || "").slice(0, 240)
  };
}

export function geraetAuslesen(navigator = globalThis.navigator, bildschirm = globalThis.screen) {
  const kennzeichen = String(navigator?.userAgent || "");
  const ios = /iPad|iPhone|iPod/.test(kennzeichen);
  const android = /Android/.test(kennzeichen);
  return {
    os: ios ? "ios" : android ? "android" : "andere",
    browser: /CriOS/.test(kennzeichen) ? "chrome-ios"
      : /Safari/.test(kennzeichen) && !/Chrome/.test(kennzeichen) ? "safari"
      : /Chrome/.test(kennzeichen) ? "chrome"
      : "andere",
    screen: bildschirm ? `${bildschirm.width}x${bildschirm.height}` : "",
    pixelRatio: Number(globalThis.devicePixelRatio) || 1
  };
}

export class Sitzung {
  constructor({ tenantId = LIFESKIN_TENANT, basis = LIFESKIN_FIRESTORE_BASE, fetchFn, beiSchritt } = {}) {
    this.tenantId = tenantId;
    this.basis = basis;
    this.fetchFn = fetchFn || ((...a) => globalThis.fetch(...a));
    // Wer sonst noch mitzaehlt. Der Meta-Pixel haengt hier und nicht an den
    // zehn Stellen im Trichter, an denen ein Schritt weitergezaehlt wird -
    // sonst fehlt er irgendwann an einer davon.
    this.beiSchritt = typeof beiSchritt === "function" ? beiSchritt : null;
    this.id = kennung();
    this.angelegt = false;
    this.stand = {};
    // Schreibvorgaenge laufen hintereinander, nicht durcheinander: Sonst
    // ueberholt die Ergaenzung das Anlegen und Firestore legt zwei Dokumente
    // an - oder schlimmer, das Anlegen ueberschreibt die Ergaenzung.
    this.kette = Promise.resolve();
    // Zeit je Schritt. Ohne sie laesst sich spaeter nicht sagen, wo es hakt.
    this.zeiten = {};
    this.letzterSchrittAb = Date.now();
  }

  get pfad() {
    return `${this.basis}/lifeskin/${this.tenantId}/sessions/${this.id}`;
  }

  // Jeder Aufruf haengt sich hinten an und schluckt seinen Fehler.
  #reihen(aufgabe) {
    this.kette = this.kette.then(aufgabe).catch((fehler) => {
      // Bewusst nur eine Notiz: Der Trichter laeuft weiter. Eine Bestellung,
      // die an der Zaehlung scheitert, waere der teuerste denkbare Fehler.
      if (globalThis.console) console.warn("[lifeskin] Sitzung nicht gespeichert:", fehler?.message);
    });
    return this.kette;
  }

  async #schreiben(daten, felderMaske) {
    const maske = felderMaske.map((f) => `updateMask.fieldPaths=${encodeURIComponent(f)}`).join("&");
    const antwort = await this.fetchFn(`${this.pfad}?${maske}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fields: felder(daten) })
    });
    if (!antwort.ok) throw new Error(`Firestore ${antwort.status}`);
    return antwort;
  }

  starte({ sprache = "sq" } = {}) {
    const daten = {
      createdAt: jetzt(),
      updatedAt: jetzt(),
      step: "opened",
      sprache,
      source: herkunftAuslesen(),
      device: geraetAuslesen()
    };
    this.stand = { ...daten };
    this.angelegt = true;
    return this.#reihen(() => this.#schreiben(daten, Object.keys(daten)));
  }

  // Einen Schritt weiterzaehlen. Nie zurueck: Wer vom Angebot zurueck zum
  // Befund blaettert, hat das Angebot trotzdem gesehen, und der Trichter
  // wuerde sonst falsch schmaler.
  schritt(name, zusatz = {}) {
    if (!SCHRITTE.includes(name)) throw new Error(`Unbekannter Schritt: ${name}`);
    const bisher = SCHRITTE.indexOf(this.stand.step || "opened");
    const neu = SCHRITTE.indexOf(name);

    const vergangen = Date.now() - this.letzterSchrittAb;
    this.zeiten[this.stand.step || "opened"] = vergangen;
    this.letzterSchrittAb = Date.now();

    const daten = { updatedAt: jetzt(), timings: { ...this.zeiten }, ...zusatz };
    if (neu > bisher) {
      daten.step = name;
      this.stand.step = name;
    }
    Object.assign(this.stand, zusatz);

    // Erst melden, dann schreiben - und in einem eigenen Versuch. Eine
    // Messung, die stolpert, darf die Sitzung nicht mitreissen.
    if (this.beiSchritt && neu > bisher) {
      try { this.beiSchritt(name, zusatz); }
      catch (fehler) { globalThis.console?.warn?.("[lifeskin] Schrittmeldung:", fehler?.message); }
    }

    return this.#reihen(() => this.#schreiben(daten, Object.keys(daten)));
  }

  // Einzelne Felder ergaenzen, ohne den Schritt zu bewegen.
  //
  // Das ist der Weg, auf dem die Anschrift ankommt: Feld fuer Feld, beim
  // Verlassen jedes Eingabefeldes. Genau daraus entsteht die Liste
  // "Anschrift da, aber nicht bestellt" - die wertvollste im Bericht.
  ergaenze(daten) {
    const mit = { updatedAt: jetzt(), ...daten };
    Object.assign(this.stand, daten);
    return this.#reihen(() => this.#schreiben(mit, Object.keys(mit)));
  }
}
