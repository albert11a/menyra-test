import { normalizeRestaurantTypeCore } from "../profile/restaurant-type-utils.js";
import { t } from "/shared/i18n/i18n.js";

export function createShopViewCartOrchestrationController({
  state = null,
  getMenuItemImagesFn = () => [],
  resolveMenuItemHeroFn = () => "",
  getOptimizedImageUrlFn = () => "",
  isPlaceholderUrlFn = () => false,
  placeholderImage = "",
  getFirebaseStorageUrlFn = () => "",
  isDirectImageUrlFn = () => false,
  formatPriceFn = (value) => String(value ?? ""),
  escapeHtmlFn = (value) => String(value ?? ""),
  getMenuItemObjectPositionFn = () => "50% 50%",
  iconFn = () => "",
  loadFavoriteMenuItemsFn = async () => {},
  createEmptyFavoriteMenuItemsStateFn = () => ({ items: [], loading: false, error: "", loaded: false }),
  getShopCartProfileContextCoreFn = () => ({ restaurantId: "", businessName: "", businessAvatar: "" }),
  getRestaurantMetaByIdFn = () => ({}),
  getShopCartTotalCoreFn = () => 0,
  parsePriceValueFn = () => 0,
  canAddToShopCartFn = () => false,
  normalizeShopCartStateFn = (cart) => cart || {},
  buildShopVariantKeyFn = (itemId) => String(itemId || ""),
  clampCropPercentFn = (value, fallback = 50) => (Number.isFinite(Number(value)) ? Number(value) : fallback),
  createEmptyShopCartFn = () => ({
    restaurantId: "",
    businessName: "",
    businessAvatar: "",
    tableNumber: 0,
    tableLabel: "",
    serviceMode: "",
    items: [],
    checkoutOpen: false,
    form: { name: "", phone: "", city: "", address: "", tableNumber: 0, tableLabel: "" },
    status: "",
    loading: false
  }),
  saveShopCartToStorageFn = () => {},
  renderFn = () => {},
  confirmFn = () => true
} = {}) {
  if (!state) {
    return {
      renderShopProductList: () => "",
      renderProfileShopFavoritesView: () => "",
      renderProfileShopCartView: () => "",
      clearShopCart: () => {},
      getCurrentShopProfile: () => null,
      getShopCartProfileContext: () => ({ restaurantId: "", businessName: "", businessAvatar: "" }),
      addMenuItemToShopCart: () => {},
      updateShopCartQuantity: () => {},
      updateShopCartItemComment: () => {},
      openShopCheckout: () => {},
      updateShopCheckoutField: () => {},
      getShopCartTotal: () => 0
    };
  }
  const tr = (key, fallback = key, params = {}) => t(key, { fallback, params });

  function renderShopProductList(items, { source = "menu", showRestaurantName = false } = {}) {
    if (!items.length) {
      return `
      <div class="bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm">
        <div class="text-center py-16 text-slate-300 font-black uppercase text-[10px] tracking-[0.3em]">
          ${escapeHtmlFn(tr("menu.noProducts", "Keine Produkte"))}
        </div>
      </div>
    `;
    }
    return `
    <div class="grid grid-cols-2 gap-4">
      ${items.map((item, index) => {
        const images = getMenuItemImagesFn(item);
        const rawImg = images[0] || resolveMenuItemHeroFn(item);
        const isCriticalImage = index < 2;
        const imageLoadAttrs = isCriticalImage
          ? `loading="eager" fetchpriority="high"`
          : `loading="lazy" fetchpriority="low"`;
        const imgSrc = getOptimizedImageUrlFn(rawImg, isCriticalImage ? "medium" : "small");
        const safeImg = isPlaceholderUrlFn(imgSrc) ? placeholderImage : imgSrc;
        const firebaseFallback = getFirebaseStorageUrlFn(rawImg);
        const fallbackImg = isDirectImageUrlFn(rawImg) && rawImg !== safeImg ? rawImg : firebaseFallback;
        const responsiveEntries = ["small", "medium", "large"].map((sizeKey) => {
          const width = sizeKey === "small" ? 480 : (sizeKey === "medium" ? 768 : 1280);
          const sizedUrl = getOptimizedImageUrlFn(rawImg, sizeKey);
          if (!sizedUrl || isPlaceholderUrlFn(sizedUrl)) return "";
          return `${escapeHtmlFn(sizedUrl)} ${width}w`;
        }).filter(Boolean);
        const responsiveSrcsetValue = responsiveEntries.length > 1
          ? responsiveEntries.join(", ")
          : "";
        const responsiveSizesValue = responsiveSrcsetValue
          ? "(max-width: 640px) 48vw, (max-width: 1200px) 28vw, 360px"
          : "";
        const useStrictLazy = !isCriticalImage;
        const renderedSrc = useStrictLazy ? placeholderImage : safeImg;
        const renderedFallback = useStrictLazy ? placeholderImage : fallbackImg;
        const responsiveSrcset = !useStrictLazy && responsiveSrcsetValue
          ? ` srcset="${escapeHtmlFn(responsiveSrcsetValue)}" sizes="${escapeHtmlFn(responsiveSizesValue)}"`
          : "";
        const strictLazyAttrs = useStrictLazy
          ? [
            `data-menu-lazy-src="${escapeHtmlFn(safeImg)}"`,
            `data-menu-lazy-fallback="${escapeHtmlFn(fallbackImg || placeholderImage)}"`,
            responsiveSrcsetValue ? `data-menu-lazy-srcset="${escapeHtmlFn(responsiveSrcsetValue)}"` : "",
            responsiveSizesValue ? `data-menu-lazy-sizes="${escapeHtmlFn(responsiveSizesValue)}"` : ""
          ].filter(Boolean).join(" ")
          : "";
        const priceLabel = formatPriceFn(item.price);
        const stockRaw = item.stock;
        const stockValue = typeof stockRaw === "string" ? stockRaw.trim() : stockRaw;
        const parsedStock = stockValue === "" || stockValue === null || stockValue === undefined
          ? null
          : Number(stockValue);
        const stock = parsedStock === null || !Number.isFinite(parsedStock) ? null : Math.max(0, parsedStock);
        const thumbImages = images.slice(1, 4);
        const itemRestaurantId = String(item?.restaurantId || "").trim();
        const restaurantAttr = itemRestaurantId
          ? ` data-menu-open-restaurant="${escapeHtmlFn(itemRestaurantId)}"`
          : "";
        return `
          <article data-menu-open="${escapeHtmlFn(item.id)}" data-menu-open-source="${escapeHtmlFn(source)}"${restaurantAttr} role="button" tabindex="0" class="min-w-0 p-3 rounded-[2rem] bg-white border border-slate-100 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col" style="touch-action:pan-y;">
            <div class="rounded-[1.5rem] overflow-hidden bg-slate-100" style="aspect-ratio:4 / 5;">
              <img src="${escapeHtmlFn(renderedSrc)}" data-fallback-src="${escapeHtmlFn(renderedFallback)}"${strictLazyAttrs ? ` ${strictLazyAttrs}` : ""} data-image-reveal="menu" class="w-full h-full object-cover" style="object-position:${getMenuItemObjectPositionFn(item)};" width="480" height="600" ${imageLoadAttrs}${responsiveSrcset} decoding="async" />
            </div>
            ${thumbImages.length ? `
              <div class="grid grid-cols-3 gap-2 mt-2">
                ${thumbImages.map((thumb) => {
                  const thumbSrc = getOptimizedImageUrlFn(thumb, "thumb");
                  const safeThumb = isPlaceholderUrlFn(thumbSrc) ? placeholderImage : thumbSrc;
                  const thumbStorageFallback = getFirebaseStorageUrlFn(thumb);
                  const thumbFallback = isDirectImageUrlFn(thumb) && thumb !== safeThumb ? thumb : thumbStorageFallback;
                  const thumbStrictLazyAttrs = [
                    `data-menu-lazy-src="${escapeHtmlFn(safeThumb)}"`,
                    `data-menu-lazy-fallback="${escapeHtmlFn(thumbFallback || placeholderImage)}"`
                  ].join(" ");
                  return `
                    <div class="rounded-xl overflow-hidden bg-slate-100 border border-slate-100" style="aspect-ratio:4 / 5;">
                      <img src="${escapeHtmlFn(placeholderImage)}" data-fallback-src="${escapeHtmlFn(placeholderImage)}" ${thumbStrictLazyAttrs} data-image-reveal="menu" class="w-full h-full object-cover" loading="lazy" fetchpriority="low" sizes="(max-width: 640px) 15vw, 110px" decoding="async" />
                    </div>
                  `;
                }).join("")}
              </div>
            ` : ""}
              <div class="pt-3 flex-1 flex flex-col min-w-0">
                ${showRestaurantName && item.restaurantName ? `<p class="text-[9px] font-black uppercase tracking-widest text-indigo-600 truncate mb-1">${escapeHtmlFn(item.restaurantName)}</p>` : ""}
                <div class="flex items-start justify-between gap-2">
                  <div class="min-w-0">
                    <p class="text-[13px] font-black text-slate-900 leading-tight line-clamp-2">${escapeHtmlFn(item.name || "Produkt")}</p>
                  </div>
                  <span class="text-[11px] font-black text-slate-900 shrink-0">${escapeHtmlFn(priceLabel)}</span>
                </div>
                ${item.description ? `<p class="text-[11px] text-slate-500 mt-2 line-clamp-2">${escapeHtmlFn(item.description)}</p>` : ""}
              </div>
            </article>
        `;
      }).join("")}
    </div>
  `;
  }

  function renderProfileShopFavoritesView(profile = state.profileView?.profile || state.userProfile) {
    const userUid = String(state.user?.uid || "").trim();
    if (!userUid) {
      return `
      <div class="px-5 app-main-content-safe">
        <div class="bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm text-center">
          <div class="w-14 h-14 rounded-[1.4rem] bg-slate-100 text-slate-400 mx-auto flex items-center justify-center mb-4">
            ${iconFn("bookmark", "w-6 h-6")}
          </div>
          <p class="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">${escapeHtmlFn(tr("favorites.userOnly", "Favoriten nur fuer User"))}</p>
          <p class="text-sm font-medium text-slate-500 mt-3">${escapeHtmlFn(tr("auth.registerOrLogin", "Bitte registrieren oder einloggen."))}</p>
          <button data-auth-open class="mt-5 px-5 h-11 rounded-2xl bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest">
            ${escapeHtmlFn(tr("auth.loginRegister", "Login / Registrieren"))}
          </button>
        </div>
      </div>
    `;
    }
    if (!state.favoriteMenuItems.loading && !state.favoriteMenuItems.loaded && !(state.favoriteMenuItems.items || []).length) {
      void loadFavoriteMenuItemsFn();
    }
    const favoriteState = state.favoriteMenuItems || createEmptyFavoriteMenuItemsStateFn();
    const favoriteItems = Array.isArray(favoriteState.items) ? favoriteState.items : [];
    const isLoading = favoriteState.loading || (!favoriteState.loaded && !favoriteItems.length);
    return `
    <div class="p-6 app-main-content-safe space-y-5">
      <div class="flex items-center justify-between">
        <div>
          <span class="text-[9px] font-black text-indigo-600 uppercase tracking-widest">${escapeHtmlFn(tr("favorites.title", "Favoriten"))}</span>
          <h2 class="text-2xl font-black italic uppercase tracking-tighter">${escapeHtmlFn(tr("favorites.heading", "Du liebst"))}</h2>
        </div>
      </div>
      ${isLoading ? `
        <div class="bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm">
          <div class="text-center py-12 text-[10px] font-bold uppercase tracking-widest text-slate-400">${escapeHtmlFn(tr("favorites.loading", "Favoriten werden geladen..."))}</div>
        </div>
      ` : favoriteState.error ? `
        <div class="bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm">
          <div class="text-center py-12 text-[10px] font-bold uppercase tracking-widest text-rose-500">${escapeHtmlFn(favoriteState.error)}</div>
        </div>
      ` : favoriteItems.length ? `
        ${renderShopProductList(favoriteItems, { source: "favorites", showRestaurantName: true })}
      ` : `
        <div class="bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm text-center">
          <div class="w-14 h-14 rounded-[1.4rem] bg-slate-100 text-slate-400 mx-auto flex items-center justify-center mb-4">
            ${iconFn("bookmark", "w-6 h-6")}
          </div>
          <p class="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">${escapeHtmlFn(tr("favorites.empty", "Noch keine Favoriten"))}</p>
          <p class="text-sm font-medium text-slate-500 mt-3">${escapeHtmlFn(tr("favorites.emptyHint", "Tippe im Produkt-Drawer auf das Bookmark-Icon."))}</p>
        </div>
      `}
    </div>
  `;
  }

  function getCurrentShopProfile() {
    return state.profileView?.profile || state.userProfile;
  }

  function resolveCheckoutBusinessType(profile = getCurrentShopProfile()) {
    const context = getShopCartProfileContext(profile);
    const restaurantId = String(context.restaurantId || state.shopCart?.restaurantId || profile?.restaurantId || "").trim();
    const restaurant = restaurantId ? (getRestaurantMetaByIdFn(restaurantId) || {}) : {};
    return normalizeRestaurantTypeCore(
      restaurant?.type
      || restaurant?.customerType
      || profile?.type
      || profile?.customerType
      || state.userProfile?.type
      || state.userProfile?.customerType
      || ""
    );
  }

  function isHospitalityCheckout(profile = getCurrentShopProfile()) {
    return ["restaurant", "cafe", "fastfood"].includes(resolveCheckoutBusinessType(profile));
  }

  function getShopCartProfileContext(profile = getCurrentShopProfile()) {
    const base = getShopCartProfileContextCoreFn(profile, {
      getRestaurantMetaByIdFn
    });
    const menuAccessSource = String(state.profileView?.menuAccessSource || "").trim().toLowerCase();
    const routeTableNumber = Math.max(0, Number(state.profileView?.tableNumber || 0) || 0);
    return {
      ...base,
      tableNumber: menuAccessSource === "qr" ? routeTableNumber : 0,
      tableLabel: menuAccessSource === "qr" && routeTableNumber ? `Tisch ${routeTableNumber}` : "",
      serviceMode: menuAccessSource === "qr" && routeTableNumber ? "table" : ""
    };
  }

  function getShopCartTotal() {
    return getShopCartTotalCoreFn(state.shopCart.items || [], {
      parsePriceValueFn
    });
  }

  function resolveCartContextForItem(item, profile = getCurrentShopProfile()) {
    const baseContext = getShopCartProfileContext(profile);
    const itemRestaurantId = String(item?.restaurantId || "").trim();
    if (!itemRestaurantId || itemRestaurantId === String(baseContext.restaurantId || "").trim()) {
      return baseContext;
    }
    const restaurant = getRestaurantMetaByIdFn(itemRestaurantId) || {};
    return {
      ...baseContext,
      restaurantId: itemRestaurantId,
      businessName: String(
        restaurant?.name
        || restaurant?.restaurantName
        || baseContext.businessName
        || "Shop"
      ).trim() || "Shop",
      businessAvatar: String(
        restaurant?.logoUrl
        || restaurant?.logo
        || baseContext.businessAvatar
        || ""
      ).trim(),
      tableNumber: 0,
      tableLabel: "",
      serviceMode: ""
    };
  }

  function renderProfileShopCartView(profile = state.profileView?.profile || state.userProfile) {
    const context = getShopCartProfileContext(profile);
    const cartMatches = context.restaurantId && String(state.shopCart.restaurantId || "") === context.restaurantId;
    const items = cartMatches ? (state.shopCart.items || []) : [];
    const total = cartMatches ? getShopCartTotal() : 0;
    const hasOtherCart = !!state.shopCart.restaurantId && !cartMatches && (state.shopCart.items || []).length;
    const tableNumber = cartMatches ? Math.max(0, Number(state.shopCart.tableNumber || state.shopCart.form?.tableNumber || 0) || 0) : 0;
    const isTableService = cartMatches && String(state.shopCart.serviceMode || "") === "table" && tableNumber > 0;
    const hospitalityCheckout = isHospitalityCheckout(profile);
    const directOrderFlow = isTableService || hospitalityCheckout;
    const confirmation = cartMatches && !items.length && String(state.shopCart?.confirmation?.restaurantId || "") === context.restaurantId
      ? state.shopCart.confirmation
      : null;
    return `
    <div class="px-5 app-main-content-safe space-y-5">
      <div class="bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm">
        <div class="flex items-center justify-between mb-4">
          <div>
            <span class="text-[9px] font-black text-indigo-600 uppercase tracking-widest">${escapeHtmlFn(tr("cart.title", "Warenkorb"))}</span>
            <h3 class="text-xl font-black italic tracking-tighter">${escapeHtmlFn(context.businessName || "Shop")}</h3>
            ${isTableService ? `<p class="text-[10px] font-black uppercase tracking-widest text-emerald-600 mt-2">Tisch ${escapeHtmlFn(tableNumber)}</p>` : ""}
          </div>
          <div class="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-600">
            ${iconFn("shopping-cart", "w-5 h-5")}
          </div>
        </div>
        ${hasOtherCart ? `
          <p class="text-[11px] font-bold text-amber-600 uppercase tracking-wider">${escapeHtmlFn(tr("cart.otherShop", "Dein aktueller Warenkorb gehoert zu einem anderen Shop."))}</p>
        ` : confirmation ? `
          <div class="text-center py-10">
            <div class="relative w-24 h-24 mx-auto mb-6">
              <div class="absolute inset-0 rounded-full bg-emerald-100 animate-ping opacity-60"></div>
              <div class="absolute inset-[10px] rounded-full bg-emerald-200/80 animate-pulse"></div>
              <div class="absolute inset-[22px] rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-xl shadow-emerald-300/40">
                ${iconFn("check", "w-8 h-8")}
              </div>
            </div>
            <p class="text-[10px] font-black uppercase tracking-[0.25em] text-emerald-600">${escapeHtmlFn(tr("cart.sent", "Bestellung gesendet"))}</p>
            <h4 class="text-[22px] font-black italic tracking-tight text-slate-900 mt-3">${escapeHtmlFn(confirmation.title || tr("cart.order", "Bestellung"))}</h4>
            <p class="text-sm font-medium text-slate-500 mt-3">${escapeHtmlFn(confirmation.message || tr("cart.orderReadySoon", "Ihre Bestellung wird zubereitet und in Kuerze serviert."))}</p>
            ${confirmation.tableNumber ? `<p class="text-[10px] font-black uppercase tracking-widest text-emerald-700 mt-4">Tisch ${escapeHtmlFn(confirmation.tableNumber)}</p>` : ""}
          </div>
        ` : items.length ? `
          <div class="space-y-3">
            ${items.map((item) => `
              <div class="p-3 rounded-[1.6rem] bg-slate-50 border border-slate-100 space-y-3">
                <div class="flex items-center gap-3">
                  <div class="w-14 h-14 rounded-2xl overflow-hidden bg-white shrink-0">
                    <img src="${escapeHtmlFn(getOptimizedImageUrlFn(item.imageUrl || "", "thumb"))}" class="w-full h-full object-cover" style="object-position:${clampCropPercentFn(item.cropX ?? 50, 50)}% ${clampCropPercentFn(item.cropY ?? 50, 50)}%;" />
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-black text-slate-900 truncate">${escapeHtmlFn(item.name)}</p>
                    ${item.selectedSize || item.selectedColor ? `<p class="text-[9px] font-bold uppercase tracking-widest text-slate-300 mt-1">${escapeHtmlFn([item.selectedSize, item.selectedColor].filter(Boolean).join(" / "))}</p>` : ""}
                    <p class="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1">${escapeHtmlFn(formatPriceFn(item.price))}</p>
                  </div>
                  <div class="flex items-center gap-2">
                    <button data-cart-qty="${escapeHtmlFn(item.cartKey || item.itemId)}" data-cart-delta="-1" class="w-8 h-8 rounded-xl bg-white border border-slate-200 text-slate-500 flex items-center justify-center">${iconFn("minus", "w-3 h-3")}</button>
                    <span class="w-6 text-center text-sm font-black text-slate-900">${escapeHtmlFn(item.quantity)}</span>
                    <button data-cart-qty="${escapeHtmlFn(item.cartKey || item.itemId)}" data-cart-delta="1" class="w-8 h-8 rounded-xl bg-white border border-slate-200 text-slate-500 flex items-center justify-center">${iconFn("plus", "w-3 h-3")}</button>
                  </div>
                </div>
                <div>
                  <input
                    data-cart-item-comment="${escapeHtmlFn(item.cartKey || item.itemId)}"
                    type="text"
                    maxlength="180"
                    aria-label="${escapeHtmlFn(tr("cart.commentForWaiter", "Kommentar fuer den Kellner"))}"
                    value="${escapeHtmlFn(item.comment || "")}"
                    placeholder="${escapeHtmlFn(tr("cart.commentPlaceholder", "Kommentar fuer den Kellner..."))}"
                    class="w-full h-11 rounded-[1.2rem] border border-slate-200 bg-white/90 px-4 text-[13px] font-semibold text-slate-700 placeholder:text-slate-400 outline-none transition focus:border-emerald-300 focus:ring-4 focus:ring-emerald-100/70"
                  />
                </div>
              </div>
            `).join("")}
            <div class="pt-3 flex items-center justify-between">
              <span class="text-[10px] font-black uppercase tracking-widest text-slate-400">${escapeHtmlFn(tr("cart.total", "Gesamt"))}</span>
              <span class="text-lg font-black text-slate-900">${escapeHtmlFn(formatPriceFn(total))}</span>
            </div>
            <button data-cart-checkout="${directOrderFlow ? "submit" : "open"}" class="w-full py-4 rounded-[1.8rem] bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-slate-200/60 active:scale-95 ${state.shopCart.loading ? "opacity-70 pointer-events-none" : ""}">
              ${state.shopCart.loading ? escapeHtmlFn(tr("cart.sending", "Bestellung wird gesendet...")) : (directOrderFlow ? (isTableService ? escapeHtmlFn(tr("cart.tableOrderSubmit", "Tischbestellung absenden")) : escapeHtmlFn(tr("cart.orderSubmit", "Bestellung absenden"))) : escapeHtmlFn(tr("cart.checkoutStart", "Checkout starten")))}
            </button>
            ${directOrderFlow ? `<p class="text-center text-[10px] font-bold uppercase tracking-widest text-slate-400">${isTableService ? escapeHtmlFn(tr("cart.directTable", "Direkt fuer deinen Tisch")) : escapeHtmlFn(tr("cart.directNoDetails", "Direkt ohne weitere Angaben"))}</p>` : ""}
            ${state.shopCart.status && !state.shopCart.checkoutOpen ? `<p class="text-center text-[10px] font-bold uppercase tracking-widest text-slate-400">${escapeHtmlFn(state.shopCart.status)}</p>` : ""}
          </div>
        ` : `
          <div class="text-center py-14">
            <div class="w-14 h-14 rounded-[1.4rem] bg-slate-100 text-slate-400 mx-auto flex items-center justify-center mb-4">
              ${iconFn("shopping-bag", "w-6 h-6")}
            </div>
            <p class="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">${escapeHtmlFn(tr("cart.empty", "Warenkorb leer"))}</p>
            <p class="text-sm font-medium text-slate-500 mt-3">${escapeHtmlFn(tr("cart.emptyHint", "Tippe auf das Plus bei einem Produkt."))}</p>
          </div>
        `}
      </div>
      ${cartMatches && items.length && state.shopCart.checkoutOpen && !directOrderFlow ? `
        <div class="bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm space-y-4">
          <div>
            <span class="text-[9px] font-black text-indigo-600 uppercase tracking-widest">${escapeHtmlFn(tr("cart.checkout", "Checkout"))}</span>
            <h3 class="text-xl font-black italic tracking-tighter">${isTableService ? escapeHtmlFn(tr("cart.tableOrder", "Tischbestellung")) : (hospitalityCheckout ? escapeHtmlFn(tr("cart.directOrder", "Direkt bestellen")) : escapeHtmlFn(tr("cart.deliveryData", "Lieferdaten")))}</h3>
            ${isTableService ? `<p class="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-2">${escapeHtmlFn(tr("cart.tableOrderFor", "Bestellung fuer Tisch {table}", { table: tableNumber }))}</p>` : ""}
          </div>
          <div class="grid grid-cols-1 gap-3">
            ${isTableService ? `
              <div class="rounded-[1.8rem] border border-emerald-100 bg-emerald-50 px-5 py-4">
                <p class="text-[10px] font-black uppercase tracking-widest text-emerald-700">${escapeHtmlFn(tr("cart.tableDirect", "Direkt am Tisch"))}</p>
                <p class="text-sm font-bold text-slate-700 mt-2">${escapeHtmlFn(tr("cart.tableDirectBody", "Keine Namen oder Telefonnummern noetig. Die Bestellung geht direkt an Tisch {table}.", { table: tableNumber }))}</p>
              </div>
            ` : hospitalityCheckout ? `
              <div class="rounded-[1.8rem] border border-indigo-100 bg-indigo-50 px-5 py-4">
                <p class="text-[10px] font-black uppercase tracking-widest text-indigo-700">${escapeHtmlFn(tr("cart.fastCheckout", "Schneller Checkout"))}</p>
                <p class="text-sm font-bold text-slate-700 mt-2">${escapeHtmlFn(tr("cart.fastCheckoutBody", "Fuer {business} sind keine Namen oder Telefonnummern noetig. Bestellung direkt absenden.", { business: context.businessName || tr("common.thisBusiness", "dieses Lokal") }))}</p>
              </div>
            ` : `
              <input data-cart-field="name" type="text" value="${escapeHtmlFn(state.shopCart.form.name || "")}" placeholder="${escapeHtmlFn(tr("common.name", "Name"))}" class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100" />
              <input data-cart-field="phone" type="text" value="${escapeHtmlFn(state.shopCart.form.phone || "")}" placeholder="${escapeHtmlFn(tr("common.phone", "Tel Nummer"))}" class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100" />
              <input data-cart-field="city" type="text" value="${escapeHtmlFn(state.shopCart.form.city || "")}" placeholder="${escapeHtmlFn(tr("common.city", "Qyteti"))}" class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100" />
              <textarea data-cart-field="address" rows="3" placeholder="${escapeHtmlFn(tr("common.address", "Adresa"))}" class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100 resize-none">${escapeHtmlFn(state.shopCart.form.address || "")}</textarea>
            `}
          </div>
          <button data-cart-checkout="submit" class="w-full py-4 rounded-[1.8rem] bg-indigo-600 text-white text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-indigo-500/20 active:scale-95" ${state.shopCart.loading ? "disabled" : ""}>
            ${state.shopCart.loading ? escapeHtmlFn(tr("cart.send", "Senden...")) : (isTableService ? escapeHtmlFn(tr("cart.tableOrderSubmit", "Tischbestellung absenden")) : escapeHtmlFn(tr("cart.orderSubmit", "Bestellung absenden")))}
          </button>
          ${state.shopCart.status ? `<p class="text-center text-[10px] font-bold uppercase tracking-widest ${state.shopCart.loading ? "text-slate-400" : "text-slate-500"}">${escapeHtmlFn(state.shopCart.status)}</p>` : ""}
        </div>
      ` : ""}
    </div>
  `;
  }

  function clearShopCart({ keepForm = false } = {}) {
    const form = keepForm
      ? { ...(state.shopCart?.form || createEmptyShopCartFn().form) }
      : { ...createEmptyShopCartFn().form };
    const tableNumber = keepForm ? Math.max(0, Number(state.shopCart?.tableNumber || state.shopCart?.form?.tableNumber || 0) || 0) : 0;
    const tableLabel = keepForm
      ? String(state.shopCart?.tableLabel || state.shopCart?.form?.tableLabel || "").trim()
      : "";
    const serviceMode = keepForm ? String(state.shopCart?.serviceMode || "").trim().toLowerCase() : "";
    state.shopCart = {
      ...createEmptyShopCartFn(),
      form: {
        ...form,
        tableNumber,
        tableLabel
      },
      tableNumber,
      tableLabel,
      serviceMode
    };
    saveShopCartToStorageFn();
  }

  function addMenuItemToShopCart(item, profile = getCurrentShopProfile(), options = {}) {
    const forceAdd = options?.forceAdd === true;
    if (!item) {
      const nextCart = normalizeShopCartStateFn(state.shopCart);
      nextCart.status = tr("cart.addFailed", "Produkt konnte nicht hinzugefuegt werden.");
      state.shopCart = nextCart;
      renderFn();
      return false;
    }
    if (!forceAdd && !canAddToShopCartFn(profile)) {
      const nextCart = normalizeShopCartStateFn(state.shopCart);
      nextCart.status = tr("cart.reopenProduct", "Bitte Produkt erneut oeffnen und hinzufuegen.");
      state.shopCart = nextCart;
      renderFn();
      return false;
    }
    const context = resolveCartContextForItem(item, profile);
    if (!context.restaurantId) {
      const nextCart = normalizeShopCartStateFn(state.shopCart);
      nextCart.status = tr("cart.shopMissing", "Shop-Zuordnung fehlt. Bitte neu laden.");
      state.shopCart = nextCart;
      renderFn();
      return false;
    }
    const resolvedItemId = String(
      item?.id
      || item?.itemId
      || item?.menuItemId
      || item?.productId
      || ""
    ).trim();
    if (!resolvedItemId) {
      const nextCart = normalizeShopCartStateFn(state.shopCart);
      nextCart.status = tr("cart.productIdMissing", "Produkt-ID fehlt. Bitte neu laden.");
      state.shopCart = nextCart;
      renderFn();
      return false;
    }
    const currentRestaurantId = String(state.shopCart?.restaurantId || "").trim();
    if (currentRestaurantId && currentRestaurantId !== context.restaurantId) {
      const shouldReplace = confirmFn(tr("cart.otherShop", "Dein aktueller Warenkorb gehoert zu einem anderen Shop."));
      if (!shouldReplace) {
        const nextCart = normalizeShopCartStateFn(state.shopCart);
        nextCart.status = tr("cart.otherShop", "Dein aktueller Warenkorb gehoert zu einem anderen Shop.");
        state.shopCart = nextCart;
        renderFn();
        return false;
      }
      clearShopCart({ keepForm: true });
    }
    const nextCart = normalizeShopCartStateFn(state.shopCart);
    const selectedSize = String(options?.size || "").trim();
    const selectedColor = String(options?.color || "").trim();
    const cartKey = buildShopVariantKeyFn(resolvedItemId, { size: selectedSize, color: selectedColor });
    const existingIndex = nextCart.items.findIndex((entry) => String(entry.cartKey || entry.itemId) === cartKey);
    const entry = {
      id: resolvedItemId,
      itemId: resolvedItemId,
      cartKey,
      name: String(item.name || "Produkt").trim() || "Produkt",
      price: String(item.price ?? "").trim(),
      quantity: 1,
      imageUrl: String(resolveMenuItemHeroFn(item) || "").trim(),
      category: String(item.category || "").trim(),
      selectedSize,
      selectedColor,
      comment: "",
      cropX: clampCropPercentFn(item?.cropX ?? 50, 50),
      cropY: clampCropPercentFn(item?.cropY ?? 50, 50)
    };
    if (existingIndex >= 0) {
      nextCart.items[existingIndex] = {
        ...nextCart.items[existingIndex],
        quantity: Math.max(1, Number(nextCart.items[existingIndex].quantity || 1) + 1)
      };
    } else {
      nextCart.items.unshift(entry);
    }
    nextCart.restaurantId = context.restaurantId;
    nextCart.businessName = context.businessName;
    nextCart.businessAvatar = context.businessAvatar;
    nextCart.tableNumber = context.tableNumber || nextCart.tableNumber || 0;
    nextCart.tableLabel = context.tableLabel || nextCart.tableLabel || "";
    nextCart.serviceMode = context.serviceMode || nextCart.serviceMode || "";
    nextCart.form = {
      ...(nextCart.form || createEmptyShopCartFn().form),
      tableNumber: nextCart.tableNumber,
      tableLabel: nextCart.tableLabel
    };
    nextCart.status = tr("cart.added", "{name} wurde zum Warenkorb hinzugefuegt.", { name: entry.name });
    state.shopCart = nextCart;
    saveShopCartToStorageFn();
    renderFn();
    return true;
  }

  function updateShopCartQuantity(itemId, delta) {
    const safeId = String(itemId || "").trim();
    if (!safeId) return;
    const nextCart = normalizeShopCartStateFn(state.shopCart);
    nextCart.items = nextCart.items
      .map((entry) => (
        String(entry.cartKey || entry.itemId) === safeId
          ? { ...entry, quantity: Math.max(0, Number(entry.quantity || 1) + Number(delta || 0)) }
          : entry
      ))
      .filter((entry) => entry.quantity > 0);
    nextCart.status = "";
    if (!nextCart.items.length) {
      clearShopCart({ keepForm: true });
    } else {
      state.shopCart = nextCart;
      saveShopCartToStorageFn();
    }
    renderFn();
  }

  function updateShopCartItemComment(itemId, value) {
    const safeId = String(itemId || "").trim();
    if (!safeId) return;
    const nextCart = normalizeShopCartStateFn(state.shopCart);
    const nextComment = String(value || "").replace(/\s+/g, " ").trimStart().slice(0, 180);
    let changed = false;
    nextCart.items = nextCart.items.map((entry) => {
      if (String(entry.cartKey || entry.itemId) !== safeId) return entry;
      if (String(entry.comment || "") === nextComment) return entry;
      changed = true;
      return {
        ...entry,
        comment: nextComment
      };
    });
    if (!changed) return;
    nextCart.status = "";
    state.shopCart = nextCart;
    saveShopCartToStorageFn();
  }

  function openShopCheckout() {
    const nextCart = normalizeShopCartStateFn(state.shopCart);
    if (!nextCart.items.length) return;
    const isTableService = String(nextCart.serviceMode || "").trim().toLowerCase() === "table" && Number(nextCart.tableNumber || 0) > 0;
    nextCart.checkoutOpen = true;
    nextCart.status = "";
    if (!nextCart.form.name) nextCart.form.name = String(state.userProfile?.name || state.user?.displayName || "").trim();
    if (!nextCart.form.phone) nextCart.form.phone = String(state.userProfile?.phone || state.user?.phoneNumber || "").trim();
    if (!isTableService) {
      if (!nextCart.form.city) nextCart.form.city = String(state.userProfile?.location || "").trim();
      if (!nextCart.form.address) nextCart.form.address = String(state.userProfile?.address || "").trim();
    }
    nextCart.form.tableNumber = Math.max(0, Number(nextCart.tableNumber || nextCart.form.tableNumber || 0) || 0);
    nextCart.form.tableLabel = String(nextCart.tableLabel || nextCart.form.tableLabel || "").trim();
    state.shopCart = nextCart;
    saveShopCartToStorageFn();
    renderFn();
  }

  function updateShopCheckoutField(field, value) {
    if (!field) return;
    const nextCart = normalizeShopCartStateFn(state.shopCart);
    if (!(field in nextCart.form)) return;
    nextCart.form[field] = String(value || "");
    nextCart.status = "";
    state.shopCart = nextCart;
    saveShopCartToStorageFn();
  }

  return {
    renderShopProductList,
    renderProfileShopFavoritesView,
    renderProfileShopCartView,
    clearShopCart,
    getCurrentShopProfile,
    getShopCartProfileContext,
    addMenuItemToShopCart,
    updateShopCartQuantity,
    updateShopCartItemComment,
    openShopCheckout,
    updateShopCheckoutField,
    getShopCartTotal
  };
}
