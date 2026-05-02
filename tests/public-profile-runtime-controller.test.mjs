import assert from "node:assert/strict";
import test from "node:test";

import { createPublicProfileRuntimeController } from "../apps/menyra-social/core/profile/public-profile-runtime-controller.js";

function createProfileSwitchState() {
  return {
    activeTab: "profile",
    profileTopTab: "profile",
    profileContentTab: "posts",
    profileBackTab: "",
    profileLandingStep: 0,
    profileLandingGreetingIndex: 0,
    profileLandingTourIndex: 0,
    drawerOpen: false,
    profileViewMode: "grid",
    profilePostMenuId: null,
    profileModal: { open: false, profile: null },
    profileView: {
      profile: {
        restaurantId: "casarita",
        canonicalRestaurantId: "casarita",
        name: "Casarita",
        handle: "casarita",
        postsLoaded: true,
        truthState: "stable"
      },
      posts: [],
      routePayload: {
        owner: "web-direct",
        routeFirst: true,
        restaurantId: "casarita",
        canonicalRestaurantId: "casarita",
        businessSnapshot: { restaurantId: "casarita" }
      },
      directEntry: {
        active: true,
        owner: "web-direct",
        routeFirst: true,
        webPriority: true,
        postsFirst: true,
        topTab: "profile",
        contentTab: "posts"
      }
    },
    __webDirectEntry: {
      active: true,
      restaurantId: "casarita",
      canonicalRestaurantId: "casarita",
      owner: "web-direct",
      routeFirst: true,
      webPriority: true,
      postsFirst: true,
      topTab: "profile",
      contentTab: "posts"
    },
    menu: {
      restaurantId: "casarita",
      items: [{ id: "casarita-item" }],
      loading: false,
      error: "",
      source: "public",
      statusBadgeVisible: true,
      truthState: "seeded"
    },
    focus: {
      restaurantId: "casarita",
      items: [{ id: "casarita-focus" }],
      loading: false,
      enabled: true,
      error: "",
      index: 0,
      truthSource: "public-menu",
      truthState: "seeded"
    }
  };
}

test("public profile switch does not inherit stale route/menu state from previous business", () => {
  const state = createProfileSwitchState();
  let renderCount = 0;
  const controller = createPublicProfileRuntimeController({
    state,
    render: () => {
      renderCount += 1;
    },
    normalizeHandle: (value = "") => String(value || "").trim().toLowerCase()
  });

  controller.showPublicProfile({
    restaurantId: "moka",
    name: "Moka Coffee",
    handle: "moka-coffee",
    postsLoaded: true,
    truthState: "stable"
  }, [], {
    showBack: true,
    backTab: "search",
    topTab: "profile",
    contentTab: "posts"
  });

  assert.equal(state.profileView.profile.restaurantId, "moka");
  assert.equal(state.profileView.profile.canonicalRestaurantId, "moka");
  assert.equal(state.profileView.routePayload, null);
  assert.equal(state.profileView.directEntry, null);
  assert.equal(state.__webDirectEntry.active, false);
  assert.equal(state.menu.restaurantId, "moka");
  assert.deepEqual(state.menu.items, []);
  assert.equal(state.menu.truthState, "unknown");
  assert.equal(state.focus.restaurantId, "moka");
  assert.deepEqual(state.focus.items, []);
  assert.equal(state.focus.truthState, "unknown");
  assert.equal(renderCount, 1);
});
