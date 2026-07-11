import test from "node:test";
import assert from "node:assert/strict";

import { createAuthSessionStartupCoordinator } from "../apps/menyra-social/core/auth/auth-session-startup-coordinator.js";
import { resolveStartupRenderGate } from "../apps/menyra-social/core/auth/startup-render-gate-utils.js";
import { resolveBusinessDashboardStartTabCore } from "../apps/menyra-social/core/auth/session-tab-guards.js";

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

// Erst-Login ohne lokale Profil-Hints: solange die Start-Tab-Entscheidung
// offen ist, zeigt der Render-Gate die neutrale Shell statt Feed.
test("startup render gate holds neutral shell while start tab decision is pending", () => {
  const pendingState = {
    user: { uid: "u1" },
    userProfile: { uid: "u1" },
    authRestoreState: "authenticated",
    profileTruthState: "loading",
    activeTab: "feed",
    __startTabDecisionPending: true
  };
  const gate = resolveStartupRenderGate(pendingState);
  assert.equal(gate.showNeutralShell, true);
  assert.equal(gate.reason, "start-tab-decision-pending");

  // KRITISCH (echter Cold-Login): eine "vertraute gecachte" Identitaet
  // (Name/Avatar vorhanden, __trustedCachedAuthUid gesetzt, aber keine
  // restaurantId) darf den Halt NICHT umgehen - genau dieser Zweig hat
  // vorher den Feed-Frame gemalt.
  const trustedCachedState = {
    ...pendingState,
    userProfile: { uid: "u1", name: "Bro Pizza", avatar: "https://img/a.jpg" },
    __trustedCachedAuthUid: "u1"
  };
  const trustedGate = resolveStartupRenderGate(trustedCachedState);
  assert.equal(trustedGate.showNeutralShell, true);
  assert.equal(trustedGate.reason, "start-tab-decision-pending");

  // Ohne offene Entscheidung rendert die vertraute Identitaet weiterhin sofort.
  const trustedConcluded = resolveStartupRenderGate({
    ...trustedCachedState,
    __startTabDecisionPending: false
  });
  assert.equal(trustedConcluded.showNeutralShell, false);
  assert.equal(trustedConcluded.reason, "authenticated-profile-revalidating-cached-surface");

  // Entscheidung abgeschlossen -> Feed rendert normal weiter.
  const concludedState = { ...pendingState, __startTabDecisionPending: false };
  const concludedGate = resolveStartupRenderGate(concludedState);
  assert.equal(concludedGate.showNeutralShell, false);

  // Profil fertig geladen (truth ready) -> Gate haelt nie fest,
  // selbst wenn das Flag (Watchdog-Fall) noch gesetzt waere.
  const readyState = { ...pendingState, profileTruthState: "ready" };
  const readyGate = resolveStartupRenderGate(readyState);
  assert.equal(readyGate.showNeutralShell, false);
});

test("start tab decision concludes for non-business once profile is resolved", () => {
  // Waehrend des Ladens: retry (Flag darf gesetzt bleiben).
  assert.equal(resolveBusinessDashboardStartTabCore({
    uid: "u1", userProfile: {}, activeTab: "feed", profileResolved: false
  }), "retry");
  // Nach dem Bootstrap ohne restaurantId: endgueltig skip (Flag wird geloest).
  assert.equal(resolveBusinessDashboardStartTabCore({
    uid: "u1", userProfile: {}, activeTab: "feed", profileResolved: true
  }), "skip");
  // Business nach Bootstrap: apply.
  assert.equal(resolveBusinessDashboardStartTabCore({
    uid: "u1", userProfile: { restaurantId: "r1" }, activeTab: "feed", profileResolved: true
  }), "apply");
});

// Kompletter Erst-Login-Fluss OHNE persistierte Hints: kein Feed-Frame,
// neutrale Shell bis zum Bootstrap, dann direkt Dashboard.
test("first login without hints renders neutral shell then dashboard, never feed", async () => {
  const frames = [];
  const state = {
    user: null,
    userProfile: {},
    auth: { open: true, loading: true },
    activeTab: "feed"
  };
  let authCallback = null;
  const microtasks = [];
  let decidedUid = "";

  const applyDecision = ({ profileResolved = false } = {}) => {
    const decision = resolveBusinessDashboardStartTabCore({
      uid: state.user?.uid || "",
      appliedUid: decidedUid,
      userProfile: state.userProfile,
      activeTab: state.activeTab,
      profileResolved
    });
    if (decision === "retry") {
      if (String(state.user?.uid || "").trim()) state.__startTabDecisionPending = true;
      return;
    }
    state.__startTabDecisionPending = false;
    decidedUid = String(state.user?.uid || "").trim();
    if (decision === "apply") state.activeTab = "dashboard";
  };

  const coordinator = createAuthSessionStartupCoordinator({
    state,
    auth: { currentUser: null },
    onAuthStateChangedFn: (authObj, cb) => { authCallback = cb; },
    queueMicrotaskFn: (fn) => { microtasks.push(fn); },
    setTimeoutFn: () => 0,
    readAuthBootstrapSnapshot: () => null,
    applyAuthBootstrapSnapshot: () => false,
    // Echter Cold-Login: keine restaurantId, aber Name/Avatar werden aus
    // Firebase-User/Shell-Snapshot geseedet -> Identitaet gilt als
    // "meaningful" und der Koordinator setzt __trustedCachedAuthUid.
    // Genau diese Konstellation hat frueher den Feed-Frame erzeugt.
    applyPersistedAuthProfileHints: () => {
      state.userProfile = {
        uid: "u1",
        name: "Bro Pizza",
        avatar: "https://img/business-logo.jpg"
      };
      return true;
    },
    onAuthenticatedShellPrimed: () => applyDecision(),
    applyPendingInitialRouteState: () => {},
    render: () => {
      const gate = resolveStartupRenderGate(state);
      frames.push(gate.showNeutralShell ? "neutral" : `main:${state.activeTab}`);
    },
    runBootstrapUser: async () => {
      // Bootstrap laedt das Business-Profil vom Server.
      state.userProfile = { uid: "u1", restaurantId: "r1", name: "Bro Pizza" };
      applyDecision({ profileResolved: true });
      return true;
    }
  });

  coordinator.start({});
  while (microtasks.length) microtasks.shift()();
  frames.length = 0;

  authCallback({ uid: "u1" });
  while (microtasks.length) microtasks.shift()();
  await Promise.resolve();
  await Promise.resolve();
  while (microtasks.length) microtasks.shift()();

  assert.ok(frames.length >= 1, "at least one frame rendered");
  assert.ok(!frames.some((frame) => frame === "main:feed"), `no feed frame, got: ${frames.join(", ")}`);
  assert.equal(frames[frames.length - 1], "main:dashboard");
});
