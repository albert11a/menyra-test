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
    this.style = {};
    this.attributes = new Map();
    this.listeners = new Map();
  }

  getBoundingClientRect() {
    // Eine gesetzte Hoehe gilt, wie im Browser auch.
    const gesetzt = parseFloat(this.style.height);
    const height = Number.isFinite(gesetzt) ? gesetzt : this.height;
    return { top: 0, height };
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
  const mainEl = new FakeElement();
  const styleValues = new Map();

  const istZu = () => documentObj.documentElement.classList.contains("smart-header-tabs-collapsed");

  // Zugemacht ist die Zeile aus dem Layout - genau wie im Browser hat sie dann
  // keine Hoehe mehr.
  const echteZeilenhoehe = () => {
    const gesetzt = parseFloat(tabsEl.style.height);
    return Number.isFinite(gesetzt) ? gesetzt : tabsEl.height;
  };
  tabsEl.getBoundingClientRect = () => ({ top: 0, height: istZu() ? 0 : echteZeilenhoehe() });
  // Der Hauptbereich sitzt unter Leiste und Zeile und wandert mit dem Scroll -
  // daran misst die Laufzeit, wie weit sich der Inhalt verschoben hat.
  mainEl.getBoundingClientRect = () => ({
    top: TOP_BAR_HEIGHT + (istZu() ? 0 : echteZeilenhoehe()) - windowObj.scrollY,
    height: 4000
  });

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
      if (selector === "main") return mainEl;
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

  const fireOn = (element, type, event = {}) => {
    (element.listeners.get(type) || []).slice().forEach((handler) => handler(event));
  };

  // Ein Tipp mit dem Finger, so wie ihn der Browser meldet: touchstart,
  // touchend - und danach der Klick, den iOS hinterherschickt.
  function tapToggle({ moveBy = 0, withClick = true } = {}) {
    fireOn(toggleEl, "touchstart", { touches: [{ clientY: 100 }] });
    if (moveBy) fireOn(toggleEl, "touchmove", { touches: [{ clientY: 100 + moveBy }] });
    fireOn(toggleEl, "touchend", { cancelable: true, preventDefault() {} });
    // iOS schluckt den Klick nach dem Scrollen gern - dann bleibt nur der Finger.
    if (withClick) fireOn(toggleEl, "click", {});
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
    tabsEl,
    mainEl,
    clickToggle,
    tapToggle,
    scrollTo,
    renderRestoresScroll,
    settleOwnScroll,
    runTimers
  };
}

const isVisible = (harness) => harness.controller.isMainHeaderTabsRowVisible();
const isAway = (harness) => harness.documentObj.documentElement.classList.contains("smart-header-tabs-away");
const isStuck = (harness) => harness.documentObj.documentElement.classList.contains("smart-header-tabs-stuck");
const isCollapsed = (harness) => harness.documentObj.documentElement.classList.contains("smart-header-tabs-collapsed");

// Der Kern: der Pfeil macht die Zeile zu und wieder auf - an derselben Stelle.
// Er scrollt die Seite nicht mehr dorthin, wo die Zeile gerade zufaellig waere.
// Deshalb haengt sein Zustand an nichts, was ein Browser oder ein Re-Render
// ihm wegnehmen koennte.
test("at the top the chevron closes and opens the row without moving the page", () => {
  const harness = createHarness();
  harness.start();

  assert.equal(isVisible(harness), true);
  assert.equal(harness.windowObj.scrollY, 0);

  harness.clickToggle();
  assert.equal(isCollapsed(harness), true, "die Zeile ist aus dem Layout");
  assert.equal(isVisible(harness), false);
  assert.equal(isAway(harness), true, "der Pfeil dreht nach oben");
  assert.equal(harness.windowObj.scrollY, 0, "die Seite steht still");

  harness.clickToggle();
  assert.equal(isCollapsed(harness), false, "die Zeile ist wieder da");
  assert.equal(isVisible(harness), true);
  assert.equal(isAway(harness), false);
  assert.equal(isStuck(harness), false, "am Anfang klebt nichts");
  assert.equal(harness.windowObj.scrollY, 0, "die Seite steht immer noch still");
});

// Zehnmal getippt ist zehnmal dasselbe - kein Zustand, der sich aufschaukelt.
test("the chevron stays a plain switch, tap after tap", () => {
  const harness = createHarness();
  harness.start();

  for (let round = 0; round < 5; round += 1) {
    harness.clickToggle();
    assert.equal(isVisible(harness), false, `Runde ${round}: zu`);
    assert.equal(harness.windowObj.scrollY, 0);
    harness.clickToggle();
    assert.equal(isVisible(harness), true, `Runde ${round}: auf`);
    assert.equal(harness.windowObj.scrollY, 0);
  }
});

// Genau die Beschwerde: ein Re-Render setzt die Scroll-Position zurueck. Das
// darf den Pfeil nicht mehr interessieren - er haengt nicht mehr daran.
test("a re-render restoring the scroll cannot break the chevron", () => {
  const harness = createHarness();
  harness.start();

  harness.clickToggle();
  harness.renderRestoresScroll(0);
  harness.runTimers();
  assert.equal(isVisible(harness), false, "zu bleibt zu");

  harness.clickToggle();
  harness.renderRestoresScroll(0);
  harness.runTimers();
  assert.equal(isVisible(harness), true, "auf bleibt auf");
  assert.equal(harness.windowObj.scrollY, 0);
  assert.equal(isStuck(harness), false);
});

// Auch wenn der Browser gar nicht scrollt, schaltet der Pfeil - der Scroll ist
// nur noch Ausgleich, nicht mehr der Weg.
test("the chevron switches even when the browser refuses to scroll", () => {
  const harness = createHarness();
  harness.start();
  harness.windowObj.scrollRequestsIgnored = true;

  harness.clickToggle();
  assert.equal(isVisible(harness), false);
  harness.clickToggle();
  assert.equal(isVisible(harness), true);
});

// Weiter unten in der Seite: die Zeile ist ohnehin weggescrollt. Ein Tipp holt
// sie unter die Leiste, ohne die Leseposition zu verruecken - das war schon
// vorher so und bleibt.
test("further down the row comes back under the top bar, the reading spot stays", () => {
  const harness = createHarness();
  harness.start();

  harness.scrollTo(600);
  assert.equal(isVisible(harness), false);

  harness.clickToggle();
  assert.equal(isVisible(harness), true);
  assert.equal(isStuck(harness), true);
  assert.equal(harness.windowObj.scrollY, 600, "die Leseposition bleibt stehen");

  harness.clickToggle();
  assert.equal(isVisible(harness), false);
  assert.equal(isStuck(harness), false);
  assert.equal(harness.windowObj.scrollY, 600 - TABS_ROW_HEIGHT, "der Ausgleich haelt den Text still");
});

// Zumachen weiter unten nimmt der Seite eine Zeilenhoehe an Layout weg. Damit
// der Text unter dem Finger stehen bleibt, geht die Scroll-Position mit - und
// beim Aufmachen wieder zurueck.
test("closing and opening further down keeps the content under the finger", () => {
  const harness = createHarness();
  harness.start();

  harness.scrollTo(600);
  harness.clickToggle();
  harness.clickToggle();
  const nachZu = harness.windowObj.scrollY;
  assert.equal(nachZu, 600 - TABS_ROW_HEIGHT);
  assert.equal(isCollapsed(harness), true);

  harness.clickToggle();
  assert.equal(isCollapsed(harness), false);
  assert.equal(harness.windowObj.scrollY, 600, "zurueck auf dieselbe Stelle");
  assert.equal(isStuck(harness), true, "und sichtbar unter der Leiste");
});

// Weitergescrollt laesst die geholte Zeile wieder los - sonst haette man
// dauerhaft eine zweite Leiste im Bild.
test("scrolling on releases the row that the chevron brought back", () => {
  const harness = createHarness();
  harness.start();

  harness.scrollTo(600);
  harness.clickToggle();
  assert.equal(isStuck(harness), true);

  harness.scrollTo(660);
  assert.equal(isStuck(harness), false);
  assert.equal(isVisible(harness), false);
});

// Am Seitenanfang ist die offene Zeile einfach da - ohne Kleben, ohne dass
// etwas uebereinander liegt. Genau das Startbild.
test("scrolling back to the top shows the open row in its normal place", () => {
  const harness = createHarness();
  harness.start();

  harness.scrollTo(600);
  harness.clickToggle();
  assert.equal(isStuck(harness), true);

  harness.scrollTo(0);
  assert.equal(isStuck(harness), false, "am Anfang klebt nichts");
  assert.equal(isVisible(harness), true);
  assert.equal(isCollapsed(harness), false);
});

// Zugemacht bleibt zugemacht, solange man unterwegs ist - nur der Pfeil oder
// der Weg ganz nach oben macht sie wieder auf.
test("a closed row stays closed while scrolling around", () => {
  const harness = createHarness();
  harness.start();

  harness.clickToggle();
  assert.equal(isVisible(harness), false);

  harness.scrollTo(600);
  assert.equal(isCollapsed(harness), true);
  harness.scrollTo(1400);
  assert.equal(isCollapsed(harness), true, "sie kommt unterwegs nicht von selbst zurueck");
  harness.scrollTo(300);
  assert.equal(isCollapsed(harness), true, "auch auf halbem Weg nach oben nicht");
  assert.equal(isVisible(harness), false);

  harness.clickToggle();
  assert.equal(isVisible(harness), true);
});

// Der Zustand liegt im Modul, nicht im HTML: ein Re-Render baut die Kopfzeile
// neu und die Zeile muss trotzdem zu bleiben.
test("the closed state survives a re-render of the header", () => {
  const harness = createHarness();
  harness.start();

  harness.clickToggle();
  assert.equal(isCollapsed(harness), true);

  harness.documentObj.documentElement.classList.remove("smart-header-tabs-collapsed");
  harness.start();

  assert.equal(isCollapsed(harness), true, "nach dem Re-Render wieder zu");
  assert.equal(isVisible(harness), false);
});

// Weiter unten hat jeder zweite Tipp nichts getan: aufgemacht geht die
// Scroll-Position um eine Zeilenhoehe mit, damit der Text stehen bleibt - und
// genau das las die Scroll-Regel als "der Nutzer scrollt nach unten" und nahm
// die gerade geholte Zeile sofort wieder weg. Der eigene Ausgleich ist keine
// Geste.
test("further down every tap counts, the compensation is not read as a swipe", () => {
  const harness = createHarness();
  harness.start();
  harness.scrollTo(1200);

  for (let round = 0; round < 4; round += 1) {
    harness.clickToggle();
    harness.settleOwnScroll();
    harness.runTimers();
    assert.equal(isVisible(harness), true, `Runde ${round}: der Tipp holt die Zeile`);
    assert.equal(isStuck(harness), true, `Runde ${round}: und sie bleibt auch da`);

    harness.clickToggle();
    harness.settleOwnScroll();
    harness.runTimers();
    assert.equal(isVisible(harness), false, `Runde ${round}: der naechste Tipp nimmt sie weg`);
  }
});

// Der Finger zaehlt beim Loslassen - nicht erst beim Klick, den iOS nach dem
// Scrollen gern verspaetet oder gar nicht schickt.
test("the chevron reacts on the finger lifting, and only once", () => {
  const harness = createHarness();
  harness.start();

  // Ohne nachfolgenden Klick - genau der Fall, in dem der Knopf vorher stumm
  // blieb.
  harness.tapToggle({ withClick: false });
  assert.equal(isVisible(harness), false, "das Loslassen allein schaltet schon");

  // Und mit Klick zaehlt der Tipp trotzdem nur einmal.
  harness.tapToggle();
  assert.equal(isVisible(harness), true, "ein Tipp, ein Wechsel");
});

// Ein Wisch, der auf dem Knopf beginnt, ist kein Tipp.
test("a swipe starting on the chevron does not switch anything", () => {
  const harness = createHarness();
  harness.start();

  harness.tapToggle({ moveBy: 40 });
  assert.equal(isVisible(harness), true, "gewischt heisst nicht getippt");
});

// Ganz nach oben gescrollt gehoeren die Pills hin. Zugemacht und dann komplett
// hochgescrollt standen sie vorher nicht da - man suchte oben einen Pfeil, um
// etwas zurueckzuholen, das dort sowieso hingehoert.
test("scrolling all the way back to the top brings the closed row back", () => {
  const harness = createHarness();
  harness.start();

  harness.clickToggle();
  assert.equal(isVisible(harness), false, "zugemacht");

  harness.scrollTo(900);
  assert.equal(isVisible(harness), false, "unterwegs bleibt sie weg");

  harness.scrollTo(0);
  assert.equal(isCollapsed(harness), false, "ganz oben ist sie wieder da");
  assert.equal(isVisible(harness), true);
});

// Aber am Seitenanfang zumachen darf nicht im selben Atemzug wieder aufgehen.
test("closing at the top stays closed", () => {
  const harness = createHarness();
  harness.start();

  harness.clickToggle();
  harness.settleOwnScroll();
  harness.runTimers();
  assert.equal(isVisible(harness), false, "zu bleibt zu");

  // Auch ein weiteres Scroll-Ereignis am Anfang aendert daran nichts.
  harness.scrollTo(0);
  assert.equal(isVisible(harness), false);
});

// Der Ausgleich muss die Zeilenhoehe exakt treffen. Krumm gerundet blieb bei
// jedem Tipp ein Bruchteil Pixel stehen und die Seite zuckte.
test("the row gets a whole pixel height so the compensation lands exactly", () => {
  const harness = createHarness();
  // So krumm ist sie im Browser wirklich.
  harness.tabsEl.height = 40.671875;
  harness.start();

  harness.scrollTo(1200);
  // Erst holt der Pfeil die weggescrollte Zeile ...
  harness.clickToggle();
  assert.equal(harness.tabsEl.style.height, "41px", "die Zeile bekommt eine ganze Hoehe");
  assert.equal(harness.windowObj.scrollY, 1200, "geholt wird ohne die Seite zu bewegen");

  // ... und der naechste Tipp nimmt sie weg, mit genauem Ausgleich.
  harness.clickToggle();
  assert.equal(harness.windowObj.scrollY, 1200 - 41, "der Ausgleich trifft die Hoehe genau");

  harness.clickToggle();
  assert.equal(harness.windowObj.scrollY, 1200, "und zurueck auf dieselbe Stelle");
});
