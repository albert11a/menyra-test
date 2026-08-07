import assert from "node:assert/strict";
import test from "node:test";

import {
  POST_SURFACE_FEED,
  POST_SURFACE_PROFILE,
  normalizePostSurfaceCore,
  resolvePostSurfaceForComposerModeCore,
  isProfileSurfacePostCore,
  filterProfileSurfacePostsCore
} from "../apps/menyra-social/core/common/post-surface-utils.js";
import { normalizeRestaurantPostDocCore } from "../apps/menyra-social/core/feed/post-doc-normalize-utils.js";

test("composer mode decides the surface: only 'profile' stays out of the feed", () => {
  assert.equal(resolvePostSurfaceForComposerModeCore("post"), POST_SURFACE_FEED);
  assert.equal(resolvePostSurfaceForComposerModeCore("profile"), POST_SURFACE_PROFILE);
  // Unbekannt oder leer verhaelt sich wie vorher: der Beitrag geht in den Feed.
  assert.equal(resolvePostSurfaceForComposerModeCore(""), POST_SURFACE_FEED);
  assert.equal(resolvePostSurfaceForComposerModeCore("was-auch-immer"), POST_SURFACE_FEED);
});

test("surface normalization keeps only the two known values", () => {
  assert.equal(normalizePostSurfaceCore(" FEED "), POST_SURFACE_FEED);
  assert.equal(normalizePostSurfaceCore("Profile"), POST_SURFACE_PROFILE);
  assert.equal(normalizePostSurfaceCore("story"), "");
  assert.equal(normalizePostSurfaceCore(undefined), "");
});

test("profile grid shows profile posts and hides feed posts", () => {
  assert.equal(isProfileSurfacePostCore({ surface: POST_SURFACE_PROFILE }), true);
  assert.equal(isProfileSurfacePostCore({ surface: POST_SURFACE_FEED }), false);
});

test("posts without a surface are legacy posts and stay visible in the profile", () => {
  assert.equal(isProfileSurfacePostCore({}), true);
  assert.equal(isProfileSurfacePostCore({ surface: "" }), true);
});

test("the profile filter drops exactly the feed posts", () => {
  const posts = [
    { id: "a", surface: POST_SURFACE_PROFILE },
    { id: "b", surface: POST_SURFACE_FEED },
    { id: "c" },
    { id: "d", surface: POST_SURFACE_FEED }
  ];
  assert.deepEqual(filterProfileSurfacePostsCore(posts).map((post) => post.id), ["a", "c"]);
  assert.deepEqual(filterProfileSurfacePostsCore([]), []);
  assert.deepEqual(filterProfileSurfacePostsCore(null), []);
});

test("the surface survives from the stored post doc into the profile list", () => {
  const feedPost = normalizeRestaurantPostDocCore("p1", {
    surface: "feed",
    media: [{ url: "https://cdn.example/p1.jpg", type: "image" }]
  }, "restaurant-1");
  assert.equal(feedPost.surface, POST_SURFACE_FEED);
  assert.equal(isProfileSurfacePostCore(feedPost), false);

  const profilePost = normalizeRestaurantPostDocCore("p2", {
    surface: "profile",
    media: [{ url: "https://cdn.example/p2.jpg", type: "image" }]
  }, "restaurant-1");
  assert.equal(profilePost.surface, POST_SURFACE_PROFILE);
  assert.equal(isProfileSurfacePostCore(profilePost), true);

  const legacyPost = normalizeRestaurantPostDocCore("p3", {
    media: [{ url: "https://cdn.example/p3.jpg", type: "image" }]
  }, "restaurant-1");
  assert.equal(legacyPost.surface, "");
  assert.equal(isProfileSurfacePostCore(legacyPost), true);
});
