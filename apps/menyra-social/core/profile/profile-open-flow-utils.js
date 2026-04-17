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

  const normalizeBusinessLookupKey = (value = "") => {
    const raw = String(value || "").trim().toLowerCase();
    if (!raw) return "";
    return raw
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  const humanizeBusinessLookupLabel = (value = "") => {
    const raw = String(value || "").trim();
    if (!raw) return "";
    const slug = normalizeBusinessLookupKey(raw);
    if (!slug) return raw;
    const parts = slug.split("-").filter(Boolean);
    if (!parts.length) return raw;
    return parts
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ");
  };
  const isLikelyOpaqueBusinessId = (value = "") => {
    const raw = String(value || "").trim();
    if (!raw) return false;
    if (/\s|\./.test(raw)) return false;
    const compact = raw.replace(/[-_]/g, "");
    if (!compact) return false;
    if (/^[a-f0-9]{16,}$/i.test(compact)) return true;
    if (/^[a-z0-9]{20,}$/i.test(compact)) return true;
    const digits = (compact.match(/\d/g) || []).length;
    return compact.length >= 16 && digits >= 4;
  };

  const resolveRestaurantByLookup = ({ restaurantId = "", lookupText = "" } = {}) => {
    const targetId = String(restaurantId || "").trim();
    const targetLookup = normalizeBusinessLookupKey(lookupText);
    const list = Array.isArray(state?.restaurants) ? state.restaurants : [];
    if (targetId) {
      const direct = list.find((row) => String(row?.id || "").trim() === targetId);
      if (direct) return direct;
    }
    if (!targetLookup) return null;
    return list.find((row) => {
      const rowLookup = normalizeBusinessLookupKey(
        row?.landingSlug || row?.handle || row?.name || row?.restaurantName || ""
      );
      return !!rowLookup && rowLookup === targetLookup;
    }) || null;
  };

  const resolveBusinessDisplayNameFallback = ({ safeName = "", rest = null, lookupKey = "" } = {}) => {
    const preferred = String(
      safeName
      || rest?.name
      || rest?.restaurantName
      || rest?.landingSlug
      || rest?.handle
      || ""
    ).trim();
    if (preferred) {
      return humanizeBusinessLookupLabel(preferred) || preferred;
    }
    const fallbackLookup = String(lookupKey || "").trim();
    if (!fallbackLookup || isLikelyOpaqueBusinessId(fallbackLookup)) return "Lokal";
    return humanizeBusinessLookupLabel(fallbackLookup) || "Lokal";
  };

  const openProfileViewFromBusiness = async (input, { showBack = true, topTab, landingStep = 0, menuAccessSource = "", tableNumber = 0 } = {}) => {
    try {
      const safeName = String(typeof input === "string" ? input : input?.name || "").trim();
      const restaurantId = String(typeof input === "string" ? "" : (input?.id || "")).trim();
      const lookupText = String(
        typeof input === "string"
          ? input
          : (input?.landingSlug || input?.handle || input?.id || input?.name || "")
      ).trim();
      if (!safeName && !restaurantId && !lookupText) return;
      const safeMenuAccessSource = String(menuAccessSource || "").trim().toLowerCase();
      const safeTableNumber = Math.max(0, Number(tableNumber || 0) || 0);
      const isMenuTopTab = String(topTab || "").trim().toLowerCase() === "menu";
      const isLandingTopTab = String(topTab || "").trim().toLowerCase() === "landing";
      const isQrMenuOpen = isMenuTopTab && safeMenuAccessSource === "qr";
      // For deeplinks like ?r=...&tab=menu we always want the public profile menu view,
      // never the owner editor tab, even when the target is the own business account.
      const isDeeplinkMenuOpen = isMenuTopTab && !showBack;

      if (!isDeeplinkMenuOpen && !isQrMenuOpen && !isLandingTopTab && isOwnBusinessTarget({ restaurantId, name: safeName })) {
        openOwnBusinessProfile({ showBack, topTab });
        return;
      }

      if (restaurantId) {
        void hydrateRestaurants([restaurantId], { max: 1 });
      }

      const rest = resolveRestaurantByLookup({ restaurantId, lookupText })
        || (restaurantId ? { id: restaurantId } : {});
      const parseCoordCandidate = (value = null) => {
        if (value === null || value === undefined || value === "") return null;
        const parsed = Number(String(value).trim().replace(",", "."));
        return Number.isFinite(parsed) ? parsed : null;
      };
      const resolveInitialCoords = () => {
        const sources = [];
        if (input && typeof input === "object") {
          sources.push(input);
          if (input.geo && typeof input.geo === "object") sources.push(input.geo);
          if (input.coords && typeof input.coords === "object") sources.push(input.coords);
          if (input.location && typeof input.location === "object") sources.push(input.location);
        }
        if (rest && typeof rest === "object") {
          sources.push(rest);
          if (rest.geo && typeof rest.geo === "object") sources.push(rest.geo);
          if (rest.coords && typeof rest.coords === "object") sources.push(rest.coords);
          if (rest.location && typeof rest.location === "object") sources.push(rest.location);
        }
        for (const source of sources) {
          const pairs = [
            [source?.lat, source?.lng],
            [source?.latitude, source?.longitude],
            [source?.gpsLat, source?.gpsLng]
          ];
          for (const pair of pairs) {
            const lat = parseCoordCandidate(pair?.[0]);
            const lng = parseCoordCandidate(pair?.[1]);
            if (!Number.isFinite(lat) || !Number.isFinite(lng)) continue;
            if (Math.abs(lat) < 0.000001 && Math.abs(lng) < 0.000001) continue;
            if (Math.abs(lat) <= 90 && Math.abs(lng) <= 180) return { lat, lng };
            if (Math.abs(lat) <= 180 && Math.abs(lng) <= 90) return { lat: lng, lng: lat };
          }
        }
        return null;
      };
      const targetRestaurantLookupId = String(restaurantId || rest?.id || lookupText || "").trim();
      const targetMenuRestaurantId = String(restaurantId || rest?.id || "").trim();
      if (isMenuTopTab && targetMenuRestaurantId) {
        ensureMenuData({ restaurantId: targetMenuRestaurantId });
        ensureFocusData({ restaurantId: targetMenuRestaurantId });
      }

      const loadingDisplayName = resolveBusinessDisplayNameFallback({
        safeName,
        rest,
        lookupKey: targetRestaurantLookupId
      });
      const initialCoords = resolveInitialCoords();

      const loadingProfile = {
        name: loadingDisplayName,
        handle: "",
        uid: "",
        bio: "Profil wird geladen...",
        avatar: "",
        location: "",
        followers: 0,
        following: 0,
        privateAccount: false,
        role: "business",
        restaurantId: targetMenuRestaurantId || targetRestaurantLookupId,
        pendingFollowRequest: false,
        postsLoaded: false,
        posts: [],
        truthState: "loading"
      };
      if (initialCoords) {
        loadingProfile.lat = initialCoords.lat;
        loadingProfile.lng = initialCoords.lng;
        loadingProfile.latitude = initialCoords.lat;
        loadingProfile.longitude = initialCoords.lng;
        loadingProfile.gpsLat = initialCoords.lat;
        loadingProfile.gpsLng = initialCoords.lng;
      }

      showPublicProfileView(loadingProfile, [], {
        showBack,
        topTab,
        landingStep,
        menuAccessSource: safeMenuAccessSource,
        tableNumber: safeTableNumber
      });

      const profileSnap = await fetchBusinessProfile({
        restaurantId: targetRestaurantLookupId,
        restaurant: rest
      });

      const resolvedDisplayName = resolveBusinessDisplayNameFallback({
        safeName,
        rest,
        lookupKey: targetRestaurantLookupId
      });

      const resolved = normalizeBusinessProfile({
        profileDoc: profileSnap,
        restaurant: rest,
        fallbackName: resolvedDisplayName,
        posts: []
      });
      resolved.postsLoaded = false;

      if (state.activeTab !== "profile") return;
      const visibleRestaurantId = String(state?.profileView?.profile?.restaurantId || "").trim();
      if (targetRestaurantLookupId && visibleRestaurantId && visibleRestaurantId !== targetRestaurantLookupId && visibleRestaurantId !== targetMenuRestaurantId) return;

      showPublicProfileView(resolved, [], {
        showBack,
        topTab,
        landingStep,
        menuAccessSource: safeMenuAccessSource,
        tableNumber: safeTableNumber
      });

      const resolvedRestaurantId = String(
        resolved?.restaurantId
        || targetMenuRestaurantId
        || targetRestaurantLookupId
        || ""
      ).trim();
      if (!resolvedRestaurantId) return;
      const posts = await loadBusinessPosts(resolvedRestaurantId);
      const latestRestaurantId = String(state?.profileView?.profile?.restaurantId || "").trim();
      if (state.activeTab !== "profile") return;
      if (latestRestaurantId && latestRestaurantId !== resolvedRestaurantId) return;

      const resolvedWithPosts = {
        ...resolved,
        postsLoaded: true,
        posts: Array.isArray(posts) ? posts : []
      };
      const safeLandingStep = Math.max(0, Number(state?.profileLandingStep || 0) || 0);
      if (isLandingTopTab && safeLandingStep < 3) {
        const liveView = state?.profileView;
        const liveProfile = liveView?.profile;
        const liveRestaurantId = String(liveProfile?.restaurantId || "").trim();
        if (liveView && liveProfile && (!liveRestaurantId || liveRestaurantId === resolvedRestaurantId)) {
          liveView.posts = resolvedWithPosts.posts;
          liveView.profile = {
            ...liveProfile,
            postsLoaded: true,
            posts: resolvedWithPosts.posts
          };
        }
        return;
      }
      showPublicProfileView(resolvedWithPosts, resolvedWithPosts.posts, {
        showBack,
        topTab,
        landingStep,
        menuAccessSource: safeMenuAccessSource,
        tableNumber: safeTableNumber
      });
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
