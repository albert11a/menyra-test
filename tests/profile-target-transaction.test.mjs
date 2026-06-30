import assert from "node:assert/strict";
import test from "node:test";

import {
  createProfileTargetTransaction,
  normalizeProfileTargetKey,
  resolveProfileTargetKeyFromProfile
} from "../apps/menyra-social/core/profile/profile-target-transaction.js";

test("profile transaction rejects stale business commits after a newer load starts", () => {
  const state = {};
  let renders = 0;
  const tx = createProfileTargetTransaction({
    state,
    render: () => { renders += 1; }
  });

  const first = tx.beginProfileLoad({ kind: "business", restaurantId: "restaurant-a" });
  tx.beginProfileLoad({ kind: "business", restaurantId: "restaurant-b" });

  const committed = tx.commitPublicProfileBundleIfCurrent({
    loadId: first.loadId,
    targetKey: first.targetKey,
    view: {
      profile: { restaurantId: "restaurant-a", name: "A" },
      posts: []
    },
    topTab: "profile",
    contentTab: "posts"
  });

  assert.equal(committed, false);
  assert.equal(state.profileView, undefined);
  assert.equal(renders, 0);
});

test("profile transaction commits only the current public profile bundle", () => {
  const state = {};
  let renders = 0;
  const tx = createProfileTargetTransaction({
    state,
    render: () => { renders += 1; }
  });
  const current = tx.beginProfileLoad({ kind: "user", uid: "user-1" });

  const committed = tx.commitPublicProfileBundleIfCurrent({
    loadId: current.loadId,
    targetKey: current.targetKey,
    view: {
      profile: { uid: "user-1", handle: "ana", name: "Ana" },
      posts: [{ id: "post-1" }]
    },
    topTab: "profile",
    contentTab: "posts"
  });

  assert.equal(committed, true);
  assert.equal(state.profileView.profile.uid, "user-1");
  assert.equal(state.profileView.__profileTargetKey, "user:user-1");
  assert.equal(state.__pendingProfileTarget, null);
  assert.equal(renders, 1);
});

test("profile transaction blocks unguarded legacy commits while a load is pending", () => {
  const state = {};
  let renders = 0;
  const tx = createProfileTargetTransaction({
    state,
    render: () => { renders += 1; }
  });

  tx.beginProfileLoad({ kind: "business", restaurantId: "restaurant-b" });

  const committed = tx.commitPublicProfileBundleIfCurrent({
    view: {
      profile: { restaurantId: "restaurant-a", name: "A" },
      posts: []
    },
    topTab: "profile",
    contentTab: "posts"
  });

  assert.equal(committed, false);
  assert.equal(state.profileView, undefined);
  assert.equal(renders, 0);
});

test("profile transaction patches only the visible matching target", () => {
  const state = {
    profileView: {
      __profileTargetKey: "business:restaurant-a",
      profile: { restaurantId: "restaurant-a", name: "Old" },
      posts: []
    }
  };
  const tx = createProfileTargetTransaction({ state });

  assert.equal(tx.patchVisibleProfileIfCurrent("business:restaurant-b", { name: "Wrong" }), false);
  assert.equal(state.profileView.profile.name, "Old");

  assert.equal(tx.patchVisibleProfileIfCurrent("business:restaurant-a", { name: "New" }), true);
  assert.equal(state.profileView.profile.name, "New");
});

test("profile target keys normalize business and user identities", () => {
  assert.equal(normalizeProfileTargetKey({ kind: "business", restaurantId: " CasaRita " }), "business:casarita");
  assert.equal(normalizeProfileTargetKey({ kind: "user", handle: "@Ana" }), "user:ana");
  assert.equal(resolveProfileTargetKeyFromProfile({ canonicalRestaurantId: "Rest-1" }), "business:rest-1");
});
