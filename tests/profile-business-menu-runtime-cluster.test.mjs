import assert from "node:assert/strict";
import test from "node:test";

import { createProfileBusinessMenuRuntimeCluster } from "../apps/menyra-social/core/app-shell/profile-business-menu-runtime-cluster.js";

function createVisiblePublicProfileState({ posts = [], postsLoaded = false, truthState = "unknown" } = {}) {
  return {
    activeTab: "profile",
    profileTopTab: "profile",
    profileContentTab: "posts",
    profileBackTab: "",
    profileView: {
      profile: {
        restaurantId: "restaurant-a",
        canonicalRestaurantId: "restaurant-a",
        role: "business",
        postsLoaded,
        truthState
      },
      posts,
      routePayload: null,
      directEntry: null
    },
    __webDirectEntry: {
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

function createCluster({ state, loadBusinessPostsForRestaurantFn, showCalls }) {
  return createProfileBusinessMenuRuntimeCluster({
    state,
    dataLoaders: {
      loadMenuForRestaurantFn: async () => ({ items: [], truthState: "unknown" }),
      loadFocusForRestaurantFn: async () => ({ items: [], truthState: "unknown" }),
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
