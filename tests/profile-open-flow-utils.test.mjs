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
    menu: {
      restaurantId: "",
      items: [],
      loading: false,
      error: "",
      source: "public",
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
    __webDirectEntry: {
      active: false,
      restaurantId: "",
      canonicalRestaurantId: "",
      owner: "",
      webPriority: false,
      menuFirst: false,
      postsFirst: false,
      topTab: "",
      contentTab: ""
    },
    __publicRouteBootstrap: null,
    __nextRouteHistoryMode: ""
  };
}

function createController(state, showCalls = [], overrides = {}) {
  return createProfileOpenFlowControllerCore({
    state,
    isLocalBusinessProfile: overrides.isLocalBusinessProfile || (() => false),
    getRestaurantMetaById: overrides.getRestaurantMetaById || (() => null),
    normalizeSearchKey: overrides.normalizeSearchKey || ((value = "") => String(value || "").trim().toLowerCase()),
    render: overrides.render || (() => {}),
    ensureMenuDataForProfile: overrides.ensureMenuDataForProfile || (() => {}),
    ensureFocusDataForProfile: overrides.ensureFocusDataForProfile || (() => {}),
    hydrateRestaurantsByIds: overrides.hydrateRestaurantsByIds || (async () => null),
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
    fetchBusinessProfileDoc: overrides.fetchBusinessProfileDoc || (async ({ restaurantId }) => ({
      id: String(restaurantId || "moka"),
      data: { name: "Moka Coffee", publicSlug: "moka" }
    })),
    loadBusinessPostsForRestaurant: overrides.loadBusinessPostsForRestaurant || (async () => []),
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

test("own business profile clears stale public route menu and focus context", async () => {
  const state = createState("restaurants");
  state.userProfile = {
    role: "business",
    restaurantId: "pidhi-madh",
    name: "PIDHImadh"
  };
  state.restaurants = [
    { id: "pidhi-madh", restaurantId: "pidhi-madh", name: "PIDHImadh" }
  ];
  state.__webDirectEntry = {
    active: true,
    restaurantId: "shop-demo",
    canonicalRestaurantId: "shop-demo",
    owner: "web-direct",
    routeFirst: true,
    webPriority: true,
    menuFirst: true,
    postsFirst: false,
    topTab: "menu",
    contentTab: "menu"
  };
  state.__publicRouteBootstrap = { restaurantId: "shop-demo" };
  state.menu = {
    restaurantId: "shop-demo",
    items: [{ id: "shop-shirt", name: "Local Cotton Shirt" }],
    loading: false,
    error: "",
    source: "public",
    truthState: "seeded"
  };
  state.focus = {
    restaurantId: "shop-demo",
    items: [{ id: "shop-focus", title: "Shop Focus" }],
    loading: false,
    enabled: true,
    error: "",
    index: 0,
    truthSource: "public-menu",
    truthState: "seeded"
  };
  const ensuredMenuProfiles = [];
  const ensuredFocusProfiles = [];
  const controller = createController(state, [], {
    isLocalBusinessProfile: (profile) => String(profile?.restaurantId || "").trim() === "pidhi-madh",
    getRestaurantMetaById: (restaurantId) => (
      restaurantId === "pidhi-madh"
        ? { id: "pidhi-madh", restaurantId: "pidhi-madh", name: "PIDHImadh" }
        : null
    ),
    ensureMenuDataForProfile: (profile) => {
      ensuredMenuProfiles.push(profile);
    },
    ensureFocusDataForProfile: (profile) => {
      ensuredFocusProfiles.push(profile);
    }
  });

  await controller.openProfileViewFromBusiness(
    { restaurantId: "pidhi-madh", name: "PIDHImadh" },
    { showBack: true, topTab: "menu" }
  );

  assert.equal(state.activeTab, "profile");
  assert.equal(state.profileView, null);
  assert.equal(state.profileTopTab, "menu");
  assert.equal(state.__webDirectEntry.active, false);
  assert.equal(state.__webDirectEntry.webPriority, false);
  assert.equal(state.__publicRouteBootstrap, null);
  assert.equal(state.menu.restaurantId, "pidhi-madh");
  assert.deepEqual(state.menu.items, []);
  assert.equal(state.menu.loading, true);
  assert.equal(state.menu.source, "public");
  assert.equal(state.menu.truthState, "unknown");
  assert.equal(state.focus.restaurantId, "pidhi-madh");
  assert.deepEqual(state.focus.items, []);
  assert.equal(state.focus.loading, true);
  assert.equal(state.focus.truthSource, "public-menu");
  assert.equal(state.focus.truthState, "unknown");
  assert.equal(ensuredMenuProfiles[0]?.restaurantId, "pidhi-madh");
  assert.equal(ensuredFocusProfiles[0]?.restaurantId, "pidhi-madh");
});
