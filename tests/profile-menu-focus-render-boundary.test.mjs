import test from "node:test";
import assert from "node:assert/strict";

import {
  createProfileMenuFocusRenderBoundary
} from "../apps/menyra-social/core/profile/profile-menu-focus-render-boundary.js";

test("profile menu focus render boundary loads renderer lazily", async () => {
  const calls = [];
  const boundary = createProfileMenuFocusRenderBoundary({
    importModuleFn: async (url) => {
      calls.push(["import", url]);
      return {
        createProfileMenuFocusRenderController: () => {
          calls.push(["create"]);
          return {
            renderPublicProfileView: () => "public-profile",
            renderMenuAdminView: () => "menu-admin",
            renderProfileView: () => "profile"
          };
        }
      };
    },
    requestRenderFn: () => {
      calls.push(["request-render"]);
    }
  });

  assert.equal(boundary.renderPublicProfileView(), "");
  await boundary.ensureLoaded();

  assert.equal(boundary.renderPublicProfileView(), "public-profile");
  assert.equal(boundary.renderMenuAdminView(), "menu-admin");
  assert.equal(boundary.renderProfileView(), "profile");
  assert.deepEqual(calls, [
    ["import", "./profile-menu-focus-render-controller.js"],
    ["create"],
    ["request-render"]
  ]);
});

test("profile menu focus render boundary dedupes in-flight imports", async () => {
  let importCount = 0;
  let resolveModule;
  const modulePromise = new Promise((resolve) => {
    resolveModule = resolve;
  });
  const boundary = createProfileMenuFocusRenderBoundary({
    importModuleFn: () => {
      importCount += 1;
      return modulePromise;
    }
  });

  const first = boundary.ensureLoaded();
  const second = boundary.ensureLoaded();
  boundary.preload();

  resolveModule({
    createProfileMenuFocusRenderController: () => ({
      renderPublicProfileView: () => "loaded"
    })
  });

  await Promise.all([first, second]);
  assert.equal(importCount, 1);
  assert.equal(boundary.renderPublicProfileView(), "loaded");
});
