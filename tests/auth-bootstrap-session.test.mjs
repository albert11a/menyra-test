import assert from "node:assert/strict";
import test from "node:test";
import { bootstrapAuthenticatedSessionCore } from "../apps/menyra-social/core/auth/auth-user-bootstrap-utils.js";

test("authenticated bootstrap commits the shell immediately after canonical profile load", async () => {
  const calls = [];
  const user = { uid: "user-123" };
  let profileLoaded = false;

  await bootstrapAuthenticatedSessionCore({
    user,
    activeTab: () => "feed",
    loadAuthProfile: async () => {
      calls.push("loadProfile");
      profileLoaded = true;
    },
    markBootstrapAuthProfileLoaded: () => {
      calls.push("markProfileLoaded");
      assert.equal(profileLoaded, true);
    },
    afterAuthShellReady: () => {
      calls.push("shellReady");
      assert.equal(profileLoaded, true);
    },
    startLiveListeners: () => {
      calls.push("startLive");
    },
    ensureTabData: (tab, options = {}) => {
      const mode = options?.preloadOnly === true ? "preload" : "full";
      calls.push(`ensure:${tab}:${mode}`);
      assert.equal(profileLoaded, true);
    },
    primeCriticalProfile: () => {
      calls.push("primeCritical");
    },
    getRestaurantId: () => "",
    hydrateRestaurantsByIds: async () => {
      calls.push("hydrateRestaurants");
    },
    resolveRoleSwitchTargets: async () => {
      calls.push("resolveRoles");
    },
    ensureFollowingLoaded: () => {
      calls.push("ensureFollowing");
    }
  });

  assert.deepEqual(calls.slice(0, 4), [
    "loadProfile",
    "markProfileLoaded",
    "shellReady",
    "startLive"
  ]);
  assert.deepEqual(calls.slice(4, 5), [
    "ensure:feed:full"
  ]);
  assert.ok(calls.includes("ensure:profile:preload"));
  assert.ok(calls.indexOf("primeCritical") > calls.indexOf("shellReady"));
  assert.ok(calls.indexOf("resolveRoles") > calls.indexOf("primeCritical"));
});

test("authenticated bootstrap does not run shell work after a stale auth transition", async () => {
  const calls = [];

  const result = await bootstrapAuthenticatedSessionCore({
    user: { uid: "old-user" },
    loadAuthProfile: async () => {
      calls.push("loadProfile");
    },
    shouldContinue: () => false,
    afterAuthShellReady: () => {
      calls.push("shellReady");
    },
    ensureTabData: () => {
      calls.push("ensureTab");
    },
    startLiveListeners: () => {
      calls.push("startLive");
    }
  });

  assert.equal(result, false);
  assert.deepEqual(calls, ["loadProfile"]);
});
