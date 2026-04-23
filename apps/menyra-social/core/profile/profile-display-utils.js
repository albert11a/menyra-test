export function logoFitClassCore(isBusiness) {
  return isBusiness ? "object-contain bg-white" : "object-cover";
}

export function isLocalBusinessProfileCore(profile = null) {
  return !!profile?.restaurantId && profile?.role === "business";
}

export function isBusinessOwnerProfileCore(profile = null) {
  if (!profile?.restaurantId || profile?.role !== "business") return false;
  return String(profile?.sourceUserRole || "").trim().toLowerCase() !== "staff";
}

export function resolveProfileRestaurantIdCore(profile = null) {
  return String(
    profile?.restaurantId
    || profile?.waiterRestaurantId
    || profile?.staffRestaurantId
    || ""
  ).trim();
}

export function canAccessRestaurantOrdersCore(profile = null) {
  const restaurantId = resolveProfileRestaurantIdCore(profile);
  if (!restaurantId) return false;
  if (isBusinessOwnerProfileCore(profile)) return true;
  const permissions = profile?.permissions && typeof profile.permissions === "object"
    ? profile.permissions
    : {};
  return profile?.waiterAccess === true || permissions.waiterAccess === true;
}
