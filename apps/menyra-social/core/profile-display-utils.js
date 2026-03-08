export function logoFitClassCore(isBusiness) {
  return isBusiness ? "object-contain bg-white" : "object-cover";
}

export function isLocalBusinessProfileCore(profile = null) {
  return !!profile?.restaurantId && profile?.role === "business";
}
