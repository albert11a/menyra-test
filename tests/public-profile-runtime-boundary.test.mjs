import test from "node:test";
import assert from "node:assert/strict";

import {
  createPublicProfileRuntimeBoundary
} from "../apps/menyra-social/core/profile/public-profile-runtime-boundary.js";

test("public profile runtime boundary replays show calls after lazy load", async () => {
  const calls = [];
  let resolveModule;
  const modulePromise = new Promise((resolve) => {
    resolveModule = resolve;
  });
  const boundary = createPublicProfileRuntimeBoundary({
    requestRenderFn: () => calls.push(["request-render"]),
    importModuleFn: (url) => {
      calls.push(["import", url]);
      return modulePromise;
    }
  });

  boundary.showPublicProfile({ restaurantId: "r1" }, [{ id: "p1" }], { topTab: "profile" });
  assert.deepEqual(calls, [["import", "./public-profile-runtime-controller.js"]]);

  resolveModule({
    createPublicProfileRuntimeController: () => ({
      showPublicProfile: (profile, posts, options) => {
        calls.push(["show", profile.restaurantId, posts.length, options.topTab]);
      }
    })
  });

  await boundary.ensurePublicProfileRuntimeLoaded();
  assert.deepEqual(calls, [
    ["import", "./public-profile-runtime-controller.js"],
    ["request-render"],
    ["show", "r1", 1, "profile"]
  ]);
});

test("public profile runtime boundary keeps profile listener unsub synchronously", async () => {
  const calls = [];
  const unsub = () => calls.push(["unsub"]);
  const boundary = createPublicProfileRuntimeBoundary({
    importModuleFn: async () => ({
      createPublicProfileRuntimeController: () => ({
        setProfileViewUnsub: (next) => calls.push(["set", typeof next]),
        getProfileViewUnsub: () => "loaded-unsub"
      })
    })
  });

  boundary.setProfileViewUnsub(unsub);
  assert.equal(boundary.getProfileViewUnsub(), unsub);

  await boundary.ensurePublicProfileRuntimeLoaded();
  assert.equal(boundary.getProfileViewUnsub(), "loaded-unsub");
  assert.deepEqual(calls, [["set", "function"]]);
});

test("public profile runtime boundary stops fallback listener before load", () => {
  const calls = [];
  const boundary = createPublicProfileRuntimeBoundary();

  boundary.setProfileViewUnsub(() => calls.push(["unsub"]));
  boundary.stopProfileViewListener();

  assert.deepEqual(calls, [["unsub"]]);
  assert.equal(boundary.getProfileViewUnsub(), null);
});

test("public profile runtime boundary provides normalizer fallback before load", () => {
  const boundary = createPublicProfileRuntimeBoundary({
    importModuleFn: async () => ({
      createPublicProfileRuntimeController: () => ({
        normalizeExternalProfile: () => ({ name: "loaded" })
      })
    })
  });

  const normalized = boundary.normalizeExternalProfile({
    profileDoc: { id: "r1", data: { name: "Casa Rita", publicSlug: "casarita" } },
    posts: [{ id: "p1" }]
  });

  assert.equal(normalized.name, "Casa Rita");
  assert.equal(normalized.restaurantId, "r1");
  assert.equal(normalized.publicSlug, "casarita");
  assert.equal(normalized.posts.length, 1);
});

test("public profile runtime boundary awaits async data methods", async () => {
  const boundary = createPublicProfileRuntimeBoundary({
    importModuleFn: async () => ({
      createPublicProfileRuntimeController: () => ({
        fetchBusinessProfileDoc: async ({ restaurantId }) => ({ id: restaurantId }),
        loadBusinessPostsForRestaurant: async (restaurantId) => [{ id: `post-${restaurantId}` }]
      })
    })
  });

  assert.deepEqual(await boundary.fetchBusinessProfileDoc({ restaurantId: "r1" }), { id: "r1" });
  assert.deepEqual(await boundary.loadBusinessPostsForRestaurant("r1"), [{ id: "post-r1" }]);
});
