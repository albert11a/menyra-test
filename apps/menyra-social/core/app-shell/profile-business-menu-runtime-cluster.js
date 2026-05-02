import { createBusinessAccountsRuntimeController } from "../business-accounts/business-accounts-runtime-controller.js";
import { createProfileMenuFocusRenderController } from "../profile/profile-menu-focus-render-controller.js";
import { getMenuRestaurantForProfileCore } from "../profile/profile-menu-focus-utils.js";
import { markMnyraLoadingEventCore as markLoadingEvent } from "../common/loading-diagnostics-utils.js";

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
  const ensureEditorMenuDataForProfile = (profile = {}) => {
    const restaurantId = getMenuRestaurantForProfile(profile);
    if (!restaurantId) return;
    void loadMenuForRestaurant(restaurantId, { source: "collection" });
  };

  let publicProfilePostsEnsurePromise = null;
  let publicProfilePostsEnsureTargetId = "";
  let publicProfileMenuEnsurePromise = null;
  let publicProfileMenuEnsureTargetId = "";
  let publicProfileFocusEnsurePromise = null;
  let publicProfileFocusEnsureTargetId = "";
  const canonicalRestaurantIdPromises = new Map();
  const canonicalRestaurantIdCache = new Map();
  const visiblePublicMenuRetryTimers = new Map();
  const visiblePublicPostsRetryTimers = new Map();
  const visiblePublicPostsFreshReconcileKeys = new Set();
  const visiblePublicIdentityHydrationPromises = new Map();

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
    state?.__webDirectEntry && typeof state.__webDirectEntry === "object" && state.__webDirectEntry.active === true
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

  const isVisiblePublicBusinessSurface = () => isVisiblePublicMenuFirstSurface() || isNormalWebDirectProfileVisible();

  const isVisiblePublicProfileBusinessSurface = (profile = {}) => {
    const activeTab = String(state?.activeTab || "").trim().toLowerCase();
    if (activeTab !== "profile") return false;
    const visibleProfileView = getVisiblePublicProfileView();
    if (!visibleProfileView) return false;
    const visibleProfileTopTab = String(state?.profileTopTab || "").trim().toLowerCase();
    const visibleProfileContentTab = String(state?.profileContentTab || "").trim().toLowerCase();
    const publicProfileSurfaceVisible = (
      visibleProfileTopTab === "profile"
      || visibleProfileTopTab === "menu"
      || visibleProfileTopTab === "cart"
      || visibleProfileContentTab === "posts"
      || visibleProfileContentTab === "menu"
    );
    if (!publicProfileSurfaceVisible) return false;
    const visibleTargetIds = collectVisibleMenuTargetIds(profile);
    return visibleTargetIds.has(visibleProfileView.restaurantId)
      || visibleTargetIds.has(String(visibleProfileView.profile?.restaurantId || "").trim())
      || visibleTargetIds.has(String(visibleProfileView.profile?.canonicalRestaurantId || "").trim());
  };

  const collectProfileRestaurantIds = (profile = {}) => {
    const ids = new Set();
    const safeProfile = profile && typeof profile === "object" ? profile : {};
    [
      safeProfile.canonicalRestaurantId,
      safeProfile.restaurantId,
      getMenuRestaurantForProfile(safeProfile)
    ].forEach((value) => addTargetId(ids, value));
    return ids;
  };

  const isOwnBusinessProfileMenuSurface = (profile = {}) => {
    const activeTab = String(state?.activeTab || "").trim().toLowerCase();
    const profileTopTab = String(state?.profileTopTab || "").trim().toLowerCase();
    const profileContentTab = String(state?.profileContentTab || "").trim().toLowerCase();
    if (activeTab !== "profile" || (profileTopTab !== "menu" && profileContentTab !== "menu")) return false;
    if (state?.profileView?.profile) return false;
    const profileIds = collectProfileRestaurantIds(profile);
    const ownProfileIds = collectProfileRestaurantIds(state?.userProfile);
    if (!profileIds.size || !ownProfileIds.size) return false;
    return Array.from(profileIds).some((id) => ownProfileIds.has(id));
  };

  const collectOwnBusinessMenuLoadIds = (profile = {}, fallbackId = "") => {
    const ids = [];
    const addId = (value = "") => {
      const safeValue = String(value || "").trim();
      if (safeValue && !ids.includes(safeValue)) ids.push(safeValue);
    };
    const safeProfile = profile && typeof profile === "object" ? profile : {};
    addId(safeProfile.canonicalRestaurantId);
    addId(safeProfile.restaurantId);
    addId(getMenuRestaurantForProfile(safeProfile));
    addId(fallbackId);
    return ids;
  };

  const isPublicMenuLoadSurface = (profile = {}) => {
    return isVisiblePublicBusinessSurface()
      || isVisiblePublicProfileBusinessSurface(profile)
      || isOwnBusinessProfileMenuSurface(profile);
  };

  const hasMatchingVisibleMenuEnsureInFlight = (targetId = "", requestedId = "", profile = {}) => {
    if (!publicProfileMenuEnsurePromise) return false;
    const activeTargetId = String(publicProfileMenuEnsureTargetId || "").trim();
    const safeTargetId = String(targetId || "").trim();
    const safeRequestedId = String(requestedId || "").trim();
    if (!activeTargetId) return false;
    if (activeTargetId === safeTargetId || activeTargetId === safeRequestedId) return true;
    if (!isVisiblePublicBusinessSurface()) return false;
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
    if (!isVisiblePublicBusinessSurface()) return false;
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
    if (!isVisiblePublicBusinessSurface()) return false;
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

  const buildPostsSignature = (posts = []) => (Array.isArray(posts) ? posts : [])
    .map((post) => [
      post?.id,
      post?.url,
      post?.caption,
      post?.createdAt?.seconds || post?.createdAt || ""
    ].map((value) => String(value || "").trim()).join(":"))
    .join("|");

  const queueVisiblePublicPostsReconcile = (restaurantId = "") => {
    const safeRestaurantId = String(restaurantId || "").trim();
    if (!safeRestaurantId || visiblePublicPostsFreshReconcileKeys.has(safeRestaurantId)) return;
    visiblePublicPostsFreshReconcileKeys.add(safeRestaurantId);
    Promise.resolve(loadBusinessPostsForRestaurant(safeRestaurantId, {
      skipProfileResolve: true,
      force: true
    }))
      .then((freshPosts) => {
        const nextPosts = Array.isArray(freshPosts) ? freshPosts : [];
        const liveProfileView = getVisiblePublicProfileView();
        if (!liveProfileView) return;
        const visibleTargetIds = collectVisibleMenuTargetIds(liveProfileView.profile);
        if (!visibleTargetIds.has(safeRestaurantId) && liveProfileView.restaurantId !== safeRestaurantId) return;
        const currentPosts = Array.isArray(liveProfileView.view.posts) ? liveProfileView.view.posts : [];
        if (buildPostsSignature(currentPosts) === buildPostsSignature(nextPosts)) return;
        refreshVisiblePublicProfile({
          restaurantId: safeRestaurantId,
          canonicalRestaurantId: safeRestaurantId,
          postsLoaded: true,
          truthState: nextPosts.length ? "stable" : "empty"
        }, nextPosts);
      })
      .catch(() => null)
      .finally(() => {
        visiblePublicPostsFreshReconcileKeys.delete(safeRestaurantId);
      });
  };

  const resolveBusinessAvatarUrl = (data = {}) => String(
    data?.logoUrl
    || data?.logoURL
    || data?.logo
    || data?.avatarUrl
    || data?.avatarURL
    || data?.avatar
    || data?.photoURL
    || data?.photoUrl
    || data?.imageUrl
    || data?.imageURL
    || data?.image
    || data?.coverLogoUrl
    || ""
  ).trim();

  const normalizeProfileDocPayload = (profileDoc = null) => {
    const data = profileDoc?.data && typeof profileDoc.data === "object"
      ? profileDoc.data
      : (profileDoc && typeof profileDoc === "object" ? profileDoc : {});
    const id = String(profileDoc?.id || data?.id || "").trim();
    return { id, data };
  };

  const refreshVisibleBusinessIdentityFromDoc = (restaurantId = "", data = {}) => {
    const safeRestaurantId = String(restaurantId || "").trim();
    if (!safeRestaurantId || !data || typeof data !== "object") return false;
    const visibleProfileView = getVisiblePublicProfileView();
    if (!visibleProfileView) return false;
    const visibleTargetIds = collectVisibleMenuTargetIds(visibleProfileView.profile);
    if (!visibleTargetIds.has(safeRestaurantId) && visibleProfileView.restaurantId !== safeRestaurantId) return false;
    const avatar = resolveBusinessAvatarUrl(data);
    const name = String(data.name || data.restaurantName || data.displayName || data.businessName || "").trim();
    const location = String(data.city || data.address || data.location || "").trim();
    const bio = String(data.bio || data.description || data.about || "").trim();
    const followers = data.followersCount ?? data.followers;
    const following = data.followingCount ?? data.following;
    const patch = {
      restaurantId: safeRestaurantId,
      canonicalRestaurantId: safeRestaurantId
    };
    if (avatar) patch.avatar = avatar;
    if (name) patch.name = name;
    if (location) patch.location = location;
    if (bio) patch.bio = bio;
    if (followers !== undefined) patch.followers = followers;
    if (following !== undefined) patch.following = following;
    if (avatar || name || location || bio || followers !== undefined || following !== undefined) {
      patch.identityTruthState = "ready";
    }
    return refreshVisiblePublicProfile(patch);
  };

  const ensureVisibleBusinessIdentityHydration = (profile = {}, fallbackId = "") => {
    if (!fetchBusinessProfileDoc || !isVisiblePublicBusinessSurface()) return null;
    const restaurantId = String(
      resolveLatestCanonicalMenuRestaurantId(fallbackId)
      || resolveMenuSurfaceTargetId(profile)
      || getMenuRestaurantForProfile(profile)
      || fallbackId
      || ""
    ).trim();
    if (!restaurantId) return null;
    const visibleProfileView = getVisiblePublicProfileView();
    if (!visibleProfileView) return null;
    const visibleTargetIds = collectVisibleMenuTargetIds(visibleProfileView.profile);
    if (!visibleTargetIds.has(restaurantId) && visibleProfileView.restaurantId !== restaurantId) return null;
    const currentAvatar = String(visibleProfileView.profile?.avatar || "").trim();
    const identityReady = String(visibleProfileView.profile?.identityTruthState || "").trim().toLowerCase() === "ready";
    if (currentAvatar && identityReady) return null;
    const currentRequest = visiblePublicIdentityHydrationPromises.get(restaurantId);
    if (currentRequest) return currentRequest;
    const request = Promise.resolve(fetchBusinessProfileDoc({
      restaurantId,
      restaurant: profile
    }))
      .then((profileDoc) => {
        const { id, data } = normalizeProfileDocPayload(profileDoc);
        const resolvedRestaurantId = id || restaurantId;
        if (data && typeof data === "object") {
          refreshVisibleBusinessIdentityFromDoc(resolvedRestaurantId, data);
        }
      })
      .catch(() => null)
      .finally(() => {
        if (visiblePublicIdentityHydrationPromises.get(restaurantId) === request) {
          visiblePublicIdentityHydrationPromises.delete(restaurantId);
        }
      });
    visiblePublicIdentityHydrationPromises.set(restaurantId, request);
    return request;
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

  const hasSettledVisiblePublicMenuTruthForIds = (ids = []) => {
    if (!state?.menu || typeof state.menu !== "object") return false;
    const menuSource = String(state.menu.source || "").trim().toLowerCase();
    if (menuSource !== "public") return false;
    const currentMenuRestaurantId = String(state.menu.restaurantId || "").trim();
    if (!currentMenuRestaurantId) return false;
    const matchesVisibleId = ids.map((value) => String(value || "").trim()).filter(Boolean).includes(currentMenuRestaurantId);
    if (!matchesVisibleId) return false;
    const menuTruthState = String(state.menu.truthState || "").trim().toLowerCase();
    return menuTruthState === "seeded"
      || menuTruthState === "knownempty"
      || menuTruthState === "known-empty";
  };

  const hasConfirmedPublicMenuItemsForFocus = (ids = []) => {
    if (!state?.menu || typeof state.menu !== "object") return false;
    const menuSource = String(state.menu.source || "").trim().toLowerCase();
    if (menuSource !== "public") return false;
    const menuTruthState = String(state.menu.truthState || "").trim().toLowerCase();
    if (menuTruthState !== "seeded") return false;
    const items = Array.isArray(state.menu.items) ? state.menu.items : [];
    if (!items.length) return false;
    const currentMenuRestaurantId = String(state.menu.restaurantId || "").trim();
    if (!currentMenuRestaurantId) return false;
    return ids.map((value) => String(value || "").trim()).filter(Boolean).includes(currentMenuRestaurantId);
  };

  const getVisiblePostsForCurrentProfile = () => {
    const view = state?.profileView && typeof state.profileView === "object" ? state.profileView : null;
    return Array.isArray(view?.posts) ? view.posts : [];
  };

  const clearAliasMenuEmptyStateForCanonicalLoad = ({
    requestedRestaurantId = "",
    canonicalRestaurantId = "",
    profile = {}
  } = {}) => {
    const safeCanonicalRestaurantId = String(canonicalRestaurantId || "").trim();
    if (!safeCanonicalRestaurantId || !state?.menu || typeof state.menu !== "object") return;
    if (String(state.menu.source || "").trim().toLowerCase() !== "public") return;
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
    const ownBusinessProfileMenuSurface = isOwnBusinessProfileMenuSurface(profile);
    if (!isPublicMenuLoadSurface(profile)) return;
    void ensureVisibleBusinessIdentityHydration(profile, fallbackId);
    const ids = ownBusinessProfileMenuSurface
      ? collectOwnBusinessMenuLoadIds(profile, fallbackId)
      : collectVisibleMenuLoadIds(profile, fallbackId);
    if (!ids.length) return;
    const canonicalMenuRestaurantId = ownBusinessProfileMenuSurface
      ? ids[0]
      : resolveLatestCanonicalMenuRestaurantId(ids[0]);
    if (canonicalMenuRestaurantId) {
      clearAliasMenuEmptyStateForCanonicalLoad({
        requestedRestaurantId: fallbackId || getMenuRestaurantForProfile(profile),
        canonicalRestaurantId: canonicalMenuRestaurantId,
        profile
      });
    }
    if (hasSettledVisiblePublicMenuTruthForIds(ids)) return;
    for (const restaurantId of ids) {
      if (!isPublicMenuLoadSurface(profile)) return;
      if (hasSettledVisiblePublicMenuTruthForIds(ids)) return;
      const existingFocusRequest = hasMatchingVisibleFocusEnsureInFlight(restaurantId, restaurantId, profile)
        ? publicProfileFocusEnsurePromise
        : null;
      if (existingFocusRequest) {
        await Promise.all([
          Promise.resolve(loadMenuForRestaurant(restaurantId, { source: "public" })),
          existingFocusRequest
        ]);
        continue;
      }
      const focusExperienceRequest = Promise.all([
        Promise.resolve(loadFocusForRestaurant(restaurantId)),
        Promise.resolve(loadMenuForRestaurant(restaurantId, { source: "public" }))
      ])
        .finally(() => {
          if (publicProfileFocusEnsurePromise === focusExperienceRequest) {
            publicProfileFocusEnsurePromise = null;
            publicProfileFocusEnsureTargetId = "";
          }
        });
      publicProfileFocusEnsurePromise = focusExperienceRequest;
      publicProfileFocusEnsureTargetId = restaurantId;
      await focusExperienceRequest;
    }
  };

  const loadVisiblePublicPostsIds = async (profile = {}, fallbackId = "") => {
    if (!isNormalWebDirectProfileVisible()) return;
    if (!showPublicProfile) return;
    const ids = collectVisibleMenuLoadIds(profile, fallbackId);
    if (!ids.length || getVisiblePostsForCurrentProfile().length) return;
    for (const restaurantId of ids) {
      if (!isNormalWebDirectProfileVisible()) return;
      if (getVisiblePostsForCurrentProfile().length) return;
      const posts = await loadBusinessPostsForRestaurant(restaurantId, { skipProfileResolve: true });
      const safePosts = Array.isArray(posts) ? posts : [];
      if (!safePosts.length) continue;
      const liveProfileView = getVisiblePublicProfileView();
      if (!liveProfileView) return;
      const visibleTargetIds = collectVisibleMenuTargetIds(liveProfileView.profile);
      if (!visibleTargetIds.has(restaurantId) && liveProfileView.restaurantId !== restaurantId) continue;
      refreshVisiblePublicProfile({
        restaurantId,
        canonicalRestaurantId: restaurantId,
        postsLoaded: true,
        truthState: "stable"
      }, safePosts);
      const resolvedPostsRestaurantId = String(safePosts[0]?.restaurantId || safePosts[0]?.ownerId || restaurantId).trim() || restaurantId;
      queueVisiblePublicPostsReconcile(resolvedPostsRestaurantId);
      return;
    }
  };

  const scheduleVisiblePublicMenuRetry = (profile = {}, fallbackId = "") => {
    if (!isPublicMenuLoadSurface(profile)) return;
    const ids = isOwnBusinessProfileMenuSurface(profile)
      ? collectOwnBusinessMenuLoadIds(profile, fallbackId)
      : collectVisibleMenuLoadIds(profile, fallbackId);
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

  const scheduleVisiblePublicPostsRetry = (profile = {}, fallbackId = "") => {
    if (!isNormalWebDirectProfileVisible()) return;
    const ids = collectVisibleMenuLoadIds(profile, fallbackId);
    const retryKey = ids.join("|");
    if (!retryKey || visiblePublicPostsRetryTimers.has(retryKey)) return;
    const delays = [120, 450, 1200];
    const timers = delays.map((delay) => setTimeout(() => {
      void Promise.resolve(loadVisiblePublicPostsIds(
        state?.profileView?.profile || profile,
        fallbackId || getMenuRestaurantForProfile(profile)
      )).catch(() => null);
    }, delay));
    const clearTimerSet = () => {
      const activeTimers = visiblePublicPostsRetryTimers.get(retryKey) || [];
      activeTimers.forEach((timerId) => clearTimeout(timerId));
      visiblePublicPostsRetryTimers.delete(retryKey);
    };
    timers.push(setTimeout(clearTimerSet, delays[delays.length - 1] + 500));
    visiblePublicPostsRetryTimers.set(retryKey, timers);
  };

  const resolveCanonicalRestaurantId = async (profile = {}) => {
    const requestedRestaurantId = String(getMenuRestaurantForProfile(profile) || "").trim();
    if (!requestedRestaurantId) return "";
    const cachedCanonicalRestaurantId = String(canonicalRestaurantIdCache.get(requestedRestaurantId) || "").trim();
    const canonicalRestaurantIdHint = String(profile?.canonicalRestaurantId || "").trim();
    if (canonicalRestaurantIdHint) {
      const hintEqualsRequested = canonicalRestaurantIdHint === requestedRestaurantId;
      const hasTrustedCachedHint = cachedCanonicalRestaurantId && cachedCanonicalRestaurantId === canonicalRestaurantIdHint;
      const trustCanonicalHint = !hintEqualsRequested
        || !fetchBusinessProfileDoc
        || hasTrustedCachedHint;
      if (trustCanonicalHint) {
        canonicalRestaurantIdCache.set(requestedRestaurantId, canonicalRestaurantIdHint);
        canonicalRestaurantIdCache.set(canonicalRestaurantIdHint, canonicalRestaurantIdHint);
        void ensureVisibleBusinessIdentityHydration(profile, canonicalRestaurantIdHint);
        return canonicalRestaurantIdHint;
      }
    }
    if (cachedCanonicalRestaurantId) {
      void ensureVisibleBusinessIdentityHydration(profile, cachedCanonicalRestaurantId);
      return cachedCanonicalRestaurantId;
    }
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
        const { id, data } = normalizeProfileDocPayload(profileDoc);
        const resolvedRestaurantId = String(id || requestedRestaurantId).trim() || requestedRestaurantId;
        refreshVisibleBusinessIdentityFromDoc(resolvedRestaurantId, data);
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
    void ensureVisibleBusinessIdentityHydration(profile, requestedRestaurantId);
    const targetRestaurantId = resolveMenuSurfaceTargetId(profile) || requestedRestaurantId;
    if (hasMatchingVisibleMenuEnsureInFlight(targetRestaurantId, requestedRestaurantId, profile)) {
      scheduleVisiblePublicMenuRetry(profile, requestedRestaurantId);
      return;
    }
    const request = Promise.resolve().then(async () => {
      markLoadingEvent("profile.menu.ensure", {
        requestedId: requestedRestaurantId,
        targetId: targetRestaurantId,
        source: "public"
      });
      const firstLoadId = targetRestaurantId || requestedRestaurantId;
      const firstLoad = firstLoadId
        ? Promise.resolve(loadVisiblePublicMenuIds(profile, firstLoadId)).catch(() => null)
        : Promise.resolve(null);
      const restaurantId = await resolveProfileRestaurantId(profile);
      void ensureVisibleBusinessIdentityHydration(profile, restaurantId || requestedRestaurantId);
      if (restaurantId && restaurantId !== firstLoadId) {
        await loadVisiblePublicMenuIds(profile, restaurantId);
      }
      await firstLoad;
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
    if (isPublicMenuLoadSurface(profile)) {
      const ids = collectVisibleMenuLoadIds(profile, requestedRestaurantId);
      if (!hasConfirmedPublicMenuItemsForFocus(ids.length ? ids : [targetRestaurantId, requestedRestaurantId])) return;
    }
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
    void ensureVisibleBusinessIdentityHydration(profile, requestedRestaurantId);
    scheduleVisiblePublicMenuRetry(profile, requestedRestaurantId);
    scheduleVisiblePublicPostsRetry(profile, requestedRestaurantId);
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
      if (!posts.length && requestedRestaurantId && requestedRestaurantId !== targetRestaurantId) {
        const fallback = await loadBusinessPostsForRestaurant(requestedRestaurantId, { skipProfileResolve: true });
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
      queueVisiblePublicPostsReconcile(resolvedRestaurantId);
      scheduleVisiblePublicMenuRetry(safeProfile, canonicalRestaurantId || resolvedRestaurantId || requestedRestaurantId);
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
    ensureEditorMenuDataForProfileFn: ensureEditorMenuDataForProfile,
    ensureFocusDataForProfileFn: ensureFocusDataForProfile
  });

  return {
    getMenuRestaurantForProfile,
    ensurePostsDataForProfile,
    ensureMenuDataForProfile,
    ensureEditorMenuDataForProfile,
    ensureFocusDataForProfile,
    loadBusinessAccounts: (options = {}) => businessAccountsRuntimeController.loadBusinessAccounts(options),
    renderBusinessAccountsView: () => businessAccountsRuntimeController.renderBusinessAccountsView(),
    bindBusinessAccountsEvents: (documentObj) => businessAccountsRuntimeController.bindBusinessAccountsEvents(documentObj),
    renderPublicProfileView: () => profileMenuFocusRenderController.renderPublicProfileView(),
    renderMenuAdminView: () => profileMenuFocusRenderController.renderMenuAdminView(),
    renderProfileView: () => profileMenuFocusRenderController.renderProfileView()
  };
}
