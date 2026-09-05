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

// Wo die Kennung des Besuchs liegt.
const SPEICHER_SCHLUESSEL = "lifeskin:sitzung";

function sitzungsSpeicher() {
  try { return globalThis.sessionStorage || null; } catch { return null; }
}

export class Sitzung {
  constructor({ tenantId = LIFESKIN_TENANT, basis = LIFESKIN_FIRESTORE_BASE, fetchFn, beiSchritt, speicher } = {}) {
    this.tenantId = tenantId;
    this.basis = basis;
    this.fetchFn = fetchFn || ((...a) => globalThis.fetch(...a));
    this.speicher = speicher !== undefined ? speicher : sitzungsSpeicher();
    // Wer sonst noch mitzaehlt. Der Meta-Pixel haengt hier und nicht an den
    // zehn Stellen im Trichter, an denen ein Schritt weitergezaehlt wird -
    // sonst fehlt er irgendwann an einer davon.
    this.beiSchritt = typeof beiSchritt === "function" ? beiSchritt : null;
    // Eine Kennung je Besuch, nicht je Seitenaufruf.
    //
    // Vorher bekam jedes Neuladen eine neue Kennung und damit ein zweites
    // Dokument. Der Bericht fing das mit einer Zusammenfassung ab, die
    // Besucher anhand von Geraet und Name zusammenlegte - und die legte
    // dabei auch verschiedene Menschen zusammen, weil ein Besucher ohne
    // eingegebenen Namen kein Merkmal hat.
    //
    // sessionStorage haelt genau das Richtige fest: Es gehoert dem einen
    // Tab, ueberlebt ein Neuladen und ist beim naechsten Besuch wieder weg.
    // Also genau die Grenze, die "ein Besuch" meint.
    const gemerkt = this.#gemerkterStand();
    this.id = gemerkt?.id || kennung();
    // Fortgesetzt heisst: Der Anlegezeitpunkt steht schon. Ihn erneut zu
    // schicken wuerde die Regeln verletzen, die ihn festhalten - und der
    // ganze Schreibvorgang fiele aus.
    this.fortgesetzt = Boolean(gemerkt);
    // Der Anlegezeitpunkt gehoert zum Besuch, nicht zum Seitenaufruf.
    this.createdAt = gemerkt?.createdAt || jetzt();
    this.angelegt = false;
    // Der Stand beginnt dort, wo der letzte Aufruf aufgehoert hat.
    this.stand = gemerkt ? { step: gemerkt.step } : {};
    this.#merkeStand();
    // Schreibvorgaenge laufen hintereinander, nicht durcheinander: Sonst
    // ueberholt die Ergaenzung das Anlegen und Firestore legt zwei Dokumente
    // an - oder schlimmer, das Anlegen ueberschreibt die Ergaenzung.
    this.kette = Promise.resolve();
    // Zeit je Schritt. Ohne sie laesst sich spaeter nicht sagen, wo es hakt.
    this.zeiten = {};
    this.letzterSchrittAb = Date.now();
  }

  // Kennung UND erreichter Schritt.
  //
  // Der Schritt muss mit, sonst faellt der Trichter beim Neuladen zurueck:
  // Die Seite faengt wieder vorne an, und ohne diesen Wert wuerde sie den
  // Stand im Dokument von "Foto aufgenommen" auf "Seite geoeffnet"
  // zuruecksetzen. Ein Trichter, der ruecklaeufig sein kann, misst nichts.
  #gemerkterStand() {
    try {
      const roh = this.speicher?.getItem?.(SPEICHER_SCHLUESSEL);
      if (typeof roh !== "string" || !roh) return null;
      const stand = JSON.parse(roh);
      if (!/^[0-9a-f]{8,64}$/.test(String(stand?.id || ""))) return null;
      // Ohne gemerkten Anlegezeitpunkt ist der Eintrag unbrauchbar - siehe
      // die Erklaerung bei createdAt in starte(). Dann lieber ein neuer
      // Besuch als eine Sitzung ohne Datum.
      if (!Number.isFinite(Date.parse(stand?.createdAt))) return null;
      return {
        id: stand.id,
        step: SCHRITTE.includes(stand.step) ? stand.step : "opened",
        createdAt: stand.createdAt
      };
    } catch {
      // Privates Fenster, gesperrter Speicher, kaputter Eintrag: dann eben
      // ein neuer Besuch.
      return null;
    }
  }

  #merkeStand() {
    try {
      this.speicher?.setItem?.(SPEICHER_SCHLUESSEL, JSON.stringify({
        id: this.id, step: this.stand.step || "opened", createdAt: this.createdAt
      }));
    } catch { /* egal */ }
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
      // Der Anlegezeitpunkt geht IMMER mit, auch beim fortgesetzten Besuch.
      //
      // Vorher wurde er beim Fortsetzen weggelassen, weil die Regeln ihn
      // festhalten und ein anderer Wert den ganzen Schreibvorgang abweisen
      // wuerde. Das ging so lange gut, wie das Dokument schon existierte -
      // und genau das tat es nach dem Zuruecksetzen nicht mehr: Der Tab
      // hielt die Kennung, das Dokument war geloescht, und es entstand neu
      // OHNE Datum. Eine Sitzung ohne Datum faellt aus jeder Tageszahl:
      // "Analysen heute 0", waehrend der Trichter sie zeigt.
      //
      // Derselbe Wert erneut zu schicken ist erlaubt - die Regel verlangt
      // Gleichheit, nicht Abwesenheit. Deshalb liegt er im selben Speicher
      // wie die Kennung.
      createdAt: this.createdAt,
      // Der Schritt dagegen bleibt weg: Er ist laengst weiter.
      ...(this.fortgesetzt ? {} : { step: "opened" }),
      updatedAt: jetzt(),
      sprache,
      source: herkunftAuslesen(),
      device: geraetAuslesen()
    };
    this.stand = { ...this.stand, ...daten };
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
      this.#merkeStand();
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

  // Die drei Aufnahmen: gerade, nach rechts, nach links.
  //
  // EIGENE UNTERSAMMLUNG, nicht Felder in der Sitzung. Der Bericht in Heart
  // liest alle Sitzungen auf einmal; laegen die Bilder darin, zoege jeder
  // Aufruf des Reiters Hunderte Megabyte durch die Leitung. So kommen sie
  // erst, wenn eine Analyse geoeffnet wird.
  //
  // Jedes Bild einzeln und mit eigenem Fehlerfang: Wenn das zweite nicht
  // durchgeht, soll das erste trotzdem dasein. Und keines haelt den Trichter
  // auf - der Kunde wartet nicht darauf, dass ein Foto ankommt.
  fotosSpeichern(fotos = {}) {
    for (const [blick, foto] of Object.entries(fotos)) {
      if (!foto?.jpeg) continue;
      this.#reihen(async () => {
        const daten = {
          createdAt: jetzt(),
          blick,
          jpeg: foto.jpeg,
          breite: Math.round(foto.breite || 0),
          hoehe: Math.round(foto.hoehe || 0)
        };
        const maske = Object.keys(daten).map((f) => `updateMask.fieldPaths=${f}`).join("&");
        const antwort = await this.fetchFn(`${this.pfad}/photos/${blick}?${maske}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fields: felder(daten) })
        });
        if (!antwort.ok) throw new Error(`Foto ${blick}: Firestore ${antwort.status}`);
      });
    }
    return this.kette;
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
