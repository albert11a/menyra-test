import "../router/public-route-cache-boot-hook.js";

import { normalizeTableNumberCore } from "../menu/table-qr-utils.js";
import {
  normalizePublicBusinessRouteResolutionCore,
  resolveLaunchPublicBusinessRouteCore
} from "../router/public-business-route-resolver.js";
import {
  isQrLikePublicBusinessAccessSourceCore,
  normalizePublicUserContentTabCore,
  normalizePublicUserRouteIdCore,
  parseSiteRoutePathCore
} from "../router/public-business-route-utils.js";

const PUBLIC_ROUTE_CACHE_GLOBAL_KEY = "__MENYRA_PUBLIC_ROUTE_RESOLUTIONS__";

function safeLowerText(value = "") {
  return String(value || "").trim().toLowerCase();
}

function readGlobalPublicRouteResolution(value = "") {
  const raw = String(value || "").trim();
  if (!raw) return null;
  try {
    const cache = globalThis?.[PUBLIC_ROUTE_CACHE_GLOBAL_KEY];
    if (!cache || typeof cache !== "object") return null;
    if (typeof cache.get === "function") return cache.get(raw) || cache.get(raw.toLowerCase()) || null;
    return cache[raw] || cache[raw.toLowerCase()] || null;
  } catch {
    return null;
  }
}

function readCachedPublicRouteResolution(value = "", readPublicRouteResolution = null) {
  const raw = String(value || "").trim();
  if (!raw) return null;
  try {
    const explicitResolution = typeof readPublicRouteResolution === "function"
      ? readPublicRouteResolution(raw)
      : null;
    const globalResolution = explicitResolution || readGlobalPublicRouteResolution(raw);
    const resolution = normalizePublicBusinessRouteResolutionCore(globalResolution);
    return resolution?.found && resolution.restaurantId ? resolution : null;
  } catch {
    return null;
  }
}

function resolveInitialPublicBusinessRestaurantId(value = "", readPublicRouteResolution = null) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  const cached = readCachedPublicRouteResolution(raw, readPublicRouteResolution);
  if (cached?.restaurantId) return String(cached.restaurantId || "").trim();
  const resolved = resolveLaunchPublicBusinessRouteCore(raw);
  return String(resolved?.restaurantId || raw).trim();
}

export function resolveInitialRouteState({
  qs,
  pathname = "",
  normalizeInitialTab,
  normalizeAuthMode,
  readPublicRouteResolution = null
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

  const routeRestaurantIdFromQuery = resolveInitialPublicBusinessRestaurantId(
    readQuery("r")
    || readQuery("restaurant")
    || readQuery("restaurantId")
    || readQuery("rid")
    || readQuery("businessId")
    || "",
    readPublicRouteResolution
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
    resolveInitialPublicBusinessRestaurantId(pathBusinessRoute?.restaurantId || "", readPublicRouteResolution)
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
  const explicitProfileTopTab = safeLowerText(profileTopQuery || "");
  const routeInferredProfileTopTab = safeLowerText(
    pathBusinessRoute?.profileTopTab
    || (
      safeLowerText(pathRoute.tab || "") === "menu"
        ? "menu"
        : ""
    )
  );
  const pendingProfileTopTab = pendingProfileRestaurantId
    ? (
      hasQrProfileAccessSource
        ? "menu"
        : (
          explicitProfileTopTab
          || routeInferredProfileTopTab
          || fallbackProfileTopTab
        )
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
