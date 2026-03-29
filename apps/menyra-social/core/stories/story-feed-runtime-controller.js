import {
  buildStoriesSignatureCore,
  refreshFeedStoriesCore
} from "../feed/feed-story-utils.js";

export function createStoryFeedRuntimeController({
  state = null,
  db = null,
  readCacheFn = () => null,
  writeCacheFn = () => {},
  cacheKeys = {},
  cacheTtlMs = {},
  fastMode = false,
  fastLimits = {},
  collectionGroupFn = null,
  getDocsFn = null,
  queryFn = null,
  whereFn = null,
  orderByFn = null,
  limitFn = null,
  mapStorySnapshotRowsToFeedStoriesFn = () => [],
  canShowFeedRestaurantIdFn = () => true,
  queueStoryIdentityHydrationFn = () => {},
  queueMicrotaskFn = null,
  updateFeedDomFn = () => false,
  renderFn = () => {},
  getLastRenderModeFn = () => "",
  resolveRestaurantLogoFn = (_restaurantId, source = "") => String(source || ""),
  isPlaceholderUrlFn = () => false,
  escapeSelectorFn = (value) => String(value || ""),
  documentObj = null,
  toDateSafeFn = (value) => value
} = {}) {
  const readCache = typeof readCacheFn === "function" ? readCacheFn : (() => null);
  const writeCache = typeof writeCacheFn === "function" ? writeCacheFn : (() => {});
  const collectionGroup = typeof collectionGroupFn === "function" ? collectionGroupFn : null;
  const getDocs = typeof getDocsFn === "function" ? getDocsFn : null;
  const query = typeof queryFn === "function" ? queryFn : null;
  const where = typeof whereFn === "function" ? whereFn : null;
  const orderBy = typeof orderByFn === "function" ? orderByFn : null;
  const limit = typeof limitFn === "function" ? limitFn : null;
  const mapStorySnapshotRowsToFeedStories = typeof mapStorySnapshotRowsToFeedStoriesFn === "function"
    ? mapStorySnapshotRowsToFeedStoriesFn
    : (() => []);
  const canShowFeedRestaurantId = typeof canShowFeedRestaurantIdFn === "function"
    ? canShowFeedRestaurantIdFn
    : (() => true);
  const queueStoryIdentityHydration = typeof queueStoryIdentityHydrationFn === "function"
    ? queueStoryIdentityHydrationFn
    : (() => {});
  const queueMicrotaskSafe = typeof queueMicrotaskFn === "function"
    ? queueMicrotaskFn
    : ((fn) => fn?.());
  const updateFeedDom = typeof updateFeedDomFn === "function" ? updateFeedDomFn : (() => false);
  const render = typeof renderFn === "function" ? renderFn : (() => {});
  const getLastRenderMode = typeof getLastRenderModeFn === "function" ? getLastRenderModeFn : (() => "");
  const resolveRestaurantLogo = typeof resolveRestaurantLogoFn === "function"
    ? resolveRestaurantLogoFn
    : ((_restaurantId, source = "") => String(source || ""));
  const isPlaceholderUrl = typeof isPlaceholderUrlFn === "function" ? isPlaceholderUrlFn : (() => false);
  const escapeSelector = typeof escapeSelectorFn === "function" ? escapeSelectorFn : ((value) => String(value || ""));
  const doc = documentObj || (typeof document !== "undefined" ? document : null);
  const HtmlImageElementCtor = typeof HTMLImageElement === "function" ? HTMLImageElement : null;
  const HtmlElementCtor = typeof HTMLElement === "function" ? HTMLElement : null;
  let feedStoriesSignature = "";
  let storiesFreshReconcileQueued = false;

  function buildStoriesSignature(storyItems = []) {
    return buildStoriesSignatureCore(storyItems);
  }

  function isGenericStoryBusinessLabel(value = "") {
    return String(value || "").trim().toLowerCase() === "business";
  }

  function sanitizeStoryBusinessName(value = "") {
    const label = String(value || "").trim();
    if (!label) return "";
    return isGenericStoryBusinessLabel(label) ? "" : label;
  }

  function resolveStoryBusinessIdentity(restaurantId = "") {
    const rid = String(restaurantId || "").trim();
    if (!rid) {
      return {
        restaurantId: "",
        known: false,
        hasCanonicalRestaurant: false,
        name: "",
        avatar: "",
        ownStory: false,
        restaurant: null
      };
    }
    const ownRestaurantId = String(state?.userProfile?.restaurantId || "").trim();
    const ownStory = !!ownRestaurantId && ownRestaurantId === rid;
    const restaurant = (state?.restaurants || []).find((row) => String(row?.id || "").trim() === rid) || null;
    const hasCanonicalRestaurant = !!restaurant?.id;
    const ownFallbackName = ownStory ? sanitizeStoryBusinessName(state?.userProfile?.name || "") : "";
    const ownFallbackAvatar = ownStory ? String(state?.userProfile?.avatar || "").trim() : "";
    const canonicalName = sanitizeStoryBusinessName(
      restaurant?.name
      || restaurant?.restaurantName
      || restaurant?.displayName
      || restaurant?.businessName
      || ""
    );
    const canonicalAvatar = String(
      restaurant?.logoUrl
      || restaurant?.logo
      || restaurant?.logoURL
      || ""
    ).trim();
    const name = hasCanonicalRestaurant ? canonicalName : ownFallbackName;
    const avatar = hasCanonicalRestaurant ? canonicalAvatar : ownFallbackAvatar;
    return {
      restaurantId: rid,
      known: !!(hasCanonicalRestaurant || ownStory),
      hasCanonicalRestaurant,
      name,
      avatar,
      ownStory,
      restaurant
    };
  }

  function resolveStoryRenderIdentity(story = {}) {
    const storyRestaurantId = String(story?.restaurantId || story?.id || story?.rid || "").trim();
    if (!storyRestaurantId) {
      return {
        storyRestaurantId: "",
        hasCanonicalRestaurant: false,
        storyLabel: "",
        logoSource: "",
        borderClass: story?.isLive ? "border-red-500 animate-pulse" : "border-slate-200"
      };
    }
    const identity = resolveStoryBusinessIdentity(storyRestaurantId);
    const sourceName = sanitizeStoryBusinessName(
      story?.name
      || story?.businessName
      || story?.restaurantName
      || story?.business
      || ""
    );
    const sourceLogo = String(story?.img || story?.logo || story?.logoUrl || "").trim();
    const canonicalName = sanitizeStoryBusinessName(identity.name || "");
    const canonicalLogo = String(identity.avatar || "").trim();
    const storyLabel = identity.hasCanonicalRestaurant
      ? (canonicalName || sourceName || "")
      : sanitizeStoryBusinessName(identity.name || sourceName || "");
    const logoSource = identity.hasCanonicalRestaurant
      ? canonicalLogo
      : String(identity.avatar || sourceLogo || "").trim();
    return {
      storyRestaurantId,
      hasCanonicalRestaurant: !!identity.hasCanonicalRestaurant,
      storyLabel,
      logoSource,
      borderClass: story?.isLive ? "border-red-500 animate-pulse" : "border-slate-200"
    };
  }

  function normalizeStoryItemForDisplay(item = {}) {
    const identity = resolveStoryRenderIdentity(item);
    const restaurantId = identity.storyRestaurantId;
    if (!restaurantId) return null;
    return {
      ...item,
      id: restaurantId,
      restaurantId,
      name: sanitizeStoryBusinessName(identity.storyLabel || ""),
      img: String(identity.logoSource || "").trim(),
      isLive: !!item?.isLive
    };
  }

  function normalizeStoryItemsForDisplay(items = []) {
    return (Array.isArray(items) ? items : [])
      .map((item) => normalizeStoryItemForDisplay(item))
      .filter(Boolean);
  }

  function syncPersistedStories() {
    if (Array.isArray(state?.stories) && state.stories.length) {
      const nextStories = normalizeStoryItemsForDisplay(state.stories);
      state.stories = nextStories;
      feedStoriesSignature = buildStoriesSignature(nextStories);
      queueStoryIdentityHydration(nextStories, { max: fastLimits.storyIdentityHydration });
      return;
    }
    feedStoriesSignature = "";
  }

  function syncStoryIdentityWithCanonicalBusiness() {
    if (!Array.isArray(state?.stories) || !state.stories.length) return false;
    const nextStories = normalizeStoryItemsForDisplay(state.stories);
    const prevSignature = buildStoriesSignature(state.stories);
    const nextSignature = buildStoriesSignature(nextStories);
    if (prevSignature === nextSignature) return false;
    state.stories = nextStories;
    feedStoriesSignature = nextSignature;
    writeCache(cacheKeys.stories, nextStories);
    return true;
  }

  function syncFeedPostLogos() {
    const storiesChanged = syncStoryIdentityWithCanonicalBusiness();
    if (!Array.isArray(state?.feedPosts) || !state.feedPosts.length) return storiesChanged;
    const restMap = new Map();
    (state?.restaurants || []).forEach((rest) => {
      if (rest?.id) restMap.set(rest.id, rest);
    });
    let changed = false;
    const next = [];
    state.feedPosts.forEach((post) => {
      const rid = String(post?.restaurantId || post?.ownerId || "").trim();
      if (!rid) {
        next.push(post);
        return;
      }
      const restaurant = restMap.get(rid) || {};
      if (restaurant?.id && !canShowFeedRestaurantId(rid)) {
        changed = true;
        return;
      }
      const bestLogo = restaurant.logoUrl || restaurant.logo || restaurant.logoURL || post.logo || "";
      const resolved = resolveRestaurantLogo(rid, bestLogo, "avatar");
      if (isPlaceholderUrl(resolved) || resolved === post.logo) {
        next.push(post);
        return;
      }
      changed = true;
      next.push({ ...post, logo: resolved });
    });
    const feedLengthChanged = next.length !== state.feedPosts.length;
    if (!changed && !feedLengthChanged && !storiesChanged) return false;
    if (changed || feedLengthChanged) {
      state.feedPosts = next;
    }
    return changed || feedLengthChanged || storiesChanged;
  }

  function refreshFeedStories({ posts = state?.feedPosts, force = false } = {}) {
    if (Array.isArray(state?.stories) && state.stories.length) {
      if (!feedStoriesSignature) {
        feedStoriesSignature = buildStoriesSignature(state.stories);
      }
      return false;
    }
    const result = refreshFeedStoriesCore({
      posts,
      force,
      fastMode,
      buildStoriesFromFeed,
      currentSignature: feedStoriesSignature
    });
    if (!result.updated) return false;
    const normalizedStories = normalizeStoryItemsForDisplay(result.stories);
    feedStoriesSignature = buildStoriesSignature(normalizedStories);
    state.stories = normalizedStories;
    writeCache(cacheKeys.stories, normalizedStories);
    queueStoryIdentityHydration(normalizedStories, { max: fastLimits.storyIdentityHydration });
    return true;
  }

  async function loadStoriesForFeed({ force = false, refreshUi = true } = {}) {
    const cached = readCache(cacheKeys.stories, cacheTtlMs.stories);
    if (cached?.data?.length) {
      const normalizedCachedStories = normalizeStoryItemsForDisplay(cached.data);
      state.stories = normalizedCachedStories;
      feedStoriesSignature = buildStoriesSignature(state.stories);
      queueStoryIdentityHydration(normalizedCachedStories, { max: fastLimits.storyIdentityHydration });
      if (cached.fresh && !force) {
        if (!storiesFreshReconcileQueued) {
          storiesFreshReconcileQueued = true;
          queueMicrotaskSafe(() => {
            void loadStoriesForFeed({ force: true, refreshUi: state?.activeTab === "feed" })
              .finally(() => {
                storiesFreshReconcileQueued = false;
              });
          });
        }
        return true;
      }
    }

    if (!db || !collectionGroup || !getDocs || !query || !limit) return false;

    try {
      const storiesRef = collectionGroup(db, "stories");
      let snap = null;
      try {
        snap = await getDocs(query(
          storiesRef,
          where("status", "==", "active"),
          orderBy("createdAt", "desc"),
          limit(fastLimits.storiesFallback)
        ));
      } catch {
        try {
          snap = await getDocs(query(
            storiesRef,
            orderBy("createdAt", "desc"),
            limit(fastLimits.storiesFallback)
          ));
        } catch {
          snap = await getDocs(query(storiesRef, limit(fastLimits.storiesFallback)));
        }
      }
      const docSnaps = [];
      snap.forEach((docSnap) => docSnaps.push(docSnap));
      let nextStories = normalizeStoryItemsForDisplay(
        mapStorySnapshotRowsToFeedStories({
          docSnaps,
          restaurants: state?.restaurants,
          canShowFeedRestaurantIdFn: canShowFeedRestaurantId,
          maxItems: fastLimits.stories,
          toDateSafeFn
        })
      );
      const ownRestaurantId = String(state?.userProfile?.restaurantId || "").trim();
      const pendingOwnStoryRestaurantId = String(state?.__pendingOwnStoryRestaurantId || "").trim();
      const pendingOwnStoryUntil = Number(state?.__pendingOwnStoryUntil || 0);
      if (pendingOwnStoryRestaurantId) {
        const pendingExpired = !Number.isFinite(pendingOwnStoryUntil) || pendingOwnStoryUntil <= Date.now();
        const pendingOwnStoryMismatch = !!ownRestaurantId && pendingOwnStoryRestaurantId !== ownRestaurantId;
        if (pendingOwnStoryMismatch || pendingExpired) {
          state.__pendingOwnStoryRestaurantId = "";
          state.__pendingOwnStoryUntil = 0;
        } else {
          const hasPendingOwnStory = nextStories.some(
            (item) => String(item?.restaurantId || item?.id || "").trim() === pendingOwnStoryRestaurantId
          );
          if (hasPendingOwnStory) {
            state.__pendingOwnStoryRestaurantId = "";
            state.__pendingOwnStoryUntil = 0;
          } else {
            const pendingFromState = normalizeStoryItemForDisplay(
              (state?.stories || []).find(
                (item) => String(item?.restaurantId || item?.id || "").trim() === pendingOwnStoryRestaurantId
              ) || {}
            );
            if (pendingFromState) {
              nextStories = [pendingFromState, ...nextStories].slice(0, fastLimits.stories);
            }
          }
        }
      }
      const shouldRefreshUi = !!refreshUi || state?.activeTab === "feed";
      if (!nextStories.length) {
        if (!state?.stories?.length) return false;
        state.stories = [];
        feedStoriesSignature = "";
        writeCache(cacheKeys.stories, []);
        if (shouldRefreshUi) {
          const inMain = getLastRenderMode() === "main";
          const updatedFeed = state?.activeTab === "feed" && inMain && updateFeedDom();
          if (!updatedFeed && state?.activeTab === "feed") {
            render();
          }
        }
        return true;
      }

      const prevSignature = buildStoriesSignature(state?.stories);
      const nextSignature = buildStoriesSignature(nextStories);
      if (prevSignature === nextSignature) {
        feedStoriesSignature = nextSignature;
        return true;
      }

      state.stories = nextStories;
      feedStoriesSignature = nextSignature;
      writeCache(cacheKeys.stories, nextStories);
      queueStoryIdentityHydration(nextStories, { max: fastLimits.storyIdentityHydration });

      if (shouldRefreshUi) {
        const inMain = getLastRenderMode() === "main";
        const updatedFeed = state?.activeTab === "feed" && inMain && updateFeedDom();
        if (!updatedFeed && state?.activeTab === "feed") {
          render();
        }
      }
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  }

  function updateFeedLogoNodes(post) {
    if (!doc || !post?.id) return;
    const postId = escapeSelector(post.id);
    const restaurant = (state?.restaurants || []).find((row) => row?.id === (post.restaurantId || post.ownerId)) || {};
    const logoSource = restaurant.logoUrl || restaurant.logo || restaurant.logoURL || post.logo || "";
    const logoUrl = resolveRestaurantLogo(post.restaurantId || post.ownerId, logoSource, "avatar");
    doc.querySelectorAll(`[data-feed-logo="${postId}"]`).forEach((img) => {
      if (HtmlImageElementCtor && !(img instanceof HtmlImageElementCtor)) return;
      if (img.getAttribute("src") !== logoUrl) img.setAttribute("src", logoUrl);
    });
  }

  function updateStoryLogoNodes(story) {
    if (!doc) return;
    const renderIdentity = resolveStoryRenderIdentity(story);
    if (!renderIdentity.storyRestaurantId) return;
    const storyId = escapeSelector(renderIdentity.storyRestaurantId);
    const allowCacheFallback = !renderIdentity.hasCanonicalRestaurant;
    const logoUrl = resolveRestaurantLogo(
      renderIdentity.storyRestaurantId,
      renderIdentity.logoSource || "",
      "thumb",
      allowCacheFallback
    );
    doc.querySelectorAll(`[data-story-logo="${storyId}"]`).forEach((img) => {
      if (HtmlImageElementCtor && !(img instanceof HtmlImageElementCtor)) return;
      if (img.getAttribute("src") !== logoUrl) img.setAttribute("src", logoUrl);
    });
  }

  function updateStoryMetaNodes(story) {
    if (!doc) return;
    const renderIdentity = resolveStoryRenderIdentity(story);
    if (!renderIdentity.storyRestaurantId) return;
    const storyId = escapeSelector(renderIdentity.storyRestaurantId);
    const label = sanitizeStoryBusinessName(renderIdentity.storyLabel || "");
    const live = !!story?.isLive;
    doc.querySelectorAll(`[data-story-border="${storyId}"]`).forEach((el) => {
      if (HtmlElementCtor && !(el instanceof HtmlElementCtor)) return;
      el.classList.toggle("border-red-500", live);
      el.classList.toggle("animate-pulse", live);
      el.classList.toggle("border-slate-200", !live);
    });
    doc.querySelectorAll(`[data-story-name="${storyId}"]`).forEach((el) => {
      if (HtmlElementCtor && !(el instanceof HtmlElementCtor)) return;
      if (el.textContent !== label) el.textContent = label;
    });
  }

  function buildStoriesFromFeed(posts) {
    void posts;
    // Feed posts are not a valid surrogate for real stories.
    return [];
  }

  function setFeedStoriesSignature(next) {
    feedStoriesSignature = String(next || "");
  }

  return {
    buildStoriesSignature,
    isGenericStoryBusinessLabel,
    sanitizeStoryBusinessName,
    resolveStoryRenderIdentity,
    normalizeStoryItemForDisplay,
    normalizeStoryItemsForDisplay,
    syncPersistedStories,
    setFeedStoriesSignature,
    syncFeedPostLogos,
    refreshFeedStories,
    loadStoriesForFeed,
    updateFeedLogoNodes,
    updateStoryLogoNodes,
    updateStoryMetaNodes,
    buildStoriesFromFeed
  };
}
