import assert from "node:assert/strict";
import test from "node:test";

import { createPublicBootstrapRuntimeController } from "../apps/menyra-social/core/app-shell/public-bootstrap-runtime-controller.js";

function createWebDirectMenuState() {
  return {
    activeTab: "profile",
    profileTopTab: "menu",
    profileContentTab: "menu",
    restaurants: [],
    feedPosts: [],
    stories: [],
    bootstrapRestaurantPreview: [],
    menuLayout: {},
    __webDirectEntry: {
      active: true,
      webPriority: true,
      menuFirst: true,
      restaurantId: "restaurant-a",
      canonicalRestaurantId: "restaurant-a"
    },
    profileView: {
      restaurantId: "restaurant-a",
      profile: {
        restaurantId: "restaurant-a",
        canonicalRestaurantId: "restaurant-a",
        role: "business",
        postsLoaded: false,
        truthState: "unknown"
      },
      posts: [],
      menuAccessSource: "qr",
      tableNumber: 4,
      directEntry: {
        active: true,
        owner: "web-direct",
        phase: "seeded"
      },
      routePayload: null
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

test("web-direct bootstrap applies public route menu seed immediately", () => {
  const state = createWebDirectMenuState();
  const controller = createPublicBootstrapRuntimeController({
    state,
    render: () => {}
  });

  controller.applyPublicBootstrapPayload({
    publicRoute: {
      restaurantId: "restaurant-a",
      canonicalRestaurantId: "restaurant-a",
      surface: "menu",
      topTab: "menu",
      contentTab: "menu",
      menuAccessSource: "qr",
      tableNumber: 4,
      businessSnapshot: {
        restaurantId: "restaurant-a",
        identity: {
          name: "Cafe A"
        },
        posts: {
          state: "knownEmpty",
          items: [],
          count: 0
        },
        menu: {
          state: "seeded",
          items: [
            { id: "coffee", name: "Coffee", orderIndex: 3 },
            { id: "tea", name: "Tea", orderIndex: 1 }
          ],
          count: 2,
          statusBadgeVisible: true
        },
        focus: {
          state: "seeded",
          items: [
            { id: "focus-1", title: "Breakfast", imageUrl: "https://example.test/focus.jpg" }
          ],
          count: 1,
          enabled: true
        },
        truth: {
          identity: "seeded",
          posts: "knownEmpty",
          menu: "seeded",
          focus: "seeded"
        }
      }
    }
  });

  assert.equal(state.menu.restaurantId, "restaurant-a");
  assert.equal(state.menu.source, "public");
  assert.equal(state.menu.loading, false);
  assert.equal(state.menu.error, "");
  assert.equal(state.menu.truthState, "seeded");
  assert.equal(state.menu.routeSeed, true);
  assert.deepEqual(state.menu.items.map((item) => item.id), ["tea", "coffee"]);
  assert.equal(state.focus.restaurantId, "restaurant-a");
  assert.equal(state.focus.loading, false);
  assert.equal(state.focus.truthState, "seeded");
  assert.deepEqual(state.focus.items.map((item) => item.id), ["focus-1"]);
});
