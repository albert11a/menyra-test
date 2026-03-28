import { shouldResetUserScopedStateCore } from "./auth-bootstrap-flow-utils.js";
import { createPostLoginRouteOpenCoordinator } from "./auth-post-login-route-open-utils.js";

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
  postLoginRouteOpenCoordinator = null
} = {}) {
  const queueMicrotaskSafe = typeof queueMicrotaskFn === "function"
    ? queueMicrotaskFn
    : ((fn) => fn?.());
  const setTimeoutSafe = typeof setTimeoutFn === "function"
    ? setTimeoutFn
    : (() => {});
  const postLoginRouteOpen = postLoginRouteOpenCoordinator
    && typeof postLoginRouteOpenCoordinator.resolvePendingRouteFlags === "function"
    && typeof postLoginRouteOpenCoordinator.openPendingRoutes === "function"
    && typeof postLoginRouteOpenCoordinator.openNonBlockingRoutes === "function"
    ? postLoginRouteOpenCoordinator
    : createPostLoginRouteOpenCoordinator();
  let lastAuthUid = "";
  let authTransitionSeq = 0;
  let authStateListenerBound = false;
  let renderRequested = false;
  let lastPersistedScopeKey = "";

  function buildPersistedScopeKey(user = null) {
    const uid = String(user?.uid || "").trim();
    return uid ? `user:${uid}` : "guest";
  }

  function hydratePersistedScope(user = null, { force = false } = {}) {
    const scopeKey = buildPersistedScopeKey(user);
    if (!force && scopeKey === lastPersistedScopeKey) return false;
    if (user?.uid) {
      loadUserScopedPersisted(user);
    } else {
      loadGuestScopedPersisted();
    }
    lastPersistedScopeKey = scopeKey;
    return true;
  }

  function requestRender() {
    if (renderRequested) return;
    renderRequested = true;
    queueMicrotaskSafe(() => {
      renderRequested = false;
      render();
    });
  }

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
    suspendRender();
    try {
      const snapshot = readAuthBootstrapSnapshot();
      setAuthBootstrapSnapshot(snapshot);
      bindPushOpenTargetMessageHandler();
      if (state) {
        state.user = auth?.currentUser || null;
      }
      setAuthInitialized(false);
      if (state?.user) {
        hydratePersistedScope(state.user, { force: true });
        writeAuthBootstrapSnapshot();
        lastAuthUid = state.user.uid || "";
      } else {
        const appliedSnapshot = applyAuthBootstrapSnapshot(snapshot);
        const snapshotUid = appliedSnapshot ? String(snapshot?.uid || "").trim() : "";
        if (snapshotUid) {
          applyPersistedAuthProfileHints(snapshotUid);
        } else {
          hydratePersistedScope(null, { force: true });
        }
        lastAuthUid = snapshotUid;
      }
      applyPendingInitialRouteState();
      // Open pending deep-link profile routes immediately (also for guest sessions),
      // so QR menu links do not flash feed before routing to the restaurant menu.
      const routeOpenResult = postLoginRouteOpen.openNonBlockingRoutes();
      const openedProfileRoute = !!routeOpenResult?.openedProfile;
      if (!openedProfileRoute || !state?.profileView?.profile) {
        requestRender();
      }
      schedulePerfWarmMark();
      if (!hasInlineBootstrapPayload && !hasWindowBootstrapPromise) {
        queueMicrotaskSafe(() => {
          void fetchPublicBootstrapPayload({ force: false, timeoutMs: 1200 });
        });
      }
      if (!state?.user) {
        scheduleGuestTabEnsure();
      }
    } finally {
      resumeRender();
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
      hydratePersistedScope(user);
      writeAuthBootstrapSnapshot();
      const pendingRouteFlags = postLoginRouteOpen.resolvePendingRouteFlags();
      if (pendingRouteFlags.hasAny) {
        suspendRender();
        void (async () => {
          try {
            await bootstrapUser(user, { transitionSeq });
            if (!isCurrentAuthTransition(transitionSeq, nextUid)) return;
            await postLoginRouteOpen.openPendingRoutes();
            if (!isCurrentAuthTransition(transitionSeq, nextUid)) return;
            if (state?.auth) {
              state.auth.loading = false;
            }
            requestRender();
          } catch (err) {
            reportCriticalRuntimeFailure("auth.bootstrapUser.pendingRoutes", err);
            if (isCurrentAuthTransition(transitionSeq, nextUid)) {
              if (state?.auth) {
                state.auth.loading = false;
              }
              requestRender();
            }
          } finally {
            resumeRender();
          }
        })();
      } else {
        if (state?.auth) {
          state.auth.loading = false;
        }
        requestRender();
        void bootstrapUser(user, { transitionSeq })
          .then(() => {
            if (!isCurrentAuthTransition(transitionSeq, nextUid)) return;
            postLoginRouteOpen.openNonBlockingRoutes();
            requestRender();
          })
          .catch((err) => {
            reportCriticalRuntimeFailure("auth.bootstrapUser.standard", err);
            if (isCurrentAuthTransition(transitionSeq, nextUid)) {
              requestRender();
            }
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
        state.auth.loading = false;
      }
      hydratePersistedScope(null);
      if (state) {
        state.activeTab = sanitizeTabForSession(state.activeTab, { hasProfileView: !!state.profileView });
      }
      requestRender();
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
