import assert from "node:assert/strict";
import test from "node:test";

import {
  ensurePushServiceWorkerRegistrationCore
} from "../apps/menyra-social/core/push/push-service-worker-utils.js";

test("push service worker registration updates stale versioned script url", async () => {
  const existing = {
    active: { scriptURL: "https://example.test/apps/menyra-social/sw.js?v=old-build" },
    updateCalls: 0,
    update() {
      this.updateCalls += 1;
      return Promise.resolve();
    }
  };
  const replacement = {
    active: { scriptURL: "https://example.test/apps/menyra-social/sw.js?v=new-build" }
  };
  const registerCalls = [];
  const issues = [];
  const registration = await ensurePushServiceWorkerRegistrationCore({
    navigatorObj: {
      serviceWorker: {
        getRegistration: async () => existing,
        register: async (url, options) => {
          registerCalls.push({ url, options });
          return replacement;
        }
      }
    },
    serviceWorkerScope: "/apps/menyra-social/",
    serviceWorkerUrl: "/apps/menyra-social/sw.js?v=new-build",
    setPushActivationIssue: (reason) => issues.push(reason)
  });

  assert.equal(registration, replacement);
  assert.equal(existing.updateCalls, 0);
  assert.deepEqual(registerCalls, [{
    url: "/apps/menyra-social/sw.js?v=new-build",
    options: {
      scope: "/apps/menyra-social/",
      updateViaCache: "none"
    }
  }]);
  assert.deepEqual(issues, []);
});

test("push service worker registration reuses and updates matching script url", async () => {
  const existing = {
    active: { scriptURL: "https://example.test/apps/menyra-social/sw.js?v=current-build" },
    updateCalls: 0,
    update() {
      this.updateCalls += 1;
      return Promise.resolve();
    }
  };
  let registerCalls = 0;
  const registration = await ensurePushServiceWorkerRegistrationCore({
    navigatorObj: {
      serviceWorker: {
        getRegistration: async () => existing,
        register: async () => {
          registerCalls += 1;
          return {};
        }
      }
    },
    serviceWorkerScope: "/apps/menyra-social/",
    serviceWorkerUrl: "/apps/menyra-social/sw.js?v=current-build"
  });

  assert.equal(registration, existing);
  assert.equal(existing.updateCalls, 1);
  assert.equal(registerCalls, 0);
});

test("push service worker registration uses no-cache update mode for first install", async () => {
  const installed = {
    active: { scriptURL: "https://example.test/apps/menyra-social/sw.js?v=current-build" }
  };
  const registerCalls = [];
  const registration = await ensurePushServiceWorkerRegistrationCore({
    navigatorObj: {
      serviceWorker: {
        getRegistration: async () => null,
        register: async (url, options) => {
          registerCalls.push({ url, options });
          return installed;
        }
      }
    },
    serviceWorkerScope: "/apps/menyra-social/",
    serviceWorkerUrl: "/apps/menyra-social/sw.js?v=current-build"
  });

  assert.equal(registration, installed);
  assert.deepEqual(registerCalls, [{
    url: "/apps/menyra-social/sw.js?v=current-build",
    options: {
      scope: "/apps/menyra-social/",
      updateViaCache: "none"
    }
  }]);
});
