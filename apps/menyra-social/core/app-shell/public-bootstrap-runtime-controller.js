import {
  buildRestaurantIdentitySignature,
  buildRestaurantLocationPatch
} from "../common/restaurant-identity-runtime-controller.js";
import { projectPostCollectionThroughEntityMap } from "../profile/post-entity-registry-utils.js";

function isGenericBusinessBootstrapLabel(value = "") {
  return String(value || "").trim().toLowerCase() === "business";
}

function normalizePublicBootstrapRestaurants(restaurants = [], { normalizeRestaurantType = (value) => String(value || "").trim() } = {}) {
  const seen = new Set();
  return (Array.isArray(restaurants) ? restaurants : [])
    .map((row) => {
      const id = String(row?.id || row?.restaurantId || "").trim();
      if (!id || seen.has(id)) return null;
      seen.add(id);
      const nameRaw = String(row?.name || row?.restaurantName || row?.displayName || row?.businessName || "").trim();
      const name = isGenericBusinessBootstrapLabel(nameRaw) ? "" : nameRaw;
      const logoUrl = String(row?.logoUrl || row?.logo || row?.logoURL || "").trim();
      const city = String(row?.city || "").trim();
      const type = normalizeRestaurantType(
        row?.type
        || row?.customerType
        || row?.category
        || row?.kind
        || row?.restaurantType
        || ""
      );
      const locationPatch = buildRestaurantLocationPatch(row);
      if (!(name || logoUrl || city || type || Object.keys(locationPatch).length)) return null;
      return {
        id,
        name,
        restaurantName: String(row?.restaurantName || "").trim(),
        logoUrl,
        city,
        ...(type ? { type, customerType: type } : {}),
        ...locationPatch
      };
    })
    .filter(Boolean);
}

function normalizePublicBootstrapFeedPosts(rows = [], {
  toDateSafe = () => null,
  formatRelative = () => ""
} = {}) {
  return (Array.isArray(rows) ? rows : [])
    .map((row) => {
      const id = String(row?.id || "").trim();
      const restaurantId = String(row?.restaurantId || row?.rid || row?.ownerId || "").trim();
      if (!id || !restaurantId) return null;
      const businessRaw = String(row?.business || row?.businessName || row?.restaurantName || "").trim();
      const business = isGenericBusinessBootstrapLabel(businessRaw) ? "" : businessRaw;
      const image = String(row?.image || row?.thumbUrl || row?.mediaUrl || row?.url || "").trim();
      if (!image) return null;
      const createdAtRaw = row?.createdAt;
      const createdAtDate = toDateSafe(createdAtRaw);
      const createdAt = createdAtDate || createdAtRaw || null;
      return {
        id,
        restaurantId,
        business: business || "Business",
        logo: String(row?.logo || row?.logoUrl || row?.logoURL || "").trim(),
        location: String(row?.location || row?.city || "Prishtina").trim() || "Prishtina",
        content: String(row?.content || row?.caption || row?.captionShort || "").trim(),
        image,
        likes: Number.isFinite(Number(row?.likes)) ? Number(row.likes) : (Number.isFinite(Number(row?.likesCount)) ? Number(row.likesCount) : 0),
        comments: Number.isFinite(Number(row?.comments)) ? Number(row.comments) : (Number.isFinite(Number(row?.commentsCount)) ? Number(row.commentsCount) : 0),
        time: formatRelative(createdAtDate),
        createdAt,
        category: String(row?.category || row?.postType || "food").trim() || "food",
        isLive: !!row?.isLive,
        ownerType: "restaurant",
        ownerId: restaurantId
      };
    })
    .filter(Boolean)
    .sort((a, b) => (toDateSafe(b.createdAt)?.getTime() || 0) - (toDateSafe(a.createdAt)?.getTime() || 0));
}

function normalizePublicBootstrapStories(rows = []) {
  return (Array.isArray(rows) ? rows : [])
    .map((row) => {
      const restaurantId = String(row?.restaurantId || row?.id || row?.rid || "").trim();
      if (!restaurantId) return null;
      const nameRaw = String(row?.name || row?.businessName || row?.restaurantName || "").trim();
      const name = isGenericBusinessBootstrapLabel(nameRaw) ? "" : nameRaw;
      const img = String(row?.img || row?.logo || row?.logoUrl || row?.mediaUrl || row?.imageUrl || "").trim();
      return {
        id: restaurantId,
        restaurantId,
        name,
        img,
        isLive: !!row?.isLive
      };
    })
    .filter(Boolean);
}

function normalizePublicBootstrapBusinessPosts(rows = [], {
  toDateSafe = () => null
} = {}) {
  return (Array.isArray(rows) ? rows : [])
    .map((row) => {
      const id = String(row?.id || "").trim();
      const restaurantId = String(row?.restaurantId || row?.rid || row?.ownerId || "").trim();
      const url = String(row?.url || row?.image || row?.mediaUrl || row?.thumbUrl || "").trim();
      if (!id || !restaurantId || !url) return null;
      const createdAtRaw = row?.createdAt;
      const createdAtDate = toDateSafe(createdAtRaw);
      return {
        id,
        url,
        type: String(row?.type || "square").trim() || "square",
        title: String(row?.title || "").trim(),
        caption: String(row?.caption || row?.content || "").trim(),
        createdAt: createdAtDate || createdAtRaw || null,
        likes: Number.isFinite(Number(row?.likes)) ? Number(row.likes) : 0,
        comments: Number.isFinite(Number(row?.comments)) ? Number(row.comments) : 0,
        isVideo: !!row?.isVideo,
        ownerType: "restaurant",
        ownerId: restaurantId,
        restaurantId
      };
    })
    .filter(Boolean)
    .sort((a, b) => (toDateSafe(b.createdAt)?.getTime() || 0) - (toDateSafe(a.createdAt)?.getTime() || 0));
}

function normalizePublicBootstrapMenuItems(rows = [], restaurantId = "") {
  const safeRestaurantId = String(restaurantId || "").trim();
  return (Array.isArray(rows) ? rows : [])
    .map((row, idx) => {
      if (!row || typeof row !== "object" || Array.isArray(row)) return null;
      const imageUrls = Array.isArray(row.imageUrls)
        ? row.imageUrls.map((item) => String(item || "").trim()).filter(Boolean)
        : [];
      const imageUrl = String(
        row.imageUrl
        || row.image
        || row.photoUrl
        || row.img
        || imageUrls[0]
        || ""
      ).trim();
      const id = String(
        row.id
        || row.itemId
        || row.menuItemId
        || row.productId
        || `item_${idx}`
      ).trim() || `item_${idx}`;
      const orderIndex = Number.isFinite(Number(row.orderIndex))
        ? Math.max(0, Math.floor(Number(row.orderIndex)))
        : idx;
      return {
        ...row,
        id,
        restaurantId: String(row.restaurantId || safeRestaurantId).trim(),
        orderIndex,
        imageUrl,
        imageUrls: imageUrls.length ? imageUrls : (imageUrl ? [imageUrl] : [])
      };
    })
    .filter(Boolean)
    .sort((a, b) => (Number(a.orderIndex) || 0) - (Number(b.orderIndex) || 0));
}

function normalizePublicBootstrapFocusItems(rows = []) {
  return (Array.isArray(rows) ? rows : [])
    .map((row, idx) => {
      if (!row || typeof row !== "object" || Array.isArray(row)) return null;
      return {
        id: String(row.id || row._id || `focus_${idx}`).trim() || `focus_${idx}`,
        title: String(row.title || row.name || "Sot ne Fokus").trim() || "Sot ne Fokus",
        text: String(row.text || row.desc || row.description || "").trim(),
        imageUrl: String(row.imageUrl || row.image || row.photoUrl || "").trim(),
        cropX: Number.isFinite(Number(row.cropX)) ? Number(row.cropX) : 50,
        cropY: Number.isFinite(Number(row.cropY)) ? Number(row.cropY) : 50,
        active: row.active !== false
      };
    })
    .filter(Boolean);
}

const PUBLIC_BOOTSTRAP_ROUTE_KEYS = [
  "r",
  "restaurant",
  "restaurantId",
  "rid",
  "businessId",
  "tab",
  "top",
  "view",
  "src",
  "source",
  "menuSource",
  "menuAccessSource",
  "access",
  "qr",
  "isQr",
  "menuQr",
  "table",
  "tableNumber",
  "t"
];

export function createPublicBootstrapRuntimeController({
  state = null,
  windowObj = null,
  fetchFn = null,
  abortControllerCtor = null,
  defaultPublicBootstrapEndpoint = "",
  publicBootstrapEvent = "",
  normalizeRestaurantType = (value) => String(value || "").trim(),
  toDateSafe = () => null,
  formatRelative = () => "",
  mergeRestaurants = (restaurants) => restaurants,
  writeCache = () => {},
  readCache = () => null,
  cacheKeys = {},
  rebuildBusinessLocations = () => {},
  saveFeedPosts = () => {},
  normalizeStoryItemsForDisplay = (stories) => stories,
  buildStoriesSignature = () => "",
  setFeedStoriesSignature = () => {},
  queueStoryIdentityHydration = () => {},
  syncFeedPostLogos = () => false,
  updateFeedDom = () => false,
  render = () => {},
  reportCriticalRuntimeFailure = () => {},
  getLastRenderMode = () => "",
  normalizeBusinessProfile = (payload = {}) => payload,
  businessProfileCache = null,
  menuCache = null,
  focusCache = null,
  menuCacheKey = () => "",
  focusCacheKey = () => "",
  syncMenuCaches = () => {},
  fastLimits = {}
} = {}) {
  const win = windowObj || (typeof window === "undefined" ? null : window);
  const fetchRequest = typeof fetchFn === "function"
    ? fetchFn
    : (typeof fetch === "function" ? fetch : null);
  const AbortControllerCtor = typeof abortControllerCtor === "function"
    ? abortControllerCtor
    : (typeof AbortController === "function" ? AbortController : null);
  const normalizeBusinessProfileValue = typeof normalizeBusinessProfile === "function"
    ? normalizeBusinessProfile
    : ((payload = {}) => payload || {});
  const businessProfileCacheMap = businessProfileCache instanceof Map ? businessProfileCache : new Map();
  const menuCacheMap = menuCache instanceof Map ? menuCache : new Map();
  const focusCacheMap = focusCache instanceof Map ? focusCache : new Map();
  const resolveMenuCacheKey = typeof menuCacheKey === "function" ? menuCacheKey : (() => "");
  const resolveFocusCacheKey = typeof focusCacheKey === "function" ? focusCacheKey : (() => "");
  const syncMenuCachesSafe = typeof syncMenuCaches === "function" ? syncMenuCaches : (() => {});
  let publicBootstrapListenerBound = false;
  let publicBootstrapFetchPromise = null;
  let renderRequested = false;

  function requestRender() {
    if (renderRequested) return;
    renderRequested = true;
    Promise.resolve().then(() => {
      renderRequested = false;
      render();
    });
  }

  function cloneBusinessProfile(profile) {
    if (!profile || typeof profile !== "object") return null;
    return {
      ...profile,
      posts: Array.isArray(profile.posts) ? profile.posts.slice() : []
    };
  }

  function shouldRefreshUi() {
    return state?.activeTab === "feed"
      || state?.activeTab === "profile"
      || state?.activeTab === "map";
  }

  function buildPublicBootstrapRequestUrl(endpoint = "") {
    const base = String(endpoint || "").trim();
    if (!base || !win?.location) return base;
    const currentUrl = new URL(win.location.href);
    const nextParams = new URLSearchParams();
    PUBLIC_BOOTSTRAP_ROUTE_KEYS.forEach((key) => {
      const value = String(currentUrl.searchParams.get(key) || "").trim();
      if (value) nextParams.set(key, value);
    });
    if (!Array.from(nextParams.keys()).length) return base;
    try {
      const requestUrl = new URL(base, win.location.href);
      nextParams.forEach((value, key) => {
        if (!requestUrl.searchParams.get(key)) {
          requestUrl.searchParams.set(key, value);
        }
      });
      return requestUrl.toString();
    } catch {
      const glue = base.includes("?") ? "&" : "?";
      return `${base}${glue}${nextParams.toString()}`;
    }
  }

  function applyBootstrapMenuBundle(restaurantId, menuBundle) {
    const safeRestaurantId = String(restaurantId || "").trim();
    const items = normalizePublicBootstrapMenuItems(menuBundle?.items, safeRestaurantId);
    if (!safeRestaurantId || !Array.isArray(menuBundle?.items)) return false;
    const statusBadgeVisible = typeof menuBundle?.statusBadgeVisible === "boolean"
      ? menuBundle.statusBadgeVisible
      : true;
    syncMenuCachesSafe(safeRestaurantId, items, { statusBadgeVisible });
    ["collection", "hybrid"].forEach((source) => {
      const cacheKey = resolveMenuCacheKey(safeRestaurantId, source);
      if (!cacheKey) return;
      const cached = menuCacheMap.get(cacheKey);
      if (!cached) return;
      menuCacheMap.set(cacheKey, {
        ...cached,
        bootstrap: true,
        ts: Date.now()
      });
    });
    if (state?.menu?.restaurantId === safeRestaurantId) {
      state.menu = {
        ...state.menu,
        restaurantId: safeRestaurantId,
        items: Array.isArray(state?.menu?.items) && state.menu.items.length
          ? state.menu.items
          : items,
        loading: false,
        error: "",
        source: String(state?.menu?.source || "hybrid").trim() || "hybrid",
        statusBadgeVisible
      };
    }
    return true;
  }

  function applyBootstrapFocusBundle(restaurantId, focusBundle) {
    const safeRestaurantId = String(restaurantId || "").trim();
    const items = normalizePublicBootstrapFocusItems(focusBundle?.items);
    if (!safeRestaurantId || !Array.isArray(focusBundle?.items)) return false;
    const enabled = typeof focusBundle?.enabled === "boolean"
      ? focusBundle.enabled
      : true;
    const cacheKey = resolveFocusCacheKey(safeRestaurantId);
    if (cacheKey) {
      focusCacheMap.set(cacheKey, {
        items,
        enabled,
        bootstrap: true,
        ts: Date.now()
      });
    }
    if (state?.focus?.restaurantId === safeRestaurantId && (state.focus.loading || !state.focus.items?.length)) {
      state.focus = {
        ...state.focus,
        restaurantId: safeRestaurantId,
        items,
        enabled,
        loading: false,
        error: "",
        index: 0
      };
    }
    return true;
  }

  function applyBootstrapBusinessBundle(bundle = {}) {
    if (!bundle || typeof bundle !== "object" || !state) return false;
    const restaurantId = String(bundle?.restaurant?.id || bundle?.restaurantId || "").trim();
    if (!restaurantId) return false;
    const restaurantSeed = normalizePublicBootstrapRestaurants([bundle.restaurant], {
      normalizeRestaurantType
    })[0] || null;
    const resolvedRestaurant = state.restaurants.find((row) => row.id === restaurantId) || restaurantSeed || bundle.restaurant || null;
    const posts = normalizePublicBootstrapBusinessPosts(bundle.posts, {
      toDateSafe
    });
    const profile = normalizeBusinessProfileValue({
      profileDoc: resolvedRestaurant ? { id: restaurantId, data: bundle.restaurant || resolvedRestaurant } : null,
      restaurant: resolvedRestaurant,
      fallbackName: resolvedRestaurant?.name || resolvedRestaurant?.restaurantName || "Business",
      posts
    });
    if (profile && typeof profile === "object") {
      profile.postsLoading = false;
    }

    let changed = false;
    const existingCachedProfile = cloneBusinessProfile(businessProfileCacheMap.get(restaurantId));
    const shouldSeedProfileCache = !!profile && (
      !existingCachedProfile
      || existingCachedProfile.postsLoading
      || !Array.isArray(existingCachedProfile.posts)
      || !existingCachedProfile.posts.length
      || isGenericBusinessBootstrapLabel(existingCachedProfile.name)
    );
    if (shouldSeedProfileCache) {
      businessProfileCacheMap.set(restaurantId, cloneBusinessProfile(profile));
      changed = true;
    }

    const currentProfile = state?.profileView?.profile || null;
    const currentProfileRestaurantId = String(currentProfile?.restaurantId || "").trim();
    const currentProfilePosts = Array.isArray(state?.profileView?.posts) ? state.profileView.posts : [];
    if (
      profile
      && currentProfileRestaurantId === restaurantId
      && (
        currentProfile?.postsLoading
        || !currentProfilePosts.length
        || isGenericBusinessBootstrapLabel(currentProfile?.name)
      )
    ) {
      const nextPosts = Array.isArray(profile.posts) ? profile.posts.slice() : [];
      state.profileView = {
        ...state.profileView,
        profile: {
          ...currentProfile,
          ...profile,
          posts: nextPosts,
          postsLoading: false
        },
        posts: nextPosts
      };
      changed = true;
    }

    if (bundle.menu && applyBootstrapMenuBundle(restaurantId, bundle.menu)) {
      changed = true;
    }
    if (bundle.focus && applyBootstrapFocusBundle(restaurantId, bundle.focus)) {
      changed = true;
    }

    return changed;
  }

  function applyPublicBootstrapPayload(payload, { refreshUi = false } = {}) {
    if (!payload || typeof payload !== "object" || !state) return false;
    const rawFeedPayload = payload.feedPosts ?? payload.feed ?? payload.posts;
    const hasFeedPayload = Array.isArray(rawFeedPayload);
    const incomingRestaurants = normalizePublicBootstrapRestaurants([
      ...(payload?.businessBundle?.restaurant ? [payload.businessBundle.restaurant] : []),
      ...(Array.isArray(payload.restaurants) ? payload.restaurants : [])
    ], {
      normalizeRestaurantType
    });
    const incomingFeedPosts = normalizePublicBootstrapFeedPosts(rawFeedPayload, {
      toDateSafe,
      formatRelative
    });
    const incomingStories = normalizePublicBootstrapStories(payload.stories);
    let changed = false;

    if (incomingRestaurants.length) {
      const prevSignature = buildRestaurantIdentitySignature(state.restaurants);
      const mergedRestaurants = mergeRestaurants(state.restaurants, incomingRestaurants);
      const nextSignature = buildRestaurantIdentitySignature(mergedRestaurants);
      if (nextSignature !== prevSignature) {
        state.restaurants = mergedRestaurants;
        rebuildBusinessLocations();
        changed = true;
      }
    }

    if (incomingFeedPosts.length && !state.feedPosts.length) {
      state.feedPosts = projectPostCollectionThroughEntityMap(state, incomingFeedPosts);
      const existingFeedMeta = readCache(cacheKeys.feed)?.meta || {};
      saveFeedPosts(state.feedPosts, {
        lastDeltaCheck: Number(existingFeedMeta?.lastDeltaCheck || 0) || 0
      });
      changed = true;
    }
    if (hasFeedPayload) {
      state.feedReady = true;
      state.feedLoading = false;
      state.feedError = "";
    }

    if (incomingStories.length && !state.stories.length) {
      const normalizedStories = normalizeStoryItemsForDisplay(incomingStories);
      if (normalizedStories.length) {
        state.stories = normalizedStories;
        setFeedStoriesSignature(buildStoriesSignature(normalizedStories));
        writeCache(cacheKeys.stories, normalizedStories);
        changed = true;
      }
    }

    if (applyBootstrapBusinessBundle(payload.businessBundle)) {
      changed = true;
    }

    if (syncFeedPostLogos()) {
      changed = true;
    }
    if (state.stories.length) {
      queueStoryIdentityHydration(state.stories, { max: fastLimits.storyIdentityHydration });
    }

    if (changed && refreshUi) {
      const inMain = getLastRenderMode() === "main";
      const updatedFeed = state.activeTab === "feed" && inMain && updateFeedDom();
      if (!updatedFeed && (state.activeTab === "feed" || !inMain)) {
        requestRender();
      }
    }
    return changed;
  }

  function getPublicBootstrapEndpoint() {
    if (win) {
      const fromWindow = String(win.__MENYRA_SOCIAL_BOOTSTRAP_ENDPOINT__ || "").trim();
      if (fromWindow) return fromWindow;
    }
    return defaultPublicBootstrapEndpoint;
  }

  function fetchPublicBootstrapPayload({ force = false, timeoutMs = 1200 } = {}) {
    if (publicBootstrapFetchPromise && !force) return publicBootstrapFetchPromise;
    if (!fetchRequest) return Promise.resolve(false);
    const endpoint = buildPublicBootstrapRequestUrl(getPublicBootstrapEndpoint());
    if (!endpoint) return Promise.resolve(false);
    const request = (async () => {
      const controller = AbortControllerCtor ? new AbortControllerCtor() : null;
      const timeoutId = win && typeof win.setTimeout === "function"
        ? win.setTimeout(() => controller?.abort(), timeoutMs)
        : null;
      try {
        const response = await fetchRequest(endpoint, {
          method: "GET",
          mode: "cors",
          credentials: "omit",
          cache: "no-store",
          signal: controller?.signal
        });
        if (!response.ok) return false;
        const json = await response.json().catch(() => null);
        const data = json && typeof json === "object" ? json.data : null;
        if (!data || typeof data !== "object") return false;
        return applyPublicBootstrapPayload(data, { refreshUi: shouldRefreshUi() });
      } catch (err) {
        reportCriticalRuntimeFailure("startup.publicBootstrapFetch", err, { suppressAbort: true });
        return false;
      } finally {
        if (timeoutId !== null && win && typeof win.clearTimeout === "function") {
          win.clearTimeout(timeoutId);
        }
      }
    })();
    const settledRequest = request.finally(() => {
      if (publicBootstrapFetchPromise === settledRequest) {
        publicBootstrapFetchPromise = null;
      }
    });
    publicBootstrapFetchPromise = settledRequest;
    return settledRequest;
  }

  function bindPublicBootstrapPayloadListener() {
    if (publicBootstrapListenerBound || !win || !publicBootstrapEvent) return;
    publicBootstrapListenerBound = true;
    win.addEventListener(publicBootstrapEvent, (event) => {
      const data = event?.detail;
      if (!data || typeof data !== "object") return;
      applyPublicBootstrapPayload(data, { refreshUi: shouldRefreshUi() });
    });
  }

  return {
    applyPublicBootstrapPayload,
    getPublicBootstrapEndpoint,
    fetchPublicBootstrapPayload,
    bindPublicBootstrapPayloadListener
  };
}
