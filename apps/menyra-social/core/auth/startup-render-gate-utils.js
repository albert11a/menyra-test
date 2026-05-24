const SAFE_PUBLIC_TOP_TABS = new Set(["profile", "menu"]);
const PROTECTED_STARTUP_TABS = new Set([
  "profile",
  "menu",
  "chat",
  "notifications",
  "upload",
  "staff",
  "businessaccounts",
  "settings"
]);

function safeLower(value = "") {
  return String(value || "").trim().toLowerCase();
}

function normalizeStateKey(value = "") {
  return String(value || "").trim().replace(/[\s_-]+/g, "").toLowerCase();
}

function normalizeAuthRestoreState(value = "", fallback = "pending") {
  const state = normalizeStateKey(value);
  if (state === "cachedreturninguser") return "cachedReturningUser";
  if (state === "authenticated") return "authenticated";
  if (state === "guest") return "guest";
  if (state === "error") return "error";
  if (state === "pending") return "pending";
  const fallbackState = normalizeStateKey(fallback);
  if (fallbackState === "cachedreturninguser") return "cachedReturningUser";
  if (fallbackState === "authenticated") return "authenticated";
  if (fallbackState === "guest") return "guest";
  if (fallbackState === "error") return "error";
  return "pending";
}

function normalizeProfileTruthState(value = "", fallback = "unknown") {
  const state = normalizeStateKey(value);
  if (state === "cachedstale") return "cachedStale";
  if (state === "loading") return "loading";
  if (state === "ready") return "ready";
  if (state === "error") return "error";
  if (state === "unknown") return "unknown";
  const fallbackState = normalizeStateKey(fallback);
  if (fallbackState === "cachedstale") return "cachedStale";
  if (fallbackState === "loading") return "loading";
  if (fallbackState === "ready") return "ready";
  if (fallbackState === "error") return "error";
  return "unknown";
}

function readProfileView(state = {}) {
  return state?.profileView && typeof state.profileView === "object"
    ? state.profileView
    : null;
}

function readRoutePayload(profileView = null) {
  return profileView?.routePayload && typeof profileView.routePayload === "object"
    ? profileView.routePayload
    : null;
}

function readWebDirectEntry(state = {}) {
  return state?.__webDirectEntry && typeof state.__webDirectEntry === "object" && state.__webDirectEntry.active === true
    ? state.__webDirectEntry
    : null;
}

function readProfileDirectEntry(state = {}) {
  const profileView = readProfileView(state);
  if (profileView?.directEntry && typeof profileView.directEntry === "object") {
    return profileView.directEntry;
  }
  return readWebDirectEntry(state);
}

function resolvePublicProfileRestaurantId(state = {}) {
  const profileView = readProfileView(state);
  const profile = profileView?.profile && typeof profileView.profile === "object"
    ? profileView.profile
    : null;
  const routePayload = readRoutePayload(profileView);
  const webDirectEntry = readWebDirectEntry(state);
  return String(
    profile?.canonicalRestaurantId
    || routePayload?.canonicalRestaurantId
    || routePayload?.businessSnapshot?.restaurantId
    || profile?.restaurantId
    || routePayload?.restaurantId
    || webDirectEntry?.canonicalRestaurantId
    || webDirectEntry?.restaurantId
    || ""
  ).trim();
}

function resolveCurrentStartupSurface(state = {}) {
  const activeTab = safeLower(state?.activeTab || "feed") || "feed";
  if (activeTab !== "profile") {
    return {
      activeTab,
      topTab: "",
      surface: activeTab
    };
  }
  const directEntry = readProfileDirectEntry(state);
  const topTab = safeLower(
    state?.profileTopTab
    || directEntry?.topTab
    || ""
  ) || "profile";
  return {
    activeTab,
    topTab,
    surface: topTab === "menu" ? "public-menu" : "public-profile"
  };
}

export function isAuthStartupSettled(state = {}) {
  const authRestoreState = normalizeAuthRestoreState(
    state?.authRestoreState || state?.__authRestoreState || "",
    state?.user ? "authenticated" : "pending"
  );
  return authRestoreState !== "pending" && authRestoreState !== "cachedReturningUser";
}

export function isSafePublicStartupSurface(state = {}) {
  const profileView = readProfileView(state);
  if (!profileView) return false;
  if (safeLower(state?.activeTab || "") !== "profile") return false;
  const restaurantId = resolvePublicProfileRestaurantId(state);
  if (!restaurantId) return false;

  const directEntry = readProfileDirectEntry(state);
  const webDirectEntry = readWebDirectEntry(state);
  const topTab = safeLower(
    state?.profileTopTab
    || directEntry?.topTab
    || webDirectEntry?.topTab
    || ""
  ) || "profile";
  if (!SAFE_PUBLIC_TOP_TABS.has(topTab)) return false;

  const directOwner = safeLower(directEntry?.owner || webDirectEntry?.owner || "");
  const isWebDirectPublicRoute = directOwner === "web-direct"
    && (
      directEntry?.routeFirst === true
      || webDirectEntry?.routeFirst === true
      || webDirectEntry?.webPriority === true
    );
  const menuAccessSource = safeLower(
    profileView?.menuAccessSource
    || directEntry?.menuAccessSource
    || webDirectEntry?.menuAccessSource
    || ""
  );
  const tableNumber = Number(
    profileView?.tableNumber
    || directEntry?.tableNumber
    || webDirectEntry?.tableNumber
    || 0
  ) || 0;
  const isQrMenuRoute = topTab === "menu"
    && menuAccessSource === "qr"
    && tableNumber >= 0;

  return isWebDirectPublicRoute || isQrMenuRoute;
}

export function isProtectedSurfaceBlockedDuringStartup(state = {}) {
  const currentSurface = resolveCurrentStartupSurface(state);
  const activeTab = currentSurface.activeTab;
  if (isSafePublicStartupSurface(state)) return false;
  return PROTECTED_STARTUP_TABS.has(activeTab);
}

function hasMeaningfulCachedProfileForUid(state = {}, uid = "") {
  const safeUid = String(uid || "").trim();
  if (!safeUid) return false;
  const profile = state?.userProfile && typeof state.userProfile === "object"
    ? state.userProfile
    : null;
  if (!profile) return false;
  const profileUid = String(profile.uid || "").trim();
  if (profileUid && profileUid !== safeUid) return false;
  const role = safeLower(profile.role || "");
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

function resolveTrustedCachedAuthUid(state = {}) {
  const userUid = String(state?.user?.uid || "").trim();
  const pendingUid = String(state?.__authPendingRestoreUid || "").trim();
  const trustedUid = String(state?.__trustedCachedAuthUid || "").trim();
  const cachedUserUid = state?.user?.__cachedAuthUser === true ? userUid : "";
  return trustedUid || cachedUserUid || pendingUid || "";
}

function hasTrustedCachedAuthenticatedUi(state = {}) {
  const uid = resolveTrustedCachedAuthUid(state);
  if (!uid) return false;
  const userUid = String(state?.user?.uid || "").trim();
  if (!userUid || userUid !== uid) return false;
  return hasMeaningfulCachedProfileForUid(state, uid);
}

function buildStartupGateResult({
  canRender = true,
  showNeutralShell = false,
  reason = "startup-render-ready",
  authRestoreState = "pending",
  profileTruthState = "unknown",
  safePublicSurface = false,
  protectedSurfaceBlocked = false,
  interactionSafety = "fullyInteractive",
  actionsLocked = false,
  cachedAuthenticatedSurface = false,
  currentSurface = {}
} = {}) {
  return {
    canRender,
    showNeutralShell,
    reason,
    authRestoreState,
    profileTruthState,
    safePublicSurface,
    protectedSurfaceBlocked,
    interactionSafety,
    actionsLocked,
    actionsDisabled: actionsLocked,
    cachedAuthenticatedSurface,
    ...currentSurface
  };
}

export function resolveStartupRenderGate(state = {}) {
  const authRestoreState = normalizeAuthRestoreState(
    state?.authRestoreState || state?.__authRestoreState || "",
    state?.user ? "authenticated" : "pending"
  );
  const profileTruthState = normalizeProfileTruthState(
    state?.profileTruthState || state?.__profileTruthState || "",
    state?.user
      ? "loading"
      : (authRestoreState === "guest" || authRestoreState === "error" ? "ready" : "unknown")
  );
  const currentSurface = resolveCurrentStartupSurface(state);
  const safePublicSurface = isSafePublicStartupSurface(state);
  const authPending = authRestoreState === "pending";
  const cachedReturningUser = authRestoreState === "cachedReturningUser";
  const profilePending = authRestoreState === "authenticated"
    && profileTruthState !== "ready";
  const protectedSurfaceBlocked = isProtectedSurfaceBlockedDuringStartup(state);
  const trustedCachedAuthenticatedUi = hasTrustedCachedAuthenticatedUi(state);

  if (safePublicSurface) {
    return buildStartupGateResult({
      reason: "safe-public-startup-surface",
      authRestoreState,
      profileTruthState,
      safePublicSurface,
      protectedSurfaceBlocked: false,
      interactionSafety: "fullyInteractive",
      actionsLocked: false,
      currentSurface
    });
  }

  if ((authPending || cachedReturningUser) && trustedCachedAuthenticatedUi) {
    return buildStartupGateResult({
      reason: "trusted-cached-authenticated-startup",
      authRestoreState,
      profileTruthState,
      safePublicSurface,
      protectedSurfaceBlocked,
      interactionSafety: "readOnlySafe",
      actionsLocked: true,
      cachedAuthenticatedSurface: true,
      currentSurface
    });
  }

  if (authPending || cachedReturningUser) {
    return buildStartupGateResult({
      canRender: false,
      showNeutralShell: true,
      reason: protectedSurfaceBlocked ? "auth-restore-pending-protected-surface" : "auth-restore-pending",
      authRestoreState,
      profileTruthState,
      safePublicSurface,
      protectedSurfaceBlocked,
      interactionSafety: "actionsDisabled",
      actionsLocked: true,
      currentSurface
    });
  }

  if (profilePending && trustedCachedAuthenticatedUi) {
    return buildStartupGateResult({
      reason: "authenticated-profile-revalidating-cached-surface",
      authRestoreState,
      profileTruthState,
      safePublicSurface,
      protectedSurfaceBlocked,
      interactionSafety: "readOnlySafe",
      actionsLocked: true,
      cachedAuthenticatedSurface: true,
      currentSurface
    });
  }

  if (profilePending && protectedSurfaceBlocked) {
    return buildStartupGateResult({
      canRender: false,
      showNeutralShell: true,
      reason: profileTruthState === "error"
        ? "profile-truth-error"
        : "profile-truth-pending-protected-surface",
      authRestoreState,
      profileTruthState,
      safePublicSurface,
      protectedSurfaceBlocked,
      interactionSafety: "actionsDisabled",
      actionsLocked: true,
      currentSurface
    });
  }

  if (profilePending) {
    return buildStartupGateResult({
      reason: "authenticated-profile-revalidating",
      authRestoreState,
      profileTruthState,
      safePublicSurface,
      protectedSurfaceBlocked,
      interactionSafety: "actionsDisabled",
      actionsLocked: true,
      currentSurface
    });
  }

  return buildStartupGateResult({
    reason: "startup-render-ready",
    authRestoreState,
    profileTruthState,
    safePublicSurface,
    protectedSurfaceBlocked,
    interactionSafety: "fullyInteractive",
    actionsLocked: false,
    currentSurface
  });
}
