import {
  getStableLeadSlug,
  resolveExistingRestaurantForLead,
  routeBelongsToSameRestaurant
} from "../leads/lead-identity-contract-utils.js";
import { timeMnyraLoadingAsyncCore as timeLoadingAsync } from "../common/loading-diagnostics-utils.js";
import {
  loadCrmLeadsCore,
  loadCrmCustomersCore,
  loadCrmCeoStaffCore
} from "./crm-admin-read-loader-core.js";

export function createCrmRuntimeController(deps = {}) {
  const {
    state,
    icon,
    escapeHtml,
    isCeoUser,
    render,
    renderOverlays,
    renderCrmLazyLoadingView,
    renderCeoGuardCore,
    getLeadSettingsConfig,
    LEAD_SETTINGS_DEFAULT_COUNTRY,
    CEO_COUNTRIES,
    LEAD_TYPE_ORDER,
    LEAD_TYPE_LABELS,
    LEAD_STATUS_ORDER,
    LEAD_STATUS_LABELS,
    resolveCustomerType,
    normalizeSearchKey,
    normalizeLeadStatusKey,
    normalizeLeadScopeKey,
    normalizeCustomerScopeKey,
    createLeadScopeMap,
    createCustomerScopeMap,
    sanitizeCeoCrmCounts,
    hasStoredCeoCrmCounts,
    resolveKnownScopeCountLabel,
    leadStatusLabel,
    renderCeoScopeTabs,
    renderOwnershipPills,
    leadTypeLabel,
    customerStatusLabel,
    isCustomerRestaurant,
    toDateSafe,
    normalizeLeadLocations,
    getLeadCountryCenter,
    getLeadMonthlyPrice,
    resolveCurrencyCodeFromLeadCountry,
    buildLeadAccountEmail,
    hasLeadLocationCoords,
    normalizeLeadCountry,
    buildLeadContactName,
    getCurrentCeoMeta,
    normalizeHandle,
    getOptimizedImageUrl,
    isPlaceholderUrl,
    normalizeCeoCountry,
    PLACEHOLDER_IMAGE,
    CRM_LAZY_RENDERERS_MODULE_URL,
    BUILD_INFO_ENDPOINT_URL,
    enqueueMicrotaskCore,
    extractPlusCodeFromText,
    isLikelyShortPlusCode,
    parseCoordsFromAddressInputAsync,
    createLeadLocation,
    getPrimaryLeadLocation,
    resolveCoordsFromEntity,
    preferStableCoords,
    normalizeCoordPair,
    inferLeadCountryFromText,
    parseCoordsFromAddressInput,
    getLeadPriceForCycle,
    normalizeLeadSettings,
    setDoc,
    doc,
    db,
    serverTimestamp,
    saveUserProfileToStorage,
    ensureLeafletLoaded,
    getCeoGpsOverride,
    PRISHTINA_COORDS,
    alert,
    getApps,
    initializeApp,
    app,
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    normalizeCeoPath,
    normalizeRestaurantType,
    hasGlobalCeoAccess,
    collection,
    query,
    where,
    limit,
    getDocs,
    getDoc,
    mergeRestaurants,
    rebuildBusinessLocations,
    canCurrentCeoSeeRow,
    isOwnedByVisibleCeoTeam: isOwnedByVisibleCeoTeamDep,
    isCurrentCeoOwnRow,
    ensureCeoCrmCountsLoaded,
    getCeoCrmCountsPromise,
    readLeadScopeCache,
    writeLeadScopeCache,
    readCustomerScopeCache,
    writeCustomerScopeCache,
    CRM_PAGE_SIZE,
    dataLoaded,
    uniqueStringList,
    normalizeCeoStaffRecord,
    canViewCeoRecord,
    hydrateStaffRecordsFromUserProfiles,
    saveCeoStaffFromViewCore,
    uploadCompressedImage,
    buildCeoName,
    createEmptyCeoCrmCounts,
    saveLeadFromModalCore,
    deleteLeadFromModalCore,
    saveCustomerFromModalCore,
    convertLeadToCustomerCore,
    buildLeadCrmContribution,
    buildCustomerCrmContribution,
    resolveStoredCeoCreatorMeta,
    accumulateCeoCrmDelta,
    applyCeoCrmCountDeltas,
    closeLeadModal,
    closeCustomerModal,
    findRestaurantByUid,
    findRestaurantByEmail,
    normalizeEmailValue,
    normalizeRoleList,
    menuCache,
    menuCacheKey,
    focusCache,
    focusCacheKey,
    businessPostsKey,
    writeCache,
    saveFeedPosts,
    readCache,
    CACHE_KEYS,
    buildStoriesSignature,
    setFeedStoriesSignature,
    isAlbertCeoUser,
    buildCeoCreatorMeta,
    HIDDEN_LEGACY_CEO_EMAILS,
    MILAN_OWNED_LEAD_EMAILS,
    MILAN_OWNED_LEAD_BUSINESSES,
    ALBERT_OWNED_LEAD_EMAILS,
    ALBERT_OWNED_LEAD_BUSINESSES,
    confirm,
    deleteDoc
  } = deps;
  const isOwnedByVisibleCeoTeam = typeof isOwnedByVisibleCeoTeamDep === "function"
    ? isOwnedByVisibleCeoTeamDep
    : ((row = {}) => (typeof canCurrentCeoSeeRow === "function" ? canCurrentCeoSeeRow(row) : true));

  let ceoStaffLoadPromise = null;
  let hiddenLegacyCeoUids = [];
  let crmLazyRenderers = null;
  let crmLazyRenderersPromise = null;
  let crmLazyRenderersPrefetchQueued = false;
let locationPickerMap = null; // NEU: Fuer das Settings-Modal
let locationPickerBizMarkers = [];
let verifiedMapLocation = null; // NEU: Fuer die Koordinaten-Speicherung
let locationPickerTarget = { addressInputId: "settingsAddress", coordsDisplayId: "coordsDisplay", context: "settings" };
const FEED_VIEWER_LOCATION_STORAGE_KEY = "mnyra_social_feed_viewer_location_v1";
  const LEAD_LANDING_TEMPLATE_ID = "lead-screen-1";
  const LEAD_LANDING_PUBLIC_ORIGIN = "https://mnyra.com";
  const LEAD_LANDING_RESERVED_SLUGS = new Set([
    "b",
    "admin",
    "ceo",
    "owner",
    "staff",
    "waiter",
    "wr",
    "kitchen",
    "social",
    "heart",
    "hub",
    "apps",
    "api",
    "login",
    "register",
    "profile",
    "post",
    "posts",
    "story",
    "stories",
    "menu",
    "search",
    "discover",
    "map",
    "location",
    "orders",
    "notifications",
    "settings",
    "upload",
    "leads",
    "customers",
    "businessaccounts",
    "menyra-restaurants",
    "lp"
  ]);
  const leadLandingBackfillDone = new Set();
  let leadLandingBackfillPromise = null;
  let buildStatusFetchPromise = null;
  let buildStatusLoaded = false;

  function resolveRuntimeEnvironmentLabel() {
    if (typeof window === "undefined") return "unknown";
    const host = String(window.location?.hostname || "").trim().toLowerCase();
    if (!host) return "unknown";
    if (host === "localhost" || host === "127.0.0.1" || host.endsWith(".local")) return "local";
    if (host.includes("vercel.app")) return "preview";
    if (host.endsWith(".menyra.com") || host.endsWith(".mnyra.com")) return "production";
    return "custom";
  }

  function isLocalLikeHostname(hostname = "") {
    const host = String(hostname || "").trim().toLowerCase();
    if (!host) return false;
    if (host === "localhost" || host === "127.0.0.1" || host === "::1" || host.endsWith(".local")) return true;
    if (/^10\./.test(host) || /^192\.168\./.test(host)) return true;
    const privateMatch = host.match(/^172\.(\d{1,3})\./);
    if (privateMatch) {
      const second = Number(privateMatch[1]);
      if (Number.isFinite(second) && second >= 16 && second <= 31) return true;
    }
    return false;
  }

  function normalizeLeadLandingSlugValue(value = "") {
    let slug = String(value || "").trim().toLowerCase();
    if (!slug) return "";
    try {
      if (typeof slug.normalize === "function") {
        slug = slug.normalize("NFKD").replace(/[\u0300-\u036f]/g, "");
      }
    } catch {}
    return slug
      .replace(/&/g, " and ")
      .replace(/['"`]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 72);
  }

  function hasLeadLandingSlugCollisionInState(slugValue = "", { restaurantId = "" } = {}) {
    const safeRestaurantId = String(restaurantId || "").trim();
    const safeSlugValue = normalizeLeadLandingSlugValue(slugValue || "");
    if (!safeSlugValue) return false;
    const restaurants = Array.isArray(state?.restaurants) ? state.restaurants : [];
    return restaurants.some((row) => {
      const rowId = String(row?.id || "").trim();
      if (rowId && safeRestaurantId && rowId === safeRestaurantId) return false;
      const rowSlug = normalizeLeadLandingSlugValue(
        row?.publicSlug
        || row?.landingSlug
        || row?.handle
        || row?.name
        || row?.restaurantName
        || row?.leadId
        || rowId
      );
      return !!rowSlug && rowSlug === safeSlugValue;
    });
  }

  function resolveLeadLandingSlugConflict(baseSlug = "", { restaurantId = "", leadId = "" } = {}) {
    const safeRestaurantId = String(restaurantId || "").trim();
    const safeLeadId = String(leadId || "").trim();
    let candidate = normalizeLeadLandingSlugValue(baseSlug || safeRestaurantId || safeLeadId || "business");
    if (!candidate) candidate = "business";

    if (LEAD_LANDING_RESERVED_SLUGS.has(candidate)) {
      candidate = `${candidate}-2`;
    }
    return normalizeLeadLandingSlugValue(candidate) || "business";
  }

  function buildLeadLandingSlug(restaurantId = "", options = {}) {
    const safeRestaurantId = String(restaurantId || "").trim();
    const safeOptions = options && typeof options === "object" ? options : {};
    const explicitSlug = normalizeLeadLandingSlugValue(
      safeOptions.publicSlug
      || safeOptions.landingSlug
      || safeOptions.base?.publicSlug
      || safeOptions.base?.landingSlug
      || ""
    );
    if (explicitSlug && !LEAD_LANDING_RESERVED_SLUGS.has(explicitSlug)) {
      return resolveLeadLandingSlugConflict(explicitSlug, {
        restaurantId: safeRestaurantId,
        leadId: safeOptions.leadId || ""
      });
    }
    const fromState = safeRestaurantId
      ? (state?.restaurants || []).find((row) => String(row?.id || "").trim() === safeRestaurantId)
      : null;
    const stableStateSlug = normalizeLeadLandingSlugValue(fromState?.publicSlug || fromState?.landingSlug || "");
    if (stableStateSlug && !LEAD_LANDING_RESERVED_SLUGS.has(stableStateSlug)) {
      return resolveLeadLandingSlugConflict(stableStateSlug, {
        restaurantId: safeRestaurantId,
        leadId: safeOptions.leadId || ""
      });
    }
    const derivedName = String(
      safeOptions.businessName
      || safeOptions.name
      || safeOptions.restaurantName
      || safeOptions.base?.publicSlug
      || safeOptions.base?.handle
      || safeOptions.base?.name
      || safeOptions.base?.restaurantName
      || fromState?.publicSlug
      || fromState?.handle
      || fromState?.name
      || fromState?.restaurantName
      || ""
    ).trim();
    const baseSlug = normalizeLeadLandingSlugValue(derivedName || safeRestaurantId || safeOptions.leadId || "");
    return resolveLeadLandingSlugConflict(baseSlug, {
      restaurantId: safeRestaurantId,
      leadId: safeOptions.leadId || ""
    });
  }

  async function findLeadLandingSlugConflictDoc(slugValue = "", { restaurantId = "" } = {}) {
    const safeSlugValue = normalizeLeadLandingSlugValue(slugValue || "");
    const safeRestaurantId = String(restaurantId || "").trim();
    if (!safeSlugValue || !db) return null;
    if (typeof getDoc === "function" && typeof doc === "function") {
      try {
        const routeSnap = await getDoc(doc(db, "publicRoutes", safeSlugValue));
        if (routeSnap?.exists?.()) {
          const routeData = routeSnap.data?.() || {};
          if (!routeBelongsToSameRestaurant(routeData, safeRestaurantId)) {
            const routeRestaurantId = String(routeData.restaurantId || routeData.canonicalRestaurantId || "").trim();
            return {
              id: routeRestaurantId || `publicRoutes/${safeSlugValue}`,
              data: routeData,
              source: "publicRoutes"
            };
          }
        }
      } catch {}
    }
    if (!collection || !query || !where || !limit || !getDocs) return null;
    const fields = ["publicSlug", "landingSlug", "handle"];
    for (const fieldName of fields) {
      try {
        const snap = await getDocs(query(collection(db, "restaurants"), where(fieldName, "==", safeSlugValue), limit(3)));
        const conflict = snap.docs.find((docSnap) => String(docSnap?.id || "").trim() !== safeRestaurantId) || null;
        if (conflict?.id) {
          return {
            id: String(conflict.id || "").trim(),
            data: conflict.data?.() || {}
          };
        }
      } catch {}
    }
    return null;
  }

  async function findNextAvailableSlugOnlyForDifferentRestaurant(baseSlug = "", { restaurantId = "", leadId = "", businessName = "" } = {}) {
    const safeRestaurantId = String(restaurantId || "").trim();
    const safeLeadId = String(leadId || "").trim();
    const safeBusinessName = String(businessName || "").trim();
    const baseCandidate = normalizeLeadLandingSlugValue(baseSlug || safeBusinessName || safeRestaurantId || safeLeadId || "business") || "business";
    for (let attempt = 0; attempt < 25; attempt += 1) {
      const candidate = normalizeLeadLandingSlugValue(
        attempt === 0
          ? baseCandidate
          : `${baseCandidate}-${attempt + 1}`
      );
      if (!candidate || LEAD_LANDING_RESERVED_SLUGS.has(candidate)) continue;
      if (hasLeadLandingSlugCollisionInState(candidate, { restaurantId: safeRestaurantId })) continue;
      const remoteConflict = await findLeadLandingSlugConflictDoc(candidate, { restaurantId: safeRestaurantId });
      if (!remoteConflict?.id) return candidate;
    }
    throw new Error("Kein freier Public Slug gefunden.");
  }

  async function resolveLeadLandingSlugUnique(restaurantId = "", options = {}) {
    const safeRestaurantId = String(restaurantId || "").trim();
    const safeOptions = options && typeof options === "object" ? options : {};
    const baseCandidate = buildLeadLandingSlug(safeRestaurantId, safeOptions) || "business";
    return findNextAvailableSlugOnlyForDifferentRestaurant(baseCandidate, {
      restaurantId: safeRestaurantId,
      leadId: safeOptions.leadId || "",
      businessName: safeOptions.businessName || ""
    });
  }

  function buildLeadLandingPagePath(restaurantId = "", options = {}) {
    const safeRestaurantId = String(restaurantId || "").trim();
    const safeOptions = options && typeof options === "object" ? options : {};
    const landingSlug = buildLeadLandingSlug(safeRestaurantId, safeOptions);
    if (!landingSlug) return "";
    return `/${encodeURIComponent(landingSlug)}`;
  }

  function buildLeadLandingPageUrl(restaurantId = "", options = {}) {
    const safeRestaurantId = String(restaurantId || "").trim();
    const safeOptions = options && typeof options === "object" ? options : {};
    const landingSlug = buildLeadLandingSlug(safeRestaurantId, safeOptions);
    if (!landingSlug) return "";
    const path = `/${encodeURIComponent(landingSlug)}`;
    if (!path) return "";
    const forcePublicOrigin = safeOptions.forcePublicOrigin === true;
    if (!forcePublicOrigin && typeof window !== "undefined") {
      const host = String(window.location?.hostname || "").trim().toLowerCase();
      const origin = String(window.location?.origin || "").trim().replace(/\/+$/, "");
      if (isLocalLikeHostname(host)) {
        const previewPath = `/${encodeURIComponent(landingSlug)}`;
        return origin ? `${origin}${previewPath}` : previewPath;
      }
    }
    const originRaw = String(safeOptions.origin || LEAD_LANDING_PUBLIC_ORIGIN || "").trim();
    const origin = originRaw.replace(/\/+$/, "");
    return origin ? `${origin}${path}` : path;
  }

  function buildLeadLandingScreenOnePayload({
    restaurantId = "",
    base = {}
  } = {}) {
    const businessName = String(base?.name || base?.restaurantName || base?.businessName || "Business").trim() || "Business";
    const landingSlug = buildLeadLandingSlug(restaurantId, {
      publicSlug: base?.publicSlug || "",
      landingSlug: base?.landingSlug || "",
      businessName,
      leadId: base?.leadId || ""
    });
    const city = String(base?.city || "").trim();
    const country = String(base?.country || "").trim();
    const locationLabel = [city, country].filter(Boolean).join(", ");
    const messageLine1 = locationLabel
      ? `${businessName} in ${locationLabel} ist bereits in Mnyra vorbereitet.`
      : `${businessName} ist bereits in Mnyra vorbereitet.`;
    const messageLine2 = "Deine digitale Praesenz ist bereit zur Aktivierung.";
    return {
      version: 1,
      template: LEAD_LANDING_TEMPLATE_ID,
      restaurantId: String(restaurantId || "").trim(),
      landingSlug,
      businessName,
      logoUrl: String(base?.logoUrl || base?.logo || "").trim(),
      locationLabel,
      city,
      country,
      messageLine1,
      messageLine2
    };
  }

  function normalizeBuildStatus(raw = {}) {
    const commitRaw = String(raw.commitShort || raw.commitSha || raw.commit || "").trim();
    const branchRaw = String(raw.branch || raw.ref || "").trim();
    const envRaw = String(raw.environment || raw.env || "").trim();
    const tsRaw = String(raw.buildTimestamp || raw.builtAt || raw.timestamp || "").trim();
    let buildTimestamp = "";
    if (tsRaw) {
      const parsed = new Date(tsRaw);
      buildTimestamp = Number.isFinite(parsed.getTime()) ? parsed.toISOString() : tsRaw;
    }
    return {
      commitShort: commitRaw ? commitRaw.slice(0, 12) : "",
      branch: branchRaw,
      environment: envRaw || resolveRuntimeEnvironmentLabel(),
      buildTimestamp
    };
  }

  function ensureStaffBuildStatusStateInitialized() {
    if (!state?.staff) return;
    if (!state.staff.buildStatus || typeof state.staff.buildStatus !== "object") {
      state.staff.buildStatus = normalizeBuildStatus({});
    }
    if (typeof state.staff.buildStatusLoading !== "boolean") {
      state.staff.buildStatusLoading = false;
    }
    if (typeof state.staff.buildStatusError !== "string") {
      state.staff.buildStatusError = "";
    }
  }

  async function ensureStaffBuildStatusLoaded({ force = false } = {}) {
    ensureStaffBuildStatusStateInitialized();
    if (!state?.staff) return normalizeBuildStatus({});
    if (buildStatusLoaded && !force) return state.staff.buildStatus;
    if (buildStatusFetchPromise && !force) return buildStatusFetchPromise;
    if (!BUILD_INFO_ENDPOINT_URL || typeof fetch !== "function") {
      buildStatusLoaded = true;
      return state.staff.buildStatus;
    }
    state.staff.buildStatusLoading = true;
    state.staff.buildStatusError = "";
    const endpoint = `${BUILD_INFO_ENDPOINT_URL}${BUILD_INFO_ENDPOINT_URL.includes("?") ? "&" : "?"}refresh=${Date.now()}`;
    buildStatusFetchPromise = fetch(endpoint, {
      method: "GET",
      headers: { Accept: "application/json" },
      cache: "no-store"
    })
      .then(async (res) => {
        if (!res.ok) throw new Error(`Build status request failed (${res.status})`);
        const payload = await res.json();
        const next = normalizeBuildStatus(payload || {});
        state.staff.buildStatus = next;
        buildStatusLoaded = true;
        return next;
      })
      .catch((err) => {
        buildStatusLoaded = true;
        state.staff.buildStatusError = err?.message || "Build Status konnte nicht geladen werden.";
        return state.staff.buildStatus;
      })
      .finally(() => {
        state.staff.buildStatusLoading = false;
        buildStatusFetchPromise = null;
        if (state.activeTab === "staff") {
          render();
        }
      });
    return buildStatusFetchPromise;
  }

  ensureStaffBuildStatusStateInitialized();

  function hasCeoCrmCountsPromise() {
    return !!(typeof getCeoCrmCountsPromise === "function" ? getCeoCrmCountsPromise() : null);
  }

function makeLocationPickerBizIcon(location) {
  const safeImg = location.img && !isPlaceholderUrl(location.img) ? escapeHtml(location.img) : PLACEHOLDER_IMAGE;
  const html = `
    <div class="relative flex flex-col items-center justify-center z-[400]">
      <div class="w-11 h-11 rounded-[0.9rem] shadow-lg flex items-center justify-center border-[3px] border-white bg-white overflow-hidden p-0.5">
        <img src="${safeImg}" class="w-full h-full object-cover rounded-[0.7rem]" onerror="this.src='${PLACEHOLDER_IMAGE}'"/>
      </div>
      <div class="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-white drop-shadow-md -mt-1"></div>
    </div>
  `;
  return window.L.divIcon({ className: "custom-div-icon", html, iconSize: [44, 54], iconAnchor: [22, 54] });
}

function clearLocationPickerBizMarkers() {
  if (!locationPickerMap) {
    locationPickerBizMarkers = [];
    return;
  }
  locationPickerBizMarkers.forEach((marker) => {
    try { locationPickerMap.removeLayer(marker); } catch {}
  });
  locationPickerBizMarkers = [];
}

function buildLeadLocationPickerLocations() {
  const out = [];
  const seen = new Set();
  const pushLocation = (entry) => {
    const coords = normalizeCoordPair(entry?.lat, entry?.lng);
    if (!coords) return;
    const lat = coords.lat;
    const lng = coords.lng;
    const key = `${entry.markerKey || entry.id || "loc"}:${lat.toFixed(6)}:${lng.toFixed(6)}`;
    if (seen.has(key)) return;
    seen.add(key);
    out.push({ ...entry, lat, lng });
  };
  const businessLocationsByRestaurant = new Map();
  (Array.isArray(state.businessLocations) ? state.businessLocations : []).forEach((biz) => {
    const id = String(biz?.id || "");
    if (!id) return;
    if (!businessLocationsByRestaurant.has(id)) businessLocationsByRestaurant.set(id, []);
    businessLocationsByRestaurant.get(id).push(biz);
  });

  const customers = Array.isArray(state.customers.items) && state.customers.items.length
    ? state.customers.items
    : (Array.isArray(state.restaurants) ? state.restaurants.filter(isCustomerRestaurant) : []);

  customers.forEach((rest, restIndex) => {
    const restId = String(rest?.id || "");
    const mapLocations = restId ? (businessLocationsByRestaurant.get(restId) || []) : [];
    const mapCoordRows = mapLocations
      .map((biz, idx) => {
        const coords = normalizeCoordPair(biz?.lat, biz?.lng);
        if (!coords) return null;
        return { ...coords, biz, idx };
      })
      .filter(Boolean);
    if (mapCoordRows.length && !(Array.isArray(rest?.locations) && rest.locations.length)) {
      mapLocations.forEach((biz, bizIndex) => {
        pushLocation({
          id: rest.id || `customer_${restIndex}`,
          markerKey: `customer:${rest.id || restIndex}:${biz.locationIndex ?? bizIndex}`,
          name: rest.name || rest.restaurantName || biz.name || "Business",
          img: rest.logoUrl || rest.logo || rest.heroUrl || rest.coverUrl || biz.img || "",
          address: biz.address || rest.address || rest.city || "Prishtina",
          lat: biz.lat,
          lng: biz.lng
        });
      });
      return;
    }

    const restCoords = resolveCoordsFromEntity(rest);
    const locations = normalizeLeadLocations(rest?.locations || [], rest?.address || rest?.city || "", restCoords || null);
    let placed = false;
    locations.forEach((loc, locIndex) => {
      const directCoords = resolveCoordsFromEntity(loc) || restCoords || null;
      const refCoords = mapCoordRows[locIndex] || mapCoordRows[0] || null;
      const coords = preferStableCoords(directCoords, refCoords);
      if (!coords) return;
      placed = true;
      pushLocation({
        id: rest.id || `customer_${restIndex}`,
        markerKey: `customer:${rest.id || restIndex}:${locIndex}`,
        name: rest.name || rest.restaurantName || "Business",
        img: rest.logoUrl || rest.logo || rest.heroUrl || rest.coverUrl || "",
        address: loc.address || rest.address || rest.city || "Prishtina",
        lat: coords.lat,
        lng: coords.lng
      });
    });

    if (!placed && mapCoordRows.length) {
      mapCoordRows.forEach(({ biz, idx, lat, lng }) => {
        pushLocation({
          id: rest.id || `customer_${restIndex}`,
          markerKey: `customer:${rest.id || restIndex}:${biz.locationIndex ?? idx}`,
          name: rest.name || rest.restaurantName || biz.name || "Business",
          img: rest.logoUrl || rest.logo || rest.heroUrl || rest.coverUrl || biz.img || "",
          address: biz.address || rest.address || rest.city || "Prishtina",
          lat,
          lng
        });
      });
    }
  });

  const leads = Array.isArray(state.leads.items) ? state.leads.items : [];
  leads
    .filter((lead) => normalizeLeadStatusKey(lead?.status || "") !== "kunde")
    .forEach((lead, leadIndex) => {
      const leadRestaurantId = String(lead?.restaurantId || "");
      const restMapLocations = leadRestaurantId ? (businessLocationsByRestaurant.get(leadRestaurantId) || []) : [];
      const restMapCoordRows = restMapLocations
        .map((biz, idx) => {
          const coords = normalizeCoordPair(biz?.lat, biz?.lng);
          if (!coords) return null;
          return { ...coords, biz, idx };
        })
        .filter(Boolean);
      if (restMapCoordRows.length && !(Array.isArray(lead?.locations) && lead.locations.length)) {
        restMapCoordRows.forEach(({ biz, idx, lat, lng }) => {
          pushLocation({
            id: lead.id || lead.restaurantId || `lead_${leadIndex}`,
            markerKey: `lead:${lead.id || lead.restaurantId || leadIndex}:rest:${biz.locationIndex ?? idx}`,
            name: lead.businessName || lead.contactName || biz.name || "Lead",
            img: lead.logoUrl || lead.logo || lead.imageUrl || biz.img || "",
            address: lead.address || biz.address || lead.city || "Prishtina",
            lat,
            lng
          });
        });
        return;
      }

      const leadCoords = resolveCoordsFromEntity(lead);
      const locations = normalizeLeadLocations(lead?.locations || [], lead?.address || "", {
        lat: leadCoords?.lat ?? null,
        lng: leadCoords?.lng ?? null
      });
      let placed = false;
      locations.forEach((loc, locIndex) => {
        const directCoords = resolveCoordsFromEntity(loc) || leadCoords || null;
        const refCoords = restMapCoordRows[locIndex] || restMapCoordRows[0] || null;
        const coords = preferStableCoords(directCoords, refCoords);
        if (!coords) return;
        placed = true;
        pushLocation({
          id: lead.id || lead.restaurantId || `lead_${leadIndex}`,
          markerKey: `lead:${lead.id || lead.restaurantId || leadIndex}:${locIndex}`,
          name: lead.businessName || lead.contactName || "Lead",
          img: lead.logoUrl || lead.logo || lead.imageUrl || "",
          address: loc.address || lead.address || lead.city || "Prishtina",
          lat: coords.lat,
          lng: coords.lng
        });
      });

      if (!placed && restMapCoordRows.length) {
        restMapCoordRows.forEach(({ biz, idx, lat, lng }) => {
          pushLocation({
            id: lead.id || lead.restaurantId || `lead_${leadIndex}`,
            markerKey: `lead:${lead.id || lead.restaurantId || leadIndex}:rest:${biz.locationIndex ?? idx}`,
            name: lead.businessName || lead.contactName || biz.name || "Lead",
            img: lead.logoUrl || lead.logo || lead.imageUrl || biz.img || "",
            address: lead.address || biz.address || lead.city || "Prishtina",
            lat,
            lng
          });
        });
      }
    });

  return out;
}

function renderLocationPickerContextMarkers() {
  if (!locationPickerMap || !window.L) return;
  const context = String(locationPickerTarget.context || "");
  clearLocationPickerBizMarkers();
  if (!(context === "lead" || context.startsWith("lead_location:"))) return;

  const locations = buildLeadLocationPickerLocations();
  locationPickerBizMarkers = locations.map((location) => (
    window.L.marker([location.lat, location.lng], {
      icon: makeLocationPickerBizIcon(location),
      keyboard: false,
      interactive: false
    }).addTo(locationPickerMap)
  ));
}

function getCrmLazyRendererContext() {
  ensureStaffBuildStatusStateInitialized();
  return {
    state,
    icon,
    escapeHtml,
    isCeoUser,
    renderCeoGuard,
    renderLeadSettingsView,
    renderLeadCreationView,
    renderStaffEditorView,
    getLeadSettingsConfig,
    CEO_COUNTRIES,
    LEAD_TYPE_ORDER,
    LEAD_TYPE_LABELS,
    LEAD_STATUS_ORDER,
    LEAD_STATUS_LABELS,
    resolveCustomerType,
    normalizeSearchKey,
    normalizeLeadStatusKey,
    normalizeLeadScopeKey,
    normalizeCustomerScopeKey,
    createLeadScopeMap,
    createCustomerScopeMap,
    sanitizeCeoCrmCounts,
    hasStoredCeoCrmCounts,
    resolveKnownScopeCountLabel,
    leadMatchesQuery,
    customerMatchesQuery,
    leadStatusTone,
    leadStatusLabel,
    renderCeoScopeTabs,
    renderOwnershipPills,
    leadTypeLabel,
    customerStatusLabel,
    isCustomerRestaurant,
    toDateSafe,
    normalizeLeadLocations,
    getLeadCountryCenter,
    getLeadMonthlyPrice,
    resolveCurrencyCodeFromLeadCountry,
    buildLeadAccountEmail,
    hasLeadLocationCoords,
    normalizeLeadCountry,
    buildLeadContactName,
    getCurrentCeoMeta,
    normalizeHandle,
    buildLeadLandingPageUrl,
    getStaffFormEmail,
    getOptimizedImageUrl,
    isPlaceholderUrl,
    normalizeCeoCountry,
    PLACEHOLDER_IMAGE,
    staffBuildStatus: state.staff.buildStatus,
    staffBuildStatusLoading: !!state.staff.buildStatusLoading,
    staffBuildStatusError: String(state.staff.buildStatusError || "")
  };
}

async function ensureCrmLazyRenderersLoaded() {
  if (crmLazyRenderers) return crmLazyRenderers;
  if (!crmLazyRenderersPromise) {
    crmLazyRenderersPromise = import(CRM_LAZY_RENDERERS_MODULE_URL)
      .then((mod) => {
        crmLazyRenderers = {
          renderLeadSettingsView: mod.renderLeadSettingsView,
          renderLeadCreationView: mod.renderLeadCreationView,
          renderStaffEditorView: mod.renderStaffEditorView,
          renderLeadsView: mod.renderLeadsView,
          renderCustomersView: mod.renderCustomersView,
          renderStaffView: mod.renderStaffView
        };
        return crmLazyRenderers;
      })
      .catch((err) => {
        crmLazyRenderersPromise = null;
        throw err;
      });
  }
  return crmLazyRenderersPromise;
}

function prefetchCrmLazyRenderers() {
  if (crmLazyRenderers) return;
  const shouldAttachRefresh = !crmLazyRenderersPromise;
  const promise = ensureCrmLazyRenderersLoaded();
  if (!shouldAttachRefresh) return;
  promise.then(() => {
    if (!state.user) return;
    if (state.activeTab === "leads" || state.activeTab === "staff" || state.activeTab === "customers") {
      render();
    }
  }).catch(() => {});
}

function queueCrmLazyRenderersPrefetch() {
  if (crmLazyRenderers || crmLazyRenderersPromise || crmLazyRenderersPrefetchQueued) return;
  crmLazyRenderersPrefetchQueued = true;
  enqueueMicrotaskCore({
    fn: () => {
      crmLazyRenderersPrefetchQueued = false;
      prefetchCrmLazyRenderers();
    },
    queueMicrotaskFn: typeof queueMicrotask === "function" ? queueMicrotask : null,
    setTimeoutFn: typeof window !== "undefined" && typeof window.setTimeout === "function"
      ? window.setTimeout.bind(window)
      : null
  });
}

function renderCeoGuard(title = "CRM") {
  return renderCeoGuardCore({
    title,
    icon,
    escapeHtml
  });
}

function renderLeadsView() {
  if (!crmLazyRenderers?.renderLeadsView) {
    prefetchCrmLazyRenderers();
    return renderCrmLazyLoadingView("Leads laden...");
  }
  return crmLazyRenderers.renderLeadsView(getCrmLazyRendererContext());
}

function isLeadInlineCreateView() {
  return state.activeTab === "leads" && state.leads?.view === "create";
}

function renderLeadEditorUi() {
  if (isLeadInlineCreateView()) {
    render();
    return;
  }
  renderOverlays({ updateLead: true });
}

async function refineLeadLocationAddressIndex(index, value, { hydratePrimary = false } = {}) {
  const idx = Number(index);
  if (!Number.isInteger(idx) || idx < 0) return null;
  const inputValue = String(value || "").trim();
  if (!inputValue) return null;
  const extracted = extractPlusCodeFromText(inputValue);
  if (!extracted?.code || !isLikelyShortPlusCode(extracted.code) || !String(extracted.remainder || "").trim()) {
    return null;
  }
  const refined = await parseCoordsFromAddressInputAsync(inputValue, getLeadPlusCodeReference(inputValue));
  if (!refined) return null;
  const list = normalizeLeadLocations(state.leadModal.locations, state.leadModal.lead?.address || "", state.leadModal.coords || null);
  while (list.length <= idx) list.push(createLeadLocation());
  const current = list[idx] || createLeadLocation();
  list[idx] = createLeadLocation({
    address: inputValue,
    lat: refined.lat,
    lng: refined.lng
  });
  state.leadModal.locations = list;
  if (idx === 0) {
    state.leadModal.coords = { lat: refined.lat, lng: refined.lng };
    if (hydratePrimary) {
      await hydrateLeadGeoFieldsFromCoords(refined, { sourceInputId: `leadLocationAddress_${idx}` });
    }
  } else if (hasLeadLocationCoords(current) || hasLeadLocationCoords(list[idx])) {
    const primary = getPrimaryLeadLocation(list);
    state.leadModal.coords = hasLeadLocationCoords(primary) ? { lat: primary.lat, lng: primary.lng } : state.leadModal.coords;
  }
  const badgeId = idx === 0 ? "leadCoordsDisplay" : `leadLocationCoords_${idx}`;
  const badge = document.getElementById(badgeId);
  if (badge) {
    badge.classList.remove("hidden");
    if (idx === 0) {
      badge.innerHTML = `${icon("check-circle-2", "w-3 h-3")} ${escapeHtml(`${refined.lat.toFixed(4)}, ${refined.lng.toFixed(4)}`)}`;
      if (window.lucide?.createIcons) window.lucide.createIcons();
    }
  }
  return refined;
}

function renderLeadSettingsView() {
  if (!crmLazyRenderers?.renderLeadSettingsView) {
    prefetchCrmLazyRenderers();
    return renderCrmLazyLoadingView("Lead Settings laden...");
  }
  return crmLazyRenderers.renderLeadSettingsView(getCrmLazyRendererContext());
}

function renderLeadCreationView() {
  if (!crmLazyRenderers?.renderLeadCreationView) {
    prefetchCrmLazyRenderers();
    return renderCrmLazyLoadingView("Lead Formular laden...");
  }
  return crmLazyRenderers.renderLeadCreationView(getCrmLazyRendererContext());
}

function resetLeadDraft() {
  state.leadModal = {
    open: false,
    mode: "create",
    lead: null,
    status: "",
    loading: false,
    deleting: false,
    actionsOpen: false,
    logoFile: null,
    logoPreview: "",
    bestSpotLogoFile: null,
    bestSpotLogoPreview: "",
    coords: null,
    locations: []
  };
}

function createLeadDraftState(mode = "create", lead = null) {
  const rest = resolveExistingRestaurantForLead(state, lead || {});
  const leadCoords = resolveCoordsFromEntity(lead || {});
  const restCoords = resolveCoordsFromEntity(rest || {});
  const coords = preferStableCoords(leadCoords, restCoords);
  const lat = coords?.lat;
  const lng = coords?.lng;
  const locations = normalizeLeadLocations(
    lead?.locations || rest?.locations || [],
    lead?.address || rest?.address || "",
    coords
  );
  const primary = getPrimaryLeadLocation(locations);
  const settings = getLeadSettingsConfig();
  const businessName = lead?.businessName || rest?.name || rest?.restaurantName || "";
  const monthlyPrice = getLeadMonthlyPrice(lead?.customerType || rest?.type || "cafe", settings);
  const yearlyPrice = monthlyPrice * 12;
  const country = normalizeLeadCountry(lead?.country || rest?.country || settings.defaultCountry);
  const merged = {
    ...(lead || {}),
    restaurantId: lead?.restaurantId || rest?.id || lead?.landingRestaurantId || "",
    landingRestaurantId: lead?.landingRestaurantId || lead?.restaurantId || rest?.id || "",
    publicSlug: lead?.publicSlug || rest?.publicSlug || rest?.landingSlug || "",
    landingSlug: lead?.landingSlug || lead?.publicSlug || rest?.landingSlug || rest?.publicSlug || "",
    canonicalPublicPath: lead?.canonicalPublicPath || rest?.canonicalPublicPath || "",
    landingPageUrl: lead?.landingPageUrl || rest?.landingPageUrl || "",
    businessName,
    city: lead?.city || rest?.city || "",
    address: locations[0]?.address || lead?.address || rest?.address || "",
    phone: lead?.phone || rest?.phone || "",
    instagram: lead?.instagram || lead?.insta || rest?.instagram || rest?.insta || "",
    facebook: lead?.facebook || rest?.facebook || "",
    tiktok: lead?.tiktok || rest?.tiktok || "",
    googleMaps: lead?.googleMaps || rest?.googleMaps || "",
    logoUrl: lead?.logoUrl || rest?.logoUrl || rest?.logo || "",
    bestSpotLogoUrl: lead?.bestSpotLogoUrl || lead?.spotLogoUrl || rest?.bestSpotLogoUrl || rest?.spotLogoUrl || "",
    spotLogoUrl: lead?.bestSpotLogoUrl || lead?.spotLogoUrl || rest?.bestSpotLogoUrl || rest?.spotLogoUrl || "",
    email: lead?.email || lead?.socialEmail || buildLeadAccountEmail(businessName),
    password: "",
    country,
    zipCode: lead?.zipCode || rest?.zipCode || "",
    contactFirstName: lead?.contactFirstName || rest?.contactFirstName || "",
    contactLastName: lead?.contactLastName || rest?.contactLastName || "",
    billingCycle: lead?.billingCycle === "yearly" ? "yearly" : "monthly",
    monthlyPrice,
    yearlyPrice,
    specialEnabled: lead?.specialEnabled === true || rest?.specialEnabled === true,
    lat: hasLeadLocationCoords(primary) ? primary.lat : (Number.isFinite(lat) ? lat : undefined),
    lng: hasLeadLocationCoords(primary) ? primary.lng : (Number.isFinite(lng) ? lng : undefined),
    locations,
    status: normalizeLeadStatusKey(lead?.status || "registered") || "registered"
  };
  return {
    open: false,
    mode,
    lead: merged,
    status: "",
    loading: false,
    deleting: false,
    actionsOpen: false,
    logoFile: null,
    logoPreview: merged.logoUrl || "",
    bestSpotLogoFile: null,
    bestSpotLogoPreview: merged.bestSpotLogoUrl || "",
    coords: hasLeadLocationCoords(primary)
      ? { lat: primary.lat, lng: primary.lng }
      : (coords || getLeadCountryCenter(country)),
    locations
  };
}

function openLeadCreator() {
  if (!isCeoUser()) return;
  state.leads.view = "create";
  state.leads.settingsStatus = "";
  state.leadModal = createLeadDraftState("create", null);
  render();
}

function openLeadSettingsView() {
  if (!isCeoUser()) return;
  state.leads.view = "settings";
  state.leads.settingsStatus = "";
  render();
}

function closeLeadSubview() {
  state.leads.view = "list";
  state.leads.settingsStatus = "";
  if (!state.leadModal.open) {
    resetLeadDraft();
  }
  render();
}

async function saveLeadSettings() {
  if (!state.user) return;
  const defaultCountry = normalizeLeadCountry(document.getElementById("leadSettingsDefaultCountry")?.value || LEAD_SETTINGS_DEFAULT_COUNTRY);
  const pricing = LEAD_TYPE_ORDER.reduce((acc, key) => {
    const raw = Number(document.getElementById(`leadPrice_${key}`)?.value);
    acc[key] = Number.isFinite(raw) && raw >= 0 ? Number(raw) : 0;
    return acc;
  }, {});

  state.leads.settingsSaving = true;
  state.leads.settingsStatus = "Speichern...";
  render();

  try {
    const leadSettings = normalizeLeadSettings({
      defaultPassword: "",
      defaultCountry,
      pricing
    });
    await setDoc(doc(db, "users", state.user.uid), { leadSettings, updatedAt: serverTimestamp() }, { merge: true });
    state.userProfile = {
      ...state.userProfile,
      leadSettings
    };
    saveUserProfileToStorage();
    state.leads.settingsSaving = false;
    state.leads.settingsStatus = "Leads Settings gespeichert.";
    render();
  } catch (err) {
    console.error(err);
    state.leads.settingsSaving = false;
    state.leads.settingsStatus = err?.message || "Leads Settings konnten nicht gespeichert werden.";
    render();
  }
}

function getLeadFormCountryValue() {
  const inputValue = document.getElementById("leadCountry")?.value || state.leadModal?.lead?.country || "";
  return normalizeLeadCountry(inputValue || getLeadSettingsConfig().defaultCountry);
}

function resolveLeadCurrencyCode(countryValue = "") {
  const resolvedCountry = normalizeLeadCountry(countryValue || getLeadFormCountryValue());
  if (typeof resolveCurrencyCodeFromLeadCountry === "function") {
    const code = String(resolveCurrencyCodeFromLeadCountry(resolvedCountry, "EUR") || "").trim().toUpperCase();
    if (code) return code;
  }
  const key = String(resolvedCountry || "").trim().toLowerCase();
  if (key === "serbien" || key === "serbia") return "RSD";
  if (key === "albanien" || key === "albania") return "LEK";
  return "EUR";
}

function getLeadPlusCodeReference(value = "") {
  return getLeadCountryCenter(inferLeadCountryFromText(value, getLeadFormCountryValue()));
}

async function reverseGeocodeCoords(coords) {
  const lat = Number(coords?.lat);
  const lng = Number(coords?.lng);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lng)}&zoom=18&addressdetails=1`;
    const res = await fetch(url);
    const data = await res.json();
    const addr = data?.address || {};
    const addressLine = [
      addr.road,
      addr.house_number
    ].filter(Boolean).join(" ").trim();
    return {
      displayName: String(data?.display_name || "").trim(),
      country: normalizeLeadCountry(addr.country || addr.country_code || ""),
      city: String(addr.city || addr.town || addr.village || addr.state_district || addr.county || "").trim(),
      zipCode: String(addr.postcode || "").trim(),
      addressLine
    };
  } catch {
    return null;
  }
}

async function hydrateLeadGeoFieldsFromCoords(coords, { sourceInputId = "" } = {}) {
  const details = await reverseGeocodeCoords(coords);
  const sourceInput = sourceInputId ? document.getElementById(sourceInputId) : null;
  const sourceValue = sourceInput ? String(sourceInput.value || "").trim() : "";
  const country = normalizeLeadCountry(details?.country || getLeadFormCountryValue());
  const city = String(details?.city || "").trim();
  const zipCode = String(details?.zipCode || "").trim();
  const address = String(details?.displayName || details?.addressLine || sourceValue || "").trim();

  const countryInput = document.getElementById("leadCountry");
  const cityInput = document.getElementById("leadCity");
  const addressInput = document.getElementById("leadAddress");
  const zipInput = document.getElementById("leadZipCode");
  const googleMapsInput = document.getElementById("leadGoogleMaps");

  if (countryInput) countryInput.value = country;
  if (cityInput && city) cityInput.value = city;
  if (addressInput && address) addressInput.value = address;
  if (zipInput && zipCode) zipInput.value = zipCode;
  if (sourceInput && address) sourceInput.value = address;
  if (googleMapsInput && !String(googleMapsInput.value || "").trim()) {
    googleMapsInput.value = `https://maps.google.com/?q=${coords.lat},${coords.lng}`;
  }

  const currentLocations = normalizeLeadLocations(state.leadModal.locations, state.leadModal.lead?.address || "", state.leadModal.coords || null);
  if (currentLocations.length && address) {
    const first = currentLocations[0] || createLeadLocation();
    currentLocations[0] = createLeadLocation({
      address,
      lat: Number.isFinite(Number(first.lat)) ? Number(first.lat) : coords.lat,
      lng: Number.isFinite(Number(first.lng)) ? Number(first.lng) : coords.lng
    });
    state.leadModal.locations = currentLocations;
  }

  const currentLead = { ...(state.leadModal.lead || {}) };
  currentLead.country = country;
  currentLead.currencyCode = resolveLeadCurrencyCode(country);
  currentLead.currency = currentLead.currencyCode;
  if (city) currentLead.city = city;
  if (address) currentLead.address = address;
  if (zipCode) currentLead.zipCode = zipCode;
  if (!String(currentLead.googleMaps || "").trim()) {
    currentLead.googleMaps = `https://maps.google.com/?q=${coords.lat},${coords.lng}`;
  }
  state.leadModal.lead = currentLead;
  syncLeadDerivedFields();
}

function syncLeadDerivedFields() {
  if (!isLeadInlineCreateView()) return;
  const settings = getLeadSettingsConfig();
  const businessName = String(document.getElementById("leadBusinessName")?.value || state.leadModal?.lead?.businessName || "").trim();
  const type = resolveCustomerType(document.getElementById("leadCustomerType")?.value || state.leadModal?.lead?.customerType || "cafe");
  const cycle = document.getElementById("leadBillingCycle")?.value === "yearly" ? "yearly" : "monthly";
  const country = normalizeLeadCountry(
    document.getElementById("leadCountry")?.value
      || state.leadModal?.lead?.country
      || settings.defaultCountry
  );
  const currencyCode = resolveLeadCurrencyCode(country);
  const email = buildLeadAccountEmail(businessName);
  const monthly = getLeadMonthlyPrice(type, settings);
  const total = getLeadPriceForCycle(type, cycle, settings);
  const yearly = monthly * 12;

  const emailInput = document.getElementById("leadEmail");
  const currencyInput = document.getElementById("leadCurrency");
  const monthlyInput = document.getElementById("leadMonthlyPrice");
  const yearlyInput = document.getElementById("leadAnnualPrice");
  const priceInput = document.getElementById("leadPriceValue");

  if (emailInput) emailInput.value = email;
  if (currencyInput) currencyInput.value = currencyCode;
  if (monthlyInput) monthlyInput.value = monthly ? `${monthly.toFixed(2)} ${currencyCode} / Monat` : `0.00 ${currencyCode} / Monat`;
  if (yearlyInput) yearlyInput.value = yearly ? `${yearly.toFixed(2)} ${currencyCode} / Jahr` : `0.00 ${currencyCode} / Jahr`;
  if (priceInput) priceInput.value = total ? `${total.toFixed(2)} ${currencyCode}` : `0.00 ${currencyCode}`;

  if (state.leadModal?.lead) {
    state.leadModal.lead = {
      ...state.leadModal.lead,
      businessName,
      customerType: type,
      country,
      currencyCode,
      currency: currencyCode,
      email,
      billingCycle: cycle,
      monthlyPrice: monthly,
      yearlyPrice: yearly
    };
  }
}

function renderCustomersView() {
  if (!crmLazyRenderers?.renderCustomersView) {
    prefetchCrmLazyRenderers();
    return renderCrmLazyLoadingView("Kunden laden...");
  }
  return crmLazyRenderers.renderCustomersView(getCrmLazyRendererContext());
}

function renderStaffEditorView() {
  if (!crmLazyRenderers?.renderStaffEditorView) {
    prefetchCrmLazyRenderers();
    return renderCrmLazyLoadingView("Staff Editor laden...");
  }
  return crmLazyRenderers.renderStaffEditorView(getCrmLazyRendererContext());
}

function renderStaffView() {
  if (!crmLazyRenderers?.renderStaffView) {
    prefetchCrmLazyRenderers();
    return renderCrmLazyLoadingView("Staff laden...");
  }
  if (!buildStatusLoaded && !state.staff?.buildStatusLoading) {
    void ensureStaffBuildStatusLoaded();
  }
  return crmLazyRenderers.renderStaffView(getCrmLazyRendererContext());
}

function ensureLocationPickerModal() {
  if (document.getElementById("locationPickerModal")) return;
  const modal = document.createElement("div");
  modal.id = "locationPickerModal";
  modal.className = "fixed inset-0 z-[3000] hidden flex flex-col fullscreen-safe-pad";
  modal.innerHTML = `
    <div class="absolute inset-0 bg-slate-900/80 backdrop-blur-md transition-opacity duration-300 opacity-0" id="pickerOverlay"></div>
    <div class="bg-white rounded-[2.5rem] flex-1 flex flex-col overflow-hidden relative shadow-2xl transition-transform duration-300 translate-y-full" id="pickerPanel">
      <div class="p-5 flex justify-between items-center bg-white z-20 shadow-sm">
        <div>
          <h3 class="font-black text-lg leading-none">Standort anpassen</h3>
          <p class="text-[10px] font-bold text-slate-400 mt-1">Verschiebe die Karte unter den Pin</p>
        </div>
        <button id="closeLocationPickerBtn" type="button" class="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-600">${icon("x", "w-5 h-5")}</button>
      </div>
      <div class="flex-1 relative bg-slate-200">
        <div id="pickerMap" class="absolute inset-0 z-10"></div>
        <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-full z-30 pointer-events-none drop-shadow-2xl">
          <div class="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center border-4 border-white shadow-xl animate-bounce">
            ${icon("map-pin", "w-5 h-5 text-white fill-indigo-600")}
          </div>
          <div class="w-1 h-4 bg-slate-800 mx-auto -mt-1 rounded-full shadow-lg"></div>
        </div>
      </div>
      <div class="p-5 bg-white z-20 shadow-[0_-10px_30px_rgba(0,0,0,0.1)]">
        <button id="confirmLocationBtn" type="button" class="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl flex items-center justify-center gap-2 active:scale-95 transition-transform">
          ${icon("check", "w-4 h-4")} Hier bestaetigen
        </button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
}

function bindLocationPickerEvents() {
  const modal = document.getElementById("locationPickerModal");
  if (!modal || modal.dataset.bound === "true") return;
  const overlay = document.getElementById("pickerOverlay");
  const closeBtn = document.getElementById("closeLocationPickerBtn");
  const confirmBtn = document.getElementById("confirmLocationBtn");
  if (overlay) overlay.addEventListener("click", closeLocationPicker);
  if (closeBtn) closeBtn.addEventListener("click", closeLocationPicker);
  if (confirmBtn) confirmBtn.addEventListener("click", confirmLocation);
  modal.dataset.bound = "true";
}

async function openLocationPicker({ addressInputId = "settingsAddress", coordsDisplayId = "coordsDisplay", context = "settings" } = {}) {
  ensureLocationPickerModal();
  bindLocationPickerEvents();
  locationPickerTarget = { addressInputId, coordsDisplayId, context };
  const address = document.getElementById(addressInputId)?.value?.trim() || "";
  const pickerContext = String(context || "");
  const isLeadPickerContext = pickerContext === "lead" || pickerContext.startsWith("lead_location:");
  const isStaffPickerContext = pickerContext === "staff";
  if (isLeadPickerContext && isCeoUser()) {
    const tasks = [];
    if (!state.leads.loading && (!Array.isArray(state.leads.items) || !state.leads.items.length)) {
      tasks.push(loadLeads().catch(() => {}));
    }
    if (!state.customers.loading && (!Array.isArray(state.customers.items) || !state.customers.items.length)) {
      tasks.push(loadCustomers().catch(() => {}));
    }
    if (tasks.length) await Promise.all(tasks);
    if (Array.isArray(state.restaurants) && state.restaurants.length) {
      rebuildBusinessLocations();
      refreshCustomersFromRestaurants();
    }
  }
  let targetCoords = null;
  const resolveLeadRestaurantFallback = () => {
    const restId = String(state.leadModal?.lead?.restaurantId || "");
    if (!restId) return null;
    const biz = (Array.isArray(state.businessLocations) ? state.businessLocations : [])
      .find((item) => String(item?.id || "") === restId);
    if (!biz) return null;
    return normalizeCoordPair(biz.lat, biz.lng);
  };
  if (isLeadPickerContext) {
    const restFallback = resolveLeadRestaurantFallback();
    if (pickerContext === "lead") {
      const list = normalizeLeadLocations(state.leadModal.locations, state.leadModal.lead?.address || "", state.leadModal.coords || null);
      const primary = getPrimaryLeadLocation(list);
      const direct = resolveCoordsFromEntity(primary) || resolveCoordsFromEntity(state.leadModal.coords || {}) || null;
      targetCoords = preferStableCoords(direct, restFallback);
    } else if (pickerContext.startsWith("lead_location:")) {
      const index = Number(pickerContext.split(":")[1]);
      const list = normalizeLeadLocations(state.leadModal.locations, state.leadModal.lead?.address || "", state.leadModal.coords || null);
      const row = Number.isInteger(index) && index >= 0 ? list[index] : null;
      const inputValue = String(document.getElementById(addressInputId)?.value || "").trim();
      const rowAddress = String(row?.address || "").trim();
      const addressValue = String(inputValue || rowAddress).trim();
      const rowCoords = resolveCoordsFromEntity(row) || null;
      if (rowCoords && (!inputValue || !rowAddress || inputValue === rowAddress)) {
        targetCoords = rowCoords;
      }
      if (!targetCoords) {
        targetCoords = await parseCoordsFromAddressInputAsync(addressValue, getLeadPlusCodeReference(addressValue));
      }
      if (!targetCoords) {
        targetCoords = rowCoords;
      }
      if (!targetCoords) {
        const primary = getPrimaryLeadLocation(list);
        targetCoords = resolveCoordsFromEntity(primary) || resolveCoordsFromEntity(state.leadModal.coords || {}) || null;
      }
      targetCoords = targetCoords || restFallback;
    }
  } else if (isStaffPickerContext) {
    const staffCoords = state.staff.form?.coords;
    if (staffCoords && Number.isFinite(Number(staffCoords.lat)) && Number.isFinite(Number(staffCoords.lng))) {
      targetCoords = { lat: Number(staffCoords.lat), lng: Number(staffCoords.lng) };
    }
  } else if (pickerContext === "settings") {
    if (verifiedMapLocation && Number.isFinite(Number(verifiedMapLocation.lat)) && Number.isFinite(Number(verifiedMapLocation.lng))) {
      targetCoords = { lat: Number(verifiedMapLocation.lat), lng: Number(verifiedMapLocation.lng) };
    } else {
      const override = getCeoGpsOverride();
      if (override) {
        targetCoords = override;
      } else if (Number.isFinite(Number(state.userProfile?.lat)) && Number.isFinite(Number(state.userProfile?.lng))) {
        targetCoords = { lat: Number(state.userProfile.lat), lng: Number(state.userProfile.lng) };
      }
    }
  }

  if (!window.L) {
    const leafletReady = await ensureLeafletLoaded();
    if (!leafletReady || !window.L) {
      alert("Karte konnte nicht geladen werden. Bitte Verbindung pruefen.");
      return;
    }
  }

  const modal = document.getElementById("locationPickerModal");
  const overlay = document.getElementById("pickerOverlay");
  const panel = document.getElementById("pickerPanel");

  if (modal) modal.classList.remove("hidden");
  setTimeout(() => {
    overlay?.classList.remove("opacity-0");
    panel?.classList.remove("translate-y-full");
  }, 10);

  if (locationPickerMap && !document.getElementById("pickerMap")?.hasChildNodes()) {
    locationPickerMap.remove();
    locationPickerMap = null;
  }

  if (!locationPickerMap && window.L) {
    locationPickerMap = window.L.map("pickerMap", { zoomControl: false, attributionControl: false }).setView([PRISHTINA_COORDS.lat, PRISHTINA_COORDS.lng], 16);
    window.L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", { maxZoom: 19 }).addTo(locationPickerMap);
  }
  renderLocationPickerContextMarkers();

  if (locationPickerMap) {
    setTimeout(() => locationPickerMap.invalidateSize(), 300);
    if (targetCoords && Number.isFinite(Number(targetCoords.lat)) && Number.isFinite(Number(targetCoords.lng))) {
      locationPickerMap.setView([targetCoords.lat, targetCoords.lng], 17, { animate: false });
    } else if (isLeadPickerContext) {
      const center = getLeadCountryCenter(getLeadFormCountryValue());
      locationPickerMap.setView([center.lat, center.lng], 16, { animate: false });
    } else if (address) {
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`);
        const data = await res.json();
        if (data.length > 0) locationPickerMap.setView([data[0].lat, data[0].lon], 17, { animate: false });
      } catch {}
    }
  }
}

function closeLocationPicker() {
  const modal = document.getElementById('locationPickerModal');
  document.getElementById('pickerOverlay')?.classList.add('opacity-0');
  document.getElementById('pickerPanel')?.classList.add('translate-y-full');
  setTimeout(() => {
    modal?.classList.add('hidden');
  }, 300);
}

async function confirmLocation() {
  if (!locationPickerMap) return;
  const center = locationPickerMap.getCenter();
  const coords = { lat: center.lat, lng: center.lng };
  const context = String(locationPickerTarget.context || "");
  if (context === "lead") {
    state.leadModal.coords = coords;
  } else if (context.startsWith("lead_location:")) {
    const index = Number(context.split(":")[1]);
    if (Number.isInteger(index) && index >= 0) {
      const list = normalizeLeadLocations(state.leadModal.locations, state.leadModal.lead?.address || "", state.leadModal.coords || null);
      while (list.length <= index) list.push(createLeadLocation());
      const addressInput = document.getElementById(locationPickerTarget.addressInputId || "");
      const address = addressInput ? String(addressInput.value || "").trim() : list[index].address || "";
      list[index] = createLeadLocation({ address, lat: coords.lat, lng: coords.lng });
      state.leadModal.locations = list;
      state.leadModal.lead = { ...(state.leadModal.lead || {}), address: list[0]?.address || "" };
      const primary = getPrimaryLeadLocation(list);
      state.leadModal.coords = hasLeadLocationCoords(primary) ? { lat: primary.lat, lng: primary.lng } : null;
      if (index === 0) {
        await hydrateLeadGeoFieldsFromCoords(coords, { sourceInputId: locationPickerTarget.addressInputId || "" });
      }
    }
  } else if (context === "staff") {
    const addressInput = document.getElementById(locationPickerTarget.addressInputId || "");
    const locationLabel = addressInput ? String(addressInput.value || "").trim() : "";
    state.staff = {
      ...state.staff,
      form: {
        ...state.staff.form,
        locationLabel: locationLabel || state.staff.form.locationLabel || state.staff.form.country || CEO_COUNTRIES[0],
        coords
      }
    };
  } else {
    verifiedMapLocation = coords;
  }
  if (context === "staff") {
    closeLocationPicker();
    render();
    return;
  }
  const badge = document.getElementById(locationPickerTarget.coordsDisplayId || "coordsDisplay");
  badge?.classList.remove("hidden");
  closeLocationPicker();
  if (isLeadInlineCreateView()) {
    render();
  }
}

// --- CRM: Leads & Customers (CEO) ---
let __secondaryAuth = null;
function getSecondaryAuth() {
  if (__secondaryAuth) return __secondaryAuth;
  const existing = getApps().find((item) => item.name === "menyra-secondary");
  const secondaryApp = existing || initializeApp(app.options, "menyra-secondary");
  __secondaryAuth = getAuth(secondaryApp);
  return __secondaryAuth;
}

function buildCreateAuthUserError(err) {
  const code = String(err?.code || "").trim().toLowerCase();
  if (code === "auth/email-already-in-use") {
    return new Error("Diese Email hat bereits ein Login. Bitte nutze eine andere Email.");
  }
  if (code === "auth/invalid-email") {
    return new Error("Bitte eine gueltige Email eingeben.");
  }
  if (code === "auth/weak-password") {
    return new Error("Das Passwort ist zu schwach. Bitte mindestens 6 Zeichen verwenden.");
  }
  if (code === "auth/operation-not-allowed") {
    return new Error("Email/Passwort-Login ist in Firebase nicht aktiviert.");
  }
  if (code === "auth/network-request-failed") {
    return new Error("Netzwerkfehler beim Erstellen des Logins.");
  }
  return err instanceof Error
    ? err
    : new Error("Login konnte nicht erstellt werden.");
}

async function createAuthUser(email, password) {
  if (!email || !password) throw new Error("Email/Passwort fehlt.");
  const auth2 = getSecondaryAuth();
  try {
    await signOut(auth2).catch(() => {});
    const cred = await createUserWithEmailAndPassword(auth2, email, password);
    return cred?.user || null;
  } catch (err) {
    throw buildCreateAuthUserError(err);
  } finally {
    try { await signOut(auth2); } catch {}
  }
}

async function ensureRestaurantPublicMeta(restaurantId, base, options = {}) {
  const safeRestaurantId = String(restaurantId || "").trim();
  if (!safeRestaurantId) return;
  const safeBase = base && typeof base === "object" ? base : {};
  const safeOptions = options && typeof options === "object" ? options : {};
  const businessName = String(safeBase?.name || safeBase?.restaurantName || safeBase?.businessName || "Business").trim() || "Business";
  const providedSlug = normalizeLeadLandingSlugValue(
    safeOptions.publicSlug
    || safeOptions.landingSlug
    || safeBase?.publicSlug
    || safeBase?.landingSlug
    || ""
  );
  const canUseProvidedSlug = providedSlug && (
    safeOptions.slugAlreadyResolved === true
    || safeOptions.preserveExistingSlug === true
  );
  const landingSlug = canUseProvidedSlug
    ? providedSlug
    : await resolveLeadLandingSlugUnique(safeRestaurantId, {
      publicSlug: safeOptions.publicSlug || safeBase?.publicSlug || "",
      landingSlug: safeOptions.landingSlug || safeBase?.landingSlug || "",
      businessName,
      leadId: safeOptions.leadId || safeBase?.leadId || ""
    });
  const canonicalPublicPath = `/${encodeURIComponent(landingSlug)}`;
  const landingUrl = buildLeadLandingPageUrl(safeRestaurantId, {
    publicSlug: landingSlug,
    landingSlug,
    businessName,
    leadId: safeOptions.leadId || safeBase?.leadId || "",
    forcePublicOrigin: true
  });
  const landingScreenOne = buildLeadLandingScreenOnePayload({
    restaurantId: safeRestaurantId,
    base: { ...safeBase, landingSlug }
  });
  const payload = {
    name: safeBase?.name || safeBase?.restaurantName || "",
    restaurantName: safeBase?.restaurantName || safeBase?.name || "",
    type: safeBase?.type || "cafe",
    city: safeBase?.city || "",
    logoUrl: safeBase?.logoUrl || safeBase?.logo || "",
    logo: safeBase?.logo || "",
    landingEnabled: true,
    landingTemplate: LEAD_LANDING_TEMPLATE_ID,
    landingRestaurantId: safeRestaurantId,
    publicSlug: landingSlug,
    canonicalPublicPath,
    landingSlug,
    landingPageUrl: landingUrl,
    landingScreenOne,
    landingUpdatedAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  };
  await setDoc(doc(db, "restaurants", safeRestaurantId), {
    publicSlug: landingSlug,
    canonicalPublicPath,
    landingEnabled: true,
    landingTemplate: LEAD_LANDING_TEMPLATE_ID,
    landingRestaurantId: safeRestaurantId,
    landingSlug,
    landingPageUrl: landingUrl,
    publicMetaUpdatedAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  }, { merge: true });
  await setDoc(doc(db, "restaurants", safeRestaurantId, "public", "meta"), payload, { merge: true });
}

function buildLeadSearchKey(lead = {}) {
  const locationText = Array.isArray(lead.locations)
    ? lead.locations.map((item) => item?.address || item?.city || "").join(" ")
    : "";
  return normalizeSearchKey([
    lead.businessName,
    lead.restaurantName,
    lead.name,
    lead.contactName,
    lead.phone,
    lead.email,
    lead.socialEmail,
    lead.instagram,
    lead.city,
    lead.address,
    lead.publicSlug,
    lead.landingSlug,
    lead.canonicalPublicPath,
    lead.status,
    typeof leadStatusLabel === "function" ? leadStatusLabel(lead.status) : "",
    lead.customerType,
    locationText
  ].filter(Boolean).join(" "));
}

function withLeadSearchKey(lead = {}) {
  return {
    ...lead,
    _searchKey: buildLeadSearchKey(lead)
  };
}

function normalizeLeadDoc(docSnap) {
  const sourceData = typeof docSnap?.data === "function" ? docSnap.data() : (docSnap?.data || docSnap || {});
  const data = applyKnownLeadOwnershipOverride(sourceData);
  const status = normalizeLeadStatusKey(data.status || "registered") || "registered";
  const safeLeadId = String(docSnap?.id || data.id || "").trim();
  const safeRestaurantId = String(data.restaurantId || data.restaurant || "").trim();
  const safeLandingRestaurantId = String(data.landingRestaurantId || safeRestaurantId).trim();
  const safeLandingSlug = String(data.publicSlug || data.landingSlug || "").trim();
  const safeBusinessName = String(data.businessName || data.name || "").trim();
  const hasLandingRouteKey = !!String(safeLandingRestaurantId || safeLandingSlug).trim();
  const safeLandingPageUrl = String(data.landingPageUrl || "").trim()
    || (hasLandingRouteKey
      ? buildLeadLandingPageUrl(safeLandingRestaurantId, {
          landingSlug: safeLandingSlug,
          businessName: safeBusinessName,
          leadId: safeLeadId
        })
      : "");
  const fallbackCoords = resolveCoordsFromEntity(data);
  const fallbackLat = fallbackCoords?.lat ?? null;
  const fallbackLng = fallbackCoords?.lng ?? null;
  const locations = normalizeLeadLocations(data.locations || [], data.address || "", {
    lat: fallbackLat,
    lng: fallbackLng
  });
  const primary = getPrimaryLeadLocation(locations);
  return withLeadSearchKey({
    id: safeLeadId,
    businessName: data.businessName || data.name || "",
    restaurantName: data.restaurantName || data.name || data.businessName || "",
    name: data.name || data.businessName || data.restaurantName || "",
    customerType: resolveCustomerType(data.customerType || data.type || "cafe"),
    contactName: data.contactName || data.contact || "",
    phone: data.phone || "",
    email: data.email || "",
    instagram: data.instagram || data.insta || "",
    city: data.city || "",
    address: locations[0]?.address || data.address || "",
    lat: hasLeadLocationCoords(primary) ? primary.lat : (fallbackLat ?? null),
    lng: hasLeadLocationCoords(primary) ? primary.lng : (fallbackLng ?? null),
    gpsLat: Number.isFinite(Number(fallbackLat)) ? Number(fallbackLat) : null,
    gpsLng: Number.isFinite(Number(fallbackLng)) ? Number(fallbackLng) : null,
    locations,
    logoUrl: data.logoUrl || data.logo || data.imageUrl || "",
    bestSpotLogoUrl: data.bestSpotLogoUrl || data.spotLogoUrl || "",
    spotLogoUrl: data.bestSpotLogoUrl || data.spotLogoUrl || "",
    specialEnabled: data.specialEnabled === true,
    note: data.note || "",
    status,
    restaurantId: safeRestaurantId,
    publicSlug: safeLandingSlug,
    canonicalPublicPath: String(safeLandingSlug ? `/${encodeURIComponent(safeLandingSlug)}` : "").trim(),
    landingEnabled: data.landingEnabled !== false,
    landingTemplate: data.landingTemplate || "",
    landingRestaurantId: safeLandingRestaurantId,
    landingSlug: safeLandingSlug,
    landingPageUrl: safeLandingPageUrl,
    socialUid: data.socialUid || "",
    socialEmail: data.socialEmail || "",
    createdByUid: data.createdByUid || "",
    createdByRole: data.createdByRole || "",
    createdByName: data.createdByName || "",
    createdByHandle: data.createdByHandle || "",
    ceoRootUid: data.ceoRootUid || "",
    ceoRootName: data.ceoRootName || "",
    ceoParentUid: data.ceoParentUid || "",
    ceoPath: normalizeCeoPath(data.ceoPath),
    createdAt: data.createdAt,
    updatedAt: data.updatedAt
  });
}

function normalizeLeadFromRestaurant(rest) {
  if (!rest?.id) return null;
  const data = applyKnownLeadOwnershipOverride(rest);
  const status = normalizeLeadStatusKey(data.status || "registered") || "registered";
  const safeRestaurantId = String(data.id || "").trim();
  const safeLeadId = String(data.leadId || data.id || "").trim();
  const safeBusinessName = String(data.name || data.restaurantName || "").trim();
  const safeLandingSlug = String(data.publicSlug || data.landingSlug || "").trim();
  const resolvedPublicSlug = safeLandingSlug || buildLeadLandingSlug(safeRestaurantId, {
    businessName: safeBusinessName,
    leadId: safeLeadId
  });
  const safeLandingPageUrl = String(data.landingPageUrl || "").trim()
    || buildLeadLandingPageUrl(safeRestaurantId, {
      landingSlug: resolvedPublicSlug,
      businessName: safeBusinessName,
      leadId: safeLeadId
    });
  const fallbackCoords = resolveCoordsFromEntity(data);
  const fallbackLat = fallbackCoords?.lat ?? null;
  const fallbackLng = fallbackCoords?.lng ?? null;
  const locations = normalizeLeadLocations(data.locations || [], data.address || "", {
    lat: fallbackLat,
    lng: fallbackLng
  });
  const primary = getPrimaryLeadLocation(locations);
  return withLeadSearchKey({
    id: safeLeadId,
    businessName: data.name || data.restaurantName || "",
    restaurantName: data.restaurantName || data.name || "",
    name: data.name || data.restaurantName || "",
    customerType: resolveCustomerType(data.type || data.customerType || "cafe"),
    contactName: data.ownerName || "",
    phone: data.phone || "",
    email: data.ownerEmail || "",
    instagram: data.instagram || data.insta || "",
    city: data.city || "",
    address: locations[0]?.address || data.address || "",
    logoUrl: data.logoUrl || data.logo || "",
    bestSpotLogoUrl: data.bestSpotLogoUrl || data.spotLogoUrl || "",
    spotLogoUrl: data.bestSpotLogoUrl || data.spotLogoUrl || "",
    specialEnabled: data.specialEnabled === true,
    note: "",
    status,
    restaurantId: safeRestaurantId,
    publicSlug: resolvedPublicSlug,
    canonicalPublicPath: resolvedPublicSlug ? `/${encodeURIComponent(resolvedPublicSlug)}` : "",
    landingEnabled: true,
    landingTemplate: data.landingTemplate || LEAD_LANDING_TEMPLATE_ID,
    landingRestaurantId: safeRestaurantId,
    landingSlug: resolvedPublicSlug,
    landingPageUrl: safeLandingPageUrl,
    socialUid: data.ownerUid || "",
    socialEmail: data.ownerEmail || "",
    createdByUid: data.createdByUid || "",
    createdByRole: data.createdByRole || "",
    createdByName: data.createdByName || "",
    createdByHandle: data.createdByHandle || "",
    ceoRootUid: data.ceoRootUid || "",
    ceoRootName: data.ceoRootName || "",
    ceoParentUid: data.ceoParentUid || "",
    ceoPath: normalizeCeoPath(data.ceoPath),
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
    lat: hasLeadLocationCoords(primary) ? primary.lat : (fallbackLat ?? null),
    lng: hasLeadLocationCoords(primary) ? primary.lng : (fallbackLng ?? null),
    gpsLat: Number.isFinite(Number(fallbackLat)) ? Number(fallbackLat) : null,
    gpsLng: Number.isFinite(Number(fallbackLng)) ? Number(fallbackLng) : null,
    locations
  });
}

function isRestaurantLeadCandidate(rest = {}) {
  const typeKey = normalizeRestaurantType(rest?.type || rest?.customerType || rest?.category || rest?.kind || rest?.restaurantType || "");
  const hasLinkedOwner = !!String(rest?.ownerUid || rest?.socialUid || rest?.uid || rest?.userUid || "").trim();
  const statusKey = normalizeLeadStatusKey(rest.status || "");
  if (typeKey === "ecommerce" && hasLinkedOwner && (!statusKey || ["registered", "contacted"].includes(statusKey))) return false;
  if (statusKey === "kunde") return false;
  if (["registered", "contacted", "testphase", "no_interest"].includes(statusKey)) return true;
  if (rest.leadId) return true;
  const noOwner = !rest.ownerUid && !rest.ownerEmail;
  if (!statusKey && noOwner) return true;
  return false;
}

function leadStatusTone(status) {
  const key = normalizeLeadStatusKey(status);
  if (key === "registered") return { bg: "bg-indigo-50", text: "text-indigo-600" };
  if (key === "contacted") return { bg: "bg-amber-50", text: "text-amber-600" };
  if (key === "testphase") return { bg: "bg-sky-50", text: "text-sky-600" };
  if (key === "kunde") return { bg: "bg-emerald-100", text: "text-emerald-700" };
  if (key === "no_interest") return { bg: "bg-slate-100", text: "text-slate-500" };
  return { bg: "bg-slate-100", text: "text-slate-500" };
}

function resolveRestaurantStatusFromLead(leadStatus, currentStatus = "") {
  const leadKey = normalizeLeadStatusKey(leadStatus);
  if (leadKey === "kunde") return "active";
  if (leadKey === "testphase") return "testphase";
  if (["registered", "contacted", "no_interest"].includes(leadKey)) return "lead";
  if (currentStatus) return currentStatus;
  return "lead";
}

function leadMatchesQuery(lead, queryKey) {
  if (!queryKey) return true;
  const hay = String(lead?._searchKey || "").trim() || buildLeadSearchKey(lead);
  return hay.includes(queryKey);
}

function customerMatchesQuery(rest, queryKey) {
  if (!queryKey) return true;
  const hay = normalizeSearchKey([
    rest.name,
    rest.restaurantName,
    rest.city,
    rest.ownerName,
    rest.ownerEmail,
    rest.phone,
    rest.instagram,
    rest.insta
  ].filter(Boolean).join(" "));
  return hay.includes(queryKey);
}

function leadBelongsToScope(lead, scope = state.leads.scope) {
  const safeScope = normalizeLeadScopeKey(scope);
  const statusKey = normalizeLeadStatusKey(lead?.status || "");
  if (statusKey === "kunde") return false;
  if (safeScope === "archived") return statusKey === "no_interest";
  if (statusKey === "no_interest") return false;
  return safeScope === "own" ? isCurrentCeoOwnRow(lead) : !isCurrentCeoOwnRow(lead);
}

function customerBelongsToScope(customer, scope = state.customers.scope) {
  const safeScope = normalizeCustomerScopeKey(scope);
  if (!isCustomerRestaurant(customer)) return false;
  return safeScope === "own" ? isCurrentCeoOwnRow(customer) : !isCurrentCeoOwnRow(customer);
}

async function fetchLeadScopeRows(scope, desiredCount) {
  const safeScope = normalizeLeadScopeKey(scope);
  const result = await loadCrmLeadsCore({
    db,
    collectionFn: collection,
    queryFn: query,
    whereFn: where,
    limitFn: limit,
    getDocsFn: getDocs,
    scope: safeScope,
    desiredCount,
    pageSize: CRM_PAGE_SIZE,
    getCurrentCeoMetaFn: getCurrentCeoMeta,
    normalizeLeadScopeKeyFn: normalizeLeadScopeKey,
    normalizeLeadDocFn: normalizeLeadDoc,
    normalizeLeadFromRestaurantFn: normalizeLeadFromRestaurant,
    isRestaurantLeadCandidateFn: isRestaurantLeadCandidate,
    canCurrentCeoSeeRowFn: canCurrentCeoSeeRow,
    isCurrentCeoOwnRowFn: isCurrentCeoOwnRow,
    normalizeLeadStatusKeyFn: normalizeLeadStatusKey,
    hasGlobalCeoAccessFn: hasGlobalCeoAccess,
    toDateSafeFn: toDateSafe
  });
  const restaurantRows = Array.isArray(result.restaurantRows) ? result.restaurantRows : [];
  if (restaurantRows.length) {
    state.restaurants = mergeRestaurants(state.restaurants, restaurantRows);
    rebuildBusinessLocations();
  }
  return Array.isArray(result.rows) ? result.rows : [];
}

async function fetchCustomerScopeRows(scope, desiredCount) {
  const safeScope = normalizeCustomerScopeKey(scope);
  const result = await loadCrmCustomersCore({
    db,
    collectionFn: collection,
    queryFn: query,
    whereFn: where,
    limitFn: limit,
    getDocsFn: getDocs,
    scope: safeScope,
    desiredCount,
    pageSize: CRM_PAGE_SIZE,
    getCurrentCeoMetaFn: getCurrentCeoMeta,
    normalizeCustomerScopeKeyFn: normalizeCustomerScopeKey,
    isCustomerRestaurantFn: isCustomerRestaurant,
    canCurrentCeoSeeRowFn: canCurrentCeoSeeRow,
    isCurrentCeoOwnRowFn: isCurrentCeoOwnRow,
    hasGlobalCeoAccessFn: hasGlobalCeoAccess,
    toDateSafeFn: toDateSafe
  });
  return Array.isArray(result.rows) ? result.rows : [];
}

function refreshCustomersFromRestaurants() {
  const scope = normalizeCustomerScopeKey(state.customers.scope);
  const size = Math.max(CRM_PAGE_SIZE, Number(state.customers.pageSize?.[scope]) || CRM_PAGE_SIZE);
  const currentUid = String(state.user?.uid || "").trim();
  const list = Array.isArray(state.restaurants)
    ? state.restaurants.filter((rest) => (
      isCustomerRestaurant(rest)
      && (isCeoUser() ? isOwnedByVisibleCeoTeam(rest) : true)
    ))
      .filter((rest) => customerBelongsToScope(rest, scope))
    : [];
  list.sort((a, b) => (toDateSafe(b.createdAt)?.getTime() || 0) - (toDateSafe(a.createdAt)?.getTime() || 0));
  state.customers.pages = {
    ...state.customers.pages,
    [scope]: list.slice(0, size)
  };
  state.customers.hasMore = {
    ...state.customers.hasMore,
    [scope]: list.length > size
  };
  state.customers.loaded = {
    ...state.customers.loaded,
    [scope]: true
  };
  state.customers.items = state.customers.pages[scope].slice();
  writeCustomerScopeCache(currentUid, scope, state.customers.pages[scope], {
    hasMore: state.customers.hasMore?.[scope] || false,
    knownCount: Array.isArray(list) ? list.length : 0,
    countExact: true,
    pageSize: size
  });
}

function syncVisibleLeadPageFromItems() {
  const scope = normalizeLeadScopeKey(state.leads.scope);
  const size = Math.max(CRM_PAGE_SIZE, Number(state.leads.pageSize?.[scope]) || CRM_PAGE_SIZE);
  const currentUid = String(state.user?.uid || "").trim();
  const sourceItems = Array.isArray(state.leads.items) ? state.leads.items.slice() : [];
  const nextItems = sourceItems.slice(0, size);
  state.leads.pages = {
    ...state.leads.pages,
    [scope]: nextItems
  };
  state.leads.hasMore = {
    ...state.leads.hasMore,
    [scope]: !!state.leads.hasMore?.[scope] || sourceItems.length > size
  };
  state.leads.loaded = {
    ...state.leads.loaded,
    [scope]: true
  };
  writeLeadScopeCache(currentUid, scope, nextItems, {
    hasMore: state.leads.hasMore?.[scope] || sourceItems.length > size,
    knownCount: sourceItems.length,
    countExact: !(state.leads.hasMore?.[scope] || sourceItems.length > size),
    pageSize: size
  });
}

function patchLeadLandingInMemory(leadId = "", patch = {}) {
  const safeLeadId = String(leadId || "").trim();
  if (!safeLeadId || !patch || typeof patch !== "object") return;
  const mergePatch = (entry = {}) => {
    if (String(entry?.id || "").trim() !== safeLeadId) return entry;
    return { ...entry, ...patch };
  };
  if (Array.isArray(state.leads.items)) {
    state.leads.items = state.leads.items.map((entry) => mergePatch(entry));
  }
  if (state.leads.pages && typeof state.leads.pages === "object") {
    Object.keys(state.leads.pages).forEach((scopeKey) => {
      const page = Array.isArray(state.leads.pages[scopeKey]) ? state.leads.pages[scopeKey] : [];
      state.leads.pages[scopeKey] = page.map((entry) => mergePatch(entry));
    });
  }
}

function buildLeadLandingMetaBaseFromLead(lead = {}, restaurant = null) {
  const rest = restaurant || {};
  const businessName = String(lead?.businessName || rest?.name || rest?.restaurantName || "Business").trim() || "Business";
  const city = String(lead?.city || rest?.city || "").trim();
  const country = String(lead?.country || rest?.country || "").trim();
  const address = String(lead?.address || rest?.address || "").trim();
  const logoUrl = String(lead?.logoUrl || lead?.logo || rest?.logoUrl || rest?.logo || "").trim();
  const customerType = resolveCustomerType(lead?.customerType || rest?.type || rest?.customerType || "cafe");
  const restaurantStatus = resolveRestaurantStatusFromLead(lead?.status || rest?.status || "registered", rest?.status || "");
  const landingSlug = String(lead?.publicSlug || lead?.landingSlug || rest?.publicSlug || rest?.landingSlug || "").trim();
  return {
    ...(rest || {}),
    name: businessName,
    restaurantName: businessName,
    type: customerType,
    city,
    country,
    address,
    logoUrl,
    logo: logoUrl,
    status: restaurantStatus,
    leadId: String(lead?.id || rest?.leadId || "").trim(),
    publicSlug: landingSlug,
    canonicalPublicPath: landingSlug ? `/${encodeURIComponent(landingSlug)}` : "",
    landingSlug
  };
}

async function backfillLeadLandingForRows(rows = []) {
  const list = Array.isArray(rows) ? rows : [];
  let didPatch = false;
  for (const lead of list.slice(0, 120)) {
    const safeLeadId = String(lead?.id || "").trim();
    const restaurant = resolveExistingRestaurantForLead(state, lead || {});
    const restaurantId = String(lead?.restaurantId || lead?.landingRestaurantId || restaurant?.id || "").trim();
    if (!safeLeadId || !restaurantId) continue;
    const dedupeKey = `${safeLeadId}:${restaurantId}`;
    if (leadLandingBackfillDone.has(dedupeKey)) continue;

    const businessName = String(lead?.businessName || restaurant?.name || restaurant?.restaurantName || "Business").trim() || "Business";
    const preservedLandingSlug = getStableLeadSlug(lead, restaurant);
    const landingSlug = preservedLandingSlug || buildLeadLandingSlug(restaurantId, {
      businessName,
      leadId: safeLeadId
    });
    const canonicalPublicPath = landingSlug ? `/${encodeURIComponent(landingSlug)}` : "";
    const landingPageUrl = buildLeadLandingPageUrl(restaurantId, {
      publicSlug: landingSlug,
      landingSlug,
      businessName,
      leadId: safeLeadId,
      forcePublicOrigin: true
    });
    const hasLeadLanding = (
      String(lead?.landingTemplate || "").trim() === LEAD_LANDING_TEMPLATE_ID
      && String(lead?.landingRestaurantId || "").trim() === restaurantId
      && String(lead?.publicSlug || "").trim() === landingSlug
      && String(lead?.canonicalPublicPath || "").trim() === canonicalPublicPath
      && String(lead?.landingSlug || "").trim() === landingSlug
      && String(lead?.landingPageUrl || "").trim() === landingPageUrl
    );
    const hasRestaurantLanding = (
      String(restaurant?.landingTemplate || "").trim() === LEAD_LANDING_TEMPLATE_ID
      && String(restaurant?.publicSlug || "").trim() === landingSlug
      && String(restaurant?.canonicalPublicPath || "").trim() === canonicalPublicPath
      && String(restaurant?.landingSlug || "").trim() === landingSlug
      && String(restaurant?.landingPageUrl || "").trim() === landingPageUrl
    );
    if (hasLeadLanding && hasRestaurantLanding) {
      leadLandingBackfillDone.add(dedupeKey);
      continue;
    }

    try {
      const metaBase = buildLeadLandingMetaBaseFromLead(
        { ...(lead || {}), publicSlug: landingSlug, landingSlug },
        { ...(restaurant || {}), publicSlug: landingSlug, landingSlug }
      );
      await ensureRestaurantPublicMeta(restaurantId, metaBase, {
        publicSlug: landingSlug,
        landingSlug,
        leadId: safeLeadId,
        slugAlreadyResolved: !!preservedLandingSlug,
        preserveExistingSlug: !!preservedLandingSlug
      });
      const restaurantPatch = {
        landingEnabled: true,
        landingTemplate: LEAD_LANDING_TEMPLATE_ID,
        landingRestaurantId: restaurantId,
        publicSlug: landingSlug,
        canonicalPublicPath,
        landingSlug,
        landingPageUrl,
        updatedAt: serverTimestamp()
      };
      await setDoc(doc(db, "restaurants", restaurantId), restaurantPatch, { merge: true });
      const patch = {
        landingEnabled: true,
        landingTemplate: LEAD_LANDING_TEMPLATE_ID,
        landingRestaurantId: restaurantId,
        publicSlug: landingSlug,
        canonicalPublicPath,
        landingSlug,
        landingPageUrl,
        updatedAt: serverTimestamp()
      };
      await setDoc(doc(db, "leads", safeLeadId), patch, { merge: true });
      patchLeadLandingInMemory(safeLeadId, patch);
      leadLandingBackfillDone.add(dedupeKey);
      didPatch = true;
    } catch (err) {
      console.warn("[mnyra][crm.leadLanding.backfill]", safeLeadId, err);
    }
  }
  if (didPatch) render();
}

function queueLeadLandingBackfill(rows = []) {
  const list = Array.isArray(rows) ? rows : [];
  if (!list.length) return;
  if (leadLandingBackfillPromise) return;
  leadLandingBackfillPromise = Promise.resolve()
    .then(() => backfillLeadLandingForRows(list))
    .catch(() => {})
    .finally(() => {
      leadLandingBackfillPromise = null;
    });
}

async function loadLeads({ scope = state.leads.scope, grow = false } = {}) {
  if (!isCeoUser()) return;
  if (!hasStoredCeoCrmCounts(state.userProfile?.crmCounts) && !hasCeoCrmCountsPromise()) {
    void ensureCeoCrmCountsLoaded();
  }
  const safeScope = normalizeLeadScopeKey(scope);
  const currentUid = String(state.user?.uid || "").trim();
  const currentSize = Math.max(CRM_PAGE_SIZE, Number(state.leads.pageSize?.[safeScope]) || CRM_PAGE_SIZE);
  const nextSize = grow ? currentSize + CRM_PAGE_SIZE : currentSize;
  const fetchLimit = Math.min(Math.max(nextSize * (safeScope === "own" ? 3 : 4), CRM_PAGE_SIZE + 1), 160);
  if (!grow && !state.leads.loaded?.[safeScope] && currentUid) {
    const cached = readLeadScopeCache(currentUid, safeScope);
    if (cached?.fresh && Array.isArray(cached.data)) {
      const cachedRows = cached.data.map((row) => normalizeLeadDoc(row));
      const cachedPageSize = Math.max(nextSize, Number(cached.meta?.pageSize) || cachedRows.length || nextSize);
      state.leads.scope = safeScope;
      state.leads.pageSize = {
        ...state.leads.pageSize,
        [safeScope]: cachedPageSize
      };
      state.leads.pages = {
        ...state.leads.pages,
        [safeScope]: cachedRows.slice(0, cachedPageSize)
      };
      state.leads.loaded = {
        ...state.leads.loaded,
        [safeScope]: true
      };
      state.leads.hasMore = {
        ...state.leads.hasMore,
        [safeScope]: !!cached.meta?.hasMore
      };
      state.leads.knownCount = {
        ...state.leads.knownCount,
        [safeScope]: Math.max(cachedRows.length, Number(cached.meta?.knownCount) || 0)
      };
      state.leads.countExact = {
        ...state.leads.countExact,
        [safeScope]: cached.meta?.countExact !== false
      };
      state.leads.items = state.leads.pages[safeScope].slice();
      state.leads.loading = false;
      state.leads.loadingMore = false;
      state.leads.error = "";
      queueLeadLandingBackfill(cachedRows);
      render();
      return;
    }
  }
  state.leads.scope = safeScope;
  state.leads.pageSize = {
    ...state.leads.pageSize,
    [safeScope]: nextSize
  };
  state.leads.loading = !grow;
  state.leads.loadingMore = !!grow;
  if (!grow) state.leads.error = "";
  render();
  try {
    const rows = await timeLoadingAsync("lead list load", () => fetchLeadScopeRows(safeScope, nextSize), {
      scope: safeScope,
      source: "leads",
      count: nextSize
    });
    const nextItems = rows.slice(0, nextSize);
    state.leads.pages = {
      ...state.leads.pages,
      [safeScope]: nextItems
    };
    state.leads.loaded = {
      ...state.leads.loaded,
      [safeScope]: true
    };
    state.leads.hasMore = {
      ...state.leads.hasMore,
      [safeScope]: rows.length > nextSize
    };
    state.leads.knownCount = {
      ...state.leads.knownCount,
      [safeScope]: rows.length
    };
    state.leads.countExact = {
      ...state.leads.countExact,
      [safeScope]: rows.length < fetchLimit
    };
    state.leads.items = nextItems.slice();
    state.leads.error = "";
    queueLeadLandingBackfill(nextItems);
    writeLeadScopeCache(currentUid, safeScope, nextItems, {
      hasMore: rows.length > nextSize,
      knownCount: rows.length,
      countExact: rows.length < fetchLimit,
      pageSize: nextSize
    });
  } catch (err) {
    console.error(err);
    state.leads.error = "Leads laden fehlgeschlagen.";
  } finally {
    state.leads.loading = false;
    state.leads.loadingMore = false;
    render();
  }
}

async function loadCustomers({ scope = state.customers.scope, grow = false } = {}) {
  if (!isCeoUser()) return;
  if (!hasStoredCeoCrmCounts(state.userProfile?.crmCounts) && !hasCeoCrmCountsPromise()) {
    void ensureCeoCrmCountsLoaded();
  }
  const safeScope = normalizeCustomerScopeKey(scope);
  const currentUid = String(state.user?.uid || "").trim();
  const currentSize = Math.max(CRM_PAGE_SIZE, Number(state.customers.pageSize?.[safeScope]) || CRM_PAGE_SIZE);
  const nextSize = grow ? currentSize + CRM_PAGE_SIZE : currentSize;
  const fetchLimit = Math.min(Math.max(nextSize * (safeScope === "own" ? 3 : 4), CRM_PAGE_SIZE + 1), 160);
  if (!grow && !state.customers.loaded?.[safeScope] && currentUid) {
    const cached = readCustomerScopeCache(currentUid, safeScope);
    if (cached?.fresh && Array.isArray(cached.data)) {
      const cachedRows = cached.data.slice();
      const cachedPageSize = Math.max(nextSize, Number(cached.meta?.pageSize) || cachedRows.length || nextSize);
      if (cachedRows.length) {
        state.restaurants = mergeRestaurants(state.restaurants, cachedRows);
        rebuildBusinessLocations();
      }
      state.customers.scope = safeScope;
      state.customers.pageSize = {
        ...state.customers.pageSize,
        [safeScope]: cachedPageSize
      };
      state.customers.pages = {
        ...state.customers.pages,
        [safeScope]: cachedRows.slice(0, cachedPageSize)
      };
      state.customers.loaded = {
        ...state.customers.loaded,
        [safeScope]: true
      };
      state.customers.hasMore = {
        ...state.customers.hasMore,
        [safeScope]: !!cached.meta?.hasMore
      };
      state.customers.knownCount = {
        ...state.customers.knownCount,
        [safeScope]: Math.max(cachedRows.length, Number(cached.meta?.knownCount) || 0)
      };
      state.customers.countExact = {
        ...state.customers.countExact,
        [safeScope]: cached.meta?.countExact !== false
      };
      state.customers.items = state.customers.pages[safeScope].slice();
      state.customers.loading = false;
      state.customers.loadingMore = false;
      state.customers.error = "";
      render();
      return;
    }
  }
  state.customers.scope = safeScope;
  state.customers.pageSize = {
    ...state.customers.pageSize,
    [safeScope]: nextSize
  };
  state.customers.loading = !grow;
  state.customers.loadingMore = !!grow;
  if (!grow) state.customers.error = "";
  render();
  try {
    const rows = await fetchCustomerScopeRows(safeScope, nextSize);
    if (rows.length) {
      state.restaurants = mergeRestaurants(state.restaurants, rows);
      rebuildBusinessLocations();
    }
    const nextItems = rows.slice(0, nextSize);
    state.customers.pages = {
      ...state.customers.pages,
      [safeScope]: nextItems
    };
    state.customers.loaded = {
      ...state.customers.loaded,
      [safeScope]: true
    };
    state.customers.hasMore = {
      ...state.customers.hasMore,
      [safeScope]: rows.length > nextSize
    };
    state.customers.knownCount = {
      ...state.customers.knownCount,
      [safeScope]: rows.length
    };
    state.customers.countExact = {
      ...state.customers.countExact,
      [safeScope]: rows.length < fetchLimit
    };
    state.customers.items = nextItems.slice();
    state.customers.error = "";
    writeCustomerScopeCache(currentUid, safeScope, nextItems, {
      hasMore: rows.length > nextSize,
      knownCount: rows.length,
      countExact: rows.length < fetchLimit,
      pageSize: nextSize
    });
  } catch (err) {
    console.error(err);
    state.customers.error = "Kunden laden fehlgeschlagen.";
  } finally {
    state.customers.loading = false;
    state.customers.loadingMore = false;
    render();
  }
}

function isHiddenLegacyCeoEmail(email = "") {
  return HIDDEN_LEGACY_CEO_EMAILS.includes(normalizeEmailValue(email));
}

function resolveKnownLeadOwnerMeta(entity = {}) {
  const email = normalizeEmailValue(entity.email || entity.ownerEmail || entity.socialEmail || "");
  const businessKey = normalizeSearchKey(entity.businessName || entity.name || entity.restaurantName || "");
  const creatorUid = String(entity.createdByUid || "").trim();
  const hasStoredMeta = !!String(entity.createdByUid || "").trim() || normalizeCeoPath(entity.ceoPath).length > 0;
  let targetHandle = "";
  let targetName = "";

  if (MILAN_OWNED_LEAD_EMAILS.includes(email) || MILAN_OWNED_LEAD_BUSINESSES.includes(businessKey)) {
    targetHandle = "milannikolic";
    targetName = "Milan Nikolic";
  } else if (ALBERT_OWNED_LEAD_EMAILS.includes(email) || ALBERT_OWNED_LEAD_BUSINESSES.includes(businessKey)) {
    targetHandle = "alberthoti";
    targetName = "Albert Hoti";
  } else if (creatorUid && hiddenLegacyCeoUids.includes(creatorUid) && isAlbertCeoUser()) {
    return buildCeoCreatorMeta();
  } else if (!hasStoredMeta && isAlbertCeoUser()) {
    return buildCeoCreatorMeta();
  }

  if (!targetHandle) return null;

  const normalizedTargetHandle = normalizeHandle(targetHandle);
  const currentHandle = normalizeHandle(state.userProfile.handle || state.userProfile.name || state.user?.displayName || "");
  if (currentHandle && currentHandle === normalizedTargetHandle) {
    const selfMeta = buildCeoCreatorMeta();
    return {
      ...selfMeta,
      createdByName: selfMeta.createdByName || targetName,
      createdByHandle: state.userProfile.handle || normalizedTargetHandle
    };
  }

  const staffEntry = (Array.isArray(state.staff.items) ? state.staff.items : []).find((item) => (
    normalizeHandle(item.handle || item.name || "") === normalizedTargetHandle
  ));
  if (!staffEntry) return null;

  const ceoPath = normalizeCeoPath(staffEntry.ceoPath, [staffEntry.ceoRootUid, staffEntry.ceoParentUid, staffEntry.uid]);
  return {
    createdByUid: String(staffEntry.uid || "").trim(),
    createdByRole: "ceo",
    createdByName: staffEntry.name || targetName,
    createdByHandle: staffEntry.handle || normalizedTargetHandle,
    ceoRootUid: String(staffEntry.ceoRootUid || ceoPath[0] || staffEntry.uid || "").trim(),
    ceoRootName: String(staffEntry.ceoRootName || "").trim(),
    ceoParentUid: String(staffEntry.ceoParentUid || "").trim(),
    ceoPath
  };
}

function applyKnownLeadOwnershipOverride(entity = {}) {
  const meta = resolveKnownLeadOwnerMeta(entity);
  return meta ? { ...entity, ...meta } : entity;
}

function createEmptyStaffForm() {
  return {
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    country: normalizeCeoCountry(state.userProfile?.country || CEO_COUNTRIES[0]),
    locationLabel: "",
    coords: null,
    avatarUrl: "",
    avatarPreview: "",
    avatarFile: null
  };
}

function buildStaffAccountEmail(firstName = "", lastName = "", fallback = "") {
  const toEmailLocal = (value) => String(value || "")
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/_/g, "")
    .replace(/[^a-z0-9]/g, "");
  const localPart = toEmailLocal(`${firstName || ""}${lastName || ""}`) || toEmailLocal(fallback || "");
  return localPart ? `${localPart}@mnyra.com` : "";
}

function getStaffFormEmail(form = state.staff.form, { preferStored = false } = {}) {
  const safeForm = form || {};
  const stored = normalizeEmailValue(safeForm.email || "");
  if (preferStored && stored) return stored;
  return buildStaffAccountEmail(safeForm.firstName || "", safeForm.lastName || "", safeForm.name || stored.split("@")[0] || "");
}

function syncStaffDerivedEmailField() {
  if (!state.staff.editorUid) {
    state.staff.form = {
      ...state.staff.form,
      email: getStaffFormEmail(state.staff.form)
    };
  }
  const input = document.getElementById("staffEmail");
  if (input instanceof HTMLInputElement) {
    input.value = getStaffFormEmail(state.staff.form, { preferStored: !!state.staff.editorUid });
  }
}

function openStaffEditor(mode = "create", entry = null) {
  if (!isCeoUser()) return;
  if (mode === "edit" && entry) {
    const fallbackParts = String(entry.name || "").trim().split(/\s+/).filter(Boolean);
    const firstName = String(entry.firstName || fallbackParts[0] || "").trim();
    const lastName = String(entry.lastName || fallbackParts.slice(1).join(" ") || "").trim();
    const coords = Number.isFinite(Number(entry.gpsLat ?? entry.lat)) && Number.isFinite(Number(entry.gpsLng ?? entry.lng))
      ? { lat: Number(entry.gpsLat ?? entry.lat), lng: Number(entry.gpsLng ?? entry.lng) }
      : null;
    const avatarUrl = String(entry.avatarUrl || entry.avatar || "").trim();
    state.staff = {
      ...state.staff,
      view: "form",
      editorUid: String(entry.uid || entry.userId || entry.id || "").trim(),
      saving: false,
      deleting: false,
      error: "",
      status: "",
      form: {
        firstName,
        lastName,
        email: normalizeEmailValue(entry.email || buildStaffAccountEmail(firstName, lastName, entry.name || "")),
        password: "",
        country: normalizeCeoCountry(entry.country),
        locationLabel: String(entry.locationLabel || entry.location || entry.city || "").trim(),
        coords,
        avatarUrl,
        avatarPreview: avatarUrl,
        avatarFile: null
      }
    };
  } else {
    state.staff = {
      ...state.staff,
      view: "form",
      editorUid: "",
      saving: false,
      deleting: false,
      error: "",
      status: "",
      form: createEmptyStaffForm()
    };
  }
  render();
}

function closeStaffEditor(status = "") {
  state.staff = {
    ...state.staff,
    view: "list",
    editorUid: "",
    saving: false,
    deleting: false,
    status,
    form: createEmptyStaffForm()
  };
}

function syncStaffFormFromDom() {
  const read = (id) => {
    const node = document.getElementById(id);
    return node ? String(node.value || "") : "";
  };
  const nextCoords = state.staff.form.coords && Number.isFinite(Number(state.staff.form.coords.lat)) && Number.isFinite(Number(state.staff.form.coords.lng))
    ? { lat: Number(state.staff.form.coords.lat), lng: Number(state.staff.form.coords.lng) }
    : null;
  const nextForm = {
    ...state.staff.form,
    firstName: read("staffFirstName").trim(),
    lastName: read("staffLastName").trim(),
    password: read("staffPassword"),
    country: normalizeCeoCountry(read("staffCountry")),
    locationLabel: read("staffLocationLabel").trim(),
    coords: nextCoords
  };
  nextForm.email = getStaffFormEmail(nextForm, { preferStored: !!state.staff.editorUid });
  state.staff.form = nextForm;
}

function resetStaffForm(status = "") {
  closeStaffEditor(status);
}

async function loadCeoStaff({ grow = false } = {}) {
  if (!isCeoUser()) return;
  if (ceoStaffLoadPromise) return ceoStaffLoadPromise;
  ceoStaffLoadPromise = (async () => {
    const currentSize = Math.max(CRM_PAGE_SIZE, Number(state.staff.pageSize) || CRM_PAGE_SIZE);
    const nextSize = grow ? currentSize + CRM_PAGE_SIZE : currentSize;
    state.staff.pageSize = nextSize;
    state.staff.loading = !grow;
    state.staff.loadingMore = !!grow;
    if (!grow) state.staff.error = "";
    render();
    try {
      const result = await loadCrmCeoStaffCore({
        db,
        collectionFn: collection,
        queryFn: query,
        whereFn: where,
        limitFn: limit,
        getDocsFn: getDocs,
        grow,
        currentPageSize: currentSize,
        pageSize: CRM_PAGE_SIZE,
        getCurrentCeoMetaFn: getCurrentCeoMeta,
        hasGlobalCeoAccessFn: hasGlobalCeoAccess,
        normalizeCeoStaffRecordFn: normalizeCeoStaffRecord,
        canViewCeoRecordFn: canViewCeoRecord,
        hydrateStaffRecordsFromUserProfilesFn: hydrateStaffRecordsFromUserProfiles,
        isHiddenLegacyCeoEmailFn: isHiddenLegacyCeoEmail,
        uniqueStringListFn: uniqueStringList,
        toDateSafeFn: toDateSafe,
        syncDirectory: true
      });
      hiddenLegacyCeoUids = Array.isArray(result.hiddenLegacyCeoUids) ? result.hiddenLegacyCeoUids : [];
      const items = Array.isArray(result.rows) ? result.rows : [];
      dataLoaded.staff = true;
      state.staff.hasMore = items.length > nextSize;
      state.staff.items = items.slice(0, nextSize);
      state.staff.error = "";
      if (!hasCeoCrmCountsPromise() && (
        !hasStoredCeoCrmCounts(state.userProfile?.crmCounts)
        || state.staff.items.some((item) => !hasStoredCeoCrmCounts(item?.crmCounts || {}))
      )) {
        void ensureCeoCrmCountsLoaded();
      }
    } catch (err) {
      console.error(err);
      state.staff.error = "Staff laden fehlgeschlagen.";
    } finally {
      state.staff.loading = false;
      state.staff.loadingMore = false;
      render();
    }
  })();
  try {
    return await ceoStaffLoadPromise;
  } finally {
    ceoStaffLoadPromise = null;
  }
}

async function saveCeoStaffFromView() {
  return saveCeoStaffFromViewCore({
    state,
    isCeoUser,
    syncStaffFormFromDom,
    getStaffFormEmail,
    normalizeCeoCountry,
    buildCeoName,
    render,
    getCurrentCeoMeta,
    createAuthUser,
    uploadCompressedImage,
    normalizeCeoPath,
    uniqueStringList,
    normalizeHandle,
    setDoc,
    doc,
    db,
    serverTimestamp,
    createEmptyCeoCrmCounts,
    resetStaffForm,
    loadCeoStaff,
    saveUserProfileToStorage,
    sanitizeCeoCrmCounts
  });
}

async function deleteCeoStaffFromView() {
  if (!state.user || !isCeoUser()) return;
  const uid = String(state.staff.editorUid || "").trim();
  if (!uid) return;
  if (uid === String(state.user.uid || "")) {
    state.staff.status = "Du kannst deinen eigenen CEO hier nicht loeschen.";
    render();
    return;
  }
  const entry = (state.staff.items || []).find((item) => String(item.uid || "") === uid);
  const label = entry?.name || "diesen CEO";
  if (!confirm(`Willst du ${label} wirklich loeschen?`)) return;

  state.staff.deleting = true;
  state.staff.saving = false;
  state.staff.status = "CEO wird geloescht...";
  render();

  try {
    await Promise.all([
      deleteDoc(doc(db, "superadmins", uid)),
      deleteDoc(doc(db, "users", uid))
    ]);
    resetStaffForm("CEO Staff geloescht.");
    await loadCeoStaff();
  } catch (err) {
    console.error(err);
    state.staff.status = err?.message || "CEO Staff konnte nicht geloescht werden.";
    state.staff.deleting = false;
    render();
  }
}

function readLeadModalLocationsFromForm() {
  const inputs = Array.from(document.querySelectorAll("[data-lead-location-address]"));
  if (!inputs.length) {
    return normalizeLeadLocations(state.leadModal.locations, state.leadModal.lead?.address || "", state.leadModal.coords || null);
  }
  const current = normalizeLeadLocations(state.leadModal.locations, state.leadModal.lead?.address || "", state.leadModal.coords || null);
  const rows = inputs.map((input, index) => {
    const saved = current[index] || createLeadLocation();
    const address = String(input.value || "").trim();
    const parsedCoords = parseCoordsFromAddressInput(address, getLeadPlusCodeReference(address));
    const keepSavedCoords = hasLeadLocationCoords(saved);
    const extracted = extractPlusCodeFromText(address);
    const shouldPreferSaved = !!(extracted?.code && isLikelyShortPlusCode(extracted.code) && String(extracted.remainder || "").trim() && keepSavedCoords);
    return createLeadLocation({
      address,
      lat: shouldPreferSaved ? saved.lat : (parsedCoords ? parsedCoords.lat : (keepSavedCoords ? saved.lat : null)),
      lng: shouldPreferSaved ? saved.lng : (parsedCoords ? parsedCoords.lng : (keepSavedCoords ? saved.lng : null))
    });
  });
  return normalizeLeadLocations(rows, state.leadModal.lead?.address || "", state.leadModal.coords || null);
}

function syncLeadModalDraftFromForm() {
  if (!state.leadModal.open && !isLeadInlineCreateView()) return;
  const lead = { ...(state.leadModal.lead || {}) };
  const readText = (id) => {
    const node = document.getElementById(id);
    return node ? String(node.value || "").trim() : "";
  };
  const readValue = (id) => {
    const node = document.getElementById(id);
    return node ? String(node.value || "") : "";
  };

  lead.businessName = readText("leadBusinessName") || lead.businessName || "";
  lead.customerType = resolveCustomerType(readValue("leadCustomerType") || lead.customerType || "cafe");
  lead.contactFirstName = readText("leadCustomerFirstName") || lead.contactFirstName || "";
  lead.contactLastName = readText("leadCustomerLastName") || lead.contactLastName || "";
  lead.contactName = buildLeadContactName(
    lead.contactFirstName,
    lead.contactLastName,
    readText("leadContactName") || lead.contactName || ""
  );
  lead.phone = readText("leadPhone") || lead.phone || "";
  lead.instagram = readText("leadInstagram") || lead.instagram || "";
  lead.facebook = readText("leadFacebook") || lead.facebook || "";
  lead.tiktok = readText("leadTiktok") || lead.tiktok || "";
  lead.googleMaps = readText("leadGoogleMaps") || lead.googleMaps || "";
  lead.email = readText("leadEmail") || lead.email || "";
  lead.password = readValue("leadPassword");
  lead.country = normalizeLeadCountry(readValue("leadCountry") || lead.country || "");
  lead.currencyCode = resolveLeadCurrencyCode(lead.country);
  lead.currency = lead.currencyCode;
  lead.city = readText("leadCity") || lead.city || "";
  lead.zipCode = readText("leadZipCode") || lead.zipCode || "";
  lead.address = readText("leadAddress") || lead.address || "";
  lead.logoUrl = readText("leadLogoUrl") || lead.logoUrl || "";
  lead.bestSpotLogoUrl = readText("leadBestSpotLogoUrl") || lead.bestSpotLogoUrl || "";
  lead.spotLogoUrl = lead.bestSpotLogoUrl || lead.spotLogoUrl || "";
  const specialToggle = document.getElementById("leadSpecialEnabled");
  if (specialToggle && "checked" in specialToggle) {
    lead.specialEnabled = !!specialToggle.checked;
  } else if (typeof lead.specialEnabled !== "boolean") {
    lead.specialEnabled = false;
  }
  lead.note = readText("leadNote") || lead.note || "";
  lead.billingCycle = readValue("leadBillingCycle") === "yearly" ? "yearly" : (lead.billingCycle || "monthly");
  lead.status = normalizeLeadStatusKey(readValue("leadStatus") || lead.status || "registered") || "registered";

  const locations = readLeadModalLocationsFromForm();
  state.leadModal.locations = locations;
  if (!readText("leadAddress")) lead.address = locations[0]?.address || lead.address || "";
  state.leadModal.lead = lead;
  const primary = getPrimaryLeadLocation(locations);
  state.leadModal.coords = hasLeadLocationCoords(primary) ? { lat: primary.lat, lng: primary.lng } : null;
  syncLeadDerivedFields();
}

function addLeadModalLocationRow() {
  syncLeadModalDraftFromForm();
  const next = normalizeLeadLocations(state.leadModal.locations, state.leadModal.lead?.address || "", state.leadModal.coords || null);
  next.push(createLeadLocation());
  state.leadModal.locations = next;
  renderLeadEditorUi();
}

function removeLeadModalLocationRow(index) {
  syncLeadModalDraftFromForm();
  const idx = Number(index);
  if (!Number.isInteger(idx) || idx < 0) return;
  const next = normalizeLeadLocations(state.leadModal.locations, state.leadModal.lead?.address || "", state.leadModal.coords || null);
  if (next.length <= 1) return;
  next.splice(idx, 1);
  state.leadModal.locations = next.length ? next : [createLeadLocation()];
  state.leadModal.lead = { ...(state.leadModal.lead || {}), address: state.leadModal.locations[0]?.address || "" };
  const primary = getPrimaryLeadLocation(state.leadModal.locations);
  state.leadModal.coords = hasLeadLocationCoords(primary) ? { lat: primary.lat, lng: primary.lng } : null;
  renderLeadEditorUi();
}

async function saveLeadFromModal() {
  return saveLeadFromModalCore({
    state,
    documentObj: typeof document !== "undefined" ? document : null,
    isLeadInlineCreateView,
    getLeadSettingsConfig,
    syncLeadModalDraftFromForm,
    resolveCustomerType,
    buildLeadContactName,
    buildLeadAccountEmail,
    normalizeLeadCountry,
    resolveCurrencyCodeFromLeadCountry,
    normalizeLeadStatusKey,
    refineLeadLocationAddressIndex,
    readLeadModalLocationsFromForm,
    getPrimaryLeadLocation,
    hasLeadLocationCoords,
    renderLeadEditorUi,
    doc,
    collection,
    db,
    uploadCompressedImage,
    serverTimestamp,
    setDoc,
    ensureRestaurantPublicMeta,
    buildLeadLandingPageUrl,
    buildLeadLandingSlug,
    resolveLeadLandingSlugUnique,
    createAuthUser,
    buildLeadCrmContribution,
    buildCustomerCrmContribution,
    resolveRestaurantStatusFromLead,
    resolveStoredCeoCreatorMeta,
    getLeadMonthlyPrice,
    accumulateCeoCrmDelta,
    applyCeoCrmCountDeltas,
    normalizeLeadDoc,
    leadBelongsToScope,
    syncVisibleLeadPageFromItems,
    mergeRestaurants,
    rebuildBusinessLocations,
    refreshCustomersFromRestaurants,
    resetLeadDraft,
    closeLeadModal,
    render,
    alertFn: typeof alert === "function" ? alert : null
  });
}

async function resolveRestaurantLinkedToLead(lead = {}) {
  const directId = String(lead?.restaurantId || "").trim();
  if (directId) {
    const cached = (state.restaurants || []).find((row) => String(row?.id || "") === directId) || null;
    if (cached?.id) return { id: directId, ...cached };
    try {
      const snap = await getDoc(doc(db, "restaurants", directId));
      if (snap.exists()) return { id: snap.id, ...(snap.data() || {}) };
    } catch {}
  }

  const leadId = String(lead?.id || "").trim();
  if (leadId) {
    const cachedByLead = (state.restaurants || []).find((row) => String(row?.leadId || "") === leadId) || null;
    if (cachedByLead?.id) return { id: String(cachedByLead.id || ""), ...cachedByLead };
    try {
      const snap = await getDocs(query(collection(db, "restaurants"), where("leadId", "==", leadId), limit(1)));
      if (!snap.empty) {
        const docSnap = snap.docs[0];
        return { id: docSnap.id, ...(docSnap.data() || {}) };
      }
    } catch {}
  }

  const uidCandidates = uniqueStringList([
    lead?.socialUid,
    lead?.ownerUid,
    lead?.uid
  ].map((value) => String(value || "").trim()).filter(Boolean));
  for (const uid of uidCandidates) {
    const match = await findRestaurantByUid(uid);
    if (match?.id) return match;
  }

  const emailCandidates = uniqueStringList([
    lead?.socialEmail,
    lead?.email,
    lead?.ownerEmail
  ].map((value) => normalizeEmailValue(value)).filter(Boolean));
  for (const email of emailCandidates) {
    const match = await findRestaurantByEmail(email);
    if (match?.id) return match;
  }

  return null;
}

function collectLeadIdentityPayload(lead = {}, restaurant = null) {
  const linkedRestaurantId = String(restaurant?.id || lead?.restaurantId || "").trim();
  const uidList = uniqueStringList([
    lead?.socialUid,
    lead?.ownerUid,
    restaurant?.ownerUid,
    restaurant?.socialUid,
    restaurant?.uid,
    restaurant?.userUid
  ].map((value) => String(value || "").trim()).filter(Boolean));
  const emailList = uniqueStringList([
    lead?.socialEmail,
    lead?.email,
    lead?.ownerEmail,
    restaurant?.ownerEmail,
    restaurant?.socialEmail,
    restaurant?.email,
    restaurant?.contactEmail
  ].map((value) => normalizeEmailValue(value)).filter(Boolean));
  return {
    restaurantId: linkedRestaurantId,
    uids: uidList,
    emails: emailList
  };
}

async function findUserIdsByEmailList(emails = []) {
  const list = uniqueStringList((emails || []).map((value) => normalizeEmailValue(value)).filter(Boolean));
  if (!list.length) return [];
  const found = new Set();
  const usersRef = collection(db, "users");
  await Promise.all(list.map(async (email) => {
    try {
      const snap = await getDocs(query(usersRef, where("email", "==", email), limit(10)));
      snap.forEach((docSnap) => found.add(docSnap.id));
    } catch {}
  }));
  return Array.from(found);
}

async function deactivateLinkedBusinessUsers({ restaurantId = "", explicitUids = [], emails = [] } = {}) {
  const rid = String(restaurantId || "").trim();
  const explicitUidList = uniqueStringList((explicitUids || []).map((value) => String(value || "").trim()).filter(Boolean));
  const explicitUidSet = new Set(explicitUidList);
  const emailList = uniqueStringList((emails || []).map((value) => normalizeEmailValue(value)).filter(Boolean));
  const uidSet = new Set(explicitUidList);

  if (rid) {
    try {
      const snap = await getDocs(query(collection(db, "users"), where("restaurantId", "==", rid), limit(20)));
      snap.forEach((docSnap) => uidSet.add(docSnap.id));
    } catch {}
  }

  const idsByEmail = await findUserIdsByEmailList(emailList);
  idsByEmail.forEach((uid) => uidSet.add(uid));

  const currentUid = String(state.user?.uid || "").trim();
  const tasks = [];
  uidSet.forEach((uid) => {
    const safeUid = String(uid || "").trim();
    if (!safeUid || safeUid === currentUid) return;
    tasks.push((async () => {
      try {
        const snap = await getDoc(doc(db, "users", safeUid));
        if (!snap.exists()) return;
        const data = snap.data() || {};
        const roleKey = String(data.role || "").toLowerCase();
        const roles = normalizeRoleList(data.roles || data.role || "");
        if (roles.includes("ceo") || roles.includes("staff") || roleKey === "ceo" || roleKey === "staff") return;

        const linkedRestaurantId = String(data.restaurantId || "").trim();
        const linkedEmail = normalizeEmailValue(data.email || "");
        const matchesRestaurant = !!(rid && linkedRestaurantId === rid);
        const matchesEmail = !!(linkedEmail && emailList.includes(linkedEmail));
        const isBusiness = roleKey === "business" || roles.includes("owner") || roles.includes("business");
        const isExplicit = explicitUidSet.has(safeUid);
        if (!(isExplicit || matchesRestaurant || (isBusiness && matchesEmail))) return;

        await setDoc(doc(db, "users", safeUid), {
          restaurantId: "",
          role: "user",
          roles: ["user"],
          businessStatus: "deleted",
          businessDeleted: true,
          deletedRestaurantId: rid || linkedRestaurantId || "",
          updatedAt: serverTimestamp()
        }, { merge: true });
      } catch {}
    })());
  });

  if (tasks.length) {
    await Promise.all(tasks);
  }
}

async function purgeRestaurantSocialPresence(restaurantId) {
  const rid = String(restaurantId || "").trim();
  if (!rid) return;

  const postIds = new Set();
  try {
    const postsSnap = await getDocs(query(collection(db, "restaurants", rid, "socialPosts"), limit(300)));
    const deletes = [];
    postsSnap.forEach((docSnap) => {
      postIds.add(docSnap.id);
      deletes.push(deleteDoc(docSnap.ref).catch(() => {}));
    });
    if (deletes.length) await Promise.all(deletes);
  } catch {}

  try {
    const storiesSnap = await getDocs(query(collection(db, "restaurants", rid, "stories"), limit(300)));
    const storyDeletes = [];
    storiesSnap.forEach((docSnap) => {
      storyDeletes.push(deleteDoc(docSnap.ref).catch(() => {}));
    });
    if (storyDeletes.length) await Promise.all(storyDeletes);
  } catch {}

  const feedDeletes = [];
  postIds.forEach((postId) => {
    feedDeletes.push(deleteDoc(doc(db, "socialFeed", postId)).catch(() => {}));
  });

  await Promise.all([
    (async () => {
      try {
        const snap = await getDocs(query(collection(db, "socialFeed"), where("rid", "==", rid), limit(300)));
        snap.forEach((docSnap) => {
          feedDeletes.push(deleteDoc(docSnap.ref).catch(() => {}));
        });
      } catch {}
    })(),
    (async () => {
      try {
        const snap = await getDocs(query(collection(db, "socialFeed"), where("restaurantId", "==", rid), limit(300)));
        snap.forEach((docSnap) => {
          feedDeletes.push(deleteDoc(docSnap.ref).catch(() => {}));
        });
      } catch {}
    })()
  ]);

  if (feedDeletes.length) {
    await Promise.all(feedDeletes);
  }

  writeCache(businessPostsKey(rid), []);
  menuCache.delete(menuCacheKey(rid, "collection"));
  menuCache.delete(menuCacheKey(rid, "public"));
  menuCache.delete(menuCacheKey(rid, "migration"));
  focusCache.delete(focusCacheKey(rid));
}

function applyDeletedRestaurantStateLocally(restaurantId) {
  const rid = String(restaurantId || "").trim();
  if (!rid) return;

  state.restaurants = (state.restaurants || []).map((row) => {
    if (String(row?.id || "") !== rid) return row;
    return {
      ...row,
      leadId: "",
      status: "deleted",
      hiddenFromDiscover: true,
      deleted: true,
      isDeleted: true,
      ownerUid: "",
      ownerEmail: "",
      ownerName: ""
    };
  });

  state.feedPosts = (state.feedPosts || []).filter((post) => String(post?.restaurantId || post?.ownerId || "") !== rid);
  state.stories = (state.stories || []).filter((story) => String(story?.restaurantId || "") !== rid);
  state.businessPosts = (state.businessPosts || []).filter((post) => String(post?.restaurantId || post?.ownerId || "") !== rid);

  const cachedFeed = readCache(CACHE_KEYS.feed);
  saveFeedPosts(state.feedPosts, { lastDeltaCheck: cachedFeed?.meta?.lastDeltaCheck || 0 });
  writeCache(CACHE_KEYS.stories, state.stories);
  setFeedStoriesSignature(buildStoriesSignature(state.stories));
  writeCache(businessPostsKey(rid), []);

  if (state.selectedBusiness && String(state.selectedBusiness.id || "") === rid) {
    state.selectedBusiness = null;
  }

  rebuildBusinessLocations();
  refreshCustomersFromRestaurants();
}

async function deleteLeadFromModal() {
  return deleteLeadFromModalCore({
    state,
    isCeoUser,
    confirmFn: typeof confirm === "function" ? confirm : null,
    renderLeadEditorUi,
    resolveRestaurantLinkedToLead,
    mergeRestaurants,
    collectLeadIdentityPayload,
    buildLeadCrmContribution,
    buildCustomerCrmContribution,
    deleteDoc,
    doc,
    db,
    setDoc,
    serverTimestamp,
    purgeRestaurantSocialPresence,
    deactivateLinkedBusinessUsers,
    applyDeletedRestaurantStateLocally,
    accumulateCeoCrmDelta,
    applyCeoCrmCountDeltas,
    createLeadScopeMap,
    CRM_PAGE_SIZE,
    writeLeadScopeCache,
    normalizeLeadScopeKey,
    resetLeadDraft,
    render
  });
}

async function saveCustomerFromModal() {
  return saveCustomerFromModalCore({
    state,
    documentObj: typeof document !== "undefined" ? document : null,
    resolveCustomerType,
    renderOverlays,
    buildCustomerCrmContribution,
    uploadCompressedImage,
    normalizeLeadStatusKey,
    resolveRestaurantStatusFromLead,
    serverTimestamp,
    setDoc,
    doc,
    collection,
    db,
    ensureRestaurantPublicMeta,
    accumulateCeoCrmDelta,
    resolveStoredCeoCreatorMeta,
    buildLeadCrmContribution,
    normalizeLeadDoc,
    leadBelongsToScope,
    syncVisibleLeadPageFromItems,
    applyCeoCrmCountDeltas,
    mergeRestaurants,
    rebuildBusinessLocations,
    refreshCustomersFromRestaurants,
    closeCustomerModal,
    render
  });
}

async function convertLeadToCustomer(leadId) {
  return convertLeadToCustomerCore({
    leadId,
    state,
    confirmFn: confirm,
    buildLeadCrmContribution,
    resolveCustomerType,
    resolveStoredCeoCreatorMeta,
    normalizeLeadLocations,
    getPrimaryLeadLocation,
    hasLeadLocationCoords,
    serverTimestamp,
    doc,
    collection,
    db,
    setDoc,
    ensureRestaurantPublicMeta,
    buildLeadLandingPageUrl,
    buildLeadLandingSlug,
    resolveLeadLandingSlugUnique,
    accumulateCeoCrmDelta,
    buildCustomerCrmContribution,
    applyCeoCrmCountDeltas,
    syncVisibleLeadPageFromItems,
    mergeRestaurants,
    rebuildBusinessLocations,
    refreshCustomersFromRestaurants,
    render,
    alertFn: alert
  });
}
  function getVerifiedMapLocation() {
    return verifiedMapLocation;
  }

  function setVerifiedMapLocation(coords = null) {
    const normalized = normalizeCoordPair(
      coords?.lat ?? coords?.latitude,
      coords?.lng ?? coords?.lon ?? coords?.longitude
    );
    if (!normalized) {
      verifiedMapLocation = null;
      return verifiedMapLocation;
    }
    const label = String(coords?.label || "").trim();
    const city = String(coords?.city || label).trim();
    const source = String(coords?.source || "").trim().toLowerCase();
    const savedAt = Number(coords?.savedAt || Date.now()) || Date.now();
    verifiedMapLocation = {
      lat: normalized.lat,
      lng: normalized.lng,
      label,
      city,
      source,
      savedAt
    };
    return verifiedMapLocation;
  }

  function clearVerifiedMapLocation() {
    verifiedMapLocation = null;
    try {
      window?.localStorage?.removeItem?.(FEED_VIEWER_LOCATION_STORAGE_KEY);
    } catch {}
  }

  return {
    queueCrmLazyRenderersPrefetch,
    renderLeadsView,
    isLeadInlineCreateView,
    renderLeadEditorUi,
    refineLeadLocationAddressIndex,
    renderLeadSettingsView,
    renderLeadCreationView,
    resetLeadDraft,
    createLeadDraftState,
    openLeadCreator,
    openLeadSettingsView,
    closeLeadSubview,
    saveLeadSettings,
    getLeadPlusCodeReference,
    hydrateLeadGeoFieldsFromCoords,
    syncLeadDerivedFields,
    renderCustomersView,
    renderStaffEditorView,
    renderStaffView,
    ensureLocationPickerModal,
    bindLocationPickerEvents,
    openLocationPicker,
    closeLocationPicker,
    confirmLocation,
    getSecondaryAuth,
    createAuthUser,
    ensureRestaurantPublicMeta,
    normalizeLeadDoc,
    normalizeLeadFromRestaurant,
    leadStatusTone,
    resolveRestaurantStatusFromLead,
    leadBelongsToScope,
    customerBelongsToScope,
    refreshCustomersFromRestaurants,
    syncVisibleLeadPageFromItems,
    loadLeads,
    loadCustomers,
    isHiddenLegacyCeoEmail,
    applyKnownLeadOwnershipOverride,
    getStaffFormEmail,
    syncStaffDerivedEmailField,
    openStaffEditor,
    closeStaffEditor,
    syncStaffFormFromDom,
    loadCeoStaff,
    saveCeoStaffFromView,
    deleteCeoStaffFromView,
    syncLeadModalDraftFromForm,
    addLeadModalLocationRow,
    removeLeadModalLocationRow,
    saveLeadFromModal,
    deleteLeadFromModal,
    saveCustomerFromModal,
    convertLeadToCustomer,
    getVerifiedMapLocation,
    setVerifiedMapLocation,
    clearVerifiedMapLocation
  };
}
