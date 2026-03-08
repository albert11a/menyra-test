export function highlightCommentInModalCore({
  documentObj,
  commentId = "",
  commentsRootId = "postModalComments",
  timeoutMs = 2000,
  setTimeoutFn
} = {}) {
  const docObj = documentObj || null;
  if (!docObj) return false;
  const commentsRoot = docObj.getElementById(commentsRootId);
  if (!commentsRoot) return false;
  const safeId = String(commentId || "");
  if (!safeId) return false;
  const target = commentsRoot.querySelector(`[data-comment-id="${safeId}"]`);
  if (!target) return false;
  target.classList.add("ring-2", "ring-indigo-300", "bg-indigo-50/70");
  target.scrollIntoView({ behavior: "smooth", block: "center" });
  const delay = Math.max(0, Number(timeoutMs || 0) || 2000);
  const schedule = typeof setTimeoutFn === "function" ? setTimeoutFn : setTimeout;
  schedule(() => {
    target.classList.remove("ring-2", "ring-indigo-300", "bg-indigo-50/70");
  }, delay);
  return true;
}
