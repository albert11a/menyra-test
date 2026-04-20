import { projectPostCollectionThroughEntityMap } from "../profile/post-entity-registry-utils.js";

function isGenericBusinessBootstrapLabel(value = "") {
  return String(value || "").trim().toLowerCase() === "business";
}

function buildRestaurantBootstrapSignature(restaurants = []) {
  return (Array.isArray(restaurants) ? restaurants : [])
    .map((rest) => {
      const id = String(rest?.id || "").trim();
      const name = String(rest?.name || rest?.restaurantName || "").trim();
      const logo = String(rest?.logoUrl || rest?.logo || "").trim();
      const city = String(rest?.city || rest?.address || "").trim();
      const type = String(rest?.type || rest?.customerType || rest?.restaurantType || "").trim();
      return `${id}|${name}|${logo}|${city}|${type}`;
    })
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

function mergeBootstrapRestaurantPreview(existing = [], incoming = []) {
  const byId = new Map();
  (Array.isArray(existing) ? existing : []).forEach((row) => {
    const id = String(row?.id || "").trim();
    if (!id) return;
    byId.set(id, row);
  });
  (Array.isArray(incoming) ? incoming : []).forEach((row) => {
    const id = String(row?.id || "").trim();
    if (!id) return;
    const previous = byId.get(id) || {};
    byId.set(id, {
      ...previous,
      ...row,
      id,
      __truthSource: "bootstrap-preview",
      __truthPartial: true,
      __isPreview: true
    });
  });
  return Array.from(byId.values());
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
        location: String(row?.location || row?.city || "").trim(),
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
      const img = String(row?.img || row?.logo || row?.logoUrl || "").trim();
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

  function scheduleNonCriticalTask(task, delayMs = 180) {
    if (typeof task !== "function") return;
    const safeDelay = Math.max(0, Number(delayMs) || 0);
    if (win && typeof win.setTimeout === "function") {
      win.setTimeout(task, safeDelay);
      return;
    }
    if (typeof setTimeout === "function") {
      setTimeout(task, safeDelay);
      return;
    }
    Promise.resolve().then(task);
  }

  function toMillisSafe(value) {
    const parsed = toDateSafe(value);
    if (parsed && typeof parsed.getTime === "function") {
      const millis = parsed.getTime();
      if (Number.isFinite(millis)) return millis;
    }
    const numeric = Number(value);
    return Number.isFinite(numeric) ? numeric : 0;
  }

  function buildFeedBootstrapSignature(items = []) {
    return (Array.isArray(items) ? items : [])
      .map((item) => {
        const id = String(item?.id || "").trim();
        const createdAt = toMillisSafe(item?.createdAt);
        const image = String(item?.image || "").trim();
        const logo = String(item?.logo || "").trim();
        return `${id}|${createdAt}|${image}|${logo}`;
      })
      .join(",");
  }

  function buildStoryBootstrapSignature(items = []) {
    return (Array.isArray(items) ? items : [])
      .map((item) => {
        const restaurantId = String(item?.restaurantId || item?.id || "").trim();
        const name = String(item?.name || "").trim();
        const img = String(item?.img || item?.logo || "").trim();
        const isLive = item?.isLive ? "1" : "0";
        return `${restaurantId}|${name}|${img}|${isLive}`;
      })
      .join(",");
  }

  function mergeBootstrapFeedPosts(existing = [], incoming = []) {
    const byId = new Map();
    (Array.isArray(existing) ? existing : []).forEach((row) => {
      const id = String(row?.id || "").trim();
      if (!id) return;
      byId.set(id, row);
    });
    (Array.isArray(incoming) ? incoming : []).forEach((row) => {
      const id = String(row?.id || "").trim();
      if (!id) return;
      byId.set(id, row);
    });
    return Array.from(byId.values())
      .sort((a, b) => toMillisSafe(b?.createdAt) - toMillisSafe(a?.createdAt));
  }

  function mergeBootstrapStories(existing = [], incoming = []) {
    const byRestaurant = new Map();
    (Array.isArray(incoming) ? incoming : []).forEach((row) => {
      const id = String(row?.restaurantId || row?.id || "").trim();
      if (!id) return;
      byRestaurant.set(id, row);
    });
    (Array.isArray(existing) ? existing : []).forEach((row) => {
      const id = String(row?.restaurantId || row?.id || "").trim();
      if (!id || byRestaurant.has(id)) return;
      byRestaurant.set(id, row);
    });
    return Array.from(byRestaurant.values());
  }

  function resolveBootstrapTimeoutMs(timeoutMs) {
    const requested = Number(timeoutMs);
    if (Number.isFinite(requested) && requested > 0) return requested;
    const fromWindow = Number(win?.__MENYRA_SOCIAL_BOOTSTRAP_TIMEOUT_MS__ || 0);
    if (Number.isFinite(fromWindow) && fromWindow > 0) return fromWindow;
    return 3800;
  }

  function applyPublicBootstrapPayload(payload, { refreshUi = false } = {}) {
    if (!payload || typeof payload !== "object" || !state) return false;
    void mergeRestaurants;
    void rebuildBusinessLocations;
    const activeTabKey = String(state?.activeTab || "").trim().toLowerCase();
    const webDirectEntry = state?.__webDirectEntry && typeof state.__webDirectEntry === "object"
      ? state.__webDirectEntry
      : null;
    const isWebDirectProfileVisiblePath = activeTabKey === "profile"
      && webDirectEntry?.active === true
      && webDirectEntry?.webPriority === true;
    const incomingRestaurants = normalizePublicBootstrapRestaurants(payload.restaurants, {
      normalizeRestaurantType
    });
    const incomingFeedPosts = isWebDirectProfileVisiblePath
      ? []
      : normalizePublicBootstrapFeedPosts(payload.feedPosts || payload.feed || payload.posts, {
        toDateSafe,
        formatRelative
      });
    const incomingStories = isWebDirectProfileVisiblePath
      ? []
      : normalizePublicBootstrapStories(payload.stories);
    let changed = false;
    let previewChanged = false;
    const deferFeedBootstrapPostProcessing = activeTabKey === "profile";

    if (incomingRestaurants.length) {
      const existingPreview = Array.isArray(state.bootstrapRestaurantPreview)
        ? state.bootstrapRestaurantPreview
        : [];
      const mergedPreview = mergeBootstrapRestaurantPreview(existingPreview, incomingRestaurants);
      const prevSignature = buildRestaurantBootstrapSignature(existingPreview);
      const nextSignature = buildRestaurantBootstrapSignature(mergedPreview);
      if (nextSignature !== prevSignature) {
        state.bootstrapRestaurantPreview = mergedPreview;
        if (cacheKeys?.restaurantsPreview) {
          writeCache(cacheKeys.restaurantsPreview, mergedPreview);
        }
        previewChanged = true;
      }
    }

    if (incomingFeedPosts.length) {
      const existingFeedPosts = Array.isArray(state.feedPosts) ? state.feedPosts : [];
      const mergedFeedPosts = projectPostCollectionThroughEntityMap(
        state,
        mergeBootstrapFeedPosts(existingFeedPosts, incomingFeedPosts)
      );
      const prevFeedSignature = buildFeedBootstrapSignature(existingFeedPosts);
      const nextFeedSignature = buildFeedBootstrapSignature(mergedFeedPosts);
      if (nextFeedSignature !== prevFeedSignature) {
        state.feedPosts = mergedFeedPosts;
        const existingFeedMeta = readCache(cacheKeys.feed)?.meta || {};
        saveFeedPosts(state.feedPosts, {
          lastDeltaCheck: Number(existingFeedMeta?.lastDeltaCheck || 0) || 0
        });
        changed = true;
      }
    }

    if (incomingStories.length) {
      const existingStories = Array.isArray(state.stories) ? state.stories : [];
      const normalizedIncomingStories = normalizeStoryItemsForDisplay(incomingStories);
      const mergedStories = normalizeStoryItemsForDisplay(
        mergeBootstrapStories(existingStories, normalizedIncomingStories)
      );
      const prevStorySignature = buildStoryBootstrapSignature(existingStories);
      const nextStorySignature = buildStoryBootstrapSignature(mergedStories);
      if (mergedStories.length && nextStorySignature !== prevStorySignature) {
        state.stories = mergedStories;
        setFeedStoriesSignature(buildStoriesSignature(mergedStories));
        writeCache(cacheKeys.stories, mergedStories);
        changed = true;
      }
    }

    if (deferFeedBootstrapPostProcessing) {
      scheduleNonCriticalTask(() => {
        try {
          syncFeedPostLogos();
          if (state.stories.length) {
            queueStoryIdentityHydration(state.stories, { max: fastLimits.storyIdentityHydration });
          }
        } catch {}
      }, 260);
    } else {
      if (syncFeedPostLogos()) {
        changed = true;
      }
      if (state.stories.length) {
        queueStoryIdentityHydration(state.stories, { max: fastLimits.storyIdentityHydration });
      }
    }

    if (changed) {
      const inMain = getLastRenderMode() === "main";
      const updatedFeed = state.activeTab === "feed" && inMain && updateFeedDom();
      const activeTab = String(state.activeTab || "").trim().toLowerCase();
      const shouldRefreshVisibleBootstrapSurface = activeTab === "feed"
        || activeTab === "search"
        || activeTab === "map";
      if (!updatedFeed && shouldRefreshVisibleBootstrapSurface) {
        requestRender();
      }
    } else if (previewChanged && refreshUi) {
      requestRender();
    }
    return changed || previewChanged;
  }

  function getPublicBootstrapEndpoint() {
    if (win) {
      const fromWindow = String(win.__MENYRA_SOCIAL_BOOTSTRAP_ENDPOINT__ || "").trim();
      if (fromWindow) return fromWindow;
    }
    return defaultPublicBootstrapEndpoint;
  }

  function applyWindowBootstrapPayload() {
    const inlinePayload = win?.__MENYRA_SOCIAL_BOOTSTRAP_PAYLOAD__;
    if (!inlinePayload || typeof inlinePayload !== "object") return false;
    return applyPublicBootstrapPayload(inlinePayload, { refreshUi: state?.activeTab === "feed" });
  }

  async function awaitWindowBootstrapPayload() {
    const pending = win?.__MENYRA_SOCIAL_BOOTSTRAP_PROMISE__;
    if (!pending || typeof pending.then !== "function") return false;
    try {
      await pending;
    } catch {}
    return applyWindowBootstrapPayload();
  }

  function fetchPublicBootstrapPayload({ force = false, timeoutMs = null } = {}) {
    if (publicBootstrapFetchPromise && !force) return publicBootstrapFetchPromise;
    if (!force && applyWindowBootstrapPayload()) return Promise.resolve(true);
    if (!force && win?.__MENYRA_SOCIAL_BOOTSTRAP_PROMISE__) {
      return Promise.resolve(awaitWindowBootstrapPayload());
    }
    if (!fetchRequest) return Promise.resolve(false);
    const endpoint = getPublicBootstrapEndpoint();
    if (!endpoint) return Promise.resolve(false);
    const effectiveTimeoutMs = resolveBootstrapTimeoutMs(timeoutMs);
    const request = (async () => {
      const controller = AbortControllerCtor ? new AbortControllerCtor() : null;
      const timeoutId = win && typeof win.setTimeout === "function"
        ? win.setTimeout(() => controller?.abort(), effectiveTimeoutMs)
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
        if (win) {
          win.__MENYRA_SOCIAL_BOOTSTRAP_PAYLOAD__ = data;
        }
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
