import assert from "node:assert/strict";
import test from "node:test";

import { createAppShellRuntimeController } from "../apps/menyra-social/core/app-shell/app-shell-runtime-controller.js";
import { syncModalOpenUiStateCore } from "../apps/menyra-social/core/overlays/overlay-root-ui-utils.js";

// ===========================================================================
// Der GO-Editor ist ein Modal - auch fuer die Huelle der App
//
// Er trug schon dieselbe Flaeche wie das Speisen-Modal, und trotzdem fuehlte
// er sich oben anders an: kein eingefaerbter sicherer Bereich in Safari, keine
// gesperrte Seite dahinter, kein theme-color. Der Grund lag nicht am Modal,
// sondern daran, dass die Huelle nichts davon wusste.
//
// Die Huelle baut die Overlays nur neu, wenn sich ihr Fingerabdruck aendert -
// und in dem standen alle Modals ausser diesem. Der Editor oeffnete sich, die
// Seite darunter blieb aufgeschlagen, und syncModalOpenUiState (Sperre,
// Tint-Streifen, theme-color) lief nie.
// ===========================================================================

function createShell(state) {
  return createAppShellRuntimeController({
    state,
    documentObj: {
      documentElement: { classList: { add() {}, remove() {}, toggle() {} } },
      body: null,
      querySelector: () => null,
      querySelectorAll: () => [],
      getElementById: () => null,
      addEventListener: () => {}
    },
    windowObj: {
      addEventListener: () => {},
      removeEventListener: () => {},
      requestAnimationFrame: () => 0,
      setTimeout: () => 0,
      clearTimeout: () => {},
      localStorage: { getItem: () => null, setItem: () => {}, removeItem: () => {} }
    },
    escapeHtml: (value = "") => String(value || ""),
    icon: () => "",
    isGuestSession: () => false,
    getChatUnreadCount: () => 0,
    resolveHeaderBranding: () => ({ title: "MNYRA", subtitle: "", logoUrl: "", isBusinessLogo: false }),
    logoFitClass: () => "object-cover"
  });
}

function baseState() {
  return {
    activeTab: "gobiznes",
    userProfile: {},
    notifications: [],
    shopCart: { items: [] },
    profileModal: { open: false },
    postModal: { open: false },
    likesModal: { open: false },
    menuModal: { open: false },
    menuDetail: { open: false },
    focusModal: { open: false },
    chatModal: { open: false },
    goAdmin: { editor: null }
  };
}

test("opening the GO editor changes the overlay fingerprint", () => {
  const state = baseState();
  const controller = createShell(state);

  const closed = controller.buildOverlayRenderSignature();
  state.goAdmin.editor = { mode: "create", draft: {} };
  const open = controller.buildOverlayRenderSignature();

  assert.notEqual(closed, open, "ein geoeffneter Editor ist ein anderer Zustand");

  // Und beim Schliessen wieder zurueck - sonst bliebe die Seite gesperrt.
  state.goAdmin.editor = null;
  assert.equal(controller.buildOverlayRenderSignature(), closed);
});

test("the GO editor in the overlay area locks the page and tints the safe area", () => {
  // Genau das, was das Speisen-Modal bekommt: modal-open auf html und body
  // (die Sperre und der Hintergrund), die beiden Streifen fuer die Leisten von
  // Safari, und die Flaeche des Modals als Farbe dahinter.
  const flags = new Map();
  const tints = { top: { style: {} }, bottom: { style: {} } };
  const editorOverlay = {
    getAttribute: (name) => (name === "data-modal-surface" ? "#ffffff" : ""),
    style: { getPropertyValue: () => "" },
    querySelector: () => null
  };
  const doc = {
    documentElement: {
      dataset: {},
      style: { setProperty: () => {}, removeProperty: () => {} },
      classList: { toggle: (name, on) => flags.set(`html:${name}`, on), remove: () => {} }
    },
    body: {
      classList: { toggle: (name, on) => flags.set(`body:${name}`, on), remove: () => {} }
    },
    head: null,
    defaultView: null,
    querySelector: (selector) => (selector === "#overlayRoot .modal-overlay" ? editorOverlay : null),
    querySelectorAll: (selector) => (selector === "#overlayRoot .modal-overlay" ? [editorOverlay] : []),
    getElementById: (id) => {
      if (id === "safariChromeTintTop") return tints.top;
      if (id === "safariChromeTintBottom") return tints.bottom;
      return null;
    }
  };

  syncModalOpenUiStateCore({
    documentObj: doc,
    // Kein anderes Modal ist offen - der Editor steht allein im DOM.
    isAnyModalOpenFn: () => false,
    ensureModalEscapeHandlerFn: () => {}
  });

  assert.equal(flags.get("html:modal-open"), true);
  assert.equal(flags.get("body:modal-open"), true);
  assert.equal(tints.top.style.display, "block");
  assert.equal(tints.bottom.style.display, "block");
  assert.equal(tints.top.style.background, "#ffffff");
});
