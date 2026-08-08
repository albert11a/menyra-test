import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { bindTap } from "../apps/menyra-social/core/common/tap-bind-utils.js";

// ===========================================================================
// Der Tipp im Header
//
// Pills und Collapse-Pfeil teilen sich dieselbe Bindung. Sie stand vorher
// zweimal fast wortgleich da und musste von Hand gleich gehalten werden.
// ===========================================================================

class FakeElement {
  constructor() {
    this.listeners = new Map();
  }

  addEventListener(type, handler) {
    if (!this.listeners.has(type)) this.listeners.set(type, []);
    this.listeners.get(type).push(handler);
  }

  removeEventListener(type, handler) {
    const list = this.listeners.get(type) || [];
    const index = list.indexOf(handler);
    if (index > -1) list.splice(index, 1);
  }

  fire(type, event = {}) {
    (this.listeners.get(type) || []).slice().forEach((handler) => handler(event));
  }

  count() {
    return [...this.listeners.values()].reduce((sum, list) => sum + list.length, 0);
  }
}

const touch = (clientY) => ({ touches: [{ clientY }] });
const touchEnd = () => ({ cancelable: true, preventDefault() {} });

test("the finger lifting is what counts, not the click", () => {
  const el = new FakeElement();
  let laeufe = 0;
  bindTap(el, () => { laeufe += 1; });

  el.fire("touchstart", touch(100));
  el.fire("touchend", touchEnd());
  assert.equal(laeufe, 1, "das Loslassen allein schaltet schon");

  // iOS schickt den Klick hinterher - der zaehlt dann nicht noch einmal.
  el.fire("click", {});
  assert.equal(laeufe, 1, "ein Tipp, ein Lauf");
});

test("a swipe that starts on the button is not a tap", () => {
  const el = new FakeElement();
  let laeufe = 0;
  bindTap(el, () => { laeufe += 1; });

  el.fire("touchstart", touch(100));
  el.fire("touchmove", touch(140));
  el.fire("touchend", touchEnd());
  assert.equal(laeufe, 0, "gewischt heisst nicht getippt");
});

test("a hair of movement is still a tap", () => {
  const el = new FakeElement();
  let laeufe = 0;
  bindTap(el, () => { laeufe += 1; });

  el.fire("touchstart", touch(100));
  el.fire("touchmove", touch(104));
  el.fire("touchend", touchEnd());
  assert.equal(laeufe, 1);
});

// Maus und Tastatur haben keinen Finger - dort muss der Klick zaehlen.
test("mouse and keyboard still go through the click", () => {
  const el = new FakeElement();
  let laeufe = 0;
  bindTap(el, () => { laeufe += 1; });

  el.fire("click", {});
  assert.equal(laeufe, 1);
});

test("unbinding takes every listener with it", () => {
  const el = new FakeElement();
  const unbind = bindTap(el, () => {});
  assert.equal(el.count(), 4, "touchstart, touchmove, touchend, click");
  unbind();
  assert.equal(el.count(), 0, "und alle vier gehen wieder");
});

test("nothing is bound without an element or a handler", () => {
  assert.equal(bindTap(null, () => {}), null);
  assert.equal(bindTap(new FakeElement(), null), null);
});

// ===========================================================================
// Kein Stapeln von Handlern in der Kopfzeile
//
// reuseSmartHeaderNodes() im App-Shell-Controller haengt nach einem Neuaufbau
// die alten Kopfzeilen-Knoten wieder ein, damit Safari die klebende Ebene nicht
// neu aufbauen muss. Diese Knoten tragen ihre Handler dann noch - ein zweites
// addEventListener wuerde sie stapeln, und zwar bei JEDEM Render aufs Neue.
//
// Die Bindungen selbst laufen nicht im Test: die Datei importiert /shared/...
// absolut (die Konvention im Projekt, 32 Stellen) und ist damit fuer node nicht
// ladbar. Geprueft wird deshalb die Form im Quelltext - dieselbe Technik, mit
// der auch das CSS geprueft wird.
// ===========================================================================

const bindUtils = readFileSync(
  new URL("../apps/menyra-social/core/app-events/app-events-shell-bind-utils.js", import.meta.url),
  "utf8"
);

// Selektoren, die ein Element in der Kopfzeile treffen koennen.
const KOPFZEILEN_SELEKTOREN = [
  "[data-main-header-tab]",
  "[data-language-toggle]",
  "[data-language-option]",
  "[data-nav]",
  "[data-action]"
];

test("every direct binding in the header is set exactly once", () => {
  const ungeschuetzt = KOPFZEILEN_SELEKTOREN.filter((selektor) => {
    const start = bindUtils.indexOf(`doc.querySelectorAll("${selektor}")`);
    assert.notEqual(start, -1, `Schleife fehlt: ${selektor}`);
    // Der Kopf der Schleife bis zum ersten addEventListener muss bindOnce
    // nennen. Danach ist es der Rumpf des Handlers, der zaehlt hier nicht.
    const bisHandler = bindUtils.slice(start, bindUtils.indexOf("addEventListener", start));
    return !bisHandler.includes("bindOnce");
  });
  assert.deepEqual(
    ungeschuetzt,
    [],
    `bindet bei jedem Render neu: ${ungeschuetzt.join(" | ")}`
  );
});

// Und der Pfeil in der Kopfzeile meldet sich sauber ab: er haengt an einem
// Element, das der Controller selbst wieder loslaesst.
test("the chevron unbinds itself instead of relying on a fresh node", () => {
  const controller = readFileSync(
    new URL("../apps/menyra-social/core/app-shell/app-shell-runtime-controller.js", import.meta.url),
    "utf8"
  );
  assert.match(controller, /mainHeaderTabsToggleUnbind = bindTap\(/, "gebunden ueber die geteilte Bindung");
  assert.match(
    controller,
    /if \(typeof mainHeaderTabsToggleUnbind === "function"\) mainHeaderTabsToggleUnbind\(\)/,
    "und beim Abbau wieder gelöst"
  );
});
