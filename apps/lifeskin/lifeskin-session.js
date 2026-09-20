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

// DIE STUFEN, IN DENEN GEZAEHLT WIRD - eine je Bildschirm.
//
// Jede Frage hat ihre eigene Stufe, dazu Name und Nummer. Vorher gab es
// eine einzige fuer alle Fragen zusammen - sie sagte, dass jemand
// angefangen hat, nicht, bei welcher er aufhoerte. Sechs Fragen sind
// sechs Gelegenheiten wegzugehen.
//
// In den Kommentaren hier stehen KEINE Schrittnamen in
// Anfuehrungszeichen: tests/lifeskin-schirmzaehlung.test.mjs liest die
// Liste aus der Datei und zaehlte ein zitiertes Wort mit.
//
// "named" heisst weiter so, obwohl der Namensschirm laengst weg ist und
// heute die Anleitung vor der Kamera dahinter steht ("Si funksionon"). Umbenennen wuerde jede Sitzung
// aus der Vergangenheit unlesbar machen - die Kennung bleibt, die
// Beschriftung in Heart sagt, was sie heute bedeutet.
//
// Die Reihenfolge ist die des Wegs: schritt() geht nie zurueck.
const SCHRITTE = Object.freeze([
  "opened",
  // DIE WAHL: Scan oder ohne Scan.
  //
  // Der Bildschirm nach der Landingpage, auf dem sich der Weg teilt. Er
  // steht vor dem naechsten, weil der die Anleitung vor der Kamera ist -
  // und die sieht nur, wer den Scan gewaehlt hat.
  //
  // Wer ohne Scan weitergeht, springt von hier auf den Namensschirm.
  // schritt() geht nie zurueck und nimmt immer den weitesten Stand; ein
  // uebersprungener Name in der Mitte ist deshalb kein Problem.
  //
  // KEINE SCHRITTNAMEN IN ANFUEHRUNGSZEICHEN in diesem Kommentar: Die
  // Pruefungen lesen die Liste aus der Datei und zaehlen ein zitiertes
  // Wort mit. Genau daran ist dieser Eintrag beim ersten Versuch
  // gescheitert.
  "wahl",
  "named", "camera", "captured",
  // DER WEG MIT FOTO - drei eigene Stufen.
  //
  // Er teilt sich keine mit dem Scan, und das ist der ganze Sinn: Wer
  // nur seine Stirn fotografiert, hat den Ring nie gesehen. Stuenden
  // beide Wege in denselben Stufen, waere die Zahl, die sagt, wo die
  // Leute weggehen, eine Mischung aus zwei verschiedenen Bildschirmen.
  //
  // Die Namen sind klein geschrieben und ohne Trennzeichen: Die Pruefung
  // liest die vier Kopien dieser Liste mit einem Muster aus, das genau
  // das erwartet - ein grosser Buchstabe faellt still aus dem Vergleich.
  "fotopara", "fotokamera", "fotogati",
  // JEDE FRAGE EINZELN. Eine gemeinsame Stufe sagte nur, dass jemand
  // angefangen hat - nicht, bei welcher er aufhoerte. Sechs Fragen sind
  // sechs Gelegenheiten wegzugehen, und welche davon es kostet, steht
  // nur da, wenn jede ihre eigene Stufe hat.
  "pyetja1", "pyetja2", "pyetja3", "pyetja4", "emri", "numri",
  "aufbereitung",
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

// Auch die Befundseite schreibt in dieselbe Sitzung zurueck - deshalb
// exportiert.
export function felder(objekt) {
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
  // EIN EIGENER LAUF IST KEIN BESUCHER.
  //
  // Wer seinen eigenen Trichter zwanzigmal am Tag durchlaeuft, steht sonst
  // in jeder Zahl: "Seite geoeffnet" waechst, die Abschlussquote faellt,
  // und die Kaufquote sieht schlechter aus als sie ist. Mit ?test=1 laeuft
  // alles genau wie sonst - nur traegt die Sitzung die Kampagne "test", und
  // Heart zaehlt sie getrennt.
  //
  // Als Kampagne und nicht als eigenes Feld: Die Herkunft wird ohnehin
  // geschrieben und ist in den Regeln schon erlaubt. Ein neues Feld haette
  // eine neue Regel gebraucht - und bis die eingespielt ist, waere jeder
  // Testlauf still abgewiesen worden.
  const test = suche.get("test") === "1" || suche.get("test") === "true";
  return {
    utmSource: suche.get("utm_source") || (test ? "test" : ""),
    utmCampaign: suche.get("utm_campaign") || (test ? "test" : ""),
    utmContent: suche.get("utm_content") || "",
    referrer: String(verweis || "").slice(0, 240)
  };
}

export function geraetAuslesen(
  navigator = globalThis.navigator,
  bildschirm = globalThis.screen,
  dokument = globalThis.document
) {
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
    pixelRatio: Number(globalThis.devicePixelRatio) || 1,
    // HAT DIESE SEITE ÜBERHAUPT JEMAND GESEHEN?
    //
    // Die erste Trichterstufe wird geschrieben, sobald die Seite geladen
    // ist - nicht, wenn jemand hinsieht. Gemessen mit dem Pruefstand:
    // Eine Seite, die NIE sichtbar war, schreibt eine vollstaendige
    // Sitzung. Die Facebook-App laedt Anzeigenziele auf Android im
    // Voraus, bevor jemand tippt; jede solche Ladung stand bisher in der
    // Stufe "Fillo skanimin" wie ein Besucher.
    //
    // Damit war die Quote von der ersten zur zweiten Stufe nicht
    // auszuwerten: Im Zaehler stehen Menschen, im Nenner Seitenaufrufe.
    //
    // Hier steht deshalb, was zum Zeitpunkt des Anlegens gilt. Wird die
    // Seite spaeter sichtbar, schreibt #sichtbarkeitMerken() sie nach -
    // ein Vorabladen, das der Besucher dann doch oeffnet, ist ein Besuch.
    //
    // ALS TEIL VON device UND NICHT ALS EIGENES FELD: Die Firestore-Regel
    // prueft device nur auf "is map" und laesst die Unterfelder offen. Ein
    // neues Feld oben haette hasOnly() verletzt - und hasOnly weist das
    // GANZE Dokument ab. Bis eine neue Regel eingespielt waere, haette der
    // Trichter still gar nichts mehr gezaehlt.
    gesehen: dokument?.visibilityState === "visible"
  };
}

// Die Fallnummer, wie der Patient sie sieht.
//
// Die Sitzungskennung ist eine lange Hex-Folge - unbrauchbar zum Vorlesen,
// Abtippen oder Wiedererkennen. Der Patient braucht etwas Kurzes, das er in
// WhatsApp schickt und das die Aerztin in Heart wiederfindet.
//
// Ohne 0, 1, I und O: Diese vier verwechselt jeder, und eine Nummer, die
// beim Abtippen kippt, ist schlimmer als keine.
//
// Abgeleitet, nicht gewuerfelt: Dieselbe Sitzung ergibt immer dieselbe
// Nummer, auch nach einem Neuladen.
const CODE_ZEICHEN = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";

export function codeAus(id, createdAt = "") {
  const roh = String(id || "");
  if (!roh) return "";

  // ZWEI unabhaengige Streuwerte mit verschiedenen Anfangswerten.
  //
  // Der erste Versuch leitete beide aus derselben Zahl ab und teilte sie
  // dann herunter - dabei blieb von 32 Bit nach drei Schritten fast nichts
  // uebrig. Gemessen: 200.000 Kennungen ergaben nur 62.000 verschiedene
  // Nummern. Eine Fallnummer, die zweimal vorkommt, ist schlimmer als
  // keine: Die Aerztin oeffnet den falschen Fall.
  const streu = (anfang, faktor) => {
    let h = anfang;
    for (let i = 0; i < roh.length; i += 1) {
      h ^= roh.charCodeAt(i);
      h = Math.imul(h, faktor) >>> 0;
    }
    h ^= h >>> 16;
    h = Math.imul(h, 0x7feb352d) >>> 0;
    h ^= h >>> 15;
    return h >>> 0;
  };

  let a = streu(0x811c9dc5, 0x01000193);
  let b = streu(0x9e3779b9, 0x85ebca6b);

  // Fuenf Zeichen, nicht vier.
  //
  // Vier waeren 1,05 Millionen Nummern je Tag - bei hundert Faellen am Tag
  // rechnerisch zwei Doppelungen im Jahr. Fuenf sind 33 Millionen, das ist
  // eine in zwanzig Jahren. Ein Zeichen mehr kostet nichts; die Nummer wird
  // ohnehin nicht abgetippt, sondern steht fertig in der Nachricht.
  let teil = "";
  for (let i = 0; i < 3; i += 1) { teil += CODE_ZEICHEN[a % 32]; a = Math.floor(a / 32); }
  for (let i = 0; i < 2; i += 1) { teil += CODE_ZEICHEN[b % 32]; b = Math.floor(b / 32); }

  // Der Tag gehoert in die Nummer.
  //
  // Sechs zufaellige Zeichen sind eine Kennung, aber keine Aktennummer -
  // sie sagt niemandem etwas. Mit dem Datum davor liest sie sich wie ein
  // Fall in einer Praxis, und sie hilft der Aerztin: Sie sieht auf einen
  // Blick, von wann der Fall ist, bevor sie ihn oeffnet.
  //
  // Aus createdAt und nicht aus der aktuellen Zeit - sonst wechselt die
  // Nummer eines Besuchs um Mitternacht.
  const zeit = Date.parse(createdAt);
  if (!Number.isFinite(zeit)) return `LS-${teil}`;
  const d = new Date(zeit);
  const zwei = (n) => String(n).padStart(2, "0");
  return `LS-${zwei(d.getDate())}${zwei(d.getMonth() + 1)}-${teil}`;
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
    // Was der Patient sieht und in WhatsApp schickt.
    this.code = codeAus(this.id, this.createdAt);
    this.angelegt = false;
    // Der Stand beginnt dort, wo der letzte Aufruf aufgehoert hat.
    this.stand = gemerkt ? { step: gemerkt.step, name: gemerkt.name, views: gemerkt.views } : {};
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
        createdAt: stand.createdAt,
        name: typeof stand.name === "string" ? stand.name : "",
        views: Number(stand.views) || 0
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
        id: this.id,
        step: this.stand.step || "opened",
        createdAt: this.createdAt,
        // Name und Aufnahmezahl kommen mit, damit die Seite nach einer
        // Rueckkehr dort weitermachen kann, wo der Besucher war - siehe
        // fortsetzbar().
        name: this.stand.name || "",
        views: Number(this.stand.views) || 0
      }));
    } catch { /* egal */ }
  }

  // Kann die Seite dort weitermachen, wo der Besucher war?
  //
  // DER FALL, UM DEN ES GEHT: Der WhatsApp-Link ersetzt in den Fenstern von
  // Instagram, TikTok und Facebook unsere Seite. Drueckt der Besucher danach
  // auf Zurueck, wird sie neu geladen - und ohne diese Pruefung stuende er
  // wieder bei der Namenseingabe. Alles, was er gerade getan hat, waere weg,
  // und die Frage "Nachricht abgeschickt?" erschiene nie.
  //
  // Fortgesetzt wird erst ab dem Ergebnis. Wer bei "Kamera" neu laedt, muss
  // die Aufnahme ohnehin wiederholen; wer beim Ergebnis war, hat alles
  // hinter sich.
  fortsetzbar() {
    if (!this.fortgesetzt) return null;
    if (SCHRITTE.indexOf(this.stand.step || "opened") < SCHRITTE.indexOf("result")) return null;
    return { name: this.stand.name || "", views: this.stand.views || 0, code: this.code };
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

  starte({ sprache = "sq", dokument = globalThis.document } = {}) {
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
      code: this.code,
      // Der Schritt dagegen bleibt weg: Er ist laengst weiter.
      ...(this.fortgesetzt ? {} : { step: "opened" }),
      updatedAt: jetzt(),
      sprache,
      source: herkunftAuslesen(),
      device: geraetAuslesen(undefined, undefined, dokument)
    };
    this.stand = { ...this.stand, ...daten };
    this.angelegt = true;
    const geschrieben = this.#reihen(() => this.#schreiben(daten, Object.keys(daten)));
    this.#sichtbarkeitMerken(dokument);
    return geschrieben;
  }

  // Aus "war beim Laden nicht sichtbar" darf nicht "war nie sichtbar"
  // werden.
  //
  // Der Fall, um den es geht: Die Meta-Apps laden Anzeigenziele im Voraus.
  // Tippt der Besucher danach wirklich auf die Anzeige, ist dieselbe Seite
  // plötzlich sichtbar - und das ist dann ein Besuch wie jeder andere.
  // Ohne diese Nachmeldung stuende er auf Dauer als "nie gesehen" da, und
  // die neue Zahl waere genauso falsch wie die alte, nur andersherum.
  //
  // Einmal und dann nie wieder: Wer zwischendurch auf WhatsApp geht und
  // zurueckkommt, hat die Seite nicht ein zweites Mal zum ersten Mal
  // gesehen. Der Horcher haengt sich nach dem ersten Mal selbst aus.
  #sichtbarkeitMerken(dokument) {
    if (!dokument?.addEventListener) return;
    if (this.stand.device?.gesehen === true) return;
    if (this.sichtbarkeitHorcht) return;
    this.sichtbarkeitHorcht = true;

    const merken = () => {
      if (dokument.visibilityState !== "visible") return;
      dokument.removeEventListener("visibilitychange", merken);
      const device = { ...this.stand.device, gesehen: true };
      this.stand.device = device;
      // Nur device und updatedAt, mit Maske: Der Anlegezeitpunkt bleibt
      // stehen, sonst weist ihn die Regel ab.
      this.#reihen(() => this.#schreiben({ device, updatedAt: jetzt() }, ["device", "updatedAt"]));
    };
    dokument.addEventListener("visibilitychange", merken);
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

    const daten = { updatedAt: jetzt(), timings: { ...this.zeiten, live: name }, ...zusatz };
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

    return this.#reihen(() => this.#schreiben(daten, Object.keys(daten).flatMap((key) => key === "timings"
      ? Object.keys(daten.timings).map((name) => `timings.${name}`) : [key])));
  }

  // ZURUECK AUF EINEN FRUEHEREN SCHRITT - die eine Ausnahme.
  //
  // schritt() geht nie zurueck, und das ist richtig: Wer vom Angebot
  // zum Befund zurueckblaettert, hat das Angebot trotzdem gesehen.
  //
  // SEIT DER MENYRA GIBT ES GENAU EINEN FALL, IN DEM ES FALSCH IST. Die
  // vier Wege teilen sich eine Schrittfolge, und ihre Bildschirme liegen
  // darin hintereinander statt nebeneinander. Wer auf Trup den
  // Anliegenschirm sieht (emri), zurueckgeht und dann Me foto waehlt,
  // koennte dessen Bildschirme nicht mehr zaehlen - sie liegen VOR emri.
  // In der Auswertung stuende er dann als jemand da, der den Fotoweg bis
  // zu Name und Alter durchlaufen hat, ohne je die Kamera gesehen zu
  // haben: eine Zahl, die das Gegenteil von dem sagt, was passiert ist.
  //
  // Hier wird deshalb zurueckgesetzt, und nur hier: beim Wechsel des
  // Wegs, auf die Menyra. Das ist die Wahrheit - er steht wieder dort
  // und faengt einen anderen Weg an.
  zurueckAuf(name) {
    if (!SCHRITTE.includes(name)) throw new Error(`Unbekannter Schritt: ${name}`);
    if (SCHRITTE.indexOf(this.stand.step || "opened") <= SCHRITTE.indexOf(name)) return this.kette;
    this.stand.step = name;
    this.#merkeStand();
    const daten = { step: name, updatedAt: jetzt() };
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
  // NEBENEINANDER STATT NACHEINANDER.
  //
  // GEMESSEN, NICHT GESCHAETZT: Die Bilder lagen als je ein Glied in
  // derselben Kette wie alles andere - eines nach dem anderen, und der
  // Bericht (und damit die Weiterleitung) wartete am Ende auf sie alle.
  // Mit drei Bildern ging das durch; mit zehn waere die Wartezeit nach dem
  // Scan das Dreifache gewesen.
  //
  // Jetzt gehen sie zu dritt gleichzeitig hinaus. Drei und nicht zehn: Ein
  // Telefon mit schmalem Uplink wird nicht schneller, wenn man ihm zehn
  // Verbindungen gleichzeitig aufmacht - es wird langsamer, und die
  // Zeitgrenzen der einzelnen Anfragen ruecken naeher.
  //
  // Sie bleiben EIN Glied der Kette: Der Bericht wird danach angelegt, und
  // wer weitergeleitet wird, hat seine Bilder oben. Ein Bild, das nicht
  // ankommt, reisst die anderen nicht mit - es fehlt, der Rest steht.
  fotosSpeichern(fotos = {}) {
    const liste = Object.entries(fotos).filter(([, foto]) => foto?.jpeg);
    if (!liste.length) return this.kette;
    const GLEICHZEITIG = 3;
    return this.#reihen(async () => {
      for (let i = 0; i < liste.length; i += GLEICHZEITIG) {
        await Promise.all(liste.slice(i, i + GLEICHZEITIG)
          .map(([blick, foto]) => this.#fotoSchreiben(blick, foto).catch((fehler) => {
            if (globalThis.console) console.warn("[lifeskin] Foto nicht gespeichert:", fehler?.message);
          })));
      }
    });
  }

  async #fotoSchreiben(blick, foto) {
    const daten = {
      createdAt: jetzt(),
      blick,
      jpeg: foto.jpeg,
      breite: Math.round(foto.breite || 0),
      hoehe: Math.round(foto.hoehe || 0)
    };
    const maske = Object.keys(daten).map((f) => `updateMask.fieldPaths=${f}`).join("&");
    const antwort = await this.fetchFn(`${this.pfad}/photos/${encodeURIComponent(blick)}?${maske}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fields: felder(daten) })
    });
    if (!antwort.ok) throw new Error(`Foto ${blick}: Firestore ${antwort.status}`);
  }

  // Die Miniaturen, die der Patient auf seiner Warteseite sieht.
  //
  // ZWEITE FASSUNG, ANDERER ORT - und beides aus demselben Grund.
  //
  // Die Warteseite ist oeffentlich lesbar; die Sitzung ist es nicht, denn
  // dort stehen Telefonnummer und Anschrift. Die Fotos in voller
  // Aufloesung bleiben deshalb, wo sie sind: in der Sitzung, lesbar nur
  // fuer das CEO-Konto. Was hier hinausgeht, ist eine kleine Fassung
  // NEBEN DEM BERICHT - dieselbe Sichtbarkeit wie der Bericht, den sie
  // beschreibt, und ein Bruchteil der Groesse.
  //
  // Warum ueberhaupt: "6 foto" ist eine Zahl. Sein eigenes Gesicht ist die
  // Akte. Von 32 fertigen Analysen haben 13 ihren Befund gesehen, und der
  // Bildschirm, auf dem sich das entscheidet, ist genau dieser.
  //
  // WIE DIE FOTOS: nebeneinander zu dritt, jede mit eigenem Fehlerfang,
  // keine haelt den Trichter auf. Eine Miniatur, die nicht ankommt, kostet
  // eine Kachel - die Warteseite faellt auf ihre Ersatzdarstellung zurueck
  // und steht trotzdem.
  miniaturenSpeichern(minis = {}) {
    const liste = Object.entries(minis).filter(([, mini]) => mini?.jpeg);
    if (!liste.length) return this.kette;
    const GLEICHZEITIG = 3;
    return this.#reihen(async () => {
      for (let i = 0; i < liste.length; i += GLEICHZEITIG) {
        await Promise.all(liste.slice(i, i + GLEICHZEITIG)
          .map(([blick, mini]) => this.#miniaturSchreiben(blick, mini).catch((fehler) => {
            if (globalThis.console) console.warn("[lifeskin] Miniatur nicht gespeichert:", fehler?.message);
          })));
      }
    });
  }

  async #miniaturSchreiben(blick, mini) {
    const daten = {
      createdAt: jetzt(),
      blick,
      jpeg: mini.jpeg,
      breite: Math.round(mini.breite || 0),
      hoehe: Math.round(mini.hoehe || 0)
    };
    const maske = Object.keys(daten).map((f) => `updateMask.fieldPaths=${f}`).join("&");
    const antwort = await this.fetchFn(`${this.berichtPfadVoll}/thumbs/${encodeURIComponent(blick)}?${maske}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fields: felder(daten) })
    });
    if (!antwort.ok) throw new Error(`Miniatur ${blick}: Firestore ${antwort.status}`);
  }

  // Wo der Bericht in Firestore liegt. Nicht zu verwechseln mit
  // berichtPfad, das die Adresse IM BROWSER ist - der Weg, auf den der
  // Patient nach dem Scan geschickt wird.
  get berichtPfadVoll() {
    return `${this.basis}/lifeskin/${this.tenantId}/reports/${this.id}`;
  }

  // Den Bericht anlegen, den der Patient bekommt.
  //
  // Ein eigenes Dokument neben der Sitzung: In der Sitzung stehen
  // Telefonnummer und Anschrift, und die Befundseite ist oeffentlich
  // lesbar. Wer seinen Link weitergibt, soll nicht seine Adresse
  // mitverschicken.
  //
  // Er entsteht im Zustand "wartet" und enthaelt nichts, was ihn selbst zu
  // einer Aussage machen wuerde. Was darin steht, schreibt Dr. Gashi.
  // DIESES EINE SCHREIBEN DARF NICHT STILL SCHEITERN.
  //
  // GEMESSEN, NICHT GESCHAETZT: Es scheiterte - eine Regel liess die Zahl
  // der Fotos nur bis neun zu, geschickt wurden zehn. Die Kette schluckte
  // den Fehler wie jeden anderen, der Trichter leitete trotzdem weiter,
  // und der Patient stand vor "Kjo analizë nuk u gjet." Der ganze Scan war
  // weg, und niemand konnte sehen, warum.
  //
  // Ein zweiter Versuch, und die Antwort geht nach oben. Fuer alles andere
  // in dieser Klasse bleibt es beim Schlucken: Eine Zaehlung, die den
  // Trichter anhaelt, waere teurer als jede fehlende Zahl. Der Bericht ist
  // kein solcher Fall - er ist der Zweck.
  berichtAnlegen({ name = "", sprache = "sq", typ = "scan", photos = 0 } = {}) {
    const daten = {
      createdAt: this.createdAt,
      code: this.code,
      name: String(name || "").slice(0, 80),
      sprache,
      // Welcher der vier Wege hierher gefuehrt hat.
      //
      // Er steht im Bericht und nicht nur in der Sitzung, weil die
      // Warteseite nur den Bericht lesen darf - in der Sitzung stehen
      // Telefonnummer und Anschrift. Was auf der Warteseite steht,
      // haengt daran: Wer eine Frage gestellt hat, wartet auf eine
      // Antwort und nicht auf eine Analyse.
      typ: ["scan", "foto", "trup", "pytje"].includes(typ) ? typ : "scan",
      status: "wartet",
      photos: Math.max(0, Math.min(20, Math.round(photos) || 0))
    };
    const schreiben = async () => {
      const antwort = await this.fetchFn(
        `${this.basis}/lifeskin/${this.tenantId}/reports?documentId=${this.id}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fields: felder(daten) })
        }
      );
      // 409 heisst: gibt es schon. Das ist beim Neuladen der Normalfall und
      // kein Fehler.
      return antwort.ok || antwort.status === 409;
    };
    this.kette = this.kette.then(async () => {
      try {
        if (await schreiben()) return true;
      } catch { /* zweiter Versuch */ }
      try {
        return await schreiben();
      } catch (fehler) {
        if (globalThis.console) console.warn("[lifeskin] Bericht nicht angelegt:", fehler?.message);
        return false;
      }
    });
    return this.kette;
  }

  // Wohin der Patient nach dem Scan geht.
  get berichtPfad() {
    return `/analiza/${this.id}`;
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
