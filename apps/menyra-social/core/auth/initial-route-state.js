import { normalizeTableNumberCore } from "../menu/table-qr-utils.js";
import {
  isQrLikePublicBusinessAccessSourceCore,
  normalizePublicUserContentTabCore,
  normalizePublicUserRouteIdCore,
  parseSiteRoutePathCore
} from "../router/public-business-route-utils.js";

function safeLowerText(value = "") {
  return String(value || "").trim().toLowerCase();
}

export function resolveInitialRouteState({
  qs,
  pathname = "",
  normalizeInitialTab,
  normalizeAuthMode
} = {}) {
  const readQuery = typeof qs === "function" ? qs : (() => "");
  const toInitialTab = typeof normalizeInitialTab === "function"
    ? normalizeInitialTab
    : ((value) => String(value || "").trim());
  const toAuthMode = typeof normalizeAuthMode === "function"
    ? normalizeAuthMode
    : ((value) => String(value || "").trim());
  const readPathname = String(pathname || "").trim();
  const pathRoute = parseSiteRoutePathCore(readPathname);

  const routeRestaurantIdFromQuery = (
    readQuery("r")
    || readQuery("restaurant")
    || readQuery("restaurantId")
    || readQuery("rid")
    || readQuery("businessId")
    || ""
  );
  const routeUserIdFromQuery = (
    readQuery("uid")
    || readQuery("user")
    || readQuery("userId")
    || readQuery("u")
    || readQuery("handle")
    || ""
  );
  const pathBusinessRoute = (
    pathRoute.kind === "business" || pathRoute.kind === "landingBusiness"
      ? pathRoute
      : null
  );
  const pendingProfileRestaurantId = String(
    pathBusinessRoute?.restaurantId
    || routeRestaurantIdFromQuery
    || ""
  ).trim();

  const queryTab = readQuery("tab") || readQuery("view") || "";
  const profileTopQuery = (
    readQuery("top")
    || readQuery("surface")
    || readQuery("screen")
    || (pendingProfileRestaurantId ? queryTab : "")
  );
  const profileAccessSourceRaw = (
    readQuery("src")
    || readQuery("source")
    || readQuery("menuSource")
    || readQuery("menuAccessSource")
    || readQuery("access")
    || ""
  );
  const qrFlagRaw = safeLowerText(
    readQuery("qr")
    || readQuery("isQr")
    || readQuery("menuQr")
    || ""
  );
  const qrFlagEnabled = qrFlagRaw === "1" || qrFlagRaw === "true" || qrFlagRaw === "yes" || qrFlagRaw === "qr";
  const profileAccessSource = String(
    profileAccessSourceRaw
    || pathBusinessRoute?.accessSource
    || (qrFlagEnabled ? "qr" : "")
  ).trim().toLowerCase();
  const hasQrProfileAccessSource = isQrLikePublicBusinessAccessSourceCore(profileAccessSource);
  const fallbackProfileTopTab = pendingProfileRestaurantId && hasQrProfileAccessSource
    ? "menu"
    : "";
  const pendingProfileTopTab = pendingProfileRestaurantId
    ? (
      pathBusinessRoute?.profileTopTab
      || profileTopQuery
      || (
        safeLowerText(pathRoute.tab || "") === "menu"
          ? "menu"
          : ""
      )
      || fallbackProfileTopTab
    )
    : "";
  const pendingProfileAccessSource = pendingProfileRestaurantId
    ? (hasQrProfileAccessSource ? "qr" : "")
    : "";
  const pendingProfileTableNumber = pendingProfileRestaurantId
    ? normalizeTableNumberCore(
      readQuery("table")
      || readQuery("tableNumber")
      || readQuery("t")
      || ""
    )
    : 0;

  const pathUserRoute = pendingProfileRestaurantId
    ? null
    : (pathRoute.kind === "user" ? pathRoute : null);
  const pendingUserRouteId = pendingProfileRestaurantId
    ? ""
    : normalizePublicUserRouteIdCore(routeUserIdFromQuery || pathUserRoute?.userId || "");
  const queryUserContentTab = (
    readQuery("content")
    || readQuery("contentTab")
    || readQuery("section")
    || (
      safeLowerText(readQuery("media")) === "1"
      || safeLowerText(readQuery("media")) === "true"
      || safeLowerText(readQuery("media")) === "yes"
        ? "media"
        : ""
    )
  );
  const pendingUserContentTab = pendingUserRouteId
    ? normalizePublicUserContentTabCore(
      queryUserContentTab
      || (
        queryTab === "media" || queryTab === "posts"
          ? queryTab
          : ""
      )
      || pathUserRoute?.userContentTab
      || "",
      "profile"
    )
    : "";

  const pendingNotificationId = readQuery("notif") || readQuery("notification") || readQuery("nid") || "";
  const pendingPostId = readQuery("post") || readQuery("postId") || "";
  const pendingChatUid = readQuery("chat") || readQuery("thread") || "";

  let pendingInitialTab = toInitialTab(queryTab || pathRoute.tab || profileTopQuery || "");
  if (pendingProfileRestaurantId || pendingUserRouteId) {
    pendingInitialTab = "profile";
  }
  if (!pendingInitialTab && pendingChatUid) pendingInitialTab = "chat";
  if (!pendingInitialTab && pendingPostId) pendingInitialTab = "feed";

  const pendingAuthMode = toAuthMode(readQuery("auth") || pathRoute.authMode || "");

  return {
    pendingProfileRestaurantId,
    pendingProfileTopTab,
    pendingProfileAccessSource,
    pendingProfileTableNumber,
    pendingUserRouteId,
    pendingUserContentTab,
    pendingNotificationId,
    pendingPostId,
    pendingChatUid,
    pendingInitialTab,
    pendingAuthMode
  };
}
