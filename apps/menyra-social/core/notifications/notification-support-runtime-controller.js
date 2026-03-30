import {
  normalizeNotificationWriteIdsCore
} from "./notification-write-utils.js";

export function createNotificationSupportRuntimeController(deps = {}) {
  const state = deps.state;
  const safeStorage = deps.safeStorageObj || {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {}
  };
  const notificationsKey = typeof deps.notificationsKeyFn === "function"
    ? deps.notificationsKeyFn
    : (() => "");
  const functionsObj = deps.functionsObj || null;
  const httpsCallable = typeof deps.httpsCallableFn === "function" ? deps.httpsCallableFn : null;
  let writeUserNotification = typeof deps.writeUserNotificationFn === "function"
    ? deps.writeUserNotificationFn
    : null;

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

  function getWriteUserNotification() {
    if (typeof writeUserNotification === "function") return writeUserNotification;
    if (!functionsObj || !httpsCallable) return null;
    const callable = httpsCallable(functionsObj, "writeUserNotification");
    writeUserNotification = async (input = {}) => {
      const result = await callable(input);
      return result?.data || null;
    };
    return writeUserNotification;
  }

  async function pushUserNotification(targetUid, payload) {
    const normalized = normalizeNotificationWriteIdsCore({
      targetUid
    });
    const safeTargetUid = normalized.targetUid;
    if (!safeTargetUid) return;
    const writer = getWriteUserNotification();
    if (!writer) return;
    try {
      await writer({
        targetUid: safeTargetUid,
        payload,
        notificationId: ""
      });
    } catch (err) {
      console.error(err);
    }
  }

  async function pushUserNotificationWithId(targetUid, notificationId, payload) {
    const writer = getWriteUserNotification();
    if (!writer) return;
    const normalized = normalizeNotificationWriteIdsCore({
      targetUid,
      notificationId
    });
    const safeTargetUid = normalized.targetUid;
    const safeNotificationId = normalized.notificationId;
    if (!safeTargetUid || !safeNotificationId) return;
    try {
      await writer({
        targetUid: safeTargetUid,
        notificationId: safeNotificationId,
        payload
      });
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
