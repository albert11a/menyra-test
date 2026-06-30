import assert from "node:assert/strict";
import test from "node:test";

import { createSessionDataRuntimeController } from "../apps/menyra-social/core/app-shell/session-data-runtime-controller.js";
import { createFocusRuntimeController } from "../apps/menyra-social/core/menu/focus-runtime-controller.js";

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

function createVisibleMenuState() {
  return {
    activeTab: "profile",
    profileTopTab: "menu",
    profileContentTab: "menu",
    profileView: {
      profile: {
        restaurantId: "restaurant-a",
        canonicalRestaurantId: "restaurant-a",
        role: "business"
      },
      routePayload: {
        restaurantId: "restaurant-a",
        canonicalRestaurantId: "restaurant-a"
      }
    },
    __webDirectEntry: {
      active: true,
      restaurantId: "restaurant-a",
      canonicalRestaurantId: "restaurant-a",
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
  loadPublicMenuItemsFn = async () => [],
  loadMenuItemsFromCollectionFn = async () => [],
  loadMenuMetaFn = async () => ({ statusBadgeVisible: true }),
  loadFocusItemsFn = async () => [],
  loadFocusMetaFn = async () => true,
  readCacheFn = null,
  writeCacheFn = null,
  cacheKeys = {},
  cacheTtl = {}
} = {}) {
  return createSessionDataRuntimeController({
    state,
    dataLoaded: {},
    renderFn,
    readCacheFn,
    writeCacheFn,
    cacheKeys,
    cacheTtl,
    menuCache,
    menuCacheKeyFn: (restaurantId, source = "public") => `${restaurantId}:${source}`,
    focusCacheKeyFn: (restaurantId) => `${restaurantId}`,
    loadDeadlines: {
      menuItemsMs: 5,
      menuCollectionItemsMs: 5,
      menuMetaMs: 5,
      focusItemsMs: 5,
      focusMetaMs: 5
    },
    loadPublicMenuItemsFn,
    loadMenuItemsFromCollectionFn,
    loadMenuMetaFn,
    loadFocusItemsFn,
    loadFocusMetaFn
  });
}

function createObjectCacheStore() {
  const store = new Map();
  return {
    readCacheFn: (key, ttlMs) => {
      if (!key || !store.has(key)) return null;
      const payload = store.get(key);
      const age = Date.now() - Number(payload.ts || 0);
      return {
        data: Array.isArray(payload.data) ? payload.data : [],
        meta: payload.meta || null,
        fresh: ttlMs ? age <= ttlMs : true
      };
    },
    writeCacheFn: (key, data, meta = null) => {
      if (!key || !Array.isArray(data)) return;
      store.set(key, { ts: Date.now(), data, meta });
    }
  };
}

test("public menu unknown load stays in silent retry loading instead of visible error", async () => {
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
  assert.equal(state.menu.loading, true);
  assert.equal(state.menu.error, "");
  assert.equal(state.menu.truthState, "unknown");
});

test("visible public menu keeps an in-flight unknown prefetch in silent retry loading", async () => {
  const state = createVisibleMenuState();
  const controller = createController({
    state,
    loadPublicMenuItemsFn: never
  });

  const prefetch = withMutedConsoleError(() => (
    controller.loadMenuForRestaurant("restaurant-a", { source: "public", prefetchOnly: true })
  ));
  const result = await withMutedConsoleError(() => (
    controller.loadMenuForRestaurant("restaurant-a", { source: "public" })
  ));
  await prefetch;

  assert.equal(result.truthState, "unknown");
  assert.equal(state.menu.restaurantId, "restaurant-a");
  assert.equal(state.menu.loading, true);
  assert.equal(state.menu.error, "");
  assert.equal(state.menu.truthState, "unknown");
});

test("public menu silent retry can recover after a transient timeout", async () => {
  const state = createVisibleMenuState();
  let calls = 0;
  const controller = createController({
    state,
    loadPublicMenuItemsFn: async () => {
      calls += 1;
      if (calls === 1) return never();
      return [{ id: "item-1", title: "Recovered item" }];
    }
  });

  const firstResult = await withMutedConsoleError(() => (
    controller.loadMenuForRestaurant("restaurant-a", { source: "public" })
  ));

  assert.equal(firstResult.truthState, "unknown");
  assert.equal(state.menu.loading, true);
  assert.equal(state.menu.error, "");

  const recovered = await controller.loadMenuForRestaurant("restaurant-a", { source: "public", force: true });

  assert.equal(recovered.truthState, "seeded");
  assert.equal(state.menu.loading, false);
  assert.equal(state.menu.error, "");
  assert.equal(state.menu.truthState, "seeded");
  assert.deepEqual(state.menu.items, [{ id: "item-1", title: "Recovered item" }]);
});

test("visible public menu keeps route-seeded products when live refresh times out", async () => {
  const state = createVisibleMenuState();
  const routeSeedItems = [{ id: "item-1", title: "Seeded item" }];
  state.menu = {
    restaurantId: "restaurant-a",
    items: routeSeedItems,
    loading: false,
    error: "",
    source: "public",
    statusBadgeVisible: true,
    routeSeed: true,
    truthState: "seeded"
  };
  const controller = createController({
    state,
    loadPublicMenuItemsFn: never
  });

  const result = await withMutedConsoleError(() => (
    controller.loadMenuForRestaurant("restaurant-a", { source: "public" })
  ));

  assert.equal(result.truthState, "seeded");
  assert.equal(state.menu.restaurantId, "restaurant-a");
  assert.equal(state.menu.loading, false);
  assert.equal(state.menu.error, "");
  assert.equal(state.menu.truthState, "seeded");
  assert.deepEqual(state.menu.items, routeSeedItems);
});

test("visible public menu loads canonical restaurant id instead of route alias", async () => {
  const state = createVisibleMenuState();
  state.profileView.profile = {
    restaurantId: "route-alias",
    canonicalRestaurantId: "canonical-restaurant",
    publicSlug: "alias-slug",
    role: "business"
  };
  state.profileView.routePayload = {
    restaurantId: "route-alias",
    canonicalRestaurantId: "canonical-restaurant",
    publicSlug: "alias-slug",
    businessSnapshot: {
      restaurantId: "canonical-restaurant"
    }
  };
  state.__webDirectEntry = {
    active: true,
    restaurantId: "route-alias",
    canonicalRestaurantId: "canonical-restaurant",
    webPriority: true,
    menuFirst: true
  };
  const loadedRestaurantIds = [];
  const menuCache = new Map([
    ["alias-slug:public", {
      items: [],
      statusBadgeVisible: true,
      truthSource: "public-menu",
      truthState: "knownEmpty",
      ts: Date.now()
    }]
  ]);
  const controller = createController({
    state,
    menuCache,
    loadPublicMenuItemsFn: async (restaurantId) => {
      loadedRestaurantIds.push(restaurantId);
      return [{ id: "item-1", title: "Canonical item" }];
    },
    loadMenuItemsFromCollectionFn: async () => {
      throw new Error("legacy menuItems must not win public menu load");
    }
  });

  const result = await controller.loadMenuForRestaurant("alias-slug", { source: "public" });

  assert.deepEqual(loadedRestaurantIds, ["canonical-restaurant"]);
  assert.equal(result.truthState, "seeded");
  assert.equal(state.menu.restaurantId, "canonical-restaurant");
  assert.equal(state.menu.source, "public");
  assert.equal(state.menu.loading, false);
  assert.equal(state.menu.error, "");
  assert.deepEqual(state.menu.items, [{ id: "item-1", title: "Canonical item" }]);
});

test("visible public menu verifies cached known-empty state before showing no products", async () => {
  const cacheStore = createObjectCacheStore();
  const firstState = createVisibleMenuState();
  const firstController = createController({
    state: firstState,
    cacheKeys: { menu: "menu-cache" },
    cacheTtl: { menu: 10 * 60 * 1000 },
    loadPublicMenuItemsFn: async () => [],
    ...cacheStore
  });

  const firstResult = await firstController.loadMenuForRestaurant("restaurant-a", { source: "public" });
  assert.equal(firstResult.truthState, "knownEmpty");

  const refreshedState = createVisibleMenuState();
  const loadedRestaurantIds = [];
  const refreshedController = createController({
    state: refreshedState,
    cacheKeys: { menu: "menu-cache" },
    cacheTtl: { menu: 10 * 60 * 1000 },
    loadPublicMenuItemsFn: async (restaurantId) => {
      loadedRestaurantIds.push(restaurantId);
      return [{ id: "item-1", title: "Fresh item" }];
    },
    ...cacheStore
  });

  const refreshedResult = await refreshedController.loadMenuForRestaurant("restaurant-a", { source: "public" });

  assert.deepEqual(loadedRestaurantIds, ["restaurant-a"]);
  assert.equal(refreshedResult.truthState, "seeded");
  assert.equal(refreshedState.menu.loading, false);
  assert.equal(refreshedState.menu.error, "");
  assert.equal(refreshedState.menu.truthState, "seeded");
  assert.deepEqual(refreshedState.menu.items, [{ id: "item-1", title: "Fresh item" }]);
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

  assert.equal(result.truthState, "unknown");
  assert.equal(state.focus.restaurantId, "restaurant-a");
  assert.equal(state.focus.loading, false);
  assert.equal(state.focus.error, "Fokus laden fehlgeschlagen.");
  assert.equal(state.focus.truthState, "unknown");
});

test("public focus meta deadline fallback does not emit console error", async () => {
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
    loadFocusMetaFn: never
  });
  const original = console.error;
  let consoleErrors = 0;
  console.error = () => {
    consoleErrors += 1;
  };
  try {
    const result = await controller.loadFocusForRestaurant("restaurant-a", { force: true });
    assert.equal(result.truthState, "knownEmpty");
    assert.equal(state.focus.restaurantId, "restaurant-a");
    assert.equal(state.focus.loading, false);
    assert.equal(state.focus.error, "");
    assert.equal(consoleErrors, 0);
  } finally {
    console.error = original;
  }
});

test("public focus transient load failure preserves existing focus items", async () => {
  const state = createVisibleMenuState();
  const existingFocusItems = [{ id: "focus-1", title: "Lunch" }];
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
  state.focus = {
    restaurantId: "restaurant-a",
    items: existingFocusItems,
    loading: false,
    enabled: true,
    error: "",
    index: 0,
    truthSource: "public-menu",
    truthState: "seeded"
  };
  const controller = createController({
    state,
    loadFocusItemsFn: async () => {
      throw new Error("transient focus read failed");
    }
  });

  const result = await withMutedConsoleError(() => (
    controller.loadFocusForRestaurant("restaurant-a", { force: true })
  ));

  assert.equal(result.truthState, "seeded");
  assert.equal(state.focus.restaurantId, "restaurant-a");
  assert.equal(state.focus.loading, false);
  assert.equal(state.focus.error, "");
  assert.equal(state.focus.truthState, "seeded");
  assert.deepEqual(state.focus.items, existingFocusItems);
});

test("public focus survives refresh through persistent cache", async () => {
  const cacheStore = createObjectCacheStore();
  const focusItems = [{ id: "focus-1", title: "Lunch" }];
  const firstState = createVisibleMenuState();
  firstState.menu = {
    restaurantId: "restaurant-a",
    items: [{ id: "item-1", category: "Pizza" }],
    loading: false,
    error: "",
    source: "public",
    statusBadgeVisible: true,
    routeSeed: false,
    truthState: "seeded"
  };
  const firstController = createController({
    state: firstState,
    cacheKeys: { focus: "focus-cache" },
    cacheTtl: { focus: 10 * 60 * 1000 },
    loadFocusItemsFn: async () => focusItems,
    ...cacheStore
  });

  const firstResult = await firstController.loadFocusForRestaurant("restaurant-a");
  assert.equal(firstResult.truthState, "seeded");

  const refreshedState = createVisibleMenuState();
  refreshedState.menu = firstState.menu;
  const refreshedController = createController({
    state: refreshedState,
    cacheKeys: { focus: "focus-cache" },
    cacheTtl: { focus: 10 * 60 * 1000 },
    loadFocusItemsFn: async () => {
      return focusItems;
    },
    ...cacheStore
  });

  const cachedResult = await refreshedController.loadFocusForRestaurant("restaurant-a");

  assert.equal(cachedResult.truthState, "seeded");
  assert.deepEqual(refreshedState.focus.items, focusItems);
  assert.equal(refreshedState.focus.loading, false);
  assert.equal(refreshedState.focus.error, "");
});

test("public focus missing document is a confirmed empty state", async () => {
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
  const focusRuntime = createFocusRuntimeController({
    state,
    db: {},
    docFn: (_db, ...path) => ({ path }),
    getDocFn: async () => ({
      exists: () => false,
      data: () => ({})
    })
  });
  const controller = createController({
    state,
    loadFocusItemsFn: (...args) => focusRuntime.loadFocusItems(...args)
  });

  const result = await controller.loadFocusForRestaurant("restaurant-a", { force: true });

  assert.equal(result.truthState, "knownEmpty");
  assert.equal(state.focus.restaurantId, "restaurant-a");
  assert.equal(state.focus.loading, false);
  assert.equal(state.focus.error, "");
  assert.deepEqual(state.focus.items, []);
  assert.equal(state.focus.truthState, "knownEmpty");
});
