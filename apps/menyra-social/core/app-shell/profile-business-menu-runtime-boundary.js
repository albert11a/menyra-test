function callControllerMethod(controller, methodName = "", args = [], fallbackValue) {
  const method = controller && typeof controller[methodName] === "function"
    ? controller[methodName]
    : null;
  return method ? method(...args) : fallbackValue;
}

export function createProfileBusinessMenuRuntimeBoundary(deps = {}) {
  const importModule = typeof deps.importModuleFn === "function"
    ? deps.importModuleFn
    : (() => import("./profile-business-menu-runtime-cluster.js"));
  const requestRender = typeof deps?.profileMenuDeps?.requestRenderFn === "function"
    ? deps.profileMenuDeps.requestRenderFn
    : (() => {});
  let controller = null;
  let controllerPromise = null;
  let lastVisiblePublicProfileWarmupKey = "";

  function getVisiblePublicProfileForWarmup() {
    const state = deps?.state && typeof deps.state === "object" ? deps.state : null;
    if (!state) return null;
    if (String(state.activeTab || "").trim().toLowerCase() !== "profile") return null;
    const view = state.profileView && typeof state.profileView === "object" ? state.profileView : null;
    const profile = view?.profile && typeof view.profile === "object" ? view.profile : null;
    if (!view || !profile) return null;
    const restaurantId = String(profile.canonicalRestaurantId || profile.restaurantId || "").trim();
    if (!restaurantId) return null;
    return { state, view, profile, restaurantId };
  }

  function buildVisiblePublicProfileWarmupKey(visible = null) {
    if (!visible) return "";
    const directEntry = visible.view?.directEntry && typeof visible.view.directEntry === "object"
      ? visible.view.directEntry
      : null;
    return [
      visible.restaurantId,
      String(visible.state?.profileTopTab || directEntry?.topTab || "").trim().toLowerCase(),
      String(visible.state?.profileContentTab || directEntry?.contentTab || "").trim().toLowerCase(),
      String(visible.view?.menuAccessSource || directEntry?.menuAccessSource || "").trim().toLowerCase(),
      String(visible.view?.tableNumber || directEntry?.tableNumber || 0).trim()
    ].join("::");
  }

  function shouldWarmMenuDirectly(visible = null) {
    if (!visible) return false;
    const directEntry = visible.view?.directEntry && typeof visible.view.directEntry === "object"
      ? visible.view.directEntry
      : null;
    const topTab = String(visible.state?.profileTopTab || directEntry?.topTab || "").trim().toLowerCase();
    const contentTab = String(visible.state?.profileContentTab || directEntry?.contentTab || "").trim().toLowerCase();
    const menuAccessSource = String(visible.view?.menuAccessSource || directEntry?.menuAccessSource || "").trim().toLowerCase();
    return topTab === "menu"
      || contentTab === "menu"
      || menuAccessSource === "qr"
      || directEntry?.menuFirst === true;
  }

  function warmVisiblePublicProfileData(loadedController = null) {
    const visible = getVisiblePublicProfileForWarmup();
    if (!visible || !loadedController) return;
    const warmupKey = buildVisiblePublicProfileWarmupKey(visible);
    if (!warmupKey || warmupKey === lastVisiblePublicProfileWarmupKey) return;
    lastVisiblePublicProfileWarmupKey = warmupKey;
    callControllerMethod(loadedController, "preloadProfileMenuFocusRender", []);
    callControllerMethod(loadedController, "ensurePostsDataForProfile", [visible.profile]);
    if (shouldWarmMenuDirectly(visible)) {
      callControllerMethod(loadedController, "ensureMenuDataForProfile", [visible.profile]);
    }
  }

  function ensureLoaded() {
    if (controller) return Promise.resolve(controller);
    if (!controllerPromise) {
      controllerPromise = importModule("./profile-business-menu-runtime-cluster.js")
        .then((module) => {
          const createCluster = module?.createProfileBusinessMenuRuntimeCluster;
          if (typeof createCluster !== "function") {
            throw new Error();
          }
          controller = createCluster(deps);
          warmVisiblePublicProfileData(controller);
          requestRender();
          return controller;
        })
        .catch((err) => {
          controllerPromise = null;
          throw err;
        });
    }
    return controllerPromise;
  }

  function preload() {
    void ensureLoaded().catch(() => {});
  }

  function callWhenLoaded(methodName = "", args = []) {
    if (controller) {
      return callControllerMethod(controller, methodName, args);
    }
    void ensureLoaded()
      .then((loadedController) => callControllerMethod(loadedController, methodName, args))
      .catch(() => {});
    return undefined;
  }

  function callRender(methodName = "", args = []) {
    if (!controller) {
      preload();
      return "";
    }
    warmVisiblePublicProfileData(controller);
    return callControllerMethod(controller, methodName, args, "");
  }

  async function callAsync(methodName = "", args = [], fallbackValue) {
    const loadedController = await ensureLoaded();
    return callControllerMethod(loadedController, methodName, args, fallbackValue);
  }

  return Object.freeze({
    ensureLoaded,
    preload,
    ensurePostsDataForProfile: (...args) => callWhenLoaded("ensurePostsDataForProfile", args),
    ensureMenuDataForProfile: (...args) => callWhenLoaded("ensureMenuDataForProfile", args),
    ensureEditorMenuDataForProfile: (...args) => callWhenLoaded("ensureEditorMenuDataForProfile", args),
    ensureFocusDataForProfile: (...args) => callWhenLoaded("ensureFocusDataForProfile", args),
    loadBusinessAccounts: (...args) => callAsync("loadBusinessAccounts", args, []),
    renderBusinessAccountsView: (...args) => callRender("renderBusinessAccountsView", args),
    bindBusinessAccountsEvents: (...args) => callWhenLoaded("bindBusinessAccountsEvents", args),
    preloadProfileMenuFocusRender: (...args) => callWhenLoaded("preloadProfileMenuFocusRender", args),
    ensureProfileMenuFocusRenderLoaded: (...args) => callAsync("ensureProfileMenuFocusRenderLoaded", args, null),
    renderPublicProfileView: (...args) => callRender("renderPublicProfileView", args),
    renderMenuAdminView: (...args) => callRender("renderMenuAdminView", args),
    renderProfileView: (...args) => callRender("renderProfileView", args)
  });
}
