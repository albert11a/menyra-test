import { isTestfirstMenuProfileTypeCore, normalizeMenuCardStyleCore } from "./menu-card-style-utils.js";
import { isVideoMediaItemCore } from "../media/video-poster-utils.js";
import { t } from "/shared/i18n/i18n.js";

const MENU_CATEGORY_MASTER_LIST = Object.freeze([
  "Fruehstueck",
  "Brunch",
  "Vorspeise",
  "Suppe",
  "Salat",
  "Pasta",
  "Pizza",
  "Burger",
  "Sandwich",
  "Wrap",
  "Grill",
  "Fleisch",
  "Fisch",
  "Vegetarisch",
  "Vegan",
  "Beilage",
  "Kinder",
  "Dessert",
  "Kuchen",
  "Eis",
  "Kaffee",
  "Tee",
  "Softdrink",
  "Saft",
  "Smoothie",
  "Bier",
  "Wein",
  "Cocktail",
  "Spirituose",
  "Sonstiges"
]);

function parseMenuStockValue(value) {
  if (value === null || value === undefined) return null;
  const raw = typeof value === "string" ? value.trim() : value;
  if (raw === "") return null;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? Math.max(0, parsed) : null;
}

function isLegacyShopMenuCategoryValue(value = "") {
  const normalized = String(value || "").trim().toLowerCase();
  return ["speisen", "food", "getraenke", "getränke", "drink", "drinks", "beverage", "beverages"].includes(normalized);
}

function normalizeShopMenuCategoryLabel(value = "") {
  const raw = String(value || "").trim();
  if (!raw) return "";
  return isLegacyShopMenuCategoryValue(raw) ? "Produkte" : raw;
}

export function renderMenuItemModalCore({
  state,
  isShopCatalogProfile,
  getBusinessProfileType,
  getOptimizedImageUrl,
  PLACEHOLDER_IMAGE,
  isPlaceholderUrl,
  normalizeMenuType,
  getMenuModalCrop,
  escapeHtml,
  icon
} = {}) {
  if (!state || !state.menuModal?.open) return "";
  const isShopCatalog = typeof isShopCatalogProfile === "function" ? isShopCatalogProfile : (() => false);
  const getBusinessType = typeof getBusinessProfileType === "function"
    ? getBusinessProfileType
    : (() => "");
  const getOptimizedImage = typeof getOptimizedImageUrl === "function"
    ? getOptimizedImageUrl
    : ((value) => String(value || ""));
  const isPlaceholder = typeof isPlaceholderUrl === "function"
    ? isPlaceholderUrl
    : (() => false);
  const normalizeType = typeof normalizeMenuType === "function"
    ? normalizeMenuType
    : ((value) => String(value || "food"));
  const getCrop = typeof getMenuModalCrop === "function"
    ? getMenuModalCrop
    : (() => ({ x: 50, y: 50 }));
  const esc = typeof escapeHtml === "function" ? escapeHtml : ((value) => String(value || ""));
  const iconFn = typeof icon === "function" ? icon : (() => "");
  const formatEditorPrice = (value) => {
    const num = Number(value);
    if (Number.isFinite(num)) return `${num.toFixed(2).replace(".", ",")} EUR`;
    const raw = String(value || "").trim();
    return raw || "0,00 EUR";
  };
  const normalizeCrossSellItemIds = (value, { excludeId = "" } = {}) => {
    const blockedId = String(excludeId || "").trim();
    const seen = new Set();
    const pushId = (entry) => {
      if (entry === null || entry === undefined) return;
      if (Array.isArray(entry)) {
        entry.forEach(pushId);
        return;
      }
      const raw = typeof entry === "object"
        ? (entry.id || entry.itemId || entry.productId || entry.menuItemId || "")
        : entry;
      const str = String(raw || "").trim();
      if (!str) return;
      str.split(",").forEach((part) => {
        const next = String(part || "").trim();
        if (!next || next === blockedId || seen.has(next)) return;
        seen.add(next);
      });
    };
    pushId(value);
    return Array.from(seen);
  };

  const item = state.menuModal.item || {};
  const isEdit = state.menuModal.mode === "edit";
  const isShop = isShopCatalog(state.userProfile);
  const title = isEdit ? "Ndrysho produktin" : "Shto produkt";
  const existingImages = Array.isArray(state.menuModal.existingImages) ? state.menuModal.existingImages : [];
  const newPreviews = Array.isArray(state.menuModal.imagePreviews) ? state.menuModal.imagePreviews : [];
  const imageUrlDraft = String(state.menuModal.imageUrlDraft || "").trim();
  const gallery = [
    ...existingImages.map((src, idx) => ({ src, kind: "existing", idx })),
    ...newPreviews.map((src, idx) => ({ src, kind: "new", idx }))
  ].filter((img) => img.src);
  const heroRaw = gallery[0]?.src || imageUrlDraft || item.imageUrl || "";
  const heroUrl = heroRaw ? getOptimizedImage(heroRaw, "large") : PLACEHOLDER_IMAGE;
  const safeImage = isPlaceholder(heroUrl) ? PLACEHOLDER_IMAGE : heroUrl;
  // Video-Vorschau im Editor: entweder frisch ausgewaehltes Video (Blob-URL)
  // oder ein bereits gespeichertes Video. Sobald neue Fotos hinzukommen, gilt
  // das Item wieder als Foto.
  const draftVideoUrl = String(state.menuModal.videoPreview || "").trim();
  const draftVideoPoster = String(state.menuModal.videoPosterPreview || "").trim();
  const hasDraftVideo = !!(state.menuModal.videoFile && draftVideoUrl);
  const newImagesAdded = newPreviews.length > 0;
  const itemIsVideo = isVideoMediaItemCore(item) && !newImagesAdded && !hasDraftVideo;
  const heroIsVideo = hasDraftVideo || itemIsVideo;
  const heroVideoUrl = hasDraftVideo
    ? draftVideoUrl
    : (itemIsVideo ? String(item.videoUrl || "").trim() : "");
  const heroVideoPoster = hasDraftVideo
    ? draftVideoPoster
    : (itemIsVideo ? getOptimizedImage(String(item.posterUrl || item.imageUrl || "").trim(), "large") : "");
  const typeValue = normalizeType(item.type || "food");
  const isFoodOrDrinkEditor = typeValue === "food" || typeValue === "drink";
  const available = item.available !== false;
  const visibilityValue = available ? "available" : "unavailable";
  const status = state.menuModal.status || "";
  const sizesValue = Array.isArray(item.sizes) ? item.sizes.join(", ") : "";
  const colorsValue = Array.isArray(item.colors) ? item.colors.join(", ") : "";
  const stockParsed = parseMenuStockValue(item.stock);
  const stockValue = stockParsed === null ? "" : String(stockParsed);
  const crop = getCrop();
  const businessType = String(getBusinessType(state.userProfile) || "").trim().toLowerCase();
  const showCardStyleSelector = !isShop && isTestfirstMenuProfileTypeCore(businessType);
  const resolveSpecialEnabled = () => {
    const profileFlag = state?.userProfile?.specialEnabled;
    if (typeof profileFlag === "boolean") return profileFlag;
    const restaurantId = String(state?.userProfile?.restaurantId || "").trim();
    if (!restaurantId) return false;
    const restaurant = Array.isArray(state?.restaurants)
      ? state.restaurants.find((entry) => String(entry?.id || "").trim() === restaurantId)
      : null;
    return restaurant?.specialEnabled === true;
  };
  const specialEnabled = resolveSpecialEnabled();
  const cardStyleValue = normalizeMenuCardStyleCore(item.cardStyle || "", typeValue);
  const isSpecialCard = cardStyleValue === "testfirst_special"
    || String(item.category || "").trim().toLowerCase() === "special";
  const showSmallCardCropControl = showCardStyleSelector && !isSpecialCard && cardStyleValue === "testfirst_drink";
  const resolveCropPreset = (value) => {
    const numeric = Number(value);
    if (!Number.isFinite(numeric)) return "center";
    if (numeric <= 33) return "left";
    if (numeric >= 67) return "right";
    return "center";
  };
  const cropPreset = resolveCropPreset(crop.x);
  const rawCategoryValue = String(item.category || (isShop ? "Produkte" : "Sonstiges")).trim() || (isShop ? "Produkte" : "Sonstiges");
  const categoryValue = isShop ? normalizeShopMenuCategoryLabel(rawCategoryValue) : rawCategoryValue;
  const categoryIsSpecial = (value) => String(value || "").trim().toLowerCase() === "special";
  const categoryOptions = Array.from(
    new Set([
      categoryValue,
      ...(Array.isArray(state.menu?.items) ? state.menu.items.map((entry) => String(entry?.category || "").trim()) : []),
      ...(isShop ? ["Produkte"] : MENU_CATEGORY_MASTER_LIST)
    ].filter((entry) => {
      if (!entry) return false;
      if (isShop && isLegacyShopMenuCategoryValue(entry)) return false;
      if (!specialEnabled && categoryIsSpecial(entry)) return false;
      return true;
    }))
  );
  const categoryListId = "menuItemCategoryOptions";
  const specialSizeValue = String(item.specialSize || item.specialCardSize || "").trim().toLowerCase() === "food"
    ? "food"
    : "default";
  const specialActionTypeRaw = String(item.specialActionType || item.actionType || "").trim().toLowerCase();
  const specialActionType = specialActionTypeRaw === "link" ? "link" : "product";
  const specialActionUrl = String(item.specialActionUrl || item.linkUrl || item.actionUrl || "").trim();
  const specialActionProductId = String(item.specialActionProductId || item.targetProductId || "").trim();
  const ingredientsValue = String(item.ingredients || item.ingredient || item.inhaltsstoffe || "").trim();
  const woltUrl = String(item.woltUrl || item.woltLink || "").trim();
  const currentItemId = String(item.id || "").trim();
  const normalizeOrderIndex = (value, fallback = 0) => {
    const numeric = Number(value);
    if (!Number.isFinite(numeric)) return Math.max(0, Number(fallback) || 0);
    return Math.max(0, Math.floor(numeric));
  };
  const sortedMenuItems = Array.isArray(state.menu?.items)
    ? state.menu.items
      .slice()
      .map((entry, idx) => ({ entry, idx, order: normalizeOrderIndex(entry?.orderIndex, idx) }))
      .sort((a, b) => (a.order - b.order) || (a.idx - b.idx))
      .map((wrapped) => wrapped.entry)
    : [];
  const positionAnchors = sortedMenuItems.filter((entry) => String(entry?.id || "").trim() !== currentItemId);
  const currentItemOrderIndex = sortedMenuItems.findIndex((entry) => String(entry?.id || "").trim() === currentItemId);
  const orderOptionCount = Math.max(1, positionAnchors.length + 1);
  const defaultOrderPosition = currentItemOrderIndex >= 0
    ? Math.min(orderOptionCount, Math.max(1, currentItemOrderIndex + 1))
    : orderOptionCount;
  const orderPositionValue = Math.min(
    orderOptionCount,
    Math.max(
      1,
      Number.isFinite(Number(item.orderIndex))
        ? (normalizeOrderIndex(item.orderIndex, defaultOrderPosition - 1) + 1)
        : defaultOrderPosition
    )
  );
  const specialTargetProducts = Array.isArray(state.menu?.items)
    ? state.menu.items.filter((entry) => {
      const id = String(entry?.id || "").trim();
      if (!id) return false;
      if (id === currentItemId) return false;
      return true;
    })
    : [];
  const crossSellItemIds = normalizeCrossSellItemIds(
    item.crossSellItemIds
      || item.crossSellIds
      || item.crossSell
      || item.crossSelling,
    { excludeId: currentItemId }
  );
  const crossSellCandidates = sortedMenuItems.filter((entry) => {
    const id = String(entry?.id || "").trim();
    if (!id) return false;
    if (id === currentItemId) return false;
    const entryType = String(entry?.type || "").trim().toLowerCase();
    const entrySection = String(entry?.menuSection || "").trim().toLowerCase();
    return entryType === "food" || entryType === "drink" || entrySection === "food" || entrySection === "drink";
  });

  const titleId = "menuModalTitle";
  const headerHtml = `
    <div class="flex items-start justify-between px-6 pt-6 pb-4 border-b border-slate-100">
      <div>
        <span class="text-[9px] font-black text-indigo-600 uppercase tracking-widest">${isEdit ? "Ndrysho" : "I ri"}</span>
        <h3 id="${titleId}" class="text-xl font-black italic tracking-tighter">${title}</h3>
      </div>
      <button id="menuModalClose" class="w-11 h-11 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-500">
        ${iconFn("x", "w-4 h-4")}
      </button>
    </div>
  `;
  const bodyHtml = `
    <div class="flex-1 overflow-y-auto no-scrollbar modal-scroll px-6 py-5 space-y-4">
      <input type="file" id="menuItemImageInput" class="hidden" accept="image/*,video/*" multiple />
      <div class="relative rounded-[2.5rem] overflow-hidden border border-slate-100 bg-slate-50">
        ${heroIsVideo ? `
          <video id="menuItemHeroVideo" src="${esc(heroVideoUrl)}" ${heroVideoPoster ? `poster="${esc(heroVideoPoster)}"` : ""} class="w-full h-52 object-cover" style="object-position:${crop.x}% ${crop.y}%;" muted loop playsinline autoplay preload="metadata"></video>
          <span class="absolute bottom-3 left-3 px-2.5 py-1 rounded-full bg-slate-900/80 text-white text-[9px] font-black uppercase tracking-widest flex items-center gap-1">
            ${iconFn("play", "w-3 h-3")} Video
          </span>
        ` : `
          <img id="menuItemHeroPreview" src="${esc(safeImage)}" class="w-full h-52 object-cover" style="object-position:${crop.x}% ${crop.y}%;" />
        `}
        <button type="button" id="menuItemImageTrigger" aria-label="Ngarko foto ose video" class="absolute top-3 right-3 w-11 h-11 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-lg active:scale-95 transition-transform">
          ${iconFn("camera", "w-5 h-5")}
          <span class="absolute -right-1 -bottom-1 w-4 h-4 rounded-full bg-indigo-500 text-white flex items-center justify-center border border-white">
            ${iconFn("plus", "w-2.5 h-2.5")}
          </span>
        </button>
      </div>
      ${heroIsVideo ? `
        <button type="button" id="menuItemVideoRemove" class="w-full py-3 rounded-2xl bg-slate-100 text-slate-600 text-[10px] font-black uppercase tracking-widest active:scale-95 transition-transform">
          Hiq videon
        </button>
      ` : ""}
      <div class="p-4 rounded-[1.8rem] border border-slate-100 bg-white space-y-3">
        <div class="flex items-center justify-between">
          <p class="text-[10px] font-black uppercase tracking-widest text-slate-400">Crop Horizontal</p>
          <span id="menuCropXValue" class="text-[10px] font-black uppercase tracking-widest text-slate-500">${crop.x}%</span>
        </div>
        <input id="menuItemCropX" type="range" min="0" max="100" step="1" value="${crop.x}" class="w-full accent-indigo-600" />
        <div id="menuSmallCardCropControl" class="${showSmallCardCropControl ? "" : "hidden"} space-y-2">
          <div class="flex items-center justify-between">
            <p class="text-[10px] font-black uppercase tracking-widest text-slate-400">Small Card Crop</p>
            <span class="text-[10px] font-bold text-slate-400">1:1</span>
          </div>
          <div class="grid grid-cols-3 gap-2">
            <button type="button" data-menu-small-crop="left" class="h-10 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all ${cropPreset === "left" ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-500 border-slate-200"}">Links</button>
            <button type="button" data-menu-small-crop="center" class="h-10 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all ${cropPreset === "center" ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-500 border-slate-200"}">Mitte</button>
            <button type="button" data-menu-small-crop="right" class="h-10 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all ${cropPreset === "right" ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-500 border-slate-200"}">Rechts</button>
          </div>
          <p class="text-[10px] font-bold text-slate-400 px-1">Vetem per Small Drink Card (menuja publike).</p>
        </div>
        <div class="flex items-center justify-between">
          <p class="text-[10px] font-black uppercase tracking-widest text-slate-400">Crop Vertikal</p>
          <span id="menuCropYValue" class="text-[10px] font-black uppercase tracking-widest text-slate-500">${crop.y}%</span>
        </div>
        <input id="menuItemCropY" type="range" min="0" max="100" step="1" value="${crop.y}" class="w-full accent-indigo-600" />
      </div>
      <div class="p-4 rounded-[1.8rem] border border-slate-100 bg-white space-y-3">
        <div class="flex items-center justify-between">
          <p class="text-[10px] font-black uppercase tracking-widest text-slate-400">Fotos</p>
          <span class="text-[10px] font-black uppercase tracking-widest text-slate-500">${gallery.length}</span>
        </div>
        ${gallery.length ? `
          <div class="grid grid-cols-3 gap-2">
            ${gallery.map((img) => `
              <div class="relative rounded-xl overflow-hidden border border-slate-100 bg-slate-50 aspect-square">
                <img src="${esc(getOptimizedImage(img.src, "thumb"))}" class="w-full h-full object-cover" />
                <button type="button" data-menu-image-remove="${img.idx}" data-menu-image-source="${img.kind}" class="absolute top-1 right-1 w-6 h-6 rounded-full bg-white/90 text-slate-600 text-[10px] flex items-center justify-center shadow">
                  ${iconFn("x", "w-3 h-3")}
                </button>
              </div>
            `).join("")}
          </div>
        ` : `
          <div class="h-20 rounded-2xl border border-dashed border-slate-200 bg-slate-50 flex items-center justify-center text-[10px] font-black uppercase tracking-widest text-slate-300">
            Ende nuk ka foto
          </div>
        `}
      </div>

      <div class="p-5 rounded-[2rem] border border-slate-100 bg-white space-y-4">
        <div>
          <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Name</label>
          <input id="menuItemName" type="text" value="${esc(item.name || "")}" placeholder="Emri i produktit" class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100" />
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Cmimi</label>
            <input id="menuItemPrice" type="text" value="${esc(item.price ?? "")}" placeholder="z.B. 4.50" class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100" />
          </div>
          <div>
            <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Kategorie</label>
            <input id="menuItemCategory" list="${categoryListId}" type="text" value="${esc(categoryValue)}" placeholder="Shkruaj kategorine" class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100" />
            <datalist id="${categoryListId}">
              ${categoryOptions.map((category) => `<option value="${esc(category)}"></option>`).join("")}
            </datalist>
          </div>
        </div>
        ${isShop ? `
          <input id="menuItemType" type="hidden" value="food" />
        ` : `
          <div>
            <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Typ</label>
            <select id="menuItemType" class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100">
              <option value="food" ${typeValue === "food" ? "selected" : ""}>Speise</option>
              <option value="drink" ${typeValue === "drink" ? "selected" : ""}>Getraenk</option>
            </select>
          </div>
        `}
        <div>
          <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Status</label>
          <select id="menuItemVisibility" class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100">
            <option value="available" ${visibilityValue === "available" ? "selected" : ""}>E disponueshme</option>
            <option value="unavailable" ${visibilityValue === "unavailable" ? "selected" : ""}>Ausverkauft</option>
          </select>
        </div>
        ${specialEnabled && showCardStyleSelector && isSpecialCard ? `
          <div>
            <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Position im aktiven Menue</label>
            <select id="menuItemOrderPosition" class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100">
              ${Array.from({ length: orderOptionCount }, (_, index) => {
                const pos = index + 1;
                const beforeItem = positionAnchors[pos - 1] || null;
                const afterItem = pos > 1 ? positionAnchors[pos - 2] : null;
                const label = pos === 1
                  ? "Ganz oben"
                  : (pos === orderOptionCount
                    ? "Ganz unten"
                    : `Nach ${String(afterItem?.name || "Produkt").trim() || "Produkt"}`);
                const helper = beforeItem
                  ? ` (vor ${String(beforeItem?.name || "Produkt").trim() || "Produkt"})`
                  : "";
                return `<option value="${pos}" ${orderPositionValue === pos ? "selected" : ""}>Position ${pos}: ${esc(label)}${esc(helper)}</option>`;
              }).join("")}
            </select>
            <p class="text-[10px] font-bold text-slate-400 mt-2 px-2">Thjesht zgjidh ne vend te drag and drop.</p>
          </div>
        ` : ""}
        ${showCardStyleSelector && !isSpecialCard ? `
          <div>
            <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Card Style</label>
            <select id="menuItemCardStyle" class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100">
              <option value="testfirst_drink" ${cardStyleValue === "testfirst_drink" ? "selected" : ""}>Small = Drink Card</option>
              <option value="testfirst_food" ${cardStyleValue === "testfirst_food" ? "selected" : ""}>Big = Food Card</option>
            </select>
          </div>
        ` : ""}
        ${specialEnabled && showCardStyleSelector && isSpecialCard ? `
          <input id="menuItemCardStyle" type="hidden" value="testfirst_special" />
          <div>
            <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Madhesia Special</label>
            <select id="menuItemSpecialSize" class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100">
              <option value="default" ${specialSizeValue === "default" ? "selected" : ""}>Normal</option>
              <option value="food" ${specialSizeValue === "food" ? "selected" : ""}>Madhesia e Food-Card</option>
            </select>
            <p class="text-[10px] font-bold text-slate-400 mt-2 px-2">Relevante vetem per Special-Card.</p>
          </div>
          <div>
            <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Veprimi i klikimit Special</label>
            <select id="menuItemSpecialActionType" class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100">
              <option value="product" ${specialActionType === "product" ? "selected" : ""}>Hap modalin e produktit</option>
              <option value="link" ${specialActionType === "link" ? "selected" : ""}>Hap ridrejtimin / linkun</option>
            </select>
          </div>
          <div id="menuItemSpecialActionProductField" class="${specialActionType === "product" ? "" : "hidden"}">
            <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Special Ziel-Produkt</label>
            <select id="menuItemSpecialActionProductId" class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100">
              <option value="">Pa produkt</option>
              ${specialTargetProducts.map((entry) => {
                const id = String(entry?.id || "").trim();
                const label = String(entry?.name || "Produkt").trim() || "Produkt";
                return `<option value="${esc(id)}" ${specialActionProductId === id ? "selected" : ""}>${esc(label)}</option>`;
              }).join("")}
            </select>
            <p class="text-[10px] font-bold text-slate-400 mt-2 px-2">Perdoret kur veprimi i klikimit = modal i produktit.</p>
          </div>
          <div id="menuItemSpecialActionLinkField" class="${specialActionType === "link" ? "" : "hidden"}">
            <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Special Link</label>
            <input id="menuItemSpecialActionUrl" type="text" value="${esc(specialActionUrl)}" placeholder="https://..." class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100" />
            <p class="text-[10px] font-bold text-slate-400 mt-2 px-2">Perdoret kur veprimi i klikimit = link.</p>
          </div>
        ` : ""}
        <div>
          <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Pershkrimi</label>
          <textarea id="menuItemDesc" rows="3" placeholder="Pershkrimi..." class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100 resize-none">${esc(item.description || "")}</textarea>
        </div>
        ${!isShop ? `
          <div>
            <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Inhaltsstoffe</label>
            <textarea id="menuItemIngredients" rows="3" placeholder="z.B. Wasser, Zucker, Salz..." class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100 resize-none">${esc(ingredientsValue)}</textarea>
          </div>
        ` : ""}
        ${!isShop ? `
          <div>
            <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Wolt Link</label>
            <input id="menuItemWoltUrl" type="url" value="${esc(woltUrl)}" placeholder="https://wolt.com/..." class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100" />
            <p class="text-[10px] font-bold text-slate-400 mt-2 px-2">Opsionale: shfaqet ne dritaren e produktit kur nuk ka qasje QR ne menu.</p>
          </div>
        ` : ""}
        ${isShop ? `
          <div>
            <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Details</label>
            <textarea id="menuItemLongDesc" rows="4" placeholder="Materiali, gjendja, detajet e dorezimit..." class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100 resize-none">${esc(item.longDescription || "")}</textarea>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Marka</label>
              <input id="menuItemBrand" type="text" value="${esc(item.brand || "")}" placeholder="z.B. Nike" class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100" />
            </div>
            <div>
              <label class="text-[10px] font-black text-slate-400 uppercase ml-2">SKU</label>
              <input id="menuItemSku" type="text" value="${esc(item.sku || "")}" placeholder="ART-001" class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100" />
            </div>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Madhesite</label>
              <input id="menuItemSizes" type="text" value="${esc(sizesValue)}" placeholder="XS, S, M, L" class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100" />
            </div>
            <div>
              <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Ngjyrat</label>
              <input id="menuItemColors" type="text" value="${esc(colorsValue)}" placeholder="E zeze, e bardhe" class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100" />
            </div>
          </div>
          <div>
            <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Lagerbestand</label>
            <input id="menuItemStock" type="number" min="0" inputmode="numeric" value="${esc(stockValue)}" placeholder="0" class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100" />
          </div>
        ` : ""}
        <div>
          <label class="text-[10px] font-black text-slate-400 uppercase ml-2">${isShop ? "Shenime" : "Alergenet"}</label>
          <input id="menuItemAllergens" type="text" value="${esc(item.allergens || "")}" placeholder="${isShop ? "p.sh. edicion i limituar, pa kthim" : "z.B. Milch, Gluten"}" class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100" />
        </div>
        ${!isShop && isFoodOrDrinkEditor ? `
          <div>
            <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Cross Selling (QR)</label>
            <div class="mt-2 p-3 rounded-2xl border border-slate-200 bg-slate-50 max-h-48 overflow-y-auto no-scrollbar space-y-2">
              ${crossSellCandidates.length ? crossSellCandidates.map((entry) => {
                const entryId = String(entry?.id || "").trim();
                const entryName = String(entry?.name || "Produkt").trim() || "Produkt";
                const entryCategory = String(entry?.category || "").trim();
                const entryPrice = formatEditorPrice(entry?.price);
                return `
                  <label class="flex items-start gap-3 p-2.5 rounded-xl bg-white border border-slate-200">
                    <input type="checkbox" data-menu-cross-sell-option value="${esc(entryId)}" ${crossSellItemIds.includes(entryId) ? "checked" : ""} class="mt-0.5 w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-200" />
                    <span class="min-w-0 flex-1">
                      <span class="block text-xs font-black text-slate-800 truncate">${esc(entryName)}</span>
                      <span class="block text-[10px] font-bold uppercase tracking-wide text-slate-400">${esc(entryCategory || "Produkt")} · ${esc(entryPrice)}</span>
                    </span>
                  </label>
                `;
              }).join("") : `<p class="text-[10px] font-bold uppercase tracking-wide text-slate-400 px-2 py-1">Nuk ka me ushqime/pije te disponueshme</p>`}
            </div>
            <p class="text-[10px] font-bold text-slate-400 mt-2 px-2">Shfaqet vetem ne dritaren e produktit kur menuja hapet me QR kod.</p>
          </div>
        ` : ""}
      </div>
    </div>
  `;
  const footerHtml = `
    <div class="px-6 pb-6 pt-4 border-t border-slate-100 bg-white modal-footer-safe">
      <button id="menuModalSave" class="w-full py-4 rounded-[1.8rem] bg-indigo-600 text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-500/20 active:scale-95 transition-all" ${state.menuModal.loading ? "disabled" : ""}>
        ${state.menuModal.loading ? "Duke ruajtur..." : "Ruaj"}
      </button>
      <div class="text-center text-[10px] font-bold text-slate-400 mt-3">${esc(status)}</div>
    </div>
  `;
  const animClass = "";

  return `
    <div class="fixed inset-0 z-[75] modal-overlay" data-modal-surface="#ffffff" style="--modal-surface:#ffffff;">
      <div id="menuModalOverlay" class="absolute inset-0 bg-black/60"></div>
      <div class="modal-frame">
        <div class="bg-white rounded-t-[3rem] shadow-2xl border border-slate-100 ${animClass} flex flex-col modal-sheet-85 overflow-hidden modal-sheet">
          ${headerHtml}
          ${bodyHtml}
          ${footerHtml}
        </div>
      </div>
    </div>
  `;
}

export function renderMenuDetailModalCore({
  state,
  getMenuItemImages,
  getOptimizedImageUrl,
  isPlaceholderUrl,
  PLACEHOLDER_IMAGE,
  getFirebaseStorageUrl,
  isDirectImageUrl,
  formatPrice,
  getMenuDetailRestaurantId,
  getMenuDetailCatalogProfile,
  isShopCatalogProfile,
  normalizeMenuType,
  canAddToShopCart,
  getMenuItemSocialId,
  menuItemMetaKey,
  ensureMenuItemMeta,
  resolveMenuItemCounts,
  currentUserBadge,
  ensureCommentShape,
  getCartCountForRestaurant,
  renderMenuDetailComments,
  formatCount,
  getMenuItemObjectPosition,
  escapeHtml,
  icon
} = {}) {
  if (!state || !state.menuDetail?.open || !state.menuDetail?.item) return "";
  const getImages = typeof getMenuItemImages === "function" ? getMenuItemImages : (() => []);
  const getOptimizedImage = typeof getOptimizedImageUrl === "function"
    ? getOptimizedImageUrl
    : ((value) => String(value || ""));
  const isPlaceholder = typeof isPlaceholderUrl === "function"
    ? isPlaceholderUrl
    : (() => false);
  const getStorageUrl = typeof getFirebaseStorageUrl === "function"
    ? getFirebaseStorageUrl
    : ((value) => String(value || ""));
  const isDirectUrl = typeof isDirectImageUrl === "function"
    ? isDirectImageUrl
    : (() => false);
  const formatPriceLabel = typeof formatPrice === "function"
    ? formatPrice
    : ((value) => String(value || ""));
  const getRestaurantId = typeof getMenuDetailRestaurantId === "function"
    ? getMenuDetailRestaurantId
    : (() => "");
  const getCatalogProfile = typeof getMenuDetailCatalogProfile === "function"
    ? getMenuDetailCatalogProfile
    : (() => null);
  const isShopCatalog = typeof isShopCatalogProfile === "function" ? isShopCatalogProfile : (() => false);
  const normalizeType = typeof normalizeMenuType === "function"
    ? normalizeMenuType
    : ((value) => String(value || "food"));
  const canAddToCart = typeof canAddToShopCart === "function" ? canAddToShopCart : (() => false);
  const getSocialId = typeof getMenuItemSocialId === "function" ? getMenuItemSocialId : (() => "");
  const getMetaKey = typeof menuItemMetaKey === "function" ? menuItemMetaKey : (() => "");
  const ensureMeta = typeof ensureMenuItemMeta === "function"
    ? ensureMenuItemMeta
    : (() => ({ likes: [], comments: [], counts: { likes: 0, comments: 0 } }));
  const resolveCounts = typeof resolveMenuItemCounts === "function"
    ? resolveMenuItemCounts
    : (() => ({ likes: 0, comments: 0 }));
  const getUserBadge = typeof currentUserBadge === "function"
    ? currentUserBadge
    : (() => ({ uid: "", handle: "" }));
  const ensureComment = typeof ensureCommentShape === "function" ? ensureCommentShape : ((value) => value);
  const getCartCount = typeof getCartCountForRestaurant === "function" ? getCartCountForRestaurant : (() => 0);
  const renderComments = typeof renderMenuDetailComments === "function" ? renderMenuDetailComments : (() => "");
  const formatCounter = typeof formatCount === "function" ? formatCount : ((value) => String(value || "0"));
  const getObjectPosition = typeof getMenuItemObjectPosition === "function"
    ? getMenuItemObjectPosition
    : (() => "50% 50%");
  const tr = (key, fallback = key, params = {}) => t(key, { fallback, params });
  const normalizeExternalUrl = (value = "") => {
    const raw = String(value || "").trim();
    if (!raw) return "";
    if (/^(https?:\/\/|mailto:|tel:)/i.test(raw)) return raw;
    return `https://${raw.replace(/^\/+/, "")}`;
  };
  const normalizeCrossSellItemIds = (value, { excludeId = "" } = {}) => {
    const blockedId = String(excludeId || "").trim();
    const seen = new Set();
    const pushId = (entry) => {
      if (entry === null || entry === undefined) return;
      if (Array.isArray(entry)) {
        entry.forEach(pushId);
        return;
      }
      const raw = typeof entry === "object"
        ? (entry.id || entry.itemId || entry.productId || entry.menuItemId || "")
        : entry;
      const str = String(raw || "").trim();
      if (!str) return;
      str.split(",").forEach((part) => {
        const next = String(part || "").trim();
        if (!next || next === blockedId || seen.has(next)) return;
        seen.add(next);
      });
    };
    pushId(value);
    return Array.from(seen);
  };
  const resolveCrossSellItemById = (itemId, fallbackList = []) => {
    const id = String(itemId || "").trim();
    if (!id) return null;
    const fromMenu = Array.isArray(state?.menu?.items)
      ? state.menu.items.find((entry) => String(entry?.id || "").trim() === id)
      : null;
    if (fromMenu) return fromMenu;
    if (!Array.isArray(fallbackList)) return null;
    return fallbackList.find((entry) => {
      const entryId = String(entry?.id || entry?.itemId || entry?.productId || entry?.menuItemId || "").trim();
      return entryId === id;
    }) || null;
  };
  const renderCrossSellCard = (entry = {}, index = 0, { showAdd = false } = {}) => {
    const imageCandidates = Array.isArray(getImages(entry)) ? getImages(entry) : [];
    const rawEntryImage = imageCandidates[0] || entry.imageUrl || entry.image || "";
    const entryImgSrc = getOptimizedImage(rawEntryImage, "thumb");
    const entrySafeImg = isPlaceholder(entryImgSrc) ? PLACEHOLDER_IMAGE : entryImgSrc;
    const entryFirebaseFallback = getStorageUrl(rawEntryImage);
    const entryFallbackImg = isDirectUrl(rawEntryImage) && rawEntryImage !== entrySafeImg
      ? rawEntryImage
      : entryFirebaseFallback;
    const entryName = String(entry.name || `Empfehlung ${index + 1}`).trim() || `Empfehlung ${index + 1}`;
    const entryCategory = String(entry.category || "Passt dazu").trim() || "Passt dazu";
    const entryPrice = formatPriceLabel(entry.price, entry);
    return `
      <div class="group shrink-0 rounded-[1.8rem] border border-slate-100 bg-white p-2.5 text-left transition-all" style="width:132px;min-width:132px;max-width:132px;flex:0 0 132px;">
        <div class="relative overflow-hidden rounded-[1.2rem] bg-slate-100 mx-auto" style="width:92px;height:92px;">
          <img src="${esc(entrySafeImg)}" data-fallback-src="${esc(entryFallbackImg)}" data-image-reveal="menu" alt="${esc(entryName)}" class="w-full h-full object-cover object-center transition-transform duration-300 group-hover:scale-[1.03]" loading="lazy" fetchpriority="low" decoding="async" />
        </div>
        <div class="pt-3 px-1">
          <div class="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">${esc(entryCategory)}</div>
          <div class="mt-1 text-sm font-black tracking-tight text-slate-900 line-clamp-2">${esc(entryName)}</div>
          <div class="mt-3 flex items-center justify-between gap-3">
            <span class="text-sm font-black text-slate-900">${esc(entryPrice)}</span>
            ${showAdd ? `
              <span class="inline-flex items-center justify-center w-9 h-9 rounded-2xl bg-slate-900 text-white">
                ${iconFn("plus", "w-4 h-4")}
              </span>
            ` : ""}
          </div>
        </div>
      </div>
    `;
  };
  const renderCrossSellSection = (items = [], { showAdd = false } = {}) => {
    if (!items.length) return "";
    return `
      <section class="space-y-3">
        <div class="flex items-end justify-between gap-3">
          <div>
            <h4 class="text-base font-black tracking-tight text-slate-900">Passt perfekt dazu</h4>
          </div>
          <div class="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-300">${items.length} Vorschlaege</div>
        </div>
        <div class="overflow-x-auto no-scrollbar">
          <div class="flex gap-3 pb-1">
            ${items.map((entry, index) => renderCrossSellCard(entry, index, { showAdd })).join("")}
          </div>
        </div>
      </section>
    `;
  };
  const esc = typeof escapeHtml === "function" ? escapeHtml : ((value) => String(value || ""));
  const iconFn = typeof icon === "function" ? icon : (() => "");

  const item = state.menuDetail.item;
  const images = getImages(item);
  const maxIndex = images.length ? images.length - 1 : 0;
  const safeIndex = Math.max(0, Math.min(state.menuDetail.index || 0, maxIndex));
  const restaurantId = getRestaurantId(item);
  const resolveDetailSlideMedia = (rawValue, idx) => {
    const raw = String(rawValue || "");
    const stableKey = item?.id
      ? `menu-detail:${String(restaurantId || "")}:${String(item.id)}:${idx}`
      : "";
    const optimized = getOptimizedImage(raw, "large", {
      stableKey,
      variantGroup: "menu-detail"
    });
    const safe = isPlaceholder(optimized) ? PLACEHOLDER_IMAGE : optimized;
    const firebaseFallback = getStorageUrl(raw);
    const fallback = isDirectUrl(raw) && raw !== safe ? raw : firebaseFallback;
    return { idx, safe, fallback };
  };
  const detailSlides = (images.length ? images : [""]).map(resolveDetailSlideMedia);
  // Video-Speisen im Detail: Video mit dem ersten Frame als Poster starten,
  // damit sofort ein Bild sichtbar ist. Nur im ersten Galerie-Slot.
  const detailIsVideo = isVideoMediaItemCore(item);
  const detailVideoUrl = detailIsVideo ? String(item.videoUrl || "").trim() : "";
  const detailVideoPoster = detailIsVideo
    ? (String(item.posterUrl || "").trim()
      ? getOptimizedImage(String(item.posterUrl).trim(), "large")
      : (detailSlides[0]?.safe || PLACEHOLDER_IMAGE))
    : "";
  const videoToggleButtonHtml = `
    <button type="button" data-menu-video-toggle aria-label="Play/Pause" class="absolute top-3 left-3 w-9 h-9 rounded-full bg-black/40 backdrop-blur-md text-white flex items-center justify-center z-20 active:scale-95 transition">
      <svg data-video-icon-play viewBox="0 0 24 24" class="w-4 h-4 fill-white block"><path d="M8 5v14l11-7z"></path></svg>
      <svg data-video-icon-pause viewBox="0 0 24 24" class="w-4 h-4 fill-white hidden"><path d="M6 5h4v14H6zM14 5h4v14h-4z"></path></svg>
    </button>`;
  // Bereits geladenes Karten-Bild: liegt im Browser-Cache und wird sofort
  // gezeichnet, damit beim Oeffnen kein grauer Kasten sichtbar ist.
  const previewImageSrc = String(state.menuDetail?.previewImageSrc || "").trim();
  const previewBackdropStyle = previewImageSrc && !isPlaceholder(previewImageSrc)
    ? `background-image:url("${esc(previewImageSrc.replace(/"/g, "%22"))}");background-size:cover;background-position:${getObjectPosition(item)};background-repeat:no-repeat;`
    : "";
  // Alle Galerie-Medien liegen gleichzeitig im DOM. Beim Blaettern wird nur die
  // Sichtbarkeit umgeschaltet, damit das naechste Bild ohne Nachladen erscheint.
  // Nur das aktive Bild startet sofort - die uebrigen werden erst nachgeladen,
  // wenn das aktive Bild steht, damit es die Leitung nicht teilen muss.
  const detailSlideHtml = (slide, extraImgClass = "") => {
    const isActive = slide.idx === safeIndex;
    const isVideoSlot = detailIsVideo && !!detailVideoUrl && slide.idx === 0;
    const mediaHtml = isVideoSlot
      ? `<video id="menuDetailHeroVideo" data-menu-detail-video src="${esc(detailVideoUrl)}" ${detailVideoPoster ? `poster="${esc(detailVideoPoster)}"` : ""} class="absolute inset-0 w-full h-full object-cover${extraImgClass ? ` ${extraImgClass}` : ""}" style="object-position:${getObjectPosition(item)};" muted loop autoplay playsinline preload="metadata"></video>${videoToggleButtonHtml}`
      : `<img ${isActive ? `id="menuDetailHeroImage" ` : ""}data-menu-detail-hero-image ${isActive ? `src="${esc(slide.safe)}"` : `data-menu-gallery-src="${esc(slide.safe)}"`} data-fallback-src="${esc(slide.fallback)}" class="absolute inset-0 w-full h-full object-cover${extraImgClass ? ` ${extraImgClass}` : ""}" style="object-position:${getObjectPosition(item)};" loading="eager" fetchpriority="${isActive ? "high" : "low"}" decoding="${isActive ? "sync" : "async"}" />`;
    const slideStyle = [
      isActive ? previewBackdropStyle : "",
      isActive ? "" : "opacity:0;pointer-events:none;"
    ].join("");
    return `<div data-menu-gallery-slide="${slide.idx}" class="absolute inset-0"${slideStyle ? ` style="${slideStyle}"` : ""}>${mediaHtml}</div>`;
  };
  const detailHeroMediaHtml = (extraImgClass = "") => detailSlides
    .map((slide) => detailSlideHtml(slide, extraImgClass))
    .join("");
  const priceLabel = formatPriceLabel(item.price, item);
  const catalogProfile = getCatalogProfile(item);
  const isShop = isShopCatalog(catalogProfile);
  const typeLabel = isShop
    ? tr("menu.product", "Produkt")
    : (normalizeType(item.type) === "drink" ? tr("menu.drinkItem", "Pije") : tr("menu.foodItem", "Speise"));
  const category = isShop ? normalizeShopMenuCategoryLabel(item.category) : (item.category || "");
  const desc = item.longDescription || item.description || "";
  const ingredients = String(item.ingredients || item.ingredient || item.inhaltsstoffe || "").trim();
  const allergens = item.allergens || "";
  const brand = String(item.brand || "").trim();
  const sku = String(item.sku || "").trim();
  const sizes = Array.isArray(item.sizes) ? item.sizes : [];
  const colors = Array.isArray(item.colors) ? item.colors : [];
  const stock = parseMenuStockValue(item.stock);
  const menuType = String(normalizeType(item.type || "") || "").trim().toLowerCase();
  const isFoodOrDrink = menuType === "food" || menuType === "drink";
  const soldOut = isShop
    ? (item.available === false || stock === 0)
    : (item.available === false);
  const selectedSize = sizes.length ? (String(state.menuDetail.selectedSize || sizes[0]).trim() || String(sizes[0])) : "";
  const selectedColor = colors.length ? (String(state.menuDetail.selectedColor || colors[0]).trim() || String(colors[0])) : "";
  const menuAccessSource = String(state.profileView?.menuAccessSource || "").trim().toLowerCase();
  const isMenuTopTab = String(state.profileTopTab || "").trim().toLowerCase() === "menu";
  const hasQrMenuAccess = !isShop
    && isFoodOrDrink
    && isMenuTopTab
    && menuAccessSource === "qr";
  const canAddToCartNow = isShop ? canAddToCart(catalogProfile) : hasQrMenuAccess;
  const woltUrl = normalizeExternalUrl(item.woltUrl || item.woltLink || "");
  const showWoltAction = !isShop && isFoodOrDrink && !hasQrMenuAccess && !!woltUrl;
  const showFavoriteOnlyAction = !isShop && isFoodOrDrink && !hasQrMenuAccess && !showWoltAction;
  const showCrossSellAddAction = !!canAddToCartNow;
  const crossSellIds = normalizeCrossSellItemIds(
    item.crossSellItemIds
      || item.crossSellIds
      || item.crossSell
      || item.crossSelling,
    { excludeId: item.id }
  );
  const crossSellFallbackItems = Array.isArray(item.crossSell) ? item.crossSell : [];
  const resolvedCrossSellItems = crossSellIds
    .map((entryId) => resolveCrossSellItemById(entryId, crossSellFallbackItems))
    .filter(Boolean);
  const crossSellItems = resolvedCrossSellItems.length
    ? resolvedCrossSellItems
    : crossSellFallbackItems.filter(Boolean);
  const itemId = getSocialId(item);
  const metaKey = getMetaKey(restaurantId, itemId);
  const meta = metaKey ? ensureMeta(metaKey) : { likes: [], comments: [], counts: { likes: 0, comments: 0 } };
  const counts = resolveCounts(meta);
  const userBadge = getUserBadge();
  const isLiked = meta.likes?.some((row) => row.uid === userBadge.uid || row.handle === userBadge.handle);
  const favoriteItems = Array.isArray(state.favoriteMenuItems?.items) ? state.favoriteMenuItems.items : [];
  const isFavorited = favoriteItems.some((entry) => {
    if (!entry || typeof entry !== "object") return false;
    const entryRestaurantId = String(entry.restaurantId || "").trim();
    if (restaurantId && entryRestaurantId && entryRestaurantId !== restaurantId) return false;
    const entryItemIds = [
      entry.itemId,
      entry.menuSocialId,
      entry.menuItemId,
      entry.id
    ].map((value) => String(value || "").trim()).filter(Boolean);
    return !!itemId && entryItemIds.includes(itemId);
  });
  const comments = (meta.comments || []).map(ensureComment);
  const canSocial = !!restaurantId && !!itemId;
  const canInteract = canSocial && !!state.user;
  const canUseFavorites = !!String(state.user?.uid || "").trim();
  const titleId = "menuDetailTitle";
  const shopCartCount = isShop ? getCartCount(restaurantId || catalogProfile?.restaurantId || "") : 0;
  const footerView = String(state.menuDetail.footerView || "cart").trim().toLowerCase() === "comment"
    ? "comment"
    : "cart";
  const isCommentFooter = footerView === "comment";
  const noInfoFallbackLabel = tr("menu.noInfo", "Nuk ka informacion, ju lutem kontaktoni lokalin ose kamarierin.");
  const infoTabInfoText = String(desc || "").trim() || noInfoFallbackLabel;
  const infoTabIngredientsText = ingredients || noInfoFallbackLabel;
  const infoTabAllergensText = String(allergens || "").trim() || noInfoFallbackLabel;
  const currentInfoTab = String(state.menuDetail?.infoTab || "info").trim().toLowerCase();
  const activeInfoTab = currentInfoTab === "ingredients" || currentInfoTab === "allergens"
    ? currentInfoTab
    : "info";
  const infoTabButtonClass = (tabKey) => [
    "h-10 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center cursor-pointer select-none",
    activeInfoTab === tabKey
      ? "bg-slate-900 text-white border-slate-900"
      : "bg-white text-slate-500 border-slate-200"
  ].join(" ");
  const headerHtml = isShop
    ? `
      <div class="menu-detail-modal-header modal-handoff-chrome flex items-center justify-between gap-3 px-7 pt-7 pb-4 border-b border-slate-100 bg-white">
        <div class="flex items-center gap-2 min-w-0">
          <button type="button" id="menuDetailHeaderCartBtn" class="inline-flex items-center gap-2 px-4 h-11 rounded-2xl bg-slate-900 text-white text-[10px] font-black shadow-sm active:scale-95 ${canAddToCartNow && !soldOut ? "" : "opacity-50 pointer-events-none"}">
            ${iconFn("shopping-cart", "w-4 h-4")}
            <span>${esc(tr("menu.addToCart", "In den Warenkorb"))}</span>
            ${shopCartCount ? `<span class="inline-flex min-w-[20px] h-5 px-1.5 rounded-full bg-white/14 border border-white/20 text-white text-[9px] font-black items-center justify-center leading-none">${shopCartCount > 99 ? "99+" : shopCartCount}</span>` : ""}
          </button>
          ${canUseFavorites ? `
            <button type="button" id="menuDetailHeaderFavoritesBtn" aria-label="${esc(tr("menu.favorite", "Favoriten"))}" title="${esc(tr("menu.favorite", "Favoriten"))}" class="w-11 h-11 rounded-2xl border flex items-center justify-center active:scale-95 ${isFavorited ? "bg-slate-900 text-white border-slate-900" : "bg-slate-100 text-slate-700 border-slate-200"}">
              ${iconFn("bookmark", "w-4 h-4")}
            </button>
          ` : ""}
        </div>
        <button id="menuDetailClose" data-menu-detail-close="true" class="w-11 h-11 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-500 shrink-0">
          ${iconFn("x", "w-4 h-4")}
        </button>
      </div>
    `
    : `
      <div class="menu-detail-modal-header modal-handoff-chrome flex items-center justify-between gap-4 px-7 pt-7 pb-5 border-b border-slate-100 bg-white">
        <div class="min-w-0 flex items-center flex-1">
          <div class="min-w-0">
            <h3 id="${titleId}" class="text-[1.05rem] leading-tight font-black tracking-tight text-slate-900 truncate">${esc(item.name || tr("menu.product", "Produkt"))}</h3>
            ${category ? `<div class="mt-1 text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">${esc(category)}</div>` : ""}
          </div>
        </div>
        <button id="menuDetailClose" data-menu-detail-close="true" class="w-11 h-11 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-500 shrink-0">
          ${iconFn("x", "w-4 h-4")}
        </button>
      </div>
    `;
  const bodyHtml = isShop
    ? `
      <div class="flex-1 overflow-y-auto no-scrollbar modal-scroll modal-handoff-scroll px-7 py-6 space-y-5 bg-gradient-to-b from-slate-50 via-white to-slate-50">
        <div class="modal-handoff-hero relative rounded-[2.8rem] overflow-hidden border border-slate-100 bg-slate-50 shadow-sm" data-menu-gallery style="touch-action: pan-y; aspect-ratio:4 / 5;">
          ${detailHeroMediaHtml()}
          ${images.length > 1 ? `
            <button type="button" data-menu-gallery-nav="prev" class="modal-handoff-chrome absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 shadow text-slate-600 flex items-center justify-center" style="z-index:30;">
              ${iconFn("chevron-left", "w-4 h-4")}
            </button>
            <button type="button" data-menu-gallery-nav="next" class="modal-handoff-chrome absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 shadow text-slate-600 flex items-center justify-center" style="z-index:30;">
              ${iconFn("chevron-right", "w-4 h-4")}
            </button>
          ` : ""}
        </div>
        <div class="modal-handoff-chrome">
        ${images.length > 1 ? `
          <div class="flex items-center justify-center gap-2">
            ${images.map((_, idx) => `
              <button type="button" data-menu-gallery-dot="${idx}" class="w-2.5 h-2.5 rounded-full ${idx === safeIndex ? "bg-slate-900" : "bg-slate-200"}"></button>
            `).join("")}
          </div>
        ` : ""}
        <div class="flex items-center justify-between">
          <span class="text-lg font-black text-slate-900">${esc(priceLabel)}</span>
        </div>
        <div class="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
          ${category ? `<span>${esc(category)}</span>` : ""}
          <span>${esc(typeLabel)}</span>
        </div>
        ${brand || sku ? `
          <div class="grid ${brand && sku ? "grid-cols-2" : "grid-cols-1"} gap-3">
            ${brand ? `<div class="p-4 rounded-[1.6rem] bg-white border border-slate-100 shadow-sm"><p class="text-[9px] font-black uppercase tracking-widest text-slate-300">${esc(tr("menu.brand", "Marke"))}</p><p class="text-xs font-bold text-slate-700 mt-1 truncate">${esc(brand)}</p></div>` : ""}
            ${sku ? `<div class="p-4 rounded-[1.6rem] bg-white border border-slate-100 shadow-sm"><p class="text-[9px] font-black uppercase tracking-widest text-slate-300">SKU</p><p class="text-xs font-bold text-slate-700 mt-1 truncate">${esc(sku)}</p></div>` : ""}
          </div>
        ` : ""}
        ${sizes.length ? `
          <div class="p-4 rounded-[1.8rem] bg-white border border-slate-100 shadow-sm">
            <p class="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">${esc(tr("menu.sizes", "Madhesite"))}</p>
            <select data-menu-detail-variant="size" class="w-full h-12 px-4 rounded-2xl bg-white text-sm font-bold text-slate-700 border border-slate-200 outline-none">
              ${sizes.map((size) => `<option value="${esc(size)}" ${selectedSize === String(size) ? "selected" : ""}>${esc(size)}</option>`).join("")}
            </select>
          </div>
        ` : ""}
        ${colors.length ? `
          <div class="p-4 rounded-[1.8rem] bg-white border border-slate-100 shadow-sm">
            <p class="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">${esc(tr("menu.colors", "Ngjyrat"))}</p>
            <select data-menu-detail-variant="color" class="w-full h-12 px-4 rounded-2xl bg-white text-sm font-bold text-slate-700 border border-slate-200 outline-none">
              ${colors.map((color) => `<option value="${esc(color)}" ${selectedColor === String(color) ? "selected" : ""}>${esc(color)}</option>`).join("")}
            </select>
          </div>
        ` : ""}
        ${desc ? `<p class="text-sm text-slate-600 leading-relaxed">${esc(desc)}</p>` : ""}
        ${allergens ? `
          <div class="p-4 rounded-[1.8rem] bg-white border border-slate-100 shadow-sm">
            <p class="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">${esc(tr("menu.notes", "Hinweise"))}</p>
            <p class="text-sm text-slate-600">${esc(allergens)}</p>
          </div>
        ` : ""}
        <div class="flex items-center justify-between" style="padding-top:1.25rem;">
          <button id="menuDetailLikeBtn" class="flex items-center gap-2 text-sm font-black ${isLiked ? "text-rose-500" : "text-slate-700"} ${canInteract ? "" : "opacity-50 pointer-events-none"}">
            ${iconFn("heart", "w-3.5 h-3.5")} ${isLiked ? esc(tr("likes.liked", "Gefaellt")) : esc(tr("likes.like", "Like"))}
          </button>
          <div class="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">
            <span id="menuDetailLikesCount">${esc(formatCounter(counts.likes))} ${esc(tr("likes.count", "Likes"))}</span>
            <span id="menuDetailCommentsCount">${esc(formatCounter(counts.comments))} ${esc(tr("comments.count", "Kommentare"))}</span>
          </div>
        </div>
        <div id="menuDetailComments" class="space-y-4" style="margin-top:3rem;">
          ${renderComments(comments)}
        </div>
        </div>
      </div>
    `
    : `
      <div class="flex-1 overflow-y-auto no-scrollbar modal-scroll modal-handoff-scroll px-7 py-6 bg-white/98">
        <div class="modal-handoff-hero relative h-56 rounded-[2.8rem] overflow-hidden border border-slate-100 bg-slate-50 shadow-sm" data-menu-gallery style="touch-action: pan-y;">
          ${detailHeroMediaHtml()}
          ${images.length > 1 ? `
            <button type="button" data-menu-gallery-nav="prev" class="modal-handoff-chrome absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 shadow text-slate-600 flex items-center justify-center" style="z-index:30;">
              ${iconFn("chevron-left", "w-4 h-4")}
            </button>
            <button type="button" data-menu-gallery-nav="next" class="modal-handoff-chrome absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 shadow text-slate-600 flex items-center justify-center" style="z-index:30;">
              ${iconFn("chevron-right", "w-4 h-4")}
            </button>
          ` : ""}
        </div>
        <div class="modal-handoff-chrome">
        <div class="mt-6 space-y-5">
          <div class="p-4 rounded-[1.3rem] border border-slate-100 bg-slate-50">
            <div class="flex items-center justify-between">
              <span class="text-[12px] font-black uppercase tracking-[0.2em] text-slate-400">${esc(tr("menu.price", "Preis"))}</span>
              <span class="font-black text-slate-900" style="font-size:13px;">${esc(priceLabel)}</span>
            </div>
          </div>
          <div class="border-t border-slate-100"></div>

          <div class="space-y-3">
            <div class="menu-detail-info-tabs space-y-4">
              <div class="grid grid-cols-3 gap-2 menu-detail-info-controls">
                <button type="button" data-menu-detail-info-tab="info" class="${infoTabButtonClass("info")}">${esc(tr("menu.info", "Info"))}</button>
                <button type="button" data-menu-detail-info-tab="ingredients" class="${infoTabButtonClass("ingredients")}">${esc(tr("menu.ingredients", "Inhaltsstoffe"))}</button>
                <button type="button" data-menu-detail-info-tab="allergens" class="${infoTabButtonClass("allergens")}">${esc(tr("menu.allergens", "Allergene"))}</button>
              </div>
              <div class="menu-detail-info-panels rounded-[1.3rem] border border-slate-100 bg-slate-50 px-4 py-3.5">
                <p data-menu-detail-info-panel="info" class="menu-detail-info-panel text-sm text-slate-600 leading-relaxed whitespace-pre-line h-full overflow-y-auto no-scrollbar ${activeInfoTab === "info" ? "" : "hidden"}">${esc(infoTabInfoText)}</p>
                <p data-menu-detail-info-panel="ingredients" class="menu-detail-info-panel text-sm text-slate-600 leading-relaxed whitespace-pre-line h-full overflow-y-auto no-scrollbar ${activeInfoTab === "ingredients" ? "" : "hidden"}">${esc(infoTabIngredientsText)}</p>
                <p data-menu-detail-info-panel="allergens" class="menu-detail-info-panel text-sm text-slate-600 leading-relaxed whitespace-pre-line h-full overflow-y-auto no-scrollbar ${activeInfoTab === "allergens" ? "" : "hidden"}">${esc(infoTabAllergensText)}</p>
              </div>
            </div>
          </div>

          <div class="border-t border-slate-100"></div>
          ${crossSellItems.length ? `<div class="pt-1">${renderCrossSellSection(crossSellItems, { showAdd: showCrossSellAddAction })}</div><div class="border-t border-slate-100"></div>` : ""}

          <div class="flex items-center justify-between" style="padding-top:1.25rem;">
            <button id="menuDetailLikeBtn" class="flex items-center gap-2 text-sm font-black ${isLiked ? "text-rose-500" : "text-slate-700"} ${canInteract ? "" : "opacity-50 pointer-events-none"}">
              ${iconFn("heart", "w-3.5 h-3.5")} ${isLiked ? esc(tr("likes.liked", "Gefaellt")) : esc(tr("likes.like", "Like"))}
            </button>
            <div class="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">
              <span id="menuDetailLikesCount">${esc(formatCounter(counts.likes))} ${esc(tr("likes.count", "Likes"))}</span>
              <span id="menuDetailCommentsCount">${esc(formatCounter(counts.comments))} ${esc(tr("comments.count", "Kommentare"))}</span>
            </div>
          </div>
        </div>

        <div id="menuDetailComments" class="space-y-4" style="margin-top:3rem;">
          ${renderComments(comments)}
        </div>
        </div>
      </div>
    `;
  const footerPrimaryActionHtml = showWoltAction
    ? `
      <button type="button" id="menuDetailWoltBtn" data-wolt-url="${esc(woltUrl)}" class="flex-1 h-[52px] rounded-[1.65rem] text-white flex items-center justify-center gap-2 active:scale-95 transition-all shadow-sm" style="background-color:#18b9df;" title="${esc(tr("menu.openWolt", "Bei Wolt oeffnen"))}">
        <span class="font-bold text-sm">Wolt</span>
        ${iconFn("external-link", "w-4 h-4")}
      </button>
    `
    : (showFavoriteOnlyAction
      ? `
        <button id="menuDetailFavoriteCtaBtn" class="flex-1 h-[52px] rounded-[1.65rem] bg-slate-900 text-white flex items-center justify-center gap-2 active:scale-95 transition-all">
          <span class="font-bold text-sm">${esc(tr("menu.toFavorites", "Zu Favoriten"))}</span>
          ${iconFn("bookmark", "w-4 h-4")}
        </button>
      `
      : `
        <button id="menuDetailAddToCartBtn" class="flex-1 h-[52px] rounded-[1.65rem] bg-slate-900 text-white flex items-center justify-center gap-2 active:scale-95 transition-all ${canAddToCartNow && !soldOut ? "" : "opacity-50 pointer-events-none"}">
          <span class="font-bold text-sm">${soldOut ? esc(tr("menu.soldOut", "Ausverkauft")) : esc(tr("menu.addToCart", "In den Warenkorb"))}</span>
          ${iconFn("shopping-bag", "w-4 h-4")}
        </button>
      `);
  const footerBackToggleTitle = showWoltAction
    ? tr("menu.backToWolt", "Kthehu te Wolt")
    : (showFavoriteOnlyAction ? tr("menu.backToFavorites", "Kthehu te te preferuarat") : tr("menu.backToCart", "Kthehu te shporta"));
  const footerBackToggleClass = showWoltAction
    ? "text-white"
    : "bg-slate-100 text-slate-600 hover:bg-slate-200";
  const footerBackToggleStyle = showWoltAction ? `style="background-color:#18b9df;"` : "";
  const footerBackToggleIcon = showWoltAction
    ? `
      <span class="w-5 h-5 inline-flex items-center justify-center text-white leading-none select-none" aria-hidden="true">
        <span class="block" style="font-family:'Omnes','Plus Jakarta Sans','Segoe UI',sans-serif;font-size:20px;font-weight:800;font-style:italic;line-height:1;transform:translateY(-1px);">
          w
        </span>
      </span>
    `
    : (showFavoriteOnlyAction
      ? iconFn("bookmark", "w-5 h-5")
      : iconFn("shopping-bag", "w-5 h-5"));
  const footerHtml = `
    <div class="modal-handoff-chrome px-7 pb-6 pt-4 border-t border-slate-100 bg-white/98 backdrop-blur-sm modal-footer-safe relative z-10">
      <div id="footer-cart-view" class="flex gap-3 items-center w-full transition-all duration-300 ${isCommentFooter ? "hidden opacity-0" : ""}">
        <button type="button" id="menuDetailFooterCommentToggle" class="w-[52px] h-[52px] shrink-0 rounded-[1.65rem] bg-slate-100 text-slate-600 flex items-center justify-center hover:bg-slate-200 transition-all active:scale-95 relative" title="${esc(tr("menu.commentAction", "Kommentare verfassen"))}">
          ${iconFn("message-square", "w-5 h-5")}
          ${counts.comments > 0 ? `<span id="menuDetailFooterCommentsBadge" class="absolute top-0 right-0 -mt-1 -mr-1 w-5 h-5 rounded-full bg-indigo-600 text-white text-[9px] font-black flex items-center justify-center border-2 border-white">${counts.comments}</span>` : ""}
        </button>
        ${footerPrimaryActionHtml}
      </div>

      <div id="footer-comment-view" class="flex gap-3 items-center w-full transition-all duration-300 ${isCommentFooter ? "" : "hidden opacity-0"}">
        <button type="button" id="menuDetailFooterCartToggle" class="w-[52px] h-[52px] shrink-0 rounded-[1.65rem] ${footerBackToggleClass} flex items-center justify-center transition-all active:scale-95" ${footerBackToggleStyle} title="${footerBackToggleTitle}">
          ${footerBackToggleIcon}
        </button>

        <div class="flex-1 flex gap-2">
          <textarea id="menuDetailCommentInput" placeholder="${canInteract ? esc(tr("menu.commentPlaceholder", "Schreib einen Kommentar...")) : esc(tr("menu.loginRequired", "Ju lutem hyni"))}" class="flex-1 px-5 py-3.5 rounded-[1.65rem] border border-slate-100 bg-slate-50 text-sm font-medium outline-none resize-none leading-relaxed ${canInteract ? "" : "opacity-60"}" rows="1" ${canInteract ? "" : "disabled"}>${esc(state.menuDetail.commentText || "")}</textarea>
          <button id="menuDetailCommentSend" class="w-[52px] h-[52px] shrink-0 rounded-[1.65rem] bg-indigo-600 text-white flex items-center justify-center ${canInteract ? "" : "opacity-60 cursor-not-allowed"}" ${canInteract ? "" : "disabled"}>
            ${iconFn("send", "w-4 h-4")}
          </button>
        </div>
      </div>
    </div>
  `;
  const animClass = "";

  return `
    <div class="fixed inset-0 z-[75] modal-overlay" data-modal-surface="#ffffff" style="--modal-surface:#ffffff;">
      <div id="menuDetailOverlay" data-menu-detail-close="true" class="absolute inset-0 bg-black/60"></div>
      <div class="modal-frame menu-detail-modal-frame">
        <div class="bg-white rounded-t-[3.2rem] shadow-[0_-24px_80px_rgba(15,23,42,0.22)] border-x border-b border-slate-100 ${animClass} flex flex-col modal-sheet-88 overflow-hidden modal-sheet menu-detail-modal-sheet">
          ${headerHtml}
          ${bodyHtml}
          ${footerHtml}
        </div>
      </div>
    </div>
  `;
}
