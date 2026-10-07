// EINE BESTELLUNG SELBST ANLEGEN - das Blatt in Heart (Auftrag 07.10.).
//
// Geoeffnet vom "+" oben rechts in der Karte "Bestellungen"
// (heart-lifeskin-render.js, data-action "lifeskin-bestellung-neu").
//
// EIGENER BEREICH AUSSERHALB VON #root - wie der Chat: Heart zeichnet bei
// jeder Live-Aenderung neu, und ein Formular darin verloere beim Tippen
// Fokus und Eingaben. Das Dokument baut heart-bestellung-neu-daten.js.
import { db } from "/shared/firebase-config.js";
import { collection, doc, getDoc, getDocs, setDoc } from "/shared/vendor/firebase/11.0.0/firebase-firestore.js";
import { STANDARD_PRODUKTE } from "../lifeskin/lifeskin-catalog.js";
import { MITTEL_FOTOS_STANDARD, SETET_DOK, setetOderStandard, aktiveSetet, setPreis } from "../../shared/lifeskin-shop-sets.js";
import { preisFuer } from "../../shared/lifeskin-preise.js";
import { neueBestellung, preisLesen, preisVorschlagFuer, stueckGesamt } from "./heart-bestellung-neu-daten.js";

const KATALOG = Object.freeze(STANDARD_PRODUKTE.map((p) => ({
  id: p.id,
  name: typeof p.name === "object" ? String(p.name.sq || p.name.de || p.id) : String(p.name || p.id),
  preis: preisFuer(1),
  foto: MITTEL_FOTOS_STANDARD[p.id] || ""
})));

const FELDER = Object.freeze([
  { id: "name", label: "Emri dhe mbiemri", typ: "text", auto: "name" },
  { id: "telefon", label: "Numri i telefonit", typ: "tel", auto: "tel" },
  { id: "adresse", label: "Adresa", typ: "text", auto: "street-address" },
  { id: "qyteti", label: "Qyteti", typ: "text", auto: "address-level2" }
]);

const esc = (w) => String(w ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
  .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
const euro = (n) => `${String(Math.round(Number(n || 0) * 100) / 100).replace(".", ",")} €`;

let blatt = null;

export function oeffneBestellungNeu(optionen = {}) {
  if (typeof document === "undefined") return null;
  if (!blatt) blatt = new BestellungNeu();
  blatt.oeffnen(optionen);
  return blatt;
}

class BestellungNeu {
  constructor() {
    this.wahl = {};
    this.preisVonHand = false;
    this.setet = [];
    this.setetGeladen = false;
    this.fotos = {};
    this.el = null;
  }

  oeffnen({ autor = "", nachher = () => {} } = {}) {
    this.autor = autor;
    this.nachher = nachher;
    this.wahl = {};
    this.preisVonHand = false;
    this.#css();
    if (!this.setetGeladen) { this.#setetLaden(); this.#fotosLaden(); }
    this.el?.remove();
    this.el = document.createElement("div");
    this.el.className = "hbest";
    this.el.setAttribute("role", "dialog");
    this.el.setAttribute("aria-modal", "true");
    this.el.setAttribute("aria-labelledby", "hbest-titel");
    this.el.innerHTML = this.#html();
    document.body.appendChild(this.el);
    document.documentElement.dataset.hbest = "offen";
    this.#binden();
    this.#hoeheFolgen();
    this.#produkteZeichnen();
    this.#preisStand();
  }

  schliessen() {
    if (!this.el) return;
    this.#hoeheLoesen();
    this.el.remove();
    this.el = null;
    delete document.documentElement.dataset.hbest;
    document.removeEventListener("keydown", this.taste);
  }

  #css() {
    if (document.querySelector('link[href$="/heart-bestellung-neu.css"]')) return;
    const css = document.createElement("link");
    css.rel = "stylesheet";
    css.href = "/apps/mnyra-heart/heart-bestellung-neu.css";
    document.head.appendChild(css);
  }

  #setetLaden() {
    const setzen = (dok) => {
      this.setet = aktiveSetet(setetOderStandard(dok)).map((s) => ({ ...s, preis: setPreis(s) }));
      this.setetGeladen = true;
      this.#setsZeichnen();
      this.#preisStand();
    };
    getDoc(doc(db, "lifeskin", "lifeskin", "config", SETET_DOK))
      .then((snap) => setzen(snap.exists() ? snap.data() : null))
      .catch(() => setzen(null));
  }

  // Die Fotos, die der Laden zeigt (Heart -> Produkte -> fotot), sonst
  // die Standardbilder - wie in shop.js.
  #fotosLaden() {
    getDocs(collection(db, "lifeskin", "lifeskin", "products"))
      .then((snap) => {
        snap.forEach((d) => { const f = d.data()?.fotot?.[0]; if (typeof f === "string" && f) this.fotos[d.id] = f; });
        this.#produkteZeichnen();
      })
      .catch(() => {});
  }

  #html() {
    const felder = FELDER.map((f) => `
      <label class="hbest-feld"><span>${esc(f.label)}</span>
        <input type="${f.typ}" name="${f.id}" autocomplete="off" data-auto="${f.auto}" ${f.typ === "tel" ? 'inputmode="tel"' : ""} enterkeyhint="next"></label>`).join("");
    return `
      <div class="hbest__blatt">
        <header class="hbest__kopf">
          <button type="button" class="hbest__zu" data-hbest-zu aria-label="Schließen"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg></button>
          <h2 id="hbest-titel">Neue Bestellung</h2>
        </header>
        <form class="hbest__inhalt" id="hbest-form" novalidate>
          <section class="hbest-teil">
            <h3>Produkte</h3>
            <div class="hbest-sets" id="hbest-sets"></div>
            <ul class="hbest-produkte" id="hbest-produkte"></ul>
          </section>
          <section class="hbest-teil">
            <h3>Preis</h3>
            <label class="hbest-preis"><input id="hbest-preis" name="preis" inputmode="decimal" autocomplete="off" placeholder="0" aria-label="Preis in Euro"><span>€</span></label>
            <p class="hbest-hinweis" id="hbest-preis-hinweis"></p>
          </section>
          <section class="hbest-teil">
            <h3>Kunde</h3>
            ${felder}
            <label class="hbest-feld"><span>Shënim <small>(optional)</small></span><textarea name="shenim" rows="2" autocomplete="off"></textarea></label>
          </section>
        </form>
        <footer class="hbest__fuss">
          <p class="hbest-fehler" id="hbest-fehler" role="alert" hidden></p>
          <button type="submit" form="hbest-form" class="hbest-anlegen" id="hbest-anlegen" disabled>Bestellung anlegen</button>
        </footer>
      </div>`;
  }

  #binden() {
    const el = this.el;
    el.addEventListener("click", (e) => {
      if (e.target.closest("[data-hbest-zu]")) { this.schliessen(); return; }
      const set = e.target.closest("[data-set]");
      if (set) { this.#setWaehlen(set.dataset.set); return; }
      const knopf = e.target.closest("[data-menge]");
      if (knopf) {
        const id = knopf.dataset.id;
        const n = Math.max(0, Math.min(99, (Number(this.wahl[id]) || 0) + Number(knopf.dataset.menge)));
        if (n) this.wahl[id] = n; else delete this.wahl[id];
        this.#produkteZeichnen();
        this.#preisStand();
        return;
      }
      const zeile = e.target.closest("[data-produkt]");
      if (zeile && !e.target.closest("button")) {
        const id = zeile.dataset.produkt;
        if (this.wahl[id]) delete this.wahl[id]; else this.wahl[id] = 1;
        this.#produkteZeichnen();
        this.#preisStand();
      }
    });
    el.querySelector("#hbest-preis").addEventListener("input", (e) => {
      this.preisVonHand = e.target.value.trim() !== "";
      this.#preisStand(false);
    });
    el.querySelector("#hbest-form").addEventListener("submit", (e) => { e.preventDefault(); this.#anlegen(); });
    // Enter springt ins naechste Feld statt abzuschicken.
    el.querySelector("#hbest-form").addEventListener("keydown", (e) => {
      if (e.key !== "Enter" || e.target.tagName !== "INPUT") return;
      e.preventDefault();
      const felder = [...el.querySelectorAll("#hbest-form input, #hbest-form textarea")];
      felder[felder.indexOf(e.target) + 1]?.focus();
    });
    this.taste = (e) => { if (e.key === "Escape") this.schliessen(); };
    document.addEventListener("keydown", this.taste);
  }

  // Hoehe = sichtbarer Bereich (ueber der Tastatur), damit der Knopf
  // unten auf dem Telefon nie hinter der Tastatur liegt.
  #hoeheFolgen() {
    const vv = window.visualViewport;
    this.hoehe = () => {
      if (!this.el) return;
      this.el.style.setProperty("--hbest-h", `${Math.round(vv ? vv.height : window.innerHeight)}px`);
      this.el.style.setProperty("--hbest-oben", `${Math.round(vv ? vv.offsetTop : 0)}px`);
    };
    this.hoehe();
    vv?.addEventListener("resize", this.hoehe);
    vv?.addEventListener("scroll", this.hoehe);
    window.addEventListener("resize", this.hoehe);
  }

  #hoeheLoesen() {
    const vv = window.visualViewport;
    if (!this.hoehe) return;
    vv?.removeEventListener("resize", this.hoehe);
    vv?.removeEventListener("scroll", this.hoehe);
    window.removeEventListener("resize", this.hoehe);
    this.hoehe = null;
  }

  #setsZeichnen() {
    const ort = this.el?.querySelector("#hbest-sets");
    if (!ort) return;
    const ids = Object.keys(this.wahl).sort().join(",");
    ort.innerHTML = this.setet.map((s) => {
      const an = ids && [...new Set(s.produkte)].sort().join(",") === ids && Object.values(this.wahl).every((n) => n === 1);
      return `<button type="button" class="hbest-set${an ? " hbest-set--an" : ""}" data-set="${esc(s.id)}" aria-pressed="${an}">${esc(s.titulli)} · ${esc(euro(s.preis))}</button>`;
    }).join("");
  }

  #setWaehlen(id) {
    const s = this.setet.find((x) => x.id === id);
    if (!s) return;
    this.wahl = Object.fromEntries([...new Set(s.produkte)].map((p) => [p, 1]));
    this.preisVonHand = false;
    this.#produkteZeichnen();
    this.#preisStand();
  }

  #produkteZeichnen() {
    const ort = this.el?.querySelector("#hbest-produkte");
    if (!ort) return;
    ort.innerHTML = KATALOG.map((p) => {
      const n = Number(this.wahl[p.id]) || 0;
      const foto = this.fotos[p.id] || p.foto;
      return `
        <li class="hbest-produkt${n ? " hbest-produkt--an" : ""}" data-produkt="${esc(p.id)}">
          ${foto ? `<img src="${esc(foto)}" alt="" width="44" height="54" loading="lazy">` : '<span class="hbest-produkt__leer"></span>'}
          <span class="hbest-produkt__name"><b>${esc(p.name)}</b></span>
          <span class="hbest-menge">
            ${n ? `<button type="button" data-menge="-1" data-id="${esc(p.id)}" aria-label="${esc(p.name)} weniger">−</button><output>${n}</output>` : ""}
            <button type="button" data-menge="1" data-id="${esc(p.id)}" aria-label="${esc(p.name)} mehr">+</button>
          </span>
        </li>`;
    }).join("");
    this.#setsZeichnen();
  }

  #vorschlag() {
    return preisVorschlagFuer(this.wahl, this.setet, preisFuer);
  }

  #preisStand(feldSetzen = true) {
    if (!this.el) return;
    const feld = this.el.querySelector("#hbest-preis");
    const vorschlag = this.#vorschlag();
    if (feldSetzen && !this.preisVonHand) feld.value = vorschlag ? String(vorschlag).replace(".", ",") : "";
    const stueck = stueckGesamt(this.wahl);
    const preis = preisLesen(feld.value) ?? vorschlag;
    this.el.querySelector("#hbest-preis-hinweis").textContent = stueck
      ? `${stueck} ${stueck === 1 ? "Produkt" : "Produkte"} · Vorschlag ${euro(vorschlag)} · Zahlung bei Lieferung`
      : "Erst Produkte wählen – der Preis kommt dann von selbst (änderbar).";
    const knopf = this.el.querySelector("#hbest-anlegen");
    knopf.disabled = !stueck || this.speichert;
    knopf.textContent = stueck ? `Bestellung anlegen · ${euro(preis)}` : "Bestellung anlegen";
  }

  #fehler(text) {
    const f = this.el?.querySelector("#hbest-fehler");
    if (!f) return;
    f.textContent = text || "";
    f.hidden = !text;
  }

  async #anlegen() {
    if (this.speichert || !this.el) return;
    const form = this.el.querySelector("#hbest-form");
    const wert = (n) => form.elements[n]?.value || "";
    const ergebnis = neueBestellung({
      wahl: this.wahl,
      katalog: KATALOG,
      preis: preisLesen(wert("preis")),
      vorschlag: this.#vorschlag(),
      kunde: { name: wert("name"), telefon: wert("telefon"), adresse: wert("adresse"), qyteti: wert("qyteti"), shenim: wert("shenim") },
      autor: this.autor
    });
    if (ergebnis.fehler) { this.#fehler(ergebnis.fehler); return; }
    this.#fehler("");
    this.speichert = true;
    const knopf = this.el.querySelector("#hbest-anlegen");
    knopf.disabled = true;
    knopf.textContent = "Wird angelegt …";
    try {
      await setDoc(doc(db, "lifeskin", "lifeskin", "sessions", ergebnis.id), ergebnis.daten);
      this.speichert = false;
      this.schliessen();
      this.nachher?.(ergebnis.id, ergebnis.code);
    } catch (fehler) {
      this.speichert = false;
      console.warn("[heart-bestellung-neu]", fehler?.message || fehler);
      this.#fehler("Speichern hat nicht geklappt – bitte Verbindung prüfen und nochmal tippen.");
      this.#preisStand(false);
    }
  }
}
