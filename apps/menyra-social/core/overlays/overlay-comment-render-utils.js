import { t } from "/shared/i18n/i18n.js";

export function renderCommentItemCore({
  postId,
  comment,
  parentId = "",
  state,
  normalizeHandle,
  resolveCommentAvatar,
  getSelfAvatarUrl,
  isPlaceholderUrl,
  scheduleCommentAvatarFetch,
  placeholderImage = "",
  escapeHtml,
  formatDateTimeLabel,
  icon
} = {}) {
  const item = comment || {};
  const esc = typeof escapeHtml === "function"
    ? escapeHtml
    : ((value) => String(value ?? ""));
  const normalize = typeof normalizeHandle === "function"
    ? normalizeHandle
    : ((value) => String(value ?? "").trim().toLowerCase());
  const resolveAvatar = typeof resolveCommentAvatar === "function"
    ? resolveCommentAvatar
    : (() => "");
  const isPlaceholder = typeof isPlaceholderUrl === "function"
    ? isPlaceholderUrl
    : (() => false);
  const scheduleAvatarFetch = typeof scheduleCommentAvatarFetch === "function"
    ? scheduleCommentAvatarFetch
    : (() => {});
  const getSelfAvatar = typeof getSelfAvatarUrl === "function"
    ? getSelfAvatarUrl
    : (() => "");
  const dateLabel = typeof formatDateTimeLabel === "function"
    ? formatDateTimeLabel
    : ((value) => String(value ?? ""));
  const iconFn = typeof icon === "function" ? icon : (() => "");
  const tr = (key, fallback = key, params = {}) => t(key, { fallback, params });

  const likeCount = Number.isFinite(Number(item.likesCount))
    ? Number(item.likesCount)
    : (Array.isArray(item.likes) ? item.likes.length : 0);
  const isReply = !!parentId;
  const handleKey = normalize(item.handle || item.author || "");
  let avatarUrl = resolveAvatar(item);
  const selfUid = state?.user?.uid || "";
  const selfHandle = normalize(state?.userProfile?.handle || state?.userProfile?.name || "");
  const isSelf = (!!selfUid && item.uid && String(item.uid) === String(selfUid))
    || (!!selfHandle && handleKey && handleKey === selfHandle);
  if (isSelf) {
    const selfAvatar = getSelfAvatar();
    if (selfAvatar) avatarUrl = selfAvatar;
  }
  if (isPlaceholder(avatarUrl)) scheduleAvatarFetch(item);
  const safeSrc = (!avatarUrl || isPlaceholder(avatarUrl)) ? placeholderImage : avatarUrl;

  return `
    <div class="flex gap-3 ${isReply ? "ml-10" : ""}" data-comment-id="${esc(item.id)}" data-comment-parent="${esc(parentId || "")}" data-comment-uid="${esc(item.uid || "")}" data-comment-handle="${esc(handleKey)}">
      <img src="${esc(safeSrc)}" data-img-key="comment-avatar:${esc(item.id)}" data-comment-id="${esc(item.id)}" data-comment-handle="${esc(handleKey)}" data-comment-uid="${esc(item.uid || "")}" data-uid="${esc(item.uid || "")}" data-handle="${esc(item.handle || "")}" class="comment-avatar w-9 h-9 rounded-2xl object-cover shadow" loading="lazy" decoding="async" referrerpolicy="no-referrer" onerror="this.src='${placeholderImage}'" alt="" />
      <div class="flex-1">
        <div class="flex items-center justify-between">
          <div class="text-xs font-black text-slate-900">${esc(item.author)}</div>
          <div class="text-[10px] font-bold text-slate-400">${esc(dateLabel(item.createdAt))}</div>
        </div>
        <div class="text-sm text-slate-600 leading-relaxed mt-1">${esc(item.text)}</div>
        <div class="flex items-center gap-3 mt-2 text-[10px] font-bold uppercase tracking-widest">
          <button data-comment-like="true" data-post-id="${esc(postId)}" data-comment-id="${esc(parentId || item.id)}" data-reply-id="${isReply ? esc(item.id) : ""}" class="flex items-center gap-1 text-slate-400 hover:text-rose-500">
            ${iconFn("heart", "w-3 h-3")} ${esc(likeCount)}
          </button>
          ${!isReply ? `<button data-comment-reply="true" data-post-id="${esc(postId)}" data-comment-id="${esc(item.id)}" class="text-slate-400 hover:text-slate-900">${esc(tr("comments.reply", "Antworten"))}</button>` : ""}
        </div>
      </div>
    </div>
  `;
}

export function renderPostCommentsCore({
  state,
  comments = [],
  hasLiveComments = false,
  renderCommentItemFn
} = {}) {
  const renderCommentItem = typeof renderCommentItemFn === "function"
    ? renderCommentItemFn
    : (() => "");
  const tr = (key, fallback = key, params = {}) => t(key, { fallback, params });
  if (state?.postModal?.loading) {
    return `<div class="text-center text-[10px] font-bold uppercase text-slate-400">${tr("comments.loading", "Kommentare laden...")}</div>`;
  }
  const sendingRow = state?.postModal?.sending && hasLiveComments
    ? `<div class="text-center text-[10px] font-bold uppercase text-slate-400">${tr("comments.sending", "Senden...")}</div>`
    : "";
  if (!comments.length) {
    return sendingRow || `<div class="text-center text-[10px] font-bold uppercase text-slate-400">${tr("comments.empty", "Noch keine Kommentare")}</div>`;
  }
  const postId = state?.postModal?.post?.id || "";
  return `${sendingRow}${comments.map((comment) => `
    <div class="space-y-3">
      ${renderCommentItem(postId, comment)}
      ${(comment.replies || []).map((reply) => renderCommentItem(postId, reply, comment.id)).join("")}
    </div>
  `).join("")}`;
}

export function renderMenuCommentItemCore({
  comment,
  normalizeHandle,
  resolveCommentAvatar,
  isPlaceholderUrl,
  scheduleCommentAvatarFetch,
  placeholderImage = "",
  escapeHtml,
  formatDateTimeLabel
} = {}) {
  const item = comment || {};
  const normalize = typeof normalizeHandle === "function"
    ? normalizeHandle
    : ((value) => String(value ?? "").trim().toLowerCase());
  const resolveAvatar = typeof resolveCommentAvatar === "function"
    ? resolveCommentAvatar
    : (() => "");
  const isPlaceholder = typeof isPlaceholderUrl === "function"
    ? isPlaceholderUrl
    : (() => false);
  const scheduleAvatarFetch = typeof scheduleCommentAvatarFetch === "function"
    ? scheduleCommentAvatarFetch
    : (() => {});
  const esc = typeof escapeHtml === "function"
    ? escapeHtml
    : ((value) => String(value ?? ""));
  const dateLabel = typeof formatDateTimeLabel === "function"
    ? formatDateTimeLabel
    : ((value) => String(value ?? ""));

  const avatarUrl = resolveAvatar(item);
  if (isPlaceholder(avatarUrl)) scheduleAvatarFetch(item);
  const safeSrc = (!avatarUrl || isPlaceholder(avatarUrl)) ? placeholderImage : avatarUrl;
  const handleKey = normalize(item.handle || item.author || "");

  return `
    <div class="flex gap-3" data-comment-id="${esc(item.id || "")}" data-comment-uid="${esc(item.uid || "")}" data-comment-handle="${esc(handleKey)}">
      <img src="${esc(safeSrc)}" data-img-key="comment-avatar:${esc(item.id || "")}" data-comment-id="${esc(item.id || "")}" data-comment-handle="${esc(handleKey)}" data-comment-uid="${esc(item.uid || "")}" data-uid="${esc(item.uid || "")}" data-handle="${esc(item.handle || "")}" class="comment-avatar w-9 h-9 rounded-2xl object-cover shadow" loading="lazy" decoding="async" referrerpolicy="no-referrer" onerror="this.src='${placeholderImage}'" alt="" />
      <div class="flex-1">
        <div class="flex items-center justify-between">
          <div class="text-xs font-black text-slate-900">${esc(item.author || "User")}</div>
          <div class="text-[10px] font-bold text-slate-400">${esc(dateLabel(item.createdAt))}</div>
        </div>
        <div class="text-sm text-slate-600 leading-relaxed mt-1">${esc(item.text || "")}</div>
      </div>
    </div>
  `;
}

export function renderMenuDetailCommentsCore({
  state,
  comments = [],
  renderMenuCommentItemFn
} = {}) {
  const renderMenuCommentItem = typeof renderMenuCommentItemFn === "function"
    ? renderMenuCommentItemFn
    : (() => "");
  const tr = (key, fallback = key, params = {}) => t(key, { fallback, params });
  if (state?.menuDetail?.loading) {
    return `<div class="text-center text-[10px] font-bold uppercase text-slate-400">${tr("comments.loading", "Kommentare laden...")}</div>`;
  }
  const sendingRow = state?.menuDetail?.sending
    ? `<div class="text-center text-[10px] font-bold uppercase text-slate-400">${tr("comments.sending", "Senden...")}</div>`
    : "";
  if (!comments.length) {
    return sendingRow || `<div class="text-center text-[10px] font-bold uppercase text-slate-400">${tr("comments.empty", "Noch keine Kommentare")}</div>`;
  }
  return `${sendingRow}${comments.map((comment) => renderMenuCommentItem(comment)).join("")}`;
}
