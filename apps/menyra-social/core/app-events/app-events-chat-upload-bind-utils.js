export function bindAppChatUploadEventsCore({
  documentObj,
  state,
  renderFn,
  openChatWithProfileFn,
  deleteChatThreadByIdFn,
  setChatThreadArchivedByIdFn,
  closeChatModalFn,
  toggleChatMessageSavedFn,
  toggleChatMessageLikedFn,
  removePendingChatAttachmentFn,
  addChatAttachmentsFn,
  sendChatMessageFn,
  scrollChatMessagesToBottomFn,
  queueMicrotaskFn,
  handleUploadPostFn
} = {}) {
  const doc = documentObj || null;
  if (!doc || !state) return;
  const render = typeof renderFn === "function" ? renderFn : (() => {});
  const openChatWithProfile = typeof openChatWithProfileFn === "function" ? openChatWithProfileFn : (() => {});
  const deleteChatThreadById = typeof deleteChatThreadByIdFn === "function" ? deleteChatThreadByIdFn : null;
  const setChatThreadArchivedById = typeof setChatThreadArchivedByIdFn === "function"
    ? setChatThreadArchivedByIdFn
    : null;
  const closeChatModal = typeof closeChatModalFn === "function" ? closeChatModalFn : (() => {});
  const toggleChatMessageSaved = typeof toggleChatMessageSavedFn === "function" ? toggleChatMessageSavedFn : (() => {});
  const toggleChatMessageLiked = typeof toggleChatMessageLikedFn === "function" ? toggleChatMessageLikedFn : (() => {});
  const removePendingChatAttachment = typeof removePendingChatAttachmentFn === "function"
    ? removePendingChatAttachmentFn
    : (() => {});
  const addChatAttachments = typeof addChatAttachmentsFn === "function" ? addChatAttachmentsFn : null;
  const sendChatMessage = typeof sendChatMessageFn === "function" ? sendChatMessageFn : (() => {});
  const scrollChatMessagesToBottom = typeof scrollChatMessagesToBottomFn === "function"
    ? scrollChatMessagesToBottomFn
    : (() => {});
  const queueMicrotaskSafe = typeof queueMicrotaskFn === "function"
    ? queueMicrotaskFn
    : ((fn) => Promise.resolve().then(fn));
  const handleUploadPost = typeof handleUploadPostFn === "function" ? handleUploadPostFn : null;
  const revokePreviewUrl = (value) => {
    const preview = String(value || "").trim();
    if (!preview || !preview.startsWith("blob:")) return;
    if (typeof URL === "undefined" || typeof URL.revokeObjectURL !== "function") return;
    try {
      URL.revokeObjectURL(preview);
    } catch {}
  };

  doc.querySelectorAll("[data-open-chat]").forEach((btn) => {
    btn.addEventListener("click", () => {
      openChatWithProfile({
        uid: btn.dataset.chatUid || "",
        handle: btn.dataset.chatHandle || "",
        name: btn.dataset.chatName || "User",
        avatar: btn.dataset.chatAvatar || ""
      });
    });
  });

  doc.querySelectorAll("[data-chat-open-thread]").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.chatThreadMenuId = "";
      openChatWithProfile({
        uid: btn.dataset.chatUid || "",
        handle: btn.dataset.chatHandle || "",
        name: btn.dataset.chatName || "User",
        avatar: btn.dataset.chatAvatar || ""
      });
    });
  });

  doc.querySelectorAll("[data-chat-list-tab]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const tab = String(btn.dataset.chatListTab || "").trim();
      state.chatListScope = tab === "archived" ? "archived" : "inbox";
      state.chatThreadMenuId = "";
      render();
    });
  });

  doc.querySelectorAll("[data-chat-thread-menu-toggle]").forEach((btn) => {
    btn.addEventListener("click", (evt) => {
      evt.preventDefault();
      evt.stopPropagation();
      const id = String(btn.dataset.chatThreadMenuToggle || "").trim();
      if (!id) return;
      state.chatThreadMenuId = state.chatThreadMenuId === id ? "" : id;
      render();
    });
  });

  doc.querySelectorAll("[data-chat-thread-menu-close]").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (!state.chatThreadMenuId) return;
      state.chatThreadMenuId = "";
      render();
    });
  });

  doc.querySelectorAll("[data-chat-thread-action]").forEach((btn) => {
    btn.addEventListener("click", async (evt) => {
      evt.preventDefault();
      evt.stopPropagation();
      const action = String(btn.dataset.chatThreadAction || "").trim();
      const threadId = String(btn.dataset.chatThreadId || "").trim();
      if (!action || !threadId) return;
      if (action === "delete" && deleteChatThreadById) {
        await deleteChatThreadById(threadId);
        return;
      }
      if (action === "archive" && setChatThreadArchivedById) {
        await setChatThreadArchivedById(threadId, true);
        return;
      }
      if (action === "unarchive" && setChatThreadArchivedById) {
        await setChatThreadArchivedById(threadId, false);
      }
    });
  });

  doc.querySelectorAll("[data-chat-back]").forEach((btn) => {
    btn.addEventListener("click", () => {
      closeChatModal();
    });
  });

  doc.querySelectorAll("[data-chat-save]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.chatSave || "";
      if (!id) return;
      toggleChatMessageSaved(id);
    });
  });

  doc.querySelectorAll("[data-chat-like]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.chatLike || "";
      if (!id) return;
      toggleChatMessageLiked(id);
    });
  });

  doc.querySelectorAll("[data-chat-retry]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = String(btn.dataset.chatRetry || "").trim();
      if (!id) return;
      sendChatMessage({ retryMessageId: id });
    });
  });

  doc.querySelectorAll("[data-chat-remove-attachment]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.chatRemoveAttachment || "";
      if (!id) return;
      removePendingChatAttachment(id);
    });
  });

  const chatAttachmentTrigger = doc.getElementById("chatAttachmentTrigger");
  const chatAttachmentInput = doc.getElementById("chatAttachmentInput");
  if (chatAttachmentTrigger && chatAttachmentInput) {
    chatAttachmentTrigger.addEventListener("click", () => chatAttachmentInput.click());
    chatAttachmentInput.addEventListener("change", async (e) => {
      if (!addChatAttachments) return;
      await addChatAttachments(e.target.files || []);
      chatAttachmentInput.value = "";
    });
  }

  const chatSendBtn = doc.getElementById("chatSendBtn");
  if (chatSendBtn) {
    chatSendBtn.addEventListener("click", () => {
      sendChatMessage();
    });
  }

  const chatMessageInput = doc.getElementById("chatMessageInput");
  if (chatMessageInput) {
    chatMessageInput.addEventListener("input", () => {
      state.chatModal.draft = chatMessageInput.value;
      chatMessageInput.style.height = "auto";
      chatMessageInput.style.height = `${Math.min(chatMessageInput.scrollHeight, 112)}px`;
    });
    chatMessageInput.addEventListener("keydown", (evt) => {
      if (evt.key === "Enter" && !evt.shiftKey) {
        evt.preventDefault();
        sendChatMessage();
      }
    });
    queueMicrotaskSafe(() => {
      chatMessageInput.style.height = "auto";
      chatMessageInput.style.height = `${Math.min(chatMessageInput.scrollHeight, 112)}px`;
    });
  }

  const chatMessages = doc.getElementById("chatMessages");
  if (chatMessages) {
    scrollChatMessagesToBottom();
  }

  const uploadFileInput = doc.getElementById("uploadFileInput");
  const uploadTrigger = doc.getElementById("uploadFileTrigger");
  doc.querySelectorAll("[data-upload-mode]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const mode = String(btn.dataset.uploadMode || "").trim().toLowerCase();
      if (!mode) return;
      revokePreviewUrl(state.upload?.preview);
      state.upload = {
        preview: "",
        caption: "",
        file: null,
        status: "",
        mode
      };
      render();
    });
  });
  if (uploadTrigger && uploadFileInput) {
    uploadTrigger.addEventListener("click", () => uploadFileInput.click());
  }
  if (uploadFileInput) {
    uploadFileInput.addEventListener("change", (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const mode = String(state.upload?.mode || "").trim().toLowerCase();
      const mime = String(file.type || "").trim().toLowerCase();
      const isImage = mime.startsWith("image/");
      const isVideo = mime.startsWith("video/");
      if (!isImage && !isVideo) {
        state.upload.status = "Nur Bild oder Video moeglich.";
        render();
        uploadFileInput.value = "";
        return;
      }
      if (isVideo && mode !== "story") {
        state.upload.status = "Video nur fuer Story Upload moeglich.";
        render();
        uploadFileInput.value = "";
        return;
      }
      revokePreviewUrl(state.upload?.preview);
      if (isVideo && typeof URL !== "undefined" && typeof URL.createObjectURL === "function") {
        state.upload.preview = URL.createObjectURL(file);
        state.upload.file = file;
        state.upload.status = "";
        render();
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        state.upload.preview = reader.result;
        state.upload.file = file;
        state.upload.status = "";
        render();
      };
      reader.readAsDataURL(file);
    });
  }

  const uploadPostBtn = doc.getElementById("uploadPostBtn");
  if (uploadPostBtn) {
    uploadPostBtn.addEventListener("click", async () => {
      if (!handleUploadPost) return;
      await handleUploadPost();
    });
  }

  const uploadCaption = doc.getElementById("uploadCaption");
  if (uploadCaption) {
    uploadCaption.addEventListener("input", () => {
      state.upload.caption = uploadCaption.value;
    });
  }
}
