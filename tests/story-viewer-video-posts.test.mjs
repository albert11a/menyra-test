import assert from "node:assert/strict";
import test from "node:test";

import {
  mapVideoPostDocCore,
  mergeStoriesWithVideoPostsCore
} from "../apps/menyra-social/core/stories/story-viewer-runtime-controller.js";
import { createStorySystemController } from "../apps/menyra-social/core/stories/story-system-controller.js";

function createFakePostDoc(id, data) {
  return {
    id,
    data: () => data
  };
}

test("mapVideoPostDocCore maps an active business video post to a reel entry", () => {
  const entry = mapVideoPostDocCore(createFakePostDoc("post_1", {
    caption: "Neues Video",
    status: "active",
    media: [{ url: "https://cdn.example.com/clip.mp4", type: "video", thumbUrl: "https://cdn.example.com/thumb.jpg" }],
    createdAtClient: "2026-07-01T10:00:00.000Z"
  }), "rest_1");
  assert.equal(entry.id, "post_1");
  assert.equal(entry.restaurantId, "rest_1");
  assert.equal(entry.mediaType, "video");
  assert.equal(entry.videoUrl, "https://cdn.example.com/clip.mp4");
  assert.equal(entry.imageUrl, "https://cdn.example.com/thumb.jpg");
  assert.equal(entry.description, "Neues Video");
  assert.equal(entry.source, "post");
});

test("mapVideoPostDocCore skips image posts and inactive posts", () => {
  assert.equal(mapVideoPostDocCore(createFakePostDoc("p1", {
    status: "active",
    media: [{ url: "https://cdn.example.com/pic.jpg", type: "image" }]
  }), "rest_1"), null);
  assert.equal(mapVideoPostDocCore(createFakePostDoc("p2", {
    status: "deleted",
    media: [{ url: "https://cdn.example.com/clip.mp4", type: "video" }]
  }), "rest_1"), null);
  assert.equal(mapVideoPostDocCore(createFakePostDoc("p3", { status: "active" }), "rest_1"), null);
});

test("mapVideoPostDocCore infers video from media url without explicit type", () => {
  const entry = mapVideoPostDocCore(createFakePostDoc("p4", {
    mediaUrl: "https://cdn.example.com/clip.webm"
  }), "rest_1");
  assert.equal(entry.mediaType, "video");
  assert.equal(entry.videoUrl, "https://cdn.example.com/clip.webm");
});

test("mergeStoriesWithVideoPostsCore appends posts after stories and dedupes", () => {
  const stories = [
    { id: "s1", videoUrl: "https://cdn.example.com/a.mp4" },
    { id: "s2", imageUrl: "https://cdn.example.com/b.jpg" }
  ];
  const posts = [
    { id: "p1", videoUrl: "https://cdn.example.com/a.mp4" },
    { id: "s2", videoUrl: "https://cdn.example.com/x.mp4" },
    { id: "p2", videoUrl: "https://cdn.example.com/c.mp4" },
    { id: "p3", videoUrl: "https://cdn.example.com/c.mp4" }
  ];
  const merged = mergeStoriesWithVideoPostsCore(stories, posts);
  assert.deepEqual(merged.map((row) => row.id), ["s1", "s2", "p2"]);
});

test("mergeStoriesWithVideoPostsCore works without stories", () => {
  const merged = mergeStoriesWithVideoPostsCore([], [
    { id: "p1", videoUrl: "https://cdn.example.com/a.mp4" }
  ]);
  assert.equal(merged.length, 1);
  assert.equal(merged[0].id, "p1");
});

test("buildStoryViewerUrl carries the clicked post id into the viewer", () => {
  const controller = createStorySystemController({
    buildUrlFn: (path, params = {}) => {
      const query = Object.entries(params)
        .map(([key, value]) => `${key}=${encodeURIComponent(String(value))}`)
        .join("&");
      return query ? `/${path}?${query}` : `/${path}`;
    }
  });
  assert.equal(
    controller.buildStoryViewerUrl("rest_1"),
    "/apps/menyra-social/story/index.html?r=rest_1"
  );
  assert.equal(
    controller.buildStoryViewerUrl("rest_1", { postId: "post_9" }),
    "/apps/menyra-social/story/index.html?r=rest_1&post=post_9"
  );
  assert.equal(
    controller.buildStoryViewerUrl("rest_1", { postId: "" }),
    "/apps/menyra-social/story/index.html?r=rest_1"
  );
});
