export function collectUnreadIncomingChatMessageIdsCore({
  messages = [],
  pruneChatMessages
} = {}) {
  const prune = typeof pruneChatMessages === "function"
    ? pruneChatMessages
    : ((items) => (Array.isArray(items) ? items : []));
  return prune(messages)
    .filter((message) => message?.from !== "self" && !message?.read)
    .map((message) => String(message?.id || "").trim())
    .filter(Boolean);
}

export function buildChatUnreadResetPatchCore() {
  return { unreadCount: 0 };
}

export function buildChatMessageReadPatchCore() {
  return { read: true };
}
