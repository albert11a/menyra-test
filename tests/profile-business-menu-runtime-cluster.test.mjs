import assert from "node:assert/strict";
import test from "node:test";

import { createProfileBusinessMenuRuntimeCluster } from "../apps/menyra-social/core/app-shell/profile-business-menu-runtime-cluster.js";

function createVisiblePublicProfileState({
  posts = [],
  postsLoaded = false,
  truthState = "unknown",
  profile = null,
  routePayload = null,
  webDirectEntry = null
} = {}) {
  const safeProfile = profile || {
    restaurantId: "restaurant-a",
    canonicalRestaurantId: "restaurant-a",
    role: "business",
    postsLoaded,
    truthState
  };
  return {
    activeTab: "profile",
    profileTopTab: "profile",
    profileContentTab: "posts",
    profileBackTab: "",
    profileView: {
      profile: safeProfile,
      posts,
      routePayload,
      directEntry: null
    },
    __webDirectEntry: webDirectEntry || {
      active: true,
      restaurantId: "restaurant-a",
      canonicalRestaurantId: "restaurant-a",
      owner: "web-direct",
      routeFirst: true,
      webPriority: true,
      postsFirst: true,
      topTab: "profile",
      contentTab: "posts"
    },
    menu: {
      restaurantId: "restaurant-a",
      items: [],
      loading: false,
      error: "",
      source: "public",
      statusBadgeVisible: true,
      truthState: "unknown"
    },
    focus: {
      restaurantId: "restaurant-a",
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

function waitForAsyncEnsure() {
  return new Promise((resolve) => {
    setImmediate(resolve);
  });
}

async function withMutedConsoleError(task) {
  const original = console.error;
  console.error = () => {};
  try {
    return await task();
  } finally {
    console.error = original;
  }
}

async function withNoopRetryTimers(task) {
  const originalSetTimeout = globalThis.setTimeout;
  const originalClearTimeout = globalThis.clearTimeout;
  globalThis.setTimeout = () => ({ noop: true });
  globalThis.clearTimeout = () => {};
  try {
    return await task();
  } finally {
    globalThis.setTimeout = originalSetTimeout;
    globalThis.clearTimeout = originalClearTimeout;
  }
}

function createCluster({
  state,
  loadMenuForRestaurantFn = async () => ({ items: [], truthState: "unknown" }),
  loadFocusForRestaurantFn = async () => ({ items: [], truthState: "unknown" }),
  loadBusinessPostsForRestaurantFn,
  showCalls
}) {
  return createProfileBusinessMenuRuntimeCluster({
    state,
    dataLoaders: {
      loadMenuForRestaurantFn,
      loadFocusForRestaurantFn,
      loadBusinessPostsForRestaurantFn,
      showPublicProfileFn: (profile, posts, options) => {
        showCalls.push({ profile, posts, options });
        state.profileView = {
          ...state.profileView,
          profile,
          posts,
          routePayload: options?.routePayload || null,
          directEntry: options?.directEntry || null
        };
      }
    }
  });
}

test("public profile posts transient failure preserves visible posts without empty truth", async () => {
  const existingPosts = [
    { id: "post-1", restaurantId: "restaurant-a", url: "https://cdn.example/post-1.jpg" }
  ];
  const state = createVisiblePublicProfileState({
    posts: existingPosts,
    postsLoaded: true,
    truthState: "stable"
  });
  const showCalls = [];
  const cluster = createCluster({
    state,
    showCalls,
    loadBusinessPostsForRestaurantFn: async () => {
      throw new Error("transient posts read failed");
    }
  });

  await withNoopRetryTimers(() => withMutedConsoleError(async () => {
    cluster.ensurePostsDataForProfile(state.profileView.profile);
    await waitForAsyncEnsure();
  }));

  assert.equal(showCalls.length, 0);
  assert.equal(state.profileView.profile.postsLoaded, true);
  assert.equal(state.profileView.profile.truthState, "stable");
  assert.deepEqual(state.profileView.posts, existingPosts);
});

test("public profile posts successful empty read commits empty truth", async () => {
  const state = createVisiblePublicProfileState({
    posts: [],
    postsLoaded: false,
    truthState: "unknown"
  });
  const showCalls = [];
  const cluster = createCluster({
    state,
    showCalls,
    loadBusinessPostsForRestaurantFn: async () => []
  });

  await withNoopRetryTimers(async () => {
    cluster.ensurePostsDataForProfile(state.profileView.profile);
    await waitForAsyncEnsure();
  });

  assert.equal(showCalls.length, 1);
  assert.equal(state.profileView.profile.postsLoaded, true);
  assert.equal(state.profileView.profile.truthState, "empty");
  assert.deepEqual(state.profileView.posts, []);
});

test("public profile posts use canonical route payload instead of alias fallback", async () => {
  const state = createVisiblePublicProfileState({
    profile: {
      restaurantId: "route-alias",
      role: "business",
      postsLoaded: false,
      truthState: "unknown"
    },
    routePayload: {
      restaurantId: "route-alias",
      canonicalRestaurantId: "canonical-restaurant",
      businessSnapshot: {
        restaurantId: "canonical-restaurant"
      }
    },
    webDirectEntry: {
      active: true,
      restaurantId: "route-alias",
      canonicalRestaurantId: "canonical-restaurant",
      owner: "web-direct",
      routeFirst: true,
      webPriority: true,
      postsFirst: true,
      topTab: "profile",
      contentTab: "posts"
    }
  });
  const readIds = [];
  const showCalls = [];
  const cluster = createCluster({
    state,
    showCalls,
    loadBusinessPostsForRestaurantFn: async (restaurantId) => {
      readIds.push(restaurantId);
      if (restaurantId === "route-alias") {
        throw new Error("route alias must not be used as profile post truth");
      }
      return [];
    }
  });

  await withNoopRetryTimers(async () => {
    cluster.ensurePostsDataForProfile(state.profileView.profile);
    await waitForAsyncEnsure();
  });

  assert.equal(readIds.length >= 1, true);
  assert.equal(readIds.every((id) => id === "canonical-restaurant"), true);
  assert.equal(showCalls.length >= 1, true);
  const lastCall = showCalls[showCalls.length - 1];
  assert.equal(lastCall.profile.restaurantId, "canonical-restaurant");
  assert.equal(lastCall.profile.canonicalRestaurantId, "canonical-restaurant");
  assert.equal(lastCall.profile.postsLoaded, true);
  assert.equal(lastCall.profile.truthState, "empty");
  assert.deepEqual(lastCall.posts, []);
});

test("public profile posts ensure warms menu immediately on posts surface", async () => {
  const state = createVisiblePublicProfileState({
    posts: [],
    postsLoaded: false,
    truthState: "unknown"
  });
  const menuReadIds = [];
  const focusReadIds = [];
  const showCalls = [];
  const cluster = createCluster({
    state,
    showCalls,
    loadMenuForRestaurantFn: async (restaurantId) => {
      menuReadIds.push(restaurantId);
      const items = [{ id: "item-1", restaurantId }];
      state.menu = {
        ...state.menu,
        restaurantId,
        items,
        loading: false,
        source: "public",
        truthState: "seeded"
      };
      return { items, truthState: "seeded" };
    },
    loadFocusForRestaurantFn: async (restaurantId) => {
      focusReadIds.push(restaurantId);
      state.focus = {
        ...state.focus,
        restaurantId,
        items: [],
        loading: false,
        truthSource: "public-menu",
        truthState: "knownEmpty"
      };
      return { items: [], truthState: "knownEmpty" };
    },
    loadBusinessPostsForRestaurantFn: async () => []
  });

  await withNoopRetryTimers(async () => {
    cluster.ensurePostsDataForProfile(state.profileView.profile);
    await waitForAsyncEnsure();
  });

  assert.deepEqual(menuReadIds, ["restaurant-a"]);
  assert.equal(focusReadIds.includes("restaurant-a"), true);
});
