import { projectPostCollectionThroughEntityMap } from "../profile/post-entity-registry-utils.js";

function isGenericBusinessBootstrapLabel(value = "") {
  return String(value || "").trim().toLowerCase() === "business";
}

function buildRestaurantBootstrapSignature(restaurants = []) {
  return (Array.isArray(restaurants) ? restaurants : [])
    .map((rest) => `${String(rest?.id || "").trim()}|${String(rest?.name || rest?.restaurantName || "").trim()}|${String(rest?.logoUrl || rest?.logo || "").trim()}`)
    .join(",");
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
      if (!(name || logoUrl || city || type)) return null;
      return {
        id,
        name,
        restaurantName: String(row?.restaurantName || "").trim(),
        logoUrl,
        city,
        ...(type ? { type, customerType: type } : {})
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
  fastLimits = {}
} = {}) {
  const win = windowObj || (typeof window === "undefined" ? null : window);
  const fetchRequest = typeof fetchFn === "function"
    ? fetchFn
    : (typeof fetch === "function" ? fetch : null);
  const AbortControllerCtor = typeof abortControllerCtor === "function"
    ? abortControllerCtor
    : (typeof AbortController === "function" ? AbortController : null);
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

  function applyPublicBootstrapPayload(payload, { refreshUi = false } = {}) {
    if (!payload || typeof payload !== "object" || !state) return false;
    const incomingRestaurants = normalizePublicBootstrapRestaurants(payload.restaurants, {
      normalizeRestaurantType
    });
    const incomingFeedPosts = normalizePublicBootstrapFeedPosts(payload.feedPosts || payload.feed || payload.posts, {
      toDateSafe,
      formatRelative
    });
    const incomingStories = normalizePublicBootstrapStories(payload.stories);
    let changed = false;

    if (incomingRestaurants.length) {
      const prevSignature = buildRestaurantBootstrapSignature(state.restaurants);
      const mergedRestaurants = mergeRestaurants(state.restaurants, incomingRestaurants);
      const nextSignature = buildRestaurantBootstrapSignature(mergedRestaurants);
      if (nextSignature !== prevSignature) {
        state.restaurants = mergedRestaurants;
        writeCache(cacheKeys.restaurants, mergedRestaurants);
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

    if (incomingStories.length && !state.stories.length) {
      const normalizedStories = normalizeStoryItemsForDisplay(incomingStories);
      if (normalizedStories.length) {
        state.stories = normalizedStories;
        setFeedStoriesSignature(buildStoriesSignature(normalizedStories));
        writeCache(cacheKeys.stories, normalizedStories);
        changed = true;
      }
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
    const endpoint = getPublicBootstrapEndpoint();
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
        return applyPublicBootstrapPayload(data, { refreshUi: state?.activeTab === "feed" });
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
      applyPublicBootstrapPayload(data, { refreshUi: state?.activeTab === "feed" });
    });
  }

  return {
    applyPublicBootstrapPayload,
    getPublicBootstrapEndpoint,
    fetchPublicBootstrapPayload,
    bindPublicBootstrapPayloadListener
  };
}
