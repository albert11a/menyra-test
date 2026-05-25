import {
  createEmptyShopCart,
  createEmptyOrdersState,
  createEmptyMenuDetailState,
  createEmptyTableQrState
} from "../common/state-factories.js";
import { clampCropPercentCore } from "../media/crop-utils.js";
import {
  canAddToShopCartCore,
  getCartCountForRestaurantCore
} from "../shop/shop-cart-access-utils.js";
import { normalizeShopCartStateCore } from "../shop/shop-cart-state-utils.js";
import { buildShopVariantKeyCore } from "../shop/shop-variant-utils.js";

const noop = () => {};

function toFunction(candidate, fallback = noop) {
  return typeof candidate === "function" ? candidate : fallback;
}

export function createPublicRouteInitialState() {
  return {
    shopCart: createEmptyShopCart(),
    orders: createEmptyOrdersState(),
    menuDetail: createEmptyMenuDetailState(),
    tableQr: createEmptyTableQrState()
  };
}

export function createPublicRouteStateController({
  state = null,
  storageApi = {},
  profileApi = {}
} = {}) {
  const safeStorage = storageApi.safeStorage || storageApi.safeStorageObj || null;
  const shopCartKey = toFunction(storageApi.shopCartKeyFn || storageApi.shopCartKey, () => "");
  const resolveGuestScopeUid = toFunction(storageApi.resolveGuestScopeUidFn || storageApi.getGuestScopeUid, () => "");
  const isShopCatalogProfile = toFunction(profileApi.isShopCatalogProfileFn || profileApi.isShopCatalogProfile, () => false);
  const isCeoUser = toFunction(profileApi.isCeoUserFn || profileApi.isCeoUser, () => false);
  const hasGlobalCeoAccess = toFunction(profileApi.hasGlobalCeoAccessFn || profileApi.hasGlobalCeoAccess, () => false);

  let menuDetailCloseBound = false;
  let menuDetailDocUnsub = null;
  let menuDetailLikesUnsub = null;
  let menuDetailCommentsUnsub = null;

  function buildShopVariantKey(itemId, { size = "", color = "" } = {}) {
    return buildShopVariantKeyCore(itemId, { size, color });
  }

  function normalizeShopCartState(raw) {
    return normalizeShopCartStateCore(raw, {
      createEmptyShopCartFn: createEmptyShopCart,
      buildShopVariantKeyFn: buildShopVariantKey,
      clampCropPercentFn: clampCropPercentCore
    });
  }

  function saveShopCartToStorage(uid = state?.user?.uid || resolveGuestScopeUid()) {
    const key = shopCartKey(uid);
    if (!key || !safeStorage || typeof safeStorage.setItem !== "function") return;
    try {
      const payload = normalizeShopCartState(state?.shopCart);
      payload.status = "";
      payload.loading = false;
      safeStorage.setItem(key, JSON.stringify(payload));
    } catch {}
  }

  function getCartCountForRestaurant(restaurantId = "") {
    return getCartCountForRestaurantCore(restaurantId, state?.shopCart);
  }

  function canAddToShopCart(profile = state?.profileView?.profile || state?.userProfile) {
    return canAddToShopCartCore(profile, {
      isShopCatalogProfileFn: isShopCatalogProfile,
      currentUserRestaurantId: state?.userProfile?.restaurantId || "",
      allowOwnRestaurantOrdering: isCeoUser() || hasGlobalCeoAccess()
    });
  }

  function getMenuDetailDocUnsub() {
    return menuDetailDocUnsub;
  }

  function setMenuDetailDocUnsub(next) {
    menuDetailDocUnsub = typeof next === "function" ? next : null;
  }

  function getMenuDetailLikesUnsub() {
    return menuDetailLikesUnsub;
  }

  function setMenuDetailLikesUnsub(next) {
    menuDetailLikesUnsub = typeof next === "function" ? next : null;
  }

  function getMenuDetailCommentsUnsub() {
    return menuDetailCommentsUnsub;
  }

  function setMenuDetailCommentsUnsub(next) {
    menuDetailCommentsUnsub = typeof next === "function" ? next : null;
  }

  function stopMenuDetailMetaListeners() {
    if (menuDetailDocUnsub) {
      menuDetailDocUnsub();
      menuDetailDocUnsub = null;
    }
    if (menuDetailLikesUnsub) {
      menuDetailLikesUnsub();
      menuDetailLikesUnsub = null;
    }
    if (menuDetailCommentsUnsub) {
      menuDetailCommentsUnsub();
      menuDetailCommentsUnsub = null;
    }
  }

  function isMenuDetailCloseBound() {
    return menuDetailCloseBound;
  }

  function setMenuDetailCloseBound(next) {
    menuDetailCloseBound = !!next;
  }

  function getSessionStorageApi() {
    return {
      shopCartKey,
      normalizeShopCartState,
      createEmptyShopCart,
      createEmptyOrdersState,
      createEmptyMenuDetailState,
      createEmptyTableQrState
    };
  }

  return {
    createEmptyShopCart,
    createEmptyOrdersState,
    createEmptyMenuDetailState,
    createEmptyTableQrState,
    buildShopVariantKey,
    normalizeShopCartState,
    saveShopCartToStorage,
    getCartCountForRestaurant,
    canAddToShopCart,
    getMenuDetailDocUnsub,
    setMenuDetailDocUnsub,
    getMenuDetailLikesUnsub,
    setMenuDetailLikesUnsub,
    getMenuDetailCommentsUnsub,
    setMenuDetailCommentsUnsub,
    stopMenuDetailMetaListeners,
    isMenuDetailCloseBound,
    setMenuDetailCloseBound,
    resolveGuestScopeUid,
    getSessionStorageApi
  };
}
