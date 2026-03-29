import {
  beginAuthStartupTrace,
  finishAuthStartupTrace,
  markAuthStartupTrace
} from "../auth/auth-startup-trace-utils.js";

export function createAppShellRuntimeController(deps = {}) {
  const {
    state,
    BRAND_UI,
    FAST_MODE,
    appEl,
    PLACEHOLDER_IMAGE,
    documentObj,
    windowObj,
    getRenderSuspended,
    setRenderQueued,
    getLastAppHtml,
    setLastAppHtml,
    getLastRenderMode,
    setLastRenderMode,
    getLastRenderedMainTab,
    setLastRenderedMainTab,
    getCrmAutoLoadObserver,
    setCrmAutoLoadObserver,
    getAuthInitialized,
    getAuthBootstrapSnapshot,
    getUserAvatarCache,
    getProfileMenuBound,
    setProfileMenuBound,
    getProfileViewUnsub,
    setProfileViewUnsub,
    getOptimizedImageUrl,
    isPlaceholderUrl,
    escapeHtml,
    icon,
    isGuestSession,
    getChatUnreadCount,
    resolveHeaderBranding,
    logoFitClass,
    isRestaurantCafeProfile,
    getBusinessCatalogLabel,
    isShopCatalogProfile,
    getCartCountForRestaurant,
    renderAuthScreen,
    sanitizeTabForSession,
    renderMainFn,
    bindFeedDelegationFn,
    updateFeedDomFn,
    focusSearchInputFn,
    focusInputByIdFn,
    captureChatInputFocusStateFn,
    restoreChatInputFocusStateFn,
    renderOverlaysFn,
    updateShellDomFn,
    updateNotificationBadgesFn,
    updateFocusRotationFn,
    initLeafletIfNeededFn,
    updateMapSheetFn,
    cleanupLeafletFn,
    ensureAuthLocalPersistenceFn,
    signInWithEmailAndPasswordFn,
    auth,
    createUserWithEmailAndPasswordFn,
    updateProfileFn,
    setDocFn,
    docFn,
    db,
    normalizeHandleFn,
    serverTimestampFn,
    normalizeLeadScopeKeyFn,
    loadLeadsFn,
    normalizeCustomerScopeKeyFn,
    loadCustomersFn,
    loadCeoStaffFn,
    bindAppEventsMainCoreFn,
    bindAppShellEventsCoreFn,
    setStateFn,
    signOutFn,
    clearAuthBootstrapSnapshotFn,
    safeStorageObj,
    profileKeyFn,
    avatarKeyFn,
    notificationsKeyFn,
    pushSeenKeyFn,
    pushTokenMetaKeyFn,
    followingKeyFn,
    chatIndexKeyFn,
    storageKeys,
    resetUserScopedStateFn,
    openGuestAuthPromptFn,
    normalizeAuthModeFn,
    ensureMenuDataForProfileFn,
    ensureFocusDataForProfileFn,
    bindAppMenuFocusEventsCoreFn,
    saveMenuLayoutToStorageFn,
    openMenuModalFn,
    deleteMenuItemByIdFn,
    triggerMenuDetailOpenFromGestureFn,
    updateShopCartQuantityFn,
    openShopCheckoutFn,
    submitShopCheckoutFn,
    updateShopCheckoutFieldFn,
    saveTableQrConfigFn,
    menuCache,
    menuCacheKeyFn,
    saveMenuStatusBadgeVisibleFn,
    focusCache,
    focusCacheKeyFn,
    saveFocusEnabledFn,
    openFocusModalFn,
    deleteFocusItemByIdFn,
    setFocusIndexFn,
    toggleProfilePostMenuFn,
    toggleProfilePostWidthFn,
    deleteProfilePostFn,
    setProfileMenuOpenFn,
    mapLocateFn,
    bindNotificationsDelegationFn,
    bindAppSettingsProfileEventsCoreFn,
    saveAccountSettingsFn,
    openLocationPickerFn,
    clearVerifiedMapLocationFn,
    syncNotificationsPushRuntimeFn,
    saveSettingsFn,
    disablePushDeviceRegistrationFn,
    getPushActivationIssueMessageFn,
    saveUserProfileToStorageFn,
    persistPrivateAccountSettingFn,
    uploadAvatarFn,
    openProfileViewFromBusinessFn,
    findPostByIdFn,
    openPostModalFn,
    toggleFollowFn,
    alertFn,
    bindAppChatUploadEventsCoreFn,
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
    handleUploadPostFn,
    bindCrmStaffEventsCoreFn,
    openLeadCreatorFn,
    openLeadSettingsViewFn,
    closeLeadSubviewFn,
    saveLeadSettingsFn,
    isLeadInlineCreateViewFn,
    bindLeadInlineCreateEventsCoreFn,
    deleteLeadFromModalFn,
    saveLeadFromModalFn,
    syncLeadDerivedFieldsFn,
    addLeadModalLocationRowFn,
    removeLeadModalLocationRowFn,
    syncLeadModalDraftFromFormFn,
    normalizeLeadLocationsFn,
    createLeadLocationFn,
    parseCoordsFromAddressInputFn,
    getLeadPlusCodeReferenceFn,
    hasLeadLocationCoordsFn,
    getPrimaryLeadLocationFn,
    hydrateLeadGeoFieldsFromCoordsFn,
    refineLeadLocationAddressIndexFn,
    openLeadModalFn,
    openCustomerModalFn,
    closeStaffEditorFn,
    openStaffEditorFn,
    syncStaffDerivedEmailFieldFn,
    normalizeCeoCountryFn,
    syncStaffFormFromDomFn,
    saveCeoStaffFromViewFn,
    deleteCeoStaffFromViewFn,
    handleSearchInputFn,
    buildLocalBusinessResultsFn,
    refreshSearchViewFn,
    openProfileFromUserFn
  } = deps;
  let businessTopTabsPinSyncCleanup = null;
  let smartHeaderLastScrollY = 0;
  let smartHeaderToggleAnchorY = 0;
  let smartHeaderVisible = true;
  let smartHeaderScrollListener = null;
  let smartHeaderResizeListener = null;
  let smartHeaderBoundTopEl = null;
  let smartHeaderBoundTabsEl = null;
  let smartHeaderIgnoreScrollUntilTs = 0;
  const SMART_HEADER_TOP_RESET_PX = 50;
  const SMART_HEADER_HIDE_DELTA_PX = 18;
  const SMART_HEADER_SHOW_DELTA_PX = 14;
  const SMART_HEADER_SCROLL_JITTER_PX = 2;
  const SMART_HEADER_REBIND_GUARD_MS = 180;
  const doc = documentObj || (typeof document === "undefined" ? null : document);
  const win = windowObj || (typeof window === "undefined" ? null : window);

  function cleanupLegacyDrawerDocumentState() {
    if (!doc) return;
    doc.documentElement.classList.remove("drawer-open");
    doc.body?.classList?.remove?.("drawer-open");
    if (!doc.body) return;
    doc.body.style.position = "";
    doc.body.style.top = "";
    doc.body.style.left = "";
    doc.body.style.right = "";
    doc.body.style.width = "";
    doc.body.style.overflow = "";
  }

  function hasBlockingOverlayOpen() {
    return !!state.profileModal?.open
      || !!state.postModal?.open
      || !!state.likesModal?.open
      || !!state.menuModal?.open
      || !!state.menuDetail?.open
      || !!state.focusModal?.open
      || !!state.leadModal?.open
      || !!state.customerModal?.open
      || !!state.chatModal?.open;
  }

  function shouldResetDrawerStateBeforeRender() {
    if (!state?.drawerOpen) return false;
    if (!state?.user && !!state?.auth?.open) return true;
    if (hasBlockingOverlayOpen()) return true;
    const previousMainTab = String(getLastRenderedMainTab() || "").trim();
    const nextTab = String(state?.activeTab || "").trim();
    return !!previousMainTab && !!nextTab && previousMainTab !== nextTab;
  }

  function renderHeaderActionButton(avatarUrl, avatarFit) {
    if (!getAuthInitialized()) {
      const restoringRaw = getAuthBootstrapSnapshot()?.avatar || state.userProfile.avatar || getUserAvatarCache() || "";
      const restoringAvatar = getOptimizedImageUrl(restoringRaw, "avatar");
      if (restoringAvatar && !isPlaceholderUrl(restoringAvatar)) {
        return `
        <div aria-hidden="true" class="w-14 h-14 rounded-3xl shadow-xl overflow-hidden p-1 bg-white border border-slate-50 shadow-slate-200/30 pointer-events-none">
          <img src="${escapeHtml(restoringAvatar)}" class="w-full h-full rounded-[1.4rem] ${avatarFit}" />
        </div>
      `;
      }
      return `
      <div aria-hidden="true" class="w-14 h-14 rounded-3xl shadow-xl overflow-hidden p-1 bg-white border border-slate-50 shadow-slate-200/30 pointer-events-none">
        <div class="w-full h-full rounded-[1.4rem] bg-slate-200 animate-pulse"></div>
      </div>
    `;
    }
    if (isGuestSession()) {
      return `
      <button data-auth-open="true" class="w-14 h-14 rounded-3xl shadow-xl overflow-hidden active:scale-95 transition-transform bg-white border border-slate-50 shadow-slate-200/30 text-slate-900 flex flex-col items-center justify-center leading-none">
        ${icon("log-in", "w-4 h-4")}
        <span class="text-[8px] font-black uppercase tracking-[0.2em] mt-1">Login</span>
      </button>
    `;
    }
    return `
    <button data-nav="profile" class="w-14 h-14 rounded-3xl shadow-xl overflow-hidden p-1 active:scale-95 transition-transform bg-white border border-slate-50 shadow-slate-200/30">
      <img id="headerAvatar" data-img-key="avatar:header" src="${escapeHtml(avatarUrl)}" class="w-full h-full rounded-[1.4rem] ${avatarFit}" />
    </button>
  `;
  }

  function shouldUseSmartHeader() {
    const isStaffFormView = state.activeTab === "staff" && state.staff?.view === "form";
    const isLeadsSubView = state.activeTab === "leads" && (state.leads?.view === "create" || state.leads?.view === "settings");
    const isChatThreadOpen = state.activeTab === "chat" && !!state.chatModal?.open && !!state.chatModal?.profile;
    return !!String(state.activeTab || "").trim() && !isStaffFormView && !isLeadsSubView && !isChatThreadOpen;
  }

  function getActiveHeaderProfile() {
    return state.profileView?.profile || state.userProfile || {};
  }

  function isBusinessHeaderProfile(profile = getActiveHeaderProfile()) {
    const restaurantId = String(profile?.restaurantId || "").trim();
    if (restaurantId) return true;
    return String(profile?.role || "").trim().toLowerCase() === "business";
  }

  function resolveBusinessHeaderTopTab(profile = getActiveHeaderProfile()) {
    if (!isBusinessHeaderProfile(profile)) return "profile";
    const requestedTopTab = String(state.profileTopTab || "").trim().toLowerCase();
    if (requestedTopTab === "cart" || requestedTopTab === "favorites") {
      return requestedTopTab;
    }
    return "profile";
  }

  function resolveBusinessHeaderContentTab(profile = getActiveHeaderProfile()) {
    if (!isBusinessHeaderProfile(profile)) return "posts";
    const requestedTopTab = String(state.profileTopTab || "").trim().toLowerCase();
    if (requestedTopTab === "menu") return "menu";
    const requestedContentTab = String(state.profileContentTab || "").trim().toLowerCase();
    if (requestedContentTab === "media" || requestedContentTab === "menu" || requestedContentTab === "posts") {
      return requestedContentTab;
    }
    return "posts";
  }

  function isBusinessProfileHeaderContext(profile = getActiveHeaderProfile()) {
    return state.activeTab === "profile" && isBusinessHeaderProfile(profile);
  }

  function isBusinessMenuHeaderContext(profile = getActiveHeaderProfile()) {
    if (!isBusinessProfileHeaderContext(profile)) return false;
    if (resolveBusinessHeaderTopTab(profile) !== "profile") return false;
    return resolveBusinessHeaderContentTab(profile) === "menu";
  }

  function isMenuItemVisibleForHeader(item = {}) {
    const visibility = String(item?.menuVisibility || "").trim().toLowerCase();
    return item?.menuHidden !== true && visibility !== "hidden";
  }

  function resolveHeaderMenuCategoryLabel(item = {}) {
    return String(item?.category || "Sonstiges").trim() || "Sonstiges";
  }

  function normalizeHeaderMenuCategoryToken(value = "") {
    const raw = String(value || "").trim().toLowerCase();
    if (!raw) return "";
    const folded = typeof raw.normalize === "function"
      ? raw.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      : raw;
    return folded.replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  }

  function getBusinessHeaderMenuCategories(profile = getActiveHeaderProfile()) {
    const restaurantId = String(profile?.restaurantId || "").trim();
    if (!restaurantId || !isRestaurantCafeProfile(profile)) return [];
    const sameRestaurant = state.menu.restaurantId === restaurantId;
    const items = sameRestaurant && Array.isArray(state.menu?.items)
      ? state.menu.items.filter((item) => isMenuItemVisibleForHeader(item))
      : [];
    const seenCategories = new Set();
    const categories = [];
    items.forEach((item) => {
      const label = resolveHeaderMenuCategoryLabel(item);
      const id = normalizeHeaderMenuCategoryToken(label);
      if (!id || seenCategories.has(id)) return;
      seenCategories.add(id);
      categories.push({ id, label });
    });
    return categories;
  }

  function resolveBusinessHeaderViewportUi() {
    const viewportWidth = Math.max(
      0,
      Number(win?.innerWidth || doc?.documentElement?.clientWidth || 0)
    );
    const isCompact = viewportWidth > 0 && viewportWidth <= 390;
    const isTight = viewportWidth > 0 && viewportWidth <= 360;
    return {
      titleClass: isCompact ? "text-[1.35rem]" : "text-2xl",
      subtitleClass: isCompact ? "text-[8px]" : "text-[9px]",
      actionButtonClass: isCompact ? "w-9 h-9" : "w-10 h-10",
      actionIconClass: isCompact ? "w-4 h-4" : "w-5 h-5",
      drawerButtonClass: isCompact ? "w-9 h-9 -ml-1.5" : "w-10 h-10 -ml-2",
      drawerIconClass: isCompact ? "w-5 h-5" : "w-6 h-6",
      headerPaddingClass: isTight ? "px-4" : "px-5",
      headerGapClass: isTight ? "gap-2" : "gap-3",
      leftGroupPaddingClass: isTight ? "pr-2" : "pr-3",
      categoryTrackClass: isCompact ? "h-9" : "h-10",
      categoryChipClass: isCompact
        ? "shrink-0 min-w-0 max-w-[7.5rem] h-7 box-border px-2.5 inline-flex items-center justify-center overflow-hidden rounded-full border text-[9px] font-black leading-none transition-all duration-300"
        : "shrink-0 min-w-0 max-w-[8.5rem] h-8 box-border px-3 inline-flex items-center justify-center overflow-hidden rounded-full border text-[10px] font-black leading-none transition-all duration-300"
    };
  }

  function renderBusinessHeaderCenter(profile = getActiveHeaderProfile()) {
    const viewportUi = resolveBusinessHeaderViewportUi();
    const businessName = String(profile?.name || profile?.restaurantName || profile?.businessName || "Business").trim() || "Business";
    const businessNameParts = businessName.split(/\s+/).filter(Boolean);
    const rawBusinessTitle = String(businessNameParts[0] || businessName).trim();
    const businessTitle = rawBusinessTitle && rawBusinessTitle.length <= 5
      ? rawBusinessTitle.toUpperCase()
      : rawBusinessTitle;
    const businessSubtitle = businessNameParts.length > 1
      ? businessNameParts[1]
      : "Social";
    const renderBusinessName = () => `
      <button type="button" data-business-profile-home="true" class="min-w-0 max-w-full text-left active:opacity-90 transition-opacity">
        <div class="flex items-baseline gap-1.5 min-w-0 max-w-full">
          <div class="flex-1 min-w-0 pr-2">
            <h1 class="block min-w-0 overflow-hidden text-ellipsis whitespace-nowrap pr-[3px] ${viewportUi.titleClass} font-black italic tracking-tighter leading-none text-slate-900">${escapeHtml(businessTitle)}</h1>
          </div>
          <span class="min-w-0 max-w-[96px] overflow-hidden text-ellipsis whitespace-nowrap pl-0.5 ${viewportUi.subtitleClass} font-black text-indigo-600 uppercase tracking-[0.25em] mb-[1px]">${escapeHtml(businessSubtitle)}</span>
        </div>
      </button>
    `;
    if (!isBusinessMenuHeaderContext(profile)) {
      return renderBusinessName();
    }
    const categories = getBusinessHeaderMenuCategories(profile);
    if (!categories.length) {
      return renderBusinessName();
    }
    return `
      <div class="relative flex-1 min-w-0 pr-1">
        <div class="${viewportUi.categoryTrackClass} flex items-center gap-2 overflow-x-auto hide-scrollbar whitespace-nowrap">
          ${categories.map((category, index) => `
            <button
              type="button"
              data-business-menu-category="${escapeHtml(category.id)}"
              ${category.disabled ? "disabled" : ""}
              class="${viewportUi.categoryChipClass} ${index === 0 ? "bg-slate-900 text-white border-slate-900 shadow-[0_10px_24px_-16px_rgba(15,23,42,0.55)]" : "bg-white/80 text-slate-500 border-slate-200"} ${category.disabled ? "opacity-50 cursor-default" : "active:scale-[0.97]"}"
            >
              <span class="block max-w-full overflow-hidden text-ellipsis whitespace-nowrap">${escapeHtml(category.label)}</span>
            </button>
          `).join("")}
        </div>
      </div>
    `;
  }

  function renderBusinessHeaderActions(profile = getActiveHeaderProfile()) {
    const viewportUi = resolveBusinessHeaderViewportUi();
    const guestSession = isGuestSession();
    const menuActive = isBusinessMenuHeaderContext(profile);
    const cartCount = Array.isArray(state.shopCart?.items)
      ? state.shopCart.items.reduce((sum, item) => sum + Math.max(0, Number(item?.quantity || 0) || 0), 0)
      : 0;
    const secondaryActionClass = `${viewportUi.actionButtonClass} shrink-0 flex items-center justify-center rounded-full transition-colors active:scale-95 hover:bg-slate-100`;
    const primaryActionClass = `${secondaryActionClass} text-slate-900`;
    return `
      <div class="flex shrink-0 items-center gap-1 text-slate-600">
        <button type="button" class="${secondaryActionClass}">
          ${icon("globe", viewportUi.actionIconClass)}
        </button>
        <button type="button" data-action="cart" class="smart-header-cart-btn ${primaryActionClass}">
          ${icon("shopping-bag", viewportUi.actionIconClass)}
          ${cartCount > 0 ? `<span class="smart-header-cart-badge">${escapeHtml(cartCount > 99 ? "99+" : String(cartCount))}</span>` : ""}
        </button>
        ${menuActive ? `
          <button type="button" data-action="kellner" title="Call Waiter" class="${primaryActionClass}">
            ${icon("bell", viewportUi.actionIconClass)}
          </button>
        ` : `
          <button type="button" ${guestSession ? 'data-auth-open="true"' : 'data-nav="profile"'} class="${primaryActionClass}">
            ${icon("user", viewportUi.actionIconClass)}
          </button>
        `}
      </div>
    `;
  }

  function shouldShowSmartHeaderTabs() {
    const overlayIsolationActive = !!state.profileModal?.open
      || !!state.postModal?.open
      || !!state.likesModal?.open
      || !!state.menuModal?.open
      || !!state.menuDetail?.open
      || !!state.focusModal?.open
      || !!state.leadModal?.open
      || !!state.customerModal?.open
      || !!state.chatModal?.open;
    if (overlayIsolationActive) return false;
    if (state.activeTab !== "profile") return false;
    const profile = state.profileView?.profile || state.userProfile;
    const restaurantId = String(profile?.restaurantId || "").trim();
    if (restaurantId) return true;
    return String(profile?.role || "").trim().toLowerCase() === "business";
  }

  function renderSmartHeader() {
    const activeProfile = getActiveHeaderProfile();
    if (isBusinessProfileHeaderContext(activeProfile)) {
      const viewportUi = resolveBusinessHeaderViewportUi();
      const menuHeaderActive = isBusinessMenuHeaderContext(activeProfile);
      return `
        <div class="smart-header-shell">
          <div id="smart-header-top" class="smart-header-top">
            <div class="${viewportUi.headerPaddingClass} h-16 flex items-center ${menuHeaderActive ? viewportUi.headerGapClass : `justify-between ${viewportUi.headerGapClass}`}">
              <div class="flex ${menuHeaderActive ? "shrink-0" : "flex-1 min-w-0"} items-center ${viewportUi.headerGapClass} ${viewportUi.leftGroupPaddingClass}">
                <button id="drawerToggle" data-header-badge-anchor="true" type="button" class="text-slate-700 hover:bg-slate-100 ${viewportUi.drawerButtonClass} rounded-full transition-colors active:scale-95 flex items-center justify-center shrink-0">
                  ${icon("menu", viewportUi.drawerIconClass)}
                </button>
                ${menuHeaderActive ? "" : renderBusinessHeaderCenter(activeProfile)}
              </div>
              ${menuHeaderActive ? renderBusinessHeaderCenter(activeProfile) : ""}
              ${renderBusinessHeaderActions(activeProfile)}
            </div>
          </div>
        </div>
      `;
    }
    const cartCount = Array.isArray(state.shopCart?.items)
      ? state.shopCart.items.reduce((sum, item) => sum + Math.max(0, Number(item?.quantity || 0) || 0), 0)
      : 0;
    const guestSession = isGuestSession();

    return `
      <div class="smart-header-shell">
        <div id="smart-header-top" class="smart-header-top">
          <div class="px-5 h-16 flex items-center justify-between">
            <div class="flex items-center gap-3">
              <button id="drawerToggle" data-header-badge-anchor="true" type="button" class="text-slate-700 hover:bg-slate-100 p-2 -ml-2 rounded-full transition-colors active:scale-95 flex items-center justify-center">
                ${icon("menu", "w-6 h-6")}
              </button>
              <div class="flex items-baseline gap-1.5 cursor-pointer" data-nav="feed">
                <h1 class="text-2xl font-black italic tracking-tighter leading-none text-slate-900">MNYRA</h1>
                <span class="text-[9px] font-black text-indigo-600 uppercase tracking-[0.25em] mb-[1px]">Social</span>
              </div>
            </div>
            <div class="flex items-center gap-1.5 text-slate-600">
              <button type="button" class="w-10 h-10 flex items-center justify-center hover:bg-slate-100 rounded-full transition-colors active:scale-95">
                ${icon("globe", "w-5 h-5")}
              </button>
              <button type="button" ${guestSession ? 'data-auth-open="true"' : 'data-nav="profile"'} class="w-10 h-10 flex items-center justify-center hover:bg-slate-100 rounded-full transition-colors active:scale-95">
                ${icon("user", "w-5 h-5")}
              </button>
              <button type="button" data-action="cart" class="smart-header-cart-btn w-10 h-10 flex items-center justify-center text-slate-900 hover:bg-slate-100 rounded-full transition-colors active:scale-95">
                ${icon("shopping-bag", "w-5 h-5")}
                ${cartCount > 0 ? `<span class="smart-header-cart-badge">${escapeHtml(cartCount > 99 ? "99+" : String(cartCount))}</span>` : ""}
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function renderHeader() {
    if (shouldUseSmartHeader()) {
      return renderSmartHeader();
    }
    const unread = isGuestSession() ? 0 : state.notifications.filter((n) => !n.read).length;
    const chatUnread = isGuestSession() ? 0 : getChatUnreadCount();
    const headerUnread = unread + chatUnread;
    const badge = headerUnread > 9 ? "9+" : String(headerUnread || "");
    const branding = resolveHeaderBranding();
    const avatarUrl = branding.logoUrl;
    const avatarFit = logoFitClass(branding.isBusinessLogo);
    const titleClass = "text-2xl font-black italic tracking-tighter leading-none text-slate-900 max-w-[220px] mx-auto truncate";
    const subtitleClass = `text-[9px] font-black text-indigo-600 uppercase tracking-[0.4em] block${branding.subtitle ? "" : " hidden"}`;
    if (state.activeTab === "staff" && state.staff?.view === "form") {
      return `
      <header class="app-header-safe p-6 pb-2 flex justify-between items-center relative z-40 bg-slate-50">
        <button data-staff-back="true" class="w-14 h-14 rounded-3xl shadow-xl flex items-center justify-center active:scale-95 transition-all bg-white border border-slate-50 shadow-slate-200/30">
          ${icon("arrow-left", "w-5 h-5")}
        </button>
        <div class="text-center">
          <h1 class="${titleClass}">${BRAND_UI.upper}</h1>
          <span class="text-[9px] font-black text-indigo-600 uppercase tracking-[0.3em] block">CEO Creation</span>
        </div>
        ${renderHeaderActionButton(avatarUrl, avatarFit)}
      </header>
    `;
    }
    if (state.activeTab === "leads" && (state.leads?.view === "create" || state.leads?.view === "settings")) {
      const isSettingsView = state.leads?.view === "settings";
      return `
      <header class="app-header-safe p-6 pb-2 flex justify-between items-center relative z-40 bg-slate-50">
        <button data-leads-back="true" class="w-14 h-14 rounded-3xl shadow-xl flex items-center justify-center active:scale-95 transition-all bg-white border border-slate-50 shadow-slate-200/30">
          ${icon("arrow-left", "w-5 h-5")}
        </button>
        <div class="text-center">
          <h1 class="${titleClass}">${BRAND_UI.upper}</h1>
          <span class="text-[9px] font-black text-indigo-600 uppercase tracking-[0.3em] block">${isSettingsView ? "Leads Settings" : "Leads Creation"}</span>
        </div>
        ${renderHeaderActionButton(avatarUrl, avatarFit)}
      </header>
    `;
    }
    if (state.activeTab === "chat" && state.chatModal.open && state.chatModal.profile) {
      const partner = state.chatModal.profile;
      const partnerAvatar = getOptimizedImageUrl(partner.avatar, "avatar");
      return `
      <header class="app-header-safe shrink-0 p-6 pb-3 flex items-center justify-between gap-3 relative z-40 bg-slate-50">
        <button data-chat-back="true" class="w-14 h-14 rounded-3xl shadow-xl flex items-center justify-center active:scale-95 transition-all bg-white border border-slate-50 shadow-slate-200/30">
          ${icon("arrow-left", "w-5 h-5")}
        </button>
        <div class="flex-1 min-w-0 text-center">
          <h1 class="text-lg font-black tracking-tight text-slate-900 truncate">${escapeHtml(partner.name || "User")}</h1>
          <span class="text-[9px] font-black text-slate-400 uppercase tracking-[0.35em] block truncate">@${escapeHtml(String(partner.handle || "user").replace(/^@/, ""))}</span>
        </div>
        <div class="flex items-center gap-2">
          <div class="w-12 h-12 rounded-2xl overflow-hidden p-1 bg-white border border-slate-100 shadow-sm">
            <img src="${escapeHtml(partnerAvatar)}" class="w-full h-full rounded-[1rem] object-cover" />
          </div>
        </div>
      </header>
    `;
    }
    if (state.activeTab === "chat") {
      return `
      <header class="app-header-safe shrink-0 p-6 pb-3 flex justify-between items-center relative z-40 bg-slate-50">
        <button id="drawerToggle" class="w-14 h-14 rounded-3xl shadow-xl flex flex-col gap-1.5 items-start justify-center p-4 active:scale-95 transition-all bg-white border border-slate-50 shadow-slate-200/30 relative">
          <div class="w-6 h-0.5 rounded-full bg-slate-900"></div>
          <div class="w-4 h-0.5 rounded-full bg-slate-900"></div>
          <div class="w-5 h-0.5 rounded-full bg-slate-900"></div>
          ${headerUnread ? `<span data-unread-badge="header" class="absolute -top-1 -right-1 min-w-[20px] h-5 px-1.5 rounded-full bg-rose-500 text-white text-[10px] font-black flex items-center justify-center shadow-lg">${badge}</span>` : ""}
        </button>
        <div class="text-center">
          <h1 class="text-2xl font-black italic tracking-tighter leading-none text-slate-900">CHATS</h1>
          <span class="text-[9px] font-black text-indigo-600 uppercase tracking-[0.4em] block">DIRECT</span>
        </div>
        ${renderHeaderActionButton(avatarUrl, avatarFit)}
      </header>
    `;
    }
    return `
    <header class="app-header-safe p-6 pb-2 flex justify-between items-center relative z-40 bg-slate-50">
      <button id="drawerToggle" class="w-14 h-14 rounded-3xl shadow-xl flex flex-col gap-1.5 items-start justify-center p-4 active:scale-95 transition-all bg-white border border-slate-50 shadow-slate-200/30 relative">
        <div class="w-6 h-0.5 rounded-full bg-slate-900"></div>
        <div class="w-4 h-0.5 rounded-full bg-slate-900"></div>
        <div class="w-5 h-0.5 rounded-full bg-slate-900"></div>
        ${headerUnread ? `<span data-unread-badge="header" class="absolute -top-1 -right-1 min-w-[20px] h-5 px-1.5 rounded-full bg-rose-500 text-white text-[10px] font-black flex items-center justify-center shadow-lg">${badge}</span>` : ""}
      </button>
      <div class="text-center cursor-pointer" data-nav="feed">
        <h1 id="headerTitle" class="${titleClass}">${escapeHtml(branding.title)}</h1>
        <span id="headerSubtitle" class="${subtitleClass}">${escapeHtml(branding.subtitle)}</span>
      </div>
      ${renderHeaderActionButton(avatarUrl, avatarFit)}
    </header>
  `;
  }

  function shouldShowBusinessTopTabs() {
    const overlayIsolationActive = !!state.drawerOpen
      || !!state.profileModal?.open
      || !!state.postModal?.open
      || !!state.likesModal?.open
      || !!state.menuModal?.open
      || !!state.menuDetail?.open
      || !!state.focusModal?.open
      || !!state.leadModal?.open
      || !!state.customerModal?.open
      || !!state.chatModal?.open;
    if (overlayIsolationActive) return false;
    if (state.activeTab !== "profile") return false;
    const profile = state.profileView?.profile || state.userProfile;
    const restaurantId = String(profile?.restaurantId || "").trim();
    if (restaurantId) return true;
    return String(profile?.role || "").trim().toLowerCase() === "business";
  }

  function renderBusinessTopTabs() {
    return "";
  }

  function bindImageFallbacks(root = doc) {
    if (!root) return;
    root.querySelectorAll("img[data-fallback-src]").forEach((img) => {
      if (!(img instanceof HTMLImageElement)) return;
      if (img.dataset.fallbackBound === "true") return;
      img.dataset.fallbackBound = "true";
      img.addEventListener("error", () => {
        const fallback = img.dataset.fallbackSrc || "";
        const current = img.getAttribute("src") || "";
        if (fallback && current !== fallback) {
          img.setAttribute("src", fallback);
          return;
        }
        if (current !== PLACEHOLDER_IMAGE) {
          img.setAttribute("src", PLACEHOLDER_IMAGE);
        }
      });
    });
  }

  function stopDetachedProfileViewListener() {
    if (state.profileView) return;
    const unsub = getProfileViewUnsub();
    if (typeof unsub !== "function") return;
    try {
      unsub();
    } catch {}
    setProfileViewUnsub(null);
  }

  function resetSmartHeaderMetrics() {
    const rootStyle = doc?.documentElement?.style;
    rootStyle?.removeProperty("--smart-header-top-height");
    rootStyle?.removeProperty("--smart-header-tabs-height");
    rootStyle?.removeProperty("--smart-header-total-height");
  }

  function armSmartHeaderScrollGuard(durationMs = SMART_HEADER_REBIND_GUARD_MS) {
    const nextDuration = Math.max(0, Number(durationMs) || 0);
    smartHeaderIgnoreScrollUntilTs = Math.max(smartHeaderIgnoreScrollUntilTs, Date.now() + nextDuration);
  }

  function syncSmartHeaderMetrics() {
    if (!doc) return;
    const rootStyle = doc.documentElement?.style;
    if (!rootStyle) return false;
    const topEl = doc.getElementById("smart-header-top");
    const tabsEl = doc.getElementById("smart-tabs");
    const topHeight = topEl ? Math.max(0, Math.round(topEl.getBoundingClientRect().height)) : 0;
    const tabsHeight = tabsEl ? Math.max(0, Math.round(tabsEl.getBoundingClientRect().height)) : 0;
    const nextTopHeight = `${topHeight}px`;
    const nextTabsHeight = `${tabsHeight}px`;
    const nextTotalHeight = `${topHeight + tabsHeight}px`;
    let changed = false;
    if (rootStyle.getPropertyValue("--smart-header-top-height").trim() !== nextTopHeight) {
      rootStyle.setProperty("--smart-header-top-height", nextTopHeight);
      changed = true;
    }
    if (rootStyle.getPropertyValue("--smart-header-tabs-height").trim() !== nextTabsHeight) {
      rootStyle.setProperty("--smart-header-tabs-height", nextTabsHeight);
      changed = true;
    }
    if (rootStyle.getPropertyValue("--smart-header-total-height").trim() !== nextTotalHeight) {
      rootStyle.setProperty("--smart-header-total-height", nextTotalHeight);
      changed = true;
    }
    return changed;
  }

  function stopSmartHeaderVisibilitySync({ resetState = true } = {}) {
    if (win && typeof smartHeaderScrollListener === "function") {
      win.removeEventListener("scroll", smartHeaderScrollListener);
    }
    if (win && typeof smartHeaderResizeListener === "function") {
      win.removeEventListener("resize", smartHeaderResizeListener);
      win.visualViewport?.removeEventListener?.("resize", smartHeaderResizeListener);
    }
    smartHeaderScrollListener = null;
    smartHeaderResizeListener = null;
    smartHeaderBoundTopEl = null;
    smartHeaderBoundTabsEl = null;
    if (resetState) {
      smartHeaderLastScrollY = 0;
      smartHeaderToggleAnchorY = 0;
      smartHeaderVisible = true;
      smartHeaderIgnoreScrollUntilTs = 0;
    }
    if (resetState) resetSmartHeaderMetrics();
  }

  function initSmartHeaderVisibilitySync() {
    if (!win || !doc) return;
    const topEl = doc.getElementById("smart-header-top");
    const tabs = doc.getElementById("smart-tabs");
    if (!topEl) {
      stopSmartHeaderVisibilitySync({ resetState: true });
      return;
    }

    const hasExistingBinding = typeof smartHeaderResizeListener === "function"
      && smartHeaderBoundTopEl === topEl
      && smartHeaderBoundTabsEl === (tabs || null)
      && (tabs ? typeof smartHeaderScrollListener === "function" : true);
    if (hasExistingBinding) {
      if (syncSmartHeaderMetrics()) {
        smartHeaderLastScrollY = Math.max(0, Number(win.scrollY || 0));
        smartHeaderToggleAnchorY = smartHeaderLastScrollY;
        armSmartHeaderScrollGuard();
      }
      return;
    }

    const hadScrollHistory = smartHeaderToggleAnchorY > 0 || smartHeaderLastScrollY > 0 || smartHeaderVisible === false;
    const previousVisible = smartHeaderVisible;
    stopSmartHeaderVisibilitySync({ resetState: false });
    syncSmartHeaderMetrics();
    smartHeaderLastScrollY = Math.max(0, Number(win.scrollY || 0));
    smartHeaderToggleAnchorY = smartHeaderLastScrollY;
    if (smartHeaderLastScrollY <= SMART_HEADER_TOP_RESET_PX) {
      smartHeaderVisible = true;
    } else if (!hadScrollHistory) {
      smartHeaderVisible = false;
    } else {
      smartHeaderVisible = previousVisible;
    }
    smartHeaderBoundTopEl = topEl;
    smartHeaderBoundTabsEl = tabs || null;
    smartHeaderResizeListener = () => {
      if (syncSmartHeaderMetrics()) {
        smartHeaderLastScrollY = Math.max(0, Number(win.scrollY || 0));
        smartHeaderToggleAnchorY = smartHeaderLastScrollY;
        armSmartHeaderScrollGuard();
      }
    };
    win.addEventListener("resize", smartHeaderResizeListener, { passive: true });
    win.visualViewport?.addEventListener?.("resize", smartHeaderResizeListener, { passive: true });
    if (!tabs) return;
    tabs.classList.toggle("smart-header-tabs--hidden", !smartHeaderVisible);
    armSmartHeaderScrollGuard();

    const handleScroll = () => {
      const currentScrollY = Math.max(0, Number(win.scrollY || 0));
      if (Date.now() < smartHeaderIgnoreScrollUntilTs) {
        smartHeaderLastScrollY = currentScrollY;
        smartHeaderToggleAnchorY = currentScrollY;
        return;
      }
      const deltaY = currentScrollY - smartHeaderLastScrollY;
      if (Math.abs(deltaY) < SMART_HEADER_SCROLL_JITTER_PX) return;
      if (currentScrollY <= SMART_HEADER_TOP_RESET_PX) {
        tabs.classList.remove("smart-header-tabs--hidden");
        smartHeaderVisible = true;
        smartHeaderLastScrollY = currentScrollY;
        smartHeaderToggleAnchorY = currentScrollY;
        return;
      }

      if (deltaY > 0) {
        if (smartHeaderVisible && (currentScrollY - smartHeaderToggleAnchorY) >= SMART_HEADER_HIDE_DELTA_PX) {
          tabs.classList.add("smart-header-tabs--hidden");
          smartHeaderVisible = false;
          smartHeaderToggleAnchorY = currentScrollY;
        } else if (!smartHeaderVisible) {
          smartHeaderToggleAnchorY = currentScrollY;
        }
      } else if (deltaY < 0) {
        if (!smartHeaderVisible && (smartHeaderToggleAnchorY - currentScrollY) >= SMART_HEADER_SHOW_DELTA_PX) {
          tabs.classList.remove("smart-header-tabs--hidden");
          smartHeaderVisible = true;
          smartHeaderToggleAnchorY = currentScrollY;
        } else if (smartHeaderVisible) {
          smartHeaderToggleAnchorY = currentScrollY;
        }
      }

      smartHeaderLastScrollY = currentScrollY;
    };

    smartHeaderScrollListener = handleScroll;
    win.addEventListener("scroll", smartHeaderScrollListener, { passive: true });
  }

  function setBusinessTopTabsPinned(active) {
    const next = !!active;
    const stickyWrapEl = doc?.querySelector?.("[data-business-top-tabs-wrap='true']");
    stickyWrapEl?.classList?.toggle?.("business-top-tabs-sticky--pinned", next);
  }

  function stopBusinessTopTabsPinSync() {
    if (typeof businessTopTabsPinSyncCleanup === "function") {
      try {
        businessTopTabsPinSyncCleanup();
      } catch {}
    }
    businessTopTabsPinSyncCleanup = null;
    setBusinessTopTabsPinned(false);
  }

  function bindBusinessTopTabsPinSync() {
    stopBusinessTopTabsPinSync();
    const stickyWrapEl = doc?.querySelector?.("[data-business-top-tabs-wrap='true']");
    if (!stickyWrapEl || !win) return;

    const syncPinnedState = () => {
      const style = win.getComputedStyle?.(stickyWrapEl);
      const stickyTop = Math.max(0, Math.ceil(parseFloat(style?.top || "0") || 0));
      const rect = stickyWrapEl.getBoundingClientRect();
      setBusinessTopTabsPinned(rect.top <= (stickyTop + 1));
    };

    const onScroll = () => syncPinnedState();
    const onResize = () => syncPinnedState();

    win.addEventListener("scroll", onScroll, { passive: true });
    win.addEventListener("resize", onResize);
    win.visualViewport?.addEventListener?.("resize", onResize);
    win.visualViewport?.addEventListener?.("scroll", onScroll);

    syncPinnedState();

    businessTopTabsPinSyncCleanup = () => {
      win.removeEventListener("scroll", onScroll);
      win.removeEventListener("resize", onResize);
      win.visualViewport?.removeEventListener?.("resize", onResize);
      win.visualViewport?.removeEventListener?.("scroll", onScroll);
    };
  }

  function render() {
    if (getRenderSuspended() > 0) {
      setRenderQueued(true);
      return;
    }
    if (shouldResetDrawerStateBeforeRender()) {
      state.drawerOpen = false;
    }
    if (typeof updateShellDomFn === "function") updateShellDomFn();
    else if (doc) {
      cleanupLegacyDrawerDocumentState();
    }
    stopDetachedProfileViewListener();
    const chatInputFocusState = captureChatInputFocusStateFn();
    if (doc?.body) {
      doc.body.classList.toggle("fast-mode", FAST_MODE);
    }
    let nextHtml = "";
    let mode = "";
    const showGuestAuth = !state.user && !!state.auth.open;
    if (showGuestAuth) {
      nextHtml = renderAuthScreen();
      mode = "auth";
    } else {
      state.activeTab = sanitizeTabForSession(state.activeTab, { hasProfileView: !!state.profileView });
      nextHtml = renderMainFn();
      mode = "main";
    }
    const prevLastAppHtml = getLastAppHtml();
    const prevLastRenderMode = getLastRenderMode();
    const changed = nextHtml !== prevLastAppHtml || mode !== prevLastRenderMode;
    if (changed) {
      const prevLastRenderedMainTab = getLastRenderedMainTab();
      const isChatThreadOpen = mode === "main"
        && state.activeTab === "chat"
        && !!state.chatModal.open
        && !!state.chatModal.profile;
      const preserveMainScroll = mode === "main"
        && prevLastRenderMode === "main"
        && state.activeTab === prevLastRenderedMainTab
        && !isChatThreadOpen;
      const preserveWindowScroll = preserveMainScroll
        && shouldShowSmartHeaderTabs()
        && !!win
        && typeof win.scrollTo === "function";
      const reuseFeed = preserveMainScroll && state.activeTab === "feed"
        ? doc?.getElementById("feedView")
        : null;
      const prevScrollTop = preserveMainScroll ? doc?.querySelector("main")?.scrollTop ?? 0 : 0;
      const prevWindowScrollY = preserveWindowScroll ? Math.max(0, Number(win.scrollY || 0)) : 0;
      if (preserveWindowScroll) armSmartHeaderScrollGuard();
      if (appEl) {
        appEl.innerHTML = nextHtml;
        appEl.removeAttribute("aria-busy");
      }
      setLastAppHtml(nextHtml);
      setLastRenderMode(mode);
      if (mode === "auth") {
        bindAuthEvents();
      } else if (mode === "main") {
        bindAppEvents();
        bindFeedDelegationFn();
      }
      if (reuseFeed) {
        const nextFeed = doc?.getElementById("feedView");
        if (nextFeed && reuseFeed !== nextFeed) {
          nextFeed.replaceWith(reuseFeed);
        }
        const nextMain = doc?.querySelector("main");
        if (nextMain) nextMain.scrollTop = prevScrollTop;
        updateFeedDomFn();
      } else if (preserveMainScroll) {
        const nextMain = doc?.querySelector("main");
        if (nextMain) nextMain.scrollTop = prevScrollTop;
      }
      if (preserveWindowScroll) {
        armSmartHeaderScrollGuard();
        if (Math.abs(Math.max(0, Number(win.scrollY || 0)) - prevWindowScrollY) >= 1) {
          win.scrollTo(Number(win.scrollX || 0), prevWindowScrollY);
        }
      }
      if (win?.lucide?.createIcons) win.lucide.createIcons();
      if (state.activeTab === "search" && state.search.keepFocus) {
        state.search.keepFocus = false;
        focusSearchInputFn();
      }
      if (state.activeTab === "leads" && state.leads.keepFocus) {
        state.leads.keepFocus = false;
        focusInputByIdFn("leadsSearchInput");
      }
      if (state.activeTab === "customers" && state.customers.keepFocus) {
        state.customers.keepFocus = false;
        focusInputByIdFn("customersSearchInput");
      }
      restoreChatInputFocusStateFn(chatInputFocusState);
      if (mode === "main") setLastRenderedMainTab(state.activeTab);
      else setLastRenderedMainTab("");
    }

    if (shouldUseSmartHeader()) {
      stopBusinessTopTabsPinSync();
      initSmartHeaderVisibilitySync();
    } else {
      stopSmartHeaderVisibilitySync();
      bindBusinessTopTabsPinSync();
    }

    renderOverlaysFn();
    if (mode === "main" || getLastRenderMode() === "main") {
      updateNotificationBadgesFn();
    }
    updateFocusRotationFn();

    if (mode === "main" && state.activeTab === "map") {
      win?.setTimeout(() => {
        initLeafletIfNeededFn();
        updateMapSheetFn();
      }, 0);
    } else {
      cleanupLeafletFn();
    }
  }

  function bindAuthEvents() {
    const authForm = doc?.getElementById("authForm");
    const toggleBtn = doc?.getElementById("authToggle");
    const authCloseBtn = doc?.getElementById("authCloseBtn");
    if (authCloseBtn) {
      authCloseBtn.addEventListener("click", () => {
        state.auth.open = false;
        state.auth.error = "";
        render();
      });
    }
    if (toggleBtn) {
      toggleBtn.addEventListener("click", () => {
        state.auth.mode = state.auth.mode === "login" ? "register" : "login";
        state.auth.error = "";
        state.auth.role = "user";
        render();
      });
    }

    if (authForm) {
      authForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const email = doc?.getElementById("authEmail")?.value?.trim() || "";
        const password = doc?.getElementById("authPassword")?.value || "";
        const name = doc?.getElementById("authName")?.value?.trim() || "";
        const authMode = String(state?.auth?.mode || "login").trim() || "login";

        state.auth.loading = true;
        state.auth.error = "";
        beginAuthStartupTrace(state, "auth.login.submit", {
          mode: authMode,
          hasName: !!name,
          activeTab: state?.activeTab || ""
        });
        render();

        try {
          await ensureAuthLocalPersistenceFn();
          markAuthStartupTrace(state, "auth.persistence.ready", {
            mode: authMode
          });
          if (state.auth.mode === "login") {
            await signInWithEmailAndPasswordFn(auth, email, password);
          } else {
            if (!name || !email || !password) {
              throw new Error("Bitte alles ausfuellen.");
            }
            const cred = await createUserWithEmailAndPasswordFn(auth, email, password);
            await updateProfileFn(cred.user, { displayName: name });
            await setDocFn(docFn(db, "users", cred.user.uid), {
              displayName: name,
              handle: normalizeHandleFn(name),
              city: "Prishtina",
              email,
              role: "user",
              bio: "",
              score: 0,
              followersCount: 0,
              followingCount: 0,
              createdAt: serverTimestampFn(),
              updatedAt: serverTimestampFn()
            }, { merge: true });
          }
          markAuthStartupTrace(state, "auth.credentials.accepted", {
            mode: authMode
          });
        } catch (err) {
          state.auth.error = err?.message || "Login fehlgeschlagen.";
          finishAuthStartupTrace(state, "auth.login.failed", {
            mode: authMode,
            message: state.auth.error
          });
        } finally {
          if (!auth?.currentUser) {
            state.auth.loading = false;
          }
          render();
        }
      });
    }
  }

  function stopCrmAutoLoadObserver() {
    const observer = getCrmAutoLoadObserver();
    if (observer) {
      try { observer.disconnect(); } catch {}
      setCrmAutoLoadObserver(null);
    }
  }

  function bindCrmAutoLoadObserver() {
    stopCrmAutoLoadObserver();
    if (typeof IntersectionObserver !== "function") return;
    const sentinels = [
      doc?.getElementById("leadsLoadMoreSentinel"),
      doc?.getElementById("customersLoadMoreSentinel"),
      doc?.getElementById("staffLoadMoreSentinel")
    ].filter(Boolean);
    if (!sentinels.length) return;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry?.isIntersecting) return;
        const node = entry.target;
        if (!(node instanceof HTMLElement)) return;
        if (node.id === "leadsLoadMoreSentinel") {
          if (!state.leads.loadingMore && !state.leads.loading && state.leads.hasMore?.[normalizeLeadScopeKeyFn(state.leads.scope)]) {
            void loadLeadsFn({ scope: state.leads.scope, grow: true });
          }
          return;
        }
        if (node.id === "customersLoadMoreSentinel") {
          if (!state.customers.loadingMore && !state.customers.loading && state.customers.hasMore?.[normalizeCustomerScopeKeyFn(state.customers.scope)]) {
            void loadCustomersFn({ scope: state.customers.scope, grow: true });
          }
          return;
        }
        if (node.id === "staffLoadMoreSentinel") {
          if (!state.staff.loadingMore && !state.staff.loading && state.staff.hasMore) {
            void loadCeoStaffFn({ grow: true });
          }
        }
      });
    }, {
      root: null,
      rootMargin: "0px 0px 240px 0px",
      threshold: 0.05
    });
    setCrmAutoLoadObserver(observer);
    sentinels.forEach((node) => observer.observe(node));
  }

  function bindAppEvents() {
    return bindAppEventsMainCoreFn({
      documentObj: doc,
      state,
      bindAppShellEventsCoreFn,
      setStateFn,
      signOutFn,
      auth,
      clearAuthBootstrapSnapshotFn,
      safeStorageObj,
      profileKeyFn,
      avatarKeyFn,
      notificationsKeyFn,
      pushSeenKeyFn,
      pushTokenMetaKeyFn,
      followingKeyFn,
      chatIndexKeyFn,
      storageKeys,
      resetUserScopedStateFn,
      cleanupLeafletFn,
      openGuestAuthPromptFn,
      normalizeAuthModeFn,
      renderFn: render,
      ensureMenuDataForProfileFn,
      ensureFocusDataForProfileFn,
      bindAppMenuFocusEventsCoreFn,
      saveMenuLayoutToStorageFn,
      openMenuModalFn,
      deleteMenuItemByIdFn,
      triggerMenuDetailOpenFromGestureFn,
      updateShopCartQuantityFn,
      openShopCheckoutFn,
      submitShopCheckoutFn,
      updateShopCheckoutFieldFn,
      saveTableQrConfigFn,
      menuCache,
      menuCacheKeyFn,
      saveMenuStatusBadgeVisibleFn,
      focusCache,
      focusCacheKeyFn,
      saveFocusEnabledFn,
      openFocusModalFn,
      deleteFocusItemByIdFn,
      setFocusIndexFn,
      toggleProfilePostMenuFn,
      toggleProfilePostWidthFn,
      deleteProfilePostFn,
      setProfileMenuOpenFn,
      profileMenuBound: !!getProfileMenuBound(),
      setProfileMenuBoundFn: (next) => {
        setProfileMenuBound(!!next);
      },
      mapLocateFn,
      bindNotificationsDelegationFn,
      bindAppSettingsProfileEventsCoreFn,
      iconFn: icon,
      saveAccountSettingsFn,
      openLocationPickerFn,
      clearVerifiedMapLocationFn,
      syncNotificationsPushRuntimeFn,
      saveSettingsFn,
      disablePushDeviceRegistrationFn,
      getPushActivationIssueMessageFn,
      saveUserProfileToStorageFn,
      persistPrivateAccountSettingFn,
      uploadAvatarFn,
      openProfileViewFromBusinessFn,
      findPostByIdFn,
      openPostModalFn,
      getProfileViewUnsubFn: () => getProfileViewUnsub(),
      setProfileViewUnsubFn: (next) => {
        setProfileViewUnsub(next);
      },
      toggleFollowFn,
      alertFn,
      bindAppChatUploadEventsCoreFn,
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
      handleUploadPostFn,
      bindCrmStaffEventsCoreFn,
      openLeadCreatorFn,
      openLeadSettingsViewFn,
      closeLeadSubviewFn,
      saveLeadSettingsFn,
      isLeadInlineCreateViewFn,
      bindLeadInlineCreateEventsCoreFn,
      deleteLeadFromModalFn,
      saveLeadFromModalFn,
      syncLeadDerivedFieldsFn,
      addLeadModalLocationRowFn,
      removeLeadModalLocationRowFn,
      syncLeadModalDraftFromFormFn,
      normalizeLeadLocationsFn,
      createLeadLocationFn,
      parseCoordsFromAddressInputFn,
      getLeadPlusCodeReferenceFn,
      hasLeadLocationCoordsFn,
      getPrimaryLeadLocationFn,
      hydrateLeadGeoFieldsFromCoordsFn,
      refineLeadLocationAddressIndexFn,
      normalizeLeadScopeKeyFn,
      loadLeadsFn,
      openLeadModalFn,
      normalizeCustomerScopeKeyFn,
      loadCustomersFn,
      openCustomerModalFn,
      closeStaffEditorFn,
      openStaffEditorFn,
      syncStaffDerivedEmailFieldFn,
      normalizeCeoCountryFn,
      syncStaffFormFromDomFn,
      saveCeoStaffFromViewFn,
      deleteCeoStaffFromViewFn,
      bindImageFallbacksFn: bindImageFallbacks,
      bindCrmAutoLoadObserverFn: bindCrmAutoLoadObserver,
      bindSearchEventsFn: bindSearchEvents
    });
  }

  function bindSearchEvents() {
    const searchView = doc?.getElementById("searchView");
    if (!searchView || searchView.dataset.bound === "true") return;

    searchView.addEventListener("input", (e) => {
      const target = e.target;
      if (target instanceof HTMLInputElement && target.id === "searchInput") {
        handleSearchInputFn(target.value);
      }
    });

    searchView.addEventListener("keydown", (e) => {
      const target = e.target;
      if (target instanceof HTMLInputElement && target.id === "searchInput" && e.key === "Enter") {
        e.preventDefault();
      }
    });

    searchView.addEventListener("click", (e) => {
      const target = e.target;
      if (!(target instanceof Element)) return;

      const clearBtn = target.closest("#searchClearBtn");
      if (clearBtn) {
        state.search.query = "";
        state.search.userResults = [];
        state.search.businessResults = buildLocalBusinessResultsFn("");
        state.search.loading = false;
        state.search.error = "";
        state.search.keepFocus = true;
        if (!refreshSearchViewFn()) render();
        focusSearchInputFn();
        return;
      }

      const filterBtn = target.closest("[data-search-filter]");
      if (filterBtn) {
        const requested = filterBtn.dataset.searchFilter || "all";
        const filter = isGuestSession() && (requested === "all" || requested === "users")
          ? "business"
          : requested;
        state.search.filter = filter;
        if (!refreshSearchViewFn()) render();
        return;
      }

      const userBtn = target.closest("[data-search-user]");
      if (userBtn) {
        if (isGuestSession()) {
          openGuestAuthPromptFn("Bitte einloggen, um User-Profile zu sehen.");
          return;
        }
        openProfileFromUserFn({
          uid: userBtn.dataset.searchUser || "",
          handle: userBtn.dataset.searchHandle || "",
          name: userBtn.dataset.searchName || "",
          avatar: userBtn.dataset.searchAvatar || "",
          location: userBtn.dataset.searchLocation || ""
        });
        return;
      }

      const bizBtn = target.closest("[data-search-business]");
      if (bizBtn) {
        openProfileViewFromBusinessFn({
          id: bizBtn.dataset.searchBusiness || "",
          name: bizBtn.dataset.searchName || ""
        }, { showBack: false });
      }
    });

    searchView.dataset.bound = "true";
  }

  return {
    renderHeaderActionButton,
    renderHeader,
    renderBusinessTopTabs,
    render,
    bindAuthEvents,
    bindAppEvents,
    bindSearchEvents,
    bindCrmAutoLoadObserver,
    bindImageFallbacks
  };
}
