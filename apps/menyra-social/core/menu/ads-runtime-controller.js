export function createAdsRuntimeController({
  state = null,
  db = null,
  documentObj = null,
  adsCache = null,
  docFn = null,
  getDocFn = async () => null,
  setDocFn = async () => {},
  serverTimestampFn = () => null,
  uploadCompressedImageFn = async () => ({}),
  getAdItemCropFn = () => ({ x: 50, y: 50 }),
  getAdsModalCropFn = () => ({ x: 50, y: 50 }),
  clampCropPercentFn = (value, fallback = 50) => fallback,
  renderFn = () => {},
  renderOverlaysFn = () => {},
  closeFocusModalFn = () => {},
  confirmFn = () => false,
  alertFn = () => {}
} = {}) {
  const docObj = documentObj || (typeof document === "undefined" ? null : document);
  const adsCacheMap = adsCache || new Map();
  const makeDocRef = typeof docFn === "function" ? docFn : null;
  const getDoc = typeof getDocFn === "function" ? getDocFn : (async () => null);
  const setDoc = typeof setDocFn === "function" ? setDocFn : (async () => {});
  const serverTimestamp = typeof serverTimestampFn === "function" ? serverTimestampFn : (() => null);
  const uploadCompressedImage = typeof uploadCompressedImageFn === "function"
    ? uploadCompressedImageFn
    : (async () => ({}));
  const getAdItemCrop = typeof getAdItemCropFn === "function"
    ? getAdItemCropFn
    : (() => ({ x: 50, y: 50 }));
  const getAdsModalCrop = typeof getAdsModalCropFn === "function"
    ? getAdsModalCropFn
    : (() => ({ x: 50, y: 50 }));
  const clampCropPercent = typeof clampCropPercentFn === "function"
    ? clampCropPercentFn
    : ((value, fallback = 50) => fallback);
  const adsLoadPromises = new Map();

  function createAdId() {
    return globalThis.crypto?.randomUUID?.() || `ad_${String(Math.random()).slice(2)}`;
  }

  function cleanAdText(value = "") {
    return String(value || "").trim();
  }

  function createClientAdTimestamp() {
    return new Date();
  }

  function isServerTimestampSentinel(value) {
    if (!value || typeof value !== "object") return false;
    const methodName = String(value?._methodName || value?._delegate?._methodName || "").toLowerCase();
    const constructorName = String(value?.constructor?.name || "").toLowerCase();
    return methodName.includes("servertimestamp") || constructorName.includes("servertimestamp");
  }

  function normalizeWritableAdTimestamp(value, fallback = null) {
    if (!value || isServerTimestampSentinel(value)) return fallback;
    return value;
  }

  function adsCacheKey(restaurantId) {
    return `${restaurantId || ""}`;
  }

  function collectProfileRestaurantIds(...records) {
    const ids = [];
    records.forEach((record = {}) => {
      [
        record?.restaurantId,
        record?.canonicalRestaurantId,
        record?.staffRestaurantId,
        record?.waiterRestaurantId,
        record?.roleSwitchRestaurantId,
        state?.roleSwitchRestaurantId
      ].forEach((value) => {
        const id = cleanAdText(value);
        if (id && !ids.includes(id)) ids.push(id);
      });
    });
    return ids;
  }

  function getCurrentRestaurantId(profile = state?.userProfile || {}) {
    return collectProfileRestaurantIds(profile, state?.userProfile)[0] || "";
  }

  function normalizeAdStatus(value = "", fallback = "pending") {
    const key = cleanAdText(value).toLowerCase();
    if (key === "approved" || key === "accepted" || key === "active") return "approved";
    if (key === "rejected" || key === "declined" || key === "denied") return "rejected";
    if (key === "pending" || key === "review" || key === "in_review") return "pending";
    return fallback;
  }

  function normalizeAdItem(data, fallbackId) {
    const item = data || {};
    const id = cleanAdText(item.id || item._id || fallbackId || createAdId());
    const crop = getAdItemCrop(item);
    return {
      id,
      title: cleanAdText(item.title || item.name || "Ad"),
      text: cleanAdText(item.text || item.desc || item.description || ""),
      imageUrl: cleanAdText(item.imageUrl || item.image || item.photoUrl || ""),
      cropX: crop.x,
      cropY: crop.y,
      active: item.active !== false,
      status: normalizeAdStatus(item.status || item.approvalStatus || "", "pending"),
      category: cleanAdText(item.category || item.adCategory || item.typeLabel || "RESTAURANT"),
      priceSegment: cleanAdText(item.priceSegment || item.priceRange || item.priceLabel || "€€ - €€€"),
      bestChoiceBadgeEnabled: item.bestChoiceBadgeEnabled !== false,
      deliveryBadgeEnabled: item.deliveryBadgeEnabled !== false,
      woltEnabled: item.woltEnabled !== false,
      createdAt: item.createdAt || null,
      updatedAt: item.updatedAt || null,
      submittedAt: item.submittedAt || null,
      reviewedAt: item.reviewedAt || null,
      reviewedByUid: cleanAdText(item.reviewedByUid || ""),
      reviewedByName: cleanAdText(item.reviewedByName || "")
    };
  }

  async function loadAdItems(restaurantId) {
    const safeRestaurantId = cleanAdText(restaurantId);
    if (!safeRestaurantId || !makeDocRef || !getDoc || !db) return [];
    try {
      const snap = await getDoc(makeDocRef(db, "restaurants", safeRestaurantId, "public", "ads"));
      if (!snap.exists()) return [];
      const data = snap.data() || {};
      const items = Array.isArray(data.items) ? data.items : [];
      return items.map((item, idx) => normalizeAdItem(item, item?.id || `ad_${idx}`));
    } catch (err) {
      console.error(err);
      return [];
    }
  }

  async function loadAdsMeta(restaurantId) {
    const safeRestaurantId = cleanAdText(restaurantId);
    if (!safeRestaurantId || !makeDocRef || !getDoc || !db) return true;
    try {
      const snap = await getDoc(makeDocRef(db, "restaurants", safeRestaurantId, "public", "meta"));
      if (!snap.exists()) return true;
      const data = snap.data() || {};
      if (typeof data.adsEnabled === "boolean") return data.adsEnabled;
    } catch (err) {
      console.error(err);
    }
    return true;
  }

  async function saveAdsEnabled(restaurantId, enabled) {
    const safeRestaurantId = cleanAdText(restaurantId);
    if (!safeRestaurantId || !makeDocRef || !setDoc || !db) return;
    try {
      await setDoc(makeDocRef(db, "restaurants", safeRestaurantId, "public", "meta"), {
        adsEnabled: !!enabled,
        updatedAt: serverTimestamp()
      }, { merge: true });
    } catch (err) {
      console.error(err);
    }
  }

  async function publishAdItems(restaurantId, items) {
    const safeRestaurantId = cleanAdText(restaurantId);
    if (!safeRestaurantId || !makeDocRef || !setDoc || !db) return;
    const now = createClientAdTimestamp();
    const normalizedItems = (Array.isArray(items) ? items : []).map((item) => ({
      id: cleanAdText(item.id || createAdId()),
      title: cleanAdText(item.title || ""),
      text: cleanAdText(item.text || ""),
      imageUrl: cleanAdText(item.imageUrl || ""),
      cropX: clampCropPercent(item.cropX ?? 50, 50),
      cropY: clampCropPercent(item.cropY ?? 50, 50),
      active: item.active !== false,
      status: normalizeAdStatus(item.status || "", "pending"),
      category: cleanAdText(item.category || "RESTAURANT"),
      priceSegment: cleanAdText(item.priceSegment || "€€ - €€€"),
      bestChoiceBadgeEnabled: item.bestChoiceBadgeEnabled !== false,
      deliveryBadgeEnabled: item.deliveryBadgeEnabled !== false,
      woltEnabled: item.woltEnabled !== false,
      createdAt: normalizeWritableAdTimestamp(item.createdAt, null),
      updatedAt: normalizeWritableAdTimestamp(item.updatedAt, now),
      submittedAt: normalizeWritableAdTimestamp(item.submittedAt, null),
      reviewedAt: normalizeWritableAdTimestamp(item.reviewedAt, null),
      reviewedByUid: cleanAdText(item.reviewedByUid || ""),
      reviewedByName: cleanAdText(item.reviewedByName || "")
    }));
    await setDoc(makeDocRef(db, "restaurants", safeRestaurantId, "public", "ads"), {
      items: normalizedItems,
      truthSource: "public-ads",
      truthState: normalizedItems.length ? "seeded" : "knownEmpty",
      updatedAt: serverTimestamp()
    }, { merge: true });
  }

  function getAdsStateForRestaurant(restaurantId, { includeInactive = false } = {}) {
    const safeRestaurantId = cleanAdText(restaurantId);
    const same = !!safeRestaurantId && state?.ads?.restaurantId === safeRestaurantId;
    const rawItems = same ? (Array.isArray(state?.ads?.items) ? state.ads.items : []) : [];
    const normalized = rawItems.map((item, idx) => normalizeAdItem(item, item?.id || `ad_${idx}`));
    const items = includeInactive ? normalized : normalized.filter((item) => item && item.active !== false);
    const enabled = same ? state?.ads?.enabled !== false : true;
    const loading = !!safeRestaurantId && (!!state?.ads?.loading || !same);
    return { items, enabled, loading, same };
  }

  function syncAdsToRestaurantState(restaurantId, items = []) {
    const safeRestaurantId = cleanAdText(restaurantId);
    if (!safeRestaurantId || !Array.isArray(state?.restaurants)) return;
    const safeItems = Array.isArray(items) ? items : [];
    state.restaurants = state.restaurants.map((row) => {
      const rowId = cleanAdText(row?.id || row?.restaurantId || row?.canonicalRestaurantId || "");
      if (rowId !== safeRestaurantId) return row;
      const approvedAds = safeItems.filter((item) => (
        item && item.active !== false && normalizeAdStatus(item.status || "") === "approved"
      ));
      return {
        ...row,
        publicAds: safeItems,
        restaurantAds: safeItems,
        publicAdsCount: safeItems.length,
        approvedAdsCount: approvedAds.length,
        hasApprovedAds: approvedAds.length > 0,
        adsTruthState: safeItems.length ? "seeded" : "knownEmpty"
      };
    });
  }

  async function loadAdsForRestaurant(restaurantId, { force = false } = {}) {
    const safeRestaurantId = cleanAdText(restaurantId);
    if (!safeRestaurantId) {
      state.ads = { ...state.ads, restaurantId: "", items: [], loading: false, error: "", truthState: "unknown" };
      return { items: [], enabled: true, truthSource: "public-ads", truthState: "unknown" };
    }
    const cacheKey = adsCacheKey(safeRestaurantId);
    const cached = adsCacheMap.get(cacheKey);
    const cachedTruthState = cleanAdText(cached?.truthState).toLowerCase();
    if (
      cached
      && (Array.isArray(cached.items) || cachedTruthState === "knownempty" || cachedTruthState === "known-empty")
      && !force
    ) {
      const cachedItems = Array.isArray(cached.items) ? cached.items : [];
      const payload = {
        items: cachedItems,
        enabled: cached.enabled !== false,
        truthSource: "public-ads",
        truthState: cachedItems.length ? "seeded" : "knownEmpty"
      };
      state.ads = { ...state.ads, restaurantId: safeRestaurantId, ...payload, loading: false, error: "" };
      syncAdsToRestaurantState(safeRestaurantId, cachedItems);
      return payload;
    }
    if (adsLoadPromises.has(cacheKey)) return adsLoadPromises.get(cacheKey);
    const stableItems = state?.ads?.restaurantId === safeRestaurantId && Array.isArray(state.ads.items)
      ? state.ads.items.slice()
      : [];
    state.ads = {
      ...state.ads,
      restaurantId: safeRestaurantId,
      items: stableItems,
      loading: true,
      error: "",
      truthSource: "public-ads",
      truthState: stableItems.length ? "seeded" : "unknown"
    };
    renderFn();
    const request = Promise.all([
      loadAdItems(safeRestaurantId),
      loadAdsMeta(safeRestaurantId)
    ]).then(([items, enabled]) => {
      const safeItems = Array.isArray(items) ? items : [];
      const truthState = safeItems.length ? "seeded" : "knownEmpty";
      const payload = { items: safeItems, enabled, truthSource: "public-ads", truthState };
      adsCacheMap.set(cacheKey, { ...payload, ts: Date.now() });
      state.ads = {
        ...state.ads,
        restaurantId: safeRestaurantId,
        items: safeItems,
        enabled,
        loading: false,
        error: "",
        truthSource: "public-ads",
        truthState
      };
      syncAdsToRestaurantState(safeRestaurantId, safeItems);
      renderFn();
      return payload;
    }).catch((err) => {
      console.error(err);
      state.ads = {
        ...state.ads,
        restaurantId: safeRestaurantId,
        items: stableItems,
        loading: false,
        error: err?.message || "Ads konnten nicht geladen werden.",
        truthSource: "public-ads",
        truthState: stableItems.length ? "seeded" : "unknown"
      };
      renderFn();
      return { items: stableItems, enabled: true, truthSource: "public-ads", truthState: "unknown" };
    }).finally(() => {
      adsLoadPromises.delete(cacheKey);
    });
    adsLoadPromises.set(cacheKey, request);
    return request;
  }

  function ensureAdsDataForProfile(profile = state?.userProfile || {}) {
    const restaurantId = getCurrentRestaurantId(profile);
    if (!restaurantId) return;
    const same = state?.ads?.restaurantId === restaurantId;
    const truthState = cleanAdText(state?.ads?.truthState).toLowerCase();
    if (same && state?.ads?.loading) return;
    if (same && (truthState === "seeded" || truthState === "knownempty" || truthState === "known-empty")) return;
    void loadAdsForRestaurant(restaurantId);
  }

  function readAdModalValue(id = "") {
    return docObj?.getElementById(id)?.value?.trim() || "";
  }

  function readAdModalChecked(id = "") {
    return docObj?.getElementById(id)?.checked === true;
  }

  async function saveAdItemFromModal() {
    if (!state?.user || !docObj) return;
    const restaurantId = getCurrentRestaurantId(state.userProfile);
    if (!restaurantId) {
      state.focusModal.status = "Kein Business ausgewaehlt.";
      renderOverlaysFn({ updateFocus: true });
      return;
    }
    const title = readAdModalValue("focusTitle");
    const text = readAdModalValue("focusText");
    const imageUrlInput = readAdModalValue("focusImageUrl");
    const active = docObj.getElementById("focusActive")?.checked !== false;
    const category = readAdModalValue("adCategory") || "RESTAURANT";
    const priceSegment = readAdModalValue("adPriceSegment") || "€€ - €€€";
    const bestChoiceBadgeEnabled = readAdModalChecked("adBestChoiceEnabled");
    const deliveryBadgeEnabled = readAdModalChecked("adDeliveryEnabled");
    const woltEnabled = readAdModalChecked("adWoltEnabled");
    const crop = getAdsModalCrop();

    if (!title) {
      state.focusModal.status = "Bitte Ad-Titel eingeben.";
      renderOverlaysFn({ updateFocus: true });
      return;
    }

    state.focusModal.loading = true;
    state.focusModal.status = "Wird zur Freigabe gespeichert...";
    renderOverlaysFn({ updateFocus: true });

    try {
      let imageUrl = imageUrlInput || state.focusModal.item?.imageUrl || "";
      if (state.focusModal.imageFile) {
        const { cdnUrl } = await uploadCompressedImage(
          state.focusModal.imageFile,
          restaurantId,
          { maxSize: 1080, quality: 0.8, mimeType: "image/jpeg" }
        );
        imageUrl = cdnUrl || imageUrl;
      }
      const previous = state.focusModal.item || {};
      const id = previous.id || createAdId();
      const now = createClientAdTimestamp();
      const payload = {
        ...previous,
        id,
        title,
        text,
        imageUrl,
        cropX: crop.x,
        cropY: crop.y,
        active,
        category,
        priceSegment,
        bestChoiceBadgeEnabled,
        deliveryBadgeEnabled,
        woltEnabled,
        status: "pending",
        createdAt: normalizeWritableAdTimestamp(previous.createdAt, now),
        updatedAt: now,
        submittedAt: now,
        reviewedAt: null,
        reviewedByUid: "",
        reviewedByName: ""
      };
      const nextItems = Array.isArray(state.ads.items) ? state.ads.items.slice() : [];
      const idx = nextItems.findIndex((item) => String(item.id) === String(id));
      if (idx >= 0) nextItems[idx] = { ...nextItems[idx], ...payload };
      else nextItems.unshift(payload);
      await publishAdItems(restaurantId, nextItems);
      const truthState = nextItems.length ? "seeded" : "knownEmpty";
      adsCacheMap.set(adsCacheKey(restaurantId), {
        items: nextItems,
        enabled: state.ads.enabled,
        truthSource: "public-ads",
        truthState,
        ts: Date.now()
      });
      state.ads = { ...state.ads, restaurantId, items: nextItems, loading: false, error: "", truthSource: "public-ads", truthState };
      syncAdsToRestaurantState(restaurantId, nextItems);
      state.focusModal.loading = false;
      state.focusModal.status = "Ad wartet auf Heart-Freigabe.";
      closeFocusModalFn();
      renderFn();
    } catch (err) {
      console.error(err);
      state.focusModal.status = err?.message || "Ad konnte nicht gespeichert werden.";
      state.focusModal.loading = false;
      renderOverlaysFn({ updateFocus: true });
    }
  }

  async function deleteAdItemById(itemId) {
    const safeItemId = cleanAdText(itemId);
    if (!state?.user || !safeItemId) return;
    const restaurantId = getCurrentRestaurantId(state.userProfile);
    if (!restaurantId) return;
    if (!confirmFn("Ad wirklich loeschen?")) return;
    try {
      const nextItems = (Array.isArray(state.ads.items) ? state.ads.items : [])
        .filter((item) => String(item.id) !== String(safeItemId));
      await publishAdItems(restaurantId, nextItems);
      const truthState = nextItems.length ? "seeded" : "knownEmpty";
      adsCacheMap.set(adsCacheKey(restaurantId), {
        items: nextItems,
        enabled: state.ads.enabled,
        truthSource: "public-ads",
        truthState,
        ts: Date.now()
      });
      state.ads = { ...state.ads, restaurantId, items: nextItems, truthSource: "public-ads", truthState };
      syncAdsToRestaurantState(restaurantId, nextItems);
      renderFn();
    } catch (err) {
      console.error(err);
      alertFn("Ad konnte nicht geloescht werden.");
    }
  }

  return {
    adsCacheKey,
    getAdsStateForRestaurant,
    loadAdItems,
    loadAdsMeta,
    loadAdsForRestaurant,
    saveAdsEnabled,
    publishAdItems,
    ensureAdsDataForProfile,
    saveAdItemFromModal,
    deleteAdItemById
  };
}
