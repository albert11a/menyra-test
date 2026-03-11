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
  hasMenuItemImagesFn = () => false,
  loadMenuItemsFromCollectionFn = async () => [],
  loadPublicMenuItemsFn = async () => [],
  loadLegacyMenuItemsFn = async () => [],
  fillMenuImagesFromFallbackFn = (items = []) => items,
  loadMenuHybridFn = async () => []
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
  let restaurantsFreshReconcileQueued = false;
  let storiesRefreshQueued = false;
  let storiesRefreshForce = false;
  let storiesRefreshUi = false;

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
      state.restaurants = restaurantsCache.data;
      needsRestaurantMetaHydration = restaurantsCache.data.some((rest) => {
        const logo = String(rest?.logoUrl || rest?.logo || rest?.logoURL || "").trim();
        const name = String(rest?.name || rest?.restaurantName || rest?.displayName || "").trim().toLowerCase();
        return !logo || !name || name === "business";
      });
    }

    const feedCache = readCacheFn(cacheKeys.feed);
    let cachedHydrationIds = [];
    if (feedCache?.data?.length) {
      state.feedPosts = feedCache.data;
      cachedHydrationIds = collectFeedHydrationIdsFn(feedCache.data, { max: 6 });
    }

    const storiesCache = readCacheFn(cacheKeys.stories);
    if (!state.stories.length && storiesCache?.data?.length) state.stories = storiesCache.data;

    state.postMeta = {};

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
        if (!updatedFeed) renderFn();
      }

      if (needsRestaurantMetaHydration) {
        void Promise.resolve(enrichRestaurantsWithPublicMetaFn(state.restaurants))
          .then((list) => {
            state.restaurants = list;
            rebuildBusinessLocationsFn();
            const feedChanged = syncFeedPostLogosFn();
            const storiesChanged = state.stories.length
              ? false
              : refreshFeedStoriesFn({ posts: state.feedPosts, force: true });
            writeCacheFn(cacheKeys.restaurants, list);
            if (feedChanged || storiesChanged) {
              const inMain = getLastRenderModeFn() === "main";
              const updatedFeed = state.activeTab === "feed" && inMain && updateFeedDomFn();
              if (!updatedFeed) renderFn();
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
    scheduleIdleFn(() => {
      const nextForce = storiesRefreshForce;
      const nextRefreshUi = storiesRefreshUi;
      storiesRefreshQueued = false;
      storiesRefreshForce = false;
      storiesRefreshUi = false;
      void Promise.resolve(loadStoriesForFeedFn({
        force: nextForce,
        refreshUi: nextRefreshUi
      })).catch(() => null);
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
    state.userPosts = userPostsCache?.data?.length ? userPostsCache.data : [];

    const rid = state.userProfile.restaurantId || "";
    if (rid) {
      const businessCache = readCacheFn(businessPostsKeyFn(rid));
      state.businessPosts = businessCache?.data?.length ? businessCache.data : [];
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
    const scopedCart = safeStorage.getItem(shopCartKeyFn(guestScopeUid));
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
    setMenuDetailCloseBoundFn(false);
    commentAvatarCacheMap.clear();
    commentAvatarPendingMap.clear();
    userSearchAvatarCacheMap.clear();
    businessProfileCacheMap.clear();
    userProfileCacheMap.clear();
    state.postMeta = {};
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
    state.leadModal = { open: false, mode: "create", lead: null, status: "", loading: false, deleting: false, actionsOpen: false, logoFile: null, logoPreview: "", coords: null, locations: [] };
    state.customerModal = { open: false, mode: "edit", customer: null, status: "", loading: false, logoFile: null, logoPreview: "" };
    state.selectedBusiness = null;
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
  }

  async function loadRestaurants({ force = false } = {}) {
    const buildRestaurantIdentitySignature = (items = []) => (Array.isArray(items) ? items : [])
      .map((rest) => {
        const id = String(rest?.id || "").trim();
        const name = String(rest?.name || rest?.restaurantName || rest?.displayName || "").trim();
        const logo = String(rest?.logoUrl || rest?.logo || rest?.logoURL || "").trim();
        return `${id}|${name}|${logo}`;
      })
      .join(",");
    const refreshRestaurantDependentViews = () => {
      rebuildBusinessLocationsFn();
      if (getLastRenderModeFn() === "main") updateShellDomFn();
      syncFeedPostLogosFn();
      if (!state.stories.length) {
        refreshFeedStoriesFn({ force: true });
      }
      scheduleStoriesRefresh({ force: false, refreshUi: state.activeTab === "feed" });
      cleanupLeafletFn();
      const inMain = getLastRenderModeFn() === "main";
      const updatedFeed = state.activeTab === "feed" && inMain && updateFeedDomFn();
      const updatedSearch = state.activeTab === "search" && inMain && refreshSearchViewFn();
      if (!updatedFeed && !updatedSearch) {
        if (!inMain) {
          renderFn();
        } else if (state.activeTab === "map") {
          renderFn();
        } else if (state.activeTab === "feed" || state.activeTab === "search") {
          renderFn();
        }
      }
    };
    const applyRestaurants = (list = [], { shouldWriteCache = false } = {}) => {
      if (!Array.isArray(list)) return;
      if (shouldWriteCache) writeCacheFn(cacheKeys.restaurants, list);
      state.restaurants = list;
      refreshRestaurantDependentViews();
    };
    const reconcileRestaurantMeta = (seed = [], { shouldWriteCache = false } = {}) => {
      if (!Array.isArray(seed) || !seed.length) return;
      const seedSignature = buildRestaurantIdentitySignature(seed);
      void Promise.resolve(enrichRestaurantsWithPublicMetaFn(seed))
        .then((enriched) => {
          if (!Array.isArray(enriched) || !enriched.length) return;
          const nextSignature = buildRestaurantIdentitySignature(enriched);
          if (nextSignature === seedSignature) return;
          if (nextSignature === buildRestaurantIdentitySignature(state.restaurants)) return;
          applyRestaurants(enriched, { shouldWriteCache });
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
    if (!db || typeof collectionFn !== "function" || typeof queryFn !== "function" || typeof getDocsFn !== "function") return;
    try {
      const snap = await getDocsFn(queryFn(collectionFn(db, "restaurants")));
      const rawList = [];
      snap.forEach((docSnap) => rawList.push({ id: docSnap.id, ...docSnap.data() }));
      applyRestaurants(rawList, { shouldWriteCache: true });
      reconcileRestaurantMeta(rawList, { shouldWriteCache: true });
    } catch (err) {
      console.error(err);
    }
  }

  async function loadFeedPosts({ force = false } = {}) {
    const cached = readCacheFn(cacheKeys.feed, cacheTtl.feed);
    if (cached?.data?.length) {
      const wasEmpty = !state.feedPosts.length;
      if (wasEmpty) {
        state.feedPosts = cached.data;
      }
      syncFeedPostLogosFn();
      const storiesUpdated = state.stories.length ? false : refreshFeedStoriesFn({ force: wasEmpty });
      scheduleStoriesRefresh({ force, refreshUi: state.activeTab === "feed" });
      if (wasEmpty || storiesUpdated) {
        const inMain = getLastRenderModeFn() === "main";
        const updatedFeed = state.activeTab === "feed" && inMain && updateFeedDomFn();
        if (updatedFeed) return;
        if (!inMain) {
          renderFn();
          return;
        }
        if (state.activeTab === "feed") {
          renderFn();
        }
      }
      preloadFeedHeroImagesFn(state.feedPosts);
      if (cached.fresh && !force) return;
    }

    if (!db || typeof collectionFn !== "function" || typeof queryFn !== "function" || typeof limitFn !== "function" || typeof getDocsFn !== "function") return;
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

      const prevIds = state.feedPosts.map((item) => String(item.id)).join("|");
      const nextIds = next.map((item) => String(item.id)).join("|");
      state.feedPosts = next;
      const storiesChanged = state.stories.length ? false : refreshFeedStoriesFn({ posts: next });
      scheduleStoriesRefresh({ force, refreshUi: state.activeTab === "feed" });
      preloadFeedHeroImagesFn(next);
      if (prevIds === nextIds && !storiesChanged) return;
      const inMain = getLastRenderModeFn() === "main";
      const updatedFeed = state.activeTab === "feed" && inMain && updateFeedDomFn();
      if (updatedFeed) return;
      const updatedSearch = state.activeTab === "search" && inMain && refreshSearchViewFn();
      if (updatedSearch) return;
      if (!inMain) {
        renderFn();
        return;
      }
      if (state.activeTab === "feed" || state.activeTab === "search") {
        renderFn();
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function loadUserPosts({ force = false } = {}) {
    if (!state.user) return;
    const cacheTtlPosts = cacheTtl.posts;
    const cacheKey = userPostsKeyFn(state.user.uid);
    const cached = readCacheFn(cacheKey, cacheTtlPosts);
    if (cached?.data?.length) {
      if (!state.userPosts.length) {
        state.userPosts = cached.data.map((post) => ({
          ...post,
          ownerType: post.ownerType || "user",
          ownerId: post.ownerId || state.user.uid
        }));
        renderFn();
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
      const prevIds = state.userPosts.map((item) => String(item.id)).join("|");
      const nextIds = next.map((item) => String(item.id)).join("|");
      if (prevIds === nextIds) return;
      state.userPosts = next;
      renderFn();
    } catch (err) {
      console.error(err);
    }
  }

  async function loadBusinessPosts({ force = false } = {}) {
    const restaurantId = state.userProfile.restaurantId;
    if (!restaurantId) {
      state.businessPosts = [];
      renderFn();
      return;
    }
    const cacheKey = businessPostsKeyFn(restaurantId);
    const cached = readCacheFn(cacheKey, cacheTtl.posts);
    if (cached?.data?.length) {
      if (!state.businessPosts.length) {
        state.businessPosts = cached.data.map((post) => ({
          ...post,
          ownerType: post.ownerType || "restaurant",
          ownerId: post.ownerId || restaurantId,
          restaurantId: post.restaurantId || restaurantId
        }));
        renderFn();
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
      const prevIds = state.businessPosts.map((item) => String(item.id)).join("|");
      const nextIds = next.map((item) => String(item.id)).join("|");
      if (prevIds === nextIds) return;
      state.businessPosts = next;
      renderFn();
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
    renderFn();
    try {
      const [items, enabled] = await Promise.all([
        loadFocusItemsFn(restaurantId),
        loadFocusMetaFn(restaurantId)
      ]);
      focusCacheMap.set(cacheKey, { items, enabled, ts: Date.now() });
      state.focus = { ...state.focus, restaurantId, items, enabled, loading: false, error: "", index: 0 };
      renderFn();
    } catch (err) {
      console.error(err);
      state.focus = { ...state.focus, restaurantId, items: [], loading: false, error: "Fokus laden fehlgeschlagen." };
      renderFn();
    }
  }

  async function loadMenuForRestaurant(restaurantId, { force = false, source = "hybrid" } = {}) {
    if (!restaurantId) {
      state.menu = { ...state.menu, restaurantId: "", items: [], loading: false, error: "", source };
      return;
    }
    const cacheKey = menuCacheKeyFn(restaurantId, source);
    const cached = menuCacheMap.get(cacheKey);
    if (cached && cached.items?.length && !force) {
      const cachedNeedsImages = cached.items.some((it) => !hasMenuItemImagesFn(it));
      if (!cachedNeedsImages) {
        state.menu = { ...state.menu, restaurantId, items: cached.items, loading: false, error: "", source };
        return;
      }
    }
    state.menu = { ...state.menu, restaurantId, loading: true, error: "", source };
    renderFn();
    try {
      let items = [];
      if (source === "collection") {
        items = await loadMenuItemsFromCollectionFn(restaurantId);
        const needsImages = items.some((it) => !hasMenuItemImagesFn(it));
        if (needsImages) {
          const publicItems = await loadPublicMenuItemsFn(restaurantId);
          const fallbackItems = publicItems.length ? publicItems : await loadLegacyMenuItemsFn(restaurantId);
          if (fallbackItems.length) {
            items = fillMenuImagesFromFallbackFn(items, fallbackItems);
          }
        }
      } else {
        items = await loadMenuHybridFn(restaurantId);
      }
      menuCacheMap.set(cacheKey, { items, ts: Date.now() });
      state.menu = { ...state.menu, restaurantId, items, loading: false, error: "", source };
      renderFn();
    } catch (err) {
      console.error(err);
      state.menu = { ...state.menu, restaurantId, items: [], loading: false, error: "Menu laden fehlgeschlagen.", source };
      renderFn();
    }
  }

  async function bootstrapUser(user) {
    await bootstrapAuthenticatedSessionCoreFn({
      user,
      loadAuthProfile: (currentUser) => loadAuthProfileFn(currentUser),
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
