export function shouldResetUserScopedStateCore({
  prevUid = "",
  nextUid = ""
} = {}) {
  const previous = String(prevUid || "").trim();
  const next = String(nextUid || "").trim();
  if (!previous) return false;
  return !next || previous !== next;
}

export function resolvePendingAuthRouteFlagsCore({
  pendingNotificationId = "",
  pendingPostId = "",
  pendingChatUid = ""
} = {}) {
  const hasPendingNotificationQuery = !!String(pendingNotificationId || "").trim();
  const hasPendingPostQuery = !!String(pendingPostId || "").trim();
  const hasPendingChatQuery = !!String(pendingChatUid || "").trim();
  return {
    hasPendingNotificationQuery,
    hasPendingPostQuery,
    hasPendingChatQuery,
    hasAny: hasPendingNotificationQuery || hasPendingPostQuery || hasPendingChatQuery
  };
}
