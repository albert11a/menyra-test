// DIE THERAPIESEITE - /terapia/<kennung>.
//
// Sie zeigt den freigegebenen Befund als das, was die Anzeige versprochen
// hat: zuerst die Therapie mit Preis und Knopf, dann warum genau diese,
// ganz unten die vollstaendige Analyse. Gestaltung wie die Vorlage unter
// /120992.
//
// WAS SIE VON DER ANALYSESEITE (apps/lifeskin-astra) UEBERNIMMT, UND ZWAR
// WORTGLEICH IN DER WIRKUNG: dieselben Lese- und Schreibwege
// (AnalyseDaten), dieselben Marken in der Sitzung (berichtGeoeffnet,
// sahSchnitt, sahTherapie, sahPreis, kasseGeoeffnet, Anschrift, Bestellung)
// und dieselben Pixel-Ereignisse. Heart zaehlt beide Seiten gleich.
//
// Was sie NICHT hat: die Warteseite. Ein Fall, der noch nicht freigegeben
// ist, geht nach /analiza/<kennung> - dort steht sie.
import { AnalyseDaten, kennungAusPfad } from "../lifeskin-astra/astra-daten.js";
import { Pixel, pixelKennungen } from "../lifeskin/lifeskin-pixel.js";
import { STANDARD_KONFIG } from "../lifeskin/lifeskin-catalog.js";
import { LIFESKIN_WHATSAPP, LIFESKIN_WHATSAPP_TEXT, LIFESKIN_TELEFON_VORWAHL } from "../lifeskin/lifeskin-config.js";
import { brauchtAbklaerung } from "../../shared/lifeskin-raport-v3.js";
import { shitjaLesen } from "../../shared/lifeskin-shitja.js";
import { starteKlickpfad } from "../../shared/lifeskin-klickpfad.js";

const $ = (wahl) => document.querySelector(wahl);
const $$ = (wahl) => Array.from(document.querySelectorAll(wahl));
const BESTELLT = ["bestellt", "versandt", "zugestellt"];
const TAGE = Number(STANDARD_KONFIG.reichweiteTage) || 28;

function zahl(wert) {
  const n = Number(wert);
  if (!Number.isFinite(n)) return "";
  return (Number.isInteger(n) ? String(n) : n.toFixed(2)).replace(".", ",");
}
const euro = (wert) => `${zahl(wert)} €`;

function schreibe(knoten, text) {
  if (knoten) knoten.textContent = text;
}
function zeigen(knoten, ja) {
  if (knoten) knoten.hidden = !ja;
}
function element(name, klasse, text) {
  const el = document.createElement(name);
  if (klasse) el.className = klasse;
  if (text !== undefined && text !== null) el.textContent = text;
  return el;
}

// "Poret e bllokuara në ballë." -> "poret e bllokuara në ballë"
function satzteil(text) {
  const t = String(text || "").trim().replace(/[.!]+$/, "");
  return t ? t.charAt(0).toLowerCase() + t.slice(1) : "";
}

// EIN LANGER BEFUNDSATZ, ZWEI ZEILEN: das Problem und wo es ist.
//
// "Pore të zgjeruara dhe mikroreliev i pabarabartë, më i dukshëm në faqet
// pranë hundës" -> ["Pore të zgjeruara dhe mikroreliev i pabarabartë",
// "më i dukshëm në faqet pranë hundës"]. Getrennt wird am ersten Komma,
// Gedankenstrich oder " me " nach mindestens zwei Woertern. Nur fuer
// Befunde ohne den Block "shitja" (Prompt vor v8) - v8 liefert beides
// schon getrennt.
export function kurzUndRest(text) {
  const satz = String(text || "").trim().replace(/[.!]+$/, "");
  let schnitt = -1;
  let laenge = 0;
  for (const trenner of [", ", " — ", " - ", " me "]) {
    const i = satz.indexOf(trenner);
    if (i > 0 && satz.slice(0, i).split(/\s+/).length >= 2 && (schnitt < 0 || i < schnitt)) {
      schnitt = i;
      laenge = trenner === " me " ? 1 : trenner.length;
    }
  }
  if (schnitt < 0) return [satz, ""];
  return [satz.slice(0, schnitt).trim(), satz.slice(schnitt + laenge).trim()];
}

// **fett** aus dem Prompt als <b>, alles andere als Text. Kein HTML aus
// der Modellantwort erreicht die Seite.
export function mitFett(knoten, text) {
  if (!knoten) return;
  knoten.replaceChildren();
  String(text || "").split(/(\*\*[^*]+\*\*)/).forEach((teil) => {
    if (!teil) return;
    const fett = /^\*\*([^*]+)\*\*$/.exec(teil);
    knoten.append(fett ? element("b", null, fett[1]) : teil);
  });
}

// Vergisst die Analyse die Sterne, werden die Probleme aus den Karten
// fett gesetzt, wo sie im Satz wortgleich vorkommen.
export function fettNachtragen(text, problemet = []) {
  let satz = String(text || "");
  if (satz.includes("**")) return satz;
  for (const p of problemet || []) {
    const wort = String(p?.gjetja || "").trim();
    if (wort.length < 4) continue;
    const i = satz.toLowerCase().indexOf(wort.toLowerCase());
    if (i >= 0) satz = `${satz.slice(0, i)}**${satz.slice(i, i + wort.length)}**${satz.slice(i + wort.length)}`;
  }
  if (satz.includes("**")) return satz;
  // Nichts wortgleich gefunden: Der Satz hat die Form "Për X dhe Y — ...",
  // also sind X und Y die Probleme.
  const form = /^(Për )(.+?)( — .*)$/.exec(satz);
  if (!form) return satz;
  const teile = form[2].split(" dhe ");
  const probleme = teile.length >= 2
    ? [teile[0], teile.slice(1).join(" dhe ")]
    : [form[2]];
  return `${form[1]}${probleme.map((x) => `**${x.trim()}**`).join(" dhe ")}${form[3]}`;
}

// Nennt der Satz eine andere Produktzahl, als die Seite zeigt (in Heart
// wurde nach der Analyse etwas an- oder abgehakt), wird sein Schluss
// ersetzt - "1 produkt" ueber zwei Produkten ist ein Widerspruch, den
// jeder sieht.
export function hyrjaAbgleichen(text, anzahl, imText = []) {
  const satz = String(text || "");
  if (!anzahl || imText.length === anzahl || !satz.includes(" — ")) return satz;
  const vorne = satz.slice(0, satz.indexOf(" — "));
  const rest = `${anzahl === 1 ? "një produkt" : `${anzahl} produkte`}, një plan i qartë dhe Dr. Gashi pranë jush çdo javë.`;
  return `${vorne} — ${rest}`;
}

// Der Produktname steht vorn und gruen - wie in der Vorlage. Steht er
// schon im Satz, wird er dort herausgenommen, damit er nicht zweimal
// dasteht.
function mitProduktVorn(knoten, name, satz) {
  const text = String(satz || "").trim();
  const i = text.toUpperCase().indexOf(String(name).toUpperCase());
  let rest = text;
  if (i === 0) rest = text.slice(name.length).trim();
  else if (i > 0) rest = `${text.slice(0, i)}${text.slice(i + name.length)}`.replace(/\s{2,}/g, " ").trim();
  if (rest && i !== 0) rest = rest.charAt(0).toLowerCase() + rest.slice(1);
  knoten.replaceChildren(element("b", null, name), rest ? ` ${rest}` : "");
}

export function tageszeiten(koha) {
  const wort = String(koha || "").toLowerCase();
  return {
    morgens: wort.includes("mëngjes") || wort.includes("mengjes"),
    abends: wort.includes("mbrëmje") || wort.includes("mbremje")
  };
}

// Die Zeichnung, solange ein Produkt kein Foto hat: Tube fuer Gel und
// Serum, Dose fuer Creme, sonst eine Flasche.
function produktZeichnung(lloji) {
  const art = String(lloji || "").toLowerCase();
  const ns = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(ns, "svg");
  const teile = art.includes("krem")
    ? { box: "0 0 110 150", d: '<rect x="16" y="54" width="78" height="16" rx="4" fill="#154e45"/><rect x="12" y="70" width="86" height="72" rx="10" fill="#fff" stroke="#cfd9cf" stroke-width="2"/><rect x="24" y="84" width="62" height="42" rx="4" fill="#edf2ed"/>' }
    : art.includes("gel") || art.includes("serum")
      ? { box: "0 0 80 150", d: '<rect x="18" y="4" width="44" height="14" rx="3" fill="#154e45"/><path d="M16 18h48l-6 124H22z" fill="#fff" stroke="#cfd9cf" stroke-width="2"/><rect x="24" y="52" width="32" height="44" rx="4" fill="#edf2ed"/>' }
      : { box: "0 0 80 150", d: '<rect x="30" y="6" width="20" height="22" rx="3" fill="#154e45"/><rect x="16" y="28" width="48" height="114" rx="12" fill="#fff" stroke="#cfd9cf" stroke-width="2"/><rect x="24" y="62" width="32" height="44" rx="4" fill="#edf2ed"/>' };
  svg.setAttribute("viewBox", teile.box);
  svg.setAttribute("aria-hidden", "true");
  svg.innerHTML = teile.d;
  return svg;
}

function produktBild(p, klasse) {
  if (p.foto) {
    const img = element("img", klasse);
    img.src = p.foto;
    img.alt = p.name;
    return img;
  }
  const svg = produktZeichnung(p.lloji || p.nenName);
  svg.setAttribute("class", klasse);
  return svg;
}

export class Terapia {
  constructor({ fetchFn, ort, pixel } = {}) {
    this.ort = ort || globalThis.location;
    this.quelle = new AnalyseDaten({ fetchFn, kennung: kennungAusPfad(this.ort?.pathname) });
    this.pixel = pixel || new Pixel({ seite: "befund" });
    this.daten = null;
    this.produkte = [];
    this.marken = new Set();
  }

  get kennung() { return this.quelle.kennung; }
  get raport() { return this.daten?.raport || {}; }
  get preis() { return Number(this.daten?.preis) || STANDARD_KONFIG.setPreis; }
  get bestellt() { return BESTELLT.includes(this.daten?.status); }
  get nurVorschau() { return this.daten?.status === "vorschau"; }
  get mitAngebot() { return this.produkte.length > 0 && !this.bestellt; }
  // Ohne Foto (Heart: Analyse-Art). Die Seite spricht dann von dem, was er
  // erzaehlt hat - nie davon, was jemand gesehen haette.
  get ohneFoto() { return this.daten?.ohneBild === true; }

  #suche(name) {
    try { return new URLSearchParams(this.ort?.search || "").get(name); } catch { return null; }
  }

  async starte() {
    if (!this.kennung) { this.#weg(); return; }
    this.daten = await this.quelle.bericht();
    if (!this.daten) { this.#weg(); return; }

    // Noch nicht freigegeben: Die Warteseite steht auf der Analyseseite.
    // Die Vorschau nur mit ?vorschau=1 - sonst sieht der Patient seine
    // Warteseite, genau wie dort.
    const status = String(this.daten.status || "");
    if (status === "wartet" || (status === "vorschau" && this.#suche("vorschau") !== "1")) {
      this.ort.replace?.(`/analiza/${this.kennung}${this.ort.search || ""}`);
      return;
    }

    this.shitja = shitjaLesen(this.raport.shitja);
    this.produkte = await this.quelle.produkte(this.daten, "sq");

    this.#zeichnen();
    zeigen($("#t-laedt"), false);
    zeigen($("#t-faqja"), true);
    this.#ereignisse();
    this.#leiste();
    this.#lesemarken();

    if (!this.nurVorschau) {
      // Was er antippt und wie lange er wo liest - siehe
      // shared/lifeskin-klickpfad.js. Die Abschnitte tragen data-pfad.
      this.klickpfad = starteKlickpfad({
        seite: "Therapieseite",
        schreiben: (stapel) => this.quelle.klickpfadSchreiben(stapel),
        beobachte: "[data-pfad]:not(#leiste):not(#porosia)"
      });
      if (this.pixel.starte()) this.pixel.melde("opened");
      this.quelle.merken({ timings: { live: this.bestellt ? "ordered" : "fertig" } });
      this.#marke("berichtGeoeffnet");
    }
    if (globalThis.__mnyraStill === true && this.#suche("kasse") === "1") this.#porosia(true);
  }

  #weg() {
    zeigen($("#t-laedt"), false);
    zeigen($("#t-weg"), true);
  }

  // ---------- Zeichnen ----------

  #zeichnen() {
    const d = this.daten;
    const r = this.raport;
    const s = this.shitja || {};
    const name = String(d.name || "").trim();
    const mitProdukten = this.produkte.length > 0;

    schreibe($("#t-kodi"), d.code ? `Analiza ${d.code}` : "");
    document.documentElement.lang = d.sprache === "de" ? "de" : "sq";

    // 1. Oben: was die Anzeige versprochen hat.
    schreibe($("#t-syri"), mitProdukten ? "Terapia juaj është gati" : "Analiza juaj është gati");
    schreibe($("#t-titulli"), mitProdukten
      ? (name ? `${name}, kjo është terapia juaj për ${TAGE} ditë.` : `Terapia juaj për ${TAGE} ditë është gati.`)
      : (name ? `${name}, analiza juaj është gati.` : "Analiza juaj është gati."));
    this.#mjeku();
    const imText = [...new Set((s.produktet || []).map((p) => p.produkt_id))];
    mitFett($("#t-hyrja"), s.hyrja
      ? fettNachtragen(hyrjaAbgleichen(s.hyrja, this.produkte.length, imText), s.problemet)
      : this.#hyrjaErsatz());
    schreibe($("#t-shqetesimi"), s.shqetesimi || "");
    zeigen($("#t-shqetesimi"), Boolean(s.shqetesimi));
    zeigen($("#t-kontroll"), brauchtAbklaerung(r));

    for (const el of $$("[data-cmimi]")) schreibe(el, euro(this.preis));
    for (const el of $$("[data-dita]")) schreibe(el, `vetëm ${zahl(Math.round((this.preis / TAGE) * 100) / 100)} € në ditë`);
    for (const el of $$("[data-porosi]")) schreibe(el, `Fillo terapinë — ${euro(this.preis)}`);
    schreibe($("#t-dergo"), `Konfirmo porosinë — ${euro(this.preis)}`);

    this.#seti();
    this.#zusagen();
    zeigen($("#t-seti"), this.mitAngebot);
    zeigen($("#t-porositur"), this.bestellt);
    if (this.bestellt) this.#bestellstand();
    zeigen($("#t-paprodukt"), !mitProdukten);
    this.#whatsapp($("#t-wa1"));

    // 2. Warum genau diese Therapie.
    schreibe($("#t-psesyri"), mitProdukten ? "Pse pikërisht kjo terapi"
      : (this.ohneFoto ? "Çfarë na treguat" : "Çfarë pa Dr. Gashi"));
    schreibe($("#t-psetitulli"), this.ohneFoto
      ? (mitProdukten ? "Çfarë na treguat — dhe çfarë e trajton." : "Ajo që na përshkruat.")
      : (mitProdukten ? "Çfarë pa Dr. Gashi te ju — dhe çfarë e trajton." : "Gjetjet kryesore te ju."));
    this.#gjetjet();
    const diagnoza = String(r.diagnoza || "").trim();
    const vleresimi = $("#t-vleresimi");
    vleresimi.textContent = this.ohneFoto
      ? "Plani bazohet në përshkrimin tuaj. "
      : (diagnoza ? `Vlerësimi: ${diagnoza.replace(/;\s*/g, " · ")}. ` : "");
    zeigen($("#t-fotoftese"), this.ohneFoto && Boolean(LIFESKIN_WHATSAPP));
    const fotoWa = $("#t-fotowa");
    if (fotoWa && LIFESKIN_WHATSAPP) {
      const code = String(d.code || "");
      fotoWa.href = `https://wa.me/${LIFESKIN_WHATSAPP}?text=${encodeURIComponent(`Përshëndetje Dr. Gashi! Po ju dërgoj një foto për analizën time${code ? ` (${code})` : ""}.`)}`;
    }
    const link = element("a", null, "Analiza e plotë ↓");
    link.href = "#analiza";
    vleresimi.append(link);

    // 3.-6. Nur, wenn es eine Therapie gibt.
    this.#produktet();
    zeigen($("#merrni"), mitProdukten);
    zeigen($("#ditet"), mitProdukten);
    zeigen($("#rezultate"), mitProdukten);
    zeigen($("#vendimi"), this.mitAngebot);
    schreibe($("#t-dita28"), s.dita_28 || this.produkte[0]?.synimi || "Krahasojmë lëkurën tuaj me foton e sotme.");
    schreibe($("#t-psetani"), s.pse_tani || "");
    zeigen($("#t-psetani"), Boolean(s.pse_tani));

    // 8. Die ganze Analyse.
    this.#analiza();
  }

  #hyrjaErsatz() {
    // Nur der Kern jedes Befunds, fett - die Zone und der Rest stehen in
    // den Karten darunter.
    const teile = [this.raport.gjetjaKryesore, this.raport.gjetjaDyta]
      .map((x) => satzteil(kurzUndRest(x)[0])).filter(Boolean);
    const fuer = teile.length ? `Për ${teile.map((x) => `**${x}**`).join(" dhe ")}` : "";
    const n = this.produkte.length;
    if (!n) return fuer ? `${fuer}.` : String(this.raport.gjetjet || "").split(/(?<=\.)\s/)[0] || "";
    const rest = `${n === 1 ? "një produkt" : `${n} produkte`}, një plan i qartë dhe Dr. Gashi pranë jush çdo javë.`;
    return fuer ? `${fuer} — ${rest}` : rest.charAt(0).toUpperCase() + rest.slice(1);
  }

  // Wer beurteilt hat - nur mit bestaetigter aerztlicher Pruefung, wie
  // auf der Analyseseite (#urheber in astra.js).
  #mjeku() {
    const ohnePruefung = this.raport.schemaVersion === 3 && !this.raport.aerztlichGeprueft;
    zeigen($("#t-mjeku"), !ohnePruefung);
    if (ohnePruefung) return;
    schreibe($("#t-mjekuemri"), this.produkte.length ? "E zgjodhi Dr. Violeta Gashi" : "Dr. Violeta Gashi");
    const iso = this.daten.freigabeAt || this.daten.createdAt;
    // Die Monate von Hand: Viele Telefone kennen "sq-AL" nicht und
    // schreiben dann "September 6" auf eine albanische Seite.
    const MUAJT = ["janar", "shkurt", "mars", "prill", "maj", "qershor", "korrik", "gusht", "shtator", "tetor", "nëntor", "dhjetor"];
    const datum = iso ? new Date(iso) : null;
    const tag = datum && !Number.isNaN(datum.getTime()) ? `${datum.getDate()} ${MUAJT[datum.getMonth()]}` : "";
    schreibe($("#t-mjekudata"), tag ? `Dermatologe · ${tag}` : "Dermatologe");
  }

  #seti() {
    const ort = $("#t-setiprodukte");
    ort.replaceChildren();
    for (const p of this.produkte) {
      const fig = element("figure", "produkt-fig");
      fig.append(produktBild(p, "produkt-fig__bild"));
      const unter = element("figcaption", null, p.name);
      const klein = [p.nenName, p.inhalt].filter(Boolean).join(" · ");
      if (klein) unter.append(element("small", null, klein));
      fig.append(unter);
      ort.append(fig);
    }
    const n = this.produkte.length;
    const cipa = $("#t-seticipa");
    cipa.replaceChildren(...[n === 1 ? "1 produkt" : `${n} produkte`, `${TAGE} ditë`, "Plan personal", "Dr. Gashi çdo javë"]
      .map((x) => element("li", null, x)));
    schreibe($("#t-shportaprodukte"), `${this.produkte.map((p) => p.name).join(" + ")} · plan · ndjekje`);
  }

  // Nur was wirklich gilt - aus der Konfiguration, nicht aus dem Text.
  #zusagen() {
    const [von, bis] = STANDARD_KONFIG.lieferzeitTage || [];
    const tage = Number(STANDARD_KONFIG.rueckgabeTage) || 0;
    const nachnahme = (STANDARD_KONFIG.zahlarten || []).includes("nachnahme");
    const kurz = [
      nachnahme ? "Pagesë në dorëzim" : "",
      tage ? `${tage} ditë garanci` : "",
      von && bis ? `Dërgesa ${von}–${bis} ditë` : ""
    ].filter(Boolean);
    $("#t-siguria").replaceChildren(...kurz.map((x) => element("li", null, x)));
    schreibe($("#t-porosisiguria"), [nachnahme ? "Paguani kur ta merrni" : "", tage ? `${tage} ditë garanci` : "", "Transport falas"].filter(Boolean).join(" · "));
    schreibe($("#t-leistegaranci"), tage ? `${tage} ditë garanci` : "");

    const lang = [];
    if (nachnahme) lang.push(["Sot nuk jepni asnjë kartë.", " Paguani te dera, kur pakoja është në dorën tuaj."]);
    if (tage) lang.push([`${tage} ditë garanci kthimi parash.`, " Nëse nuk jeni të kënaqur, na shkruani dhe ju kthejmë shumën e paguar."]);
    lang.push(["Transport falas,", von && bis ? ` dërgesa ${von}–${bis} ditë.` : ""]);
    $("#t-premtimet").replaceChildren(...lang.map(([fett, rest]) => {
      const li = element("li");
      li.append(element("b", null, fett), rest);
      return li;
    }));
    schreibe($("#t-pagesa"), `${euro(this.preis)} gjithsej. Transporti është falas${nachnahme ? " dhe paguani te dera" : ""}. Nuk ka abonim dhe asnjë pagesë të përsëritur.`);
    schreibe($("#t-garancia"), tage
      ? `Keni ${tage} ditë nga marrja e pakos. Na shkruani dhe ju kthejmë shumën e paguar.`
      : "Na shkruani dhe e gjejmë bashkë një zgjidhje.");
  }

  #bestellstand() {
    const text = {
      bestellt: "Ju kontaktojmë për konfirmimin e adresës. Pagesa bëhet kur ta merrni pakon.",
      versandt: "Pakoja juaj është nisur. Pagesa bëhet kur ta merrni.",
      zugestellt: "Pakoja juaj është dorëzuar. Dr. Gashi ju ndjek gjatë 28 ditëve."
    }[this.daten.status] || "";
    schreibe($("#t-porositurtext"), text);
  }

  // Befund -> Mittel. Aus shitja.problemet; ohne ihn aus den Saetzen, die
  // in Heart je Produkt stehen, und den zwei wichtigsten Befunden.
  #gjetjet() {
    const nachId = new Map(this.produkte.map((p) => [p.id, p]));
    let eintraege = (this.shitja?.problemet || []).map((p) => ({ ...p, produkt: nachId.get(p.produkt_id) || null }));
    if (!eintraege.length) {
      // OHNE shitja (Befunde vor Prompt v8): kurze Zeilen aus dem, was da
      // ist. Der Befund je Produkt kommt aus nevojat, sonst aus den zwei
      // wichtigsten Befunden; der Satz darunter ist der kurze Katalogsatz
      // des Produkts - nicht der lange Satz aus Heart.
      const jeProdukt = new Map((Array.isArray(this.raport.nevojat) ? this.raport.nevojat : [])
        .map((n) => [String(n?.produkt_id || ""), String(n?.gjetja || "").trim()]));
      const befunde = [this.raport.gjetjaKryesore, this.raport.gjetjaDyta].map((x) => String(x || "").trim()).filter(Boolean);
      const karte = (roh, produkt) => {
        const [kern, rest] = kurzUndRest(roh);
        return { gjetja: kern, ku: rest, produkt, zgjidhja: produkt ? satzteil(produkt.kurz || "") || produkt.satz : "" };
      };
      eintraege = this.produkte.length
        ? this.produkte.map((p, i) => karte(jeProdukt.get(p.id) || befunde[i] || p.nenName || p.name, p))
        : befunde.map((b) => karte(b, null));
    }
    // JEDES PRODUKT DER SEITE HAT SEINE KARTE. Wurde in Heart ein Produkt
    // angehakt, das die Analyse nicht kannte, bekaeme es sonst keine - und
    // der Kunde saehe ein Produkt im Set, zu dem nirgends steht, wofuer.
    const abgedeckt = new Set(eintraege.map((e) => e.produkt?.id).filter(Boolean));
    for (const p of this.produkte) {
      if (abgedeckt.has(p.id)) continue;
      eintraege.push({ gjetja: p.nenName || p.name, ku: "", produkt: p, zgjidhja: satzteil(p.kurz || "") || p.satz });
    }
    const liste = $("#t-gjetjet");
    liste.replaceChildren(...eintraege.map((e) => {
      const li = element("li");
      const kopf = element("div");
      kopf.append(element("h3", null, e.gjetja));
      if (e.ku) kopf.append(element("p", null, e.ku));
      li.append(kopf);
      if (e.produkt) {
        const pfeil = element("span", "shigjeta", "→");
        pfeil.setAttribute("aria-hidden", "true");
        li.append(pfeil);
      }
      const satz = String(e.zgjidhja || "").trim();
      if (satz || e.produkt) {
        const p = element("p", "zgjidhja");
        if (e.produkt) mitProduktVorn(p, e.produkt.name, satz);
        else p.textContent = satz;
        li.append(p);
      }
      return li;
    }));
    zeigen($("#pse"), eintraege.length > 0);
  }

  #produktet() {
    const ort = $("#t-produktet");
    const perJu = new Map((this.shitja?.produktet || []).map((p) => [p.produkt_id, p.per_ju]));
    ort.replaceChildren(...this.produkte.map((p) => {
      const art = element("article", "produkt");
      const kopf = element("div", "produkt__kok");
      kopf.append(produktBild(p, "produkt__ikona"));
      const text = element("div");
      if (p.nenName) text.append(element("p", "syri syri--vogel", p.nenName));
      text.append(element("h3", null, p.name));
      const anwendung = [p.perdorimi?.koha, p.perdorimi?.sasia].filter(Boolean).join(" · ");
      if (anwendung) text.append(element("span", "perdorimi", anwendung));
      kopf.append(text);
      art.append(kopf);
      const punkte = (perJu.get(p.id) || []).length ? perJu.get(p.id) : (p.veprimi || []).slice(0, 3);
      if (punkte.length) {
        const ul = element("ul", "perfitimet");
        ul.append(...punkte.map((x) => element("li", null, x)));
        art.append(ul);
      }
      return art;
    }));

    const morgens = [];
    const abends = [];
    const sortiert = [...this.produkte].sort((a, b) => (Number(a.perdorimi?.hapi) || 9) - (Number(b.perdorimi?.hapi) || 9));
    for (const p of sortiert) {
      const zeit = tageszeiten(p.perdorimi?.koha);
      if (zeit.morgens) morgens.push(p.name);
      if (zeit.abends) abends.push(p.name);
    }
    schreibe($("#t-mengjes"), morgens.join(" → ") || "—");
    schreibe($("#t-mbremje"), abends.join(" → ") || "—");
    zeigen($("#t-rutina"), morgens.length + abends.length > 0);
  }

  #analiza() {
    const r = this.raport;
    // OHNE FOTO gibt es nichts, was gemessen wurde: keine Diagnose-Karte,
    // keine Zonen, keine zehn "nuk vlerësohet". Stattdessen, wie der Plan
    // entstanden ist - aus seiner Beschreibung.
    if (this.ohneFoto) {
      schreibe($("#t-analizasyri"), "Si u zgjodh plani juaj");
      schreibe($("#t-analizatitulli"), "Nga ajo që na treguat.");
      schreibe($("#t-faq1"), "Dr. Gashi e zgjodhi sipas përshkrimit tuaj. Nëse keni lëkurë shumë të ndjeshme ose përdorni ilaçe për lëkurën, na shkruani para se të filloni — dhe nëse dërgoni një foto, plani bëhet edhe më i saktë.");
      const metoda = $("#t-metoda");
      schreibe(metoda, "Ky plan bazohet në atë që na përshkruat. Një foto e lëkurës e bën vlerësimin më të saktë — mund ta dërgoni kurdo në WhatsApp, dhe gjatë 28 ditëve Dr. Gashi e shikon lëkurën tuaj çdo javë me skanim.");
      const summe = $("#t-metodablock summary");
      if (summe?.firstChild) summe.firstChild.textContent = "Si u vlerësua pa foto?";
      zeigen($("#t-diagnoza"), false);
      zeigen($("#t-zonatblock"), false);
      zeigen($("#t-parametratblock"), false);
      schreibe($("#t-permbledhja"), String(r.gjetjet || ""));
      const shpjegimi = Array.isArray(r.shpjegimi) ? r.shpjegimi.filter(Boolean) : [];
      $("#t-shpjegimi").replaceChildren(...shpjegimi.map((x) => element("p", null, x)));
      zeigen($("#t-shpjegimiblock"), shpjegimi.length > 0);
      this.#paKujdes(r);
      return;
    }
    const diagnoza = String(r.diagnoza || "").trim();
    zeigen($("#t-diagnoza"), Boolean(diagnoza));
    schreibe($("#t-diagnozaemri"), diagnoza.replace(/;\s*/g, " · "));
    schreibe($("#t-diagnozalat"), String(r.diagnozaLat || "").replace(/;\s*/g, " · "));
    const niveli = String(r.niveliEmri || "").trim();
    schreibe($("#t-niveli"), niveli);
    zeigen($("#t-niveli"), Boolean(niveli));
    schreibe($("#t-permbledhja"), String(r.gjetjet || ""));

    const zonat = Array.isArray(r.zonaLista) ? r.zonaLista : [];
    $("#t-zonat").replaceChildren(...zonat.map((z) => {
      const div = element("div");
      div.append(element("dt", null, z.zona), element("dd", null, z.teksti));
      return div;
    }));
    zeigen($("#t-zonatblock"), zonat.length > 0);

    const par = Array.isArray(r.parametrat) ? r.parametrat : [];
    $("#t-parametrat").replaceChildren(...par.map((p) => {
      const li = element("li", null, p.thjeshte && p.emri ? p.emri : (p.emri || p.thjeshte || ""));
      li.append(element("span", null, p.grada || ""));
      return li;
    }));
    const summe = $("#t-parametrattitulli");
    if (summe?.firstChild) summe.firstChild.textContent = `Të gjithë parametrat (${par.length})`;
    zeigen($("#t-parametratblock"), par.length > 0);

    const shpjegimi = Array.isArray(r.shpjegimi) ? r.shpjegimi.filter(Boolean) : [];
    $("#t-shpjegimi").replaceChildren(...shpjegimi.map((x) => element("p", null, x)));
    zeigen($("#t-shpjegimiblock"), shpjegimi.length > 0);

    this.#paKujdes(r);
  }

  #paKujdes(r) {
    const pk = r.paKujdes || {};
    const zeilen = [["Mund të zbehet", pk.zbehet], ["Çfarë mund të mbetet", pk.nukZbehet], ["Pas 6 muajsh", pk.pas6Muajsh]]
      .filter(([, text]) => String(text || "").trim());
    $("#t-pakujdes").replaceChildren(...zeilen.map(([titel, text]) => {
      const div = element("div");
      div.append(element("dt", null, titel), element("dd", null, text));
      return div;
    }));
    zeigen($("#t-pakujdesblock"), zeilen.length > 0);
  }

  #whatsapp(knopf) {
    if (!knopf) return;
    if (!LIFESKIN_WHATSAPP) { knopf.hidden = true; return; }
    knopf.href = this.#waLink();
  }

  #waLink() {
    const gruss = String(LIFESKIN_WHATSAPP_TEXT?.sq || "");
    const code = String(this.daten?.code || "");
    const text = gruss.includes("{code}") ? gruss.replace("{code}", code) : `${gruss}${code ? ` (${code})` : ""}`;
    return `https://wa.me/${LIFESKIN_WHATSAPP}?text=${encodeURIComponent(text)}`;
  }

  // ---------- Handlungen ----------

  #ereignisse() {
    document.addEventListener("click", (ereignis) => {
      const ziel = ereignis.target;
      if (!(ziel instanceof Element)) return;
      if (ziel.closest("[data-porosi]")) this.#porosia(true);
      else if (ziel.closest("[data-mbyll]")) this.#porosia(false);
      else if (ziel.closest("[data-hilfe]") && LIFESKIN_WHATSAPP) {
        globalThis.open?.(this.#waLink(), "_blank", "noopener");
      }
    });
    $("#forma")?.addEventListener("submit", (ereignis) => {
      ereignis.preventDefault();
      this.#bestellen();
    });

    // Anschrift begonnen / eingegeben - dieselben Schreibwege wie auf der
    // Analyseseite, damit "Nachfassen" in Heart dieselbe Liste bleibt.
    for (const id of ["#t-adresa", "#t-qyteti"]) {
      $(id)?.addEventListener("input", () => {
        if (this.nurVorschau || this.bestellt || this.anschriftBegonnen) return;
        if (!$(id)?.value.trim()) return;
        this.anschriftBegonnen = true;
        this.quelle.merken({ timings: { live: "address" } });
      });
      $(id)?.addEventListener("change", () => {
        if (this.nurVorschau || this.bestellt) return;
        const address = { strasse: $("#t-adresa")?.value.trim() || "", ort: $("#t-qyteti")?.value.trim() || "" };
        if (address.strasse || address.ort) this.quelle.merken({ address, timings: { live: "address" } });
      });
    }
  }

  #porosia(auf) {
    const blatt = $("#porosia");
    if (!auf) {
      blatt.hidden = true;
      document.body.classList.remove("pa-rreshqitje");
      this.leistePruefen?.();
      return;
    }
    if (!this.mitAngebot) return;
    const name = $("#t-emri");
    if (name && !name.value) name.value = this.daten.name || "";
    const tel = $("#t-telefon");
    if (tel && !tel.value && LIFESKIN_TELEFON_VORWAHL) tel.value = LIFESKIN_TELEFON_VORWAHL;
    zeigen($("#t-faleminderit"), false);
    for (const teil of ["#t-porosititulli", "#t-shporta", "#forma", "#t-porosifund"]) zeigen($(teil), true);
    blatt.hidden = false;
    document.body.classList.add("pa-rreshqitje");
    this.leistePruefen?.();

    this.#marke("kasseGeoeffnet");
    this.klickpfad?.melde("kasse", `Bestellschirm geöffnet · ${euro(this.preis)}`);
    if (!this.nurVorschau && !this.kasseGemerkt) {
      this.kasseGemerkt = true;
      this.quelle.merken({ kasseGeoeffnetAt: new Date().toISOString() });
    }
    if (!this.nurVorschau) this.quelle.merken({ timings: { live: "porosia" } });
  }

  async #bestellen() {
    if (this.nurVorschau || this.bestellt) return;
    const werte = {
      name: $("#t-emri")?.value.trim() || "",
      telefon: $("#t-telefon")?.value.trim() || "",
      strasse: $("#t-adresa")?.value.trim() || "",
      ort: $("#t-qyteti")?.value.trim() || ""
    };
    const fehler = $("#t-gabim");
    if (!werte.name || !werte.telefon || !werte.strasse || !werte.ort) {
      this.klickpfad?.melde("fehler", "Bestellung: nicht alle Felder ausgefüllt");
      schreibe(fehler, "Plotësoni të gjitha fushat.");
      zeigen(fehler, true);
      return;
    }
    zeigen(fehler, false);
    const knopf = $("#t-dergo");
    knopf.disabled = true;
    schreibe(knopf, "Po dërgohet…");

    const jetzt = new Date().toISOString();
    // ZUERST in die Sitzung - die Anschrift liest dort nur das CEO-Konto.
    const gespeichert = await this.quelle.merken({
      address: werte,
      phone: werte.telefon,
      timings: { live: "ordered" },
      order: {
        createdAt: jetzt,
        total: this.preis,
        payment: "nachnahme",
        status: "neu",
        orderId: this.daten.code || this.kennung,
        ...pixelKennungen()
      },
      step: "ordered"
    });
    if (gespeichert?.ok) await this.quelle.zustandSchreiben({ status: "bestellt", bestelltAt: jetzt });

    knopf.disabled = false;
    schreibe(knopf, `Konfirmo porosinë — ${euro(this.preis)}`);
    if (!gespeichert?.ok) {
      schreibe(fehler, "Nuk u dërgua. Provoni përsëri.");
      zeigen(fehler, true);
      return;
    }
    this.pixel.melde("ordered", { order: { total: this.preis, orderId: this.daten.code } });
    this.klickpfad?.melde("bestellt", `${euro(this.preis)} · ${this.produkte.map((p) => p.name).join(" + ")}`);
    this.klickpfad?.schicke();
    this.daten.status = "bestellt";
    this.daten.bestelltAt = jetzt;
    for (const teil of ["#t-porosititulli", "#t-shporta", "#forma", "#t-porosifund"]) zeigen($(teil), false);
    zeigen($("#t-faleminderit"), true);
    this.#zeichnen();
    this.leistePruefen?.();
  }

  // ---------- Leiste und Lesemarken ----------

  // Weg, solange ein Kaufknopf der Seite im Bild ist; sonst immer da.
  #leiste() {
    const leiste = $("#leiste");
    if (!this.mitAngebot) { zeigen(leiste, false); return; }
    zeigen(leiste, true);
    const pruefen = () => {
      if (!this.mitAngebot) { leiste.dataset.an = "nein"; return; }
      const hoehe = window.innerHeight;
      const imBild = (el) => {
        if (!el || el.hidden) return false;
        const r = el.getBoundingClientRect();
        return r.bottom > 0 && r.top < hoehe - 80;
      };
      const offen = !$("#porosia").hidden;
      leiste.dataset.an = !offen && !imBild($("#hero-knopf")) && !imBild($("#vendimi")) ? "ja" : "nein";
    };
    this.leistePruefen = pruefen;
    window.addEventListener("scroll", pruefen, { passive: true });
    window.addEventListener("resize", pruefen, { passive: true });
    pruefen();
  }

  #lesemarken() {
    if (typeof IntersectionObserver !== "function") return;
    const marken = [["#pse", "sahSchnitt"], ["#merrni", "sahTherapie"], ["#t-cmimi1", "sahPreis"]];
    const beobachter = new IntersectionObserver((eintraege) => {
      for (const e of eintraege) {
        if (!e.isIntersecting) continue;
        beobachter.unobserve(e.target);
        this.#marke(e.target.dataset.lesemarke);
      }
    }, { threshold: 0.25 });
    for (const [wahl, feld] of marken) {
      const knoten = $(wahl);
      if (!knoten || knoten.hidden || knoten.closest("[hidden]")) continue;
      knoten.dataset.lesemarke = feld;
      beobachter.observe(knoten);
    }
  }

  // Jede Marke einmal je Besuch, nie in der Vorschau.
  #marke(feld) {
    if (this.nurVorschau || !feld || this.marken.has(feld)) return;
    this.marken.add(feld);
    if (feld === "sahPreis") this.pixel.meldeKorb(this.preis);
    else if (feld === "kasseGeoeffnet") this.pixel.meldeKasse(this.preis);
    this.quelle.merken({ [feld]: true }).then((antwort) => {
      if (!antwort?.ok) this.marken.delete(feld);
    });
  }
}

if (typeof document !== "undefined" && !globalThis.__LIFESKIN_TEST__) {
  const start = () => new Terapia().starte();
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
}
