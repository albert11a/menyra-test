import test from "node:test";
import assert from "node:assert/strict";

import { createAuthSessionStartupCoordinator } from "../apps/menyra-social/core/auth/auth-session-startup-coordinator.js";

// Regression: Nach dem Business-Login darf kein Feed-Zwischenstand sichtbar
// werden. Der Start-Tab-Hook (onAuthenticatedShellPrimed) muss NACH dem
// Anwenden der persistierten Profil-Hints und VOR dem ersten
// authentifizierten Render laufen.
test("onAuthenticatedShellPrimed runs after profile hints and before authenticated render", async () => {
  const calls = [];
  const state = {
    user: null,
    userProfile: {},
    auth: { open: false, loading: false },
    activeTab: "feed"
  };
  let authCallback = null;
  const microtasks = [];

  const coordinator = createAuthSessionStartupCoordinator({
    state,
    auth: { currentUser: null },
    onAuthStateChangedFn: (authObj, cb) => { authCallback = cb; },
    queueMicrotaskFn: (fn) => { microtasks.push(fn); },
    setTimeoutFn: () => 0,
    readAuthBootstrapSnapshot: () => null,
    applyAuthBootstrapSnapshot: () => false,
    applyPersistedAuthProfileHints: () => {
      calls.push("hints");
      state.userProfile = { restaurantId: "r1", name: "Bro Pizza" };
      return true;
    },
    onAuthenticatedShellPrimed: () => {
      calls.push("primed");
      // Simuliert die Dashboard-Start-Tab-Entscheidung in social-app.
      if (String(state.userProfile?.restaurantId || "").trim()) {
        state.activeTab = "dashboard";
      }
    },
    applyPendingInitialRouteState: () => { calls.push("route"); },
    render: () => { calls.push(`render:${state.activeTab}`); },
    runBootstrapUser: async () => true
  });

  coordinator.start({});
  // Alle Startup-Microtasks (Guest-Pfad) abarbeiten.
  while (microtasks.length) microtasks.shift()();
  assert.ok(typeof authCallback === "function");
  calls.length = 0;

  // Firebase meldet den eingeloggten Business-User.
  authCallback({ uid: "u1" });
  while (microtasks.length) microtasks.shift()();
  await Promise.resolve();

  const hintsIndex = calls.indexOf("hints");
  const primedIndex = calls.indexOf("primed");
  const firstRenderIndex = calls.findIndex((entry) => entry.startsWith("render:"));
  assert.ok(hintsIndex >= 0, "profile hints must be applied");
  assert.ok(primedIndex > hintsIndex, "primed hook must run after hints");
  assert.ok(firstRenderIndex > primedIndex, "first render must come after primed hook");
  // Der erste authentifizierte Render zeigt bereits das Dashboard - kein Feed davor.
  assert.equal(calls[firstRenderIndex], "render:dashboard");
  assert.ok(!calls.some((entry) => entry === "render:feed"), "no feed frame before dashboard");
});
