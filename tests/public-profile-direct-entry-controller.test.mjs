import assert from "node:assert/strict";
import test from "node:test";

import {
  createPublicProfileDirectEntryController
} from "../apps/menyra-social/core/profile/public-profile-direct-entry-controller.js";

function createState() {
  return {
    activeTab: "feed",
    profileTopTab: "profile",
    profileContentTab: "posts",
    profileBackTab: "",
    profileView: null,
    profileModal: { open: false, profile: null },
    profileViewMode: "grid",
    profilePostMenuId: null,
    drawerOpen: false,
    restaurants: [],
    menuLayout: {},
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
    },
    __publicRouteBootstrap: {
      owner: "web-direct",
      routeFirst: true,
      restaurantId: "restaurant-a",
      canonicalRestaurantId: "restaurant-a",
      surface: "menu",
      topTab: "menu",
      contentTab: "menu",
      menuAccessSource: "qr",
      tableNumber: 5,
      identity: {
        name: "Cafe A"
      },
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
            { id: "late", name: "Late", orderIndex: 5 },
            { id: "early", name: "Early", orderIndex: 1 }
          ],
          count: 2,
          statusBadgeVisible: true
        },
        focus: {
          state: "seeded",
          items: [
            { id: "focus-1", title: "Lunch", imageUrl: "https://example.test/focus.jpg" }
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
      },
      truth: {
        identity: "seeded",
        posts: "knownEmpty",
        menu: "seeded",
        focus: "seeded"
      }
    }
  };
}

test("direct public route seed keeps menu and focus in route payload before live reads", () => {
  const state = createState();
  const controller = createPublicProfileDirectEntryController({ state });

  controller.seedPendingDirectEntry({
    pendingProfileRestaurantId: "restaurant-a",
    pendingProfileTopTab: "menu",
    pendingProfileAccessSource: "qr",
    pendingProfileTableNumber: 5
  });

  assert.equal(state.activeTab, "profile");
  assert.equal(state.profileTopTab, "menu");
  assert.equal(state.profileView.routePayload.menu.state, "seeded");
  assert.deepEqual(
    state.profileView.routePayload.menu.items.map((item) => item.id),
    ["early", "late"]
  );
  assert.equal(state.profileView.routePayload.focus.state, "seeded");
  assert.deepEqual(
    state.profileView.routePayload.focus.items.map((item) => item.id),
    ["focus-1"]
  );
  assert.equal(state.menu.truthState, "seeded");
  assert.equal(state.focus.truthState, "seeded");
});
