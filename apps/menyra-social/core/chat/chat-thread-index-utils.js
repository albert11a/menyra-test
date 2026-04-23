export function saveChatThreadIndexCore({
  threads = [],
  key = "",
  safeStorage,
  maxItems = 100
} = {}) {
  if (!key || !safeStorage?.setItem) return;
  try {
    const limit = Math.max(1, Number(maxItems) || 100);
    const payload = (Array.isArray(threads) ? threads : []).slice(0, limit);
    safeStorage.setItem(key, JSON.stringify(payload));
  } catch {}
}

export function readChatThreadIndexListCore({
  key = "",
  safeStorage
} = {}) {
  if (!key || !safeStorage?.getItem) return [];
  try {
    const raw = safeStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function sortChatThreadsCore(threads) {
  return (Array.isArray(threads) ? threads.slice() : [])
    .sort((a, b) => (Number(b?.updatedAt || 0) - Number(a?.updatedAt || 0)));
}

export function buildChatThreadSummaryFromMessagesCore({
  threadId,
  value,
  fallback = {},
  pruneChatMessages,
  buildChatPreviewText,
  getChatMessageTimestamp,
  nowMs = Date.now()
} = {}) {
  const safeThreadId = String(threadId || "").replace(/^@/, "").trim();
  if (!safeThreadId) return null;
  const meta = value && typeof value === "object" && !Array.isArray(value) ? value : {};
  const rawMessages = Array.isArray(value)
    ? value
    : (Array.isArray(meta.messages) ? meta.messages : []);
  const pruneFn = typeof pruneChatMessages === "function" ? pruneChatMessages : ((list) => (Array.isArray(list) ? list : []));
  const previewFn = typeof buildChatPreviewText === "function" ? buildChatPreviewText : (() => "");
  const tsFn = typeof getChatMessageTimestamp === "function" ? getChatMessageTimestamp : (() => 0);
  const messages = pruneFn(rawMessages);
  const lastMessage = messages[messages.length - 1] || null;
  const unreadCount = messages.filter((message) => message?.from !== "self" && !message?.read).length;
  return {
    id: safeThreadId,
    uid: String(meta.uid || fallback.uid || safeThreadId).trim(),
    restaurantId: String(meta.restaurantId || fallback.restaurantId || "").trim(),
    handle: String(meta.handle || fallback.handle || safeThreadId).replace(/^@/, "").trim(),
    name: String(meta.name || fallback.name || safeThreadId).trim() || safeThreadId,
    avatar: String(meta.avatar || fallback.avatar || "").trim(),
    lastMessage: previewFn(lastMessage),
    updatedAt: lastMessage ? tsFn(lastMessage) : Number(meta.updatedAt || fallback.updatedAt || nowMs),
    unreadCount
  };
}

export function rebuildLegacyChatThreadIndexFromStorageCore({
  localStorageObj,
  chatThreadsStorageKey = "",
  buildChatThreadSummaryFromMessages,
  sortChatThreads
} = {}) {
  const threads = [];
  if (!localStorageObj || !chatThreadsStorageKey) return threads;
  const buildSummary = typeof buildChatThreadSummaryFromMessages === "function"
    ? buildChatThreadSummaryFromMessages
    : (() => null);
  const sortFn = typeof sortChatThreads === "function" ? sortChatThreads : sortChatThreadsCore;
  const legacyPrefix = `${chatThreadsStorageKey}::`;
  try {
    const rawMap = localStorageObj.getItem(chatThreadsStorageKey);
    if (rawMap) {
      try {
        const parsedMap = JSON.parse(rawMap);
        if (parsedMap && typeof parsedMap === "object" && !Array.isArray(parsedMap)) {
          Object.entries(parsedMap).forEach(([threadId, value]) => {
            const summary = buildSummary(threadId, value);
            if (summary) threads.push(summary);
          });
        }
      } catch {}
    }
    for (let i = 0; i < localStorageObj.length; i += 1) {
      const key = localStorageObj.key(i);
      if (!key || !key.startsWith(legacyPrefix)) continue;
      const suffix = key.slice(legacyPrefix.length).trim();
      if (!suffix || suffix.includes("::")) continue;
      const summary = buildSummary(suffix, (() => {
        try {
          const raw = localStorageObj.getItem(key);
          return raw ? JSON.parse(raw) : [];
        } catch {
          return [];
        }
      })());
      if (summary) threads.push(summary);
    }
  } catch {}
  return sortFn(threads);
}

export function mergeChatThreadListsCore(...lists) {
  const byId = new Map();
  lists.flat().forEach((thread) => {
    if (!thread || typeof thread !== "object") return;
    const rawId = String(thread.id || thread.uid || thread.restaurantId || thread.handle || "").replace(/^@/, "").trim();
    if (!rawId) return;
    const existing = byId.get(rawId) || {};
    byId.set(rawId, {
      ...existing,
      ...thread,
      id: rawId,
      uid: String(thread.uid || existing.uid || rawId).trim(),
      restaurantId: String(thread.restaurantId || existing.restaurantId || "").trim(),
      handle: String(thread.handle || existing.handle || rawId).replace(/^@/, "").trim(),
      name: String(thread.name || existing.name || rawId).trim() || rawId,
      avatar: String(thread.avatar || existing.avatar || "").trim(),
      lastMessage: String(thread.lastMessage || existing.lastMessage || "").trim(),
      unreadCount: Math.max(0, Number(thread.unreadCount ?? existing.unreadCount ?? 0) || 0),
      blockedByOwner: !!(thread.blockedByOwner ?? existing.blockedByOwner ?? false),
      archivedByOwner: !!(thread.archivedByOwner ?? existing.archivedByOwner ?? false),
      muteUntilMs: Math.max(0, Number(thread.muteUntilMs ?? existing.muteUntilMs ?? 0) || 0),
      updatedAt: Number(thread.updatedAt || existing.updatedAt || 0) || 0
    });
  });
  return sortChatThreadsCore(Array.from(byId.values()));
}

export function rebuildChatThreadIndexFromStorageCore({
  uid = "",
  localStorageObj,
  chatThreadsStorageKey = "",
  pruneChatMessages,
  buildChatPreviewText,
  getChatMessageTimestamp,
  sortChatThreads,
  nowMs = Date.now()
} = {}) {
  const safeUid = String(uid || "").trim();
  if (!safeUid || !localStorageObj || !chatThreadsStorageKey) return [];
  const prefix = `${chatThreadsStorageKey}::${safeUid}::`;
  const pruneFn = typeof pruneChatMessages === "function" ? pruneChatMessages : ((list) => (Array.isArray(list) ? list : []));
  const previewFn = typeof buildChatPreviewText === "function" ? buildChatPreviewText : (() => "");
  const tsFn = typeof getChatMessageTimestamp === "function" ? getChatMessageTimestamp : (() => 0);
  const sortFn = typeof sortChatThreads === "function" ? sortChatThreads : sortChatThreadsCore;
  const threads = [];
  try {
    for (let i = 0; i < localStorageObj.length; i += 1) {
      const key = localStorageObj.key(i);
      if (!key || !key.startsWith(prefix)) continue;
      const threadId = key.slice(prefix.length).trim();
      if (!threadId) continue;
      let messages = [];
      try {
        const raw = localStorageObj.getItem(key);
        const parsed = raw ? JSON.parse(raw) : [];
        messages = pruneFn(Array.isArray(parsed) ? parsed : []);
      } catch {
        messages = [];
      }
      const lastMessage = messages[messages.length - 1] || null;
      const unreadCount = messages.filter((message) => message?.from !== "self" && !message?.read).length;
      threads.push({
        id: threadId,
        uid: threadId,
        restaurantId: "",
        handle: threadId,
        name: threadId,
        avatar: "",
        lastMessage: previewFn(lastMessage),
        updatedAt: lastMessage ? tsFn(lastMessage) : nowMs,
        unreadCount
      });
    }
  } catch {}
  return sortFn(threads);
}

export function loadChatThreadIndexCore({
  uid = "",
  chatIndexKey,
  legacyChatIndexKey = "",
  readChatThreadIndexList,
  rebuildChatThreadIndexFromStorage,
  rebuildLegacyChatThreadIndexFromStorage,
  mergeChatThreadLists
} = {}) {
  const scopedKey = typeof chatIndexKey === "function" ? chatIndexKey(uid) : "";
  const readIndex = typeof readChatThreadIndexList === "function" ? readChatThreadIndexList : (() => []);
  const rebuildScoped = typeof rebuildChatThreadIndexFromStorage === "function"
    ? rebuildChatThreadIndexFromStorage
    : (() => []);
  const rebuildLegacy = typeof rebuildLegacyChatThreadIndexFromStorage === "function"
    ? rebuildLegacyChatThreadIndexFromStorage
    : (() => []);
  const merge = typeof mergeChatThreadLists === "function" ? mergeChatThreadLists : mergeChatThreadListsCore;

  const scopedIndex = readIndex(scopedKey);
  const legacyIndex = readIndex(legacyChatIndexKey);
  const scopedThreads = rebuildScoped(uid);
  const legacyThreads = rebuildLegacy();
  return merge(scopedThreads, legacyThreads, legacyIndex, scopedIndex);
}
