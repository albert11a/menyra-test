// Mnyra GO - die Karte im Qyteti. Reines String-Rendering.
//
// Sie ist der einzige Teil von GO, den ein Besucher zu sehen bekommt, ohne
// etwas getan zu haben. Deshalb ist sie so leicht wie moeglich: kein Bild,
// keine Abfrage, kein Zaehler, kein Realtime (Spezifikation Punkt 6). Was sie
// zeigt, steht entweder fest oder liegt bereits im Browser.
//
// Zwei Zustaende:
//
//   ohne laufenden Vorgang   "Lokalet kanë oferta për ju."
//   mit laufendem Vorgang    "Casa Rita · 4 persona · rreth 19:00"
//
// Der zweite ist fuer Gaeste ohne Konto wichtig: Er ist ihr Weg zurueck zu
// einer Buchung, die sie sonst nirgends wiederfinden (Punkt 43).
//
// Alle Texte kommen von aussen herein und haben nur hier ihren Standard -
// damit "Mnyra GO" spaeter "Mnyra Tani" heissen kann, ohne dass jemand durch
// die App suchen muss (Punkt 3).

const DEFAULT_TEXTS = Object.freeze({
  brand: "MNYRA GO",
  mark: "⚡",
  idleTitle: "Çka po kërkoni tani?",
  idleSubtitle: "Lokalet kanë oferta për ju.",
  idleAction: "Shiko ofertat",
  activeBadge: "aktive",
  activeAction: "Shiko",
  peopleSuffix: "persona",
  now: "Tani",
  around: "Rreth"
});

function esc(value = "") {
  return String(value === null || value === undefined ? "" : value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// "Rreth 19:00" oder "Tani". Die Uhrzeit wird aus der gespeicherten ISO-Zeit
// gelesen; sie ist eine erwartete Ankunft und wird deshalb nie als exakter
// Termin gesetzt.
export function formatGoCardArrival(expectedArrivalAt = "", { nowMs = Date.now(), texts = {} } = {}) {
  const labels = { ...DEFAULT_TEXTS, ...(texts || {}) };
  const ms = Date.parse(String(expectedArrivalAt || ""));
  if (!Number.isFinite(ms)) return "";
  if (Math.abs(ms - nowMs) < 15 * 60 * 1000) return labels.now;
  const date = new Date(ms);
  const clock = `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
  return `${labels.around} ${clock}`;
}

/**
 * Die Karte.
 *
 * @param {Array} params.activeBookings  Was im Browser als laufend vermerkt ist.
 * @param {object} params.texts          Ueberschreibbare Beschriftungen (A/B).
 * @returns {string} HTML oder "" - leer heisst: die Karte erscheint nicht.
 */
export function renderGoEntryCardCore({
  enabled = false,
  activeBookings = [],
  texts = {},
  nowMs = Date.now()
} = {}) {
  if (!enabled) return "";
  const labels = { ...DEFAULT_TEXTS, ...(texts || {}) };
  const list = Array.isArray(activeBookings) ? activeBookings.filter(Boolean) : [];
  const active = list[0] || null;

  const head = `
    <span class="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-white/70">
      <span aria-hidden="true">${esc(labels.mark)}</span>
      ${esc(labels.brand)}${active ? ` <span class="text-white/50">·</span> <span class="text-white">${list.length} ${esc(labels.activeBadge)}</span>` : ""}
    </span>
  `;

  const body = active
    ? `
      <p class="mt-2 text-lg font-black tracking-tight text-white">${esc(active.businessName || labels.idleTitle)}</p>
      <p class="mt-1 text-[13px] font-semibold text-white/70">
        ${esc(`${active.partySize} ${labels.peopleSuffix}`)}
        ${active.expectedArrivalAt ? ` · ${esc(formatGoCardArrival(active.expectedArrivalAt, { nowMs, texts: labels }))}` : ""}
      </p>
    `
    : `
      <p class="mt-2 text-lg font-black tracking-tight text-white">${esc(labels.idleTitle)}</p>
      <p class="mt-1 text-[13px] font-semibold text-white/70">${esc(labels.idleSubtitle)}</p>
    `;

  const actionLabel = active ? labels.activeAction : labels.idleAction;

  // Ein einziger Knopf, der die ganze Karte ist: auf dem Telefon trifft man
  // ihn ueberall (Punkt 143). Das Ziel steht in data-go-open - daran haengt
  // spaeter der Klick, der erst dann das GO-Modul nachlaedt.
  return `
    <div class="app-content-inline mb-5" data-go-entry>
      <button
        type="button"
        data-go-open="${active ? "booking" : "search"}"
        ${active ? `data-go-booking-id="${esc(active.bookingId)}"` : ""}
        class="w-full text-left rounded-[2rem] bg-slate-900 px-5 py-5 active:scale-[0.99] transition-transform"
        aria-label="${esc(`${labels.brand} - ${actionLabel}`)}"
      >
        ${head}
        ${body}
        <span class="mt-4 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-[11px] font-black uppercase tracking-widest text-slate-900">
          ${esc(actionLabel)}
          <span aria-hidden="true">→</span>
        </span>
      </button>
    </div>
  `;
}

/**
 * Der kleine Streifen am unteren Rand, solange ein Vorgang laeuft (Punkt 48).
 *
 * Er haengt nicht im Seitenbaum der App, sondern wird vom GO-Modul selbst an
 * den Rand des Dokuments gesetzt - ein Fehler in GO kann so keine andere
 * Seite beschaedigen.
 */
export function renderGoStickyBarCore({ activeBookings = [], texts = {} } = {}) {
  const labels = { ...DEFAULT_TEXTS, ...(texts || {}) };
  const active = (Array.isArray(activeBookings) ? activeBookings : []).filter(Boolean)[0];
  if (!active) return "";
  return `
    <button
      type="button"
      data-go-open="booking"
      data-go-booking-id="${esc(active.bookingId)}"
      class="fixed left-1/2 -translate-x-1/2 z-[55] flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2.5 text-[11px] font-black text-white shadow-lg"
      style="bottom: calc(env(safe-area-inset-bottom, 0px) + 84px);"
    >
      <span aria-hidden="true">${esc(labels.mark)}</span>
      <span>${esc(labels.brand.replace("MNYRA ", ""))}</span>
      <span class="text-white/50">·</span>
      <span class="font-semibold text-white/80">${esc(active.businessName)}</span>
      <span class="rounded-full bg-white px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-slate-900">${esc(labels.activeAction)}</span>
    </button>
  `;
}

export const GO_ENTRY_DEFAULT_TEXTS = DEFAULT_TEXTS;
