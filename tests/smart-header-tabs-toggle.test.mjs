import assert from "node:assert/strict";
import test from "node:test";
import { createAppShellRuntimeController } from "../apps/menyra-social/core/app-shell/app-shell-runtime-controller.js";

const TABS_ROW_HEIGHT = 40;
const TOP_BAR_HEIGHT = 72;

class FakeClassList {
  constructor(initial = []) {
    this.values = new Set(initial);
    // Jede Schaltung mitschreiben: beim schnellen Auf und Zu kommt es darauf
    // an, was zwischendurch passiert - nicht nur, was am Ende dasteht.
    this.log = [];
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
    if (next !== this.values.has(name)) this.log.push([name, next]);
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

  // Die Geometrie wie im Browser - die Laufzeit MISST sie, sie rechnet nicht
  // mit der Scroll-Position.
  //
  // Die obere Leiste klebt bei 0 und ist immer gleich hoch.
  topEl.getBoundingClientRect = () => ({ top: 0, bottom: TOP_BAR_HEIGHT, height: TOP_BAR_HEIGHT });
  // Die Zeile sitzt im Fluss direkt darunter und scrollt hinter sie weg.
  // Geheftet klebt sie 1px hoeher als die Unterkante der Leiste; eingesteckt
  // steht sie um ihre eigene Hoehe weiter oben, also ganz dahinter.
  // Mitten in der Fahrt steht die geheftete Zeile irgendwo dazwischen. Genau
  // dort darf ein Tipp nicht den Zwischenstand ablesen.
  let fahrtStand = null;
  tabsEl.getBoundingClientRect = () => {
    const hoehe = tabsEl.height;
    const klassen = documentObj.documentElement.classList;
    const geheftet = klassen.contains("smart-header-tabs-stuck");
    const eingesteckt = klassen.contains("smart-header-tabs-tucked");
    const zu = klassen.contains("smart-header-tabs-closed");
    const heraus = fahrtStand === null ? ((eingesteckt || zu) ? 0 : 1) : fahrtStand;
    const top = geheftet
      ? TOP_BAR_HEIGHT - 1 - hoehe * (1 - heraus)
      // Im Fluss: an ihrem Platz, minus dem Versatz des zugemachten Zustands.
      : TOP_BAR_HEIGHT - windowObj.scrollY - hoehe * (1 - heraus);
    return { top, bottom: top + hoehe, height: hoehe };
  };
  // Der Hauptbereich sitzt unter Leiste und Zeile. Die Zeile behaelt ihren
  // Platz immer - deshalb haengt seine Position an nichts als am Scroll.
  mainEl.getBoundingClientRect = () => ({
    top: TOP_BAR_HEIGHT + tabsEl.height - windowObj.scrollY,
    height: 4000
  });

  const documentObj = {
    documentElement: {
      classList: new FakeClassList(),
      style: {
        // Wie in jedem heutigen Browser: die Laufzeit erkennt daran, dass sie
        // die Fahrt dem Browser ueberlassen kann.
        scrollBehavior: "",
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
    // Jede Scroll-Bitte mitschreiben: die Fahrt soll der Browser machen, nicht
    // die Laufzeit Bild fuer Bild.
    scrollCalls: [],
    // Beide Formen wie im Browser: scrollTo(x, y) und scrollTo({ top }).
    scrollTo(first, second) {
      const y = first && typeof first === "object" ? first.top : second;
      const behavior = first && typeof first === "object" ? String(first.behavior || "auto") : "auto";
      this.scrollCalls.push({ top: Math.max(0, Number(y) || 0), behavior });
      if (this.scrollRequestsIgnored) return;
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
  }

  // Wie weit die geheftete Zeile gerade hervorgefahren ist: 0 = ganz hinter der
  // Leiste, 1 = ganz da, null = am Ziel (was die Klassen sagen).
  function setFahrtStand(wert) {
    fahrtStand = wert;
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
    runTimers,
    setFahrtStand
  };
}

const isVisible = (harness) => harness.controller.isMainHeaderTabsRowVisible();
const isAway = (harness) => harness.documentObj.documentElement.classList.contains("smart-header-tabs-away");
const isStuck = (harness) => harness.documentObj.documentElement.classList.contains("smart-header-tabs-stuck");
const isTucked = (harness) => harness.documentObj.documentElement.classList.contains("smart-header-tabs-tucked");
const isClosed = (harness) => harness.documentObj.documentElement.classList.contains("smart-header-tabs-closed");
const isSliding = (harness) => harness.documentObj.documentElement.classList.contains("smart-header-tabs-sliding");
// Der Platz der Zeile im Dokument - der Kern der ganzen Loesung. Er darf sich
// nie aendern, egal was Pfeil oder Scroll tun.
const layoutHeight = (harness) => harness.tabsEl.height;
const contentTop = (harness) => harness.mainEl.getBoundingClientRect().top;
// Wie weit die Zeile unter der Leiste hervorschaut - genau das, was der Nutzer
// sieht.
const sichtbarePx = (harness) => Math.max(
  0,
  harness.tabsEl.getBoundingClientRect().bottom - TOP_BAR_HEIGHT
);
// Geheftet klebt die Zeile bewusst 1px hoeher als die Unterkante der Leiste,
// damit an der Naht kein Content durchblitzt - dann schaut genau 1px weniger
// hervor. Sichtbar ist das nicht, gemessen schon.
const istGanzDa = (harness) => sichtbarePx(harness) >= TABS_ROW_HEIGHT - 1;

// Beim Start stehen die Pills da - so wie auf dem Bild des Nutzers.
test("the page starts with the pills in view", () => {
  const harness = createHarness();
  harness.start();

  assert.equal(isVisible(harness), true);
  assert.equal(isAway(harness), false);
  assert.equal(harness.windowObj.scrollY, 0);
  assert.equal(sichtbarePx(harness), TABS_ROW_HEIGHT);
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

// DIE Vorgabe: der Pfeil bewegt nur die Zeile. Die Seite bleibt stehen, der
// Abstand bleibt derselbe, das Layout ruehrt sich nicht.
test("the chevron moves the row alone - the page never scrolls", () => {
  const harness = createHarness();
  harness.start();

  const abstandAmAnfang = contentTop(harness);
  const hoeheAmAnfang = layoutHeight(harness);

  harness.clickToggle();
  assert.equal(isClosed(harness), true, "die Zeile faehrt hinter die Leiste");
  assert.equal(isAway(harness), true, "der Pfeil dreht sofort");
  harness.settle();

  assert.equal(harness.windowObj.scrollY, 0, "die Seite steht still");
  assert.equal(harness.windowObj.scrollCalls.length, 0, "es wird gar nicht gescrollt");
  assert.equal(contentTop(harness), abstandAmAnfang, "der Abstand bleibt derselbe");
  assert.equal(layoutHeight(harness), hoeheAmAnfang, "die Zeile behaelt ihre Hoehe");
  assert.equal(sichtbarePx(harness), 0, "zu sehen ist sie nicht mehr");
  assert.equal(isVisible(harness), false);

  harness.clickToggle();
  harness.settle();
  assert.equal(isClosed(harness), false);
  assert.equal(sichtbarePx(harness), TABS_ROW_HEIGHT, "und faehrt wieder hervor");
  assert.equal(harness.windowObj.scrollY, 0, "die Seite steht immer noch");
  assert.equal(harness.windowObj.scrollCalls.length, 0);
  assert.equal(contentTop(harness), abstandAmAnfang);
});

// Genau die Beschwerde: zumachen, aufmachen - und die Zeile war weg oder blieb
// unter dem Header. Zehn Runden, jedes Mal richtig.
test("closing and reopening at the top works, round after round", () => {
  const harness = createHarness();
  harness.start();

  for (let runde = 0; runde < 10; runde += 1) {
    harness.clickToggle();
    harness.settle();
    assert.equal(sichtbarePx(harness), 0, `Runde ${runde}: zu`);
    assert.equal(isVisible(harness), false, `Runde ${runde}: zu`);

    harness.clickToggle();
    harness.settle();
    assert.equal(sichtbarePx(harness), TABS_ROW_HEIGHT, `Runde ${runde}: wieder ganz da`);
    assert.equal(isVisible(harness), true, `Runde ${runde}: auf`);
    assert.equal(harness.windowObj.scrollY, 0, `Runde ${runde}: die Seite steht`);
  }
});

// Auch mit krummer Zeilenhoehe - die Laufzeit misst, sie rechnet nicht.
test("a fractional row height changes nothing about opening and closing", () => {
  const harness = createHarness({ rowHeight: 40.671875 });
  harness.start();

  for (let runde = 0; runde < 4; runde += 1) {
    harness.clickToggle();
    harness.settle();
    assert.equal(isVisible(harness), false, `Runde ${runde}: zu`);
    harness.clickToggle();
    harness.settle();
    assert.equal(isVisible(harness), true, `Runde ${runde}: auf`);
  }
  // Nur die Fahrstrecke wird gerundet - sie endet ohnehin hinter der Leiste.
  assert.equal(harness.styleValues.get("--smart-header-tabs-row-height"), "41px");
});

// Zugemacht bleibt zugemacht. Der Versatz ist auf jeder Scroll-Position
// derselbe, also liegt die Zeile oben wie unterwegs hinter der Leiste - und nur
// der Pfeil holt sie zurueck.
test("a row the user closed stays closed until the user opens it", () => {
  const harness = createHarness();
  harness.start();

  harness.clickToggle();
  harness.settle();
  assert.equal(isClosed(harness), true);

  [200, 900, 1500, 400, 60, 12, 0].forEach((y) => {
    harness.scrollTo(y);
    assert.equal(isClosed(harness), true, `bei ${y}: bleibt zu`);
    assert.equal(sichtbarePx(harness), 0, `bei ${y}: und ist nicht zu sehen`);
  });

  harness.clickToggle();
  harness.settle();
  assert.equal(isClosed(harness), false, "erst der Pfeil holt sie zurueck");
  assert.equal(sichtbarePx(harness), TABS_ROW_HEIGHT);
});

// Offen laesst der Scroll sie kommen und gehen - ganz ohne Zutun der Laufzeit.
test("an open row follows the scroll, pixel for pixel", () => {
  const harness = createHarness();
  harness.start();

  [0, 6, 12, 20, 30, 40, 200].forEach((y) => {
    harness.scrollTo(y);
    assert.equal(
      sichtbarePx(harness),
      Math.max(0, TABS_ROW_HEIGHT - y),
      `bei ${y}: genau so viel schaut hervor`
    );
  });
});

// Der Platz der Zeile im Dokument bleibt unter allen Umstaenden gleich.
test("nothing in the document ever moves", () => {
  const harness = createHarness();
  harness.start();

  const abstand = contentTop(harness);
  const proben = [];
  const probe = () => proben.push(contentTop(harness) + harness.windowObj.scrollY);

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

  proben.forEach((versatz, index) => {
    assert.equal(versatz, abstand, `Probe ${index}: derselbe Abstand nach oben`);
  });
});

// Die Laufzeit fasst die Scroll-Position nie an - weder beim Start noch beim
// Schalten. Genau dieses Zerren hat sich beim Neuladen mit der
// Scroll-Wiederherstellung gestritten, und die Seite sprang.
test("the runtime never touches the scroll position", () => {
  const harness = createHarness();
  harness.windowObj.scrollY = 600;
  harness.start();

  assert.equal(harness.windowObj.scrollY, 600, "die wiederhergestellte Position bleibt");
  assert.equal(isVisible(harness), false, "dort gehoeren die Pills auch nicht hin");

  harness.clickToggle();
  harness.settle();
  harness.clickToggle();
  harness.settle();
  harness.scrollTo(300);
  harness.scrollTo(0);
  harness.clickToggle();
  harness.settle();

  assert.equal(harness.windowObj.scrollCalls.length, 0, "kein einziger eigener Scroll");
});

// Frisch geladen steht die Seite am Anfang - dort sind die Pills zu sehen, ohne
// dass jemand nachhelfen muesste.
test("a fresh load starts with the pills in view, without any scrolling", () => {
  const harness = createHarness();
  harness.start();

  assert.equal(harness.windowObj.scrollY, 0);
  assert.equal(harness.windowObj.scrollCalls.length, 0);
  assert.equal(isVisible(harness), true);
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
  assert.equal(istGanzDa(harness), true, "sie ist ganz hervorgefahren");
  assert.equal(harness.windowObj.scrollY, 600);

  harness.clickToggle();
  assert.equal(isVisible(harness), false, "der Pfeil dreht sofort");
  assert.equal(isTucked(harness), true, "sie faehrt hinter die Leiste");
  harness.settle();
  assert.equal(isStuck(harness), false, "danach klebt nichts mehr");
  assert.equal(isTucked(harness), false);
  assert.equal(harness.windowObj.scrollY, 600, "und die Leseposition steht immer noch");
});

// Weiter unten geholt hebt ein frueheres "zu" auf: der Nutzer will die Pills
// jetzt ausdruecklich sehen.
test("pinning further down clears an earlier close", () => {
  const harness = createHarness();
  harness.start();

  harness.clickToggle();
  harness.settle();
  assert.equal(isClosed(harness), true);

  harness.scrollTo(900);
  harness.clickToggle();
  harness.settle();
  assert.equal(isClosed(harness), false, "das alte Zu ist aufgehoben");
  assert.equal(isStuck(harness), true);
  assert.equal(istGanzDa(harness), true);
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

// Oben faehrt sie ebenso - nicht springen.
test("closing at the top glides as well", () => {
  const harness = createHarness();
  harness.start();

  harness.clickToggle();
  assert.equal(isSliding(harness), true, "der Uebergang liegt an, bevor der Zustand wechselt");
  assert.equal(isClosed(harness), true);
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
  assert.equal(sichtbarePx(harness), TABS_ROW_HEIGHT, "und die Pills stehen wieder an ihrem normalen Platz");
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

// Der Zustand liegt im Modul, nicht im HTML: ein Re-Render baut die Kopfzeile
// neu und beide Zustaende muessen ihn ueberleben.
test("both states survive a re-render of the header", () => {
  const harness = createHarness();
  harness.start();

  harness.clickToggle();
  harness.settle();
  assert.equal(isClosed(harness), true);

  harness.documentObj.documentElement.classList.remove("smart-header-tabs-closed");
  harness.start();
  assert.equal(isClosed(harness), true, "nach dem Re-Render wieder zu");
  assert.equal(isSliding(harness), false, "und ohne Uebergang - ein Re-Render ist keine Bewegung");

  harness.scrollTo(900);
  harness.clickToggle();
  harness.settle();
  assert.equal(isStuck(harness), true);

  harness.documentObj.documentElement.classList.remove("smart-header-tabs-stuck");
  harness.start();
  assert.equal(isStuck(harness), true, "geheftet bleibt geheftet");
  assert.equal(isVisible(harness), true);
});

// Ein Tipp mitten in der Fahrt muss sie umdrehen. Gemessen wird sonst der
// Zwischenstand - die halb hervorgefahrene Zeile gilt dann als "zu sehen", der
// Tipp macht sie ein zweites Mal zu, und sichtbar tut er nichts.
test("a tap in mid-glide reverses it instead of reading its middle", () => {
  const harness = createHarness();
  harness.start();
  harness.scrollTo(900);

  harness.clickToggle();
  assert.equal(isTucked(harness), false, "sie faehrt hervor");
  harness.setFahrtStand(0.25);
  harness.clickToggle();
  assert.equal(isTucked(harness), true, "der Tipp dreht sie um, statt sie erneut zuzumachen");
  assert.equal(isVisible(harness), false);

  harness.setFahrtStand(0.7);
  harness.clickToggle();
  assert.equal(isTucked(harness), false, "und wieder hervor");
  assert.equal(isVisible(harness), true);

  harness.setFahrtStand(null);
  harness.settle();
  assert.equal(isVisible(harness), true);
  assert.equal(isStuck(harness), true);
});

// Schnell hin und her getippt darf die Zeile nicht erst hart hinter die Leiste
// springen und von dort neu anfahren - der Uebergang bleibt liegen und rechnet
// von der Stelle weiter, an der sie gerade steht.
test("tapping back and forth reverses the glide instead of restarting it", () => {
  const harness = createHarness();
  harness.start();
  harness.scrollTo(900);

  harness.clickToggle();
  harness.settle();
  assert.equal(isStuck(harness), true);

  harness.clickToggle();
  assert.equal(isSliding(harness), true);
  const log = harness.documentObj.documentElement.classList.log;
  log.length = 0;
  harness.clickToggle();

  assert.equal(
    log.some(([name, next]) => name === "smart-header-tabs-sliding" && next === false),
    false,
    "der Uebergang wird nicht abgeschaltet"
  );
  assert.equal(
    log.some(([name, next]) => name === "smart-header-tabs-stuck" && next === false),
    false,
    "und das Kleben auch nicht"
  );
  assert.equal(isTucked(harness), false, "sie faehrt sofort wieder hervor");

  harness.settle();
  assert.equal(isVisible(harness), true);
  assert.equal(isSliding(harness), false);
});

// Von aussen dagegen muss sie erst still hinter die Leiste gestellt werden,
// sonst faengt die Fahrt beim Ziel an und ist nicht zu sehen.
test("a fresh glide starts from behind the top bar, without a transition", () => {
  const harness = createHarness();
  harness.start();
  harness.scrollTo(900);

  const log = harness.documentObj.documentElement.classList.log;
  log.length = 0;
  harness.clickToggle();

  const folge = log.filter(([name]) => name === "smart-header-tabs-sliding" || name === "smart-header-tabs-tucked");
  assert.deepEqual(folge, [
    ["smart-header-tabs-tucked", true],
    ["smart-header-tabs-sliding", true],
    ["smart-header-tabs-tucked", false]
  ], "erst still eingesteckt, dann mit Uebergang hervor");
});

// Der Finger zaehlt beim Loslassen - nicht erst beim Klick, den iOS nach dem
// Scrollen gern verspaetet oder gar nicht schickt.
test("the chevron reacts on the finger lifting, and only once", () => {
  const harness = createHarness();
  harness.start();

  harness.tapToggle({ withClick: false });
  harness.settle();
  assert.equal(isVisible(harness), false, "das Loslassen allein schaltet schon");

  harness.tapToggle();
  harness.settle();
  assert.equal(isVisible(harness), true, "ein Tipp, ein Wechsel");
});

// Ein Wisch, der auf dem Knopf beginnt, ist kein Tipp.
test("a swipe starting on the chevron does not switch anything", () => {
  const harness = createHarness();
  harness.start();

  harness.tapToggle({ moveBy: 40 });
  harness.settle();
  assert.equal(isVisible(harness), true, "gewischt heisst nicht getippt");
});