export function normalizePublicMenuTruthState(value = "") {
  const key = String(value || "").trim().toLowerCase();
  if (key === "knownempty" || key === "known-empty") return "knownEmpty";
  if (key === "seeded") return "seeded";
  if (key === "unknown") return "unknown";
  if (key === "error") return "error";
  return "";
}

function addSurfaceId(ids, value = "") {
  const safeValue = String(value || "").trim();
  if (safeValue && !ids.includes(safeValue)) ids.push(safeValue);
}

export function resolveVisiblePublicMenuSurfaceIds({
  profile = null,
  routePayload = null,
  webDirectEntry = null,
  restaurantId = ""
} = {}) {
  const safeProfile = profile && typeof profile === "object" ? profile : {};
  const safeRoutePayload = routePayload && typeof routePayload === "object" ? routePayload : {};
  const routeSnapshot = safeRoutePayload?.businessSnapshot && typeof safeRoutePayload.businessSnapshot === "object"
    ? safeRoutePayload.businessSnapshot
    : {};
  const safeWebDirectEntry = webDirectEntry && typeof webDirectEntry === "object" && webDirectEntry.active === true
    ? webDirectEntry
    : {};
  const ids = [];
  [
    restaurantId,
    safeProfile.canonicalRestaurantId,
    safeRoutePayload.canonicalRestaurantId,
    routeSnapshot.restaurantId,
    safeWebDirectEntry.canonicalRestaurantId,
    safeProfile.restaurantId,
    safeRoutePayload.restaurantId,
    safeWebDirectEntry.restaurantId
  ].forEach((value) => addSurfaceId(ids, value));
  const canonicalRestaurantId = String(
    safeProfile.canonicalRestaurantId
    || safeRoutePayload.canonicalRestaurantId
    || routeSnapshot.restaurantId
    || safeWebDirectEntry.canonicalRestaurantId
    || restaurantId
    || safeProfile.restaurantId
    || safeRoutePayload.restaurantId
    || safeWebDirectEntry.restaurantId
    || ""
  ).trim();
  addSurfaceId(ids, canonicalRestaurantId);
  return {
    restaurantId: canonicalRestaurantId,
    targetIds: ids
  };
}

export function isVisiblePublicMenuSurfaceIdMatch(value = "", targetIds = []) {
  const safeValue = String(value || "").trim();
  if (!safeValue) return false;
  return (Array.isArray(targetIds) ? targetIds : [])
    .map((id) => String(id || "").trim())
    .filter(Boolean)
    .includes(safeValue);
}

export function resolveVisiblePublicMenuSurfaceState(state = {}, {
  profile = null,
  routePayload = null,
  webDirectEntry = null,
  restaurantId = ""
} = {}) {
  const surfaceIds = resolveVisiblePublicMenuSurfaceIds({
    profile,
    routePayload,
    webDirectEntry,
    restaurantId
  });
  const menu = state?.menu && typeof state.menu === "object" ? state.menu : {};
  const focus = state?.focus && typeof state.focus === "object" ? state.focus : {};
  const menuRestaurantId = String(menu.restaurantId || "").trim();
  const menuSource = String(menu.source || "").trim().toLowerCase();
  const samePublicMenu = menuSource === "public"
    && isVisiblePublicMenuSurfaceIdMatch(menuRestaurantId, surfaceIds.targetIds);
  const menuItems = samePublicMenu && Array.isArray(menu.items) ? menu.items : [];
  const menuTruthState = samePublicMenu ? normalizePublicMenuTruthState(menu.truthState || "") : "unknown";
  const menuError = samePublicMenu ? String(menu.error || "").trim() : "";
  let menuStatus = "loading";
  if (!surfaceIds.restaurantId && !surfaceIds.targetIds.length) {
    menuStatus = "loading";
  } else if (samePublicMenu) {
    if (menuTruthState === "seeded") {
      menuStatus = menuItems.length ? "ready" : "empty";
    } else if (menuTruthState === "knownEmpty") {
      menuStatus = "empty";
    } else if (menuTruthState === "error" || (menuError && !menu.loading)) {
      menuStatus = "error";
    } else {
      menuStatus = "loading";
    }
  }

  const focusRestaurantId = String(focus.restaurantId || "").trim();
  const focusTruthSource = String(focus.truthSource || "").trim().toLowerCase();
  const focusTruthState = normalizePublicMenuTruthState(focus.truthState || "");
  const samePublicFocus = focusTruthSource === "public-menu"
    && isVisiblePublicMenuSurfaceIdMatch(focusRestaurantId, surfaceIds.targetIds);
  const focusItems = samePublicFocus && Array.isArray(focus.items) ? focus.items : [];
  const canRenderFocus = menuStatus === "ready"
    && samePublicFocus
    && focusTruthState === "seeded"
    && focus.enabled !== false
    && focusItems.length > 0;

  return {
    restaurantId: surfaceIds.restaurantId,
    targetIds: surfaceIds.targetIds,
    menu: {
      status: menuStatus,
      matches: samePublicMenu,
      restaurantId: samePublicMenu ? menuRestaurantId : surfaceIds.restaurantId,
      source: samePublicMenu ? "public" : menuSource,
      truthState: menuTruthState,
      loading: samePublicMenu ? !!menu.loading : false,
      items: menuItems,
      canRenderItems: menuStatus === "ready",
      error: menuError
    },
    focus: {
      status: canRenderFocus ? "ready" : "hidden",
      matches: samePublicFocus,
      restaurantId: samePublicFocus ? focusRestaurantId : surfaceIds.restaurantId,
      truthSource: samePublicFocus ? "public-menu" : focusTruthSource,
      truthState: samePublicFocus ? focusTruthState : "unknown",
      loading: samePublicFocus ? !!focus.loading : false,
      items: canRenderFocus ? focusItems : [],
      canRenderFocus
    }
  };
}
