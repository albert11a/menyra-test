import test from "node:test";
import assert from "node:assert/strict";
import { vergleichLesen, vergleichVollstaendig } from "../shared/lifeskin-vergleich.js";
import { zeigeVergleich, vergleichPosition } from "../apps/lifeskin-verkauf/terapia-vergleich.js";
import { vergleichHochladen, renderBefundVergleich } from "../apps/mnyra-heart/heart-lifeskin-vergleich.js";
const paar = { vorher: "https://cdn.example/before.jpg", nachher: "https://cdn.example/after.jpg" };

function dom() {
  const doc = { createElement(tag) { return new Node(tag); } };
  class Node {
    constructor(tag) { this.tag = tag; this.children = []; this.attrs = {}; this.listeners = {}; this.dataset = {}; this.ownerDocument = doc; this.vars = {}; this.style = { setProperty: (k, v) => { this.vars[k] = v; } }; }
    append(...nodes) { this.children.push(...nodes); }
    replaceChildren(...nodes) { this.children = nodes; }
    setAttribute(k, v) { this.attrs[k] = v; }
    addEventListener(k, fn) { this.listeners[k] = fn; }
  }
  return doc.createElement("figure");
}

test("only complete HTTPS image references can appear", () => {
  for (const bad of [undefined, {}, { vorher: paar.vorher }, { ...paar, nachher: "javascript:alert(1)" }, { ...paar, nachher: "data:image/jpeg;base64,xxx" }]) {
    assert.equal(vergleichVollstaendig(bad), false);
    const root = dom(); zeigeVergleich(root, bad);
    assert.equal(root.hidden, true); assert.equal(root.children.length, 0);
  }
  assert.deepEqual(vergleichLesen(paar), paar);
});

test("image requests wait for proximity; slider only changes clipping, and an image error hides the comparison", () => {
  const old = globalThis.IntersectionObserver;
  let callback; let observed; let disconnected = 0;
  globalThis.IntersectionObserver = class {
    constructor(cb, options) { callback = cb; assert.equal(options.rootMargin, "400px"); }
    observe(n) { observed = n; }
    disconnect() { disconnected++; }
  };
  try {
    const root = dom(); zeigeVergleich(root, paar);
    assert.equal(observed, root); assert.equal(root.hidden, false);
    const stage = root.children[0]; const [after, before] = stage.children;
    assert.equal(after.src, undefined); assert.equal(before.src, undefined);
    callback([{ isIntersecting: true }]);
    assert.equal(after.src, paar.nachher); assert.equal(before.src, paar.vorher);
    before.listeners.load(); assert.equal(stage.dataset.bereit, undefined);
    after.listeners.load(); assert.equal(stage.dataset.bereit, "ja");
    const input = stage.children.at(-1);
    assert.equal(input.type, "range"); assert.equal(input.value, "50");
    for (const pos of [0, 25, 100]) { input.value = String(pos); input.listeners.input(); assert.equal(stage.vars["--teilung"], `${pos}%`); }
    assert.equal(before.src, paar.vorher); assert.equal(after.src, paar.nachher);
    before.listeners.error(); assert.equal(root.hidden, true);
    zeigeVergleich(root, null); assert.ok(disconnected >= 2);
    assert.equal(root.children.length, 0);
  } finally { globalThis.IntersectionObserver = old; }
});

function slot() {
  const nodes = {
    "[data-vergleich-status]": {}, "[data-vergleich-url]": { value: paar.vorher, dispatchEvent() {} },
    "[data-vergleich-vorschau]": {}, '[data-action="lifeskin-vergleich-entfernen"]': {}
  };
  const buttons = [{ disabled: false }, { disabled: false }];
  const root = { dataset: {}, querySelector: k => nodes[k], querySelectorAll: () => buttons };
  nodes["[data-vergleich-url]"].closest = () => root;
  return { root, nodes, buttons };
}

test("upload locks the slot, persists a CDN reference, and restores controls", async () => {
  const { root, nodes, buttons } = slot(); let finish;
  const task = vergleichHochladen(root, { type: "image/jpeg", size: 123 }, () => new Promise(resolve => { finish = resolve; }));
  assert.equal(root.dataset.uploading, "ja"); assert.ok(buttons.every(b => b.disabled));
  finish({ bild: paar.nachher }); await task;
  assert.equal(nodes["[data-vergleich-url]"].value, paar.nachher);
  assert.equal(nodes["[data-vergleich-vorschau]"].src, paar.nachher);
  assert.equal(root.dataset.uploading, undefined); assert.ok(buttons.every(b => !b.disabled));
});

test("failed or invalid uploads preserve the previously saved photo", async () => {
  const { root, nodes, buttons } = slot();
  await vergleichHochladen(root, { type: "image/jpeg", size: 123 }, async () => { throw new Error("Offline"); });
  assert.equal(nodes["[data-vergleich-url]"].value, paar.vorher);
  assert.equal(nodes["[data-vergleich-status]"].textContent, "Offline");
  await vergleichHochladen(root, { type: "video/mp4", size: 123 }, () => assert.fail("invalid file uploaded"));
  assert.equal(nodes["[data-vergleich-url]"].value, paar.vorher);
  assert.ok(buttons.every(b => !b.disabled));
  assert.equal((renderBefundVergleich(paar).match(/data-vergleich-url=/g) || []).length, 2);
});

test('the whole image responds to taps and drags, and cancellation stops dragging', () => {
  const root = dom(); zeigeVergleich(root, paar);
  const stage = root.children[0];
  stage.getBoundingClientRect = () => ({ left: 20, width: 200 });
  const input = stage.children.at(-1);
  const event = (clientX, pointerId = 1) => ({ clientX, pointerId, button: 0, preventDefault() {} });
  input.listeners.pointerdown(event(70));
  assert.equal(input.value, '25'); assert.equal(stage.vars['--teilung'], '25%');
  input.listeners.pointermove(event(170)); assert.equal(input.value, '75');
  input.listeners.pointermove(event(40, 2)); assert.equal(input.value, '75');
  input.listeners.pointercancel();
  input.listeners.pointermove(event(50)); assert.equal(input.value, '75');
  input.listeners.pointerdown(event(240)); assert.equal(input.value, '100');
  input.listeners.pointerup();
  assert.equal(vergleichPosition(-20, { left: 20, width: 200 }), 0);
  assert.equal(vergleichPosition(50, { left: 20, width: 0 }), null);
});
