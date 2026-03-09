export function buildChatThreadPatchFromMessagesCore({
  messages = [],
  existingUpdatedAt = 0,
  pruneChatMessages,
  buildChatPreviewText,
  getChatMessageTimestamp,
  nowMs = Date.now()
} = {}) {
  const prune = typeof pruneChatMessages === "function"
    ? pruneChatMessages
    : ((items) => (Array.isArray(items) ? items : []));
  const buildPreview = typeof buildChatPreviewText === "function"
    ? buildChatPreviewText
    : (() => "");
  const readTs = typeof getChatMessageTimestamp === "function"
    ? getChatMessageTimestamp
    : (() => 0);
  const list = prune(messages);
  const lastMessage = list[list.length - 1] || null;
  return {
    list,
    lastMessage: buildPreview(lastMessage),
    updatedAt: lastMessage
      ? Math.max(readTs(lastMessage), Number(existingUpdatedAt || 0))
      : Number(existingUpdatedAt || nowMs)
  };
}

export function markIncomingChatMessagesAsReadCore({
  messages = [],
  pruneChatMessages
} = {}) {
  const prune = typeof pruneChatMessages === "function"
    ? pruneChatMessages
    : ((items) => (Array.isArray(items) ? items : []));
  const currentMessages = prune(messages);
  let changed = false;
  const nextMessages = currentMessages.map((message) => {
    if (message?.from !== "self" && !message?.read) {
      changed = true;
      return { ...message, read: true };
    }
    return message;
  });
  return {
    changed,
    messages: nextMessages
  };
}

export function updateChatMessageListCore({
  currentMessages = [],
  updater,
  pruneChatMessages
} = {}) {
  const prune = typeof pruneChatMessages === "function"
    ? pruneChatMessages
    : ((items) => (Array.isArray(items) ? items : []));
  const current = prune(currentMessages);
  const nextRaw = typeof updater === "function" ? updater(current) : updater;
  return prune(nextRaw);
}
