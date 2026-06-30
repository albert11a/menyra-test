import assert from "node:assert/strict";
import test from "node:test";

import {
  resolveVisiblePublicMenuSurfaceState
} from "../apps/menyra-social/core/profile/public-menu-surface-state-utils.js";

const profile = { restaurantId: "restaurant-a", canonicalRestaurantId: "restaurant-a" };

test("public menu surface keeps focus pending when menu is ready but focus is still loading", () => {
  const surface = resolveVisiblePublicMenuSurfaceState({
    menu: {
      restaurantId: "restaurant-a",
      source: "public",
      truthState: "seeded",
      items: [{ id: "item-1", category: "Pizza" }],
      loading: false
    },
    focus: {
      restaurantId: "restaurant-a",
      truthSource: "public-menu",
      truthState: "unknown",
      items: [],
      loading: true
    }
  }, { profile });

  assert.equal(surface.menu.status, "ready");
  assert.equal(surface.menu.canRenderItems, true);
  assert.equal(surface.focus.status, "loading");
  assert.equal(surface.focus.canRenderFocus, false);
  assert.equal(surface.focus.settled, false);
});

test("public menu surface reserves focus without blocking item rendering", () => {
  const surface = resolveVisiblePublicMenuSurfaceState({
    menu: {
      restaurantId: "restaurant-a",
      source: "public",
      truthState: "seeded",
      items: [{ id: "item-1", category: "Pizza" }],
      loading: false
    },
    focus: {
      restaurantId: "restaurant-a",
      truthSource: "public-menu",
      truthState: "unknown",
      items: [],
      loading: true
    }
  }, { profile, coordinateFocusWithMenu: true });

  assert.equal(surface.menu.status, "ready");
  assert.equal(surface.menu.canRenderItems, true);
  assert.equal(surface.menu.waitingForFocus, false);
  assert.equal(surface.focus.status, "loading");
  assert.equal(surface.focus.pendingPlaceholder, true);
});

test("public menu surface releases coordinated item rendering when focus is empty", () => {
  const surface = resolveVisiblePublicMenuSurfaceState({
    menu: {
      restaurantId: "restaurant-a",
      source: "public",
      truthState: "seeded",
      items: [{ id: "item-1", category: "Pizza" }],
      loading: false
    },
    focus: {
      restaurantId: "restaurant-a",
      truthSource: "public-menu",
      truthState: "knownEmpty",
      items: [],
      loading: false
    }
  }, { profile, coordinateFocusWithMenu: true });

  assert.equal(surface.menu.status, "ready");
  assert.equal(surface.menu.canRenderItems, true);
  assert.equal(surface.menu.waitingForFocus, false);
  assert.equal(surface.focus.pendingPlaceholder, false);
  assert.equal(surface.focus.status, "empty");
});

test("public menu surface renders route menu seed while public menu load is unresolved", () => {
  const surface = resolveVisiblePublicMenuSurfaceState({
    menu: {
      restaurantId: "restaurant-a",
      source: "public",
      truthState: "unknown",
      items: [],
      loading: true
    },
    focus: {
      restaurantId: "restaurant-a",
      truthSource: "public-menu",
      truthState: "unknown",
      items: [],
      loading: true
    }
  }, {
    profile,
    routePayload: {
      canonicalRestaurantId: "restaurant-a",
      businessSnapshot: {
        restaurantId: "restaurant-a",
        menu: {
          state: "seeded",
          items: [{ id: "item-route-1", name: "Route Pizza", image: "https://example.test/pizza.jpg" }]
        },
        truth: { menu: "seeded" }
      }
    }
  });

  assert.equal(surface.menu.status, "ready");
  assert.equal(surface.menu.matches, true);
  assert.equal(surface.menu.loading, false);
  assert.equal(surface.menu.canRenderItems, true);
  assert.equal(surface.menu.items.length, 1);
  assert.equal(surface.menu.items[0].id, "item-route-1");
  assert.equal(surface.menu.items[0].imageUrl, "https://example.test/pizza.jpg");
});

test("public menu surface prefers current route seed over stale known-empty menu state", () => {
  const surface = resolveVisiblePublicMenuSurfaceState({
    menu: {
      restaurantId: "restaurant-a",
      source: "public",
      truthState: "knownEmpty",
      items: [],
      loading: false
    }
  }, {
    profile,
    routePayload: {
      restaurantId: "restaurant-a",
      menu: {
        state: "seeded",
        items: [{ name: "Route Burger", category: "Food", sortOrder: 4 }]
      }
    }
  });

  assert.equal(surface.menu.status, "ready");
  assert.equal(surface.menu.canRenderItems, true);
  assert.equal(surface.menu.items.length, 1);
  assert.equal(surface.menu.items[0].restaurantId, "restaurant-a");
  assert.equal(surface.menu.items[0].orderIndex, 4);
});

test("public menu surface renders route focus seed while live focus load is unresolved", () => {
  const surface = resolveVisiblePublicMenuSurfaceState({
    menu: {
      restaurantId: "restaurant-a",
      source: "public",
      truthState: "unknown",
      items: [],
      loading: true
    },
    focus: {
      restaurantId: "restaurant-a",
      truthSource: "public-menu",
      truthState: "unknown",
      items: [],
      loading: true
    }
  }, {
    profile,
    routePayload: {
      canonicalRestaurantId: "restaurant-a",
      businessSnapshot: {
        restaurantId: "restaurant-a",
        menu: {
          state: "seeded",
          items: [{ id: "item-route-1", name: "Route Pizza" }]
        },
        focus: {
          state: "seeded",
          items: [{ id: "focus-route-1", title: "Route Focus", imageUrl: "https://example.test/focus.jpg" }]
        },
        truth: {
          menu: "seeded",
          focus: "seeded"
        }
      }
    },
    coordinateFocusWithMenu: true
  });

  assert.equal(surface.menu.status, "ready");
  assert.equal(surface.focus.status, "ready");
  assert.equal(surface.focus.canRenderFocus, true);
  assert.equal(surface.focus.items.length, 1);
  assert.equal(surface.focus.items[0].id, "focus-route-1");
});

test("public menu surface renders seeded focus only for the same restaurant target", () => {
  const surface = resolveVisiblePublicMenuSurfaceState({
    menu: {
      restaurantId: "restaurant-a",
      source: "public",
      truthState: "seeded",
      items: [{ id: "item-1", category: "Pizza" }],
      loading: false
    },
    focus: {
      restaurantId: "restaurant-a",
      truthSource: "public-menu",
      truthState: "seeded",
      items: [{ id: "focus-1", title: "Special", imageUrl: "https://example.test/img.jpg" }],
      loading: false
    }
  }, { profile });

  assert.equal(surface.focus.status, "ready");
  assert.equal(surface.focus.canRenderFocus, true);
  assert.equal(surface.focus.items.length, 1);
});

test("public menu surface ignores stale focus from another restaurant", () => {
  const surface = resolveVisiblePublicMenuSurfaceState({
    menu: {
      restaurantId: "restaurant-a",
      source: "public",
      truthState: "seeded",
      items: [{ id: "item-1", category: "Pizza" }],
      loading: false
    },
    focus: {
      restaurantId: "restaurant-b",
      truthSource: "public-menu",
      truthState: "seeded",
      items: [{ id: "focus-b", title: "Other" }],
      loading: false
    }
  }, { profile });

  assert.equal(surface.focus.status, "unknown");
  assert.equal(surface.focus.canRenderFocus, false);
});

test("public menu surface treats menu-targeted focus as unavailable when target is missing", () => {
  const surface = resolveVisiblePublicMenuSurfaceState({
    menu: {
      restaurantId: "restaurant-a",
      source: "public",
      truthState: "seeded",
      items: [{ id: "item-1", category: "Pizza" }],
      loading: false
    },
    focus: {
      restaurantId: "restaurant-a",
      truthSource: "public-menu",
      truthState: "seeded",
      items: [{ id: "focus-1", targetMenuItemId: "missing-item", title: "Missing" }],
      loading: false
    }
  }, { profile });

  assert.equal(surface.focus.status, "empty");
  assert.equal(surface.focus.canRenderFocus, false);
  assert.equal(surface.focus.invalidForMenu, true);
});

test("public menu surface does not expose stale menu items under a new profile target", () => {
  const surface = resolveVisiblePublicMenuSurfaceState({
    menu: {
      restaurantId: "restaurant-a",
      source: "public",
      truthState: "seeded",
      items: [{ id: "item-a" }],
      loading: false
    },
    focus: {
      restaurantId: "restaurant-a",
      truthSource: "public-menu",
      truthState: "seeded",
      items: [{ id: "focus-a" }],
      loading: false
    }
  }, {
    profile: { restaurantId: "restaurant-b", canonicalRestaurantId: "restaurant-b" }
  });

  assert.equal(surface.menu.status, "loading");
  assert.equal(surface.menu.canRenderItems, false);
  assert.deepEqual(surface.menu.items, []);
  assert.equal(surface.focus.canRenderFocus, false);
});

test("public menu surface ignores stale route menu seed under a different profile target", () => {
  const surface = resolveVisiblePublicMenuSurfaceState({
    menu: {
      restaurantId: "restaurant-b",
      source: "public",
      truthState: "unknown",
      items: [],
      loading: true
    }
  }, {
    profile: { restaurantId: "restaurant-b" },
    routePayload: {
      canonicalRestaurantId: "restaurant-a",
      businessSnapshot: {
        restaurantId: "restaurant-a",
        menu: {
          state: "seeded",
          items: [{ id: "item-a", name: "Wrong target" }]
        }
      }
    }
  });

  assert.equal(surface.restaurantId, "restaurant-b");
  assert.equal(surface.menu.status, "loading");
  assert.equal(surface.menu.canRenderItems, false);
  assert.deepEqual(surface.menu.items, []);
});

test("public menu surface ignores stale route focus seed under a different profile target", () => {
  const surface = resolveVisiblePublicMenuSurfaceState({
    menu: {
      restaurantId: "restaurant-b",
      source: "public",
      truthState: "unknown",
      items: [],
      loading: true
    },
    focus: {
      restaurantId: "restaurant-b",
      truthSource: "public-menu",
      truthState: "unknown",
      items: [],
      loading: true
    }
  }, {
    profile: { restaurantId: "restaurant-b" },
    routePayload: {
      canonicalRestaurantId: "restaurant-a",
      businessSnapshot: {
        restaurantId: "restaurant-a",
        menu: {
          state: "seeded",
          items: [{ id: "item-a", name: "Wrong menu" }]
        },
        focus: {
          state: "seeded",
          items: [{ id: "focus-a", title: "Wrong focus" }]
        }
      }
    },
    coordinateFocusWithMenu: true
  });

  assert.equal(surface.restaurantId, "restaurant-b");
  assert.equal(surface.menu.status, "loading");
  assert.equal(surface.focus.status, "loading");
  assert.equal(surface.focus.canRenderFocus, false);
  assert.deepEqual(surface.focus.items, []);
});
