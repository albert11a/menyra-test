export function renderChatModalCore({
  state,
  getOptimizedImageUrl,
  escapeHtml,
  icon,
  formatRelative,
  toDateSafe
} = {}) {
  if (!state?.chatModal?.open || !state?.chatModal?.profile) return "";
  const getImage = typeof getOptimizedImageUrl === "function"
    ? getOptimizedImageUrl
    : ((value) => value || "");
  const esc = typeof escapeHtml === "function"
    ? escapeHtml
    : ((value) => String(value ?? ""));
  const iconFn = typeof icon === "function" ? icon : (() => "");
  const formatRelativeLabel = typeof formatRelative === "function"
    ? formatRelative
    : ((value) => String(value ?? ""));
  const toDate = typeof toDateSafe === "function"
    ? toDateSafe
    : ((value) => value);
  const partner = state.chatModal.profile;
  const avatarUrl = getImage(partner.avatar, "avatar");
  const messages = Array.isArray(state.chatModal.messages) ? state.chatModal.messages : [];
  return `
    <div class="fixed inset-0 z-[65] modal-overlay" data-modal-surface="#ffffff" style="--modal-surface:#ffffff;">
      <div id="chatModalOverlay" class="absolute inset-0 bg-black/60"></div>
      <div class="modal-frame">
        <div class="bg-white rounded-t-[3rem] shadow-2xl border border-slate-100 modal-sheet-85 flex flex-col overflow-hidden modal-sheet">
          <div class="px-5 py-4 border-b border-slate-100 flex items-center gap-3">
            <button id="chatModalClose" class="w-11 h-11 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-500">${iconFn("arrow-left", "w-4 h-4")}</button>
            <img src="${esc(avatarUrl)}" class="w-12 h-12 rounded-2xl object-cover shadow-sm" />
            <div class="min-w-0 flex-1">
              <div class="text-sm font-black text-slate-900 truncate">${esc(partner.name || "User")}</div>
              <div class="text-[10px] font-bold uppercase tracking-widest text-slate-400 truncate">@${esc(String(partner.handle || "user").replace(/^@/, ""))}</div>
            </div>
          </div>
          <div id="chatMessages" class="flex-1 min-h-0 overflow-y-auto no-scrollbar modal-scroll px-5 py-4 space-y-3 bg-slate-50">
            ${messages.length ? messages.map((message) => `
              <div class="flex ${message.from === "self" ? "justify-end" : "justify-start"}">
                <div class="max-w-[82%] rounded-[1.6rem] px-4 py-3 ${message.from === "self" ? "bg-slate-900 text-white" : "bg-white text-slate-700 border border-slate-100"}">
                  <div class="text-sm font-medium leading-relaxed whitespace-pre-wrap">${esc(message.text || "")}</div>
                  <div class="text-[9px] font-bold uppercase tracking-widest mt-2 ${message.from === "self" ? "text-slate-300" : "text-slate-400"}">${esc(formatRelativeLabel(toDate(message.createdAt) || new Date()))}</div>
                </div>
              </div>
            `).join("") : `
              <div class="h-full flex items-center justify-center text-center py-16">
                <div>
                  <div class="w-14 h-14 rounded-[1.4rem] bg-white border border-slate-100 text-slate-400 mx-auto flex items-center justify-center mb-4">
                    ${iconFn("message-circle", "w-6 h-6")}
                  </div>
                  <p class="text-[10px] font-black uppercase tracking-widest text-slate-400">Noch keine Nachrichten</p>
                </div>
              </div>
            `}
          </div>
          <div class="p-4 border-t border-slate-100 bg-white modal-footer-safe">
            <div class="flex items-end gap-3">
              <textarea id="chatMessageInput" rows="1" placeholder="Nachricht..." class="flex-1 p-4 rounded-2xl border border-slate-100 bg-slate-50 text-sm font-medium outline-none resize-none">${esc(state.chatModal.draft || "")}</textarea>
              <button id="chatSendBtn" class="px-5 h-[52px] rounded-2xl bg-slate-900 text-white font-black text-[10px] uppercase tracking-widest active:scale-95">Send</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

export function renderProfileModalCore({
  state,
  isFollowingProfile,
  getOptimizedImageUrl,
  formatCount,
  escapeHtml,
  icon
} = {}) {
  if (!state?.profileModal?.open || !state?.profileModal?.profile) return "";
  const isFollowing = typeof isFollowingProfile === "function"
    ? isFollowingProfile
    : (() => false);
  const getImage = typeof getOptimizedImageUrl === "function"
    ? getOptimizedImageUrl
    : ((value) => value || "");
  const countLabel = typeof formatCount === "function"
    ? formatCount
    : ((value) => String(value ?? "0"));
  const esc = typeof escapeHtml === "function"
    ? escapeHtml
    : ((value) => String(value ?? ""));
  const iconFn = typeof icon === "function" ? icon : (() => "");

  const p = state.profileModal.profile;
  const following = isFollowing(p);
  const hasPendingFollowRequest = !!p.pendingFollowRequest && !following;
  const isLocked = !!p.privateAccount && p.uid && String(p.uid) !== String(state.user?.uid || "") && !following;
  const typeLabel = p.restaurantId ? "Business" : "User";
  const avatarUrl = getImage(p.avatar, "avatar");
  return `
    <div class="fixed inset-0 z-[60] modal-overlay" data-modal-surface="#ffffff" style="--modal-surface:#ffffff;">
      <div id="profileModalOverlay" class="absolute inset-0 bg-black/60"></div>
      <div class="modal-frame">
        <div class="bg-white rounded-t-[3rem] shadow-2xl border border-slate-100 modal-sheet-85 flex flex-col overflow-hidden modal-sheet">
          <div class="flex-1 overflow-y-auto no-scrollbar modal-scroll p-7">
            <div class="flex justify-end mb-4">
              <button id="profileModalClose" class="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-500">${iconFn("x", "w-4 h-4")}</button>
            </div>

            <div class="flex items-center gap-4">
              <img src="${esc(avatarUrl)}" class="w-16 h-16 rounded-2xl object-cover shadow" />
              <div class="flex-1 min-w-0">
                <p class="text-xs font-black">@${esc(p.handle)}</p>
                <p class="text-[10px] text-slate-400 font-bold uppercase tracking-widest">${esc(p.location)} / ${typeLabel}</p>
              </div>
              <div class="flex items-center gap-2">
                <button id="profileChatBtn" data-chat-uid="${esc(p.uid || "")}" data-chat-handle="${esc(p.handle || "")}" data-chat-name="${esc(p.name || "")}" data-chat-avatar="${esc(p.avatar || "")}" ${isLocked ? "disabled" : ""} class="w-11 h-11 rounded-2xl border border-slate-200 ${isLocked ? "bg-slate-100 text-slate-300 cursor-not-allowed" : "bg-white text-slate-700"} flex items-center justify-center">
                  ${iconFn("message-circle", "w-4 h-4")}
                </button>
                <button id="profileFollowBtn" data-handle="${esc(p.handle)}" data-target-type="${esc(p.restaurantId ? "restaurant" : (p.uid ? "user" : ""))}" data-target-id="${esc(p.restaurantId || p.uid || "")}" data-target-name="${esc(p.name || "")}" data-target-avatar="${esc(p.avatar || "")}" ${hasPendingFollowRequest ? "disabled" : ""} class="px-5 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest active:scale-95 transition-transform ${following ? "bg-slate-100 text-slate-700" : (hasPendingFollowRequest ? "bg-amber-50 text-amber-700 border border-amber-200" : "bg-indigo-600 text-white shadow-xl shadow-indigo-500/20")} ${hasPendingFollowRequest ? "cursor-default" : ""}">
                  ${following ? "Following" : (hasPendingFollowRequest ? "Requested" : (isLocked ? "Request" : "Follow"))}
                </button>
              </div>
            </div>

            <p class="mt-5 text-sm font-medium text-slate-600 leading-relaxed">${esc(p.bio)}</p>

            <div class="flex gap-3 mt-6">
              <div class="flex-1 p-4 rounded-2xl bg-slate-50 border border-slate-100 text-center">
                <div class="text-lg font-black text-slate-900">${esc(countLabel(p.posts?.length || 0))}</div>
                <div class="text-[9px] font-bold text-slate-400 uppercase">Posts</div>
              </div>
              <div class="flex-1 p-4 rounded-2xl bg-slate-50 border border-slate-100 text-center">
                <div class="text-lg font-black text-slate-900">${esc(countLabel(p.followers))}</div>
                <div class="text-[9px] font-bold text-slate-400 uppercase">Follower</div>
              </div>
              <div class="flex-1 p-4 rounded-2xl bg-slate-50 border border-slate-100 text-center">
                <div class="text-lg font-black text-slate-900">${esc(countLabel(p.following))}</div>
                <div class="text-[9px] font-bold text-slate-400 uppercase">Following</div>
              </div>
            </div>

            <div class="h-2"></div>
          </div>
        </div>
      </div>
    </div>
  `;
}

export function renderLikesModalCore({
  state,
  ensurePostMeta,
  findPostById,
  resolveLikeAvatar,
  escapeHtml,
  icon
} = {}) {
  if (!state?.likesModal?.open || !state?.likesModal?.postId) return "";
  const ensureMeta = typeof ensurePostMeta === "function"
    ? ensurePostMeta
    : (() => ({}));
  const findPost = typeof findPostById === "function"
    ? findPostById
    : (() => null);
  const getLikeAvatar = typeof resolveLikeAvatar === "function"
    ? resolveLikeAvatar
    : (() => "");
  const esc = typeof escapeHtml === "function"
    ? escapeHtml
    : ((value) => String(value ?? ""));
  const iconFn = typeof icon === "function" ? icon : (() => "");

  const meta = ensureMeta(state.likesModal.postId);
  const likes = meta.likes || [];
  const postForCount = findPost(state.likesModal.postId);
  const likeTotal = Number(postForCount?.likes) || likes.length;
  const animClass = "";

  return `
      <div class="fixed inset-0 z-[80] modal-overlay" data-modal-surface="#ffffff" style="--modal-surface:#ffffff;">
        <div id="likesModalOverlay" class="absolute inset-0 bg-black/70"></div>
      <div class="modal-frame">
        <div class="bg-white rounded-t-[3rem] shadow-2xl border border-slate-100 ${animClass} flex flex-col modal-sheet-85 overflow-hidden modal-sheet">
          <div class="p-7 pb-4 flex items-center justify-between">
            <div>
              <span class="text-[9px] font-black text-indigo-600 uppercase tracking-widest">Likes</span>
              <h3 class="text-xl font-black italic tracking-tighter">${likeTotal} Likes</h3>
            </div>
            <button id="likesModalClose" class="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-500">${iconFn("x", "w-4 h-4")}</button>
          </div>

          <div class="px-7 pb-7 space-y-3 overflow-y-auto no-scrollbar modal-scroll flex-1">
            ${likes.length ? likes.map((user) => {
              const avatarUrl = getLikeAvatar(user);
              return `
              <div class="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <img src="${esc(avatarUrl)}" class="w-10 h-10 rounded-2xl object-cover" />
                <div>
                  <div class="text-xs font-black">${esc(user.name)}</div>
                  <div class="text-[9px] font-bold text-slate-400 uppercase">@${esc(user.handle)}</div>
                </div>
              </div>
            `;
            }).join("") : `
              <div class="text-center text-[10px] font-bold uppercase text-slate-400">Noch keine Likes</div>
            `}
          </div>
        </div>
      </div>
    </div>
  `;
}

export function renderPostModalCore({
  state,
  ensurePostMeta,
  resolvePostCounts,
  getOptimizedImageUrl,
  ensureCommentShape,
  currentUserBadge,
  renderPostComments,
  formatDateLabel,
  escapeHtml,
  icon
} = {}) {
  if (!state?.postModal?.open || !state?.postModal?.post) return "";
  const ensureMeta = typeof ensurePostMeta === "function"
    ? ensurePostMeta
    : (() => ({}));
  const resolveCounts = typeof resolvePostCounts === "function"
    ? resolvePostCounts
    : (() => ({ likeLabel: "0", commentLabel: "0" }));
  const getImage = typeof getOptimizedImageUrl === "function"
    ? getOptimizedImageUrl
    : ((value) => value || "");
  const ensureComment = typeof ensureCommentShape === "function"
    ? ensureCommentShape
    : ((value) => value || {});
  const getUserBadge = typeof currentUserBadge === "function"
    ? currentUserBadge
    : (() => ({ uid: "", handle: "" }));
  const renderComments = typeof renderPostComments === "function"
    ? renderPostComments
    : (() => "");
  const formatDate = typeof formatDateLabel === "function"
    ? formatDateLabel
    : ((value) => String(value ?? ""));
  const esc = typeof escapeHtml === "function"
    ? escapeHtml
    : ((value) => String(value ?? ""));
  const iconFn = typeof icon === "function" ? icon : (() => "");

  const post = state.postModal.post;
  const meta = ensureMeta(post.id);
  const counts = resolveCounts(post);
  const caption = post.caption || post.title || "";
  const rawImageUrl = post.url || post.image || "";
  const imageUrl = getImage(rawImageUrl, "large", {
    stableKey: post?.id ? `post-modal:${String(post.id)}` : ""
  });
  const comments = (meta.comments || []).map(ensureComment);
  const userBadge = getUserBadge();
  const isLiked = meta.likes?.some((item) => item.uid === userBadge.uid || item.handle === userBadge.handle);
  const replyTarget = comments.find((item) => item.id === state.postModal.replyTo);
  const animClass = "";

  return `
      <div class="fixed inset-0 z-[70] modal-overlay" data-modal-surface="#ffffff" style="--modal-surface:#ffffff;">
        <div id="postModalOverlay" class="absolute inset-0 bg-black/60"></div>
        <div class="modal-frame">
          <div class="bg-white rounded-t-[3rem] shadow-2xl border border-slate-100 ${animClass} flex flex-col modal-sheet-85 overflow-hidden modal-sheet">
            <div class="flex-1 overflow-y-auto no-scrollbar modal-scroll p-7">
              <div class="flex items-center justify-between mb-4">
                <div>
                  <span class="text-[9px] font-black text-indigo-600 uppercase tracking-widest">Post</span>
                  <h3 class="text-xl font-black italic tracking-tighter">${esc(formatDate(post.createdAt || new Date()))}</h3>
                  <p class="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1">Foto</p>
                </div>
                <button id="postModalClose" type="button" class="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-500">${iconFn("x", "w-4 h-4")}</button>
              </div>

              <div class="rounded-[2.5rem] overflow-hidden shadow-lg border border-slate-100">
                <img src="${esc(imageUrl)}" data-img-key="post-modal:${esc(post.id)}" class="w-full h-[22rem] object-cover" loading="eager" fetchpriority="high" decoding="sync" />
              </div>

              ${caption ? `
                <div class="mt-4 text-sm text-slate-600 leading-relaxed">${esc(caption)}</div>
              ` : ""}

              <div class="mt-4 flex items-center justify-between">
                <button id="postLikeBtn" data-post-id="${esc(post.id)}" class="flex items-center gap-2 text-sm font-black ${isLiked ? "text-rose-500" : "text-slate-700"}">
                  ${iconFn("heart", "w-5 h-5")} ${isLiked ? "Gefaellt" : "Like"}
                </button>
                <div class="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  <button id="postLikesBtn" data-post-id="${esc(post.id)}" class="hover:text-slate-700">${esc(counts.likeLabel)} Likes</button>
                  <span id="postCommentsCount">${esc(counts.commentLabel)} Kommentare</span>
                </div>
              </div>

              <div id="postModalComments" class="mt-5 space-y-4">
                ${renderComments(comments)}
              </div>

              ${replyTarget ? `
                <div class="mt-4 flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100">
                  <div class="text-[10px] font-bold uppercase text-slate-400">Antwort an @${esc(replyTarget.handle)}</div>
                  <button id="postReplyCancel" class="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Abbrechen</button>
                </div>
              ` : ""}
            </div>

            <div class="p-7 pt-4 border-t border-slate-100 bg-white modal-footer-safe">
              <div class="flex gap-3">
                <textarea id="postCommentInput" placeholder="Schreib einen Kommentar..." class="flex-1 p-4 rounded-2xl border border-slate-100 bg-white text-sm font-medium outline-none resize-none" rows="2">${esc(state.postModal.commentText || "")}</textarea>
                <button id="postCommentSend" type="button" data-post-id="${esc(post.id)}" class="w-14 h-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-xl shadow-indigo-500/20">
                  ${iconFn("send", "w-4 h-4")}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}
