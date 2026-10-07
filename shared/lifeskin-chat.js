// DER CHAT - gemeinsame Bausteine fuer Laden, Heart und Tests
// (docs/lifeskin-chat.md, Auftrag 07.10.).
//
// Hier steht, WIE eine Nachricht aussieht. Laden und Heart bauen sie nur
// ueber diese Funktionen, damit nie eine Seite etwas schreibt, das die
// Firestore-Regeln (firestore.rules, "DER CHAT") abweisen. Keine Importe:
// laeuft im Browser, in Heart und in Node.

export const CHAT_TEXT_MAX = 2000;
export const CHAT_BILD_MAX = 950000;
export const CHAT_PRODUKTE_MAX = 5;
export const CHAT_VORSCHAU_MAX = 160;
export const CHAT_STATUS = Object.freeze(["offen", "erledigt", "bestellt"]);
export const CHAT_ZUGANG_SCHLUESSEL = "lifeskin:chat";

const ZUGANG = /^[0-9a-f]{32}$/;
export const zugangGueltig = (z) => ZUGANG.test(String(z || ""));

function zufallHex(bytes) {
  const feld = new Uint8Array(bytes);
  globalThis.crypto.getRandomValues(feld);
  return Array.from(feld, (b) => b.toString(16).padStart(2, "0")).join("");
}

export function neuerZugang() {
  return zufallHex(16);
}

// Sortierbar nach Zeit (Basis 36, feste Breite) und eindeutig - so stimmt
// die Reihenfolge auch, wenn zwei Nachrichten in derselben Millisekunde
// entstehen. Erlaubt: ^[a-z0-9]{8,40}$.
export function nachrichtKennung(jetzt = Date.now()) {
  return `${jetzt.toString(36).padStart(9, "0")}${zufallHex(4)}`;
}

export function chatPfad(zugang) {
  return ["lifeskin", "lifeskin", "chats", zugang];
}

const zeit = (jetzt) => new Date(jetzt).toISOString();
const kurz = (text, max) => {
  const t = String(text ?? "").replace(/\r\n/g, "\n");
  return t.length > max ? t.slice(0, max) : t;
};

// ── Formulare, die Heart schicken kann ───────────────────────────────
export const FORMULAR_FELDER = Object.freeze([
  { id: "emri", label: "Emri dhe mbiemri", typ: "text", autocomplete: "name", heart: "Name" },
  { id: "telefoni", label: "Numri i telefonit", typ: "tel", autocomplete: "tel", heart: "Telefon" },
  { id: "adresa", label: "Adresa", typ: "text", autocomplete: "street-address", heart: "Adresse" },
  { id: "qyteti", label: "Qyteti", typ: "text", autocomplete: "address-level2", heart: "Stadt" },
  { id: "email", label: "Email", typ: "email", autocomplete: "email", heart: "E-Mail" },
  { id: "shenim", label: "Shënim", typ: "textarea", autocomplete: "off", heart: "Notiz" }
]);
const FELD_IDS = new Set(FORMULAR_FELDER.map((f) => f.id));
export const formularFeld = (id) => FORMULAR_FELDER.find((f) => f.id === id) || null;

// ── Der Chat selbst ──────────────────────────────────────────────────
export function chatAnlegen({ sessionId = "", code = "", geraet = {}, jetzt = Date.now() } = {}) {
  const g = {};
  for (const k of ["os", "browser", "app"]) if (geraet?.[k]) g[k] = String(geraet[k]).slice(0, 40);
  return {
    createdAt: zeit(jetzt),
    updatedAt: zeit(jetzt),
    sessionId: String(sessionId || "").slice(0, 64),
    code: String(code || "").slice(0, 24),
    status: "offen",
    kundeAktivAt: zeit(jetzt),
    geraet: g
  };
}

// Die Zeile fuer die Liste in Heart.
export function vorschauVon(nachricht) {
  const art = nachricht?.art;
  const text = art === "bild" ? "📷 Foto"
    : art === "produkte" ? `🛍 ${(nachricht.produkte || []).length} produkte`
      : art === "formular" ? "📝 Formular"
        : art === "antwort" ? "📝 Formular plotësuar"
          : String(nachricht?.text || "");
  return { text: kurz(text.replace(/\s+/g, " ").trim(), CHAT_VORSCHAU_MAX), von: nachricht?.von === "team" ? "team" : "kunde", t: nachricht?.t || zeit(Date.now()) };
}

// ── Nachrichten des Kunden ──────────────────────────────────────────
export function kundenText(text, jetzt = Date.now()) {
  const t = kurz(String(text || "").trim(), CHAT_TEXT_MAX);
  if (!t) return null;
  return { von: "kunde", art: "text", text: t, t: zeit(jetzt) };
}

export function bildGueltig(dataUrl) {
  return typeof dataUrl === "string" && dataUrl.length <= CHAT_BILD_MAX
    && /^data:image\/(jpeg|png|webp);base64,./.test(dataUrl);
}

export function kundenBild(dataUrl, text = "", jetzt = Date.now()) {
  if (!bildGueltig(dataUrl)) return null;
  const n = { von: "kunde", art: "bild", bild: dataUrl, t: zeit(jetzt) };
  const t = kurz(String(text || "").trim(), CHAT_TEXT_MAX);
  if (t) n.text = t;
  return n;
}

export function kundenAntwort(antwortAuf, werte, jetzt = Date.now()) {
  const raus = {};
  for (const [k, v] of Object.entries(werte || {})) {
    if (!FELD_IDS.has(k)) continue;
    raus[k] = kurz(String(v ?? "").trim(), k === "shenim" ? 500 : 120);
  }
  if (!Object.keys(raus).length || !/^[a-z0-9]{8,40}$/.test(String(antwortAuf || ""))) return null;
  return { von: "kunde", art: "antwort", antwort: { antwortAuf, werte: raus }, t: zeit(jetzt) };
}

// ── Nachrichten des Teams (nur Heart) ───────────────────────────────
export function teamText(text, autor = "", jetzt = Date.now()) {
  const t = kurz(String(text || "").trim(), CHAT_TEXT_MAX);
  if (!t) return null;
  return { von: "team", art: "text", text: t, t: zeit(jetzt), ...(autor ? { autor: kurz(autor, 60) } : {}) };
}

export function teamBild(dataUrl, text = "", autor = "", jetzt = Date.now()) {
  if (!bildGueltig(dataUrl)) return null;
  const n = { von: "team", art: "bild", bild: dataUrl, t: zeit(jetzt), ...(autor ? { autor: kurz(autor, 60) } : {}) };
  const t = kurz(String(text || "").trim(), CHAT_TEXT_MAX);
  if (t) n.text = t;
  return n;
}

// Eine Produktkarte: 1-5 Produkte und EIN Preis fuer alle zusammen - so,
// wie er in der Kasse steht. Fotos als Adresse (kein data:), sonst wuerde
// eine Karte mit fuenf Fotos das Dokument sprengen.
export function produktGueltig(p) {
  return p && typeof p === "object" && /^[a-z0-9-]{1,40}$/.test(String(p.id || ""))
    && String(p.name || "").trim() && Number.isFinite(Number(p.preis)) && Number(p.preis) >= 0;
}

export function teamProdukte(produkte, summe, { text = "", autor = "", jetzt = Date.now() } = {}) {
  const liste = (produkte || []).filter(produktGueltig).slice(0, CHAT_PRODUKTE_MAX).map((p) => ({
    id: String(p.id), name: kurz(String(p.name).trim(), 80), preis: Number(p.preis),
    ...(typeof p.foto === "string" && /^(https:\/\/|\/)[^\s"]{1,500}$/.test(p.foto) ? { foto: p.foto } : {})
  }));
  if (!liste.length) return null;
  const gesamt = Number.isFinite(Number(summe)) ? Math.max(0, Math.round(Number(summe) * 100) / 100)
    : liste.reduce((s, p) => s + p.preis, 0);
  const n = { von: "team", art: "produkte", produkte: liste, summe: gesamt, t: zeit(jetzt) };
  const t = kurz(String(text || "").trim(), CHAT_TEXT_MAX);
  if (t) n.text = t;
  if (autor) n.autor = kurz(autor, 60);
  return n;
}

export function teamFormular(felder, { titel = "", autor = "", jetzt = Date.now() } = {}) {
  const liste = [...new Set((felder || []).filter((f) => FELD_IDS.has(f)))].slice(0, 8);
  if (!liste.length) return null;
  const formular = { felder: liste };
  if (String(titel || "").trim()) formular.titel = kurz(String(titel).trim(), 120);
  return { von: "team", art: "formular", formular, t: zeit(jetzt), ...(autor ? { autor: kurz(autor, 60) } : {}) };
}

// ── Zeit ────────────────────────────────────────────────────────────
// SERVERZEIT ("at", request.time) entscheidet Reihenfolge und "gelesen" -
// nie die Uhr eines Telefons. Firestore-Timestamp, {seconds}, Date, Zahl
// oder ISO-Text; ohne Wert 0. "t" (Uhr des Geraets) nur fuer die Anzeige
// und als Ersatz, solange "at" fehlt.
export function zeitMs(wert) {
  if (!wert) return 0;
  if (typeof wert === "number") return wert;
  if (typeof wert.toMillis === "function") return wert.toMillis();
  if (wert instanceof Date) return wert.getTime();
  if (typeof wert === "object" && Number.isFinite(wert.seconds)) return wert.seconds * 1000 + Math.floor((wert.nanoseconds || 0) / 1e6);
  const ms = Date.parse(String(wert));
  return Number.isFinite(ms) ? ms : 0;
}
export const nachrichtMs = (n) => zeitMs(n?.at) || zeitMs(n?.t);

// ── Lesen ───────────────────────────────────────────────────────────
// Nachrichten in der Reihenfolge, in der sie beim Server ankamen.
export function sortiereNachrichten(liste) {
  return [...(liste || [])].sort((a, b) => (nachrichtMs(a) - nachrichtMs(b))
    || String(a.id || "").localeCompare(String(b.id || "")));
}

// Wie viele Nachrichten der Gegenseite nach "gelesen bis" kamen.
export function ungelesen(nachrichten, gelesenAt, vonGegenseite) {
  const bis = zeitMs(gelesenAt);
  return (nachrichten || []).filter((n) => n.von === vonGegenseite && nachrichtMs(n) > bis).length;
}

// Die Liste in Heart: ungelesen = letzte Nachricht vom Kunden, nach dem,
// was das Team zuletzt gelesen hat.
export function chatUngelesen(chat) {
  const l = chat?.letzte;
  return Boolean(l && l.von === "kunde" && nachrichtMs(l) > zeitMs(chat?.teamGelesenAt));
}

// Bestellt heisst: Heart hat es so gesetzt, ODER die Sitzung des Kunden
// hat nach dem Anlegen des Chats bestellt.
export function chatStatus(chat, sitzung = null) {
  if (chat?.status === "bestellt") return "bestellt";
  // Schreibt der Kunde in einen erledigten Chat, ist er wieder offen - wie
  // bei WhatsApp & Co. (Heart setzt den Status dann auch selbst zurueck.)
  if (chat?.status === "erledigt" && chatUngelesen(chat)) return "offen";
  const bestelltAt = String(sitzung?.order?.createdAt || sitzung?.bestelltAt || "");
  if (bestelltAt && bestelltAt >= String(chat?.createdAt || "")) return "bestellt";
  return CHAT_STATUS.includes(chat?.status) ? chat.status : "offen";
}

// "schreibt ..." nur, solange es frisch ist - und nicht mehr, sobald die
// Nachricht da ist (seitDanach: Zeit der letzten Nachricht dieser Seite).
export function tipptGerade(zeitpunkt, jetzt = Date.now(), frist = 6000, seitDanach = 0) {
  const t = zeitMs(zeitpunkt);
  return t > 0 && jetzt - t < frist && !(seitDanach && seitDanach >= t);
}
