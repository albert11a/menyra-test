// Mnyra GO - das Modal. Reines String-Rendering.
//
// Es traegt dieselbe Form wie das Posto-Modal des Business-Composers
// (core/composer/business-composer-controller.js): eine weisse Flaeche ueber
// der ganzen Seite, oben eine Zeile mit Schliessen links, Titel in der Mitte
// und der Handlung rechts, darunter der scrollende Inhalt. Auf dem
// Schreibtisch bleibt die Flaeche in der Mitte stehen.
//
// Warum abgeschrieben und nicht neu erfunden: Mnyra hat bereits ein Modal,
// das der Nutzer kennt. Ein zweites mit eigenen Rundungen, eigener Kopfzeile
// und eigenem Verhalten waere kein neues Feature, sondern eine zweite App im
// selben Fenster. Die Klassen heissen `mnyra-go__*` statt `mnyra-bc__*`, das
// Raster dahinter ist dasselbe.
//
// Vier Bilder, mehr nicht:
//
//   search    Sa veta? Çka? Kur?          - zwei Tipps bis zum Ergebnis
//   results   "5 lokale kanë oferta për ju"
//   booking   "U krye 🎉"
//   error     "Mnyra GO është përkohësisht i padisponueshëm"
//
// Drei Dinge sind bewusst so und nicht anders:
//
//  1. Vorausgewaehlt ist alles, was vorausgewaehlt sein kann: "Krejt" und
//     "Tani" (Punkt 14).
//  2. Der Knopf heisst "Shiko ofertat", nicht "Anfrage senden" (Punkt 15).
//  3. Zwischen "wird gesendet" und "bestaetigt" wird nie geschummelt: solange
//     der Server nicht geantwortet hat, steht "Po konfirmohet..." da
//     (Punkt 100, 140).

import {
  GO_BUDGET_LEVELS,
  GO_CATEGORIES,
  GO_PARTY_SIZE_OPTIONS,
  GO_WHEN_OPTIONS
} from "../../../../shared/go/go-feature-config.js";

export const GO_MODAL_STYLE_ELEMENT_ID = "mnyraGoModalStyles";
export const GO_MODAL_ROOT_ELEMENT_ID = "mnyraGoOverlayRoot";
export const GO_MODAL_SURFACE_COLOR = "#ffffff";

// Dieselben Marken wie im Composer, damit beide Modale dieselbe Flaeche,
// dieselbe Kopfzeile und dieselben Abstaende haben.
export const GO_MODAL_CSS = `
.mnyra-go {
  position: fixed;
  inset: 0;
  z-index: 90;
  --go-ink: #0f172a;
  --go-ink-2: #475569;
  --go-muted: #94a3b8;
  --go-line: rgba(15, 23, 42, 0.08);
  --go-plane: #f8fafc;
  --go-accent: #4f46e5;
  --go-accent-soft: #eef2ff;
  --modal-surface: #ffffff;
  background: #ffffff;
  color: var(--go-ink);
  font-family: inherit;
  -webkit-tap-highlight-color: transparent;
}
.mnyra-go * { box-sizing: border-box; }
.mnyra-go__sheet {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  background: #ffffff;
  padding-top: var(--safe-area-top, 0px);
  padding-left: var(--safe-area-left, 0px);
  padding-right: var(--safe-area-right, 0px);
  overflow: hidden;
}
.mnyra-go__head {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 10px 14px;
  border-bottom: 1px solid var(--go-line);
  background: #ffffff;
}
.mnyra-go__x {
  width: 40px;
  height: 40px;
  flex: 0 0 auto;
  border: none;
  border-radius: 14px;
  background: var(--go-plane);
  color: var(--go-ink);
  font-size: 18px;
  font-weight: 900;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}
.mnyra-go__x:active { transform: scale(0.94); }
.mnyra-go__title {
  flex: 1;
  min-width: 0;
  text-align: center;
  font-size: 15px;
  font-weight: 900;
  letter-spacing: -0.01em;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.mnyra-go__action {
  flex: 0 0 auto;
  min-width: 88px;
  height: 40px;
  padding: 0 18px;
  border: none;
  border-radius: 999px;
  background: var(--go-accent);
  color: #ffffff;
  font-size: 12px;
  font-weight: 900;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: opacity 0.15s ease, transform 0.15s ease;
}
.mnyra-go__action:disabled { background: #e2e8f0; color: #94a3b8; cursor: not-allowed; }
.mnyra-go__action:not(:disabled):active { transform: scale(0.96); }
.mnyra-go__action--ghost { min-width: 40px; background: transparent; color: var(--go-muted); }
.mnyra-go__body {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior: contain;
  padding: 16px 16px calc(var(--safe-area-bottom, 0px) + 24px);
}
.mnyra-go__q {
  margin: 0 0 10px;
  font-size: 17px;
  font-weight: 900;
  letter-spacing: -0.02em;
}
.mnyra-go__q--sub { margin-top: 22px; font-size: 13px; }
.mnyra-go__chips { display: flex; flex-wrap: wrap; gap: 8px; }
.mnyra-go__chips--party { display: grid; grid-template-columns: repeat(6, minmax(0, 1fr)); }
/* Die Auswahlflaechen sind Pillen, keine Dropdowns - GO wird mit dem Daumen
   bedient, und 44px sind die kleinste Flaeche, die sicher zu treffen ist
   (Punkt 143). */
.mnyra-go__chip {
  min-height: 44px;
  padding: 0 16px;
  border: none;
  border-radius: 16px;
  background: var(--go-plane);
  color: var(--go-ink-2);
  font-size: 14px;
  font-weight: 900;
  cursor: pointer;
  transition: background 0.15s ease, color 0.15s ease;
}
.mnyra-go__chip[aria-pressed="true"] { background: var(--go-ink); color: #ffffff; }
.mnyra-go__chip:active { transform: scale(0.97); }
.mnyra-go__field {
  width: 100%;
  min-height: 48px;
  margin-top: 10px;
  padding: 0 14px;
  border: none;
  border-radius: 16px;
  background: var(--go-plane);
  color: var(--go-ink);
  font-size: 14px;
  font-weight: 700;
  font-family: inherit;
}
.mnyra-go__ghost {
  margin-top: 18px;
  border: none;
  background: transparent;
  color: var(--go-muted);
  font-size: 12px;
  font-weight: 900;
  cursor: pointer;
  padding: 0;
}
.mnyra-go__place {
  margin-top: 22px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 12px 14px;
  border-radius: 18px;
  background: var(--go-plane);
  font-size: 14px;
  font-weight: 900;
}
.mnyra-go__place-change {
  border: none;
  background: transparent;
  color: var(--go-muted);
  font-size: 11px;
  font-weight: 900;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  cursor: pointer;
}
.mnyra-go__cta {
  width: 100%;
  min-height: 52px;
  margin-top: 22px;
  border: none;
  border-radius: 18px;
  background: var(--go-ink);
  color: #ffffff;
  font-size: 14px;
  font-weight: 900;
  cursor: pointer;
}
.mnyra-go__cta--quiet { background: var(--go-plane); color: var(--go-ink-2); }
.mnyra-go__cta:disabled { opacity: 0.6; cursor: not-allowed; }
.mnyra-go__hint { margin: 8px 0 0; font-size: 13px; font-weight: 700; color: var(--go-ink-2); }
.mnyra-go__note {
  margin-top: 14px;
  padding: 12px 14px;
  border-radius: 16px;
  background: #fffbeb;
  color: #b45309;
  font-size: 13px;
  font-weight: 700;
}
/* Die Ergebniskarte. Sie darf nicht aussehen wie eine gewoehnliche Oferta:
   oben steht, WER anbietet, darunter, was DIESER Gruppe angeboten wird
   (Punkt 19). */
.mnyra-go__card {
  margin-top: 12px;
  padding: 16px;
  border: 1px solid var(--go-line);
  border-radius: 28px;
  background: #ffffff;
}
.mnyra-go__card-head { display: flex; align-items: center; gap: 10px; }
.mnyra-go__card-logo { width: 40px; height: 40px; border-radius: 14px; object-fit: cover; background: var(--go-plane); flex: 0 0 auto; }
.mnyra-go__card-who { min-width: 0; font-size: 13px; font-weight: 900; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.mnyra-go__card-who span { color: var(--go-muted); font-weight: 700; }
.mnyra-go__card-sponsored { font-size: 9px; font-weight: 900; letter-spacing: 0.12em; text-transform: uppercase; color: #cbd5e1; }
.mnyra-go__card-benefit { margin: 12px 0 0; font-size: 26px; font-weight: 900; letter-spacing: -0.03em; }
.mnyra-go__card-for { margin: 2px 0 0; font-size: 13px; font-weight: 700; color: var(--go-ink-2); }
.mnyra-go__card-meta { margin-top: 12px; display: flex; flex-wrap: wrap; gap: 4px 12px; font-size: 12px; font-weight: 700; color: var(--go-ink-2); }
.mnyra-go__card-only { margin: 12px 0 0; font-size: 9px; font-weight: 900; letter-spacing: 0.12em; text-transform: uppercase; color: #cbd5e1; }
.mnyra-go__done { margin: 0; font-size: 26px; font-weight: 900; letter-spacing: -0.03em; }
.mnyra-go__done-name { margin: 16px 0 0; font-size: 19px; font-weight: 900; letter-spacing: -0.02em; }
.mnyra-go__ok {
  margin-top: 16px;
  padding: 12px 14px;
  border-radius: 16px;
  background: #ecfdf5;
  color: #047857;
  font-size: 13px;
  font-weight: 900;
}
.mnyra-go__code {
  margin-top: 12px;
  padding: 12px 14px;
  border-radius: 16px;
  background: var(--go-plane);
}
.mnyra-go__code-label { margin: 0; font-size: 9px; font-weight: 900; letter-spacing: 0.12em; text-transform: uppercase; color: var(--go-muted); }
.mnyra-go__code-value { margin: 4px 0 0; font-size: 26px; font-weight: 900; letter-spacing: 0.3em; }
.mnyra-go__row { margin-top: 16px; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; }
.mnyra-go__row .mnyra-go__cta { margin-top: 0; min-height: 48px; font-size: 13px; }
.mnyra-go__empty { padding: 32px 0; text-align: center; font-size: 14px; font-weight: 900; color: var(--go-muted); }
@media (min-width: 768px) {
  .mnyra-go__sheet { max-width: 560px; margin: 0 auto; }
}
@media (prefers-reduced-motion: reduce) {
  .mnyra-go__chip, .mnyra-go__action, .mnyra-go__x { transition: none; }
}
`;

const TEXTS = Object.freeze({
  brand: "Mnyra GO",
  mark: "⚡",
  close: "Mbyll",
  titleSearch: "Mnyra GO",
  titleResults: "Ofertat për ju",
  titleBooking: "Rezervimi juaj",
  partyQuestion: "Sa veta jeni?",
  categoryQuestion: "Çka dëshironi?",
  whenQuestion: "Kur?",
  budgetToggle: "+ Shto buxhet",
  budgetQuestion: "Buxheti",
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
  alternatives: "alternativa për ju",
  peopleSuffix: "persona",
  now: "Tani",
  back: "Ndrysho kërkimin"
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
  // aria-pressed traegt die Auswahl zusaetzlich zur Farbe - Farbe allein ist
  // fuer manche Menschen keine Information (Punkt 142).
  return `
    <button
      type="button"
      class="mnyra-go__chip"
      ${attr ? `${attr}="${esc(value)}"` : ""}
      aria-pressed="${active ? "true" : "false"}"
      ${disabled ? "disabled" : ""}
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

function renderSearchBody(form = {}, texts = TEXTS) {
  const partySize = Math.max(1, Math.trunc(Number(form.partySize) || 2));
  const category = String(form.category || "all");
  const when = String(form.when || "now");
  const budget = String(form.budget || "");
  const showBudget = !!form.showBudget || !!budget;

  return `
    <div data-go-view="search">
      <h2 class="mnyra-go__q">${esc(texts.partyQuestion)}</h2>
      <div class="mnyra-go__chips mnyra-go__chips--party" role="group" aria-label="${esc(texts.partyQuestion)}">
        ${GO_PARTY_SIZE_OPTIONS.map((size) => chip(
          size >= 6 ? "6+" : String(size),
          { active: partySize === size, attr: "data-go-party", value: String(size) }
        )).join("")}
      </div>

      <h3 class="mnyra-go__q mnyra-go__q--sub">${esc(texts.categoryQuestion)}</h3>
      <div class="mnyra-go__chips" role="group" aria-label="${esc(texts.categoryQuestion)}">
        ${GO_CATEGORIES.map((entry) => chip(
          entry.label,
          { active: category === entry.key, attr: "data-go-category", value: entry.key }
        )).join("")}
      </div>

      <h3 class="mnyra-go__q mnyra-go__q--sub">${esc(texts.whenQuestion)}</h3>
      <div class="mnyra-go__chips" role="group" aria-label="${esc(texts.whenQuestion)}">
        ${GO_WHEN_OPTIONS.map((entry) => chip(
          entry.label,
          { active: when === entry.key, attr: "data-go-when", value: entry.key }
        )).join("")}
      </div>
      ${when === "later" ? `
        <input
          type="datetime-local"
          class="mnyra-go__field"
          data-go-when-input
          value="${esc(form.laterValue || "")}"
          aria-label="${esc(texts.whenQuestion)}"
        />
      ` : ""}

      ${showBudget ? `
        <h3 class="mnyra-go__q mnyra-go__q--sub">${esc(texts.budgetQuestion)}</h3>
        <div class="mnyra-go__chips" role="group" aria-label="${esc(texts.budgetQuestion)}">
          ${GO_BUDGET_LEVELS.map((entry) => chip(
            entry.label,
            { active: budget === entry.key, attr: "data-go-budget", value: entry.key }
          )).join("")}
        </div>
      ` : `
        <button type="button" class="mnyra-go__ghost" data-go-budget-toggle>${esc(texts.budgetToggle)}</button>
      `}

      <div class="mnyra-go__place">
        <span>📍 ${esc(form.city || "")}</span>
        <button type="button" class="mnyra-go__place-change" data-go-change-city>${esc(texts.locationChange)}</button>
      </div>

      <button type="button" class="mnyra-go__cta" data-go-submit>${esc(texts.submit)}</button>
    </div>
  `;
}

function renderResultCard(result = {}, { texts = TEXTS, busyOfferId = "", nowMs = Date.now() } = {}) {
  const isBusy = busyOfferId && busyOfferId === result.offerId;
  const distance = Number.isFinite(Number(result.distanceKm)) && result.distanceKm !== null
    ? `📍 ${Number(result.distanceKm).toFixed(1)} km`
    : "";
  const arrival = result.isNow ? texts.now : arrivalLabel(result.expectedArrivalAt, { nowMs });

  return `
    <article class="mnyra-go__card" data-go-result="${esc(result.offerId)}">
      <div class="mnyra-go__card-head">
        ${result.logoUrl
          ? `<img class="mnyra-go__card-logo" src="${esc(result.logoUrl)}" alt="" width="40" height="40" loading="lazy" decoding="async" />`
          : `<div class="mnyra-go__card-logo"></div>`}
        <div class="min-w-0">
          <p class="mnyra-go__card-who">${esc(result.businessName)} <span>${esc(texts.offering)}</span></p>
          ${result.sponsored ? `<p class="mnyra-go__card-sponsored">${esc(texts.sponsored)}</p>` : ""}
        </div>
      </div>

      <p class="mnyra-go__card-benefit">${esc(result.benefitLabel)}</p>
      <p class="mnyra-go__card-for">${esc(texts.forGroup)}</p>

      <div class="mnyra-go__card-meta">
        <span>👥 ${esc(`${result.partySize} ${texts.peopleSuffix}`)}</span>
        ${arrival ? `<span>🕐 ${esc(arrival)}</span>` : ""}
        ${distance ? `<span>${esc(distance)}</span>` : ""}
        ${result.bookingType === "reservation" ? `<span>🪑 ${esc(texts.tableIncluded)}</span>` : ""}
      </div>

      <p class="mnyra-go__card-only">${esc(texts.onlyGo)}</p>

      <button
        type="button"
        class="mnyra-go__cta"
        data-go-accept="${esc(result.offerId)}"
        data-go-restaurant="${esc(result.restaurantId)}"
        ${isBusy ? "disabled" : ""}
      >${esc(isBusy ? texts.confirming : texts.accept)}</button>
    </article>
  `;
}

function renderResultsBody(state = {}, texts = TEXTS) {
  const results = Array.isArray(state.results) ? state.results : [];
  const nowMs = Number(state.nowMs) || Date.now();
  if (!results.length) {
    // Keine Sackgasse: Wenn nichts passt, steht darunter, was es sonst gibt
    // (Punkt 118).
    return `
      <div data-go-view="results">
        <h2 class="mnyra-go__q">${esc(texts.emptyTitle)}</h2>
        <p class="mnyra-go__hint">${esc(texts.emptySubtitle)}</p>
        <button type="button" class="mnyra-go__cta mnyra-go__cta--quiet" data-go-back>${esc(texts.back)}</button>
      </div>
    `;
  }
  return `
    <div data-go-view="results">
      <h2 class="mnyra-go__q">${results.length} ${esc(texts.resultsHeadline)}</h2>
      ${state.notice ? `<p class="mnyra-go__note">${esc(state.notice)}</p>` : ""}
      ${results.map((result) => renderResultCard(result, {
        texts,
        busyOfferId: state.busyOfferId,
        nowMs
      })).join("")}
      <button type="button" class="mnyra-go__cta mnyra-go__cta--quiet" data-go-back>${esc(texts.back)}</button>
    </div>
  `;
}

function renderBookingBody(state = {}, texts = TEXTS) {
  const booking = state.booking || {};
  const isReservation = booking.type === "reservation";
  const nowMs = Number(state.nowMs) || Date.now();
  const arrival = arrivalLabel(booking.expectedArrivalAt, { nowMs });
  const statusLine = String(state.statusLabel || "").trim()
    || (isReservation ? texts.reservationConfirmed : texts.claimConfirmed);

  if (state.confirmCancel) {
    return `
      <div data-go-view="booking">
        <h2 class="mnyra-go__q">${esc(texts.cancelConfirm)}</h2>
        <div class="mnyra-go__row">
          <button type="button" class="mnyra-go__cta" data-go-cancel-confirm>${esc(texts.cancelYes)}</button>
          <button type="button" class="mnyra-go__cta mnyra-go__cta--quiet" data-go-cancel-dismiss>${esc(texts.cancelNo)}</button>
        </div>
      </div>
    `;
  }

  return `
    <div data-go-view="booking">
      <p class="mnyra-go__done">${esc(texts.doneTitle)}</p>
      <p class="mnyra-go__done-name">${esc(booking.businessName || "")}</p>
      <p class="mnyra-go__card-for">${esc(booking.benefitLabel || "")}</p>

      <div class="mnyra-go__card-meta">
        <span>👥 ${esc(`${booking.partySize || 1} ${texts.peopleSuffix}`)}</span>
        ${arrival ? `<span>🕐 ${esc(arrival)}</span>` : ""}
        ${booking.city ? `<span>📍 ${esc(booking.city)}</span>` : ""}
      </div>

      <p class="mnyra-go__ok">✅ ${esc(statusLine)}</p>

      ${booking.shortCode ? `
        <div class="mnyra-go__code">
          <p class="mnyra-go__code-label">${esc(texts.code)}</p>
          <p class="mnyra-go__code-value">${esc(booking.shortCode)}</p>
        </div>
      ` : ""}

      <div class="mnyra-go__row">
        <button type="button" class="mnyra-go__cta mnyra-go__cta--quiet" data-go-menu>${esc(texts.menu)}</button>
        <button type="button" class="mnyra-go__cta mnyra-go__cta--quiet" data-go-directions>${esc(texts.directions)}</button>
      </div>

      ${state.canSignIn ? `
        <button type="button" class="mnyra-go__cta mnyra-go__cta--quiet" data-go-signin>
          ${esc(texts.saveToAccount)} · ${esc(texts.signIn)}
        </button>
      ` : ""}

      <button type="button" class="mnyra-go__ghost" data-go-cancel>${esc(texts.cancel)}</button>
    </div>
  `;
}

function renderErrorBody(state = {}, texts = TEXTS) {
  const message = String(state.error || "").trim() || texts.errorTitle;
  return `
    <div data-go-view="error">
      <h2 class="mnyra-go__q">${esc(message)}</h2>
      ${Array.isArray(state.alternatives) && state.alternatives.length ? `
        <p class="mnyra-go__hint">${state.alternatives.length} ${esc(texts.alternatives)}</p>
        ${state.alternatives.map((result) => renderResultCard(result, { texts, nowMs: state.nowMs })).join("")}
      ` : `
        <button type="button" class="mnyra-go__cta" data-go-retry>${esc(texts.errorRetry)}</button>
      `}
    </div>
  `;
}

// Die Kopfzeile traegt die Handlung des jeweiligen Bildes - im Suchbild ist
// das "Shiko ofertat", sonst nichts. So liegt der wichtigste Knopf zweimal
// im Daumenbereich: oben rechts und unten am Ende des Formulars.
function renderHead(state = {}, texts = TEXTS) {
  const view = String(state.view || "search");
  const title = view === "results"
    ? texts.titleResults
    : (view === "booking" ? texts.titleBooking : texts.titleSearch);
  const action = view === "search"
    ? `<button type="button" class="mnyra-go__action" data-go-submit>${esc(texts.submit)}</button>`
    : `<span class="mnyra-go__action mnyra-go__action--ghost" aria-hidden="true"></span>`;
  return `
    <header class="mnyra-go__head">
      <button type="button" class="mnyra-go__x" data-go-close aria-label="${esc(texts.close)}" title="${esc(texts.close)}">×</button>
      <div class="mnyra-go__title">${esc(texts.mark)} ${esc(title)}</div>
      ${action}
    </header>
  `;
}

/**
 * Der Inhalt des Modals - ohne die aeussere Flaeche.
 *
 * Die Flaeche selbst legt der Runtime-Controller einmal an und laesst sie
 * stehen; hier wird nur ihr Inhalt neu geschrieben. Genau so macht es der
 * Composer auch: Ein Modal, das sich bei jedem Tastendruck komplett neu
 * aufbaut, verliert den Fokus - und auf dem Telefon faellt dabei die Tastatur
 * zu.
 */
export function renderGoModalContentCore(state = {}) {
  const texts = { ...TEXTS, ...(state.texts || {}) };
  const view = String(state.view || "search");

  let body = "";
  if (view === "loading") body = `<div class="mnyra-go__empty">${esc(texts.searching)}</div>`;
  else if (view === "results") body = renderResultsBody(state, texts);
  else if (view === "booking") body = renderBookingBody(state, texts);
  else if (view === "error") body = renderErrorBody(state, texts);
  else body = renderSearchBody(state.form || {}, texts);

  return `
    <div class="mnyra-go__sheet">
      ${renderHead(state, texts)}
      <div class="mnyra-go__body" data-go-body>${body}</div>
    </div>
  `;
}

/**
 * Das ganze Modal inklusive Flaeche - fuer Tests und fuer Aufrufer, die es
 * als einen Block brauchen.
 *
 * @returns {string} HTML oder "" wenn geschlossen.
 */
export function renderGoModalCore(state = {}) {
  if (!state || !state.open) return "";
  const texts = { ...TEXTS, ...(state.texts || {}) };
  return `
    <div
      class="mnyra-go modal-overlay"
      id="${GO_MODAL_ROOT_ELEMENT_ID}"
      data-go-modal
      data-modal-surface="${GO_MODAL_SURFACE_COLOR}"
      style="--modal-surface:${GO_MODAL_SURFACE_COLOR};"
      role="dialog"
      aria-modal="true"
      aria-label="${esc(texts.brand)}"
    >${renderGoModalContentCore(state)}</div>
  `;
}

export const GO_MODAL_TEXTS = TEXTS;
