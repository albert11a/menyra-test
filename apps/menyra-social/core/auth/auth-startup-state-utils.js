import {
  readAuthBootstrapSnapshotCore,
  buildAuthBootstrapSnapshotPayload,
  persistAuthBootstrapSnapshot,
  clearAuthBootstrapSnapshotStorage,
  applyAuthBootstrapSnapshotToProfile
} from "./auth-bootstrap-snapshot.js";
import { applyPendingInitialRouteStateCore } from "./session-tab-guards.js";

export function createAuthStartupStateHelpers({
  state = null,
  defaultProfile = {},
  safeStorage = null,
  authSnapshotKey = "",
  profileKey = (uid) => uid,
  sanitizeDisplayName = (value = "", fallback = "") => String(value || fallback || ""),
  getOptimizedImageUrl = (value) => value,
  isPlaceholderUrl = () => false,
  getUserAvatarCache = () => "",
  setUserAvatarCache = () => {},
  setLastShellAvatarUrl = () => {},
  getAuthBootstrapSnapshot = () => null,
  setAuthBootstrapSnapshot = () => {},
  getPendingInitialTab = () => "",
  setPendingInitialTab = () => {},
  getPendingAuthMode = () => "",
  setPendingAuthMode = () => {},
  now = () => Date.now()
} = {}) {
  const resolveProfileKey = typeof profileKey === "function" ? profileKey : ((uid) => uid);
  const readUserAvatarCache = typeof getUserAvatarCache === "function" ? getUserAvatarCache : (() => "");
  const writeUserAvatarCache = typeof setUserAvatarCache === "function" ? setUserAvatarCache : (() => {});
  const writeLastShellAvatarUrl = typeof setLastShellAvatarUrl === "function" ? setLastShellAvatarUrl : (() => {});
  const readAuthSnapshot = typeof getAuthBootstrapSnapshot === "function" ? getAuthBootstrapSnapshot : (() => null);
  const writeAuthSnapshot = typeof setAuthBootstrapSnapshot === "function" ? setAuthBootstrapSnapshot : (() => {});
  const readPendingInitialTab = typeof getPendingInitialTab === "function" ? getPendingInitialTab : (() => "");
  const writePendingInitialTab = typeof setPendingInitialTab === "function" ? setPendingInitialTab : (() => {});
  const readPendingAuthMode = typeof getPendingAuthMode === "function" ? getPendingAuthMode : (() => "");
  const writePendingAuthMode = typeof setPendingAuthMode === "function" ? setPendingAuthMode : (() => {});

  function applyPendingInitialRouteState() {
    if (!state) return;
    const next = applyPendingInitialRouteStateCore({
      activeTab: state.activeTab,
      user: state.user,
      hasProfileView: !!state.profileView,
      pendingInitialTab: readPendingInitialTab(),
      pendingAuthMode: readPendingAuthMode(),
      authMode: state.auth?.mode,
      authOpen: !!state.auth?.open
    });
    state.activeTab = next.activeTab;
    writePendingInitialTab(next.pendingInitialTab);
    writePendingAuthMode(next.pendingAuthMode);
    state.auth.mode = next.authMode;
    state.auth.open = next.authOpen;
  }

  function readAuthBootstrapSnapshot() {
    return readAuthBootstrapSnapshotCore({
      safeStorage,
      authSnapshotKey,
      now
    });
  }

  function writeAuthBootstrapSnapshot(snapshot = null) {
    const payload = buildAuthBootstrapSnapshotPayload({
      snapshot,
      user: state?.user,
      userProfile: state?.userProfile,
      userAvatarCache: readUserAvatarCache(),
      sanitizeDisplayName,
      getOptimizedImageUrl,
      isPlaceholderUrl,
      now
    });
    if (!payload) return;
    writeAuthSnapshot(payload);
    persistAuthBootstrapSnapshot({
      safeStorage,
      authSnapshotKey,
      payload
    });
  }

  function clearAuthBootstrapSnapshot() {
    writeAuthSnapshot(null);
    clearAuthBootstrapSnapshotStorage({
      safeStorage,
      authSnapshotKey
    });
  }

  function applyAuthBootstrapSnapshot(snapshot = readAuthSnapshot()) {
    if (!state) return false;
    const result = applyAuthBootstrapSnapshotToProfile({
      snapshot,
      defaultProfile,
      currentProfile: state.userProfile,
      sanitizeDisplayName,
      getOptimizedImageUrl
    });
    if (!result.applied) return false;
    state.userProfile = result.nextProfile;
    if (result.resolvedAvatar && !isPlaceholderUrl(result.resolvedAvatar)) {
      writeUserAvatarCache(result.resolvedAvatar);
      writeLastShellAvatarUrl(result.resolvedAvatar);
    }
    return true;
  }

  function applyPersistedAuthProfileHints(uid = "") {
    if (!state) return false;
    const safeUid = String(uid || "").trim();
    if (!safeUid) return false;
    const raw = safeStorage?.getItem?.(resolveProfileKey(safeUid));
    if (!raw) return false;
    try {
      const parsed = JSON.parse(raw) || {};
      const restaurantId = String(parsed.restaurantId || "").trim();
      const role = String(parsed.role || "").trim();
      const roles = Array.isArray(parsed.roles) ? parsed.roles.slice() : [];
      const name = sanitizeDisplayName(parsed.name || "", "");
      const handle = String(parsed.handle || "").replace(/^@/, "").trim();
      const avatar = String(parsed.avatar || "").trim();
      state.userProfile = {
        ...state.userProfile,
        uid: safeUid,
        role: role || state.userProfile.role,
        roles: roles.length ? roles : state.userProfile.roles,
        restaurantId: restaurantId || state.userProfile.restaurantId,
        name: name || state.userProfile.name,
        handle: handle || state.userProfile.handle,
        avatar: avatar || state.userProfile.avatar
      };
      return true;
    } catch {
      return false;
    }
  }

  function saveUserProfileToStorage(profile = state?.userProfile) {
    const nextProfile = profile || state?.userProfile || {};
    const uid = nextProfile?.uid || state?.user?.uid || "";
    if (!uid) return;
    try {
      safeStorage?.setItem?.(resolveProfileKey(uid), JSON.stringify(nextProfile));
    } catch {}
    writeAuthBootstrapSnapshot({
      uid,
      name: nextProfile?.name || state?.user?.displayName || "",
      handle: nextProfile?.handle || "",
      avatar: nextProfile?.avatar || state?.user?.photoURL || readUserAvatarCache() || ""
    });
  }

  return {
    applyPendingInitialRouteState,
    saveUserProfileToStorage,
    readAuthBootstrapSnapshot,
    writeAuthBootstrapSnapshot,
    clearAuthBootstrapSnapshot,
    applyAuthBootstrapSnapshot,
    applyPersistedAuthProfileHints
  };
}
