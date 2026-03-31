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
  pendingRouteState = null,
  getPendingInitialTab = () => "",
  setPendingInitialTab = () => {},
  getPendingAuthMode = () => "",
  setPendingAuthMode = () => {},
  getGuestScopeUid = () => undefined,
  now = () => Date.now()
} = {}) {
  const resolveProfileKey = typeof profileKey === "function" ? profileKey : ((uid) => uid);
  const readUserAvatarCache = typeof getUserAvatarCache === "function" ? getUserAvatarCache : (() => "");
  const writeUserAvatarCache = typeof setUserAvatarCache === "function" ? setUserAvatarCache : (() => {});
  const writeLastShellAvatarUrl = typeof setLastShellAvatarUrl === "function" ? setLastShellAvatarUrl : (() => {});
  const readAuthSnapshot = typeof getAuthBootstrapSnapshot === "function" ? getAuthBootstrapSnapshot : (() => null);
  const writeAuthSnapshot = typeof setAuthBootstrapSnapshot === "function" ? setAuthBootstrapSnapshot : (() => {});
  const readPendingInitialTab = typeof pendingRouteState?.getPendingInitialTab === "function"
    ? pendingRouteState.getPendingInitialTab
    : (typeof getPendingInitialTab === "function" ? getPendingInitialTab : (() => ""));
  const writePendingInitialTab = typeof pendingRouteState?.setPendingInitialTab === "function"
    ? pendingRouteState.setPendingInitialTab
    : (typeof setPendingInitialTab === "function" ? setPendingInitialTab : (() => {}));
  const readPendingAuthMode = typeof pendingRouteState?.getPendingAuthMode === "function"
    ? pendingRouteState.getPendingAuthMode
    : (typeof getPendingAuthMode === "function" ? getPendingAuthMode : (() => ""));
  const writePendingAuthMode = typeof pendingRouteState?.setPendingAuthMode === "function"
    ? pendingRouteState.setPendingAuthMode
    : (typeof setPendingAuthMode === "function" ? setPendingAuthMode : (() => {}));
  const readGuestScopeUid = typeof getGuestScopeUid === "function" ? getGuestScopeUid : (() => undefined);

  function applyPendingInitialRouteState() {
    if (!state) return;
    const next = applyPendingInitialRouteStateCore({
      activeTab: state.activeTab,
      user: state.user,
      hasProfileView: !!state.profileView,
      guestScopeUid: readGuestScopeUid(),
      profileTopTab: state.profileTopTab,
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
      const hasOwn = (key) => Object.prototype.hasOwnProperty.call(parsed || {}, key);
      const restaurantId = String(parsed.restaurantId || "").trim();
      const role = String(parsed.role || "").trim();
      const roles = Array.isArray(parsed.roles) ? parsed.roles.slice() : [];
      const sourceUserRole = String(parsed.sourceUserRole || "").trim();
      const staffRestaurantId = String(parsed.staffRestaurantId || "").trim();
      const waiterRestaurantId = String(parsed.waiterRestaurantId || "").trim();
      const staffRole = String(parsed.staffRole || "").trim();
      const businessOwnerUid = String(parsed.businessOwnerUid || "").trim();
      const staffStatus = String(parsed.staffStatus || "").trim();
      const socialAccessMode = String(parsed.socialAccessMode || "").trim();
      const name = sanitizeDisplayName(parsed.name || "", "");
      const handle = String(parsed.handle || "").replace(/^@/, "").trim();
      const avatar = String(parsed.avatar || "").trim();
      const businessAccess = parsed.businessAccess === true;
      const waiterAccess = parsed.waiterAccess === true;
      const staffActive = parsed.staffActive === false ? false : true;
      state.userProfile = {
        ...state.userProfile,
        uid: safeUid,
        role: hasOwn("role") ? role : state.userProfile.role,
        roles: Array.isArray(parsed.roles) ? roles : state.userProfile.roles,
        restaurantId: hasOwn("restaurantId") ? restaurantId : state.userProfile.restaurantId,
        sourceUserRole: hasOwn("sourceUserRole") ? sourceUserRole : state.userProfile.sourceUserRole,
        staffRestaurantId: hasOwn("staffRestaurantId") ? staffRestaurantId : state.userProfile.staffRestaurantId,
        waiterRestaurantId: hasOwn("waiterRestaurantId") ? waiterRestaurantId : state.userProfile.waiterRestaurantId,
        businessAccess: hasOwn("businessAccess") ? businessAccess : state.userProfile.businessAccess === true,
        waiterAccess: hasOwn("waiterAccess") ? waiterAccess : state.userProfile.waiterAccess === true,
        permissions: {
          businessAccess: hasOwn("businessAccess") ? businessAccess : state.userProfile.businessAccess === true,
          waiterAccess: hasOwn("waiterAccess") ? waiterAccess : state.userProfile.waiterAccess === true
        },
        staffRole: hasOwn("staffRole") ? staffRole : state.userProfile.staffRole,
        businessOwnerUid: hasOwn("businessOwnerUid") ? businessOwnerUid : state.userProfile.businessOwnerUid,
        staffActive: hasOwn("staffActive") ? staffActive : state.userProfile.staffActive,
        staffStatus: hasOwn("staffStatus") ? staffStatus : state.userProfile.staffStatus,
        socialAccessMode: hasOwn("socialAccessMode") ? socialAccessMode : state.userProfile.socialAccessMode,
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
