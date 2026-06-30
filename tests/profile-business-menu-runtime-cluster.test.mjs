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

function createDeferred() {
  let resolve;
  let reject;
  const promise = new Promise((resolveFn, rejectFn) => {
    resolve = resolveFn;
    reject = rejectFn;
  });
  return { promise, resolve, reject };
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
  loadBusinessPostsForRestaurantFn,
  fetchBusinessProfileDocFn = null,
  showCalls
}) {
  return createProfileBusinessMenuRuntimeCluster({
    state,
    dataLoaders: {
      loadMenuForRestaurantFn: async () => ({ items: [], truthState: "unknown" }),
      loadFocusForRestaurantFn: async () => ({ items: [], truthState: "unknown" }),
      loadBusinessPostsForRestaurantFn,
      fetchBusinessProfileDocFn,
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

test("public profile posts failed canonical read can commit final error without retry or stale data", async () => {
  const state = createVisiblePublicProfileState({
    posts: [],
    postsLoaded: false,
    truthState: "unknown",
    webDirectEntry: {
      active: false,
      restaurantId: "restaurant-a",
      canonicalRestaurantId: "restaurant-a"
    }
  });
  const showCalls = [];
  const cluster = createCluster({
    state,
    showCalls,
    loadBusinessPostsForRestaurantFn: async () => {
      throw new Error("canonical posts read failed");
    }
  });

  await withMutedConsoleError(async () => {
    cluster.ensurePostsDataForProfile(state.profileView.profile);
    await waitForAsyncEnsure();
  });

  assert.equal(showCalls.length, 1);
  assert.equal(state.profileView.profile.postsLoaded, false);
  assert.equal(state.profileView.profile.truthState, "error");
  assert.deepEqual(state.profileView.posts, []);
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

test("public profile posts starts visible target read before canonical resolve settles", async () => {
  const canonicalResolve = createDeferred();
  const state = createVisiblePublicProfileState({
    profile: {
      restaurantId: "route-slug",
      role: "business",
      postsLoaded: false,
      truthState: "unknown"
    },
    webDirectEntry: {
      active: true,
      restaurantId: "route-slug",
      canonicalRestaurantId: "",
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
    fetchBusinessProfileDocFn: () => canonicalResolve.promise,
    loadBusinessPostsForRestaurantFn: async (restaurantId) => {
      readIds.push(restaurantId);
      return [];
    }
  });

  await withNoopRetryTimers(async () => {
    cluster.ensurePostsDataForProfile(state.profileView.profile);
    await waitForAsyncEnsure();
    assert.deepEqual(readIds, ["route-slug"]);
    canonicalResolve.resolve({ id: "canonical-restaurant", data: { name: "Canonical" } });
    await waitForAsyncEnsure();
  });

  assert.deepEqual(readIds.slice(0, 2), ["route-slug", "canonical-restaurant"]);
});

test("public profile posts stale generation cannot overwrite newer visible success", async () => {
  const firstRead = createDeferred();
  const secondRead = createDeferred();
  const state = createVisiblePublicProfileState({
    profile: {
      restaurantId: "restaurant-a",
      canonicalRestaurantId: "restaurant-a",
      role: "business",
      postsLoaded: false,
      truthState: "unknown"
    }
  });
  const showCalls = [];
  const cluster = createCluster({
    state,
    showCalls,
    loadBusinessPostsForRestaurantFn: (restaurantId) => {
      if (restaurantId === "restaurant-a") return firstRead.promise;
      if (restaurantId === "restaurant-b") return secondRead.promise;
      return [];
    }
  });

  await withNoopRetryTimers(async () => {
    cluster.ensurePostsDataForProfile(state.profileView.profile);
    await waitForAsyncEnsure();

    state.profileView.profile = {
      restaurantId: "restaurant-b",
      canonicalRestaurantId: "restaurant-b",
      role: "business",
      postsLoaded: false,
      truthState: "unknown"
    };
    state.profileView.posts = [];
    state.__webDirectEntry = {
      active: true,
      restaurantId: "restaurant-b",
      canonicalRestaurantId: "restaurant-b",
      owner: "web-direct",
      routeFirst: true,
      webPriority: true,
      postsFirst: true,
      topTab: "profile",
      contentTab: "posts"
    };

    cluster.ensurePostsDataForProfile(state.profileView.profile);
    await waitForAsyncEnsure();

    secondRead.resolve([
      { id: "post-b", restaurantId: "restaurant-b", url: "https://cdn.example/post-b.jpg" }
    ]);
    await waitForAsyncEnsure();

    firstRead.resolve([
      { id: "post-a", restaurantId: "restaurant-a", url: "https://cdn.example/post-a.jpg" }
    ]);
    await waitForAsyncEnsure();
  });

  const lastCall = showCalls[showCalls.length - 1];
  assert.equal(lastCall.profile.restaurantId, "restaurant-b");
  assert.deepEqual(lastCall.posts.map((post) => post.id), ["post-b"]);
  assert.equal(state.profileView.profile.restaurantId, "restaurant-b");
  assert.deepEqual(state.profileView.posts.map((post) => post.id), ["post-b"]);
});
