function isBrowserRuntime() {
  return typeof window !== "undefined"
    && typeof document !== "undefined"
    && typeof location !== "undefined";
}

const PUBLIC_ROUTE_CACHE_GLOBAL_KEY = "__MENYRA_PUBLIC_ROUTE_RESOLUTIONS__";
const BOOTSTRAP_ROUTE_SEED_TIMEOUT_MS = 520;

function safeText(value = "") {
  return String(value || "").trim();
}

function normalizeSlug(value = "") {
  let slug = safeText(value).toLowerCase();
  if (!slug || slug.includes(".")) return "";
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
  return slug;
}

function ensurePublicRouteCache() {
  try {
    const current = globalThis?.[PUBLIC_ROUTE_CACHE_GLOBAL_KEY];
    if (current && typeof current.set === "function" && typeof current.get === "function") return current;
    const next = new Map();
    globalThis[PUBLIC_ROUTE_CACHE_GLOBAL_KEY] = next;
    return next;
  } catch {
    return new Map();
  }
}

function readCurrentRouteSlug() {
  if (!isBrowserRuntime()) return "";
  try {
    const pathname = safeText(window.location?.pathname || "");
    const segments = pathname.replace(/^\/+|\/+$/g, "").split("/").filter(Boolean);
    if (!segments.length) return "";
    const appRootIndex = segments.findIndex((segment) => safeText(segment).toLowerCase() === "menyra-social");
    const appSegments = appRootIndex >= 0 && appRootIndex < segments.length - 1
      ? segments.slice(appRootIndex + 1)
      : segments;
    if (!appSegments.length) return "";
    const first = safeText(appSegments[0]).toLowerCase();
    if (first === "b" && appSegments[1]) return normalizeSlug(appSegments[1]);
    if (first === "lp" && appSegments[1]) return normalizeSlug(appSegments[1]);
    return normalizeSlug(first);
  } catch {
    return "";
  }
}

function normalizeBootstrapRouteStatus(value = "") {
  const status = safeText(value).toLowerCase();
  if (status === "inactive" || status === "disabled" || status === "deleted" || status === "blocked" || status === "archived" || status === "private") {
    return "inactive";
  }
  if (status === "not-found" || status === "notfound") return "not-found";
  if (status === "preview" || status === "demo") return "preview";
  if (status === "lead" || status === "prospect") return "lead";
  if (status === "redirect") return "redirect";
  if (status === "fallback") return "fallback";
  return "active";
}

function isBootstrapRouteRoutable(status = "") {
  return status !== "inactive" && status !== "not-found";
}

function extractBootstrapRouteResolution(payload = null) {
  if (!payload || typeof payload !== "object") return null;
  const publicRoute = payload.publicRoute && typeof payload.publicRoute === "object"
    ? payload.publicRoute
    : {};
  const route = payload.route && typeof payload.route === "object"
    ? payload.route
    : (publicRoute.route && typeof publicRoute.route === "object" ? publicRoute.route : {});
  const restaurantId = safeText(
    route.canonicalRestaurantId
    || route.restaurantId
    || publicRoute.canonicalRestaurantId
    || publicRoute.restaurantId
    || payload?.businessPreview?.canonicalRestaurantId
    || payload?.businessPreview?.restaurantId
    || payload?.businessPreview?.id
    || ""
  );
  if (!restaurantId) return null;
  const currentSlug = readCurrentRouteSlug();
  const canonicalSlug = normalizeSlug(
    route.publicSlug
    || route.landingSlug
    || route.slug
    || publicRoute.publicSlug
    || publicRoute.landingSlug
    || publicRoute.slug
    || payload?.businessPreview?.publicSlug
    || payload?.businessPreview?.landingSlug
    || currentSlug
  );
  const inputSlug = normalizeSlug(route.slug || publicRoute.slug || currentSlug || canonicalSlug);
  const status = normalizeBootstrapRouteStatus(route.status || publicRoute.status || "active");
  return {
    found: isBootstrapRouteRoutable(status),
    status,
    inputSlug,
    canonicalSlug,
    restaurantId,
    source: "public-bootstrap"
  };
}

function seedPublicRouteCacheFromBootstrapPayload(payload = null) {
  const resolution = extractBootstrapRouteResolution(payload);
  if (!resolution?.found || !resolution.restaurantId) return false;
  const cache = ensurePublicRouteCache();
  const keys = [
    readCurrentRouteSlug(),
    resolution.inputSlug,
    resolution.canonicalSlug,
    resolution.restaurantId
  ].map((value) => safeText(value)).filter(Boolean);
  keys.forEach((key) => {
    cache.set(key, resolution);
    cache.set(key.toLowerCase(), resolution);
  });
  return true;
}

async function seedPublicRouteCacheFromBootstrap() {
  if (!isBrowserRuntime()) return false;
  try {
    if (seedPublicRouteCacheFromBootstrapPayload(window.__MENYRA_SOCIAL_BOOTSTRAP_PAYLOAD__)) {
      return true;
    }
    const promise = window.__MENYRA_SOCIAL_BOOTSTRAP_PROMISE__;
    if (!promise || typeof promise.then !== "function") return false;
    const payload = await Promise.race([
      promise.catch(() => null),
      new Promise((resolve) => {
        window.setTimeout(() => resolve(null), BOOTSTRAP_ROUTE_SEED_TIMEOUT_MS);
      })
    ]);
    return seedPublicRouteCacheFromBootstrapPayload(payload);
  } catch {
    return false;
  }
}

function shouldPreloadPublicRouteCache() {
  if (!isBrowserRuntime()) return false;
  try {
    const pathname = String(window.location?.pathname || "").trim();
    const search = String(window.location?.search || "").trim();
    if (/[?&](r|restaurant|restaurantId|rid|businessId)=/i.test(search)) return true;
    const segments = pathname.replace(/^\/+|\/+$/g, "").split("/").filter(Boolean);
    if (!segments.length) return false;
    const appRootIndex = segments.findIndex((segment) => String(segment || "").trim().toLowerCase() === "menyra-social");
    const appSegments = appRootIndex >= 0 && appRootIndex < segments.length - 1
      ? segments.slice(appRootIndex + 1)
      : segments;
    const first = String(appSegments[0] || "").trim().toLowerCase();
    if (!first) return false;
    const reserved = new Set([
      "feed", "search", "discover", "map", "location", "user", "waiter", "wr", "leads",
      "admin", "ceo", "owner", "staff", "kitchen", "profile", "menu", "orders", "notifications",
      "settings", "upload", "customers", "business-accounts", "businessaccounts", "chat", "social",
      "heart", "hub", "apps", "api", "shared", "assets", "_shared", "core", "login", "register",
      "post", "posts", "story", "stories", "manifest.webmanifest", "manifest", "sw", "favicon", "robots", "sitemap"
    ]);
    if (reserved.has(first)) return false;
    return !first.includes(".");
  } catch {
    return false;
  }
}

if (shouldPreloadPublicRouteCache()) {
  try {
    const seededFromBootstrap = await seedPublicRouteCacheFromBootstrap();
    if (!seededFromBootstrap) {
      await import("/apps/menyra-social/core/router/public-route-cache-early-preload.js?v=2026-04-24-public-routes-01");
    }
  } catch {}
}
