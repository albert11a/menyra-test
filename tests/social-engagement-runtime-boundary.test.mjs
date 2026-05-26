import test from "node:test";
import assert from "node:assert/strict";

import {
  createSocialEngagementRuntimeBoundary
} from "../apps/menyra-social/core/profile/social-engagement-runtime-boundary.js";

test("social engagement runtime boundary loads controller lazily for async methods", async () => {
  const calls = [];
  const boundary = createSocialEngagementRuntimeBoundary({
    importModuleFn: async (url) => {
      calls.push(["import", url]);
      return {
        createSocialEngagementRuntimeController: () => {
          calls.push(["create"]);
          return {
            togglePostLike: async (postId) => {
              calls.push(["toggle", postId]);
              return true;
            }
          };
        }
      };
    }
  });

  assert.deepEqual(calls, []);
  assert.equal(await boundary.togglePostLike("post-1"), true);
  assert.deepEqual(calls, [
    ["import", "./social-engagement-runtime-controller.js"],
    ["create"],
    ["toggle", "post-1"]
  ]);
});

test("social engagement runtime boundary dedupes in-flight loads", async () => {
  let importCount = 0;
  let resolveModule;
  const modulePromise = new Promise((resolve) => {
    resolveModule = resolve;
  });
  const boundary = createSocialEngagementRuntimeBoundary({
    importModuleFn: () => {
      importCount += 1;
      return modulePromise;
    }
  });

  const first = boundary.ensureLoaded();
  const second = boundary.toggleMenuItemLike({ id: "item-1" });

  resolveModule({
    createSocialEngagementRuntimeController: () => ({
      toggleMenuItemLike: async () => "liked"
    })
  });

  assert.equal(await second, "liked");
  await first;
  assert.equal(importCount, 1);
});

test("social engagement runtime boundary defers sync listeners until loaded", async () => {
  const calls = [];
  let resolveModule;
  const modulePromise = new Promise((resolve) => {
    resolveModule = resolve;
  });
  const boundary = createSocialEngagementRuntimeBoundary({
    importModuleFn: () => modulePromise
  });

  boundary.attachPostMetaListeners({ id: "post-1" });
  assert.deepEqual(calls, []);

  resolveModule({
    createSocialEngagementRuntimeController: () => ({
      attachPostMetaListeners: (post) => {
        calls.push(["attach", post.id]);
      }
    })
  });

  await boundary.ensureLoaded();
  assert.deepEqual(calls, [["attach", "post-1"]]);
});

test("social engagement runtime boundary sync getters return fallback before load", () => {
  const boundary = createSocialEngagementRuntimeBoundary({
    importModuleFn: async () => ({
      createSocialEngagementRuntimeController: () => ({
        getPostDocRef: () => ({ id: "post-ref" })
      })
    })
  });

  assert.equal(boundary.getPostDocRef({ id: "post-1" }), null);
});
