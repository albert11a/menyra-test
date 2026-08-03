// Mnyra Ofertat - Business-Ansicht.
//
// Aufbau wie der Menue-Editor: weisse Karten mit 2.5rem-Radius, farbiger
// Eyebrow, "+"-Button rechts oben, Liste mit Edit/Fshi je Eintrag. Dazu die
// Analytics-Zeile (Aktivizime / Arritje) direkt ueber der Liste.

import {
  normalizeVoucherItem,
  resolveVoucherWindow,
  formatVoucherWindowLabel,
  formatActivationDuration,
  toVoucherInputValue,
  buildVoucherAnalyticsModel,
  VOUCHER_DEFAULT_ACTIVATION_MINUTES
} from "./voucher-core.js";

const STATUS_VIEW = Object.freeze({
  live: { label: "Aktive", className: "text-emerald-600" },
  scheduled: { label: "E planifikuar", className: "text-amber-600" },
  expired: { label: "Skaduar", className: "text-slate-400" },
  inactive: { label: "Joaktive", className: "text-slate-400" }
});

function esc(escapeHtml, value = "") {
  return typeof escapeHtml === "function" ? escapeHtml(value) : String(value ?? "");
}

function formatNumber(value = 0) {
  const num = Math.max(0, Math.round(Number(value) || 0));
  return num >= 1000 ? `${(num / 1000).toFixed(1).replace(".0", "")}k` : String(num);
}

export function renderVoucherKpiRow({ totals = {}, deps = {} } = {}) {
  const escapeHtml = deps.escapeHtml;
  const icon = typeof deps.icon === "function" ? deps.icon : () => "";
  const cards = [
    { key: "reach", label: "Arritje", value: formatNumber(totals.reachCount), icon: "eye", tone: "text-indigo-600" },
    { key: "activations", label: "Aktivizime", value: formatNumber(totals.activationCount), icon: "ticket", tone: "text-emerald-600" },
    { key: "conversion", label: "Konvertim", value: `${Number(totals.conversionPercent || 0)}%`, icon: "trending-up", tone: "text-amber-600" },
    { key: "live", label: "Live tani", value: formatNumber(totals.liveCount), icon: "zap", tone: "text-rose-500" }
  ];
  return `
    <div class="mb-6 grid grid-cols-2 gap-3">
      ${cards.map((card) => `
        <div class="bg-white rounded-[1.8rem] p-4 border border-slate-100 shadow-sm" data-voucher-kpi="${esc(escapeHtml, card.key)}">
          <div class="flex items-center gap-2 ${card.tone}">
            ${icon(card.icon, "w-3.5 h-3.5")}
            <span class="text-[9px] font-black uppercase tracking-widest">${esc(escapeHtml, card.label)}</span>
          </div>
          <p class="mt-2 text-2xl font-black tracking-tighter text-slate-900">${esc(escapeHtml, card.value)}</p>
        </div>
      `).join("")}
    </div>
  `;
}

export function renderVoucherAnalyticsSection({ rows = [], deps = {} } = {}) {
  const escapeHtml = deps.escapeHtml;
  const icon = typeof deps.icon === "function" ? deps.icon : () => "";
  return `
    <div class="mb-6 bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm">
      <div class="flex items-center justify-between mb-4">
        <div>
          <span class="text-[9px] font-black text-indigo-600 uppercase tracking-widest">Analitika</span>
          <h3 class="text-xl font-black italic tracking-tighter">Performanca</h3>
          <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Sa e panin dhe sa e aktivizuan</p>
        </div>
        ${icon("bar-chart-3", "w-5 h-5 text-slate-300")}
      </div>
      ${rows.length ? `
        <div class="space-y-2.5">
          ${rows.map((row) => {
            const status = STATUS_VIEW[row.status] || STATUS_VIEW.inactive;
            return `
              <div class="p-4 rounded-[1.6rem] bg-slate-50 border border-slate-100">
                <div class="flex items-start justify-between gap-3">
                  <p class="text-[12px] font-black text-slate-900 truncate min-w-0">${esc(escapeHtml, row.title || "Oferta")}</p>
                  <span class="shrink-0 text-[9px] font-black uppercase tracking-widest ${status.className}">${esc(escapeHtml, status.label)}</span>
                </div>
                <div class="mt-3 grid grid-cols-3 gap-2 text-center">
                  <div>
                    <p class="text-[9px] font-black uppercase tracking-widest text-slate-400">Arritje</p>
                    <p class="text-sm font-black text-slate-900">${esc(escapeHtml, formatNumber(row.reachCount))}</p>
                  </div>
                  <div>
                    <p class="text-[9px] font-black uppercase tracking-widest text-slate-400">Aktivizime</p>
                    <p class="text-sm font-black text-emerald-600">${esc(escapeHtml, formatNumber(row.activationCount))}</p>
                  </div>
                  <div>
                    <p class="text-[9px] font-black uppercase tracking-widest text-slate-400">Konvertim</p>
                    <p class="text-sm font-black text-amber-600">${esc(escapeHtml, `${Number(row.conversionPercent || 0)}%`)}</p>
                  </div>
                </div>
              </div>
            `;
          }).join("")}
        </div>
      ` : `
        <div class="text-center py-10 text-[10px] font-bold uppercase tracking-widest text-slate-300">Ende nuk ka te dhena</div>
      `}
    </div>
  `;
}

export function renderVoucherListSection({ items = [], loading = false, enabled = true, deps = {} } = {}) {
  const escapeHtml = deps.escapeHtml;
  const icon = typeof deps.icon === "function" ? deps.icon : () => "";
  const nowMs = Number(deps.nowMs) || Date.now();
  const normalized = (Array.isArray(items) ? items : []).map((item) => normalizeVoucherItem(item));
  return `
    <div class="mb-6 bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm">
      <div class="flex items-center justify-between mb-4">
        <div>
          <span class="text-[9px] font-black text-amber-500 uppercase tracking-widest">Ofertat</span>
          <h3 class="text-xl font-black italic tracking-tighter">Vouchers</h3>
          <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">${normalized.length} ${normalized.length === 1 ? "oferte" : "oferta"}</p>
        </div>
        <button type="button" data-voucher-add class="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow active:scale-95">
          ${icon("plus", "w-4 h-4")}
        </button>
      </div>

      <label class="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 mb-4">
        <div>
          <p class="text-xs font-black text-slate-800">Shfaq ofertat</p>
          <p class="text-[10px] font-bold text-slate-400">E dukshme ne tabin Ofertat</p>
        </div>
        <input id="voucherEnabledToggle" type="checkbox" class="w-5 h-5 accent-amber-500" ${enabled ? "checked" : ""} />
      </label>

      ${normalized.length ? `
        <div class="space-y-3">
          ${normalized.map((item) => {
            const window = resolveVoucherWindow(item, nowMs);
            const status = STATUS_VIEW[window.status] || STATUS_VIEW.inactive;
            const imageUrl = typeof deps.getOptimizedImageUrl === "function"
              ? deps.getOptimizedImageUrl(item.imageUrl || "", "thumb")
              : item.imageUrl;
            const safeImage = !imageUrl || (typeof deps.isPlaceholderUrl === "function" && deps.isPlaceholderUrl(imageUrl))
              ? (deps.placeholderImage || "")
              : imageUrl;
            return `
              <div class="flex items-start gap-4 p-4 rounded-[1.6rem] bg-slate-50 border border-slate-100">
                <div class="w-16 h-16 rounded-2xl overflow-hidden bg-white shrink-0">
                  <img src="${esc(escapeHtml, safeImage)}" alt="" class="w-full h-full object-cover" style="object-position:${item.cropX}% ${item.cropY}%;" loading="lazy" decoding="async" />
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-black text-slate-900 truncate">${esc(escapeHtml, item.title || "Oferta")}</p>
                  ${item.text ? `<p class="text-xs text-slate-500 mt-1 line-clamp-2">${esc(escapeHtml, item.text)}</p>` : ""}
                  <p class="text-[9px] font-black uppercase tracking-widest mt-2 text-slate-400">
                    ${esc(escapeHtml, formatVoucherWindowLabel(window, nowMs))} &middot; ${esc(escapeHtml, formatActivationDuration(item.activationMinutes))}
                  </p>
                  <p class="text-[9px] font-black uppercase tracking-widest mt-1 ${status.className}">${esc(escapeHtml, status.label)}</p>
                </div>
                <div class="flex flex-col gap-2">
                  <button type="button" data-voucher-edit="${esc(escapeHtml, item.id)}" class="px-3 py-1.5 rounded-xl bg-white text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-100 border border-slate-200">Edit</button>
                  <button type="button" data-voucher-delete="${esc(escapeHtml, item.id)}" class="px-3 py-1.5 rounded-xl bg-rose-50 text-[10px] font-black uppercase tracking-widest text-rose-600 hover:bg-rose-100">Fshi</button>
                </div>
              </div>
            `;
          }).join("")}
        </div>
      ` : loading ? `
        <div class="text-center py-10 text-[10px] font-bold uppercase tracking-widest text-slate-400">Ofertat po ngarkohen...</div>
      ` : `
        <div class="text-center py-10 text-[10px] font-bold uppercase tracking-widest text-slate-300">Ende nuk ka oferta</div>
      `}
    </div>
  `;
}

// Editor als eigener Screen (kein Overlay): so bleiben Eingaben beim
// Re-Render der Shell erhalten, weil nur Aktionen neu rendern.
export function renderVoucherEditor({ editor = null, deps = {} } = {}) {
  if (!editor) return "";
  const escapeHtml = deps.escapeHtml;
  const icon = typeof deps.icon === "function" ? deps.icon : () => "";
  const draft = editor.draft || {};
  const previewUrl = editor.imagePreview || draft.imageUrl || "";
  const isEdit = editor.mode === "edit";
  return `
    <div class="p-6 app-main-content-safe animate-in slide-in-from-right-10 duration-500" data-voucher-editor>
      <div class="flex items-center gap-3 mb-6">
        <button type="button" data-voucher-editor-close class="p-2.5 rounded-2xl bg-white border border-slate-200 text-slate-500">
          ${icon("chevron-left", "w-4 h-4")}
        </button>
        <div>
          <span class="text-[9px] font-black text-amber-500 uppercase tracking-widest">Ofertat</span>
          <h2 class="text-2xl font-black italic uppercase tracking-tighter">${isEdit ? "Ndrysho oferten" : "Oferte e re"}</h2>
        </div>
      </div>

      <div class="bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm space-y-5">
        <div>
          <label class="text-[10px] font-black uppercase tracking-widest text-slate-400" for="voucherTitle">Titulli</label>
          <input id="voucherTitle" type="text" value="${esc(escapeHtml, draft.title || "")}" placeholder="p.sh. 20% zbritje ne pizza"
            class="mt-2 w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3.5 text-sm font-bold text-slate-900 outline-none focus:border-amber-400" />
        </div>

        <div>
          <label class="text-[10px] font-black uppercase tracking-widest text-slate-400" for="voucherText">Pershkrimi</label>
          <textarea id="voucherText" rows="3" placeholder="Cka perfshin oferta?"
            class="mt-2 w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3.5 text-sm font-medium text-slate-900 outline-none focus:border-amber-400 resize-none">${esc(escapeHtml, draft.text || "")}</textarea>
        </div>

        <div>
          <label class="text-[10px] font-black uppercase tracking-widest text-slate-400" for="voucherBadge">Badge (opsionale)</label>
          <input id="voucherBadge" type="text" value="${esc(escapeHtml, draft.badgeLabel || "")}" placeholder="p.sh. -20%"
            class="mt-2 w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3.5 text-sm font-bold text-slate-900 outline-none focus:border-amber-400" />
        </div>

        <div class="grid grid-cols-1 gap-4">
          <div>
            <label class="text-[10px] font-black uppercase tracking-widest text-slate-400" for="voucherStartAt">Fillon (opsionale)</label>
            <input id="voucherStartAt" type="datetime-local" value="${esc(escapeHtml, toVoucherInputValue(draft.startAt))}"
              class="mt-2 w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3.5 text-sm font-bold text-slate-900 outline-none focus:border-amber-400" />
          </div>
          <div>
            <label class="text-[10px] font-black uppercase tracking-widest text-slate-400" for="voucherEndAt">Vlen deri</label>
            <input id="voucherEndAt" type="datetime-local" value="${esc(escapeHtml, toVoucherInputValue(draft.endAt))}"
              class="mt-2 w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3.5 text-sm font-bold text-slate-900 outline-none focus:border-amber-400" />
          </div>
        </div>

        <div>
          <label class="text-[10px] font-black uppercase tracking-widest text-slate-400" for="voucherActivationMinutes">Sa gjate vlen pas aktivizimit (minuta)</label>
          <input id="voucherActivationMinutes" type="number" min="5" max="1440" step="5"
            value="${Number(draft.activationMinutes) || VOUCHER_DEFAULT_ACTIVATION_MINUTES}"
            class="mt-2 w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3.5 text-sm font-bold text-slate-900 outline-none focus:border-amber-400" />
          <p class="mt-2 text-[10px] font-bold text-slate-400">Klienti e sheh kete kohe ne dritaren e konfirmimit.</p>
        </div>

        <div>
          <label class="text-[10px] font-black uppercase tracking-widest text-slate-400" for="voucherTerms">Kushtet (opsionale)</label>
          <textarea id="voucherTerms" rows="2" placeholder="p.sh. Nuk kombinohet me oferta tjera"
            class="mt-2 w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3.5 text-sm font-medium text-slate-900 outline-none focus:border-amber-400 resize-none">${esc(escapeHtml, draft.terms || "")}</textarea>
        </div>

        <div>
          <p class="text-[10px] font-black uppercase tracking-widest text-slate-400">Fotoja e ofertes</p>
          <div class="mt-2 rounded-[1.6rem] overflow-hidden bg-slate-50 border border-slate-100 h-40">
            ${previewUrl
              ? `<img src="${esc(escapeHtml, previewUrl)}" alt="" class="w-full h-full object-cover" />`
              : `<div class="w-full h-full flex items-center justify-center text-slate-300">${icon("image", "w-7 h-7")}</div>`
            }
          </div>
          <input id="voucherImageInput" type="file" accept="image/*" class="hidden" />
          <button type="button" data-voucher-pick-image class="mt-3 w-full py-3.5 rounded-2xl bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest active:scale-[0.98] transition-transform">
            Zgjidh foton
          </button>
        </div>

        <label class="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
          <div>
            <p class="text-xs font-black text-slate-800">Aktive</p>
            <p class="text-[10px] font-bold text-slate-400">Joaktive fshihet nga klientet</p>
          </div>
          <input id="voucherActive" type="checkbox" class="w-5 h-5 accent-amber-500" ${draft.active === false ? "" : "checked"} />
        </label>

        ${editor.status ? `<p class="text-[11px] font-bold text-rose-500 text-center">${esc(escapeHtml, editor.status)}</p>` : ""}

        <div class="grid grid-cols-1 gap-2.5">
          <button type="button" data-voucher-save ${editor.saving ? "disabled" : ""}
            class="w-full py-4 rounded-2xl bg-amber-500 text-white font-black text-[11px] uppercase tracking-widest active:scale-[0.98] transition-transform ${editor.saving ? "opacity-60" : ""}">
            ${editor.saving ? "Po ruhet..." : "Ruaj oferten"}
          </button>
          <button type="button" data-voucher-editor-close
            class="w-full py-4 rounded-2xl bg-white border border-slate-200 text-slate-500 font-black text-[11px] uppercase tracking-widest active:scale-[0.98] transition-transform">
            Anulo
          </button>
        </div>
      </div>
    </div>
  `;
}

export function renderVoucherAdminBody({
  restaurantName = "",
  items = [],
  statsById = {},
  loading = false,
  enabled = true,
  error = "",
  nowMs = Date.now(),
  deps = {}
} = {}) {
  const escapeHtml = deps.escapeHtml;
  const analytics = buildVoucherAnalyticsModel({ items, statsById, nowMs });
  return `
    <div class="p-6 app-main-content-safe animate-in slide-in-from-right-10 duration-500" data-voucher-admin>
      <div class="flex items-end justify-between mb-6">
        <div>
          <span class="text-[9px] font-black text-amber-500 uppercase tracking-widest">Ofertat</span>
          <h2 class="text-2xl font-black italic uppercase tracking-tighter">Editor</h2>
          <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">${esc(escapeHtml, restaurantName)}</p>
        </div>
      </div>

      ${renderVoucherKpiRow({ totals: analytics.totals, deps })}
      ${renderVoucherListSection({ items, loading, enabled, deps: { ...deps, nowMs } })}
      ${renderVoucherAnalyticsSection({ rows: analytics.rows, deps })}
      ${error ? `<p class="text-center text-[10px] font-bold uppercase tracking-widest text-rose-500">${esc(escapeHtml, error)}</p>` : ""}
    </div>
  `;
}

export function renderVoucherAdminNoBusinessState({ deps = {}, resolving = false } = {}) {
  const icon = typeof deps.icon === "function" ? deps.icon : () => "";
  if (resolving) {
    return `
      <div class="p-6 app-main-content-safe">
        <div class="bg-white rounded-[2.5rem] p-6 border border-slate-100 text-center">
          <p class="text-sm font-bold text-slate-500">Biznesi po ngarkohet...</p>
        </div>
      </div>
    `;
  }
  return `
    <div class="p-6 app-main-content-safe">
      <div class="bg-white rounded-[2.5rem] p-8 border border-slate-100 text-center">
        <div class="w-16 h-16 rounded-[1.8rem] bg-slate-100 flex items-center justify-center text-slate-400 mx-auto mb-4">
          ${icon("lock", "w-6 h-6")}
        </div>
        <h2 class="text-lg font-black italic text-slate-900 mb-2">Ofertat</h2>
        <p class="text-sm text-slate-500">Ky funksion eshte vetem per profile biznesi.</p>
      </div>
    </div>
  `;
}
