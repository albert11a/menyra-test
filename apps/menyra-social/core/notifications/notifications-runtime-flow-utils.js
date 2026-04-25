export function createNotificationsRuntimeFlowControllerCore({
  state,
  getNotificationsUnsub,
  setNotificationsUnsub,
  normalizeNotificationItemFromDoc,
  mapNotificationSnapshotFromSnap,
  shouldSurfaceNativePushNowFn,
  buildNotificationsLiveQuery,
  readPushSeenIds,
  addNotificationItemsToSeenSet,
  writePushSeenIds,
  canEmitNativePushAlerts,
  collectUnseenUnreadNotificationItemsFromChanges,
  showNativePushAlert,
  handleNotificationsUpdate,
  subscribeNotifications,
  buildNotificationsFetchQuery,
  fetchNotificationsFromQuery,
  saveNotifications,
  updateNotificationsDom,
  render,
  setPushActivationIssue,
  clearPushActivationIssue,
  ensureNotificationPermission,
  syncPushDeviceRegistration,
  getPushActivationIssue,
  notificationsLiveLimit = 12,
  fetchLimit = 20
} = {}) {
  const readNotificationsUnsub = typeof getNotificationsUnsub === "function"
    ? getNotificationsUnsub
    : (() => null);
  const writeNotificationsUnsub = typeof setNotificationsUnsub === "function"
    ? setNotificationsUnsub
    : (() => {});
  const normalizeNotification = typeof normalizeNotificationItemFromDoc === "function"
    ? normalizeNotificationItemFromDoc
    : ((docSnap) => docSnap);
  const mapSnapshot = typeof mapNotificationSnapshotFromSnap === "function"
    ? mapNotificationSnapshotFromSnap
    : ((snap) => snap?.docs || []);
  const shouldSurfaceNativePush = typeof shouldSurfaceNativePushNowFn === "function"
    ? shouldSurfaceNativePushNowFn
    : (() => false);
  const buildLiveQuery = typeof buildNotificationsLiveQuery === "function"
    ? buildNotificationsLiveQuery
    : (() => null);
  const readSeenIds = typeof readPushSeenIds === "function"
    ? readPushSeenIds
    : (() => []);
  const addItemsToSeenSet = typeof addNotificationItemsToSeenSet === "function"
    ? addNotificationItemsToSeenSet
    : (() => {});
  const persistSeenIds = typeof writePushSeenIds === "function"
    ? writePushSeenIds
    : (() => {});
  const canEmitNativePush = typeof canEmitNativePushAlerts === "function"
    ? canEmitNativePushAlerts
    : (() => false);
  const collectNativeItems = typeof collectUnseenUnreadNotificationItemsFromChanges === "function"
    ? collectUnseenUnreadNotificationItemsFromChanges
    : (() => []);
  const showNativePush = typeof showNativePushAlert === "function"
    ? showNativePushAlert
    : (async () => false);
  const handleNotifications = typeof handleNotificationsUpdate === "function"
    ? handleNotificationsUpdate
    : (() => {});
  const subscribe = typeof subscribeNotifications === "function"
    ? subscribeNotifications
    : (() => null);
  const buildFetchQuery = typeof buildNotificationsFetchQuery === "function"
    ? buildNotificationsFetchQuery
    : (() => null);
  const fetchNotifications = typeof fetchNotificationsFromQuery === "function"
    ? fetchNotificationsFromQuery
    : (async () => []);
  const persistNotifications = typeof saveNotifications === "function"
    ? saveNotifications
    : (() => {});
  const updateNotificationsView = typeof updateNotificationsDom === "function"
    ? updateNotificationsDom
    : (() => false);
  const renderApp = typeof render === "function"
    ? render
    : (() => {});
  const setPushIssue = typeof setPushActivationIssue === "function"
    ? setPushActivationIssue
    : (() => {});
  const clearPushIssue = typeof clearPushActivationIssue === "function"
    ? clearPushActivationIssue
    : (() => {});
  const ensureNotificationPermissionFn = typeof ensureNotificationPermission === "function"
    ? ensureNotificationPermission
    : (async () => false);
  const syncPushDeviceRegistrationFn = typeof syncPushDeviceRegistration === "function"
    ? syncPushDeviceRegistration
    : (async () => false);
  const readPushIssue = typeof getPushActivationIssue === "function"
    ? getPushActivationIssue
    : (() => "");

  const normalizeNotificationItem = (docSnap) => normalizeNotification(docSnap);

  const mapNotificationSnapshot = (snap) => mapSnapshot(snap, normalizeNotificationItem);

  const shouldSurfaceNativePushNow = () => shouldSurfaceNativePush();

  const startNotificationsListener = (user = state.user, { enableNativePush = false } = {}) => {
    const currentUnsub = readNotificationsUnsub();
    if (typeof currentUnsub === "function") {
      currentUnsub();
    }
    writeNotificationsUnsub(null);

    const ownerUid = String(user?.uid || "").trim();
    if (!ownerUid) return;

    const liveQuery = buildLiveQuery(ownerUid, notificationsLiveLimit);
    if (!liveQuery) return;
    const seenIds = new Set(readSeenIds(ownerUid));
    let seeded = false;

    const nextUnsub = subscribe(liveQuery, (snap) => {
      const items = mapNotificationSnapshot(snap);
      handleNotifications(items);

      if (!enableNativePush || !canEmitNativePush()) {
        if (!seeded) {
          addItemsToSeenSet(items, seenIds);
          persistSeenIds(Array.from(seenIds), ownerUid);
          seeded = true;
        }
        return;
      }

      if (!seeded) {
        addItemsToSeenSet(items, seenIds);
        persistSeenIds(Array.from(seenIds), ownerUid);
        seeded = true;
        return;
      }

      const nextNative = collectNativeItems(snap?.docChanges?.() || [], seenIds, normalizeNotificationItem);
      if (!nextNative.length) return;

      nextNative.forEach((item) => seenIds.add(item.id));
      persistSeenIds(Array.from(seenIds), ownerUid);
      if (!shouldSurfaceNativePushNow()) return;
      void (async () => {
        for (const item of nextNative) {
          await showNativePush(item);
        }
      })();
    }, (err) => {
      console.error(`[mnyra][firestore.listen.notifications] users/${ownerUid}/notifications`, err);
    });

    writeNotificationsUnsub(nextUnsub);
  };

  const syncNotificationsPushRuntime = async ({ user = state.user, interactive = false, enabled = state.settings?.pushNotifs } = {}) => {
    const ownerUid = String(user?.uid || "").trim();
    if (!ownerUid) {
      setPushIssue("Kein angemeldeter User fuer Push-Registrierung.");
      return false;
    }

    // Mobile Safari can spend noticeable time in permission/service-worker work.
    // Badge correctness must not wait for push setup, so start the Firestore
    // listener immediately and upgrade native-push behavior only after registration.
    startNotificationsListener(user, { enableNativePush: false });

    if (!enabled) {
      clearPushIssue();
      return false;
    }
    clearPushIssue();

    const granted = await ensureNotificationPermissionFn({ interactive, silent: !interactive });
    if (!granted) {
      return false;
    }
    const registered = await syncPushDeviceRegistrationFn({ interactive, force: interactive, enabled, silent: !interactive });
    if (!registered) {
      if (interactive && !readPushIssue()) {
        setPushIssue("Push-Registrierung fehlgeschlagen.");
      }
      return false;
    }
    return true;
  };

  const loadNotificationsFromFirebase = async ({ force = false } = {}) => {
    void force;
    if (!state.user) return;
    try {
      const notificationsQuery = buildFetchQuery(state.user.uid, fetchLimit);
      const items = await fetchNotifications(notificationsQuery, mapNotificationSnapshot);
      state.notifications = items;
      persistNotifications(items);
      const updated = updateNotificationsView();
      if (!updated && state.activeTab === "notifications") {
        renderApp();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return {
    normalizeNotificationItem,
    mapNotificationSnapshot,
    shouldSurfaceNativePushNow,
    startNotificationsListener,
    syncNotificationsPushRuntime,
    loadNotificationsFromFirebase
  };
}
