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
  pendingProfileRestaurantId = "",
  pendingNotificationId = "",
  pendingPostId = "",
  pendingChatUid = ""
} = {}) {
  const hasPendingProfileRoute = !!String(pendingProfileRestaurantId || "").trim();
  const hasPendingNotificationQuery = !!String(pendingNotificationId || "").trim();
  const hasPendingPostQuery = !!String(pendingPostId || "").trim();
  const hasPendingChatQuery = !!String(pendingChatUid || "").trim();
  return {
    hasPendingProfileRoute,
    hasPendingNotificationQuery,
    hasPendingPostQuery,
    hasPendingChatQuery,
    hasAny: hasPendingProfileRoute || hasPendingNotificationQuery || hasPendingPostQuery || hasPendingChatQuery
  };
}
