import assert from "node:assert/strict";
import test from "node:test";

import { createSessionDataRuntimeController } from "../apps/menyra-social/core/app-shell/session-data-runtime-controller.js";
import { resolveVisiblePublicMenuSurfaceState } from "../apps/menyra-social/core/profile/public-menu-surface-state-utils.js";

const never = () => new Promise(() => {});

async function withMutedConsoleError(task) {
  const original = console.error;
  console.error = () => {};
  try {
    return await task();
  } finally {
    console.error = original;
  }
}

function createVisibleMenuState({
  restaurantId = "restaurant-a",
  canonicalRestaurantId = restaurantId,
  restaurants = []
} = {}) {
  return {
    restaurants,
    activeTab: "profile",
    profileTopTab: "menu",
    profileContentTab: "menu",
    profileView: {
      profile: {
        restaurantId,
        canonicalRestaurantId,
        role: "business"
      },
      routePayload: {
        restaurantId,
        canonicalRestaurantId
      }
    },
    __webDirectEntry: {
      active: true,
      restaurantId,
      canonicalRestaurantId,
      webPriority: true,
      menuFirst: true
    },
    menu: {
      restaurantId: "",
      items: [],
      loading: false,
      error: "",
      source: "public",
      statusBadgeVisible: true,
      routeSeed: false,
      truthState: "unknown"
    },
    focus: {
      restaurantId: "",
      items: [],
      loading: false,
      enabled: true,
      error: "",
      index: 0,
      truthSource: "public-menu",
      truthState: "unknown"
    }
  };
}

function createController({
  state = createVisibleMenuState(),
  renderFn = () => {},
  menuCache = null,
  readCacheFn = () => null,
  writeCacheFn = () => {},
  loadDeadlines = {
    menuItemsMs: 5,
    menuCollectionItemsMs: 5,
    menuMetaMs: 5,
    focusItemsMs: 5,
    focusMetaMs: 5
  },
  loadPublicMenuItemsFn = async () => [],
  loadMenuItemsFromCollectionFn = async () => [],
  loadMenuMetaFn = async () => ({ statusBadgeVisible: true }),
  loadFocusItemsFn = async () => [],
  loadFocusMetaFn = async () => true
} = {}) {
  return createSessionDataRuntimeController({
    state,
    dataLoaded: {},
    renderFn,
    menuCache,
    readCacheFn,
    writeCacheFn,
    menuCacheKeyFn: (restaurantId, source = "public") => `${restaurantId}:${source}`,
    focusCacheKeyFn: (restaurantId) => `${restaurantId}`,
    loadDeadlines,
    loadPublicMenuItemsFn,
    loadMenuItemsFromCollectionFn,
    loadMenuMetaFn,
    loadFocusItemsFn,
    loadFocusMetaFn
  });
}

function deferred() {
  let resolve;
  let reject;
  const promise = new Promise((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

function publicMenuSurface(state) {
  return resolveVisiblePublicMenuSurfaceState(state, {
    profile: state?.profileView?.profile || null,
    routePayload: state?.profileView?.routePayload || null,
    webDirectEntry: state?.__webDirectEntry || null
  }).menu;
}

const productOne = { id: "item-1", name: "Pizza", category: "Pizza" };
const productTwo = { id: "item-2", name: "Pasta", category: "Pasta" };

test("public menu read errors do not become known empty or empty cache entries", async () => {
  const state = createVisibleMenuState();
  const menuCache = new Map();
  const writes = [];
  const controller = createController({
    state,
    menuCache,
    writeCacheFn: (...args) => writes.push(args),
    loadPublicMenuItemsFn: async () => {
      throw new Error("permission denied");
    }
  });

  const result = await withMutedConsoleError(() => (
    controller.loadMenuForRestaurant("restaurant-a", { source: "public" })
  ));

  assert.notEqual(result.truthState, "knownEmpty");
  assert.notEqual(state.menu.truthState, "knownEmpty");
  assert.notEqual(publicMenuSurface(state).status, "empty");
  assert.equal(menuCache.has("restaurant-a:public"), false);
  assert.equal(writes.length, 0);
});

test("confirmed canonical empty public menu can become known empty", async () => {
  const state = createVisibleMenuState({
    restaurants: [{ id: "restaurant-a", name: "Restaurant A" }]
  });
  const menuCache = new Map();
  const controller = createController({
    state,
    menuCache,
    loadPublicMenuItemsFn: async () => ({ status: "empty", items: [], error: null })
  });

  const result = await controller.loadMenuForRestaurant("restaurant-a", { source: "public" });

  assert.equal(result.truthState, "knownEmpty");
  assert.equal(state.menu.truthState, "knownEmpty");
  assert.equal(publicMenuSurface(state).status, "empty");
  assert.equal(menuCache.get("restaurant-a:public")?.truthState, "knownEmpty");
  assert.equal(menuCache.get("restaurant-a:public")?.emptyVerified, true);
});

test("public menu products transition from loading directly to ready", async () => {
  const state = createVisibleMenuState();
  const renderedTruthStates = [];
  const controller = createController({
    state,
    renderFn: () => {
      renderedTruthStates.push(String(state.menu.truthState || ""));
    },
    loadPublicMenuItemsFn: async () => ({ status: "ready", items: [productOne], error: null })
  });

  const result = await controller.loadMenuForRestaurant("restaurant-a", { source: "public" });
  await Promise.resolve();

  assert.equal(result.truthState, "seeded");
  assert.deepEqual(state.menu.items, [productOne]);
  assert.equal(publicMenuSurface(state).status, "ready");
  assert.equal(renderedTruthStates.includes("knownEmpty"), false);
});

test("visible public menu products remain during forced refresh", async () => {
  const state = createVisibleMenuState();
  state.menu = {
    restaurantId: "restaurant-a",
    items: [productOne],
    loading: false,
    error: "",
    source: "public",
    statusBadgeVisible: true,
    routeSeed: false,
    truthState: "seeded"
  };
  const refresh = deferred();
  const controller = createController({
    state,
    loadDeadlines: {
      menuItemsMs: 1000,
      menuCollectionItemsMs: 1000,
      menuMetaMs: 1000,
      focusItemsMs: 1000,
      focusMetaMs: 1000
    },
    loadPublicMenuItemsFn: () => refresh.promise
  });

  const pending = controller.loadMenuForRestaurant("restaurant-a", { source: "public", force: true });
  await Promise.resolve();

  assert.deepEqual(state.menu.items, [productOne]);
  assert.equal(state.menu.loading, true);
  assert.equal(state.menu.truthState, "seeded");

  refresh.resolve({ status: "ready", items: [productTwo], error: null });
  const result = await pending;

  assert.equal(result.truthState, "seeded");
  assert.deepEqual(state.menu.items, [productTwo]);
  assert.equal(publicMenuSurface(state).status, "ready");
});

test("rapid public menu re-entry shares the in-flight request", async () => {
  const state = createVisibleMenuState();
  const request = deferred();
  let readCount = 0;
  const controller = createController({
    state,
    loadDeadlines: {
      menuItemsMs: 1000,
      menuCollectionItemsMs: 1000,
      menuMetaMs: 1000,
      focusItemsMs: 1000,
      focusMetaMs: 1000
    },
    loadPublicMenuItemsFn: () => {
      readCount += 1;
      return request.promise;
    }
  });

  const first = controller.loadMenuForRestaurant("restaurant-a", { source: "public" });
  const second = controller.loadMenuForRestaurant("restaurant-a", { source: "public" });
  await Promise.resolve();

  assert.equal(readCount, 1);
  assert.notEqual(state.menu.truthState, "knownEmpty");
  assert.equal(publicMenuSurface(state).status, "loading");

  request.resolve({ status: "ready", items: [productOne], error: null });
  await Promise.all([first, second]);

  assert.deepEqual(state.menu.items, [productOne]);
  assert.equal(publicMenuSurface(state).status, "ready");
});

test("alias empty result does not create known empty before canonical products", async () => {
  const state = createVisibleMenuState({
    restaurantId: "bro-pizza",
    canonicalRestaurantId: "canonical-bro"
  });
  const controller = createController({
    state,
    loadPublicMenuItemsFn: async (restaurantId) => (
      restaurantId === "canonical-bro"
        ? { status: "ready", items: [productOne], error: null }
        : { status: "empty", items: [], error: null }
    )
  });

  const aliasResult = await controller.loadMenuForRestaurant("bro-pizza", { source: "public" });
  assert.notEqual(aliasResult.truthState, "knownEmpty");
  assert.notEqual(state.menu.truthState, "knownEmpty");
  assert.equal(publicMenuSurface(state).status, "loading");

  const canonicalResult = await controller.loadMenuForRestaurant("canonical-bro", { source: "public" });
  assert.equal(canonicalResult.truthState, "seeded");
  assert.deepEqual(state.menu.items, [productOne]);
  assert.equal(publicMenuSurface(state).status, "ready");
});

test("bootstrap preview canonical mapping prevents alias empty frame", async () => {
  const state = createVisibleMenuState({
    restaurantId: "bro-pizza",
    canonicalRestaurantId: "bro-pizza",
    restaurants: [
      {
        id: "canonical-bro",
        name: "Bro Pizza",
        restaurantName: "Bro Pizza"
      }
    ]
  });
  const controller = createController({
    state,
    loadPublicMenuItemsFn: async (restaurantId) => (
      restaurantId === "canonical-bro"
        ? { status: "ready", items: [productOne], error: null }
        : { status: "empty", items: [], error: null }
    )
  });

  const aliasResult = await controller.loadMenuForRestaurant("bro-pizza", { source: "public" });
  assert.notEqual(aliasResult.truthState, "knownEmpty");
  assert.equal(state.menu.truthState, "unknown");
  assert.equal(publicMenuSurface(state).status, "loading");

  const canonicalResult = await controller.loadMenuForRestaurant("canonical-bro", { source: "public" });
  assert.equal(canonicalResult.truthState, "seeded");
  assert.deepEqual(state.menu.items, [productOne]);
  assert.equal(publicMenuSurface(state).status, "ready");
});

test("late stale alias empty result cannot overwrite newer canonical products", async () => {
  const state = createVisibleMenuState({
    restaurantId: "bro-pizza",
    canonicalRestaurantId: "canonical-bro"
  });
  const aliasRequest = deferred();
  const controller = createController({
    state,
    loadDeadlines: {
      menuItemsMs: 1000,
      menuCollectionItemsMs: 1000,
      menuMetaMs: 1000,
      focusItemsMs: 1000,
      focusMetaMs: 1000
    },
    loadPublicMenuItemsFn: (restaurantId) => (
      restaurantId === "canonical-bro"
        ? Promise.resolve({ status: "ready", items: [productOne], error: null })
        : aliasRequest.promise
    )
  });

  const staleAlias = controller.loadMenuForRestaurant("bro-pizza", { source: "public" });
  await controller.loadMenuForRestaurant("canonical-bro", { source: "public" });
  assert.deepEqual(state.menu.items, [productOne]);

  aliasRequest.resolve({ status: "empty", items: [], error: null });
  await staleAlias;

  assert.deepEqual(state.menu.items, [productOne]);
  assert.equal(state.menu.truthState, "seeded");
  assert.equal(publicMenuSurface(state).status, "ready");
});

test("late stale alias products cannot overwrite newer canonical products", async () => {
  const state = createVisibleMenuState({
    restaurantId: "bro-pizza",
    canonicalRestaurantId: "canonical-bro"
  });
  const aliasRequest = deferred();
  const controller = createController({
    state,
    loadDeadlines: {
      menuItemsMs: 1000,
      menuCollectionItemsMs: 1000,
      menuMetaMs: 1000,
      focusItemsMs: 1000,
      focusMetaMs: 1000
    },
    loadPublicMenuItemsFn: (restaurantId) => (
      restaurantId === "canonical-bro"
        ? Promise.resolve({ status: "ready", items: [productOne], error: null })
        : aliasRequest.promise
    )
  });

  const staleAlias = controller.loadMenuForRestaurant("bro-pizza", { source: "public" });
  await controller.loadMenuForRestaurant("canonical-bro", { source: "public" });
  assert.deepEqual(state.menu.items, [productOne]);

  aliasRequest.resolve({ status: "ready", items: [productTwo], error: null });
  await staleAlias;

  assert.deepEqual(state.menu.items, [productOne]);
  assert.equal(state.menu.truthState, "seeded");
  assert.equal(publicMenuSurface(state).status, "ready");
});

test("public menu products do not leak to a different restaurant", async () => {
  const state = createVisibleMenuState({
    restaurantId: "restaurant-a",
    canonicalRestaurantId: "restaurant-a",
    restaurants: [
      { id: "restaurant-a", name: "Restaurant A" },
      { id: "restaurant-b", name: "Restaurant B" }
    ]
  });
  state.menu = {
    restaurantId: "restaurant-a",
    items: [productOne],
    loading: false,
    error: "",
    source: "public",
    statusBadgeVisible: true,
    routeSeed: false,
    truthState: "seeded"
  };
  state.profileView.profile = {
    restaurantId: "restaurant-b",
    canonicalRestaurantId: "restaurant-b",
    role: "business"
  };
  state.profileView.routePayload = {
    restaurantId: "restaurant-b",
    canonicalRestaurantId: "restaurant-b"
  };
  state.__webDirectEntry.restaurantId = "restaurant-b";
  state.__webDirectEntry.canonicalRestaurantId = "restaurant-b";
  const controller = createController({
    state,
    loadPublicMenuItemsFn: async () => ({ status: "empty", items: [], error: null })
  });

  await controller.loadMenuForRestaurant("restaurant-b", { source: "public" });

  assert.equal(state.menu.restaurantId, "restaurant-b");
  assert.deepEqual(state.menu.items, []);
  assert.notDeepEqual(state.menu.items, [productOne]);
  assert.equal(publicMenuSurface(state).status, "empty");
});

test("public menu load leaves loading state when Firebase menu items do not return", async () => {
  const state = createVisibleMenuState();
  const controller = createController({
    state,
    loadPublicMenuItemsFn: never
  });

  const result = await withMutedConsoleError(() => (
    controller.loadMenuForRestaurant("restaurant-a", { source: "public" })
  ));

  assert.equal(result.truthState, "unknown");
  assert.equal(state.menu.restaurantId, "restaurant-a");
  assert.equal(state.menu.loading, false);
  assert.equal(state.menu.error, "Menu laden fehlgeschlagen.");
  assert.equal(state.menu.truthState, "unknown");
});

test("menu editor collection load leaves loading state when Firebase products do not return", async () => {
  const state = createVisibleMenuState();
  state.profileView = null;
  state.__webDirectEntry = null;
  const controller = createController({
    state,
    loadMenuItemsFromCollectionFn: never
  });

  const result = await withMutedConsoleError(() => (
    controller.loadMenuForRestaurant("restaurant-a", { source: "collection" })
  ));

  assert.equal(result.truthState, "unknown");
  assert.equal(state.menu.restaurantId, "restaurant-a");
  assert.equal(state.menu.loading, false);
  assert.equal(state.menu.error, "Menu laden fehlgeschlagen.");
  assert.equal(state.menu.source, "collection");
});

test("public focus load releases menu coordination when Firebase offers do not return", async () => {
  const state = createVisibleMenuState();
  state.menu = {
    restaurantId: "restaurant-a",
    items: [{ id: "item-1", category: "Pizza" }],
    loading: false,
    error: "",
    source: "public",
    statusBadgeVisible: true,
    routeSeed: false,
    truthState: "seeded"
  };
  const controller = createController({
    state,
    loadFocusItemsFn: never
  });

  const result = await withMutedConsoleError(() => (
    controller.loadFocusForRestaurant("restaurant-a")
  ));

  assert.equal(result.truthState, "error");
  assert.equal(state.focus.restaurantId, "restaurant-a");
  assert.equal(state.focus.loading, false);
  assert.equal(state.focus.error, "Fokus laden fehlgeschlagen.");
  assert.equal(state.focus.truthState, "error");
});
