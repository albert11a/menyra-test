import test from "node:test";
import assert from "node:assert/strict";
import { mountHeartV2 } from "../apps/mnyra-heart/heart-v2.js";
import { parseHTML } from "linkedom";

test("Heart keeps its session and create receipt through a failed list refresh", async (t) => {
  const { document, CustomEvent } = parseHTML('<html><body><section></section></body></html>');
  const root = document.querySelector("section");
  const originalDocument = globalThis.document, originalFormData = globalThis.FormData;
  globalThis.document = document;
  t.after(() => { globalThis.document = originalDocument; globalThis.FormData = originalFormData; });
  const ops = [];
  t.mock.method(globalThis, "fetch", async (_, options) => {
    assert.equal(options.headers.authorization, "Bearer current-heart-session");
    const { op } = JSON.parse(options.body);
    ops.push(op);
    if (op === "admin-create") return Response.json({ slug: "demo", pin: "12345" });
    if (ops.length === 3) return Response.json({ error: "Offline" }, { status: 503 });
    return Response.json({ leads: [], next: null });
  });
  mountHeartV2(root, async () => "current-heart-session");
  await new Promise((resolve) => setImmediate(resolve));
  const form = root.querySelector('[data-v2="create"]');
  form.querySelector("select").dispatchEvent(new CustomEvent("change", { bubbles: true }));
  // linkedom provides no native form serialization or reset.
  globalThis.FormData = class extends Map {
    constructor() { super([["name", "Demo"], ["city", "Prishtina"]]); }
  };
  form.reset = () => {};
  await form.onsubmit({ target: form, preventDefault() {} });
  assert.match(root.querySelector('[data-v2="message"]').textContent, /12345/);
  assert.equal(root.querySelector('[data-v2="retry"]').hidden, false);
  await root.querySelector('[data-v2="retry"]').onclick();
  assert.equal(root.querySelector('[data-v2="retry"]').hidden, true);
  assert.equal(root.querySelector('[data-v2="list-error"]').textContent, "");
  assert.match(root.querySelector('[data-v2="message"]').textContent, /12345/);
  assert.deepEqual(ops, ["admin-list", "admin-create", "admin-list", "admin-list"]);
});
