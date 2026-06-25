import assert from "node:assert/strict";
import test from "node:test";

import { createProfileBusinessMenuRuntimeCluster } from "../apps/menyra-social/core/app-shell/profile-business-menu-runtime-cluster.js";

function createPublicBusinessState({
  restaurantId = "restaurant-a",
  topTab = "menu",
  contentTab = "menu",
  posts = []
} = {}) {
  return {
    activeTab: "profile",
    profileTopTab: topTab,
    profileContentTab: contentTab,
    profileBackTab: "search",
    profileView: {
      profile: {
        restaurantId,
        canonicalRestaurantId: restaurantId,
        role: "business",
        type: "restaurant",
        postsLoaded: posts.length > 0,
        posts
      },
      posts,
      routePayload: {
        restaurantId,
        canonicalRestaurantId: restaurantId
      }
    },
    __webDirectEntry: {
      active: true,
      restaurantId,
      canonicalRestaurantId: restaurantId,
      webPriority: true,
      menuFirst: topTab === "menu",
      postsFirst: topTab === "profile"
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

function createCluster({
  state,
  loadPublicMenuBundleForRestaurantFn = async () => {},
  loadFocusForRestaurantFn = async () => {},
  loadBusinessPostsForRestaurantFn = async () => [],
  showPublicProfileFn = null
} = {}) {
  return createProfileBusinessMenuRuntimeCluster({
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
      showPublicProfileFn: showPublicProfileFn || ((profile, posts, options = {}) => {
        state.profileView = {
          ...state.profileView,
          profile,
          posts,
          ...options
        };
      }),
      loadPublicMenuBundleForRestaurantFn,
      loadFocusForRestaurantFn,
      loadBusinessPostsForRestaurantFn
    }
  });
}

test("visible public menu ensure uses the coordinated menu focus bundle", async () => {
  const state = createPublicBusinessState();
  const bundleCalls = [];
  let resolveBundleCall = null;
  const bundleCalled = new Promise((resolve) => {
    resolveBundleCall = resolve;
  });
  const cluster = createCluster({
    state,
    loadPublicMenuBundleForRestaurantFn: async (restaurantId) => {
      bundleCalls.push(restaurantId);
      resolveBundleCall();
      state.menu = {
        ...state.menu,
        restaurantId,
        items: [{ id: "item-1", name: "Pizza" }],
        loading: false,
        source: "public",
        truthState: "seeded"
      };
      state.focus = {
        ...state.focus,
        restaurantId,
        items: [],
        loading: false,
        truthSource: "public-menu",
        truthState: "knownEmpty"
      };
    }
  });

  cluster.ensureMenuDataForProfile(state.profileView.profile);
  await bundleCalled;

  assert.deepEqual(bundleCalls, ["restaurant-a"]);
  assert.equal(state.menu.truthState, "seeded");
  assert.equal(state.focus.truthState, "knownEmpty");
});

test("public focus ensure redirects to the coordinated menu bundle", async () => {
  const state = createPublicBusinessState();
  let bundleCalls = 0;
  let separateFocusCalls = 0;
  let resolveBundleCall = null;
  const bundleCalled = new Promise((resolve) => {
    resolveBundleCall = resolve;
  });
  const cluster = createCluster({
    state,
    loadPublicMenuBundleForRestaurantFn: async () => {
      bundleCalls += 1;
      resolveBundleCall();
    },
    loadFocusForRestaurantFn: async () => {
      separateFocusCalls += 1;
    }
  });

  cluster.ensureFocusDataForProfile(state.profileView.profile);
  await bundleCalled;

  assert.equal(bundleCalls, 1);
  assert.equal(separateFocusCalls, 0);
});

test("visible posts ensure keeps existing posts when refresh fails", async () => {
  const existingPosts = [{ id: "post-1", restaurantId: "restaurant-a", url: "https://cdn.example/post-1.jpg" }];
  const state = createPublicBusinessState({
    topTab: "profile",
    contentTab: "posts",
    posts: existingPosts
  });
  let showCall = null;
  let resolvePostsCall = null;
  const postsCalled = new Promise((resolve) => {
    resolvePostsCall = resolve;
  });
  const cluster = createCluster({
    state,
    loadBusinessPostsForRestaurantFn: async () => {
      resolvePostsCall();
      return { posts: [], status: "error", restaurantId: "restaurant-a" };
    },
    showPublicProfileFn: (profile, posts, options = {}) => {
      showCall = { profile, posts, options };
      state.profileView = {
        ...state.profileView,
        profile,
        posts
      };
    }
  });

  cluster.ensurePostsDataForProfile(state.profileView.profile);
  await postsCalled;
  await Promise.resolve();

  assert.deepEqual(showCall.posts, existingPosts);
  assert.equal(showCall.profile.postsLoaded, true);
  assert.equal(showCall.profile.truthState, "stable");
  assert.deepEqual(state.profileView.posts, existingPosts);
});
