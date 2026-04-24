import { db } from "/shared/firebase-config.js?v=2026-03-10-startup-1";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  where
} from "/shared/vendor/firebase/11.0.0/firebase-firestore.js";

const PUBLIC_ROUTE_CACHE_GLOBAL_KEY = "__MENYRA_PUBLIC_ROUTE_RESOLUTIONS__";
const PUBLIC_ROUTE_EARLY_PRELOAD_DONE_KEY = "__MENYRA_PUBLIC_ROUTE_EARLY_PRELOAD_DONE__";
const PUBLIC_ROUTE_EARLY_PRELOAD_TIMEOUT_MS = 850;
const RESTAURANT_SLUG_FIELDS = Object.freeze([
  "publicSlug",
  "landingSlug",
  "businessSlug",
  "routeSlug",
  "slug",
  "handle"
]);

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

function readQuerySlug() {
  try {
    const params = new URLSearchParams(globalThis?.location?.search || "");
    const keys = ["r", "restaurant", "restaurantId", "rid", "businessId"];
    for (const key of keys) {
      const slug = normalizeSlug(params.get(key) || "");
      if (slug) return slug;
    }
  } catch {}
  return "";
}

function readPathSlug() {
  try {
    const pathname = safeText(globalThis?.location?.pathname || "");
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
    const reserved = new Set([
      "feed", "search", "discover", "map", "location", "user", "waiter", "wr", "leads",
      "admin", "ceo", "owner", "staff", "kitchen", "profile", "menu", "orders", "notifications",
      "settings", "upload", "customers", "business-accounts", "businessaccounts", "chat", "social",
      "heart", "hub", "apps", "api", "shared", "assets", "_shared", "core", "login", "register",
      "post", "posts", "story", "stories", "manifest-webmanifest", "manifest", "sw", "favicon", "robots", "sitemap"
    ]);
    const slug = normalizeSlug(first);
    if (!slug || reserved.has(slug)) return "";
    return slug;
  } catch {}
  return "";
}

function collectSlugs() {
  const slugs = [];
  const add = (value = "") => {
    const slug = normalizeSlug(value);
    if (slug && !slugs.includes(slug)) slugs.push(slug);
  };
  add(readPathSlug());
  add(readQuerySlug());
  return slugs;
}

function normalizeStatus(value = "") {
  const status = safeText(value).toLowerCase();
  if (status === "redirect") return "redirect";
  if (status === "inactive") return "inactive";
  if (status === "not-found" || status === "notfound") return "not-found";
  return "active";
}

function resolveCanonicalSlugFromRestaurant(slug = "", data = null) {
  const safeData = data && typeof data === "object" ? data : {};
  for (const field of ["canonicalSlug", ...RESTAURANT_SLUG_FIELDS]) {
    const candidate = normalizeSlug(safeData[field] || "");
    if (candidate) return candidate;
  }
  return normalizeSlug(slug);
}

function normalizeRouteDoc(slug = "", data = null) {
  if (!data || typeof data !== "object") return null;
  const restaurantId = safeText(data.restaurantId || data.canonicalRestaurantId || "");
  const canonicalSlug = normalizeSlug(data.canonicalSlug || data.slug || slug);
  const status = normalizeStatus(data.status || "active");
  if (!restaurantId || !canonicalSlug) return null;
  return {
    found: status !== "inactive" && status !== "not-found",
    status,
    inputSlug: slug,
    canonicalSlug,
    restaurantId,
    source: "publicRoutes"
  };
}

function normalizeRestaurantDoc(slug = "", snapshot = null) {
  if (!snapshot) return null;
  try {
    const data = typeof snapshot.data === "function" ? snapshot.data() : null;
    if (!data || typeof data !== "object") return null;
    const restaurantId = safeText(data.restaurantId || data.id || snapshot.id || "");
    const canonicalSlug = resolveCanonicalSlugFromRestaurant(slug, data);
    const status = normalizeStatus(data.publicRouteStatus || data.status || "active");
    if (!restaurantId || !canonicalSlug) return null;
    return {
      found: status !== "inactive" && status !== "not-found",
      status,
      inputSlug: slug,
      canonicalSlug,
      restaurantId,
      source: "restaurants"
    };
  } catch {
    return null;
  }
}

async function readPublicRoute(slug = "") {
  const safeSlug = normalizeSlug(slug);
  if (!safeSlug) return null;
  try {
    const snapshot = await getDoc(doc(db, "publicRoutes", safeSlug));
    if (!snapshot.exists()) return null;
    return normalizeRouteDoc(safeSlug, snapshot.data());
  } catch {
    return null;
  }
}

async function readRestaurantByDocId(slug = "") {
  const safeSlug = normalizeSlug(slug);
  if (!safeSlug) return null;
  try {
    const snapshot = await getDoc(doc(db, "restaurants", safeSlug));
    if (!snapshot.exists()) return null;
    return normalizeRestaurantDoc(safeSlug, snapshot);
  } catch {
    return null;
  }
}

async function readRestaurantBySlugField(slug = "") {
  const safeSlug = normalizeSlug(slug);
  if (!safeSlug) return null;
  for (const field of RESTAURANT_SLUG_FIELDS) {
    try {
      const exactSnapshot = await getDocs(query(
        collection(db, "restaurants"),
        where(field, "==", safeSlug),
        limit(1)
      ));
      const exactDoc = exactSnapshot?.docs?.[0] || null;
      const exactResolution = normalizeRestaurantDoc(safeSlug, exactDoc);
      if (exactResolution?.found && exactResolution.restaurantId) return exactResolution;
    } catch {}
    try {
      const rawSnapshot = await getDocs(query(
        collection(db, "restaurants"),
        where(field, "==", slug),
        limit(1)
      ));
      const rawDoc = rawSnapshot?.docs?.[0] || null;
      const rawResolution = normalizeRestaurantDoc(safeSlug, rawDoc);
      if (rawResolution?.found && rawResolution.restaurantId) return rawResolution;
    } catch {}
  }
  return null;
}

async function readRestaurantRoute(slug = "") {
  return await readRestaurantByDocId(slug)
    || await readRestaurantBySlugField(slug);
}

async function readCanonicalPublicRoute(slug = "") {
  return await readPublicRoute(slug)
    || await readRestaurantRoute(slug);
}

async function preloadEarlyPublicRouteCache() {
  const slugs = collectSlugs();
  if (!slugs.length) return [];
  const cache = ensurePublicRouteCache();
  const results = [];
  for (const slug of slugs) {
    const resolution = await Promise.race([
      readCanonicalPublicRoute(slug),
      new Promise((resolve) => setTimeout(() => resolve(null), PUBLIC_ROUTE_EARLY_PRELOAD_TIMEOUT_MS))
    ]);
    if (!resolution?.found || !resolution.restaurantId) continue;
    cache.set(slug, resolution);
    cache.set(resolution.canonicalSlug, resolution);
    cache.set(resolution.restaurantId, resolution);
    results.push(resolution);
  }
  return results;
}

try {
  if (!globalThis?.[PUBLIC_ROUTE_EARLY_PRELOAD_DONE_KEY]) {
    globalThis[PUBLIC_ROUTE_EARLY_PRELOAD_DONE_KEY] = true;
    await preloadEarlyPublicRouteCache();
  }
} catch {}
