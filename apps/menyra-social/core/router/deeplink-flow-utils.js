import { normalizeTableNumberCore } from "../menu/table-qr-utils.js";

const NOTIFICATION_QUERY_KEYS = ["notif", "notification", "nid"];
const POST_QUERY_KEYS = ["post", "postId"];
const CHAT_QUERY_KEYS = ["chat", "thread"];

export function createDeeplinkFlowControllerCore({
  state,
  getPendingState,
  setPendingState,
  clearQueryParamsFromCurrentUrl,
  resolveRouteStateFromTargetUrl,
  applyPendingRouteState,
  normalizePendingNotificationId,
  findNotificationById,
  fetchNotificationById,
  prependNotificationById,
  saveNotifications,
  openNotificationTarget,
  normalizePendingPostId,
  findPostInLocalSources,
  fetchPostForNotification,
  openPostModal,
  normalizePendingChatUid,
  isSelfPendingChatTarget,
  isChatThreadAlreadyOpen,
  getChatThreadById,
  buildChatRouteTargetProfile,
  openChatWithProfile,
  normalizePendingProfileRestaurantId,
  isPendingProfileAlreadyOpen,
  normalizeProfileTopTabFromRoute,
  openProfileViewFromBusiness,
  openProfileFromUser,
  parsePushOpenTargetPayload,
  shouldHandlePushOpenTarget,
  applyPendingInitialRouteState,
  render,
  isPushOpenTargetMessage,
  getNavigator,
  isPushOpenMessageBound,
  markPushOpenMessageBound
} = {}) {
  const readPendingState = typeof getPendingState === "function"
    ? getPendingState
    : (() => ({}));
  const writePendingState = typeof setPendingState === "function"
    ? setPendingState
    : (() => {});
  const clearQueryParams = typeof clearQueryParamsFromCurrentUrl === "function"
    ? clearQueryParamsFromCurrentUrl
    : (() => {});
  const resolveRouteState = typeof resolveRouteStateFromTargetUrl === "function"
    ? resolveRouteStateFromTargetUrl
    : (() => null);
  const applyPendingRouteStateFn = typeof applyPendingRouteState === "function"
    ? applyPendingRouteState
    : (() => null);
  const normalizeNotificationId = typeof normalizePendingNotificationId === "function"
    ? normalizePendingNotificationId
    : ((value) => String(value || "").trim());
  const findNotification = typeof findNotificationById === "function"
    ? findNotificationById
    : (() => null);
  const fetchNotification = typeof fetchNotificationById === "function"
    ? fetchNotificationById
    : (async () => null);
  const prependNotification = typeof prependNotificationById === "function"
    ? prependNotificationById
    : ((value) => value);
  const persistNotifications = typeof saveNotifications === "function"
    ? saveNotifications
    : (() => {});
  const openNotification = typeof openNotificationTarget === "function"
    ? openNotificationTarget
    : (async () => false);
  const normalizePostId = typeof normalizePendingPostId === "function"
    ? normalizePendingPostId
    : ((value) => String(value || "").trim());
  const findPost = typeof findPostInLocalSources === "function"
    ? findPostInLocalSources
    : (() => null);
  const fetchPost = typeof fetchPostForNotification === "function"
    ? fetchPostForNotification
    : (async () => null);
  const openPost = typeof openPostModal === "function"
    ? openPostModal
    : (async () => false);
  const normalizeChatUid = typeof normalizePendingChatUid === "function"
    ? normalizePendingChatUid
    : ((value) => String(value || "").trim());
  const isSelfChatTarget = typeof isSelfPendingChatTarget === "function"
    ? isSelfPendingChatTarget
    : (() => false);
  const isThreadAlreadyOpen = typeof isChatThreadAlreadyOpen === "function"
    ? isChatThreadAlreadyOpen
    : (() => false);
  const getThreadById = typeof getChatThreadById === "function"
    ? getChatThreadById
    : (() => null);
  const buildChatTarget = typeof buildChatRouteTargetProfile === "function"
    ? buildChatRouteTargetProfile
    : ((value) => value);
  const openChat = typeof openChatWithProfile === "function"
    ? openChatWithProfile
    : (() => false);
  const normalizeProfileRestaurantId = typeof normalizePendingProfileRestaurantId === "function"
    ? normalizePendingProfileRestaurantId
    : ((value) => String(value || "").trim());
  const isProfileAlreadyOpen = typeof isPendingProfileAlreadyOpen === "function"
    ? isPendingProfileAlreadyOpen
    : (() => false);
  const normalizeProfileTopTab = typeof normalizeProfileTopTabFromRoute === "function"
    ? normalizeProfileTopTabFromRoute
    : ((value) => String(value || "").trim());
  const openBusinessProfile = typeof openProfileViewFromBusiness === "function"
    ? openProfileViewFromBusiness
    : (() => {});
  const openUserProfile = typeof openProfileFromUser === "function"
    ? openProfileFromUser
    : (() => {});
  const parsePushPayload = typeof parsePushOpenTargetPayload === "function"
    ? parsePushOpenTargetPayload
    : (() => ({ notificationId: "", targetUrl: "" }));
  const shouldHandlePush = typeof shouldHandlePushOpenTarget === "function"
    ? shouldHandlePushOpenTarget
    : (() => false);
  const applyInitialRouteState = typeof applyPendingInitialRouteState === "function"
    ? applyPendingInitialRouteState
    : (() => {});
  const renderApp = typeof render === "function"
    ? render
    : (() => {});
  const isPushMessage = typeof isPushOpenTargetMessage === "function"
    ? isPushOpenTargetMessage
    : (() => false);
  const readNavigator = typeof getNavigator === "function"
    ? getNavigator
    : (() => null);
  const isPushMessageBound = typeof isPushOpenMessageBound === "function"
    ? isPushOpenMessageBound
    : (() => false);
  const markPushMessageBound = typeof markPushOpenMessageBound === "function"
    ? markPushOpenMessageBound
    : (() => {});

  const patchPendingState = (patch = {}) => {
    if (!patch || typeof patch !== "object") return;
    writePendingState(patch);
  };

  const clearNotificationQueryParams = () => {
    clearQueryParams({ keys: NOTIFICATION_QUERY_KEYS });
  };

  const clearPostQueryParams = () => {
    clearQueryParams({ keys: POST_QUERY_KEYS });
  };

  const clearChatQueryParams = () => {
    clearQueryParams({ keys: CHAT_QUERY_KEYS });
  };

  const resolveRouteStateFromTargetUrlFlow = (rawUrl = "") => resolveRouteState(rawUrl);

  const applyPendingRouteStateFromTargetUrl = (rawUrl = "") => {
    const routeState = resolveRouteStateFromTargetUrlFlow(rawUrl);
    const current = readPendingState();
    const applied = applyPendingRouteStateFn(current, routeState);
    if (!applied?.changed || !applied?.next) return false;
    patchPendingState(applied.next);
    return true;
  };

  const maybeOpenNotificationFromQuery = async () => {
    const pending = readPendingState();
    if (pending.pendingNotificationHandled) return false;
    if (!pending.pendingNotificationId) return false;
    if (!state?.user?.uid) return false;

    const safeNotificationId = normalizeNotificationId(pending.pendingNotificationId);
    if (!safeNotificationId) return false;

    patchPendingState({
      pendingNotificationHandled: true,
      pendingNotificationId: ""
    });
    clearNotificationQueryParams();

    let notificationItem = findNotification({
      notifications: state.notifications || [],
      notificationId: safeNotificationId
    });
    if (!notificationItem) {
      try {
        notificationItem = await fetchNotification(safeNotificationId, state.user.uid);
      } catch (err) {
        console.error(err);
      }
    }
    if (!notificationItem) return false;

    state.notifications = prependNotification({
      notifications: state.notifications || [],
      notificationItem,
      notificationId: safeNotificationId
    });
    persistNotifications(state.notifications);
    await openNotification(safeNotificationId);
    return true;
  };

  const maybeOpenPostFromQuery = async () => {
    const pending = readPendingState();
    if (pending.pendingPostHandled) return false;
    if (!pending.pendingPostId) return false;
    if (!state?.user?.uid) return false;

    const safePostId = normalizePostId(pending.pendingPostId);
    if (!safePostId) return false;

    patchPendingState({
      pendingPostHandled: true,
      pendingPostId: ""
    });
    clearPostQueryParams();

    let post = findPost({ postId: safePostId });
    if (!post) {
      post = await fetchPost({ postId: safePostId });
    }
    if (!post) return false;

    state.activeTab = "feed";
    await openPost(post);
    return true;
  };

  const maybeOpenChatFromQuery = () => {
    const pending = readPendingState();
    if (pending.pendingChatHandled) return false;
    if (!pending.pendingChatUid) return false;
    if (!state?.user?.uid) return false;

    const safeChatUid = normalizeChatUid(pending.pendingChatUid);
    if (!safeChatUid) return false;
    if (isSelfChatTarget({
      chatUid: safeChatUid,
      currentUid: state.user.uid
    })) {
      patchPendingState({
        pendingChatHandled: true,
        pendingChatUid: ""
      });
      clearChatQueryParams();
      return false;
    }

    patchPendingState({
      pendingChatHandled: true,
      pendingChatUid: ""
    });
    clearChatQueryParams();

    if (isThreadAlreadyOpen({ targetUid: safeChatUid })) {
      return true;
    }

    const thread = getThreadById(safeChatUid);
    openChat(buildChatTarget({ thread, targetUid: safeChatUid }));
    return true;
  };

  const maybeOpenProfileFromQuery = () => {
    const pending = readPendingState();
    if (pending.pendingProfileHandled) return false;
    const pendingUserRouteId = String(pending.pendingUserRouteId || "").replace(/^@/, "").trim();
    if (!pending.pendingProfileRestaurantId && !pendingUserRouteId) return false;

    if (pendingUserRouteId) {
      const liveProfile = state?.profileView?.profile && typeof state.profileView.profile === "object"
        ? state.profileView.profile
        : null;
      const liveRestaurantId = String(liveProfile?.restaurantId || "").trim();
      const liveTruthState = String(liveProfile?.truthState || "").trim().toLowerCase();
      const liveUid = String(liveProfile?.uid || "").trim();
      const liveHandle = String(liveProfile?.handle || liveProfile?.name || "").replace(/^@/, "").trim().toLowerCase();
      const targetRouteId = pendingUserRouteId.toLowerCase();
      const isUserAlreadyOpen = !!liveProfile
        && !liveRestaurantId
        && liveTruthState !== "route-pending-loading"
        && liveTruthState !== "loading"
        && liveTruthState !== "pending"
        && (
          (liveUid && liveUid === pendingUserRouteId)
          || (liveHandle && liveHandle === targetRouteId)
        );
      if (isUserAlreadyOpen) {
        patchPendingState({
          pendingProfileHandled: true,
          pendingUserRouteId: "",
          pendingUserContentTab: ""
        });
        return true;
      }
      const nextUserContentTab = String(pending.pendingUserContentTab || "").trim().toLowerCase() === "media"
        ? "media"
        : "posts";
      patchPendingState({
        pendingProfileHandled: true,
        pendingProfileRestaurantId: "",
        pendingProfileTopTab: "",
        pendingProfileAccessSource: "",
        pendingProfileTableNumber: 0,
        pendingUserRouteId: "",
        pendingUserContentTab: ""
      });
      openUserProfile(
        { routeId: pendingUserRouteId },
        {
          showBack: false,
          contentTab: nextUserContentTab,
          directEntry: {
            active: true,
            source: "route",
            owner: "web-direct",
            routeFirst: true,
            webPriority: true,
            topTab: "profile",
            contentTab: nextUserContentTab
          }
        }
      );
      return true;
    }

    const safeRestaurantId = normalizeProfileRestaurantId(pending.pendingProfileRestaurantId);
    const requestedTopTab = normalizeProfileTopTab(pending.pendingProfileTopTab);
    const liveProfileView = state?.profileView && typeof state.profileView === "object"
      ? state.profileView
      : null;
    const liveProfile = liveProfileView?.profile && typeof liveProfileView.profile === "object"
      ? liveProfileView.profile
      : null;
    const liveProfileTopTab = String(state?.profileTopTab || "").trim().toLowerCase();
    const liveSurfaceTopTab = liveProfileTopTab === "menu" ? "menu" : "profile";
    const liveDirectEntry = liveProfileView?.directEntry && typeof liveProfileView.directEntry === "object"
      ? liveProfileView.directEntry
      : null;
    const isPendingRouteSeedContinuation = String(liveDirectEntry?.owner || "").trim().toLowerCase() === "web-direct"
      && liveDirectEntry?.routeFirst === true
      && liveDirectEntry?.active !== false
      && String(liveProfile?.restaurantId || "").trim() === safeRestaurantId;
    const liveBusinessSurfaceMatchesRoute = liveSurfaceTopTab === (requestedTopTab === "menu" ? "menu" : "profile");
    const canShortCircuitBusinessRoute = !isPendingRouteSeedContinuation
      && liveBusinessSurfaceMatchesRoute;
    if (canShortCircuitBusinessRoute && isProfileAlreadyOpen({ pendingProfileRestaurantId: safeRestaurantId })) {
      patchPendingState({
        pendingProfileHandled: true,
        pendingProfileRestaurantId: "",
        pendingProfileTopTab: "",
        pendingProfileAccessSource: "",
        pendingProfileTableNumber: 0,
        pendingUserRouteId: "",
        pendingUserContentTab: ""
      });
      return true;
    }

    const nextTabRaw = pending.pendingProfileTopTab;
    const nextAccessSourceRaw = pending.pendingProfileAccessSource;
    const nextTableNumber = normalizeTableNumberCore(pending.pendingProfileTableNumber || 0);
    patchPendingState({
      pendingProfileHandled: true,
      pendingProfileRestaurantId: "",
      pendingProfileTopTab: "",
      pendingProfileAccessSource: "",
      pendingProfileTableNumber: 0,
      pendingUserRouteId: "",
      pendingUserContentTab: ""
    });
    const nextTab = normalizeProfileTopTab(nextTabRaw);
    const safeAccessSource = String(nextAccessSourceRaw || "").trim().toLowerCase();
    const isQrLikeAccessSource = safeAccessSource === "qr"
      || safeAccessSource === "qrcode"
      || safeAccessSource === "qr-code"
      || safeAccessSource === "menuqr"
      || safeAccessSource === "menu-qr"
      || safeAccessSource === "scanqr"
      || safeAccessSource === "scan-qr";
    const nextAccessSource = nextTab === "menu" && isQrLikeAccessSource
      ? "qr"
      : "";
    const resolvedTableNumber = nextAccessSource === "qr" ? nextTableNumber : 0;
    openBusinessProfile(
      { id: safeRestaurantId },
      {
        showBack: false,
        topTab: nextTab,
        menuAccessSource: nextAccessSource,
        tableNumber: resolvedTableNumber
      }
    );
    return true;
  };

  const handlePushOpenTargetMessage = (payload = {}) => {
    const parsed = parsePushPayload(payload);
    const safeNotificationId = parsed.notificationId;
    const targetUrl = parsed.targetUrl;
    const hasRouteFromUrl = applyPendingRouteStateFromTargetUrl(targetUrl);
    if (safeNotificationId) {
      patchPendingState({
        pendingNotificationHandled: false,
        pendingNotificationId: safeNotificationId
      });
    }
    if (!shouldHandlePush({ notificationId: safeNotificationId, hasRouteFromUrl })) return;
    const prevActiveTab = state.activeTab;
    applyInitialRouteState();
    const tabChangedByRoute = state.activeTab !== prevActiveTab;
    if (!state?.user?.uid) {
      if (tabChangedByRoute) renderApp();
      return;
    }
    void (async () => {
      maybeOpenProfileFromQuery();
      const openedNotification = await maybeOpenNotificationFromQuery();
      if (openedNotification) return;
      const openedPost = await maybeOpenPostFromQuery();
      if (openedPost) return;
      const openedChat = maybeOpenChatFromQuery();
      if (!openedChat && (tabChangedByRoute || hasRouteFromUrl)) {
        renderApp();
      }
    })();
  };

  const bindPushOpenTargetMessageHandler = () => {
    if (isPushMessageBound()) return;
    const navigatorObj = readNavigator();
    if (!navigatorObj || !("serviceWorker" in navigatorObj)) return;
    navigatorObj.serviceWorker.addEventListener("message", (event) => {
      const payload = event?.data || {};
      if (!isPushMessage(payload)) return;
      handlePushOpenTargetMessage(payload);
    });
    markPushMessageBound();
  };

  return {
    clearNotificationQueryParams,
    clearPostQueryParams,
    clearChatQueryParams,
    resolveRouteStateFromTargetUrl: resolveRouteStateFromTargetUrlFlow,
    applyPendingRouteStateFromTargetUrl,
    maybeOpenNotificationFromQuery,
    maybeOpenPostFromQuery,
    maybeOpenChatFromQuery,
    maybeOpenProfileFromQuery,
    handlePushOpenTargetMessage,
    bindPushOpenTargetMessageHandler
  };
}
