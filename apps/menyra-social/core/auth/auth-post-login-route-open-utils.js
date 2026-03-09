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

  openProfile();
  void openNotification();
  void openPost();
  openChat();
}
