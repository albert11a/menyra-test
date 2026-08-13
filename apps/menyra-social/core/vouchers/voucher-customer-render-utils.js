// Mnyra Ofertat - Kundenansicht.
//
// Die Karte folgt bewusst der Restaurant-Karte aus dem Restorante-Tab:
// gleiche Geometrie, gleiche Radien, gleicher Logo-Ueberhang. Nur der Inhalt
// wechselt von "Lokal" auf "Oferta":
//   Titelbild = Oferta-Bild, Badge oben rechts = Restlaufzeit,
//   Beschreibungszeilen statt Stadt/Orari, Button = "Aktivizo oferten".

import {
  normalizeVoucherItem,
  resolveVoucherWindow,
  resolveActivationState,
  formatVoucherRemaining,
  resolveVoucherUrgency,
  formatActivationCountdown,
  formatActivationDuration,
  buildVoucherActivationKey
} from "./voucher-core.js";

const URGENCY_BADGE_STYLE = Object.freeze({
  critical: "background-color:rgba(225,29,72,0.92);",
  soon: "background-color:rgba(217,119,6,0.92);",
  calm: "background-color:rgba(15,23,42,0.9);",
  none: "background-color:rgba(15,23,42,0.9);"
});

function esc(escapeHtml, value = "") {
  return typeof escapeHtml === "function" ? escapeHtml(value) : String(value ?? "");
}

function formatValidUntil(endMs = 0) {
  if (!endMs) return "Pa afat";
  const date = new Date(endMs);
  if (Number.isNaN(date.getTime())) return "Pa afat";
  const pad = (num) => String(num).padStart(2, "0");
  return `Vlen deri me ${pad(date.getDate())}.${pad(date.getMonth() + 1)}.${date.getFullYear()}`;
}

function renderVoucherImage(url = "", alt = "", {
  escapeHtml,
  isPlaceholderUrl,
  cropX = 50,
  cropY = 50,
  extraClass = ""
} = {}) {
  const safeUrl = String(url || "").trim();
  const usePlaceholder = !safeUrl || (typeof isPlaceholderUrl === "function" && isPlaceholderUrl(safeUrl));
  return `
    <img
      src="${esc(escapeHtml, safeUrl)}"
      alt="${esc(escapeHtml, alt)}"
      loading="lazy"
      decoding="async"
      class="w-full h-full object-cover bg-slate-100 ${extraClass}"
      style="object-position:${Number(cropX) || 50}% ${Number(cropY) || 50}%;"
      ${usePlaceholder ? 'data-placeholder-image="true"' : ""}
    />
  `;
}

export function renderVoucherCard({
  business = {},
  voucher = {},
  activation = null,
  nowMs = Date.now(),
  deps = {}
} = {}) {
  const escapeHtml = deps.escapeHtml;
  const icon = typeof deps.icon === "function" ? deps.icon : () => "";
  const item = normalizeVoucherItem(voucher);
  const window = resolveVoucherWindow(item, nowMs);
  const activationState = resolveActivationState(activation, nowMs);
  const businessId = String(business.id || "").trim();
  const businessName = String(business.name || "Business").trim();
  const cardKey = buildVoucherActivationKey(businessId, item.id);
  const remainingLabel = formatVoucherRemaining(window.remainingMs);
  const urgency = resolveVoucherUrgency(window.remainingMs);
  const coverUrl = item.imageUrl || business.coverImage || "";
  const isActive = activationState.state === "active";
  const wasUsed = activationState.state === "expired";

  return `
    <article
      data-voucher-card="${esc(escapeHtml, cardKey)}"
      data-voucher-restaurant="${esc(escapeHtml, businessId)}"
      data-voucher-id="${esc(escapeHtml, item.id)}"
      class="w-full bg-white rounded-[28px] overflow-hidden shadow-lg shadow-slate-200/80 border border-slate-100/60 relative flex flex-col"
      style="border-radius:28px;border-color:rgba(241,245,249,0.6);box-shadow:0 10px 15px -3px rgba(226,232,240,0.8),0 4px 6px -4px rgba(226,232,240,0.8);"
    >
      <div class="h-44 relative overflow-hidden">
        ${renderVoucherImage(coverUrl, item.title || businessName, {
          escapeHtml,
          isPlaceholderUrl: deps.isPlaceholderUrl,
          cropX: item.cropX,
          cropY: item.cropY
        })}
        <div class="absolute inset-0" style="background:linear-gradient(to top,#fff 0%,rgba(255,255,255,0.2) 50%,rgba(0,0,0,0.25) 100%);"></div>

        <div class="absolute top-3.5 left-3.5 z-10" style="top:0.875rem;left:0.875rem;">
          <button
            type="button"
            data-marketplace-open-map="${esc(escapeHtml, businessId)}"
            class="w-8 h-8 rounded-full bg-white/95 backdrop-blur-sm flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-white transition-all active:scale-95 border border-slate-200/50 shadow-sm cursor-pointer"
            title="Shfaq ne harte"
            aria-label="Shfaq ne harte"
          >
            ${icon("map-pin", "w-4 h-4")}
          </button>
        </div>

        <div
          data-voucher-window-badge="${esc(escapeHtml, cardKey)}"
          class="absolute top-3.5 right-3.5 z-10 text-white font-black px-3 py-1 rounded-full text-[10px] tracking-wide shadow flex items-center gap-1.5"
          style="top:0.875rem;right:0.875rem;${URGENCY_BADGE_STYLE[urgency] || URGENCY_BADGE_STYLE.none}"
        >
          ${icon("clock", "w-3 h-3")}
          <span data-voucher-window-label>${esc(escapeHtml, remainingLabel)}</span>
        </div>

        ${item.badgeLabel ? `
          <div class="absolute bottom-3.5 right-4 bg-amber-500 text-white font-black px-2.5 py-0.5 rounded-md text-[11px] tracking-wider shadow" style="bottom:0.875rem;">
            ${esc(escapeHtml, item.badgeLabel)}
          </div>
        ` : ""}
      </div>

      <div class="px-5 pb-5 pt-12 relative flex-1 flex flex-col gap-3.5" style="padding-top:3rem;gap:0.875rem;">
        <div class="absolute -top-10 left-5 z-10" style="top:-2.5rem;left:1.25rem;">
          <div class="w-[76px] h-[76px] rounded-full p-1 bg-white shadow-md border border-slate-100 overflow-hidden" style="width:76px;height:76px;">
            ${renderVoucherImage(business.logoImage || "", `${businessName} Logo`, {
              escapeHtml,
              isPlaceholderUrl: deps.isPlaceholderUrl,
              // Ohne eigenen Radius stehen die Ecken des Logos ueber und der
              // weisse Kreis wird zur Squircle - wie in der Restorante-Karte
              // bekommt das Bild denselben Radius wie sein Rahmen.
              extraClass: "rounded-full"
            })}
          </div>
        </div>

        <div>
          <div class="flex items-center gap-1.5 mb-1">
            ${icon("ticket", "w-3.5 h-3.5 text-amber-500")}
            <span class="text-[10px] font-black text-amber-600 uppercase tracking-widest">Oferta</span>
          </div>
          <h2 class="text-lg font-black text-slate-900 leading-snug tracking-tight">${esc(escapeHtml, businessName)}</h2>
          ${item.title ? `<p class="text-[13px] font-black text-slate-700 leading-snug mt-1">${esc(escapeHtml, item.title)}</p>` : ""}
        </div>

        <hr class="border-slate-100" />

        <div class="flex flex-col gap-2.5 text-slate-600">
          <div class="flex items-start gap-3">
            ${icon("gift", "w-4 h-4 text-slate-400 shrink-0 mt-0.5")}
            <span class="text-[11px] leading-relaxed text-slate-600">${esc(escapeHtml, item.text || "Oferta vlen ne lokal.")}</span>
          </div>
          <div class="flex items-center gap-3">
            ${icon("calendar-clock", "w-4 h-4 text-slate-400 shrink-0")}
            <span class="text-[11px] text-slate-600">${esc(escapeHtml, formatValidUntil(window.endMs))}</span>
          </div>
          ${item.terms ? `
            <div class="flex items-start gap-3">
              ${icon("info", "w-4 h-4 text-slate-400 shrink-0 mt-0.5")}
              <span class="text-[11px] leading-relaxed text-slate-500">${esc(escapeHtml, item.terms)}</span>
            </div>
          ` : ""}
        </div>

        <hr class="border-slate-100" />

        ${isActive ? renderActiveVoucherState({ cardKey, activationState, item, deps }) : ""}
        ${wasUsed ? `
          <div class="rounded-2xl bg-slate-50 border border-slate-100 px-4 py-3 text-center">
            <p class="text-[10px] font-black uppercase tracking-widest text-slate-400">Oferta e perdorur</p>
            <p class="text-[11px] text-slate-500 mt-1">Koha e aktivizimit ka skaduar.</p>
          </div>
        ` : ""}

        <div class="grid grid-cols-1 gap-2.5 mt-0.5">
          ${isActive || wasUsed ? `
            <button
              type="button"
              data-marketplace-open-business="${esc(escapeHtml, businessId)}"
              data-tab="menu"
              class="flex items-center justify-center gap-1.5 py-3.5 px-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-black text-xs uppercase tracking-widest transition-all duration-150 active:scale-95 cursor-pointer"
            >
              ${icon("book-open", "w-3.5 h-3.5 text-slate-400")}
              Shiko menune
            </button>
          ` : `
            <button
              type="button"
              data-voucher-activate="${esc(escapeHtml, cardKey)}"
              class="flex items-center justify-center gap-2 py-3.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs uppercase tracking-widest shadow-sm transition-all duration-150 active:scale-95 cursor-pointer"
            >
              ${icon("ticket", "w-4 h-4 text-amber-400")}
              Aktivizo oferten
            </button>
          `}
        </div>
      </div>
    </article>
  `;
}

function renderActiveVoucherState({ cardKey = "", activationState = {}, item = {}, deps = {} } = {}) {
  const escapeHtml = deps.escapeHtml;
  const icon = typeof deps.icon === "function" ? deps.icon : () => "";
  return `
    <div class="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3.5" data-voucher-active-panel="${esc(escapeHtml, cardKey)}">
      <div class="flex items-center justify-between gap-3">
        <div class="min-w-0">
          <p class="text-[9px] font-black uppercase tracking-widest text-emerald-600">Oferta aktive</p>
          <p class="text-[11px] font-bold text-emerald-700 mt-0.5">Trego kodin te personeli</p>
        </div>
        <div class="text-right shrink-0">
          <p class="text-[9px] font-black uppercase tracking-widest text-emerald-600">Skadon per</p>
          <p
            data-voucher-countdown="${esc(escapeHtml, cardKey)}"
            data-voucher-expires="${Number(activationState.expiresAtMs) || 0}"
            class="text-lg font-black text-emerald-700 tabular-nums leading-tight"
          >${esc(escapeHtml, formatActivationCountdown(activationState.remainingMs))}</p>
        </div>
      </div>
      <div class="mt-3 flex items-center justify-center gap-2 rounded-xl bg-white border border-emerald-200 py-2.5">
        ${icon("ticket", "w-4 h-4 text-emerald-600")}
        <span class="text-base font-black tracking-[0.35em] text-emerald-700">${esc(escapeHtml, activationState.code || "------")}</span>
      </div>
      <p class="mt-2 text-center text-[10px] font-bold text-emerald-600/80">
        Vlen ${esc(escapeHtml, formatActivationDuration(item.activationMinutes))} nga aktivizimi
      </p>
    </div>
  `;
}

// Bestaetigung vor der Aktivierung: bewusst kurz und in einfacher Sprache,
// mit klarem "Po" / "Jo".
export function renderVoucherConfirmModal({ confirm = null, deps = {} } = {}) {
  if (!confirm || !confirm.open) return "";
  const escapeHtml = deps.escapeHtml;
  const icon = typeof deps.icon === "function" ? deps.icon : () => "";
  const durationLabel = formatActivationDuration(confirm.activationMinutes);
  return `
    <div
      data-voucher-confirm-root
      class="fixed inset-0 z-[3000] flex items-end sm:items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-label="Konfirmo aktivizimin e ofertes"
    >
      <div data-voucher-confirm-dismiss class="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px]"></div>
      <div class="relative w-full sm:max-w-sm bg-white rounded-t-[2.5rem] sm:rounded-[2.5rem] p-7 shadow-2xl animate-in slide-in-from-bottom-6 duration-300"
        style="padding-bottom:calc(1.75rem + var(--safe-area-bottom, 0px));">
        <div class="w-14 h-14 rounded-[1.4rem] bg-amber-50 text-amber-500 flex items-center justify-center mx-auto mb-5">
          ${icon("ticket", "w-6 h-6")}
        </div>
        <h3 class="text-xl font-black italic tracking-tight text-slate-900 text-center">A deshironi ta aktivizoni oferten?</h3>
        ${confirm.title ? `<p class="mt-2 text-center text-[12px] font-black text-slate-500">${esc(escapeHtml, confirm.title)}</p>` : ""}
        <div class="mt-5 rounded-2xl bg-slate-50 border border-slate-100 p-4 space-y-2">
          <p class="text-[12px] leading-5 text-slate-600">
            Nese e aktivizoni tani, oferta vlen vetem <span class="font-black text-slate-900">${esc(escapeHtml, durationLabel)}</span>.
          </p>
          <p class="text-[12px] leading-5 text-slate-600">
            Pas kesaj kohe oferta skadon dhe nuk mund te perdoret me.
          </p>
          <p class="text-[12px] leading-5 text-slate-600">
            Aktivizojeni vetem kur jeni ne lokal.
          </p>
        </div>
        <div class="mt-6 grid grid-cols-1 gap-2.5">
          <button
            type="button"
            data-voucher-confirm-accept
            class="w-full py-4 rounded-2xl bg-slate-900 text-white font-black text-[11px] uppercase tracking-widest active:scale-[0.98] transition-transform"
          >Po, aktivizo</button>
          <button
            type="button"
            data-voucher-confirm-cancel
            class="w-full py-4 rounded-2xl bg-white border border-slate-200 text-slate-500 font-black text-[11px] uppercase tracking-widest active:scale-[0.98] transition-transform"
          >Jo, mos aktivizo</button>
        </div>
      </div>
    </div>
  `;
}

export function renderVoucherFeedEmptyState({ deps = {}, cityLabel = "" } = {}) {
  const escapeHtml = deps.escapeHtml;
  const icon = typeof deps.icon === "function" ? deps.icon : () => "";
  return `
    <div class="bg-white rounded-[2.5rem] border border-slate-100 p-10 text-center">
      <div class="w-16 h-16 rounded-[1.8rem] bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-4">
        ${icon("ticket", "w-6 h-6")}
      </div>
      <h2 class="text-lg font-black italic tracking-tight text-slate-900">Ende nuk ka oferta</h2>
      <p class="mt-2 text-[12px] text-slate-500 leading-5">
        ${cityLabel
          ? `Per ${esc(escapeHtml, cityLabel)} nuk ka oferta aktive per momentin.`
          : "Nuk ka oferta aktive per momentin."}
        Kthehu me vone.
      </p>
    </div>
  `;
}

// Waehrend die Ofertat geladen werden, stehen an ihrer Stelle graue Umrisse
// statt eines Satzes. Die Umrisse tragen die Masse der spaeteren Oferta-Karte:
// dieselbe Bildhoehe (h-44), derselbe Radius (28px), dieselben Abstaende.
// Dadurch springt beim Eintreffen der Daten nichts.
export function renderVoucherFeedLoadingState() {
  // Alle Masse inline: das ausgelieferte Tailwind-CSS ist fest vorgeneriert
  // und kennt weder h-44 in dieser Kombination noch die Bruchbreiten. Eine
  // Klasse, die dort fehlt, tut lautlos nichts - dann waeren die Balken
  // unsichtbar statt ein Umriss.
  const pulse = "background:#f1f5f9;";
  const bar = (height, width, marginTop = "0") => `<div aria-hidden="true" class="animate-pulse" style="${pulse}height:${height};width:${width};margin-top:${marginTop};border-radius:9999px;"></div>`;
  const card = () => `
    <article class="bg-white shadow-lg border border-slate-100" style="width:100%;overflow:hidden;border-radius:28px;border-color:rgba(241,245,249,0.6);box-shadow:0 10px 15px -3px rgba(226,232,240,0.8),0 4px 6px -4px rgba(226,232,240,0.8);">
      <div aria-hidden="true" class="animate-pulse" style="${pulse}height:11rem;width:100%;"></div>
      <div style="padding:1.25rem;">
        ${bar("0.625rem", "6rem")}
        ${bar("1.25rem", "60%", "0.75rem")}
        ${bar("0.75rem", "100%", "0.75rem")}
        ${bar("0.75rem", "80%", "0.5rem")}
        <div aria-hidden="true" class="animate-pulse" style="${pulse}height:3rem;width:100%;margin-top:1.25rem;border-radius:1rem;"></div>
      </div>
    </article>
  `;
  return `
    <div data-voucher-skeleton="1" aria-hidden="true" style="display:flex;flex-direction:column;gap:1.25rem;">
      ${card()}${card()}
    </div>
  `;
}

export function renderVoucherLocationGate({ deps = {} } = {}) {
  const icon = typeof deps.icon === "function" ? deps.icon : () => "";
  return `
    <div class="bg-white rounded-[2.5rem] border border-slate-100 p-10 text-center">
      <div class="w-16 h-16 rounded-[1.8rem] bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-4">
        ${icon("map-pin", "w-6 h-6")}
      </div>
      <h2 class="text-lg font-black italic tracking-tight text-slate-900">Zgjidh qytetin</h2>
      <p class="mt-2 text-[12px] text-slate-500 leading-5">
        Ofertat shfaqen sipas qytetit. Zgjidh qytetin tend ne tabin Lokalet ose Zbulo.
      </p>
      <button
        type="button"
        data-nav="restaurants"
        class="mt-6 inline-flex items-center justify-center rounded-2xl bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest px-6 py-4"
      >Zgjidh qytetin</button>
    </div>
  `;
}
