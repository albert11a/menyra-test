export function updateMenuDetailCountsOnlyCore({
  state,
  documentObj,
  windowObj,
  getMenuDetailContextFn,
  ensureMenuItemMetaFn,
  resolveMenuItemCountsFn,
  currentUserBadgeFn,
  formatCountFn,
  iconFn
} = {}) {
  if (!state?.menuDetail?.open || !state?.menuDetail?.item) return;
  const doc = documentObj || null;
  const win = windowObj || null;
  if (!doc) return;

  const getMenuDetailContext = typeof getMenuDetailContextFn === "function"
    ? getMenuDetailContextFn
    : (() => null);
  const ensureMenuItemMeta = typeof ensureMenuItemMetaFn === "function"
    ? ensureMenuItemMetaFn
    : (() => ({}));
  const resolveMenuItemCounts = typeof resolveMenuItemCountsFn === "function"
    ? resolveMenuItemCountsFn
    : (() => ({ likes: 0, comments: 0 }));
  const currentUserBadge = typeof currentUserBadgeFn === "function"
    ? currentUserBadgeFn
    : (() => ({ uid: "", handle: "" }));
  const formatCount = typeof formatCountFn === "function"
    ? formatCountFn
    : ((value) => String(value ?? "0"));
  const icon = typeof iconFn === "function" ? iconFn : (() => "");

  const ctx = getMenuDetailContext();
  if (!ctx) return;
  const meta = ensureMenuItemMeta(ctx.key);
  const counts = resolveMenuItemCounts(meta);
  const userBadge = currentUserBadge();
  const isLiked = meta.likes?.some((item) => item.uid === userBadge.uid || item.handle === userBadge.handle);

  const likeBtn = doc.getElementById("menuDetailLikeBtn");
  if (likeBtn) {
    likeBtn.classList.toggle("text-rose-500", !!isLiked);
    likeBtn.classList.toggle("text-slate-700", !isLiked);
    likeBtn.innerHTML = `${icon("heart", "w-3.5 h-3.5")} ${isLiked ? "Gefaellt" : "Like"}`;
  }
  const headerFavBtn = doc.getElementById("menuDetailHeaderFavoritesBtn");
  if (headerFavBtn) {
    headerFavBtn.classList.toggle("bg-slate-900", !!isLiked);
    headerFavBtn.classList.toggle("text-white", !!isLiked);
    headerFavBtn.classList.toggle("border-slate-900", !!isLiked);
    headerFavBtn.classList.toggle("bg-slate-100", !isLiked);
    headerFavBtn.classList.toggle("text-slate-700", !isLiked);
    headerFavBtn.classList.toggle("border-slate-200", !isLiked);
  }
  const likesCount = doc.getElementById("menuDetailLikesCount");
  if (likesCount) likesCount.textContent = `${formatCount(counts.likes)} Likes`;
  const commentsCount = doc.getElementById("menuDetailCommentsCount");
  if (commentsCount) commentsCount.textContent = `${formatCount(counts.comments)} Kommentare`;
  const footerCommentsToggle = doc.getElementById("menuDetailFooterCommentToggle");
  const footerCommentsBadge = doc.getElementById("menuDetailFooterCommentsBadge");
  if (footerCommentsToggle) {
    if (counts.comments > 0) {
      if (footerCommentsBadge) {
        footerCommentsBadge.textContent = String(counts.comments);
      } else {
        const badge = doc.createElement("span");
        badge.id = "menuDetailFooterCommentsBadge";
        badge.className = "absolute top-0 right-0 -mt-1 -mr-1 w-5 h-5 rounded-full bg-indigo-600 text-white text-[9px] font-black flex items-center justify-center border-2 border-white";
        badge.textContent = String(counts.comments);
        footerCommentsToggle.appendChild(badge);
      }
    } else if (footerCommentsBadge) {
      footerCommentsBadge.remove();
    }
  }
  if (win?.lucide?.createIcons) win.lucide.createIcons();
}

export function updateMenuDetailCommentsOnlyCore({
  state,
  documentObj,
  windowObj,
  getMenuDetailContextFn,
  ensureMenuItemMetaFn,
  ensureCommentShapeFn,
  renderMenuDetailCommentsFn,
  applyCommentAvatarCacheFn
} = {}) {
  if (!state?.menuDetail?.open || !state?.menuDetail?.item) return;
  const doc = documentObj || null;
  const win = windowObj || null;
  if (!doc) return;

  const getMenuDetailContext = typeof getMenuDetailContextFn === "function"
    ? getMenuDetailContextFn
    : (() => null);
  const ensureMenuItemMeta = typeof ensureMenuItemMetaFn === "function"
    ? ensureMenuItemMetaFn
    : (() => ({}));
  const ensureCommentShape = typeof ensureCommentShapeFn === "function"
    ? ensureCommentShapeFn
    : ((value) => value || {});
  const renderMenuDetailComments = typeof renderMenuDetailCommentsFn === "function"
    ? renderMenuDetailCommentsFn
    : (() => "");
  const applyCommentAvatarCache = typeof applyCommentAvatarCacheFn === "function"
    ? applyCommentAvatarCacheFn
    : (() => {});

  const ctx = getMenuDetailContext();
  if (!ctx) return;
  const meta = ensureMenuItemMeta(ctx.key);
  const comments = (meta.comments || []).map(ensureCommentShape);
  const commentsRoot = doc.getElementById("menuDetailComments");
  if (commentsRoot) {
    commentsRoot.innerHTML = renderMenuDetailComments(comments);
    applyCommentAvatarCache(commentsRoot);
  }
  if (win?.lucide?.createIcons) win.lucide.createIcons();
}
