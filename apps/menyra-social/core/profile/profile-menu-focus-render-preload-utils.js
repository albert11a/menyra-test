function normalizeRouteKey(value = "") {
  return String(value || "").trim().toLowerCase();
}

function hasPendingProfileRoute(pendingRoute = {}) {
  return !!String(pendingRoute?.pendingProfileRestaurantId || "").trim()
    || !!String(pendingRoute?.pendingUserRouteId || "").trim();
}

function hasActiveWebDirectProfileRoute(state = {}) {
  const entry = state?.__webDirectEntry && typeof state.__webDirectEntry === "object"
    ? state.__webDirectEntry
    : null;
  if (!entry || entry.active !== true) return false;
  return !!String(entry.canonicalRestaurantId || entry.restaurantId || "").trim();
}

export function shouldPreloadProfileMenuFocusRenderer({ state = {}, pendingRoute = {} } = {}) {
  const activeTab = normalizeRouteKey(state?.activeTab);
  if (activeTab === "profile" || activeTab === "menu") return true;
  if (state?.profileView && typeof state.profileView === "object") return true;
  if (hasPendingProfileRoute(pendingRoute)) return true;
  return hasActiveWebDirectProfileRoute(state);
}
