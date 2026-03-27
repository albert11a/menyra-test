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
  const setKeyboardGapUiActive = (active) => {
    const next = !!active;
    doc.documentElement.classList.toggle("menu-detail-comment-focus", next);
    doc.body?.classList?.toggle?.("menu-detail-comment-focus", next);
  };
  const setKeyboardGapSize = (value) => {
    const gap = Math.max(0, Number(value) || 0);
    doc.documentElement.style.setProperty("--menu-detail-footer-gap", `${gap}px`);
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

  const postModalHeroImage = doc.getElementById("postModalHeroImage");
  const postModalHeroPreview = doc.getElementById("postModalHeroPreview");
  const revealPostModalHeroImage = () => {
    if (postModalHeroImage) {
      postModalHeroImage.classList.remove("opacity-0");
      postModalHeroImage.dataset.postModalHeroReady = "1";
    }
    if (postModalHeroPreview) {
      postModalHeroPreview.classList.add("opacity-0");
      win?.setTimeout?.(() => {
        if (postModalHeroPreview.isConnected) {
          postModalHeroPreview.remove();
        }
      }, 160);
    }
    if (state?.postModal && typeof state.postModal === "object") {
      state.postModal.previewImageSrc = "";
    }
  };
  const queuePostModalHeroReveal = () => {
    const finalizeReveal = () => {
      win?.requestAnimationFrame?.(() => revealPostModalHeroImage());
      if (!win?.requestAnimationFrame) win?.setTimeout?.(() => revealPostModalHeroImage(), 0);
    };
    if (!postModalHeroImage || typeof postModalHeroImage.decode !== "function") {
      finalizeReveal();
      return;
    }
    postModalHeroImage.decode().catch(() => {}).finally(finalizeReveal);
  };
  if (postModalHeroImage) {
    if (postModalHeroImage.complete && Number(postModalHeroImage.naturalWidth || 0) > 0) {
      queuePostModalHeroReveal();
    } else {
      postModalHeroImage.addEventListener("load", queuePostModalHeroReveal, { once: true });
      postModalHeroImage.addEventListener("error", queuePostModalHeroReveal, { once: true });
    }
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
