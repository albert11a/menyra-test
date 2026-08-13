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

// Die Masse stehen inline, nicht als Klassen: das ausgelieferte Tailwind-CSS
// ist fest vorgeneriert und kennt weder shrink-0 noch pl-5. Eine Klasse, die
// dort fehlt, tut lautlos nichts - genau daran verlor das Feld schon einmal
// sein Innenmass nach links.
test("the clear button sits centred in a round background", () => {
  const block = readSearchViewBlock();
  const start = block.indexOf('id="searchClearBtn"');
  assert.ok(start >= 0, "the clear button must be findable");
  const button = block.slice(start, block.indexOf("</button>", start));
  const style = button.match(/style="([^"]*)"/)?.[1] || "";
  assert.match(style, /border-radius:\s*9999px/, "the background must be round");
  assert.match(style, /display:\s*inline-flex/, "the glyph must be centred by flex");
  assert.match(style, /align-items:\s*center/, "the glyph must be centred vertically");
  assert.match(style, /justify-content:\s*center/, "the glyph must be centred horizontally");
  assert.match(style, /width:\s*2\.25rem/, "the button must keep its width");
  assert.match(style, /height:\s*2\.25rem/, "the button must stay square");
  assert.match(style, /flex:\s*0 0 auto/, "the button must not squash on narrow screens");
  assert.ok(button.includes('type="button"'), "a button inside a form area must not submit");
  assert.ok(button.includes("aria-label="), "the icon-only button needs a name");
});

// Das Feld braucht Innenmass links UND rechts - rechts genug fuer den Knopf.
test("the search field keeps room on both sides", () => {
  const block = readSearchViewBlock();
  const start = block.indexOf('id="searchInput"');
  assert.ok(start >= 0, "the search input must be findable");
  const input = block.slice(start, block.indexOf("/>", start));
  const style = input.match(/style="([^"]*)"/)?.[1] || "";
  assert.match(style, /padding-left:\s*1\.25rem/, "the text must not sit flush against the edge");
  assert.match(style, /padding-right:\s*3\.5rem/, "the text must not run under the clear button");
  assert.ok(
    !/\bpl-5\b|\bpr-16\b/.test(input),
    "pl-5 and pr-16 do not exist in the shipped css and would do nothing"
  );
});

test("the placeholder asks for a venue", () => {
  const block = readSearchViewBlock();
  assert.ok(block.includes('placeholder="Kerko lokal..."'), "the placeholder must read Kerko lokal...");
  assert.ok(
    !block.includes("Kerko perdorues, emer ose lokal"),
    "the old three-way placeholder must be gone"
  );
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
  assert.ok(block.includes('placeholder="Kerko lokal..."'), "the deferred placeholder must match too");
  assert.ok(
    !/\bpl-5\b|\bpr-16\b|\bw-2\/5\b|\bh-3\.5\b/.test(block),
    "the deferred view must not lean on classes the shipped css lacks"
  );
});
