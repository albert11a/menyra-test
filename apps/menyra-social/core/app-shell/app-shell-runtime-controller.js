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
    updateShopCartItemCommentFn,
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
  const FEED_VIEWER_LOCATION_STORAGE_KEY = "mnyra_social_feed_viewer_location_v1";
  const RUNTIME_BUDGETS_MS = Object.freeze({
    cold_guest_landing: 2200,
    profile_open: 850,
    menu_open: 950,
    add_to_cart: 280,
    chat_send: 800
  });
  const runtimePerfMarks = new Map();
  let firstGuestLandingMeasured = false;
  let lastOverlayRenderSignature = "";
  let lastNotificationBadgeSignature = "";
  let lastMapRuntimeSignature = "";
  let mapRefreshQueued = false;
  let lastHeaderRuntimeMode = "";
  let lastRuntimeDegradedBannerSignature = "";
  let lastFeedLocationRenderKey = "";
  let menuLazyImageObserver = null;

  function getViewportScrollTop() {
    const scrollingEl = doc?.scrollingElement || doc?.documentElement || doc?.body || null;
    const rawTop = scrollingEl
      ? Number(scrollingEl.scrollTop || 0)
      : Number(win?.scrollY || 0);
    return Math.max(0, rawTop);
  }

  function setViewportScrollTop(top = 0) {
    const nextTop = Math.max(0, Number(top) || 0);
    const scrollingEl = doc?.scrollingElement || doc?.documentElement || doc?.body || null;
    if (scrollingEl && Math.abs(Number(scrollingEl.scrollTop || 0) - nextTop) >= 1) {
      scrollingEl.scrollTop = nextTop;
    }
    if (doc?.documentElement && doc.documentElement !== scrollingEl) {
      doc.documentElement.scrollTop = nextTop;
    }
    if (doc?.body && doc.body !== scrollingEl) {
      doc.body.scrollTop = nextTop;
    }
    if (win?.scrollTo) {
      try {
        win.scrollTo({ top: nextTop, left: 0, behavior: "auto" });
      } catch {
        win.scrollTo(0, nextTop);
      }
    }
  }

  function scheduleViewportScrollTop(top = 0) {
    const nextTop = Math.max(0, Number(top) || 0);
    setViewportScrollTop(nextTop);
    if (typeof win?.requestAnimationFrame === "function") {
      win.requestAnimationFrame(() => {
        setViewportScrollTop(nextTop);
      });
    }
    if (typeof win?.setTimeout === "function") {
      win.setTimeout(() => {
        setViewportScrollTop(nextTop);
      }, 0);
    }
  }

  function supportsRuntimePerf() {
    return typeof performance !== "undefined"
      && typeof performance.mark === "function"
      && typeof performance.measure === "function";
  }

  function buildRuntimePerfMarkName(key = "", phase = "start") {
    const safeKey = String(key || "").trim().toLowerCase().replace(/[^a-z0-9_]+/g, "_");
    const safePhase = String(phase || "").trim().toLowerCase().replace(/[^a-z0-9_]+/g, "_");
    return `mnyra.social.shellbudget.${safeKey}.${safePhase}`;
  }

  function startRuntimeBudgetTrace(key = "") {
    if (!supportsRuntimePerf()) return "";
    const safeKey = String(key || "").trim();
    if (!safeKey) return "";
    const markName = buildRuntimePerfMarkName(safeKey, "start");
    try {
      performance.mark(markName);
      runtimePerfMarks.set(safeKey, markName);
      return markName;
    } catch {
      return "";
    }
  }

  function finishRuntimeBudgetTrace(key = "", { startMarkName = "" } = {}) {
    if (!supportsRuntimePerf()) return null;
    const safeKey = String(key || "").trim();
    if (!safeKey) return null;
    const endMarkName = buildRuntimePerfMarkName(safeKey, "end");
    const resolvedStartMarkName = String(
      startMarkName
      || runtimePerfMarks.get(safeKey)
      || ""
    ).trim();
    if (!resolvedStartMarkName) return null;
    try {
      performance.mark(endMarkName);
      const measureName = `mnyra.social.shellbudget.${safeKey}`;
      performance.measure(measureName, resolvedStartMarkName, endMarkName);
      const entries = performance.getEntriesByName(measureName);
      const lastEntry = entries.length ? entries[entries.length - 1] : null;
      const durationMs = Number(lastEntry?.duration || 0) || 0;
      const budgetMs = Number(RUNTIME_BUDGETS_MS[safeKey] || 0) || 0;
      const withinBudget = budgetMs > 0 ? durationMs <= budgetMs : true;
      if (!state.runtimeBudgets || typeof state.runtimeBudgets !== "object") {
        state.runtimeBudgets = {};
      }
      state.runtimeBudgets[safeKey] = {
        durationMs,
        budgetMs,
        withinBudget,
        measuredAt: Date.now()
      };
      if (!withinBudget) {
        console.warn(`[mnyra][budget] ${safeKey} ${Math.round(durationMs)}ms > ${budgetMs}ms`);
      }
      return durationMs;
    } catch {
      return null;
    } finally {
      runtimePerfMarks.delete(safeKey);
      try {
        performance.clearMarks(resolvedStartMarkName);
        performance.clearMarks(endMarkName);
      } catch {}
    }
  }

  function finalizeRuntimeBudgetTraceSoon(key = "", options = {}) {
    const safeKey = String(key || "").trim();
    if (!safeKey) return;
    const finalize = () => {
      finishRuntimeBudgetTrace(safeKey, options);
    };
    if (typeof queueMicrotaskFn === "function") {
      queueMicrotaskFn(finalize);
      return;
    }
    if (typeof win?.setTimeout === "function") {
      win.setTimeout(finalize, 0);
      return;
    }
    finalize();
  }

  function runBudgetWrapped(key = "", task = () => {}, { startMarkName = "" } = {}) {
    const safeKey = String(key || "").trim();
    if (!safeKey || typeof task !== "function") {
      return task();
    }
    startRuntimeBudgetTrace(safeKey);
    try {
      const result = task();
      if (result && typeof result.then === "function") {
        return result.finally(() => {
          finishRuntimeBudgetTrace(safeKey, { startMarkName });
        });
      }
      finalizeRuntimeBudgetTraceSoon(safeKey, { startMarkName });
      return result;
    } catch (err) {
      finishRuntimeBudgetTrace(safeKey, { startMarkName });
      throw err;
    }
  }

  function incrementImageFlashCount(amount = 1) {
    const nextAmount = Math.max(1, Number(amount) || 1);
    if (!state.runtimeMetrics || typeof state.runtimeMetrics !== "object") {
      state.runtimeMetrics = {};
    }
    const current = Math.max(0, Number(state.runtimeMetrics.imageFlashCount || 0) || 0);
    state.runtimeMetrics.imageFlashCount = current + nextAmount;
    state.runtimeMetrics.imageFlashLastAt = Date.now();
  }

  function buildOverlayRenderSignature() {
    return [
      state.profileModal?.open ? "1" : "0",
      state.postModal?.open ? "1" : "0",
      state.likesModal?.open ? "1" : "0",
      state.menuModal?.open ? "1" : "0",
      state.menuDetail?.open ? "1" : "0",
      state.focusModal?.open ? "1" : "0",
      state.leadModal?.open ? "1" : "0",
      state.customerModal?.open ? "1" : "0",
      state.chatModal?.open ? "1" : "0",
      String(state.postModal?.post?.id || ""),
      String(state.menuDetail?.item?.id || state.menuDetail?.id || ""),
      String(state.chatModal?.profile?.uid || state.chatModal?.profile?.id || "")
    ].join("|");
  }

  function buildNotificationBadgeSignature() {
    const notifications = Array.isArray(state.notifications) ? state.notifications : [];
    const unreadNotifications = notifications.reduce((sum, item) => sum + (item?.read ? 0 : 1), 0);
    const unreadChat = Number(getChatUnreadCount?.() || 0) || 0;
    return [
      notifications.length,
      unreadNotifications,
      Array.isArray(state.chatThreads) ? state.chatThreads.length : 0,
      unreadChat,
      String(state.activeTab || "")
    ].join("|");
  }

  function isLandingMapPreviewActive() {
    if (state.activeTab !== "profile") return false;
    if (!state.profileView?.profile) return false;
    const topTab = String(state.profileTopTab || "").trim().toLowerCase();
    if (topTab !== "landing") return false;
    return Number(state.profileLandingStep || 0) === 1;
  }

  function buildMapRuntimeSignature(mode = "") {
    if (mode !== "main") return "off";
    const selectedBusiness = state.selectedBusiness || {};
    const selectedKey = String(
      selectedBusiness.markerKey
      || selectedBusiness.id
      || ""
    ).trim();
    const locationCount = Array.isArray(state.businessLocations) ? state.businessLocations.length : 0;
    if (state.activeTab === "map") {
      return `map:${locationCount}:${selectedKey}`;
    }
    if (isLandingMapPreviewActive()) {
      const profile = state.profileView?.profile || state.userProfile || {};
      const focusKey = String(profile?.restaurantId || profile?.id || profile?.name || "").trim();
      return `landing-map:${locationCount}:${focusKey}:${selectedKey}`;
    }
    return `inactive:${String(state.activeTab || "")}:${String(state.profileTopTab || "")}:${Number(state.profileLandingStep || 0)}`;
  }

  function scheduleMapRuntimeRefresh() {
    if (mapRefreshQueued) return;
    mapRefreshQueued = true;
    const run = () => {
      mapRefreshQueued = false;
      initLeafletIfNeededFn();
      updateMapSheetFn();
    };
    if (typeof win?.setTimeout === "function") {
      win.setTimeout(run, 0);
      return;
    }
    run();
  }

  function normalizeLookupToken(value = "") {
    return String(value || "").trim().toLowerCase();
  }

  function resolveLandingMapProfileBusiness() {
    const profile = state.profileView?.profile || state.userProfile || null;
    if (!profile) return null;
    const locations = Array.isArray(state.businessLocations) ? state.businessLocations : [];
    if (!locations.length) return null;
    const targetBusinessId = String(profile?.restaurantId || profile?.id || "").trim();
    const targetNameToken = normalizeLookupToken(profile?.name || "");
    const targetLat = Number(profile?.lat ?? profile?.latitude ?? profile?.gpsLat);
    const targetLng = Number(profile?.lng ?? profile?.longitude ?? profile?.gpsLng);
    const hasTargetCoords = Number.isFinite(targetLat) && Number.isFinite(targetLng);

    const resolveEntryBusinessId = (entry = {}) => String(
      entry?.id
      || entry?.restaurantId
      || entry?.raw?.id
      || ""
    ).trim();
    const resolveEntryNameToken = (entry = {}) => normalizeLookupToken(
      entry?.name
      || entry?.raw?.name
      || ""
    );

    if (targetBusinessId) {
      const byId = locations.find((entry) => resolveEntryBusinessId(entry) === targetBusinessId);
      if (byId) return byId;
    }
    if (targetNameToken) {
      const byName = locations.find((entry) => resolveEntryNameToken(entry) === targetNameToken);
      if (byName) return byName;
    }
    if (hasTargetCoords) {
      const byCoords = locations.find((entry) => {
        const lat = Number(entry?.lat);
        const lng = Number(entry?.lng);
        if (!Number.isFinite(lat) || !Number.isFinite(lng)) return false;
        return Math.abs(lat - targetLat) <= 0.0002 && Math.abs(lng - targetLng) <= 0.0002;
      });
      if (byCoords) return byCoords;
    }
    return null;
  }

  function syncLandingMapSelectionToProfile() {
    const nextSelection = resolveLandingMapProfileBusiness();
    if (!nextSelection) return false;
    const currentSelection = state.selectedBusiness || {};
    const currentKey = String(currentSelection?.markerKey || currentSelection?.id || "").trim();
    const nextKey = String(nextSelection?.markerKey || nextSelection?.id || "").trim();
    const currentLat = Number(currentSelection?.lat || 0);
    const currentLng = Number(currentSelection?.lng || 0);
    const nextLat = Number(nextSelection?.lat || 0);
    const nextLng = Number(nextSelection?.lng || 0);
    const isSameSelection = !!nextKey
      && currentKey === nextKey
      && Math.abs(currentLat - nextLat) < 0.000001
      && Math.abs(currentLng - nextLng) < 0.000001;
    if (isSameSelection) return false;
    state.selectedBusiness = nextSelection;
    return true;
  }

  function refreshLandingMapRuntime() {
    syncLandingMapSelectionToProfile();
    const mapCanvas = doc?.getElementById("leafletMap");
    if (!mapCanvas) return false;
    scheduleMapRuntimeRefresh();
    return true;
  }

  function shouldRecoverLeafletMapSurface(mode) {
    if (mode !== "main") return false;
    if (state.activeTab !== "map" && !isLandingMapPreviewActive()) return false;
    const mapCanvas = doc?.getElementById("leafletMap");
    if (!mapCanvas) return false;
    return !mapCanvas.querySelector(".leaflet-pane");
  }

  function shouldShowBootstrapRuntimeBanner() {
    try {
      const params = new URLSearchParams(String(win?.location?.search || ""));
      return params.get("debug-bootstrap") === "1" || params.get("debugBootstrapBanner") === "1";
    } catch {
      return false;
    }
  }

  function resolveRuntimeDegradedMessages() {
    const messages = [];
    const degraded = state.runtimeDegraded && typeof state.runtimeDegraded === "object"
      ? state.runtimeDegraded
      : {};
    const vendorOrder = shouldShowBootstrapRuntimeBanner()
      ? ["bootstrap", "map", "media", "icons", "fonts"]
      : ["map", "media", "icons", "fonts"];
    vendorOrder.forEach((key) => {
      const message = String(degraded?.[key] || "").trim();
      if (message) messages.push(message);
    });
    return messages.slice(0, 3);
  }

  function syncRuntimeDegradedBanner({ force = false } = {}) {
    if (!doc?.body) return;
    const messages = resolveRuntimeDegradedMessages();
    const nextSignature = messages.join("|");
    if (!force && nextSignature === lastRuntimeDegradedBannerSignature) return;
    lastRuntimeDegradedBannerSignature = nextSignature;
    let banner = doc.getElementById("mnyraRuntimeDegradedBanner");
    if (!messages.length) {
      if (banner) banner.remove();
      return;
    }
    if (!banner) {
      banner = doc.createElement("div");
      banner.id = "mnyraRuntimeDegradedBanner";
      banner.setAttribute("role", "status");
      banner.setAttribute("aria-live", "polite");
      banner.style.position = "fixed";
      banner.style.left = "50%";
      banner.style.top = "max(8px, calc(var(--safe-area-top, 0px) + 8px))";
      banner.style.transform = "translateX(-50%)";
      banner.style.maxWidth = "min(560px, calc(100vw - 20px))";
      banner.style.zIndex = "130";
      banner.style.padding = "8px 12px";
      banner.style.borderRadius = "14px";
      banner.style.background = "rgba(15, 23, 42, 0.92)";
      banner.style.border = "1px solid rgba(148, 163, 184, 0.35)";
      banner.style.color = "#f8fafc";
      banner.style.fontSize = "11px";
      banner.style.fontWeight = "800";
      banner.style.letterSpacing = "0.02em";
      banner.style.pointerEvents = "none";
      banner.style.boxShadow = "0 12px 28px -18px rgba(15, 23, 42, 0.65)";
      doc.body.appendChild(banner);
    }
    banner.textContent = messages.join(" | ");
  }

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
    if (requestedContentTab === "menu" || requestedContentTab === "posts") {
      return requestedContentTab;
    }
    return "posts";
  }

  function isBusinessProfileHeaderContext(profile = getActiveHeaderProfile()) {
    const requestedTopTab = String(state.profileTopTab || "").trim().toLowerCase();
    if (requestedTopTab === "landing" && state.profileView?.profile) return false;
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

  function normalizeFeedViewerCoords(value = null) {
    const lat = Number(value?.lat ?? value?.latitude ?? value?.y);
    const lng = Number(value?.lng ?? value?.lon ?? value?.longitude ?? value?.x);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
    return { lat, lng };
  }

  function readStoredFeedViewerLocation() {
    if (!win?.localStorage) return null;
    try {
      const raw = win.localStorage.getItem(FEED_VIEWER_LOCATION_STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      const coords = normalizeFeedViewerCoords(parsed);
      if (!coords) return null;
      const label = String(parsed?.label || parsed?.city || "").trim();
      const city = String(parsed?.city || label).trim();
      return {
        lat: coords.lat,
        lng: coords.lng,
        label,
        city,
        country: String(parsed?.country || "").trim(),
        countryCode: String(parsed?.countryCode || parsed?.country_code || "").trim().toLowerCase()
      };
    } catch {
      return null;
    }
  }

  function buildFeedLocationRenderKey(locationRecord = readStoredFeedViewerLocation()) {
    const coords = normalizeFeedViewerCoords(locationRecord);
    if (!coords) return "";
    const latKey = Number(coords.lat).toFixed(6);
    const lngKey = Number(coords.lng).toFixed(6);
    const labelKey = String(locationRecord?.label || locationRecord?.city || "").trim().toLowerCase();
    const cityKey = String(locationRecord?.city || locationRecord?.label || "").trim().toLowerCase();
    const countryCodeKey = String(locationRecord?.countryCode || locationRecord?.country_code || "").trim().toLowerCase();
    const countryKey = String(locationRecord?.country || "").trim().toLowerCase();
    return `${latKey}|${lngKey}|${labelKey}|${cityKey}|${countryCodeKey}|${countryKey}`;
  }

  function shouldShowFeedLocationHeaderSearch(locationRecord = readStoredFeedViewerLocation()) {
    const activeTabKey = String(state?.activeTab || "").trim().toLowerCase();
    if (activeTabKey !== "feed") return false;
    return !!locationRecord;
  }

  function renderFeedLocationHeaderSearch(locationLabel = "") {
    return `
      <div class="smart-header-feed-location" data-feed-location-scope="header">
        <div class="loc-search-wrap">
          <div class="loc-input-row">
            <span class="loc-pin">${icon("map-pin", "w-3.5 h-3.5")}</span>
            <input id="feedLocationCityInput" type="text" inputmode="search" autocomplete="off" autocapitalize="words" spellcheck="false" data-feed-location-city-input aria-autocomplete="list" aria-controls="feedLocationCitySuggestions" aria-expanded="false" value="${escapeHtml(locationLabel)}" placeholder="Vendos qytetin tënd..." class="loc-input" />
            <div class="loc-request-wrap">
              <button id="btnLocateMe" type="button" data-feed-location-request class="loc-request-btn" aria-label="Standort nutzen">
                <i id="locateIcon" data-lucide="crosshair" class="w-3.5 h-3.5 relative z-10"></i>
                <span id="locatePulse" class="loc-request-pulse opacity-0"></span>
              </button>
            </div>
          </div>
          <div id="feedLocationCitySuggestions" data-feed-location-city-suggestions role="listbox" aria-hidden="true" class="feed-location-suggestions"></div>
          <p id="feedLocationStatus" class="loc-status hidden"></p>
        </div>
      </div>
    `;
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
    const isLandingTopTab = state.activeTab === "profile"
      && !!state.profileView?.profile
      && String(state.profileTopTab || "").trim().toLowerCase() === "landing";
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
    const headerLocationRecord = readStoredFeedViewerLocation();
    const showFeedLocationHeaderSearch = !isLandingTopTab && shouldShowFeedLocationHeaderSearch(headerLocationRecord);
    const feedLocationLabel = String(
      headerLocationRecord?.label
      || headerLocationRecord?.city
      || ""
    ).trim();
    const compactHeaderIcons = !!showFeedLocationHeaderSearch;
    const drawerButtonClass = compactHeaderIcons
      ? "text-slate-700 hover:bg-slate-100 w-9 h-9 p-2 -ml-1.5 rounded-full transition-colors active:scale-95 flex items-center justify-center"
      : "text-slate-700 hover:bg-slate-100 p-2 -ml-2 rounded-full transition-colors active:scale-95 flex items-center justify-center";
    const drawerIconClass = compactHeaderIcons ? "w-5 h-5" : "w-6 h-6";
    const actionButtonClass = compactHeaderIcons
      ? "w-9 h-9 flex items-center justify-center hover:bg-slate-100 rounded-full transition-colors active:scale-95"
      : "w-10 h-10 flex items-center justify-center hover:bg-slate-100 rounded-full transition-colors active:scale-95";
    const actionIconClass = compactHeaderIcons ? "w-5 h-5" : "w-5 h-5";

    return `
      <div class="smart-header-shell">
        <div id="smart-header-top" class="smart-header-top">
          <div class="px-5 h-16 flex items-center justify-between">
            <div class="flex items-center gap-3${showFeedLocationHeaderSearch ? " flex-1 min-w-0 pr-2" : ""}">
              <button id="drawerToggle" data-header-badge-anchor="true" type="button" class="${drawerButtonClass}">
                ${icon("menu", drawerIconClass)}
              </button>
              ${showFeedLocationHeaderSearch
                ? renderFeedLocationHeaderSearch(feedLocationLabel)
                : `
                  <div class="flex items-baseline gap-1.5 cursor-pointer" data-nav="feed">
                    <h1 class="text-2xl font-black italic tracking-tighter leading-none text-slate-900">MNYRA</h1>
                    <span class="text-[9px] font-black text-indigo-600 uppercase tracking-[0.25em] mb-[1px]">Social</span>
                  </div>
                `}
            </div>
            <div class="flex shrink-0 items-center ${compactHeaderIcons ? "gap-1.5" : "gap-1.5"} text-slate-600">
              <button type="button" class="${actionButtonClass}">
                ${icon("globe", actionIconClass)}
              </button>
              <button type="button" ${guestSession ? 'data-auth-open="true"' : 'data-nav="profile"'} class="${actionButtonClass}">
                ${icon("user", actionIconClass)}
              </button>
              <button type="button" data-action="cart" class="smart-header-cart-btn ${actionButtonClass} text-slate-900">
                ${icon("shopping-bag", actionIconClass)}
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
    const revealImage = (img) => {
      if (!(img instanceof HTMLImageElement)) return;
      if (img.dataset.imageReveal !== "menu") return;
      if (img.dataset.imageRevealReady === "1") return;
      img.dataset.imageRevealReady = "1";
      img.style.opacity = "1";
    };
    const armImageReveal = (img) => {
      if (!(img instanceof HTMLImageElement)) return;
      if (img.dataset.imageReveal !== "menu") return;
      const src = String(img.currentSrc || img.getAttribute("src") || "").trim();
      if (!src) return;
      if (img.dataset.imageRevealSrc !== src) {
        const keepVisible = img.dataset.imageRevealKeepVisibleOnce === "1";
        img.dataset.imageRevealSrc = src;
        img.dataset.imageRevealReady = "0";
        if (img.dataset.imageRevealStyled !== "1") {
          const existingTransition = String(img.style.transition || "").trim();
          if (!existingTransition) {
            img.style.transition = "opacity 180ms ease-out";
          } else if (!/opacity/i.test(existingTransition)) {
            img.style.transition = `${existingTransition}, opacity 180ms ease-out`;
          }
          img.dataset.imageRevealStyled = "1";
        }
        if (keepVisible) {
          img.dataset.imageRevealKeepVisibleOnce = "0";
          img.style.opacity = "1";
        } else {
          img.style.opacity = "0";
          incrementImageFlashCount(1);
        }
      }
      const revealWhenDecoded = () => {
        if (img.dataset.imageRevealReady === "1") return;
        if (typeof img.decode === "function") {
          img.decode().catch(() => {}).finally(() => revealImage(img));
          return;
        }
        revealImage(img);
      };
      if (img.complete && Number(img.naturalWidth || 0) > 0) {
        revealWhenDecoded();
      } else if (img.dataset.imageRevealLoadBound !== "1") {
        img.dataset.imageRevealLoadBound = "1";
        img.addEventListener("load", revealWhenDecoded);
      }
      if (img.dataset.imageRevealTimeoutBound !== "1") {
        img.dataset.imageRevealTimeoutBound = "1";
        win?.setTimeout?.(() => {
          if (img.dataset.imageRevealReady === "1") return;
          if (img.complete && Number(img.naturalWidth || 0) > 0) {
            revealImage(img);
          }
        }, 8000);
      }
    };
    const hydrateMenuLazyImage = (img) => {
      if (!(img instanceof HTMLImageElement)) return;
      if (img.dataset.menuLazyHydrated === "1") return;
      const lazySrc = String(img.dataset.menuLazySrc || "").trim();
      if (!lazySrc) return;
      const lazyFallback = String(img.dataset.menuLazyFallback || "").trim();
      const lazySrcset = String(img.dataset.menuLazySrcset || "").trim();
      const lazySizes = String(img.dataset.menuLazySizes || "").trim();
      if (lazySrcset) {
        img.setAttribute("srcset", lazySrcset);
      } else {
        img.removeAttribute("srcset");
      }
      if (lazySizes) {
        img.setAttribute("sizes", lazySizes);
      } else {
        img.removeAttribute("sizes");
      }
      if (lazyFallback) {
        img.setAttribute("data-fallback-src", lazyFallback);
      }
      img.setAttribute("src", lazySrc);
      img.dataset.menuLazyHydrated = "1";
      img.removeAttribute("data-menu-lazy-src");
      img.removeAttribute("data-menu-lazy-fallback");
      img.removeAttribute("data-menu-lazy-srcset");
      img.removeAttribute("data-menu-lazy-sizes");
      if (menuLazyImageObserver) {
        try {
          menuLazyImageObserver.unobserve(img);
        } catch {}
      }
      armImageReveal(img);
    };
    const shouldHydrateMenuLazyImageNow = (img) => {
      if (!(img instanceof HTMLImageElement)) return false;
      const rect = img.getBoundingClientRect();
      const viewportHeight = Math.max(0, Number(win?.innerHeight || doc?.documentElement?.clientHeight || 0));
      if (!viewportHeight) return true;
      return rect.top <= viewportHeight + 120 && rect.bottom >= -64;
    };
    const ensureMenuLazyImageObserver = () => {
      if (menuLazyImageObserver || typeof IntersectionObserver === "undefined") return menuLazyImageObserver;
      menuLazyImageObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          hydrateMenuLazyImage(entry.target);
        });
      }, {
        root: null,
        rootMargin: "120px 0px",
        threshold: 0.01
      });
      return menuLazyImageObserver;
    };
    root.querySelectorAll("img[data-menu-lazy-src]").forEach((img) => {
      if (!(img instanceof HTMLImageElement)) return;
      if (img.dataset.menuLazyHydrated === "1") return;
      if (shouldHydrateMenuLazyImageNow(img)) {
        hydrateMenuLazyImage(img);
        return;
      }
      const observer = ensureMenuLazyImageObserver();
      if (!observer) {
        hydrateMenuLazyImage(img);
        return;
      }
      if (img.dataset.menuLazyObserved !== "1") {
        img.dataset.menuLazyObserved = "1";
        observer.observe(img);
      }
    });
    const withImageRetryToken = (url = "") => {
      const raw = String(url || "").trim();
      if (!raw) return "";
      if (/^(data|blob):/i.test(raw)) return "";
      const token = Date.now().toString(36);
      const hashIndex = raw.indexOf("#");
      const hash = hashIndex >= 0 ? raw.slice(hashIndex) : "";
      const baseWithQuery = hashIndex >= 0 ? raw.slice(0, hashIndex) : raw;
      const base = baseWithQuery
        .replace(/([?&])__mnyra_retry=[^&]*/gi, "$1")
        .replace(/[?&]$/, "");
      const joiner = base.includes("?") ? "&" : "?";
      return `${base}${joiner}__mnyra_retry=${encodeURIComponent(token)}${hash}`;
    };
    root.querySelectorAll("img[data-fallback-src]").forEach((img) => {
      if (!(img instanceof HTMLImageElement)) return;
      armImageReveal(img);
      if (img.dataset.fallbackBound === "true") return;
      img.dataset.fallbackBound = "true";
      img.addEventListener("error", () => {
        const fallback = img.dataset.fallbackSrc || "";
        const current = img.getAttribute("src") || "";
        if (img.dataset.fallbackRetried !== "1" && current && current !== fallback && current !== PLACEHOLDER_IMAGE) {
          const retrySrc = withImageRetryToken(current);
          if (retrySrc && retrySrc !== current) {
            img.dataset.fallbackRetried = "1";
            img.dataset.imageRevealKeepVisibleOnce = "1";
            img.setAttribute("src", retrySrc);
            armImageReveal(img);
            return;
          }
        }
        if (fallback && current !== fallback) {
          img.dataset.imageRevealKeepVisibleOnce = "1";
          img.setAttribute("src", fallback);
          armImageReveal(img);
          return;
        }
        if (current !== PLACEHOLDER_IMAGE) {
          img.dataset.imageRevealKeepVisibleOnce = "1";
          img.setAttribute("src", PLACEHOLDER_IMAGE);
          armImageReveal(img);
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

    const hasExistingBinding = smartHeaderBoundTopEl === topEl
      && smartHeaderBoundTabsEl === (tabs || null);
    if (hasExistingBinding) {
      if (syncSmartHeaderMetrics()) {
        smartHeaderLastScrollY = Math.max(0, Number(win.scrollY || 0));
        smartHeaderToggleAnchorY = smartHeaderLastScrollY;
      }
      return;
    }

    stopSmartHeaderVisibilitySync({ resetState: false });
    syncSmartHeaderMetrics();
    smartHeaderLastScrollY = Math.max(0, Number(win.scrollY || 0));
    smartHeaderToggleAnchorY = smartHeaderLastScrollY;
    smartHeaderVisible = true;
    smartHeaderBoundTopEl = topEl;
    smartHeaderBoundTabsEl = tabs || null;
    smartHeaderResizeListener = null;
    smartHeaderScrollListener = null;
    if (!tabs) return;
    tabs.classList.remove("smart-header-tabs--hidden");
    smartHeaderVisible = true;
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

  function syncFeedLocationGateChromeState() {
    if (!doc) return;
    const htmlEl = doc.documentElement;
    const bodyEl = doc.body;
    const activeTabKey = String(state.activeTab || "").trim().toLowerCase();
    const isFeedLocationScope = activeTabKey === "feed";
    const gateRoot = doc.getElementById("feedLocationGate");
    const hasFeedLocationGateRoot = !!gateRoot;
    const isFeedLocationGate = isFeedLocationScope && hasFeedLocationGateRoot;
    const gateMode = String(gateRoot?.dataset?.locationScreenMode || "").trim().toLowerCase();
    const isFeedLocationFeedStage = isFeedLocationGate && gateMode === "feed-stage";
    if (htmlEl) {
      htmlEl.classList.toggle("feed-location-gate-active", !!isFeedLocationGate);
      htmlEl.classList.toggle("feed-location-feed-stage-active", !!isFeedLocationFeedStage);
    }
    if (bodyEl) {
      bodyEl.classList.toggle("feed-location-gate-active", !!isFeedLocationGate);
      bodyEl.classList.toggle("feed-location-feed-stage-active", !!isFeedLocationFeedStage);
    }
    const mainEl = doc.querySelector("main");
    if (mainEl) {
      mainEl.classList.toggle("feed-location-gate-main", !!isFeedLocationGate);
    }
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
    const currentFeedLocationRenderKey = buildFeedLocationRenderKey();
    const didFeedLocationRenderKeyChange = currentFeedLocationRenderKey !== lastFeedLocationRenderKey;
    const changed = nextHtml !== prevLastAppHtml || mode !== prevLastRenderMode;
    const existingMountedHtml = appEl ? String(appEl.innerHTML || "") : "";
    const hasStartupSnapshotMounted = !!appEl
      && String(appEl.dataset?.startupSnapshot || "").trim() === "1";
    const shouldReuseExistingMountedHtml = changed
      && !prevLastAppHtml
      && hasStartupSnapshotMounted
      && existingMountedHtml === nextHtml;
    if (changed) {
      const prevLastRenderedMainTab = getLastRenderedMainTab();
      const isChatThreadOpen = mode === "main"
        && state.activeTab === "chat"
        && !!state.chatModal.open
        && !!state.chatModal.profile;
      const didMainTabChange = mode === "main"
        && prevLastRenderMode === "main"
        && !!prevLastRenderedMainTab
        && state.activeTab !== prevLastRenderedMainTab;
      const preserveMainScroll = mode === "main"
        && prevLastRenderMode === "main"
        && state.activeTab === prevLastRenderedMainTab
        && !isChatThreadOpen;
      const preserveViewportScroll = preserveMainScroll
        && (!!doc?.scrollingElement || (!!win && typeof win.scrollTo === "function"));
      const preserveSmartHeaderWindowScroll = preserveMainScroll
        && shouldShowSmartHeaderTabs()
        && !!win
        && typeof win.scrollTo === "function";
      const reuseFeed = preserveMainScroll
        && state.activeTab === "feed"
        && !didFeedLocationRenderKeyChange
        ? doc?.getElementById("feedView")
        : null;
      const reuseFeedViewMode = String(reuseFeed?.dataset?.feedViewMode || "").trim().toLowerCase();
      const mapSurfaceActive = state.activeTab === "map" || isLandingMapPreviewActive();
      const reuseLeafletMapCanvas = preserveMainScroll && mapSurfaceActive
        ? doc?.getElementById("leafletMap")
        : null;
      const preservedMapSearchQuery = preserveMainScroll && state.activeTab === "map"
        ? String(doc?.getElementById("mapSearchInput")?.value || "")
        : "";
      const prevScrollTop = preserveMainScroll ? doc?.querySelector("main")?.scrollTop ?? 0 : 0;
      const prevViewportScrollTop = preserveViewportScroll ? getViewportScrollTop() : 0;
      let nextViewportScrollTop = null;
      if (preserveSmartHeaderWindowScroll) armSmartHeaderScrollGuard();
      if (appEl) {
        if (!shouldReuseExistingMountedHtml) {
          appEl.innerHTML = nextHtml;
        }
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
      if (reuseLeafletMapCanvas) {
        const nextLeafletMapCanvas = doc?.getElementById("leafletMap");
        if (nextLeafletMapCanvas && reuseLeafletMapCanvas !== nextLeafletMapCanvas) {
          nextLeafletMapCanvas.replaceWith(reuseLeafletMapCanvas);
        }
      }
      if (reuseFeed) {
        const nextFeed = doc?.getElementById("feedView");
        const nextFeedViewMode = String(nextFeed?.dataset?.feedViewMode || "").trim().toLowerCase();
        const canReuseFeed = !!nextFeed
          && reuseFeed !== nextFeed
          && !!reuseFeedViewMode
          && reuseFeedViewMode === nextFeedViewMode;
        if (canReuseFeed) {
          nextFeed.replaceWith(reuseFeed);
        } else {
          const nextMain = doc?.querySelector("main");
          if (nextMain) nextMain.scrollTop = 0;
          nextViewportScrollTop = 0;
        }
        if (canReuseFeed) {
          const nextMain = doc?.querySelector("main");
          if (nextMain) nextMain.scrollTop = prevScrollTop;
          nextViewportScrollTop = prevViewportScrollTop;
        }
        updateFeedDomFn();
      } else if (preserveMainScroll) {
        const nextMain = doc?.querySelector("main");
        if (nextMain) nextMain.scrollTop = prevScrollTop;
        nextViewportScrollTop = prevViewportScrollTop;
      }
      if (preservedMapSearchQuery && state.activeTab === "map") {
        const nextMapSearchInput = doc?.getElementById("mapSearchInput");
        if (nextMapSearchInput && nextMapSearchInput.value !== preservedMapSearchQuery) {
          nextMapSearchInput.value = preservedMapSearchQuery;
        }
      }
      if (nextViewportScrollTop !== null) {
        if (preserveSmartHeaderWindowScroll) armSmartHeaderScrollGuard();
        setViewportScrollTop(nextViewportScrollTop);
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
      if (nextViewportScrollTop !== null && (didMainTabChange || preserveMainScroll)) {
        if (preserveSmartHeaderWindowScroll) armSmartHeaderScrollGuard();
        scheduleViewportScrollTop(nextViewportScrollTop);
      }
      if (mode === "main") setLastRenderedMainTab(state.activeTab);
      else setLastRenderedMainTab("");
    }
    lastFeedLocationRenderKey = currentFeedLocationRenderKey;

    const nextHeaderRuntimeMode = shouldUseSmartHeader() ? "smart" : "business-tabs";
    if (changed || nextHeaderRuntimeMode !== lastHeaderRuntimeMode) {
      if (nextHeaderRuntimeMode === "smart") {
        stopBusinessTopTabsPinSync();
        initSmartHeaderVisibilitySync();
      } else {
        stopSmartHeaderVisibilitySync();
        bindBusinessTopTabsPinSync();
      }
      lastHeaderRuntimeMode = nextHeaderRuntimeMode;
    }

    const nextOverlayRenderSignature = buildOverlayRenderSignature();
    if (changed || nextOverlayRenderSignature !== lastOverlayRenderSignature) {
      renderOverlaysFn();
      lastOverlayRenderSignature = nextOverlayRenderSignature;
    }
    if (mode === "main" || getLastRenderMode() === "main") {
      const nextNotificationBadgeSignature = buildNotificationBadgeSignature();
      if (changed || nextNotificationBadgeSignature !== lastNotificationBadgeSignature) {
        updateNotificationBadgesFn();
        lastNotificationBadgeSignature = nextNotificationBadgeSignature;
      }
    }
    updateFocusRotationFn();

    const nextMapRuntimeSignature = buildMapRuntimeSignature(mode);
    const shouldRecoverMapSurface = shouldRecoverLeafletMapSurface(mode);
    const mapSurfaceActive = mode === "main" && (state.activeTab === "map" || isLandingMapPreviewActive());
    if (mapSurfaceActive) {
      if (changed || nextMapRuntimeSignature !== lastMapRuntimeSignature || shouldRecoverMapSurface) {
        scheduleMapRuntimeRefresh();
      }
      lastMapRuntimeSignature = nextMapRuntimeSignature;
    } else if (nextMapRuntimeSignature !== lastMapRuntimeSignature) {
      cleanupLeafletFn();
      lastMapRuntimeSignature = nextMapRuntimeSignature;
    }

    if (!firstGuestLandingMeasured && mode === "main" && !state.user) {
      firstGuestLandingMeasured = true;
      finishRuntimeBudgetTrace("cold_guest_landing", {
        startMarkName: "mnyra.social.cold_guest.start"
      });
    }

    syncFeedLocationGateChromeState();
    syncRuntimeDegradedBanner({ force: changed });
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
      ensureMenuDataForProfileFn: (...args) => runBudgetWrapped("menu_open", () => ensureMenuDataForProfileFn(...args)),
      ensureFocusDataForProfileFn,
      refreshLandingMapRuntimeFn: refreshLandingMapRuntime,
      bindAppMenuFocusEventsCoreFn,
      saveMenuLayoutToStorageFn,
      openMenuModalFn,
      deleteMenuItemByIdFn,
      triggerMenuDetailOpenFromGestureFn,
      updateShopCartQuantityFn: (...args) => runBudgetWrapped("add_to_cart", () => updateShopCartQuantityFn(...args)),
      updateShopCartItemCommentFn,
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
      openProfileViewFromBusinessFn: (...args) => runBudgetWrapped("profile_open", () => openProfileViewFromBusinessFn(...args)),
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
        runBudgetWrapped("profile_open", () => openProfileFromUserFn({
          uid: userBtn.dataset.searchUser || "",
          handle: userBtn.dataset.searchHandle || "",
          name: userBtn.dataset.searchName || "",
          avatar: userBtn.dataset.searchAvatar || "",
          location: userBtn.dataset.searchLocation || ""
        }));
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
