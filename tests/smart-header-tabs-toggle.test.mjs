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
  // es hier an, weil der Pfeil selbst scrollt.
  const frames = [];
  const timers = new Map();
  let nextTimerId = 1;
  const winListeners = new Map();
  const windowObj = {
    scrollY: 0,
    // Ein Scroll ist nur eine Bitte an den Browser. Bleibt sie unbeantwortet -
    // gekappt oder von einem Re-Render zurueckgesetzt - bewegt sich nichts.
    scrollRequestsIgnored: false,
    // Beide Formen wie im Browser: scrollTo(x, y) und scrollTo({ top }).
    scrollTo(first, second) {
      if (this.scrollRequestsIgnored) return;
      const y = first && typeof first === "object" ? first.top : second;
      this.scrollY = Math.max(0, Number(y) || 0);
    },
    setTimeout(callback, delay = 0) {
      const id = nextTimerId++;
      timers.set(id, { callback, delay });
      return id;
    },
    clearTimeout(id) {
      timers.delete(id);
    },
    requestAnimationFrame(callback) {
      frames.push(callback);
      return frames.length;
    },
    cancelAnimationFrame() {},
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


  // Ein Scroll des Nutzers: der faengt mit dem Finger an, deshalb erst die
  // Geste melden - der Pfeil laesst daraufhin sein Scroll-Ziel los.
  function scrollTo(y) {
    fireWindow("pointerdown");
    windowObj.scrollY = Math.max(0, y);
    fireWindow("scroll");
    flushFrames();
  }

  // Ein Re-Render mitten im Pfeil-Scroll: der Render-Pfad setzt die
  // Scroll-Position wieder auf den Wert, den er sich gemerkt hat.
  function renderRestoresScroll(y) {
    windowObj.scrollY = Math.max(0, y);
    fireWindow("scroll");
    flushFrames();
  }

  // Der Browser meldet auch den Scroll, den der Pfeil selbst ausgeloest hat -
  // ohne dass der Nutzer etwas getan haette.
  function settleOwnScroll() {
    fireWindow("scroll");
    flushFrames();
  }

  function clickToggle() {
    (toggleEl.listeners.get("click") || []).slice().forEach((handler) => handler({}));
  }

  // Die Nachschau des Pfeils laeuft ueber einen Timer - hier wird er von Hand
  // abgearbeitet, statt wirklich zu warten.
  function runTimers() {
    const pending = [...timers.entries()].sort((a, b) => a[1].delay - b[1].delay);
    timers.clear();
    pending.forEach(([, timer]) => timer.callback());
    flushFrames();
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
    renderRestoresScroll,
    settleOwnScroll,
    runTimers
  };
}

const isVisible = (harness) => harness.controller.isMainHeaderTabsRowVisible();
const isAway = (harness) => harness.documentObj.documentElement.classList.contains("smart-header-tabs-away");
const isStuck = (harness) => harness.documentObj.documentElement.classList.contains("smart-header-tabs-stuck");

// Der Kern der ganzen Mechanik: der Pfeil nimmt die Zeile nicht aus dem Layout,
// er scrollt sie weg. Deshalb gibt es fuer sie nur einen einzigen Weg zurueck -
// hochscrollen - und der sieht aus wie immer, egal ob der Pfeil im Spiel war.
test("the chevron scrolls the row away instead of taking it out of the layout", () => {
  const harness = createHarness();
  harness.start();

  assert.equal(isVisible(harness), true);
  harness.clickToggle();

  assert.equal(
    harness.windowObj.scrollY,
    TABS_ROW_HEIGHT,
    "die Seite faehrt knapp an der Zeile vorbei, mehr passiert nicht"
  );
  harness.settleOwnScroll();
  assert.equal(isVisible(harness), false);
  assert.equal(isAway(harness), true);
  assert.equal(isStuck(harness), false, "weggescrollt ist nicht geklebt");
});

// Genau die Beschwerde aus dem Video: nach dem Pfeil soll das Hochscrollen
// dasselbe Bild geben wie ohne Pfeil. Beide Wege enden bei scrollY 0 mit
// sichtbarer Zeile - und keiner von beiden fasst dabei das Layout an.
test("after the chevron, scrolling back to the top is the same as if it had never been touched", () => {
  const withChevron = createHarness();
  withChevron.start();
  withChevron.clickToggle();
  withChevron.settleOwnScroll();
  withChevron.scrollTo(600);
  withChevron.scrollTo(0);

  const withoutChevron = createHarness();
  withoutChevron.start();
  withoutChevron.scrollTo(600);
  withoutChevron.scrollTo(0);

  assert.equal(isVisible(withChevron), isVisible(withoutChevron));
  assert.equal(isAway(withChevron), isAway(withoutChevron));
  assert.equal(isStuck(withChevron), isStuck(withoutChevron));
  assert.equal(withChevron.windowObj.scrollY, withoutChevron.windowObj.scrollY);
  assert.equal(isVisible(withChevron), true, "oben steht die Zeile, ganz normal");
});

// Und auf halbem Weg nach oben ebenso: die Zeile taucht rein nach
// Scroll-Position auf, nicht nach einem gemerkten Zustand.
test("halfway back up the row behaves the same with and without the chevron", () => {
  const withChevron = createHarness();
  withChevron.start();
  withChevron.clickToggle();
  withChevron.settleOwnScroll();
  withChevron.scrollTo(600);
  withChevron.scrollTo(120);

  const withoutChevron = createHarness();
  withoutChevron.start();
  withoutChevron.scrollTo(600);
  withoutChevron.scrollTo(120);

  assert.equal(isVisible(withChevron), false);
  assert.equal(isVisible(withChevron), isVisible(withoutChevron));
  assert.equal(isAway(withChevron), isAway(withoutChevron));
});

// Knapp unter dem Anfang - so steht die Seite direkt nach dem Wegschalten -
// holt der Pfeil die Zeile ueber denselben Weg zurueck: die Seite scrollt an
// den Anfang, die Zeile kommt von selbst mit.
test("near the top the chevron brings the row back by scrolling to the top", () => {
  const harness = createHarness();
  harness.start();

  harness.clickToggle();
  harness.settleOwnScroll();
  assert.equal(isVisible(harness), false);

  harness.clickToggle();
  assert.equal(harness.windowObj.scrollY, 0, "zurueck an den Anfang, sonst nichts");
  harness.settleOwnScroll();
  assert.equal(isVisible(harness), true);
  assert.equal(isAway(harness), false);
  assert.equal(isStuck(harness), false, "am Anfang braucht nichts zu kleben");
});

// Tief in der Seite waere ein Sprung an den Anfang der falsche Preis fuer die
// Tabs: dort heftet sich die Zeile unter die Leiste, die Leseposition bleibt.
test("deep in the page the chevron sticks the row under the top bar instead", () => {
  const harness = createHarness();
  harness.start();

  harness.scrollTo(600);
  harness.clickToggle();

  assert.equal(harness.windowObj.scrollY, 600, "die Leseposition bleibt stehen");
  assert.equal(isStuck(harness), true);
  assert.equal(isVisible(harness), true);
  assert.equal(isAway(harness), false);
});

// Die zweite Beschwerde, aus den Bildern: nach "zu" und wieder "auf" stand die
// Zeile zwar da, aber der Abstand darunter fehlte - die Seite war noch um eine
// Zeilenhoehe verschoben und die Zeile lag ueber dem Inhalt. Zurueck heisst
// deshalb: Seite an den Anfang, nichts klebt. Auch dann, wenn ein Re-Render den
// Scroll unterwegs auf seinen alten Wert zurueckstellt.
test("back open means the page is at the top again, not the row on top of the content", () => {
  const harness = createHarness();
  harness.start();

  harness.clickToggle();
  harness.settleOwnScroll();
  assert.equal(harness.windowObj.scrollY, TABS_ROW_HEIGHT);

  harness.clickToggle();
  harness.renderRestoresScroll(TABS_ROW_HEIGHT);
  harness.runTimers();

  assert.equal(harness.windowObj.scrollY, 0, "die Seite steht wieder am Anfang");
  assert.equal(isStuck(harness), false, "nichts liegt ueber dem Inhalt");
  assert.equal(isVisible(harness), true);
  assert.equal(isAway(harness), false);
});

// Dasselbe fuer das Wegnehmen: auch dahin bringt der Pfeil die Seite gegen
// einen Re-Render, sonst blieben die Pills einfach stehen.
test("taking the row away survives a re-render that restores the scroll", () => {
  const harness = createHarness();
  harness.start();

  harness.clickToggle();
  harness.renderRestoresScroll(0);
  harness.runTimers();

  assert.equal(harness.windowObj.scrollY, TABS_ROW_HEIGHT);
  assert.equal(isVisible(harness), false);
  assert.equal(isStuck(harness), false);
});

// Die erste Beschwerde: Zeile weg, Pfeil oben - und der Pfeil holt sie nicht
// mehr zurueck. Sein Scroll ist nur eine Bitte an den Browser; ein Re-Render setzt
// die Position unterwegs zurueck, ein kurzer Weg wird gekappt. Bleibt die
// Bitte unbeantwortet, muss die Zeile trotzdem kommen: sie heftet sich dann
// unter die Leiste - dafuer braucht es keinen Scroll.
test("the chevron brings the row back even when the page refuses to scroll", () => {
  const harness = createHarness();
  harness.start();

  harness.clickToggle();
  harness.settleOwnScroll();
  assert.equal(isVisible(harness), false, "erst mal ist sie weg");

  harness.windowObj.scrollRequestsIgnored = true;
  harness.clickToggle();
  assert.equal(harness.windowObj.scrollY, TABS_ROW_HEIGHT, "der Scroll kommt nicht an");
  assert.equal(isVisible(harness), false, "im selben Bild steht sie noch nicht da");

  harness.runTimers();
  assert.equal(isVisible(harness), true, "die Zeile ist trotzdem zurueck");
  assert.equal(isStuck(harness), true, "geholt wird sie dann ueber die Leiste");
  assert.equal(isAway(harness), false);
});

// Und der Pfeil bleibt dabei ein Schalter: nach dem Zurueckholen ohne Scroll
// nimmt der naechste Tipp die Zeile wieder weg.
test("after the scroll-less reveal the next tap takes the row away again", () => {
  const harness = createHarness();
  harness.start();

  harness.clickToggle();
  harness.settleOwnScroll();
  harness.windowObj.scrollRequestsIgnored = true;
  harness.clickToggle();
  harness.runTimers();
  assert.equal(isVisible(harness), true);

  harness.windowObj.scrollRequestsIgnored = false;
  harness.clickToggle();
  harness.settleOwnScroll();
  assert.equal(isVisible(harness), false, "nochmal getippt ist sie wieder weg");
  assert.equal(isStuck(harness), false);
});

// Wer selbst weiterscrollt, will die Zeile nicht: die Nachschau haelt sich
// dann heraus, sonst kaeme sie unter dem Finger von selbst zurueck.
test("the check keeps out of the way when the user scrolls on themselves", () => {
  const harness = createHarness();
  harness.start();

  harness.clickToggle();
  harness.settleOwnScroll();
  harness.windowObj.scrollRequestsIgnored = true;
  harness.clickToggle();
  harness.scrollTo(600);
  harness.runTimers();

  assert.equal(isStuck(harness), false, "nichts klebt unter der Leiste");
  assert.equal(isVisible(harness), false);
});

// Geklebt und dabei nahe am Anfang: Loslassen allein nimmt die Zeile dort
// nicht weg - ihr normaler Platz liegt ja noch im Blick. Ein Tipp muss
// reichen, sonst sieht der erste aus, als haette er nichts getan.
test("near the top one tap is enough to take the stuck row away", () => {
  const harness = createHarness();
  harness.start();

  harness.scrollTo(600);
  harness.clickToggle();
  assert.equal(isStuck(harness), true);

  // Mit dem Finger zurueck nach oben, aber nicht ganz an den Anfang.
  harness.scrollTo(6);
  assert.equal(isStuck(harness), true, "oben angekommen ist sie noch nicht");

  harness.clickToggle();
  harness.settleOwnScroll();
  assert.equal(isStuck(harness), false);
  assert.equal(isVisible(harness), false, "ein Tipp nimmt sie weg");
  assert.equal(harness.windowObj.scrollY, TABS_ROW_HEIGHT);
});

test("the stuck row is released again by the chevron and by scrolling on", () => {
  const harness = createHarness();
  harness.start();

  harness.scrollTo(600);
  harness.clickToggle();
  assert.equal(isStuck(harness), true);

  harness.clickToggle();
  assert.equal(isStuck(harness), false, "nochmal getippt laesst sie wieder los");
  assert.equal(isVisible(harness), false);

  harness.scrollTo(400);
  harness.clickToggle();
  assert.equal(isStuck(harness), true);
  harness.scrollTo(460);
  assert.equal(isStuck(harness), false, "weiterscrollen nimmt sie ebenfalls wieder mit");
});
