import assert from "node:assert/strict";
import test from "node:test";
import { createAppShellRuntimeController } from "../apps/menyra-social/core/app-shell/app-shell-runtime-controller.js";

const LOCATION_STORAGE_KEY = "mnyra_social_feed_viewer_location_v1";

class FakeClassList {
  constructor() {
    this.values = new Set();
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
  constructor(tag = "div") {
    this.tag = tag;
    this.dataset = {};
    this.classList = new FakeClassList();
    this.attributes = new Map();
    this.value = "";
    this.innerHTML = "";
    this.blurCount = 0;
    this.focusCount = 0;
  }

  setAttribute(name, value) {
    this.attributes.set(name, String(value));
  }

  getAttribute(name) {
    return this.attributes.has(name) ? this.attributes.get(name) : null;
  }

  focus() {
    this.focusCount += 1;
  }

  select() {}

  blur() {
    this.blurCount += 1;
  }
}

// Nur so viel Umgebung, wie die Pin-Mechanik der Kopfzeile anfasst.
function createHarness({ location = { lat: 42.66, lng: 21.16, label: "Pristina", city: "Pristina" } } = {}) {
  const toggleEl = new FakeElement("button");
  const scopeEl = new FakeElement("div");
  const inputEl = new FakeElement("input");
  const suggestionsEl = new FakeElement("div");
  inputEl.value = String(location?.label || "");
  const store = new Map();
  if (location) store.set(LOCATION_STORAGE_KEY, JSON.stringify(location));

  const documentObj = {
    documentElement: { classList: new FakeClassList() },
    body: { classList: new FakeClassList(), style: {} },
    activeElement: null,
    listeners: new Map(),
    scopeMounted: true,
    addEventListener(type, handler) {
      if (!this.listeners.has(type)) this.listeners.set(type, []);
      this.listeners.get(type).push(handler);
    },
    getElementById(id) {
      if (!this.scopeMounted) return null;
      if (id === "feedLocationCityInput") return inputEl;
      if (id === "feedLocationCitySuggestions") return suggestionsEl;
      return null;
    },
    querySelector(selector) {
      if (!this.scopeMounted) return null;
      if (selector === '[data-feed-location-scope="header"]') return scopeEl;
      if (selector === "[data-smart-header-location-toggle]") return toggleEl;
      return null;
    },
    querySelectorAll: () => []
  };

  const windowObj = {
    localStorage: {
      getItem: (key) => (store.has(key) ? store.get(key) : null),
      setItem: (key, value) => store.set(key, String(value)),
      removeItem: (key) => store.delete(key)
    },
    requestAnimationFrame: () => 0,
    cancelAnimationFrame: () => {},
    addEventListener: () => {},
    removeEventListener: () => {}
  };

  const controller = createAppShellRuntimeController({
    state: {
      activeTab: "feed",
      userProfile: {},
      notifications: [],
      shopCart: { items: [] }
    },
    documentObj,
    windowObj,
    escapeHtml: (value = "") => String(value || ""),
    icon: (name = "") => `<svg data-icon="${name}"></svg>`,
    isGuestSession: () => false,
    getChatUnreadCount: () => 0,
    resolveHeaderBranding: () => ({ title: "MNYRA", subtitle: "Social", logoUrl: "", isBusinessLogo: false }),
    logoFitClass: () => "object-cover"
  });

  return { controller, documentObj, windowObj, toggleEl, inputEl, suggestionsEl, store };
}

function firePinClick(documentObj, toggleEl) {
  const handlers = documentObj.listeners.get("click") || [];
  const target = {
    closest: (selector) => (selector === "[data-smart-header-location-toggle]" ? toggleEl : null)
  };
  handlers.forEach((handler) => handler({ target, preventDefault() {}, stopPropagation() {} }));
}

function fireOutsidePointerDown(documentObj) {
  const handlers = documentObj.listeners.get("pointerdown") || [];
  const target = { closest: () => null };
  handlers.forEach((handler) => handler({ target, preventDefault() {}, stopPropagation() {} }));
}

test("zbulo header keeps the text logo and offers the pin as first action icon", () => {
  const { controller } = createHarness();

  const html = controller.renderHeader();

  // Textlogo ist zurueck ...
  assert.match(html, /class="smart-header-brand[^"]*"/);
  assert.match(html, />MNYRA<\/h1>/);
  assert.match(html, />Social<\/span>/);
  // ... und das Location-Feld liegt daneben im selben DOM.
  assert.match(html, /data-feed-location-scope="header"/);
  assert.match(html, /id="feedLocationCityInput"/);

  const actionsHtml = html.slice(html.indexOf('class="smart-header-actions'));
  const pinIndex = actionsHtml.indexOf("data-smart-header-location-toggle");
  const globeIndex = actionsHtml.indexOf("data-language-toggle");
  const userIndex = actionsHtml.indexOf('data-nav="profile"');
  const cartIndex = actionsHtml.indexOf('data-action="cart"');
  assert.ok(pinIndex > -1, "pin toggle is rendered");
  assert.ok(pinIndex < globeIndex, "pin stands before the language icon");
  assert.ok(globeIndex < userIndex && userIndex < cartIndex, "remaining icon order is untouched");
  assert.match(actionsHtml, /<svg data-icon="map-pin"><\/svg>/);
});

test("pin icon uses the same button and icon size as the other header icons", () => {
  const { controller } = createHarness();

  const html = controller.renderHeader();
  const buttonClasses = [...html.matchAll(/class="([^"]*w-9 h-9[^"]*)"/g)].map((match) => match[1]);
  const pinButton = buttonClasses.find((value) => value.includes("smart-header-location-btn"));

  assert.ok(pinButton, "pin button carries the shared action button size");
  assert.match(pinButton, /w-9 h-9 flex items-center justify-center hover:bg-slate-100 rounded-full/);
  // Alle vier Aktions-Icons in derselben Groesse.
  ["map-pin", "globe", "user", "shopping-bag"].forEach((name) => {
    assert.match(html, new RegExp(`<svg data-icon="${name}"></svg>`));
  });
  assert.equal(html.includes('class="smart-header-location-btn w-9 h-9'), true);
});

test("pin click swaps logo for the location field and back", () => {
  const { controller, documentObj, toggleEl } = createHarness();

  controller.renderHeader();
  controller.syncSmartHeaderLocationRuntime();
  assert.equal(documentObj.documentElement.classList.contains("smart-header-location-open"), false);
  assert.equal(toggleEl.getAttribute("aria-expanded"), "false");

  firePinClick(documentObj, toggleEl);
  assert.equal(controller.isSmartHeaderLocationExpanded(), true);
  assert.equal(documentObj.documentElement.classList.contains("smart-header-location-open"), true);
  assert.equal(toggleEl.getAttribute("aria-expanded"), "true");
  assert.equal(toggleEl.classList.contains("smart-header-location-btn--active"), true);

  firePinClick(documentObj, toggleEl);
  assert.equal(controller.isSmartHeaderLocationExpanded(), false);
  assert.equal(documentObj.documentElement.classList.contains("smart-header-location-open"), false);
  assert.equal(toggleEl.getAttribute("aria-expanded"), "false");
});

test("expanded state survives re-renders of the header", () => {
  const { controller, documentObj, toggleEl } = createHarness();

  controller.syncSmartHeaderLocationRuntime();
  firePinClick(documentObj, toggleEl);
  documentObj.documentElement.classList.remove("smart-header-location-open");

  controller.renderHeader();
  controller.syncSmartHeaderLocationRuntime();

  assert.equal(controller.isSmartHeaderLocationExpanded(), true);
  assert.equal(documentObj.documentElement.classList.contains("smart-header-location-open"), true);
});

test("header html stays identical while the pin is open so the typed city is not lost", () => {
  const { controller, documentObj, toggleEl } = createHarness();

  const closedHtml = controller.renderHeader();
  controller.syncSmartHeaderLocationRuntime();
  firePinClick(documentObj, toggleEl);
  const openHtml = controller.renderHeader();

  assert.equal(openHtml, closedHtml);
});

test("half typed input is reset to the stored city on every toggle", () => {
  const { controller, documentObj, toggleEl, inputEl, suggestionsEl } = createHarness();

  controller.syncSmartHeaderLocationRuntime();
  firePinClick(documentObj, toggleEl);
  inputEl.value = "Priz";
  suggestionsEl.classList.add("feed-location-suggestions--open");
  suggestionsEl.innerHTML = "<button>Prizren</button>";

  firePinClick(documentObj, toggleEl);

  assert.equal(inputEl.value, "Pristina");
  assert.equal(suggestionsEl.classList.contains("feed-location-suggestions--open"), false);
  assert.equal(suggestionsEl.innerHTML, "");
});

test("a changed city closes the pin again so the logo comes back", () => {
  const { controller, documentObj, toggleEl, store } = createHarness();

  controller.syncSmartHeaderLocationRuntime();
  firePinClick(documentObj, toggleEl);
  assert.equal(controller.isSmartHeaderLocationExpanded(), true);

  store.set(LOCATION_STORAGE_KEY, JSON.stringify({ lat: 42.21, lng: 20.74, label: "Prizren", city: "Prizren" }));
  controller.syncSmartHeaderLocationRuntime();

  assert.equal(controller.isSmartHeaderLocationExpanded(), false);
  assert.equal(documentObj.documentElement.classList.contains("smart-header-location-open"), false);
});

test("a changed city keeps the field open while the user is still typing", () => {
  const { controller, documentObj, toggleEl, inputEl, store } = createHarness();

  controller.syncSmartHeaderLocationRuntime();
  firePinClick(documentObj, toggleEl);
  documentObj.activeElement = inputEl;

  store.set(LOCATION_STORAGE_KEY, JSON.stringify({ lat: 42.21, lng: 20.74, label: "Prizren", city: "Prizren" }));
  controller.syncSmartHeaderLocationRuntime();

  assert.equal(controller.isSmartHeaderLocationExpanded(), true);
});

test("tapping outside closes the pin", () => {
  const { controller, documentObj, toggleEl } = createHarness();

  controller.syncSmartHeaderLocationRuntime();
  firePinClick(documentObj, toggleEl);
  fireOutsidePointerDown(documentObj);

  assert.equal(controller.isSmartHeaderLocationExpanded(), false);
  assert.equal(documentObj.documentElement.classList.contains("smart-header-location-open"), false);
});

test("a header without location field can never stay in the open state", () => {
  const { controller, documentObj, toggleEl } = createHarness();

  controller.syncSmartHeaderLocationRuntime();
  firePinClick(documentObj, toggleEl);
  assert.equal(controller.isSmartHeaderLocationExpanded(), true);

  documentObj.scopeMounted = false;
  controller.syncSmartHeaderLocationRuntime();

  assert.equal(controller.isSmartHeaderLocationExpanded(), false);
  assert.equal(documentObj.documentElement.classList.contains("smart-header-location-open"), false);
});

test("without a stored city the header shows the logo and no pin", () => {
  const { controller } = createHarness({ location: null });

  const html = controller.renderHeader();

  assert.match(html, /class="smart-header-brand[^"]*"/);
  assert.equal(html.includes("data-smart-header-location-toggle"), false);
  assert.equal(html.includes('data-feed-location-scope="header"'), false);
});
