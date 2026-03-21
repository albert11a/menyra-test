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
  createHeartMonitoringAdapter
} from "./heart-monitoring-adapter.js";
import {
  createHeartSetupAdapter
} from "./heart-setup-adapter.js";
import {
  renderHeartApp
} from "./heart-render.js";
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

const root = document.getElementById("heartApp");
const store = createHeartStore(createHeartInitialState());
const actions = store.actions;
const authController = createHeartAuthController({ store });
const runtimeConfig = globalThis.__MNYRA_HEART_CONFIG__ || {};
const apiClient = createHeartApiClient({
  authController,
  apiBase: runtimeConfig.apiBase || document.querySelector('meta[name="heart-api-base"]')?.content || "/api/heart/",
  fallbackApiBase: runtimeConfig.fallbackApiBase || document.querySelector('meta[name="heart-api-fallback-base"]')?.content || ""
});
const monitoringAdapter = createHeartMonitoringAdapter({ apiClient });
const testRunnerAdapter = createHeartTestRunnerAdapter({ apiClient });
const setupAdapter = createHeartSetupAdapter({ apiClient });

let toastTimer = null;
let previousState = store.getState();
let authBootstrapSessionKey = "";
let refreshAllPromise = null;
let displayModeQuery = null;
let displayModeCleanup = null;
let runPollingTimer = null;
const notifiedCompletedRunIds = new Set();

function isStandaloneDisplayMode() {
  try {
    if (window.matchMedia?.("(display-mode: standalone)").matches) return true;
  } catch {}
  return window.navigator?.standalone === true;
}

function syncViewportSurface(state = store.getState()) {
  const lockDocument = !!state.shell?.navOpen || !!state.shell?.modal?.kind;
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
    return ["ceo", "business", "staff", "user"];
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
    runPollingTimer = window.setInterval(() => {
      refreshAll({ focusRunId: getRefreshFocusRunId(store.getState()) }).catch(() => {});
    }, 6500);
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
      const tone = ["failed", "critical"].includes(String(finishedRun.status || "").toLowerCase())
        ? "danger"
        : String(finishedRun.status || "").toLowerCase() === "warning"
          ? "warning"
          : "success";
      setToast("Run ist fertig", `${findPackLabel(finishedRun.packKey || finishedRun.mode)} ist fertig.`, tone);
      notifiedCompletedRunIds.add(runId);
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
      allowLiveMutations: currentSetup.allowLiveMutations === true
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
  },
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
  async searchSetupRestaurants(query) {
    await searchSetupRestaurants(query);
  },
  async saveSetup(values) {
    await saveSetup(values);
  },
  async selectSetupRestaurant(payload) {
    await saveSetup({
      ...payload,
      allowLiveMutations: store.getState().setup.data?.allowLiveMutations === true
    });
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
  setIncidentFilter(key, value) {
    actions.setIncidentFilter(key, value);
  }
};

bindHeartEvents({ root, operations });

store.subscribe((state) => {
  renderHeartApp(root, state);
  syncViewportSurface(state);
  syncRunPolling(state);

  notifyCompletedRuns(previousState, state);

  const authChanged = previousState.auth.status !== state.auth.status
    || previousState.auth.user?.uid !== state.auth.user?.uid
    || previousState.auth.access?.allowed !== state.auth.access?.allowed;
  const authSessionKey = state.auth.status === "authenticated" && state.auth.access?.allowed
    ? `${state.auth.user?.uid || ""}:${state.auth.access?.reason || ""}`
    : "";
  previousState = state;

  if (!authSessionKey) {
    authBootstrapSessionKey = "";
    return;
  }

  if (authChanged && authSessionKey !== authBootstrapSessionKey) {
    authBootstrapSessionKey = authSessionKey;
    queueMicrotask(() => refreshAll().catch((error) => {
      setToast("Erster Abruf", error?.message || "Heart konnte den ersten Status nicht laden.", "danger");
    }));
  }
});

renderHeartApp(root, store.getState());
syncViewportSurface(store.getState());
authController.initialize().catch((error) => {
  actions.setAuthError(error?.message || "Anmeldung konnte nicht vorbereitet werden.");
});
installViewportObservers();

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    const serviceWorkerUrl = new URL("./sw.js", import.meta.url);
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
