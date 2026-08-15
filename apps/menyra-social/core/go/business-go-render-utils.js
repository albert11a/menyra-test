// Mnyra GO im Panel. Reines String-Rendering.
//
// Der Gedanke dahinter steht in der Spezifikation ganz am Ende: Fuer den Wirt
// darf GO sich nicht wie zusaetzliche Arbeit anfuehlen. Er stellt einmal ein,
// wann er welchen Deal geben will - und sieht danach nur noch, dass Gaeste
// kommen.
//
// Deshalb gibt es hier keinen "Prano"-Knopf (Punkt 61): Wer eine GO-Regel
// aktiviert hat, hat die Bedingungen bereits zugesagt. Eine zweite
// Bestaetigung wuerde den Gast wieder warten lassen - genau das, was GO
// abschaffen soll.
//
// Vier Seiten: Aktiv, Ofertat, Historiku, Opsionet.

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
  close: "Mbyll",
  emptyTitle: "Merr klientë kur ata janë gati të dalin.",
  emptyAction: "Aktivizo ofertën e parë",
  cardIdle: "Krijo oferta për klientët që kërkojnë tani.",
  cardManage: "Menaxho GO",
  tabs: { active: "Aktiv", offers: "Ofertat", history: "Historiku", options: "Opsionet" },
  statNew: "Të reja",
  statActive: "Aktive",
  statToday: "Sot",
  statGuests: "Gäste",
  guests: "Mysafirë",
  goOn: "GO Aktiv",
  pause: "Pauzo GO",
  resume: "Aktivizo GO",
  pausedUntil: "Pauzuar deri",
  createOffer: "+ Krijo ofertë GO",
  preview: "Kështu e sheh klienti",
  activate: "Aktivizo",
  save: "Ruaj",
  cancel: "Anulo",
  offering: "po ju ofron",
  forGroup: "për grupin tuaj",
  accept: "Prano ofertën",
  benefitQuestion: "Çka po ofron?",
  partyQuestion: "Për sa persona?",
  categoryQuestion: "Kategoria",
  scheduleQuestion: "Kur vlen?",
  always: "Gjithmonë",
  specificHours: "Orar specifik",
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
  guestName: "Mnyra Guest",
  table: "Tavolinë",
  markArrived: "Erdhën",
  markNotArrived: "Nuk erdhën",
  markDone: "Përfundo"
});

function esc(value = "") {
  return String(value === null || value === undefined ? "" : value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function clock(value = "") {
  const ms = Date.parse(String(value || ""));
  if (!Number.isFinite(ms)) return "";
  const date = new Date(ms);
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

/**
 * Die GO-Karte im Panel (Punkt 49, 50, 51).
 *
 * Das Abzeichen zaehlt NUR das Ungesehene. "3" heisst: drei Vorgaenge, die
 * das Lokal noch nicht angeschaut hat - nicht drei aktive Buchungen. Was
 * heute insgesamt laeuft, steht als Text daneben.
 */
export function renderBusinessGoCardCore({
  enabled = false,
  unseenCount = 0,
  activeOffers = 0,
  todayBookings = 0,
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
    <button
      type="button"
      data-go-business-open="active"
      class="mnyra-dash__composer mnyra-dash__composer--tap mnyra-dash__composer--plane"
      data-go-business-card
    >
      <span class="mnyra-dash__composer-title">
        <span class="mnyra-dash__composer-accent">${esc(labels.mark)} Mnyra</span> GO
        ${unseen > 0
          ? `<span class="ml-2 inline-flex min-w-[22px] items-center justify-center rounded-full bg-rose-500 px-1.5 py-0.5 text-[11px] font-black text-white" aria-label="${esc(`${unseen} ${labels.statNew}`)}">${unseen}</span>`
          : ""}
      </span>
      <span class="mnyra-dash__composer-sub">${esc(summary)}</span>
      <span class="mnyra-dash__composer-cta">
        <span class="mnyra-dash__composer-cta-label">${esc(hasActivity ? labels.cardManage : labels.emptyAction)}</span>
        <span class="mnyra-dash__composer-cta-chevron">→</span>
      </span>
    </button>
  `;
}

function renderStat(label, value) {
  return `
    <div class="rounded-2xl bg-slate-50 px-3 py-3 text-center">
      <p class="text-lg font-black text-slate-900">${esc(value)}</p>
      <p class="text-[10px] font-black uppercase tracking-widest text-slate-400">${esc(label)}</p>
    </div>
  `;
}

function renderBookingRow(booking = {}, texts = TEXTS) {
  const isTable = booking.type === "reservation";
  const arrival = clock(booking.expectedArrivalAt);
  // Der Vorteil steht in der eingefrorenen Kopie. Was das Lokal hier liest,
  // ist die Zusage von damals - nicht das heutige Angebot (Punkt 92).
  const benefitLabel = booking.benefitLabel || booking.snapshot?.benefitLabel || "";
  // Das Lokal braucht keine Mailadresse und keine Telefonnummer, um einen
  // Gast zu empfangen - ein Kurzcode reicht (Punkt 60).
  const name = `${texts.guestName} · ${booking.shortCode || ""}`.trim();
  return `
    <article class="rounded-2xl border border-slate-100 p-3 ${booking.businessSeenAt ? "" : "bg-indigo-50/40"}" data-go-booking="${esc(booking.id)}">
      <div class="flex items-center justify-between gap-2">
        <p class="text-[13px] font-black text-slate-900">GO #${esc(booking.shortCode || "")}</p>
        <span class="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-slate-500">
          ${esc(goBookingBusinessStatusLabel(booking))}
        </span>
      </div>
      <p class="mt-1 text-[12px] font-bold text-slate-500">${esc(name)}</p>
      <div class="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] font-bold text-slate-600">
        <span>👥 ${esc(`${booking.partySize || 1} ${texts.guests}`)}</span>
        ${arrival ? `<span>🕐 Rreth ${esc(arrival)}</span>` : ""}
        ${benefitLabel ? `<span>🎁 ${esc(benefitLabel)}</span>` : ""}
        ${isTable ? `<span>🪑 ${esc(texts.table)}</span>` : ""}
      </div>
      ${booking.status === "confirmed" ? `
        <div class="mt-3 flex flex-wrap gap-2">
          <button type="button" data-go-booking-action="checkin" data-go-booking-id="${esc(booking.id)}"
            class="rounded-xl bg-slate-900 px-3 py-2 text-[11px] font-black text-white">${esc(texts.markArrived)}</button>
          <button type="button" data-go-booking-action="notArrived" data-go-booking-id="${esc(booking.id)}"
            class="rounded-xl bg-slate-100 px-3 py-2 text-[11px] font-black text-slate-600">${esc(texts.markNotArrived)}</button>
        </div>
      ` : ""}
      ${booking.status === "checked_in" ? `
        <div class="mt-3">
          <button type="button" data-go-booking-action="complete" data-go-booking-id="${esc(booking.id)}"
            class="rounded-xl bg-slate-100 px-3 py-2 text-[11px] font-black text-slate-600">${esc(texts.markDone)}</button>
        </div>
      ` : ""}
    </article>
  `;
}

/**
 * Die Vorschau - genau die Karte, die der Gast spaeter sieht (Punkt 81).
 * Sie wird aus demselben Angebot gebaut wie das Ergebnis der Suche, damit
 * "so sieht es aus" auch wirklich stimmt.
 */
export function renderGoOfferPreviewCore({ offer = {}, businessName = "", texts = {} } = {}) {
  const labels = { ...TEXTS, ...(texts || {}) };
  return `
    <div class="rounded-[1.75rem] border border-slate-200 bg-white p-4" data-go-offer-preview>
      <p class="text-[10px] font-black uppercase tracking-widest text-slate-300">${esc(labels.preview)}</p>
      <p class="mt-2 text-[13px] font-black text-slate-900">
        ${esc(businessName)} <span class="font-semibold text-slate-400">${esc(labels.offering)}</span>
      </p>
      <p class="mt-2 text-2xl font-black tracking-tight text-slate-900">${esc(offer.benefitLabel || "")}</p>
      <p class="text-[13px] font-semibold text-slate-500">${esc(labels.forGroup)}</p>
      <p class="mt-2 text-[12px] font-bold text-slate-500">${esc(describeGoPartyRanges(offer))}</p>
      <p class="text-[12px] font-bold text-slate-500">${esc(describeGoSchedule(offer))}</p>
      <span class="mt-3 inline-flex rounded-2xl bg-slate-900 px-4 py-2.5 text-[12px] font-black text-white">
        ${esc(labels.accept)}
      </span>
    </div>
  `;
}

function chip(label, { active = false, attr = "", value = "" } = {}) {
  return `
    <button type="button" ${attr ? `${attr}="${esc(value)}"` : ""} aria-pressed="${active ? "true" : "false"}"
      class="min-h-[44px] rounded-2xl px-4 py-2.5 text-sm font-black ${active ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600"}">
      ${esc(label)}
    </button>
  `;
}

export function renderGoOfferEditorCore({ draft = {}, businessName = "", errors = [], texts = {} } = {}) {
  const labels = { ...TEXTS, ...(texts || {}) };
  const partyRanges = Array.isArray(draft.partyRanges) ? draft.partyRanges : [];
  const days = Array.isArray(draft.schedule?.days) ? draft.schedule.days : [];
  const scheduleMode = draft.schedule?.mode === "windows" ? "windows" : "always";
  const dayLabels = { mon: "Hën", tue: "Mar", wed: "Mër", thu: "Enj", fri: "Pre", sat: "Sht", sun: "Die" };
  const errorFor = (field) => (errors || []).find((entry) => entry.field === field)?.message || "";

  return `
    <div data-go-offer-editor>
      <h3 class="text-sm font-black text-slate-900">${esc(labels.benefitQuestion)}</h3>
      <div class="mt-2 flex flex-wrap gap-2">
        ${GO_BENEFIT_KINDS.map((entry) => chip(entry.label, {
          active: (draft.benefit?.kind || "percent") === entry.key,
          attr: "data-go-benefit-kind",
          value: entry.key
        })).join("")}
      </div>
      <div class="mt-3 grid gap-2">
        ${(draft.benefit?.kind || "percent") === "percent" ? `
          <input type="number" min="1" max="90" data-go-benefit-percent value="${esc(draft.benefit?.percent || 10)}"
            class="w-full rounded-2xl bg-slate-100 px-4 py-3 text-sm font-bold text-slate-900 outline-none" />
        ` : `
          <input type="text" data-go-benefit-item placeholder="Cookie, Cappuccino..." value="${esc(draft.benefit?.itemName || "")}"
            class="w-full rounded-2xl bg-slate-100 px-4 py-3 text-sm font-bold text-slate-900 outline-none" />
          <input type="text" data-go-benefit-price placeholder="2,50 €" value="${esc(draft.benefit?.priceText || "")}"
            class="w-full rounded-2xl bg-slate-100 px-4 py-3 text-sm font-bold text-slate-900 outline-none" />
        `}
        <input type="text" data-go-benefit-text placeholder="${esc(labels.benefitQuestion)}" value="${esc(draft.benefit?.text || "")}"
          class="w-full rounded-2xl bg-slate-50 px-4 py-3 text-sm font-bold text-slate-900 outline-none" />
      </div>
      ${errorFor("benefit") ? `<p class="mt-1 text-[12px] font-bold text-rose-600">${esc(errorFor("benefit"))}</p>` : ""}

      <h3 class="mt-6 text-sm font-black text-slate-900">${esc(labels.partyQuestion)}</h3>
      <div class="mt-2 flex flex-wrap gap-2">
        ${GO_PARTY_RANGES.map((entry) => chip(entry.label, {
          active: partyRanges.includes(entry.key),
          attr: "data-go-offer-party",
          value: entry.key
        })).join("")}
      </div>

      <h3 class="mt-6 text-sm font-black text-slate-900">${esc(labels.categoryQuestion)}</h3>
      <div class="mt-2 flex flex-wrap gap-2">
        ${GO_CATEGORIES.map((entry) => chip(entry.label, {
          active: (draft.category || "all") === entry.key,
          attr: "data-go-offer-category",
          value: entry.key
        })).join("")}
      </div>

      <h3 class="mt-6 text-sm font-black text-slate-900">${esc(labels.scheduleQuestion)}</h3>
      <div class="mt-2 flex flex-wrap gap-2">
        ${chip(labels.always, { active: scheduleMode === "always", attr: "data-go-offer-schedule", value: "always" })}
        ${chip(labels.specificHours, { active: scheduleMode === "windows", attr: "data-go-offer-schedule", value: "windows" })}
      </div>
      ${scheduleMode === "windows" ? `
        <div class="mt-3 flex flex-wrap gap-2">
          ${GO_WEEKDAY_KEYS.map((day) => chip(dayLabels[day], {
            active: days.includes(day),
            attr: "data-go-offer-day",
            value: day
          })).join("")}
        </div>
        <div class="mt-3 grid grid-cols-2 gap-2">
          <input type="time" data-go-offer-from value="${esc(draft.windowFrom || "14:00")}"
            class="rounded-2xl bg-slate-100 px-4 py-3 text-sm font-bold text-slate-900 outline-none" />
          <input type="time" data-go-offer-to value="${esc(draft.windowTo || "18:00")}"
            class="rounded-2xl bg-slate-100 px-4 py-3 text-sm font-bold text-slate-900 outline-none" />
        </div>
      ` : ""}
      ${errorFor("schedule") ? `<p class="mt-1 text-[12px] font-bold text-rose-600">${esc(errorFor("schedule"))}</p>` : ""}

      <div class="mt-3 grid grid-cols-2 gap-2">
        <input type="date" data-go-offer-start value="${esc(draft.dateRange?.startDate || "")}"
          class="rounded-2xl bg-slate-50 px-4 py-3 text-sm font-bold text-slate-900 outline-none" />
        <input type="date" data-go-offer-end value="${esc(draft.dateRange?.endDate || "")}"
          class="rounded-2xl bg-slate-50 px-4 py-3 text-sm font-bold text-slate-900 outline-none" />
      </div>

      <h3 class="mt-6 text-sm font-black text-slate-900">${esc(labels.actionQuestion)}</h3>
      <div class="mt-2 flex flex-wrap gap-2">
        ${chip(labels.onlyOffer, { active: draft.bookingType !== "reservation", attr: "data-go-offer-type", value: "claim" })}
        ${chip(labels.offerAndTable, { active: draft.bookingType === "reservation", attr: "data-go-offer-type", value: "reservation" })}
      </div>

      <h3 class="mt-6 text-sm font-black text-slate-900">${esc(labels.limitsTitle)}</h3>
      <p class="text-[11px] font-bold text-slate-400">${esc(labels.noLimit)}</p>
      <div class="mt-2 grid grid-cols-2 gap-2">
        ${["slotGroups", "slotGuests", "dailyGroups", "totalRedemptions"].map((key) => `
          <label class="block">
            <span class="text-[11px] font-black text-slate-500">${esc(labels[key])}</span>
            <input type="number" min="0" data-go-offer-limit="${key}" value="${esc(draft.limits?.[key] ?? 0)}"
              class="mt-1 w-full rounded-2xl bg-slate-100 px-4 py-3 text-sm font-bold text-slate-900 outline-none" />
          </label>
        `).join("")}
      </div>

      <div class="mt-6">
        ${renderGoOfferPreviewCore({ offer: draft, businessName, texts: labels })}
      </div>

      <div class="mt-4 grid grid-cols-2 gap-2">
        <button type="button" data-go-offer-save class="rounded-2xl bg-slate-900 px-4 py-3.5 text-sm font-black text-white">
          ${esc(draft.id ? labels.save : labels.activate)}
        </button>
        <button type="button" data-go-offer-cancel class="rounded-2xl bg-slate-100 px-4 py-3.5 text-sm font-black text-slate-600">
          ${esc(labels.cancel)}
        </button>
      </div>
    </div>
  `;
}

function renderOfferRow(offer = {}, texts = TEXTS) {
  const badge = offer.status === "paused" ? texts.paused : (offer.status === "archived" ? texts.archived : "");
  return `
    <article class="rounded-2xl border border-slate-100 p-3" data-go-offer="${esc(offer.id)}">
      <div class="flex items-center justify-between gap-2">
        <p class="text-[15px] font-black text-slate-900">${esc(offer.benefitLabel || "")}</p>
        ${badge ? `<span class="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-slate-500">${esc(badge)}</span>` : ""}
      </div>
      <p class="mt-1 text-[12px] font-bold text-slate-500">
        ${esc(describeGoPartyRanges(offer))} · ${esc(describeGoSchedule(offer))}
      </p>
      <div class="mt-3 flex flex-wrap gap-2">
        <button type="button" data-go-offer-edit="${esc(offer.id)}" class="rounded-xl bg-slate-100 px-3 py-2 text-[11px] font-black text-slate-600">
          ${esc(texts.save)}
        </button>
        <button type="button" data-go-offer-toggle="${esc(offer.id)}" class="rounded-xl bg-slate-100 px-3 py-2 text-[11px] font-black text-slate-600">
          ${esc(offer.status === "active" ? texts.paused : texts.activate)}
        </button>
        <button type="button" data-go-offer-archive="${esc(offer.id)}" class="rounded-xl bg-slate-100 px-3 py-2 text-[11px] font-black text-slate-400">
          ${esc(texts.archive)}
        </button>
      </div>
    </article>
  `;
}

/**
 * Die GO-Seite des Lokals.
 *
 * Sie haengt in einem eigenen Container am Dokument, nicht im Renderbaum der
 * App - aus demselben Grund wie das Gast-Modal: Ein Fehler in GO darf das
 * Panel nicht mitnehmen.
 */
export function renderBusinessGoPanelCore(state = {}) {
  if (!state || !state.open) return "";
  const texts = { ...TEXTS, ...(state.texts || {}) };
  const tab = String(state.tab || "active");
  const summary = state.summary || {};
  const bookings = Array.isArray(state.bookings) ? state.bookings : [];
  const offers = Array.isArray(state.offers) ? state.offers : [];

  let body = "";
  if (state.editor) {
    body = renderGoOfferEditorCore({
      draft: state.editor,
      businessName: state.businessName,
      errors: state.editorErrors,
      texts
    });
  } else if (tab === "offers") {
    body = `
      <button type="button" data-go-offer-new class="w-full rounded-2xl bg-slate-900 px-4 py-3.5 text-sm font-black text-white">
        ${esc(texts.createOffer)}
      </button>
      <div class="mt-3 space-y-3">
        ${offers.filter((offer) => offer.status !== "archived").map((offer) => renderOfferRow(offer, texts)).join("")}
      </div>
    `;
  } else if (tab === "history") {
    const past = bookings.filter((booking) => !["confirmed", "checked_in"].includes(booking.status));
    body = past.length
      ? `<div class="space-y-3">${past.map((booking) => renderBookingRow(booking, texts)).join("")}</div>`
      : `<p class="py-8 text-center text-sm font-black text-slate-400">${esc(texts.noHistory)}</p>`;
  } else if (tab === "options") {
    const pausedUntil = clock(state.settings?.pausedUntil);
    body = `
      <div class="rounded-2xl border border-slate-100 p-4">
        <div class="flex items-center justify-between">
          <p class="text-sm font-black text-slate-900">${esc(texts.goOn)}</p>
          <span class="rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest ${state.paused ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"}">
            ${esc(state.paused ? `${texts.pausedUntil} ${pausedUntil}` : "ON")}
          </span>
        </div>
        <div class="mt-3 flex flex-wrap gap-2">
          ${state.paused
            ? `<button type="button" data-go-pause="0" class="rounded-xl bg-slate-900 px-3 py-2 text-[11px] font-black text-white">${esc(texts.resume)}</button>`
            : [
              { minutes: 30, label: "30 min" },
              { minutes: 60, label: "1 orë" },
              { minutes: 0, label: "Deri nesër", untilTomorrow: true },
              { minutes: -1, label: "Pa afat" }
            ].map((entry) => `
              <button type="button" data-go-pause="${entry.untilTomorrow ? "tomorrow" : entry.minutes}"
                class="rounded-xl bg-slate-100 px-3 py-2 text-[11px] font-black text-slate-600">${esc(entry.label)}</button>
            `).join("")}
        </div>
        <p class="mt-3 text-[11px] font-bold text-slate-400">
          Rezervimet ekzistuese mbeten. Vetëm të rejat ndalen.
        </p>
      </div>
    `;
  } else {
    const open = bookings.filter((booking) => ["confirmed", "checked_in"].includes(booking.status));
    body = open.length
      ? `<div class="space-y-3">${open.map((booking) => renderBookingRow(booking, texts)).join("")}</div>`
      : `<p class="py-8 text-center text-sm font-black text-slate-400">${esc(texts.noBookings)}</p>`;
  }

  const tabKeys = [["active", texts.tabs.active], ["offers", texts.tabs.offers], ["history", texts.tabs.history], ["options", texts.tabs.options]];

  return `
    <div class="fixed inset-0 z-[75]" data-go-business-panel role="dialog" aria-modal="true" aria-label="${esc(texts.brand)}">
      <div class="absolute inset-0 bg-slate-900/50" data-go-business-close></div>
      <div class="absolute inset-x-0 bottom-0 top-8 overflow-y-auto rounded-t-[2.5rem] bg-white px-5 pb-10 pt-4 md:inset-8 md:m-auto md:max-w-lg md:rounded-[2.5rem]">
        <div class="mb-4 flex items-center justify-between">
          <span class="inline-flex items-center gap-1.5 text-sm font-black text-slate-900">
            <span aria-hidden="true">${esc(texts.mark)}</span>${esc(texts.brand)}
          </span>
          <button type="button" data-go-business-close class="min-h-[44px] px-2 text-[11px] font-black uppercase tracking-widest text-slate-400">
            ${esc(texts.close)}
          </button>
        </div>

        <div class="grid grid-cols-4 gap-2">
          ${renderStat(texts.statNew, summary.unseen || 0)}
          ${renderStat(texts.statActive, summary.open || 0)}
          ${renderStat(texts.statToday, summary.today || 0)}
          ${renderStat(texts.guests, summary.guests || 0)}
        </div>

        <div class="mt-4 flex gap-2 overflow-x-auto" role="tablist">
          ${tabKeys.map(([key, label]) => `
            <button type="button" role="tab" aria-selected="${tab === key ? "true" : "false"}" data-go-business-tab="${key}"
              class="min-h-[44px] whitespace-nowrap rounded-2xl px-4 py-2.5 text-[12px] font-black ${tab === key ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600"}">
              ${esc(label)}
            </button>
          `).join("")}
        </div>

        ${state.error ? `<p class="mt-4 rounded-2xl bg-rose-50 px-4 py-3 text-[13px] font-bold text-rose-700">${esc(state.error)}</p>` : ""}

        <div class="mt-4">
          ${state.loading ? `<p class="py-8 text-center text-sm font-black text-slate-400">...</p>` : body}
        </div>
      </div>
    </div>
  `;
}

export const BUSINESS_GO_TEXTS = TEXTS;
