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
  const hardTargetIds = [];
  [
    restaurantId,
    safeProfile.canonicalRestaurantId,
    safeProfile.restaurantId
  ].forEach((value) => addSurfaceId(hardTargetIds, value));
  const routeTargetIds = [];
  [
    safeRoutePayload.canonicalRestaurantId,
    routeSnapshot.restaurantId,
    safeRoutePayload.restaurantId
  ].forEach((value) => addSurfaceId(routeTargetIds, value));
  const webDirectTargetIds = [];
  [
    safeWebDirectEntry.canonicalRestaurantId,
    safeWebDirectEntry.restaurantId
  ].forEach((value) => addSurfaceId(webDirectTargetIds, value));
  const routeMatchesHardTarget = !hardTargetIds.length
    || routeTargetIds.some((value) => isVisiblePublicMenuSurfaceIdMatch(value, hardTargetIds));
  const webDirectMatchesHardTarget = !hardTargetIds.length
    || webDirectTargetIds.some((value) => isVisiblePublicMenuSurfaceIdMatch(value, hardTargetIds));
  const ids = [];
  [
    restaurantId,
    safeProfile.canonicalRestaurantId,
    routeMatchesHardTarget ? safeRoutePayload.canonicalRestaurantId : "",
    routeMatchesHardTarget ? routeSnapshot.restaurantId : "",
    webDirectMatchesHardTarget ? safeWebDirectEntry.canonicalRestaurantId : "",
    safeProfile.restaurantId,
    routeMatchesHardTarget ? safeRoutePayload.restaurantId : "",
    webDirectMatchesHardTarget ? safeWebDirectEntry.restaurantId : ""
  ].forEach((value) => addSurfaceId(ids, value));
  const canonicalRestaurantId = String(
    safeProfile.canonicalRestaurantId
    || (routeMatchesHardTarget ? safeRoutePayload.canonicalRestaurantId : "")
    || (routeMatchesHardTarget ? routeSnapshot.restaurantId : "")
    || (webDirectMatchesHardTarget ? safeWebDirectEntry.canonicalRestaurantId : "")
    || restaurantId
    || safeProfile.restaurantId
    || (routeMatchesHardTarget ? safeRoutePayload.restaurantId : "")
    || (webDirectMatchesHardTarget ? safeWebDirectEntry.restaurantId : "")
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

function normalizeRouteMenuOrderIndex(value, fallback = 0) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return Math.max(0, Number(fallback) || 0);
  return Math.max(0, Math.floor(numeric));
}

function normalizeRouteMenuSeedItem(item = {}, restaurantId = "", index = 0) {
  const row = item && typeof item === "object" ? item : {};
  const safeRestaurantId = String(restaurantId || row.restaurantId || "").trim();
  if (!safeRestaurantId) return null;
  const fallbackNameToken = String(row?.name || row?.title || row?.category || "item")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "item";
  const id = String(
    row?.id
    || row?.itemId
    || row?.menuItemId
    || row?.productId
    || `${fallbackNameToken}_${Math.max(0, Number(index) || 0)}`
  ).trim();
  if (!id) return null;
  const imageUrlsRaw = [];
  if (Array.isArray(row?.imageUrls)) imageUrlsRaw.push(...row.imageUrls);
  if (Array.isArray(row?.images)) imageUrlsRaw.push(...row.images);
  if (row?.imageUrl) imageUrlsRaw.unshift(row.imageUrl);
  if (row?.image) imageUrlsRaw.push(row.image);
  const imageUrls = Array.from(new Set(imageUrlsRaw
    .map((entry) => String(entry || "").trim())
    .filter(Boolean)));
  const imageUrl = String(row?.imageUrl || imageUrls[0] || "").trim();
  return {
    ...row,
    id,
    restaurantId: safeRestaurantId,
    orderIndex: normalizeRouteMenuOrderIndex(
      row?.orderIndex ?? row?.sortOrder ?? row?.position ?? row?.rank,
      index
    ),
    imageUrl,
    imageUrls
  };
}

function resolveRouteMenuSeed(routePayload = null, {
  restaurantId = "",
  targetIds = []
} = {}) {
  const safeRoutePayload = routePayload && typeof routePayload === "object" ? routePayload : null;
  if (!safeRoutePayload) return { restaurantId: "", items: [], truthState: "unknown" };
  const snapshot = safeRoutePayload?.businessSnapshot && typeof safeRoutePayload.businessSnapshot === "object"
    ? safeRoutePayload.businessSnapshot
    : null;
  const snapshotMenu = snapshot?.menu && typeof snapshot.menu === "object"
    ? snapshot.menu
    : null;
  const payloadMenu = safeRoutePayload?.menu && typeof safeRoutePayload.menu === "object"
    ? safeRoutePayload.menu
    : null;
  const safeRestaurantId = String(
    snapshot?.restaurantId
    || safeRoutePayload?.canonicalRestaurantId
    || safeRoutePayload?.restaurantId
    || restaurantId
    || ""
  ).trim();
  if (!safeRestaurantId) return { restaurantId: "", items: [], truthState: "unknown" };
  if (Array.isArray(targetIds) && targetIds.length && !isVisiblePublicMenuSurfaceIdMatch(safeRestaurantId, targetIds)) {
    return { restaurantId: safeRestaurantId, items: [], truthState: "unknown" };
  }
  const rawItems = Array.isArray(snapshotMenu?.items)
    ? snapshotMenu.items
    : (Array.isArray(payloadMenu?.items)
      ? payloadMenu.items
      : (Array.isArray(safeRoutePayload?.menuItems) ? safeRoutePayload.menuItems : []));
  const items = rawItems
    .map((row, index) => normalizeRouteMenuSeedItem(row, safeRestaurantId, index))
    .filter(Boolean)
    .sort((a, b) => normalizeRouteMenuOrderIndex(a?.orderIndex) - normalizeRouteMenuOrderIndex(b?.orderIndex));
  const routeTruth = snapshot?.truth && typeof snapshot.truth === "object"
    ? snapshot.truth
    : (safeRoutePayload?.truth && typeof safeRoutePayload.truth === "object" ? safeRoutePayload.truth : {});
  const explicitTruthState = normalizePublicMenuTruthState(
    snapshotMenu?.state
    || payloadMenu?.state
    || routeTruth?.menu
    || ""
  );
  let truthState = "unknown";
  if (items.length > 0) {
    truthState = "seeded";
  } else if (explicitTruthState === "knownEmpty" || snapshotMenu?.knownEmpty === true || payloadMenu?.knownEmpty === true) {
    truthState = "knownEmpty";
  } else if (explicitTruthState === "seeded" || snapshotMenu?.seeded === true || payloadMenu?.seeded === true) {
    truthState = "unknown";
  } else if (explicitTruthState === "unknown" || snapshotMenu?.unknown === true || payloadMenu?.unknown === true) {
    truthState = "unknown";
  } else {
    const count = Number(snapshotMenu?.count ?? payloadMenu?.count);
    truthState = Number.isFinite(count) && count === 0 ? "knownEmpty" : "unknown";
  }
  return { restaurantId: safeRestaurantId, items, truthState };
}

function normalizeRouteFocusSeedItem(item = {}, index = 0) {
  const row = item && typeof item === "object" ? item : {};
  const id = String(row?.id || row?._id || `focus_${Math.max(0, Number(index) || 0)}`).trim();
  if (!id) return null;
  return {
    ...row,
    id,
    title: String(row?.title || row?.name || "Sot ne Fokus").trim() || "Sot ne Fokus",
    text: String(row?.text || row?.desc || row?.description || "").trim(),
    imageUrl: String(row?.imageUrl || row?.image || row?.photoUrl || "").trim(),
    cropX: Number.isFinite(Number(row?.cropX)) ? Number(row.cropX) : 50,
    cropY: Number.isFinite(Number(row?.cropY)) ? Number(row.cropY) : 50,
    active: row?.active !== false
  };
}

function resolveRouteFocusSeed(routePayload = null, {
  restaurantId = "",
  targetIds = []
} = {}) {
  const safeRoutePayload = routePayload && typeof routePayload === "object" ? routePayload : null;
  if (!safeRoutePayload) return { restaurantId: "", items: [], truthState: "unknown", enabled: true };
  const snapshot = safeRoutePayload?.businessSnapshot && typeof safeRoutePayload.businessSnapshot === "object"
    ? safeRoutePayload.businessSnapshot
    : null;
  const snapshotFocus = snapshot?.focus && typeof snapshot.focus === "object"
    ? snapshot.focus
    : null;
  const payloadFocus = safeRoutePayload?.focus && typeof safeRoutePayload.focus === "object"
    ? safeRoutePayload.focus
    : null;
  const safeRestaurantId = String(
    snapshot?.restaurantId
    || safeRoutePayload?.canonicalRestaurantId
    || safeRoutePayload?.restaurantId
    || restaurantId
    || ""
  ).trim();
  if (!safeRestaurantId) return { restaurantId: "", items: [], truthState: "unknown", enabled: true };
  if (Array.isArray(targetIds) && targetIds.length && !isVisiblePublicMenuSurfaceIdMatch(safeRestaurantId, targetIds)) {
    return { restaurantId: safeRestaurantId, items: [], truthState: "unknown", enabled: true };
  }
  const rawItems = Array.isArray(snapshotFocus?.items)
    ? snapshotFocus.items
    : (Array.isArray(payloadFocus?.items)
      ? payloadFocus.items
      : (Array.isArray(safeRoutePayload?.focusItems) ? safeRoutePayload.focusItems : []));
  const items = rawItems
    .map((row, index) => normalizeRouteFocusSeedItem(row, index))
    .filter((row) => row && row.active !== false);
  const routeTruth = snapshot?.truth && typeof snapshot.truth === "object"
    ? snapshot.truth
    : (safeRoutePayload?.truth && typeof safeRoutePayload.truth === "object" ? safeRoutePayload.truth : {});
  const explicitTruthState = normalizePublicMenuTruthState(
    snapshotFocus?.state
    || payloadFocus?.state
    || routeTruth?.focus
    || ""
  );
  let truthState = "unknown";
  if (items.length > 0) {
    truthState = "seeded";
  } else if (explicitTruthState === "knownEmpty" || snapshotFocus?.knownEmpty === true || payloadFocus?.knownEmpty === true) {
    truthState = "knownEmpty";
  } else if (explicitTruthState === "seeded" || snapshotFocus?.seeded === true || payloadFocus?.seeded === true) {
    truthState = "unknown";
  } else if (explicitTruthState === "unknown" || snapshotFocus?.unknown === true || payloadFocus?.unknown === true) {
    truthState = "unknown";
  } else {
    const count = Number(snapshotFocus?.count ?? payloadFocus?.count);
    truthState = Number.isFinite(count) && count === 0 ? "knownEmpty" : "unknown";
  }
  const enabled = snapshotFocus?.enabled !== false && payloadFocus?.enabled !== false;
  return { restaurantId: safeRestaurantId, items, truthState, enabled };
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
    restaurantId
  });
  const menu = state?.menu && typeof state.menu === "object" ? state.menu : {};
  const focus = state?.focus && typeof state.focus === "object" ? state.focus : {};
  const menuRestaurantId = String(menu.restaurantId || "").trim();
  const menuSource = String(menu.source || "").trim().toLowerCase();
  const samePublicMenu = menuSource === "public"
    && isVisiblePublicMenuSurfaceIdMatch(menuRestaurantId, surfaceIds.targetIds);
  const stateMenuItems = samePublicMenu && Array.isArray(menu.items) ? menu.items : [];
  const stateMenuTruthState = samePublicMenu ? normalizePublicMenuTruthState(menu.truthState || "") : "unknown";
  const stateMenuError = samePublicMenu ? String(menu.error || "").trim() : "";
  const routeMenuSeed = resolveRouteMenuSeed(routePayload, {
    restaurantId: surfaceIds.restaurantId,
    targetIds: surfaceIds.targetIds
  });
  const useRouteMenuSeed = routeMenuSeed.truthState === "seeded"
    && routeMenuSeed.items.length > 0
    && !(samePublicMenu && stateMenuTruthState === "seeded" && stateMenuItems.length > 0);
  const effectivePublicMenu = samePublicMenu || useRouteMenuSeed;
  const menuItems = useRouteMenuSeed ? routeMenuSeed.items : stateMenuItems;
  const menuTruthState = useRouteMenuSeed ? "seeded" : stateMenuTruthState;
  const menuError = useRouteMenuSeed ? "" : stateMenuError;
  const effectiveMenuRestaurantId = useRouteMenuSeed ? routeMenuSeed.restaurantId : menuRestaurantId;
  const effectiveMenuSource = useRouteMenuSeed ? "public" : menuSource;
  const effectiveMenuLoading = useRouteMenuSeed ? false : (samePublicMenu ? !!menu.loading : false);
  let menuStatus = "loading";
  if (!surfaceIds.restaurantId && !surfaceIds.targetIds.length) {
    menuStatus = "loading";
  } else if (effectivePublicMenu) {
    if (menuTruthState === "seeded") {
      menuStatus = menuItems.length ? "ready" : "empty";
    } else if (menuTruthState === "knownEmpty") {
      menuStatus = "empty";
    } else if (menuTruthState === "error" || (menuError && !effectiveMenuLoading)) {
      menuStatus = "error";
    } else {
      menuStatus = "loading";
    }
  }

  const focusRestaurantId = String(focus.restaurantId || "").trim();
  const focusTruthSource = String(focus.truthSource || "").trim().toLowerCase();
  const stateFocusTruthState = normalizePublicMenuTruthState(focus.truthState || "");
  const samePublicFocus = focusTruthSource === "public-menu"
    && isVisiblePublicMenuSurfaceIdMatch(focusRestaurantId, surfaceIds.targetIds);
  const stateFocusItems = samePublicFocus && Array.isArray(focus.items) ? focus.items : [];
  const routeFocusSeed = resolveRouteFocusSeed(routePayload, {
    restaurantId: surfaceIds.restaurantId,
    targetIds: surfaceIds.targetIds
  });
  const useRouteFocusSeed = routeFocusSeed.truthState === "seeded"
    && routeFocusSeed.items.length > 0
    && !(samePublicFocus && stateFocusTruthState === "seeded" && stateFocusItems.length > 0);
  const effectivePublicFocus = samePublicFocus || useRouteFocusSeed;
  const focusTruthState = useRouteFocusSeed ? "seeded" : stateFocusTruthState;
  const focusEffectiveRestaurantId = useRouteFocusSeed ? routeFocusSeed.restaurantId : focusRestaurantId;
  const focusEffectiveTruthSource = useRouteFocusSeed ? "public-menu" : focusTruthSource;
  const focusEffectiveLoading = useRouteFocusSeed ? false : (samePublicFocus ? !!focus.loading : false);
  const focusEffectiveError = useRouteFocusSeed ? "" : (samePublicFocus ? String(focus.error || "").trim() : "");
  const focusEffectiveEnabled = useRouteFocusSeed ? routeFocusSeed.enabled !== false : focus.enabled !== false;
  const rawFocusItems = useRouteFocusSeed ? routeFocusSeed.items : stateFocusItems;
  const menuFocusTargetIndex = buildMenuFocusTargetIndex(menuItems);
  const focusItems = rawFocusItems.filter((item) => focusItemMatchesLoadedMenu(item, menuFocusTargetIndex));
  const focusInvalidForMenu = effectivePublicFocus
    && focusTruthState === "seeded"
    && rawFocusItems.length > 0
    && focusItems.length === 0;
  let focusStatus = "hidden";
  if (menuStatus === "ready") {
    if (!effectivePublicFocus) {
      focusStatus = "unknown";
    } else if (focusTruthState === "seeded") {
      focusStatus = focusEffectiveEnabled && focusItems.length > 0 ? "ready" : "empty";
    } else if (focusTruthState === "knownEmpty") {
      focusStatus = "empty";
    } else if (focusTruthState === "error" || (focusEffectiveError && !focusEffectiveLoading)) {
      focusStatus = "error";
    } else if (focusEffectiveLoading) {
      focusStatus = "loading";
    } else {
      focusStatus = "unknown";
    }
  } else if (effectivePublicFocus && focusEffectiveLoading) {
    focusStatus = "loading";
  }
  const canRenderFocus = focusStatus === "ready"
    && effectivePublicFocus
    && focusItems.length > 0;
  const focusSettled = focusStatus === "ready" || focusStatus === "empty" || focusStatus === "error";
  const focusPendingPlaceholder = coordinateFocusWithMenu === true
    && menuStatus === "ready"
    && !focusSettled;
  const canRenderMenuItems = menuStatus === "ready";

  return {
    restaurantId: surfaceIds.restaurantId,
    targetIds: surfaceIds.targetIds,
    menu: {
      status: menuStatus,
      matches: effectivePublicMenu,
      restaurantId: effectivePublicMenu ? effectiveMenuRestaurantId : surfaceIds.restaurantId,
      source: effectivePublicMenu ? "public" : effectiveMenuSource,
      truthState: menuTruthState,
      loading: effectiveMenuLoading,
      items: menuItems,
      canRenderItems: canRenderMenuItems,
      waitingForFocus: false,
      error: menuError
    },
    focus: {
      status: focusStatus,
      matches: effectivePublicFocus,
      restaurantId: effectivePublicFocus ? focusEffectiveRestaurantId : surfaceIds.restaurantId,
      truthSource: effectivePublicFocus ? "public-menu" : focusEffectiveTruthSource,
      truthState: effectivePublicFocus ? focusTruthState : "unknown",
      loading: focusEffectiveLoading,
      items: canRenderFocus ? focusItems : [],
      rawItems: rawFocusItems,
      canRenderFocus,
      settled: focusSettled,
      pendingPlaceholder: focusPendingPlaceholder,
      invalidForMenu: focusInvalidForMenu,
      error: focusEffectiveError
    }
  };
}
