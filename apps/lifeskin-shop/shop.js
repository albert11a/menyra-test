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
 *          schritt("ordered") -> Purchase im Browser, und die Conversions
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
import { LIFESKIN_FIRESTORE_BASE, LIFESKIN_TENANT } from "../lifeskin/lifeskin-config.js";
import { pixelKennungen } from "../lifeskin/lifeskin-pixel.js";
import { preisFuer } from "../../shared/lifeskin-preise.js";
import { ansichtOeffnen, ansichtSchliessen } from "../../shared/lifeskin-ansicht.js";
import { mittelBauen, holeSammlung, FOTO_PRAEFIX } from "../lifeskin-landing/shop.js";
import { rasteLaden, rasteFuer, rasteMitBildern } from "../../shared/lifeskin-raste.js";
import {
  SETET_DOK, SET_FOTO_PRAEFIX, SHOP_HERO_DOK, SETET_STANDARD, MITTEL_FOTOS_STANDARD, MITTEL_NENTITUJ,
  setetOderStandard, setetNormalisieren, aktiveSetet, nevojaKennung
} from "../../shared/lifeskin-shop-sets.js";

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

// Nach der Staffel (shared/lifeskin-preise.js): 1 = 29, 2 = 39, 3 = 49 ...
export function summe(korb) {
  return korb.ids.length ? preisFuer(korb.ids.length) : 0;
}

// Die Pflichtfelder der Kasse. Dieselbe Regel wie auf /lifeskin: alle vier.
export function kasseFehler(werte) {
  if (!werte.name || !werte.telefon || !werte.strasse || !werte.ort) return "Ju lutemi plotësoni të gjitha fushat.";
  if (werte.telefon.replace(/\D/g, "").length < 7) return "Ju lutemi shkruani një numër telefoni të saktë.";
  return "";
}

// Die Zeilen der Bestellung - je Zeile id, name, Preis, Anzahl, wie im
// Laden der Landingpage (Heart liest order.items).
export function bestellZeilen(korb, mittel) {
  const nachId = new Map(mittel.map((m) => [m.id, m]));
  return korb.ids.map((id) => ({ id, name: nachId.get(id)?.name || id, cmimi: preisFuer(1), sasia: 1 }));
}

// ── Firestore lesen, ohne die Firebase-App (REST, wie der ganze Trichter) ──
async function holeDok(name, holen = fetch) {
  const antwort = await holen(`${BASIS}/${encodeURIComponent(name)}`);
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
  return complete ? {ids:[...duo.produkte],set:duo.id} : {ids:[],set:''};
}
export function duoCard(s, mittel) {
  const price=preisFuer(2), extra=price-preisFuer(1), saving=2*preisFuer(1)-price;
  const roles=[['lf-acne','Target','01','Kujdesi për aknet','Kujdes i përqendruar për lëkurën me akne.'],['lf-moistur','Droplets','02','Hidratimi që e plotëson','Kujdes për hidratimin dhe barrierën e lëkurës.']];
  return `<article class="duo-card"><div class="duo-products">${roles.map(([id,icon,n,title,description])=>{
    const m=mittel.find(m=>m.id===id);
    return `<details class="duo-product"><summary><span class="duo-product-icon">${ikone(icon)}</span><span class="duo-product-label"><small>${n} · ${e(m?.name || id.toUpperCase().replace('LF-','LF '))}</small><strong>${title}</strong></span>${ikone('Plus')}</summary><div class="duo-product-body"><p>${description}</p><dl><div><dt>Përmbajtja</dt><dd>${e(m?.inhalt || '30 ml')}</dd></div><div><dt>Në set</dt><dd>1 produkt</dd></div></dl><p class="duo-use">Ndiqni udhëzimet e produktit dhe rekomandimin për lëkurën tuaj.</p></div></details>`;
  }).join('')}</div><div class="duo-value"><span class="duo-value-label">PSE T'I MERRNI SË BASHKU?</span><p>LF ACNE veçmas kushton ${preisFuer(1)} €. <strong>Për vetëm ${extra} € më shumë, merrni edhe LF MOISTUR.</strong></p><div class="duo-total"><span>Seti i plotë · 2 × 30 ml<small>Veçmas ${2*preisFuer(1)} € · Kurseni ${saving} €</small></span><strong>${price} €</strong></div></div><button type="button" class="primary" data-set="${e(s.id)}">Porosit setin e plotë · ${price} € ${ikone('ArrowUpRight')}</button><p class="duo-payment">Dërgesa e përfshirë · Paguani kur merrni pakon</p></article>`;
}

export class Dyqan {
  constructor({ dokument = document, speicher = globalThis.sessionStorage, holen, trichter } = {}) {
    this.dok = dokument;
    this.speicher = speicher;
    this.holen = holen || ((...a) => fetch(...a));
    // Der Trichter wird bei Bedarf geholt: dieses Modul laeuft, bevor
    // lifeskin-app.js seine Instanz gesetzt hat.
    this.trichterFn = trichter || (() => globalThis.__lifeskinTrichter);
    this.korb = korbLesen(this.speicher);
    this.mittel = mittelBauen([], this.#standardFotos(new Map()));
    this.setet = acneDuoSets(aktiveSetet(setetNormalisieren(SETET_STANDARD)));
    this.korb = acneDuoCart(this.korb, this.setet);
    korbSchreiben(this.speicher, this.korb);
    this.setFotos = new Map();
    this.gemerkt = new Set();
    this.filter = "all";
    this.sendet = false;
    this.opener = null;
  }

  starte() {
    this.#zeichneSetet();
    this.#zeichneMittel();
    this.#korbZahl();
    this.#ereignisse();
    this.#beobachten();
    this.titelbild();
    this.laden();
  }

  // ── Das Titelbild aus Heart (zugeschnitten 7:5) ─────────────────────
  // Eine eigene Anfrage, damit es nicht auf Produkte und Faelle wartet. Das
  // neue Bild wird erst dekodiert, dann getauscht - kein leerer Rahmen.
  async titelbild() {
    try {
      const d = await holeDok(SHOP_HERO_DOK, this.holen);
      const foto = typeof d?.foto === "string" && d.foto.startsWith("data:image/") ? d.foto : "";
      const rahmen = $("#ls-einstieg .hero-photo", this.dok);
      const img = rahmen?.querySelector(":scope > img");
      if (!foto || !img) return;
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

  // ── Laden aus Heart ────────────────────────────────────────────────
  #standardFotos(fotos) {
    for (const [id, bild] of Object.entries(MITTEL_FOTOS_STANDARD)) {
      if (!(fotos.get(id) || []).length) fotos.set(id, [bild]);
    }
    return fotos;
  }

  async laden() {
    const [produkte, konfig, setDok, raste] = await Promise.all([
      holeSammlung("products", this.holen).catch(() => []),
      holeSammlung("config", this.holen, "fotot").catch(() => []),
      holeDok(SETET_DOK, this.holen).catch(() => null),
      rasteLaden(BASIS).catch(() => null)
    ]);
    // Die Einzelmittel: Heart-Produkte mit ihren Bildern (Produkte ->
    // Bilder der Landingpage), sonst die Aufnahmen dieser Seite.
    const fotos = new Map();
    for (const doku of konfig || []) {
      if (!String(doku.id).startsWith(FOTO_PRAEFIX)) continue;
      const liste = Array.isArray(doku.fotot) ? doku.fotot : [];
      fotos.set(doku.id.slice(FOTO_PRAEFIX.length), liste.filter((f) => typeof f === "string" && f.startsWith("data:image/")));
    }
    this.mittel = mittelBauen(produkte || [], this.#standardFotos(fotos));

    // Die Sets: aus Heart, nur mit Mitteln, die es zu kaufen gibt.
    const da = new Set(this.mittel.map((m) => m.id));
    this.setet = acneDuoSets(aktiveSetet(setetOderStandard(setDok)))
      .map((s) => ({ ...s, produkte: s.produkte.filter((id) => da.has(id)) }))
      .filter((s) => s.produkte.length === 2);
    await Promise.all(this.setet.filter((s) => s.bild).map(async (s) => {
      try {
        const d = await holeDok(`${SET_FOTO_PRAEFIX}${s.id}`, this.holen);
        if (typeof d?.foto === "string" && d.foto.startsWith("data:image/")) this.setFotos.set(s.id, d.foto);
      } catch { /* dann das Bild des ersten Mittels */ }
    }));
    // Der Korb darf nur Mittel tragen, die es noch gibt.
    this.korb = acneDuoCart(this.korb, this.setet);
    korbSchreiben(this.speicher, this.korb);
    this.#zeichneSetet();
    this.#zeichneMittel();
    this.#korbZahl();

    // Die Faelle mit Ort "Shop".
    if (raste) {
      try {
        const faelle = await rasteMitBildern(rasteFuer(raste, "shop"), BASIS);
        if (faelle.length) this.#zeichneFaelle(faelle);
      } catch { /* dann bleibt der Fall aus dem Aufbau stehen */ }
    }
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
    const available = this.setet.length > 0;
    for (const button of this.dok.querySelectorAll('.hero [data-set], #sticky-buy')) button.disabled = !available;
    if (!available) { raster.innerHTML = '<p class="section-intro">Seti nuk është aktualisht i disponueshëm.</p>'; return; }
    raster.innerHTML = this.setet.map(s => duoCard(s, this.mittel)).join('');
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
    for (const knopf of this.dok.querySelectorAll(".hero [data-set], #sticky-buy")) knopf.dataset.set = erstes.id;
    const label = $("#sticky-label", this.dok);
    if (label) label.textContent = erstes.titulli;
    const preis = $("#sticky-price", this.dok);
    if (preis) preis.textContent = `${preisFuer(erstes.produkte.length)} €`;
  }

  // Einzeln verkauft wird, was in einem Set steht, das im Shop ist (Wunsch
  // 28.09.: vorerst nur LF ACNE und LF MOISTUR). Schaltet Heart ein Set ein,
  // kommen seine Mittel hier dazu. Ohne Sets: alle Mittel.
  einzelMittel() {
    return einzelAusSets(this.mittel, this.setet);
  }

  #zeichneMittel() {
    const raster = $("#single-grid", this.dok);
    if (raster) { raster.innerHTML = ''; raster.closest('.singles')?.setAttribute('hidden',''); }
  }

  #zeichneFaelle(faelle) {
    const bahn = $("#proof-bahn", this.dok);
    if (!bahn) return;
    const bild = (src, alt) => `<img src="${e(src)}" width="600" height="800" alt="${e(alt)}" loading="lazy">`;
    bahn.innerHTML = faelle.map((r) => `<article class="proof-rast"><div class="proof-pair"><figure>${bild(r.para, `Para: ${r.gjetja || ""}`)}<figcaption>PARA <span>Në fillim</span></figcaption></figure><figure>${bild(r.pas, `Pas 28 ditësh: ${r.gjetja || ""}`)}<figcaption>PAS <span>Pas 4 javësh</span></figcaption></figure></div></article>`).join("");
    bahn.scrollLeft = 0;
    let pikat = $("#proof-pikat", this.dok);
    if (faelle.length < 2) { pikat?.remove(); return; }
    if (!pikat) {
      pikat = this.dok.createElement("div");
      pikat.id = "proof-pikat";
      pikat.className = "proof-pikat";
      pikat.setAttribute("aria-hidden", "true");
      bahn.after(pikat);
    }
    pikat.innerHTML = faelle.map((_, i) => `<i data-an="${i === 0 ? "ja" : "nein"}"></i>`).join("");
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

  #korbZeilen() {
    return this.korb.ids.map((id, index) => {
      const m = this.mittelVon(id);
      if (!m) return "";
      return `<div class="basket-row"><img src="${e(m.fotot[0])}" alt="${e(m.name)}" width="62" height="78"><div><h3>${e(m.name)}</h3><p>${e(MITTEL_NENTITUJ[m.id] || m.kurztext || m.nenName || "")}${m.inhalt ? ` · ${e(m.inhalt)}` : ""}</p></div>${index === 0 ? `<button type="button" class="remove" data-remove="${e(id)}" aria-label="Hiqni setin e plotë" title="Hiqni setin e plotë">${ikone("Trash2")}</button>` : ''}</div>`;
    }).join("");
  }

  #kursim() {
    const n = this.korb.ids.length;
    return n > 1 ? `Veçmas ${n * preisFuer(1)} € · Kurseni ${n * preisFuer(1) - summe(this.korb)} € së bashku.` : "";
  }

  #korbBlatt() {
    const n = this.korb.ids.length;
    const kursim = this.#kursim();
    this.#blatt(`<h2 id="sheet-title">${n ? "U shtua në shportë." : "Shporta juaj."}</h2><p>${n ? "Kontrolloni produktet dhe vazhdoni me porosinë." : "Zgjidhni një set ose produkt për të filluar."}</p>${this.#korbZeilen()}${n ? `<div class="total"><span>Gjithsej · dërgesa e përfshirë</span><strong>${summe(this.korb)} €</strong></div>${kursim ? `<p class="cart-saving">${e(kursim)}</p>` : ""}` : ""}<div class="sheet-actions">${n ? `<button type="button" class="primary" data-kasa>Vazhdo me porosinë · ${summe(this.korb)} € ${ikone("ArrowRight")}</button>` : ""}<button type="button" class="secondary" data-continue>${n ? "Vazhdo blerjet" : "Zgjidhni setin tuaj"} ${ikone("ArrowUpRight")}</button></div>`);
  }

  #setDetail(s) {
    this.#merke({ produkteGesehen: true }, "produkteGesehen");
    const preis = preisFuer(s.produkte.length);
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
    if (stueck > 0) this.#merke({ imKorb: true }, "imKorb");
    this.#merke({ korbWert: summe(this.korb), korbStueck: stueck });
  }

  setLegen(id) {
    const s = this.setVon(id);
    if (!s) return;
    // Ein Set ersetzt den Korb: eine Routine auf einmal, keine
    // zufaellige Mischung von Wirkstoffen.
    this.korb = { ids: [...s.produkte], set: s.id };
    this.#nachLegen();
    this.#korbBlatt();
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
      this.#merke({ kasseGeoeffnet: true, kasseGeoeffnetAt: new Date().toISOString() }, "kasseGeoeffnet");
    }
  }

  kasseSchliessen() {
    const kasa = $("#kasa", this.dok);
    if (kasa) ansichtSchliessen(kasa, { dokument: this.dok });
  }

  #kasseZeichnen() {
    const n = this.korb.ids.length;
    $("#kasa-lista", this.dok).innerHTML = this.#korbZeilen();
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
  }

  // Wartet kurz auf die Sitzung des Trichters - wer sehr schnell bestellt,
  // koennte vor ihr da sein.
  async #sitzung() {
    for (let i = 0; i < 30; i += 1) {
      const s = this.trichterFn()?.sitzung;
      if (s) return s;
      await new Promise((fertig) => setTimeout(fertig, 100));
    }
    return null;
  }

  // Derselbe Ablauf wie auf /lifeskin: pruefen, Knopf sperren, schreiben,
  // und erst NACH der Antwort des Servers bestaetigen.
  async bestellen() {
    if (this.sendet || !this.korb.ids.length) return;
    const feld = (id) => $(id, this.dok)?.value.trim() || "";
    const werte = { name: feld("#kasa-emri"), telefon: feld("#kasa-telefoni"), strasse: feld("#kasa-adresa"), ort: feld("#kasa-qyteti") };
    const gabim = $("#kasa-gabim", this.dok);
    const fehler = kasseFehler(werte);
    for (const [id, wert] of [["#kasa-emri", werte.name], ["#kasa-telefoni", werte.telefon], ["#kasa-adresa", werte.strasse], ["#kasa-qyteti", werte.ort]]) {
      $(id, this.dok)?.setAttribute("aria-invalid", wert ? "false" : "true");
    }
    if (fehler) {
      gabim.textContent = fehler;
      gabim.hidden = false;
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
    if (sitzung) {
      // schritt() setzt den Schritt auf "ordered", haelt die Zeit fest und
      // meldet den Pixel (Purchase) - ueber dieselbe Stelle wie jeder
      // Schritt, also genau einmal. Die Conversions API meldet denselben
      // Kauf vom Server. Alles in der Karte "order" (firestore.rules).
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
          ...pixelKennungen()
        }
      }).catch(() => null);
      ok = Boolean(antwort?.ok);
    }

    this.sendet = false;
    knopf.disabled = false;
    text.textContent = "Porositni";
    if (!ok) {
      gabim.textContent = "Porosia nuk u dërgua. Ju lutemi provoni sërish.";
      gabim.hidden = false;
      return;
    }
    // Woher die Bestellung kommt: aus dem Laden, nicht von der Befundseite.
    this.#merke({ shopKauf: true }, "shopKauf");
    this.korb = { ids: [], set: "" };
    korbSchreiben(this.speicher, this.korb);
    this.#korbZahl();
    $("#kasa-trup", this.dok).hidden = true;
    $("#kasa-kodi", this.dok).textContent = sitzung?.code ? `Numri i porosisë: ${sitzung.code}` : "";
    $("#kasa-faleminderit", this.dok).hidden = false;
  }

  // ── Ereignisse ────────────────────────────────────────────────────
  #ereignisse() {
    this.dok.addEventListener("click", (ereignis) => {
      const knopf = ereignis.target.closest?.("button");
      if (!knopf) return;
      const d = knopf.dataset;
      if ("set" in d) { this.setLegen(d.set); return; }
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
    blatt?.addEventListener("click", (ereignis) => {
      if (ereignis.target !== blatt) return;
      const r = blatt.getBoundingClientRect();
      if (ereignis.clientX < r.left || ereignis.clientX > r.right || ereignis.clientY < r.top || ereignis.clientY > r.bottom) this.#blattZu();
    });
    blatt?.addEventListener("close", () => this.opener?.focus?.({ preventScroll: true }));

    const forme = $("#kasa-forma", this.dok);
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
    });
  }

  // Wer die Sets oder Mittel wirklich im Bild hatte (Heart: "Produkte").
  #beobachten() {
    const sticky = $("#sticky", this.dok);
    const hero = $(".hero", this.dok);
    if (!("IntersectionObserver" in globalThis)) return;
    if (sticky && hero) {
      new IntersectionObserver((eintraege) => { sticky.hidden = eintraege[0].isIntersecting; }, { threshold: 0 }).observe(hero);
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
  }
}

if (typeof document !== "undefined" && !globalThis.__LIFESKIN_TEST__ && document.getElementById("kasa")) {
  const start = () => new Dyqan().starte();
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
}
