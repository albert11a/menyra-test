export function getChatThreadIdCore(profile = null) {
  return String(
    profile?.uid
      || profile?.restaurantId
      || profile?.handle
      || profile?.id
      || ""
  ).replace(/^@/, "").trim();
}

export function chatThreadStorageKeyCore({
  profile = null,
  ownerUid = "",
  chatThreadsStorageKey = ""
} = {}) {
  const threadId = getChatThreadIdCore(profile);
  const safeOwnerUid = String(ownerUid || "").trim();
  if (!threadId || !safeOwnerUid || !chatThreadsStorageKey) return "";
  return `${chatThreadsStorageKey}::${safeOwnerUid}::${threadId}`;
}

export function chatThreadDocRefCore({
  docFn,
  ownerUid,
  threadId
} = {}) {
  const safeOwnerUid = String(ownerUid || "").trim();
  const safeThreadId = String(threadId || "").replace(/^@/, "").trim();
  if (!safeOwnerUid || !safeThreadId || typeof docFn !== "function") return null;
  return docFn("users", safeOwnerUid, "chatThreads", safeThreadId);
}

export function chatMessageDocRefCore({
  docFn,
  ownerUid,
  threadId,
  messageId
} = {}) {
  const safeOwnerUid = String(ownerUid || "").trim();
  const safeThreadId = String(threadId || "").replace(/^@/, "").trim();
  const safeMessageId = String(messageId || "").trim();
  if (!safeOwnerUid || !safeThreadId || !safeMessageId || typeof docFn !== "function") return null;
  return docFn("users", safeOwnerUid, "chatThreads", safeThreadId, "messages", safeMessageId);
}

export function chatMessagesCollectionRefCore({
  collectionFn,
  ownerUid,
  threadId
} = {}) {
  const safeOwnerUid = String(ownerUid || "").trim();
  const safeThreadId = String(threadId || "").replace(/^@/, "").trim();
  if (!safeOwnerUid || !safeThreadId || typeof collectionFn !== "function") return null;
  return collectionFn("users", safeOwnerUid, "chatThreads", safeThreadId, "messages");
}

export function getChatMessageTimestampCore({
  message = null,
  toDateSafe
} = {}) {
  if (typeof toDateSafe !== "function") return 0;
  return toDateSafe(message?.createdAt)?.getTime() || 0;
}

export function pruneChatMessagesCore({
  messages = [],
  ttlMs = 0,
  nowMs = Date.now(),
  getChatMessageTimestamp
} = {}) {
  const readTs = typeof getChatMessageTimestamp === "function"
    ? getChatMessageTimestamp
    : (() => 0);
  return (Array.isArray(messages) ? messages : []).filter((message) => {
    if (!message) return false;
    if (message.saved) return true;
    const createdAt = readTs(message);
    if (!createdAt) return false;
    return (nowMs - createdAt) <= ttlMs;
  });
}

export function buildChatPreviewTextCore(message) {
  if (!message) return "";
  const text = String(message.text || "").trim();
  if (text) return text;
  const count = Array.isArray(message.attachments) ? message.attachments.length : 0;
  if (!count) return "Chat";
  return count === 1 ? "1 Anhang" : `${count} Anhaenge`;
}
