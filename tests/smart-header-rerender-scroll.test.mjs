import assert from "node:assert/strict";
import test from "node:test";
import { createAppShellRuntimeController } from "../apps/menyra-social/core/app-shell/app-shell-runtime-controller.js";

// ===========================================================================
// Was ein Neuaufbau mit der Seite machen darf - und was nicht
//
// Nach einem Neuladen kommen die Feed-Daten nach und nach an, und jede davon
// loest einen Render aus. Wer in dem Moment wischt, laeuft mitten hinein. Auf
// dem Geraet sah das so aus: die Seite blieb stehen, sprang rund 350px zurueck,
// und der Header war fuer einen Frame weg.
//
// Beides kommt aus dem Render-Pfad, nicht aus der Pill-Zeile:
//  - die Leseposition wurde blind zurueckgeschrieben, auch wenn der Finger
//    laengst weiter war (auf iOS scrollt der Compositor weiter, waehrend JS
//    noch am Neuaufbau sitzt);
//  - die klebende Kopfzeile wurde weggeworfen und neu gebaut, und Safari legt
//    dafuer eine neue Compositing-Ebene an.
// ===========================================================================

const VIEWPORT_HEIGHT = 800;

// Ein Dokument, das scrollt: Hoehe, Sichtfenster und Leseposition wie im
// Browser. scrollTop laesst sich - wie im Browser - nie ueber das Ende hinaus
// setzen; genau daraus entsteht das Kappen beim Neuaufbau.
function createScrollingDocument({ scrollHeight = 5000 } = {}) {
  const scrollingElement = {
    clientHeight: VIEWPORT_HEIGHT,
    scrollHeight,
    _top: 0,
    get scrollTop() {
      return this._top;
    },
    set scrollTop(value) {
      const max = Math.max(0, this.scrollHeight - this.clientHeight);
      this._top = Math.max(0, Math.min(max, Number(value) || 0));
    }
  };
  return {
    scrollingElement,
    documentElement: scrollingElement,
    body: null,
    querySelector: () => null,
    querySelectorAll: () => [],
    getElementById: () => null,
    addEventListener: () => {}
  };
}

function createController(documentObj, { onScrollTo } = {}) {
  const windowObj = {
    scrollY: 0,
    scrollCalls: [],
    scrollTo(first, second) {
      const top = first && typeof first === "object" ? first.top : second;
      this.scrollCalls.push(Math.max(0, Number(top) || 0));
      if (typeof onScrollTo === "function") onScrollTo(Math.max(0, Number(top) || 0));
      if (documentObj.scrollingElement) documentObj.scrollingElement.scrollTop = top;
    },
    requestAnimationFrame: () => 0,
    cancelAnimationFrame: () => {},
    setTimeout: () => 0,
    clearTimeout: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    localStorage: { getItem: () => null, setItem: () => {}, removeItem: () => {} }
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
  return { controller, windowObj };
}

// DER Fall aus der Aufnahme: der Neuaufbau merkt sich die Leseposition, und
// waehrend er laeuft, wischt der Finger weiter. Danach die alte Position
// zurueckzuschreiben reisst die Seite sichtbar zurueck.
test("a rebuild never pulls the page back to where the finger was", () => {
  const documentObj = createScrollingDocument();
  const { controller, windowObj } = createController(documentObj);

  // Beim Start des Neuaufbaus stand die Seite hier.
  const gemerkt = 1000;
  // Waehrend er lief, ist der Finger weitergefahren.
  documentObj.scrollingElement.scrollTop = 1350;

  assert.equal(controller.restoreViewportScrollTop(gemerkt), false, "nichts zurueckgeschrieben");
  assert.equal(documentObj.scrollingElement.scrollTop, 1350, "die Seite steht, wo der Finger sie hingebracht hat");
  assert.deepEqual(windowObj.scrollCalls, []);
});

// Nach oben gilt dasselbe: wer selbst zurueckwischt, will nicht wieder
// runtergezogen werden.
test("a rebuild never pulls the page down when the finger went up", () => {
  const documentObj = createScrollingDocument();
  const { controller, windowObj } = createController(documentObj);

  documentObj.scrollingElement.scrollTop = 400;

  assert.equal(controller.restoreViewportScrollTop(1000), false, "nichts zurueckgeschrieben");
  assert.equal(documentObj.scrollingElement.scrollTop, 400);
  assert.deepEqual(windowObj.scrollCalls, []);
});

// Wofuer die Korrektur wirklich da ist: waehrend des Neuaufbaus ist das
// Dokument kurz kuerzer (Bilder ohne Hoehe), und der Browser kappt die
// Leseposition auf das neue Ende. Das - und nur das - wird zurueckgeholt.
test("a rebuild does restore a position the browser clamped away", () => {
  const documentObj = createScrollingDocument();
  const { controller } = createController(documentObj);
  const el = documentObj.scrollingElement;

  el.scrollTop = 1000;
  // Das frische DOM ist erst einmal kurz - die Bilder haben noch keine Hoehe.
  // Der Browser kappt die Leseposition auf das neue Ende.
  el.scrollHeight = 1200;
  el.scrollTop = el.scrollTop;
  assert.equal(el.scrollTop, 400, "der Browser hat gekappt");

  // So weit reicht es noch nicht: das Dokument gibt nicht mehr her.
  assert.equal(controller.restoreViewportScrollTop(1000), true, "die Korrektur ist erkannt");
  assert.equal(el.scrollTop, 400, "mehr geht gerade nicht");

  // Einen Frame spaeter sind die Bilder da, und das Nachfassen kommt an.
  el.scrollHeight = 5000;
  assert.equal(controller.restoreViewportScrollTop(1000), false, "am Ende steht sie jetzt nicht mehr");
});

// Und genau dafuer ist das Nachfassen im naechsten Frame da: dort ist "am Ende
// stehen" als Erkennungszeichen weg, aber die Korrektur ist noch offen.
test("the one follow-up frame lands the clamped position", () => {
  const frames = [];
  const documentObj = createScrollingDocument();
  const { controller, windowObj } = createController(documentObj);
  windowObj.requestAnimationFrame = (callback) => frames.push(callback);
  const el = documentObj.scrollingElement;

  el.scrollTop = 1000;
  el.scrollHeight = 1200;
  el.scrollTop = el.scrollTop;
  assert.equal(el.scrollTop, 400, "gekappt");

  controller.scheduleViewportScrollRestore(1000);
  // Die Bilder kommen an, das Dokument ist wieder lang genug.
  el.scrollHeight = 5000;
  frames.splice(0, frames.length).forEach((callback) => callback());

  assert.equal(el.scrollTop, 1000, "die Leseposition ist zurueck");
});

// War nichts gekappt, ist auch nichts offen - dann fasst der naechste Frame
// nicht nach. Das ist der Fall aus der Aufnahme.
test("the follow-up frame stays away when nothing was clamped", () => {
  const frames = [];
  const documentObj = createScrollingDocument();
  const { controller, windowObj } = createController(documentObj);
  windowObj.requestAnimationFrame = (callback) => frames.push(callback);
  const el = documentObj.scrollingElement;

  // Der Finger ist waehrend des Neuaufbaus weitergefahren.
  el.scrollTop = 1350;
  controller.scheduleViewportScrollRestore(1000);
  // Und faehrt weiter, waehrend der Frame ansteht.
  el.scrollTop = 1500;
  frames.splice(0, frames.length).forEach((callback) => callback());

  assert.equal(el.scrollTop, 1500, "die Seite laeuft weiter, wie der Finger es will");
  assert.deepEqual(windowObj.scrollCalls, [], "kein einziger eigener Scroll");
});

// Ein winziger Rest darf keine Fahrt ausloesen - sonst schreibt jeder Render.
test("a hair's difference is not a reason to touch the page", () => {
  const documentObj = createScrollingDocument();
  const { controller, windowObj } = createController(documentObj);

  documentObj.scrollingElement.scrollTop = 999;
  assert.equal(controller.restoreViewportScrollTop(1000), false);
  assert.deepEqual(windowObj.scrollCalls, []);
});

// ---------------------------------------------------------------------------
// Die Kopfzeile ueberlebt den Neuaufbau
// ---------------------------------------------------------------------------

class FakeNode {
  constructor(markup) {
    this.markup = markup;
    this.replacedBy = null;
  }

  get outerHTML() {
    return this.markup;
  }

  replaceWith(next) {
    this.replacedBy = next;
  }
}

// Ein Dokument, in dem sich die Kopfzeilen-Knoten austauschen lassen - genau
// das macht appEl.innerHTML mit ihnen.
function createHeaderDocument(markup) {
  const nodes = new Map();
  const doc = {
    scrollingElement: null,
    documentElement: { classList: { toggle: () => {}, add: () => {}, remove: () => {}, contains: () => false }, style: {} },
    body: null,
    getElementById: () => null,
    querySelectorAll: () => [],
    addEventListener: () => {},
    querySelector: (selector) => nodes.get(selector) || null,
    // Der Neuaufbau: frische Knoten mit (womoeglich) demselben Markup.
    rebuild(nextMarkup = markup) {
      Object.entries(nextMarkup).forEach(([selector, html]) => {
        nodes.set(selector, new FakeNode(html));
      });
      return nodes;
    }
  };
  doc.rebuild();
  return doc;
}

const HEADER_MARKUP = Object.freeze({
  ".smart-header-shell": '<div class="smart-header-shell">Leiste</div>',
  ".smart-header-underline": '<div class="smart-header-underline"></div>',
  "#smart-tabs": '<div id="smart-tabs">Zbulo Lokalet Ofertat</div>'
});

test("an unchanged header keeps its own nodes through a rebuild", () => {
  const documentObj = createHeaderDocument(HEADER_MARKUP);
  const { controller } = createController(documentObj);

  // Erster Render: es gibt noch nichts zu vergleichen, also wird nur gemerkt.
  const ersteKnoten = controller.readSmartHeaderNodes();
  documentObj.rebuild();
  controller.reuseSmartHeaderNodes(ersteKnoten);

  // Zweiter Render mit demselben Markup - jetzt muessen die alten Knoten
  // wieder eingehaengt werden, statt neu aufgebaut zu bleiben.
  const alteKnoten = controller.readSmartHeaderNodes();
  const neueKnoten = new Map(documentObj.rebuild());
  controller.reuseSmartHeaderNodes(alteKnoten);

  Object.keys(HEADER_MARKUP).forEach((selector) => {
    assert.equal(
      neueKnoten.get(selector).replacedBy,
      alteKnoten.get(selector),
      `${selector}: der alte Knoten haengt wieder im Dokument`
    );
  });
});

// Hat sich die Kopfzeile wirklich geaendert (Warenkorb-Zaehler, Stadtname),
// gehoert der neue Knoten dorthin - sonst saehe man die Aenderung nie.
test("a header that really changed keeps its new node", () => {
  const documentObj = createHeaderDocument(HEADER_MARKUP);
  const { controller } = createController(documentObj);

  const ersteKnoten = controller.readSmartHeaderNodes();
  documentObj.rebuild();
  controller.reuseSmartHeaderNodes(ersteKnoten);

  const alteKnoten = controller.readSmartHeaderNodes();
  const neueKnoten = new Map(documentObj.rebuild({
    ...HEADER_MARKUP,
    ".smart-header-shell": '<div class="smart-header-shell">Leiste mit Warenkorb 3</div>'
  }));
  controller.reuseSmartHeaderNodes(alteKnoten);

  assert.equal(
    neueKnoten.get(".smart-header-shell").replacedBy,
    null,
    "die geaenderte Leiste bleibt die neue"
  );
  assert.equal(
    neueKnoten.get("#smart-tabs").replacedBy,
    alteKnoten.get("#smart-tabs"),
    "die unveraenderte Pill-Zeile behaelt ihren Knoten"
  );
});
