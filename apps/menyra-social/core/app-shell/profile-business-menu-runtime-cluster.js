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

  const resolveCanonicalRestaurantId = async (profile = {}) => {
    const requestedRestaurantId = String(getMenuRestaurantForProfile(profile) || "").trim();
    if (!requestedRestaurantId) return "";
    const canonicalRestaurantIdHint = String(profile?.canonicalRestaurantId || "").trim();
    if (canonicalRestaurantIdHint) {
      canonicalRestaurantIdCache.set(requestedRestaurantId, canonicalRestaurantIdHint);
      canonicalRestaurantIdCache.set(canonicalRestaurantIdHint, canonicalRestaurantIdHint);
      return canonicalRestaurantIdHint;
    }
    const cachedCanonicalRestaurantId = String(canonicalRestaurantIdCache.get(requestedRestaurantId) || "").trim();
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
    if (publicProfileMenuEnsurePromise && publicProfileMenuEnsureTargetId === requestedRestaurantId) return;
    const request = Promise.resolve().then(async () => {
      const restaurantId = await resolveProfileRestaurantId(profile);
      if (!restaurantId) return;
      await Promise.resolve(loadMenuForRestaurant(restaurantId, { source: "public" }));
    }).finally(() => {
      if (publicProfileMenuEnsurePromise === request) {
        publicProfileMenuEnsurePromise = null;
        publicProfileMenuEnsureTargetId = "";
      }
    });
    publicProfileMenuEnsurePromise = request;
    publicProfileMenuEnsureTargetId = requestedRestaurantId;
  };

  const ensureFocusDataForProfile = (profile = state?.profileView?.profile || state?.userProfile) => {
    const requestedRestaurantId = String(getMenuRestaurantForProfile(profile) || "").trim();
    if (!requestedRestaurantId) return;
    if (publicProfileFocusEnsurePromise && publicProfileFocusEnsureTargetId === requestedRestaurantId) return;
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
    publicProfileFocusEnsureTargetId = requestedRestaurantId;
  };

  const ensurePostsDataForProfile = (profile = state?.profileView?.profile || state?.userProfile) => {
    const requestedRestaurantId = String(getMenuRestaurantForProfile(profile) || "").trim();
    if (!requestedRestaurantId) return;
    if (!showPublicProfile) return;
    const visibleProfileView = getVisiblePublicProfileView();
    if (!visibleProfileView) return;
    if (publicProfilePostsEnsurePromise && publicProfilePostsEnsureTargetId === requestedRestaurantId) return;
    const request = Promise.resolve().then(async () => {
      const safeProfile = profile && typeof profile === "object" ? profile : {};
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
    publicProfilePostsEnsureTargetId = requestedRestaurantId;
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
