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
  // Jedes Schreiben am <html> - auch das mit unveraendertem Wert. Im Browser
  // schreibt setProperty das style-Attribut jedes Mal neu, und daran haengt ein
  // MutationObserver, der Safari seine eigene Leiste neu einfaerben laesst.
  const styleWrites = [];

  // Jedes Ablesen der Geometrie wird mitgezaehlt: im Browser erzwingt es ein
  // Layout des ganzen Dokuments, und beim Scrollen ist genau das zu teuer.
  const rectReads = [];

  // Die Geometrie wie im Browser.
  //
  // Die obere Leiste klebt bei 0 und ist immer gleich hoch.
  topEl.getBoundingClientRect = () => {
    rectReads.push("top");
    return { top: 0, bottom: TOP_BAR_HEIGHT, height: TOP_BAR_HEIGHT };
  };
  // Die Zeile sitzt im Fluss direkt darunter und scrollt hinter sie weg.
  // Geheftet klebt sie 1px hoeher als die Unterkante der Leiste; eingesteckt
  // steht sie um ihre eigene Hoehe weiter oben, also ganz dahinter.
  // Mitten in der Fahrt steht die geheftete Zeile irgendwo dazwischen. Genau
  // dort darf ein Tipp nicht den Zwischenstand ablesen.
  let fahrtStand = null;
  tabsEl.getBoundingClientRect = () => {
    rectReads.push("tabs");
    const hoehe = tabsEl.height;
    const klassen = documentObj.documentElement.classList;
    const geheftet = klassen.contains("smart-header-tabs-stuck");
    const eingesteckt = klassen.contains("smart-header-tabs-tucked");
    const heraus = fahrtStand === null ? (eingesteckt ? 0 : 1) : fahrtStand;
    const top = geheftet
      ? TOP_BAR_HEIGHT - 1 - hoehe * (1 - heraus)
      : TOP_BAR_HEIGHT - windowObj.scrollY;
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
        setProperty: (name, value) => {
          styleWrites.push([name, String(value)]);
          styleValues.set(name, String(value));
        },
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
  // Auf iOS meldet sich visualViewport mitten im Scrollen, sobald die
  // Adressleiste einfaehrt. Hier steht es nur da, damit sichtbar wird, wenn
  // sich jemand daran haengt.
  const viewportListeners = new Map();
  const windowObj = {
    scrollY: 0,
    visualViewport: {
      height: 800,
      addEventListener(type, handler) {
        if (!viewportListeners.has(type)) viewportListeners.set(type, []);
        viewportListeners.get(type).push(handler);
      },
      removeEventListener(type, handler) {
        const list = viewportListeners.get(type) || [];
        const index = list.indexOf(handler);
        if (index > -1) list.splice(index, 1);
      }
    },
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

  // Woran die Laufzeit haengt, und was sie das Zeichnen kostet.
  const boundWindowEvents = () => [...winListeners.entries()]
    .filter(([, handlers]) => handlers.length > 0)
    .map(([type]) => type)
    .sort();
  const boundViewportEvents = () => [...viewportListeners.entries()]
    .filter(([, handlers]) => handlers.length > 0)
    .map(([type]) => type)
    .sort();

  return {
    controller,
    documentObj,
    windowObj,
    styleValues,
    styleWrites,
    rectReads,
    boundWindowEvents,
    boundViewportEvents,
    fireWindow,
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
const isSliding = (harness) => harness.documentObj.documentElement.classList.contains("smart-header-tabs-sliding");
// Ob es den Pfeil ueberhaupt gibt: nur wenn der Platz der Zeile weggescrollt
// ist, hat er etwas zu tun.
const gibtEsDenPfeil = (harness) => harness.documentObj.documentElement.classList.contains("smart-header-tabs-offscreen");
// Der Platz der Zeile im Dokument - der Kern der ganzen Loesung. Er darf sich
// nie aendern, egal was Pfeil oder Scroll tun.
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

// Beim Start stehen die Pills da - und der Pfeil ist nicht da.
test("the page starts with the pills in view and no chevron", () => {
  const harness = createHarness();
  harness.start();

  assert.equal(sichtbarePx(harness), TABS_ROW_HEIGHT);
  assert.equal(isVisible(harness), true);
  assert.equal(isAway(harness), false);
  assert.equal(gibtEsDenPfeil(harness), false, "oben hat er nichts zu tun");
  assert.equal(harness.windowObj.scrollY, 0);
});

// DIE Vorgabe: der Pfeil erscheint erst, wenn der Platz der Zeile weggescrollt
// ist - und verschwindet wieder, sobald man oben ankommt.
test("the chevron appears only once the row's place has scrolled away", () => {
  const harness = createHarness();
  harness.start();

  // Solange auch nur ein Stueck der Zeile an ihrem Platz steht, bleibt er weg.
  [0, 10, 20, 30, 37].forEach((y) => {
    harness.scrollTo(y);
    assert.equal(gibtEsDenPfeil(harness), false, `bei ${y}: noch nicht`);
  });

  harness.scrollTo(TABS_ROW_HEIGHT);
  assert.equal(gibtEsDenPfeil(harness), true, "weggescrollt ist er da");
  harness.scrollTo(900);
  assert.equal(gibtEsDenPfeil(harness), true);

  harness.scrollTo(0);
  assert.equal(gibtEsDenPfeil(harness), false, "und oben wieder weg");
  assert.equal(sichtbarePx(harness), TABS_ROW_HEIGHT, "die Pills sind dafuer da");
});

// Geholt bleibt er greifbar - sonst koennte man die Zeile nicht wegraeumen.
test("the chevron stays while the row is pinned", () => {
  const harness = createHarness();
  harness.start();
  harness.scrollTo(900);

  harness.clickToggle();
  harness.settle();
  assert.equal(isStuck(harness), true);
  assert.equal(gibtEsDenPfeil(harness), true, "geholt bleibt er greifbar");

  harness.clickToggle();
  harness.settle();
  assert.equal(gibtEsDenPfeil(harness), true, "und danach auch");
});

// Oben zeigt ein Tipp keine Wirkung - dort gibt es den Knopf ohnehin nicht, und
// eine Zeile, die der Nutzer nicht zurueckholen koennte, waere eine Falle.
test("a tap that slips through at the top does nothing", () => {
  const harness = createHarness();
  harness.start();

  const abstand = contentTop(harness);
  harness.clickToggle();
  harness.settle();

  assert.equal(sichtbarePx(harness), TABS_ROW_HEIGHT, "die Pills stehen weiter da");
  assert.equal(isStuck(harness), false);
  assert.equal(isSliding(harness), false);
  assert.equal(harness.windowObj.scrollY, 0);
  assert.equal(contentTop(harness), abstand);
});

// Runterscrollen nimmt die Pills mit, hochscrollen bringt sie zurueck - beides
// macht der Browser allein.
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

// Offen folgt die Zeile dem Scroll Pixel fuer Pixel - ganz ohne Zutun.
test("the row follows the scroll, pixel for pixel", () => {
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

// Weiter unten ist die Zeile weggescrollt. Dort holt der Pfeil sie unter die
// Leiste - ohne die Seite oder das Layout anzufassen.
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

// Auch mit krummer Zeilenhoehe - die Laufzeit misst, sie rechnet nicht.
test("a fractional row height changes nothing about fetching and releasing", () => {
  const harness = createHarness({ rowHeight: 40.671875 });
  harness.start();
  harness.scrollTo(900);

  for (let runde = 0; runde < 4; runde += 1) {
    harness.clickToggle();
    harness.settle();
    assert.equal(isVisible(harness), true, `Runde ${runde}: geholt`);
    harness.clickToggle();
    harness.settle();
    assert.equal(isVisible(harness), false, `Runde ${runde}: losgelassen`);
  }
  // Nur die Fahrstrecke wird gerundet - sie endet ohnehin hinter der Leiste.
  assert.equal(harness.styleValues.get("--smart-header-tabs-row-height"), "41px");
});

// Der Platz der Zeile im Dokument bleibt unter allen Umstaenden gleich.
test("nothing in the document ever moves", () => {
  const harness = createHarness();
  harness.start();

  const abstand = contentTop(harness);
  const proben = [];
  const probe = () => proben.push(contentTop(harness) + harness.windowObj.scrollY);

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
  assert.equal(gibtEsDenPfeil(harness), true, "und der Pfeil ist da");

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
// das Kleben still auf, ohne dass sich etwas bewegt - und der Pfeil geht mit.
test("coming back to the top quietly releases the pinned row and the chevron", () => {
  const harness = createHarness();
  harness.start();

  harness.scrollTo(600);
  harness.clickToggle();
  harness.settle();
  assert.equal(isStuck(harness), true);

  harness.scrollTo(0);
  assert.equal(isStuck(harness), false, "am Anfang klebt nichts");
  assert.equal(isTucked(harness), false);
  assert.equal(sichtbarePx(harness), TABS_ROW_HEIGHT, "die Pills stehen an ihrem Platz");
  assert.equal(gibtEsDenPfeil(harness), false, "und der Pfeil ist wieder weg");
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

  [800, 400, 120, 45].forEach((y) => {
    harness.scrollTo(y);
    assert.equal(isVisible(harness), true, `bei ${y}: sie bleibt zu sehen`);
    assert.equal(isStuck(harness), true, `bei ${y}: und bleibt geheftet`);
  });

  harness.scrollTo(0);
  assert.equal(isStuck(harness), false);
  assert.equal(isVisible(harness), true);
});

// Der Zustand liegt im Modul, nicht im HTML: ein Re-Render baut die Kopfzeile
// neu und das Kleben muss ihn ueberleben.
test("the pinned state survives a re-render of the header", () => {
  const harness = createHarness();
  harness.start();

  harness.scrollTo(900);
  harness.clickToggle();
  harness.settle();
  assert.equal(isStuck(harness), true);

  harness.documentObj.documentElement.classList.remove("smart-header-tabs-stuck");
  harness.start();
  assert.equal(isStuck(harness), true, "geheftet bleibt geheftet");
  assert.equal(isVisible(harness), true);
  assert.equal(isSliding(harness), false, "und ohne Uebergang - ein Re-Render ist keine Bewegung");
  assert.equal(gibtEsDenPfeil(harness), true);
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
  harness.scrollTo(900);

  harness.tapToggle({ withClick: false });
  harness.settle();
  assert.equal(isVisible(harness), true, "das Loslassen allein schaltet schon");

  harness.tapToggle();
  harness.settle();
  assert.equal(isVisible(harness), false, "ein Tipp, ein Wechsel");
});

// Ein Wisch, der auf dem Knopf beginnt, ist kein Tipp.
test("a swipe starting on the chevron does not switch anything", () => {
  const harness = createHarness();
  harness.start();
  harness.scrollTo(900);

  harness.tapToggle({ moveBy: 40 });
  harness.settle();
  assert.equal(isVisible(harness), false, "gewischt heisst nicht getippt");
});
// ===========================================================================
// Was das Scrollen kosten darf
//
// Alles hier drunter haelt eine Sache fest: der erste Wisch nach einem
// Neuladen soll nichts kosten. Genau dort blieb er sichtbar haengen - die
// Zeile mass sich Bild fuer Bild nach, und die Adressleiste, die dabei
// einfaehrt, stiess noch eine zweite Runde davon an.
// ===========================================================================

// Die Zeilenhoehe aendert sich nur, wenn die Zeile anders umbricht - also bei
// einer Drehung. "resize" und visualViewport melden sich auf iOS dagegen
// mitten im Scrollen, sobald die Adressleiste einfaehrt. Wer daran haengt,
// misst und schreibt genau dann, wenn der Finger sich bewegt.
test("the row never listens where iOS reports mid-scroll", () => {
  const harness = createHarness();
  harness.start();

  assert.deepEqual(
    harness.boundWindowEvents(),
    ["orientationchange", "scroll"],
    "scrollen und drehen - sonst nichts"
  );
  assert.deepEqual(
    harness.boundViewportEvents(),
    [],
    "an visualViewport haengt die Zeile gar nicht"
  );
});

// Beim Scrollen wird nichts nachgemessen. Ein getBoundingClientRect erzwingt
// im Browser ein Layout des ganzen Dokuments, und der Feed rechnet mit
// content-visibility ohnehin schon nach.
test("scrolling never measures the row again", () => {
  const harness = createHarness();
  harness.start();
  harness.rectReads.length = 0;

  [10, 40, 120, 400, 900, 400, 40, 0].forEach((y) => harness.scrollTo(y));

  assert.deepEqual(harness.rectReads, [], "kein einziges erzwungenes Layout");
});

// Und geschrieben wird am <html> auch nichts: setProperty schreibt das
// style-Attribut selbst mit unveraendertem Wert neu, und daran haengt der
// MutationObserver, der Safari seine Leiste neu einfaerben laesst - das sah
// nach einem Neuladen wie ein kurz verschwindender Header aus.
test("the row height is only ever written when it really changed", () => {
  const harness = createHarness();
  const hoehenSchreibungen = () => harness.styleWrites
    .filter(([name]) => name === "--smart-header-tabs-row-height");
  harness.start();
  assert.deepEqual(
    hoehenSchreibungen(),
    [["--smart-header-tabs-row-height", `${TABS_ROW_HEIGHT}px`]],
    "einmal beim Aufbau, mit der gemessenen Hoehe"
  );

  harness.styleWrites.length = 0;
  // Der Pfeil misst vor jeder Fahrt nach, und eine Drehung tut es auch - nur
  // schreiben darf keines von beiden, solange dasselbe herauskommt.
  [10, 40, 120, 400, 900, 0].forEach((y) => harness.scrollTo(y));
  harness.scrollTo(900);
  harness.clickToggle();
  harness.settle();
  harness.clickToggle();
  harness.settle();
  harness.fireWindow("orientationchange");
  harness.fireWindow("orientationchange");
  assert.deepEqual(hoehenSchreibungen(), [], "derselbe Wert wird nie noch einmal geschrieben");

  harness.tabsEl.height = 52;
  harness.fireWindow("orientationchange");
  assert.deepEqual(
    hoehenSchreibungen(),
    [["--smart-header-tabs-row-height", "52px"]],
    "eine wirklich andere Hoehe schon"
  );
});

// Auch der Pfeil misst nur einmal pro Tipp nach - dort ist das richtig, denn
// die Fahrstrecke muss auch nach einem Schriftgroessen-Wechsel stimmen.
test("only a tap and a turn measure the row again", () => {
  const harness = createHarness();
  harness.start();
  harness.scrollTo(900);
  harness.rectReads.length = 0;

  harness.clickToggle();
  harness.settle();
  assert.ok(harness.rectReads.length > 0, "vor der Fahrt wird gemessen");

  harness.rectReads.length = 0;
  harness.tabsEl.height = 52;
  harness.fireWindow("orientationchange");
  assert.ok(harness.rectReads.includes("tabs"), "und nach einer Drehung");
  assert.equal(harness.styleValues.get("--smart-header-tabs-row-height"), "52px");
});

// Und der Pfeil selbst rechnet mit der krummen Hoehe weiter: eine gerundete
// hat schon einmal eine laengst weggescrollte Zeile als sichtbar gelten lassen,
// und der Pfeil machte dann zu, statt aufzumachen.
test("the decision runs on the fractional height, the glide on the rounded one", () => {
  const harness = createHarness({ rowHeight: 40.671875 });
  harness.start();

  harness.scrollTo(38);
  assert.equal(gibtEsDenPfeil(harness), false, "ein Stueck der Zeile steht noch da");
  // Zwischen der echten Hoehe (40.671875) und der gerundeten (41): ihr Platz ist
  // hier laengst weg. "scrollY < gerundete Hoehe" hielt sie hier noch fuer zu
  // sehen - und der Pfeil machte zu, statt aufzumachen.
  harness.scrollTo(40.5);
  assert.equal(gibtEsDenPfeil(harness), true, "ihr Platz ist weg, der Pfeil ist da");
  assert.equal(isVisible(harness), false, "und er weiss auch, in welche Richtung");
  // Gerundet wird nur die Fahrstrecke - sie endet ohnehin hinter der Leiste.
  assert.equal(harness.styleValues.get("--smart-header-tabs-row-height"), "41px");
});
