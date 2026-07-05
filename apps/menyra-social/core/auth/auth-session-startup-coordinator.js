import { shouldResetUserScopedStateCore } from "./auth-bootstrap-flow-utils.js";
import { createPostLoginRouteOpenCoordinator } from "./auth-post-login-route-open-utils.js";

// Sicherheitsnetz: spaetestens nach dieser Zeit wird die App-Shell entsperrt
// (mit gecachter Identitaet), falls der Auth-Bootstrap wegen eines haengenden
// Firestore-Reads nie settled. Normale Loads settlen deutlich frueher (cache-first).
const AUTH_BOOTSTRAP_WATCHDOG_MS = 4000;

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
  hasPendingProtectedRouteAuthIntent = () => false,
  openPendingProtectedRouteAuthPrompt = () => false,
  stopLiveListeners = () => {},
  suspendRender = () => {},
  resumeRender = () => {},
  reportCriticalRuntimeFailure = () => {},
  runBootstrapUser = async () => false,
  markStartupTimeline = () => {},
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
  const markStartup = typeof markStartupTimeline === "function"
    ? markStartupTimeline
    : (() => {});
  let lastAuthUid = "";
  let authTransitionSeq = 0;
  let authStateListenerBound = false;
  let renderRequested = false;
  let firstShellRenderRequested = false;
  let pushOpenTargetMessageHandlerBound = false;

  function setStartupAuthState({
    authRestoreState = "",
    profileTruthState = "",
    sessionTruthState,
    startupRestoring,
    actionsLockedUntilAuthReady,
    trustedCachedAuthUid
  } = {}) {
    if (!state || typeof state !== "object") return;
    const nextAuthRestoreState = String(authRestoreState || "").trim();
    const nextProfileTruthState = String(profileTruthState || "").trim();
    if (nextAuthRestoreState) {
      state.authRestoreState = nextAuthRestoreState;
      state.__authRestoreState = nextAuthRestoreState;
    }
    if (nextProfileTruthState) {
      state.profileTruthState = nextProfileTruthState;
      state.__profileTruthState = nextProfileTruthState;
    }
    if (sessionTruthState !== undefined) {
      const nextSessionTruthState = String(sessionTruthState || "").trim();
      state.sessionTruthState = nextSessionTruthState;
      state.__sessionTruthState = nextSessionTruthState;
    }
    if (startupRestoring !== undefined) {
      state.startupRestoring = !!startupRestoring;
    }
    if (actionsLockedUntilAuthReady !== undefined) {
      state.actionsLockedUntilAuthReady = !!actionsLockedUntilAuthReady;
    }
    if (trustedCachedAuthUid !== undefined) {
      state.__trustedCachedAuthUid = String(trustedCachedAuthUid || "").trim();
    }
  }

  function markProfileTruthLoading() {
    setStartupAuthState({
      authRestoreState: "authenticated",
      profileTruthState: "loading",
      sessionTruthState: "authenticated",
      startupRestoring: true,
      actionsLockedUntilAuthReady: true
    });
  }

  function markProfileTruthReady() {
    setStartupAuthState({
      authRestoreState: "authenticated",
      profileTruthState: "ready",
      sessionTruthState: "authenticated",
      startupRestoring: false,
      actionsLockedUntilAuthReady: false,
      trustedCachedAuthUid: ""
    });
  }

  function markProfileTruthError() {
    setStartupAuthState({
      authRestoreState: "authenticated",
      profileTruthState: "error",
      sessionTruthState: "authenticated",
      startupRestoring: false,
      actionsLockedUntilAuthReady: true
    });
  }

  function markCachedReturningUser(uid = "") {
    setStartupAuthState({
      authRestoreState: "cachedReturningUser",
      profileTruthState: "cachedStale",
      sessionTruthState: "cached",
      startupRestoring: true,
      actionsLockedUntilAuthReady: true,
      trustedCachedAuthUid: uid
    });
  }

  function requestRender(reason = "") {
    if (!firstShellRenderRequested) {
      firstShellRenderRequested = true;
      markStartup("first shell render requested", {
        reason: String(reason || "").trim() || "startup"
      });
    }
    if (renderRequested) return;
    renderRequested = true;
    queueMicrotaskSafe(() => {
      renderRequested = false;
      render();
    });
  }

  function schedulePostVisibleStartupTask(task, {
    delayMs = 0,
    fallbackDelayMs = 120
  } = {}) {
    if (typeof task !== "function") return;
    const run = () => {
      const safeDelay = Math.max(0, Number(delayMs) || 0);
      if (safeDelay > 0) {
        setTimeoutSafe(task, safeDelay);
        return;
      }
      queueMicrotaskSafe(task);
    };
    if (windowObj && typeof windowObj.requestAnimationFrame === "function") {
      windowObj.requestAnimationFrame(() => {
        windowObj.requestAnimationFrame(run);
      });
      return;
    }
    const safeFallbackDelay = Math.max(0, Number(fallbackDelayMs) || 0);
    setTimeoutSafe(run, safeFallbackDelay);
  }

  function readBootstrapInFlightUid() {
    return String(state?.__authBootstrapInFlightUid || "").trim();
  }

  function readBootstrapSettledUid() {
    return String(state?.__authBootstrapSettledUid || "").trim();
  }

  function markBootstrapInFlight(uid = "") {
    if (!state) return;
    const safeUid = String(uid || "").trim();
    state.__authBootstrapInFlightUid = safeUid;
    if (safeUid) {
      state.__authBootstrapSettledUid = "";
      markProfileTruthLoading();
    }
  }

  function clearBootstrapInFlight(uid = "") {
    if (!state) return;
    const safeUid = String(uid || "").trim();
    if (!safeUid || readBootstrapInFlightUid() === safeUid) {
      state.__authBootstrapInFlightUid = "";
    }
  }

  function markBootstrapSettled(uid = "") {
    if (!state) return;
    const safeUid = String(uid || "").trim();
    state.__authBootstrapSettledUid = safeUid;
    if (!safeUid || readBootstrapInFlightUid() === safeUid) {
      state.__authBootstrapInFlightUid = "";
    }
    if (safeUid) {
      markProfileTruthReady();
    }
  }

  function markPendingAuthRestore(uid = "") {
    if (!state) return;
    state.__authPendingRestoreUid = String(uid || "").trim();
  }

  function clearPendingAuthRestore(uid = "") {
    if (!state) return;
    const safeUid = String(uid || "").trim();
    const pendingUid = String(state.__authPendingRestoreUid || "").trim();
    if (!safeUid || !pendingUid || pendingUid === safeUid) {
      state.__authPendingRestoreUid = "";
    }
  }

  function createCachedAuthUser(uid = "") {
    const safeUid = String(uid || "").trim();
    if (!safeUid) return null;
    const profile = state?.userProfile && typeof state.userProfile === "object"
      ? state.userProfile
      : {};
    return {
      uid: safeUid,
      displayName: String(profile.name || "").trim(),
      email: String(profile.email || "").trim(),
      photoURL: String(profile.avatar || "").trim(),
      __cachedAuthUser: true,
      __cachedAuthRestoring: true
    };
  }

  function isCurrentAuthTransition(transitionSeq, expectedUid = "") {
    if (transitionSeq !== authTransitionSeq) return false;
    if (!expectedUid) return true;
    return String(state?.user?.uid || "").trim() === String(expectedUid || "").trim();
  }

  function isQrMenuProfileLaunchActive() {
    const activeTab = String(state?.activeTab || "").trim().toLowerCase();
    if (activeTab !== "profile") return false;
    const profileTopTab = String(state?.profileTopTab || "").trim().toLowerCase();
    if (profileTopTab !== "menu") return false;
    const menuAccessSource = String(state?.profileView?.menuAccessSource || "").trim().toLowerCase();
    return menuAccessSource === "qr";
  }

  function isGuestDeepRouteLaunchActive() {
    if (state?.user) return false;
    const activeTab = String(state?.activeTab || "").trim().toLowerCase();
    if (activeTab !== "profile") return false;
    const restaurantId = String(state?.profileView?.profile?.restaurantId || "").trim();
    if (!restaurantId) return false;
    const profileTopTab = String(state?.profileTopTab || "").trim().toLowerCase();
    return profileTopTab === "menu" || profileTopTab === "profile";
  }

  function readWebDirectEntryState() {
    const candidate = state?.__webDirectEntry;
    if (!candidate || typeof candidate !== "object") return null;
    return candidate;
  }

  function isWebDirectProfileLaunchActive() {
    const entry = readWebDirectEntryState();
    if (!entry || entry.active !== true || entry.webPriority !== true) return false;
    const surface = String(entry.surface || "").trim().toLowerCase();
    if (surface !== "profile" && surface !== "menu") return false;
    const activeTab = String(state?.activeTab || "").trim().toLowerCase();
    if (activeTab !== "profile") return false;
    const profileTopTab = String(state?.profileTopTab || "").trim().toLowerCase();
    return profileTopTab === "profile" || profileTopTab === "menu";
  }

  function isWebDirectGuestProfileLaunchActive() {
    if (state?.user) return false;
    return isWebDirectProfileLaunchActive();
  }

  function isSafePublicRouteLaunchActive() {
    return isQrMenuProfileLaunchActive() || isWebDirectProfileLaunchActive();
  }

  function runNonBlockingRouteOpenWithTimeline() {
    if (state?.user?.__cachedAuthUser === true) {
      markStartup("non-blocking route open skipped", { reason: "cached-auth-restore" });
      return { skipped: true };
    }
    markStartup("non-blocking route open start");
    try {
      return postLoginRouteOpen.openNonBlockingRoutes();
    } finally {
      markStartup("non-blocking route open end");
    }
  }

  function schedulePendingRouteReplayWithTimeline() {
    const pendingRouteFlags = postLoginRouteOpen.resolvePendingRouteFlags();
    if (!pendingRouteFlags.hasAny) {
      runNonBlockingRouteOpenWithTimeline();
      return;
    }
    markStartup("pending route open start");
    void Promise.resolve(postLoginRouteOpen.openPendingRoutes())
      .catch((err) => {
        reportCriticalRuntimeFailure("auth.pendingRouteOpen", err);
      })
      .finally(() => {
        markStartup("pending route open end");
      });
  }

  function hasMeaningfulProfileHint(profile = null) {
    if (!profile || typeof profile !== "object") return false;
    const role = String(profile.role || "").trim().toLowerCase();
    const roles = Array.isArray(profile.roles) ? profile.roles : [];
    return !!(
      String(profile.name || "").trim()
      || String(profile.handle || "").trim()
      || String(profile.avatar || "").trim()
      || String(profile.restaurantId || "").trim()
      || String(profile.staffRestaurantId || "").trim()
      || String(profile.waiterRestaurantId || "").trim()
      || String(profile.sourceUserRole || "").trim()
      || (role && role !== "user")
      || roles.length
    );
  }

  function primeFastAuthProfileHints(user, snapshot = null) {
    const uid = String(user?.uid || "").trim();
    if (!uid) return false;
    let changed = false;
    const authSnapshot = snapshot && typeof snapshot === "object" ? snapshot : readAuthBootstrapSnapshot();
    const snapshotUid = String(authSnapshot?.uid || "").trim();
    if (snapshotUid && snapshotUid === uid) {
      if (applyAuthBootstrapSnapshot(authSnapshot)) {
        changed = true;
      }
    }
    if (applyPersistedAuthProfileHints(uid)) {
      changed = true;
    }
    return changed;
  }

  function primeAuthenticatedShell(user, snapshot = null) {
    const uid = String(user?.uid || "").trim();
    if (!state || !uid) return false;
    state.user = user;
    if (state.auth) {
      state.auth.open = false;
      state.auth.loading = false;
    }
    clearPendingAuthRestore(uid);
    loadUserScopedPersisted(user);
    const changed = primeFastAuthProfileHints(user, snapshot);
    if (hasMeaningfulProfileHint(state.userProfile)) {
      writeAuthBootstrapSnapshot();
    }
    return changed;
  }

  async function bootstrapUser(user, { transitionSeq = 0 } = {}) {
    const expectedUid = String(user?.uid || "").trim();
    if (!expectedUid) return false;
    if (transitionSeq && !isCurrentAuthTransition(transitionSeq, expectedUid)) return false;
    await runBootstrapUser(user);
    if (transitionSeq && !isCurrentAuthTransition(transitionSeq, expectedUid)) return false;
    return true;
  }

  function scheduleGuestTabEnsure({
    prioritize = false,
    visiblePath = false,
    delayMs = 140,
    skip = false
  } = {}) {
    if (skip) return;
    const runEnsure = (scope) => {
      const activeTab = String(state?.activeTab || "").trim().toLowerCase();
      markStartup("guest ensureTabData start", { scope, tab: activeTab || "feed" });
      void Promise.resolve()
        .then(() => ensureTabData(state?.activeTab || ""))
        .catch((err) => {
          reportCriticalRuntimeFailure(scope, err);
        })
        .finally(() => {
          markStartup("guest ensureTabData end", { scope, tab: activeTab || "feed" });
        });
    };
    if (visiblePath) {
      schedulePostVisibleStartupTask(() => {
        runEnsure("startup.ensureTabData.guestVisiblePath");
      }, {
        delayMs
      });
      return;
    }
    if (prioritize) {
      queueMicrotaskSafe(() => {
        runEnsure("startup.ensureTabData.guestPriority");
      });
      return;
    }
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

  function schedulePushOpenTargetMessageHandlerBinding() {
    if (pushOpenTargetMessageHandlerBound) return;
    queueMicrotaskSafe(() => {
      if (pushOpenTargetMessageHandlerBound) return;
      pushOpenTargetMessageHandlerBound = true;
      markStartup("push target bind start");
      try {
        bindPushOpenTargetMessageHandler();
      } finally {
        markStartup("push target bind end");
      }
    });
  }

  function initialize({
    hasInlineBootstrapPayload = false,
    hasWindowBootstrapPromise = false
  } = {}) {
    suspendRender();
    try {
      setStartupAuthState({
        authRestoreState: "pending",
        profileTruthState: "unknown",
        sessionTruthState: "pending",
        startupRestoring: true,
        actionsLockedUntilAuthReady: true,
        trustedCachedAuthUid: ""
      });
      const snapshot = readAuthBootstrapSnapshot();
      setAuthBootstrapSnapshot(snapshot);
      schedulePushOpenTargetMessageHandlerBinding();
      if (state) {
        state.user = auth?.currentUser || null;
      }
      setAuthInitialized(false);
      let pendingRestoreUid = "";
      let routeStateApplied = false;
      if (state?.user) {
        const currentUser = state.user;
        markProfileTruthLoading();
        primeAuthenticatedShell(currentUser, snapshot);
        if (hasMeaningfulProfileHint(state.userProfile)) {
          state.__trustedCachedAuthUid = String(currentUser.uid || "").trim();
        }
        lastAuthUid = currentUser.uid || "";
      } else {
        const appliedSnapshot = applyAuthBootstrapSnapshot(snapshot);
        const snapshotUid = appliedSnapshot ? String(snapshot?.uid || "").trim() : "";
        if (snapshotUid) {
          applyPersistedAuthProfileHints(snapshotUid);
          pendingRestoreUid = snapshotUid;
          markPendingAuthRestore(snapshotUid);
          lastAuthUid = snapshotUid;
          applyPendingInitialRouteState();
          routeStateApplied = true;
          if (!isSafePublicRouteLaunchActive()) {
            const cachedUser = createCachedAuthUser(snapshotUid);
            if (cachedUser) {
              state.user = cachedUser;
              loadUserScopedPersisted(cachedUser);
              primeFastAuthProfileHints(cachedUser, snapshot);
              if (hasMeaningfulProfileHint(state.userProfile)) {
                state.user = createCachedAuthUser(snapshotUid);
                markCachedReturningUser(snapshotUid);
                applyPendingInitialRouteState();
              } else {
                state.user = null;
                setStartupAuthState({
                  authRestoreState: "pending",
                  profileTruthState: "unknown",
                  sessionTruthState: "pending",
                  startupRestoring: true,
                  actionsLockedUntilAuthReady: true,
                  trustedCachedAuthUid: ""
                });
              }
            }
          }
        } else {
          markPendingAuthRestore("");
          lastAuthUid = "";
        }
      }
      if (!routeStateApplied) {
        applyPendingInitialRouteState();
      }
      const pendingProtectedRouteAuthIntent = typeof hasPendingProtectedRouteAuthIntent === "function"
        ? hasPendingProtectedRouteAuthIntent()
        : false;
      const prioritizeGuestSurface = isGuestDeepRouteLaunchActive();
      const webDirectGuestProfileSurface = isWebDirectGuestProfileLaunchActive();
      const safePublicRouteSurface = isSafePublicRouteLaunchActive();
      if (prioritizeGuestSurface || webDirectGuestProfileSurface) {
        if (webDirectGuestProfileSurface) {
          queueMicrotaskSafe(() => {
            runNonBlockingRouteOpenWithTimeline();
          });
        } else {
          runNonBlockingRouteOpenWithTimeline();
        }
      } else {
        queueMicrotaskSafe(() => {
          runNonBlockingRouteOpenWithTimeline();
        });
      }
      requestRender("initialize");
      schedulePerfWarmMark();
      if (((!state?.user && !pendingRestoreUid) || safePublicRouteSurface) && !pendingProtectedRouteAuthIntent) {
        scheduleGuestTabEnsure({
          prioritize: false,
          visiblePath: prioritizeGuestSurface || webDirectGuestProfileSurface,
          delayMs: webDirectGuestProfileSurface ? 520 : 140,
          skip: false
        });
      }
      if (((!state?.user && !pendingRestoreUid) || safePublicRouteSurface) && !pendingProtectedRouteAuthIntent && !hasInlineBootstrapPayload && !hasWindowBootstrapPromise) {
        const bootstrapTimeoutMs = Number(windowObj?.__MENYRA_SOCIAL_BOOTSTRAP_TIMEOUT_MS__ || 0);
        const runPublicBootstrapFetch = () => {
          void fetchPublicBootstrapPayload({
            force: false,
            timeoutMs: Number.isFinite(bootstrapTimeoutMs) && bootstrapTimeoutMs > 0
              ? bootstrapTimeoutMs
              : null
          });
        };
        if (webDirectGuestProfileSurface) {
          queueMicrotaskSafe(runPublicBootstrapFetch);
        } else if (prioritizeGuestSurface) {
          schedulePostVisibleStartupTask(runPublicBootstrapFetch, {
            delayMs: 780
          });
        } else {
          queueMicrotaskSafe(runPublicBootstrapFetch);
        }
      }
    } finally {
      resumeRender();
    }
  }

  function handleAuthStateChanged(user) {
    setAuthInitialized(true);
    const nextUid = String(user?.uid || "").trim();
    markStartup("auth state changed", { uid: nextUid, authenticated: !!nextUid });
    const prevUid = String(lastAuthUid || "").trim();
    const hasPendingRouteReplay = !!postLoginRouteOpen?.resolvePendingRouteFlags?.()?.hasAny;
    const bootstrapInFlightUid = readBootstrapInFlightUid();
    const bootstrapSettledUid = readBootstrapSettledUid();
    if (
      !hasPendingRouteReplay
      &&
      nextUid
      && nextUid === prevUid
      && (
        bootstrapInFlightUid === nextUid
        || (bootstrapSettledUid === nextUid && state?.auth?.loading === false)
      )
    ) {
      if (bootstrapSettledUid === nextUid && state?.auth?.loading === false) {
        markProfileTruthReady();
      } else {
        markProfileTruthLoading();
      }
      primeAuthenticatedShell(user);
      requestRender("auth.sameUserShellSeed");
      return;
    }
    const transitionSeq = ++authTransitionSeq;
    if (shouldResetUserScopedStateCore({ prevUid, nextUid })) {
      resetUserScopedState();
    }
    if (state) {
      state.user = user;
    }
    applyPendingInitialRouteState();
    if (user) {
      markProfileTruthLoading();
      markBootstrapInFlight(nextUid);
      primeAuthenticatedShell(user);
      if (hasMeaningfulProfileHint(state?.userProfile)) {
        state.__trustedCachedAuthUid = nextUid;
      }
      schedulePendingRouteReplayWithTimeline();
      requestRender("auth.userShellSeed");
      // Watchdog: ein haengender (nie rejectender) Firestore-Read im Bootstrap
      // darf die Shell nicht dauerhaft sperren. Feuert die Deadline, bevor der
      // Bootstrap settled, entsperren wir die Shell mit der bereits geprimten
      // (Instant-Snapshot-)Identitaet; der echte Bootstrap laeuft weiter und
      // gleicht bei Rueckkehr ab. Kein Abbruch des laufenden Reads.
      let bootstrapConcluded = false;
      let bootstrapWatchdogUnlocked = false;
      const bootstrapWatchdogTimer = setTimeoutSafe(() => {
        if (bootstrapConcluded) return;
        if (!isCurrentAuthTransition(transitionSeq, nextUid)) return;
        bootstrapWatchdogUnlocked = true;
        markProfileTruthReady();
        requestRender("auth.bootstrapWatchdog");
      }, AUTH_BOOTSTRAP_WATCHDOG_MS);
      void (async () => {
        try {
          await bootstrapUser(user, { transitionSeq });
          if (!isCurrentAuthTransition(transitionSeq, nextUid)) return;
          markBootstrapSettled(nextUid);
          requestRender("auth.bootstrapSettled");
        } catch (err) {
          reportCriticalRuntimeFailure("auth.bootstrapUser.standard", err);
          // Hat der Watchdog die Shell bereits (mit Cache) entsperrt, downgraden
          // wir eine sichtbare UI NICHT nachtraeglich auf "error".
          if (!bootstrapWatchdogUnlocked && isCurrentAuthTransition(transitionSeq, nextUid)) {
            markProfileTruthError();
            clearBootstrapInFlight(nextUid);
            requestRender("auth.bootstrapFailed");
          }
        } finally {
          bootstrapConcluded = true;
          clearTimeout(bootstrapWatchdogTimer);
          clearBootstrapInFlight(nextUid);
        }
      })();
    } else {
      setStartupAuthState({
        authRestoreState: "guest",
        profileTruthState: "ready",
        sessionTruthState: "guest",
        startupRestoring: false,
        actionsLockedUntilAuthReady: false,
        trustedCachedAuthUid: ""
      });
      clearPendingAuthRestore();
      markBootstrapSettled("");
      clearAuthBootstrapSnapshot();
      if (state) {
        state.roleSwitchRoles = [];
        state.roleSwitchRestaurantId = "";
      }
      stopLiveListeners();
      const openedProtectedRouteAuth = typeof openPendingProtectedRouteAuthPrompt === "function"
        ? openPendingProtectedRouteAuthPrompt()
        : false;
      if (state?.auth && !openedProtectedRouteAuth) {
        state.auth.open = false;
        state.auth.loading = false;
      } else if (state?.auth) {
        state.auth.loading = false;
      }
      loadGuestScopedPersisted();
      if (state && !openedProtectedRouteAuth) {
        state.activeTab = sanitizeTabForSession(state.activeTab, { hasProfileView: !!state.profileView });
      }
      requestRender("auth.signedOut");
      const runSignedOutEnsure = () => {
        void ensureTabData(state?.activeTab || "").catch((err) => {
          reportCriticalRuntimeFailure("auth.ensureTabData.afterSignOut", err);
        });
      };
      if (!isWebDirectGuestProfileLaunchActive() && !openedProtectedRouteAuth) {
        queueMicrotaskSafe(runSignedOutEnsure);
      }
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
