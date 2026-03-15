export function resolveInitialRouteState({
  qs,
  normalizeInitialTab,
  normalizeAuthMode
} = {}) {
  const readQuery = typeof qs === "function" ? qs : (() => "");
  const toInitialTab = typeof normalizeInitialTab === "function" ? normalizeInitialTab : ((value) => String(value || "").trim());
  const toAuthMode = typeof normalizeAuthMode === "function" ? normalizeAuthMode : ((value) => String(value || "").trim());

  const pendingProfileRestaurantId = (
    readQuery("r")
    || readQuery("restaurant")
    || readQuery("restaurantId")
    || readQuery("rid")
    || readQuery("businessId")
    || ""
  );
  const queryTab = readQuery("tab") || readQuery("top") || readQuery("view") || "";
  const pendingProfileTopTab = pendingProfileRestaurantId ? queryTab : "";
  const profileAccessSourceRaw = (
    readQuery("src")
    || readQuery("source")
    || readQuery("menuSource")
    || readQuery("menuAccessSource")
    || readQuery("access")
    || ""
  );
  const qrFlagRaw = String(
    readQuery("qr")
    || readQuery("isQr")
    || readQuery("menuQr")
    || ""
  ).trim().toLowerCase();
  const qrFlagEnabled = qrFlagRaw === "1" || qrFlagRaw === "true" || qrFlagRaw === "yes" || qrFlagRaw === "qr";
  const profileAccessSource = String(profileAccessSourceRaw || "").trim().toLowerCase() || (qrFlagEnabled ? "qr" : "");
  const pendingProfileAccessSource = pendingProfileRestaurantId
    ? profileAccessSource
    : "";
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
    pendingProfileAccessSource,
    pendingNotificationId,
    pendingPostId,
    pendingChatUid,
    pendingInitialTab,
    pendingAuthMode
  };
}
