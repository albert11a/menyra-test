export function bindProfileOverlayEventsCore({
  documentObj,
  bindModalDismissFn,
  closeProfileModalFn,
  openChatWithProfileFn,
  toggleFollowFn,
  onProfileOpenFn
} = {}) {
  const doc = documentObj || null;
  const bindModalDismiss = typeof bindModalDismissFn === "function"
    ? bindModalDismissFn
    : null;
  if (!doc || !bindModalDismiss) return;
  const closeProfileModal = typeof closeProfileModalFn === "function"
    ? closeProfileModalFn
    : (() => {});
  const openChatWithProfile = typeof openChatWithProfileFn === "function"
    ? openChatWithProfileFn
    : (() => {});
  const toggleFollow = typeof toggleFollowFn === "function"
    ? toggleFollowFn
    : (() => {});
  const onProfileOpen = typeof onProfileOpenFn === "function"
    ? onProfileOpenFn
    : (() => {});

  const profileModalOverlay = doc.getElementById("profileModalOverlay");
  const profileModalClose = doc.getElementById("profileModalClose");
  const profileChatBtn = doc.getElementById("profileChatBtn");
  const profileFollowBtn = doc.getElementById("profileFollowBtn");
  const profileOpenBtn = doc.getElementById("profileOpenBtn");
  bindModalDismiss(profileModalOverlay, closeProfileModal, { selfOnly: true });
  bindModalDismiss(profileModalClose, closeProfileModal);
  if (profileChatBtn) {
    profileChatBtn.addEventListener("click", () => {
      openChatWithProfile({
        uid: profileChatBtn.dataset.chatUid || "",
        handle: profileChatBtn.dataset.chatHandle || "",
        name: profileChatBtn.dataset.chatName || "User",
        avatar: profileChatBtn.dataset.chatAvatar || ""
      });
    });
  }
  if (profileFollowBtn) {
    profileFollowBtn.addEventListener("click", () => {
      const handle = profileFollowBtn.dataset.handle;
      if (!handle) return;
      toggleFollow(handle, {
        type: profileFollowBtn.dataset.targetType || "",
        id: profileFollowBtn.dataset.targetId || "",
        name: profileFollowBtn.dataset.targetName || "",
        avatar: profileFollowBtn.dataset.targetAvatar || ""
      });
    });
  }
  if (profileOpenBtn) {
    profileOpenBtn.addEventListener("click", () => {
      onProfileOpen();
    });
  }
}

export function bindLikesOverlayEventsCore({
  documentObj,
  bindModalDismissFn,
  closeLikesModalFn
} = {}) {
  const doc = documentObj || null;
  const bindModalDismiss = typeof bindModalDismissFn === "function"
    ? bindModalDismissFn
    : null;
  if (!doc || !bindModalDismiss) return;
  const closeLikesModal = typeof closeLikesModalFn === "function"
    ? closeLikesModalFn
    : (() => {});
  const likesModalOverlay = doc.getElementById("likesModalOverlay");
  const likesModalClose = doc.getElementById("likesModalClose");
  bindModalDismiss(likesModalOverlay, closeLikesModal, { selfOnly: true });
  bindModalDismiss(likesModalClose, closeLikesModal);
}
