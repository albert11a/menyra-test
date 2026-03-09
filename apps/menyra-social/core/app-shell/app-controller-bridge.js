import { createProfileOpenFlowControllerCore } from "../profile/profile-open-flow-utils.js";
import { createDeeplinkFlowControllerCore } from "../router/deeplink-flow-utils.js";
import { createNotificationsRuntimeFlowControllerCore } from "../notifications/notifications-runtime-flow-utils.js";
import { createShopViewCartOrchestrationController } from "../shop/shop-view-cart-orchestration-controller.js";
import { createFeedViewOrchestrationController } from "../feed/feed-view-orchestration-controller.js";
import { createOverlayOrchestrationController } from "../overlays/overlay-orchestration-controller.js";
import { createDiscoveryRuntimeController } from "../discovery/discovery-runtime-controller.js";

export function createAppControllerBridge({
  profile = {},
  deeplink = {},
  notifications = {},
  shop = {},
  feed = {},
  discovery = {},
  overlay = {}
} = {}) {
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
      currentProfileRestaurantId: deeplink.state.profileView?.profile?.restaurantId || ""
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

  const notificationsRuntimeFlowController = createNotificationsRuntimeFlowControllerCore({
    state: notifications.state,
    getNotificationsUnsub: () => notifications.getNotificationsUnsub(),
    setNotificationsUnsub: (nextUnsub) => {
      notifications.setNotificationsUnsub(nextUnsub);
    },
    normalizeNotificationItemFromDoc: (docSnap) => notifications.normalizeNotificationItemCore({
      docSnap,
      formatRelative: notifications.formatRelative,
      toDateSafe: notifications.toDateSafe
    }),
    mapNotificationSnapshotFromSnap: (snap, normalizeNotificationItemFn) => notifications.mapNotificationSnapshotCore({
      snap,
      normalizeNotificationItem: (docSnap) => normalizeNotificationItemFn(docSnap)
    }),
    shouldSurfaceNativePushNowFn: () => notifications.shouldSurfaceNativePushNowCore({
      documentObj: notifications.documentObj,
      activeTab: notifications.state.activeTab
    }),
    buildNotificationsLiveQuery: (ownerUid, liveLimit) => notifications.buildNotificationsLiveQueryCore({
      db: notifications.db,
      ownerUid,
      collection: notifications.collection,
      query: notifications.query,
      orderBy: notifications.orderBy,
      limit: notifications.limit,
      liveLimit
    }),
    readPushSeenIds: (ownerUid) => notifications.readPushSeenIds(ownerUid),
    addNotificationItemsToSeenSet: (items, seenIds) => notifications.addNotificationItemsToSeenSetCore({ items, seenIds }),
    writePushSeenIds: (ids = [], ownerUid = "") => notifications.writePushSeenIds(ids, ownerUid),
    canEmitNativePushAlerts: () => notifications.canEmitNativePushAlerts(),
    collectUnseenUnreadNotificationItemsFromChanges: (changes = [], seenIds = new Set(), normalizeNotificationItemFn) => notifications.collectUnseenUnreadNotificationItemsFromChangesCore({
      changes,
      normalizeNotificationItem: (docSnap) => normalizeNotificationItemFn(docSnap),
      seenIds
    }),
    showNativePushAlert: async (item) => notifications.showNativePushAlert(item),
    handleNotificationsUpdate: (items) => notifications.handleNotificationsUpdate(items),
    subscribeNotifications: (queryRef, onNext, onError) => notifications.onSnapshot(queryRef, onNext, onError),
    buildNotificationsFetchQuery: (ownerUid, fetchLimit) => notifications.buildNotificationsFetchQueryCore({
      db: notifications.db,
      ownerUid,
      collection: notifications.collection,
      query: notifications.query,
      orderBy: notifications.orderBy,
      limit: notifications.limit,
      fetchLimit
    }),
    fetchNotificationsFromQuery: async (queryRef, mapNotificationSnapshotFn) => notifications.fetchNotificationsFromQueryCore({
      queryRef,
      getDocs: notifications.getDocs,
      mapNotificationSnapshot: (snap) => mapNotificationSnapshotFn(snap)
    }),
    saveNotifications: (notificationsList) => notifications.saveNotifications(notificationsList),
    updateNotificationsDom: () => notifications.updateNotificationsDom(),
    render: () => notifications.render(),
    setPushActivationIssue: (message) => notifications.setPushActivationIssue(message),
    clearPushActivationIssue: () => notifications.clearPushActivationIssue(),
    ensureNotificationPermission: async (options = {}) => notifications.ensureNotificationPermission(options),
    syncPushDeviceRegistration: async (options = {}) => notifications.syncPushDeviceRegistration(options),
    getPushActivationIssue: () => notifications.getPushActivationIssue(),
    notificationsLiveLimit: notifications.notificationsLiveLimit,
    fetchLimit: notifications.fetchLimit
  });

  const {
    normalizeNotificationItem,
    mapNotificationSnapshot,
    shouldSurfaceNativePushNow,
    startNotificationsListener,
    syncNotificationsPushRuntime,
    loadNotificationsFromFirebase
  } = notificationsRuntimeFlowController;

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
    resolveRestaurantLogoFn: feed.resolveRestaurantLogo,
    getOptimizedImageUrlFn: feed.getOptimizedImageUrl,
    setStateFn: feed.setState,
    openGuestAuthPromptFn: feed.openGuestAuthPrompt,
    openProfileViewFromBusinessFn: (input, options = {}) => openProfileViewFromBusiness(input, options)
  });

  const discoveryRuntimeController = createDiscoveryRuntimeController({
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
    openShopCheckout: shopViewCartOrchestrationController.openShopCheckout,
    updateShopCheckoutField: shopViewCartOrchestrationController.updateShopCheckoutField,
    getShopCartTotal: shopViewCartOrchestrationController.getShopCartTotal,
    buildRestaurantLocations: discoveryRuntimeController.buildRestaurantLocations,
    ensureLeafletLoaded: discoveryRuntimeController.ensureLeafletLoaded,
    cleanupLeaflet: discoveryRuntimeController.cleanupLeaflet,
    updateMapSheet: discoveryRuntimeController.updateMapSheet,
    initLeafletIfNeeded: discoveryRuntimeController.initLeafletIfNeeded,
    mapLocate: discoveryRuntimeController.mapLocate,
    renderMapView: discoveryRuntimeController.renderMapView,
    buildLocalBusinessResults: discoveryRuntimeController.buildLocalBusinessResults,
    handleSearchInput: discoveryRuntimeController.handleSearchInput,
    renderSearchView: discoveryRuntimeController.renderSearchView,
    refreshSearchView: discoveryRuntimeController.refreshSearchView
  };

  openPostModalBridge = bridgeApi.openPostModal;
  openChatWithProfileBridge = bridgeApi.openChatWithProfile;

  return {
    controllers: {
      profileOpenFlowController,
      deeplinkFlowController,
      notificationsRuntimeFlowController,
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
