export function mapChatThreadDocsToSummariesCore({
  docs = [],
  normalizeChatThreadSummary
} = {}) {
  const normalizeSummary = typeof normalizeChatThreadSummary === "function"
    ? normalizeChatThreadSummary
    : (() => null);
  return (Array.isArray(docs) ? docs : [])
    .map((docSnap) => normalizeSummary(docSnap?.id, docSnap?.data ? (docSnap.data() || {}) : {}))
    .filter(Boolean);
}

export function buildMergedChatThreadsFromRemoteCore({
  ownerUid = "",
  stateThreads = [],
  remoteThreads = [],
  loadChatThreadIndex,
  mergeChatThreadLists
} = {}) {
  const readIndex = typeof loadChatThreadIndex === "function" ? loadChatThreadIndex : (() => []);
  const mergeLists = typeof mergeChatThreadLists === "function"
    ? mergeChatThreadLists
    : ((...lists) => lists.flat());
  return mergeLists(
    readIndex(ownerUid),
    Array.isArray(stateThreads) ? stateThreads : [],
    Array.isArray(remoteThreads) ? remoteThreads : []
  );
}

export function shouldRenderChatThreadListAfterRemoteSyncCore({
  lastRenderMode = "",
  activeTab = "",
  chatModalOpen = false
} = {}) {
  return String(lastRenderMode || "") === "main"
    && String(activeTab || "") === "chat"
    && !chatModalOpen;
}
