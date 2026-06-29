import assert from "node:assert/strict";
import test from "node:test";

import { createAuthSessionStartupCoordinator } from "../apps/menyra-social/core/auth/auth-session-startup-coordinator.js";

function createState(authOpen = false) {
  return {
    activeTab: "feed",
    user: null,
    auth: {
      mode: "login",
      open: authOpen,
      loading: true
    },
    profileView: null
  };
}

function createCoordinator(state, applyPendingInitialRouteState = () => {}, overrides = {}) {
  const ensuredTabs = [];
  const renders = [];
  const coordinator = createAuthSessionStartupCoordinator({
    state,
    windowObj: overrides.windowObj || null,
    applyPendingInitialRouteState,
    ensureTabData: async (tab) => {
      ensuredTabs.push(tab);
    },
    queueMicrotaskFn: (fn) => fn?.(),
    render: () => {
      renders.push(state.activeTab);
    },
    sanitizeTabForSession: (tab) => tab,
    postLoginRouteOpenCoordinator: {
      resolvePendingRouteFlags: () => ({ hasAny: false }),
      openPendingRoutes: () => ({ opened: false }),
      openNonBlockingRoutes: () => ({ opened: false })
    }
  });
  return { coordinator, ensuredTabs, renders };
}

test("signed-out startup keeps auth route screen open when pending auth opened it", () => {
  const state = createState(false);
  const { coordinator, ensuredTabs } = createCoordinator(state, () => {
    state.auth.mode = "login";
    state.auth.open = true;
  });

  coordinator.handleAuthStateChanged(null);

  assert.equal(state.auth.open, true);
  assert.equal(state.auth.mode, "login");
  assert.equal(state.auth.loading, false);
  assert.deepEqual(ensuredTabs, []);
});

test("signed-out startup still closes pre-existing auth screen without route intent", () => {
  const state = createState(true);
  const { coordinator, ensuredTabs } = createCoordinator(state);

  coordinator.handleAuthStateChanged(null);

  assert.equal(state.auth.open, false);
  assert.equal(state.auth.loading, false);
  assert.deepEqual(ensuredTabs, ["feed"]);
});

test("signed-out startup preserves auth screen on current auth route", () => {
  const state = createState(true);
  const { coordinator, ensuredTabs } = createCoordinator(state, () => {}, {
    windowObj: { location: { pathname: "/login" } }
  });

  coordinator.handleAuthStateChanged(null);

  assert.equal(state.auth.open, true);
  assert.equal(state.auth.loading, false);
  assert.deepEqual(ensuredTabs, []);
});
