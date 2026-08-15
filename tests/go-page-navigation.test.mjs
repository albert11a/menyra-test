// Mnyra GO ist eine Seite, und Seiten erreicht man auf zwei Arten: ueber die
// Karte im Qyteti und ueber den Drawer. Diese Datei haelt genau diese beiden
// Wege fest - beide waren einmal verschlossen, und beide sahen von aussen
// gleich aus: "man tippt, und nichts passiert".

import assert from "node:assert/strict";
import test from "node:test";

import { createShellDomRuntimeController } from "../apps/menyra-social/core/app-shell/shell-dom-runtime-controller.js";
import { createGoPageViewController } from "../apps/menyra-social/core/go/go-page-view-controller.js";
import { rememberGoBooking } from "../apps/menyra-social/core/go/go-client-store.js";
import { sanitizeTabForSessionCore } from "../apps/menyra-social/core/auth/session-tab-guards.js";
import { normalizeInitialTab } from "../apps/menyra-social/core/auth/route-auth-utils.js";
import {
  buildCanonicalAppTabPathCore,
  normalizeAppTabRouteCore,
  parseSiteRoutePathCore
} from "../apps/menyra-social/core/router/public-business-route-utils.js";
import { resolveSocialRouteRuntimeKey } from "../apps/menyra-social/core/app-shell/route-runtime-registry.js";

function renderDrawerFor({ user = null, userProfile = null } = {}) {
  const state = { user, userProfile, activeTab: "feed", drawerOpen: true };
  const isBusiness = !!userProfile?.restaurantId;
  return createShellDomRuntimeController({
    state,
    brandUi: { title: "MNYRA" },
    isGuestSession: () => !user,
    isLocalBusinessProfile: () => isBusiness,
    isRestaurantCafeProfile: () => isBusiness,
    isCeoUser: () => false,
    escapeHtml: (value = "") => String(value || ""),
    icon: () => ""
  }).renderDrawer();
}

// Ein Drawer-Eintrag ist erst dann ein Weg, wenn er auch sichtbar ist: die
// Eintraege stehen alle im Markup, "hidden" entscheidet.
function drawerEntry(html, tab) {
  const match = html.match(new RegExp(`<button[^>]*data-nav="${tab}"[^>]*>`));
  if (!match) return { present: false, visible: false };
  return { present: true, visible: !/\bhidden\b/.test(match[0]) };
}

test("a guest may open the GO page - the card in the feed leads nowhere else", () => {
  // Das war der Fehler: "go" fehlte in den Tabs, die ein Gast sehen darf.
  // Jeder Klick auf die GO-Karte landete damit wieder im Feed.
  assert.equal(sanitizeTabForSessionCore("go", { user: null, guestScopeUid: "guest-1" }), "go");
  assert.equal(sanitizeTabForSessionCore("go", { user: { uid: "u1" } }), "go");
});

test("the working page of the local stays closed for guests", () => {
  assert.equal(sanitizeTabForSessionCore("gobiznes", { user: null, guestScopeUid: "guest-1" }), "feed");
  assert.equal(sanitizeTabForSessionCore("gobiznes", { user: { uid: "u1" } }), "gobiznes");
});

test("/mnyra-go is the page of the guest, /go-biznes the one of the local", () => {
  assert.equal(normalizeInitialTab("mnyra-go"), "go");
  assert.equal(normalizeInitialTab("go-biznes"), "gobiznes");
  assert.equal(normalizeAppTabRouteCore("mnyra-go"), "go");
  assert.equal(buildCanonicalAppTabPathCore("go"), "/mnyra-go");

  const parsed = parseSiteRoutePathCore("/mnyra-go");
  assert.equal(parsed.kind, "system");
  assert.equal(parsed.tab, "go");
});

test("both GO surfaces resolve to their own route runtime", () => {
  assert.equal(resolveSocialRouteRuntimeKey({ activeTab: "go" }), "go");
  assert.equal(resolveSocialRouteRuntimeKey({ activeTab: "gobiznes" }), "gobiznes");
});

test("the drawer carries Mnyra GO for a private account", () => {
  const html = renderDrawerFor({ user: { uid: "u1" }, userProfile: { uid: "u1", name: "Arta" } });
  assert.deepEqual(drawerEntry(html, "go"), { present: true, visible: true });
  assert.match(html, /Mnyra GO/);
});

test("a guest sees the entry too - GO does not ask for an account", () => {
  const html = renderDrawerFor();
  assert.deepEqual(drawerEntry(html, "go"), { present: true, visible: true });
});

test("a business account does not get the entry - it works on the other side of GO", () => {
  const html = renderDrawerFor({
    user: { uid: "b1" },
    userProfile: { uid: "b1", name: "Casa Rita", restaurantId: "casa-rita" }
  });
  assert.equal(drawerEntry(html, "go").visible, false);
  // Und der Weg des Lokals liegt nicht im Drawer, sondern auf seiner Karte
  // im Panel - hier steht er nicht.
  assert.equal(drawerEntry(html, "gobiznes").present, false);
});

// ===========================================================================
// Der Weg herein kann eine Buchung mitbringen (Punkt 43).
// ===========================================================================

function createMemoryStorage() {
  const map = new Map();
  return {
    getItem: (key) => (map.has(key) ? map.get(key) : null),
    setItem: (key, value) => map.set(key, String(value)),
    removeItem: (key) => map.delete(key)
  };
}

function createPageController({ state, api, storage }) {
  // openBooking liest die gemerkte Buchung ohne Speicher-Argument - in Node
  // gibt es keinen, also stellen wir einen hin und raeumen ihn wieder weg.
  const previous = Object.getOwnPropertyDescriptor(globalThis, "localStorage");
  Object.defineProperty(globalThis, "localStorage", { value: storage, configurable: true });
  const restore = () => {
    if (previous) Object.defineProperty(globalThis, "localStorage", previous);
    else delete globalThis.localStorage;
  };
  const controller = createGoPageViewController({
    state,
    renderFn: () => {},
    documentObj: { addEventListener() {} },
    windowObj: { crypto: null },
    api,
    getCityFn: () => "Prishtina",
    isSignedInFn: () => false,
    takePendingBookingIdFn: () => {
      const bookingId = String(state.goOpenBookingId || "").trim();
      if (bookingId) state.goOpenBookingId = "";
      return bookingId;
    },
    nowFn: () => Date.parse("2026-08-13T14:00:00.000Z")
  });
  return { controller, restore };
}

test("the card of a running booking carries it onto the page", async () => {
  const storage = createMemoryStorage();
  rememberGoBooking({
    bookingId: "bk-1",
    bookingToken: "b1.bk-1.secretsecretsecret",
    businessName: "Casa Rita",
    partySize: 4
  }, storage);

  const calls = [];
  const state = { goOpenBookingId: "bk-1" };
  const { controller, restore } = createPageController({
    state,
    storage,
    api: {
      async ensureGuestSession() { return {}; },
      async getBooking(token) {
        calls.push(token);
        return { id: "bk-1", status: "confirmed", shortCode: "A7K2", businessName: "Casa Rita" };
      }
    }
  });

  try {
    // Der Aufbau selbst holt nichts - er baut. Erst danach greift die Seite
    // nach dem Stand am Server.
    controller.renderGoPageView();
    assert.equal(controller.__view().view, "search");
    assert.deepEqual(calls, []);

    await new Promise((resolve) => setTimeout(resolve, 0));
    assert.deepEqual(calls, ["b1.bk-1.secretsecretsecret"]);
    assert.equal(controller.__view().view, "booking");
    assert.equal(controller.__view().booking.shortCode, "A7K2");

    // Und die Kennung ist verbraucht: ein Neuzeichnen reisst die Seite nicht
    // wieder in die Buchung zurueck.
    assert.equal(state.goOpenBookingId, "");
    controller.__view().view = "search";
    controller.renderGoPageView();
    await new Promise((resolve) => setTimeout(resolve, 0));
    assert.deepEqual(calls, ["b1.bk-1.secretsecretsecret"]);
    assert.equal(controller.__view().view, "search");
  } finally {
    restore();
  }
});

test("without a running booking the page opens on the question", async () => {
  const calls = [];
  const state = {};
  const { controller, restore } = createPageController({
    state,
    storage: createMemoryStorage(),
    api: {
      async ensureGuestSession() { return {}; },
      async getBooking(token) { calls.push(token); return null; }
    }
  });

  try {
    controller.renderGoPageView();
    await new Promise((resolve) => setTimeout(resolve, 0));
    assert.deepEqual(calls, []);
    assert.equal(controller.__view().view, "search");
  } finally {
    restore();
  }
});
