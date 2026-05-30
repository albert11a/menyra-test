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
