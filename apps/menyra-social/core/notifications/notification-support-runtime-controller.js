import {
  buildNotificationWritePayloadCore,
  normalizeNotificationWriteIdsCore
} from "./notification-write-utils.js";

export function createNotificationSupportRuntimeController(deps = {}) {
  const state = deps.state;
  const db = deps.db || null;
  const safeStorage = deps.safeStorageObj || {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {}
  };
  const notificationsKey = typeof deps.notificationsKeyFn === "function"
    ? deps.notificationsKeyFn
    : (() => "");
  const collection = typeof deps.collectionFn === "function" ? deps.collectionFn : null;
  const doc = typeof deps.docFn === "function" ? deps.docFn : null;
  const setDoc = typeof deps.setDocFn === "function" ? deps.setDocFn : (async () => {});
  const serverTimestamp = typeof deps.serverTimestampFn === "function"
    ? deps.serverTimestampFn
    : (() => null);

  if (!state) {
    return {
      saveNotifications: () => {},
      pushUserNotification: async () => {},
      pushUserNotificationWithId: async () => {}
    };
  }

  function saveNotifications(notifications) {
    const uid = state.user?.uid || "";
    if (!uid) return;
    safeStorage.setItem(notificationsKey(uid), JSON.stringify(notifications));
  }

  async function pushUserNotification(targetUid, payload) {
    if (!targetUid || !db || !collection || !doc) return;
    try {
      const ref = doc(collection(db, "users", targetUid, "notifications"));
      await setDoc(ref, buildNotificationWritePayloadCore({
        payload,
        serverTimestampValue: serverTimestamp()
      }));
    } catch (err) {
      console.error(err);
    }
  }

  async function pushUserNotificationWithId(targetUid, notificationId, payload) {
    if (!db || !doc) return;
    const normalized = normalizeNotificationWriteIdsCore({
      targetUid,
      notificationId
    });
    const safeTargetUid = normalized.targetUid;
    const safeNotificationId = normalized.notificationId;
    if (!safeTargetUid || !safeNotificationId) return;
    try {
      await setDoc(
        doc(db, "users", safeTargetUid, "notifications", safeNotificationId),
        buildNotificationWritePayloadCore({
          payload,
          serverTimestampValue: serverTimestamp()
        }),
        { merge: true }
      );
    } catch (err) {
      console.error(err);
    }
  }

  return {
    saveNotifications,
    pushUserNotification,
    pushUserNotificationWithId
  };
}
