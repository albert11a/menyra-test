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
  const RESERVED_PATH_SEGMENTS = new Set([
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
    "lp",
    "index.html"
  ]);
  const normalizeTopTabFromPathSegment = (value = "") => {
    const key = String(value || "").trim().toLowerCase();
    if (!key) return "";
    if (key === "menu" || key === "karte" || key === "speisekarte" || key === "shop") return "menu";
    if (key === "profile" || key === "posts" || key === "home" || key === "overview") return "profile";
    if (key === "landing" || key === "welcome" || key === "onboarding") return "landing";
    if (key === "cart" || key === "basket" || key === "warenkorb") return "cart";
    return "";
  };
  const normalizePathRestaurantSlug = (value = "") => {
    const raw = String(value || "").trim();
    if (!raw) return "";
    const stripped = raw.startsWith("@") ? raw.slice(1) : raw;
    const slug = String(stripped || "").trim();
    if (!slug || slug.includes(".")) return "";
    const key = slug.toLowerCase();
    if (RESERVED_PATH_SEGMENTS.has(key)) return "";
    return slug;
  };
  const resolvePathProfileRoute = (rawPath = "") => {
    const safePath = String(rawPath || "").split("?")[0].split("#")[0].trim();
    if (!safePath) return { restaurantId: "", topTab: "" };
    let segments = safePath.replace(/^\/+|\/+$/g, "").split("/").filter(Boolean);
    if (!segments.length) return { restaurantId: "", topTab: "" };
    const appRootIndex = segments.findIndex((seg) => String(seg || "").trim().toLowerCase() === "menyra-social");
    if (appRootIndex >= 0 && appRootIndex < segments.length - 1) {
      segments = segments.slice(appRootIndex + 1);
    }
    if (segments[0] && String(segments[0] || "").trim().toLowerCase() === "index.html") {
      segments = segments.slice(1);
    }
    if (!segments.length) return { restaurantId: "", topTab: "" };
    const tailSegments = segments.length > 2 ? segments.slice(-2) : segments.slice();
    const first = String(tailSegments[0] || "").trim();
    const second = String(tailSegments[1] || "").trim();
    const firstTopTab = normalizeTopTabFromPathSegment(first);
    const secondTopTab = normalizeTopTabFromPathSegment(second);
    const firstSlug = normalizePathRestaurantSlug(first);
    const secondSlug = normalizePathRestaurantSlug(second);
    if (tailSegments.length === 1 && firstSlug) {
      return {
        restaurantId: firstSlug,
        topTab: ""
      };
    }
    if (tailSegments.length >= 2 && firstTopTab && secondSlug) {
      return {
        restaurantId: secondSlug,
        topTab: firstTopTab
      };
    }
    if (tailSegments.length >= 2 && secondTopTab && firstSlug) {
      return {
        restaurantId: firstSlug,
        topTab: secondTopTab
      };
    }
    return { restaurantId: "", topTab: "" };
  };

  const routeRestaurantId = (
    readQuery("r")
    || readQuery("restaurant")
    || readQuery("restaurantId")
    || readQuery("rid")
    || readQuery("businessId")
    || ""
  );
  const pathProfileRoute = routeRestaurantId
    ? { restaurantId: "", topTab: "" }
    : resolvePathProfileRoute(readPathname);
  const landingSlug = routeRestaurantId ? "" : pathProfileRoute.restaurantId;
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
    ? (profileTopQuery || pathProfileRoute.topTab || fallbackProfileTopTab)
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
