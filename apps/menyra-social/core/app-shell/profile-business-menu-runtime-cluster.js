import { createBusinessAccountsRuntimeController } from "../business-accounts/business-accounts-runtime-controller.js";
import { createProfileMenuFocusRenderBoundary } from "../profile/profile-menu-focus-render-boundary.js";
import { getMenuRestaurantForProfileCore } from "../profile/profile-menu-focus-utils.js";
import {
  createCanonicalPublicBusinessContextCore,
  getCanonicalPublicBusinessLoadIds
} from "../profile/canonical-public-business-context-utils.js";
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
  const visiblePublicFocusPrefetchPromises = new Map();
  const visiblePublicFocusLoadPromises = new Map();
  const visiblePublicMenuLoadPromises = new Map();

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

  const buildVisiblePublicBusinessContext = (profile = {}, fallbackId = "") => {
    const visibleProfileView = getVisiblePublicProfileView();
    const safeProfile = profile && typeof profile === "object" ? profile : {};
    const visibleProfile = visibleProfileView?.profile || null;
    const routePayload = getVisibleRoutePayload();
    const webDirectEntry = getWebDirectEntryState();
    const activeProfile = visibleProfile || safeProfile;
    const posts = Array.isArray(visibleProfileView?.view?.posts) ? visibleProfileView.view.posts : [];
    return createCanonicalPublicBusinessContextCore({
      profile: {
        ...(safeProfile || {}),
        ...(activeProfile || {})
      },
      routePayload,
      webDirectEntry,
      userProfile: state?.userProfile || null,
      restaurantId: fallbackId || getMenuRestaurantForProfile(safeProfile),
      accessSource: state?.profileView?.menuAccessSource || "",
      tableNumber: state?.profileView?.tableNumber || 0,
      profileStatus: visibleProfile?.truthState || "",
      menuStatus: state?.menu?.loading ? "loading" : "",
      postsStatus: posts.length ? "ready" : (visibleProfile?.postsLoaded === true ? "empty" : "unknown"),
      lastStableProfileData: visibleProfile || null,
      lastStableMenuData: state?.menu || null,
      lastStablePostsData: posts
    });
  };

  const addTargetId = (targetSet, value = "") => {
    const safeValue = String(value || "").trim();
    if (safeValue) targetSet.add(safeValue);
  };

  const collectVisibleMenuTargetIds = (profile = {}) => {
    const ids = new Set();
    buildVisiblePublicBusinessContext(profile).targetIds.forEach((value) => addTargetId(ids, value));
    return ids;
  };

  const resolveMenuSurfaceTargetId = (profile = {}) => {
    const context = buildVisiblePublicBusinessContext(profile);
    return String(context.canonicalRestaurantId || getCanonicalPublicBusinessLoadIds(context)[0] || "").trim();
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

  const preserveVisiblePublicPostsAfterLoadFailure = ({
    requestedRestaurantId = "",
    canonicalRestaurantId = "",
    targetRestaurantId = ""
  } = {}) => {
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
    if (liveRestaurantId && acceptedRestaurantIds.size && !acceptedRestaurantIds.has(liveRestaurantId)) return;
    const currentPosts = Array.isArray(liveProfileView.view.posts) ? liveProfileView.view.posts : [];
    if (currentPosts.length > 0) return;
    refreshVisiblePublicProfile({
      postsLoaded: false,
      truthState: "error"
    }, currentPosts);
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

  const resolveBusinessTitleImageUrl = (data = {}) => String(
    data?.titleImageUrl
    || data?.coverImageUrl
    || data?.coverUrl
    || data?.heroUrl
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
    const titleImageUrl = resolveBusinessTitleImageUrl(data);
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
    if (titleImageUrl) {
      patch.titleImageUrl = titleImageUrl;
      patch.coverImageUrl = data.coverImageUrl || titleImageUrl;
      patch.coverUrl = data.coverUrl || titleImageUrl;
      patch.heroUrl = data.heroUrl || titleImageUrl;
    }
    if (name) patch.name = name;
    if (location) patch.location = location;
    if (data.address) patch.address = data.address;
    if (data.phone) patch.phone = data.phone;
    if (data.instagram || data.insta) patch.instagram = data.instagram || data.insta;
    if (data.instagramUrl) patch.instagramUrl = data.instagramUrl;
    if (data.tiktok || data.tikTok) patch.tiktok = data.tiktok || data.tikTok;
    if (data.tiktokUrl || data.tikTokUrl) patch.tiktokUrl = data.tiktokUrl || data.tikTokUrl;
    if (Array.isArray(data.coverImages)) patch.coverImages = data.coverImages;
    if (bio) patch.bio = bio;
    if (followers !== undefined) patch.followers = followers;
    if (following !== undefined) patch.following = following;
    if (avatar || titleImageUrl || name || location || bio || followers !== undefined || following !== undefined) {
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

  const resolveCachedCanonicalRestaurantId = (...values) => {
    for (const value of values) {
      const safeValue = String(value || "").trim();
      if (!safeValue) continue;
      const cachedRestaurantId = String(canonicalRestaurantIdCache.get(safeValue) || "").trim();
      if (cachedRestaurantId) return cachedRestaurantId;
    }
    return "";
  };

  const resolveLatestCanonicalMenuRestaurantId = (fallbackId = "", profile = {}) => {
    const context = buildVisiblePublicBusinessContext(profile, fallbackId);
    if (context.canonicalRestaurantId) return context.canonicalRestaurantId;
    const visibleProfileView = getVisiblePublicProfileView();
    const routePayload = getVisibleRoutePayload();
    const routeSnapshot = routePayload?.businessSnapshot && typeof routePayload.businessSnapshot === "object"
      ? routePayload.businessSnapshot
      : {};
    const webDirectEntry = getWebDirectEntryState();
    const cachedCanonicalRestaurantId = resolveCachedCanonicalRestaurantId(
      fallbackId,
      visibleProfileView?.restaurantId,
      visibleProfileView?.profile?.restaurantId,
      routePayload?.restaurantId,
      webDirectEntry?.restaurantId
    );
    const candidates = [
      visibleProfileView?.profile?.canonicalRestaurantId,
      routePayload?.canonicalRestaurantId,
      routeSnapshot?.restaurantId,
      webDirectEntry?.canonicalRestaurantId,
      cachedCanonicalRestaurantId
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
    const context = buildVisiblePublicBusinessContext(safeProfile, fallbackId);
    addId(resolveLatestCanonicalMenuRestaurantId(fallbackId, safeProfile));
    getCanonicalPublicBusinessLoadIds(context).forEach((value) => addId(value));
    const routePayload = getVisibleRoutePayload();
    const webDirectEntry = getWebDirectEntryState();
    addId(resolveCachedCanonicalRestaurantId(
      fallbackId,
      getMenuRestaurantForProfile(safeProfile),
      safeProfile.restaurantId,
      routePayload?.restaurantId,
      webDirectEntry?.restaurantId
    ));
    addId(fallbackId);
    addId(getMenuRestaurantForProfile(safeProfile));
    addId(safeProfile.restaurantId);
    addId(routePayload?.restaurantId);
    addId(webDirectEntry?.restaurantId);
    return ids;
  };

  const hasSeededVisiblePublicMenuTruthForIds = (ids = []) => {
    if (!state?.menu || typeof state.menu !== "object") return false;
    const menuSource = String(state.menu.source || "").trim().toLowerCase();
    if (menuSource !== "public") return false;
    const currentMenuRestaurantId = String(state.menu.restaurantId || "").trim();
    if (!currentMenuRestaurantId) return false;
    const matchesVisibleId = ids.map((value) => String(value || "").trim()).filter(Boolean).includes(currentMenuRestaurantId);
    if (!matchesVisibleId) return false;
    return String(state.menu.truthState || "").trim().toLowerCase() === "seeded"
      && Array.isArray(state.menu.items)
      && state.menu.items.length > 0;
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

  const prefetchVisiblePublicFocus = (restaurantId = "") => {
    const safeRestaurantId = String(restaurantId || "").trim();
    if (!safeRestaurantId) return Promise.resolve(null);
    const activeLoadRequest = visiblePublicFocusLoadPromises.get(safeRestaurantId);
    if (activeLoadRequest) return activeLoadRequest;
    const existingRequest = visiblePublicFocusPrefetchPromises.get(safeRestaurantId);
    if (existingRequest) return existingRequest;
    const request = Promise.resolve(loadFocusForRestaurant(safeRestaurantId, { prefetchOnly: true }))
      .catch(() => null)
      .finally(() => {
        if (visiblePublicFocusPrefetchPromises.get(safeRestaurantId) === request) {
          visiblePublicFocusPrefetchPromises.delete(safeRestaurantId);
        }
      });
    visiblePublicFocusPrefetchPromises.set(safeRestaurantId, request);
    return request;
  };

  const loadVisiblePublicFocus = (restaurantId = "", options = {}) => {
    const safeRestaurantId = String(restaurantId || "").trim();
    if (!safeRestaurantId) return Promise.resolve(null);
    if (options?.prefetchOnly === true) return prefetchVisiblePublicFocus(safeRestaurantId);
    const existingRequest = visiblePublicFocusLoadPromises.get(safeRestaurantId);
    if (existingRequest) return existingRequest;
    const focusPrefetchRequest = visiblePublicFocusPrefetchPromises.get(safeRestaurantId);
    const request = Promise.resolve(focusPrefetchRequest || null)
      .then(() => loadFocusForRestaurant(safeRestaurantId, options))
      .finally(() => {
        if (visiblePublicFocusLoadPromises.get(safeRestaurantId) === request) {
          visiblePublicFocusLoadPromises.delete(safeRestaurantId);
        }
      });
    visiblePublicFocusLoadPromises.set(safeRestaurantId, request);
    return request;
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
    const loadKey = `${ownBusinessProfileMenuSurface ? "own" : "public"}::${ids.join("|")}`;
    const existingMenuLoadRequest = visiblePublicMenuLoadPromises.get(loadKey);
    if (existingMenuLoadRequest) return existingMenuLoadRequest;
    const request = (async () => {
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
      if (hasSeededVisiblePublicMenuTruthForIds(ids)) return;
      for (const restaurantId of ids) {
        if (!isPublicMenuLoadSurface(profile)) return;
        if (hasSeededVisiblePublicMenuTruthForIds(ids)) return;
        const existingFocusRequest = hasMatchingVisibleFocusEnsureInFlight(restaurantId, restaurantId, profile)
          ? publicProfileFocusEnsurePromise
          : null;
        const focusPrefetchRequest = existingFocusRequest
          ? existingFocusRequest
          : prefetchVisiblePublicFocus(restaurantId);
        if (existingFocusRequest) {
          await Promise.resolve(loadMenuForRestaurant(restaurantId, { source: "public" }));
          continue;
        }
        const menuPayload = await Promise.resolve(loadMenuForRestaurant(restaurantId, { source: "public" }));
        const hasMenuItems = Array.isArray(menuPayload?.items)
          ? menuPayload.items.length > 0
          : (
            String(state?.menu?.restaurantId || "").trim() === restaurantId
            && String(state?.menu?.source || "").trim().toLowerCase() === "public"
            && String(state?.menu?.truthState || "").trim().toLowerCase() === "seeded"
            && Array.isArray(state?.menu?.items)
            && state.menu.items.length > 0
          );
        if (!hasMenuItems || hasMatchingVisibleFocusEnsureInFlight(restaurantId, restaurantId, profile)) {
          continue;
        }
        const focusExperienceRequest = Promise.resolve(focusPrefetchRequest)
          .then(() => loadVisiblePublicFocus(restaurantId))
          .finally(() => {
            if (publicProfileFocusEnsurePromise === focusExperienceRequest) {
              publicProfileFocusEnsurePromise = null;
              publicProfileFocusEnsureTargetId = "";
            }
          });
        publicProfileFocusEnsurePromise = focusExperienceRequest;
        publicProfileFocusEnsureTargetId = restaurantId;
      }
    })().finally(() => {
      if (visiblePublicMenuLoadPromises.get(loadKey) === request) {
        visiblePublicMenuLoadPromises.delete(loadKey);
      }
    });
    visiblePublicMenuLoadPromises.set(loadKey, request);
    return request;
  };

  const loadVisiblePublicPostsIds = async (profile = {}, fallbackId = "") => {
    if (!isNormalWebDirectProfileVisible()) return;
    if (!showPublicProfile) return;
    const context = buildVisiblePublicBusinessContext(profile, fallbackId);
    const ids = context.canonicalRestaurantId
      ? [context.canonicalRestaurantId]
      : collectVisibleMenuLoadIds(profile, fallbackId);
    if (!ids.length || getVisiblePostsForCurrentProfile().length) return;
    for (const restaurantId of ids) {
      if (!isNormalWebDirectProfileVisible()) return;
      if (getVisiblePostsForCurrentProfile().length) return;
      const posts = await loadBusinessPostsForRestaurant(restaurantId, {
        skipProfileResolve: true,
        initialPage: true
      });
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

  const scheduleVisiblePublicMenuRetryFromPostsEnsure = (profile = {}, fallbackId = "") => {
    if (!isPublicMenuLoadSurface(profile)) return;
    void Promise.resolve(loadVisiblePublicMenuIds(
      state?.profileView?.profile || profile,
      fallbackId || getMenuRestaurantForProfile(profile)
    )).catch(() => null);
    scheduleVisiblePublicMenuRetry(profile, fallbackId);
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
    const ensureDelays = [7200, 12800];
    ensureDelays.forEach((delay) => {
      timers.push(setTimeout(() => {
        if (getVisiblePostsForCurrentProfile().length) return;
        const nextProfile = state?.profileView?.profile || profile;
        ensurePostsDataForProfile(nextProfile);
      }, delay));
    });
    const clearTimerSet = () => {
      const activeTimers = visiblePublicPostsRetryTimers.get(retryKey) || [];
      activeTimers.forEach((timerId) => clearTimeout(timerId));
      visiblePublicPostsRetryTimers.delete(retryKey);
    };
    timers.push(setTimeout(clearTimerSet, ensureDelays[ensureDelays.length - 1] + 500));
    visiblePublicPostsRetryTimers.set(retryKey, timers);
  };

  const resolveCanonicalRestaurantId = async (profile = {}) => {
    const requestedRestaurantId = String(getMenuRestaurantForProfile(profile) || "").trim();
    if (!requestedRestaurantId) return "";
    const contextCanonicalRestaurantId = buildVisiblePublicBusinessContext(profile, requestedRestaurantId).canonicalRestaurantId;
    if (contextCanonicalRestaurantId && contextCanonicalRestaurantId !== requestedRestaurantId) {
      canonicalRestaurantIdCache.set(requestedRestaurantId, contextCanonicalRestaurantId);
      canonicalRestaurantIdCache.set(contextCanonicalRestaurantId, contextCanonicalRestaurantId);
      void ensureVisibleBusinessIdentityHydration(profile, contextCanonicalRestaurantId);
      return contextCanonicalRestaurantId;
    }
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
      await Promise.resolve(loadVisiblePublicFocus(restaurantId));
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
    scheduleVisiblePublicMenuRetryFromPostsEnsure(profile, requestedRestaurantId);
    scheduleVisiblePublicPostsRetry(profile, requestedRestaurantId);
    const safeProfile = profile && typeof profile === "object" ? profile : {};
    const surfaceTargetRestaurantId = resolveMenuSurfaceTargetId(safeProfile) || requestedRestaurantId;
    if (hasMatchingVisiblePostsEnsureInFlight(surfaceTargetRestaurantId, requestedRestaurantId, safeProfile)) return;
    const requestContext = {
      requestedRestaurantId,
      canonicalRestaurantId: "",
      targetRestaurantId: ""
    };
    const request = Promise.resolve().then(async () => {
      const canonicalRestaurantId = await resolveProfileRestaurantId(safeProfile);
      const targetRestaurantId = String(canonicalRestaurantId || requestedRestaurantId || "").trim();
      requestContext.canonicalRestaurantId = canonicalRestaurantId || "";
      requestContext.targetRestaurantId = targetRestaurantId;
      if (!targetRestaurantId) return;
      let posts = await loadBusinessPostsForRestaurant(targetRestaurantId, {
        skipProfileResolve: !!canonicalRestaurantId,
        initialPage: true
      });
      posts = Array.isArray(posts) ? posts : [];
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
      scheduleVisiblePublicMenuRetryFromPostsEnsure(safeProfile, canonicalRestaurantId || resolvedRestaurantId || requestedRestaurantId);
    }).catch((err) => {
      console.error(err);
      preserveVisiblePublicPostsAfterLoadFailure(requestContext);
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

  const profileMenuFocusRenderController = createProfileMenuFocusRenderBoundary({
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
    preloadProfileMenuFocusRender: () => profileMenuFocusRenderController.preload(),
    ensureProfileMenuFocusRenderLoaded: () => profileMenuFocusRenderController.ensureLoaded(),
    renderPublicProfileView: () => profileMenuFocusRenderController.renderPublicProfileView(),
    renderMenuAdminView: () => profileMenuFocusRenderController.renderMenuAdminView(),
    renderProfileView: () => profileMenuFocusRenderController.renderProfileView()
  };
}
