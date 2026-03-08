export function bindChatOverlayEventsCore({
  documentObj,
  bindModalDismissFn,
  closeChatModalFn,
  sendChatMessageFn,
  scrollChatMessagesToBottomFn,
  queueMicrotaskFn,
  state
} = {}) {
  const doc = documentObj || null;
  const bindModalDismiss = typeof bindModalDismissFn === "function"
    ? bindModalDismissFn
    : null;
  if (!doc || !bindModalDismiss) return;
  const closeChatModal = typeof closeChatModalFn === "function"
    ? closeChatModalFn
    : (() => {});
  const sendChatMessage = typeof sendChatMessageFn === "function"
    ? sendChatMessageFn
    : (() => {});
  const scrollChatMessagesToBottom = typeof scrollChatMessagesToBottomFn === "function"
    ? scrollChatMessagesToBottomFn
    : (() => {});
  const queueMicrotaskSafe = typeof queueMicrotaskFn === "function"
    ? queueMicrotaskFn
    : ((fn) => Promise.resolve().then(fn));
  const chatModalOverlay = doc.getElementById("chatModalOverlay");
  const chatModalClose = doc.getElementById("chatModalClose");
  const chatSendBtn = doc.getElementById("chatSendBtn");
  const chatInput = doc.getElementById("chatMessageInput");
  const chatMessages = doc.getElementById("chatMessages");
  bindModalDismiss(chatModalOverlay, closeChatModal, { selfOnly: true });
  bindModalDismiss(chatModalClose, closeChatModal);
  if (chatSendBtn) {
    chatSendBtn.addEventListener("click", () => {
      sendChatMessage();
    });
  }
  if (chatInput) {
    chatInput.addEventListener("input", () => {
      state.chatModal.draft = chatInput.value;
      chatInput.style.height = "auto";
      chatInput.style.height = `${Math.min(chatInput.scrollHeight, 112)}px`;
    });
    chatInput.addEventListener("keydown", (evt) => {
      if (evt.key === "Enter" && !evt.shiftKey) {
        evt.preventDefault();
        sendChatMessage();
      }
    });
    queueMicrotaskSafe(() => {
      chatInput.style.height = "auto";
      chatInput.style.height = `${Math.min(chatInput.scrollHeight, 112)}px`;
    });
  }
  if (chatMessages) {
    scrollChatMessagesToBottom();
  }
}

export function bindPostOverlayEventsCore({
  documentObj,
  bindModalDismissFn,
  closePostModalFn,
  togglePostLikeFn,
  renderOverlaysFn,
  loadPostLikesForModalFn,
  addCommentFn,
  toggleCommentLikeFn,
  state
} = {}) {
  const doc = documentObj || null;
  const bindModalDismiss = typeof bindModalDismissFn === "function"
    ? bindModalDismissFn
    : null;
  if (!doc || !bindModalDismiss) return;
  const closePostModal = typeof closePostModalFn === "function"
    ? closePostModalFn
    : (() => {});
  const togglePostLike = typeof togglePostLikeFn === "function"
    ? togglePostLikeFn
    : (() => {});
  const renderOverlays = typeof renderOverlaysFn === "function"
    ? renderOverlaysFn
    : (() => {});
  const loadPostLikesForModal = typeof loadPostLikesForModalFn === "function"
    ? loadPostLikesForModalFn
    : (() => Promise.resolve());
  const addComment = typeof addCommentFn === "function"
    ? addCommentFn
    : (() => {});
  const toggleCommentLike = typeof toggleCommentLikeFn === "function"
    ? toggleCommentLikeFn
    : (() => {});

  const postModalOverlay = doc.getElementById("postModalOverlay");
  const postModalClose = doc.getElementById("postModalClose");
  bindModalDismiss(postModalOverlay, closePostModal, { selfOnly: true });
  bindModalDismiss(postModalClose, closePostModal);

  const postLikeBtn = doc.getElementById("postLikeBtn");
  if (postLikeBtn) {
    postLikeBtn.addEventListener("click", () => {
      const postId = postLikeBtn.dataset.postId;
      if (postId) togglePostLike(postId);
    });
  }

  const postLikesBtn = doc.getElementById("postLikesBtn");
  if (postLikesBtn) {
    postLikesBtn.addEventListener("click", () => {
      const postId = postLikesBtn.dataset.postId;
      if (!postId) return;
      state.likesModal = { open: true, postId, animate: false };
      renderOverlays({ updateProfile: false, updatePost: false, updateLikes: true });
      void loadPostLikesForModal(postId);
    });
  }

  const postReplyCancel = doc.getElementById("postReplyCancel");
  if (postReplyCancel) {
    postReplyCancel.addEventListener("click", () => {
      state.postModal.replyTo = null;
      renderOverlays();
    });
  }

  const postCommentSend = doc.getElementById("postCommentSend");
  if (postCommentSend) {
    postCommentSend.addEventListener("click", () => {
      const postId = postCommentSend.dataset.postId;
      if (!postId) return;
      const inputEl = doc.getElementById("postCommentInput");
      const text = inputEl ? inputEl.value : state.postModal.commentText;
      if (!String(text || "").trim() || state.postModal.sending) return;
      state.postModal.commentText = text;
      addComment(postId, text, state.postModal.replyTo);
    });
  }

  doc.querySelectorAll("[data-comment-reply]").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.postModal.replyTo = btn.dataset.commentId || null;
      renderOverlays();
    });
  });

  doc.querySelectorAll("[data-comment-like]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const postId = btn.dataset.postId;
      const commentId = btn.dataset.commentId;
      const replyId = btn.dataset.replyId || "";
      if (!postId || !commentId) return;
      toggleCommentLike(postId, commentId, replyId || null);
    });
  });

  const postCommentInput = doc.getElementById("postCommentInput");
  if (postCommentInput) {
    postCommentInput.addEventListener("input", () => {
      state.postModal.commentText = postCommentInput.value;
    });
  }
}
