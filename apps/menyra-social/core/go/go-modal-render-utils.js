// Mnyra GO - das Modal. Reines String-Rendering.
//
// Vier Bilder, mehr nicht:
//
//   search    Sa veta? Çka? Kur?          - zwei Tipps bis zum Ergebnis
//   results   "5 lokale kanë oferta për ju"
//   booking   "U krye 🎉"
//   error     "Mnyra GO është përkohësisht i padisponueshëm"
//
// Drei Dinge sind hier bewusst so und nicht anders:
//
//  1. Vorausgewaehlt ist alles, was vorausgewaehlt sein kann: "Krejt" und
//     "Tani". Wer zu viert essen gehen will, tippt auf "4" und auf "Shiko
//     ofertat" - fertig (Punkt 14).
//
//  2. Der Knopf heisst "Shiko ofertat", nicht "Anfrage senden". Es wartet
//     kein Lokal auf eine Antwort; die Angebote stehen schon da (Punkt 15).
//
//  3. Zwischen "wird gesendet" und "bestaetigt" wird nie geschummelt. Solange
//     der Server nicht geantwortet hat, steht "Po konfirmohet..." da - kein
//     Haken, kein Konfetti (Punkt 100, 140).

import {
  GO_BUDGET_LEVELS,
  GO_CATEGORIES,
  GO_PARTY_SIZE_OPTIONS,
  GO_WHEN_OPTIONS
} from "../../../../shared/go/go-feature-config.js";

const TEXTS = Object.freeze({
  brand: "MNYRA GO",
  mark: "⚡",
  close: "Mbyll",
  partyQuestion: "Sa veta jeni?",
  categoryQuestion: "Çka dëshironi?",
  whenQuestion: "Kur?",
  budgetToggle: "+ Shto buxhet",
  budgetQuestion: "Buxheti",
  locationLabel: "Vendndodhja",
  locationChange: "Ndrysho",
  submit: "Shiko ofertat",
  searching: "Po kërkojmë...",
  resultsHeadline: "lokale kanë oferta për ju",
  offering: "po ju ofron",
  forGroup: "për grupin tuaj",
  accept: "Prano ofertën",
  confirming: "Po konfirmohet...",
  sponsored: "Sponsored",
  onlyGo: "Vetëm me Mnyra GO",
  tableIncluded: "Tavolinë",
  emptyTitle: "Nuk gjetëm ofertë GO që përputhet tani.",
  emptySubtitle: "Lokale që mund t'ju pëlqejnë",
  doneTitle: "U krye 🎉",
  reservationConfirmed: "Tavolina është konfirmuar",
  claimConfirmed: "Oferta është e juaja",
  menu: "Shiko menunë",
  directions: "Udhëzime",
  code: "Kodi",
  cancel: "Anulo",
  cancelConfirm: "Dëshiron ta anulosh?",
  cancelYes: "Po, anuloje",
  cancelNo: "Jo",
  saveToAccount: "Ruaje në llogarinë tënde",
  signIn: "Hyr",
  errorTitle: "Mnyra GO është përkohësisht i padisponueshëm.",
  errorRetry: "Provo prapë",
  soldOut: "Kjo ofertë sapo u plotësua.",
  alternatives: "alternativa për ju",
  peopleSuffix: "persona",
  now: "Tani"
});

function esc(value = "") {
  return String(value === null || value === undefined ? "" : value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function chip(label, { active = false, attr = "", value = "", disabled = false } = {}) {
  // Grosse Pillen statt kleiner Auswahlfelder: GO wird mit dem Daumen bedient
  // (Punkt 143). Der aktive Zustand traegt zusaetzlich aria-pressed - Farbe
  // allein waere fuer manche keine Information (Punkt 142).
  return `
    <button
      type="button"
      ${attr ? `${attr}="${esc(value)}"` : ""}
      aria-pressed="${active ? "true" : "false"}"
      ${disabled ? "disabled" : ""}
      class="min-h-[44px] rounded-2xl px-4 py-2.5 text-sm font-black transition-colors ${active
        ? "bg-slate-900 text-white"
        : "bg-slate-100 text-slate-600"}"
    >${esc(label)}</button>
  `;
}

function arrivalLabel(value, { nowMs = Date.now() } = {}) {
  const ms = Date.parse(String(value || ""));
  if (!Number.isFinite(ms)) return "";
  if (Math.abs(ms - nowMs) < 15 * 60 * 1000) return TEXTS.now;
  const date = new Date(ms);
  return `Rreth ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

function renderSearchView(form = {}, texts = TEXTS) {
  const partySize = Math.max(1, Math.trunc(Number(form.partySize) || 2));
  const category = String(form.category || "all");
  const when = String(form.when || "now");
  const budget = String(form.budget || "");
  const showBudget = !!form.showBudget || !!budget;

  return `
    <div data-go-view="search">
      <h2 class="text-xl font-black tracking-tight text-slate-900">${esc(texts.partyQuestion)}</h2>
      <div class="mt-3 grid grid-cols-6 gap-2" role="group" aria-label="${esc(texts.partyQuestion)}">
        ${GO_PARTY_SIZE_OPTIONS.map((size) => chip(
          size >= 6 ? "6+" : String(size),
          { active: partySize === size, attr: "data-go-party", value: String(size) }
        )).join("")}
      </div>

      <h3 class="mt-6 text-sm font-black text-slate-900">${esc(texts.categoryQuestion)}</h3>
      <div class="mt-2 flex flex-wrap gap-2" role="group" aria-label="${esc(texts.categoryQuestion)}">
        ${GO_CATEGORIES.map((entry) => chip(
          entry.label,
          { active: category === entry.key, attr: "data-go-category", value: entry.key }
        )).join("")}
      </div>

      <h3 class="mt-6 text-sm font-black text-slate-900">${esc(texts.whenQuestion)}</h3>
      <div class="mt-2 flex flex-wrap gap-2" role="group" aria-label="${esc(texts.whenQuestion)}">
        ${GO_WHEN_OPTIONS.map((entry) => chip(
          entry.label,
          { active: when === entry.key, attr: "data-go-when", value: entry.key }
        )).join("")}
      </div>
      ${when === "later" ? `
        <label class="mt-3 block">
          <span class="sr-only">${esc(texts.whenQuestion)}</span>
          <input
            type="datetime-local"
            data-go-when-input
            value="${esc(form.laterValue || "")}"
            class="w-full rounded-2xl bg-slate-100 px-4 py-3 text-sm font-bold text-slate-900 outline-none"
          />
        </label>
      ` : ""}

      ${showBudget ? `
        <h3 class="mt-6 text-sm font-black text-slate-900">${esc(texts.budgetQuestion)}</h3>
        <div class="mt-2 flex flex-wrap gap-2" role="group" aria-label="${esc(texts.budgetQuestion)}">
          ${GO_BUDGET_LEVELS.map((entry) => chip(
            entry.label,
            { active: budget === entry.key, attr: "data-go-budget", value: entry.key }
          )).join("")}
        </div>
      ` : `
        <button type="button" data-go-budget-toggle class="mt-5 text-[12px] font-black text-slate-400">
          ${esc(texts.budgetToggle)}
        </button>
      `}

      <div class="mt-6 flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
        <span class="text-sm font-black text-slate-900">📍 ${esc(form.city || "")}</span>
        <button type="button" data-go-change-city class="text-[11px] font-black uppercase tracking-widest text-slate-400">
          ${esc(texts.locationChange)}
        </button>
      </div>

      <button
        type="button"
        data-go-submit
        class="mt-5 w-full rounded-2xl bg-slate-900 px-5 py-4 text-sm font-black text-white"
      >${esc(texts.submit)}</button>
    </div>
  `;
}

function renderResultCard(result = {}, { texts = TEXTS, busyOfferId = "", nowMs = Date.now() } = {}) {
  const isBusy = busyOfferId && busyOfferId === result.offerId;
  const distance = Number.isFinite(Number(result.distanceKm)) && result.distanceKm !== null
    ? `📍 ${Number(result.distanceKm).toFixed(1)} km`
    : "";
  const arrival = result.isNow ? texts.now : arrivalLabel(result.expectedArrivalAt, { nowMs });

  // Diese Karte darf nicht aussehen wie eine gewoehnliche Oferta: Oben steht,
  // wer anbietet, darunter, was dieser Gruppe angeboten wird (Punkt 19).
  return `
    <article class="rounded-[1.75rem] border border-slate-100 bg-white p-4" data-go-result="${esc(result.offerId)}">
      <div class="flex items-center gap-3">
        ${result.logoUrl
          ? `<img src="${esc(result.logoUrl)}" alt="" width="40" height="40" loading="lazy" decoding="async" class="h-10 w-10 rounded-2xl object-cover" />`
          : `<div class="h-10 w-10 rounded-2xl bg-slate-100"></div>`}
        <div class="min-w-0">
          <p class="truncate text-[13px] font-black text-slate-900">
            ${esc(result.businessName)} <span class="font-semibold text-slate-400">${esc(texts.offering)}</span>
          </p>
          ${result.sponsored ? `<p class="text-[10px] font-black uppercase tracking-widest text-slate-300">${esc(texts.sponsored)}</p>` : ""}
        </div>
      </div>

      <p class="mt-3 text-2xl font-black tracking-tight text-slate-900">${esc(result.benefitLabel)}</p>
      <p class="text-[13px] font-semibold text-slate-500">${esc(texts.forGroup)}</p>

      <div class="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] font-bold text-slate-500">
        <span>👥 ${esc(`${result.partySize} ${texts.peopleSuffix}`)}</span>
        ${arrival ? `<span>🕐 ${esc(arrival)}</span>` : ""}
        ${distance ? `<span>${esc(distance)}</span>` : ""}
        ${result.bookingType === "reservation" ? `<span>🪑 ${esc(texts.tableIncluded)}</span>` : ""}
      </div>

      <p class="mt-3 text-[10px] font-black uppercase tracking-widest text-slate-300">${esc(texts.onlyGo)}</p>

      <button
        type="button"
        data-go-accept="${esc(result.offerId)}"
        data-go-restaurant="${esc(result.restaurantId)}"
        ${isBusy ? "disabled" : ""}
        class="mt-3 w-full rounded-2xl bg-slate-900 px-5 py-3.5 text-sm font-black text-white disabled:opacity-60"
      >${esc(isBusy ? texts.confirming : texts.accept)}</button>
    </article>
  `;
}

function renderResultsView(state = {}, texts = TEXTS) {
  const results = Array.isArray(state.results) ? state.results : [];
  const nowMs = Number(state.nowMs) || Date.now();
  if (!results.length) {
    // Keine Sackgasse: Wenn nichts passt, steht darunter, was es sonst gibt
    // (Punkt 118).
    return `
      <div data-go-view="results">
        <h2 class="text-lg font-black tracking-tight text-slate-900">${esc(texts.emptyTitle)}</h2>
        <p class="mt-2 text-[13px] font-semibold text-slate-500">${esc(texts.emptySubtitle)}</p>
        <button type="button" data-go-back class="mt-5 w-full rounded-2xl bg-slate-100 px-5 py-3.5 text-sm font-black text-slate-700">
          ${esc(texts.submit)}
        </button>
      </div>
    `;
  }
  return `
    <div data-go-view="results">
      <h2 class="text-lg font-black tracking-tight text-slate-900">
        ${results.length} ${esc(texts.resultsHeadline)}
      </h2>
      ${state.notice ? `<p class="mt-2 rounded-2xl bg-amber-50 px-4 py-3 text-[13px] font-bold text-amber-700">${esc(state.notice)}</p>` : ""}
      <div class="mt-4 space-y-3">
        ${results.map((result) => renderResultCard(result, {
          texts,
          busyOfferId: state.busyOfferId,
          nowMs
        })).join("")}
      </div>
      <button type="button" data-go-back class="mt-5 w-full rounded-2xl bg-slate-100 px-5 py-3.5 text-sm font-black text-slate-700">
        ${esc(texts.whenQuestion)} / ${esc(texts.partyQuestion)}
      </button>
    </div>
  `;
}

function renderBookingView(state = {}, texts = TEXTS) {
  const booking = state.booking || {};
  const isReservation = booking.type === "reservation";
  const nowMs = Number(state.nowMs) || Date.now();
  const arrival = arrivalLabel(booking.expectedArrivalAt, { nowMs });
  const statusLine = String(state.statusLabel || "").trim()
    || (isReservation ? texts.reservationConfirmed : texts.claimConfirmed);

  if (state.confirmCancel) {
    return `
      <div data-go-view="booking">
        <h2 class="text-lg font-black tracking-tight text-slate-900">${esc(texts.cancelConfirm)}</h2>
        <div class="mt-5 grid grid-cols-2 gap-3">
          <button type="button" data-go-cancel-confirm class="rounded-2xl bg-slate-900 px-5 py-3.5 text-sm font-black text-white">
            ${esc(texts.cancelYes)}
          </button>
          <button type="button" data-go-cancel-dismiss class="rounded-2xl bg-slate-100 px-5 py-3.5 text-sm font-black text-slate-700">
            ${esc(texts.cancelNo)}
          </button>
        </div>
      </div>
    `;
  }

  return `
    <div data-go-view="booking">
      <p class="text-2xl font-black tracking-tight text-slate-900">${esc(texts.doneTitle)}</p>
      <p class="mt-4 text-lg font-black text-slate-900">${esc(booking.businessName || "")}</p>
      <p class="text-[15px] font-bold text-slate-600">${esc(booking.benefitLabel || "")}</p>

      <div class="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] font-bold text-slate-500">
        <span>👥 ${esc(`${booking.partySize || 1} ${texts.peopleSuffix}`)}</span>
        ${arrival ? `<span>🕐 ${esc(arrival)}</span>` : ""}
        ${booking.city ? `<span>📍 ${esc(booking.city)}</span>` : ""}
      </div>

      <p class="mt-4 rounded-2xl bg-emerald-50 px-4 py-3 text-[13px] font-black text-emerald-700">
        ✅ ${esc(statusLine)}
      </p>

      ${booking.shortCode ? `
        <div class="mt-3 rounded-2xl bg-slate-50 px-4 py-3">
          <p class="text-[10px] font-black uppercase tracking-widest text-slate-400">${esc(texts.code)}</p>
          <p class="mt-1 text-2xl font-black tracking-[0.3em] text-slate-900">${esc(booking.shortCode)}</p>
        </div>
      ` : ""}

      <div class="mt-4 grid grid-cols-2 gap-2">
        <button type="button" data-go-menu class="rounded-2xl bg-slate-100 px-4 py-3 text-[12px] font-black text-slate-700">
          ${esc(texts.menu)}
        </button>
        <button type="button" data-go-directions class="rounded-2xl bg-slate-100 px-4 py-3 text-[12px] font-black text-slate-700">
          ${esc(texts.directions)}
        </button>
      </div>

      ${state.canSignIn ? `
        <button type="button" data-go-signin class="mt-4 w-full rounded-2xl border border-slate-200 px-4 py-3 text-[12px] font-black text-slate-600">
          ${esc(texts.saveToAccount)} · ${esc(texts.signIn)}
        </button>
      ` : ""}

      <button type="button" data-go-cancel class="mt-4 w-full text-[12px] font-black text-slate-400">
        ${esc(texts.cancel)}
      </button>
    </div>
  `;
}

function renderErrorView(state = {}, texts = TEXTS) {
  const message = String(state.error || "").trim() || texts.errorTitle;
  return `
    <div data-go-view="error">
      <h2 class="text-lg font-black tracking-tight text-slate-900">${esc(message)}</h2>
      ${Array.isArray(state.alternatives) && state.alternatives.length ? `
        <p class="mt-4 text-[13px] font-black text-slate-500">
          ${state.alternatives.length} ${esc(texts.alternatives)}
        </p>
        <div class="mt-3 space-y-3">
          ${state.alternatives.map((result) => renderResultCard(result, { texts, nowMs: state.nowMs })).join("")}
        </div>
      ` : `
        <button type="button" data-go-retry class="mt-5 w-full rounded-2xl bg-slate-900 px-5 py-3.5 text-sm font-black text-white">
          ${esc(texts.errorRetry)}
        </button>
      `}
    </div>
  `;
}

function renderLoadingView(texts = TEXTS) {
  return `
    <div data-go-view="loading" class="py-10 text-center">
      <p class="text-sm font-black text-slate-400">${esc(texts.searching)}</p>
    </div>
  `;
}

/**
 * Das ganze Modal.
 *
 * @returns {string} HTML oder "" wenn geschlossen.
 */
export function renderGoModalCore(state = {}) {
  if (!state || !state.open) return "";
  const texts = { ...TEXTS, ...(state.texts || {}) };
  const view = String(state.view || "search");

  let body = "";
  if (view === "loading") body = renderLoadingView(texts);
  else if (view === "results") body = renderResultsView(state, texts);
  else if (view === "booking") body = renderBookingView(state, texts);
  else if (view === "error") body = renderErrorView(state, texts);
  else body = renderSearchView(state.form || {}, texts);

  // Auf dem Telefon ein Bottom Sheet, auf dem Schreibtisch ein zentriertes
  // Fenster - dieselbe Flaeche, zwei Groessen (Punkt 7).
  return `
    <div class="fixed inset-0 z-[75]" data-go-modal role="dialog" aria-modal="true" aria-label="${esc(texts.brand)}">
      <div class="absolute inset-0 bg-slate-900/50" data-go-close></div>
      <div class="absolute inset-x-0 bottom-0 max-h-[92vh] overflow-y-auto rounded-t-[2.5rem] bg-white px-5 pb-8 pt-4 md:inset-0 md:m-auto md:h-fit md:max-w-md md:rounded-[2.5rem]">
        <div class="mx-auto mb-4 h-1 w-10 rounded-full bg-slate-200 md:hidden"></div>
        <div class="mb-4 flex items-center justify-between">
          <span class="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
            <span aria-hidden="true">${esc(texts.mark)}</span>${esc(texts.brand)}
          </span>
          <button type="button" data-go-close class="min-h-[44px] px-2 text-[11px] font-black uppercase tracking-widest text-slate-400">
            ${esc(texts.close)}
          </button>
        </div>
        ${body}
      </div>
    </div>
  `;
}

export const GO_MODAL_TEXTS = TEXTS;
