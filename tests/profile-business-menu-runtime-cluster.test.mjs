import assert from "node:assert/strict";
import test from "node:test";

import { createProfileBusinessMenuRuntimeCluster } from "../apps/menyra-social/core/app-shell/profile-business-menu-runtime-cluster.js";

function deferred() {
  let resolve;
  const promise = new Promise((res) => {
    resolve = res;
  });
  return { promise, resolve };
}

function never() {
  return new Promise(() => {});
}

function withTestDeadline(promise, timeoutMs = 250) {
  let timerId = null;
  const timeout = new Promise((_resolve, reject) => {
    timerId = setTimeout(() => reject(new Error("test deadline exceeded")), timeoutMs);
  });
  return Promise.race([promise, timeout]).finally(() => {
    if (timerId) clearTimeout(timerId);
  });
}

function createState() {
  return {
    activeTab: "profile",
    profileTopTab: "menu",
    profileContentTab: "menu",
    profileView: {
      profile: {
        restaurantId: "restaurant-a",
        canonicalRestaurantId: "restaurant-a",
        role: "business",
        type: "restaurant"
      },
      posts: [],
      routePayload: {
        restaurantId: "restaurant-a",
        canonicalRestaurantId: "restaurant-a"
      }
    },
    __webDirectEntry: {
      active: true,
      restaurantId: "restaurant-a",
      canonicalRestaurantId: "restaurant-a",
      webPriority: true,
      menuFirst: true
    },
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
      error: "",
      truthSource: "public-menu",
      truthState: "unknown"
    }
  };
}

test("public menu ensure starts visible focus in parallel with menu read", async () => {
  const state = createState();
  const menuStarted = deferred();
  const releaseMenu = deferred();
  const focusCalls = [];
  const cluster = createProfileBusinessMenuRuntimeCluster({
    state,
    profileMenuDeps: {
      state,
      importModuleFn: async () => ({
        createProfileMenuFocusRenderController: () => ({
          renderPublicProfileView: () => "",
          renderMenuAdminView: () => "",
          renderProfileView: () => ""
        })
      }),
      isRestaurantCafeProfileFn: () => true,
      requestRenderFn: () => {}
    },
    dataLoaders: {
      showPublicProfileFn: () => {},
      loadMenuForRestaurantFn: async () => {
        menuStarted.resolve();
        await releaseMenu.promise;
        return { items: [{ id: "item-1", name: "Pizza" }], truthState: "seeded" };
      },
      loadFocusForRestaurantFn: async (_restaurantId, options = {}) => {
        focusCalls.push(options);
        return { items: [], truthState: "knownEmpty" };
      }
    }
  });

  cluster.ensureMenuDataForProfile(state.profileView.profile);
  await menuStarted.promise;

  assert.equal(focusCalls.length, 1);
  assert.notEqual(focusCalls[0]?.prefetchOnly, true);

  releaseMenu.resolve();
});

test("public posts ensure renders visible posts without waiting for slow canonical resolve", async () => {
  const state = createState();
  state.profileTopTab = "profile";
  state.profileContentTab = "posts";
  state.__webDirectEntry = {
    active: true,
    restaurantId: "restaurant-a",
    canonicalRestaurantId: "restaurant-a",
    webPriority: true,
    postsFirst: true
  };
  const committed = deferred();
  const postCalls = [];
  const cluster = createProfileBusinessMenuRuntimeCluster({
    state,
    profileMenuDeps: {
      state,
      importModuleFn: async () => ({
        createProfileMenuFocusRenderController: () => ({
          renderPublicProfileView: () => "",
          renderMenuAdminView: () => "",
          renderProfileView: () => ""
        })
      }),
      isRestaurantCafeProfileFn: () => true,
      requestRenderFn: () => {}
    },
    dataLoaders: {
      fetchBusinessProfileDocFn: never,
      showPublicProfileFn: (profile, posts) => {
        state.profileView = {
          ...state.profileView,
          profile,
          posts
        };
        committed.resolve({ profile, posts });
      },
      loadBusinessPostsForRestaurantFn: async (restaurantId, options = {}) => {
        postCalls.push({ restaurantId, options });
        return {
          posts: [{
            id: "post-1",
            restaurantId,
            url: "https://cdn.example/post-1.jpg"
          }],
          status: "ready",
          restaurantId
        };
      }
    }
  });

  cluster.ensurePostsDataForProfile(state.profileView.profile);
  const result = await withTestDeadline(committed.promise);

  assert.equal(postCalls.length, 1);
  assert.equal(postCalls[0].restaurantId, "restaurant-a");
  assert.equal(postCalls[0].options.skipProfileResolve, true);
  assert.equal(result.posts.length, 1);
  assert.equal(result.profile.postsLoaded, true);
  assert.equal(result.profile.truthState, "stable");
});
