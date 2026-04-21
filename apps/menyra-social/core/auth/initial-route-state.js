import { normalizeTableNumberCore } from "../menu/table-qr-utils.js";
import {
  isQrLikePublicBusinessAccessSourceCore,
  parsePublicBusinessRoutePathCore
} from "../router/public-business-route-utils.js";

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

  const routeRestaurantId = (
    readQuery("r")
    || readQuery("restaurant")
    || readQuery("restaurantId")
    || readQuery("rid")
    || readQuery("businessId")
    || ""
  );
  const pathProfileRoute = routeRestaurantId
    ? { restaurantId: "", topTab: "", accessSource: "" }
    : parsePublicBusinessRoutePathCore(readPathname);
  const landingSlug = routeRestaurantId ? "" : pathProfileRoute.restaurantId;
  const pendingProfileRestaurantId = routeRestaurantId || landingSlug;
  const queryTab = readQuery("tab") || readQuery("view") || "";
  const profileTopQuery = readQuery("top") || readQuery("surface") || readQuery("screen") || (pendingProfileRestaurantId ? queryTab : "");
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
  const profileAccessSource = String(profileAccessSourceRaw || "").trim().toLowerCase()
    || String(pathProfileRoute.accessSource || "").trim().toLowerCase()
    || (qrFlagEnabled ? "qr" : "");
  const fallbackProfileTopTab = pendingProfileRestaurantId && profileAccessSource === "qr"
    ? "menu"
    : "";
  const pendingProfileTopTab = pendingProfileRestaurantId
    ? (profileTopQuery || pathProfileRoute.topTab || fallbackProfileTopTab)
    : "";
  const pendingProfileAccessSource = pendingProfileRestaurantId
    ? (isQrLikePublicBusinessAccessSourceCore(profileAccessSource) ? "qr" : "")
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
    // Direct public profile/menu URLs are always route-first profile surfaces.
    pendingInitialTab = "profile";
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
