import { createBusinessAccountsRuntimeController } from "../business-accounts/business-accounts-runtime-controller.js";
import { createProfileMenuFocusRenderController } from "../profile/profile-menu-focus-render-controller.js";
import {
  getMenuRestaurantForProfileCore,
  ensureMenuDataForProfileCore,
  ensureFocusDataForProfileCore
} from "../profile/profile-menu-focus-utils.js";

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

  const ensureMenuDataForProfile = (profile = state?.profileView?.profile || state?.userProfile) => {
    ensureMenuDataForProfileCore(profile, {
      getMenuRestaurantForProfileFn: getMenuRestaurantForProfile,
      loadMenuForRestaurantFn: loadMenuForRestaurant
    });
  };

  const ensureFocusDataForProfile = (profile = state?.profileView?.profile || state?.userProfile) => {
    ensureFocusDataForProfileCore(profile, {
      getMenuRestaurantForProfileFn: getMenuRestaurantForProfile,
      loadFocusForRestaurantFn: loadFocusForRestaurant
    });
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
    ensureMenuDataForProfileFn: ensureMenuDataForProfile,
    ensureFocusDataForProfileFn: ensureFocusDataForProfile
  });

  return {
    getMenuRestaurantForProfile,
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
