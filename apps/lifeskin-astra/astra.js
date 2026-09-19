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

import { telefonPruefen } from "../../shared/lifeskin-telefon.js";
import { GRADES, brauchtAbklaerung } from "../../shared/lifeskin-raport-v3.js";
import { LIFESKIN_ANBIETER, LIFESKIN_TELEFON_VORWAHL, LIFESKIN_WHATSAPP,
  LIFESKIN_WHATSAPP_TEXT } from "../lifeskin/lifeskin-config.js";
import { STANDARD_KONFIG, tagespreis } from "../lifeskin/lifeskin-catalog.js";
import { Pixel } from "../lifeskin/lifeskin-pixel.js";
import { AnalyseDaten, kennungAusPfad } from "./astra-daten.js";
import { ikona, ikonenSetzen } from "./astra-ikona.js";
import { TEXTE, NDJEKJA, PYETJET, t, fuelle } from "./astra-texte.js";
import { standardText } from "./astra-texte-plan.js";

const $ = (auswahl) => document.querySelector(auswahl);
// Die Bestellung ist einer davon und kein Blatt ueber der Seite:
// Vier Felder und die Tastatur des Telefons passen in kein Blatt am
// unteren Rand.
const SCHIRME = ["laedt", "weg", "prit", "fertig", "porosia"];

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
  bestelltErreicht: "circle-check",
  bestelltOffen: "circle"
});

// WAS ALS GANZES WARTET - UND WARUM DER FUSS NICHT DAZUGEHOERT.
//
// GEMESSEN, NICHT GESCHAETZT: Er stand hier, und das war der Grund,
// warum ganz unten der ganze Bildschirm sprang.
//
// Eine Verschiebung nach unten aendert das Layout nicht, aber sie
// ERZEUGT UEBERLAUF - und Ueberlauf verlaengert den Rollbereich. Der
// Fuss ist das letzte Element der Seite; um 44 Punkte nach unten
// geschoben, war die Seite 44 Punkte laenger. Sobald er einblendete,
// schrumpfte sie wieder, der Browser musste die Rollposition
// zurechtruecken - und wer gerade ganz unten stand, dem sprang die
// ganze Seite unter den Fingern weg.
//
// Seine Zeilen bewegen sich weiter. Sie liegen ueber 125 Punkten
// Polster, das ohnehin fuer die Kaufleiste da ist; dort hinein passt
// jede Verschiebung, ohne dass die Seite waechst.
// tests/lifeskin-astra-live.test.mjs haelt das fest.
const BLOECKE = "#an-fertig main > .section";

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
  ".hero > h1", ".hero > .intro", ".hero > .reviewer",
  ".hero > .result-card", ".hero > .method-note", ".hero > .text-link",
  // Jeder Abschnittskopf
  ".section-heading", ".section > .note",
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

  // JEDER SATZ DIESER SEITE IST EINZELN ERSETZBAR.
  //
  // Im Befund kann zu jedem Schluessel ein eigener Text liegen - geschrieben
  // in Heart, fuer diesen einen Fall. Steht dort nichts, gilt der Text der
  // Seite. Das ist die EINZIGE Stelle, an der entschieden wird: Wer sie
  // umgeht und irgendwo t(TEXTE.x) schreibt, baut einen Satz ein, der sich
  // nicht mehr aendern laesst - und es faellt niemandem auf, bis jemand ihn
  // vergeblich sucht.
  text(schluessel, werte) {
    const eigen = this.daten?.texte?.[schluessel];
    const roh = typeof eigen === "string" && eigen.trim()
      ? eigen.trim()
      : (TEXTE[schluessel] ? t(TEXTE[schluessel], this.sprache) : standardText(schluessel, this.sprache));
    return werte ? fuelle(roh, werte) : roh;
  }

  // Traegt dieser Befund ein Angebot? Genau dann, wenn Mittel
  // freigegeben wurden.
  //
  // Hier stand zusaetzlich reportAllowsOffer(): Zwei Bedingungen aus der
  // Modellantwort konnten die freigegebenen Mittel wieder wegnehmen -
  // dann standen sie im Bericht und nicht auf der Seite. Was freigegeben
  // ist, wird gezeigt; die Entscheidung faellt in Heart.
  get mitAngebot() {
    return this.produkte.length > 0;
  }

  // Sagt die Analyse, dass sie nicht beurteilbar ist oder eine
  // aerztliche Abklaerung verlangt? Das sperrt nichts - aber es steht
  // weiter auf der Seite. Eine Aussage wegnehmen und eine Sperre
  // wegnehmen sind zwei verschiedene Dinge.
  get abklaerung() {
    return brauchtAbklaerung(this.raport);
  }

  get bestellt() {
    return ["bestellt", "versandt", "zugestellt"].includes(this.daten?.status);
  }

  async starte() {
    ikonenSetzen();
    schreibe($("#an-kopftitel"), this.text("analizaJuaj"));
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

    // Die Bitte fuer das quer gehaltene Telefon steht fest im Aufbau, damit
    // sie ohne JavaScript da ist. Ist der Befund deutsch, wird sie hier
    // umgeschrieben - sonst stuende auf einer deutschen Seite ein
    // albanischer Satz.
    schreibe($("#an-quertitel"), this.text("querTitel"));
    schreibe($("#an-quertext"), this.text("querText"));

    // HIER WIRD NICHTS MEHR ALS "BEFUND GELESEN" GEZAEHLT.
    //
    // An dieser Stelle stand berichtGeoeffnet - gesetzt, sobald die Seite
    // unter /analiza/ geladen war. Das ist aber fast immer die WARTESEITE:
    // Der Patient kommt unmittelbar nach dem Scan hier an, und der Befund
    // existiert zu diesem Zeitpunkt noch gar nicht. Die Zahl zaehlte also
    // jeden Ankommenden als jemanden, der seinen Befund gelesen hat - und
    // verdeckte damit genau die Luecke, um die es geht: 32 kamen an, 13
    // haben ihren Befund je gesehen.
    //
    // Welche der beiden Marken faellt, entscheidet jetzt #zeige(): "prit"
    // setzt warteseiteGeoeffnet, "fertig" setzt berichtGeoeffnet. Erst der
    // freigegebene Befund zaehlt als gelesen.
    //
    // In der Vorschau wird nichts gezaehlt: Ein eigener Blick auf die Seite
    // ist kein Patient, der sie geoeffnet hat.
    if (!this.nurVorschau && this.pixel.starte()) this.pixel.melde("opened");

    this.#kopfZeichnen();
    this.#ereignisse();
    await this.#zeichnen();
    this.#horchen();
  }

  #zeige(name) {
    for (const schirm of SCHIRME) zeigen($(`#an-${schirm}`), schirm === name);
    // JEDER BILDSCHIRM ZAEHLT, SOBALD ER DA IST - und zwar als der, der
    // er ist. Die Warteseite ist kein Befund; ein Befund ist erst da,
    // wenn Dr. Gashi ihn freigegeben hat. Zwei Marken, nicht eine.
    //
    // #markeSetzen schreibt jede Marke nur einmal je Sitzung und nimmt die
    // Vorschau aus, also darf das hier bei jedem Wechsel stehen.
    if (!this.nurVorschau && this.statistikSchirm !== name) {
      this.statistikSchirm = name;
      this.quelle.merken({ timings: { live: this.bestellt ? "ordered" : name } });
    }
    if (name === "prit") this.#markeSetzen("warteseiteGeoeffnet");
    if (name === "fertig") this.#markeSetzen("berichtGeoeffnet");
    // Der Wartebildschirm traegt seinen eigenen Kopf - die Marke links,
    // die Wartezeit rechts. Der Briefkopf der Analyse gehoert zum
    // Dokument, und solange es keines gibt, stuende er ueber einem
    // Bildschirm, den er nicht beschreibt.
    zeigen($(".masthead"), name !== "prit" && name !== "porosia");
    zeigen($("#an-pyetjeknopf"), name === "fertig");
    // Die Kaufleiste gehoert zum Befund. Auf dem Bestellschirm steht der
    // Knopf, der wirklich bestellt - zwei Kaufknoepfe uebereinander sind
    // zwei Angebote.
    if (name !== "fertig") zeigen($("#an-leiste"), false);
    // Und er passt auf ein Telefon, ohne dass jemand wischen muss. Das
    // traegt der Stil; hier steht nur, welcher Zustand gerade gilt.
    if (document.body) document.body.dataset.schirm = name;
  }

  // NUR FUER UNS: der Zustand "vorschau".
  //
  // Dr. Gashi sieht damit die fertige Seite, bevor der Patient sie
  // bekommt - unter derselben Adresse mit "?vorschau=1", also wirklich
  // das, was er zu sehen bekommt, und keine Nachbildung davon. Fuer ihn
  // selbst aendert sich nichts: ohne diesen Zusatz bleibt seine
  // Warteseite stehen.
  get nurVorschau() {
    return this.daten?.status === "vorschau";
  }

  get vorschauErlaubt() {
    try { return new URLSearchParams(this.ort?.search || "").get("vorschau") === "1"; }
    catch { return false; }
  }

  async #zeichnen() {
    if (this.daten.status === "wartet") { this.#pritZeigen(); return; }
    if (this.nurVorschau && !this.vorschauErlaubt) { this.#pritZeigen(); return; }
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
    schreibe($("#an-kopftitel"), this.text("analizaJuaj"));
    // Die Fallnummer steht im Briefkopf, wo sonst die Marke stand. Sie ist
    // die glaubwuerdigste Einzelangabe der Seite: eine Kennung, die es nur
    // einmal gibt. Gibt es keine, bleibt die Zeile leer statt "—" zu
    // behaupten.
    const nummer = $("#an-kopfnummer");
    schreibe(nummer, String(this.daten?.code || "").trim());
    zeigen(nummer, Boolean(String(this.daten?.code || "").trim()));
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
  //
  // DERSELBE BILDSCHIRM WIE IN DER VORLAGE, Teil fuer Teil: Kopf mit der
  // Wartezeit, Buehne mit dem Ring und dem einen Satz, Akte mit Nummer
  // und vier Punkten, Fuss mit der einen Handlung. Er ist der einzige,
  // den fast jeder sieht - oft stundenlang -, und er war in der frueheren
  // Fassung darauf gebaut, ohne eine Wischbewegung zu tragen.

  #pritZeigen() {
    const name = String(this.daten.name || "").trim();
    // Ohne Namen kein leerer Platz mitten im Satz. Das passiert seltener,
    // als man denkt, und sieht dann doppelt kaputt aus.
    schreibe($("#an-prittitel"), name
      ? this.text("pritTitel", { name })
      : this.text("pritTitelOhne"));
    schreibe($("#an-pritdauer"), t(wartetext(new Date().getHours()), this.sprache));

    schreibe($("#an-pritnumrimarke"), this.text("pritNumri"));
    schreibe($("#an-pritnumri"), this.daten.code || "—");
    schreibe($("#an-pritzeit"), this.#zeitMitUhr(this.daten.createdAt));
    // WIE VIELE AUFNAHMEN - UND OB ES UEBERHAUPT WELCHE GIBT.
    //
    // Seit der Trichter zwei Wege hat, kommt hier auch an, wer die Kamera
    // nicht freigeben wollte. Sein Fall traegt null Aufnahmen, und die
    // Zahl steht dann nicht da: "0 foto" sieht aus wie ein Fehler.
    //
    // Der Ersatzwert 3 gilt nur noch, wenn die Zahl FEHLT - das sind die
    // Faelle von vor dieser Aenderung, und die hatten alle einen Scan.
    // Eine ausdrueckliche Null ist etwas anderes als eine fehlende Zahl,
    // und "|| 3" konnte die beiden nicht auseinanderhalten.
    const ohneScan = this.daten.photos === 0;
    schreibe($("#an-pritfoto"), ohneScan
      ? this.text("pritOhneFoto")
      : this.text("pritFotoMarke", { anzahl: this.daten.photos || 3 }));

    // Vier Punkte statt vier Zeilen: zwei erledigt, einer laeuft, einer
    // offen. Benannt wird nur der laufende - das ist der einzige, der
    // eine Frage beantwortet ("was passiert gerade?"). Die anderen drei
    // beantwortet der Blick auf die Reihe.
    //
    // Ein Punkt ohne Wort ist fuer den, der ihn nicht sehen kann, gar
    // nichts. Deshalb traegt jeder seine Beschriftung - sichtbar nur fuer
    // Vorleseprogramme.
    const hapat = $("#an-prithapat");
    leer(hapat);
    const schritte = [
      // Ohne Scan heissen die ersten beiden anders: Was abgeschlossen
      // ist, ist die Anfrage, nicht ein Scan, den niemand gemacht hat.
      [ohneScan ? "pritHapi1Ohne" : "pritHapi1", "erledigt"],
      [ohneScan ? "pritHapi2Ohne" : "pritHapi2", "erledigt"],
      ["pritHapi3", "laeuft"],
      ["pritHapi4", "offen"]
    ];
    for (const [schluessel, stand] of schritte) {
      const li = element("li");
      li.dataset.stand = stand;
      li.append(element("span", "nur-vorlesen", this.text(schluessel)));
      hapat?.append(li);
    }
    schreibe($("#an-pritjetzt"), this.text("pritHapi3"));

    // Die Aufnahmen und die Sperre. Beide gehoeren in die Akte: das eine
    // ist, was da liegt, das andere, warum es liegen bleibt.
    //
    // Die Reihe holt ihre Bilder NEBEN dem Weg - deshalb ohne await: Der
    // Bildschirm steht sofort, die Kacheln fuellen sich danach. Und mit
    // eigenem Fehlerfang, weil niemand mehr auf sie wartet: Ein Fehler in
    // einer Kette, die keiner haelt, verschwindet sonst in der Konsole des
    // Kunden statt in unserer.
    this.#pritFotos(ohneScan ? 0 : (this.daten.photos || 3))
      .catch((fehler) => globalThis.console?.warn?.("[lifeskin] Miniaturen nicht gezeichnet:", fehler?.message));
    this.#pritSperre();

    schreibe($("#an-pritwarueckfrage"), this.text("pritWaRueck"));
    schreibe($("#an-pritwarueckja"), this.text("pritWaRueckJa"));
    schreibe($("#an-pritgatetitel"), this.text("pritGateTitel"));
    schreibe($("#an-pritgatewarum"), this.text("pritGateWarum"));
    schreibe($("#an-pritkopjo"), this.text("pritKopjo"));
    schreibe($("#an-pritsi"), this.text("pritSi"));

    // Das Blatt darueber.
    schreibe($("#an-pritblatttitel"), this.text("pritSi"));
    schreibe($("#an-pritblatttext"), this.text("pritSiText"));
    schreibe($("#an-pritkopjounder"), this.text("pritKopjoUnder"));
    schreibe($("#an-pritblattmbyll"), this.text("pritBlattMbyll"));

    this.#pritWhatsapp();
    this.#pritNummer();
    this.#pritTorPruefen();
    this.#zeige("prit");
  }

  // Erreichbar - die eine Frage, an der dieser Bildschirm haengt.
  //
  // Nummer hinterlassen ODER auf WhatsApp geschrieben. An dieser Stelle
  // steht sie einmal, weil drei Teile sie stellen: das Tor, die Sperre in
  // der Akte und der vierte Punkt der Reihe. Drei Abschriften derselben
  // Bedingung waeren drei Gelegenheiten, dass eine davon stehen bleibt.
  get erreichbar() {
    return Boolean(this.daten?.phone) || this.daten?.waSent === true;
  }

  // DIE AUFNAHMEN, ZUM WISCHEN.
  //
  // Sie kommen aus reports/<kennung>/thumbs - der kleinen Fassung neben
  // dem Bericht, die der Trichter nach dem Scan dort ablegt. Die Bilder in
  // voller Aufloesung bleiben in der Sitzung und damit beim CEO-Konto:
  // Dort stehen Telefonnummer und Anschrift, und dieser Link ist zum
  // Weitergeben gemacht.
  //
  // JEDE KACHEL STEHT FUER EIN WIRKLICH VORHANDENES FOTO. Sind weniger
  // Miniaturen da als Aufnahmen gezaehlt wurden, wird der Rest mit der
  // Ersatzkachel aufgefuellt - die Reihe sagt dann immer noch die Wahrheit
  // ("6 foto" und sechs Kacheln), nur ist ein Teil davon noch unterwegs.
  //
  // UND SIE KOMMEN NACH. Die Miniaturen gehen neben dem Weg hinaus,
  // waehrend der Kunde seinen Namen tippt; wer sehr schnell ist, steht
  // hier, bevor die letzte oben ist. Also wird nachgefasst - ein paarmal,
  // in wachsenden Abstaenden, und dann nicht mehr. Ein Abruf im Takt waere
  // fuer eine Wartezeit von Stunden reine Last.
  async #pritFotos(anzahl) {
    const reihe = $("#an-pritfotos");
    if (!reihe) return;
    if (!anzahl) { zeigen(reihe, false); return; }
    reihe.setAttribute("aria-label", this.text("pritFotoLista"));

    const zeichnen = (minis) => {
      leer(reihe);
      for (let i = 0; i < anzahl; i += 1) {
        const mini = minis[i];
        const li = element("li", "wait-shot");
        if (mini) {
          const bild = element("img");
          bild.src = mini.jpeg;
          bild.alt = "";
          bild.loading = "lazy";
          bild.decoding = "async";
          li.append(bild);
        } else {
          li.classList.add("wait-shot-leer");
          li.append(this.#gesichtszeichen());
        }
        li.append(element("span", "wait-shot-name", this.#blickName(mini?.blick, i)));
        reihe.append(li);
      }
      zeigen(reihe, true);
    };

    // Zuerst die Ersatzkacheln, damit die Reihe sofort steht und die Akte
    // nicht erst nach dem Abruf in die Hoehe springt.
    zeichnen([]);

    // Vier Versuche, in wachsenden Abstaenden - danach ist es kein
    // Wettlauf mehr, sondern ein Bild, das nicht ankam.
    for (const pause of [0, 2500, 6000, 15000]) {
      if (pause) {
        await new Promise((fertig) => globalThis.setTimeout(fertig, pause));
        // Der Bildschirm kann inzwischen der Befund sein. Dann gehoert die
        // Reihe niemandem mehr, und ein spaeter Abruf zeichnete in etwas
        // hinein, das gar nicht mehr zu sehen ist.
        //
        // NUR NACH EINER PAUSE. Beim ersten Durchgang steht die Marke noch
        // gar nicht: #pritZeigen ruft diese Methode, BEVOR es den
        // Bildschirm umschaltet - und die Pruefung schlug damit jedes Mal
        // zu, sodass nie eine einzige Miniatur geladen wurde.
        if (document.body?.dataset.schirm !== "prit") return;
      }
      const minis = await this.quelle.miniaturen();
      if (minis.length) zeichnen(minis);
      if (minis.length >= anzahl) return;
    }
  }

  // Die Ersatzkachel: ein Kopf im Umriss.
  //
  // Sie behauptet nicht, das Foto zu sein - sie haelt seinen Platz. Genau
  // deshalb ist es ein Umriss und kein unscharfes Bild: Was aussieht wie
  // ein Foto, das nicht laedt, sieht nach Fehler aus.
  #gesichtszeichen() {
    const raum = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(raum, "svg");
    svg.setAttribute("viewBox", "0 0 48 48");
    svg.setAttribute("fill", "none");
    svg.setAttribute("stroke", "currentColor");
    svg.setAttribute("stroke-width", "2.2");
    svg.setAttribute("stroke-linecap", "round");
    svg.setAttribute("stroke-linejoin", "round");
    svg.setAttribute("aria-hidden", "true");
    const kopf = document.createElementNS(raum, "path");
    kopf.setAttribute("d", "M24 9c6.2 0 10.5 4.2 10.5 10.5v3.5c0 7-4.7 12.5-10.5 12.5S13.5 30 13.5 23v-3.5C13.5 13.2 17.8 9 24 9z");
    const schultern = document.createElementNS(raum, "path");
    schultern.setAttribute("d", "M11 43c2.4-4.6 7.3-7.4 13-7.4S34.6 38.4 37 43");
    svg.append(kopf, schultern);
    return svg;
  }

  // Welche Richtung eine Kachel zeigt.
  //
  // Sechs fast gleiche Bilder von sich selbst werfen die Frage auf, warum
  // es sechs sind. Der Name darunter beantwortet sie in einem Wort.
  //
  // JE RICHTUNG KOMMEN MEHRERE BILDER - das beste traegt ihren Namen, die
  // weiteren zaehlen dahinter ("rechts-2"). Stuende unter beiden nur
  // "Djathtas", saehe die Reihe aus, als haette sie sich verzaehlt; die
  // Ziffer sagt, dass es zwei Aufnahmen derselben Seite sind.
  //
  // Ohne Miniatur ist die Richtung unbekannt - dann steht die laufende
  // Nummer da und nicht ein geratener Name.
  #blickName(blick, i) {
    const [richtung, nummer] = String(blick || "").split("-");
    const schluessel = {
      gerade: "pritBlickGerade", rechts: "pritBlickRechts",
      links: "pritBlickLinks", oben: "pritBlickOben"
    }[richtung];
    if (!schluessel) return String(i + 1);
    return nummer ? `${this.text(schluessel)} ${nummer}` : this.text(schluessel);
  }

  // DIE SPERRE - und der vierte Punkt, der sie wiederholt.
  //
  // Der Satz stand bisher ganz unten in Grau, unter den Knoepfen: gelesen
  // also erst, NACHDEM die Entscheidung gefallen war. Jetzt steht er in
  // der Akte, direkt unter den Aufnahmen, um die es geht.
  //
  // Und der letzte Punkt der Reihe war grau wie jeder Schritt, der noch
  // kommt - das sah aus wie eine Frage der Zeit. Er ist keine: Ohne
  // Kontakt kommt er nie.
  //
  // Beides kippt gemeinsam, sobald ein Weg hinterlegt ist. Der Platz
  // bleibt und die Aussage wechselt: Ein Hinweis, der einfach
  // verschwindet, laesst offen, ob es geklappt hat.
  #pritSperre() {
    const offen = !this.erreichbar;
    const zeile = $("#an-pritsperre");
    if (zeile) zeile.dataset.stand = offen ? "zu" : "frei";
    schreibe($("#an-pritsperretext"), this.text(offen ? "pritSperre" : "pritFrei"));

    const letzter = $("#an-prithapat")?.lastElementChild;
    if (!letzter) return;
    letzter.dataset.stand = offen ? "gesperrt" : "offen";
    schreibe(letzter.firstElementChild, this.text(offen ? "pritHapi4Sperre" : "pritHapi4"));
  }

  // DAS TOR: ZWEI WEGE, EIN ZUSTAND.
  //
  // Erreichbar ist, wer eine Nummer hinterlassen ODER auf WhatsApp
  // geschrieben hat. Sobald eines von beiden steht, weicht das Tor der
  // Bestaetigung - und zwar dauerhaft: Wer die Seite spaeter noch einmal
  // aufmacht, soll sehen, dass es erledigt ist, und nicht glauben, es
  // haette nicht geklappt.
  #pritTorPruefen() {
    const nummer = this.daten?.phone || "";
    const wa = this.daten?.waSent === true;
    // Die Akte sagt dasselbe wie das Tor - und sie sagt es an der Stelle,
    // an der die Analyse liegt. Beide werden hier gesetzt, nicht an zwei
    // Orten: Eine Bestaetigung unten und eine Sperre oben waeren ein
    // Widerspruch auf einem Bildschirm.
    this.#pritSperre();
    if (!nummer && !wa) { zeigen($("#an-pritgate"), true); zeigen($("#an-pritgati"), false); return; }
    schreibe($("#an-pritgatititel"), this.text("pritGatiTitel"));
    schreibe($("#an-pritgatitext"), nummer
      ? this.text("pritGatiNumri", { numri: nummer })
      : this.text("pritGatiWa"));
    zeigen($("#an-pritgate"), false);
    zeigen($("#an-pritgati"), true);
  }

  // Die Nummer - der zweite Weg zum selben Ziel.
  //
  // WhatsApp verlangt drei Handlungen: App wechseln, senden,
  // zurueckkommen. Wer bei einer davon abbricht, ist verloren. Eine
  // Nummer ist eine Handlung - und sie bleibt hier, auch wenn er die
  // Seite gleich danach schliesst.
  #pritNummer() {
    const form = $("#an-pritnrform");
    if (!form) return;
    schreibe($("#an-pritnrknopf"), this.text("pritNrKnopf"));
    const feld = $("#an-pritnr");
    if (feld) {
      feld.placeholder = this.text("pritNrVendos");
      // Die Landesvorwahl nur, wenn die Kampagne ein Land bedient - ein
      // falsches "+383" vor einer albanischen Nummer ist schlimmer als
      // gar keines. Dieselbe Regel wie im Bestellfeld.
      if (!feld.value && LIFESKIN_TELEFON_VORWAHL) feld.value = LIFESKIN_TELEFON_VORWAHL;
    }
    const ose = $("#an-pritose");
    if (ose?.firstElementChild) ose.firstElementChild.textContent = this.text("pritOse");

    // Nur einmal binden: #pritZeigen laeuft erneut, wenn der Abruf einen
    // neuen Zustand bringt - zwei Zuhoerer schrieben die Nummer zweimal.
    if (this.nrVerdrahtet) return;
    this.nrVerdrahtet = true;
    form.addEventListener("submit", (ereignis) => {
      ereignis.preventDefault();
      this.#nummerSchicken();
    });
  }

  // Die Nummer wegschicken - und erst danach bestaetigen.
  //
  // DAS IST DER GANZE PUNKT DIESER METHODE. Ein "Gati", das erscheint,
  // bevor der Schreibvorgang durch ist, ist eine Luege, sobald er
  // scheitert: Der Patient wartet auf einen Anruf, den niemand machen
  // kann, weil die Nummer nirgends steht. Lieber ein Fehler, den er sieht
  // und der ihn den Knopf noch einmal druecken laesst.
  async #nummerSchicken() {
    const feld = $("#an-pritnr");
    const knopf = $("#an-pritnrknopf");
    const fehler = $("#an-pritnrgabim");
    const melde = (schluessel) => {
      schreibe(fehler, schluessel ? this.text(schluessel) : "");
      zeigen(fehler, Boolean(schluessel));
      feld?.setAttribute("aria-invalid", schluessel ? "true" : "false");
    };

    const geprueft = telefonPruefen(feld?.value, LIFESKIN_TELEFON_VORWAHL);
    if (!geprueft.ok) {
      melde({ leer: "pritNrPflicht", kurz: "pritNrGabimShkurt",
              lang: "pritNrGabimGjate", zeichen: "pritNrGabimShenja" }[geprueft.grund]);
      feld?.focus();
      return;
    }
    melde(null);

    // Solange geschrieben wird, ist der Knopf zu: Zweimal tippen schriebe
    // zweimal, und der zweite Vorgang koennte den ersten ueberholen.
    if (knopf) knopf.disabled = true;
    const antwort = this.nurVorschau
      ? { ok: true }
      : await this.quelle.merken({
        phone: geprueft.nummer,
        // Er hat die Nummer selbst und ausdruecklich hierfuer
        // hinterlassen. Das ist die Einwilligung - und Heart liest genau
        // dieses Feld, bevor jemand anruft.
        phoneConsent: true
      });
    if (knopf) knopf.disabled = false;

    if (!antwort?.ok) { melde("pritNrGabimRuajtje"); return; }

    this.pixel.meldeLead();
    if (this.daten) this.daten.phone = geprueft.nummer;
    this.#pritTorPruefen();
  }

  // Der Weg zu einem Menschen, und der einzige Knopf dieses Bildschirms.
  // Ohne hinterlegte Nummer gibt es ihn nicht - ein Knopf, der ins Leere
  // fuehrt, ist schlimmer als keiner.
  #pritWhatsapp() {
    const knopf = $("#an-pritwa");
    if (!knopf) return;
    if (!LIFESKIN_WHATSAPP) { knopf.hidden = true; return; }
    const gruss = t(LIFESKIN_WHATSAPP_TEXT, this.sprache) || "";
    const code = this.daten?.code ? ` (${this.daten.code})` : "";
    knopf.href = `https://wa.me/${LIFESKIN_WHATSAPP}?text=${encodeURIComponent(gruss + code)}`;
    knopf.hidden = false;
    schreibe($("#an-pritwatext"), this.text("pritWaKnopf"));
  }

  // Den Link kopieren - mit Rueckfallweg.
  //
  // In den Fenstern von Instagram und TikTok fehlt die Zwischenablage
  // haeufig. Dann wird das Blatt geoeffnet; dort steht die Adresse zum
  // Abschreiben, und er sitzt nicht vor einem Knopf, der nichts tut.
  async #linkKopieren() {
    const knopf = $("#an-pritkopjo");
    const adresse = this.ort?.href || "";
    if (!this.nurVorschau) this.quelle.merken({ linkKopiert: true });
    try {
      await navigator.clipboard.writeText(adresse);
      schreibe(knopf, this.text("pritKopjuar"));
      globalThis.setTimeout(() => schreibe(knopf, this.text("pritKopjo")), 1600);
      return;
    } catch { /* weiter unten */ }
    this.#blatt($("#an-pritblatt"), knopf);
    const feld = $("#an-pritkopjounder");
    if (feld) feld.textContent = adresse;
  }

  // Datum und Uhrzeit, wie man sie in Prishtina und Tirana schreibt.
  //
  // NICHT toLocaleString mit "sq-AL": Die albanische Zone fehlt in vielen
  // Webansichten, und dann faellt der Browser still auf sein eigenes
  // Gebiet zurueck - auf einem Geraet mit englischer Einstellung stand
  // dort "09/05/2026, 11:07 PM". Das ist nicht nur fremd, es ist
  // mehrdeutig: der Fuenfte im September oder der neunte im Mai?
  #zeitMitUhr(iso) {
    const zeit = Date.parse(iso);
    if (!Number.isFinite(zeit)) return "";
    try {
      const teile = new Intl.DateTimeFormat("en-GB", {
        timeZone: "Europe/Belgrade",
        day: "2-digit", month: "2-digit", year: "numeric",
        hour: "2-digit", minute: "2-digit", hour12: false
      }).formatToParts(new Date(zeit));
      const w = (art) => teile.find((teil) => teil.type === art)?.value || "";
      const tag = w("day"), monat = w("month"), jahr = w("year");
      const stunde = w("hour"), minute = w("minute");
      if (!tag || !monat || !jahr) return "";
      // 24 Uhr gibt es nicht. en-GB liefert bei Mitternacht "24" statt "00".
      return `${tag}.${monat}.${jahr}, ${stunde === "24" ? "00" : stunde}:${minute}`;
    } catch { return ""; }
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
    this.#lesemarken();
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

    // Verlangt die Analyse eine Abklaerung, steht das hier - unabhaengig
    // davon, ob Mittel freigegeben sind. Der Satz kostet im Zweifel einen
    // Verkauf, und genau deshalb glaubt man den Rest der Seite.
    schreibe($("#an-metodanote"), this.abklaerung
      ? `${this.text("metodaNote")} ${this.text("abklaerungNote")}`
      : this.text("metodaNote"));
    schreibe($("#an-metodalink"), this.text("metodaLink"));
    schreibe($("#an-drejtplanit"), this.text("drejtPlanit"));
  }

  // Wer beurteilt hat - und nur, wenn wirklich jemand beurteilt hat.
  //
  // Ohne bestaetigte aerztliche Pruefung FAELLT DIE GANZE ZEILE AUS.
  // Frueher trat an ihre Stelle "Vlerësim me ndihmën e AI / Nuk është
  // diagnozë e konfirmuar nga mjeku"; das ist weg. Diese Zeile
  // beantwortet genau eine Frage - wer hat beurteilt -, und solange
  // darauf keine Antwort feststeht, ist die richtige Anzeige keine.
  //
  // Behauptet wird dadurch nichts: Ohne Freigabe steht dort kein Name,
  // kein Portraet und keine Rolle. Was die Methode nicht hergibt, steht
  // weiter in metodaNote, in abklaerungNote und im Aufklapper #kufijte.
  #urheber() {
    const ohnePruefung = this.raport.schemaVersion === 3 && !this.raport.aerztlichGeprueft;
    zeigen($("#an-arzt"), !ohnePruefung);
    if (ohnePruefung) return;
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
      // Das Mittel selbst, wo bisher die Ziffer stand. Wer die Flasche
      // einmal gesehen hat, erkennt sie im Paket wieder - eine Ziffer
      // erkennt niemand wieder. Die Ziffer sagt weiter, der wievielte
      // Schritt das ist, und steht dafuer rechts, wo der Blick die
      // Ordnung sucht.
      const bild = this.#produktBild(p);
      if (bild) kopf.append(bild);
      const namen = element("div");
      const rolle = (p.nenName || p.lloji || "").trim();
      if (rolle) namen.append(element("span", "eyebrow", rolle.toLocaleUpperCase(this.sprache)));
      namen.append(element("h3", null, p.name));
      kopf.append(namen);
      kopf.append(element("span", "product-index", String(i + 1).padStart(2, "0")));
      karte.append(kopf);

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

  // Das Foto eines Mittels - und nur, wenn es eines GIBT.
  //
  // Kein Platzhalter, kein graues Kaestchen: Ein leerer Rahmen neben dem
  // Namen sieht nach fehlgeschlagenem Laden aus, und eine Karte, die
  // nach Panne aussieht, nimmt dem Mittel daneben die Glaubwuerdigkeit.
  // Die Quelle ist geprueft - astra-daten.js laesst nur eingebettete
  // Bilder durch, nie eine fremde Adresse.
  //
  // Das Bild traegt KEINEN Alternativtext: Der Name steht als
  // Ueberschrift unmittelbar daneben, und ein Vorleseprogramm saegte ihn
  // sonst zweimal.
  #produktBild(p, klasse = "product-photo") {
    if (!p.foto) return null;
    const bild = element("img", klasse);
    bild.src = p.foto;
    bild.alt = "";
    bild.loading = "lazy";
    bild.decoding = "async";
    return bild;
  }

  #produktBlatt(p) {
    const bloecke = [];

    // DAS ZIEL BIS TAG 28 STAND AUF DER VORDERSEITE DER KARTE - und sagte
    // dort zum dritten Mal auf einem Bildschirm dasselbe: einmal oben im
    // Pflegeziel, einmal hier, einmal darunter in "Pse në këtë plan".
    // Drei Versprechen nebeneinander werden nicht dreimal geglaubt,
    // sondern einmal weniger.
    //
    // Und es war von den dreien das einzige, das NICHT fuer diesen Fall
    // geschrieben ist: Es steht so in lifeskin-catalog.js und ist fuer
    // jeden gleich, der dieses Mittel bekommt. Es stand vor dem
    // persoenlichen Satz und in groesserer Schrift - die Karte begann
    // also mit Katalogtext und brachte das Besondere danach.
    //
    // WEG IST ES TROTZDEM NICHT. Bei zwei Mitteln traegt sein zweiter
    // Halbsatz die einzige ehrliche Begrenzung der ganzen Seite: "Gjurmët
    // e vjetra kërkojnë më shumë kohë" und "Njollat e vjetra zbehen
    // ngadalë dhe kërkojnë më shumë se një muaj". Das ist der Satz, der
    // an Tag 28 die Enttaeuschung verhindert; er faellt nicht weg, weil
    // er unbequem ist. Er steht jetzt bei den Einzelheiten, wo ihn
    // findet, wer nachliest.
    //
    // Ohne eigene Ueberschrift: Der Katalogsatz beginnt selbst mit "Deri
    // në ditën 28:", und darueber noch einmal "Deri në ditën 28" zu
    // setzen liest sich wie ein Fehler.
    if (p.synimi) bloecke.push(element("p", "detail-goal", p.synimi));

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
      // Dieselben Bilder wie im Plan, nur klein: Die Liste ist das
      // Letzte, was vor dem Knopf gelesen wird, und was man sieht,
      // bestellt sich leichter als was man aufzaehlt.
      const bild = this.#produktBild(p, "set-photo");
      if (bild) li.append(bild);
      li.append(element("span", "set-name", p.name), element("span", "set-volume", p.inhalt || ""));
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
    // Der Tagespreis ist dieselbe Zahl, nur geteilt - deshalb geteilt und
    // nicht geschrieben. tagespreis() rechnet mit dem Preis DIESES Falls,
    // nicht mit dem Listenpreis: Wer in Heart einen anderen Betrag
    // einsetzt, saehe sonst darunter weiter den alten Tagespreis.
    schreibe($("#an-cmimidita"), this.text("cmimiDita", {
      tagespreis: zahl(tagespreis({ ...STANDARD_KONFIG, setPreis: this.preis }))
    }));
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
    // Ueber this.text und nicht ueber t(): Auch die drei Schritte sind
    // Texte der Seite und stehen einzeln in der Textkarte.
    NDJEKJA.forEach((_, i) => {
      const n = i + 1;
      const li = element("li");
      li.append(element("span", null, this.text(`ndjekja${n}Marke`)));
      const leib = element("div");
      leib.append(element("h3", null, this.text(`ndjekja${n}Titel`)));
      leib.append(element("p", null, this.text(`ndjekja${n}Text`)));
      li.append(leib);
      hapat?.append(li);
    });
    schreibe($("#an-kontakttitel"), this.text("kontaktTitel"));
    schreibe($("#an-kontakttext"), this.text("kontaktText"));
    schreibe($("#an-kontaktknopf"), this.text("kontaktKnopf"));
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
    PYETJET.forEach((_, i) => {
      const n = i + 1;
      const details = element("details");
      details.append(aufklapper(this.text(`pyetje${n}Pyetja`)));
      const leib = element("div", "details-body");
      leib.append(element("p", null, this.text(`pyetje${n}Pergjigja`, {
        preis: zahl(this.preis), von, bis
      })));
      details.append(leib);
      kasten?.append(details);
    });
  }

  #fuss() {
    schreibe($("#an-slogan"), this.text("fusnotaSlogan"));
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
    // SIE HAENGT AM ANGEBOT, NICHT AN EINEM ZWEITEN KNOPF.
    //
    // Im Angebot steht keiner mehr: Es gibt genau einen Kaufknopf, und er
    // kommt, sobald das Angebot ins Bild kommt. Damit ist auch die
    // Zustandsmaschine weg, die vermeiden sollte, dass zwei gleichzeitig
    // dastehen.
    const ziel = $("#paketa");
    // OHNE ANGEBOT GAR NICHT DA. Das ist ein anderer Zustand als
    // "noch nicht gekommen": Ein Befund ohne Angebot hat keine Leiste,
    // die spaeter einfahren koennte.
    if (!leiste || !ziel || !this.mitAngebot || this.bestellt) {
      zeigen(leiste, false);
      return;
    }
    schreibe($("#an-leisteknopf"), this.text("knopfStart", { preis: zahl(this.preis) }));
    // Nur wenn bei Lieferung gezahlt wird. Steht die Zeile ohne
    // Nachnahme da, ist sie eine Behauptung.
    const nachnahme = STANDARD_KONFIG.zahlarten.includes("nachnahme");
    schreibe($("#an-leisteunter"), nachnahme ? this.text("dorezimSatz") : "");
    zeigen($("#an-leisteunter"), nachnahme);
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
    // SIE KOMMT MIT DEM ANGEBOT - und davor gibt es sie nicht. Wer beim
    // ersten Satz einen Kaufknopf am Rand sieht, liest ab da nicht mehr
    // "was ist mit meiner Haut", sondern sucht, wo die 53 € begruendet
    // werden.
    const pruefen = () => {
      const imBild = ziel.getBoundingClientRect().top < window.innerHeight;
      const stufe = imBild && !this.bestellt ? "an" : "aus";
      if (leiste.dataset.stufe !== stufe) leiste.dataset.stufe = stufe;
    };
    this.leistePruefen = pruefen;
    globalThis.addEventListener?.("scroll", pruefen, { passive: true });
    globalThis.addEventListener?.("resize", pruefen, { passive: true });
    pruefen();
  }

  // WAS DER PATIENT AUF SEINER SEITE WIRKLICH GESEHEN HAT.
  //
  // GEMESSEN, NICHT GESCHAETZT: Heart zeigt zu jedem Fall zehn Marken und
  // rechnet daraus die Lesetiefe - "wo im Bericht bleibt Geld liegen".
  // VIER DAVON HAT NIE JEMAND GESCHRIEBEN: sahSchnitt, sahTherapie,
  // sahPreis und kasseGeoeffnet standen in heart-lifeskin-berechnung.js,
  // wurden dort gelesen, gezaehlt und in ein Diagramm gezeichnet - und auf
  // dieser Seite hat sie nie eine Zeile gesetzt. Sie konnten gar nichts
  // anderes sein als "nein".
  //
  // Sichtbar war davon: Jeder Fall riss bei "Befund gelesen" ab, auch der,
  // der bis zur Kasse gekommen ist, und die ganze Lesetiefe stand auf null.
  // Eine Zahl, die immer dasselbe sagt, sagt nichts - aber sie sieht aus
  // wie eine Aussage, und danach werden Entscheidungen getroffen.
  //
  // EIN EIGENER BEOBACHTER und nicht der der Seitenleiste: Jener ist auf
  // das Hervorheben im Inhaltsverzeichnis eingestellt (-65 % unten). Wer
  // spaeter an dieser Einstellung dreht, wuerde sonst die Zahlen
  // mitverschieben, ohne es zu merken.
  //
  // Die Schwelle: Ein Viertel des Abschnitts muss im Bild gewesen sein.
  // Vorbeiscrollen zaehlt damit nicht als gesehen, und ein Abschnitt, der
  // laenger ist als der Bildschirm, zaehlt trotzdem.
  #lesemarken() {
    if (this.markenVerdrahtet || typeof IntersectionObserver !== "function") return;
    this.markenVerdrahtet = true;
    this.markenGesetzt = this.markenGesetzt || new Set();

    const marken = [
      // "Befund gelesen": Wer bis zu den Einzelbefunden gekommen ist, hat
      // die Ergebnisflaeche darueber hinter sich.
      ["#an-gjetjetsektion", "sahSchnitt"],
      ["#plani", "sahTherapie"],
      // Der Preis selbst, nicht der Abschnitt darum: "Preis gesehen" soll
      // heissen, dass die Zahl vor Augen war.
      [".price-area", "sahPreis"]
    ];

    const beobachter = new IntersectionObserver((eintraege) => {
      for (const eintrag of eintraege) {
        if (!eintrag.isIntersecting) continue;
        const feld = eintrag.target.dataset.lesemarke;
        beobachter.unobserve(eintrag.target);
        this.#markeSetzen(feld);
      }
    }, { threshold: 0.25 });

    for (const [wahl, feld] of marken) {
      const knoten = document.querySelector(wahl);
      if (!knoten) continue;
      knoten.dataset.lesemarke = feld;
      beobachter.observe(knoten);
    }
  }

  // JEDE MARKE GENAU EINMAL. Ohne diese Sperre schriebe jedes Scrollen
  // zurueck und wieder hin eine neue Anfrage an Firestore - bei einem
  // Bericht, durch den man mehrmals hoch und runter geht, Dutzende.
  #markeSetzen(feld) {
    // EIN EIGENER BLICK IST KEIN PATIENT.
    //
    // Die Vorschau wurde bisher nur an der einen Stelle ausgenommen, an
    // der berichtGeoeffnet geschrieben wurde - nicht hier. Jetzt laufen
    // alle Marken durch diese Methode, also gehoert die Pruefung hierher:
    // Sonst zaehlte jeder Blick der Aerztin auf einen Fall als jemand,
    // der seinen Befund gelesen hat, und die Zahl, an der dieser Weg
    // gemessen wird, waere die eigene Arbeit.
    if (this.nurVorschau) return;
    if (!feld || this.markenGesetzt?.has(feld)) return;
    this.markenGesetzt = this.markenGesetzt || new Set();
    this.markenGesetzt.add(feld);
    this.quelle.merken({ [feld]: true }).then((antwort) => {
      if (!antwort?.ok) this.markenGesetzt.delete(feld);
    });
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
    // Der Griff zum WhatsApp-Knopf ist das Ereignis, auf das die Anzeigen
    // lernen - nicht der Kauf: Bestellungen liegen unter den ungefaehr
    // fuenfzig Ereignissen je Woche, die eine Anzeigengruppe braucht, um
    // aus der Lernphase zu kommen. Die Griffe liegen darueber.
    $("#an-pritwa")?.addEventListener("click", () => {
      this.waGetippt = true;
      if (!this.nurVorschau) this.quelle.merken({ waClick: true });
      this.pixel.meldeLead();
    });
    $("#an-pritwarueckja")?.addEventListener("click", () => {
      zeigen($("#an-pritwarueck"), false);
      if (!this.nurVorschau) this.quelle.merken({ waSent: true });
      // Erst sein "Ja" macht aus dem Griff eine gesendete Nachricht, und
      // erst dann weicht das Tor: Ein Griff allein ist kein Kontakt - er
      // kann in WhatsApp abgebrochen haben.
      if (this.daten) this.daten.waSent = true;
      this.#pritTorPruefen();
    });
    $("#an-pritkopjo")?.addEventListener("click", () => this.#linkKopieren());
    $("#an-pritsi")?.addEventListener("click", (ereignis) => {
      this.#blatt($("#an-pritblatt"), ereignis.currentTarget);
    });
    // Er war in WhatsApp und ist zurueck. EINMAL gefragt, ruhig, kein
    // zweites Mal - wer nichts geschickt hat, soll nicht jedes Mal
    // daran erinnert werden.
    document.addEventListener("visibilitychange", () => {
      if (!this.waGetippt || this.waGefragt) return;
      if (document.visibilityState !== "visible") return;
      this.waGefragt = true;
      zeigen($("#an-pritwarueck"), true);
    });

    // Der Weg zurueck aus der Bestellung - und der Weg aus der
    // Bestaetigung zurueck in den Befund. Beide fuehren an dieselbe
    // Stelle; der Bestellschirm ist eine Seite und kein Blatt, das sich
    // "schliessen" laesst.
    $("#an-porosiazurueck")?.addEventListener("click", () => this.#bestellblatt(false));
    $("#an-dankeknopf")?.addEventListener("click", () => this.#bestellblatt(false));

    for (const blatt of [$("#an-ndihma"), $("#an-pritblatt")]) {
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

    // Persist a partial private address when the patient leaves either field.
    for (const id of ["#an-adresa", "#an-qyteti"]) {
      $(id)?.addEventListener("input", () => {
        if (this.nurVorschau || this.bestellt || this.anschriftBegonnen) return;
        if (!$(id)?.value.trim()) return;
        this.anschriftBegonnen = true;
        this.quelle.merken({ timings: { live: "address" } });
      });
      $(id)?.addEventListener("change", () => {
        if (this.nurVorschau || this.bestellt) return;
        const address = {
          strasse: $("#an-adresa")?.value.trim() || "",
          ort: $("#an-qyteti")?.value.trim() || ""
        };
        if (address.strasse || address.ort) this.quelle.merken({ address, timings: { live: "address" } });
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

  // ---------- Die Bestellung ----------
  //
  // EINE GANZE SEITE, KEIN BLATT UEBER DER SEITE.
  //
  // GEMESSEN, NICHT GESCHAETZT: Vier Felder und die Tastatur des Telefons
  // passen in kein Blatt am unteren Rand. Die Tastatur schiebt es hoch,
  // der Knopf rutscht aus dem Bild - und getippt wird die Anschrift, ohne
  // dass noch zu sehen ist, was gekauft wird. Genau so stand der Knopf
  // "Konfirmo porosinë" halb hinter dem unteren Bildrand.
  //
  // Oben der Korb, darunter die Felder, unten fest der Knopf - dieselbe
  // Ordnung wie in der frueheren Fassung.
  #bestellblatt(auf) {
    if (auf && (!this.mitAngebot || this.bestellt)) return;
    if (!$("#an-porosia")) return;
    if (!auf) { this.#zeige("fertig"); return; }

    schreibe($("#an-porosiamarke"), this.text("porosiaMarke"));
    schreibe($("#an-porosiatitel"), this.text("porosiaTitel"));
    this.#korbZeichnen();
    this.#sicherListe();

    // Beschriftung IM Feld statt darueber: vier Zeilen weniger, und auf
    // einem kleinen Telefon entscheidet genau das darueber, ob der Knopf
    // noch im Bild ist. Als aria-label bleibt sie fuer Vorleseprogramme
    // erhalten - ein Feld, dessen Beschriftung beim Tippen verschwindet,
    // ist fuer den, der sie nicht sieht, gar keines.
    for (const [wahl, schluessel] of [
      ["#an-emri", "porosiaEmri"],
      ["#an-telefon", "porosiaTelefon"],
      ["#an-adresa", "porosiaAdresa"],
      ["#an-qyteti", "porosiaQyteti"]
    ]) {
      const feld = $(wahl);
      if (!feld) continue;
      const wort = this.text(schluessel);
      feld.placeholder = wort;
      feld.setAttribute("aria-label", wort);
    }

    schreibe($("#an-sendentext"), this.text("porosiaKonfirmo"));
    schreibe($("#an-porosianote"), this.text("porosiaIntro"));
    schreibe($("#an-danketitel"), this.text("dankeTitel"));
    schreibe($("#an-danketext"), this.text("dankeText"));
    schreibe($("#an-dankeknopf"), this.text("dankeKthehu"));
    zeigen($("#an-porosiakopf"), true);
    zeigen($("#an-porosiaform"), true);
    zeigen($("#an-porosialeiste"), true);
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

    // "Kasse geoeffnet" - die letzte der vier Marken, die Heart gelesen,
    // aber niemand geschrieben hat. Hier und nicht in #zeige(): Der
    // Bestellschirm wird auch nach dem Absenden noch einmal gezeigt, und
    // ein zweites Oeffnen nach der Bestellung ist kein Oeffnen der Kasse.
    this.#markeSetzen("kasseGeoeffnet");
    this.anschriftBegonnen = false;
    this.#zeige("porosia");
    // KEIN Fokus ins erste Feld: Die Tastatur spraenge sofort auf und
    // verdeckte genau den Korb, wegen dem diese Seite existiert.
  }

  // Der Korb ganz oben. Er beantwortet die Frage, die beim Tippen der
  // Anschrift aufkommt: "Was zahle ich hier eigentlich gerade?"
  #korbZeichnen() {
    const kasten = $("#an-porosiakorb");
    if (!kasten) return;
    leer(kasten);
    for (const p of this.produkte) {
      const zeile = element("div", "order-item");
      const bild = this.#produktBild(p, "order-photo");
      if (bild) zeile.append(bild);
      const leib = element("div", "order-item-body");
      leib.append(element("strong", null, p.name));
      if (p.inhalt) leib.append(element("span", null, p.inhalt));
      zeile.append(leib);
      kasten.append(zeile);
    }
    const summe = element("div", "order-sum");
    summe.append(element("span", null, this.text("porosiaGjithsej")),
      element("strong", null, euro(this.preis)));
    kasten.append(summe);
    kasten.append(element("p", "order-payment", this.text("porosiaZahlung")));
  }

  // Die drei Zusagen am Knopf. Sie stehen hier und nicht weiter oben: Der
  // Zweifel kommt beim Tippen der Anschrift zurueck, nicht davor. Und nur
  // das, was wirklich gilt - eine Garantie ueber null Tage waere die
  // teuerste Zeile der Seite.
  #sicherListe() {
    const liste = $("#an-porosiasiguria");
    if (!liste) return;
    leer(liste);
    const [von, bis] = STANDARD_KONFIG.lieferzeitTage;
    const tage = Number(STANDARD_KONFIG.rueckgabeTage) || 0;
    const zeilen = [
      STANDARD_KONFIG.zahlarten.includes("nachnahme") ? this.text("siguriaPagesa") : "",
      tage > 0 ? this.text("siguriaGaranci", { tage }) : "",
      von && bis ? this.text("siguriaDergesa", { von, bis }) : ""
    ].filter(Boolean);
    for (const zeile of zeilen) {
      liste.append(mitZeichen(element("li", null, zeile), ZEICHEN.enthalten));
    }
  }

  async #bestellen() {
    if (this.nurVorschau) return;
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
      timings: { live: "ordered" },
      order: {
        createdAt: jetzt,
        total: this.preis,
        payment: "nachnahme",
        status: "neu",
        orderId: this.daten.code || this.kennung
      },
      step: "ordered"
    });

    // Und dann der Zustand im Befund - der Teil, den er selbst sieht.
    if (gespeichert?.ok) await this.quelle.zustandSchreiben({ status: "bestellt", bestelltAt: jetzt });

    if (!gespeichert?.ok) {
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
    // "Wohin sollen wir liefern?" ueber einer bestaetigten Bestellung
    // waere eine Frage, die schon beantwortet ist.
    zeigen($("#an-porosiakopf"), false);
    zeigen($("#an-porosiaform"), false);
    zeigen($("#an-porosialeiste"), false);
    zeigen($("#an-danke"), true);
    // Der Befund dahinter wird neu gezeichnet - er traegt jetzt den
    // Versandstand statt des Angebots. Sichtbar bleibt aber die
    // Bestaetigung: Wer gerade bestellt hat, sucht keine Seite, er sucht
    // die Antwort auf "ist es angekommen?".
    this.#fertigZeigen();
    this.#zeige("porosia");
    $("#an-dankeknopf")?.focus();
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
