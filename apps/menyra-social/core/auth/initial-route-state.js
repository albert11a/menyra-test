export function resolveInitialRouteState({
  qs,
  normalizeInitialTab,
  normalizeAuthMode
} = {}) {
  const readQuery = typeof qs === "function" ? qs : (() => "");
  const toInitialTab = typeof normalizeInitialTab === "function" ? normalizeInitialTab : ((value) => String(value || "").trim());
  const toAuthMode = typeof normalizeAuthMode === "function" ? normalizeAuthMode : ((value) => String(value || "").trim());

  const pendingProfileRestaurantId = readQuery("r") || readQuery("restaurant") || "";
  const queryTab = readQuery("tab") || readQuery("top") || "";
  const pendingProfileTopTab = pendingProfileRestaurantId ? queryTab : "";
  const pendingNotificationId = readQuery("notif") || readQuery("notification") || readQuery("nid") || "";
  const pendingPostId = readQuery("post") || readQuery("postId") || "";
  const pendingChatUid = readQuery("chat") || readQuery("thread") || "";
  let pendingInitialTab = toInitialTab(queryTab || readQuery("view") || "");
  if (!pendingInitialTab && pendingChatUid) pendingInitialTab = "chat";
  if (!pendingInitialTab && pendingPostId) pendingInitialTab = "feed";
  const pendingAuthMode = toAuthMode(readQuery("auth") || "");

  return {
    pendingProfileRestaurantId,
    pendingProfileTopTab,
    pendingNotificationId,
    pendingPostId,
    pendingChatUid,
    pendingInitialTab,
    pendingAuthMode
  };
}
