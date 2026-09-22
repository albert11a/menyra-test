/* Der Laden auf der Landingpage.
 * ══════════════════════════════════════════════════════════════════════
 *
 * WAS HIER PASSIERT, IN EINEM SATZ: Die Mittel werden aus Firestore
 * gelesen, als Raster gezeichnet, in einen Korb gelegt - und der Korb
 * geht als Bestellung in DIESELBE Sitzung, die der Trichter fuer diesen
 * Besuch ohnehin angelegt hat.
 *
 * ══ WARUM DIESELBE SITZUNG ══
 * Ein Besucher ist eine Zeile in Heart. Wer herkommt und ohne Analyse
 * kauft, ist derselbe Besucher - nicht zwei. Ein eigenes Dokument je
 * Kauf haette jeden Direktkaeufer doppelt gezaehlt: einmal als Besuch,
 * einmal als Bestellung, und der Trichter haette mehr Bestellungen als
 * Besucher ausgewiesen.
 *
 * Geschrieben wird mit Sitzung#merken - genau der Aufruf, mit dem auch
 * die Befundseite bestellt (astra.js, #bestellen). Dieselben vier
 * Felder, dieselbe Sammlung, dieselbe Zahlung an der Tuer.
 *
 * ══ WARUM KEINE NEUE FIRESTORE-REGEL ══
 * lifeskinSessionShapeOk() in firestore.rules laesst nur eine feste
 * Liste von Feldern zu (hasOnly) - ein unbekanntes Feld weist das GANZE
 * Dokument ab, und die Bestellung waere still verloren. "order" ist
 * darin als freie Karte erlaubt, ohne weitere Pruefung. Die Bestellung
 * legt deshalb alles, was sie ausmacht, IN diese Karte:
 *
 *   order.kind   "shop" - daran erkennt Heart die Direktbestellung
 *   order.items  was gekauft wurde, je Zeile id, name, Preis, Anzahl
 *
 * "typ" bleibt absichtlich weg: Die Regel laesst dort nur die vier Wege
 * des Trichters zu ("scan", "foto", "trup", "pytje"), und ein Kauf ist
 * keiner davon. Ihn in die Liste aufzunehmen hiesse, firestore.rules zu
 * aendern und neu auszuspielen; order.kind kommt ohne das aus.
 *
 * ══ WO DIE BILDER HERKOMMEN ══
 * Aus Heart, nicht aus diesem Verzeichnis. Je Mittel liegt ein Dokument
 * unter lifeskin/{tenant}/config/landingFotot-{produktId} mit einer
 * Liste von Bildern. "config" und nicht eine neue Sammlung, weil
 * firestore.rules dort bereits genau das erlaubt, was gebraucht wird:
 * lesen darf jeder, schreiben nur das CEO-Konto (match /config/{documentId}).
 * Eine neue Sammlung haette eine neue Regel gebraucht - und eine Regel,
 * die nicht ausgespielt ist, ist eine Seite, die nicht funktioniert.
 *
 * JE MITTEL EIN DOKUMENT und nicht eines fuer alle: Ein Firestore-
 * Dokument darf 1 MiB. Vier Bilder zu je 180 KB passen je Mittel
 * bequem; alle Mittel zusammen in einem Dokument waeren es nicht.
 *
 * ══ WANN GELADEN WIRD ══
 * Erst, wenn der Abschnitt in die Naehe des Bildes kommt. Die Bilder
 * sind Datenzeilen und wiegen zusammen ein paar hundert Kilobyte; sie
 * beim Oeffnen der Seite zu holen hiesse, sie gegen die acht
 * Fallaufnahmen um dieselbe Leitung antreten zu lassen - auf Mobilfunk,
 * waehrend jemand die Ueberschrift liest. */

/* Relativ und nicht ab der Wurzel: Derselbe Weg loest im Browser und in
   node auf, und damit lassen sich die Rechenteile hier ohne Browser
   pruefen (tests/lifeskin-landing-shop.test.mjs). */
import {
  LIFESKIN_FIRESTORE_BASE,
  LIFESKIN_TENANT
} from "../lifeskin/lifeskin-config.js";
import { STANDARD_PRODUKTE } from "../lifeskin/lifeskin-catalog.js";
import { pixelKennungen } from "../lifeskin/lifeskin-pixel.js";

const $ = (w, i = document) => i.querySelector(w);

/* Die Kennung des Dokuments, in dem die Bilder eines Mittels liegen.
 * Sie steht an drei Stellen gleich - hier, in Heart und im README -,
 * also steht sie hier einmal und wird dort geholt. */
export const FOTO_PRAEFIX = "landingFotot-";

/* Wie viele Bilder ein Mittel hoechstens zeigt. Mehr waere kein
 * besseres Bild, sondern ein Wischen ohne Ende - und mehr Daten auf
 * einer Leitung, die schon die Fallaufnahmen traegt. */
export const FOTOS_MAX = 6;

/* ── Firestore lesen, ohne die Firebase-App ─────────────────────────
 * Derselbe Weg wie im ganzen Trichter: REST und sonst nichts. Die
 * Firebase-App zoege 680 KB und richtete einen Zwischenspeicher ein,
 * den eine Seite zum Lesen von vier Dokumenten nicht braucht. */
function wertAus(feld) {
  if (!feld || typeof feld !== "object") return null;
  if ("stringValue" in feld) return feld.stringValue;
  if ("integerValue" in feld) return Number(feld.integerValue);
  if ("doubleValue" in feld) return Number(feld.doubleValue);
  if ("booleanValue" in feld) return feld.booleanValue;
  if ("nullValue" in feld) return null;
  if ("arrayValue" in feld) return (feld.arrayValue.values || []).map(wertAus);
  if ("mapValue" in feld) return karteAus(feld.mapValue.fields || {});
  return null;
}

function karteAus(felder) {
  const raus = {};
  for (const name of Object.keys(felder || {})) raus[name] = wertAus(felder[name]);
  return raus;
}

/* SEITENWEISE, UND ZWAR BIS ZUM ENDE.
 *
 * HIER STAND EINE EINZIGE ANFRAGE MIT pageSize=60 - und das war der
 * Fehler, an dem Mittel von der Seite verschwanden.
 *
 * Firestore teilt eine Liste nicht nur nach der ANZAHL auf, sondern
 * auch nach der GROESSE der Antwort. Die Bilder der Landingpage stehen
 * als base64 in ihren Dokumenten; je mehr davon dazukommen, desto
 * weniger Dokumente passen in eine Seite. Zurueck kamen dann fuenf
 * statt sieben, dazu ein nextPageToken - das niemand las. Die
 * Dokumente, die von der Seite fielen, waren fuer diese Seite nicht
 * vorhanden: Ihr Mittel hatte kein Bild mehr und wurde
 * herausgefiltert.
 *
 * GENAU SO SIEHT ES AUS: "Sobald ich das zweite Bild hochlade, wird das
 * Mittel gar nicht mehr gezeigt." Nicht das zweite Bild war zu viel -
 * es war das Dokument dahinter, das die Seite sprengte.
 *
 * Die Schleife holt deshalb nach, solange ein Token kommt. Die Grenze
 * von zwoelf Runden ist ein Riegel gegen eine Antwort, die immer ein
 * Token mitschickt - eine Seite, die ewig laedt, ist schlimmer als
 * eine, die etwas weglaesst. */
async function holeSammlung(name, holen = fetch) {
  const basis = `${LIFESKIN_FIRESTORE_BASE}/lifeskin/${LIFESKIN_TENANT}/${name}?pageSize=60`;
  const raus = [];
  let token = "";
  for (let runde = 0; runde < 12; runde += 1) {
    const adresse = token ? `${basis}&pageToken=${encodeURIComponent(token)}` : basis;
    const antwort = await holen(adresse);
    if (!antwort.ok) throw new Error(`Firestore ${antwort.status}`);
    const laden = await antwort.json();
    for (const d of laden.documents || []) {
      raus.push({ id: String(d.name || "").split("/").pop(), ...karteAus(d.fields || {}) });
    }
    token = String(laden.nextPageToken || "");
    if (!token) break;
  }
  return raus;
}

/* ── Was ein Mittel auf dieser Seite ist ────────────────────────────
 *
 * DER KATALOG IST DER RUECKWEG, NICHT DIE QUELLE. Im Betrieb kommen
 * Name, Untertitel und Preis aus Firestore - wer in Heart den Preis
 * aendert, hat ihn hier. Antwortet Firestore nicht, stehen die Werte
 * aus lifeskin-catalog.js da; sie sind dieselben, mit denen der
 * Trichter rechnet, also stimmt die Seite auch dann mit sich selbst
 * ueberein.
 *
 * OHNE BILD KEINE KARTE. Eine Kachel mit einem grauen Feld darin sieht
 * nach einer kaputten Seite aus, und eine kaputte Seite verkauft
 * nichts. Wer ein Mittel hier sehen will, legt in Heart ein Bild dazu -
 * das ist zugleich der Schalter, mit dem sich ein Mittel zeigen und
 * wieder wegnehmen laesst, ohne dass jemand Code anfasst. */
export function mittelBauen(produkteAusFirestore, fotosJeMittel, sprache = "sq") {
  const ausKatalog = new Map(STANDARD_PRODUKTE.map((p) => [p.id, p]));
  const ausNetz = new Map((produkteAusFirestore || []).map((p) => [p.id, p]));
  const kennungen = new Set([...ausKatalog.keys(), ...ausNetz.keys()]);

  return [...kennungen]
    .map((id) => {
      const k = ausKatalog.get(id) || {};
      const n = ausNetz.get(id) || {};
      const nenName = n.nenName || k.nenName || {};
      const fotot = (fotosJeMittel.get(id) || []).slice(0, FOTOS_MAX);
      /* WAS IM KATALOG STEHT UND NIRGENDS GEZEIGT WURDE.
       *
       * kurztext, synimi, veprimi und perdorimi liegen
       * vollstaendig in lifeskin-catalog.js - dieselbe Datei, aus der
       * der Befund seine Saetze nimmt. Auf der Landingpage stand davon
       * nichts: Name, Preis, Knopf. Wer nicht weiss, wofuer ein Mittel
       * ist, legt es nicht in den Korb.
       *
       * Sie kommen aus dem Katalog und nicht aus Firestore: Dort
       * stehen sie ohnehin nicht, und was in Heart geaendert wird
       * (Name, Preis, Menge, Sichtbarkeit), schlaegt weiter durch. */
      const zwei = (wert) => {
        const karte = wert || {};
        return typeof karte === "string" ? karte : String(karte[sprache] || karte.sq || "");
      };
      const liste = (wert) => {
        const karte = wert || {};
        const raus = Array.isArray(karte) ? karte : (karte[sprache] || karte.sq || []);
        return Array.isArray(raus) ? raus.map(String) : [];
      };
      return {
        id,
        name: String(n.name || k.name || id),
        nenName: String(nenName[sprache] || nenName.sq || ""),
        inhalt: String(n.inhalt || k.inhalt || ""),
        cmimi: Number(n.einzelpreis ?? k.einzelpreis ?? 0),
        rendi: Number(n.order ?? k.order ?? 99),
        fshehur: String(n.availability || k.availability || "visible") === "hidden",
        fotot,
        /* Eine Zeile auf der Karte: wofuer das Mittel da ist. */
        kurztext: zwei(k.kurztext),
        /* Das Versprechen mit einer Frist. Es ist der Satz, wegen dem
           jemand kauft - und er stand bisher nur im Befund. */
        synimi: zwei(k.synimi),
        /* Drei Zeilen, was es tut. */
        veprimi: liste(k.veprimi),
        /* Wann, wie viel, wie - und worauf zu achten ist. */
        perdorimi: {
          koha: zwei(k.perdorimi?.koha),
          sasia: zwei(k.perdorimi?.sasia),
          si: zwei(k.perdorimi?.si),
          kujdes: zwei(k.perdorimi?.kujdes)
        }
      };
    })
    .filter((m) => !m.fshehur && m.fotot.length > 0 && m.cmimi > 0)
    .sort((a, b) => a.rendi - b.rendi || a.name.localeCompare(b.name));
}

/* ── Der Korb ───────────────────────────────────────────────────────
 *
 * ER LIEGT IM sessionStorage und nicht im localStorage. Ein Korb, der
 * eine Woche spaeter noch dasteht, ist keine Erinnerung, sondern eine
 * Ueberraschung - und die Preise koennen sich bis dahin geaendert
 * haben. sessionStorage gehoert dem Tab und ist beim naechsten Besuch
 * weg, also genau die Grenze, die "ein Einkauf" meint.
 *
 * Gespeichert werden NUR Kennung und Anzahl. Preis und Name kommen bei
 * jedem Zeichnen frisch aus den Mitteln - sonst zeigte ein Korb von
 * vorhin einen Preis, den es nicht mehr gibt. */
const KORB_SCHLUESSEL = "lifeskin.shporta";

export function korbLesen(speicher) {
  try {
    const roh = speicher?.getItem(KORB_SCHLUESSEL);
    const gelesen = roh ? JSON.parse(roh) : [];
    if (!Array.isArray(gelesen)) return [];
    return gelesen
      .filter((z) => z && typeof z.id === "string" && Number(z.sasia) > 0)
      .map((z) => ({ id: z.id, sasia: Math.min(9, Math.round(Number(z.sasia))) }));
  } catch {
    /* Ein Speicher, den der Browser sperrt, ist ein leerer Korb - kein
       Fehler, der die Seite anhaelt. */
    return [];
  }
}

export function korbSchreiben(speicher, korb) {
  try {
    speicher?.setItem(KORB_SCHLUESSEL, JSON.stringify(korb));
  } catch {
    /* Siehe oben. */
  }
}

/* Die Summe. Eine Zeile, damit sie an allen drei Stellen, an denen sie
 * steht, dieselbe ist. */
export function summeVon(korb, mittel) {
  const preise = new Map(mittel.map((m) => [m.id, m.cmimi]));
  return korb.reduce((s, z) => s + (preise.get(z.id) || 0) * z.sasia, 0);
}

export function stueckVon(korb) {
  return korb.reduce((s, z) => s + z.sasia, 0);
}

export class Laden {
  constructor({ dokument = document, speicher = globalThis.sessionStorage,
                holen, trichter } = {}) {
    this.dok = dokument;
    this.speicher = speicher;
    this.holen = holen || ((...a) => fetch(...a));
    /* Der Trichter wird beim Bestellen geholt und nicht hier: Dieses
       Modul laeuft, bevor lifeskin-app.js seine Instanz gesetzt hat. */
    this.trichterFn = trichter || (() => globalThis.__lifeskinTrichter);
    this.mittel = [];
    this.korb = korbLesen(this.speicher);
    this.laeuft = false;
    this.fertig = false;
    /* Welche Marken schon an der Sitzung stehen. Siehe #merke(). */
    this.gemerkt = new Set();
    /* Welches Mittel im Blatt offen steht - der Knopf unten legt es in
       den Korb. */
    this.offenesMittel = "";
    /* Ob gerade etwas hineingelegt wurde - der Satz im Band haengt
       daran. Siehe #gradeGelegtMerken(). */
    this.gradeGelegt = false;
    this.gelegtUhr = 0;
  }

  starte() {
    this.#korbZeichnen();
    this.#ereignisse();
    this.#beobachten();
  }

  /* ── WAS DER LADEN AN DER SITZUNG FESTHAELT ──────────────────────
   *
   * VIER MARKEN, UND ZWAR ALS FELDER UND NICHT ALS STUFEN.
   *
   * Der Laden laeuft NEBEN dem Analyseweg in derselben Sitzung. Wuerde
   * er schritt() rufen, zoege jede Handlung hier den Fall an der
   * Warteseite vorbei - und in Heart stuende eine Analyse, die nie
   * stattgefunden hat. Nur die Bestellung selbst schreibt weiter einen
   * Schritt, weil dort die Bestellung mitgeht (siehe bestellen()).
   *
   * JEDE MARKE HOECHSTENS EINMAL: Wer drei Mittel in den Korb legt,
   * hat einen Warenkorb und nicht drei. Der Wert darf sich dabei
   * aendern, die Marke nicht.
   *
   * KEIN SCHREIBVORGANG HAELT DEN LADEN AN. Wenn die Zaehlung
   * ausfaellt, verkauft die Seite weiter - dieselbe Regel wie im
   * ganzen Trichter. */
  #merke(daten, einmalig = "") {
    if (einmalig) {
      if (this.gemerkt.has(einmalig)) return;
      this.gemerkt.add(einmalig);
    }
    try { this.trichterFn()?.sitzung?.ergaenze?.(daten); }
    catch { /* Messtechnik darf den Verkauf nie anhalten. */ }
  }

  /* WER DIE MITTEL WIRKLICH ANGESEHEN HAT.
   *
   * Nicht "war auf der Seite" und nicht "hat bis dorthin geladen":
   * Gezaehlt wird, wenn der Abschnitt zu einem knappen Drittel im Bild
   * stand. Ohne diese Unterscheidung waere die Stufe "Produkte" im
   * Kauftrichter dieselbe Zahl wie "Landing", und eine Stufe, die
   * nichts aussortiert, sagt nichts. */
  #produktblickBeobachten() {
    if (!("IntersectionObserver" in globalThis)) return;
    const abschnitt = $("#produktet", this.dok);
    if (!abschnitt) return;
    const waechter = new IntersectionObserver((eintraege) => {
      for (const e of eintraege) {
        if (!e.isIntersecting) continue;
        waechter.disconnect();
        this.#merke({ produkteGesehen: true }, "produkteGesehen");
      }
    }, { threshold: 0.3 });
    waechter.observe(abschnitt);
  }

  /* Geladen wird, wenn der Abschnitt naeherkommt - nicht beim Oeffnen
     der Seite. Zwei Bildschirmlaengen vorher (rootMargin) ist frueh
     genug, dass die Bilder dastehen, bevor jemand ankommt.
   *
   * BEOBACHTET WIRD DER ABSCHNITT DAVOR UND NICHT DER EIGENE.
   *
   * GEMESSEN, NICHT VERMUTET: Zuerst stand hier observe(#produktet) -
   * und nichts wurde je geladen. Der eigene Abschnitt traegt hidden,
   * solange nichts darin steht; ein Element mit display:none hat keine
   * Ausdehnung, und ein IntersectionObserver meldet fuer so eines
   * niemals "im Bild". Der Laden wartete damit auf ein Ereignis, das
   * erst eintreten koennte, NACHDEM er geladen haette.
   *
   * Der Abschnitt mit den belegten Faellen steht unmittelbar darueber,
   * ist immer da und ist genau die richtige Vorwarnung: Wer ihn liest,
   * ist eine Bildschirmlaenge von den Mitteln entfernt. */
  #beobachten() {
    const vorlaeufer = $("#rezultatet", this.dok) || $("#produktet", this.dok);
    if (!vorlaeufer || !("IntersectionObserver" in globalThis)) { this.laden(); return; }
    const waechter = new IntersectionObserver((eintraege) => {
      for (const e of eintraege) {
        if (!e.isIntersecting) continue;
        waechter.disconnect();
        this.laden();
      }
    }, { rootMargin: "200% 0px 200% 0px" });
    waechter.observe(vorlaeufer);
  }

  async laden() {
    if (this.laeuft || this.fertig) return;
    this.laeuft = true;
    try {
      const [produkte, konfig] = await Promise.all([
        holeSammlung("products", this.holen).catch(() => []),
        holeSammlung("config", this.holen).catch(() => [])
      ]);

      const fotos = new Map();
      for (const doku of konfig) {
        if (!doku.id.startsWith(FOTO_PRAEFIX)) continue;
        const id = doku.id.slice(FOTO_PRAEFIX.length);
        const liste = Array.isArray(doku.fotot) ? doku.fotot : [];
        fotos.set(id, liste.filter((f) => typeof f === "string" && f.startsWith("data:image/")));
      }

      this.mittel = mittelBauen(produkte, fotos);
      this.fertig = true;
      this.#zeichnen();
    } catch {
      /* Ein Laden, der nicht laedt, ist ein Abschnitt, den es nicht
         gibt. Die Seite darunter funktioniert weiter. */
    } finally {
      this.laeuft = false;
    }
  }

  /* ── Das Raster ──────────────────────────────────────────────────
   * Zwei in einer Reihe, je mit einer Bahn aus Bildern. Die Bahn ist
   * dieselbe Technik wie bei den belegten Faellen: waagerecht scrollen
   * mit scroll-snap, Punkte darunter, und nichts haengt am Ziehen. */
  #zeichnen() {
    const raster = $("#rrjeta", this.dok);
    const abschnitt = $("#produktet", this.dok);
    if (!raster || !abschnitt) return;
    if (!this.mittel.length) return;

    raster.innerHTML = this.mittel.map((m) => this.#karte(m)).join("");
    abschnitt.hidden = false;
    /* Die Stuecke des Abschnitts kommen wie alle anderen herein. Sie
       standen beim ersten Zeichnen der Seite noch nicht da, also hat
       der Beobachter in landing.js sie nie gesehen. */
    for (const stueck of abschnitt.querySelectorAll("[data-anim]")) {
      stueck.classList.add("ein");
    }
    this.#punkte();
    this.#korbZeichnen();
    /* ERST JETZT, und das ist kein Detail: Der Abschnitt traegt hidden,
       solange nichts darin steht, und ein Element mit display:none hat
       keine Ausdehnung - ein IntersectionObserver meldet dafuer nie
       "im Bild". Genau daran ist das Nachladen der Mittel schon einmal
       gescheitert (siehe #beobachten). */
    this.#produktblickBeobachten();
  }

  #karte(m) {
    /* NUR DIE ERSTE AUFNAHME TRAEGT EINEN TEXT. Alle zeigen dasselbe
       Mittel aus einem anderen Blickwinkel; sechsmal denselben Namen
       vorzulesen ist keine Beschreibung, sondern ein Echo. */
    const bilder = m.fotot.map((foto, i) => `
      <figure class="mjeti__pamje">
        <img src="${foto}" alt="${i === 0 ? escape(m.name) : ""}"
             loading="lazy" decoding="async" />
      </figure>`).join("");
    const punkte = m.fotot.length > 1
      ? `<div class="mjeti__pika" aria-hidden="true">${m.fotot.map(() => "<i></i>").join("")}</div>`
      : "";

    return `
      <article class="mjeti" data-mjeti="${escape(m.id)}">
        <!-- Bahn und Punkte in EINEM Rahmen: Sie gehoeren zusammen -
             die Punkte sagen, wie viele Aufnahmen die Bahn traegt.

             DIE FLAECHE OEFFNET DAS MITTEL. Ein Wischen auf einer Bahn
             loest keinen Klick aus - der Browser bricht ihn ab, sobald
             gescrollt wurde. Beides am selben Kasten geht deshalb
             zusammen, und das Zeichen oben rechts sagt, dass es geht. -->
        <div class="mjeti__pamjet" data-mjeti-hap="${escape(m.id)}">
          <div class="mjeti__bahn" data-bahn tabindex="0" role="group"
               aria-label="${escape(m.name)}">${bilder}</div>
          <!-- EIN AUFZIEHEN UND KEIN PLUS. Ein Plus auf einer Karte,
               unter der "Shto" steht, heisst fuer jeden "in den Korb" -
               und genau das tut es nicht. Vier Ecken, die
               auseinandergehen, heissen "groesser ansehen", und zwar
               in jeder App, die es gibt. -->
          <span class="mjeti__shenje" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 4H4v5"/><path d="M15 4h5v5"/><path d="M15 20h5v-5"/><path d="M9 20H4v-5"/></svg>
          </span>
          ${punkte}
        </div>
        <!-- WAS AUF DER KARTE STEHT UND WAS NICHT.
             Vorher: Name, Preis, Knopf. Wer nicht weiss, wofuer ein
             Mittel da ist, legt es nicht in den Korb - und genau das
             stand nirgends, obwohl es fertig im Katalog liegt.
             Jetzt: der Name mit seiner Menge in EINER Zeile, darunter
             wofuer es ist, und der Preis IM Knopf. Drei Zeilen statt
             vier, und trotzdem beantwortet die Karte die Frage.
             Alles Weitere - das Versprechen, die Stoffe, die
             Anwendung - steht im Blatt, das ein Tipp aufmacht. -->
        <!-- DIE WOERTER MACHEN AUCH AUF. Der Knopf darin nicht: Der
             Horcher prueft [data-shto] zuerst und geht dann heraus. -->
        <div class="mjeti__fjale" data-mjeti-hap="${escape(m.id)}">
          <p class="mjeti__emer">
            ${escape(m.name)}${m.inhalt ? `<span class="mjeti__sasi">${escape(m.inhalt)}</span>` : ""}
          </p>
          ${m.nenName ? `<p class="mjeti__nen">${escape(m.nenName)}</p>` : ""}
          <!-- KORB UND WORT UND PREIS.
               Der Korb sagt, was passiert; "Shto" sagt es noch einmal
               in Worten, und der Preis ist das, worauf hier jeder
               schaut. Der Korb ersetzt das Wort nicht, er steht davor:
               Ein Bild allein muss gedeutet werden, ein Wort allein
               wird ueberlesen.
               Damit es dabei nicht wieder an beide Raender stoesst,
               traegt der Knopf weniger Polsterung und einen kleineren
               Abstand als zu der Zeit, als "Shto · 33 €" allein
               darin stand.
               Blind bleibt es lesbar: Das Bild traegt aria-hidden, der
               Knopf sein eigenes aria-label mit dem ganzen Satz. -->
          <button type="button" class="mjeti__shto" data-shto="${escape(m.id)}"
                  aria-label="Shto ${escape(m.name)} në shportë · ${m.cmimi} €">
            <svg class="mjeti__korbi" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 5h2.2l2 11h10.4l2.1-8H6"/><circle cx="9.5" cy="20" r="1.4"/><circle cx="17" cy="20" r="1.4"/></svg>
            <span>Shto · ${m.cmimi} €</span>
          </button>
        </div>
      </article>`;
  }

  #punkte() {
    for (const karte of this.dok.querySelectorAll(".mjeti")) {
      const bahn = $("[data-bahn]", karte);
      const punkte = $(".mjeti__pika", karte);
      if (!bahn || !punkte) continue;
      const setzen = () => {
        const breite = bahn.clientWidth || 1;
        /* Gerundet auf das naechste Bild: Wer zur Haelfte gewischt hat,
           sieht den Punkt schon am Ziel - so herum liest es sich als
           Fuehrung, andersherum als Verzoegerung. */
        const an = Math.round(bahn.scrollLeft / breite);
        [...punkte.children].forEach((p, i) => {
          if (i === an) p.setAttribute("data-an", "ja");
          else p.removeAttribute("data-an");
        });
      };
      setzen();
      /* OHNE WARTEZEIT, UND DAS WAR DER FEHLER.
       *
       * Hier stand ein Zeitschloss von 60 ms NACH dem letzten
       * Scroll-Ereignis. Beim Wischen feuert scroll ununterbrochen -
       * die Punkte sprangen also erst um, wenn die Bahn schon
       * stillstand, und auf einem Telefon mit Schwung dauert das eine
       * halbe Sekunde. Was man sieht, ist ein Punkt, der dem Bild
       * hinterherlaeuft.
       *
       * requestAnimationFrame statt Zeitschloss: Gerechnet wird
       * hoechstens einmal je Bild, aber im SELBEN Bild wie die
       * Bewegung - die Punkte laufen damit mit dem Finger und nicht
       * hinter ihm her. */
      let wartet = false;
      bahn.addEventListener("scroll", () => {
        if (wartet) return;
        wartet = true;
        requestAnimationFrame(() => { wartet = false; setzen(); });
      }, { passive: true });
    }
  }

  /* ── DAS MITTEL IM EINZELNEN ─────────────────────────────────────
   *
   * DIE REIHENFOLGE IST DIE DER FRAGEN, die jemand vor einem Kauf
   * stellt, und nicht die des Katalogs:
   *
   *   1. Wie sieht es aus?          die Aufnahmen
   *   2. Wofuer ist es?             Untertitel und eine Zeile
   *   3. Was habe ich davon?        das Versprechen MIT seiner Frist
   *   4. Woran liegt das?           drei Zeilen Wirkung
   *   5. Was ist drin?              die Stoffe mit ihrem Anteil
   *   6. Wie benutze ich es?        wann, wie viel, wie, und worauf
   *
   * DAS VERSPRECHEN STEHT OBEN UND NICHT UNTEN. Es ist der einzige
   * Satz, der eine Frist nennt ("Deri në ditën 28"), und der Satz, an
   * dem sich ein Kauf entscheidet. Unter den Stoffen haette ihn nur
   * gelesen, wer ohnehin schon kauft.
   *
   * DIE STOFFE MIT IHREM ANTEIL. Ein Prozentsatz ist der Unterschied
   * zwischen einer Behauptung und einer Angabe - und er ist das
   * Einzige auf dieser Seite, was sich nachpruefen laesst.
   *
   * WAS FEHLT, STEHT NICHT ALS LEERE UEBERSCHRIFT DA. Ein Mittel ohne
   * Wirkungszeilen bekommt keinen leeren Kasten "Si vepron".
   *
   * DIE STOFFLISTE STEHT HIER NICHT MEHR. Sie war die laengste
   * Abteilung des Blattes und die einzige, die niemanden kaufen
   * laesst: Wer "Benzoyl Peroxide 4%" liest, weiss danach nicht mehr
   * ueber sich selbst als vorher. Was verkauft, steht darueber - das
   * Versprechen auf 28 Tage und die Wirkung. Die Prozente bleiben im
   * Katalog; der Befund nennt sie dort, wo sie zu einer Haut
   * gehoeren. */
  #blatt(m) {
    const bilder = m.fotot.map((foto, i) => `
      <figure class="mjetiblatt__pamje">
        <img src="${foto}" alt="${i === 0 ? escape(m.name) : ""}" decoding="async" />
      </figure>`).join("");

    const wirkung = m.veprimi.length ? `
      <section class="mjetiblatt__pjese">
        <h3>Si vepron</h3>
        <ul class="mjetiblatt__lista">
          ${m.veprimi.map((zeile) => `<li>${escape(zeile)}</li>`).join("")}
        </ul>
      </section>` : "";

    const anwendung = [
      m.perdorimi.koha ? ["Kur", m.perdorimi.koha] : null,
      m.perdorimi.sasia ? ["Sa", m.perdorimi.sasia] : null,
      m.perdorimi.si ? ["Si", m.perdorimi.si] : null
    ].filter(Boolean);
    const anwendungBlock = anwendung.length ? `
      <section class="mjetiblatt__pjese">
        <h3>Si përdoret</h3>
        <dl class="mjetiblatt__perdorimi">
          ${anwendung.map(([marke, wert]) => `
            <div><dt>${escape(marke)}</dt><dd>${escape(wert)}</dd></div>`).join("")}
        </dl>
        ${m.perdorimi.kujdes
          ? `<p class="mjetiblatt__kujdes">${escape(m.perdorimi.kujdes)}</p>` : ""}
      </section>` : "";

    return `
      <div class="mjetiblatt__pamjet">${bilder}</div>
      <div class="mjetiblatt__kokeza">
        ${m.nenName ? `<p class="mjetiblatt__nen">${escape(m.nenName)}</p>` : ""}
        ${m.kurztext ? `<p class="mjetiblatt__kurz">${escape(m.kurztext)}</p>` : ""}
        <p class="mjetiblatt__cmim">${m.cmimi} €${
          m.inhalt ? ` <span>· ${escape(m.inhalt)}</span>` : ""}</p>
      </div>
      ${m.synimi ? `
        <p class="mjetiblatt__synim">${escape(m.synimi)}</p>` : ""}
      ${wirkung}
      ${anwendungBlock}`;
  }

  /* Aufmachen und zumachen. Derselbe Griff wie bei der Kasse: Das
     Dokument gehoert dem Trichter, gesperrt wird ueber eine Klasse am
     Wurzelelement, und der Fokus wandert in das Blatt. */
  #blattOeffnen(id) {
    const m = this.mittel.find((mittel) => mittel.id === id);
    const blatt = $("#mjetiblatt", this.dok);
    const trup = $("#mjetiblatt-trup", this.dok);
    if (!m || !blatt || !trup) return;
    this.offenesMittel = id;
    const titel = $("#mjetiblatt-titull", this.dok);
    if (titel) titel.textContent = m.name;
    trup.innerHTML = this.#blatt(m);
    trup.scrollTop = 0;
    const knopftext = $("#mjetiblatt-shtotekst", this.dok);
    if (knopftext) knopftext.textContent = `Shto në shportë · ${m.cmimi} €`;
    blatt.hidden = false;
    this.dok.documentElement.classList.add("shporta-hapur");
    $("[data-mjeti-mbyll]", blatt)?.focus({ preventScroll: true });

    /* WER EIN MITTEL AUFMACHT, HAT ES ANGESEHEN - und genau das ist
       die Stufe "Produkte" im Kauftrichter. Sie stand bisher fuer
       "hat den Abschnitt im Bild gehabt"; ein geoeffnetes Mittel ist
       die staerkere Auskunft und gehoert in dieselbe Zahl. */
    this.#merke({ produkteGesehen: true }, "produkteGesehen");
  }

  #blattSchliessen() {
    const blatt = $("#mjetiblatt", this.dok);
    if (!blatt || blatt.hidden) return;
    blatt.hidden = true;
    this.offenesMittel = "";
    /* Nur, wenn nicht gerade die Kasse offensteht: Sonst gibt das
       Zumachen des Blattes die Seite hinter der Kasse wieder frei. */
    if ($("#shporta", this.dok)?.hidden !== false) {
      this.dok.documentElement.classList.remove("shporta-hapur");
    }
  }

  /* ── Der Korb an seinen drei Stellen ─────────────────────────────
   * Der Knopf oben, die feste Leiste unten und das Blatt selbst zeigen
   * immer denselben Stand - er wird an einer Stelle gerechnet. */
  #korbZeichnen() {
    const stueck = stueckVon(this.korb);
    const summe = summeVon(this.korb, this.mittel);

    const knopf = $("#korbknopf", this.dok);
    const zahl = $("#korbzahl", this.dok);
    if (knopf) knopf.hidden = stueck === 0;
    if (zahl) zahl.textContent = stueck ? String(stueck) : "";

    /* Die Kopfzeile klebt, sobald etwas im Korb liegt - und nur dann.
       Ohne Korb traegt sie nichts, was man unterwegs braucht; mit Korb
       traegt sie den Weg zur Kasse, und der darf nicht drei
       Bildschirmlaengen weiter oben liegen. */
    const kopf = this.dok.querySelector(".kopf");
    if (kopf) kopf.setAttribute("data-korb", stueck ? "ja" : "jo");

    /* DAS BAND UNTER DEM KOPF.
     *
     * ZWEI SAETZE, EIN BAND. Gleich nach dem Tipp steht dort, was
     * gerade passiert ist ("1 produkt u shtua në shportë") - das ist
     * die Antwort auf die Handlung. Danach steht dort, was IST ("1
     * produkt · 33 €"): Ein Ereignissatz, der eine Minute spaeter
     * immer noch dasteht, ist keine Bestaetigung mehr, sondern eine
     * Behauptung ueber etwas, das laengst vorbei ist.
     *
     * Der Knopf daneben wechselt nie - er ist der Weg zur Kasse, und
     * ein Weg, der sich veraendert, wird gesucht statt genommen. */
    const band = $("#korbband", this.dok);
    const bandtext = $("#korbbandtext", this.dok);
    if (band) band.hidden = stueck === 0;
    if (bandtext) {
      bandtext.textContent = this.gradeGelegt
        ? (stueck === 1 ? "1 produkt u shtua në shportë"
          : `${stueck} produkte u shtuan në shportë`)
        : (stueck === 1 ? `1 produkt · ${summe} €` : `${stueck} produkte · ${summe} €`);
    }

    /* Die feste Leiste unten fuehrt sonst in die Analyse. Liegt etwas
       im Korb, ist das nicht mehr die naechste Handlung: Wer etwas
       ausgesucht hat, will es bestellen. Die Analyse bleibt im ersten
       Blick, bei den vier Wegen und am Schluss erreichbar. */
    const leiste = $("#dock", this.dok);
    if (leiste) {
      leiste.setAttribute("data-korb", stueck ? "ja" : "jo");
      const text = $("#dockkorbtekst", this.dok);
      if (text) {
        text.textContent = stueck === 1
          ? `Shporta · 1 produkt · ${summe} €`
          : `Shporta · ${stueck} produkte · ${summe} €`;
      }
    }

    const lista = $("#shportalista", this.dok);
    if (lista) {
      const nachName = new Map(this.mittel.map((m) => [m.id, m]));
      lista.innerHTML = this.korb.map((z) => {
        const m = nachName.get(z.id);
        if (!m) return "";
        return `
          <li class="shporta__rresht" data-rresht="${escape(z.id)}">
            ${m.fotot[0] ? `<img class="shporta__foto" src="${m.fotot[0]}" alt="" />` : ""}
            <span class="shporta__fjale">
              <strong>${escape(m.name)}</strong>
              <small>${m.cmimi} € për produkt</small>
            </span>
            <span class="shporta__sasia">
              <button type="button" data-sasia="-" data-id="${escape(z.id)}"
                      aria-label="Një më pak">−</button>
              <b>${z.sasia}</b>
              <button type="button" data-sasia="+" data-id="${escape(z.id)}"
                      aria-label="Një më shumë">+</button>
            </span>
          </li>`;
      }).join("");
    }

    const bosh = $("#shportabosh", this.dok);
    if (bosh) bosh.hidden = stueck > 0;
    const forme = $("#shportaforme", this.dok);
    if (forme) forme.hidden = stueck === 0;
    /* Die Summe steht IM Knopf, neben dem Wort - wie auf der
       Befundseite. Wer drueckt, sieht bis zuletzt, was es kostet. */
    const shuma = $("#shportashuma", this.dok);
    if (shuma) shuma.textContent = stueck ? `· ${summe} €` : "";
    const kassenleiste = $("#shportaleiste", this.dok);
    if (kassenleiste) kassenleiste.hidden = stueck === 0;
  }

  #legen(id, wieviel) {
    const da = this.korb.find((z) => z.id === id);
    if (da) da.sasia = Math.max(0, Math.min(9, da.sasia + wieviel));
    else if (wieviel > 0) this.korb.push({ id, sasia: 1 });
    this.korb = this.korb.filter((z) => z.sasia > 0);
    korbSchreiben(this.speicher, this.korb);
    /* Vor dem Zeichnen: Das Band liest diese Marke, und der Satz darin
       soll im selben Bild stehen wie die neue Zahl am Korb. Nur beim
       Hineinlegen - wer herausnimmt, bekommt keine Bestaetigung
       darueber, dass etwas dazugekommen sei. */
    if (wieviel > 0) this.#gradeGelegtMerken();
    this.#korbZeichnen();

    /* AddToCart fuer Meta - eines der fuenf Standardereignisse, auf die
       sich eine Anzeigengruppe richten laesst, und auf dieser Seite gab
       es das bisher nirgends. Nur beim Hineinlegen, nicht beim
       Herausnehmen: "in den Korb gelegt" ist die Handlung, um die es
       geht. Der Pixel selbst meldet ohnehin nur einmal je Besuch. */
    if (wieviel > 0) {
      this.trichterFn()?.pixel?.meldeKorb?.(summeVon(this.korb, this.mittel));
    }

    /* DER WARENKORB IN DER SITZUNG.
     *
     * Der Pixel meldet ihn nach draussen, an Meta - dieser Satz ist
     * unveraendert geblieben und wird es bleiben. Hier geht dieselbe
     * Handlung ZUSAETZLICH an die eigene Sitzung, damit Heart eine
     * eigene Zahl hat: wie viele Warenkoerbe, und was darin liegt.
     *
     * Die Marke faellt einmal, der Wert wandert mit. So bleibt "wie
     * viele Warenkoerbe" eine Zahl ueber Menschen, waehrend der Wert
     * immer der letzte Stand ist - auch, wenn jemand wieder
     * herausnimmt. */
    const stueck = stueckVon(this.korb);
    const summe = summeVon(this.korb, this.mittel);
    if (stueck > 0) this.#merke({ imKorb: true }, "imKorb");
    this.#merke({ korbWert: summe, korbStueck: stueck });
  }

  /* Der Satz im Band gilt fuer den Augenblick nach dem Tipp. Danach
     steht dort der Stand - siehe #korbZeichnen().
   *
   * Die Uhr wird zurueckgesetzt, wenn ein zweites Mal gelegt wird:
   * Sonst kippte der Satz mitten im zweiten Tipp auf den Stand um. */
  #gradeGelegtMerken() {
    this.gradeGelegt = true;
    if (this.gelegtUhr) clearTimeout(this.gelegtUhr);
    this.gelegtUhr = setTimeout(() => {
      this.gradeGelegt = false;
      this.gelegtUhr = 0;
      this.#korbZeichnen();
    }, 5000);
  }

  #oeffnen(auf) {
    const blatt = $("#shporta", this.dok);
    if (!blatt) return;
    /* InitiateCheckout, sobald die Kasse aufgeht - das engste Publikum
       vor dem Kauf. Nur mit etwas im Korb: Eine leere Kasse ist kein
       begonnener Kauf. */
    if (auf && this.korb.length) {
      this.trichterFn()?.pixel?.meldeKasse?.(summeVon(this.korb, this.mittel));
    }
    blatt.hidden = !auf;
    /* Hinter einem offenen Blatt soll die Seite nicht mitscrollen. */
    this.dok.documentElement.classList.toggle("shporta-hapur", auf);
    if (auf) $("#shporta-emri", this.dok)?.focus({ preventScroll: true });
  }

  #ereignisse() {
    this.dok.addEventListener("click", (e) => {
      const shto = e.target.closest?.("[data-shto]");
      if (shto) {
        /* HIER RISS DIE KASSE AUF, und das war der Fehler.
         *
         * Ein Tipp auf "Shto" fuehrte unmittelbar auf den Bildschirm,
         * der Name, Nummer und Anschrift verlangt - mitten im Lesen,
         * nach einem einzigen Tipp, und bevor der Besucher gesehen hat,
         * was er da ausgesucht hat. Wer zwei Mittel vergleichen will,
         * muss sich erst wieder herausklicken; wer nur neugierig war,
         * steht vor einem Formular.
         *
         * Jetzt sagt der Kopf, dass es angekommen ist, und bietet den
         * Weg zur Kasse an. Gegangen wird er, wenn der Besucher so weit
         * ist - nicht, wenn wir es sind. */
        this.#legen(shto.getAttribute("data-shto"), 1);
        return;
      }
      const sasia = e.target.closest?.("[data-sasia]");
      if (sasia) {
        this.#legen(sasia.getAttribute("data-id"),
          sasia.getAttribute("data-sasia") === "+" ? 1 : -1);
        return;
      }
      if (e.target.closest?.("#korbknopf, [data-shporta-hap]")) {
        this.#oeffnen(true);
        return;
      }
      if (e.target.closest?.("[data-shporta-mbyll]")) { this.#oeffnen(false); return; }

      /* ── DAS MITTEL AUFMACHEN ──────────────────────────────────────
       *
       * Der Knopf im Blatt legt in den Korb und macht das Blatt zu:
       * Wer entschieden hat, will weiterlesen oder zur Kasse - nicht
       * noch einmal dieselbe Seite. Der Korb steht danach oben im Kopf
       * mit seiner Bestaetigung, und die ist auch hinter dem Blatt zu
       * sehen, weil das Blatt zu ist. */
      const shtoBlatt = e.target.closest?.("#mjetiblatt-shto");
      if (shtoBlatt) {
        if (this.offenesMittel) this.#legen(this.offenesMittel, 1);
        this.#blattSchliessen();
        return;
      }
      if (e.target.closest?.("[data-mjeti-mbyll]")) { this.#blattSchliessen(); return; }

      /* EIN WISCHEN AUF DER BAHN LOEST KEINEN KLICK AUS - der Browser
         bricht ihn ab, sobald gescrollt wurde. Die Flaeche darf
         deshalb beides: wischen und aufmachen. */
      const hap = e.target.closest?.("[data-mjeti-hap]");
      if (hap) { this.#blattOeffnen(hap.getAttribute("data-mjeti-hap")); return; }
    });

    this.dok.addEventListener("keydown", (e) => {
      if (e.key !== "Escape") return;
      /* Das Blatt zuerst: Steht es ueber der Kasse, gehoert die Taste
         ihm. Beide auf einmal zuzumachen waere ein Druck zu viel weg. */
      if ($("#mjetiblatt", this.dok)?.hidden === false) { this.#blattSchliessen(); return; }
      if (!$("#shporta", this.dok)?.hidden) this.#oeffnen(false);
    });

    const forme = $("#shportaforme", this.dok);
    forme?.addEventListener("submit", (e) => {
      e.preventDefault();
      this.bestellen();
    });
    /* Die Meldung geht weg, sobald jemand tippt - nicht erst beim
       naechsten Abschicken. Ein roter Satz unter einem Feld, das gerade
       gefuellt wurde, sagt dem, der davorsitzt, dass sein Tippen nichts
       geaendert hat. */
    forme?.addEventListener("input", () => {
      const gabim = $("#shportagabim", this.dok);
      if (gabim && !gabim.hidden) gabim.hidden = true;
      /* WER ANGEFANGEN HAT, SEINE ANSCHRIFT ZU SCHREIBEN.
       *
       * Die Stufe zwischen Warenkorb und Kauf, und bis hierher stand
       * dafuer nichts: Ein Korb, der nie zur Kasse kam, und einer, bei
       * dem beim Ausfuellen abgebrochen wurde, standen in derselben
       * Zahl - obwohl das zwei verschiedene Gespraeche sind. */
      this.#merke({ adresseBegonnen: true }, "adresseBegonnen");
    });
  }

  /* ── Die Bestellung ──────────────────────────────────────────────
   * Derselbe Ablauf wie auf der Befundseite: pruefen, Knopf sperren,
   * schreiben, und erst NACH der Antwort des Servers bestaetigen. */
  async bestellen() {
    const werte = {
      name: $("#shporta-emri", this.dok)?.value.trim() || "",
      telefon: $("#shporta-telefoni", this.dok)?.value.trim() || "",
      strasse: $("#shporta-adresa", this.dok)?.value.trim() || "",
      ort: $("#shporta-qyteti", this.dok)?.value.trim() || ""
    };
    const gabim = $("#shportagabim", this.dok);
    const zeigeFehler = (text) => {
      if (!gabim) return;
      gabim.textContent = text;
      gabim.hidden = false;
    };

    if (!werte.name || !werte.telefon || !werte.strasse || !werte.ort) {
      zeigeFehler("Ju lutemi plotësoni të gjitha fushat.");
      return;
    }
    if (!this.korb.length) return;
    if (gabim) gabim.hidden = true;

    const knopf = $("#shportadergo", this.dok);
    const knopftext = $("#shportadergotekst", this.dok);
    if (knopf) knopf.disabled = true;
    if (knopftext) knopftext.textContent = "Po dërgohet …";

    const nachId = new Map(this.mittel.map((m) => [m.id, m]));
    const zeilen = this.korb.map((z) => ({
      id: z.id,
      name: nachId.get(z.id)?.name || z.id,
      cmimi: nachId.get(z.id)?.cmimi || 0,
      sasia: z.sasia
    }));
    const summe = summeVon(this.korb, this.mittel);
    const jetzt = new Date().toISOString();
    const trichter = this.trichterFn();
    const sitzung = trichter?.sitzung;

    /* GESCHRIEBEN WIRD MIT schritt() - dem Aufruf, mit dem der Trichter
       jeden seiner Schritte zaehlt.
     *
     * Er tut drei Dinge auf einmal, die sonst einzeln zu tun waeren: Er
     * setzt den Schritt auf "ordered" (und nur vorwaerts), er haelt die
     * Zeit bis hierher fest, und er meldet den Schritt an den
     * Meta-Pixel - ueber dieselbe Stelle wie alle anderen Schritte, also
     * genau einmal und nicht daneben noch einmal von Hand.
     *
     * UND ER SAGT, OB ES GEKLAPPT HAT. Die Schreibkette in
     * lifeskin-session.js faengt Fehler ab, damit ein Trichter nicht an
     * der Zaehlung haengenbleibt - auf Erfolg reicht sie die Antwort
     * durch, im Fehlerfall undefined. Genau diese Unterscheidung braucht
     * eine Bestellung: Eine Bestaetigung ohne Antwort des Servers waere
     * eine Behauptung. */
    let ok = false;
    if (sitzung) {
      const antwort = await sitzung.schritt("ordered", {
        name: werte.name.slice(0, 80),
        phone: werte.telefon,
        address: werte,
        order: {
          kind: "shop",
          createdAt: jetzt,
          total: summe,
          payment: "nachnahme",
          status: "neu",
          orderId: sitzung.code || "",
          items: zeilen,
          // Metas eigene Browser-Kennungen, damit die Meldung vom Server
          // (Conversions API) derselben Person zugeordnet wird wie die aus
          // dem Browser. Kein Name, keine Nummer - siehe pixelKennungen().
          //
          // IN DER KARTE "order" UND NICHT DANEBEN: firestore.rules laesst
          // in einer Sitzung nur eine feste Feldliste zu; "order" ist als
          // freie Karte erlaubt, ein eigenes Feld waere es nicht.
          ...pixelKennungen()
        }
      }).catch(() => null);
      ok = Boolean(antwort?.ok);
    }

    if (!ok) {
      zeigeFehler("Porosia nuk u dërgua. Ju lutemi provoni sërish.");
      if (knopf) knopf.disabled = false;
      if (knopftext) knopftext.textContent = "Porositni";
      return;
    }

    /* Erst jetzt, mit der Antwort in der Hand. Der Meta-Pixel ist schon
       gemeldet - schritt() geht ueber beiSchritt an dieselbe Stelle wie
       jeder andere Schritt des Trichters. Ein zweiter Aufruf hier waere
       eine Bestellung, die zweimal gezaehlt wird. */
    /* WOHER DIESE BESTELLUNG KOMMT.
     *
     * Aus dem Laden auf der Landingpage und nicht von der Befundseite -
     * und das ist der Unterschied zwischen einem Kunden, der eine
     * Analyse gemacht hat, und einem, der direkt gekauft hat. Ohne die
     * Marke zaehlte Heart jeden Direktkauf als abgeschlossene Analyse:
     * Der Schritt "ordered" liegt hinter der Warteseite, und eine
     * Warteseite hat dieser Kunde nie gesehen.
     *
     * Ein eigener Schreibvorgang, NACH der Bestellung: Ein brandneues
     * Feld reist nie mit Daten, die ankommen muessen - hasOnly() weist
     * sonst das ganze Dokument ab, und das waere hier die Bestellung
     * selbst. */
    this.#merke({ shopKauf: true }, "shopKauf");
    this.korb = [];
    korbSchreiben(this.speicher, this.korb);
    this.#korbZeichnen();
    if (knopf) knopf.disabled = false;
    if (knopftext) knopftext.textContent = "Porositni";

    const trup = $("#shportatrup", this.dok);
    const danke = $("#shportafaleminderit", this.dok);
    const kodi = $("#shportakodi", this.dok);
    if (kodi && sitzung?.code) kodi.textContent = `Numri i porosisë: ${sitzung.code}`;
    if (trup) trup.hidden = true;
    if (danke) danke.hidden = false;
  }
}

function escape(text) {
  return String(text ?? "")
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

if (typeof document !== "undefined" && !globalThis.__LIFESKIN_TEST__) {
  const start = () => new Laden().starte();
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
}
