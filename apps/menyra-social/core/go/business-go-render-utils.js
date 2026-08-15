// Mnyra GO im Panel - Business-Ansicht. Reines String-Rendering.
//
// Aufbau wie der Ofertat- und der Menue-Editor: eine eigene Seite, keine
// Overlay-Flaeche. Weisse Karten mit 2.5rem-Radius, farbiger Eyebrow,
// kursive Ueberschrift, "+"-Knopf rechts oben, Liste mit Edit je Eintrag -
// und der Editor als eigener Bildschirm mit Zurueck-Pfeil.
//
// Warum kein Modal: Der Wirt arbeitet hier. Er stellt Zeiten ein, tippt
// Zahlen, sieht nach, wer kommt. Ein Modal ueber der Seite ist fuer einen
// Augenblick gedacht, nicht fuer Arbeit - und ein Editor in einem Modal
// verliert bei jedem Neuzeichnen der Shell die Eingaben. Genau darum steht
// ueber renderVoucherEditor derselbe Satz.
//
// Der Gedanke der Spezifikation bleibt: Fuer den Wirt darf GO sich nicht wie
// zusaetzliche Arbeit anfuehlen. Er stellt einmal ein, wann er welchen Deal
// gibt - und sieht danach nur noch, dass Gaeste kommen. Deshalb gibt es hier
// keinen "Prano"-Knopf (Punkt 61).

import {
  GO_BENEFIT_KINDS,
  GO_CATEGORIES,
  GO_PARTY_RANGES
} from "../../../../shared/go/go-feature-config.js";
import { GO_WEEKDAY_KEYS } from "../../../../shared/go/go-time-core.js";
import { describeGoPartyRanges, describeGoSchedule } from "../../../../shared/go/go-offer-core.js";
import { goBookingBusinessStatusLabel } from "../../../../shared/go/go-booking-core.js";

const TEXTS = Object.freeze({
  brand: "Mnyra GO",
  mark: "⚡",
  editor: "Editor",
  emptyTitle: "Merr klientë kur ata janë gati të dalin.",
  emptyAction: "Aktivizo ofertën e parë",
  cardIdle: "Krijo oferta për klientët që kërkojnë tani.",
  cardManage: "Menaxho GO",
  tabs: { active: "Aktiv", offers: "Ofertat", history: "Historiku", options: "Opsionet" },
  statNew: "Të reja",
  statActive: "Aktive",
  statToday: "Sot",
  guests: "Mysafirë",
  goOn: "GO Aktiv",
  pause: "Pauzo GO",
  resume: "Aktivizo GO",
  pausedUntil: "Pauzuar deri",
  createOffer: "Ofertë e re GO",
  editOffer: "Ndrysho ofertën",
  preview: "Kështu e sheh klienti",
  activate: "Aktivizo",
  save: "Ruaj ofertën",
  saving: "Po ruhet...",
  cancel: "Anulo",
  edit: "Edit",
  offering: "po ju ofron",
  forGroup: "për grupin tuaj",
  accept: "Prano ofertën",
  benefitQuestion: "Çka po ofron?",
  benefitCustom: "Teksti yt (opsionale)",
  partyQuestion: "Për sa persona?",
  categoryQuestion: "Kategoria",
  scheduleQuestion: "Kur vlen?",
  always: "Gjithmonë",
  specificHours: "Orar specifik",
  dateFrom: "Prej datës (opsionale)",
  dateTo: "Deri me datën (opsionale)",
  actionQuestion: "Kur klienti e zgjedh",
  onlyOffer: "Vetëm oferta",
  offerAndTable: "Oferta + tavolinë",
  limitsTitle: "Kufijtë",
  slotGroups: "Grupe për 30 min",
  slotGuests: "Mysafirë për 30 min",
  dailyGroups: "Grupe në ditë",
  totalRedemptions: "Sa herë gjithsej",
  noLimit: "0 = pa kufi",
  paused: "Pauzuar",
  archived: "Arkivuar",
  archive: "Arkivo",
  noBookings: "Ende asnjë klient sot.",
  noHistory: "Ende asnjë histori.",
  loading: "Po ngarkohet...",
  guestName: "Mnyra Guest",
  table: "Tavolinë",
  markArrived: "Erdhën",
  markNotArrived: "Nuk erdhën",
  markDone: "Përfundo",
  keepsRunning: "Rezervimet ekzistuese mbeten. Vetëm të rejat ndalen.",
  onlyBusiness: "Ky funksion eshte vetem per profile biznesi.",
  loadingBusiness: "Biznesi po ngarkohet..."
});

function esc(escapeHtml, value = "") {
  return typeof escapeHtml === "function" ? escapeHtml(value) : String(value ?? "");
}

function safeIcon(icon, name = "", className = "w-4 h-4") {
  return typeof icon === "function" ? icon(name, className) : "";
}

function clock(value = "") {
  const ms = Date.parse(String(value || ""));
  if (!Number.isFinite(ms)) return "";
  const date = new Date(ms);
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

/**
 * Die GO-Karte im Panel (Punkt 49, 50, 51, 85, 86).
 *
 * Sie sieht aus wie die anderen Karten in Funksionet und fuehrt ueber
 * data-nav auf den GO-Tab - denselben Weg nimmt "Lësho ofertë" zu den
 * Ofertat.
 *
 * Das Abzeichen zaehlt NUR das Ungesehene. "3" heisst: drei Vorgaenge, die
 * das Lokal noch nicht angeschaut hat - nicht drei aktive Buchungen.
 */
export function renderBusinessGoCardCore({
  enabled = false,
  unseenCount = 0,
  activeOffers = 0,
  todayBookings = 0,
  iconFn = null,
  texts = {}
} = {}) {
  if (!enabled) return "";
  const labels = { ...TEXTS, ...(texts || {}) };
  const unseen = Math.max(0, Math.trunc(Number(unseenCount) || 0));
  const hasActivity = activeOffers > 0 || todayBookings > 0;
  const summary = hasActivity
    ? `${activeOffers} oferta aktive · ${todayBookings} rezervime sot`
    : labels.cardIdle;

  return `
    <button type="button" class="mnyra-dash__composer mnyra-dash__composer--tap mnyra-dash__composer--plane" data-go-business-card data-nav="gobiznes">
      <span class="mnyra-dash__composer-title">
        <span class="mnyra-dash__composer-accent">Mnyra</span> GO
        ${unseen > 0
          ? `<span class="mnyra-dash__composer-badge" aria-label="${unseen} ${labels.statNew}">${unseen}</span>`
          : ""}
      </span>
      <span class="mnyra-dash__composer-sub">${summary}</span>
      <span class="mnyra-dash__composer-cta">
        <span class="mnyra-dash__composer-cta-icon">${safeIcon(iconFn, "zap", "w-4 h-4")}</span>
        <span class="mnyra-dash__composer-cta-label">${hasActivity ? labels.cardManage : labels.emptyAction}</span>
        <span class="mnyra-dash__composer-cta-chevron">${safeIcon(iconFn, "chevron-right", "w-4 h-4")}</span>
      </span>
    </button>
  `;
}

// Die Kennzahlreihe - dieselbe Form wie in den Ofertat.
function renderGoKpiRow({ summary = {}, deps = {} } = {}) {
  const escapeHtml = deps.escapeHtml;
  const icon = deps.icon;
  const cards = [
    { key: "unseen", label: TEXTS.statNew, value: summary.unseen || 0, icon: "bell", tone: "text-rose-500" },
    { key: "open", label: TEXTS.statActive, value: summary.open || 0, icon: "zap", tone: "text-indigo-600" },
    { key: "today", label: TEXTS.statToday, value: summary.today || 0, icon: "calendar", tone: "text-amber-600" },
    { key: "guests", label: TEXTS.guests, value: summary.guests || 0, icon: "users", tone: "text-emerald-600" }
  ];
  return `
    <div class="mb-6 grid grid-cols-2 gap-3">
      ${cards.map((card) => `
        <div class="bg-white rounded-[1.8rem] p-4 border border-slate-100 shadow-sm" data-go-kpi="${esc(escapeHtml, card.key)}">
          <div class="flex items-center gap-2 ${card.tone}">
            ${safeIcon(icon, card.icon, "w-3.5 h-3.5")}
            <span class="text-[9px] font-black uppercase tracking-widest">${esc(escapeHtml, card.label)}</span>
          </div>
          <p class="mt-2 text-2xl font-black tracking-tighter text-slate-900">${esc(escapeHtml, card.value)}</p>
        </div>
      `).join("")}
    </div>
  `;
}

function renderGoTabs({ tab = "active", deps = {} } = {}) {
  const escapeHtml = deps.escapeHtml;
  const entries = [
    ["active", TEXTS.tabs.active],
    ["offers", TEXTS.tabs.offers],
    ["history", TEXTS.tabs.history],
    ["options", TEXTS.tabs.options]
  ];
  return `
    <div class="mb-6 flex gap-2 overflow-x-auto pb-1" role="tablist" data-go-tabs>
      ${entries.map(([key, label]) => `
        <button type="button" role="tab" aria-selected="${tab === key ? "true" : "false"}" data-go-business-tab="${key}"
          class="shrink-0 min-h-[44px] px-4 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-colors ${tab === key
            ? "bg-slate-900 text-white"
            : "bg-white text-slate-500 border border-slate-100"}">
          ${esc(escapeHtml, label)}
        </button>
      `).join("")}
    </div>
  `;
}

function renderBookingRow(booking = {}, deps = {}) {
  const escapeHtml = deps.escapeHtml;
  const isTable = booking.type === "reservation";
  const arrival = clock(booking.expectedArrivalAt);
  // Der Vorteil steht in der eingefrorenen Kopie. Was das Lokal hier liest,
  // ist die Zusage von damals - nicht das heutige Angebot (Punkt 92).
  const benefitLabel = booking.benefitLabel || booking.snapshot?.benefitLabel || "";
  // Das Lokal braucht keine Mailadresse und keine Telefonnummer, um einen
  // Gast zu empfangen - ein Kurzcode reicht (Punkt 60).
  const guestName = `${TEXTS.guestName} · ${booking.shortCode || ""}`.trim();
  const unseen = !booking.businessSeenAt;

  return `
    <div class="p-4 rounded-[1.6rem] border ${unseen ? "bg-indigo-50/50 border-indigo-100" : "bg-slate-50 border-slate-100"}" data-go-booking="${esc(escapeHtml, booking.id)}">
      <div class="flex items-start justify-between gap-3">
        <p class="text-sm font-black text-slate-900 truncate min-w-0">GO #${esc(escapeHtml, booking.shortCode || "")}</p>
        <span class="shrink-0 text-[9px] font-black uppercase tracking-widest text-slate-500">
          ${esc(escapeHtml, goBookingBusinessStatusLabel(booking))}
        </span>
      </div>
      <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">${esc(escapeHtml, guestName)}</p>
      <div class="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-bold text-slate-600">
        <span>👥 ${esc(escapeHtml, `${booking.partySize || 1} ${TEXTS.guests}`)}</span>
        ${arrival ? `<span>🕐 Rreth ${esc(escapeHtml, arrival)}</span>` : ""}
        ${benefitLabel ? `<span>🎁 ${esc(escapeHtml, benefitLabel)}</span>` : ""}
        ${isTable ? `<span>🪑 ${esc(escapeHtml, TEXTS.table)}</span>` : ""}
      </div>
      ${booking.status === "confirmed" ? `
        <div class="mt-3 flex flex-wrap gap-2">
          <button type="button" data-go-booking-action="checkin" data-go-booking-id="${esc(escapeHtml, booking.id)}"
            class="px-3 py-1.5 rounded-xl bg-slate-900 text-[10px] font-black uppercase tracking-widest text-white">${esc(escapeHtml, TEXTS.markArrived)}</button>
          <button type="button" data-go-booking-action="notArrived" data-go-booking-id="${esc(escapeHtml, booking.id)}"
            class="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-[10px] font-black uppercase tracking-widest text-slate-500">${esc(escapeHtml, TEXTS.markNotArrived)}</button>
        </div>
      ` : ""}
      ${booking.status === "checked_in" ? `
        <div class="mt-3">
          <button type="button" data-go-booking-action="complete" data-go-booking-id="${esc(escapeHtml, booking.id)}"
            class="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-[10px] font-black uppercase tracking-widest text-slate-500">${esc(escapeHtml, TEXTS.markDone)}</button>
        </div>
      ` : ""}
    </div>
  `;
}

function renderSection({ eyebrow = "", title = "", sub = "", action = "", body = "", deps = {} } = {}) {
  const escapeHtml = deps.escapeHtml;
  return `
    <div class="mb-6 bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm">
      <div class="flex items-center justify-between mb-4">
        <div>
          <span class="text-[9px] font-black text-indigo-600 uppercase tracking-widest">${esc(escapeHtml, eyebrow)}</span>
          <h3 class="text-xl font-black italic tracking-tighter">${esc(escapeHtml, title)}</h3>
          ${sub ? `<p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">${esc(escapeHtml, sub)}</p>` : ""}
        </div>
        ${action}
      </div>
      ${body}
    </div>
  `;
}

function renderOfferRow(offer = {}, deps = {}) {
  const escapeHtml = deps.escapeHtml;
  const badge = offer.status === "paused" ? TEXTS.paused : (offer.status === "archived" ? TEXTS.archived : "");
  return `
    <div class="flex items-start gap-4 p-4 rounded-[1.6rem] bg-slate-50 border border-slate-100" data-go-offer="${esc(escapeHtml, offer.id)}">
      <div class="flex-1 min-w-0">
        <p class="text-sm font-black text-slate-900 truncate">${esc(escapeHtml, offer.benefitLabel || "")}</p>
        <p class="text-[9px] font-black uppercase tracking-widest mt-2 text-slate-400">
          ${esc(escapeHtml, describeGoPartyRanges(offer))} &middot; ${esc(escapeHtml, describeGoSchedule(offer))}
        </p>
        <p class="text-[9px] font-black uppercase tracking-widest mt-1 ${offer.status === "active" ? "text-emerald-600" : "text-slate-400"}">
          ${esc(escapeHtml, badge || TEXTS.statActive)}
        </p>
      </div>
      <div class="flex flex-col gap-2">
        <button type="button" data-go-offer-edit="${esc(escapeHtml, offer.id)}"
          class="px-3 py-1.5 rounded-xl bg-white text-[10px] font-black uppercase tracking-widest text-slate-600 border border-slate-200">${esc(escapeHtml, TEXTS.edit)}</button>
        <button type="button" data-go-offer-toggle="${esc(escapeHtml, offer.id)}"
          class="px-3 py-1.5 rounded-xl bg-white text-[10px] font-black uppercase tracking-widest text-slate-600 border border-slate-200">${esc(escapeHtml, offer.status === "active" ? TEXTS.paused : TEXTS.activate)}</button>
        <button type="button" data-go-offer-archive="${esc(escapeHtml, offer.id)}"
          class="px-3 py-1.5 rounded-xl bg-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-400">${esc(escapeHtml, TEXTS.archive)}</button>
      </div>
    </div>
  `;
}

/**
 * Die Vorschau - genau die Karte, die der Gast spaeter sieht (Punkt 81).
 * Sie wird aus demselben Angebot gebaut wie das Ergebnis der Suche.
 */
export function renderGoOfferPreviewCore({ offer = {}, businessName = "", deps = {} } = {}) {
  const escapeHtml = deps.escapeHtml;
  return `
    <div class="rounded-[1.8rem] border border-slate-200 bg-white p-5" data-go-offer-preview>
      <p class="text-[9px] font-black uppercase tracking-widest text-slate-300">${esc(escapeHtml, TEXTS.preview)}</p>
      <p class="mt-3 text-[13px] font-black text-slate-900">
        ${esc(escapeHtml, businessName)} <span class="font-bold text-slate-400">${esc(escapeHtml, TEXTS.offering)}</span>
      </p>
      <p class="mt-2 text-2xl font-black tracking-tighter text-slate-900">${esc(escapeHtml, offer.benefitLabel || "")}</p>
      <p class="text-xs font-bold text-slate-500">${esc(escapeHtml, TEXTS.forGroup)}</p>
      <p class="mt-3 text-[10px] font-black uppercase tracking-widest text-slate-400">
        ${esc(escapeHtml, describeGoPartyRanges(offer))} &middot; ${esc(escapeHtml, describeGoSchedule(offer))}
      </p>
      <span class="mt-4 inline-flex rounded-2xl bg-slate-900 px-5 py-3 text-[10px] font-black uppercase tracking-widest text-white">
        ${esc(escapeHtml, TEXTS.accept)}
      </span>
    </div>
  `;
}

function fieldLabel(escapeHtml, text = "", forId = "") {
  return `<label class="text-[10px] font-black uppercase tracking-widest text-slate-400"${forId ? ` for="${esc(escapeHtml, forId)}"` : ""}>${esc(escapeHtml, text)}</label>`;
}

function chip(label, { active = false, attr = "", value = "", escapeHtml = null } = {}) {
  return `
    <button type="button" ${attr ? `${attr}="${esc(escapeHtml, value)}"` : ""} aria-pressed="${active ? "true" : "false"}"
      class="min-h-[44px] px-4 rounded-2xl text-xs font-black transition-colors ${active
        ? "bg-slate-900 text-white"
        : "bg-slate-50 text-slate-600 border border-slate-100"}">
      ${esc(escapeHtml, label)}
    </button>
  `;
}

/**
 * Der Editor als eigener Bildschirm - kein Overlay.
 *
 * Genau wie bei den Ofertat: So bleiben Eingaben beim Neuzeichnen der Shell
 * erhalten, weil nur Aktionen ein Neuzeichnen ausloesen.
 */
export function renderGoOfferEditorCore({
  editor = null,
  businessName = "",
  deps = {}
} = {}) {
  if (!editor) return "";
  const escapeHtml = deps.escapeHtml;
  const icon = deps.icon;
  const draft = editor.draft || {};
  const errors = Array.isArray(editor.errors) ? editor.errors : [];
  const errorFor = (field) => errors.find((entry) => entry.field === field)?.message || "";
  const partyRanges = Array.isArray(draft.partyRanges) ? draft.partyRanges : [];
  const days = Array.isArray(draft.schedule?.days) ? draft.schedule.days : [];
  const scheduleMode = draft.schedule?.mode === "windows" ? "windows" : "always";
  const dayLabels = { mon: "Hën", tue: "Mar", wed: "Mër", thu: "Enj", fri: "Pre", sat: "Sht", sun: "Die" };
  const isEdit = editor.mode === "edit";
  const inputClass = "mt-2 w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3.5 text-sm font-bold text-slate-900 outline-none focus:border-indigo-400";

  return `
    <div class="p-6 app-main-content-safe animate-in slide-in-from-right-10 duration-500" data-go-offer-editor>
      <div class="flex items-center gap-3 mb-6">
        <button type="button" data-go-offer-cancel class="p-2.5 rounded-2xl bg-white border border-slate-200 text-slate-500">
          ${safeIcon(icon, "chevron-left", "w-4 h-4")}
        </button>
        <div>
          <span class="text-[9px] font-black text-indigo-600 uppercase tracking-widest">${esc(escapeHtml, TEXTS.brand)}</span>
          <h2 class="text-2xl font-black italic uppercase tracking-tighter">${esc(escapeHtml, isEdit ? TEXTS.editOffer : TEXTS.createOffer)}</h2>
        </div>
      </div>

      <div class="bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm space-y-5">
        <div>
          ${fieldLabel(escapeHtml, TEXTS.benefitQuestion)}
          <div class="mt-2 flex flex-wrap gap-2">
            ${GO_BENEFIT_KINDS.map((entry) => chip(entry.label, {
              active: (draft.benefit?.kind || "percent") === entry.key,
              attr: "data-go-benefit-kind",
              value: entry.key,
              escapeHtml
            })).join("")}
          </div>
          ${(draft.benefit?.kind || "percent") === "percent" ? `
            <input id="goBenefitPercent" type="number" min="1" max="90" step="1" data-go-benefit-percent
              value="${esc(escapeHtml, draft.benefit?.percent || 10)}" class="${inputClass}" />
          ` : `
            <input id="goBenefitItem" type="text" data-go-benefit-item placeholder="Cookie, Cappuccino..."
              value="${esc(escapeHtml, draft.benefit?.itemName || "")}" class="${inputClass}" />
            <input id="goBenefitPrice" type="text" data-go-benefit-price placeholder="2,50 €"
              value="${esc(escapeHtml, draft.benefit?.priceText || "")}" class="${inputClass}" />
          `}
          <input id="goBenefitText" type="text" data-go-benefit-text placeholder="${esc(escapeHtml, TEXTS.benefitCustom)}"
            value="${esc(escapeHtml, draft.benefit?.text || "")}" class="${inputClass}" />
          ${errorFor("benefit") ? `<p class="mt-2 text-[11px] font-bold text-rose-500">${esc(escapeHtml, errorFor("benefit"))}</p>` : ""}
        </div>

        <div>
          ${fieldLabel(escapeHtml, TEXTS.partyQuestion)}
          <div class="mt-2 flex flex-wrap gap-2">
            ${GO_PARTY_RANGES.map((entry) => chip(entry.label, {
              active: partyRanges.includes(entry.key),
              attr: "data-go-offer-party",
              value: entry.key,
              escapeHtml
            })).join("")}
          </div>
        </div>

        <div>
          ${fieldLabel(escapeHtml, TEXTS.categoryQuestion)}
          <div class="mt-2 flex flex-wrap gap-2">
            ${GO_CATEGORIES.map((entry) => chip(entry.label, {
              active: (draft.category || "all") === entry.key,
              attr: "data-go-offer-category",
              value: entry.key,
              escapeHtml
            })).join("")}
          </div>
        </div>

        <div>
          ${fieldLabel(escapeHtml, TEXTS.scheduleQuestion)}
          <div class="mt-2 flex flex-wrap gap-2">
            ${chip(TEXTS.always, { active: scheduleMode === "always", attr: "data-go-offer-schedule", value: "always", escapeHtml })}
            ${chip(TEXTS.specificHours, { active: scheduleMode === "windows", attr: "data-go-offer-schedule", value: "windows", escapeHtml })}
          </div>
          ${scheduleMode === "windows" ? `
            <div class="mt-3 flex flex-wrap gap-2">
              ${GO_WEEKDAY_KEYS.map((day) => chip(dayLabels[day], {
                active: days.includes(day),
                attr: "data-go-offer-day",
                value: day,
                escapeHtml
              })).join("")}
            </div>
            <div class="mt-3 grid grid-cols-2 gap-3">
              <input id="goOfferFrom" type="time" data-go-offer-from value="${esc(escapeHtml, editor.windowFrom || "14:00")}" class="${inputClass} mt-0" />
              <input id="goOfferTo" type="time" data-go-offer-to value="${esc(escapeHtml, editor.windowTo || "18:00")}" class="${inputClass} mt-0" />
            </div>
          ` : ""}
          ${errorFor("schedule") ? `<p class="mt-2 text-[11px] font-bold text-rose-500">${esc(escapeHtml, errorFor("schedule"))}</p>` : ""}
        </div>

        <div class="grid grid-cols-1 gap-4">
          <div>
            ${fieldLabel(escapeHtml, TEXTS.dateFrom, "goOfferStart")}
            <input id="goOfferStart" type="date" data-go-offer-start value="${esc(escapeHtml, draft.dateRange?.startDate || "")}" class="${inputClass}" />
          </div>
          <div>
            ${fieldLabel(escapeHtml, TEXTS.dateTo, "goOfferEnd")}
            <input id="goOfferEnd" type="date" data-go-offer-end value="${esc(escapeHtml, draft.dateRange?.endDate || "")}" class="${inputClass}" />
          </div>
        </div>

        <div>
          ${fieldLabel(escapeHtml, TEXTS.actionQuestion)}
          <div class="mt-2 flex flex-wrap gap-2">
            ${chip(TEXTS.onlyOffer, { active: draft.bookingType !== "reservation", attr: "data-go-offer-type", value: "claim", escapeHtml })}
            ${chip(TEXTS.offerAndTable, { active: draft.bookingType === "reservation", attr: "data-go-offer-type", value: "reservation", escapeHtml })}
          </div>
        </div>

        <div>
          ${fieldLabel(escapeHtml, TEXTS.limitsTitle)}
          <p class="mt-1 text-[10px] font-bold text-slate-400">${esc(escapeHtml, TEXTS.noLimit)}</p>
          <div class="mt-2 grid grid-cols-2 gap-3">
            ${["slotGroups", "slotGuests", "dailyGroups", "totalRedemptions"].map((key) => `
              <div>
                <span class="text-[10px] font-black text-slate-500">${esc(escapeHtml, TEXTS[key])}</span>
                <input type="number" min="0" step="1" data-go-offer-limit="${key}"
                  value="${esc(escapeHtml, draft.limits?.[key] ?? 0)}" class="${inputClass}" />
              </div>
            `).join("")}
          </div>
        </div>

        ${renderGoOfferPreviewCore({ offer: draft, businessName, deps })}

        ${editor.status ? `<p class="text-[11px] font-bold text-rose-500 text-center">${esc(escapeHtml, editor.status)}</p>` : ""}

        <div class="grid grid-cols-1 gap-2.5">
          <button type="button" data-go-offer-save ${editor.saving ? "disabled" : ""}
            class="w-full py-4 rounded-2xl bg-indigo-600 text-white font-black text-[11px] uppercase tracking-widest active:scale-[0.98] transition-transform ${editor.saving ? "opacity-60" : ""}">
            ${esc(escapeHtml, editor.saving ? TEXTS.saving : (isEdit ? TEXTS.save : TEXTS.activate))}
          </button>
          <button type="button" data-go-offer-cancel
            class="w-full py-4 rounded-2xl bg-white border border-slate-200 text-slate-500 font-black text-[11px] uppercase tracking-widest active:scale-[0.98] transition-transform">
            ${esc(escapeHtml, TEXTS.cancel)}
          </button>
        </div>
      </div>
    </div>
  `;
}

/**
 * Die GO-Seite des Lokals: Kennzahlen, Tab-Leiste, darunter die gewaehlte
 * Liste. Eine Seite wie der Ofertat-Editor, kein Overlay.
 */
export function renderGoAdminBodyCore({
  restaurantName = "",
  tab = "active",
  summary = {},
  bookings = [],
  offers = [],
  settings = {},
  paused = false,
  loading = false,
  error = "",
  deps = {}
} = {}) {
  const escapeHtml = deps.escapeHtml;
  const icon = deps.icon;
  const openBookings = bookings.filter((booking) => ["confirmed", "checked_in"].includes(booking.status));
  const pastBookings = bookings.filter((booking) => !["confirmed", "checked_in"].includes(booking.status));
  const liveOffers = offers.filter((offer) => offer.status !== "archived");

  let section = "";
  if (tab === "offers") {
    section = renderSection({
      eyebrow: TEXTS.brand,
      title: TEXTS.tabs.offers,
      sub: `${liveOffers.length} ${liveOffers.length === 1 ? "oferte" : "oferta"}`,
      action: `
        <button type="button" data-go-offer-new class="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow active:scale-95">
          ${safeIcon(icon, "plus", "w-4 h-4")}
        </button>
      `,
      body: liveOffers.length
        ? `<div class="space-y-3">${liveOffers.map((offer) => renderOfferRow(offer, deps)).join("")}</div>`
        : `<div class="text-center py-10 text-[10px] font-bold uppercase tracking-widest text-slate-300">${esc(escapeHtml, TEXTS.emptyTitle)}</div>`,
      deps
    });
  } else if (tab === "history") {
    section = renderSection({
      eyebrow: TEXTS.brand,
      title: TEXTS.tabs.history,
      sub: `${pastBookings.length}`,
      body: pastBookings.length
        ? `<div class="space-y-3">${pastBookings.map((booking) => renderBookingRow(booking, deps)).join("")}</div>`
        : `<div class="text-center py-10 text-[10px] font-bold uppercase tracking-widest text-slate-300">${esc(escapeHtml, TEXTS.noHistory)}</div>`,
      deps
    });
  } else if (tab === "options") {
    const pausedUntil = clock(settings?.pausedUntil);
    section = renderSection({
      eyebrow: TEXTS.brand,
      title: TEXTS.tabs.options,
      body: `
        <div class="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
          <div>
            <p class="text-xs font-black text-slate-800">${esc(escapeHtml, TEXTS.goOn)}</p>
            <p class="text-[10px] font-bold text-slate-400">${esc(escapeHtml, paused ? `${TEXTS.pausedUntil} ${pausedUntil}` : "ON")}</p>
          </div>
          <span class="text-[9px] font-black uppercase tracking-widest ${paused ? "text-amber-600" : "text-emerald-600"}">
            ${esc(escapeHtml, paused ? TEXTS.paused : TEXTS.statActive)}
          </span>
        </div>
        <div class="mt-4 flex flex-wrap gap-2">
          ${paused
            ? `<button type="button" data-go-pause="0" class="min-h-[44px] px-4 rounded-2xl bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest">${esc(escapeHtml, TEXTS.resume)}</button>`
            : [
              { value: "30", label: "30 min" },
              { value: "60", label: "1 orë" },
              { value: "tomorrow", label: "Deri nesër" },
              { value: "-1", label: "Pa afat" }
            ].map((entry) => `
              <button type="button" data-go-pause="${entry.value}"
                class="min-h-[44px] px-4 rounded-2xl bg-slate-50 border border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-600">${esc(escapeHtml, entry.label)}</button>
            `).join("")}
        </div>
        <p class="mt-4 text-[10px] font-bold text-slate-400">${esc(escapeHtml, TEXTS.keepsRunning)}</p>
      `,
      deps
    });
  } else {
    section = renderSection({
      eyebrow: TEXTS.brand,
      title: TEXTS.tabs.active,
      sub: `${openBookings.length}`,
      body: loading
        ? `<div class="text-center py-10 text-[10px] font-bold uppercase tracking-widest text-slate-400">${esc(escapeHtml, TEXTS.loading)}</div>`
        : (openBookings.length
          ? `<div class="space-y-3">${openBookings.map((booking) => renderBookingRow(booking, deps)).join("")}</div>`
          : `<div class="text-center py-10 text-[10px] font-bold uppercase tracking-widest text-slate-300">${esc(escapeHtml, TEXTS.noBookings)}</div>`),
      deps
    });
  }

  return `
    <div class="p-6 app-main-content-safe animate-in slide-in-from-right-10 duration-500" data-go-admin>
      <div class="flex items-end justify-between mb-6">
        <div>
          <span class="text-[9px] font-black text-indigo-600 uppercase tracking-widest">${esc(escapeHtml, TEXTS.brand)}</span>
          <h2 class="text-2xl font-black italic uppercase tracking-tighter">${esc(escapeHtml, TEXTS.editor)}</h2>
          <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">${esc(escapeHtml, restaurantName)}</p>
        </div>
      </div>

      ${renderGoKpiRow({ summary, deps })}
      ${renderGoTabs({ tab, deps })}
      ${section}
      ${error ? `<p class="text-center text-[10px] font-bold uppercase tracking-widest text-rose-500">${esc(escapeHtml, error)}</p>` : ""}
    </div>
  `;
}

export function renderGoAdminNoBusinessStateCore({ deps = {}, resolving = false } = {}) {
  const icon = deps.icon;
  const escapeHtml = deps.escapeHtml;
  if (resolving) {
    return `
      <div class="p-6 app-main-content-safe">
        <div class="bg-white rounded-[2.5rem] p-6 border border-slate-100 text-center">
          <p class="text-sm font-bold text-slate-500">${esc(escapeHtml, TEXTS.loadingBusiness)}</p>
        </div>
      </div>
    `;
  }
  return `
    <div class="p-6 app-main-content-safe">
      <div class="bg-white rounded-[2.5rem] p-8 border border-slate-100 text-center">
        <div class="w-16 h-16 rounded-[1.8rem] bg-slate-100 flex items-center justify-center text-slate-400 mx-auto mb-4">
          ${safeIcon(icon, "lock", "w-6 h-6")}
        </div>
        <h2 class="text-lg font-black italic text-slate-900 mb-2">${esc(escapeHtml, TEXTS.brand)}</h2>
        <p class="text-sm text-slate-500">${esc(escapeHtml, TEXTS.onlyBusiness)}</p>
      </div>
    </div>
  `;
}

export const BUSINESS_GO_TEXTS = TEXTS;
