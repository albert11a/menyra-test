import { createProfileOpenFlowControllerCore } from "../profile/profile-open-flow-utils.js";
import { createDeeplinkFlowControllerCore } from "../router/deeplink-flow-utils.js";
import { createShopViewCartOrchestrationController } from "../shop/shop-view-cart-orchestration-controller.js";
import { createFeedViewOrchestrationController } from "../feed/feed-view-orchestration-controller.js";
import { createOverlayOrchestrationController } from "../overlays/overlay-orchestration-controller.js";

export function createAppControllerBridge({
  profile = {},
  deeplink = {},
  notifications = {},
  shop = {},
  feed = {},
  discovery = {},
  overlay = {}
} = {}) {
  function normalizeDeferredDiscoveryCoords(value = null) {
    const lat = Number(value?.lat ?? value?.latitude ?? value?.y);
    const lng = Number(value?.lng ?? value?.lon ?? value?.longitude ?? value?.x);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
    return { lat, lng };
  }

  function buildRestaurantLocationsFallback(rest = {}, idx = 0) {
    const city = String(rest?.city || "").trim();
    const address = String(rest?.address || rest?.location || "").trim();
    const sourceRows = Array.isArray(rest?.locations) && rest.locations.length ? rest.locations : [null];
    return sourceRows
      .map((location, locationIndex) => {
        const coords = normalizeDeferredDiscoveryCoords(location) || normalizeDeferredDiscoveryCoords(rest);
        if (!coords) return null;
        return {
          id: rest?.id,
          markerKey: `${rest?.id || "biz"}:${locationIndex}`,
          locationIndex,
          name: rest?.name || rest?.restaurantName || "Business",
          type: rest?.type || "food",
          lat: coords.lat,
          lng: coords.lng,
          city: String(location?.city || city).trim(),
          address: String(location?.address || address).trim(),
          hours: rest?.hours || rest?.openHours || "08:00 - 23:00",
          rating: rest?.rating || rest?.score || 4.8,
          img: rest?.logoUrl || rest?.logo || rest?.heroUrl || rest?.coverUrl || "",
          desc: rest?.description || rest?.bio || "Offizielles Lokal.",
          hasVerifiedCoords: true,
          locationStatus: "verified",
          raw: rest,
          sourceIndex: idx
        };
      })
      .filter(Boolean);
  }

  const profileOpenFlowController = createProfileOpenFlowControllerCore({
    state: profile.state,
    isLocalBusinessProfile: (profileValue) => profile.isLocalBusinessProfile(profileValue),
    getRestaurantMetaById: (restaurantId) => profile.getRestaurantMetaById(restaurantId),
    normalizeSearchKey: (value) => profile.normalizeSearchKey(value),
    render: () => profile.render(),
    ensureMenuDataForProfile: () => profile.ensureMenuDataForProfile(),
    ensureFocusDataForProfile: () => profile.ensureFocusDataForProfile(),
    hydrateRestaurantsByIds: (restaurantIds, options = {}) => profile.hydrateRestaurantsByIds(restaurantIds, options),
    normalizeExternalProfile: (payload = {}) => profile.normalizeExternalProfile(payload),
    showPublicProfile: (profileValue, posts, options = {}) => profile.showPublicProfile(profileValue, posts, options),
    fetchBusinessProfileDoc: (payload = {}) => profile.fetchBusinessProfileDoc(payload),
    loadBusinessPostsForRestaurant: (restaurantId) => profile.loadBusinessPostsForRestaurant(restaurantId),
    normalizeExternalUserProfile: (payload = {}) => profile.normalizeExternalUserProfile(payload),
    openGuestAuthPrompt: (message = "") => profile.openGuestAuthPrompt(message),
    userProfileCache: profile.userProfileCache,
    hasPendingFollowRequest: async (targetUid) => profile.hasPendingFollowRequest(targetUid),
    fetchUserDocByUid: async (uid) => profile.getDoc(profile.doc(profile.db, "users", uid)),
    resolveUserByHandle: async (handle) => profile.resolveUserByHandle(handle),
    loadUserPostsForUser: async (uid) => profile.loadUserPostsForUser(uid)
  });

  const {
    isOwnBusinessTarget,
    openOwnBusinessProfile,
    openProfileViewFromBusiness,
    openProfileFromUser
  } = profileOpenFlowController;

  let normalizeNotificationItemBridge = (docSnap) => docSnap;
  let openPostModalBridge = async () => {};
  let openChatWithProfileBridge = () => {};

  const deeplinkFlowController = createDeeplinkFlowControllerCore({
    state: deeplink.state,
    getPendingState: () => deeplink.getPendingState(),
    setPendingState: (patch = {}) => deeplink.setPendingState(patch),
    clearQueryParamsFromCurrentUrl: ({ keys = [] } = {}) => {
      deeplink.clearQueryParamsFromCurrentUrlCore({
        windowObj: deeplink.windowObj,
        keys
      });
    },
    resolveRouteStateFromTargetUrl: (rawUrl = "") => deeplink.resolveRouteStateFromTargetUrlCore({
      rawUrl,
      windowObj: deeplink.windowObj,
      resolveInitialRouteState: deeplink.resolveInitialRouteState,
      normalizeInitialTab: deeplink.normalizeInitialTab,
      normalizeAuthMode: deeplink.normalizeAuthMode
    }),
    applyPendingRouteState: (current, routeState) => deeplink.applyPendingRouteStateCore({
      current,
      routeState
    }),
    normalizePendingNotificationId: (value) => deeplink.normalizePendingNotificationIdCore(value),
    findNotificationById: ({ notifications = [], notificationId = "" } = {}) => deeplink.findNotificationByIdCore({
      notifications,
      notificationId
    }),
    fetchNotificationById: async (notificationId, ownerUid) => {
      const safeOwnerUid = String(ownerUid || "").trim();
      const safeNotificationId = String(notificationId || "").trim();
      if (!safeOwnerUid || !safeNotificationId) return null;
      const snap = await deeplink.getDoc(deeplink.doc(deeplink.db, "users", safeOwnerUid, "notifications", safeNotificationId));
      if (!snap.exists()) return null;
      return normalizeNotificationItemBridge(snap);
    },
    prependNotificationById: ({ notifications = [], notificationItem = null, notificationId = "" } = {}) => deeplink.prependNotificationByIdCore({
      notifications,
      notificationItem,
      notificationId
    }),
    saveNotifications: (notificationsList) => deeplink.saveNotifications(notificationsList),
    openNotificationTarget: async (notificationId) => deeplink.openNotificationTarget(notificationId),
    normalizePendingPostId: (value) => deeplink.normalizePendingPostIdCore(value),
    findPostInLocalSources: ({ postId = "" } = {}) => deeplink.findPostInLocalSourcesCore({
      postId,
      findPostById: (id) => deeplink.findPostById(id),
      feedPosts: deeplink.state.feedPosts
    }),
    fetchPostForNotification: async ({ postId = "" } = {}) => deeplink.fetchPostForNotification({ postId }),
    openPostModal: async (post) => openPostModalBridge(post),
    normalizePendingChatUid: (value) => deeplink.normalizePendingChatUidCore(value),
    isSelfPendingChatTarget: ({ chatUid = "", currentUid = "" } = {}) => deeplink.isSelfPendingChatTargetCore({
      chatUid,
      currentUid
    }),
    isChatThreadAlreadyOpen: ({ targetUid = "" } = {}) => deeplink.isChatThreadAlreadyOpenCore({
      chatModalOpen: deeplink.state.chatModal.open,
      currentThreadId: deeplink.getChatThreadId(deeplink.state.chatModal.profile),
      targetUid
    }),
    getChatThreadById: (threadId) => deeplink.getChatThreadById(threadId),
    buildChatRouteTargetProfile: ({ thread = null, targetUid = "" } = {}) => deeplink.buildChatRouteTargetProfileCore({
      thread,
      targetUid
    }),
    openChatWithProfile: (profileValue) => openChatWithProfileBridge(profileValue),
    normalizePendingProfileRestaurantId: (value) => deeplink.normalizePendingProfileRestaurantIdCore(value),
    isPendingProfileAlreadyOpen: ({ pendingProfileRestaurantId = "" } = {}) => deeplink.isPendingProfileAlreadyOpenCore({
      pendingProfileRestaurantId,
      currentProfileRestaurantId: deeplink.state.profileView?.profile?.restaurantId || "",
      currentProfileTruthState: deeplink.state.profileView?.profile?.truthState || ""
    }),
    normalizeProfileTopTabFromRoute: (value) => deeplink.normalizeProfileTopTabFromRouteCore(value),
    openProfileViewFromBusiness: (input, options = {}) => openProfileViewFromBusiness(input, options),
    parsePushOpenTargetPayload: (payload = {}) => deeplink.parsePushOpenTargetPayloadCore(payload),
    shouldHandlePushOpenTarget: ({ notificationId = "", hasRouteFromUrl = false } = {}) => deeplink.shouldHandlePushOpenTargetCore({
      notificationId,
      hasRouteFromUrl
    }),
    applyPendingInitialRouteState: () => deeplink.applyPendingInitialRouteState(),
    render: () => deeplink.render(),
    isPushOpenTargetMessage: (payload = {}) => deeplink.isPushOpenTargetMessageCore(payload),
    getNavigator: () => deeplink.navigatorObj,
    isPushOpenMessageBound: () => deeplink.isPushOpenMessageBound(),
    markPushOpenMessageBound: () => {
      deeplink.markPushOpenMessageBound();
    }
  });

  const {
    clearNotificationQueryParams,
    clearPostQueryParams,
    clearChatQueryParams,
    resolveRouteStateFromTargetUrl,
    applyPendingRouteStateFromTargetUrl,
    maybeOpenNotificationFromQuery,
    maybeOpenPostFromQuery,
    maybeOpenChatFromQuery,
    handlePushOpenTargetMessage,
    bindPushOpenTargetMessageHandler,
    maybeOpenProfileFromQuery
  } = deeplinkFlowController;

  const normalizeNotificationItem = typeof notifications.normalizeNotificationItem === "function"
    ? (docSnap) => notifications.normalizeNotificationItem(docSnap)
    : ((docSnap) => docSnap);
  const mapNotificationSnapshot = typeof notifications.mapNotificationSnapshot === "function"
    ? (snap) => notifications.mapNotificationSnapshot(snap)
    : ((snap) => snap?.docs || []);
  const shouldSurfaceNativePushNow = typeof notifications.shouldSurfaceNativePushNow === "function"
    ? () => notifications.shouldSurfaceNativePushNow()
    : (() => false);
  const startNotificationsListener = typeof notifications.startNotificationsListener === "function"
    ? (user, options = {}) => notifications.startNotificationsListener(user, options)
    : (() => {});
  const syncNotificationsPushRuntime = typeof notifications.syncNotificationsPushRuntime === "function"
    ? async (options = {}) => await notifications.syncNotificationsPushRuntime(options)
    : (async () => false);
  const loadNotificationsFromFirebase = typeof notifications.loadNotificationsFromFirebase === "function"
    ? async (options = {}) => await notifications.loadNotificationsFromFirebase(options)
    : (async () => []);

  normalizeNotificationItemBridge = normalizeNotificationItem;

  const shopViewCartOrchestrationController = createShopViewCartOrchestrationController({
    state: shop.state,
    getMenuItemImagesFn: shop.getMenuItemImages,
    resolveMenuItemHeroFn: shop.resolveMenuItemHero,
    getOptimizedImageUrlFn: shop.getOptimizedImageUrl,
    isPlaceholderUrlFn: shop.isPlaceholderUrl,
    placeholderImage: shop.placeholderImage,
    getFirebaseStorageUrlFn: shop.getFirebaseStorageUrl,
    isDirectImageUrlFn: shop.isDirectImageUrl,
    formatPriceFn: shop.formatPrice,
    escapeHtmlFn: shop.escapeHtml,
    getMenuItemObjectPositionFn: shop.getMenuItemObjectPosition,
    iconFn: shop.icon,
    loadFavoriteMenuItemsFn: shop.loadFavoriteMenuItems,
    createEmptyFavoriteMenuItemsStateFn: shop.createEmptyFavoriteMenuItemsState,
    getShopCartProfileContextCoreFn: shop.getShopCartProfileContextCore,
    getRestaurantMetaByIdFn: shop.getRestaurantMetaById,
    getShopCartTotalCoreFn: shop.getShopCartTotalCore,
    parsePriceValueFn: shop.parsePriceValue,
    canAddToShopCartFn: shop.canAddToShopCart,
    normalizeShopCartStateFn: shop.normalizeShopCartState,
    buildShopVariantKeyFn: shop.buildShopVariantKey,
    clampCropPercentFn: shop.clampCropPercent,
    createEmptyShopCartFn: shop.createEmptyShopCart,
    saveShopCartToStorageFn: shop.saveShopCartToStorage,
    renderFn: shop.render,
    confirmFn: shop.confirm
  });

  const feedViewOrchestrationController = createFeedViewOrchestrationController({
    state: feed.state,
    toDateSafeFn: feed.toDateSafe,
    getStoriesRowSignatureFn: () => feed.getStoriesRowSignature(),
    setStoriesRowSignatureFn: (next) => {
      feed.setStoriesRowSignature(next);
    },
    FAST_MODE: feed.fastMode,
    buildStoriesFromFeedFn: feed.buildStoriesFromFeed,
    updateStoryLogoNodesFn: feed.updateStoryLogoNodes,
    updateStoryMetaNodesFn: feed.updateStoryMetaNodes,
    updateFeedLogoNodesFn: feed.updateFeedLogoNodes,
    updatePostCountNodesFn: feed.updatePostCountNodes,
    ensureFeedRestaurantMetaListenersFn: feed.ensureFeedRestaurantMetaListeners,
    preloadFeedHeroImagesFn: feed.preloadFeedHeroImages,
    buildStoriesRowSignatureFn: feed.buildStoriesRowSignature,
    documentObj: feed.documentObj,
    windowObj: feed.windowObj,
    isLocalBusinessProfileFn: feed.isLocalBusinessProfile,
    iconFn: feed.icon,
    escapeHtmlFn: feed.escapeHtml,
    buildUrlFn: feed.buildUrl,
    buildStoryViewerUrlFn: (restaurantId = "") => (
      typeof feed.buildStoryViewerUrl === "function"
        ? feed.buildStoryViewerUrl(restaurantId)
        : feed.buildUrl("apps/menyra-social/index.html", { r: restaurantId, tab: "profile" })
    ),
    resolveRestaurantLogoFn: feed.resolveRestaurantLogo,
    resolveStoryRenderIdentityFn: feed.resolveStoryRenderIdentity,
    getOptimizedImageUrlFn: feed.getOptimizedImageUrl,
    getVerifiedMapLocationFn: feed.getVerifiedMapLocation,
    setVerifiedMapLocationFn: feed.setVerifiedMapLocation,
    buildUploadStateForIntentFn: (intent = "", currentUpload = {}) => (
      typeof feed.buildUploadStateForIntent === "function"
        ? feed.buildUploadStateForIntent(intent, currentUpload)
        : currentUpload
    ),
    setStateFn: feed.setState,
    openGuestAuthPromptFn: feed.openGuestAuthPrompt,
    openProfileViewFromBusinessFn: (input, options = {}) => openProfileViewFromBusiness(input, options),
    openPostModalFn: async (post) => openPostModalBridge(post),
    togglePostLikeFn: async (postId) => overlay.togglePostLike(postId),
    setTimeoutFn: (fn, ms) => setTimeout(fn, ms)
  });

  let discoveryRuntimeController = null;
  let discoveryRuntimeControllerPromise = null;

  const createDiscoveryRuntimeControllerAsync = async () => {
    const module = await import("../discovery/discovery-runtime-controller.js");
    const createDiscoveryRuntimeController = module?.createDiscoveryRuntimeController;
    if (typeof createDiscoveryRuntimeController !== "function") {
      throw new Error("createDiscoveryRuntimeController unavailable");
    }
    return createDiscoveryRuntimeController({
      state: discovery.state,
      brandUi: discovery.brandUi,
      documentObj: discovery.documentObj,
      windowObj: discovery.windowObj,
      navigatorObj: discovery.navigatorObj,
      LEAFLET_JS_URL: discovery.leafletJsUrl,
      LEAFLET_CSS_URL: discovery.leafletCssUrl,
      searchLimits: discovery.searchLimits,
      placeholderImage: discovery.placeholderImage,
      getGeoFn: discovery.getGeo,
      normalizeLeadLocationsFn: discovery.normalizeLeadLocations,
      resolveCoordsFromEntityFn: discovery.resolveCoordsFromEntity,
      normalizeCoordPairFn: discovery.normalizeCoordPair,
      preferStableCoordsFn: discovery.preferStableCoords,
      isPlaceholderUrlFn: discovery.isPlaceholderUrl,
      escapeHtmlFn: discovery.escapeHtml,
      isPublicBusinessRecordFn: discovery.isPublicBusinessRecord,
      normalizeRestaurantTypeFn: discovery.normalizeRestaurantType,
      openProfileViewFromBusinessFn: (input, options = {}) => openProfileViewFromBusiness(input, options),
      renderFn: discovery.render,
      getSelfAvatarUrlFn: discovery.getSelfAvatarUrl,
      isCeoUserFn: discovery.isCeoUser,
      getCeoGpsOverrideFn: discovery.getCeoGpsOverride,
      getVerifiedMapLocationFn: discovery.getVerifiedMapLocation,
      alertFn: discovery.alert,
      iconFn: discovery.icon,
      getOptimizedImageUrlFn: discovery.getOptimizedImageUrl,
      resolveRestaurantLogoFn: discovery.resolveRestaurantLogo,
      normalizeSearchKeyFn: discovery.normalizeSearchKey,
      normalizeSearchQueryFn: discovery.normalizeSearchQuery,
      scoreSearchMatchFn: discovery.scoreSearchMatch,
      sanitizeDisplayNameFn: discovery.sanitizeDisplayName,
      normalizeHandleFn: discovery.normalizeHandle,
      resolveSearchUserAvatarDisplayFn: discovery.resolveSearchUserAvatarDisplay,
      isForceHiddenBusinessEntityFn: discovery.isForceHiddenBusinessEntity,
      isForceHiddenHandleFn: discovery.isForceHiddenHandle,
      isForceHiddenEmailFn: discovery.isForceHiddenEmail,
      isGuestSessionFn: discovery.isGuestSession,
      escapeSelectorFn: discovery.escapeSelector,
      collectionFn: discovery.collection,
      queryFn: discovery.query,
      orderByFn: discovery.orderBy,
      startAtFn: discovery.startAt,
      endAtFn: discovery.endAt,
      limitFn: discovery.limit,
      getDocsFn: discovery.getDocs,
      db: discovery.db,
      getLastRenderModeFn: discovery.getLastRenderMode
    });
  };

  const ensureDiscoveryRuntimeController = async () => {
    if (discoveryRuntimeController) return discoveryRuntimeController;
    if (discoveryRuntimeControllerPromise) return discoveryRuntimeControllerPromise;
    discoveryRuntimeControllerPromise = createDiscoveryRuntimeControllerAsync()
      .then((controller) => {
        discoveryRuntimeController = controller;
        discovery.render?.();
        return controller;
      })
      .catch((err) => {
        discoveryRuntimeControllerPromise = null;
        throw err;
      });
    return discoveryRuntimeControllerPromise;
  };

  const queueDiscoveryRuntimeControllerLoad = () => {
    void ensureDiscoveryRuntimeController().catch(() => null);
  };

  const renderDeferredDiscoveryView = (mode = "search") => {
    queueDiscoveryRuntimeControllerLoad();
    if (mode === "map") {
      return `
        <div class="p-5 pb-8 h-full flex flex-col relative animate-in fade-in duration-500">
          <div class="mb-4 px-2 flex justify-between items-end">
            <div>
              <h2 class="text-2xl font-black italic uppercase tracking-tighter text-slate-900">Karte</h2>
              <p class="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1 italic">Karte wird vorbereitet</p>
            </div>
          </div>
          <div class="relative flex-1 bg-slate-200 rounded-[2.5rem] overflow-hidden border border-slate-200/50 min-h-[500px]">
            <div class="absolute inset-0 z-10 bg-slate-200 flex items-center justify-center text-slate-500 text-xs font-black uppercase tracking-widest">
              Karte wird geladen ...
            </div>
          </div>
        </div>
      `;
    }
    return `
      <div id="searchView" class="p-6 animate-in slide-in-from-right-10 duration-500 h-full">
        <div class="mb-6 px-1">
          <p class="text-[9px] font-black text-indigo-600 uppercase tracking-widest">Entdecken</p>
          <h2 class="text-2xl font-black italic uppercase tracking-tighter">Suche</h2>
        </div>
        <div class="relative mb-5">
          <input type="text" value="${String(discovery.state?.search?.query || "")}" placeholder="Suche wird vorbereitet ..." class="w-full h-14 rounded-[2rem] border border-slate-100 bg-white px-5 pr-12 text-sm font-semibold outline-none shadow-sm" readonly />
        </div>
        <div class="rounded-[2rem] border border-slate-100 bg-white p-5 text-[11px] font-bold uppercase tracking-widest text-slate-400">
          Suche wird geladen ...
        </div>
      </div>
    `;
  };

  const discoveryBridge = {
    buildRestaurantLocations: (rest, idx) => buildRestaurantLocationsFallback(rest, idx),
    ensureLeafletLoaded: async (...args) => {
      const controller = await ensureDiscoveryRuntimeController();
      return await controller.ensureLeafletLoaded(...args);
    },
    cleanupLeaflet: (...args) => discoveryRuntimeController?.cleanupLeaflet?.(...args),
    updateMapSheet: (...args) => discoveryRuntimeController?.updateMapSheet?.(...args) || false,
    initLeafletIfNeeded: (...args) => {
      if (!discoveryRuntimeController) {
        queueDiscoveryRuntimeControllerLoad();
        return false;
      }
      return discoveryRuntimeController.initLeafletIfNeeded(...args);
    },
    mapLocate: (...args) => {
      queueDiscoveryRuntimeControllerLoad();
      if (!discoveryRuntimeController) return false;
      return discoveryRuntimeController.mapLocate(...args);
    },
    renderMapView: (...args) => {
      if (!discoveryRuntimeController) return renderDeferredDiscoveryView("map");
      return discoveryRuntimeController.renderMapView(...args);
    },
    buildLocalBusinessResults: (...args) => {
      if (!discoveryRuntimeController) {
        queueDiscoveryRuntimeControllerLoad();
        return [];
      }
      return discoveryRuntimeController.buildLocalBusinessResults(...args);
    },
    handleSearchInput: (...args) => {
      const [value] = args;
      if (discovery.state?.search) {
        discovery.state.search.query = String(value || "");
      }
      queueDiscoveryRuntimeControllerLoad();
      if (!discoveryRuntimeController) return;
      return discoveryRuntimeController.handleSearchInput(...args);
    },
    renderSearchView: (...args) => {
      if (!discoveryRuntimeController) return renderDeferredDiscoveryView("search");
      return discoveryRuntimeController.renderSearchView(...args);
    },
    refreshSearchView: (...args) => {
      if (!discoveryRuntimeController) {
        queueDiscoveryRuntimeControllerLoad();
        return false;
      }
      return discoveryRuntimeController.refreshSearchView(...args);
    }
  };

  const overlayOrchestrationController = createOverlayOrchestrationController({
    state: overlay.state,
    getDocumentObjFn: () => overlay.getDocumentObj(),
    getWindowObjFn: () => overlay.getWindowObj(),
    getOverlayCacheFn: () => overlay.getOverlayCache(),
    isModalEscapeBoundFn: () => overlay.isModalEscapeBound(),
    setModalEscapeBoundFn: (value) => {
      overlay.setModalEscapeBound(value);
    },
    isMenuDetailCloseBoundFn: () => overlay.isMenuDetailCloseBound(),
    setMenuDetailCloseBoundFn: (next) => {
      overlay.setMenuDetailCloseBound(next);
    },
    getLastMenuOpenGestureKeyFn: () => overlay.getLastMenuOpenGestureKey(),
    setLastMenuOpenGestureKeyFn: (next) => {
      overlay.setLastMenuOpenGestureKey(next);
    },
    getLastMenuOpenGestureAtFn: () => overlay.getLastMenuOpenGestureAt(),
    setLastMenuOpenGestureAtFn: (next) => {
      overlay.setLastMenuOpenGestureAt(next);
    },
    setPendingCommentHighlightFn: (value) => {
      overlay.setPendingCommentHighlight(value);
    },
    openGuestAuthPromptFn: overlay.openGuestAuthPrompt,
    normalizeChatOpenProfileCoreFn: overlay.normalizeChatOpenProfileCore,
    normalizeHandleFn: overlay.normalizeHandle,
    upsertChatThreadFn: overlay.upsertChatThread,
    markChatThreadAsReadFn: overlay.markChatThreadAsRead,
    buildChatModalStateOnOpenCoreFn: overlay.buildChatModalStateOnOpenCore,
    getChatThreadIdFn: overlay.getChatThreadId,
    syncChatThreadSummaryFn: overlay.syncChatThreadSummary,
    syncRemoteChatReadStateFn: overlay.syncRemoteChatReadState,
    startActiveChatMessagesListenerFn: overlay.startActiveChatMessagesListener,
    stopActiveChatMessagesListenerFn: overlay.stopActiveChatMessagesListener,
    buildClosedChatModalStateCoreFn: overlay.buildClosedChatModalStateCore,
    renderFn: overlay.render,
    ensurePostMetaFn: overlay.ensurePostMeta,
    attachPostMetaListenersFn: overlay.attachPostMetaListeners,
    loadPostMetaFromFirebaseFn: overlay.loadPostMetaFromFirebase,
    updatePostModalMetaFn: overlay.updatePostModalMeta,
    stopPostMetaListenersFn: overlay.stopPostMetaListeners,
    getFocusItemCropFn: overlay.getFocusItemCrop,
    isCeoUserFn: overlay.isCeoUser,
    createLeadDraftStateFn: overlay.createLeadDraftState,
    resetLeadDraftFn: overlay.resetLeadDraft,
    getMenuItemImagesFn: overlay.getMenuItemImages,
    getMenuItemCropFn: overlay.getMenuItemCrop,
    createEmptyMenuDetailStateFn: overlay.createEmptyMenuDetailState,
    attachMenuItemMetaListenersFn: overlay.attachMenuItemMetaListeners,
    loadMenuItemMetaFromFirebaseFn: overlay.loadMenuItemMetaFromFirebase,
    updateMenuDetailMetaFn: overlay.updateMenuDetailMeta,
    stopMenuItemMetaListenersFn: overlay.stopMenuItemMetaListeners,
    ensureOverlayRootCoreFn: overlay.ensureOverlayRootCore,
    ensureModalEscapeHandlerCoreFn: overlay.ensureModalEscapeHandlerCore,
    syncModalOpenUiStateCoreFn: overlay.syncModalOpenUiStateCore,
    renderOverlaysCoreFn: overlay.renderOverlaysCore,
    renderProfileModalFn: overlay.renderProfileModal,
    renderChatModalFn: overlay.renderChatModal,
    renderPostModalFn: overlay.renderPostModal,
    renderLikesModalFn: overlay.renderLikesModal,
    renderMenuItemModalFn: overlay.renderMenuItemModal,
    renderMenuDetailModalFn: overlay.renderMenuDetailModal,
    renderFocusModalFn: overlay.renderFocusModal,
    renderLeadModalFn: overlay.renderLeadModal,
    renderCustomerModalFn: overlay.renderCustomerModal,
    bindOverlayEventsCoreFn: overlay.bindOverlayEventsCore,
    bindProfileOverlayEventsCoreFn: overlay.bindProfileOverlayEventsCore,
    bindChatOverlayEventsCoreFn: overlay.bindChatOverlayEventsCore,
    bindPostOverlayEventsCoreFn: overlay.bindPostOverlayEventsCore,
    bindLikesOverlayEventsCoreFn: overlay.bindLikesOverlayEventsCore,
    bindMenuOverlayEventsCoreFn: overlay.bindMenuOverlayEventsCore,
    bindMenuDetailOverlayEventsCoreFn: overlay.bindMenuDetailOverlayEventsCore,
    bindFocusOverlayEventsCoreFn: overlay.bindFocusOverlayEventsCore,
    bindLeadOverlayEventsCoreFn: overlay.bindLeadOverlayEventsCore,
    bindCustomerOverlayEventsCoreFn: overlay.bindCustomerOverlayEventsCore,
    toggleFollowFn: overlay.toggleFollow,
    sendChatMessageFn: overlay.sendChatMessage,
    scrollChatMessagesToBottomFn: overlay.scrollChatMessagesToBottom,
    queueMicrotaskFn: (fn) => overlay.queueMicrotask(fn),
    togglePostLikeFn: overlay.togglePostLike,
    loadPostLikesForModalFn: overlay.loadPostLikesForModal,
    addCommentFn: overlay.addComment,
    toggleCommentLikeFn: overlay.toggleCommentLike,
    saveMenuItemFromModalFn: overlay.saveMenuItemFromModal,
    syncMenuModalCropPreviewFn: overlay.syncMenuModalCropPreview,
    clampCropPercentFn: overlay.clampCropPercent,
    getMenuDetailCatalogProfileFn: overlay.getMenuDetailCatalogProfile,
    canAddToShopCartFn: overlay.canAddToShopCart,
    addMenuItemToShopCartFn: (item, profile, options = {}) => shopViewCartOrchestrationController.addMenuItemToShopCart(item, profile, options),
    showPublicProfileFn: overlay.showPublicProfile,
    setStateFn: overlay.setState,
    toggleMenuItemLikeFn: overlay.toggleMenuItemLike,
    autosizeTextareaFn: overlay.autosizeTextarea,
    addMenuItemCommentFn: overlay.addMenuItemComment,
    applyCommentAvatarCacheFn: overlay.applyCommentAvatarCache,
    saveFocusItemFromModalFn: overlay.saveFocusItemFromModal,
    syncFocusModalCropPreviewFn: overlay.syncFocusModalCropPreview,
    saveLeadFromModalFn: overlay.saveLeadFromModal,
    convertLeadToCustomerFn: overlay.convertLeadToCustomer,
    addLeadModalLocationRowFn: overlay.addLeadModalLocationRow,
    removeLeadModalLocationRowFn: overlay.removeLeadModalLocationRow,
    syncLeadModalDraftFromFormFn: overlay.syncLeadModalDraftFromForm,
    openLocationPickerFn: overlay.openLocationPicker,
    normalizeLeadLocationsFn: overlay.normalizeLeadLocations,
    createLeadLocationFn: overlay.createLeadLocation,
    parseCoordsFromAddressInputFn: overlay.parseCoordsFromAddressInput,
    getLeadPlusCodeReferenceFn: overlay.getLeadPlusCodeReference,
    hasLeadLocationCoordsFn: overlay.hasLeadLocationCoords,
    getPrimaryLeadLocationFn: overlay.getPrimaryLeadLocation,
    refineLeadLocationAddressIndexFn: overlay.refineLeadLocationAddressIndex,
    saveCustomerFromModalFn: overlay.saveCustomerFromModal,
    bindImageFallbacksFn: overlay.bindImageFallbacks,
    placeholderImage: overlay.placeholderImage
  });

  const bridgeApi = {
    openChatWithProfile: overlayOrchestrationController.openChatWithProfile,
    closeChatModal: overlayOrchestrationController.closeChatModal,
    closeProfileModal: overlayOrchestrationController.closeProfileModal,
    closeLikesModal: overlayOrchestrationController.closeLikesModal,
    closeActiveModal: overlayOrchestrationController.closeActiveModal,
    isAnyModalOpen: overlayOrchestrationController.isAnyModalOpen,
    openPostModal: overlayOrchestrationController.openPostModal,
    closePostModal: overlayOrchestrationController.closePostModal,
    openMenuDetailFromTrigger: overlayOrchestrationController.openMenuDetailFromTrigger,
    triggerMenuDetailOpenFromGesture: overlayOrchestrationController.triggerMenuDetailOpenFromGesture,
    ensureOverlayRoot: overlayOrchestrationController.ensureOverlayRoot,
    ensureModalEscapeHandler: overlayOrchestrationController.ensureModalEscapeHandler,
    syncModalOpenUiState: overlayOrchestrationController.syncModalOpenUiState,
    renderOverlays: overlayOrchestrationController.renderOverlays,
    bindModalDismiss: overlayOrchestrationController.bindModalDismiss,
    bindOverlayEvents: overlayOrchestrationController.bindOverlayEvents,
    openFocusModal: overlayOrchestrationController.openFocusModal,
    closeFocusModal: overlayOrchestrationController.closeFocusModal,
    openLeadModal: overlayOrchestrationController.openLeadModal,
    closeLeadModal: overlayOrchestrationController.closeLeadModal,
    openCustomerModal: overlayOrchestrationController.openCustomerModal,
    closeCustomerModal: overlayOrchestrationController.closeCustomerModal,
    openMenuModal: overlayOrchestrationController.openMenuModal,
    closeMenuModal: overlayOrchestrationController.closeMenuModal,
    openMenuDetail: overlayOrchestrationController.openMenuDetail,
    closeMenuDetail: overlayOrchestrationController.closeMenuDetail,
    setMenuDetailIndex: overlayOrchestrationController.setMenuDetailIndex,
    setMenuDetailVariant: overlayOrchestrationController.setMenuDetailVariant,
    renderHomeView: feedViewOrchestrationController.renderHomeView,
    renderFeedView: feedViewOrchestrationController.renderFeedView,
    renderStoryItem: feedViewOrchestrationController.renderStoryItem,
    renderStoriesRow: feedViewOrchestrationController.renderStoriesRow,
    renderFeedItem: feedViewOrchestrationController.renderFeedItem,
    renderFeedList: feedViewOrchestrationController.renderFeedList,
    patchFeedList: feedViewOrchestrationController.patchFeedList,
    patchStoriesRow: feedViewOrchestrationController.patchStoriesRow,
    updateFeedDom: feedViewOrchestrationController.updateFeedDom,
    bindFeedDelegation: feedViewOrchestrationController.bindFeedDelegation,
    renderShopProductList: shopViewCartOrchestrationController.renderShopProductList,
    renderProfileShopFavoritesView: shopViewCartOrchestrationController.renderProfileShopFavoritesView,
    renderProfileShopCartView: shopViewCartOrchestrationController.renderProfileShopCartView,
    clearShopCart: shopViewCartOrchestrationController.clearShopCart,
    getCurrentShopProfile: shopViewCartOrchestrationController.getCurrentShopProfile,
    getShopCartProfileContext: shopViewCartOrchestrationController.getShopCartProfileContext,
    addMenuItemToShopCart: shopViewCartOrchestrationController.addMenuItemToShopCart,
    updateShopCartQuantity: shopViewCartOrchestrationController.updateShopCartQuantity,
    updateShopCartItemComment: shopViewCartOrchestrationController.updateShopCartItemComment,
    openShopCheckout: shopViewCartOrchestrationController.openShopCheckout,
    updateShopCheckoutField: shopViewCartOrchestrationController.updateShopCheckoutField,
    getShopCartTotal: shopViewCartOrchestrationController.getShopCartTotal,
    buildRestaurantLocations: discoveryBridge.buildRestaurantLocations,
    ensureLeafletLoaded: discoveryBridge.ensureLeafletLoaded,
    cleanupLeaflet: discoveryBridge.cleanupLeaflet,
    updateMapSheet: discoveryBridge.updateMapSheet,
    initLeafletIfNeeded: discoveryBridge.initLeafletIfNeeded,
    mapLocate: discoveryBridge.mapLocate,
    renderMapView: discoveryBridge.renderMapView,
    buildLocalBusinessResults: discoveryBridge.buildLocalBusinessResults,
    handleSearchInput: discoveryBridge.handleSearchInput,
    renderSearchView: discoveryBridge.renderSearchView,
    refreshSearchView: discoveryBridge.refreshSearchView
  };

  openPostModalBridge = bridgeApi.openPostModal;
  openChatWithProfileBridge = bridgeApi.openChatWithProfile;

  return {
    controllers: {
      profileOpenFlowController,
      deeplinkFlowController,
      notificationsRuntimeController: notifications.runtimeController || notifications,
      shopViewCartOrchestrationController,
      feedViewOrchestrationController,
      discoveryRuntimeController,
      overlayOrchestrationController
    },
    profileApi: {
      isOwnBusinessTarget,
      openOwnBusinessProfile,
      openProfileViewFromBusiness,
      openProfileFromUser
    },
    deeplinkApi: {
      clearNotificationQueryParams,
      clearPostQueryParams,
      clearChatQueryParams,
      resolveRouteStateFromTargetUrl,
      applyPendingRouteStateFromTargetUrl,
      maybeOpenNotificationFromQuery,
      maybeOpenPostFromQuery,
      maybeOpenChatFromQuery,
      handlePushOpenTargetMessage,
      bindPushOpenTargetMessageHandler,
      maybeOpenProfileFromQuery
    },
    notificationsApi: {
      normalizeNotificationItem,
      mapNotificationSnapshot,
      shouldSurfaceNativePushNow,
      startNotificationsListener,
      syncNotificationsPushRuntime,
      loadNotificationsFromFirebase
    },
    bridgeApi
  };
}
