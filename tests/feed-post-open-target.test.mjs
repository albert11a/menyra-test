import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

import sq from "../shared/i18n/sq.js";
import de from "../shared/i18n/de.js";
import sr from "../shared/i18n/sr.js";

const repoRoot = path.resolve(import.meta.dirname, "..");
const socialRoot = path.join(repoRoot, "apps", "menyra-social");

function read(file) {
  return fs.readFileSync(file, "utf8");
}

// Der Ausschnitt, der das Beitragsmedium der Feed-Karte rendert.
function readFeedHeroBlock() {
  const text = read(path.join(socialRoot, "core", "feed", "feed-view-orchestration-controller.js"));
  const start = text.indexOf("const heroMediaHtml");
  assert.ok(start >= 0, "heroMediaHtml must be findable");
  return text.slice(start, start + 900);
}

// Ein Klick auf den Beitrag hat frueher den Story-Viewer aufgerufen. Dort steht
// weder der Beitrag noch seine Kommentare - bei Business-Profilen ohne Stories
// landete man auf "Nuk ka stories".
test("the feed post media opens the post modal, not the story viewer", () => {
  const block = readFeedHeroBlock();
  assert.ok(
    block.includes("data-feed-post-open-modal="),
    "the post media must carry the modal trigger"
  );
  assert.ok(
    !/<a\s+href=/.test(block),
    "the post media must not be an anchor that navigates away from the feed"
  );
  assert.ok(
    !block.includes("buildStoryViewerUrlFn"),
    "the post media must not build a story viewer url"
  );
});

// Der Klick-Handler muss den Trigger auch wirklich bedienen, sonst rendert die
// Karte einen Button, der nichts tut.
test("the feed click handler serves the post modal trigger", () => {
  const text = read(path.join(socialRoot, "core", "feed", "feed-view-orchestration-controller.js"));
  assert.ok(
    text.includes('target.closest("[data-feed-post-open-modal]")'),
    "the delegated feed click handler must react to the post modal trigger"
  );
});

// Die Story-Kreise bleiben der einzige Weg in den Viewer - der Beitrag wird
// nicht mehr vorgeladen, das spart auf 3G ein Dokument, das niemand oeffnet.
test("only the story circles warm the story viewer", () => {
  const text = read(path.join(socialRoot, "core", "feed", "feed-view-orchestration-controller.js"));
  const start = text.indexOf("const handleStoryWarmup");
  assert.ok(start >= 0, "handleStoryWarmup must be findable");
  const block = text.slice(start, text.indexOf("};", start));
  assert.ok(block.includes('closest("[data-story-item]")'), "story circles stay warmed");
  assert.ok(
    !block.includes("data-feed-post-open"),
    "the post media must not prefetch the story viewer anymore"
  );
});

// Header-Pills: Qyteti / Lokalet / Ofertat - in jeder Sprache gleich benannt,
// weil es Tab-Namen der Plattform sind und keine uebersetzten Woerter.
test("the header tabs are named Qyteti, Lokalet and Ofertat", () => {
  for (const [name, dict] of [["sq", sq], ["de", de], ["sr", sr]]) {
    assert.equal(dict["nav.feed"], "Qyteti", `${name}: feed tab label`);
    assert.equal(dict["nav.restaurants"], "Lokalet", `${name}: restaurants tab label`);
    assert.equal(dict["nav.offers"], "Ofertat", `${name}: offers tab label`);
  }
});

// Faellt das Woerterbuch aus, muessen die Pills denselben Namen zeigen.
test("the pill fallbacks match the dictionary names", () => {
  const text = read(path.join(socialRoot, "core", "app-shell", "app-shell-runtime-controller.js"));
  const start = text.indexOf("function renderMainHeaderTabs");
  assert.ok(start >= 0, "renderMainHeaderTabs must be findable");
  const block = text.slice(start, text.indexOf("function ", start + 30));
  assert.ok(block.includes('tr("nav.feed", "Qyteti")'), "feed pill fallback");
  assert.ok(block.includes('tr("nav.restaurants", "Lokalet")'), "restaurants pill fallback");
  assert.ok(block.includes('tr("nav.offers", "Ofertat")'), "offers pill fallback");
});

// Die drei Pills teilen sich die Zeile zu gleichen Teilen, Icon und Text sitzen
// auf einer Mittellinie.
test("the header pills share the row evenly", () => {
  const text = read(path.join(socialRoot, "index.html"));
  const start = text.indexOf(".smart-header-pill {");
  assert.ok(start >= 0, "the pill rule must be findable");
  const block = text.slice(start, text.indexOf("}", start));
  assert.ok(/flex:\s*1 1 0/.test(block), "pills must grow to fill the row");
  assert.ok(/justify-content:\s*center/.test(block), "pill content must be centered");
});
