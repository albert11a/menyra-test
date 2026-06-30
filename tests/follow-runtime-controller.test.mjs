import test from "node:test";
import assert from "node:assert/strict";

import { createFollowRuntimeController } from "../apps/menyra-social/core/follow/follow-runtime-controller.js";

test("following handle refresh patches visible profile through target transaction", () => {
  const state = {
    user: { uid: "self" },
    followingHandles: [],
    followingTargetIds: [],
    pendingFollowRequests: ["alice"],
    profileModal: { open: false, profile: null },
    profileView: {
      __profileTargetKey: "user:alice-id",
      profile: {
        uid: "alice-id",
        handle: "alice",
        pendingFollowRequest: true,
        __profileTargetKey: "user:alice-id"
      },
      posts: []
    }
  };
  let renderCount = 0;
  const controller = createFollowRuntimeController({
    state,
    followingKeyFn: (uid) => `following:${uid}`,
    renderFn: () => {
      renderCount += 1;
    },
    getLastRenderModeFn: () => "main"
  });

  controller.applyFollowingHandles(["alice"], { targetIds: ["alice-id"] });

  assert.equal(state.profileView.profile.pendingFollowRequest, false);
  assert.equal(state.profileView.__profileTargetKey, "user:alice-id");
  assert.deepEqual(state.pendingFollowRequests, []);
  assert.equal(renderCount, 1);
});
