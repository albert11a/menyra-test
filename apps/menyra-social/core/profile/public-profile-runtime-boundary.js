function callControllerMethod(controller, methodName = "", args = [], fallbackValue) {
  const method = controller && typeof controller[methodName] === "function"
    ? controller[methodName]
    : null;
  return method ? method(...args) : fallbackValue;
}

function readDocData(doc = null) {
  return typeof doc?.data === "function" ? doc.data() : (doc?.data || doc || {});
}

function fallbackNormalizeExternalProfile({ profileDoc = null, restaurant = null, posts = [] } = {}) {
  const data = readDocData(profileDoc);
  const rest = restaurant || {};
  const restaurantId = String(data?.restaurantId || data?.landingRestaurantId || profileDoc?.id || rest?.id || "").trim();
  return {
    ...rest,
    ...data,
    restaurantId,
    posts: Array.isArray(posts) ? posts : []
  };
}

function fallbackNormalizeExternalUserProfile({ userDoc = null, fallback = null, posts = [] } = {}) {
  const data = readDocData(userDoc);
  return {
    ...(fallback || {}),
    ...data,
    posts: Array.isArray(posts) ? posts : []
  };
}

export function createPublicProfileRuntimeBoundary(deps = {}) {
  const importModule = typeof deps.importModuleFn === "function"
    ? deps.importModuleFn
    : (() => import("./public-profile-runtime-controller.js"));
  const requestRender = typeof deps.requestRenderFn === "function"
    ? deps.requestRenderFn
    : (typeof deps.render === "function" ? deps.render : (() => {}));
  let controller = null;
  let controllerPromise = null;
  let fallbackProfileViewUnsub = null;

  function ensureLoaded() {
    if (controller) return Promise.resolve(controller);
    if (!controllerPromise) {
      controllerPromise = importModule("./public-profile-runtime-controller.js")
        .then((module) => {
          const createController = module?.createPublicProfileRuntimeController;
          if (typeof createController !== "function") {
            throw new Error();
          }
          controller = createController(deps);
          if (fallbackProfileViewUnsub && typeof controller.setProfileViewUnsub === "function") {
            controller.setProfileViewUnsub(fallbackProfileViewUnsub);
          }
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

  function preloadPublicProfileRuntime() {
    void ensureLoaded().catch(() => {});
  }

  function callSync(methodName = "", args = [], fallbackValue, { preloadIfMissing = true } = {}) {
    if (!controller) {
      if (preloadIfMissing) preloadPublicProfileRuntime();
      return fallbackValue;
    }
    return callControllerMethod(controller, methodName, args, fallbackValue);
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

  async function callAsync(methodName = "", args = [], fallbackValue) {
    const loadedController = await ensureLoaded();
    return callControllerMethod(loadedController, methodName, args, fallbackValue);
  }

  function getProfileViewUnsub() {
    if (controller) return callControllerMethod(controller, "getProfileViewUnsub", [], null);
    return fallbackProfileViewUnsub;
  }

  function setProfileViewUnsub(next) {
    fallbackProfileViewUnsub = next;
    if (controller) {
      return callControllerMethod(controller, "setProfileViewUnsub", [next]);
    }
    return undefined;
  }

  function stopProfileViewListener() {
    if (controller) {
      return callControllerMethod(controller, "stopProfileViewListener", []);
    }
    if (typeof fallbackProfileViewUnsub === "function") {
      try {
        fallbackProfileViewUnsub();
      } catch {}
    }
    fallbackProfileViewUnsub = null;
    return undefined;
  }

  return Object.freeze({
    ensurePublicProfileRuntimeLoaded: ensureLoaded,
    preloadPublicProfileRuntime,
    getProfileViewUnsub,
    setProfileViewUnsub,
    stopProfileViewListener,
    attachProfileViewListener: (...args) => callWhenLoaded("attachProfileViewListener", args),
    showPublicProfile: (...args) => callWhenLoaded("showPublicProfile", args),
    normalizeExternalProfile: (...args) => callSync(
      "normalizeExternalProfile",
      args,
      fallbackNormalizeExternalProfile(...args),
      { preloadIfMissing: true }
    ),
    normalizeExternalUserProfile: (...args) => callSync(
      "normalizeExternalUserProfile",
      args,
      fallbackNormalizeExternalUserProfile(...args),
      { preloadIfMissing: true }
    ),
    fetchBusinessProfileDoc: (...args) => callAsync("fetchBusinessProfileDoc", args, null),
    loadBusinessPostsForRestaurant: (...args) => callAsync("loadBusinessPostsForRestaurant", args, [])
  });
}
