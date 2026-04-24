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
