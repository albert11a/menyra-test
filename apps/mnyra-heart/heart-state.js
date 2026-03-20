const DEFAULT_STATUS = "idle";

export const HEART_NAV_ITEMS = Object.freeze([
  { key: "dashboard", label: "Start" },
  { key: "runs", label: "Laeufe" },
  { key: "incidents", label: "Meldungen" },
  { key: "modules", label: "Bereiche" },
  { key: "connections", label: "Einrichtung" }
]);

export function createHeartInitialState() {
  return {
    boot: {
      ready: false,
      error: "",
      lastUpdatedAt: ""
    },
    auth: {
      status: "checking",
      user: null,
      profile: null,
      access: {
        allowed: false,
        reason: ""
      },
      error: ""
    },
    shell: {
      activeView: "dashboard",
      navOpen: false,
      quickActionsOpen: false,
      standalone: false,
      mobileNavHidden: false,
      toast: null
    },
    dashboard: {
      status: DEFAULT_STATUS,
      error: "",
      data: null
    },
    runs: {
      status: DEFAULT_STATUS,
      error: "",
      items: [],
      selectedRunId: "",
      detailStatus: DEFAULT_STATUS,
      detailError: "",
      detail: null,
      pendingAction: "",
      lastRefreshAt: ""
    },
    incidents: {
      status: DEFAULT_STATUS,
      error: "",
      items: [],
      filters: {
        severity: "all",
        source: "all",
        status: "all"
      }
    },
    connections: {
      status: DEFAULT_STATUS,
      error: "",
      items: []
    }
  };
}

function sanitizeStateValue(value) {
  if (value === null || value === undefined) return value;
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") return value;
  if (value instanceof Date) return value.toISOString();
  if (Array.isArray(value)) return value.map((item) => sanitizeStateValue(item));
  if (typeof value === "object") {
    if (typeof value.toDate === "function") {
      try {
        return value.toDate().toISOString();
      } catch {
        return "";
      }
    }
    const prototype = Object.getPrototypeOf(value);
    if (prototype === Object.prototype || prototype === null) {
      return Object.fromEntries(
        Object.entries(value).map(([key, entryValue]) => [key, sanitizeStateValue(entryValue)])
      );
    }
    return String(value);
  }
  return null;
}

function cloneState(state) {
  return sanitizeStateValue(state);
}

function sanitizeAuthUser(user) {
  if (!user) return null;
  return {
    uid: String(user.uid || "").trim(),
    email: String(user.email || "").trim(),
    displayName: String(user.displayName || "").trim(),
    photoURL: String(user.photoURL || "").trim()
  };
}

function sanitizeAuthProfile(profile) {
  if (!profile || typeof profile !== "object") return null;
  return sanitizeStateValue(profile);
}

export function createHeartStore(initialState = createHeartInitialState()) {
  let state = cloneState(initialState);
  const listeners = new Set();

  function notify() {
    listeners.forEach((listener) => {
      try {
        listener(state);
      } catch (error) {
        console.error("[mnyra-heart] store listener failed", error);
      }
    });
  }

  function getState() {
    return state;
  }

  function setState(nextState) {
    state = cloneState(nextState);
    notify();
  }

  function patch(mutator) {
    const draft = cloneState(state);
    mutator(draft);
    state = draft;
    notify();
  }

  function subscribe(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  }

  function setToast(toast) {
    patch((draft) => {
      draft.shell.toast = toast || null;
    });
  }

  function setActiveView(viewKey) {
    patch((draft) => {
      draft.shell.activeView = String(viewKey || "dashboard");
      draft.shell.navOpen = false;
      draft.shell.quickActionsOpen = false;
    });
  }

  function setNavOpen(open) {
    patch((draft) => {
      draft.shell.navOpen = !!open;
      if (draft.shell.navOpen) draft.shell.quickActionsOpen = false;
    });
  }

  function setQuickActionsOpen(open) {
    const nextValue = !!open;
    if (state.shell.quickActionsOpen === nextValue) return;
    patch((draft) => {
      draft.shell.quickActionsOpen = nextValue;
      if (nextValue) draft.shell.navOpen = false;
    });
  }

  function setStandaloneMode(enabled) {
    const nextValue = !!enabled;
    if (state.shell.standalone === nextValue) return;
    patch((draft) => {
      draft.shell.standalone = nextValue;
      if (!nextValue) draft.shell.mobileNavHidden = false;
    });
  }

  function setMobileNavHidden(hidden) {
    const nextValue = !!hidden;
    if (state.shell.mobileNavHidden === nextValue) return;
    patch((draft) => {
      draft.shell.mobileNavHidden = nextValue;
    });
  }

  function setBootReady(lastUpdatedAt = "") {
    patch((draft) => {
      draft.boot.ready = true;
      draft.boot.error = "";
      draft.boot.lastUpdatedAt = lastUpdatedAt || new Date().toISOString();
    });
  }

  function setBootError(message) {
    patch((draft) => {
      draft.boot.ready = true;
      draft.boot.error = String(message || "").trim();
    });
  }

  function setAuthChecking() {
    patch((draft) => {
      draft.auth.status = "checking";
      draft.auth.error = "";
    });
  }

  function setAuthSigningIn() {
    patch((draft) => {
      draft.auth.status = "signing-in";
      draft.auth.error = "";
    });
  }

  function setAuthGuest() {
    patch((draft) => {
      draft.auth.status = "guest";
      draft.auth.user = null;
      draft.auth.profile = null;
      draft.auth.access = { allowed: false, reason: "" };
      draft.auth.error = "";
    });
  }

  function setAuthDenied(user, profile, reason = "") {
    patch((draft) => {
      draft.auth.status = "denied";
      draft.auth.user = sanitizeAuthUser(user);
      draft.auth.profile = sanitizeAuthProfile(profile);
      draft.auth.access = { allowed: false, reason: String(reason || "").trim() || "CEO-Zugang erforderlich." };
      draft.auth.error = "";
    });
  }

  function setAuthReady(user, profile, accessReason = "") {
    patch((draft) => {
      draft.auth.status = "authenticated";
      draft.auth.user = sanitizeAuthUser(user);
      draft.auth.profile = sanitizeAuthProfile(profile);
      draft.auth.access = { allowed: true, reason: accessReason };
      draft.auth.error = "";
    });
  }

  function setAuthError(message) {
    patch((draft) => {
      draft.auth.status = "error";
      draft.auth.error = String(message || "").trim() || "Anmeldung fehlgeschlagen.";
    });
  }

  function setDashboardLoading() {
    patch((draft) => {
      draft.dashboard.status = "loading";
      draft.dashboard.error = "";
    });
  }

  function setDashboardData(data) {
    patch((draft) => {
      draft.dashboard.status = "ready";
      draft.dashboard.error = "";
      draft.dashboard.data = data || null;
      draft.boot.lastUpdatedAt = new Date().toISOString();
    });
  }

  function setDashboardError(message) {
    patch((draft) => {
      draft.dashboard.status = "error";
      draft.dashboard.error = String(message || "").trim() || "Startansicht konnte nicht geladen werden.";
    });
  }

  function setRunsLoading() {
    patch((draft) => {
      draft.runs.status = "loading";
      draft.runs.error = "";
    });
  }

  function setRunsData(items) {
    patch((draft) => {
      draft.runs.status = "ready";
      draft.runs.error = "";
      draft.runs.items = Array.isArray(items) ? items.slice() : [];
      if (!draft.runs.selectedRunId && draft.runs.items.length) {
        draft.runs.selectedRunId = String(draft.runs.items[0].id || "");
      }
      draft.runs.lastRefreshAt = new Date().toISOString();
    });
  }

  function setRunsError(message) {
    patch((draft) => {
      draft.runs.status = "error";
      draft.runs.error = String(message || "").trim() || "Laufliste konnte nicht geladen werden.";
    });
  }

  function setSelectedRun(runId) {
    patch((draft) => {
      draft.runs.selectedRunId = String(runId || "").trim();
      draft.runs.detailError = "";
    });
  }

  function setRunDetailLoading() {
    patch((draft) => {
      draft.runs.detailStatus = "loading";
      draft.runs.detailError = "";
    });
  }

  function setRunDetailData(detail) {
    patch((draft) => {
      draft.runs.detailStatus = "ready";
      draft.runs.detailError = "";
      draft.runs.detail = detail || null;
      if (detail?.id) draft.runs.selectedRunId = String(detail.id);
    });
  }

  function setRunDetailError(message) {
    patch((draft) => {
      draft.runs.detailStatus = "error";
      draft.runs.detailError = String(message || "").trim() || "Laufdetails konnten nicht geladen werden.";
    });
  }

  function setPendingRunAction(actionKey) {
    patch((draft) => {
      draft.runs.pendingAction = String(actionKey || "").trim();
    });
  }

  function setIncidentsLoading() {
    patch((draft) => {
      draft.incidents.status = "loading";
      draft.incidents.error = "";
    });
  }

  function setIncidentsData(items) {
    patch((draft) => {
      draft.incidents.status = "ready";
      draft.incidents.error = "";
      draft.incidents.items = Array.isArray(items) ? items.slice() : [];
    });
  }

  function setIncidentsError(message) {
    patch((draft) => {
      draft.incidents.status = "error";
      draft.incidents.error = String(message || "").trim() || "Meldungen konnten nicht geladen werden.";
    });
  }

  function setIncidentFilter(key, value) {
    patch((draft) => {
      draft.incidents.filters[String(key || "").trim()] = String(value || "").trim() || "all";
    });
  }

  function setConnectionsLoading() {
    patch((draft) => {
      draft.connections.status = "loading";
      draft.connections.error = "";
    });
  }

  function setConnectionsData(items) {
    patch((draft) => {
      draft.connections.status = "ready";
      draft.connections.error = "";
      draft.connections.items = Array.isArray(items) ? items.slice() : [];
    });
  }

  function setConnectionsError(message) {
    patch((draft) => {
      draft.connections.status = "error";
      draft.connections.error = String(message || "").trim() || "Einrichtung konnte nicht geladen werden.";
    });
  }

  return {
    getState,
    setState,
    patch,
    subscribe,
    actions: {
      setToast,
      setActiveView,
      setNavOpen,
      setQuickActionsOpen,
      setStandaloneMode,
      setMobileNavHidden,
      setBootReady,
      setBootError,
      setAuthChecking,
      setAuthSigningIn,
      setAuthGuest,
      setAuthDenied,
      setAuthReady,
      setAuthError,
      setDashboardLoading,
      setDashboardData,
      setDashboardError,
      setRunsLoading,
      setRunsData,
      setRunsError,
      setSelectedRun,
      setRunDetailLoading,
      setRunDetailData,
      setRunDetailError,
      setPendingRunAction,
      setIncidentsLoading,
      setIncidentsData,
      setIncidentsError,
      setIncidentFilter,
      setConnectionsLoading,
      setConnectionsData,
      setConnectionsError
    }
  };
}
