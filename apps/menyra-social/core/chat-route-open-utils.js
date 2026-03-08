export function normalizePendingChatUidCore(value = "") {
  return String(value || "").trim();
}

export function isSelfPendingChatTargetCore({
  chatUid = "",
  currentUid = ""
} = {}) {
  const safeChatUid = String(chatUid || "").trim();
  const safeCurrentUid = String(currentUid || "").trim();
  if (!safeChatUid || !safeCurrentUid) return false;
  return safeChatUid === safeCurrentUid;
}

export function isChatThreadAlreadyOpenCore({
  chatModalOpen = false,
  currentThreadId = "",
  targetUid = ""
} = {}) {
  if (!chatModalOpen) return false;
  return String(currentThreadId || "").trim() === String(targetUid || "").trim();
}

export function buildChatRouteTargetProfileCore({
  thread = null,
  targetUid = ""
} = {}) {
  const safeTargetUid = String(targetUid || "").trim();
  return {
    uid: String(thread?.uid || safeTargetUid).trim() || safeTargetUid,
    restaurantId: String(thread?.restaurantId || "").trim(),
    handle: String(thread?.handle || safeTargetUid).replace(/^@/, "").trim() || safeTargetUid,
    name: String(thread?.name || thread?.handle || "User").trim() || "User",
    avatar: String(thread?.avatar || "").trim()
  };
}
