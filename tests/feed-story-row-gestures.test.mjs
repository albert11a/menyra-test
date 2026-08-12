import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const repoRoot = path.resolve(import.meta.dirname, "..");
const controllerPath = path.join(
  repoRoot,
  "apps",
  "menyra-social",
  "core",
  "feed",
  "feed-view-orchestration-controller.js"
);

function readController() {
  return fs.readFileSync(controllerPath, "utf8");
}

// Mit touch-action:pan-x verwarf der Browser jede senkrechte Geste, die auf
// der Story-Reihe begann - die Seite scrollte dann nicht.
test("the story row lets a vertical drag scroll the page", () => {
  const text = readController();
  const start = text.indexOf("const buildTrackRowViewportStyle");
  assert.ok(start >= 0, "the track viewport style must be findable");
  const block = text.slice(start, text.indexOf("};", start));
  assert.ok(
    !/touch-action:\s*pan-x[;"]/.test(block),
    "pan-x alone blocks the vertical page scroll"
  );
  assert.ok(
    block.includes("touch-action:manipulation"),
    "the row must allow both directions and let the browser pick"
  );
  assert.ok(
    block.includes("overscroll-behavior-x:contain"),
    "horizontal overscroll must stay inside the row"
  );
});

// Der Kanten-Waechter darf sich nur um eindeutig waagerechte Wische kuemmern.
test("the edge swipe guard keeps its hands off vertical gestures", () => {
  const text = readController();
  const start = text.indexOf("function bindSpotStoryTrackEdgeSwipeGuard");
  assert.ok(start >= 0, "the edge swipe guard must be findable");
  const block = text.slice(start, text.indexOf("\n  }\n", start));
  assert.ok(
    block.includes("GESTURE_DIRECTION_THRESHOLD_PX"),
    "the guard must wait for a clear direction before it acts"
  );
  assert.ok(
    block.includes("if (Math.abs(dx) <= Math.abs(dy)) return;"),
    "a mostly vertical gesture must be left alone"
  );
});

// Der erste Kachel-Text der Story-Reihe stand noch auf Deutsch.
test("the story row intro card speaks albanian", () => {
  const text = readController();
  assert.ok(!text.includes("Die besten Orte erleben"), "the german line must be gone");
  assert.ok(
    text.includes("Zbulo vendet më të mira."),
    "the intro card must carry the albanian line"
  );
});
