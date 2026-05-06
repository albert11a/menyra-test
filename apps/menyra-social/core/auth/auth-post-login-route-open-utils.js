function resolvePendingAuthRouteFlagsCore({
  pendingNotificationId = "",
  pendingPostId = "",
  pendingChatUid = ""
} = {}) {
  const hasPendingNotificationQuery = !!String(pendingNotificationId || "").trim();
  const hasPendingPostQuery = !!String(pendingPostId || "").trim();
  const hasPendingChatQuery = !!String(pendingChatUid || "").trim();
  return {
    hasPendingNotificationQuery,
    hasPendingPostQuery,
    hasPendingChatQuery,
    hasAny: hasPendingNotificationQuery || hasPendingPostQuery || hasPendingChatQuery
  };
}

export async function runPostLoginPendingRouteOpenFlowCore({
  openProfileFromQuery,
  openNotificationFromQuery,
  openPostFromQuery,
  openChatFromQuery,
  renderFallback
} = {}) {
  const openProfile = typeof openProfileFromQuery === "function"
    ? openProfileFromQuery
    : (() => {});
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

  openProfile();
  const openedNotification = await openNotification();
  const openedPost = await openPost();
  const openedChat = openChat();
  if (!openedNotification && !openedPost && !openedChat) render();
}

export function runPostLoginNonBlockingRouteOpenFlowCore({
  openProfileFromQuery,
  openNotificationFromQuery,
  openPostFromQuery,
  openChatFromQuery
} = {}) {
  const openProfile = typeof openProfileFromQuery === "function"
    ? openProfileFromQuery
    : (() => {});
  const openNotification = typeof openNotificationFromQuery === "function"
    ? openNotificationFromQuery
    : (() => Promise.resolve(false));
  const openPost = typeof openPostFromQuery === "function"
    ? openPostFromQuery
    : (() => Promise.resolve(false));
  const openChat = typeof openChatFromQuery === "function"
    ? openChatFromQuery
    : (() => false);

  const openedProfile = !!openProfile();
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
  openProfileFromQuery = () => {},
  openNotificationFromQuery = async () => false,
  openPostFromQuery = async () => false,
  openChatFromQuery = () => false
} = {}) {
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
    : (typeof openProfileFromQuery === "function" ? openProfileFromQuery : (() => {}));
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

  async function openPendingRoutes() {
    return runPostLoginPendingRouteOpenFlowCore({
      openProfileFromQuery: openProfile,
      openNotificationFromQuery: openNotification,
      openPostFromQuery: openPost,
      openChatFromQuery: openChat,
      renderFallback
    });
  }

  function openNonBlockingRoutes() {
    return runPostLoginNonBlockingRouteOpenFlowCore({
      openProfileFromQuery: openProfile,
      openNotificationFromQuery: openNotification,
      openPostFromQuery: openPost,
      openChatFromQuery: openChat
    });
  }

  return {
    resolvePendingRouteFlags,
    openPendingRoutes,
    openNonBlockingRoutes
  };
}
