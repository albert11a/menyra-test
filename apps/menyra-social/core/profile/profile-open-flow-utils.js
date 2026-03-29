export function createProfileOpenFlowControllerCore({
  state,
  isLocalBusinessProfile,
  getRestaurantMetaById,
  normalizeSearchKey,
  render,
  ensureMenuDataForProfile,
  ensureFocusDataForProfile,
  hydrateRestaurantsByIds,
  normalizeExternalProfile,
  showPublicProfile,
  fetchBusinessProfileDoc,
  loadBusinessPostsForRestaurant,
  normalizeExternalUserProfile,
  openGuestAuthPrompt,
  businessProfileCache,
  userProfileCache,
  hasPendingFollowRequest,
  fetchUserDocByUid,
  resolveUserByHandle,
  loadUserPostsForUser
} = {}) {
  const isLocalBusiness = typeof isLocalBusinessProfile === "function"
    ? isLocalBusinessProfile
    : (() => false);
  const getRestaurantMeta = typeof getRestaurantMetaById === "function"
    ? getRestaurantMetaById
    : (() => null);
  const normalizeSearch = typeof normalizeSearchKey === "function"
    ? normalizeSearchKey
    : ((value) => String(value || "").trim().toLowerCase());
  const renderApp = typeof render === "function"
    ? render
    : (() => {});
  const ensureMenuData = typeof ensureMenuDataForProfile === "function"
    ? ensureMenuDataForProfile
    : (() => {});
  const ensureFocusData = typeof ensureFocusDataForProfile === "function"
    ? ensureFocusDataForProfile
    : (() => {});
  const hydrateRestaurants = typeof hydrateRestaurantsByIds === "function"
    ? hydrateRestaurantsByIds
    : (() => Promise.resolve(null));
  const normalizeBusinessProfile = typeof normalizeExternalProfile === "function"
    ? normalizeExternalProfile
    : ((value) => value || {});
  const showPublicProfileView = typeof showPublicProfile === "function"
    ? showPublicProfile
    : (() => {});
  const fetchBusinessProfile = typeof fetchBusinessProfileDoc === "function"
    ? fetchBusinessProfileDoc
    : (() => Promise.resolve(null));
  const loadBusinessPosts = typeof loadBusinessPostsForRestaurant === "function"
    ? loadBusinessPostsForRestaurant
    : (() => Promise.resolve([]));
  const normalizeExternalUserProfileFn = typeof normalizeExternalUserProfile === "function"
    ? normalizeExternalUserProfile
    : ((value) => value || {});
  const openGuestAuth = typeof openGuestAuthPrompt === "function"
    ? openGuestAuthPrompt
    : (() => false);
  const businessProfileCacheMap = businessProfileCache instanceof Map
    ? businessProfileCache
    : new Map();
  const userProfileCacheMap = userProfileCache instanceof Map
    ? userProfileCache
    : new Map();
  const checkPendingFollowRequest = typeof hasPendingFollowRequest === "function"
    ? hasPendingFollowRequest
    : (() => Promise.resolve(false));
  const fetchUserByUid = typeof fetchUserDocByUid === "function"
    ? fetchUserDocByUid
    : (() => Promise.resolve(null));
  const resolveUserByHandleFn = typeof resolveUserByHandle === "function"
    ? resolveUserByHandle
    : (() => Promise.resolve(null));
  const loadUserPosts = typeof loadUserPostsForUser === "function"
    ? loadUserPostsForUser
    : (() => Promise.resolve([]));
  let businessOpenRequestToken = 0;

  const cloneBusinessProfile = (profile) => (
    profile && typeof profile === "object"
      ? {
          ...profile,
          posts: Array.isArray(profile.posts) ? profile.posts.slice() : []
        }
      : null
  );

  const cacheBusinessProfile = (restaurantId, profile) => {
    const safeRestaurantId = String(restaurantId || profile?.restaurantId || "").trim();
    if (!safeRestaurantId || !profile || typeof profile !== "object") return;
    businessProfileCacheMap.set(safeRestaurantId, cloneBusinessProfile(profile));
  };

  const readCachedBusinessProfile = (restaurantId) => {
    const safeRestaurantId = String(restaurantId || "").trim();
    if (!safeRestaurantId) return null;
    return cloneBusinessProfile(businessProfileCacheMap.get(safeRestaurantId));
  };

  const isOwnBusinessTarget = ({ restaurantId = "", name = "" } = {}) => {
    if (!isLocalBusiness(state?.userProfile)) return false;
    const ownRestaurantId = String(state?.userProfile?.restaurantId || "").trim();
    const targetRestaurantId = String(restaurantId || "").trim();
    if (ownRestaurantId && targetRestaurantId && ownRestaurantId === targetRestaurantId) return true;

    const ownRest = ownRestaurantId ? getRestaurantMeta(ownRestaurantId) : null;
    const ownNames = [
      state?.userProfile?.name,
      ownRest?.name,
      ownRest?.restaurantName
    ].map((item) => normalizeSearch(item)).filter(Boolean);
    const targetName = normalizeSearch(name);
    if (!targetName) return false;
    return ownNames.includes(targetName);
  };

  const openOwnBusinessProfile = ({ showBack = true, topTab } = {}) => {
    const prevTab = state?.activeTab || "feed";
    const nextTopTab = topTab === "menu" ? "menu" : "profile";
    state.profileView = null;
    state.profileModal = { open: false, profile: null };
    state.profileContentTab = "posts";
    state.profileTopTab = nextTopTab;
    state.profileViewMode = "grid";
    state.profilePostMenuId = null;
    state.drawerOpen = false;
    state.activeTab = "profile";
    state.profileBackTab = showBack ? prevTab : "";
    renderApp();
    if (nextTopTab === "menu") {
      ensureMenuData();
      ensureFocusData();
    }
  };

  const openProfileViewFromBusiness = async (input, { showBack = true, topTab, menuAccessSource = "", tableNumber = 0 } = {}) => {
    try {
      const safeName = String(typeof input === "string" ? input : input?.name || "").trim();
      const explicitRestaurantId = typeof input === "string" ? "" : (input?.id || "");
      if (!safeName && !explicitRestaurantId) return;
      const safeMenuAccessSource = String(menuAccessSource || "").trim().toLowerCase();
      const safeTableNumber = Math.max(0, Number(tableNumber || 0) || 0);
      const isMenuTopTab = String(topTab || "").trim().toLowerCase() === "menu";
      const isQrMenuOpen = isMenuTopTab && safeMenuAccessSource === "qr";
      // For deeplinks like ?r=...&tab=menu we always want the public profile menu view,
      // never the owner editor tab, even when the target is the own business account.
      const isDeeplinkMenuOpen = isMenuTopTab && !showBack;

      const rest = explicitRestaurantId
        ? (state.restaurants.find((r) => r.id === explicitRestaurantId) || { id: explicitRestaurantId })
        : (state.restaurants.find((r) => (r.name || r.restaurantName || "") === safeName) || {});
      const restaurantId = String(explicitRestaurantId || rest?.id || "").trim();

      if (!isDeeplinkMenuOpen && !isQrMenuOpen && isOwnBusinessTarget({
        restaurantId,
        name: safeName || rest?.name || rest?.restaurantName || ""
      })) {
        openOwnBusinessProfile({ showBack, topTab });
        return;
      }

      const requestToken = ++businessOpenRequestToken;
      const cachedProfile = readCachedBusinessProfile(restaurantId);

      const fallbackPosts = restaurantId
        ? []
        : state.feedPosts
        .filter((p) => (restaurantId ? p.restaurantId === restaurantId : p.business === safeName))
        .map((p, idx) => ({
          id: p.id || `feed_${idx}`,
          url: p.image,
          type: p.type || "square",
          caption: p.content || "",
          createdAt: p.createdAt,
          likes: p.likes ?? 0,
          comments: p.comments ?? 0,
          ownerType: "restaurant",
          ownerId: restaurantId || p.restaurantId || ""
        }));

      const placeholderProfile = cachedProfile || normalizeBusinessProfile({
        profileDoc: null,
        restaurant: rest,
        fallbackName: safeName || rest.name || rest.restaurantName || "Business",
        posts: fallbackPosts
      });
      if (restaurantId && !Array.isArray(placeholderProfile.posts)) {
        placeholderProfile.posts = [];
      }
      if (restaurantId && !placeholderProfile.posts?.length && placeholderProfile.postsLoading !== false) {
        placeholderProfile.postsLoading = true;
      } else {
        placeholderProfile.postsLoading = false;
      }

      showPublicProfileView(placeholderProfile, placeholderProfile.posts, {
        showBack,
        topTab,
        menuAccessSource: safeMenuAccessSource,
        tableNumber: safeTableNumber
      });

      if (isMenuTopTab && placeholderProfile?.restaurantId) {
        ensureMenuData(placeholderProfile);
        ensureFocusData(placeholderProfile);
      }

      const hydratedRestaurantPromise = restaurantId
        ? Promise.resolve(hydrateRestaurants([restaurantId], { max: 1, requireLocation: true }))
          .catch(() => null)
          .then(() => state.restaurants.find((row) => row.id === restaurantId) || rest)
        : Promise.resolve(rest);
      const postsPromise = !restaurantId
        ? Promise.resolve(fallbackPosts)
        : Promise.resolve(loadBusinessPosts(restaurantId)).catch(() => fallbackPosts);

      const [profileSnap, hydratedRestaurant] = await Promise.all([
        fetchBusinessProfile({ restaurantId, restaurant: rest }),
        hydratedRestaurantPromise
      ]);

      if (requestToken !== businessOpenRequestToken) return;
      const resolved = normalizeBusinessProfile({
        profileDoc: profileSnap,
        restaurant: hydratedRestaurant || rest,
        fallbackName: safeName || rest.name || rest.restaurantName || "Business",
        posts: placeholderProfile.posts
      });
      if (restaurantId) {
        resolved.postsLoading = true;
      }
      cacheBusinessProfile(restaurantId, resolved);

      if (state.activeTab !== "profile") return;
      if (restaurantId && state.profileView?.profile?.restaurantId !== restaurantId) return;
      showPublicProfileView(resolved, resolved.posts, {
        showBack,
        topTab,
        menuAccessSource: safeMenuAccessSource,
        tableNumber: safeTableNumber
      });

      void postsPromise.then((loadedPosts) => {
        if (requestToken !== businessOpenRequestToken) return;
        const finalPosts = Array.isArray(loadedPosts) ? loadedPosts : fallbackPosts;
        const currentProfile = state.profileView?.profile || null;
        if (state.activeTab !== "profile") return;
        if (restaurantId && currentProfile?.restaurantId !== restaurantId) return;
        const finalProfile = normalizeBusinessProfile({
          profileDoc: profileSnap,
          restaurant: hydratedRestaurant || rest,
          fallbackName: safeName || rest.name || rest.restaurantName || "Business",
          posts: finalPosts
        });
        finalProfile.postsLoading = false;
        cacheBusinessProfile(restaurantId, finalProfile);
        showPublicProfileView(finalProfile, finalProfile.posts, {
          showBack,
          topTab,
          menuAccessSource: safeMenuAccessSource,
          tableNumber: safeTableNumber
        });
      }).catch(() => null);
    } catch (err) {
      console.error(err);
    }
  };

  const isOwnUserTarget = ({ uid = "", handle = "" } = {}) => {
    const targetUid = String(uid || "").trim();
    const selfUid = String(state?.user?.uid || state?.userProfile?.uid || "").trim();
    if (targetUid && selfUid && targetUid === selfUid) return true;
    const normalizeHandleValue = (value = "") => String(value || "").replace(/^@/, "").trim().toLowerCase();
    const targetHandle = normalizeHandleValue(handle);
    if (!targetHandle) return false;
    const selfHandle = normalizeHandleValue(state?.userProfile?.handle || state?.userProfile?.name || "");
    return !!selfHandle && selfHandle === targetHandle;
  };

  const openOwnUserProfile = ({ showBack = true } = {}) => {
    const prevTab = state?.activeTab || "feed";
    state.profileView = null;
    state.profileModal = { open: false, profile: null };
    state.profileContentTab = "posts";
    state.profileTopTab = "profile";
    state.profileViewMode = "grid";
    state.profilePostMenuId = null;
    state.drawerOpen = false;
    state.activeTab = "profile";
    state.profileBackTab = showBack ? prevTab : "";
    renderApp();
  };

  const openProfileFromUser = async (input) => {
    if (!state?.user) {
      openGuestAuth("Bitte einloggen, um User-Profile zu sehen.");
      return;
    }
    try {
      const uid = typeof input === "string" ? input : (input?.uid || "");
      const handle = String(typeof input === "string" ? "" : (input?.handle || input?.name || "")).replace(/^@/, "");
      if (!uid && !handle) return;
      if (isOwnUserTarget({ uid, handle })) {
        openOwnUserProfile({ showBack: true });
        return;
      }

      const cacheKey = uid || handle;
      const cached = userProfileCacheMap.get(cacheKey);
      if (cached) {
        cached.pendingFollowRequest = await checkPendingFollowRequest(cached.uid || uid || "");
        showPublicProfileView(cached, cached.posts || []);
        return;
      }

      const fallbackProfile = normalizeExternalUserProfileFn({ userDoc: null, fallback: input || {}, posts: [] });
      fallbackProfile.pendingFollowRequest = await checkPendingFollowRequest(fallbackProfile.uid || uid || "");
      showPublicProfileView(fallbackProfile, []);

      let userDoc = null;
      if (uid) {
        const snap = await fetchUserByUid(uid);
        if (snap?.exists?.()) userDoc = snap;
      } else if (handle) {
        const resolved = await resolveUserByHandleFn(handle);
        if (resolved?.id) userDoc = { id: resolved.id, data: resolved.data };
      }

      if (!userDoc) return;
      const posts = await loadUserPosts(userDoc.id);
      const resolvedProfile = normalizeExternalUserProfileFn({
        userDoc,
        fallback: input || {},
        posts
      });
      resolvedProfile.pendingFollowRequest = await checkPendingFollowRequest(resolvedProfile.uid || "");
      userProfileCacheMap.set(cacheKey, resolvedProfile);
      if (state.activeTab !== "profile") return;
      if (uid && state.profileView?.profile?.uid !== uid) return;
      showPublicProfileView(resolvedProfile, resolvedProfile.posts);
    } catch (err) {
      console.error(err);
    }
  };

  return {
    isOwnBusinessTarget,
    openOwnBusinessProfile,
    openProfileViewFromBusiness,
    openProfileFromUser
  };
}
