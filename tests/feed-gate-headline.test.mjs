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

// Die Ueberschrift im Standort-Bereich: oben das wechselnde Wort, darunter die
// feste Zeile. Kein festes Vorwort mehr davor.
test("the feed gate headline rotates three words above one fixed line", () => {
  const text = readController();
  ["OFERTAT.", "LOKALET.", "EVENTET."].forEach((word) => {
    assert.ok(text.includes(`        "${word}"`), `the rotating word list must contain ${word}`);
  });
  assert.ok(
    text.includes('topTailLine: "N’QYTET TENDIN."'),
    "the albanian gate copy must close with the fixed city line"
  );
  assert.ok(!text.includes("topLeadWord"), "the fixed lead word must be gone");
  assert.ok(
    !text.includes("topSliderItems") && !text.includes("topCityLine"),
    "the old full-sentence slider copy must be gone"
  );
});

// Der Punkt gehoert zum Wort - ohne ihn haetten die Zeilen ein anderes Mass.
test("every rotating word carries its full stop", () => {
  const text = readController();
  const start = text.indexOf("topRotatingWords: Object.freeze([");
  assert.ok(start >= 0, "the albanian word list must be findable");
  const block = text.slice(start, text.indexOf("]),", start));
  const words = [...block.matchAll(/"([^"]+)"/g)].map((m) => m[1]);
  assert.equal(words.length, 3, "there must be exactly three words");
  words.forEach((word) => {
    assert.ok(word.endsWith("."), `${word} must end with a full stop`);
  });
});

// Alle Woerter liegen in derselben Grid-Zelle. Da sie nach dem Anpassen exakt
// gleich breit sind, kann die Zeile beim Wechsel nicht springen.
test("the rotating words are stacked in one grid cell", () => {
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
  assert.ok(
    !text.includes("feedGateRotatorWidth"),
    "the width animation is obsolete once every word has the same width"
  );
});

// Beide Zeilen sollen exakt gleich breit sein. Erreicht wird das ueber die
// Schriftgroesse - nicht ueber Dehnen, das wuerde die Buchstaben verzerren.
test("each word is grown to the width of the fixed line", () => {
  const text = readController();
  const start = text.indexOf("const syncFeedGateHeadlineRotatorDom");
  assert.ok(start >= 0, "the sizing helper must exist");
  const block = text.slice(start, text.indexOf("\n  // Die erste Messung", start));

  assert.ok(block.includes("data-feed-gate-title-tail"), "the fixed line is the measuring stick");
  assert.ok(block.includes("const fitFontSize"), "there must be a fitting step");
  assert.ok(block.includes("item.style.fontSize"), "the fit must land on the font size");
  // Der Messzwilling darf die Laufweite der Zeile uebernehmen - das Wort
  // selbst darf sie nicht bekommen, sonst waere es gesperrt statt vergroessert.
  assert.ok(!block.includes("scaleX"), "the letters must not be stretched to hit the width");
  assert.ok(
    !block.includes("item.style.letterSpacing"),
    "the letters must not be re-tracked to hit the width"
  );
  assert.ok(
    block.includes("ruler.style.letterSpacing = tailStyle.letterSpacing"),
    "the measuring twin must carry the same tracking as the real line"
  );
  // Die Laufweite steht in px und waechst nicht mit der Schrift mit - ein
  // einzelner Dreisatz trifft die Breite deshalb nicht.
  assert.ok(
    /for \(let round = 0; round < 3; round \+= 1\)/.test(block),
    "the fit must re-measure instead of trusting one proportion"
  );
  assert.ok(
    block.includes("Math.abs(width - targetWidth) < 0.25"),
    "the fit must stop once it is within half a pixel"
  );
});

// Ohne Messung darf nichts kaputt sein: die Woerter stehen dann in ihrer
// natuerlichen Groesse, die untereinander ohnehin fast gleich ist.
test("the headline survives a missing measurement", () => {
  const text = readController();
  const start = text.indexOf("const syncFeedGateHeadlineRotatorDom");
  const block = text.slice(start, text.indexOf("\n  // Die erste Messung", start));
  assert.ok(
    block.includes("if (targetWidth <= 0 || naturalWidths.some((width) => width <= 0))")
    || block.includes("targetWidth > 0 && !naturalWidths.some((width) => width <= 0)"),
    "a zero measurement must leave the natural size alone"
  );
  assert.ok(block.includes("ruler.remove()"), "the measuring twin must not stay in the page");
  const cssStart = text.indexOf(".loc-title-rotator {");
  const cssRule = text.slice(cssStart, text.indexOf("}", cssStart));
  assert.ok(
    cssRule.includes("var(--feed-gate-rotator-height, 1.25em)"),
    "the rotator needs a height even before the first measurement"
  );
});

test("the gate markup renders the rotator above the fixed tail", () => {
  const text = readController();
  const start = text.indexOf('<div class="loc-title">');
  assert.ok(start >= 0, "the gate title markup must be findable");
  const block = text.slice(start, start + 900);
  assert.ok(block.includes("loc-title-rotator__item"), "the rotating words need their own nodes");
  assert.ok(block.includes("data-feed-gate-title-tail"), "the fixed line needs a hook for measuring");
  assert.ok(!block.includes("loc-title-lead"), "the lead word wrapper must be gone");
  assert.ok(
    block.indexOf("loc-title-rotator") < block.indexOf("loc-title-tail"),
    "the rotating word stands above the fixed line"
  );
});

// Ueber dem Feed steht der Name der Stadt, nicht mehr "Qa ka t're?".
test("the feed headline shows the city name and the fixed subtitle", () => {
  const text = readController();
  assert.ok(!text.includes("Qa ka t're"), "the old headline must be gone");
  assert.ok(
    text.includes("const resolveFeedHeadlineCityName"),
    "the city name resolver must exist"
  );
  assert.ok(
    text.includes("resolveFeedHeadlineCityName())}</h1>"),
    "the headline must render the resolved city name"
  );
  assert.ok(
    text.includes('escapeHtmlFn("Bëhu një me qytetin tënd.")'),
    "the subtitle must read Behu nje me qytetin tend."
  );
  assert.ok(
    text.includes("data-feed-city-headline"),
    "the headline needs a hook so a city change can patch it in place"
  );
});
