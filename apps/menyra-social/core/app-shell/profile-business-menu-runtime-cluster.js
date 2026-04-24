import { createBusinessAccountsRuntimeController } from "../business-accounts/business-accounts-runtime-controller.js";
import { createProfileMenuFocusRenderController } from "../profile/profile-menu-focus-render-controller.js";
import { getMenuRestaurantForProfileCore } from "../profile/profile-menu-focus-utils.js";

export function createProfileBusinessMenuRuntimeCluster({
  state = null,
  businessAccountsDeps = {},
  profileMenuDeps = {},
  dataLoaders = {},
  bridgeBindingsApi = {}
} = {}) {
  const loadMenuForRestaurant = typeof dataLoaders.loadMenuForRestaurantFn === "function"
    ? dataLoaders.loadMenuForRestaurantFn
    : (() => {});
  const loadFocusForRestaurant = typeof dataLoaders.loadFocusForRestaurantFn === "function"
    ? dataLoaders.loadFocusForRestaurantFn
    : (() => {});
  const loadBusinessPostsForRestaurant = typeof dataLoaders.loadBusinessPostsForRestaurantFn === "function"
    ? dataLoaders.loadBusinessPostsForRestaurantFn
    : (async () => []);
  const fetchBusinessProfileDoc = typeof dataLoaders.fetchBusinessProfileDocFn === "function"
    ? dataLoaders.fetchBusinessProfileDocFn
    : null;
  const showPublicProfile = typeof dataLoaders.showPublicProfileFn === "function"
    ? dataLoaders.showPublicProfileFn
    : null;
  const renderProfileShopCartView = typeof bridgeBindingsApi.renderProfileShopCartViewFn === "function"
    ? bridgeBindingsApi.renderProfileShopCartViewFn
    : (() => "");
  const renderProfileShopFavoritesView = typeof bridgeBindingsApi.renderProfileShopFavoritesViewFn === "function"
    ? bridgeBindingsApi.renderProfileShopFavoritesViewFn
    : (() => "");
  const renderShopProductList = typeof bridgeBindingsApi.renderShopProductListFn === "function"
    ? bridgeBindingsApi.renderShopProductListFn
    : (() => "");

  const getMenuRestaurantForProfile = (profile) => getMenuRestaurantForProfileCore(profile);

  let publicProfilePostsEnsurePromise = null;
  let publicProfilePostsEnsureTargetId = "";
  let publicProfileMenuEnsurePromise = null;
  let publicProfileMenuEnsureTargetId = "";
  let publicProfileFocusEnsurePromise = null;
  let publicProfileFocusEnsureTargetId = "";
  const canonicalRestaurantIdPromises = new Map();
  const canonicalRestaurantIdCache = new Map();
  const visiblePublicMenuRetryTimers = new Map();

  const getVisiblePublicProfileView = () => {
    const view = state?.profileView && typeof state.profileView === "object"
      ? state.profileView
      : null;
    const profile = view?.profile && typeof view.profile === "object"
      ? view.profile
      : null;
    if (!view || !profile) return null;
    const restaurantId = String(profile.canonicalRestaurantId || profile.restaurantId || "").trim();
    if (!restaurantId) return null;
    return { view, profile, restaurantId };
  };

  const getVisibleRoutePayload = () => {
    const view = state?.profileView && typeof state.profileView === "object"
      ? state.profileView
      : null;
    return view?.routePayload && typeof view.routePayload === "object"
      ? view.routePayload
      : null;
  };

  const getWebDirectEntryState = () => (
    state?.__webDirectEntry && typeof state.__webDirectEntry === "object"
      ? state.__webDirectEntry
      : null
  );

  const addTargetId = (targetSet, value = "") => {
    const safeValue = String(value || "").trim();
    if (safeValue) targetSet.add(safeValue);
  };

  const collectVisibleMenuTargetIds = (profile = {}) => {
    const ids = new Set();
    const safeProfile = profile && typeof profile === "object" ? profile : {};
    const visibleProfile = state?.profileView?.profile && typeof state.profileView.profile === "object"
      ? state.profileView.profile
      : {};
    const routePayload = getVisibleRoutePayload();
    const routeSnapshot = routePayload?.businessSnapshot && typeof routePayload.businessSnapshot === "object"
      ? routePayload.businessSnapshot
      : {};
    const routeIdentity = routePayload?.identity && typeof routePayload.identity === "object"
      ? routePayload.identity
      : {};
    const snapshotIdentity = routeSnapshot?.identity && typeof routeSnapshot.identity === "object"
      ? routeSnapshot.identity
      : {};
    const webDirectEntry = getWebDirectEntryState();
    [
      safeProfile.canonicalRestaurantId,
      safeProfile.restaurantId,
      safeProfile.publicSlug,
      safeProfile.landingSlug,
      safeProfile.handle,
      visibleProfile.canonicalRestaurantId,
      visibleProfile.restaurantId,
      visibleProfile.publicSlug,
      visibleProfile.landingSlug,
      visibleProfile.handle,
      routePayload?.canonicalRestaurantId,
      routePayload?.restaurantId,
      routePayload?.publicSlug,
      routePayload?.landingSlug,
      routeIdentity.publicSlug,
      routeIdentity.landingSlug,
      routeIdentity.handle,
      routeSnapshot.restaurantId,
      snapshotIdentity.publicSlug,
      snapshotIdentity.landingSlug,
      snapshotIdentity.handle,
      webDirectEntry?.canonicalRestaurantId,
      webDirectEntry?.restaurantId
    ].forEach((value) => addTargetId(ids, value));
    return ids;
  };

  const resolveMenuSurfaceTargetId = (profile = {}) => {
    const safeProfile = profile && typeof profile === "object" ? profile : {};
    const routePayload = getVisibleRoutePayload();
    const routeSnapshot = routePayload?.businessSnapshot && typeof routePayload.businessSnapshot === "object"
      ? routePayload.businessSnapshot
      : {};
    const webDirectEntry = getWebDirectEntryState();
    return String(
      safeProfile.canonicalRestaurantId
      || routePayload?.canonicalRestaurantId
      || routeSnapshot.restaurantId
      || webDirectEntry?.canonicalRestaurantId
      || getMenuRestaurantForProfile(safeProfile)
      || routePayload?.restaurantId
      || webDirectEntry?.restaurantId
      || ""
    ).trim();
  };

  const isWebDirectMenuVisible = () => {
    const webDirectEntry = getWebDirectEntryState();
    if (webDirectEntry?.active !== true || webDirectEntry?.webPriority !== true || webDirectEntry?.menuFirst !== true) {
      return false;
    }
    const activeTab = String(state?.activeTab || "").trim().toLowerCase();
    const profileTopTab = String(state?.profileTopTab || "").trim().toLowerCase();
    if (activeTab !== "profile" || profileTopTab !== "menu") return false;
    return true;
  };

  const isQrPublicMenuVisible = () => {
    const activeTab = String(state?.activeTab || "").trim().toLowerCase();
    const profileTopTab = String(state?.profileTopTab || "").trim().toLowerCase();
    const menuAccessSource = String(state?.profileView?.menuAccessSource || "").trim().toLowerCase();
    return activeTab === "profile" && profileTopTab === "menu" && menuAccessSource === "qr";
  };

  const isVisiblePublicMenuFirstSurface = () => isQrPublicMenuVisible() || isWebDirectMenuVisible();

  const isNormalWebDirectProfileVisible = () => {
    const webDirectEntry = getWebDirectEntryState();
    if (webDirectEntry?.active !== true || webDirectEntry?.webPriority !== true || webDirectEntry?.postsFirst !== true) {
      return false;
    }
    const activeTab = String(state?.activeTab || "").trim().toLowerCase();
    const profileTopTab = String(state?.profileTopTab || "").trim().toLowerCase();
    return activeTab === "profile" && profileTopTab === "profile";
  };

  const hasMatchingVisibleMenuEnsureInFlight = (targetId = "", requestedId = "", profile = {}) => {
    if (!publicProfileMenuEnsurePromise) return false;
    const activeTargetId = String(publicProfileMenuEnsureTargetId || "").trim();
    const safeTargetId = String(targetId || "").trim();
    const safeRequestedId = String(requestedId || "").trim();
    if (!activeTargetId) return false;
    if (activeTargetId === safeTargetId || activeTargetId === safeRequestedId) return true;
    if (!isWebDirectMenuVisible()) return false;
    const visibleTargetIds = collectVisibleMenuTargetIds(profile);
    return visibleTargetIds.has(activeTargetId)
      && (!!safeTargetId && visibleTargetIds.has(safeTargetId)
        || !!safeRequestedId && visibleTargetIds.has(safeRequestedId));
  };

  const hasMatchingVisiblePostsEnsureInFlight = (targetId = "", requestedId = "", profile = {}) => {
    if (!publicProfilePostsEnsurePromise) return false;
    const activeTargetId = String(publicProfilePostsEnsureTargetId || "").trim();
    const safeTargetId = String(targetId || "").trim();
    const safeRequestedId = String(requestedId || "").trim();
    if (!activeTargetId) return false;
    if (activeTargetId === safeTargetId || activeTargetId === safeRequestedId) return true;
    const isWebDirectVisible = isWebDirectMenuVisible() || isNormalWebDirectProfileVisible();
    if (!isWebDirectVisible) return false;
    const visibleTargetIds = collectVisibleMenuTargetIds(profile);
    return visibleTargetIds.has(activeTargetId)
      && (!!safeTargetId && visibleTargetIds.has(safeTargetId)
        || !!safeRequestedId && visibleTargetIds.has(safeRequestedId));
  };

  const hasMatchingVisibleFocusEnsureInFlight = (targetId = "", requestedId = "", profile = {}) => {
    if (!publicProfileFocusEnsurePromise) return false;
    const activeTargetId = String(publicProfileFocusEnsureTargetId || "").trim();
    const safeTargetId = String(targetId || "").trim();
    const safeRequestedId = String(requestedId || "").trim();
    if (!activeTargetId) return false;
    if (activeTargetId === safeTargetId || activeTargetId === safeRequestedId) return true;
    if (!isWebDirectMenuVisible()) return false;
    const visibleTargetIds = collectVisibleMenuTargetIds(profile);
    return visibleTargetIds.has(activeTargetId)
      && (!!safeTargetId && visibleTargetIds.has(safeTargetId)
        || !!safeRequestedId && visibleTargetIds.has(safeRequestedId));
  };

  const buildVisiblePublicProfileOptions = (view = null) => {
    const safeView = view && typeof view === "object" ? view : {};
    const backTab = String(state?.profileBackTab || "").trim();
    return {
      showBack: !!backTab,
      backTab,
      topTab: state?.profileTopTab || "",
      contentTab: state?.profileContentTab || "",
      menuAccessSource: safeView?.menuAccessSource || "",
      tableNumber: safeView?.tableNumber || 0,
      directEntry: safeView?.directEntry || null,
      routePayload: safeView?.routePayload || null
    };
  };

  const refreshVisiblePublicProfile = (profilePatch = {}, postsOverride = null) => {
    if (!showPublicProfile) return false;
    const visibleProfileView = getVisiblePublicProfileView();
    if (!visibleProfileView) return false;
    const nextPosts = Array.isArray(postsOverride)
      ? postsOverride
      : (Array.isArray(visibleProfileView.view.posts) ? visibleProfileView.view.posts : []);
    showPublicProfile(
      {
        ...visibleProfileView.profile,
        ...profilePatch,
        posts: nextPosts
      },
      nextPosts,
      buildVisiblePublicProfileOptions(visibleProfileView.view)
    );
    return true;
  };

  const resolveRouteCanonicalRestaurantIdHint = (profile = {}) => {
    const routePayload = getVisibleRoutePayload();
    const routeSnapshot = routePayload?.businessSnapshot && typeof routePayload.businessSnapshot === "object"
      ? routePayload.businessSnapshot
      : {};
    const webDirectEntry = getWebDirectEntryState();
    return String(
      routePayload?.canonicalRestaurantId
      || routeSnapshot?.restaurantId
      || webDirectEntry?.canonicalRestaurantId
      || ""
    ).trim();
  };

  const resolveLatestCanonicalMenuRestaurantId = (fallbackId = "") => {
    const visibleProfileView = getVisiblePublicProfileView();
    const routePayload = getVisibleRoutePayload();
    const routeSnapshot = routePayload?.businessSnapshot && typeof routePayload.businessSnapshot === "object"
      ? routePayload.businessSnapshot
      : {};
    const webDirectEntry = getWebDirectEntryState();
    const candidates = [
      visibleProfileView?.profile?.canonicalRestaurantId,
      routePayload?.canonicalRestaurantId,
      routeSnapshot?.restaurantId,
      webDirectEntry?.canonicalRestaurantId,
      fallbackId
    ];
    for (const candidate of candidates) {
      const safeCandidate = String(candidate || "").trim();
      if (safeCandidate) return safeCandidate;
    }
    return "";
  };

  const collectVisibleMenuLoadIds = (profile = {}, fallbackId = "") => {
    const ids = [];
    const addId = (value = "") => {
      const safeValue = String(value || "").trim();
      if (safeValue && !ids.includes(safeValue)) ids.push(safeValue);
    };
    const safeProfile = profile && typeof profile === "object" ? profile : {};
    const routePayload = getVisibleRoutePayload();
    const routeSnapshot = routePayload?.businessSnapshot && typeof routePayload.businessSnapshot === "object"
      ? routePayload.businessSnapshot
      : {};
    const webDirectEntry = getWebDirectEntryState();
    addId(resolveLatestCanonicalMenuRestaurantId(fallbackId));
    addId(safeProfile.canonicalRestaurantId);
    addId(routePayload?.canonicalRestaurantId);
    addId(routeSnapshot.restaurantId);
    addId(webDirectEntry?.canonicalRestaurantId);
    addId(fallbackId);
    addId(getMenuRestaurantForProfile(safeProfile));
    addId(safeProfile.restaurantId);
    addId(routePayload?.restaurantId);
    addId(webDirectEntry?.restaurantId);
    return ids;
  };

  const hasVisibleMenuItemsForIds = (ids = []) => {
    if (!state?.menu || typeof state.menu !== "object") return false;
    const items = Array.isArray(state.menu.items) ? state.menu.items : [];
    if (!items.length) return false;
    const currentMenuRestaurantId = String(state.menu.restaurantId || "").trim();
    if (!currentMenuRestaurantId) return false;
    return ids.map((value) => String(value || "").trim()).filter(Boolean).includes(currentMenuRestaurantId);
  };

  const clearAliasMenuEmptyStateForCanonicalLoad = ({
    requestedRestaurantId = "",
    canonicalRestaurantId = "",
    profile = {}
  } = {}) => {
    const safeCanonicalRestaurantId = String(canonicalRestaurantId || "").trim();
    if (!safeCanonicalRestaurantId || !state?.menu || typeof state.menu !== "object") return;
    const currentMenuRestaurantId = String(state.menu.restaurantId || "").trim();
    if (!currentMenuRestaurantId || currentMenuRestaurantId === safeCanonicalRestaurantId) return;
    const visibleTargetIds = collectVisibleMenuTargetIds(profile);
    const safeRequestedRestaurantId = String(requestedRestaurantId || "").trim();
    const isVisibleAlias = currentMenuRestaurantId === safeRequestedRestaurantId
      || visibleTargetIds.has(currentMenuRestaurantId);
    if (!isVisibleAlias) return;
    const truthState = String(state.menu.truthState || "").trim().toLowerCase();
    const items = Array.isArray(state.menu.items) ? state.menu.items : [];
    const isBlockingEmptyState = !items.length
      && (
        truthState === "knownempty"
        || truthState === "known-empty"
        || truthState === "unknown"
        || truthState === ""
      );
    if (!isBlockingEmptyState) return;
    state.menu = {
      ...state.menu,
      restaurantId: safeCanonicalRestaurantId,
      loading: true,
      error: "",
      source: "public",
      routeSeed: false,
      truthState: "unknown"
    };
  };

  const loadVisiblePublicMenuIds = async (profile = {}, fallbackId = "") => {
    if (!isVisiblePublicMenuFirstSurface()) return;
    const ids = collectVisibleMenuLoadIds(profile, fallbackId);
    if (!ids.length || hasVisibleMenuItemsForIds(ids)) return;
    const canonicalMenuRestaurantId = resolveLatestCanonicalMenuRestaurantId(ids[0]);
    if (canonicalMenuRestaurantId) {
      clearAliasMenuEmptyStateForCanonicalLoad({
        requestedRestaurantId: fallbackId || getMenuRestaurantForProfile(profile),
        canonicalRestaurantId: canonicalMenuRestaurantId,
        profile
      });
    }
    for (const restaurantId of ids) {
      if (!isVisiblePublicMenuFirstSurface()) return;
      if (hasVisibleMenuItemsForIds(ids)) return;
      await Promise.resolve(loadMenuForRestaurant(restaurantId, { source: "public" }));
    }
  };

  const scheduleVisiblePublicMenuRetry = (profile = {}, fallbackId = "") => {
    if (!isVisiblePublicMenuFirstSurface()) return;
    const ids = collectVisibleMenuLoadIds(profile, fallbackId);
    const retryKey = ids.join("|");
    if (!retryKey || visiblePublicMenuRetryTimers.has(retryKey)) return;
    const delays = [120, 450, 1200];
    const timers = delays.map((delay) => setTimeout(() => {
      void Promise.resolve(loadVisiblePublicMenuIds(
        state?.profileView?.profile || profile,
        fallbackId || getMenuRestaurantForProfile(profile)
      )).catch(() => null);
    }, delay));
    const clearTimerSet = () => {
      const activeTimers = visiblePublicMenuRetryTimers.get(retryKey) || [];
      activeTimers.forEach((timerId) => clearTimeout(timerId));
      visiblePublicMenuRetryTimers.delete(retryKey);
    };
    timers.push(setTimeout(clearTimerSet, delays[delays.length - 1] + 500));
    visiblePublicMenuRetryTimers.set(retryKey, timers);
  };

  const resolveCanonicalRestaurantId = async (profile = {}) => {
    const requestedRestaurantId = String(getMenuRestaurantForProfile(profile) || "").trim();
    if (!requestedRestaurantId) return "";
    const cachedCanonicalRestaurantId = String(canonicalRestaurantIdCache.get(requestedRestaurantId) || "").trim();
    const canonicalRestaurantIdHint = String(profile?.canonicalRestaurantId || "").trim();
    const routeCanonicalRestaurantId = resolveRouteCanonicalRestaurantIdHint(profile);
    const visibleTargetIds = collectVisibleMenuTargetIds(profile);
    const isCanonicalHintTrustedByRoute = !!canonicalRestaurantIdHint
      && !!routeCanonicalRestaurantId
      && canonicalRestaurantIdHint === routeCanonicalRestaurantId;
    const shouldTrustCanonicalHintFromVisibleTargets = !!canonicalRestaurantIdHint
      && canonicalRestaurantIdHint !== requestedRestaurantId
      && (isWebDirectMenuVisible() || isNormalWebDirectProfileVisible())
      && visibleTargetIds.has(canonicalRestaurantIdHint)
      && visibleTargetIds.has(requestedRestaurantId);
    if (canonicalRestaurantIdHint) {
      const hintEqualsRequested = canonicalRestaurantIdHint === requestedRestaurantId;
      const hasTrustedCachedHint = cachedCanonicalRestaurantId && cachedCanonicalRestaurantId === canonicalRestaurantIdHint;
      const trustCanonicalHint = !hintEqualsRequested
        || !fetchBusinessProfileDoc
        || hasTrustedCachedHint
        || isCanonicalHintTrustedByRoute
        || shouldTrustCanonicalHintFromVisibleTargets;
      if (trustCanonicalHint) {
        canonicalRestaurantIdCache.set(requestedRestaurantId, canonicalRestaurantIdHint);
        canonicalRestaurantIdCache.set(canonicalRestaurantIdHint, canonicalRestaurantIdHint);
        return canonicalRestaurantIdHint;
      }
    }
    if (cachedCanonicalRestaurantId) return cachedCanonicalRestaurantId;
    if (!fetchBusinessProfileDoc) {
      canonicalRestaurantIdCache.set(requestedRestaurantId, requestedRestaurantId);
      return requestedRestaurantId;
    }
    const currentPromise = canonicalRestaurantIdPromises.get(requestedRestaurantId);
    if (currentPromise) return currentPromise;
    const nextPromise = Promise.resolve(
      fetchBusinessProfileDoc({
        restaurantId: requestedRestaurantId,
        restaurant: profile
      })
    )
      .then((profileDoc) => {
        const resolvedRestaurantId = String(profileDoc?.id || requestedRestaurantId).trim() || requestedRestaurantId;
        canonicalRestaurantIdCache.set(requestedRestaurantId, resolvedRestaurantId);
        canonicalRestaurantIdCache.set(resolvedRestaurantId, resolvedRestaurantId);
        return resolvedRestaurantId;
      })
      .catch(() => requestedRestaurantId)
      .finally(() => {
        canonicalRestaurantIdPromises.delete(requestedRestaurantId);
      });
    canonicalRestaurantIdPromises.set(requestedRestaurantId, nextPromise);
    return nextPromise;
  };

  const resolveProfileRestaurantId = async (profile = {}) => {
    const requestedRestaurantId = String(getMenuRestaurantForProfile(profile) || "").trim();
    if (!requestedRestaurantId) return "";
    const canonicalRestaurantId = await resolveCanonicalRestaurantId(profile);
    if (canonicalRestaurantId && canonicalRestaurantId !== requestedRestaurantId) {
      const visibleProfileView = getVisiblePublicProfileView();
      if (visibleProfileView?.restaurantId === requestedRestaurantId) {
        refreshVisiblePublicProfile({
          restaurantId: canonicalRestaurantId,
          canonicalRestaurantId
        });
      }
    }
    return canonicalRestaurantId || requestedRestaurantId;
  };

  const ensureMenuDataForProfile = (profile = state?.profileView?.profile || state?.userProfile) => {
    const requestedRestaurantId = String(getMenuRestaurantForProfile(profile) || "").trim();
    if (!requestedRestaurantId) return;
    const targetRestaurantId = resolveMenuSurfaceTargetId(profile) || requestedRestaurantId;
    if (hasMatchingVisibleMenuEnsureInFlight(targetRestaurantId, requestedRestaurantId, profile)) {
      scheduleVisiblePublicMenuRetry(profile, requestedRestaurantId);
      return;
    }
    const request = Promise.resolve().then(async () => {
      const restaurantId = await resolveProfileRestaurantId(profile);
      await loadVisiblePublicMenuIds(profile, restaurantId || requestedRestaurantId);
    }).finally(() => {
      if (publicProfileMenuEnsurePromise === request) {
        publicProfileMenuEnsurePromise = null;
        publicProfileMenuEnsureTargetId = "";
      }
    });
    publicProfileMenuEnsurePromise = request;
    publicProfileMenuEnsureTargetId = targetRestaurantId;
    scheduleVisiblePublicMenuRetry(profile, requestedRestaurantId);
  };

  const ensureFocusDataForProfile = (profile = state?.profileView?.profile || state?.userProfile) => {
    const requestedRestaurantId = String(getMenuRestaurantForProfile(profile) || "").trim();
    if (!requestedRestaurantId) return;
    const targetRestaurantId = resolveMenuSurfaceTargetId(profile) || requestedRestaurantId;
    if (hasMatchingVisibleFocusEnsureInFlight(targetRestaurantId, requestedRestaurantId, profile)) return;
    const request = Promise.resolve().then(async () => {
      const restaurantId = await resolveProfileRestaurantId(profile);
      if (!restaurantId) return;
      await Promise.resolve(loadFocusForRestaurant(restaurantId));
    }).finally(() => {
      if (publicProfileFocusEnsurePromise === request) {
        publicProfileFocusEnsurePromise = null;
        publicProfileFocusEnsureTargetId = "";
      }
    });
    publicProfileFocusEnsurePromise = request;
    publicProfileFocusEnsureTargetId = targetRestaurantId;
  };

  const ensurePostsDataForProfile = (profile = state?.profileView?.profile || state?.userProfile) => {
    const requestedRestaurantId = String(getMenuRestaurantForProfile(profile) || "").trim();
    if (!requestedRestaurantId) return;
    if (!showPublicProfile) return;
    const visibleProfileView = getVisiblePublicProfileView();
    if (!visibleProfileView) return;
    const safeProfile = profile && typeof profile === "object" ? profile : {};
    const surfaceTargetRestaurantId = resolveMenuSurfaceTargetId(safeProfile) || requestedRestaurantId;
    if (hasMatchingVisiblePostsEnsureInFlight(surfaceTargetRestaurantId, requestedRestaurantId, safeProfile)) return;
    const request = Promise.resolve().then(async () => {
      const canonicalRestaurantId = await resolveProfileRestaurantId(safeProfile);
      const targetRestaurantId = String(canonicalRestaurantId || requestedRestaurantId || "").trim();
      if (!targetRestaurantId) return;
      let posts = await loadBusinessPostsForRestaurant(targetRestaurantId, {
        skipProfileResolve: !!canonicalRestaurantId
      });
      posts = Array.isArray(posts) ? posts : [];
      if (!posts.length && !canonicalRestaurantId && requestedRestaurantId && requestedRestaurantId !== targetRestaurantId) {
        const fallback = await loadBusinessPostsForRestaurant(requestedRestaurantId);
        posts = Array.isArray(fallback) ? fallback : [];
      }
      const liveProfileView = getVisiblePublicProfileView();
      if (!liveProfileView) return;
      const liveRestaurantId = String(liveProfileView.restaurantId || "").trim();
      const acceptedRestaurantIds = new Set(
        [
          requestedRestaurantId,
          canonicalRestaurantId,
          targetRestaurantId
        ]
          .map((value) => String(value || "").trim())
          .filter(Boolean)
      );
      if (liveRestaurantId && !acceptedRestaurantIds.has(liveRestaurantId)) return;
      const nextPosts = Array.isArray(posts) ? posts : [];
      const resolvedRestaurantId = String(
        nextPosts[0]?.restaurantId
        || nextPosts[0]?.ownerId
        || targetRestaurantId
      ).trim() || targetRestaurantId;
      refreshVisiblePublicProfile({
        restaurantId: resolvedRestaurantId,
        canonicalRestaurantId: canonicalRestaurantId || resolvedRestaurantId,
        postsLoaded: true,
        truthState: nextPosts.length ? "stable" : "empty"
      }, nextPosts);
    }).finally(() => {
      if (publicProfilePostsEnsurePromise === request) {
        publicProfilePostsEnsurePromise = null;
        publicProfilePostsEnsureTargetId = "";
      }
    });
    publicProfilePostsEnsurePromise = request;
    publicProfilePostsEnsureTargetId = surfaceTargetRestaurantId;
  };

  const businessAccountsRuntimeController = createBusinessAccountsRuntimeController({
    ...businessAccountsDeps,
    state: businessAccountsDeps.state || state
  });

  const profileMenuFocusRenderController = createProfileMenuFocusRenderController({
    ...profileMenuDeps,
    state: profileMenuDeps.state || state,
    renderProfileShopCartViewFn: (...args) => renderProfileShopCartView(...args),
    renderProfileShopFavoritesViewFn: (...args) => renderProfileShopFavoritesView(...args),
    renderShopProductListFn: (...args) => renderShopProductList(...args),
    ensurePostsDataForProfileFn: ensurePostsDataForProfile,
    ensureMenuDataForProfileFn: ensureMenuDataForProfile,
    ensureFocusDataForProfileFn: ensureFocusDataForProfile
  });

  return {
    getMenuRestaurantForProfile,
    ensurePostsDataForProfile,
    ensureMenuDataForProfile,
    ensureFocusDataForProfile,
    loadBusinessAccounts: (options = {}) => businessAccountsRuntimeController.loadBusinessAccounts(options),
    renderBusinessAccountsView: () => businessAccountsRuntimeController.renderBusinessAccountsView(),
    bindBusinessAccountsEvents: (documentObj) => businessAccountsRuntimeController.bindBusinessAccountsEvents(documentObj),
    renderPublicProfileView: () => profileMenuFocusRenderController.renderPublicProfileView(),
    renderMenuAdminView: () => profileMenuFocusRenderController.renderMenuAdminView(),
    renderProfileView: () => profileMenuFocusRenderController.renderProfileView()
  };
}
