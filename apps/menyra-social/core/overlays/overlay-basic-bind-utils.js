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

export function bindCustomerOverlayEventsCore({
  documentObj,
  bindModalDismissFn,
  closeCustomerModalFn,
  saveCustomerFromModalFn,
  state,
  placeholderImage = ""
} = {}) {
  const doc = documentObj || null;
  const bindModalDismiss = typeof bindModalDismissFn === "function"
    ? bindModalDismissFn
    : null;
  if (!doc || !bindModalDismiss) return;
  const closeCustomerModal = typeof closeCustomerModalFn === "function"
    ? closeCustomerModalFn
    : (() => {});
  const saveCustomerFromModal = typeof saveCustomerFromModalFn === "function"
    ? saveCustomerFromModalFn
    : null;
  const customerOverlay = doc.getElementById("customerModalOverlay");
  const customerClose = doc.getElementById("customerModalClose");
  const customerSave = doc.getElementById("customerModalSave");
  const customerLogoTrigger = doc.getElementById("customerLogoTrigger");
  const customerLogoInput = doc.getElementById("customerLogoInput");
  const customerLogoUrl = doc.getElementById("customerLogoUrl");
  const customerHeaderLogoTrigger = doc.getElementById("customerHeaderLogoTrigger");
  const customerHeaderLogoInput = doc.getElementById("customerHeaderLogoInput");
  const customerHeaderLogoUrl = doc.getElementById("customerHeaderLogoUrl");

  bindModalDismiss(customerOverlay, closeCustomerModal, { selfOnly: true });
  bindModalDismiss(customerClose, closeCustomerModal);
  if (customerSave) {
    customerSave.addEventListener("click", () => {
      if (state?.customerModal?.loading) return;
      if (!saveCustomerFromModal) return;
      void saveCustomerFromModal();
    });
  }
  if (customerLogoTrigger && customerLogoInput) {
    customerLogoTrigger.addEventListener("click", () => customerLogoInput.click());
  }
  if (customerLogoInput) {
    customerLogoInput.addEventListener("change", (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      state.customerModal.logoFile = file;
      const reader = new FileReader();
      reader.onloadend = () => {
        const preview = String(reader.result || "");
        state.customerModal.logoPreview = preview;
        const img = doc.getElementById("customerLogoPreview");
        if (img && preview) img.setAttribute("src", preview);
      };
      reader.readAsDataURL(file);
    });
  }
  if (customerLogoUrl) {
    customerLogoUrl.addEventListener("input", () => {
      const val = customerLogoUrl.value.trim();
      const img = doc.getElementById("customerLogoPreview");
      if (img) img.setAttribute("src", val || placeholderImage);
    });
  }
  if (customerHeaderLogoTrigger && customerHeaderLogoInput) {
    customerHeaderLogoTrigger.addEventListener("click", () => customerHeaderLogoInput.click());
  }
  if (customerHeaderLogoInput) {
    customerHeaderLogoInput.addEventListener("change", (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      state.customerModal.headerLogoFile = file;
      const reader = new FileReader();
      reader.onloadend = () => {
        const preview = String(reader.result || "");
        state.customerModal.headerLogoPreview = preview;
        const img = doc.getElementById("customerHeaderLogoPreview");
        if (img && preview) img.setAttribute("src", preview);
      };
      reader.readAsDataURL(file);
    });
  }
  if (customerHeaderLogoUrl) {
    customerHeaderLogoUrl.addEventListener("input", () => {
      const val = customerHeaderLogoUrl.value.trim();
      const img = doc.getElementById("customerHeaderLogoPreview");
      if (img) img.setAttribute("src", val || placeholderImage);
    });
  }
}
