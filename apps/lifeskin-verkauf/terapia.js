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
import { AnalyseDaten, kennungAusPfad, dokument } from "../lifeskin-astra/astra-daten.js";
import { Pixel, pixelKennungen } from "../lifeskin/lifeskin-pixel.js";
import { STANDARD_KONFIG } from "../lifeskin/lifeskin-catalog.js";
import { LIFESKIN_WHATSAPP, LIFESKIN_WHATSAPP_TEXT, LIFESKIN_TELEFON_VORWAHL } from "../lifeskin/lifeskin-config.js";
import { brauchtAbklaerung } from "../../shared/lifeskin-raport-v3.js";
import { shitjaLesen } from "../../shared/lifeskin-shitja.js";
import { starteKlickpfad } from "../../shared/lifeskin-klickpfad.js";
import { ohneSeiteTief } from "../../shared/lifeskin-ohne-seite.js";
import {
  satzteil, kurzUndRest, fettNachtragen, hyrjaAbgleichen, ohneVerneinung, ohneFotoSaetze, fettTeile, produktVornRest
} from "../../shared/lifeskin-terapia-text.js";
// Dieselben Namen wie frueher auch von hier - Tests und andere Seiten
// holen sie aus dieser Datei.
export { kurzUndRest, fettNachtragen, hyrjaAbgleichen, ohneVerneinung, ohneFotoSaetze };
import { LIFESKIN_FIRESTORE_BASE, LIFESKIN_TENANT } from "../lifeskin/lifeskin-config.js";
import {
  RASTE_STANDARD, rasteLaden, rasteNormalisieren, rasteFuerBericht, rasteMitBildern, rastiProdukteText
} from "../../shared/lifeskin-raste.js";
import { KundenMedien } from "./terapia-medien.js";
import { untenNachziehenStarten } from "../../shared/lifeskin-unten.js";
import { NDJEKJA, NDJEKJA_TEXTE, KAUFWEG_VERSION, ndjekjaSichtbar } from "../../shared/lifeskin-ndjekja.js";
import { garancia } from "../../shared/lifeskin-garancia.js";
import { telefonPruefen } from "../../shared/lifeskin-telefon.js";
import { beispielKarte, ikone } from "./ndjekja-teile.js";

const $ = (wahl) => document.querySelector(wahl);
const $$ = (wahl) => Array.from(document.querySelectorAll(wahl));
const BESTELLT = ["bestellt", "versandt", "zugestellt"];
const TAGE = Number(STANDARD_KONFIG.reichweiteTage) || 28;
// Gesagt wird "4 javë", nicht "28 ditë": Wochen klingen nach einer
// Therapie mit Ende, Tage nach Dauerkauf (Wunsch Dr. Gashi, 25.09.).
const WOCHEN = Math.max(1, Math.round(TAGE / 7));

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

// **fett** aus dem Prompt als <b>, alles andere als Text. Kein HTML aus
// der Modellantwort erreicht die Seite.
export function mitFett(knoten, text) {
  if (!knoten) return;
  knoten.replaceChildren(...fettTeile(text).map((t) => (t.fett ? element("b", null, t.text) : t.text)));
}

// Der Produktname steht vorn und gruen (shared/lifeskin-terapia-text.js).
function mitProduktVorn(knoten, name, satz) {
  const rest = produktVornRest(name, satz);
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

// Die Bilder der Landingpage (Heart legt sie an). Dieselben Werte wie
// FOTO_PRAEFIX/FOTOS_MAX in apps/lifeskin-landing/shop.js - nicht von
// dort geholt, weil shop.js beim Laden den Laden der Landingpage startet.
const FOTO_PRAEFIX = "landingFotot-";
const FOTOS_MAX = 6;

// Kleine Zeichen, fest im Code - kein Text aus Daten landet in innerHTML.
function svgZeichen(klasse, inhalt, strich = "2") {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("fill", "none");
  svg.setAttribute("stroke", "currentColor");
  svg.setAttribute("stroke-width", strich);
  svg.setAttribute("stroke-linecap", "round");
  svg.setAttribute("stroke-linejoin", "round");
  svg.setAttribute("aria-hidden", "true");
  svg.setAttribute("class", klasse);
  svg.innerHTML = inhalt;
  return svg;
}
const ikonHaken = () => svgZeichen("seti__haken", '<circle cx="12" cy="12" r="10" fill="#edf2ed" stroke="none"/><path d="M7.5 12.5l3 3 6-6.5"/>', "2.4");
function ikoneAufziehen() {
  const span = element("span", "mjeti__shenje");
  span.setAttribute("aria-hidden", "true");
  span.append(svgZeichen("", '<path d="M9 4H4v5"/><path d="M15 4h5v5"/><path d="M15 20h5v-5"/><path d="M9 20H4v-5"/>', "2.2"));
  return span;
}
const ikoneZeit = (art) => svgZeichen("mjeti__kohaikona", art === "hena"
  ? '<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/>'
  : '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5L19 19M5 19l1.5-1.5M17.5 6.5L19 5"/>', "2.4");
const ikoneZusage = (art) => svgZeichen("pergjigjet__ikona", {
  para: '<rect x="2.5" y="6" width="19" height="12" rx="2"/><circle cx="12" cy="12" r="2.5"/>',
  garanci: '<path d="M12 3l8 3v6c0 4.5-3.4 8-8 9-4.6-1-8-4.5-8-9V6z"/><path d="M8.5 12l2.5 2.5 4.5-5"/>',
  transport: '<path d="M2.5 6h11v10h-11zM13.5 9.5h4l3 3.5V16h-7"/><circle cx="6.5" cy="17.5" r="1.8"/><circle cx="17" cy="17.5" r="1.8"/>'
}[art] || "", "1.9");

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

// Die Antwort auf "Kur shoh ndryshim?": in 4 Wochen, und was genau
// verschwinden soll - seine Karten, nicht ein allgemeiner Satz.
// Aeltere Befunde sprechen noch von 28 Tagen - die Seite sagt ueberall 4 Wochen.
export function wochenStattTage(text) {
  return String(text || "")
    .replace(/\b([Pp])as\s+28\s+ditësh/g, "$1as 4 javësh")
    .replace(/\b28\s+ditëve/g, "4 javëve")
    .replace(/\b28\s+ditë(?![a-zë])/g, "4 javë");
}

// WAS DIE SEITE UEBER DIE BEGLEITUNG SAGT, MUSS STIMMEN (Auftrag vom
// 26.09., Punkt 2): "Dr. Gashi ... çdo javë" nur, wenn festgelegt ist,
// dass sie die Eintraege prueft (NDJEKJA.pruefer). Sonst spricht die neue
// Fassung von "ne" - ohne jemanden zu nennen und ohne "me skanim": Die
// woechentliche Kontrolle ist die Durchsicht der Eintraege, kein Scan.
// Nur in der neuen Fassung; die klassische bleibt Wort fuer Wort.
export function ohneWochenversprechen(text, pruefer = NDJEKJA.pruefer) {
  const t = String(text || "");
  if (String(pruefer || "").trim()) return t;
  return t
    .replace(/Dr\.? Gashi ju ndjek çdo javë dhe e përshtat planin/g, "ju ndjekim çdo javë dhe e përshtatim planin")
    .replace(/Dr\.? Gashi pranë jush çdo javë/g, "ndjekje çdo javë")
    .replace(/Dr\.? Gashi e kontrollon çdo javë me skanim/g, "Në kontrollet e planifikuara shqyrtojmë ecurinë")
    .replace(/(^|[.!?]\s+)Dr\.? Gashi ju ndjek/g, "$1Ju ndjekim")
    .replace(/Dr\.? Gashi ju ndjek/g, "ju ndjekim");
}

export function faqNdryshimi(problemet, wochen = 4) {
  const liste = [...new Set((problemet || [])
    .map((p) => [p?.gjetja, p?.ku].map((x) => String(x || "").trim()).filter(Boolean).join(" "))
    .filter(Boolean)
    .map((x) => x.charAt(0).toLowerCase() + x.slice(1)))].slice(0, 3);
  if (!liste.length) return "";
  const aufgezaehlt = liste.length === 1 ? liste[0] : `${liste.slice(0, -1).join(", ")}, si dhe ${liste.at(-1)}`;
  return `Brenda ${wochen} javëve lëkura juaj ndryshon dukshëm – synojmë t'i largojmë plotësisht: ${aufgezaehlt}. Dr. Gashi e kontrollon çdo javë me skanim.`;
}

export class Terapia {
  constructor({ fetchFn, ort, pixel } = {}) {
    this.ort = ort || globalThis.location;
    this.quelle = new AnalyseDaten({ fetchFn, kennung: kennungAusPfad(this.ort?.pathname) });
    this.pixel = pixel || new Pixel({ seite: "befund" });
    this.daten = null;
    this.produkte = [];
    this.marken = new Set();
    // WELCHE FASSUNG: die klassische, oder die mit der Begleitung - diese
    // nur mit ?ndjekja=1, bis NDJEKJA.imVerkauf an ist (Vorschau).
    this.variante = ndjekjaSichtbar(this.ort?.search) ? KAUFWEG_VERSION.ndjekja : KAUFWEG_VERSION.klassisch;
    this.kaufMarken = new Set();
  }

  get kennung() { return this.quelle.kennung; }
  // Die neue Fassung (Begleitung, Angebot, Kasse) - siehe oben.
  get neu() { return this.variante === KAUFWEG_VERSION.ndjekja; }
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
    // Nie "links" oder "rechts" (gespiegelte Fotos) - auch nicht in
    // Befunden, die vor dieser Regel freigegeben wurden.
    this.daten = ohneSeiteTief(this.daten);

    // Noch nicht freigegeben: Die Warteseite steht auf der Analyseseite.
    // Die Vorschau nur mit ?vorschau=1 - sonst sieht der Patient seine
    // Warteseite, genau wie dort.
    const status = String(this.daten.status || "");
    if (status === "wartet" || (status === "vorschau" && this.#suche("vorschau") !== "1")) {
      this.ort.replace?.(`/analiza/${this.kennung}${this.ort.search || ""}`);
      return;
    }

    this.shitja = shitjaLesen(this.raport.shitja);
    if (this.ohneFoto && this.shitja) {
      for (const feld of ["shqetesimi", "dita_28", "pse_tani"]) this.shitja[feld] = ohneFotoSaetze(this.shitja[feld]);
    }
    this.produkte = await this.quelle.produkte(this.daten, "sq");

    if (this.neu) document.documentElement.dataset.fassung = this.variante;
    this.#zeichnen();
    zeigen($("#t-laedt"), false);
    zeigen($("#t-faqja"), true);
    // Die Vorher/Nachher-Faelle kommen nach: Die Seite steht schon, und
    // bis sie da sind, zeigt der Abschnitt die Faelle aus dem HTML.
    this.#raste();
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
      this.#kauf("geoeffnet");
    }
    if (globalThis.__mnyraStill === true && this.#suche("kasse") === "1") this.#porosia(true);
  }

  // DIE ERGEBNISSE ANDERER - welche, entscheidet Heart je Befund
  // (bericht.raste, in dieser Reihenfolge). Ohne Wahl der Fall, der am
  // besten zu diesen Produkten passt. Gepflegt werden die Faelle in
  // Heart; ohne gespeicherte Liste gelten die bisherigen (RASTE_STANDARD).
  async #raste() {
    const behaelter = $("#rezultate .raste");
    if (!behaelter) return;
    const basis = `${LIFESKIN_FIRESTORE_BASE}/lifeskin/${LIFESKIN_TENANT}/config`;
    const holen = this.quelle.fetchFn;
    let faelle;
    try {
      const liste = (await rasteLaden(basis, holen)) || rasteNormalisieren(RASTE_STANDARD);
      const ids = (this.daten?.produkte || []).map((p) => String(p?.id || ""));
      faelle = await rasteMitBildern(rasteFuerBericht(liste, this.daten?.raste, ids), basis, holen);
    } catch {
      return;
    }
    if (!faelle.length) {
      this.rasteLeer = true;
      zeigen($("#rezultate"), false);
      return;
    }
    behaelter.replaceChildren(...faelle.map((r) => {
      const figur = element("figure", "rasti");
      const foto = element("div", "rasti__foto");
      const para = element("img");
      para.src = r.para; para.alt = "Para terapisë"; para.loading = "lazy";
      const pas = element("img");
      pas.src = r.pas; pas.alt = `Pas ${WOCHEN} javësh`; pas.loading = "lazy";
      foto.append(para, element("span", null, "Para"), pas, element("span", "pas", `Java ${WOCHEN}`));
      const gjetja = r.gjetja ? r.gjetja.charAt(0).toLowerCase() + r.gjetja.slice(1) : "";
      const text = element("figcaption", null, [r.emri, gjetja].filter(Boolean).join(" · "));
      if (r.produkte.length) text.append(document.createElement("br"), element("b", null, rastiProdukteText(r)));
      figur.append(foto, text);
      return figur;
    }));
  }

  // DIE KUNDENFOTOS UND -VIDEOS (terapia-medien.js). Einmal gebaut; nach
  // der Bestellung zeichnet die Seite neu, die Reihe bleibt stehen.
  #medien(mitProdukten) {
    const abschnitt = $("#klientet");
    if (!mitProdukten) { zeigen(abschnitt, false); return; }
    if (this.kundenMedien) return;
    this.kundenMedien = new KundenMedien({
      abschnitt,
      reihe: $("#t-medien"),
      basis: LIFESKIN_FIRESTORE_BASE,
      tenant: LIFESKIN_TENANT,
      fetchFn: this.quelle.fetchFn,
      zaehlen: !this.nurVorschau && globalThis.__mnyraStill !== true,
      name: this.daten?.name,
      melde: (m) => this.klickpfad?.melde("kommentar", `${m.art === "video" ? "Video" : "Foto"} · ${m.produkt || m.id}`),
      nachSchliessen: () => this.untenNachziehen?.(),
      kaufen: this.mitAngebot ? { text: `Fillo terapinë — ${euro(this.preis)}`, tun: () => this.#porosia(true), gilt: () => this.mitAngebot } : null
    });
    this.kundenMedien.zeige(this.daten?.klientet);
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
      ? (name ? `${name}, kjo është terapia juaj për ${WOCHEN} javë.` : `Terapia juaj për ${WOCHEN} javë është gati.`)
      : (name ? `${name}, analiza juaj është gati.` : "Analiza juaj është gati."));
    this.#mjeku();
    // Fielen Karten weg, weil ihr Produkt nicht im Set ist, nennt der Satz
    // der Analyse Probleme, die diese Therapie nicht behandelt. Dann wird
    // er aus den Karten gebaut, die bleiben.
    const alleKarten = s.problemet || [];
    const bleiben = alleKarten.filter((p) => this.#karteGilt(p));
    if (s.hyrja && bleiben.length && bleiben.length < alleKarten.length) {
      const teile = bleiben.slice(0, 2).map((p) => `**${satzteil([p.gjetja, p.ku].filter(Boolean).join(" "))}**`);
      const n = this.produkte.length;
      s.hyrja = `Për ${teile.join(" dhe ")} — ${n === 1 ? "një produkt" : `${n} produkte`}, një plan i qartë dhe Dr. Gashi pranë jush çdo javë.`;
    }
    const imText = [...new Set((s.produktet || []).map((p) => p.produkt_id))];
    const hyrja = s.hyrja
      ? fettNachtragen(hyrjaAbgleichen(s.hyrja, this.produkte.length, imText), s.problemet)
      : this.#hyrjaErsatz();
    mitFett($("#t-hyrja"), this.neu ? ohneWochenversprechen(hyrja) : hyrja);
    schreibe($("#t-shqetesimi"), s.shqetesimi || "");
    zeigen($("#t-shqetesimi"), Boolean(s.shqetesimi));
    zeigen($("#t-kontroll"), brauchtAbklaerung(r));

    for (const el of $$("[data-cmimi]")) schreibe(el, euro(this.preis));
    const jeTag = zahl(Math.round((this.preis / TAGE) * 100) / 100);
    for (const el of $$("[data-dita]")) schreibe(el, `vetëm ${jeTag} € në ditë`);
    // Neue Fassung: oben steht ausdruecklich, dass der Preis der Endpreis
    // ist - mit Lieferung (Auftrag, Punkt 9). Der Preis selbst bleibt.
    if (this.neu) schreibe($("#t-cmimi1 [data-dita]"), `gjithsej me dërgesë · ${jeTag} € në ditë`);
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

    const link = element("a", null, "Analiza e plotë ↓");
    link.href = "#analiza";
    vleresimi.append(link);

    // 3.-6. Nur, wenn es eine Therapie gibt.
    this.#produktet();
    zeigen($("#merrni"), mitProdukten);
    // Die neue Fassung ersetzt "Nuk mbeteni vetëm" durch die Begleitung.
    zeigen($("#ditet"), mitProdukten && !this.neu);
    zeigen($("#ndjekja"), mitProdukten && this.neu);
    if (mitProdukten && this.neu) this.#ndjekja();
    zeigen($("#rezultate"), mitProdukten && !this.rasteLeer);
    // Kundenfotos und -videos: nur die, die Heart fuer diesen Befund
    // gewaehlt hat, in dieser Reihenfolge. Keines gewaehlt: kein Abschnitt.
    this.#medien(mitProdukten);
    zeigen($("#vendimi"), this.mitAngebot);
    schreibe($("#t-dita28"), s.dita_28 || this.produkte[0]?.synimi || "Krahasojmë lëkurën tuaj me foton e sotme.");
    schreibe($("#t-psetani"), s.pse_tani || "");
    // "Kur shoh ndryshim?" - mit SEINEN Problemen, als Ziel: weg in 4 Wochen.
    const faq2 = faqNdryshimi((s.problemet || []).filter((p) => this.#karteGilt(p)), WOCHEN)
      || $("#t-faq2")?.textContent || "";
    schreibe($("#t-faq2"), this.neu ? ohneWochenversprechen(faq2) : faq2);
    zeigen($("#t-psetani"), Boolean(s.pse_tani));

    // 8. Die ganze Analyse.
    this.#analiza();
    if (this.neu) this.#neueWorte();
  }

  // DIE UEBRIGEN SAETZE UEBER DIE BEGLEITUNG - nur in der neuen Fassung,
  // damit oben, in der Mitte und unten dasselbe steht wie im Abschnitt
  // "Katër javë". Einmal gesetzt, bleibt es beim Neuzeichnen stehen.
  #neueWorte() {
    const liste = $("#merrni .perfshihet");
    if (liste && liste.dataset.fassung !== this.variante) {
      liste.dataset.fassung = this.variante;
      const punkt = (fett, rest) => {
        const li = element("li");
        li.append(element("b", null, fett), ` — ${rest}`);
        return li;
      };
      liste.replaceChildren(
        punkt("Plani juaj personal", "çfarë, kur dhe në çfarë radhe"),
        punkt(`Ndjekje ${WOCHEN}-javore`, "shënime të shkurtra dhe kontroll javor i planifikuar"),
        punkt("Vlerësimi përmbyllës", `në ditën ${TAGE}, me hapin e radhës`)
      );
    }
    for (const el of $$("#rezultate .shenim")) schreibe(el, ohneWochenversprechen(el.textContent));
    // "Na shkruani 24/7" versprach Betreuung rund um die Uhr - das ist
    // organisatorisch nicht abgesichert (Auftrag, Punkt 4).
    for (const li of $$("#instagram .insta__fakten li")) {
      if (/24\/7/.test(li.textContent || "")) li.replaceChildren("Na shkruani në ", element("b", null, "WhatsApp"));
    }
  }

  // Eine Karte gilt, wenn ihr Produkt im Set ist - oder wenn sie ehrlich
  // ohne Produkt dasteht und auch keines im Satz nennt.
  #karteGilt(p) {
    if (p?.produkt_id) return this.produkte.some((x) => x.id === p.produkt_id);
    return !/^LF [A-Z]/.test(String(p?.zgjidhja || ""));
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

  // DIE PRODUKTE WIE AUF DER LANDINGPAGE (shop.js #karte): eigene Karten
  // direkt auf der Seite, Bilder zum Wischen, Antippen oeffnet das Blatt.
  // Kein Kaufknopf je Mittel - gekauft wird das Paket darunter.
  //
  // In der Reihenfolge der Anwendung (perdorimi.hapi), mit Nummer: So
  // liest sich die Reihe als Behandlung und nicht als Regal.
  #seti() {
    const sortiert = [...this.produkte].sort((a, b) => (Number(a.perdorimi?.hapi) || 9) - (Number(b.perdorimi?.hapi) || 9));
    const ort = $("#t-setiprodukte");
    ort?.classList.toggle("mjetet__rrjeta--nje", sortiert.length === 1);
    ort?.classList.toggle("mjetet__rrjeta--shume", sortiert.length > 2);
    ort?.replaceChildren(...sortiert.map((p, i) => this.#mjetiKarte(p, i + 1)));
    zeigen($("#t-mjetet"), sortiert.length > 0);
    this.#mjetetPunkte();
    this.#mjetetFotot();

    const n = this.produkte.length;
    const cipa = $("#t-seticipa");
    cipa?.replaceChildren(...[n === 1 ? "1 produkt" : `${n} produkte`, `${WOCHEN} javë`, "Plan personal",
      this.neu ? `Ndjekje ${WOCHEN}-javore` : "Dr. Gashi çdo javë"]
      .map((x) => element("li", null, x)));
    schreibe($("#t-shportaprodukte"), `${this.produkte.map((p) => p.name).join(" + ")} · plan · ndjekje`);

    // DIE PAKET-KARTE: was drin ist, als Liste mit Haken - statt Chips.
    schreibe($("#t-setititull"), `Paketa juaj ${WOCHEN}-javore`);
    schreibe($("#t-setinen"), this.ohneFoto ? "E zgjodhi Dr. Gashi sipas përshkrimit tuaj" : "E zgjodhi Dr. Gashi sipas fotove tuaja");
    const mengen = [...new Set(sortiert.map((p) => p.inhalt).filter(Boolean))];
    const menge = n > 1 && mengen.length === 1 ? `1 × secili · ${mengen[0]}`
      : sortiert.map((p) => [`1 × ${p.name}`, p.inhalt].filter(Boolean).join(" ")).join(" · ");
    const zeiten = sortiert.map((p) => tageszeiten(p.perdorimi?.koha));
    const plan = zeiten.some((z) => z.morgens) && zeiten.some((z) => z.abends)
      ? "Plan personal për mëngjes e mbrëmje" : "Plan personal: kur dhe si i përdorni";
    const punkte = [
      [sortiert.map((p) => p.name).join(" + "), menge],
      [plan, ""],
      this.neu ? [`Ndjekje ${WOCHEN}-javore`, "Me kontroll javor të planifikuar"] : ["Dr. Gashi ju kontrollon çdo javë", "Ndryshimi pas disa javësh"]
    ];
    $("#t-setilista")?.replaceChildren(...punkte.map(([text, klein]) => {
      const li = element("li");
      li.append(ikonHaken());
      const block = element("div", null, text);
      if (klein) block.append(element("small", null, klein));
      li.append(block);
      return li;
    }));

    // NEUE FASSUNG: die Liste oben nennt den Inhalt schon - kein zweites
    // "Në pako". Der kurze Sprung zur Begleitung bleibt.
    const pako = $("#t-pako");
    zeigen(pako, false);
    if (this.neu && pako) {
      pako.replaceChildren("Në pako: ", ...this.produkte.flatMap((p, i) => {
        const teil = [element("b", null, `1 × ${p.name}`)];
        if (p.inhalt) teil.push(` (${p.inhalt})`);
        return i ? [" · ", ...teil] : teil;
      }));
    }
    const link = $("#t-ndjekjalink");
    zeigen(link, this.neu && n > 0);
    if (this.neu) schreibe(link, `Si funksionon ndjekja ${WOCHEN}-javore ↓`);
  }

  // Die Bilder eines Mittels: zuerst die der Landingpage (Heart,
  // config/landingFotot-<id>), sonst das Produktfoto, sonst die Zeichnung.
  #bilderVon(p) {
    const fotot = this.landingFotot?.get(p.id) || [];
    if (fotot.length) return fotot;
    return p.foto ? [p.foto] : [];
  }

  #bahn(p, klasse) {
    const bahn = element("div", `${klasse}__bahn`);
    bahn.dataset.bahn = "";
    const bilder = this.#bilderVon(p);
    if (!bilder.length) {
      const fig = element("figure", `${klasse}__pamje ${klasse}__pamje--zeichnung`);
      fig.append(produktBild(p, "mjeti__zeichnung"));
      bahn.append(fig);
      return { bahn, anzahl: 1 };
    }
    bahn.append(...bilder.map((src, i) => {
      const fig = element("figure", `${klasse}__pamje`);
      const img = element("img");
      img.src = src;
      img.alt = i === 0 ? p.name : "";
      img.decoding = "async";
      if (i > 0) img.loading = "lazy";
      fig.append(img);
      return fig;
    }));
    return { bahn, anzahl: bilder.length };
  }

  static #punkteVon(anzahl) {
    if (anzahl < 2) return null;
    const pika = element("div", "mjeti__pika");
    pika.setAttribute("aria-hidden", "true");
    for (let i = 0; i < anzahl; i += 1) pika.append(element("i"));
    return pika;
  }

  #mjetiKarte(p, nr) {
    const art = element("article", "mjeti");
    art.dataset.mjetiHap = p.id;
    const pamjet = element("div", "mjeti__pamjet");
    // Solange die Bilder der Landingpage unterwegs sind, steht nur die
    // Flaeche da (Platz reserviert) - kein Packshot, der gleich danach
    // gegen ein anderes Bild springt.
    if (this.landingFotot) {
      const { bahn, anzahl } = this.#bahn(p, "mjeti");
      bahn.tabIndex = 0;
      bahn.setAttribute("role", "group");
      bahn.setAttribute("aria-label", p.name);
      pamjet.append(bahn);
      // Ohne Punkte bleibt die Zeile leer stehen - sonst sitzt der Name
      // eines Mittels mit einem Bild hoeher als der seines Nachbarn.
      pamjet.append(Terapia.#punkteVon(anzahl) || element("div", "mjeti__pika"));
    } else {
      pamjet.append(element("div", "mjeti__bahn mjeti__bahn--pret"), element("div", "mjeti__pika"));
    }
    const nummer = element("span", "mjeti__nr", String(nr));
    nummer.setAttribute("aria-hidden", "true");
    pamjet.append(nummer, ikoneAufziehen());
    art.append(pamjet);

    const fjale = element("div", "mjeti__fjale");
    const emer = element("p", "mjeti__emer", p.name);
    if (p.inhalt) emer.append(element("span", "mjeti__sasi", p.inhalt));
    fjale.append(emer);
    if (p.nenName) fjale.append(element("p", "mjeti__nen", p.nenName));
    const zeit = tageszeiten(p.perdorimi?.koha);
    const koha = zeit.morgens && zeit.abends ? ["dielli", "2× në ditë"]
      : zeit.abends ? ["hena", "Mbrëmje"] : zeit.morgens ? ["dielli", "Mëngjes"] : null;
    if (koha) {
      const chip = element("span", "mjeti__koha");
      chip.append(ikoneZeit(koha[0]), koha[1]);
      fjale.append(chip);
    }
    art.append(fjale);
    // Tastatur und Vorleser: die ganze Karte ist ein Knopf.
    art.tabIndex = 0;
    art.setAttribute("role", "button");
    art.setAttribute("aria-label", `${p.name}${p.nenName ? ` · ${p.nenName}` : ""} – shiko detajet`);
    return art;
  }

  // Die Bilder der Landingpage: je Mittel ein Dokument, parallel und nur
  // fuer die Mittel dieses Befunds (nicht die ganze Sammlung wie shop.js).
  // Kommt nichts oder dauert es zu lange, bleibt das Produktfoto.
  async #mjetetFotot() {
    if (this.landingFotot || this.fototLaufen) return;
    this.fototLaufen = true;
    const basis = `${LIFESKIN_FIRESTORE_BASE}/lifeskin/${LIFESKIN_TENANT}/config`;
    const holen = this.quelle.fetchFn || globalThis.fetch;
    const karte = new Map();
    const einzeln = async (id) => {
      try {
        const antwort = await holen(`${basis}/${FOTO_PRAEFIX}${encodeURIComponent(id)}`);
        if (!antwort.ok) return;
        const liste = dokument(await antwort.json()).fotot;
        const fotot = (Array.isArray(liste) ? liste : [])
          .filter((f) => typeof f === "string" && f.startsWith("data:image/")).slice(0, FOTOS_MAX);
        if (fotot.length) karte.set(id, fotot);
      } catch { /* dann das Produktfoto */ }
    };
    const frist = new Promise((fertig) => setTimeout(fertig, 4000));
    await Promise.race([Promise.all(this.produkte.map((p) => einzeln(p.id))), frist]);
    this.landingFotot = karte;
    this.#seti();
  }

  #mjetetPunkte() {
    for (const pamjet of $$(".mjeti__pamjet, .mjetiblatt__pamjet")) {
      const bahn = pamjet.querySelector("[data-bahn]");
      const punkte = pamjet.querySelector(".mjeti__pika");
      if (!bahn || !punkte || bahn.dataset.gebunden) continue;
      bahn.dataset.gebunden = "1";
      const setzen = () => {
        const an = Math.round(bahn.scrollLeft / (bahn.clientWidth || 1));
        [...punkte.children].forEach((x, i) => x.toggleAttribute("data-an", i === an));
      };
      setzen();
      let wartet = false;
      bahn.addEventListener("scroll", () => {
        if (wartet) return;
        wartet = true;
        requestAnimationFrame(() => { wartet = false; setzen(); });
      }, { passive: true });
    }
  }

  // DAS BLATT: dieselbe Reihenfolge wie auf der Landingpage (shop.js
  // #blatt) - Bilder, wofuer, Versprechen, Wirkung, Anwendung. Dazu der
  // Satz, den Dr. Gashi fuer DIESEN Befund geschrieben hat.
  #blattOeffnen(id) {
    const p = this.produkte.find((x) => x.id === id);
    const blatt = $("#mjetiblatt");
    const trup = $("#mjetiblatt-trup");
    if (!p || !blatt || !trup) return;
    schreibe($("#mjetiblatt-titull"), p.name);
    const pamjet = element("div", "mjetiblatt__pamjet");
    const { bahn, anzahl } = this.#bahn(p, "mjetiblatt");
    pamjet.append(bahn);
    const pika = Terapia.#punkteVon(anzahl);
    if (pika) pamjet.append(pika);
    const teile = [pamjet];
    const unter = [p.nenName, p.inhalt].filter(Boolean).join(" · ");
    if (unter) teile.push(element("p", "mjetiblatt__nen", unter));
    const satz = String(p.satz || p.kurz || "").trim();
    if (satz) teile.push(element("p", "mjetiblatt__kurz", satz));
    // Die Seite sagt ueberall Wochen, nie "Tag 28" (siehe WOCHEN).
    const frist = wochenStattTage(p.synimi).replace(/\bDeri në ditën\s+28\b/g, `Brenda ${WOCHEN} javësh`);
    const synimi = this.neu ? ohneWochenversprechen(frist) : frist;
    if (synimi) teile.push(element("p", "mjetiblatt__synim", synimi));
    if ((p.veprimi || []).length) {
      const pjese = element("section", "mjetiblatt__pjese");
      const ul = element("ul", "mjetiblatt__lista");
      ul.append(...p.veprimi.slice(0, 5).map((x) => element("li", null, x)));
      pjese.append(element("h3", null, "Si vepron"), ul);
      teile.push(pjese);
    }
    const anwendung = [["Kur", p.perdorimi?.koha], ["Sa", p.perdorimi?.sasia], ["Si", p.perdorimi?.si]]
      .filter(([, wert]) => String(wert || "").trim());
    if (anwendung.length || p.perdorimi?.kujdes) {
      const pjese = element("section", "mjetiblatt__pjese");
      pjese.append(element("h3", null, "Si përdoret"));
      if (anwendung.length) {
        const dl = element("dl", "mjetiblatt__perdorimi");
        dl.append(...anwendung.map(([marke, wert]) => {
          const zeile = element("div");
          zeile.append(element("dt", null, marke), element("dd", null, wert));
          return zeile;
        }));
        pjese.append(dl);
      }
      if (p.perdorimi?.kujdes) pjese.append(element("p", "mjetiblatt__kujdes", p.perdorimi.kujdes));
      teile.push(pjese);
    }
    trup.replaceChildren(...teile);
    trup.scrollTop = 0;
    this.blattVon = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    blatt.hidden = false;
    document.body.classList.add("pa-rreshqitje");
    this.#mjetetPunkte();
    blatt.querySelector(".mjetiblatt__mbyll")?.focus({ preventScroll: true });
    this.klickpfad?.melde("produkt", p.name);
  }

  #blattSchliessen() {
    const blatt = $("#mjetiblatt");
    if (!blatt || blatt.hidden) return;
    blatt.hidden = true;
    if ($("#porosia")?.hidden !== false) document.body.classList.remove("pa-rreshqitje");
    this.blattVon?.focus?.({ preventScroll: true });
  }

  // Nur was wirklich gilt - aus der Konfiguration, nicht aus dem Text.
  #zusagen() {
    const [von, bis] = STANDARD_KONFIG.lieferzeitTage || [];
    const tage = Number(STANDARD_KONFIG.rueckgabeTage) || 0;
    const nachnahme = (STANDARD_KONFIG.zahlarten || []).includes("nachnahme");
    // DIE VIER ANTWORTEN, DIREKT UNTER DEM PREIS (oben und unten).
    //
    // Gemessen (22.-24.09.): Drei von vier Kaeufern hatten vorher genau
    // diese Fragen aufgeklappt - passt es zu mir, wann sehe ich etwas,
    // wie zahle ich, und wenn es nicht wirkt. Die anderen verliessen die
    // Seite nach vier Minuten, ohne die Antworten je gesehen zu haben.
    // Garantie und Zahlung kommen aus der Konfiguration, nie aus dem Text.
    // DIE GARANTIE DER NEUEN FASSUNG: derselbe Ablauf kurz wie lang - erst
    // die Routine anpassen, dann das Geld (shared/lifeskin-garancia.js).
    const g = this.neu ? garancia(tage, { nachnahme }) : null;
    const antworten = (this.neu ? [
      ["Për lëkurën tuaj", this.ohneFoto ? "Dr. Gashi e zgjodhi sipas përshkrimit tuaj." : "Dr. Gashi e zgjodhi sipas fotove tuaja."],
      ["Ndjekja", `${WOCHEN} javë, me kontroll javor të planifikuar.`, { text: "Si funksionon", href: "#ndjekja" }],
      nachnahme ? ["Pagesa", "Te dera, kur pakoja është në dorën tuaj."] : null,
      g ? ["Garancia", `${g.tage} ditë nga marrja e pakos.`, { text: "Kushtet", href: "#garancia" }] : null
    ] : [
      ["Për lëkurën tuaj", this.ohneFoto ? "Dr. Gashi e zgjodhi sipas përshkrimit tuaj." : "Dr. Gashi e zgjodhi sipas fotove tuaja."],
      ["Ndryshimi", "Pas disa javësh – ju kontrollojmë çdo javë."],
      nachnahme ? ["Pagesa", "Te dera, kur pakoja është në dorën tuaj."] : null,
      tage ? ["Garancia", `${tage} ditë – ose ju kthejmë paratë.`] : null
    ]).filter(Boolean);
    const antwortenBauen = () => antworten.map(([frage, antwort, link]) => {
      const zelle = element("div");
      const text = element("span", null, antwort);
      if (link) {
        const a = element("a", null, `${link.text} ↓`);
        a.href = link.href;
        text.append(" ", a);
      }
      zelle.append(element("b", null, frage), text);
      return zelle;
    });
    // OBEN: drei kurze Zusagen unter dem Knopf, als Reihe mit Zeichen.
    // "Für Ihre Haut" steht im Kopf der Paket-Karte, die woechentliche
    // Kontrolle in ihrer Liste - die vier Antworten bleiben alle da.
    const zusagen = [
      nachnahme ? ["para", "Paguani te dera", "kur vjen pakoja"] : null,
      g ? ["garanci", `${g.tage} ditë garanci`, "nga marrja e pakos", { text: "Kushtet", href: "#garancia" }]
        : tage ? ["garanci", `${tage} ditë garanci`, "ose paratë mbrapsht"] : null,
      ["transport", "Transport falas", von && bis ? `dërgesa ${von}–${bis} ditë` : ""]
    ].filter(Boolean);
    const siguria = $("#t-siguria");
    siguria?.classList.add("pergjigjet--rresht");
    siguria?.replaceChildren(...zusagen.map(([zeichen, fett, klein, link]) => {
      const zelle = element("div");
      zelle.append(ikoneZusage(zeichen), element("b", null, fett));
      if (klein || link) {
        const text = element("span", null, klein);
        if (link) {
          const a = element("a", null, `${link.text} ↓`);
          a.href = link.href;
          text.append(" ", a);
        }
        zelle.append(text);
      }
      return zelle;
    }));
    schreibe($("#t-porosisiguria"), [nachnahme ? "Paguani kur ta merrni" : "", tage ? `${tage} ditë garanci` : "", "Transport falas"].filter(Boolean).join(" · "));
    schreibe($("#t-leistegaranci"), tage ? `${tage} ditë garanci` : "");
    // In der Kasse: die Garantie aufklappbar, mit den ganzen Bedingungen -
    // erreichbar, ohne den Bestellschirm zu verlassen.
    const kasseGarancia = $("#t-porosigarancia");
    zeigen(kasseGarancia, Boolean(g));
    zeigen($("#t-porosisiguria"), !g);
    if (g && kasseGarancia) {
      const plus = element("i", null, "+");
      plus.setAttribute("aria-hidden", "true");
      kasseGarancia.querySelector("summary")?.replaceChildren(`${g.kurz} nga marrja e pakos`, plus);
      kasseGarancia.querySelector("ul")?.replaceChildren(...g.kushtet.map((x) => element("li", null, x)));
    }

    const lang = [];
    if (nachnahme) lang.push(["Sot nuk jepni asnjë kartë.", " Paguani te dera, kur pakoja është në dorën tuaj."]);
    if (tage) lang.push([`${tage} ditë garanci kthimi parash.`, " Nëse nuk jeni të kënaqur, na shkruani dhe ju kthejmë shumën e paguar."]);
    lang.push(["Transport falas,", von && bis ? ` dërgesa ${von}–${bis} ditë.` : ""]);
    // Unten dieselben vier Antworten; "lang" bleibt fuer den Fall, dass
    // die Seite noch eine alte Liste traegt (zwischengespeichertes HTML).
    const unten = $("#t-premtimet");
    if (unten?.classList.contains("pergjigjet")) unten.replaceChildren(...antwortenBauen());
    else unten?.replaceChildren(...lang.map(([fett, rest]) => {
      const li = element("li");
      li.append(element("b", null, fett), rest);
      return li;
    }));
    schreibe($("#t-pagesa"), `${euro(this.preis)} gjithsej. Transporti është falas${nachnahme ? " dhe paguani te dera" : ""}. Nuk ka abonim dhe asnjë pagesë të përsëritur.`);
    schreibe($("#t-garancia"), g ? g.permbledhje : tage
      ? `Keni ${tage} ditë nga marrja e pakos. Na shkruani dhe ju kthejmë shumën e paguar.`
      : "Na shkruani dhe e gjejmë bashkë një zgjidhje.");
    const kushtet = $("#t-kushtet");
    zeigen(kushtet, Boolean(g));
    if (g) kushtet?.replaceChildren(...g.kushtet.map((x) => element("li", null, x)));
  }

  #bestellstand() {
    const text = {
      bestellt: "Ju kontaktojmë për konfirmimin e adresës. Pagesa bëhet kur ta merrni pakon.",
      versandt: "Pakoja juaj është nisur. Pagesa bëhet kur ta merrni.",
      zugestellt: `Pakoja juaj është dorëzuar. Dr. Gashi ju ndjek gjatë ${WOCHEN} javëve.`
    }[this.daten.status] || "";
    schreibe($("#t-porositurtext"), this.neu ? ohneWochenversprechen(text) : text);
  }

  // Befund -> Mittel. Aus shitja.problemet; ohne ihn aus den Saetzen, die
  // in Heart je Produkt stehen, und den zwei wichtigsten Befunden.
  #gjetjet() {
    const nachId = new Map(this.produkte.map((p) => [p.id, p]));
    // NUR KARTEN ZU PRODUKTEN, DIE IM SET SIND. Nennt die Analyse ein
    // Produkt, das in Heart nicht angehakt ist, faellt die Karte weg - sie
    // verspraeche etwas, das der Kunde nicht bekommt. Karten ganz ohne
    // Produkt (ehrlich: "das behandelt kein Mittel") bleiben.
    let eintraege = (this.shitja?.problemet || [])
      .filter((p) => this.#karteGilt(p))
      .map((p) => ({ ...p, produkt: nachId.get(p.produkt_id) || null }));
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
        if (e.produkt) mitProduktVorn(p, e.produkt.name, ohneVerneinung(satz) || satzteil(e.produkt.kurz || ""));
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
      // Wirkstoffe NUR, wenn sie in Heart als gegen die INCI-Liste geprueft
      // markiert sind - und nur in der neuen Fassung (Auftrag, Punkt 9).
      if (this.neu && p.perberesitGeprueft && (p.perberesit || []).length) {
        const zeile = element("p", "perberesit");
        zeile.append(element("b", null, "Përbërës kryesorë: "),
          p.perberesit.slice(0, 4).map((x) => [x.emri, x.sasia].filter(Boolean).join(" ")).join(" · "));
        art.append(zeile);
      }
      return art;
    }));

    const morgens = [];
    const abends = [];
    const sortiert = [...this.produkte].sort((a, b) => (Number(a.perdorimi?.hapi) || 9) - (Number(b.perdorimi?.hapi) || 9));
    for (const p of sortiert) {
      const zeit = tageszeiten(p.perdorimi?.koha);
      if (zeit.morgens) morgens.push(p);
      if (zeit.abends) abends.push(p);
    }
    // Je Produkt ein Schritt: Nummer, Foto, Name, Menge.
    const zeilen = (ziel, liste) => $(ziel)?.replaceChildren(...liste.map((p, i) => {
      const li = element("li");
      const text = element("div", "rutina__teksti");
      text.append(element("b", null, p.name));
      const menge = String(p.perdorimi?.sasia || "").trim();
      if (menge) text.append(element("span", null, menge.charAt(0).toUpperCase() + menge.slice(1)));
      li.append(element("span", "rutina__nr", String(i + 1)), produktBild(p, "rutina__foto"), text);
      return li;
    }));
    zeilen("#t-mengjes", morgens);
    zeilen("#t-mbremje", abends);
    // Eine Tageszeit ohne Produkt: kein Reiter dafuer. Offen ist zuerst
    // der Morgen, wenn er Produkte hat.
    zeigen($("#t-tab-mengjes"), morgens.length > 0);
    zeigen($("#t-tab-mbremje"), abends.length > 0);
    this.#rutinaZeigen(morgens.length ? "mengjes" : "mbremje");
    if (!this.rutinaGebunden) {
      this.rutinaGebunden = true;
      $(".rutina__tabs")?.addEventListener("click", (e) => {
        const tab = e.target instanceof Element ? e.target.closest("[data-rutina]") : null;
        if (tab) this.#rutinaZeigen(tab.dataset.rutina);
      });
    }
    zeigen($("#t-rutina"), morgens.length + abends.length > 0);
  }

  #rutinaZeigen(welche) {
    for (const [name, liste] of [["mengjes", "#t-mengjes"], ["mbremje", "#t-mbremje"]]) {
      const an = name === welche;
      $(`#t-tab-${name}`)?.setAttribute("aria-selected", an ? "true" : "false");
      zeigen($(liste), an);
    }
  }

  #analiza() {
    const r = this.raport;
    // OHNE FOTO gibt es nichts, was gemessen wurde: keine Diagnose-Karte,
    // keine Zonen, keine zehn "nuk vlerësohet". Stattdessen, wie der Plan
    // entstanden ist - aus seiner Beschreibung.
    if (this.ohneFoto) {
      schreibe($("#t-analizasyri"), "Si u zgjodh plani juaj");
      schreibe($("#t-analizatitulli"), "Nga ajo që na treguat.");
      schreibe($("#t-faq1"), "Po. Dr. Gashi e zgjodhi sipas përshkrimit tuaj, për problemet që na treguat. Mund të filloni që sot.");
      const metoda = $("#t-metoda");
      const wie = `Ky plan bazohet në atë që na përshkruat: çfarë ju shqetëson, ku dhe prej kur. Gjatë ${WOCHEN} javëve Dr. Gashi ju ndjek çdo javë dhe e përshtat planin nëse duhet.`;
      schreibe(metoda, this.neu ? ohneWochenversprechen(wie) : wie);
      const summe = $("#t-metodablock summary");
      if (summe?.firstChild) summe.firstChild.textContent = "Si u zgjodh plani?";
      zeigen($("#t-diagnoza"), false);
      zeigen($("#t-zonatblock"), false);
      zeigen($("#t-parametratblock"), false);
      schreibe($("#t-permbledhja"), ohneFotoSaetze(r.gjetjet));
      this.#bogenZusatz(r, ohneFotoSaetze);
      const shpjegimi = (Array.isArray(r.shpjegimi) ? r.shpjegimi : []).map(ohneFotoSaetze).filter(Boolean);
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
    this.#bogenZusatz(r);

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

  // WAS IM BOGEN STAND UND AUF DER SEITE FEHLTE (25.09.): Haupt- und
  // Nebenbefund, das Ziel nach 4 Wochen, wie untersucht wurde, der Rat von
  // Dr. Gashi und die Begriffe. Heart fuellt sie, die Seite zeigte sie nie.
  #bogenZusatz(r, glaetten = (x) => x) {
    const text = (x) => glaetten(wochenStattTage(String(x || "").trim()));
    const zeilen = [["Ndryshimi kryesor", r.gjetjaKryesore], ["Ndryshimi tjetër", r.gjetjaDyta], ["Synimi", r.synimi28]]
      .map(([k, v]) => [k, text(v)]).filter(([, v]) => v);
    $("#t-ndryshimet")?.replaceChildren(...zeilen.map(([k, v]) => {
      const div = element("div");
      div.append(element("dt", null, k), element("dd", null, v));
      return div;
    }));
    zeigen($("#t-ndryshimet"), zeilen.length > 0);

    const keshilla = text(r.keshilla);
    schreibe($("#t-keshilla"), keshilla);
    zeigen($("#t-keshillablock"), Boolean(keshilla));

    const fotot = Number(r.fotot) || 0;
    const zonat = Number(r.zonat) || 0;
    const zahlen = this.ohneFoto ? "" : [fotot ? `${fotot} foto` : "", zonat ? `${zonat} zona` : ""]
      .filter(Boolean).join(" dhe ");
    const ekz = [zahlen ? `U vlerësuan ${zahlen}.` : "", text(r.ekzaminimi)].filter(Boolean).join(" ");
    schreibe($("#t-ekzaminimi"), ekz);
    zeigen($("#t-ekzaminimi"), Boolean(ekz));

    const termat = (Array.isArray(r.termat) ? r.termat : []).slice(0, 8)
      .map((t) => [String(t?.emri || t?.termi || "").trim(), text([t?.shpjegimi, t?.te_ju].filter(Boolean).join(" "))])
      .filter(([k, v]) => k && v);
    $("#t-termat")?.replaceChildren(...termat.map(([k, v]) => {
      const div = element("div");
      div.append(element("dt", null, k), element("dd", null, v));
      return div;
    }));
    zeigen($("#t-termatblock"), termat.length > 0);
  }

  #paKujdes(r) {
    const pk = r.paKujdes || {};
    const rein = (x) => (this.ohneFoto ? ohneFotoSaetze(x) : x);
    const zeilen = [["Mund të zbehet", rein(pk.zbehet)], ["Çfarë mund të mbetet", rein(pk.nukZbehet)], ["Pas 6 muajsh", rein(pk.pas6Muajsh)]]
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
    document.addEventListener("keydown", (ereignis) => {
      if (ereignis.key === "Escape") { this.#blattSchliessen(); return; }
      const ziel = ereignis.target;
      if ((ereignis.key === "Enter" || ereignis.key === " ") && ziel instanceof Element && ziel.matches("[data-mjeti-hap]")) {
        ereignis.preventDefault();
        this.#blattOeffnen(ziel.dataset.mjetiHap);
      }
    });
    document.addEventListener("click", (ereignis) => {
      const ziel = ereignis.target;
      if (!(ziel instanceof Element)) return;
      const mjeti = ziel.closest("[data-mjeti-hap]");
      if (mjeti) { this.#blattOeffnen(mjeti.dataset.mjetiHap); return; }
      if (ziel.closest("[data-mjeti-mbyll]")) { this.#blattSchliessen(); return; }
      if (ziel.closest("[data-porosi]")) {
        this.#kauf("knopf");
        this.#porosia(true);
      } else if (ziel.closest("[data-mbyll]")) this.#porosia(false);
      else if (ziel.closest("[data-hilfe]") && LIFESKIN_WHATSAPP) {
        globalThis.open?.(this.#waLink(), "_blank", "noopener");
      } else if (ziel.closest('a[href="#garancia"]')) {
        // "Kushtet ↓": die Bedingungen aufklappen, dann dorthin springen.
        const block = $("#garancia");
        if (block) block.open = true;
      }
    });
    $("#forma")?.addEventListener("submit", (ereignis) => {
      ereignis.preventDefault();
      this.#bestellen();
    });
    if (this.neu) this.#kasseEreignisse();

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
      // NEUE FASSUNG: Der Bestellschirm hat einen eigenen Eintrag im
      // Verlauf. Schliessen geht ueber "zurueck" - dann schliesst der
      // Knopf dasselbe wie die Zurueck-Geste am Telefon, und der Verlauf
      // bleibt sauber. Geschlossen wird dann in #kasseEreignisse.
      if (this.neu && this.kasseImVerlauf) {
        globalThis.history?.back();
        return;
      }
      blatt.hidden = true;
      document.body.classList.remove("pa-rreshqitje");
      document.activeElement?.blur?.();
      this.untenNachziehen?.();
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
    if (this.neu) this.#kasseNeu();
    blatt.hidden = false;
    document.body.classList.add("pa-rreshqitje");
    this.leistePruefen?.();
    this.#kauf("kasse");

    this.#marke("kasseGeoeffnet");
    this.klickpfad?.melde("kasse", `Bestellschirm geöffnet · ${euro(this.preis)}`);
    if (!this.nurVorschau && !this.kasseGemerkt) {
      this.kasseGemerkt = true;
      this.quelle.merken({ kasseGeoeffnetAt: new Date().toISOString() });
    }
    if (!this.nurVorschau) this.quelle.merken({ timings: { live: "porosia" } });
  }

  async #bestellen() {
    if (this.neu) return this.#bestellenNeu();
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
      phone: werte.telefon.slice(0, 40),
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

  // ---------- Die Kasse der neuen Fassung (Auftrag, Punkt 11) ----------
  //
  // Was anders ist als in der klassischen:
  //   - die Nummer aus der Analyse wird uebernommen, nicht neu verlangt
  //     (die Seite kennt sie nicht - sie bleibt in der Sitzung)
  //   - Endpreis, Lieferung, Nachnahme und die Garantie VOR dem Bestaetigen
  //   - Fehler am Feld, nicht nur oben; Speichern mit sichtbarem Stand
  //   - "zurueck" am Telefon schliesst die Kasse, die Eingaben bleiben
  //     (auch ueber ein Neuladen: sessionStorage dieses Tabs)
  //   - kein zweites Absenden, solange eines laeuft; nach einem Fehler
  //     wird erst nachgesehen, ob die Bestellung doch angekommen ist
  //   - "Faleminderit" erst, wenn die Bestellung gespeichert ist

  get #entwurfSchluessel() { return `lifeskin:porosia:${this.kennung}`; }

  #entwurfLesen() {
    try { return JSON.parse(globalThis.sessionStorage?.getItem(this.#entwurfSchluessel) || "null") || {}; } catch { return {}; }
  }

  #entwurfSchreiben() {
    const entwurf = {
      emri: $("#t-emri")?.value || "",
      telefon: this.numriNgaAnaliza ? "" : ($("#t-telefon")?.value || ""),
      adresa: $("#t-adresa")?.value || "",
      qyteti: $("#t-qyteti")?.value || "",
      numriTjeter: !this.numriNgaAnaliza
    };
    try { globalThis.sessionStorage?.setItem(this.#entwurfSchluessel, JSON.stringify(entwurf)); } catch { /* ohne Speicher bleibt das Feld */ }
  }

  #entwurfLoeschen() {
    try { globalThis.sessionStorage?.removeItem(this.#entwurfSchluessel); } catch { /* nichts zu tun */ }
  }

  #kasseEreignisse() {
    // "zurueck" am Telefon, im Instagram- oder Facebook-Browser: schliesst
    // die Kasse, statt die Seite zu verlassen.
    if (globalThis.history?.state?.lifeskinPorosia) globalThis.history.replaceState(null, "");
    globalThis.addEventListener?.("popstate", () => {
      if (!this.kasseImVerlauf) return;
      this.kasseImVerlauf = false;
      this.#porosia(false);
    });
    const felder = ["#t-emri", "#t-telefon", "#t-adresa", "#t-qyteti"];
    for (const id of felder) {
      $(id)?.addEventListener("input", () => {
        this.#kauf("eingabe");
        this.#feldFehler(id, "");
        // Ist kein Feld mehr rot, verschwindet auch der Hinweis darunter.
        if (!document.querySelector("#forma [aria-invalid=true]")) zeigen($("#t-gabim"), false);
        this.#entwurfSchreiben();
      });
    }
    $("#t-numritjeter")?.addEventListener("click", () => {
      this.numriNgaAnaliza = false;
      this.#numriZeigen();
      this.#entwurfSchreiben();
      $("#t-telefon")?.focus();
    });
    $("#t-numriperseri")?.addEventListener("click", () => {
      this.numriNgaAnaliza = true;
      this.#feldFehler("#t-telefon", "");
      this.#numriZeigen();
      this.#entwurfSchreiben();
    });
  }

  // Beim Oeffnen: Zusammenfassung, Felder, Entwurf. Mehrfach aufrufbar.
  #kasseNeu() {
    if (!this.kasseImVerlauf && globalThis.history?.pushState) {
      globalThis.history.pushState({ lifeskinPorosia: true }, "");
      this.kasseImVerlauf = true;
    }
    const attribute = {
      "#t-emri": { name: "name", autocapitalize: "words", enterkeyhint: "next" },
      "#t-telefon": { name: "tel", enterkeyhint: "next" },
      "#t-adresa": { name: "address", autocapitalize: "words", enterkeyhint: "next" },
      "#t-qyteti": { name: "city", autocapitalize: "words", enterkeyhint: "send" }
    };
    for (const [id, werte] of Object.entries(attribute)) {
      const feld = $(id);
      if (!feld) continue;
      for (const [k, v] of Object.entries(werte)) feld.setAttribute(k, v);
      feld.setAttribute("aria-describedby", `${id.slice(1)}-gabim`);
    }
    if (!this.kasseEntwurfGeladen) {
      this.kasseEntwurfGeladen = true;
      const e = this.#entwurfLesen();
      for (const [id, wert] of [["#t-emri", e.emri], ["#t-telefon", e.telefon], ["#t-adresa", e.adresa], ["#t-qyteti", e.qyteti]]) {
        if (wert && $(id)) $(id).value = wert;
      }
      this.numriNgaAnaliza = this.daten?.numri === true && e.numriTjeter !== true;
    }
    this.#numriZeigen();

    const versand = Number(STANDARD_KONFIG.versandKosten) || 0;
    const nachnahme = (STANDARD_KONFIG.zahlarten || []).includes("nachnahme");
    const zeilen = [
      [`Ndjekja ${WOCHEN}-javore`, "E përfshirë"],
      ["Dërgesa", versand ? euro(versand) : "Falas"],
      nachnahme ? ["Pagesa", "Te dera, kur e merrni pakon"] : null,
      ["Gjithsej", euro(this.preis + versand), "gjithsej"]
    ].filter(Boolean);
    const fatura = $("#t-fatura");
    fatura?.replaceChildren(...zeilen.map(([k, v, klasse]) => {
      const div = element("div", klasse || "");
      div.append(element("dt", null, k), element("dd", null, v));
      return div;
    }));
    zeigen(fatura, true);
    schreibe($("#t-dergo"), `Konfirmo porosinë — ${euro(this.preis + versand)}`);

    const wa = $("#t-porosiwa");
    zeigen(wa, Boolean(LIFESKIN_WHATSAPP));
    if (wa && LIFESKIN_WHATSAPP) wa.href = this.#waBestellLink();
  }

  #numriZeigen() {
    const ausAnalyse = this.numriNgaAnaliza === true;
    zeigen($("#t-numrianalize"), ausAnalyse);
    zeigen($("#t-telefonlabel"), !ausAnalyse);
    zeigen($("#t-numriperseri"), !ausAnalyse && this.daten?.numri === true);
    if (ausAnalyse) zeigen($("#t-telefon-gabim"), false);
  }

  // Fuer "lieber per WhatsApp": ein eigener Satz mit der Fallnummer, damit
  // Heart die Bestellung dem richtigen Fall zuordnet.
  #waBestellLink() {
    const code = String(this.daten?.code || "");
    const text = `Përshëndetje! Dua ta porosis terapinë time.${code ? ` Kodi: ${code}` : ""}`;
    return `https://wa.me/${LIFESKIN_WHATSAPP}?text=${encodeURIComponent(text)}`;
  }

  #feldFehler(id, text) {
    const feld = $(id);
    const hinweis = $(`${id}-gabim`);
    if (feld) {
      if (text) feld.setAttribute("aria-invalid", "true");
      else feld.removeAttribute("aria-invalid");
    }
    schreibe(hinweis, text);
    zeigen(hinweis, Boolean(text));
  }

  #felderPruefen() {
    const wert = (id) => $(id)?.value.trim() || "";
    const werte = { name: wert("#t-emri"), telefon: "", strasse: wert("#t-adresa"), ort: wert("#t-qyteti") };
    const fehler = [];
    if (!werte.name) fehler.push(["#t-emri", "Shkruani emrin dhe mbiemrin."]);
    if (!this.numriNgaAnaliza) {
      const nummer = telefonPruefen(wert("#t-telefon"), LIFESKIN_TELEFON_VORWAHL);
      if (nummer.ok) werte.telefon = nummer.nummer;
      else fehler.push(["#t-telefon", "Shkruani numrin e telefonit."]);
    }
    if (!werte.strasse) fehler.push(["#t-adresa", "Shkruani rrugën dhe numrin."]);
    if (!werte.ort) fehler.push(["#t-qyteti", "Shkruani qytetin."]);
    for (const id of ["#t-emri", "#t-telefon", "#t-adresa", "#t-qyteti"]) {
      this.#feldFehler(id, fehler.find(([f]) => f === id)?.[1] || "");
    }
    return { ok: fehler.length === 0, werte, erstes: fehler[0]?.[0] || "" };
  }

  // Der sichtbare Stand beim Speichern: "ruan" / "gabim" / leer.
  #kasseStand(stand) {
    const knopf = $("#t-dergo");
    const zeile = $("#t-porosistatusi");
    const versand = Number(STANDARD_KONFIG.versandKosten) || 0;
    if (knopf) {
      knopf.disabled = stand === "ruan";
      knopf.setAttribute("aria-busy", stand === "ruan" ? "true" : "false");
      schreibe(knopf, stand === "ruan" ? "Po ruhet…" : `Konfirmo porosinë — ${euro(this.preis + versand)}`);
    }
    const text = {
      ruan: "Po ruhet porosia juaj…",
      gabim: "Porosia nuk u ruajt. Të dhënat tuaja mbeten këtu – provoni përsëri."
    }[stand] || "";
    schreibe(zeile, text);
    if (zeile) zeile.dataset.art = stand || "";
    zeigen(zeile, Boolean(text));
  }

  async #bestellenNeu() {
    if (this.nurVorschau || this.bestellt || this.sendet) return;
    const allgemein = $("#t-gabim");
    const pruefung = this.#felderPruefen();
    if (!pruefung.ok) {
      this.klickpfad?.melde("fehler", "Bestellung: Felder unvollständig");
      this.#kauf("fehler", "felder");
      schreibe(allgemein, "Kontrolloni fushat e shënuara.");
      zeigen(allgemein, true);
      $(pruefung.erstes)?.focus();
      return;
    }
    zeigen(allgemein, false);
    this.sendet = true;
    this.#kasseStand("ruan");

    const { werte } = pruefung;
    const jetzt = new Date().toISOString();
    const address = { name: werte.name, strasse: werte.strasse, ort: werte.ort };
    if (werte.telefon) address.telefon = werte.telefon;
    else address.telefonNgaAnaliza = true;
    const auftrag = {
      address,
      timings: { live: "ordered" },
      order: {
        createdAt: jetzt,
        total: this.preis,
        payment: "nachnahme",
        status: "neu",
        orderId: this.daten.code || this.kennung,
        fassung: this.variante,
        ...pixelKennungen()
      },
      step: "ordered"
    };
    // Eine neue Nummer ersetzt die aus der Analyse - sonst bleibt diese.
    if (werte.telefon) auftrag.phone = werte.telefon.slice(0, 40);
    let gespeichert = false;
    try {
      gespeichert = Boolean((await this.quelle.merken(auftrag))?.ok);
    } catch {
      gespeichert = false;
    }
    if (gespeichert) {
      // Der Bericht zeigt danach "bestellt". Scheitert das, bleibt die
      // Bestellung trotzdem in der Sitzung - Heart hat sie.
      if (!(await this.quelle.zustandSchreiben({ status: "bestellt", bestelltAt: jetzt }))) {
        await this.quelle.zustandSchreiben({ status: "bestellt", bestelltAt: jetzt });
      }
    } else {
      // KAM EIN FRUEHERER VERSUCH DOCH AN? Dann steht der Bericht auf
      // "bestellt" (er wird erst nach der Sitzung geschrieben) - und es
      // wird nicht ein zweites Mal bestellt.
      const stand = await this.quelle.bericht();
      gespeichert = BESTELLT.includes(String(stand?.status || ""));
    }
    this.sendet = false;
    if (!gespeichert) {
      this.#kasseStand("gabim");
      this.#kauf("fehler", "speichern");
      this.klickpfad?.melde("fehler", "Bestellung: nicht gespeichert");
      return;
    }
    this.#kasseStand("");
    this.#entwurfLoeschen();
    this.#kauf("gespeichert");
    this.pixel.melde("ordered", { order: { total: this.preis, orderId: this.daten.code } });
    this.klickpfad?.melde("bestellt", `${euro(this.preis)} · ${this.produkte.map((p) => p.name).join(" + ")}`);
    this.klickpfad?.schicke();
    this.daten.status = "bestellt";
    this.daten.bestelltAt = jetzt;
    schreibe($("#t-faleminderittitulli"), "Porosia juaj u ruajt.");
    schreibe($("#t-faleminderittext"), `Ju kontaktojmë për ta konfirmuar porosinë. Pagesa bëhet te dera, kur ta merrni pakon. Pas konfirmimit ju dërgojmë linkun e zonës suaj personale për ${WOCHEN} javët.`);
    for (const teil of ["#t-porosititulli", "#t-shporta", "#t-fatura", "#forma", "#t-porosifund"]) zeigen($(teil), false);
    zeigen($("#t-faleminderit"), true);
    this.#zeichnen();
    this.leistePruefen?.();
  }

  // ---------- Die Begleitung (neue Fassung, Auftrag Punkte 2-4) ----------

  #ndjekja() {
    const ort = $("#ndjekja");
    if (!ort || ort.dataset.gebaut === "1") return;
    ort.dataset.gebaut = "1";
    const T = NDJEKJA_TEXTE;
    const titel = element("h2", null, T.titulli);
    titel.id = "t-ndjekjatitulli";
    ort.setAttribute("aria-labelledby", titel.id);

    const pikat = element("ul", "ndj-pikat");
    pikat.append(...T.pikat.map(([fett, rest], i) => {
      const li = element("li");
      const text = element("div");
      text.append(element("b", null, fett), element("span", null, rest));
      li.append(ikone(["shenim", "kalendar", "mesazh"][i]), text);
      return li;
    }));

    const rruga = element("ol", "ndj-rruga");
    rruga.setAttribute("aria-label", `Rruga e ${WOCHEN} javëve`);
    rruga.append(...T.rruga.map(([wann, was]) => {
      const li = element("li");
      const text = element("div");
      text.append(element("b", null, wann), element("span", null, was));
      li.append(text);
      return li;
    }));

    const teile = [element("p", "syri", `${WOCHEN} javët tuaja`), titel, element("p", "ndjekja__hyrja", T.hyrja), beispielKarte({ wochen: WOCHEN }), pikat];
    // Wer die Eintraege prueft - NUR wenn es festgelegt ist.
    const pruefer = String(NDJEKJA.pruefer || "").trim();
    if (pruefer) teile.push(element("p", "ndj-pergjegjes", `Ecurinë tuaj e shqyrton: ${pruefer}.`));
    teile.push(element("p", "ndj-joditore", T.joDitore), rruga);
    ort.replaceChildren(...teile);
  }

  // Der Kaufweg (shared/lifeskin-kaufweg.js) - nur in der neuen Fassung,
  // nie in der Vorschau fuer uns und nie im stillen Modus. Jede Marke
  // einmal je Besuch, ein Fehler einmal je Art.
  #kauf(marke, art = "") {
    if (!this.neu || this.nurVorschau || globalThis.__mnyraStill === true) return;
    const schluessel = art ? `${marke}:${art}` : marke;
    if (this.kaufMarken.has(schluessel)) return;
    this.kaufMarken.add(schluessel);
    this.quelle.kaufMarke(marke, { version: this.variante, art });
  }

  // ---------- Leiste und Lesemarken ----------

  // Weg, solange ein Kaufknopf der Seite im Bild ist; sonst immer da.
  // Weg, solange ein Kaufknopf der Seite im Bild ist; sonst immer da.
  //
  // IN INSTAGRAM UND FACEBOOK (In-App-Browser) kommen "scroll"-Ereignisse
  // beim Wischen oft erst am Ende an - die Leiste erschien dann zu spaet
  // oder blieb stehen. Ein IntersectionObserver meldet sich auch dort
  // waehrend der Bewegung; "scroll" bleibt nur als Rueckfall.
  #leiste() {
    const leiste = $("#leiste");
    if (!this.mitAngebot) { zeigen(leiste, false); return; }
    zeigen(leiste, true);
    const knoepfe = ["#hero-knopf", "#vendimi"].map((w) => $(w)).filter(Boolean);
    const sichtbar = new Set();
    let beobachtet = false;
    const imBild = (el) => {
      if (!el || el.hidden || el.closest("[hidden]")) return false;
      if (beobachtet) return sichtbar.has(el);
      const r = el.getBoundingClientRect();
      return r.bottom > 0 && r.top < window.innerHeight - 80;
    };
    const pruefen = () => {
      if (!this.mitAngebot) { leiste.dataset.an = "nein"; return; }
      const offen = !$("#porosia").hidden;
      const an = !offen && !knoepfe.some(imBild) ? "ja" : "nein";
      if (leiste.dataset.an !== an) leiste.dataset.an = an;
    };
    this.leistePruefen = pruefen;
    if (typeof IntersectionObserver === "function" && knoepfe.length) {
      const beobachter = new IntersectionObserver((eintraege) => {
        for (const e of eintraege) {
          if (e.isIntersecting) sichtbar.add(e.target);
          else sichtbar.delete(e.target);
        }
        beobachtet = true;
        pruefen();
      }, { rootMargin: "0px 0px -80px 0px" });
      for (const k of knoepfe) beobachter.observe(k);
    } else {
      window.addEventListener("scroll", pruefen, { passive: true });
    }
    window.addEventListener("resize", pruefen, { passive: true });
    globalThis.visualViewport?.addEventListener("resize", pruefen, { passive: true });
    // iOS: nach Tastatur oder Vollbild die Unterkante neu rechnen lassen.
    this.untenNachziehen = untenNachziehenStarten({ nachher: pruefen });
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
    // Der Kaufweg der neuen Fassung: Angebot und Begleitung GESEHEN - der
    // Abschnitt stand zu einem Viertel im Bild. Das sagt nicht, dass er
    // gelesen oder verstanden wurde.
    if (!this.neu) return;
    const kauf = new IntersectionObserver((eintraege) => {
      for (const e of eintraege) {
        if (!e.isIntersecting) continue;
        kauf.unobserve(e.target);
        this.#kauf(e.target.dataset.kaufmarke);
      }
    }, { threshold: 0.25 });
    for (const [wahl, marke] of [["#t-seti", "angebot"], ["#ndjekja", "betreuung"]]) {
      const knoten = $(wahl);
      if (!knoten || knoten.hidden || knoten.closest("[hidden]")) continue;
      knoten.dataset.kaufmarke = marke;
      kauf.observe(knoten);
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
