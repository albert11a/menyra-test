import test from "node:test";
import assert from "node:assert/strict";

import {
  createProfileBusinessMenuRuntimeBoundary
} from "../apps/menyra-social/core/app-shell/profile-business-menu-runtime-boundary.js";

test("profile business menu runtime boundary renders fallback and loads lazily", async () => {
  const calls = [];
  const boundary = createProfileBusinessMenuRuntimeBoundary({
    profileMenuDeps: {
      requestRenderFn: () => calls.push(["request-render"])
    },
    importModuleFn: async (url) => {
      calls.push(["import", url]);
      return {
        createProfileBusinessMenuRuntimeCluster: () => {
          calls.push(["create"]);
          return {
            renderPublicProfileView: () => "public-profile",
            renderMenuAdminView: () => "menu-admin",
            renderProfileView: () => "profile"
          };
        }
      };
    }
  });

  assert.equal(boundary.renderPublicProfileView(), "");
  await boundary.ensureLoaded();

  assert.equal(boundary.renderPublicProfileView(), "public-profile");
  assert.equal(boundary.renderMenuAdminView(), "menu-admin");
  assert.equal(boundary.renderProfileView(), "profile");
  assert.deepEqual(calls, [
    ["import", "./profile-business-menu-runtime-cluster.js"],
    ["create"],
    ["request-render"]
  ]);
});

test("profile business menu runtime boundary dedupes in-flight imports", async () => {
  let importCount = 0;
  let resolveModule;
  const modulePromise = new Promise((resolve) => {
    resolveModule = resolve;
  });
  const boundary = createProfileBusinessMenuRuntimeBoundary({
    importModuleFn: () => {
      importCount += 1;
      return modulePromise;
    }
  });

  const first = boundary.ensureLoaded();
  const second = boundary.loadBusinessAccounts();
  boundary.renderBusinessAccountsView();

  resolveModule({
    createProfileBusinessMenuRuntimeCluster: () => ({
      loadBusinessAccounts: async () => ["account-1"],
      renderBusinessAccountsView: () => "business-accounts"
    })
  });

  assert.deepEqual(await second, ["account-1"]);
  await first;
  assert.equal(importCount, 1);
  assert.equal(boundary.renderBusinessAccountsView(), "business-accounts");
});

test("profile business menu runtime boundary replays sync menu actions after load", async () => {
  const calls = [];
  let resolveModule;
  const modulePromise = new Promise((resolve) => {
    resolveModule = resolve;
  });
  const boundary = createProfileBusinessMenuRuntimeBoundary({
    importModuleFn: () => modulePromise
  });

  boundary.ensureMenuDataForProfile({ restaurantId: "r1" });
  boundary.ensureFocusDataForProfile({ restaurantId: "r1" });
  boundary.preloadProfileMenuFocusRender();
  assert.deepEqual(calls, []);

  resolveModule({
    createProfileBusinessMenuRuntimeCluster: () => ({
      ensureMenuDataForProfile: (profile) => calls.push(["menu", profile.restaurantId]),
      ensureFocusDataForProfile: (profile) => calls.push(["focus", profile.restaurantId]),
      preloadProfileMenuFocusRender: () => calls.push(["preload-render"])
    })
  });

  await boundary.ensureLoaded();
  assert.deepEqual(calls, [
    ["menu", "r1"],
    ["focus", "r1"],
    ["preload-render"]
  ]);
});

test("profile business menu runtime boundary warms visible public profile after lazy load", async () => {
  const calls = [];
  const state = {
    activeTab: "profile",
    profileTopTab: "profile",
    profileContentTab: "posts",
    profileView: {
      profile: {
        restaurantId: "restaurant-a",
        canonicalRestaurantId: "restaurant-a"
      },
      posts: [],
      menuAccessSource: "",
      tableNumber: 0,
      directEntry: {
        active: true,
        topTab: "profile",
        contentTab: "posts",
        postsFirst: true
      }
    }
  };
  const boundary = createProfileBusinessMenuRuntimeBoundary({
    state,
    importModuleFn: async () => ({
      createProfileBusinessMenuRuntimeCluster: () => ({
        preloadProfileMenuFocusRender: () => calls.push(["preload-render"]),
        ensurePostsDataForProfile: (profile) => calls.push(["posts", profile.restaurantId]),
        ensureMenuDataForProfile: (profile) => calls.push(["menu", profile.restaurantId]),
        renderPublicProfileView: () => "public-profile"
      })
    })
  });

  await boundary.ensureLoaded();

  assert.deepEqual(calls, [
    ["preload-render"],
    ["posts", "restaurant-a"]
  ]);

  assert.equal(boundary.renderPublicProfileView(), "public-profile");
  assert.deepEqual(calls, [
    ["preload-render"],
    ["posts", "restaurant-a"]
  ]);
});

test("profile business menu runtime boundary warms menu directly for qr public profile", async () => {
  const calls = [];
  const state = {
    activeTab: "profile",
    profileTopTab: "menu",
    profileContentTab: "menu",
    profileView: {
      profile: {
        restaurantId: "restaurant-a",
        canonicalRestaurantId: "restaurant-a"
      },
      posts: [],
      menuAccessSource: "qr",
      tableNumber: 7,
      directEntry: {
        active: true,
        topTab: "menu",
        contentTab: "menu",
        menuFirst: true,
        menuAccessSource: "qr",
        tableNumber: 7
      }
    }
  };
  const boundary = createProfileBusinessMenuRuntimeBoundary({
    state,
    importModuleFn: async () => ({
      createProfileBusinessMenuRuntimeCluster: () => ({
        preloadProfileMenuFocusRender: () => calls.push(["preload-render"]),
        ensurePostsDataForProfile: (profile) => calls.push(["posts", profile.restaurantId]),
        ensureMenuDataForProfile: (profile) => calls.push(["menu", profile.restaurantId])
      })
    })
  });

  await boundary.ensureLoaded();

  assert.deepEqual(calls, [
    ["preload-render"],
    ["posts", "restaurant-a"],
    ["menu", "restaurant-a"]
  ]);
});
