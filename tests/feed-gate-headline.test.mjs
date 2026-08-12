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

// Die Ueberschrift im Standort-Bereich haelt "Gjej" und "rreth qytetit tend."
// fest; nur die drei Begriffe dazwischen wechseln.
test("the feed gate headline keeps a fixed lead word and a fixed tail line", () => {
  const text = readController();
  assert.ok(text.includes('topLeadWord: "Gjej"'), "the albanian gate copy must lead with Gjej");
  assert.ok(
    text.includes('topTailLine: "rreth qytetit tënd."'),
    "the albanian gate copy must close with the fixed city line"
  );
  ["restorantet", "ofertat", "eventet"].forEach((word) => {
    assert.ok(
      text.includes(`        "${word}"`),
      `the rotating word list must contain ${word}`
    );
  });
  assert.ok(
    !text.includes("topSliderItems") && !text.includes("topCityLine"),
    "the old full-sentence slider copy must be gone"
  );
});

// Der Wechsler darf die Zeile nicht springen lassen: alle Woerter liegen in
// derselben Grid-Zelle, die Spalte ist damit immer so breit wie das laengste.
test("the rotating word stack reserves one constant width", () => {
  const text = readController();
  const start = text.indexOf(".loc-title-rotator {");
  assert.ok(start >= 0, "the rotator rule must exist");
  const rule = text.slice(start, text.indexOf("}", start));
  assert.ok(rule.includes("inline-grid"), "the rotator must stack its words in a grid cell");
  assert.ok(rule.includes("overflow: hidden"), "the rotator must clip the sliding words");

  const itemStart = text.indexOf(".loc-title-rotator__item {");
  assert.ok(itemStart >= 0, "the rotator item rule must exist");
  const itemRule = text.slice(itemStart, text.indexOf("}", itemStart));
  assert.ok(
    itemRule.includes("grid-column: 1") && itemRule.includes("grid-row: 1"),
    "every rotating word must sit in the same grid cell"
  );
  assert.ok(
    !itemRule.includes("position: absolute"),
    "absolute words would collapse the reserved width again"
  );
});

// Markup: feste Woerter stehen ausserhalb des Wechslers.
test("the gate markup renders the lead word outside the rotator", () => {
  const text = readController();
  const start = text.indexOf('<div class="loc-title">');
  assert.ok(start >= 0, "the gate title markup must be findable");
  const block = text.slice(start, start + 1200);
  assert.ok(block.includes("loc-title-lead__word"), "the fixed lead word needs its own node");
  assert.ok(block.includes("loc-title-rotator__item"), "the rotating words need their own nodes");
  assert.ok(block.includes("loc-title-tail"), "the fixed tail line needs its own node");
});
