export function shouldIgnoreChatMessagesSnapshotCore({
  chatModalOpen = false,
  activeModalThreadId = "",
  listenerThreadId = ""
} = {}) {
  if (!chatModalOpen) return true;
  return String(activeModalThreadId || "").trim() !== String(listenerThreadId || "").trim();
}

export function resolveChatMessagesAfterSnapshotCore({
  profile = null,
  remoteMessages = [],
  hasUnreadIncomingRemoteMessages,
  markChatThreadAsRead,
  syncRemoteChatReadState,
  saveChatThreadMessages,
  syncChatThreadSummary
} = {}) {
  const hasUnreadFn = typeof hasUnreadIncomingRemoteMessages === "function"
    ? hasUnreadIncomingRemoteMessages
    : (() => false);
  const markRead = typeof markChatThreadAsRead === "function"
    ? markChatThreadAsRead
    : ((_, messages) => messages);
  const syncRemoteRead = typeof syncRemoteChatReadState === "function"
    ? syncRemoteChatReadState
    : (() => {});
  const saveMessages = typeof saveChatThreadMessages === "function"
    ? saveChatThreadMessages
    : (() => {});
  const syncSummary = typeof syncChatThreadSummary === "function"
    ? syncChatThreadSummary
    : (() => {});
  const list = Array.isArray(remoteMessages) ? remoteMessages : [];
  const hasUnreadIncoming = hasUnreadFn(list);
  if (hasUnreadIncoming) {
    const nextMessages = markRead(profile, list);
    syncRemoteRead(profile, list);
    return nextMessages;
  }
  saveMessages(profile, list);
  syncSummary(profile, list);
  return list;
}
