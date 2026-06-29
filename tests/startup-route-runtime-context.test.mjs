import assert from "node:assert/strict";
import test from "node:test";

import {
  createStartupRouteRuntimeContext,
  promoteStartupRouteRuntimeContextWithPublicRouteResolution,
  publishStartupRouteRuntimeContext,
  readStartupRouteRuntimeContext,
  STARTUP_ROUTE_CONTEXT_GLOBAL_KEY
} from "../apps/menyra-social/core/router/startup-route-runtime-context.js";

const PUBLIC_ROUTE_CACHE_GLOBAL_KEY = "__MENYRA_PUBLIC_ROUTE_RESOLUTIONS__";

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

test("startup route runtime context uses cached publicRoutes canonical id for a slug", () => {
  const previous = globalThis[PUBLIC_ROUTE_CACHE_GLOBAL_KEY];
  globalThis[PUBLIC_ROUTE_CACHE_GLOBAL_KEY] = new Map([
    ["bro-pizza", {
      found: true,
      status: "active",
      inputSlug: "bro-pizza",
      canonicalSlug: "bro-pizza",
      restaurantId: "BroPizzaRestaurant123",
      source: "publicRoutes"
    }]
  ]);
  try {
    const context = createStartupRouteRuntimeContext({
      entryMode: "public",
      locationObj: {
        pathname: "/bro-pizza/menu",
        search: "",
        hash: ""
      },
      nowMs: () => 124
    });

    assert.equal(context.pendingProfileRestaurantId, "BroPizzaRestaurant123");
    assert.equal(context.publicBusiness.routeId, "BroPizzaRestaurant123");
    assert.equal(context.publicBusiness.inputSlug, "bro-pizza");
    assert.equal(context.publicBusiness.canonicalSlug, "bro-pizza");
    assert.equal(context.publicBusiness.isCanonicalResolved, true);
    assert.equal(context.pendingProfileTopTab, "menu");
  } finally {
    if (previous === undefined) {
      delete globalThis[PUBLIC_ROUTE_CACHE_GLOBAL_KEY];
    } else {
      globalThis[PUBLIC_ROUTE_CACHE_GLOBAL_KEY] = previous;
    }
  }
});

test("startup route runtime context lets qr r query id beat the slug hint", () => {
  const context = createStartupRouteRuntimeContext({
    entryMode: "public",
    locationObj: {
      pathname: "/bro-pizza/menu",
      search: "?src=qr&r=BroPizzaRestaurant123&table=7",
      hash: ""
    },
    nowMs: () => 125
  });

  assert.equal(context.pendingProfileRestaurantId, "BroPizzaRestaurant123");
  assert.equal(context.pendingProfileTopTab, "menu");
  assert.equal(context.pendingProfileContentTab, "menu");
  assert.equal(context.pendingProfileAccessSource, "qr");
  assert.equal(context.pendingProfileTableNumber, 7);
  assert.equal(context.publicBusiness.routeId, "BroPizzaRestaurant123");
  assert.equal(context.publicBusiness.inputSlug, "bro-pizza");
  assert.equal(context.publicBusiness.isQr, true);
  assert.equal(context.publicBusiness.isCanonicalResolved, true);
});

test("startup route runtime context can be promoted when publicRoute resolves after publish", () => {
  const previous = globalThis[STARTUP_ROUTE_CONTEXT_GLOBAL_KEY];
  try {
    publishStartupRouteRuntimeContext({
      entryMode: "public",
      locationObj: {
        pathname: "/terrassiere/menu",
        search: "?src=qr&table=11",
        hash: ""
      },
      nowMs: () => 126
    });

    const promoted = promoteStartupRouteRuntimeContextWithPublicRouteResolution({
      found: true,
      status: "active",
      inputSlug: "terrassiere",
      canonicalSlug: "terrassiere",
      restaurantId: "TerrassiereRestaurant123",
      source: "publicRoutes"
    }, { dispatchEvent: false });
    const current = readStartupRouteRuntimeContext();

    assert.equal(promoted, current);
    assert.equal(current.pendingProfileRestaurantId, "TerrassiereRestaurant123");
    assert.equal(current.publicBusiness.routeId, "TerrassiereRestaurant123");
    assert.equal(current.publicBusiness.inputSlug, "terrassiere");
    assert.equal(current.publicBusiness.isCanonicalResolved, true);
    assert.equal(current.pendingProfileAccessSource, "qr");
    assert.equal(current.pendingProfileTableNumber, 11);
  } finally {
    if (previous === undefined) {
      delete globalThis[STARTUP_ROUTE_CONTEXT_GLOBAL_KEY];
    } else {
      globalThis[STARTUP_ROUTE_CONTEXT_GLOBAL_KEY] = previous;
    }
  }
});

test("startup route runtime context ignores unrelated publicRoute promotion", () => {
  const previous = globalThis[STARTUP_ROUTE_CONTEXT_GLOBAL_KEY];
  try {
    const initial = publishStartupRouteRuntimeContext({
      entryMode: "public",
      locationObj: {
        pathname: "/bro-pizza/menu",
        search: "",
        hash: ""
      },
      nowMs: () => 127
    });

    const promoted = promoteStartupRouteRuntimeContextWithPublicRouteResolution({
      found: true,
      status: "active",
      inputSlug: "terrassiere",
      canonicalSlug: "terrassiere",
      restaurantId: "TerrassiereRestaurant123",
      source: "publicRoutes"
    }, { dispatchEvent: false });
    const current = readStartupRouteRuntimeContext();

    assert.equal(promoted, current);
    assert.equal(current, initial);
    assert.equal(current.pendingProfileRestaurantId, "bro-pizza");
    assert.equal(current.publicBusiness.routeId, "bro-pizza");
    assert.equal(current.publicBusiness.isCanonicalResolved, false);
  } finally {
    if (previous === undefined) {
      delete globalThis[STARTUP_ROUTE_CONTEXT_GLOBAL_KEY];
    } else {
      globalThis[STARTUP_ROUTE_CONTEXT_GLOBAL_KEY] = previous;
    }
  }
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
