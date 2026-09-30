import test from "node:test";
import assert from "node:assert/strict";
import vm from "node:vm";
import { readFileSync } from "node:fs";

const script = readFileSync(new URL("../apps/lifeskinlifeskin/design.js", import.meta.url), "utf8");
function run(pathname, search = "", remembered = false) {
  const appended = [], replaced = [], storage = new Map(remembered ? [["lifeskin:mobile-design", "mobile"]] : []);
  const root = { dataset: {} };
  vm.runInNewContext(script, {
    URLSearchParams, location: { pathname, search, hash: "#detail" },
    sessionStorage: { getItem: key => storage.get(key), setItem: (key, value) => storage.set(key, value), removeItem: key => storage.delete(key) },
    document: { documentElement: root, createElement: () => ({}), head: { append: node => appended.push(node) } },
    history: { state: null, replaceState: (...args) => replaced.push(args[2]) }
  });
  return { appended, replaced, storage, root };
}
test("existing funnel stays classic without opt-in", () => {
  assert.equal(run("/lifeskin").appended.length, 0);
});
test("new landing activates mobile and carries it to the next page", () => {
  const landing = run("/lifeskinlifeskin");
  assert.equal(landing.root.dataset.lsDesign, "mobile");
  assert.equal(landing.storage.get("lifeskin:mobile-design"), "mobile");
  assert.equal(run("/lifeskin", "", true).appended.length, 2);
});
test("shared reports preserve existing query and hash", () => {
  assert.deepEqual(run("/analiza/abcdef0123456789", "?weg=foto&vorschau=1", true).replaced,
    ["/analiza/abcdef0123456789?weg=foto&vorschau=1&ls_design=mobile#detail"]);
});
test("explicit classic clears presentation opt-in", () => {
  const result = run("/lifeskin", "?ls_design=classic", true);
  assert.equal(result.appended.length, 0);
  assert.equal(result.storage.size, 0);
});
test("internal skip button exists only in demo and uses fictional transport", () => {
  const preview = readFileSync(new URL("../apps/lifeskinlifeskin/preview.js", import.meta.url), "utf8");
  const live = readFileSync(new URL("../apps/lifeskin-astra/index.html", import.meta.url), "utf8");
  assert.ok(preview.includes('next.href = "?page=analysis"'));
  assert.ok(preview.includes('status: "vorschau"'));
  assert.ok(preview.includes('globalThis.fetch = mockFetch'));
  assert.ok(preview.includes('status: 403'));
  assert.ok(!live.includes("preview-next"));
});
