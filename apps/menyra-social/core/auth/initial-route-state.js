import "../router/public-route-cache-boot-hook.js";

import { normalizeTableNumberCore } from "../menu/table-qr-utils.js";
import {
  normalizePublicBusinessRouteResolutionCore,
  resolveLaunchPublicBusinessRouteCore
} from "../router/public-business-route-resolver.js";
import {
  isLikelyPublicBusinessRestaurantIdCore,
  isQrLikePublicBusinessAccessSourceCore,
  normalizePublicBusinessSlugCore,
  normalizePublicUserContentTabCore,
  normalizePublicUserRouteIdCore,
  parseSiteRoutePathCore
} from "../router/public-business-route-utils.js";

const PUBLIC_ROUTE_CACHE_GLOBAL_KEY = "__MENYRA_PUBLIC_ROUTE_RESOLUTIONS__";

function safeLowerText(value = "") {
  return String(value || "").trim().toLowerCase();
}

function safeText(value = "") {
  return String(value || "").trim();
}

function normalizeStartupRouteContext(context = null) {
  if (!context || typeof context !== "object") return null;
  if (Number(context.version || 0) !== 1) return null;
  return {
    pendingProfileRestaurantId: safeText(context.pendingProfileRestaurantId || ""),
    pendingProfileTopTab: safeLowerText(context.pendingProfileTopTab || ""),
    pendingProfileContentTab: safeLowerText(context.pendingProfileContentTab || ""),
    pendingProfileAccessSource: safeLowerText(context.pendingProfileAccessSource || ""),
    pendingProfileTableNumber: Math.max(0, Number(context.pendingProfileTableNumber || 0) || 0),
    pendingUserRouteId: safeText(context.pendingUserRouteId || ""),
    pendingUserContentTab: safeLowerText(context.pendingUserContentTab || ""),
    pendingInitialTab: safeLowerText(context.pendingInitialTab || context.tab || "")
  };
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
  return resolveInitialPublicBusinessRouteHint(value, readPublicRouteResolution).restaurantId;
}

function resolveInitialPublicBusinessRouteHint(value = "", readPublicRouteResolution = null) {
  const raw = String(value || "").trim();
  if (!raw) return { restaurantId: "", confirmed: false, source: "" };
  const cached = readCachedPublicRouteResolution(raw, readPublicRouteResolution);
  if (cached?.restaurantId) {
    return {
      restaurantId: String(cached.restaurantId || "").trim(),
      confirmed: true,
      source: cached.source || "cache"
    };
  }
  const launchResolution = resolveLaunchPublicBusinessRouteCore(raw);
  if (launchResolution?.restaurantId && launchResolution.source !== "none") {
    return {
      restaurantId: String(launchResolution.restaurantId || "").trim(),
      confirmed: true,
      source: launchResolution.source || "launch"
    };
  }
  return {
    restaurantId: normalizePublicBusinessSlugCore(raw, { allowReserved: false }),
    confirmed: false,
    source: "slug"
  };
}

export function resolveInitialRouteState({
  qs,
  pathname = "",
  normalizeInitialTab,
  normalizeAuthMode,
  readPublicRouteResolution = null,
  startupRouteContext = null
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
  const routeContext = normalizeStartupRouteContext(startupRouteContext);

  const rawRouteRestaurantIdFromQuery = (
    readQuery("r")
    || readQuery("restaurant")
    || readQuery("restaurantId")
    || readQuery("rid")
    || readQuery("businessId")
    || ""
  );
  const routeRestaurantHintFromQuery = resolveInitialPublicBusinessRouteHint(
    rawRouteRestaurantIdFromQuery,
    readPublicRouteResolution
  );
  const routeRestaurantIdFromQuery = routeRestaurantHintFromQuery.restaurantId;
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
      : (
        routeContext?.pendingProfileRestaurantId
          ? {
            kind: "business",
            restaurantId: routeContext.pendingProfileRestaurantId,
            profileTopTab: routeContext.pendingProfileTopTab,
            profileContentTab: routeContext.pendingProfileContentTab,
            accessSource: routeContext.pendingProfileAccessSource
          }
          : null
      )
  );
  const routeRestaurantHintFromPath = resolveInitialPublicBusinessRouteHint(
    pathBusinessRoute?.restaurantId || "",
    readPublicRouteResolution
  );
  const routeRestaurantHintFromContext = resolveInitialPublicBusinessRouteHint(
    routeContext?.pendingProfileRestaurantId || "",
    readPublicRouteResolution
  );
  const directQueryRestaurantId = isLikelyPublicBusinessRestaurantIdCore(rawRouteRestaurantIdFromQuery)
    ? String(rawRouteRestaurantIdFromQuery || "").trim()
    : "";
  const directContextRestaurantId = isLikelyPublicBusinessRestaurantIdCore(routeContext?.pendingProfileRestaurantId || "")
    ? String(routeContext?.pendingProfileRestaurantId || "").trim()
    : "";
  const pendingProfileRestaurantId = String(
    directQueryRestaurantId
    || directContextRestaurantId
    || (routeRestaurantHintFromPath.confirmed ? routeRestaurantHintFromPath.restaurantId : "")
    || (routeRestaurantHintFromQuery.confirmed ? routeRestaurantHintFromQuery.restaurantId : "")
    || (routeRestaurantHintFromContext.confirmed ? routeRestaurantHintFromContext.restaurantId : "")
    || routeContext?.pendingProfileRestaurantId
    || routeRestaurantHintFromPath.restaurantId
    || routeRestaurantIdFromQuery
    || ""
  ).trim();

  const queryTab = readQuery("tab") || readQuery("view") || "";
  const profileTopQuery = (
    readQuery("top")
    || readQuery("surface")
    || readQuery("screen")
    || (pendingProfileRestaurantId ? queryTab : "")
    || routeContext?.pendingProfileTopTab
  );
  const profileAccessSourceRaw = (
    readQuery("src")
    || readQuery("source")
    || readQuery("menuSource")
    || readQuery("menuAccessSource")
    || readQuery("access")
    || pathBusinessRoute?.accessSource
    || routeContext?.pendingProfileAccessSource
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
      || routeContext?.pendingProfileTableNumber
      || ""
    )
    : 0;

  const pathUserRoute = pendingProfileRestaurantId
    ? null
    : (
      pathRoute.kind === "user"
        ? pathRoute
        : (
          routeContext?.pendingUserRouteId
            ? {
              kind: "user",
              userId: routeContext.pendingUserRouteId,
              userContentTab: routeContext.pendingUserContentTab
            }
            : null
        )
    );
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
  if (!pendingInitialTab && routeContext?.pendingInitialTab) {
    pendingInitialTab = toInitialTab(routeContext.pendingInitialTab);
  }
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
