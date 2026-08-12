import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const repoRoot = path.resolve(import.meta.dirname, "..");
const socialRoot = path.join(repoRoot, "apps", "menyra-social");

function read(file) {
  return fs.readFileSync(file, "utf8");
}

function readFeedController() {
  return read(path.join(socialRoot, "core", "feed", "feed-view-orchestration-controller.js"));
}

// Beitraege standen nach Entfernung sortiert. Ein Monate alter Beitrag aus dem
// Nachbarviertel verdraengte damit den von heute Morgen.
test("feed posts are ordered newest first, distance only breaks ties", () => {
  const text = readFeedController();
  const start = text.indexOf("const byNewestThenNearest");
  assert.ok(start >= 0, "the shared comparator must exist");
  const block = text.slice(start, text.indexOf("\n    };", start));
  const timeLine = block.indexOf("b.createdAtMs - a.createdAtMs");
  const distanceLine = block.indexOf("a.distanceKm - b.distanceKm");
  assert.ok(timeLine >= 0, "the comparator must weigh the timestamp");
  assert.ok(distanceLine >= 0, "the comparator must still weigh the distance");
  assert.ok(timeLine < distanceLine, "the timestamp must be decided before the distance");
});

// Storys folgen derselben Regel: Live zuerst, dann das Neueste.
test("stories are ordered newest first as well", () => {
  const text = readFeedController();
  assert.ok(
    !text.includes("compareStoryDistanceFirst"),
    "the distance-first story comparator must be gone"
  );
  const start = text.indexOf("const compareStoryNewestFirst");
  assert.ok(start >= 0, "the newest-first story comparator must exist");
  const block = text.slice(start, text.indexOf("\n  };", start));
  const timeLine = block.indexOf("b.createdAtMs - a.createdAtMs");
  const distanceLine = block.indexOf("compareDistanceValues");
  assert.ok(timeLine >= 0 && distanceLine >= 0, "both signals must still be weighed");
  assert.ok(timeLine < distanceLine, "the timestamp must be decided before the distance");
});

// Ein Beitrag darf nur einmal in der Liste stehen.
test("the scoped feed drops duplicates", () => {
  const text = readFeedController();
  const start = text.indexOf("const resolveFeedGeoScopedCollections");
  assert.ok(start >= 0, "the scoping helper must be findable");
  const block = text.slice(start, text.indexOf("\n  const compareDistanceValues", start));
  assert.ok(block.includes("const dedupeBy"), "the scoping helper must dedupe");
  assert.ok(block.includes("(post) => post?.id"), "posts are deduped by their id");
  assert.ok(
    block.includes("resolveFeedEntryRestaurantId(story)"),
    "stories are deduped by their restaurant"
  );
});

// Nachgeladene Storys duerfen nicht hinter der alten Reihenfolge landen.
test("newly loaded stories are shown before the already known ones", () => {
  const text = read(path.join(socialRoot, "core", "stories", "story-feed-runtime-controller.js"));
  assert.ok(
    !text.includes("stabilizeStoryOrder"),
    "the order that kept known stories in front must be gone"
  );
  const start = text.indexOf("function orderStoriesNewFirst");
  assert.ok(start >= 0, "the new-first order must exist");
  const block = text.slice(start, text.indexOf("\n  }", start));
  assert.ok(
    block.includes("if (aKnown !== bKnown) return aKnown ? 1 : -1;"),
    "a story that was not in the row before must sort ahead of the known ones"
  );
  assert.ok(
    block.includes("if (aKnown && bKnown) return aPrev - bPrev;"),
    "already seen stories must keep their previous order"
  );
});

// Die Stadt entscheidet hart: aus einer anderen Stadt darf nichts erscheinen.
test("the city filter stays strict once a city is known", () => {
  const text = readFeedController();
  const start = text.indexOf("const matchesFeedViewerCity");
  assert.ok(start >= 0, "the city matcher must be findable");
  const block = text.slice(start, text.indexOf("\n  const resolveFeedGeoScopedCollections", start));
  assert.ok(
    block.includes("if (containsKnownFeedCity(explicitValues)) return false;"),
    "an entry that names a different known city must be dropped"
  );
});
