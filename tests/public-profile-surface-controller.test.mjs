import assert from "node:assert/strict";
import test from "node:test";

import {
  resolveVisibleProfileSurface
} from "../apps/menyra-social/core/profile/public-profile-surface-controller.js";

test("route payload count zero does not confirm empty posts", () => {
  const surface = resolveVisibleProfileSurface({
    activeTab: "profile",
    profileTopTab: "profile",
    profileContentTab: "posts",
    profileView: {
      directEntry: {
        active: true,
        owner: "web-direct",
        topTab: "profile",
        contentTab: "posts",
        phase: "loading"
      },
      profile: {
        restaurantId: "restaurant-a",
        canonicalRestaurantId: "restaurant-a",
        role: "business",
        postsLoaded: false,
        truthState: "loading"
      },
      posts: [],
      routePayload: {
        owner: "web-direct",
        restaurantId: "restaurant-a",
        canonicalRestaurantId: "restaurant-a",
        posts: {
          count: 0,
          seeded: false,
          unknown: false
        },
        businessSnapshot: {
          restaurantId: "restaurant-a",
          posts: {
            count: 0,
            seeded: false,
            unknown: false
          },
          truth: {}
        },
        truth: {}
      }
    },
    menu: {
      restaurantId: "",
      source: "public",
      truthState: "unknown",
      items: [],
      loading: false
    },
    focus: {
      restaurantId: "",
      truthState: "unknown",
      items: [],
      loading: false
    }
  });

  assert.equal(surface.posts.status, "loading");
  assert.equal(surface.status, "loading");
});

test("explicit knownEmpty still confirms empty posts", () => {
  const surface = resolveVisibleProfileSurface({
    activeTab: "profile",
    profileTopTab: "profile",
    profileContentTab: "posts",
    profileView: {
      directEntry: {
        active: true,
        owner: "web-direct",
        topTab: "profile",
        contentTab: "posts",
        phase: "ready"
      },
      profile: {
        restaurantId: "restaurant-a",
        canonicalRestaurantId: "restaurant-a",
        role: "business",
        postsLoaded: false,
        truthState: "loading"
      },
      posts: [],
      routePayload: {
        owner: "web-direct",
        restaurantId: "restaurant-a",
        canonicalRestaurantId: "restaurant-a",
        posts: {
          state: "knownEmpty",
          count: 0,
          knownEmpty: true
        },
        truth: {
          posts: "knownEmpty"
        }
      }
    },
    menu: { items: [], source: "public", truthState: "unknown" },
    focus: { items: [], truthState: "unknown" }
  });

  assert.equal(surface.posts.status, "empty");
});
