const EMPTY_RENDER = () => "";

function importProfileMenuFocusRenderController() {
  return import("./profile-menu-focus-render-controller.js");
}

function resolveImportModule(importModuleFn) {
  return typeof importModuleFn === "function"
    ? importModuleFn
    : (() => importProfileMenuFocusRenderController());
}

export function createProfileMenuFocusRenderBoundary(deps = {}) {
  const importModule = resolveImportModule(deps.importModuleFn);
  const requestRender = typeof deps.requestRenderFn === "function"
    ? deps.requestRenderFn
    : (() => {});
  let controller = null;
  let controllerPromise = null;

  function ensureLoaded() {
    if (controller) return Promise.resolve(controller);
    if (!controllerPromise) {
      controllerPromise = importModule("./profile-menu-focus-render-controller.js")
        .then((module) => {
          const createController = module?.createProfileMenuFocusRenderController;
          if (typeof createController !== "function") {
            throw new Error("createProfileMenuFocusRenderController unavailable");
          }
          controller = createController(deps);
          requestRender();
          return controller;
        })
        .catch((err) => {
          controllerPromise = null;
          console.error("[mnyra][profile-menu-focus-render-boundary]", err);
          throw err;
        });
    }
    return controllerPromise;
  }

  function preload() {
    void ensureLoaded().catch(() => {});
  }

  function renderWithController(methodName = "", args = []) {
    const method = controller && typeof controller[methodName] === "function"
      ? controller[methodName]
      : null;
    if (method) return method(...args);
    preload();
    return EMPTY_RENDER();
  }

  return Object.freeze({
    ensureLoaded,
    preload,
    renderPublicProfileView: (...args) => renderWithController("renderPublicProfileView", args),
    renderMenuAdminView: (...args) => renderWithController("renderMenuAdminView", args),
    renderProfileView: (...args) => renderWithController("renderProfileView", args)
  });
}
