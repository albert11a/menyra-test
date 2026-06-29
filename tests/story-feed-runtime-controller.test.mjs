import assert from "node:assert/strict";
import test from "node:test";

import { createStoryFeedRuntimeController } from "../apps/menyra-social/core/stories/story-feed-runtime-controller.js";

function createController(overrides = {}) {
  const state = overrides.state || {
    user: null,
    activeTab: "feed",
    feedPosts: [],
    stories: []
  };
  return createStoryFeedRuntimeController({
    state,
    db: {},
    readCacheFn: () => null,
    writeCacheFn: overrides.writeCacheFn || (() => {}),
    cacheKeys: { stories: "stories" },
    cacheTtlMs: { stories: 0 },
    fastMode: true,
    allowFeedDerivedStoryFallback: true,
    fastLimits: {
      stories: 10,
      storiesFallback: 10,
      storyIdentityHydration: 5
    },
    collectionGroupFn: overrides.collectionGroupFn || (() => ({ path: "stories" })),
    getDocsFn: overrides.getDocsFn || (async () => ({ forEach: () => {} })),
    queryFn: (ref, ...constraints) => ({ ref, constraints }),
    whereFn: (field, op, value) => ({ type: "where", field, op, value }),
    orderByFn: (field, direction) => ({ type: "orderBy", field, direction }),
    limitFn: (value) => ({ type: "limit", value }),
    mapStorySnapshotRowsToFeedStoriesFn: () => [],
    canShowFeedRestaurantIdFn: () => true,
    updateFeedDomFn: overrides.updateFeedDomFn || (() => false),
    renderFn: overrides.renderFn || (() => {}),
    getLastRenderModeFn: overrides.getLastRenderModeFn || (() => "main")
  });
}

test("guest story load uses feed fallback without collection group read", async () => {
  const state = {
    user: null,
    activeTab: "feed",
    feedPosts: [{
      id: "post-1",
      restaurantId: "restaurant-a",
      business: "Cafe A",
      logo: "https://cdn.example/logo-a.png",
      image: "https://cdn.example/story-a.jpg"
    }],
    stories: []
  };
  let collectionGroupCalls = 0;
  let getDocsCalls = 0;
  let updateFeedCalls = 0;
  const writes = [];
  const controller = createController({
    state,
    collectionGroupFn: () => {
      collectionGroupCalls += 1;
      throw new Error("collection group should not be called for guest fallback");
    },
    getDocsFn: async () => {
      getDocsCalls += 1;
      throw new Error("getDocs should not be called for guest fallback");
    },
    writeCacheFn: (key, value) => writes.push({ key, value }),
    updateFeedDomFn: () => {
      updateFeedCalls += 1;
      return true;
    }
  });

  const result = await controller.loadStoriesForFeed({ force: true, refreshUi: true });

  assert.equal(result, true);
  assert.equal(collectionGroupCalls, 0);
  assert.equal(getDocsCalls, 0);
  assert.equal(updateFeedCalls, 1);
  assert.equal(state.stories.length, 1);
  assert.equal(state.stories[0].restaurantId, "restaurant-a");
  assert.equal(state.stories[0].truthSource, "feed-fallback");
  assert.equal(writes.length, 1);
});

test("signed-in story load keeps canonical collection group path", async () => {
  const state = {
    user: { uid: "user-1" },
    activeTab: "feed",
    feedPosts: [{
      id: "post-1",
      restaurantId: "restaurant-a",
      image: "https://cdn.example/story-a.jpg"
    }],
    stories: []
  };
  let collectionGroupCalls = 0;
  let getDocsCalls = 0;
  const controller = createController({
    state,
    collectionGroupFn: (_db, name) => {
      collectionGroupCalls += 1;
      return { collectionGroup: name };
    },
    getDocsFn: async () => {
      getDocsCalls += 1;
      return { forEach: () => {} };
    }
  });

  const result = await controller.loadStoriesForFeed({ force: true, refreshUi: false });

  assert.equal(result, false);
  assert.equal(collectionGroupCalls, 1);
  assert.equal(getDocsCalls, 1);
  assert.equal(state.stories.length, 0);
});
