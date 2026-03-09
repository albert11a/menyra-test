export function collectUnreadIncomingChatMessagesCore({
  messages = [],
  pruneChatMessages
} = {}) {
  const prune = typeof pruneChatMessages === "function"
    ? pruneChatMessages
    : ((items) => (Array.isArray(items) ? items : []));
  return prune(messages).filter((message) => message?.from !== "self" && !message?.read);
}

export function buildChatListenerLocalSeedCore({
  storedMessages = [],
  modalMessages = [],
  pruneChatMessages
} = {}) {
  const prune = typeof pruneChatMessages === "function"
    ? pruneChatMessages
    : ((items) => (Array.isArray(items) ? items : []));
  return prune([
    ...(Array.isArray(storedMessages) ? storedMessages : []),
    ...(Array.isArray(modalMessages) ? modalMessages : [])
  ]);
}

export function shouldUseChatLocalSeedCore({
  remoteDocsCount = 0,
  localSeed = []
} = {}) {
  return Number(remoteDocsCount || 0) === 0 && (Array.isArray(localSeed) ? localSeed.length : 0) > 0;
}

export function buildChatLocalMessageMapCore(localSeed = []) {
  return new Map(
    (Array.isArray(localSeed) ? localSeed : [])
      .map((message) => [String(message?.id || "").trim(), message])
  );
}

export function buildSortedRemoteChatMessagesCore({
  entries = [],
  localMap = new Map(),
  normalizeChatMessageRecord,
  getChatMessageTimestamp
} = {}) {
  const normalizeRecord = typeof normalizeChatMessageRecord === "function"
    ? normalizeChatMessageRecord
    : (() => null);
  const readTs = typeof getChatMessageTimestamp === "function"
    ? getChatMessageTimestamp
    : (() => 0);
  return (Array.isArray(entries) ? entries : [])
    .map((entry) => normalizeRecord(entry?.id, entry?.data || {}, localMap))
    .filter(Boolean)
    .sort((a, b) => readTs(a) - readTs(b));
}

export function hasUnreadIncomingRemoteMessagesCore(messages = []) {
  return (Array.isArray(messages) ? messages : [])
    .some((message) => message?.from !== "self" && !message?.read);
}
