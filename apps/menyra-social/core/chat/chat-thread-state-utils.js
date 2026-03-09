export function normalizeChatThreadSummaryCore({
  threadId,
  data = {},
  fallback = {},
  toDateSafe,
  nowMs = Date.now()
} = {}) {
  const safeThreadId = String(threadId || "").replace(/^@/, "").trim();
  if (!safeThreadId) return null;
  const source = data && typeof data === "object" ? data : {};
  const fallbackSource = fallback && typeof fallback === "object" ? fallback : {};
  const readDate = typeof toDateSafe === "function" ? toDateSafe : (() => null);
  const muteUntil = readDate(source.muteUntil || source.muteUntilAt || source.mutedUntil || source.muteUntilMs)
    || readDate(fallbackSource.muteUntil || fallbackSource.muteUntilAt || fallbackSource.mutedUntil || fallbackSource.muteUntilMs);
  const muteUntilMs = muteUntil?.getTime() || Number(source.muteUntilMs ?? fallbackSource.muteUntilMs ?? 0) || 0;
  const updatedAt = readDate(source.updatedAt || source.updatedAtClient)?.getTime()
    || Number(source.updatedAtMs || fallbackSource.updatedAt || 0)
    || nowMs;
  return {
    id: safeThreadId,
    uid: String(source.uid || fallbackSource.uid || safeThreadId).trim(),
    restaurantId: String(source.restaurantId || fallbackSource.restaurantId || "").trim(),
    handle: String(source.handle || fallbackSource.handle || safeThreadId).replace(/^@/, "").trim(),
    name: String(source.name || fallbackSource.name || safeThreadId).trim() || safeThreadId,
    avatar: String(source.avatar || fallbackSource.avatar || "").trim(),
    lastMessage: String(source.lastMessage || fallbackSource.lastMessage || "").trim(),
    unreadCount: Math.max(0, Number(source.unreadCount ?? fallbackSource.unreadCount ?? 0) || 0),
    blockedByOwner: !!(source.blockedByOwner ?? fallbackSource.blockedByOwner ?? false),
    archivedByOwner: !!(source.archivedByOwner ?? fallbackSource.archivedByOwner ?? false),
    muteUntilMs: Math.max(0, Number(muteUntilMs || 0) || 0),
    updatedAt
  };
}

export function getChatUnreadCountCore({
  threads = [],
  nowMs = Date.now()
} = {}) {
  return (Array.isArray(threads) ? threads : []).reduce((sum, thread) => {
    if (thread?.archivedByOwner) return sum;
    const muted = Number(thread?.muteUntilMs || 0) > nowMs;
    if (muted) return sum;
    const count = Number(thread?.unreadCount || 0);
    return sum + (Number.isFinite(count) ? count : 0);
  }, 0);
}

export function upsertChatThreadListCore({
  profile,
  patch = {},
  threads = [],
  getChatThreadId,
  normalizeHandle,
  sortChatThreads,
  nowMs = Date.now()
} = {}) {
  if (!profile || typeof getChatThreadId !== "function") return null;
  const threadId = getChatThreadId(profile);
  if (!threadId) return null;
  const existing = Array.isArray(threads) ? threads : [];
  const existingThread = existing.find((item) => String(item?.id || "") === threadId) || null;
  const toHandle = typeof normalizeHandle === "function" ? normalizeHandle : ((value) => value);
  const sortThreads = typeof sortChatThreads === "function"
    ? sortChatThreads
    : ((items) => (Array.isArray(items) ? items : []));
  const nextThread = {
    ...(existingThread || {}),
    id: threadId,
    uid: profile.uid || "",
    restaurantId: profile.restaurantId || "",
    handle: String(profile.handle || toHandle(profile.name || "user")).replace(/^@/, ""),
    name: profile.name || "User",
    avatar: profile.avatar || "",
    lastMessage: "",
    unreadCount: Number(existingThread?.unreadCount || 0),
    updatedAt: nowMs,
    ...patch
  };
  const rest = existing.filter((item) => String(item?.id || "") !== threadId);
  return sortThreads([nextThread, ...rest]);
}

export function isChatThreadArchivedCore(thread) {
  return !!thread?.archivedByOwner;
}

export function getChatThreadByIdCore({
  threadId,
  threads = []
} = {}) {
  const safeId = String(threadId || "").replace(/^@/, "").trim();
  if (!safeId) return null;
  return (Array.isArray(threads) ? threads : []).find((thread) => String(thread?.id || "") === safeId) || null;
}

export function getActiveChatThreadSummaryCore({
  profile,
  threads = [],
  getChatThreadId
} = {}) {
  const readThreadId = typeof getChatThreadId === "function" ? getChatThreadId : (() => "");
  const threadId = readThreadId(profile);
  if (!threadId) return null;
  return (Array.isArray(threads) ? threads : []).find((thread) => String(thread?.id || "") === threadId) || null;
}
