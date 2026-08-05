const DEFAULT_STATUS = "idle";
const CRM_ADMIN_DOMAIN_KEYS = Object.freeze(["leads", "customers", "ads", "staff", "businessAccounts"]);

export const HEART_NAV_ITEMS = Object.freeze([
  { key: "dashboard", label: "Start" },
  { key: "runs", label: "Laeufe" },
  { key: "incidents", label: "Meldungen" },
  { key: "modules", label: "Bereiche" },
  { key: "analytics", label: "Analytics" },
  { key: "landing", label: "Landing" },
  { key: "crmLeads", label: "Leads" },
  { key: "crmCustomers", label: "Kunden" },
  { key: "crmAds", label: "Ads" },
  { key: "crmStaff", label: "Staff" },
  { key: "destinations", label: "Orte" },
  { key: "connections", label: "Einrichtung" }
]);

export function createHeartDestinationsInitialState() {
  return {
    status: "idle",
    error: "",
    items: [],
    loadedAt: "",
    published: {
      status: "idle",
      error: "",
      items: []
    },
    editor: {
      open: false,
      destinationId: "",
      loading: false,
      saving: false,
      publishing: false,
      deleting: false,
      uploading: false,
      status: "",
      error: "",
      draft: null
    }
  };
}

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
      toast: null,
      modal: {
        kind: "",
        packKey: "",
        runId: "",
        crmDomain: "",
        itemId: "",
        mode: "",
        draft: {}
      }
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
      lastRefreshAt: "",
      launcherExpanded: false,
      detailExpanded: false,
      historyTab: "current",
      historyEditMode: false,
      historySelectedRunIds: []
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
    },
    setup: {
      status: DEFAULT_STATUS,
      error: "",
      data: null,
      pendingAction: "",
      searchQuery: "",
      searchStatus: DEFAULT_STATUS,
      searchError: "",
      searchResults: []
    },
    analytics: {
      businessesStatus: DEFAULT_STATUS,
      businessesError: "",
      businesses: [],
      businessQuery: "",
      selectedBusinessId: "",
      selectedBusinessName: "",
      rangeKey: "7d",
      customFrom: "",
      customTo: "",
      status: DEFAULT_STATUS,
      error: "",
      model: null,
      lastLoadedAt: ""
    },
    landing: {
      status: DEFAULT_STATUS,
      error: "",
      sessions: [],
      archived: [],
      abgeschnitten: false,
      grenze: 0,
      tab: "active",
      selectedId: "",
      loadedAt: ""
    },
    destinations: createHeartDestinationsInitialState(),
    crmAdmin: {
      status: DEFAULT_STATUS,
      error: "",
      lastRefreshAt: "",
      readLoadersReady: false,
      missingReadDeps: [],
      sections: CRM_ADMIN_DOMAIN_KEYS.reduce((acc, key) => {
        acc[key] = {
          status: DEFAULT_STATUS,
          error: "",
          missingDeps: [],
          missingContext: "",
          items: [],
          hasMore: false,
          knownCount: 0,
          countExact: true,
          scopeCounts: {},
          scopeCountExact: {},
          scopeLoaded: {},
          loadedAt: "",
          scope: key === "staff" || key === "businessAccounts" || key === "ads" ? "" : "own",
          query: "",
          categoryFilter: "",
          statusFilter: "",
          ...(key === "staff"
            ? {
              buildStatus: {},
              buildStatusLoading: false,
              buildStatusError: ""
            }
            : {})
        };
        return acc;
      }, {})
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
      draft.shell.modal = { kind: "", packKey: "", runId: "", crmDomain: "", itemId: "", mode: "", draft: {} };
      if (draft.shell.activeView !== "runs") {
        draft.runs.launcherExpanded = false;
        draft.runs.detailExpanded = false;
      }
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

  function setModal(modal = {}) {
    patch((draft) => {
      draft.shell.modal = {
        kind: String(modal.kind || "").trim(),
        packKey: String(modal.packKey || "").trim(),
        runId: String(modal.runId || "").trim(),
        crmDomain: String(modal.crmDomain || "").trim(),
        itemId: String(modal.itemId || "").trim(),
        mode: String(modal.mode || "").trim(),
        draft: sanitizeStateValue(modal.draft && typeof modal.draft === "object" ? modal.draft : {})
      };
      draft.shell.navOpen = false;
      draft.shell.quickActionsOpen = false;
      draft.runs.detailExpanded = false;
      draft.runs.historyEditMode = false;
      draft.runs.historySelectedRunIds = [];
    });
  }

  function closeModal() {
    patch((draft) => {
      draft.shell.modal = { kind: "", packKey: "", runId: "", crmDomain: "", itemId: "", mode: "", draft: {} };
      draft.runs.detailExpanded = false;
    });
  }

  function patchAuthProfile(profilePatch = {}) {
    if (!profilePatch || typeof profilePatch !== "object") return;
    patch((draft) => {
      draft.auth.profile = sanitizeStateValue({
        ...(draft.auth.profile && typeof draft.auth.profile === "object" ? draft.auth.profile : {}),
        ...profilePatch
      });
    });
  }

  function setCrmEditorDraft(draftPatch = {}) {
    if (!draftPatch || typeof draftPatch !== "object") return;
    patch((draft) => {
      if (draft.shell.modal?.kind !== "crm-editor") return;
      draft.shell.modal.draft = sanitizeStateValue({
        ...(draft.shell.modal.draft && typeof draft.shell.modal.draft === "object" ? draft.shell.modal.draft : {}),
        ...draftPatch
      });
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
      const selectedExists = draft.runs.items.some((item) => String(item?.id || "") === String(draft.runs.selectedRunId || ""));
      if (!selectedExists) {
        draft.runs.selectedRunId = draft.runs.items.length ? String(draft.runs.items[0].id || "") : "";
      }
      draft.runs.historySelectedRunIds = draft.runs.historySelectedRunIds.filter((runId) => (
        draft.runs.items.some((item) => String(item?.id || "") === String(runId || ""))
      ));
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
      draft.runs.detailExpanded = false;
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
      draft.runs.detailExpanded = false;
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

  function setRunsLauncherExpanded(expanded) {
    patch((draft) => {
      draft.runs.launcherExpanded = !!expanded;
    });
  }

  function setRunDetailExpanded(expanded) {
    patch((draft) => {
      draft.runs.detailExpanded = !!expanded;
    });
  }

  function setRunsHistoryTab(tabKey) {
    patch((draft) => {
      draft.runs.historyTab = String(tabKey || "current").trim() || "current";
      draft.runs.historyEditMode = false;
      draft.runs.historySelectedRunIds = [];
    });
  }

  function setRunsHistoryEditMode(enabled) {
    patch((draft) => {
      draft.runs.historyEditMode = !!enabled;
      if (!draft.runs.historyEditMode) {
        draft.runs.historySelectedRunIds = [];
      }
    });
  }

  function toggleRunsHistorySelection(runId) {
    const safeRunId = String(runId || "").trim();
    if (!safeRunId) return;
    patch((draft) => {
      const current = new Set(draft.runs.historySelectedRunIds || []);
      if (current.has(safeRunId)) current.delete(safeRunId);
      else current.add(safeRunId);
      draft.runs.historySelectedRunIds = Array.from(current);
    });
  }

  function clearRunsHistorySelection() {
    patch((draft) => {
      draft.runs.historySelectedRunIds = [];
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

  function setSetupLoading() {
    patch((draft) => {
      draft.setup.status = "loading";
      draft.setup.error = "";
    });
  }

  function setSetupData(data) {
    patch((draft) => {
      draft.setup.status = "ready";
      draft.setup.error = "";
      draft.setup.data = data || null;
      draft.setup.searchQuery = String(data?.restaurantQuery || data?.restaurantName || data?.restaurantId || "").trim();
    });
  }

  function setSetupError(message) {
    patch((draft) => {
      draft.setup.status = "error";
      draft.setup.error = String(message || "").trim() || "Heart-Einrichtung konnte nicht geladen werden.";
    });
  }

  function setSetupPendingAction(actionKey) {
    patch((draft) => {
      draft.setup.pendingAction = String(actionKey || "").trim();
    });
  }

  function setSetupSearchLoading(query = "") {
    patch((draft) => {
      draft.setup.searchStatus = "loading";
      draft.setup.searchError = "";
      draft.setup.searchQuery = String(query || "").trim();
    });
  }

  function setSetupSearchResults(items = [], query = "") {
    patch((draft) => {
      draft.setup.searchStatus = "ready";
      draft.setup.searchError = "";
      draft.setup.searchResults = Array.isArray(items) ? items.slice() : [];
      draft.setup.searchQuery = String(query || "").trim();
    });
  }

  function setSetupSearchError(message, query = "") {
    patch((draft) => {
      draft.setup.searchStatus = "error";
      draft.setup.searchError = String(message || "").trim() || "Restaurants konnten nicht geladen werden.";
      draft.setup.searchQuery = String(query || "").trim();
    });
  }

  function patchAnalytics(patchValue = {}) {
    if (!patchValue || typeof patchValue !== "object") return;
    patch((draft) => {
      draft.analytics = sanitizeStateValue({
        ...(draft.analytics && typeof draft.analytics === "object" ? draft.analytics : {}),
        ...patchValue
      });
    });
  }

  function ensureDestinationsSlice(draft) {
    if (!draft.destinations || typeof draft.destinations !== "object") {
      draft.destinations = createHeartDestinationsInitialState();
    }
    return draft.destinations;
  }

  function setLandingLoading() {
    patch((draft) => {
      draft.landing.status = "loading";
      draft.landing.error = "";
    });
  }

  function setLandingData({ sessions = [], archived = [], abgeschnitten = false, grenze = 0 } = {}) {
    patch((draft) => {
      draft.landing.status = "ready";
      draft.landing.error = "";
      draft.landing.sessions = Array.isArray(sessions) ? sessions : [];
      draft.landing.archived = Array.isArray(archived) ? archived : [];
      draft.landing.abgeschnitten = abgeschnitten === true;
      draft.landing.grenze = Number(grenze) || 0;
      draft.landing.loadedAt = new Date().toISOString();
    });
  }

  function setLandingTab(tab = "active") {
    patch((draft) => {
      draft.landing.tab = tab === "archived" ? "archived" : "active";
      // Beim Wechseln des Reiters die geoeffnete Auswertung schliessen: Sonst
      // steht man in der Auswertung eines Lokals, das im anderen Reiter liegt.
      draft.landing.selectedId = "";
    });
  }

  // Sofort umschalten, ohne auf Firestore zu warten - der Griff soll sich
  // anfuehlen, als haette er gewirkt. Geht das Schreiben daneben, wird es von
  // aussen wieder zurueckgedreht.
  function setLandingArchived(restaurantId = "", archived = true) {
    patch((draft) => {
      const id = String(restaurantId || "");
      const ohne = draft.landing.archived.filter((eintrag) => eintrag !== id);
      draft.landing.archived = archived ? ohne.concat(id) : ohne;
      if (archived && draft.landing.selectedId === id) draft.landing.selectedId = "";
    });
  }

  function setLandingError(message = "") {
    patch((draft) => {
      draft.landing.status = "error";
      draft.landing.error = String(message || "Landings konnten nicht geladen werden.");
    });
  }

  function setLandingSelected(restaurantId = "") {
    patch((draft) => {
      draft.landing.selectedId = String(restaurantId || "");
    });
  }

  function setDestinationsLoading() {
    patch((draft) => {
      const slice = ensureDestinationsSlice(draft);
      slice.status = "loading";
      slice.error = "";
    });
  }

  function setDestinationsData(items = []) {
    patch((draft) => {
      const slice = ensureDestinationsSlice(draft);
      slice.status = "ready";
      slice.error = "";
      slice.items = sanitizeStateValue(Array.isArray(items) ? items.slice() : []);
      slice.loadedAt = new Date().toISOString();
    });
  }

  function setDestinationsError(message = "") {
    patch((draft) => {
      const slice = ensureDestinationsSlice(draft);
      slice.status = "error";
      slice.error = String(message || "").trim() || "Destinationen konnten nicht geladen werden.";
    });
  }

  function patchDestinationsPublished(patchValue = {}) {
    if (!patchValue || typeof patchValue !== "object") return;
    patch((draft) => {
      const slice = ensureDestinationsSlice(draft);
      slice.published = sanitizeStateValue({
        ...(slice.published && typeof slice.published === "object" ? slice.published : {}),
        ...patchValue
      });
    });
  }

  function openDestinationEditor({ destinationId = "", draft: editorDraft = null, loading = false } = {}) {
    patch((draft) => {
      const slice = ensureDestinationsSlice(draft);
      slice.editor = sanitizeStateValue({
        open: true,
        destinationId: String(destinationId || "").trim(),
        loading: !!loading,
        saving: false,
        publishing: false,
        deleting: false,
        uploading: false,
        status: "",
        error: "",
        draft: editorDraft && typeof editorDraft === "object" ? editorDraft : null
      });
    });
  }

  function patchDestinationEditor(patchValue = {}) {
    if (!patchValue || typeof patchValue !== "object") return;
    patch((draft) => {
      const slice = ensureDestinationsSlice(draft);
      slice.editor = sanitizeStateValue({
        ...(slice.editor && typeof slice.editor === "object" ? slice.editor : {}),
        ...patchValue
      });
    });
  }

  function closeDestinationEditor() {
    patch((draft) => {
      const slice = ensureDestinationsSlice(draft);
      slice.editor = {
        open: false,
        destinationId: "",
        loading: false,
        saving: false,
        publishing: false,
        deleting: false,
        uploading: false,
        status: "",
        error: "",
        draft: null
      };
    });
  }

  function setCrmAdminContract(contract = {}) {
    patch((draft) => {
      draft.crmAdmin.readLoadersReady = contract.readLoadersReady === true;
      draft.crmAdmin.missingReadDeps = Array.isArray(contract.missingReadDeps)
        ? contract.missingReadDeps.slice()
        : [];
    });
  }

  function setCrmAdminLoading(domainKey = "", options = {}) {
    const key = String(domainKey || "").trim();
    if (!CRM_ADMIN_DOMAIN_KEYS.includes(key)) return;
    const nextScope = String(options.scope || "").trim();
    patch((draft) => {
      draft.crmAdmin.status = "loading";
      draft.crmAdmin.error = "";
      draft.crmAdmin.sections[key] = {
        ...draft.crmAdmin.sections[key],
        status: "loading",
        error: "",
        missingDeps: [],
        missingContext: "",
        ...(nextScope ? { scope: nextScope } : {})
      };
    });
  }

  function setCrmAdminMissing(domainKey = "", missingDeps = []) {
    const key = String(domainKey || "").trim();
    if (!CRM_ADMIN_DOMAIN_KEYS.includes(key)) return;
    patch((draft) => {
      draft.crmAdmin.sections[key] = {
        ...draft.crmAdmin.sections[key],
        status: "missing",
        error: "",
        missingDeps: Array.isArray(missingDeps) ? missingDeps.slice() : [],
        missingContext: "",
        items: [],
        hasMore: false,
        knownCount: 0,
        countExact: true,
        scopeCounts: {},
        scopeCountExact: {},
        scopeLoaded: {},
        scope: key === "staff" || key === "businessAccounts" || key === "ads" ? "" : "own"
      };
    });
  }

  function setCrmAdminData(domainKey = "", payload = {}) {
    const key = String(domainKey || "").trim();
    if (!CRM_ADMIN_DOMAIN_KEYS.includes(key)) return;
    const payloadItems = Array.isArray(payload.items) ? payload.items.slice() : [];
    const payloadRows = Array.isArray(payload.rows) ? payload.rows.slice() : [];
    const items = (key === "leads" || key === "customers")
      ? (payloadRows.length ? payloadRows : payloadItems)
      : (payloadItems.length ? payloadItems : payloadRows);
    patch((draft) => {
      const loadedAt = new Date().toISOString();
      const nextScope = String(payload.scope || draft.crmAdmin.sections[key].scope || "").trim();
      const nextKnownCount = Number.isFinite(Number(payload.knownCount)) ? Math.max(0, Number(payload.knownCount)) : items.length;
      draft.crmAdmin.status = "ready";
      draft.crmAdmin.error = "";
      draft.crmAdmin.lastRefreshAt = loadedAt;
      draft.crmAdmin.sections[key] = {
        ...draft.crmAdmin.sections[key],
        status: "ready",
        error: "",
        missingDeps: [],
        missingContext: String(payload.missingContext || "").trim(),
        items,
        hasMore: payload.hasMore === true,
        knownCount: nextKnownCount,
        countExact: payload.countExact !== false,
        scopeCounts: nextScope
          ? {
            ...(draft.crmAdmin.sections[key].scopeCounts || {}),
            [nextScope]: nextKnownCount
          }
          : { ...(draft.crmAdmin.sections[key].scopeCounts || {}) },
        scopeCountExact: nextScope
          ? {
            ...(draft.crmAdmin.sections[key].scopeCountExact || {}),
            [nextScope]: payload.countExact !== false
          }
          : { ...(draft.crmAdmin.sections[key].scopeCountExact || {}) },
        scopeLoaded: nextScope
          ? {
            ...(draft.crmAdmin.sections[key].scopeLoaded || {}),
            [nextScope]: true
          }
          : { ...(draft.crmAdmin.sections[key].scopeLoaded || {}) },
        loadedAt,
        scope: nextScope,
        ...(key === "staff"
          ? {
            buildStatus: payload.buildStatus && typeof payload.buildStatus === "object" ? sanitizeStateValue(payload.buildStatus) : {},
            buildStatusLoading: payload.buildStatusLoading === true,
            buildStatusError: String(payload.buildStatusError || "").trim()
          }
          : {})
      };
    });
  }

  function setCrmAdminSectionUi(domainKey = "", patchValue = {}) {
    const key = String(domainKey || "").trim();
    if (!CRM_ADMIN_DOMAIN_KEYS.includes(key)) return;
    patch((draft) => {
      draft.crmAdmin.sections[key] = {
        ...draft.crmAdmin.sections[key],
        ...(Object.prototype.hasOwnProperty.call(patchValue, "scope")
          ? { scope: String(patchValue.scope || "").trim() }
          : {}),
        ...(Object.prototype.hasOwnProperty.call(patchValue, "query")
          ? { query: String(patchValue.query || "") }
          : {}),
        ...(Object.prototype.hasOwnProperty.call(patchValue, "categoryFilter")
          ? { categoryFilter: String(patchValue.categoryFilter || "").trim() }
          : {}),
        ...(Object.prototype.hasOwnProperty.call(patchValue, "statusFilter")
          ? { statusFilter: String(patchValue.statusFilter || "").trim() }
          : {})
      };
    });
  }

  function setCrmAdminError(domainKey = "", message = "") {
    const key = String(domainKey || "").trim();
    const safeMessage = String(message || "").trim() || "CRM/Admin Daten konnten nicht geladen werden.";
    if (!CRM_ADMIN_DOMAIN_KEYS.includes(key)) {
      patch((draft) => {
        draft.crmAdmin.status = "error";
        draft.crmAdmin.error = safeMessage;
      });
      return;
    }
    patch((draft) => {
      draft.crmAdmin.status = "error";
      draft.crmAdmin.error = safeMessage;
      draft.crmAdmin.sections[key] = {
        ...draft.crmAdmin.sections[key],
        status: "error",
        error: safeMessage,
        missingDeps: [],
        missingContext: ""
      };
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
      setModal,
      closeModal,
      patchAuthProfile,
      setCrmEditorDraft,
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
      setRunsLauncherExpanded,
      setRunDetailExpanded,
      setRunsHistoryTab,
      setRunsHistoryEditMode,
      toggleRunsHistorySelection,
      clearRunsHistorySelection,
      setIncidentsLoading,
      setIncidentsData,
      setIncidentsError,
      setIncidentFilter,
      setConnectionsLoading,
      setConnectionsData,
      setConnectionsError,
      setSetupLoading,
      setSetupData,
      setSetupError,
      setSetupPendingAction,
      setSetupSearchLoading,
      setSetupSearchResults,
      setSetupSearchError,
      patchAnalytics,
      setLandingLoading,
      setLandingData,
      setLandingError,
      setLandingSelected,
      setLandingTab,
      setLandingArchived,
      setDestinationsLoading,
      setDestinationsData,
      setDestinationsError,
      patchDestinationsPublished,
      openDestinationEditor,
      patchDestinationEditor,
      closeDestinationEditor,
      setCrmAdminContract,
      setCrmAdminLoading,
      setCrmAdminMissing,
      setCrmAdminData,
      setCrmAdminSectionUi,
      setCrmAdminError
    }
  };
}
