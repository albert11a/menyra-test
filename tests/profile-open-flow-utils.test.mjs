import assert from "node:assert/strict";
import test from "node:test";

import { createProfileOpenFlowControllerCore } from "../apps/menyra-social/core/profile/profile-open-flow-utils.js";

function createState(activeTab = "search") {
  return {
    activeTab,
    profileTopTab: "profile",
    profileContentTab: "posts",
    profileBackTab: "",
    profileView: null,
    profileModal: { open: false, profile: null },
    profileViewMode: "grid",
    profilePostMenuId: null,
    drawerOpen: false,
    userProfile: {},
    restaurants: [],
    __nextRouteHistoryMode: ""
  };
}

function createController(state, showCalls = [], overrides = {}) {
  const safeOverrides = overrides && typeof overrides === "object" ? overrides : {};
  return createProfileOpenFlowControllerCore({
    state,
    isLocalBusinessProfile: () => false,
    getRestaurantMetaById: () => null,
    normalizeSearchKey: (value = "") => String(value || "").trim().toLowerCase(),
    render: () => {},
    ensureMenuDataForProfile: () => {},
    ensureFocusDataForProfile: () => {},
    hydrateRestaurantsByIds: async () => null,
    normalizeExternalProfile: ({ profileDoc, restaurant, fallbackName, posts }) => {
      const restaurantId = String(profileDoc?.id || restaurant?.id || "moka").trim();
      return {
        restaurantId,
        canonicalRestaurantId: restaurantId,
        name: fallbackName || restaurantId,
        handle: restaurantId,
        role: "business",
        posts: Array.isArray(posts) ? posts : [],
        postsLoaded: true,
        truthState: "stable"
      };
    },
    showPublicProfile: (profile, posts, options) => {
      showCalls.push({ profile, posts, options });
      state.activeTab = "profile";
      state.profileView = { profile, posts, directEntry: options?.directEntry || null };
    },
    fetchBusinessProfileDoc: safeOverrides.fetchBusinessProfileDoc || (async ({ restaurantId }) => ({
      id: String(restaurantId || "moka"),
      data: { name: "Moka Coffee", publicSlug: "moka" }
    })),
    loadBusinessPostsForRestaurant: safeOverrides.loadBusinessPostsForRestaurant || (async () => []),
    normalizeExternalUserProfile: (value) => value || {},
    openGuestAuthPrompt: () => false,
    userProfileCache: new Map(),
    hasPendingFollowRequest: async () => false,
    fetchUserDocByUid: async () => null,
    resolveUserByHandle: async () => null,
    loadUserPostsForUser: async () => []
  });
}

test("app-initiated business profile open queues browser history push", async () => {
  const state = createState("search");
  const showCalls = [];
  const controller = createController(state, showCalls);

  await controller.openProfileViewFromBusiness({ id: "moka", name: "Moka Coffee" }, { showBack: true });

  assert.equal(state.__nextRouteHistoryMode, "push");
  assert.equal(showCalls.length > 0, true);
});

test("direct web posts route accepts the initial posts page without a second full read", async () => {
  const state = createState("feed");
  const showCalls = [];
  const postLoadCalls = [];
  const controller = createController(state, showCalls, {
    loadBusinessPostsForRestaurant: async (restaurantId, options = {}) => {
      postLoadCalls.push({ restaurantId, options });
      return {
        posts: [
          {
            id: "post-1",
            restaurantId: String(restaurantId || ""),
            url: "https://cdn.example/post-1.jpg",
            caption: "Visible post"
          }
        ],
        status: "ready",
        restaurantId
      };
    }
  });

  await controller.openProfileViewFromBusiness(
    { id: "moka", restaurantId: "moka", canonicalRestaurantId: "moka", name: "Moka Coffee" },
    { showBack: false, topTab: "profile" }
  );

  assert.equal(postLoadCalls.length, 1);
  assert.equal(postLoadCalls[0].restaurantId, "moka");
  assert.equal(postLoadCalls[0].options.initialPage, true);
  assert.equal(showCalls.at(-1).posts.length, 1);
});

test("direct business profile route does not queue browser history push", async () => {
  const state = createState("feed");
  const controller = createController(state);

  await controller.openProfileViewFromBusiness({ id: "moka", name: "Moka Coffee" }, { showBack: false });

  assert.equal(state.__nextRouteHistoryMode, "");
});

test("direct route known-empty menu snapshot does not seed public menu empty", async () => {
  const state = createState("feed");
  state.menu = {
    restaurantId: "moka",
    items: [],
    loading: false,
    error: "",
    source: "public",
    truthState: "knownEmpty"
  };
  state.__publicRouteBootstrap = {
    restaurantId: "moka",
    identity: { name: "Moka Coffee", handle: "moka" },
    menu: { state: "knownEmpty", knownEmpty: true, count: 0, items: [] },
    truth: { identity: "seeded", menu: "knownEmpty" },
    businessSnapshot: {
      restaurantId: "moka",
      identity: { name: "Moka Coffee", handle: "moka" },
      menu: { state: "knownEmpty", knownEmpty: true, count: 0, items: [] },
      focus: { state: "unknown", items: [] },
      posts: { state: "unknown", items: [] },
      truth: { identity: "seeded", menu: "knownEmpty", focus: "unknown", posts: "unknown" }
    }
  };
  const controller = createController(state);

  await controller.openProfileViewFromBusiness(
    { id: "moka", restaurantId: "moka", name: "Moka Coffee" },
    { showBack: false, topTab: "menu" }
  );

  assert.equal(state.menu.restaurantId, "moka");
  assert.deepEqual(state.menu.items, []);
  assert.equal(state.menu.loading, true);
  assert.equal(state.menu.truthState, "unknown");
});
