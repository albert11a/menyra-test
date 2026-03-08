export function renderOverlaysCore({
  options = {},
  state,
  documentObj,
  windowObj,
  ensureOverlayRootFn,
  renderProfileModalFn,
  renderChatModalFn,
  renderPostModalFn,
  renderLikesModalFn,
  renderMenuItemModalFn,
  renderMenuDetailModalFn,
  renderFocusModalFn,
  renderLeadModalFn,
  renderCustomerModalFn,
  overlayCache,
  syncModalOpenUiStateFn,
  bindOverlayEventsFn
} = {}) {
  const doc = documentObj || null;
  const win = windowObj || null;
  const ensureOverlayRoot = typeof ensureOverlayRootFn === "function" ? ensureOverlayRootFn : null;
  const renderProfileModal = typeof renderProfileModalFn === "function" ? renderProfileModalFn : (() => "");
  const renderChatModal = typeof renderChatModalFn === "function" ? renderChatModalFn : (() => "");
  const renderPostModal = typeof renderPostModalFn === "function" ? renderPostModalFn : (() => "");
  const renderLikesModal = typeof renderLikesModalFn === "function" ? renderLikesModalFn : (() => "");
  const renderMenuItemModal = typeof renderMenuItemModalFn === "function" ? renderMenuItemModalFn : (() => "");
  const renderMenuDetailModal = typeof renderMenuDetailModalFn === "function" ? renderMenuDetailModalFn : (() => "");
  const renderFocusModal = typeof renderFocusModalFn === "function" ? renderFocusModalFn : (() => "");
  const renderLeadModal = typeof renderLeadModalFn === "function" ? renderLeadModalFn : (() => "");
  const renderCustomerModal = typeof renderCustomerModalFn === "function" ? renderCustomerModalFn : (() => "");
  const syncModalOpenUiState = typeof syncModalOpenUiStateFn === "function" ? syncModalOpenUiStateFn : (() => {});
  const bindOverlayEvents = typeof bindOverlayEventsFn === "function" ? bindOverlayEventsFn : (() => {});
  if (!doc || !ensureOverlayRoot || !overlayCache || !state) return;

  const updateProfile = Object.prototype.hasOwnProperty.call(options, "updateProfile")
    ? options.updateProfile
    : !state.likesModal.open;
  const updateChat = Object.prototype.hasOwnProperty.call(options, "updateChat")
    ? options.updateChat
    : false;
  const updatePost = Object.prototype.hasOwnProperty.call(options, "updatePost")
    ? options.updatePost
    : !state.likesModal.open;
  const updateLikes = Object.prototype.hasOwnProperty.call(options, "updateLikes")
    ? options.updateLikes
    : !state.likesModal.open;
  const updateMenu = Object.prototype.hasOwnProperty.call(options, "updateMenu")
    ? options.updateMenu
    : !state.likesModal.open;
  const updateMenuDetail = Object.prototype.hasOwnProperty.call(options, "updateMenuDetail")
    ? options.updateMenuDetail
    : !state.likesModal.open;
  const updateFocus = Object.prototype.hasOwnProperty.call(options, "updateFocus")
    ? options.updateFocus
    : !state.likesModal.open;
  const updateLead = Object.prototype.hasOwnProperty.call(options, "updateLead")
    ? options.updateLead
    : !state.likesModal.open;
  const updateCustomer = Object.prototype.hasOwnProperty.call(options, "updateCustomer")
    ? options.updateCustomer
    : !state.likesModal.open;
  const root = ensureOverlayRoot();
  const profileRoot = doc.getElementById("profileOverlayRoot");
  const chatRoot = doc.getElementById("chatOverlayRoot");
  const postRoot = doc.getElementById("postOverlayRoot");
  const likesRoot = doc.getElementById("likesOverlayRoot");
  const menuRoot = doc.getElementById("menuOverlayRoot");
  const menuDetailRoot = doc.getElementById("menuDetailOverlayRoot");
  const focusRoot = doc.getElementById("focusOverlayRoot");
  const leadRoot = doc.getElementById("leadOverlayRoot");
  const customerRoot = doc.getElementById("customerOverlayRoot");
  let profileChanged = false;
  let chatChanged = false;
  let postChanged = false;
  let likesChanged = false;
  let menuChanged = false;
  let menuDetailChanged = false;
  let focusChanged = false;
  let leadChanged = false;
  let customerChanged = false;

  if (updateProfile) {
    const profileHtml = renderProfileModal();
    profileChanged = profileHtml !== overlayCache.profile;
    if (profileRoot && profileChanged) {
      profileRoot.innerHTML = profileHtml;
      overlayCache.profile = profileHtml;
    }
  }
  if (updateChat) {
    const chatHtml = renderChatModal();
    chatChanged = chatHtml !== overlayCache.chat;
    if (chatRoot && chatChanged) {
      chatRoot.innerHTML = chatHtml;
      overlayCache.chat = chatHtml;
    }
  }
  if (updatePost) {
    const postHtml = renderPostModal();
    postChanged = postHtml !== overlayCache.post;
    if (postRoot && postChanged) {
      postRoot.innerHTML = postHtml;
      overlayCache.post = postHtml;
    }
  }
  if (updateLikes) {
    const likesHtml = renderLikesModal();
    likesChanged = likesHtml !== overlayCache.likes;
    if (likesRoot && likesChanged) {
      likesRoot.innerHTML = likesHtml;
      overlayCache.likes = likesHtml;
    }
  }
  if (updateMenu) {
    const menuHtml = renderMenuItemModal();
    menuChanged = menuHtml !== overlayCache.menu;
    if (menuRoot && menuChanged) {
      menuRoot.innerHTML = menuHtml;
      overlayCache.menu = menuHtml;
    }
  }
  if (updateMenuDetail) {
    const detailHtml = renderMenuDetailModal();
    menuDetailChanged = detailHtml !== overlayCache.menuDetail;
    if (menuDetailRoot && menuDetailChanged) {
      menuDetailRoot.innerHTML = detailHtml;
      overlayCache.menuDetail = detailHtml;
    }
  }
  if (updateFocus) {
    const focusHtml = renderFocusModal();
    focusChanged = focusHtml !== overlayCache.focus;
    if (focusRoot && focusChanged) {
      focusRoot.innerHTML = focusHtml;
      overlayCache.focus = focusHtml;
    }
  }
  if (updateLead) {
    const leadHtml = renderLeadModal();
    leadChanged = leadHtml !== overlayCache.lead;
    if (leadRoot && leadChanged) {
      leadRoot.innerHTML = leadHtml;
      overlayCache.lead = leadHtml;
    }
  }
  if (updateCustomer) {
    const customerHtml = renderCustomerModal();
    customerChanged = customerHtml !== overlayCache.customer;
    if (customerRoot && customerChanged) {
      customerRoot.innerHTML = customerHtml;
      overlayCache.customer = customerHtml;
    }
  }
  syncModalOpenUiState();
  if (win?.lucide?.createIcons && (profileChanged || chatChanged || postChanged || likesChanged || menuChanged || menuDetailChanged || focusChanged || leadChanged || customerChanged)) {
    win.lucide.createIcons();
  }
  bindOverlayEvents({ profileChanged, chatChanged, postChanged, likesChanged, menuChanged, menuDetailChanged, focusChanged, leadChanged, customerChanged });
  return root;
}
