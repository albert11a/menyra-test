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

function createController(state, showCalls = []) {
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
    fetchBusinessProfileDoc: async ({ restaurantId }) => ({
      id: String(restaurantId || "moka"),
      data: { name: "Moka Coffee", publicSlug: "moka" }
    }),
    loadBusinessPostsForRestaurant: async () => [],
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

test("direct business profile route does not queue browser history push", async () => {
  const state = createState("feed");
  const controller = createController(state);

  await controller.openProfileViewFromBusiness({ id: "moka", name: "Moka Coffee" }, { showBack: false });

  assert.equal(state.__nextRouteHistoryMode, "");
});
