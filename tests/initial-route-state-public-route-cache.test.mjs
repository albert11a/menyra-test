import assert from "node:assert/strict";
import test from "node:test";

import { resolveInitialRouteState } from "../apps/menyra-social/core/auth/initial-route-state.js";

function makeQs(params = {}) {
  return (key) => params[key] || "";
}

test("initial route state can use a cached publicRoutes resolution for path slugs", () => {
  const state = resolveInitialRouteState({
    qs: makeQs({}),
    pathname: "/moka-coffee/menu",
    normalizeInitialTab: (value) => value,
    normalizeAuthMode: (value) => value,
    readPublicRouteResolution: (slug) => {
      if (slug !== "moka-coffee") return null;
      return {
        found: true,
        status: "active",
        inputSlug: "moka-coffee",
        canonicalSlug: "moka-coffee",
        restaurantId: "restaurant-moka-123456",
        source: "firestore"
      };
    }
  });

  assert.equal(state.pendingProfileRestaurantId, "restaurant-moka-123456");
  assert.equal(state.pendingProfileTopTab, "menu");
  assert.equal(state.pendingInitialTab, "profile");
});

test("initial route state resolves alias cache to canonical restaurant id", () => {
  const state = resolveInitialRouteState({
    qs: makeQs({}),
    pathname: "/casa-rita/menu",
    normalizeInitialTab: (value) => value,
    normalizeAuthMode: (value) => value,
    readPublicRouteResolution: (slug) => {
      if (slug !== "casa-rita") return null;
      return {
        found: true,
        status: "redirect",
        inputSlug: "casa-rita",
        canonicalSlug: "casarita",
        restaurantId: "Lzm6RpNu3ErSDtGCHxpi",
        source: "publicRoutes"
      };
    }
  });

  assert.equal(state.pendingProfileRestaurantId, "Lzm6RpNu3ErSDtGCHxpi");
  assert.equal(state.pendingProfileTopTab, "menu");
  assert.equal(state.pendingInitialTab, "profile");
});

test("initial route state lets qr r query id beat unresolved path slug", () => {
  const state = resolveInitialRouteState({
    qs: makeQs({ r: "BroPizzaRestaurant123", src: "qr", table: "7" }),
    pathname: "/bro-pizza/menu",
    normalizeInitialTab: (value) => value,
    normalizeAuthMode: (value) => value,
    readPublicRouteResolution: () => null
  });

  assert.equal(state.pendingProfileRestaurantId, "BroPizzaRestaurant123");
  assert.equal(state.pendingProfileTopTab, "menu");
  assert.equal(state.pendingProfileAccessSource, "qr");
  assert.equal(state.pendingProfileTableNumber, 7);
});

test("initial route state falls back from qr without r to slug publicRoute cache", () => {
  const state = resolveInitialRouteState({
    qs: makeQs({ src: "qr", table: "7" }),
    pathname: "/bro-pizza/menu",
    normalizeInitialTab: (value) => value,
    normalizeAuthMode: (value) => value,
    readPublicRouteResolution: (slug) => {
      if (slug !== "bro-pizza") return null;
      return {
        found: true,
        status: "active",
        inputSlug: "bro-pizza",
        canonicalSlug: "bro-pizza",
        restaurantId: "BroPizzaRestaurant123",
        source: "publicRoutes"
      };
    }
  });

  assert.equal(state.pendingProfileRestaurantId, "BroPizzaRestaurant123");
  assert.equal(state.pendingProfileTopTab, "menu");
  assert.equal(state.pendingProfileAccessSource, "qr");
  assert.equal(state.pendingProfileTableNumber, 7);
});

test("initial route state keeps missing publicRoute slug as resolving input only", () => {
  const state = resolveInitialRouteState({
    qs: makeQs({}),
    pathname: "/unknown-bistro/menu",
    normalizeInitialTab: (value) => value,
    normalizeAuthMode: (value) => value,
    readPublicRouteResolution: () => null
  });

  assert.equal(state.pendingProfileRestaurantId, "unknown-bistro");
  assert.equal(state.pendingProfileTopTab, "menu");
  assert.equal(state.pendingInitialTab, "profile");
});

test("initial route state can use a cached publicRoutes resolution for query restaurant ids", () => {
  const state = resolveInitialRouteState({
    qs: makeQs({ r: "moka-coffee", src: "qr", table: "7" }),
    pathname: "/feed",
    normalizeInitialTab: (value) => value,
    normalizeAuthMode: (value) => value,
    readPublicRouteResolution: (slug) => {
      if (slug !== "moka-coffee") return null;
      return {
        found: true,
        status: "active",
        inputSlug: "moka-coffee",
        canonicalSlug: "moka-coffee",
        restaurantId: "restaurant-moka-123456",
        source: "firestore"
      };
    }
  });

  assert.equal(state.pendingProfileRestaurantId, "restaurant-moka-123456");
  assert.equal(state.pendingProfileTopTab, "menu");
  assert.equal(state.pendingProfileAccessSource, "qr");
  assert.equal(state.pendingProfileTableNumber, 7);
});

test("initial route state can use global public route resolution cache by default", () => {
  const previous = globalThis.__MENYRA_PUBLIC_ROUTE_RESOLUTIONS__;
  globalThis.__MENYRA_PUBLIC_ROUTE_RESOLUTIONS__ = new Map([
    ["antica", {
      found: true,
      status: "active",
      inputSlug: "antica",
      canonicalSlug: "antica",
      restaurantId: "restaurant-antica-123456",
      source: "firestore"
    }]
  ]);
  try {
    const state = resolveInitialRouteState({
      qs: makeQs({}),
      pathname: "/antica/menu",
      normalizeInitialTab: (value) => value,
      normalizeAuthMode: (value) => value
    });

    assert.equal(state.pendingProfileRestaurantId, "restaurant-antica-123456");
    assert.equal(state.pendingProfileTopTab, "menu");
    assert.equal(state.pendingInitialTab, "profile");
  } finally {
    if (previous === undefined) {
      delete globalThis.__MENYRA_PUBLIC_ROUTE_RESOLUTIONS__;
    } else {
      globalThis.__MENYRA_PUBLIC_ROUTE_RESOLUTIONS__ = previous;
    }
  }
});

test("initial route state still falls back to launch alias when cache misses", () => {
  const state = resolveInitialRouteState({
    qs: makeQs({}),
    pathname: "/casarita/menu",
    normalizeInitialTab: (value) => value,
    normalizeAuthMode: (value) => value,
    readPublicRouteResolution: () => null
  });

  assert.equal(state.pendingProfileRestaurantId, "Lzm6RpNu3ErSDtGCHxpi");
  assert.equal(state.pendingProfileTopTab, "menu");
});

test("initial route state can use explicit startup route runtime context", () => {
  const state = resolveInitialRouteState({
    qs: makeQs({}),
    pathname: "/feed",
    normalizeInitialTab: (value) => value,
    normalizeAuthMode: (value) => value,
    startupRouteContext: {
      version: 1,
      pendingInitialTab: "profile",
      pendingProfileRestaurantId: "moka-coffee",
      pendingProfileTopTab: "menu",
      pendingProfileContentTab: "menu",
      pendingProfileAccessSource: "qr",
      pendingProfileTableNumber: 9
    }
  });

  assert.equal(state.pendingProfileRestaurantId, "moka-coffee");
  assert.equal(state.pendingProfileTopTab, "menu");
  assert.equal(state.pendingProfileAccessSource, "qr");
  assert.equal(state.pendingProfileTableNumber, 9);
  assert.equal(state.pendingInitialTab, "profile");
});
