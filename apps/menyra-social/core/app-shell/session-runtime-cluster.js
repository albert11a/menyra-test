import { createFollowRuntimeController } from "../follow/follow-runtime-controller.js";
import { createPushRuntimeController } from "../push/push-runtime-controller.js";
import { createNotificationsRuntimeController } from "../notifications/notifications-runtime-controller.js";
import { createNotificationSupportRuntimeController } from "../notifications/notification-support-runtime-controller.js";
import { createSessionTabLifecycleRuntimeController } from "./session-tab-lifecycle-runtime-controller.js";

function createControllerGetter(getValue, name) {
  return function getController() {
    const value = getValue();
    if (!value) {
      throw new Error(`${name} not initialized`);
    }
    return value;
  };
}

export function createSessionRuntimeCluster({
  config = {},
  browserContext = {},
  firebaseApi = {},
  storageApi = {},
  renderApi = {},
  lifecycleApi = {}
} = {}) {
  let followRuntimeController = null;
  let pushRuntimeController = null;
  let notificationsRuntimeController = null;
  let notificationSupportRuntimeController = null;
  let sessionTabLifecycleRuntimeController = null;

  const getFollowRuntimeController = createControllerGetter(() => followRuntimeController, "followRuntimeController");
  const getPushRuntimeController = createControllerGetter(() => pushRuntimeController, "pushRuntimeController");
  const getNotificationsRuntimeController = createControllerGetter(() => notificationsRuntimeController, "notificationsRuntimeController");
  const getNotificationSupportRuntimeController = createControllerGetter(
    () => notificationSupportRuntimeController,
    "notificationSupportRuntimeController"
  );
  const getSessionTabLifecycleRuntimeController = createControllerGetter(
    () => sessionTabLifecycleRuntimeController,
    "sessionTabLifecycleRuntimeController"
  );

  followRuntimeController = createFollowRuntimeController({
    state: lifecycleApi.state,
    db: firebaseApi.db,
    safeStorageObj: storageApi.safeStorageObj,
    collectionFn: firebaseApi.collectionFn,
    onSnapshotFn: firebaseApi.onSnapshotFn,
    followingKeyFn: storageApi.followingKeyFn,
    normalizeFollowHandleFn: storageApi.normalizeFollowHandleFn,
    renderFn: renderApi.renderFn,
    renderOverlaysFn: renderApi.renderOverlaysFn,
    getLastRenderModeFn: renderApi.getLastRenderModeFn
  });

  notificationSupportRuntimeController = createNotificationSupportRuntimeController({
    state: lifecycleApi.state,
    safeStorageObj: storageApi.safeStorageObj,
    notificationsKeyFn: storageApi.notificationsKeyFn,
    functionsObj: firebaseApi.functionsObj,
    httpsCallableFn: firebaseApi.httpsCallableFn
  });

  pushRuntimeController = createPushRuntimeController({
    state: lifecycleApi.state,
    db: firebaseApi.db,
    app: config.app,
    safeStorageObj: storageApi.safeStorageObj,
    windowObj: browserContext.windowObj,
    navigatorObj: browserContext.navigatorObj,
    cryptoObj: browserContext.cryptoObj,
    docFn: firebaseApi.docFn,
    setDocFn: firebaseApi.setDocFn,
    serverTimestampFn: firebaseApi.serverTimestampFn,
    pushSeenKeyFn: storageApi.pushSeenKeyFn,
    pushTokenMetaKeyFn: storageApi.pushTokenMetaKeyFn,
    pushDeviceIdKeyFn: storageApi.pushDeviceIdKeyFn,
    resolveNotificationAvatarFn: renderApi.resolveNotificationAvatarFn,
    brandTitle: config.brandTitle,
    firebaseMessagingModuleUrl: config.firebaseMessagingModuleUrl,
    pushSeenNotificationsLimit: config.pushSeenNotificationsLimit,
    pushTokenSyncIntervalMs: config.pushTokenSyncIntervalMs,
    fcmWebPushVapidKey: config.fcmWebPushVapidKey,
    pushServiceWorkerUrl: config.pushServiceWorkerUrl,
    pushServiceWorkerScope: config.pushServiceWorkerScope,
    pushServiceWorkerReadyTimeoutMs: config.pushServiceWorkerReadyTimeoutMs,
    importModuleFn: browserContext.importModuleFn,
    encodeURIComponentFn: browserContext.encodeURIComponentFn,
    nowFn: browserContext.nowFn,
    randomFn: browserContext.randomFn
  });

  notificationsRuntimeController = createNotificationsRuntimeController({
    state: lifecycleApi.state,
    db: firebaseApi.db,
    documentObj: browserContext.documentObj,
    pushRuntimeController: getPushRuntimeController(),
    collectionFn: firebaseApi.collectionFn,
    queryFn: firebaseApi.queryFn,
    orderByFn: firebaseApi.orderByFn,
    limitFn: firebaseApi.limitFn,
    onSnapshotFn: firebaseApi.onSnapshotFn,
    getDocsFn: firebaseApi.getDocsFn,
    formatRelativeFn: renderApi.formatRelativeFn,
    toDateSafeFn: renderApi.toDateSafeFn,
    saveNotificationsFn: renderApi.saveNotificationsFn,
    updateNotificationsDomFn: renderApi.updateNotificationsDomFn,
    handleNotificationsUpdateFn: renderApi.handleNotificationsUpdateFn,
    renderFn: renderApi.renderFn,
    notificationsLiveLimit: config.notificationsLiveLimit
  });

  sessionTabLifecycleRuntimeController = createSessionTabLifecycleRuntimeController({
    state: lifecycleApi.state,
    dataLoaded: lifecycleApi.dataLoaded,
    FAST_MODE: config.fastMode,
    sanitizeTabForSession: lifecycleApi.sanitizeTabForSession,
    renderFn: renderApi.renderFn,
    startChatThreadsListenerFn: lifecycleApi.startChatThreadsListenerFn,
    stopChatThreadsListenerFn: lifecycleApi.stopChatThreadsListenerFn,
    stopActiveChatMessagesListenerFn: lifecycleApi.stopActiveChatMessagesListenerFn,
    startOrdersListenerFn: lifecycleApi.startOrdersListenerFn,
    stopOrdersListenerFn: lifecycleApi.stopOrdersListenerFn,
    stopRestaurantMetaListenersFn: lifecycleApi.stopRestaurantMetaListenersFn,
    clearIntervalFn: browserContext.clearIntervalFn,
    isCeoUserFn: lifecycleApi.isCeoUserFn,
    queueCrmLazyRenderersPrefetchFn: lifecycleApi.queueCrmLazyRenderersPrefetchFn,
    loadFeedPostsFn: lifecycleApi.loadFeedPostsFn,
    scheduleIdleFn: lifecycleApi.scheduleIdleFn,
    loadRestaurantsFn: lifecycleApi.loadRestaurantsFn,
    isLocalBusinessProfileFn: lifecycleApi.isLocalBusinessProfileFn,
    loadUserPostsFn: lifecycleApi.loadUserPostsFn,
    loadBusinessPostsFn: lifecycleApi.loadBusinessPostsFn,
    loadAuthProfileFn: lifecycleApi.loadAuthProfileFn,
    loadMenuForRestaurantFn: lifecycleApi.loadMenuForRestaurantFn,
    loadFocusForRestaurantFn: lifecycleApi.loadFocusForRestaurantFn,
    getNotificationsUnsubFn: () => getNotificationsRuntimeController().getNotificationsUnsub(),
    updateNotificationsDomFn: renderApi.updateNotificationsDomFn,
    loadNotificationsFromFirebaseFn: async (...args) => await getNotificationsRuntimeController().loadNotificationsFromFirebase(...args),
    stopNotificationsListenerFn: () => getNotificationsRuntimeController().stopNotificationsListener(),
    syncNotificationsPushRuntimeFn: async (...args) => await getNotificationsRuntimeController().syncNotificationsPushRuntime(...args),
    startFollowingListenerFn: (...args) => getFollowRuntimeController().startFollowingListener(...args),
    stopFollowingListenerFn: () => getFollowRuntimeController().stopFollowingListener(),
    attachCurrentUserProfileListenerFn: lifecycleApi.attachCurrentUserProfileListenerFn,
    stopCurrentUserProfileListenerFn: lifecycleApi.stopCurrentUserProfileListenerFn,
    stopProfileViewListenerFn: lifecycleApi.stopProfileViewListenerFn,
    normalizeLeadScopeKeyFn: lifecycleApi.normalizeLeadScopeKeyFn,
    loadLeadsFn: lifecycleApi.loadLeadsFn,
    normalizeCustomerScopeKeyFn: lifecycleApi.normalizeCustomerScopeKeyFn,
    loadCustomersFn: lifecycleApi.loadCustomersFn,
    loadCeoStaffFn: lifecycleApi.loadCeoStaffFn,
    loadBusinessAccountsFn: lifecycleApi.loadBusinessAccountsFn,
    stopExtraLiveListenersFn: lifecycleApi.stopExtraLiveListenersFn
  });

  return {
    getFollowRuntimeController,
    getPushRuntimeController,
    getNotificationsRuntimeController,
    getNotificationSupportRuntimeController,
    getSessionTabLifecycleRuntimeController
  };
}
