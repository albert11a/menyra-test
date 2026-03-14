export function bindOverlayEventsCore({
  profileChanged = true,
  chatChanged = true,
  postChanged = true,
  likesChanged = true,
  menuChanged = true,
  menuDetailChanged = true,
  focusChanged = true,
  leadChanged = true,
  customerChanged = true,
  documentObj,
  windowObj,
  isMenuDetailCloseBoundFn,
  setMenuDetailCloseBoundFn,
  state,
  bindProfileOverlayEventsFn,
  bindChatOverlayEventsFn,
  bindPostOverlayEventsFn,
  bindLikesOverlayEventsFn,
  bindMenuOverlayEventsFn,
  bindMenuDetailOverlayEventsFn,
  bindFocusOverlayEventsFn,
  bindLeadOverlayEventsFn,
  bindCustomerOverlayEventsFn,
  bindModalDismissFn,
  closeMenuDetailFn,
  closeProfileModalFn,
  openChatWithProfileFn,
  toggleFollowFn,
  renderFn,
  closeChatModalFn,
  sendChatMessageFn,
  scrollChatMessagesToBottomFn,
  queueMicrotaskFn,
  closePostModalFn,
  togglePostLikeFn,
  renderOverlaysFn,
  loadPostLikesForModalFn,
  addCommentFn,
  toggleCommentLikeFn,
  closeLikesModalFn,
  closeMenuModalFn,
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
  setMenuDetailVariantFn,
  autosizeTextareaFn,
  addMenuItemCommentFn,
  applyCommentAvatarCacheFn,
  setMenuDetailIndexFn,
  closeFocusModalFn,
  saveFocusItemFromModalFn,
  syncFocusModalCropPreviewFn,
  closeLeadModalFn,
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
  closeCustomerModalFn,
  saveCustomerFromModalFn,
  bindImageFallbacksFn,
  placeholderImage = ""
} = {}) {
  const doc = documentObj || (typeof document !== "undefined" ? document : null);
  const win = windowObj || (typeof window !== "undefined" ? window : null);
  const isMenuDetailCloseBound = typeof isMenuDetailCloseBoundFn === "function"
    ? isMenuDetailCloseBoundFn
    : (() => false);
  const setMenuDetailCloseBound = typeof setMenuDetailCloseBoundFn === "function"
    ? setMenuDetailCloseBoundFn
    : (() => {});
  const bindProfileOverlayEvents = typeof bindProfileOverlayEventsFn === "function" ? bindProfileOverlayEventsFn : (() => {});
  const bindChatOverlayEvents = typeof bindChatOverlayEventsFn === "function" ? bindChatOverlayEventsFn : (() => {});
  const bindPostOverlayEvents = typeof bindPostOverlayEventsFn === "function" ? bindPostOverlayEventsFn : (() => {});
  const bindLikesOverlayEvents = typeof bindLikesOverlayEventsFn === "function" ? bindLikesOverlayEventsFn : (() => {});
  const bindMenuOverlayEvents = typeof bindMenuOverlayEventsFn === "function" ? bindMenuOverlayEventsFn : (() => {});
  const bindMenuDetailOverlayEvents = typeof bindMenuDetailOverlayEventsFn === "function" ? bindMenuDetailOverlayEventsFn : (() => {});
  const bindFocusOverlayEvents = typeof bindFocusOverlayEventsFn === "function" ? bindFocusOverlayEventsFn : (() => {});
  const bindLeadOverlayEvents = typeof bindLeadOverlayEventsFn === "function" ? bindLeadOverlayEventsFn : (() => {});
  const bindCustomerOverlayEvents = typeof bindCustomerOverlayEventsFn === "function" ? bindCustomerOverlayEventsFn : (() => {});
  const bindImageFallbacks = typeof bindImageFallbacksFn === "function" ? bindImageFallbacksFn : (() => {});
  const bindModalDismiss = typeof bindModalDismissFn === "function" ? bindModalDismissFn : null;
  const closeMenuDetail = typeof closeMenuDetailFn === "function" ? closeMenuDetailFn : (() => {});
  const closeProfileModal = typeof closeProfileModalFn === "function" ? closeProfileModalFn : (() => {});
  const openChatWithProfile = typeof openChatWithProfileFn === "function" ? openChatWithProfileFn : (() => {});
  const toggleFollow = typeof toggleFollowFn === "function" ? toggleFollowFn : (() => {});
  const rerender = typeof renderFn === "function" ? renderFn : (() => {});
  const closeChatModal = typeof closeChatModalFn === "function" ? closeChatModalFn : (() => {});
  const sendChatMessage = typeof sendChatMessageFn === "function" ? sendChatMessageFn : (() => {});
  const scrollChatMessagesToBottom = typeof scrollChatMessagesToBottomFn === "function"
    ? scrollChatMessagesToBottomFn
    : (() => {});
  const queueMicrotaskSafe = typeof queueMicrotaskFn === "function" ? queueMicrotaskFn : ((fn) => fn?.());
  const closePostModal = typeof closePostModalFn === "function" ? closePostModalFn : (() => {});
  const togglePostLike = typeof togglePostLikeFn === "function" ? togglePostLikeFn : (() => {});
  const renderOverlays = typeof renderOverlaysFn === "function" ? renderOverlaysFn : (() => {});
  const loadPostLikesForModal = typeof loadPostLikesForModalFn === "function" ? loadPostLikesForModalFn : (() => {});
  const addComment = typeof addCommentFn === "function" ? addCommentFn : (() => {});
  const toggleCommentLike = typeof toggleCommentLikeFn === "function" ? toggleCommentLikeFn : (() => {});
  const closeLikesModal = typeof closeLikesModalFn === "function" ? closeLikesModalFn : (() => {});
  const closeMenuModal = typeof closeMenuModalFn === "function" ? closeMenuModalFn : (() => {});
  const saveMenuItemFromModal = typeof saveMenuItemFromModalFn === "function" ? saveMenuItemFromModalFn : (() => {});
  const syncMenuModalCropPreview = typeof syncMenuModalCropPreviewFn === "function" ? syncMenuModalCropPreviewFn : (() => {});
  const clampCropPercent = typeof clampCropPercentFn === "function" ? clampCropPercentFn : ((value) => value);
  const getMenuDetailCatalogProfile = typeof getMenuDetailCatalogProfileFn === "function" ? getMenuDetailCatalogProfileFn : (() => null);
  const canAddToShopCart = typeof canAddToShopCartFn === "function" ? canAddToShopCartFn : (() => false);
  const addMenuItemToShopCart = typeof addMenuItemToShopCartFn === "function" ? addMenuItemToShopCartFn : (() => {});
  const showPublicProfile = typeof showPublicProfileFn === "function" ? showPublicProfileFn : (() => {});
  const setState = typeof setStateFn === "function" ? setStateFn : (() => {});
  const openGuestAuthPrompt = typeof openGuestAuthPromptFn === "function" ? openGuestAuthPromptFn : (() => {});
  const toggleMenuItemLike = typeof toggleMenuItemLikeFn === "function" ? toggleMenuItemLikeFn : (() => {});
  const setMenuDetailVariant = typeof setMenuDetailVariantFn === "function" ? setMenuDetailVariantFn : (() => {});
  const autosizeTextarea = typeof autosizeTextareaFn === "function" ? autosizeTextareaFn : (() => {});
  const addMenuItemComment = typeof addMenuItemCommentFn === "function" ? addMenuItemCommentFn : (() => {});
  const applyCommentAvatarCache = typeof applyCommentAvatarCacheFn === "function" ? applyCommentAvatarCacheFn : (() => {});
  const setMenuDetailIndex = typeof setMenuDetailIndexFn === "function" ? setMenuDetailIndexFn : (() => {});
  const closeFocusModal = typeof closeFocusModalFn === "function" ? closeFocusModalFn : (() => {});
  const saveFocusItemFromModal = typeof saveFocusItemFromModalFn === "function" ? saveFocusItemFromModalFn : (() => {});
  const syncFocusModalCropPreview = typeof syncFocusModalCropPreviewFn === "function" ? syncFocusModalCropPreviewFn : (() => {});
  const closeLeadModal = typeof closeLeadModalFn === "function" ? closeLeadModalFn : (() => {});
  const saveLeadFromModal = typeof saveLeadFromModalFn === "function" ? saveLeadFromModalFn : (() => {});
  const convertLeadToCustomer = typeof convertLeadToCustomerFn === "function" ? convertLeadToCustomerFn : (() => {});
  const addLeadModalLocationRow = typeof addLeadModalLocationRowFn === "function" ? addLeadModalLocationRowFn : (() => {});
  const removeLeadModalLocationRow = typeof removeLeadModalLocationRowFn === "function" ? removeLeadModalLocationRowFn : (() => {});
  const syncLeadModalDraftFromForm = typeof syncLeadModalDraftFromFormFn === "function" ? syncLeadModalDraftFromFormFn : (() => {});
  const openLocationPicker = typeof openLocationPickerFn === "function" ? openLocationPickerFn : (() => {});
  const normalizeLeadLocations = typeof normalizeLeadLocationsFn === "function" ? normalizeLeadLocationsFn : (() => []);
  const createLeadLocation = typeof createLeadLocationFn === "function" ? createLeadLocationFn : (() => ({ address: "", lat: null, lng: null }));
  const parseCoordsFromAddressInput = typeof parseCoordsFromAddressInputFn === "function" ? parseCoordsFromAddressInputFn : (() => null);
  const getLeadPlusCodeReference = typeof getLeadPlusCodeReferenceFn === "function" ? getLeadPlusCodeReferenceFn : (() => null);
  const hasLeadLocationCoords = typeof hasLeadLocationCoordsFn === "function" ? hasLeadLocationCoordsFn : (() => false);
  const getPrimaryLeadLocation = typeof getPrimaryLeadLocationFn === "function" ? getPrimaryLeadLocationFn : (() => null);
  const refineLeadLocationAddressIndex = typeof refineLeadLocationAddressIndexFn === "function" ? refineLeadLocationAddressIndexFn : (() => Promise.resolve());
  const closeCustomerModal = typeof closeCustomerModalFn === "function" ? closeCustomerModalFn : (() => {});
  const saveCustomerFromModal = typeof saveCustomerFromModalFn === "function" ? saveCustomerFromModalFn : (() => {});
  if (!doc || !bindModalDismiss) return;

  if (!isMenuDetailCloseBound()) {
    setMenuDetailCloseBound(true);
    const closeHandler = (evt) => {
      const target = evt.target?.closest?.("[data-menu-detail-close]");
      if (!target) return;
      if (!state?.menuDetail?.open) return;
      evt.preventDefault();
      closeMenuDetail();
    };
    doc.addEventListener("click", closeHandler, true);
    doc.addEventListener("pointerdown", closeHandler, true);
    doc.addEventListener("touchstart", closeHandler, { capture: true, passive: false });
  }
  if (profileChanged) {
    bindProfileOverlayEvents({
      documentObj: doc,
      bindModalDismissFn: bindModalDismiss,
      closeProfileModalFn: closeProfileModal,
      openChatWithProfileFn: openChatWithProfile,
      toggleFollowFn: toggleFollow,
      onProfileOpenFn: () => {
        if (!state?.profileModal?.profile) return;
        state.profileView = {
          profile: state.profileModal.profile,
          posts: state.profileModal.profile.posts || []
        };
        state.profileModal = { open: false, profile: null };
        state.activeTab = "profile";
        rerender();
      }
    });
  }

  if (chatChanged) {
    bindChatOverlayEvents({
      documentObj: doc,
      bindModalDismissFn: bindModalDismiss,
      closeChatModalFn: closeChatModal,
      sendChatMessageFn: sendChatMessage,
      scrollChatMessagesToBottomFn: scrollChatMessagesToBottom,
      queueMicrotaskFn: (fn) => queueMicrotaskSafe(fn),
      state
    });
  }

  if (postChanged) {
    bindPostOverlayEvents({
      documentObj: doc,
      windowObj: win,
      bindModalDismissFn: bindModalDismiss,
      closePostModalFn: closePostModal,
      togglePostLikeFn: togglePostLike,
      renderOverlaysFn: renderOverlays,
      loadPostLikesForModalFn: loadPostLikesForModal,
      addCommentFn: addComment,
      toggleCommentLikeFn: toggleCommentLike,
      state
    });
  }

  if (likesChanged) {
    bindLikesOverlayEvents({
      documentObj: doc,
      bindModalDismissFn: bindModalDismiss,
      closeLikesModalFn: closeLikesModal
    });
  }

  if (menuChanged) {
    bindMenuOverlayEvents({
      documentObj: doc,
      bindModalDismissFn: bindModalDismiss,
      closeMenuModalFn: closeMenuModal,
      saveMenuItemFromModalFn: saveMenuItemFromModal,
      renderOverlaysFn: renderOverlays,
      syncMenuModalCropPreviewFn: syncMenuModalCropPreview,
      clampCropPercentFn: clampCropPercent,
      state,
      placeholderImage
    });
  }

  if (menuDetailChanged) {
    bindMenuDetailOverlayEvents({
      documentObj: doc,
      windowObj: win,
      bindModalDismissFn: bindModalDismiss,
      closeMenuDetailFn: closeMenuDetail,
      getMenuDetailCatalogProfileFn: getMenuDetailCatalogProfile,
      canAddToShopCartFn: canAddToShopCart,
      addMenuItemToShopCartFn: addMenuItemToShopCart,
      showPublicProfileFn: showPublicProfile,
      setStateFn: setState,
      openGuestAuthPromptFn: openGuestAuthPrompt,
      toggleMenuItemLikeFn: toggleMenuItemLike,
      setMenuDetailVariantFn: setMenuDetailVariant,
      autosizeTextareaFn: autosizeTextarea,
      addMenuItemCommentFn: addMenuItemComment,
      applyCommentAvatarCacheFn: applyCommentAvatarCache,
      setMenuDetailIndexFn: setMenuDetailIndex,
      state
    });
  }

  if (focusChanged) {
    bindFocusOverlayEvents({
      documentObj: doc,
      bindModalDismissFn: bindModalDismiss,
      closeFocusModalFn: closeFocusModal,
      saveFocusItemFromModalFn: saveFocusItemFromModal,
      renderOverlaysFn: renderOverlays,
      syncFocusModalCropPreviewFn: syncFocusModalCropPreview,
      clampCropPercentFn: clampCropPercent,
      state
    });
  }

  if (leadChanged) {
    bindLeadOverlayEvents({
      documentObj: doc,
      bindModalDismissFn: bindModalDismiss,
      closeLeadModalFn: closeLeadModal,
      saveLeadFromModalFn: saveLeadFromModal,
      convertLeadToCustomerFn: convertLeadToCustomer,
      addLeadModalLocationRowFn: addLeadModalLocationRow,
      removeLeadModalLocationRowFn: removeLeadModalLocationRow,
      syncLeadModalDraftFromFormFn: syncLeadModalDraftFromForm,
      openLocationPickerFn: openLocationPicker,
      normalizeLeadLocationsFn: normalizeLeadLocations,
      createLeadLocationFn: createLeadLocation,
      parseCoordsFromAddressInputFn: parseCoordsFromAddressInput,
      getLeadPlusCodeReferenceFn: getLeadPlusCodeReference,
      hasLeadLocationCoordsFn: hasLeadLocationCoords,
      getPrimaryLeadLocationFn: getPrimaryLeadLocation,
      refineLeadLocationAddressIndexFn: refineLeadLocationAddressIndex,
      renderOverlaysFn: renderOverlays,
      state,
      placeholderImage
    });
  }

  if (customerChanged) {
    bindCustomerOverlayEvents({
      documentObj: doc,
      bindModalDismissFn: bindModalDismiss,
      closeCustomerModalFn: closeCustomerModal,
      saveCustomerFromModalFn: saveCustomerFromModal,
      state,
      placeholderImage
    });
  }

  if (menuChanged || menuDetailChanged || focusChanged || leadChanged || customerChanged) {
    bindImageFallbacks();
  }
}
