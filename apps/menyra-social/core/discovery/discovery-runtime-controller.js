import { isBackgroundPreloadDiscouragedCore } from "../common/task-schedule-utils.js";

export function createDiscoveryRuntimeController(deps = {}) {
  const document = deps.documentObj || (typeof globalThis.document === "undefined" ? null : globalThis.document);
  const window = deps.windowObj || (typeof globalThis.window === "undefined" ? null : globalThis.window);
  const navigator = deps.navigatorObj || (typeof globalThis.navigator === "undefined" ? null : globalThis.navigator);

  const state = deps.state;
  const BRAND_UI = deps.brandUi;
  const LEAFLET_JS_URL = deps.LEAFLET_JS_URL || "https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.js";
  const LEAFLET_CSS_URL = deps.LEAFLET_CSS_URL || "https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.css";
  const LEAFLET_JS_FALLBACK_URL = deps.LEAFLET_JS_FALLBACK_URL || "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
  const LEAFLET_CSS_FALLBACK_URL = deps.LEAFLET_CSS_FALLBACK_URL || "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
  const VENDOR_DEGRADED_EVENT = "menyra-social-vendor-degraded";
  const SEARCH_LIMITS = deps.searchLimits || { users: 10, businesses: 12 };
  const PLACEHOLDER_IMAGE = deps.placeholderImage;

  const getGeo = deps.getGeoFn;
  const normalizeLeadLocations = deps.normalizeLeadLocationsFn;
  const resolveCoordsFromEntity = deps.resolveCoordsFromEntityFn;
  const normalizeCoordPair = deps.normalizeCoordPairFn;
  const preferStableCoords = deps.preferStableCoordsFn;
  const isPlaceholderUrl = deps.isPlaceholderUrlFn;
  const escapeHtml = deps.escapeHtmlFn;
  const isPublicBusinessRecord = deps.isPublicBusinessRecordFn;
  const normalizeRestaurantType = deps.normalizeRestaurantTypeFn;
  const openProfileViewFromBusiness = deps.openProfileViewFromBusinessFn;
  const render = deps.renderFn;
  const getSelfAvatarUrl = deps.getSelfAvatarUrlFn;
  const isCeoUser = deps.isCeoUserFn;
  const getCeoGpsOverride = deps.getCeoGpsOverrideFn;
  const getVerifiedMapLocation = deps.getVerifiedMapLocationFn;
  const icon = deps.iconFn;
  const getOptimizedImageUrl = deps.getOptimizedImageUrlFn;
  const resolveRestaurantLogo = deps.resolveRestaurantLogoFn;
  const normalizeSearchKey = deps.normalizeSearchKeyFn;
  const normalizeSearchQuery = deps.normalizeSearchQueryFn;
  const scoreSearchMatch = deps.scoreSearchMatchFn;
  const sanitizeDisplayName = deps.sanitizeDisplayNameFn;
  const normalizeHandle = deps.normalizeHandleFn;
  const resolveSearchUserAvatarDisplay = deps.resolveSearchUserAvatarDisplayFn;
  const isForceHiddenBusinessEntity = deps.isForceHiddenBusinessEntityFn;
  const isForceHiddenHandle = deps.isForceHiddenHandleFn;
  const isForceHiddenEmail = deps.isForceHiddenEmailFn;
  const isGuestSession = deps.isGuestSessionFn;
  const escapeSelector = deps.escapeSelectorFn;
  const collection = deps.collectionFn;
  const query = deps.queryFn;
  const orderBy = deps.orderByFn;
  const startAt = deps.startAtFn;
  const endAt = deps.endAtFn;
  const limit = deps.limitFn;
  const getDocs = deps.getDocsFn;
  const db = deps.db;
  const getLastRenderMode = typeof deps.getLastRenderModeFn === "function" ? deps.getLastRenderModeFn : () => "";

  let searchTimer = null;
  let searchToken = 0;
  const searchCache = new Map();

  let leafletLoadPromise = null;
  let leafletLoadFailed = false;
  let leafletLastLoadFailureAt = 0;
  let leafletWarmupScheduled = false;
  let leafletMap = null;
  let leafletBizMarkers = [];
  let leafletBizMarkerMap = new Map();
  let leafletUserMarker = null;
  let leafletTileFallbackActive = false;
  let mapSearchFilterTimer = null;
  let mapSearchLastPanKey = "";
  let mapNotice = "";
  let mapNoticeTimer = null;
  let mapSearchUiExpanded = false;
  let lastLeafletRefreshAt = 0;
  let mapViewportAlignedAtLeastOnce = false;
  const markerLogoPreloadSet = new Set();
  let leafletSurfaceMissingSince = 0;
  let mapRecoveryQueued = false;
  const DISCOVERY_MAP_DEFAULT_CENTER = [42.6629, 21.1655];
  const DISCOVERY_MAP_DEFAULT_ZOOM = 14;
  const DISCOVERY_MAP_MAX_ZOOM = 19;
  const DISCOVERY_MAP_START_MAX_ZOOM = Math.max(
    15,
    Math.min(DISCOVERY_MAP_MAX_ZOOM, Number(deps.discoveryMapStartMaxZoom || 16) || 16)
  );
  const DISCOVERY_MAP_FOCUS_ZOOM = Math.max(13, Math.min(DISCOVERY_MAP_MAX_ZOOM, Number(deps.discoveryMapFocusZoom || 16) || 16));
  const LEAFLET_SOURCE_TIMEOUT_MS = Math.max(6000, Number(deps.leafletSourceTimeoutMs || 12000) || 12000);
  const LEAFLET_LOAD_RETRY_COOLDOWN_MS = Math.max(1200, Number(deps.leafletRetryCooldownMs || 2600) || 2600);
  const LEAFLET_TILE_PRIMARY_URL = String(
    deps.leafletTilePrimaryUrl
    || "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
  ).trim();
  const LEAFLET_TILE_FALLBACK_URL = String(
    deps.leafletTileFallbackUrl
    || "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
  ).trim();
  const LOCATION_UNVERIFIED_LABEL = "Vendndodhja e paverifikuar";
  const MAP_TILES_DEGRADED_NOTICE = "Pllakat e hartes nuk mund te ngarkoheshin. Shfaqen vetem te dhena te verifikuara.";
  const MAP_TILES_FALLBACK_NOTICE = "Pllakat kryesore te hartes jane te ngadalta. Harta rezerve aktive.";
  const MAP_SEARCH_PLACEHOLDER_COLLAPSED = "Kerko qytet, lokal...";
  const MAP_SEARCH_PLACEHOLDER_EXPANDED = "Kerko lokalin tend te preferuar";
  const FEED_VIEWER_LOCATION_STORAGE_KEY = "mnyra_social_feed_viewer_location_v1";

function emitVendorDegraded(kind = "map", active = false, message = "") {
  if (!window || typeof window.dispatchEvent !== "function") return;
  try {
    window.dispatchEvent(new CustomEvent(VENDOR_DEGRADED_EVENT, {
      detail: {
        kind,
        active: active === true,
        message: String(message || "").trim()
      }
    }));
  } catch {}
}

function getLeafletFocusZoom() {
  if (leafletMap && typeof leafletMap.getMaxZoom === "function") {
    const maxZoom = Number(leafletMap.getMaxZoom());
    if (Number.isFinite(maxZoom) && maxZoom > 0) {
      return Math.min(maxZoom, DISCOVERY_MAP_FOCUS_ZOOM);
    }
  }
  return DISCOVERY_MAP_FOCUS_ZOOM;
}

function resolveMapMarkerLogoUrl(raw = "", restaurantId = "") {
  const safeRestaurantId = String(restaurantId || "").trim();
  const safeRaw = String(raw || "").trim();
  let resolved = "";
  if (safeRestaurantId && typeof resolveRestaurantLogo === "function") {
    try {
      resolved = String(resolveRestaurantLogo(safeRestaurantId, safeRaw, "avatar") || "").trim();
    } catch {}
  }
  if (!resolved && safeRaw) {
    try {
      resolved = String(getOptimizedImageUrl(safeRaw, "avatar") || "").trim();
    } catch {}
  }
  if (!resolved) {
    try {
      resolved = String(getOptimizedImageUrl("", "avatar") || "").trim();
    } catch {}
  }
  return resolved || PLACEHOLDER_IMAGE;
}

function isLeafletCenterClose(lat, lng, tolerance = 0.00075) {
  if (!leafletMap || typeof leafletMap.getCenter !== "function") return false;
  const coords = normalizeCoordPair(lat, lng);
  if (!coords) return false;
  try {
    const center = leafletMap.getCenter();
    const centerLat = Number(center?.lat);
    const centerLng = Number(center?.lng);
    if (!Number.isFinite(centerLat) || !Number.isFinite(centerLng)) return false;
    return Math.abs(centerLat - coords.lat) <= tolerance && Math.abs(centerLng - coords.lng) <= tolerance;
  } catch {
    return false;
  }
}

function focusLeafletMap(lat, lng, options = {}) {
  if (!leafletMap) return;
  const coords = normalizeCoordPair(lat, lng);
  if (!coords) return;
  const zoom = Number.isFinite(options.zoom) ? options.zoom : getLeafletFocusZoom();
  const duration = Number.isFinite(options.duration) ? options.duration : 0.5;
  try {
    const currentZoom = typeof leafletMap.getZoom === "function" ? Number(leafletMap.getZoom()) : NaN;
    const alreadyCentered = isLeafletCenterClose(coords.lat, coords.lng);
    const alreadyZoomed = Number.isFinite(currentZoom) && Math.abs(currentZoom - Number(zoom)) < 0.01;
    if (alreadyCentered && alreadyZoomed) return;
    leafletMap.setView([coords.lat, coords.lng], zoom, { animate: true, duration });
  } catch {}
}

function ensureLeafletStylesheet() {
  if (typeof document === "undefined") return;
  if (document.querySelector('link[data-leaflet-css="1"]')) return;
  const sources = Array.from(new Set([
    LEAFLET_CSS_URL,
    LEAFLET_CSS_FALLBACK_URL
  ].map((value) => String(value || "").trim()).filter(Boolean)));
  if (!sources.length) return;
  let sourceIndex = 0;
  const mountStylesheet = () => {
    const href = sources[sourceIndex];
    if (!href) return;
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = href;
    link.dataset.leafletCss = "1";
    link.addEventListener("load", () => {
      emitVendorDegraded("map", false, "");
    }, { once: true });
    link.addEventListener("error", () => {
      link.remove();
      sourceIndex += 1;
      if (sourceIndex < sources.length) {
        mountStylesheet();
        return;
      }
      emitVendorDegraded("map", true, "Stili i hartes nuk mund te ngarkohej.");
    }, { once: true });
    document.head.appendChild(link);
  };
  mountStylesheet();
}

async function ensureLeafletLoaded() {
  if (window.L) {
    emitVendorDegraded("map", false, "");
    return true;
  }
  if (leafletLoadFailed) {
    const msSinceFailure = Date.now() - leafletLastLoadFailureAt;
    if (msSinceFailure < LEAFLET_LOAD_RETRY_COOLDOWN_MS) return false;
    leafletLoadFailed = false;
  }
  if (leafletLoadPromise) return leafletLoadPromise;
  if (!document?.head) {
    leafletLoadFailed = true;
    leafletLastLoadFailureAt = Date.now();
    emitVendorDegraded("map", true, "Biblioteka e hartes nuk mund te inicializohej.");
    return false;
  }
  ensureLeafletStylesheet();
  leafletLoadPromise = new Promise((resolve) => {
    const sources = Array.from(new Set([
      LEAFLET_JS_URL,
      LEAFLET_JS_FALLBACK_URL
    ].map((value) => String(value || "").trim()).filter(Boolean)));
    if (!sources.length) {
      leafletLoadFailed = true;
      leafletLastLoadFailureAt = Date.now();
      emitVendorDegraded("map", true, "Biblioteka e hartes nuk eshte e konfiguruar.");
      resolve(false);
      return;
    }
    const loadScriptAt = (index = 0) => {
      const src = sources[index];
      if (!src) {
        leafletLoadFailed = true;
        leafletLastLoadFailureAt = Date.now();
        emitVendorDegraded("map", true, "Biblioteka e hartes nuk mund te ngarkohej.");
        resolve(false);
        return;
      }
      const script = document.createElement("script");
      script.src = src;
      script.async = true;
      script.dataset.leafletJs = "1";
      let timeoutId = null;
      let settled = false;
      const clearListeners = () => {
        script.removeEventListener("load", handleLoad);
        script.removeEventListener("error", handleError);
      };
      const finalize = ({ loaded = false, keepScript = false } = {}) => {
        if (settled) return;
        settled = true;
        if (timeoutId) window.clearTimeout(timeoutId);
        clearListeners();
        if (!keepScript) {
          try { script.remove(); } catch {}
        }
        if (loaded) {
          leafletLoadFailed = false;
          leafletLastLoadFailureAt = 0;
          emitVendorDegraded("map", false, "");
          resolve(true);
        }
      };
      const handleLoad = () => {
        if (window.L) {
          finalize({ loaded: true, keepScript: true });
          return;
        }
        finalize({ loaded: false, keepScript: false });
        loadScriptAt(index + 1);
      };
      const handleError = () => {
        finalize({ loaded: false, keepScript: false });
        loadScriptAt(index + 1);
      };
      script.addEventListener("load", handleLoad, { once: true });
      script.addEventListener("error", handleError, { once: true });
      timeoutId = window.setTimeout(() => {
        if (window.L) {
          finalize({ loaded: true, keepScript: true });
          return;
        }
        finalize({ loaded: false, keepScript: false });
        loadScriptAt(index + 1);
      }, LEAFLET_SOURCE_TIMEOUT_MS);
      document.head.appendChild(script);
    };
    loadScriptAt(0);
  }).finally(() => {
    leafletLoadPromise = null;
  });
  return leafletLoadPromise;
}

// Leaflet + Karten-Stylesheet im Idle holen, sobald dieser Controller existiert.
// Ohne das startet der Vendor-Download erst beim Oeffnen der Karte, und die
// Flaeche stand sichtbar auf "Karte wird geladen ...".
function scheduleLeafletWarmup() {
  if (leafletWarmupScheduled || !window) return;
  if (isBackgroundPreloadDiscouragedCore({ navigatorObj: navigator })) return;
  leafletWarmupScheduled = true;
  const warmup = () => {
    if (window.L || leafletLoadFailed) return;
    void ensureLeafletLoaded();
  };
  if (typeof window.requestIdleCallback === "function") {
    window.requestIdleCallback(warmup, { timeout: 1800 });
    return;
  }
  window.setTimeout(warmup, 900);
}

function getRestaurantLocations(rest) {
  const geo = getGeo(rest) || {};
  return normalizeLeadLocations(rest?.locations || [], rest?.address || rest?.city || "", {
    lat: rest?.lat ?? geo?.lat,
    lng: rest?.lng ?? geo?.lng
  });
}

function hasUsableMapCoords(value = {}) {
  return !!normalizeCoordPair(value?.lat, value?.lng);
}

function normalizeBusinessLocation(rest, idx, location = null, locationIndex = 0) {
  const geo = getGeo(rest);
  const row = location || {};
  const restaurantId = String(rest?.restaurantId || rest?.id || "").trim();
  const canonicalRestaurantId = String(rest?.canonicalRestaurantId || rest?.restaurantId || rest?.id || "").trim();
  const documentId = String(rest?.id || "").trim();
  const publicSlug = String(rest?.publicSlug || rest?.slug || "").trim();
  const landingSlug = String(rest?.landingSlug || "").trim();
  const handle = String(rest?.handle || "").trim();
  const rowCoords = resolveCoordsFromEntity(row);
  const restCoords = resolveCoordsFromEntity(rest)
    || normalizeCoordPair(rest?.lat ?? geo?.lat, rest?.lng ?? geo?.lng);
  const preferred = preferStableCoords(rowCoords, restCoords);
  const normalizedCoords = preferred ? normalizeCoordPair(preferred.lat, preferred.lng) : null;
  const city = String(row.city || rest.city || "").trim();
  const address = String(row.address || rest.address || city || LOCATION_UNVERIFIED_LABEL).trim() || LOCATION_UNVERIFIED_LABEL;
  const logoSource = rest.logoUrl || rest.logo || rest.heroUrl || rest.coverUrl || "";
  const markerLogo = resolveMapMarkerLogoUrl(logoSource, restaurantId || documentId);

  return {
    id: restaurantId || documentId,
    restaurantId: restaurantId || documentId,
    canonicalRestaurantId,
    documentId,
    publicSlug,
    landingSlug,
    handle,
    markerKey: `${restaurantId || documentId || "biz"}:${locationIndex}`,
    locationIndex,
    name: rest.name || rest.restaurantName || "Business",
    type: rest.type || "food",
    lat: normalizedCoords?.lat ?? null,
    lng: normalizedCoords?.lng ?? null,
    city,
    address,
    hours: rest.hours || rest.openHours || "08:00 - 23:00",
    rating: rest.rating || rest.score || 4.8,
    img: markerLogo,
    desc: rest.description || rest.bio || `Offizielles Lokal auf ${BRAND_UI.upper}.`,
    hasVerifiedCoords: !!normalizedCoords,
    locationStatus: normalizedCoords ? "verified" : "unknown",
    raw: rest
  };
}

function buildRestaurantLocations(rest, idx) {
  const locations = getRestaurantLocations(rest);
  const sourceRows = locations.length ? locations : [null];
  return sourceRows
    .map((location, locationIndex) => normalizeBusinessLocation(rest, idx, location, locationIndex))
    .filter((entry) => entry?.hasVerifiedCoords === true);
}

function cleanupLeaflet() {
  try {
    if (leafletMap) leafletMap.remove();
  } catch {}
  leafletMap = null;
  leafletBizMarkers = [];
  leafletBizMarkerMap = new Map();
  leafletUserMarker = null;
  leafletTileFallbackActive = false;
  mapSearchLastPanKey = "";
  if (mapSearchFilterTimer) {
    clearTimeout(mapSearchFilterTimer);
    mapSearchFilterTimer = null;
  }
  mapSearchUiExpanded = false;
  lastLeafletRefreshAt = 0;
  mapViewportAlignedAtLeastOnce = false;
  leafletSurfaceMissingSince = 0;
  mapRecoveryQueued = false;
}

function isLeafletMapMountedOn(element) {
  if (!leafletMap || !element) return false;
  try {
    const container = typeof leafletMap.getContainer === "function" ? leafletMap.getContainer() : null;
    if (!container) return false;
    if (container !== element) return false;
    if (!document.body.contains(container)) return false;
    return true;
  } catch {
    return false;
  }
}

function hasLeafletSurface(element) {
  if (!element) return false;
  try {
    return !!element.querySelector(".leaflet-pane, .leaflet-map-pane");
  } catch {
    return false;
  }
}

function scheduleLeafletRefresh(retries = 3, { throttleMs = 0 } = {}) {
  if (!leafletMap || !document.getElementById("leafletMap")) return;
  const safeThrottle = Math.max(0, Number(throttleMs) || 0);
  const now = Date.now();
  if (safeThrottle > 0 && (now - lastLeafletRefreshAt) < safeThrottle) return;
  lastLeafletRefreshAt = now;
  const run = (left) => {
    if (!leafletMap) return;
    const el = document.getElementById("leafletMap");
    if (!el || !isLeafletMapMountedOn(el)) return;
    try { leafletMap.invalidateSize(); } catch {}
    if (left <= 0) return;
    window.setTimeout(() => run(left - 1), 180);
  };
  run(Math.max(0, Number(retries) || 0));
}

function scheduleMapRecoveryCheck(delayMs = 140) {
  if (mapRecoveryQueued || !window || typeof window.setTimeout !== "function") return;
  mapRecoveryQueued = true;
  window.setTimeout(() => {
    mapRecoveryQueued = false;
    if (state.activeTab !== "map") return;
    initLeafletIfNeeded();
  }, Math.max(60, Number(delayMs) || 140));
}

function primeMapMarkerLogos(locations = [], limit = 40) {
  if (!window || typeof window.Image !== "function") return;
  const rows = Array.isArray(locations) ? locations : [];
  const maxItems = Math.max(0, Number(limit) || 0);
  for (let i = 0; i < rows.length && i < maxItems; i += 1) {
    const entry = rows[i] || {};
    const logoUrl = resolveMapMarkerLogoUrl(
      entry?.img || entry?.raw?.logoUrl || entry?.raw?.logo || entry?.raw?.heroUrl || entry?.raw?.coverUrl || "",
      entry?.id || entry?.raw?.id || ""
    );
    if (!logoUrl || markerLogoPreloadSet.has(logoUrl)) continue;
    markerLogoPreloadSet.add(logoUrl);
    try {
      const img = new window.Image();
      img.decoding = "async";
      img.src = logoUrl;
      if (typeof img.decode === "function") {
        img.decode().catch(() => {});
      }
    } catch {}
  }
}

function fitLeafletToLocations(locations = [], { force = false, animate = false } = {}) {
  if (!leafletMap || !window.L) return false;
  if (!force && mapViewportAlignedAtLeastOnce) return false;
  const visibleLocations = getDiscoverableMapLocations(locations);
  const latLngPairs = visibleLocations
    .map((entry) => normalizeCoordPair(entry?.lat, entry?.lng))
    .filter(Boolean)
    .map((coords) => [coords.lat, coords.lng]);
  const selectedCoords = normalizeCoordPair(state.selectedBusiness?.lat, state.selectedBusiness?.lng);
  const verifiedCoords = resolveVerifiedMapCoords();
  const preferredCoords = selectedCoords || verifiedCoords || null;
  const fallbackCoords = latLngPairs.length ? { lat: latLngPairs[0][0], lng: latLngPairs[0][1] } : null;
  const anchor = preferredCoords || fallbackCoords;
  if (!anchor) return false;
  try {
    leafletMap.setView([anchor.lat, anchor.lng], DISCOVERY_MAP_START_MAX_ZOOM, { animate: !!animate });
    mapViewportAlignedAtLeastOnce = true;
    return true;
  } catch {
    return false;
  }
}

function resolveLeafletMarkerKey(location = {}, fallbackIndex = 0) {
  const markerKey = String(location?.markerKey || "").trim();
  if (markerKey) return markerKey;
  const id = String(location?.id || "biz").trim() || "biz";
  const locationIndex = Number.isFinite(Number(location?.locationIndex))
    ? Number(location.locationIndex)
    : Number(fallbackIndex || 0);
  return `${id}:${locationIndex}`;
}

function getSelectedBusinessMapLocation() {
  const selected = state.selectedBusiness && typeof state.selectedBusiness === "object"
    ? state.selectedBusiness
    : null;
  if (!selected || !hasUsableMapCoords(selected)) return null;
  const raw = selected.raw && typeof selected.raw === "object" ? selected.raw : selected;
  const normalized = {
    ...selected,
    id: String(selected.id || selected.restaurantId || raw.id || raw.restaurantId || "").trim(),
    restaurantId: String(selected.restaurantId || raw.restaurantId || selected.id || raw.id || "").trim(),
    canonicalRestaurantId: String(selected.canonicalRestaurantId || raw.canonicalRestaurantId || raw.restaurantId || raw.id || "").trim(),
    markerKey: resolveLeafletMarkerKey(selected),
    hasVerifiedCoords: true,
    locationStatus: selected.locationStatus || "verified",
    raw
  };
  if (!normalized.id) return null;
  return isDiscoverableMapBusiness(normalized) ? normalized : null;
}

function appendSelectedBusinessLocation(locations = []) {
  const selected = getSelectedBusinessMapLocation();
  if (!selected) return locations;
  const selectedKey = resolveLeafletMarkerKey(selected);
  const selectedIds = new Set([
    selected.id,
    selected.restaurantId,
    selected.canonicalRestaurantId,
    selected.documentId
  ].map((value) => String(value || "").trim()).filter(Boolean));
  const exists = locations.some((entry) => {
    if (resolveLeafletMarkerKey(entry) === selectedKey) return true;
    const entryIds = [
      entry?.id,
      entry?.restaurantId,
      entry?.canonicalRestaurantId,
      entry?.documentId
    ].map((value) => String(value || "").trim()).filter(Boolean);
    return entryIds.some((id) => selectedIds.has(id));
  });
  return exists ? locations : [selected, ...locations];
}

function buildMarkerVisualSignature(location = {}, { selected = false } = {}) {
  const coords = normalizeCoordPair(location?.lat, location?.lng);
  const lat = coords ? Number(coords.lat).toFixed(6) : "";
  const lng = coords ? Number(coords.lng).toFixed(6) : "";
  const image = String(location?.img || "").trim();
  return `${resolveLeafletMarkerKey(location)}|${lat}|${lng}|${image}|${selected ? "1" : "0"}`;
}

function makeBizDivIcon(b, { selected = false } = {}) {
  const isSelected = selected === true;
  const logoUrl = resolveMapMarkerLogoUrl(b?.img || "", b?.id || "");
  const safeImg = logoUrl && !isPlaceholderUrl(logoUrl) ? escapeHtml(logoUrl) : PLACEHOLDER_IMAGE;
  const html = `
    <div class="relative flex flex-col items-center justify-center transition-all duration-300 ${isSelected ? 'scale-110 z-[500]' : 'hover:scale-105 z-[400]'}">
      <div class="w-12 h-12 rounded-[1rem] shadow-lg flex items-center justify-center border-[3px] ${isSelected ? 'border-indigo-600' : 'border-white'} bg-white overflow-hidden p-0.5">
        <img src="${safeImg}" loading="eager" decoding="async" fetchpriority="${isSelected ? "high" : "auto"}" class="w-full h-full object-cover rounded-xl" onerror="this.src='${PLACEHOLDER_IMAGE}'"/>
      </div>
      <div class="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] ${isSelected ? 'border-t-indigo-600' : 'border-t-white drop-shadow-md'}"></div>
    </div>
  `;
  return window.L.divIcon({ className: "custom-div-icon", html, iconSize: [48, 58], iconAnchor: [24, 58] });
}

function updateLeafletMarkerVisual(marker, { selected = false, force = false } = {}) {
  if (!marker || !window.L) return;
  const business = marker.__biz || {};
  const nextSignature = buildMarkerVisualSignature(business, { selected });
  if (!force && marker.__visualSignature === nextSignature) return;
  try {
    marker.setIcon(makeBizDivIcon(business, { selected }));
    marker.setZIndexOffset(selected ? 1600 : 600);
  } catch {}
  marker.__visualSignature = nextSignature;
}

function normalizeMapKey(value = "") {
  if (typeof normalizeSearchKey === "function") return normalizeSearchKey(value);
  return String(value || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function isTravelMapScopeActive() {
  return state?.activeTab === "travel"
    && String(state?.travelView?.activeTab || "").trim().toLowerCase() === "map";
}

function getTravelMapDestinationQuery() {
  return String(state?.travelView?.query || "").trim();
}

function isTravelHotelTypeKey(typeKey = "") {
  const key = normalizeMapKey(typeKey);
  return [
    "hotel",
    "hotels",
    "motel",
    "motels",
    "hostel",
    "resort",
    "accommodation",
    "unterkunft",
    "travel"
  ].includes(key);
}

function resolveMapBusinessTypeKey(value = {}) {
  const row = value?.raw || value || {};
  return normalizeRestaurantType(
    value?.type
    || row?.type
    || row?.customerType
    || row?.category
    || row?.kind
    || row?.restaurantType
    || ""
  );
}

function collectTravelMapDestinationCandidates(value = {}) {
  const row = value?.raw || value || {};
  const values = [
    value?.city,
    value?.address,
    value?.name,
    value?.desc,
    row?.city,
    row?.locationCity,
    row?.primaryCity,
    row?.address,
    row?.location,
    row?.primaryAddress,
    row?.country,
    row?.region,
    row?.district,
    row?.name,
    row?.restaurantName,
    row?.businessName,
    row?.displayName,
    row?.description,
    row?.bio,
    row?.about
  ];
  if (Array.isArray(row?.locations)) {
    row.locations.forEach((location) => {
      if (!location || typeof location !== "object") return;
      values.push(location.city, location.address, location.country, location.region, location.name);
    });
  }
  return values;
}

function matchesTravelMapDestination(value = {}) {
  const destinationKey = normalizeMapKey(getTravelMapDestinationQuery());
  if (!destinationKey) return true;
  const haystack = collectTravelMapDestinationCandidates(value)
    .map(normalizeMapKey)
    .filter(Boolean)
    .join("_");
  return haystack.includes(destinationKey);
}

function isDiscoverableMapBusiness(location = {}) {
  const row = location?.raw || {};
  if (!isPublicBusinessRecord(row)) return false;
  const typeKey = resolveMapBusinessTypeKey(location);
  if (isTravelMapScopeActive()) {
    return isTravelHotelTypeKey(typeKey) && matchesTravelMapDestination(location);
  }
  return typeKey !== "ecommerce";
}

function isDiscoverableRestaurant(rest = {}) {
  if (!isPublicBusinessRecord(rest)) return false;
  const typeKey = resolveMapBusinessTypeKey(rest);
  if (isTravelMapScopeActive()) {
    return isTravelHotelTypeKey(typeKey) && matchesTravelMapDestination(rest);
  }
  return typeKey !== "ecommerce";
}

function getDiscoverableMapLocations(locations = state.businessLocations) {
  const baseLocations = (Array.isArray(locations) ? locations : []).filter((location) => (
    isDiscoverableMapBusiness(location) && hasUsableMapCoords(location)
  ));
  return appendSelectedBusinessLocation(baseLocations);
}

function formatBusinessLocationLabel(value = "") {
  const label = String(value || "").trim();
  return label || LOCATION_UNVERIFIED_LABEL;
}

function renderMapTruthState() {
  const travelMap = isTravelMapScopeActive();
  const discoverableRestaurants = (Array.isArray(state.restaurants) ? state.restaurants : [])
    .filter((rest) => isDiscoverableRestaurant(rest));
  if (!discoverableRestaurants.length) return "";
  const mappedLocations = getDiscoverableMapLocations(state.businessLocations);
  const mappedBusinessIds = new Set(
    mappedLocations
      .map((entry) => String(entry?.id || "").trim())
      .filter(Boolean)
  );
  const withoutCoordsCount = discoverableRestaurants.reduce((acc, rest) => {
    const id = String(rest?.id || "").trim();
    if (!id || mappedBusinessIds.has(id)) return acc;
    return acc + 1;
  }, 0);
  if (!mappedLocations.length) {
    return `
      <div class="inline-flex max-w-full items-center gap-2 rounded-2xl bg-amber-50 border border-amber-200/80 shadow-sm px-4 py-3 text-[11px] font-bold text-amber-900">
        ${icon("map-pin-off", "w-4 h-4 text-amber-600 flex-shrink-0")}
        <span class="min-w-0">Nuk ka ${travelMap ? "vendndodhje hoteli" : "vendndodhje"} te verifikuara. Vendet pa koordinata nuk shfaqen ne harte.</span>
      </div>
    `;
  }
  if (withoutCoordsCount > 0) {
    return `
      <div class="inline-flex max-w-full items-center gap-2 rounded-2xl bg-slate-100/90 border border-slate-200/80 shadow-sm px-4 py-3 text-[11px] font-bold text-slate-700">
        ${icon("info", "w-4 h-4 text-slate-500 flex-shrink-0")}
        <span class="min-w-0">${withoutCoordsCount} ${travelMap ? "hotel(e)" : "restorant(e)"} pa koordinata te verifikuara jane fshehur.</span>
      </div>
    `;
  }
  return "";
}

function renderMapNotice() {
  const message = String(mapNotice || "").trim();
  if (!message) return "";
  return `
    <div class="inline-flex max-w-full items-center gap-2 rounded-2xl bg-white/92 backdrop-blur-xl border border-white/40 shadow-lg px-4 py-3 text-[11px] font-bold text-slate-700">
      ${icon("info", "w-4 h-4 text-amber-500 flex-shrink-0")}
      <span class="min-w-0">${escapeHtml(message)}</span>
    </div>
  `;
}

function updateMapNoticeDom() {
  const slot = document.getElementById("mapNoticeSlot");
  if (!slot) return false;
  slot.innerHTML = renderMapNotice();
  if (window.lucide?.createIcons) window.lucide.createIcons();
  return true;
}

function clearMapNotice({ refresh = true } = {}) {
  if (mapNoticeTimer) {
    clearTimeout(mapNoticeTimer);
    mapNoticeTimer = null;
  }
  if (!mapNotice) return;
  mapNotice = "";
  if (refresh) {
    const updated = updateMapNoticeDom();
    if (!updated && state.activeTab === "map") render();
  }
}

function setMapNotice(message = "", { durationMs = 4200 } = {}) {
  const nextMessage = String(message || "").trim();
  if (mapNoticeTimer) {
    clearTimeout(mapNoticeTimer);
    mapNoticeTimer = null;
  }
  mapNotice = nextMessage;
  const updated = updateMapNoticeDom();
  if (!updated && state.activeTab === "map") render();
  if (nextMessage && durationMs > 0) {
    mapNoticeTimer = window.setTimeout(() => {
      mapNoticeTimer = null;
      clearMapNotice();
    }, durationMs);
  }
}

function updateMapSheet() {
  const slot = document.getElementById("mapSheetSlot");
  if (!slot) return;
  if (state.selectedBusiness && (
    !isDiscoverableMapBusiness(state.selectedBusiness)
    || !hasUsableMapCoords(state.selectedBusiness)
  )) {
    state.selectedBusiness = null;
  }
  const selected = state.selectedBusiness || null;
  const nextSheetSignature = selected
    ? [
      String(selected.markerKey || selected.id || ""),
      Number(selected.lat || 0).toFixed(6),
      Number(selected.lng || 0).toFixed(6),
      String(selected.name || ""),
      String(selected.address || ""),
      String(selected.rating || "")
    ].join("|")
    : "none";
  const prevSheetSignature = String(slot.dataset.mapSheetSignature || "");
  if (nextSheetSignature === prevSheetSignature) return;
  slot.innerHTML = selected ? renderMapSheet(selected) : "";
  slot.dataset.mapSheetSignature = nextSheetSignature;
  bindMapSheetEvents();
  if (window.lucide?.createIcons) window.lucide.createIcons();
}

function bindMapSheetEvents() {
  const mapCloseBtn = document.getElementById("mapCloseBtn");
  if (mapCloseBtn) {
    mapCloseBtn.addEventListener("click", () => {
      state.selectedBusiness = null;
      renderCurrentMapMarkerSet();
      updateMapSheet();
    });
  }

  const mapOpenRouteBtn = document.getElementById("mapOpenRouteBtn");
  if (mapOpenRouteBtn) {
    mapOpenRouteBtn.addEventListener("click", () => {
      if (!state.selectedBusiness) return;
      const { lat, lng } = state.selectedBusiness;
      if (typeof lat !== "number" || typeof lng !== "number") return;
      const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
      window.open(url, "_blank");
    });
  }

  const mapVisitProfileBtn = document.getElementById("mapVisitProfileBtn");
  const mapVisitProfileImgBtn = document.getElementById("mapVisitProfileImgBtn");
  [mapVisitProfileBtn, mapVisitProfileImgBtn].forEach(btn => {
    if (btn) {
      btn.addEventListener("click", () => {
        if (!state.selectedBusiness) return;
        const selected = state.selectedBusiness;
        const raw = selected.raw && typeof selected.raw === "object" ? selected.raw : {};
        const restaurantId = String(selected.restaurantId || raw.restaurantId || selected.id || raw.id || "").trim();
        const canonicalRestaurantId = String(
          selected.canonicalRestaurantId
          || raw.canonicalRestaurantId
          || raw.restaurantId
          || raw.id
          || selected.documentId
          || ""
        ).trim();
        openProfileViewFromBusiness({
          id: canonicalRestaurantId || restaurantId || selected.publicSlug || selected.landingSlug || raw.publicSlug || raw.landingSlug || "",
          restaurantId,
          canonicalRestaurantId,
          documentId: selected.documentId || raw.id || "",
          publicSlug: selected.publicSlug || raw.publicSlug || "",
          landingSlug: selected.landingSlug || raw.landingSlug || "",
          handle: selected.handle || raw.handle || "",
          name: selected.name,
          source: "map",
          initialSnapshot: Object.keys(raw).length ? raw : selected
        });
      });
    }
  });
}

function createLeafletTileLayer(urlTemplate = LEAFLET_TILE_PRIMARY_URL) {
  const options = {
    maxZoom: DISCOVERY_MAP_MAX_ZOOM,
    keepBuffer: 8,
    updateWhenIdle: false,
    updateWhenZooming: false
  };
  const safeTemplate = String(urlTemplate || "").toLowerCase();
  if (safeTemplate.includes("{s}")) {
    options.subdomains = safeTemplate.includes("tile.openstreetmap.org") ? "abc" : "abcd";
  }
  return window.L.tileLayer(urlTemplate, options);
}

function initLeafletIfNeeded() {
  if (state.activeTab !== "map") {
    return;
  }

  const el = document.getElementById("leafletMap");
  if (!el) return;
  if (!window.L) {
    void ensureLeafletLoaded().then((loaded) => {
      if (!loaded) {
        setMapNotice("Biblioteka e hartes nuk eshte e disponueshme. Harta mbetet ne modalitet te reduktuar.");
        emitVendorDegraded("map", true, "Biblioteka e hartes nuk eshte e disponueshme. Harta ne modalitet te reduktuar.");
        if (window && typeof window.setTimeout === "function") {
          window.setTimeout(() => {
            if (state.activeTab !== "map") return;
            if (window.L) {
              initLeafletIfNeeded();
              return;
            }
            if (leafletLoadPromise) return;
            leafletLoadFailed = false;
            initLeafletIfNeeded();
          }, LEAFLET_LOAD_RETRY_COOLDOWN_MS);
        }
        return;
      }
      if (state.activeTab !== "map") return;
      initLeafletIfNeeded();
      render();
    });
    return;
  }

  if (leafletMap && !isLeafletMapMountedOn(el)) {
    cleanupLeaflet();
  }
  if (leafletMap && !hasLeafletSurface(el)) {
    const now = Date.now();
    if (!leafletSurfaceMissingSince) {
      leafletSurfaceMissingSince = now;
    }
    scheduleLeafletRefresh(2, { throttleMs: 90 });
    if ((now - leafletSurfaceMissingSince) < 1100) {
      scheduleMapRecoveryCheck(160);
      return;
    }
    cleanupLeaflet();
    leafletSurfaceMissingSince = 0;
  }

  if (leafletMap) {
    leafletSurfaceMissingSince = 0;
    try { leafletMap.invalidateSize(); } catch {}
    scheduleLeafletRefresh(2, { throttleMs: 180 });
    bindMapSearchInput();
    const visibleLocations = renderCurrentMapMarkerSet({ query: getActiveMapSearchQuery(), panToFirst: false });
    fitLeafletToLocations(visibleLocations, { force: false, animate: false });
    hydrateMapSearchFromVerifiedLocation({ recenter: false });
    const verified = resolveVerifiedMapCoords();
    if (verified) setUserMarker(verified.lat, verified.lng, "Vendndodhja e caktuar");
    return;
  }

  leafletMap = window.L.map(el, {
    zoomControl: false,
    attributionControl: false,
    preferCanvas: true,
    fadeAnimation: true,
    zoomAnimation: true,
    markerZoomAnimation: true
  }).setView(DISCOVERY_MAP_DEFAULT_CENTER, DISCOVERY_MAP_DEFAULT_ZOOM);
  leafletSurfaceMissingSince = 0;
  const primaryLayer = createLeafletTileLayer(LEAFLET_TILE_PRIMARY_URL);
  const canUseFallbackLayer = !!LEAFLET_TILE_FALLBACK_URL && LEAFLET_TILE_FALLBACK_URL !== LEAFLET_TILE_PRIMARY_URL;
  const PRIMARY_TILE_ERROR_THRESHOLD = 10;
  let primaryTileErrorCount = 0;
  let primaryTileLoadCount = 0;
  let degradedNoticeShown = false;
  const showDegradedNotice = () => {
    if (degradedNoticeShown) return;
    degradedNoticeShown = true;
    setMapNotice(MAP_TILES_DEGRADED_NOTICE);
    emitVendorDegraded("map", true, "Pllakat e hartes nuk arrihen. Harta shfaq gjendje te reduktuar.");
  };
  const onTileLoad = () => {
    primaryTileLoadCount += 1;
    degradedNoticeShown = false;
    const currentNotice = String(mapNotice || "").trim();
    if (currentNotice === MAP_TILES_DEGRADED_NOTICE || currentNotice === MAP_TILES_FALLBACK_NOTICE) {
      clearMapNotice();
    }
    emitVendorDegraded("map", false, "");
  };
  const activateFallbackLayer = () => {
    if (leafletTileFallbackActive || !canUseFallbackLayer) return false;
    leafletTileFallbackActive = true;
    setMapNotice(MAP_TILES_FALLBACK_NOTICE);
    emitVendorDegraded("map", true, "Primaere Kartenkacheln nicht erreichbar. Fallback aktiv.");
    try { leafletMap.removeLayer(primaryLayer); } catch {}
    const fallbackLayer = createLeafletTileLayer(LEAFLET_TILE_FALLBACK_URL);
    fallbackLayer.on("tileerror", showDegradedNotice);
    fallbackLayer.on("load", onTileLoad);
    fallbackLayer.addTo(leafletMap);
    return true;
  };
  const onPrimaryTileError = () => {
    primaryTileErrorCount += 1;
    const shouldSwitchToFallback = !leafletTileFallbackActive
      && canUseFallbackLayer
      && primaryTileLoadCount === 0
      && primaryTileErrorCount >= PRIMARY_TILE_ERROR_THRESHOLD;
    if (shouldSwitchToFallback) {
      activateFallbackLayer();
      return;
    }
    if (primaryTileErrorCount >= PRIMARY_TILE_ERROR_THRESHOLD) {
      showDegradedNotice();
    }
  };
  primaryLayer.on("tileerror", onPrimaryTileError);
  primaryLayer.on("load", onTileLoad);
  primaryLayer.addTo(leafletMap);
  try {
    leafletMap.whenReady(() => {
      scheduleLeafletRefresh(2);
    });
  } catch {}

  const initialMarkerSet = renderCurrentMapMarkerSet({ query: "", panToFirst: false });
  fitLeafletToLocations(initialMarkerSet, { force: true, animate: false });
  updateMapSheet();
  if (window.lucide?.createIcons) window.lucide.createIcons();
  bindMapSearchInput();
  hydrateMapSearchFromVerifiedLocation({ force: true, recenter: false });
  const verified = resolveVerifiedMapCoords();
  if (verified) setUserMarker(verified.lat, verified.lng, "Vendndodhja e caktuar");
}

function getSelectedMapMarkerKey() {
  const selected = state.selectedBusiness || {};
  const hasSelectionIdentity = !!String(selected?.markerKey || selected?.id || "").trim();
  if (!hasSelectionIdentity) return "";
  return resolveLeafletMarkerKey(selected);
}

function getActiveMapSearchQuery() {
  const searchInput = document.getElementById("mapSearchInput");
  return String(searchInput?.value || "").trim().toLowerCase();
}

function renderLeafletMarkers(locations) {
  if (!leafletMap || !window.L) return;
  const visibleLocations = getDiscoverableMapLocations(locations);
  primeMapMarkerLogos(visibleLocations, 48);
  const selectedMarkerKey = getSelectedMapMarkerKey();
  const nextEntries = new Map();
  visibleLocations.forEach((entry, index) => {
    const coords = normalizeCoordPair(entry?.lat, entry?.lng);
    if (!coords) return;
    const markerKey = resolveLeafletMarkerKey(entry, index);
    const normalized = {
      ...entry,
      markerKey,
      lat: coords.lat,
      lng: coords.lng
    };
    nextEntries.set(markerKey, normalized);
  });

  leafletBizMarkerMap.forEach((marker, markerKey) => {
    if (nextEntries.has(markerKey)) return;
    try { leafletMap.removeLayer(marker); } catch {}
    leafletBizMarkerMap.delete(markerKey);
  });

  nextEntries.forEach((entry, markerKey) => {
    let marker = leafletBizMarkerMap.get(markerKey) || null;
    const isSelected = markerKey === selectedMarkerKey;
    if (!marker) {
      try {
        marker = window.L.marker([entry.lat, entry.lng], {
          icon: makeBizDivIcon(entry, { selected: isSelected }),
          zIndexOffset: isSelected ? 1600 : 600
        }).addTo(leafletMap);
      } catch (err) {
        console.warn("Skipping invalid map marker", entry?.id || "", err);
        return;
      }
      marker.__markerKey = markerKey;
      marker.__visualSignature = buildMarkerVisualSignature(entry, { selected: isSelected });
      marker.on("click", () => {
        const selectedEntry = marker?.__biz || null;
        if (!selectedEntry) return;
        state.selectedBusiness = selectedEntry;
        renderCurrentMapMarkerSet();
        updateMapSheet();
        focusLeafletMap(selectedEntry.lat, selectedEntry.lng, { duration: 0.28 });
      });
      leafletBizMarkerMap.set(markerKey, marker);
    }

    marker.__biz = entry;
    marker.__markerKey = markerKey;
    try {
      const markerLatLng = marker.getLatLng?.() || null;
      const markerLat = Number(markerLatLng?.lat || 0);
      const markerLng = Number(markerLatLng?.lng || 0);
      if (!markerLatLng || Math.abs(markerLat - entry.lat) > 0.000001 || Math.abs(markerLng - entry.lng) > 0.000001) {
        marker.setLatLng([entry.lat, entry.lng]);
      }
    } catch {}
    updateLeafletMarkerVisual(marker, { selected: isSelected });
  });

  if (selectedMarkerKey && !leafletBizMarkerMap.has(selectedMarkerKey)) {
    state.selectedBusiness = null;
  }
  leafletBizMarkers = Array.from(leafletBizMarkerMap.values());
}

function filterMapLocationsByQuery(query) {
  const normalizeToken = (value = "") => {
    const raw = String(value || "");
    const normalized = typeof normalizeSearchKey === "function"
      ? normalizeSearchKey(raw)
      : raw.toLowerCase();
    return String(normalized || "").toLowerCase().trim();
  };
  const key = normalizeToken(query);
  const baseLocations = getDiscoverableMapLocations(state.businessLocations);
  if (!key) return baseLocations;
  const filtered = baseLocations.filter((location) => {
    const nameText = String(location?.name || "");
    const locationText = String(location?.address || location?.city || "");
    const directHaystack = `${nameText} ${locationText}`.toLowerCase();
    if (directHaystack.includes(key)) return true;
    const normalizedHaystack = normalizeToken(`${nameText} ${locationText}`);
    return normalizedHaystack.includes(key);
  });
  if (filtered.length > 0) return filtered;
  const verified = resolveVerifiedMapRecord();
  const verifiedTokens = [verified?.city, verified?.label]
    .map((entry) => normalizeToken(entry))
    .filter(Boolean);
  const isVerifiedCityQuery = verifiedTokens.some((token) => token === key || key.includes(token) || token.includes(key));
  if (isVerifiedCityQuery) return baseLocations;
  return filtered;
}

function renderCurrentMapMarkerSet({
  query = getActiveMapSearchQuery(),
  panToFirst = false
} = {}) {
  const normalizedQuery = String(query || "").toLowerCase().trim();
  const filtered = filterMapLocationsByQuery(normalizedQuery);
  renderLeafletMarkers(filtered);
  if (panToFirst && filtered.length > 0 && normalizedQuery.length > 2) {
    const first = filtered[0];
    const markerKey = resolveLeafletMarkerKey(first);
    if (markerKey && markerKey !== mapSearchLastPanKey) {
      mapSearchLastPanKey = markerKey;
      focusLeafletMap(first.lat, first.lng, { zoom: Math.max(DISCOVERY_MAP_DEFAULT_ZOOM + 1, 15), duration: 0.3 });
    }
  }
  if (!normalizedQuery) {
    mapSearchLastPanKey = "";
  }
  return filtered;
}

function setMapSearchUiExpanded(expanded = true, { focus = false } = {}) {
  mapSearchUiExpanded = expanded === true;
  const searchShell = document.getElementById("mapSearchShell");
  if (searchShell) {
    searchShell.classList.toggle("map-search-shell--expanded", mapSearchUiExpanded);
  }
  const expandBtn = document.getElementById("mapSearchExpandBtn");
  if (expandBtn) {
    expandBtn.setAttribute("aria-expanded", mapSearchUiExpanded ? "true" : "false");
  }
  const searchInput = document.getElementById("mapSearchInput");
  if (!(searchInput instanceof HTMLInputElement)) return;
  const nextPlaceholder = mapSearchUiExpanded
    ? MAP_SEARCH_PLACEHOLDER_EXPANDED
    : MAP_SEARCH_PLACEHOLDER_COLLAPSED;
  if (searchInput.placeholder !== nextPlaceholder) {
    searchInput.placeholder = nextPlaceholder;
  }
  if (mapSearchUiExpanded && focus) {
    try {
      searchInput.focus({ preventScroll: true });
    } catch {
      searchInput.focus();
    }
  }
}

function bindMapSearchInput() {
  const searchInput = document.getElementById("mapSearchInput");
  if (!searchInput) return;
  const expandBtn = document.getElementById("mapSearchExpandBtn");
  setMapSearchUiExpanded(mapSearchUiExpanded, { focus: false });
  const applyFilter = ({ panToFirst = false } = {}) => {
    renderCurrentMapMarkerSet({
      query: searchInput.value,
      panToFirst
    });
    if (state.selectedBusiness && !leafletBizMarkerMap.has(getSelectedMapMarkerKey())) {
      state.selectedBusiness = null;
    }
    updateMapSheet();
  };
  if (expandBtn && expandBtn.dataset.bound !== "true") {
    expandBtn.addEventListener("click", () => {
      setMapSearchUiExpanded(true, { focus: true });
    });
    expandBtn.dataset.bound = "true";
  }
  if (searchInput.dataset.expandBound !== "true") {
    searchInput.addEventListener("focus", () => {
      setMapSearchUiExpanded(true, { focus: false });
    });
    searchInput.addEventListener("blur", () => {
      window.setTimeout(() => {
        const activeEl = document.activeElement;
        const hasValue = !!String(searchInput.value || "").trim();
        if (!hasValue && activeEl !== searchInput && activeEl !== expandBtn) {
          setMapSearchUiExpanded(false, { focus: false });
        }
      }, 90);
    });
    searchInput.dataset.expandBound = "true";
  }
  if (searchInput.dataset.bound !== "true") {
    searchInput.addEventListener("input", () => {
      if (!mapSearchUiExpanded) {
        setMapSearchUiExpanded(true, { focus: false });
      }
      const queryLength = String(searchInput.value || "").trim().length;
      if (mapSearchFilterTimer) {
        clearTimeout(mapSearchFilterTimer);
      }
      mapSearchFilterTimer = window.setTimeout(() => {
        mapSearchFilterTimer = null;
        applyFilter({ panToFirst: queryLength > 2 });
      }, 120);
    });
    searchInput.dataset.bound = "true";
  }
  if (String(searchInput.value || "").trim()) {
    applyFilter({ panToFirst: false });
  }
}

function setUserMarker(lat, lng, label = "Pozicioni yt") {
  if (!leafletMap || !window.L) return;
  
  let avatarUrl = getSelfAvatarUrl();
  if (!avatarUrl || isPlaceholderUrl(avatarUrl)) {
    const nameStr = state.userProfile.name || "User";
    avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(nameStr)}&background=4f46e5&color=fff`;
  }

  const html = `
    <div class="relative w-12 h-12 z-[1000] user-radar">
      <img src="${escapeHtml(avatarUrl)}" class="w-full h-full rounded-full object-cover border-[3px] border-white shadow-lg relative z-10 bg-slate-200" onerror="this.src='${PLACEHOLDER_IMAGE}'" />
    </div>
  `;
  const markerIcon = window.L.divIcon({ className: "custom-div-icon", html, iconSize: [48, 48], iconAnchor: [24, 24] });

  if (!leafletUserMarker) {
    leafletUserMarker = window.L.marker([lat, lng], { icon: markerIcon, zIndexOffset: 2000 }).addTo(leafletMap);
  } else {
    leafletUserMarker.setLatLng([lat, lng]);
    leafletUserMarker.setIcon(markerIcon);
  }
}

function readStoredViewerLocationRecord() {
  if (!window?.localStorage) return null;
  try {
    const raw = window.localStorage.getItem(FEED_VIEWER_LOCATION_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    const coords = normalizeCoordPair(
      parsed?.lat ?? parsed?.latitude,
      parsed?.lng ?? parsed?.lon ?? parsed?.longitude
    );
    if (!coords) {
      try {
        window.localStorage.removeItem(FEED_VIEWER_LOCATION_STORAGE_KEY);
      } catch {}
      return null;
    }
    return {
      lat: coords.lat,
      lng: coords.lng,
      city: String(parsed?.city || "").trim(),
      label: String(parsed?.label || "").trim()
    };
  } catch {
    try {
      window.localStorage.removeItem(FEED_VIEWER_LOCATION_STORAGE_KEY);
    } catch {}
    return null;
  }
}

function resolveVerifiedMapRecord() {
  const stored = readStoredViewerLocationRecord();
  if (typeof getVerifiedMapLocation !== "function") return stored;
  let verified = null;
  try {
    verified = getVerifiedMapLocation();
  } catch {}
  const coords = normalizeCoordPair(
    verified?.lat ?? verified?.latitude,
    verified?.lng ?? verified?.lon ?? verified?.longitude
  );
  const city = String(verified?.city || "").trim();
  const label = String(verified?.label || "").trim();
  if (coords) {
    return {
      lat: coords.lat,
      lng: coords.lng,
      city: city || String(stored?.city || "").trim(),
      label: label || String(stored?.label || "").trim()
    };
  }
  return stored;
}

function resolveVerifiedMapCoords() {
  const verified = resolveVerifiedMapRecord();
  if (!verified) return null;
  return { lat: verified.lat, lng: verified.lng };
}

function hydrateMapSearchFromVerifiedLocation({ force = false, recenter = true } = {}) {
  const searchInput = document.getElementById("mapSearchInput");
  if (!(searchInput instanceof HTMLInputElement)) return false;
  const currentQuery = String(searchInput.value || "").trim();
  if (!force && currentQuery) return false;
  const verified = resolveVerifiedMapRecord();
  if (!verified) return false;
  const verifiedQuery = String(verified.city || verified.label || "").trim();
  const preserveManualQuery = !!currentQuery
    && currentQuery.toLowerCase() !== verifiedQuery.toLowerCase();
  if (!preserveManualQuery) {
    if (currentQuery) searchInput.value = "";
    renderCurrentMapMarkerSet({ query: "", panToFirst: false });
  }
  if (leafletMap) {
    const shouldRefocus = recenter && (force || !isLeafletCenterClose(verified.lat, verified.lng));
    if (shouldRefocus) {
      focusLeafletMap(verified.lat, verified.lng, { zoom: Math.max(DISCOVERY_MAP_DEFAULT_ZOOM + 1, 15), duration: 0.24 });
    }
    setUserMarker(verified.lat, verified.lng, "Vendndodhja e caktuar");
  }
  if (state.selectedBusiness && !leafletBizMarkerMap.has(getSelectedMapMarkerKey())) {
    state.selectedBusiness = null;
  }
  updateMapSheet();
  return true;
}

function mapLocate(options = {}) {
  const preferVerified = !!(options && typeof options === "object" && options.preferVerified === true);
  const applyVerifiedLocation = (label = "Vendndodhja e caktuar") => {
    const verified = resolveVerifiedMapCoords();
    if (!verified || !leafletMap) return false;
    clearMapNotice({ refresh: true });
    focusLeafletMap(verified.lat, verified.lng);
    setUserMarker(verified.lat, verified.lng, label);
    return true;
  };
  if (preferVerified && applyVerifiedLocation()) {
    return;
  }
  const override = getCeoGpsOverride();
  if (isCeoUser() && override) {
    clearMapNotice({ refresh: true });
    if (leafletMap) {
      focusLeafletMap(override.lat, override.lng);
      setUserMarker(override.lat, override.lng, "Pozicioni yt");
    }
    return;
  }
  if (!navigator.geolocation) {
    if (applyVerifiedLocation()) return;
    setMapNotice("Vendndodhja nuk eshte e disponueshme ne kete pajisje.");
    return;
  }
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;
      clearMapNotice({ refresh: true });
      if (leafletMap) {
        focusLeafletMap(lat, lng);
        setUserMarker(lat, lng, "Pozicioni yt");
      }
    },
    () => {
      if (applyVerifiedLocation()) return;
      setMapNotice("Vendndodhja nuk mund te merrej. Ju lutem kontrolloni lejen.");
    },
    { enableHighAccuracy: false, timeout: 5500, maximumAge: 60000 }
  );
}

function updateSearchLogoNodes(biz) {
  if (!biz?.id) return;
  const bizId = escapeSelector(biz.id);
  const restaurant = state.restaurants.find((r) => r.id === biz.id) || {};
  const logoSource = restaurant.logoUrl || restaurant.logo || biz.logo || biz.image || "";
  const logoUrl = resolveRestaurantLogo(biz.id, logoSource, "avatar");
  document.querySelectorAll(`[data-search-logo="${bizId}"]`).forEach((img) => {
    if (!(img instanceof HTMLImageElement)) return;
    if (img.getAttribute("src") !== logoUrl) img.setAttribute("src", logoUrl);
  });
}

function updateSearchBusinessNodes(biz) {
  if (!biz?.id) return;
  const bizId = escapeSelector(biz.id);
  const name = biz.name || "Business";
  const city = formatBusinessLocationLabel(biz.city);
  document.querySelectorAll(`[data-search-business="${bizId}"]`).forEach((el) => {
    if (!(el instanceof HTMLElement)) return;
    el.dataset.searchName = name;
    const nameEl = el.querySelector("[data-search-business-name]");
    if (nameEl && nameEl.textContent !== name) nameEl.textContent = name;
    const cityEl = el.querySelector("[data-search-business-city]");
    if (cityEl && cityEl.textContent !== city) cityEl.textContent = city;
  });
  updateSearchLogoNodes(biz);
}

function updateSearchUserNodes(user) {
  if (!user?.uid) return;
  const uid = escapeSelector(user.uid);
  const handle = user.handle || normalizeHandle(user.name || "user");
  const displayName = sanitizeDisplayName(user.name, handle || "User");
  const avatarUrl = resolveSearchUserAvatarDisplay(user);
  document.querySelectorAll(`[data-search-user="${uid}"]`).forEach((el) => {
    if (!(el instanceof HTMLElement)) return;
    el.dataset.searchHandle = handle;
    el.dataset.searchName = displayName;
    el.dataset.searchAvatar = user.avatarUrl || user.avatar || "";
    el.dataset.searchLocation = user.location || "";
    const nameEl = el.querySelector("[data-search-user-name]");
    if (nameEl && nameEl.textContent !== displayName) nameEl.textContent = displayName;
    const handleEl = el.querySelector("[data-search-user-handle]");
    const handleLabel = `@${handle}`;
    if (handleEl && handleEl.textContent !== handleLabel) handleEl.textContent = handleLabel;
    const img = el.querySelector("img");
    if (img instanceof HTMLImageElement && img.getAttribute("src") !== avatarUrl) {
      img.setAttribute("src", avatarUrl);
    }
  });
}

function normalizeBusinessResult(rest) {
  if (!isPublicBusinessRecord(rest)) return null;
  const name = rest.name || rest.restaurantName || "Business";
  return {
    id: rest.id || rest.restaurantId || "",
    name,
    city: String(rest.city || rest.location || rest.address || "").trim(),
    logo: rest.logoUrl || rest.logo || rest.image || ""
  };
}

function buildBusinessResultsFromFeed(posts) {
  const map = new Map();
  posts.forEach((post) => {
    const id = post.restaurantId || post.ownerId || "";
    const key = id || String(post.business || "").toLowerCase();
    if (!key || map.has(key)) return;
    if (isForceHiddenBusinessEntity({
      id: id || key,
      restaurantId: id || key,
      ownerId: post.ownerId || "",
      ownerUid: post.ownerUid || "",
      handle: post.handle || "",
      businessName: post.business || "",
      restaurantName: post.restaurantName || "",
      ownerEmail: post.ownerEmail || "",
      email: post.email || ""
    })) {
      return;
    }
    map.set(key, {
      id: id || key,
      name: post.business || "Business",
      city: String(post.location || post.city || "").trim(),
      logo: post.logo || ""
    });
  });
  return Array.from(map.values()).slice(0, SEARCH_LIMITS.businesses);
}

function buildLocalBusinessResults(queryKey) {
  const list = state.restaurants.length
    ? state.restaurants.map(normalizeBusinessResult).filter(Boolean)
    : buildBusinessResultsFromFeed(state.feedPosts);
  const localKey = normalizeSearchKey(state.userProfile.location || "");
  const isLocalQuery = queryKey === "lokal" || queryKey === "local" || (!queryKey && localKey);
  const filtered = list.filter((item) => {
    if (isLocalQuery && localKey) {
      return normalizeSearchKey(item.city).includes(localKey);
    }
    const score = Math.max(
      scoreSearchMatch(item.name, queryKey),
      scoreSearchMatch(item.city, queryKey)
    );
    return score > 0;
  }).map((item) => {
    const score = queryKey ? Math.max(
      scoreSearchMatch(item.name, queryKey),
      scoreSearchMatch(item.city, queryKey)
    ) : 0;
    return { ...item, _score: score };
  });
  return filtered.sort((a, b) => (b._score || 0) - (a._score || 0)).slice(0, SEARCH_LIMITS.businesses);
}

function normalizeUserSearchResult(doc) {
  const data = typeof doc?.data === "function" ? doc.data() : (doc?.data || doc || {});
  const rawName = data.displayName || data.name || data.handle || "";
  const handle = data.handle || normalizeHandle(rawName || "user");
  const email = data.email || data.loginEmail || data.ownerEmail || "";
  if (isForceHiddenHandle(handle || rawName) || isForceHiddenEmail(email)) return null;
  const name = sanitizeDisplayName(rawName, handle || "User");
  return {
    uid: doc?.id || data.uid || "",
    name,
    handle,
    email,
    avatar: data.avatarUrl || data.avatar || '',
    location: String(data.city || data.location || "").trim(),
    followers: data.followersCount ?? data.followers ?? 0,
    following: data.followingCount ?? data.following ?? 0,
    role: data.role || "user",
    restaurantId: data.restaurantId || "",
    bio: data.bio || ""
  };
}

function isBusinessSearchUser(user) {
  const role = String(user?.role || "").toLowerCase();
  return role === "business" || !!user?.restaurantId;
}

async function searchUsersRemote(queryRaw, token) {
  if (isGuestSession()) {
    state.search.userResults = [];
    return;
  }
  const queryKey = normalizeSearchKey(queryRaw);
  const nameKey = normalizeSearchQuery(queryRaw);
  if (!queryKey) {
    state.search.userResults = [];
    return;
  }
  const cacheKey = `users:${queryKey}`;
  const cached = searchCache.get(cacheKey);
  if (cached) {
    state.search.userResults = cached.filter((item) => (
      item?.uid
      && !isBusinessSearchUser(item)
      && !isForceHiddenHandle(item?.handle || item?.name || "")
      && !isForceHiddenEmail(item?.email || "")
    ));
    return;
  }
  try {
    const handleKey = normalizeHandle(queryKey);
    const users = new Map();
    if (handleKey) {
      const snap = await getDocs(query(
        collection(db, "users"),
        orderBy("handle"),
        startAt(handleKey),
        endAt(`${handleKey}\uf8ff`),
        limit(SEARCH_LIMITS.users)
      ));
      snap.forEach((docSnap) => {
        const item = normalizeUserSearchResult(docSnap);
        if (item?.uid && !isBusinessSearchUser(item)) users.set(item.uid, item);
      });
    }
    const nameVariants = new Set();
    if (nameKey) {
      nameVariants.add(nameKey);
      const cap = nameKey.charAt(0).toUpperCase() + nameKey.slice(1);
      nameVariants.add(cap);
    }
    for (const variant of nameVariants) {
      const nameSnap = await getDocs(query(
        collection(db, "users"),
        orderBy("displayName"),
        startAt(variant),
        endAt(`${variant}\uf8ff`),
        limit(SEARCH_LIMITS.users)
      ));
      nameSnap.forEach((docSnap) => {
        const item = normalizeUserSearchResult(docSnap);
        if (item?.uid && !isBusinessSearchUser(item)) users.set(item.uid, item);
      });
    }
    if (token !== searchToken) return;
    const key = normalizeSearchKey(queryRaw);
    const results = Array.from(users.values())
      .filter((item) => (
        !isBusinessSearchUser(item)
        && !isForceHiddenHandle(item?.handle || item?.name || "")
        && !isForceHiddenEmail(item?.email || "")
      ))
      .map((item) => ({
        ...item,
        _score: Math.max(
          scoreSearchMatch(item.handle, key),
          scoreSearchMatch(item.name, key)
        )
      }))
      .sort((a, b) => (b._score || 0) - (a._score || 0));
    searchCache.set(cacheKey, results);
    state.search.userResults = results;
  } catch (err) {
    if (token !== searchToken) return;
    state.search.error = "Kerkimi deshtoi.";
  }
}

async function searchBusinessesRemote(queryRaw, token) {
  const queryKey = normalizeSearchQuery(queryRaw);
  const key = normalizeSearchKey(queryRaw);
  if (!key) return;
  const cacheKey = `biz:${key}`;
  const cached = searchCache.get(cacheKey);
  if (cached) {
    state.search.businessResults = cached;
    return;
  }
  try {
    const results = new Map();
    const restRef = collection(db, "restaurants");
    try {
      const snap = await getDocs(query(
        restRef,
        orderBy("name"),
        startAt(queryKey),
        endAt(`${queryKey}\uf8ff`),
        limit(SEARCH_LIMITS.businesses)
      ));
      snap.forEach((docSnap) => {
        const row = normalizeBusinessResult({ id: docSnap.id, ...docSnap.data() });
        if (row?.id) results.set(row.id, row);
      });
    } catch {}
    try {
      const snap = await getDocs(query(
        restRef,
        orderBy("restaurantName"),
        startAt(queryKey),
        endAt(`${queryKey}\uf8ff`),
        limit(SEARCH_LIMITS.businesses)
      ));
      snap.forEach((docSnap) => {
        const row = normalizeBusinessResult({ id: docSnap.id, ...docSnap.data() });
        if (row?.id) results.set(row.id, row);
      });
    } catch {}
    if (token !== searchToken) return;
    const list = Array.from(results.values())
      .map((item) => ({
        ...item,
        _score: Math.max(
          scoreSearchMatch(item.name, key),
          scoreSearchMatch(item.city, key)
        )
      }))
      .sort((a, b) => (b._score || 0) - (a._score || 0));
    if (list.length) {
      searchCache.set(cacheKey, list);
      state.search.businessResults = list;
    }
  } catch (err) {
    if (token !== searchToken) return;
    state.search.error = "Kerkimi deshtoi.";
  }
}

async function searchRemote(queryRaw) {
  const token = ++searchToken;
  state.search.loading = true;
  state.search.error = "";
  if (!refreshSearchView()) render();
  await Promise.all([
    searchUsersRemote(queryRaw, token),
    searchBusinessesRemote(queryRaw, token)
  ]);
  if (token === searchToken) {
    state.search.loading = false;
    if (!refreshSearchView()) render();
  }
}

function handleSearchInput(value) {
  const raw = normalizeSearchQuery(value);
  const queryKey = normalizeSearchKey(raw);
  state.search.query = raw;
  state.search.businessResults = buildLocalBusinessResults(queryKey);
  state.search.keepFocus = true;
  if (searchTimer) {
    clearTimeout(searchTimer);
    searchTimer = null;
  }
  if (!queryKey) {
    state.search.userResults = [];
    state.search.loading = false;
    state.search.error = "";
    if (!refreshSearchView()) render();
    return;
  }
  if (queryKey.length < 3) {
    state.search.userResults = [];
    state.search.loading = false;
    state.search.error = "";
    if (!refreshSearchView()) render();
    return;
  }
  if (!refreshSearchView()) render();
  searchTimer = window.setTimeout(() => {
    void searchRemote(raw);
  }, 450);
}

function renderMapSheet(selected) {
  const imageUrl = getOptimizedImageUrl(selected.img, "thumb");
  const typeLabel = isTravelHotelTypeKey(resolveMapBusinessTypeKey(selected)) ? "Hotel" : "Restaurant";
  return `
    <div class="animate-in slide-in-from-bottom-6 duration-300">
      <div class="bg-white/95 backdrop-blur-xl rounded-[2rem] p-5 shadow-[0_30px_60px_rgba(0,0,0,0.25)] border border-slate-100/50 relative">
        <div class="absolute top-2 left-1/2 -translate-x-1/2 w-12 h-1 bg-slate-200 rounded-full"></div>

        <button id="mapCloseBtn" class="absolute top-4 right-4 w-8 h-8 bg-slate-100/80 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors">
          ${icon("x", "w-4 h-4")}
        </button>

        <div class="flex gap-4 pr-6 mt-2">
          <div id="mapVisitProfileImgBtn" class="w-20 h-20 rounded-[1.5rem] bg-slate-50 p-1 border border-slate-100 shadow-sm flex-shrink-0 overflow-hidden relative group cursor-pointer">
            <img src="${escapeHtml(imageUrl)}" class="w-full h-full object-cover rounded-[1.3rem] group-hover:scale-105 transition-transform" onerror="this.src='${PLACEHOLDER_IMAGE}'" />
          </div>
          <div class="flex-1 pt-1">
            <span class="text-[9px] font-black text-indigo-600 uppercase tracking-widest bg-indigo-50 px-2 py-0.5 rounded-md inline-block mb-1">${escapeHtml(typeLabel)}</span>
            <h3 class="text-lg font-black tracking-tight text-slate-900 leading-tight line-clamp-1">${escapeHtml(selected.name || "Business")}</h3>
            <div class="flex items-center gap-2 mt-1 text-[11px] font-black text-slate-700">
              <span class="flex items-center gap-1 text-indigo-600">${icon("star", "w-3 h-3 fill-indigo-600 text-indigo-600")} ${escapeHtml(selected.rating)}</span>
              <span class="text-emerald-500 flex items-center gap-1.5 ml-2"><div class="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.6)]"></div> Hapur</span>
            </div>
            <div class="flex items-center gap-1.5 mt-2 text-slate-500 text-[10px] font-bold line-clamp-1">
              ${icon("map-pin", "w-3 h-3")} ${escapeHtml(selected.address)}
            </div>
          </div>
        </div>

        <div class="mt-5 flex gap-3">
          <button id="mapVisitProfileBtn" class="flex-1 bg-slate-900 text-white py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-wider active:scale-95 transition-all shadow-md flex items-center justify-center gap-2 hover:bg-slate-800">
            ${icon("user", "w-4 h-4")} Profil
          </button>
          <button id="mapOpenRouteBtn" class="w-14 h-[46px] bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center active:scale-95 transition-all hover:bg-indigo-100 border border-indigo-100/50">
            ${icon("navigation", "w-5 h-5")}
          </button>
        </div>
      </div>
    </div>
  `;
}

function renderMapView() {
  const travelMap = isTravelMapScopeActive();
  const hasLeaflet = !!window.L;
  const mapInfoLabel = leafletLoadFailed
    ? "Harta nuk mund te ngarkohej."
    : (leafletLoadPromise ? "Harta po ngarkohet ..." : "Harta po pergatitet ...");
  const mapTruthState = renderMapTruthState();
  const mapSearchExpanded = mapSearchUiExpanded === true;
  const mapSearchPlaceholder = mapSearchExpanded
    ? MAP_SEARCH_PLACEHOLDER_EXPANDED
    : MAP_SEARCH_PLACEHOLDER_COLLAPSED;
  // Einblenden nur beim ersten Aufbau. Steht die Kartenflaeche schon im DOM
  // (Platzhalter oder Re-Render), wuerde die Animation erneut von Deckkraft 0
  // starten und als Flackern sichtbar werden.
  const mapSurfaceMounted = !!document?.querySelector?.(".map-view-surface");
  const rootEnterClass = mapSurfaceMounted ? "" : " animate-in fade-in duration-700";
  return `
    <div class="map-view-root${rootEnterClass}">
      <div class="map-view-intro">
        <div>
          <h2 class="text-2xl font-black italic uppercase tracking-tighter text-slate-900">Harta</h2>
          <p class="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1 italic">${travelMap ? "Hotele" : "Zbulo lokale"}</p>
        </div>
      </div>
      ${mapTruthState ? `<div class="map-view-truth">${mapTruthState}</div>` : ""}

      <div class="map-view-surface">
        <div id="leafletMap" class="absolute inset-0 z-10 bg-slate-200"></div>
        ${hasLeaflet ? "" : `<div class="absolute inset-0 z-20 flex items-center justify-center opacity-40 text-slate-500 text-xs font-black uppercase tracking-widest">${escapeHtml(mapInfoLabel)}</div>`}
        
        <div class="map-view-overlay-top">
          <div id="mapNoticeSlot" class="mb-3">${renderMapNotice()}</div>
          <div id="mapSearchShell" class="map-search-shell${mapSearchExpanded ? " map-search-shell--expanded" : ""}">
            <button id="mapSearchExpandBtn" type="button" aria-label="Hap kerkimin" aria-expanded="${mapSearchExpanded ? "true" : "false"}" class="map-search-expand-btn">
              ${icon("search", "w-4 h-4")}
            </button>
            <input id="mapSearchInput" type="text" placeholder="${escapeHtml(mapSearchPlaceholder)}" class="map-search-input" />
          </div>
        </div>

        <div class="map-view-overlay-bottom-right">
          <button id="mapLocateBtn" class="w-12 h-12 rounded-2xl bg-indigo-600 shadow-[0_8px_20px_rgba(79,70,229,0.4)] flex items-center justify-center text-white active:scale-95 transition-all">
            ${icon("navigation", "w-5 h-5 fill-white")}
          </button>
        </div>

        <div id="mapSheetSlot" class="map-view-sheet-slot"></div>
      </div>
    </div>
  `;
}

function renderSearchUserItem(user) {
  const handle = user.handle || normalizeHandle(user.name || "user");
  const displayName = sanitizeDisplayName(user.name, handle || "User");
  const avatarUrl = resolveSearchUserAvatarDisplay(user);
  const avatarRaw = user.avatarUrl || user.avatar || "";
  return `
    <button data-search-user="${escapeHtml(user.uid)}" data-search-handle="${escapeHtml(handle)}" data-search-name="${escapeHtml(displayName)}" data-search-avatar="${escapeHtml(avatarRaw)}" data-search-location="${escapeHtml(user.location)}" class="w-full flex items-center gap-4 p-4 rounded-[2rem] bg-white border border-slate-100 shadow-sm hover:shadow-md transition-all text-left">
      <img src="${escapeHtml(avatarUrl)}" data-img-key="search-user:${escapeHtml(user.uid)}" class="w-12 h-12 rounded-2xl object-cover bg-slate-200" />
      <div class="flex-1 min-w-0">
        <p data-search-user-name class="text-sm font-black text-slate-900 truncate">${escapeHtml(displayName)}</p>
        <p data-search-user-handle class="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate">@${escapeHtml(handle)}</p>
      </div>
      <span class="text-[9px] font-black text-indigo-500 uppercase tracking-widest">User</span>
    </button>
  `;
}

function renderSearchBusinessItem(biz) {
  const name = biz.name || "Business";
  const logoUrl = resolveRestaurantLogo(biz.id, biz.logo, "avatar");
  const cityLabel = formatBusinessLocationLabel(biz.city);
  const logoAttr = biz.id ? `data-search-logo="${escapeHtml(biz.id)}"` : "";
  return `
    <button data-search-business="${escapeHtml(biz.id)}" data-search-name="${escapeHtml(name)}" class="w-full flex items-center gap-4 p-4 rounded-[2rem] bg-white border border-slate-100 shadow-sm hover:shadow-md transition-all text-left">
      <img src="${escapeHtml(logoUrl)}" ${logoAttr} data-img-key="search-biz:${escapeHtml(biz.id)}" class="w-12 h-12 rounded-2xl object-contain bg-white" />
      <div class="flex-1 min-w-0">
        <p data-search-business-name class="text-sm font-black text-slate-900 truncate">${escapeHtml(name)}</p>
        <p data-search-business-city class="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate">${escapeHtml(cityLabel)}</p>
      </div>
      <span class="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Business</span>
    </button>
  `;
}

function renderSearchView() {
  const query = state.search.query;
  const queryKey = normalizeSearchKey(query);
  const isGuest = isGuestSession();
  const filter = String(state.search.filter || "all");
  const safeFilter = isGuest && (filter === "all" || filter === "users") ? "business" : filter;
  const users = state.search.userResults || [];
  const businesses = state.search.businessResults?.length ? state.search.businessResults : buildLocalBusinessResults(queryKey);
  const showUsers = !isGuest && (safeFilter === "all" || safeFilter === "users");
  const showBusinesses = safeFilter === "all" || safeFilter === "business" || safeFilter === "local";
  const localLabel = safeFilter === "local" || queryKey === "lokal" || queryKey === "local" ? "Lokal" : "Business";
  const hasResults = (showUsers && users.length) || (showBusinesses && businesses.length);
  const filters = isGuest
    ? [
      { id: "business", label: "Business" },
      { id: "local", label: "Lokal" }
    ]
    : [
      { id: "all", label: "Alles" },
      { id: "users", label: "User" },
      { id: "business", label: "Business" },
      { id: "local", label: "Lokal" }
    ];

  return `
    <div id="searchView" class="p-6 animate-in slide-in-from-right-10 duration-700 h-full">
      <div class="mb-6 px-1">
        <p class="text-[9px] font-black text-indigo-600 uppercase tracking-widest">Zbulo</p>
        <h2 class="text-2xl font-black italic uppercase tracking-tighter">Kerkimi</h2>
      </div>

      <div class="relative mb-5">
        <input id="searchInput" type="text" value="${escapeHtml(query)}" placeholder="Kerko perdorues, emer ose lokal..." class="w-full h-14 rounded-[2rem] border border-slate-100 bg-white px-5 pr-12 text-sm font-semibold outline-none shadow-sm focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition" />
        <button id="searchClearBtn" class="absolute right-4 top-1/2 -translate-y-1/2 w-9 h-9 rounded-2xl bg-slate-50 text-slate-400 hover:text-slate-700 transition">
          ${icon("x", "w-4 h-4")}
        </button>
      </div>

      <div class="flex gap-2 mb-6">
        ${filters.map((item) => `
          <button data-search-filter="${item.id}" class="px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition ${safeFilter === item.id ? "bg-slate-900 text-white shadow-md" : "bg-white text-slate-400 border border-slate-100"}">
            ${item.label}
          </button>
        `).join("")}
      </div>

      <div id="searchStatusLoading" class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 ${state.search.loading ? "" : "hidden"}">Duke kerkuar...</div>
      <div id="searchStatusError" class="text-xs font-bold text-rose-500 mb-4 ${state.search.error ? "" : "hidden"}">${escapeHtml(state.search.error || "")}</div>
      <div id="searchEmptyState" class="text-center py-16 text-slate-300 font-black uppercase text-[10px] tracking-[0.3em] ${!hasResults && !query ? "" : "hidden"}">Prek per te kerkuar</div>

      <div id="searchUsersSection" class="space-y-4 mb-10 ${showUsers ? "" : "hidden"}">
        <div class="flex items-center justify-between px-1">
          <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">User</p>
          <p id="searchUsersCount" class="text-[10px] font-bold text-slate-300">${users.length}</p>
        </div>
        <div id="searchUsersList" class="space-y-4">
          ${users.length ? users.map(renderSearchUserItem).join("") : (query ? `<div class="text-xs font-bold text-slate-300 px-2">Nuk u gjeten perdorues.</div>` : "")}
        </div>
      </div>

      <div id="searchBizSection" class="space-y-4 ${showBusinesses ? "" : "hidden"}">
        <div class="flex items-center justify-between px-1">
          <p id="searchBizLabel" class="text-[10px] font-black text-slate-400 uppercase tracking-widest">${localLabel}</p>
          <p id="searchBizCount" class="text-[10px] font-bold text-slate-300">${businesses.length}</p>
        </div>
        <div id="searchBizList" class="space-y-4">
          ${businesses.length ? businesses.map(renderSearchBusinessItem).join("") : (query ? `<div class="text-xs font-bold text-slate-300 px-2">Nuk u gjeten ${localLabel}.</div>` : "")}
        </div>
      </div>
    </div>
  `;
}

function updateSearchDom() {
  const searchView = document.getElementById("searchView");
  if (!searchView) return false;

  const query = state.search.query;
  const queryKey = normalizeSearchKey(query);
  const isGuest = isGuestSession();
  const filter = String(state.search.filter || "all");
  const safeFilter = isGuest && (filter === "all" || filter === "users") ? "business" : filter;
  const users = state.search.userResults || [];
  const businesses = state.search.businessResults?.length ? state.search.businessResults : buildLocalBusinessResults(queryKey);
  const showUsers = !isGuest && (safeFilter === "all" || safeFilter === "users");
  const showBusinesses = safeFilter === "all" || safeFilter === "business" || safeFilter === "local";
  const localLabel = safeFilter === "local" || queryKey === "lokal" || queryKey === "local" ? "Lokal" : "Business";
  const hasResults = (showUsers && users.length) || (showBusinesses && businesses.length);

  const searchInput = document.getElementById("searchInput");
  if (searchInput && document.activeElement !== searchInput && searchInput.value !== query) {
    searchInput.value = query;
  }

  const loadingEl = document.getElementById("searchStatusLoading");
  if (loadingEl) loadingEl.classList.toggle("hidden", !state.search.loading);
  const errorEl = document.getElementById("searchStatusError");
  if (errorEl) {
    errorEl.textContent = state.search.error || "";
    errorEl.classList.toggle("hidden", !state.search.error);
  }
  const emptyEl = document.getElementById("searchEmptyState");
  if (emptyEl) emptyEl.classList.toggle("hidden", !!query || hasResults);

  const usersSection = document.getElementById("searchUsersSection");
  if (usersSection) usersSection.classList.toggle("hidden", !showUsers);
  const usersCount = document.getElementById("searchUsersCount");
  if (usersCount) usersCount.textContent = String(users.length);
  const usersList = document.getElementById("searchUsersList");
  if (usersList) {
    if (!users.length) {
      usersList.innerHTML = query
        ? `<div class="text-xs font-bold text-slate-300 px-2">Nuk u gjeten perdorues.</div>`
        : "";
    } else {
      patchSearchUserList(users);
    }
  }

  const bizSection = document.getElementById("searchBizSection");
  if (bizSection) bizSection.classList.toggle("hidden", !showBusinesses);
  const bizLabel = document.getElementById("searchBizLabel");
  if (bizLabel) bizLabel.textContent = localLabel;
  const bizCount = document.getElementById("searchBizCount");
  if (bizCount) bizCount.textContent = String(businesses.length);
  const bizList = document.getElementById("searchBizList");
  if (bizList) {
    if (!businesses.length) {
      bizList.innerHTML = query
        ? `<div class="text-xs font-bold text-slate-300 px-2">Nuk u gjeten ${localLabel}.</div>`
        : "";
    } else {
      patchSearchBusinessList(businesses);
      businesses.forEach(updateSearchBusinessNodes);
    }
  }

  document.querySelectorAll("[data-search-filter]").forEach((btn) => {
    const isActive = btn.dataset.searchFilter === safeFilter;
    btn.classList.toggle("bg-slate-900", isActive);
    btn.classList.toggle("text-white", isActive);
    btn.classList.toggle("shadow-md", isActive);
    btn.classList.toggle("bg-white", !isActive);
    btn.classList.toggle("text-slate-400", !isActive);
    btn.classList.toggle("border", !isActive);
    btn.classList.toggle("border-slate-100", !isActive);
  });

  if (window.lucide?.createIcons) window.lucide.createIcons();
  return true;
}

function patchSearchBusinessList(businesses) {
  const bizList = document.getElementById("searchBizList");
  if (!bizList) return false;
  const existingItems = Array.from(bizList.querySelectorAll("[data-search-business]"));
  const currentIds = existingItems.map((el) => el.dataset.searchBusiness || "");
  const nextIds = businesses.map((biz) => String(biz.id || ""));
  if (currentIds.join("|") === nextIds.join("|")) {
    return true;
  }
  const existingMap = new Map();
  existingItems.forEach((el) => existingMap.set(el.dataset.searchBusiness || "", el));
  const fragment = document.createDocumentFragment();
  businesses.forEach((biz) => {
    const id = String(biz.id || "");
    const existing = id ? existingMap.get(id) : null;
    if (existing) {
      existingMap.delete(id);
      fragment.appendChild(existing);
    } else {
      const tpl = document.createElement("template");
      tpl.innerHTML = renderSearchBusinessItem(biz);
      const node = tpl.content.firstElementChild;
      if (node) fragment.appendChild(node);
    }
  });
  bizList.replaceChildren(fragment);
  return true;
}

function refreshSearchView() {
  if (state.activeTab === "search" && getLastRenderMode() === "main") {
    if (updateSearchDom()) return true;
  }
  return false;
}

function patchSearchUserList(users) {
  const usersList = document.getElementById("searchUsersList");
  if (!usersList) return false;
  const existingItems = Array.from(usersList.querySelectorAll("[data-search-user]"));
  const currentIds = existingItems.map((el) => el.dataset.searchUser || "");
  const nextIds = users.map((user) => String(user.uid || ""));
  if (currentIds.join("|") === nextIds.join("|")) {
    users.forEach(updateSearchUserNodes);
    return true;
  }
  const existingMap = new Map();
  existingItems.forEach((el) => existingMap.set(el.dataset.searchUser || "", el));
  const fragment = document.createDocumentFragment();
  users.forEach((user) => {
    const id = String(user.uid || "");
    const existing = id ? existingMap.get(id) : null;
    if (existing) {
      existingMap.delete(id);
      fragment.appendChild(existing);
    } else {
      const tpl = document.createElement("template");
      tpl.innerHTML = renderSearchUserItem(user);
      const node = tpl.content.firstElementChild;
      if (node) fragment.appendChild(node);
    }
  });
  usersList.replaceChildren(fragment);
  users.forEach(updateSearchUserNodes);
  return true;
}

  scheduleLeafletWarmup();

  return {
    ensureLeafletStylesheet,
    ensureLeafletLoaded,
    buildRestaurantLocations,
    cleanupLeaflet,
    getDiscoverableMapLocations,
    updateMapSheet,
    initLeafletIfNeeded,
    renderLeafletMarkers,
    filterMapLocationsByQuery,
    bindMapSearchInput,
    mapLocate,
    renderMapSheet,
    renderMapView,
    updateSearchLogoNodes,
    updateSearchBusinessNodes,
    updateSearchUserNodes,
    buildLocalBusinessResults,
    handleSearchInput,
    renderSearchView,
    updateSearchDom,
    patchSearchBusinessList,
    refreshSearchView,
    patchSearchUserList
  };
}
