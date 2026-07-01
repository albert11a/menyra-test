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

function createUnresolvedSlugMenuState() {
  const state = createVisibleMenuState();
  state.profileView.profile = {
    ...state.profileView.profile,
    restaurantId: "70-s-pastry-and-bakery",
    canonicalRestaurantId: "",
    publicSlug: "70-s-pastry-and-bakery"
  };
  state.profileView.routePayload = {
    restaurantId: "70-s-pastry-and-bakery",
    canonicalRestaurantId: "",
    businessSnapshot: {
      restaurantId: "70-s-pastry-and-bakery"
    }
  };
  state.__webDirectEntry = {
    ...state.__webDirectEntry,
    restaurantId: "70-s-pastry-and-bakery",
    canonicalRestaurantId: ""
  };
  return state;
}

function createController({
  state = createVisibleMenuState(),
  renderFn = () => {},
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

test("public profile restaurant loading does not schedule the feed story query", async () => {
  const state = {
    activeTab: "profile",
    restaurants: [],
    bootstrapRestaurantPreview: [],
    stories: [],
    feedPosts: []
  };
  let storyLoads = 0;
  const controller = createSessionDataRuntimeController({
    state,
    dataLoaded: {},
    db: {},
    collectionFn: (_db, collectionName) => ({ collectionName }),
    queryFn: (ref) => ref,
    getDocsFn: async () => ({
      forEach() {}
    }),
    loadStoriesForFeedFn: async () => {
      storyLoads += 1;
    }
  });

  await controller.loadRestaurants();
  await Promise.resolve();

  assert.equal(storyLoads, 0);
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

test("missing restaurants slug public menu remains pending before canonical resolution", async () => {
  const state = createUnresolvedSlugMenuState();
  const controller = createController({
    state,
    loadPublicMenuItemsFn: async () => []
  });

  const result = await controller.loadMenuForRestaurant("70-s-pastry-and-bakery", { source: "public" });

  assert.equal(result.truthState, "unknown");
  assert.equal(result.pendingCanonical, true);
  assert.equal(state.menu.restaurantId, "70-s-pastry-and-bakery");
  assert.equal(state.menu.loading, true);
  assert.equal(state.menu.error, "");
  assert.equal(state.menu.truthState, "unknown");
});

test("visible public menu keeps current items during transient unknown refresh", async () => {
  const state = createUnresolvedSlugMenuState();
  const visibleItems = [{ id: "item-1", category: "Pizza" }];
  state.menu = {
    ...state.menu,
    restaurantId: "70-s-pastry-and-bakery",
    items: visibleItems,
    loading: false,
    source: "public",
    truthState: "seeded"
  };
  const controller = createController({
    state,
    loadPublicMenuItemsFn: async () => []
  });

  const result = await controller.loadMenuForRestaurant("70-s-pastry-and-bakery", { source: "public" });

  assert.equal(result.truthState, "unknown");
  assert.equal(result.pendingCanonical, true);
  assert.equal(state.menu.restaurantId, "70-s-pastry-and-bakery");
  assert.equal(state.menu.loading, true);
  assert.equal(state.menu.error, "");
  assert.equal(state.menu.truthState, "seeded");
  assert.deepEqual(state.menu.items, visibleItems);
});

test("canonical public menu empty read commits terminal known-empty truth", async () => {
  const state = createVisibleMenuState();
  const controller = createController({
    state,
    loadPublicMenuItemsFn: async () => []
  });

  const result = await controller.loadMenuForRestaurant("restaurant-a", { source: "public" });

  assert.equal(result.truthState, "knownEmpty");
  assert.equal(result.pendingCanonical, false);
  assert.equal(state.menu.restaurantId, "restaurant-a");
  assert.equal(state.menu.loading, false);
  assert.equal(state.menu.error, "");
  assert.equal(state.menu.truthState, "knownEmpty");
});

test("canonical public menu item read commits seeded products", async () => {
  const state = createVisibleMenuState();
  const items = [{ id: "item-1", category: "Pizza" }];
  const controller = createController({
    state,
    loadPublicMenuItemsFn: async () => items
  });

  const result = await controller.loadMenuForRestaurant("restaurant-a", { source: "public" });

  assert.equal(result.truthState, "seeded");
  assert.deepEqual(result.items, items);
  assert.equal(state.menu.loading, false);
  assert.equal(state.menu.truthState, "seeded");
  assert.deepEqual(state.menu.items, items);
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
