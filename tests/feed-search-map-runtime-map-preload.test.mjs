import test from "node:test";
import assert from "node:assert/strict";

import {
  createFeedSearchMapRouteRuntime
} from "../apps/menyra-social/core/app-shell/feed-search-map-runtime.js";
import {
  isBackgroundPreloadDiscouragedCore
} from "../apps/menyra-social/core/common/task-schedule-utils.js";

function createFakeWindow({ publicWebsiteStartup = false } = {}) {
  const idleCallbacks = [];
  const timeouts = [];
  return {
    __MENYRA_SOCIAL_PUBLIC_WEBSITE_STARTUP__: publicWebsiteStartup,
    idleCallbacks,
    timeouts,
    requestIdleCallback: (fn, options) => {
      idleCallbacks.push({ fn, options });
      return idleCallbacks.length;
    },
    setTimeout: (fn, delayMs) => {
      timeouts.push({ fn, delayMs });
      return timeouts.length;
    },
    clearTimeout: () => {}
  };
}

function createRuntime({ windowObj, navigatorObj = null } = {}) {
  return createFeedSearchMapRouteRuntime({
    feed: {},
    discovery: {
      state: { activeTab: "feed", search: { query: "" } },
      windowObj,
      navigatorObj
    }
  });
}

test("deferred map view keeps the final map layout instead of a small card", () => {
  const runtime = createRuntime({ windowObj: createFakeWindow() });
  const markup = runtime.routeRuntimes.map.render();

  assert.match(markup, /class="map-view-root/);
  assert.match(markup, /class="map-view-surface"/);
  assert.doesNotMatch(markup, /min-h-\[500px\]/);
  assert.doesNotMatch(markup, /rounded-\[2\.5rem\]/);
});

test("discovery runtime is preloaded on idle after start", () => {
  const windowObj = createFakeWindow();
  createRuntime({ windowObj });

  assert.equal(windowObj.idleCallbacks.length, 1);
  assert.equal(typeof windowObj.idleCallbacks[0].fn, "function");
});

test("public website startup does not preload the discovery runtime", () => {
  const windowObj = createFakeWindow({ publicWebsiteStartup: true });
  createRuntime({ windowObj });

  assert.equal(windowObj.idleCallbacks.length, 0);
  assert.equal(windowObj.timeouts.length, 0);
});

test("save-data and 2G connections skip background preloads", () => {
  const saveDataWindow = createFakeWindow();
  createRuntime({
    windowObj: saveDataWindow,
    navigatorObj: { connection: { saveData: true, effectiveType: "4g" } }
  });
  assert.equal(saveDataWindow.idleCallbacks.length, 0);

  const slowWindow = createFakeWindow();
  createRuntime({
    windowObj: slowWindow,
    navigatorObj: { connection: { saveData: false, effectiveType: "2g" } }
  });
  assert.equal(slowWindow.idleCallbacks.length, 0);

  const fastWindow = createFakeWindow();
  createRuntime({
    windowObj: fastWindow,
    navigatorObj: { connection: { saveData: false, effectiveType: "4g" } }
  });
  assert.equal(fastWindow.idleCallbacks.length, 1);
});

test("background preload policy only blocks save-data and 2G", () => {
  assert.equal(isBackgroundPreloadDiscouragedCore(), false);
  assert.equal(isBackgroundPreloadDiscouragedCore({ navigatorObj: {} }), false);
  assert.equal(
    isBackgroundPreloadDiscouragedCore({ navigatorObj: { connection: { effectiveType: "3g" } } }),
    false
  );
  assert.equal(
    isBackgroundPreloadDiscouragedCore({ navigatorObj: { connection: { effectiveType: "slow-2g" } } }),
    true
  );
  assert.equal(
    isBackgroundPreloadDiscouragedCore({ navigatorObj: { webkitConnection: { saveData: true } } }),
    true
  );
});
