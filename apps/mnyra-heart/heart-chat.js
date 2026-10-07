// DER CHAT IN HEART - Daten und Bedienung (docs/lifeskin-chat.md, 07.10.).
//
// EIGENER BEREICH AUSSERHALB VON #root. Heart zeichnet bei jeder Aenderung
// die ganze Oberflaeche neu; ein Chat, in dem gerade getippt wird und
// jede Sekunde etwas ankommt, waere darin traege und wuerde Fokus und
// Scrollstand verlieren. Hier wird nur neu gezeichnet, was sich aendert:
// die Liste, die Nachrichten, der Kunde - nie das Eingabefeld.
//
// Heart selbst traegt nur den Knopf oben (heart-render.js, data-action
// "chat-oeffnen") mit der Zahl der ungelesenen (state.shell.chatZahl).
//
// ECHTZEIT: onSnapshot auf alle Chats (Liste, Zahl, Ton) und auf die
// Nachrichten des offenen Chats. "schreibt" (teamTipptAt) und "gesehen"
// (teamGelesenAt) gehen beim Tippen/Lesen hinaus, "online" (config/chat.
// teamAktivAt) jede Minute, solange Heart sichtbar ist.
import { db } from "/shared/firebase-config.js";
import {
  collection, doc, getDoc, limit, limitToLast, onSnapshot, orderBy, query, serverTimestamp, setDoc, updateDoc, writeBatch
} from "/shared/vendor/firebase/11.0.0/firebase-firestore.js";
import {
  teamText, teamBild, teamProdukte, teamFormular, vorschauVon, sortiereNachrichten, nachrichtKennung,
  chatUngelesen, chatStatus, nachrichtMs, zeitMs, zugangGueltig, CHAT_PRODUKTE_MAX
} from "../../shared/lifeskin-chat.js";
import { bildVerkleinern } from "../../shared/lifeskin-chat-bild.js";
import { STANDARD_PRODUKTE } from "../lifeskin/lifeskin-catalog.js";
import { MITTEL_FOTOS_STANDARD, SETET_DOK, setetOderStandard, aktiveSetet } from "../../shared/lifeskin-shop-sets.js";
import { preisFuer } from "../../shared/lifeskin-preise.js";
import { pfadLesen } from "../../shared/lifeskin-klickpfad.js";
import { normalisiere, herkunftArt, kasseInfo } from "./heart-lifeskin-berechnung.js";
import { renderListe, renderNachrichten, renderEntwurf, renderKunde, renderProduktWahl, renderFormularWahl, chatName, esc, preisVorschlag } from "./heart-chat-render.js";

const TENANT = "lifeskin";
const KONFIG = () => doc(db, "lifeskin", TENANT, "config", "chat");
const CHAT = (z) => doc(db, "lifeskin", TENANT, "chats", z);
const TIPPT_MS = 2500;
const HERZSCHLAG_MS = 60000;

// Die Adresse beim Laden (aus der Meldung: /heart#chat/<zugang>) - bevor
// Heart sie auf seine Ansicht umschreibt.
const START_HASH = typeof location !== "undefined" ? String(location.hash || "") : "";
export function zugangAusHash(hash) {
  const m = /^#chat(?:\/([0-9a-f]{32}))?$/.exec(String(hash || ""));
  return m ? { chat: true, zugang: m[1] || "" } : null;
}

export const CHAT_PRODUKTE = Object.freeze(STANDARD_PRODUKTE.map((p) => ({
  id: p.id,
  name: typeof p.name === "object" ? String(p.name.sq || p.name.de || p.id) : String(p.name || p.id),
  preis: preisFuer(1),
  foto: MITTEL_FOTOS_STANDARD[p.id] || ""
})));
const produktName = (id) => CHAT_PRODUKTE.find((p) => p.id === id)?.name || "";


let laeuft = null;

export function starteHeartChat(optionen = {}) {
  if (laeuft) return laeuft;
  if (typeof document === "undefined") return null;
  laeuft = new HeartChat(optionen).starte();
  return laeuft;
}

class HeartChat {
  constructor({ autor = "", meldeZahl = () => {}, oeffneFall = () => {}, sitzungVon = () => null, pfadSatz } = {}) {
    this.autor = autor;
    this.meldeZahl = meldeZahl;
    this.oeffneFall = oeffneFall;
    this.sitzungAusHeart = sitzungVon;
    this.pfadSatz = pfadSatz || ((e) => `${e.e} · ${e.d}`);
    this.chats = new Map();
    this.chip = "offen";
    this.offen = "";
    this.nachrichten = new Map();
    this.ausstehend = new Map();
    this.sitzungen = new Map(); // sessionId -> normalisiert (selbst geholt)
    this.konfig = { aktiv: false };
    this.sichtbar = false;
    this.produktWahl = [];
    this.letzterTipp = 0;
    this.zuletztGemeldet = new Map();
    this.abNachrichten = null;
    this.ersterStand = true;
    this.setet = [];
  }

  starte() {
    this.#geruest();
    // Der Ton braucht einen ersten Tipp (Regel der Browser) - irgendeinen.
    document.addEventListener("pointerdown", () => this.#tonFreischalten(), { capture: true, passive: true });
    getDoc(doc(db, "lifeskin", TENANT, "config", SETET_DOK))
      .then((snap) => { this.setet = aktiveSetet(setetOderStandard(snap.exists() ? snap.data() : null)); })
      .catch(() => { this.setet = aktiveSetet(setetOderStandard(null)); });
    onSnapshot(KONFIG(), (snap) => {
      this.konfig = snap.exists() ? snap.data() : { aktiv: false };
      const schalter = document.getElementById("hchat-aktiv");
      if (schalter) schalter.checked = this.konfig.aktiv === true;
      this.#schalterText();
    }, () => {});
    onSnapshot(query(collection(db, "lifeskin", TENANT, "chats"), orderBy("updatedAt", "desc"), limit(300)), (snap) => {
      for (const a of snap.docChanges()) {
        if (a.type === "removed") { this.chats.delete(a.doc.id); continue; }
        const vorher = this.chats.get(a.doc.id);
        const neu = { id: a.doc.id, ...a.doc.data({ serverTimestamps: "estimate" }) };
        this.chats.set(a.doc.id, neu);
        if (!this.ersterStand) this.#neuGemeldet(vorher, neu);
      }
      this.ersterStand = false;
      this.#liste();
      if (this.offen) this.#kopf();
      if (this.offen) this.#entwurfAuffrischen();
    }, (fehler) => this.#hinweis(`Chats nicht geladen: ${fehler?.code || fehler?.message || ""}`));
    // Online-Herzschlag fuer den Kopf beim Kunden.
    const schlag = () => {
      if (document.visibilityState !== "visible") return;
      setDoc(KONFIG(), { teamAktivAt: new Date().toISOString(), teamName: this.konfig.teamName || "Dr. Gashi & ekipi LifeSkin" }, { merge: true }).catch(() => {});
    };
    schlag();
    setInterval(schlag, HERZSCHLAG_MS);
    document.addEventListener("visibilitychange", () => { if (document.visibilityState === "visible") { schlag(); this.#gelesen(); } });
    // Aus der Meldung: /heart#chat/<zugang>
    const ziel = zugangAusHash(START_HASH);
    if (ziel) setTimeout(() => this.oeffnen(ziel.zugang), 0);
    window.addEventListener("hashchange", () => {
      const z = zugangAusHash(location.hash);
      if (z) this.oeffnen(z.zugang);
    });
    // Die Liste "vor x Minuten" und "schreibt" altern lassen.
    setInterval(() => { if (this.sichtbar) { this.#liste(); this.#entwurfAuffrischen(); } }, 15000);
    return this;
  }

  // ── Ton und Zahl bei neuen Nachrichten ─────────────────────────────
  #neuGemeldet(vorher, neu) {
    const l = neu.letzte;
    if (!l || l.von !== "kunde") return;
    const ms = nachrichtMs(l);
    if (!ms || ms <= nachrichtMs(vorher?.letzte)) return;
    if (this.zuletztGemeldet.get(neu.id) === ms) return;
    this.zuletztGemeldet.set(neu.id, ms);
    // Erledigt, und der Kunde schreibt wieder: offen.
    if (neu.status === "erledigt") updateDoc(CHAT(neu.id), { status: "offen" }).catch(() => {});
    const liestGerade = this.sichtbar && this.offen === neu.id && document.visibilityState === "visible";
    if (!liestGerade) this.#ton();
  }

  #tonFreischalten() {
    if (this.audio) return;
    try { this.audio = new (window.AudioContext || window.webkitAudioContext)(); } catch { this.audio = null; }
  }

  #ton() {
    try {
      const ctx = this.audio;
      if (!ctx) return;
      if (ctx.state === "suspended") ctx.resume().catch(() => {});
      const jetzt = ctx.currentTime;
      for (const [ab, hz] of [[0, 880], [0.14, 1320]]) {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.frequency.value = hz;
        g.gain.setValueAtTime(0.0001, jetzt + ab);
        g.gain.exponentialRampToValueAtTime(0.18, jetzt + ab + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, jetzt + ab + 0.18);
        o.connect(g).connect(ctx.destination);
        o.start(jetzt + ab);
        o.stop(jetzt + ab + 0.2);
      }
    } catch { /* ohne Ton */ }
  }

  // ── Geruest ────────────────────────────────────────────────────────
  #geruest() {
    // Das Aussehen: steht in beiden Startseiten (apps/mnyra-heart/index.html
    // und heart/index.html) - fehlt es in einer, wird es hier nachgeladen.
    if (!document.querySelector('link[href$="/heart-chat.css"]')) {
      const css = document.createElement("link");
      css.rel = "stylesheet";
      css.href = "/apps/mnyra-heart/heart-chat.css";
      document.head.appendChild(css);
    }
    const el = document.createElement("div");
    el.className = "hchat";
    el.id = "hchat";
    el.hidden = true;
    el.dataset.ansicht = "liste";
    el.innerHTML = `
      <section class="hchat__liste" aria-label="Chats">
        <header class="hchat__kopf">
          <button type="button" class="hchat-rund" data-zu aria-label="Chat schliessen"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg></button>
          <b class="hchat__titel">Chat</b>
          <label class="hchat-schalter"><input type="checkbox" id="hchat-aktiv" role="switch"><span class="hchat-schalter__bahn" aria-hidden="true"></span><span class="hchat-schalter__text" id="hchat-aktiv-text">Aus</span></label>
        </header>
        <p class="hchat__hinweis" id="hchat-hinweis" hidden></p>
        <div class="hchat__listeninhalt" id="hchat-listeninhalt"></div>
      </section>
      <section class="hchat__gespraech" aria-label="Unterhaltung">
        <header class="hchat__kopf">
          <button type="button" class="hchat-rund" data-zurueck aria-label="Zur Liste"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 18l-6-6 6-6"/></svg></button>
          <div class="hchat__wer"><b id="hchat-name"></b><span id="hchat-sub"></span></div>
          <button type="button" class="hchat-rund" data-info aria-label="Kunde anzeigen"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6"/></svg></button>
        </header>
        <div class="hchat__status" id="hchat-status"></div>
        <div class="hchat__mitte">
          <div class="hchat__nachrichten" id="hchat-nachrichten"><div id="hchat-verlauf" aria-live="polite"></div><div id="hchat-entwurf" aria-live="off"></div></div>
          <aside class="hchat__kunde" id="hchat-kunde" aria-label="Kunde"></aside>
        </div>
        <div class="hchat__blatt" id="hchat-blatt"></div>
        <form class="hchat__eingabe" id="hchat-eingabe" onsubmit="return false">
          <button type="button" class="hchat-werkzeug" data-werkzeug="foto" aria-label="Foto senden"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="15" rx="3"/><circle cx="12" cy="12.5" r="3.5"/></svg></button>
          <button type="button" class="hchat-werkzeug" data-werkzeug="produkte" aria-label="Produkte senden"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 7h12l-1 13H7L6 7Z"/><path d="M9 7a3 3 0 0 1 6 0"/></svg></button>
          <button type="button" class="hchat-werkzeug" data-werkzeug="formular" aria-label="Formular senden"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 8h6M9 12h6M9 16h4"/></svg></button>
          <input type="file" id="hchat-foto" accept="image/*" hidden>
          <textarea id="hchat-feld" rows="1" maxlength="2000" placeholder="Nachricht …" aria-label="Nachricht"></textarea>
          <button type="button" class="hchat-senden" id="hchat-senden" aria-label="Senden" disabled><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h13M13 6l6 6-6 6"/></svg></button>
        </form>
      </section>`;
    document.body.appendChild(el);
    this.el = el;
    this.feld = el.querySelector("#hchat-feld");
    this.sendenKnopf = el.querySelector("#hchat-senden");
    this.nachrichtenEl = el.querySelector("#hchat-nachrichten");
    this.verlaufEl = el.querySelector("#hchat-verlauf");
    this.entwurfEl = el.querySelector("#hchat-entwurf");
    this.blatt = el.querySelector("#hchat-blatt");

    el.addEventListener("click", (ereignis) => this.#klick(ereignis));
    el.addEventListener("change", (ereignis) => this.#aenderung(ereignis));
    el.addEventListener("input", (ereignis) => { if (ereignis.target?.id === "hchat-summe") this.produktSumme = ereignis.target.value; });
    this.feld.addEventListener("input", () => this.#tippen());
    this.feld.addEventListener("keydown", (ereignis) => {
      if (ereignis.key === "Enter" && !ereignis.shiftKey && !ereignis.isComposing && window.matchMedia?.("(hover: hover) and (pointer: fine)")?.matches) {
        ereignis.preventDefault();
        this.#textSenden();
      }
    });
    this.sendenKnopf.addEventListener("pointerdown", (ereignis) => ereignis.preventDefault());
    this.sendenKnopf.addEventListener("click", () => this.#textSenden());
    el.querySelector("#hchat-foto").addEventListener("change", (ereignis) => this.#fotoGewaehlt(ereignis.target));
    window.addEventListener("popstate", () => { if (this.sichtbar && !history.state?.hchat) this.schliessen(true); });
  }

  #hinweis(text) {
    const p = this.el?.querySelector("#hchat-hinweis");
    if (!p) return;
    p.textContent = text || "";
    p.hidden = !text;
  }

  #schalterText() {
    const t = this.el?.querySelector("#hchat-aktiv-text");
    if (t) t.textContent = this.konfig.aktiv ? "An" : "Aus · WhatsApp";
  }

  // ── Oeffnen / Schliessen ───────────────────────────────────────────
  oeffnen(zugang = "") {
    if (!this.sichtbar) {
      this.sichtbar = true;
      this.el.hidden = false;
      document.documentElement.dataset.hchat = "offen";
      try { history.pushState({ ...(history.state || {}), hchat: true }, ""); } catch { /* egal */ }
      this.#hoeheFolgen();
    }
    this.#liste();
    if (zugangGueltig(zugang)) this.#unterhaltung(zugang);
    else if (!this.offen) this.el.dataset.ansicht = "liste";
  }

  schliessen(vonZurueck = false) {
    if (!this.sichtbar) return;
    this.sichtbar = false;
    this.el.hidden = true;
    delete document.documentElement.dataset.hchat;
    this.#hoeheLoesen();
    this.feld.blur();
    if (!vonZurueck && history.state?.hchat) { try { history.back(); } catch { /* egal */ } }
  }

  #hoeheFolgen() {
    const vv = window.visualViewport;
    const setzen = () => {
      this.el.style.setProperty("--hchat-h", `${Math.round(vv ? vv.height : window.innerHeight)}px`);
      this.el.style.setProperty("--hchat-oben", `${Math.round(vv ? vv.offsetTop : 0)}px`);
    };
    this.hoeheSetzen = setzen;
    setzen();
    vv?.addEventListener("resize", setzen);
    vv?.addEventListener("scroll", setzen);
  }

  #hoeheLoesen() {
    const vv = window.visualViewport;
    if (!this.hoeheSetzen) return;
    vv?.removeEventListener("resize", this.hoeheSetzen);
    vv?.removeEventListener("scroll", this.hoeheSetzen);
    this.hoeheSetzen = null;
  }

  // ── Liste ─────────────────────────────────────────────────────────
  #sitzungVon(id) {
    if (!id) return null;
    return this.sitzungen.get(id) || this.sitzungAusHeart(id) || null;
  }

  #liste() {
    const chats = [...this.chats.values()];
    const { html, ungelesen } = renderListe({ chats, chip: this.chip, offen: this.offen, sitzungVon: (id) => this.#sitzungVon(id) });
    const ziel = this.el.querySelector("#hchat-listeninhalt");
    if (ziel && this.sichtbar) ziel.innerHTML = html;
    this.meldeZahl(ungelesen);
  }

  // ── Eine Unterhaltung ─────────────────────────────────────────────
  async #unterhaltung(zugang) {
    if (this.offen !== zugang) {
      this.abNachrichten?.();
      this.offen = zugang;
      this.nachrichten = new Map();
      this.ausstehend = new Map();
      this.feld.value = "";
      this.#tippen(true);
      this.blatt.innerHTML = "";
      this.el.classList.remove("hchat--info");
      this.verlaufEl.innerHTML = '<p class="hchat-leer">Lädt …</p>';
      this.entwurfEl.innerHTML = "";
      this.abNachrichten = onSnapshot(
        query(collection(db, "lifeskin", TENANT, "chats", zugang, "nachrichten"), orderBy("at"), limitToLast(400)),
        (snap) => {
          for (const a of snap.docChanges()) {
            if (a.type === "removed") { this.nachrichten.delete(a.doc.id); continue; }
            this.nachrichten.set(a.doc.id, { id: a.doc.id, ...a.doc.data({ serverTimestamps: "estimate" }) });
            this.ausstehend.delete(a.doc.id);
          }
          this.#nachrichtenZeichnen(true);
          this.#gelesen();
        },
        (fehler) => { this.verlaufEl.innerHTML = `<p class="hchat-leer">Nicht geladen: ${esc(fehler?.code || "")}</p>`; }
      );
      this.#sitzungHolen(zugang);
    }
    this.el.dataset.ansicht = "unterhaltung";
    this.#kopf();
    this.#liste();
    if (window.matchMedia?.("(hover: hover) and (pointer: fine)")?.matches) this.feld.focus();
  }

  async #sitzungHolen(zugang) {
    const chat = this.chats.get(zugang) || (await getDoc(CHAT(zugang)).then((s) => (s.exists() ? { id: zugang, ...s.data() } : null)).catch(() => null));
    if (chat && !this.chats.has(zugang)) this.chats.set(zugang, chat);
    const id = chat?.sessionId;
    if (id && !this.sitzungen.has(id)) {
      try {
        const s = await getDoc(doc(db, "lifeskin", TENANT, "sessions", id));
        if (s.exists()) this.sitzungen.set(id, normalisiere(id, s.data()));
      } catch { /* ohne Kundendaten */ }
    }
    if (this.offen === zugang) { this.#kunde(); this.#kopf(); this.#bestelltAbgleichen(); }
  }

  // Hat der Kunde nach dem Chat bestellt, steht der Chat auf "Bestellt".
  #bestelltAbgleichen() {
    const chat = this.chats.get(this.offen);
    if (!chat || chat.status === "bestellt") return;
    if (chatStatus(chat, this.#sitzungVon(chat.sessionId)) === "bestellt") {
      updateDoc(CHAT(this.offen), { status: "bestellt" }).catch(() => {});
    }
  }

  #kopf() {
    const chat = this.chats.get(this.offen);
    if (!chat) return;
    const s = this.#sitzungVon(chat.sessionId);
    const antwortName = [...this.nachrichten.values()].find((n) => n.art === "antwort" && n.antwort?.werte?.emri)?.antwort.werte.emri || "";
    this.el.querySelector("#hchat-name").textContent = chatName(chat, s, antwortName);
    const herkunft = s ? herkunftArt(s) : null;
    const aktiv = Date.now() - zeitMs(chat.kundeAktivAt) < 120000;
    this.el.querySelector("#hchat-sub").textContent = [aktiv ? "● gerade da" : "", chat.code, herkunft?.label, chat.geraet?.os].filter(Boolean).join(" · ");
    const status = chatStatus(chat, s);
    this.el.querySelector("#hchat-status").innerHTML = ["offen", "erledigt", "bestellt"].map((st) =>
      `<button type="button" class="hchat-status" data-status="${st}" aria-pressed="${status === st}">${{ offen: "Offen", erledigt: "Erledigt", bestellt: "Bestellt" }[st]}</button>`).join("");
  }

  #kunde() {
    const chat = this.chats.get(this.offen);
    const s = this.#sitzungVon(chat?.sessionId);
    this.el.querySelector("#hchat-kunde").innerHTML = renderKunde({
      chat, sitzung: s, herkunft: s ? herkunftArt(s) : null, kasse: s ? kasseInfo(s) : null,
      pfad: s ? pfadLesen(s) : [], pfadSatz: this.pfadSatz
    });
  }

  #alle() {
    const liste = new Map(this.nachrichten);
    for (const [id, e] of this.ausstehend) if (!liste.has(id)) liste.set(id, { ...e.n, at: Date.now(), _stand: e.stand });
    return sortiereNachrichten([...liste.values()]);
  }

  #nachrichtenZeichnen(nachUnten = false) {
    const el = this.nachrichtenEl;
    const warUnten = el.scrollHeight - el.scrollTop - el.clientHeight < 120;
    this.verlaufEl.innerHTML = renderNachrichten({ nachrichten: this.#alle(), chat: this.chats.get(this.offen), produktName, mitEntwurf: false });
    this.entwurfEl.innerHTML = renderEntwurf(this.chats.get(this.offen));
    if (nachUnten || warUnten) requestAnimationFrame(() => { el.scrollTop = el.scrollHeight; });
  }

  // Nur die Entwurfsblase neu, wenn der Kunde tippt - nicht der Verlauf.
  #entwurfAuffrischen() {
    if (!this.offen || !this.sichtbar) return;
    const el = this.nachrichtenEl;
    const warUnten = el.scrollHeight - el.scrollTop - el.clientHeight < 120;
    const html = renderEntwurf(this.chats.get(this.offen));
    if (this.entwurfEl.innerHTML !== html) this.entwurfEl.innerHTML = html;
    if (warUnten) el.scrollTop = el.scrollHeight;
  }

  async #gelesen() {
    if (!this.offen || !this.sichtbar || document.visibilityState !== "visible") return;
    const chat = this.chats.get(this.offen);
    if (!chat || !chatUngelesen(chat)) return;
    try { await updateDoc(CHAT(this.offen), { teamGelesenAt: serverTimestamp() }); } catch { /* egal */ }
  }

  // ── Tippen ────────────────────────────────────────────────────────
  #tippen(leeren = false) {
    this.feld.style.height = "auto";
    this.feld.style.height = `${Math.min(this.feld.scrollHeight, 140)}px`;
    this.sendenKnopf.disabled = !this.feld.value.trim();
    if (leeren || !this.offen || !this.feld.value.trim()) return;
    if (Date.now() - this.letzterTipp < TIPPT_MS) return;
    this.letzterTipp = Date.now();
    updateDoc(CHAT(this.offen), { teamTipptAt: new Date().toISOString() }).catch(() => {});
  }

  // ── Senden ────────────────────────────────────────────────────────
  #textSenden() {
    const n = teamText(this.feld.value, this.autor);
    if (!n) return;
    this.feld.value = "";
    this.#tippen(true);
    this.senden(n);
  }

  async senden(nachricht, id = nachrichtKennung()) {
    const zugang = this.offen;
    if (!zugang) return;
    this.ausstehend.set(id, { n: { id, ...nachricht }, stand: "sendet" });
    this.#nachrichtenZeichnen(true);
    try {
      const stapel = writeBatch(db);
      stapel.set(doc(db, "lifeskin", TENANT, "chats", zugang, "nachrichten", id), { ...nachricht, at: serverTimestamp() });
      stapel.update(CHAT(zugang), {
        letzte: { ...vorschauVon(nachricht), at: serverTimestamp() },
        teamTipptAt: "", teamGelesenAt: serverTimestamp(), updatedAt: nachricht.t
      });
      await stapel.commit();
      this.letzterTipp = 0;
    } catch (fehler) {
      this.ausstehend.set(id, { n: { id, ...nachricht }, stand: "fehler" });
      this.#nachrichtenZeichnen(true);
      this.#hinweis(`Nicht gesendet: ${fehler?.code || fehler?.message || ""}`);
    }
  }

  async #fotoGewaehlt(eingabe) {
    const datei = eingabe.files?.[0];
    eingabe.value = "";
    if (!datei || !this.offen) return;
    try {
      const daten = await bildVerkleinern(datei);
      const n = daten ? teamBild(daten, this.feld.value, this.autor) : null;
      if (!n) throw new Error("Foto zu gross");
      if (this.feld.value) { this.feld.value = ""; this.#tippen(true); }
      this.senden(n);
    } catch (fehler) {
      this.#hinweis(`Foto nicht gesendet: ${fehler?.message || ""}`);
    }
  }

  // ── Klicks ────────────────────────────────────────────────────────
  #klick(ereignis) {
    const z = ereignis.target;
    if (z.closest?.("[data-zu]")) { this.schliessen(); return; }
    if (z.closest?.("[data-zurueck]")) {
      this.el.dataset.ansicht = "liste";
      this.abNachrichten?.(); this.abNachrichten = null; this.offen = "";
      this.#liste();
      return;
    }
    const chip = z.closest?.("[data-chip]");
    if (chip) { this.chip = chip.dataset.chip; this.#liste(); return; }
    const zeile = z.closest?.("[data-chat]");
    if (zeile) { this.#unterhaltung(zeile.dataset.chat); return; }
    if (z.closest?.("[data-info]")) { this.el.classList.toggle("hchat--info"); return; }
    const status = z.closest?.("[data-status]");
    if (status && this.offen) { updateDoc(CHAT(this.offen), { status: status.dataset.status }).catch((f) => this.#hinweis(String(f?.code || ""))); return; }
    const fall = z.closest?.("[data-fall]");
    if (fall) { this.schliessen(); this.oeffneFall(fall.dataset.fall); return; }
    const nochmal = z.closest?.("[data-nochmal]");
    if (nochmal) { const e = this.ausstehend.get(nochmal.dataset.nochmal); if (e) { const { id, ...rest } = e.n; this.senden(rest, id); } return; }
    const bild = z.closest?.("[data-bild]");
    if (bild) { window.open(bild.getAttribute("src"), "_blank", "noopener"); return; }
    const werkzeug = z.closest?.("[data-werkzeug]")?.dataset.werkzeug;
    if (werkzeug === "foto") { this.el.querySelector("#hchat-foto").click(); return; }
    if (werkzeug === "produkte") {
      this.produktWahl = ["lf-acne", "lf-moistur"];
      this.produktSumme = String(preisVorschlag(this.produktWahl, this.setet));
      this.#blattProdukte();
      return;
    }
    if (werkzeug === "formular") { this.blatt.innerHTML = renderFormularWahl({}); return; }
    if (z.closest?.("[data-blatt-zu]")) { this.blatt.innerHTML = ""; return; }
    if (z.closest?.("[data-senden-produkte]")) {
      const text = this.el.querySelector("#hchat-produkt-text")?.value || "";
      const produkte = this.produktWahl.map((id) => CHAT_PRODUKTE.find((p) => p.id === id)).filter(Boolean);
      const n = teamProdukte(produkte, Number(this.produktSumme), { text, autor: this.autor });
      if (n) { this.senden(n); this.blatt.innerHTML = ""; }
      return;
    }
    if (z.closest?.("[data-senden-formular]")) {
      const felder = [...this.blatt.querySelectorAll("[data-feld]:checked")].map((f) => f.dataset.feld);
      const titel = this.el.querySelector("#hchat-formular-titel")?.value || "";
      const n = teamFormular(felder, { titel, autor: this.autor });
      if (n) { this.senden(n); this.blatt.innerHTML = ""; }
    }
  }

  #blattProdukte() {
    this.blatt.innerHTML = renderProduktWahl({ produkte: CHAT_PRODUKTE, gewaehlt: this.produktWahl, summe: this.produktSumme });
  }

  #aenderung(ereignis) {
    const z = ereignis.target;
    if (z.id === "hchat-aktiv") {
      const aktiv = z.checked;
      setDoc(KONFIG(), { aktiv, aktivGeaendertAt: new Date().toISOString() }, { merge: true })
        .catch((f) => { z.checked = !aktiv; this.#hinweis(`Schalter: ${f?.code || ""}`); });
      return;
    }
    if (z.dataset?.produkt) {
      const id = z.dataset.produkt;
      this.produktWahl = z.checked ? [...new Set([...this.produktWahl, id])].slice(0, CHAT_PRODUKTE_MAX) : this.produktWahl.filter((x) => x !== id);
      this.produktSumme = String(preisVorschlag(this.produktWahl, this.setet));
      this.#blattProdukte();
    }
  }
}
