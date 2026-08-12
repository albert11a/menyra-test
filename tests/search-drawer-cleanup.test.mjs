import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const repoRoot = path.resolve(import.meta.dirname, "..");
const socialRoot = path.join(repoRoot, "apps", "menyra-social");

function read(file) {
  return fs.readFileSync(file, "utf8");
}

function readSearchViewBlock() {
  const text = read(path.join(socialRoot, "core", "discovery", "discovery-runtime-controller.js"));
  const start = text.indexOf("function renderSearchView()");
  assert.ok(start >= 0, "renderSearchView must be findable");
  const end = text.indexOf("function updateSearchDom", start);
  assert.ok(end > start, "the end of renderSearchView must be findable");
  return text.slice(start, end);
}

test("the search page carries one heading and nothing above it", () => {
  const block = readSearchViewBlock();
  assert.ok(
    !block.includes('uppercase tracking-widest">Zbulo<'),
    "the Zbulo eyebrow must be gone"
  );
  assert.ok(!block.includes(">Kerkimi<"), "the old heading must be gone");
  assert.ok(block.includes(">Kërko</h2>"), "the heading must read Kerko");
});

test("the clear button sits centred in a round background", () => {
  const block = readSearchViewBlock();
  const start = block.indexOf('id="searchClearBtn"');
  assert.ok(start >= 0, "the clear button must be findable");
  const button = block.slice(start, block.indexOf("</button>", start));
  assert.ok(button.includes("rounded-full"), "the background must be round");
  assert.ok(
    button.includes("inline-flex") && button.includes("items-center") && button.includes("justify-center"),
    "the glyph must be centred in both directions"
  );
  assert.ok(button.includes("w-9") && button.includes("h-9"), "the button must stay square");
  assert.ok(button.includes("shrink-0"), "the button must not squash on narrow screens");
  assert.ok(button.includes('type="button"'), "a button inside a form area must not submit");
  assert.ok(button.includes("aria-label="), "the icon-only button needs a name");
});

test("the pills and the leftover labels under the field are gone", () => {
  const block = readSearchViewBlock();
  assert.ok(!block.includes("data-search-filter="), "the Biznes/Lokal pills must be gone");
  assert.ok(!block.includes("Prek per te kerkuar"), "the hint line must be gone");
  assert.ok(!block.includes('id="searchBizLabel"'), "the Business section heading must be gone");
  assert.ok(!block.includes('id="searchEmptyState"'), "the empty state placeholder must be gone");
});

test("the results themselves still render", () => {
  const block = readSearchViewBlock();
  assert.ok(block.includes('id="searchBizList"'), "the business result list must stay");
  assert.ok(block.includes('id="searchUsersList"'), "the user result list must stay");
  assert.ok(block.includes('id="searchInput"'), "the input must stay");
});

// Die Zwischenansicht, solange die Suche noch nachgeladen wird, muss dieselbe
// Ueberschrift tragen - sonst springt sie beim Umschalten.
test("the deferred search view matches the real one", () => {
  const text = read(path.join(socialRoot, "core", "app-shell", "feed-search-map-runtime.js"));
  const start = text.indexOf('<div id="searchView"');
  assert.ok(start >= 0, "the deferred search view must be findable");
  const block = text.slice(start, text.indexOf("</div>\n    `;", start));
  assert.ok(block.includes(">Kërko</h2>"), "the deferred heading must read Kerko too");
  assert.ok(!block.includes(">Zbulo<"), "the deferred eyebrow must be gone");
  assert.ok(!block.includes("Kerkimi po ngarkohet"), "the loading sentence must be gone");
  assert.ok(block.includes("animate-pulse"), "the deferred view must show result skeletons");
});
