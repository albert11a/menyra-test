import assert from "node:assert/strict";
import test from "node:test";

import { createPublicProfileDirectEntryController } from "../apps/menyra-social/core/profile/public-profile-direct-entry-controller.js";

function createState() {
  return {
    activeTab: "feed",
    profileTopTab: "profile",
    profileContentTab: "posts",
    profileView: null,
    profileModal: { open: false, profile: null },
    profileViewMode: "grid",
    profilePostMenuId: null,
    profileBackTab: "",
    drawerOpen: false,
    restaurants: [],
    menu: {
      restaurantId: "70-s-pastry-and-bakery",
      items: [],
      loading: false,
      error: "",
      source: "public",
      truthState: "knownEmpty"
    },
    focus: {
      restaurantId: "70-s-pastry-and-bakery",
      items: [],
      loading: false,
      error: "",
      enabled: true,
      truthSource: "public-menu",
      truthState: "knownEmpty"
    },
    __publicRouteBootstrap: {
      restaurantId: "70-s-pastry-and-bakery",
      canonicalRestaurantId: "",
      phase: "loading",
      businessSnapshot: {
        restaurantId: "70-s-pastry-and-bakery",
        identity: {
          name: "70s Pastry",
          publicSlug: "70-s-pastry-and-bakery"
        },
        posts: { state: "unknown", items: [] },
        menu: { state: "knownEmpty", count: 0, items: [] },
        focus: { state: "knownEmpty", count: 0, items: [] },
        truth: {
          identity: "seeded",
          posts: "unknown",
          menu: "knownEmpty",
          focus: "knownEmpty"
        }
      }
    }
  };
}

test("direct entry never promotes a synthetic slug snapshot to canonical empty truth", () => {
  const state = createState();
  const controller = createPublicProfileDirectEntryController({
    state,
    resolveVisibleProfileSurface: () => ({ status: "loading" })
  });

  const entry = controller.seedPendingDirectEntry({
    pendingProfileRestaurantId: "70-s-pastry-and-bakery",
    pendingProfileTopTab: "menu",
    pendingProfileContentTab: "menu"
  });

  assert.equal(entry.restaurantId, "70-s-pastry-and-bakery");
  assert.equal(entry.canonicalRestaurantId, "");
  assert.equal(state.profileView.profile.canonicalRestaurantId, "");
  assert.equal(state.profileView.routePayload.canonicalRestaurantId, "");
  assert.equal(state.__webDirectEntry.canonicalRestaurantId, "");
  assert.equal(state.menu.restaurantId, "70-s-pastry-and-bakery");
  assert.equal(state.menu.loading, true);
  assert.equal(state.menu.truthState, "unknown");
  assert.equal(state.focus.loading, true);
  assert.equal(state.focus.truthState, "unknown");
});
