import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { createAppShellRuntimeController } from "../apps/menyra-social/core/app-shell/app-shell-runtime-controller.js";

// ===========================================================================
// Kopfzeile des Panels (Tab "dashboard")
//
// Das Panel ist die Arbeitsflaeche eines eingeloggten Business. Warenkorb und
// Sprachwahl gehoeren dort nicht hin - an der Stelle des Warenkorbs steht das
// eigene Profilbild, genau so gross wie die Symbole daneben. Ueberall sonst
// bleibt die Kopfzeile Zeichen fuer Zeichen, wie sie war.
// ===========================================================================

class FakeClassList {
  constructor() {
    this.values = new Set();
  }

  add(name) { this.values.add(name); }
  remove(name) { this.values.delete(name); }
  contains(name) { return this.values.has(name); }
  toggle(name, force) {
    const next = force === undefined ? !this.values.has(name) : !!force;
    if (next) this.values.add(name);
    else this.values.delete(name);
    return next;
  }
}

function createHarness({ guest = false, logoUrl = "https://cdn.mnyra.com/logo.jpg" } = {}) {
  const documentObj = {
    documentElement: { classList: new FakeClassList() },
    body: { classList: new FakeClassList(), style: {} },
    activeElement: null,
    addEventListener: () => {},
    getElementById: () => null,
    querySelector: () => null,
    querySelectorAll: () => []
  };
  const windowObj = {
    localStorage: {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {}
    },
    requestAnimationFrame: () => 0,
    cancelAnimationFrame: () => {},
    addEventListener: () => {},
    removeEventListener: () => {}
  };
  const state = {
    activeTab: "dashboard",
    userProfile: { uid: "biz-1", name: "Bro Pizza", role: "business", restaurantId: "rest-1" },
    notifications: [],
    shopCart: { items: [{ quantity: 2 }] }
  };
  const controller = createAppShellRuntimeController({
    state,
    documentObj,
    windowObj,
    PLACEHOLDER_IMAGE: "/img/placeholder.png",
    escapeHtml: (value = "") => String(value || ""),
    icon: (name = "") => `<svg data-icon="${name}"></svg>`,
    isGuestSession: () => guest,
    getChatUnreadCount: () => 0,
    resolveHeaderBranding: () => ({ title: "MNYRA", subtitle: "Social", logoUrl, isBusinessLogo: true }),
    logoFitClass: () => "object-contain bg-white"
  });
  return { controller, state, windowObj };
}

test("the panel header trades cart and language for the own profile picture", () => {
  const { controller } = createHarness();

  const html = controller.renderHeader();

  // Weg sind sie beide - samt ihrer Symbole.
  assert.equal(html.includes('data-action="cart"'), false);
  assert.equal(html.includes("smart-header-cart-btn"), false);
  assert.equal(html.includes('data-icon="shopping-bag"'), false);
  assert.equal(html.includes("data-language-toggle"), false);
  assert.equal(html.includes('data-icon="globe"'), false);
  // Und an ihrer Stelle steht das Bild, das zum eigenen Profil fuehrt.
  assert.match(html, /class="smart-header-avatar-btn/);
  assert.match(html, /data-nav="profile"/);
  assert.match(html, /https:\/\/cdn\.mnyra\.com\/logo\.jpg/);
  // Das Textlogo links bleibt unangetastet.
  assert.match(html, /class="smart-header-brand[^"]*"/);
});

// Der Auftrag war "genau so gross wie der Warenkorb". Das haelt nur, solange
// das Bild dieselbe Kantenlaenge traegt wie die Symbolknoepfe der Zeile.
test("the picture is exactly as big as the icon buttons next to it", () => {
  const { controller, state } = createHarness();

  const panelHtml = controller.renderHeader();
  const avatarClass = /class="smart-header-avatar-btn ([^"]*)"/.exec(panelHtml)?.[1] || "";
  assert.match(avatarClass, /(^| )w-10 h-10( |$)/);

  // Dieselbe Zeile ohne Panel: dort traegt der Warenkorb genau diese Groesse.
  state.activeTab = "feed";
  const feedHtml = controller.renderHeader();
  const cartClass = /<button type="button" data-action="cart" class="smart-header-cart-btn ([^"]*)"/.exec(feedHtml)?.[1] || "";
  assert.match(cartClass, /(^| )w-10 h-10( |$)/);
});

test("without a picture the panel header falls back to the store mark, never to a broken image", () => {
  const { controller } = createHarness({ logoUrl: "" });

  const html = controller.renderHeader();

  assert.match(html, /class="smart-header-avatar-btn/);
  assert.match(html, /smart-header-avatar-fallback/);
  assert.match(html, /<svg data-icon="store"><\/svg>/);
  assert.equal(html.includes("smart-header-avatar-img"), false);
});

// Ein Gast hat kein Business-Bild, das dort stehen koennte - fuer ihn bleibt
// die Kopfzeile so, wie sie ueberall sonst aussieht.
test("a guest keeps the normal header even on the panel tab", () => {
  const { controller } = createHarness({ guest: true });

  const html = controller.renderHeader();

  assert.match(html, /data-action="cart"/);
  assert.match(html, /data-language-toggle/);
  assert.equal(html.includes("smart-header-avatar-btn"), false);
});

test("every other tab keeps cart and language exactly as before", () => {
  const { controller, state } = createHarness();

  ["feed", "restaurants", "ofertat", "orders", "analytics", "settings"].forEach((tab) => {
    state.activeTab = tab;
    const html = controller.renderHeader();
    assert.match(html, /data-action="cart"/, `${tab}: Warenkorb fehlt`);
    assert.match(html, /data-language-toggle/, `${tab}: Sprachwahl fehlt`);
    assert.equal(html.includes("smart-header-avatar-btn"), false, `${tab}: Profilbild steht falsch`);
  });
});

// Ohne Schalter darf auch der Waehler nicht stehenbleiben: wer die Sprache im
// Feed aufklappt und dann ins Panel wechselt, saehe sonst ein Feld, das er
// nicht mehr zubekommt.
test("an open language picker does not follow the user into the panel", () => {
  const { controller, state, windowObj } = createHarness();
  windowObj.__MENYRA_SOCIAL_LANGUAGE_PICKER_OPEN__ = true;

  state.activeTab = "feed";
  assert.match(controller.renderHeader(), /data-language-option/);

  state.activeTab = "dashboard";
  assert.equal(controller.renderHeader().includes("data-language-option"), false);
});

// Die Form des Bildes steht im Stylesheet der Seite, nicht in Utility-Klassen:
// die Kopfzeile soll auch ohne den generierten Tailwind-Build stimmen.
test("the picture wears the same frame as the logo beside the greeting", () => {
  const css = readFileSync(new URL("../apps/menyra-social/index.html", import.meta.url), "utf8");
  const start = css.indexOf(".smart-header-avatar-btn {");
  assert.ok(start > -1, "Regel fuer das Profilbild fehlt");
  const block = css.slice(start, css.indexOf("}", start));
  // Indigo->Lila-Ring wie am Begruessungslogo, abgerundetes Quadrat.
  assert.ok(block.includes("linear-gradient(to bottom right, #6366f1, #a855f7)"), block);
  assert.ok(block.includes("border-radius: 13px;"), block);
  assert.ok(block.includes("padding: 2px;"), block);
  // Weisser Innenrand, Bild randlos darin.
  const inner = css.slice(css.indexOf(".smart-header-avatar-btn > .smart-header-avatar-img,"));
  const innerBlock = inner.slice(0, inner.indexOf("}"));
  assert.ok(innerBlock.includes("border: 2px solid #ffffff;"), innerBlock);
  assert.ok(innerBlock.includes("object-fit: cover;"), innerBlock);
});
