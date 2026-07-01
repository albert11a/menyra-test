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

function normalizePublicAliasKey(value = "") {
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

function addPublicAliasKey(keys, value = "") {
  const key = normalizePublicAliasKey(value);
  if (key) keys.add(key);
}

function collectPublicAliasKeys({
  profile = {},
  routePayload = {},
  routeSnapshot = {},
  webDirectEntry = {}
} = {}) {
  const keys = new Set();
  const routeIdentity = routeSnapshot?.identity && typeof routeSnapshot.identity === "object"
    ? routeSnapshot.identity
    : (routePayload?.identity && typeof routePayload.identity === "object" ? routePayload.identity : {});
  [
    profile.publicSlug,
    profile.businessSlug,
    profile.landingSlug,
    profile.slug,
    profile.routeSlug,
    profile.handle,
    routePayload.publicSlug,
    routePayload.businessSlug,
    routePayload.landingSlug,
    routePayload.slug,
    routePayload.routeSlug,
    routePayload.restaurantId,
    routePayload.handle,
    routeIdentity.publicSlug,
    routeIdentity.businessSlug,
    routeIdentity.landingSlug,
    routeIdentity.slug,
    routeIdentity.routeSlug,
    routeIdentity.handle,
    webDirectEntry.publicSlug,
    webDirectEntry.businessSlug,
    webDirectEntry.landingSlug,
    webDirectEntry.slug,
    webDirectEntry.routeSlug,
    webDirectEntry.restaurantId,
    webDirectEntry.handle
  ].forEach((value) => addPublicAliasKey(keys, value));
  return keys;
}

function publicAliasLooksLikeCanonicalCandidate(value = "", aliasKeys = new Set()) {
  const safeValue = String(value || "").trim();
  if (!safeValue) return false;
  const key = normalizePublicAliasKey(safeValue);
  return !!key && aliasKeys.has(key);
}

function isResolvedCanonicalAliasCandidate(owner = {}) {
  const safeOwner = owner && typeof owner === "object" ? owner : {};
  const phase = String(safeOwner.phase || safeOwner.directEntry?.phase || "").trim().toLowerCase();
  return safeOwner.identityDocHydrated === true
    || safeOwner.businessDocHydrated === true
    || safeOwner.resolvedCanonical === true
    || phase === "ready";
}

function pickAuthoritativeRestaurantId(candidates = [], aliasKeys = new Set()) {
  for (const candidate of candidates) {
    const value = String(candidate?.value || "").trim();
    if (!value) continue;
    if (!publicAliasLooksLikeCanonicalCandidate(value, aliasKeys)) return value;
    if (isResolvedCanonicalAliasCandidate(candidate?.owner)) return value;
  }
  return "";
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
  const publicAliasKeys = collectPublicAliasKeys({
    profile: safeProfile,
    routePayload: safeRoutePayload,
    routeSnapshot,
    webDirectEntry: safeWebDirectEntry
  });
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
  const authoritativeRestaurantId = pickAuthoritativeRestaurantId([
    { value: safeProfile.canonicalRestaurantId, owner: safeProfile },
    { value: safeRoutePayload.canonicalRestaurantId, owner: safeRoutePayload },
    { value: safeWebDirectEntry.canonicalRestaurantId, owner: safeWebDirectEntry }
  ], publicAliasKeys);
  const resolvedRestaurantId = String(
    authoritativeRestaurantId
    || routeSnapshot.restaurantId
    || restaurantId
    || safeProfile.restaurantId
    || safeRoutePayload.restaurantId
    || safeWebDirectEntry.restaurantId
    || ""
  ).trim();
  addSurfaceId(ids, authoritativeRestaurantId);
  addSurfaceId(ids, resolvedRestaurantId);
  return {
    restaurantId: resolvedRestaurantId,
    authoritativeRestaurantId,
    targetIds: ids
  };
}

export function resolvePublicMenuRenderDecision(menuSurface = {}, visibleItems = []) {
  const menu = menuSurface && typeof menuSurface === "object" ? menuSurface : {};
  const items = Array.isArray(visibleItems) ? visibleItems : [];
  const hasItems = items.length > 0;
  const confirmedEmpty = menu.confirmedEmpty === true;
  const hasError = menu.status === "error" || !!String(menu.error || "").trim();
  const shouldRenderNoProducts = !hasItems && confirmedEmpty && !hasError;
  return {
    hasItems,
    confirmedEmpty,
    hasError,
    isLoading: !hasItems && !confirmedEmpty && !hasError,
    shouldRenderNoProducts
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
  const menuRawTruthState = samePublicMenu ? String(menu.truthState || "").trim() : "";
  const menuError = samePublicMenu ? String(menu.error || "").trim() : "";
  const menuMatchesAuthoritativeRestaurant = samePublicMenu
    && !!surfaceIds.authoritativeRestaurantId
    && menuRestaurantId === surfaceIds.authoritativeRestaurantId;
  const menuConfirmedEmpty = menuMatchesAuthoritativeRestaurant
    && menuTruthState === "knownEmpty";
  let menuStatus = "loading";
  if (!surfaceIds.restaurantId && !surfaceIds.targetIds.length) {
    menuStatus = "loading";
  } else if (samePublicMenu) {
    if (menuTruthState === "seeded") {
      menuStatus = menuItems.length ? "ready" : "loading";
    } else if (menuConfirmedEmpty) {
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
      if (focus.enabled === false || focusInvalidForMenu) {
        focusStatus = "empty";
      } else {
        focusStatus = focusItems.length > 0 ? "ready" : "loading";
      }
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
  const focusSettled = focusStatus === "ready"
    || focusStatus === "empty"
    || focusStatus === "error";
  const menuWaitingForFocus = false;
  const canRenderMenuItems = menuStatus === "ready";

  return {
    restaurantId: surfaceIds.restaurantId,
    authoritativeRestaurantId: surfaceIds.authoritativeRestaurantId,
    targetIds: surfaceIds.targetIds,
    menu: {
      status: menuStatus,
      matches: samePublicMenu,
      restaurantId: samePublicMenu ? menuRestaurantId : surfaceIds.restaurantId,
      source: samePublicMenu ? "public" : menuSource,
      truthState: menuTruthState,
      rawTruthState: menuRawTruthState,
      loading: samePublicMenu ? !!menu.loading : false,
      hydrating: samePublicMenu ? menu.hydrating === true : false,
      items: menuItems,
      canRenderItems: canRenderMenuItems,
      confirmedEmpty: menuConfirmedEmpty,
      matchesAuthoritativeRestaurant: menuMatchesAuthoritativeRestaurant,
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
