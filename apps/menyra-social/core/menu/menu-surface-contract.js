export const MENU_SURFACE_SOURCES = Object.freeze({
  COLLECTION: "collection",
  PUBLIC: "public",
  LEGACY: "legacy",
  MIGRATION: "migration"
});

export const MENU_SURFACE_STATUS = Object.freeze({
  LOADING: "loading",
  READY: "ready",
  EMPTY: "empty",
  ERROR: "error"
});

export function normalizeMenuSurfaceSource(value = "") {
  const source = String(value || "").trim().toLowerCase();
  if (source === MENU_SURFACE_SOURCES.COLLECTION) return MENU_SURFACE_SOURCES.COLLECTION;
  if (source === MENU_SURFACE_SOURCES.PUBLIC) return MENU_SURFACE_SOURCES.PUBLIC;
  if (source === MENU_SURFACE_SOURCES.LEGACY) return MENU_SURFACE_SOURCES.LEGACY;
  if (source === MENU_SURFACE_SOURCES.MIGRATION) return MENU_SURFACE_SOURCES.MIGRATION;
  return MENU_SURFACE_SOURCES.COLLECTION;
}

export function resolveMenuSurfacePrimaryItems({
  collectionItems = [],
  publicItems = [],
  legacyItems = []
} = {}) {
  const collection = Array.isArray(collectionItems) ? collectionItems : [];
  const publicList = Array.isArray(publicItems) ? publicItems : [];
  const legacy = Array.isArray(legacyItems) ? legacyItems : [];
  if (collection.length) {
    return {
      items: collection,
      source: MENU_SURFACE_SOURCES.COLLECTION,
      fallbackItems: publicList.length ? publicList : legacy
    };
  }
  if (publicList.length) {
    return {
      items: publicList,
      source: MENU_SURFACE_SOURCES.PUBLIC,
      fallbackItems: legacy
    };
  }
  if (legacy.length) {
    return {
      items: legacy,
      source: MENU_SURFACE_SOURCES.LEGACY,
      fallbackItems: []
    };
  }
  return {
    items: [],
    source: MENU_SURFACE_SOURCES.COLLECTION,
    fallbackItems: []
  };
}

export function buildMenuSurfaceState({
  restaurantId = "",
  items = [],
  focusItems = [],
  source = MENU_SURFACE_SOURCES.COLLECTION,
  loading = false,
  error = "",
  statusBadgeVisible = true,
  meta = {}
} = {}) {
  const safeItems = Array.isArray(items) ? items : [];
  const safeFocusItems = Array.isArray(focusItems) ? focusItems : [];
  const safeError = String(error || "").trim();
  let status = MENU_SURFACE_STATUS.EMPTY;
  if (safeError) status = MENU_SURFACE_STATUS.ERROR;
  else if (loading && !safeItems.length && !safeFocusItems.length) status = MENU_SURFACE_STATUS.LOADING;
  else if (safeItems.length || safeFocusItems.length) status = MENU_SURFACE_STATUS.READY;
  return {
    restaurantId: String(restaurantId || "").trim(),
    items: safeItems,
    focusItems: safeFocusItems,
    source: normalizeMenuSurfaceSource(source),
    status,
    loading: status === MENU_SURFACE_STATUS.LOADING,
    error: safeError,
    statusBadgeVisible: statusBadgeVisible !== false,
    meta: meta && typeof meta === "object" ? meta : {}
  };
}

export function isMenuSurfaceReady(surface = {}) {
  return String(surface?.status || "").trim().toLowerCase() === MENU_SURFACE_STATUS.READY;
}

export function isMenuSurfaceSettled(surface = {}) {
  const status = String(surface?.status || "").trim().toLowerCase();
  return status === MENU_SURFACE_STATUS.READY
    || status === MENU_SURFACE_STATUS.EMPTY
    || status === MENU_SURFACE_STATUS.ERROR;
}
