import { normalizeTableNumberCore } from "../menu/table-qr-utils.js";
import {
  isLikelyPublicBusinessRestaurantIdCore,
  isQrLikePublicBusinessAccessSourceCore,
  normalizeAppTabRouteCore,
  normalizePublicBusinessContentTabCore,
  normalizePublicBusinessSlugCore,
  normalizePublicBusinessTopTabCore,
  normalizePublicUserContentTabCore,
  parseSiteRoutePathCore
} from "./public-business-route-utils.js";

const STARTUP_ROUTE_CONTEXT_GLOBAL_KEY = "__MENYRA_SOCIAL_ROUTE_RUNTIME_CONTEXT__";
const PUBLIC_ROUTE_CACHE_GLOBAL_KEY = "__MENYRA_PUBLIC_ROUTE_RESOLUTIONS__";
const PUBLIC_ROUTE_RESOLUTION_EVENT = "menyra:public-route-resolution";

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

function normalizeRouteSlug(value = "") {
  return normalizePublicBusinessSlugCore(value || "", { allowReserved: false });
}

function normalizeCachedPublicRouteResolution(resolution = null, input = "") {
  if (!resolution || typeof resolution !== "object") return null;
  const restaurantId = safeText(resolution.restaurantId || resolution.canonicalRestaurantId || "");
  if (!restaurantId || resolution.found === false) return null;
  const status = safeLowerText(resolution.status || "active");
  if (["inactive", "disabled", "deleted", "blocked", "archived", "private", "not-found", "notfound"].includes(status)) {
    return null;
  }
  return {
    found: true,
    status: status || "active",
    inputSlug: normalizeRouteSlug(resolution.inputSlug || input || ""),
    canonicalSlug: normalizeRouteSlug(resolution.canonicalSlug || resolution.slug || resolution.inputSlug || input || ""),
    restaurantId,
    source: safeText(resolution.source || "cache") || "cache"
  };
}

function readCachedPublicRouteResolution(value = "", globalObj = globalThis) {
  const raw = safeText(value);
  if (!raw) return null;
  try {
    const cache = globalObj?.[PUBLIC_ROUTE_CACHE_GLOBAL_KEY];
    if (!cache || typeof cache !== "object") return null;
    const normalized = normalizeRouteSlug(raw);
    const candidates = Array.from(new Set([
      raw,
      raw.toLowerCase(),
      normalized
    ].filter(Boolean)));
    for (const candidate of candidates) {
      const resolution = typeof cache.get === "function"
        ? cache.get(candidate)
        : cache[candidate];
      const normalizedResolution = normalizeCachedPublicRouteResolution(resolution, raw);
      if (normalizedResolution) return normalizedResolution;
    }
  } catch {}
  return null;
}

function resolveStartupBusinessTarget({
  businessRouteId = "",
  queryRestaurantId = ""
} = {}) {
  const safeBusinessRouteId = safeText(businessRouteId);
  const safeQueryRestaurantId = safeText(queryRestaurantId);
  const directQueryRestaurantId = isLikelyPublicBusinessRestaurantIdCore(safeQueryRestaurantId)
    ? safeQueryRestaurantId
    : "";
  const pathResolution = readCachedPublicRouteResolution(safeBusinessRouteId);
  const queryResolution = readCachedPublicRouteResolution(safeQueryRestaurantId);
  if (directQueryRestaurantId) {
    return {
      pendingProfileRestaurantId: directQueryRestaurantId,
      resolution: {
        found: true,
        status: "fallback",
        inputSlug: normalizeRouteSlug(safeBusinessRouteId || safeQueryRestaurantId),
        canonicalSlug: pathResolution?.canonicalSlug || normalizeRouteSlug(safeBusinessRouteId || ""),
        restaurantId: directQueryRestaurantId,
        source: "query-direct-id"
      }
    };
  }
  const resolution = pathResolution || queryResolution || null;
  return {
    pendingProfileRestaurantId: resolution?.restaurantId || safeBusinessRouteId || safeQueryRestaurantId,
    resolution
  };
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
  const startupBusinessTarget = resolveStartupBusinessTarget({
    businessRouteId,
    queryRestaurantId
  });
  const pendingProfileRestaurantId = startupBusinessTarget.pendingProfileRestaurantId;
  const routeResolution = startupBusinessTarget.resolution || null;
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
      inputSlug: routeResolution?.inputSlug || normalizeRouteSlug(businessRouteId || ""),
      canonicalSlug: routeResolution?.canonicalSlug || "",
      routeResolutionSource: routeResolution?.source || "",
      isCanonicalResolved: !!routeResolution?.restaurantId,
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

function routeContextMatchesPublicRouteResolution(context = null, resolution = null) {
  if (!context || !resolution?.restaurantId) return false;
  const route = parseSiteRoutePathCore(context.pathname || "");
  const values = [
    context.pendingProfileRestaurantId,
    context.publicBusiness?.routeId,
    context.publicBusiness?.inputSlug,
    route?.restaurantId
  ].map((value) => safeText(value)).filter(Boolean);
  if (values.includes(resolution.restaurantId)) return true;
  const slugKeys = new Set([
    normalizeRouteSlug(resolution.inputSlug || ""),
    normalizeRouteSlug(resolution.canonicalSlug || "")
  ].filter(Boolean));
  return values.some((value) => slugKeys.has(normalizeRouteSlug(value)));
}

export function promoteStartupRouteRuntimeContextWithPublicRouteResolution(
  resolution = null,
  { globalObj = globalThis, dispatchEvent = true } = {}
) {
  const normalizedResolution = normalizeCachedPublicRouteResolution(resolution);
  if (!normalizedResolution?.restaurantId) return null;
  let current = null;
  try {
    current = normalizeContextShape(globalObj?.[STARTUP_ROUTE_CONTEXT_GLOBAL_KEY]);
  } catch {
    current = null;
  }
  if (!current || !routeContextMatchesPublicRouteResolution(current, normalizedResolution)) return current;
  const next = {
    ...current,
    pendingProfileRestaurantId: normalizedResolution.restaurantId,
    publicBusiness: {
      ...(current.publicBusiness && typeof current.publicBusiness === "object" ? current.publicBusiness : {}),
      routeId: normalizedResolution.restaurantId,
      inputSlug: normalizedResolution.inputSlug || current.publicBusiness?.inputSlug || "",
      canonicalSlug: normalizedResolution.canonicalSlug || current.publicBusiness?.canonicalSlug || "",
      routeResolutionSource: normalizedResolution.source || current.publicBusiness?.routeResolutionSource || "",
      isCanonicalResolved: true
    }
  };
  try {
    globalObj[STARTUP_ROUTE_CONTEXT_GLOBAL_KEY] = next;
  } catch {}
  if (dispatchEvent !== false) {
    try {
      const eventTarget = globalObj?.window || globalObj;
      if (eventTarget && typeof eventTarget.dispatchEvent === "function" && typeof CustomEvent === "function") {
        eventTarget.dispatchEvent(new CustomEvent(PUBLIC_ROUTE_RESOLUTION_EVENT, {
          detail: {
            resolution: normalizedResolution,
            context: next
          }
        }));
      }
    } catch {}
  }
  return next;
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

export {
  STARTUP_ROUTE_CONTEXT_GLOBAL_KEY,
  PUBLIC_ROUTE_RESOLUTION_EVENT
};
