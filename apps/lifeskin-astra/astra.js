// Die Hauptanalyse: mnyra.com/analiza/<kennung>
//
// Sie gehoert dem Patienten. Er kommt direkt nach dem Scan hierher, sie
// hat eine eigene Adresse, er kann sie speichern und weiterschicken.
//
// VIER ZUSTAENDE:
//
//   laedt   - eine Zeile, solange der Befund unterwegs ist.
//   weg     - die Kennung gehoert zu keinem Fall.
//   prit    - Dr. Gashi hat den Fall noch nicht angesehen. Das ist der
//             Bildschirm, den fast jeder zuerst sieht.
//   fertig  - der Befund, der Plan, die Mittel, der Kauf.
//
// WAS HIER NICHT STEHT: die Anschrift und die Telefonnummer. Sie liegen
// in der Sitzung, die niemand ausser dem CEO-Konto lesen darf. Waeren sie
// im Befund, verschickte jeder, der seinen Link teilt, seine eigene
// Anschrift mit - und dieser Link wird geteilt, das ist sein Zweck.

import { reportAllowsOffer, GRADES } from "../../shared/lifeskin-raport-v3.js";
import { LIFESKIN_ANBIETER, LIFESKIN_TELEFON_VORWAHL, LIFESKIN_WHATSAPP,
  LIFESKIN_WHATSAPP_TEXT } from "../lifeskin/lifeskin-config.js";
import { STANDARD_KONFIG } from "../lifeskin/lifeskin-catalog.js";
import { Pixel } from "../lifeskin/lifeskin-pixel.js";
import { AnalyseDaten, kennungAusPfad } from "./astra-daten.js";
import { ikona, ikonenSetzen } from "./astra-ikona.js";
import { TEXTE, NDJEKJA, NDJEKJA_KONTAKT, PYETJET, t, fuelle } from "./astra-texte.js";

const $ = (auswahl) => document.querySelector(auswahl);
const SCHIRME = ["laedt", "weg", "prit", "fertig"];

// Was sich als Ganzes bewegt, und was darin nacheinander kommt.
//
// Der Kopf der Seite steht NICHT darin: Er ist beim Oeffnen im Bild, und
// was im Bild steht, wird nie versteckt.
// Welches Zeichen wofuer steht.
//
// AN EINER STELLE, nicht verstreut im Ablauf: Sonst steht derselbe Haken
// an drei Orten mit drei Namen, und wer eines austauscht, tauscht zwei.
// tests/lifeskin-astra-ikonen.test.mjs liest diese Tabelle und haelt jeden
// Namen gegen das Lucide-Paket.
const ZEICHEN = Object.freeze({
  // Was ein Mittel TUT - Ursache und Wirkung, deshalb ein Pfeil. Ein Haken
  // hiesse "ist enthalten" und gehoert zu einer Leistungsliste.
  wirkung: "arrow-right",
  // Und dort steht er dann auch.
  enthalten: "check",
  aufklapper: "plus",
  schrittFertig: "check",
  schrittLaeuft: "loader-circle",
  schrittOffen: "circle",
  bestelltErreicht: "circle-check",
  bestelltOffen: "circle"
});

const BLOECKE = "#an-fertig main > .section, #an-fertig .page-footer";

// Und darin bewegt sich JEDE Zeile, nicht nur ein paar ausgewaehlte.
//
// FLACH, NICHT GESCHACHTELT - das ist die einzige Regel, die diese Liste
// wirklich braucht: Keiner dieser Treffer darf einen anderen enthalten.
// Zwei geschachtelte Verstecke koennen einander ueberdauern, und dann
// steht der Angebotskasten da und der Preis darin fehlt. Genau dieser
// Fehler ist der frueheren Fassung einmal passiert; deshalb steht hier
// ".price-area" und nicht ".offer-card".
const ZEILEN = [
  // Der Kopf der Analyse
  ".section-meta", ".hero > h1", ".hero > .intro", ".hero > .reviewer",
  ".hero > .result-card", ".hero > .method-note", ".hero > .text-link",
  // Jeder Abschnittskopf
  ".section-heading", ".section > .note", ".routine > .note",
  // Befunde, Plan, Mittel
  ".finding-row", ".goal", ".product", ".routine-columns > div",
  // Das Angebot, Zeile fuer Zeile
  ".set-heading", ".set-items li", ".included li", ".price-area",
  ".offer-card > .primary-button", ".purchase-facts > span", ".guarantee",
  ".offer-section > .help-link",
  // Begleitung, Vollansicht, Fragen, Fuss
  ".timeline li", ".care-card", ".full-report > details", ".faq > details",
  ".page-footer > *"
].join(", ");

// Die Vorlage mit der frueheren Gestaltung. Sie liegt unter einer eigenen
// Adresse und wird von dort bedient; hier steht sie nur, damit niemand
// eine Kennung auf ihr sucht.
export const VORLAGEPFAD = "/analysetemplateastra";

// Zahlen so, wie sie in Kosovo und Albanien geschrieben werden: Komma
// statt Punkt, ganze Betraege ohne Nachkommastellen.
function zahl(wert) {
  const n = Number(wert);
  if (!Number.isFinite(n)) return "";
  return (Number.isInteger(n) ? String(n) : n.toFixed(2)).replace(".", ",");
}
function euro(wert) { return `${zahl(wert)} €`; }

function schreibe(knoten, text) {
  if (knoten && knoten.textContent !== text) knoten.textContent = text;
}

function zeigen(knoten, ja) {
  if (knoten) knoten.hidden = !ja;
}

// Ein Befundsatz beginnt im Modell klein ("poret e bllokuara në ballë").
// Als Ueberschrift gelesen sieht das nach Fehler aus - und ein Fehler
// oben auf der Seite faerbt alles darunter.
function grossAnfang(text) {
  const wort = String(text || "").trim();
  return wort ? wort[0].toLocaleUpperCase("sq") + wort.slice(1) : "";
}

function leer(knoten) {
  while (knoten && knoten.firstChild) knoten.removeChild(knoten.firstChild);
}

function element(name, klasse, text) {
  const el = document.createElement(name);
  if (klasse) el.className = klasse;
  if (text !== undefined) el.textContent = text;
  return el;
}

// Ein Zeichen vor den Text, nicht statt seiner. Jedes Zeichen hier steht
// neben einem Wort, das dasselbe sagt - es ist die schnelle Spur fuer den,
// der ueberfliegt, und nie die einzige.
function mitZeichen(el, name, klasse = "ikona") {
  const zeichen = ikona(name, klasse);
  if (zeichen) el.prepend(zeichen);
  return el;
}

// Der Aufklapper und sein Kreuz. Das Zeichen ist ein Plus; aufgeklappt
// dreht der Stil es um fuenfundvierzig Grad, und aus dem Plus wird ein
// Kreuz. Zwei Zeichen fuer denselben Knopf waeren zwei Zustaende, die
// auseinanderlaufen koennen.
function aufklapper(wort) {
  const summary = element("summary");
  summary.append(element("span", null, wort));
  const zeichen = ikona(ZEICHEN.aufklapper);
  if (zeichen) summary.append(zeichen);
  return summary;
}

// Die Statusleiste des Browsers mitfaerben.
//
// ZWEIMAL FALSCH GELEGEN, hier die belegte Fassung - sie steht so schon
// in der frueheren Fassung und ist der Grund, warum dort unten keine Naht
// stand.
//
// Erst hiess es "geht mit CSS allein". Nein: Die Flaeche, die der Browser
// unten und oben abliest, ist nicht die der Seite, sondern die des
// Wurzelelements.
//
// Dann hiess es "theme-color". Auch das traegt nicht allein: Die Marke
// wurde in iOS 26 fallengelassen beziehungsweise ist dort defekt
// (benfrain.com/ios26-safari-theme-color-tab-tinting-with-fixed-position-elements).
// Was iOS Safari dann WIRKLICH nimmt, ist die Hintergrundfarbe der Seite.
//
// Beide Wege werden gesetzt, weil verschiedene Fassungen verschiedene
// nehmen: die Marke fuer iOS 15 bis 18 und Android, die Flaeche von html
// fuer alles ab iOS 26.
//
// NUR html. Traegt auch body eine Flaeche, hat der Browser zwei Quellen
// und nimmt die falsche.
export function grundSetzen(grund) {
  document.documentElement.style.background = grund;
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", grund);
}

// Die Farbe AUS DEM STIL GELESEN, nicht hier noch einmal geschrieben.
//
// Zwei Quellen fuer dieselbe Farbe heisst: Irgendwann laufen sie
// auseinander, und niemand weiss warum. Genau so stand in der frueheren
// Fassung einmal eine hellgruene Statusleiste ueber einem dunkelgruenen
// Band, mit einer sichtbaren Naht dazwischen.
export function farbeAusStil(name, ersatz) {
  try {
    const wert = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    return wert || ersatz;
  } catch { return ersatz; }
}

// Wann Dr. Gashi antwortet - ehrlich, nicht erfunden.
//
// Vor achtzehn Uhr: heute. Danach: morgen frueh. Keine Warteschlange,
// keine Position. Wer nachts kommt und "noch 3 vor Ihnen" liest, weiss,
// dass es gelogen ist - und glaubt danach auch dem Befund nicht.
export function wartetext(stunde) {
  return stunde < 18 ? TEXTE.pritDauerSot : TEXTE.pritDauerNeser;
}

// Zu welcher Tageszeit ein Mittel gehoert.
//
// GELESEN, NICHT GERATEN: Die Angabe steht als freier Text am Produkt
// ("vetëm në mbrëmje", "mëngjes dhe mbrëmje"). Steht dort nichts
// Erkennbares, kommt das Mittel in KEINE Spalte - lieber eine kurze
// Routine als eine erfundene.
export function tageszeiten(koha) {
  const wort = String(koha || "").toLowerCase();
  return {
    morgens: wort.includes("mëngjes") || wort.includes("mengjes") || wort.includes("morgen"),
    abends: wort.includes("mbrëmje") || wort.includes("mbremje") || wort.includes("abend")
  };
}

export class Analiza {
  constructor({ fetchFn, ort, pixel } = {}) {
    this.ort = ort || globalThis.location;
    this.daten = null;
    this.produkte = [];
    this.sprache = "sq";
    this.quelle = new AnalyseDaten({ fetchFn, kennung: kennungAusPfad(this.ort?.pathname) });
    this.pixel = pixel || new Pixel();
  }

  get kennung() { return this.quelle.kennung; }
  get raport() { return this.daten?.raport || {}; }
  get preis() { return Number(this.daten?.preis) || STANDARD_KONFIG.setPreis; }

  text(schluessel, werte) {
    const roh = t(TEXTE[schluessel], this.sprache);
    return werte ? fuelle(roh, werte) : roh;
  }

  // Traegt dieser Befund ueberhaupt ein Angebot?
  //
  // Nein heisst: keine Angebotskarte, keine Kaufleiste, kein
  // Bestellblatt. Ein Befund, der eine aerztliche Abklaerung verlangt,
  // darf nicht mit einem Kaufknopf enden.
  get mitAngebot() {
    return reportAllowsOffer(this.raport) && this.produkte.length > 0;
  }

  get bestellt() {
    return ["bestellt", "versandt", "zugestellt"].includes(this.daten?.status);
  }

  async starte() {
    ikonenSetzen();
    schreibe($("#an-laedttext"), this.text("laedt"));
    this.#zeige("laedt");
    if (!this.kennung) { this.#wegZeigen(); return; }

    this.daten = await this.quelle.bericht();
    if (!this.daten) { this.#wegZeigen(); return; }

    this.sprache = this.daten.sprache === "de" ? "de" : "sq";
    // Und das Merkmal am Wurzelelement mit. Ohne diese Zeile stuende dort
    // weiter lang="sq", auch wenn der ganze Befund deutsch ist - ein
    // Vorleseprogramm sagte dann deutschen Text mit albanischer
    // Aussprache auf.
    if (document.documentElement) document.documentElement.lang = this.sprache;

    // Dass er seine Seite ueberhaupt geoeffnet hat, ist die erste Zahl,
    // die ueber diesen Weg entscheidet: Wer nach dem Scan nie ankommt,
    // ist auf dem Weg dorthin verloren gegangen - und dann liegt es nicht
    // am Befund.
    this.quelle.merken({ berichtGeoeffnet: true });
    if (this.pixel.starte()) this.pixel.melde("opened");

    this.#kopfZeichnen();
    this.#ereignisse();
    await this.#zeichnen();
    this.#horchen();
  }

  #zeige(name) {
    for (const schirm of SCHIRME) zeigen($(`#an-${schirm}`), schirm === name);
    zeigen($("#an-pyetjeknopf"), name === "fertig" || name === "prit");
  }

  async #zeichnen() {
    if (this.daten.status === "wartet") { this.#pritZeigen(); return; }
    this.produkte = await this.quelle.produkte(this.daten, this.sprache);
    this.#fertigZeigen();
  }

  // OHNE NEULADEN.
  //
  // Gefragt wird in Abstaenden, nicht gelauscht. Ein echter Horchkanal
  // brauchte das Firebase-Paket - rund 460 KB auf einer Seite, die in
  // Sekunden offen sein muss und oft im Fenster von Instagram laeuft.
  // Fuer eine Wartezeit von Stunden ist ein Blick alle zwoelf Sekunden
  // genauso gut und kostet nichts.
  //
  // Und nur, solange die Seite wirklich zu sehen ist: Ein Handy in der
  // Tasche fragt nicht. Kommt sie zurueck, wird sofort gefragt - das ist
  // der Moment, in dem jemand nachsieht, ob der Befund da ist.
  #horchen() {
    const nachsehen = async () => {
      if (document.visibilityState !== "visible" || this.bestellt) return;
      const vorher = this.daten?.status;
      const frisch = await this.quelle.bericht();
      if (!frisch || frisch.status === vorher) return;
      this.daten = frisch;
      await this.#zeichnen();
    };
    this.takt = setInterval(nachsehen, 12000);
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") nachsehen();
    });
  }

  // ---------- Kopf und Blaetter ----------

  #kopfZeichnen() {
    schreibe($("#an-masthead"), this.text("masthead"));
    schreibe($("#an-pyetje"), this.text("pyetje"));
    document.title = this.text("faqjaTitull");

    schreibe($("#an-ndihmatitel"), this.text("ndihmaTitel"));
    schreibe($("#an-ndihmatext"), this.text("ndihmaText"));
    schreibe($("#an-ndihmambyll"), this.text("ndihmaMbyll"));
    this.#whatsappSetzen();
  }

  // Der Weg zu einem Menschen. Ohne hinterlegte Nummer gibt es ihn
  // nicht - und dann steht hier auch kein Knopf, der ins Leere fuehrt.
  #whatsappSetzen() {
    const knopf = $("#an-whatsapp");
    if (!knopf) return;
    if (!LIFESKIN_WHATSAPP) { knopf.hidden = true; return; }
    const gruss = t(LIFESKIN_WHATSAPP_TEXT, this.sprache) || "";
    const code = this.daten?.code ? ` (${this.daten.code})` : "";
    knopf.href = `https://wa.me/${LIFESKIN_WHATSAPP}?text=${encodeURIComponent(gruss + code)}`;
    knopf.hidden = false;
    schreibe($("#an-whatsapptext"), this.text("ndihmaWhatsapp"));
  }

  #wegZeigen() {
    schreibe($("#an-wegtitel"), this.text("wegTitel"));
    schreibe($("#an-wegtext"), this.text("wegText"));
    this.#zeige("weg");
  }

  // ---------- Warten ----------

  #pritZeigen() {
    const name = String(this.daten.name || "").trim();
    schreibe($("#an-prittitel"), name
      ? this.text("pritTitel", { name })
      : this.text("pritTitelOhne"));
    schreibe($("#an-pritintro"), this.text("pritIntro"));
    schreibe($("#an-pritdauer"), t(wartetext(new Date().getHours()), this.sprache));

    const hapat = $("#an-prithapat");
    leer(hapat);
    // Drei erledigt, einer laeuft, einer offen - und nur der laufende
    // traegt Farbe. Wo der Fall gerade steht, ist die einzige Frage
    // dieses Bildschirms.
    const schritte = [
      ["pritHapi1", "erledigt", ZEICHEN.schrittFertig],
      ["pritHapi2", "erledigt", ZEICHEN.schrittFertig],
      ["pritHapi3", "laeuft", ZEICHEN.schrittLaeuft],
      ["pritHapi4", "offen", ZEICHEN.schrittOffen]
    ];
    for (const [schluessel, stand, zeichen] of schritte) {
      const li = element("li");
      li.dataset.stand = stand;
      li.append(mitZeichen(element("span", "step-mark"), zeichen), element("span", null, this.text(schluessel)));
      hapat?.append(li);
    }

    schreibe($("#an-pritnumrimarke"), this.text("pritNumri"));
    schreibe($("#an-pritnumri"), this.daten.code || "—");
    schreibe($("#an-pritfotomarke"), this.text("pritFotoMarke"));
    schreibe($("#an-pritfoto"), String(this.daten.photos || 3));
    schreibe($("#an-pritruaj"), this.text("pritRuaj"));

    const kopjo = $("#an-pritkopjo");
    schreibe($("#an-pritkopjotext"), this.text("pritKopjo"));
    if (kopjo && !this.kopierVerdrahtet) {
      this.kopierVerdrahtet = true;
      kopjo.addEventListener("click", () => this.#linkKopieren());
    }
    this.#zeige("prit");
  }

  async #linkKopieren() {
    const wort = $("#an-pritkopjotext");
    try {
      await navigator.clipboard.writeText(this.ort?.href || "");
    } catch {
      // In manchen App-Fenstern gibt es die Zwischenablage nicht. Ein
      // Knopf, der nichts tut, ist schlimmer als keiner - dann bleibt es
      // wenigstens beim alten Wort statt bei einer falschen Zusage.
      return;
    }
    schreibe(wort, this.text("pritKopjuar"));
    globalThis.setTimeout(() => schreibe(wort, this.text("pritKopjo")), 1600);
  }

  // ---------- Der fertige Befund ----------

  #fertigZeigen() {
    this.#hero();
    this.#gjetjet();
    this.#plan();
    this.#produkteZeichnen();
    this.#rutina();
    this.#angebot();
    this.#porosiaStatus();
    this.#ndjekja();
    this.#analizaPlote();
    this.#pyetjetZeichnen();
    this.#fuss();
    this.#zeige("fertig");
    this.#leiste();
    this.#navBeobachten();
    this.#einblenden();
  }

  // ---------- Bewegung ----------
  //
  // Sie ist hier kein Schmuck. Ein Befund, der als fertige Wand dasteht,
  // wird ueberflogen; einer, dessen Abschnitte beim Herunterkommen
  // erscheinen, wird gelesen - das Auge bleibt an dem haengen, was gerade
  // entsteht, und ueberspringt es nicht.
  //
  // Dieselben Kurven und dieselben Riegel wie in der frueheren Fassung.
  // Drei davon sind der ganze Grund, warum man das hier ueberhaupt wagen
  // darf:
  //
  //   1. ALLES BEGINNT SICHTBAR. Ohne "data-zeig" gilt im Stil keine
  //      einzige Regel dazu. Gesetzt wird das Merkmal erst hier, und zwar
  //      erst, wenn der Weg zum Wiedereinblenden wirklich eingerichtet
  //      ist. Faellt das Skript aus oder bricht es vorher ab, steht die
  //      ganze Analyse da.
  //   2. GERECHNET, NICHT BEOBACHTET. Ein IntersectionObserver meldet nur
  //      Wechsel: Springt die Seite in einem Satz ueber einen Abschnitt
  //      hinweg - was ein Telefon beim schnellen Wischen tut -, war er nie
  //      sichtbar, es gibt keinen Wechsel, und er bliebe versteckt.
  //   3. WAS SCHON IM BILD STEHT, WIRD NIE VERSTECKT. Der erste
  //      Bildschirm - Anrede, Ergebnis, Diagnose - steht sofort.
  //
  // Und was im Aufklapper liegt, bleibt ganz draussen: Zugeklappt kommt es
  // nie ins Bild, also bliebe es beim Aufklappen unsichtbar - und niemand
  // scrollt, wenn er gerade aufgeklappt hat.
  #einblenden() {
    if (this.einblendPruefen) { this.einblendPruefen(); return; }
    // Wer Bewegung abgeschaltet hat, bekommt keine - und zwar so, dass gar
    // nichts erst versteckt wird.
    if (globalThis.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches) return;

    const imAufklapper = (el) => {
      const kasten = el.closest("details");
      return Boolean(kasten) && kasten !== el;
    };
    // WAS BEIM OEFFNEN DASTEHT, WIRD NIE VERSTECKT.
    const imBild = (el) => el.getBoundingClientRect().top < window.innerHeight * 0.95;

    // UND HIER LAG DER GRUND, WARUM MAN DIE BEWEGUNG KAUM SAH.
    //
    // Diese Schwelle stand auf 1.02 - also KNAPP UNTERHALB des Bildrands.
    // Ein Abschnitt blendete damit ein, waehrend er noch gar nicht zu
    // sehen war; bis er hochgescrollt kam, war die Bewegung laengst
    // vorbei und er stand einfach da. Die Animation lief korrekt und
    // niemand hat sie je gesehen.
    //
    // Jetzt kommt er, wenn sein oberer Rand wirklich im Bild ist - ein
    // Zehntel der Hoehe von unten. Dort laeuft die Bewegung vor den
    // Augen ab, und genau dafuer ist sie da.
    const kommtGleich = (el) => el.getBoundingClientRect().top < window.innerHeight * 0.90;

    const alle = Array.from(document.querySelectorAll(BLOECKE))
      .filter((el) => !el.hidden && !imAufklapper(el));
    const bloecke = alle.filter((el) => !imBild(el));

    // Einzelne Zeilen in einem Abschnitt, der beim Oeffnen schon dastand.
    // Sie bewegen sich fuer sich, wenn sie an die Kante kommen - sonst
    // passiert im ersten Bildschirm nie etwas, obwohl man dort scrollt.
    const zeilen = [];
    for (const block of alle) {
      if (!imBild(block)) continue;
      for (const kind of block.querySelectorAll(ZEILEN)) {
        if (!imAufklapper(kind) && !imBild(kind)) zeilen.push(kind);
      }
    }
    for (const zeile of zeilen) zeile.dataset.zeile = "warte";

    if (!bloecke.length && !zeilen.length) return;

    // Innerhalb eines Abschnitts kommen die Zeilen nacheinander.
    // Nacheinander heisst: eine nach der anderen gelesen, nicht alle auf
    // einmal ueberflogen. Nach der sechsten bringt die Staffelung nichts
    // mehr und kostet nur Wartezeit.
    for (const block of bloecke) {
      Array.from(block.querySelectorAll(ZEILEN))
        .filter((kind) => !imAufklapper(kind))
        .forEach((kind, i) => {
          kind.dataset.nach = "ja";
          kind.style.setProperty("--nach", String(Math.min(i, 6)));
        });
    }
    for (const block of bloecke) block.dataset.zeig = "warte";

    // KEINE AUSNAHME FUER SCHNELLES SCROLLEN. Wer schnell wischt, sieht
    // die Bewegung angeschnitten; das ist mehr als keine.
    // OFFEN, NICHT ALLE. Was gekommen ist, faellt aus der Liste - sonst
    // vermisst jedes Scrollereignis bis zuletzt siebzig Knoten, und
    // getBoundingClientRect zwingt den Browser jedes Mal zum Neurechnen
    // des Layouts. Auf den langsamen Telefonen, fuer die diese Seite
    // gebaut ist, ist genau das der Ruckler.
    let offen = [
      ...bloecke.map((el) => ({ el, merkmal: "zeig" })),
      ...zeilen.map((el) => ({ el, merkmal: "zeile" }))
    ];
    const pruefen = () => {
      if (!offen.length) return;
      const bleibt = [];
      for (const eintrag of offen) {
        if (kommtGleich(eintrag.el)) eintrag.el.dataset[eintrag.merkmal] = "da";
        else bleibt.push(eintrag);
      }
      offen = bleibt;
    };
    // UND HOECHSTENS EINMAL JE BILD. Ein Scrollereignis kommt oefter als
    // der Bildschirm zeichnet; zweimal messen zwischen zwei Bildern
    // aendert nichts und kostet beide Male dasselbe.
    let geplant = false;
    const anstossen = () => {
      if (geplant || !offen.length) return;
      geplant = true;
      (globalThis.requestAnimationFrame || ((f) => globalThis.setTimeout(f, 16)))(() => {
        geplant = false;
        pruefen();
      });
    };
    this.einblendPruefen = pruefen;
    globalThis.addEventListener?.("scroll", anstossen, { passive: true });
    // Ein groesseres Fenster oder eine gedrehte Hand bringt Abschnitte ins
    // Bild, ohne dass jemand scrollt.
    globalThis.addEventListener?.("resize", anstossen, { passive: true });
    // Und der Aufklapper: Was er aufschiebt, schiebt alles darunter nach
    // unten - ohne diesen Anstoss blieben die verschobenen Abschnitte
    // stehen, bis jemand scrollt.
    for (const auf of document.querySelectorAll("#an-fertig details")) {
      auf.addEventListener("toggle", pruefen);
    }
    pruefen();
  }

  #hero() {
    schreibe($("#an-analizamarke"), this.text("analizaJuaj"));
    const kodi = $("#an-kodi");
    schreibe(kodi, this.daten.code ? this.text("numriMarke", { code: this.daten.code }) : "");
    zeigen(kodi, Boolean(this.daten.code));

    const name = String(this.daten.name || "").trim();
    schreibe($("#an-titel"), name ? this.text("heroTitel", { name }) : this.text("heroTitelOhne"));
    schreibe($("#an-intro"), this.text("heroIntro"));

    this.#urheber();

    schreibe($("#an-rezultatimarke"), this.text("rezultatiMarke"));
    const haupt = grossAnfang(this.raport.gjetjaKryesore);
    schreibe($("#an-gjetjakryesore"), haupt || grossAnfang(this.raport.diagnoza) || this.text("heroTitelOhne"));
    schreibe($("#an-permbledhjatext"), String(this.raport.gjetjet || this.daten.befund || "").trim());

    this.#diagnose();

    schreibe($("#an-hapimarke"), this.text("hapiRadhes"));
    // Was als Naechstes ansteht, haengt am Beurteilungsstatus und nicht
    // am Wunsch: Verlangt der Befund eine Abklaerung, ist der naechste
    // Schritt der Arzt und nicht das Set.
    schreibe($("#an-hapitext"), this.mitAngebot
      ? this.text("hapiRadhesPlan")
      : this.text("hapiRadhesKontroll"));

    schreibe($("#an-metodanote"), this.text("metodaNote"));
    schreibe($("#an-metodalink"), this.text("metodaLink"));
    schreibe($("#an-drejtplanit"), this.text("drejtPlanit"));
  }

  // Wer beurteilt hat - und nur, wenn wirklich jemand beurteilt hat.
  //
  // Ohne bestaetigte aerztliche Pruefung steht hier kein Arztname und
  // kein Portraet. Es faellt nicht weg, sondern sagt stattdessen, was
  // tatsaechlich passiert ist: eine Beurteilung mit KI-Unterstuetzung,
  // die keine aerztlich bestaetigte Diagnose ist.
  #urheber() {
    const ohnePruefung = this.raport.schemaVersion === 3 && !this.raport.aerztlichGeprueft;
    zeigen($("#an-arztbild"), !ohnePruefung);
    if (ohnePruefung) {
      schreibe($("#an-arztname"), this.text("aiTitel"));
      schreibe($("#an-arztrolle"), this.text("aiUnter"));
      return;
    }
    schreibe($("#an-arztname"), this.text("arztName"));
    const tag = this.#zeitLesbar(this.daten.freigabeAt || this.daten.createdAt).split(",")[0];
    schreibe($("#an-arztrolle"), tag
      ? this.text("arztRolleDatum", { rolle: this.text("arztRolle"), datum: tag })
      : this.text("arztRolle"));
  }

  #diagnose() {
    const kasten = $("#an-diagnoza");
    const emri = String(this.raport.diagnoza || "").trim();
    if (!emri) { zeigen(kasten, false); return; }
    zeigen(kasten, true);
    schreibe($("#an-diagnozamarke"), this.text("vleresimiOrientues"));
    schreibe($("#an-diagnozaemri"), emri);
    const lat = String(this.raport.diagnozaLat || "").trim();
    schreibe($("#an-diagnozalat"), lat);
    zeigen($("#an-diagnozalat"), Boolean(lat));
    // Der Schweregrad kommt aus dem Befund, nicht aus einer Umrechnung:
    // "niveliEmri" ist das Wort, das die Beurteilung selbst gewaehlt hat.
    const grada = String(this.raport.niveliEmri || GRADES[this.raport.niveli] || "").trim();
    schreibe($("#an-diagnozagrada"), grada);
    zeigen($("#an-diagnozagrada"), Boolean(grada));
  }

  // Die wenigen Beobachtungen, die die Empfehlung tragen.
  //
  // HOECHSTENS DREI. Zehn gleich starke Kennzahlen sagen nichts darueber,
  // was wichtig ist; die uebrigen stehen vollstaendig in der
  // aufklappbaren Vollanalyse, fuer den, der nachsieht.
  #gjetjet() {
    schreibe($("#an-gjetjetmarke"), this.text("gjetjetMarke"));
    schreibe($("#an-gjetjettitel"), this.text("gjetjetTitel"));
    schreibe($("#an-gjetjetnote"), this.text("gjetjetNote"));

    const kasten = $("#an-gjetjet");
    leer(kasten);
    const zeilen = this.#gjetjeZeilen();
    for (const [i, zeile] of zeilen.entries()) {
      const row = element("div", "finding-row");
      row.append(element("span", "number", String(i + 1).padStart(2, "0")));
      const leib = element("div");
      leib.append(element("h3", null, zeile.titel));
      if (zeile.text) leib.append(element("p", null, zeile.text));
      row.append(leib);
      if (zeile.marke) row.append(element("span", "tag", zeile.marke));
      kasten?.append(row);
    }
    zeigen($("#an-gjetjetsektion"), zeilen.length > 0);
  }

  #gjetjeZeilen() {
    const parametrat = Array.isArray(this.raport.parametrat) ? this.raport.parametrat : [];
    // Nur was wirklich eine Gefunden-Stufe traegt. "Nicht beurteilbar"
    // ist nicht dasselbe wie "unauffaellig", und keines von beiden
    // gehoert in eine Liste der wesentlichen Beobachtungen.
    const mitGjetje = parametrat
      .filter((p) => Number(p?.shkalla) > 0)
      .sort((a, b) => Number(b.shkalla) - Number(a.shkalla))
      .slice(0, 3)
      .map((p) => ({
        titel: String(p.thjeshte || p.emri || "").trim(),
        text: String(p.vlera || "").trim(),
        marke: String(p.grada || "").trim()
      }))
      .filter((z) => z.titel);
    if (mitGjetje.length) return mitGjetje;

    // Ein alter Befund ohne Parameterliste. Dann tragen die beiden
    // benannten Befunde die Zeilen - mehr steht nicht darin, und mehr
    // wird auch nicht behauptet.
    return [
      [this.raport.gjetjaKryesore, this.text("fokusiKryesor")],
      [this.raport.gjetjaDyta, ""]
    ]
      .map(([titel, marke]) => ({ titel: grossAnfang(titel), text: "", marke }))
      .filter((z) => z.titel);
  }

  #plan() {
    schreibe($("#an-planimarke"), this.text("planiMarke"));
    schreibe($("#an-planititel"), this.text("planiTitel"));
    schreibe($("#an-planiintro"), this.text("planiIntro"));
    schreibe($("#an-objektivimarke"), this.text("objektiviMarke"));
    // Das Pflegeziel aus dem Befund, wenn Dr. Gashi eines geschrieben
    // hat. Sonst der allgemeine Satz - und der verspricht nichts, was
    // ein Foto nicht hergibt.
    const ziel = String(this.raport.synimi28 || this.raport.keshilla || "").trim();
    schreibe($("#an-objektivitext"), ziel || this.text("objektiviStandard"));
    zeigen($("#plani"), this.produkte.length > 0);
  }

  #produkteZeichnen() {
    const liste = $("#an-produkte");
    leer(liste);
    // Welches Mittel das gesuchte ist, sagt der Befund ueber seine
    // stabile Kennung - NICHT die Listenposition. Wer nach Position
    // zuordnet, vertauscht die Rollen, sobald jemand ein Mittel
    // einfuegt, und niemandem faellt es auf.
    const kryesor = (Array.isArray(this.raport.nevojat) ? this.raport.nevojat : [])
      .find((n) => n?.roli === "kryesor")?.produkt_id || "";

    for (const [i, p] of this.produkte.entries()) {
      const karte = element("article", p.id === kryesor ? "product product-primary" : "product");

      const kopf = element("div", "product-heading");
      kopf.append(element("span", "product-index", String(i + 1).padStart(2, "0")));
      const namen = element("div");
      const rolle = (p.nenName || p.lloji || "").trim();
      if (rolle) namen.append(element("span", "eyebrow", rolle.toLocaleUpperCase(this.sprache)));
      namen.append(element("h3", null, p.name));
      kopf.append(namen);
      if (p.inhalt) kopf.append(element("span", "volume", p.inhalt));
      karte.append(kopf);

      if (p.synimi) karte.append(element("p", null, p.synimi));

      // Der persoenliche Satz. Er ist der einzige Teil der Karte, der nur
      // fuer diesen einen Fall geschrieben wurde - ohne ihn ist die
      // Karte ein Katalogeintrag.
      if (p.satz) {
        const warum = element("div", "product-why");
        warum.append(element("span", null, this.text("pseNePlan")));
        warum.append(element("p", null, p.satz));
        karte.append(warum);
      }

      const einzelheiten = this.#produktBlatt(p);
      if (einzelheiten) karte.append(einzelheiten);
      liste?.append(karte);
    }
  }

  #produktBlatt(p) {
    const bloecke = [];

    if (p.veprimi.length) {
      const block = element("div", "detail-block");
      block.append(element("span", null, this.text("veprimiMarke")));
      const ul = element("ul", "action-list");
      // Ein Pfeil, kein Haken: Die Zeilen sagen, was das Mittel TUT - das
      // ist Ursache und Wirkung. Ein Haken hiesse "ist enthalten" und
      // gehoerte zu einer Leistungsliste.
      for (const zeile of p.veprimi) ul.append(mitZeichen(element("li", null, zeile), ZEICHEN.wirkung));
      block.append(ul);
      bloecke.push(block);
    }

    if (p.perberesit.length) {
      const block = element("div", "detail-block");
      block.append(element("span", null, this.text("perberesitMarke")));
      for (const stoff of p.perberesit) {
        const zeile = element("p", "fact-line");
        zeile.append(element("b", null, [stoff.emri, stoff.sasia].filter(Boolean).join(" ")));
        if (stoff.roli) zeile.append(element("span", null, stoff.roli));
        block.append(zeile);
      }
      bloecke.push(block);
    }

    if (p.perdorimi && (p.perdorimi.si || p.perdorimi.koha)) {
      const block = element("div", "detail-block");
      const marke = p.perdorimi.hapi
        ? `${this.text("perdorimiMarke")} · ${this.text("perdorimiHapi", { hapi: p.perdorimi.hapi })}`
        : this.text("perdorimiMarke");
      block.append(element("span", null, marke));
      const kopf = [p.perdorimi.koha, p.perdorimi.sasia].filter(Boolean).join(" · ");
      if (kopf) block.append(element("p", "fact-line", kopf));
      if (p.perdorimi.si) block.append(element("p", null, p.perdorimi.si));
      // Was zu beachten ist, steht MIT und nicht hinter der Anwendung.
      // Eine Wechselwirkung, die man erst nach dem Kauf liest, ist keine
      // Warnung, sondern eine Fussnote.
      if (p.perdorimi.kujdes) {
        block.append(element("p", "fact-line", `${this.text("perdorimiKujdes")}: ${p.perdorimi.kujdes}`));
      }
      bloecke.push(block);
    }

    if (!bloecke.length) return null;
    const details = element("details");
    details.append(aufklapper(this.text("roliPerdorimi")));
    const leib = element("div", "details-body");
    for (const block of bloecke) leib.append(block);
    details.append(leib);
    return details;
  }

  #rutina() {
    schreibe($("#an-rutinamarke"), this.text("rutinaMarke"));
    schreibe($("#an-rutinatitel"), this.text("rutinaTitel"));
    schreibe($("#an-rutinamengjesmarke"), this.text("rutinaMengjes"));
    schreibe($("#an-rutinambremjemarke"), this.text("rutinaMbremje"));
    schreibe($("#an-rutinanote"), this.text("rutinaNote"));

    const nachSchritt = [...this.produkte]
      .filter((p) => p.perdorimi)
      .sort((a, b) => (a.perdorimi.hapi || 99) - (b.perdorimi.hapi || 99));
    const morgens = nachSchritt.filter((p) => tageszeiten(p.perdorimi.koha).morgens);
    const abends = nachSchritt.filter((p) => tageszeiten(p.perdorimi.koha).abends);

    const namen = (liste) => liste.map((p) => p.name).join(" → ") || this.text("rutinaBosh");
    schreibe($("#an-rutinamengjes"), namen(morgens));
    schreibe($("#an-rutinambremje"), namen(abends));
    // Ohne eine einzige hinterlegte Anwendung gibt es keine Reihenfolge,
    // die man zeigen koennte - dann steht der Block gar nicht da.
    zeigen($("#an-rutina"), nachSchritt.length > 0);
  }

  // ---------- Das Angebot ----------

  #angebot() {
    // Nach der Bestellung verschwindet es. Wer bezahlt hat, sucht sein
    // Paket und keinen zweiten Kaufknopf.
    const zeigenNun = this.mitAngebot && !this.bestellt;
    zeigen($("#paketa"), zeigenNun);
    if (!zeigenNun) return;

    schreibe($("#an-paketamarke"), this.text("paketaMarke"));
    schreibe($("#an-paketatitel"), this.text("paketaTitel"));
    schreibe($("#an-paketaintro"), this.text("paketaIntro"));
    schreibe($("#an-setimarke"), this.text("setiMarke"));
    schreibe($("#an-setititel"), this.text("setiTitel"));
    schreibe($("#an-setinumri"), this.text("setiNumri", { anzahl: this.produkte.length }));

    const items = $("#an-setitems");
    leer(items);
    for (const p of this.produkte) {
      const li = element("li");
      li.append(element("span", null, p.name), element("span", null, p.inhalt || ""));
      items?.append(li);
    }

    const perfshi = $("#an-perfshihet");
    leer(perfshi);
    for (const schluessel of ["perfshiPlan", "perfshiMbeshtetje", "perfshiRishikim"]) {
      perfshi?.append(mitZeichen(element("li", null, this.text(schluessel)), ZEICHEN.enthalten));
    }

    schreibe($("#an-cmimimarke"), this.text("cmimiMarke"));
    schreibe($("#an-pagesanjehere"), this.text("pagesaNjehere"));
    schreibe($("#an-pagesakur"), this.text("pagesaKurMerrni"));
    schreibe($("#an-vazhdo"), this.text("vazhdo"));
    schreibe($("#an-faktdergesamarke"), this.text("faktDergesa"));
    schreibe($("#an-fakttransportimarke"), this.text("faktTransporti"));
    schreibe($("#an-faktfalas"), this.text("faktFalas"));
    schreibe($("#an-faktparapagim"), this.text("faktPaParapagim"));
    schreibe($("#an-pyetjeparavendimit"), this.text("pyetjeParaVendimit"));

    this.#preise();
    this.#garantie();
  }

  // Jede Angabe aus der Konfiguration, keine hier noch einmal
  // geschrieben. Zwei Quellen fuer dieselbe Zahl heisst: Irgendwann
  // laufen sie auseinander, und niemand weiss warum.
  #preise() {
    for (const knoten of document.querySelectorAll("[data-price]")) schreibe(knoten, euro(this.preis));
    const [von, bis] = STANDARD_KONFIG.lieferzeitTage;
    for (const knoten of document.querySelectorAll("[data-delivery]")) {
      schreibe(knoten, this.text("faktDite", { von, bis }));
    }
  }

  // Die Garantie. Sie steht nur da, wenn es sie gibt - eine Frist von
  // null Tagen als "Garantie" zu beschriften waere die teuerste Zeile
  // der Seite.
  #garantie() {
    const tage = Number(STANDARD_KONFIG.rueckgabeTage) || 0;
    zeigen($("#an-garancia"), tage > 0);
    if (!tage) return;
    schreibe($("#an-garanciatitel"), this.text("garanciaTitel", { tage }));
    schreibe($("#an-garanciatext"), this.text("garanciaText", { tage }));
  }

  // Was nach der Bestellung an der Stelle des Angebots steht.
  #porosiaStatus() {
    const kasten = $("#an-porosiastatus");
    zeigen(kasten, this.bestellt);
    if (!this.bestellt) return;

    schreibe($("#an-statusmarke"), this.text("statusMarke"));
    schreibe($("#an-statustitel"), this.text("dankeTitel"));

    const hapat = $("#an-statushapat");
    leer(hapat);
    const stand = this.daten.status;
    const reihe = [
      ["statusPranuar", ["bestellt", "versandt", "zugestellt"]],
      ["statusNisur", ["versandt", "zugestellt"]],
      ["statusDorezuar", ["zugestellt"]]
    ];
    for (const [schluessel, wann] of reihe) {
      const erreicht = wann.includes(stand);
      const li = element("li");
      li.dataset.stand = erreicht ? "erledigt" : "offen";
      li.append(mitZeichen(element("span"), erreicht ? ZEICHEN.bestelltErreicht : ZEICHEN.bestelltOffen));
      const leib = element("div");
      leib.append(element("h3", null, this.text(schluessel)));
      li.append(leib);
      hapat?.append(li);
    }
    const [von, bis] = STANDARD_KONFIG.lieferzeitTage;
    schreibe($("#an-statusnote"), `${this.text("statusPritet", { von, bis })} · ${this.text("statusTeDera", { preis: zahl(this.preis) })}`);
  }

  #ndjekja() {
    schreibe($("#an-ndjekjamarke"), this.text("ndjekjaMarke"));
    schreibe($("#an-ndjekjatitel"), this.text("ndjekjaTitel"));
    schreibe($("#an-ndjekjaintro"), this.text("ndjekjaIntro"));
    const hapat = $("#an-ndjekjahapat");
    leer(hapat);
    for (const schritt of NDJEKJA) {
      const li = element("li");
      li.append(element("span", null, t(schritt.marke, this.sprache)));
      const leib = element("div");
      leib.append(element("h3", null, t(schritt.titel, this.sprache)));
      leib.append(element("p", null, t(schritt.text, this.sprache)));
      li.append(leib);
      hapat?.append(li);
    }
    schreibe($("#an-kontakttitel"), t(NDJEKJA_KONTAKT.titel, this.sprache));
    schreibe($("#an-kontakttext"), t(NDJEKJA_KONTAKT.text, this.sprache));
    schreibe($("#an-kontaktknopf"), t(NDJEKJA_KONTAKT.knopf, this.sprache));
  }

  // ---------- Die vollstaendige Analyse ----------
  //
  // Was oben in drei Zeilen steht, steht hier ganz. Ein Aufklapper ist
  // kein Versteck: Er ist die Stelle, an der jemand, der es wissen will,
  // alles findet - ohne dass alle anderen es lesen muessen.

  #analizaPlote() {
    schreibe($("#an-plotemarke"), this.text("ploteMarke"));
    schreibe($("#an-plotetitel"), this.text("ploteTitel"));
    schreibe($("#an-ploteintro"), this.text("ploteIntro"));

    this.#zonat();
    this.#kuptimi();
    this.#parametrat();
    this.#termat();

    const ekz = String(this.raport.ekzaminimi || "").trim();
    schreibe($("#an-ekzaminimimarke"), this.text("ekzaminimiAuf"));
    schreibe($("#an-ekzaminimi"), ekz);
    zeigen($("#an-ekzaminimiblock"), Boolean(ekz));

    // Die Grenze der Methode. IMMER, bei jedem Befund, wortgleich.
    schreibe($("#an-kufijtemarke"), this.text("kufijteAuf"));
    schreibe($("#an-kufijtetext"), this.text("kufijteText"));

    this.#paKujdes();
  }

  #zonat() {
    const liste = Array.isArray(this.raport.zonaLista) ? this.raport.zonaLista : [];
    schreibe($("#an-zonatmarke"), this.text("zonatAuf"));
    const kasten = $("#an-zonat");
    leer(kasten);
    for (const zone of liste) {
      const paar = element("div");
      paar.append(element("dt", null, String(zone?.zona || "").trim()));
      paar.append(element("dd", null, String(zone?.teksti || "").trim()));
      kasten?.append(paar);
    }
    zeigen($("#an-zonatblock"), liste.length > 0);
  }

  #kuptimi() {
    const absaetze = (Array.isArray(this.raport.shpjegimi) ? this.raport.shpjegimi : [])
      .map((s) => String(s || "").trim()).filter(Boolean);
    schreibe($("#an-kuptimimarke"), this.text("kuptimiAuf"));
    const kasten = $("#an-kuptimi");
    leer(kasten);
    for (const absatz of absaetze) kasten?.append(element("p", null, absatz));
    zeigen($("#an-kuptimiblock"), absaetze.length > 0);
  }

  // ALLE Parameter, auch die ohne Befund.
  //
  // "Nicht beurteilbar", "unauffaellig" und "nicht vorhanden" sind drei
  // verschiedene Aussagen. Wer nur die auffaelligen zeigt, laesst die
  // Liste wie eine Mangelliste aussehen - und verschweigt, dass zehn
  // Dinge angesehen wurden und acht davon in Ordnung waren.
  #parametrat() {
    const liste = Array.isArray(this.raport.parametrat) ? this.raport.parametrat : [];
    schreibe($("#an-parametratmarke"), this.text("parametratAuf"));
    const kasten = $("#an-parametrat");
    leer(kasten);
    for (const p of liste) {
      const paar = element("div");
      paar.append(element("dt", null, String(p?.emri || p?.thjeshte || "").trim()));
      const wert = [String(p?.vlera || "").trim(), String(p?.grada || "").trim()]
        .filter(Boolean).join(" · ");
      paar.append(element("dd", null, wert));
      kasten?.append(paar);
    }
    const gezaehlt = Number(this.raport.parametratVleresuar) || liste.length;
    schreibe($("#an-parametratnote"), this.text("parametratNote", { anzahl: gezaehlt }));
    zeigen($("#an-parametratblock"), liste.length > 0);
  }

  #termat() {
    const liste = (Array.isArray(this.raport.termat) ? this.raport.termat : [])
      .filter((x) => x && x.shprehja && x.shpjegimi);
    schreibe($("#an-termatmarke"), this.text("termatAuf"));
    const kasten = $("#an-termat");
    leer(kasten);
    for (const term of liste) {
      const dl = element("dl", "zone-list");
      const paar = element("div");
      paar.append(element("dt", null, String(term.emri || term.shprehja).trim()));
      const dd = element("dd");
      dd.append(element("p", null, String(term.shpjegimi).trim()));
      const teJu = String(term.te_ju || "").trim();
      if (teJu) dd.append(element("p", "fact-line", `${this.text("termatTeJu")}: ${teJu}`));
      paar.append(dd);
      dl.append(paar);
      kasten?.append(dl);
    }
    zeigen($("#an-termatblock"), liste.length > 0);
  }

  // Der Verlauf ohne Pflege - und NUR, was fachlich begruendet ist.
  //
  // Keine Angstkurve, kein vorhergesagter Schaden durch Nichtkauf. Was
  // von selbst zurueckgeht, steht zuerst; das ist die Zeile, die am
  // meisten kostet und am meisten traegt.
  #paKujdes() {
    const daten = this.raport.paKujdes || {};
    const zeilen = [
      ["paKujdesZbehet", daten.zbehet],
      ["paKujdesNuk", daten.nukZbehet],
      ["paKujdesPas6", daten.pas6Muajsh]
    ].filter(([, text]) => String(text || "").trim());
    schreibe($("#an-pakujdesmarke"), this.text("paKujdesAuf"));
    const kasten = $("#an-pakujdes");
    leer(kasten);
    for (const [schluessel, text] of zeilen) {
      const block = element("div", "detail-block");
      block.append(element("span", null, this.text(schluessel)));
      block.append(element("p", null, String(text).trim()));
      kasten?.append(block);
    }
    zeigen($("#an-pakujdesblock"), zeilen.length > 0);
  }

  #pyetjetZeichnen() {
    schreibe($("#an-pyetjetmarke"), this.text("pyetjetMarke"));
    schreibe($("#an-pyetjettitel"), this.text("pyetjetTitel"));
    const kasten = $("#an-pyetjet");
    leer(kasten);
    const [von, bis] = STANDARD_KONFIG.lieferzeitTage;
    for (const eintrag of PYETJET) {
      const details = element("details");
      details.append(aufklapper(t(eintrag.pyetja, this.sprache)));
      const leib = element("div", "details-body");
      leib.append(element("p", null, fuelle(t(eintrag.pergjigja, this.sprache), {
        preis: zahl(this.preis), von, bis
      })));
      details.append(leib);
      kasten?.append(details);
    }
  }

  #fuss() {
    schreibe($("#an-slogan"), this.text("fusnotaSlogan"));
    schreibe($("#an-haftung"), this.text("haftung"));
    schreibe($("#an-kontaktfus"), this.text("kontakt"));
    // LEER BEDEUTET AUS: Was in der Konfiguration nicht steht, steht auch
    // nicht auf der Seite. Es wird kein Firmenname und keine Anschrift
    // erfunden.
    const teile = [LIFESKIN_ANBIETER.name, LIFESKIN_ANBIETER.anschrift, LIFESKIN_ANBIETER.email]
      .map((x) => String(x || "").trim()).filter(Boolean);
    const knoten = $("#an-anbieter");
    schreibe(knoten, teile.length ? `${this.text("anbieterMarke")}: ${teile.join(" · ")}` : "");
    zeigen(knoten, teile.length > 0);
  }

  // ---------- Die Kaufleiste ----------
  //
  // Sie erscheint erst, NACHDEM der Angebotsknopf einmal im Bild war -
  // und verschwindet, solange er es ist. Eine Leiste, die von Anfang an
  // klebt, wirbt fuer etwas, das der Leser noch nicht gesehen hat.
  #leiste() {
    const leiste = $("#an-leiste");
    const knopf = document.querySelector("#paketa [data-order]");
    // OHNE ANGEBOT GAR NICHT DA. Das ist ein anderer Zustand als
    // "noch nicht gekommen": Ein Befund ohne Angebot hat keine Leiste,
    // die spaeter einfahren koennte.
    if (!leiste || !knopf || !this.mitAngebot || this.bestellt) {
      zeigen(leiste, false);
      return;
    }
    schreibe($("#an-leistemarke"), this.text("setiTitel"));
    schreibe($("#an-leisteunter"), `· ${this.text("faktTransporti")} ${this.text("faktFalas")}`);
    schreibe($("#an-leisteknopf"), this.text("vazhdo"));
    leiste.hidden = false;
    if (!leiste.dataset.stufe) leiste.dataset.stufe = "aus";

    if (this.leistePruefen) { this.leistePruefen(); return; }

    // GERECHNET, NICHT BEOBACHTET.
    //
    // Ein IntersectionObserver meldet nur Wechsel. Springt die Seite in
    // einem Satz ueber den Kaufknopf hinweg - genau das, was ein Telefon
    // beim schnellen Wischen tut -, gibt es keinen Wechsel, und die
    // Leiste bliebe aus oder haengt an. Bei jedem Scrollen einmal
    // nachrechnen kennt diesen Fall nicht.
    //
    // SIE KOMMT ERST, WENN DER KNOPF IM ANGEBOT VORBEI IST. Nicht davor:
    // Wer beim ersten Satz einen Kaufknopf am Rand sieht, liest ab da
    // nicht mehr "was ist mit meiner Haut", sondern sucht, wo die 53 €
    // begruendet werden. Und nicht gleichzeitig: zwei Kaufknoepfe
    // nebeneinander sind einer zu viel.
    const pruefen = () => {
      const kasten = knopf.getBoundingClientRect();
      const vorbei = kasten.bottom <= 0;
      const stufe = vorbei && !this.bestellt ? "an" : "aus";
      if (leiste.dataset.stufe !== stufe) leiste.dataset.stufe = stufe;
    };
    this.leistePruefen = pruefen;
    globalThis.addEventListener?.("scroll", pruefen, { passive: true });
    globalThis.addEventListener?.("resize", pruefen, { passive: true });
    pruefen();
  }

  #navBeobachten() {
    if (this.navVerdrahtet || typeof IntersectionObserver !== "function") return;
    this.navVerdrahtet = true;
    const beobachter = new IntersectionObserver((eintraege) => {
      for (const eintrag of eintraege) {
        if (!eintrag.isIntersecting) continue;
        for (const link of document.querySelectorAll(".contents nav a")) {
          if (link.hash === `#${eintrag.target.id}`) link.setAttribute("aria-current", "location");
          else link.removeAttribute("aria-current");
        }
      }
    }, { rootMargin: "-10% 0px -65% 0px", threshold: 0 });
    for (const id of ["rezultati", "plani", "paketa", "ndjekja", "analiza-plote"]) {
      const abschnitt = document.getElementById(id);
      if (abschnitt) beobachter.observe(abschnitt);
    }
  }

  // ---------- Ereignisse ----------

  #ereignisse() {
    if (this.verdrahtet) return;
    this.verdrahtet = true;

    for (const knopf of document.querySelectorAll("[data-order]")) {
      knopf.addEventListener("click", () => this.#bestellblatt(true));
    }
    for (const knopf of document.querySelectorAll("[data-help]")) {
      knopf.addEventListener("click", () => this.#blatt($("#an-ndihma"), knopf));
    }
    for (const knopf of document.querySelectorAll("[data-close]")) {
      knopf.addEventListener("click", () => knopf.closest("dialog")?.close());
    }
    for (const blatt of [$("#an-porosia"), $("#an-ndihma")]) {
      if (!blatt) continue;
      blatt.addEventListener("close", () => {
        document.body.style.overflow = "";
        this.zurueck?.focus({ preventScroll: true });
      });
      // Ein Klick NEBEN das Blatt schliesst es. Gemessen am Rechteck und
      // nicht am Ziel: Ein Klick auf ein Kind des Dialogs meldet sonst
      // denselben Treffer wie einer daneben.
      blatt.addEventListener("click", (ereignis) => {
        if (ereignis.target !== blatt) return;
        const kasten = blatt.getBoundingClientRect();
        const daneben = ereignis.clientX < kasten.left || ereignis.clientX > kasten.right
          || ereignis.clientY < kasten.top || ereignis.clientY > kasten.bottom;
        if (daneben) blatt.close();
      });
    }

    $("#an-form")?.addEventListener("submit", (ereignis) => {
      ereignis.preventDefault();
      this.#bestellen();
    });

    // Der Methodenlink oeffnet den zugehoerigen Aufklapper. Ein Sprung
    // auf ein zugeklapptes Blatt sieht aus, als sei nichts passiert.
    const kufijte = $("#kufijte");
    for (const link of document.querySelectorAll('a[href="#kufijte"]')) {
      link.addEventListener("click", () => { if (kufijte) kufijte.open = true; });
    }
    if (this.ort?.hash === "#kufijte" && kufijte) kufijte.open = true;
  }

  #blatt(dialog, ausloeser) {
    if (!dialog) return;
    this.zurueck = ausloeser || null;
    dialog.showModal();
    document.body.style.overflow = "hidden";
  }

  #bestellblatt(auf) {
    const dialog = $("#an-porosia");
    if (!dialog || !this.mitAngebot || this.bestellt) return;
    if (!auf) { dialog.close(); return; }

    schreibe($("#an-porosiamarke"), this.text("porosiaMarke"));
    schreibe($("#an-porosiatitel"), this.text("porosiaTitel"));
    schreibe($("#an-porosiaintro"), this.text("porosiaIntro"));
    schreibe($("#an-porosiaprodukte"), this.produkte.map((p) => p.name).join(" · "));
    schreibe($("#an-porosiazahlung"), this.text("porosiaZahlung"));
    schreibe($("#an-emrimarke"), this.text("porosiaEmri"));
    schreibe($("#an-telefonmarke"), this.text("porosiaTelefon"));
    schreibe($("#an-adresamarke"), this.text("porosiaAdresa"));
    schreibe($("#an-qytetimarke"), this.text("porosiaQyteti"));
    schreibe($("#an-sendentext"), this.text("porosiaKonfirmo"));
    schreibe($("#an-porosianote"), this.text("porosiaIntro"));
    schreibe($("#an-danketitel"), this.text("dankeTitel"));
    schreibe($("#an-danketext"), this.text("dankeText"));
    schreibe($("#an-dankeknopf"), this.text("dankeKthehu"));
    zeigen($("#an-porosiaform"), true);
    zeigen($("#an-danke"), false);
    zeigen($("#an-fehler"), false);

    // Den Namen kennen wir schon. Ein Feld, das niemand noch einmal
    // tippen muss, ist ein Feld weniger zum Abbrechen.
    const name = $("#an-emri");
    if (name && !name.value) name.value = this.daten.name || "";
    // Die Landesvorwahl nur, wenn die Kampagne ein Land bedient. Ein
    // falsches "+383" vor einer albanischen Nummer ist schlimmer als gar
    // keines.
    const tel = $("#an-telefon");
    if (tel && !tel.value && LIFESKIN_TELEFON_VORWAHL) tel.value = LIFESKIN_TELEFON_VORWAHL;

    this.#blatt(dialog, document.activeElement);
  }

  async #bestellen() {
    const werte = {
      name: $("#an-emri")?.value.trim() || "",
      telefon: $("#an-telefon")?.value.trim() || "",
      strasse: $("#an-adresa")?.value.trim() || "",
      ort: $("#an-qyteti")?.value.trim() || ""
    };
    const fehler = $("#an-fehler");
    if (!werte.name || !werte.telefon || !werte.strasse || !werte.ort) {
      schreibe(fehler, this.text("porosiaPflicht"));
      zeigen(fehler, true);
      return;
    }
    zeigen(fehler, false);

    const knopf = $("#an-senden");
    const knopftext = $("#an-sendentext");
    if (knopf) knopf.disabled = true;
    schreibe(knopftext, this.text("porosiaDergohet"));

    const jetzt = new Date().toISOString();
    // ZUERST die Anschrift in die Sitzung - sie darf niemand ausser dem
    // CEO-Konto lesen. Der Befund ist oeffentlich; eine Anschrift darin
    // waere in dem Moment offen, in dem jemand seinen Link weitergibt.
    const gespeichert = await this.quelle.merken({
      address: werte,
      phone: werte.telefon,
      order: {
        total: this.preis,
        payment: "nachnahme",
        status: "neu",
        orderId: this.daten.code || this.kennung
      },
      step: "ordered"
    });

    // Und dann der Zustand im Befund - der Teil, den er selbst sieht.
    const ok = await this.quelle.zustandSchreiben({ status: "bestellt", bestelltAt: jetzt });

    if (!ok && gespeichert === undefined) {
      schreibe(fehler, this.text("porosiaFehler"));
      zeigen(fehler, true);
      if (knopf) knopf.disabled = false;
      schreibe(knopftext, this.text("porosiaKonfirmo"));
      return;
    }

    this.pixel.melde("ordered", { order: { total: this.preis, orderId: this.daten.code } });
    this.daten.status = "bestellt";
    this.daten.bestelltAt = jetzt;
    if (knopf) knopf.disabled = false;
    schreibe(knopftext, this.text("porosiaKonfirmo"));
    // Die Bestaetigung steht im Blatt, in dem gerade getippt wurde - und
    // erst NACHDEM der Server geantwortet hat. Eine Erfolgsmeldung allein
    // aus einem Knopfdruck ist eine Behauptung.
    zeigen($("#an-porosiaform"), false);
    zeigen($("#an-danke"), true);
    $("#an-dankeknopf")?.focus();
    this.#fertigZeigen();
  }

  #zeitLesbar(iso) {
    if (!iso) return "";
    const zeit = new Date(iso);
    if (Number.isNaN(zeit.getTime())) return "";
    try {
      return zeit.toLocaleDateString(this.sprache === "de" ? "de-DE" : "sq-AL",
        { day: "numeric", month: "long", year: "numeric" });
    } catch {
      return zeit.toISOString().slice(0, 10);
    }
  }
}

async function start() {
  await new Analiza().starte();
  // Erst jetzt: Vorher kann der Stil noch nicht gelesen werden.
  grundSetzen(farbeAusStil("--paper", "#f8f7f3"));
}

if (typeof document !== "undefined" && !globalThis.__LIFESKIN_TEST__) {
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
}
