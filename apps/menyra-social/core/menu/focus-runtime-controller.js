import { buildPublicOffersProjection } from "../public-profile/public-projection-builders.js";
import { isVideoMediaItemCore } from "../media/video-poster-utils.js";

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
  uploadRawMediaFileFn = null,
  captureVideoPosterFn = null,
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
  const uploadRawMediaFile = typeof uploadRawMediaFileFn === "function" ? uploadRawMediaFileFn : null;
  const captureVideoPoster = typeof captureVideoPosterFn === "function" ? captureVideoPosterFn : null;
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

  function cleanFocusText(value = "") {
    return String(value || "").trim();
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
        const id = cleanFocusText(value);
        if (id && !ids.includes(id)) ids.push(id);
      });
    });
    return ids;
  }

  function collectRestaurantRecordIds(record = {}) {
    return [
      record?.id,
      record?.restaurantId,
      record?.canonicalRestaurantId,
      record?.landingRestaurantId,
      record?.rid,
      record?.ownerId
    ].map(cleanFocusText).filter(Boolean);
  }

  function getCurrentRestaurantId(profile = state?.userProfile || {}) {
    return collectProfileRestaurantIds(profile, state?.userProfile)[0] || "";
  }

  function getRestaurantRecordForProfile(profile = state?.userProfile || {}) {
    const ids = collectProfileRestaurantIds(profile, state?.userProfile);
    if (!ids.length || !Array.isArray(state?.restaurants)) return null;
    return state.restaurants.find((row) => (
      collectRestaurantRecordIds(row).some((id) => ids.includes(id))
    )) || null;
  }

  function getProfileViewRecordForProfile(profile = state?.userProfile || {}) {
    const profileViewRecord = state?.profileView?.profile || null;
    if (!profileViewRecord) return null;
    const ids = collectProfileRestaurantIds(profile, state?.userProfile);
    if (!ids.length) return null;
    return collectProfileRestaurantIds(profileViewRecord).some((id) => ids.includes(id))
      ? profileViewRecord
      : null;
  }

  function collectTravelProfileTypeCandidates(...records) {
    const values = [];
    records.forEach((record = {}) => {
      [
        record?.type,
        record?.customerType,
        record?.businessType,
        record?.restaurantType,
        record?.category,
        record?.kind,
        record?.businessProfileType,
        record?.profileType,
        record?.vertical,
        record?.leadType
      ].forEach((value) => {
        const text = cleanFocusText(value).toLowerCase();
        if (text) values.push(text);
      });
    });
    return values;
  }

  function hasTravelAccommodationShape(...records) {
    if (collectTravelProfileTypeCandidates(...records).some((type) => (
      type.includes("hotel")
      || type.includes("motel")
      || type.includes("hostel")
      || type.includes("resort")
      || type.includes("accommodation")
    ))) {
      return true;
    }
    return records.some((record = {}) => {
      const searchable = [
        record?.name,
        record?.restaurantName,
        record?.businessName,
        record?.description,
        record?.bio,
        record?.about
      ].map((value) => cleanFocusText(value).toLowerCase()).join(" ");
      return /\bhotel(s)?\b|\bmotel(s)?\b|\bhostel\b|\bresort\b|\baccommodation\b/.test(searchable);
    });
  }

  function collectFocusTextList(value) {
    if (Array.isArray(value)) {
      return value.map(cleanFocusText).filter(Boolean);
    }
    const raw = cleanFocusText(value);
    if (!raw) return [];
    return raw.split(/[\n,;|]/).map(cleanFocusText).filter(Boolean);
  }

  function normalizeFocusPriceUnit(value = "") {
    const key = cleanFocusText(value).toLowerCase()
      .replace(/[ëèéê]/g, "e")
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "");
    if (key === "total" || key === "totali" || key === "gesamt") return "total";
    return "per_person";
  }

  function isTravelOfferProfile(profile = state?.userProfile || {}) {
    const restaurantRecord = getRestaurantRecordForProfile(profile);
    const profileViewRecord = getProfileViewRecordForProfile(profile);
    return hasTravelAccommodationShape(profile, state?.userProfile, profileViewRecord, restaurantRecord);
  }

  function hasTravelOfferFields(item = {}) {
    return item?.isTravelOffer === true
      || item?.travelOffer === true
      || item?.offerBadgeLabel !== undefined
      || item?.offerDurationLabel !== undefined
      || item?.distanceCenter !== undefined
      || item?.distanceBeach !== undefined
      || item?.hotelStartingPrice !== undefined
      || item?.priceUnit !== undefined
      || item?.features !== undefined
      || item?.offerFeatures !== undefined;
  }

  function collectTravelOfferFeatures(item = {}) {
    return [
      ...collectFocusTextList(item.features),
      ...collectFocusTextList(item.offerFeatures),
      ...collectFocusTextList(item.hotelFeatures),
      cleanFocusText(item.hotelFeatureOneText),
      cleanFocusText(item.hotelFeatureTwoText),
      cleanFocusText(item.hotelFeatureThreeText)
    ].filter(Boolean).filter((entry, index, list) => list.indexOf(entry) === index);
  }

  // Galerie einer Oferta: Hauptbild zuerst, danach die Zusatzfotos -
  // dedupliziert und gedeckelt (fuers "Me shume"-Modal der Detailseite).
  const MAX_OFFER_IMAGES = 12;
  function collectOfferImages(item = {}, mainImageUrl = "") {
    const list = [
      cleanFocusText(mainImageUrl || item.imageUrl),
      ...(Array.isArray(item.images) ? item.images : [])
    ];
    const unique = [];
    list.forEach((entry) => {
      const url = cleanFocusText(entry);
      if (url && !unique.includes(url)) unique.push(url);
    });
    return unique.slice(0, MAX_OFFER_IMAGES);
  }

  function normalizeFocusItem(data, fallbackId) {
    const item = data || {};
    const id = item.id || item._id || fallbackId || createFocusId();
    const crop = getFocusItemCrop(item);
    const videoUrl = String(item.videoUrl || item.video || item.clipUrl || "").trim();
    const isVideo = isVideoMediaItemCore(item);
    const posterUrl = String(item.posterUrl || item.poster || item.videoPoster || "").trim();
    const imageUrl = String(item.imageUrl || item.image || item.photoUrl || (isVideo ? posterUrl : "") || "").trim();
    const normalized = {
      id,
      menuItemId: String(item.menuItemId || item.targetMenuItemId || item.itemId || item.targetItemId || "").trim(),
      productId: String(item.productId || item.targetProductId || "").trim(),
      targetCategory: String(item.targetCategory || item.categoryTarget || item.menuCategory || "").trim(),
      title: item.title || item.name || "Sot ne Fokus",
      text: item.text || item.desc || item.description || "",
      imageUrl,
      mediaType: isVideo ? "video" : "image",
      videoUrl: isVideo ? videoUrl : "",
      posterUrl: isVideo ? (posterUrl || imageUrl) : "",
      cropX: crop.x,
      cropY: crop.y,
      active: item.active !== false
    };
    if (hasTravelOfferFields(item)) {
      const features = collectTravelOfferFeatures(item);
      normalized.isTravelOffer = true;
      normalized.images = collectOfferImages(item, imageUrl);
      normalized.offerBadgeLabel = cleanFocusText(item.offerBadgeLabel || item.travelOfferBadgeLabel || item.badgeLabel || "OFERTA");
      normalized.offerDurationLabel = cleanFocusText(item.offerDurationLabel || item.nightsDaysLabel || item.durationLabel || "");
      normalized.distanceCenter = cleanFocusText(item.distanceCenter || item.distanceToCenter || item.centerDistance || "");
      normalized.distanceToCenter = cleanFocusText(item.distanceToCenter || item.distanceCenter || item.centerDistance || "");
      normalized.centerDistance = cleanFocusText(item.centerDistance || item.distanceCenter || item.distanceToCenter || "");
      normalized.directCenter = item.directCenter === true || item.inCenter === true || item.cityCenterDirect === true;
      normalized.inCenter = normalized.directCenter;
      normalized.distanceBeach = cleanFocusText(item.distanceBeach || item.distanceToBeach || item.beachDistance || "");
      normalized.distanceToBeach = cleanFocusText(item.distanceToBeach || item.distanceBeach || item.beachDistance || "");
      normalized.beachDistance = cleanFocusText(item.beachDistance || item.distanceBeach || item.distanceToBeach || "");
      normalized.beachfront = item.beachfront === true || item.onBeach === true || item.amStrand === true;
      normalized.onBeach = normalized.beachfront;
      normalized.hotelStartingPrice = cleanFocusText(item.hotelStartingPrice || item.startingPrice || item.priceFrom || item.fromPrice || item.bestPrice || "");
      normalized.startingPrice = cleanFocusText(item.startingPrice || item.hotelStartingPrice || item.priceFrom || item.fromPrice || item.bestPrice || "");
      normalized.priceFrom = cleanFocusText(item.priceFrom || item.startingPrice || item.hotelStartingPrice || "");
      normalized.priceUnit = normalizeFocusPriceUnit(item.priceUnit || item.hotelPriceUnit || item.offerPriceUnit || "");
      normalized.features = features;
      normalized.offerFeatures = features;
    }
    return normalized;
  }

  async function loadFocusItems(restaurantId) {
    const safeRestaurantId = String(restaurantId || "").trim();
    if (!safeRestaurantId || !makeDocRef || !getDoc || !db) return [];
    try {
      const snap = await getDoc(makeDocRef(db, "restaurants", safeRestaurantId, "public", "offers"));
      if (!snap.exists()) return [];
      const data = snap.data() || {};
      const projection = buildPublicOffersProjection({
        ...data,
        restaurantId: safeRestaurantId
      });
      const items = projection.items;
      return items.map((item, idx) => normalizeFocusItem(item, item?.id || `focus_${idx}`));
    } catch (err) {
      console.error(err);
      throw err;
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
    const normalizedItems = (items || []).map((item) => {
      const isVideoItem = isVideoMediaItemCore(item);
      const payload = {
        id: item.id || "",
        title: item.title || "",
        text: item.text || "",
        imageUrl: item.imageUrl || "",
        mediaType: isVideoItem ? "video" : "image",
        videoUrl: isVideoItem ? String(item.videoUrl || "").trim() : "",
        posterUrl: isVideoItem ? String(item.posterUrl || item.imageUrl || "").trim() : "",
        cropX: clampCropPercent(item.cropX ?? 50, 50),
        cropY: clampCropPercent(item.cropY ?? 50, 50),
        active: item.active !== false
      };
      if (hasTravelOfferFields(item)) {
        const features = collectTravelOfferFeatures(item);
        payload.isTravelOffer = true;
        payload.images = collectOfferImages(item, payload.imageUrl);
        payload.offerBadgeLabel = cleanFocusText(item.offerBadgeLabel || item.travelOfferBadgeLabel || item.badgeLabel || "OFERTA");
        payload.offerDurationLabel = cleanFocusText(item.offerDurationLabel || item.nightsDaysLabel || item.durationLabel || "");
        payload.distanceCenter = cleanFocusText(item.distanceCenter || item.distanceToCenter || item.centerDistance || "");
        payload.distanceToCenter = cleanFocusText(item.distanceToCenter || item.distanceCenter || item.centerDistance || "");
        payload.centerDistance = cleanFocusText(item.centerDistance || item.distanceCenter || item.distanceToCenter || "");
        payload.directCenter = item.directCenter === true || item.inCenter === true || item.cityCenterDirect === true;
        payload.inCenter = payload.directCenter;
        payload.distanceBeach = cleanFocusText(item.distanceBeach || item.distanceToBeach || item.beachDistance || "");
        payload.distanceToBeach = cleanFocusText(item.distanceToBeach || item.distanceBeach || item.beachDistance || "");
        payload.beachDistance = cleanFocusText(item.beachDistance || item.distanceBeach || item.distanceToBeach || "");
        payload.beachfront = item.beachfront === true || item.onBeach === true || item.amStrand === true;
        payload.onBeach = payload.beachfront;
        payload.hotelStartingPrice = cleanFocusText(item.hotelStartingPrice || item.startingPrice || item.priceFrom || item.fromPrice || item.bestPrice || "");
        payload.startingPrice = cleanFocusText(item.startingPrice || item.hotelStartingPrice || item.priceFrom || item.fromPrice || item.bestPrice || "");
        payload.priceFrom = cleanFocusText(item.priceFrom || item.startingPrice || item.hotelStartingPrice || "");
        payload.priceUnit = normalizeFocusPriceUnit(item.priceUnit || item.hotelPriceUnit || item.offerPriceUnit || "");
        payload.features = features;
        payload.offerFeatures = features;
      }
      return payload;
    });
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

  function syncTravelOffersToRestaurantState(restaurantId, items = []) {
    const safeRestaurantId = cleanFocusText(restaurantId);
    if (!safeRestaurantId || !Array.isArray(state?.restaurants)) return;
    const safeItems = Array.isArray(items) ? items : [];
    state.restaurants = state.restaurants.map((row) => {
      const rowId = cleanFocusText(row?.id || row?.restaurantId || row?.canonicalRestaurantId || "");
      if (rowId !== safeRestaurantId) return row;
      const activeOffers = safeItems.filter((item) => item && item.active !== false);
      return {
        ...row,
        publicOffers: safeItems,
        travelOffers: safeItems,
        publicOffersCount: safeItems.length,
        travelOffersCount: safeItems.length,
        hasTravelOffers: activeOffers.length > 0,
        offersTruthState: safeItems.length ? "seeded" : "knownEmpty"
      };
    });
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

    const itemIsVideo = isVideoMediaItemCore(item) && !!String(item.videoUrl || "").trim();
    const videoEl = root.querySelector("[data-focus-video]");
    const imgEl = root.querySelector("[data-focus-image]");
    // Beim Rotieren kann sich der Medientyp aendern (Foto <-> Video). Passt der
    // vorhandene Knoten nicht, komplett neu rendern statt fehlerhaft patchen.
    if ((itemIsVideo && !videoEl) || (!itemIsVideo && !imgEl)) {
      renderFn();
      return true;
    }
    if (itemIsVideo && videoEl) {
      const videoSrc = String(item.videoUrl || "").trim();
      if (videoEl.getAttribute("src") !== videoSrc) videoEl.setAttribute("src", videoSrc);
      if (safeImg && videoEl.getAttribute("poster") !== safeImg) videoEl.setAttribute("poster", safeImg);
    } else if (typeof HTMLImageElement !== "undefined" && imgEl instanceof HTMLImageElement) {
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

  function readFocusModalValue(id = "") {
    return docObj?.getElementById(id)?.value?.trim() || "";
  }

  function readFocusModalChecked(id = "") {
    return docObj?.getElementById(id)?.checked === true;
  }

  function uniqueFocusTextList(values = []) {
    const unique = [];
    (Array.isArray(values) ? values : []).forEach((value) => {
      const safeValue = cleanFocusText(value);
      if (safeValue && !unique.includes(safeValue)) unique.push(safeValue);
    });
    return unique;
  }

  function readFocusDistanceField(idPrefix = "", directLabel = "", suffix = "") {
    if (readFocusModalChecked(`${idPrefix}Direct`)) return directLabel;
    const amount = readFocusModalValue(`${idPrefix}Value`).replace(",", ".");
    const unit = readFocusModalValue(`${idPrefix}Unit`).toLowerCase() === "km" ? "km" : "m";
    if (!amount) return readFocusModalValue(idPrefix);
    return [amount, unit, suffix].filter(Boolean).join(" ");
  }

  async function saveFocusItemFromModal() {
    if (!state?.user || !docObj) return;
    const restaurantId = getCurrentRestaurantId(state.userProfile);
    if (!restaurantId) {
      state.focusModal.status = "Kein Restaurant ausgewaehlt.";
      renderOverlaysFn({ updateFocus: true });
      return;
    }
    const title = docObj.getElementById("focusTitle")?.value?.trim() || "";
    const text = docObj.getElementById("focusText")?.value?.trim() || "";
    const imageUrlInput = docObj.getElementById("focusImageUrl")?.value?.trim() || "";
    const active = docObj.getElementById("focusActive")?.checked !== false;
    const modalItem = state.focusModal?.item || {};
    const isTravelOffer = isTravelOfferProfile(state.userProfile) || hasTravelOfferFields(modalItem);
    const offerBadgeLabel = docObj.getElementById("focusOfferBadgeLabel")?.value?.trim() || "OFERTA";
    const offerDurationLabel = docObj.getElementById("focusOfferDurationLabel")?.value?.trim() || "";
    const distanceCenter = readFocusDistanceField("focusDistanceCenter", "Në qendër", "nga qendra");
    const distanceBeach = readFocusDistanceField("focusDistanceBeach", "Në plazh", "nga plazhi");
    const distanceCenterDirect = readFocusModalChecked("focusDistanceCenterDirect");
    const distanceBeachDirect = readFocusModalChecked("focusDistanceBeachDirect");
    const startingPrice = docObj.getElementById("focusStartingPrice")?.value?.trim() || "";
    const priceUnit = normalizeFocusPriceUnit(docObj.getElementById("focusPriceUnit")?.value || "per_person");
    const featureFood = readFocusModalValue("focusFeatureFoodText");
    const featureLounger = readFocusModalValue("focusFeatureLoungerText");
    const featureParking = readFocusModalValue("focusFeatureParkingText");
    const customFeatures = collectFocusTextList(docObj.getElementById("focusFeaturesText")?.value || "");
    const features = uniqueFocusTextList([featureFood, featureLounger, featureParking, ...customFeatures]);
    const crop = getFocusModalCrop();

    if (!title) {
      state.focusModal.status = isTravelOffer ? "Shkruaj titullin." : "Ju lutem shkruani titullin.";
      renderOverlaysFn({ updateFocus: true });
      return;
    }

    state.focusModal.loading = true;
    state.focusModal.status = isTravelOffer ? "Po ruhet..." : "Duke ruajtur...";
    renderOverlaysFn({ updateFocus: true });

    try {
      let imageUrl = imageUrlInput || state.focusModal.item?.imageUrl || "";
      let videoUrl = "";
      let posterUrl = "";
      let mediaType = "image";
      const focusVideoFile = state.focusModal.videoFile || null;
      if (focusVideoFile && uploadRawMediaFile) {
        // Fokus-Video wie ein Foto hochladen, erstes Frame als Poster.
        const videoResult = await uploadRawMediaFile(focusVideoFile, restaurantId);
        videoUrl = String(videoResult?.cdnUrl || videoResult?.url || "").trim();
        if (!videoUrl) throw new Error(isTravelOffer ? "Videoja nuk u ngarkua." : "Ngarkimi i videos deshtoi.");
        if (captureVideoPoster) {
          try {
            const posterFile = await captureVideoPoster(focusVideoFile);
            if (posterFile) {
              const posterResult = await uploadCompressedImage(
                posterFile,
                restaurantId,
                { maxSize: 1080, quality: 0.78, mimeType: "image/jpeg" }
              );
              posterUrl = String(posterResult?.cdnUrl || posterResult?.url || "").trim();
            }
          } catch {}
        }
        mediaType = "video";
        imageUrl = posterUrl || imageUrl;
      } else if (state.focusModal.imageFile) {
        const { cdnUrl } = await uploadCompressedImage(
          state.focusModal.imageFile,
          restaurantId,
          { maxSize: 1080, quality: 0.8, mimeType: "image/jpeg" }
        );
        imageUrl = cdnUrl || imageUrl;
      } else if (
        !state.focusModal.imageFile
        && isVideoMediaItemCore(state.focusModal.item)
        && (!imageUrlInput || imageUrlInput === String(state.focusModal.item?.imageUrl || "").trim())
      ) {
        // Bearbeiten ohne neue Medien: bestehendes Video behalten. Das
        // Bild-URL-Feld ist mit dem Poster vorbefuellt, daher zaehlt nur eine
        // echte Aenderung als Foto-Wechsel.
        videoUrl = String(state.focusModal.item?.videoUrl || "").trim();
        posterUrl = String(state.focusModal.item?.posterUrl || state.focusModal.item?.imageUrl || "").trim();
        mediaType = videoUrl ? "video" : "image";
      }

      // Zusatzfotos der Oferta-Galerie hochladen (Reihenfolge: bestehende
      // URLs, dann neue Uploads); das Hauptbild bleibt images[0].
      let extraImages = [];
      if (isTravelOffer) {
        extraImages = (Array.isArray(state.focusModal.existingExtraImages) ? state.focusModal.existingExtraImages : [])
          .map(cleanFocusText)
          .filter(Boolean);
        const extraFiles = (Array.isArray(state.focusModal.extraImageFiles) ? state.focusModal.extraImageFiles : [])
          .filter(Boolean);
        for (const extraFile of extraFiles) {
          const uploadedExtra = await uploadCompressedImage(
            extraFile,
            restaurantId,
            { maxSize: 1080, quality: 0.8, mimeType: "image/jpeg" }
          );
          const extraUrl = cleanFocusText(uploadedExtra?.cdnUrl || uploadedExtra?.url);
          if (!extraUrl) throw new Error("Fotoja shtesë nuk u ngarkua.");
          extraImages.push(extraUrl);
        }
      }

      const id = state.focusModal.item?.id || createFocusId();
      const payload = {
        id,
        title,
        text,
        imageUrl,
        mediaType,
        videoUrl: mediaType === "video" ? videoUrl : "",
        posterUrl: mediaType === "video" ? (posterUrl || imageUrl) : "",
        cropX: crop.x,
        cropY: crop.y,
        active
      };
      if (isTravelOffer) {
        payload.isTravelOffer = true;
        payload.images = collectOfferImages({ images: extraImages }, imageUrl);
        payload.offerBadgeLabel = offerBadgeLabel;
        payload.offerDurationLabel = offerDurationLabel;
        payload.distanceCenter = distanceCenter;
        payload.distanceToCenter = distanceCenter;
        payload.centerDistance = distanceCenter;
        payload.directCenter = distanceCenterDirect;
        payload.inCenter = distanceCenterDirect;
        payload.distanceBeach = distanceBeach;
        payload.distanceToBeach = distanceBeach;
        payload.beachDistance = distanceBeach;
        payload.beachfront = distanceBeachDirect;
        payload.onBeach = distanceBeachDirect;
        payload.hotelStartingPrice = startingPrice;
        payload.startingPrice = startingPrice;
        payload.priceFrom = startingPrice;
        payload.priceUnit = priceUnit;
        payload.features = features;
        payload.offerFeatures = features;
      }
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
      if (isTravelOffer) syncTravelOffersToRestaurantState(restaurantId, nextItems);

      state.focusModal.loading = false;
      state.focusModal.status = isTravelOffer ? "U ruajt." : "U ruajt.";
      closeFocusModalFn();
      renderFn();
    } catch (err) {
      console.error(err);
      state.focusModal.status = err?.message || (isTravelOffer ? "Nuk u ruajt." : "Ruajtja deshtoi.");
      state.focusModal.loading = false;
      renderOverlaysFn({ updateFocus: true });
    }
  }

  async function deleteFocusItemById(itemId) {
    if (!state?.user || !itemId) return;
    const restaurantId = getCurrentRestaurantId(state.userProfile);
    if (!restaurantId) return;
    if (!confirmFn("Ta fshish vertet kete fokus?")) return;
    try {
      const removedItem = (state.focus.items || []).find((item) => String(item.id) === String(itemId));
      const nextItems = (state.focus.items || []).filter((item) => String(item.id) !== String(itemId));
      await publishFocusItems(restaurantId, nextItems);
      const truthState = nextItems.length ? "seeded" : "knownEmpty";
      focusCacheMap.set(focusCacheKey(restaurantId), { items: nextItems, enabled: state.focus.enabled, truthSource: "public-menu", truthState, ts: Date.now() });
      state.focus = { ...state.focus, restaurantId, items: nextItems, truthSource: "public-menu", truthState };
      if (isTravelOfferProfile(state.userProfile) || hasTravelOfferFields(removedItem)) syncTravelOffersToRestaurantState(restaurantId, nextItems);
      renderFn();
    } catch (err) {
      console.error(err);
      alertFn("Fshirja deshtoi.");
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
