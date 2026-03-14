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
    items: [],
    checkoutOpen: false,
    form: { name: "", phone: "", city: "", address: "" },
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
      openShopCheckout: () => {},
      updateShopCheckoutField: () => {},
      getShopCartTotal: () => 0
    };
  }

  function renderShopProductList(items, { source = "menu", showRestaurantName = false } = {}) {
    if (!items.length) {
      return `
      <div class="bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm">
        <div class="text-center py-16 text-slate-300 font-black uppercase text-[10px] tracking-[0.3em]">
          Keine Produkte
        </div>
      </div>
    `;
    }
    return `
    <div class="grid grid-cols-2 gap-4">
      ${items.map((item) => {
        const images = getMenuItemImagesFn(item);
        const rawImg = images[0] || resolveMenuItemHeroFn(item);
        const imgSrc = getOptimizedImageUrlFn(rawImg, "large");
        const safeImg = isPlaceholderUrlFn(imgSrc) ? placeholderImage : imgSrc;
        const firebaseFallback = getFirebaseStorageUrlFn(rawImg);
        const fallbackImg = isDirectImageUrlFn(rawImg) && rawImg !== safeImg ? rawImg : firebaseFallback;
        const priceLabel = formatPriceFn(item.price);
        const stockRaw = item.stock;
        const stockValue = typeof stockRaw === "string" ? stockRaw.trim() : stockRaw;
        const parsedStock = stockValue === "" || stockValue === null || stockValue === undefined
          ? null
          : Number(stockValue);
        const stock = parsedStock === null || !Number.isFinite(parsedStock) ? null : Math.max(0, parsedStock);
        const thumbImages = images.slice(1, 4);
        const soldOut = item.available === false || stock === 0;
        const availabilityLabel = soldOut ? "Nicht verfuegbar" : "Verfuegbar";
        const availabilityClass = soldOut ? "text-slate-300" : "text-emerald-600";
        const restaurantAttr = source === "favorites" && item.restaurantId
          ? ` data-menu-open-restaurant="${escapeHtmlFn(item.restaurantId)}"`
          : "";
        return `
          <article data-menu-open="${escapeHtmlFn(item.id)}" data-menu-open-source="${escapeHtmlFn(source)}"${restaurantAttr} role="button" tabindex="0" class="min-w-0 p-3 rounded-[2rem] bg-white border border-slate-100 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col" style="touch-action:pan-y;">
            <div class="rounded-[1.5rem] overflow-hidden bg-slate-100" style="aspect-ratio:4 / 5;">
              <img src="${escapeHtmlFn(safeImg)}" data-fallback-src="${escapeHtmlFn(fallbackImg)}" class="w-full h-full object-cover" style="object-position:${getMenuItemObjectPositionFn(item)};" loading="lazy" decoding="async" />
            </div>
            ${thumbImages.length ? `
              <div class="grid grid-cols-3 gap-2 mt-2">
                ${thumbImages.map((thumb) => `
                  <div class="rounded-xl overflow-hidden bg-slate-100 border border-slate-100" style="aspect-ratio:4 / 5;">
                    <img src="${escapeHtmlFn(getOptimizedImageUrlFn(thumb, "thumb"))}" class="w-full h-full object-cover" loading="lazy" decoding="async" />
                  </div>
                `).join("")}
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
              <div class="mt-auto pt-3">
                <span class="block text-[9px] font-black uppercase tracking-widest ${availabilityClass}">${availabilityLabel}</span>
              </div>
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
          <p class="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">Favoriten nur fuer User</p>
          <p class="text-sm font-medium text-slate-500 mt-3">Bitte registrieren oder einloggen.</p>
          <button data-auth-open class="mt-5 px-5 h-11 rounded-2xl bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest">
            Login / Register
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
          <span class="text-[9px] font-black text-indigo-600 uppercase tracking-widest">Favoriten</span>
          <h2 class="text-2xl font-black italic uppercase tracking-tighter">Du liebst</h2>
        </div>
      </div>
      ${isLoading ? `
        <div class="bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm">
          <div class="text-center py-12 text-[10px] font-bold uppercase tracking-widest text-slate-400">Favoriten werden geladen...</div>
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
          <p class="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">Noch keine Favoriten</p>
          <p class="text-sm font-medium text-slate-500 mt-3">Tippe im Produkt-Drawer auf das Bookmark-Icon.</p>
        </div>
      `}
    </div>
  `;
  }

  function getCurrentShopProfile() {
    return state.profileView?.profile || state.userProfile;
  }

  function getShopCartProfileContext(profile = getCurrentShopProfile()) {
    return getShopCartProfileContextCoreFn(profile, {
      getRestaurantMetaByIdFn
    });
  }

  function getShopCartTotal() {
    return getShopCartTotalCoreFn(state.shopCart.items || [], {
      parsePriceValueFn
    });
  }

  function renderProfileShopCartView(profile = state.profileView?.profile || state.userProfile) {
    const context = getShopCartProfileContext(profile);
    const cartMatches = context.restaurantId && String(state.shopCart.restaurantId || "") === context.restaurantId;
    const items = cartMatches ? (state.shopCart.items || []) : [];
    const total = cartMatches ? getShopCartTotal() : 0;
    const hasOtherCart = !!state.shopCart.restaurantId && !cartMatches && (state.shopCart.items || []).length;
    return `
    <div class="px-5 app-main-content-safe space-y-5">
      <div class="bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm">
        <div class="flex items-center justify-between mb-4">
          <div>
            <span class="text-[9px] font-black text-indigo-600 uppercase tracking-widest">Warenkorb</span>
            <h3 class="text-xl font-black italic tracking-tighter">${escapeHtmlFn(context.businessName || "Shop")}</h3>
          </div>
          <div class="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-600">
            ${iconFn("shopping-cart", "w-5 h-5")}
          </div>
        </div>
        ${hasOtherCart ? `
          <p class="text-[11px] font-bold text-amber-600 uppercase tracking-wider">Dein aktueller Warenkorb gehoert zu einem anderen Shop.</p>
        ` : items.length ? `
          <div class="space-y-3">
            ${items.map((item) => `
              <div class="flex items-center gap-3 p-3 rounded-[1.6rem] bg-slate-50 border border-slate-100">
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
            `).join("")}
            <div class="pt-3 flex items-center justify-between">
              <span class="text-[10px] font-black uppercase tracking-widest text-slate-400">Gesamt</span>
              <span class="text-lg font-black text-slate-900">${escapeHtmlFn(formatPriceFn(total))}</span>
            </div>
            <button data-cart-checkout="open" class="w-full py-4 rounded-[1.8rem] bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-slate-200/60 active:scale-95">
              Checkout starten
            </button>
            ${state.shopCart.status && !state.shopCart.checkoutOpen ? `<p class="text-center text-[10px] font-bold uppercase tracking-widest text-slate-400">${escapeHtmlFn(state.shopCart.status)}</p>` : ""}
          </div>
        ` : `
          <div class="text-center py-14">
            <div class="w-14 h-14 rounded-[1.4rem] bg-slate-100 text-slate-400 mx-auto flex items-center justify-center mb-4">
              ${iconFn("shopping-bag", "w-6 h-6")}
            </div>
            <p class="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">Warenkorb leer</p>
            <p class="text-sm font-medium text-slate-500 mt-3">Tippe auf das Plus bei einem Produkt.</p>
          </div>
        `}
      </div>
      ${cartMatches && items.length && state.shopCart.checkoutOpen ? `
        <div class="bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm space-y-4">
          <div>
            <span class="text-[9px] font-black text-indigo-600 uppercase tracking-widest">Checkout</span>
            <h3 class="text-xl font-black italic tracking-tighter">Lieferdaten</h3>
          </div>
          <div class="grid grid-cols-1 gap-3">
            <input data-cart-field="name" type="text" value="${escapeHtmlFn(state.shopCart.form.name || "")}" placeholder="Name" class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100" />
            <input data-cart-field="phone" type="text" value="${escapeHtmlFn(state.shopCart.form.phone || "")}" placeholder="Tel Nummer" class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100" />
            <input data-cart-field="city" type="text" value="${escapeHtmlFn(state.shopCart.form.city || "")}" placeholder="Qyteti" class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100" />
            <textarea data-cart-field="address" rows="3" placeholder="Adresa" class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100 resize-none">${escapeHtmlFn(state.shopCart.form.address || "")}</textarea>
          </div>
          <button data-cart-checkout="submit" class="w-full py-4 rounded-[1.8rem] bg-indigo-600 text-white text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-indigo-500/20 active:scale-95" ${state.shopCart.loading ? "disabled" : ""}>
            ${state.shopCart.loading ? "Senden..." : "Bestellung absenden"}
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
    state.shopCart = {
      ...createEmptyShopCartFn(),
      form
    };
    saveShopCartToStorageFn();
  }

  function addMenuItemToShopCart(item, profile = getCurrentShopProfile(), options = {}) {
    if (!item || !canAddToShopCartFn(profile)) return;
    const context = getShopCartProfileContext(profile);
    if (!context.restaurantId) return;
    const currentRestaurantId = String(state.shopCart?.restaurantId || "").trim();
    if (currentRestaurantId && currentRestaurantId !== context.restaurantId) {
      const shouldReplace = confirmFn("Dein Warenkorb enthaelt Produkte von einem anderen Shop. Ersetzen?");
      if (!shouldReplace) return;
      clearShopCart({ keepForm: true });
    }
    const nextCart = normalizeShopCartStateFn(state.shopCart);
    const selectedSize = String(options?.size || "").trim();
    const selectedColor = String(options?.color || "").trim();
    const cartKey = buildShopVariantKeyFn(item.id, { size: selectedSize, color: selectedColor });
    const existingIndex = nextCart.items.findIndex((entry) => String(entry.cartKey || entry.itemId) === cartKey);
    const entry = {
      id: String(item.id || "").trim(),
      itemId: String(item.id || "").trim(),
      cartKey,
      name: String(item.name || "Produkt").trim() || "Produkt",
      price: String(item.price ?? "").trim(),
      quantity: 1,
      imageUrl: String(resolveMenuItemHeroFn(item) || "").trim(),
      category: String(item.category || "").trim(),
      selectedSize,
      selectedColor,
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
    nextCart.status = `${entry.name} wurde zum Warenkorb hinzugefuegt.`;
    state.shopCart = nextCart;
    saveShopCartToStorageFn();
    renderFn();
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

  function openShopCheckout() {
    const nextCart = normalizeShopCartStateFn(state.shopCart);
    if (!nextCart.items.length) return;
    nextCart.checkoutOpen = true;
    nextCart.status = "";
    if (!nextCart.form.name) nextCart.form.name = String(state.userProfile?.name || state.user?.displayName || "").trim();
    if (!nextCart.form.phone) nextCart.form.phone = String(state.userProfile?.phone || state.user?.phoneNumber || "").trim();
    if (!nextCart.form.city) nextCart.form.city = String(state.userProfile?.location || "").trim();
    if (!nextCart.form.address) nextCart.form.address = String(state.userProfile?.address || "").trim();
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
    openShopCheckout,
    updateShopCheckoutField,
    getShopCartTotal
  };
}
