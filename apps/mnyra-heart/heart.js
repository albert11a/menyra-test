import {
  createHeartApiClient
} from "./heart-api-client.js";
import {
  createHeartAuthController
} from "./heart-auth.js";
import {
  bindHeartEvents
} from "./heart-events.js";
import {
  createSingleFlight,
  withDeadline
} from "./heart-single-flight.js";
import {
  createHeartCrmAdminShellConsumer
} from "./heart-crm-admin-shell-consumer.js";
import {
  createHeartCrmAdminReadLoaderDeps
} from "./heart-crm-admin-read-loaders.js";
import {
  createHeartCrmAdminWriteAdapter
} from "./heart-crm-admin-write-adapter.js";
import {
  createHeartMonitoringAdapter
} from "./heart-monitoring-adapter.js";
import {
  createHeartAnalyticsAdapter
} from "./heart-analytics-adapter.js";
import {
  createHeartSetupAdapter
} from "./heart-setup-adapter.js";
import {
  createHeartDestinationsAdapter
} from "./heart-destinations-adapter.js";
import {
  createEmptyDestinationPlace,
  readDestinationDraftFromDom
} from "./heart-destinations-render.js";
import {
  createHeartDestinationLocationPicker,
  resolveDestinationCoordsFromText
} from "./heart-destination-location-picker.js";
import {
  normalizeDestinationOverridesCore
} from "../menyra-social/core/destinations/destination-merge-core.js";
import {
  renderHeartApp
} from "./heart-render.js";
import {
  canRestoreHeartView,
  resolveHeartRouteView
} from "./heart-route-view-resolver.js";
import {
  createHeartInitialState,
  createHeartStore
} from "./heart-state.js";
import {
  nextHourDelayMsCore
} from "./heart-start-core.js";
import {
  bindAnalyticsChartInteractions
} from "../menyra-social/core/analytics/analytics-dashboard-render-utils.js";

const root = document.getElementById("heartApp");
const store = createHeartStore(createHeartInitialState());
const actions = store.actions;
const initialRouteView = resolveHeartRouteView();
if (initialRouteView) actions.setActiveView(initialRouteView);
const authController = createHeartAuthController({ store });
const runtimeConfig = globalThis.__MNYRA_HEART_CONFIG__ || {};
const apiClient = createHeartApiClient({
  authController,
  apiBase: runtimeConfig.apiBase || document.querySelector('meta[name="heart-api-base"]')?.content || "/api/heart/",
  fallbackApiBase: runtimeConfig.fallbackApiBase || document.querySelector('meta[name="heart-api-fallback-base"]')?.content || ""
});
const monitoringAdapter = createHeartMonitoringAdapter({ apiClient });
const analyticsAdapter = createHeartAnalyticsAdapter();
const setupAdapter = createHeartSetupAdapter({ apiClient });
const destinationsAdapter = createHeartDestinationsAdapter({
  getAuthState: () => store.getState().auth
});
const destinationLocationPicker = createHeartDestinationLocationPicker();
const crmAdminReadLoaders = createHeartCrmAdminReadLoaderDeps({
  getAuthState: () => store.getState().auth,
  getSetupState: () => store.getState().setup
});
const crmAdminWriteAdapter = createHeartCrmAdminWriteAdapter({
  getState: () => store.getState(),
  onDraftChange: (draftPatch) => actions.setCrmEditorDraft(draftPatch)
});
const crmAdminConsumerDeps = Object.freeze({
  read: crmAdminReadLoaders,
  write: crmAdminWriteAdapter
});

let toastTimer = null;
let previousState = store.getState();
let authBootstrapSessionKey = "";
let displayModeQuery = null;
let displayModeCleanup = null;
let motivationTimer = null;
// Der Spruch oben auf Start wechselt zur Stunde. Damit die Startseite nicht bei
// jedem Neuzeichnen eine neue Uhrzeit einsetzt (und dadurch neu geschrieben
// wird), steht die Zeit hier fest und wird genau einmal pro Stunde bewegt.
let renderClock = Date.now();
const CRM_ADMIN_DEFAULT_READ_LIMIT = 20;
const CRM_ADMIN_MAX_READ_LIMIT = 160;
const CRM_ADMIN_SCOPE_COUNT_KEYS = Object.freeze({
  leads: Object.freeze({
    own: "ownLeads",
    staff: "staffLeads",
    archived: "archivedLeads"
  }),
  customers: Object.freeze({
    own: "ownCustomers",
    staff: "staffCustomers"
  })
});
const CRM_BUILD_INFO_ENDPOINT_URL = "/api/build-info";

let crmBuildStatusPromise = null;
let crmBuildStatusLoaded = false;
let crmBuildStatusCache = {
  commitShort: "",
  branch: "",
  environment: "",
  buildTimestamp: ""
};

function getRenderRuntime() {
  return {
    crmAdminConsumerDeps,
    now: renderClock
  };
}

function normalizeCrmBuildStatus(raw = {}) {
  const commitRaw = String(raw.commitShort || raw.commitSha || raw.commit || "").trim();
  const branchRaw = String(raw.branch || raw.ref || "").trim();
  const envRaw = String(raw.environment || raw.env || "").trim();
  const timestampRaw = String(raw.buildTimestamp || raw.builtAt || raw.timestamp || "").trim();
  let buildTimestamp = "";
  if (timestampRaw) {
    const parsed = new Date(timestampRaw);
    buildTimestamp = Number.isFinite(parsed.getTime()) ? parsed.toISOString() : timestampRaw;
  }
  return {
    commitShort: commitRaw ? commitRaw.slice(0, 12) : "",
    branch: branchRaw,
    environment: envRaw,
    buildTimestamp
  };
}

async function loadCrmBuildStatus({ force = false } = {}) {
  if (crmBuildStatusLoaded && !force) {
    return { buildStatus: crmBuildStatusCache, buildStatusLoading: false, buildStatusError: "" };
  }
  if (crmBuildStatusPromise && !force) return crmBuildStatusPromise;
  if (!CRM_BUILD_INFO_ENDPOINT_URL || typeof fetch !== "function") {
    crmBuildStatusLoaded = true;
    return { buildStatus: crmBuildStatusCache, buildStatusLoading: false, buildStatusError: "" };
  }
  const endpoint = `${CRM_BUILD_INFO_ENDPOINT_URL}${CRM_BUILD_INFO_ENDPOINT_URL.includes("?") ? "&" : "?"}refresh=${Date.now()}`;
  crmBuildStatusPromise = fetch(endpoint, {
    method: "GET",
    headers: { Accept: "application/json" },
    cache: "no-store"
  })
    .then(async (response) => {
      if (!response.ok) throw new Error(`Build status request failed (${response.status})`);
      crmBuildStatusCache = normalizeCrmBuildStatus(await response.json());
      crmBuildStatusLoaded = true;
      return { buildStatus: crmBuildStatusCache, buildStatusLoading: false, buildStatusError: "" };
    })
    .catch((error) => {
      crmBuildStatusLoaded = true;
      return {
        buildStatus: crmBuildStatusCache,
        buildStatusLoading: false,
        buildStatusError: error?.message || "Build Status konnte nicht geladen werden."
      };
    })
    .finally(() => {
      crmBuildStatusPromise = null;
    });
  return crmBuildStatusPromise;
}

function isStandaloneDisplayMode() {
  try {
    if (window.matchMedia?.("(display-mode: standalone)").matches) return true;
  } catch {}
  return window.navigator?.standalone === true;
}

// Die Seite darf sich nicht mitbewegen, wenn eine Schublade oder ein Modal
// offen ist. Geschrieben wird nur, was sich wirklich aendert: Vorher setzte
// jede Zustandsaenderung zehn Inline-Styles neu, und jedes Setzen laesst den
// Browser Layout und Stil erneut rechnen.
let lastViewportLock = null;

function syncViewportSurface(state = store.getState()) {
  const modal = state.shell?.modal || {};
  const inlineEditorOpen = modal.kind === "crm-editor"
    && (modal.crmDomain === "leads" || modal.crmDomain === "staff");
  const lockDocument = !!state.shell?.navOpen || (!!modal.kind && !inlineEditorOpen);
  if (lastViewportLock === lockDocument) return;
  lastViewportLock = lockDocument;
  const overscroll = lockDocument ? "none" : "auto";
  const overflow = lockDocument ? "hidden" : "";
  [document.documentElement, document.body].forEach((node) => {
    node.style.overscrollBehaviorY = overscroll;
    node.style.overflow = overflow;
  });
}

function syncStandaloneMode() {
  actions.setStandaloneMode(isStandaloneDisplayMode());
}

function installViewportObservers() {
  syncStandaloneMode();

  if (window.matchMedia) {
    displayModeQuery = window.matchMedia("(display-mode: standalone)");
    const handleDisplayModeChange = () => {
      syncStandaloneMode();
    };
    if (typeof displayModeQuery.addEventListener === "function") {
      displayModeQuery.addEventListener("change", handleDisplayModeChange);
      displayModeCleanup = () => displayModeQuery?.removeEventListener?.("change", handleDisplayModeChange);
    } else if (typeof displayModeQuery.addListener === "function") {
      displayModeQuery.addListener(handleDisplayModeChange);
      displayModeCleanup = () => displayModeQuery?.removeListener?.(handleDisplayModeChange);
    }
  }
}

// Ein Timer, der genau zur naechsten Stunde einmal zuschlaegt und den Spruch
// austauscht. Kein Intervall im Sekundentakt, und nichts, was im Hintergrund
// Rechenzeit kostet.
function scheduleMotivationTick() {
  if (motivationTimer) clearTimeout(motivationTimer);
  motivationTimer = window.setTimeout(() => {
    motivationTimer = null;
    renderClock = Date.now();
    renderHeartApp(root, store.getState(), getRenderRuntime());
    scheduleMotivationTick();
  }, nextHourDelayMsCore(Date.now()));
}

function destroyTimers() {
  if (displayModeCleanup) {
    displayModeCleanup();
    displayModeCleanup = null;
  }
  if (motivationTimer) {
    clearTimeout(motivationTimer);
    motivationTimer = null;
  }
  if (toastTimer) {
    clearTimeout(toastTimer);
    toastTimer = null;
  }
}

function setToast(title, message = "", tone = "neutral") {
  actions.setToast({ title, message, tone });
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => actions.setToast(null), 3600);
}

function splitPersonaList(value = "") {
  if (String(value || "").trim().toLowerCase() === "all") {
    return ["ceo", "business", "user"];
  }
  return String(value || "")
    .split(",")
    .map((item) => String(item || "").trim())
    .filter(Boolean);
}

async function refreshConnections() {
  actions.setConnectionsLoading();
  try {
    const payload = await monitoringAdapter.loadConnections();
    actions.setConnectionsData(payload.items);
  } catch (error) {
    actions.setConnectionsError(error?.message || "Setup konnte nicht geladen werden.");
  }
}

async function refreshSetup() {
  actions.setSetupLoading();
  try {
    const setup = await setupAdapter.loadSetup();
    actions.setSetupData(setup);
  } catch (error) {
    actions.setSetupError(error?.message || "Heart-Einrichtung konnte nicht geladen werden.");
  }
}

function createCrmAdminConsumer({ syncContract = true } = {}) {
  const consumer = createHeartCrmAdminShellConsumer(crmAdminConsumerDeps);
  if (syncContract) {
    actions.setCrmAdminContract(consumer.contract || {});
  }
  return consumer;
}

function getStoredCrmScopeCount(domainKey = "", scope = "") {
  const countKey = CRM_ADMIN_SCOPE_COUNT_KEYS[domainKey]?.[scope] || "";
  if (!countKey) return null;
  const count = Number(store.getState().auth?.profile?.crmCounts?.[countKey]);
  return Number.isFinite(count) ? Math.max(0, count) : null;
}

function resolveCrmReadLimit(domainKey = "", scope = "", options = {}) {
  const explicitLimit = Number(options.limit);
  if (Number.isFinite(explicitLimit) && explicitLimit > 0) {
    return Math.min(Math.max(CRM_ADMIN_DEFAULT_READ_LIMIT, Math.ceil(explicitLimit)), CRM_ADMIN_MAX_READ_LIMIT);
  }
  if (domainKey === "leads") {
    const storedCount = getStoredCrmScopeCount(domainKey, scope || "own");
    if (Number.isFinite(storedCount)) {
      return Math.min(Math.max(CRM_ADMIN_DEFAULT_READ_LIMIT, Math.ceil(storedCount)), CRM_ADMIN_MAX_READ_LIMIT);
    }
  }
  if (domainKey === "ads") return 100;
  return CRM_ADMIN_DEFAULT_READ_LIMIT;
}

// Genau ein CRM-Bereich, und nur wenn er noch nicht steht. Vorher holte jeder
// Aufruf alle fuenf Bereiche gleichzeitig - darunter Ads, das fuer jedes Lokal
// zwei weitere Dokumente liest, und Business-Konten, die nirgends angezeigt
// werden. Dafuer wartete man beim Start und bei jedem Speichern.
async function loadCrmDomain(domainKey = "", { force = false, scope = "", limit = 0 } = {}) {
  const key = String(domainKey || "").trim();
  if (!key) return;
  const section = store.getState().crmAdmin?.sections?.[key] || {};
  const nextScope = String(scope || section.scope || "").trim();
  const scopeUnchanged = String(section.scope || "").trim() === nextScope;
  if (!force && section.status === "ready" && scopeUnchanged) return;
  if (!force && section.status === "loading" && scopeUnchanged) return;

  let consumer = null;
  try {
    consumer = createCrmAdminConsumer();
  } catch (error) {
    actions.setCrmAdminError(key, error?.message || "CRM/Admin Consumer konnte nicht vorbereitet werden.");
    return;
  }
  const domain = consumer?.[key] || null;
  if (!domain?.ready || typeof domain?.load !== "function") {
    actions.setCrmAdminMissing(key, domain?.missingDeps || []);
    return;
  }

  const readLimit = resolveCrmReadLimit(key, nextScope, { limit });
  actions.setCrmAdminLoading(key, { scope: nextScope });
  try {
    const [payload, buildStatusPayload] = await Promise.all([
      domain.load({
        limit: readLimit,
        ...(nextScope ? { scope: nextScope } : {})
      }),
      key === "staff" ? loadCrmBuildStatus() : Promise.resolve({})
    ]);
    actions.setCrmAdminData(key, {
      ...(payload || {}),
      ...(buildStatusPayload || {})
    });
  } catch (error) {
    actions.setCrmAdminError(key, error?.message || "CRM/Admin Daten konnten nicht geladen werden.");
  }
}

function loadCrmDomains(domainKeys = [], options = {}) {
  return Promise.all(domainKeys.map((key) => loadCrmDomain(key, options)));
}

function getOpenCrmModal() {
  const modal = store.getState().shell?.modal || {};
  return modal.kind === "crm-editor" ? modal : null;
}

function getCrmConsumerDomain(domainKey = "") {
  const consumer = createCrmAdminConsumer({ syncContract: false });
  return consumer?.[String(domainKey || "").trim()] || null;
}

function actionSucceeded(result) {
  if (result === false) return false;
  if (result && typeof result === "object" && result.ok === false) return false;
  return true;
}

async function runCrmModalAction({
  domainKey = "",
  reloadDomains = [],
  title = "CRM",
  successMessage = "Aktion abgeschlossen.",
  action
} = {}) {
  try {
    const domain = getCrmConsumerDomain(domainKey);
    if (!domain?.writeReady) {
      const missing = Array.isArray(domain?.missingWriteDeps) ? domain.missingWriteDeps.join(", ") : "";
      throw new Error(missing ? `Fehlende CRM Facade-Dependencies: ${missing}` : "CRM Schreibaktionen sind nicht bereit.");
    }
    const result = await action?.(domain);
    if (!actionSucceeded(result)) {
      if (result?.message) setToast(title, result.message, "warning");
      return;
    }
    if (result?.crmCounts && typeof result.crmCounts === "object") {
      actions.patchAuthProfile({ crmCounts: result.crmCounts });
    }
    actions.closeModal();
    await loadCrmDomains(reloadDomains.length ? reloadDomains : [domainKey], { force: true });
    setToast(title, successMessage, "success");
  } catch (error) {
    setToast(title, error?.message || "CRM Aktion fehlgeschlagen.", "danger");
  }
}

function syncCrmLeadDerivedFields() {
  try {
    getCrmConsumerDomain("leads")?.syncDerivedFields?.();
  } catch {}
}

function syncCrmLeadDraftFromForm() {
  try {
    getCrmConsumerDomain("leads")?.syncDraftFromForm?.();
  } catch {}
}

function getCrmSearchInputId(domainKey = "") {
  const key = String(domainKey || "").trim();
  if (key === "leads") return "leadsSearchInput";
  if (key === "customers") return "customersSearchInput";
  if (key === "ads") return "adsSearchInput";
  return "";
}

function captureCrmSearchFocus(domainKey = "") {
  if (typeof document === "undefined") return null;
  const active = document.activeElement;
  const inputId = getCrmSearchInputId(domainKey);
  if (!inputId || !active || active.id !== inputId || !active.matches?.("[data-crm-search]")) return null;
  return {
    inputId,
    selectionStart: Number.isFinite(Number(active.selectionStart)) ? Number(active.selectionStart) : null,
    selectionEnd: Number.isFinite(Number(active.selectionEnd)) ? Number(active.selectionEnd) : null
  };
}

function restoreCrmSearchFocus(snapshot = null) {
  if (!snapshot?.inputId || typeof document === "undefined") return;
  const input = document.getElementById(snapshot.inputId);
  if (!input || !input.matches?.("[data-crm-search]")) return;
  input.focus({ preventScroll: true });
  if (
    Number.isInteger(snapshot.selectionStart)
    && Number.isInteger(snapshot.selectionEnd)
    && typeof input.setSelectionRange === "function"
  ) {
    try {
      const valueLength = String(input.value || "").length;
      input.setSelectionRange(
        Math.min(snapshot.selectionStart, valueLength),
        Math.min(snapshot.selectionEnd, valueLength)
      );
    } catch {}
  }
}

async function refineCrmLeadLocationAddress(index, value = "") {
  try {
    await getCrmConsumerDomain("leads")?.refineLocationAddress?.(index, value);
  } catch (error) {
    setToast("Standort", error?.message || "Standort konnte nicht verarbeitet werden.", "danger");
  }
}

function syncCrmStaffDerivedEmailField() {
  try {
    getCrmConsumerDomain("staff")?.syncDerivedEmailField?.();
  } catch {}
}

function syncCrmStaffFormFromDom() {
  try {
    getCrmConsumerDomain("staff")?.syncFormFromDom?.();
  } catch {}
}

async function refreshDestinations({ force = false } = {}) {
  const destinations = store.getState().destinations || {};
  if (!force && destinations.status === "ready") return;
  if (!force && destinations.status === "loading") return;
  actions.setDestinationsLoading();
  try {
    const items = await destinationsAdapter.listDestinations();
    actions.setDestinationsData(items);
  } catch (error) {
    actions.setDestinationsError(error?.message || "Destinationen konnten nicht geladen werden.");
  }
}

async function loadPublishedDestinations({ force = false } = {}) {
  const published = store.getState().destinations?.published || {};
  if (published.status === "loading") return;
  if (!force && published.status === "ready") return;
  actions.patchDestinationsPublished({ status: "loading", error: "" });
  try {
    const items = await destinationsAdapter.listPublishedDestinations({ force });
    actions.patchDestinationsPublished({ status: "ready", error: "", items });
  } catch (error) {
    actions.patchDestinationsPublished({
      status: "error",
      error: error?.message || "Destinationen konnten nicht geladen werden."
    });
  }
}

// Aktuellen Editor-Zustand aus den uncontrolled Inputs sichern, bevor eine
// Aktion (Ort hinzufuegen/entfernen, speichern) den Editor neu rendert.
function captureDestinationDraftFromDom() {
  const editor = store.getState().destinations?.editor || {};
  if (!editor.open) return null;
  const draft = readDestinationDraftFromDom(editor.draft || {});
  actions.patchDestinationEditor({ draft });
  return draft;
}

function readDestinationPlaceCoordsFromDom(placeId = "") {
  const latRaw = String(document.getElementById(`destPlaceLat_${placeId}`)?.value || "").trim();
  const lngRaw = String(document.getElementById(`destPlaceLng_${placeId}`)?.value || "").trim();
  if (!latRaw || !lngRaw) return null;
  const lat = Number(latRaw.replace(",", "."));
  const lng = Number(lngRaw.replace(",", "."));
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  return { lat, lng };
}

// Schreibt gepickte/aufgeloeste Koordinaten wie beim Lead direkt in die
// Hidden-Inputs plus Koordinaten-Badge, ohne den Editor neu zu rendern.
function applyDestinationPlaceCoordsToDom(placeId = "", coords = null) {
  const lat = Number(coords?.lat);
  const lng = Number(coords?.lng);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return false;
  const latInput = document.getElementById(`destPlaceLat_${placeId}`);
  const lngInput = document.getElementById(`destPlaceLng_${placeId}`);
  if (!latInput || !lngInput) return false;
  latInput.value = String(lat);
  lngInput.value = String(lng);
  const badge = document.getElementById(`destPlaceCoords_${placeId}`);
  if (badge) {
    const label = badge.querySelector("span");
    if (label) label.textContent = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    badge.classList.remove("heart-crm-coords-label--hidden");
  }
  return true;
}

// Startpunkt fuer den Karten-Picker: erster Ort des Entwurfs mit Koordinaten
// (Orte einer Destination liegen nah beieinander).
function findDestinationDraftFallbackCoords(draft = null) {
  const places = Array.isArray(draft?.places) ? draft.places : [];
  const match = places.find((place) => Number.isFinite(Number(place?.lat)) && Number.isFinite(Number(place?.lng)));
  return match ? { lat: Number(match.lat), lng: Number(match.lng) } : null;
}

function getLeadDestinationDraftContext() {
  const modal = getOpenCrmModal();
  if (!modal || modal.crmDomain !== "leads") return null;
  const draft = modal.draft && typeof modal.draft === "object" ? modal.draft : {};
  const baseLead = (store.getState().crmAdmin?.sections?.leads?.items || [])
    .find((item) => String(item?.id || "") === String(modal.itemId || "")) || {};
  const merged = { ...baseLead, ...draft };
  return {
    modal,
    destinationId: String(merged.destinationId || "").trim(),
    overrides: normalizeDestinationOverridesCore(merged.destinationOverrides || {})
  };
}

function patchLeadDestinationDraft(patchValue = {}) {
  syncCrmLeadDraftFromForm();
  actions.setCrmEditorDraft(patchValue);
}

async function saveSetup(values = {}) {
  actions.setSetupPendingAction("save-setup");
  try {
    const setup = await setupAdapter.saveSetup(values);
    actions.setSetupData(setup);
    setToast("Einrichtung", "Heart-Einrichtung wurde gespeichert.", "success");
    await refreshConnections();
  } catch (error) {
    actions.setSetupError(error?.message || "Heart-Einrichtung konnte nicht gespeichert werden.");
    setToast("Einrichtung", error?.message || "Heart-Einrichtung konnte nicht gespeichert werden.", "danger");
  } finally {
    actions.setSetupPendingAction("");
  }
}

async function clearSetupRestaurant() {
  const currentSetup = store.getState().setup.data || {};
  const hasSetupBinding = !!String(
    currentSetup.restaurantId
    || currentSetup.restaurantName
    || currentSetup.guestRouteUrl
  ).trim();
  if (!hasSetupBinding) return;
  if (typeof window !== "undefined" && typeof window.confirm === "function") {
    const confirmed = window.confirm("Heart-Verbindung zum aktuell gesetzten Restaurant wirklich loesen?");
    if (!confirmed) return;
  }
  await saveSetup({
    restaurantId: "",
    restaurantName: "",
    restaurantHandle: "",
    restaurantQuery: "",
    guestRouteUrl: "",
    allowLiveMutations: false
  });
  actions.setSetupSearchResults([], "");
  setToast("Einrichtung geloest", "Das aktive Heart-Restaurant wurde entfernt. Zielkonten bleiben bestehen.", "warning");
}

async function searchSetupRestaurants(query = "") {
  actions.setSetupSearchLoading(query);
  try {
    const payload = await setupAdapter.searchRestaurants(query);
    actions.setSetupSearchResults(payload.items, payload.query);
  } catch (error) {
    actions.setSetupSearchError(error?.message || "Restaurants konnten nicht geladen werden.", query);
  }
}

async function provisionSetupPersonas(value = "all") {
  const personas = splitPersonaList(value);
  if (!personas.length) return;
  const currentSetup = store.getState().setup.data || {};
  const pendingKey = personas.length > 1 ? "all" : personas[0];
  actions.setSetupPendingAction(`provision:${pendingKey}`);
  try {
    const setup = await setupAdapter.provisionPersonas(personas, {
      restaurantId: currentSetup.restaurantId,
      restaurantName: currentSetup.restaurantName,
      restaurantHandle: currentSetup.restaurantHandle,
      guestRouteUrl: currentSetup.guestRouteUrl,
      allowLiveMutations: currentSetup.allowLiveMutations !== false
    });
    actions.setSetupData(setup);
    setToast("Testkonten", "Heart hat die angeforderten Testkonten erstellt oder aktualisiert.", "success");
  } catch (error) {
    setToast("Testkonten", error?.message || "Die Testkonten konnten nicht erstellt werden.", "danger");
  } finally {
    actions.setSetupPendingAction("");
  }
}

async function deleteSetupPersona(personaKey = "") {
  const safePersonaKey = String(personaKey || "").trim();
  if (!safePersonaKey) return;
  actions.setSetupPendingAction(`delete:${safePersonaKey}`);
  try {
    const setup = await setupAdapter.deletePersona(safePersonaKey);
    actions.setSetupData(setup);
    setToast("Testkonto geloescht", `${safePersonaKey.toUpperCase()} wurde entfernt.`, "warning");
  } catch (error) {
    setToast("Testkonto", error?.message || "Das Testkonto konnte nicht geloescht werden.", "danger");
  } finally {
    actions.setSetupPendingAction("");
  }
}

let analyticsLoadSeq = 0;

async function refreshAnalyticsBusinesses({ force = false } = {}) {
  const current = store.getState().analytics || {};
  if (!force && (current.businesses || []).length) return;
  if (!force && current.businessesStatus === "loading") return;
  actions.patchAnalytics({ businessesStatus: "loading", businessesError: "" });
  try {
    const businesses = await analyticsAdapter.loadBusinesses();
    actions.patchAnalytics({ businessesStatus: "ready", businessesError: "", businesses });
  } catch (error) {
    actions.patchAnalytics({
      businessesStatus: "error",
      businessesError: error?.message || "Businesses konnten nicht geladen werden."
    });
  }
}

async function refreshAnalyticsDashboard({ force = false } = {}) {
  const analytics = store.getState().analytics || {};
  if (!analytics.selectedBusinessId) return;
  if (!force && analytics.status === "loading") return;
  analyticsLoadSeq += 1;
  const seq = analyticsLoadSeq;
  actions.patchAnalytics({ status: "loading", error: "" });
  try {
    const model = await analyticsAdapter.loadDashboardModel({
      restaurantId: analytics.selectedBusinessId,
      rangeKey: analytics.rangeKey || "7d",
      customFrom: analytics.customFrom || "",
      customTo: analytics.customTo || ""
    });
    if (seq !== analyticsLoadSeq) return;
    actions.patchAnalytics({ status: "ready", error: "", model, lastLoadedAt: new Date().toISOString() });
  } catch (error) {
    if (seq !== analyticsLoadSeq) return;
    actions.patchAnalytics({
      status: "error",
      error: error?.message || "Analytics konnten nicht geladen werden."
    });
  }
}

async function refreshAnalytics({ force = false } = {}) {
  await refreshAnalyticsBusinesses({ force });
  await refreshAnalyticsDashboard({ force });
}

// Die Landings werden erst geladen, wenn man sie braucht, und danach nur auf
// Verlangen neu. Es sind Zahlen von gestern, keine, die im Sekundentakt wandern.
//
// Wer waehrend des Ladens noch einmal auf Aktualisieren tippt, bekommt
// denselben Ladevorgang zurueck und keinen zweiten. Vorher stand hier ein
// Zaehler, der das spaetere Tippen gewinnen liess und das Ergebnis des frueheren
// wegwarf - wer aus Ungeduld mehrfach tippte, verlaengerte damit das Warten,
// und blieb das letzte Ergebnis aus, stand der Bereich fuer immer auf "wird
// geladen". Genau das ist passiert.
// Firestore wartet von sich aus unbegrenzt. Ohne diese Grenze dreht sich der
// Bereich bei einer haengenden Verbindung endlos, statt zu sagen, was los ist.
const LANDING_TIMEOUT_MS = 15000;

const ladeLandings = createSingleFlight(async () => {
  actions.setLandingLoading();
  try {
    const { loadLandingSessions } = await import("./heart-landing-adapter.js");
    actions.setLandingData(await withDeadline(
      loadLandingSessions(),
      LANDING_TIMEOUT_MS,
      "Die Verbindung antwortet nicht. Bitte noch einmal aktualisieren."
    ));
  } catch (error) {
    actions.setLandingError(error?.message || "Landings konnten nicht geladen werden.");
  }
});

async function refreshLanding({ force = false } = {}) {
  const landing = store.getState().landing || {};
  if (!force && landing.status === "ready") return;
  await ladeLandings();
}

// Was eine Ansicht braucht, steht an genau einer Stelle. Vorher wusste das nur
// openView - wer Heart mit "#analytics" in der Adresse neu lud, landete in einer
// Analytics-Ansicht, die nie eine Business-Liste angefordert hatte und darum
// fuer immer "Keine Businesses gefunden" zeigte.
const VIEW_LOADERS = Object.freeze({
  dashboard: (options) => Promise.all([
    refreshLanding(options),
    loadCrmDomains(["leads", "customers"], options)
  ]),
  landing: (options) => refreshLanding(options),
  crmLeads: (options) => loadCrmDomain("leads", options),
  crmCustomers: (options) => loadCrmDomain("customers", options),
  crmAds: (options) => loadCrmDomain("ads", options),
  crmStaff: (options) => loadCrmDomain("staff", options),
  destinations: (options) => refreshDestinations(options),
  analytics: (options) => refreshAnalytics(options),
  connections: (options) => {
    const state = store.getState();
    const needsConnections = options.force || state.connections.status === "idle";
    const needsSetup = options.force || state.setup.status === "idle";
    return Promise.all([
      needsConnections ? refreshConnections() : Promise.resolve(),
      needsSetup ? refreshSetup() : Promise.resolve()
    ]);
  }
});

async function ensureViewData(viewKey = "", { force = false } = {}) {
  const state = store.getState();
  if (state.auth.status !== "authenticated" || !state.auth.access?.allowed) return;
  const loader = VIEW_LOADERS[String(viewKey || "").trim()] || VIEW_LOADERS.dashboard;
  try {
    await loader({ force });
  } catch (error) {
    setToast("Laden", error?.message || "Der Bereich konnte nicht geladen werden.", "danger");
  } finally {
    if (!store.getState().boot.ready) actions.setBootReady(new Date().toISOString());
  }
}

const operations = {
  async login({ email, password }) {
    try {
      await authController.login(email, password);
    } catch (error) {
      actions.setAuthError(error?.message || "Anmeldung fehlgeschlagen.");
      setToast("Anmeldung", error?.message || "Anmeldung fehlgeschlagen.", "danger");
    }
  },
  async logout() {
    try {
      await authController.logout();
    } catch (error) {
      setToast("Abmeldung", error?.message || "Abmeldung fehlgeschlagen.", "danger");
    }
  },
  async refresh() {
    renderClock = Date.now();
    await ensureViewData(store.getState().shell.activeView, { force: true });
  },
  openLanding(restaurantId) {
    actions.setLandingSelected(restaurantId);
  },
  closeLanding() {
    actions.setLandingSelected("");
  },
  setLandingTab(tab) {
    actions.setLandingTab(tab);
  },
  // Erst umschalten, dann schreiben. Geht das Schreiben daneben, wird es
  // zurueckgedreht und gesagt, was los ist - sonst sieht es aus, als waere es
  // abgelegt, und beim naechsten Laden ist es wieder da.
  async toggleLandingArchive(restaurantId, archived) {
    const id = String(restaurantId || "").trim();
    if (!id) return;
    actions.setLandingArchived(id, archived);
    try {
      const { setLandingArchived } = await import("./heart-landing-adapter.js");
      await setLandingArchived(id, archived);
    } catch (error) {
      actions.setLandingArchived(id, !archived);
      setToast("Landing", error?.message || "Konnte nicht abgelegt werden.", "danger");
    }
  },
  // Ein Eintrag aus "Was gibt es Neues" fuehrt dorthin, wo er herkommt. Bei
  // einer Landing gleich in die Auswertung des Lokals, nicht nur in die Liste.
  openStartNews(viewKey, landingId = "") {
    const safeId = String(landingId || "").trim();
    if (safeId) actions.setLandingSelected(safeId);
    operations.openView(viewKey);
  },
  openView(viewKey) {
    const safeViewKey = String(viewKey || "").trim() || "dashboard";
    if (store.getState().shell.activeView === safeViewKey) {
      actions.setNavOpen(false);
      return;
    }
    actions.setActiveView(safeViewKey);
    queueMicrotask(() => ensureViewData(safeViewKey).catch(() => {}));
  },
  async openDestinationEditor(destinationId = "") {
    const safeId = String(destinationId || "").trim();
    if (!safeId) {
      actions.openDestinationEditor({ destinationId: "", draft: { name: "", description: "", places: [] } });
      return;
    }
    actions.openDestinationEditor({ destinationId: safeId, loading: true });
    try {
      const destination = await destinationsAdapter.loadDestination(safeId);
      if (!destination) throw new Error("Destination wurde nicht gefunden.");
      actions.openDestinationEditor({ destinationId: safeId, draft: destination.draft });
    } catch (error) {
      actions.patchDestinationEditor({
        loading: false,
        error: error?.message || "Destination konnte nicht geladen werden."
      });
    }
  },
  closeDestinationEditor() {
    actions.closeDestinationEditor();
  },
  addDestinationPlace(categoryKey = "") {
    const draft = captureDestinationDraftFromDom();
    if (!draft) return;
    actions.patchDestinationEditor({
      status: "",
      error: "",
      draft: {
        ...draft,
        places: [...draft.places, createEmptyDestinationPlace(categoryKey)]
      }
    });
  },
  removeDestinationPlace(placeId = "") {
    const draft = captureDestinationDraftFromDom();
    const safePlaceId = String(placeId || "").trim();
    if (!draft || !safePlaceId) return;
    actions.patchDestinationEditor({
      status: "",
      error: "",
      draft: {
        ...draft,
        places: draft.places.filter((place) => place.id !== safePlaceId)
      }
    });
  },
  async saveDestinationDraft() {
    const draft = captureDestinationDraftFromDom();
    if (!draft) return;
    const editor = store.getState().destinations?.editor || {};
    actions.patchDestinationEditor({ saving: true, status: "", error: "" });
    try {
      const result = await destinationsAdapter.saveDraft(editor.destinationId, draft);
      actions.patchDestinationEditor({
        saving: false,
        destinationId: result.id,
        status: "Entwurf gespeichert."
      });
      setToast("Destination", "Entwurf gespeichert.", "success");
      await refreshDestinations({ force: true });
    } catch (error) {
      actions.patchDestinationEditor({
        saving: false,
        error: error?.message || "Entwurf konnte nicht gespeichert werden."
      });
      setToast("Destination", error?.message || "Entwurf konnte nicht gespeichert werden.", "danger");
    }
  },
  async publishDestination(destinationId = "", fromEditor = false) {
    let safeId = String(destinationId || "").trim();
    if (fromEditor) {
      // Erst den sichtbaren Entwurf speichern, damit genau das veroeffentlicht
      // wird, was im Editor steht.
      const draft = captureDestinationDraftFromDom();
      const editor = store.getState().destinations?.editor || {};
      safeId = safeId || String(editor.destinationId || "").trim();
      if (!draft || !safeId) return;
      actions.patchDestinationEditor({ publishing: true, status: "", error: "" });
      try {
        await destinationsAdapter.saveDraft(safeId, draft);
      } catch (error) {
        actions.patchDestinationEditor({
          publishing: false,
          error: error?.message || "Entwurf konnte vor dem Veroeffentlichen nicht gespeichert werden."
        });
        return;
      }
    }
    if (!safeId) return;
    const confirmed = typeof confirm === "function"
      ? confirm("Veroeffentlichen? Alle mit diesem Template verbundenen Hotels bekommen den neuen Stand. Hotel-eigene Anpassungen bleiben bestehen.")
      : true;
    if (!confirmed) {
      if (fromEditor) actions.patchDestinationEditor({ publishing: false });
      return;
    }
    try {
      const result = await destinationsAdapter.publishDestination(safeId);
      if (fromEditor) {
        actions.patchDestinationEditor({ publishing: false, status: `Veroeffentlicht (v${result.version}).` });
      }
      setToast("Destination", `Veroeffentlicht: v${result.version} mit ${result.placeCount} Orten.`, "success");
      await refreshDestinations({ force: true });
      await loadPublishedDestinations({ force: true });
    } catch (error) {
      if (fromEditor) {
        actions.patchDestinationEditor({ publishing: false, error: error?.message || "Veroeffentlichen fehlgeschlagen." });
      }
      setToast("Destination", error?.message || "Veroeffentlichen fehlgeschlagen.", "danger");
    }
  },
  async deleteDestination(destinationId = "") {
    const safeId = String(destinationId || "").trim();
    if (!safeId) return;
    const confirmed = typeof confirm === "function"
      ? confirm("Destination wirklich loeschen? Verbundene Hotels zeigen dann keine Template-Orte mehr.")
      : true;
    if (!confirmed) return;
    actions.patchDestinationEditor({ deleting: true, status: "", error: "" });
    try {
      await destinationsAdapter.deleteDestination(safeId);
      actions.closeDestinationEditor();
      setToast("Destination", "Destination geloescht.", "success");
      await refreshDestinations({ force: true });
      await loadPublishedDestinations({ force: true });
    } catch (error) {
      actions.patchDestinationEditor({
        deleting: false,
        error: error?.message || "Destination konnte nicht geloescht werden."
      });
    }
  },
  // Standort eines Destination-Orts wie beim Lead: Plus Code/Adresse wird beim
  // Verlassen des Felds aufgeloest, Koordinaten landen in den Hidden-Inputs.
  async refineDestinationPlaceAddress(placeId = "", value = "") {
    const safeId = String(placeId || "").trim();
    const text = String(value || "").trim();
    if (!safeId || !text) return;
    try {
      const coords = await resolveDestinationCoordsFromText(text);
      if (coords) applyDestinationPlaceCoordsToDom(safeId, coords);
    } catch {}
  },
  async pickDestinationPlaceLocation(placeId = "") {
    const safeId = String(placeId || "").trim();
    if (!safeId) return;
    try {
      const addressValue = String(document.getElementById(`destPlaceAddress_${safeId}`)?.value || "").trim();
      let initialCoords = readDestinationPlaceCoordsFromDom(safeId);
      if (!initialCoords && addressValue) {
        initialCoords = await resolveDestinationCoordsFromText(addressValue);
      }
      if (!initialCoords) {
        const editor = store.getState().destinations?.editor || {};
        initialCoords = findDestinationDraftFallbackCoords(readDestinationDraftFromDom(editor.draft || {}));
      }
      const picked = await destinationLocationPicker.open({ initialCoords });
      if (!picked) return;
      applyDestinationPlaceCoordsToDom(safeId, picked);
      captureDestinationDraftFromDom();
    } catch (error) {
      setToast("Karte", error?.message || "Standort-Picker konnte nicht geoeffnet werden.", "danger");
    }
  },
  // Fotos fuer Destination-Orte werden sofort komprimiert hochgeladen; im
  // Entwurf stehen danach nur noch CDN-URLs.
  async handleDestinationFileChange(placeId = "", kind = "", files = []) {
    const safeId = String(placeId || "").trim();
    const safeKind = String(kind || "").trim();
    const imageFiles = (Array.isArray(files) ? files : [])
      .filter((file) => file && String(file.type || "").startsWith("image/"));
    if (!safeId || !safeKind || !imageFiles.length) return;
    const draft = captureDestinationDraftFromDom();
    const place = (draft?.places || []).find((item) => item.id === safeId);
    if (!place) return;
    actions.patchDestinationEditor({ uploading: true, status: "Bild wird hochgeladen...", error: "" });
    try {
      let coverUrl = "";
      const uploadedGalleryUrls = [];
      if (safeKind === "cover") {
        coverUrl = await crmAdminWriteAdapter.uploadDestinationImage(imageFiles[0], { maxSize: 1280 });
      } else {
        const existingCount = Array.isArray(place.gallery) ? place.gallery.length : 0;
        const batch = imageFiles.slice(0, Math.max(0, 12 - existingCount));
        if (!batch.length) throw new Error("Galerie ist voll (max. 12 Bilder).");
        for (const file of batch) {
          uploadedGalleryUrls.push(await crmAdminWriteAdapter.uploadDestinationImage(file, { maxSize: 1280 }));
        }
      }
      // Draft nach dem Upload frisch aus dem DOM lesen, damit Eingaben
      // waehrend des Uploads nicht ueberschrieben werden.
      const finalDraft = captureDestinationDraftFromDom() || draft;
      const finalPlace = (finalDraft?.places || []).find((item) => item.id === safeId);
      if (finalPlace) {
        if (safeKind === "cover") {
          finalPlace.coverImageUrl = coverUrl;
        } else {
          const gallery = Array.isArray(finalPlace.gallery) ? finalPlace.gallery.slice() : [];
          finalPlace.gallery = [...gallery, ...uploadedGalleryUrls].slice(0, 12);
        }
      }
      actions.patchDestinationEditor({ uploading: false, status: "", draft: { ...finalDraft } });
      setToast("Destination", safeKind === "cover" ? "Titelbild hochgeladen." : "Fotos hochgeladen.", "success");
    } catch (error) {
      actions.patchDestinationEditor({ uploading: false, status: "" });
      setToast("Upload", error?.message || "Bild konnte nicht hochgeladen werden.", "danger");
    }
  },
  removeDestinationGalleryImage(placeId = "", imageIndex = "") {
    const safeId = String(placeId || "").trim();
    const index = Number(imageIndex);
    if (!safeId || !Number.isInteger(index) || index < 0) return;
    const draft = captureDestinationDraftFromDom();
    const place = (draft?.places || []).find((item) => item.id === safeId);
    if (!place || !Array.isArray(place.gallery) || index >= place.gallery.length) return;
    place.gallery = place.gallery.filter((_, itemIndex) => itemIndex !== index);
    actions.patchDestinationEditor({ draft: { ...draft } });
  },
  removeDestinationCoverImage(placeId = "") {
    const safeId = String(placeId || "").trim();
    if (!safeId) return;
    const draft = captureDestinationDraftFromDom();
    const place = (draft?.places || []).find((item) => item.id === safeId);
    if (!place) return;
    place.coverImageUrl = "";
    actions.patchDestinationEditor({ draft: { ...draft } });
  },
  setLeadDestination(destinationId = "") {
    const context = getLeadDestinationDraftContext();
    if (!context) return;
    const safeId = String(destinationId || "").trim();
    const published = store.getState().destinations?.published?.items || [];
    const selected = published.find((item) => item.id === safeId) || null;
    patchLeadDestinationDraft({
      destinationId: safeId,
      destinationName: selected?.name || "",
      destinationOverrides: normalizeDestinationOverridesCore({})
    });
  },
  toggleLeadDestinationPin(placeId = "") {
    const context = getLeadDestinationDraftContext();
    const safePlaceId = String(placeId || "").trim();
    if (!context || !safePlaceId) return;
    const pinned = context.overrides.pinned.includes(safePlaceId)
      ? context.overrides.pinned.filter((id) => id !== safePlaceId)
      : [...context.overrides.pinned, safePlaceId];
    patchLeadDestinationDraft({
      destinationOverrides: { ...context.overrides, pinned }
    });
  },
  toggleLeadDestinationVisibility(placeId = "") {
    const context = getLeadDestinationDraftContext();
    const safePlaceId = String(placeId || "").trim();
    if (!context || !safePlaceId) return;
    const hidden = context.overrides.hidden.includes(safePlaceId)
      ? context.overrides.hidden.filter((id) => id !== safePlaceId)
      : [...context.overrides.hidden, safePlaceId];
    patchLeadDestinationDraft({
      destinationOverrides: { ...context.overrides, hidden }
    });
  },
  setAnalyticsBusinessQuery(query) {
    actions.patchAnalytics({ businessQuery: String(query || "") });
  },
  async selectAnalyticsBusiness(businessId) {
    const safeId = String(businessId || "").trim();
    const analytics = store.getState().analytics || {};
    const business = (analytics.businesses || []).find((row) => row.id === safeId) || null;
    actions.patchAnalytics({
      selectedBusinessId: safeId,
      selectedBusinessName: business?.name || "",
      model: null,
      status: safeId ? "loading" : "idle",
      error: ""
    });
    if (safeId) await refreshAnalyticsDashboard({ force: true });
  },
  async setAnalyticsRange(rangeKey) {
    const safeKey = String(rangeKey || "7d").trim() || "7d";
    actions.patchAnalytics({ rangeKey: safeKey });
    if (safeKey !== "custom") {
      await refreshAnalyticsDashboard({ force: true });
    }
  },
  async applyAnalyticsCustomRange() {
    const fromInput = document.querySelector("[data-analytics-custom-from]");
    const toInput = document.querySelector("[data-analytics-custom-to]");
    actions.patchAnalytics({
      rangeKey: "custom",
      customFrom: String(fromInput?.value || "").trim(),
      customTo: String(toInput?.value || "").trim()
    });
    await refreshAnalyticsDashboard({ force: true });
  },
  async retryAnalytics() {
    await refreshAnalytics({ force: true });
  },
  async setCrmScope(domainKey, scope) {
    const safeDomainKey = String(domainKey || "").trim();
    const safeScope = String(scope || "").trim();
    if (!safeDomainKey || !safeScope) return;
    actions.setCrmAdminSectionUi(safeDomainKey, { scope: safeScope });
    await loadCrmDomain(safeDomainKey, { scope: safeScope, force: true });
  },
  setCrmQuery(domainKey, query) {
    const focusSnapshot = captureCrmSearchFocus(domainKey);
    actions.setCrmAdminSectionUi(domainKey, { query });
    restoreCrmSearchFocus(focusSnapshot);
  },
  setCrmCategoryFilter(domainKey, categoryFilter) {
    actions.setCrmAdminSectionUi(domainKey, { categoryFilter });
  },
  setCrmStatusFilter(domainKey, statusFilter) {
    actions.setCrmAdminSectionUi(domainKey, { statusFilter });
  },
  async setCrmAdStatus(adId = "", status = "") {
    const safeAdId = String(adId || "").trim();
    const safeStatus = String(status || "").trim();
    if (!safeAdId || !safeStatus) return;
    try {
      const domain = getCrmConsumerDomain("ads");
      if (!domain?.writeReady || typeof domain?.setStatus !== "function") {
        const missing = Array.isArray(domain?.missingWriteDeps) ? domain.missingWriteDeps.join(", ") : "";
        throw new Error(missing ? `Fehlende Ads-Freigabe-Dependency: ${missing}` : "Ads-Freigabe ist nicht bereit.");
      }
      const result = await domain.setStatus(safeAdId, safeStatus);
      if (!actionSucceeded(result)) {
        setToast("Ads", result?.message || "Ad-Status konnte nicht geaendert werden.", "warning");
        return;
      }
      await loadCrmDomain("ads", { force: true });
      setToast("Ads", result?.message || "Ad-Status geaendert.", "success");
    } catch (error) {
      setToast("Ads", error?.message || "Ad-Status konnte nicht geaendert werden.", "danger");
    }
  },
  openCrmEditor({ domainKey = "", itemId = "", mode = "edit" } = {}) {
    actions.setModal({
      kind: "crm-editor",
      crmDomain: domainKey,
      itemId,
      mode,
      draft: {}
    });
    if (String(domainKey || "").trim() === "leads" && mode !== "settings") {
      queueMicrotask(() => loadPublishedDestinations().catch(() => {}));
    }
  },
  toggleCrmLeadActions(open) {
    const modal = getOpenCrmModal();
    if (modal?.crmDomain !== "leads") return;
    const nextOpen = typeof open === "boolean" ? open : !modal?.draft?.actionsOpen;
    actions.setCrmEditorDraft({ actionsOpen: nextOpen });
  },
  async saveCrmLead() {
    await runCrmModalAction({
      domainKey: "leads",
      title: "Lead",
      successMessage: "Lead gespeichert.",
      action: (domain) => domain.save()
    });
  },
  async deleteCrmLead() {
    await runCrmModalAction({
      domainKey: "leads",
      title: "Lead",
      successMessage: "Lead geloescht.",
      action: (domain) => domain.delete()
    });
  },
  async convertCrmLead() {
    const modal = getOpenCrmModal();
    await runCrmModalAction({
      domainKey: "leads",
      reloadDomains: ["leads", "customers"],
      title: "Lead",
      successMessage: "Lead wurde Kunde.",
      action: (domain) => domain.convertToCustomer(modal?.itemId || "")
    });
  },
  async saveCrmLeadSettings() {
    try {
      const domain = getCrmConsumerDomain("leads");
      if (!domain?.writeReady || typeof domain.saveSettings !== "function") {
        const missing = Array.isArray(domain?.missingWriteDeps) ? domain.missingWriteDeps.join(", ") : "";
        throw new Error(missing ? `Fehlende CRM Facade-Dependencies: ${missing}` : "Lead Settings sind nicht bereit.");
      }
      const result = await domain.saveSettings();
      if (!actionSucceeded(result)) {
        if (result?.message) setToast("Lead Settings", result.message, "warning");
        return;
      }
      if (result?.leadSettings && typeof result.leadSettings === "object") {
        actions.patchAuthProfile({ leadSettings: result.leadSettings });
      }
      setToast("Lead Settings", result?.message || "Leads Settings gespeichert.", "success");
    } catch (error) {
      setToast("Lead Settings", error?.message || "Lead Settings konnten nicht gespeichert werden.", "danger");
    }
  },
  async saveCrmCustomer() {
    await runCrmModalAction({
      domainKey: "customers",
      title: "Kunde",
      successMessage: "Kunde gespeichert.",
      action: (domain) => domain.save()
    });
  },
  async moveCrmCustomerToLead() {
    const confirmed = typeof confirm === "function"
      ? confirm("Kunde zurueck zu Leads verschieben?")
      : true;
    if (!confirmed) return;
    const statusInput = document.getElementById("customerStatus");
    if (!statusInput) {
      setToast("Kunde", "Customer Status Feld fehlt.", "danger");
      return;
    }
    statusInput.value = "registered";
    await runCrmModalAction({
      domainKey: "customers",
      reloadDomains: ["customers", "leads"],
      title: "Kunde",
      successMessage: "Kunde wurde zu Leads verschoben.",
      action: (domain) => domain.save()
    });
  },
  async saveCrmStaff() {
    await runCrmModalAction({
      domainKey: "staff",
      title: "Staff",
      successMessage: "CEO Staff gespeichert.",
      action: (domain) => domain.save()
    });
  },
  async deleteCrmStaff() {
    await runCrmModalAction({
      domainKey: "staff",
      title: "Staff",
      successMessage: "CEO Staff geloescht.",
      action: (domain) => domain.remove()
    });
  },
  triggerCrmFile(inputId = "") {
    const safeInputId = String(inputId || "").trim();
    if (!safeInputId) return;
    document.getElementById(safeInputId)?.click?.();
  },
  async handleCrmFileChange(inputId = "", file = null) {
    if (!file) return;
    const safeInputId = String(inputId || "").trim();
    try {
      if (safeInputId === "leadLogoInput") {
        getCrmConsumerDomain("leads")?.setLogoFile?.(file);
        return;
      }
      if (safeInputId === "leadBestSpotLogoInput") {
        getCrmConsumerDomain("leads")?.setBestSpotLogoFile?.(file);
        return;
      }
      if (safeInputId === "leadTitleImageInput") {
        getCrmConsumerDomain("leads")?.setTitleImageFile?.(file);
        return;
      }
      if (safeInputId === "customerLogoInput") {
        getCrmConsumerDomain("customers")?.setLogoFile?.(file);
        return;
      }
      if (safeInputId === "staffAvatarInput") {
        getCrmConsumerDomain("staff")?.setAvatarFile?.(file);
      }
    } catch (error) {
      setToast("Upload", error?.message || "Bild konnte nicht vorbereitet werden.", "danger");
    }
  },
  async copyLeadPitchLink(url = "") {
    const link = String(url || "").trim();
    if (!link) {
      setToast("Link", "Fuer diesen Lead gibt es noch keinen Link.", "danger");
      return;
    }
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(link);
      } else {
        // Aelteres Safari/WebView ohne Clipboard-API.
        const helper = document.createElement("textarea");
        helper.value = link;
        helper.setAttribute("readonly", "");
        helper.style.position = "fixed";
        helper.style.opacity = "0";
        document.body.appendChild(helper);
        helper.select();
        document.execCommand("copy");
        helper.remove();
      }
      setToast("Link kopiert", link, "success");
    } catch (error) {
      setToast("Link", error?.message || "Link konnte nicht kopiert werden.", "danger");
    }
  },
  addCrmLeadLocation() {
    try {
      getCrmConsumerDomain("leads")?.addLocationRow?.();
    } catch (error) {
      setToast("Standort", error?.message || "Standort konnte nicht hinzugefuegt werden.", "danger");
    }
  },
  removeCrmLeadLocation(index) {
    try {
      getCrmConsumerDomain("leads")?.removeLocationRow?.(index);
    } catch (error) {
      setToast("Standort", error?.message || "Standort konnte nicht entfernt werden.", "danger");
    }
  },
  async pickCrmLeadLocation(index) {
    try {
      await getCrmConsumerDomain("leads")?.pickLocation?.(index);
    } catch (error) {
      setToast("Karte", error?.message || "Standort-Picker konnte nicht geoeffnet werden.", "danger");
    }
  },
  async pickCrmStaffLocation() {
    try {
      await getCrmConsumerDomain("staff")?.pickLocation?.();
    } catch (error) {
      setToast("Karte", error?.message || "Standort-Picker konnte nicht geoeffnet werden.", "danger");
    }
  },
  syncCrmLeadDerivedFields,
  syncCrmLeadDraftFromForm,
  refineCrmLeadLocationAddress,
  syncCrmStaffDerivedEmailField,
  syncCrmStaffFormFromDom,
  toggleNav() {
    actions.setNavOpen(!store.getState().shell.navOpen);
  },
  async searchSetupRestaurants(query) {
    await searchSetupRestaurants(query);
  },
  async saveSetup(values) {
    await saveSetup(values);
  },
  async selectSetupRestaurant(payload) {
    await saveSetup({
      ...payload,
      allowLiveMutations: store.getState().setup.data?.allowLiveMutations !== false
    });
  },
  async clearSetupRestaurant() {
    await clearSetupRestaurant();
  },
  async provisionSetupPersonas(value) {
    await provisionSetupPersonas(value);
  },
  async deleteSetupPersona(personaKey) {
    await deleteSetupPersona(personaKey);
  },
  closeModal() {
    actions.closeModal();
  }
};

bindHeartEvents({ root, operations });

// Damit ein Neuladen dort bleibt, wo man war. Vorher wurde die Ansicht beim
// Start aus der Adresse gelesen, beim Wechseln aber nie hineingeschrieben -
// nach jedem Neuladen stand man wieder auf Start. replaceState und nicht
// pushState: Der Zurueck-Knopf soll aus Heart hinausfuehren und nicht erst
// durch jede Ansicht, die man unterwegs geoeffnet hat.
function syncViewInAddress(state) {
  const view = state?.shell?.activeView || "";
  if (!canRestoreHeartView(view)) return;
  const gewuenscht = `#${view}`;
  if (window.location.hash === gewuenscht) return;
  try {
    window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}${gewuenscht}`);
  } catch {
    // Manche Browser mauern beim Umschreiben der Adresse. Das ist kein Grund,
    // die Ansicht nicht zu zeigen.
  }
}

store.subscribe((state) => {
  const priorState = previousState;
  previousState = state;

  renderHeartApp(root, state, getRenderRuntime());
  syncViewInAddress(state);
  if (state.shell.activeView === "analytics") {
    try {
      bindAnalyticsChartInteractions(root);
    } catch {}
  }
  syncViewportSurface(state);

  const authChanged = priorState.auth.status !== state.auth.status
    || priorState.auth.user?.uid !== state.auth.user?.uid
    || priorState.auth.access?.allowed !== state.auth.access?.allowed;
  const authSessionKey = state.auth.status === "authenticated" && state.auth.access?.allowed
    ? `${state.auth.user?.uid || ""}:${state.auth.access?.reason || ""}`
    : "";

  if (!authSessionKey) {
    authBootstrapSessionKey = "";
    return;
  }

  if (authChanged && authSessionKey !== authBootstrapSessionKey) {
    authBootstrapSessionKey = authSessionKey;
    // Start braucht die Landing-Sitzungen und die Leads fuer "Was gibt es
    // Neues". Die offene Ansicht kommt zusaetzlich dran, damit ein Neuladen auf
    // "#analytics" oder "#orte" dort ankommt, wo es hingehoert - und nicht in
    // einer Ansicht, die auf Daten wartet, die keiner angefordert hat.
    queueMicrotask(() => {
      const activeView = store.getState().shell.activeView;
      const views = activeView === "dashboard" ? ["dashboard"] : ["dashboard", activeView];
      Promise.all(views.map((view) => ensureViewData(view))).catch(() => {});
    });
  }
});

renderHeartApp(root, store.getState(), getRenderRuntime());
syncViewInAddress(store.getState());
syncViewportSurface(store.getState());
authController.initialize().catch((error) => {
  actions.setAuthError(error?.message || "Anmeldung konnte nicht vorbereitet werden.");
});
installViewportObservers();
scheduleMotivationTick();

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    const serviceWorkerUrl = new URL("./sw.js?v=2026-08-05-heart-start-v9", import.meta.url);
    navigator.serviceWorker.register(serviceWorkerUrl).catch(() => {});
  });
}

window.addEventListener("beforeunload", () => {
  authController.destroy();
  destroyTimers();
});
