// Welche Lokale die oeffentliche Ansicht zeigen darf.
//
// Vorerst nur vier Kategorien: Restaurant, Cafe, Bar und Fastfood. Alles
// andere - Hotels, Tankstellen, Apotheken, Shops - bleibt draussen, bis es
// einzeln freigeschaltet wird.
//
// Freischalten geht im Leads-/Adminbereich: dort setzt ein Haken am Lokal das
// Merkmal publicOverrideEnabled. Dieses Merkmal steht ueber dem Kategoriefilter
// - ein so freigeschaltetes Hotel erscheint also oeffentlich, obwohl seine
// Kategorie gesperrt ist. Umgekehrt gilt das nicht: der Haken hebt weder eine
// Loeschung noch eine erzwungene Sperre auf, die liegen weiter davor.
//
// Bewusst pur: keine State-, DOM- oder Firestore-Zugriffe.

export const PUBLIC_BUSINESS_CATEGORY_KEYS = Object.freeze([
  "restaurant",
  "cafe",
  "bar",
  "fastfood"
]);

const PUBLIC_BUSINESS_CATEGORY_SET = new Set(PUBLIC_BUSINESS_CATEGORY_KEYS);

// Die Felder, in denen die Kategorie eines Lokals stehen kann. Gewachsen ueber
// mehrere Runden Datenmodell - deshalb so viele.
const BUSINESS_TYPE_FIELDS = Object.freeze([
  "type",
  "customerType",
  "category",
  "kind",
  "restaurantType",
  "businessType",
  "leadType"
]);

export function resolveBusinessCategoryKeyCore(rest = {}, {
  normalizeLeadTypeKeyFn
} = {}) {
  if (!rest || typeof rest !== "object") return "";
  const normalizeLeadTypeKey = typeof normalizeLeadTypeKeyFn === "function"
    ? normalizeLeadTypeKeyFn
    : ((value) => String(value || "").trim().toLowerCase());
  for (const field of BUSINESS_TYPE_FIELDS) {
    const raw = rest[field];
    if (typeof raw !== "string" && typeof raw !== "number") continue;
    const key = String(normalizeLeadTypeKey(raw) || "").trim().toLowerCase();
    if (key) return key;
  }
  return "";
}

// Der Haken aus dem Adminbereich. Nur ein echtes true zaehlt - ein fehlendes
// Feld ist kein "vielleicht".
export function isManuallyPublishedBusinessCore(rest = {}) {
  if (!rest || typeof rest !== "object") return false;
  return rest.publicOverrideEnabled === true;
}

export function isPublicBusinessCategoryCore(rest = {}, {
  normalizeLeadTypeKeyFn
} = {}) {
  const key = resolveBusinessCategoryKeyCore(rest, { normalizeLeadTypeKeyFn });
  return PUBLIC_BUSINESS_CATEGORY_SET.has(key);
}

// Ein Satz, der alles beantwortet, was der Adminbereich anzeigen will: welche
// Kategorie erkannt wurde, ob sie offen ist, ob von Hand freigeschaltet wurde
// und was am Ende gilt.
export function resolveBusinessPublicCategoryGateCore(rest = {}, {
  normalizeLeadTypeKeyFn
} = {}) {
  const categoryKey = resolveBusinessCategoryKeyCore(rest, { normalizeLeadTypeKeyFn });
  const allowedByCategory = PUBLIC_BUSINESS_CATEGORY_SET.has(categoryKey);
  const manuallyPublished = isManuallyPublishedBusinessCore(rest);
  return {
    categoryKey,
    allowedByCategory,
    manuallyPublished,
    isPubliclyListed: allowedByCategory || manuallyPublished
  };
}
