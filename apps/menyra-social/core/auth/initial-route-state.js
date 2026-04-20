import { normalizeTableNumberCore } from "../menu/table-qr-utils.js";

export function resolveInitialRouteState({
  qs,
  pathname = "",
  normalizeInitialTab,
  normalizeAuthMode
} = {}) {
  const readQuery = typeof qs === "function" ? qs : (() => "");
  const toInitialTab = typeof normalizeInitialTab === "function" ? normalizeInitialTab : ((value) => String(value || "").trim());
  const toAuthMode = typeof normalizeAuthMode === "function" ? normalizeAuthMode : ((value) => String(value || "").trim());
  const readPathname = String(pathname || "").trim();
  const resolveLandingSlugFromPathname = (rawPath = "") => {
    const safePath = String(rawPath || "").split("?")[0].split("#")[0].trim();
    if (!safePath) return "";
    const segments = safePath.replace(/^\/+|\/+$/g, "").split("/").filter(Boolean);
    if (segments.length !== 1) return "";
    const slug = String(segments[0] || "").trim();
    if (!slug) return "";
    if (slug.includes(".")) return "";
    const key = slug.toLowerCase();
    const reserved = new Set([
      "ceo",
      "owner",
      "staff",
      "waiter",
      "kitchen",
      "social",
      "heart",
      "hub",
      "apps",
      "api",
      "login",
      "register",
      "profile",
      "post",
      "story",
      "menyra-restaurants",
      "lp"
    ]);
    if (reserved.has(key)) return "";
    return slug;
  };

  const routeRestaurantId = (
    readQuery("r")
    || readQuery("restaurant")
    || readQuery("restaurantId")
    || readQuery("rid")
    || readQuery("businessId")
    || ""
  );
  const landingSlug = routeRestaurantId ? "" : resolveLandingSlugFromPathname(readPathname);
  const pendingProfileRestaurantId = routeRestaurantId || landingSlug;
  const queryTab = readQuery("tab") || readQuery("view") || "";
  const profileTopQuery = readQuery("top") || (pendingProfileRestaurantId ? queryTab : "");
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
  const fallbackProfileTopTab = pendingProfileRestaurantId && profileAccessSource === "qr"
    ? "menu"
    : "";
  const pendingProfileTopTab = pendingProfileRestaurantId
    ? (profileTopQuery || fallbackProfileTopTab)
    : "";
  const pendingProfileAccessSource = pendingProfileRestaurantId
    ? profileAccessSource
    : "";
  const pendingProfileTableNumber = pendingProfileRestaurantId
    ? normalizeTableNumberCore(
      readQuery("table")
      || readQuery("tableNumber")
      || readQuery("t")
      || ""
    )
    : 0;
  const pendingNotificationId = readQuery("notif") || readQuery("notification") || readQuery("nid") || "";
  const pendingPostId = readQuery("post") || readQuery("postId") || "";
  const pendingChatUid = readQuery("chat") || readQuery("thread") || "";
  let pendingInitialTab = toInitialTab(queryTab || profileTopQuery || "");
  if (pendingProfileRestaurantId) {
    // Deep public profile routes should always open the profile route surface first.
    if (!pendingInitialTab || pendingInitialTab === "menu") pendingInitialTab = "profile";
  }
  if (landingSlug) pendingInitialTab = "profile";
  if (!pendingInitialTab && pendingChatUid) pendingInitialTab = "chat";
  if (!pendingInitialTab && pendingPostId) pendingInitialTab = "feed";
  const pendingAuthMode = toAuthMode(readQuery("auth") || "");

  return {
    pendingProfileRestaurantId,
    pendingProfileTopTab,
    pendingProfileAccessSource,
    pendingProfileTableNumber,
    pendingNotificationId,
    pendingPostId,
    pendingChatUid,
    pendingInitialTab,
    pendingAuthMode
  };
}
