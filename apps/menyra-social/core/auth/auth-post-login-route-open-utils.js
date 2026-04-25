import { resolvePendingAuthRouteFlagsCore } from "./auth-bootstrap-flow-utils.js";

function hasPendingProfileRoute(pendingState = null) {
  if (!pendingState || typeof pendingState !== "object") return false;
  return !!(
    String(pendingState.pendingProfileRestaurantId || "").trim()
    || String(pendingState.pendingUserRouteId || "").trim()
  );
}

export async function runPostLoginPendingRouteOpenFlowCore({
  openProfileFromQuery,
  openNotificationFromQuery,
  openPostFromQuery,
  openChatFromQuery,
  renderFallback,
  allowProfileOpen = false
} = {}) {
  const openProfile = typeof openProfileFromQuery === "function"
    ? openProfileFromQuery
    : (() => false);
  const openNotification = typeof openNotificationFromQuery === "function"
    ? openNotificationFromQuery
    : (async () => false);
  const openPost = typeof openPostFromQuery === "function"
    ? openPostFromQuery
    : (async () => false);
  const openChat = typeof openChatFromQuery === "function"
    ? openChatFromQuery
    : (() => false);
  const render = typeof renderFallback === "function"
    ? renderFallback
    : (() => {});

  const openedProfile = allowProfileOpen === true ? !!openProfile() : false;
  const openedNotification = await openNotification();
  const openedPost = await openPost();
  const openedChat = openChat();
  if (!openedProfile && !openedNotification && !openedPost && !openedChat) render();
}

export function runPostLoginNonBlockingRouteOpenFlowCore({
  openProfileFromQuery,
  openNotificationFromQuery,
  openPostFromQuery,
  openChatFromQuery,
  allowProfileOpen = false
} = {}) {
  const openProfile = typeof openProfileFromQuery === "function"
    ? openProfileFromQuery
    : (() => false);
  const openNotification = typeof openNotificationFromQuery === "function"
    ? openNotificationFromQuery
    : (() => Promise.resolve(false));
  const openPost = typeof openPostFromQuery === "function"
    ? openPostFromQuery
    : (() => Promise.resolve(false));
  const openChat = typeof openChatFromQuery === "function"
    ? openChatFromQuery
    : (() => false);

  const openedProfile = allowProfileOpen === true ? !!openProfile() : false;
  void openNotification();
  void openPost();
  openChat();
  return { openedProfile };
}

export function createPostLoginRouteOpenCoordinator({
  pendingRouteState = null,
  routeOpenApi = null,
  renderFallback = () => {},
  getPendingNotificationId = () => "",
  getPendingPostId = () => "",
  getPendingChatUid = () => "",
  openProfileFromQuery = () => false,
  openNotificationFromQuery = async () => false,
  openPostFromQuery = async () => false,
  openChatFromQuery = () => false
} = {}) {
  const readPendingState = typeof pendingRouteState?.getPendingState === "function"
    ? pendingRouteState.getPendingState
    : (() => ({}));
  const readPendingNotificationId = typeof pendingRouteState?.getPendingNotificationId === "function"
    ? pendingRouteState.getPendingNotificationId
    : (typeof getPendingNotificationId === "function" ? getPendingNotificationId : (() => ""));
  const readPendingPostId = typeof pendingRouteState?.getPendingPostId === "function"
    ? pendingRouteState.getPendingPostId
    : (typeof getPendingPostId === "function" ? getPendingPostId : (() => ""));
  const readPendingChatUid = typeof pendingRouteState?.getPendingChatUid === "function"
    ? pendingRouteState.getPendingChatUid
    : (typeof getPendingChatUid === "function" ? getPendingChatUid : (() => ""));
  const openProfile = typeof routeOpenApi?.openProfileFromQuery === "function"
    ? routeOpenApi.openProfileFromQuery
    : (typeof openProfileFromQuery === "function" ? openProfileFromQuery : (() => false));
  const openNotification = typeof routeOpenApi?.openNotificationFromQuery === "function"
    ? routeOpenApi.openNotificationFromQuery
    : (typeof openNotificationFromQuery === "function" ? openNotificationFromQuery : (async () => false));
  const openPost = typeof routeOpenApi?.openPostFromQuery === "function"
    ? routeOpenApi.openPostFromQuery
    : (typeof openPostFromQuery === "function" ? openPostFromQuery : (async () => false));
  const openChat = typeof routeOpenApi?.openChatFromQuery === "function"
    ? routeOpenApi.openChatFromQuery
    : (typeof openChatFromQuery === "function" ? openChatFromQuery : (() => false));

  function resolvePendingRouteFlags() {
    return resolvePendingAuthRouteFlagsCore({
      pendingNotificationId: readPendingNotificationId(),
      pendingPostId: readPendingPostId(),
      pendingChatUid: readPendingChatUid()
    });
  }

  function canOpenProfileForCurrentRoute() {
    return hasPendingProfileRoute(readPendingState());
  }

  async function openPendingRoutes() {
    return runPostLoginPendingRouteOpenFlowCore({
      openProfileFromQuery: openProfile,
      openNotificationFromQuery: openNotification,
      openPostFromQuery: openPost,
      openChatFromQuery: openChat,
      renderFallback,
      allowProfileOpen: canOpenProfileForCurrentRoute()
    });
  }

  function openNonBlockingRoutes() {
    return runPostLoginNonBlockingRouteOpenFlowCore({
      openProfileFromQuery: openProfile,
      openNotificationFromQuery: openNotification,
      openPostFromQuery: openPost,
      openChatFromQuery: openChat,
      allowProfileOpen: canOpenProfileForCurrentRoute()
    });
  }

  return {
    resolvePendingRouteFlags,
    openPendingRoutes,
    openNonBlockingRoutes
  };
}
