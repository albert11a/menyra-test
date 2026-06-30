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
    menuLayout: {},
    __nextRouteHistoryMode: ""
  };
}

function createController(state, showCalls = [], overrides = {}) {
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
      state.profileView = {
        profile,
        posts,
        routePayload: options?.routePayload || null,
        directEntry: options?.directEntry || null,
        menuAccessSource: options?.menuAccessSource || "",
        tableNumber: options?.tableNumber || 0
      };
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
    loadUserPostsForUser: async () => [],
    ...overrides
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

test("business profile open fallback does not throw when route snapshot id is unavailable", async () => {
  const state = createState("profile");
  state.profileView = {
    profile: {
      restaurantId: "moka",
      canonicalRestaurantId: "moka",
      name: "Moka Coffee",
      role: "business",
      posts: []
    },
    posts: []
  };
  const controller = createController(state, [], {
    fetchBusinessProfileDoc: async () => {
      throw new Error("simulated-profile-read-failure");
    }
  });

  await assert.doesNotReject(() => (
    controller.openProfileViewFromBusiness({ id: "moka", name: "Moka Coffee" }, { showBack: false })
  ));
  assert.equal(state.profileView.profile.restaurantId, "moka");
});

test("business profile loading surface does not use loading text as missing bio fallback", async () => {
  const state = createState("feed");
  const showCalls = [];
  const controller = createController(state, showCalls);

  await controller.openProfileViewFromBusiness({ id: "moka", name: "Moka Coffee" }, { showBack: true });

  assert.equal(showCalls.length > 0, true);
  assert.equal(showCalls.some(({ profile }) => profile?.bio === "Profil wird geladen..."), false);
});

test("direct posts-first business profile route warms menu data without waiting for delayed timers", async () => {
  const state = createState("profile");
  state.__webDirectEntry = {
    active: true,
    webPriority: true,
    postsFirst: true,
    restaurantId: "moka",
    canonicalRestaurantId: "moka"
  };
  const menuWarmCalls = [];
  const controller = createController(state, [], {
    ensureMenuDataForProfile: (profile = {}) => {
      menuWarmCalls.push({
        restaurantId: profile.restaurantId,
        canonicalRestaurantId: profile.canonicalRestaurantId
      });
    }
  });

  await controller.openProfileViewFromBusiness({ id: "moka", name: "Moka Coffee" }, { showBack: false });
  await Promise.resolve();

  assert.equal(menuWarmCalls.length > 0, true);
  assert.equal(menuWarmCalls[0].restaurantId, "moka");
  assert.equal(menuWarmCalls[0].canonicalRestaurantId, "moka");
});

test("direct qr menu route warms canonical menu data after slug-only cold start", async () => {
  const state = createState("profile");
  state.__webDirectEntry = {
    active: true,
    webPriority: true,
    menuFirst: true,
    restaurantId: "moka-slug",
    canonicalRestaurantId: "moka-slug",
    menuAccessSource: "qr",
    tableNumber: 7
  };
  const showCalls = [];
  const menuWarmCalls = [];
  const controller = createController(state, showCalls, {
    ensureMenuDataForProfile: (profile = {}) => {
      menuWarmCalls.push({
        restaurantId: profile.restaurantId,
        canonicalRestaurantId: profile.canonicalRestaurantId
      });
    },
    fetchBusinessProfileDoc: async () => ({
      id: "moka-canonical",
      data: { name: "Moka Coffee", publicSlug: "moka-slug" }
    })
  });

  await controller.openProfileViewFromBusiness(
    { id: "moka-slug", name: "Moka Coffee" },
    { showBack: false, topTab: "menu", menuAccessSource: "qr", tableNumber: 7 }
  );
  await Promise.resolve();

  assert.equal(showCalls.at(-1)?.options?.menuAccessSource, "qr");
  assert.equal(showCalls.at(-1)?.options?.tableNumber, 7);
  assert.equal(menuWarmCalls.some((call) => (
    call.restaurantId === "moka-canonical"
    && call.canonicalRestaurantId === "moka-canonical"
  )), true);
});

test("direct menu business profile route applies route menu seed before live menu load", async () => {
  const state = createState("profile");
  state.__webDirectEntry = {
    active: true,
    webPriority: true,
    menuFirst: true,
    restaurantId: "moka",
    canonicalRestaurantId: "moka"
  };
  state.__publicRouteBootstrap = {
    owner: "web-direct",
    routeFirst: true,
    restaurantId: "moka",
    canonicalRestaurantId: "moka",
    surface: "menu",
    topTab: "menu",
    contentTab: "menu",
    identity: {
      name: "Moka Coffee"
    },
    menu: {
      state: "seeded",
      items: [
        { id: "late", name: "Late item", orderIndex: 5 },
        { id: "early", name: "Early item", orderIndex: 1 }
      ],
      count: 2,
      statusBadgeVisible: true
    },
    focus: {
      state: "knownEmpty",
      items: [],
      count: 0,
      enabled: true
    },
    businessSnapshot: {
      restaurantId: "moka",
      identity: {
        name: "Moka Coffee"
      },
      posts: {
        state: "knownEmpty",
        items: [],
        count: 0
      },
      menu: {
        state: "seeded",
        items: [
          { id: "late", name: "Late item", orderIndex: 5 },
          { id: "early", name: "Early item", orderIndex: 1 }
        ],
        count: 2,
        statusBadgeVisible: true
      },
      focus: {
        state: "knownEmpty",
        items: [],
        count: 0,
        enabled: true
      },
      truth: {
        identity: "seeded",
        posts: "knownEmpty",
        menu: "seeded",
        focus: "knownEmpty"
      }
    },
    truth: {
      identity: "seeded",
      posts: "knownEmpty",
      menu: "seeded",
      focus: "knownEmpty"
    }
  };
  const showCalls = [];
  const menuWarmCalls = [];
  const controller = createController(state, showCalls, {
    ensureMenuDataForProfile: (profile = {}) => {
      menuWarmCalls.push({
        restaurantId: profile.restaurantId,
        canonicalRestaurantId: profile.canonicalRestaurantId
      });
    },
    loadBusinessPostsForRestaurant: async () => []
  });

  await controller.openProfileViewFromBusiness(
    { id: "moka", name: "Moka Coffee" },
    { showBack: false, topTab: "menu" }
  );
  await Promise.resolve();

  assert.equal(state.menu.restaurantId, "moka");
  assert.equal(state.menu.loading, false);
  assert.equal(state.menu.error, "");
  assert.equal(state.menu.routeSeed, true);
  assert.equal(state.menu.truthState, "seeded");
  assert.deepEqual(state.menu.items.map((item) => item.id), ["early", "late"]);
  assert.equal(state.focus.restaurantId, "moka");
  assert.equal(state.focus.loading, false);
  assert.equal(state.focus.truthSource, "public-menu");
  assert.equal(state.focus.truthState, "knownEmpty");
  const seededRoutePayloadCall = showCalls.find((call) => (
    call?.options?.routePayload?.menu?.state === "seeded"
  ));
  assert.ok(seededRoutePayloadCall);
  assert.deepEqual(
    seededRoutePayloadCall.options.routePayload.menu.items.map((item) => item.id),
    ["early", "late"]
  );
  assert.equal(menuWarmCalls.length > 0, true);
});

test("direct qr menu route uses route seed without waiting for profile reads", async () => {
  const state = createState("profile");
  state.__webDirectEntry = {
    active: true,
    webPriority: true,
    menuFirst: true,
    restaurantId: "moka",
    canonicalRestaurantId: "moka",
    menuAccessSource: "qr",
    tableNumber: 7
  };
  state.__publicRouteBootstrap = {
    owner: "web-direct",
    routeFirst: true,
    restaurantId: "moka",
    canonicalRestaurantId: "moka",
    surface: "menu",
    topTab: "menu",
    contentTab: "menu",
    menuAccessSource: "qr",
    tableNumber: 7,
    identity: {
      name: "Moka Coffee"
    },
    businessSnapshot: {
      restaurantId: "moka",
      identity: {
        name: "Moka Coffee"
      },
      posts: {
        state: "knownEmpty",
        items: [],
        count: 0
      },
      menu: {
        state: "seeded",
        items: [
          { id: "qr-item", name: "QR item", orderIndex: 1 }
        ],
        count: 1,
        statusBadgeVisible: true
      },
      focus: {
        state: "knownEmpty",
        items: [],
        count: 0,
        enabled: true
      },
      truth: {
        identity: "seeded",
        posts: "knownEmpty",
        menu: "seeded",
        focus: "knownEmpty"
      }
    },
    truth: {
      identity: "seeded",
      posts: "knownEmpty",
      menu: "seeded",
      focus: "knownEmpty"
    }
  };
  const showCalls = [];
  const menuWarmCalls = [];
  let profileReadCalls = 0;
  let postsReadCalls = 0;
  const controller = createController(state, showCalls, {
    ensureMenuDataForProfile: (profile = {}) => {
      menuWarmCalls.push({
        restaurantId: profile.restaurantId,
        canonicalRestaurantId: profile.canonicalRestaurantId
      });
    },
    fetchBusinessProfileDoc: async () => {
      profileReadCalls += 1;
      return null;
    },
    loadBusinessPostsForRestaurant: async () => {
      postsReadCalls += 1;
      return [];
    }
  });

  await controller.openProfileViewFromBusiness(
    { id: "moka", name: "Moka Coffee" },
    { showBack: false, topTab: "menu", menuAccessSource: "qr", tableNumber: 7 }
  );
  await Promise.resolve();

  assert.equal(state.menu.restaurantId, "moka");
  assert.equal(state.menu.loading, false);
  assert.equal(state.menu.truthState, "seeded");
  assert.deepEqual(state.menu.items.map((item) => item.id), ["qr-item"]);
  assert.equal(showCalls.at(-1)?.options?.menuAccessSource, "qr");
  assert.equal(showCalls.at(-1)?.options?.tableNumber, 7);
  assert.equal(menuWarmCalls.length > 0, true);
  assert.equal(profileReadCalls, 0);
  assert.equal(postsReadCalls, 0);
});
