export function getBusinessProfileTypeCore(profile = {}, {
  getRestaurantMetaByIdFn,
  normalizeRestaurantTypeFn
} = {}) {
  const getRestaurantMetaById = typeof getRestaurantMetaByIdFn === "function"
    ? getRestaurantMetaByIdFn
    : (() => null);
  const normalizeRestaurantType = typeof normalizeRestaurantTypeFn === "function"
    ? normalizeRestaurantTypeFn
    : ((value) => String(value || "").trim());

  // Auch Profile, die nur die kanonische Restaurant-ID tragen (z.B. Snapshot/
  // Route-Seeds nach einem iOS-Resume), muessen ihren Typ aufloesen koennen -
  // sonst faellt ein Hotel-Profil faelschlich auf den Menu-Tab zurueck.
  const primaryId = String(profile?.restaurantId || "").trim();
  const canonicalId = String(profile?.canonicalRestaurantId || "").trim();
  if (!primaryId && !canonicalId) return "";
  const rest = (primaryId ? getRestaurantMetaById(primaryId) : null)
    || (canonicalId ? getRestaurantMetaById(canonicalId) : null);
  const typeRaw = rest?.type
    || rest?.customerType
    || rest?.category
    || rest?.kind
    || rest?.restaurantType
    || profile?.type
    || profile?.customerType
    || profile?.category
    || profile?.kind
    || profile?.restaurantType
    || "";
  return normalizeRestaurantType(typeRaw);
}
