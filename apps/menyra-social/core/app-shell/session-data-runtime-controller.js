import { clearPostEntityMap, projectPostCollectionThroughEntityMap } from "../profile/post-entity-registry-utils.js";
import {
  buildRestaurantTruthSignatureCore,
  isBootstrapRestaurantPreviewRecordCore
} from "../common/restaurant-identity-runtime-controller.js";

export function createSessionDataRuntimeController({
  state = null,
  dataLoaded = null,
  defaultSettings = {},
  defaultMenuLayout = {},
  defaultProfile = {},
  cacheKeys = {},
  storageKeys = {},
  guestScopeUid = "",
  crmPageSize = 30,
  ceoCountries = [],
  safeStorageObj = null,
  readCacheFn = () => null,
  writeCacheFn = () => {},
  scheduleIdleFn = (fn) => fn?.(),
  collectFeedHydrationIdsFn = () => [],
  hydrateRestaurantsByIdsFn = async () => {},
  rebuildBusinessLocationsFn = () => {},
  syncFeedPostLogosFn = () => false,
  refreshFeedStoriesFn = () => false,
  preloadFeedHeroImagesFn = () => {},
  renderFn = () => {},
  getLastRenderModeFn = () => "",
  updateFeedDomFn = () => false,
  enrichRestaurantsWithPublicMetaFn = async (items = []) => items,
  loadLogoCacheFn = () => {},
  profileKeyFn = () => "",
  notificationsKeyFn = () => "",
  followingKeyFn = () => "",
  shopCartKeyFn = () => "",
  userPostsKeyFn = () => "",
  businessPostsKeyFn = () => "",
  normalizeShopCartStateFn = (value) => value,
  createEmptyShopCartFn = () => ({}),
  createEmptyOrdersStateFn = () => ({}),
  createEmptyFavoriteMenuItemsStateFn = () => ({}),
  createEmptyMenuDetailStateFn = () => ({}),
  createEmptyLeadsStateFn = () => ({}),
  createEmptyCustomersStateFn = () => ({}),
  sortChatThreadsFn = (items = []) => items,
  loadChatThreadIndexFn = () => [],
  loadChatThreadMessagesFn = () => [],
  buildChatPreviewTextFn = () => "",
  getChatMessageTimestampFn = () => 0,
  saveChatThreadIndexFn = () => {},
  loadAvatarCacheFn = () => {},
  getOptimizedImageUrlFn = (value) => value,
  isPlaceholderUrlFn = () => false,
  primeSelfAvatarCacheFn = () => {},
  normalizeFollowHandleFn = (value) => String(value || ""),
  saveFollowingFn = () => {},
  stopActiveChatMessagesListenerFn = () => {},
  stopRestaurantMetaListenersFn = () => {},
  stopMenuItemMetaListenersFn = () => {},
  menuItemCountsRequested = null,
  commentAvatarCache = null,
  commentAvatarPending = null,
  userSearchAvatarCache = null,
  businessProfileCache = null,
  userProfileCache = null,
  setMenuDetailCloseBoundFn = () => {},
  getUserAvatarCacheFn = () => "",
  setUserAvatarCacheFn = () => {},
  getLastShellAvatarUrlFn = () => "",
  setLastShellAvatarUrlFn = () => {},
  bootstrapAuthenticatedSessionCoreFn = async () => {},
  loadAuthProfileFn = async () => {},
  resolveRoleSwitchTargetsFn = async () => {},
  startLiveListenersFn = () => {},
  ensureTabDataFn = () => {},
  cacheTtl = {},
  fastLimits = {},
  db = null,
  docFn = null,
  onSnapshotFn = null,
  collectionFn = null,
  queryFn = null,
  whereFn = null,
  orderByFn = null,
  limitFn = null,
  getDocsFn = null,
  toDateSafeFn = () => null,
  updateShellDomFn = () => {},
  refreshSearchViewFn = () => false,
  cleanupLeafletFn = () => {},
  normalizeFeedPostFn = (row) => row,
  loadStoriesForFeedFn = async () => {},
  saveFeedPostsFn = () => {},
  focusCache = null,
  menuCache = null,
  focusCacheKeyFn = () => "",
  menuCacheKeyFn = () => "",
  loadFocusItemsFn = async () => [],
  loadFocusMetaFn = async () => true,
  loadMenuMetaFn = async () => ({ statusBadgeVisible: true }),
  loadMenuItemsFromCollectionFn = async () => [],
  loadPublicMenuItemsFn = async () => [],
  loadMenuHybridFn = async () => [],
  publishMenuToPublicFn = null
} = {}) {
  const safeStorage = safeStorageObj || {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {}
  };
  const requestedMenuItemCounts = menuItemCountsRequested || new Set();
  const commentAvatarCacheMap = commentAvatarCache || new Map();
  const commentAvatarPendingMap = commentAvatarPending || new Map();
  const userSearchAvatarCacheMap = userSearchAvatarCache || new Map();
  const businessProfileCacheMap = businessProfileCache || new Map();
  const userProfileCacheMap = userProfileCache || new Map();
  const focusCacheMap = focusCache || new Map();
  const menuCacheMap = menuCache || new Map();
  const makeDocRef = typeof docFn === "function" ? docFn : null;
  const subscribeSnapshot = typeof onSnapshotFn === "function" ? onSnapshotFn : null;
  const menuPersistentCachePrefix = String(cacheKeys?.menu || "menyra_social_menu_cache_v1").trim() || "menyra_social_menu_cache_v1";
  const menuPersistentCacheTtlMs = Math.max(0, Number(cacheTtl?.menu || (15 * 60 * 1000)) || 0);
  let menuMetaUnsub = null;
  let menuMetaRestaurantId = "";
  let feedFreshReconcileQueued = false;
  let restaurantsNetworkLoadPromise = null;
  let feedNetworkLoadPromise = null;
  const menuNetworkLoadPromises = new Map();
  const menuFreshReconcileQueuedKeys = new Set();
  const menuFreshReconcileAtByKey = new Map();
  const menuPublicRepairPendingIds = new Set();
  const menuPublicRepairAtByRestaurant = new Map();
  let storiesRefreshQueued = false;
  let storiesRefreshForce = false;
  let storiesRefreshUi = false;
  let renderRequested = false;
  const publishMenuToPublicSafe = typeof publishMenuToPublicFn === "function"
    ? publishMenuToPublicFn
    : null;

  function isQrGuestMenuSessionForRestaurant(restaurantId = "") {
    const hasUser = !!String(state?.user?.uid || "").trim();
    if (hasUser) return false;
    const activeTab = String(state?.activeTab || "").trim().toLowerCase();
    if (activeTab !== "profile") return false;
    const profileTopTab = String(state?.profileTopTab || "").trim().toLowerCase();
    if (profileTopTab !== "menu") return false;
    const menuAccessSource = String(state?.profileView?.menuAccessSource || "").trim().toLowerCase();
    if (menuAccessSource !== "qr") return false;
    const expectedRestaurantId = String(
      state?.profileView?.profile?.restaurantId
      || state?.profileView?.restaurantId
      || ""
    ).trim();
    const targetRestaurantId = String(restaurantId || "").trim();
    if (!targetRestaurantId || !expectedRestaurantId) return true;
    return expectedRestaurantId === targetRestaurantId;
  }

  function isTransientMenuLoadError(err = null) {
    const code = String(err?.code || err?.name || "").trim().toLowerCase();
    const message = String(err?.message || "").trim().toLowerCase();
    const markers = [
      "unavailable",
      "deadline-exceeded",
      "cancelled",
      "aborted",
      "resource-exhausted",
      "internal",
      "network",
      "offline",
      "socket",
      "timeout"
    ];
    return markers.some((marker) => code.includes(marker) || message.includes(marker));
  }

  async function runMenuLoadWithBackoff(task, {
    attempts = 3,
    baseDelayMs = 220
  } = {}) {
    const runTask = typeof task === "function" ? task : null;
    if (!runTask) return null;
    const totalAttempts = Math.max(1, Math.round(Number(attempts) || 1));
    let lastError = null;
    for (let attempt = 0; attempt < totalAttempts; attempt += 1) {
      try {
        return await runTask();
      } catch (err) {
        lastError = err;
        if (attempt >= totalAttempts - 1 || !isTransientMenuLoadError(err)) {
          throw err;
        }
        const baseDelay = Math.max(80, Number(baseDelayMs) || 80);
        const delay = Math.round(baseDelay * (attempt + 1) * (0.65 + Math.random() * 0.35));
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
    throw lastError || new Error("menu-load-retry-failed");
  }

  function isGenericBusinessLabel(value = "") {
    return String(value || "").trim().toLowerCase() === "business";
  }

  function hasRestaurantCoords(record = {}) {
    if (!record || typeof record !== "object") return false;
    const pairs = [
      [record.lat, record.lng],
      [record.latitude, record.longitude],
      [record.gpsLat, record.gpsLng],
      [record.geo?.lat, record.geo?.lng],
      [record.geo?.latitude, record.geo?.longitude],
      [record.coords?.lat, record.coords?.lng],
      [record.coords?.latitude, record.coords?.longitude],
      [record.location?.lat, record.location?.lng]
    ];
    for (const [latRaw, lngRaw] of pairs) {
      const lat = Number(latRaw);
      const lng = Number(lngRaw);
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) continue;
      if (Math.abs(lat) < 0.000001 && Math.abs(lng) < 0.000001) continue;
      if (Math.abs(lat) <= 90 && Math.abs(lng) <= 180) return true;
      if (Math.abs(lat) <= 180 && Math.abs(lng) <= 90) return true;
    }
    return false;
  }

  function isRestaurantTruthIncomplete(record = {}) {
    if (!record || typeof record !== "object") return true;
    if (isBootstrapRestaurantPreviewRecordCore(record)) return true;
    const name = String(
      record.name
      || record.restaurantName
      || record.displayName
      || record.businessName
      || ""
    ).trim();
    const logo = String(record.logoUrl || record.logo || record.logoURL || "").trim();
    const cityOrAddress = String(record.city || record.address || record.location || "").trim();
    const type = String(
      record.type
      || record.customerType
      || record.category
      || record.kind
      || record.restaurantType
      || ""
    ).trim();
    const hasName = !!name && !isGenericBusinessLabel(name);
    const hasLogo = !!logo;
    const hasLocation = !!cityOrAddress || hasRestaurantCoords(record);
    const hasType = !!type;
    return !(hasName && hasLogo && hasType && hasLocation);
  }

  function filterCanonicalRestaurants(items = []) {
    if (!Array.isArray(items)) return [];
    const next = [];
    const seen = new Set();
    items.forEach((row) => {
      if (!row || typeof row !== "object") return;
      const id = String(row.id || row.restaurantId || "").trim();
      if (!id || seen.has(id)) return;
      if (isBootstrapRestaurantPreviewRecordCore(row)) return;
      seen.add(id);
      next.push({ ...row, id });
    });
    return next;
  }

  const LEGACY_GLOBAL_GUEST_SCOPE_UID = "guest";
  const resolveGuestScopeUid = () => String(guestScopeUid || "").trim();
  const pruneLegacyGlobalGuestCartStorage = (currentGuestScopeUid = resolveGuestScopeUid()) => {
    const safeGuestScopeUid = String(currentGuestScopeUid || "").trim();
    if (!safeGuestScopeUid || safeGuestScopeUid === LEGACY_GLOBAL_GUEST_SCOPE_UID) return;
    const legacyScopedKey = shopCartKeyFn(LEGACY_GLOBAL_GUEST_SCOPE_UID);
    const currentScopedKey = shopCartKeyFn(safeGuestScopeUid);
    if (legacyScopedKey && legacyScopedKey !== currentScopedKey) {
      safeStorage.removeItem(legacyScopedKey);
    }
    if (storageKeys?.shopCart && storageKeys.shopCart !== currentScopedKey) {
      safeStorage.removeItem(storageKeys.shopCart);
    }
  };

  if (!state || !dataLoaded) {
    return {
      loadPersisted: () => {},
      loadUserScopedPersisted: () => {},
      loadGuestScopedPersisted: () => {},
      resetUserScopedState: () => {},
      loadRestaurants: async () => {},
      loadFeedPosts: async () => {},
      loadUserPosts: async () => {},
      loadBusinessPosts: async () => {},
      loadFocusForRestaurant: async () => {},
      loadMenuForRestaurant: async () => {},
      bootstrapUser: async () => {}
    };
  }

  function loadPersisted() {
    loadLogoCacheFn();
    const savedSettings = safeStorage.getItem(storageKeys.settings);
    if (savedSettings) {
      try { state.settings = { ...defaultSettings, ...JSON.parse(savedSettings) }; } catch {}
    }
    const savedMenuLayout = safeStorage.getItem(storageKeys.menuLayout);
    if (savedMenuLayout) {
      try { state.menuLayout = { ...defaultMenuLayout, ...JSON.parse(savedMenuLayout) }; } catch {}
    }

    const restaurantsCache = readCacheFn(cacheKeys.restaurants);
    let needsRestaurantMetaHydration = false;
    if (restaurantsCache?.data?.length) {
      const canonicalCachedRestaurants = filterCanonicalRestaurants(restaurantsCache.data);
      if (canonicalCachedRestaurants.length) {
        state.restaurants = canonicalCachedRestaurants;
        needsRestaurantMetaHydration = canonicalCachedRestaurants.some((rest) => isRestaurantTruthIncomplete(rest));
      }
    }

    const feedCache = readCacheFn(cacheKeys.feed);
    let cachedHydrationIds = [];
    if (feedCache?.data?.length) {
      state.feedPosts = projectPostCollectionThroughEntityMap(state, feedCache.data);
      cachedHydrationIds = collectFeedHydrationIdsFn(state.feedPosts, { max: 6 });
    }

    const storiesCache = readCacheFn(cacheKeys.stories);
    if (!state.stories.length && storiesCache?.data?.length) state.stories = storiesCache.data;

    state.postMeta = {};

    scheduleIdleFn(() => {
      if (state.restaurants.length) {
        const hadLocations = Array.isArray(state.businessLocations) ? state.businessLocations.length : 0;
        rebuildBusinessLocationsFn();
        const hasVisibleLeafletMap = getLastRenderModeFn() === "main"
          && typeof document !== "undefined"
          && !!document.getElementById("leafletMap");
        const nextLocations = Array.isArray(state.businessLocations) ? state.businessLocations.length : 0;
        if (hasVisibleLeafletMap && nextLocations !== hadLocations) {
          requestRender();
        }
      }

      const feedUpdated = syncFeedPostLogosFn();
      const storiesUpdated = state.stories.length
        ? false
        : refreshFeedStoriesFn({ posts: state.feedPosts, force: true });
      preloadFeedHeroImagesFn(state.feedPosts);

      if (feedUpdated || storiesUpdated) {
        const inMain = getLastRenderModeFn() === "main";
        const updatedFeed = state.activeTab === "feed" && inMain && updateFeedDomFn();
        if (!updatedFeed) requestRender();
      }

      if (needsRestaurantMetaHydration) {
        void Promise.resolve(enrichRestaurantsWithPublicMetaFn(state.restaurants))
          .then((list) => {
            const canonicalList = filterCanonicalRestaurants(list);
            if (!canonicalList.length) return;
            state.restaurants = canonicalList;
            rebuildBusinessLocationsFn();
            const feedChanged = syncFeedPostLogosFn();
            const storiesChanged = state.stories.length
              ? false
              : refreshFeedStoriesFn({ posts: state.feedPosts, force: true });
            writeCacheFn(cacheKeys.restaurants, canonicalList);
            if (feedChanged || storiesChanged) {
              const inMain = getLastRenderModeFn() === "main";
              const updatedFeed = state.activeTab === "feed" && inMain && updateFeedDomFn();
              if (!updatedFeed) requestRender();
            }
          })
          .catch(() => null);
      }

      if (cachedHydrationIds.length) {
        void hydrateRestaurantsByIdsFn(cachedHydrationIds, { max: cachedHydrationIds.length });
      }
    });
  }

  function scheduleStoriesRefresh({ force = false, refreshUi = false } = {}) {
    storiesRefreshForce = storiesRefreshForce || !!force;
    storiesRefreshUi = storiesRefreshUi || !!refreshUi;
    if (storiesRefreshQueued) return;
    storiesRefreshQueued = true;
    const runRefresh = () => {
      const nextForce = storiesRefreshForce;
      const nextRefreshUi = storiesRefreshUi;
      storiesRefreshQueued = false;
      storiesRefreshForce = false;
      storiesRefreshUi = false;
      void Promise.resolve(loadStoriesForFeedFn({
        force: nextForce,
        refreshUi: nextRefreshUi
      })).catch(() => null);
    };
    if (refreshUi) {
      queueMicrotask(runRefresh);
      return;
    }
    scheduleIdleFn(runRefresh);
  }

  function serializePostSignatureValue(value) {
    if (value === null || value === undefined) return "";
    if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
      return String(value);
    }
    if (value instanceof Date) return String(value.getTime());
    if (typeof value?.seconds === "number") {
      return `${value.seconds}:${Number(value?.nanoseconds) || 0}`;
    }
    try {
      return JSON.stringify(value);
    } catch {
      return String(value);
    }
  }

  function buildPostCollectionSignature(items = []) {
    if (!Array.isArray(items) || !items.length) return "";
    return items.map((item = {}) => ([
      item.id,
      item.ownerType,
      item.ownerId,
      item.restaurantId,
      item.url,
      item.image,
      item.caption,
      item.content,
      item.title,
      item.logo,
      item.business,
      item.location,
      item.type,
      item.category,
      Number(item.likes ?? 0) || 0,
      Number(item.comments ?? 0) || 0,
      !!item.isVideo,
      item.createdAt
    ].map(serializePostSignatureValue).join("::"))).join("|");
  }

  function havePostCollectionsChanged(prev = [], next = []) {
    return buildPostCollectionSignature(prev) !== buildPostCollectionSignature(next);
  }

  function requestRender() {
    if (renderRequested) return;
    renderRequested = true;
    Promise.resolve().then(() => {
      renderRequested = false;
      renderFn();
    });
  }

  function ensureRuntimeMetricsState() {
    if (!state || typeof state !== "object") return null;
    if (!state.runtimeMetrics || typeof state.runtimeMetrics !== "object") {
      state.runtimeMetrics = {};
    }
    return state.runtimeMetrics;
  }

  function recordMenuUsableMetric({
    restaurantId = "",
    source = "public",
    requestStartedAt = 0,
    itemCount = 0,
    truthSource = "network"
  } = {}) {
    const metrics = ensureRuntimeMetricsState();
    if (!metrics) return;
    const startedAt = Number(requestStartedAt || 0);
    const now = Date.now();
    const durationMs = startedAt > 0 ? Math.max(0, now - startedAt) : 0;
    metrics.menuUsableMs = durationMs;
    metrics.menuUsableAt = now;
    metrics.menuUsableRestaurantId = String(restaurantId || "").trim();
    metrics.menuUsableSource = String(source || "public").trim().toLowerCase() || "public";
    metrics.menuUsableItems = Math.max(0, Number(itemCount || 0) || 0);
    metrics.menuUsableTruthSource = String(truthSource || "network").trim().toLowerCase() || "network";
  }

  function queueMenuPublicTruthRepair(restaurantId = "", items = [], { reason = "" } = {}) {
    const safeRestaurantId = String(restaurantId || "").trim();
    if (!safeRestaurantId) return;
    if (!publishMenuToPublicSafe) return;
    if (!Array.isArray(items) || !items.length) return;
    if (menuPublicRepairPendingIds.has(safeRestaurantId)) return;
    const now = Date.now();
    const lastRepairAt = Number(menuPublicRepairAtByRestaurant.get(safeRestaurantId) || 0);
    if (now - lastRepairAt < 120000) return;
    menuPublicRepairAtByRestaurant.set(safeRestaurantId, now);
    menuPublicRepairPendingIds.add(safeRestaurantId);
    Promise.resolve(publishMenuToPublicSafe(safeRestaurantId, items))
      .then(() => {
        const metrics = ensureRuntimeMetricsState();
        if (!metrics) return;
        metrics.menuPublicRepairCount = Math.max(0, Number(metrics.menuPublicRepairCount || 0) || 0) + 1;
        metrics.menuPublicRepairLastAt = Date.now();
        metrics.menuPublicRepairRestaurantId = safeRestaurantId;
        metrics.menuPublicRepairReason = String(reason || "").trim();
      })
      .catch((err) => {
        console.error(`[mnyra][menu.public-repair] ${safeRestaurantId}`, err);
      })
      .finally(() => {
        menuPublicRepairPendingIds.delete(safeRestaurantId);
      });
  }

  function resolveMenuStatusBadgeVisible(value, fallback = true) {
    if (typeof value === "boolean") return value;
    return !!fallback;
  }

  function updateMenuStatusBadgeState(restaurantId, visible) {
    const safeRestaurantId = String(restaurantId || "").trim();
    if (!safeRestaurantId) return;
    const nextVisible = resolveMenuStatusBadgeVisible(visible, true);
    ["collection", "public", "migration"].forEach((source) => {
      const cacheKey = menuCacheKeyFn(safeRestaurantId, source);
      if (!cacheKey) return;
      const cached = menuCacheMap.get(cacheKey);
      if (!cached) return;
      menuCacheMap.set(cacheKey, {
        ...cached,
        statusBadgeVisible: nextVisible,
        ts: Date.now()
      });
    });
    if (String(state?.menu?.restaurantId || "").trim() !== safeRestaurantId) return;
    if (state.menu.statusBadgeVisible === nextVisible) return;
    state.menu = {
      ...state.menu,
      statusBadgeVisible: nextVisible
    };
    requestRender();
  }

  function stopMenuMetaListener() {
    if (typeof menuMetaUnsub === "function") {
      try { menuMetaUnsub(); } catch {}
    }
    menuMetaUnsub = null;
    menuMetaRestaurantId = "";
  }

  function buildMenuPersistentCacheKey(restaurantId = "", source = "public") {
    const safeRestaurantId = String(restaurantId || "").trim();
    const safeSource = String(source || "public").trim().toLowerCase() || "public";
    if (!safeRestaurantId) return "";
    return `${menuPersistentCachePrefix}::${safeRestaurantId}::${safeSource}`;
  }

  function readMenuPersistentCache(restaurantId = "", source = "public", { ignoreTtl = false } = {}) {
    const cacheKey = buildMenuPersistentCacheKey(restaurantId, source);
    if (!cacheKey || typeof readCacheFn !== "function") {
      return { items: [], statusBadgeVisible: true, fresh: false };
    }
    const cached = readCacheFn(cacheKey, ignoreTtl ? null : menuPersistentCacheTtlMs);
    const data = Array.isArray(cached?.data) ? cached.data : [];
    const statusBadgeVisible = typeof cached?.meta?.statusBadgeVisible === "boolean"
      ? cached.meta.statusBadgeVisible
      : true;
    return {
      items: data,
      statusBadgeVisible,
      fresh: cached?.fresh === true
    };
  }

  function writeMenuPersistentCache(restaurantId = "", source = "public", items = [], { statusBadgeVisible = true } = {}) {
    const cacheKey = buildMenuPersistentCacheKey(restaurantId, source);
    if (!cacheKey || typeof writeCacheFn !== "function" || !Array.isArray(items)) return;
    writeCacheFn(cacheKey, items, {
      statusBadgeVisible: typeof statusBadgeVisible === "boolean" ? statusBadgeVisible : true
    });
  }

  function startMenuMetaListener(restaurantId) {
    const safeRestaurantId = String(restaurantId || "").trim();
    if (isQrGuestMenuSessionForRestaurant(safeRestaurantId)) {
      stopMenuMetaListener();
      return;
    }
    if (!safeRestaurantId || !db || !makeDocRef || !subscribeSnapshot) {
      stopMenuMetaListener();
      return;
    }
    if (menuMetaRestaurantId === safeRestaurantId && typeof menuMetaUnsub === "function") return;
    stopMenuMetaListener();
    menuMetaRestaurantId = safeRestaurantId;
    const ref = makeDocRef(db, "restaurants", safeRestaurantId, "public", "meta");
    menuMetaUnsub = subscribeSnapshot(ref, (snap) => {
      const data = snap?.exists?.() ? (snap.data() || {}) : {};
      updateMenuStatusBadgeState(
        safeRestaurantId,
        resolveMenuStatusBadgeVisible(data.menuStatusBadgeVisible, data.menuAvailabilityBadgeVisible)
      );
    }, (err) => {
      console.error(`[mnyra][firestore.listen.menuMeta] restaurants/${safeRestaurantId}/public/meta`, err);
    });
  }

  function loadUserScopedPersisted(user) {
    if (!user?.uid) return;
    const uid = user.uid;
    const savedProfile = safeStorage.getItem(profileKeyFn(uid));
    if (savedProfile) {
      try { state.userProfile = { ...defaultProfile, ...JSON.parse(savedProfile) }; } catch { state.userProfile = { ...defaultProfile }; }
    } else {
      state.userProfile = { ...defaultProfile };
    }
    state.userProfile.uid = uid;
    const authDisplayName = String(user.displayName || "").trim();
    const authEmail = String(user.email || "").trim();
    const fallbackAuthName = authDisplayName
      || (authEmail.includes("@")
        ? authEmail.split("@")[0].replace(/[._-]+/g, " ").trim()
        : authEmail)
      || "";
    const currentName = String(state.userProfile.name || "").trim();
    const normalizedCurrentName = currentName.toLowerCase();
    if ((!currentName || normalizedCurrentName === "user" || normalizedCurrentName === "business") && fallbackAuthName) {
      state.userProfile.name = fallbackAuthName;
    }
    const currentHandle = String(state.userProfile.handle || "").trim();
    if (!currentHandle) {
      const handleSeed = String(authEmail.split("@")[0] || fallbackAuthName || "").trim();
      if (handleSeed) {
        state.userProfile.handle = normalizeFollowHandleFn(handleSeed);
      }
    }
    if (!String(state.userProfile.email || "").trim() && authEmail) {
      state.userProfile.email = authEmail;
    }
    if (!String(state.userProfile.avatar || "").trim() && String(user.photoURL || "").trim()) {
      state.userProfile.avatar = String(user.photoURL || "").trim();
    }

    setUserAvatarCacheFn("");
    setLastShellAvatarUrlFn("");
    loadAvatarCacheFn(uid);
    const userAvatarCacheValue = getUserAvatarCacheFn();
    if (!state.userProfile.avatar && userAvatarCacheValue && !isPlaceholderUrlFn(userAvatarCacheValue)) {
      state.userProfile.avatar = userAvatarCacheValue;
    }
    if (userAvatarCacheValue && !isPlaceholderUrlFn(userAvatarCacheValue)) {
      setLastShellAvatarUrlFn(userAvatarCacheValue);
    }

    try {
      const raw = state.userProfile.avatar || userAvatarCacheValue || "";
      const url = getOptimizedImageUrlFn(raw, "avatar");
      if (url && !isPlaceholderUrlFn(url)) {
        primeSelfAvatarCacheFn(url);
      }
    } catch {}

    const userPostsCache = readCacheFn(userPostsKeyFn(uid));
    state.userPosts = userPostsCache?.data?.length
      ? projectPostCollectionThroughEntityMap(state, userPostsCache.data)
      : [];

    const rid = state.userProfile.restaurantId || "";
    if (rid) {
      const businessCache = readCacheFn(businessPostsKeyFn(rid));
      state.businessPosts = businessCache?.data?.length
        ? projectPostCollectionThroughEntityMap(state, businessCache.data)
        : [];
    } else {
      state.businessPosts = [];
    }

    const scopedNotifs = safeStorage.getItem(notificationsKeyFn(uid));
    if (scopedNotifs) {
      try { state.notifications = JSON.parse(scopedNotifs); } catch { state.notifications = []; }
    } else {
      const legacyNotifs = safeStorage.getItem(storageKeys.notifications);
      if (legacyNotifs) {
        try {
          state.notifications = JSON.parse(legacyNotifs);
          safeStorage.setItem(notificationsKeyFn(uid), JSON.stringify(state.notifications));
          safeStorage.removeItem(storageKeys.notifications);
        } catch {
          state.notifications = [];
        }
      } else {
        state.notifications = [];
      }
    }

    const scopedFollowing = safeStorage.getItem(followingKeyFn(uid));
    if (scopedFollowing) {
      try {
        const parsed = JSON.parse(scopedFollowing);
        const handlesRaw = Array.isArray(parsed)
          ? parsed
          : (Array.isArray(parsed?.handles) ? parsed.handles : []);
        const targetIdsRaw = Array.isArray(parsed?.targetIds) ? parsed.targetIds : [];
        state.followingHandles = Array.from(new Set(
          handlesRaw
            .map((item) => normalizeFollowHandleFn(item))
            .filter(Boolean)
        ));
        state.followingTargetIds = Array.from(new Set(
          targetIdsRaw
            .map((id) => String(id || "").trim())
            .filter(Boolean)
        ));
      } catch {
        state.followingHandles = [];
        state.followingTargetIds = [];
      }
    } else {
      const legacyFollowing = safeStorage.getItem(storageKeys.following);
      if (legacyFollowing) {
        try {
          state.followingHandles = Array.from(new Set(
            (JSON.parse(legacyFollowing) || [])
              .map((item) => normalizeFollowHandleFn(item))
              .filter(Boolean)
          ));
          state.followingTargetIds = [];
          saveFollowingFn(state.followingHandles, state.followingTargetIds);
          safeStorage.removeItem(storageKeys.following);
        } catch {
          state.followingHandles = [];
          state.followingTargetIds = [];
        }
      } else {
        state.followingHandles = [];
        state.followingTargetIds = [];
      }
    }

    const scopedCart = safeStorage.getItem(shopCartKeyFn(uid));
    if (scopedCart) {
      try {
        state.shopCart = normalizeShopCartStateFn(JSON.parse(scopedCart));
      } catch {
        state.shopCart = createEmptyShopCartFn();
      }
    } else {
      state.shopCart = createEmptyShopCartFn();
    }
    state.orders = createEmptyOrdersStateFn();

    state.chatThreads = sortChatThreadsFn(loadChatThreadIndexFn(uid).map((thread) => {
      const messages = loadChatThreadMessagesFn(thread);
      const lastMessage = messages[messages.length - 1] || null;
      return {
        ...thread,
        lastMessage: lastMessage ? buildChatPreviewTextFn(lastMessage) : String(thread?.lastMessage || ""),
        updatedAt: lastMessage
          ? Math.max(getChatMessageTimestampFn(lastMessage), Number(thread?.updatedAt || 0))
          : Number(thread?.updatedAt || Date.now())
      };
    }));
    saveChatThreadIndexFn(state.chatThreads);
  }

  function loadGuestScopedPersisted() {
    const currentGuestScopeUid = resolveGuestScopeUid();
    if (!currentGuestScopeUid) {
      state.shopCart = createEmptyShopCartFn();
      state.orders = createEmptyOrdersStateFn();
      return;
    }
    pruneLegacyGlobalGuestCartStorage(currentGuestScopeUid);
    const scopedCart = safeStorage.getItem(shopCartKeyFn(currentGuestScopeUid));
    if (scopedCart) {
      try {
        state.shopCart = normalizeShopCartStateFn(JSON.parse(scopedCart));
      } catch {
        state.shopCart = createEmptyShopCartFn();
      }
    } else {
      state.shopCart = createEmptyShopCartFn();
    }
    state.orders = createEmptyOrdersStateFn();
  }

  function resetUserScopedState() {
    stopActiveChatMessagesListenerFn();
    stopRestaurantMetaListenersFn();
    stopMenuItemMetaListenersFn();
    stopMenuMetaListener();
    setMenuDetailCloseBoundFn(false);
    state.__authProfileLoadPromise = null;
    state.__authProfileLoadUid = "";
    state.__skipNextAuthProfileEnsureUid = "";
    state.__skipNextAuthProfileEnsureTab = "";
    commentAvatarCacheMap.clear();
    commentAvatarPendingMap.clear();
    userSearchAvatarCacheMap.clear();
    businessProfileCacheMap.clear();
    userProfileCacheMap.clear();
    clearPostEntityMap(state);
    state.feedPosts = projectPostCollectionThroughEntityMap(state, state.feedPosts);
    state.postMeta = {};
    state.bootstrapRestaurantPreview = [];
    state.userPosts = [];
    state.businessPosts = [];
    state.profileView = null;
    state.profileModal = { open: false, profile: null };
    state.chatSettingsOpen = false;
    state.chatListScope = "inbox";
    state.chatThreadMenuId = "";
    state.chatModal = { open: false, profile: null, messages: [], draft: "", attachments: [] };
    state.postModal = { open: false, post: null, commentText: "", replyTo: null, loading: false, animate: false, sending: false };
    state.likesModal = { open: false, postId: "", animate: false };
    state.menuDetail = createEmptyMenuDetailStateFn();
    state.menuItemMeta = {};
    requestedMenuItemCounts.clear();
    state.leads = createEmptyLeadsStateFn();
    state.customers = createEmptyCustomersStateFn();
    state.staff = {
      items: [],
      view: "list",
      editorUid: "",
      loading: false,
      loadingMore: false,
      hasMore: false,
      pageSize: crmPageSize,
      saving: false,
      deleting: false,
      error: "",
      status: "",
      form: {
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        country: ceoCountries[0],
        locationLabel: "",
        coords: null,
        avatarUrl: "",
        avatarPreview: "",
        avatarFile: null
      }
    };
    state.businessAccounts = {
      items: [],
      view: "list",
      editorUid: "",
      loading: false,
      saving: false,
      deleting: false,
      loaded: false,
      error: "",
      status: "",
      form: {
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        role: "waiter",
        businessAccess: false,
        waiterAccess: true,
        active: true
      }
    };
    state.leadModal = { open: false, mode: "create", lead: null, status: "", loading: false, deleting: false, actionsOpen: false, logoFile: null, logoPreview: "", coords: null, locations: [] };
    state.customerModal = { open: false, mode: "edit", customer: null, status: "", loading: false, logoFile: null, logoPreview: "" };
    state.selectedBusiness = null;
    state.tableQr = {
      restaurantId: "",
      enabled: true,
      count: 0,
      loaded: false,
      loading: false,
      saving: false,
      error: "",
      status: "",
      verifiedAt: 0
    };
    state.followingHandles = [];
    state.followingTargetIds = [];
    state.pendingFollowRequests = [];
    state.chatThreads = [];
    state.shopCart = createEmptyShopCartFn();
    state.orders = createEmptyOrdersStateFn();
    state.favoriteMenuItems = createEmptyFavoriteMenuItemsStateFn();
    state.notifications = [];
    state.roleSwitchRoles = [];
    state.roleSwitchRestaurantId = "";
    state.userProfile = { ...defaultProfile };
    setUserAvatarCacheFn("");
    setLastShellAvatarUrlFn("");
    dataLoaded.profile = false;
    dataLoaded.following = false;
    dataLoaded.notifications = false;
    dataLoaded.leads = false;
    dataLoaded.customers = false;
    dataLoaded.staff = false;
    dataLoaded.businessAccounts = false;
  }

  async function loadRestaurants({ force = false } = {}) {
    const buildRestaurantIdentitySignature = (items = []) => buildRestaurantTruthSignatureCore(items);
    const refreshRestaurantDependentViews = () => {
      const visibleLeafletMap = getLastRenderModeFn() === "main"
        && typeof document !== "undefined"
        && !!document.getElementById("leafletMap");
      rebuildBusinessLocationsFn();
      if (getLastRenderModeFn() === "main") updateShellDomFn();
      syncFeedPostLogosFn();
      if (!state.stories.length) {
        refreshFeedStoriesFn({ force: true });
      }
      scheduleStoriesRefresh({ force: false, refreshUi: state.activeTab === "feed" });
      if (state.activeTab !== "map" && !visibleLeafletMap) {
        cleanupLeafletFn();
      }
      const inMain = getLastRenderModeFn() === "main";
      const updatedFeed = state.activeTab === "feed" && inMain && updateFeedDomFn();
      const updatedSearch = state.activeTab === "search" && inMain && refreshSearchViewFn();
      if (!updatedFeed && !updatedSearch) {
        if (!inMain) {
          requestRender();
        } else if (visibleLeafletMap) {
          requestRender();
        } else if (state.activeTab === "map") {
          requestRender();
        } else if (state.activeTab === "feed" || state.activeTab === "search") {
          requestRender();
        }
      }
    };
    const applyRestaurants = (list = [], { shouldWriteCache = false } = {}) => {
      if (!Array.isArray(list)) return;
      const canonicalList = filterCanonicalRestaurants(list);
      if (shouldWriteCache) writeCacheFn(cacheKeys.restaurants, canonicalList);
      state.restaurants = canonicalList;
      if (canonicalList.length && Array.isArray(state.bootstrapRestaurantPreview) && state.bootstrapRestaurantPreview.length) {
        state.bootstrapRestaurantPreview = [];
        if (cacheKeys?.restaurantsPreview) {
          writeCacheFn(cacheKeys.restaurantsPreview, []);
        }
      }
      refreshRestaurantDependentViews();
    };
    const reconcileRestaurantMeta = (seed = [], { shouldWriteCache = false } = {}) => {
      if (!Array.isArray(seed) || !seed.length) return;
      const canonicalSeed = filterCanonicalRestaurants(seed);
      if (!canonicalSeed.length) return;
      const seedSignature = buildRestaurantIdentitySignature(canonicalSeed);
      void Promise.resolve(enrichRestaurantsWithPublicMetaFn(canonicalSeed))
        .then((enriched) => {
          const canonicalEnriched = filterCanonicalRestaurants(enriched);
          if (!canonicalEnriched.length) return;
          const nextSignature = buildRestaurantIdentitySignature(canonicalEnriched);
          if (nextSignature === seedSignature) return;
          if (nextSignature === buildRestaurantIdentitySignature(state.restaurants)) return;
          applyRestaurants(canonicalEnriched, { shouldWriteCache });
        })
        .catch(() => null);
    };

    const cached = readCacheFn(cacheKeys.restaurants, cacheTtl.restaurants);
    if (cached?.data?.length) {
      if (!state.restaurants.length) {
        applyRestaurants(cached.data);
        reconcileRestaurantMeta(cached.data, { shouldWriteCache: true });
      }
      if (cached.fresh && !force) {
        return;
      }
    }
    if (!db || typeof collectionFn !== "function" || typeof queryFn !== "function" || typeof getDocsFn !== "function") return;
    if (restaurantsNetworkLoadPromise) {
      await restaurantsNetworkLoadPromise;
      return;
    }
    restaurantsNetworkLoadPromise = (async () => {
      try {
        const snap = await getDocsFn(queryFn(collectionFn(db, "restaurants")));
        const rawList = [];
        snap.forEach((docSnap) => rawList.push({ id: docSnap.id, ...docSnap.data() }));
        applyRestaurants(rawList, { shouldWriteCache: true });
        reconcileRestaurantMeta(rawList, { shouldWriteCache: true });
      } catch (err) {
        console.error(err);
      }
    })().finally(() => {
      restaurantsNetworkLoadPromise = null;
    });
    await restaurantsNetworkLoadPromise;
  }

  async function loadFeedPosts({ force = false } = {}) {
    const cached = readCacheFn(cacheKeys.feed, cacheTtl.feed);
    if (cached?.data?.length) {
      const wasEmpty = !state.feedPosts.length;
      if (wasEmpty) {
        state.feedPosts = projectPostCollectionThroughEntityMap(state, cached.data);
      }
      syncFeedPostLogosFn();
      const storiesUpdated = state.stories.length ? false : refreshFeedStoriesFn({ force: wasEmpty });
      scheduleStoriesRefresh({ force, refreshUi: state.activeTab === "feed" });
      if (wasEmpty || storiesUpdated) {
        const inMain = getLastRenderModeFn() === "main";
        const updatedFeed = state.activeTab === "feed" && inMain && updateFeedDomFn();
        if (updatedFeed) return;
        if (!inMain) {
          requestRender();
          return;
        }
        if (state.activeTab === "feed") {
          requestRender();
        }
      }
      preloadFeedHeroImagesFn(state.feedPosts);
      if (cached.fresh && !force) {
        if (!feedFreshReconcileQueued) {
          feedFreshReconcileQueued = true;
          queueMicrotask(() => {
            void loadFeedPosts({ force: true })
              .finally(() => {
                feedFreshReconcileQueued = false;
              });
          });
        }
        return;
      }
    }

    if (!db || typeof collectionFn !== "function" || typeof queryFn !== "function" || typeof limitFn !== "function" || typeof getDocsFn !== "function") return;
    if (feedNetworkLoadPromise) {
      await feedNetworkLoadPromise;
      return;
    }
    feedNetworkLoadPromise = (async () => {
      try {
        const ref = collectionFn(db, "socialFeed");
        let snap = null;
        try {
          snap = await getDocsFn(queryFn(ref, whereFn("status", "==", "active"), orderByFn("createdAt", "desc"), limitFn(fastLimits.feed)));
        } catch (err) {
          snap = await getDocsFn(queryFn(ref, limitFn(fastLimits.feedFallback)));
        }
        const rows = [];
        snap.forEach((docSnap) => rows.push({ id: docSnap.id, ...docSnap.data() }));
        const hydrationIds = collectFeedHydrationIdsFn(rows, { max: 8 });
        if (hydrationIds.length) {
          void hydrateRestaurantsByIdsFn(hydrationIds, { max: hydrationIds.length });
        }
        const next = rows
          .filter((row) => (row.status || "active") === "active")
          .map((row) => normalizeFeedPostFn(row))
          .filter(Boolean)
          .sort((a, b) => (toDateSafeFn(b.createdAt)?.getTime() || 0) - (toDateSafeFn(a.createdAt)?.getTime() || 0));
        const cachedFeed = readCacheFn(cacheKeys.feed);
        saveFeedPostsFn(next, { lastDeltaCheck: cachedFeed?.meta?.lastDeltaCheck || 0 });

        const feedChanged = havePostCollectionsChanged(state.feedPosts, next);
        state.feedPosts = projectPostCollectionThroughEntityMap(state, next);
        const storiesChanged = state.stories.length ? false : refreshFeedStoriesFn({ posts: next });
        scheduleStoriesRefresh({ force, refreshUi: state.activeTab === "feed" });
        preloadFeedHeroImagesFn(next);
        if (!feedChanged && !storiesChanged) return;
        const inMain = getLastRenderModeFn() === "main";
        const updatedFeed = state.activeTab === "feed" && inMain && updateFeedDomFn();
        if (updatedFeed) return;
        const updatedSearch = state.activeTab === "search" && inMain && refreshSearchViewFn();
        if (updatedSearch) return;
        if (!inMain) {
          requestRender();
          return;
        }
        if (state.activeTab === "feed" || state.activeTab === "search") {
          requestRender();
        }
      } catch (err) {
        console.error(err);
      }
    })().finally(() => {
      feedNetworkLoadPromise = null;
    });
    await feedNetworkLoadPromise;
  }

  async function loadUserPosts({ force = false } = {}) {
    if (!state.user) return;
    const cacheTtlPosts = cacheTtl.posts;
    const cacheKey = userPostsKeyFn(state.user.uid);
    const cached = readCacheFn(cacheKey, cacheTtlPosts);
      if (cached?.data?.length) {
        if (!state.userPosts.length) {
        state.userPosts = projectPostCollectionThroughEntityMap(state, cached.data.map((post) => ({
          ...post,
          ownerType: post.ownerType || "user",
          ownerId: post.ownerId || state.user.uid
        })));
        requestRender();
      }
      if (cached.fresh && !force) return;
    }
    if (!db || typeof collectionFn !== "function" || typeof queryFn !== "function" || typeof getDocsFn !== "function") return;
    try {
      const ref = collectionFn(db, "users", state.user.uid, "posts");
      let snap = null;
      try {
        snap = await getDocsFn(queryFn(ref, orderByFn("createdAt", "desc"), limitFn(fastLimits.profilePosts || fastLimits.userPosts)));
      } catch (err) {
        snap = await getDocsFn(ref);
      }
      const rows = [];
      snap.forEach((docSnap) => rows.push({ id: docSnap.id, ...docSnap.data() }));
      const next = rows.map((row) => ({
        id: row.id,
        url: row.url,
        type: row.type || "square",
        title: row.title || "",
        caption: row.caption || "",
        createdAt: row.createdAt,
        likes: row.likesCount ?? row.likes ?? 0,
        comments: row.commentsCount ?? row.comments ?? 0,
        isVideo: !!row.isVideo,
        ownerType: "user",
        ownerId: state.user.uid
      }));
      writeCacheFn(cacheKey, next);
      if (!havePostCollectionsChanged(state.userPosts, next)) return;
      state.userPosts = projectPostCollectionThroughEntityMap(state, next);
      requestRender();
    } catch (err) {
      console.error(err);
    }
  }

  async function loadBusinessPosts({ force = false } = {}) {
    const restaurantId = state.userProfile.restaurantId;
    if (!restaurantId) {
      state.businessPosts = [];
      requestRender();
      return;
    }
    const cacheKey = businessPostsKeyFn(restaurantId);
    const cached = readCacheFn(cacheKey, cacheTtl.posts);
    if (cached?.data?.length) {
      if (!state.businessPosts.length) {
        state.businessPosts = projectPostCollectionThroughEntityMap(state, cached.data.map((post) => ({
          ...post,
          ownerType: post.ownerType || "restaurant",
          ownerId: post.ownerId || restaurantId,
          restaurantId: post.restaurantId || restaurantId
        })));
        requestRender();
      }
      if (cached.fresh && !force) return;
    }
    if (!db || typeof collectionFn !== "function" || typeof queryFn !== "function" || typeof getDocsFn !== "function") return;
    try {
      const ref = collectionFn(db, "restaurants", restaurantId, "socialPosts");
      let snap = null;
      try {
        snap = await getDocsFn(queryFn(ref, orderByFn("createdAt", "desc"), limitFn(fastLimits.profilePosts || fastLimits.businessPosts)));
      } catch (err) {
        snap = await getDocsFn(ref);
      }
      const rows = [];
      snap.forEach((docSnap) => rows.push({ id: docSnap.id, ...docSnap.data() }));
      const next = rows
        .filter((row) => (row.status || "active") === "active")
        .map((row) => ({
          id: row.id,
          url: row.media?.[0]?.url || row.mediaUrl || "",
          type: row.type || "square",
          title: "",
          caption: row.caption || "",
          createdAt: row.createdAt,
          likes: row.likesCount ?? row.likes ?? 0,
          comments: row.commentsCount ?? row.comments ?? 0,
          isVideo: row.media?.[0]?.type === "video",
          ownerType: "restaurant",
          ownerId: restaurantId,
          restaurantId
        }))
        .filter((row) => row.url);
      writeCacheFn(cacheKey, next);
      if (!havePostCollectionsChanged(state.businessPosts, next)) return;
      state.businessPosts = projectPostCollectionThroughEntityMap(state, next);
      requestRender();
    } catch (err) {
      console.error(err);
    }
  }

  async function loadFocusForRestaurant(restaurantId, { force = false } = {}) {
    if (!restaurantId) {
      state.focus = { ...state.focus, restaurantId: "", items: [], loading: false, error: "" };
      return;
    }
    const cacheKey = focusCacheKeyFn(restaurantId);
    const cached = focusCacheMap.get(cacheKey);
    if (cached && cached.items?.length && !force) {
      state.focus = { ...state.focus, restaurantId, items: cached.items, enabled: cached.enabled, loading: false, error: "", index: 0 };
      return;
    }
    state.focus = { ...state.focus, restaurantId, loading: true, error: "" };
    requestRender();
    try {
      const [items, enabled] = await Promise.all([
        loadFocusItemsFn(restaurantId),
        loadFocusMetaFn(restaurantId)
      ]);
      focusCacheMap.set(cacheKey, { items, enabled, ts: Date.now() });
      state.focus = { ...state.focus, restaurantId, items, enabled, loading: false, error: "", index: 0 };
      requestRender();
    } catch (err) {
      console.error(err);
      state.focus = { ...state.focus, restaurantId, items: [], loading: false, error: "Fokus laden fehlgeschlagen." };
      requestRender();
    }
  }

  async function loadMenuForRestaurant(restaurantId, { force = false, source = "public", background = false } = {}) {
    const safeRestaurantId = String(restaurantId || "").trim();
    const sourceRaw = String(source || "public").trim().toLowerCase();
    const safeSource = sourceRaw === "collection"
      ? "collection"
      : (sourceRaw === "migration" ? "migration" : "public");
    const requestStartedAt = Date.now();
    const buildMenuTruthSignature = (items = [], statusBadgeVisible = true) => {
      const list = Array.isArray(items) ? items : [];
      const rows = list.map((item, idx) => {
        const id = String(item?.id || item?.itemId || item?.menuItemId || `item_${idx}`).trim();
        const orderIndex = Number.isFinite(Number(item?.orderIndex)) ? Number(item.orderIndex) : idx;
        const name = String(item?.name || "").trim();
        const price = String(item?.price ?? "").trim();
        const available = item?.available === false ? "0" : "1";
        const hidden = (item?.menuHidden === true || item?.hidden === true) ? "1" : "0";
        return `${id}#${orderIndex}#${name}#${price}#${available}#${hidden}`;
      });
      return `${list.length}|${statusBadgeVisible ? "1" : "0"}|${rows.join("||")}`;
    };
    const queueMenuFreshReconcile = () => {
      if (force) return;
      if (lightweightQrGuestFlow) return;
      if (!cacheKey) return;
      if (menuFreshReconcileQueuedKeys.has(cacheKey)) return;
      const now = Date.now();
      const lastRunAt = Number(menuFreshReconcileAtByKey.get(cacheKey) || 0);
      if (now - lastRunAt < 20000) return;
      menuFreshReconcileAtByKey.set(cacheKey, now);
      menuFreshReconcileQueuedKeys.add(cacheKey);
      const defer = typeof queueMicrotask === "function"
        ? queueMicrotask
        : (fn) => Promise.resolve().then(fn);
      defer(() => {
        void loadMenuForRestaurant(safeRestaurantId, {
          force: true,
          source: safeSource,
          background: true
        }).finally(() => {
          menuFreshReconcileQueuedKeys.delete(cacheKey);
        });
      });
    };
    const lightweightQrGuestFlow = isQrGuestMenuSessionForRestaurant(safeRestaurantId);
    if (!safeRestaurantId) {
      stopMenuMetaListener();
      state.menu = {
        ...state.menu,
        restaurantId: "",
        items: [],
        loading: false,
        error: "",
        source: safeSource,
        statusBadgeVisible: true
      };
      return;
    }
    if (lightweightQrGuestFlow) {
      stopMenuMetaListener();
    } else {
      startMenuMetaListener(safeRestaurantId);
    }
    const cacheKey = menuCacheKeyFn(safeRestaurantId, safeSource);
    const runBackground = background === true;
    const cached = menuCacheMap.get(cacheKey);
    if (cached && cached.items?.length && !force) {
      state.menu = {
        ...state.menu,
        restaurantId: safeRestaurantId,
        items: cached.items,
        loading: false,
        error: "",
        source: safeSource,
        statusBadgeVisible: typeof cached.statusBadgeVisible === "boolean" ? cached.statusBadgeVisible : true
      };
      requestRender();
      recordMenuUsableMetric({
        restaurantId: safeRestaurantId,
        source: safeSource,
        requestStartedAt,
        itemCount: Array.isArray(cached.items) ? cached.items.length : 0,
        truthSource: "memory-cache"
      });
      queueMenuFreshReconcile();
      return;
    }
    const persistedMenu = readMenuPersistentCache(safeRestaurantId, safeSource, { ignoreTtl: false });
    if (persistedMenu.items.length && !force) {
      state.menu = {
        ...state.menu,
        restaurantId: safeRestaurantId,
        items: persistedMenu.items,
        loading: false,
        error: "",
        source: safeSource,
        statusBadgeVisible: persistedMenu.statusBadgeVisible
      };
      menuCacheMap.set(cacheKey, {
        items: persistedMenu.items,
        statusBadgeVisible: persistedMenu.statusBadgeVisible,
        ts: Date.now()
      });
      requestRender();
      recordMenuUsableMetric({
        restaurantId: safeRestaurantId,
        source: safeSource,
        requestStartedAt,
        itemCount: Array.isArray(persistedMenu.items) ? persistedMenu.items.length : 0,
        truthSource: "persistent-cache"
      });
      queueMenuFreshReconcile();
      return;
    }
    const inFlight = menuNetworkLoadPromises.get(cacheKey);
    if (inFlight) {
      await inFlight;
      return;
    }
    const keepCurrentItems = state.menu.restaurantId === safeRestaurantId && Array.isArray(state.menu.items);
    if (!runBackground || !keepCurrentItems) {
      state.menu = {
        ...state.menu,
        restaurantId: safeRestaurantId,
        items: keepCurrentItems ? state.menu.items : [],
        loading: true,
        error: "",
        source: safeSource
      };
      requestRender();
    }
    const request = (async () => {
      try {
        let items = [];
        let statusBadgeVisible = true;
        const metaPromise = lightweightQrGuestFlow
          ? Promise.resolve({ statusBadgeVisible: true })
          : Promise.resolve(runMenuLoadWithBackoff(
            () => loadMenuMetaFn(safeRestaurantId),
            { attempts: 3, baseDelayMs: 180 }
          ))
          .catch((err) => {
            console.error(err);
            return { statusBadgeVisible: true };
          });
        if (safeSource === "collection") {
          items = await runMenuLoadWithBackoff(
            () => loadMenuItemsFromCollectionFn(safeRestaurantId),
            { attempts: 3, baseDelayMs: 220 }
          );
        } else if (safeSource === "migration") {
          items = await runMenuLoadWithBackoff(
            () => loadMenuHybridFn(safeRestaurantId),
            { attempts: 3, baseDelayMs: 240 }
          );
        } else {
          const publicItems = await runMenuLoadWithBackoff(
            () => loadPublicMenuItemsFn(safeRestaurantId),
            {
              attempts: lightweightQrGuestFlow ? 4 : 3,
              baseDelayMs: lightweightQrGuestFlow ? 260 : 220
            }
          );
          items = Array.isArray(publicItems) ? publicItems : [];
          const ownRestaurantId = String(state?.userProfile?.restaurantId || "").trim();
          const canRepairOwnPublicMenu = (
            !!String(state?.user?.uid || "").trim()
            && ownRestaurantId
            && ownRestaurantId === safeRestaurantId
          );
          let collectionItems = [];
          if (!items.length) {
            const hybridFallback = await runMenuLoadWithBackoff(
              () => loadMenuHybridFn(safeRestaurantId),
              { attempts: 2, baseDelayMs: 260 }
            ).catch(() => []);
            if (Array.isArray(hybridFallback) && hybridFallback.length) {
              items = hybridFallback;
            }
          }
          if (canRepairOwnPublicMenu) {
            collectionItems = await runMenuLoadWithBackoff(
              () => loadMenuItemsFromCollectionFn(safeRestaurantId),
              { attempts: 2, baseDelayMs: 200 }
            ).catch(() => []);
            if (Array.isArray(collectionItems) && collectionItems.length) {
              const publicSignature = buildMenuTruthSignature(items, true);
              const collectionSignature = buildMenuTruthSignature(collectionItems, true);
              const hasDrift = publicSignature !== collectionSignature;
              if (hasDrift) {
                const missingCount = Math.max(0, collectionItems.length - items.length);
                const metrics = ensureRuntimeMetricsState();
                if (metrics) {
                  metrics.menuMissingItemCount = missingCount;
                  metrics.menuDriftDetectedAt = Date.now();
                  metrics.menuDriftRestaurantId = safeRestaurantId;
                  metrics.menuDriftSource = "public_vs_collection";
                }
                items = collectionItems;
                queueMenuPublicTruthRepair(safeRestaurantId, collectionItems, {
                  reason: missingCount > 0 ? "collection_has_more_items" : "collection_public_drift"
                });
              } else {
                const metrics = ensureRuntimeMetricsState();
                if (metrics) {
                  metrics.menuMissingItemCount = 0;
                  metrics.menuDriftRestaurantId = safeRestaurantId;
                }
              }
            }
          }
        }
        const meta = await metaPromise;
        if (typeof meta?.statusBadgeVisible === "boolean") {
          statusBadgeVisible = meta.statusBadgeVisible;
        }
        menuCacheMap.set(cacheKey, { items, statusBadgeVisible, ts: Date.now() });
        writeMenuPersistentCache(safeRestaurantId, safeSource, items, { statusBadgeVisible });
        const liveItems = state.menu.restaurantId === safeRestaurantId && Array.isArray(state.menu.items)
          ? state.menu.items
          : [];
        const liveStatusBadgeVisible = typeof state.menu.statusBadgeVisible === "boolean"
          ? state.menu.statusBadgeVisible
          : true;
        const nextSignature = buildMenuTruthSignature(items, statusBadgeVisible);
        const liveSignature = buildMenuTruthSignature(liveItems, liveStatusBadgeVisible);
        const shouldUpdateMenuState = (
          nextSignature !== liveSignature
          || state.menu.loading
          || String(state.menu.error || "").trim().length > 0
          || state.menu.source !== safeSource
          || state.menu.restaurantId !== safeRestaurantId
        );
        if (shouldUpdateMenuState) {
          state.menu = {
            ...state.menu,
            restaurantId: safeRestaurantId,
            items,
            loading: false,
            error: "",
            source: safeSource,
            statusBadgeVisible
          };
          requestRender();
        }
        recordMenuUsableMetric({
          restaurantId: safeRestaurantId,
          source: safeSource,
          requestStartedAt,
          itemCount: Array.isArray(items) ? items.length : 0,
          truthSource: runBackground ? "background-reconcile" : "network"
        });
      } catch (err) {
        console.error(err);
        const hasLiveItems = state.menu.restaurantId === safeRestaurantId
          && Array.isArray(state.menu.items)
          && state.menu.items.length > 0;
        if (runBackground && hasLiveItems) {
          return;
        }
        const stalePersistedMenu = readMenuPersistentCache(safeRestaurantId, safeSource, { ignoreTtl: true });
        const fallbackItems = state.menu.restaurantId === safeRestaurantId && Array.isArray(state.menu.items)
          ? state.menu.items
          : stalePersistedMenu.items;
        const fallbackStatusBadgeVisible = typeof stalePersistedMenu.statusBadgeVisible === "boolean"
          ? stalePersistedMenu.statusBadgeVisible
          : true;
        state.menu = {
          ...state.menu,
          restaurantId: safeRestaurantId,
          items: fallbackItems,
          loading: false,
          error: fallbackItems.length ? "" : "Menu laden fehlgeschlagen.",
          source: safeSource,
          statusBadgeVisible: fallbackStatusBadgeVisible
        };
        requestRender();
        if (Array.isArray(fallbackItems) && fallbackItems.length) {
          recordMenuUsableMetric({
            restaurantId: safeRestaurantId,
            source: safeSource,
            requestStartedAt,
            itemCount: fallbackItems.length,
            truthSource: "fallback-cache"
          });
        }
      } finally {
        menuNetworkLoadPromises.delete(cacheKey);
      }
    })();
    menuNetworkLoadPromises.set(cacheKey, request);
    await request;
  }

  async function bootstrapUser(user) {
    await bootstrapAuthenticatedSessionCoreFn({
      user,
      loadAuthProfile: (currentUser) => loadAuthProfileFn(currentUser),
      markBootstrapAuthProfileLoaded: (currentUser, { activeTab = "" } = {}) => {
        const uid = String(currentUser?.uid || "").trim();
        const safeTab = String(activeTab || "").trim();
        if (!uid || (safeTab !== "profile" && safeTab !== "menu")) {
          state.__skipNextAuthProfileEnsureUid = "";
          state.__skipNextAuthProfileEnsureTab = "";
          return;
        }
        state.__skipNextAuthProfileEnsureUid = uid;
        state.__skipNextAuthProfileEnsureTab = safeTab;
      },
      getRestaurantId: () => state.userProfile.restaurantId || "",
      hydrateRestaurantsByIds: (ids, options) => hydrateRestaurantsByIdsFn(ids, options),
      resolveRoleSwitchTargets: (currentUser) => resolveRoleSwitchTargetsFn(currentUser),
      ensureFollowingLoaded: () => {
        if (!dataLoaded.following) dataLoaded.following = true;
      },
      startLiveListeners: (currentUser) => startLiveListenersFn(currentUser),
      ensureTabData: (tab) => ensureTabDataFn(tab),
      activeTab: () => state.activeTab
    });
  }

  return {
    loadPersisted,
    loadUserScopedPersisted,
    loadGuestScopedPersisted,
    resetUserScopedState,
    loadRestaurants,
    loadFeedPosts,
    loadUserPosts,
    loadBusinessPosts,
    loadFocusForRestaurant,
    loadMenuForRestaurant,
    bootstrapUser
  };
}
