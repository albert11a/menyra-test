import { createMenuPublicRuntimeController } from "../menu/menu-public-runtime-controller.js";
import { createTableQrRuntimeController } from "../menu/table-qr-runtime-controller.js";
import { createPublicProfileDirectEntryController } from "../profile/public-profile-direct-entry-controller.js";

const noop = () => {};
const noopAsync = async () => {};

function toFunction(candidate, fallback = noop) {
  return typeof candidate === "function" ? candidate : fallback;
}

export function createPublicRouteRuntimeCluster({
  state = null,
  db = null,
  menuCache = null,
  constants = {},
  browserApi = {},
  firebaseApi = {},
  storageApi = {},
  menuApi = {},
  shopApi = {},
  socialApi = {},
  profileApi = {},
  renderApi = {},
  publicBootstrapApi = {},
  errorApi = {}
} = {}) {
  const collectionFn = firebaseApi.collectionFn || firebaseApi.collection;
  const queryFn = firebaseApi.queryFn || firebaseApi.query;
  const orderByFn = firebaseApi.orderByFn || firebaseApi.orderBy;
  const limitFn = firebaseApi.limitFn || firebaseApi.limit;
  const docFn = firebaseApi.docFn || firebaseApi.doc;
  const getDocFn = firebaseApi.getDocFn || firebaseApi.getDoc;
  const getDocFromServerFn = firebaseApi.getDocFromServerFn || firebaseApi.getDocFromServer;
  const getDocsFn = firebaseApi.getDocsFn || firebaseApi.getDocs;
  const setDocFn = firebaseApi.setDocFn || firebaseApi.setDoc;
  const serverTimestampFn = firebaseApi.serverTimestampFn || firebaseApi.serverTimestamp;
  const waitForPendingWritesFn = firebaseApi.waitForPendingWritesFn || firebaseApi.waitForPendingWrites;
  const onSnapshotFn = firebaseApi.onSnapshotFn || firebaseApi.onSnapshot;
  const writeBatchFn = firebaseApi.writeBatchFn || firebaseApi.writeBatch;
  const render = toFunction(renderApi.renderFn || renderApi.render);
  const getLastRenderMode = toFunction(renderApi.getLastRenderModeFn || renderApi.getLastRenderMode, () => "");
  const reportCriticalRuntimeFailure = toFunction(
    errorApi.reportCriticalRuntimeFailureFn || errorApi.reportCriticalRuntimeFailure
  );
  const resolveGuestScopeUid = toFunction(storageApi.resolveGuestScopeUidFn || storageApi.getGuestScopeUid, () => "");

  const publicProfileDirectEntryController = createPublicProfileDirectEntryController({
    state,
    resolveVisibleProfileSurface: toFunction(profileApi.resolveVisibleProfileSurfaceFn || profileApi.resolveVisibleProfileSurface, () => null)
  });

  const menuPublicRuntimeController = createMenuPublicRuntimeController({
    state,
    db,
    menuCache,
    collectionFn,
    queryFn,
    orderByFn,
    limitFn,
    docFn,
    getDocFn,
    getDocsFn,
    setDocFn,
    serverTimestampFn,
    createEmptyFavoriteMenuItemsStateFn: toFunction(menuApi.createEmptyFavoriteMenuItemsStateFn || menuApi.createEmptyFavoriteMenuItemsState),
    favoriteMenuItemDocIdFn: toFunction(socialApi.favoriteMenuItemDocIdFn || socialApi.favoriteMenuItemDocId, () => ""),
    buildFavoriteMenuItemPayloadFn: toFunction(socialApi.buildFavoriteMenuItemPayloadFn || socialApi.buildFavoriteMenuItemPayload, () => ({})),
    getMenuItemSocialIdFn: toFunction(socialApi.getMenuItemSocialIdFn || socialApi.getMenuItemSocialId, (item) => String(item?.id || "")),
    normalizeMenuItemDocFn: toFunction(menuApi.normalizeMenuItemDocFn || menuApi.normalizeMenuItemDoc, (data, docId = "") => ({ id: docId, ...(data || {}) })),
    coerceMenuItemsFromDataFn: toFunction(menuApi.coerceMenuItemsFromDataFn || menuApi.coerceMenuItemsFromData, () => []),
    foldMenuTextFn: toFunction(menuApi.foldMenuTextFn || menuApi.foldMenuText, (value = "") => String(value || "")),
    clampCropPercentFn: toFunction(menuApi.clampCropPercentFn || menuApi.clampCropPercent, (value, fallback = 50) => fallback),
    renderFn: render,
    getLastRenderModeFn: getLastRenderMode
  });

  const tableQrRuntimeController = createTableQrRuntimeController({
    state,
    db,
    docFn,
    getDocFn,
    getDocFromServerFn,
    setDocFn,
    serverTimestampFn,
    waitForPendingWritesFn,
    isRestaurantCafeProfileFn: toFunction(profileApi.isRestaurantCafeProfileFn || profileApi.isRestaurantCafeProfile, () => false),
    renderFn: render,
    storageObj: storageApi.safeStorage || storageApi.storageObj || null
  });

  let ordersRuntimeController = null;
  let ordersRuntimeControllerPromise = null;
  let ordersRuntimeStopRequested = false;

  function createOrdersRuntimeControllerConfig() {
    return {
      state,
      db,
      collectionFn,
      docFn,
      getDocFn,
      queryFn,
      orderByFn,
      limitFn,
      onSnapshotFn,
      writeBatchFn,
      serverTimestampFn,
      normalizeShopCartStateFn: toFunction(shopApi.normalizeShopCartStateFn || shopApi.normalizeShopCartState, (raw) => raw || {}),
      isLocalBusinessProfileFn: toFunction(profileApi.isLocalBusinessProfileFn || profileApi.isLocalBusinessProfile, () => false),
      canAccessRestaurantOrdersFn: toFunction(profileApi.canAccessRestaurantOrdersFn || profileApi.canAccessRestaurantOrders, () => false),
      resolveProfileRestaurantIdFn: toFunction(profileApi.resolveProfileRestaurantIdFn || profileApi.resolveProfileRestaurantId, () => ""),
      getRestaurantMetaByIdFn: toFunction(profileApi.getRestaurantMetaByIdFn || profileApi.getRestaurantMetaById, () => null),
      normalizeHandleFn: toFunction(profileApi.normalizeHandleFn || profileApi.normalizeHandle, (value = "") => String(value || "")),
      buildShopVariantKeyFn: toFunction(shopApi.buildShopVariantKeyFn || shopApi.buildShopVariantKey, () => ""),
      clampCropPercentFn: toFunction(menuApi.clampCropPercentFn || menuApi.clampCropPercent, (value, fallback = 50) => fallback),
      parsePriceValueFn: toFunction(shopApi.parsePriceValueFn || shopApi.parsePriceValue, () => 0),
      saveShopCartToStorageFn: toFunction(shopApi.saveShopCartToStorageFn || shopApi.saveShopCartToStorage),
      clearShopCartFn: toFunction(shopApi.clearShopCartFn || shopApi.clearShopCart),
      renderFn: render,
      getLastRenderModeFn: getLastRenderMode,
      safeStorageObj: storageApi.safeStorage || storageApi.storageObj || null,
      guestScopeUid: resolveGuestScopeUid(),
      resolveGuestScopeUidFn: resolveGuestScopeUid
    };
  }

  async function ensureOrdersRuntimeController() {
    if (ordersRuntimeController) return ordersRuntimeController;
    if (!ordersRuntimeControllerPromise) {
      ordersRuntimeControllerPromise = import("../orders/orders-runtime-controller.js")
        .then((module) => {
          const createOrders = module?.createOrdersRuntimeController;
          if (typeof createOrders !== "function") {
            throw new Error("createOrdersRuntimeController unavailable");
          }
          ordersRuntimeController = createOrders(createOrdersRuntimeControllerConfig());
          return ordersRuntimeController;
        })
        .catch((err) => {
          ordersRuntimeControllerPromise = null;
          reportCriticalRuntimeFailure("orders-runtime", err, { suppressAbort: true });
          throw err;
        });
    }
    return ordersRuntimeControllerPromise;
  }

  const ordersRuntimeFacade = {
    stopOrdersListener() {
      ordersRuntimeStopRequested = true;
      if (ordersRuntimeController && typeof ordersRuntimeController.stopOrdersListener === "function") {
        ordersRuntimeController.stopOrdersListener();
      }
    },
    startOrdersListener(user = state?.user) {
      ordersRuntimeStopRequested = false;
      void ensureOrdersRuntimeController()
        .then((controller) => {
          if (ordersRuntimeStopRequested) return;
          if (typeof controller?.startOrdersListener === "function") {
            controller.startOrdersListener(user);
          }
        })
        .catch(() => null);
    },
    async submitShopCheckout(...args) {
      ordersRuntimeStopRequested = false;
      const controller = await ensureOrdersRuntimeController();
      return controller.submitShopCheckout(...args);
    }
  };

  const publicBootstrapDeps = {
    state,
    windowObj: browserApi.windowObj || null,
    fetchFn: browserApi.fetchFn || null,
    abortControllerCtor: browserApi.abortControllerCtor || null,
    defaultPublicBootstrapEndpoint: constants.defaultPublicBootstrapEndpoint || "",
    publicBootstrapEvent: constants.publicBootstrapEvent || "",
    normalizeRestaurantType: toFunction(publicBootstrapApi.normalizeRestaurantTypeFn || publicBootstrapApi.normalizeRestaurantType, (value) => String(value || "").trim()),
    toDateSafe: toFunction(publicBootstrapApi.toDateSafeFn || publicBootstrapApi.toDateSafe, () => null),
    formatRelative: toFunction(publicBootstrapApi.formatRelativeFn || publicBootstrapApi.formatRelative, () => ""),
    mergeRestaurants: toFunction(publicBootstrapApi.mergeRestaurantsFn || publicBootstrapApi.mergeRestaurants, (restaurants) => restaurants),
    writeCache: toFunction(publicBootstrapApi.writeCacheFn || publicBootstrapApi.writeCache),
    readCache: toFunction(publicBootstrapApi.readCacheFn || publicBootstrapApi.readCache, () => null),
    cacheKeys: constants.cacheKeys || {},
    rebuildBusinessLocations: toFunction(publicBootstrapApi.rebuildBusinessLocationsFn || publicBootstrapApi.rebuildBusinessLocations),
    saveFeedPosts: toFunction(publicBootstrapApi.saveFeedPostsFn || publicBootstrapApi.saveFeedPosts),
    normalizeStoryItemsForDisplay: toFunction(publicBootstrapApi.normalizeStoryItemsForDisplayFn || publicBootstrapApi.normalizeStoryItemsForDisplay, (stories) => stories),
    buildStoriesSignature: toFunction(publicBootstrapApi.buildStoriesSignatureFn || publicBootstrapApi.buildStoriesSignature, () => ""),
    setFeedStoriesSignature: toFunction(publicBootstrapApi.setFeedStoriesSignatureFn || publicBootstrapApi.setFeedStoriesSignature),
    queueStoryIdentityHydration: toFunction(publicBootstrapApi.queueStoryIdentityHydrationFn || publicBootstrapApi.queueStoryIdentityHydration),
    syncFeedPostLogos: toFunction(publicBootstrapApi.syncFeedPostLogosFn || publicBootstrapApi.syncFeedPostLogos, () => false),
    updateFeedDom: toFunction(publicBootstrapApi.updateFeedDomFn || publicBootstrapApi.updateFeedDom, () => false),
    render,
    reportCriticalRuntimeFailure,
    getLastRenderMode,
    fastLimits: constants.fastLimits || {}
  };

  return {
    publicProfileDirectEntryController,
    menuPublicRuntimeController,
    tableQrRuntimeController,
    publicBootstrapDeps,
    updateFavoriteMenuItemsLocal: toFunction(menuPublicRuntimeController.updateFavoriteMenuItemsLocal),
    loadFavoriteMenuItems: toFunction(menuPublicRuntimeController.loadFavoriteMenuItems, noopAsync),
    getMenuItemImages: toFunction(menuPublicRuntimeController.getMenuItemImages, () => []),
    isDirectImageUrl: toFunction(menuPublicRuntimeController.isDirectImageUrl, () => false),
    resolveMenuItemHero: toFunction(menuPublicRuntimeController.resolveMenuItemHero, () => ""),
    loadPublicMenuItems: toFunction(menuPublicRuntimeController.loadPublicMenuItems, noopAsync),
    loadLegacyMenuItems: toFunction(menuPublicRuntimeController.loadLegacyMenuItems, noopAsync),
    loadMenuItemsFromCollection: toFunction(menuPublicRuntimeController.loadMenuItemsFromCollection, noopAsync),
    loadMenuMeta: toFunction(menuPublicRuntimeController.loadMenuMeta, noopAsync),
    saveMenuStatusBadgeVisible: toFunction(menuPublicRuntimeController.saveMenuStatusBadgeVisible, noopAsync),
    hasMenuItemImages: toFunction(menuPublicRuntimeController.hasMenuItemImages, () => false),
    fillMenuImagesFromFallback: toFunction(menuPublicRuntimeController.fillMenuImagesFromFallback, () => []),
    publishMenuToPublic: toFunction(menuPublicRuntimeController.publishMenuToPublic, noopAsync),
    loadMenuHybrid: toFunction(menuPublicRuntimeController.loadMenuHybrid, noopAsync),
    menuCacheKey: toFunction(menuPublicRuntimeController.menuCacheKey, () => ""),
    syncMenuCaches: toFunction(menuPublicRuntimeController.syncMenuCaches),
    getTableQrStateForRestaurant: toFunction(tableQrRuntimeController.getTableQrStateForRestaurant, () => ({})),
    ensureTableQrStateForProfile: toFunction(tableQrRuntimeController.ensureTableQrStateForProfile, noopAsync),
    saveTableQrConfig: toFunction(tableQrRuntimeController.saveTableQrConfig, noopAsync),
    stopOrdersListener: ordersRuntimeFacade.stopOrdersListener,
    startOrdersListener: ordersRuntimeFacade.startOrdersListener,
    submitShopCheckout: ordersRuntimeFacade.submitShopCheckout
  };
}
