import assert from "node:assert/strict";
import test from "node:test";

import {
  buildStoryBootstrapSignatureCore,
  hasBootstrapStoryMedia,
  mergeBootstrapStoriesCore,
  normalizePublicBootstrapStories
} from "../apps/menyra-social/core/app-shell/public-bootstrap-runtime-controller.js";
import { createStorySystemController } from "../apps/menyra-social/core/stories/story-system-controller.js";

test("normalizePublicBootstrapStories keeps story media fields", () => {
  const rows = normalizePublicBootstrapStories([
    {
      restaurantId: "rest_1",
      name: "Bro Pizza",
      img: "https://cdn.example.com/logo.png",
      isLive: true,
      mediaType: "video",
      videoUrl: "https://cdn.example.com/story.mp4",
      imageUrl: "https://cdn.example.com/poster.jpg"
    }
  ]);
  assert.equal(rows.length, 1);
  assert.equal(rows[0].mediaType, "video");
  assert.equal(rows[0].videoUrl, "https://cdn.example.com/story.mp4");
  assert.equal(rows[0].imageUrl, "https://cdn.example.com/poster.jpg");
  assert.equal(hasBootstrapStoryMedia(rows[0]), true);
});

test("mergeBootstrapStoriesCore never downgrades a story that already has media", () => {
  const existing = [{
    id: "rest_1",
    restaurantId: "rest_1",
    name: "Bro Pizza",
    img: "https://cdn.example.com/logo.png",
    isLive: true,
    mediaType: "video",
    videoUrl: "https://cdn.example.com/story.mp4"
  }];
  const incoming = [{
    id: "rest_1",
    restaurantId: "rest_1",
    name: "Bro Pizza Neu",
    img: "https://cdn.example.com/logo2.png",
    isLive: false
  }];
  const merged = mergeBootstrapStoriesCore(existing, incoming);
  assert.equal(merged.length, 1);
  assert.equal(merged[0].videoUrl, "https://cdn.example.com/story.mp4");
  assert.equal(merged[0].name, "Bro Pizza Neu");
  assert.equal(merged[0].img, "https://cdn.example.com/logo2.png");
  assert.equal(merged[0].isLive, false);
});

test("mergeBootstrapStoriesCore takes incoming rows that carry media", () => {
  const existing = [{
    restaurantId: "rest_1",
    name: "Alt",
    imageUrl: "https://cdn.example.com/old.jpg"
  }];
  const incoming = [{
    restaurantId: "rest_1",
    name: "Neu",
    videoUrl: "https://cdn.example.com/new.mp4"
  }, {
    restaurantId: "rest_2",
    name: "Zweites Business"
  }];
  const merged = mergeBootstrapStoriesCore(existing, incoming);
  const first = merged.find((row) => row.restaurantId === "rest_1");
  assert.equal(first.videoUrl, "https://cdn.example.com/new.mp4");
  assert.equal(merged.some((row) => row.restaurantId === "rest_2"), true);
});

test("buildStoryBootstrapSignatureCore changes when media arrives", () => {
  const withoutMedia = buildStoryBootstrapSignatureCore([
    { restaurantId: "rest_1", name: "Bro Pizza", img: "logo.png", isLive: true }
  ]);
  const withMedia = buildStoryBootstrapSignatureCore([
    { restaurantId: "rest_1", name: "Bro Pizza", img: "logo.png", isLive: true, videoUrl: "story.mp4" }
  ]);
  assert.notEqual(withoutMedia, withMedia);
});

test("createBusinessStory persists the product snapshot for the story card", async () => {
  const writes = [];
  const controller = createStorySystemController({
    db: {},
    collectionFn: () => ({}),
    docFn: () => ({ id: "story_1" }),
    setDocFn: async (_ref, payload) => {
      writes.push(payload);
    },
    serverTimestampFn: () => "ts"
  });
  await controller.createBusinessStory({
    restaurantId: "rest_1",
    mediaUrl: "https://cdn.example.com/story.mp4",
    mediaType: "video",
    menuItemId: "item_9",
    menuItemName: "Pizza Margherita",
    menuItemPrice: 8.5,
    menuItemImage: "https://cdn.example.com/pizza.jpg"
  });
  assert.equal(writes[0].menuItemId, "item_9");
  assert.equal(writes[0].menuItemName, "Pizza Margherita");
  assert.equal(writes[0].menuItemPrice, 8.5);
  assert.equal(writes[0].menuItemImage, "https://cdn.example.com/pizza.jpg");
});
