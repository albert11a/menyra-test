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
  windowObj,
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
  const win = windowObj || null;
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
  let stopKeyboardGapTracking = () => {};
  const rootEl = doc.documentElement;
  const POST_FOCUS_DATA_KEY = "postCommentFocus";
  const POST_GAP_DATA_KEY = "postFooterGap";
  const MENU_DETAIL_FOCUS_DATA_KEY = "menuDetailCommentFocus";
  const MENU_DETAIL_GAP_DATA_KEY = "menuDetailFooterGap";
  const readGapDataValue = (key) => {
    const raw = Number(rootEl?.dataset?.[key] || 0);
    return Number.isFinite(raw) && raw > 0 ? raw : 0;
  };
  const syncSharedKeyboardGapUi = () => {
    const postActive = rootEl?.dataset?.[POST_FOCUS_DATA_KEY] === "1";
    const menuDetailActive = rootEl?.dataset?.[MENU_DETAIL_FOCUS_DATA_KEY] === "1";
    const anyActive = postActive || menuDetailActive;
    rootEl.classList.toggle("menu-detail-comment-focus", anyActive);
    doc.body?.classList?.toggle?.("menu-detail-comment-focus", anyActive);
    if (!anyActive) {
      rootEl.style.setProperty("--menu-detail-footer-gap", "0px");
      return;
    }
    const nextGap = Math.max(
      postActive ? readGapDataValue(POST_GAP_DATA_KEY) : 0,
      menuDetailActive ? readGapDataValue(MENU_DETAIL_GAP_DATA_KEY) : 0
    );
    rootEl.style.setProperty("--menu-detail-footer-gap", `${nextGap}px`);
  };
  const setKeyboardGapUiActive = (active) => {
    const next = !!active;
    if (next) rootEl.dataset[POST_FOCUS_DATA_KEY] = "1";
    else delete rootEl.dataset[POST_FOCUS_DATA_KEY];
    syncSharedKeyboardGapUi();
  };
  const setKeyboardGapSize = (value) => {
    const gap = Math.max(0, Number(value) || 0);
    if (gap > 0) rootEl.dataset[POST_GAP_DATA_KEY] = String(gap);
    else delete rootEl.dataset[POST_GAP_DATA_KEY];
    syncSharedKeyboardGapUi();
  };
  const startKeyboardGapTracking = (inputEl) => {
    stopKeyboardGapTracking();
    const input = inputEl || doc.getElementById("postCommentInput");
    if (!(input instanceof HTMLElement)) return;
    const footer = input.closest(".modal-footer-safe");
    if (!footer) return;
    setKeyboardGapUiActive(true);
    const updateGap = () => {
      const viewportHeight = Number(win?.visualViewport?.height || win?.innerHeight || doc.documentElement.clientHeight || 0);
      if (!viewportHeight) {
        setKeyboardGapSize(0);
        return;
      }
      const rect = footer.getBoundingClientRect();
      const gap = Math.max(0, Math.round(viewportHeight - rect.bottom));
      setKeyboardGapSize(gap);
    };
    updateGap();
    const vv = win?.visualViewport;
    const onResize = () => updateGap();
    if (vv?.addEventListener) {
      vv.addEventListener("resize", onResize);
      vv.addEventListener("scroll", onResize);
    }
    win?.addEventListener?.("resize", onResize);
    stopKeyboardGapTracking = () => {
      if (vv?.removeEventListener) {
        vv.removeEventListener("resize", onResize);
        vv.removeEventListener("scroll", onResize);
      }
      win?.removeEventListener?.("resize", onResize);
      setKeyboardGapUiActive(false);
      setKeyboardGapSize(0);
    };
  };
  const cleanupKeyboardGap = () => {
    stopKeyboardGapTracking();
  };
  setKeyboardGapUiActive(false);
  setKeyboardGapSize(0);

  const postModalOverlay = doc.getElementById("postModalOverlay");
  const postModalClose = doc.getElementById("postModalClose");
  if (postModalOverlay) {
    postModalOverlay.addEventListener("click", cleanupKeyboardGap, { capture: true });
  }
  if (postModalClose) {
    postModalClose.addEventListener("click", cleanupKeyboardGap, { capture: true });
  }
  bindModalDismiss(postModalOverlay, closePostModal, { selfOnly: true });
  bindModalDismiss(postModalClose, closePostModal);

  // Video-Post im Modal: startet NICHT automatisch - Play/Pause nur ueber
  // den Button oben links (Icon + aria-label laufen ueber die Video-Events).
  const postModalVideoToggle = doc.querySelector("[data-post-modal-video-toggle]");
  const postModalVideo = doc.getElementById("postModalVideo");
  if (postModalVideoToggle && postModalVideo) {
    const playIcon = postModalVideoToggle.querySelector('[data-post-modal-video-icon="play"]');
    const pauseIcon = postModalVideoToggle.querySelector('[data-post-modal-video-icon="pause"]');
    const setToggleUi = (playing) => {
      playIcon?.classList?.toggle("hidden", !!playing);
      pauseIcon?.classList?.toggle("hidden", !playing);
      postModalVideoToggle.setAttribute("aria-label", playing ? "Video pausieren" : "Video abspielen");
    };
    postModalVideo.addEventListener("play", () => setToggleUi(true));
    postModalVideo.addEventListener("pause", () => setToggleUi(false));
    postModalVideoToggle.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      if (postModalVideo.paused) {
        try {
          postModalVideo.preload = "auto";
        } catch {}
        void postModalVideo.play().catch(() => setToggleUi(false));
        return;
      }
      try {
        postModalVideo.pause();
      } catch {}
    });
  }

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
    let lastSubmitAt = 0;
    const submitPostComment = (evt) => {
      if (evt?.cancelable) evt.preventDefault();
      evt?.stopPropagation?.();
      const now = Date.now();
      if (now - lastSubmitAt < 250) return;
      const postId = String(
        postCommentSend.dataset.postId
        || state.postModal?.post?.id
        || ""
      ).trim();
      if (!postId) return;
      const inputEl = doc.getElementById("postCommentInput");
      const text = inputEl ? inputEl.value : state.postModal.commentText;
      if (!String(text || "").trim() || state.postModal.sending) return;
      lastSubmitAt = now;
      state.postModal.commentText = text;
      void addComment(postId, text, state.postModal.replyTo);
    };
    if (typeof globalThis !== "undefined" && !!globalThis.PointerEvent) {
      postCommentSend.addEventListener("pointerup", submitPostComment);
    }
    postCommentSend.addEventListener("click", (evt) => {
      submitPostComment(evt);
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
    postCommentInput.addEventListener("focus", () => {
      startKeyboardGapTracking(postCommentInput);
      win?.setTimeout?.(() => {
        try {
          postCommentInput.scrollIntoView({ block: "nearest", behavior: "smooth" });
        } catch {}
      }, 180);
    });
    postCommentInput.addEventListener("blur", () => {
      win?.setTimeout?.(() => {
        if (doc.activeElement === postCommentInput) return;
        stopKeyboardGapTracking();
      }, 120);
    });
  }
}
