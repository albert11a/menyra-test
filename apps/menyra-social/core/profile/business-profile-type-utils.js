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

  if (!profile?.restaurantId) return "";
  const rest = getRestaurantMetaById(profile.restaurantId);
  const typeRaw = rest?.type
    || rest?.customerType
    || rest?.businessType
    || rest?.category
    || rest?.kind
    || rest?.restaurantType
    || profile?.type
    || profile?.customerType
    || profile?.businessType
    || profile?.category
    || profile?.kind
    || profile?.restaurantType
    || "";
  return normalizeRestaurantType(typeRaw);
}
