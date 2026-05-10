import assert from "node:assert/strict";
import test from "node:test";

import {
  normalizeRestaurantPostDocCore,
  normalizeUserPostDocCore
} from "../apps/menyra-social/core/feed/post-doc-normalize-utils.js";

test("user profile post normalization accepts legacy media fields", () => {
  assert.equal(
    normalizeUserPostDocCore("u1", { mediaUrl: "https://cdn.example/u1.jpg" }, "user-1").url,
    "https://cdn.example/u1.jpg"
  );
  assert.equal(
    normalizeUserPostDocCore("u2", { imageUrl: "https://cdn.example/u2.jpg" }, "user-1").url,
    "https://cdn.example/u2.jpg"
  );
});

test("restaurant profile post normalization accepts media arrays and video type", () => {
  const post = normalizeRestaurantPostDocCore("r1", {
    media: [{ url: "https://cdn.example/r1.mp4", type: "video" }]
  }, "restaurant-1");

  assert.equal(post.url, "https://cdn.example/r1.mp4");
  assert.equal(post.isVideo, true);
  assert.equal(post.restaurantId, "restaurant-1");
});
