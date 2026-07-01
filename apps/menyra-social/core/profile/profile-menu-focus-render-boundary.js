const EMPTY_RENDER = () => "";

function isProfileRenderDebugEnabled() {
  try {
    if (globalThis?.__MENYRA_DEBUG_MENU_STATE__ === true || globalThis?.__MENYRA_DEBUG_PROFILE_RENDER__ === true) return true;
    const params = new URLSearchParams(globalThis?.location?.search || "");
    return params.get("debug-menu-state") === "1" || params.get("debug-profile-render") === "1";
  } catch {
    return false;
  }
}

function getDebugBuildToken() {
  try {
    return String(
      globalThis?.__MNYRA_BUILD_TOKEN__
      || globalThis?.__MENYRA_SOCIAL_APP_VERSION__
      || ""
    ).trim();
  } catch {
    return "";
  }
}

function logBoundaryEmptyRender(methodName = "") {
  if (!isProfileRenderDebugEnabled()) return;
  console.info("[mnyra:skeleton-render]", {
    skeletonName: "profile-menu-focus-render-boundary-empty",
    component: "profile-menu-focus-render-boundary",
    functionName: "renderWithController",
    rendererName: methodName,
    source: "lazy-boundary",
    reason: "controller-not-loaded",
    buildToken: getDebugBuildToken()
  });
}

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
    logBoundaryEmptyRender(methodName);
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
