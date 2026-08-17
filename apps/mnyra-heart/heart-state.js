const DEFAULT_STATUS = "idle";
const CRM_ADMIN_DOMAIN_KEYS = Object.freeze(["leads", "customers", "ads", "staff", "businessAccounts"]);

export const HEART_NAV_ITEMS = Object.freeze([
  { key: "dashboard", label: "Start" },
  { key: "landing", label: "Landing" },
  { key: "crmLeads", label: "Leads" },
  { key: "crmCustomers", label: "Kunden" },
  { key: "crmAds", label: "Ads" },
  { key: "crmStaff", label: "Staff" },
  { key: "destinations", label: "Orte" },
  { key: "mnyraGo", label: "Mnyra GO" },
  { key: "analytics", label: "Analytics" },
  { key: "connections", label: "Einrichtung" }
]);

// Die Scheiben des Zustands. Sie stehen hier, weil jede Aenderung sie einzeln
// kopiert: So bekommt jeder Zustand neue Objekte an genau den Stellen, die sich
// geaendert haben, und der Rest wird weitergegeben statt nachgebaut.
const STATE_SLICE_KEYS = Object.freeze([
  "boot",
  "auth",
  "shell",
  "connections",
  "setup",
  "mnyraGo",
  "analytics",
  "landing",
  "destinations",
  "crmAdmin"
]);

const EMPTY_MODAL = Object.freeze({
  kind: "",
  packKey: "",
  runId: "",
  crmDomain: "",
  itemId: "",
  mode: "",
  draft: {}
});

function createEmptyModal() {
  return { ...EMPTY_MODAL, draft: {} };
}

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
      standalone: false,
      toast: null,
      modal: createEmptyModal()
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
    // Mnyra GO: die Provision. Der Zeitraum steht hier und nicht in der
    // Adresse - er ist eine Frage an die Zahlen, kein anderer Ort.
    mnyraGo: {
      status: DEFAULT_STATUS,
      error: "",
      days: 30,
      data: null
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
      // Vorgemerkt fuer "Next": Lokale, deren Landing noch niemand geoeffnet
      // hat. Jeder Eintrag traegt Name, Ort, Slug und Bild bei sich - es gibt
      // keine Sitzung, aus der sich das ableiten liesse.
      next: [],
      // "Waiting": derselbe Eintrag, einen Schritt weiter - der Link ist raus.
      waiting: [],
      // Zurueckgesetzt: je Lokal der Zeitpunkt, ab dem gezaehlt wird. Was
      // davor liegt, wird schon beim Lesen weggelassen.
      resets: [],
      nextQuery: "",
      abgeschnitten: false,
      grenze: 0,
      tab: "active",
      selectedId: "",
      loadedAt: "",
      // "cache", solange nur der Geraetespeicher gelesen wurde, "network",
      // sobald der echte Stand da ist. Daran haengt, ob noch nachgeladen wird.
      loadedFrom: ""
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

export function sanitizeStateValue(value) {
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

// Ein Entwurf des naechsten Zustands. Kopiert wird die Huelle und jede Scheibe,
// nicht der Inhalt: Vorher wurde bei jeder Aenderung der komplette Zustand
// tief kopiert - mit hunderten Landing-Sitzungen und Leads darin war das bei
// jedem Tastendruck im Suchfeld sofort zu spueren.
function createStateDraft(state) {
  const draft = { ...state };
  STATE_SLICE_KEYS.forEach((key) => {
    const slice = draft[key];
    if (slice && typeof slice === "object" && !Array.isArray(slice)) {
      draft[key] = { ...slice };
    }
  });
  // Die CRM-Abschnitte werden einzeln ersetzt, also braucht auch ihre Mappe
  // eine eigene Kopie.
  if (draft.crmAdmin?.sections && typeof draft.crmAdmin.sections === "object") {
    draft.crmAdmin.sections = { ...draft.crmAdmin.sections };
  }
  return draft;
}

export function createHeartStore(initialState = createHeartInitialState()) {
  let state = sanitizeStateValue(initialState);
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
    state = sanitizeStateValue(nextState);
    notify();
  }

  // Ein Mutator darf die Scheiben des Entwurfs neu belegen
  // (`draft.landing.tab = ...`). Was tiefer liegt, wird als ganzes Objekt
  // ersetzt, nicht von innen geaendert - sonst traegt der vorige Zustand die
  // Aenderung mit, und der Vergleich "hat sich etwas getan" geht daneben.
  function patch(mutator) {
    const draft = createStateDraft(state);
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
      draft.shell.modal = createEmptyModal();
    });
  }

  function setNavOpen(open) {
    const nextValue = !!open;
    if (state.shell.navOpen === nextValue) return;
    patch((draft) => {
      draft.shell.navOpen = nextValue;
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
    });
  }

  function closeModal() {
    patch((draft) => {
      draft.shell.modal = createEmptyModal();
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
      const modal = draft.shell.modal || {};
      if (modal.kind !== "crm-editor") return;
      draft.shell.modal = {
        ...modal,
        draft: sanitizeStateValue({
          ...(modal.draft && typeof modal.draft === "object" ? modal.draft : {}),
          ...draftPatch
        })
      };
    });
  }

  function setStandaloneMode(enabled) {
    const nextValue = !!enabled;
    if (state.shell.standalone === nextValue) return;
    patch((draft) => {
      draft.shell.standalone = nextValue;
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
      draft.auth.profile = sanitizeStateValue(profile && typeof profile === "object" ? profile : null);
      draft.auth.access = { allowed: false, reason: String(reason || "").trim() || "CEO-Zugang erforderlich." };
      draft.auth.error = "";
    });
  }

  function setAuthReady(user, profile, accessReason = "") {
    patch((draft) => {
      draft.auth.status = "authenticated";
      draft.auth.user = sanitizeAuthUser(user);
      draft.auth.profile = sanitizeStateValue(profile && typeof profile === "object" ? profile : null);
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
      draft.connections.items = sanitizeStateValue(Array.isArray(items) ? items : []);
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
      draft.setup.data = sanitizeStateValue(data || null);
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
      draft.setup.searchResults = sanitizeStateValue(Array.isArray(items) ? items : []);
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
      Object.entries(patchValue).forEach(([key, value]) => {
        draft.analytics[key] = sanitizeStateValue(value);
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

  function setLandingData({
    sessions = [],
    archived = [],
    next = [],
    waiting = [],
    resets = [],
    abgeschnitten = false,
    grenze = 0,
    fromCache = false
  } = {}) {
    patch((draft) => {
      draft.landing.status = "ready";
      draft.landing.error = "";
      draft.landing.sessions = sanitizeStateValue(Array.isArray(sessions) ? sessions : []);
      draft.landing.archived = sanitizeStateValue(Array.isArray(archived) ? archived : []);
      draft.landing.next = sanitizeStateValue(Array.isArray(next) ? next : []);
      draft.landing.waiting = sanitizeStateValue(Array.isArray(waiting) ? waiting : []);
      draft.landing.resets = sanitizeStateValue(Array.isArray(resets) ? resets : []);
      draft.landing.abgeschnitten = abgeschnitten === true;
      draft.landing.grenze = Number(grenze) || 0;
      draft.landing.loadedAt = new Date().toISOString();
      draft.landing.loadedFrom = fromCache ? "cache" : "network";
    });
  }


  // ---------------------------------------------------------------------
  // Mnyra GO - die Provision.
  // ---------------------------------------------------------------------

  function setMnyraGoLoading(days = 0) {
    patch((draft) => {
      draft.mnyraGo.status = "loading";
      draft.mnyraGo.error = "";
      if (Number(days) > 0) draft.mnyraGo.days = Math.trunc(Number(days));
    });
  }

  function setMnyraGoData(data = null) {
    patch((draft) => {
      draft.mnyraGo.status = "ready";
      draft.mnyraGo.error = "";
      draft.mnyraGo.data = sanitizeStateValue(data || null);
      const days = Number(data?.range?.days) || 0;
      if (days > 0) draft.mnyraGo.days = days;
    });
  }

  function setMnyraGoError(message = "") {
    patch((draft) => {
      draft.mnyraGo.status = "error";
      draft.mnyraGo.error = String(message || "").trim();
    });
  }

  const LANDING_TABS = ["active", "next", "waiting", "archived"];

  function setLandingTab(tab = "active") {
    patch((draft) => {
      draft.landing.tab = LANDING_TABS.includes(tab) ? tab : "active";
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

  // Steht schon etwas auf dem Schirm - etwa aus dem Geraetespeicher -, wird es
  // von einem gescheiterten Nachladen nicht weggeraeumt. Eine leere Seite mit
  // Fehlermeldung ist schlechter als gestrige Zahlen mit einem Hinweis daneben.
  function setLandingError(message = "") {
    patch((draft) => {
      draft.landing.error = String(message || "Landings konnten nicht geladen werden.");
      if (!draft.landing.sessions.length) draft.landing.status = "error";
    });
  }

  function setLandingSelected(restaurantId = "") {
    patch((draft) => {
      draft.landing.selectedId = String(restaurantId || "");
    });
  }

  function setLandingNextQuery(value = "") {
    patch((draft) => {
      draft.landing.nextQuery = String(value || "");
    });
  }

  // Sofort in die Liste, ohne auf Firestore zu warten - wie beim Ablegen.
  // Geht das Schreiben daneben, wird es von aussen zurueckgedreht.
  function setLandingNextEntry(entry = {}, vorgemerkt = true) {
    patch((draft) => {
      const id = String(entry?.restaurantId || "").trim();
      if (!id) return;
      const ohne = (draft.landing.next || []).filter((eintrag) => eintrag.restaurantId !== id);
      draft.landing.next = vorgemerkt
        ? [sanitizeStateValue({ ...entry, restaurantId: id }), ...ohne]
        : ohne;
    });
  }

  // Auf Waiting legen und wieder herunternehmen - wie beim Vormerken sofort,
  // ohne auf Firestore zu warten.
  function setLandingWaitingEntry(entry = {}, wartet = true) {
    patch((draft) => {
      const id = String(entry?.restaurantId || "").trim();
      if (!id) return;
      const ohne = (draft.landing.waiting || []).filter((eintrag) => eintrag.restaurantId !== id);
      draft.landing.waiting = wartet
        ? [sanitizeStateValue({ ...entry, restaurantId: id }), ...ohne]
        : ohne;
    });
  }

  // Zuruecksetzen: Die Sitzungen des Lokals verschwinden aus der Anzeige, und
  // der Zeitpunkt bleibt stehen. Beides sofort, damit der Griff sich anfuehlt,
  // als haette er gewirkt; der naechste Abgleich mit dem Server bestaetigt es.
  function applyLandingReset(entry = {}, at = "") {
    patch((draft) => {
      const id = String(entry?.restaurantId || "").trim();
      const zeitpunkt = String(at || "").trim();
      if (!id || !zeitpunkt) return;
      draft.landing.sessions = (draft.landing.sessions || [])
        .filter((session) => session.restaurantId !== id);
      const ohne = (draft.landing.resets || []).filter((eintrag) => eintrag.restaurantId !== id);
      draft.landing.resets = [sanitizeStateValue({ ...entry, restaurantId: id, at: zeitpunkt }), ...ohne];
    });
  }

  // Sobald ein Lokal geoeffnet wurde, gehoert es unter Aktiv und nicht mehr in
  // eine der beiden Arbeitslisten: Next heisst "noch zu verschicken", Waiting
  // heisst "verschickt, noch nicht geoeffnet". Beides ist damit erledigt.
  function dropLandingNextEntries(ids = []) {
    const weg = new Set((Array.isArray(ids) ? ids : []).map((id) => String(id || "")).filter(Boolean));
    if (!weg.size) return;
    patch((draft) => {
      const bleibt = (draft.landing.next || []).filter((eintrag) => !weg.has(eintrag.restaurantId));
      if (bleibt.length !== (draft.landing.next || []).length) draft.landing.next = bleibt;
    });
  }

  function dropLandingWaitingEntries(ids = []) {
    const weg = new Set((Array.isArray(ids) ? ids : []).map((id) => String(id || "")).filter(Boolean));
    if (!weg.size) return;
    patch((draft) => {
      const bleibt = (draft.landing.waiting || []).filter((eintrag) => !weg.has(eintrag.restaurantId));
      if (bleibt.length !== (draft.landing.waiting || []).length) draft.landing.waiting = bleibt;
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
      slice.items = sanitizeStateValue(Array.isArray(items) ? items : []);
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

  function patchCrmSection(draft, key, sectionPatch) {
    draft.crmAdmin.sections[key] = {
      ...draft.crmAdmin.sections[key],
      ...sectionPatch
    };
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
      patchCrmSection(draft, key, {
        status: "loading",
        error: "",
        missingDeps: [],
        missingContext: "",
        ...(nextScope ? { scope: nextScope } : {})
      });
    });
  }

  function setCrmAdminMissing(domainKey = "", missingDeps = []) {
    const key = String(domainKey || "").trim();
    if (!CRM_ADMIN_DOMAIN_KEYS.includes(key)) return;
    patch((draft) => {
      patchCrmSection(draft, key, {
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
      });
    });
  }

  function setCrmAdminData(domainKey = "", payload = {}) {
    const key = String(domainKey || "").trim();
    if (!CRM_ADMIN_DOMAIN_KEYS.includes(key)) return;
    const payloadItems = Array.isArray(payload.items) ? payload.items : [];
    const payloadRows = Array.isArray(payload.rows) ? payload.rows : [];
    const rawItems = (key === "leads" || key === "customers")
      ? (payloadRows.length ? payloadRows : payloadItems)
      : (payloadItems.length ? payloadItems : payloadRows);
    // Hier ist die Grenze: Was aus Firestore kommt, wird einmal in schlichte
    // Werte umgewandelt. Danach kann jede Aenderung den Zustand
    // weiterverwenden, ohne ihn erneut durchzugehen.
    const items = sanitizeStateValue(rawItems);
    patch((draft) => {
      const previous = draft.crmAdmin.sections[key];
      const loadedAt = new Date().toISOString();
      const nextScope = String(payload.scope || previous.scope || "").trim();
      const nextKnownCount = Number.isFinite(Number(payload.knownCount))
        ? Math.max(0, Number(payload.knownCount))
        : items.length;
      draft.crmAdmin.status = "ready";
      draft.crmAdmin.error = "";
      draft.crmAdmin.lastRefreshAt = loadedAt;
      patchCrmSection(draft, key, {
        status: "ready",
        error: "",
        missingDeps: [],
        missingContext: String(payload.missingContext || "").trim(),
        items,
        hasMore: payload.hasMore === true,
        knownCount: nextKnownCount,
        countExact: payload.countExact !== false,
        scopeCounts: nextScope
          ? { ...(previous.scopeCounts || {}), [nextScope]: nextKnownCount }
          : { ...(previous.scopeCounts || {}) },
        scopeCountExact: nextScope
          ? { ...(previous.scopeCountExact || {}), [nextScope]: payload.countExact !== false }
          : { ...(previous.scopeCountExact || {}) },
        scopeLoaded: nextScope
          ? { ...(previous.scopeLoaded || {}), [nextScope]: true }
          : { ...(previous.scopeLoaded || {}) },
        loadedAt,
        scope: nextScope,
        ...(key === "staff"
          ? {
            buildStatus: payload.buildStatus && typeof payload.buildStatus === "object"
              ? sanitizeStateValue(payload.buildStatus)
              : {},
            buildStatusLoading: payload.buildStatusLoading === true,
            buildStatusError: String(payload.buildStatusError || "").trim()
          }
          : {})
      });
    });
  }

  function setCrmAdminSectionUi(domainKey = "", patchValue = {}) {
    const key = String(domainKey || "").trim();
    if (!CRM_ADMIN_DOMAIN_KEYS.includes(key)) return;
    patch((draft) => {
      patchCrmSection(draft, key, {
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
      });
    });
  }

  function setCrmAdminError(domainKey = "", message = "") {
    const key = String(domainKey || "").trim();
    const safeMessage = String(message || "").trim() || "CRM/Admin Daten konnten nicht geladen werden.";
    patch((draft) => {
      draft.crmAdmin.status = "error";
      draft.crmAdmin.error = safeMessage;
      if (!CRM_ADMIN_DOMAIN_KEYS.includes(key)) return;
      patchCrmSection(draft, key, {
        status: "error",
        error: safeMessage,
        missingDeps: [],
        missingContext: ""
      });
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
      setModal,
      closeModal,
      patchAuthProfile,
      setCrmEditorDraft,
      setStandaloneMode,
      setBootReady,
      setBootError,
      setAuthChecking,
      setAuthSigningIn,
      setAuthGuest,
      setAuthDenied,
      setAuthReady,
      setAuthError,
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
      setMnyraGoLoading,
      setMnyraGoData,
      setMnyraGoError,
      setLandingArchived,
      setLandingNextQuery,
      setLandingNextEntry,
      setLandingWaitingEntry,
      applyLandingReset,
      dropLandingNextEntries,
      dropLandingWaitingEntries,
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

function sanitizeAuthUser(user) {
  if (!user) return null;
  return {
    uid: String(user.uid || "").trim(),
    email: String(user.email || "").trim(),
    displayName: String(user.displayName || "").trim(),
    photoURL: String(user.photoURL || "").trim()
  };
}
