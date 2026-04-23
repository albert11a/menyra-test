import { normalizeMenuCardStyleCore } from "./menu-card-style-utils.js";

export function createMenuPublicRuntimeController({
  state = null,
  db = null,
  menuCache = null,
  collectionFn = null,
  queryFn = null,
  orderByFn = null,
  limitFn = null,
  docFn = null,
  getDocFn = async () => null,
  getDocsFn = async () => null,
  setDocFn = async () => {},
  serverTimestampFn = () => null,
  createEmptyFavoriteMenuItemsStateFn = () => ({}),
  favoriteMenuItemDocIdFn = () => "",
  buildFavoriteMenuItemPayloadFn = () => ({}),
  getMenuItemSocialIdFn = (item) => String(item?.id || ""),
  normalizeMenuItemDocFn = (data, docId = "") => ({ id: docId, ...(data || {}) }),
  coerceMenuItemsFromDataFn = () => [],
  foldMenuTextFn = (value = "") => String(value || ""),
  clampCropPercentFn = (value, fallback = 50) => fallback,
  renderFn = () => {},
  getLastRenderModeFn = () => ""
} = {}) {
  const collection = typeof collectionFn === "function" ? collectionFn : null;
  const query = typeof queryFn === "function" ? queryFn : null;
  const orderBy = typeof orderByFn === "function" ? orderByFn : null;
  const limit = typeof limitFn === "function" ? limitFn : null;
  const makeDocRef = typeof docFn === "function" ? docFn : null;
  const getDoc = typeof getDocFn === "function" ? getDocFn : (async () => null);
  const getDocs = typeof getDocsFn === "function" ? getDocsFn : (async () => null);
  const setDoc = typeof setDocFn === "function" ? setDocFn : (async () => {});
  const serverTimestamp = typeof serverTimestampFn === "function" ? serverTimestampFn : (() => null);
  const createEmptyFavoriteMenuItemsState = typeof createEmptyFavoriteMenuItemsStateFn === "function"
    ? createEmptyFavoriteMenuItemsStateFn
    : (() => ({}));
  const favoriteMenuItemDocId = typeof favoriteMenuItemDocIdFn === "function"
    ? favoriteMenuItemDocIdFn
    : (() => "");
  const buildFavoriteMenuItemPayload = typeof buildFavoriteMenuItemPayloadFn === "function"
    ? buildFavoriteMenuItemPayloadFn
    : (() => ({}));
  const getMenuItemSocialId = typeof getMenuItemSocialIdFn === "function"
    ? getMenuItemSocialIdFn
    : ((item) => String(item?.id || ""));
  const normalizeMenuItemDoc = typeof normalizeMenuItemDocFn === "function"
    ? normalizeMenuItemDocFn
    : ((data, docId = "") => ({ id: docId, ...(data || {}) }));
  const coerceMenuItemsFromData = typeof coerceMenuItemsFromDataFn === "function"
    ? coerceMenuItemsFromDataFn
    : (() => []);
  const foldMenuText = typeof foldMenuTextFn === "function"
    ? foldMenuTextFn
    : ((value = "") => String(value || ""));
  const clampCropPercent = typeof clampCropPercentFn === "function"
    ? clampCropPercentFn
    : ((value, fallback = 50) => fallback);
  const menuCacheMap = menuCache || new Map();
  const getLastRenderMode = typeof getLastRenderModeFn === "function"
    ? getLastRenderModeFn
    : (() => "");

  function isFavoritesViewActive() {
    return state?.activeTab === "profile"
      && state?.profileTopTab === "favorites"
      && getLastRenderMode() === "main";
  }

  function looksLikeImageString(value) {
    const str = String(value || "").trim();
    if (!str) return false;
    const lower = str.toLowerCase();
    if (lower.startsWith("http://") || lower.startsWith("https://") || lower.startsWith("data:") || lower.startsWith("blob:") || lower.startsWith("gs://")) return true;
    if (lower.startsWith("media/") || lower.startsWith("social/") || lower.startsWith("menu/")) return true;
    return /\.(avif|webp|png|jpe?g|gif|svg|bmp|tiff?)(\?.*)?$/i.test(str);
  }

  function normalizeImg(value, depth = 0, seen = new WeakSet()) {
    if (!value) return "";
    if (typeof value === "string") {
      const cleaned = value.trim();
      if (!cleaned) return "";
      const lower = cleaned.toLowerCase();
      if (lower === "null" || lower === "undefined" || lower === "data") return "";
      if ((cleaned.startsWith("{") && cleaned.endsWith("}")) || (cleaned.startsWith("[") && cleaned.endsWith("]"))) {
        try {
          const parsed = JSON.parse(cleaned);
          return normalizeImg(parsed, depth + 1, seen);
        } catch {}
      }
      return cleaned;
    }
    if (typeof value === "object") {
      if (seen.has(value)) return "";
      seen.add(value);
      const candidate = value.url
        || value.src
        || value.imageUrl
        || value.imageURL
        || value.image_url
        || value.imagePath
        || value.image_path
        || value.imageSrc
        || value.image_src
        || value.path
        || value.cdnUrl
        || value.cdnURL
        || value.downloadURL
        || value.downloadUrl
        || value.photoUrl
        || value.photoURL
        || value.photo_url
        || value.picture
        || value.pictureUrl
        || value.pictureURL
        || value.photo
        || value.img
        || value.imgUrl
        || value.imgURL
        || value.img_src
        || value.imgSrc
        || value.thumbnail
        || value.thumbnailUrl
        || value.thumbnailURL
        || value.thumb
        || value.original
        || value.file
        || value.fileUrl
        || value.fileURL
        || value.publicUrl
        || value.publicURL
        || value.secure_url
        || value.secureUrl;
      const resolved = normalizeImg(candidate, depth + 1, seen);
      if (resolved) return resolved;
      if (depth < 2) {
        for (const entry of Object.values(value)) {
          if (typeof entry === "string" && looksLikeImageString(entry)) {
            const found = normalizeImg(entry, depth + 1, seen);
            if (found) return found;
          } else if (entry && typeof entry === "object") {
            const found = normalizeImg(entry, depth + 1, seen);
            if (found) return found;
          }
        }
      }
    }
    return "";
  }

  function getMenuItemImages(item) {
    const rawList = [];
    [
      item?.imageUrls,
      item?.images,
      item?.image,
      item?.gallery,
      item?.photos,
      item?.media,
      item?.mediaUrls,
      item?.photoUrls,
      item?.pictureUrls
    ].forEach((list) => {
      if (Array.isArray(list)) {
        rawList.push(...list);
      } else if (typeof list === "string" && list.trim()) {
        rawList.push(list);
      }
    });
    const list = rawList.map((entry) => normalizeImg(entry));
    const primary = normalizeImg(
      item?.imageUrl
        || item?.imageURL
        || item?.image_url
        || item?.image
        || item?.photoUrl
        || item?.photoURL
        || item?.photo_url
        || item?.img
        || item?.imgUrl
        || item?.imgURL
        || item?.thumbnail
        || item?.thumb
        || item?.cover
        || item?.coverUrl
        || item?.coverURL
        || ""
    );
    if (primary) list.unshift(primary);
    const unique = Array.from(new Set(list.filter(Boolean)));
    return unique.length ? unique : [];
  }

  function isDirectImageUrl(value) {
    const str = String(value || "").trim();
    if (!str) return false;
    const lower = str.toLowerCase();
    return lower.startsWith("http://") || lower.startsWith("https://") || lower.startsWith("data:") || lower.startsWith("blob:") || lower.startsWith("gs://");
  }

  function resolveMenuItemHero(item) {
    const images = getMenuItemImages(item);
    return images[0] || "";
  }

  function normalizeOrderIndex(value, fallback = 0) {
    const numeric = Number(value);
    if (!Number.isFinite(numeric)) return Math.max(0, Number(fallback) || 0);
    return Math.max(0, Math.floor(numeric));
  }

  function sortMenuItemsByOrder(list = []) {
    const safe = Array.isArray(list) ? list.slice() : [];
    return safe
      .map((item, idx) => ({
        item,
        idx,
        order: normalizeOrderIndex(item?.orderIndex, idx)
      }))
      .sort((a, b) => (a.order - b.order) || (a.idx - b.idx))
      .map((wrapped, idx) => ({
        ...wrapped.item,
        orderIndex: normalizeOrderIndex(wrapped.item?.orderIndex, idx)
      }));
  }

  function decodeUriComponentSafe(value = "") {
    const raw = String(value || "").trim();
    if (!raw) return "";
    try {
      return decodeURIComponent(raw);
    } catch {
      return raw;
    }
  }

  function toStableToken(value = "") {
    const normalized = foldMenuText(value).trim();
    if (!normalized) return "";
    return normalized
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 48);
  }

  function buildFallbackMenuItemId(item, idx = 0) {
    const parts = [
      toStableToken(item?.name || ""),
      toStableToken(item?.category || ""),
      toStableToken(item?.price ?? ""),
      toStableToken(item?.type || item?.menuSection || "")
    ].filter(Boolean);
    const base = parts.join("__").slice(0, 120);
    if (base) return base;
    return `item_${Math.max(0, Number(idx) || 0)}`;
  }

  function normalizeMenuItemIdentity(item, restaurantId = "", idx = 0) {
    const safeRestaurantId = String(restaurantId || item?.restaurantId || "").trim();
    const explicitId = String(
      item?.id
      || item?.itemId
      || item?.menuItemId
      || item?.productId
      || ""
    ).trim();
    const resolvedId = explicitId || buildFallbackMenuItemId(item, idx);
    const images = getMenuItemImages(item);
    return {
      ...(item || {}),
      id: resolvedId,
      restaurantId: safeRestaurantId || String(item?.restaurantId || "").trim(),
      orderIndex: normalizeOrderIndex(item?.orderIndex, idx),
      imageUrl: String(item?.imageUrl || images[0] || "").trim(),
      imageUrls: images,
      crossSellItemIds: normalizeCrossSellItemIds(
        item?.crossSellItemIds || item?.crossSellIds || item?.crossSell || item?.crossSelling,
        { excludeId: resolvedId }
      )
    };
  }

  function normalizeMenuItemsForRestaurant(items = [], restaurantId = "") {
    const safeRestaurantId = String(restaurantId || "").trim();
    const ordered = sortMenuItemsByOrder(Array.isArray(items) ? items : []);
    const seenIds = new Map();
    return ordered.map((item, idx) => {
      const normalized = normalizeMenuItemIdentity(item, safeRestaurantId, idx);
      const baseId = String(normalized?.id || `item_${idx}`).trim() || `item_${idx}`;
      const hitCount = seenIds.get(baseId) || 0;
      seenIds.set(baseId, hitCount + 1);
      const uniqueId = hitCount > 0 ? `${baseId}__${hitCount + 1}` : baseId;
      return {
        ...normalized,
        id: uniqueId
      };
    });
  }

  function normalizeFavoriteMenuItemDoc(data, docId = "") {
    const payload = data || {};
    const itemId = String(payload?.itemId || "").trim();
    const decodedItemId = decodeUriComponentSafe(itemId);
    const item = normalizeMenuItemDoc(payload, itemId || docId || `favorite_${Date.now()}`);
    return {
      ...item,
      id: decodedItemId || itemId || item.id,
      itemId: itemId || String(item?.itemId || "").trim(),
      menuSocialId: itemId || String(item?.itemId || "").trim(),
      favoriteId: docId || favoriteMenuItemDocId(payload?.restaurantId, itemId),
      restaurantId: String(payload?.restaurantId || "").trim(),
      restaurantName: String(payload?.restaurantName || "").trim(),
      restaurantAvatar: String(payload?.restaurantAvatar || "").trim(),
      catalogMode: String(payload?.catalogMode || "").trim(),
      restaurantType: String(payload?.restaurantType || "").trim(),
      customerType: String(payload?.customerType || "").trim(),
      savedAtClient: String(payload?.savedAtClient || "").trim()
    };
  }

  function updateFavoriteMenuItemsLocal(item, restaurantId, { remove = false } = {}) {
    const safeRestaurantId = String(restaurantId || "").trim();
    const itemId = getMenuItemSocialId(item);
    const favoriteId = favoriteMenuItemDocId(safeRestaurantId, itemId);
    if (!favoriteId || !state) return;
    const currentItems = Array.isArray(state.favoriteMenuItems?.items) ? state.favoriteMenuItems.items : [];
    let nextItems = currentItems.slice();
    if (remove) {
      nextItems = nextItems.filter((entry) => String(entry.favoriteId || "") !== favoriteId);
    } else {
      const nextItem = normalizeFavoriteMenuItemDoc(buildFavoriteMenuItemPayload(item, safeRestaurantId), favoriteId);
      const existingIndex = nextItems.findIndex((entry) => String(entry.favoriteId || "") === favoriteId);
      if (existingIndex >= 0) nextItems[existingIndex] = nextItem;
      else nextItems.unshift(nextItem);
    }
    state.favoriteMenuItems = {
      ...state.favoriteMenuItems,
      items: nextItems
    };
    if (isFavoritesViewActive()) {
      renderFn();
    }
  }

  async function loadFavoriteMenuItems({ force = false } = {}) {
    const uid = String(state?.user?.uid || "").trim();
    if (!uid) {
      if (state) state.favoriteMenuItems = createEmptyFavoriteMenuItemsState();
      return;
    }
    if (state?.favoriteMenuItems?.loading) return;
    if (state?.favoriteMenuItems?.loaded && !force) return;
    state.favoriteMenuItems = {
      ...state.favoriteMenuItems,
      loading: true,
      error: ""
    };
    if (isFavoritesViewActive()) {
      renderFn();
    }
    try {
      if (!collection || !getDocs || !db) throw new Error("favorite menu collection unavailable");
      const ref = collection(db, "users", uid, "menuFavorites");
      let snap = null;
      try {
        if (!query || !orderBy || !limit) throw new Error("favorite query helpers unavailable");
        snap = await getDocs(query(ref, orderBy("savedAtClient", "desc"), limit(120)));
      } catch {
        snap = await getDocs(ref);
      }
      const items = snap.docs
        .map((docSnap) => normalizeFavoriteMenuItemDoc(docSnap.data() || {}, docSnap.id))
        .filter((item) => item.id && item.restaurantId)
        .sort((a, b) => String(b.savedAtClient || "").localeCompare(String(a.savedAtClient || "")));
      state.favoriteMenuItems = {
        items,
        loading: false,
        error: "",
        loaded: true
      };
    } catch (err) {
      console.error(err);
      state.favoriteMenuItems = {
        ...state.favoriteMenuItems,
        loading: false,
        error: "Favoriten konnten nicht geladen werden.",
        loaded: true
      };
    }
    if (isFavoritesViewActive()) {
      renderFn();
    }
  }

  async function loadPublicMenuItems(restaurantId) {
    const safeRestaurantId = String(restaurantId || "").trim();
    if (!safeRestaurantId || !makeDocRef || !getDoc || !db) return [];
    try {
      const snap = await getDoc(makeDocRef(db, "restaurants", safeRestaurantId, "public", "menu"));
      if (!snap.exists()) return [];
      return normalizeMenuItemsForRestaurant(coerceMenuItemsFromData(snap.data() || {}), safeRestaurantId);
    } catch (err) {
      console.error(err);
      return [];
    }
  }

  async function loadLegacyMenuItems(restaurantId) {
    const safeRestaurantId = String(restaurantId || "").trim();
    if (!safeRestaurantId || !makeDocRef || !getDoc || !db) return [];
    try {
      const snap = await getDoc(makeDocRef(db, "restaurants", safeRestaurantId));
      if (!snap.exists()) return [];
      return normalizeMenuItemsForRestaurant(coerceMenuItemsFromData(snap.data() || {}), safeRestaurantId);
    } catch (err) {
      console.error(err);
      return [];
    }
  }

  async function loadMenuItemsFromCollection(restaurantId) {
    const safeRestaurantId = String(restaurantId || "").trim();
    if (!safeRestaurantId || !collection || !getDocs || !db) return [];
    try {
      const snap = await getDocs(collection(db, "restaurants", safeRestaurantId, "menuItems"));
      const list = snap.docs.map((docSnap) => normalizeMenuItemDoc(docSnap.data(), docSnap.id));
      return normalizeMenuItemsForRestaurant(list, safeRestaurantId);
    } catch (err) {
      console.error(err);
      return [];
    }
  }

  function hasMenuItemImages(item) {
    return getMenuItemImages(item).length > 0;
  }

  function hasMenuItemWoltUrl(item) {
    return !!String(item?.woltUrl || item?.woltLink || "").trim();
  }

  function normalizeCrossSellItemIds(value, { excludeId = "" } = {}) {
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
  }

  function hasMenuItemCrossSell(item) {
    const ids = normalizeCrossSellItemIds(
      item?.crossSellItemIds
        || item?.crossSellIds
        || item?.crossSell
        || item?.crossSelling
    );
    return ids.length > 0;
  }

  function isFoodOrDrinkMenuItem(item) {
    const type = String(item?.type || "").trim().toLowerCase();
    if (type === "food" || type === "drink") return true;
    const section = String(item?.menuSection || "").trim().toLowerCase();
    return section === "food" || section === "drink";
  }

  function fillMenuImagesFromFallback(baseItems, fallbackItems) {
    const list = Array.isArray(baseItems) ? baseItems : [];
    const fallback = Array.isArray(fallbackItems) ? fallbackItems : [];
    if (!list.length || !fallback.length) return list;
    const fallbackById = new Map(fallback.map((item) => [String(item.id || ""), item]));
    const fallbackByNameCatPrice = new Map();
    const fallbackByNameCat = new Map();
    const fallbackByName = new Map();
    fallback.forEach((item) => {
      if (!item) return;
      const nameKey = foldMenuText(item.name || "").trim();
      const catKey = foldMenuText(item.category || "").trim();
      const priceKey = String(item.price ?? "").trim();
      if (nameKey) {
        const byName = fallbackByName.get(nameKey) || [];
        byName.push(item);
        fallbackByName.set(nameKey, byName);
      }
      if (nameKey || catKey) {
        const key = `${nameKey}|${catKey}`;
        if (!fallbackByNameCat.has(key)) fallbackByNameCat.set(key, item);
      }
      if (nameKey || catKey || priceKey) {
        const key = `${nameKey}|${catKey}|${priceKey}`;
        if (!fallbackByNameCatPrice.has(key)) fallbackByNameCatPrice.set(key, item);
      }
    });
    return list.map((item) => {
      if (!item) return item;
      const needsImageData = !hasMenuItemImages(item);
      const needsWoltData = isFoodOrDrinkMenuItem(item) && !hasMenuItemWoltUrl(item);
      const needsCrossSellData = isFoodOrDrinkMenuItem(item) && !hasMenuItemCrossSell(item);
      if (!needsImageData && !needsWoltData && !needsCrossSellData) return item;

      const byId = item.id ? fallbackById.get(String(item.id)) : null;
      if (byId) {
        const next = { ...item };
        if (needsImageData && hasMenuItemImages(byId)) {
          next.imageUrl = byId.imageUrl || "";
          next.imageUrls = Array.isArray(byId.imageUrls) ? byId.imageUrls : [];
        }
        if (needsWoltData && hasMenuItemWoltUrl(byId)) {
          next.woltUrl = normalizeExternalUrl(byId.woltUrl || byId.woltLink || "");
        }
        if (needsCrossSellData && hasMenuItemCrossSell(byId)) {
          next.crossSellItemIds = normalizeCrossSellItemIds(
            byId.crossSellItemIds || byId.crossSellIds || byId.crossSell || byId.crossSelling,
            { excludeId: item.id }
          );
        }
        if (
          (!needsImageData || hasMenuItemImages(next))
          && (!needsWoltData || hasMenuItemWoltUrl(next))
          && (!needsCrossSellData || hasMenuItemCrossSell(next))
        ) {
          return next;
        }
      }
      const nameKey = foldMenuText(item.name || "").trim();
      const catKey = foldMenuText(item.category || "").trim();
      const priceKey = String(item.price ?? "").trim();
      let match = null;
      if (nameKey || catKey || priceKey) {
        match = fallbackByNameCatPrice.get(`${nameKey}|${catKey}|${priceKey}`) || null;
      }
      if (!match && (nameKey || catKey)) {
        match = fallbackByNameCat.get(`${nameKey}|${catKey}`) || null;
      }
      if (!match && nameKey) {
        const listByName = fallbackByName.get(nameKey) || [];
        if (listByName.length === 1) match = listByName[0];
      }
      if (match) {
        const next = { ...item };
        if (needsImageData && hasMenuItemImages(match)) {
          next.imageUrl = match.imageUrl || "";
          next.imageUrls = Array.isArray(match.imageUrls) ? match.imageUrls : [];
        }
        if (needsWoltData && hasMenuItemWoltUrl(match)) {
          next.woltUrl = normalizeExternalUrl(match.woltUrl || match.woltLink || "");
        }
        if (needsCrossSellData && hasMenuItemCrossSell(match)) {
          next.crossSellItemIds = normalizeCrossSellItemIds(
            match.crossSellItemIds || match.crossSellIds || match.crossSell || match.crossSelling,
            { excludeId: item.id }
          );
        }
        return next;
      }
      return item;
    });
  }

  function normalizeMenuStock(value) {
    if (value === null || value === undefined) return null;
    const raw = typeof value === "string" ? value.trim() : value;
    if (raw === "") return null;
    const parsed = Number(raw);
    return Number.isFinite(parsed) ? Math.max(0, parsed) : null;
  }

  function normalizeExternalUrl(value = "") {
    const raw = String(value || "").trim();
    if (!raw) return "";
    if (/^(https?:\/\/|mailto:|tel:)/i.test(raw)) return raw;
    return `https://${raw.replace(/^\/+/, "")}`;
  }

  function resolveMenuStatusBadgeVisible(value, fallback = true) {
    if (typeof value === "boolean") return value;
    return !!fallback;
  }

  async function loadMenuMeta(restaurantId) {
    const safeRestaurantId = String(restaurantId || "").trim();
    if (!safeRestaurantId || !makeDocRef || !getDoc || !db) {
      return { statusBadgeVisible: true };
    }
    try {
      const snap = await getDoc(makeDocRef(db, "restaurants", safeRestaurantId, "public", "meta"));
      if (!snap.exists()) return { statusBadgeVisible: true };
      const data = snap.data() || {};
      return {
        statusBadgeVisible: resolveMenuStatusBadgeVisible(
          data.menuStatusBadgeVisible,
          data.menuAvailabilityBadgeVisible
        )
      };
    } catch (err) {
      console.error(err);
      return { statusBadgeVisible: true };
    }
  }

  async function saveMenuStatusBadgeVisible(restaurantId, visible) {
    const safeRestaurantId = String(restaurantId || "").trim();
    if (!safeRestaurantId || !makeDocRef || !setDoc || !db) return;
    try {
      await setDoc(makeDocRef(db, "restaurants", safeRestaurantId, "public", "meta"), {
        menuStatusBadgeVisible: !!visible,
        updatedAt: serverTimestamp()
      }, { merge: true });
    } catch (err) {
      console.error(err);
    }
  }

  async function publishMenuToPublic(restaurantId, items) {
    const safeRestaurantId = String(restaurantId || "").trim();
    if (!safeRestaurantId || !makeDocRef || !setDoc || !db) return;
    const orderedItems = normalizeMenuItemsForRestaurant(items || [], safeRestaurantId);
    const payload = {
      items: orderedItems.map((item, index) => ({
        id: item.id || "",
        type: item.type || null,
        menuSection: String(item.menuSection || (String(item.type || "").trim().toLowerCase() === "drink" ? "drink" : "food")).trim().toLowerCase() === "drink"
          ? "drink"
          : "food",
        orderIndex: normalizeOrderIndex(item.orderIndex, index),
        category: item.category || "Sonstiges",
        name: item.name || "Produkt",
        description: item.description || "",
        ingredients: item.ingredients || "",
        longDescription: item.longDescription || "",
        allergens: item.allergens || "",
        brand: item.brand || "",
        sku: item.sku || "",
        stock: normalizeMenuStock(item.stock),
        sizes: Array.isArray(item.sizes) ? item.sizes : [],
        colors: Array.isArray(item.colors) ? item.colors : [],
        cropX: clampCropPercent(item.cropX ?? 50, 50),
        cropY: clampCropPercent(item.cropY ?? 50, 50),
        price: item.price ?? "",
        available: item.available !== false,
        hidden: item.menuHidden === true,
        menuHidden: item.menuHidden === true,
        statusHidden: false,
        statusVisibility: "auto",
        cardStyle: normalizeMenuCardStyleCore(item.cardStyle || "", item.type || "food"),
        specialSize: String(item.specialSize || "").trim().toLowerCase() === "food" ? "food" : "default",
        crossSellItemIds: normalizeCrossSellItemIds(
          item.crossSellItemIds || item.crossSellIds || item.crossSell || item.crossSelling,
          { excludeId: item.id }
        ),
        specialActionType: String(item.specialActionType || "").trim().toLowerCase() === "link"
          ? "link"
          : (String(item.specialActionType || "").trim().toLowerCase() === "product" ? "product" : "self"),
        specialActionUrl: String(item.specialActionType || "").trim().toLowerCase() === "link"
          ? String(item.specialActionUrl || "").trim()
          : "",
        specialActionProductId: String(item.specialActionType || "").trim().toLowerCase() === "product"
          ? String(item.specialActionProductId || "").trim()
          : "",
        woltUrl: normalizeExternalUrl(item.woltUrl || item.woltLink || ""),
        imageUrl: item.imageUrl || null,
        imageUrls: Array.isArray(item.imageUrls) ? item.imageUrls : []
      })),
      publishedAt: serverTimestamp()
    };
    await setDoc(makeDocRef(db, "restaurants", safeRestaurantId, "public", "menu"), payload, { merge: true });
  }

  async function loadMenuHybrid(restaurantId) {
    const safeRestaurantId = String(restaurantId || "").trim();
    if (!safeRestaurantId) return [];
    const publicItems = await loadPublicMenuItems(safeRestaurantId);
    if (publicItems.length) return publicItems;
    const [collectionItems, legacyItems] = await Promise.all([
      loadMenuItemsFromCollection(safeRestaurantId),
      loadLegacyMenuItems(safeRestaurantId)
    ]);
    if (collectionItems.length) {
      return collectionItems;
    }
    if (legacyItems.length) {
      return legacyItems;
    }
    return [];
  }

  function menuCacheKey(restaurantId, source) {
    return `${restaurantId || ""}::${source || "public"}`;
  }

  function syncMenuCaches(restaurantId, items, { statusBadgeVisible = state?.menu?.statusBadgeVisible } = {}) {
    const safeRestaurantId = String(restaurantId || "").trim();
    if (!safeRestaurantId) return;
    const list = normalizeMenuItemsForRestaurant(items, safeRestaurantId);
    const nextStatusBadgeVisible = resolveMenuStatusBadgeVisible(statusBadgeVisible);
    menuCacheMap.set(menuCacheKey(safeRestaurantId, "collection"), {
      items: list,
      statusBadgeVisible: nextStatusBadgeVisible,
      ts: Date.now()
    });
    menuCacheMap.set(menuCacheKey(safeRestaurantId, "public"), {
      items: list,
      statusBadgeVisible: nextStatusBadgeVisible,
      ts: Date.now()
    });
    menuCacheMap.set(menuCacheKey(safeRestaurantId, "migration"), {
      items: list,
      statusBadgeVisible: nextStatusBadgeVisible,
      ts: Date.now()
    });
    if (state?.menu?.restaurantId === safeRestaurantId) {
      state.menu = {
        ...state.menu,
        items: list,
        statusBadgeVisible: nextStatusBadgeVisible,
        loading: false,
        error: ""
      };
    }
  }

  return {
    updateFavoriteMenuItemsLocal,
    loadFavoriteMenuItems,
    getMenuItemImages,
    isDirectImageUrl,
    resolveMenuItemHero,
    loadPublicMenuItems,
    loadLegacyMenuItems,
    loadMenuItemsFromCollection,
    loadMenuMeta,
    saveMenuStatusBadgeVisible,
    hasMenuItemImages,
    fillMenuImagesFromFallback,
    publishMenuToPublic,
    loadMenuHybrid,
    menuCacheKey,
    syncMenuCaches
  };
}
