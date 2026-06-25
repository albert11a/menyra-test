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
