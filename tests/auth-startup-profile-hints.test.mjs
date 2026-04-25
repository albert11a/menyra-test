import assert from "node:assert/strict";
import test from "node:test";
import { createAuthStartupStateHelpers } from "../apps/menyra-social/core/auth/auth-startup-state-utils.js";

test("persisted auth profile hints prime the shell identity cache", () => {
  const storage = new Map();
  const safeStorage = {
    getItem: (key) => storage.get(key) || null,
    setItem: (key, value) => storage.set(key, value),
    removeItem: (key) => storage.delete(key)
  };
  const state = {
    user: { uid: "user-123", displayName: "Old Name", photoURL: "" },
    userProfile: { uid: "user-123", name: "", handle: "", avatar: "", role: "user", roles: [] },
    auth: { mode: "login", open: false }
  };
  const writtenAvatars = [];
  const writtenShellAvatars = [];
  let currentSnapshot = null;

  storage.set("profile:user-123", JSON.stringify({
    name: "Casa Rita",
    handle: "casarita",
    avatar: "https://cdn.example.test/avatar.jpg",
    role: "business",
    roles: ["owner"],
    restaurantId: "restaurant-123"
  }));

  const helpers = createAuthStartupStateHelpers({
    state,
    defaultProfile: { role: "user", roles: [] },
    safeStorage,
    authSnapshotKey: "auth:snapshot",
    profileKey: (uid) => `profile:${uid}`,
    sanitizeDisplayName: (value, fallback = "") => String(value || fallback || "").trim(),
    getOptimizedImageUrl: (value) => String(value || "").trim(),
    isPlaceholderUrl: (value) => !String(value || "").trim(),
    setUserAvatarCache: (next) => writtenAvatars.push(next),
    setLastShellAvatarUrl: (next) => writtenShellAvatars.push(next),
    getAuthBootstrapSnapshot: () => currentSnapshot,
    setAuthBootstrapSnapshot: (next) => {
      currentSnapshot = next;
    }
  });

  assert.equal(helpers.applyPersistedAuthProfileHints("user-123"), true);
  assert.equal(state.userProfile.name, "Casa Rita");
  assert.equal(state.userProfile.role, "business");
  assert.equal(state.userProfile.restaurantId, "restaurant-123");
  assert.deepEqual(writtenAvatars, ["https://cdn.example.test/avatar.jpg"]);
  assert.deepEqual(writtenShellAvatars, ["https://cdn.example.test/avatar.jpg"]);
  assert.equal(currentSnapshot.restaurantId, "restaurant-123");
  assert.equal(JSON.parse(storage.get("auth:snapshot")).role, "business");
});
