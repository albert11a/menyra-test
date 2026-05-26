function importSocialEngagementRuntimeController() {
  return import("./social-engagement-runtime-controller.js");
}

function resolveImportModule(importModuleFn) {
  return typeof importModuleFn === "function"
    ? importModuleFn
    : (() => importSocialEngagementRuntimeController());
}

function callControllerMethod(controller, methodName = "", args = [], fallbackValue) {
  const method = controller && typeof controller[methodName] === "function"
    ? controller[methodName]
    : null;
  return method ? method(...args) : fallbackValue;
}

export function createSocialEngagementRuntimeBoundary(deps = {}) {
  const importModule = resolveImportModule(deps.importModuleFn);
  let controller = null;
  let controllerPromise = null;

  function ensureLoaded() {
    if (controller) return Promise.resolve(controller);
    if (!controllerPromise) {
      controllerPromise = importModule("./social-engagement-runtime-controller.js")
        .then((module) => {
          const createController = module?.createSocialEngagementRuntimeController;
          if (typeof createController !== "function") {
            throw new Error("createSocialEngagementRuntimeController unavailable");
          }
          controller = createController(deps);
          return controller;
        })
        .catch((err) => {
          controllerPromise = null;
          console.error("[mnyra][social-engagement-runtime-boundary]", err);
          throw err;
        });
    }
    return controllerPromise;
  }

  function preload() {
    void ensureLoaded().catch(() => {});
  }

  function callSync(methodName = "", args = [], fallbackValue) {
    if (!controller) {
      preload();
      return fallbackValue;
    }
    return callControllerMethod(controller, methodName, args, fallbackValue);
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

  async function callAsync(methodName = "", args = [], fallbackValue) {
    const loadedController = await ensureLoaded();
    return callControllerMethod(loadedController, methodName, args, fallbackValue);
  }

  return Object.freeze({
    ensureLoaded,
    preload,
    updatePostCounts: (...args) => callAsync("updatePostCounts", args, false),
    addComment: (...args) => callAsync("addComment", args, false),
    togglePostLike: (...args) => callAsync("togglePostLike", args, false),
    toggleMenuItemLike: (...args) => callAsync("toggleMenuItemLike", args, false),
    addMenuItemComment: (...args) => callAsync("addMenuItemComment", args, false),
    toggleCommentLike: (...args) => callAsync("toggleCommentLike", args, false),
    stopPostMetaListeners: (...args) => callSync("stopPostMetaListeners", args),
    attachPostMetaListeners: (...args) => callSyncWhenLoaded("attachPostMetaListeners", args),
    stopMenuItemMetaListeners: (...args) => callSync("stopMenuItemMetaListeners", args),
    attachMenuItemMetaListeners: (...args) => callSyncWhenLoaded("attachMenuItemMetaListeners", args),
    loadMenuItemMetaFromFirebase: (...args) => callAsync("loadMenuItemMetaFromFirebase", args, null),
    hydrateMenuCardViewerLikes: (...args) => callAsync("hydrateMenuCardViewerLikes", args),
    getPostDocRef: (...args) => callSync("getPostDocRef", args, null),
    getFeedDocRef: (...args) => callSync("getFeedDocRef", args, null),
    resolveRestaurantOwnerUid: (...args) => callAsync("resolveRestaurantOwnerUid", args, ""),
    resolvePostOwnerUid: (...args) => callAsync("resolvePostOwnerUid", args, ""),
    loadPostMetaFromFirebase: (...args) => callAsync("loadPostMetaFromFirebase", args, { likes: [], comments: [] }),
    loadPostLikesForModal: (...args) => callAsync("loadPostLikesForModal", args, [])
  });
}
