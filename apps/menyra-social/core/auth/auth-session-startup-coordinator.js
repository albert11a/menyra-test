import { shouldResetUserScopedStateCore } from "./auth-bootstrap-flow-utils.js";
import { createPostLoginRouteOpenCoordinator } from "./auth-post-login-route-open-utils.js";
import {
  clearAuthStartupTrace,
  finishAuthStartupTrace,
  markAuthStartupTrace,
  summarizeAuthProfile
} from "./auth-startup-trace-utils.js";

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
      setAuthInitialized(false);
      markAuthStartupTrace(state, "auth.state.confirmed", {
        uid: nextUid,
        previousUid: prevUid || "",
        activeTab: state?.activeTab || ""
      });
      if (state?.auth) {
        state.auth.open = false;
      }
      loadUserScopedPersisted(user);
      markAuthStartupTrace(state, "auth.persisted.profile.ready", summarizeAuthProfile(state?.userProfile, {
        source: "storage"
      }));
      writeAuthBootstrapSnapshot();
      const pendingRouteFlags = postLoginRouteOpen.resolvePendingRouteFlags();
      const shouldBlockForPendingRoutes = pendingRouteFlags.hasAny === true;
      if (shouldBlockForPendingRoutes) {
        suspendRender();
      } else {
        if (state?.auth) {
          state.auth.loading = false;
        }
        requestRender();
      }
      void (async () => {
        try {
          await bootstrapUser(user, { transitionSeq });
          if (!isCurrentAuthTransition(transitionSeq, nextUid)) return;
          if (shouldBlockForPendingRoutes) {
            await postLoginRouteOpen.openPendingRoutes();
          } else {
            postLoginRouteOpen.openNonBlockingRoutes();
          }
          if (!isCurrentAuthTransition(transitionSeq, nextUid)) return;
          if (state?.auth) {
            state.auth.loading = false;
          }
          setAuthInitialized(true);
          const shellSummary = summarizeAuthProfile(state?.userProfile, {
            activeTab: state?.activeTab || "",
            hasPendingRoutes: pendingRouteFlags.hasAny === true
          });
          markAuthStartupTrace(state, "auth.shell.ready", shellSummary);
          requestRender();
          finishAuthStartupTrace(state, "auth.startup.complete", shellSummary);
        } catch (err) {
          const scope = shouldBlockForPendingRoutes
            ? "auth.bootstrapUser.pendingRoutes"
            : "auth.bootstrapUser.standard";
          reportCriticalRuntimeFailure(scope, err);
          if (isCurrentAuthTransition(transitionSeq, nextUid)) {
            if (state?.auth) {
              state.auth.loading = false;
            }
            setAuthInitialized(true);
            finishAuthStartupTrace(state, "auth.startup.failed", {
              uid: nextUid,
              message: err?.message || "bootstrap failed"
            });
            requestRender();
          }
        } finally {
          if (shouldBlockForPendingRoutes) {
            resumeRender();
          }
        }
      })();
    } else {
      clearAuthStartupTrace(state);
      setAuthInitialized(true);
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
      loadGuestScopedPersisted();
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
