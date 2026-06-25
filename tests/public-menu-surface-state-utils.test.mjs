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

test("public menu surface can coordinate item rendering until focus settles", () => {
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
  assert.equal(surface.menu.canRenderItems, false);
  assert.equal(surface.menu.waitingForFocus, true);
  assert.equal(surface.focus.status, "loading");
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
  assert.equal(surface.focus.status, "empty");
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

test("public menu surface treats alias known empty as loading when canonical id is known", () => {
  const surface = resolveVisiblePublicMenuSurfaceState({
    restaurants: [
      {
        id: "canonical-bro",
        name: "Bro Pizza",
        restaurantName: "Bro Pizza"
      }
    ],
    menu: {
      restaurantId: "bro-pizza",
      source: "public",
      truthState: "knownEmpty",
      items: [],
      loading: false
    }
  }, {
    profile: {
      restaurantId: "bro-pizza",
      canonicalRestaurantId: "bro-pizza"
    },
    routePayload: {
      restaurantId: "bro-pizza"
    },
    webDirectEntry: {
      active: true,
      restaurantId: "bro-pizza",
      canonicalRestaurantId: "bro-pizza"
    }
  });

  assert.equal(surface.restaurantId, "canonical-bro");
  assert.equal(surface.menu.status, "loading");
});

test("public menu surface does not render seeded empty menu as confirmed empty", () => {
  const surface = resolveVisiblePublicMenuSurfaceState({
    menu: {
      restaurantId: "restaurant-a",
      source: "public",
      truthState: "seeded",
      items: [],
      loading: false
    }
  }, { profile });

  assert.equal(surface.menu.status, "loading");
  assert.equal(surface.menu.canRenderItems, false);
});
