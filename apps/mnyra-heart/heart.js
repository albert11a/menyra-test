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
  resolveHeartRouteView
} from "./heart-route-view-resolver.js";
import {
  createHeartInitialState,
  createHeartStore
} from "./heart-state.js";
import {
  createHeartTestRunnerAdapter
} from "./heart-test-runner-adapter.js";
import {
  getPackLabel
} from "./heart-ui-utils.js";
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
const testRunnerAdapter = createHeartTestRunnerAdapter({ apiClient });
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
const renderRuntime = Object.freeze({
  crmAdminConsumerDeps
});

let toastTimer = null;
let previousState = store.getState();
let authBootstrapSessionKey = "";
let refreshAllPromise = null;
let displayModeQuery = null;
let displayModeCleanup = null;
let runPollingTimer = null;
const notifiedCompletedRunIds = new Set();
const CRM_ADMIN_READ_DOMAINS = Object.freeze([
  { key: "leads", consumerKey: "leads" },
  { key: "customers", consumerKey: "customers" },
  { key: "ads", consumerKey: "ads" },
  { key: "staff", consumerKey: "staff" },
  { key: "businessAccounts", consumerKey: "businessAccounts" }
]);
const CRM_ADMIN_VISIBLE_VIEW_KEYS = new Set(["crmLeads", "crmCustomers", "crmAds", "crmStaff"]);
const CRM_ADMIN_CONSUMER_KEY_BY_DOMAIN = Object.freeze(
  CRM_ADMIN_READ_DOMAINS.reduce((map, item) => ({
    ...map,
    [item.key]: item.consumerKey
  }), {})
);
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
const CRM_ADMIN_DEFAULT_READ_LIMIT = 20;
const CRM_ADMIN_MAX_READ_LIMIT = 160;
const CRM_BUILD_INFO_ENDPOINT_URL = "/api/build-info";

let crmBuildStatusPromise = null;
let crmBuildStatusLoaded = false;
let crmBuildStatusCache = {
  commitShort: "",
  branch: "",
  environment: "",
  buildTimestamp: ""
};

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

function syncViewportSurface(state = store.getState()) {
  const modal = state.shell?.modal || {};
  const leadInlineEditorOpen = modal.kind === "crm-editor" && modal.crmDomain === "leads";
  const staffInlineEditorOpen = modal.kind === "crm-editor" && modal.crmDomain === "staff";
  const lockDocument = !!state.shell?.navOpen || (!!modal.kind && !leadInlineEditorOpen && !staffInlineEditorOpen);
  document.documentElement.style.background = "#000000";
  document.body.style.background = "#000000";
  document.documentElement.style.overscrollBehaviorY = lockDocument ? "none" : "auto";
  document.body.style.overscrollBehaviorY = lockDocument ? "none" : "auto";
  document.documentElement.style.overflowX = "clip";
  document.body.style.overflowX = "clip";
  document.documentElement.style.overflow = lockDocument ? "hidden" : "";
  document.body.style.overflow = lockDocument ? "hidden" : "";
}

function syncStandaloneMode() {
  actions.setStandaloneMode(isStandaloneDisplayMode());
  actions.setMobileNavHidden(false);
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

  window.addEventListener("resize", syncStandaloneMode);
}

function destroyViewportObservers() {
  window.removeEventListener("resize", syncStandaloneMode);
  if (displayModeCleanup) {
    displayModeCleanup();
    displayModeCleanup = null;
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

function isActiveRunStatus(status = "") {
  return ["queued", "running"].includes(String(status || "").trim().toLowerCase());
}

function getActiveRunIds(state = store.getState()) {
  return (state.runs.items || [])
    .filter((item) => isActiveRunStatus(item?.status))
    .map((item) => String(item.id || "").trim())
    .filter(Boolean);
}

function getRefreshFocusRunId(state = store.getState()) {
  return String(
    state.shell.modal?.runId
    || state.runs.selectedRunId
    || state.runs.detail?.id
    || state.runs.items?.[0]?.id
    || ""
  ).trim();
}

function syncRunPolling(state = store.getState()) {
  const shouldPoll = state.auth.status === "authenticated" && getActiveRunIds(state).length > 0;
  if (shouldPoll && !runPollingTimer) {
    queueMicrotask(() => {
      refreshAll({ focusRunId: getRefreshFocusRunId(store.getState()) }).catch(() => {});
    });
    runPollingTimer = window.setInterval(() => {
      refreshAll({ focusRunId: getRefreshFocusRunId(store.getState()) }).catch(() => {});
    }, 3000);
    return;
  }
  if (!shouldPoll && runPollingTimer) {
    clearInterval(runPollingTimer);
    runPollingTimer = null;
  }
}

function notifyCompletedRuns(previous, current) {
  const previousActiveIds = getActiveRunIds(previous);
  const currentActiveIds = new Set(getActiveRunIds(current));
  previousActiveIds
    .filter((runId) => !currentActiveIds.has(runId))
    .forEach((runId) => {
      if (notifiedCompletedRunIds.has(runId)) return;
      const finishedRun = (current.runs.items || []).find((item) => String(item.id || "") === runId);
      if (!finishedRun || isActiveRunStatus(finishedRun.status)) return;
      notifiedCompletedRunIds.add(runId);
      const tone = ["failed", "critical"].includes(String(finishedRun.status || "").toLowerCase())
        ? "danger"
        : String(finishedRun.status || "").toLowerCase() === "warning"
          ? "warning"
          : "success";
      setToast("Run ist fertig", `${findPackLabel(finishedRun.packKey || finishedRun.mode)} ist fertig.`, tone);
    });
}

async function refreshDashboard() {
  actions.setDashboardLoading();
  try {
    const data = await monitoringAdapter.loadDashboard();
    actions.setDashboardData(data);
  } catch (error) {
    actions.setDashboardError(error?.message || "Startansicht konnte nicht geladen werden.");
    setToast("Startansicht", error?.message || "Startansicht konnte nicht geladen werden.", "danger");
  }
}

async function refreshIncidents() {
  actions.setIncidentsLoading();
  try {
    const payload = await monitoringAdapter.loadIncidents();
    actions.setIncidentsData(payload.items);
  } catch (error) {
    actions.setIncidentsError(error?.message || "Meldungen konnten nicht geladen werden.");
  }
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

async function refreshCrmAdmin() {
  let consumer = null;
  try {
    consumer = createCrmAdminConsumer();
  } catch (error) {
    actions.setCrmAdminError("", error?.message || "CRM/Admin Consumer konnte nicht vorbereitet werden.");
    return;
  }

  await Promise.all(CRM_ADMIN_READ_DOMAINS.map(async ({ key, consumerKey }) => {
    const section = store.getState().crmAdmin?.sections?.[key] || {};
    await loadCrmAdminDomainFromConsumer(consumer, key, {
      consumerKey,
      scope: section.scope || ""
    });
  }));
}

async function loadCrmAdminDomainFromConsumer(consumer, domainKey = "", options = {}) {
  const safeDomainKey = String(domainKey || "").trim();
  const consumerKey = String(options.consumerKey || CRM_ADMIN_CONSUMER_KEY_BY_DOMAIN[safeDomainKey] || "").trim();
  if (!safeDomainKey || !consumerKey) return;
  const domain = consumer?.[consumerKey] || null;
  if (!domain?.ready || typeof domain?.load !== "function") {
    actions.setCrmAdminMissing(safeDomainKey, domain?.missingDeps || []);
    return;
  }
  const scope = String(options.scope || "").trim();
  const readLimit = resolveCrmReadLimit(safeDomainKey, scope, options);
  actions.setCrmAdminLoading(safeDomainKey, { scope });
  try {
    const [payload, buildStatusPayload] = await Promise.all([
      domain.load({
        limit: readLimit,
        ...(scope ? { scope } : {})
      }),
      safeDomainKey === "staff" ? loadCrmBuildStatus() : Promise.resolve({})
    ]);
    actions.setCrmAdminData(safeDomainKey, {
      ...(payload || {}),
      ...(buildStatusPayload || {})
    });
  } catch (error) {
    actions.setCrmAdminError(safeDomainKey, error?.message || "CRM/Admin Daten konnten nicht geladen werden.");
  }
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

async function loadCrmAdminDomain(domainKey = "", options = {}) {
  let consumer = null;
  try {
    consumer = createCrmAdminConsumer();
  } catch (error) {
    actions.setCrmAdminError("", error?.message || "CRM/Admin Consumer konnte nicht vorbereitet werden.");
    return;
  }
  await loadCrmAdminDomainFromConsumer(consumer, domainKey, options);
}

function createCrmAdminConsumer({ syncContract = true } = {}) {
  const consumer = createHeartCrmAdminShellConsumer(crmAdminConsumerDeps);
  if (syncContract) {
    actions.setCrmAdminContract(consumer.contract || {});
  }
  return consumer;
}

function getOpenCrmModal() {
  const modal = store.getState().shell?.modal || {};
  return modal.kind === "crm-editor" ? modal : null;
}

function getCrmConsumerDomain(domainKey = "") {
  const safeDomainKey = String(domainKey || "").trim();
  const consumerKey = CRM_ADMIN_CONSUMER_KEY_BY_DOMAIN[safeDomainKey] || safeDomainKey;
  const consumer = createCrmAdminConsumer({ syncContract: false });
  return consumer?.[consumerKey] || null;
}

function actionSucceeded(result) {
  if (result === false) return false;
  if (result && typeof result === "object" && result.ok === false) return false;
  return true;
}

async function runCrmModalAction({
  domainKey = "",
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
    await refreshCrmAdmin();
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

async function refreshDestinations() {
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

async function ensureRunDetail(runId = "") {
  const safeRunId = String(runId || "").trim();
  if (!safeRunId) return;
  actions.setSelectedRun(safeRunId);
  actions.setRunDetailLoading();
  try {
    const detail = await testRunnerAdapter.loadRunDetail(safeRunId);
    actions.setRunDetailData(detail);
  } catch (error) {
    actions.setRunDetailError(error?.message || "Laufdetails konnten nicht geladen werden.");
  }
}

async function refreshRuns({ focusRunId = "" } = {}) {
  actions.setRunsLoading();
  try {
    const payload = await testRunnerAdapter.loadRuns();
    actions.setRunsData(payload.items);
    const currentState = store.getState();
    const selected = focusRunId || currentState.runs.selectedRunId || payload.items?.[0]?.id || "";
    if (selected) {
      await ensureRunDetail(selected);
    }
  } catch (error) {
    actions.setRunsError(error?.message || "Verlauf konnte nicht geladen werden.");
  }
}

async function refreshAll({ focusRunId = "" } = {}) {
  if (refreshAllPromise) return refreshAllPromise;
  refreshAllPromise = (async () => {
    try {
      await Promise.all([
        refreshDashboard(),
        refreshIncidents(),
        refreshConnections(),
        refreshSetup(),
        refreshRuns({ focusRunId })
      ]);
      actions.setBootReady(new Date().toISOString());
    } finally {
      refreshAllPromise = null;
    }
  })();
  return refreshAllPromise;
}

function findPackLabel(packKey = "") {
  const quickActions = store.getState().dashboard.data?.quickActions || [];
  const match = quickActions.find((item) => String(item.packKey || item.id) === String(packKey));
  return getPackLabel(packKey, String(match?.label || match?.id || packKey || "Testlauf").replace(/^Start\s+/i, ""), match?.mode);
}

async function startRun(packKey = "smoke") {
  const label = findPackLabel(packKey);
  actions.setActiveView("runs");
  actions.closeModal();
  actions.setRunsLauncherExpanded(false);
  actions.setRunDetailExpanded(false);
  actions.setPendingRunAction(packKey);
  try {
    const payload = await testRunnerAdapter.startPackRun(packKey);
    setToast(`${label}`, `${label} wurde an den sicheren Runner uebergeben.`, "success");
    await refreshAll({ focusRunId: payload?.run?.id || "" });
  } catch (error) {
    if (String(error?.message || "").includes("GitHub Actions integration is not configured")) {
      actions.setActiveView("connections");
    }
    setToast("Teststart fehlgeschlagen", error?.message || "Der Lauf konnte nicht gestartet werden.", "danger");
  } finally {
    actions.setPendingRunAction("");
  }
}

async function cancelRun(runId = "") {
  const safeRunId = String(runId || "").trim();
  if (!safeRunId) return;
  actions.setPendingRunAction("cancel");
  try {
    await testRunnerAdapter.cancelRun(safeRunId);
    setToast("Abbruch angefragt", "Heart hat den Runner gebeten, den Lauf zu stoppen.", "warning");
    await refreshAll({ focusRunId: safeRunId });
  } catch (error) {
    setToast("Abbruch fehlgeschlagen", error?.message || "Der Lauf konnte nicht gestoppt werden.", "danger");
  } finally {
    actions.setPendingRunAction("");
  }
}

async function updateRunArchive(archived = true) {
  const state = store.getState();
  const runIds = Array.isArray(state.runs.historySelectedRunIds) ? state.runs.historySelectedRunIds : [];
  if (!runIds.length) return;
  actions.setPendingRunAction(archived ? "archive" : "restore");
  try {
    await testRunnerAdapter.updateRunArchive(runIds, archived);
    actions.setRunsHistoryEditMode(false);
    actions.clearRunsHistorySelection();
    setToast(
      archived ? "Laeufe archiviert" : "Laeufe verschoben",
      archived ? "Die ausgewaehlten Laeufe wurden archiviert." : "Die ausgewaehlten Laeufe sind wieder aktuell.",
      "success"
    );
    await refreshRuns({ focusRunId: state.runs.selectedRunId });
  } catch (error) {
    setToast("Verlauf", error?.message || "Die Laeufe konnten nicht verschoben werden.", "danger");
  } finally {
    actions.setPendingRunAction("");
  }
}

async function deleteRunArtifact(runId = "", artifactId = "") {
  const safeRunId = String(runId || "").trim();
  const safeArtifactId = String(artifactId || "").trim();
  if (!safeRunId || !safeArtifactId) return;
  try {
    const payload = await testRunnerAdapter.deleteRunArtifact(safeRunId, safeArtifactId);
    if (payload?.run?.id && String(payload.run.id) === safeRunId) {
      actions.setRunDetailData(payload.run);
    }
    setToast("Nachweis geloescht", "Der ausgewaehlte Nachweis wurde sauber entfernt.", "warning");
    await Promise.all([
      refreshRuns({ focusRunId: safeRunId }),
      refreshIncidents()
    ]);
  } catch (error) {
    setToast("Nachweis", error?.message || "Der Nachweis konnte nicht geloescht werden.", "danger");
  }
}

async function deleteRunArtifacts(runId = "") {
  const safeRunId = String(runId || "").trim();
  if (!safeRunId) return;
  try {
    let detail = store.getState().runs.detail;
    if (!detail || String(detail.id || "") !== safeRunId) {
      detail = await testRunnerAdapter.loadRunDetail(safeRunId).catch(() => null);
    }
    const artifactIds = Array.isArray(detail?.artifacts)
      ? detail.artifacts.filter((artifact) => artifact?.deletable).map((artifact) => String(artifact.id || "").trim()).filter(Boolean)
      : [];
    if (!artifactIds.length) {
      setToast("Nachweise", "Zu diesem Run sind keine loeschbaren Nachweise vorhanden.", "neutral");
      return;
    }
    for (const artifactId of artifactIds) {
      await testRunnerAdapter.deleteRunArtifact(safeRunId, artifactId);
    }
    setToast("Nachweise geloescht", "Die loeschbaren Nachweise dieses Runs wurden entfernt.", "warning");
    await Promise.all([
      refreshRuns({ focusRunId: safeRunId }),
      refreshIncidents()
    ]);
  } catch (error) {
    setToast("Nachweise", error?.message || "Die Nachweise konnten nicht geloescht werden.", "danger");
  }
}

async function deleteIncident(incidentId = "") {
  const safeIncidentId = String(incidentId || "").trim();
  if (!safeIncidentId) return;
  try {
    await monitoringAdapter.deleteIncident(safeIncidentId);
    setToast("Meldung geloescht", "Die Meldung wurde entfernt.", "warning");
    await Promise.all([
      refreshIncidents(),
      refreshDashboard()
    ]);
  } catch (error) {
    setToast("Meldung", error?.message || "Die Meldung konnte nicht geloescht werden.", "danger");
  }
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
    if (store.getState().auth.status === "authenticated") {
      if (store.getState().shell.activeView === "analytics") {
        await refreshAnalyticsBusinesses({ force: true });
        await refreshAnalyticsDashboard({ force: true });
        return;
      }
      if (CRM_ADMIN_VISIBLE_VIEW_KEYS.has(store.getState().shell.activeView)) {
        await refreshCrmAdmin();
        return;
      }
      await refreshAll({ focusRunId: store.getState().runs.selectedRunId });
    }
  },
  async startSmoke() {
    await startRun("smoke");
  },
  async startSynthetic() {
    await startRun("full-platform-pack");
  },
  async startPack(packKey) {
    await startRun(packKey);
  },
  async startPackFromGuide(packKey) {
    await startRun(packKey);
  },
  async openRun(runId) {
    actions.setActiveView("runs");
    actions.setSelectedRun(runId);
    actions.setRunDetailLoading();
    actions.setModal({ kind: "run-detail", runId });
    await ensureRunDetail(runId);
  },
  async openRunDetail(runId) {
    actions.setActiveView("runs");
    actions.setSelectedRun(runId);
    actions.setRunDetailLoading();
    actions.setModal({ kind: "run-detail", runId });
    await ensureRunDetail(runId);
  },
  async cancelRun(runId) {
    await cancelRun(runId);
  },
  openView(viewKey) {
    actions.setActiveView(viewKey);
    if (CRM_ADMIN_VISIBLE_VIEW_KEYS.has(String(viewKey || "").trim())) {
      queueMicrotask(() => refreshCrmAdmin().catch((error) => {
        setToast("CRM/Admin", error?.message || "CRM/Admin Daten konnten nicht geladen werden.", "danger");
      }));
    }
    if (String(viewKey || "").trim() === "analytics") {
      queueMicrotask(() => refreshAnalyticsBusinesses().catch(() => {}));
    }
    if (String(viewKey || "").trim() === "destinations") {
      queueMicrotask(() => refreshDestinations().catch(() => {}));
    }
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
      await refreshDestinations();
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
      await refreshDestinations();
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
      await refreshDestinations();
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
    const analytics = store.getState().analytics || {};
    if (analytics.businessesStatus === "error") {
      await refreshAnalyticsBusinesses({ force: true });
      return;
    }
    await refreshAnalyticsDashboard({ force: true });
  },
  async setCrmScope(domainKey, scope) {
    const safeDomainKey = String(domainKey || "").trim();
    const safeScope = String(scope || "").trim();
    if (!safeDomainKey || !safeScope) return;
    actions.setCrmAdminSectionUi(safeDomainKey, { scope: safeScope });
    await loadCrmAdminDomain(safeDomainKey, { scope: safeScope });
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
      await loadCrmAdminDomain("ads", { scope: "" });
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
  toggleQuickActions() {
    actions.setQuickActionsOpen(!store.getState().shell.quickActionsOpen);
  },
  toggleRunLauncher() {
    actions.setRunsLauncherExpanded(!store.getState().runs.launcherExpanded);
  },
  openRunGuide(packKey) {
    actions.setRunsLauncherExpanded(true);
    actions.setModal({ kind: "run-guide", packKey });
  },
  toggleRunDetailMore() {
    actions.setRunDetailExpanded(!store.getState().runs.detailExpanded);
  },
  setRunsHistoryTab(tabKey) {
    actions.setRunsHistoryTab(tabKey);
  },
  toggleRunsHistoryEdit() {
    actions.setRunsHistoryEditMode(!store.getState().runs.historyEditMode);
  },
  toggleRunsHistorySelection(runId) {
    actions.toggleRunsHistorySelection(runId);
  },
  async updateRunArchive(archiveState) {
    await updateRunArchive(String(archiveState || "archived") !== "current");
  },
  async deleteRunArtifact(runId, artifactId) {
    await deleteRunArtifact(runId, artifactId);
  },
  async deleteRunArtifacts(runId) {
    await deleteRunArtifacts(runId);
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
  },
  async deleteIncident(incidentId) {
    await deleteIncident(incidentId);
  },
  setIncidentFilter(key, value) {
    actions.setIncidentFilter(key, value);
  }
};

bindHeartEvents({ root, operations });

store.subscribe((state) => {
  const priorState = previousState;
  previousState = state;

  renderHeartApp(root, state, renderRuntime);
  if (state.shell.activeView === "analytics") {
    try {
      bindAnalyticsChartInteractions(root);
    } catch {}
  }
  syncViewportSurface(state);
  syncRunPolling(state);

  notifyCompletedRuns(priorState, state);

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
    queueMicrotask(() => {
      const shouldRefreshCrmAdmin = CRM_ADMIN_VISIBLE_VIEW_KEYS.has(store.getState().shell.activeView);
      const refreshPromise = shouldRefreshCrmAdmin
        ? Promise.all([refreshAll(), refreshCrmAdmin()])
        : refreshAll();
      refreshPromise.catch((error) => {
        setToast("Erster Abruf", error?.message || "Heart konnte den ersten Status nicht laden.", "danger");
      });
    });
  }
});

renderHeartApp(root, store.getState(), renderRuntime);
syncViewportSurface(store.getState());
authController.initialize().catch((error) => {
  actions.setAuthError(error?.message || "Anmeldung konnte nicht vorbereitet werden.");
});
installViewportObservers();

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    const serviceWorkerUrl = new URL("./sw.js?v=2026-07-09-heart-shell-v8", import.meta.url);
    navigator.serviceWorker.register(serviceWorkerUrl).catch(() => {});
  });
}

window.addEventListener("beforeunload", () => {
  authController.destroy();
  destroyViewportObservers();
  if (runPollingTimer) {
    clearInterval(runPollingTimer);
    runPollingTimer = null;
  }
});
