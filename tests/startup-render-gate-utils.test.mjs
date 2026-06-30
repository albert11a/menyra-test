import test from "node:test";
import assert from "node:assert/strict";

import {
  isProtectedSurfaceBlockedDuringStartup,
  isSafePublicStartupSurface,
  resolveStartupRenderGate
} from "../apps/menyra-social/core/auth/startup-render-gate-utils.js";

test("pending public business target is a safe startup surface without profileView", () => {
  const state = {
    activeTab: "profile",
    profileTopTab: "profile",
    authRestoreState: "pending",
    profileView: null,
    __pendingProfileTarget: {
      active: true,
      kind: "business",
      targetKey: "business:restaurant-1",
      restaurantId: "restaurant-1",
      topTab: "profile"
    }
  };

  assert.equal(isSafePublicStartupSurface(state), true);
  assert.equal(isProtectedSurfaceBlockedDuringStartup(state), false);

  const gate = resolveStartupRenderGate(state);
  assert.equal(gate.canRender, true);
  assert.equal(gate.safePublicSurface, true);
  assert.equal(gate.reason, "safe-public-startup-surface");
});

test("pending public menu target is a safe startup surface without profileView", () => {
  const state = {
    activeTab: "profile",
    profileTopTab: "menu",
    authRestoreState: "cachedReturningUser",
    profileView: null,
    __pendingProfileTarget: {
      active: true,
      kind: "business",
      targetKey: "business:restaurant-1",
      restaurantId: "restaurant-1",
      topTab: "menu",
      menuAccessSource: "qr",
      tableNumber: 4
    }
  };

  const gate = resolveStartupRenderGate(state);
  assert.equal(gate.canRender, true);
  assert.equal(gate.safePublicSurface, true);
  assert.equal(gate.surface, "public-menu");
});

test("pending public user target is safe without borrowing own profileView", () => {
  const state = {
    activeTab: "profile",
    profileTopTab: "profile",
    authRestoreState: "pending",
    profileView: null,
    userProfile: {
      uid: "self-user",
      name: "Self"
    },
    __pendingProfileTarget: {
      active: true,
      kind: "user",
      targetKey: "user:target-user",
      uid: "target-user",
      topTab: "profile"
    }
  };

  const gate = resolveStartupRenderGate(state);
  assert.equal(gate.canRender, true);
  assert.equal(gate.safePublicSurface, true);
  assert.equal(gate.surface, "public-profile");
});
