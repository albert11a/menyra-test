export function normalizeRemoteChatReadSyncInputsCore({
  ownerUid = "",
  threadId = "",
  unreadMessageIds = []
} = {}) {
  const safeOwnerUid = String(ownerUid || "").trim();
  const safeThreadId = String(threadId || "").replace(/^@/, "").trim();
  const safeUnreadMessageIds = Array.from(new Set(
    (Array.isArray(unreadMessageIds) ? unreadMessageIds : [])
      .map((id) => String(id || "").trim())
      .filter(Boolean)
  ));
  return {
    ownerUid: safeOwnerUid,
    threadId: safeThreadId,
    unreadMessageIds: safeUnreadMessageIds,
    canSync: !!safeOwnerUid && !!safeThreadId
  };
}

export function buildRemoteChatReadSyncWriteTasksCore({
  ownerUid = "",
  threadId = "",
  unreadMessageIds = [],
  chatThreadDocRef,
  chatMessageDocRef,
  setDocFn,
  threadUnreadResetPatch = { unreadCount: 0 },
  messageReadPatch = { read: true }
} = {}) {
  const threadRefFactory = typeof chatThreadDocRef === "function" ? chatThreadDocRef : (() => null);
  const messageRefFactory = typeof chatMessageDocRef === "function" ? chatMessageDocRef : (() => null);
  const writeDoc = typeof setDocFn === "function" ? setDocFn : (() => Promise.resolve());
  const threadRef = threadRefFactory(ownerUid, threadId);
  if (!threadRef) return [];
  const tasks = [];
  (Array.isArray(unreadMessageIds) ? unreadMessageIds : []).forEach((messageId) => {
    const messageRef = messageRefFactory(ownerUid, threadId, messageId);
    if (!messageRef) return;
    tasks.push(() => writeDoc(messageRef, messageReadPatch, { merge: true }));
  });
  tasks.push(() => writeDoc(threadRef, threadUnreadResetPatch, { merge: true }));
  return tasks;
}
