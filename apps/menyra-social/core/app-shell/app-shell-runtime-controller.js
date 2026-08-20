import { bindTap } from "../common/tap-bind-utils.js";
import { resolveStartupRenderGate } from "../auth/startup-render-gate-utils.js";
import { isChatEnabledForV1 } from "../chat/chat-v1-guard.js";
import { getLang, getSupportedLanguages, t } from "../../../../shared/i18n/i18n.js";
import { MNYRA_GO_ENABLED } from "../../../../shared/config/feature-flags.js";

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
  // Das Markup, mit dem der letzte Neuaufbau die Kopfzeile gebaut hat - nicht
  // ihr aktueller Stand im DOM. Die Laufzeit setzt danach noch Klassen und aria
  // daran; verglichen wird deshalb Markup mit Markup.
  let lastSmartHeaderMarkup = null;
  let mainHeaderTabsScrollListener = null;
  let mainHeaderTabsToggleUnbind = null;
  // Die Pill-Zeile behaelt ihren Platz im Dokument - immer. Weder der Pfeil
  // noch das Scrollen nimmt ihn ihr. Damit steht oben unveraenderlich derselbe
  // Abstand, und nichts kann springen.
  //
  // Geheftet heisst: der Pfeil hat sie weiter unten unter die Leiste geholt
  // (sticky). relative und sticky belegen denselben Layout-Platz, das
  // Umschalten aendert also nichts an der Seite.
  let mainHeaderTabsStuck = false;
  // Und "eingesteckt": die geheftete Zeile liegt gerade hinter der Leiste -
  // entweder auf dem Weg hervor oder auf dem Weg dahinter zurueck.
  let mainHeaderTabsTucked = false;
  // Die Zeile ist krumm hoch (rund 40.67px). Entscheidungen fallen an der
  // krummen Hoehe: an der gerundeten galt eine laengst weggescrollte Zeile
  // schon einmal weiter als sichtbar. Gerundet wird nur die Fahrstrecke.
  let mainHeaderTabsRowHeightRaw = 40;
  let mainHeaderTabsRowHeight = 40;
  // Was zuletzt als CSS-Variable am <html> steht - damit derselbe Wert nicht
  // wieder und wieder geschrieben wird.
  let mainHeaderTabsRowHeightVar = "";
  let mainHeaderTabsLastScrollY = 0;
  let mainHeaderTabsVisibleState = null;
  // Ob der Platz der Zeile weggescrollt ist - daran haengt, ob es den Pfeil
  // ueberhaupt gibt.
  let mainHeaderTabsOffscreenState = null;
  let mainHeaderTabsRafId = 0;
  let mainHeaderTabsSlideTimerId = 0;
  let mainHeaderTabsResizeListener = null;
  // Wohin eine laufende Fahrt will. Solange sie laeuft, zaehlt ihr Ziel und
  // nicht die Messung - der Pfeil soll sich sofort drehen, und ein Tipp
  // mittendrin soll die Bewegung umdrehen statt ihre Mitte abzulesen.
  // Ausserhalb einer Fahrt: null, dann entscheidet allein, was im Bild steht.
  let mainHeaderTabsIntent = null;
  // So viel muss unter der Leiste hervorschauen, damit die Zeile als zu sehen
  // gilt. Ein Bruchteil eines Pixels ist kein Bild.
  const MAIN_HEADER_TABS_VISIBLE_EPS_PX = 2;
  // Ganz oben deckt sich der geheftete Platz mit dem normalen (die Zeile klebt
  // 1px hoeher, damit an der Naht nichts durchblitzt). Genau dort darf das
  // Kleben still aufhoeren.
  const MAIN_HEADER_TABS_TOP_EPS_PX = 1;
  const MAIN_HEADER_TABS_DOWN_DELTA_PX = 4;
  // So lange faehrt die Zeile hinter die Leiste und wieder hervor. Muss zur
  // CSS-Dauer passen.
  const MAIN_HEADER_TABS_SLIDE_MS = 260;
  // Zulage, bevor die Laufzeit nach der Fahrt aufraeumt: genau auf der Dauer
  // koennte der Timer einen Frame zu frueh kommen und die letzten Pixel saehe
  // man springen.
  const MAIN_HEADER_TABS_SLIDE_SETTLE_MS = 60;
  // Der Pin in der Kopfzeile klappt das Location-Feld auf. Der Zustand lebt hier
  // im Modul und nicht im gerenderten HTML: dadurch ueberlebt er jeden
  // Re-Render, das Umschalten kostet keinen Neuaufbau der Kopfzeile und der
  // getippte Stadtname bleibt beim Tippen stehen.
  let smartHeaderLocationExpanded = false;
  let smartHeaderLocationKey = "";
  let smartHeaderLocationDelegationBound = false;
  let smartHeaderLocationFocusRafId = 0;
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

  // ===========================================================================
  // Die Leseposition nach einem Neuaufbau
  //
  // Beim Neuaufbau kann der Browser sie kappen: fuer einen Moment ist das
  // Dokument kuerzer (Bilder ohne Hoehe, Kacheln mit content-visibility noch
  // ungerechnet), und die Position faellt auf das neue Maximum. Genau dagegen -
  // und gegen nichts sonst - ist die Korrektur da.
  //
  // Sie darf deshalb NIE eine Position ueberschreiben, die der Nutzer selbst
  // eingenommen hat. Auf iOS scrollt der Finger auf dem Compositor weiter,
  // waehrend JS noch am Neuaufbau sitzt: ein blindes Zurueckschreiben - erst
  // sofort, dann im naechsten Frame, dann noch einmal per Timer - riss die
  // Seite dreimal an die Stelle zurueck, an der der Neuaufbau begonnen hatte.
  // Wer waehrend des ersten Wischs nach einem Neuladen in einen Render lief,
  // sah genau das: die Seite blieb stehen und sprang zurueck.
  //
  // Gekappt heisst: das Dokument gibt die gemerkte Stelle gerade nicht her.
  // Ausdruecklich NICHT "die Seite steht am Ende" - dort steht auch, wer
  // einfach bis nach unten gewischt hat.
  const VIEWPORT_SCROLL_EPS_PX = 2;
  // Steht hier ein Ziel, hat der Neuaufbau die Leseposition wirklich gekappt
  // und schuldet sie noch zurueck. Daneben die Stelle, an der er sie abgesetzt
  // hat: nur wenn die Seite im naechsten Frame noch genau dort steht, ist der
  // Finger stehengeblieben und das Nachfassen gehoert nicht ihm weggenommen.
  let viewportScrollRestoreOwed = null;
  let viewportScrollRestoreFrom = null;

  function readViewportScrollMaxTop() {
    const el = doc?.scrollingElement || doc?.documentElement || null;
    const scrollHeight = Number(el?.scrollHeight || 0);
    const clientHeight = Number(el?.clientHeight || 0);
    if (!(scrollHeight > 0) || !(clientHeight > 0)) return Number.POSITIVE_INFINITY;
    return Math.max(0, scrollHeight - clientHeight);
  }

  // Gekappt heisst: die Seite steht unter dem Ziel UND das Dokument gibt das
  // Ziel gerade gar nicht her. Wer selbst gewischt hat, steht entweder weiter
  // unten (dann fehlt nichts) oder irgendwo mittendrin, wo das Dokument die
  // Stelle laengst hergaebe (dann ist es seine Position).
  //
  // Frueher stand hier "die Seite steht am Ende dessen, was das Dokument
  // hergibt". Das trifft aber genauso auf jeden zu, der bis ans Seitenende
  // gewischt ist - und dort ist ein frisch gebautes DOM immer kurz zu kurz.
  // Am Feed-Ende hat deshalb JEDER Render die Scroll-Position angefasst, in
  // der Feed-Mitte keiner. Genau so hat es sich auf dem Geraet gezeigt.
  function isViewportScrollClampedBelow(target = 0) {
    const current = getViewportScrollTop();
    if (current >= target - VIEWPORT_SCROLL_EPS_PX) return false;
    return readViewportScrollMaxTop() < target - VIEWPORT_SCROLL_EPS_PX;
  }

  // Gemerkt wird die Schuld, geschrieben wird hier nichts.
  //
  // Solange das Dokument die Stelle nicht hergibt, kann ein Schreiben sie auch
  // nicht erreichen - der Browser kappt den Wert im selben Atemzug wieder, die
  // Position aendert sich also gar nicht. Auf iOS reisst so ein Schreiben aber
  // den laufenden Scroll vom Compositor an den Hauptthread. Ein Griff ohne
  // Wirkung, der mitten in die Fahrt faehrt: genau das war am Seitenende der
  // Riss oben unter dem Header.
  function restoreViewportScrollTop(top = 0) {
    const nextTop = Math.max(0, Number(top) || 0);
    if (!isViewportScrollClampedBelow(nextTop)) {
      viewportScrollRestoreOwed = null;
      viewportScrollRestoreFrom = null;
      return false;
    }
    viewportScrollRestoreOwed = nextTop;
    viewportScrollRestoreFrom = getViewportScrollTop();
    return true;
  }

  // Ein Nachfassen, und nur eines: im Frame nach dem Neuaufbau haben die Bilder
  // ihre Hoehe, das Dokument ist wieder lang genug, und die gekappte Position
  // laesst sich wirklich setzen. Danach gehoert sie wieder dem Nutzer.
  //
  // Drei Bedingungen muessen dafuer alle stimmen, sonst bleibt die Stelle
  // liegen: es ist wirklich etwas offen, die Seite steht noch genau dort, wo
  // der Neuaufbau sie abgesetzt hat (sonst war der Finger weiter), und das
  // Dokument gibt das Ziel inzwischen her (sonst waere es wieder nur ein
  // wirkungsloser Griff in die laufende Fahrt).
  function scheduleViewportScrollRestore(top = 0) {
    const nextTop = Math.max(0, Number(top) || 0);
    restoreViewportScrollTop(nextTop);
    if (typeof win?.requestAnimationFrame !== "function") return;
    win.requestAnimationFrame(() => {
      if (viewportScrollRestoreOwed !== nextTop) return;
      const abgesetztBei = viewportScrollRestoreFrom;
      viewportScrollRestoreOwed = null;
      viewportScrollRestoreFrom = null;
      const current = getViewportScrollTop();
      if (abgesetztBei !== null && Math.abs(current - abgesetztBei) > VIEWPORT_SCROLL_EPS_PX) return;
      if (current >= nextTop - VIEWPORT_SCROLL_EPS_PX) return;
      if (readViewportScrollMaxTop() < nextTop - VIEWPORT_SCROLL_EPS_PX) return;
      setViewportScrollTop(nextTop);
    });
  }

  // Ein ausdruecklicher Sprung - Tab-Wechsel, anderer Bildschirm. Der gilt
  // unbedingt, denn dort erwartet niemand seine alte Leseposition.
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
      // Der GO-Editor des Lokals haengt in derselben Overlay-Flaeche wie die
      // anderen Modals, wird aber von der GO-Seite selbst geschrieben. Ohne
      // ihn hier faellt beim Oeffnen kein Neuaufbau der Overlays an - und
      // damit lief syncModalOpenUiState nicht: keine gesperrte Seite im
      // Hintergrund, kein eingefaerbter sicherer Bereich oben in Safari, kein
      // theme-color. Genau daran sah man, dass es ein anderes Modal ist als
      // das Speisen-Modal.
      state.goAdmin?.editor ? "1" : "0",
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

  // Das Stadtfeld in der Kopfzeile. Es gehoert zu den Ansichten, die ihre
  // Inhalte aus der eingestellten Stadt ziehen - Qyteti und Lokalet.
  //
  // Mnyra GO steht bewusst NICHT hier: die dritte Pill fuehrt jetzt dorthin,
  // aber GO fragt seine Stadt auf der Seite selbst ab. Zwei Stadtfelder
  // uebereinander waeren zwei Wahrheiten.
  function shouldShowFeedLocationHeaderSearch(locationRecord = readStoredFeedViewerLocation()) {
    const activeTabKey = state.activeTab;
    return !!locationRecord && (
      activeTabKey === "feed"
      || activeTabKey === "home"
      || activeTabKey === "restaurants"
    );
  }

  // Das Textlogo der Kopfzeile. Es steht in beiden Zustaenden im DOM: zu ist es
  // zu sehen, offen nimmt das Location-Feld seinen Platz ein (CSS entscheidet).
  function renderSmartHeaderBrandLogo() {
    const activeTabKey = String(state?.activeTab || "").trim().toLowerCase();
    // Auf den GO-Seiten steht dort nicht "Social", sondern "GO" - der Nutzer
    // soll am Schriftzug sehen, wo er ist. Das "GO" steht dabei groesser und
    // enger am Wort als das kleine "Social": es ist ein Teil des Namens
    // ("MNYRAGO") und keine Beschriftung daneben.
    //
    // BEIDE GO-Seiten, und das war ein Fehler: Hier stand nur "go", die Seite
    // des Gastes. Das Lokal sitzt auf "gobiznes" und las im Kopf deshalb
    // weiter "MNYRA Social", waehrend unter ihm GO stand.
    if (activeTabKey === "go" || activeTabKey === "gobiznes") {
      return `
        <div class="smart-header-brand smart-header-brand--go flex items-baseline cursor-pointer" data-nav="feed">
          <h1 class="text-2xl font-black italic tracking-tighter leading-none text-slate-900">MNYRA</h1>
          <span class="text-2xl font-black italic tracking-tighter leading-none text-indigo-600">GO</span>
        </div>
      `;
    }
    // Und auf der Biznesi-Seite steht dort das Lokal selbst: sein Bild, sein
    // Bereich. Es ist derselbe Weg, aus dem auch der Drawer und die Kopfzeile
    // ihr Bild ziehen (resolveHeaderBranding) - kein zweiter Weg und kein
    // Platzhalterbild.
    //
    // Der Name des Lokals steht hier NICHT: Er stand bis eben noch einmal
    // gross unter dem Kopf, und zweimal derselbe Name auf einem Bildschirm
    // ist einmal zu viel. Das Bild sagt, wer; "Biznesi" sagt, wo.
    if (activeTabKey === "dashboard") {
      const branding = resolveHeaderBranding();
      const logoUrl = String(branding?.logoUrl || "").trim();
      const label = tr("nav.dashboard", "Biznesi");
      return `
        <div class="smart-header-brand smart-header-brand--work flex items-center cursor-pointer" data-nav="dashboard">
          <span class="smart-header-brand__avatar">
            ${logoUrl
              ? `<img src="${escapeHtml(logoUrl)}" data-fallback-src="${escapeHtml(PLACEHOLDER_IMAGE)}" alt="${escapeHtml(label)}" loading="lazy" decoding="async" class="${logoFitClass(branding?.isBusinessLogo)}" />`
              : `${icon("store", "w-4 h-4")}`}
          </span>
          <h1 class="smart-header-brand__title text-2xl font-black italic tracking-tighter leading-none text-slate-900">${escapeHtml(label)}</h1>
        </div>
      `;
    }
    return `
      <div class="smart-header-brand flex items-baseline gap-1.5 cursor-pointer" data-nav="feed">
        <h1 class="text-2xl font-black italic tracking-tighter leading-none text-slate-900">MNYRA</h1>
        <span class="text-[9px] font-black text-indigo-600 uppercase tracking-[0.25em] mb-[1px]">Social</span>
      </div>
    `;
  }

  function renderSmartHeaderLocationToggle(buttonClass = "", iconClass = "w-5 h-5") {
    const label = tr("header.changeLocation", "Ndrysho vendndodhjen");
    // aria-expanded steht hier bewusst fest auf "false": den echten Zustand
    // setzt applySmartHeaderLocationChrome() direkt am DOM. So bleibt das
    // gerenderte HTML beim Auf- und Zuklappen gleich und der Re-Render-Vergleich
    // der App-Shell wirft die Kopfzeile (und getippten Text) nicht weg.
    return `
      <button
        type="button"
        data-smart-header-location-toggle="true"
        aria-controls="feedLocationCityInput"
        aria-expanded="false"
        aria-label="${escapeHtml(label)}"
        title="${escapeHtml(label)}"
        class="smart-header-location-btn ${buttonClass}"
      >
        ${icon("map-pin", iconClass)}
      </button>
    `;
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

  // Die beiden Arbeitsseiten - Paneli und Mnyra GO. Sie sind derselbe Aufbau
  // und bekommen deshalb dieselbe Kopfzeile: rechts Einstellungen, Sprache und
  // zuletzt das Symbol, das dort schon stand.
  function isWorkSurfaceTab() {
    const activeTabKey = String(state.activeTab || "").trim().toLowerCase();
    return activeTabKey === "dashboard" || activeTabKey === "gobiznes";
  }

  // Der Weg zu den Einstellungen. Er baut KEINE neue Einstellungs-Logik: Er
  // tippt genau das an, was die Seite ohnehin kennt.
  //
  //   Paneli    die Pille "Opsionet" im Benko (data-dashboard-panel-tab)
  //   Mnyra GO  der Reiter "options" der Seite (data-go-business-tab)
  //
  // Im Paneli bleibt die Pille zusaetzlich stehen - beide Wege fuehren auf
  // dieselbe Seite, es gibt sie also weiter genau einmal.
  //
  // Aussehen, Groesse, Farbe und Druckverhalten kommen aus derselben Klasse
  // wie bei den Social-Symbolen daneben (Sprache, Warenkorb): ein Knopf, der
  // in dieser Reihe steht, soll nicht als Fremdkoerper darin stehen.
  function renderWorkSettingsButton(buttonClass = "", iconClass = "w-5 h-5") {
    if (!isWorkSurfaceTab()) return "";
    const label = tr("nav.options", "Opsionet");
    const isGoWorkTab = String(state.activeTab || "").trim().toLowerCase() === "gobiznes";
    const hook = isGoWorkTab
      ? `data-go-header-settings="true" data-go-business-tab="options"`
      : `data-dashboard-panel-tab="opsionet"`;
    return `
      <button
        type="button"
        ${hook}
        aria-label="${escapeHtml(label)}"
        title="${escapeHtml(label)}"
        class="smart-header-settings-btn ${buttonClass}"
      >
        ${icon("settings", iconClass)}
      </button>
    `;
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
        ` : ""}
      </div>
    `;
  }

  // Die Feed/Restaurants-Tabs erscheinen erst, wenn eine Stadt gesetzt ist -
  // vorher laeuft der Nutzer noch durch das Location-Gate.
  //
  // Mnyra GO steht in derselben Reihe, hat aber kein Stadtfeld daneben: die
  // Pill-Zeile muss dort trotzdem stehen bleiben, sonst gibt es von der
  // GO-Seite keinen sichtbaren Weg zurueck nach Qyteti oder Lokalet.
  function isMainHeaderTabsScope(locationRecord = readStoredFeedViewerLocation()) {
    if (!locationRecord) return false;
    const isLandingTopTab = state.activeTab === "profile"
      && String(state.profileTopTab || "").trim().toLowerCase() === "landing";
    if (isLandingTopTab) return false;
    if (String(state.activeTab || "").trim().toLowerCase() === "go") {
      return MNYRA_GO_ENABLED === true;
    }
    return shouldShowFeedLocationHeaderSearch(locationRecord);
  }

  function renderMainHeaderTabs(locationRecord = readStoredFeedViewerLocation()) {
    if (!isMainHeaderTabsScope(locationRecord)) return "";
    const activeTabKey = String(state.activeTab || "").trim().toLowerCase();
    // Die dritte Pill fuehrt nach Mnyra GO - dort stand frueher Ofertat. GO ist
    // die Frage "wo esse ich jetzt?", und die gehoert neben Qyteti und Lokalet,
    // nicht in eine Schublade im Drawer.
    //
    // Steht der Schalter auf false, faellt die Pill ersatzlos weg: die Zeile
    // traegt dann zwei Pills. Ein Weg auf eine Seite, die nichts rendert, waere
    // schlimmer als kein Weg (Spezifikation Punkt 129).
    //
    // Die Icons liegen alle im Inline-Register von social-app.js: laedt das
    // externe Lucide-Script nicht, bleiben die Pills trotzdem vollstaendig.
    const showGoTab = MNYRA_GO_ENABLED === true;
    const tabs = [
      { id: "feed", icon: "home", label: tr("nav.feed", "Qyteti"), active: activeTabKey !== "restaurants" && activeTabKey !== "go" },
      { id: "restaurants", icon: "utensils", label: tr("nav.restaurants", "Lokalet"), active: activeTabKey === "restaurants" },
      { id: "go", icon: "zap", label: tr("nav.go", "Mnyra GO"), active: activeTabKey === "go", hidden: !showGoTab }
    ].filter((tab) => !tab.hidden);
    return `
      <div id="smart-tabs" class="smart-header-tabs smart-header-tabs--main">
        <div class="smart-header-tabs-row">
          ${tabs.map((tab) => `
            <button
              type="button"
              data-nav="${escapeHtml(tab.id)}"
              data-main-header-tab="${escapeHtml(tab.id)}"
              aria-current="${tab.active ? "page" : "false"}"
              class="smart-header-pill smart-header-pill--${escapeHtml(tab.id)} ${tab.active ? "smart-header-pill--active" : ""}"
            >${icon(tab.icon, "smart-header-pill__icon")}<span class="smart-header-pill__label">${escapeHtml(tab.label)}</span></button>
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
        <div class="smart-header-backdrop" aria-hidden="true"></div>
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
    const headerLocationRecord = readStoredFeedViewerLocation();
    const showFeedLocationHeaderSearch = !isLandingTopTab && shouldShowFeedLocationHeaderSearch(headerLocationRecord);
    const feedLocationLabel = String(
      headerLocationRecord?.label
      || headerLocationRecord?.city
      || ""
    ).trim();
    const headerTabsHtml = renderMainHeaderTabs(headerLocationRecord);
    const hasHeaderTabs = !!headerTabsHtml;
    // Paneli und Mnyra GO tragen ein Symbol mehr in der Reihe (Einstellungen).
    // Damit "MNYRA Social" daneben auf einem 320er Telefon ganz stehen bleibt,
    // gilt dort dasselbe wie bei Location-Feld und Pill-Zeile: die Symbole
    // werden schmaler, nicht die Zeile hoeher.
    const showWorkSettings = isWorkSurfaceTab();
    // Der Collapse-Pfeil braucht Platz in der oberen Zeile: Location-Feld und
    // Abstaende werden dafuer nur in der Breite schmaler, nicht in der Hoehe.
    const compactHeaderIcons = !!showFeedLocationHeaderSearch || hasHeaderTabs || showWorkSettings;
    const tightHeaderRow = hasHeaderTabs || showWorkSettings;
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
      <div class="smart-header-backdrop" aria-hidden="true"></div>
      <div class="smart-header-shell${hasHeaderTabs ? " smart-header-shell--split" : ""}">
        <div id="smart-header-top" class="smart-header-top">
          <div class="${headerRowPaddingClass} h-16 flex items-center justify-between">
            <div class="smart-header-lead${showFeedLocationHeaderSearch ? " smart-header-lead--location" : ""} flex items-center ${headerLeadGapClass}${showFeedLocationHeaderSearch ? " flex-1 min-w-0" : ""}">
              <button id="drawerToggle" data-header-badge-anchor="true" type="button" class="${drawerButtonClass}">
                ${icon("menu", drawerIconClass)}
              </button>
              ${renderSmartHeaderBrandLogo()}
              ${showFeedLocationHeaderSearch ? renderFeedLocationHeaderSearch(feedLocationLabel) : ""}
            </div>
            <div class="smart-header-actions${hasHeaderTabs ? " smart-header-actions--with-collapse" : ""}${showWorkSettings ? " smart-header-actions--work" : ""} flex shrink-0 items-center ${headerActionsGapClass} text-slate-600">
              ${showFeedLocationHeaderSearch ? renderSmartHeaderLocationToggle(actionButtonClass, actionIconClass) : ""}
              ${renderWorkSettingsButton(actionButtonClass, actionIconClass)}
              ${renderLanguageToggleButton(`${actionButtonClass} flex-col gap-0.5`, actionIconClass)}
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
        ${hasHeaderTabs ? `<div class="smart-header-underline" aria-hidden="true"></div>` : ""}
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

  // ===========================================================================
  // Die Kopfzeile ueberlebt den Neuaufbau
  //
  // Ein Render ersetzt das gesamte DOM (appEl.innerHTML). Die klebende
  // Kopfzeile wird dabei weggeworfen und neu gebaut - und WebKit baut fuer sie
  // eine neue Compositing-Ebene auf. Fuer einen Frame ist dort nichts, und man
  // sieht den Inhalt durch die Stelle hindurchscrollen, an der der Header sein
  // sollte.
  //
  // Die alten Knoten hinterher wieder einzuhaengen hat das nicht geloest: der
  // Knoten geht mit dem innerHTML trotzdem aus dem Renderbaum und kommt per
  // replaceWith wieder hinein. Das sind ZWEI Wechsel statt einem - die Ebene
  // wird dabei genauso verworfen und neu gebaut.
  //
  // Der Header darf den Renderbaum also gar nicht erst verlassen. Deshalb wird
  // das frische Markup nicht mehr ueber #app geschuettet, sondern daneben
  // aufgebaut und kindweise eingesetzt (applyAppHtmlKeepingHeader): alles
  // andere wird ausgetauscht, die Header-Knoten bleiben stehen und werden an
  // Ort und Stelle angeglichen. Kam dasselbe Markup heraus, passiert an ihnen
  // gar nichts.
  //
  // reuseSmartHeaderNodes bleibt als Netz fuer den Rueckfall auf innerHTML
  // (Moduswechsel, veraenderte Shell) - dort ist ein Wechsel besser als zwei.
  // ===========================================================================
  const SMART_HEADER_REUSE_SELECTORS = Object.freeze([
    // Die feste Blende gehoert dazu, obwohl sie leer ist: sie lebt von ihrer
    // eigenen Compositing-Ebene, und die wuerde ein Austausch bei jedem Render
    // verwerfen und neu bauen - genau das, was sie verhindern soll.
    ".smart-header-backdrop",
    ".smart-header-shell",
    ".smart-header-underline",
    "#smart-tabs"
  ]);

  function smartHeaderReuseSelectorFor(node) {
    if (typeof node?.matches !== "function") return null;
    for (const selektor of SMART_HEADER_REUSE_SELECTORS) {
      try {
        if (node.matches(selektor)) return selektor;
      } catch {}
    }
    return null;
  }

  function isPersistentSmartHeaderNode(node) {
    return smartHeaderReuseSelectorFor(node) !== null;
  }

  // Gleicht einen stehenden Knoten dem frischen an, ohne ihn anzufassen: erst
  // die Attribute, dann der Inhalt. Der Knoten selbst bleibt derselbe, also
  // auch seine Compositing-Ebene.
  //
  // Ob ueberhaupt etwas zu tun ist, entscheidet der Vergleich Markup mit
  // Markup: was der letzte Neuaufbau GERENDERT hat, gegen das frische. Nie der
  // lebende DOM-Stand - an dem haengen laengst die Spuren der Laufzeit
  // (data-fast-tap-bound an den Knoepfen, aria-expanded am Pfeil, die von
  // lucide ersetzten Icons). Ein Vergleich mit dem lebenden Stand fiele
  // deshalb bei JEDEM Render ungleich aus, und der Header-Inhalt wuerde jedes
  // Mal neu gebaut - genau das, was dieser Einbau verhindern soll.
  function patchSmartHeaderNodeInPlace(alt, neu, gerendert = null) {
    if (!alt || !neu) return;
    const frisch = String(neu.outerHTML || "");
    if (gerendert !== null && String(gerendert) === frisch) return;
    if (gerendert === null && String(alt.outerHTML || "") === frisch) return;
    Array.from(alt.attributes || []).forEach((attr) => {
      if (!neu.hasAttribute?.(attr.name)) alt.removeAttribute(attr.name);
    });
    Array.from(neu.attributes || []).forEach((attr) => {
      if (alt.getAttribute(attr.name) !== attr.value) alt.setAttribute(attr.name, attr.value);
    });
    if (String(alt.innerHTML || "") !== String(neu.innerHTML || "")) alt.innerHTML = neu.innerHTML;
  }

  // Setzt das frische Markup ein, ohne den Header aus dem Renderbaum zu nehmen.
  // Gibt false zurueck, wenn die Form nicht passt - dann uebernimmt der alte
  // Weg ueber innerHTML.
  function applyAppHtmlKeepingHeader(appEl, nextHtml) {
    if (!appEl || !doc?.createElement) return false;
    const alteHuelle = appEl.firstElementChild;
    if (!alteHuelle || appEl.children?.length !== 1) return false;
    if (!doc.querySelector?.(".smart-header-shell")) return false;

    const buehne = doc.createElement("div");
    buehne.innerHTML = nextHtml;
    const neueHuelle = buehne.firstElementChild;
    if (!neueHuelle || buehne.children.length !== 1) return false;
    // Aendert sich die Huelle selbst (Moduswechsel, Chat, Karte), ist der
    // Rueckfall richtig - dort steht der Header ohnehin woanders.
    if (neueHuelle.tagName !== alteHuelle.tagName) return false;
    if (neueHuelle.className !== alteHuelle.className) return false;

    const alteKinder = Array.from(alteHuelle.children || []);
    const neueKinder = Array.from(neueHuelle.children || []);
    if (!alteKinder.length || alteKinder.length !== neueKinder.length) return false;
    // Die Reihenfolge muss stehen: sonst muesste der Header wandern, und
    // wandern heisst wieder raus und rein.
    for (let i = 0; i < alteKinder.length; i += 1) {
      if (alteKinder[i].tagName !== neueKinder[i].tagName) return false;
      if (isPersistentSmartHeaderNode(alteKinder[i]) !== isPersistentSmartHeaderNode(neueKinder[i])) return false;
    }

    // Das frische Markup wird hier mitgeschrieben - aus der Buehne, nicht
    // hinterher aus dem Dokument: im Dokument steht nach dem Binden schon
    // wieder der lebende Stand, und der taugt nicht als Vergleich.
    const markup = new Map();
    for (let i = 0; i < alteKinder.length; i += 1) {
      const selektor = smartHeaderReuseSelectorFor(alteKinder[i]);
      if (selektor) {
        markup.set(selektor, String(neueKinder[i].outerHTML || ""));
        patchSmartHeaderNodeInPlace(alteKinder[i], neueKinder[i], lastSmartHeaderMarkup?.get?.(selektor) ?? null);
      } else {
        alteKinder[i].replaceWith(neueKinder[i]);
      }
    }
    lastSmartHeaderMarkup = markup;
    return true;
  }

  function readSmartHeaderNodes() {
    if (!doc?.querySelector) return null;
    const knoten = new Map();
    SMART_HEADER_REUSE_SELECTORS.forEach((selektor) => {
      const node = doc.querySelector(selektor);
      if (node) knoten.set(selektor, node);
    });
    return knoten.size ? knoten : null;
  }

  // Haengt die alten Knoten wieder ein, wo der Neuaufbau dasselbe Markup
  // geliefert hat, und merkt sich das frische Markup - das ist der Vergleich
  // fuer das naechste Mal.
  function reuseSmartHeaderNodes(alteKnoten) {
    const markup = new Map();
    if (!doc?.querySelector) {
      lastSmartHeaderMarkup = markup;
      return markup;
    }
    SMART_HEADER_REUSE_SELECTORS.forEach((selektor) => {
      const neu = doc.querySelector(selektor);
      if (!neu) return;
      const frisch = String(neu.outerHTML || "");
      markup.set(selektor, frisch);
      const alt = alteKnoten?.get?.(selektor);
      if (!alt || alt === neu || typeof neu.replaceWith !== "function") return;
      if (!frisch || lastSmartHeaderMarkup?.get?.(selektor) !== frisch) return;
      neu.replaceWith(alt);
    });
    lastSmartHeaderMarkup = markup;
    return markup;
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

  // ===========================================================================
  // Die Pill-Zeile im Header (Zbulo / Lokalet / Ofertat)
  //
  // Drei Regeln, und alles Weitere folgt daraus:
  //
  //  1. Die Zeile behaelt IMMER ihren Platz im Dokument. Sie wird nie aus dem
  //     Layout genommen, ihre Hoehe aendert sich nie. Am Seitenanfang steht
  //     deshalb unveraenderlich derselbe Abstand, und unter ihr kann sich
  //     nichts verschieben.
  //
  //  2. Die Laufzeit fasst die Scroll-Position NIE an. Kein Boot-Scroll, kein
  //     Ausgleich, keine eigene Fahrt. Wo die Seite steht, bestimmen allein der
  //     Nutzer und der Browser. Jedes Zerren daran hat sich frueher mit der
  //     Scroll-Wiederherstellung beim Neuladen und mit dem Render-Pfad
  //     gestritten - und genau so sah es aus: die Seite sprang.
  //
  //  3. Was von ihr zu sehen ist, wird GEMESSEN und nie gerechnet. Die Zeile
  //     ist krumm hoch (40.67px) und Scroll-Positionen sind auf dem Geraet
  //     gebrochen; "scrollY < gerundete Hoehe" trifft daneben und hat den Pfeil
  //     schon einmal dauerhaft aufs Zumachen festgelegt.
  //
  //  4. Der Pfeil erscheint erst, wenn er etwas zu tun hat. Oben steht die
  //     Zeile ohnehin da, wo sie hingehoert - dort gibt es nichts zu holen und
  //     nichts wegzuraeumen, also ist der Pfeil auch nicht da
  //     (`html.smart-header-tabs-offscreen`). Er blendet sich ein, sobald ihr
  //     Platz weggescrollt ist, und wieder aus, sobald man oben ankommt.
  //     Seinen Platz in der Kopfzeile behaelt er dabei (visibility statt
  //     display), sonst rutschte die Icon-Reihe daneben hin und her.
  //
  // Damit bleibt genau eine Bewegung, eine reine transform-Fahrt:
  //
  //  - GEHOLT / LOSGELASSEN (`html.smart-header-tabs-stuck`): weiter unten, wo
  //    ihr Platz laengst weggescrollt ist, holt der Pfeil die Zeile unter die
  //    Leiste und laesst sie wieder los. Sie klebt dort per sticky, und das
  //    belegt exakt denselben Layout-Platz wie relative.
  //
  // Sonst macht der Browser die Arbeit allein: die Zeile sitzt im Fluss unter
  // der Leiste und scrollt hinter sie weg - kein Zustand, kein Timer. Ganz oben
  // sind die Pills deshalb immer da, ausnahmslos.
  // ===========================================================================
  function readMainHeaderTabsScrollY() {
    return Math.max(0, Number(win?.scrollY || 0));
  }

  function mainHeaderTabsPrefersReducedMotion() {
    try {
      return !!win?.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
    } catch {
      return false;
    }
  }

  function getMainHeaderTabsEl() {
    return doc?.getElementById?.("smart-tabs") || null;
  }

  // Die Icon-Reihe rechts in der Kopfzeile. Sie traegt die beiden Klassen, an
  // denen der Pfeil haengt - bewusst sie und nicht das <html>: ein Wechsel dort
  // entwertet den Stil des ganzen Dokuments, und er faellt genau beim Scrollen
  // an. Hier bleibt er auf den Header begrenzt.
  function getMainHeaderActionsEl() {
    return doc?.querySelector?.(".smart-header-actions") || null;
  }

  function getMainHeaderTabsToggleEl() {
    return doc?.querySelector?.("[data-main-header-tabs-toggle]") || null;
  }

  // Wo die Zeile gerade steht - abgeleitet, nicht gemessen.
  //
  //  hoehe    - die Zeile selbst, wie sie wirklich ist (krumm). Gemessen wird
  //             sie beim Aufbau der Kopfzeile und bei einer Drehung, also
  //             genau dann, wenn sie sich aendern kann.
  //  imFluss  - wie weit sie zu sehen waere, wenn weder Pfeil noch Kleben
  //             mitredeten - also allein nach der Scroll-Position. Ihr Platz im
  //             Dokument beginnt genau an der Unterkante der Leiste, deshalb
  //             ist das schlicht "Hoehe minus Scroll-Position".
  //  sichtbar - wie weit sie JETZT hervorschaut. Im Fluss ist das imFluss;
  //             geheftet steht sie ganz da oder ganz dahinter. Waehrend einer
  //             Fahrt fragt hier ohnehin niemand, dort zaehlt ihr Ziel
  //             (mainHeaderTabsIntent).
  //
  // Frueher stand hier eine echte Messung - zwei getBoundingClientRect() pro
  // Scroll-Bild. Das erzwingt Bild fuer Bild ein Layout des ganzen Dokuments,
  // und der Feed rechnet mit content-visibility ohnehin schon nach. Genau da
  // blieb der erste Wisch nach einem Neuladen kurz haengen. Gerechnet wird mit
  // der KRUMMEN Hoehe: an der gerundeten ist die Entscheidung frueher schon
  // einmal danebengegangen.
  function readMainHeaderTabsRow() {
    const scrollY = readMainHeaderTabsScrollY();
    const hoehe = mainHeaderTabsRowHeightRaw;
    const imFluss = Math.max(0, Math.min(hoehe, hoehe - scrollY));
    return {
      hoehe,
      sichtbar: mainHeaderTabsStuck ? (mainHeaderTabsTucked ? 0 : hoehe) : imFluss,
      imFluss,
      scrollY
    };
  }

  // Die Zeilenhoehe messen: krumm fuer jede Entscheidung, aufgerundet als
  // Fahrstrecke. Aufgerundet, damit hinter der Leiste kein Streifen stehen
  // bleibt - fuer diese eine Strecke ist Runden harmlos, sie endet ohnehin
  // dahinter.
  //
  // Die CSS-Variable wird nur geschrieben, wenn sich der Wert wirklich aendert:
  // ein setProperty schreibt das style-Attribut am <html> auch dann neu, wenn
  // derselbe Wert schon dort steht - und daran haengt der MutationObserver, der
  // die Browser-Leiste neu einfaerbt.
  function measureMainHeaderTabsRowHeight(tabsEl = getMainHeaderTabsEl()) {
    const roh = Number(tabsEl?.getBoundingClientRect?.().height) || 0;
    if (roh > 0) {
      mainHeaderTabsRowHeightRaw = roh;
      mainHeaderTabsRowHeight = Math.ceil(roh);
      const wert = `${mainHeaderTabsRowHeight}px`;
      if (wert !== mainHeaderTabsRowHeightVar) {
        mainHeaderTabsRowHeightVar = wert;
        doc?.documentElement?.style?.setProperty?.("--smart-header-tabs-row-height", wert);
      }
    }
    return mainHeaderTabsRowHeight;
  }

  // Zu sehen oder nicht. Laeuft gerade eine Fahrt, zaehlt ihr Ziel: der Pfeil
  // soll sich sofort drehen und nicht erst, wenn sie angekommen ist - und ein
  // Tipp mittendrin soll die Bewegung umdrehen, statt ihre Mitte abzulesen.
  function isMainHeaderTabsRowVisible() {
    if (mainHeaderTabsIntent !== null) return mainHeaderTabsIntent;
    return readMainHeaderTabsRow().sichtbar > MAIN_HEADER_TABS_VISIBLE_EPS_PX;
  }

  function setMainHeaderTabsIntent(next) {
    mainHeaderTabsIntent = next === null ? null : !!next;
    syncMainHeaderTabsChrome(true);
  }

  // Zwei Klassen, ein Blick. Beide sagen etwas ueber den Pfeil, und beide
  // sitzen deshalb an der Icon-Reihe - nicht am <html>:
  //
  //  --collapse-ready: ob es den Pfeil ueberhaupt gibt. Er hat nur etwas zu
  //                    tun, wenn der Platz der Zeile weggescrollt ist - oben
  //                    steht sie ja da, wo sie hingehoert. Das haengt allein an
  //                    der Scroll-Position, nie am Ziel einer laufenden Fahrt.
  //  --collapse-away:  wohin er zeigt. Hier zaehlt das Ziel einer Fahrt, damit
  //                    er sich sofort dreht.
  //
  // Die beiden Vergleiche mit dem letzten Stand sind kein Feinschliff: sie
  // sparen im Scroll-Bild das querySelector fuer die Icon-Reihe und den Knopf.
  // Geschaltet wird nur, wenn sich wirklich etwas aendert.
  //
  // Die Schattenkante regelt CSS allein, damit beim schnellen Scrollen nichts
  // nachhinken kann.
  function syncMainHeaderTabsChrome(force = false) {
    const blick = readMainHeaderTabsRow();
    const weggescrollt = blick.imFluss <= MAIN_HEADER_TABS_VISIBLE_EPS_PX;
    if (force || weggescrollt !== mainHeaderTabsOffscreenState) {
      mainHeaderTabsOffscreenState = weggescrollt;
      getMainHeaderActionsEl()?.classList?.toggle?.("smart-header-actions--collapse-ready", weggescrollt);
    }
    const visible = mainHeaderTabsIntent !== null
      ? mainHeaderTabsIntent
      : blick.sichtbar > MAIN_HEADER_TABS_VISIBLE_EPS_PX;
    if (!force && visible === mainHeaderTabsVisibleState) return;
    mainHeaderTabsVisibleState = visible;
    getMainHeaderActionsEl()?.classList?.toggle?.("smart-header-actions--collapse-away", !visible);
    getMainHeaderTabsToggleEl()?.setAttribute?.("aria-expanded", visible ? "true" : "false");
  }

  function setMainHeaderTabsStuck(next) {
    mainHeaderTabsStuck = !!next;
    doc?.documentElement?.classList?.toggle?.("smart-header-tabs-stuck", mainHeaderTabsStuck);
  }

  function setMainHeaderTabsTucked(next) {
    mainHeaderTabsTucked = !!next;
    doc?.documentElement?.classList?.toggle?.("smart-header-tabs-tucked", mainHeaderTabsTucked);
  }

  // Der Uebergang liegt nur waehrend der Fahrt an. Ausserhalb muss die Zeile
  // sofort sitzen, wo sie hingehoert - ein liegengebliebener Uebergang wuerde
  // jeden spaeteren Zustandswechsel weichzeichnen.
  function setMainHeaderTabsSliding(next) {
    doc?.documentElement?.classList?.toggle?.("smart-header-tabs-sliding", !!next);
  }

  function clearMainHeaderTabsSlideTimer() {
    if (mainHeaderTabsSlideTimerId) win?.clearTimeout?.(mainHeaderTabsSlideTimerId);
    mainHeaderTabsSlideTimerId = 0;
  }

  // Der Zustand VOR der Fahrt muss stehen, bevor der Wert wechselt: Layout und
  // berechneter Stil, samt Schattenkante.
  //
  // Das ist kein Feinschliff, sondern die Bedingung dafuer, dass ueberhaupt
  // etwas faehrt. WebKit (Safari, also jedes iPhone) verlangt den Uebergang
  // schon im Zustand davor - werden Uebergang und Wert in derselben Aufgabe
  // gesetzt, springt die Zeile ohne Fahrt an ihr Ziel. Chromium traegt ihn
  // nachtraeglich ein und verdeckt den Fehler.
  //
  // Ein Lesen erzwingt die Neuberechnung. Der gelesene Wert selbst ist egal -
  // er wird nur zurueckgegeben, damit ihn niemand fuer versehentlich haelt.
  //
  // Hier stand einmal ein drittes Lesen: die Deckkraft des ::after, also der
  // Schattenkante. Das stammte aus der Zeit, als die Kante noch ein- und
  // ausgeblendet wurde. Sie wird es nicht mehr - sie faehrt mit demselben
  // transform mit, und tests/smart-header-tabs-layout-stability.test.mjs
  // verbietet inzwischen jede Regel, die sie schaltet. Das Lesen hat also die
  // Stilaufloesung eines Pseudo-Elements erzwungen, zwei- bis dreimal pro Tipp,
  // fuer einen Wert, den es nicht mehr gibt.
  function forceMainHeaderTabsReflow() {
    const el = getMainHeaderTabsEl();
    if (!el) return 0;
    let gelesen = 0;
    try {
      gelesen += String(win?.getComputedStyle?.(el)?.transitionProperty || "").length;
    } catch {}
    gelesen += Number(el.getBoundingClientRect?.().height) || 0;
    return gelesen;
  }

  // Jede Fahrt endet gleich: Uebergang weg, Ziel vergessen. Ab dann sagt wieder
  // die Messung, was zu sehen ist.
  function scheduleMainHeaderTabsSlideEnd(danach = null) {
    clearMainHeaderTabsSlideTimer();
    if (typeof win?.setTimeout !== "function") {
      setMainHeaderTabsSliding(false);
      if (typeof danach === "function") danach();
      setMainHeaderTabsIntent(null);
      return;
    }
    mainHeaderTabsSlideTimerId = win.setTimeout(() => {
      mainHeaderTabsSlideTimerId = 0;
      setMainHeaderTabsSliding(false);
      if (typeof danach === "function") danach();
      setMainHeaderTabsIntent(null);
    }, MAIN_HEADER_TABS_SLIDE_MS + MAIN_HEADER_TABS_SLIDE_SETTLE_MS);
  }

  // Die Zeile ganz loslassen: kein Kleben, keine Fahrt, kein Rest. Danach steht
  // sie wieder normal im Fluss.
  function releaseMainHeaderTabsRow() {
    clearMainHeaderTabsSlideTimer();
    setMainHeaderTabsSliding(false);
    setMainHeaderTabsTucked(false);
    setMainHeaderTabsStuck(false);
    setMainHeaderTabsIntent(null);
  }

  // GEHOLT: weiter unten holt der Pfeil die Zeile unter die Leiste. Sie faehrt
  // hinter der Leiste hervor - derselbe Weg, den sie beim Scrollen nimmt, nur
  // rueckwaerts. Ein ausdruecklich geholtes Ziel hebt ein frueheres "zu" auf.
  function slideMainHeaderTabsIn() {
    clearMainHeaderTabsSlideTimer();
    const sofort = mainHeaderTabsPrefersReducedMotion();
    // Faehrt sie schon (der Nutzer tippt schnell hin und her), wird nur die
    // Richtung umgedreht: der Uebergang bleibt liegen und rechnet von der
    // Stelle weiter, an der sie gerade steht. Ihn hier abzuschalten hat sie
    // erst hart hinter die Leiste springen lassen und von dort neu anfahren.
    if (!mainHeaderTabsStuck) {
      setMainHeaderTabsSliding(false);
      setMainHeaderTabsStuck(true);
      setMainHeaderTabsTucked(true);
      if (!sofort) forceMainHeaderTabsReflow();
    }
    setMainHeaderTabsIntent(true);
    if (sofort) {
      setMainHeaderTabsSliding(false);
      setMainHeaderTabsTucked(false);
      setMainHeaderTabsIntent(null);
      return;
    }
    setMainHeaderTabsSliding(true);
    // Zweimal lesen, zwei verschiedene Gruende: oben stand der Startpunkt fest
    // (noch ohne Uebergang), hier steht der Uebergang fest (noch am
    // Startpunkt). Erst danach darf der Wert wechseln.
    forceMainHeaderTabsReflow();
    setMainHeaderTabsTucked(false);
    scheduleMainHeaderTabsSlideEnd();
  }

  // LOSGELASSEN: sie faehrt hinter die Leiste und gibt danach das Kleben auf.
  // Dass sie im Fluss dann weit ueber dem Bild steht, sieht niemand - sie war
  // schon hinter der Leiste.
  function slideMainHeaderTabsOut() {
    if (!mainHeaderTabsStuck || mainHeaderTabsTucked) return;
    clearMainHeaderTabsSlideTimer();
    if (mainHeaderTabsPrefersReducedMotion()) {
      releaseMainHeaderTabsRow();
      return;
    }
    setMainHeaderTabsIntent(false);
    setMainHeaderTabsSliding(true);
    forceMainHeaderTabsReflow();
    setMainHeaderTabsTucked(true);
    // Erst ein Stueck nach der Fahrt loslassen: genau auf der Dauer koennte der
    // Timer einen Frame zu frueh kommen, und die letzten Pixel saehe man
    // springen. In der Zulage bewegt sich nichts mehr.
    scheduleMainHeaderTabsSlideEnd(() => {
      setMainHeaderTabsTucked(false);
      setMainHeaderTabsStuck(false);
    });
  }

  // Der ganze Pfeil. Er ist nur da, wo er etwas zu tun hat, also bleibt genau
  // eine Frage: ist die Zeile gerade zu sehen?
  function toggleMainHeaderTabs() {
    syncSmartHeaderMetrics();
    const tabsEl = getMainHeaderTabsEl();
    if (!tabsEl) return;
    measureMainHeaderTabsRowHeight(tabsEl);
    const blick = readMainHeaderTabsRow();
    // Oben gibt es nichts zu holen und nichts wegzuraeumen - dort ist der Pfeil
    // auch nicht da. Ein Tipp, der es doch bis hierher schafft (etwa waehrend
    // die Seite gerade nach oben laeuft), darf nichts anrichten: eine Zeile,
    // die der Nutzer nicht mehr zurueckholen kann, waere eine Falle.
    if (blick.imFluss > MAIN_HEADER_TABS_VISIBLE_EPS_PX) {
      syncMainHeaderTabsChrome(true);
      return;
    }
    const istZuSehen = mainHeaderTabsIntent !== null
      ? mainHeaderTabsIntent
      : blick.sichtbar > MAIN_HEADER_TABS_VISIBLE_EPS_PX;
    if (istZuSehen) slideMainHeaderTabsOut();
    else slideMainHeaderTabsIn();
  }

  function syncMainHeaderTabsOnScroll() {
    const scrollY = readMainHeaderTabsScrollY();
    const previous = mainHeaderTabsLastScrollY;
    mainHeaderTabsLastScrollY = scrollY;
    if (mainHeaderTabsStuck) {
      if (scrollY <= MAIN_HEADER_TABS_TOP_EPS_PX) {
        // Ganz oben deckt sich der geheftete Platz mit dem normalen: das Kleben
        // darf still aufhoeren, es bewegt sich dabei nichts.
        releaseMainHeaderTabsRow();
      } else if (scrollY > previous + MAIN_HEADER_TABS_DOWN_DELTA_PX) {
        // Weiterscrollen nach unten nimmt die geholte Zeile wieder mit.
        slideMainHeaderTabsOut();
      }
    }
    syncMainHeaderTabsChrome();
  }

  function stopMainHeaderTabsRuntime() {
    // Es gibt keinen Zustand, der an einem Element haengt: wo die Zeile steht,
    // sagen die Klassen und die Scroll-Position.
    if (win && typeof mainHeaderTabsScrollListener === "function") {
      win.removeEventListener("scroll", mainHeaderTabsScrollListener);
    }
    if (win && typeof mainHeaderTabsResizeListener === "function") {
      win.removeEventListener("orientationchange", mainHeaderTabsResizeListener);
    }
    if (typeof mainHeaderTabsToggleUnbind === "function") mainHeaderTabsToggleUnbind();
    if (win && mainHeaderTabsRafId) win.cancelAnimationFrame?.(mainHeaderTabsRafId);
    mainHeaderTabsRafId = 0;
    mainHeaderTabsScrollListener = null;
    mainHeaderTabsResizeListener = null;
    mainHeaderTabsToggleUnbind = null;
  }

  function initMainHeaderTabsRuntime(tabsEl) {
    stopMainHeaderTabsRuntime();
    if (!win || !doc || !tabsEl || !tabsEl.classList.contains("smart-header-tabs--main")) return;

    // Auf das Loslassen des Fingers statt auf den Klick - dieselbe Bindung wie
    // bei den Pills daneben (siehe core/common/tap-bind-utils.js).
    mainHeaderTabsToggleUnbind = bindTap(getMainHeaderTabsToggleEl(), toggleMainHeaderTabs);
    // Zustand nach jedem Re-Render wieder ansagen (Klassen und aria bleiben so
    // auch auf frisch gebautem DOM korrekt). Ohne Uebergang: ein Re-Render ist
    // keine Bewegung.
    setMainHeaderTabsSliding(false);
    setMainHeaderTabsStuck(mainHeaderTabsStuck);
    setMainHeaderTabsTucked(mainHeaderTabsTucked);

    measureMainHeaderTabsRowHeight(tabsEl);
    mainHeaderTabsLastScrollY = readMainHeaderTabsScrollY();
    syncMainHeaderTabsChrome(true);

    mainHeaderTabsScrollListener = () => {
      if (mainHeaderTabsRafId) return;
      mainHeaderTabsRafId = win.requestAnimationFrame?.(() => {
        mainHeaderTabsRafId = 0;
        syncMainHeaderTabsOnScroll();
      }) || 0;
      if (!mainHeaderTabsRafId) syncMainHeaderTabsOnScroll();
    };
    win.addEventListener("scroll", mainHeaderTabsScrollListener, { passive: true });

    // Nachmessen nur bei einer Drehung - da wird die Zeile wirklich anders
    // hoch, weil die Pills auf einer anderen Breite anders umbrechen.
    //
    // Ausdruecklich NICHT an "resize" und schon gar nicht an visualViewport:
    // beide melden sich auf iOS mitten im Scrollen, sobald die Adressleiste
    // einfaehrt - also genau beim ersten Wisch nach einem Neuladen. Hier hingen
    // drei erzwungene Layouts und zwei Schreibvorgaenge am <html> daran, und
    // der Wisch blieb sichtbar haengen. Die Zeilenhoehe aendert sich dabei
    // ohnehin nicht: die Adressleiste macht das Bild niedriger, nicht schmaler.
    //
    // Die Fahrt selbst misst vor jedem Tipp neu (toggleMainHeaderTabs), damit
    // die Strecke auch nach einem Schriftgroessen-Wechsel stimmt.
    mainHeaderTabsResizeListener = () => {
      syncSmartHeaderMetrics();
      measureMainHeaderTabsRowHeight(tabsEl);
      syncMainHeaderTabsChrome(true);
    };
    win.addEventListener("orientationchange", mainHeaderTabsResizeListener);
  }
  // ---------------------------------------------------------------------------
  // Pin in der Kopfzeile: zu zeigt die Zeile das Textlogo, offen das
  // Location-Feld. Beides liegt gleichzeitig im DOM, umgeschaltet wird nur eine
  // Klasse am <html>. Deshalb ist der Wechsel sofort da (kein Re-Render), das
  // Feld verliert nie seinen Inhalt und der Zustand kann nicht auseinanderlaufen.
  // ---------------------------------------------------------------------------
  function getSmartHeaderLocationScopeEl() {
    return doc?.querySelector?.('[data-feed-location-scope="header"]') || null;
  }

  // Bewusst ohne instanceof-Pruefungen auf Browser-Globals: die Kopfzeile prueft
  // nur, was sie wirklich benutzt. Das kann in keiner Umgebung werfen.
  function getSmartHeaderLocationInputEl() {
    const input = doc?.getElementById?.("feedLocationCityInput");
    return input && typeof input === "object" && "value" in input ? input : null;
  }

  function isSmartHeaderEventTarget(target) {
    return !!target && typeof target.closest === "function";
  }

  // Dieselben vier DOM-Schritte wie hideFeedLocationSuggestions() im
  // Feed-Controller. Bewusst hier nachgebaut, damit die Kopfzeile ihre
  // Aufklapp-Mechanik ohne Abhaengigkeit zum Feed-Modul zumachen kann.
  function hideSmartHeaderLocationSuggestions() {
    const suggestionsRoot = doc?.getElementById?.("feedLocationCitySuggestions");
    if (suggestionsRoot) {
      suggestionsRoot.classList?.remove?.("feed-location-suggestions--open");
      suggestionsRoot.setAttribute?.("aria-hidden", "true");
      suggestionsRoot.innerHTML = "";
    }
    getSmartHeaderLocationInputEl()?.setAttribute?.("aria-expanded", "false");
  }

  // Halb getippte Eingaben duerfen nicht stehen bleiben: beim Auf- und Zumachen
  // steht im Feld immer die Stadt, die wirklich gesetzt ist.
  function resetSmartHeaderLocationInputValue() {
    const input = getSmartHeaderLocationInputEl();
    if (!input) return;
    const record = readStoredFeedViewerLocation();
    const label = String(record?.label || record?.city || "").trim();
    if (input.value !== label) input.value = label;
  }

  function clearSmartHeaderLocationFocusFrame() {
    if (win && smartHeaderLocationFocusRafId) {
      win.cancelAnimationFrame?.(smartHeaderLocationFocusRafId);
    }
    smartHeaderLocationFocusRafId = 0;
  }

  function applySmartHeaderLocationChrome() {
    // Ohne Location-Feld in der Zeile kann nichts offen sein - dann bleibt das
    // Textlogo stehen, egal was der Zustand vorher sagte.
    const open = smartHeaderLocationExpanded && !!getSmartHeaderLocationScopeEl();
    doc?.documentElement?.classList?.toggle?.("smart-header-location-open", open);
    const toggleEl = doc?.querySelector?.("[data-smart-header-location-toggle]");
    toggleEl?.setAttribute?.("aria-expanded", open ? "true" : "false");
    toggleEl?.classList?.toggle?.("smart-header-location-btn--active", open);
  }

  function focusSmartHeaderLocationInput() {
    const input = getSmartHeaderLocationInputEl();
    if (!input) return;
    const focusInput = () => {
      try {
        input.focus({ preventScroll: true });
      } catch {
        try {
          input.focus();
        } catch {}
      }
      try {
        input.select?.();
      } catch {}
    };
    // Erster Versuch noch im Klick des Nutzers: nur so oeffnet iOS die Tastatur.
    focusInput();
    if (doc?.activeElement === input) return;
    // Zweiter Versuch im naechsten Frame, falls das Feld beim Klick noch nicht
    // sichtbar gerechnet war.
    clearSmartHeaderLocationFocusFrame();
    if (!win?.requestAnimationFrame) return;
    smartHeaderLocationFocusRafId = win.requestAnimationFrame(() => {
      smartHeaderLocationFocusRafId = 0;
      if (!smartHeaderLocationExpanded) return;
      const nextInput = getSmartHeaderLocationInputEl();
      if (!nextInput || doc?.activeElement === nextInput) return;
      focusInput();
    }) || 0;
  }

  function setSmartHeaderLocationExpanded(next, { focusInput = false } = {}) {
    const wanted = !!next && !!getSmartHeaderLocationScopeEl();
    if (wanted === smartHeaderLocationExpanded) {
      applySmartHeaderLocationChrome();
      return;
    }
    smartHeaderLocationExpanded = wanted;
    clearSmartHeaderLocationFocusFrame();
    hideSmartHeaderLocationSuggestions();
    resetSmartHeaderLocationInputValue();
    applySmartHeaderLocationChrome();
    if (!wanted) {
      const input = getSmartHeaderLocationInputEl();
      if (input && doc?.activeElement === input) {
        try {
          input.blur();
        } catch {}
      }
      return;
    }
    if (focusInput) focusSmartHeaderLocationInput();
  }

  function bindSmartHeaderLocationDelegation() {
    if (!doc || smartHeaderLocationDelegationBound) return;
    smartHeaderLocationDelegationBound = true;

    // Delegiert am Dokument und nur ein einziges Mal gebunden: der Pin
    // funktioniert damit auch nach jedem Neuaufbau der Kopfzeile weiter.
    doc.addEventListener("click", (event) => {
      const target = event.target;
      if (!isSmartHeaderEventTarget(target)) return;
      if (!target.closest("[data-smart-header-location-toggle]")) return;
      event.preventDefault();
      event.stopPropagation();
      setSmartHeaderLocationExpanded(!smartHeaderLocationExpanded, { focusInput: true });
    });

    // Tippen ausserhalb macht das Feld wieder zu. So kann das Textlogo nie
    // dauerhaft verdeckt bleiben, auch wenn jemand den Pin nicht mehr trifft.
    // Capture-Phase, damit ein stopPropagation des getroffenen Elements den
    // Griff nicht verschluckt; verhindert wird dabei nichts.
    //
    // Zu geht es aber nur bei einem TIPP - nicht, wenn der Finger zieht.
    // Vorher schloss schon das pointerdown: wer bei offenem Feld einfach den
    // Feed scrollen wollte, bekam mitten in der Geste den Klassenwechsel am
    // <html>, das geleerte Vorschlags-Dropdown und das blur samt einfahrender
    // Tastatur - die ganze Seite rechnete um, und die Kacheln blitzten.
    // Jetzt entscheidet das pointerup: unbewegt heisst Tipp und macht zu,
    // gezogen heisst Scrollen und laesst das Feld in Ruhe.
    const SMART_HEADER_LOCATION_TAP_SLOP_PX = 10;
    let locationCloseCandidate = null;
    doc.addEventListener("pointerdown", (event) => {
      locationCloseCandidate = null;
      if (!smartHeaderLocationExpanded) return;
      const target = event.target;
      if (!isSmartHeaderEventTarget(target)) return;
      if (target.closest('[data-feed-location-scope="header"]')) return;
      if (target.closest("[data-smart-header-location-toggle]")) return;
      locationCloseCandidate = {
        pointerId: event.pointerId,
        x: Number(event.clientX) || 0,
        y: Number(event.clientY) || 0
      };
    }, true);
    doc.addEventListener("pointermove", (event) => {
      if (!locationCloseCandidate || event.pointerId !== locationCloseCandidate.pointerId) return;
      const dx = (Number(event.clientX) || 0) - locationCloseCandidate.x;
      const dy = (Number(event.clientY) || 0) - locationCloseCandidate.y;
      if ((dx * dx) + (dy * dy) > SMART_HEADER_LOCATION_TAP_SLOP_PX * SMART_HEADER_LOCATION_TAP_SLOP_PX) {
        locationCloseCandidate = null;
      }
    }, true);
    doc.addEventListener("pointercancel", () => {
      locationCloseCandidate = null;
    }, true);
    doc.addEventListener("pointerup", (event) => {
      const candidate = locationCloseCandidate;
      locationCloseCandidate = null;
      if (!candidate || event.pointerId !== candidate.pointerId) return;
      if (!smartHeaderLocationExpanded) return;
      setSmartHeaderLocationExpanded(false);
    }, true);
  }

  // Laeuft nach jedem Render. Haelt Klasse und aria am DOM richtig und macht das
  // Feld zu, sobald die Stadt wirklich gewechselt hat - dann ist der Auftrag des
  // Pins erledigt und das Textlogo darf zurueck.
  function syncSmartHeaderLocationRuntime() {
    bindSmartHeaderLocationDelegation();
    if (!getSmartHeaderLocationScopeEl()) {
      smartHeaderLocationExpanded = false;
      smartHeaderLocationKey = "";
      clearSmartHeaderLocationFocusFrame();
      applySmartHeaderLocationChrome();
      return;
    }
    const currentKey = buildFeedLocationRenderKey();
    const didLocationChange = !!smartHeaderLocationKey && currentKey !== smartHeaderLocationKey;
    smartHeaderLocationKey = currentKey;
    if (didLocationChange && smartHeaderLocationExpanded) {
      const input = getSmartHeaderLocationInputEl();
      // Schreibt der Nutzer gerade noch, bleibt das Feld offen - zugemacht wird
      // es dann durch den Pin oder durch Tippen ausserhalb.
      if (!input || doc?.activeElement !== input) {
        setSmartHeaderLocationExpanded(false);
        return;
      }
    }
    applySmartHeaderLocationChrome();
  }

  function stopSmartHeaderVisibilitySync({ resetState = true } = {}) {
    // Ohne Kopfzeile im Dokument darf die Schutzflaeche nicht stehen bleiben -
    // sie laege sonst ueber dem Inhalt von Ansichten, die gar keine haben.
    if (resetState) setSmartHeaderGuardScope(false, false);
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
      // Ohne Zeile im DOM darf keine Klasse von ihr stehen bleiben - sonst
      // faengt der naechste Aufbau mitten in einer Fahrt an. Die beiden Klassen
      // des Pfeils sitzen an der Icon-Reihe und verschwinden mit ihr; hier wird
      // nur der gemerkte Stand zurueckgesetzt, damit der naechste Aufbau sie
      // wieder ansagt.
      releaseMainHeaderTabsRow();
      mainHeaderTabsOffscreenState = null;
      mainHeaderTabsVisibleState = null;
      smartHeaderLastScrollY = 0;
      smartHeaderToggleAnchorY = 0;
      smartHeaderVisible = true;
      smartHeaderIgnoreScrollUntilTs = 0;
    }
    if (resetState) resetSmartHeaderMetrics();
  }

  // Sagt der Schutzflaeche in index.html, ob es gerade eine Kopfzeile gibt.
  // Sie steht ausserhalb von #app, damit kein Neuaufbau sie erreichen kann -
  // deshalb muss ihr jemand sagen, wann sie gebraucht wird.
  function setSmartHeaderGuardScope(present, mapScope = false) {
    const klassen = doc?.documentElement?.classList;
    klassen?.toggle?.("smart-header-present", !!present);
    klassen?.toggle?.("smart-header-map-scope", !!mapScope);
  }

  function initSmartHeaderVisibilitySync() {
    if (!win || !doc) return;
    const topEl = doc.getElementById("smart-header-top");
    const tabs = doc.getElementById("smart-tabs");
    if (!topEl) {
      stopSmartHeaderVisibilitySync({ resetState: true });
      return;
    }
    setSmartHeaderGuardScope(true, !!doc.querySelector?.(".map-fixed-page-header"));

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

    // Der sticky-Abstand steht im Stylesheet und aendert sich beim Scrollen
    // nicht. Vorher wurde er mit getComputedStyle in JEDEM Scroll-Event neu
    // gelesen - zusammen mit dem getBoundingClientRect zwei erzwungene
    // Layouts pro Event, auf einer Seite, deren Kacheln mit content-visibility
    // ohnehin nachrechnen. Gelesen wird er jetzt einmal beim Binden und nach
    // einem resize neu; das Scroll-Bild misst nur noch die eine Kante.
    let cachedStickyTop = null;
    const readStickyTop = () => {
      const style = win.getComputedStyle?.(stickyWrapEl);
      return Math.max(0, Math.ceil(parseFloat(style?.top || "0") || 0));
    };

    const syncPinnedState = () => {
      if (cachedStickyTop === null) cachedStickyTop = readStickyTop();
      const rect = stickyWrapEl.getBoundingClientRect();
      setBusinessTopTabsPinned(rect.top <= (cachedStickyTop + 1));
    };

    // rAF-gedrosselt: einmal messen pro Bild, wie beim Smart-Header-Listener.
    // window-scroll reicht als Ausloeser; visualViewport-"scroll" meldet sich
    // auf iOS auch waehrend Adressleiste und Tastatur fahren und hat hier pro
    // Bewegung ein zusaetzliches Layout erzwungen.
    let pinSyncRafId = 0;
    const schedulePinSync = () => {
      if (pinSyncRafId) return;
      pinSyncRafId = win.requestAnimationFrame?.(() => {
        pinSyncRafId = 0;
        syncPinnedState();
      }) || 0;
      if (!pinSyncRafId) syncPinnedState();
    };

    const onScroll = () => schedulePinSync();
    const onResize = () => {
      cachedStickyTop = null;
      schedulePinSync();
    };

    win.addEventListener("scroll", onScroll, { passive: true });
    win.addEventListener("resize", onResize);
    win.visualViewport?.addEventListener?.("resize", onResize);

    syncPinnedState();

    businessTopTabsPinSyncCleanup = () => {
      win.removeEventListener("scroll", onScroll);
      win.removeEventListener("resize", onResize);
      win.visualViewport?.removeEventListener?.("resize", onResize);
      if (pinSyncRafId) win.cancelAnimationFrame?.(pinSyncRafId);
      pinSyncRafId = 0;
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
      // Nur der Stadt-Auswahlschirm klebt oben am Header: seine farbige Flaeche
      // soll ohne Fuge unter der Leiste anfangen. Steht der Feed selbst da,
      // gilt wieder der normale Kopfabstand des Inhalts - sonst sitzt die
      // Ueberschrift eine Spur hoeher als bei Lokalet und Ofertat.
      if (isFeedLocationGate && !isFeedLocationFeedStage) {
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
      // Die Kennzahl-Reihe im Panel steht ueber dem Bento und aendert sich
      // beim Umschalten seiner Seiten ueberhaupt nicht. Ein Neuaufbau setzt
      // trotzdem frische <img> ein, und der Browser baut jedes Bild neu auf -
      // das sah man als Flackern bei jedem Tippen auf Funksionet/Analitika/
      // Opsionet.
      //
      // Deshalb dasselbe wie beim Feed: den alten Knoten merken und nach dem
      // Neuaufbau wieder einhaengen, WENN die neue Reihe dasselbe sagt. Den
      // Vergleich macht ihr Fingerabdruck (data-dashboard-metrics), nicht ihr
      // Markup - im Dokument stehen daran schon Laufzeit-Spuren.
      const reuseMetricRow = preserveMainScroll && state.activeTab === "dashboard"
        ? doc?.querySelector("[data-dashboard-metrics]")
        : null;
      const reuseMetricRowSignature = reuseMetricRow
        ? String(reuseMetricRow.getAttribute("data-dashboard-metrics") || "")
        : "";
      const reuseLeafletMapCanvas = preserveMainScroll && state.activeTab === "map"
        ? doc?.getElementById("leafletMap")
        : null;
      const preservedMapSearchQuery = preserveMainScroll && state.activeTab === "map"
        ? String(doc?.getElementById("mapSearchInput")?.value || "")
        : "";
      const prevScrollTop = preserveMainScroll ? doc?.querySelector("main")?.scrollTop ?? 0 : 0;
      const prevViewportScrollTop = preserveViewportScroll ? getViewportScrollTop() : 0;
      let nextViewportScrollTop = null;
      // Behalten oder springen? Behalten heisst: nur nachhelfen, wenn der
      // Neuaufbau die Position gekappt hat - nie gegen den Finger schreiben.
      let nextViewportScrollIsRestore = false;
      if (preserveSmartHeaderWindowScroll) armSmartHeaderScrollGuard();
      // Vor dem Neuaufbau gemerkt, direkt danach wieder eingehaengt - und zwar
      // noch vor dem Binden, damit die Handler auf den Knoten sitzen, die
      // wirklich im Dokument stehen.
      const altSmartHeaderNodes = readSmartHeaderNodes();
      // Der Regelfall: die Header-Knoten bleiben stehen, alles andere wird
      // ausgetauscht. Nur wenn die Form nicht passt, faellt es auf innerHTML
      // zurueck - dann fasst reuseSmartHeaderNodes danach nach.
      let headerBlieb = false;
      if (appEl) {
        if (!shouldReuseExistingMountedHtml) {
          headerBlieb = applyAppHtmlKeepingHeader(appEl, nextHtml);
          if (!headerBlieb) appEl.innerHTML = nextHtml;
        }
        appEl.removeAttribute("aria-busy");
        appEl.dataset.startupInteractionSafety = startupInteractionSafety;
        appEl.dataset.startupActionsLocked = startupActionsLocked ? "1" : "0";
      }
      // Nur auf dem Rueckfall-Weg: dort steht das frische Markup noch
      // unveraendert im Dokument und darf als Vergleich gemerkt werden. Auf
      // dem kindweisen Weg hat applyAppHtmlKeepingHeader es schon aus der
      // Buehne mitgeschrieben - ein Lesen aus dem Dokument faende dort den
      // lebenden Stand samt Laufzeit-Spuren und vergiftete den Vergleich.
      if (!headerBlieb) reuseSmartHeaderNodes(altSmartHeaderNodes);
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
      // Nur wenn die neue Reihe dasselbe sagt wie die alte. Steht dort eine
      // andere Zahl oder ein anderes Bild, gewinnt die neue - sonst bliebe ein
      // ueberholter Stand stehen.
      if (reuseMetricRow && reuseMetricRowSignature) {
        const nextMetricRow = doc?.querySelector("[data-dashboard-metrics]");
        if (
          nextMetricRow
          && nextMetricRow !== reuseMetricRow
          && String(nextMetricRow.getAttribute("data-dashboard-metrics") || "") === reuseMetricRowSignature
        ) {
          nextMetricRow.replaceWith(reuseMetricRow);
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
          nextViewportScrollIsRestore = true;
        }
        updateFeedDomFn();
      } else if (preserveMainScroll) {
        const nextMain = doc?.querySelector("main");
        if (nextMain) nextMain.scrollTop = prevScrollTop;
        nextViewportScrollTop = prevViewportScrollTop;
        nextViewportScrollIsRestore = true;
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
        if (nextViewportScrollIsRestore) restoreViewportScrollTop(nextViewportScrollTop);
        else setViewportScrollTop(nextViewportScrollTop);
      }
      if (win?.lucide?.createIcons) win.lucide.createIcons();
      if (state.activeTab === "search" && state.search.keepFocus) {
        state.search.keepFocus = false;
        focusSearchInputFn();
      }
      restoreChatInputFocusStateFn(chatInputFocusState);
      if (nextViewportScrollTop !== null && (didMainTabChange || preserveMainScroll)) {
        if (preserveSmartHeaderWindowScroll) armSmartHeaderScrollGuard();
        if (nextViewportScrollIsRestore) scheduleViewportScrollRestore(nextViewportScrollTop);
        else scheduleViewportScrollTop(nextViewportScrollTop);
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
    // Bewusst bei jedem Render und ausserhalb des Blocks oben: der Pin-Zustand
    // muss auch dann am DOM stehen, wenn die Kopfzeile unverandert geblieben ist.
    syncSmartHeaderLocationRuntime();

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
    bindImageFallbacks,
    // Fuer den Regressionstest der Header-Pills: die Scroll-Runtime der
    // Tab-Zeile haengt sonst nur an echtem DOM.
    initMainHeaderTabsRuntime,
    isMainHeaderTabsRowVisible,
    // Fuer den Regressionstest der Pin-Kopfzeile: Auf- und Zuklappen wird sonst
    // nur ueber den delegierten Klick am Dokument angestossen.
    syncSmartHeaderLocationRuntime,
    setSmartHeaderLocationExpanded,
    isSmartHeaderLocationExpanded: () => smartHeaderLocationExpanded,
    // Fuer den Regressionstest des Neuaufbaus: beides haengt sonst mitten im
    // Render-Pfad und waere nur mit einem vollstaendigen DOM zu erreichen.
    restoreViewportScrollTop,
    scheduleViewportScrollRestore,
    readSmartHeaderNodes,
    reuseSmartHeaderNodes,
    applyAppHtmlKeepingHeader,
    // Fuer den Regressionstest der Modal-Chrome: An dieser Zeichenkette haengt,
    // ob ein geoeffnetes Modal die Overlays neu bauen laesst - und damit, ob
    // die Seite dahinter gesperrt und der sichere Bereich oben eingefaerbt
    // wird. Sie steht sonst mitten im Render-Pfad.
    buildOverlayRenderSignature
  };
}
