export function updatePostModalCountsOnlyCore({
  state,
  documentObj,
  windowObj,
  ensurePostMetaFn,
  currentUserBadgeFn,
  formatCountFn,
  iconFn
} = {}) {
  if (!state?.postModal?.open || !state?.postModal?.post) return;
  const doc = documentObj || null;
  const win = windowObj || null;
  if (!doc) return;

  const ensurePostMeta = typeof ensurePostMetaFn === "function"
    ? ensurePostMetaFn
    : (() => ({}));
  const currentUserBadge = typeof currentUserBadgeFn === "function"
    ? currentUserBadgeFn
    : (() => ({ uid: "", handle: "" }));
  const formatCount = typeof formatCountFn === "function"
    ? formatCountFn
    : ((value) => String(value ?? "0"));
  const icon = typeof iconFn === "function" ? iconFn : (() => "");

  const post = state.postModal.post;
  const meta = ensurePostMeta(post.id);
  const likeCount = Number(post.likes) || 0;
  const commentCount = Number(post.comments) || 0;
  const userBadge = currentUserBadge();
  const isLiked = meta.likes?.some((item) => item.uid === userBadge.uid || item.handle === userBadge.handle);

  const postLikeBtn = doc.getElementById("postLikeBtn");
  if (postLikeBtn) {
    postLikeBtn.classList.toggle("text-rose-500", !!isLiked);
    postLikeBtn.classList.toggle("text-slate-700", !isLiked);
    postLikeBtn.innerHTML = `${icon("heart", "w-5 h-5")} ${isLiked ? "Gefaellt" : "Like"}`;
  }
  const postLikesBtn = doc.getElementById("postLikesBtn");
  if (postLikesBtn) postLikesBtn.textContent = `${formatCount(likeCount)} Likes`;
  const postCommentsCount = doc.getElementById("postCommentsCount");
  if (postCommentsCount) postCommentsCount.textContent = `${formatCount(commentCount)} Kommentare`;
  if (win?.lucide?.createIcons) win.lucide.createIcons();
}

export function updatePostModalCommentsOnlyCore({
  state,
  documentObj,
  windowObj,
  ensurePostMetaFn,
  ensureCommentShapeFn,
  renderPostCommentsFn,
  applyCommentAvatarCacheFn,
  hydrateCommentAvatarsFn,
  getPendingCommentHighlightFn,
  setPendingCommentHighlightFn,
  highlightCommentInModalFn
} = {}) {
  if (!state?.postModal?.open || !state?.postModal?.post) return;
  const doc = documentObj || null;
  const win = windowObj || null;
  if (!doc) return;

  const ensurePostMeta = typeof ensurePostMetaFn === "function"
    ? ensurePostMetaFn
    : (() => ({}));
  const ensureCommentShape = typeof ensureCommentShapeFn === "function"
    ? ensureCommentShapeFn
    : ((value) => value || {});
  const renderPostComments = typeof renderPostCommentsFn === "function"
    ? renderPostCommentsFn
    : (() => "");
  const applyCommentAvatarCache = typeof applyCommentAvatarCacheFn === "function"
    ? applyCommentAvatarCacheFn
    : (() => {});
  const hydrateCommentAvatars = typeof hydrateCommentAvatarsFn === "function"
    ? hydrateCommentAvatarsFn
    : (() => {});
  const getPendingCommentHighlight = typeof getPendingCommentHighlightFn === "function"
    ? getPendingCommentHighlightFn
    : (() => "");
  const setPendingCommentHighlight = typeof setPendingCommentHighlightFn === "function"
    ? setPendingCommentHighlightFn
    : (() => {});
  const highlightCommentInModal = typeof highlightCommentInModalFn === "function"
    ? highlightCommentInModalFn
    : (() => false);

  const post = state.postModal.post;
  const meta = ensurePostMeta(post.id);
  const comments = (meta.comments || []).map(ensureCommentShape);
  const postComments = doc.getElementById("postModalComments");
  if (postComments) {
    postComments.innerHTML = renderPostComments(comments);
    applyCommentAvatarCache(postComments);
    hydrateCommentAvatars(postComments, { postId: post.id });
  }
  if (win?.lucide?.createIcons) win.lucide.createIcons();
  const pendingCommentHighlight = getPendingCommentHighlight();
  if (pendingCommentHighlight && highlightCommentInModal(pendingCommentHighlight)) {
    setPendingCommentHighlight("");
  }
}
