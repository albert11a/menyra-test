import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { parseHTML } from "linkedom";

test("Heart keeps its session and create receipt through a failed list refresh", async (t) => {
  const html = await readFile(new URL("../apps/mnyra-v2/heart.html", import.meta.url), "utf8");
  const { document, CustomEvent } = parseHTML(html);
  const frame = document.createElement("iframe");
  const window = { parent: {}, frameElement: frame };
  const initial = { window: globalThis.window, document: globalThis.document, CustomEvent: globalThis.CustomEvent, FormData: globalThis.FormData };
  Object.assign(globalThis, { window, document, CustomEvent });
  t.after(() => Object.assign(globalThis, initial));

  const ops = [];
  frame.addEventListener("mnyra-v2-session", (event) => {
    event.detail.token = Promise.resolve("current-heart-session");
  });
  t.mock.method(globalThis, "fetch", async (_, options) => {
    assert.equal(options.headers.authorization, "Bearer current-heart-session");
    const { op } = JSON.parse(options.body);
    ops.push(op);
    if (op === "admin-create") return Response.json({ slug: "demo", pin: "12345" });
    if (ops.length === 3) return Response.json({ error: "Offline" }, { status: 503 });
    return Response.json({ leads: [], next: null });
  });
  await import("../apps/mnyra-v2/heart.js");
  await new Promise((resolve) => setImmediate(resolve));
  const form = document.querySelector("#create");
  form.querySelector("select").dispatchEvent(new CustomEvent("change", { bubbles: true }));
  // linkedom provides no native form serialization or reset.
  globalThis.FormData = class extends Map {
    constructor() { super([["name", "Demo"], ["city", "Prishtina"]]); }
  };
  form.reset = () => {};
  await form.onsubmit({ target: form, preventDefault() {} });
  assert.match(document.querySelector("#message").textContent, /12345/);
  assert.equal(document.querySelector("#retry").hidden, false);
  await document.querySelector("#retry").onclick();
  assert.equal(document.querySelector("#retry").hidden, true);
  assert.equal(document.querySelector("#list-error").textContent, "");
  assert.match(document.querySelector("#message").textContent, /12345/);
  assert.deepEqual(ops, ["admin-list", "admin-create", "admin-list", "admin-list"]);
});
