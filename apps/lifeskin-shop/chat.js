/* DER CHAT AUF /lifeskinshop (docs/lifeskin-chat.md, Auftrag 07.10.).
 * ══════════════════════════════════════════════════════════════════════
 *
 * Knopf rechts unten -> Vollbild-Chat wie Messenger. Kein Konto: Der Chat
 * haengt an einem Zugang (32 Hex) im localStorage dieses Geraets.
 *
 * SCHNELL:
 *   - Der Knopf und das Geruest stehen sofort; das Firebase-SDK (app +
 *     firestore) kommt erst beim ersten Antippen - oder im Leerlauf, wenn es
 *     schon einen Chat gibt (fuer die Zahl ungelesener Antworten).
 *   - Gesendet wird optimistisch: Die Blase steht sofort da ("Duke u
 *     dërguar"), bestaetigt wird, sobald Firestore sie hat.
 *   - Echtzeit ueber onSnapshot - Antworten, "schreibt ...", "Parë".
 *
 * IPHONE: Die Hoehe folgt visualViewport (sichtbarer Bereich ueber der
 * Tastatur). Ein festes Fenster mit 100vh schob auf iOS die Seite (siehe
 * shared/lifeskin-ansicht.js, 28.09.) - hier sitzt das Fenster genau im
 * sichtbaren Ausschnitt, und das Eingabefeld bleibt ueber der Tastatur.
 *
 * WAS HEART SIEHT: Nachrichten, Fotos, Formular-Antworten - und den
 * Entwurf, waehrend getippt wird (Datenschutzerklaerung, Abschnitt Chat).
 *
 * Meta-Pixel: Der Chat meldet nichts an Meta. "Porosite" fuehrt in die
 * bestehende Kasse (Dyqan.chatBestellen) - dort gilt, was immer gilt. */
import {
  CHAT_ZUGANG_SCHLUESSEL, zugangGueltig, neuerZugang, nachrichtKennung, chatPfad, chatAnlegen,
  vorschauVon, kundenText, kundenBild, kundenAntwort, sortiereNachrichten, ungelesen, tipptGerade,
  formularFeld, zeitMs, nachrichtMs
} from "../../shared/lifeskin-chat.js";
import { FIREBASE_WEB_KONFIG, FIREBASE_SDK_BASIS } from "../../shared/lifeskin-firebase-web.js";
import { bildVerkleinern } from "../../shared/lifeskin-chat-bild.js";
import { LIFESKIN_FIRESTORE_BASE, LIFESKIN_TENANT, LIFESKIN_WHATSAPP } from "../lifeskin/lifeskin-config.js";

const KONFIG_URL = `${LIFESKIN_FIRESTORE_BASE}/lifeskin/${LIFESKIN_TENANT}/config/chat`;
const AVATAR = "/apps/lifeskin/dr-gashi.jpg";
const ENTWURF_MS = 350;
const ONLINE_MS = 3 * 60 * 1000;
const CACHE_SCHLUESSEL = "lifeskin:chatCache";

const $ = (w, i = document) => i.querySelector(w);
export function esc(w) {
  return String(w ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
// Text mit Zeilen und anklickbaren Links - nichts anderes wird zu HTML.
export function textHtml(text) {
  return esc(text).replace(/(https?:\/\/[^\s<]+[^\s<.,;:!?)'"])/g,
    (url) => `<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`).replace(/\n/g, "<br>");
}
const SVG = {
  chat: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 11.5a8.4 8.4 0 0 1-9 8.4 9.3 9.3 0 0 1-3.6-.7L3 21l1.6-4.6A8 8 0 0 1 3 11.5 8.4 8.4 0 0 1 12 3a8.4 8.4 0 0 1 9 8.5Z"/></svg>',
  zurueck: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 18l-6-6 6-6"/></svg>',
  senden: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h13M13 6l6 6-6 6"/></svg>',
  foto: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="15" rx="3"/><circle cx="12" cy="12.5" r="3.5"/><path d="M8.5 5l1.5-2h4l1.5 2"/></svg>',
  runter: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>',
  wa: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 12a8 8 0 0 1-11.8 7L4 20l1.1-4A8 8 0 1 1 20 12Z"/><path d="M9 9.5c0 3 2.5 5.5 5.5 5.5l1-1.4-1.8-.9-.8.8c-.9-.4-1.9-1.4-2.3-2.3l.8-.8-.9-1.8L9 9.5Z"/></svg>'
};

// ── Konfiguration aus Heart (config/chat, oeffentlich lesbar) ──────────
export function konfigAus(dok) {
  const f = dok?.fields || {};
  const s = (k) => f[k]?.stringValue || "";
  return {
    aktiv: f.aktiv?.booleanValue === true,
    begruessung: s("begruessung") || "Përshëndetje! 👋 Si mund t’ju ndihmojmë? Na shkruani pyetjen tuaj – ju përgjigjemi këtu.",
    antwortzeit: s("antwortzeit") || "Zakonisht përgjigjemi brenda pak minutash",
    teamAktivAt: s("teamAktivAt"),
    teamName: s("teamName") || "Dr. Gashi & ekipi LifeSkin"
  };
}

export async function konfigLaden(holen = (...a) => fetch(...a)) {
  try {
    const antwort = await holen(KONFIG_URL, { cache: "no-store" });
    if (!antwort.ok) return konfigAus(null);
    return konfigAus(await antwort.json());
  } catch {
    return konfigAus(null);
  }
}

// ── Zeit in Worten ───────────────────────────────────────────────────
const MUAJT = ["jan", "shk", "mar", "pri", "maj", "qer", "kor", "gus", "sht", "tet", "nën", "dhj"];
export function tagWort(iso, heute = new Date()) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const tag = (x) => `${x.getFullYear()}-${x.getMonth()}-${x.getDate()}`;
  const gestern = new Date(heute); gestern.setDate(heute.getDate() - 1);
  if (tag(d) === tag(heute)) return "Sot";
  if (tag(d) === tag(gestern)) return "Dje";
  return `${d.getDate()} ${MUAJT[d.getMonth()]}`;
}
const uhr = (iso) => {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "" : `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
};

const SCHNELL = ["A është Acne Duo për lëkurën time?", "Si përdoret?", "Dua të porosis"];

export class Chat {
  constructor({ dokument = document, fenster = window, speicher, laden } = {}) {
    this.dok = dokument;
    this.fenster = fenster;
    this.speicher = speicher !== undefined ? speicher : (() => { try { return fenster.localStorage; } catch { return null; } })();
    this.ladenFn = laden || (() => globalThis.__lifeskinShop);
    this.konfig = konfigAus(null);
    this.konfigDa = false;
    this.zugang = this.#zugangLesen();
    this.chat = null;          // Dokument des Chats (aus onSnapshot)
    this.chatDa = false;       // existiert er in Firestore?
    this.nachrichten = new Map();
    this.ausstehend = new Map(); // id -> { n, stand: "sendet" | "fehler" }
    this.offen = false;
    this.fs = null;
    this.db = null;
    this.sdk = null;
    this.abos = [];
    this.entwurfTimer = null;
    this.letzterEntwurf = "";
    this.unten = true;
    this.tippTimer = null;
    this.anlegen = null;
  }

  // ── Start: Knopf, Konfiguration, ggf. leise mithoeren ──────────────
  starte() {
    this.#geruest();
    this.#cacheLesen();
    konfigLaden().then((k) => {
      this.konfig = k;
      this.konfigDa = true;
      this.#knopfStand();
      this.#kopfStand();
    });
    // Gibt es schon einen Chat, im Leerlauf verbinden - fuer die Zahl der
    // ungelesenen Antworten am Knopf.
    if (this.zugang) {
      const leerlauf = this.fenster.requestIdleCallback || ((f) => setTimeout(f, 2500));
      leerlauf(() => this.#verbinden().catch(() => {}), { timeout: 4000 });
    }
    this.fenster.addEventListener("popstate", () => { if (this.offen && !this.fenster.history.state?.lsChat) this.schliessen(true); });
    globalThis.__lifeskinChat = this;
    return this;
  }

  #zugangLesen() {
    try {
      const z = JSON.parse(this.speicher?.getItem(CHAT_ZUGANG_SCHLUESSEL) || "null")?.zugang;
      return zugangGueltig(z) ? z : "";
    } catch { return ""; }
  }

  #zugangMerken() {
    try { this.speicher?.setItem(CHAT_ZUGANG_SCHLUESSEL, JSON.stringify({ zugang: this.zugang })); } catch { /* nur fuer diesen Besuch */ }
  }

  // Letzte Nachrichten fuer das sofortige erste Bild beim naechsten Oeffnen.
  #cacheLesen() {
    if (!this.zugang) return;
    try {
      const roh = JSON.parse(this.fenster.sessionStorage?.getItem(CACHE_SCHLUESSEL) || "null");
      if (roh?.zugang !== this.zugang) return;
      for (const n of roh.nachrichten || []) if (n?.id) this.nachrichten.set(n.id, n);
    } catch { /* egal */ }
  }

  #cacheSchreiben() {
    try {
      const liste = sortiereNachrichten([...this.nachrichten.values()]).slice(-40)
        .map((n) => ({ ...n, at: nachrichtMs(n), ...(n.bild ? { bild: "" } : {}) }));
      this.fenster.sessionStorage?.setItem(CACHE_SCHLUESSEL, JSON.stringify({ zugang: this.zugang, nachrichten: liste }));
    } catch { /* egal */ }
  }

  // ── Das Geruest im HTML (index.html) ───────────────────────────────
  #geruest() {
    this.knopf = $("#chat-knopf", this.dok);
    this.ansicht = $("#chat", this.dok);
    if (!this.knopf || !this.ansicht) return;
    this.liste = $("#chat-liste", this.ansicht);
    this.feld = $("#chat-feld", this.ansicht);
    this.sendenKnopf = $("#chat-senden", this.ansicht);
    this.fotoEingabe = $("#chat-foto", this.ansicht);
    this.status = $("#chat-status", this.ansicht);
    this.runter = $("#chat-runter", this.ansicht);
    this.hinweis = $("#chat-hinweis", this.ansicht);

    this.knopf.addEventListener("click", () => this.#knopfTipp());
    // Erst beim Fingeraufsetzen schon laden - dann steht das SDK fast
    // immer, bevor der Chat aufgeht.
    this.knopf.addEventListener("pointerdown", () => { if (this.konfig.aktiv || this.zugang) this.#sdk().catch(() => {}); }, { passive: true });
    $("#chat-zurueck", this.ansicht)?.addEventListener("click", () => this.schliessen());
    this.feld.addEventListener("input", () => this.#eingabe());
    this.feld.addEventListener("keydown", (ereignis) => {
      // Am Rechner sendet Enter, Shift+Enter macht eine Zeile. Auf dem
      // Telefon ist Enter eine neue Zeile (Senden ist der Knopf).
      if (ereignis.key === "Enter" && !ereignis.shiftKey && !ereignis.isComposing && this.fenster.matchMedia?.("(hover: hover) and (pointer: fine)")?.matches) {
        ereignis.preventDefault();
        this.#textSenden();
      }
    });
    // Die Tastatur bleibt nach dem Senden offen: Der Knopf nimmt dem Feld
    // den Fokus nicht.
    this.sendenKnopf.addEventListener("pointerdown", (ereignis) => ereignis.preventDefault());
    this.sendenKnopf.addEventListener("click", () => this.#textSenden());
    $("#chat-foto-knopf", this.ansicht)?.addEventListener("click", () => this.fotoEingabe.click());
    this.fotoEingabe.addEventListener("change", () => this.#fotoGewaehlt());
    this.liste.addEventListener("scroll", () => this.#scrollStand(), { passive: true });
    this.runter?.addEventListener("click", () => this.#nachUnten(true));
    this.liste.addEventListener("click", (ereignis) => this.#listeTipp(ereignis));
    this.liste.addEventListener("submit", (ereignis) => { ereignis.preventDefault(); this.#formularSenden(ereignis.target); });
    this.#knopfStand();
  }

  #knopfStand() {
    if (!this.knopf) return;
    const wa = !this.konfig.aktiv && !this.zugang;
    this.knopf.dataset.art = wa ? "wa" : "chat";
    this.knopf.setAttribute("aria-label", wa ? "Na shkruani në WhatsApp" : "Hapni chat-in me LifeSkin");
    $(".chat-knopf__ikone", this.knopf).innerHTML = wa ? SVG.wa : SVG.chat;
    this.knopf.hidden = !this.konfigDa && !this.zugang;
  }

  #knopfTipp() {
    if (!this.konfig.aktiv && !this.zugang) {
      this.#pfad("Chat aus → WhatsApp");
      const text = encodeURIComponent("Përshëndetje, kam një pyetje për Acne Duo.");
      this.fenster.open(`https://wa.me/${LIFESKIN_WHATSAPP}?text=${text}`, "_blank", "noopener");
      return;
    }
    this.oeffnen();
  }

  #pfad(text) {
    try { globalThis.__lifeskinTrichter?.klickpfad?.melde?.("chat", text); } catch { /* egal */ }
  }

  // ── Oeffnen / Schliessen ───────────────────────────────────────────
  oeffnen() {
    if (this.offen || !this.ansicht) return;
    this.offen = true;
    this.#pfad("Chat geöffnet");
    this.scrollY = this.fenster.scrollY;
    this.dok.documentElement.dataset.chat = "offen";
    this.ansicht.hidden = false;
    this.knopf.hidden = true;
    try { this.fenster.history.pushState({ ...(this.fenster.history.state || {}), lsChat: true }, ""); } catch { /* egal */ }
    this.#hoeheFolgen();
    this.#kopfStand();
    this.#zeichnen();
    this.#nachUnten(false);
    // Am Rechner gleich ins Feld; auf dem Telefon nicht - sonst springt die
    // Tastatur auf, bevor man die Antworten gelesen hat.
    if (this.fenster.matchMedia?.("(hover: hover) and (pointer: fine)")?.matches) this.feld.focus();
    this.#verbinden().then(() => this.#gelesen()).catch(() => this.#hinweisZeigen("Lidhja dështoi. Provoni përsëri."));
  }

  schliessen(vonZurueck = false) {
    if (!this.offen) return;
    this.offen = false;
    this.#entwurfJetzt();
    this.feld.blur();
    this.ansicht.hidden = true;
    delete this.dok.documentElement.dataset.chat;
    this.#hoeheLoesen();
    this.knopf.hidden = false;
    this.#knopfStand();
    this.#badge();
    try { this.fenster.scrollTo({ top: this.scrollY || 0, behavior: "instant" }); } catch { this.fenster.scrollTo(0, this.scrollY || 0); }
    if (!vonZurueck && this.fenster.history.state?.lsChat) {
      try { this.fenster.history.back(); } catch { /* egal */ }
    }
  }

  // Die Hoehe des Fensters = der sichtbare Bereich (ueber der Tastatur).
  #hoeheFolgen() {
    const vv = this.fenster.visualViewport;
    const setzen = () => {
      const h = vv ? vv.height : this.fenster.innerHeight;
      const oben = vv ? vv.offsetTop : 0;
      this.ansicht.style.setProperty("--chat-h", `${Math.round(h)}px`);
      this.ansicht.style.setProperty("--chat-oben", `${Math.round(oben)}px`);
      if (this.unten) this.#nachUnten(false);
    };
    this.hoeheSetzen = setzen;
    setzen();
    vv?.addEventListener("resize", setzen);
    vv?.addEventListener("scroll", setzen);
    this.fenster.addEventListener("resize", setzen);
  }

  #hoeheLoesen() {
    const vv = this.fenster.visualViewport;
    if (!this.hoeheSetzen) return;
    vv?.removeEventListener("resize", this.hoeheSetzen);
    vv?.removeEventListener("scroll", this.hoeheSetzen);
    this.fenster.removeEventListener("resize", this.hoeheSetzen);
    this.hoeheSetzen = null;
  }

  #kopfStand() {
    if (!this.status) return;
    const letzteTeam = [...this.nachrichten.values()].filter((n) => n.von === "team").reduce((m, n) => Math.max(m, nachrichtMs(n)), 0);
    const tippt = tipptGerade(this.chat?.teamTipptAt, Date.now(), 6000, letzteTeam);
    const online = (Date.now() - Date.parse(this.konfig.teamAktivAt || "")) < ONLINE_MS;
    this.status.textContent = tippt ? "duke shkruar…" : online ? "Online tani" : this.konfig.antwortzeit;
    this.status.dataset.stand = tippt ? "tippt" : online ? "online" : "";
    $("#chat-name", this.ansicht).textContent = this.konfig.teamName;
    clearTimeout(this.tippTimer);
    if (tippt) this.tippTimer = setTimeout(() => this.#kopfStand(), 2500);
  }

  #hinweisZeigen(text) {
    if (!this.hinweis) return;
    this.hinweis.textContent = text;
    this.hinweis.hidden = !text;
  }

  // ── Firebase: erst wenn noetig ─────────────────────────────────────
  #sdk() {
    if (!this.sdk) {
      this.sdk = Promise.all([
        import(`${FIREBASE_SDK_BASIS}/firebase-app.js`),
        import(`${FIREBASE_SDK_BASIS}/firebase-firestore.js`)
      ]).then(([app, fs]) => {
        const name = "lifeskin-chat";
        const vorhanden = app.getApps().find((a) => a.name === name);
        // Lokal gegen den Emulator: dasselbe Projekt wie Heart im Emulator.
        const emuProjekt = this.#emulator() ? String(globalThis.__LIFESKIN_CHAT_EMULATOR_PROJEKT__ || "mnyra-local") : "";
        const firebaseApp = vorhanden || app.initializeApp(emuProjekt ? { ...FIREBASE_WEB_KONFIG, projectId: emuProjekt } : FIREBASE_WEB_KONFIG, name);
        this.fs = fs;
        // Long-Polling erkennen: In den Fenstern von Instagram/Facebook und
        // hinter manchen Netzen klappt der Stream sonst nicht.
        this.db = vorhanden ? fs.getFirestore(firebaseApp) : fs.initializeFirestore(firebaseApp, {
          localCache: fs.memoryLocalCache(), experimentalAutoDetectLongPolling: true
        });
        // Nur lokal (Tests, Pruefstand): gegen den Emulator statt Firestore.
        const emu = this.#emulator();
        if (!vorhanden && emu) {
          const [host, port] = emu.split(":");
          fs.connectFirestoreEmulator(this.db, host, Number(port) || 8080);
        }
        return this.db;
      }).catch((fehler) => { this.sdk = null; throw fehler; });
    }
    return this.sdk;
  }

  // Nur lokal (Tests): "127.0.0.1:8080" aus globalThis.__LIFESKIN_CHAT_EMULATOR__.
  #emulator() {
    const emu = String(globalThis.__LIFESKIN_CHAT_EMULATOR__ || "");
    return emu && /^(localhost|127\.0\.0\.1)$/.test(this.fenster.location?.hostname || "") ? emu : "";
  }

  #ref(...teile) {
    return this.fs.doc(this.db, ...chatPfad(this.zugang), ...teile);
  }

  async #verbinden() {
    if (!this.zugang) return;
    await this.#sdk();
    if (this.abos.length) return;
    const { onSnapshot, collection, query, orderBy, limitToLast } = this.fs;
    this.abos.push(onSnapshot(this.#ref(), (snap) => {
      this.chatDa = snap.exists();
      this.chat = snap.exists() ? snap.data({ serverTimestamps: "estimate" }) : null;
      this.#kopfStand();
      this.#statusZeilen();
    }, () => {}));
    const q = query(collection(this.db, ...chatPfad(this.zugang), "nachrichten"), orderBy("at"), limitToLast(300));
    this.abos.push(onSnapshot(q, (snap) => {
      let neuVomTeam = false;
      for (const aenderung of snap.docChanges()) {
        const n = { id: aenderung.doc.id, ...aenderung.doc.data({ serverTimestamps: "estimate" }) };
        if (aenderung.type === "removed") { this.nachrichten.delete(n.id); continue; }
        if (!this.nachrichten.has(n.id) && n.von === "team") neuVomTeam = true;
        this.nachrichten.set(n.id, n);
        this.ausstehend.delete(n.id);
      }
      this.#zeichnen();
      this.#kopfStand();
      this.#cacheSchreiben();
      if (this.offen) {
        if (neuVomTeam) this.#gelesen();
        if (this.unten) this.#nachUnten(true);
        else if (neuVomTeam && this.runter) this.runter.hidden = false;
      } else {
        this.#badge();
      }
    }, () => this.#hinweisZeigen("Lidhja me chat-in u ndërpre. Provoni përsëri.")));
  }

  // ── Ungelesen: Zahl am Knopf und im Titel ──────────────────────────
  #badge() {
    const zahl = ungelesen([...this.nachrichten.values()], this.chat?.kundeGelesenAt, "team");
    const b = $(".chat-knopf__zahl", this.knopf);
    if (b) { b.textContent = zahl > 9 ? "9+" : String(zahl); b.hidden = !zahl; }
    if (!this.titelBasis) this.titelBasis = this.dok.title;
    this.dok.title = zahl ? `(${zahl}) Mesazh i ri · ${this.titelBasis}` : this.titelBasis;
  }

  async #gelesen() {
    if (!this.chatDa || !this.offen || this.dok.visibilityState === "hidden") return;
    const letzte = sortiereNachrichten([...this.nachrichten.values()]).filter((n) => n.von === "team").pop();
    if (!letzte || nachrichtMs(letzte) <= zeitMs(this.chat?.kundeGelesenAt)) return;
    const jetzt = new Date().toISOString();
    try { await this.fs.updateDoc(this.#ref(), { kundeGelesenAt: this.fs.serverTimestamp(), kundeAktivAt: jetzt, updatedAt: jetzt }); } catch { /* egal */ }
  }

  // ── Anlegen: beim ersten Zeichen, damit Heart schon den Entwurf sieht ──
  async #chatSicher(mit = {}) {
    if (this.chatDa) return;
    if (this.anlegen) { await this.anlegen; return; }
    if (!this.zugang) { this.zugang = neuerZugang(); this.#zugangMerken(); }
    this.anlegen = (async () => {
      await this.#sdk();
      const trichter = globalThis.__lifeskinTrichter;
      const geraet = trichter?.sitzung?.stand?.device || {};
      await this.fs.setDoc(this.#ref(), {
        ...chatAnlegen({ sessionId: trichter?.sitzung?.id || "", code: trichter?.sitzung?.code || "", geraet }),
        ...mit
      });
      this.chatDa = true;
      this.#pfad("Chat angelegt");
      await this.#verbinden();
    })();
    try { await this.anlegen; } finally { this.anlegen = null; }
  }

  // ── Tippen: Entwurf fuer Heart (leise, gebremst) ────────────────────
  #eingabe() {
    this.feld.style.height = "auto";
    this.feld.style.height = `${Math.min(this.feld.scrollHeight, 132)}px`;
    this.sendenKnopf.disabled = !this.feld.value.trim();
    clearTimeout(this.entwurfTimer);
    this.entwurfTimer = setTimeout(() => this.#entwurfJetzt(), ENTWURF_MS);
  }

  async #entwurfJetzt() {
    clearTimeout(this.entwurfTimer);
    const text = this.feld?.value.slice(0, 2000) || "";
    if (text === this.letzterEntwurf) return;
    this.letzterEntwurf = text;
    const jetzt = new Date().toISOString();
    try {
      if (!this.chatDa) {
        if (!text.trim()) return;
        await this.#chatSicher({ entwurf: { text, t: jetzt } });
        return;
      }
      await this.fs.updateDoc(this.#ref(), { entwurf: { text, t: jetzt }, kundeAktivAt: jetzt, updatedAt: jetzt });
    } catch { /* der Entwurf ist kein Muss */ }
  }

  // ── Senden ─────────────────────────────────────────────────────────
  #textSenden() {
    const n = kundenText(this.feld.value);
    if (!n) return;
    this.feld.value = "";
    this.#eingabe();
    this.letzterEntwurf = "";
    clearTimeout(this.entwurfTimer);
    this.senden(n);
  }

  async senden(nachricht, id = nachrichtKennung()) {
    this.ausstehend.set(id, { n: { id, ...nachricht }, stand: "sendet" });
    this.#zeichnen();
    this.#nachUnten(true);
    try {
      await this.#chatSicher();
      const { writeBatch, serverTimestamp } = this.fs;
      const stapel = writeBatch(this.db);
      stapel.set(this.#ref("nachrichten", id), { ...nachricht, at: serverTimestamp() });
      stapel.update(this.#ref(), {
        letzte: { ...vorschauVon(nachricht), at: serverTimestamp() }, entwurf: { text: "", t: nachricht.t },
        kundeAktivAt: nachricht.t, kundeGelesenAt: serverTimestamp(), updatedAt: nachricht.t
      });
      await stapel.commit();
      if (this.ausstehend.get(id)) {
        // Bestaetigt - steht gleich aus onSnapshot da; bis dahin "Dërguar".
        this.ausstehend.set(id, { n: { id, ...nachricht }, stand: "ok" });
        this.#zeichnen();
      }
      this.#pfad(nachricht.art === "bild" ? "Chat: Foto gesendet" : nachricht.art === "antwort" ? "Chat: Formular gesendet" : "Chat: Nachricht gesendet");
      this.#melden(id);
      this.#hinweisZeigen("");
    } catch (fehler) {
      this.ausstehend.set(id, { n: { id, ...nachricht }, stand: "fehler" });
      this.#zeichnen();
      this.#pfad(`Chat: NICHT gesendet (${String(fehler?.code || fehler?.message || "?").slice(0, 40)})`);
    }
  }

  // Heart benachrichtigen (Push). Ohne Antwort zu erwarten.
  #melden(id) {
    try {
      const koerper = JSON.stringify({ zugang: this.zugang, id });
      if (!this.fenster.navigator?.sendBeacon?.("/api/lifeskin-chat", new Blob([koerper], { type: "application/json" }))) {
        fetch("/api/lifeskin-chat", { method: "POST", headers: { "content-type": "application/json" }, body: koerper, keepalive: true }).catch(() => {});
      }
    } catch { /* die Nachricht ist trotzdem da */ }
  }

  async #fotoGewaehlt() {
    const datei = this.fotoEingabe.files?.[0];
    this.fotoEingabe.value = "";
    if (!datei) return;
    this.#hinweisZeigen("Fotoja po përgatitet …");
    try {
      const daten = await bildVerkleinern(datei);
      const n = daten ? kundenBild(daten, this.feld.value) : null;
      if (!n) throw new Error("zu gross");
      if (this.feld.value) { this.feld.value = ""; this.#eingabe(); }
      this.#hinweisZeigen("");
      this.senden(n);
    } catch {
      this.#hinweisZeigen("Fotoja nuk mund të dërgohet. Provoni një foto tjetër.");
    }
  }

  async #formularSenden(forme) {
    if (!forme?.matches?.("[data-formular]")) return;
    const auf = forme.dataset.formular;
    const werte = Object.fromEntries([...forme.querySelectorAll("[name]")].map((f) => [f.name, f.value]));
    const n = kundenAntwort(auf, werte);
    if (!n) return;
    forme.querySelector("button[type=submit]")?.setAttribute("disabled", "");
    this.ladenFn()?.kasseVorbelegen?.(n.antwort.werte);
    this.senden(n);
  }

  #listeTipp(ereignis) {
    const ziel = ereignis.target;
    const nochmal = ziel.closest?.("[data-nochmal]");
    if (nochmal) {
      const eintrag = this.ausstehend.get(nochmal.dataset.nochmal);
      if (eintrag) { const { id, ...rest } = eintrag.n; this.senden(rest, id); }
      return;
    }
    const schnell = ziel.closest?.("[data-schnell]");
    if (schnell) {
      const n = kundenText(schnell.dataset.schnell);
      if (n) this.senden(n);
      return;
    }
    const bestellen = ziel.closest?.("[data-porosite]");
    if (bestellen) {
      const n = this.nachrichten.get(bestellen.dataset.porosite);
      if (!n) return;
      this.#pfad(`Chat: Porosite · ${n.summe} €`);
      const laden = this.ladenFn();
      if (laden?.chatBestellen?.({ nachrichtId: n.id, produkte: n.produkte || [], summe: n.summe })) this.schliessen();
      return;
    }
    const bild = ziel.closest?.("[data-bild]");
    if (bild) this.#bildGross(bild.getAttribute("src"));
  }

  #bildGross(src) {
    if (!src) return;
    const huelle = this.dok.createElement("div");
    huelle.className = "chat-bildgross";
    huelle.setAttribute("role", "dialog");
    huelle.setAttribute("aria-label", "Foto");
    huelle.innerHTML = `<img src="${esc(src)}" alt=""><button type="button" aria-label="Mbyll">×</button>`;
    huelle.addEventListener("click", () => huelle.remove());
    this.ansicht.appendChild(huelle);
  }

  // ── Scrollen ───────────────────────────────────────────────────────
  #scrollStand() {
    const l = this.liste;
    this.unten = l.scrollHeight - l.scrollTop - l.clientHeight < 80;
    if (this.unten && this.runter) this.runter.hidden = true;
  }

  #nachUnten(sanft) {
    const l = this.liste;
    if (!l) return;
    this.fenster.requestAnimationFrame(() => {
      l.scrollTo({ top: l.scrollHeight, behavior: sanft ? "smooth" : "auto" });
      this.unten = true;
      if (this.runter) this.runter.hidden = true;
    });
  }

  // ── Zeichnen ───────────────────────────────────────────────────────
  #alle() {
    const liste = new Map(this.nachrichten);
    for (const [id, eintrag] of this.ausstehend) if (!liste.has(id)) liste.set(id, { ...eintrag.n, at: Date.now(), _stand: eintrag.stand });
    return sortiereNachrichten([...liste.values()]);
  }

  #zeichnen() {
    if (!this.liste) return;
    const alle = this.#alle();
    if (!alle.length) {
      this.liste.innerHTML = `<div class="chat-leer">
        <img src="${AVATAR}" alt="" width="72" height="72">
        <h2>${esc(this.konfig.teamName)}</h2>
        <p>${esc(this.konfig.begruessung)}</p>
        <div class="chat-schnell">${SCHNELL.map((s) => `<button type="button" data-schnell="${esc(s)}">${esc(s)}</button>`).join("")}</div>
      </div>`;
      return;
    }
    const antworten = new Map(alle.filter((n) => n.art === "antwort").map((n) => [n.antwort?.antwortAuf, n]));
    let tagVorher = "";
    let vonVorher = "";
    const teile = [`<div class="chat-tag chat-tag--start"><img src="${AVATAR}" alt="" width="40" height="40"><span>${esc(this.konfig.teamName)}</span></div>`];
    for (const n of alle) {
      const tag = tagWort(n.t);
      if (tag !== tagVorher) { teile.push(`<div class="chat-tag"><span>${esc(tag)}</span></div>`); tagVorher = tag; vonVorher = ""; }
      const neueGruppe = n.von !== vonVorher;
      vonVorher = n.von;
      teile.push(this.#blase(n, neueGruppe, antworten));
    }
    teile.push('<div class="chat-statuszeile" id="chat-statuszeile" aria-live="polite"></div>');
    this.liste.innerHTML = teile.join("");
    this.#statusZeilen();
  }

  #blase(n, neueGruppe, antworten) {
    const eigen = n.von === "kunde";
    const klasse = `chat-blase chat-blase--${eigen ? "ich" : "team"}${neueGruppe ? " chat-blase--erste" : ""}${n._stand === "fehler" ? " chat-blase--fehler" : ""}`;
    const zeit = `<time>${esc(uhr(n.t))}</time>`;
    let inhalt = "";
    if (n.art === "bild") {
      inhalt = `${n.bild ? `<img class="chat-bild" data-bild src="${esc(n.bild)}" alt="Foto" loading="lazy">` : '<span class="chat-bild chat-bild--leer">📷</span>'}${n.text ? `<p>${textHtml(n.text)}</p>` : ""}`;
    } else if (n.art === "produkte") {
      inhalt = this.#produktKarte(n);
    } else if (n.art === "formular") {
      inhalt = this.#formularKarte(n, antworten.get(n.id));
    } else if (n.art === "antwort") {
      const werte = n.antwort?.werte || {};
      inhalt = `<p class="chat-antwort"><b>✓ Të dhënat u dërguan</b>${Object.entries(werte).map(([k, v]) => `<span>${esc(formularFeld(k)?.label || k)}: ${esc(v || "—")}</span>`).join("")}</p>`;
    } else {
      inhalt = `<p>${textHtml(n.text)}</p>`;
    }
    const fehler = n._stand === "fehler" ? `<button type="button" class="chat-nochmal" data-nochmal="${esc(n.id)}">Nuk u dërgua · Provo sërish</button>` : "";
    const avatar = !eigen && neueGruppe ? `<img class="chat-avatar" src="${AVATAR}" alt="" width="28" height="28">` : "";
    return `<div class="${klasse}" data-id="${esc(n.id)}">${avatar}<div class="chat-blase__inhalt">${inhalt}${zeit}</div>${fehler}</div>`;
  }

  #produktFoto(p) {
    if (p.foto) return p.foto;
    try { return this.ladenFn()?.mittelVon?.(p.id)?.fotot?.[0] || ""; } catch { return ""; }
  }

  #produktKarte(n) {
    const produkte = n.produkte || [];
    const bilder = produkte.map((p) => {
      const foto = this.#produktFoto(p);
      return `<li>${foto ? `<img src="${esc(foto)}" alt="" loading="lazy">` : '<span class="chat-produkt__leer"></span>'}<span><b>${esc(p.name)}</b></span></li>`;
    }).join("");
    return `${n.text ? `<p>${textHtml(n.text)}</p>` : ""}<div class="chat-produkt">
      <ul>${bilder}</ul>
      <div class="chat-produkt__fuss"><span>${produkte.length === 1 ? "1 produkt" : `${produkte.length} produkte`} · dërgesa falas</span><strong>${esc(n.summe)} €</strong></div>
      <button type="button" class="chat-produkt__knopf" data-porosite="${esc(n.id)}">Porosite · ${esc(n.summe)} €</button>
      <small>Paguani te dera · 1–3 ditë</small>
    </div>`;
  }

  #formularKarte(n, antwort) {
    const felder = n.formular?.felder || [];
    const titel = n.formular?.titel || "Ju lutemi plotësoni:";
    if (antwort) {
      return `<div class="chat-formular chat-formular--fertig"><b>${esc(titel)}</b><span>✓ U dërgua</span></div>`;
    }
    const vor = this.ladenFn()?.kasseWerteFuerChat?.() || {};
    const eingaben = felder.map((id) => {
      const f = formularFeld(id);
      if (!f) return "";
      const wert = esc(vor[id] || "");
      const attr = `name="${f.id}" autocomplete="${f.autocomplete}" ${f.typ === "tel" ? 'inputmode="tel"' : ""}`;
      return `<label><span>${esc(f.label)}</span>${f.typ === "textarea"
        ? `<textarea ${attr} rows="2" maxlength="500">${wert}</textarea>`
        : `<input type="${f.typ}" ${attr} value="${wert}" maxlength="120">`}</label>`;
    }).join("");
    return `<form class="chat-formular" data-formular="${esc(n.id)}"><b>${esc(titel)}</b>${eingaben}<button type="submit">Dërgo</button></form>`;
  }

  // "Duke u dërguar" / "Dërguar" / "Parë" unter der letzten eigenen Nachricht.
  #statusZeilen() {
    const zeile = $("#chat-statuszeile", this.liste);
    if (!zeile) return;
    const alle = this.#alle();
    const letzte = alle[alle.length - 1];
    if (!letzte || letzte.von !== "kunde") { zeile.textContent = ""; zeile.hidden = true; return; }
    zeile.hidden = false;
    zeile.textContent = letzte._stand === "sendet" ? "Duke u dërguar …"
      : letzte._stand === "fehler" ? ""
        : zeitMs(this.chat?.teamGelesenAt) >= nachrichtMs(letzte) && nachrichtMs(letzte) > 0 ? "Parë" : "Dërguar";
  }
}

if (typeof document !== "undefined" && !globalThis.__LIFESKIN_TEST__ && document.getElementById("chat-knopf")) {
  const start = () => new Chat().starte();
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
}
