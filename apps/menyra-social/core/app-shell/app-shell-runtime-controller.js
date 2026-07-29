import { resolveStartupRenderGate } from "../auth/startup-render-gate-utils.js";
import { isChatEnabledForV1 } from "../chat/chat-v1-guard.js";
import { getLang, getSupportedLanguages, t } from "../../../../shared/i18n/i18n.js";

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
    ensurePostsDataForProfileFn,
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
    uploadCompressedImageFn,
    menuCache,
    menuCacheKeyFn,
    saveMenuStatusBadgeVisibleFn,
    focusCache,
    focusCacheKeyFn,
    saveFocusEnabledFn,
    openFocusModalFn,
    deleteFocusItemByIdFn,
    deleteAdItemByIdFn,
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
    openOwnBusinessProfileFn,
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
  let mainHeaderTabsScrollListener = null;
  let mainHeaderTabsToggleEl = null;
  let mainHeaderTabsToggleHandler = null;
  let mainHeaderTabsRafId = 0;
  // Der Pfeil muss auch dann schalten, wenn die Seite nicht weit genug
  // scrollbar ist (kurzer Feed): "open"/"closed" haelt den gewuenschten
  // Zustand fest, bis der Scroll-Zustand von selbst dort ankommt.
  let mainHeaderTabsManualState = null;
  let mainHeaderTabsBootSyncPending = true;
  let mainHeaderTabsBootLockActive = true;
  let mainHeaderTabsBootLockBound = false;
  let mainHeaderTabsBootCorrections = 0;
  const MAIN_HEADER_TABS_BOOT_MAX_CORRECTIONS = 4;
  const MAIN_HEADER_TABS_BOOT_RELEASE_EVENTS = Object.freeze([
    "pointerdown",
    "touchstart",
    "wheel",
    "keydown"
  ]);
  const MAIN_HEADER_TABS_SLOT_FALLBACK_PX = 40;
  const MAIN_HEADER_TABS_MINIMIZED_PROGRESS = 0.45;
  const MAIN_HEADER_TABS_FADE_FACTOR = 1.8;
  const SMART_HEADER_TOP_RESET_PX = 50;
  const SMART_HEADER_HIDE_DELTA_PX = 18;
  const SMART_HEADER_SHOW_DELTA_PX = 14;
  const SMART_HEADER_SCROLL_JITTER_PX = 2;
  const SMART_HEADER_REBIND_GUARD_MS = 180;
  const doc = documentObj || (typeof document === "undefined" ? null : document);
  const win = windowObj || (typeof window === "undefined" ? null : window);
  const FEED_VIEWER_LOCATION_STORAGE_KEY = "mnyra_social_feed_viewer_location_v1";
  const tr = (key, fallback = key, params = {}) => t(key, { fallback, params });
  const translateCatalogLabel = (label = "") => {
    const safeLabel = String(label || "").trim();
    if (!safeLabel) return tr("nav.menu", "Menue");
    const normalized = safeLabel.toLowerCase();
    if (normalized === "menue" || normalized === "menu" || normalized === "menü") {
      return tr("nav.menu", safeLabel);
    }
    if (normalized === "shop") return "Shop";
    return safeLabel;
  };
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
  let autoplayVideoObserver = null;
  const revealedMenuImageSrcs = new Set();
  const REVEALED_MENU_IMAGE_SRC_MAX = 500;

  function normalizeMenuImageRevealSrc(src = "") {
    return String(src || "").trim();
  }

  function rememberRevealedMenuImageSrc(src = "") {
    const safeSrc = normalizeMenuImageRevealSrc(src);
    if (!safeSrc) return;
    if (revealedMenuImageSrcs.has(safeSrc)) {
      revealedMenuImageSrcs.delete(safeSrc);
    }
    revealedMenuImageSrcs.add(safeSrc);
    while (revealedMenuImageSrcs.size > REVEALED_MENU_IMAGE_SRC_MAX) {
      const oldestSrc = revealedMenuImageSrcs.values().next().value;
      if (!oldestSrc) break;
      revealedMenuImageSrcs.delete(oldestSrc);
    }
  }

  function hasRevealedMenuImageSrc(src = "") {
    const safeSrc = normalizeMenuImageRevealSrc(src);
    return !!safeSrc && revealedMenuImageSrcs.has(safeSrc);
  }

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

  function buildOverlayRenderSignature() {
    return [
      state.profileModal?.open ? "1" : "0",
      state.postModal?.open ? "1" : "0",
      state.likesModal?.open ? "1" : "0",
      state.menuModal?.open ? "1" : "0",
      state.menuDetail?.open ? "1" : "0",
      state.focusModal?.open ? "1" : "0",
      state.chatModal?.open ? "1" : "0",
      String(state.postModal?.post?.id || ""),
      String(state.menuDetail?.item?.id || state.menuDetail?.id || ""),
      String(state.chatModal?.profile?.uid || state.chatModal?.profile?.id || "")
    ].join("|");
  }

  function buildNotificationBadgeSignature() {
    const notifications = Array.isArray(state.notifications) ? state.notifications : [];
    const unreadNotifications = notifications.reduce((sum, item) => sum + (item?.read ? 0 : 1), 0);
    const chatEnabled = isChatEnabledForV1();
    const unreadChat = chatEnabled ? Number(getChatUnreadCount?.() || 0) || 0 : 0;
    return [
      notifications.length,
      unreadNotifications,
      chatEnabled && Array.isArray(state.chatThreads) ? state.chatThreads.length : 0,
      unreadChat,
      String(state.activeTab || "")
    ].join("|");
  }

  function isMapRuntimeSurfaceActive(mode = "") {
    if (mode !== "main") return false;
    if (state.activeTab === "map") return true;
    return state.activeTab === "travel"
      && String(state.travelView?.activeTab || "").trim().toLowerCase() === "map";
  }

  function buildMapRuntimeSignature(mode = "") {
    if (mode !== "main") return "off";
    if (!isMapRuntimeSurfaceActive(mode)) return `inactive:${String(state.activeTab || "")}`;
    const selectedBusiness = state.selectedBusiness || {};
    const selectedKey = String(
      selectedBusiness.markerKey
      || selectedBusiness.id
      || ""
    ).trim();
    const locationCount = Array.isArray(state.businessLocations) ? state.businessLocations.length : 0;
    const travelQuery = state.activeTab === "travel"
      ? String(state.travelView?.query || "").trim().toLowerCase()
      : "";
    return `map:${String(state.activeTab || "")}:${locationCount}:${selectedKey}:${travelQuery}`;
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

  function shouldRecoverLeafletMapSurface(mode) {
    if (!isMapRuntimeSurfaceActive(mode)) return false;
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

  function isStartupActionLocked() {
    if (state?.actionsLockedUntilAuthReady === true) return true;
    return resolveStartupRenderGate(state).actionsLocked === true;
  }

  function requireConfirmedSessionForMutation(scope = "") {
    if (!isStartupActionLocked()) return true;
    const safeScope = String(scope || "startup.action").trim() || "startup.action";
    if (state && typeof state === "object") {
      state.__startupLockedAction = {
        scope: safeScope,
        at: Date.now()
      };
    }
    return false;
  }

  function guardConfirmedAuthAction(scope = "", fn = null, fallback = undefined) {
    return (...args) => {
      if (!requireConfirmedSessionForMutation(scope)) return fallback;
      if (typeof fn !== "function") return fallback;
      return fn(...args);
    };
  }

  function renderStartupNeutralShell(gate = null) {
    const safeReason = escapeHtml(String(gate?.reason || "startup-render-gate").trim() || "startup-render-gate");
    return `
      <div class="app-shell bg-slate-50 text-slate-900 max-w-md mx-auto md:shadow-2xl relative font-sans" data-startup-render-gate="${safeReason}">
        <main class="app-main-scroll" aria-busy="true" aria-label="${escapeHtml(tr("menu.loading", "Mnyra po ngarkohet", { label: "Mnyra" }))}">
          <section class="p-6 pb-24">
            <div class="flex items-center justify-between mb-8">
              <div class="w-14 h-14 rounded-3xl bg-white border border-slate-100 shadow-sm overflow-hidden p-4">
                <div class="w-full h-0.5 rounded-full bg-slate-200 animate-pulse mb-1.5"></div>
                <div class="w-2/3 h-0.5 rounded-full bg-slate-200 animate-pulse mb-1.5"></div>
                <div class="w-5/6 h-0.5 rounded-full bg-slate-200 animate-pulse"></div>
              </div>
              <div class="text-center">
                <div class="h-7 w-28 rounded-xl bg-slate-200 animate-pulse"></div>
                <div class="h-2.5 w-14 rounded-full bg-slate-200 animate-pulse mx-auto mt-2"></div>
              </div>
              <div class="w-14 h-14 rounded-3xl bg-white border border-slate-100 shadow-sm overflow-hidden p-1">
                <div class="w-full h-full rounded-[1.4rem] bg-slate-200 animate-pulse"></div>
              </div>
            </div>
            <div class="space-y-4">
              <div class="rounded-[2rem] bg-white border border-slate-100 shadow-sm p-4">
                <div class="h-36 rounded-[1.5rem] bg-slate-200 animate-pulse"></div>
                <div class="mt-4 h-4 w-2/3 rounded-full bg-slate-200 animate-pulse"></div>
                <div class="mt-3 h-3 w-5/6 rounded-full bg-slate-100 animate-pulse"></div>
              </div>
              <div class="rounded-[2rem] bg-white border border-slate-100 shadow-sm p-4">
                <div class="h-4 w-1/2 rounded-full bg-slate-200 animate-pulse"></div>
                <div class="mt-4 grid grid-cols-3 gap-3">
                  <div class="h-20 rounded-2xl bg-slate-100 animate-pulse"></div>
                  <div class="h-20 rounded-2xl bg-slate-100 animate-pulse"></div>
                  <div class="h-20 rounded-2xl bg-slate-100 animate-pulse"></div>
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
    `;
  }

  function renderHeaderActionButton(avatarUrl, avatarFit) {
    if (!getAuthInitialized()) {
      const restoringRaw = getAuthBootstrapSnapshot()?.avatar || state.userProfile.avatar || getUserAvatarCache() || "";
      const restoringAvatar = getOptimizedImageUrl(restoringRaw, "avatar");
      if (restoringAvatar && !isPlaceholderUrl(restoringAvatar)) {
        return `
        <div aria-hidden="true" class="w-14 h-14 rounded-3xl shadow-xl overflow-hidden p-1 bg-white border border-slate-50 shadow-slate-200/30 pointer-events-none">
          <img src="${escapeHtml(restoringAvatar)}" data-fallback-src="${escapeHtml(PLACEHOLDER_IMAGE)}" class="w-full h-full rounded-[1.4rem] ${avatarFit}" />
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
        <span class="text-[8px] font-black uppercase tracking-[0.2em] mt-1">${escapeHtml(tr("auth.login", "Login"))}</span>
      </button>
    `;
    }
    return `
    <button data-nav="profile" class="w-14 h-14 rounded-3xl shadow-xl overflow-hidden p-1 active:scale-95 transition-transform bg-white border border-slate-50 shadow-slate-200/30">
      <img id="headerAvatar" data-img-key="avatar:header" src="${escapeHtml(avatarUrl)}" data-fallback-src="${escapeHtml(PLACEHOLDER_IMAGE)}" class="w-full h-full rounded-[1.4rem] ${avatarFit}" />
    </button>
  `;
  }

  function shouldUseSmartHeader() {
    const isStaffFormView = state.activeTab === "staff" && state.staff?.view === "form";
    const isChatThreadOpen = isChatEnabledForV1() && state.activeTab === "chat" && !!state.chatModal?.open && !!state.chatModal?.profile;
    return !!String(state.activeTab || "").trim() && !isStaffFormView && !isChatThreadOpen;
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
    if (requestedTopTab === "landing") return false;
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
    const sameRestaurant = state.menu.restaurantId === restaurantId
      && String(state.menu.source || "").trim().toLowerCase() === "public";
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
      longTitleClass: isCompact ? "text-[1.15rem]" : "text-xl",
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
    const activeTabKey = state.activeTab;
    return !!locationRecord && (activeTabKey === "feed" || activeTabKey === "home" || activeTabKey === "restaurants");
  }

  function renderFeedLocationHeaderSearch(locationLabel = "") {
    return `
      <div class="smart-header-feed-location" data-feed-location-scope="header">
        <div class="loc-search-wrap">
          <div class="loc-input-row">
            <span class="loc-pin">${icon("map-pin", "w-3.5 h-3.5")}</span>
            <input id="feedLocationCityInput" type="text" inputmode="search" autocomplete="off" autocapitalize="words" spellcheck="false" data-feed-location-city-input aria-autocomplete="list" aria-controls="feedLocationCitySuggestions" aria-expanded="false" value="${escapeHtml(locationLabel)}" placeholder="${escapeHtml(tr("feed.locationPlaceholder", "Vendos qytetin tend..."))}" class="loc-input" />
            <div class="loc-request-wrap">
              <button id="btnLocateMe" type="button" data-feed-location-request class="loc-request-btn" aria-label="${escapeHtml(tr("header.useLocation", "Perdor vendndodhjen"))}">
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

  function isLanguagePickerOpen() {
    const scope = win || globalThis;
    return !!scope.__MENYRA_SOCIAL_LANGUAGE_PICKER_OPEN__;
  }

  function renderLanguageToggleButton(buttonClass = "", iconClass = "w-5 h-5") {
    return `
      <button
        type="button"
        data-language-toggle="true"
        class="${buttonClass}"
        aria-label="${escapeHtml(tr("language.toggle", "Zgjidh gjuhen"))}"
        aria-expanded="${isLanguagePickerOpen() ? "true" : "false"}"
      >
        ${icon("globe", iconClass)}
      </button>
    `;
  }

  function renderLanguagePickerPanel() {
    if (!isLanguagePickerOpen()) return "";
    const activeLang = getLang();
    return `
      <div class="px-5 pb-3">
        <div class="grid grid-cols-3 gap-2 rounded-[1.6rem] border border-slate-100 bg-white/90 p-1.5 shadow-sm">
          ${getSupportedLanguages().map((item) => {
            const active = item.code === activeLang;
            return `
              <button
                type="button"
                data-language-option="${escapeHtml(item.code)}"
                class="h-10 rounded-[1.15rem] text-[10px] font-black uppercase tracking-widest transition-colors ${active ? "bg-slate-900 text-white" : "text-slate-500 hover:bg-slate-50"}"
                aria-pressed="${active ? "true" : "false"}"
              >
                ${escapeHtml(item.label)}
              </button>
            `;
          }).join("")}
        </div>
      </div>
    `;
  }

  function renderBusinessHeaderCenter(profile = getActiveHeaderProfile()) {
    const viewportUi = resolveBusinessHeaderViewportUi();
    const businessName = String(profile?.name || profile?.restaurantName || profile?.businessName || "Business").trim() || "Business";
    const businessNameParts = businessName.split(/\s+/).filter(Boolean);
    const rawBusinessTitle = String(
      businessNameParts.length > 1
        ? businessNameParts.slice(0, -1).join(" ")
        : (businessNameParts[0] || businessName)
    ).trim();
    const businessTitle = rawBusinessTitle && rawBusinessTitle.length <= 5
      ? rawBusinessTitle.toUpperCase()
      : rawBusinessTitle;
    const businessSubtitle = businessNameParts.length > 1
      ? businessNameParts[businessNameParts.length - 1]
      : (businessTitle.length > 10 ? "" : "Social");
    const businessSubtitleTrackingClass = businessSubtitle.length > 10
      ? "tracking-[0.12em]"
      : "tracking-[0.25em]";
    const compactNameLayout = businessName.replace(/\s+/g, "").length > 12 || rawBusinessTitle.length > 13;
    const businessTitleClass = compactNameLayout ? viewportUi.longTitleClass : viewportUi.titleClass;
    const businessNameGapClass = compactNameLayout ? "gap-1" : "gap-1.5";
    const renderBusinessName = () => `
      <button type="button" data-business-profile-home="true" title="${escapeHtml(businessName)}" class="inline-block min-w-0 max-w-full text-left active:opacity-90 transition-opacity">
        <div class="inline-flex items-baseline ${businessNameGapClass} min-w-0 max-w-full">
          <div class="min-w-0 max-w-full overflow-visible" style="flex:0 1 auto;">
            <h1 class="block min-w-0 overflow-hidden text-ellipsis whitespace-nowrap ${businessTitleClass} font-black italic tracking-tighter leading-none text-slate-900" style="padding-left:4px;margin-left:-4px;padding-right:4px;">${escapeHtml(businessTitle)}</h1>
          </div>
          ${businessSubtitle ? `<span class="shrink-0 min-w-0 max-w-[44%] overflow-hidden text-ellipsis whitespace-nowrap pl-0.5 ${viewportUi.subtitleClass} font-black text-indigo-600 uppercase ${businessSubtitleTrackingClass} mb-[1px]">${escapeHtml(businessSubtitle)}</span>` : ""}
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
        ${renderLanguageToggleButton(`${secondaryActionClass} flex-col gap-0.5`, viewportUi.actionIconClass)}
        <button type="button" data-action="cart" class="smart-header-cart-btn ${primaryActionClass}">
          ${icon("shopping-bag", viewportUi.actionIconClass)}
          ${cartCount > 0 ? `<span class="smart-header-cart-badge">${escapeHtml(cartCount > 99 ? "99+" : String(cartCount))}</span>` : ""}
        </button>
        ${menuActive ? `
          <button type="button" data-action="kellner" title="${escapeHtml(tr("header.callWaiter", "Thirr kamarierin"))}" class="${primaryActionClass}">
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

  // Die Feed/Restaurants-Tabs erscheinen erst, wenn eine Stadt gesetzt ist -
  // vorher laeuft der Nutzer noch durch das Location-Gate.
  function isMainHeaderTabsScope(locationRecord = readStoredFeedViewerLocation()) {
    if (!locationRecord) return false;
    const isLandingTopTab = state.activeTab === "profile"
      && String(state.profileTopTab || "").trim().toLowerCase() === "landing";
    if (isLandingTopTab) return false;
    return shouldShowFeedLocationHeaderSearch(locationRecord);
  }

  function renderMainHeaderTabs(locationRecord = readStoredFeedViewerLocation()) {
    if (!isMainHeaderTabsScope(locationRecord)) return "";
    const activeTabKey = String(state.activeTab || "").trim().toLowerCase();
    const tabs = [
      { id: "feed", label: tr("nav.feed", "Feed"), active: activeTabKey !== "restaurants" },
      { id: "restaurants", label: tr("nav.restaurants", "Restaurants"), active: activeTabKey === "restaurants" }
    ];
    return `
      <div id="smart-tabs" class="smart-header-tabs smart-header-tabs--main">
        <div class="smart-header-tabs-row">
          ${tabs.map((tab) => `
            <button
              type="button"
              data-nav="${escapeHtml(tab.id)}"
              data-main-header-tab="${escapeHtml(tab.id)}"
              aria-current="${tab.active ? "page" : "false"}"
              class="smart-header-pill ${tab.active ? "smart-header-pill--active" : ""}"
            >${escapeHtml(tab.label)}</button>
          `).join("")}
        </div>
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
      && String(state.profileTopTab || "").trim().toLowerCase() === "landing";
    const activeProfile = getActiveHeaderProfile();
    if (isBusinessProfileHeaderContext(activeProfile)) {
      const viewportUi = resolveBusinessHeaderViewportUi();
      const menuHeaderActive = isBusinessMenuHeaderContext(activeProfile);
      const menuCategoryHeaderActive = menuHeaderActive && getBusinessHeaderMenuCategories(activeProfile).length > 0;
      return `
        <div class="smart-header-shell">
          <div id="smart-header-top" class="smart-header-top">
            <div class="${viewportUi.headerPaddingClass} h-16 flex items-center ${menuCategoryHeaderActive ? viewportUi.headerGapClass : `justify-between ${viewportUi.headerGapClass}`}">
              <div class="flex ${menuCategoryHeaderActive ? "shrink-0" : "flex-1 min-w-0"} items-center ${viewportUi.headerGapClass} ${viewportUi.leftGroupPaddingClass}">
                <button id="drawerToggle" data-header-badge-anchor="true" type="button" class="text-slate-700 hover:bg-slate-100 ${viewportUi.drawerButtonClass} rounded-full transition-colors active:scale-95 flex items-center justify-center shrink-0">
                  ${icon("menu", viewportUi.drawerIconClass)}
                </button>
                ${menuCategoryHeaderActive ? "" : renderBusinessHeaderCenter(activeProfile)}
              </div>
              ${menuCategoryHeaderActive ? `<div class="flex-1 min-w-0">${renderBusinessHeaderCenter(activeProfile)}</div>` : ""}
              ${renderBusinessHeaderActions(activeProfile)}
            </div>
            ${renderLanguagePickerPanel()}
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
    const headerTabsHtml = renderMainHeaderTabs(headerLocationRecord);
    const hasHeaderTabs = !!headerTabsHtml;
    // Der Collapse-Pfeil braucht Platz in der oberen Zeile: Location-Feld und
    // Abstaende werden dafuer nur in der Breite schmaler, nicht in der Hoehe.
    const compactHeaderIcons = !!showFeedLocationHeaderSearch || hasHeaderTabs;
    const tightHeaderRow = hasHeaderTabs;
    const headerRowPaddingClass = tightHeaderRow ? "px-4" : "px-5";
    const headerLeadGapClass = tightHeaderRow ? "gap-2" : "gap-3";
    const headerActionsGapClass = tightHeaderRow ? "gap-1" : "gap-1.5";
    const drawerButtonClass = compactHeaderIcons
      ? "text-slate-700 hover:bg-slate-100 w-9 h-9 p-2 -ml-1.5 rounded-full transition-colors active:scale-95 flex items-center justify-center"
      : "text-slate-700 hover:bg-slate-100 p-2 -ml-2 rounded-full transition-colors active:scale-95 flex items-center justify-center";
    const drawerIconClass = compactHeaderIcons ? "w-5 h-5" : "w-6 h-6";
    const actionButtonClass = compactHeaderIcons
      ? "w-9 h-9 flex items-center justify-center hover:bg-slate-100 rounded-full transition-colors active:scale-95"
      : "w-10 h-10 flex items-center justify-center hover:bg-slate-100 rounded-full transition-colors active:scale-95";
    const actionIconClass = "w-5 h-5";
    const collapseButtonClass = compactHeaderIcons
      ? "w-7 h-9 flex items-center justify-center hover:bg-slate-100 rounded-full transition-colors active:scale-95"
      : "w-8 h-10 flex items-center justify-center hover:bg-slate-100 rounded-full transition-colors active:scale-95";
    const collapseButtonLabel = tr("header.toggleTabs", "Shfaq ose fsheh tabet");

    // Die Tab-Zeile liegt bewusst ausserhalb des stickenden Shells: nur die
    // obere Leiste bleibt oben kleben, die Tabs scrollen normal mit dem Content
    // weg und wandern dabei hinter die Leiste. So aendert sich beim Scrollen
    // keine Layout-Hoehe und die Seite springt nicht.
    return `
      <div class="smart-header-shell${hasHeaderTabs ? " smart-header-shell--split" : ""}">
        <div id="smart-header-top" class="smart-header-top">
          <div class="${headerRowPaddingClass} h-16 flex items-center justify-between">
            <div class="flex items-center ${headerLeadGapClass}${showFeedLocationHeaderSearch ? " flex-1 min-w-0 pr-2" : ""}">
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
            <div class="smart-header-actions flex shrink-0 items-center ${headerActionsGapClass} text-slate-600">
              ${renderLanguageToggleButton(`${actionButtonClass} flex-col gap-0.5`, actionIconClass)}
              <button type="button" ${guestSession ? 'data-auth-open="true"' : 'data-nav="profile"'} class="${actionButtonClass}">
                ${icon("user", actionIconClass)}
              </button>
              <button type="button" data-action="cart" class="smart-header-cart-btn ${actionButtonClass} text-slate-900">
                ${icon("shopping-bag", actionIconClass)}
                ${cartCount > 0 ? `<span class="smart-header-cart-badge">${escapeHtml(cartCount > 99 ? "99+" : String(cartCount))}</span>` : ""}
              </button>
              ${hasHeaderTabs ? `
                <button
                  type="button"
                  data-main-header-tabs-toggle="true"
                  aria-controls="smart-tabs"
                  aria-expanded="true"
                  aria-label="${escapeHtml(collapseButtonLabel)}"
                  title="${escapeHtml(collapseButtonLabel)}"
                  class="smart-header-collapse-btn ${collapseButtonClass}"
                >
                  ${icon("chevron-down", "w-5 h-5")}
                </button>
              ` : ""}
            </div>
            </div>
            ${renderLanguagePickerPanel()}
          </div>
        </div>
        ${headerTabsHtml}
    `;
  }

  function renderHeader() {
    if (shouldUseSmartHeader()) {
      return renderSmartHeader();
    }
    const unread = isGuestSession() ? 0 : state.notifications.filter((n) => !n.read).length;
    const chatUnread = isGuestSession() || !isChatEnabledForV1() ? 0 : getChatUnreadCount();
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
    if (isChatEnabledForV1() && state.activeTab === "chat" && state.chatModal.open && state.chatModal.profile) {
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
    if (isChatEnabledForV1() && state.activeTab === "chat") {
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
      const src = normalizeMenuImageRevealSrc(img.currentSrc || img.getAttribute("src") || "");
      rememberRevealedMenuImageSrc(src);
      if (img.dataset.imageRevealReady === "1") {
        img.style.opacity = "1";
        return;
      }
      img.dataset.imageRevealReady = "1";
      img.style.opacity = "1";
    };
    const armImageReveal = (img) => {
      if (!(img instanceof HTMLImageElement)) return;
      if (img.dataset.imageReveal !== "menu") return;
      const src = normalizeMenuImageRevealSrc(img.currentSrc || img.getAttribute("src") || "");
      if (!src) return;
      const imageAlreadyReady = hasRevealedMenuImageSrc(src) || (img.complete && Number(img.naturalWidth || 0) > 0);
      if (img.dataset.imageRevealSrc !== src) {
        img.dataset.imageRevealSrc = src;
        img.dataset.imageRevealReady = imageAlreadyReady ? "1" : "0";
        if (img.dataset.imageRevealStyled !== "1") {
          const existingTransition = String(img.style.transition || "").trim();
          if (!existingTransition) {
            img.style.transition = "opacity 180ms ease-out";
          } else if (!/opacity/i.test(existingTransition)) {
            img.style.transition = `${existingTransition}, opacity 180ms ease-out`;
          }
          img.dataset.imageRevealStyled = "1";
        }
        img.style.opacity = imageAlreadyReady ? "1" : "0";
      }
      if (imageAlreadyReady) {
        rememberRevealedMenuImageSrc(src);
        img.dataset.imageRevealReady = "1";
        img.style.opacity = "1";
        return;
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
    root.querySelectorAll("img[data-fallback-src]").forEach((img) => {
      if (!(img instanceof HTMLImageElement)) return;
      armImageReveal(img);
      if (img.dataset.fallbackBound === "true") return;
      img.dataset.fallbackBound = "true";
      img.addEventListener("error", () => {
        img.removeAttribute("srcset");
        img.removeAttribute("sizes");
        const fallback = img.dataset.fallbackSrc || "";
        const current = img.getAttribute("src") || "";
        if (fallback && current !== fallback) {
          img.setAttribute("src", fallback);
          armImageReveal(img);
          return;
        }
        if (current !== PLACEHOLDER_IMAGE) {
          img.setAttribute("src", PLACEHOLDER_IMAGE);
          armImageReveal(img);
        }
      });
    });
    activateAutoplayVideos(root);
  }

  // Stummes Auto-Loop-Video (Speisen-Grid, Fokus-Karussell) zuverlaessig
  // starten, sobald es bereit ist. Das autoplay-Attribut allein greift bei
  // dynamisch eingefuegten Videos (iOS/PWA) nicht immer, darum hier explizit
  // play() auf canplay + sichtbar via IntersectionObserver.
  function ensureAutoplayVideoObserver() {
    if (autoplayVideoObserver || typeof IntersectionObserver === "undefined") return autoplayVideoObserver;
    autoplayVideoObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const video = entry.target;
        if (!video) return;
        if (entry.isIntersecting) {
          video.muted = true;
          const attempt = video.play();
          if (attempt && typeof attempt.catch === "function") attempt.catch(() => {});
        } else if (!video.paused) {
          try { video.pause(); } catch {}
        }
      });
    }, { root: null, rootMargin: "160px 0px", threshold: 0.25 });
    return autoplayVideoObserver;
  }

  function activateAutoplayVideos(root = doc) {
    if (!root || typeof root.querySelectorAll !== "function") return;
    root.querySelectorAll("video[data-autoplay-video]").forEach((video) => {
      if (video.dataset.autoplayBound === "1") return;
      video.dataset.autoplayBound = "1";
      video.muted = true;
      video.defaultMuted = true;
      video.setAttribute("muted", "");
      video.playsInline = true;
      video.setAttribute("playsinline", "");
      video.setAttribute("webkit-playsinline", "");
      const tryPlay = () => {
        video.muted = true;
        const attempt = video.play();
        if (attempt && typeof attempt.catch === "function") attempt.catch(() => {});
      };
      video.addEventListener("loadeddata", tryPlay);
      video.addEventListener("canplay", tryPlay);
      const observer = ensureAutoplayVideoObserver();
      if (observer) {
        try { observer.observe(video); } catch { tryPlay(); }
      } else {
        tryPlay();
      }
      if (video.readyState >= 2) tryPlay();
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

  // Die Tab-Zeile bleibt immer in der gleichen Layout-Hoehe stehen und blendet
  // sich nur aus, waehrend sie hinter die obere Leiste scrollt. Dadurch wandert
  // der Content beim Scrollen nie nach oben oder unten.
  function releaseMainHeaderTabsBootLock() {
    if (!mainHeaderTabsBootLockActive) return;
    mainHeaderTabsBootLockActive = false;
    if (!win) return;
    MAIN_HEADER_TABS_BOOT_RELEASE_EVENTS.forEach((eventName) => {
      win.removeEventListener(eventName, releaseMainHeaderTabsBootLock);
    });
  }

  function bindMainHeaderTabsBootLockRelease() {
    if (!win || !mainHeaderTabsBootLockActive || mainHeaderTabsBootLockBound) return;
    mainHeaderTabsBootLockBound = true;
    MAIN_HEADER_TABS_BOOT_RELEASE_EVENTS.forEach((eventName) => {
      win.addEventListener(eventName, releaseMainHeaderTabsBootLock, { passive: true });
    });
  }

  // Solange der Nutzer die Seite noch nicht angefasst hat, wird eine
  // ungewollte Scroll-Position an den Anfang zurueckgeholt. Begrenzt, damit es
  // sich nicht mit einem legitimen Auto-Scroll gegenseitig hochschaukelt.
  function resetMainHeaderTabsBootScroll() {
    if (!win || !mainHeaderTabsBootLockActive) return false;
    if (Math.max(0, Number(win.scrollY || 0)) <= 0) return false;
    if (mainHeaderTabsBootCorrections >= MAIN_HEADER_TABS_BOOT_MAX_CORRECTIONS) {
      releaseMainHeaderTabsBootLock();
      return false;
    }
    mainHeaderTabsBootCorrections += 1;
    try {
      win.scrollTo(0, 0);
    } catch {}
    return true;
  }

  function applyMainHeaderTabsFade(fade, minimized) {
    // Auf dem Root, damit sowohl die Tab-Zeile als auch der Shell darauf
    // zugreifen koennen - der Header-Schatten blendet damit exakt mit um.
    doc?.documentElement?.style?.setProperty?.("--smart-header-tabs-fade", fade.toFixed(3));
    doc?.documentElement?.classList?.toggle?.("smart-header-tabs-minimized", !!minimized);
    mainHeaderTabsToggleEl?.setAttribute?.("aria-expanded", minimized ? "false" : "true");
  }

  function syncMainHeaderTabsScrollProgress() {
    if (!doc || !win) return;
    const tabsEl = doc.getElementById("smart-tabs");
    const topEl = doc.getElementById("smart-header-top");
    if (!tabsEl || !topEl) return;
    // Gemessen wird, wie weit die Tab-Zeile tatsaechlich hinter der oberen
    // Leiste liegt - nicht scrollY. Steht die Zeile sichtbar unter der Leiste,
    // ist sie offen, egal was der Scroll-Wert gerade behauptet.
    const tabsRect = tabsEl.getBoundingClientRect();
    const slot = Math.max(1, Number(tabsRect.height) || MAIN_HEADER_TABS_SLOT_FALLBACK_PX);
    const hidden = Math.max(0, Number(topEl.getBoundingClientRect().bottom || 0) - Number(tabsRect.top || 0));
    const progress = Math.min(1, hidden / slot);
    const minimizedByScroll = progress >= MAIN_HEADER_TABS_MINIMIZED_PROGRESS;
    // Hat der Pfeil einen Zustand erzwungen, gilt der, bis der Scroll-Zustand
    // dort ankommt (oder auf einer kaum scrollbaren Seite: dauerhaft).
    if (mainHeaderTabsManualState) {
      const wantsMinimized = mainHeaderTabsManualState === "closed";
      if (minimizedByScroll === wantsMinimized) {
        mainHeaderTabsManualState = null;
      } else {
        applyMainHeaderTabsFade(wantsMinimized ? 0 : 1, wantsMinimized);
        return;
      }
    }
    // Etwas schneller ausblenden als die Zeile hinter die Leiste laeuft, damit
    // man nie halb abgeschnittene Buttons sieht.
    const fade = Math.min(1, Math.max(0, 1 - progress * MAIN_HEADER_TABS_FADE_FACTOR));
    applyMainHeaderTabsFade(fade, minimizedByScroll);
  }

  function stopMainHeaderTabsRuntime() {
    if (win && typeof mainHeaderTabsScrollListener === "function") {
      win.removeEventListener("scroll", mainHeaderTabsScrollListener);
    }
    if (mainHeaderTabsToggleEl && typeof mainHeaderTabsToggleHandler === "function") {
      mainHeaderTabsToggleEl.removeEventListener("click", mainHeaderTabsToggleHandler);
    }
    if (win && mainHeaderTabsRafId) win.cancelAnimationFrame?.(mainHeaderTabsRafId);
    mainHeaderTabsRafId = 0;
    mainHeaderTabsScrollListener = null;
    mainHeaderTabsToggleEl = null;
    mainHeaderTabsToggleHandler = null;
    doc?.documentElement?.classList?.remove?.("smart-header-tabs-minimized");
    doc?.documentElement?.style?.removeProperty?.("--smart-header-tabs-fade");
  }

  function initMainHeaderTabsRuntime(tabsEl) {
    stopMainHeaderTabsRuntime();
    if (!win || !doc || !tabsEl || !tabsEl.classList.contains("smart-header-tabs--main")) return;

    // Beim App-Start sollen die Tabs offen stehen und offen bleiben, bis der
    // Nutzer die Seite selbst anfasst. Ein Scroll, den niemand ausgeloest hat,
    // darf sie nicht wegblenden.
    bindMainHeaderTabsBootLockRelease();
    if (mainHeaderTabsBootSyncPending) {
      mainHeaderTabsBootSyncPending = false;
      resetMainHeaderTabsBootScroll();
      applyMainHeaderTabsFade(1, false);
    }

    const toggleEl = doc.querySelector("[data-main-header-tabs-toggle]");
    if (toggleEl) {
      mainHeaderTabsToggleEl = toggleEl;
      // Der Pfeil ist an denselben Scroll-Zustand gebunden, den er anzeigt:
      // minimiert -> zurueck nach oben, offen -> knapp an den Tabs vorbei.
      mainHeaderTabsToggleHandler = () => {
        releaseMainHeaderTabsBootLock();
        const slot = Math.max(1, Math.round(Number(tabsEl.offsetHeight) || MAIN_HEADER_TABS_SLOT_FALLBACK_PX));
        const minimized = !!doc.documentElement?.classList?.contains?.("smart-header-tabs-minimized");
        const nextTop = minimized ? 0 : slot + 2;
        // Der Klick schaltet den Zustand immer sofort und sicher um - auch
        // wenn die Seite den Ziel-Scroll gar nicht erreichen kann.
        mainHeaderTabsManualState = minimized ? "open" : "closed";
        applyMainHeaderTabsFade(minimized ? 1 : 0, !minimized);
        try {
          win.scrollTo({ top: nextTop, behavior: "smooth" });
        } catch {
          win.scrollTo(0, nextTop);
        }
      };
      toggleEl.addEventListener("click", mainHeaderTabsToggleHandler);
    }

    // Nur Opacity und eine Klasse - kein Layout, deshalb kein Ruckeln.
    mainHeaderTabsScrollListener = () => {
      if (mainHeaderTabsBootLockActive && resetMainHeaderTabsBootScroll()) {
        applyMainHeaderTabsFade(1, false);
        return;
      }
      if (mainHeaderTabsRafId) return;
      mainHeaderTabsRafId = win.requestAnimationFrame?.(() => {
        mainHeaderTabsRafId = 0;
        syncMainHeaderTabsScrollProgress();
      }) || 0;
      if (!mainHeaderTabsRafId) syncMainHeaderTabsScrollProgress();
    };
    syncMainHeaderTabsScrollProgress();
    win.addEventListener("scroll", mainHeaderTabsScrollListener, { passive: true });
  }

  function stopSmartHeaderVisibilitySync({ resetState = true } = {}) {
    stopMainHeaderTabsRuntime();
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
      mainHeaderTabsManualState = null;
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
    initMainHeaderTabsRuntime(tabs);
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
    const isFeedLocationScope = activeTabKey === "feed" || activeTabKey === "home";
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
      if (isFeedLocationGate) {
        mainEl.style.setProperty("padding-top", "0px", "important");
      } else {
        mainEl.style.removeProperty("padding-top");
      }
    }
  }

  function render() {
    if (getRenderSuspended() > 0) {
      setRenderQueued(true);
      return;
    }
    const startupRenderGate = resolveStartupRenderGate(state);
    const startupActionsLocked = startupRenderGate.actionsLocked === true;
    const startupInteractionSafety = String(startupRenderGate.interactionSafety || "").trim() || "fullyInteractive";
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
    if (startupRenderGate.showNeutralShell) {
      nextHtml = renderStartupNeutralShell(startupRenderGate);
      mode = "startup";
    } else if (showGuestAuth) {
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
        && isChatEnabledForV1()
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
      const reuseLeafletMapCanvas = preserveMainScroll && state.activeTab === "map"
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
        appEl.dataset.startupInteractionSafety = startupInteractionSafety;
        appEl.dataset.startupActionsLocked = startupActionsLocked ? "1" : "0";
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
      } else if (mode === "main") {
        const nextMain = doc?.querySelector("main");
        if (nextMain) nextMain.scrollTop = 0;
        nextViewportScrollTop = 0;
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
      restoreChatInputFocusStateFn(chatInputFocusState);
      if (nextViewportScrollTop !== null && (didMainTabChange || preserveMainScroll)) {
        if (preserveSmartHeaderWindowScroll) armSmartHeaderScrollGuard();
        scheduleViewportScrollTop(nextViewportScrollTop);
      }
      if (mode === "main") setLastRenderedMainTab(state.activeTab);
      else setLastRenderedMainTab("");
    }
    if (appEl && !changed) {
      appEl.dataset.startupInteractionSafety = startupInteractionSafety;
      appEl.dataset.startupActionsLocked = startupActionsLocked ? "1" : "0";
    }
    lastFeedLocationRenderKey = currentFeedLocationRenderKey;

    const nextHeaderRuntimeMode = mode === "startup"
      ? "startup"
      : (shouldUseSmartHeader() ? "smart" : "business-tabs");
    if (changed || nextHeaderRuntimeMode !== lastHeaderRuntimeMode) {
      if (nextHeaderRuntimeMode === "startup") {
        stopBusinessTopTabsPinSync();
        stopSmartHeaderVisibilitySync();
      } else if (nextHeaderRuntimeMode === "smart") {
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
    if (isMapRuntimeSurfaceActive(mode)) {
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
              throw new Error(tr("auth.fillAll", "Ju lutem plotesoni gjithcka."));
            }
            const cred = await createUserWithEmailAndPasswordFn(auth, email, password);
            await updateProfileFn(cred.user, { displayName: name });
            await setDocFn(docFn(db, "users", cred.user.uid), {
              uid: cred.user.uid,
              displayName: name,
              handle: normalizeHandleFn(name),
              city: "Prishtina",
              email,
              role: "user",
              status: "active",
              bio: "",
              score: 0,
              followersCount: 0,
              followingCount: 0,
              createdAt: serverTimestampFn(),
              updatedAt: serverTimestampFn()
            }, { merge: true });
          }
        } catch (err) {
          state.auth.error = err?.message || tr("auth.loginFailed", "Hyrja deshtoi.");
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
    if (String(state?.activeTab || "").trim().toLowerCase() !== "staff") return;
    if (typeof IntersectionObserver !== "function") return;
    const sentinels = [
      doc?.getElementById("staffLoadMoreSentinel")
    ].filter(Boolean);
    if (!sentinels.length) return;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry?.isIntersecting) return;
        const node = entry.target;
        if (!(node instanceof HTMLElement)) return;
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
    const confirmed = guardConfirmedAuthAction;
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
      ensurePostsDataForProfileFn,
      ensureMenuDataForProfileFn: (...args) => runBudgetWrapped("menu_open", () => ensureMenuDataForProfileFn(...args)),
      ensureFocusDataForProfileFn,
      bindAppMenuFocusEventsCoreFn,
      saveMenuLayoutToStorageFn: confirmed("menu.layout.save", saveMenuLayoutToStorageFn),
      openMenuModalFn: confirmed("menu.editor.open", openMenuModalFn),
      deleteMenuItemByIdFn: confirmed("menu.item.delete", deleteMenuItemByIdFn),
      triggerMenuDetailOpenFromGestureFn,
      updateShopCartQuantityFn: (...args) => runBudgetWrapped("add_to_cart", () => updateShopCartQuantityFn(...args)),
      updateShopCartItemCommentFn,
      openShopCheckoutFn,
      submitShopCheckoutFn,
      updateShopCheckoutFieldFn,
      saveTableQrConfigFn: confirmed("table.qr.save", saveTableQrConfigFn),
      setDocFn,
      docFn,
      db,
      serverTimestampFn,
      uploadCompressedImageFn,
      menuCache,
      menuCacheKeyFn,
      saveMenuStatusBadgeVisibleFn: confirmed("menu.statusBadge.save", saveMenuStatusBadgeVisibleFn),
      focusCache,
      focusCacheKeyFn,
      saveFocusEnabledFn: confirmed("focus.enabled.save", saveFocusEnabledFn),
      openFocusModalFn: confirmed("focus.editor.open", openFocusModalFn),
      deleteFocusItemByIdFn: confirmed("focus.item.delete", deleteFocusItemByIdFn),
      deleteAdItemByIdFn: confirmed("ads.item.delete", deleteAdItemByIdFn),
      setFocusIndexFn,
      toggleProfilePostMenuFn,
      toggleProfilePostWidthFn: confirmed("profile.post.layout", toggleProfilePostWidthFn),
      deleteProfilePostFn: confirmed("profile.post.delete", deleteProfilePostFn),
      setProfileMenuOpenFn,
      profileMenuBound: !!getProfileMenuBound(),
      setProfileMenuBoundFn: (next) => {
        setProfileMenuBound(!!next);
      },
      mapLocateFn,
      bindNotificationsDelegationFn,
      bindAppSettingsProfileEventsCoreFn,
      iconFn: icon,
      saveAccountSettingsFn: confirmed("profile.settings.save", saveAccountSettingsFn),
      openLocationPickerFn,
      clearVerifiedMapLocationFn,
      syncNotificationsPushRuntimeFn: confirmed("settings.push.sync", syncNotificationsPushRuntimeFn, false),
      saveSettingsFn: confirmed("settings.save", saveSettingsFn),
      disablePushDeviceRegistrationFn: confirmed("settings.push.disable", disablePushDeviceRegistrationFn),
      getPushActivationIssueMessageFn,
      saveUserProfileToStorageFn: confirmed("profile.storage.save", saveUserProfileToStorageFn),
      persistPrivateAccountSettingFn: confirmed("profile.private.persist", persistPrivateAccountSettingFn),
      uploadAvatarFn: confirmed("profile.avatar.upload", uploadAvatarFn),
      openOwnBusinessProfileFn: typeof openOwnBusinessProfileFn === "function"
        ? (...args) => runBudgetWrapped("profile_open", () => openOwnBusinessProfileFn(...args))
        : null,
      openProfileViewFromBusinessFn: (...args) => runBudgetWrapped("profile_open", () => openProfileViewFromBusinessFn(...args)),
      findPostByIdFn,
      openPostModalFn,
      getProfileViewUnsubFn: () => getProfileViewUnsub(),
      setProfileViewUnsubFn: (next) => {
        setProfileViewUnsub(next);
      },
      toggleFollowFn: confirmed("profile.follow.toggle", toggleFollowFn),
      alertFn,
      bindAppChatUploadEventsCoreFn,
      openChatWithProfileFn,
      deleteChatThreadByIdFn: confirmed("chat.thread.delete", deleteChatThreadByIdFn),
      setChatThreadArchivedByIdFn: confirmed("chat.thread.archive", setChatThreadArchivedByIdFn),
      closeChatModalFn,
      toggleChatMessageSavedFn: confirmed("chat.message.save", toggleChatMessageSavedFn),
      toggleChatMessageLikedFn: confirmed("chat.message.like", toggleChatMessageLikedFn),
      removePendingChatAttachmentFn: confirmed("chat.attachment.remove", removePendingChatAttachmentFn),
      addChatAttachmentsFn: confirmed("chat.attachment.add", addChatAttachmentsFn, false),
      sendChatMessageFn: confirmed("chat.message.send", sendChatMessageFn),
      scrollChatMessagesToBottomFn,
      queueMicrotaskFn,
      handleUploadPostFn: confirmed("post.upload.create", handleUploadPostFn),
      bindCrmStaffEventsCoreFn,
      closeStaffEditorFn,
      openStaffEditorFn: confirmed("staff.editor.open", openStaffEditorFn),
      syncStaffDerivedEmailFieldFn,
      normalizeCeoCountryFn,
      syncStaffFormFromDomFn,
      saveCeoStaffFromViewFn: confirmed("staff.save", saveCeoStaffFromViewFn),
      deleteCeoStaffFromViewFn: confirmed("staff.delete", deleteCeoStaffFromViewFn),
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
          openGuestAuthPromptFn(tr("auth.userProfilesRequired", "Ju lutem hyni per te pare profile perdoruesish."));
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
        }, { showBack: true });
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
