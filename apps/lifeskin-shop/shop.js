/* DER LADEN UNTER /lifeskinshop (docs/lifeskin-shop.md).
 * ══════════════════════════════════════════════════════════════════════
 *
 * WAS HIER PASSIERT: Sets, Einzelmittel und Vorher/Nachher-Faelle kommen
 * aus Heart, der Korb liegt im Tab, die Kasse ist eine eigene Ansicht,
 * und die Bestellung geht in DIESELBE Sitzung, die der Trichter
 * (lifeskin-app.js) fuer diesen Besuch angelegt hat - wie der Laden auf
 * /lifeskin (apps/lifeskin-landing/shop.js). Ein Besucher ist eine Zeile
 * in Heart, ob er analysiert, kauft oder beides.
 *
 * DIESELBEN FUNKTIONEN WIE DER LADEN DER LANDINGPAGE, und zwar ueber
 * dieselben Aufrufe:
 *   Pixel  meldeKorb (AddToCart), meldeKasse (InitiateCheckout),
 *          schritt("ordered") -> Purchase im Browser (erst, wenn die
 *          Bestellung gespeichert ist - seit 29.09.), und die Conversions
 *          API meldet denselben Kauf vom Server (functions/lifeskin-capi.js
 *          lauscht auf die Sitzung). PageView und Lead (bei der Nummer in
 *          der Analyse) meldet der Trichter selbst.
 *   Heart  produkteGesehen, imKorb, korbWert, korbStueck, kasseGeoeffnet,
 *          adresseBegonnen, shopKauf - dieselben Marken, dieselben Felder
 *          (firestore.rules unveraendert).
 * Getrennt gezaehlt wird ueber den Weg: <html data-ls-landing="lifeskinshop">
 * steht in der Sitzung als source.weg (Heart-Tab "Lifeskin Shop").
 *
 * Pixel-Aenderung erlaubt vom Inhaber am 28.09.2026 (AGENTS.md,
 * Meta-Pixel-Sperre): "/lifeskinshop meldet AddToCart, InitiateCheckout,
 * Purchase (Browser + CAPI) und Lead wie die anderen Wege". */
import { LIFESKIN_FIRESTORE_BASE, LIFESKIN_TENANT, LIFESKIN_WHATSAPP } from "../lifeskin/lifeskin-config.js";
import { pixelKennungen, browserAngaben } from "../lifeskin/lifeskin-pixel.js";
import { preisFuer } from "../../shared/lifeskin-preise.js";
import { ansichtOeffnen, ansichtSchliessen } from "../../shared/lifeskin-ansicht.js";
import { mittelBauen, holeSammlung, FOTO_PRAEFIX } from "../lifeskin-landing/shop.js";
import { RASTE_STANDARD, rasteLaden, rasteFuer, rasteMitBildern } from "../../shared/lifeskin-raste.js";
import {
  SETET_DOK, SHOP_HERO_DOK, SHOP_HERO_MAX, shopHeroDokId, SETET_STANDARD, MITTEL_FOTOS_STANDARD, MITTEL_NENTITUJ,
  setetOderStandard, setetNormalisieren, aktiveSetet, nevojaKennung, setPreis
} from "../../shared/lifeskin-shop-sets.js";

import { medienListe, ausschnittStil } from "../../shared/lifeskin-medien.js";
import { PAK_SETE } from "../../shared/lifeskin-oferta.js";
import { SHOP_ABSCHNITTE, shopSichtPatch } from "../../shared/lifeskin-shopsicht.js";
import { schirmGesehen } from "../../shared/lifeskin-landingtiefe.js";

const BASIS = `${LIFESKIN_FIRESTORE_BASE}/lifeskin/${LIFESKIN_TENANT}/config`;
const IKONAT = "/apps/lifeskin-shop/icons.svg";
const KORB_SCHLUESSEL = "lifeskinshop.shporta";
const $ = (w, i = document) => i.querySelector(w);

export function e(w) {
  return String(w ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
const ikone = (name) => `<svg class="icon" aria-hidden="true"><use href="${IKONAT}#${name}"></use></svg>`;

// ── Der Korb: Kennungen der Mittel, je eines, dazu das gewaehlte Set ────
// Im sessionStorage: Ein Einkauf gehoert dem Tab, nicht der naechsten
// Woche. Preis und Name kommen bei jedem Zeichnen frisch.
export function korbLesen(speicher) {
  try {
    const roh = JSON.parse(speicher?.getItem(KORB_SCHLUESSEL) || "null");
    const ids = Array.isArray(roh?.ids) ? roh.ids : [];
    return {
      ids: [...new Set(ids.filter((id) => typeof id === "string" && /^[\w-]{1,40}$/.test(id)))].slice(0, 8),
      set: typeof roh?.set === "string" ? roh.set.slice(0, 40) : ""
    };
  } catch {
    return { ids: [], set: "" };
  }
}

export function korbSchreiben(speicher, korb) {
  try { speicher?.setItem(KORB_SCHLUESSEL, JSON.stringify({ ids: korb.ids, set: korb.set || "" })); }
  catch { /* ohne Speicher geht es auch - der Korb lebt dann nur bis zum Neuladen */ }
}

// Ein Angebot aus dem Chat (chat.js -> Dyqan.chatBestellen): set beginnt
// mit "chat-", der Preis steht in der Karte (korb.cmimi).
export const istChatKorb = (korb) => String(korb?.set || "").startsWith("chat-");

// Nach der Staffel (shared/lifeskin-preise.js): 1 = 29, 2 = 39, 3 = 49 ...
// Mit Set: sein Preis aus Heart (korb.cmimi, siehe acneDuoCart).
export function summe(korb) {
  if (!korb.ids.length) return 0;
  return korb.cmimi > 0 ? korb.cmimi : preisFuer(korb.ids.length);
}

// DER SPAETESTE LIEFERTAG (01.10., Inhaber): "1–3 ditë" als echter Tag -
// heute plus drei Tage, Sonntage zaehlen nicht mit. "të premten, 3 tetor".
const DITET = ["të dielën", "të hënën", "të martën", "të mërkurën", "të enjten", "të premten", "të shtunën"];
const MUAJT = ["janar", "shkurt", "mars", "prill", "maj", "qershor", "korrik", "gusht", "shtator", "tetor", "nëntor", "dhjetor"];
export function arrinDeri(heute) {
  const tag = new Date(heute.getFullYear(), heute.getMonth(), heute.getDate());
  let offen = 3;
  while (offen > 0) {
    tag.setDate(tag.getDate() + 1);
    if (tag.getDay() !== 0) offen -= 1;
  }
  return `${DITET[tag.getDay()]}, ${tag.getDate()} ${MUAJT[tag.getMonth()]}`;
}

// Die Felder der Kasse. Seit 07.10. (Inhaber: "egal was man schreibt,
// alles akzeptieren"): Keine Eingabe haelt eine Bestellung mehr auf - auch
// ein leeres Feld nicht. Geklaert wird am Telefon. Nur wer GAR NICHTS
// geschrieben hat, bekommt den Hinweis: Eine Bestellung ohne jede Angabe
// kann niemand ausliefern.
export function kasseFehler(werte) {
  if (!werte.name && !werte.telefon && !werte.strasse && !werte.ort) return "Ju lutemi shkruani emrin dhe numrin e telefonit.";
  return "";
}

// Die Bestellung als WhatsApp-Nachricht - fuer den Fall, dass sie nicht
// gespeichert werden konnte. So kommt sie trotzdem an (07.10., Inhaber:
// "die Bestellung muss ankommen").
export function bestellNachricht(werte, betrag) {
  const zeilen = [
    `Përshëndetje, dua të porosis setin Acne Duo (${betrag} €).`,
    werte.name && `Emri: ${werte.name}`,
    werte.telefon && `Telefoni: ${werte.telefon}`,
    werte.strasse && `Adresa: ${werte.strasse}`,
    werte.ort && `Qyteti: ${werte.ort}`
  ];
  return zeilen.filter(Boolean).join("\n");
}

// Die Zeilen der Bestellung - je Zeile id, name, Preis, Anzahl, wie im
// Laden der Landingpage (Heart liest order.items).
export function bestellZeilen(korb, mittel) {
  const nachId = new Map(mittel.map((m) => [m.id, m]));
  return korb.ids.map((id) => ({ id, name: nachId.get(id)?.name || id, cmimi: preisFuer(1), sasia: 1 }));
}

// ── Firestore lesen, ohne die Firebase-App (REST, wie der ganze Trichter) ──
async function holeDok(name, holen = fetch, suche = "") {
  const url = `${BASIS}/${encodeURIComponent(name)}${suche}`;
  const vorab = name === SETET_DOK ? globalThis.__lsShopSetet : null;
  let antwort;
  if (vorab?.antwort && vorab.url === url) {
    const lauf = vorab.antwort;
    vorab.antwort = null;
    antwort = await lauf;
  } else antwort = await holen(url, { cache: "no-store" });
  if (antwort.status === 404) return null;
  if (!antwort.ok) throw new Error(`Firestore ${antwort.status}`);
  const d = await antwort.json();
  const wert = (f) => {
    if (!f || typeof f !== "object") return null;
    if ("stringValue" in f) return f.stringValue;
    if ("integerValue" in f) return Number(f.integerValue);
    if ("doubleValue" in f) return Number(f.doubleValue);
    if ("booleanValue" in f) return f.booleanValue;
    if ("arrayValue" in f) return (f.arrayValue.values || []).map(wert);
    if ("mapValue" in f) return karte(f.mapValue.fields || {});
    return null;
  };
  const karte = (felder) => Object.fromEntries(Object.entries(felder || {}).map(([k, v]) => [k, wert(v)]));
  return karte(d.fields || {});
}

export function einzelAusSets(mittel, setet) {
  const imSet = new Set((setet || []).flatMap((s) => s.produkte || []));
  return imSet.size ? (mittel || []).filter((m) => imSet.has(m.id)) : (mittel || []);
}

// Current campaign sells only this complete duo; Heart still owns its title and images.
export function acneDuoSets(sets) {
  return (sets || []).filter(s => s.produkte?.length === 2 && s.produkte.includes('lf-acne') && s.produkte.includes('lf-moistur')).slice(0, 1);
}
export function acneDuoCart(cart, sets) {
  const duo=sets[0];
  const complete=duo && cart.ids?.length===2 && duo.produkte.every(id=>cart.ids.includes(id));
  return complete ? {ids:[...duo.produkte],set:duo.id,cmimi:setPreis(duo)} : {ids:[],set:''};
}
// Die Karte des Acne Duo, KOMPAKT (Wunsch Inhaber 29.09.): je Mittel eine
// Zeile mit kleinem Foto, Wirkstoff und drei Nutzen in einer Zeile.
// Anwendung und volle Zusammensetzung (Angaben des Inhabers) stehen fuer
// beide zusammen hinter EINEM Aufklapper - wer sie sucht, findet sie; wer
// kaufen will, muss nicht daran vorbeiscrollen.
const DUO_HAPAT = [
  { id: 'lf-acne', hapi: 'HAPI 1 · MBRËMJE', aktiv: 'BPO 5 %',
    dobi: 'Largon aknet • shenjat • poret',
    si: 'Në mbrëmje, një shtresë e hollë sa një bizele, vetëm në zonat me akne, mbi lëkurë të pastër e të thatë. Javën e parë çdo ditë të dytë, pastaj çdo mbrëmje.',
    kryesore: 'Benzoyl Peroxide (50 mg/g), Glycerin, Aqua',
    perberja: 'Benzoyl Peroxide (50 mg/g), Carbomer, Sodium Olefin Sulfonate, Glycerin, Methacrylate Copolymer, Sodium Hydroxide, Aqua.' },
  { id: 'lf-moistur', hapi: 'HAPI 2 · MËNGJES DHE MBRËMJE', aktiv: 'Ceramide + acid hialuronik',
    dobi: 'Hidraton · Forcon barrierën',
    si: 'Sa një kokërr bathe. Në mëngjes mbi lëkurë të pastër; në mbrëmje pas LF ACNE, kur lëkura e ka thithur.',
    kryesore: 'Ceramide NP, AP, EOP · Sodium Hyaluronate · Glycerin',
    perberja: 'Aqua, Glycerin, Caprylic/Capric Triglyceride, Cetearyl Alcohol, Cetyl Alcohol, Dimethicone, Phenoxyethanol, Polysorbate 20, Ceteareth-20, Behentrimonium Methosulfate, Polyglyceryl-3 Diisostearate, Sodium Lauroyl Lactylate, Ethylhexylglycerin, Potassium Phosphate, Disodium EDTA, Dipotassium Phosphate, Ceramide NP, Ceramide AP, Phytosphingosine, Cholesterol, Xanthan Gum, Carbomer, Sodium Hyaluronate, Tocopherol, Ceramide EOP.' }
];
// "Vetëm edhe pak sete": ein Schalter fuer Laden und Therapieseite
// (shared/lifeskin-oferta.js).
export { PAK_SETE };
const PAK_SETE_ZEILE = '<span class="pak-sete"><i aria-hidden="true"></i>Vetëm edhe pak sete</span>';
// KEIN VERGLEICHSPREIS MEHR (07.10., Inhaber): "19 € statt 58 €" und
// "−67 %" nannten einen Preis, zu dem das Set nirgends verkauft wird. Meta
// hat das Konto lifeskin.ks am 07.10. wegen "irrefuehrender
// Geschaeftspraktiken" eingeschraenkt; ein Rabatt ohne echten Normalpreis
// ist dafuer ein typischer Ausloeser. Auf true nur, wenn es den hoeheren
// Preis wirklich gibt.
export const VERGLEICHSPREIS_ZEIGEN = false;
export function rabattVon(cmimi, vecmas) {
  return VERGLEICHSPREIS_ZEIGEN && vecmas > cmimi ? Math.round((1 - cmimi / vecmas) * 100) : 0;
}
export function duoCard(s, mittel, { fotos = true } = {}) {
  const price=setPreis(s), vecmas=(s.produkte?.length||2)*preisFuer(1), zbritje=rabattVon(price, vecmas);
  const emri=(h)=>e(mittel.find(m=>m.id===h.id)?.name || h.id.toUpperCase().replace('LF-','LF '));
  const hapat=DUO_HAPAT.map(h=>{
    const m=mittel.find(m=>m.id===h.id);
    const foto=fotos ? (m?.fotot?.[0] || MITTEL_FOTOS_STANDARD[h.id] || '') : '';
    // KEIN FREMDES FOTO VORAB (30.09.): Bis Heart antwortet, steht ein
    // ruhiger Platzhalter gleicher Groesse da - sonst sprang das
    // Standardfoto beim Neuladen auf das Foto aus Heart.
    return `<div class="duo-hap">${foto ? `<img class="duo-hap-foto" src="${e(foto)}" width="72" height="90" alt="${emri(h)}" loading="lazy" decoding="async">` : '<span class="duo-hap-foto duo-hap-foto--leer" aria-hidden="true"></span>'}<div><small>${h.hapi}</small><h3>${emri(h)} <span>${e(m?.inhalt || '30 ml')}</span></h3><p class="duo-aktiv">${h.aktiv}</p><p class="duo-dobi">${h.dobi}</p></div></div>`;
  }).join('');
  const detaje=DUO_HAPAT.map(h=>`<h4>${emri(h)}</h4><p><b>Si përdoret:</b> ${h.si}</p><p class="duo-inci"><b>Përbërja kryesore:</b> ${h.kryesore}</p><details class="duo-inci-mehr"><summary>Lexo më shumë</summary><p class="duo-inci">${h.perberja}</p></details>`).join('');
  return `<article class="duo-card"><div class="duo-hapat">${hapat}</div><details class="duo-product"><summary><span class="duo-product-ikona">${ikone('FlaskConical')}</span><span class="duo-product-teksti">Përdorimi dhe përbërja<small>Si përdoret · përbërësit</small></span>${ikone('Plus')}</summary><div class="duo-product-body">${detaje}<p class="duo-shenim">Pa parfum · Kujdes dermatologjik nga Gjermania</p></div></details><div class="duo-ndjekje"><p class="duo-ndjekje-titull">${ikone('Stethoscope')}<b>Përfshirë në çmim</b></p><ul><li>${ikone('Check')}Mbështetje personale nga Dr. Violeta Gashi</li><li>${ikone('Check')}Plan ushqimor kundër akneve</li><li>${ikone('Check')}Këshilla për gjumin, stresin dhe kujdesin ditor</li><li>${ikone('Check')}Ndihmë e personalizuar gjatë gjithë kurës</li></ul></div><div class="duo-cmimi"><span class="duo-cmimi-etiketa">Çmimi:</span><span class="duo-cmimi-vlera">${zbritje ? `<s data-preis="vecmas" data-preis-zbritje>${vecmas} €</s>` : ""}<strong data-preis="cmimi">${price} €</strong></span>${zbritje ? `<em class="zbritje" data-preis="zbritje-fjale" data-preis-zbritje>ZBRITJE −${zbritje} %</em>` : "<span></span>"}${PAK_SETE ? PAK_SETE_ZEILE : "<span></span>"}</div><button type="button" class="primary" data-set="${e(s.id)}"><span>Porosit setin · <span data-preis="cmimi">${price} €</span></span> ${ikone('ArrowUpRight')}</button><ul class="besim"><li>${ikone('Truck')}1–3 ditë</li><li>${ikone('Banknote')}Paguani te dera</li><li>${ikone('ShieldCheck')}45 ditë garanci</li></ul></article>`;
}

// KLEINE KACHELN WIE AUF DER THERAPIESEITE (Wunsch Inhaber 29.09.): eine
// schmale Reihe im Hochformat, Antippen zeigt Foto oder Video gross im
// Blatt, mit Text und Kaufknopf. Das Video selbst entsteht erst dort -
// in der Reihe steht nur sein Standbild.
// Schreibt Preis, Einzelpreise und Rabatt in alle markierten Stellen
// (data-preis="cmimi|vecmas|zbritje|zbritje-fjale"). Dieselbe Funktion
// nutzt ausschliesslich den fuer diesen Aufruf bestaetigten Preis.
export function preiseAnwenden(dok, { cmimi, vecmas, zbritje }) {
  for (const el of dok.querySelectorAll?.("[data-preis]") || []) {
    const art = el.dataset.preis;
    if (art === "cmimi") el.textContent = `${cmimi} €`;
    else if (art === "vecmas") el.textContent = `${vecmas} €`;
    else if (art === "zbritje") el.textContent = `−${zbritje} %`;
    else if (art === "zbritje-fjale") el.textContent = `ZBRITJE −${zbritje} %`;
  }
  for (const el of dok.querySelectorAll?.("[data-preis-zbritje]") || []) el.hidden = !zbritje;
}

// Der Ausschnitt aus Heart (Zuschneiden im Editor) - alle Rahmen sind 9:16.
const stil = m => { const s = ausschnittStil(m.ausschnitt); return s ? ` style="${s}"` : ''; };
export function kundenAuswahl(roh) {
  return medienListe(roh).filter(m => m.aktiv && (m.art === 'video' ? m.video : m.bild));
}
// Die ersten Kacheln der Leiste laden sofort (nach dem ersten Bildschirm),
// die weiteren beim Wischen.
const KUNDEN_SOFORT = 4;
export function kundenGalerie(roh) {
  return kundenAuswahl(roh).map((m, i) => `<button type="button" class="klient-kachel" data-klient="${i}" aria-label="${m.art === 'video' ? 'Shikoni videon' : 'Shikoni foton'}${m.produkt ? ` · ${e(m.produkt)}` : ''}">${m.bild ? `<img src="${e(m.bild)}" alt=""${i < KUNDEN_SOFORT ? "" : ' loading="lazy"'} decoding="async" width="104" height="185"${stil(m)}>` : ''}${m.art === 'video' ? '<span class="klient-kachel__spiel" aria-hidden="true"></span>' : ''}${m.produkt ? `<span class="klient-kachel__emri">${e(m.produkt)}</span>` : ''}</button>`).join('');
}
export function klientBlatt(m) {
  // Ohne schwarze Raender (Hochformat, zugeschnitten) und ohne die
  // Steuerung des Systems: nur ein eigener Knopf oben rechts (Wunsch
  // Inhaber 30.09.). Antippen des Videos schaltet ebenfalls um.
  const medium = m.art === 'video'
    ? `<div class="klient-buehne" data-stand="pause"><video class="klient-medium" src="${e(m.video)}"${m.bild ? ` poster="${e(m.bild)}"` : ''}${stil(m)} playsinline preload="metadata"></video><button type="button" class="klient-spiel" data-klient-spiel aria-label="Luaj videon"></button></div>`
    : `<div class="klient-buehne"><img class="klient-medium" src="${e(m.bild)}" alt="${e(m.produkt || 'LifeSkin')}"${stil(m)}></div>`;
  return `${medium}${m.produkt ? `<h2 id="sheet-title">${e(m.produkt)}</h2>` : ''}${m.text ? `<p>${e(m.text)}</p>` : ''}`;
}

// Veroeffentlichtes Shop-Sets-Angebot, vom Inhaber am 06.10.2026 bestaetigt.
// Keine Abhaengigkeit von Netz oder einem alten lokalen Preis beim Erstbesuch.
export const SHOP_START_SETET = { lista: SETET_STANDARD.map(s => s.id === "acne" ? { ...s, cmimi: 19 } : s) };

const pause = (ms) => new Promise((fertig) => setTimeout(fertig, ms));

// DIE KASSE GENAU SEHEN (07.10., Inhaber: "sofort sobald jemand was tippt
// ... sehen, was genau passiert ist"). Vorher stand in Heart nur "Feld
// angetippt" - ob jemand etwas geschrieben hatte und welchen Hinweis er
// bekam, wusste niemand. Jetzt:
//   - Klickpfad: "schreibt" beim ersten Zeichen je Feld, beim Verlassen
//     des Feldes der Inhalt (oder "leer"), jeder Hinweis, jede Bestellung
//     mit Ausgang (gespeichert / nicht gespeichert und warum).
//   - timings.kasse in der Sitzung: der letzte Stand der vier Felder und
//     jeder Druck auf "Porositni tani" (Sitzung.kasseSchreiben) - fuer das
//     Nachfassen in Heart, auch ohne Bestellung.
// Steht so in der Datenschutzerklaerung (privatesia.html, Abschnitt 2).
export const KASSE_FELDNAMEN = Object.freeze({
  "kasa-emri": "Emri", "kasa-telefoni": "Telefoni", "kasa-adresa": "Adresa", "kasa-qyteti": "Qyteti"
});
const KASSE_WERT_MAX = 100;
export function kasseFelderStand(werte) {
  const k = (v) => String(v || "").slice(0, KASSE_WERT_MAX);
  return { name: k(werte.name), telefon: k(werte.telefon), strasse: k(werte.strasse), ort: k(werte.ort) };
}
export function kasseLeer(werte) {
  return [["name", "Emri"], ["telefon", "Telefoni"], ["strasse", "Adresa"], ["ort", "Qyteti"]]
    .filter(([k]) => !werte[k]).map(([, wort]) => wort).join(", ");
}

const SHOP_FOTOS_KLEIN = Object.freeze({
  "lf-acne": "/apps/lifeskin-shop/assets/lf-acne-3-klein.jpg",
  "lf-moistur": "/apps/lifeskin-shop/assets/lf-moistur-klein.jpg"
});
// ERST DER ERSTE BILDSCHIRM, DANN DIE FOTOS WEITER UNTEN (07.10.): Faelle und
// Kundenfotos teilten sich die Leitung mit den Produktfotos oben und
// bremsten sie (gemessen: 3,5 s statt ~1,5 s bei langsamem Netz). Sie
// kommen jetzt direkt danach - sofort im Hintergrund, nicht erst beim
// Scrollen, damit sie da sind, wenn der Besucher hinscrollt.
const ERSTER_BILDSCHIRM_MAX_MS = 2500;

// Begrenzte oeffentliche Reads: ein haengendes Bild darf keinen Preis sperren.
export function shopFetch(holen = (...a) => fetch(...a), frist = 10000) {
  return async (url, optionen = {}) => {
    const controller = typeof AbortController === "function" ? new AbortController() : null;
    let timer;
    try {
      return await Promise.race([
        holen(url, { ...optionen, ...(controller ? { signal: controller.signal } : {}) }),
        new Promise((_, fehler) => { timer = setTimeout(() => { controller?.abort(); fehler(new Error("timeout")); }, frist); })
      ]);
    } finally { clearTimeout(timer); }
  };
}

// Zusatzdaten erst, wenn ihr Abschnitt nahe ist; ohne Observer weiterhin nutzbar.
export function shopBeiSicht(element, laden, Beobachter = globalThis.IntersectionObserver) {
  let gestartet = false;
  let beobachter;
  const start = () => {
    if (gestartet) return;
    gestartet = true;
    beobachter?.disconnect();
    Promise.resolve().then(laden).catch(() => {});
  };
  if (!element || !Beobachter) { start(); return null; }
  beobachter = new Beobachter(eintraege => {
    if (eintraege.some(eintrag => eintrag.isIntersecting)) start();
  }, { rootMargin: "200px" });
  beobachter.observe(element);
  return beobachter;
}


// Das Titelbild aus Heart, auf dem Geraet gemerkt (#titelbild) - mit dem
// Stempel, den Heart beim Speichern setzt (config/shopHero.updatedAt).
const HERO_SCHLUESSEL = "lifeskin:shopHero";
const HERO_STAND_SCHLUESSEL = "lifeskin:shopHeroStand";
// Nur der Stempel, ohne das Bild: ein paar Bytes statt ~400 KB.
// Mit "anzahl": wie viele Titelbilder es gibt (Bild 2-5 kommen spaeter).
export const HERO_NUR_STAND = "?mask.fieldPaths=updatedAt&mask.fieldPaths=anzahl";
// Die Adresse, die der Kopf von index.html schon abfragt - beide muessen
// gleich sein (tests/lifeskin-shop-weg.test.mjs).
export const HERO_ADRESSE = `${BASIS}/${SHOP_HERO_DOK}`;

// The hero and the complete scan section jointly own sticky visibility.
export function shopStickyBeobachten({ sticky, hero, scan, Beobachter = globalThis.IntersectionObserver }) {
  if (!sticky || !hero || !Beobachter) return null;
  const sichtbar = new Map([[hero, true], ...(scan ? [[scan, false]] : [])]);
  const beobachter = new Beobachter((eintraege) => {
    for (const eintrag of eintraege) sichtbar.set(eintrag.target, eintrag.isIntersecting);
    sticky.hidden = [...sichtbar.values()].some(Boolean);
  }, { threshold: 0 });
  for (const element of sichtbar.keys()) beobachter.observe(element);
  return beobachter;
}

export class Dyqan {
  constructor({ dokument = document, speicher = globalThis.sessionStorage, holen, trichter,
    dauerSpeicher = (() => { try { return globalThis.localStorage || null; } catch { return null; } })() } = {}) {
    this.dok = dokument;
    this.speicher = speicher;
    // Fuer das Titelbild aus Heart: auf dem Geraet gemerkt, damit es beim
    // naechsten Oeffnen sofort dasteht (#titelbild).
    this.dauer = dauerSpeicher;
    this.holen = shopFetch(holen || ((...a) => fetch(...a)));
    // Der Trichter wird bei Bedarf geholt: dieses Modul laeuft, bevor
    // lifeskin-app.js seine Instanz gesetzt hat.
    this.trichterFn = trichter || (() => globalThis.__lifeskinTrichter);
    this.korb = korbLesen(this.speicher);
    this.mittel = mittelBauen([], this.#standardFotos(new Map()));
    this.angebotSetDok = SHOP_START_SETET;
    this.setet = acneDuoSets(aktiveSetet(setetOderStandard(this.angebotSetDok)));
    this.korb = acneDuoCart(this.korb, this.setet);
    korbSchreiben(this.speicher, this.korb);
    this.setFotos = new Map();
    this.gemerkt = new Set();
    this.klienten = kundenAuswahl(null);
    // Erst wenn Heart geantwortet hat (oder nicht), kommen Fotos in die Karte.
    this.fotosBereit = false;
    this.filter = "all";
    this.sendet = false;
    this.angebotBereit = true;
    this.angebotLaedt = false;
    this.opener = null;
    this.kasseGetippt = new Set();
    this.kasseZuletzt = new Map();
    this.kasseTimer = null;
  }

  // ── Was in der Kasse geschieht, fuer Heart (siehe KASSE_FELDNAMEN) ──
  #pfad(ereignis, text) {
    try { this.trichterFn()?.klickpfad?.melde?.(ereignis, text); } catch { /* nie den Kauf stoeren */ }
  }

  #pfadSofort() {
    try { this.trichterFn()?.klickpfad?.schicke?.(); } catch { /* egal */ }
  }

  #kasseWerte() {
    const feld = (id) => $(id, this.dok)?.value.trim() || "";
    return { name: feld("#kasa-emri"), telefon: feld("#kasa-telefoni"), strasse: feld("#kasa-adresa"), ort: feld("#kasa-qyteti") };
  }

  async #kasseSpeichern(daten) {
    try {
      const sitzung = await this.#sitzung();
      if (!sitzung?.kasseSchreiben) return;
      for (let i = 0; i < 50 && sitzung.angelegt !== true; i += 1) await pause(100);
      if (sitzung.angelegt === true) await sitzung.kasseSchreiben(daten);
    } catch { /* Messtechnik darf den Verkauf nie anhalten. */ }
  }

  #kasseFelderSpeichern() {
    clearTimeout(this.kasseTimer);
    this.kasseTimer = null;
    return this.#kasseSpeichern({ felder: kasseFelderStand(this.#kasseWerte()), zuletzt: new Date().toISOString() });
  }

  starte() {
    if (!PAK_SETE) this.dok.querySelectorAll(".pak-sete").forEach((z) => z.remove());
    this.#zeichneSetet();
    this.#zeichneMittel();
    this.#korbZahl();
    this.#ereignisse();
    this.#beobachten();
    this.laden();
    shopBeiSicht($(".hero-photo", this.dok), async () => {
      await this.titelbild();
      await this.#heroGalerie();
    });
  }

  // ── Das Titelbild aus Heart (zugeschnitten 7:5) ─────────────────────
  // Eine eigene Anfrage, damit es nicht auf Produkte und Faelle wartet. Das
  // neue Bild wird erst dekodiert, dann getauscht - kein leerer Rahmen.
  //
  // ZUERST DAS GEMERKTE BILD, OHNE ZU WARTEN. Beim letzten Besuch kam es
  // aus Heart und steht auf dem Geraet (HERO_SCHLUESSEL) - so gibt es beim
  // Neuladen keinen Wechsel vom Standardbild auf das eigene mehr. Die
  // Hoehe des Rahmens haengt ohnehin nicht mehr daran (shop-rahmen.css).
  // Danach wird nachgefragt: neues Bild -> tauschen und merken; keines
  // mehr in Heart -> das Standardbild zurueck.
  async titelbild() {
    const rahmen = $("#ls-einstieg .hero-photo", this.dok);
    const img = rahmen?.querySelector(":scope > img");
    const standard = img?.src || "";
    let gemerkt = "";
    let stand = "";
    try {
      gemerkt = String(this.dauer?.getItem?.(HERO_SCHLUESSEL) || "");
      stand = String(this.dauer?.getItem?.(HERO_STAND_SCHLUESSEL) || "");
    } catch { gemerkt = ""; stand = ""; }
    if (img && gemerkt.startsWith("data:image/")) {
      img.src = gemerkt;
      rahmen.setAttribute("data-eigen", "");
    } else gemerkt = "";
    const vergessen = () => {
      try { this.dauer?.removeItem?.(HERO_SCHLUESSEL); this.dauer?.removeItem?.(HERO_STAND_SCHLUESSEL); } catch { /* egal */ }
    };
    // DIE ANFRAGE AUS DEM KOPF DER SEITE (index.html, window.__lsTitelbild):
    // Sie laeuft schon, waehrend der Trichter noch laedt - einmal benutzt,
    // danach gilt wieder this.holen. Die Seite waehlt dort dieselbe Adresse
    // wie hier: mit gemerktem Bild nur den Stempel, sonst das ganze Bild.
    const vorab = globalThis.__lsTitelbild || null;
    const holen = (url) => {
      if (vorab?.antwort && vorab.url === url) {
        const antwort = vorab.antwort;
        vorab.antwort = null;
        return antwort;
      }
      return this.holen(url);
    };
    try {
      // Gemerkt und mit Stempel: nur nachsehen, ob Heart ein neues hat.
      if (gemerkt && stand) {
        const kurz = await holeDok(SHOP_HERO_DOK, holen, HERO_NUR_STAND);
        if (kurz) this.heroAnzahl = Number(kurz.anzahl) || 1;
        if (kurz && String(kurz.updatedAt || "") === stand) return;
        if (!kurz) {
          // In Heart entfernt (404): das Standardbild zurueck.
          vergessen();
          if (img) { img.src = standard; rahmen.removeAttribute?.("data-eigen"); }
          return;
        }
      }
      const d = await holeDok(SHOP_HERO_DOK, holen);
      const foto = typeof d?.foto === "string" && d.foto.startsWith("data:image/") ? d.foto : "";
      this.heroAnzahl = foto ? Number(d.anzahl) || 1 : 0;
      if (!img) return;
      if (!foto) {
        // Heart hat kein eigenes Bild mehr (404 -> null). Fehlt nur das
        // Netz, wirft holeDok, und das gemerkte Bild bleibt stehen.
        if (gemerkt) {
          vergessen();
          img.src = standard;
          rahmen.removeAttribute?.("data-eigen");
        }
        return;
      }
      try {
        this.dauer?.setItem?.(HERO_SCHLUESSEL, foto);
        this.dauer?.setItem?.(HERO_STAND_SCHLUESSEL, String(d.updatedAt || ""));
      } catch { /* voll - dann eben ohne */ }
      if (foto === gemerkt) return;
      const Bild = this.dok.defaultView?.Image || globalThis.Image;
      if (Bild) {
        const probe = new Bild();
        probe.src = foto;
        await probe.decode?.().catch(() => {});
      }
      img.src = foto;
      rahmen.setAttribute("data-eigen", "");
    } catch { /* dann bleibt das Bild aus dem Aufbau */ }
  }

  // ── Was der Laden an der Sitzung festhaelt (wie auf /lifeskin) ──────
  // Jede Marke hoechstens einmal; kein Schreibvorgang haelt den Laden an.
  #merke(daten, einmalig = "") {
    if (einmalig) {
      if (this.gemerkt.has(einmalig)) return;
      this.gemerkt.add(einmalig);
    }
    try { this.trichterFn()?.sitzung?.ergaenze?.(daten); }
    catch { /* Messtechnik darf den Verkauf nie anhalten. */ }
  }

  // Wo der Besucher im Laden gerade ist - fuer Live in Heart (timings.live,
  // Sitzung.liveMerken): Korb "offer" (N'shport), Kasse und Anschrift "kasa"
  // (Adresa). Eigene Namen, die keine andere Seite schreibt - daran trennt
  // Heart "Live · Shop" von "Live · Analyse" (heart-lifeskin-live.js
  // liveOrtShop). Die letzte Handlung zaehlt, auch wenn vorher ein
  // Analyse-Schritt stand. Kein Schritt, kein Pixel.
  #live(wert) {
    try { this.trichterFn()?.sitzung?.liveMerken?.(wert); }
    catch { /* Messtechnik darf den Verkauf nie anhalten. */ }
  }

  // ── Laden aus Heart ────────────────────────────────────────────────
  #standardFotos(fotos) {
    // Im Laden stehen die Mittel nur klein (Set-Karte 72 px, Kasse 36 px):
    // dieselben kleinen Dateien wie oben auf der Seite (360 px).
    for (const [id, bild] of Object.entries({ ...MITTEL_FOTOS_STANDARD, ...SHOP_FOTOS_KLEIN })) {
      if (!(fotos.get(id) || []).length) fotos.set(id, [bild]);
    }
    return fotos;
  }

  async laden() {
    // Weder Preis noch erster Fall wartet auf Produkt-/Markenbilder.
    const angebot = this.angebotLaden();
    const faelle = this.#faelleLaden();
    // :empty wird per CSS ausgeblendet und kann deshalb nie intersecten.
    // Medien sofort separat laden; weder Preis noch erster Fall wartet darauf.
    void this.#kundenLaden();
    shopBeiSicht($("#setet", this.dok), () => this.#produktDatenLaden());
    await Promise.all([angebot, faelle]);
  }

  async angebotLaden() {
    if (this.angebotLaedt) return;
    this.angebotLaedt = true;
    const status = $("#shop-preisstatus", this.dok);
    if (status) status.hidden = true;
    try {
      const setDok = await holeDok(SETET_DOK, this.holen);
      if (setDok && !Array.isArray(setDok.lista)) throw new Error("invalid offer");
      this.angebotSetDok = setDok || SHOP_START_SETET;
      this.angebotBereit = true;
      await this.#setetUebernehmen(this.angebotSetDok);
      this.dok.documentElement?.setAttribute("data-shop-preis", this.setet.length ? "bereit" : "fehlt");
      if (status) { status.hidden = this.setet.length > 0; status.textContent = "Seti nuk eshte aktualisht i disponueshem."; }
    } catch {
      // Bei Netzfehler bleibt das veroeffentlichte 19-EUR-Angebot nutzbar.
      if (status) status.hidden = true;
    } finally { this.angebotLaedt = false; }
  }

  // Wartet, bis die Produktfotos oben geladen sind (hoechstens 2,5 s).
  #ersterBildschirm() {
    if (!this.ersterBildschirmFertig) {
      const bilder = [...(this.dok.querySelectorAll?.(".product-pair img") || [])];
      const geladen = Promise.all(bilder.map((bild) => bild.complete ? null : new Promise((fertig) => {
        bild.addEventListener?.("load", fertig, { once: true });
        bild.addEventListener?.("error", fertig, { once: true });
      })));
      this.ersterBildschirmFertig = Promise.race([geladen, pause(ERSTER_BILDSCHIRM_MAX_MS)]);
    }
    return this.ersterBildschirmFertig;
  }

  // Erfuellt, sobald die Fotos des ersten Falls geladen sind.
  #ersterFallGeladen() {
    if (!this.ersterFall) this.ersterFall = new Promise((fertig) => { this.ersterFallFertig = fertig; });
    return this.ersterFall;
  }

  async #faelleLaden() {
    const rueckweg = [{ para: "/apps/lifeskin/fall-vorher.jpg", pas: "/apps/lifeskin/fall-nachher.jpg", gjetja: "" }, ...RASTE_STANDARD.filter(r => ["r1", "r2"].includes(r.id))];
    const raste = await rasteLaden(BASIS, this.holen).catch(() => null);
    const auswahl = raste ? rasteFuer(raste, "shop") : [];
    await this.#ersterBildschirm();
    if (!auswahl.length) { this.#zeichneFaelle(rueckweg); return; }
    // Erster gueltiger Heart-Fall sofort, weitere Bilder erst bei Sichtnaehe.
    for (let i = 0; i < auswahl.length; i++) {
      const erste = await rasteMitBildern([auswahl[i]], BASIS, this.holen);
      if (!erste.length) continue;
      this.#zeichneFaelle(erste);
      shopBeiSicht($("#proof-bahn", this.dok), async () => {
        const weitere = await rasteMitBildern(auswahl.slice(i + 1), BASIS, this.holen);
        if (weitere.length) this.#zeichneFaelle(weitere, true);
      });
      return;
    }
    this.#zeichneFaelle(rueckweg);
  }

  async #kundenLaden() {
    const medien = await holeSammlung("medien", this.holen).catch(() => null);
    const rail = $("#customer-media", this.dok);
    if (!rail) return;
    this.klienten = kundenAuswahl(medien);
    // In der Reihenfolge der Seite: erst oben, dann der erste Fall, dann die
    // Kundenfotos (die stehen weiter unten).
    await this.#ersterBildschirm();
    await Promise.race([this.#ersterFallGeladen(), pause(ERSTER_BILDSCHIRM_MAX_MS)]);
    rail.innerHTML = kundenGalerie(medien);
    $("#klientet", this.dok)?.toggleAttribute("hidden", !rail.children.length && !$("#klientet [data-zitat-bild]", this.dok));
    rail.addEventListener("play", event => {
      rail.querySelectorAll("video").forEach(video => { if (video !== event.target) video.pause(); });
    }, true);
  }

  async #produktDatenLaden() {
    // Diese Daten koennen Bilder enthalten; sie entscheiden nicht ueber den Preis.
    const [produkte, konfig] = await Promise.all([
      holeSammlung("products", this.holen).catch(() => []),
      holeSammlung("config", this.holen, "fotot").catch(() => [])
    ]);
    const fotos = new Map();
    for (const doku of konfig || []) {
      if (!String(doku.id).startsWith(FOTO_PRAEFIX)) continue;
      const liste = Array.isArray(doku.fotot) ? doku.fotot : [];
      fotos.set(doku.id.slice(FOTO_PRAEFIX.length), liste.filter(f => typeof f === "string" && f.startsWith("data:image/")));
    }
    this.mittel = mittelBauen(produkte || [], this.#standardFotos(fotos));
    this.fotosBereit = true;
    if (this.angebotBereit) await this.#setetUebernehmen(this.angebotSetDok);
  }

  async #heroGalerie() {
    const n = Math.min(SHOP_HERO_MAX, Number(this.heroAnzahl) || 0);
    const rahmen = $("#ls-einstieg .hero-photo", this.dok);
    if (n < 2 || !rahmen || rahmen.querySelector(".hero-bahn")) return;
    const bilder = [];
    for (let i = 1; i < n; i += 1) {
      try {
        const d = await holeDok(shopHeroDokId(i), this.holen);
        if (typeof d?.foto === "string" && d.foto.startsWith("data:image/")) bilder.push(d.foto);
      } catch { /* dann ohne dieses Bild */ }
    }
    if (!bilder.length) return;
    const bahn = this.dok.createElement("div");
    bahn.className = "hero-bahn";
    bahn.setAttribute("aria-label", "Fotot e setit");
    // ECHTES WISCHEN: Bild 1 ist das erste Feld der Bahn (dasselbe Bild,
    // das schon dasteht) - alle Bilder wandern mit dem Finger. Das Bild
    // darunter wird erst ausgeblendet, wenn die Bahn gezeichnet ist.
    const erstes = rahmen.querySelector(":scope > img");
    bahn.innerHTML = `<img class="hero-slide" src="${e(erstes?.currentSrc || erstes?.src || "")}" alt="${e(erstes?.alt || "LifeSkin Acne Duo")}" decoding="async">`
      + bilder.map((b, i) => `<img class="hero-slide" src="${e(b)}" alt="LifeSkin Acne Duo, foto ${i + 2}" decoding="async">`).join("");
    const pikat = this.dok.createElement("div");
    pikat.className = "hero-pikat";
    pikat.setAttribute("aria-hidden", "true");
    pikat.innerHTML = [0, ...bilder].map((_, i) => `<i data-an="${i === 0 ? "ja" : "nein"}"></i>`).join("");
    const bild1 = bahn.querySelector("img");
    await bild1.decode?.().catch(() => {});
    // PFEILE LINKS UND RECHTS (01.10., Inhaber): kleine runde Knoepfe,
    // senkrecht mittig - damit sofort klar ist, dass man wischen kann.
    const pfeil = (richtung) => {
      const k = this.dok.createElement("button");
      k.type = "button";
      k.className = `hero-pfeil hero-pfeil--${richtung}`;
      k.setAttribute("aria-label", richtung === "links" ? "Foto e mëparshme" : "Foto tjetër");
      k.innerHTML = ikone(richtung === "links" ? "ChevronLeft" : "ChevronRight");
      k.addEventListener("click", () => bahn.scrollBy({ left: (richtung === "links" ? -1 : 1) * bahn.clientWidth, behavior: "smooth" }));
      return k;
    };
    const links = pfeil("links");
    const rechts = pfeil("rechts");
    rahmen.append(bahn, pikat, links, rechts);
    rahmen.setAttribute("data-bahn", "");
    const pfeileSetzen = (stelle) => {
      links.hidden = stelle <= 0;
      rechts.hidden = stelle >= bilder.length;
    };
    pfeileSetzen(0);
    let wartet = false;
    bahn.addEventListener("scroll", () => {
      if (wartet) return;
      wartet = true;
      requestAnimationFrame(() => {
        wartet = false;
        const stelle = Math.round(bahn.scrollLeft / Math.max(1, bahn.clientWidth));
        [...pikat.children].forEach((p, i) => p.setAttribute("data-an", i === stelle ? "ja" : "nein"));
        pfeileSetzen(stelle);
      });
    }, { passive: true });
  }

  // Die Sets aus Heart, nur mit Mitteln, die es zu kaufen gibt.
  async #setetUebernehmen(setDok) {
    const da = new Set(this.mittel.map((m) => m.id));
    this.setet = acneDuoSets(aktiveSetet(setetOderStandard(setDok)))
      .map((s) => ({ ...s, produkte: s.produkte.filter((id) => da.has(id)) }))
      .filter((s) => s.produkte.length === 2);
    // Der Korb darf nur Mittel tragen, die es noch gibt. Ein Angebot aus
    // dem Chat (chatBestellen) bleibt, wie es ist.
    if (!istChatKorb(this.korb)) this.korb = acneDuoCart(this.korb, this.setet);
    korbSchreiben(this.speicher, this.korb);
    this.#zeichneSetet();
    this.#zeichneMittel();
    this.#korbZahl();
    if ($("#kasa", this.dok)?.hidden === false) this.#kasseZeichnen();
  }

  mittelVon(id) { return this.mittel.find((m) => m.id === id); }
  setVon(id) { return this.setet.find((s) => s.id === id); }

  #setBild(s) {
    return this.setFotos.get(s.id) || s.foto || this.mittelVon(s.produkte[0])?.fotot?.[0] || "";
  }

  // ── Zeichnen ──────────────────────────────────────────────────────
  #zeichneSetet() {
    const raster = $("#set-grid", this.dok);
    if (!raster) return;
    const available = this.angebotBereit && this.setet.length > 0;
    for (const button of this.dok.querySelectorAll('.hero [data-set], #setet [data-set], #zgjedhja [data-set], .closing [data-set], #sticky-buy')) button.disabled = !available;
    if (!this.angebotBereit) return;
    if (!available) { raster.innerHTML = '<p class="section-intro">Seti nuk është aktualisht i disponueshëm.</p>'; return; }
    raster.innerHTML = this.setet.map(s => duoCard(s, this.mittel, { fotos: this.fotosBereit })).join('');
    const numri = $("#set-numri", this.dok);
    if (numri) numri.textContent = `01 — ${String(this.setet.length).padStart(2, "0")}`;
    // Die Filter: ein Knopf je Bedarf, "Të gjitha" vorn.
    const filter = $("#filters", this.dok);
    const nevojat = [...new Map(this.setet.filter((s) => s.nevoja).map((s) => [nevojaKennung(s.nevoja), s.nevoja])).entries()];
    if (filter) {
      filter.hidden = nevojat.length < 2;
      filter.innerHTML = [["all", "Të gjitha"], ...nevojat].map(([k, wort]) =>
        `<button type="button" aria-pressed="${k === "all" ? "true" : "false"}" data-filter="${e(k)}">${e(wort)}</button>`).join("");
    }
    this.filter = "all";
    // Oben und in der Leiste: das erste Set.
    const erstes = this.setet[0];
    for (const knopf of this.dok.querySelectorAll(".hero [data-set], #setet [data-set], #zgjedhja [data-set], .closing [data-set], #sticky-buy")) knopf.dataset.set = erstes.id;
    const label = $("#sticky-label", this.dok);
    if (label) label.textContent = erstes.titulli;
    const preis = $("#sticky-price", this.dok);
    if (preis) preis.textContent = `${setPreis(erstes)} €`;
    this.#preiseZeigen(erstes);
  }

  // Einzeln verkauft wird, was in einem Set steht, das im Shop ist (Wunsch
  // 28.09.: vorerst nur LF ACNE und LF MOISTUR). Schaltet Heart ein Set ein,
  // kommen seine Mittel hier dazu. Ohne Sets: alle Mittel.
  einzelMittel() {
    return einzelAusSets(this.mittel, this.setet);
  }

  // Veroeffentlichtes Angebot sofort, danach aktuelle Shop-Sets aus Heart.
  // Kein alter lokaler Preis und kein Zwischenpreis aus der Staffel.
  #preiseZeigen(set) {
    const cmimi = setPreis(set);
    const vecmas = set.produkte.length * preisFuer(1);
    const zbritje = rabattVon(cmimi, vecmas);
    preiseAnwenden(this.dok, { cmimi, vecmas, zbritje });
  }

  #zeichneMittel() {
    const raster = $("#single-grid", this.dok);
    if (raster) { raster.innerHTML = ''; raster.closest('.singles')?.setAttribute('hidden',''); }
  }

  #zeichneFaelle(faelle, anhaengen = false) {
    const bahn = $("#proof-bahn", this.dok);
    if (!bahn) return;
    // Der erste Fall laedt sofort (er steht beim Hinscrollen im Bild), die
    // weiteren in der Wischleiste, wenn sie in die Naehe kommen.
    const bild = (src, alt, sofort) => `<img src="${e(src)}" width="600" height="800" alt="${e(alt)}"${sofort ? ' decoding="async"' : ' loading="lazy"'}>`;
    const erster = !anhaengen;
    const inhalt = faelle.map((r, i) => `<article class="proof-rast"><div class="proof-pair"><figure>${bild(r.para, `Para: ${r.gjetja || ""}`, erster && i === 0)}<figcaption>PARA <span>Në fillim</span></figcaption></figure><figure>${bild(r.pas, `Pas 28 ditësh: ${r.gjetja || ""}`, erster && i === 0)}<figcaption>PAS <span>Pas 4 javësh</span></figcaption></figure></div></article>`).join("");
    if (anhaengen) bahn.insertAdjacentHTML("beforeend", inhalt);
    else {
      bahn.innerHTML = inhalt; bahn.scrollLeft = 0;
      const bilder = [...(bahn.querySelectorAll?.("article:first-child img") || [])];
      this.#ersterFallGeladen();
      Promise.all(bilder.map((b) => b.complete ? null : new Promise((f) => { b.addEventListener?.("load", f, { once: true }); b.addEventListener?.("error", f, { once: true }); })))
        .then(() => this.ersterFallFertig?.());
    }
    let pikat = $("#proof-pikat", this.dok);
    if (bahn.children.length < 2) { pikat?.remove(); return; }
    if (!pikat) {
      pikat = this.dok.createElement("div");
      pikat.id = "proof-pikat";
      pikat.className = "proof-pikat";
      pikat.setAttribute("aria-hidden", "true");
      bahn.after(pikat);
    }
    pikat.innerHTML = Array.from(bahn.children, (_, i) => `<i data-an="${i === 0 ? "ja" : "nein"}"></i>`).join("");
    if (this.proofScrollGebunden) return;
    this.proofScrollGebunden = true;
    let wartet = false;
    bahn.addEventListener("scroll", () => {
      if (wartet) return;
      wartet = true;
      requestAnimationFrame(() => {
        wartet = false;
        const karten = bahn.children;
        const schritt = karten.length > 1 ? karten[1].offsetLeft - karten[0].offsetLeft : 0;
        const stelle = schritt > 0 ? Math.min(karten.length - 1, Math.max(0, Math.round(bahn.scrollLeft / schritt))) : 0;
        [...pikat.children].forEach((p, i) => p.setAttribute("data-an", i === stelle ? "ja" : "nein"));
      });
    }, { passive: true });
  }

  #korbZahl() {
    const zahl = $("#bag-count", this.dok);
    if (zahl) {
      zahl.textContent = String(this.korb.ids.length);
      zahl.hidden = !this.korb.ids.length;
    }
  }

  // ── Das Blatt von unten: was gewaehlt ist, Details (ohne Felder) ────
  #blatt(inhalt, eyebrow = "ZGJEDHJA JUAJ") {
    const blatt = $("#sheet", this.dok);
    if (!blatt) return;
    if (!blatt.open) this.opener = this.dok.activeElement;
    $("#sheet-eyebrow", this.dok).textContent = eyebrow;
    $("#sheet-content", this.dok).innerHTML = inhalt;
    if (!blatt.open) {
      if (typeof blatt.showModal === "function") blatt.showModal();
      else blatt.setAttribute("open", "");
    }
    blatt.scrollTop = 0;
    $("#close-sheet", this.dok)?.focus({ preventScroll: true });
  }

  #blattZu() {
    const blatt = $("#sheet", this.dok);
    if (blatt?.open) {
      if (typeof blatt.close === "function") blatt.close();
      else blatt.removeAttribute("open");
    }
  }

  // DIE KASSE ZEIGT DAS SET IN EINER ZEILE (01.10., Inhaber: kompakter) -
  // beide Bilder klein uebereinander, Name, Inhalt. Ohne Muelleimer:
  // Entfernen geht im Warenkorb, die Kasse laedt nicht zum Abbrechen ein.
  #kasaSet() {
    const mittel = this.korb.ids.map((id) => this.mittelVon(id)).filter(Boolean);
    if (!mittel.length) return "";
    const s = this.setVon(this.korb.set);
    const bilder = mittel.slice(0, 2).map((m) => `<img src="${e(m.fotot[0])}" alt="" width="40" height="50">`).join("");
    const titel = istChatKorb(this.korb) ? "Oferta juaj nga chat-i" : (s?.titulli || "Acne Duo");
    return `<div class="kasa-set"><span class="kasa-set__bilder">${bilder}</span><span class="kasa-set__text"><b>${e(titel)}</b><small>${e(mittel.map((m) => m.name).join(" + "))} · ${e(mittel[0].inhalt || "30 ml")} secili</small></span></div>`;
  }

  // In der Kasse ohne Muelleimer (01.10., Inhaber): Entfernen geht im
  // Warenkorb - in der Kasse soll nichts zum Abbrechen einladen.
  #korbZeilen(mitEntfernen = true) {
    return this.korb.ids.map((id, index) => {
      const m = this.mittelVon(id);
      if (!m) return "";
      return `<div class="basket-row"><img src="${e(m.fotot[0])}" alt="${e(m.name)}" width="62" height="78"><div><h3>${e(m.name)}</h3><p>${e(MITTEL_NENTITUJ[m.id] || m.kurztext || m.nenName || "")}${m.inhalt ? ` · ${e(m.inhalt)}` : ""}</p></div>${mitEntfernen && index === 0 ? `<button type="button" class="remove" data-remove="${e(id)}" aria-label="Hiqni setin e plotë" title="Hiqni setin e plotë">${ikone("Trash2")}</button>` : ''}</div>`;
    }).join("");
  }

  #kursim() {
    const n = this.korb.ids.length;
    return n > 1 ? `Veçmas ${n * preisFuer(1)} € · Kurseni ${n * preisFuer(1) - summe(this.korb)} € së bashku.` : "";
  }

  #korbBlatt() {
    const n = this.korb.ids.length;
    const kursim = this.#kursim();
    this.#blatt(`<h2 id="sheet-title">${n ? "U shtua në shportë." : "Shporta juaj."}</h2><p>${n ? "Vetëm edhe një hap drejt një lëkure të pastër." : "Zgjidhni një set ose produkt për të filluar."}</p>${this.#korbZeilen()}${n ? `<div class="total"><span>Gjithsej · dërgesa e përfshirë</span><strong>${summe(this.korb)} €</strong></div>${kursim ? `<p class="cart-saving">${e(kursim)}</p>` : ""}` : ""}<div class="sheet-actions">${n ? `<button type="button" class="primary" data-kasa>Vazhdo me të dhënat ${ikone("ArrowRight")}</button>` : `<button type="button" class="secondary" data-continue>Zgjidhni setin tuaj ${ikone("ArrowUpRight")}</button>`}</div>`);
  }

  #setDetail(s) {
    this.#merke({ produkteGesehen: true }, "produkteGesehen");
    const preis = setPreis(s);
    const figuren = s.produkte.map((id) => this.mittelVon(id)).filter(Boolean)
      .map((m) => `<figure><img src="${e(m.fotot[0])}" alt="${e(m.name)}" width="300" height="375"><figcaption><strong>${e(m.name)}</strong>${e(MITTEL_NENTITUJ[m.id] || m.kurztext || m.nenName || "")}</figcaption></figure>`).join("");
    this.#blatt(`<h2 id="sheet-title">${e(s.titulli)}</h2><p>${e(s.detaje || s.teksti)}</p><div class="detail-products">${figuren}</div><div class="total"><span>Seti me ${s.produkte.length} produkte</span><strong>${preis} €</strong></div><button type="button" class="primary" data-set="${e(s.id)}">Zgjidh këtë set ${ikone("ArrowUpRight")}</button>`, "SETI");
  }

  #mittelDetail(m) {
    this.#merke({ produkteGesehen: true }, "produkteGesehen");
    const perdorimi = [m.perdorimi?.koha, m.perdorimi?.si].filter(Boolean).join(" ");
    this.#blatt(`<img class="detail-image" src="${e(m.fotot[0])}" alt="${e(m.name)}" width="600" height="440"><h2 id="sheet-title">${e(m.name)}</h2><p>${e(m.synimi || m.kurztext || "")}</p>${m.veprimi?.length ? `<ul class="detail-veprimi">${m.veprimi.map((v) => `<li>${e(v)}</li>`).join("")}</ul>` : ""}${perdorimi ? `<p class="template-note">${e(perdorimi)}</p>` : ""}<div class="total"><span>Seti LF ACNE + LF MOISTUR</span><strong>${preisFuer(2)} €</strong></div><button type="button" class="primary" data-single="${e(m.id)}">Porosit setin · ${preisFuer(2)} € ${ikone("Plus")}</button>`, "PRODUKTI");
  }

  // ── Legen und Nehmen ──────────────────────────────────────────────
  #nachLegen() {
    korbSchreiben(this.speicher, this.korb);
    this.#korbZahl();
    // AddToCart fuer Meta - wie auf /lifeskin (Laden#legen). Der Pixel
    // meldet ohnehin nur einmal je Besuch.
    this.trichterFn()?.pixel?.meldeKorb?.(summe(this.korb));
    const stueck = this.korb.ids.length;
    if (stueck > 0) {
      this.#merke({ imKorb: true }, "imKorb");
      this.#live("offer");
    }
    this.#merke({ korbWert: summe(this.korb), korbStueck: stueck });
  }

  setLegen(id) {
    if (!this.angebotBereit) return;
    const s = this.setVon(id);
    if (!s) return;
    // Ein Set ersetzt den Korb: eine Routine auf einmal, keine
    // zufaellige Mischung von Wirkstoffen.
    this.korb = { ids: [...s.produkte], set: s.id, cmimi: setPreis(s) };
    this.#nachLegen();
    // Gleicher Korb, gleiche Meldung, dann die bestehende Kasse ohne Zwischenblatt.
    this.kasseOeffnen();
    const status = $("#status", this.dok);
    if (status) status.textContent = `${s.titulli} u shtua në shportë.`;
  }

  mittelLegen(id) {
    const duo = this.setet[0];
    if (duo?.produkte.includes(id)) this.setLegen(duo.id);
  }

  mittelNehmen(id) {
    this.korb.ids = [];
    this.korb.set = "";
    korbSchreiben(this.speicher, this.korb);
    this.#korbZahl();
    this.#merke({ korbWert: summe(this.korb), korbStueck: this.korb.ids.length });
  }

  // ── Die Kasse: eine eigene Ansicht an der Stelle des Ladens ─────────
  kasseOeffnen() {
    if (!this.angebotBereit) return;
    const kasa = $("#kasa", this.dok);
    if (!kasa) return;
    this.#blattZu();
    this.#kasseZeichnen();
    $("#kasa-trup", this.dok).hidden = false;
    $("#kasa-faleminderit", this.dok).hidden = true;
    ansichtOeffnen(kasa, "kasa", { dokument: this.dok });
    if (this.korb.ids.length) {
      // InitiateCheckout, sobald die Kasse mit etwas darin aufgeht - wie
      // auf /lifeskin (Laden#oeffnen).
      this.trichterFn()?.pixel?.meldeKasse?.(summe(this.korb));
      this.#pfad("kasse", `Kasse geöffnet · ${summe(this.korb)} € · kasa`);
      this.#merke({ kasseGeoeffnet: true, kasseGeoeffnetAt: new Date().toISOString() }, "kasseGeoeffnet");
      this.#live("kasa");
    }
  }

  kasseSchliessen() {
    const kasa = $("#kasa", this.dok);
    if (kasa) ansichtSchliessen(kasa, { dokument: this.dok });
  }

  #kasseZeichnen() {
    const n = this.korb.ids.length;
    $("#kasa-lista", this.dok).innerHTML = this.#kasaSet();
    $("#kasa-bosh", this.dok).hidden = n > 0;
    $("#kasa-totali", this.dok).hidden = n === 0;
    $("#kasa-shuma", this.dok).textContent = `${summe(this.korb)} €`;
    const kursim = this.#kursim();
    const k = $("#kasa-kursim", this.dok);
    k.textContent = kursim;
    k.hidden = !kursim;
    $("#kasa-forma", this.dok).hidden = n === 0;
    $("#kasa-dergo", this.dok).hidden = n === 0;
    $("#kasa-dergo-shuma", this.dok).textContent = n ? `· ${summe(this.korb)} €` : "";
    $("#kasa-gabim", this.dok).hidden = true;
    // Wann es ankommt (01.10., Inhaber): der echte spaeteste Tag statt nur
    // "1–3 ditë".
    const arrin = $("#kasa-arrin", this.dok);
    if (arrin) arrin.textContent = `Arrin deri ${arrinDeri(new Date())}`;
    // Ersparnis als Pille neben dem Preis (statt eigener Zeile).
    const s = this.setVon(this.korb.set);
    const einzeln = n * preisFuer(1);
    const spart = n > 1 && VERGLEICHSPREIS_ZEIGEN ? einzeln - summe(this.korb) : 0;
    const vorher = $("#kasa-vecmas", this.dok);
    if (vorher) { vorher.textContent = spart > 0 ? `${einzeln} €` : ""; vorher.hidden = !(spart > 0); }
    const pille = $("#kasa-kurseni", this.dok);
    if (pille) { pille.textContent = spart > 0 ? `Kurseni ${spart} €` : ""; pille.hidden = !(spart > 0); }
    void s;
    // WhatsApp als zweiter Weg - mit fertiger Nachricht.
    const wa = $("#kasa-wa", this.dok);
    if (wa) {
      wa.href = `https://wa.me/${LIFESKIN_WHATSAPP}?text=${encodeURIComponent(`Përshëndetje, dua të porosis setin Acne Duo (${summe(this.korb)} €).`)}`;
      wa.hidden = n === 0;
    }
  }

  // Wartet auf die Sitzung des Trichters - wer sehr schnell bestellt,
  // koennte vor ihr da sein. Bis 15 s (vorher 3 s): Auf einer langsamen
  // Leitung laedt der Trichter laenger, und ohne Sitzung ging die
  // Bestellung nicht hinaus.
  async #sitzung() {
    for (let i = 0; i < 150; i += 1) {
      const s = this.trichterFn()?.sitzung;
      if (s) return s;
      await new Promise((fertig) => setTimeout(fertig, 100));
    }
    return null;
  }

  // Derselbe Ablauf wie auf /lifeskin: pruefen, Knopf sperren, schreiben,
  // und erst NACH der Antwort des Servers bestaetigen.
  async bestellen() {
    if (this.sendet) { this.#pfad("fehler", "Porositni tani nochmal gedrückt – wird noch gesendet · kasa"); return; }
    if (!this.korb.ids.length || !this.angebotBereit) {
      this.#pfad("fehler", `Bestellung nicht möglich: ${!this.korb.ids.length ? "Warenkorb leer" : "Angebot lädt noch"} · kasa`);
      this.#pfadSofort();
      return;
    }
    const werte = this.#kasseWerte();
    const gabim = $("#kasa-gabim", this.dok);
    const fehler = kasseFehler(werte);
    const versuchId = `v${Date.now().toString(36)}`;
    const versuchAb = Date.now();
    const leer = kasseLeer(werte);
    const versuch = (ergebnis, mehr = {}) => this.#kasseSpeichern({
      felder: kasseFelderStand(werte), zuletzt: new Date().toISOString(),
      versuche: { [versuchId]: { t: new Date(versuchAb).toISOString(), ergebnis, fehlt: leer, ms: Date.now() - versuchAb, ...mehr } }
    });
    for (const [id, wert] of [["#kasa-emri", werte.name], ["#kasa-telefoni", werte.telefon]]) {
      $(id, this.dok)?.setAttribute("aria-invalid", fehler && !wert ? "true" : "false");
    }
    if (fehler) {
      gabim.textContent = fehler;
      gabim.hidden = false;
      // Direkt ins erste leere Feld - sonst sieht man auf dem Telefon nicht,
      // was fehlt.
      const erstesLeer = [["#kasa-emri", werte.name], ["#kasa-telefoni", werte.telefon], ["#kasa-adresa", werte.strasse], ["#kasa-qyteti", werte.ort]].find(([, wert]) => !wert);
      if (erstesLeer) $(erstesLeer[0], this.dok)?.focus?.();
      this.#pfad("fehler", `Hinweis gezeigt: alle Felder leer · kasa`);
      this.#pfadSofort();
      void versuch("hinweis");
      return;
    }
    gabim.hidden = true;
    this.sendet = true;
    const knopf = $("#kasa-dergo", this.dok);
    const text = $("#kasa-dergo-tekst", this.dok);
    knopf.disabled = true;
    text.textContent = "Po dërgohet …";

    const s = this.setVon(this.korb.set);
    const betrag = summe(this.korb);
    const sitzung = await this.#sitzung();
    let ok = false;
    let status = "";
    if (sitzung) {
      // schritt() setzt den Schritt auf "ordered", haelt die Zeit fest und
      // meldet den Pixel (Purchase) - ueber dieselbe Stelle wie jeder
      // Schritt, also genau einmal, und seit dem 29.09. erst, wenn Firestore
      // die Bestellung angenommen hat (ERST_SPEICHERN, lifeskin-session.js).
      // Scheitert das Speichern, gilt der Kauf nicht als erreicht, und der
      // naechste Versuch meldet und schreibt wie der erste. Die Conversions
      // API meldet denselben Kauf vom Server. Alles in der Karte "order"
      // (firestore.rules).
      const antwort = await sitzung.schritt("ordered", {
        name: werte.name.slice(0, 80),
        phone: werte.telefon.slice(0, 40),
        address: werte,
        order: {
          kind: "shop",
          burimi: "lifeskinshop",
          createdAt: new Date().toISOString(),
          total: betrag,
          payment: "nachnahme",
          status: "neu",
          orderId: sitzung.code || "",
          items: bestellZeilen(this.korb, this.mittel),
          ...(s ? { set: { id: s.id, titulli: s.titulli } } : {}),
          // Aus einem Angebot im Chat (docs/lifeskin-chat.md).
          ...(istChatKorb(this.korb) ? { chat: { nachricht: this.korb.set.slice(5) } } : {}),
          ...pixelKennungen(),
          // User-Agent und Seite fuer die Conversions API - siehe browserAngaben().
          ...browserAngaben()
        }
      }).catch(() => null);
      ok = Boolean(antwort?.ok);
      status = antwort?.status ? `HTTP ${antwort.status}` : (sitzung.letzterFehler || "keine Antwort vom Server");
    }

    this.sendet = false;
    knopf.disabled = false;
    text.textContent = "Porositni tani";
    const dauer = Math.round((Date.now() - versuchAb) / 100) / 10;
    if (!ok) {
      const grund = sitzung ? status : "Sitzung nicht geladen";
      this.#pfad("fehler", `Bestellung NICHT gespeichert (${grund}, ${dauer} s)${leer ? ` · leer: ${leer}` : ""} · kasa`);
      this.#pfadSofort();
      void versuch(sitzung ? "fehler" : "keineSitzung", { status: grund });
      gabim.textContent = "Porosia nuk u dërgua. Ju lutemi provoni sërish ose dërgojeni me WhatsApp më poshtë.";
      gabim.hidden = false;
      // Die Bestellung darf nicht verloren gehen: Der WhatsApp-Knopf traegt
      // jetzt alles, was eingegeben wurde - ein Tipp, und sie ist da.
      const wa = $("#kasa-wa", this.dok);
      if (wa) {
        wa.href = `https://wa.me/${LIFESKIN_WHATSAPP}?text=${encodeURIComponent(bestellNachricht(werte, betrag))}`;
        wa.hidden = false;
      }
      return;
    }
    this.#pfad("bestellt", `Bestellung gespeichert · ${sitzung?.code || ""} · ${dauer} s${leer ? ` · leer: ${leer}` : ""} · kasa`);
    this.#pfadSofort();
    void versuch("ok");
    // Woher die Bestellung kommt: aus dem Laden, nicht von der Befundseite.
    this.#merke({ shopKauf: true }, "shopKauf");
    this.korb = { ids: [], set: "" };
    korbSchreiben(this.speicher, this.korb);
    this.#korbZahl();
    $("#kasa-trup", this.dok).hidden = true;
    $("#kasa-kodi", this.dok).textContent = sitzung?.code ? `Numri i porosisë: ${sitzung.code}` : "";
    $("#kasa-faleminderit", this.dok).hidden = false;
  }

  #klientVideo(buehne) {
    const video = buehne?.querySelector("video");
    if (!video) return;
    const knopf = buehne.querySelector(".klient-spiel");
    const setze = (laeuft) => {
      buehne.dataset.stand = laeuft ? "spielt" : "pause";
      knopf?.setAttribute("aria-label", laeuft ? "Ndalni videon" : "Luaj videon");
    };
    if (video.paused) {
      video.onended = () => setze(false);
      Promise.resolve(video.play?.()).then(() => setze(true)).catch(() => setze(false));
    } else {
      video.pause();
      setze(false);
    }
  }

  // ── Aus dem Chat (chat.js) ─────────────────────────────────────────
  // "Porosite" auf einer Produktkarte: genau diese Produkte, zum Preis der
  // Karte, direkt in die Kasse. Nur Produkte, die der Laden kennt.
  chatBestellen({ nachrichtId = "", produkte = [], summe: preis = 0 } = {}) {
    if (!this.angebotBereit) return false;
    const ids = [...new Set((produkte || []).map((p) => String(p?.id || "")).filter((id) => /^[\w-]{1,40}$/.test(id) && this.mittelVon(id)))].slice(0, 5);
    if (!ids.length || !/^[a-z0-9]{8,40}$/.test(String(nachrichtId))) return false;
    this.korb = { ids, set: `chat-${nachrichtId}`.slice(0, 40), cmimi: Math.max(0, Number(preis) || 0) };
    korbSchreiben(this.speicher, this.korb);
    this.#korbZahl();
    this.#merke({ imKorb: true }, "imKorb");
    this.#merke({ korbWert: summe(this.korb), korbStueck: ids.length });
    this.kasseOeffnen();
    return true;
  }

  // Antworten aus einem Formular im Chat fuellen die leeren Kassenfelder.
  kasseVorbelegen(werte = {}) {
    const paare = [["#kasa-emri", werte.emri], ["#kasa-telefoni", werte.telefoni], ["#kasa-adresa", werte.adresa], ["#kasa-qyteti", werte.qyteti]];
    for (const [id, wert] of paare) {
      const feld = $(id, this.dok);
      if (feld && !feld.value.trim() && wert) feld.value = String(wert).slice(0, 150);
    }
  }

  // Was in der Kasse schon steht - ein Formular im Chat beginnt damit.
  kasseWerteFuerChat() {
    const w = this.#kasseWerte();
    return { emri: w.name, telefoni: w.telefon, adresa: w.strasse, qyteti: w.ort };
  }

  // ── Ereignisse ────────────────────────────────────────────────────
  #ereignisse() {
    this.dok.addEventListener("click", (ereignis) => {
      const knopf = ereignis.target.closest?.("button");
      if (!knopf) return;
      const d = knopf.dataset;
      if ("preisRetry" in d) { void this.angebotLaden(); return; }
      if ("set" in d) { this.setLegen(d.set); return; }
      if ("zitatBild" in d) { this.#blatt(`<img class="zitat-gross" src="${e(d.zitatBild)}" alt="Mesazhi origjinal i klientit në Instagram">`, "MESAZH NË INSTAGRAM"); return; }
      if ("klientSpiel" in d) { this.#klientVideo(knopf.closest(".klient-buehne")); return; }
      if ("klient" in d) {
        const m = this.klienten?.[Number(d.klient)];
        if (m) this.#blatt(`${klientBlatt(m)}<button type="button" class="primary" data-set="${e(this.setet[0]?.id || "")}">Porosit setin · ${this.setet[0] ? setPreis(this.setet[0]) : preisFuer(2)} € ${ikone("ArrowUpRight")}</button>`, "NGA KLIENTËT TANË");
        return;
      }
      if ("single" in d) { this.mittelLegen(d.single); return; }
      if ("remove" in d) {
        this.mittelNehmen(d.remove);
        if ($("#kasa", this.dok)?.hidden === false) this.#kasseZeichnen();
        else this.#korbBlatt();
        return;
      }
      if ("cart" in d) { this.kasseOeffnen(); return; }
      if ("kasa" in d) { this.kasseOeffnen(); return; }
      if ("kasaMbyll" in d) { this.kasseSchliessen(); return; }
      if ("detail" in d) { const s = this.setVon(d.detail); if (s) this.#setDetail(s); return; }
      if ("mjeti" in d) { const m = this.mittelVon(d.mjeti); if (m) this.#mittelDetail(m); return; }
      if ("continue" in d) {
        this.#blattZu();
        $("#setet", this.dok)?.scrollIntoView({ behavior: "smooth" });
        return;
      }
      if (knopf.id === "close-sheet") { this.#blattZu(); return; }
      if ("filter" in d) {
        this.filter = d.filter;
        for (const b of this.dok.querySelectorAll("[data-filter]")) b.setAttribute("aria-pressed", String(b === knopf));
        for (const karte of this.dok.querySelectorAll("#set-grid [data-concern]")) {
          karte.hidden = this.filter !== "all" && karte.dataset.concern !== this.filter;
        }
        const erstes = this.setet.find((s) => this.filter === "all" || nevojaKennung(s.nevoja) === this.filter) || this.setet[0];
        const kauf = $("#sticky-buy", this.dok);
        if (kauf && erstes) kauf.dataset.set = erstes.id;
        const label = $("#sticky-label", this.dok);
        if (label && erstes) label.textContent = erstes.titulli;
      }
    });

    // Ein Tipp neben das Blatt schliesst es.
    const blatt = $("#sheet", this.dok);
    blatt?.addEventListener("close", () => blatt.querySelector("video")?.pause?.());
    blatt?.addEventListener("click", (ereignis) => {
      if (ereignis.target?.matches?.(".klient-buehne video")) this.#klientVideo(ereignis.target.closest(".klient-buehne"));
    });
    blatt?.addEventListener("click", (ereignis) => {
      if (ereignis.target !== blatt) return;
      const r = blatt.getBoundingClientRect();
      if (ereignis.clientX < r.left || ereignis.clientX > r.right || ereignis.clientY < r.top || ereignis.clientY > r.bottom) this.#blattZu();
    });
    blatt?.addEventListener("close", () => this.opener?.focus?.({ preventScroll: true }));

    const forme = $("#kasa-forma", this.dok);
    // DIE TASTE "WEITER" IST KEIN BESTELLEN (07.10.). Enter in einem Feld
    // schickte das Formular ab - der Browser drueckt dabei selbst auf
    // "Porositni tani" (in Heart: "Tippt · Porositni tani"). Mit leeren
    // Feldern stand der Hinweis unter der Tastatur, der Cursor blieb, wo er
    // war: fuer den Kunden passierte nichts, und er ging. Seit jede Angabe
    // durchgeht (kasseFehler), haette dieselbe Taste nach dem Namen eine
    // halb leere Bestellung abgeschickt. Jetzt springt die
    // Taste ins naechste leere Feld; ist alles ausgefuellt, geht die
    // Tastatur zu und der Knopf steht frei. Bestellt wird nur mit dem Knopf.
    forme?.addEventListener("keydown", (ereignis) => {
      if (ereignis.key !== "Enter" || ereignis.isComposing) return;
      const felder = [...forme.querySelectorAll("input")];
      const hier = felder.indexOf(ereignis.target);
      if (hier < 0) return;
      ereignis.preventDefault();
      const leer = (f) => !f.value.trim();
      const naechstes = felder.slice(hier + 1).find(leer) || felder.find(leer);
      if (naechstes && naechstes !== ereignis.target) naechstes.focus();
      else ereignis.target.blur();
    });
    forme?.addEventListener("submit", (ereignis) => {
      ereignis.preventDefault();
      this.bestellen();
    });
    forme?.addEventListener("input", (ereignis) => {
      ereignis.target?.setAttribute?.("aria-invalid", "false");
      const gabim = $("#kasa-gabim", this.dok);
      if (gabim && !gabim.hidden) gabim.hidden = true;
      // Wer anfaengt, seine Anschrift zu schreiben - die Stufe zwischen
      // Kasse und Kauf, wie auf /lifeskin.
      this.#merke({ adresseBegonnen: true }, "adresseBegonnen");
      this.#live("kasa");
      // Das erste Zeichen je Feld sofort in den Klickpfad, der Stand der
      // Felder kurz danach in die Sitzung.
      const id = ereignis.target?.id;
      const wort = KASSE_FELDNAMEN[id];
      if (wort && !this.kasseGetippt.has(id)) {
        this.kasseGetippt.add(id);
        this.#pfad("eingabe", `${wort} · schreibt · kasa`);
      }
      clearTimeout(this.kasseTimer);
      this.kasseTimer = setTimeout(() => this.#kasseFelderSpeichern(), 700);
    });
    // Beim Verlassen eines Feldes: was drinsteht (oder "leer"), einmal je
    // neuem Stand.
    forme?.addEventListener("focusout", (ereignis) => {
      const id = ereignis.target?.id;
      const wort = KASSE_FELDNAMEN[id];
      if (!wort) return;
      const wert = String(ereignis.target.value || "").trim();
      if (this.kasseZuletzt.get(id) === wert) return;
      const vorher = this.kasseZuletzt.has(id);
      this.kasseZuletzt.set(id, wert);
      if (!wert && !vorher && !this.kasseGetippt.has(id)) return;
      this.#pfad("eingabe", `${wort}: ${wert ? `„${wert.slice(0, 40)}“` : "leer"} · kasa`);
      this.#kasseFelderSpeichern();
    });
  }

  // Wer die Sets oder Mittel wirklich im Bild hatte (Heart: "Produkte").
  #beobachten() {
    const sticky = $("#sticky", this.dok);
    const hero = $(".hero", this.dok);
    if (!("IntersectionObserver" in globalThis)) return;
    if (sticky && hero) {
      shopStickyBeobachten({ sticky, hero, scan: $(".skinreact-section", this.dok) });
    }
    const waechter = new IntersectionObserver((eintraege) => {
      if (!eintraege.some((x) => x.isIntersecting)) return;
      this.#merke({ produkteGesehen: true }, "produkteGesehen");
      waechter.disconnect();
    }, { threshold: 0.3 });
    for (const id of ["#setet", "#produktet"]) {
      const el = $(id, this.dok);
      if (el) waechter.observe(el);
    }

    // WIE WEIT GESCROLLT WURDE, Abschnitt fuer Abschnitt - fuer die Karte
    // "Shop" in Heart (shared/lifeskin-shopsicht.js). Gesehen heisst: wirklich
    // im Bild, nicht nur mit einer Kante (dieselbe Regel wie auf /lifeskin).
    // Ein gesehener Abschnitt wird nicht weiter beobachtet.
    const nrVon = new Map();
    const fenster = this.dok.defaultView || globalThis;
    const sicht = new IntersectionObserver((eintraege) => {
      for (const e of eintraege) {
        if (!e.isIntersecting) continue;
        if (!schirmGesehen(e.intersectionRect.height, e.boundingClientRect.height, fenster.innerHeight)) continue;
        sicht.unobserve(e.target);
        this.#sichtMerken(nrVon.get(e.target));
      }
    }, { threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1] });
    for (const a of SHOP_ABSCHNITTE) {
      const el = this.dok.querySelector(a.wahl);
      if (!el) continue;
      nrVon.set(el, a.nr);
      sicht.observe(el);
    }
  }

  // Ein gesehener Abschnitt in die Sitzung (timings.shop.sN) - erst, wenn
  // der Trichter sie angelegt hat, sonst ginge das Feld vor dem Anlegen
  // hinaus. Im stillen Modus schreibt die Seite ohnehin nichts.
  async #sichtMerken(nr) {
    try {
      const patch = shopSichtPatch(nr);
      const sitzung = patch ? await this.#sitzung() : null;
      if (!sitzung?.shopSichtSchreiben) return;
      for (let i = 0; i < 50 && sitzung.angelegt !== true; i += 1) await pause(100);
      if (sitzung.angelegt === true) sitzung.shopSichtSchreiben(patch);
    } catch { /* Messtechnik darf den Verkauf nie anhalten. */ }
  }
}

if (typeof document !== "undefined" && !globalThis.__LIFESKIN_TEST__ && document.getElementById("kasa")) {
  const start = () => { globalThis.__lifeskinShop = new Dyqan(); globalThis.__lifeskinShop.starte(); };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
}
