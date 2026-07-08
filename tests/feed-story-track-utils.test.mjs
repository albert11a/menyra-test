import test from "node:test";
import assert from "node:assert/strict";

import {
  STORY_SCOPE_NEAR,
  STORY_SCOPE_UNKNOWN,
  STORY_SCOPE_FOREIGN,
  classifyStoryGeoScope,
  shouldKeepStoryInScope,
  storyScopeOrderRank,
  compareStoryTrackMeta,
  buildStoryFirstTrackItems,
  resolveStoryPreviewMedia,
  storyHasRenderableMedia,
  isLikelyVideoMediaUrl
} from "../apps/menyra-social/core/feed/feed-story-track-utils.js";

test("classifyStoryGeoScope: no viewer city => near", () => {
  assert.equal(classifyStoryGeoScope({ hasViewerCity: false }), STORY_SCOPE_NEAR);
});

test("classifyStoryGeoScope: city match => near", () => {
  assert.equal(
    classifyStoryGeoScope({ hasViewerCity: true, cityMatchesViewer: true }),
    STORY_SCOPE_NEAR
  );
});

test("classifyStoryGeoScope: missing city data => unknown (kept)", () => {
  const scope = classifyStoryGeoScope({
    hasViewerCity: true,
    cityMatchesViewer: false,
    businessHasKnownForeignCity: false
  });
  assert.equal(scope, STORY_SCOPE_UNKNOWN);
  assert.equal(shouldKeepStoryInScope(scope), true);
});

test("classifyStoryGeoScope: confirmed foreign city => foreign (dropped)", () => {
  const scope = classifyStoryGeoScope({
    hasViewerCity: true,
    cityMatchesViewer: false,
    businessHasKnownForeignCity: true
  });
  assert.equal(scope, STORY_SCOPE_FOREIGN);
  assert.equal(shouldKeepStoryInScope(scope), false);
});

test("a real story with missing location is never dropped", () => {
  // Betrachter hat Stadt, Business hat KEINE erkennbare Stadt -> bleibt.
  const scope = classifyStoryGeoScope({ hasViewerCity: true, cityMatchesViewer: false });
  assert.equal(shouldKeepStoryInScope(scope), true);
});

test("scope order rank: near < unknown < foreign", () => {
  assert.ok(storyScopeOrderRank(STORY_SCOPE_NEAR) < storyScopeOrderRank(STORY_SCOPE_UNKNOWN));
  assert.ok(storyScopeOrderRank(STORY_SCOPE_UNKNOWN) < storyScopeOrderRank(STORY_SCOPE_FOREIGN));
});

test("compareStoryTrackMeta orders near, then unknown, then by distance and recency", () => {
  const near = { scope: STORY_SCOPE_NEAR, distanceKm: 5, createdAtMs: 100 };
  const unknown = { scope: STORY_SCOPE_UNKNOWN, distanceKm: Number.POSITIVE_INFINITY, createdAtMs: 200 };
  const nearFar = { scope: STORY_SCOPE_NEAR, distanceKm: 40, createdAtMs: 300 };
  const ordered = [unknown, nearFar, near].sort(compareStoryTrackMeta);
  assert.deepEqual(ordered, [near, nearFar, unknown]);
});

test("compareStoryTrackMeta: same scope+distance => newer first", () => {
  const older = { scope: STORY_SCOPE_NEAR, distanceKm: 5, createdAtMs: 100 };
  const newer = { scope: STORY_SCOPE_NEAR, distanceKm: 5, createdAtMs: 900 };
  assert.deepEqual([older, newer].sort(compareStoryTrackMeta), [newer, older]);
});

test("buildStoryFirstTrackItems: all stories before spots", () => {
  const items = buildStoryFirstTrackItems({
    stories: [{ id: "s1" }, { id: "s2" }],
    spots: [{ id: "p1" }]
  });
  assert.deepEqual(items.map((i) => i.type), ["story", "story", "spot"]);
  assert.equal(items[0].story.id, "s1");
  assert.equal(items[2].spot.id, "p1");
});

test("buildStoryFirstTrackItems: handles empty inputs", () => {
  assert.deepEqual(buildStoryFirstTrackItems({}), []);
  assert.deepEqual(
    buildStoryFirstTrackItems({ spots: [{ id: "p1" }] }).map((i) => i.type),
    ["spot"]
  );
});

test("resolveStoryPreviewMedia: mediaUrl image works without mediaType", () => {
  // Genau der Live-Bug: Bild liegt in mediaUrl, mediaType fehlt.
  const preview = resolveStoryPreviewMedia({ mediaUrl: "https://cdn.example.com/story.jpg" });
  assert.equal(preview.kind, "image");
  assert.equal(preview.src, "https://cdn.example.com/story.jpg");
  assert.equal(storyHasRenderableMedia({ mediaUrl: "https://cdn.example.com/story.jpg" }), true);
});

test("resolveStoryPreviewMedia: imageUrl preferred", () => {
  const preview = resolveStoryPreviewMedia({
    imageUrl: "https://cdn.example.com/a.jpg",
    mediaUrl: "https://cdn.example.com/b.jpg"
  });
  assert.equal(preview.kind, "image");
  assert.equal(preview.src, "https://cdn.example.com/a.jpg");
});

test("resolveStoryPreviewMedia: reads media[0].url array shape", () => {
  const preview = resolveStoryPreviewMedia({ media: [{ url: "https://cdn.example.com/m.jpg" }] });
  assert.equal(preview.kind, "image");
  assert.equal(preview.src, "https://cdn.example.com/m.jpg");
});

test("resolveStoryPreviewMedia: video via videoUrl and via extension", () => {
  assert.equal(resolveStoryPreviewMedia({ videoUrl: "https://cdn.example.com/v.mp4" }).kind, "video");
  const inferred = resolveStoryPreviewMedia({ mediaUrl: "https://cdn.example.com/v.mp4" });
  assert.equal(inferred.kind, "video");
  assert.equal(inferred.src, "https://cdn.example.com/v.mp4");
});

test("resolveStoryPreviewMedia: logo/cover/title image is NOT story media", () => {
  // Nur img (=Logo) / image / coverImage -> keine echte Story -> none.
  const preview = resolveStoryPreviewMedia({
    img: "https://cdn.example.com/logo.png",
    image: "https://cdn.example.com/cover.jpg",
    coverImage: "https://cdn.example.com/title.jpg"
  });
  assert.equal(preview.kind, "none");
  assert.equal(storyHasRenderableMedia({ img: "https://cdn.example.com/logo.png" }), false);
});

test("isLikelyVideoMediaUrl detects video extensions", () => {
  assert.equal(isLikelyVideoMediaUrl("https://x/y.mp4"), true);
  assert.equal(isLikelyVideoMediaUrl("https://x/y.m3u8?t=1"), true);
  assert.equal(isLikelyVideoMediaUrl("https://x/y.jpg"), false);
  assert.equal(isLikelyVideoMediaUrl(""), false);
});
