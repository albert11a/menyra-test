export function bindOverlayEventsCore({
  profileChanged = true,
  chatChanged = true,
  postChanged = true,
  likesChanged = true,
  menuChanged = true,
  menuDetailChanged = true,
  focusChanged = true,
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
  if (!doc || !bindModalDismiss) return;
  void isMenuDetailCloseBound;
  void setMenuDetailCloseBound;

  if (profileChanged) {
    bindProfileOverlayEvents({
      documentObj: doc,
      bindModalDismissFn: bindModalDismiss,
      closeProfileModalFn: closeProfileModal,
      openChatWithProfileFn: openChatWithProfile,
      toggleFollowFn: toggleFollow,
      onProfileOpenFn: () => {
        if (!state?.profileModal?.profile) return;
        const profile = state.profileModal.profile;
        showPublicProfile(profile, profile.posts || [], {
          showBack: true,
          topTab: "profile",
          contentTab: "posts"
        });
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
      renderOverlaysFn: renderOverlays,
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

  if (menuChanged || menuDetailChanged || focusChanged) {
    bindImageFallbacks();
  }
}
