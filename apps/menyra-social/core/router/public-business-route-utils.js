import {
  isMarketplaceTabEnabled,
  resolveVisibleAppTab
} from "../../../../shared/config/marketplace-tabs.js";

const SYSTEM_ROUTE_SEGMENT_TO_TAB = Object.freeze({
  feed: "feed",
  restaurants: "restaurants",
  ofertat: "ofertat",
  "ofertat-biznes": "ofertatbiznes",
  // Mnyra GO: die Arbeitsseite des Lokals.
  "go-biznes": "gobiznes",
  "mnyra-go": "gobiznes",
  reklama: "reklama",
  travel: "travel",
  shopping: "shopping",
  search: "search",
  discover: "search",
  map: "map",
  location: "location",
  profile: "profile",
  owner: "profile",
  dashboard: "dashboard",
  menu: "menu",
  kitchen: "menu",
  orders: "orders",
  notifications: "notifications",
  settings: "settings",
  upload: "upload",
  staff: "staff",
  "business-accounts": "businessAccounts",
  businessaccounts: "businessAccounts",
  chat: "chat"
});

const CANONICAL_TAB_TO_PATH = Object.freeze({
  feed: "/feed",
  restaurants: "/restaurants",
  ofertat: "/ofertat",
  ofertatbiznes: "/ofertat-biznes",
  gobiznes: "/go-biznes",
  reklama: "/reklama",
  travel: "/travel",
  shopping: "/shopping",
  search: "/search",
  map: "/map",
  location: "/location",
  profile: "/profile",
  dashboard: "/dashboard",
  menu: "/menu",
  orders: "/orders",
  notifications: "/notifications",
  settings: "/settings",
  upload: "/upload",
  staff: "/staff",
  businessAccounts: "/business-accounts",
  chat: "/chat"
});

const RESERVED_PUBLIC_ROUTE_SEGMENTS = new Set([
  "b",
  "feed",
  "restaurants",
  "ofertat",
  "ofertat-biznes",
  "go-biznes",
  "mnyra-go",
  "reklama",
  "travel",
  "shopping",
  "search",
  "discover",
  "map",
  "location",
  "user",
  "waiter",
  "wr",
  "leads",
  "admin",
  "ceo",
  "owner",
  "staff",
  "kitchen",
  "profile",
  "dashboard",
  "menu",
  "details",
  "detail",
  "detajet",
  "orders",
  "notifications",
  "settings",
  "upload",
  "customers",
  "business-accounts",
  "businessaccounts",
  "chat",
  "social",
  "heart",
  "hub",
  "apps",
  "api",
  "shared",
  "assets",
  "_shared",
  "core",
  "login",
  "register",
  "post",
  "posts",
  "story",
  "stories",
  "lp",
  "lead-landing",
  "index.html",
  "manifest.webmanifest",
  "manifest.json",
  "sw.js",
  "favicon.ico",
  "robots.txt",
  "sitemap.xml",
  "menyra-restaurants"
]);

const BUSINESS_POST_SEGMENTS = new Set([
  "posts",
  "post",
  "profile",
  "home",
  "overview"
]);

// Hotel-/Motel-Profile nutzen fuer den Katalog-Tab den Pfad "/details" statt
// "/menu" (der Tab heisst dort "Details"). Beide Segment-Familien landen auf
// demselben internen Tab (topTab/contentTab "menu"), nur der kanonische Pfad
// unterscheidet sich je nach Business-Typ.
const BUSINESS_DETAILS_SEGMENTS = new Set([
  "details",
  "detail",
  "detajet"
]);

const BUSINESS_MENU_SEGMENTS = new Set([
  "menu",
  "karte",
  "speisekarte",
  "shop",
  "focus",
  "highlights",
  "highlight",
  ...BUSINESS_DETAILS_SEGMENTS
]);

const LAUNCH_PUBLIC_BUSINESS_ROUTE_ALIASES = Object.freeze({
  casarita: "Lzm6RpNu3ErSDtGCHxpi",
  "casa-rita": "Lzm6RpNu3ErSDtGCHxpi"
});

const LAUNCH_PUBLIC_BUSINESS_CANONICAL_SLUGS = Object.freeze({
  lzm6rpnu3ersdtgchxpi: "casarita"
});

function safeLowerText(value = "") {
  return String(value || "").trim().toLowerCase();
}

function safeDecodePathSegment(value = "") {
  const raw = String(value || "").trim();
  if (!raw) return "";
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

function isDotLikePathSegment(value = "") {
  return String(value || "").trim().includes(".");
}

function resolveLaunchPublicBusinessRouteId(value = "") {
  const key = safeLowerText(value);
  return LAUNCH_PUBLIC_BUSINESS_ROUTE_ALIASES[key] || String(value || "").trim();
}

function resolveLaunchPublicBusinessCanonicalSlug(value = "") {
  const raw = String(value || "").trim();
  const lookup = raw.toLowerCase();
  if (LAUNCH_PUBLIC_BUSINESS_CANONICAL_SLUGS[lookup]) return LAUNCH_PUBLIC_BUSINESS_CANONICAL_SLUGS[lookup];
  const normalized = normalizePublicBusinessSlugCore(raw || "");
  return LAUNCH_PUBLIC_BUSINESS_CANONICAL_SLUGS[normalized] || normalized;
}

function stripAppShellSegments(rawPath = "") {
  const safePath = String(rawPath || "").split("?")[0].split("#")[0].trim();
  if (!safePath) return [];
  let segments = safePath.replace(/^\/+|\/+$/g, "").split("/").filter(Boolean);
  if (!segments.length) return [];
  const appRootIndex = segments.findIndex((segment) => safeLowerText(segment) === "menyra-social");
  if (appRootIndex >= 0 && appRootIndex < segments.length - 1) {
    segments = segments.slice(appRootIndex + 1);
  }
  if (safeLowerText(segments[0]) === "index.html") {
    segments = segments.slice(1);
  }
  return segments;
}

function readCurrentMatchedPath(segments = []) {
  const list = Array.isArray(segments) ? segments : [];
  if (!list.length) return "/";
  return `/${list.map((segment) => encodeURIComponent(safeDecodePathSegment(segment))).join("/")}`;
}

function isReservedPublicRouteSegment(value = "") {
  return RESERVED_PUBLIC_ROUTE_SEGMENTS.has(safeLowerText(value));
}

export function getReservedPublicRouteSegmentsCore() {
  return Array.from(RESERVED_PUBLIC_ROUTE_SEGMENTS);
}

export function isReservedPublicRouteSegmentCore(value = "") {
  return isReservedPublicRouteSegment(value);
}

export function normalizeAppTabRouteCore(value = "", fallback = "") {
  const key = safeLowerText(value);
  if (!key) return safeLowerText(fallback);
  const aliases = {
    home: "feed",
    start: "feed",
    startseite: "feed",
    landing: "feed",
    login: "feed",
    register: "feed",
    discover: "search",
    owner: "profile",
    kitchen: "menu",
    "business-accounts": "businessAccounts",
    businessaccounts: "businessAccounts",
    "ofertat-biznes": "ofertatbiznes",
    "go-biznes": "gobiznes",
    "mnyra-go": "gobiznes"
  };
  const resolved = aliases[key] || key;
  const allowed = new Set(Object.keys(CANONICAL_TAB_TO_PATH));
  if (!allowed.has(resolved)) return safeLowerText(fallback);
  // Abgeschaltete Marktplatz-Tabs bleiben gueltige Routen, zeigen aber den
  // Restaurants-Tab, damit alte Links nicht ins Leere laufen.
  return resolveVisibleAppTab(resolved);
}

export function normalizePublicBusinessTopTabCore(value = "", fallback = "profile") {
  const topTab = safeLowerText(value);
  if (BUSINESS_MENU_SEGMENTS.has(topTab)) return "menu";
  if (topTab === "qr" || topTab === "menuqr" || topTab === "scan-qr" || topTab === "scanqr") return "menu";
  if (BUSINESS_POST_SEGMENTS.has(topTab)) return "profile";
  if (topTab === "landing" || topTab === "welcome" || topTab === "onboarding") return "landing";
  if (topTab === "cart" || topTab === "basket" || topTab === "warenkorb") return "cart";
  return safeLowerText(fallback) || "profile";
}

export function normalizePublicBusinessContentTabCore(value = "", fallback = "posts") {
  const contentTab = safeLowerText(value);
  if (BUSINESS_MENU_SEGMENTS.has(contentTab)) return "menu";
  if (BUSINESS_POST_SEGMENTS.has(contentTab)) return "posts";
  const safeFallback = safeLowerText(fallback);
  if (safeFallback === "menu" || safeFallback === "posts") return safeFallback;
  return "posts";
}

export function normalizePublicUserContentTabCore(value = "", fallback = "profile") {
  const contentTab = safeLowerText(value);
  if (contentTab === "posts" || contentTab === "post") return "posts";
  if (contentTab === "media" || contentTab === "photos" || contentTab === "videos") return "media";
  if (contentTab === "profile" || contentTab === "overview" || contentTab === "home") return "profile";
  const safeFallback = safeLowerText(fallback);
  if (safeFallback === "posts" || safeFallback === "media" || safeFallback === "profile") return safeFallback;
  return "profile";
}

export function isQrLikePublicBusinessAccessSourceCore(value = "") {
  const source = safeLowerText(value);
  return source === "qr"
    || source === "qrcode"
    || source === "qr-code"
    || source === "menuqr"
    || source === "menu-qr"
    || source === "scanqr"
    || source === "scan-qr";
}

export function normalizePublicBusinessSlugCore(value = "", {
  allowReserved = false
} = {}) {
  let slug = safeDecodePathSegment(value).toLowerCase();
  if (!slug) return "";
  if (isDotLikePathSegment(slug)) return "";
  try {
    if (typeof slug.normalize === "function") {
      slug = slug.normalize("NFKD").replace(/[\u0300-\u036f]/g, "");
    }
  } catch {}
  slug = slug
    .replace(/^@+/, "")
    .replace(/&/g, " and ")
    .replace(/['"`]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 72);
  if (!slug) return "";
  if (!allowReserved && isReservedPublicRouteSegment(slug)) return "";
  return slug;
}

export function normalizePublicUserRouteIdCore(value = "", {
  allowReserved = false
} = {}) {
  const raw = safeDecodePathSegment(value).replace(/^@+/, "").trim();
  if (!raw) return "";
  const compact = raw.replace(/[^A-Za-z0-9._-]+/g, "");
  if (!compact) return "";
  const safeValue = /^[A-Za-z0-9._-]{2,128}$/.test(raw)
    ? raw
    : raw
      .replace(/[^A-Za-z0-9._-]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 128);
  if (!safeValue) return "";
  const likelyUid = /[A-Z]/.test(safeValue) || safeValue.length >= 20;
  const normalized = likelyUid ? safeValue : safeValue.toLowerCase();
  if (!allowReserved && isReservedPublicRouteSegment(normalized)) return "";
  return normalized;
}

function extractSlugFromCanonicalPath(path = "") {
  const parsed = parsePublicBusinessRoutePathCore(path, {
    allowLegacyRootSlug: false
  });
  return parsed.matched ? resolveLaunchPublicBusinessCanonicalSlug(parsed.restaurantId || "") : "";
}

export function extractPublicBusinessSlugCore(source = {}, {
  includeDisplayFallback = false
} = {}) {
  const safeSource = source && typeof source === "object" ? source : {};
  const candidates = [
    safeSource.publicSlug,
    safeSource.businessSlug,
    safeSource.landingSlug,
    safeSource.slug,
    safeSource.routeSlug,
    extractSlugFromCanonicalPath(safeSource.canonicalPublicPath || ""),
    safeSource.handle
  ];
  if (includeDisplayFallback) {
    candidates.push(
      safeSource.name,
      safeSource.restaurantName,
      safeSource.businessName
    );
  }
  for (const candidate of candidates) {
    const slug = resolveLaunchPublicBusinessCanonicalSlug(candidate || "");
    if (slug) return slug;
  }
  return "";
}

export function extractPublicUserRouteIdCore(source = {}, {
  includeDisplayFallback = false
} = {}) {
  const safeSource = source && typeof source === "object" ? source : {};
  if (String(safeSource.restaurantId || "").trim()) return "";
  const candidates = [
    safeSource.userRouteId,
    safeSource.routeId,
    safeSource.uid,
    safeSource.handle
  ];
  if (includeDisplayFallback) {
    candidates.push(safeSource.name, safeSource.displayName);
  }
  for (const candidate of candidates) {
    const userId = normalizePublicUserRouteIdCore(candidate || "");
    if (userId) return userId;
  }
  return "";
}

export function parseSystemRoutePathCore(pathname = "") {
  const segments = stripAppShellSegments(pathname);
  const first = safeLowerText(segments[0] || "");
  if (!first || segments.length !== 1) {
    return {
      matched: false,
      kind: "unknown",
      tab: "",
      authMode: "",
      canonicalPath: "",
      aliasPath: ""
    };
  }
  if (first === "login" || first === "register") {
    return {
      matched: true,
      kind: "auth",
      tab: "feed",
      authMode: first,
      canonicalPath: `/${first}`,
      aliasPath: `/${first}`
    };
  }
  const requestedTab = SYSTEM_ROUTE_SEGMENT_TO_TAB[first] || "";
  const tab = normalizeAppTabRouteCore(requestedTab);
  if (tab) {
    // Wurde ein abgeschalteter Tab angefragt, muss auch der Pfad auf den
    // Ersatztab zeigen. Sonst bliebe die Adresszeile auf /travel bzw.
    // /shopping stehen, waehrend die App Restaurants rendert.
    const routePath = isMarketplaceTabEnabled(requestedTab)
      ? `/${first}`
      : (CANONICAL_TAB_TO_PATH[tab] || `/${first}`);
    return {
      matched: true,
      kind: "system",
      tab,
      authMode: "",
      canonicalPath: routePath,
      aliasPath: routePath
    };
  }
  if (isReservedPublicRouteSegment(first)) {
    return {
      matched: true,
      kind: "reserved",
      tab: "",
      authMode: "",
      canonicalPath: `/${first}`,
      aliasPath: `/${first}`
    };
  }
  return {
    matched: false,
    kind: "unknown",
    tab: "",
    authMode: "",
    canonicalPath: "",
    aliasPath: ""
  };
}

export function parsePublicUserRoutePathCore(pathname = "") {
  const segments = stripAppShellSegments(pathname);
  if (safeLowerText(segments[0] || "") !== "user") {
    return {
      matched: false,
      isCanonical: false,
      userId: "",
      contentTab: ""
    };
  }
  const userId = normalizePublicUserRouteIdCore(segments[1] || "");
  if (!userId) {
    return {
      matched: false,
      isCanonical: false,
      userId: "",
      contentTab: ""
    };
  }
  const surfaceSegment = safeLowerText(segments[2] || "");
  if (segments.length > 3) {
    return {
      matched: false,
      isCanonical: false,
      userId: "",
      contentTab: ""
    };
  }
  const contentTab = normalizePublicUserContentTabCore(surfaceSegment || "profile", "profile");
  if (surfaceSegment && !contentTab) {
    return {
      matched: false,
      isCanonical: false,
      userId: "",
      contentTab: ""
    };
  }
  return {
    matched: true,
    isCanonical: true,
    userId,
    contentTab: surfaceSegment ? contentTab : "profile"
  };
}

function parseCanonicalBusinessPathSegments(segments = []) {
  const first = safeLowerText(segments[0] || "");
  const rawSlug = safeDecodePathSegment(segments[1] || segments[0] || "");
  const slug = normalizePublicBusinessSlugCore(
    first === "b" ? rawSlug : safeDecodePathSegment(segments[0] || "")
  );
  const routeRestaurantId = resolveLaunchPublicBusinessRouteId(slug);
  if (!slug) {
    return {
      matched: false,
      isCanonical: false,
      isLegacy: false,
      restaurantId: "",
      topTab: "",
      contentTab: "",
      accessSource: ""
    };
  }
  const surfaceSegment = safeLowerText(first === "b" ? (segments[2] || "") : (segments[1] || ""));
  const surfaceSegmentsLength = first === "b" ? 3 : 2;
  if (segments.length > surfaceSegmentsLength && !surfaceSegment) {
    return {
      matched: false,
      isCanonical: false,
      isLegacy: false,
      restaurantId: "",
      topTab: "",
      contentTab: "",
      accessSource: ""
    };
  }
  if (!surfaceSegment) {
    return {
      matched: true,
      isCanonical: first !== "b",
      isLegacy: first === "b",
      restaurantId: routeRestaurantId,
      topTab: "profile",
      contentTab: "posts",
      accessSource: ""
    };
  }
  if (BUSINESS_MENU_SEGMENTS.has(surfaceSegment)) {
    return {
      matched: true,
      isCanonical: first !== "b",
      isLegacy: first === "b",
      restaurantId: routeRestaurantId,
      topTab: "menu",
      contentTab: "menu",
      catalogSegment: BUSINESS_DETAILS_SEGMENTS.has(surfaceSegment) ? "details" : "menu",
      accessSource: ""
    };
  }
  if (BUSINESS_POST_SEGMENTS.has(surfaceSegment)) {
    return {
      matched: true,
      isCanonical: first !== "b",
      isLegacy: first === "b",
      restaurantId: routeRestaurantId,
      topTab: "profile",
      contentTab: "posts",
      accessSource: ""
    };
  }
  if (surfaceSegment === "qr") {
    return {
      matched: true,
      isCanonical: false,
      isLegacy: true,
      restaurantId: routeRestaurantId,
      topTab: "menu",
      contentTab: "menu",
      accessSource: "qr"
    };
  }
  return {
    matched: false,
    isCanonical: false,
    isLegacy: false,
    restaurantId: "",
    topTab: "",
    contentTab: "",
    accessSource: ""
  };
}

function normalizeLegacyPathRestaurantSlug(value = "") {
  const raw = safeDecodePathSegment(value);
  if (!raw || isDotLikePathSegment(raw)) return "";
  return normalizePublicBusinessSlugCore(raw || "");
}

export function parsePublicBusinessRoutePathCore(pathname = "", {
  allowLegacyRootSlug = true
} = {}) {
  const segments = stripAppShellSegments(pathname);
  if (!segments.length) {
    return {
      matched: false,
      isCanonical: false,
      isLegacy: false,
      restaurantId: "",
      topTab: "",
      contentTab: "",
      accessSource: ""
    };
  }

  const first = safeLowerText(segments[0] || "");
  if (first === "b") {
    return parseCanonicalBusinessPathSegments(segments);
  }

  const canonicalRootBusiness = parseCanonicalBusinessPathSegments(segments);
  if (canonicalRootBusiness.matched) {
    return canonicalRootBusiness;
  }

  if (!allowLegacyRootSlug) {
    return {
      matched: false,
      isCanonical: false,
      isLegacy: false,
      restaurantId: "",
      topTab: "",
      contentTab: "",
      accessSource: ""
    };
  }

  const tailSegments = segments.length > 2 ? segments.slice(-2) : segments.slice();
  const rawFirst = safeDecodePathSegment(tailSegments[0] || "");
  const rawSecond = safeDecodePathSegment(tailSegments[1] || "");
  const firstTopTab = normalizePublicBusinessTopTabCore(rawFirst, "");
  const secondTopTab = normalizePublicBusinessTopTabCore(rawSecond, "");
  const firstQrHint = isQrLikePublicBusinessAccessSourceCore(rawFirst);
  const secondQrHint = isQrLikePublicBusinessAccessSourceCore(rawSecond);
  const firstSlug = normalizeLegacyPathRestaurantSlug(rawFirst);
  const secondSlug = normalizeLegacyPathRestaurantSlug(rawSecond);

  if (tailSegments.length === 1 && firstSlug) {
    return {
      matched: true,
      isCanonical: false,
      isLegacy: true,
      restaurantId: resolveLaunchPublicBusinessRouteId(firstSlug),
      topTab: "profile",
      contentTab: "posts",
      accessSource: ""
    };
  }
  if (tailSegments.length >= 2 && firstTopTab && secondSlug) {
    return {
      matched: true,
      isCanonical: false,
      isLegacy: true,
      restaurantId: resolveLaunchPublicBusinessRouteId(secondSlug),
      topTab: firstTopTab,
      contentTab: firstTopTab === "menu" ? "menu" : "posts",
      catalogSegment: BUSINESS_DETAILS_SEGMENTS.has(safeLowerText(rawFirst)) ? "details" : "menu",
      accessSource: firstQrHint ? "qr" : ""
    };
  }
  if (tailSegments.length >= 2 && secondTopTab && firstSlug) {
    return {
      matched: true,
      isCanonical: false,
      isLegacy: true,
      restaurantId: resolveLaunchPublicBusinessRouteId(firstSlug),
      topTab: secondTopTab,
      contentTab: secondTopTab === "menu" ? "menu" : "posts",
      catalogSegment: BUSINESS_DETAILS_SEGMENTS.has(safeLowerText(rawSecond)) ? "details" : "menu",
      accessSource: secondQrHint ? "qr" : ""
    };
  }

  return {
    matched: false,
    isCanonical: false,
    isLegacy: false,
    restaurantId: "",
    topTab: "",
    contentTab: "",
    accessSource: ""
  };
}

export function parseSiteRoutePathCore(pathname = "") {
  const segments = stripAppShellSegments(pathname);
  const systemRoute = parseSystemRoutePathCore(pathname);
  if (systemRoute.matched) {
    return {
      matched: true,
      kind: systemRoute.kind,
      tab: systemRoute.tab,
      authMode: systemRoute.authMode,
      canonicalPath: systemRoute.canonicalPath,
      routePath: systemRoute.aliasPath
    };
  }

  const userRoute = parsePublicUserRoutePathCore(pathname);
  if (userRoute.matched) {
    return {
      matched: true,
      kind: "user",
      tab: "profile",
      authMode: "",
      canonicalPath: buildCanonicalPublicUserPathCore({
        userId: userRoute.userId,
        contentTab: userRoute.contentTab
      }),
      routePath: readCurrentMatchedPath(segments),
      userId: userRoute.userId,
      userContentTab: userRoute.contentTab
    };
  }

  if (safeLowerText(segments[0] || "") === "lp" && segments[1]) {
    const restaurantId = safeDecodePathSegment(segments[1] || "").trim();
    if (restaurantId) {
      return {
        matched: true,
        kind: "landingBusiness",
        tab: "profile",
        authMode: "",
        canonicalPath: readCurrentMatchedPath(segments.slice(0, 2)),
        routePath: readCurrentMatchedPath(segments),
        restaurantId,
        profileTopTab: "landing",
        profileContentTab: "posts",
        accessSource: ""
      };
    }
  }

  const businessRoute = parsePublicBusinessRoutePathCore(pathname);
  if (businessRoute.matched) {
    return {
      matched: true,
      kind: "business",
      tab: "profile",
      authMode: "",
      canonicalPath: buildCanonicalPublicBusinessPathCore({
        slug: businessRoute.restaurantId,
        topTab: businessRoute.topTab,
        contentTab: businessRoute.contentTab,
        accessSource: businessRoute.accessSource,
        pathnameHint: readCurrentMatchedPath(segments),
        catalogSegment: businessRoute.catalogSegment || ""
      }),
      routePath: readCurrentMatchedPath(segments),
      restaurantId: businessRoute.restaurantId,
      profileTopTab: businessRoute.topTab,
      profileContentTab: businessRoute.contentTab,
      profileCatalogSegment: businessRoute.catalogSegment || "",
      accessSource: businessRoute.accessSource,
      isLegacy: businessRoute.isLegacy === true
    };
  }

  return {
    matched: false,
    kind: "unknown",
    tab: "",
    authMode: "",
    canonicalPath: "",
    routePath: ""
  };
}

export function buildCanonicalAppTabPathCore(tab = "", {
  pathnameHint = "",
  preserveCurrentAlias = true
} = {}) {
  const safeTab = normalizeAppTabRouteCore(tab || "", "feed");
  if (!safeTab) return "/feed";
  const currentRoute = preserveCurrentAlias
    ? parseSystemRoutePathCore(pathnameHint)
    : { matched: false, kind: "unknown", tab: "", canonicalPath: "" };
  if (currentRoute.matched && currentRoute.kind === "system" && currentRoute.tab === safeTab) {
    return currentRoute.canonicalPath || CANONICAL_TAB_TO_PATH[safeTab] || "/feed";
  }
  return CANONICAL_TAB_TO_PATH[safeTab] || "/feed";
}

export function buildCanonicalPublicBusinessPathCore({
  slug = "",
  topTab = "",
  contentTab = "",
  accessSource = "",
  pathnameHint = "",
  forcePostsPath = false,
  catalogSegment = ""
} = {}) {
  const safeSlug = resolveLaunchPublicBusinessCanonicalSlug(slug || "");
  if (!safeSlug) return "";
  const safeTopTab = normalizePublicBusinessTopTabCore(topTab || "", "profile");
  const safeContentTab = normalizePublicBusinessContentTabCore(
    contentTab || (safeTopTab === "menu" ? "menu" : "posts"),
    safeTopTab === "menu" ? "menu" : "posts"
  );
  // Hotels/Motels tragen im kanonischen Pfad "/details" statt "/menu".
  const safeCatalogSegment = BUSINESS_DETAILS_SEGMENTS.has(safeLowerText(catalogSegment))
    ? "details"
    : "menu";
  const basePath = `/${encodeURIComponent(safeSlug)}`;
  if (safeTopTab === "menu" || safeContentTab === "menu") return `${basePath}/${safeCatalogSegment}`;
  if (isQrLikePublicBusinessAccessSourceCore(accessSource)) return `${basePath}/${safeCatalogSegment}`;
  void pathnameHint;
  void forcePostsPath;
  return basePath;
}

// Entscheidet das Katalog-Pfadsegment anhand des Business-Typs:
// Hotels/Motels -> "details", alle anderen -> "menu".
export function resolveCatalogRouteSegmentForBusinessTypeCore(type = "") {
  const key = safeLowerText(type);
  return key === "hotel" || key === "motel" ? "details" : "menu";
}

export function isDetailsCatalogRouteSegmentCore(value = "") {
  return BUSINESS_DETAILS_SEGMENTS.has(safeLowerText(value));
}

export function buildCanonicalPublicUserPathCore({
  userId = "",
  contentTab = "",
  pathnameHint = ""
} = {}) {
  const safeUserId = normalizePublicUserRouteIdCore(userId || "");
  if (!safeUserId) return "";
  const safeContentTab = normalizePublicUserContentTabCore(contentTab || "", "profile");
  const basePath = `/user/${encodeURIComponent(safeUserId)}`;
  if (safeContentTab === "media") return `${basePath}/media`;
  const currentPath = safeLowerText(pathnameHint);
  if (safeContentTab === "posts" && currentPath.endsWith("/posts")) {
    return `${basePath}/posts`;
  }
  return basePath;
}
