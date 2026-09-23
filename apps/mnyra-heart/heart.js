import { pruefeRaportV3, reportToWire } from "../../shared/lifeskin-raport-v3.js";
import { shitjaLesen } from "../../shared/lifeskin-shitja.js";
// Was in die Promptvorlage eingesetzt wird - Name, Altersgruppe und die
// Fragen samt Antworten, wortgleich wie im Trichter.
import { promptV8Fuellen } from "./heart-lifeskin-prompt.js";
import { meldeGeraetAn } from "./heart-push.js";
import { kannPush } from "./heart-push-utils.js";
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
import { ladeLifeskin, horcheLive, ladeFotos, ladeErstesFoto, loescheAlleSitzungen, loescheSitzung, setzeBerichtMarke, speichereProdukt, loescheProdukt, gibBerichtFrei, setzeVersand, speichereAnbieter,
  ladeLandingFotot, speichereLandingFotot, LANDING_FOTOT_MAX,
  speichereRaste, ladeRastiBilder, speichereRastiBilder, loescheRastiBilder } from "./heart-lifeskin-adapter.js";
import { rasteListe, klappSetzen, rastiDom } from "./heart-lifeskin-raste.js";
import { entwurfSchreiben, entwurfLoeschen, entwurfAusBogen } from "./heart-lifeskin-entwurf.js";
import { vorschauAuffrischen } from "./heart-lifeskin-vorschau.js";
import { rasteNormalisieren, rastiNormalisieren, neueRastiId, RASTI_PRODUKTE_MAX } from "../../shared/lifeskin-raste.js";
import { aktualisiereLifeskinSitzungen } from "./heart-lifeskin-berechnung.js";
import { baueLive } from "./heart-lifeskin-live.js";
import { jsonLesen, raportLesen, siehtNachJson } from "../../shared/lifeskin-analyse.js";
// Wie viele Messwerte der Bogen fasst. Aus dem Bogen selbst, nicht als
// zweite Zahl daneben: Zwei Zahlen an zwei Stellen sind frueher oder
// spaeter zwei verschiedene, und dann faellt beim Lesen ab dem sechsten
// Wert alles weg, was der Bogen anzeigt.
import { RAPORT_MESSWERTE, shitjaAusFeldern, shitjaInFelder } from "./heart-lifeskin-render.js";
// Die Bruecke von seinem Befund zu diesem Mittel. Dasselbe Modul, das die
// Patientenseite benutzt - eine zweite Rechnung hier waere eine zweite
// Wahrheit, und die erste Abweichung faellt niemandem auf.
import { baueTerapi, ausAnalyse } from "../../shared/lifeskin-terapia.js";
import { ohneSeite } from "../../shared/lifeskin-ohne-seite.js";
import { findeSitzung } from "./heart-lifeskin-berechnung.js";
import { preisFuer, preisFuerFall, istPreisVorschlag } from "../../shared/lifeskin-preise.js";
import { texteSaeubern } from "../lifeskin-astra/astra-texte-plan.js";
import { STANDARD_PRODUKTE } from "../lifeskin/lifeskin-catalog.js";
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
// Ohne ausdrueckliche Ansicht in der Adresse oeffnet Heart mit Lifeskin -
// das ist der Bereich, der jeden Tag gebraucht wird.
actions.setActiveView(initialRouteView || "lifeskin");
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
// DIE LIVE-REIHE, und zwar wirklich live.
//
// Zwei Dinge halten sie in Bewegung, und beide sind noetig:
//
//   DER ZUHOERER  Firestore schickt jede Aenderung von selbst. Tippt
//                 jemand auf die Kamera, leuchtet der Punkt im selben
//                 Augenblick - ohne Neuladen, ohne Nachfragen.
//   DER TAKT      Was NICHT von selbst kommt, ist das Verschwinden: Wer
//                 aufhoert, schreibt nichts mehr. Ohne eigenen Takt bliebe
//                 sein Punkt stehen, bis irgendwann irgendwer etwas
//                 anderes tut. Also wird die Reihe jede Sekunde neu
//                 gerechnet - aus denselben Daten, nur mit neuer Uhrzeit.
//
// Gerechnet wird also oft, geladen aber nur, wenn sich wirklich etwas
// aendert. Der Takt kostet nichts: Er rechnet ueber hoechstens dreihundert
// Sitzungen im Speicher.
let liveAbmelden = null;
let liveTakt = null;
let liveSitzungen = [];

function liveRechnen() {
  const jetzt = Date.now();
  const stand = baueLive(liveSitzungen, jetzt, undefined, store.getState().lifeskin?.berichte || {});
  const vorher = store.getState().lifeskin?.live;
  // Nur schreiben, wenn sich etwas geaendert hat: Ein Zustandswechsel je
  // Sekunde zeichnet den ganzen Bereich neu, auch wenn dieselben Zahlen
  // dastehen - und ein Bildschirm, der jede Sekunde flackert, ist nicht
  // zu gebrauchen.
  const gleich = vorher
    && vorher.analysen?.gesamt === stand.analysen.gesamt
    && vorher.bestellungen?.gesamt === stand.bestellungen.gesamt
    && vorher.analysen?.punkte?.every((p, i) => p.anzahl === stand.analysen.punkte[i].anzahl)
    && vorher.bestellungen?.punkte?.every((p, i) => p.anzahl === stand.bestellungen.punkte[i].anzahl);
  if (gleich) return;
  actions.patchLifeskin({ live: stand });
}

function liveStarten() {
  if (liveAbmelden) return;
  liveAbmelden = horcheLive((sitzungen) => {
    liveSitzungen = Array.isArray(sitzungen) ? sitzungen : [];
    const zustand = store.getState().lifeskin || {};
    actions.patchLifeskin({ liveFehler: sitzungen === null });
    if (Array.isArray(sitzungen) && zustand.status === "ready") {
      actions.patchLifeskin(aktualisiereLifeskinSitzungen(zustand, sitzungen));
    }
    liveRechnen();
  });
  liveTakt = globalThis.setInterval(liveRechnen, 1000);
}

// Beim Verlassen des Bereichs abmelden. Ein Zuhoerer, der weiterlaeuft,
// kostet bei jeder Aenderung eine Leseoperation - fuer eine Ansicht, die
// niemand sieht.
export function liveAnhalten() {
  if (liveAbmelden) { try { liveAbmelden(); } catch { /* egal */ } liveAbmelden = null; }
  if (liveTakt) { globalThis.clearInterval(liveTakt); liveTakt = null; }
  liveSitzungen = [];
}

async function ladeLifeskinBereich({ force = false } = {}) {
  liveStarten();
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
    Object.assign(frisch, aktualisiereLifeskinSitzungen(frisch, liveSitzungen));
    actions.setLifeskinData(frisch, "network");
    liveRechnen();
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

// DIE VORSCHAUBILDER DER LISTE.
//
// Links in jeder Zeile steht das erste Foto des Patienten. Es kommt NICHT
// mit der Liste: Eine Aufnahme wiegt rund zweihundert Kilobyte, vierzig
// Zeilen waeren acht Megabyte bei jedem Oeffnen des Reiters - ueber
// Mobilfunk eine gefuehlte Ewigkeit fuer Bilder, die zum groessten Teil
// niemand ansieht.
//
// Deshalb: geholt wird, was ins Bild scrollt, und zwar je Sitzung genau ein
// Dokument. Danach wird es auf 160 Punkte verkleinert und erst dann
// gemerkt - im Zustand liegen ein paar Kilobyte je Zeile statt ein paar
// hundert, und Heart zeichnet den Reiter oft neu.
const VORSCHAU_KANTE = 160;
const VORSCHAU_SAMMELN_MS = 60;
const VORSCHAU_GLEICHZEITIG = 3;

let vorschauBeobachter = null;
const vorschauWartet = new Set();
const vorschauUnterwegs = new Set();
let vorschauTakt = 0;

async function bildVerkleinern(jpeg, kante = VORSCHAU_KANTE) {
  const bild = await new Promise((fertig, schief) => {
    const el = new Image();
    el.onload = () => fertig(el);
    el.onerror = () => schief(new Error("Das Bild liess sich nicht lesen."));
    el.src = jpeg;
  });
  // Mittig quadratisch schneiden: Die Aufnahme ist hochkant, das Gesicht
  // sitzt im Ring in der Mitte. Ein rundes Feld aus einem hochkanten Bild
  // ohne Schnitt zeigt sonst Stirn und Kinn und nichts dazwischen.
  const kurz = Math.min(bild.width || 0, bild.height || 0);
  if (!kurz) throw new Error("Das Bild ist leer.");
  const leinwand = document.createElement("canvas");
  leinwand.width = kante;
  leinwand.height = kante;
  leinwand.getContext("2d").drawImage(
    bild,
    Math.round((bild.width - kurz) / 2), Math.round((bild.height - kurz) / 2), kurz, kurz,
    0, 0, kante, kante
  );
  return leinwand.toDataURL("image/jpeg", 0.72);
}

async function vorschauHolen() {
  const offen = [...vorschauWartet];
  vorschauWartet.clear();
  const stand = store.getState().lifeskin || {};
  const zuHolen = offen.filter((id) => id && !(stand.vorschau || {})[id] && !vorschauUnterwegs.has(id));
  if (!zuHolen.length) return;
  for (const id of zuHolen) vorschauUnterwegs.add(id);

  // In kleinen Schueben, nicht alle auf einmal: Vierzig gleichzeitige
  // Abfragen bremsen jede andere, die Heart in dem Moment sonst noch macht.
  const gefunden = {};
  for (let i = 0; i < zuHolen.length; i += VORSCHAU_GLEICHZEITIG) {
    const schub = zuHolen.slice(i, i + VORSCHAU_GLEICHZEITIG);
    await Promise.all(schub.map(async (id) => {
      try {
        const jpeg = await ladeErstesFoto(id);
        // Auch ein leeres Ergebnis wird gemerkt. Sonst fragt die Zeile bei
        // jedem Scrollen wieder nach einem Bild, das es nicht gibt.
        gefunden[id] = jpeg ? await bildVerkleinern(jpeg) : "";
      } catch {
        gefunden[id] = "";
      } finally {
        vorschauUnterwegs.delete(id);
      }
    }));
  }
  actions.patchLifeskin({
    vorschau: { ...(store.getState().lifeskin?.vorschau || {}), ...gefunden }
  });
}

function vorschauMerken(id) {
  if (!id) return;
  vorschauWartet.add(id);
  // Sammeln statt sofort holen: Beim Scrollen kommen zehn Zeilen innerhalb
  // eines Wimpernschlags ins Bild, und jede einzelne loeste sonst ein
  // eigenes Neuzeichnen aus.
  clearTimeout(vorschauTakt);
  vorschauTakt = setTimeout(() => { vorschauHolen().catch(() => {}); }, VORSCHAU_SAMMELN_MS);
}

// Nach jedem Zeichnen neu einhaengen: Heart schreibt den ganzen Bereich neu,
// die alten Knoten gibt es danach nicht mehr. disconnect zuerst, sonst haelt
// der Beobachter jede Zeile fest, die je gezeichnet wurde.
function beobachteLifeskinVorschau(wurzel) {
  const felder = wurzel?.querySelectorAll?.("[data-vorschau]");
  if (!felder) return;
  if (!("IntersectionObserver" in window)) {
    // Ohne Beobachter die ersten paar Zeilen holen - besser als eine Liste
    // ganz ohne Gesichter.
    for (const feld of [...felder].slice(0, 8)) vorschauMerken(feld.getAttribute("data-vorschau"));
    return;
  }
  if (vorschauBeobachter) vorschauBeobachter.disconnect();
  else {
    vorschauBeobachter = new IntersectionObserver((eintraege) => {
      for (const eintrag of eintraege) {
        if (!eintrag.isIntersecting) continue;
        vorschauBeobachter.unobserve(eintrag.target);
        vorschauMerken(eintrag.target.getAttribute("data-vorschau"));
      }
    }, { rootMargin: "300px 0px" });
  }
  for (const feld of felder) vorschauBeobachter.observe(feld);
}

// DIE MARKIERUNG AM FELD: steht hier etwas, oder steht hier nichts?
//
// Sie beantwortet beim Durchsehen die eine Frage, die man wirklich hat -
// was hat das JSON gefuellt und was ist leer geblieben, welcher Text ist
// eigener und welcher der Standard. Gezeichnet wird sie aus dem
// gespeicherten Befund; hier wird sie nachgefuehrt, denn danach lebt der
// Bogen im DOM: nach dem Uebernehmen, nach jedem Tastendruck.
function lifeskinMarkenAuffrischen(wurzel = document) {
  for (const marke of wurzel.querySelectorAll("[data-fuellung-fuer]")) {
    const [art, schluessel] = String(marke.dataset.fuellungFuer || "").split(":");
    if (!schluessel) continue;
    const feld = document.querySelector(art === "text"
      ? `[data-text="${CSS.escape(schluessel)}"]`
      : `[data-raport="${CSS.escape(schluessel)}"]`);
    const voll = Boolean(String(feld?.value ?? "").trim());
    marke.dataset.voll = voll ? "ja" : "nein";
    marke.textContent = art === "text"
      ? (voll ? "eigener Text" : "Standard")
      : (voll ? "gefuellt" : "leer");
  }
}

// Den Link der Patientenseite in die Zwischenablage.
//
// Er wird nicht abgetippt: Er traegt eine zweiunddreissigstellige Kennung,
// und ein Tippfehler darin fuehrt auf "Diese Analyse wurde nicht gefunden".
// Irgendetwas Kurzes in die Zwischenablage - Fallnummer oder Telefon.
//
// Beides wird direkt nach dem Freigeben gebraucht: die Nummer zum
// Anrufen, die Fallnummer, um sie in die Nachricht zu setzen. Abtippen
// ist der Weg, auf dem eine Ziffer verrutscht, und eine falsche Nummer
// ist dasselbe wie keine.
//
// Schlaegt die Zwischenablage fehl - in manchen Webansichten gibt es sie
// nicht -, steht der Wert im Hinweis und laesst sich von dort nehmen.
async function lifeskinTextKopieren(wert, was) {
  const text = String(wert || "").trim();
  if (!text) return;
  const titel = String(was || "Kopiert");
  try {
    await navigator.clipboard.writeText(text);
    setToast(titel, `${text} kopiert.`, "success");
  } catch {
    setToast(titel, text, "neutral");
  }
}

async function lifeskinLinkKopieren(sitzungId) {
  const id = String(sitzungId || "").trim();
  if (!id) return;
  const link = `${globalThis.location?.origin || "https://mnyra.com"}/analiza/${id}`;
  try {
    await navigator.clipboard.writeText(link);
    setToast("Seite", "Link kopiert.", "success");
  } catch {
    setToast("Seite", link, "neutral");
  }
}

// Ein Produkt speichern.
//
// Gelesen wird aus dem Formular, nicht aus dem Zustand: So gibt es keinen
// Zwischenstand, der auseinanderlaufen kann, und kein Neuzeichnen je
// Tastendruck.
function zeilen(text) {
  // Drei, nicht vier: Drei Gruende lesen sich als Auswahl, ab vier wie
  // eine Merkmalsliste am Produkt.
  return String(text || "").split("\n").map((z) => z.trim()).filter(Boolean).slice(0, 3);
}

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
    // Was das Mittel TUT. Es traegt auf der Patientenseite die Bruecke
    // zwischen seinem Befund und dieser Flasche - ohne sie beweist die
    // Seite ein Problem und zeigt dann ein Produkt, ohne zu sagen warum.
    // Eine Zeile je Wirkung, hoechstens drei.
    veprimi: {
      sq: zeilen(wert("veprimi_sq")),
      de: zeilen(wert("veprimi_de"))
    },
    nenName: { sq: wert("nenName_sq"), de: wert("nenName_de") },
    // Die Art traegt das Zeichen, die Rolle den Satz.
    lloji: wert("lloji") || "tonik",
    roli: wert("roli") || "baze",
    perberesit: wirkstoffe(wert("perberesit")),
    perdorimi: {
      hapi: Number(wert("perdorimi_hapi")) || 2,
      koha: { sq: wert("perdorimi_koha_sq"), de: wert("perdorimi_koha_de") },
      sasia: { sq: wert("perdorimi_sasia_sq"), de: wert("perdorimi_sasia_de") },
      si: { sq: wert("perdorimi_si_sq"), de: wert("perdorimi_si_de") },
      kujdes: { sq: wert("perdorimi_kujdes_sq"), de: wert("perdorimi_kujdes_de") }
    },
    synimi: { sq: wert("synimi_sq"), de: wert("synimi_de") },
    lidhja: regelnLesen(wert("lidhja")),
    routine: "both"
  };
}

// Die Wirkstoffe aus dem Textfeld.
//
// Eine Zeile je Stoff, mit senkrechten Strichen: Name, Menge, Aufgabe
// albanisch, Aufgabe deutsch. Ein Formular mit vier Feldern je Stoff waere
// bei fuenf Stoffen zwanzig Felder - und geschrieben wird das einmal je
// Produkt, nicht je Patient.
function wirkstoffe(text) {
  return String(text || "").split("\n")
    .map((zeile) => zeile.split("|").map((x) => x.trim()))
    .filter((teile) => teile[0])
    .map(([emri, sasia, sq, de]) => ({
      emri, sasia: sasia || "",
      roli: { sq: sq || "", de: de || "" }
    }))
    .slice(0, 8);
}

// Die Regeln aus dem Textfeld.
//
// Sie werden geprueft, bevor sie gespeichert werden. Eine kaputte Regel
// still zu schlucken waere das Schlimmste: Der Abschnitt beim Patienten
// bliebe leer, und niemand wuesste warum - genau der Fehler, der diesen
// ganzen Umbau ausgeloest hat.
function regelnLesen(text) {
  const roh = String(text || "").trim();
  if (!roh) return [];

  let liste;
  try {
    liste = JSON.parse(roh);
  } catch (fehler) {
    throw new Error(`Die Regeln sind kein gueltiges JSON: ${fehler.message}`);
  }
  if (!Array.isArray(liste)) throw new Error("Die Regeln muessen eine Liste sein.");

  for (const [i, regel] of liste.entries()) {
    const nr = i + 1;
    if (!regel || typeof regel !== "object") throw new Error(`Regel ${nr} ist kein Objekt.`);
    if (!regel.teksti?.sq) throw new Error(`Regel ${nr} hat keinen albanischen Satz.`);
    if (regel.kur && typeof regel.kur !== "object") throw new Error(`Regel ${nr}: "kur" muss ein Objekt sein.`);

    // Wer den Partner nennt, muss ihn auch verlangen - sonst faellt der
    // Platzhalter weg, wenn kein Basis-Mittel gewaehlt ist, und der Satz
    // ist grammatisch kaputt.
    const satz = `${regel.teksti.sq} ${regel.teksti.de || ""}`;
    if (satz.includes("{partner}") && regel.kur?.partner !== true) {
      throw new Error(`Regel ${nr} nennt {partner}, verlangt ihn aber nicht ("kur": { "partner": true }).`);
    }
    // Der Grad kommt in weiblicher Einzahl. Hinter einer Mehrzahl steht er
    // falsch, und ein Muttersprachler liest das sofort als kaputte Software.
    if (regel.teksti.sq.includes("{grada}")
        && !/(shkalla|shtresa mbrojtëse|sipërfaqja|ngjyra|skuqja|tekstura)[^.]*është $/i.test(regel.teksti.sq.split("{grada}")[0])) {
      throw new Error(`Regel ${nr}: {grada} steht in weiblicher Einzahl und passt nur hinter "shkalla e … është".`);
    }
  }

  // Die letzte Regel muss immer treffen. Ohne sie kann der Abschnitt beim
  // Patienten leer bleiben - und dann steht nach einer ausfuehrlichen
  // Diagnose eine Flasche ohne Begruendung.
  const letzte = liste[liste.length - 1];
  if (letzte && Object.keys(letzte.kur || {}).length) {
    throw new Error("Die letzte Regel braucht eine leere Bedingung (\"kur\": {}), sonst kann die Begruendung leer bleiben.");
  }

  return liste;
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

// Die Bilder der Landingpage stehen dort in einer Karte von 160 Punkten
// und auf dem Schreibtisch in einer von 260 - auf einem Bildschirm mit
// dreifacher Punktdichte sind das 780. 1000 ist die naechste runde Zahl
// darueber.
const LANDING_KANTE = 1000;

// WAS EIN EINZELNES BILD HOECHSTENS WIEGEN DARF - und das ist die
// Zahl, an der das Hochladen mehrerer Bilder gescheitert ist.
//
// Alle Bilder eines Mittels stehen in EINEM Firestore-Dokument, und
// ein Dokument darf 1 MiB. Die allgemeine Grenze darunter (700 KB je
// Bild) gilt fuer die EINE Produktaufnahme, die allein in ihrem
// Dokument steht; hier waeren schon zwei davon zu viel, und Firestore
// weist dann das GANZE Dokument ab - lautlos fuer den, der gerade ein
// Bild gewaehlt hat.
//
// 150 KB mal sechs sind 900 KB und lassen Luft fuer den Rest des
// Dokuments. Bei 1000 Bildpunkten heisst das etwa Guete 0,7 - fuer ein
// Produktbild in einer Karte von 160 Punkten immer noch mehr
// Aufloesung, als der Bildschirm zeigen kann.
const LANDING_BILD_MAX = 150000;

// Und was alle zusammen wiegen duerfen. Geprueft wird VOR dem
// Schreiben: Eine Fehlermeldung, die sagt "ein Bild weniger", ist
// etwas anderes als ein Schreibvorgang, der stumm scheitert und alles
// zuruecksetzt.
const LANDING_DOKUMENT_MAX = 900000;

/* Eine Adresse laden - ob sie aus einer Datei kommt oder schon als
   data:-Adresse dasteht, ist dem Bild gleich. Getrennt, weil ein Bild,
   das bereits in Firestore liegt, denselben Weg durch die Leinwand
   gehen koennen muss wie eines frisch vom Telefon. */
function bildLaden(adresse) {
  return new Promise((fertig, schief) => {
    const el = new Image();
    el.onload = () => fertig(el);
    el.onerror = () => schief(new Error("Das Bild liess sich nicht lesen."));
    el.src = String(adresse || "");
  });
}

async function produktfotoLesen(datei, kante = FOTO_KANTE, grenze = 700000) {
  if (!datei) throw new Error("Kein Bild gewaehlt.");
  if (!/^image\//.test(datei.type || "")) throw new Error("Das ist kein Bild.");

  const adresse = await new Promise((fertig, schief) => {
    const leser = new FileReader();
    leser.onload = () => fertig(String(leser.result || ""));
    leser.onerror = () => schief(new Error("Die Datei liess sich nicht lesen."));
    leser.readAsDataURL(datei);
  });
  return bildPressen(await bildLaden(adresse), kante, grenze);
}

/* Ein geladenes Bild auf Kante und Gewicht bringen.
 *
 * ZWEI LEITERN UND NICHT EINE. Die Guete allein reicht nicht: GEMESSEN
 * im Browser kommt ein sehr detailreiches Bild bei 1000 Punkten Kante
 * auch mit Guete 0,46 nicht unter 150 KB. Frueher flog dann ein Fehler
 * ("Bitte ein kleineres waehlen") - fuer jemanden, der ein ganz
 * normales Foto gewaehlt hat, ist das keine Auskunft, sondern eine
 * Sackgasse.
 *
 * Wenn die Guete nicht reicht, geht deshalb die KANTE herunter. Das
 * ist der ehrlichere Tausch: Ein etwas kleineres Bild sieht in einer
 * Karte von 160 Punkten gleich aus, ein stark gerechnetes sieht
 * matschig aus. Und es endet garantiert - jede Runde nimmt ein
 * Viertel der Kante weg. */
function bildPressen(bild, kante, grenze) {
  for (let runde = 0; runde < 5; runde += 1) {
    const versuch = bildZeichnen(bild, Math.round(kante * 0.75 ** runde), grenze);
    if (versuch) return versuch;
  }
  throw new Error("Das Bild ist zu gross. Bitte ein kleineres waehlen.");
}

/* Eine Runde: auf diese Kante zeichnen und die beste Guete nehmen, die
   noch passt. Gibt "" zurueck, wenn keine passt. */
function bildZeichnen(bild, kante, grenze) {
  const gross = Math.max(bild.width, bild.height) || 1;
  const massstab = Math.min(1, kante / gross);
  const leinwand = document.createElement("canvas");
  leinwand.width = Math.max(1, Math.round(bild.width * massstab));
  leinwand.height = Math.max(1, Math.round(bild.height * massstab));
  const stift = leinwand.getContext("2d");
  // ZUERST WEISS, DANN DAS BILD - und das ist kein Schoenheitsschritt.
  //
  // GEMESSEN: Eine leere Leinwand ist durchsichtig (0,0,0,0). JPEG kennt
  // keine Durchsichtigkeit; was durchsichtig war, kommt als (0,0,0)
  // heraus, also SCHWARZ. Freigestellte Produktaufnahmen sind fast immer
  // PNG mit durchsichtigem Grund - aus einer weiss freigestellten Flasche
  // wurde damit eine Flasche auf einem schwarzen Kasten, und zwar an
  // jeder Stelle, an der sie steht: im Befund der Patientin wie im
  // Raster der Landingpage.
  stift.fillStyle = "#FFFFFF";
  stift.fillRect(0, 0, leinwand.width, leinwand.height);
  stift.drawImage(bild, 0, 0, leinwand.width, leinwand.height);

  // Dieselbe Leiter wie bei den Aufnahmen: die beste Guete, die noch
  // passt. Zwei Stufen mehr als frueher, weil die Grenze der
  // Landingbilder enger ist - ohne sie kaeme dort fuer ein detailreiches
  // Bild gar nichts zurueck, statt eines etwas staerker gerechneten.
  for (const guete of [0.86, 0.78, 0.7, 0.62, 0.54, 0.46]) {
    const jpeg = leinwand.toDataURL("image/jpeg", guete);
    if (jpeg.length <= grenze) return jpeg;
  }
  return "";
}

// Was gerade im Formular steht - alle Felder auf einmal.
//
// GEMESSEN, NICHT GESCHAETZT: Das gewaehlte Foto stand nur im versteckten
// Feld. Die Erfolgsmeldung danach ist eine Zustandsaenderung, Heart
// zeichnet bei jeder neu, und dabei wird der ganze Bereich neu
// geschrieben - mit dem ALTEN Bild darin. "Speichern" schrieb danach,
// was schon dastand: Fuer den, der davorsitzt, aendert sich das Foto
// nicht.
//
// Deshalb wandert das Formular in den Zustand, bevor etwas neu
// gezeichnet wird. Und zwar GANZ und nicht nur das Bild: Wer gerade
// einen Satz getippt hat und dann ein Foto waehlt, soll den Satz
// wiederfinden.
function produktEntwurfLesen(zusatz = {}) {
  const felder = {};
  for (const knoten of document.querySelectorAll("[data-produktfeld]")) {
    const name = String(knoten.getAttribute("data-produktfeld") || "").trim();
    if (name) felder[name] = String(knoten.value ?? "");
  }
  return { ...felder, ...zusatz };
}

/* ══ DIE DATEIWAHL, DIE EIN NEUZEICHNEN UEBERLEBT ══════════════════
 *
 * GEMESSEN, NICHT VERMUTET: "Beim ersten Mal geht es nicht, beim
 * zweiten oder dritten schon."
 *
 * Das versteckte <input type="file"> stand MITTEN IM neu gezeichneten
 * Bereich. Heart zeichnet bei jeder Zustandsaenderung neu, und dabei
 * wird der Kasten per innerHTML neu geschrieben - das alte Feld ist
 * danach ein Knoten, der an keinem Dokument mehr haengt.
 *
 * Und genau waehrend die Fotoauswahl offensteht, passiert das
 * garantiert: Das Telefon legt die Seite in den Hintergrund, beim
 * Zurueckkommen laeuft eine Zustandsaenderung durch (ein Schnappschuss
 * aus Firestore, das Sichtbarwerden der Seite), der Bereich wird neu
 * geschrieben - und das Feld, in dem das gewaehlte Bild liegt, haengt
 * im Nichts. Sein "change" steigt zu keinem Dokument mehr auf, der
 * abhorchende Griff sieht nichts, und fuer den, der davorsitzt, ist
 * einfach nichts passiert. Beim zweiten Versuch hat der Bereich sich
 * gerade beruhigt, und dann geht es.
 *
 * Deshalb steht das Feld jetzt AUSSERHALB von allem, was neu
 * gezeichnet wird: an <body>, frisch fuer jede Wahl, mit seinem
 * eigenen Horcher. Kein Neuzeichnen kann es wegnehmen.
 *
 * NICHT display:none, SONDERN AUS DEM BILD GESCHOBEN. Ein Feld, das
 * gar nicht dargestellt wird, oeffnet die Fotoauswahl nicht auf jedem
 * Telefon. Ein Punkt in der Ecke, den niemand sieht, schon.
 *
 * .click() MUSS im Griff des Fingers passieren, ohne ein await davor -
 * sonst haelt der Browser die Auswahl fuer nicht angefordert und
 * oeffnet sie nicht. Der Aufruf steht deshalb am Ende dieser Funktion
 * und nicht hinter einem Versprechen. */
function oeffneDateiwahl(mehrfach, weiter) {
  const feld = document.createElement("input");
  feld.type = "file";
  feld.accept = "image/*";
  if (mehrfach) feld.multiple = true;
  feld.setAttribute("aria-hidden", "true");
  feld.tabIndex = -1;
  feld.style.cssText =
    "position:fixed;left:0;top:0;width:1px;height:1px;opacity:0;pointer-events:none;";

  let fertig = false;
  const aufraeumen = () => { feld.remove(); };
  feld.addEventListener("change", () => {
    fertig = true;
    const dateien = [...(feld.files || [])];
    aufraeumen();
    if (dateien.length) weiter(dateien);
  });
  /* Wer abbricht, loest kein "change" aus - das Feld bliebe sonst
     liegen, und beim naechsten Mal haengen zwei an <body>. Der Browser
     gibt der Seite den Fokus zurueck, sobald die Auswahl zu ist; ein
     Wimpernschlag danach steht fest, ob etwas gewaehlt wurde. */
  globalThis.addEventListener?.("focus", () => {
    globalThis.setTimeout?.(() => { if (!fertig) aufraeumen(); }, 800);
  }, { once: true });

  document.body.appendChild(feld);
  feld.click();
}

async function lifeskinProduktfoto(datei) {
  try {
    const jpeg = await produktfotoLesen(datei);
    actions.patchLifeskin({ produktEntwurf: produktEntwurfLesen({ photoRef: jpeg }) });
    setToast("Produkt", "Foto uebernommen. Nicht vergessen zu speichern.", "success");
  } catch (fehler) {
    setToast("Produkt", fehler?.message || "Das Foto liess sich nicht uebernehmen.", "danger");
  }
}

function lifeskinProduktfotoWeg() {
  actions.patchLifeskin({ produktEntwurf: produktEntwurfLesen({ photoRef: "" }) });
  setToast("Produkt", "Foto entfernt. Nicht vergessen zu speichern.", "success");
}

// Eine Marke am Bericht: abgehakt, oder als eigener Test.
//
// Sie liegt am Bericht und nicht an der Sitzung: Die Sitzung schreibt der
// Trichter ohne Anmeldung, und ihre Regel laesst nur die Felder zu, die er
// kennt. Was Dr. Gashi am Bericht vermerkt, geht ohne neue Regel durch.
async function markiereLifeskinSitzung(id, marken = {}) {
  const kennung = String(id || "").trim();
  if (!kennung) return;
  try {
    await setzeBerichtMarke(kennung, marken);
    await ladeLifeskinBereich({ force: true });
    const wort = "test" in marken
      ? (marken.test ? "Als eigener Test markiert - zaehlt in keiner Zahl mehr mit." : "Zaehlt wieder mit.")
      : "spaeter" in marken
        ? (marken.spaeter ? "Fuer spaeter zurueckgelegt." : "Zurueck in der Liste.")
        : (marken.archiviert ? "Abgehakt." : "Zurueck in der Liste.");
    setToast("Fall", wort, "success");
  } catch (fehler) {
    setToast("Analyse", fehler?.message || "Die Marke liess sich nicht setzen.", "danger");
  }
}

// Eine einzelne Analyse loeschen. ZWEI STUFEN, weil es kein Zurueck gibt:
// Firestore kennt keinen Papierkorb, und geloescht wird mit Fotos und
// Befund.
async function loescheLifeskinSitzung(id) {
  const kennung = String(id || "").trim();
  if (!kennung) return;
  const stand = store.getState().lifeskin || {};
  if (stand.loeschGefragt !== kennung) {
    actions.patchLifeskin({ loeschGefragt: kennung });
    return;
  }
  actions.patchLifeskin({ loeschGefragt: "" });
  try {
    await loescheSitzung(kennung);
    actions.patchLifeskin({ offen: "" });
    await ladeLifeskinBereich({ force: true });
    setToast("Analyse", "Geloescht - mit Fotos und Befund.", "success");
  } catch (fehler) {
    setToast("Analyse", fehler?.message || "Loeschen fehlgeschlagen.", "danger");
  }
}

// Die vorbereiteten Mittel anlegen.
//
// Fuenf Formulare mit Wirkstoffen, Anwendung und Regeln von Hand
// auszufuellen dauert einen Abend. Und ohne sie bleibt der
// Therapieabschnitt beim Patienten leer - nicht wegen eines Fehlers,
// sondern weil es nichts zu verbinden gibt: Ein Produkt ohne Regeln und
// ohne Wirkungszeilen ergibt keinen Satz, und erfunden wird hier nichts.
//
// Angelegt wird nur, was fehlt. Ein vorhandenes Mittel wird nie
// ueberschrieben - sonst waere ein Foto weg, das jemand hochgeladen hat,
// oder ein Preis, den jemand angepasst hat.
async function lifeskinProdukteAnlegen() {
  const stand = store.getState().lifeskin || {};
  const da = new Set((stand.produkte || []).map((p) => String(p.id)));
  const fehlend = STANDARD_PRODUKTE.filter((p) => !da.has(String(p.id)));
  if (!fehlend.length) return;

  actions.patchLifeskin({ produktStatus: "laeuft" });
  try {
    for (const produkt of fehlend) {
      // Ohne photoRef: Das Feld ist im Katalog leer, und ein leerer Wert
      // wuerde bei einem spaeteren Lauf ein Foto ueberschreiben.
      const { photoRef, ...felder } = produkt;
      await speichereProdukt({ ...felder });
    }
    actions.patchLifeskin({ produktStatus: "" });
    await ladeLifeskinBereich({ force: true });
    setToast("Produkte", `${fehlend.length} Mittel angelegt. Fotos lassen sich jetzt hinzufuegen.`, "success");
  } catch (fehler) {
    actions.patchLifeskin({ produktStatus: "" });
    setToast("Produkte", fehler?.message || "Anlegen fehlgeschlagen.", "danger");
  }
}

// Die Menge von Tropfen ("pika") auf die Erbse umstellen. Nur das Feld
// perdorimi.sasia, und nur dort, wo noch "pika" steht; der Wortlaut kommt
// aus dem Katalog. setDoc mit merge setzt die verschachtelte Karte, ohne
// den Rest der Anwendung zu beruehren.
async function lifeskinProdukteBizele() {
  const stand = store.getState().lifeskin || {};
  const ausKatalog = new Map(STANDARD_PRODUKTE.map((p) => [String(p.id), p]));
  const betroffen = (stand.produkte || []).filter((p) =>
    /\bpika\b/i.test(String(p?.perdorimi?.sasia?.sq ?? p?.perdorimi?.sasia ?? "")));
  if (!betroffen.length) return;
  actions.patchLifeskin({ produktStatus: "laeuft" });
  try {
    for (const p of betroffen) {
      const sasia = ausKatalog.get(String(p.id))?.perdorimi?.sasia;
      const neu = sasia && !/\bpika\b/i.test(String(sasia.sq || ""))
        ? { sq: String(sasia.sq), de: String(sasia.de || "") }
        : { sq: "sa një bizele për gjithë fytyrën", de: "erbsengroß für das ganze Gesicht" };
      await speichereProdukt({ id: p.id, perdorimi: { sasia: neu } });
    }
    actions.patchLifeskin({ produktStatus: "" });
    await ladeLifeskinBereich({ force: true });
    setToast("Produkte", `${betroffen.map((p) => p.name || p.id).join(", ")}: Menge jetzt „sa një bizele …“.`, "success");
  } catch (fehler) {
    actions.patchLifeskin({ produktStatus: "" });
    setToast("Produkte", fehler?.message || "Umstellen fehlgeschlagen.", "danger");
  }
}

// Wer hinter Lifeskin steht - aus dem Formular in die Konfiguration.
//
// Gelesen wird beim Speichern aus den Feldern, nicht bei jedem
// Tastendruck: Ein Neuzeichnen je Buchstabe zerreisst den Schreibfluss,
// und die Werte stehen ohnehin im Feld, bis jemand drueckt. Dasselbe
// Vorgehen wie beim Produktformular daneben.
//
// LEER IST ERLAUBT und kein Fehler: Wer alle drei Felder leert, nimmt den
// Block auf der Befundseite wieder weg. Das muss gehen - sonst waere ein
// einmal eingetragener Anbieter nicht mehr zu entfernen.
async function speichereLifeskinAnbieter() {
  const lies = (name) =>
    document.querySelector(`[data-anbieterfeld="${name}"]`)?.value ?? "";
  const anbieter = {
    name: lies("name"),
    anschrift: lies("anschrift"),
    email: lies("email")
  };

  actions.patchLifeskin({ anbieterStatus: "laeuft" });
  try {
    const gespeichert = await speichereAnbieter(anbieter);
    actions.patchLifeskin({ anbieterStatus: "" });
    await ladeLifeskinBereich({ force: true });
    const gefuellt = Object.values(gespeichert).filter((w) => w).length;
    setToast("Anbieter", gefuellt
      ? `Gespeichert. ${gefuellt} von 3 Angaben stehen jetzt auf der Befundseite.`
      : "Gespeichert. Der Anbieterblock erscheint auf der Befundseite nicht mehr.", "success");
  } catch (fehler) {
    actions.patchLifeskin({ anbieterStatus: "" });
    setToast("Anbieter", fehler?.message || "Speichern fehlgeschlagen.", "danger");
  }
}

// ══ DIE BILDER DER LANDINGPAGE ═════════════════════════════════════
//
// SIE SPEICHERN SICH SOFORT und nicht mit dem Knopf unten. Der Rest des
// Formulars ist Text, an dem man arbeitet; ein Bild ist entweder da oder
// nicht. Wer drei Aufnahmen einzeln heraussucht und dann vergisst zu
// speichern, hat drei Aufnahmen verloren - und macht es kein zweites Mal.
//
// Der Entwurf wird trotzdem mitgeschrieben, aus demselben Grund wie beim
// Produktfoto darueber: Heart zeichnet bei jeder Zustandsaenderung neu,
// und was nur im Formular stand, waere danach weg.
async function landingFototLaden(produktId) {
  if (!produktId || produktId === "__neu") return;
  try {
    const fotot = await ladeLandingFotot(produktId);
    const stand = store.getState().lifeskin || {};
    // Nur setzen, wenn immer noch dasselbe Produkt offen ist: Wer
    // schnell weiterklickt, bekommt sonst die Bilder des vorigen.
    if (stand.produktOffen !== produktId) return;
    actions.patchLifeskin({
      produktEntwurf: { ...(stand.produktEntwurf || {}), landingFotot: fotot }
    });
  } catch (fehler) {
    setToast("Bilder", fehler?.message || "Die Bilder liessen sich nicht laden.", "danger");
  }
}

async function landingFototSchreiben(fotot, meldung) {
  const stand = store.getState().lifeskin || {};
  const id = stand.produktOffen;
  if (!id || id === "__neu") return;
  const vorher = Array.isArray(stand.produktEntwurf?.landingFotot)
    ? stand.produktEntwurf.landingFotot
    : [];
  actions.patchLifeskin({
    produktEntwurf: { ...(stand.produktEntwurf || {}), landingFotot: fotot, landingFototStatus: "laeuft" }
  });
  try {
    const sauber = await speichereLandingFotot(id, fotot);
    const jetzt = store.getState().lifeskin || {};
    actions.patchLifeskin({
      produktEntwurf: { ...(jetzt.produktEntwurf || {}), landingFotot: sauber, landingFototStatus: "" }
    });
    setToast("Bilder", meldung, "success");
  } catch (fehler) {
    // Zurueck auf den Stand von vorher: Ein Bild, das auf dem Bildschirm
    // steht und nicht gespeichert ist, ist schlechter als keines.
    const jetzt = store.getState().lifeskin || {};
    actions.patchLifeskin({
      produktEntwurf: { ...(jetzt.produktEntwurf || {}), landingFotot: vorher, landingFototStatus: "" }
    });
    setToast("Bilder", fehler?.message || "Speichern fehlgeschlagen.", "danger");
  }
}

async function lifeskinLandingbilder(dateien) {
  const stand = store.getState().lifeskin || {};
  const da = Array.isArray(stand.produktEntwurf?.landingFotot)
    ? stand.produktEntwurf.landingFotot
    : [];
  const platz = LANDING_FOTOT_MAX - da.length;
  if (platz <= 0) {
    setToast("Bilder", `Hoechstens ${LANDING_FOTOT_MAX} Bilder. Nehmen Sie eines weg.`, "danger");
    return;
  }
  const gewaehlt = [...(dateien || [])].slice(0, platz);
  if (!gewaehlt.length) return;

  const neue = [];
  for (const datei of gewaehlt) {
    try {
      neue.push(await produktfotoLesen(datei, LANDING_KANTE, LANDING_BILD_MAX));
    } catch (fehler) {
      setToast("Bilder", fehler?.message || "Ein Bild liess sich nicht lesen.", "danger");
    }
  }
  if (!neue.length) return;

  // WAS NICHT MEHR HINEINPASST, WIRD HIER GESAGT UND NICHT DORT
  // VERSCHLUCKT.
  //
  // Alle Bilder eines Mittels stehen in EINEM Firestore-Dokument, und
  // ein Dokument darf 1 MiB. War es zu gross, wies Firestore es ab -
  // und weil der Schreibvorgang danach zurueckrollt, sah es aus, als
  // habe das Hochladen "manchmal funktioniert und manchmal nicht".
  //
  // HIER STAND EIN RIEGEL, UND DAS WAR ZU WENIG.
  //
  // Er rechnete das Gewicht der schon liegenden Bilder einfach dazu
  // und sagte bei "passt nicht" ab. Bei drei Bildern aus der Zeit vor
  // dieser Grenze war das Dokument damit voll, und dieselbe Meldung
  // kam bei jedem weiteren Versuch: "Kein Platz mehr" - bei DREI von
  // sechs Bildern. Wer sechs anlegen will, kommt da nie an.
  //
  // Ein Bild, das zu schwer ist, ist aber kein Grund abzusagen: Es ist
  // ein Bild, das noch einmal durch die Leinwand muss. Die alten gehen
  // deshalb denselben Weg wie die neuen - jedes auf seinen Anteil am
  // Dokument, damit sechs sicher hineinpassen. Sichtbar aendert das
  // nichts: 150 KB sind bei 1000 Bildpunkten immer noch mehr
  // Aufloesung, als eine Karte von 160 Punkten zeigen kann.
  let alte = da;
  if (da.reduce((summe, f) => summe + f.length, 0)
      + neue.reduce((summe, f) => summe + f.length, 0) > LANDING_DOKUMENT_MAX) {
    alte = [];
    for (const bild of da) {
      if (bild.length <= LANDING_BILD_MAX) { alte.push(bild); continue; }
      try {
        alte.push(bildPressen(await bildLaden(bild), LANDING_KANTE, LANDING_BILD_MAX));
      } catch {
        /* Laesst sich eines nicht noch einmal rechnen, bleibt es, wie
           es ist - ein Bild verlieren waere schlimmer als ein Dokument,
           das knapp bleibt. Der Riegel darunter faengt das ab. */
        alte.push(bild);
      }
    }
  }

  // Und erst jetzt der Riegel: Was auch nach dem Einpassen nicht mehr
  // hineingeht, bleibt draussen, waehrend der Rest ankommt.
  const passend = [];
  let gewicht = alte.reduce((summe, f) => summe + f.length, 0);
  for (const bild of neue) {
    if (gewicht + bild.length > LANDING_DOKUMENT_MAX) break;
    gewicht += bild.length;
    passend.push(bild);
  }
  if (!passend.length) {
    setToast("Bilder",
      `Kein Platz mehr. ${da.length} Bilder liegen schon da - nehmen Sie eines weg.`,
      "danger");
    return;
  }
  if (passend.length < neue.length) {
    setToast("Bilder",
      `${neue.length - passend.length} von ${neue.length} Bildern haben nicht mehr hineingepasst.`,
      "danger");
  }
  neue.length = 0;
  neue.push(...passend);

  const zuviel = (dateien || []).length > platz;
  await landingFototSchreiben([...alte, ...neue],
    zuviel
      ? `${neue.length} Bilder gespeichert. Mehr als ${LANDING_FOTOT_MAX} gehen nicht.`
      : `${neue.length === 1 ? "Bild" : `${neue.length} Bilder`} gespeichert. Auf der Landingpage sichtbar.`);
}

async function lifeskinLandingbildWeg(index) {
  const stand = store.getState().lifeskin || {};
  const da = Array.isArray(stand.produktEntwurf?.landingFotot)
    ? stand.produktEntwurf.landingFotot
    : [];
  if (!Number.isInteger(index) || index < 0 || index >= da.length) return;
  const ohne = da.filter((_, i) => i !== index);
  await landingFototSchreiben(ohne,
    ohne.length
      ? "Bild entfernt."
      : "Letztes Bild entfernt — das Mittel erscheint auf der Landingpage nicht mehr.");
}

/* Die Reihenfolge der Landingbilder.
 *
 * WARUM PFEILE UND KEIN ZIEHEN. Das hier wird am Telefon bedient - und
 * am Telefon ist Ziehen dasselbe wie Scrollen. Wer ein Bild anfasst und
 * bewegt, rollt in neun von zehn Faellen nur die Seite, und beim
 * zehnten Mal laesst er es an der falschen Stelle los. Zwei Pfeile
 * treffen immer, auch mit dem Daumen, und sie sagen von selbst, was
 * passiert.
 *
 * Das erste Bild ist auf der Landingpage das, das jeder sieht - ohne zu
 * wischen. Die Reihenfolge ist deshalb keine Kosmetik, sondern die
 * Entscheidung, welches Bild verkauft.
 *
 * Geschrieben wird ueber denselben Weg wie Hinzufuegen und Entfernen:
 * sofort, mit Ruecknahme, wenn Firestore nein sagt. */
async function lifeskinLandingbildSchieben(index, richtung) {
  const stand = store.getState().lifeskin || {};
  const da = Array.isArray(stand.produktEntwurf?.landingFotot)
    ? stand.produktEntwurf.landingFotot
    : [];
  const ziel = index + (richtung === "zurueck" ? -1 : 1);
  if (!Number.isInteger(index) || index < 0 || index >= da.length) return;
  if (ziel < 0 || ziel >= da.length) return;
  /* Nicht laufen lassen, waehrend der vorige Schreibvorgang noch
     unterwegs ist: Zwei Tausche auf demselben Ausgangsstand geben eine
     Reihenfolge, die keiner der beiden Drucke gemeint hat. */
  if (stand.produktEntwurf?.landingFototStatus === "laeuft") return;

  const neu = [...da];
  [neu[index], neu[ziel]] = [neu[ziel], neu[index]];
  await landingFototSchreiben(neu,
    ziel === 0
      ? "Bild ist jetzt das erste — es steht auf der Landingpage vorne."
      : `Bild an Stelle ${ziel + 1}.`);
}

// ══ DIE VORHER/NACHHER-FAELLE ═════════════════════════════════════
//
// Daten: shared/lifeskin-raste.js. Ansicht: heart-lifeskin-raste.js.
//
// Die Liste wird immer GANZ geschrieben (ein kleines Dokument), die zwei
// Bilder eines Falls in ihrem eigenen. Nach dem Schreiben steht die neue
// Liste sofort im Zustand - ohne den ganzen Bereich neu zu laden.

// Der Vorschlag fuer den Preis, nach der Zahl der Produkte - dieselben
// Zahlen wie im Befund (shared/lifeskin-preise.js).
function rastiPreisVorschlag(anzahl) {
  const tabelle = store.getState().lifeskin?.konfig?.preise || {};
  return Number(tabelle[String(anzahl)]) || preisFuer(anzahl);
}

// Was gerade im Editor steht - vor jedem Neuzeichnen in den Zustand, damit
// nichts Getipptes verloren geht (siehe produktEntwurfLesen).
function rastiEntwurfLesen(zusatz = {}) {
  const stand = store.getState().lifeskin || {};
  const entwurf = { ...(stand.rastEntwurf || {}) };
  if (document.querySelector("[data-rastifeld]")) {
    for (const feld of document.querySelectorAll("[data-rastifeld]")) entwurf[feld.dataset.rastifeld] = String(feld.value ?? "");
    for (const feld of document.querySelectorAll("[data-rastifeld-an]")) entwurf[feld.dataset.rastifeldAn] = feld.checked;
    entwurf.produkte = [...document.querySelectorAll("[data-rasti-produkt]")].map((w) => String(w.value || "")).filter(Boolean);
  }
  return { ...entwurf, ...zusatz };
}

async function rasteSchreiben(neu, meldung) {
  const stand = store.getState().lifeskin || {};
  const vorher = stand.raste;
  const sauber = rasteNormalisieren(neu);
  actions.patchLifeskin({ raste: sauber, rasteStatus: "laeuft" });
  try {
    await speichereRaste(sauber);
    actions.patchLifeskin({ rasteStatus: "" });
    if (meldung) setToast("Ergebnisse", meldung, "success");
    return true;
  } catch (fehler) {
    actions.patchLifeskin({ raste: vorher, rasteStatus: "" });
    setToast("Ergebnisse", fehler?.message || "Speichern fehlgeschlagen.", "danger");
    return false;
  }
}

// Die Bilder fuer die Vorschau in der Liste - erst, wenn jemand die Karte
// aufklappt, und jedes nur einmal.
async function lifeskinRasteBilderLaden(nur = null) {
  const stand = store.getState().lifeskin || {};
  const schon = stand.rasteBilder || {};
  const fehlend = rasteListe(stand).filter((r) => r.bild && !schon[r.id] && (!nur || r.id === nur));
  if (!fehlend.length) return;
  const geladen = await Promise.all(fehlend.map(async (r) => {
    try { return [r.id, (await ladeRastiBilder(r.id)) || { para: "", pas: "" }]; } catch { return null; }
  }));
  const jetzt = store.getState().lifeskin || {};
  actions.patchLifeskin({ rasteBilder: { ...(jetzt.rasteBilder || {}), ...Object.fromEntries(geladen.filter(Boolean)) } });
}

function oeffneLifeskinRasti(id) {
  const kennung = String(id || "").trim();
  if (!kennung) return;
  const stand = store.getState().lifeskin || {};
  const fall = rasteListe(stand).find((r) => r.id === kennung);
  const brauchtBilder = Boolean(fall?.bild && !(stand.rasteBilder || {})[kennung]);
  actions.patchLifeskin({ rastOffen: kennung, rastEntwurf: null, rastLoeschen: false, rastStatus: "",
    rastBilderStatus: brauchtBilder ? "laeuft" : "" });
  if (brauchtBilder) {
    lifeskinRasteBilderLaden(kennung).finally(() => actions.patchLifeskin({ rastBilderStatus: "" }));
  }
}

function lifeskinRastiFoto(seite) {
  if (!["para", "pas"].includes(seite)) return;
  oeffneDateiwahl(false, async (dateien) => {
    try {
      // 1000 Punkte Kante, hoechstens 170 KB: zwei Bilder je Dokument.
      const jpeg = await produktfotoLesen(dateien[0], LANDING_KANTE, 170000);
      if (!store.getState().lifeskin?.rastOffen) return;
      actions.patchLifeskin({ rastEntwurf: rastiEntwurfLesen({ [seite]: jpeg, bilderNeu: true }) });
    } catch (fehler) {
      setToast("Ergebnis", fehler?.message || "Das Foto liess sich nicht uebernehmen.", "danger");
    }
  });
}

async function speichereLifeskinRasti() {
  const stand = store.getState().lifeskin || {};
  const offen = stand.rastOffen;
  if (!offen || stand.rastStatus) return;
  const liste = rasteListe(stand);
  const alt = offen === "__neu" ? null : liste.find((r) => r.id === offen);
  if (offen !== "__neu" && !alt) return;
  const e = rastiEntwurfLesen();
  const geladen = alt ? (stand.rasteBilder || {})[alt.id] || {} : {};
  const para = e.para ?? geladen.para ?? alt?.para ?? "";
  const pas = e.pas ?? geladen.pas ?? alt?.pas ?? "";

  if (!para || !pas) { setToast("Ergebnis", "Bitte ein Vorher- und ein Nachher-Foto wählen.", "danger"); return; }
  if (!String(e.emri ?? alt?.emri ?? "").trim()) { setToast("Ergebnis", "Bitte einen Namen / eine Überschrift eintragen.", "danger"); return; }

  const produkte = [...new Set(e.produkte ?? alt?.produkte ?? [])].slice(0, RASTI_PRODUKTE_MAX);
  const namen = new Map((stand.produkte || []).map((p) => [String(p.id), String(p.name || p.id)]));
  const id = alt?.id || neueRastiId();
  const cmimiRoh = String(e.cmimi ?? alt?.cmimi ?? "").replace(",", ".");
  const fall = rastiNormalisieren({
    ...(alt || {}),
    id,
    emri: e.emri ?? alt?.emri,
    gjetja: e.gjetja ?? alt?.gjetja,
    produkte,
    emrat: produkte.map((p) => namen.get(p) || (alt?.emrat?.[alt.produkte.indexOf(p)]) || p),
    cmimi: cmimiRoh ? Number(cmimiRoh) : rastiPreisVorschlag(produkte.length),
    landing: e.landing ?? alt?.landing ?? true,
    analiza: e.analiza ?? alt?.analiza ?? true,
    // Eine Datei der Seite bleibt im Index; ein neues Bild geht in sein
    // eigenes Dokument.
    para: para.startsWith("data:") ? "" : para,
    pas: pas.startsWith("data:") ? "" : pas,
    bild: para.startsWith("data:") || pas.startsWith("data:")
  });

  actions.patchLifeskin({ rastEntwurf: e, rastStatus: "laeuft" });
  try {
    if (e.bilderNeu && fall.bild) {
      await speichereRastiBilder(id, { para: para.startsWith("data:") ? para : "", pas: pas.startsWith("data:") ? pas : "" });
    }
    const neu = alt ? liste.map((r) => (r.id === id ? fall : r)) : [fall, ...liste];
    const jetzt = store.getState().lifeskin || {};
    actions.patchLifeskin({
      rasteBilder: fall.bild ? { ...(jetzt.rasteBilder || {}), [id]: { para: fall.para ? "" : para, pas: fall.pas ? "" : pas } } : jetzt.rasteBilder
    });
    const gut = await rasteSchreiben(neu, alt ? "Ergebnis gespeichert." : "Ergebnis angelegt.");
    if (!gut) { actions.patchLifeskin({ rastStatus: "" }); return; }
    // Ein altes Bilddokument, das nicht mehr gebraucht wird, faellt weg.
    if (alt?.bild && !fall.bild) loescheRastiBilder(id).catch(() => {});
    klappSetzen("mehr", true);
    klappSetzen("raste", true);
    actions.patchLifeskin({ rastOffen: "", rastEntwurf: null, rastStatus: "", rastLoeschen: false });
  } catch (fehler) {
    actions.patchLifeskin({ rastStatus: "" });
    setToast("Ergebnis", fehler?.message || "Speichern fehlgeschlagen.", "danger");
  }
}

async function loescheLifeskinRasti() {
  const stand = store.getState().lifeskin || {};
  const id = stand.rastOffen;
  if (!id || id === "__neu" || stand.rastStatus) return;
  if (!stand.rastLoeschen) {
    actions.patchLifeskin({ rastEntwurf: rastiEntwurfLesen(), rastLoeschen: true });
    return;
  }
  const liste = rasteListe(stand);
  const fall = liste.find((r) => r.id === id);
  actions.patchLifeskin({ rastStatus: "laeuft" });
  const gut = await rasteSchreiben(liste.filter((r) => r.id !== id), "Ergebnis gelöscht.");
  if (gut && fall?.bild) loescheRastiBilder(id).catch(() => {});
  klappSetzen("mehr", true);
  klappSetzen("raste", true);
  actions.patchLifeskin(gut
    ? { rastOffen: "", rastEntwurf: null, rastStatus: "", rastLoeschen: false }
    : { rastStatus: "", rastLoeschen: false });
}

async function lifeskinRastiOrt(id, ort) {
  if (!["landing", "analiza"].includes(ort)) return;
  const stand = store.getState().lifeskin || {};
  if (stand.rasteStatus) return;
  const liste = rasteListe(stand);
  const fall = liste.find((r) => r.id === id);
  if (!fall) return;
  const an = !fall[ort];
  const wo = ort === "landing" ? "Landingpage" : "Analyseseite";
  await rasteSchreiben(liste.map((r) => (r.id === id ? { ...r, [ort]: an } : r)),
    `${fall.emri || "Ergebnis"}: ${an ? "erscheint jetzt auf der" : "nicht mehr auf der"} ${wo}.`);
}

async function lifeskinRastiSchieben(id, richtung) {
  const stand = store.getState().lifeskin || {};
  if (stand.rasteStatus) return;
  const liste = rasteListe(stand);
  const index = liste.findIndex((r) => r.id === id);
  const ziel = richtung === "hoch" ? index - 1 : index + 1;
  if (index < 0 || ziel < 0 || ziel >= liste.length) return;
  [liste[index], liste[ziel]] = [liste[ziel], liste[index]];
  await rasteSchreiben(liste, "");
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
    actions.patchLifeskin({ produktStatus: "", produktOffen: "", produktEntwurf: null });
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
async function gibLifeskinBerichtFrei(sitzungId, { nurStaff = false } = {}) {
  const id = String(sitzungId || "").trim();
  if (!id) return;

  // Freigegeben wird, was im Bogen steht - egal ob es dort eingefuegt
  // oder getippt wurde.
  //
  // DER VERTRAG SPERRT DIE FREIGABE NICHT. Hier stand eine Pruefung, die
  // geworfen hat: Ein Befund mit vier Fotos statt drei oder mit einem
  // Begriff, der im Text nicht wortgleich vorkommt, liess sich nicht
  // freigeben - und zwar mit einer Meldung, die nicht sagte, in welches
  // Feld man dafuer fassen muss. Was auffaellt, wird jetzt gesagt; ob es
  // rausgeht, entscheidet der, der den Bogen vor sich hat.
  let raport;
  try { raport = lifeskinBogenLesen(); }
  catch (error) { setToast('Befund', error.message || 'Der Bogen liess sich nicht lesen.', 'danger'); return; }
  const bogenHinweise = raport.schemaVersion === 3 ? pruefeRaportV3(reportToWire(raport)) : [];
  const befund = raport.gjetjet;
  if (!befund) {
    setToast("Befund", "Ohne Gjetjet gibt es nichts freizugeben.", "danger");
    return;
  }

  // Was freigegeben wird, ist was in den Feldern STEHT - nicht, was die
  // Automatik erzeugt haette. Sie fuellt vor, sie entscheidet nicht.
  const produkte = [];
  for (const kasten of document.querySelectorAll("[data-produkt-wahl]")) {
    if (!kasten.checked) continue;
    const pid = kasten.value;
    const hol = (feld) => document.querySelector(`[data-produkt-${feld}="${CSS.escape(pid)}"]`)?.value || "";
    const satz = hol("satz").trim();
    // Die Wirkungszeilen wandern mit in den Bericht, nicht nur die Kennung.
    //
    // Sie stehen am Produkt und gelten fuer jeden - aber freigegeben ist,
    // was Dr. Gashi FUER DIESEN Fall gesehen und bestaetigt hat. Wird eine
    // Zeile im Katalog spaeter geaendert, aendert sich damit kein Befund,
    // der schon beim Patienten liegt.
    const veprimi = lifeskinVeprimiLesen(pid);
    const zweck = hol("zweck").trim();
    produkte.push({ id: pid, satz, veprimi, zweck });
  }
  // FREIGEGEBEN WIRD, WAS ANGEKREUZT IST. Punkt.
  //
  // Hier stand eine Sperre: Traf eine von drei Bedingungen nicht zu, wurde
  // die Produktliste auf Null gesetzt. Zwei davon kamen aus der
  // Modellantwort, und keine liess sich in diesem Bogen bearbeiten - wer
  // zwei Mittel ankreuzte, verlor sie an eine Bedingung, an die er nicht
  // herankam. Das widersprach dem Grundsatz drei Zeilen weiter oben: Die
  // Automatik fuellt vor, sie entscheidet nicht.
  //
  // Was die Analyse ueber eine noetige Abklaerung sagt, steht weiterhin
  // auf der Patientenseite. Es sperrt nur nichts mehr.
  if (!produkte.length && raport.schemaVersion !== 3) {
    setToast("Befund", "Ohne Produkt gibt es keine Therapie zum Bestellen.", "danger");
    return;
  }

  const preis = Number(document.querySelector("#lifeskin-preis")?.value) || 0;
  if (produkte.length && preis <= 0) {
    setToast("Befund", "Der Setpreis fehlt.", "danger");
    return;
  }

  // GEMESSEN, NICHT GESCHAETZT: Ein Bericht ohne diese Angaben ergibt eine
  // Seite mit Befundtext und Preis - ohne Zonen, Messwerte, Diagnose und
  // Prognose. Genau so ist ein Bericht schon einmal beim Patienten
  // gelandet. Lieber hier stehenbleiben als dort halb leer ankommen.
  // Ohne Foto gibt es keine Messwerte - das ist dort kein Fehler.
  const art = document.querySelector("[data-bogen-art]")?.value === "pa-foto" ? "pa-foto" : "foto";
  if (!raport.parametrat.length && art !== "pa-foto") {
    setToast("Befund",
      "Ohne Messwerte zeigt die Seite nur Text. Bitte im Bogen mindestens einen Parameter ausfuellen — oder das JSON der Analyse einfuegen.",
      "danger");
    return;
  }

  const schwere = document.querySelector("#lifeskin-schwere")?.value || "";

  // Die vier Wochen. Nur vollstaendig - ein halber eigener Plan waere
  // schlechter als der ganze Standardplan.
  const zusatz = {};
  for (const feld of document.querySelectorAll("[data-zusatz]")) {
    const wert = feld.value.trim();
    if (wert) zusatz[feld.dataset.zusatz] = wert;
  }

  // Die eigenen Texte der Patientenseite. Sie liegen wie der ganze Bogen im
  // DOM und werden erst hier gelesen - leer heisst Standard, und was leer
  // ist, wird gar nicht erst gespeichert.
  const texteRoh = {};
  for (const feld of document.querySelectorAll("[data-text]")) {
    texteRoh[feld.dataset.text] = feld.value;
  }
  const texte = texteSaeubern(texteRoh);

  actions.patchLifeskin({ berichtStatus: "laeuft" });
  try {
    await gibBerichtFrei(id, { befund, produkte, preis: produkte.length ? preis : 0, schwere, raport,
    texte, ohneBild: art === "pa-foto",
    // Die Vorher/Nachher-Faelle dieser Seite, in der gewaehlten Reihenfolge.
    raste: [...new Set([...document.querySelectorAll("[data-befund-rasti]")].map((w) => String(w.value || "")).filter(Boolean))],
    nurStaff,
    analyse: {
      javet: [1, 2, 3, 4].map((n) => zusatz[`java_${n}`] || "")
    } });
    // FREIGEGEBEN HEISST FERTIG. Der Fall wechselt das Fach, und zwar
    // sichtbar: Wer zurueckgeht, soll ihn dort finden, wo er jetzt
    // hingehoert, und nicht unter "Neu" vergeblich suchen. Eine Vorschau
    // wechselt nichts - sie ist ja gerade noch nicht freigegeben.
    // "ready" ist das Fach der freigegebenen Faelle. Hier stand "fertig" -
    // ein Fach, das es nicht gibt: Die Liste war danach leer, bis jemand
    // einen Chip antippte.
    actions.patchLifeskin({ berichtStatus: "", ...(nurStaff ? {} : { fach: "ready" }) });
    // Gespeichert ist gespeichert: der Entwurf auf dem Geraet hat ausgedient.
    entwurfLoeschen(id);
    await ladeLifeskinBereich({ force: true });
    // Was am Bogen auffaellt, steht HINTER der Freigabe und nicht davor:
    // Es ist eine Beobachtung, keine Bedingung.
    const nachsatz = bogenHinweise.length
      ? ` Zum Nachsehen: ${bogenHinweise.slice(0, 2).join(" ")}${bogenHinweise.length > 2 ? ` (+${bogenHinweise.length - 2})` : ""}`
      : "";
    setToast("Befund", (nurStaff
      ? "Als Vorschau gespeichert. Der Patient sieht weiter seine Warteseite."
      : "Freigegeben. Der Patient sieht ihn innerhalb einer Minute.") + nachsatz, "success");
  } catch (fehler) {
    actions.patchLifeskin({ berichtStatus: "" });
    setToast("Befund", fehler?.message || "Freigabe fehlgeschlagen.", "danger");
  }
}

// Die Therapietexte beim Anhaken fuellen.
//
// Das ist die zweite Haelfte der Zeitersparnis. Der Bogen fuellt sich aus
// dem JSON; hier fuellen sich die Saetze zum Produkt aus demselben JSON und
// den Regeln des Katalogs. Danach steht der ganze Fall fertig da und muss
// nur noch ueberflogen werden.
//
// Was von Hand geaendert wurde, bleibt stehen. Ein Feld, das ungefragt
// zurueckspringt, wird beim zweiten Mal nicht mehr benutzt - und dann tippt
// sie wieder alles selbst, was der ganze Umbau vermeiden sollte.
//
// Erkannt wird die Handschrift am Vergleich mit dem zuletzt erzeugten Text.
// Kein Merker im Zustand: Der ginge beim Neuzeichnen verloren, und
// neugezeichnet wird nach jedem JSON-Einfuegen.
const lifeskinAutomatik = new Map();

function lifeskinGewaehlteProdukte() {
  const stand = store.getState().lifeskin || {};
  const katalog = new Map((stand.produkte || []).map((p) => [String(p.id), p]));
  const raus = [];
  for (const kasten of document.querySelectorAll("[data-produkt-wahl]")) {
    if (!kasten.checked) continue;
    const produkt = katalog.get(String(kasten.value));
    if (produkt) raus.push(produkt);
  }
  return raus;
}

// Ein Feld fuellen - aber nur, wenn es leer ist oder noch genau das
// enthaelt, was zuletzt hineingeschrieben wurde.
function lifeskinFeldFuellen(feld, neuerWert, merker, erzwingen) {
  if (!feld) return false;
  const jetzt = feld.value.trim();
  const zuletzt = lifeskinAutomatik.get(merker);
  const vonHand = jetzt && jetzt !== (zuletzt || "").trim();
  if (vonHand && !erzwingen) return false;
  feld.value = neuerWert;
  lifeskinAutomatik.set(merker, neuerWert);
  return true;
}

// DIE DREI WIRKUNGSZEILEN SIND DREI FELDER.
//
// Vorher war es ein Textfeld mit Umbruechen darin, und jede Stelle, die
// damit umging, spaltete selbst an "\n". Jetzt gehen alle vier durch
// diese beiden Funktionen: Sonst haette die naechste Stelle wieder ihre
// eigene Vorstellung davon, was eine leere Zeile bedeutet.
function lifeskinVeprimiFelder(id) {
  return Array.from(document.querySelectorAll(`[data-veprimi="${CSS.escape(String(id))}"]`));
}

function lifeskinVeprimiLesen(id) {
  return lifeskinVeprimiFelder(id)
    // Jedes Feld traegt genau EINE Wirkung. Ein Umbruch darin - getippt
    // oder aus der Zwischenablage - wird ein Leerzeichen, sonst stuende
    // beim Patienten aus einer Wirkung ploetzlich eine halbe.
    .map((f) => f.value.replace(/\s+/g, " ").trim())
    .filter(Boolean)
    .slice(0, 3);
}

// Gefuellt wird ueber denselben Weg wie jedes andere Feld - ueber einen
// Stellvertreter mit .value. Die Regel "was von Hand getippt wurde, bleibt
// stehen" steht damit weiter an EINER Stelle und nicht zweimal leicht
// verschieden.
function lifeskinVeprimiFuellen(id, zeilen, erzwingen) {
  const felder = lifeskinVeprimiFelder(id);
  if (!felder.length) return false;
  const stellvertreter = {
    get value() { return lifeskinVeprimiLesen(id).join("\n"); },
    set value(wert) {
      const neu = String(wert || "").split("\n");
      felder.forEach((feld, i) => { feld.value = String(neu[i] || "").trim(); });
    }
  };
  return lifeskinFeldFuellen(stellvertreter, zeilen.join("\n"), `veprimi:${id}`, erzwingen);
}

function lifeskinTherapieFuellen({ erzwingen = false, nur = "" } = {}) {
  const gewaehlt = lifeskinGewaehlteProdukte();
  const stand = store.getState().lifeskin || {};
  const sitzung = findeSitzung(stand, stand.offen) || {};

  let raport;
  try { raport = lifeskinBogenLesen(); } catch { return []; }
  const terapi = baueTerapi({
    raport,
    produkte: gewaehlt,
    patient: { emri: sitzung.name || "", mosha: sitzung.ageBand || "" },
    sprache: "sq"
  });

  const gewaehlteIds = new Set(terapi.map((t) => t.id));

  for (const t of terapi) {
    if (nur && t.id !== nur) continue;
    // DIE ANALYSE GEHT VOR. Bringt das JSON eigene Texte fuer dieses
    // Produkt mit (nevojat, shitja.produktet), stehen die im Bogen - nicht
    // der Regelsatz, der bei jedem Patienten gleich lautet.
    const eigen = ausAnalyse(raport, t.id, t.veprimi);
    // Ein Satz, der sagt, was das Produkt NICHT tut ("… nuk lufton
    // puçrrat."), faellt weg - auch aus alten Regeltexten in der Datenbank.
    const satz = ohneSeite(eigen?.satz || t.arsyeja)
      .replace(/(^|(?<=[.!?])\s+)[^.!?]*\bnuk (lufton|trajton|vepron|heq|shëron|ndikon)\b[^.!?]*[.!?]\s*/giu, "$1").trim();
    const zeilen = (eigen?.veprimi?.length ? eigen.veprimi : t.veprimi).map(ohneSeite);
    const satzFeld = document.querySelector(`[data-produkt-satz="${CSS.escape(t.id)}"]`);
    const a = lifeskinFeldFuellen(satzFeld, satz, `satz:${t.id}`, erzwingen);
    // Die Wirkungszeilen sind je Patient aenderbar. Sie stehen am Produkt
    // gleich, aber wer bei einem Fall ein Wort anders haben will, soll das
    // hier tun koennen, ohne den Katalog fuer alle zu aendern - und zwar
    // Zeile fuer Zeile, nicht als Block.
    const b = lifeskinVeprimiFuellen(t.id, zeilen, erzwingen);
    // "Wofuer" nur, wenn es leer ist - dort steht, was Dr. Gashi vor dem
    // Prompt selbst eingetragen hat.
    const zweckFeld = document.querySelector(`[data-produkt-zweck="${CSS.escape(t.id)}"]`);
    if (zweckFeld && !zweckFeld.value.trim() && eigen?.zweck) zweckFeld.value = ohneSeite(eigen.zweck);
    lifeskinStandZeigen(t.id, a || b ? (eigen?.satz ? "analyse" : t.regulli) : null);
  }

  // Abgehakt: einen unveraenderten Automatiktext wieder wegnehmen, damit
  // kein Satz zu einem Produkt stehenbleibt, das nicht verkauft wird.
  for (const kasten of document.querySelectorAll("[data-produkt-wahl]")) {
    const id = String(kasten.value);
    if (kasten.checked || gewaehlteIds.has(id)) continue;
    const satzFeld = document.querySelector(`[data-produkt-satz="${CSS.escape(id)}"]`);
    if (satzFeld && satzFeld.value.trim() === (lifeskinAutomatik.get(`satz:${id}`) || "").trim()) {
      satzFeld.value = "";
      lifeskinAutomatik.delete(`satz:${id}`);
    }
    const zeilenFelder = lifeskinVeprimiFelder(id);
    if (zeilenFelder.length
        && lifeskinVeprimiLesen(id).join("\n") === (lifeskinAutomatik.get(`veprimi:${id}`) || "").trim()) {
      for (const feld of zeilenFelder) feld.value = "";
      lifeskinAutomatik.delete(`veprimi:${id}`);
    }
    lifeskinStandZeigen(id, null);
  }

  return terapi;
}

// Woher der Text kommt - in einer Zeile unter den Feldern.
//
// Ohne sie sieht Dr. Gashi einen Satz und weiss nicht, ob sie ihn selbst
// geschrieben hat. Mit ihr sieht sie, welche Regel gegriffen hat, und kann
// im Katalog nachsehen, wenn der Satz nicht passt.
function lifeskinStandZeigen(id, regel) {
  const zeile = document.querySelector(`[data-produkt-stand="${CSS.escape(id)}"]`);
  if (!zeile) return;
  const satzFeld = document.querySelector(`[data-produkt-satz="${CSS.escape(id)}"]`);
  const jetzt = satzFeld?.value.trim() || "";
  const zuletzt = (lifeskinAutomatik.get(`satz:${id}`) || "").trim();
  if (!jetzt) zeile.textContent = "";
  else if (jetzt !== zuletzt) zeile.textContent = "Von Hand geändert";
  else if (regel === "analyse") zeile.textContent = "Aus der Analyse (JSON)";
  else zeile.textContent = regel ? `Automatik · Regel ${regel}` : "Automatik";
}

// Den Preis der Zahl der Mittel folgen lassen.
//
// 1 Produkt 29, 2 zusammen 39, 3 49, 4 59. Eine feste Zahl im Feld war schon einmal um
// zehn Euro daneben, ohne dass es jemand gemerkt hat - und wer den Preis von
// Hand aendert, behaelt seine Zahl.
function lifeskinPreisFolgen() {
  const feld = document.querySelector("#lifeskin-preis");
  if (!feld) return;
  const stand = store.getState().lifeskin || {};
  const tabelle = stand.konfig?.preise || {};
  const anzahl = document.querySelectorAll("[data-produkt-wahl]:checked").length;
  if (!anzahl) return;
  // Neue Preise (29/39/49/59) - fuer Faelle von vor dem Umstieg die alten.
  const vorschlag = Number(tabelle[String(anzahl)]) || preisFuerFall(anzahl, feld.dataset.angelegt);
  const jetzt = Number(feld.value);
  // Nur, solange dort noch ein Vorschlag steht - nicht ueber eine eigene Zahl.
  const warVorschlag = !feld.value
    || Object.values(tabelle).map(Number).includes(jetzt)
    || istPreisVorschlag(jetzt);
  if (warVorschlag) feld.value = String(vorschlag);
}

// Ein Haken an einem Mittel.
//
// Ohne Neuzeichnen: Waere hier ein Rendern, verschwaende jedes Wort, das
// Dr. Gashi gerade in ein anderes Feld getippt hat. Der Block klappt per
// Klasse auf, der Rest bleibt stehen.
function lifeskinProduktWahlGeaendert(id, an) {
  const block = document.querySelector(`[data-produkt-block="${CSS.escape(String(id))}"]`);
  block?.classList.toggle("heart-lifeskin-pwahl__text--zu", !an);
  block?.closest(".heart-lifeskin-pwahl")?.classList.toggle("heart-lifeskin-pwahl--an", Boolean(an));
  // Die drei Punkte "Çfarë merrni" dieses Produkts - nur, wenn es gewaehlt ist.
  const punkte = document.querySelector(`[data-shitja-pblock="${CSS.escape(String(id))}"]`);
  if (punkte) punkte.hidden = !an;
  lifeskinEntwurfMerken();
  vorschauAuffrischen(document);
  lifeskinTherapieFuellen();
  lifeskinPreisFolgen();
}

// Die Auswahl vor dem Prompt auf dem Geraet merken (heart-lifeskin-entwurf.js).
// Nur solange der Fall noch nicht freigegeben ist - danach gilt der Befund.
function lifeskinEntwurfMerken() {
  const stand = store.getState().lifeskin || {};
  const id = String(stand.offen || "").trim();
  if (!id || !document.querySelector("[data-produkt-wahl]")) return;
  const status = stand.berichte?.[id]?.status || "wartet";
  if (status !== "wartet") return;
  entwurfSchreiben(id, entwurfAusBogen(document));
}

// "Zuruecksetzen" - der Weg zurueck zur Automatik.
//
// Er ist die Gegenseite der Zusage, dass Handschrift stehenbleibt: Wer sich
// vertippt hat, kaeme sonst nie wieder an den erzeugten Satz.
function lifeskinTherapieNeu(id) {
  const eines = String(id || "");
  lifeskinTherapieFuellen({ erzwingen: true, nur: eines });
  setToast("Therapie", eines ? "Text neu erzeugt." : "Alle Texte neu erzeugt.", "success");
}

// Der Bogen fuer die Patientenseite.
//
// Er ist die EINE Wahrheit: Eingefuegtes JSON fuellt ihn, von Hand getippt
// wird in dieselben Felder, und freigegeben wird, was darin steht. Dass
// beides denselben Weg nimmt, ist kein Komfort - es ist der Grund, warum
// eine von Hand ausgefuellte Analyse dieselbe Seite ergibt wie eine
// eingefuegte.
function lifeskinBogenLesen() {
  const meta = JSON.parse(document.querySelector('[data-raport-meta]')?.value || '{}');
  const termat = JSON.parse(document.querySelector('[data-raport-terms]')?.value || '[]');
  // Die Texte der Therapieseite (Prompt v8) - aus ihren eigenen Feldern.
  const shitja = document.querySelector('[data-shitja]')
    ? shitjaLesen(shitjaAusFeldern(document))
    : (meta.shitja || null);
  const wert = (wahl) => document.querySelector(wahl)?.value.trim() || "";
  const feld = (id) => wert(`[data-raport="${CSS.escape(id)}"]`);
  const zahl = (id) => {
    const roh = feld(id);
    return roh === "" || !Number.isFinite(Number(roh)) ? null : Number(roh);
  };

  // Leere Zeilen fallen weg. Eine kuerzere Liste ist immer besser als eine
  // mit leeren Zeilen darauf.
  const zonaLista = [];
  for (const el of document.querySelectorAll("[data-zona-ort]")) {
    const i = el.dataset.zonaOrt;
    const zona = el.value.trim();
    const teksti = document.querySelector(`[data-zona-text="${CSS.escape(i)}"]`)?.value.trim() || "";
    if (zona || teksti) zonaLista.push({ zona, teksti });
  }

  const parametrat = [];
  for (const el of document.querySelectorAll("[data-par-emri]")) {
    const i = el.dataset.parEmri;
    const hol = (name) =>
      document.querySelector(`[data-par-${name}="${CSS.escape(i)}"]`)?.value.trim() || "";
    const emri = el.value.trim();
    if (!emri) continue;
    const shkalla = hol("shkalla");
    parametrat.push({
      ...(meta.parametrat?.[Number(i)] || {}),
      emri,
      vlera: hol("vlera"),
      grada: hol("grada"),
      thjeshte: hol("thjeshte"),
      shkalla: shkalla === "" ? (meta.schemaVersion === 3 ? null : 0) : Number(shkalla)
    });
  }
  // Absteigend, wie auf der Seite: Der Blick faellt zuerst auf das Problem.
  parametrat.sort((a, b) => (b.shkalla ?? -1) - (a.shkalla ?? -1));

  const shpjegimi = [feld("shpjegimi1"), feld("shpjegimi2")].filter(Boolean);
  const paKujdes = {};
  for (const id of ["zbehet", "nukZbehet", "pas6Muajsh"]) {
    const text = feld(id);
    if (text) paKujdes[id] = text;
  }

  const niveliRoh = feld("niveli");
  return {
    ...meta, termat, shitja,
    aerztlichGeprueft: Boolean(document.querySelector("[data-raport-reviewed]")?.checked),
    parametratVleresuar: parametrat.filter(p => p.shkalla !== null).length,
    parametratMeGjetje: parametrat.filter(p => p.shkalla > 0).length,
    zonatMeNdryshime: zonaLista.length,
    fotot: zahl("fotot"),
    zonat: zahl("zonat"),
    ekzaminimi: feld("ekzaminimi"),
    gjetjet: feld("gjetjet"),
    zonaLista,
    parametrat: parametrat.slice(0, RAPORT_MESSWERTE),
    diagnozaId: feld("diagnozaId"),
    gjetjaKryesore: feld("gjetjaKryesore"),
    gjetjaDyta: feld("gjetjaDyta"),
    synimi28: feld("synimi28"),
    diagnoza: feld("diagnoza"),
    diagnozaLat: feld("diagnozaLat"),
    niveli: niveliRoh === "" ? null : Number(niveliRoh),
    shpjegimi,
    paKujdes,
    keshilla: feld("keshilla")
  };
}

// Was gelesen wurde, in den Bogen schreiben.
//
// Es fuellt die Felder - es schreibt nichts frei. Erst "Befund freigeben"
// macht daraus die Seite des Patienten. Ein Automat, der ungefragt
// veroeffentlicht, waere auf einem Befund nicht zu verantworten.
function lifeskinBogenFuellen(raport) {
  const reviewed = document.querySelector("[data-raport-reviewed]");
  if (reviewed) reviewed.checked = false;
  const meta = document.querySelector('[data-raport-meta]');
  if (meta) meta.value = JSON.stringify(raport);
  const terms = document.querySelector('[data-raport-terms]');
  if (terms) terms.value = JSON.stringify(raport.termat || [], null, 2);
  if (document.querySelector('[data-shitja]')) {
    shitjaInFelder(raport.shitja, document);
    vorschauAuffrischen(document);
  }
  for (const el of document.querySelectorAll('[data-raport], [data-zona-ort], [data-zona-text], [data-par-emri], [data-par-vlera], [data-par-grada], [data-par-thjeshte], [data-par-shkalla]')) el.value = '';
  const setze = (wahl, wert) => {
    const el = document.querySelector(wahl);
    if (el && wert !== "" && wert !== null && wert !== undefined) el.value = String(wert);
  };
  const feld = (id, wert) => setze(`[data-raport="${CSS.escape(id)}"]`, wert);

  feld("fotot", raport.fotot);
  feld("zonat", raport.zonat);
  feld("ekzaminimi", raport.ekzaminimi);
  feld("gjetjet", raport.gjetjet);
  for (const id of ["diagnozaId", "gjetjaKryesore", "gjetjaDyta", "synimi28"]) feld(id, raport[id]);
  feld("diagnoza", raport.diagnoza);
  feld("diagnozaLat", raport.diagnozaLat);
  feld("niveli", raport.niveli);
  feld("shpjegimi1", (raport.shpjegimi || [])[0]);
  feld("shpjegimi2", (raport.shpjegimi || [])[1]);
  feld("zbehet", raport.paKujdes?.zbehet);
  feld("nukZbehet", raport.paKujdes?.nukZbehet);
  feld("pas6Muajsh", raport.paKujdes?.pas6Muajsh);
  feld("keshilla", raport.keshilla);

  (raport.zonaLista || []).slice(0, 5).forEach((z, i) => {
    setze(`[data-zona-ort="${i}"]`, z.zona);
    setze(`[data-zona-text="${i}"]`, z.teksti);
  });
  (raport.parametrat || []).slice(0, RAPORT_MESSWERTE).forEach((w, i) => {
    setze(`[data-par-emri="${i}"]`, w.emri);
    setze(`[data-par-vlera="${i}"]`, w.vlera);
    setze(`[data-par-grada="${i}"]`, w.grada);
    setze(`[data-par-thjeshte="${i}"]`, w.thjeshte);
    setze(`[data-par-shkalla="${i}"]`, w.shkalla === 0 || w.shkalla ? String(w.shkalla) : "");
  });

  // Was zugeklappt ist, kann niemand pruefen.
  const bogen = document.querySelector("#lifeskin-bogen");
  if (bogen) bogen.open = true;

  // Und die Marken nachziehen: Ohne sie stuende nach dem Uebernehmen an
  // jedem Feld weiter "leer" - gerade dann, wenn die Frage am dringendsten
  // ist, was das JSON gefuellt hat und was nicht.
  lifeskinMarkenAuffrischen();
}

// Eingefuegtes JSON uebernehmen.
//
// Es kommt aus der Zwischenablage, nicht als Datei - wer die Analyse in
// einem anderen Fenster erzeugt, hat sie dort. Ein Umweg ueber "Speichern
// unter" waere je Patient ein Schritt mehr.
async function lifeskinPromptKopieren() {
  const state = store.getState().lifeskin || {};
  const session = findeSitzung(state, state.offen);
  if (!session) { setToast('Prompt', 'Zuerst einen Fall öffnen.', 'danger'); return; }
  try {
    // PROMPT v8: Analyse und Texte der Therapieseite in einem. Er ist ein
    // Text mit Platzhaltern, keine JSON-Vorlage mehr - siehe
    // promptV8Fuellen() und docs/lifeskin-prompt-v8.txt.
    // Mit oder ohne Foto - der Schalter im Bogen entscheidet.
    const ohneFoto = document.querySelector('[data-bogen-art]')?.value === 'pa-foto';
    const response = await fetch(ohneFoto ? '/docs/lifeskin-prompt-v8-pa-foto.txt' : '/docs/lifeskin-prompt-v8.txt', {cache:'no-store'});
    if (!response.ok) throw new Error('Die Promptvorlage konnte nicht geladen werden.');
    const vorlage = await response.text();
    if (store.getState().lifeskin?.offen !== session.id) return;
    // Die angehakten Produkte gehen als festgelegte Therapie mit.
    const gewaehlt = lifeskinGewaehlteProdukte().map((p) => ({
      ...p,
      zweck: document.querySelector(`[data-produkt-zweck="${CSS.escape(String(p.id))}"]`)?.value.trim() || ""
    }));
    const text = promptV8Fuellen(vorlage, session, state.produkte || [], gewaehlt);
    const output = document.querySelector('#lifeskin-prompt-ausgabe');
    if (output) { output.value=text; output.hidden=false; }
    try { await navigator.clipboard.writeText(text); setToast('Prompt', 'Kopiert. Fehlende Angaben prüfen und mit den Gesichtsaufnahmen senden.', 'success'); }
    catch { output?.focus(); output?.select(); setToast('Prompt', 'Vorlage steht im Textfeld bereit. Vollständig kopieren.', 'success'); }
  } catch (error) { setToast('Prompt', error.message, 'danger'); }
}

async function lifeskinJsonUebernehmen() {
  const stand = document.querySelector("#lifeskin-vorlage-stand");
  const melde = (text, art = "") => {
    if (!stand) return;
    stand.textContent = text;
    stand.dataset.art = art;
  };

  const text = document.querySelector("#lifeskin-json")?.value || "";
  if (!text.trim()) { melde("Es wurde nichts eingefuegt.", "fehler"); return; }
  if (!siehtNachJson(text)) {
    melde("Das sieht nicht nach JSON aus. Erwartet wird die Antwort der Analyse.", "fehler");
    return;
  }

  // Die Fallnummer wird hier weder verlangt noch gelesen. Sie steht am
  // offenen Fall, und das ist die richtige: Was eingefuegt wird, fuellt den
  // Bogen DIESES Falls - eine abgetippte Nummer im JSON haette daran nichts
  // geaendert, sie waere nur ein Feld mehr zum Ausfuellen gewesen.

  // UEBERNOMMEN WIRD JEDE ANTWORT, DIE SICH LESEN LAESST.
  //
  // Abgelehnt wird nur noch, was gar kein JSON ergibt - ein fehlendes
  // Komma, ein halb kopierter Text. Alles andere geht in den Bogen, auch
  // wenn es vom Schema abweicht: Hier stand eine Pruefung, die bei der
  // ersten Abweichung abgebrochen hat, und der Arzt sah dann statt eines
  // gefuellten Bogens eine Zeile ueber einen Begriff, der im Befundtext
  // nicht wortgleich vorkommt. Eine fertige Analyse an so etwas scheitern
  // zu lassen, kostet den ganzen Fall; im Bogen ist es ein Handgriff.
  //
  // Was auffaellt, steht als Hinweis unter dem Feld - zum Nachsehen, nicht
  // zum Gehorchen.
  let raport;
  try {
    raport = raportLesen(text);
  } catch (fehler) {
    melde(fehler?.message || "Das liess sich nicht lesen.", "fehler");
    return;
  }
  // Der zweite Leser holt Schwere, Wochen, Preis und Produkte. Findet er
  // nichts davon, wirft er - und das darf die Uebernahme des Befundes
  // nicht mehr mitreissen: Ein v3-Bericht ohne diese Felder ist ein
  // vollstaendiger Bericht.
  let gelesen = {};
  try { gelesen = jsonLesen(text); } catch { gelesen = {}; }

  lifeskinAutomatik.clear();
  for (const el of document.querySelectorAll('[data-produkt-satz], [data-veprimi]')) el.value = '';
  lifeskinBogenFuellen(raport);

  const setze = (wahl, wert) => {
    const el = document.querySelector(wahl);
    if (el && wert !== "" && wert !== null && wert !== undefined) el.value = wert;
  };
  setze("#lifeskin-schwere", gelesen.schwere);
  for (const n of [1, 2, 3, 4]) {
    setze(`[data-zusatz="java_${n}"]`, (gelesen.javet || [])[n - 1]);
  }
  if (gelesen.preis) setze("#lifeskin-preis", String(gelesen.preis));

  // Die Therapietexte mit. Sie haengen an denselben Werten wie der Bogen -
  // wer erst anhakt und dann das JSON einfuegt, bekaeme sonst die Saetze zu
  // einer Analyse, die es nicht mehr gibt. Handschrift bleibt auch hier
  // stehen: erzwungen wird nichts.
  lifeskinTherapieFuellen();

  for (const n of raport.nevojat || []) {
    if (!n.produkt_id) continue;
    const box = document.querySelector(`[data-produkt-wahl][value="${CSS.escape(n.produkt_id)}"]`);
    if (box?.checked) setze(`[data-produkt-satz="${CSS.escape(n.produkt_id)}"]`, n.teksti);
  }

  // Die Produkte ankreuzen und ihren Satz setzen. Nur bekannte Kennungen -
  // eine Kennung, die es nicht gibt, wird gemeldet statt still verschluckt.
  const unbekannt = [];
  for (const p of gelesen.produkte || []) {
    const kasten = document.querySelector(`[data-produkt-wahl][value="${CSS.escape(p.id)}"]`);
    if (!kasten) { unbekannt.push(p.id); continue; }
    kasten.checked = true;
    if (p.satz) setze(`[data-produkt-satz="${CSS.escape(p.id)}"]`, p.satz);
  }

  const teile = [];
  if (raport.gjetjet) teile.push("Befund");
  if (raport.diagnoza) teile.push("Diagnose");
  if (raport.parametrat.length) teile.push(`${raport.parametrat.length} Messwerte`);
  if (raport.zonaLista.length) teile.push(`${raport.zonaLista.length} Zonen`);
  if (raport.shpjegimi.length) teile.push("Erklaerung");
  if (raport.paKujdes.nukZbehet) teile.push("Prognose");
  if (gelesen.produkte?.length) teile.push(`${gelesen.produkte.length} Produkte`);

  const warnung = unbekannt.length ? ` Unbekannte Produktkennung: ${unbekannt.join(", ")}.` : "";
  // Die Hinweise aus dem Vertrag. Sie stehen HINTER dem, was uebernommen
  // wurde, und in derselben Zeile: Wer den Bogen vor sich hat, sieht in
  // einem Blick, was drin ist und was daran auffaellt.
  const hinweise = raport.hinweise || [];
  const nachsatz = hinweise.length ? ` Zum Nachsehen: ${hinweise.join(" ")}` : "";
  melde(
    teile.length
      ? `Uebernommen: ${teile.join(", ")}.${warnung}${nachsatz} Bitte pruefen und dann freigeben.`
      : `Nichts erkannt. Stimmen die Namen im JSON mit dem Schema ueberein?${nachsatz}`,
    teile.length ? (warnung ? "fehler" : hinweise.length ? "hinweis" : "gut") : "fehler"
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
    actions.patchLifeskin({ produktStatus: "", produktOffen: "", produktEntwurf: null });
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
  // Der Knopf in der Analysen-Ansicht. Er ist die EINZIGE Stelle, die nach
  // der Erlaubnis fragt - und er tut es auf eine Beruehrung hin, nie von
  // selbst. Danach wird der Knopf neu beschriftet, damit man sieht, was aus
  // der Frage geworden ist.
  async schalteHeartPushEin() {
    const uid = store.getState().auth?.user?.uid || "";
    const fertig = await meldeGeraetAn(uid, { interaktiv: true, erzwingen: true });
    pushSchalterAuffrischen(root);
    if (fertig) {
      setToast("Meldungen", "Dieses Geraet bekommt jetzt neue Analysen gemeldet.", "success");
      return;
    }
    const stand = globalThis.Notification?.permission || "default";
    setToast("Meldungen", stand === "denied"
      ? "Abgelehnt. Wieder einschalten geht nur in den Einstellungen des Telefons."
      : "Hat nicht geklappt. Auf dem iPhone muss Heart ueber \u201eZum Home-Bildschirm\u201c "
        + "hinzugefuegt sein.", "danger");
  },
  // ZWEI TIPPS, NICHT EINER. Ein Deploy geht in die Produktion; ein
  // versehentlich gestreifter Knopf auf einem Telefon darf das nicht
  // ausloesen. Der erste Tipp fragt nach, der zweite tut es - und nach
  // fuenf Sekunden ohne Antwort steht wieder "Deployen" da.
  async starteDeploy(knopf = null) {
    const schalter = knopf || root.querySelector("[data-deploy-knopf]");
    if (!schalter || schalter.disabled) return;

    if (!schalter.hasAttribute("data-bestaetigen")) {
      schalter.setAttribute("data-bestaetigen", "1");
      schalter.textContent = "Wirklich deployen?";
      setTimeout(() => {
        if (!schalter.hasAttribute("data-bestaetigen")) return;
        schalter.removeAttribute("data-bestaetigen");
        schalter.textContent = "Deployen";
      }, 5000);
      return;
    }

    schalter.removeAttribute("data-bestaetigen");
    schalter.disabled = true;
    schalter.textContent = "Startet...";
    try {
      const antwort = await apiClient.request("heartDeployFunctions", {
        method: "POST",
        body: { only: "functions" }
      });
      deployKarteZeichnen(root, antwort?.deploy || null, { text: "Deploy wurde gestartet." });
      setToast("Deploy", "Der Deploy laeuft. Er dauert ein paar Minuten.", "success");
      clearTimeout(deployNachschauTakt);
      deployNachschauTakt = setTimeout(() => deployStandLesen(root, { nachschauen: true }), 8000);
    } catch (error) {
      schalter.disabled = false;
      schalter.textContent = "Deployen";
      deployKarteZeichnen(root, null, { text: error?.message || "Deploy konnte nicht gestartet werden." });
      setToast("Deploy", error?.message || "Deploy konnte nicht gestartet werden.", "danger");
    }
  },
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
  setLifeskinZeitraum(id) {
    actions.patchLifeskin({ zeitraum: String(id || "heute").trim() });
  },
  // Welcher der sechs Trichter unter der Chipreihe steht.
  setLifeskinTrichter(id) {
    actions.patchLifeskin({ trichterOffen: String(id || "main").trim() });
  },
  setLifeskinFach(id) {
    actions.patchLifeskin({ fach: String(id || "alle").trim() });
  },
  setLifeskinBestellZeitraum(id) {
    actions.patchLifeskin({ bestellZeitraum: String(id || "heute").trim() });
  },
  markiereLifeskinSitzung(id, marken) { return markiereLifeskinSitzung(id, marken); },
  lifeskinLinkKopieren(id) { return lifeskinLinkKopieren(id); },
  lifeskinTextKopieren(wert, was) { return lifeskinTextKopieren(wert, was); },
  lifeskinMarkenAuffrischen() { lifeskinMarkenAuffrischen(); },
  loescheLifeskinSitzung(id) { return loescheLifeskinSitzung(id); },
  openLifeskinProdukt(id) {
    const kennung = String(id || "").trim();
    actions.patchLifeskin({ produktOffen: kennung, produktEntwurf: null });
    // Die Bilder kommen erst jetzt und nicht mit der Liste: Alle auf
    // einmal waeren mehrere Megabyte fuer Bilder, die niemand ansieht.
    landingFototLaden(kennung);
  },
  neuesLifeskinProdukt() { actions.patchLifeskin({ produktOffen: "__neu", produktEntwurf: null }); },
  // Die Vorher/Nachher-Faelle.
  lifeskinKlapp(name, offen) {
    klappSetzen(name, offen);
    // Die Chips ueber Trichter und Faellen verschwinden mit ihrer Karte -
    // das macht das Stilblatt (:has). Hier nichts neu zeichnen.
    if (name === "raste" && offen) lifeskinRasteBilderLaden();
  },
  openLifeskinRasti(id) { oeffneLifeskinRasti(id); },
  neuesLifeskinRasti() {
    actions.patchLifeskin({ rastOffen: "__neu", rastEntwurf: null, rastLoeschen: false, rastStatus: "", rastBilderStatus: "" });
  },
  closeLifeskinRasti() {
    klappSetzen("mehr", true);
    klappSetzen("raste", true);
    actions.patchLifeskin({ rastOffen: "", rastEntwurf: null, rastLoeschen: false, rastStatus: "" });
  },
  lifeskinRastiFoto(seite) { lifeskinRastiFoto(seite); },
  speichereLifeskinRasti() { return speichereLifeskinRasti(); },
  loescheLifeskinRasti() { return loescheLifeskinRasti(); },
  lifeskinRastiOrt(id, ort) { return lifeskinRastiOrt(id, ort); },
  lifeskinRastiSchieben(id, richtung) { return lifeskinRastiSchieben(id, richtung); },
  lifeskinRastiDom(aktion, knopf) {
    rastiDom(aktion, knopf, { vorschlag: rastiPreisVorschlag, melde: (text) => setToast("Ergebnis", text, "danger") });
  },
  closeLifeskinProdukt() { actions.patchLifeskin({ produktOffen: "", produktEntwurf: null }); },
  speichereLifeskinProdukt() { return speichereLifeskinProdukt(); },
  speichereLifeskinAnbieter() { return speichereLifeskinAnbieter(); },
  lifeskinProdukteBizele() { return lifeskinProdukteBizele(); },
  lifeskinProduktfoto(datei) { return lifeskinProduktfoto(datei); },
  lifeskinProduktfotoWeg() { lifeskinProduktfotoWeg(); },
  lifeskinLandingbilder(dateien) { return lifeskinLandingbilder(dateien); },
  lifeskinLandingbildWeg(index) { return lifeskinLandingbildWeg(index); },
  lifeskinLandingbildSchieben(index, richtung) {
    return lifeskinLandingbildSchieben(index, richtung);
  },
  loescheLifeskinProdukt() { return loescheLifeskinProdukt(); },
  gibLifeskinBerichtFrei(id, wahl) { return gibLifeskinBerichtFrei(id, wahl); },
  lifeskinJson() { return lifeskinJsonUebernehmen(); },
  lifeskinPrompt() { return lifeskinPromptKopieren(); },
  lifeskinProdukteAnlegen() { return lifeskinProdukteAnlegen(); },
  lifeskinProduktWahl(id, an) { return lifeskinProduktWahlGeaendert(id, an); },
  lifeskinEntwurfMerken() { lifeskinEntwurfMerken(); },
  lifeskinVorschau() { vorschauAuffrischen(document); },
  lifeskinProduktSatzNeu(id) { return lifeskinTherapieNeu(id); },
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
    /* Die zwei Bildwahlen von Lifeskin stehen in einem Bereich, der bei
       jeder Zustandsaenderung neu geschrieben wird - ein Feld darin
       ueberlebt die offene Fotoauswahl nicht. Sie bekommen deshalb ein
       Feld, das an <body> haengt. Siehe oeffneDateiwahl(). */
    if (safeInputId === "heartLifeskinFotoInput") {
      oeffneDateiwahl(false, (dateien) => { lifeskinProduktfoto(dateien[0]); });
      return;
    }
    if (safeInputId === "heartLifeskinLandingInput") {
      oeffneDateiwahl(true, (dateien) => { lifeskinLandingbilder(dateien); });
      return;
    }
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
// Den Meldungs-Schalter beschriften.
//
// Sein Text steht im Browser (Notification.permission) und nicht im Speicher
// von Heart - deshalb wird er nach dem Zeichnen gesetzt und nicht mit
// gezeichnet. Ein Wert im Zustand waere eine zweite Wahrheit, die von der
// ersten abweichen kann, sobald jemand die Erlaubnis in den
// Systemeinstellungen aendert.
function pushSchalterAuffrischen(wurzel) {
  const kasten = wurzel?.querySelector?.("[data-push-schalter]");
  if (!kasten) return;
  const text = kasten.querySelector("[data-push-text]");
  const knopf = kasten.querySelector("[data-push-knopf]");

  // Kann das Geraet gar nicht, steht hier nichts. Ein Schalter, der nichts
  // schaltet, ist schlimmer als keiner - besonders auf dem iPhone im
  // Safari-Tab, wo Apple Web Push grundsaetzlich nicht zulaesst.
  if (!kannPush()) { kasten.hidden = true; return; }
  kasten.hidden = false;

  const stand = globalThis.Notification?.permission || "default";
  // SCHON EINGESCHALTET HEISST: HIER IST NICHTS MEHR ZU TUN.
  //
  // Hier stand "Eingeschaltet auf diesem Geraet." neben einem Knopf
  // "Aktiv", der nicht mehr zu druecken war - zwei Zeilen, die nichts
  // anbieten und nichts melden, was nicht ohnehin jede Meldung zeigt. Der
  // Schalter ist fuer den Fall da, dass die Erlaubnis noch fehlt; hat er
  // seine Arbeit getan, tritt er ab.
  if (stand === "granted") { kasten.hidden = true; return; }
  if (stand === "denied") {
    // Ab hier hilft kein Knopf mehr: Der Browser fragt nicht noch einmal.
    if (text) {
      text.textContent = "Von diesem Geraet abgelehnt. Wieder einschalten geht "
        + "nur in den Einstellungen des Telefons.";
    }
    if (knopf) { knopf.textContent = "Abgelehnt"; knopf.disabled = true; }
    return;
  }
  if (text) {
    text.textContent = "Auf dem iPhone zuerst ueber \u201eZum Home-Bildschirm\u201c "
      + "hinzufuegen \u2014 Apple laesst Meldungen nur in der installierten Fassung zu.";
  }
  if (knopf) { knopf.textContent = "Einschalten"; knopf.disabled = false; }
}

// ---------------------------------------------------------------------------
// Deploy: die Functions live schalten
// ---------------------------------------------------------------------------
//
// Das Frontend faehrt mit Vercel von selbst hoch, die Cloud Functions nicht.
// Ohne diesen Knopf braucht es einen Rechner mit Firebase-CLI, um einen
// fertigen Stand live zu bringen - und man sieht der neuen Seite nicht an,
// dass der Server noch der alte ist. Genau so stand die LifeSkin-Meldung
// wochenlang fertig im Code und nie in der Produktion.
//
// Gedeployt wird hier nichts. Angestossen wird der GitHub-Workflow, der es
// tut; der Schluessel liegt dort und bleibt dort.

const DEPLOY_WORTE = Object.freeze({
  queued: "Steht an.",
  in_progress: "Laeuft gerade...",
  requested: "Angenommen, wartet auf den Laeufer.",
  waiting: "Wartet auf eine Freigabe.",
  pending: "Wartet."
});

const DEPLOY_ERGEBNIS = Object.freeze({
  success: "Durchgelaufen.",
  failure: "Fehlgeschlagen.",
  cancelled: "Abgebrochen.",
  timed_out: "Zeit abgelaufen.",
  action_required: "Braucht eine Freigabe.",
  skipped: "Uebersprungen.",
  neutral: "Ohne Ergebnis."
});

let deployGeladenFuer = "";
let deployNachschauTakt = null;

function deployLaeuft(lauf) {
  const stand = String(lauf?.status || "");
  return stand === "queued" || stand === "in_progress" || stand === "requested" || stand === "waiting";
}

function deploySatz(lauf) {
  if (!lauf) return "Noch nie von hier aus deployt.";
  const wann = lauf.updatedAt || lauf.startedAt;
  const zeit = wann ? ` (${new Date(wann).toLocaleString("de-DE")})` : "";
  if (deployLaeuft(lauf)) return `${DEPLOY_WORTE[lauf.status] || "Laeuft..."}${zeit}`;
  const ergebnis = DEPLOY_ERGEBNIS[lauf.conclusion] || "Beendet.";
  return `Zuletzt: ${ergebnis}${zeit}`;
}

function deployKarteZeichnen(wurzel, lauf, { text = "" } = {}) {
  const karte = wurzel?.querySelector?.("[data-deploy-karte]");
  if (!karte) return;
  const satz = karte.querySelector("[data-deploy-text]");
  const knopf = karte.querySelector("[data-deploy-knopf]");
  const link = karte.querySelector("[data-deploy-link]");

  if (satz) satz.textContent = text || deploySatz(lauf);
  if (link) {
    const adresse = String(lauf?.htmlUrl || "");
    link.hidden = !adresse;
    if (adresse) link.href = adresse;
  }
  if (knopf) {
    const laeuft = deployLaeuft(lauf);
    knopf.disabled = laeuft;
    if (laeuft) {
      knopf.textContent = "Laeuft...";
      knopf.removeAttribute("data-bestaetigen");
    } else if (!knopf.hasAttribute("data-bestaetigen")) {
      knopf.textContent = "Deployen";
    }
  }
}

async function deployStandLesen(wurzel, { nachschauen = false } = {}) {
  let antwort = null;
  try {
    antwort = await apiClient.request("heartGetDeployState");
  } catch (error) {
    deployKarteZeichnen(wurzel, null, {
      text: error?.message || "Deploy-Zustand nicht lesbar."
    });
    return null;
  }
  if (antwort?.configured === false) {
    deployKarteZeichnen(wurzel, null, {
      text: "Heart ist nicht mit GitHub verbunden - ohne das kann von hier aus nicht deployt werden."
    });
    return null;
  }
  const lauf = antwort?.deploy || null;
  deployKarteZeichnen(wurzel, lauf);
  // Nachsehen, solange etwas laeuft - und nur dann. Ein Takt, der auch im
  // Leerlauf weiterlaeuft, fragt GitHub den ganzen Tag.
  if (nachschauen && deployLaeuft(lauf)) {
    clearTimeout(deployNachschauTakt);
    deployNachschauTakt = setTimeout(() => deployStandLesen(wurzel, { nachschauen: true }), 10000);
  }
  return lauf;
}

// Beim Zeichnen der Einrichtung einmal lesen, nicht bei jeder Aenderung.
// Heart zeichnet bei jedem Zustandswechsel neu; ohne diese Sperre fragte
// die Karte GitHub mehrmals je Sekunde.
function deployKarteAuffrischen(wurzel) {
  const karte = wurzel?.querySelector?.("[data-deploy-karte]");
  if (!karte) { deployGeladenFuer = ""; return; }
  if (deployGeladenFuer === "connections") return;
  deployGeladenFuer = "connections";
  deployStandLesen(wurzel, { nachschauen: true }).catch(() => {});
}

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
  if (state.shell.activeView === "connections") {
    try {
      deployKarteAuffrischen(root);
    } catch {}
  } else {
    // Wer die Ansicht verlaesst, soll beim naechsten Besuch wieder einen
    // frischen Zustand sehen - und der Nachschau-Takt hat hier nichts mehr
    // zu suchen.
    deployGeladenFuer = "";
    clearTimeout(deployNachschauTakt);
  }
  if (state.shell.activeView === "lifeskin") {
    try {
      beobachteLifeskinVorschau(root);
      lifeskinMarkenAuffrischen(root);
      pushSchalterAuffrischen(root);
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
    // Das Geraet fuer Meldungen anmelden - ohne darauf zu warten.
    //
    // NICHT INTERAKTIV: Beim Start wird nur registriert, wenn die Erlaubnis
    // schon steht. Ein Erlaubnisfenster, das von selbst aufgeht, wird
    // weggetippt, und danach ist die Antwort "denied" und nur noch in den
    // Systemeinstellungen zu aendern. Gefragt wird im Einstellungen-Schalter.
    //
    // Der Rueckgabewert interessiert hier niemanden, und ein Fehlschlag
    // bleibt folgenlos: Heart ist ein Arbeitsplatz, keine Meldeanlage.
    meldeGeraetAn(state.auth.user?.uid).catch(() => {});
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
