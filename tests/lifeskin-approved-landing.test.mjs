import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import vm from "node:vm";
import { RASTE_STANDARD } from "../shared/lifeskin-raste.js";
import { vergleichFaelleLaden } from "../apps/lifeskin-landing/raste.js";

const source = readFileSync("apps/lifeskin-landing/approved.js", "utf8");
const html = readFileSync("apps/lifeskin-landing/index.html", "utf8");

function setup() {
  const pending = [];
  const node = (dataset) => ({ dataset, attributes: {}, addEventListener(event, fn) { this[event] = fn; }, setAttribute(key, value) { this.attributes[key] = value; } });
  const buttons = [node({ caseDirection: "prev" }), node({ caseDirection: "next" })];

  const before = { src: "original-before" };
  const after = { src: "original-after" };
  const counter = {};
  const listeners = {};
  const section = {};
  const root = {
    addEventListener: (event, fn) => { listeners[event] = fn; },
    querySelector: (id) => ({ "#lf-before": before, "#lf-after": after, "#lf-case-count": counter })[id],
    querySelectorAll: (selector) => selector === "[data-case-direction]" ? buttons : []
  };
  class Image { set src(src) { this.path = src; pending.push(this); } }
  vm.runInNewContext(source, { document: { getElementById: (id) => id === "rezultatet" ? section : root }, Image });
  return { pending, buttons, before, after, counter, listeners, section };
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
  assert.equal(state.before.src, "/apps/lifeskin-landing/fotot/rasti-1-dita1.webp");
  assert.equal(state.after.src, "/apps/lifeskin-landing/fotot/rasti-1-dita28.webp");
  assert.equal(state.counter.textContent, "01 / 04");
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
  assert.equal(state.counter.textContent, "02 / 04");
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
  assert.equal(state.after.src, "/apps/lifeskin-landing/fotot/rasti-1-dita28.webp");
});

test("the concern section is removed and both arrow locations navigate the same pair", () => {
  assert.doesNotMatch(html, /Fillo nga problemi yt|data-problem|data-case="/);
  assert.equal((html.match(/data-case-direction="prev"/g) || []).length, 2);
  assert.equal((html.match(/data-case-direction="next"/g) || []).length, 2);
  assert.match(html, /Kohëzgjatja/);
  assert.match(html, /4 javë/);
  assert.equal((html.match(/class="nx-story"/g) || []).length, 3);
  assert.doesNotMatch(html, /Rezultati ndryshon|↗️|✓/);
});

test("all three approved analysis CTAs retain the existing funnel entry and all photo assets exist", () => {
  assert.equal((html.match(/<button[^>]*\bdata-ls-start\b/g) || []).length, 3);
  assert.equal((html.match(/id="ls-start"/g) || []).length, 1);
  for (const id of ["ls-wahl", "ls-fotopara", "ls-vorbereitung", "ls-analyse"]) {
    assert.ok(html.includes(`id="${id}"`), id);
  }
  for (const match of source.matchAll(/"(\/apps\/[^" ]+\.(?:jpg|webp))"/g)) {
    assert.ok(existsSync(match[1].slice(1)), match[1]);
  }
  for (const match of html.matchAll(/src="(\/apps\/[^" ]+\.(?:jpg|webp))"/g)) {
    assert.ok(existsSync(match[1].slice(1)), match[1]);
  }
  assert.doesNotMatch(html, /data-preview-start|nx-dialog|data:image/);
});

// Public configuration fixtures only; tests never read production Firestore.
const field = (value) => typeof value === "boolean" ? { booleanValue: value }
  : typeof value === "string" ? { stringValue: value }
    : Array.isArray(value) ? { arrayValue: { values: value.map(field) } }
      : { mapValue: { fields: Object.fromEntries(Object.entries(value).map(([key, item]) => [key, field(item)])) } };
const response = (data) => ({ ok: true, json: async () => ({ fields: Object.fromEntries(Object.entries(data).map(([key, value]) => [key, field(value)])) }) });

test("Heart comparison includes every landing case, excluding analysis-only cases", async () => {
  const list = [
    { ...RASTE_STANDARD[0], oben: false },
    { ...RASTE_STANDARD[1], landing: false },
    RASTE_STANDARD[2],
    { ...RASTE_STANDARD[3], bild: true }
  ];
  const calls = [];
  const result = await vergleichFaelleLaden("mock", async (url) => {
    calls.push(url);
    return response(url.endsWith("/raste") ? { lista: list } : { para: "data:image/jpeg;base64,before", pas: "data:image/jpeg;base64,after" });
  });
  assert.deepEqual(result.map((entry) => entry.id), ["r1", "r3", "r4"]);
  assert.equal(result[2].pas, "data:image/jpeg;base64,after");
  assert.deepEqual(calls, ["mock/raste", "mock/rasti-r4"]);
});

test("a missing config or failed request keeps the four fallback cases; empty selection stays empty", async () => {
  assert.equal(await vergleichFaelleLaden("mock", async () => ({ status: 404 })), null);
  assert.equal(await vergleichFaelleLaden("mock", async () => { throw new Error("offline"); }), null);
  assert.deepEqual(await vergleichFaelleLaden("mock", async () => response({ lista: [] })), []);
  assert.equal(setup().counter.textContent, "02 / 04");
  for (const entry of RASTE_STANDARD) {
    assert.ok(existsSync(entry.para.slice(1).replace(/\.jpg$/, ".webp")));
    assert.ok(existsSync(entry.pas.slice(1).replace(/\.jpg$/, ".webp")));
  }
});

test("navigation adopts the Heart list and reaches every case in both directions", async () => {
  const state = setup();
  const entries = ["a", "b", "c"].map((id) => ({ id, para: `/apps/${id}.jpg`, pas: `/apps/${id}-after.jpg` }));
  const update = state.listeners["lifeskin:comparison-cases"]({ detail: entries });
  state.pending[2].onload(); state.pending[3].onload(); await update;
  assert.equal(state.counter.textContent, "01 / 03");
  const last = state.buttons[0].click();
  state.pending[4].onload(); state.pending[5].onload(); await last;
  assert.equal(state.before.src, "/apps/c.jpg");
  assert.equal(state.counter.textContent, "03 / 03");
  await state.buttons[1].click();
  assert.equal(state.before.src, "/apps/a.jpg");
  const middle = state.buttons[1].click();
  state.pending[6].onload(); state.pending[7].onload(); await middle;
  assert.equal(state.before.src, "/apps/b.jpg");
  assert.equal(state.counter.textContent, "02 / 03");
  state.listeners["lifeskin:comparison-cases"]({ detail: [] });
  assert.equal(state.section.hidden, true);
  assert.ok(state.buttons.every((button) => button.disabled));
});
