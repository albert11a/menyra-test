export function readAuthBootstrapSnapshotCore({
  safeStorage,
  authSnapshotKey,
  now = () => Date.now()
} = {}) {
  const raw = safeStorage?.getItem?.(authSnapshotKey);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    const uid = String(parsed?.uid || "").trim();
    if (!uid) return null;
    const name = String(parsed?.name || "").trim();
    const handle = String(parsed?.handle || "").replace(/^@/, "").trim();
    const avatar = String(parsed?.avatar || "").trim();
    const role = String(parsed?.role || "").trim();
    const sourceUserRole = String(parsed?.sourceUserRole || "").trim();
    const restaurantId = String(parsed?.restaurantId || "").trim();
    const staffRestaurantId = String(parsed?.staffRestaurantId || "").trim();
    const waiterRestaurantId = String(parsed?.waiterRestaurantId || "").trim();
    const staffRole = String(parsed?.staffRole || "").trim();
    const businessOwnerUid = String(parsed?.businessOwnerUid || "").trim();
    const staffStatus = String(parsed?.staffStatus || "").trim();
    const socialAccessMode = String(parsed?.socialAccessMode || "").trim();
    const roles = Array.isArray(parsed?.roles) ? parsed.roles.slice() : [];
    const businessAccess = parsed?.businessAccess === true;
    const waiterAccess = parsed?.waiterAccess === true;
    const staffActive = parsed?.staffActive === false ? false : true;
    return {
      uid,
      name,
      handle,
      avatar,
      role,
      roles,
      sourceUserRole,
      restaurantId,
      staffRestaurantId,
      waiterRestaurantId,
      businessAccess,
      waiterAccess,
      staffRole,
      businessOwnerUid,
      staffActive,
      staffStatus,
      socialAccessMode,
      ts: Number(parsed?.ts || 0) || now()
    };
  } catch {
    return null;
  }
}

export function buildAuthBootstrapSnapshotPayload({
  snapshot = null,
  user = null,
  userProfile = null,
  userAvatarCache = "",
  sanitizeDisplayName,
  getOptimizedImageUrl,
  isPlaceholderUrl,
  now = () => Date.now()
} = {}) {
  const source = snapshot && typeof snapshot === "object" ? snapshot : {};
  const uid = String(source.uid || user?.uid || userProfile?.uid || "").trim();
  if (!uid) return null;

  const name = sanitizeDisplayName(
    source.name || userProfile?.name || user?.displayName || "",
    ""
  );
  const handle = String(source.handle || userProfile?.handle || "").replace(/^@/, "").trim();
  const avatarRaw = String(
    source.avatar || userProfile?.avatar || user?.photoURL || userAvatarCache || ""
  ).trim();
  const avatarResolved = getOptimizedImageUrl(avatarRaw, "avatar");
  const avatar = avatarResolved && !isPlaceholderUrl(avatarResolved) ? avatarRaw : "";
  const profileRoles = Array.isArray(userProfile?.roles) ? userProfile.roles.slice() : [];
  return {
    uid,
    name,
    handle,
    avatar,
    role: String(source.role || userProfile?.role || "").trim(),
    roles: profileRoles,
    sourceUserRole: String(source.sourceUserRole || userProfile?.sourceUserRole || "").trim(),
    restaurantId: String(source.restaurantId || userProfile?.restaurantId || "").trim(),
    staffRestaurantId: String(source.staffRestaurantId || userProfile?.staffRestaurantId || "").trim(),
    waiterRestaurantId: String(source.waiterRestaurantId || userProfile?.waiterRestaurantId || "").trim(),
    businessAccess: source.businessAccess === true || userProfile?.businessAccess === true,
    waiterAccess: source.waiterAccess === true || userProfile?.waiterAccess === true,
    staffRole: String(source.staffRole || userProfile?.staffRole || "").trim(),
    businessOwnerUid: String(source.businessOwnerUid || userProfile?.businessOwnerUid || "").trim(),
    staffActive: source.staffActive === false ? false : (userProfile?.staffActive === false ? false : true),
    staffStatus: String(source.staffStatus || userProfile?.staffStatus || "").trim(),
    socialAccessMode: String(source.socialAccessMode || userProfile?.socialAccessMode || "").trim(),
    ts: now()
  };
}

export function persistAuthBootstrapSnapshot({
  safeStorage,
  authSnapshotKey,
  payload
} = {}) {
  if (!payload) return;
  safeStorage?.setItem?.(authSnapshotKey, JSON.stringify(payload));
}

export function clearAuthBootstrapSnapshotStorage({
  safeStorage,
  authSnapshotKey
} = {}) {
  safeStorage?.removeItem?.(authSnapshotKey);
}

export function applyAuthBootstrapSnapshotToProfile({
  snapshot = null,
  defaultProfile = {},
  currentProfile = {},
  sanitizeDisplayName,
  getOptimizedImageUrl
} = {}) {
  if (!snapshot?.uid) {
    return { applied: false, nextProfile: currentProfile, resolvedAvatar: "" };
  }

  const nextProfile = { ...defaultProfile, ...currentProfile };
  const hasOwn = (key) => Object.prototype.hasOwnProperty.call(snapshot || {}, key);
  nextProfile.uid = snapshot.uid;
  if (snapshot.name) nextProfile.name = sanitizeDisplayName(snapshot.name, nextProfile.name || "User");
  if (snapshot.handle) nextProfile.handle = String(snapshot.handle || "").replace(/^@/, "").trim();
  if (snapshot.avatar) nextProfile.avatar = String(snapshot.avatar || "").trim();
  if (hasOwn("role")) nextProfile.role = String(snapshot.role || "").trim();
  if (Array.isArray(snapshot.roles)) {
    nextProfile.roles = snapshot.roles.slice();
  } else if (hasOwn("roles")) {
    nextProfile.roles = [];
  }
  if (hasOwn("sourceUserRole")) nextProfile.sourceUserRole = String(snapshot.sourceUserRole || "").trim();
  if (hasOwn("restaurantId")) nextProfile.restaurantId = String(snapshot.restaurantId || "").trim();
  if (hasOwn("staffRestaurantId")) nextProfile.staffRestaurantId = String(snapshot.staffRestaurantId || "").trim();
  if (hasOwn("waiterRestaurantId")) nextProfile.waiterRestaurantId = String(snapshot.waiterRestaurantId || "").trim();
  if (hasOwn("businessAccess")) nextProfile.businessAccess = snapshot.businessAccess === true;
  if (hasOwn("waiterAccess")) nextProfile.waiterAccess = snapshot.waiterAccess === true;
  nextProfile.permissions = {
    businessAccess: nextProfile.businessAccess === true,
    waiterAccess: nextProfile.waiterAccess === true
  };
  if (hasOwn("staffRole")) nextProfile.staffRole = String(snapshot.staffRole || "").trim();
  if (hasOwn("businessOwnerUid")) nextProfile.businessOwnerUid = String(snapshot.businessOwnerUid || "").trim();
  if (hasOwn("staffActive")) nextProfile.staffActive = snapshot.staffActive !== false;
  if (hasOwn("staffStatus")) nextProfile.staffStatus = String(snapshot.staffStatus || "").trim();
  if (hasOwn("socialAccessMode")) nextProfile.socialAccessMode = String(snapshot.socialAccessMode || "").trim();
  const resolvedAvatar = getOptimizedImageUrl(nextProfile.avatar || "", "avatar");
  return { applied: true, nextProfile, resolvedAvatar };
}
