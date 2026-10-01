import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import vm from "node:vm";

const source = readFileSync("apps/lifeskin-landing/approved.js", "utf8");
const html = readFileSync("apps/lifeskin-landing/index.html", "utf8");

function setup() {
  const pending = [];
  const node = (dataset) => ({ dataset, attributes: {}, addEventListener(event, fn) { this[event] = fn; }, setAttribute(key, value) { this.attributes[key] = value; } });
  const buttons = [node({ case: "one" }), node({ case: "two" })];
  const problems = [node({ problem: "Puçrra" }), node({ problem: "Njolla" })];
  const before = { src: "original-before" };
  const after = { src: "original-after" };
  const note = {};
  const root = {
    querySelector: (id) => ({ "#lf-before": before, "#lf-after": after, "#lf-problem-text": note })[id],
    querySelectorAll: (selector) => selector === "[data-case]" ? buttons : problems
  };
  class Image { set src(src) { this.path = src; pending.push(this); } }
  vm.runInNewContext(source, { document: { getElementById: () => root }, Image });
  return { pending, buttons, problems, before, after, note };
}

test("case switching keeps both old photos until the complete next pair loads", async () => {
  const state = setup();
  const switching = state.buttons[0].click();
  state.pending[0].onload();
  await Promise.resolve();
  assert.equal(state.before.src, "original-before");
  assert.equal(state.after.src, "original-after");
  state.pending[1].onload();
  await switching;
  assert.equal(state.before.src, "/apps/lifeskin/fall-vorher.jpg");
  assert.equal(state.after.src, "/apps/lifeskin/fall-nachher.jpg");
  assert.equal(state.buttons[0].attributes["aria-pressed"], "true");
  assert.equal(state.buttons[1].attributes["aria-pressed"], "false");
});

test("a slow earlier tap cannot overwrite the most recent case choice", async () => {
  const state = setup();
  const first = state.buttons[0].click();
  const second = state.buttons[1].click();
  state.pending[2].onload();
  state.pending[3].onload();
  await second;
  state.pending[0].onload();
  state.pending[1].onload();
  await first;
  assert.equal(state.before.src, "/apps/lifeskin-landing/fotot/rasti-2-dita1.webp");
  assert.equal(state.buttons[1].attributes["aria-pressed"], "true");
});

test("a failed photo keeps the current comparison and can be retried", async () => {
  const state = setup();
  const failed = state.buttons[1].click();
  state.pending[2].onerror();
  await failed;
  assert.equal(state.before.src, "original-before");
  const retry = state.buttons[1].click();
  state.pending[4].onload();
  state.pending[5].onload();
  await retry;
  assert.equal(state.after.src, "/apps/lifeskin-landing/fotot/rasti-2-dita28.webp");
});

test("concern selection updates its accessible state and explanatory text", () => {
  const state = setup();
  state.problems[1].click();
  assert.equal(state.note.textContent, "Njolla");
  assert.equal(state.problems[1].attributes["aria-pressed"], "true");
  assert.equal(state.problems[0].attributes["aria-pressed"], "false");
});

test("both analysis CTAs retain the existing funnel entry and all photo assets exist", () => {
  assert.equal((html.match(/<button[^>]*\bdata-ls-start\b/g) || []).length, 2);
  assert.equal((html.match(/id="ls-start"/g) || []).length, 1);
  for (const id of ["ls-wahl", "ls-fotopara", "ls-vorbereitung", "ls-analyse"]) {
    assert.ok(html.includes(`id="${id}"`), id);
  }
  for (const match of source.matchAll(/"(\/apps\/[^" ]+\.(?:jpg|webp))"/g)) {
    assert.ok(existsSync(match[1].slice(1)), match[1]);
  }
});
