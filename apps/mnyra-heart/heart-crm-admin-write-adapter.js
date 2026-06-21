import {
  app,
  auth,
  db
} from "/shared/firebase-config.js";
import {
  collection,
  deleteDoc,
  doc,
  documentId,
  getDoc,
  getDocs,
  increment,
  limit,
  query,
  serverTimestamp,
  setDoc,
  where
} from "/shared/vendor/firebase/11.0.0/firebase-firestore.js";
import {
  getApps,
  initializeApp
} from "/shared/vendor/firebase/11.0.0/firebase-app.js";
import {
  createUserWithEmailAndPassword,
  getAuth,
  signInWithEmailAndPassword,
  signOut
} from "/shared/vendor/firebase/11.0.0/firebase-auth.js";
import {
  ALBERT_CEO_ALIASES,
  ALBERT_CEO_EMAILS,
  ALBERT_CEO_UID,
  normalizeEmailValue,
  normalizeHandleValue,
  normalizeRoleList
} from "/shared/ceo-access.js";
import {
  BUNNY_EDGE_BASE,
  MEDIA_TICKET_ENDPOINT
} from "/shared/bunny-edge.js";
import {
  renderHeartIcon
} from "./heart-icons.js";
import {
  escapeHtml
} from "./heart-ui-utils.js";
import {
  ALBERT_OWNED_LEAD_BUSINESSES,
  ALBERT_OWNED_LEAD_EMAILS,
  CEO_COUNTRIES,
  CRM_PAGE_SIZE,
  HIDDEN_LEGACY_CEO_EMAILS,
  LEAD_COUNTRY_CENTERS,
  LEAD_SETTINGS_DEFAULT_COUNTRY,
  LEAD_STATUS_LABELS,
  LEAD_STATUS_ORDER,
  LEAD_TYPE_LABELS,
  LEAD_TYPE_ORDER,
  MILAN_OWNED_LEAD_BUSINESSES,
  MILAN_OWNED_LEAD_EMAILS,
  PRISHTINA_COORDS
} from "../menyra-social/core/app-shell/social-app-domain-config.js";
import {
  CACHE_KEYS,
  CACHE_TTL_MS,
  businessPostsKey,
  customerPageCacheKey,
  leadPageCacheKey
} from "../menyra-social/core/app-shell/social-app-cache-config.js";
import {
  enqueueMicrotaskCore
} from "../menyra-social/core/common/task-schedule-utils.js";
import {
  normalizeSearchKeyCore as normalizeSearchKey
} from "../menyra-social/core/common/text-normalize-utils.js";
import {
  resolveCurrencyCodeFromLeadCountryCore as resolveCurrencyCodeFromLeadCountry
} from "../menyra-social/core/common/currency-utils.js";
import {
  toDateSafe
} from "../menyra-social/_shared/social-core.js";
import {
  createCrmCeoScopeSupportRuntime
} from "../menyra-social/core/crm/crm-ceo-scope-support-runtime.js";
import {
  createCrmDomainRuntimeCluster
} from "../menyra-social/core/crm/crm-domain-runtime-cluster.js";
import {
  createCrmLeadGeoSupportRuntime
} from "../menyra-social/core/crm/crm-lead-geo-support-runtime.js";
import {
  createDiscoveryRuntimeController
} from "../menyra-social/core/discovery/discovery-runtime-controller.js";
import {
  createCustomerScopeMapCore,
  createLeadScopeMapCore,
  normalizeCustomerScopeKeyCore,
  normalizeLeadScopeKeyCore
} from "../menyra-social/core/crm/crm-scope-state-utils.js";
import {
  saveCustomerFromModalCore
} from "../menyra-social/core/crm/customer-save-utils.js";
import {
  saveCeoStaffFromViewCore
} from "../menyra-social/core/crm/staff-save-utils.js";
import {
  convertLeadToCustomerCore
} from "../menyra-social/core/leads/lead-convert-utils.js";
import {
  deleteLeadFromModalCore
} from "../menyra-social/core/leads/lead-delete-utils.js";
import {
  saveLeadFromModalCore
} from "../menyra-social/core/leads/lead-save-utils.js";
import {
  normalizeLeadTypeKeyCore
} from "../menyra-social/core/leads/lead-type-utils.js";
import {
  createMediaUploadRuntimeCluster
} from "../menyra-social/core/media/media-upload-runtime-cluster.js";
import {
  normalizeHandleCore
} from "../menyra-social/core/profile/handle-utils.js";
import {
  normalizeRestaurantTypeCore
} from "../menyra-social/core/profile/restaurant-type-utils.js";
import {
  compressImage
} from "../menyra-social/_shared/image-compressor.js";

export const HEART_CRM_ADMIN_WRITE_ADAPTER_VERSION = "heart-crm-admin-write-adapter.v1";

const PLACEHOLDER_IMAGE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23f0f0f0'/%3E%3C/svg%3E";
const CRM_LAZY_RENDERERS_MODULE_URL = "";
const BUILD_INFO_ENDPOINT_URL = "/api/build-info";
const LEAFLET_JS_URL = "https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.js";
const LEAFLET_CSS_URL = "https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.css";
const LEAFLET_JS_FALLBACK_URL = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
const LEAFLET_CSS_FALLBACK_URL = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
const LEAFLET_LOAD_TIMEOUT_MS = 7000;

function asText(value = "") {
  return String(value || "").trim();
}

function hasObject(value) {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

function normalizeHandle(value = "") {
  return normalizeHandleCore(value) || normalizeHandleValue(value);
}

function normalizeRestaurantType(value = "") {
  return normalizeRestaurantTypeCore(value, {
    normalizeLeadTypeKeyFn: normalizeLeadTypeKeyCore
  });
}

function mergeRestaurants(current = [], incoming = []) {
  const map = new Map();
  (Array.isArray(current) ? current : []).forEach((item) => {
    const id = asText(item?.id || item?.restaurantId);
    if (id) map.set(id, { ...item, id });
  });
  (Array.isArray(incoming) ? incoming : []).forEach((item) => {
    const id = asText(item?.id || item?.restaurantId);
    if (!id) return;
    map.set(id, { ...(map.get(id) || {}), ...item, id });
  });
  return Array.from(map.values());
}

function resolveCoords(entity = {}) {
  const lat = Number(entity?.lat ?? entity?.gpsLat ?? entity?.coords?.lat ?? entity?.coords?.latitude);
  const lng = Number(entity?.lng ?? entity?.gpsLng ?? entity?.coords?.lng ?? entity?.coords?.lon ?? entity?.coords?.longitude);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  return { lat, lng };
}

function findCrmItem(heartState = {}, domainKey = "", itemId = "") {
  const id = asText(itemId);
  if (!id) return null;
  const items = heartState.crmAdmin?.sections?.[domainKey]?.items || [];
  const keySets = {
    leads: ["id", "leadId"],
    customers: ["id", "restaurantId", "customerId"],
    staff: ["uid", "userId", "id"]
  };
  const keys = keySets[domainKey] || ["id"];
  return (Array.isArray(items) ? items : []).find((item) => (
    keys.some((key) => asText(item?.[key]) === id)
  )) || null;
}

function createEmptyScopeMap(factory) {
  return {
    own: factory(),
    staff: factory(),
    archived: factory()
  };
}

function buildStaffEmail(firstName = "", lastName = "", fallback = "") {
  const toLocal = (value) => asText(value)
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/_/g, "")
    .replace(/[^a-z0-9]/g, "");
  const local = toLocal(`${firstName || ""}${lastName || ""}`) || toLocal(fallback);
  return local ? `${local}@mnyra.com` : "";
}

function createPreviewUrl(file) {
  if (!file) return "";
  if (typeof URL === "undefined" || typeof URL.createObjectURL !== "function") return "";
  try {
    return URL.createObjectURL(file);
  } catch {
    return "";
  }
}

function formatCoordLabel(item = {}) {
  const coords = resolveCoords(item);
  return coords ? `${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}` : "";
}

let leafletLoadPromise = null;
let socialLeafletLoaderController = null;

function ensureLeafletCss(cssUrl = LEAFLET_CSS_URL) {
  if (typeof document === "undefined") return;
  const absoluteHref = (() => {
    try {
      return new URL(cssUrl, document.baseURI).href;
    } catch {
      return cssUrl;
    }
  })();
  const existing = Array.from(document.querySelectorAll('link[rel="stylesheet"]'))
    .some((link) => link.dataset.heartLeafletCss === "1" || link.dataset.leafletCss === "1" || link.href === absoluteHref);
  if (existing) return;
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = cssUrl;
  link.dataset.heartLeafletCss = "1";
  document.head.appendChild(link);
}

function getExistingLeafletScript(jsUrl = "") {
  if (typeof document === "undefined") return null;
  const absoluteSrc = (() => {
    try {
      return new URL(jsUrl, document.baseURI).href;
    } catch {
      return jsUrl;
    }
  })();
  return Array.from(document.querySelectorAll("script"))
    .find((script) => script.src === absoluteSrc)
    || null;
}

function loadLeafletScript(jsUrl, cssUrl, timeoutMs = LEAFLET_LOAD_TIMEOUT_MS) {
  ensureLeafletCss(cssUrl);
  return new Promise((resolve) => {
    if (typeof window === "undefined" || typeof document === "undefined") {
      resolve(false);
      return;
    }
    if (window.L) {
      resolve(true);
      return;
    }
    let settled = false;
    const finish = (ok) => {
      if (settled) return;
      settled = true;
      if (timer) window.clearTimeout(timer);
      resolve(ok === true || !!window.L);
    };
    const timer = window.setTimeout(() => finish(false), Math.max(1000, Number(timeoutMs) || LEAFLET_LOAD_TIMEOUT_MS));
    const existing = getExistingLeafletScript(jsUrl);
    const script = existing || document.createElement("script");
    script.addEventListener("load", () => finish(true), { once: true });
    script.addEventListener("error", () => finish(false), { once: true });
    if (!existing) {
      script.src = jsUrl;
      script.async = true;
      script.dataset.heartLeafletJs = "1";
      document.head.appendChild(script);
    }
  });
}

async function ensureLeafletLoaded() {
  if (typeof window !== "undefined" && window.L) return true;
  if (typeof window !== "undefined" && typeof document !== "undefined") {
    if (!socialLeafletLoaderController) {
      socialLeafletLoaderController = createDiscoveryRuntimeController({
        documentObj: document,
        windowObj: window,
        state: { activeTab: "heart", businessLocations: [], search: {}, userProfile: {} },
        brandUi: { upper: "MNYRA" },
        LEAFLET_JS_URL,
        LEAFLET_CSS_URL,
        LEAFLET_JS_FALLBACK_URL,
        LEAFLET_CSS_FALLBACK_URL,
        placeholderImage: PLACEHOLDER_IMAGE,
        getLastRenderModeFn: () => "heart"
      });
    }
    const socialEnsureLeafletLoaded = socialLeafletLoaderController?.ensureLeafletLoaded;
    if (typeof socialEnsureLeafletLoaded === "function") {
      const loaded = await socialEnsureLeafletLoaded();
      if (loaded || window.L) return true;
    }
  }
  if (leafletLoadPromise) return leafletLoadPromise;
  leafletLoadPromise = (async () => {
    const primary = await loadLeafletScript(LEAFLET_JS_URL, LEAFLET_CSS_URL);
    if (primary) return true;
    return loadLeafletScript(LEAFLET_JS_FALLBACK_URL, LEAFLET_CSS_FALLBACK_URL);
  })().finally(() => {
    leafletLoadPromise = null;
  });
  return leafletLoadPromise;
}

function revealLocationPickerModalIfReady() {
  if (typeof window === "undefined" || typeof document === "undefined" || !window.L) return;
  const modal = document.getElementById("locationPickerModal");
  const overlay = document.getElementById("pickerOverlay");
  const panel = document.getElementById("pickerPanel");
  const map = document.getElementById("pickerMap");
  if (!modal || !map) return;
  modal.classList.remove("hidden");
  overlay?.classList.remove("opacity-0");
  panel?.classList.remove("translate-y-full");
  const schedule = window.requestAnimationFrame?.bind(window) || ((callback) => setTimeout(callback, 0));
  schedule(() => {
    window.dispatchEvent(new Event("resize"));
  });
}

function isLocationPickerModalOpen() {
  if (typeof document === "undefined") return false;
  const modal = document.getElementById("locationPickerModal");
  return !!modal && !modal.classList.contains("hidden");
}

function assertLocationPickerOpened() {
  if (isLocationPickerModalOpen()) return;
  const leafletReady = typeof window !== "undefined" && !!window.L;
  throw new Error(leafletReady
    ? "Social Standort-Picker wurde nicht sichtbar."
    : "Kartenbibliothek konnte nicht geladen werden.");
}

export function createHeartCrmAdminWriteAdapter({
  getState,
  onDraftChange
} = {}) {
  const memoryCache = new Map();
  const menuCache = new Map();
  const focusCache = new Map();
  const dataLoaded = { leads: false, customers: false, staff: false };
  const runtimeState = {};
  const draftFiles = {
    leadLogoFile: null,
    leadBestSpotLogoFile: null,
    leadTitleImageFile: null,
    customerLogoFile: null,
    staffAvatarFile: null
  };
  let activeModalKey = "";
  let runtimeController = null;
  let mediaUploadRuntime = null;

  function readCache(key = "", ttlMs = 0) {
    const safeKey = asText(key);
    if (!safeKey || !memoryCache.has(safeKey)) return null;
    const entry = memoryCache.get(safeKey);
    const age = Date.now() - Number(entry?.at || 0);
    const fresh = !ttlMs || age <= ttlMs;
    return {
      fresh,
      data: entry?.data,
      meta: entry?.meta || {}
    };
  }

  function writeCache(key = "", data = null, meta = {}) {
    const safeKey = asText(key);
    if (!safeKey) return;
    memoryCache.set(safeKey, {
      data,
      meta,
      at: Date.now()
    });
  }

  function saveUserProfileToStorage() {
    const profile = runtimeState.userProfile || {};
    const uid = asText(profile.uid || runtimeState.user?.uid);
    if (!uid) return;
    writeCache(`menyra_social_profile_v3::${uid}`, profile);
  }

  function getHeartState() {
    return typeof getState === "function" ? (getState() || {}) : {};
  }

  function getModalKey(heartState = getHeartState()) {
    const modal = heartState.shell?.modal || {};
    return [
      asText(modal.kind),
      asText(modal.crmDomain),
      asText(modal.itemId),
      asText(modal.mode)
    ].join(":");
  }

  function resetFilesForNewModal(heartState = getHeartState()) {
    const nextKey = getModalKey(heartState);
    if (nextKey === activeModalKey) return;
    activeModalKey = nextKey;
    draftFiles.leadLogoFile = null;
    draftFiles.leadBestSpotLogoFile = null;
    draftFiles.leadTitleImageFile = null;
    draftFiles.customerLogoFile = null;
    draftFiles.staffAvatarFile = null;
  }

  function getModalDomain(heartState = getHeartState()) {
    return asText(heartState.shell?.modal?.crmDomain);
  }

  function buildBusinessLocations(restaurants = []) {
    return (Array.isArray(restaurants) ? restaurants : [])
      .map((item) => {
        const coords = resolveCoords(item)
          || resolveCoords(Array.isArray(item?.locations) ? item.locations.find((row) => resolveCoords(row)) : {});
        if (!coords) return null;
        return {
          ...item,
          id: asText(item.id || item.restaurantId),
          lat: coords.lat,
          lng: coords.lng
        };
      })
      .filter(Boolean);
  }

  function createLeadsState(section = {}, items = [], domainKey = "", mode = "") {
    const scope = normalizeLeadScopeKeyCore(section.scope || "own");
    const pages = createEmptyScopeMap(() => []);
    const loaded = createEmptyScopeMap(() => false);
    const hasMore = createEmptyScopeMap(() => false);
    const knownCount = createEmptyScopeMap(() => 0);
    const countExact = createEmptyScopeMap(() => true);
    const pageSize = createEmptyScopeMap(() => CRM_PAGE_SIZE);
    pages[scope] = items.slice();
    loaded[scope] = section.status === "ready";
    hasMore[scope] = section.hasMore === true;
    knownCount[scope] = Number.isFinite(Number(section.knownCount)) ? Math.max(0, Number(section.knownCount)) : items.length;
    countExact[scope] = section.countExact !== false;
    return {
      items: items.slice(),
      pages,
      loaded,
      hasMore,
      knownCount,
      countExact,
      pageSize,
      scope,
      view: domainKey === "leads" && mode === "settings"
        ? "settings"
        : (domainKey === "leads" && mode === "create" ? "create" : "list"),
      loading: false,
      loadingMore: false,
      error: "",
      settingsSaving: false,
      settingsStatus: "",
      convertingIds: new Set()
    };
  }

  function createCustomersState(section = {}, items = []) {
    const scope = normalizeCustomerScopeKeyCore(section.scope || "own");
    const pages = { own: [], staff: [] };
    const loaded = { own: false, staff: false };
    const hasMore = { own: false, staff: false };
    const knownCount = { own: 0, staff: 0 };
    const countExact = { own: true, staff: true };
    const pageSize = { own: CRM_PAGE_SIZE, staff: CRM_PAGE_SIZE };
    pages[scope] = items.slice();
    loaded[scope] = section.status === "ready";
    hasMore[scope] = section.hasMore === true;
    knownCount[scope] = Number.isFinite(Number(section.knownCount)) ? Math.max(0, Number(section.knownCount)) : items.length;
    countExact[scope] = section.countExact !== false;
    return {
      items: items.slice(),
      pages,
      loaded,
      hasMore,
      knownCount,
      countExact,
      pageSize,
      scope,
      loading: false,
      loadingMore: false,
      error: ""
    };
  }

  function createStaffForm(entry = {}, profile = {}) {
    const name = asText(entry.name || entry.displayName || entry.email);
    const fallbackParts = name.split(/\s+/).filter(Boolean);
    const firstName = asText(entry.firstName || fallbackParts[0]);
    const lastName = asText(entry.lastName || fallbackParts.slice(1).join(" "));
    const coords = resolveCoords(entry);
    const avatarUrl = asText(entry.avatarPreview || entry.avatarUrl || entry.avatar || entry.photoURL);
    return {
      firstName,
      lastName,
      email: normalizeEmailValue(entry.email || buildStaffEmail(firstName, lastName, name)),
      password: asText(entry.password),
      country: asText(entry.country || profile.country || LEAD_SETTINGS_DEFAULT_COUNTRY),
      locationLabel: asText(entry.locationLabel || entry.location || entry.city),
      coords,
      avatarUrl,
      avatarPreview: avatarUrl,
      avatarFile: draftFiles.staffAvatarFile
    };
  }

  function hydrateRuntimeState() {
    const heartState = getHeartState();
    resetFilesForNewModal(heartState);
    const modal = heartState.shell?.modal || {};
    const domainKey = asText(modal.crmDomain);
    const mode = asText(modal.mode) || "edit";
    const draft = hasObject(modal.draft) ? modal.draft : {};
    const baseItem = mode === "create" ? {} : (findCrmItem(heartState, domainKey, modal.itemId) || {});
    const modalItem = { ...baseItem, ...draft };
    const profile = {
      ...(heartState.auth?.profile || {}),
      uid: asText(heartState.auth?.profile?.uid || heartState.auth?.user?.uid || auth.currentUser?.uid),
      email: asText(heartState.auth?.profile?.email || heartState.auth?.user?.email || auth.currentUser?.email)
    };
    const user = auth.currentUser || heartState.auth?.user || null;
    const leadSection = heartState.crmAdmin?.sections?.leads || {};
    const customerSection = heartState.crmAdmin?.sections?.customers || {};
    const staffSection = heartState.crmAdmin?.sections?.staff || {};
    const leadItems = Array.isArray(leadSection.items) ? leadSection.items.slice() : [];
    const customerItems = Array.isArray(customerSection.items) ? customerSection.items.slice() : [];
    const staffItems = Array.isArray(staffSection.items) ? staffSection.items.slice() : [];
    const restaurants = mergeRestaurants(customerItems, leadItems
      .filter((lead) => asText(lead.restaurantId))
      .map((lead) => ({
        id: asText(lead.restaurantId),
        leadId: asText(lead.id),
        name: asText(lead.businessName || lead.restaurantName || lead.name),
        restaurantName: asText(lead.restaurantName || lead.businessName || lead.name),
        type: asText(lead.customerType || lead.type),
        status: asText(lead.status),
        city: asText(lead.city),
        address: asText(lead.address),
        lat: lead.lat,
        lng: lead.lng,
        logoUrl: asText(lead.logoUrl),
        titleImageUrl: asText(lead.titleImageUrl || lead.coverImageUrl || lead.coverUrl || lead.heroUrl),
        coverImageUrl: asText(lead.coverImageUrl || lead.titleImageUrl || lead.coverUrl || lead.heroUrl),
        coverUrl: asText(lead.coverUrl || lead.titleImageUrl || lead.coverImageUrl || lead.heroUrl),
        heroUrl: asText(lead.heroUrl || lead.titleImageUrl || lead.coverImageUrl || lead.coverUrl),
        openingHours: asText(lead.openingHours || lead.hours),
        hours: asText(lead.hours || lead.openingHours),
        restaurantFeatures: hasObject(lead.restaurantFeatures) ? { ...lead.restaurantFeatures } : {},
        features: Array.isArray(lead.features) ? lead.features.slice() : [],
        gardenTerraceText: asText(lead.gardenTerraceText),
        accessibilityText: asText(lead.accessibilityText),
        veganOptionsText: asText(lead.veganOptionsText),
        publicSlug: asText(lead.publicSlug || lead.landingSlug)
      })));

    Object.assign(runtimeState, {
      user,
      userProfile: profile,
      roleSwitchRoles: normalizeRoleList(profile.roles || profile.role || ""),
      activeTab: domainKey === "customers" ? "customers" : domainKey === "staff" ? "staff" : "leads",
      restaurants,
      businessLocations: buildBusinessLocations(restaurants),
      feedPosts: [],
      stories: [],
      businessPosts: [],
      selectedBusiness: null,
      leads: createLeadsState(leadSection, leadItems, domainKey, mode),
      customers: createCustomersState(customerSection, customerItems),
      staff: {
        items: staffItems,
        pageSize: Math.max(CRM_PAGE_SIZE, Number(staffItems.length) || CRM_PAGE_SIZE),
        hasMore: staffSection.hasMore === true,
        loading: false,
        loadingMore: false,
        saving: false,
        deleting: false,
        error: "",
        status: "",
        view: domainKey === "staff" ? "form" : "list",
        editorUid: domainKey === "staff" && mode !== "create" ? asText(modalItem.uid || modalItem.userId || modal.itemId) : "",
        form: createStaffForm(domainKey === "staff" ? modalItem : {}, profile)
      },
      customerModal: {
        open: domainKey === "customers",
        customer: domainKey === "customers" ? modalItem : null,
        loading: false,
        status: "",
        logoFile: draftFiles.customerLogoFile,
        logoPreview: asText(modalItem.logoUrl || modalItem.logo || modalItem.imageUrl)
      },
      upload: {
        preview: "",
        caption: "",
        file: null,
        status: "",
        mode: "feed"
      }
    });

    if (domainKey === "leads" && runtimeController?.createLeadDraftState) {
      const leadDraft = runtimeController.createLeadDraftState(mode, modalItem);
      runtimeState.leadModal = {
        ...leadDraft,
        open: true,
        logoFile: draftFiles.leadLogoFile,
        logoPreview: asText(modalItem.logoUrl || modalItem.logo || modalItem.imageUrl || leadDraft.logoPreview),
        bestSpotLogoFile: draftFiles.leadBestSpotLogoFile,
        bestSpotLogoPreview: asText(modalItem.bestSpotLogoUrl || modalItem.spotLogoUrl || leadDraft.bestSpotLogoPreview),
        titleImageFile: draftFiles.leadTitleImageFile,
        titleImagePreview: asText(modalItem.titleImageUrl || modalItem.coverImageUrl || modalItem.coverUrl || modalItem.heroUrl || leadDraft.titleImagePreview)
      };
    } else if (!runtimeState.leadModal) {
      runtimeState.leadModal = {
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
        titleImageFile: null,
        titleImagePreview: "",
        coords: null,
        locations: []
      };
    }

    dataLoaded.leads = leadSection.status === "ready";
    dataLoaded.customers = customerSection.status === "ready";
    dataLoaded.staff = staffSection.status === "ready";
  }

  function rebuildBusinessLocations() {
    runtimeState.businessLocations = buildBusinessLocations(runtimeState.restaurants || []);
  }

  function findRestaurantByUid(uid = "") {
    const safeUid = asText(uid);
    if (!safeUid) return null;
    return (runtimeState.restaurants || []).find((item) => (
      asText(item.ownerUid || item.socialUid || item.uid || item.userUid) === safeUid
    )) || null;
  }

  function findRestaurantByEmail(email = "") {
    const safeEmail = normalizeEmailValue(email);
    if (!safeEmail) return null;
    return (runtimeState.restaurants || []).find((item) => (
      normalizeEmailValue(item.ownerEmail || item.email || item.socialEmail) === safeEmail
    )) || null;
  }

  function syncDraftFromRuntime(domainKey = getModalDomain()) {
    if (typeof onDraftChange !== "function") return;
    if (domainKey === "leads") {
      if (runtimeState.leads?.view === "settings") {
        syncLeadSettingsDraftFromRuntime();
        return;
      }
      const modal = runtimeState.leadModal || {};
      const lead = { ...(modal.lead || {}) };
      if (Array.isArray(modal.locations)) lead.locations = modal.locations.slice();
      if (modal.coords) {
        lead.coords = { lat: Number(modal.coords.lat), lng: Number(modal.coords.lng) };
        lead.lat = lead.coords.lat;
        lead.lng = lead.coords.lng;
        lead.gpsLat = lead.coords.lat;
        lead.gpsLng = lead.coords.lng;
      }
      if (modal.logoPreview) lead.logoUrl = modal.logoPreview;
      if (modal.bestSpotLogoPreview) {
        lead.bestSpotLogoUrl = modal.bestSpotLogoPreview;
        lead.spotLogoUrl = modal.bestSpotLogoPreview;
      }
      if (modal.titleImagePreview) {
        lead.titleImageUrl = modal.titleImagePreview;
        lead.coverImageUrl = modal.titleImagePreview;
        lead.coverUrl = modal.titleImagePreview;
        lead.heroUrl = modal.titleImagePreview;
      }
      onDraftChange(lead);
      return;
    }
    if (domainKey === "customers") {
      const modal = runtimeState.customerModal || {};
      const customer = { ...(modal.customer || {}) };
      if (modal.logoPreview) {
        customer.logoUrl = modal.logoPreview;
        customer.logo = modal.logoPreview;
      }
      onDraftChange(customer);
      return;
    }
    if (domainKey === "staff") {
      const form = runtimeState.staff?.form || {};
      const coords = form.coords && Number.isFinite(Number(form.coords.lat)) && Number.isFinite(Number(form.coords.lng))
        ? { lat: Number(form.coords.lat), lng: Number(form.coords.lng) }
        : null;
      onDraftChange({
        uid: asText(runtimeState.staff?.editorUid),
        userId: asText(runtimeState.staff?.editorUid),
        firstName: asText(form.firstName),
        lastName: asText(form.lastName),
        email: asText(form.email),
        password: asText(form.password),
        country: asText(form.country),
        locationLabel: asText(form.locationLabel),
        location: asText(form.locationLabel),
        city: asText(form.locationLabel),
        avatarPreview: asText(form.avatarPreview || form.avatarUrl),
        avatarUrl: asText(form.avatarUrl || form.avatarPreview),
        avatar: asText(form.avatarUrl || form.avatarPreview),
        saving: runtimeState.staff?.saving === true,
        deleting: runtimeState.staff?.deleting === true,
        status: asText(runtimeState.staff?.status),
        error: asText(runtimeState.staff?.error),
        ...(coords ? {
          coords,
          lat: coords.lat,
          lng: coords.lng,
          gpsLat: coords.lat,
          gpsLng: coords.lng
        } : {})
      });
    }
  }

  function renderFromRuntime() {
    syncDraftFromRuntime(getModalDomain());
  }

  function updateLeadLocationBadge(index) {
    const safeIndex = Number(index);
    if (!Number.isInteger(safeIndex) || safeIndex < 0 || typeof document === "undefined") return;
    const location = runtimeState.leadModal?.locations?.[safeIndex] || {};
    const label = formatCoordLabel(location);
    const badge = safeIndex === 0
      ? (document.getElementById("leadCoordsDisplay") || document.getElementById("leadLocationCoords_0"))
      : document.getElementById(`leadLocationCoords_${safeIndex}`);
    if (!badge) return;
    badge.classList.toggle("hidden", !label);
    badge.classList.toggle("heart-crm-coords-label--hidden", !label);
    if (label) {
      badge.innerHTML = `${renderHeartIcon("checkCircle")} ${escapeHtml(label)}`;
    }
  }

  function updateLeadLocationBadges() {
    const rows = Array.isArray(runtimeState.leadModal?.locations) ? runtimeState.leadModal.locations : [];
    rows.forEach((_, index) => updateLeadLocationBadge(index));
  }

  function getLeadLocationInputRows() {
    if (typeof document === "undefined") return [];
    return Array.from(document.querySelectorAll("[data-lead-location-address]"))
      .map((input, fallbackIndex) => {
        const rawIndex = Number(input.getAttribute("data-lead-location-address"));
        const index = Number.isInteger(rawIndex) && rawIndex >= 0 ? rawIndex : fallbackIndex;
        return {
          index,
          address: asText(input.value)
        };
      })
      .filter((row) => row.index >= 0)
      .slice(0, 12);
  }

  function mergeLeadLocationRows(...sources) {
    const rowsByIndex = new Map();
    const addRow = (entry = {}, fallbackIndex = 0) => {
      const rawIndex = Number(entry?.index);
      const index = Number.isInteger(rawIndex) && rawIndex >= 0 ? rawIndex : fallbackIndex;
      if (index < 0 || index >= 12) return;
      const current = rowsByIndex.get(index) || { index, address: "" };
      const coords = resolveCoords(entry);
      const address = asText(entry?.address || entry?.label);
      rowsByIndex.set(index, {
        ...current,
        ...(address ? { address } : {}),
        ...(coords ? { lat: coords.lat, lng: coords.lng } : {})
      });
    };

    sources.forEach((source) => {
      if (!Array.isArray(source)) return;
      source.slice(0, 12).forEach((entry, index) => addRow(entry, index));
    });

    return Array.from(rowsByIndex.values())
      .sort((a, b) => a.index - b.index)
      .map((row) => {
        const coords = resolveCoords(row);
        return {
          address: asText(row.address),
          ...(coords ? { lat: coords.lat, lng: coords.lng } : {})
        };
      })
      .filter((row) => row.address || resolveCoords(row));
  }

  function collectLeadLocationSaveSnapshot() {
    const readInput = (id = "") => {
      if (typeof document === "undefined") return "";
      return asText(document.getElementById(id)?.value);
    };
    const modal = runtimeState.leadModal || {};
    const lead = modal.lead || {};
    const heartModal = getHeartState().shell?.modal || {};
    const draft = heartModal?.kind === "crm-editor" && heartModal?.crmDomain === "leads" && hasObject(heartModal.draft)
      ? heartModal.draft
      : {};
    const rows = mergeLeadLocationRows(
      Array.isArray(draft.locations) ? draft.locations : [],
      Array.isArray(lead.locations) ? lead.locations : [],
      Array.isArray(modal.locations) ? modal.locations : [],
      getLeadLocationInputRows()
    );
    const primaryRow = rows.find((row) => resolveCoords(row)) || null;
    const primaryCoords = resolveCoords(primaryRow)
      || resolveCoords(modal.coords)
      || resolveCoords(lead.coords)
      || resolveCoords(lead)
      || resolveCoords(draft.coords)
      || resolveCoords(draft)
      || null;
    return {
      rows,
      primaryCoords,
      address: readInput("leadAddress") || asText(lead.address || draft.address || rows[0]?.address),
      city: readInput("leadCity") || asText(lead.city || draft.city),
      country: readInput("leadCountry") || asText(lead.country || draft.country),
      zipCode: readInput("leadZipCode") || asText(lead.zipCode || draft.zipCode),
      googleMaps: readInput("leadGoogleMaps") || asText(lead.googleMaps || draft.googleMaps)
    };
  }

  function setInputValueIfBlank(id = "", value = "") {
    if (typeof document === "undefined") return;
    const node = document.getElementById(id);
    const safeValue = asText(value);
    if (!node || !safeValue || asText(node.value)) return;
    node.value = safeValue;
  }

  function applyLeadLocationSaveSnapshot(snapshot = {}) {
    const modal = runtimeState.leadModal || null;
    if (!modal) return;
    const snapshotRows = Array.isArray(snapshot.rows) ? snapshot.rows : [];
    const rows = mergeLeadLocationRows(
      Array.isArray(modal.locations) ? modal.locations : [],
      snapshotRows
    );
    const primaryCoords = resolveCoords(snapshot.primaryCoords)
      || resolveCoords(rows.find((row) => resolveCoords(row)))
      || resolveCoords(modal.coords)
      || null;
    if (primaryCoords && rows.length && !resolveCoords(rows[0])) {
      rows[0] = {
        ...rows[0],
        lat: primaryCoords.lat,
        lng: primaryCoords.lng
      };
    }
    if (rows.length) modal.locations = rows.slice(0, 12);
    if (primaryCoords) modal.coords = { lat: primaryCoords.lat, lng: primaryCoords.lng };

    const lead = { ...(modal.lead || {}) };
    if (Array.isArray(modal.locations)) lead.locations = modal.locations.slice(0, 12);
    const primaryLocation = Array.isArray(modal.locations)
      ? modal.locations.find((row) => resolveCoords(row)) || modal.locations[0] || null
      : null;
    const address = asText(snapshot.address || primaryLocation?.address || lead.address);
    const googleMaps = asText(snapshot.googleMaps)
      || (primaryCoords ? `https://maps.google.com/?q=${primaryCoords.lat},${primaryCoords.lng}` : asText(lead.googleMaps));
    if (address) lead.address = address;
    if (asText(snapshot.city)) lead.city = asText(snapshot.city);
    if (asText(snapshot.country)) lead.country = asText(snapshot.country);
    if (asText(snapshot.zipCode)) lead.zipCode = asText(snapshot.zipCode);
    if (googleMaps) lead.googleMaps = googleMaps;
    if (primaryCoords) {
      lead.coords = { lat: primaryCoords.lat, lng: primaryCoords.lng };
      lead.lat = primaryCoords.lat;
      lead.lng = primaryCoords.lng;
      lead.gpsLat = primaryCoords.lat;
      lead.gpsLng = primaryCoords.lng;
    }
    modal.lead = lead;

    if (Array.isArray(modal.locations) && typeof document !== "undefined") {
      modal.locations.slice(0, 12).forEach((row, index) => {
        setInputValueIfBlank(`leadLocationAddress_${index}`, row.address);
      });
    }
    setInputValueIfBlank("leadAddress", address || primaryLocation?.address);
    setInputValueIfBlank("leadCity", snapshot.city);
    setInputValueIfBlank("leadCountry", snapshot.country);
    setInputValueIfBlank("leadZipCode", snapshot.zipCode);
    setInputValueIfBlank("leadGoogleMaps", googleMaps);
    updateLeadLocationBadges();
  }

  function bindLocationPickerDraftSync() {
    if (typeof document === "undefined" || typeof window === "undefined") return;
    const confirmBtn = document.getElementById("confirmLocationBtn");
    if (!confirmBtn || confirmBtn.dataset.heartDraftSyncBound === "true") return;
    confirmBtn.addEventListener("click", () => {
      [0, 120, 500, 1500].forEach((delayMs) => {
        window.setTimeout(() => {
          syncDraftFromRuntime(getModalDomain());
          updateLeadLocationBadges();
        }, delayMs);
      });
    });
    confirmBtn.dataset.heartDraftSyncBound = "true";
  }

  function getLeadGeoRuntime() {
    return createCrmLeadGeoSupportRuntime({
      state: runtimeState,
      constants: {
        ceoCountries: CEO_COUNTRIES,
        defaultCountry: LEAD_SETTINGS_DEFAULT_COUNTRY,
        countryCenters: LEAD_COUNTRY_CENTERS,
        defaultCenter: PRISHTINA_COORDS,
        leadTypeOrder: LEAD_TYPE_ORDER,
        leadStatusLabels: LEAD_STATUS_LABELS,
        leadTypeLabels: LEAD_TYPE_LABELS
      },
      utilityApi: {
        normalizeSearchKeyFn: normalizeSearchKey,
        fetchFn: typeof fetch === "function" ? fetch.bind(globalThis) : null
      }
    });
  }

  function ensureRuntimeController() {
    if (runtimeController) {
      hydrateRuntimeState();
      return runtimeController;
    }

    const leadGeo = getLeadGeoRuntime();
    const ceoSupport = createCrmCeoScopeSupportRuntime({
      state: runtimeState,
      dataLoaded,
      constants: {
        ceoCountries: CEO_COUNTRIES,
        crmPagesTtlMs: CACHE_TTL_MS.crmPages,
        albertCeoUid: ALBERT_CEO_UID,
        albertCeoAliases: ALBERT_CEO_ALIASES,
        albertCeoEmails: ALBERT_CEO_EMAILS
      },
      firebaseApi: {
        db,
        collectionFn: collection,
        queryFn: query,
        whereFn: where,
        limitFn: limit,
        getDocsFn: getDocs,
        getDocFn: getDoc,
        docFn: doc,
        setDocFn: setDoc,
        incrementFn: increment,
        serverTimestampFn: serverTimestamp,
        documentIdFn: documentId
      },
      renderApi: {
        renderFn: renderFromRuntime,
        toDateSafeFn: toDateSafe,
        escapeHtmlFn: escapeHtml
      },
      storageApi: {
        readCacheFn: readCache,
        writeCacheFn: writeCache,
        leadPageCacheKeyFn: leadPageCacheKey,
        customerPageCacheKeyFn: customerPageCacheKey,
        saveUserProfileToStorageFn: saveUserProfileToStorage
      },
      profileApi: {
        normalizeRoleListFn: normalizeRoleList,
        normalizeEmailValueFn: normalizeEmailValue,
        normalizeHandleFn: normalizeHandle
      },
      leadApi: {
        normalizeLeadStatusKeyFn: leadGeo.normalizeLeadStatusKey,
        isCustomerRestaurantFn: leadGeo.isCustomerRestaurant
      },
      crmApi: {
        normalizeLeadDocFn: (...args) => runtimeController?.normalizeLeadDoc?.(...args) || (args[0] || {}),
        applyKnownLeadOwnershipOverrideFn: (...args) => runtimeController?.applyKnownLeadOwnershipOverride?.(...args) || (args[0] || {}),
        isHiddenLegacyCeoEmailFn: (email = "") => HIDDEN_LEGACY_CEO_EMAILS.includes(normalizeEmailValue(email))
      }
    });

    mediaUploadRuntime = createMediaUploadRuntimeCluster({
      stateDeps: {
        state: runtimeState,
        auth,
        documentObj: typeof document === "undefined" ? null : document,
        writeCacheFn: writeCache,
        setStateFn: (patch = {}) => Object.assign(runtimeState, patch || {}),
        setFeedStoriesSignatureFn: () => {}
      },
      constants: {
        mediaBaseUrl: BUNNY_EDGE_BASE,
        mediaTicketEndpoint: MEDIA_TICKET_ENDPOINT,
        cacheKeys: CACHE_KEYS,
        fastLimits: {}
      },
      firebaseApi: {
        db,
        collectionFn: collection,
        docFn: doc,
        setDocFn: setDoc,
        serverTimestampFn: serverTimestamp
      },
      mediaApi: {
        fetchFn: typeof fetch === "function" ? fetch.bind(globalThis) : null,
        compressImageFn: compressImage
      },
      storyApi: {
        storySystemController: null,
        isLocalBusinessProfileFn: () => false,
        normalizeStoryItemForDisplayFn: (value) => value,
        buildStoriesSignatureFn: () => "",
        loadStoriesForFeedFn: async () => {},
        loadFeedPostsFn: async () => {},
        loadBusinessPostsFn: async () => {},
        loadUserPostsFn: async () => {}
      },
      renderApi: {
        getOptimizedImageUrlFn: (value) => asText(value),
        escapeHtmlFn: escapeHtml,
        iconFn: (name = "", extraClass = "") => renderHeartIcon({
          "check-circle-2": "checkCircle",
          "map-pin": "mapPin",
          check: "checkCircle"
        }[name] || name, extraClass || "heart-icon"),
        renderFn: renderFromRuntime,
        updateFeedDomFn: () => false,
        getLastRenderModeFn: () => ""
      }
    });

    const cluster = createCrmDomainRuntimeCluster({
      stateDeps: { state: runtimeState, dataLoaded },
      constants: {
        LEAD_SETTINGS_DEFAULT_COUNTRY,
        CEO_COUNTRIES,
        LEAD_TYPE_ORDER,
        LEAD_TYPE_LABELS,
        LEAD_STATUS_ORDER,
        LEAD_STATUS_LABELS,
        PLACEHOLDER_IMAGE,
        CRM_LAZY_RENDERERS_MODULE_URL,
        BUILD_INFO_ENDPOINT_URL,
        enqueueMicrotaskCore,
        PRISHTINA_COORDS,
        CRM_PAGE_SIZE,
        CACHE_KEYS,
        HIDDEN_LEGACY_CEO_EMAILS,
        MILAN_OWNED_LEAD_EMAILS,
        MILAN_OWNED_LEAD_BUSINESSES,
        ALBERT_OWNED_LEAD_EMAILS,
        ALBERT_OWNED_LEAD_BUSINESSES
      },
      renderApi: {
        icon: (name = "", extraClass = "") => renderHeartIcon({
          "check-circle-2": "checkCircle",
          "map-pin": "mapPin",
          check: "checkCircle"
        }[name] || name, extraClass || "heart-icon"),
        escapeHtml,
        render: renderFromRuntime,
        renderOverlays: renderFromRuntime,
        renderCrmLazyLoadingView: () => "",
        renderCeoGuardCore: () => "",
        getOptimizedImageUrl: (value) => asText(value),
        isPlaceholderUrl: (value) => !asText(value) || asText(value) === PLACEHOLDER_IMAGE,
        ensureLeafletLoaded,
        alert: typeof alert === "function" ? alert : () => {},
        confirm: typeof confirm === "function" ? confirm : () => false
      },
      leadApi: {
        ...leadGeo,
        normalizeLeadScopeKey: normalizeLeadScopeKeyCore,
        normalizeCustomerScopeKey: normalizeCustomerScopeKeyCore,
        createLeadScopeMap: createLeadScopeMapCore,
        createCustomerScopeMap: createCustomerScopeMapCore,
        normalizeSearchKey,
        resolveCurrencyCodeFromLeadCountry,
        normalizeHandle,
        normalizeRestaurantType,
        toDateSafe,
        uniqueStringList: ceoSupport.uniqueStringList,
        findRestaurantByUid,
        findRestaurantByEmail,
        normalizeEmailValue
      },
      geoApi: leadGeo,
      firebaseApi: {
        setDoc,
        doc,
        db,
        serverTimestamp,
        collection,
        query,
        where,
        limit,
        getDocs,
        getDoc,
        deleteDoc
      },
      authApi: {
        getApps,
        initializeApp,
        app,
        getAuth,
        createUserWithEmailAndPassword,
        signInWithEmailAndPassword,
        signOut
      },
      cacheApi: {
        saveUserProfileToStorage,
        mergeRestaurants,
        rebuildBusinessLocations,
        readLeadScopeCache: ceoSupport.readLeadScopeCache,
        writeLeadScopeCache: ceoSupport.writeLeadScopeCache,
        readCustomerScopeCache: ceoSupport.readCustomerScopeCache,
        writeCustomerScopeCache: ceoSupport.writeCustomerScopeCache,
        menuCache,
        menuCacheKey: (rid, kind = "") => `${asText(rid)}::${asText(kind)}`,
        focusCache,
        focusCacheKey: (rid) => asText(rid),
        businessPostsKey,
        writeCache,
        saveFeedPosts: (posts = []) => {
          runtimeState.feedPosts = Array.isArray(posts) ? posts.slice() : [];
        },
        readCache,
        buildStoriesSignature: () => "",
        setFeedStoriesSignature: () => {}
      },
      ceoApi: {
        ...ceoSupport,
        renderCeoScopeTabs: () => "",
        renderOwnershipPills: () => ""
      },
      modalApi: {
        saveCeoStaffFromViewCore,
        uploadCompressedImage: (...args) => mediaUploadRuntime.uploadCompressedImage(...args),
        saveLeadFromModalCore,
        deleteLeadFromModalCore,
        saveCustomerFromModalCore,
        convertLeadToCustomerCore,
        closeLeadModal: () => {
          if (runtimeState.leadModal) runtimeState.leadModal.open = false;
          if (runtimeState.leads) runtimeState.leads.view = "list";
        },
        closeCustomerModal: () => {
          if (runtimeState.customerModal) runtimeState.customerModal.open = false;
        }
      }
    });
    runtimeController = cluster.crmRuntimeController || cluster;
    hydrateRuntimeState();
    return runtimeController;
  }

  function getStatus(domainKey = "") {
    if (domainKey === "leadSettings") return asText(runtimeState.leads?.settingsStatus);
    if (domainKey === "leads") return asText(runtimeState.leadModal?.status);
    if (domainKey === "customers") return asText(runtimeState.customerModal?.status);
    if (domainKey === "staff") return asText(runtimeState.staff?.status);
    return "";
  }

  function syncLeadSettingsDraftFromRuntime() {
    if (typeof onDraftChange !== "function") return;
    onDraftChange({
      settingsSaving: runtimeState.leads?.settingsSaving === true,
      settingsStatus: asText(runtimeState.leads?.settingsStatus),
      leadSettings: runtimeState.userProfile?.leadSettings && typeof runtimeState.userProfile.leadSettings === "object"
        ? { ...runtimeState.userProfile.leadSettings }
        : {}
    });
  }

  function actionOutcome(domainKey = "", result = undefined) {
    const status = getStatus(domainKey);
    const crmCounts = runtimeState.userProfile?.crmCounts && typeof runtimeState.userProfile.crmCounts === "object"
      ? { ...runtimeState.userProfile.crmCounts }
      : null;
    if (result === false) return { ok: false, message: status, crmCounts };
    if (domainKey === "leads") {
      return {
        ok: runtimeState.leadModal?.open === false || runtimeState.leads?.view === "list",
        message: status,
        crmCounts
      };
    }
    if (domainKey === "customers") {
      return {
        ok: runtimeState.customerModal?.open === false,
        message: status,
        crmCounts
      };
    }
    if (domainKey === "staff") {
      return {
        ok: runtimeState.staff?.view === "list" || result === true,
        message: status,
        crmCounts
      };
    }
    return { ok: result !== false, message: status, crmCounts };
  }

  async function saveLeadFromModal() {
    const locationSnapshot = collectLeadLocationSaveSnapshot();
    const controller = ensureRuntimeController();
    applyLeadLocationSaveSnapshot(locationSnapshot);
    const result = await controller.saveLeadFromModal();
    syncDraftFromRuntime("leads");
    return actionOutcome("leads", result);
  }

  async function deleteLeadFromModal() {
    const controller = ensureRuntimeController();
    const result = await controller.deleteLeadFromModal();
    syncDraftFromRuntime("leads");
    return actionOutcome("leads", result);
  }

  async function convertLeadToCustomer(leadId = "") {
    const controller = ensureRuntimeController();
    const id = asText(leadId || runtimeState.leadModal?.lead?.id || getHeartState().shell?.modal?.itemId);
    const result = await controller.convertLeadToCustomer(id);
    syncDraftFromRuntime("leads");
    return actionOutcome("leads", result);
  }

  async function saveLeadSettings() {
    const controller = ensureRuntimeController();
    const result = await controller.saveLeadSettings();
    syncLeadSettingsDraftFromRuntime();
    const crmCounts = runtimeState.userProfile?.crmCounts && typeof runtimeState.userProfile.crmCounts === "object"
      ? { ...runtimeState.userProfile.crmCounts }
      : null;
    return {
      ok: result !== false,
      message: getStatus("leadSettings"),
      leadSettings: runtimeState.userProfile?.leadSettings && typeof runtimeState.userProfile.leadSettings === "object"
        ? { ...runtimeState.userProfile.leadSettings }
        : null,
      crmCounts
    };
  }

  async function saveCustomerFromModal() {
    const controller = ensureRuntimeController();
    const result = await controller.saveCustomerFromModal();
    syncDraftFromRuntime("customers");
    return actionOutcome("customers", result);
  }

  async function saveCeoStaffFromView() {
    const controller = ensureRuntimeController();
    const result = await controller.saveCeoStaffFromView();
    syncDraftFromRuntime("staff");
    return actionOutcome("staff", result);
  }

  async function deleteCeoStaffFromView() {
    const controller = ensureRuntimeController();
    const result = await controller.deleteCeoStaffFromView();
    syncDraftFromRuntime("staff");
    return actionOutcome("staff", result);
  }

  function normalizeAdApprovalStatus(value = "") {
    const key = asText(value).toLowerCase();
    if (key === "approved" || key === "accepted") return "approved";
    if (key === "rejected" || key === "declined") return "rejected";
    return "";
  }

  function parseAdCompositeId(value = "") {
    const raw = asText(value);
    if (!raw) return { restaurantId: "", adId: "" };
    const [restaurantId, ...rest] = raw.split("::");
    return {
      restaurantId: asText(restaurantId),
      adId: asText(rest.join("::"))
    };
  }

  async function setAdApprovalStatus(adCompositeId = "", status = "") {
    const { restaurantId, adId } = parseAdCompositeId(adCompositeId);
    const nextStatus = normalizeAdApprovalStatus(status);
    if (!restaurantId || !adId || !nextStatus) {
      return { ok: false, message: "Ad oder Status fehlt." };
    }
    const ref = doc(db, "restaurants", restaurantId, "public", "ads");
    const snap = await getDoc(ref);
    const data = snap.exists() ? (snap.data() || {}) : {};
    const items = Array.isArray(data.items) ? data.items.slice() : [];
    const index = items.findIndex((item) => asText(item?.id || item?.adId) === adId);
    if (index < 0) {
      return { ok: false, message: "Ad wurde nicht gefunden." };
    }
    const heartState = getHeartState();
    const reviewerUid = asText(heartState.auth?.user?.uid);
    const reviewerName = asText(
      heartState.auth?.profile?.name
      || heartState.auth?.profile?.displayName
      || heartState.auth?.user?.displayName
      || heartState.auth?.user?.email
    );
    items[index] = {
      ...items[index],
      status: nextStatus,
      approvalStatus: nextStatus,
      reviewedAt: serverTimestamp(),
      reviewedByUid: reviewerUid,
      reviewedByName: reviewerName,
      updatedAt: serverTimestamp()
    };
    await setDoc(ref, {
      ...data,
      items,
      truthSource: "public-ads",
      truthState: items.length ? "seeded" : "knownEmpty",
      updatedAt: serverTimestamp()
    }, { merge: true });
    return {
      ok: true,
      message: nextStatus === "approved" ? "Ad freigegeben." : "Ad abgelehnt."
    };
  }

  function syncLeadDerivedFields() {
    const controller = ensureRuntimeController();
    controller.syncLeadDerivedFields();
  }

  function syncLeadModalDraftFromForm() {
    const controller = ensureRuntimeController();
    controller.syncLeadModalDraftFromForm();
    updateLeadLocationBadges();
  }

  async function refineLeadLocationAddressIndex(index, value = "") {
    const controller = ensureRuntimeController();
    const safeIndex = Number(index);
    if (!Number.isInteger(safeIndex) || safeIndex < 0) return { ok: false };
    controller.syncLeadModalDraftFromForm();
    await controller.refineLeadLocationAddressIndex(safeIndex, value, { hydratePrimary: safeIndex === 0 });
    updateLeadLocationBadges();
    return { ok: true };
  }

  function syncStaffFormFromDom() {
    const controller = ensureRuntimeController();
    controller.syncStaffFormFromDom();
  }

  function syncStaffDerivedEmailField() {
    const controller = ensureRuntimeController();
    controller.syncStaffFormFromDom();
    controller.syncStaffDerivedEmailField();
  }

  function addLeadModalLocationRow() {
    const controller = ensureRuntimeController();
    controller.addLeadModalLocationRow();
    syncDraftFromRuntime("leads");
  }

  function removeLeadModalLocationRow(index) {
    const controller = ensureRuntimeController();
    controller.removeLeadModalLocationRow(index);
    syncDraftFromRuntime("leads");
  }

  async function pickLeadLocation(index) {
    const controller = ensureRuntimeController();
    const safeIndex = Number(index);
    const rowIndex = Number.isInteger(safeIndex) && safeIndex >= 0 ? safeIndex : 0;
    if (typeof controller.openLocationPicker !== "function") {
      throw new Error("Social Standort-Picker ist nicht verfuegbar.");
    }
    const addressInputId = `leadLocationAddress_${rowIndex}`;
    const addressInput = document.getElementById(addressInputId);
    let addressValue = asText(addressInput?.value);
    if (!addressValue && rowIndex === 0) {
      addressValue = asText(document.getElementById("leadAddress")?.value)
        || asText(document.getElementById("leadGoogleMaps")?.value)
        || asText(document.getElementById("leadCity")?.value);
      if (addressValue && addressInput) addressInput.value = addressValue;
    }
    controller.syncLeadModalDraftFromForm();
    if (addressValue && typeof controller.refineLeadLocationAddressIndex === "function") {
      await controller.refineLeadLocationAddressIndex(rowIndex, addressValue, { hydratePrimary: rowIndex === 0 });
      controller.syncLeadModalDraftFromForm();
      updateLeadLocationBadges();
    }
    const coordsDisplayId = rowIndex === 0 && document.getElementById("leadCoordsDisplay")
      ? "leadCoordsDisplay"
      : `leadLocationCoords_${rowIndex}`;
    const initialCoords = resolveCoords(runtimeState.leadModal?.locations?.[rowIndex])
      || (rowIndex === 0 ? resolveCoords(runtimeState.leadModal?.coords) : null);
    await controller.openLocationPicker({
      addressInputId,
      coordsDisplayId,
      initialCoords,
      context: `lead_location:${rowIndex}`
    });
    bindLocationPickerDraftSync();
    revealLocationPickerModalIfReady();
    assertLocationPickerOpened();
    return { ok: true };
  }

  async function pickStaffLocation() {
    const controller = ensureRuntimeController();
    if (typeof controller.openLocationPicker !== "function") {
      throw new Error("Social Standort-Picker ist nicht verfuegbar.");
    }
    controller.syncStaffFormFromDom();
    await controller.openLocationPicker({
      addressInputId: "staffLocationLabel",
      coordsDisplayId: "staffCoordsDisplay",
      context: "staff"
    });
    bindLocationPickerDraftSync();
    revealLocationPickerModalIfReady();
    assertLocationPickerOpened();
    return { ok: true };
  }

  function setLeadLogoFile(file) {
    ensureRuntimeController();
    draftFiles.leadLogoFile = file || null;
    const preview = createPreviewUrl(file);
    runtimeState.leadModal.logoFile = draftFiles.leadLogoFile;
    runtimeState.leadModal.logoPreview = preview || runtimeState.leadModal.logoPreview || "";
    if (runtimeState.leadModal.lead) runtimeState.leadModal.lead.logoUrl = runtimeState.leadModal.logoPreview;
    syncDraftFromRuntime("leads");
    return { ok: true };
  }

  function setLeadBestSpotLogoFile(file) {
    ensureRuntimeController();
    draftFiles.leadBestSpotLogoFile = file || null;
    const preview = createPreviewUrl(file);
    runtimeState.leadModal.bestSpotLogoFile = draftFiles.leadBestSpotLogoFile;
    runtimeState.leadModal.bestSpotLogoPreview = preview || runtimeState.leadModal.bestSpotLogoPreview || "";
    if (runtimeState.leadModal.lead) {
      runtimeState.leadModal.lead.bestSpotLogoUrl = runtimeState.leadModal.bestSpotLogoPreview;
      runtimeState.leadModal.lead.spotLogoUrl = runtimeState.leadModal.bestSpotLogoPreview;
    }
    syncDraftFromRuntime("leads");
    return { ok: true };
  }

  function setLeadTitleImageFile(file) {
    ensureRuntimeController();
    draftFiles.leadTitleImageFile = file || null;
    const preview = createPreviewUrl(file);
    runtimeState.leadModal.titleImageFile = draftFiles.leadTitleImageFile;
    runtimeState.leadModal.titleImagePreview = preview || runtimeState.leadModal.titleImagePreview || "";
    if (runtimeState.leadModal.lead) {
      runtimeState.leadModal.lead.titleImageUrl = runtimeState.leadModal.titleImagePreview;
      runtimeState.leadModal.lead.coverImageUrl = runtimeState.leadModal.titleImagePreview;
      runtimeState.leadModal.lead.coverUrl = runtimeState.leadModal.titleImagePreview;
      runtimeState.leadModal.lead.heroUrl = runtimeState.leadModal.titleImagePreview;
    }
    syncDraftFromRuntime("leads");
    return { ok: true };
  }

  function setCustomerLogoFile(file) {
    ensureRuntimeController();
    draftFiles.customerLogoFile = file || null;
    const preview = createPreviewUrl(file);
    runtimeState.customerModal.logoFile = draftFiles.customerLogoFile;
    runtimeState.customerModal.logoPreview = preview || runtimeState.customerModal.logoPreview || "";
    if (runtimeState.customerModal.customer) runtimeState.customerModal.customer.logoUrl = runtimeState.customerModal.logoPreview;
    syncDraftFromRuntime("customers");
    return { ok: true };
  }

  function setStaffAvatarFile(file) {
    const controller = ensureRuntimeController();
    controller.syncStaffFormFromDom();
    draftFiles.staffAvatarFile = file || null;
    const preview = createPreviewUrl(file);
    runtimeState.staff.form.avatarFile = draftFiles.staffAvatarFile;
    runtimeState.staff.form.avatarPreview = preview || runtimeState.staff.form.avatarPreview || "";
    runtimeState.staff.form.avatarUrl = runtimeState.staff.form.avatarPreview || runtimeState.staff.form.avatarUrl || "";
    syncDraftFromRuntime("staff");
    return { ok: true };
  }

  return Object.freeze({
    version: HEART_CRM_ADMIN_WRITE_ADAPTER_VERSION,
    saveLeadFromModal,
    deleteLeadFromModal,
    convertLeadToCustomer,
    saveLeadSettings,
    saveCustomerFromModal,
    setAdApprovalStatus,
    saveCeoStaffFromView,
    deleteCeoStaffFromView,
    syncLeadDerivedFields,
    syncLeadModalDraftFromForm,
    refineLeadLocationAddressIndex,
    syncStaffFormFromDom,
    syncStaffDerivedEmailField,
    addLeadModalLocationRow,
    removeLeadModalLocationRow,
    pickLeadLocation,
    pickStaffLocation,
    setLeadLogoFile,
    setLeadBestSpotLogoFile,
    setLeadTitleImageFile,
    setCustomerLogoFile,
    setStaffAvatarFile
  });
}
