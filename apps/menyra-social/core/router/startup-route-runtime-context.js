import { normalizeTableNumberCore } from "../menu/table-qr-utils.js";
import {
  isQrLikePublicBusinessAccessSourceCore,
  normalizeAppTabRouteCore,
  normalizePublicBusinessContentTabCore,
  normalizePublicBusinessTopTabCore,
  normalizePublicUserContentTabCore,
  parseSiteRoutePathCore
} from "./public-business-route-utils.js";

const STARTUP_ROUTE_CONTEXT_GLOBAL_KEY = "__MENYRA_SOCIAL_ROUTE_RUNTIME_CONTEXT__";

function safeText(value = "") {
  return String(value || "").trim();
}

function safeLowerText(value = "") {
  return safeText(value).toLowerCase();
}

function readSearchParams(locationObj = null) {
  try {
    return new URLSearchParams(String(locationObj?.search || ""));
  } catch {
    return new URLSearchParams();
  }
}

function readFirstQueryValue(params = null, keys = []) {
  if (!(params instanceof URLSearchParams)) return "";
  for (const key of keys) {
    const safeKey = safeText(key);
    if (!safeKey) continue;
    const value = safeText(params.get(safeKey) || "");
    if (value) return value;
  }
  return "";
}

function normalizeQrAccessSource(value = "") {
  return isQrLikePublicBusinessAccessSourceCore(value) ? "qr" : "";
}

function resolveStartupSurface({
  tab = "",
  hasBusinessTarget = false,
  hasUserTarget = false,
  businessTopTab = ""
} = {}) {
  const safeBusinessTopTab = safeLowerText(businessTopTab);
  if (hasBusinessTarget) return safeBusinessTopTab === "menu" ? "menu" : "profile";
  if (hasUserTarget) return "profile";
  return normalizeAppTabRouteCore(tab || "", "feed") || "feed";
}

function normalizeContextShape(context = null) {
  if (!context || typeof context !== "object") return null;
  const version = Number(context.version || 0);
  if (version !== 1) return null;
  return context;
}

export function createStartupRouteRuntimeContext({
  locationObj = null,
  entryMode = "",
  nowMs = Date.now
} = {}) {
  const loc = locationObj || globalThis?.location || {};
  const pathname = safeText(loc.pathname || "");
  const search = safeText(loc.search || "");
  const hash = safeText(loc.hash || "");
  const params = readSearchParams(loc);
  const route = parseSiteRoutePathCore(pathname);
  const routeKind = safeText(route?.kind || "unknown") || "unknown";

  const queryRestaurantId = readFirstQueryValue(params, [
    "r",
    "restaurant",
    "restaurantId",
    "rid",
    "businessId"
  ]);
  const queryTab = readFirstQueryValue(params, ["tab", "view"]);
  const queryTopTab = readFirstQueryValue(params, ["top", "surface", "screen"]);
  const rawAccessSource = readFirstQueryValue(params, [
    "src",
    "source",
    "menuSource",
    "menuAccessSource",
    "access"
  ]) || safeText(route?.accessSource || "");
  const menuAccessSource = normalizeQrAccessSource(rawAccessSource);
  const tableNumber = normalizeTableNumberCore(readFirstQueryValue(params, [
    "table",
    "tableNumber",
    "t"
  ]));
  const routeHasBusinessTarget = routeKind === "business" || routeKind === "landingBusiness";
  const businessRouteId = safeText(routeHasBusinessTarget ? route?.restaurantId || "" : "");
  const pendingProfileRestaurantId = businessRouteId || queryRestaurantId;
  const hasBusinessTarget = !!pendingProfileRestaurantId;
  const businessTopTab = hasBusinessTarget
    ? (
      menuAccessSource === "qr"
        ? "menu"
        : normalizePublicBusinessTopTabCore(
          queryTopTab
          || (hasBusinessTarget ? queryTab : "")
          || safeText(route?.profileTopTab || ""),
          routeKind === "landingBusiness" ? "landing" : "profile"
        )
    )
    : "";
  const businessContentTab = hasBusinessTarget
    ? normalizePublicBusinessContentTabCore(
      safeText(route?.profileContentTab || "")
      || (businessTopTab === "menu" ? "menu" : "posts"),
      businessTopTab === "menu" ? "menu" : "posts"
    )
    : "";

  const hasUserTarget = routeKind === "user" && !!safeText(route?.userId || "");
  const userContentTab = hasUserTarget
    ? normalizePublicUserContentTabCore(route?.userContentTab || "", "profile")
    : "";
  const systemTab = normalizeAppTabRouteCore(
    queryTab || safeText(route?.tab || ""),
    hasBusinessTarget || hasUserTarget ? "profile" : "feed"
  );
  const pendingInitialTab = hasBusinessTarget || hasUserTarget
    ? "profile"
    : systemTab;
  const startupSurface = resolveStartupSurface({
    tab: pendingInitialTab,
    hasBusinessTarget,
    hasUserTarget,
    businessTopTab
  });
  const publicKind = hasBusinessTarget
    ? (routeKind === "landingBusiness" ? "landingBusiness" : "business")
    : (hasUserTarget ? "user" : routeKind);

  return {
    version: 1,
    entryMode: safeText(entryMode),
    createdAt: typeof nowMs === "function" ? Number(nowMs()) || Date.now() : Date.now(),
    pathname,
    search,
    hash,
    routePath: safeText(route?.routePath || ""),
    canonicalPath: safeText(route?.canonicalPath || ""),
    pathKind: routeKind,
    kind: publicKind,
    tab: pendingInitialTab,
    authMode: safeText(route?.authMode || ""),
    startupSurface,
    isPublicWebsiteStartup: publicKind === "business" || publicKind === "user" || publicKind === "landingBusiness",
    pendingInitialTab,
    pendingProfileRestaurantId,
    pendingProfileTopTab: businessTopTab,
    pendingProfileContentTab: businessContentTab,
    pendingProfileAccessSource: menuAccessSource,
    pendingProfileRawAccessSource: safeLowerText(rawAccessSource),
    pendingProfileTableNumber: tableNumber,
    pendingUserRouteId: hasUserTarget ? safeText(route?.userId || "") : "",
    pendingUserContentTab: userContentTab,
    publicBusiness: {
      routeId: pendingProfileRestaurantId,
      topTab: businessTopTab,
      contentTab: businessContentTab,
      accessSource: menuAccessSource,
      rawAccessSource: safeLowerText(rawAccessSource),
      tableNumber,
      isQr: menuAccessSource === "qr",
      routePath: safeText(route?.routePath || ""),
      canonicalPath: safeText(route?.canonicalPath || ""),
      isLegacy: route?.isLegacy === true
    },
    publicUser: {
      routeId: hasUserTarget ? safeText(route?.userId || "") : "",
      contentTab: userContentTab,
      routePath: hasUserTarget ? safeText(route?.routePath || "") : "",
      canonicalPath: hasUserTarget ? safeText(route?.canonicalPath || "") : ""
    }
  };
}

export function publishStartupRouteRuntimeContext(options = {}) {
  const context = createStartupRouteRuntimeContext(options);
  try {
    globalThis[STARTUP_ROUTE_CONTEXT_GLOBAL_KEY] = context;
  } catch {}
  return context;
}

export function readStartupRouteRuntimeContext(globalObj = globalThis) {
  try {
    return normalizeContextShape(globalObj?.[STARTUP_ROUTE_CONTEXT_GLOBAL_KEY]);
  } catch {
    return null;
  }
}

export { STARTUP_ROUTE_CONTEXT_GLOBAL_KEY };
