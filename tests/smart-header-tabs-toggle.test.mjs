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

// Nur so viel Umgebung, wie die Pill-Zeile im Header wirklich anfasst: eine
// Zeile mit Hoehe, der Pfeil daneben, ein Fenster mit Scroll-Position und eine
// Uhr, die der Test selbst stellt.
function createHarness({ rowHeight = TABS_ROW_HEIGHT } = {}) {
  const tabsEl = new FakeElement({ classes: ["smart-header-tabs", "smart-header-tabs--main"], height: rowHeight });
  const topEl = new FakeElement({ height: TOP_BAR_HEIGHT });
  const toggleEl = new FakeElement();
  const mainEl = new FakeElement();
  const styleValues = new Map();

  // Der Hauptbereich sitzt unter Leiste und Zeile. Die Zeile behaelt ihren
  // Platz immer - deshalb haengt seine Position an nichts als am Scroll.
  mainEl.getBoundingClientRect = () => ({
    top: TOP_BAR_HEIGHT + tabsEl.getBoundingClientRect().height - windowObj.scrollY,
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

  const frames = [];
  const timers = new Map();
  let nextTimerId = 1;
  let clock = 0;
  const winListeners = new Map();
  const windowObj = {
    scrollY: 0,
    // Ein Scroll ist nur eine Bitte an den Browser. Bleibt sie unbeantwortet -
    // gekappt oder von einem Re-Render zurueckgesetzt - bewegt sich nichts.
    scrollRequestsIgnored: false,
    performance: { now: () => clock },
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

  // Genau eine Runde Frames - so wie der Browser einen Frame zeichnet. Eine
  // Fahrt meldet sich darin fuer den naechsten an; ohne dass die Uhr laeuft,
  // waere ein "solange noch Frames da sind" endlos.
  function flushFrames() {
    frames.splice(0, frames.length).forEach((callback) => callback());
  }

  function flushTimers() {
    const pending = [...timers.entries()].sort((a, b) => a[1].delay - b[1].delay);
    timers.clear();
    pending.forEach(([, timer]) => timer.callback());
  }

  // Die Fahrt des Pfeils laeuft ueber die Uhr. Hier wird sie vorgestellt, statt
  // wirklich zu warten - bis nichts mehr nachkommt.
  function settle() {
    for (let round = 0; round < 60 && (frames.length || timers.size); round += 1) {
      clock += 40;
      flushFrames();
      flushTimers();
    }
  }

  // Ein Scroll des Nutzers: der faengt mit dem Finger an, deshalb erst die
  // Geste melden - eine laufende Fahrt des Pfeils laesst daraufhin los.
  function scrollTo(y) {
    fireWindow("pointerdown");
    windowObj.scrollY = Math.max(0, y);
    fireWindow("scroll");
    flushFrames();
  }

  // Ein Re-Render mitten in der Fahrt: der Render-Pfad setzt die
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

  function runTimers() {
    for (let round = 0; round < 10 && timers.size; round += 1) {
      flushTimers();
      flushFrames();
    }
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
    styleValues,
    start,
    tabsEl,
    mainEl,
    clickToggle,
    tapToggle,
    scrollTo,
    renderRestoresScroll,
    settleOwnScroll,
    settle,
    runTimers
  };
}

const isVisible = (harness) => harness.controller.isMainHeaderTabsRowVisible();
const isAway = (harness) => harness.documentObj.documentElement.classList.contains("smart-header-tabs-away");
const isStuck = (harness) => harness.documentObj.documentElement.classList.contains("smart-header-tabs-stuck");
const isTucked = (harness) => harness.documentObj.documentElement.classList.contains("smart-header-tabs-tucked");
const isSliding = (harness) => harness.documentObj.documentElement.classList.contains("smart-header-tabs-sliding");
// Der Platz der Zeile im Dokument - der Kern der ganzen Loesung. Er darf sich
// nie aendern, egal was Pfeil oder Scroll tun.
const layoutHeight = (harness) => harness.tabsEl.getBoundingClientRect().height;
const contentTop = (harness) => harness.mainEl.getBoundingClientRect().top;

// Beim Start stehen die Pills da - so wie im Bild des Nutzers.
test("the page starts with the pills in view", () => {
  const harness = createHarness();
  harness.start();

  assert.equal(isVisible(harness), true);
  assert.equal(isAway(harness), false);
  assert.equal(harness.windowObj.scrollY, 0);
  assert.equal(layoutHeight(harness), TABS_ROW_HEIGHT);
});

// Runterscrollen nimmt sie mit, hochscrollen bringt sie zurueck - beides macht
// der Browser allein, die Laufzeit schreibt dabei nur die Pfeilrichtung.
test("scrolling down hides the pills and scrolling back to the top shows them again", () => {
  const harness = createHarness();
  harness.start();

  harness.scrollTo(600);
  assert.equal(isVisible(harness), false);
  assert.equal(isAway(harness), true);

  harness.scrollTo(0);
  assert.equal(isVisible(harness), true);
  assert.equal(isAway(harness), false);
  assert.equal(isStuck(harness), false, "am Anfang klebt nichts");
});

// Der Kern: der Platz der Zeile im Dokument bleibt unter allen Umstaenden
// gleich. Genau daran ist die vorige Loesung zerbrochen - sie nahm die Zeile
// aus dem Layout, und alles darunter sprang um ihre Hoehe.
test("nothing in the document ever moves because of the chevron", () => {
  const harness = createHarness();
  harness.start();

  const hoeheAmAnfang = layoutHeight(harness);
  const abstandAmAnfang = contentTop(harness);

  // Oben zu, oben auf, unterwegs geholt, unterwegs losgelassen: die Zeile
  // behaelt ihre Hoehe, und der Inhalt haengt nur noch an der Scroll-Position.
  const proben = [];
  const probe = () => proben.push({
    hoehe: layoutHeight(harness),
    versatz: contentTop(harness) + harness.windowObj.scrollY
  });

  probe();
  harness.clickToggle();
  probe();
  harness.settle();
  probe();
  harness.scrollTo(900);
  harness.clickToggle();
  probe();
  harness.settle();
  probe();
  harness.clickToggle();
  probe();
  harness.settle();
  probe();
  harness.scrollTo(0);
  probe();

  proben.forEach(({ hoehe, versatz }, index) => {
    assert.equal(hoehe, hoeheAmAnfang, `Probe ${index}: dieselbe Zeilenhoehe`);
    assert.equal(versatz, abstandAmAnfang, `Probe ${index}: derselbe Abstand nach oben`);
  });
});

// Oben ist "zumachen" nichts anderes als Wegscrollen: die Seite faehrt um eine
// Zeilenhoehe, die Zeile bleibt im Layout stehen.
test("at the top the chevron scrolls the row away instead of removing it", () => {
  const harness = createHarness();
  harness.start();

  harness.clickToggle();
  // Der Pfeil dreht sofort, nicht erst am Ende der Fahrt.
  assert.equal(isAway(harness), true, "der Pfeil dreht sofort");
  harness.settle();

  assert.equal(harness.windowObj.scrollY, TABS_ROW_HEIGHT, "die Seite steht genau eine Zeilenhoehe tief");
  assert.equal(isVisible(harness), false);
  assert.equal(isStuck(harness), false, "es klebt nichts");
  assert.equal(layoutHeight(harness), TABS_ROW_HEIGHT, "die Zeile ist weiter im Layout");
  assert.equal(harness.tabsEl.style.height, undefined, "und bekommt keine Hoehe aufgezwungen");
});

// Und "aufmachen" nichts anderes als Hochscrollen.
test("at the top the chevron scrolls the row back in", () => {
  const harness = createHarness();
  harness.start();

  harness.clickToggle();
  harness.settle();
  assert.equal(harness.windowObj.scrollY, TABS_ROW_HEIGHT);

  harness.clickToggle();
  assert.equal(isAway(harness), false, "der Pfeil dreht sofort zurueck");
  harness.settle();

  assert.equal(harness.windowObj.scrollY, 0, "wieder am Anfang");
  assert.equal(isVisible(harness), true);
  assert.equal(isStuck(harness), false);
});

// DIE Beschwerde: mit dem Pfeil zugemacht und dann hochgescrollt. Weil oben kein
// Zustand zurueckbleibt, ist der Weg nach oben Bild fuer Bild derselbe wie ohne
// Pfeil - da kann nichts mehr schnappen.
test("closed with the chevron, scrolling back up is frame for frame the same as without it", () => {
  const mitPfeil = createHarness();
  mitPfeil.start();
  mitPfeil.clickToggle();
  mitPfeil.settle();

  const ohnePfeil = createHarness();
  ohnePfeil.start();
  ohnePfeil.scrollTo(TABS_ROW_HEIGHT);

  [900, 400, 120, 60, 30, 12, 4, 0].forEach((y) => {
    mitPfeil.scrollTo(y);
    ohnePfeil.scrollTo(y);
    assert.equal(mitPfeil.windowObj.scrollY, ohnePfeil.windowObj.scrollY, `bei ${y}: dieselbe Position`);
    assert.equal(isVisible(mitPfeil), isVisible(ohnePfeil), `bei ${y}: dasselbe Bild`);
    assert.equal(layoutHeight(mitPfeil), layoutHeight(ohnePfeil), `bei ${y}: dasselbe Layout`);
    assert.equal(contentTop(mitPfeil), contentTop(ohnePfeil), `bei ${y}: derselbe Abstand`);
  });
});

// Ganz oben gehoeren die Pills hin - egal was der Nutzer vorher mit dem Pfeil
// gemacht hat. Es gibt keinen Zustand, der das noch verhindern koennte.
test("the top always shows the pills, whatever the chevron did before", () => {
  const harness = createHarness();
  harness.start();

  // Oben zu, weit runter, mit dem Pfeil geholt, wieder losgelassen.
  harness.clickToggle();
  harness.settle();
  harness.scrollTo(1500);
  harness.clickToggle();
  harness.settle();
  harness.clickToggle();
  harness.settle();
  harness.scrollTo(800);

  harness.scrollTo(0);
  assert.equal(isVisible(harness), true, "am Anfang sind sie da");
  assert.equal(isStuck(harness), false);
  assert.equal(isTucked(harness), false);
  assert.equal(isSliding(harness), false, "und es faehrt nichts mehr");
});

// Zehnmal getippt ist zehnmal dasselbe - kein Zustand, der sich aufschaukelt.
test("the chevron stays a plain switch, tap after tap", () => {
  const harness = createHarness();
  harness.start();

  for (let round = 0; round < 5; round += 1) {
    harness.clickToggle();
    harness.settle();
    assert.equal(isVisible(harness), false, `Runde ${round}: zu`);
    assert.equal(harness.windowObj.scrollY, TABS_ROW_HEIGHT, `Runde ${round}: eine Zeilenhoehe tief`);

    harness.clickToggle();
    harness.settle();
    assert.equal(isVisible(harness), true, `Runde ${round}: auf`);
    assert.equal(harness.windowObj.scrollY, 0, `Runde ${round}: wieder am Anfang`);
  }
});

// Ein Re-Render setzt die Scroll-Position auf den gemerkten Wert zurueck. Die
// Fahrt schreibt jeden Frame - wer zuletzt schreibt, gewinnt.
test("a re-render restoring the scroll cannot break the chevron", () => {
  const harness = createHarness();
  harness.start();

  harness.clickToggle();
  harness.renderRestoresScroll(0);
  harness.settle();
  assert.equal(harness.windowObj.scrollY, TABS_ROW_HEIGHT, "die Fahrt setzt sich durch");
  assert.equal(isVisible(harness), false, "zu bleibt zu");

  harness.clickToggle();
  harness.renderRestoresScroll(TABS_ROW_HEIGHT);
  harness.settle();
  assert.equal(harness.windowObj.scrollY, 0);
  assert.equal(isVisible(harness), true, "auf bleibt auf");
});

// Der Finger hat Vorrang: faengt der Nutzer waehrend der Fahrt selbst an zu
// scrollen, laesst der Pfeil sein Ziel sofort los.
test("a finger on the glass stops the chevron mid-flight", () => {
  const harness = createHarness();
  harness.start();

  harness.clickToggle();
  harness.scrollTo(300);
  harness.settle();

  assert.equal(harness.windowObj.scrollY, 300, "die Hand des Nutzers gewinnt");
  assert.equal(isVisible(harness), false);
});

// Weiter unten ist die Zeile ohnehin weggescrollt. Dort heftet der Pfeil sie
// unter die Leiste - ohne die Seite oder das Layout anzufassen.
test("further down the chevron pins the row under the top bar without moving the page", () => {
  const harness = createHarness();
  harness.start();

  harness.scrollTo(600);
  assert.equal(isVisible(harness), false);

  harness.clickToggle();
  assert.equal(isStuck(harness), true);
  assert.equal(isVisible(harness), true);
  assert.equal(harness.windowObj.scrollY, 600, "die Leseposition bleibt stehen");
  harness.settle();
  assert.equal(harness.windowObj.scrollY, 600, "auch nach der Fahrt");
  assert.equal(isTucked(harness), false, "sie ist ganz hervorgefahren");

  harness.clickToggle();
  assert.equal(isVisible(harness), false, "der Pfeil dreht sofort");
  assert.equal(isTucked(harness), true, "sie faehrt hinter die Leiste");
  harness.settle();
  assert.equal(isStuck(harness), false, "danach klebt nichts mehr");
  assert.equal(isTucked(harness), false);
  assert.equal(harness.windowObj.scrollY, 600, "und die Leseposition steht immer noch");
});

// Herein und hinaus faehrt sie - ein Sprung um ihre ganze Hoehe in einem Bild
// saehe daneben hart aus.
test("the pinned row glides in and out instead of blinking", () => {
  const harness = createHarness();
  harness.start();
  harness.scrollTo(900);

  harness.clickToggle();
  assert.equal(isSliding(harness), true, "sie faehrt hervor");
  harness.settle();
  assert.equal(isSliding(harness), false, "nach der Fahrt liegt kein Uebergang mehr an");

  harness.clickToggle();
  assert.equal(isSliding(harness), true, "und wieder zurueck");
  harness.settle();
  assert.equal(isSliding(harness), false);
});

// Weitergescrollt laesst die geholte Zeile wieder los - sonst haette man
// dauerhaft eine zweite Leiste im Bild.
test("scrolling on releases the row that the chevron brought back", () => {
  const harness = createHarness();
  harness.start();

  harness.scrollTo(600);
  harness.clickToggle();
  harness.settle();
  assert.equal(isStuck(harness), true);

  harness.scrollTo(660);
  assert.equal(isVisible(harness), false, "sie faehrt sofort hinter die Leiste");
  harness.settle();
  assert.equal(isStuck(harness), false);
});

// Am Seitenanfang deckt sich der geheftete Platz mit dem normalen: dort hoert
// das Kleben still auf, ohne dass sich etwas bewegt.
test("coming back to the top quietly releases the pinned row", () => {
  const harness = createHarness();
  harness.start();

  harness.scrollTo(600);
  harness.clickToggle();
  harness.settle();
  assert.equal(isStuck(harness), true);

  harness.scrollTo(0);
  assert.equal(isStuck(harness), false, "am Anfang klebt nichts");
  assert.equal(isTucked(harness), false);
  assert.equal(isVisible(harness), true, "und die Pills stehen an ihrem Platz");
  assert.equal(harness.windowObj.scrollY, 0, "die Seite wurde dabei nicht angefasst");
});

// Auf dem halben Weg nach oben bleibt die geholte Zeile stehen - erst am Anfang
// gibt sie das Kleben auf, und dort deckt sich beides ohnehin.
test("the pinned row survives the way up until the very top", () => {
  const harness = createHarness();
  harness.start();

  harness.scrollTo(1200);
  harness.clickToggle();
  harness.settle();

  [800, 400, 120, 30].forEach((y) => {
    harness.scrollTo(y);
    assert.equal(isVisible(harness), true, `bei ${y}: sie bleibt zu sehen`);
    assert.equal(isStuck(harness), true, `bei ${y}: und bleibt geheftet`);
  });

  harness.scrollTo(0);
  assert.equal(isStuck(harness), false);
  assert.equal(isVisible(harness), true);
});

// Auch wenn der Browser gar nicht scrollt, schaltet der Pfeil weiter unten - dort
// haengt nichts an einer Scroll-Position.
test("the chevron switches even when the browser refuses to scroll", () => {
  const harness = createHarness();
  harness.start();
  harness.scrollTo(700);
  harness.windowObj.scrollRequestsIgnored = true;

  harness.clickToggle();
  assert.equal(isVisible(harness), true);
  harness.settle();
  harness.clickToggle();
  assert.equal(isVisible(harness), false);
});

// Der Zustand liegt im Modul, nicht im HTML: ein Re-Render baut die Kopfzeile
// neu und die geholte Zeile muss trotzdem stehen bleiben.
test("the pinned state survives a re-render of the header", () => {
  const harness = createHarness();
  harness.start();

  harness.scrollTo(900);
  harness.clickToggle();
  harness.settle();
  assert.equal(isStuck(harness), true);

  harness.documentObj.documentElement.classList.remove("smart-header-tabs-stuck");
  harness.start();

  assert.equal(isStuck(harness), true, "nach dem Re-Render wieder geheftet");
  assert.equal(isVisible(harness), true);
});

// Die Zeilenhoehe ist der Massstab fuer beide Bewegungen - sie muss als ganze
// Pixelzahl herauskommen. Krumm gerundet blieb ein Streifen unter der Leiste
// stehen.
test("the row height is measured up to a whole pixel", () => {
  const harness = createHarness({ rowHeight: 40.671875 });
  harness.start();

  assert.equal(harness.styleValues.get("--smart-header-tabs-row-height"), "41px");

  harness.clickToggle();
  harness.settle();
  assert.equal(harness.windowObj.scrollY, 41, "die Fahrt bringt die Zeile ganz hinter die Leiste");
  assert.equal(isVisible(harness), false);
});

// Der Finger zaehlt beim Loslassen - nicht erst beim Klick, den iOS nach dem
// Scrollen gern verspaetet oder gar nicht schickt.
test("the chevron reacts on the finger lifting, and only once", () => {
  const harness = createHarness();
  harness.start();

  // Ohne nachfolgenden Klick - genau der Fall, in dem der Knopf vorher stumm
  // blieb.
  harness.tapToggle({ withClick: false });
  harness.settle();
  assert.equal(isVisible(harness), false, "das Loslassen allein schaltet schon");

  // Und mit Klick zaehlt der Tipp trotzdem nur einmal.
  harness.tapToggle();
  harness.settle();
  assert.equal(isVisible(harness), true, "ein Tipp, ein Wechsel");
  assert.equal(harness.windowObj.scrollY, 0);
});

// Ein Wisch, der auf dem Knopf beginnt, ist kein Tipp.
test("a swipe starting on the chevron does not switch anything", () => {
  const harness = createHarness();
  harness.start();

  harness.tapToggle({ moveBy: 40 });
  harness.settle();
  assert.equal(isVisible(harness), true, "gewischt heisst nicht getippt");
  assert.equal(harness.windowObj.scrollY, 0);
});

// Der eigene Scroll des Pfeils ist keine Geste - sonst naehme er sich die Zeile
// im selben Atemzug wieder weg, und jeder zweite Tipp taete nichts.
test("the chevron's own scroll is not read as a swipe", () => {
  const harness = createHarness();
  harness.start();
  harness.scrollTo(1200);

  for (let round = 0; round < 4; round += 1) {
    harness.clickToggle();
    harness.settleOwnScroll();
    harness.settle();
    assert.equal(isVisible(harness), true, `Runde ${round}: der Tipp holt die Zeile`);
    assert.equal(isStuck(harness), true, `Runde ${round}: und sie bleibt auch da`);

    harness.clickToggle();
    harness.settleOwnScroll();
    harness.settle();
    assert.equal(isVisible(harness), false, `Runde ${round}: der naechste Tipp nimmt sie weg`);
  }
});
