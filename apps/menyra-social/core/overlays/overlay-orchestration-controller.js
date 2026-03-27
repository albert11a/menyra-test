export function createOverlayOrchestrationController({
  state = null,
  getDocumentObjFn = () => (typeof document === "undefined" ? null : document),
  getWindowObjFn = () => (typeof window === "undefined" ? null : window),
  getOverlayCacheFn = () => null,
  isModalEscapeBoundFn = () => false,
  setModalEscapeBoundFn = () => {},
  isMenuDetailCloseBoundFn = () => false,
  setMenuDetailCloseBoundFn = () => {},
  getLastMenuOpenGestureKeyFn = () => "",
  setLastMenuOpenGestureKeyFn = () => {},
  getLastMenuOpenGestureAtFn = () => 0,
  setLastMenuOpenGestureAtFn = () => {},
  setPendingCommentHighlightFn = () => {},
  openGuestAuthPromptFn = () => false,
  normalizeChatOpenProfileCoreFn = () => null,
  normalizeHandleFn = (value) => value,
  upsertChatThreadFn = () => {},
  markChatThreadAsReadFn = () => [],
  buildChatModalStateOnOpenCoreFn = (currentChatModal) => currentChatModal,
  getChatThreadIdFn = () => "",
  syncChatThreadSummaryFn = () => {},
  syncRemoteChatReadStateFn = async () => {},
  startActiveChatMessagesListenerFn = () => {},
  stopActiveChatMessagesListenerFn = () => {},
  buildClosedChatModalStateCoreFn = (currentChatModal) => currentChatModal,
  renderFn = () => {},
  ensurePostMetaFn = () => {},
  attachPostMetaListenersFn = () => {},
  loadPostMetaFromFirebaseFn = async () => {},
  updatePostModalMetaFn = () => {},
  stopPostMetaListenersFn = () => {},
  getFocusItemCropFn = () => ({ x: 50, y: 50 }),
  isCeoUserFn = () => false,
  createLeadDraftStateFn = () => ({}),
  resetLeadDraftFn = () => {},
  getMenuItemImagesFn = () => [],
  getMenuItemCropFn = () => ({ x: 50, y: 50 }),
  createEmptyMenuDetailStateFn = () => ({}),
  attachMenuItemMetaListenersFn = () => {},
  loadMenuItemMetaFromFirebaseFn = async () => {},
  updateMenuDetailMetaFn = () => {},
  stopMenuItemMetaListenersFn = () => {},
  ensureOverlayRootCoreFn = () => null,
  ensureModalEscapeHandlerCoreFn = () => {},
  syncModalOpenUiStateCoreFn = () => {},
  renderOverlaysCoreFn = () => null,
  renderProfileModalFn = () => "",
  renderChatModalFn = () => "",
  renderPostModalFn = () => "",
  renderLikesModalFn = () => "",
  renderMenuItemModalFn = () => "",
  renderMenuDetailModalFn = () => "",
  renderFocusModalFn = () => "",
  renderLeadModalFn = () => "",
  renderCustomerModalFn = () => "",
  bindOverlayEventsCoreFn = () => null,
  bindProfileOverlayEventsCoreFn = () => {},
  bindChatOverlayEventsCoreFn = () => {},
  bindPostOverlayEventsCoreFn = () => {},
  bindLikesOverlayEventsCoreFn = () => {},
  bindMenuOverlayEventsCoreFn = () => {},
  bindMenuDetailOverlayEventsCoreFn = () => {},
  bindFocusOverlayEventsCoreFn = () => {},
  bindLeadOverlayEventsCoreFn = () => {},
  bindCustomerOverlayEventsCoreFn = () => {},
  toggleFollowFn = () => {},
  sendChatMessageFn = () => {},
  scrollChatMessagesToBottomFn = () => {},
  queueMicrotaskFn = (fn) => fn?.(),
  togglePostLikeFn = () => {},
  loadPostLikesForModalFn = () => {},
  addCommentFn = () => {},
  toggleCommentLikeFn = () => {},
  saveMenuItemFromModalFn = () => {},
  syncMenuModalCropPreviewFn = () => {},
  clampCropPercentFn = (value) => value,
  getMenuDetailCatalogProfileFn = () => null,
  canAddToShopCartFn = () => false,
  addMenuItemToShopCartFn = () => {},
  showPublicProfileFn = () => {},
  setStateFn = () => {},
  toggleMenuItemLikeFn = () => {},
  autosizeTextareaFn = () => {},
  addMenuItemCommentFn = () => {},
  applyCommentAvatarCacheFn = () => {},
  saveFocusItemFromModalFn = () => {},
  syncFocusModalCropPreviewFn = () => {},
  saveLeadFromModalFn = () => {},
  convertLeadToCustomerFn = () => {},
  addLeadModalLocationRowFn = () => {},
  removeLeadModalLocationRowFn = () => {},
  syncLeadModalDraftFromFormFn = () => {},
  openLocationPickerFn = () => {},
  normalizeLeadLocationsFn = () => [],
  createLeadLocationFn = () => ({ address: "", lat: null, lng: null }),
  parseCoordsFromAddressInputFn = () => null,
  getLeadPlusCodeReferenceFn = () => null,
  hasLeadLocationCoordsFn = () => false,
  getPrimaryLeadLocationFn = () => null,
  refineLeadLocationAddressIndexFn = async () => {},
  saveCustomerFromModalFn = () => {},
  bindImageFallbacksFn = () => {},
  placeholderImage = ""
} = {}) {
  if (!state) {
    return {
      openChatWithProfile: () => {},
      closeChatModal: () => {},
      closeProfileModal: () => {},
      closeLikesModal: () => {},
      closeActiveModal: () => false,
      isAnyModalOpen: () => false,
      openPostModal: async () => {},
      closePostModal: () => {},
      openFocusModal: () => {},
      closeFocusModal: () => {},
      openLeadModal: () => {},
      closeLeadModal: () => {},
      openCustomerModal: () => {},
      closeCustomerModal: () => {},
      openMenuModal: () => {},
      closeMenuModal: () => {},
      openMenuDetail: async () => {},
      closeMenuDetail: () => {},
      setMenuDetailIndex: () => {},
      setMenuDetailVariant: () => {},
      openMenuDetailFromTrigger: () => {},
      triggerMenuDetailOpenFromGesture: () => {},
      ensureOverlayRoot: () => null,
      ensureModalEscapeHandler: () => {},
      syncModalOpenUiState: () => {},
      renderOverlays: () => null,
      bindModalDismiss: () => {},
      bindOverlayEvents: () => null
    };
  }

  function openChatWithProfile(profile) {
    if (!profile) return;
    if (!state.user) {
      openGuestAuthPromptFn("Bitte einloggen, um Chats zu nutzen.");
      return;
    }
    const nextProfile = normalizeChatOpenProfileCoreFn({
      profile,
      normalizeHandle: (value) => normalizeHandleFn(value)
    });
    if (!nextProfile) return;
    upsertChatThreadFn(nextProfile);
    state.drawerOpen = false;
    state.chatSettingsOpen = false;
    state.chatThreadMenuId = "";
    state.profileModal = { open: false, profile: null };
    state.activeTab = "chat";
    const nextMessages = markChatThreadAsReadFn(nextProfile);
    state.chatModal = buildChatModalStateOnOpenCoreFn({
      currentChatModal: state.chatModal,
      nextProfile,
      nextMessages,
      getChatThreadId: (value) => getChatThreadIdFn(value)
    });
    syncChatThreadSummaryFn(nextProfile, state.chatModal.messages);
    void syncRemoteChatReadStateFn(nextProfile, state.chatModal.messages);
    startActiveChatMessagesListenerFn(nextProfile);
    renderFn();
  }

  function closeChatModal() {
    const doc = getDocumentObjFn();
    if (doc && doc.activeElement instanceof HTMLElement) {
      doc.activeElement.blur();
    }
    stopActiveChatMessagesListenerFn();
    state.chatSettingsOpen = false;
    state.chatThreadMenuId = "";
    state.chatModal = buildClosedChatModalStateCoreFn(state.chatModal);
    if (state.activeTab === "chat") {
      renderFn();
    }
  }

  function closeProfileModal() {
    state.profileModal = { open: false, profile: null };
    renderOverlays();
  }

  function closeLikesModal() {
    state.likesModal = { open: false, postId: "", animate: false };
    renderOverlays({ updateLikes: true });
  }

  function closeActiveModal() {
    if (state.likesModal.open) {
      closeLikesModal();
      return true;
    }
    if (state.menuDetail.open) {
      closeMenuDetail();
      return true;
    }
    if (state.menuModal.open) {
      closeMenuModal();
      return true;
    }
    if (state.focusModal.open) {
      closeFocusModal();
      return true;
    }
    if (state.customerModal.open) {
      closeCustomerModal();
      return true;
    }
    if (state.leadModal.open) {
      closeLeadModal();
      return true;
    }
    if (state.postModal.open) {
      closePostModal();
      return true;
    }
    if (state.profileModal.open) {
      closeProfileModal();
      return true;
    }
    return false;
  }

  function isAnyModalOpen() {
    return !!(
      state.profileModal.open
      || state.postModal.open
      || state.likesModal.open
      || state.menuModal.open
      || state.menuDetail.open
      || state.focusModal.open
      || state.leadModal.open
      || state.customerModal.open
    );
  }

  async function openPostModal(post) {
    if (!post) return;
    ensurePostMetaFn(post.id);
    state.profileModal = { open: false, profile: null };
    state.postModal = {
      open: true,
      post,
      commentText: "",
      replyTo: null,
      loading: true,
      animate: true,
      sending: false
    };
    renderOverlays();
    state.postModal.animate = false;
    attachPostMetaListenersFn(post);
    void loadPostMetaFromFirebaseFn(post).then(() => {
      if (state.postModal.open && state.postModal.post && String(state.postModal.post.id) === String(post.id)) {
        updatePostModalMetaFn();
      }
    });
    state.postModal.loading = false;
    updatePostModalMetaFn();
  }

  function closePostModal() {
    state.postModal = { open: false, post: null, commentText: "", replyTo: null, loading: false, animate: false, sending: false };
    state.likesModal = { open: false, postId: "", animate: false };
    setPendingCommentHighlightFn("");
    stopPostMetaListenersFn();
    renderOverlays();
  }

  function openFocusModal(mode = "create", item = null) {
    const crop = getFocusItemCropFn(item);
    state.focusModal = {
      open: true,
      mode,
      item,
      status: "",
      loading: false,
      cropX: crop.x,
      cropY: crop.y,
      imageFile: null,
      imagePreview: ""
    };
    renderOverlays({ updateFocus: true });
  }

  function closeFocusModal() {
    state.focusModal = {
      open: false,
      mode: "create",
      item: null,
      status: "",
      loading: false,
      cropX: 50,
      cropY: 50,
      imageFile: null,
      imagePreview: ""
    };
    renderOverlays({ updateFocus: true });
  }

  function openLeadModal(mode = "create", lead = null) {
    if (!isCeoUserFn()) return;
    if (mode === "edit") {
      state.leads.view = "create";
      state.leads.settingsStatus = "";
      state.leadModal = createLeadDraftStateFn("edit", lead);
      renderFn();
      return;
    }
    state.leadModal = {
      ...createLeadDraftStateFn(mode, lead),
      open: true
    };
    renderOverlays({ updateLead: true });
  }

  function closeLeadModal() {
    const doc = getDocumentObjFn();
    if (doc && doc.activeElement instanceof HTMLElement) {
      doc.activeElement.blur();
    }
    resetLeadDraftFn();
    syncModalOpenUiState();
    renderOverlays({ updateLead: true });
  }

  function openCustomerModal(customer) {
    if (!isCeoUserFn() || !customer) return;
    state.customerModal = {
      open: true,
      mode: "edit",
      customer,
      status: "",
      loading: false,
      logoFile: null,
      logoPreview: customer.logoUrl || customer.logo || ""
    };
    renderOverlays({ updateCustomer: true });
  }

  function closeCustomerModal() {
    const doc = getDocumentObjFn();
    if (doc && doc.activeElement instanceof HTMLElement) {
      doc.activeElement.blur();
    }
    state.customerModal = {
      open: false,
      mode: "edit",
      customer: null,
      status: "",
      loading: false,
      logoFile: null,
      logoPreview: ""
    };
    syncModalOpenUiState();
    renderOverlays({ updateCustomer: true });
  }

  function openMenuModal(mode = "create", item = null) {
    const existingImages = getMenuItemImagesFn(item).filter(Boolean);
    const uniqImages = Array.from(new Set(existingImages));
    const crop = getMenuItemCropFn(item);
    state.menuModal = {
      open: true,
      mode,
      item,
      status: "",
      loading: false,
      imageUrlDraft: "",
      cropX: crop.x,
      cropY: crop.y,
      imageFiles: [],
      imagePreviews: [],
      existingImages: uniqImages
    };
    renderOverlays({ updateMenu: true });
  }

  function closeMenuModal() {
    state.menuModal = {
      open: false,
      mode: "create",
      item: null,
      status: "",
      loading: false,
      imageUrlDraft: "",
      cropX: 50,
      cropY: 50,
      imageFiles: [],
      imagePreviews: [],
      existingImages: []
    };
    renderOverlays({ updateMenu: true });
  }

  async function openMenuDetail(item, restaurantIdOverride = "", options = {}) {
    if (!item) return;
    stopMenuItemMetaListenersFn();
    const previewImageSrc = String(options?.previewImageSrc || "").trim();
    const restaurantId = String(
      restaurantIdOverride
      || item?.restaurantId
      || state.menu.restaurantId
      || state.profileView?.profile?.restaurantId
      || state.userProfile.restaurantId
      || ""
    ).trim();
    state.menuDetail = {
      open: true,
      item,
      index: 0,
      restaurantId,
      selectedSize: Array.isArray(item?.sizes) && item.sizes.length ? String(item.sizes[0]) : "",
      selectedColor: Array.isArray(item?.colors) && item.colors.length ? String(item.colors[0]) : "",
      infoTab: "info",
      footerView: "cart",
      commentText: "",
      previewImageSrc,
      loading: true,
      sending: false
    };
    renderOverlays({ updateMenuDetail: true });
    if (!restaurantId) {
      state.menuDetail.loading = false;
      updateMenuDetailMetaFn();
      return;
    }
    attachMenuItemMetaListenersFn(item, restaurantId);
    void loadMenuItemMetaFromFirebaseFn(item, restaurantId).then(() => {
      if (state.menuDetail.open && state.menuDetail.item && String(state.menuDetail.item.id || "") === String(item.id || "")) {
        updateMenuDetailMetaFn();
      }
    });
    state.menuDetail.loading = false;
    updateMenuDetailMetaFn();
  }

  function closeMenuDetail({ afterClose = null } = {}) {
    stopMenuItemMetaListenersFn();
    state.menuDetail = createEmptyMenuDetailStateFn();
    renderOverlays({ updateMenuDetail: true });
    if (typeof afterClose === "function") afterClose();
  }

  function setMenuDetailIndex(nextIndex) {
    if (!state.menuDetail.open || !state.menuDetail.item) return;
    const images = getMenuItemImagesFn(state.menuDetail.item);
    if (!images.length) return;
    const max = images.length;
    let idx = Number(nextIndex);
    if (!Number.isFinite(idx)) idx = 0;
    if (idx < 0) idx = max - 1;
    if (idx >= max) idx = 0;
    if (idx === state.menuDetail.index) return;
    state.menuDetail.index = idx;
    renderOverlays({ updateMenuDetail: true });
  }

  function setMenuDetailVariant(field, value) {
    if (!state.menuDetail.open) return;
    if (field !== "size" && field !== "color") return;
    const key = field === "size" ? "selectedSize" : "selectedColor";
    state.menuDetail[key] = String(value || "").trim();
  }

  function openMenuDetailFromTrigger(trigger) {
    const itemId = trigger?.dataset?.menuOpen || "";
    if (!itemId) return;
    const previewImage = trigger?.querySelector?.("img");
    const previewImageSrc = String(
      previewImage?.currentSrc
      || previewImage?.getAttribute?.("src")
      || ""
    ).trim();
    const safePreviewImageSrc = previewImageSrc.toLowerCase().startsWith("data:image/svg+xml")
      ? ""
      : previewImageSrc;
    const source = trigger?.dataset?.menuOpenSource || "menu";
    const sourceItems = source === "favorites"
      ? (Array.isArray(state.favoriteMenuItems?.items) ? state.favoriteMenuItems.items : [])
      : (state.menu.items || []);
    const item = sourceItems.find((it) => String(it.id) === String(itemId));
    if (!item) return;
    const detailItem = source === "favorites"
      ? {
        ...item,
        catalogMode: "shop",
        restaurantType: item.restaurantType || item.customerType || "ecommerce",
        customerType: item.customerType || item.restaurantType || "ecommerce"
      }
      : item;
    void openMenuDetail(
      detailItem,
      trigger?.dataset?.menuOpenRestaurant
        || item.restaurantId
        || state.menu.restaurantId
        || state.profileView?.profile?.restaurantId
        || state.userProfile.restaurantId
        || "",
      {
        previewImageSrc: safePreviewImageSrc
      }
    );
  }

  function triggerMenuDetailOpenFromGesture(trigger) {
    const key = [
      trigger?.dataset?.menuOpenSource || "menu",
      trigger?.dataset?.menuOpenRestaurant || "",
      trigger?.dataset?.menuOpen || ""
    ].join("::");
    const now = Date.now();
    if (key && key === getLastMenuOpenGestureKeyFn() && now - getLastMenuOpenGestureAtFn() < 700) return;
    setLastMenuOpenGestureKeyFn(key);
    setLastMenuOpenGestureAtFn(now);
    openMenuDetailFromTrigger(trigger);
  }

  function ensureOverlayRoot() {
    return ensureOverlayRootCoreFn({
      documentObj: getDocumentObjFn()
    });
  }

  function ensureModalEscapeHandler() {
    return ensureModalEscapeHandlerCoreFn({
      documentObj: getDocumentObjFn(),
      isBound: isModalEscapeBoundFn(),
      setBoundFn: (value) => {
        setModalEscapeBoundFn(!!value);
      },
      closeActiveModalFn: closeActiveModal
    });
  }

  function syncModalOpenUiState() {
    return syncModalOpenUiStateCoreFn({
      documentObj: getDocumentObjFn(),
      windowObj: getWindowObjFn(),
      isAnyModalOpenFn: isAnyModalOpen,
      ensureModalEscapeHandlerFn: ensureModalEscapeHandler
    });
  }

  function renderOverlays(options = {}) {
    return renderOverlaysCoreFn({
      options,
      state,
      documentObj: getDocumentObjFn(),
      windowObj: getWindowObjFn(),
      ensureOverlayRootFn: ensureOverlayRoot,
      renderProfileModalFn,
      renderChatModalFn,
      renderPostModalFn,
      renderLikesModalFn,
      renderMenuItemModalFn,
      renderMenuDetailModalFn,
      renderFocusModalFn,
      renderLeadModalFn,
      renderCustomerModalFn,
      overlayCache: getOverlayCacheFn(),
      syncModalOpenUiStateFn: syncModalOpenUiState,
      bindOverlayEventsFn: bindOverlayEvents
    });
  }

  function bindModalDismiss(target, handler, { selfOnly = false } = {}) {
    if (!target || typeof handler !== "function") return;
    const onDismiss = (evt) => {
      if (selfOnly && evt.target !== target) return;
      if (evt.type === "touchstart") evt.preventDefault();
      handler();
    };
    target.addEventListener("click", onDismiss);
    target.addEventListener("pointerdown", onDismiss);
    target.addEventListener("touchstart", onDismiss, { passive: false });
  }

  function bindOverlayEvents({
    profileChanged = true,
    chatChanged = true,
    postChanged = true,
    likesChanged = true,
    menuChanged = true,
    menuDetailChanged = true,
    focusChanged = true,
    leadChanged = true,
    customerChanged = true
  } = {}) {
    return bindOverlayEventsCoreFn({
      profileChanged,
      chatChanged,
      postChanged,
      likesChanged,
      menuChanged,
      menuDetailChanged,
      focusChanged,
      leadChanged,
      customerChanged,
      documentObj: getDocumentObjFn(),
      windowObj: getWindowObjFn(),
      isMenuDetailCloseBoundFn: () => isMenuDetailCloseBoundFn(),
      setMenuDetailCloseBoundFn: (next) => {
        setMenuDetailCloseBoundFn(!!next);
      },
      state,
      bindProfileOverlayEventsFn: bindProfileOverlayEventsCoreFn,
      bindChatOverlayEventsFn: bindChatOverlayEventsCoreFn,
      bindPostOverlayEventsFn: bindPostOverlayEventsCoreFn,
      bindLikesOverlayEventsFn: bindLikesOverlayEventsCoreFn,
      bindMenuOverlayEventsFn: bindMenuOverlayEventsCoreFn,
      bindMenuDetailOverlayEventsFn: bindMenuDetailOverlayEventsCoreFn,
      bindFocusOverlayEventsFn: bindFocusOverlayEventsCoreFn,
      bindLeadOverlayEventsFn: bindLeadOverlayEventsCoreFn,
      bindCustomerOverlayEventsFn: bindCustomerOverlayEventsCoreFn,
      bindModalDismissFn: bindModalDismiss,
      closeMenuDetailFn: closeMenuDetail,
      closeProfileModalFn: closeProfileModal,
      openChatWithProfileFn: openChatWithProfile,
      toggleFollowFn,
      renderFn,
      closeChatModalFn: closeChatModal,
      sendChatMessageFn,
      scrollChatMessagesToBottomFn,
      queueMicrotaskFn: (fn) => queueMicrotaskFn(fn),
      closePostModalFn: closePostModal,
      togglePostLikeFn,
      renderOverlaysFn: renderOverlays,
      loadPostLikesForModalFn,
      addCommentFn,
      toggleCommentLikeFn,
      closeLikesModalFn: closeLikesModal,
      closeMenuModalFn: closeMenuModal,
      saveMenuItemFromModalFn,
      syncMenuModalCropPreviewFn,
      clampCropPercentFn,
      getMenuDetailCatalogProfileFn,
      canAddToShopCartFn,
      addMenuItemToShopCartFn,
      showPublicProfileFn,
      setStateFn,
      openGuestAuthPromptFn,
      toggleMenuItemLikeFn,
      setMenuDetailVariantFn: setMenuDetailVariant,
      autosizeTextareaFn,
      addMenuItemCommentFn,
      applyCommentAvatarCacheFn,
      setMenuDetailIndexFn: setMenuDetailIndex,
      closeFocusModalFn: closeFocusModal,
      saveFocusItemFromModalFn,
      syncFocusModalCropPreviewFn,
      closeLeadModalFn: closeLeadModal,
      saveLeadFromModalFn,
      convertLeadToCustomerFn,
      addLeadModalLocationRowFn,
      removeLeadModalLocationRowFn,
      syncLeadModalDraftFromFormFn,
      openLocationPickerFn,
      normalizeLeadLocationsFn,
      createLeadLocationFn,
      parseCoordsFromAddressInputFn,
      getLeadPlusCodeReferenceFn,
      hasLeadLocationCoordsFn,
      getPrimaryLeadLocationFn,
      refineLeadLocationAddressIndexFn,
      closeCustomerModalFn: closeCustomerModal,
      saveCustomerFromModalFn,
      bindImageFallbacksFn,
      placeholderImage
    });
  }

  return {
    openChatWithProfile,
    closeChatModal,
    closeProfileModal,
    closeLikesModal,
    closeActiveModal,
    isAnyModalOpen,
    openPostModal,
    closePostModal,
    openFocusModal,
    closeFocusModal,
    openLeadModal,
    closeLeadModal,
    openCustomerModal,
    closeCustomerModal,
    openMenuModal,
    closeMenuModal,
    openMenuDetail,
    closeMenuDetail,
    setMenuDetailIndex,
    setMenuDetailVariant,
    openMenuDetailFromTrigger,
    triggerMenuDetailOpenFromGesture,
    ensureOverlayRoot,
    ensureModalEscapeHandler,
    syncModalOpenUiState,
    renderOverlays,
    bindModalDismiss,
    bindOverlayEvents
  };
}
