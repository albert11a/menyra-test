import { createHeartGoAdapter } from "./heart-go-adapter.js";
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
  showCachedThenFresh,
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
// Statisch und nicht per import() bei Bedarf: Start zeigt die Landing-Zahlen
// mit, der Adapter wird also bei jedem Boot gebraucht. Nachladen haette nur
// eine weitere Wartezeit vor die erste Anzeige gesetzt.
import {
  loadLandingSessions,
  loadLandingSessionsFromCache,
  setLandingArchived as schreibeLandingAblage,
  setLandingNext as schreibeLandingNext,
  setLandingWaiting as schreibeLandingWaiting,
  setLandingReset as schreibeLandingReset
} from "./heart-landing-adapter.js";
import { landingOpenedSince } from "./heart-landing-render.js";
import { ladeLifeskin, ladeFotos, loescheAlleSitzungen, speichereProdukt, loescheProdukt, gibBerichtFrei, setzeVersand } from "./heart-lifeskin-adapter.js";
import { vorlageLesen, pdfText, stufeAus } from "../../shared/lifeskin-analyse.js";
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
const goAdapter = createHeartGoAdapter({ apiClient });
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
// Wo sich der Umweg ueber den Geraetespeicher lohnt: Leads und Kunden sind die
// Listen, die taeglich geoeffnet werden, und Start zeigt sie mit. Ads liest je
// Lokal zwei weitere Dokumente und Staff ist eine kurze Liste - dort waere der
// zusaetzliche Durchlauf mehr Aufwand als Gewinn.
const CRM_CACHE_FIRST_DOMAINS = new Set(["leads", "customers"]);
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
  const leseArgumente = { limit: readLimit, ...(nextScope ? { scope: nextScope } : {}) };
  const hatSchonZeilen = (section.items || []).length > 0;
  actions.setCrmAdminLoading(key, { scope: nextScope });

  await showCachedThenFresh({
    // Nur Leads und Kunden koennen aus dem Geraetespeicher lesen, nur wenn noch
    // nichts auf dem Schirm steht, und nie beim ausdruecklichen Aktualisieren -
    // wer darauf tippt, will den echten Stand und nicht den von vorhin.
    cached: CRM_CACHE_FIRST_DOMAINS.has(key) && !hatSchonZeilen && !force
      ? async () => {
        const payload = await domain.load({ ...leseArgumente, fromCache: true });
        const zeilen = payload?.rows?.length ? payload.rows : (payload?.items || []);
        return zeilen.length ? payload : null;
      }
      : null,
    fresh: async () => {
      const [payload, buildStatusPayload] = await Promise.all([
        domain.load(leseArgumente),
        key === "staff" ? loadCrmBuildStatus() : Promise.resolve({})
      ]);
      return { ...(payload || {}), ...(buildStatusPayload || {}) };
    },
    onCached: (payload) => actions.setCrmAdminData(key, payload),
    onFresh: (payload) => actions.setCrmAdminData(key, payload),
    onError: (error) => {
      const meldung = error?.message || "CRM/Admin Daten konnten nicht geladen werden.";
      // Steht schon eine Liste da - etwa aus dem Geraetespeicher -, wird sie
      // nicht gegen eine Fehlermeldung getauscht. Gesagt wird es trotzdem.
      if ((store.getState().crmAdmin?.sections?.[key]?.items || []).length) {
        setToast("Aktualisieren", meldung, "warning");
        return;
      }
      actions.setCrmAdminError(key, meldung);
    }
  });
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

async function refreshMnyraGo({ force = false, days = 0 } = {}) {
  const go = store.getState().mnyraGo || {};
  const window = Number(days) > 0 ? Math.trunc(Number(days)) : (Number(go.days) || 30);
  if (!force && go.status === "ready" && Number(go.days) === window) return;
  if (!force && go.status === "loading") return;
  actions.setMnyraGoLoading(window);
  try {
    const data = await goAdapter.loadOverview({ days: window });
    actions.setMnyraGoData(data);
  } catch (error) {
    actions.setMnyraGoError(error?.message || "Die GO-Zahlen konnten nicht geladen werden.");
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
const LANDING_TIMEOUT_TEXT = "Die Verbindung antwortet nicht. Bitte noch einmal aktualisieren.";

// Zwei Wege gleichzeitig: der Geraetespeicher, der sofort antwortet, und der
// Server, der die Wahrheit hat. Was zuerst da ist, wird gezeigt - der Server
// gewinnt aber immer, auch wenn er spaeter kommt. Vorher wurde nur der Server
// gefragt, und der Bereich stand bis zu seiner Antwort auf "wird geladen".
const ladeLandings = createSingleFlight(async () => {
  const hatteSchonEtwas = (store.getState().landing.sessions || []).length > 0;
  if (!hatteSchonEtwas) actions.setLandingLoading();

  await showCachedThenFresh({
    // Steht schon etwas auf dem Schirm, ist der Umweg ueber den Speicher
    // ueberfluessig.
    cached: hatteSchonEtwas
      ? null
      : async () => {
        const ausSpeicher = await loadLandingSessionsFromCache();
        return ausSpeicher.sessions.length ? ausSpeicher : null;
      },
    fresh: () => withDeadline(loadLandingSessions(), LANDING_TIMEOUT_MS, LANDING_TIMEOUT_TEXT),
    onCached: (ausSpeicher) => actions.setLandingData({ ...ausSpeicher, fromCache: true }),
    onFresh: (ausDemNetz) => {
      actions.setLandingData(ausDemNetz);
      raeumeArbeitslistenAuf(ausDemNetz);
    },
    onError: (error) => actions.setLandingError(error?.message || "Landings konnten nicht geladen werden.")
  });
});

// Next und Waiting sind Vorhaben: verschicken, warten. Beide sind in dem
// Moment erledigt, in dem jemand den Link oeffnet - ab da gehoert das Lokal
// unter Aktiv, wo die Zahlen stehen.
//
// Aus der Anzeige faellt es dort schon von selbst heraus (heart-landing-render
// rechnet mit denselben Aufrufen). Hier wird zusaetzlich der Eintrag geloescht,
// damit er nicht ewig mitgelesen wird. Geht das daneben, bleibt es bei der
// Anzeige; ein Fehler ist das fuer niemanden.
//
// Das Archiv bleibt aussen vor: Dort liegt, was jemand von Hand weggelegt hat,
// und weggelegt wird immer nach dem Ansehen.
function raeumeArbeitslistenAuf({ sessions = [], archived = [], next = [], waiting = [] } = {}) {
  if (!next.length && !waiting.length) return;
  const abgelegt = new Set(archived);
  // Je Lokal der letzte Aufruf. Verglichen wird er mit dem Zeitpunkt, an dem
  // der Eintrag in die Arbeitsliste kam - dieselbe Rechnung wie in der Ansicht,
  // damit hier nichts geloescht wird, was dort noch steht.
  const letzterAufruf = new Map();
  sessions.forEach((session) => {
    const id = session.restaurantId;
    if (!id || abgelegt.has(id)) return;
    const wann = String(session.updatedAt || session.startedAt || "");
    if (wann > (letzterAufruf.get(id) || "")) letzterAufruf.set(id, wann);
  });
  if (!letzterAufruf.size) return;

  const faellig = (liste) => liste.filter(
    (eintrag) => landingOpenedSince(eintrag, letzterAufruf.get(eintrag.restaurantId) || "")
  );
  const ausNext = faellig(next);
  const ausWaiting = faellig(waiting);

  if (ausNext.length) {
    actions.dropLandingNextEntries(ausNext.map((eintrag) => eintrag.restaurantId));
    ausNext.forEach((eintrag) => {
      schreibeLandingNext({ restaurantId: eintrag.restaurantId }, false).catch(() => {});
    });
  }
  if (ausWaiting.length) {
    actions.dropLandingWaitingEntries(ausWaiting.map((eintrag) => eintrag.restaurantId));
    ausWaiting.forEach((eintrag) => {
      schreibeLandingWaiting({ restaurantId: eintrag.restaurantId }, false).catch(() => {});
    });
  }
}

async function refreshLanding({ force = false } = {}) {
  const landing = store.getState().landing || {};
  // Aus dem Geraetespeicher gelesen heisst noch nicht fertig: Dann laeuft der
  // Abgleich mit dem Server ohnehin noch oder muss nachgeholt werden.
  if (!force && landing.status === "ready" && landing.loadedFrom === "network") return;
  await ladeLandings();
}

// Lifeskin: erst aus dem Geraetespeicher zeigen, dann den echten Stand holen.
//
// Wie im Landing-Bereich, und aus demselben Grund: Wer den Reiter schon
// einmal offen hatte, sieht seine Zahlen ohne Warten und bekommt Sekunden
// spaeter den aktuellen Stand nachgereicht.
async function ladeLifeskinBereich({ force = false } = {}) {
  const vorher = store.getState().lifeskin || {};
  if (!force && vorher.status === "ready" && vorher.loadedFrom === "network") return;

  if (vorher.status !== "ready") {
    actions.setLifeskinLoading();
    try {
      const ausSpeicher = await ladeLifeskin({ ausSpeicher: true });
      if ((ausSpeicher.sitzungen || []).length) {
        actions.setLifeskinData(ausSpeicher, "cache");
      }
    } catch {
      // Kein Speicher heisst nur: kein Vorsprung. Der Server kommt gleich.
    }
  }

  try {
    const frisch = await ladeLifeskin();
    actions.setLifeskinData(frisch, "network");
  } catch (fehler) {
    // Ein gescheiterter Abgleich darf nicht loeschen, was schon dasteht.
    if (store.getState().lifeskin?.status === "ready") return;
    actions.setLifeskinError(fehler?.message || "");
    // Sichtbar machen, nicht nur in die Ansicht schreiben: Wer den Reiter
    // oeffnet und nichts sieht, haelt Heart fuer kaputt.
    setToast("Lifeskin", fehler?.message || "Die Zahlen konnten nicht geladen werden.", "danger");
  }
}

// Eine einzelne Analyse aufklappen.
//
// Die Fotos kommen erst jetzt, nicht mit der Liste: Sie liegen in einer
// Untersammlung, damit der Reiter beim Oeffnen nicht die Bilder aller
// Sitzungen zieht.
async function oeffneLifeskinSitzung(sitzungId = "") {
  const id = String(sitzungId || "").trim();
  if (!id) return;
  const stand = store.getState().lifeskin || {};
  actions.patchLifeskin({ offen: id });

  // Schon geholt? Dann nichts weiter tun - wer zwischen zwei Analysen hin
  // und her springt, soll nicht jedes Mal warten.
  if (stand.fotos?.[id]) return;

  actions.patchLifeskin({ fotosStatus: "loading" });
  try {
    const bilder = await ladeFotos(id);
    actions.patchLifeskin({
      fotos: { ...(store.getState().lifeskin?.fotos || {}), [id]: bilder },
      fotosStatus: "ready"
    });
  } catch (fehler) {
    actions.patchLifeskin({ fotosStatus: "error" });
    setToast("Lifeskin", fehler?.message || "Die Fotos liessen sich nicht laden.", "danger");
  }
}

// Ein Produkt speichern.
//
// Gelesen wird aus dem Formular, nicht aus dem Zustand: So gibt es keinen
// Zwischenstand, der auseinanderlaufen kann, und kein Neuzeichnen je
// Tastendruck.
function produktAusFormular(vorhandenerId = "") {
  const wert = (name) => String(
    document.querySelector(`[data-produktfeld="${name}"]`)?.value || ""
  ).trim();

  const id = vorhandenerId || wert("id").toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/^-+|-+$/g, "");
  if (!id) throw new Error("Das Produkt braucht eine Kennung.");

  const preis = Number(wert("einzelpreis").replace(",", "."));
  if (!Number.isFinite(preis) || preis <= 0) throw new Error("Der Einzelpreis muss eine Zahl ueber null sein.");

  return {
    id,
    name: wert("name") || id,
    inhalt: wert("inhalt"),
    einzelpreis: preis,
    order: Number(wert("order")) || 1,
    kurztext: { sq: wert("kurztext_sq"), de: wert("kurztext_de") },
    beschreibung: { sq: wert("beschreibung_sq"), de: wert("beschreibung_de") },
    availability: wert("availability") === "hidden" ? "hidden" : "visible",
    photoRef: wert("photoRef"),
    // Einmal je Produkt geschrieben, bei jeder Patientin gefuellt.
    persoenlich: { sq: wert("persoenlich_sq"), de: wert("persoenlich_de") },
    routine: "both"
  };
}

// Ein Produktfoto vom Handy.
//
// Kein Hochladen zu einem Bilddienst, keine Adresse zum Kopieren: Das Bild
// wird im Browser verkleinert und liegt danach im Produkt selbst - derselbe
// Weg wie bei den drei Aufnahmen. Ein Firestore-Dokument darf 1 MiB, ein
// Bild mit 900 Bildpunkten liegt weit darunter.
//
// Der haeufigste Grund, warum jemand ein Produkt nie fertig anlegt, ist
// genau dieser Schritt. Er muss der einfachste sein, den es gibt.
const FOTO_KANTE = 900;

async function produktfotoLesen(datei) {
  if (!datei) throw new Error("Kein Bild gewaehlt.");
  if (!/^image\//.test(datei.type || "")) throw new Error("Das ist kein Bild.");

  const bild = await new Promise((fertig, schief) => {
    const leser = new FileReader();
    leser.onload = () => {
      const el = new Image();
      el.onload = () => fertig(el);
      el.onerror = () => schief(new Error("Das Bild liess sich nicht lesen."));
      el.src = String(leser.result || "");
    };
    leser.onerror = () => schief(new Error("Die Datei liess sich nicht lesen."));
    leser.readAsDataURL(datei);
  });

  const gross = Math.max(bild.width, bild.height) || 1;
  const massstab = Math.min(1, FOTO_KANTE / gross);
  const leinwand = document.createElement("canvas");
  leinwand.width = Math.max(1, Math.round(bild.width * massstab));
  leinwand.height = Math.max(1, Math.round(bild.height * massstab));
  leinwand.getContext("2d").drawImage(bild, 0, 0, leinwand.width, leinwand.height);

  // Dieselbe Leiter wie bei den Aufnahmen: die beste Guete, die noch passt.
  for (const guete of [0.86, 0.78, 0.7, 0.6]) {
    const jpeg = leinwand.toDataURL("image/jpeg", guete);
    if (jpeg.length <= 700000) return jpeg;
  }
  throw new Error("Das Bild ist zu gross. Bitte ein kleineres waehlen.");
}

async function lifeskinProduktfoto(datei) {
  try {
    const jpeg = await produktfotoLesen(datei);
    const feld = document.querySelector('[data-produktfeld="photoRef"]');
    if (feld) feld.value = jpeg;
    const bild = document.querySelector(".heart-lifeskin-fotowahl img");
    if (bild) bild.src = jpeg;
    else {
      // Noch kein Bild da: gleich speichern, damit es sichtbar wird.
      await speichereLifeskinProdukt();
      return;
    }
    setToast("Produkt", "Foto uebernommen. Nicht vergessen zu speichern.", "success");
  } catch (fehler) {
    setToast("Produkt", fehler?.message || "Das Foto liess sich nicht uebernehmen.", "danger");
  }
}

function lifeskinProduktfotoWeg() {
  const feld = document.querySelector('[data-produktfeld="photoRef"]');
  if (feld) feld.value = "";
  const bild = document.querySelector(".heart-lifeskin-fotowahl img");
  if (bild) bild.removeAttribute("src");
  setToast("Produkt", "Foto entfernt. Nicht vergessen zu speichern.", "success");
}

async function speichereLifeskinProdukt() {
  const stand = store.getState().lifeskin || {};
  const offen = stand.produktOffen;
  if (!offen) return;

  let produkt;
  try {
    produkt = produktAusFormular(offen === "__neu" ? "" : offen);
  } catch (fehler) {
    setToast("Produkt", fehler?.message || "Die Angaben sind unvollstaendig.", "danger");
    return;
  }

  actions.patchLifeskin({ produktStatus: "laeuft" });
  try {
    await speichereProdukt(produkt);
    actions.patchLifeskin({ produktStatus: "", produktOffen: "" });
    await ladeLifeskinBereich({ force: true });
    setToast("Produkt", `${produkt.name} gespeichert.`, "success");
  } catch (fehler) {
    actions.patchLifeskin({ produktStatus: "" });
    setToast("Produkt", fehler?.message || "Speichern fehlgeschlagen.", "danger");
  }
}

// Den Befund freigeben.
//
// Gelesen wird direkt aus dem Formular, nicht bei jedem Tastendruck in den
// Zustand geschrieben: Ein Neuzeichnen je Buchstabe wuerde den Schreibfluss
// zerreissen - und geschrieben wird hier laenger als irgendwo sonst in
// Heart.
async function gibLifeskinBerichtFrei(sitzungId) {
  const id = String(sitzungId || "").trim();
  if (!id) return;

  const befund = document.querySelector("#lifeskin-befundtext")?.value.trim() || "";
  if (!befund) {
    setToast("Befund", "Ohne Text gibt es nichts freizugeben.", "danger");
    return;
  }

  const produkte = [];
  for (const kasten of document.querySelectorAll("[data-produkt-wahl]")) {
    if (!kasten.checked) continue;
    const pid = kasten.value;
    const satz = document.querySelector(`[data-produkt-satz="${CSS.escape(pid)}"]`)?.value.trim() || "";
    produkte.push({ id: pid, satz });
  }
  if (!produkte.length) {
    setToast("Befund", "Ohne Produkt gibt es keine Therapie zum Bestellen.", "danger");
    return;
  }

  const preis = Number(document.querySelector("#lifeskin-preis")?.value) || 0;
  if (preis <= 0) {
    setToast("Befund", "Der Setpreis fehlt.", "danger");
    return;
  }

  const schwere = document.querySelector("#lifeskin-schwere")?.value || "";

  // Die acht Messwerte. Leere Felder fallen weg - auf der Patientenseite
  // ist eine kuerzere Liste besser als eine mit erfundenen Zeilen.
  const messwerte = [];
  for (const feld of document.querySelectorAll("[data-mess]")) {
    const wert = feld.value.trim();
    if (!wert) continue;
    messwerte.push({ id: feld.dataset.mess, wert, stufe: stufeAus(wert) });
  }
  const igaRoh = document.querySelector("#lifeskin-iga")?.value;
  const iga = igaRoh === "" || igaRoh === undefined || igaRoh === null ? null : Number(igaRoh);

  actions.patchLifeskin({ berichtStatus: "laeuft" });
  try {
    await gibBerichtFrei(id, { befund, produkte, preis, schwere, analyse: { iga, parameter: messwerte } });
    actions.patchLifeskin({ berichtStatus: "" });
    await ladeLifeskinBereich({ force: true });
    setToast("Befund", "Freigegeben. Der Patient sieht ihn innerhalb einer Minute.", "success");
  } catch (fehler) {
    actions.patchLifeskin({ berichtStatus: "" });
    setToast("Befund", fehler?.message || "Freigabe fehlgeschlagen.", "danger");
  }
}

// Die Vorlage einlesen.
//
// Sie fuellt die Felder - sie schreibt nichts. Was gelesen wurde, steht
// danach zum Aendern da, und erst "Befund freigeben" macht daraus die Seite
// des Patienten. Ein Automat, der ungefragt veroeffentlicht, waere auf
// einem Befund nicht zu verantworten.
async function lifeskinVorlageLesen(datei) {
  const stand = document.querySelector("#lifeskin-vorlage-stand");
  const melde = (text, art = "") => {
    if (!stand) return;
    stand.textContent = text;
    stand.dataset.art = art;
  };
  if (!datei) return;
  melde("Wird gelesen…");

  let text = "";
  try {
    if (/\.pdf$/i.test(datei.name) || datei.type === "application/pdf") {
      text = await pdfText(new Uint8Array(await datei.arrayBuffer()));
    } else {
      text = await datei.text();
    }
  } catch {
    melde("Die Datei liess sich nicht oeffnen.", "fehler");
    return;
  }

  if (!text.trim()) {
    // Ein eingescanntes Blatt enthaelt keinen Text, sondern ein Foto davon.
    // Das ist kein Fehler im Programm, und der Satz sagt auch, was hilft.
    melde("In dieser Datei steht kein Text — vermutlich ein Scan. Bitte die Textvorlage verwenden.", "fehler");
    return;
  }

  const gelesen = vorlageLesen(text);
  const setze = (wahl, wert) => {
    const feld = document.querySelector(wahl);
    if (feld && wert !== "" && wert !== null && wert !== undefined) feld.value = wert;
  };
  setze("#lifeskin-befundtext", gelesen.befund);
  setze("#lifeskin-schwere", gelesen.schwere);
  setze("#lifeskin-iga", gelesen.iga === null ? "" : String(gelesen.iga));
  for (const eintrag of gelesen.parameter) {
    setze(`[data-mess="${CSS.escape(eintrag.id)}"]`, eintrag.wert);
  }

  const teile = [];
  if (gelesen.befund) teile.push("Befund");
  if (gelesen.schwere) teile.push("Schweregrad");
  if (gelesen.iga !== null) teile.push("IGA");
  if (gelesen.parameter.length) teile.push(`${gelesen.parameter.length} Messwerte`);
  melde(
    teile.length
      ? `Uebernommen: ${teile.join(", ")}. Bitte pruefen und dann freigeben.`
      : "Nichts erkannt. Stimmen die Beschriftungen mit der Vorlage ueberein?",
    teile.length ? "gut" : "fehler"
  );
}

async function setzeLifeskinVersand(sitzungId, stand) {
  const id = String(sitzungId || "").trim();
  if (!id || !["versandt", "zugestellt"].includes(stand)) return;

  // Ein Lieferfenster, das der Patient auf seiner Seite sieht. Zwei bis
  // drei Tage ab heute - dieselbe Zusage wie im Angebot.
  const tag = (plus) => {
    const d = new Date();
    d.setDate(d.getDate() + plus);
    return `${String(d.getDate()).padStart(2, "0")}.${String(d.getMonth() + 1).padStart(2, "0")}.`;
  };

  actions.patchLifeskin({ berichtStatus: "laeuft" });
  try {
    await setzeVersand(id, stand === "versandt"
      ? { status: "versandt", lieferVon: tag(2), lieferBis: tag(3) }
      : { status: "zugestellt" });
    actions.patchLifeskin({ berichtStatus: "" });
    await ladeLifeskinBereich({ force: true });
    setToast("Versand", stand === "versandt" ? "Als versendet gemeldet." : "Als zugestellt gemeldet.", "success");
  } catch (fehler) {
    actions.patchLifeskin({ berichtStatus: "" });
    setToast("Versand", fehler?.message || "Nicht gespeichert.", "danger");
  }
}

async function loescheLifeskinProdukt() {
  const stand = store.getState().lifeskin || {};
  const id = stand.produktOffen;
  if (!id || id === "__neu") return;

  actions.patchLifeskin({ produktStatus: "laeuft" });
  try {
    await loescheProdukt(id);
    actions.patchLifeskin({ produktStatus: "", produktOffen: "" });
    await ladeLifeskinBereich({ force: true });
    setToast("Produkt", "Geloescht.", "success");
  } catch (fehler) {
    actions.patchLifeskin({ produktStatus: "" });
    setToast("Produkt", fehler?.message || "Loeschen fehlgeschlagen.", "danger");
  }
}

// Alle Testdaten loeschen.
//
// Zwei Stufen: Der erste Druck fragt, der zweite loescht. Es gibt kein
// Zurueck - Firestore kennt keinen Papierkorb.
async function setzeLifeskinZurueck() {
  const stand = store.getState().lifeskin || {};
  if (!stand.resetGefragt) { actions.patchLifeskin({ resetGefragt: true }); return; }

  actions.patchLifeskin({ resetGefragt: false, resetStatus: "laeuft" });
  try {
    const anzahl = await loescheAlleSitzungen();
    actions.patchLifeskin({ resetStatus: "", offen: "", fotos: {} });
    await ladeLifeskinBereich({ force: true });
    setToast("Lifeskin", `${anzahl} ${anzahl === 1 ? "Analyse" : "Analysen"} geloescht.`, "success");
  } catch (fehler) {
    actions.patchLifeskin({ resetStatus: "" });
    setToast("Lifeskin", fehler?.message || "Loeschen fehlgeschlagen.", "danger");
  }
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
  lifeskin: (options) => ladeLifeskinBereich(options),
  analytics: (options) => refreshAnalytics(options),
  mnyraGo: (options) => refreshMnyraGo(options),
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
  async setMnyraGoRange(days) {
    await refreshMnyraGo({ force: true, days: Number(days) || 30 });
  },
  async reloadMnyraGo() {
    await refreshMnyraGo({ force: true });
  },
  setLandingTab(tab) {
    actions.setLandingTab(tab);
    // Das Suchfeld unter "Next" sucht in den Leads. Sie werden erst geholt,
    // wenn der Reiter das erste Mal offen ist - wer nie dorthin geht, zahlt
    // dafuer auch nichts.
    if (tab === "next") loadCrmDomain("leads").catch(() => {});
  },
  setLandingNextQuery(value) {
    actions.setLandingNextQuery(value);
  },
  // Vormerken: erst in die Liste, dann schreiben. Geht das Schreiben daneben,
  // wird es zurueckgedreht - sonst steht es da und ist beim naechsten Laden weg.
  async addLandingNext(entry = {}) {
    const id = String(entry?.restaurantId || "").trim();
    if (!id) return;
    const eintrag = { ...entry, restaurantId: id, addedAt: new Date().toISOString() };
    actions.setLandingNextEntry(eintrag, true);
    // Das Suchfeld leeren: Was vorgemerkt ist, steht jetzt darunter.
    actions.setLandingNextQuery("");
    try {
      await schreibeLandingNext(eintrag, true);
    } catch (error) {
      actions.setLandingNextEntry(eintrag, false);
      setToast("Next", error?.message || "Konnte nicht vorgemerkt werden.", "danger");
    }
  },
  async removeLandingNext(restaurantId) {
    const id = String(restaurantId || "").trim();
    if (!id) return;
    const vorher = (store.getState().landing?.next || []).find((eintrag) => eintrag.restaurantId === id);
    actions.setLandingNextEntry({ restaurantId: id }, false);
    try {
      await schreibeLandingNext({ restaurantId: id }, false);
    } catch (error) {
      if (vorher) actions.setLandingNextEntry(vorher, true);
      setToast("Next", error?.message || "Konnte nicht entfernt werden.", "danger");
    }
  },
  async removeLandingWaiting(restaurantId) {
    const id = String(restaurantId || "").trim();
    if (!id) return;
    const vorher = (store.getState().landing?.waiting || []).find((eintrag) => eintrag.restaurantId === id);
    actions.setLandingWaitingEntry({ restaurantId: id }, false);
    try {
      await schreibeLandingWaiting({ restaurantId: id }, false);
    } catch (error) {
      if (vorher) actions.setLandingWaitingEntry(vorher, true);
      setToast("Waiting", error?.message || "Konnte nicht entfernt werden.", "danger");
    }
  },
  // Zwischen Next und Waiting hin und her. Beides zusammen ist eine Bewegung,
  // keine zwei: Erst steht der Eintrag in der neuen Liste, dann verschwindet er
  // aus der alten - so ist er nie in keiner von beiden zu sehen. Geht das
  // Schreiben daneben, wird beides zurueckgedreht.
  async moveLandingBoard(entry = {}, ziel = "waiting") {
    const id = String(entry?.restaurantId || "").trim();
    if (!id) return;
    const nachWaiting = ziel === "waiting";
    const eintrag = { ...entry, restaurantId: id, addedAt: new Date().toISOString() };

    if (nachWaiting) {
      actions.setLandingWaitingEntry(eintrag, true);
      actions.setLandingNextEntry({ restaurantId: id }, false);
    } else {
      actions.setLandingNextEntry(eintrag, true);
      actions.setLandingWaitingEntry({ restaurantId: id }, false);
    }

    try {
      await Promise.all([
        schreibeLandingWaiting(nachWaiting ? eintrag : { restaurantId: id }, nachWaiting),
        schreibeLandingNext(nachWaiting ? { restaurantId: id } : eintrag, !nachWaiting)
      ]);
    } catch (error) {
      if (nachWaiting) {
        actions.setLandingWaitingEntry({ restaurantId: id }, false);
        actions.setLandingNextEntry(eintrag, true);
      } else {
        actions.setLandingNextEntry({ restaurantId: id }, false);
        actions.setLandingWaitingEntry(eintrag, true);
      }
      setToast("Waiting", error?.message || "Konnte nicht verschoben werden.", "danger");
    }
  },
  // Zuruecksetzen: ab jetzt wird neu gezaehlt. Gefragt wird vorher - die alten
  // Zahlen sind danach nicht mehr zu sehen, und ein Fehlgriff auf einem Handy
  // ist schnell passiert.
  async resetLanding(entry = {}) {
    const id = String(entry?.restaurantId || "").trim();
    if (!id) return;
    const name = String(entry.name || id);
    const anzahl = Number(entry.total) || 0;
    const frage = anzahl
      ? `Statistiken von ${name} zuruecksetzen? ${anzahl} ${anzahl === 1 ? "Besuch wird" : "Besuche werden"} nicht mehr angezeigt.`
      : `Statistiken von ${name} zuruecksetzen?`;
    if (typeof window !== "undefined" && typeof window.confirm === "function" && !window.confirm(frage)) return;

    const zeitpunkt = new Date().toISOString();
    actions.applyLandingReset(entry, zeitpunkt);
    try {
      await schreibeLandingReset(entry, zeitpunkt);
      setToast("Landing", `${name} zaehlt ab jetzt neu.`, "success");
    } catch (error) {
      setToast("Landing", error?.message || "Konnte nicht zurueckgesetzt werden.", "danger");
      // Der Server weiss nichts davon - dann soll auch der Schirm wieder den
      // echten Stand zeigen und nicht eine Null, die es nirgends gibt.
      await refreshLanding({ force: true });
    }
  },
  // Erst umschalten, dann schreiben. Geht das Schreiben daneben, wird es
  // zurueckgedreht und gesagt, was los ist - sonst sieht es aus, als waere es
  // abgelegt, und beim naechsten Laden ist es wieder da.
  async toggleLandingArchive(restaurantId, archived) {
    const id = String(restaurantId || "").trim();
    if (!id) return;
    actions.setLandingArchived(id, archived);
    try {
      await schreibeLandingAblage(id, archived);
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
  openLifeskinSitzung(sitzungId) { return oeffneLifeskinSitzung(sitzungId); },
  closeLifeskinSitzung() { actions.patchLifeskin({ offen: "" }); },
  lifeskinZuruecksetzen() { return setzeLifeskinZurueck(); },
  lifeskinResetAbbrechen() { actions.patchLifeskin({ resetGefragt: false }); },
  openLifeskinProdukt(id) { actions.patchLifeskin({ produktOffen: String(id || "").trim() }); },
  neuesLifeskinProdukt() { actions.patchLifeskin({ produktOffen: "__neu" }); },
  closeLifeskinProdukt() { actions.patchLifeskin({ produktOffen: "" }); },
  speichereLifeskinProdukt() { return speichereLifeskinProdukt(); },
  lifeskinProduktfoto(datei) { return lifeskinProduktfoto(datei); },
  lifeskinProduktfotoWeg() { lifeskinProduktfotoWeg(); },
  loescheLifeskinProdukt() { return loescheLifeskinProdukt(); },
  gibLifeskinBerichtFrei(id) { return gibLifeskinBerichtFrei(id); },
  lifeskinVorlage(datei) { return lifeskinVorlageLesen(datei); },
  setzeLifeskinVersand(id, stand) { return setzeLifeskinVersand(id, stand); },
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
    const serviceWorkerUrl = new URL("./sw.js?v=2026-08-05-heart-start-v10", import.meta.url);
    navigator.serviceWorker.register(serviceWorkerUrl).catch(() => {});
  });
}

window.addEventListener("beforeunload", () => {
  authController.destroy();
  destroyTimers();
});
