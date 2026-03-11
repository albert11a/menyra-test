import {
  shouldResetUserScopedStateCore,
  resolvePendingAuthRouteFlagsCore
} from "./auth-bootstrap-flow-utils.js";
import {
  runPostLoginPendingRouteOpenFlowCore,
  runPostLoginNonBlockingRouteOpenFlowCore
} from "./auth-post-login-route-open-utils.js";

export function createAuthSessionStartupCoordinator({
  state = null,
  auth = null,
  onAuthStateChangedFn = null,
  windowObj = null,
  queueMicrotaskFn = null,
  setTimeoutFn = null,
  setAuthInitialized = () => {},
  setAuthBootstrapSnapshot = () => {},
  readAuthBootstrapSnapshot = () => null,
  writeAuthBootstrapSnapshot = () => {},
  clearAuthBootstrapSnapshot = () => {},
  applyAuthBootstrapSnapshot = () => false,
  applyPersistedAuthProfileHints = () => false,
  bindPushOpenTargetMessageHandler = () => {},
  loadUserScopedPersisted = () => {},
  loadGuestScopedPersisted = () => {},
  applyPendingInitialRouteState = () => {},
  resetUserScopedState = () => {},
  render = () => {},
  schedulePerfWarmMark = () => {},
  fetchPublicBootstrapPayload = async () => {},
  ensureTabData = () => Promise.resolve(),
  sanitizeTabForSession = (tab) => tab,
  stopLiveListeners = () => {},
  suspendRender = () => {},
  resumeRender = () => {},
  reportCriticalRuntimeFailure = () => {},
  runBootstrapUser = async () => false,
  pendingRouteState = null,
  getPendingNotificationId = () => "",
  getPendingPostId = () => "",
  getPendingChatUid = () => "",
  openProfileFromQuery = () => {},
  openNotificationFromQuery = async () => false,
  openPostFromQuery = async () => false,
  openChatFromQuery = () => false
} = {}) {
  const queueMicrotaskSafe = typeof queueMicrotaskFn === "function"
    ? queueMicrotaskFn
    : ((fn) => fn?.());
  const setTimeoutSafe = typeof setTimeoutFn === "function"
    ? setTimeoutFn
    : (() => {});
  const readPendingNotificationId = typeof pendingRouteState?.getPendingNotificationId === "function"
    ? pendingRouteState.getPendingNotificationId
    : (typeof getPendingNotificationId === "function" ? getPendingNotificationId : (() => ""));
  const readPendingPostId = typeof pendingRouteState?.getPendingPostId === "function"
    ? pendingRouteState.getPendingPostId
    : (typeof getPendingPostId === "function" ? getPendingPostId : (() => ""));
  const readPendingChatUid = typeof pendingRouteState?.getPendingChatUid === "function"
    ? pendingRouteState.getPendingChatUid
    : (typeof getPendingChatUid === "function" ? getPendingChatUid : (() => ""));
  let lastAuthUid = "";
  let authTransitionSeq = 0;
  let authStateListenerBound = false;

  function isCurrentAuthTransition(transitionSeq, expectedUid = "") {
    if (transitionSeq !== authTransitionSeq) return false;
    if (!expectedUid) return true;
    return String(state?.user?.uid || "").trim() === String(expectedUid || "").trim();
  }

  async function bootstrapUser(user, { transitionSeq = 0 } = {}) {
    const expectedUid = String(user?.uid || "").trim();
    if (!expectedUid) return false;
    if (transitionSeq && !isCurrentAuthTransition(transitionSeq, expectedUid)) return false;
    await runBootstrapUser(user);
    if (transitionSeq && !isCurrentAuthTransition(transitionSeq, expectedUid)) return false;
    return true;
  }

  function scheduleGuestTabEnsure() {
    const runEnsure = (scope) => {
      void ensureTabData(state?.activeTab || "").catch((err) => {
        reportCriticalRuntimeFailure(scope, err);
      });
    };
    if (windowObj && typeof windowObj.requestAnimationFrame === "function") {
      windowObj.requestAnimationFrame(() => {
        runEnsure("startup.ensureTabData.guestRaf");
      });
      return;
    }
    setTimeoutSafe(() => {
      runEnsure("startup.ensureTabData.guestTimeout");
    }, 0);
  }

  function initialize({
    hasInlineBootstrapPayload = false,
    hasWindowBootstrapPromise = false
  } = {}) {
    const snapshot = readAuthBootstrapSnapshot();
    setAuthBootstrapSnapshot(snapshot);
    bindPushOpenTargetMessageHandler();
    if (state) {
      state.user = auth?.currentUser || null;
    }
    setAuthInitialized(false);
    if (state?.user) {
      loadUserScopedPersisted(state.user);
      writeAuthBootstrapSnapshot();
      lastAuthUid = state.user.uid || "";
    } else {
      const appliedSnapshot = applyAuthBootstrapSnapshot(snapshot);
      const snapshotUid = appliedSnapshot ? String(snapshot?.uid || "").trim() : "";
      if (snapshotUid) {
        applyPersistedAuthProfileHints(snapshotUid);
      }
      lastAuthUid = snapshotUid;
    }
    applyPendingInitialRouteState();
    render();
    schedulePerfWarmMark();
    if (!hasInlineBootstrapPayload && !hasWindowBootstrapPromise) {
      queueMicrotaskSafe(() => {
        void fetchPublicBootstrapPayload({ force: false, timeoutMs: 1200 });
      });
    }
    if (!state?.user) {
      scheduleGuestTabEnsure();
    }
  }

  function handleAuthStateChanged(user) {
    setAuthInitialized(true);
    const transitionSeq = ++authTransitionSeq;
    const nextUid = user?.uid || "";
    const prevUid = lastAuthUid;
    if (shouldResetUserScopedStateCore({ prevUid, nextUid })) {
      resetUserScopedState();
    }
    if (state) {
      state.user = user;
    }
    applyPendingInitialRouteState();
    if (user) {
      if (state?.auth) {
        state.auth.open = false;
      }
      loadUserScopedPersisted(user);
      writeAuthBootstrapSnapshot();
      const pendingRouteFlags = resolvePendingAuthRouteFlagsCore({
        pendingNotificationId: readPendingNotificationId(),
        pendingPostId: readPendingPostId(),
        pendingChatUid: readPendingChatUid()
      });
      if (pendingRouteFlags.hasAny) {
        suspendRender();
        void bootstrapUser(user, { transitionSeq }).catch((err) => {
          reportCriticalRuntimeFailure("auth.bootstrapUser.pendingRoutes", err);
        });
        queueMicrotaskSafe(() => {
          void (async () => {
            try {
              if (!isCurrentAuthTransition(transitionSeq, nextUid)) return;
              await runPostLoginPendingRouteOpenFlowCore({
                openProfileFromQuery,
                openNotificationFromQuery,
                openPostFromQuery,
                openChatFromQuery,
                renderFallback: render
              });
            } finally {
              resumeRender();
            }
          })();
        });
      } else {
        render();
        void bootstrapUser(user, { transitionSeq }).catch((err) => {
          reportCriticalRuntimeFailure("auth.bootstrapUser.standard", err);
        });
        queueMicrotaskSafe(() => {
          if (!isCurrentAuthTransition(transitionSeq, nextUid)) return;
          runPostLoginNonBlockingRouteOpenFlowCore({
            openProfileFromQuery,
            openNotificationFromQuery,
            openPostFromQuery,
            openChatFromQuery
          });
        });
      }
    } else {
      clearAuthBootstrapSnapshot();
      if (state) {
        state.roleSwitchRoles = [];
        state.roleSwitchRestaurantId = "";
      }
      stopLiveListeners();
      if (state?.auth) {
        state.auth.open = false;
      }
      loadGuestScopedPersisted();
      if (state) {
        state.activeTab = sanitizeTabForSession(state.activeTab, { hasProfileView: !!state.profileView });
      }
      render();
      queueMicrotaskSafe(() => {
        void ensureTabData(state?.activeTab || "").catch((err) => {
          reportCriticalRuntimeFailure("auth.ensureTabData.afterSignOut", err);
        });
      });
    }
    lastAuthUid = nextUid;
  }

  function bindAuthStateListener() {
    if (authStateListenerBound) return;
    if (!auth || typeof onAuthStateChangedFn !== "function") return;
    authStateListenerBound = true;
    onAuthStateChangedFn(auth, (user) => {
      handleAuthStateChanged(user);
    });
  }

  function start({
    hasInlineBootstrapPayload = false,
    hasWindowBootstrapPromise = false
  } = {}) {
    initialize({
      hasInlineBootstrapPayload,
      hasWindowBootstrapPromise
    });
    bindAuthStateListener();
  }

  return {
    initialize,
    handleAuthStateChanged,
    bindAuthStateListener,
    start
  };
}
