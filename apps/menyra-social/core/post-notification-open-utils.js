export function normalizePendingPostIdCore(value = "") {
  return String(value || "").trim();
}

export function findPostInLocalSourcesCore({
  postId = "",
  findPostById,
  feedPosts = []
} = {}) {
  const safePostId = String(postId || "").trim();
  if (!safePostId) return null;
  const findById = typeof findPostById === "function" ? findPostById : (() => null);
  return findById(safePostId)
    || (Array.isArray(feedPosts) ? feedPosts.find((item) => String(item?.id || "") === safePostId) : null)
    || null;
}

export function resolveNotificationCommentHighlightIdCore({
  notificationType = "",
  commentId = ""
} = {}) {
  const safeType = String(notificationType || "").trim();
  const safeCommentId = String(commentId || "").trim();
  if (safeType !== "comment" || !safeCommentId) return "";
  return safeCommentId;
}
