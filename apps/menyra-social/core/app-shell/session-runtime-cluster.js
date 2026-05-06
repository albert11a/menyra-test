import { createFollowRuntimeController } from "../follow/follow-runtime-controller.js";
import { createNotificationSupportRuntimeController } from "../notifications/notification-support-runtime-controller.js";
import { createSessionTabLifecycleRuntimeController } from "./session-tab-lifecycle-runtime-controller.js";

const PUSH_RUNTIME_MODULE_URL = "../push/push-runtime-controller.js";
const NOTIFICATIONS_RUNTIME_MODULE_URL = "../notifications/notifications-runtime-controller.js";

function createControllerGetter(getValue, name) {
  return function getController() {
    const value = getValue();
    if (!value) {
      throw new Error(`${name} not initialized`);
    }
    return value;
  };
}

function createDeferredPushRuntimeController({
  state = null,
  config = {},
  browserContext = {},
  firebaseApi = {},
  storageApi = {},
  renderApi = {}
} = {}) {
  let controller = null;
  let controllerPromise = null;
  let pushOpenMessageBound = false;
  let pushActivationIssue = "";

  const createControllerConfig = () => ({
    state,
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

  const ensureLoaded = async () => {
    if (controller) return controller;
    if (!controllerPromise) {
      controllerPromise = import("../push/push-runtime-controller.js")
        .then((module) => {
          const createPushRuntimeController = module?.createPushRuntimeController;
          if (typeof createPushRuntimeController !== "function") {
            throw new Error("createPushRuntimeController unavailable");
          }
          controller = createPushRuntimeController(createControllerConfig());
          if (pushOpenMessageBound && typeof controller.markPushOpenMessageBound === "function") {
            controller.markPushOpenMessageBound();
          }
          if (pushActivationIssue && typeof controller.setPushActivationIssue === "function") {
            controller.setPushActivationIssue(pushActivationIssue, null, { silent: true });
          }
          return controller;
        })
        .catch((err) => {
          controllerPromise = null;
          console.warn("[mnyra][push-runtime] lazy load failed", err);
          throw err;
        });
    }
    return controllerPromise;
  };

  const proxy = {
    readPushSeenIds(...args) {
      return typeof controller?.readPushSeenIds === "function" ? controller.readPushSeenIds(...args) : [];
    },
    writePushSeenIds(...args) {
      if (typeof controller?.writePushSeenIds === "function") {
        return controller.writePushSeenIds(...args);
      }
      void ensureLoaded().then((runtime) => runtime.writePushSeenIds?.(...args)).catch(() => null);
    },
    setPushActivationIssue(reason = "", err = null, options = {}) {
      pushActivationIssue = String(reason || "").trim();
      if (typeof controller?.setPushActivationIssue === "function") {
        return controller.setPushActivationIssue(reason, err, options);
      }
    },
    clearPushActivationIssue() {
      pushActivationIssue = "";
      if (typeof controller?.clearPushActivationIssue === "function") {
        return controller.clearPushActivationIssue();
      }
    },
    getPushActivationIssue() {
      return typeof controller?.getPushActivationIssue === "function"
        ? controller.getPushActivationIssue()
        : pushActivationIssue;
    },
    getPushActivationIssueMessage() {
      return typeof controller?.getPushActivationIssueMessage === "function"
        ? controller.getPushActivationIssueMessage()
        : pushActivationIssue;
    },
    canEmitNativePushAlerts() {
      return typeof controller?.canEmitNativePushAlerts === "function"
        ? controller.canEmitNativePushAlerts()
        : false;
    },
    async ensureNotificationPermission(...args) {
      const runtime = await ensureLoaded();
      return await runtime.ensureNotificationPermission(...args);
    },
    async showNativePushAlert(...args) {
      const runtime = await ensureLoaded();
      return await runtime.showNativePushAlert(...args);
    },
    async syncPushDeviceRegistration(...args) {
      const runtime = await ensureLoaded();
      return await runtime.syncPushDeviceRegistration(...args);
    },
    async disablePushDeviceRegistration(...args) {
      const runtime = await ensureLoaded();
      return await runtime.disablePushDeviceRegistration(...args);
    },
    isPushOpenMessageBound() {
      return typeof controller?.isPushOpenMessageBound === "function"
        ? controller.isPushOpenMessageBound()
        : pushOpenMessageBound;
    },
    markPushOpenMessageBound() {
      pushOpenMessageBound = true;
      if (typeof controller?.markPushOpenMessageBound === "function") {
        return controller.markPushOpenMessageBound();
      }
    }
  };

  return {
    proxy,
    ensureLoaded,
    getLoadedController: () => controller
  };
}

function createDeferredNotificationsRuntimeController({
  state = null,
  config = {},
  browserContext = {},
  firebaseApi = {},
  renderApi = {},
  pushRuntimeController = null
} = {}) {
  let controller = null;
  let controllerPromise = null;

  const createControllerConfig = () => ({
    state,
    db: firebaseApi.db,
    documentObj: browserContext.documentObj,
    pushRuntimeController,
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

  const ensureLoaded = async () => {
    if (controller) return controller;
    if (!controllerPromise) {
      controllerPromise = import("../notifications/notifications-runtime-controller.js")
        .then((module) => {
          const createNotificationsRuntimeController = module?.createNotificationsRuntimeController;
          if (typeof createNotificationsRuntimeController !== "function") {
            throw new Error("createNotificationsRuntimeController unavailable");
          }
          controller = createNotificationsRuntimeController(createControllerConfig());
          return controller;
        })
        .catch((err) => {
          controllerPromise = null;
          console.warn("[mnyra][notifications-runtime] lazy load failed", err);
          throw err;
        });
    }
    return controllerPromise;
  };

  const proxy = {
    normalizeNotificationItem(docSnap) {
      return typeof controller?.normalizeNotificationItem === "function"
        ? controller.normalizeNotificationItem(docSnap)
        : docSnap;
    },
    mapNotificationSnapshot(snap) {
      return typeof controller?.mapNotificationSnapshot === "function"
        ? controller.mapNotificationSnapshot(snap)
        : (snap?.docs || []);
    },
    shouldSurfaceNativePushNow() {
      return typeof controller?.shouldSurfaceNativePushNow === "function"
        ? controller.shouldSurfaceNativePushNow()
        : false;
    },
    startNotificationsListener(...args) {
      if (typeof controller?.startNotificationsListener === "function") {
        return controller.startNotificationsListener(...args);
      }
      void ensureLoaded().then((runtime) => runtime.startNotificationsListener?.(...args)).catch(() => null);
    },
    async syncNotificationsPushRuntime(...args) {
      const runtime = await ensureLoaded();
      return await runtime.syncNotificationsPushRuntime(...args);
    },
    async loadNotificationsFromFirebase(...args) {
      const runtime = await ensureLoaded();
      return await runtime.loadNotificationsFromFirebase(...args);
    },
    getNotificationsUnsub() {
      return typeof controller?.getNotificationsUnsub === "function" ? controller.getNotificationsUnsub() : null;
    },
    stopNotificationsListener() {
      if (typeof controller?.stopNotificationsListener === "function") {
        return controller.stopNotificationsListener();
      }
    }
  };

  return {
    proxy,
    ensureLoaded,
    getLoadedController: () => controller
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
  let notificationSupportRuntimeController = null;
  let sessionTabLifecycleRuntimeController = null;

  const getFollowRuntimeController = createControllerGetter(() => followRuntimeController, "followRuntimeController");
  const getNotificationSupportRuntimeController = createControllerGetter(
    () => notificationSupportRuntimeController,
    "notificationSupportRuntimeController"
  );
  const getSessionTabLifecycleRuntimeController = createControllerGetter(
    () => sessionTabLifecycleRuntimeController,
    "sessionTabLifecycleRuntimeController"
  );

  const deferredPushRuntimeController = createDeferredPushRuntimeController({
    state: lifecycleApi.state,
    config,
    browserContext,
    firebaseApi,
    storageApi,
    renderApi
  });
  const pushRuntimeController = deferredPushRuntimeController.proxy;
  const getPushRuntimeController = () => deferredPushRuntimeController.getLoadedController() || pushRuntimeController;

  const deferredNotificationsRuntimeController = createDeferredNotificationsRuntimeController({
    state: lifecycleApi.state,
    config,
    browserContext,
    firebaseApi,
    renderApi,
    pushRuntimeController
  });
  const notificationsRuntimeController = deferredNotificationsRuntimeController.proxy;
  const getNotificationsRuntimeController = () => (
    deferredNotificationsRuntimeController.getLoadedController() || notificationsRuntimeController
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
    writeUserNotificationFn: firebaseApi.writeUserNotificationFn
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
