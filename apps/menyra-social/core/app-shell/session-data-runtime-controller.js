import { clearPostEntityMap, projectPostCollectionThroughEntityMap } from "../profile/post-entity-registry-utils.js";
import { resolveVisibleProfileSurface } from "../profile/public-profile-surface-controller.js";
import { normalizeRestaurantPostDocCore, normalizeUserPostDocCore } from "../feed/post-doc-normalize-utils.js";
import {
  buildRestaurantTruthSignatureCore,
  isBootstrapRestaurantPreviewRecordCore
} from "../common/restaurant-identity-runtime-controller.js";
import {
  markMnyraLoadingEventCore as markLoadingEvent,
  timeMnyraLoadingAsyncCore as timeLoadingAsync
} from "../common/loading-diagnostics-utils.js";

function createDefaultTableQrState() {
  return {
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
}

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
  createEmptyTableQrStateFn = createDefaultTableQrState,
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
  loadDeadlines = {}
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
  let restaurantsFreshReconcileQueued = false;
  let feedFreshReconcileQueued = false;
  let restaurantsNetworkLoadPromise = null;
  let feedNetworkLoadPromise = null;
  let userPostsNetworkLoadPromise = null;
  let userPostsNetworkLoadUid = "";
  let businessPostsNetworkLoadPromise = null;
  let businessPostsNetworkLoadRestaurantId = "";
  const menuNetworkLoadPromises = new Map();
  const menuFreshReconcileQueuedKeys = new Set();
  const focusFreshReconcileQueuedKeys = new Set();
  let storiesRefreshQueued = false;
  let storiesRefreshForce = false;
  let storiesRefreshUi = false;
  let renderRequested = false;

  function resolveLoadDeadlineMs(key = "", fallbackMs = 0) {
    const deadlines = loadDeadlines && typeof loadDeadlines === "object" ? loadDeadlines : {};
    const direct = Number(deadlines[key]);
    if (Number.isFinite(direct) && direct > 0) return Math.max(1, Math.round(direct));
    const fallback = Number(fallbackMs);
    return Number.isFinite(fallback) && fallback > 0 ? Math.max(1, Math.round(fallback)) : 0;
  }

  function createLoadDeadlineError(scope = "firebase.load", timeoutMs = 0) {
    const safeScope = String(scope || "firebase.load").trim() || "firebase.load";
    const err = new Error(`${safeScope} timed out after ${Math.max(1, Math.round(Number(timeoutMs) || 0))}ms`);
    err.name = "MnyraLoadTimeoutError";
    err.code = "deadline-exceeded";
    err.scope = safeScope;
    return err;
  }

  function runWithLoadDeadline(task, { timeoutMs = 0, scope = "firebase.load" } = {}) {
    const runTask = typeof task === "function" ? task : (() => task);
    const safeTimeoutMs = Math.max(0, Math.round(Number(timeoutMs) || 0));
    if (!safeTimeoutMs) return Promise.resolve().then(() => runTask());
    return new Promise((resolve, reject) => {
      let settled = false;
      const timerId = setTimeout(() => {
        if (settled) return;
        settled = true;
        reject(createLoadDeadlineError(scope, safeTimeoutMs));
      }, safeTimeoutMs);
      Promise.resolve()
        .then(() => runTask())
        .then((value) => {
          if (settled) return;
          settled = true;
          clearTimeout(timerId);
          resolve(value);
        })
        .catch((err) => {
          if (settled) return;
          settled = true;
          clearTimeout(timerId);
          reject(err);
        });
    });
  }

  function addVisibleMenuTargetId(targetSet, value = "") {
    const safeValue = String(value || "").trim();
    if (safeValue) targetSet.add(safeValue);
  }

  function collectVisiblePublicMenuTargetIds() {
    const ids = new Set();
    const profile = state?.profileView?.profile && typeof state.profileView.profile === "object"
      ? state.profileView.profile
      : {};
    const routePayload = state?.profileView?.routePayload && typeof state.profileView.routePayload === "object"
      ? state.profileView.routePayload
      : {};
    const routeSnapshot = routePayload?.businessSnapshot && typeof routePayload.businessSnapshot === "object"
      ? routePayload.businessSnapshot
      : {};
    const routeIdentity = routePayload?.identity && typeof routePayload.identity === "object"
      ? routePayload.identity
      : {};
    const snapshotIdentity = routeSnapshot?.identity && typeof routeSnapshot.identity === "object"
      ? routeSnapshot.identity
      : {};
    const webDirectEntry = state?.__webDirectEntry && typeof state.__webDirectEntry === "object" && state.__webDirectEntry.active === true
      ? state.__webDirectEntry
      : {};
    [
      profile.canonicalRestaurantId,
      profile.restaurantId,
      profile.publicSlug,
      profile.landingSlug,
      profile.handle,
      routePayload.canonicalRestaurantId,
      routePayload.restaurantId,
      routePayload.publicSlug,
      routePayload.landingSlug,
      routeIdentity.publicSlug,
      routeIdentity.landingSlug,
      routeIdentity.handle,
      routeSnapshot.restaurantId,
      snapshotIdentity.publicSlug,
      snapshotIdentity.landingSlug,
      snapshotIdentity.handle,
      webDirectEntry.canonicalRestaurantId,
      webDirectEntry.restaurantId
    ].forEach((value) => addVisibleMenuTargetId(ids, value));
    return ids;
  }

  function resolveVisibleCanonicalPublicMenuRestaurantId() {
    const hasVisibleProfile = state?.profileView?.profile && typeof state.profileView.profile === "object";
    const profile = hasVisibleProfile
      ? state.profileView.profile
      : {};
    const routePayload = state?.profileView?.routePayload && typeof state.profileView.routePayload === "object"
      ? state.profileView.routePayload
      : {};
    const webDirectEntry = state?.__webDirectEntry && typeof state.__webDirectEntry === "object" && state.__webDirectEntry.active === true
      ? state.__webDirectEntry
      : {};
    const ownProfile = !hasVisibleProfile && state?.userProfile && typeof state.userProfile === "object"
      ? state.userProfile
      : {};
    return String(
      profile.canonicalRestaurantId
      || routePayload.canonicalRestaurantId
      || webDirectEntry.canonicalRestaurantId
      || ownProfile.canonicalRestaurantId
      || ownProfile.restaurantId
      || ""
    ).trim();
  }

  function isAuthoritativePublicMenuRead(restaurantId = "", source = "public") {
    const safeSource = String(source || "public").trim().toLowerCase() || "public";
    if (safeSource !== "public") return true;
    const safeRestaurantId = String(restaurantId || "").trim();
    const canonicalRestaurantId = resolveVisibleCanonicalPublicMenuRestaurantId();
    return !!safeRestaurantId
      && !!canonicalRestaurantId
      && safeRestaurantId === canonicalRestaurantId;
  }

  function resolveLoadedMenuTruthState(items = [], restaurantId = "", source = "public") {
    const safeItems = Array.isArray(items) ? items : [];
    if (safeItems.length > 0) return "seeded";
    return isAuthoritativePublicMenuRead(restaurantId, source) ? "knownEmpty" : "unknown";
  }

  function resolveVisibleMenuRetentionState(restaurantId = "", source = "public", { pendingCanonical = false } = {}) {
    if (!pendingCanonical) return null;
    const safeSource = String(source || "public").trim().toLowerCase() || "public";
    if (safeSource !== "public") return null;
    const safeRestaurantId = String(restaurantId || "").trim();
    if (!safeRestaurantId) return null;
    const currentMenuSource = String(state?.menu?.source || "").trim().toLowerCase() || "public";
    if (currentMenuSource !== "public") return null;
    const currentMenuRestaurantId = String(state?.menu?.restaurantId || "").trim();
    if (!currentMenuRestaurantId) return null;
    const visibleMenuTargetIds = collectVisiblePublicMenuTargetIds();
    const menuMatchesVisibleSurface = currentMenuRestaurantId === safeRestaurantId
      || visibleMenuTargetIds.has(currentMenuRestaurantId)
      || visibleMenuTargetIds.has(safeRestaurantId);
    const currentItems = Array.isArray(state?.menu?.items) ? state.menu.items : [];
    if (!menuMatchesVisibleSurface || !currentItems.length) return null;
    const currentTruthState = String(state?.menu?.truthState || "").trim().toLowerCase() || "seeded";
    return {
      items: currentItems,
      routeSeed: state?.menu?.routeSeed === true,
      truthState: currentTruthState
    };
  }

  function isQrGuestMenuSessionForRestaurant(restaurantId = "") {
    const hasUser = !!String(state?.user?.uid || "").trim();
    if (hasUser) return false;
    const activeTab = String(state?.activeTab || "").trim().toLowerCase();
    if (activeTab !== "profile") return false;
    const profileTopTab = String(state?.profileTopTab || "").trim().toLowerCase();
    if (profileTopTab !== "menu") return false;
    const menuAccessSource = String(state?.profileView?.menuAccessSource || "").trim().toLowerCase();
    if (menuAccessSource !== "qr") return false;
    const targetRestaurantId = String(restaurantId || "").trim();
    if (!targetRestaurantId) return true;
    const visibleTargetIds = collectVisiblePublicMenuTargetIds();
    if (visibleTargetIds.size > 0) {
      return visibleTargetIds.has(targetRestaurantId);
    }
    const expectedRestaurantId = String(
      state?.profileView?.profile?.canonicalRestaurantId
      || state?.profileView?.profile?.restaurantId
      || state?.profileView?.restaurantId
      || ""
    ).trim();
    if (!expectedRestaurantId) return true;
    return expectedRestaurantId === targetRestaurantId;
  }

  function isVisiblePublicMenuSurface(restaurantId = "", source = "public") {
    const safeSource = String(source || "public").trim().toLowerCase();
    if (safeSource !== "public") return false;
    const activeTab = String(state?.activeTab || "").trim().toLowerCase();
    if (activeTab !== "profile") return false;
    const profileTopTab = String(state?.profileTopTab || "").trim().toLowerCase();
    if (profileTopTab !== "menu") return false;
    const visibleRestaurantId = String(
      state?.profileView?.profile?.canonicalRestaurantId
      || state?.profileView?.profile?.restaurantId
      || state?.profileView?.restaurantId
      || ""
    ).trim();
    const targetRestaurantId = String(restaurantId || "").trim();
    if (!targetRestaurantId || !visibleRestaurantId) return true;
    return collectVisiblePublicMenuTargetIds().has(targetRestaurantId);
  }

  function isPublicProfileMenuVisible() {
    return String(state?.activeTab || "").trim().toLowerCase() === "profile"
      && String(state?.profileTopTab || "").trim().toLowerCase() === "menu";
  }

  function shouldCommitVisiblePublicMenuState(restaurantId = "", source = "public") {
    const safeSource = String(source || "public").trim().toLowerCase();
    if (safeSource !== "public") return true;
    if (!isPublicProfileMenuVisible()) return true;
    const canonicalRestaurantId = resolveVisibleCanonicalPublicMenuRestaurantId();
    if (canonicalRestaurantId && String(restaurantId || "").trim() !== canonicalRestaurantId) return false;
    return isVisiblePublicMenuSurface(restaurantId, safeSource);
  }

  function shouldCommitVisiblePublicFocusState(restaurantId = "") {
    if (!isPublicProfileMenuVisible()) return true;
    return isVisiblePublicMenuSurface(restaurantId, "public");
  }

  function shouldUseRealtimeMenuMetaListener(restaurantId = "", source = "public") {
    const safeSource = String(source || "public").trim().toLowerCase();
    const hasAuthenticatedUser = !!String(state?.user?.uid || "").trim();
    if (!hasAuthenticatedUser && safeSource === "public") return false;
    if (isQrGuestMenuSessionForRestaurant(restaurantId)) return false;
    return true;
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

  function normalizeTravelBusinessType(value = "") {
    return String(value || "")
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "");
  }

  function isTravelBusinessRecord(record = {}) {
    if (!record || typeof record !== "object") return false;
    const typeKey = normalizeTravelBusinessType(
      record.type
      || record.customerType
      || record.category
      || record.kind
      || record.restaurantType
      || record.businessProfileType
      || record.profileType
      || record.vertical
      || record.leadType
      || ""
    );
    if (["hotel", "hotels", "motel", "motels", "travel", "hostel", "resort", "accommodation"].includes(typeKey)) {
      return true;
    }
    const searchable = [
      record.name,
      record.restaurantName,
      record.businessName,
      record.description,
      record.bio,
      record.about
    ].map((value) => String(value || "").trim().toLowerCase()).join(" ");
    return /\bhotel(s)?\b|\bmotel(s)?\b|\bhostel\b|\bresort\b|\baccommodation\b/.test(searchable);
  }

  function hasKnownTravelOffersTruth(record = {}) {
    const truthState = String(record?.offersTruthState || "").trim().toLowerCase();
    if (truthState === "seeded" || truthState === "knownempty" || truthState === "known-empty") return true;
    if (Array.isArray(record?.publicOffers) || Array.isArray(record?.travelOffers) || Array.isArray(record?.offerItems)) return true;
    if (Number.isFinite(Number(record?.publicOffersCount)) || Number.isFinite(Number(record?.travelOffersCount))) return true;
    if (typeof record?.hasTravelOffers === "boolean") return true;
    return false;
  }

  function hasTravelOfferPayload(record = {}) {
    return Array.isArray(record?.publicOffers) || Array.isArray(record?.travelOffers) || Array.isArray(record?.offerItems);
  }

  function hasKnownAdsTruth(record = {}) {
    const truthState = String(record?.adsTruthState || "").trim().toLowerCase();
    if (truthState === "seeded" || truthState === "knownempty" || truthState === "known-empty") return true;
    if (Array.isArray(record?.publicAds) || Array.isArray(record?.restaurantAds)) return true;
    if (Number.isFinite(Number(record?.publicAdsCount)) || Number.isFinite(Number(record?.approvedAdsCount))) return true;
    if (typeof record?.hasApprovedAds === "boolean") return true;
    return false;
  }

  function hasAdsPayload(record = {}) {
    return Array.isArray(record?.publicAds) || Array.isArray(record?.restaurantAds);
  }

  function getRestaurantIdentityId(record = {}) {
    return String(record?.id || record?.restaurantId || record?.canonicalRestaurantId || "").trim();
  }

  function preserveKnownTravelOffersTruth(incoming = {}, previous = {}) {
    if (!incoming || typeof incoming !== "object") return incoming;
    if (!isTravelBusinessRecord(incoming)) return incoming;
    if (hasTravelOfferPayload(incoming)) return incoming;
    if (!hasTravelOfferPayload(previous)) return incoming;

    const next = { ...incoming };
    [
      "publicOffers",
      "travelOffers",
      "offerItems",
      "publicOffersCount",
      "travelOffersCount",
      "hasTravelOffers",
      "offersTruthState"
    ].forEach((key) => {
      if (Object.prototype.hasOwnProperty.call(previous, key)) {
        next[key] = previous[key];
      }
    });
    return next;
  }

  function preserveKnownAdsTruth(incoming = {}, previous = {}) {
    if (!incoming || typeof incoming !== "object") return incoming;
    if (hasAdsPayload(incoming)) return incoming;
    if (!hasKnownAdsTruth(previous)) return incoming;

    const next = { ...incoming };
    [
      "publicAds",
      "restaurantAds",
      "publicAdsCount",
      "approvedAdsCount",
      "hasApprovedAds",
      "adsTruthState"
    ].forEach((key) => {
      if (Object.prototype.hasOwnProperty.call(previous, key)) {
        next[key] = previous[key];
      }
    });
    return next;
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
    if (isTravelBusinessRecord(record) && !hasKnownTravelOffersTruth(record)) return true;
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

  function mergeBootstrapRestaurantPreviewSeed(existing = [], incoming = []) {
    const byId = new Map();
    (Array.isArray(existing) ? existing : []).forEach((row) => {
      const id = String(row?.id || "").trim();
      if (!id) return;
      byId.set(id, row);
    });
    (Array.isArray(incoming) ? incoming : []).forEach((row) => {
      const id = String(row?.id || row?.restaurantId || "").trim();
      if (!id) return;
      const previous = byId.get(id) || {};
      byId.set(id, {
        ...previous,
        ...row,
        id,
        __truthSource: previous.__truthSource || "cache-preview",
        __truthPartial: true,
        __isPreview: true
      });
    });
    return Array.from(byId.values());
  }

  function hydrateRouteFirstRestaurantSeedFromCache() {
    const previewCache = readCacheFn(cacheKeys.restaurantsPreview);
    if (previewCache?.data?.length) {
      const existingPreview = Array.isArray(state.bootstrapRestaurantPreview)
        ? state.bootstrapRestaurantPreview
        : [];
      const mergedPreview = mergeBootstrapRestaurantPreviewSeed(existingPreview, previewCache.data);
      const prevSignature = buildRestaurantTruthSignatureCore(existingPreview);
      const nextSignature = buildRestaurantTruthSignatureCore(mergedPreview);
      if (nextSignature && nextSignature !== prevSignature) {
        state.bootstrapRestaurantPreview = mergedPreview;
      }
    }
    const restaurantsCache = readCacheFn(cacheKeys.restaurants);
    if (restaurantsCache?.data?.length) {
      const canonicalCachedRestaurants = filterCanonicalRestaurants(restaurantsCache.data);
      if (canonicalCachedRestaurants.length) {
        const previousSignature = buildRestaurantTruthSignatureCore(state.restaurants || []);
        const nextSignature = buildRestaurantTruthSignatureCore(canonicalCachedRestaurants);
        if (nextSignature && nextSignature !== previousSignature) {
          state.restaurants = canonicalCachedRestaurants;
        }
      }
    }
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

  function loadPersisted(options = {}) {
    const safeOptions = options && typeof options === "object" ? options : {};
    const phase = String(safeOptions.phase || safeOptions.mode || "").trim().toLowerCase();
    const isCriticalPhase = phase === "critical";
    const isDeferredPhase = phase === "deferred";
    const activeTabKey = String(state.activeTab || "").trim().toLowerCase();
    const profileTopTabKey = String(state.profileTopTab || "").trim().toLowerCase();
    const webDirectEntry = state?.__webDirectEntry && typeof state.__webDirectEntry === "object" && state.__webDirectEntry.active === true
      ? state.__webDirectEntry
      : null;
    const webDirectVisibleProfilePath = activeTabKey === "profile"
      && webDirectEntry?.active === true
      && webDirectEntry?.webPriority === true
      && (profileTopTabKey === "profile" || profileTopTabKey === "menu");
    const prioritizeProfileSurface = activeTabKey === "profile"
      && (profileTopTabKey === "profile" || profileTopTabKey === "menu");
    const shouldRefreshVisibleFeedSurface = () => {
      const tabKey = String(state.activeTab || "").trim().toLowerCase();
      return tabKey === "feed" || tabKey === "search";
    };
    loadLogoCacheFn();
    const savedSettings = safeStorage.getItem(storageKeys.settings);
    if (savedSettings) {
      try { state.settings = { ...defaultSettings, ...JSON.parse(savedSettings) }; } catch {}
    }
    const savedMenuLayout = safeStorage.getItem(storageKeys.menuLayout);
    const deferMenuLayoutHydration = prioritizeProfileSurface;
    if (savedMenuLayout && !deferMenuLayoutHydration) {
      try { state.menuLayout = { ...defaultMenuLayout, ...JSON.parse(savedMenuLayout) }; } catch {}
    }
    state.postMeta = {};
    if (isCriticalPhase && prioritizeProfileSurface) {
      hydrateRouteFirstRestaurantSeedFromCache();
      return;
    }
    if (isDeferredPhase && webDirectVisibleProfilePath) {
      return;
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

    scheduleIdleFn(() => {
      if (state.restaurants.length) {
        rebuildBusinessLocationsFn();
      }

      const feedUpdated = syncFeedPostLogosFn();
      const storiesUpdated = state.stories.length
        ? false
        : refreshFeedStoriesFn({ posts: state.feedPosts, force: true });
      preloadFeedHeroImagesFn(state.feedPosts);

      if (feedUpdated || storiesUpdated) {
        const inMain = getLastRenderModeFn() === "main";
        const updatedFeed = state.activeTab === "feed" && inMain && updateFeedDomFn();
        if (!updatedFeed && shouldRefreshVisibleFeedSurface()) requestRender();
      }

      if (needsRestaurantMetaHydration) {
        state.__restaurantsMetaHydrating = true;
        if (String(state.activeTab || "").trim().toLowerCase() === "travel") requestRender();
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
              if (!updatedFeed && shouldRefreshVisibleFeedSurface()) requestRender();
            }
          })
          .catch(() => null)
          .finally(() => {
            state.__restaurantsMetaHydrating = false;
            if (String(state.activeTab || "").trim().toLowerCase() === "travel") requestRender();
          });
      }

      if (cachedHydrationIds.length) {
        void hydrateRestaurantsByIdsFn(cachedHydrationIds, { max: cachedHydrationIds.length });
      }
    });
  }

  function scheduleStoriesRefresh({ force = false, refreshUi = false } = {}) {
    const activeTab = String(state?.activeTab || "").trim().toLowerCase();
    if (activeTab !== "feed") return;
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

  function syncVisibleProfileSurfaceState() {
    if (!state || typeof state !== "object") return;
    if (!state.profileView || typeof state.profileView !== "object") return;
    state.profileSurface = resolveVisibleProfileSurface(state);
  }

  function requestRender() {
    if (renderRequested) return;
    renderRequested = true;
    Promise.resolve().then(() => {
      renderRequested = false;
      syncVisibleProfileSurfaceState();
      renderFn();
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
      return { items: [], statusBadgeVisible: true, fresh: false, truthState: "unknown" };
    }
    const safeSource = String(source || "public").trim().toLowerCase() || "public";
    const cached = readCacheFn(cacheKey, ignoreTtl ? null : menuPersistentCacheTtlMs);
    if (
      safeSource === "public"
      && String(cached?.meta?.menuTruthSource || "").trim().toLowerCase() !== "public-menu"
    ) {
      return { items: [], statusBadgeVisible: true, fresh: false, truthState: "unknown" };
    }
    if (!ignoreTtl && cached?.fresh !== true) {
      return { items: [], statusBadgeVisible: true, fresh: false, truthState: "unknown" };
    }
    const data = Array.isArray(cached?.data) ? cached.data : [];
    const statusBadgeVisible = typeof cached?.meta?.statusBadgeVisible === "boolean"
      ? cached.meta.statusBadgeVisible
      : true;
    const cachedTruthStateRaw = String(cached?.meta?.menuTruthState || "").trim().toLowerCase();
    const truthState = data.length > 0
      ? "seeded"
      : (cachedTruthStateRaw === "knownempty" || cachedTruthStateRaw === "known-empty" ? "knownEmpty" : "unknown");
    return {
      items: data,
      statusBadgeVisible,
      fresh: cached?.fresh === true,
      truthState
    };
  }

  function writeMenuPersistentCache(restaurantId = "", source = "public", items = [], { statusBadgeVisible = true } = {}) {
    const cacheKey = buildMenuPersistentCacheKey(restaurantId, source);
    if (!cacheKey || typeof writeCacheFn !== "function" || !Array.isArray(items)) return;
    const safeSource = String(source || "public").trim().toLowerCase() || "public";
    writeCacheFn(cacheKey, items, {
      statusBadgeVisible: typeof statusBadgeVisible === "boolean" ? statusBadgeVisible : true,
      menuTruthSource: safeSource === "public" ? "public-menu" : safeSource,
      menuTruthState: items.length > 0 ? "seeded" : "knownEmpty"
    });
  }

  function isFreshMenuMemoryCacheEntry(cached = null, source = "public") {
    if (!cached || typeof cached !== "object") return false;
    const safeSource = String(source || "public").trim().toLowerCase() || "public";
    if (safeSource !== "public") return true;
    if (String(cached.truthSource || "").trim().toLowerCase() !== "public-menu") return false;
    const ts = Number(cached.ts || 0);
    if (menuPersistentCacheTtlMs <= 0) return true;
    return Number.isFinite(ts) && ts > 0 && Date.now() - ts <= menuPersistentCacheTtlMs;
  }

  function startMenuMetaListener(restaurantId, { source = "public" } = {}) {
    const safeRestaurantId = String(restaurantId || "").trim();
    if (!shouldUseRealtimeMenuMetaListener(safeRestaurantId, source)) {
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
    state.__authBootstrapInFlightUid = "";
    state.__authBootstrapSettledUid = "";
    state.__criticalProfilePreloadPromise = null;
    state.__criticalProfilePreloadUid = "";
    state.__userPostsLoadingUid = "";
    state.__businessPostsLoadingRestaurantId = "";
    state.__restaurantsLoading = false;
    state.__restaurantsMetaHydrating = false;
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
    state.hotelCardEditor = null;
    state.profileModal = { open: false, profile: null };
    state.chatSettingsOpen = false;
    state.chatListScope = "inbox";
    state.chatThreadMenuId = "";
    state.chatModal = { open: false, profile: null, messages: [], draft: "", attachments: [] };
    state.postModal = { open: false, post: null, commentText: "", replyTo: null, loading: false, animate: false, sending: false };
    state.likesModal = { open: false, postId: "", animate: false };
    state.menuDetail = createEmptyMenuDetailStateFn();
    state.menuItemMeta = {};
    // Analytics-Dashboard ist user-/business-gebunden: beim Account-Wechsel leeren.
    state.analyticsView = null;
    requestedMenuItemCounts.clear();
    state.leads = {};
    state.customers = {};
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
    state.selectedBusiness = null;
    state.tableQr = createEmptyTableQrStateFn();
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
    state.__userPostsLoadingUid = "";
    state.__businessPostsLoadingRestaurantId = "";
    userPostsNetworkLoadPromise = null;
    userPostsNetworkLoadUid = "";
    businessPostsNetworkLoadPromise = null;
    businessPostsNetworkLoadRestaurantId = "";
    setUserAvatarCacheFn("");
    setLastShellAvatarUrlFn("");
    dataLoaded.profile = false;
    dataLoaded.following = false;
    dataLoaded.notifications = false;
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
      const activeTab = String(state.activeTab || "").trim().toLowerCase();
      const isMarketplaceTab = activeTab === "restaurants" || activeTab === "travel" || activeTab === "shopping";
      if (!updatedFeed && !updatedSearch) {
        if (!inMain) {
          requestRender();
        } else if (state.activeTab === "map") {
          requestRender();
        } else if (state.activeTab === "feed" || state.activeTab === "search" || isMarketplaceTab) {
          requestRender();
        }
      }
    };
    const setRestaurantsLoading = (value = false) => {
      const nextValue = value === true;
      if (state.__restaurantsLoading === nextValue) return;
      state.__restaurantsLoading = nextValue;
      const activeTab = String(state.activeTab || "").trim().toLowerCase();
      if (activeTab === "restaurants" || activeTab === "travel" || activeTab === "shopping") {
        requestRender();
      }
    };
    const applyRestaurants = (list = [], { shouldWriteCache = false } = {}) => {
      if (!Array.isArray(list)) return;
      const previousById = new Map();
      (Array.isArray(state.restaurants) ? state.restaurants : []).forEach((record) => {
        const id = getRestaurantIdentityId(record);
        if (id) previousById.set(id, record);
      });
      const canonicalList = filterCanonicalRestaurants(list).map((record) => {
        const id = getRestaurantIdentityId(record);
        if (!id) return record;
        const previous = previousById.get(id) || {};
        return preserveKnownAdsTruth(preserveKnownTravelOffersTruth(record, previous), previous);
      });
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
      if (!Array.isArray(seed) || !seed.length) return Promise.resolve(false);
      const canonicalSeed = filterCanonicalRestaurants(seed);
      if (!canonicalSeed.length) return Promise.resolve(false);
      const seedSignature = buildRestaurantIdentitySignature(canonicalSeed);
      return Promise.resolve(enrichRestaurantsWithPublicMetaFn(canonicalSeed))
        .then((enriched) => {
          const canonicalEnriched = filterCanonicalRestaurants(enriched);
          if (!canonicalEnriched.length) return false;
          const nextSignature = buildRestaurantIdentitySignature(canonicalEnriched);
          if (nextSignature === seedSignature || nextSignature === buildRestaurantIdentitySignature(state.restaurants)) {
            if (shouldWriteCache) writeCacheFn(cacheKeys.restaurants, canonicalEnriched);
            return false;
          }
          applyRestaurants(canonicalEnriched, { shouldWriteCache });
          return true;
        })
        .catch(() => false);
    };

    setRestaurantsLoading(true);
    const cached = readCacheFn(cacheKeys.restaurants, cacheTtl.restaurants);
    if (cached?.data?.length) {
      if (!state.restaurants.length) {
        applyRestaurants(cached.data);
        void reconcileRestaurantMeta(cached.data, { shouldWriteCache: true });
      }
      if (cached.fresh && !force) {
        if (!restaurantsFreshReconcileQueued) {
          restaurantsFreshReconcileQueued = true;
          queueMicrotask(() => {
            void loadRestaurants({ force: true })
              .finally(() => {
                restaurantsFreshReconcileQueued = false;
              });
          });
        }
        return;
      }
    }
    if (!db || typeof collectionFn !== "function" || typeof queryFn !== "function" || typeof getDocsFn !== "function") {
      setRestaurantsLoading(false);
      return;
    }
    if (restaurantsNetworkLoadPromise) {
      await restaurantsNetworkLoadPromise;
      setRestaurantsLoading(false);
      return;
    }
    restaurantsNetworkLoadPromise = (async () => {
      try {
        const snap = await runWithLoadDeadline(
          () => getDocsFn(queryFn(collectionFn(db, "restaurants"))),
          { timeoutMs: 7000, scope: "restaurants.load" }
        );
        const rawList = [];
        snap.forEach((docSnap) => rawList.push({ id: docSnap.id, ...docSnap.data() }));
        applyRestaurants(rawList, { shouldWriteCache: false });
        await reconcileRestaurantMeta(rawList, { shouldWriteCache: true });
      } catch (err) {
        console.error(err);
      }
    })().finally(() => {
      restaurantsNetworkLoadPromise = null;
      setRestaurantsLoading(false);
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
    const uid = String(state.user.uid || "").trim();
    if (!uid) {
      if (state.__userPostsLoadingUid) {
        state.__userPostsLoadingUid = "";
      }
      return;
    }
    state.__userPostsLoadingUid = uid;
    const cacheTtlPosts = cacheTtl.posts;
    const cacheKey = userPostsKeyFn(uid);
    const cached = readCacheFn(cacheKey, cacheTtlPosts);
      if (cached?.data?.length) {
        if (!state.userPosts.length) {
        state.userPosts = projectPostCollectionThroughEntityMap(state, cached.data.map((post) => ({
          ...post,
          ownerType: post.ownerType || "user",
          ownerId: post.ownerId || uid
        })));
        requestRender();
      }
      if (cached.fresh && !force) {
        if (state.__userPostsLoadingUid === uid) {
          state.__userPostsLoadingUid = "";
        }
        return;
      }
    }
    if (!db || typeof collectionFn !== "function" || typeof queryFn !== "function" || typeof getDocsFn !== "function") {
      if (state.__userPostsLoadingUid === uid) {
        state.__userPostsLoadingUid = "";
      }
      return;
    }
    if (userPostsNetworkLoadPromise && userPostsNetworkLoadUid === uid) {
      await userPostsNetworkLoadPromise;
      return;
    }
    const request = (async () => {
      try {
        const ref = collectionFn(db, "users", uid, "posts");
        const userPostsLimit = Math.max(1, Number(fastLimits.userPosts) || 24);
        let snap = null;
        try {
          snap = typeof limitFn === "function"
            ? await getDocsFn(queryFn(ref, orderByFn("createdAt", "desc"), limitFn(userPostsLimit)))
            : await getDocsFn(queryFn(ref, orderByFn("createdAt", "desc")));
        } catch (err) {
          snap = typeof limitFn === "function"
            ? await getDocsFn(queryFn(ref, limitFn(userPostsLimit)))
            : await getDocsFn(ref);
        }
        const rows = [];
        snap.forEach((docSnap) => rows.push({ id: docSnap.id, ...docSnap.data() }));
        const next = rows.map((row) => normalizeUserPostDocCore(row.id, row, uid));
        writeCacheFn(cacheKey, next);
        if (!havePostCollectionsChanged(state.userPosts, next)) return;
        state.userPosts = projectPostCollectionThroughEntityMap(state, next);
        requestRender();
      } catch (err) {
        console.error(err);
      }
    })().finally(() => {
      if (userPostsNetworkLoadPromise === request) {
        userPostsNetworkLoadPromise = null;
        userPostsNetworkLoadUid = "";
      }
      if (state.__userPostsLoadingUid === uid) {
        state.__userPostsLoadingUid = "";
      }
      requestRender();
    });
    userPostsNetworkLoadPromise = request;
    userPostsNetworkLoadUid = uid;
    await request;
  }

  async function loadBusinessPosts({ force = false } = {}) {
    const restaurantId = String(state.userProfile.restaurantId || "").trim();
    if (!restaurantId) {
      if (state.__businessPostsLoadingRestaurantId) {
        state.__businessPostsLoadingRestaurantId = "";
      }
      const activeUid = String(state.user?.uid || "").trim();
      const bootstrapUid = String(state.__authBootstrapInFlightUid || "").trim();
      const isAuthBootstrapProfilePending = !!activeUid && bootstrapUid === activeUid;
      if (isAuthBootstrapProfilePending) return;
      if (Array.isArray(state.businessPosts) && state.businessPosts.length) {
        state.businessPosts = [];
        requestRender();
      }
      return;
    }
    state.__businessPostsLoadingRestaurantId = restaurantId;
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
      if (cached.fresh && !force) {
        if (state.__businessPostsLoadingRestaurantId === restaurantId) {
          state.__businessPostsLoadingRestaurantId = "";
        }
        return;
      }
    }
    if (!db || typeof collectionFn !== "function" || typeof queryFn !== "function" || typeof getDocsFn !== "function") {
      if (state.__businessPostsLoadingRestaurantId === restaurantId) {
        state.__businessPostsLoadingRestaurantId = "";
      }
      return;
    }
    if (businessPostsNetworkLoadPromise && businessPostsNetworkLoadRestaurantId === restaurantId) {
      await businessPostsNetworkLoadPromise;
      return;
    }
    markLoadingEvent("socialPosts load requested", {
      restaurantId,
      source: "restaurants.socialPosts"
    });
    const request = (async () => {
      try {
        const ref = collectionFn(db, "restaurants", restaurantId, "socialPosts");
        const businessPostsLimit = Math.max(1, Number(fastLimits.businessPosts) || 24);
        let snap = null;
        try {
          snap = await timeLoadingAsync("socialPosts load", () => (
            typeof limitFn === "function"
              ? getDocsFn(queryFn(ref, orderByFn("createdAt", "desc"), limitFn(businessPostsLimit)))
              : getDocsFn(queryFn(ref, orderByFn("createdAt", "desc")))
          ), {
            restaurantId,
            source: "restaurants.socialPosts"
          });
        } catch (err) {
          snap = await timeLoadingAsync("socialPosts load fallback", () => (
            typeof limitFn === "function"
              ? getDocsFn(queryFn(ref, limitFn(businessPostsLimit)))
              : getDocsFn(ref)
          ), {
            restaurantId,
            source: "restaurants.socialPosts"
          });
        }
        const rows = [];
        snap.forEach((docSnap) => rows.push({ id: docSnap.id, ...docSnap.data() }));
        const next = rows
          .filter((row) => (row.status || "active") === "active")
          .map((row) => normalizeRestaurantPostDocCore(row.id, row, restaurantId))
          .filter((row) => row.url);
        writeCacheFn(cacheKey, next);
        if (!havePostCollectionsChanged(state.businessPosts, next)) return;
        state.businessPosts = projectPostCollectionThroughEntityMap(state, next);
        requestRender();
      } catch (err) {
        console.error(err);
      }
    })().finally(() => {
      if (businessPostsNetworkLoadPromise === request) {
        businessPostsNetworkLoadPromise = null;
        businessPostsNetworkLoadRestaurantId = "";
      }
      if (state.__businessPostsLoadingRestaurantId === restaurantId) {
        state.__businessPostsLoadingRestaurantId = "";
      }
      requestRender();
    });
    businessPostsNetworkLoadPromise = request;
    businessPostsNetworkLoadRestaurantId = restaurantId;
    await request;
  }

  async function loadFocusForRestaurant(restaurantId, { force = false, prefetchOnly = false } = {}) {
    if (!restaurantId) {
      if (prefetchOnly) return { items: [], enabled: true, truthSource: "public-menu", truthState: "unknown" };
      state.focus = { ...state.focus, restaurantId: "", items: [], loading: false, error: "", truthState: "unknown" };
      return;
    }
    if (!prefetchOnly && !shouldCommitVisiblePublicFocusState(restaurantId)) {
      return loadFocusForRestaurant(restaurantId, { force, prefetchOnly: true });
    }
    const cacheKey = focusCacheKeyFn(restaurantId);
    const queueFreshFocusReconcile = () => {
      if (prefetchOnly || focusFreshReconcileQueuedKeys.has(cacheKey)) return;
      focusFreshReconcileQueuedKeys.add(cacheKey);
      queueMicrotask(() => {
        void loadFocusForRestaurant(restaurantId, { force: true })
          .finally(() => {
            focusFreshReconcileQueuedKeys.delete(cacheKey);
          });
      });
    };
    const cached = focusCacheMap.get(cacheKey);
    const cachedTruthState = String(cached?.truthState || "").trim().toLowerCase();
    if (
      cached
      && (cached.items?.length || cachedTruthState === "knownempty" || cachedTruthState === "known-empty")
      && String(cached.truthSource || "").trim().toLowerCase() === "public-menu"
      && !force
    ) {
      const cachedItems = Array.isArray(cached.items) ? cached.items : [];
      const cachedPayload = {
        items: cachedItems,
        enabled: cached.enabled,
        truthSource: "public-menu",
        truthState: cachedItems.length ? "seeded" : "knownEmpty"
      };
      if (prefetchOnly) return cachedPayload;
      if (!shouldCommitVisiblePublicFocusState(restaurantId)) return cachedPayload;
      state.focus = {
        ...state.focus,
        restaurantId,
        items: cachedPayload.items,
        enabled: cachedPayload.enabled,
        loading: false,
        error: "",
        index: 0,
        truthSource: cachedPayload.truthSource,
        truthState: cachedPayload.truthState
      };
      if (isVisiblePublicMenuSurface(restaurantId, "public")) {
        requestRender();
      }
      queueFreshFocusReconcile();
      return cachedPayload;
    }
    if (prefetchOnly) {
      try {
        const [items, enabled] = await Promise.all([
          timeLoadingAsync("public/offers load", () => runWithLoadDeadline(
            () => loadFocusItemsFn(restaurantId),
            {
              timeoutMs: resolveLoadDeadlineMs("focusItemsMs", 2600),
              scope: "public/offers"
            }
          ), {
            restaurantId,
            prefetchOnly: true,
            source: "public/offers"
          }),
          runWithLoadDeadline(
            () => loadFocusMetaFn(restaurantId),
            {
              timeoutMs: resolveLoadDeadlineMs("focusMetaMs", 1800),
              scope: "public/offers-meta"
            }
          ).catch((err) => {
            console.error(err);
            return true;
          })
        ]);
        const safeItems = Array.isArray(items) ? items : [];
        const truthState = safeItems.length > 0 ? "seeded" : "knownEmpty";
        const payload = { items: safeItems, enabled, truthSource: "public-menu", truthState };
        focusCacheMap.set(cacheKey, { ...payload, ts: Date.now() });
        return payload;
      } catch (err) {
        console.error(err);
        return { items: [], enabled: true, truthSource: "public-menu", truthState: "unknown" };
      }
    }
    const sameRestaurant = state.focus.restaurantId === restaurantId;
    const stableItems = sameRestaurant && Array.isArray(state.focus.items)
      ? state.focus.items.slice()
      : [];
    const stableEnabled = sameRestaurant
      ? state.focus.enabled !== false
      : true;
    if (shouldCommitVisiblePublicFocusState(restaurantId)) {
      state.focus = {
        ...state.focus,
        restaurantId,
        items: stableItems,
        enabled: stableEnabled,
        loading: true,
        error: "",
        truthSource: "public-menu",
        truthState: stableItems.length ? "seeded" : "unknown"
      };
      requestRender();
    }
    try {
      const [items, enabled] = await Promise.all([
        timeLoadingAsync("public/offers load", () => runWithLoadDeadline(
          () => loadFocusItemsFn(restaurantId),
          {
            timeoutMs: resolveLoadDeadlineMs("focusItemsMs", 2600),
            scope: "public/offers"
          }
        ), {
          restaurantId,
          source: "public/offers"
        }),
        runWithLoadDeadline(
          () => loadFocusMetaFn(restaurantId),
          {
            timeoutMs: resolveLoadDeadlineMs("focusMetaMs", 1800),
            scope: "public/offers-meta"
          }
        ).catch((err) => {
          console.error(err);
          return true;
        })
      ]);
      const safeItems = Array.isArray(items) ? items : [];
      const truthState = safeItems.length > 0 ? "seeded" : "knownEmpty";
      const payload = { items: safeItems, enabled, truthSource: "public-menu", truthState };
      focusCacheMap.set(cacheKey, { ...payload, ts: Date.now() });
      if (!shouldCommitVisiblePublicFocusState(restaurantId)) return payload;
      state.focus = {
        ...state.focus,
        restaurantId,
        items: safeItems,
        enabled,
        loading: false,
        error: "",
        index: 0,
        truthSource: "public-menu",
        truthState
      };
      requestRender();
      return payload;
    } catch (err) {
      console.error(err);
      const fallbackItems = state.focus.restaurantId === restaurantId && Array.isArray(state.focus.items)
        ? state.focus.items
        : stableItems;
      const hasFallbackItems = fallbackItems.length > 0;
      const fallbackPayload = {
        items: fallbackItems,
        enabled: state.focus.enabled !== false,
        truthSource: hasFallbackItems ? state.focus.truthSource : "public-menu",
        truthState: hasFallbackItems ? "seeded" : "unknown"
      };
      if (!shouldCommitVisiblePublicFocusState(restaurantId)) return fallbackPayload;
      state.focus = {
        ...state.focus,
        restaurantId,
        items: fallbackItems,
        enabled: fallbackPayload.enabled,
        loading: false,
        error: hasFallbackItems ? "" : "Fokus laden fehlgeschlagen.",
        truthSource: fallbackPayload.truthSource,
        truthState: fallbackPayload.truthState
      };
      requestRender();
      return fallbackPayload;
    }
  }

  async function loadMenuForRestaurant(restaurantId, { force = false, source = "public", prefetchOnly = false } = {}) {
    const safeRestaurantId = String(restaurantId || "").trim();
    const sourceRaw = String(source || "public").trim().toLowerCase();
    const safeSource = sourceRaw === "collection"
      ? "collection"
      : (sourceRaw === "migration" ? "migration" : "public");
    const timeMenuItemsLoad = (label, task, meta = {}) => timeLoadingAsync(label, task, {
      restaurantId: safeRestaurantId,
      source: safeSource,
      ...meta
    });
    const lightweightQrGuestFlow = isQrGuestMenuSessionForRestaurant(safeRestaurantId);
    if (!safeRestaurantId) {
      if (prefetchOnly) return { items: [], statusBadgeVisible: true, truthState: "unknown" };
      stopMenuMetaListener();
      state.menu = {
        ...state.menu,
        restaurantId: "",
        items: [],
        loading: false,
        error: "",
        source: safeSource,
        statusBadgeVisible: true,
        routeSeed: false,
        truthState: "unknown"
      };
      return;
    }
    if (prefetchOnly && safeSource !== "public") {
      return { items: [], statusBadgeVisible: true, truthState: "unknown" };
    }
    if (!prefetchOnly && !shouldCommitVisiblePublicMenuState(safeRestaurantId, safeSource)) {
      return loadMenuForRestaurant(safeRestaurantId, { force, source: safeSource, prefetchOnly: true });
    }
    if (!prefetchOnly) {
      if (!shouldUseRealtimeMenuMetaListener(safeRestaurantId, safeSource)) {
        stopMenuMetaListener();
      } else {
        startMenuMetaListener(safeRestaurantId, { source: safeSource });
      }
    }
    const visibleMenuTargetIds = collectVisiblePublicMenuTargetIds();
    const currentMenuRestaurantId = String(state?.menu?.restaurantId || "").trim();
    const currentMenuSource = String(state?.menu?.source || "").trim().toLowerCase() || "public";
    const menuStateMatchesVisibleSurface = currentMenuSource === safeSource
      && !!currentMenuRestaurantId
      && (
        currentMenuRestaurantId === safeRestaurantId
        || visibleMenuTargetIds.has(currentMenuRestaurantId)
      );
    const hasVisibleMenuItems = menuStateMatchesVisibleSurface
      && Array.isArray(state.menu.items)
      && state.menu.items.length > 0;
    const currentMenuTruthState = String(state?.menu?.truthState || "").trim().toLowerCase();
    const hasVisibleSettledMenuTruth = menuStateMatchesVisibleSurface
      && (
        currentMenuTruthState === "seeded"
        || currentMenuTruthState === "knownempty"
        || currentMenuTruthState === "known-empty"
      );
    const hasRouteBootstrapMenuSeed = hasVisibleMenuItems
      && state.menu.routeSeed === true;
    const webDirectEntry = state?.__webDirectEntry && typeof state.__webDirectEntry === "object" && state.__webDirectEntry.active === true
      ? state.__webDirectEntry
      : null;
    const webDirectEntryRestaurantId = String(
      webDirectEntry?.canonicalRestaurantId
      || webDirectEntry?.restaurantId
      || ""
    ).trim();
    const webDirectMenuFirstVisiblePath = safeSource === "public"
      && webDirectEntry?.active === true
      && webDirectEntry?.menuFirst === true
      && (
        webDirectEntryRestaurantId === safeRestaurantId
        || visibleMenuTargetIds.has(safeRestaurantId)
      )
      && String(state?.activeTab || "").trim().toLowerCase() === "profile"
      && String(state?.profileTopTab || "").trim().toLowerCase() === "menu";
    const webDirectMenuFreshPath = webDirectMenuFirstVisiblePath
      && webDirectEntry?.webPriority === true;
    const shouldPreserveVisibleMenuTruth = hasRouteBootstrapMenuSeed || hasVisibleSettledMenuTruth;
    const blockWebDirectMenuCacheSeed = webDirectMenuFreshPath && !force && shouldPreserveVisibleMenuTruth;
    const prioritizeVisibleMenuTruth = !force
      && isVisiblePublicMenuSurface(safeRestaurantId, safeSource)
      && shouldPreserveVisibleMenuTruth;
    const shouldPrioritizeVisibleMenuTruth = prioritizeVisibleMenuTruth;
    const cacheKey = menuCacheKeyFn(safeRestaurantId, safeSource);
    const queueFreshMenuReconcile = () => {
      if (menuFreshReconcileQueuedKeys.has(cacheKey)) return;
      menuFreshReconcileQueuedKeys.add(cacheKey);
      queueMicrotask(() => {
        void loadMenuForRestaurant(safeRestaurantId, { force: true, source: safeSource })
          .finally(() => {
            menuFreshReconcileQueuedKeys.delete(cacheKey);
          });
      });
    };
    const cached = menuCacheMap.get(cacheKey);
    const canUseMemoryMenuCache = isFreshMenuMemoryCacheEntry(cached, safeSource);
    const cachedItems = Array.isArray(cached?.items) ? cached.items : [];
    const cachedTruthState = String(cached?.truthState || "").trim().toLowerCase();
    const hasKnownEmptyMemoryMenu = cachedTruthState === "knownempty" || cachedTruthState === "known-empty";
    const hasAuthoritativeKnownEmptyMemoryMenu = hasKnownEmptyMemoryMenu
      && isAuthoritativePublicMenuRead(safeRestaurantId, safeSource);
    if (cached && canUseMemoryMenuCache && (cachedItems.length || hasAuthoritativeKnownEmptyMemoryMenu) && !force && !shouldPrioritizeVisibleMenuTruth && !blockWebDirectMenuCacheSeed) {
      const cachedPayload = {
        items: cachedItems,
        statusBadgeVisible: typeof cached.statusBadgeVisible === "boolean" ? cached.statusBadgeVisible : true,
        truthState: cachedItems.length ? "seeded" : "knownEmpty"
      };
      if (prefetchOnly) return cachedPayload;
      if (!shouldCommitVisiblePublicMenuState(safeRestaurantId, safeSource)) return cachedPayload;
      state.menu = {
        ...state.menu,
        restaurantId: safeRestaurantId,
        items: cachedPayload.items,
        loading: false,
        error: "",
        source: safeSource,
        statusBadgeVisible: cachedPayload.statusBadgeVisible,
        routeSeed: false,
        truthState: cachedPayload.truthState
      };
      requestRender();
      queueFreshMenuReconcile();
      return cachedPayload;
    }
    const persistedMenu = readMenuPersistentCache(safeRestaurantId, safeSource, { ignoreTtl: false });
    const hasKnownEmptyPersistedMenu = persistedMenu.truthState === "knownEmpty"
      && isAuthoritativePublicMenuRead(safeRestaurantId, safeSource);
    if ((persistedMenu.items.length || hasKnownEmptyPersistedMenu) && !force && !shouldPrioritizeVisibleMenuTruth && !blockWebDirectMenuCacheSeed) {
      const persistedPayload = {
        items: persistedMenu.items,
        statusBadgeVisible: persistedMenu.statusBadgeVisible,
        truthState: persistedMenu.items.length ? "seeded" : "knownEmpty"
      };
      if (prefetchOnly) {
        menuCacheMap.set(cacheKey, {
          items: persistedPayload.items,
          statusBadgeVisible: persistedPayload.statusBadgeVisible,
          truthSource: safeSource === "public" ? "public-menu" : safeSource,
          truthState: persistedPayload.truthState,
          ts: Date.now()
        });
        return persistedPayload;
      }
      if (!shouldCommitVisiblePublicMenuState(safeRestaurantId, safeSource)) return persistedPayload;
      state.menu = {
        ...state.menu,
        restaurantId: safeRestaurantId,
        items: persistedPayload.items,
        loading: false,
        error: "",
        source: safeSource,
        statusBadgeVisible: persistedPayload.statusBadgeVisible,
        routeSeed: false,
        truthState: persistedPayload.truthState
      };
      menuCacheMap.set(cacheKey, {
        items: persistedPayload.items,
        statusBadgeVisible: persistedPayload.statusBadgeVisible,
        truthSource: safeSource === "public" ? "public-menu" : safeSource,
        truthState: persistedPayload.truthState,
        ts: Date.now()
      });
      requestRender();
      queueFreshMenuReconcile();
      return persistedPayload;
    }
    const inFlight = menuNetworkLoadPromises.get(cacheKey);
    if (inFlight) {
      const inFlightResult = await inFlight;
      const inFlightItems = Array.isArray(inFlightResult?.items) ? inFlightResult.items : [];
      const inFlightTruthState = String(inFlightResult?.truthState || "").trim();
      const inFlightTruthKey = inFlightTruthState.toLowerCase();
      const inFlightKnownEmpty = inFlightTruthKey === "knownempty" || inFlightTruthKey === "known-empty";
      const inFlightPendingCanonical = inFlightResult?.pendingCanonical === true;
      const resolvedInFlightTruthState = inFlightItems.length
        ? "seeded"
        : ((inFlightKnownEmpty || inFlightPendingCanonical)
          ? resolveLoadedMenuTruthState(inFlightItems, safeRestaurantId, safeSource)
          : "unknown");
      const inFlightUnknown = resolvedInFlightTruthState === "unknown";
      if (
        !prefetchOnly
        && inFlightResult
        && Array.isArray(inFlightResult.items)
        && shouldCommitVisiblePublicMenuState(safeRestaurantId, safeSource)
      ) {
        const retentionState = resolveVisibleMenuRetentionState(safeRestaurantId, safeSource, {
          pendingCanonical: inFlightUnknown && inFlightPendingCanonical
        });
        state.menu = {
          ...state.menu,
          restaurantId: safeRestaurantId,
          items: retentionState ? retentionState.items : inFlightItems,
          loading: retentionState ? true : (inFlightUnknown && inFlightPendingCanonical),
          error: inFlightUnknown && !inFlightPendingCanonical ? "Menu laden fehlgeschlagen." : "",
          source: safeSource,
          statusBadgeVisible: typeof inFlightResult.statusBadgeVisible === "boolean"
            ? inFlightResult.statusBadgeVisible
            : true,
          routeSeed: retentionState ? retentionState.routeSeed : false,
          truthState: retentionState ? retentionState.truthState : resolvedInFlightTruthState
        };
        requestRender();
      }
      return inFlightResult;
    }
    if (prefetchOnly) {
      const request = (async () => {
        try {
          const [itemsResult, meta] = await Promise.all([
            timeMenuItemsLoad(
              "public/menu load",
              () => runWithLoadDeadline(
                () => runMenuLoadWithBackoff(
                  () => loadPublicMenuItemsFn(safeRestaurantId),
                  {
                    attempts: lightweightQrGuestFlow ? 4 : 3,
                    baseDelayMs: lightweightQrGuestFlow ? 140 : 220
                  }
                ),
                {
                  timeoutMs: resolveLoadDeadlineMs("menuItemsMs", lightweightQrGuestFlow ? 4200 : 5200),
                  scope: "public/menu"
                }
              ),
              { prefetchOnly: true }
            ),
            Promise.resolve(runMenuLoadWithBackoff(
              () => runWithLoadDeadline(
                () => loadMenuMetaFn(safeRestaurantId),
                {
                  timeoutMs: resolveLoadDeadlineMs("menuMetaMs", 1800),
                  scope: "public/menu-meta"
                }
              ),
              { attempts: 3, baseDelayMs: 180 }
            ))
              .catch((err) => {
                console.error(err);
                return { statusBadgeVisible: true };
              })
          ]);
          const items = Array.isArray(itemsResult) ? itemsResult : [];
          const statusBadgeVisible = typeof meta?.statusBadgeVisible === "boolean"
            ? meta.statusBadgeVisible
            : true;
          const truthState = resolveLoadedMenuTruthState(items, safeRestaurantId, safeSource);
          const pendingCanonical = !items.length && truthState === "unknown";
          const payload = { items, statusBadgeVisible, truthState, pendingCanonical };
          if (truthState !== "unknown") {
            menuCacheMap.set(cacheKey, {
              ...payload,
              truthSource: "public-menu",
              ts: Date.now()
            });
            writeMenuPersistentCache(safeRestaurantId, safeSource, items, { statusBadgeVisible });
          }
          return payload;
        } catch (err) {
          console.error(err);
          return { items: [], statusBadgeVisible: true, truthState: "unknown" };
        } finally {
          menuNetworkLoadPromises.delete(cacheKey);
        }
      })();
      menuNetworkLoadPromises.set(cacheKey, request);
      return await request;
    }
    const keepCurrentItems = menuStateMatchesVisibleSurface
      && Array.isArray(state.menu.items)
      && (!blockWebDirectMenuCacheSeed || state.menu.items.length > 0)
      && (!shouldPrioritizeVisibleMenuTruth || state.menu.items.length > 0);
    if (shouldCommitVisiblePublicMenuState(safeRestaurantId, safeSource)) {
      state.menu = {
        ...state.menu,
        restaurantId: safeRestaurantId,
        items: keepCurrentItems ? state.menu.items : [],
        loading: true,
        error: "",
        source: safeSource,
        routeSeed: keepCurrentItems ? state.menu.routeSeed === true : false,
        truthState: keepCurrentItems
          ? String(state.menu.truthState || "").trim().toLowerCase() || "seeded"
          : "unknown"
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
            () => runWithLoadDeadline(
              () => loadMenuMetaFn(safeRestaurantId),
              {
                timeoutMs: resolveLoadDeadlineMs("menuMetaMs", 1800),
                scope: "public/menu-meta"
              }
            ),
            { attempts: 3, baseDelayMs: 180 }
          ))
          .catch((err) => {
            console.error(err);
            return { statusBadgeVisible: true };
          });
        if (safeSource === "collection") {
          items = await timeMenuItemsLoad(
            "menuItems load",
            () => runWithLoadDeadline(
              () => runMenuLoadWithBackoff(
                () => loadMenuItemsFromCollectionFn(safeRestaurantId),
                { attempts: 3, baseDelayMs: 220 }
              ),
              {
                timeoutMs: resolveLoadDeadlineMs("menuCollectionItemsMs", 6500),
                scope: "menuItems"
              }
            )
          );
        } else if (safeSource === "migration") {
          items = await timeMenuItemsLoad(
            "menu hybrid load",
            () => runWithLoadDeadline(
              () => runMenuLoadWithBackoff(
                () => loadMenuHybridFn(safeRestaurantId),
                { attempts: 3, baseDelayMs: 240 }
              ),
              {
                timeoutMs: resolveLoadDeadlineMs("menuMigrationItemsMs", 7000),
                scope: "menu-hybrid"
              }
            )
          );
        } else {
          items = await timeMenuItemsLoad(
            "public/menu load",
            () => runWithLoadDeadline(
              () => runMenuLoadWithBackoff(
                () => loadPublicMenuItemsFn(safeRestaurantId),
                {
                  attempts: lightweightQrGuestFlow ? 4 : 3,
                  baseDelayMs: lightweightQrGuestFlow ? 140 : 220
                }
              ),
              {
                timeoutMs: resolveLoadDeadlineMs("menuItemsMs", lightweightQrGuestFlow ? 4200 : 5200),
                scope: "public/menu"
              }
            )
          );
        }
        const meta = await metaPromise;
        if (typeof meta?.statusBadgeVisible === "boolean") {
          statusBadgeVisible = meta.statusBadgeVisible;
        }
        items = Array.isArray(items) ? items : [];
        const truthState = resolveLoadedMenuTruthState(items, safeRestaurantId, safeSource);
        const pendingCanonical = safeSource === "public" && !items.length && truthState === "unknown";
        const payload = { items, statusBadgeVisible, truthState, pendingCanonical };
        if (truthState !== "unknown") {
          menuCacheMap.set(cacheKey, {
            items,
            statusBadgeVisible,
            truthSource: safeSource === "public" ? "public-menu" : safeSource,
            truthState,
            ts: Date.now()
          });
          writeMenuPersistentCache(safeRestaurantId, safeSource, items, { statusBadgeVisible });
        }
        if (!shouldCommitVisiblePublicMenuState(safeRestaurantId, safeSource)) return payload;
        const retentionState = resolveVisibleMenuRetentionState(safeRestaurantId, safeSource, {
          pendingCanonical
        });
        state.menu = {
          ...state.menu,
          restaurantId: safeRestaurantId,
          items: retentionState ? retentionState.items : items,
          loading: retentionState ? true : pendingCanonical,
          error: "",
          source: safeSource,
          statusBadgeVisible,
          routeSeed: retentionState ? retentionState.routeSeed : false,
          truthState: retentionState ? retentionState.truthState : truthState
        };
        if (safeSource === "public" && truthState === "knownEmpty") {
          const currentFocusRestaurantId = String(state?.focus?.restaurantId || "").trim();
          if (currentFocusRestaurantId === safeRestaurantId) {
            state.focus = {
              ...state.focus,
              restaurantId: safeRestaurantId,
              items: [],
              loading: false,
              error: "",
              truthSource: "public-menu",
              truthState: "knownEmpty"
            };
          }
        }
        requestRender();
        return payload;
      } catch (err) {
        console.error(err);
        const allowExpiredPersistedFallback = safeSource !== "public";
        const stalePersistedMenu = readMenuPersistentCache(safeRestaurantId, safeSource, { ignoreTtl: allowExpiredPersistedFallback });
        const liveMenuRestaurantId = String(state?.menu?.restaurantId || "").trim();
        const liveMenuSource = String(state?.menu?.source || "").trim().toLowerCase() || "public";
        const liveMenuMatchesVisibleSurface = liveMenuSource === safeSource
          && !!liveMenuRestaurantId
          && (
            liveMenuRestaurantId === safeRestaurantId
            || collectVisiblePublicMenuTargetIds().has(liveMenuRestaurantId)
          );
        const sameRestaurantItems = liveMenuMatchesVisibleSurface && Array.isArray(state.menu.items)
          ? state.menu.items
          : [];
        const blockStaleFallback = blockWebDirectMenuCacheSeed || shouldPrioritizeVisibleMenuTruth;
        const allowStaleFallback = !blockStaleFallback && (!shouldPrioritizeVisibleMenuTruth || sameRestaurantItems.length > 0);
        const fallbackItems = sameRestaurantItems.length
          ? sameRestaurantItems
          : (allowStaleFallback ? stalePersistedMenu.items : []);
        const fallbackStatusBadgeVisible = typeof stalePersistedMenu.statusBadgeVisible === "boolean"
          ? stalePersistedMenu.statusBadgeVisible
          : true;
        const fallbackPayload = {
          items: fallbackItems,
          statusBadgeVisible: fallbackStatusBadgeVisible,
          truthState: fallbackItems.length > 0 ? "seeded" : "unknown"
        };
        if (!shouldCommitVisiblePublicMenuState(safeRestaurantId, safeSource)) return fallbackPayload;
        state.menu = {
          ...state.menu,
          restaurantId: safeRestaurantId,
          items: fallbackItems,
          loading: false,
          error: fallbackItems.length ? "" : "Menu laden fehlgeschlagen.",
          source: safeSource,
          statusBadgeVisible: fallbackStatusBadgeVisible,
          routeSeed: fallbackItems.length > 0 && state.menu.routeSeed === true,
          truthState: fallbackPayload.truthState
        };
        requestRender();
        return fallbackPayload;
      } finally {
        menuNetworkLoadPromises.delete(cacheKey);
      }
    })();
    menuNetworkLoadPromises.set(cacheKey, request);
    return await request;
  }

  async function bootstrapUser(user) {
    const activeTabKey = String(state?.activeTab || "").trim().toLowerCase();
    const isRoleCriticalTab = activeTabKey === "staff"
      || activeTabKey === "businessaccounts";
    const deferGlobalBootstrapWork = !isRoleCriticalTab;
    const runDeferredBootstrapTask = (scope = "", task = null) => {
      if (typeof task !== "function") return;
      try {
        Promise.resolve()
          .then(() => task())
          .catch((err) => {
            console.warn(`[mnyra][${scope || "auth.bootstrap.defer"}]`, err);
          });
      } catch (err) {
        console.warn(`[mnyra][${scope || "auth.bootstrap.defer"}]`, err);
      }
    };
    const hydrateRestaurantsForBootstrap = (ids, options) => {
      if (!deferGlobalBootstrapWork) {
        return hydrateRestaurantsByIdsFn(ids, options);
      }
      runDeferredBootstrapTask(
        "auth.bootstrap.defer.hydrateRestaurants",
        () => hydrateRestaurantsByIdsFn(ids, options)
      );
      return Promise.resolve();
    };
    const resolveRoleSwitchTargetsForBootstrap = (currentUser) => {
      if (!deferGlobalBootstrapWork) {
        return resolveRoleSwitchTargetsFn(currentUser);
      }
      runDeferredBootstrapTask(
        "auth.bootstrap.defer.resolveRoleSwitchTargets",
        () => resolveRoleSwitchTargetsFn(currentUser)
      );
      return Promise.resolve();
    };
    const commitAuthShellReady = () => {
      try {
        updateShellDomFn();
        const renderMode = String(getLastRenderModeFn() || "").trim().toLowerCase();
        const visibleTab = String(state?.activeTab || "").trim().toLowerCase();
        if (renderMode === "main" && visibleTab === "feed" && updateFeedDomFn()) {
          updateShellDomFn();
          return;
        }
        if (renderMode === "main" && visibleTab === "search" && refreshSearchViewFn()) {
          updateShellDomFn();
          return;
        }
        renderFn();
        updateShellDomFn();
      } catch (err) {
        console.warn("[mnyra][auth-shell-ready]", err);
        try {
          renderFn();
        } catch {}
      }
    };
    await bootstrapAuthenticatedSessionCoreFn({
      user,
      loadAuthProfile: (currentUser) => loadAuthProfileFn(currentUser),
      primeCriticalProfile: (currentUser) => {
        const preloadUid = String(currentUser?.uid || "").trim();
        if (!preloadUid) return Promise.resolve(null);
        if (String(state.user?.uid || "").trim() !== preloadUid) return Promise.resolve(null);
        const existingPromise = state.__criticalProfilePreloadPromise;
        if (existingPromise && state.__criticalProfilePreloadUid === preloadUid) {
          return existingPromise;
        }
        const preloadTasks = [];
        if (!dataLoaded.restaurants) {
          preloadTasks.push(loadRestaurants({ force: false }));
        }
        const restaurantId = String(
          state.userProfile?.restaurantId
          || state.userProfile?.staffRestaurantId
          || state.userProfile?.waiterRestaurantId
          || ""
        ).trim();
        const hasBusinessProfile = !!restaurantId;
        if (hasBusinessProfile) {
          preloadTasks.push(
            loadBusinessPosts({ force: false }),
            loadMenuForRestaurant(restaurantId, { source: "public", prefetchOnly: true }),
            loadFocusForRestaurant(restaurantId, { prefetchOnly: true })
          );
        } else {
          preloadTasks.push(loadUserPosts({ force: false }));
        }
        const preloadPromise = Promise.allSettled(preloadTasks)
          .finally(() => {
            if (state.__criticalProfilePreloadPromise === preloadPromise) {
              state.__criticalProfilePreloadPromise = null;
            }
          });
        state.__criticalProfilePreloadUid = preloadUid;
        state.__criticalProfilePreloadPromise = preloadPromise;
        return preloadPromise;
      },
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
      hydrateRestaurantsByIds: (ids, options) => hydrateRestaurantsForBootstrap(ids, options),
      resolveRoleSwitchTargets: (currentUser) => resolveRoleSwitchTargetsForBootstrap(currentUser),
      afterAuthShellReady: commitAuthShellReady,
      ensureFollowingLoaded: () => {
        if (!dataLoaded.following) dataLoaded.following = true;
      },
      startLiveListeners: (currentUser) => startLiveListenersFn(currentUser),
      ensureTabData: (tab, options) => ensureTabDataFn(tab, options),
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
