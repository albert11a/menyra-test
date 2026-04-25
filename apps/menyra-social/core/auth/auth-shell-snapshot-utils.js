const SHELL_SNAPSHOT_PREFIX = "menyra_social_shell_snapshot_v1";
const AVATAR_CACHE_PREFIX = "menyra_social_avatar_cache_v1";
const NOTIFICATIONS_PREFIX = "menyra_social_notifications_v1";
const MAX_SNAPSHOT_AGE_MS = 14 * 24 * 60 * 60 * 1000;
const NOTIFICATION_LIMIT = 50;

function normalizeString(value = "") {
  return String(value || "").trim();
}

function readJson(safeStorage, key = "") {
  const safeKey = normalizeString(key);
  if (!safeKey) return null;
  try {
    const raw = safeStorage?.getItem?.(safeKey);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function readText(safeStorage, key = "") {
  const safeKey = normalizeString(key);
  if (!safeKey) return "";
  try {
    return normalizeString(safeStorage?.getItem?.(safeKey));
  } catch {
    return "";
  }
}

function countUnread(items = []) {
  if (!Array.isArray(items)) return 0;
  let total = 0;
  for (const item of items.slice(0, NOTIFICATION_LIMIT)) {
    if (item && typeof item === "object" && item.read !== true) total += 1;
  }
  return total;
}

function readShellSnapshot({ safeStorage, uid, now = () => Date.now() } = {}) {
  const safeUid = normalizeString(uid);
  if (!safeUid) return null;
  const snapshot = readJson(safeStorage, `${SHELL_SNAPSHOT_PREFIX}::${safeUid}`);
  if (!snapshot || typeof snapshot !== "object") return null;
  const snapshotUid = normalizeString(snapshot.uid || safeUid);
  if (snapshotUid && snapshotUid !== safeUid) return null;
  const updatedAt = Number(snapshot.updatedAt || 0);
  if (Number.isFinite(updatedAt) && updatedAt > 0 && now() - updatedAt > MAX_SNAPSHOT_AGE_MS) {
    return null;
  }
  return snapshot;
}

function readAvatarCache(safeStorage, uid = "") {
  const raw = readText(safeStorage, `${AVATAR_CACHE_PREFIX}::${normalizeString(uid)}`);
  if (!raw || raw === "undefined" || raw === "null") return "";
  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object") {
      return normalizeString(parsed.url || parsed.avatar || parsed.avatarUrl || parsed.photoURL || "");
    }
  } catch {}
  return raw;
}

function pickAvatar({ snapshot = null, cachedProfile = null, avatarCache = "", currentProfile = null, user = null } = {}) {
  return normalizeString(
    currentProfile?.avatar
    || snapshot?.avatar
    || snapshot?.avatarUrl
    || cachedProfile?.avatar
    || cachedProfile?.avatarUrl
    || cachedProfile?.photoURL
    || avatarCache
    || user?.photoURL
    || ""
  );
}

function pickNumber(value, fallback = 0) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? Math.max(0, Math.round(numeric)) : fallback;
}

function buildUnreadPlaceholders(count = 0) {
  const total = Math.min(NOTIFICATION_LIMIT, Math.max(0, Math.round(Number(count) || 0)));
  return Array.from({ length: total }, (_, index) => ({
    id: `cached-shell-unread-${index + 1}`,
    type: "cached_shell_unread",
    text: "Cached unread update",
    read: false,
    __shellSnapshotPlaceholder: true
  }));
}

export function seedAuthShellSnapshot({
  state = null,
  safeStorage = null,
  uid = "",
  user = null,
  defaultProfile = {},
  profileKey = (value) => value,
  sanitizeDisplayName = (value = "", fallback = "") => String(value || fallback || ""),
  getOptimizedImageUrl = (value) => value,
  isPlaceholderUrl = () => false,
  setUserAvatarCache = () => {},
  setLastShellAvatarUrl = () => {},
  now = () => Date.now()
} = {}) {
  const safeUid = normalizeString(uid || user?.uid || state?.user?.uid || "");
  if (!state || !safeUid) return false;

  const snapshot = readShellSnapshot({ safeStorage, uid: safeUid, now });
  const cachedProfile = readJson(safeStorage, typeof profileKey === "function" ? profileKey(safeUid) : "") || null;
  const cachedNotifications = readJson(safeStorage, `${NOTIFICATIONS_PREFIX}::${safeUid}`);
  const avatarCache = readAvatarCache(safeStorage, safeUid);
  const previous = state.userProfile && typeof state.userProfile === "object" ? state.userProfile : {};
  const avatar = pickAvatar({ snapshot, cachedProfile, avatarCache, currentProfile: previous, user });
  const resolvedAvatar = getOptimizedImageUrl(avatar, "avatar");
  const hasResolvedAvatar = !!resolvedAvatar && !isPlaceholderUrl(resolvedAvatar);
  const unreadFromNotifications = Array.isArray(cachedNotifications) ? countUnread(cachedNotifications) : null;
  const unreadNotificationsCount = unreadFromNotifications !== null
    ? unreadFromNotifications
    : pickNumber(snapshot?.unreadNotificationsCount, 0);
  const chatUnreadCount = pickNumber(snapshot?.chatUnreadCount, 0);

  state.__shellSnapshot = snapshot || state.__shellSnapshot || null;
  state.__shellSnapshotAvatar = hasResolvedAvatar ? resolvedAvatar : normalizeString(state.__shellSnapshotAvatar || "");
  state.__shellSnapshotUnreadNotificationsCount = unreadNotificationsCount;
  state.__shellSnapshotChatUnreadCount = chatUnreadCount;

  if (!Array.isArray(state.notifications) || state.notifications.length === 0) {
    if (Array.isArray(cachedNotifications) && cachedNotifications.length) {
      state.notifications = cachedNotifications.slice(0, NOTIFICATION_LIMIT);
    } else if (unreadNotificationsCount > 0) {
      state.notifications = buildUnreadPlaceholders(unreadNotificationsCount);
    }
  }

  state.userProfile = {
    ...defaultProfile,
    ...previous,
    uid: safeUid,
    name: sanitizeDisplayName(cachedProfile?.name || snapshot?.name || previous.name || "", "") || previous.name || "",
    handle: normalizeString(cachedProfile?.handle || snapshot?.handle || previous.handle || "").replace(/^@/, ""),
    avatar: hasResolvedAvatar ? resolvedAvatar : previous.avatar || "",
    role: cachedProfile?.role ?? snapshot?.role ?? previous.role,
    roles: Array.isArray(cachedProfile?.roles) ? cachedProfile.roles.slice() : (Array.isArray(snapshot?.roles) ? snapshot.roles.slice() : previous.roles),
    restaurantId: cachedProfile?.restaurantId ?? snapshot?.restaurantId ?? previous.restaurantId,
    sourceUserRole: cachedProfile?.sourceUserRole ?? snapshot?.sourceUserRole ?? previous.sourceUserRole,
    staffRestaurantId: cachedProfile?.staffRestaurantId ?? snapshot?.staffRestaurantId ?? previous.staffRestaurantId,
    waiterRestaurantId: cachedProfile?.waiterRestaurantId ?? snapshot?.waiterRestaurantId ?? previous.waiterRestaurantId,
    businessAccess: cachedProfile?.businessAccess === true || snapshot?.businessAccess === true || previous.businessAccess === true,
    waiterAccess: cachedProfile?.waiterAccess === true || snapshot?.waiterAccess === true || previous.waiterAccess === true,
    permissions: {
      ...(previous.permissions && typeof previous.permissions === "object" ? previous.permissions : {}),
      businessAccess: cachedProfile?.businessAccess === true || snapshot?.businessAccess === true || previous.businessAccess === true,
      waiterAccess: cachedProfile?.waiterAccess === true || snapshot?.waiterAccess === true || previous.waiterAccess === true
    }
  };

  if (hasResolvedAvatar) {
    setUserAvatarCache(resolvedAvatar);
    setLastShellAvatarUrl(resolvedAvatar);
  }
  return !!(snapshot || cachedProfile || hasResolvedAvatar || unreadNotificationsCount > 0 || chatUnreadCount > 0);
}

export function writeAuthShellSnapshot({
  state = null,
  safeStorage = null,
  uid = "",
  avatar = "",
  unreadNotificationsCount = 0,
  chatUnreadCount = 0,
  now = () => Date.now(),
  isPlaceholderUrl = () => false
} = {}) {
  const safeUid = normalizeString(uid || state?.user?.uid || state?.userProfile?.uid || "");
  if (!safeUid || !safeStorage) return false;
  const previous = readShellSnapshot({ safeStorage, uid: safeUid, now }) || {};
  const profile = state?.userProfile && typeof state.userProfile === "object" ? state.userProfile : {};
  const nextAvatar = normalizeString(avatar || profile.avatar || state?.__shellSnapshotAvatar || previous.avatar || state?.user?.photoURL || "");
  const payload = {
    ...previous,
    uid: safeUid,
    name: normalizeString(profile.name || previous.name || state?.user?.displayName || ""),
    handle: normalizeString(profile.handle || previous.handle || ""),
    avatar: nextAvatar && !isPlaceholderUrl(nextAvatar) ? nextAvatar : normalizeString(previous.avatar || ""),
    role: profile.role ?? previous.role,
    roles: Array.isArray(profile.roles) ? profile.roles.slice() : (Array.isArray(previous.roles) ? previous.roles : []),
    restaurantId: normalizeString(profile.restaurantId || previous.restaurantId || ""),
    sourceUserRole: normalizeString(profile.sourceUserRole || previous.sourceUserRole || ""),
    staffRestaurantId: normalizeString(profile.staffRestaurantId || previous.staffRestaurantId || ""),
    waiterRestaurantId: normalizeString(profile.waiterRestaurantId || previous.waiterRestaurantId || ""),
    businessAccess: profile.businessAccess === true || previous.businessAccess === true,
    waiterAccess: profile.waiterAccess === true || previous.waiterAccess === true,
    unreadNotificationsCount: pickNumber(unreadNotificationsCount, pickNumber(previous.unreadNotificationsCount, 0)),
    chatUnreadCount: pickNumber(chatUnreadCount, pickNumber(previous.chatUnreadCount, 0)),
    updatedAt: now()
  };
  try {
    safeStorage.setItem(`${SHELL_SNAPSHOT_PREFIX}::${safeUid}`, JSON.stringify(payload));
    state.__shellSnapshot = payload;
    state.__shellSnapshotAvatar = payload.avatar || state.__shellSnapshotAvatar || "";
    state.__shellSnapshotUnreadNotificationsCount = payload.unreadNotificationsCount;
    state.__shellSnapshotChatUnreadCount = payload.chatUnreadCount;
    return true;
  } catch {
    return false;
  }
}
