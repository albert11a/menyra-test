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

test("public identity hydration still loads missing title image when avatar identity is ready", async () => {
  const state = createState();
  state.profileView.profile = {
    ...state.profileView.profile,
    restaurantId: "bro-pizza",
    canonicalRestaurantId: "restaurant-a",
    avatar: "https://cdn.example/avatar.jpg",
    titleImageUrl: "",
    coverImageUrl: "",
    coverUrl: "",
    heroUrl: "",
    identityTruthState: "ready"
  };
  state.profileView.routePayload = {
    restaurantId: "bro-pizza",
    canonicalRestaurantId: "restaurant-a"
  };
  state.__webDirectEntry = {
    active: true,
    restaurantId: "bro-pizza",
    canonicalRestaurantId: "restaurant-a",
    webPriority: true,
    menuFirst: true
  };
  const committed = deferred();
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
      fetchBusinessProfileDocFn: async () => ({
        id: "restaurant-a",
        data: {
          avatarUrl: "https://cdn.example/avatar.jpg",
          titleImageUrl: "https://cdn.example/cover.jpg",
          name: "Bro Pizza"
        }
      }),
      showPublicProfileFn: (profile, posts) => {
        state.profileView = {
          ...state.profileView,
          profile,
          posts
        };
        if (profile.titleImageUrl) committed.resolve(profile);
      },
      loadMenuForRestaurantFn: async () => ({ items: [{ id: "item-1" }], truthState: "seeded" }),
      loadFocusForRestaurantFn: async () => ({ items: [], truthState: "knownEmpty" })
    }
  });

  cluster.ensureMenuDataForProfile(state.profileView.profile);
  const profile = await withTestDeadline(committed.promise);

  assert.equal(profile.titleImageUrl, "https://cdn.example/cover.jpg");
  assert.equal(profile.coverImageUrl, "https://cdn.example/cover.jpg");
  assert.equal(profile.coverUrl, "https://cdn.example/cover.jpg");
  assert.equal(profile.heroUrl, "https://cdn.example/cover.jpg");
});

test("public identity hydration applies fansCount as visible followers count", async () => {
  const state = createState();
  state.profileView.profile = {
    ...state.profileView.profile,
    restaurantId: "restaurant-a",
    canonicalRestaurantId: "restaurant-a",
    avatar: "",
    titleImageUrl: "",
    followers: null,
    following: null,
    identityTruthState: "seeded"
  };
  const committed = deferred();
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
      fetchBusinessProfileDocFn: async () => ({
        id: "restaurant-a",
        data: {
          name: "Moka Coffee",
          avatarUrl: "https://cdn.example/avatar.jpg",
          fansCount: 23,
          followingCount: 0
        }
      }),
      showPublicProfileFn: (profile, posts) => {
        state.profileView = {
          ...state.profileView,
          profile,
          posts
        };
        if (profile.followers === 23) committed.resolve(profile);
      },
      loadMenuForRestaurantFn: async () => ({ items: [{ id: "item-1" }], truthState: "seeded" }),
      loadFocusForRestaurantFn: async () => ({ items: [], truthState: "knownEmpty" })
    }
  });

  cluster.ensureMenuDataForProfile(state.profileView.profile);
  const profile = await withTestDeadline(committed.promise);

  assert.equal(profile.followers, 23);
  assert.equal(profile.following, 0);
  assert.equal(profile.identityTruthState, "ready");
});

test("menu-first profile retries posts after a deadline instead of committing content error", async () => {
  const state = createState();
  state.profileTopTab = "profile";
  state.profileContentTab = "posts";
  state.__webDirectEntry = {
    active: true,
    restaurantId: "restaurant-a",
    canonicalRestaurantId: "restaurant-a",
    webPriority: true,
    menuFirst: true,
    postsFirst: false
  };
  const committed = deferred();
  const commits = [];
  let postCalls = 0;
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
      showPublicProfileFn: (profile, posts) => {
        commits.push({ profile, posts });
        state.profileView = {
          ...state.profileView,
          profile,
          posts
        };
        if (posts.length) committed.resolve({ profile, posts });
      },
      loadBusinessPostsForRestaurantFn: async (restaurantId, options = {}) => {
        postCalls += 1;
        if (options.returnStatus === true) {
          return {
            posts: [],
            status: "error",
            restaurantId,
            error: { code: "deadline-exceeded", name: "MnyraPublicProfileReadTimeoutError" }
          };
        }
        return [{
          id: "post-1",
          restaurantId,
          url: "https://cdn.example/post-1.jpg"
        }];
      }
    }
  });

  cluster.ensurePostsDataForProfile(state.profileView.profile);
  const result = await withTestDeadline(committed.promise, 600);

  assert.ok(postCalls >= 2);
  assert.equal(commits.some((entry) => entry.profile.truthState === "error"), false);
  assert.equal(result.posts.length, 1);
  assert.equal(result.profile.postsLoaded, true);
  assert.equal(result.profile.truthState, "stable");
});
