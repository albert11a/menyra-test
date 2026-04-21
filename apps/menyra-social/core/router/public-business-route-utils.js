const RESERVED_PUBLIC_ROUTE_SEGMENTS = new Set([
  "b",
  "admin",
  "ceo",
  "owner",
  "staff",
  "waiter",
  "wr",
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
  "posts",
  "story",
  "stories",
  "menu",
  "search",
  "discover",
  "map",
  "location",
  "orders",
  "notifications",
  "settings",
  "upload",
  "leads",
  "customers",
  "businessaccounts",
  "menyra-restaurants",
  "lp",
  "index.html",
  "assets",
  "_shared",
  "core",
  "lead-landing"
]);

function safeLowerText(value = "") {
  return String(value || "").trim().toLowerCase();
}

export function normalizePublicBusinessTopTabCore(value = "", fallback = "profile") {
  const topTab = safeLowerText(value);
  if (topTab === "menu" || topTab === "karte" || topTab === "speisekarte" || topTab === "shop") return "menu";
  if (topTab === "qr" || topTab === "menuqr" || topTab === "scan-qr" || topTab === "scanqr") return "menu";
  if (topTab === "profile" || topTab === "posts" || topTab === "home" || topTab === "overview") return "profile";
  if (topTab === "landing" || topTab === "welcome" || topTab === "onboarding") return "landing";
  if (topTab === "cart" || topTab === "basket" || topTab === "warenkorb") return "cart";
  return safeLowerText(fallback) || "profile";
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
  let slug = String(value || "").trim().toLowerCase();
  if (!slug) return "";
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
  if (!allowReserved && RESERVED_PUBLIC_ROUTE_SEGMENTS.has(slug)) return "";
  return slug;
}

function extractSlugFromCanonicalPath(path = "") {
  const safePath = String(path || "").trim();
  if (!safePath) return "";
  const segments = safePath.replace(/^\/+|\/+$/g, "").split("/").filter(Boolean);
  if (safeLowerText(segments[0]) !== "b") return "";
  return normalizePublicBusinessSlugCore(segments[1] || "");
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
    const slug = normalizePublicBusinessSlugCore(candidate || "");
    if (slug) return slug;
  }
  return "";
}

function normalizeLegacyPathRestaurantSlug(value = "") {
  const raw = String(value || "").trim();
  if (!raw) return "";
  if (raw.includes(".")) return "";
  return normalizePublicBusinessSlugCore(raw || "");
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
      accessSource: ""
    };
  }

  if (safeLowerText(segments[0]) === "b") {
    const slug = normalizePublicBusinessSlugCore(segments[1] || "");
    if (!slug) {
      return {
        matched: false,
        isCanonical: false,
        isLegacy: false,
        restaurantId: "",
        topTab: "",
        accessSource: ""
      };
    }
    const surfaceSegment = safeLowerText(segments[2] || "");
    if (!surfaceSegment) {
      return {
        matched: true,
        isCanonical: true,
        isLegacy: false,
        restaurantId: slug,
        topTab: "profile",
        accessSource: ""
      };
    }
    if (surfaceSegment === "menu") {
      return {
        matched: true,
        isCanonical: true,
        isLegacy: false,
        restaurantId: slug,
        topTab: "menu",
        accessSource: ""
      };
    }
    if (surfaceSegment === "posts" || surfaceSegment === "profile") {
      return {
        matched: true,
        isCanonical: true,
        isLegacy: false,
        restaurantId: slug,
        topTab: "profile",
        accessSource: ""
      };
    }
    if (surfaceSegment === "qr") {
      return {
        matched: true,
        isCanonical: true,
        isLegacy: false,
        restaurantId: slug,
        topTab: "menu",
        accessSource: "qr"
      };
    }
  }

  if (!allowLegacyRootSlug) {
    return {
      matched: false,
      isCanonical: false,
      isLegacy: false,
      restaurantId: "",
      topTab: "",
      accessSource: ""
    };
  }

  const tailSegments = segments.length > 2 ? segments.slice(-2) : segments.slice();
  const first = String(tailSegments[0] || "").trim();
  const second = String(tailSegments[1] || "").trim();
  const firstTopTab = normalizePublicBusinessTopTabCore(first, "");
  const secondTopTab = normalizePublicBusinessTopTabCore(second, "");
  const firstQrHint = isQrLikePublicBusinessAccessSourceCore(first);
  const secondQrHint = isQrLikePublicBusinessAccessSourceCore(second);
  const firstSlug = normalizeLegacyPathRestaurantSlug(first);
  const secondSlug = normalizeLegacyPathRestaurantSlug(second);

  if (tailSegments.length === 1 && firstSlug) {
    return {
      matched: true,
      isCanonical: false,
      isLegacy: true,
      restaurantId: firstSlug,
      topTab: "profile",
      accessSource: ""
    };
  }
  if (tailSegments.length >= 2 && firstTopTab && secondSlug) {
    return {
      matched: true,
      isCanonical: false,
      isLegacy: true,
      restaurantId: secondSlug,
      topTab: firstTopTab,
      accessSource: firstQrHint ? "qr" : ""
    };
  }
  if (tailSegments.length >= 2 && secondTopTab && firstSlug) {
    return {
      matched: true,
      isCanonical: false,
      isLegacy: true,
      restaurantId: firstSlug,
      topTab: secondTopTab,
      accessSource: secondQrHint ? "qr" : ""
    };
  }

  return {
    matched: false,
    isCanonical: false,
    isLegacy: false,
    restaurantId: "",
    topTab: "",
    accessSource: ""
  };
}

export function buildCanonicalPublicBusinessPathCore({
  slug = "",
  topTab = "",
  contentTab = ""
} = {}) {
  const safeSlug = normalizePublicBusinessSlugCore(slug || "");
  if (!safeSlug) return "";
  const safeTopTab = normalizePublicBusinessTopTabCore(topTab || "", "profile");
  const basePath = `/b/${encodeURIComponent(safeSlug)}`;
  if (safeTopTab === "menu") return `${basePath}/menu`;
  return basePath;
}
