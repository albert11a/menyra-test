import { normalizeLeadTypeKeyCore } from "./lead-type-utils.js";
import {
  PUBLIC_BUSINESS_CATEGORY_KEYS,
  resolveBusinessPublicCategoryGateCore
} from "../profile/business-category-visibility-utils.js";

// Der Kasten, der sagt, ob das Lokal oeffentlich steht - und wenn nicht, woran
// es liegt. Der Haken darunter schaltet es einzeln frei, auch ausserhalb der
// vier freigegebenen Kategorien.
function renderLeadPublicVisibilityBlock(lead = {}, {
  typeKey = "",
  escapeHtml = (value) => String(value || ""),
  icon = () => ""
} = {}) {
  const gate = resolveBusinessPublicCategoryGateCore(
    { ...(lead || {}), type: typeKey || lead?.type || "" },
    { normalizeLeadTypeKeyFn: normalizeLeadTypeKeyCore }
  );
  const allowedLabel = PUBLIC_BUSINESS_CATEGORY_KEYS.join(", ");
  const tone = gate.isPubliclyListed
    ? { box: "bg-emerald-50 border-emerald-100", text: "text-emerald-700", icon: "eye", label: "Publik" }
    : { box: "bg-amber-50 border-amber-100", text: "text-amber-700", icon: "eye-off", label: "I fshehur" };
  const reason = gate.allowedByCategory
    ? "Kategoria eshte e lejuar publikisht."
    : (gate.manuallyPublished
      ? "Kategoria eshte e mbyllur - ky lokal eshte aktivizuar me dore."
      : `Kategoria eshte e mbyllur. Publike jane vetem: ${allowedLabel}.`);
  return `
    <div class="rounded-2xl border ${tone.box} px-4 py-3">
      <div class="flex items-center justify-between gap-3">
        <span class="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest ${tone.text}">
          ${icon(tone.icon, "w-3.5 h-3.5")}
          ${escapeHtml(tone.label)}
        </span>
        <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">${escapeHtml(gate.categoryKey || "pa kategori")}</span>
      </div>
      <p class="mt-2 text-[10px] font-bold leading-4 text-slate-500">${escapeHtml(reason)}</p>
      <label class="mt-3 flex items-center justify-between gap-4 rounded-xl bg-white/70 border border-white px-3 py-2">
        <span class="text-[10px] font-black text-slate-500 uppercase tracking-widest">Aktivizo publikisht</span>
        <input id="leadPublicOverrideEnabled" type="checkbox" class="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-200" ${gate.manuallyPublished ? "checked" : ""} />
      </label>
    </div>
  `;
}

export function renderLeadModalCore({
  state,
  getOptimizedImageUrl,
  PLACEHOLDER_IMAGE,
  resolveCustomerType,
  normalizeLeadStatusKey,
  normalizeLeadLocations,
  hasLeadLocationCoords,
  LEAD_TYPE_ORDER,
  LEAD_TYPE_LABELS,
  LEAD_STATUS_ORDER,
  LEAD_STATUS_LABELS,
  escapeHtml,
  icon
} = {}) {
  if (!state || !state.leadModal?.open) return "";
  const getOptimizedImage = typeof getOptimizedImageUrl === "function"
    ? getOptimizedImageUrl
    : ((value) => String(value || ""));
  const resolveCustomer = typeof resolveCustomerType === "function"
    ? resolveCustomerType
    : ((value) => String(value || "cafe"));
  const normalizeStatus = typeof normalizeLeadStatusKey === "function"
    ? normalizeLeadStatusKey
    : ((value) => String(value || ""));
  const normalizeLocations = typeof normalizeLeadLocations === "function"
    ? normalizeLeadLocations
    : ((value) => (Array.isArray(value) ? value : []));
  const hasCoords = typeof hasLeadLocationCoords === "function"
    ? hasLeadLocationCoords
    : (() => false);
  const typeOrder = Array.isArray(LEAD_TYPE_ORDER) ? LEAD_TYPE_ORDER : [];
  const typeLabels = LEAD_TYPE_LABELS && typeof LEAD_TYPE_LABELS === "object" ? LEAD_TYPE_LABELS : {};
  const statusOrder = Array.isArray(LEAD_STATUS_ORDER) ? LEAD_STATUS_ORDER : [];
  const statusLabels = LEAD_STATUS_LABELS && typeof LEAD_STATUS_LABELS === "object" ? LEAD_STATUS_LABELS : {};
  const esc = typeof escapeHtml === "function" ? escapeHtml : ((value) => String(value || ""));
  const iconFn = typeof icon === "function" ? icon : (() => "");
  const normalizeBusinessNameColor = (value = "", fallback = "#111827") => {
    const raw = String(value || "").trim();
    return /^#[0-9a-fA-F]{6}$/.test(raw) ? raw : fallback;
  };
  const resolveBusinessNamePartColors = (source = {}) => {
    const landing = source?.landingScreenOne && typeof source.landingScreenOne === "object"
      ? source.landingScreenOne
      : {};
    const legacyColor = normalizeBusinessNameColor(
      source?.businessNameColor
      || source?.landingBusinessNameColor
      || landing.businessNameColor
      || "",
      ""
    );
    const legacyPart2Color = legacyColor && legacyColor.toLowerCase() !== "#111827" ? legacyColor : "";
    return {
      part1: normalizeBusinessNameColor(
        source?.businessNameColorPart1
        || source?.landingBusinessNameColorPart1
        || landing.businessNameColorPart1
        || legacyColor
        || "",
        "#111827"
      ),
      part2: normalizeBusinessNameColor(
        source?.businessNameColorPart2
        || source?.landingBusinessNameColorPart2
        || landing.businessNameColorPart2
        || legacyPart2Color
        || "",
        "#4f46e5"
      )
    };
  };

  const lead = state.leadModal.lead || {};
  const isEdit = state.leadModal.mode === "edit";
  const logoRaw = state.leadModal.logoPreview || lead.logoUrl || lead.logo || lead.imageUrl || "";
  const logoUrl = logoRaw ? getOptimizedImage(logoRaw, "avatar") : PLACEHOLDER_IMAGE;
  const bestSpotLogoRaw = state.leadModal.bestSpotLogoPreview || lead.bestSpotLogoUrl || lead.spotLogoUrl || logoRaw;
  const bestSpotLogoUrl = bestSpotLogoRaw ? getOptimizedImage(bestSpotLogoRaw, "avatar") : PLACEHOLDER_IMAGE;
  const titleImageRaw = state.leadModal.titleImagePreview || lead.titleImageUrl || lead.coverImageUrl || lead.coverUrl || lead.heroUrl || "";
  const titleImageUrl = titleImageRaw ? getOptimizedImage(titleImageRaw, "medium") : PLACEHOLDER_IMAGE;
  const status = state.leadModal.status || "";
  const customerType = resolveCustomer(lead.customerType || "cafe");
  const leadEmail = lead.socialEmail || lead.email || "";
  const leadStatus = normalizeStatus(lead.status || "registered") || "registered";
  const leadInstagram = lead.instagram || lead.insta || "";
  const businessNameColors = resolveBusinessNamePartColors(lead);
  const specialEnabled = lead.specialEnabled === true;
  const locations = normalizeLocations(state.leadModal.locations, lead.address || "", state.leadModal.coords || null);
  const canConvert = isEdit && !!lead.id && normalizeStatus(lead.status || "") !== "kunde";

  const headerHtml = `
    <div class="flex items-start justify-between px-6 pt-6 pb-4 border-b border-slate-100">
      <div>
        <span class="text-[9px] font-black text-indigo-600 uppercase tracking-widest">${isEdit ? "Ndrysho" : "I ri"}</span>
        <h3 class="text-xl font-black italic tracking-tighter">${isEdit ? "Ndrysho lead-in" : "Lead i ri"}</h3>
      </div>
      <button id="leadModalClose" class="w-11 h-11 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-500">
        ${iconFn("x", "w-4 h-4")}
      </button>
    </div>
  `;

  const bodyHtml = `
    <div class="flex-1 overflow-y-auto no-scrollbar modal-scroll px-6 py-5 space-y-4">
      <input type="file" id="leadLogoInput" class="hidden" accept="image/*" />
      <div class="rounded-[2.5rem] overflow-hidden border border-slate-100 bg-slate-50">
        <img id="leadLogoPreview" src="${esc(logoUrl)}" class="w-full h-44 object-contain bg-white" />
      </div>
      <button id="leadLogoTrigger" class="w-full py-3 rounded-2xl bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest">
        Ngarko logon
      </button>
      <input type="file" id="leadBestSpotLogoInput" class="hidden" accept="image/*" />
      <div class="rounded-[2.5rem] overflow-hidden border border-slate-100 bg-slate-50">
        <img id="leadBestSpotLogoPreview" src="${esc(bestSpotLogoUrl)}" class="w-full h-44 object-cover bg-white" />
      </div>
      <button id="leadBestSpotLogoTrigger" class="w-full py-3 rounded-2xl bg-slate-100 text-slate-700 text-[10px] font-black uppercase tracking-widest">
        Ngarko logon Best-Spot
      </button>
      <input type="file" id="leadTitleImageInput" class="hidden" accept="image/*" />
      <div class="rounded-[2.5rem] overflow-hidden border border-slate-100 bg-slate-50">
        <img id="leadTitleImagePreview" src="${esc(titleImageUrl)}" class="w-full h-44 object-cover bg-white" />
      </div>
      <button id="leadTitleImageTrigger" class="w-full py-3 rounded-2xl bg-slate-100 text-slate-700 text-[10px] font-black uppercase tracking-widest">
        Ngarko foton e titullit
      </button>

      <div class="p-5 rounded-[2rem] border border-slate-100 bg-white space-y-4">
        <div>
          <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Business Name</label>
          <input id="leadBusinessName" type="text" value="${esc(lead.businessName || lead.name || "")}" placeholder="Business Name" class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100" />
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Ngjyra pjesa 1</label>
            <input id="leadBusinessNameColorPart1" type="text" value="${esc(businessNameColors.part1)}" placeholder="#111827" class="w-full px-4 py-3 bg-slate-50 rounded-2xl text-sm font-black uppercase border-none outline-none focus:ring-2 focus:ring-indigo-100" />
          </div>
          <div>
            <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Ngjyra pjesa 2</label>
            <input id="leadBusinessNameColorPart2" type="text" value="${esc(businessNameColors.part2)}" placeholder="#4f46e5" class="w-full px-4 py-3 bg-slate-50 rounded-2xl text-sm font-black uppercase border-none outline-none focus:ring-2 focus:ring-indigo-100" />
          </div>
        </div>
        <div>
          <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Typ</label>
          <select id="leadCustomerType" class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100">
            ${typeOrder.map((key) => `
              <option value="${key}" ${customerType === key ? "selected" : ""}>${typeLabels[key]}</option>
            `).join("")}
          </select>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Kontakt</label>
            <input id="leadContactName" type="text" value="${esc(lead.contactName || lead.contact || "")}" placeholder="Emri i kontaktit" class="w-full px-4 py-3 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100" />
          </div>
          <div>
            <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Telefon</label>
            <input id="leadPhone" type="text" value="${esc(lead.phone || "")}" placeholder="+383" class="w-full px-4 py-3 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100" />
          </div>
        </div>
        <div>
          <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Instagram</label>
          <input id="leadInstagram" type="text" value="${esc(leadInstagram)}" placeholder="@mnyra" class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100" />
        </div>
        <div>
          <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Email (Login)</label>
          <input id="leadEmail" type="email" value="${esc(leadEmail)}" placeholder="owner@mnyra.com" class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100" />
        </div>
        <div>
          <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Fjalekalimi (opsional)</label>
          <input id="leadPassword" type="password" value="${esc(lead.password || "")}" placeholder="bosh = nuk krijohet login" class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100" />
        </div>
        <div>
          <label class="text-[10px] font-black text-slate-400 uppercase ml-2">City</label>
          <input id="leadCity" type="text" value="${esc(lead.city || "")}" placeholder="Prishtina" class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100" />
        </div>
        <div class="space-y-3">
          <div class="flex items-center justify-between">
            <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Vendndodhjet</label>
            <button type="button" data-lead-location-add class="px-3 py-2 rounded-xl bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
              ${iconFn("plus", "w-3.5 h-3.5")} Shto vendndodhje
            </button>
          </div>
          ${locations.map((location, index) => {
            const fixed = hasCoords(location);
            return `
              <div class="bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100/50 space-y-3">
                <div class="flex items-center justify-between">
                  <p class="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Vendndodhja ${index + 1}</p>
                  ${index > 0 ? `
                    <button type="button" data-lead-location-remove="${index}" class="w-8 h-8 rounded-lg bg-white text-slate-500 flex items-center justify-center border border-slate-200">
                      ${iconFn("x", "w-3.5 h-3.5")}
                    </button>
                  ` : ""}
                </div>
                <input
                  id="leadLocationAddress_${index}"
                  data-lead-location-address="${index}"
                  type="text"
                  value="${esc(location.address || "")}"
                  placeholder="Adresa per vendndodhjen ${index + 1}"
                  class="w-full px-5 py-4 bg-white rounded-2xl text-sm font-bold border border-slate-100 outline-none focus:ring-2 focus:ring-indigo-100"
                />
                <div id="leadLocationCoords_${index}" class="text-[9px] font-bold text-emerald-600 flex items-center gap-1 ${fixed ? "" : "hidden"}">
                  ${iconFn("check-circle-2", "w-3 h-3")} Vendndodhja u fiksua ne harte!
                </div>
                <button type="button" data-lead-location-pick="${index}" class="w-full bg-indigo-600 text-white py-3 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-transform">
                  ${iconFn("map-pin", "w-3.5 h-3.5")} Auf Karte festlegen
                </button>
              </div>
            `;
          }).join("")}
        </div>
        <div>
          <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Logo URL (optional)</label>
          <input id="leadLogoUrl" type="text" value="${esc(lead.logoUrl || lead.logo || "")}" placeholder="https://..." class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100" />
        </div>
        <div>
          <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Best Spot Logo URL (optional)</label>
          <input id="leadBestSpotLogoUrl" type="text" value="${esc(lead.bestSpotLogoUrl || lead.spotLogoUrl || "")}" placeholder="https://..." class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100" />
        </div>
        <div>
          <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Titelbild URL (optional)</label>
          <input id="leadTitleImageUrl" type="text" value="${esc(lead.titleImageUrl || lead.coverImageUrl || lead.coverUrl || lead.heroUrl || "")}" placeholder="https://..." class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100" />
        </div>
        <div>
          <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Orari i punes</label>
          <input id="leadOpeningHours" type="text" value="${esc(lead.openingHours || lead.hours || "")}" placeholder="Hene - Diel: 11:00 - 22:00" class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100" />
        </div>
        <div>
          <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Garten / Terrasse</label>
          <input id="leadGardenTerraceText" type="text" value="${esc(lead.gardenTerraceText || lead.restaurantFeatures?.gardenTerrace || "")}" placeholder="Kopsht / terrace" class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100" />
        </div>
        <div>
          <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Barrierefrei</label>
          <input id="leadAccessibilityText" type="text" value="${esc(lead.accessibilityText || lead.restaurantFeatures?.accessibility || "")}" placeholder="Pa pengesa" class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100" />
        </div>
        <div>
          <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Vegane Optionen</label>
          <input id="leadVeganOptionsText" type="text" value="${esc(lead.veganOptionsText || lead.restaurantFeatures?.veganOptions || "")}" placeholder="Opsione vegane" class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100" />
        </div>
        <div>
          <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Status</label>
          <select id="leadStatus" class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100">
            ${statusOrder.map((key) => `
              <option value="${key}" ${leadStatus === key ? "selected" : ""}>${statusLabels[key]}</option>
            `).join("")}
          </select>
        </div>
        <div>
          <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Notiz</label>
          <textarea id="leadNote" rows="3" placeholder="Shenim i shkurter..." class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100 resize-none">${esc(lead.note || "")}</textarea>
        </div>
        <label class="flex items-center justify-between gap-4 px-4 py-3 rounded-2xl bg-slate-50 border border-slate-100">
          <span class="text-[10px] font-black text-slate-500 uppercase tracking-widest">Aktivizo Special</span>
          <input id="leadSpecialEnabled" type="checkbox" class="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-200" ${specialEnabled ? "checked" : ""} />
        </label>
        ${renderLeadPublicVisibilityBlock(lead, { typeKey: customerType, escapeHtml: esc, icon: iconFn })}
      </div>
    </div>
  `;

  const footerHtml = `
    <div class="px-6 pb-6 pt-4 border-t border-slate-100 bg-white modal-footer-safe">
      ${canConvert ? `
        <button id="leadConvertBtn" class="w-full py-4 rounded-[1.8rem] bg-emerald-600 text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-emerald-500/20 active:scale-95 transition-all mb-3">
          Zu Kunde
        </button>
      ` : ""}
      <button id="leadModalSave" class="w-full py-4 rounded-[1.8rem] bg-indigo-600 text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-500/20 active:scale-95 transition-all" ${state.leadModal.loading ? "disabled" : ""}>
        ${state.leadModal.loading ? "Duke ruajtur..." : "Ruaj"}
      </button>
      <div class="text-center text-[10px] font-bold text-slate-400 mt-3">${esc(status)}</div>
    </div>
  `;

  return `
    <div class="fixed inset-0 z-[75] modal-overlay" data-modal-surface="#ffffff" style="--modal-surface:#ffffff;">
      <div id="leadModalOverlay" class="absolute inset-0 bg-black/60"></div>
      <div class="modal-frame">
        <div class="bg-white rounded-t-[3rem] shadow-2xl border border-slate-100 flex flex-col modal-sheet-85 overflow-hidden modal-sheet">
          ${headerHtml}
          ${bodyHtml}
          ${footerHtml}
        </div>
      </div>
    </div>
  `;
}
