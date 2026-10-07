// DER CHAT IN HEART - nur Darstellung (keine Daten, kein Firebase).
// Daten und Bedienung: heart-chat.js. Aufbau: docs/lifeskin-chat.md.
//
// Alles, was ein Kunde geschrieben hat, geht durch esc() - Heart zeigt nie
// HTML aus einem Chat.
import { chatStatus, chatUngelesen, formularFeld, nachrichtMs, tipptGerade, zeitMs, FORMULAR_FELDER, CHAT_PRODUKTE_MAX } from "../../shared/lifeskin-chat.js";
import { setPreis } from "../../shared/lifeskin-shop-sets.js";
import { preisFuer } from "../../shared/lifeskin-preise.js";

// Der Preisvorschlag beim Senden von Produkten: genau die Produkte eines
// Sets im Laden -> der Preis dieses Sets (z. B. Acne Duo wie im Laden);
// sonst die Staffel. Aendern kann man ihn vor dem Senden.
export function preisVorschlag(ids, setet = []) {
  const wahl = [...new Set(ids || [])].sort().join(",");
  if (!wahl) return 0;
  const set = (setet || []).find((st) => [...new Set(st.produkte || [])].sort().join(",") === wahl);
  return set ? setPreis(set) : preisFuer(wahl.split(",").length);
}

export function esc(w) {
  return String(w ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
function textHtml(text) {
  return esc(text).replace(/(https?:\/\/[^\s<]+[^\s<.,;:!?)'"])/g,
    (url) => `<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`).replace(/\n/g, "<br>");
}
const uhr = (ms) => {
  if (!ms) return "";
  const d = new Date(ms);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
};
export function wannKurz(ms, jetzt = Date.now()) {
  if (!ms) return "";
  const d = new Date(ms);
  const heute = new Date(jetzt);
  if (d.toDateString() === heute.toDateString()) return uhr(ms);
  const gestern = new Date(jetzt - 86400000);
  if (d.toDateString() === gestern.toDateString()) return "Gestern";
  return `${d.getDate()}.${d.getMonth() + 1}.`;
}

export const CHIPS = Object.freeze([
  { id: "offen", label: "Offen" },
  { id: "erledigt", label: "Erledigt" },
  { id: "bestellt", label: "Bestellt" }
]);

// Wer ist das? Name aus der Sitzung, aus der Kasse oder einem Formular -
// sonst die Fallnummer.
export function chatName(chat, sitzung = null, antwortName = "") {
  return String(sitzung?.address?.name || sitzung?.name || sitzung?.timings?.kasse?.felder?.name
    || antwortName || chat?.code || "Klient i ri").trim();
}

export function entwurfAktiv(chat, jetzt = Date.now()) {
  const e = chat?.entwurf;
  return Boolean(e && String(e.text || "").trim() && jetzt - zeitMs(e.t) < 60000);
}

// ── Die Liste ────────────────────────────────────────────────────────
export function chatsFuerChip(chats, chip, sitzungVon = () => null) {
  return chats.filter((c) => chatStatus(c, sitzungVon(c.sessionId)) === chip)
    .sort((a, b) => (nachrichtMs(b.letzte) || zeitMs(b.updatedAt)) - (nachrichtMs(a.letzte) || zeitMs(a.updatedAt)));
}

export function renderListe({ chats = [], chip = "offen", offen = "", sitzungVon = () => null, jetzt = Date.now() } = {}) {
  const zahl = Object.fromEntries(CHIPS.map((c) => [c.id, chatsFuerChip(chats, c.id, sitzungVon).length]));
  const ungelesenOffen = chats.filter((c) => chatUngelesen(c) && chatStatus(c, sitzungVon(c.sessionId)) !== "erledigt").length;
  const liste = chatsFuerChip(chats, chip, sitzungVon);
  const zeilen = liste.map((c) => {
    const s = sitzungVon(c.sessionId);
    const neu = chatUngelesen(c);
    const tippt = entwurfAktiv(c, jetzt);
    const vorschau = tippt ? `<i>schreibt: ${esc(c.entwurf.text.slice(-80))}</i>`
      : c.letzte ? `${c.letzte.von === "team" ? "Du: " : ""}${esc(c.letzte.text)}` : "<i>noch keine Nachricht</i>";
    return `<button type="button" class="hchat-zeile${neu ? " hchat-zeile--neu" : ""}${c.id === offen ? " hchat-zeile--an" : ""}" data-chat="${esc(c.id)}">
      <span class="hchat-zeile__bild" aria-hidden="true">${esc(chatName(c, s).slice(0, 1).toUpperCase())}</span>
      <span class="hchat-zeile__mitte"><b>${esc(chatName(c, s))}</b><span>${vorschau}</span></span>
      <span class="hchat-zeile__rechts"><time>${esc(wannKurz(nachrichtMs(c.letzte) || zeitMs(c.updatedAt), jetzt))}</time>${neu ? '<i class="hchat-punkt" aria-label="ungelesen"></i>' : ""}</span>
    </button>`;
  }).join("");
  return {
    ungelesen: ungelesenOffen,
    html: `<div class="hchat-chips" role="tablist">${CHIPS.map((c) => `<button type="button" role="tab" class="hchat-chip" data-chip="${c.id}" aria-selected="${c.id === chip}">${esc(c.label)}<span>${zahl[c.id]}</span></button>`).join("")}</div>
      <div class="hchat-zeilen">${zeilen || `<p class="hchat-leer">${chip === "offen" ? "Keine offenen Chats." : "Nichts hier."}</p>`}</div>`
  };
}

// ── Eine Unterhaltung ───────────────────────────────────────────────
function produktKarte(n, produktName) {
  const liste = (n.produkte || []).map((p) => `<li>${esc(produktName(p.id) || p.name)}</li>`).join("");
  return `${n.text ? `<p>${textHtml(n.text)}</p>` : ""}<div class="hchat-produkt"><ul>${liste}</ul><strong>${esc(n.summe)} €</strong><small>Knopf beim Kunden: „Porosite“</small></div>`;
}

function formularKarte(n, antwort) {
  const felder = (n.formular?.felder || []).map((id) => formularFeld(id)?.heart || id).join(", ");
  return `<div class="hchat-formular"><b>📝 ${esc(n.formular?.titel || "Formular")}</b><span>${esc(felder)}</span><em>${antwort ? "✓ ausgefüllt" : "wartet auf Antwort"}</em></div>`;
}

// DER ENTWURF: was der Kunde gerade tippt, bevor er sendet. Eigene
// Funktion, damit Heart nur diese Blase neu zeichnet, waehrend getippt wird.
export function renderEntwurf(chat, jetzt = Date.now()) {
  if (!entwurfAktiv(chat, jetzt)) return "";
  return `<div class="hchat-blase hchat-blase--kunde hchat-blase--entwurf"><div class="hchat-blase__inhalt"><p>${textHtml(chat.entwurf.text)}</p><time>schreibt gerade …</time></div></div>`;
}

export function renderNachrichten({ nachrichten = [], chat = null, produktName = () => "", jetzt = Date.now(), mitEntwurf = true } = {}) {
  const antworten = new Set(nachrichten.filter((n) => n.art === "antwort").map((n) => n.antwort?.antwortAuf));
  let tagVorher = "";
  const teile = [];
  for (const n of nachrichten) {
    const ms = nachrichtMs(n);
    const tag = ms ? new Date(ms).toLocaleDateString("de-DE", { weekday: "short", day: "numeric", month: "numeric" }) : "";
    if (tag && tag !== tagVorher) { teile.push(`<div class="hchat-tag">${esc(tag)}</div>`); tagVorher = tag; }
    const team = n.von === "team";
    let inhalt;
    if (n.art === "bild") inhalt = `${n.bild ? `<img class="hchat-bild" data-bild src="${esc(n.bild)}" alt="Foto" loading="lazy">` : ""}${n.text ? `<p>${textHtml(n.text)}</p>` : ""}`;
    else if (n.art === "produkte") inhalt = produktKarte(n, produktName);
    else if (n.art === "formular") inhalt = formularKarte(n, antworten.has(n.id));
    else if (n.art === "antwort") {
      inhalt = `<div class="hchat-antwort"><b>📝 Formular ausgefüllt</b>${Object.entries(n.antwort?.werte || {})
        .map(([k, v]) => `<span><em>${esc(formularFeld(k)?.heart || k)}</em> ${esc(v || "—")}</span>`).join("")}</div>`;
    } else inhalt = `<p>${textHtml(n.text)}</p>`;
    const stand = n._stand === "sendet" ? " · sendet …" : n._stand === "fehler" ? " · NICHT gesendet" : "";
    teile.push(`<div class="hchat-blase hchat-blase--${team ? "team" : "kunde"}${n._stand === "fehler" ? " hchat-blase--fehler" : ""}" data-id="${esc(n.id)}">
      <div class="hchat-blase__inhalt">${inhalt}<time>${esc(uhr(ms))}${team && n.autor ? ` · ${esc(n.autor)}` : ""}${esc(stand)}</time></div>
      ${n._stand === "fehler" ? `<button type="button" class="hchat-nochmal" data-nochmal="${esc(n.id)}">Nochmal senden</button>` : ""}
    </div>`);
  }
  if (mitEntwurf) teile.push(renderEntwurf(chat, jetzt));
  const letzteTeam = [...nachrichten].reverse().find((n) => n.von === "team" && !n._stand);
  const gelesen = letzteTeam && zeitMs(chat?.kundeGelesenAt) >= nachrichtMs(letzteTeam);
  if (letzteTeam && nachrichten[nachrichten.length - 1] === letzteTeam) teile.push(`<div class="hchat-gelesen">${gelesen ? "Gesehen" : "Zugestellt"}</div>`);
  return teile.join("") || '<p class="hchat-leer">Noch keine Nachricht. Der Kunde hat den Chat geöffnet.</p>';
}

// ── Der Kunde: woher, was, wie weit (Analytics) ─────────────────────
export function renderKunde({ chat = null, sitzung = null, herkunft = null, kasse = null, pfad = [], pfadSatz = (e) => `${e.e} · ${e.d}` } = {}) {
  if (!sitzung) {
    return `<div class="hchat-kunde"><p class="hchat-leer">Keine Sitzung gefunden${chat?.code ? ` (${esc(chat.code)})` : ""}. Der Kunde hat ohne Besuchsdaten geschrieben.</p></div>`;
  }
  const q = sitzung.source || {};
  const zeile = (k, v) => (v ? `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>` : "");
  const geraet = [sitzung.device?.os, sitzung.device?.app || sitzung.device?.browser].filter(Boolean).join(" · ");
  const bestellt = sitzung.hatBestellt ? `${sitzung.order?.total ?? ""} € · ${sitzung.order?.orderId || sitzung.code || ""}${sitzung.order?.chat ? " · aus dem Chat" : ""}` : "";
  const g = kasse?.geschrieben;
  const kasseText = g ? [g.name, g.telefon, g.strasse, g.ort].filter(Boolean).join(" · ") : "";
  const versuche = (kasse?.versuche || []).map((v) => v.ergebnis).join(", ");
  const letzte = pfad.slice(-14).reverse().map((e) => `<li><time>${esc(uhr(Date.parse(e.t)))}</time>${esc(pfadSatz(e))}</li>`).join("");
  return `<div class="hchat-kunde">
    <dl>
      ${zeile("Herkunft", herkunft ? [herkunft.label, herkunft.detail].filter(Boolean).join(" · ") : "")}
      ${zeile("Kampagne", q.utmCampaign)}${zeile("Anzeige", q.utmContent)}${zeile("Quelle", q.utmSource)}
      ${zeile("Erster Besuch", sitzung.createdAt ? new Date(sitzung.createdAt).toLocaleString("de-DE", { dateStyle: "short", timeStyle: "short" }) : "")}
      ${zeile("Gerät", geraet)}
      ${zeile("Fallnummer", sitzung.code)}
      ${zeile("Telefon", sitzung.phone || g?.telefon)}
      ${zeile("Warenkorb", sitzung.imKorb || sitzung.kasseGeoeffnet ? `ja${sitzung.korbWert ? ` · ${sitzung.korbWert} €` : ""}` : "nein")}
      ${zeile("In der Kasse geschrieben", kasseText)}
      ${zeile("Porositni gedrückt", versuche)}
      ${zeile("Bestellt", bestellt)}
    </dl>
    ${letzte ? `<h4>Zuletzt auf der Seite</h4><ol class="hchat-pfad">${letzte}</ol>` : ""}
    <button type="button" class="hchat-knopf hchat-knopf--leise" data-fall="${esc(sitzung.id)}">Ganzen Fall in Heart öffnen</button>
  </div>`;
}

// ── Produkte und Formulare senden ───────────────────────────────────
export function renderProduktWahl({ produkte = [], gewaehlt = [], summe = "" } = {}) {
  const voll = gewaehlt.length >= CHAT_PRODUKTE_MAX;
  return `<div class="hchat-blatt" data-blatt="produkte">
    <div class="hchat-blatt__kopf"><b>Produkte senden (1–${CHAT_PRODUKTE_MAX})</b><button type="button" class="hchat-x" data-blatt-zu aria-label="Schliessen">×</button></div>
    <div class="hchat-wahl">${produkte.map((p) => {
    const an = gewaehlt.includes(p.id);
    return `<label class="hchat-wahl__eintrag${an ? " hchat-wahl__eintrag--an" : ""}">
        <input type="checkbox" data-produkt="${esc(p.id)}"${an ? " checked" : ""}${!an && voll ? " disabled" : ""}>
        ${p.foto ? `<img src="${esc(p.foto)}" alt="" width="40" height="50">` : '<span class="hchat-wahl__leer"></span>'}
        <span><b>${esc(p.name)}</b><small>${esc(p.preis)} € einzeln</small></span>
      </label>`;
  }).join("")}</div>
    <label class="hchat-feldzeile"><span>Preis für alles zusammen (€)</span><input type="number" inputmode="decimal" min="0" step="0.5" id="hchat-summe" value="${esc(summe)}"></label>
    <label class="hchat-feldzeile"><span>Text dazu (optional)</span><input type="text" id="hchat-produkt-text" maxlength="300" placeholder="z. B. Ja oferta për ju:"></label>
    <button type="button" class="hchat-knopf" data-senden-produkte${gewaehlt.length ? "" : " disabled"}>Senden${gewaehlt.length ? ` · ${gewaehlt.length} ${gewaehlt.length === 1 ? "Produkt" : "Produkte"}` : ""}</button>
  </div>`;
}

export function renderFormularWahl({ gewaehlt = ["emri", "telefoni", "adresa", "qyteti"] } = {}) {
  return `<div class="hchat-blatt" data-blatt="formular">
    <div class="hchat-blatt__kopf"><b>Formular senden</b><button type="button" class="hchat-x" data-blatt-zu aria-label="Schliessen">×</button></div>
    <div class="hchat-wahl">${FORMULAR_FELDER.map((f) => `<label class="hchat-wahl__eintrag${gewaehlt.includes(f.id) ? " hchat-wahl__eintrag--an" : ""}">
      <input type="checkbox" data-feld="${f.id}"${gewaehlt.includes(f.id) ? " checked" : ""}><span><b>${esc(f.heart)}</b><small>${esc(f.label)}</small></span></label>`).join("")}</div>
    <label class="hchat-feldzeile"><span>Überschrift beim Kunden</span><input type="text" id="hchat-formular-titel" maxlength="120" value="Për dërgesën, ju lutemi plotësoni:"></label>
    <button type="button" class="hchat-knopf" data-senden-formular>Formular senden</button>
  </div>`;
}

export { tipptGerade };
