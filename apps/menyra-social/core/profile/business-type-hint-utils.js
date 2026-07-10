export const BUSINESS_TYPE_HINT_UTILS_VERSION = "business-type-hint-utils.v1";

export const BUSINESS_TYPE_HINT_STORAGE_KEY = "menyra_social_business_type_hint_v1";

function asText(value = "") {
  if (value == null) return "";
  return String(value).trim();
}

// Stabile Schluessel fuer den Typ-Hinweis: primaer die restaurantId, zusaetzlich
// der oeffentliche Slug - damit ein Deep-Link ueber den Slug (noch ohne geladene
// restaurantId) trotzdem sofort den bekannten Business-Typ findet.
export function businessTypeHintKeysCore(profile = {}) {
  const source = profile && typeof profile === "object" ? profile : {};
  const keys = [];
  const restaurantId = asText(source.restaurantId || source.canonicalRestaurantId || source.landingRestaurantId);
  const slug = asText(source.publicSlug || source.landingSlug).toLowerCase();
  if (restaurantId) keys.push(`r:${restaurantId}`);
  if (slug) keys.push(`s:${slug}`);
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
