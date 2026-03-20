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
  renderHeartApp
} from "./heart-render.js";
import {
  createHeartInitialState,
  createHeartStore
} from "./heart-state.js";
import {
  createHeartTestRunnerAdapter
} from "./heart-test-runner-adapter.js";

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

let toastTimer = null;
let previousState = store.getState();
let authBootstrapSessionKey = "";
let refreshAllPromise = null;

function setToast(title, message = "", tone = "neutral") {
  actions.setToast({ title, message, tone });
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => actions.setToast(null), 3600);
}

async function refreshDashboard() {
  actions.setDashboardLoading();
  try {
    const data = await monitoringAdapter.loadDashboard();
    actions.setDashboardData(data);
  } catch (error) {
    actions.setDashboardError(error?.message || "Dashboard loading failed.");
    setToast("Dashboard error", error?.message || "Dashboard loading failed.", "danger");
  }
}

async function refreshIncidents() {
  actions.setIncidentsLoading();
  try {
    const payload = await monitoringAdapter.loadIncidents();
    actions.setIncidentsData(payload.items);
  } catch (error) {
    actions.setIncidentsError(error?.message || "Incident loading failed.");
  }
}

async function refreshConnections() {
  actions.setConnectionsLoading();
  try {
    const payload = await monitoringAdapter.loadConnections();
    actions.setConnectionsData(payload.items);
  } catch (error) {
    actions.setConnectionsError(error?.message || "Connection loading failed.");
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
    actions.setRunDetailError(error?.message || "Run detail loading failed.");
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
    actions.setRunsError(error?.message || "Run history loading failed.");
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
        refreshRuns({ focusRunId })
      ]);
      actions.setBootReady(new Date().toISOString());
    } finally {
      refreshAllPromise = null;
    }
  })();
  return refreshAllPromise;
}

async function startRun(mode = "smoke") {
  actions.setPendingRunAction(mode);
  try {
    if (mode === "synthetic") {
      await testRunnerAdapter.startSyntheticRun();
      setToast("Synthetic queued", "Full synthetic run was queued through the secure runner adapter.", "success");
    } else {
      await testRunnerAdapter.startSmokeRun();
      setToast("Smoke queued", "Smoke run was queued through the secure runner adapter.", "success");
    }
    actions.setActiveView("runs");
    await refreshAll();
  } catch (error) {
    setToast("Run trigger failed", error?.message || "Unable to queue the run.", "danger");
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
    setToast("Cancellation requested", "Heart asked the secure runner provider to cancel the run.", "warning");
    await refreshAll({ focusRunId: safeRunId });
  } catch (error) {
    setToast("Cancel failed", error?.message || "Unable to cancel the run.", "danger");
  } finally {
    actions.setPendingRunAction("");
  }
}

const operations = {
  async login({ email, password }) {
    try {
      await authController.login(email, password);
    } catch (error) {
      actions.setAuthError(error?.message || "Login failed.");
      setToast("Login failed", error?.message || "Authentication failed.", "danger");
    }
  },
  async logout() {
    try {
      await authController.logout();
    } catch (error) {
      setToast("Logout failed", error?.message || "Unable to sign out.", "danger");
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
    await startRun("synthetic");
  },
  async openRun(runId) {
    actions.setActiveView("runs");
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
  setIncidentFilter(key, value) {
    actions.setIncidentFilter(key, value);
  }
};

bindHeartEvents({ root, operations });

store.subscribe((state) => {
  renderHeartApp(root, state);

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
      setToast("Initial sync failed", error?.message || "Heart failed to load the initial control snapshot.", "danger");
    }));
  }
});

renderHeartApp(root, store.getState());
authController.initialize().catch((error) => {
  actions.setAuthError(error?.message || "Auth startup failed.");
});

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    const serviceWorkerUrl = window.location.pathname.startsWith("/apps/mnyra-heart/")
      ? "/apps/mnyra-heart/sw.js"
      : "/heart/sw.js";
    navigator.serviceWorker.register(serviceWorkerUrl).catch(() => {});
  });
}

window.addEventListener("beforeunload", () => {
  authController.destroy();
});
