import { buildNativePushAlertPayloadCore } from "./push-alert-utils.js";
import {
  canUseNativeNotificationsCore,
  buildPushActivationIssueCore,
  getPushActivationIssueMessageCore,
  mapPushActivationErrorCore,
  canEmitNativePushAlertsCore
} from "./push-activation-utils.js";
import { ensureNotificationPermissionCore } from "./push-permission-utils.js";
import {
  readPushSeenIdsCore,
  writePushSeenIdsCore
} from "./push-seen-storage-utils.js";
import {
  getOrCreatePushDeviceIdCore,
  readPushTokenMetaCore,
  writePushTokenMetaCore
} from "./push-token-storage-utils.js";
import {
  ensurePushServiceWorkerRegistrationCore,
  waitForPushServiceWorkerReadyCore
} from "./push-service-worker-utils.js";
import {
  ensureFirebaseMessagingModuleCore,
  ensureMessagingClientCore
} from "./push-messaging-utils.js";
import {
  hasPushDeviceRegistrationPrerequisitesCore,
  isPushTokenSyncFreshCore,
  buildPushDeviceRegistrationPayloadCore,
  buildPushDeviceDisablePayloadCore
} from "./push-device-registration-utils.js";

export function createPushRuntimeController(deps = {}) {
  const state = deps.state;
  const db = deps.db || null;
  const app = deps.app || null;
  const safeStorage = deps.safeStorageObj || {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {}
  };
  const windowObj = deps.windowObj || null;
  const navigatorObj = deps.navigatorObj || null;
  const cryptoObj = deps.cryptoObj || null;
  const doc = typeof deps.docFn === "function" ? deps.docFn : null;
  const setDoc = typeof deps.setDocFn === "function" ? deps.setDocFn : (async () => {});
  const serverTimestamp = typeof deps.serverTimestampFn === "function"
    ? deps.serverTimestampFn
    : (() => null);
  const pushSeenKey = typeof deps.pushSeenKeyFn === "function" ? deps.pushSeenKeyFn : (() => "");
  const pushTokenMetaKey = typeof deps.pushTokenMetaKeyFn === "function" ? deps.pushTokenMetaKeyFn : (() => "");
  const pushDeviceIdKey = typeof deps.pushDeviceIdKeyFn === "function" ? deps.pushDeviceIdKeyFn : (() => "");
  const resolveNotificationAvatar = typeof deps.resolveNotificationAvatarFn === "function"
    ? deps.resolveNotificationAvatarFn
    : (() => "");
  const importModule = typeof deps.importModuleFn === "function"
    ? deps.importModuleFn
    : ((url) => import(url));
  const encodeURIComponentFn = typeof deps.encodeURIComponentFn === "function"
    ? deps.encodeURIComponentFn
    : encodeURIComponent;
  const nowFn = typeof deps.nowFn === "function" ? deps.nowFn : (() => Date.now());
  const randomFn = typeof deps.randomFn === "function" ? deps.randomFn : (() => Math.random());
  const notificationApi = deps.notificationApi
    || (windowObj && "Notification" in windowObj ? windowObj.Notification : null);
  const brandTitle = String(deps.brandTitle || "").trim();
  const firebaseMessagingModuleUrl = String(deps.firebaseMessagingModuleUrl || "").trim();
  const pushSeenNotificationsLimit = Math.max(1, Number(deps.pushSeenNotificationsLimit || 200) || 200);
  const pushTokenSyncIntervalMs = Math.max(0, Number(deps.pushTokenSyncIntervalMs || 0) || 0);
  const fcmWebPushVapidKey = String(deps.fcmWebPushVapidKey || "").trim();
  const pushServiceWorkerUrl = String(deps.pushServiceWorkerUrl || "").trim();
  const pushServiceWorkerScope = String(deps.pushServiceWorkerScope || "").trim();
  const pushServiceWorkerReadyTimeoutMs = Math.max(0, Number(deps.pushServiceWorkerReadyTimeoutMs || 0) || 0);

  let pushOpenMessageBound = false;
  let pushMessagingClient = null;
  let firebaseMessagingModulePromise = null;
  let pushActivationIssue = "";
  let pushDeviceRegistrationPromise = null;
  let pushDeviceRegistrationMode = { interactive: false, force: false };

  function createNoopApi() {
    return {
      readPushSeenIds: () => [],
      writePushSeenIds: () => {},
      setPushActivationIssue: () => {},
      clearPushActivationIssue: () => {},
      getPushActivationIssue: () => "",
      getPushActivationIssueMessage: () => "",
      canEmitNativePushAlerts: () => false,
      ensureNotificationPermission: async () => false,
      showNativePushAlert: async () => false,
      syncPushDeviceRegistration: async () => false,
      disablePushDeviceRegistration: async () => {},
      isPushOpenMessageBound: () => false,
      markPushOpenMessageBound: () => {}
    };
  }

  if (!state) {
    return createNoopApi();
  }

  function canUseNativeNotifications() {
    return canUseNativeNotificationsCore({ windowObj });
  }

  function readPushSeenIds(uid = state.user?.uid || "") {
    return readPushSeenIdsCore({
      uid,
      resolvePushSeenKey: pushSeenKey,
      storage: safeStorage
    });
  }

  function writePushSeenIds(ids = [], uid = state.user?.uid || "") {
    writePushSeenIdsCore({
      ids,
      uid,
      resolvePushSeenKey: pushSeenKey,
      storage: safeStorage,
      maxItems: pushSeenNotificationsLimit
    });
  }

  function clearPushActivationIssue() {
    pushActivationIssue = "";
  }

  function setPushActivationIssue(reason = "", err = null, { silent = false } = {}) {
    const base = String(reason || "").trim();
    pushActivationIssue = buildPushActivationIssueCore({ reason, err });
    if (silent) return;
    if (err) {
      console.error("[Push]", base || "Push activation failed", err);
    } else if (base) {
      console.warn("[Push]", base);
    }
  }

  function getPushActivationIssue() {
    return pushActivationIssue;
  }

  function getPushActivationIssueMessage() {
    return getPushActivationIssueMessageCore(pushActivationIssue);
  }

  function canEmitNativePushAlerts() {
    return canEmitNativePushAlertsCore({
      settings: state.settings,
      canUseNativeNotifications: canUseNativeNotifications(),
      notificationPermission: notificationApi?.permission || ""
    });
  }

  async function ensureNotificationPermission({ interactive = false, silent = false } = {}) {
    return await ensureNotificationPermissionCore({
      interactive,
      canUseNativeNotifications: () => canUseNativeNotifications(),
      notificationApi,
      setPushActivationIssue: (reason, err) => setPushActivationIssue(reason, err, { silent })
    });
  }

  async function showNativePushAlert(notif = {}) {
    if (!notif?.id || !canEmitNativePushAlerts()) return false;
    const alertPayload = buildNativePushAlertPayloadCore({
      notif,
      brandTitle,
      resolveNotificationAvatar: (entry) => resolveNotificationAvatar(entry),
      encodeURIComponentFn
    });
    try {
      if (navigatorObj && "serviceWorker" in navigatorObj) {
        const reg = await navigatorObj.serviceWorker.getRegistration(pushServiceWorkerScope);
        if (reg?.showNotification) {
          await reg.showNotification(alertPayload.title, {
            body: alertPayload.body,
            icon: alertPayload.icon,
            badge: alertPayload.icon,
            tag: alertPayload.tag,
            data: alertPayload.data,
            renotify: false
          });
          return true;
        }
      }
      if (!notificationApi) return false;
      new notificationApi(alertPayload.title, {
        body: alertPayload.body,
        icon: alertPayload.icon,
        tag: alertPayload.tag
      });
      return true;
    } catch {
      return false;
    }
  }

  function getOrCreatePushDeviceId() {
    return getOrCreatePushDeviceIdCore({
      resolvePushDeviceIdKey: pushDeviceIdKey,
      storage: safeStorage,
      randomUUIDFn: cryptoObj && typeof cryptoObj.randomUUID === "function"
        ? () => cryptoObj.randomUUID()
        : null,
      nowFn,
      randomFn
    });
  }

  function readPushTokenMeta(uid = state.user?.uid || "") {
    return readPushTokenMetaCore({
      uid,
      resolvePushTokenMetaKey: pushTokenMetaKey,
      storage: safeStorage
    });
  }

  function writePushTokenMeta(uid = state.user?.uid || "", token = "") {
    writePushTokenMetaCore({
      uid,
      token,
      resolvePushTokenMetaKey: pushTokenMetaKey,
      storage: safeStorage,
      nowFn
    });
  }

  async function ensureFirebaseMessagingModule() {
    return ensureFirebaseMessagingModuleCore({
      currentPromise: firebaseMessagingModulePromise,
      moduleUrl: firebaseMessagingModuleUrl,
      importModule,
      setModulePromise: (value) => {
        firebaseMessagingModulePromise = value;
      }
    });
  }

  async function ensureMessagingClient({ silent = false } = {}) {
    return await ensureMessagingClientCore({
      currentClient: pushMessagingClient,
      ensureFirebaseMessagingModule: () => ensureFirebaseMessagingModule(),
      setPushActivationIssue: (reason, err) => setPushActivationIssue(reason, err, { silent }),
      app,
      setMessagingClient: (client) => {
        pushMessagingClient = client;
      }
    });
  }

  async function ensurePushServiceWorkerRegistration({ silent = false } = {}) {
    return await ensurePushServiceWorkerRegistrationCore({
      navigatorObj,
      serviceWorkerScope: pushServiceWorkerScope,
      serviceWorkerUrl: pushServiceWorkerUrl,
      setPushActivationIssue: (reason, err) => setPushActivationIssue(reason, err, { silent })
    });
  }

  async function waitForPushServiceWorkerReady({ silent = false } = {}) {
    return await waitForPushServiceWorkerReadyCore({
      navigatorObj,
      timeoutMs: pushServiceWorkerReadyTimeoutMs,
      setPushActivationIssue: (reason, err) => setPushActivationIssue(reason, err, { silent })
    });
  }

  function mapPushActivationError(stage = "", err = null) {
    return mapPushActivationErrorCore(stage, err);
  }

  function shouldReusePushDeviceRegistrationPromise({ interactive = false, force = false } = {}) {
    if (!pushDeviceRegistrationPromise) return false;
    if (interactive && !pushDeviceRegistrationMode.interactive) return false;
    if (force && !pushDeviceRegistrationMode.force) return false;
    return true;
  }

  async function runPushDeviceRegistration({
    interactive = false,
    force = false,
    enabled = state.settings?.pushNotifs,
    silent = false
  } = {}) {
    const uid = String(state.user?.uid || "").trim();
    const prerequisitesOk = hasPushDeviceRegistrationPrerequisitesCore({
      uid,
      enabled,
      isSecureContext: !!windowObj?.isSecureContext,
      vapidKey: fcmWebPushVapidKey,
      hasServiceWorker: !!(navigatorObj && "serviceWorker" in navigatorObj),
      setPushActivationIssue: (reason) => setPushActivationIssue(reason, null, { silent })
    });
    if (!prerequisitesOk) return false;

    const granted = await ensureNotificationPermission({ interactive, silent });
    if (!granted) return false;

    const reg = await ensurePushServiceWorkerRegistration({ silent });
    if (!reg) {
      if (!pushActivationIssue) setPushActivationIssue("Service Worker nuk mund te regjistrohej.", null, { silent });
      return false;
    }

    const readyReg = await waitForPushServiceWorkerReady({ silent });
    const pushReg = readyReg || reg;
    if (!pushReg) {
      if (!pushActivationIssue) setPushActivationIssue("Mungon regjistrimi i Service Worker per Push.", null, { silent });
      return false;
    }

    const messaging = await ensureMessagingClient({ silent });
    if (!messaging) return false;

    let safeToken = "";
    try {
      const messagingModule = await ensureFirebaseMessagingModule();
      const token = await messagingModule.getToken(messaging, {
        vapidKey: fcmWebPushVapidKey,
        serviceWorkerRegistration: pushReg
      });
      safeToken = String(token || "").trim();
    } catch (err) {
      setPushActivationIssue(mapPushActivationError("fcm-getToken", err), err, { silent });
      return false;
    }
    if (!safeToken) {
      setPushActivationIssue("FCM nuk dha asnje token.", null, { silent });
      return false;
    }

    const meta = readPushTokenMeta(uid);
    const freshEnough = isPushTokenSyncFreshCore({
      meta,
      token: safeToken,
      nowTs: nowFn(),
      intervalMs: pushTokenSyncIntervalMs
    });
    if (!force && freshEnough) {
      clearPushActivationIssue();
      return true;
    }

    const deviceId = getOrCreatePushDeviceId();
    if (!db || !doc) {
      setPushActivationIssue("Referenca e pajisjes ne Firestore nuk mund te krijohej.", null, { silent });
      return false;
    }
    const ref = doc(db, "users", uid, "devices", deviceId);
    try {
      const stamp = serverTimestamp();
      await setDoc(ref, buildPushDeviceRegistrationPayloadCore({
        token: safeToken,
        userAgent: String(navigatorObj?.userAgent || ""),
        locale: String(navigatorObj?.language || ""),
        serverTimestampValue: stamp
      }), { merge: true });
    } catch (err) {
      setPushActivationIssue(mapPushActivationError("firestore-write", err), err, { silent });
      return false;
    }
    writePushTokenMeta(uid, safeToken);
    clearPushActivationIssue();
    return true;
  }

  async function syncPushDeviceRegistration({
    interactive = false,
    force = false,
    enabled = state.settings?.pushNotifs,
    silent = false
  } = {}) {
    if (shouldReusePushDeviceRegistrationPromise({ interactive, force })) {
      return await pushDeviceRegistrationPromise;
    }
    pushDeviceRegistrationMode = {
      interactive: !!interactive,
      force: !!force
    };
    const nextPromise = runPushDeviceRegistration({
      interactive,
      force,
      enabled,
      silent
    }).finally(() => {
      if (pushDeviceRegistrationPromise === nextPromise) {
        pushDeviceRegistrationPromise = null;
        pushDeviceRegistrationMode = { interactive: false, force: false };
      }
    });
    pushDeviceRegistrationPromise = nextPromise;
    return await nextPromise;
  }

  async function disablePushDeviceRegistration() {
    const uid = String(state.user?.uid || "").trim();
    if (!uid || !db || !doc) return;
    const deviceId = getOrCreatePushDeviceId();
    try {
      await setDoc(doc(db, "users", uid, "devices", deviceId), buildPushDeviceDisablePayloadCore({
        serverTimestampValue: serverTimestamp()
      }), { merge: true });
    } catch (err) {
      console.error(err);
    }
  }

  function isPushOpenMessageBound() {
    return pushOpenMessageBound;
  }

  function markPushOpenMessageBound() {
    pushOpenMessageBound = true;
  }
  return {
    readPushSeenIds,
    writePushSeenIds,
    setPushActivationIssue,
    clearPushActivationIssue,
    getPushActivationIssue,
    getPushActivationIssueMessage,
    canEmitNativePushAlerts,
    ensureNotificationPermission,
    showNativePushAlert,
    syncPushDeviceRegistration,
    disablePushDeviceRegistration,
    isPushOpenMessageBound,
    markPushOpenMessageBound
  };
}
