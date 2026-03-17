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
  const doc = documentObj || (typeof document === "undefined" ? null : document);
  const win = windowObj || (typeof window === "undefined" ? null : window);

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

  function renderHeader() {
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
    if (!shouldShowBusinessTopTabs()) return "";
    const profile = state.profileView?.profile || state.userProfile;
    const catalogLabel = getBusinessCatalogLabel(profile);
    const isShop = isShopCatalogProfile(profile);
    const profileRestaurantId = String(profile?.restaurantId || "").trim();
    const menuAccessSource = String(state.profileView?.menuAccessSource || "").trim().toLowerCase();
    const isQrMenuAccess = !isShop && menuAccessSource === "qr";
    const canUseCartTab = isShop || isQrMenuAccess;
    const base = "flex-1 py-3 rounded-[1.5rem] text-[11px] font-bold uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2";
    const activeTop = state.profileTopTab || "profile";
    const isProfileActive = activeTop === "profile";
    const isMenuActive = activeTop === "menu";
    const isCartActive = activeTop === "cart";
    const cartCount = canUseCartTab ? getCartCountForRestaurant(profileRestaurantId || "") : 0;
    const spacingClass = "pb-3";
    const tabsInnerHtml = `
      <div data-business-top-tabs="true" class="px-6 pt-1 ${spacingClass}">
        <div class="bg-white p-1.5 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-1">
          <button type="button" data-profile-top-tab="profile" class="${base} ${isProfileActive ? "bg-white text-slate-900 shadow-[0_4px_12px_-2px_rgba(0,0,0,0.08),0_2px_6px_-1px_rgba(0,0,0,0.04)] scale-[1.02]" : "text-slate-400 hover:text-slate-600"}">
            Profil
          </button>
          <button type="button" data-profile-top-tab="menu" class="${base} ${isMenuActive ? "bg-white text-slate-900 shadow-[0_4px_12px_-2px_rgba(0,0,0,0.08),0_2px_6px_-1px_rgba(0,0,0,0.04)] scale-[1.02]" : "text-slate-400 hover:text-slate-600"}">
            ${catalogLabel}
          </button>
          ${canUseCartTab ? `
            <button type="button" data-profile-top-tab="cart" class="${base} relative ${isCartActive ? "bg-white text-slate-900 shadow-[0_4px_12px_-2px_rgba(0,0,0,0.08),0_2px_6px_-1px_rgba(0,0,0,0.04)] scale-[1.02]" : "text-slate-400 hover:text-slate-600"}">
              ${icon("shopping-cart", "w-4 h-4")}
              ${cartCount ? `<span class="absolute top-1 right-2 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-500 text-white text-[9px] font-black flex items-center justify-center">${cartCount > 9 ? "9+" : cartCount}</span>` : ""}
            </button>
          ` : `
            <button type="button" disabled class="${base} text-slate-300 cursor-not-allowed">
              Reviews
            </button>
          `}
        </div>
      </div>
    `;
    return `
    <div data-business-top-tabs-wrap="true" class="business-top-tabs-sticky">
      ${tabsInnerHtml}
    </div>
  `;
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
    if (doc) {
      const isDrawerOpen = !!state?.drawerOpen;
      doc.documentElement.classList.toggle("drawer-open", isDrawerOpen);
      doc.body.classList.toggle("drawer-open", isDrawerOpen);
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
      const reuseFeed = preserveMainScroll && state.activeTab === "feed"
        ? doc?.getElementById("feedView")
        : null;
      const prevScrollTop = preserveMainScroll ? doc?.querySelector("main")?.scrollTop ?? 0 : 0;
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

    bindBusinessTopTabsPinSync();

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

        state.auth.loading = true;
        state.auth.error = "";
        render();

        try {
          await ensureAuthLocalPersistenceFn();
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
        } catch (err) {
          state.auth.error = err?.message || "Login fehlgeschlagen.";
        } finally {
          state.auth.loading = false;
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
