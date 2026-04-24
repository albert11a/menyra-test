import {
  normalizePublicBusinessSlugCore
} from "./public-business-route-utils.js";

const LAUNCH_PUBLIC_BUSINESS_ROUTE_ALIASES = Object.freeze({
  casarita: "Lzm6RpNu3ErSDtGCHxpi",
  "casa-rita": "Lzm6RpNu3ErSDtGCHxpi"
});

const LAUNCH_PUBLIC_BUSINESS_CANONICAL_SLUGS = Object.freeze({
  lzm6rpnu3ersdtgchxpi: "casarita"
});

function safeText(value = "") {
  return String(value || "").trim();
}

function safeLowerText(value = "") {
  return safeText(value).toLowerCase();
}

function normalizeRouteSlug(value = "") {
  return normalizePublicBusinessSlugCore(value || "", { allowReserved: false });
}

function normalizeRouteStatus(value = "") {
  const status = safeLowerText(value);
  if (status === "active") return "active";
  if (status === "redirect") return "redirect";
  if (status === "inactive") return "inactive";
  if (status === "not-found" || status === "notfound") return "not-found";
  if (status === "fallback") return "fallback";
  return "active";
}

function looksLikeDirectRestaurantId(value = "") {
  const raw = safeText(value);
  if (!raw) return false;
  if (LAUNCH_PUBLIC_BUSINESS_CANONICAL_SLUGS[raw.toLowerCase()]) return true;
  const compact = raw.replace(/[^A-Za-z0-9]/g, "");
  return compact.length >= 16 && /[A-Z]/.test(raw) && /\d/.test(raw);
}

function resolveLaunchAlias(inputSlug = "") {
  const slug = normalizeRouteSlug(inputSlug);
  if (!slug) return null;
  const restaurantId = LAUNCH_PUBLIC_BUSINESS_ROUTE_ALIASES[slug] || "";
  if (!restaurantId) return null;
  const canonicalSlug = LAUNCH_PUBLIC_BUSINESS_CANONICAL_SLUGS[restaurantId.toLowerCase()] || slug;
  return {
    found: true,
    status: slug === canonicalSlug ? "active" : "redirect",
    inputSlug: slug,
    canonicalSlug,
    restaurantId,
    source: "launch-alias"
  };
}

function resolveDirectRestaurantId(input = "") {
  const raw = safeText(input);
  if (!looksLikeDirectRestaurantId(raw)) return null;
  const canonicalSlug = LAUNCH_PUBLIC_BUSINESS_CANONICAL_SLUGS[raw.toLowerCase()] || normalizeRouteSlug(raw);
  return {
    found: true,
    status: "fallback",
    inputSlug: normalizeRouteSlug(raw),
    canonicalSlug,
    restaurantId: raw,
    source: "direct-id"
  };
}

function normalizePublicRouteDoc(inputSlug = "", doc = null) {
  const input = normalizeRouteSlug(inputSlug);
  if (!doc || typeof doc !== "object") return null;
  const data = doc.data && typeof doc.data === "object" ? doc.data : doc;
  const status = normalizeRouteStatus(data.status || "active");
  const restaurantId = safeText(data.restaurantId || data.canonicalRestaurantId || "");
  const canonicalSlug = normalizeRouteSlug(data.canonicalSlug || data.slug || input);
  if (!restaurantId || !canonicalSlug) return {
    found: false,
    status: "not-found",
    inputSlug: input,
    canonicalSlug: "",
    restaurantId: "",
    source: "firestore"
  };
  return {
    found: status !== "inactive" && status !== "not-found",
    status,
    inputSlug: input,
    canonicalSlug,
    restaurantId,
    source: "firestore"
  };
}

export function createEmptyPublicBusinessRouteResolution(inputSlug = "") {
  const slug = normalizeRouteSlug(inputSlug);
  return {
    found: false,
    status: "not-found",
    inputSlug: slug,
    canonicalSlug: "",
    restaurantId: "",
    source: "none"
  };
}

export function resolveLaunchPublicBusinessRouteCore(inputSlug = "") {
  return resolveLaunchAlias(inputSlug)
    || resolveDirectRestaurantId(inputSlug)
    || createEmptyPublicBusinessRouteResolution(inputSlug);
}

export async function resolvePublicBusinessRouteCore(inputSlug = "", {
  readPublicRouteDoc = null,
  preferFirestore = true
} = {}) {
  const slug = normalizeRouteSlug(inputSlug);
  if (!slug && !safeText(inputSlug)) return createEmptyPublicBusinessRouteResolution(inputSlug);

  if (preferFirestore && typeof readPublicRouteDoc === "function" && slug) {
    try {
      const doc = await readPublicRouteDoc(slug);
      const normalized = normalizePublicRouteDoc(slug, doc);
      if (normalized?.restaurantId) return normalized;
    } catch {}
  }

  const fallback = resolveLaunchAlias(slug || inputSlug) || resolveDirectRestaurantId(inputSlug);
  if (fallback) return fallback;

  if (!preferFirestore && typeof readPublicRouteDoc === "function" && slug) {
    try {
      const doc = await readPublicRouteDoc(slug);
      const normalized = normalizePublicRouteDoc(slug, doc);
      if (normalized?.restaurantId) return normalized;
    } catch {}
  }

  return createEmptyPublicBusinessRouteResolution(inputSlug);
}

export function normalizePublicBusinessRouteResolutionCore(resolution = null) {
  if (!resolution || typeof resolution !== "object") {
    return createEmptyPublicBusinessRouteResolution("");
  }
  const inputSlug = normalizeRouteSlug(resolution.inputSlug || "");
  const canonicalSlug = normalizeRouteSlug(resolution.canonicalSlug || resolution.slug || "");
  const restaurantId = safeText(resolution.restaurantId || resolution.canonicalRestaurantId || "");
  const status = normalizeRouteStatus(resolution.status || (restaurantId ? "active" : "not-found"));
  return {
    found: !!restaurantId && status !== "inactive" && status !== "not-found",
    status,
    inputSlug,
    canonicalSlug,
    restaurantId,
    source: safeText(resolution.source || "none") || "none"
  };
}
