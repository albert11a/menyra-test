import { isTestfirstMenuProfileTypeCore, normalizeMenuCardStyleCore } from "./menu-card-style-utils.js";

function parseMenuStockValue(value) {
  if (value === null || value === undefined) return null;
  const raw = typeof value === "string" ? value.trim() : value;
  if (raw === "") return null;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? Math.max(0, parsed) : null;
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

  const item = state.menuModal.item || {};
  const isEdit = state.menuModal.mode === "edit";
  const isShop = isShopCatalog(state.userProfile);
  const title = isEdit ? "Produkt bearbeiten" : "Produkt hinzufuegen";
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
  const typeValue = normalizeType(item.type || "food");
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
  const cardStyleValue = normalizeMenuCardStyleCore(item.cardStyle || "", typeValue);
  const isSpecialCard = cardStyleValue === "testfirst_special"
    || String(item.category || "").trim().toLowerCase() === "special";
  const categoryValue = String(item.category || "Sonstiges").trim() || "Sonstiges";
  const defaultCategories = [
    "Fruehstueck",
    "Lunch",
    "Dinner",
    "Vorspeise",
    "Hauptgericht",
    "Dessert",
    "Getraenk",
    "Kaffee",
    "Cocktail",
    "Special",
    "Sonstiges"
  ];
  const categoryOptions = Array.from(
    new Set([
      categoryValue,
      ...(Array.isArray(state.menu?.items) ? state.menu.items.map((entry) => String(entry?.category || "").trim()) : []),
      ...defaultCategories
    ].filter(Boolean))
  );
  const specialSizeValue = String(item.specialSize || item.specialCardSize || "").trim().toLowerCase() === "food"
    ? "food"
    : "default";
  const specialActionTypeRaw = String(item.specialActionType || item.actionType || "").trim().toLowerCase();
  const specialActionType = specialActionTypeRaw === "link" ? "link" : "product";
  const specialActionUrl = String(item.specialActionUrl || item.linkUrl || item.actionUrl || "").trim();
  const specialActionProductId = String(item.specialActionProductId || item.targetProductId || "").trim();
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

  const titleId = "menuModalTitle";
  const headerHtml = `
    <div class="flex items-start justify-between px-6 pt-6 pb-4 border-b border-slate-100">
      <div>
        <span class="text-[9px] font-black text-indigo-600 uppercase tracking-widest">${isEdit ? "Bearbeiten" : "Neu"}</span>
        <h3 id="${titleId}" class="text-xl font-black italic tracking-tighter">${title}</h3>
      </div>
      <button id="menuModalClose" class="w-11 h-11 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-500">
        ${iconFn("x", "w-4 h-4")}
      </button>
    </div>
  `;
  const bodyHtml = `
    <div class="flex-1 overflow-y-auto no-scrollbar modal-scroll px-6 py-5 space-y-4">
      <input type="file" id="menuItemImageInput" class="hidden" accept="image/*" multiple />
      <div class="rounded-[2.5rem] overflow-hidden border border-slate-100 bg-slate-50">
        <img id="menuItemHeroPreview" src="${esc(safeImage)}" class="w-full h-52 object-cover" style="object-position:${crop.x}% ${crop.y}%;" />
      </div>
      <button id="menuItemImageTrigger" class="w-full py-3 rounded-2xl bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest">
        Fotos hochladen
      </button>
      <div class="p-4 rounded-[1.8rem] border border-slate-100 bg-white space-y-3">
        <div class="flex items-center justify-between">
          <p class="text-[10px] font-black uppercase tracking-widest text-slate-400">Crop Horizontal</p>
          <span id="menuCropXValue" class="text-[10px] font-black uppercase tracking-widest text-slate-500">${crop.x}%</span>
        </div>
        <input id="menuItemCropX" type="range" min="0" max="100" step="1" value="${crop.x}" class="w-full accent-indigo-600" />
        <div class="flex items-center justify-between">
          <p class="text-[10px] font-black uppercase tracking-widest text-slate-400">Crop Vertikal</p>
          <span id="menuCropYValue" class="text-[10px] font-black uppercase tracking-widest text-slate-500">${crop.y}%</span>
        </div>
        <input id="menuItemCropY" type="range" min="0" max="100" step="1" value="${crop.y}" class="w-full accent-indigo-600" />
      </div>
      ${gallery.length ? `
        <div class="grid grid-cols-4 gap-2">
          ${gallery.map((img) => `
            <div class="relative rounded-xl overflow-hidden border border-slate-100 bg-slate-50">
              <img src="${esc(getOptimizedImage(img.src, "thumb"))}" class="w-full h-16 object-cover" />
              <button type="button" data-menu-image-remove="${img.idx}" data-menu-image-source="${img.kind}" class="absolute top-1 right-1 w-6 h-6 rounded-full bg-white/90 text-slate-600 text-[10px] flex items-center justify-center shadow">
                ${iconFn("x", "w-3 h-3")}
              </button>
            </div>
          `).join("")}
        </div>
      ` : ""}

      <div class="p-5 rounded-[2rem] border border-slate-100 bg-white space-y-4">
        <div>
          <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Name</label>
          <input id="menuItemName" type="text" value="${esc(item.name || "")}" placeholder="Produktname" class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100" />
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Preis</label>
            <input id="menuItemPrice" type="text" value="${esc(item.price ?? "")}" placeholder="z.B. 4.50" class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100" />
          </div>
          <div>
            <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Kategorie</label>
            <select id="menuItemCategory" class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100">
              ${categoryOptions.map((category) => `
                <option value="${esc(category)}" ${categoryValue === category ? "selected" : ""}>${esc(category)}</option>
              `).join("")}
            </select>
          </div>
        </div>
        <div>
          <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Typ</label>
          <select id="menuItemType" class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100">
            <option value="food" ${typeValue === "food" ? "selected" : ""}>${isShop ? "Produkt" : "Speise"}</option>
            <option value="drink" ${typeValue === "drink" ? "selected" : ""}>${isShop ? "Variante" : "Getraenk"}</option>
          </select>
        </div>
        <div>
          <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Status</label>
          <select id="menuItemVisibility" class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100">
            <option value="available" ${visibilityValue === "available" ? "selected" : ""}>Verfuegbar</option>
            <option value="unavailable" ${visibilityValue === "unavailable" ? "selected" : ""}>Ausverkauft</option>
          </select>
        </div>
        ${showCardStyleSelector && isSpecialCard ? `
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
            <p class="text-[10px] font-bold text-slate-400 mt-2 px-2">Einfach auswaehlen statt Drag and Drop.</p>
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
        ${showCardStyleSelector && isSpecialCard ? `
          <input id="menuItemCardStyle" type="hidden" value="testfirst_special" />
          <div>
            <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Special Groesse</label>
            <select id="menuItemSpecialSize" class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100">
              <option value="default" ${specialSizeValue === "default" ? "selected" : ""}>Normal</option>
              <option value="food" ${specialSizeValue === "food" ? "selected" : ""}>Food-Card Groesse</option>
            </select>
            <p class="text-[10px] font-bold text-slate-400 mt-2 px-2">Nur relevant fuer Special-Card.</p>
          </div>
          <div>
            <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Special Klick-Aktion</label>
            <select id="menuItemSpecialActionType" class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100">
              <option value="product" ${specialActionType === "product" ? "selected" : ""}>Produkt-Modal oeffnen</option>
              <option value="link" ${specialActionType === "link" ? "selected" : ""}>Weiterleitung / Link oeffnen</option>
            </select>
          </div>
          <div id="menuItemSpecialActionProductField" class="${specialActionType === "product" ? "" : "hidden"}">
            <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Special Ziel-Produkt</label>
            <select id="menuItemSpecialActionProductId" class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100">
              <option value="">Kein Produkt</option>
              ${specialTargetProducts.map((entry) => {
                const id = String(entry?.id || "").trim();
                const label = String(entry?.name || "Produkt").trim() || "Produkt";
                return `<option value="${esc(id)}" ${specialActionProductId === id ? "selected" : ""}>${esc(label)}</option>`;
              }).join("")}
            </select>
            <p class="text-[10px] font-bold text-slate-400 mt-2 px-2">Wird genutzt, wenn Klick-Aktion = Produkt-Modal.</p>
          </div>
          <div id="menuItemSpecialActionLinkField" class="${specialActionType === "link" ? "" : "hidden"}">
            <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Special Link</label>
            <input id="menuItemSpecialActionUrl" type="text" value="${esc(specialActionUrl)}" placeholder="https://..." class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100" />
            <p class="text-[10px] font-bold text-slate-400 mt-2 px-2">Wird genutzt, wenn Klick-Aktion = Link.</p>
          </div>
        ` : ""}
        <div>
          <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Beschreibung</label>
          <textarea id="menuItemDesc" rows="3" placeholder="Beschreibung..." class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100 resize-none">${esc(item.description || "")}</textarea>
        </div>
        ${isShop ? `
          <div>
            <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Details</label>
            <textarea id="menuItemLongDesc" rows="4" placeholder="Material, Zustand, Lieferdetails..." class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100 resize-none">${esc(item.longDescription || "")}</textarea>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Marke</label>
              <input id="menuItemBrand" type="text" value="${esc(item.brand || "")}" placeholder="z.B. Nike" class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100" />
            </div>
            <div>
              <label class="text-[10px] font-black text-slate-400 uppercase ml-2">SKU</label>
              <input id="menuItemSku" type="text" value="${esc(item.sku || "")}" placeholder="ART-001" class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100" />
            </div>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Groessen</label>
              <input id="menuItemSizes" type="text" value="${esc(sizesValue)}" placeholder="XS, S, M, L" class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100" />
            </div>
            <div>
              <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Farben</label>
              <input id="menuItemColors" type="text" value="${esc(colorsValue)}" placeholder="Schwarz, Weiss" class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100" />
            </div>
          </div>
          <div>
            <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Lagerbestand</label>
            <input id="menuItemStock" type="number" min="0" inputmode="numeric" value="${esc(stockValue)}" placeholder="0" class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100" />
          </div>
        ` : ""}
        <div>
          <label class="text-[10px] font-black text-slate-400 uppercase ml-2">${isShop ? "Hinweise" : "Allergene"}</label>
          <input id="menuItemAllergens" type="text" value="${esc(item.allergens || "")}" placeholder="${isShop ? "z.B. limitierte Edition, ohne Rueckgabe" : "z.B. Milch, Gluten"}" class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100" />
        </div>
      </div>
    </div>
  `;
  const footerHtml = `
    <div class="px-6 pb-6 pt-4 border-t border-slate-100 bg-white modal-footer-safe">
      <button id="menuModalSave" class="w-full py-4 rounded-[1.8rem] bg-indigo-600 text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-500/20 active:scale-95 transition-all" ${state.menuModal.loading ? "disabled" : ""}>
        ${state.menuModal.loading ? "Speichern..." : "Speichern"}
      </button>
      <div class="text-center text-[10px] font-bold text-slate-400 mt-3">${esc(status)}</div>
    </div>
  `;
  const animClass = "";

  return `
    <div class="fixed inset-0 z-[75] modal-overlay">
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
  const esc = typeof escapeHtml === "function" ? escapeHtml : ((value) => String(value || ""));
  const iconFn = typeof icon === "function" ? icon : (() => "");

  const item = state.menuDetail.item;
  const images = getImages(item);
  const maxIndex = images.length ? images.length - 1 : 0;
  const safeIndex = Math.max(0, Math.min(state.menuDetail.index || 0, maxIndex));
  const rawImg = images[safeIndex] || "";
  const imgSrc = getOptimizedImage(rawImg, "large");
  const safeImg = isPlaceholder(imgSrc) ? PLACEHOLDER_IMAGE : imgSrc;
  const firebaseFallback = getStorageUrl(rawImg);
  const fallbackImg = isDirectUrl(rawImg) && rawImg !== safeImg ? rawImg : firebaseFallback;
  const priceLabel = formatPriceLabel(item.price);
  const restaurantId = getRestaurantId(item);
  const catalogProfile = getCatalogProfile(item);
  const typeLabel = isShopCatalog(catalogProfile)
    ? (normalizeType(item.type) === "drink" ? "Variante" : "Produkt")
    : (normalizeType(item.type) === "drink" ? "Getraenk" : "Speise");
  const category = item.category || "";
  const desc = item.longDescription || item.description || "";
  const allergens = item.allergens || "";
  const brand = String(item.brand || "").trim();
  const sku = String(item.sku || "").trim();
  const sizes = Array.isArray(item.sizes) ? item.sizes : [];
  const colors = Array.isArray(item.colors) ? item.colors : [];
  const stock = parseMenuStockValue(item.stock);
  const isShop = isShopCatalog(catalogProfile);
  const soldOut = isShop
    ? (item.available === false || stock === 0)
    : (item.available === false);
  const availability = soldOut ? "Nicht verfuegbar" : "Verfuegbar";
  const availabilityClass = soldOut ? "text-rose-500" : "text-emerald-600";
  const selectedSize = sizes.length ? (String(state.menuDetail.selectedSize || sizes[0]).trim() || String(sizes[0])) : "";
  const selectedColor = colors.length ? (String(state.menuDetail.selectedColor || colors[0]).trim() || String(colors[0])) : "";
  const canAddToCartNow = isShop && canAddToCart(catalogProfile);
  const itemId = getSocialId(item);
  const metaKey = getMetaKey(restaurantId, itemId);
  const meta = metaKey ? ensureMeta(metaKey) : { likes: [], comments: [], counts: { likes: 0, comments: 0 } };
  const counts = resolveCounts(meta);
  const userBadge = getUserBadge();
  const isLiked = meta.likes?.some((row) => row.uid === userBadge.uid || row.handle === userBadge.handle);
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
  const headerHtml = isShop
    ? `
      <div class="flex items-center justify-between gap-3 px-7 pt-7 pb-4 border-b border-slate-100 bg-white/95 backdrop-blur-sm">
        <div class="flex items-center gap-2 min-w-0">
          <button type="button" id="menuDetailHeaderCartBtn" class="inline-flex items-center gap-2 px-4 h-11 rounded-2xl bg-slate-900 text-white text-[10px] font-black shadow-sm active:scale-95 ${canAddToCartNow && !soldOut ? "" : "opacity-50 pointer-events-none"}">
            ${iconFn("shopping-cart", "w-4 h-4")}
            <span>In den Warenkorb</span>
            ${shopCartCount ? `<span class="inline-flex min-w-[20px] h-5 px-1.5 rounded-full bg-white/14 border border-white/20 text-white text-[9px] font-black items-center justify-center leading-none">${shopCartCount > 99 ? "99+" : shopCartCount}</span>` : ""}
          </button>
          ${canUseFavorites ? `
            <button type="button" id="menuDetailHeaderFavoritesBtn" aria-label="Favoriten" title="Favoriten" class="w-11 h-11 rounded-2xl border flex items-center justify-center active:scale-95 ${isLiked ? "bg-slate-900 text-white border-slate-900" : "bg-slate-100 text-slate-700 border-slate-200"}">
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
      <div class="flex items-start justify-between px-7 pt-7 pb-5 border-b border-slate-100 bg-white/95 backdrop-blur-sm">
        <div>
          <span class="text-[9px] font-black text-indigo-600 uppercase tracking-widest">${esc(category || typeLabel)}</span>
          <h3 id="${titleId}" class="text-xl font-black italic tracking-tighter">${esc(item.name || "Produkt")}</h3>
        </div>
        <button id="menuDetailClose" data-menu-detail-close="true" class="w-11 h-11 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-500">
          ${iconFn("x", "w-4 h-4")}
        </button>
      </div>
    `;
  const bodyHtml = `
    <div class="flex-1 overflow-y-auto no-scrollbar modal-scroll px-7 py-6 space-y-5 bg-gradient-to-b from-slate-50 via-white to-slate-50">
      <div class="relative rounded-[2.8rem] overflow-hidden border border-slate-100 bg-slate-50 shadow-sm" data-menu-gallery style="touch-action: pan-y;${isShop ? " aspect-ratio:4 / 5;" : ""}">
        <img src="${esc(safeImg)}" data-fallback-src="${esc(fallbackImg)}" class="w-full ${isShop ? "h-full" : "h-56"} object-cover" style="object-position:${getObjectPosition(item)};" />
        ${images.length > 1 ? `
          <button type="button" data-menu-gallery-nav="prev" class="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 shadow text-slate-600 flex items-center justify-center">
            ${iconFn("chevron-left", "w-4 h-4")}
          </button>
          <button type="button" data-menu-gallery-nav="next" class="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 shadow text-slate-600 flex items-center justify-center">
            ${iconFn("chevron-right", "w-4 h-4")}
          </button>
        ` : ""}
      </div>
      ${images.length > 1 ? `
        <div class="flex items-center justify-center gap-2">
          ${images.map((_, idx) => `
            <button type="button" data-menu-gallery-dot="${idx}" class="w-2.5 h-2.5 rounded-full ${idx === safeIndex ? "bg-slate-900" : "bg-slate-200"}"></button>
          `).join("")}
        </div>
      ` : ""}
      <div class="flex items-center justify-between">
        <span class="text-lg font-black text-slate-900">${esc(priceLabel)}</span>
        <span class="text-[10px] font-black uppercase tracking-widest ${availabilityClass}">${availability}</span>
      </div>
      <div class="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
        ${category ? `<span>${esc(category)}</span>` : ""}
        <span>${esc(typeLabel)}</span>
      </div>
      ${brand || sku ? `
        <div class="grid ${brand && sku ? "grid-cols-2" : "grid-cols-1"} gap-3">
          ${brand ? `<div class="p-4 rounded-[1.6rem] bg-white border border-slate-100 shadow-sm"><p class="text-[9px] font-black uppercase tracking-widest text-slate-300">Marke</p><p class="text-xs font-bold text-slate-700 mt-1 truncate">${esc(brand)}</p></div>` : ""}
          ${sku ? `<div class="p-4 rounded-[1.6rem] bg-white border border-slate-100 shadow-sm"><p class="text-[9px] font-black uppercase tracking-widest text-slate-300">SKU</p><p class="text-xs font-bold text-slate-700 mt-1 truncate">${esc(sku)}</p></div>` : ""}
        </div>
      ` : ""}
      ${isShop && sizes.length ? `
        <div class="p-4 rounded-[1.8rem] bg-white border border-slate-100 shadow-sm">
          <p class="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Groessen</p>
          <select data-menu-detail-variant="size" class="w-full h-12 px-4 rounded-2xl bg-white text-sm font-bold text-slate-700 border border-slate-200 outline-none">
            ${sizes.map((size) => `<option value="${esc(size)}" ${selectedSize === String(size) ? "selected" : ""}>${esc(size)}</option>`).join("")}
          </select>
        </div>
      ` : ""}
      ${isShop && colors.length ? `
        <div class="p-4 rounded-[1.8rem] bg-white border border-slate-100 shadow-sm">
          <p class="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Farben</p>
          <select data-menu-detail-variant="color" class="w-full h-12 px-4 rounded-2xl bg-white text-sm font-bold text-slate-700 border border-slate-200 outline-none">
            ${colors.map((color) => `<option value="${esc(color)}" ${selectedColor === String(color) ? "selected" : ""}>${esc(color)}</option>`).join("")}
          </select>
        </div>
      ` : ""}
      ${desc ? `<p class="text-sm text-slate-600 leading-relaxed">${esc(desc)}</p>` : ""}
      ${allergens ? `
        <div class="p-4 rounded-[1.8rem] bg-white border border-slate-100 shadow-sm">
          <p class="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">${isShop ? "Hinweise" : "Allergene"}</p>
          <p class="text-sm text-slate-600">${esc(allergens)}</p>
        </div>
      ` : ""}
      <div class="flex items-center justify-between">
        <button id="menuDetailLikeBtn" class="flex items-center gap-2 text-sm font-black ${isLiked ? "text-rose-500" : "text-slate-700"} ${canInteract ? "" : "opacity-50 pointer-events-none"}">
          ${iconFn("heart", "w-5 h-5")} ${isLiked ? "Gefaellt" : "Like"}
        </button>
        <div class="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">
          <span id="menuDetailLikesCount">${esc(formatCounter(counts.likes))} Likes</span>
          <span id="menuDetailCommentsCount">${esc(formatCounter(counts.comments))} Kommentare</span>
        </div>
      </div>

      <div id="menuDetailComments" class="space-y-4">
        ${renderComments(comments)}
      </div>
    </div>
  `;
  const footerHtml = `
    <div class="px-7 pb-6 pt-4 border-t border-slate-100 bg-white/98 backdrop-blur-sm modal-footer-safe relative z-10">
      <div id="footer-cart-view" class="flex gap-3 items-center w-full transition-all duration-300 ${isCommentFooter ? "hidden opacity-0" : ""}">
        <button type="button" id="menuDetailFooterCommentToggle" class="w-[52px] h-[52px] shrink-0 rounded-[1.65rem] bg-slate-100 text-slate-600 flex items-center justify-center hover:bg-slate-200 transition-all active:scale-95 relative" title="Kommentare verfassen">
          ${iconFn("message-square", "w-5 h-5")}
          ${counts.comments > 0 ? `<span id="menuDetailFooterCommentsBadge" class="absolute top-0 right-0 -mt-1 -mr-1 w-5 h-5 rounded-full bg-indigo-600 text-white text-[9px] font-black flex items-center justify-center border-2 border-white">${counts.comments}</span>` : ""}
        </button>

        <button id="menuDetailAddToCartBtn" class="flex-1 h-[52px] rounded-[1.65rem] bg-slate-900 text-white flex items-center justify-center gap-2 active:scale-95 transition-all ${canAddToCartNow && !soldOut ? "" : "opacity-50 pointer-events-none"}">
          <span class="font-bold text-sm">${soldOut ? "Ausverkauft" : "In den Warenkorb"}</span>
          ${iconFn("shopping-bag", "w-4 h-4")}
        </button>
      </div>

      <div id="footer-comment-view" class="flex gap-3 items-center w-full transition-all duration-300 ${isCommentFooter ? "" : "hidden opacity-0"}">
        <button type="button" id="menuDetailFooterCartToggle" class="w-[52px] h-[52px] shrink-0 rounded-[1.65rem] bg-slate-100 text-slate-600 flex items-center justify-center hover:bg-slate-200 transition-all active:scale-95" title="Zurueck zum Warenkorb">
          ${iconFn("shopping-bag", "w-5 h-5")}
        </button>

        <div class="flex-1 flex gap-2">
          <textarea id="menuDetailCommentInput" placeholder="${canInteract ? "Schreib einen Kommentar..." : "Bitte einloggen"}" class="flex-1 px-5 py-3.5 rounded-[1.65rem] border border-slate-100 bg-slate-50 text-sm font-medium outline-none resize-none leading-relaxed ${canInteract ? "" : "opacity-60"}" rows="1" ${canInteract ? "" : "disabled"}>${esc(state.menuDetail.commentText || "")}</textarea>
          <button id="menuDetailCommentSend" class="w-[52px] h-[52px] shrink-0 rounded-[1.65rem] bg-indigo-600 text-white flex items-center justify-center ${canInteract ? "" : "opacity-60 cursor-not-allowed"}" ${canInteract ? "" : "disabled"}>
            ${iconFn("send", "w-4 h-4")}
          </button>
        </div>
      </div>
    </div>
  `;
  const animClass = "";

  return `
    <div class="fixed inset-0 z-[75] modal-overlay">
      <div id="menuDetailOverlay" data-menu-detail-close="true" class="absolute inset-0 bg-black/60"></div>
      <div class="modal-frame">
        <div class="bg-white rounded-t-[3.2rem] shadow-[0_-24px_80px_rgba(15,23,42,0.22)] border border-slate-100 ${animClass} flex flex-col modal-sheet-88 overflow-hidden modal-sheet">
          ${headerHtml}
          ${bodyHtml}
          ${footerHtml}
        </div>
      </div>
    </div>
  `;
}
