function isBrowserRuntime() {
  return typeof window !== "undefined"
    && typeof document !== "undefined"
    && typeof location !== "undefined";
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
    await import("/apps/menyra-social/core/router/public-route-cache-early-preload.js?v=2026-04-24-public-routes-01");
  } catch {}
}
