import test from "node:test";
import assert from "node:assert/strict";

import {
  shouldPreloadProfileMenuFocusRenderer
} from "../apps/menyra-social/core/profile/profile-menu-focus-render-preload-utils.js";

test("preloads for active profile and menu tabs", () => {
  assert.equal(shouldPreloadProfileMenuFocusRenderer({
    state: { activeTab: "profile" }
  }), true);
  assert.equal(shouldPreloadProfileMenuFocusRenderer({
    state: { activeTab: "menu" }
  }), true);
});

test("preloads for pending public profile routes", () => {
  assert.equal(shouldPreloadProfileMenuFocusRenderer({
    state: { activeTab: "feed" },
    pendingRoute: { pendingProfileRestaurantId: "casarita" }
  }), true);
  assert.equal(shouldPreloadProfileMenuFocusRenderer({
    state: { activeTab: "feed" },
    pendingRoute: { pendingUserRouteId: "albert" }
  }), true);
});

test("preloads for an active web direct profile entry", () => {
  assert.equal(shouldPreloadProfileMenuFocusRenderer({
    state: {
      activeTab: "feed",
      __webDirectEntry: {
        active: true,
        restaurantId: "casarita"
      }
    }
  }), true);
});

test("does not preload on plain feed startup", () => {
  assert.equal(shouldPreloadProfileMenuFocusRenderer({
    state: { activeTab: "feed" },
    pendingRoute: {}
  }), false);
});
