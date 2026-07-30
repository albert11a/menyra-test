function importCrmDomainRuntimeCluster() {
  return import("./crm-domain-runtime-cluster.js");
}

function resolveImportModule(importModuleFn) {
  return typeof importModuleFn === "function"
    ? importModuleFn
    : (() => importCrmDomainRuntimeCluster());
}

function callControllerMethod(controller, methodName = "", args = [], fallbackValue) {
  const method = controller && typeof controller[methodName] === "function"
    ? controller[methodName]
    : null;
  return method ? method(...args) : fallbackValue;
}

function resolveRenderFallback(deps = {}, label = "CRM po ngarkohet...") {
  const renderCrmLazyLoadingView = deps?.renderApi?.renderCrmLazyLoadingView;
  if (typeof renderCrmLazyLoadingView === "function") {
    return renderCrmLazyLoadingView(label);
  }
  return "";
}

function fallbackResolveRestaurantStatusFromLead(leadStatus = "", currentStatus = "") {
  return String(leadStatus || currentStatus || "").trim();
}

function fallbackNormalizeLeadDoc(value = {}) {
  return value && typeof value === "object" ? value : {};
}

export function createCrmDomainRuntimeBoundary(deps = {}) {
  const importModule = resolveImportModule(deps.importModuleFn);
  const requestRender = typeof deps.requestRenderFn === "function"
    ? deps.requestRenderFn
    : (typeof deps?.renderApi?.render === "function" ? deps.renderApi.render : (() => {}));
  let controller = null;
  let controllerPromise = null;

  function ensureLoaded() {
    if (controller) return Promise.resolve(controller);
    if (!controllerPromise) {
      controllerPromise = importModule("./crm-domain-runtime-cluster.js")
        .then((module) => {
          const createCluster = module?.createCrmDomainRuntimeCluster;
          if (typeof createCluster !== "function") {
            throw new Error("createCrmDomainRuntimeCluster unavailable");
          }
          controller = createCluster(deps);
          requestRender();
          return controller;
        })
        .catch((err) => {
          controllerPromise = null;
          console.error("[mnyra][crm-domain-runtime-boundary]", err);
          throw err;
        });
    }
    return controllerPromise;
  }

  function preload() {
    void ensureLoaded().catch(() => {});
  }

  function callSync(methodName = "", args = [], fallbackValue, { preloadIfMissing = true } = {}) {
    if (!controller) {
      if (preloadIfMissing) preload();
      return fallbackValue;
    }
    return callControllerMethod(controller, methodName, args, fallbackValue);
  }

  function callLoadedSync(methodName = "", args = [], fallbackValue) {
    return callSync(methodName, args, fallbackValue, { preloadIfMissing: false });
  }

  function callSyncWhenLoaded(methodName = "", args = []) {
    if (controller) {
      return callControllerMethod(controller, methodName, args);
    }
    void ensureLoaded()
      .then((loadedController) => callControllerMethod(loadedController, methodName, args))
      .catch(() => {});
    return undefined;
  }

  function callRender(methodName = "", args = [], label = "CRM po ngarkohet...") {
    if (!controller) {
      preload();
      return resolveRenderFallback(deps, label);
    }
    return callControllerMethod(controller, methodName, args, resolveRenderFallback(deps, label));
  }

  async function callAsync(methodName = "", args = [], fallbackValue) {
    const loadedController = await ensureLoaded();
    return callControllerMethod(loadedController, methodName, args, fallbackValue);
  }

  const boundary = {
    ensureLoaded,
    preload,
    queueCrmLazyRenderersPrefetch: (...args) => {
      preload();
      if (controller) return callControllerMethod(controller, "queueCrmLazyRenderersPrefetch", args);
      return undefined;
    },
    renderLeadsView: (...args) => callRender("renderLeadsView", args, "Leads po ngarkohen..."),
    isLeadInlineCreateView: (...args) => callLoadedSync("isLeadInlineCreateView", args, false),
    renderLeadEditorUi: (...args) => callRender("renderLeadEditorUi", args, "Lead po ngarkohet..."),
    refineLeadLocationAddressIndex: (...args) => callLoadedSync("refineLeadLocationAddressIndex", args, -1),
    renderLeadSettingsView: (...args) => callRender("renderLeadSettingsView", args, "Cilesimet e leads po ngarkohen..."),
    renderLeadCreationView: (...args) => callRender("renderLeadCreationView", args, "Lead po ngarkohet..."),
    resetLeadDraft: (...args) => callSyncWhenLoaded("resetLeadDraft", args),
    createLeadDraftState: (...args) => callLoadedSync("createLeadDraftState", args, {}),
    openLeadCreator: (...args) => callSyncWhenLoaded("openLeadCreator", args),
    openLeadSettingsView: (...args) => callSyncWhenLoaded("openLeadSettingsView", args),
    closeLeadSubview: (...args) => callSyncWhenLoaded("closeLeadSubview", args),
    saveLeadSettings: (...args) => callAsync("saveLeadSettings", args, false),
    getLeadPlusCodeReference: (...args) => callLoadedSync("getLeadPlusCodeReference", args, ""),
    hydrateLeadGeoFieldsFromCoords: (...args) => callSyncWhenLoaded("hydrateLeadGeoFieldsFromCoords", args),
    syncLeadDerivedFields: (...args) => callSyncWhenLoaded("syncLeadDerivedFields", args),
    renderCustomersView: (...args) => callRender("renderCustomersView", args, "Klientet po ngarkohen..."),
    renderStaffEditorView: (...args) => callRender("renderStaffEditorView", args, "Stafi po ngarkohet..."),
    renderStaffView: (...args) => callRender("renderStaffView", args, "Stafi po ngarkohet..."),
    ensureLocationPickerModal: (...args) => callSyncWhenLoaded("ensureLocationPickerModal", args),
    bindLocationPickerEvents: (...args) => callSyncWhenLoaded("bindLocationPickerEvents", args),
    openLocationPicker: (...args) => callSyncWhenLoaded("openLocationPicker", args),
    closeLocationPicker: (...args) => callSyncWhenLoaded("closeLocationPicker", args),
    confirmLocation: (...args) => callAsync("confirmLocation", args, false),
    getSecondaryAuth: (...args) => callAsync("getSecondaryAuth", args, null),
    createAuthUser: (...args) => callAsync("createAuthUser", args, null),
    ensureRestaurantPublicMeta: (...args) => callAsync("ensureRestaurantPublicMeta", args),
    normalizeLeadDoc: (...args) => callLoadedSync("normalizeLeadDoc", args, fallbackNormalizeLeadDoc(args[0])),
    normalizeLeadFromRestaurant: (...args) => callLoadedSync("normalizeLeadFromRestaurant", args, fallbackNormalizeLeadDoc(args[0])),
    leadStatusTone: (...args) => callLoadedSync("leadStatusTone", args, "slate"),
    resolveRestaurantStatusFromLead: (...args) => callLoadedSync(
      "resolveRestaurantStatusFromLead",
      args,
      fallbackResolveRestaurantStatusFromLead(args[0], args[1])
    ),
    leadBelongsToScope: (...args) => callLoadedSync("leadBelongsToScope", args, true),
    customerBelongsToScope: (...args) => callLoadedSync("customerBelongsToScope", args, true),
    refreshCustomersFromRestaurants: (...args) => callSyncWhenLoaded("refreshCustomersFromRestaurants", args),
    syncVisibleLeadPageFromItems: (...args) => callSyncWhenLoaded("syncVisibleLeadPageFromItems", args),
    loadLeads: (...args) => callAsync("loadLeads", args),
    loadCustomers: (...args) => callAsync("loadCustomers", args),
    isHiddenLegacyCeoEmail: (...args) => callLoadedSync("isHiddenLegacyCeoEmail", args, false),
    applyKnownLeadOwnershipOverride: (...args) => callLoadedSync("applyKnownLeadOwnershipOverride", args, fallbackNormalizeLeadDoc(args[0])),
    getStaffFormEmail: (...args) => callLoadedSync("getStaffFormEmail", args, ""),
    syncStaffDerivedEmailField: (...args) => callSyncWhenLoaded("syncStaffDerivedEmailField", args),
    openStaffEditor: (...args) => callSyncWhenLoaded("openStaffEditor", args),
    closeStaffEditor: (...args) => callSyncWhenLoaded("closeStaffEditor", args),
    syncStaffFormFromDom: (...args) => callSyncWhenLoaded("syncStaffFormFromDom", args),
    loadCeoStaff: (...args) => callAsync("loadCeoStaff", args),
    saveCeoStaffFromView: (...args) => callAsync("saveCeoStaffFromView", args, false),
    deleteCeoStaffFromView: (...args) => callAsync("deleteCeoStaffFromView", args, false),
    syncLeadModalDraftFromForm: (...args) => callSyncWhenLoaded("syncLeadModalDraftFromForm", args),
    addLeadModalLocationRow: (...args) => callSyncWhenLoaded("addLeadModalLocationRow", args),
    removeLeadModalLocationRow: (...args) => callSyncWhenLoaded("removeLeadModalLocationRow", args),
    saveLeadFromModal: (...args) => callAsync("saveLeadFromModal", args, false),
    deleteLeadFromModal: (...args) => callAsync("deleteLeadFromModal", args, false),
    saveCustomerFromModal: (...args) => callAsync("saveCustomerFromModal", args, false),
    convertLeadToCustomer: (...args) => callAsync("convertLeadToCustomer", args, false),
    getVerifiedMapLocation: (...args) => callLoadedSync("getVerifiedMapLocation", args, null),
    setVerifiedMapLocation: (...args) => callSyncWhenLoaded("setVerifiedMapLocation", args),
    clearVerifiedMapLocation: (...args) => callSyncWhenLoaded("clearVerifiedMapLocation", args)
  };

  boundary.crmRuntimeController = boundary;
  return Object.freeze(boundary);
}
