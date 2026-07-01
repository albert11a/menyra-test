import assert from "node:assert/strict";
import test from "node:test";

import {
  resolvePublicMenuRenderDecision,
  resolveVisiblePublicMenuSurfaceState
} from "../apps/menyra-social/core/profile/public-menu-surface-state-utils.js";

const profile = { restaurantId: "restaurant-a", canonicalRestaurantId: "restaurant-a" };

test("public menu surface keeps empty items loading for unsettled menu truth", () => {
  for (const truthState of ["unknown", "loading", "hydrating", "pending", "unsettled"]) {
    const surface = resolveVisiblePublicMenuSurfaceState({
      menu: {
        restaurantId: "restaurant-a",
        source: "public",
        truthState,
        items: [],
        loading: true
      }
    }, { profile });

    assert.equal(surface.menu.status, "loading", `truthState=${truthState}`);
    assert.equal(surface.menu.canRenderItems, false, `truthState=${truthState}`);
  }
});

test("public menu surface keeps an empty seeded preview non-authoritative", () => {
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

test("public menu surface exposes no-products only for confirmed empty truth", () => {
  const surface = resolveVisiblePublicMenuSurfaceState({
    menu: {
      restaurantId: "restaurant-a",
      source: "public",
      truthState: "knownEmpty",
      items: [],
      loading: false
    }
  }, { profile });

  assert.equal(surface.menu.status, "empty");
  assert.equal(surface.menu.confirmedEmpty, true);
  assert.equal(surface.menu.canRenderItems, false);
});

test("public menu surface does not confirm empty for an unresolved public slug", () => {
  const surface = resolveVisiblePublicMenuSurfaceState({
    menu: {
      restaurantId: "70-s-pastry-and-bakery",
      source: "public",
      truthState: "knownEmpty",
      items: [],
      loading: false
    }
  }, {
    profile: {
      restaurantId: "70-s-pastry-and-bakery",
      canonicalRestaurantId: ""
    },
    routePayload: {
      restaurantId: "70-s-pastry-and-bakery",
      canonicalRestaurantId: "",
      businessSnapshot: {
        restaurantId: "70-s-pastry-and-bakery"
      }
    },
    webDirectEntry: {
      active: true,
      restaurantId: "70-s-pastry-and-bakery",
      canonicalRestaurantId: ""
    }
  });

  assert.equal(surface.authoritativeRestaurantId, "");
  assert.equal(surface.menu.status, "loading");
  assert.equal(surface.menu.confirmedEmpty, false);
  assert.equal(surface.menu.canRenderItems, false);
});

test("public menu surface rejects slug empty truth after canonical id resolves", () => {
  const surface = resolveVisiblePublicMenuSurfaceState({
    menu: {
      restaurantId: "70-s-pastry-and-bakery",
      source: "public",
      truthState: "knownEmpty",
      items: [],
      loading: false
    }
  }, {
    profile: {
      restaurantId: "70-s-pastry-and-bakery",
      canonicalRestaurantId: "YZq9MI9qZBr2u58KEdix"
    }
  });

  assert.equal(surface.authoritativeRestaurantId, "YZq9MI9qZBr2u58KEdix");
  assert.equal(surface.menu.status, "loading");
  assert.equal(surface.menu.confirmedEmpty, false);
  assert.equal(surface.menu.matchesAuthoritativeRestaurant, false);
});

test("public menu surface confirms empty only for the canonical public menu read", () => {
  const surface = resolveVisiblePublicMenuSurfaceState({
    menu: {
      restaurantId: "YZq9MI9qZBr2u58KEdix",
      source: "public",
      truthState: "knownEmpty",
      items: [],
      loading: false
    }
  }, {
    profile: {
      restaurantId: "YZq9MI9qZBr2u58KEdix",
      canonicalRestaurantId: "YZq9MI9qZBr2u58KEdix"
    }
  });

  assert.equal(surface.menu.status, "empty");
  assert.equal(surface.menu.confirmedEmpty, true);
  assert.equal(surface.menu.matchesAuthoritativeRestaurant, true);
});

test("public menu surface renders ready menu items", () => {
  const surface = resolveVisiblePublicMenuSurfaceState({
    menu: {
      restaurantId: "restaurant-a",
      source: "public",
      truthState: "seeded",
      items: [{ id: "item-1", category: "Pizza" }],
      loading: false
    }
  }, { profile });

  assert.equal(surface.menu.status, "ready");
  assert.equal(surface.menu.canRenderItems, true);
  assert.equal(surface.menu.confirmedEmpty, false);
});

test("Casarita-like canonical route seed renders products immediately", () => {
  const casaritaId = "Lzm6RpNu3ErSDtGCHxpi";
  const surface = resolveVisiblePublicMenuSurfaceState({
    menu: {
      restaurantId: casaritaId,
      source: "public",
      truthState: "seeded",
      items: [{ id: "item-1", category: "Pizza" }],
      loading: false
    }
  }, {
    profile: {
      restaurantId: casaritaId,
      canonicalRestaurantId: casaritaId,
      publicSlug: "casarita"
    }
  });

  assert.equal(surface.menu.status, "ready");
  assert.equal(surface.menu.canRenderItems, true);
  assert.equal(surface.menu.items.length, 1);
});

test("filtered empty canonical items never trigger global no-products", () => {
  const surface = resolveVisiblePublicMenuSurfaceState({
    menu: {
      restaurantId: "restaurant-a",
      source: "public",
      truthState: "seeded",
      items: [{ id: "hidden-item", category: "Pizza", menuHidden: true }],
      loading: false
    }
  }, { profile });
  const decision = resolvePublicMenuRenderDecision(surface.menu, []);

  assert.equal(surface.menu.status, "ready");
  assert.equal(surface.menu.items.length, 1);
  assert.equal(decision.hasItems, false);
  assert.equal(decision.confirmedEmpty, false);
  assert.equal(decision.shouldRenderNoProducts, false);
  assert.equal(decision.isLoading, true);
});

test("public menu surface keeps ready items renderable while focus is loading", () => {
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
  assert.equal(surface.focus.canRenderFocus, false);
  assert.equal(surface.focus.settled, false);
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
