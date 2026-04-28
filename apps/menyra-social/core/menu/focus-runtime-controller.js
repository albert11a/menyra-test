export function createFocusRuntimeController({
  state = null,
  db = null,
  documentObj = null,
  windowObj = null,
  focusCache = null,
  docFn = null,
  getDocFn = async () => null,
  setDocFn = async () => {},
  serverTimestampFn = () => null,
  uploadCompressedImageFn = async () => ({}),
  getFocusItemCropFn = () => ({ x: 50, y: 50 }),
  getFocusModalCropFn = () => ({ x: 50, y: 50 }),
  clampCropPercentFn = (value, fallback = 50) => fallback,
  getOptimizedImageUrlFn = (value) => String(value || ""),
  isPlaceholderUrlFn = () => false,
  placeholderImage = "",
  isRestaurantCafeProfileFn = () => false,
  renderFn = () => {},
  renderOverlaysFn = () => {},
  closeFocusModalFn = () => {},
  confirmFn = () => false,
  alertFn = () => {}
} = {}) {
  const docObj = documentObj || (typeof document === "undefined" ? null : document);
  const win = windowObj || (typeof window === "undefined" ? null : window);
  const focusCacheMap = focusCache || new Map();
  const makeDocRef = typeof docFn === "function" ? docFn : null;
  const getDoc = typeof getDocFn === "function" ? getDocFn : (async () => null);
  const setDoc = typeof setDocFn === "function" ? setDocFn : (async () => {});
  const serverTimestamp = typeof serverTimestampFn === "function" ? serverTimestampFn : (() => null);
  const uploadCompressedImage = typeof uploadCompressedImageFn === "function"
    ? uploadCompressedImageFn
    : (async () => ({}));
  const getFocusItemCrop = typeof getFocusItemCropFn === "function"
    ? getFocusItemCropFn
    : (() => ({ x: 50, y: 50 }));
  const getFocusModalCrop = typeof getFocusModalCropFn === "function"
    ? getFocusModalCropFn
    : (() => ({ x: 50, y: 50 }));
  const clampCropPercent = typeof clampCropPercentFn === "function"
    ? clampCropPercentFn
    : ((value, fallback = 50) => fallback);
  const getOptimizedImageUrl = typeof getOptimizedImageUrlFn === "function"
    ? getOptimizedImageUrlFn
    : ((value) => String(value || ""));
  const isPlaceholderUrl = typeof isPlaceholderUrlFn === "function"
    ? isPlaceholderUrlFn
    : (() => false);
  const isRestaurantCafeProfile = typeof isRestaurantCafeProfileFn === "function"
    ? isRestaurantCafeProfileFn
    : (() => false);
  let focusRotateTimer = null;
  let focusRotateKey = "";

  function createFocusId() {
    return globalThis.crypto?.randomUUID?.() || String(Math.random()).slice(2);
  }

  function normalizeFocusItem(data, fallbackId) {
    const item = data || {};
    const id = item.id || item._id || fallbackId || createFocusId();
    const crop = getFocusItemCrop(item);
    return {
      id,
      title: item.title || item.name || "Sot ne Fokus",
      text: item.text || item.desc || item.description || "",
      imageUrl: item.imageUrl || item.image || item.photoUrl || "",
      cropX: crop.x,
      cropY: crop.y,
      active: item.active !== false
    };
  }

  async function loadFocusItems(restaurantId) {
    const safeRestaurantId = String(restaurantId || "").trim();
    if (!safeRestaurantId || !makeDocRef || !getDoc || !db) return [];
    try {
      const snap = await getDoc(makeDocRef(db, "restaurants", safeRestaurantId, "public", "offers"));
      if (!snap.exists()) return [];
      const data = snap.data() || {};
      const items = Array.isArray(data.items) ? data.items : [];
      return items.map((item, idx) => normalizeFocusItem(item, item?.id || `focus_${idx}`));
    } catch (err) {
      console.error(err);
      return [];
    }
  }

  async function loadFocusMeta(restaurantId) {
    const safeRestaurantId = String(restaurantId || "").trim();
    if (!safeRestaurantId || !makeDocRef || !getDoc || !db) return true;
    try {
      const snap = await getDoc(makeDocRef(db, "restaurants", safeRestaurantId, "public", "meta"));
      if (!snap.exists()) return true;
      const data = snap.data() || {};
      if (typeof data.offersEnabled === "boolean") return data.offersEnabled;
    } catch (err) {
      console.error(err);
    }
    return true;
  }

  async function saveFocusEnabled(restaurantId, enabled) {
    const safeRestaurantId = String(restaurantId || "").trim();
    if (!safeRestaurantId || !makeDocRef || !setDoc || !db) return;
    try {
      await setDoc(makeDocRef(db, "restaurants", safeRestaurantId, "public", "meta"), {
        offersEnabled: !!enabled,
        updatedAt: serverTimestamp()
      }, { merge: true });
    } catch (err) {
      console.error(err);
    }
  }

  async function publishFocusItems(restaurantId, items) {
    const safeRestaurantId = String(restaurantId || "").trim();
    if (!safeRestaurantId || !makeDocRef || !setDoc || !db) return;
    const normalizedItems = (items || []).map((item) => ({
      id: item.id || "",
      title: item.title || "",
      text: item.text || "",
      imageUrl: item.imageUrl || "",
      cropX: clampCropPercent(item.cropX ?? 50, 50),
      cropY: clampCropPercent(item.cropY ?? 50, 50),
      active: item.active !== false
    }));
    const payload = {
      items: normalizedItems,
      truthSource: "public-menu",
      truthState: normalizedItems.length ? "seeded" : "knownEmpty",
      updatedAt: serverTimestamp()
    };
    await setDoc(makeDocRef(db, "restaurants", safeRestaurantId, "public", "offers"), payload, { merge: true });
  }

  function focusCacheKey(restaurantId) {
    return `${restaurantId || ""}`;
  }

  function getActiveFocusItems(items = state?.focus?.items) {
    const list = Array.isArray(items) ? items : [];
    return list
      .map((item, idx) => normalizeFocusItem(item, item?.id || `focus_${idx}`))
      .filter((item) => item && item.active !== false);
  }

  function getFocusStateForRestaurant(restaurantId, { includeInactive = false } = {}) {
    const safeRestaurantId = String(restaurantId || "").trim();
    const same = !!safeRestaurantId && state?.focus?.restaurantId === safeRestaurantId;
    const rawItems = same ? (Array.isArray(state?.focus?.items) ? state.focus.items : []) : [];
    const normalized = rawItems.map((item, idx) => normalizeFocusItem(item, item?.id || `focus_${idx}`));
    const items = includeInactive ? normalized : normalized.filter((item) => item && item.active !== false);
    const enabled = same ? state?.focus?.enabled !== false : true;
    const loading = !!safeRestaurantId && (!!state?.focus?.loading || !same);
    return { items, enabled, loading, same };
  }

  function getFocusIndex(items) {
    const max = (items?.length || 0) - 1;
    if (max < 0) return 0;
    const raw = Number(state?.focus?.index || 0);
    if (!Number.isFinite(raw) || raw < 0 || raw > max) return 0;
    return raw;
  }

  function updateFocusCarouselDom() {
    if (!docObj) return false;
    const root = docObj.getElementById("focusCarousel");
    if (!root) return false;
    const profile = state?.profileView?.profile || state?.userProfile;
    const restaurantId = profile?.restaurantId || "";
    if (!restaurantId || !isRestaurantCafeProfile(profile)) return false;
    const { items, enabled } = getFocusStateForRestaurant(restaurantId);
    if (!enabled || !items.length) return false;
    const idx = getFocusIndex(items);
    const item = items[idx] || items[0];
    const imgUrl = getOptimizedImageUrl(item.imageUrl || "", "large");
    const safeImg = isPlaceholderUrl(imgUrl) ? placeholderImage : imgUrl;

    const imgEl = root.querySelector("[data-focus-image]");
    if (typeof HTMLImageElement !== "undefined" && imgEl instanceof HTMLImageElement) {
      if (imgEl.getAttribute("src") !== safeImg) imgEl.setAttribute("src", safeImg);
    }
    const titleEl = root.querySelector("[data-focus-title]");
    if (titleEl) titleEl.textContent = item.title || "Sot ne Fokus";
    const textEl = root.querySelector("[data-focus-text]");
    if (textEl) {
      if (item.text) {
        textEl.textContent = item.text;
        textEl.classList.remove("hidden");
      } else {
        textEl.textContent = "";
        textEl.classList.add("hidden");
      }
    }
    root.querySelectorAll("[data-focus-dot]").forEach((btn) => {
      const dotIdx = Number(btn.dataset.focusDot || "0");
      btn.classList.toggle("bg-slate-900", dotIdx === idx);
      btn.classList.toggle("bg-slate-200", dotIdx !== idx);
    });
    return true;
  }

  function hasRenderableFocusCarousel() {
    return !!docObj?.getElementById?.("focusCarousel");
  }

  function setFocusIndex(nextIndex) {
    const items = getActiveFocusItems();
    if (!items.length || !state) return;
    const max = items.length;
    let idx = Number(nextIndex);
    if (!Number.isFinite(idx)) idx = 0;
    if (idx < 0) idx = max - 1;
    if (idx >= max) idx = 0;
    if (idx === state.focus.index) return;
    state.focus.index = idx;
    if (hasRenderableFocusCarousel()) updateFocusCarouselDom();
  }

  function clearFocusRotation() {
    if (!focusRotateTimer) return;
    if (win && typeof win.clearInterval === "function") {
      win.clearInterval(focusRotateTimer);
    } else {
      clearInterval(focusRotateTimer);
    }
    focusRotateTimer = null;
  }

  function isFocusRotationActive() {
    const profile = state?.profileView?.profile || state?.userProfile;
    const restaurantId = profile?.restaurantId || "";
    if (!restaurantId) return false;
    if (state?.activeTab !== "profile" || state?.profileTopTab !== "menu") return false;
    if (!isRestaurantCafeProfile(profile)) return false;
    if (state?.focus?.enabled === false) return false;
    if (state?.focus?.restaurantId !== restaurantId) return false;
    if (!hasRenderableFocusCarousel()) return false;
    return getActiveFocusItems().length > 1;
  }

  function updateFocusRotation() {
    if (!win || typeof win.setInterval !== "function") return;
    const profile = state?.profileView?.profile || state?.userProfile;
    const restaurantId = profile?.restaurantId || "";
    const items = getActiveFocusItems();
    const shouldRotate = isFocusRotationActive();
    const nextKey = shouldRotate ? `${restaurantId}|${items.length}` : "";
    if (!shouldRotate) {
      clearFocusRotation();
      focusRotateKey = nextKey;
      return;
    }
    if (focusRotateKey !== nextKey) {
      clearFocusRotation();
      focusRotateKey = nextKey;
    }
    if (!focusRotateTimer) {
      focusRotateTimer = win.setInterval(() => {
        if (docObj?.visibilityState && docObj.visibilityState !== "visible") return;
        if (!isFocusRotationActive()) {
          clearFocusRotation();
          return;
        }
        setFocusIndex((state?.focus?.index || 0) + 1);
      }, 5000);
    }
  }

  async function saveFocusItemFromModal() {
    if (!state?.user || !docObj) return;
    const restaurantId = state.userProfile?.restaurantId || "";
    if (!restaurantId) {
      state.focusModal.status = "Kein Restaurant ausgewaehlt.";
      renderOverlaysFn({ updateFocus: true });
      return;
    }
    const title = docObj.getElementById("focusTitle")?.value?.trim() || "";
    const text = docObj.getElementById("focusText")?.value?.trim() || "";
    const imageUrlInput = docObj.getElementById("focusImageUrl")?.value?.trim() || "";
    const active = docObj.getElementById("focusActive")?.checked !== false;
    const crop = getFocusModalCrop();

    if (!title) {
      state.focusModal.status = "Bitte Titel eingeben.";
      renderOverlaysFn({ updateFocus: true });
      return;
    }

    state.focusModal.loading = true;
    state.focusModal.status = "Speichern...";
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

      const id = state.focusModal.item?.id || createFocusId();
      const payload = {
        id,
        title,
        text,
        imageUrl,
        cropX: crop.x,
        cropY: crop.y,
        active
      };
      const nextItems = Array.isArray(state.focus.items) ? state.focus.items.slice() : [];
      const idx = nextItems.findIndex((item) => String(item.id) === String(id));
      if (idx >= 0) {
        nextItems[idx] = { ...nextItems[idx], ...payload };
      } else {
        nextItems.unshift(payload);
      }
      await publishFocusItems(restaurantId, nextItems);
      const truthState = nextItems.length ? "seeded" : "knownEmpty";
      focusCacheMap.set(focusCacheKey(restaurantId), { items: nextItems, enabled: state.focus.enabled, truthSource: "public-menu", truthState, ts: Date.now() });
      state.focus = { ...state.focus, restaurantId, items: nextItems, loading: false, error: "", truthSource: "public-menu", truthState };

      state.focusModal.loading = false;
      state.focusModal.status = "Gespeichert.";
      closeFocusModalFn();
      renderFn();
    } catch (err) {
      console.error(err);
      state.focusModal.status = err?.message || "Speichern fehlgeschlagen.";
      state.focusModal.loading = false;
      renderOverlaysFn({ updateFocus: true });
    }
  }

  async function deleteFocusItemById(itemId) {
    if (!state?.user || !itemId) return;
    const restaurantId = state.userProfile?.restaurantId || "";
    if (!restaurantId) return;
    if (!confirmFn("Fokus-Eintrag wirklich loeschen?")) return;
    try {
      const nextItems = (state.focus.items || []).filter((item) => String(item.id) !== String(itemId));
      await publishFocusItems(restaurantId, nextItems);
      const truthState = nextItems.length ? "seeded" : "knownEmpty";
      focusCacheMap.set(focusCacheKey(restaurantId), { items: nextItems, enabled: state.focus.enabled, truthSource: "public-menu", truthState, ts: Date.now() });
      state.focus = { ...state.focus, restaurantId, items: nextItems, truthSource: "public-menu", truthState };
      renderFn();
    } catch (err) {
      console.error(err);
      alertFn("Loeschen fehlgeschlagen.");
    }
  }

  return {
    getActiveFocusItems,
    getFocusStateForRestaurant,
    getFocusIndex,
    setFocusIndex,
    updateFocusRotation,
    updateFocusCarouselDom,
    loadFocusItems,
    loadFocusMeta,
    saveFocusEnabled,
    publishFocusItems,
    focusCacheKey,
    saveFocusItemFromModal,
    deleteFocusItemById
  };
}
