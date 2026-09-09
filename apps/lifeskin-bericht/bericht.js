// Die Befundseite: mnyra.com/analiza/<kennung>
//
// Sie gehoert dem Patienten. Er kommt direkt nach dem Scan hierher, sie hat
// eine eigene Adresse, er kann sie speichern und weiterschicken.
//
// ZWEI ZUSTAENDE, und heute nur der erste:
//
//   "wartet"  - Dr. Gashi hat den Fall noch nicht angesehen. Das ist der
//               Bildschirm, den fast jeder sieht.
//   "fertig"  - ihr Befund, die Therapie, die Produkte, der Kauf.
//
// WARUM EIN EIGENES DOKUMENT und nicht die Sitzung selbst: In der Sitzung
// stehen Telefonnummer und Anschrift. Waere sie oeffentlich lesbar, verschickt
// jemand, der seinen Link teilt, seine eigene Adresse mit. Das Berichtdokument
// enthaelt nur, was auf dieser Seite steht.

// Relativ und nicht absolut: Der Browser kaeme mit beidem zurecht, die
// Tests nur mit diesem - und ungetesteter Code ist hier schon zweimal teuer
// geworden.
import { LIFESKIN_FIRESTORE_BASE, LIFESKIN_TENANT, LIFESKIN_TELEFON_VORWAHL,
  LIFESKIN_WHATSAPP, LIFESKIN_WHATSAPP_TEXT, LIFESKIN_ANBIETER }
  from "../lifeskin/lifeskin-config.js";
import { STANDARD_KONFIG, tagespreis } from "../lifeskin/lifeskin-catalog.js";
import { felder } from "../lifeskin/lifeskin-session.js";
import { Pixel } from "../lifeskin/lifeskin-pixel.js";
import { TEXTE, t, fuelle } from "./bericht-texte.js";
// Dasselbe Modul, das Heart benutzt: Was dort erzeugt wurde, wird hier
// gezeigt. Die Zeichen je Produktart kommen mit - ein leerer Rahmen sieht
// nach Panne aus, ein Tiegel nach Pflege.
import { ikoneFuer } from "../../shared/lifeskin-terapia.js";

const $ = (auswahl) => document.querySelector(auswahl);

// Die Zeichen.
//
// Sie sind hier keine Zierde: Wer eine Seite ueberfliegt, haengt an
// Ueberschriften und Symbolen, nicht an Saetzen. Jedes steht fuer genau
// eine Frage, die vor dem Kauf im Kopf ist - und beantwortet sie, bevor
// irgendwer den Satz daneben liest.
// Wie viele Parameter die Analyse beurteilt. Gezeigt werden die fuenf
// staerksten; beurteilt sind zehn, und dieselbe Zahl steht im Auftrag an
// die Analyse und im Absatz "Kerkesa & ekzaminimi". Eine Zahl an einer
// Stelle - sonst sind es frueher oder spaeter zwei verschiedene.
// Wie viele Parameter beurteilt wurden, wenn die Analyse es nicht sagt.
//
// Nur noch der Rueckfallwert. Die Zahl kommt aus der Analyse selbst
// ("raporti.parametrat_e_vleresuar"); eine feste Zehn an dieser Stelle war
// eine Behauptung, die die Liste darunter nicht gedeckt hat.
const PARAMETER_BEURTEILT = 10;

// Wie viele Messwerte OBEN stehen. Fuenf Balken untereinander sind nicht
// glaubwuerdiger als drei - sie sind nur laenger. Der Satz darunter sagt,
// wie viele wirklich geprueft wurden; die uebrigen stehen in den
// Einzelheiten, fuer den, der nachsieht.
const MESSWERTE_OBEN = 3;

// Die eine Adresse, unter der ein erfundener Fall gezeigt wird.
//
// Sie steht HIER und nicht bei den Testdaten: Der Pfad muss geprueft
// werden, bevor die Testdaten ueberhaupt geladen werden - sonst laedt
// jeder echte Patient sie mit herunter. Ein Zeichenkettenvergleich des
// ganzen Pfades, kein Muster und kein Parameter.
const TESTPFAD = "/lifeskinlifeskintesttest";

export function istTestpfad(pfad = "") {
  return String(pfad || "").replace(/\/+$/, "").toLowerCase() === TESTPFAD;
}

const ZEICHEN = Object.freeze({
  // "Muss ich vorher zahlen?"
  hand: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M2 13.5c1.6-1.2 3.2-1.1 4.6.2l2.2 2.1"/><path d="M7 11.5l4.6 1.2a2 2 0 0 0 2.2-3l-2.4-3a2 2 0 0 1 .3-2.8l1-.8"/><path d="M13 16.5l6.2-3.4a1.9 1.9 0 0 1 2.6.8c.5.9.2 2-.7 2.5l-6.4 3.8a4 4 0 0 1-3.4.3L7 18.5"/></svg>',
  // "Was, wenn es nicht wirkt?"
  schild: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l8 3.5v6c0 5-3.4 9-8 10.5-4.6-1.5-8-5.5-8-10.5v-6z"/><path d="M8.6 12.2l2.4 2.4 4.4-4.6"/></svg>',
  // "Wann kommt es?"
  paket: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M2 8.5h11v9H2z"/><path d="M13 11h4l3 3v3.5h-7z"/><circle cx="6" cy="19" r="1.6"/><circle cx="16.5" cy="19" r="1.6"/></svg>',
  haken: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
  karton: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7.5l9-4 9 4v9l-9 4-9-4z"/><path d="M3 7.5l9 4 9-4"/><path d="M12 11.5v9"/></svg>',
  kamera: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 8.5h3.2l1.6-2.4h8.4l1.6 2.4H21v11H3z"/><circle cx="12" cy="14" r="3.4"/></svg>',
  // Die Zeichen der drei Kacheln oben.
  //
  // Sie muessen sagen, WAS gezaehlt wurde, und zwar in sechzehn
  // Bildpunkten. Deshalb je ein Gegenstand statt eines Sinnbilds:
  //   kamera  - die Aufnahmen
  //   regler  - die Parameter. Drei Schieber sagen "beurteilt", nicht
  //             "gemessen"; ein Balkendiagramm sagte das Falsche, denn
  //             hier steht nur, wie viele geprueft wurden.
  //   fytyra  - die Zonen. Eine Gesichtskontur mit Marken, KEIN Fadenkreuz
  //             und kein Zielkreis: Das ist die Bildsprache von Zielen und
  //             Treffern und hat auf einem Befund nichts zu suchen.
  regler: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h9M18.4 7H20M4 12h3.4M12.8 12H20M4 17h7.4M16.8 17H20"/><circle cx="15.7" cy="7" r="1.9"/><circle cx="10.1" cy="12" r="1.9"/><circle cx="14.1" cy="17" r="1.9"/></svg>',
  // GEMESSEN AM ZEICHEN, NICHT AM ENTWURF: Erst lag die Stirnlinie ueber
  // die volle Breite und darunter ein Mund - zusammen las sich das als
  // Smiley mit Stirnband. Jetzt sind es drei eingerueckte Marken:
  // Stirn, Augenpartie, Kinn. Das ist eine Zoneneinteilung und kein
  // Gesichtsausdruck.
  fytyra: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3.2c4.2 0 7 2.8 7 6.9v2.4c0 4.4-3.1 8.1-7 8.1s-7-3.7-7-8.1V10.1c0-4.1 2.8-6.9 7-6.9z"/><path d="M9.2 8.2h5.6"/><path d="M8.5 11.8h1.6M13.9 11.8h1.6"/><path d="M10.3 15.6h3.4"/></svg>',
  raster: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3c4.5 0 8 3.8 8 8.5S16.5 21 12 21s-8-3.8-8-9.5S7.5 3 12 3z"/><path d="M4.4 11.5h15.2M12 3.2v17.6"/></svg>',
  tropfen: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3.2s6 6.5 6 10.4a6 6 0 0 1-12 0C6 9.7 12 3.2 12 3.2z"/></svg>',
  // Die Zeichen der Produktkarte. Derselbe 24er Kasten, dieselbe
  // Strichstaerke, dieselben runden Enden wie die uebrigen - Zeichen aus
  // verschiedenen Quellen sehen zusammen nach Baukasten aus, und ein
  // Baukasten wirkt billig.
  vellim: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3.2s6 6.5 6 10.4a6 6 0 0 1-12 0C6 9.7 12 3.2 12 3.2z"/><path d="M8.4 14.6h7.2"/></svg>',
  hene: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M20.2 14.8A8.4 8.4 0 0 1 9.2 3.8 8.8 8.8 0 1 0 20.2 14.8z"/></svg>',
  diell: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4.2"/><path d="M12 2.6v2.2M12 19.2v2.2M2.6 12h2.2M19.2 12h2.2M5.4 5.4l1.6 1.6M17 17l1.6 1.6M18.6 5.4L17 7M7 17l-1.6 1.6"/></svg>',
  ora: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8.6"/><path d="M12 7.4v4.9l3 1.9"/></svg>',
  // Ein Pfeil, kein Haken.
  //
  // Die Zeilen sagen, was das Mittel TUT - ein Pfeil ist Ursache und
  // Wirkung. Ein Haken sagt "ist enthalten", und das ist die falsche
  // Bedeutung: Er gehoert zu einer Leistungsliste, nicht zu einem
  // Wirkmechanismus.
  shigjeta: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 12h14"/><path d="M13.2 6.4L19 12l-5.8 5.6"/></svg>',
  uhr: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5.3l3.2 2"/></svg>',
  balken: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20V13M9.3 20V7M14.7 20V10.5M20 20V4"/></svg>',
  haus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 10.5L12 4l8 6.5V20a1 1 0 0 1-1 1h-4v-6h-6v6H5a1 1 0 0 1-1-1z"/></svg>'
});

// Zahlen so, wie sie in Kosovo und Albanien geschrieben werden: Komma statt
// Punkt, und ganze Betraege ohne Nachkommastellen.
function zahl(wert) {
  const n = Number(wert);
  if (!Number.isFinite(n)) return "";
  return (Number.isInteger(n) ? String(n) : n.toFixed(2)).replace(".", ",");
}
function euro(wert) { return `${zahl(wert)} €`; }

function schreibe(knoten, text) {
  if (knoten && knoten.textContent !== text) knoten.textContent = text;
}

function zeige(name) {
  for (const schirm of ["laedt", "weg", "wartet", "fertig", "bestellen"]) {
    const knoten = $(`#lb-${schirm}`);
    if (knoten) knoten.dataset.aktiv = schirm === name ? "ja" : "nein";
  }
}

// Firestore-Werte in gewoehnliche zurueckverwandeln. Nur die Formen, die im
// Bericht vorkommen - mehr braucht diese Seite nicht.
function wert(feld) {
  if (!feld || typeof feld !== "object") return null;
  if ("stringValue" in feld) return feld.stringValue;
  if ("integerValue" in feld) return Number(feld.integerValue);
  if ("doubleValue" in feld) return feld.doubleValue;
  if ("booleanValue" in feld) return feld.booleanValue;
  if ("timestampValue" in feld) return feld.timestampValue;
  if ("arrayValue" in feld) return (feld.arrayValue.values || []).map(wert);
  if ("mapValue" in feld) {
    const raus = {};
    for (const [k, v] of Object.entries(feld.mapValue.fields || {})) raus[k] = wert(v);
    return raus;
  }
  return null;
}

// Die Kennung steht im Pfad: /analiza/<kennung>
function kennungAusPfad(pfad = globalThis.location?.pathname || "") {
  const teile = String(pfad).split("/").filter(Boolean);
  const letztes = teile[teile.length - 1] || "";
  return /^[0-9a-f]{8,64}$/.test(letztes) ? letztes : "";
}

// Wann Dr. Gashi antwortet - ehrlich, nicht erfunden.
//
// Vor achtzehn Uhr: heute. Danach: morgen frueh. Keine Warteschlange, keine
// Position. Wer nachts kommt und "noch 3 vor Ihnen" liest, weiss, dass es
// gelogen ist - und glaubt danach auch dem Befund nicht.
export function wartetext(stunde) {
  return stunde < 18 ? TEXTE.dauerHeute : TEXTE.dauerMorgen;
}

class Bericht {
  constructor({ fetchFn, ort, pixel } = {}) {
    this.fetchFn = fetchFn || ((...a) => globalThis.fetch(...a));
    this.ort = ort || globalThis.location;
    this.kennung = kennungAusPfad(this.ort?.pathname);
    this.sprache = "sq";
    this.daten = null;
    this.waGetippt = false;
    this.waGefragt = false;
    this.pixel = pixel || new Pixel();
  }

  text(schluessel, werte) {
    const roh = t(TEXTE[schluessel], this.sprache);
    return werte ? fuelle(roh, werte) : roh;
  }

  async starte() {
    schreibe($("#lb-laedttext"), this.text("laedt"));
    if (!this.kennung) { this.#wegZeigen(); return; }

    try {
      const antwort = await this.fetchFn(
        `${LIFESKIN_FIRESTORE_BASE}/lifeskin/${LIFESKIN_TENANT}/reports/${this.kennung}`
      );
      if (!antwort.ok) { this.#wegZeigen(); return; }
      const roh = await antwort.json();
      this.daten = {};
      for (const [k, v] of Object.entries(roh.fields || {})) this.daten[k] = wert(v);
    } catch {
      this.#wegZeigen();
      return;
    }

    this.sprache = this.daten.sprache === "de" ? "de" : "sq";
    // Und das Merkmal am Wurzelelement mit. Ohne diese Zeile stand dort
    // weiter lang="sq", auch wenn der ganze Befund deutsch war - ein
    // Vorleseprogramm sagte dann deutschen Text mit albanischer
    // Aussprache auf.
    if (document.documentElement) document.documentElement.lang = this.sprache;
    // Dass er seine Seite ueberhaupt geoeffnet hat, ist die erste Zahl, die
    // ueber diesen Weg entscheidet: Wer nach dem Scan nie ankommt, ist auf
    // dem Weg dorthin verloren gegangen, und dann liegt es nicht am Befund.
    this.#merken({ berichtGeoeffnet: true });
    if (this.pixel.starte()) this.pixel.melde("opened");
    this.#ereignisse();
    await this.#zeichnen();
    this.#horchen();
  }

  // Welcher Bildschirm zum Zustand gehoert.
  async #zeichnen() {
    if (this.daten.status === "wartet") { this.#wartenZeigen(); return; }
    await this.#produkteHolen();
    this.#fertigZeigen();
  }

  // OHNE NEULADEN.
  //
  // Gefragt wird in Abstaenden, nicht gelauscht. Ein echter Horchkanal
  // brauchte das Firebase-Paket - rund 460 KB auf einer Seite, die in
  // Sekunden offen sein muss und oft im Fenster von Instagram laeuft. Für
  // eine Wartezeit von Stunden ist ein Blick alle zwoelf Sekunden genauso
  // gut und kostet nichts.
  //
  // Und nur, solange die Seite wirklich zu sehen ist: Ein Handy in der
  // Tasche fragt nicht. Kommt sie zurueck, wird sofort gefragt - das ist der
  // Moment, in dem jemand nachsieht, ob der Befund da ist.
  #horchen() {
    const fertigOderWeiter = () => ["bestellt", "versandt", "zugestellt"].includes(this.daten?.status);
    const nachsehen = async () => {
      if (document.visibilityState !== "visible" || fertigOderWeiter()) return;
      const vorher = this.daten?.status;
      const frisch = await this.#holen();
      if (!frisch || frisch.status === vorher) return;
      this.daten = frisch;
      await this.#zeichnen();
    };
    this.takt = setInterval(nachsehen, 12000);
    document.addEventListener("visibilitychange", () => { if (document.visibilityState === "visible") nachsehen(); });
  }

  async #holen() {
    try {
      const antwort = await this.fetchFn(
        `${LIFESKIN_FIRESTORE_BASE}/lifeskin/${LIFESKIN_TENANT}/reports/${this.kennung}`
      );
      if (!antwort.ok) return null;
      const roh = await antwort.json();
      const raus = {};
      for (const [k, v] of Object.entries(roh.fields || {})) raus[k] = wert(v);
      return raus;
    } catch { return null; }
  }

  // Die Produkte stehen NICHT im Bericht.
  //
  // Ihre Fotos sind Datenzeilen von mehreren hunderttausend Zeichen; zwei
  // davon sprengen ein Firestore-Dokument. Im Bericht steht nur, welches
  // Produkt und welcher persoenliche Satz - das Uebrige kommt aus der
  // Produktsammlung, die ohnehin oeffentlich lesbar ist.
  async #produkteHolen() {
    const gewaehlt = Array.isArray(this.daten.produkte) ? this.daten.produkte : [];
    this.produkte = [];
    for (const eintrag of gewaehlt) {
      const id = typeof eintrag === "string" ? eintrag : eintrag?.id;
      if (!id) continue;
      let stamm = {};
      try {
        const antwort = await this.fetchFn(
          `${LIFESKIN_FIRESTORE_BASE}/lifeskin/${LIFESKIN_TENANT}/products/${encodeURIComponent(id)}`
        );
        if (antwort.ok) {
          const roh = await antwort.json();
          for (const [k, v] of Object.entries(roh.fields || {})) stamm[k] = wert(v);
        }
      } catch { /* ohne Stammdaten bleibt der persoenliche Satz */ }
      this.produkte.push({
        id,
        name: stamm.name || id,
        inhalt: stamm.inhalt || "",
        einzelpreis: Number(stamm.einzelpreis) || 0,
        foto: typeof stamm.photoRef === "string" && stamm.photoRef.startsWith("data:image") ? stamm.photoRef : "",
        satz: (typeof eintrag === "object" && eintrag?.satz) || stamm.kurztext?.[this.sprache] || "",
        // Was das Mittel tut.
        //
        // Zuerst das, was IM BERICHT steht: Dr. Gashi hat es fuer diesen
        // Fall gesehen und freigegeben. Erst wenn dort nichts liegt - ein
        // alter Bericht -, kommen die Zeilen aus dem Katalog. Andersherum
        // wuerde eine spaetere Aenderung am Produkt einen Befund umschreiben,
        // der laengst beim Patienten liegt.
        veprimi: ((typeof eintrag === "object" && Array.isArray(eintrag?.veprimi) && eintrag.veprimi.length
          ? eintrag.veprimi
          : (stamm.veprimi?.[this.sprache] || [])))
          .map((x) => String(x || "").trim()).filter(Boolean),
        // Die Art des Mittels traegt das Zeichen, wenn kein Foto da ist.
        lloji: String(stamm.lloji || "").toLowerCase(),
        nenName: String(stamm.nenName?.[this.sprache] || ""),
        // Wirkstoffe, Anwendung und Ziel bleiben am Produkt und werden
        // hier geholt: Sie sind bei jedem Patienten gleich und aendern
        // sich nicht mit dem Befund. Nur der Satz und die Wirkungszeilen
        // liegen im Bericht - die hat Dr. Gashi fuer DIESEN Fall
        // freigegeben.
        perberesit: (Array.isArray(stamm.perberesit) ? stamm.perberesit : [])
          .map((x) => ({
            emri: String(x?.emri || "").trim(),
            sasia: String(x?.sasia || "").trim(),
            roli: String(x?.roli?.[this.sprache] || "").trim()
          }))
          .filter((x) => x.emri),
        perdorimi: stamm.perdorimi ? {
          hapi: Number(stamm.perdorimi.hapi) || 0,
          koha: String(stamm.perdorimi.koha?.[this.sprache] || "").trim(),
          sasia: String(stamm.perdorimi.sasia?.[this.sprache] || "").trim(),
          si: String(stamm.perdorimi.si?.[this.sprache] || "").trim(),
          kujdes: String(stamm.perdorimi.kujdes?.[this.sprache] || "").trim()
        } : null,
        synimi: String(stamm.synimi?.[this.sprache] || "").trim()
      });
    }
  }

  // Was auf dieser Seite geschieht, gehoert in dieselbe Sitzung.
  //
  // Sonst stuende in Heart der Scan und danach nichts mehr: Ob der Patient
  // seine Seite ueberhaupt geoeffnet hat, ob er sich melden wollte, ob er
  // den Link kopiert hat - das sind genau die Zahlen, an denen sich zeigt,
  // ob dieser Weg traegt. Die Sitzung darf jeder ergaenzen und niemand ausser
  // dem CEO-Konto lesen; hier gilt dieselbe Tuer wie im Trichter.
  //
  // Der Fehler wird geschluckt. Eine Zaehlung, die die Seite anhaelt, waere
  // teurer als jede fehlende Zahl.
  #merken(daten) {
    const mit = { updatedAt: new Date().toISOString(), ...daten };
    const maske = Object.keys(mit)
      .map((f) => `updateMask.fieldPaths=${encodeURIComponent(f)}`).join("&");
    return this.fetchFn(
      `${LIFESKIN_FIRESTORE_BASE}/lifeskin/${LIFESKIN_TENANT}/sessions/${this.kennung}?${maske}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fields: felder(mit) })
      }
    ).catch((fehler) => {
      globalThis.console?.warn?.("[lifeskin] Bericht nicht gezaehlt:", fehler?.message);
    });
  }

  #wegZeigen() {
    schreibe($("#lb-wegtitel"), this.text("wegTitel"));
    schreibe($("#lb-wegtext"), this.text("wegText"));
    zeige("weg");
  }

  #wartenZeigen() {
    const name = (this.daten.name || "").trim();
    // Ohne Namen kein leerer Platz mitten im Satz. Das passiert seltener,
    // als man denkt, und sieht dann doppelt kaputt aus.
    schreibe($("#lb-titel"), name ? this.text("titel", { name }) : this.text("titelOhneName"));
    schreibe($("#lb-warum"), this.text("warum"));

    // Die Wartezeit oben, als Erstes im Blick.
    schreibe($("#lb-dauer b"), t(wartetext(new Date().getHours()), this.sprache));

    schreibe($("#lb-aktemarke"), this.text("akteMarke"));
    schreibe($("#lb-nummer"), this.daten.code || "");
    schreibe($("#lb-zeitleiste"), this.#zeitLesbar(this.daten.createdAt));
    schreibe($("#lb-fotos"), this.text("akteFotos", { anzahl: this.daten.photos || 3 }));

    this.#schritteZeigen();

    schreibe($("#lb-benachrichtigen"), this.text("benachrichtigen"));
    schreibe($("#lb-waunter"), this.text("waUnter"));
    schreibe($("#lb-warueckfrage"), this.text("waRueckFrage"));
    schreibe($("#lb-warueckja"), this.text("waRueckJa"));
    schreibe($("#lb-kopieren"), this.text("kopieren"));
    schreibe($("#lb-faqknopf"), this.text("waWasPassiert"));

    // Das Blatt.
    schreibe($("#lb-blatttitel"), this.text("waWasPassiert"));
    schreibe($("#lb-wafaqtext"), this.text("waWasPassiertText"));
    schreibe($("#lb-kopierenunter"), this.text("kopierenUnter"));
    schreibe($("#lb-haftung"), this.text("haftung"));
    schreibe($("#lb-blattzu"), this.text("blattZu"));

    this.#whatsappSetzen();

    zeige("wartet");
  }

  // Vier Punkte: zwei erledigt, einer laeuft, einer offen.
  //
  // Er stand einmal als Liste da - vier Zeilen Text, die jeder ueberflog und
  // niemand zu Ende las. Als Balkenreihe sagt er dasselbe in einer Zeile,
  // und benannt wird nur der laufende: Das ist der einzige, der eine Frage
  // beantwortet ("was passiert gerade?"). Die anderen drei beantwortet der
  // Blick auf die Reihe.
  #schritteZeigen() {
    const liste = $("#lb-schritte");
    if (!liste) return;
    liste.innerHTML = "";

    // Die vier Punkte trugen gar keinen Text - vier leere <li>, die sich
    // nur durch ein Merkmal unterschieden. Wer sie sieht, liest die Reihe
    // ohne ein Wort; wer sie nicht sieht, bekam "Liste mit 4 Eintraegen"
    // und viermal nichts. Die Beschriftungen lagen die ganze Zeit fertig
    // in den Texten und wurden von niemandem abgerufen.
    const staende = ["fertig", "fertig", "laeuft", "offen"];
    const marken = ["schrittScan", "schrittFotos", "schrittAnalyse", "schrittFertig"];
    for (const [i, stand] of staende.entries()) {
      const el = document.createElement("li");
      el.dataset.stand = stand;
      const wort = document.createElement("span");
      wort.className = "ls-nurvorlesen";
      schreibe(wort, this.text(marken[i]));
      el.appendChild(wort);
      liste.appendChild(el);
    }
    schreibe($("#lb-jetzt"), this.text("schrittAnalyse"));
  }

  // ---------- Der fertige Befund ----------
  //
  // Aufgebaut wie ein Arztbrief: erst was geprueft wurde, dann was gefunden
  // wurde, dann die Messwerte - und erst als SCHLUSS daraus die Diagnose.
  // Wer die Zahlen gelesen hat, bevor die Diagnose kommt, hinterfragt sie
  // nicht mehr; sie ist dann seine eigene Rechnung.
  //
  // Alles, was Dr. Gashi nicht eingetragen hat, faellt ersatzlos weg. Eine
  // kuerzere Seite ist immer besser als eine mit leeren Zeilen darauf.

  get raport() { return this.daten.raport || {}; }

  #fertigZeigen() {
    schreibe($("#lb-ftitel"), this.text("raportTitel"));
    // Die Zeile ueber dem Namen traegt den Vornamen des Patienten - und
    // faellt ohne ihn nicht weg: Sie ist der Satz, der die Aerztin
    // darunter erklaert, nicht eine Anrede.
    const name = String(this.daten.name || "").trim();
    schreibe($("#lb-ffuer"), name ? this.text("raportFuer", { name }) : this.text("raportFuerOhne"));
    schreibe($("#lb-fvontext"), this.text("arztName"));
    schreibe($("#lb-farzt"), this.text("arztRolle"));
    schreibe($("#lb-fnummer"), this.daten.code || "");
    schreibe($("#lb-therapiemarke"), this.text("therapieMarke"));
    schreibe($("#lb-fhaftung"), this.text("haftung"));

    this.#pillenZeichnen();
    this.#ekzaminimiZeichnen();
    this.#gjetjetZeichnen();
    this.#messZeichnen();
    this.#diagnoseZeichnen();
    this.#erklaerungZeichnen();
    this.#ohneZeichnen();
    this.#produkteZeichnen();
    const rat = String(this.raport.keshilla || "").trim();
    const ratknoten = $("#lb-rat");
    if (ratknoten) {
      schreibe(ratknoten, rat);
      ratknoten.classList.toggle("ls-verstecken", !rat);
    }
    schreibe($("#lb-detajetwort"), this.text("detajetAuf"));
    this.#detajetZeichnen();
    // Was ein Foto nicht sagen kann. Der Text lag fertig in den
    // Beschriftungen und wurde nie gezeichnet - die freiwillig genannte
    // Grenze ist aber genau das, was den Rest der Seite traegt.
    schreibe($("#lb-grenzenmarke"), this.text("grenzenMarke"));
    schreibe($("#lb-grenzentext"), this.text("grenzenText"));
    schreibe($("#lb-kalim"), this.text("kalimSatz"));
    schreibe($("#lb-paketamarke"), this.text("paketaMarke"));
    this.#perfshiZeichnen();
    this.#garantieZeichnen();
    this.#fragenZeichnen();
    this.#planZeichnen();
    schreibe($("#lb-betreuungtitel"), this.text("betreuungTitel"));
    schreibe($("#lb-betreuungtext"), this.text("betreuungText"));
    this.#kontaktZeichnen();
    this.#anbieterZeichnen();
    this.#preisZeichnen();
    this.#sicherZeichnen();
    this.#versandZeichnen();

    zeige("fertig");
    this.#leisteMessen();
    this.#bewegen();
  }

  // ---------- Bewegung ----------
  //
  // Sie ist hier kein Schmuck. Ein Befund, der als fertige Wand dasteht,
  // wird ueberflogen; einer, dessen Abschnitte beim Herunterkommen
  // erscheinen, wird gelesen - das Auge bleibt an dem haengen, was gerade
  // entsteht, und ueberspringt es nicht.
  #bewegen() {
    const rolle = $("#lb-rolle");
    if (!rolle) return;
    this.#fortschritt(rolle);
    this.#knopfBeobachten(rolle);
    this.#einblenden(rolle);
  }

  // Die Einblendung - und die drei Riegel, die sie harmlos machen.
  //
  // Eine Animation, die eine Aussage verschluckt, ist der schlimmste
  // Fehler dieser Seite: Der Preis stand da und war unsichtbar, der
  // Befund stand da und war unsichtbar. Deshalb steht hier neben der
  // Bewegung dreimal dasselbe Prinzip - erst zeigen koennen, dann
  // verstecken.
  //
  //   1. VERSTECKT WIRD ERST HIER, IM CODE. Ohne dieses Merkmal gilt in
  //      der Stildatei keine einzige Regel dazu. Faellt das Skript aus
  //      oder bricht es vorher ab, steht der ganze Bericht da.
  //   2. GERECHNET, NICHT BEOBACHTET. Ein IntersectionObserver meldet nur
  //      Wechsel: Springt die Seite in einem Satz ueber einen Abschnitt
  //      hinweg - genau das, was ein Telefon beim schnellen Wischen tut -,
  //      war er nie sichtbar, es gibt keinen Wechsel, und er bliebe
  //      versteckt. Bei jedem Scrollen einmal nachrechnen kennt diesen
  //      Fall nicht: Was oberhalb des unteren Randes liegt, ist da.
  //      Es ist derselbe Weg wie bei der Kaufleiste, aus demselben Grund.
  //   3. WAS SCHON IM BILD STEHT, WIRD NIE VERSTECKT. Der erste
  //      Bildschirm - Kopf, Zusammenfassung, Diagnose - steht sofort.
  //
  // Und was im Aufklapper liegt, bleibt ganz draussen: Zugeklappt kommt es
  // nie ins Bild, also wuerde es beim Aufklappen unsichtbar bleiben.
  #einblenden(rolle) {
    // Nach einer Bestellung wird der Bericht neu gezeichnet. Dann darf
    // nicht alles noch einmal verschwinden und wieder auftauchen - und
    // schon gar nicht darf sich ein zweiter Scroll-Horcher ansammeln.
    if (this.einblendPruefen) { this.einblendPruefen(); return; }

    // Wer Bewegung abgeschaltet hat, bekommt keine - und zwar so, dass
    // gar nichts erst versteckt wird.
    if (globalThis.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches) return;

    const imAufklapper = (el) => {
      const kasten = el.closest("details");
      return Boolean(kasten) && kasten !== el;
    };
    // NICHT ".lb-preis": Er liegt im Angebotsblock, und zwei geschachtelte
    // Verstecke koennen einander ueberdauern - dann steht der Kasten da
    // und die Zahl darin fehlt.
    // Ein Stueck vor dem unteren Rand: So steht ein Abschnitt schon, wenn
    // er auftaucht, statt erst halb im Bild anzufangen.
    const imBild = (el) => el.getBoundingClientRect().top < window.innerHeight * 0.94;

    // ERST MESSEN, DANN VERSTECKEN.
    //
    // GEMESSEN, NICHT GESCHAETZT: Vorher wurde alles versteckt und danach
    // wieder freigegeben, was im Bild steht. Dazwischen liegt aber ein
    // Layoutdurchgang - der Browser sieht das Verstecken, und der erste
    // Bildschirm blendete sich beim Oeffnen ueber eine halbe Sekunde ein.
    // Ausgerechnet der Befund, auf den jemand eine Nacht gewartet hat.
    // Was beim Oeffnen im Bild steht, bekommt jetzt gar kein Merkmal.
    const bloecke = Array.from(rolle.querySelectorAll(
      ".lb-teil, .lb-diagnose, .lb-detajet, .lb-kalim, .lb-oferta, .lb-betreuung, .lb-garanci, .lb-pyetje"
    )).filter((el) => !el.classList.contains("ls-verstecken") && !imAufklapper(el) && !imBild(el));
    if (!bloecke.length) return;

    for (const block of bloecke) {
      // Die Zeilen innerhalb eines Blocks bekommen ihre Reihenfolge - sie
      // kommen nacheinander, nicht alle auf einmal.
      //
      // Im Aufklapper NICHT: Dort haengt der Inhalt schon am Aufklappen,
      // und zwei Bedingungen fuer dieselbe Sichtbarkeit sind eine zu viel.
      const kinder = block.matches("details") ? [] : block.querySelectorAll(
        ".lb-zeile, .lb-tut li, .lb-zeitfeld, .lb-plan li, .lb-zone, .lb-satz,"
        + " .lb-pyetje__frage, .lb-perfshi li, .lb-sicher li"
      );
      kinder.forEach((kind, i) => {
        kind.dataset.nach = "ja";
        kind.style.setProperty("--nach", String(Math.min(i, 6)));
      });
      // Die Balkenteile wachsen von links, einer nach dem anderen.
      if (!block.matches("details")) {
        for (const stab of block.querySelectorAll(".lb-stab")) {
          Array.from(stab.children).forEach((teil, i) => teil.style.setProperty("--i", String(i)));
        }
      }
    }

    for (const block of bloecke) block.dataset.zeig = "warte";

    const pruefen = () => {
      let offen = 0;
      for (const block of bloecke) {
        if (block.dataset.zeig === "da") continue;
        if (imBild(block)) block.dataset.zeig = "da";
        else offen += 1;
      }
      return offen;
    };

    this.einblendPruefen = pruefen;
    rolle.addEventListener("scroll", pruefen, { passive: true });
    // Ein groesseres Fenster oder eine gedrehte Hand bringt Abschnitte ins
    // Bild, ohne dass jemand scrollt.
    globalThis.addEventListener?.("resize", pruefen, { passive: true });
    // Und der Aufklapper: Was er aufschiebt, schiebt alles darunter nach
    // unten - ohne diesen Anstoss blieben die verschobenen Abschnitte
    // stehen, bis jemand scrollt.
    $("#lb-detajet")?.addEventListener("toggle", pruefen);
  }

  // Wie weit er wirklich gekommen ist.
  //
  // Heart wusste bisher drei Dinge ueber die Befundseite: geoeffnet,
  // WhatsApp getippt, bestellt. Dazwischen lagen zwei Bildschirmlaengen
  // Bericht, ueber die nichts bekannt war - und genau dort steigt aus,
  // wer aussteigt. Vier Marken schliessen die Luecke:
  //
  //   sahSchnitt      - bis "Hapi i ardhshem" gelesen, also den ganzen
  //                     Befund. Wer hier nicht ankommt, hat den Bericht
  //                     nicht gelesen; das ist ein Textproblem.
  //   sahTherapie     - die Produktkarten gesehen. Wer bis zum Schnitt
  //                     kommt und hier nicht, dem hat der Uebergang nicht
  //                     gereicht.
  //   sahPreis        - den Preis gesehen. Der Abstand zwischen Therapie
  //                     und Preis ist die Zahl, die sagt, ob der Wert
  //                     ankommt.
  //   kasseGeoeffnet  - den Knopf gedrueckt. Der Abstand zu "bestellt"
  //                     gehoert dem Bestellschirm, nicht dem Bericht.
  //
  // Jede Marke wird genau einmal geschrieben. Vier PATCH je Sitzung im
  // schlimmsten Fall - und dafuer laesst sich zum ersten Mal sagen, WO
  // jemand aufhoert statt nur DASS er aufhoert.
  #markiere(name) {
    this.marken = this.marken || new Set();
    if (this.marken.has(name)) return;
    this.marken.add(name);
    this.#merken({ [name]: true });
  }

  // Gemessen wird am unteren Rand des Fensters: Was dort auftaucht, ist
  // gesehen. Gerechnet statt beobachtet, aus demselben Grund wie beim
  // Kaufknopf - ein Beobachter meldet nur Wechsel und verschlaeft jeden
  // Sprung.
  #spurPruefen() {
    const stellen = [
      // Die Ueberleitung ist die Stelle, an der der Bericht endet - sie
      // hiess frueher ".lb-szene" und heisst jetzt ".lb-kalim". Die Marke
      // in Heart bleibt dieselbe, sonst faengt die Zaehlung von vorne an.
      ["sahSchnitt", ".lb-kalim"],
      ["sahTherapie", "#lb-produkte"],
      ["sahPreis", ".lb-preis"]
    ];
    for (const [name, wahl] of stellen) {
      const el = $(wahl);
      if (el && el.getBoundingClientRect().top < window.innerHeight) this.#markiere(name);
    }
  }

  // Der Haarstrich oben. Er sagt, wie viel noch kommt - und dass es ein
  // Ende gibt. Angefangenes wird zu Ende gelesen, wenn man das Ende sieht.
  #fortschritt(rolle) {
    const strich = $("#lb-fortschritt");
    if (!strich) return;
    const messen = () => {
      const weg = rolle.scrollHeight - rolle.clientHeight;
      const anteil = weg > 20 ? Math.min(1, Math.max(0, rolle.scrollTop / weg)) : 0;
      strich.style.width = `${(anteil * 100).toFixed(1)}%`;
      this.#spurPruefen();
    };
    rolle.addEventListener("scroll", messen, { passive: true });
    messen();
  }

  // Drei Pillen, immer in einer Zeile. Sie stehen VOR jeder Aussage:
  // Wer sieht, wie viel geprueft wurde, liest das Folgende anders.
  //
  // GEMESSEN, NICHT GESCHAETZT: Bei einem einzelnen Foto stand dort
  // "1 foto · 1 zona" - das Erste nach der Ueberschrift, und es sagte
  // "wir haben kaum hingeschaut". Es widersprach sogar dem Absatz
  // darunter, in dem zehn Parameter beurteilt werden. Eine Zonenzahl
  // unter drei wird deshalb gar nicht behauptet; an ihrer Stelle steht,
  // was IMMER stimmt und immer gross ist: die Zahl der Parameter.
  #pillenZeichnen() {
    const liste = $("#lb-pillen");
    if (!liste) return;
    liste.innerHTML = "";
    const fotos = Number(this.raport.fotot ?? this.daten.photos) || 0;
    const zonen = Number(this.raport.zonat) || 0;
    const datum = this.#zeitLesbar(this.daten.freigabeAt || this.daten.createdAt).split(",")[0];

    if (fotos) {
      // Die Aufnahmen sind die einzige Kachel, hinter der etwas liegt:
      // Sie oeffnet das Blatt mit den beurteilten Ansichten. Sie bleibt
      // deshalb ein Knopf, auch wenn sie aussieht wie die anderen zwei.
      const knopf = document.createElement("button");
      knopf.type = "button";
      knopf.id = "lb-fotoknopf";
      knopf.setAttribute("aria-haspopup", "dialog");
      knopf.addEventListener("click", () => this.#fotoblatt(true));
      const el = document.createElement("li");
      el.appendChild(this.#kachel(knopf, "kamera", String(fotos), this.text("markeFoto")));
      liste.appendChild(el);
    }

    const geprueft = Number(this.raport.parametratVleresuar) || PARAMETER_BEURTEILT;
    liste.appendChild(this.#pille("regler", String(geprueft), this.text("markeParametra")));

    // Drei Zonen sind ein Ergebnis, eine ist keins. Steht die Analyse
    // unter drei, tritt an ihre Stelle das Datum der Freigabe - eine
    // Angabe, die immer stimmt.
    if (zonen >= 3) liste.appendChild(this.#pille("fytyra", String(zonen), this.text("markeZona")));
    else if (datum) liste.appendChild(this.#pille("uhr", datum, this.text("markeDatum"), true));
  }

  // Eine Kachel: links das Zeichen, rechts die Zahl ueber ihrem Wort.
  #kachel(knoten, zeichen, zahl, marke, lang = false) {
    knoten.className = lang ? "lb-pille lb-pille--lang" : "lb-pille";
    knoten.innerHTML = `<span class="lb-pille__zeichen" aria-hidden="true">${ZEICHEN[zeichen]}</span>`
      + '<span class="lb-pille__leib"><b class="lb-pille__zahl"></b>'
      + '<span class="lb-pille__marke"></span></span>';
    schreibe(knoten.querySelector(".lb-pille__zahl"), zahl);
    schreibe(knoten.querySelector(".lb-pille__marke"), marke);
    return knoten;
  }

  #pille(zeichen, zahl, marke, lang = false) {
    const el = document.createElement("li");
    el.appendChild(this.#kachel(document.createElement("span"), zeichen, zahl, marke, lang));
    return el;
  }

  // Was geprueft wurde. Der technische Absatz - niemand liest ihn zu Ende,
  // und genau deshalb wirkt er.
  #ekzaminimiZeichnen() {
    const text = String(this.raport.ekzaminimi || "").trim();
    schreibe($("#lb-ekzmarke"), this.text("ekzMarke"));
    schreibe($("#lb-ekztext"), text || this.text("ekzStandard", {
      zonat: Number(this.raport.zonat) || 5,
      fotot: Number(this.raport.fotot ?? this.daten.photos) || 3
    }));
  }

  // Der Befund: zwei Saetze sichtbar, die Zonen auf Antippen.
  #gjetjetZeichnen() {
    schreibe($("#lb-gjetmarke"), this.text("gjetMarke"));
    schreibe($("#lb-gjettext"), String(this.raport.gjetjet || this.daten.befund || "").trim());

    const kasten = $("#lb-zonen");
    const zonen = Array.isArray(this.raport.zonaLista) ? this.raport.zonaLista : [];
    if (!kasten) return;
    if (!zonen.length) { kasten.innerHTML = ""; return; }
    kasten.innerHTML = "";
    for (const zone of zonen) {
      const el = document.createElement("div");
      el.className = "lb-zone";
      el.innerHTML = '<span class="lb-zone__ort"></span><span class="lb-zone__text"></span>';
      schreibe(el.firstElementChild, String(zone.zona || ""));
      schreibe(el.lastElementChild, String(zone.teksti || ""));
      kasten.appendChild(el);
    }
  }

  // Fuenf Messwerte, absteigend. Beurteilt werden zehn; gezeigt die
  // staerksten, damit der Blick zuerst auf das Problem faellt und dann auf
  // das, was in Ordnung ist.
  #messZeichnen() {
    const teil = $("#lb-messteil");
    const liste = $("#lb-mess");
    if (!teil || !liste) return;
    const werte = (Array.isArray(this.raport.parametrat) ? this.raport.parametrat : [])
      .filter((p) => p && p.emri);
    if (!werte.length) { teil.classList.add("ls-verstecken"); return; }
    teil.classList.remove("ls-verstecken");
    schreibe($("#lb-messmarke"), this.text("messMarke"));

    // Drei oben - aber nicht einfach die drei schlechtesten.
    //
    // Der gute Wert traegt den Kontrast: Eine Seite, auf der alles
    // schlecht ist, glaubt niemand, und dann wird auch der schlechte Teil
    // nicht geglaubt. Er steht absteigend sortiert ganz hinten und fiele
    // bei einem blossen slice(0,3) heraus. Also: die zwei staerksten und
    // der eine, der in Ordnung ist.
    const gut = werte.find((w) => Number(w.shkalla) === 0);
    const oben = gut
      ? [...werte.filter((w) => w !== gut).slice(0, MESSWERTE_OBEN - 1), gut]
      : werte.slice(0, MESSWERTE_OBEN);
    const rest = werte.filter((w) => !oben.includes(w));

    liste.innerHTML = "";
    for (const wert of oben) liste.appendChild(this.#messZeile(wert));

    // Drei oben, der Rest in den Einzelheiten.
    //
    // Fuenf Balken untereinander sind nicht glaubwuerdiger als drei - sie
    // sind nur laenger. Was zaehlt, ist der Satz darunter: geprueft wurden
    // zehn. Er sagt dasselbe in einer Zeile und laesst dem Blick die drei,
    // die ihn wirklich betreffen.
    const restKasten = $("#lb-messtjere");
    if (restKasten) {
      restKasten.innerHTML = "";
      for (const wert of rest) restKasten.appendChild(this.#messZeile(wert));
      restKasten.classList.toggle("ls-verstecken", !rest.length);
    }
    // Wie viele uebrig sind, merkt sich die Seite fuer die Zeile des
    // Aufklappers.
    //
    // GEMESSEN, NICHT GESCHAETZT: Dort stand "10 minus die drei oben" als
    // feste Rechnung. Kamen aus der Analyse nur fuenf Werte, versprach die
    // Zeile sieben und lieferte zwei. Wer aufklappt, zaehlt nach - und die
    // Seite hat dann in seinen Augen auch beim Befund gerundet. Gezaehlt
    // wird jetzt, was wirklich darunter liegt.
    this.messUebrig = rest.length;
  }

  // Die Zeile unter "Lexoni analizën e plotë".
  //
  // Sie zaehlt auf, was wirklich im Aufklapper liegt - und nur das, was
  // auch gezeichnet wurde. Vorher stand dort allein die Zahl der uebrigen
  // Parameter, obwohl darin auch die ausfuehrliche Erklaerung, das
  // Verfahren, die Zonen und der Verlauf stehen. Eine Zeile, die weniger
  // verspricht als sie haelt, wird nicht angetippt.
  #detajetZeichnen() {
    const zeile = $("#lb-messrest");
    if (!zeile) return;
    const zonen = Array.isArray(this.raport.zonaLista) ? this.raport.zonaLista.length : 0;
    const ohne = this.raport.paKujdes || {};
    const hatOhne = [ohne.zbehet, ohne.nukZbehet, ohne.pas6Muajsh]
      .some((x) => String(x || "").trim());
    const hatShpjegim = (Array.isArray(this.raport.shpjegimi) ? this.raport.shpjegimi : [])
      .some((x) => String(x || "").trim());

    const teile = [
      hatShpjegim ? this.text("detajetShpjegim") : "",
      this.messUebrig ? this.text("messRest", { anzahl: this.messUebrig }) : "",
      zonen ? this.text("pilleZona", { anzahl: zonen }) : "",
      hatOhne ? this.text("detajetEcuria") : ""
    ].filter(Boolean);
    schreibe(zeile, teile.join(" · "));
  }

  // Eine Messzeile: Name, Wert, Grad, Balken und der Satz fuer Laien.
  #messZeile(wert) {
    const stufe = Number.isFinite(Number(wert.shkalla))
      ? Math.max(0, Math.min(4, Number(wert.shkalla))) : 0;
    const el = document.createElement("div");
    el.className = "lb-zeile";
    // Untereinander, nicht links/rechts.
    //
    // Name links, Wert rechts, Erklaerung darunter, Balken quer - das
    // zwang das Auge bei jedem Wert zweimal quer ueber den Bildschirm und
    // wieder zurueck. Auf einem Telefon liest es von oben nach unten;
    // alles andere kostet bei fuenf Werten zwanzig Blickspruenge.
    el.innerHTML = '<span class="lb-zeile__name"></span>'
      + '<span class="lb-zeile__wert"><b class="lb-zeile__zahl"></b><span class="lb-zeile__grad"></span></span>'
      + '<span class="lb-zeile__klar"></span>'
      + '<span class="lb-stab" aria-hidden="true"></span>';
    schreibe(el.querySelector(".lb-zeile__name"), String(wert.emri));
    schreibe(el.querySelector(".lb-zeile__klar"), String(wert.thjeshte || ""));
    schreibe(el.querySelector(".lb-zeile__grad"), String(wert.grada || ""));

    // Ein Wert ohne Befund traegt einen Haken statt eines Balkens.
    const zahl = el.querySelector(".lb-zeile__zahl");
    if (stufe === 0) zahl.innerHTML = `<span class="lb-haken">&#10003;</span> ${String(wert.vlera || "")}`;
    else schreibe(zahl, String(wert.vlera || ""));

    const bahn = el.querySelector(".lb-stab");
    bahn.dataset.s = String(stufe);
    for (let i = 0; i < 5; i += 1) {
      const teilchen = document.createElement("i");
      if (stufe > 0 && i <= stufe) teilchen.dataset.an = "ja";
      bahn.appendChild(teilchen);
    }
    return el;
  }

  #diagnoseZeichnen() {
    const kasten = $("#lb-diagnose");
    if (!kasten) return;
    const name = String(this.raport.diagnoza || "").trim();
    if (!name) { kasten.classList.add("ls-verstecken"); return; }
    kasten.classList.remove("ls-verstecken");
    schreibe($("#lb-diagmarke"), this.text("diagMarke"));
    schreibe($("#lb-diagname"), name);
    schreibe($("#lb-diaglat"), String(this.raport.diagnozaLat || ""));

    // Der Fachbefund darf "leicht" sagen - das ist die Wahrheit. Die Zeile
    // darunter benennt die HANDLUNG. Zwanzig verstopfte Poren sind fachlich
    // leicht und brauchen trotzdem etwas.
    const stufe = Number(this.raport.niveli);
    const wort = Number.isFinite(stufe) ? this.text(`niveli${Math.max(0, Math.min(4, stufe))}`) : "";
    const marke = $("#lb-diagstufe");
    schreibe(marke, wort);
    marke?.classList.toggle("ls-verstecken", !wort);
  }

  #erklaerungZeichnen() {
    const teil = $("#lb-erklaerteil");
    const kasten = $("#lb-erklaertext");
    if (!teil || !kasten) return;
    const saetze = (Array.isArray(this.raport.shpjegimi) ? this.raport.shpjegimi : [])
      .map((x) => String(x || "").trim()).filter(Boolean);
    if (!saetze.length) { teil.classList.add("ls-verstecken"); return; }
    teil.classList.remove("ls-verstecken");
    schreibe($("#lb-erklaermarke"), this.text("erklaerMarke"));
    kasten.innerHTML = "";
    for (const satz of saetze) {
      const el = document.createElement("p");
      el.className = "lb-satz";
      schreibe(el, satz);
      kasten.appendChild(el);
    }
  }

  // Was ohne Pflege geschieht. Prognose, keine Therapie - und der Uebergang,
  // an dem entschieden wird. Der staerkste Satz der Seite steht im mittleren
  // Feld: was nicht von selbst zurueckgeht.
  #ohneZeichnen() {
    const teil = $("#lb-ohneteil");
    const kasten = $("#lb-zeitleiste");
    if (!teil || !kasten) return;
    const ohne = this.raport.paKujdes || {};
    const felder = [
      ["geht", "ohneZbehet", ohne.zbehet],
      ["bleibt", "ohneNukZbehet", ohne.nukZbehet],
      ["spaet", "ohnePas6", ohne.pas6Muajsh]
    ].filter(([, , text]) => String(text || "").trim());
    if (!felder.length) { teil.classList.add("ls-verstecken"); return; }
    teil.classList.remove("ls-verstecken");
    schreibe($("#lb-ohnemarke2"), this.text("ohneKujdesMarke"));

    kasten.innerHTML = "";
    for (const [art, marke, text] of felder) {
      const el = document.createElement("div");
      el.className = `lb-zeitfeld lb-zeitfeld--${art}`;
      el.innerHTML = '<div class="lb-zeitfeld__marke"></div><p></p>';
      schreibe(el.firstElementChild, this.text(marke));
      schreibe(el.lastElementChild, String(text));
      kasten.appendChild(el);
    }
  }

  // Das Blatt mit den Aufnahmen.
  //
  // Es zeigt, WAS aufgenommen wurde, nicht die Bilder selbst: Die Aufnahmen
  // liegen in einer Untersammlung, die nur das Konto von Dr. Gashi lesen
  // darf, und der Link zu dieser Seite wird weitergegeben. Ein Gesicht, das
  // mit dem Link mitwandert, waere der teuerste Fehler dieses Systems.
  #fotoblatt(auf) {
    if (!auf) { this.#blatt(false); return; }
    const anzahl = Number(this.raport.fotot ?? this.daten.photos) || 0;
    const namen = [this.text("fotoBallore"), this.text("fotoDjathtas"), this.text("fotoMajtas")];
    const kacheln = namen.slice(0, Math.max(1, Math.min(3, anzahl))).map((name) => `
      <div class="lb-fotos__teil">
        ${ZEICHEN.kamera}
        <span class="lb-fotos__name">${name}</span>
      </div>`).join("");
    schreibe($("#lb-blatttitel"), this.text("fotoTitel"));
    const info = $("#lb-blattinfo");
    if (info) {
      info.innerHTML = `<span class="lb-fotos">${kacheln}</span>`;
      const satz = document.createElement("span");
      satz.className = "ls-klein";
      schreibe(satz, this.text("fotoUnter", { anzahl }));
      info.appendChild(satz);
      info.classList.remove("ls-verstecken");
    }
    $("#lb-blattwa")?.classList.add("ls-verstecken");
    schreibe($("#lb-blattzu"), this.text("blattZu"));
    this.#blatt(true);
  }

  // Die vier Wochen.
  //
  // Solange auf der Seite nur eine Flasche steht, rechnet er einen
  // Flaschenpreis. Vier Zeilen machen daraus einen Verlauf mit einem Ende.
  // Woche zwei sagt ausdruecklich, dass noch nichts zu sehen ist - wer das
  // vorher weiss, hoert in Woche zwei nicht auf.
  #planZeichnen() {
    const liste = $("#lb-plan");
    if (!liste) return;
    schreibe($("#lb-planmarke"), this.text("planMarke"));
    liste.innerHTML = "";
    // Ein eigener Plan aus der Analyse schlaegt den Standardplan - aber nur
    // ganz. Ein halber Plan waere schlechter als der ganze Standardplan.
    const eigene = (this.daten.analyse || {}).javet || [];
    const eigenerPlan = eigene.length === 4 && eigene.every(Boolean);
    for (const nummer of [1, 2, 3, 4]) {
      const el = document.createElement("li");
      el.innerHTML = '<span class="lb-plan__zahl"></span><span class="lb-plan__text"></span>';
      schreibe(el.firstElementChild, String(nummer));
      schreibe(el.lastElementChild, eigenerPlan ? eigene[nummer - 1] : this.text(`planJava${nummer}`));
      liste.appendChild(el);
    }
  }

  // Was im Preis steckt - abgeleitet, nicht aufgeschrieben.
  //
  // Hier stand eine feste Liste mit fuenf Zeilen. Zwei Fehler steckten
  // darin:
  //
  //   Die erste Zeile war "Vlerësimi personal nga Dr. Gashi" - die
  //   Analyse, die er bereits kostenlos bekommen hat. Sie als Bestandteil
  //   eines kostenpflichtigen Pakets aufzuzaehlen, verkauft ihm etwas,
  //   das er schon hat; genau das faellt dem Skeptiker auf, den die Liste
  //   ueberzeugen soll.
  //
  //   Die zweite war "Terapia e zgjedhur për gjetjet tuaja" - eine
  //   Umschreibung dessen, was daruntersteht. Jetzt stehen die Mittel
  //   selbst da, mit ihren Mengen: bei zwei Mitteln zwei Zeilen, bei
  //   dreien drei. Die Menge ist dieselbe, die auch auf der Karte steht,
  //   und beide kommen aus dem Produkt.
  #perfshiZeichnen() {
    const liste = $("#lb-perfshiliste");
    if (!liste) return;
    schreibe($("#lb-perfshimarke"), this.text("perfshiMarke"));
    liste.innerHTML = "";

    const zeilen = [];
    for (const p of this.produkte || []) {
      zeilen.push(p.inhalt ? `${p.name} · ${p.inhalt}` : p.name);
    }
    // Der Plan und die Begleitung. Sie stehen nach den Mitteln, weil sie
    // erklaeren, warum das hier kein Regalkauf ist.
    zeilen.push(this.text("perfshiPlan"));
    zeilen.push(this.text("perfshiNdjekje"));
    zeilen.push(this.text("perfshiKrahasim"));

    for (const zeile of zeilen.filter(Boolean)) {
      const el = document.createElement("li");
      el.innerHTML = `<span class="lb-perfshi__haken" aria-hidden="true">${ZEICHEN.haken}</span><span></span>`;
      schreibe(el.lastElementChild, zeile);
      liste.appendChild(el);
    }
  }

  // Der Kontaktweg.
  //
  // Ein vorhandener, echter Weg (LIFESKIN_WHATSAPP) - keine erfundene
  // Nummer. Steht dort nichts, faellt der Link ersatzlos weg; eine
  // Betreuung, die auf einen toten Link zeigt, ist schlechter als keine.
  // Er ist ein ruhiger Nebenlink und kein zweiter Kaufknopf.
  // Wer geradesteht.
  //
  // Gezeichnet wird nur, was wirklich hinterlegt ist. Ist nichts
  // hinterlegt, bleibt der ganze Block weg - eine halb ausgefuellte
  // Anbieterzeile ist schlechter als keine, weil sie aussieht, als haette
  // jemand etwas zu verbergen. Erfunden wird nichts: Weder Firmenname
  // noch Anschrift stehen in dieser Datei, sie kommen aus der
  // Konfiguration oder gar nicht.
  #anbieterZeichnen() {
    const block = $("#lb-anbieter");
    if (!block) return;

    const felder = [
      ["#lb-anbietername", LIFESKIN_ANBIETER?.name],
      ["#lb-anbieteranschrift", LIFESKIN_ANBIETER?.anschrift],
      ["#lb-anbieteremail", LIFESKIN_ANBIETER?.email]
    ];

    let gezeigt = 0;
    for (const [auswahl, wert] of felder) {
      const el = $(auswahl);
      if (!el) continue;
      const text = String(wert || "").trim();
      if (!text) { el.classList.add("ls-verstecken"); continue; }
      schreibe(el, text);
      el.classList.remove("ls-verstecken");
      gezeigt += 1;
    }

    if (!gezeigt) { block.classList.add("ls-verstecken"); return; }
    schreibe($("#lb-anbietermarke"), this.text("anbieterMarke"));
    block.classList.remove("ls-verstecken");
  }

  #kontaktZeichnen() {
    const stellen = [$("#lb-betreuungkontakt"), $("#lb-pyetjekontakt")];
    if (!LIFESKIN_WHATSAPP) {
      for (const el of stellen) el?.classList.add("ls-verstecken");
      return;
    }
    const vorlage = t(LIFESKIN_WHATSAPP_TEXT, this.sprache) || "";
    const text = vorlage.split("{code}").join(this.daten.code || "");
    for (const el of stellen) {
      if (!el) continue;
      el.href = `https://wa.me/${LIFESKIN_WHATSAPP}?text=${encodeURIComponent(text)}`;
      schreibe(el, this.text("kontaktLink"));
      el.classList.remove("ls-verstecken");
    }
  }

  // Die Therapie - EIN Abschnitt, eine Karte je Mittel.
  //
  // Sie stand zweimal da: erst "Pse pikerisht kjo terapi" mit Begruendung
  // und Haken, direkt darunter "Terapia juaj" mit Foto, Wirkstoffen und
  // Anwendung derselben Mittel. Zweimal dasselbe liest sich als
  // Verkaufsschleife - und die zweite Ueberschrift nimmt der ersten die
  // Kraft, weil der Leser merkt, dass er nichts Neues bekommt.
  //
  // Die Reihenfolge in der Karte ist die Reihenfolge, in der ein Zweifel
  // entsteht und ausgeraeumt wird:
  //
  //   das Bild      - was er bekommt. Etwas Anfassbares, bevor irgendetwas
  //                   behauptet wird.
  //   der Name      - ein Mittel mit Namen, keine "Creme".
  //   SEIN Satz     - warum ausgerechnet das, bei SEINEM Befund. Der Kern.
  //   drei Haken    - wie es wirkt. Drei lesen sich als Auswahl, ab vier
  //                   wie eine Merkmalsliste vom Etikett.
  //   die Pille     - Wirkstoffe und Anwendung auf Antippen.
  //
  // Die Pille ist dieselbe Geste wie "3 foto +" ganz oben: Wer die einmal
  // benutzt hat, weiss hier sofort, dass da mehr ist - und wer es nicht
  // wissen will, wird nicht damit aufgehalten. Beides zaehlt: Der Skeptiker
  // braucht die Inhaltsstoffe, der Ungeduldige braucht sie nicht.
  #produkteZeichnen() {
    const kasten = $("#lb-produkte");
    if (!kasten) return;

    // Die Ueberleitung nennt SEINE Befunde - zuerst die Nominalphrasen aus
    // der Analyse, weil sie sich wie ein Arzt lesen. Erst wenn die fehlen,
    // der kleingeschriebene Parametername, der nach Datenbank klingt.
    const klein = (x) => String(x || "").toLocaleLowerCase(this.sprache === "de" ? "de" : "sq");
    const stark = (this.raport.parametrat || [])
      .filter((w) => w && w.emri && Number(w.shkalla) > 0);
    const namen = [
      String(this.raport.gjetjaKryesore || "").trim() || klein(stark[0]?.emri || ""),
      String(this.raport.gjetjaDyta || "").trim() || klein(stark[1]?.emri || "")
    ].filter(Boolean);

    const satz = $("#lb-psesatz");
    if (namen.length > 1) schreibe(satz, this.text("pseZwei", { a: namen[0], b: namen[1] }));
    else if (namen.length) schreibe(satz, this.text("pseEins", { a: namen[0] }));
    else schreibe(satz, this.text("pseOhne"));

    kasten.innerHTML = "";
    // Die Nummer ist die Stelle im Ablauf, nicht die Zeile in einer Liste.
    let nummer = 0;
    for (const p of this.produkte || []) {
      nummer += 1;
      // Der Aufbau, in der Reihenfolge, in der ein Zweifel entsteht:
      //
      //   Bild links, Name buendig mit seiner Oberkante, Nummer oben
      //   rechts   - das Mittel bekommt eine Stelle im Ablauf, nicht einen
      //              Platz im Regal. Eine Zahl macht aus zwei Produkten
      //              zwei Schritte, und Schritte werden befolgt, nicht
      //              abgewogen.
      //   drei Chips - Menge, Zeitpunkt, Art. Alles echte Angaben aus dem
      //              Produkt, und sie beantworten die erste Frage nach
      //              "was ist das": naemlich "wann nehme ich es".
      //   SEIN Satz  - warum ausgerechnet das, bei SEINEM Befund.
      //   drei Pfeile - was es tut. Pfeil statt Haken: Der Haken sagt "ist
      //              enthalten" und gehoert zu einer Leistungsliste.
      //   eine Linie, dann die Einzelheiten - kein gefuellter Knopf, der
      //              mit dem Kaufknopf um Aufmerksamkeit streitet.
      const el = document.createElement("article");
      el.className = "lb-produkt";
      el.innerHTML = '<div class="lb-produkt__top">'
        + '<div class="lb-produkt__bild"></div>'
        + '<div class="lb-produkt__t">'
        + '<div class="lb-produkt__zeile"><span class="lb-produkt__name"></span>'
        + '<span class="lb-produkt__nr" aria-hidden="true"></span></div>'
        + '<div class="lb-produkt__meta"></div></div></div>'
        + '<p class="lb-produkt__satz"></p>'
        + '<ul class="lb-tut"></ul>';

      const bild = el.querySelector(".lb-produkt__bild");
      if (p.foto) {
        const img = document.createElement("img");
        img.src = p.foto; img.alt = p.name; img.loading = "lazy";
        bild.appendChild(img);
      } else {
        // Ohne Foto kein leerer Rahmen: das Zeichen der Produktart sieht
        // nach Pflege aus, statt nach fehlendem Bild.
        bild.innerHTML = ikoneFuer(p.lloji);
        bild.classList.add("lb-produkt__bild--leer");
      }

      schreibe(el.querySelector(".lb-produkt__name"), p.name);
      schreibe(el.querySelector(".lb-produkt__nr"), String(nummer));

      // Die Chips. Was leer ist, faellt weg - eine kuerzere Reihe ist immer
      // besser als eine mit einem leeren Kaestchen darin.
      const meta = el.querySelector(".lb-produkt__meta");
      const zeitpunkt = this.#zeitpunkt(p.perdorimi?.koha);
      for (const [zeichen, text] of [
        ["vellim", p.inhalt],
        [zeitpunkt.zeichen, zeitpunkt.text],
        [p.lloji && ZEICHEN[p.lloji] ? p.lloji : "", p.lloji]
      ]) {
        if (!text) continue;
        const chip = document.createElement("span");
        chip.className = "lb-produkt__chip";
        chip.innerHTML = (zeichen && ZEICHEN[zeichen] ? ZEICHEN[zeichen] : ikoneFuer(p.lloji)) + "<span></span>";
        schreibe(chip.lastElementChild, text);
        meta.appendChild(chip);
      }
      meta.classList.toggle("ls-verstecken", !meta.children.length);

      schreibe(el.querySelector(".lb-produkt__satz"), p.satz);

      const haken = el.querySelector(".lb-tut");
      for (const zeile of (p.veprimi || []).slice(0, 3)) {
        const li = document.createElement("li");
        li.innerHTML = `<span class="lb-tut__zeichen" aria-hidden="true">${ZEICHEN.shigjeta}</span><span></span>`;
        schreibe(li.lastElementChild, zeile);
        haken.appendChild(li);
      }
      haken.classList.toggle("ls-verstecken", !(p.veprimi || []).length);

      // Die Pille. Nur, wenn dahinter wirklich etwas liegt - ein Knopf,
      // der ein leeres Blatt oeffnet, kostet mehr Vertrauen als er bringt.
      const tiefe = (p.perberesit || []).length || p.perdorimi?.si || p.synimi;
      if (tiefe) {
        const knopf = document.createElement("button");
        knopf.type = "button";
        knopf.className = "lb-produkt__mehr";
        knopf.setAttribute("aria-haspopup", "dialog");
        knopf.innerHTML = `${ZEICHEN.tropfen}<span></span>`
          + '<span class="lb-produkt__plus" aria-hidden="true">+</span>';
        schreibe(knopf.children[1], (p.perberesit || []).length
          ? this.text("mehrMitStoffen", { anzahl: p.perberesit.length })
          : this.text("mehrOhneStoffe"));
        knopf.addEventListener("click", () => this.#therapiBlatt(p.id));
        // An die KARTE, nicht in die Titelspalte: Die Fusszeile hat eine
        // Linie ueber die volle Breite und steht unter allem.
        //
        // GEMESSEN, NICHT GESCHAETZT: Hier stand ".lb-produkt__leib" - ein
        // Element, das es in dieser Karte nicht mehr gibt. querySelector
        // gab null, appendChild warf, und der Fehler flog aus dem Zeichnen
        // heraus bis in starte(). Der Patient sah dauerhaft "Po hapet
        // analiza juaj...". Sichtbar wurde es nur mit einem Produkt, das
        // Wirkstoffe, Anwendung oder Ziel traegt - die Testdaten hatten
        // nichts davon, also war alles gruen.
        el.appendChild(knopf);
      }

      kasten.appendChild(el);
    }
  }

  // Wann er es benutzt - als Zeichen und als kurzes Wort.
  //
  // Am Produkt steht ein ganzer Satz ("vetem ne mbremje", "mengjes dhe
  // mbremje"). In einen Chip passt er nicht, und er muss es auch nicht: Ein
  // Mond sagt "abends" schneller als drei Woerter, und der ganze Satz steht
  // im Blatt. Erkannt wird an den zwei Woertern, die es dafuer gibt -
  // steht keines da, bleibt es bei der Uhr.
  #zeitpunkt(koha) {
    const text = String(koha || "").toLowerCase();
    if (!text) return { zeichen: "", text: "" };
    const morgens = text.includes("mëngjes") || text.includes("mengjes") || text.includes("morgen");
    const abends = text.includes("mbrëmje") || text.includes("mbremje") || text.includes("abend");
    if (morgens && abends) return { zeichen: "ora", text: this.text("kohaDyfish") };
    if (abends) return { zeichen: "hene", text: this.text("kohaMbremje") };
    if (morgens) return { zeichen: "diell", text: this.text("kohaMengjes") };
    return { zeichen: "ora", text: koha };
  }

  // Die Einzelheiten eines Mittels - in demselben Blatt wie die Aufnahmen.
  //
  // Nicht im Fluss der Seite: Wirkstoffe, Anwendung und Ziel unter jeder
  // Karte ausgeklappt machen aus zwei Mitteln eine Tapete, durch die auch
  // der scrollt, der nur wissen will, was er bekommt. Im Blatt liest sie,
  // wer sie sucht - und das ist der Skeptiker, den wir gewinnen muessen.
  #therapiBlatt(id) {
    const p = (this.produkte || []).find((x) => x.id === id);
    if (!p) return;

    const info = $("#lb-blattinfo");
    if (!info) return;
    info.innerHTML = "";

    const marke = (text) => {
      const el = document.createElement("span");
      el.className = "lb-blatt__marke";
      schreibe(el, text);
      info.appendChild(el);
    };

    schreibe($("#lb-blatttitel"), p.nenName ? `${p.name} — ${p.nenName}` : p.name);

    if ((p.perberesit || []).length) {
      marke(this.text("perberesMarke"));
      const liste = document.createElement("ul");
      liste.className = "lb-perberes";
      for (const w of p.perberesit) {
        const li = document.createElement("li");
        li.className = "lb-perberes__chip";
        li.innerHTML = '<b></b><span></span>';
        schreibe(li.firstElementChild, w.sasia ? `${w.emri} ${w.sasia}` : w.emri);
        schreibe(li.lastElementChild, w.roli);
        liste.appendChild(li);
      }
      info.appendChild(liste);
    }

    const u = p.perdorimi;
    if (u && (u.si || u.koha)) {
      marke(this.text("perdorimMarke"));
      const kopf = [u.koha, u.hapi ? this.text("perdorimHapi", { hapi: u.hapi }) : "", u.sasia]
        .filter(Boolean).join(" · ");
      if (kopf) {
        const el = document.createElement("p");
        el.className = "lb-blatt__kopfzeile";
        schreibe(el, kopf);
        info.appendChild(el);
      }
      if (u.si) {
        const el = document.createElement("p");
        schreibe(el, u.si);
        info.appendChild(el);
      }
      // Der Hinweis, den man vor dem Kauf lesen will und nach dem Kauf
      // gebraucht haette. Er steht deshalb hier und nicht im Beipackzettel.
      if (u.kujdes) {
        const el = document.createElement("p");
        el.className = "lb-blatt__kujdes";
        el.innerHTML = `${ZEICHEN.schild}<span></span>`;
        schreibe(el.lastElementChild, u.kujdes);
        info.appendChild(el);
      }
    }

    // Das Ziel bis Tag 28. Es nennt auch eine Grenze - und genau deshalb
    // wird es geglaubt.
    if (p.synimi) {
      marke(this.text("synimiMarke"));
      const el = document.createElement("p");
      schreibe(el, p.synimi);
      info.appendChild(el);
    }

    info.classList.remove("ls-verstecken");
    $("#lb-blattwa")?.classList.add("ls-verstecken");
    schreibe($("#lb-blattzu"), this.text("blattZu"));
    this.#blatt(true);
  }

  // Die Bedingungen, wie sie wirklich konfiguriert sind.
  //
  // Frist, Lieferzeit und Versandkosten stehen in STANDARD_KONFIG und
  // werden von hier aus in jeden Satz eingesetzt - in die Garantie, in die
  // Lieferzeile und in die haeufigen Fragen. Vorher standen "30 ditë" und
  // "2-3 ditë" an sechs Stellen im Text; nach der ersten Aenderung an der
  // Konfiguration haetten zwei verschiedene Fristen auf derselben Seite
  // gestanden, und die eine widerlegt die andere.
  get bedingungen() {
    const konf = STANDARD_KONFIG;
    const zeit = Array.isArray(konf.lieferzeitTage) ? konf.lieferzeitTage : [];
    return {
      tage: Number(konf.rueckgabeTage) || 0,
      von: Number(zeit[0]) || 0,
      bis: Number(zeit[1]) || Number(zeit[0]) || 0,
      versandFrei: Number(konf.versandKosten) === 0,
      nachnahme: (konf.zahlarten || []).includes("nachnahme")
    };
  }

  // Die Garantie. Sie nimmt dem Zoegernden das einzige echte Risiko ab -
  // und steht deshalb gross, nicht in elf Pixeln unter dem Knopf.
  //
  // Die Bedingungen werden NICHT erweitert: dieselbe Frist wie in der
  // Konfiguration, dieselbe Nachnahme. Neu ist nur, dass danebensteht,
  // wohin die eine Nachricht geht.
  #garantieZeichnen() {
    const { tage } = this.bedingungen;
    schreibe($("#lb-garancimarke"), this.text("garanciMarke"));
    schreibe($("#lb-garancititel"), this.text("garanciTitel", { tage }));
    schreibe($("#lb-garancitext"), this.text("garanciText", { tage }));
    // Im Angebotsblock steht dieselbe Zusage EINMAL kurz.
    schreibe($("#lb-ofertagaranci"), this.text("sicherGarantie", { tage }));

    const vlen = $("#lb-vlen");
    const datum = this.#zeitLesbar(this.daten.freigabeAt || this.daten.createdAt).split(",")[0];
    if (!vlen) return;
    schreibe(vlen, datum ? this.text("raportVlen", { data: datum }) : "");
    vlen.classList.toggle("ls-verstecken", !datum);
  }

  // Sechs Fragen, die vor dem Kauf wirklich gestellt werden. Wer eine
  // Frage hat und keine Antwort findet, kauft nicht - er schiebt es auf.
  #fragenZeichnen() {
    const kasten = $("#lb-pyetjet");
    if (!kasten) return;
    schreibe($("#lb-pyetjemarke"), this.text("pyetjeMarke"));
    const fragen = t(TEXTE.pyetjet, this.sprache) || [];
    // Frist und Lieferzeit kommen auch hier aus der Konfiguration.
    const werte = this.bedingungen;
    kasten.innerHTML = "";
    for (const [frage, antwort] of fragen) {
      const el = document.createElement("details");
      el.className = "lb-pyetje__frage";
      el.innerHTML = "<summary></summary><p></p>";
      schreibe(el.firstElementChild, fuelle(frage, werte));
      schreibe(el.lastElementChild, fuelle(antwort, werte));
      kasten.appendChild(el);
    }
  }

  // Der Preis steht nie allein.
  //
  // Erst die Einzelpreise, dann der Setpreis, dann der Tagesbetrag. Die
  // Reihenfolge ist die Rechnung: Wer 68 gesehen hat, liest 53 als Ersparnis
  // und nicht als Ausgabe - und 1,89 am Tag hat gar keinen Vergleichspreis
  // mehr im Regal.
  get preis() { return Number(this.daten.preis) || STANDARD_KONFIG.setPreis; }

  #preisZeichnen() {
    const einzeln = (this.produkte || []).reduce((s, p) => s + (Number(p.einzelpreis) || 0), 0);
    const gespart = Math.max(0, Math.round((einzeln - this.preis) * 100) / 100);
    schreibe($("#lb-preismarke"), this.text("preisMarke"));
    // Der Anker mit seinem Wort davor. Ein durchgestrichener Betrag ohne
    // Beschriftung liest sich als frueherer Preis; das waere er nur, wenn
    // die Therapie einmal so viel gekostet haette. Sie hat nicht - es ist
    // die Summe der Einzelpreise, und genau das steht jetzt daneben.
    const anker = $("#lb-preisanker");
    const ankerteil = $("#lb-preisankerteil");
    if (einzeln > this.preis) {
      schreibe($("#lb-preisankermarke"), this.text("preisEinzeln"));
      schreibe(anker, `${euro(einzeln)}`);
      ankerteil?.classList.remove("ls-verstecken");
    } else if (ankerteil) {
      if (anker) anker.textContent = "";
      ankerteil.classList.add("ls-verstecken");
    }
    schreibe($("#lb-preisjetzt"), euro(this.preis));
    const spar = $("#lb-preisspar");
    if (gespart > 0) schreibe(spar, this.text("preisGespart", { betrag: zahl(gespart) }));
    else if (spar) spar.classList.add("ls-verstecken");
    schreibe($("#lb-preistag"), this.text("preisTag", {
      tagespreis: zahl(tagespreis({ ...STANDARD_KONFIG, setPreis: this.preis }))
    }));
  }

  // Die Zusagen gegen die Fragen vor dem Kauf: Muss ich vorher zahlen?
  // Wann kommt es? Was, wenn es nicht wirkt?
  //
  // Im Angebotsblock stehen nur die ersten beiden - Lieferung und
  // Zahlungsweise. Die Garantie kommt dort als eigene kurze Zeile unter
  // dem Knopf; dreimal dieselbe Zusage in einem Block liest sich als
  // Verkaufstrichter. Im Bestellschirm stehen weiter alle drei: Dort
  // kommt der Zweifel beim Tippen der Anschrift zurueck.
  //
  // Jede Zeile wird aus der Konfiguration abgeleitet. Ist der Versand
  // nicht frei oder gibt es keine Nachnahme, faellt die Zeile weg statt
  // etwas zu behaupten.
  #sicherListe(liste, { mitGarantie = true } = {}) {
    if (!liste) return;
    liste.innerHTML = "";
    const b = this.bedingungen;
    const zeilen = [
      b.nachnahme ? ["hand", this.text("sicherNachnahme")] : null,
      mitGarantie && b.tage ? ["schild", this.text("sicherGarantie", { tage: b.tage })] : null,
      b.von && b.versandFrei ? ["paket", this.text("sicherLieferung", { von: b.von, bis: b.bis })] : null
    ].filter(Boolean);
    for (const [zeichen, text] of zeilen) {
      const el = document.createElement("li");
      el.innerHTML = `<span class="lb-sicher__zeichen" aria-hidden="true">${ZEICHEN[zeichen]}</span><span></span>`;
      schreibe(el.lastElementChild, text);
      liste.appendChild(el);
    }
  }

  #sicherZeichnen() {
    this.#sicherListe($("#lb-sicher"), { mitGarantie: false });

    // Der Knopf IM Angebotsblock. Dieselbe Beschriftung, derselbe Betrag
    // und dieselbe Handlung wie der in der Leiste - zwei verschiedene
    // Beschriftungen fuer dieselbe Sache lesen sich als zwei Angebote.
    schreibe($("#lb-ofertakauf"), this.text("knopfStart", { preis: zahl(this.preis) }));
    schreibe($("#lb-ofertaunter"), this.#dorezimText());

    this.#knopfStufe("aus");
    // Nach der Bestellung gibt es nichts mehr zu kaufen.
    const kaufbar = this.daten.status === "fertig";
    $("#lb-leiste")?.classList.toggle("ls-verstecken", !kaufbar);
    $("#lb-oferta")?.classList.toggle("lb-oferta--zu", !kaufbar);
    $("#lb-ofertakauf")?.classList.toggle("ls-verstecken", !kaufbar);
    $("#lb-ofertaunter")?.classList.toggle("ls-verstecken", !kaufbar);
  }

  // Die Zeile unter beiden Knoepfen.
  //
  // Sie steht nur da, wenn sie den hinterlegten Lieferbedingungen
  // entspricht: Nachnahme als Zahlart und Versandkosten null. Steht in
  // der Konfiguration etwas anderes, bleibt die Zeile leer - eine Zusage
  // auf Verdacht ist an dieser Stelle das Teuerste, was die Seite tun
  // kann.
  #dorezimText() {
    const b = this.bedingungen;
    return b.nachnahme && b.versandFrei ? this.text("dorezimSatz") : "";
  }

  // Die Leiste in zwei Stufen.
  //
  // Im ersten Bildschirm - dem Befund - gibt es sie nicht. Wer beim
  // ersten Satz "53 €" liest, liest ab da nicht mehr "was ist mit meiner
  // Haut", sondern "wo wollen die mir die 53 € begruenden".
  //
  // Beschriftung und Betrag sind dieselben wie im Angebotsblock; beides
  // kommt aus demselben Preis des Falls.
  #knopfStufe(stufe) {
    const knopf = $("#lb-kaufen");
    const leiste = $("#lb-leiste");
    if (!knopf || this.knopfStand === stufe) return;
    this.knopfStand = stufe;
    leiste?.setAttribute("data-stufe", stufe);
    if (stufe === "kauf") {
      schreibe(knopf, this.text("knopfStart", { preis: zahl(this.preis) }));
      schreibe($("#lb-kaufunter"), this.#dorezimText());
    }
  }

  // Die Leiste haengt am Angebotsblock, nicht an einer Lesedauer.
  //
  // Sie kommt, sobald der Angebotsblock ins Bild kommt, und bleibt beim
  // weiteren Herunterscrollen da; darueber ist sie ausgeblendet. Es gibt
  // keine Pflichtlesedauer und keinen Zeitschalter - die Stelle im
  // Dokument entscheidet, nicht die Uhr.
  //
  // GEMESSEN, NICHT GESCHAETZT: Mit einem IntersectionObserver ging das
  // schief. Der meldet nur WECHSEL des Zustands - springt die Seite in
  // einem Satz von oberhalb des Angebots nach unterhalb, bleibt "nicht
  // sichtbar" stehen, es gibt keinen Wechsel, und der Knopf kam nie. Beim
  // langsamen Scrollen faellt das nie auf, bei einem Sprung immer. Also
  // gerechnet statt beobachtet: bei jedem Scrollen einmal nachsehen, wo
  // der Block steht.
  #knopfBeobachten(rolle) {
    const pruefen = () => {
      const ziel = $("#lb-oferta");
      if (!ziel) { this.#knopfStufe("kauf"); return; }
      const oben = ziel.getBoundingClientRect().top;
      this.#knopfStufe(oben < window.innerHeight ? "kauf" : "aus");
    };
    rolle.addEventListener("scroll", pruefen, { passive: true });
    this.knopfPruefen = pruefen;
    pruefen();
  }

  // ---------- Versandstand ----------
  //
  // Er steht ganz oben, sobald bestellt wurde - dort sitzt die erste Frage
  // nach dem Kauf. Bei Nachnahme ist das keine Freundlichkeit: Wer bis zur
  // Lieferung im Ungewissen bleibt, verweigert das Paket an der Tuer.
  #versandZeichnen() {
    const kasten = $("#lb-versand");
    if (!kasten) return;
    const stand = this.daten.status;
    const an = ["bestellt", "versandt", "zugestellt"].includes(stand);
    kasten.classList.toggle("ls-verstecken", !an);
    if (!an) return;

    schreibe($("#lb-versandmarke"), this.text("versandMarke"));
    schreibe($("#lb-versandzeit"), this.daten.lieferVon && this.daten.lieferBis
      ? this.text("versandErwartet", { von: this.daten.lieferVon, bis: this.daten.lieferBis })
      : "");
    schreibe($("#lb-versandzahlung"), this.text("versandZahlung", { preis: zahl(this.preis) }));

    const stufen = [
      { id: "bestellt", text: this.text("versandBestellt"), zeichen: "haken" },
      { id: "vorbereitet", text: this.text("versandVorbereitet"), zeichen: "karton" },
      { id: "versandt", text: this.text("versandUnterwegs"), zeichen: "paket" },
      { id: "zugestellt", text: this.text("versandZugestellt"), zeichen: "haus" }
    ];
    const erreicht = { bestellt: 1, versandt: 3, zugestellt: 4 }[stand] || 1;

    const spur = $("#lb-spur");
    spur.innerHTML = "";
    for (const [i, stufe] of stufen.entries()) {
      const el = document.createElement("li");
      el.dataset.stand = i + 1 < erreicht ? "fertig" : i + 1 === erreicht ? "laeuft" : "offen";
      el.innerHTML = `<span class="lb-spur__zeichen" aria-hidden="true">${ZEICHEN[stufe.zeichen]}</span><span class="lb-spur__text"></span>`;
      schreibe(el.querySelector(".lb-spur__text"), stufe.text);
      spur.appendChild(el);
    }
  }

  #whatsappSetzen() {
    const link = $("#lb-walink");
    if (!link) return;
    if (!LIFESKIN_WHATSAPP) { link.classList.add("ls-verstecken"); return; }
    const vorlage = t(LIFESKIN_WHATSAPP_TEXT, this.sprache) || "";
    const text = vorlage.split("{code}").join(this.daten.code || "");
    link.href = `https://wa.me/${LIFESKIN_WHATSAPP}?text=${encodeURIComponent(text)}`;
    schreibe(link, this.text("waKnopf"));
  }

  #ereignisse() {
    // Der Griff zum Knopf ist das Ereignis, auf das die Anzeigen lernen.
    //
    // Nicht der Kauf: Bei den geplanten Ausgaben liegen die Bestellungen
    // unter den ungefaehr fuenfzig Ereignissen je Woche, die eine
    // Anzeigengruppe braucht, um aus der Lernphase zu kommen. Die Griffe
    // liegen darueber.
    $("#lb-walink")?.addEventListener("click", () => {
      this.waGetippt = true;
      this.#merken({ waClick: true });
      this.pixel.meldeLead();
    });
    $("#lb-warueckja")?.addEventListener("click", () => {
      $("#lb-warueck")?.classList.add("ls-verstecken");
      this.#merken({ waSent: true });
      const link = $("#lb-walink");
      if (link) { link.classList.add("ls-erledigt"); schreibe(link, "✓ " + this.text("waDanke")); }
    });
    $("#lb-kopieren")?.addEventListener("click", () => this.#kopieren());
    // Beide Knoepfe - der im Angebotsblock und der in der Leiste - tun
    // dasselbe und zaehlen dieselbe Marke.
    for (const wahl of ["#lb-kaufen", "#lb-ofertakauf"]) {
      $(wahl)?.addEventListener("click", () => {
        this.#markiere("kasseGeoeffnet");
        this.#bestellblatt(true);
      });
    }
    for (const knoten of document.querySelectorAll("[data-bestell-zu]")) {
      knoten.addEventListener("click", () => this.#bestellblatt(false));
    }
    $("#lb-bzurueck")?.addEventListener("click", () => this.#bestellblatt(false));
    $("#lb-bestellform")?.addEventListener("submit", (ereignis) => {
      ereignis.preventDefault();
      this.#bestellen();
    });
    // Der Aufklapper fuer die Zonen. Zwei Saetze bleiben sichtbar, die
    // Einzelheiten kommen auf Wunsch - so stellt die Gruendlichkeit die
    // Seite nicht zu.

    $("#lb-faqknopf")?.addEventListener("click", () => {
      $("#lb-blattinfo")?.classList.add("ls-verstecken");
      $("#lb-blattwa")?.classList.remove("ls-verstecken");
      this.#blatt(true);
    });
    for (const knoten of document.querySelectorAll("[data-blatt-zu]")) {
      knoten.addEventListener("click", () => this.#blatt(false));
    }
    // Die Escape-Taste schliesst es auch. Auf dem Handy tut das niemand,
    // auf dem Schreibtisch erwartet es jeder.
    document.addEventListener("keydown", (ereignis) => {
      if (ereignis.key === "Escape") this.#blatt(false);
    });
    document.addEventListener("visibilitychange", () => {
      if (!this.waGetippt || this.waGefragt) return;
      if (document.visibilityState !== "visible") return;
      this.waGefragt = true;
      $("#lb-warueck")?.classList.remove("ls-verstecken");
    });
  }

  // ---------- Die Bestellung ----------

  // Ein eigener Bildschirm, kein Blatt ueber der Seite.
  //
  // Vier Felder und die Tastatur des Telefons passen nicht in ein Blatt am
  // unteren Rand: Die Tastatur schiebt es hoch, der Knopf rutscht aus dem
  // Bild, und der Kunde tippt seine Adresse, ohne noch zu sehen, was er
  // kauft. Deshalb hier eine ganze Seite - oben der Korb mit dem, was er
  // bekommt, darunter die Felder, unten fest der Knopf.
  #bestellblatt(auf) {
    const schirm = $("#lb-bestellen");
    if (!schirm) return;
    if (auf) {
      this.#korbZeichnen();
      schreibe($("#lb-bschritt"), this.text("bestellSchritt"));
      schreibe($("#lb-besttitel"), this.text("bestellTitel"));
      // Beschriftung im Feld statt darueber: vier Zeilen weniger. Als
      // aria-label bleibt sie fuer Vorleseprogramme erhalten.
      const felder = [
        ["#lb-bname", "bestellName"],
        ["#lb-btelefon", "bestellTelefon"],
        ["#lb-badresse", "bestellAdresse"],
        ["#lb-bort", "bestellOrt"]
      ];
      for (const [wahl, schluessel] of felder) {
        const feld = $(wahl);
        if (!feld) continue;
        const wort = this.text(schluessel);
        feld.placeholder = wort;
        feld.setAttribute("aria-label", wort);
      }
      schreibe($("#lb-bsenden"), this.text("bestellSenden", { preis: zahl(this.preis) }));
      schreibe($("#lb-bunter"), this.text("bestellUnter"));
      // Die drei Zusagen stehen auch hier am Knopf. Der Zweifel kommt beim
      // Tippen der Adresse zurueck, nicht davor.
      this.#sicherListe($("#lb-bsicher"));
      $("#lb-bfehler")?.classList.add("ls-verstecken");
      // Die Landesvorwahl, wenn die Kampagne nur ein Land bedient. Leer
      // heisst nichts vorgeben - ein falsches "+383" vor einer
      // albanischen Nummer ist schlimmer als gar keines.
      const tel = $("#lb-btelefon");
      if (tel && !tel.value && LIFESKIN_TELEFON_VORWAHL) tel.value = LIFESKIN_TELEFON_VORWAHL;
      // Den Namen kennen wir schon. Ein Feld, das der Kunde nicht noch
      // einmal tippen muss, ist ein Feld weniger zum Abbrechen.
      const namensfeld = $("#lb-bname");
      if (namensfeld && !namensfeld.value) namensfeld.value = this.daten.name || "";
    }
    zeige(auf ? "bestellen" : "fertig");
    // Kein automatischer Fokus: Die Tastatur wuerde sofort aufspringen und
    // genau den Korb verdecken, wegen dem diese Seite existiert.
  }

  // Der Korb ganz oben. Er beantwortet die Frage, die beim Adresse-Tippen
  // aufkommt: "Was zahle ich hier eigentlich gerade?"
  #korbZeichnen() {
    const kasten = $("#lb-bkorb");
    if (!kasten) return;
    kasten.innerHTML = "";
    for (const p of this.produkte || []) {
      const el = document.createElement("div");
      el.className = "lb-korb__teil";
      el.innerHTML = '<span class="lb-korb__bild" aria-hidden="true"></span>'
        + '<span class="lb-korb__leib"><span class="lb-korb__name"></span>'
        + '<span class="lb-korb__inhalt"></span></span>';
      const bild = el.querySelector(".lb-korb__bild");
      if (p.foto) {
        const img = document.createElement("img");
        img.src = p.foto; img.alt = ""; img.loading = "lazy";
        bild.appendChild(img);
      } else {
        bild.innerHTML = ZEICHEN.karton;
      }
      schreibe(el.querySelector(".lb-korb__name"), p.name);
      schreibe(el.querySelector(".lb-korb__inhalt"), p.inhalt || "");
      kasten.appendChild(el);
    }
    const summe = document.createElement("div");
    summe.className = "lb-korb__summe";
    summe.innerHTML = '<span></span><strong></strong>';
    schreibe(summe.firstElementChild, this.text("korbSumme"));
    schreibe(summe.lastElementChild, euro(this.preis));
    kasten.appendChild(summe);
    const zahlung = document.createElement("p");
    zahlung.className = "lb-korb__zahlung";
    schreibe(zahlung, this.text("korbZahlung"));
    kasten.appendChild(zahlung);
  }

  async #bestellen() {
    const werte = {
      name: $("#lb-bname")?.value.trim() || "",
      telefon: $("#lb-btelefon")?.value.trim() || "",
      strasse: $("#lb-badresse")?.value.trim() || "",
      ort: $("#lb-bort")?.value.trim() || ""
    };
    const fehler = $("#lb-bfehler");
    if (!werte.name || !werte.telefon || !werte.strasse || !werte.ort) {
      schreibe(fehler, this.text("bestellPflicht"));
      fehler?.classList.remove("ls-verstecken");
      return;
    }
    fehler?.classList.add("ls-verstecken");
    const knopf = $("#lb-bsenden");
    if (knopf) { knopf.disabled = true; schreibe(knopf, this.text("bestellLaeuft")); }

    const jetzt = new Date().toISOString();
    // ZUERST die Anschrift in die Sitzung - sie darf niemand ausser dem
    // CEO-Konto lesen. Der Bericht ist oeffentlich; eine Adresse darin waere
    // in dem Moment offen, in dem jemand seinen Link weitergibt.
    const gespeichert = await this.#merken({
      address: werte,
      phone: werte.telefon,
      order: { total: this.preis, payment: "nachnahme", status: "neu", orderId: this.daten.code || this.kennung },
      step: "ordered"
    });

    // Und dann der Zustand im Bericht - das ist der Teil, den er selbst
    // sieht, und der einzige, den er selbst aendern darf.
    const maske = ["status", "bestelltAt"].map((f) => `updateMask.fieldPaths=${f}`).join("&");
    let ok = false;
    try {
      const antwort = await this.fetchFn(
        `${LIFESKIN_FIRESTORE_BASE}/lifeskin/${LIFESKIN_TENANT}/reports/${this.kennung}?${maske}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fields: felder({ status: "bestellt", bestelltAt: jetzt }) })
        }
      );
      ok = antwort.ok;
    } catch { ok = false; }

    if (!ok && gespeichert === undefined) {
      schreibe(fehler, this.text("bestellFehler"));
      fehler?.classList.remove("ls-verstecken");
      if (knopf) { knopf.disabled = false; schreibe(knopf, this.text("bestellSenden", { preis: zahl(this.preis) })); }
      return;
    }

    this.pixel.melde("ordered", { order: { total: this.preis, orderId: this.daten.code } });
    this.daten.status = "bestellt";
    this.daten.bestelltAt = jetzt;
    this.#bestellblatt(false);
    if (knopf) { knopf.disabled = false; schreibe(knopf, this.text("bestellSenden", { preis: zahl(this.preis) })); }
    this.#fertigZeigen();
    $("#lb-rolle")?.scrollTo({ top: 0, behavior: "smooth" });
  }

  // Wie hoch die Kaufleiste wirklich ist.
  //
  // Der Platz darunter stand als feste Zahl im Stil - 132 Punkte, gueltig
  // fuer ein iPhone mit Home-Indicator und einer einzeiligen Zeile unter
  // dem Knopf. Auf einem Android ohne Sicherheitsabstand sind es 98, und
  // bricht die Zeile auf 320 Punkten um, sind es rund 150: Dann liegt der
  // Haftungshinweis hinter der Leiste, und zwar auf dem kleinsten Geraet.
  //
  // Kennt der Browser ResizeObserver nicht, passiert hier nichts und der
  // Rueckfallwert im Stil gilt weiter. Nichts geht kaputt, es bleibt nur
  // wie vorher.
  #leisteMessen() {
    const leiste = $("#lb-leiste");
    if (!leiste || typeof ResizeObserver !== "function") return;
    if (this.leistenWaechter) return;
    const schreibeHoehe = () => {
      const hoch = Math.ceil(leiste.getBoundingClientRect().height);
      if (hoch > 0) document.documentElement.style.setProperty("--leiste-hoehe", `${hoch}px`);
    };
    this.leistenWaechter = new ResizeObserver(schreibeHoehe);
    this.leistenWaechter.observe(leiste);
    schreibeHoehe();
  }

  // Das Blatt auf und zu.
  //
  // Kein <details> im Fluss: Das haette den Bildschirm beim Aufklappen
  // laenger gemacht als das Fenster und damit genau das Scrollen
  // zurueckgeholt, das hier vermieden werden soll.
  //
  // ES IST ALS DIALOG AUSGEZEICHNET, ALSO MUSS ES SICH AUCH SO VERHALTEN.
  // Vorher sprang der Fokus beim Oeffnen auf den Schliessen-Knopf und
  // danach war er frei: Mit der Tastatur lief er aus dem Blatt in die
  // Seite dahinter - die laut aria-modal gar nicht da ist -, und nach dem
  // Schliessen stand er wieder am Seitenanfang statt an dem Knopf, der
  // das Blatt geoeffnet hat.
  //
  // Die Bildschirme werden fuer die Dauer stillgelegt. NICHT der ganze
  // Rahmen: Das Blatt liegt selbst darin und waere mit stillgelegt.
  // Browser, die "inert" nicht kennen, ueberlesen es - dann ist es wie
  // vorher und nichts ist kaputt.
  #blatt(auf) {
    const blatt = $("#lb-blatt");
    if (!blatt) return;
    if (auf) this.blattRueckkehr = document.activeElement;
    blatt.classList.toggle("ls-verstecken", !auf);
    $("#lb-faqknopf")?.setAttribute("aria-expanded", auf ? "true" : "false");
    for (const schirm of document.querySelectorAll(".lb-schirm")) {
      if (auf) schirm.setAttribute("inert", "");
      else schirm.removeAttribute("inert");
    }
    if (auf) { $("#lb-blattzu")?.focus(); return; }
    // Zurueck an die Stelle, von der aus geoeffnet wurde.
    const zurueck = this.blattRueckkehr;
    this.blattRueckkehr = null;
    if (zurueck && typeof zurueck.focus === "function" && document.contains(zurueck)) zurueck.focus();
  }

  // Den Link kopieren.
  //
  // Mit Rueckfallweg: In den Fenstern von Instagram und TikTok fehlt die
  // Zwischenablage haeufig. Dann wird der Text markiert - kopieren muss er
  // dann selbst, aber er sitzt nicht fest.
  async #kopieren() {
    const knopf = $("#lb-kopieren");
    const adresse = this.ort?.href || "";
    this.#merken({ linkKopiert: true });
    try {
      await navigator.clipboard.writeText(adresse);
      schreibe(knopf, this.text("kopiert"));
      return;
    } catch { /* weiter unten */ }
    try {
      const feld = document.createElement("input");
      feld.value = adresse;
      feld.setAttribute("readonly", "");
      feld.style.position = "fixed";
      feld.style.opacity = "0";
      document.body.appendChild(feld);
      feld.select();
      feld.setSelectionRange(0, adresse.length);
      document.execCommand("copy");
      feld.remove();
      schreibe(knopf, this.text("kopiert"));
    } catch {
      // Klappt beides nicht - in manchen App-Fenstern der Fall - wird das
      // Blatt geoeffnet. Dort steht die Adresse zum Abschreiben, und er
      // sitzt nicht vor einem Knopf, der nichts tut.
      this.#blatt(true);
      const feld = $("#lb-kopierenunter");
      if (feld) feld.textContent = adresse;
    }
  }

  // Datum und Uhrzeit, wie man sie in Prishtina und Tirana schreibt.
  //
  // NICHT toLocaleString mit "sq-AL": Die albanische Zone fehlt in vielen
  // Webansichten, und dann faellt der Browser still auf sein eigenes Gebiet
  // zurueck - auf einem Geraet mit englischer Einstellung stand hier
  // "09/05/2026, 11:07 PM". Das ist nicht nur fremd, es ist mehrdeutig: Der
  // Fuenfte im September oder der neunte im Mai? Auf einer Aktennummer mit
  // Datum darf genau das nicht offen bleiben.
  //
  // Also selbst gesetzt, in der Geschaeftszone: TT.MM.JJJJ, HH:MM.
  #zeitLesbar(iso) {
    const zeit = Date.parse(iso);
    if (!Number.isFinite(zeit)) return "";
    try {
      const teile = new Intl.DateTimeFormat("en-GB", {
        timeZone: "Europe/Belgrade",
        day: "2-digit", month: "2-digit", year: "numeric",
        hour: "2-digit", minute: "2-digit", hour12: false
      }).formatToParts(new Date(zeit));
      const w = (art) => teile.find((t) => t.type === art)?.value || "";
      const tag = w("day"), monat = w("month"), jahr = w("year");
      const stunde = w("hour"), minute = w("minute");
      if (!tag || !monat || !jahr) return "";
      // 24 Uhr gibt es nicht. en-GB liefert bei Mitternacht "24" statt "00".
      return `${tag}.${monat}.${jahr}, ${stunde === "24" ? "00" : stunde}:${minute}`;
    } catch { return ""; }
  }
}

export { Bericht, kennungAusPfad, TESTPFAD };

// Der Start.
//
// Auf der echten Adresse - /analiza/<kennung> - passiert hier genau das,
// was immer passierte: ein Bericht, der seinen Fall aus Firestore holt.
//
// Auf der EINEN Testadresse dagegen wird ein erfundener Fall gezeigt.
// Damit laesst sich an der Seite arbeiten, ohne die anzufassen, auf der
// gerade Werbung ankommt. Beide sehen inzwischen gleich aus - der
// Unterschied ist allein, woher die Daten kommen.
//
// Die Bedingung ist bewusst eng: ein Zeichenkettenvergleich des ganzen
// Pfades, kein Muster und kein Parameter. Und der Testfall wird erst
// NACH dieser Pruefung geladen - wer die echte Seite oeffnet, laedt die
// erfundenen Daten nie herunter.
// Die Statusleiste ueber der Seite mitfaerben.
//
// ZWEIMAL FALSCH GELEGEN, hier die belegte Fassung.
//
// Erst hiess es "geht mit CSS allein". Das gilt fuer den Sicherheitsabstand
// IN der Seite - aber diese Anwendung ist ein Rahmen von 100dvh mit einem
// eigenen Rollbereich darin; die Seite selbst scrollt nicht. In Safari
// faehrt die Adressleiste deshalb nie ein, der Inhalt reicht nie unter die
// Statusleiste, und env(safe-area-inset-top) ist dort null. Es gibt keinen
// unsicheren Bereich, den ein Band ausfuellen koennte.
//
// Dann hiess es "theme-color". Auch das traegt nicht: Die Marke wurde in
// iOS 26 fallengelassen beziehungsweise ist dort defekt
// (benfrain.com/ios26-safari-theme-color-tab-tinting-with-fixed-position-elements).
//
// Was iOS Safari WIRKLICH nimmt, wenn keine Marke greift: die
// Hintergrundfarbe der Seite selbst - "by default, that tint color is taken
// from the background color of the body". Also wird genau die umgeschaltet.
//
// Damit die Seite dabei nicht gruen wird, traegt der Rahmen (.lb) im
// Entwurf seine eigene Flaeche. Die Farbe von html und body ist dann nur
// noch das, was der Browser oben abliest, und nichts, was jemand sieht.
//
// Beide Wege werden gesetzt, weil verschiedene Fassungen verschiedene
// nehmen: die Marke fuer iOS 15 bis 18 und Android, die Hintergrundfarbe
// fuer alles ab iOS 26.
//
// EHRLICH DAZU: Auf iOS 26 ist das laut WebKit-Ticket ein bekannter Fehler,
// fuer den auch erfahrene Entwickler keinen sicheren Weg gefunden haben.
// Bleibt der Streifen grau, liegt es nicht an dieser Seite.
function statusleisteFolgen(gruen, grund) {
  const rolle = document.querySelector("#lb-rolle");
  const band = document.querySelector(".lb-briefkopf");
  const marke = document.querySelector('meta[name="theme-color"]');
  if (!rolle || !band) return;

  // OBEN UND UNTEN GETRENNT.
  //
  // GEMESSEN AM GERAET: Eine einzelne Hintergrundfarbe faerbt beide Enden -
  // iOS liest damit die Leiste oben UND den Streifen unten ab. Der untere
  // wurde dabei mitgruen, und das war nicht gewollt.
  //
  // Ein Verlauf mit hartem Umschlag trennt die beiden: Am oberen Rand der
  // Flaeche steht das Gruen, am unteren der Grund der Seite. Was der
  // Browser oben abliest, ist damit ein anderes als das, was er unten
  // abliest.
  const verlauf = `linear-gradient(to bottom, ${gruen} 0 50%, ${grund} 50% 100%)`;

  let steht = "";
  const pruefen = () => {
    // Solange das Band den oberen Rand noch beruehrt, ist oben gruen.
    // Beim Zurueckfedern ueber den Rand hinaus bleibt es gruen - richtig,
    // denn dann ist es erst recht zu sehen.
    const soll = band.getBoundingClientRect().bottom > 0 ? "gruen" : "grund";
    if (soll === steht) return;
    steht = soll;
    // Nur html: Traegt auch body eine Flaeche, hat der Browser zwei
    // Quellen und nimmt die falsche.
    document.documentElement.style.background = soll === "gruen" ? verlauf : grund;
    marke?.setAttribute("content", soll === "gruen" ? gruen : grund);
  };
  rolle.addEventListener("scroll", pruefen, { passive: true });
  pruefen();
}

// Die Farbe des Bandes im Briefkopf - AUS DEM STIL GELESEN, nicht hier
// noch einmal geschrieben.
//
// GEMESSEN, NICHT GESCHAETZT: Hier stand einmal "#A9C3BC" als feste Zahl.
// Als --fluss in bericht.css spaeter auf #679489 nachgedunkelt wurde
// (Kontrast), blieb diese Zeile stehen - und damit stand oben eine
// hellgruene Statusleiste ueber einem dunkelgruenen Band, mit einer
// sichtbaren Naht dazwischen. Zwei Quellen fuer dieselbe Farbe heisst:
// Irgendwann laufen sie auseinander, und niemand weiss warum.
//
// Der Rueckfallwert greift nur, wenn der Stil noch nicht da ist; er ist
// die Farbe der Seite und damit das Unauffaelligste, was oben stehen kann.
function farbeAusStil(name, ersatz) {
  try {
    const wert = getComputedStyle(document.documentElement)
      .getPropertyValue(name).trim();
    return wert || ersatz;
  } catch { return ersatz; }
}

async function start() {
  // Der Pfad wird ZUERST geprueft und der Testfall erst danach geladen:
  // Wer die echte Seite oeffnet, laedt die erfundenen Daten nie herunter.
  if (!istTestpfad(globalThis.location?.pathname)) {
    await new Bericht().starte();
    // Erst jetzt: Vorher gibt es den Rollbereich noch gar nicht.
    statusleisteFolgen(farbeAusStil("--fluss", "#FAF8F5"), "#FAF8F5");
    return;
  }

  const { testFetch } = await import("./bericht-testfall.js");

  // Eine Testfassung gehoert nicht in eine Suchmaschine.
  const nichtIndexieren = document.createElement("meta");
  nichtIndexieren.name = "robots";
  nichtIndexieren.content = "noindex, nofollow";
  document.head.appendChild(nichtIndexieren);

  await new Bericht({
    fetchFn: testFetch,
    // Ein Fall, den es nicht gibt, wird auch nicht gezaehlt.
    pixel: { starte: () => false, melde: () => {}, meldeLead: () => {} },
    // GEMESSEN, NICHT GESCHAETZT: Hier stand eine Kennung mit Buchstaben
    // darin. kennungAusPfad nimmt nur Hexadezimalziffern - die Kennung
    // fiel durch, und die Testseite zeigte "Diese Analyse wurde nicht
    // gefunden".
    ort: { pathname: `/analiza/${"0".repeat(32)}`, href: globalThis.location?.href || "" }
  }).starte();

  // Erst jetzt: Vorher gibt es den Rollbereich noch gar nicht.
  statusleisteFolgen(farbeAusStil("--fluss", "#FAF8F5"), "#FAF8F5");
}

if (typeof document !== "undefined" && !globalThis.__LIFESKIN_TEST__) {
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
}
