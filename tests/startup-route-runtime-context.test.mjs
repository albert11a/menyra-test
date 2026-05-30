import assert from "node:assert/strict";
import test from "node:test";

import {
  createStartupRouteRuntimeContext,
  publishStartupRouteRuntimeContext,
  readStartupRouteRuntimeContext,
  STARTUP_ROUTE_CONTEXT_GLOBAL_KEY
} from "../apps/menyra-social/core/router/startup-route-runtime-context.js";

test("startup route runtime context preserves public menu qr route details", () => {
  const context = createStartupRouteRuntimeContext({
    entryMode: "public",
    locationObj: {
      pathname: "/moka-coffee/menu",
      search: "?src=qr&table=7",
      hash: ""
    },
    nowMs: () => 123
  });

  assert.equal(context.entryMode, "public");
  assert.equal(context.kind, "business");
  assert.equal(context.pendingInitialTab, "profile");
  assert.equal(context.pendingProfileRestaurantId, "moka-coffee");
  assert.equal(context.pendingProfileTopTab, "menu");
  assert.equal(context.pendingProfileContentTab, "menu");
  assert.equal(context.pendingProfileAccessSource, "qr");
  assert.equal(context.pendingProfileTableNumber, 7);
  assert.equal(context.startupSurface, "menu");
  assert.equal(context.publicBusiness.routeId, "moka-coffee");
  assert.equal(context.publicBusiness.isQr, true);
});

test("startup route runtime context keeps app routes light for feed and map", () => {
  const feed = createStartupRouteRuntimeContext({
    entryMode: "app",
    locationObj: { pathname: "/feed", search: "", hash: "" }
  });
  const map = createStartupRouteRuntimeContext({
    entryMode: "app",
    locationObj: { pathname: "/map", search: "", hash: "" }
  });

  assert.equal(feed.kind, "system");
  assert.equal(feed.pendingInitialTab, "feed");
  assert.equal(feed.startupSurface, "feed");
  assert.equal(feed.isPublicWebsiteStartup, false);

  assert.equal(map.kind, "system");
  assert.equal(map.pendingInitialTab, "map");
  assert.equal(map.startupSurface, "map");
  assert.equal(map.isPublicWebsiteStartup, false);
});

test("startup route runtime context can be published before runtime import", () => {
  const previous = globalThis[STARTUP_ROUTE_CONTEXT_GLOBAL_KEY];
  try {
    const context = publishStartupRouteRuntimeContext({
      entryMode: "public",
      locationObj: {
        pathname: "/casarita/menu",
        search: "?src=qr&table=3",
        hash: ""
      },
      nowMs: () => 456
    });
    const current = readStartupRouteRuntimeContext();

    assert.equal(current, context);
    assert.equal(current.pendingProfileTopTab, "menu");
    assert.equal(current.pendingProfileAccessSource, "qr");
    assert.equal(current.pendingProfileTableNumber, 3);
  } finally {
    if (previous === undefined) {
      delete globalThis[STARTUP_ROUTE_CONTEXT_GLOBAL_KEY];
    } else {
      globalThis[STARTUP_ROUTE_CONTEXT_GLOBAL_KEY] = previous;
    }
  }
});
