export const BUSINESS_TYPE_HINT_UTILS_VERSION = "business-type-hint-utils.v1";

export const BUSINESS_TYPE_HINT_STORAGE_KEY = "menyra_social_business_type_hint_v1";

function asText(value = "") {
  if (value == null) return "";
  return String(value).trim();
}

// Stabile Schluessel fuer den Typ-Hinweis: primaer die restaurantId, zusaetzlich
// der oeffentliche Slug - damit ein Deep-Link ueber den Slug (noch ohne geladene
// restaurantId) trotzdem sofort den bekannten Business-Typ findet.
// extraSlugs erlaubt beim LESEN einen Fallback auf den Slug aus der URL, weil
// das frueh gerenderte Cold-Start-Profil oft noch gar keine Identitaetsfelder
// traegt (weder restaurantId noch publicSlug).
export function businessTypeHintKeysCore(profile = {}, { extraSlugs = [] } = {}) {
  const source = profile && typeof profile === "object" ? profile : {};
  const keys = [];
  const addKey = (key = "") => {
    if (key && !keys.includes(key)) keys.push(key);
  };
  [source.restaurantId, source.canonicalRestaurantId, source.landingRestaurantId]
    .map((value) => asText(value))
    .filter(Boolean)
    .forEach((restaurantId) => addKey(`r:${restaurantId}`));
  [source.publicSlug, source.landingSlug, source.handle, source.slug, source.businessSlug]
    .map((value) => asText(value).replace(/^@+/, "").toLowerCase())
    .filter(Boolean)
    .forEach((slug) => addKey(`s:${slug}`));
  (Array.isArray(extraSlugs) ? extraSlugs : [])
    .map((value) => asText(value).replace(/^@+/, "").toLowerCase())
    .filter(Boolean)
    .forEach((slug) => addKey(`s:${slug}`));
  return keys;
}

export function readBusinessTypeHintCore(store = {}, keys = []) {
  const safeStore = store && typeof store === "object" ? store : {};
  for (const key of Array.isArray(keys) ? keys : []) {
    const value = asText(safeStore[key]).toLowerCase();
    if (value) return value;
  }
  return "";
}

// Schreibt den Typ auf alle Identitaets-Schluessel und meldet, ob sich am Store
// etwas geaendert hat (damit der Aufrufer nur bei Bedarf persistiert).
export function writeBusinessTypeHintCore(store = {}, keys = [], type = "") {
  const safeStore = store && typeof store === "object" ? { ...store } : {};
  const safeType = asText(type).toLowerCase();
  if (!safeType || !Array.isArray(keys) || !keys.length) {
    return { store: safeStore, changed: false };
  }
  let changed = false;
  keys.forEach((key) => {
    if (safeStore[key] !== safeType) {
      safeStore[key] = safeType;
      changed = true;
    }
  });
  return { store: safeStore, changed };
}

// Live-Typ hat Vorrang (Korrektheit); nur wenn er noch unbekannt ist, greift der
// persistierte Hinweis - so verschwindet das kurze Aufblitzen des falschen Tabs.
export function resolveStableBusinessTypeCore(liveType = "", hintType = "") {
  const live = asText(liveType).toLowerCase();
  if (live) return live;
  return asText(hintType).toLowerCase();
}

// Hotels/Motels tragen ihren Katalog-Tab im Pfad ("/musterhotel/details").
// Dieses Signal ist beim Cold Start ab dem ersten Paint synchron verfuegbar -
// noch bevor Profil, Meta oder localStorage-Hinweis greifbar sind.
const ROUTE_DETAILS_CATALOG_SEGMENTS = new Set(["details", "detail", "detajet"]);

export function routePathHasDetailsCatalogSegmentCore(pathname = "") {
  const segments = String(pathname || "")
    .split("?")[0]
    .split("#")[0]
    .replace(/^\/+|\/+$/g, "")
    .split("/")
    .filter(Boolean)
    .map((segment) => {
      try {
        return decodeURIComponent(segment).trim().toLowerCase();
      } catch {
        return String(segment || "").trim().toLowerCase();
      }
    });
  return segments.some((segment) => ROUTE_DETAILS_CATALOG_SEGMENTS.has(segment));
}

// Das Routen-Signal darf nur fuer das Profil gelten, das die Route meint:
// entweder traegt das (Cold-Start-)Profil noch keine Identitaet, oder einer
// seiner Slugs entspricht dem Slug aus der URL.
export function profileMatchesBusinessRouteSlugCore(profile = {}, routeSlug = "") {
  const safeRouteSlug = asText(routeSlug).replace(/^@+/, "").toLowerCase();
  if (!safeRouteSlug) return false;
  const source = profile && typeof profile === "object" ? profile : {};
  const candidates = [source.publicSlug, source.landingSlug, source.handle, source.slug, source.businessSlug]
    .map((value) => asText(value).replace(/^@+/, "").toLowerCase())
    .filter(Boolean);
  if (!candidates.length) return true;
  return candidates.includes(safeRouteSlug);
}
