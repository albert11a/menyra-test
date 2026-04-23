import { createNotificationsRuntimeFlowControllerCore } from "./notifications-runtime-flow-utils.js";
import {
  normalizeNotificationItemCore,
  mapNotificationSnapshotCore
} from "./notification-item-utils.js";
import {
  shouldSurfaceNativePushNowCore,
  addNotificationItemsToSeenSetCore,
  collectUnseenUnreadNotificationItemsFromChangesCore
} from "./notification-native-push-utils.js";
import {
  buildNotificationsLiveQueryCore,
  buildNotificationsFetchQueryCore,
  fetchNotificationsFromQueryCore
} from "./notification-query-utils.js";

export function createNotificationsRuntimeController(deps = {}) {
  const state = deps.state;
  const db = deps.db || null;
  const documentObj = deps.documentObj || null;
  const pushRuntimeController = deps.pushRuntimeController || null;
  const collection = typeof deps.collectionFn === "function" ? deps.collectionFn : null;
  const query = typeof deps.queryFn === "function" ? deps.queryFn : null;
  const orderBy = typeof deps.orderByFn === "function" ? deps.orderByFn : null;
  const limit = typeof deps.limitFn === "function" ? deps.limitFn : null;
  const onSnapshot = typeof deps.onSnapshotFn === "function" ? deps.onSnapshotFn : null;
  const getDocs = typeof deps.getDocsFn === "function" ? deps.getDocsFn : null;
  const formatRelative = typeof deps.formatRelativeFn === "function" ? deps.formatRelativeFn : null;
  const toDateSafe = typeof deps.toDateSafeFn === "function" ? deps.toDateSafeFn : null;
  const saveNotifications = typeof deps.saveNotificationsFn === "function" ? deps.saveNotificationsFn : (() => {});
  const updateNotificationsDom = typeof deps.updateNotificationsDomFn === "function"
    ? deps.updateNotificationsDomFn
    : (() => false);
  const handleNotificationsUpdate = typeof deps.handleNotificationsUpdateFn === "function"
    ? deps.handleNotificationsUpdateFn
    : (() => {});
  const render = typeof deps.renderFn === "function" ? deps.renderFn : (() => {});
  const notificationsLiveLimit = Math.max(1, Number(deps.notificationsLiveLimit || 12) || 12);
  const fetchLimit = Math.max(1, Number(deps.fetchLimit || 20) || 20);

  let notificationsUnsub = null;

  function createNoopApi() {
    return {
      normalizeNotificationItem: (docSnap) => docSnap,
      mapNotificationSnapshot: (snap) => snap?.docs || [],
      shouldSurfaceNativePushNow: () => false,
      startNotificationsListener: () => {},
      syncNotificationsPushRuntime: async () => false,
      loadNotificationsFromFirebase: async () => [],
      getNotificationsUnsub: () => null,
      stopNotificationsListener: () => {}
    };
  }

  if (!state) {
    return createNoopApi();
  }

  const pushApi = pushRuntimeController && typeof pushRuntimeController === "object"
    ? pushRuntimeController
    : {
        readPushSeenIds: () => [],
        writePushSeenIds: () => {},
        canEmitNativePushAlerts: () => false,
        showNativePushAlert: async () => false,
        setPushActivationIssue: () => {},
        clearPushActivationIssue: () => {},
        ensureNotificationPermission: async () => false,
        syncPushDeviceRegistration: async () => false,
        getPushActivationIssue: () => ""
      };

  const notificationsRuntimeFlowController = createNotificationsRuntimeFlowControllerCore({
    state,
    getNotificationsUnsub: () => notificationsUnsub,
    setNotificationsUnsub: (nextUnsub) => {
      notificationsUnsub = typeof nextUnsub === "function" ? nextUnsub : null;
    },
    normalizeNotificationItemFromDoc: (docSnap) => normalizeNotificationItemCore({
      docSnap,
      formatRelative,
      toDateSafe
    }),
    mapNotificationSnapshotFromSnap: (snap, normalizeNotificationItemFn) => mapNotificationSnapshotCore({
      snap,
      normalizeNotificationItem: (docSnap) => normalizeNotificationItemFn(docSnap)
    }),
    shouldSurfaceNativePushNowFn: () => shouldSurfaceNativePushNowCore({
      documentObj,
      activeTab: state.activeTab
    }),
    buildNotificationsLiveQuery: (ownerUid, liveLimitValue) => buildNotificationsLiveQueryCore({
      db,
      ownerUid,
      collection,
      query,
      orderBy,
      limit,
      liveLimit: liveLimitValue
    }),
    readPushSeenIds: (ownerUid) => pushApi.readPushSeenIds(ownerUid),
    addNotificationItemsToSeenSet: (items, seenIds) => addNotificationItemsToSeenSetCore({ items, seenIds }),
    writePushSeenIds: (ids = [], ownerUid = "") => pushApi.writePushSeenIds(ids, ownerUid),
    canEmitNativePushAlerts: () => pushApi.canEmitNativePushAlerts(),
    collectUnseenUnreadNotificationItemsFromChanges: (changes = [], seenIds = new Set(), normalizeNotificationItemFn) => collectUnseenUnreadNotificationItemsFromChangesCore({
      changes,
      normalizeNotificationItem: (docSnap) => normalizeNotificationItemFn(docSnap),
      seenIds
    }),
    showNativePushAlert: async (item) => await pushApi.showNativePushAlert(item),
    handleNotificationsUpdate: (items) => handleNotificationsUpdate(items),
    subscribeNotifications: (queryRef, onNext, onError) => onSnapshot(queryRef, onNext, onError),
    buildNotificationsFetchQuery: (ownerUid, fetchLimitValue) => buildNotificationsFetchQueryCore({
      db,
      ownerUid,
      collection,
      query,
      orderBy,
      limit,
      fetchLimit: fetchLimitValue
    }),
    fetchNotificationsFromQuery: async (queryRef, mapNotificationSnapshotFn) => await fetchNotificationsFromQueryCore({
      queryRef,
      getDocs,
      mapNotificationSnapshot: (snap) => mapNotificationSnapshotFn(snap)
    }),
    saveNotifications: (notificationsList) => saveNotifications(notificationsList),
    updateNotificationsDom: () => updateNotificationsDom(),
    render: () => render(),
    setPushActivationIssue: (message) => pushApi.setPushActivationIssue(message),
    clearPushActivationIssue: () => pushApi.clearPushActivationIssue(),
    ensureNotificationPermission: async (options = {}) => await pushApi.ensureNotificationPermission(options),
    syncPushDeviceRegistration: async (options = {}) => await pushApi.syncPushDeviceRegistration(options),
    getPushActivationIssue: () => pushApi.getPushActivationIssue(),
    notificationsLiveLimit,
    fetchLimit
  });

  function getNotificationsUnsub() {
    return notificationsUnsub;
  }

  function stopNotificationsListener() {
    const currentUnsub = notificationsUnsub;
    if (typeof currentUnsub === "function") {
      try {
        currentUnsub();
      } catch {}
    }
    notificationsUnsub = null;
  }

  return {
    ...notificationsRuntimeFlowController,
    getNotificationsUnsub,
    stopNotificationsListener
  };
}
