import { db } from "/shared/firebase-config.js?v=2026-03-10-startup-1";
import {
  doc,
  getDoc
} from "/shared/vendor/firebase/11.0.0/firebase-firestore.js";
import { createPublicRouteDocReaderCore } from "./public-route-doc-reader.js";
import { resolvePublicBusinessRouteCore } from "./public-business-route-resolver.js";
import {
  normalizePublicBusinessSlugCore,
  parseSiteRoutePathCore
} from "./public-business-route-utils.js";

const PUBLIC_ROUTE_CACHE_GLOBAL_KEY = "__MENYRA_PUBLIC_ROUTE_RESOLUTIONS__";
const PUBLIC_ROUTE_PRELOAD_PROMISE_GLOBAL_KEY = "__MENYRA_PUBLIC_ROUTE_PRELOAD_PROMISE__";

function safeText(value = "") {
  return String(value || "").trim();
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

function normalizeSlug(value = "") {
  return normalizePublicBusinessSlugCore(value || "", { allowReserved: false });
}

function readQueryValue(keys = []) {
  try {
    const params = new URLSearchParams(globalThis?.location?.search || "");
    for (const key of keys) {
      const value = safeText(params.get(key) || "");
      if (value) return value;
    }
  } catch {}
  return "";
}

function resolveRouteSlugFromLocation() {
  try {
    const pathname = String(globalThis?.location?.pathname || "").trim();
    const route = parseSiteRoutePathCore(pathname);
    if (route?.kind === "business" || route?.kind === "landingBusiness") {
      const slug = normalizeSlug(route.restaurantId || "");
      if (slug) return slug;
    }
  } catch {}
  return "";
}

function resolveQuerySlugFromLocation() {
  return normalizeSlug(readQueryValue([
    "r",
    "restaurant",
    "restaurantId",
    "rid",
    "businessId"
  ]));
}

function collectPublicRoutePreloadSlugs() {
  const slugs = [];
  const add = (value = "") => {
    const slug = normalizeSlug(value);
    if (slug && !slugs.includes(slug)) slugs.push(slug);
  };
  add(resolveRouteSlugFromLocation());
  add(resolveQuerySlugFromLocation());
  return slugs;
}

async function preloadPublicRouteCacheCore() {
  const slugs = collectPublicRoutePreloadSlugs();
  if (!slugs.length) return [];
  const cache = ensurePublicRouteCache();
  const readPublicRouteDoc = createPublicRouteDocReaderCore({
    db,
    docFn: doc,
    getDocFn: getDoc
  });
  const results = [];
  for (const slug of slugs) {
    try {
      const resolution = await resolvePublicBusinessRouteCore(slug, {
        readPublicRouteDoc,
        preferFirestore: true
      });
      if (resolution?.found && resolution.restaurantId) {
        cache.set(slug, resolution);
        if (resolution.canonicalSlug) cache.set(resolution.canonicalSlug, resolution);
        if (resolution.restaurantId) cache.set(resolution.restaurantId, resolution);
        results.push(resolution);
      }
    } catch {}
  }
  return results;
}

export function preloadPublicRouteCache() {
  try {
    const existing = globalThis?.[PUBLIC_ROUTE_PRELOAD_PROMISE_GLOBAL_KEY];
    if (existing && typeof existing.then === "function") return existing;
    const promise = preloadPublicRouteCacheCore().catch(() => []);
    globalThis[PUBLIC_ROUTE_PRELOAD_PROMISE_GLOBAL_KEY] = promise;
    return promise;
  } catch {
    return Promise.resolve([]);
  }
}

void preloadPublicRouteCache();
