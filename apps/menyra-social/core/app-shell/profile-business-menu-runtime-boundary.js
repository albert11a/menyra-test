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
