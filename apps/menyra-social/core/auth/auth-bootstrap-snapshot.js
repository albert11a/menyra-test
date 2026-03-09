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
    return { uid, name, handle, avatar, ts: Number(parsed?.ts || 0) || now() };
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
  return { uid, name, handle, avatar, ts: now() };
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
  nextProfile.uid = snapshot.uid;
  if (snapshot.name) nextProfile.name = sanitizeDisplayName(snapshot.name, nextProfile.name || "User");
  if (snapshot.handle) nextProfile.handle = String(snapshot.handle || "").replace(/^@/, "").trim();
  if (snapshot.avatar) nextProfile.avatar = String(snapshot.avatar || "").trim();
  const resolvedAvatar = getOptimizedImageUrl(nextProfile.avatar || "", "avatar");
  return { applied: true, nextProfile, resolvedAvatar };
}
