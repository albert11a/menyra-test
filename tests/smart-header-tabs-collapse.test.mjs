import assert from "node:assert/strict";
import test from "node:test";
import { createAppShellRuntimeController } from "../apps/menyra-social/core/app-shell/app-shell-runtime-controller.js";

const TABS_ROW_HEIGHT = 40;
const TOP_BAR_HEIGHT = 72;

class FakeClassList {
  constructor(initial = []) {
    this.values = new Set(initial);
  }

  add(name) {
    this.values.add(name);
  }

  remove(name) {
    this.values.delete(name);
  }

  contains(name) {
    return this.values.has(name);
  }

  toggle(name, force) {
    const next = force === undefined ? !this.values.has(name) : !!force;
    if (next) this.values.add(name);
    else this.values.delete(name);
    return next;
  }
}

class FakeElement {
  constructor({ classes = [], height = 0 } = {}) {
    this.classList = new FakeClassList(classes);
    this.height = height;
    this.attributes = new Map();
    this.listeners = new Map();
  }

  getBoundingClientRect() {
    return { height: this.height };
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

  setAttribute(name, value) {
    this.attributes.set(name, String(value));
  }

  getAttribute(name) {
    return this.attributes.has(name) ? this.attributes.get(name) : null;
  }
}

// Nur so viel Umgebung, wie die Tab-Zeile im Header wirklich anfasst: eine
// Zeile mit Hoehe, der Pfeil daneben, ein Fenster mit Scroll-Position.
function createHarness() {
  const tabsEl = new FakeElement({ classes: ["smart-header-tabs", "smart-header-tabs--main"], height: TABS_ROW_HEIGHT });
  const topEl = new FakeElement({ height: TOP_BAR_HEIGHT });
  const toggleEl = new FakeElement();
  const styleValues = new Map();

  const documentObj = {
    documentElement: {
      classList: new FakeClassList(),
      style: {
        getPropertyValue: (name) => styleValues.get(name) || "",
        setProperty: (name, value) => styleValues.set(name, String(value)),
        removeProperty: (name) => styleValues.delete(name)
      }
    },
    body: { classList: new FakeClassList(), style: {} },
    activeElement: null,
    addEventListener: () => {},
    getElementById(id) {
      if (id === "smart-tabs") return tabsEl;
      if (id === "smart-header-top") return topEl;
      return null;
    },
    querySelector(selector) {
      if (selector === "[data-main-header-tabs-toggle]") return toggleEl;
      return null;
    },
    querySelectorAll: () => []
  };

  // Der Browser meldet den Scroll erst im naechsten Tick - genau darauf kommt
  // es hier an, weil das Ausblenden selbst die Position korrigiert.
  const frames = [];
  const timers = [];
  const winListeners = new Map();
  const windowObj = {
    scrollY: 0,
    scrollTo(_x, y) {
      this.scrollY = Math.max(0, Number(y) || 0);
    },
    requestAnimationFrame(callback) {
      frames.push(callback);
      return frames.length;
    },
    cancelAnimationFrame() {},
    // Der Lauf, mit dem die Zeile ihren Platz wieder aufzieht, raeumt sich am
    // Ende selbst weg - hier von Hand abgearbeitet.
    setTimeout(callback) {
      timers.push(callback);
      return timers.length;
    },
    clearTimeout(id) {
      const index = Number(id) - 1;
      if (index >= 0 && index < timers.length) timers[index] = null;
    },
    addEventListener(type, handler) {
      if (!winListeners.has(type)) winListeners.set(type, []);
      winListeners.get(type).push(handler);
    },
    removeEventListener(type, handler) {
      const list = winListeners.get(type) || [];
      const index = list.indexOf(handler);
      if (index > -1) list.splice(index, 1);
    },
    localStorage: {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {}
    }
  };

  const controller = createAppShellRuntimeController({
    state: { activeTab: "feed", userProfile: {}, notifications: [], shopCart: { items: [] } },
    documentObj,
    windowObj,
    escapeHtml: (value = "") => String(value || ""),
    icon: (name = "") => `<svg data-icon="${name}"></svg>`,
    isGuestSession: () => false,
    getChatUnreadCount: () => 0,
    resolveHeaderBranding: () => ({ title: "MNYRA", subtitle: "Social", logoUrl: "", isBusinessLogo: false }),
    logoFitClass: () => "object-cover"
  });

  function fireWindow(type, event = {}) {
    (winListeners.get(type) || []).slice().forEach((handler) => handler(event));
  }

  function flushFrames() {
    while (frames.length) frames.shift()();
  }

  function flushTimers() {
    while (timers.length) timers.shift()?.();
  }

  function readStyle(name) {
    return styleValues.get(name) || "";
  }

  // Ein Scroll des Nutzers: Position setzen, Ereignis melden, Frame abarbeiten.
  function scrollTo(y) {
    windowObj.scrollY = Math.max(0, y);
    fireWindow("scroll");
    flushFrames();
  }

  // Der Browser meldet auch die Scroll-Korrektur, die das Ausblenden selbst
  // ausgeloest hat - ohne dass der Nutzer etwas getan haette.
  function settleOwnScroll() {
    fireWindow("scroll");
    flushFrames();
  }

  function clickToggle() {
    (toggleEl.listeners.get("click") || []).slice().forEach((handler) => handler({}));
  }

  function start() {
    controller.initMainHeaderTabsRuntime(tabsEl);
    // Erste Nutzer-Geste: der Boot-Lock haelt die Zeile sonst am Seitenanfang.
    fireWindow("pointerdown");
  }

  return {
    controller,
    documentObj,
    windowObj,
    start,
    clickToggle,
    scrollTo,
    settleOwnScroll,
    flushTimers,
    readStyle
  };
}

const isCollapsed = (harness) => harness.controller.isMainHeaderTabsCollapsed();
const isAway = (harness) => harness.documentObj.documentElement.classList.contains("smart-header-tabs-away");
const isRevealing = (harness) => harness.documentObj.documentElement.classList.contains("smart-header-tabs-revealing");

test("pills hidden by the chevron come back once the page is at the very top again", () => {
  const harness = createHarness();
  harness.start();

  harness.clickToggle();
  assert.equal(isCollapsed(harness), true);
  harness.settleOwnScroll();
  assert.equal(isCollapsed(harness), true, "the own scroll correction must not reopen the row");

  harness.scrollTo(400);
  assert.equal(isCollapsed(harness), true, "hidden stays hidden while scrolling down");

  harness.scrollTo(0);
  assert.equal(isCollapsed(harness), false, "back at the top the row stands again");
  assert.equal(isAway(harness), false);
});

test("pills hidden just below the top survive the scroll correction and reopen at the top", () => {
  const harness = createHarness();
  harness.start();

  // Knapp unter dem Anfang steht die Zeile noch im Blick - der Pfeil blendet
  // sie hier aus und gleicht den frei werdenden Platz per Scroll aus.
  harness.scrollTo(30);
  harness.clickToggle();
  assert.equal(isCollapsed(harness), true);
  harness.settleOwnScroll();
  assert.equal(isCollapsed(harness), true, "the own correction to the top must not undo the hide");

  harness.scrollTo(300);
  assert.equal(isCollapsed(harness), true, "on the way down the row stays hidden");

  harness.scrollTo(120);
  assert.equal(isCollapsed(harness), true, "and it stays hidden on the way back up");

  harness.scrollTo(0);
  assert.equal(isCollapsed(harness), false);
});

test("the chevron mid scroll still retrieves the row instead of hiding it", () => {
  const harness = createHarness();
  harness.start();

  harness.scrollTo(300);
  harness.clickToggle();

  assert.equal(isCollapsed(harness), false, "unterwegs holt der Pfeil die Zeile zurueck");
  assert.equal(isAway(harness), false);
});

// Ausgeblendet ist die Zeile ganz aus dem Layout - der Content steht also um
// ihre Hoehe weiter oben. Am Seitenanfang laesst sich dieser Unterschied durch
// keine Scroll-Korrektur mehr ausgleichen: die Zeile muss ihren Platz aufziehen,
// sonst rutscht der Content in einem Bild nach unten. Genau dieser Ruck faellt
// gegen das ruhige Wiederauftauchen beim Hochscrollen sofort auf.
test("back at the top the hidden row grows into its place instead of jumping into it", () => {
  const harness = createHarness();
  harness.start();

  harness.clickToggle();
  harness.settleOwnScroll();
  harness.scrollTo(400);
  assert.equal(isRevealing(harness), false, "unterwegs zieht nichts auf");

  harness.scrollTo(0);
  assert.equal(isCollapsed(harness), false);
  assert.equal(isRevealing(harness), true, "die Zeile zieht ihren Platz auf");
  assert.equal(
    harness.readStyle("--smart-header-tabs-reveal-height"),
    "40px",
    "aufgezogen wird auf die gemessene Zeilenhoehe"
  );

  harness.flushTimers();
  assert.equal(isRevealing(harness), false, "nach dem Lauf raeumt sich die Zeile selbst auf");
  assert.equal(harness.readStyle("--smart-header-tabs-reveal-height"), "");
  assert.equal(isCollapsed(harness), false);
});

// Unterwegs gibt es Scroll-Weg zum Ausgleichen: dort bleibt der Content ohnehin
// stehen, ein Aufziehen waere nur unnoetige Bewegung.
test("mid scroll the chevron brings the row back by scroll, without growing it", () => {
  const harness = createHarness();
  harness.start();

  harness.clickToggle();
  harness.settleOwnScroll();
  harness.scrollTo(300);
  harness.clickToggle();

  assert.equal(isCollapsed(harness), false);
  assert.equal(isRevealing(harness), false, "der Ausgleich laeuft ueber die Scroll-Position");
  assert.equal(harness.windowObj.scrollY, 340, "die Seite zieht um die Zeilenhoehe mit");
});

test("after the row is back the normal scroll rule hides it again", () => {
  const harness = createHarness();
  harness.start();

  harness.clickToggle();
  harness.settleOwnScroll();
  harness.scrollTo(400);
  harness.scrollTo(0);
  assert.equal(isCollapsed(harness), false);

  harness.scrollTo(200);
  assert.equal(isCollapsed(harness), false, "scrolling away is not the same as hiding");
  assert.equal(isAway(harness), true, "the row is simply scrolled behind the top bar");
});
