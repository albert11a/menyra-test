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
  buildStoryFirstTrackItems
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
