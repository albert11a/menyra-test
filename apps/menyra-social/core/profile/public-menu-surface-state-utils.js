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

function normalizeSurfaceRouteKey(value = "") {
  let key = String(value || "").trim().toLowerCase();
  if (!key) return "";
  try {
    if (typeof key.normalize === "function") {
      key = key.normalize("NFKD").replace(/[\u0300-\u036f]/g, "");
    }
  } catch {}
  return key
    .replace(/^@+/, "")
    .replace(/&/g, " and ")
    .replace(/['"`]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function resolveSurfacePublicPathSlug(value = "") {
  const text = String(value || "").trim();
  if (!text) return "";
  const clean = text.split("?")[0].split("#")[0].replace(/\/+$/, "");
  const parts = clean.split("/").map((part) => part.trim()).filter(Boolean);
  return parts.length ? parts[parts.length - 1] : clean;
}

function resolveKnownSurfaceCanonicalId(value = "", restaurants = []) {
  const safeValue = String(value || "").trim();
  if (!safeValue || !Array.isArray(restaurants)) return "";
  if (restaurants.some((row) => String(row?.id || "").trim() === safeValue)) return safeValue;
  const routeKey = normalizeSurfaceRouteKey(safeValue);
  if (!routeKey) return "";
  for (const row of restaurants) {
    const restaurantId = String(row?.id || "").trim();
    if (!restaurantId) continue;
    const candidates = [
      row?.publicSlug,
      row?.landingSlug,
      row?.businessSlug,
      row?.slug,
      row?.routeSlug,
      row?.handle,
      resolveSurfacePublicPathSlug(row?.canonicalPublicPath || ""),
      row?.name,
      row?.restaurantName,
      row?.businessName
    ];
    if (candidates.some((candidate) => normalizeSurfaceRouteKey(candidate || "") === routeKey)) {
      return restaurantId;
    }
  }
  return "";
}

export function resolveVisiblePublicMenuSurfaceIds({
  profile = null,
  routePayload = null,
  webDirectEntry = null,
  restaurantId = "",
  restaurants = []
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
  ids.slice().forEach((value) => {
    addSurfaceId(ids, resolveKnownSurfaceCanonicalId(value, restaurants));
  });
  const canonicalRestaurantId = String(
    resolveKnownSurfaceCanonicalId(restaurantId, restaurants)
    || resolveKnownSurfaceCanonicalId(safeProfile.canonicalRestaurantId, restaurants)
    || resolveKnownSurfaceCanonicalId(safeRoutePayload.canonicalRestaurantId, restaurants)
    || resolveKnownSurfaceCanonicalId(routeSnapshot.restaurantId, restaurants)
    || resolveKnownSurfaceCanonicalId(safeWebDirectEntry.canonicalRestaurantId, restaurants)
    || resolveKnownSurfaceCanonicalId(safeProfile.restaurantId, restaurants)
    || resolveKnownSurfaceCanonicalId(safeRoutePayload.restaurantId, restaurants)
    || resolveKnownSurfaceCanonicalId(safeWebDirectEntry.restaurantId, restaurants)
    ||
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

function normalizeFocusTargetKey(value = "") {
  let key = String(value || "").trim().toLowerCase();
  if (!key) return "";
  try {
    if (typeof key.normalize === "function") {
      key = key.normalize("NFKD").replace(/[\u0300-\u036f]/g, "");
    }
  } catch {}
  return key
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function buildMenuFocusTargetIndex(menuItems = []) {
  const ids = new Set();
  const categories = new Set();
  (Array.isArray(menuItems) ? menuItems : []).forEach((item) => {
    [
      item?.id,
      item?.itemId,
      item?.menuItemId,
      item?.productId
    ].forEach((value) => {
      const id = String(value || "").trim();
      if (id) ids.add(id);
    });
    const categoryKey = normalizeFocusTargetKey(item?.category || "");
    if (categoryKey) categories.add(categoryKey);
  });
  return { ids, categories };
}

function focusItemMatchesLoadedMenu(item = {}, menuIndex = {}) {
  const itemTarget = String(
    item?.targetMenuItemId
    || item?.menuItemId
    || item?.targetItemId
    || item?.itemId
    || item?.targetProductId
    || item?.productId
    || ""
  ).trim();
  if (itemTarget) return menuIndex?.ids?.has?.(itemTarget) === true;
  const categoryTarget = normalizeFocusTargetKey(
    item?.targetCategory
    || item?.categoryTarget
    || item?.menuCategory
    || ""
  );
  if (categoryTarget) return menuIndex?.categories?.has?.(categoryTarget) === true;
  return true;
}

export function resolveVisiblePublicMenuSurfaceState(state = {}, {
  profile = null,
  routePayload = null,
  webDirectEntry = null,
  restaurantId = "",
  coordinateFocusWithMenu = false
} = {}) {
  const surfaceIds = resolveVisiblePublicMenuSurfaceIds({
    profile,
    routePayload,
    webDirectEntry,
    restaurantId,
    restaurants: state?.restaurants
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
  const sameCanonicalPublicMenu = samePublicMenu
    && (
      !String(surfaceIds.restaurantId || "").trim()
      || menuRestaurantId === String(surfaceIds.restaurantId || "").trim()
    );
  const routeSurfaceRestaurantId = String(
    routePayload?.restaurantId
    || webDirectEntry?.restaurantId
    || profile?.restaurantId
    || ""
  ).trim();
  const knownCanonicalForRoute = resolveKnownSurfaceCanonicalId(routeSurfaceRestaurantId, state?.restaurants);
  const canRenderKnownEmptyMenu = sameCanonicalPublicMenu
    && (
      String(routePayload?.businessSnapshot?.restaurantId || "").trim() === menuRestaurantId
      || knownCanonicalForRoute === menuRestaurantId
      || (!!routeSurfaceRestaurantId && routeSurfaceRestaurantId !== menuRestaurantId)
      || !routeSurfaceRestaurantId
    );
  let menuStatus = "loading";
  if (!surfaceIds.restaurantId && !surfaceIds.targetIds.length) {
    menuStatus = "loading";
  } else if (samePublicMenu) {
    if (menuTruthState === "seeded") {
      menuStatus = menuItems.length ? "ready" : "loading";
    } else if (menuTruthState === "knownEmpty") {
      menuStatus = canRenderKnownEmptyMenu ? "empty" : "loading";
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
  const rawFocusItems = samePublicFocus && Array.isArray(focus.items) ? focus.items : [];
  const menuFocusTargetIndex = buildMenuFocusTargetIndex(menuItems);
  const focusItems = rawFocusItems.filter((item) => focusItemMatchesLoadedMenu(item, menuFocusTargetIndex));
  const focusInvalidForMenu = samePublicFocus
    && focusTruthState === "seeded"
    && rawFocusItems.length > 0
    && focusItems.length === 0;
  let focusStatus = "hidden";
  if (menuStatus === "ready") {
    if (!samePublicFocus) {
      focusStatus = "unknown";
    } else if (focusTruthState === "seeded") {
      focusStatus = focus.enabled !== false && focusItems.length > 0 ? "ready" : "empty";
    } else if (focusTruthState === "knownEmpty") {
      focusStatus = "empty";
    } else if (focusTruthState === "error" || (String(focus.error || "").trim() && !focus.loading)) {
      focusStatus = "error";
    } else if (focus.loading) {
      focusStatus = "loading";
    } else {
      focusStatus = "unknown";
    }
  } else if (samePublicFocus && focus.loading) {
    focusStatus = "loading";
  }
  const canRenderFocus = focusStatus === "ready"
    && samePublicFocus
    && focusItems.length > 0;
  const focusSettled = focusStatus === "ready" || focusStatus === "empty" || focusStatus === "error";
  const menuWaitingForFocus = coordinateFocusWithMenu === true
    && menuStatus === "ready"
    && !focusSettled;
  const canRenderMenuItems = menuStatus === "ready" && !menuWaitingForFocus;

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
      canRenderItems: canRenderMenuItems,
      waitingForFocus: menuWaitingForFocus,
      error: menuError
    },
    focus: {
      status: focusStatus,
      matches: samePublicFocus,
      restaurantId: samePublicFocus ? focusRestaurantId : surfaceIds.restaurantId,
      truthSource: samePublicFocus ? "public-menu" : focusTruthSource,
      truthState: samePublicFocus ? focusTruthState : "unknown",
      loading: samePublicFocus ? !!focus.loading : false,
      items: canRenderFocus ? focusItems : [],
      rawItems: rawFocusItems,
      canRenderFocus,
      settled: focusSettled,
      invalidForMenu: focusInvalidForMenu
    }
  };
}
