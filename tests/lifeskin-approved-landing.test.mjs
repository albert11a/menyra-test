import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import vm from "node:vm";

const source = readFileSync("apps/lifeskin-landing/approved.js", "utf8");
const html = readFileSync("apps/lifeskin-landing/index.html", "utf8");

function setup() {
  const pending = [];
  const node = (dataset) => ({ dataset, attributes: {}, addEventListener(event, fn) { this[event] = fn; }, setAttribute(key, value) { this.attributes[key] = value; } });
  const buttons = [node({ caseDirection: "prev" }), node({ caseDirection: "next" })];

  const before = { src: "original-before" };
  const after = { src: "original-after" };
  const counter = {};
  const root = {
    querySelector: (id) => ({ "#lf-before": before, "#lf-after": after, "#lf-case-count": counter })[id],
    querySelectorAll: (selector) => selector === "[data-case-direction]" ? buttons : []
  };
  class Image { set src(src) { this.path = src; pending.push(this); } }
  vm.runInNewContext(source, { document: { getElementById: () => root }, Image });
  return { pending, buttons, before, after, counter };
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
  assert.equal(state.counter.textContent, "01 / 02");
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
  assert.equal(state.counter.textContent, "02 / 02");
});

test("a failed next pair keeps the current photos and can be retried", async () => {
  const state = setup();
  const failed = state.buttons[0].click();
  state.pending[0].onerror();
  await failed;
  assert.equal(state.before.src, "original-before");
  const retry = state.buttons[0].click();
  state.pending[2].onload();
  state.pending[3].onload();
  await retry;
  assert.equal(state.after.src, "/apps/lifeskin/fall-nachher.jpg");
});

test("the concern section is removed and both arrow locations navigate the same pair", () => {
  assert.doesNotMatch(html, /Fillo nga problemi yt|data-problem|data-case="/);
  assert.equal((html.match(/data-case-direction="prev"/g) || []).length, 2);
  assert.equal((html.match(/data-case-direction="next"/g) || []).length, 2);
  assert.match(html, /Kohëzgjatja/);
  assert.match(html, /4 javë/);
  assert.equal((html.match(/class="lf-step"/g) || []).length, 3);
  assert.doesNotMatch(html, /Rezultati ndryshon|↗️|✓/);
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
