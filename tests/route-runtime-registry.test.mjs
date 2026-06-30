import test from "node:test";
import assert from "node:assert/strict";

import {
  createSocialRouteRuntimeRegistry,
  resolveSocialRouteRuntimeKey
} from "../apps/menyra-social/core/app-shell/route-runtime-registry.js";

test("public profile route resolves to publicBusiness runtime", () => {
  const state = {
    activeTab: "profile",
    profileTopTab: "profile",
    profileView: {
      profile: { restaurantId: "restaurant-1" }
    }
  };

  assert.equal(resolveSocialRouteRuntimeKey(state), "publicBusiness");
});

test("public menu route resolves to publicMenu runtime", () => {
  const state = {
    activeTab: "profile",
    profileTopTab: "menu",
    profileView: {
      profile: { restaurantId: "restaurant-1" }
    }
  };

  assert.equal(resolveSocialRouteRuntimeKey(state), "publicMenu");
});

test("pending public profile route resolves without a visible profileView", () => {
  const state = {
    activeTab: "profile",
    profileTopTab: "profile",
    profileView: null,
    __pendingProfileTarget: {
      active: true,
      kind: "business",
      targetKey: "business:restaurant-1",
      restaurantId: "restaurant-1",
      topTab: "profile"
    }
  };

  assert.equal(resolveSocialRouteRuntimeKey(state), "publicBusiness");
});

test("pending public menu route resolves without a visible profileView", () => {
  const state = {
    activeTab: "profile",
    profileTopTab: "menu",
    profileView: null,
    __pendingProfileTarget: {
      active: true,
      kind: "business",
      targetKey: "business:restaurant-1",
      restaurantId: "restaurant-1",
      topTab: "menu"
    }
  };

  assert.equal(resolveSocialRouteRuntimeKey(state), "publicMenu");
});

test("public cart and favorites surfaces stay on publicMenu runtime", () => {
  const baseState = {
    activeTab: "profile",
    profileView: {
      profile: { restaurantId: "restaurant-1" }
    }
  };

  assert.equal(resolveSocialRouteRuntimeKey({
    ...baseState,
    profileTopTab: "cart"
  }), "publicMenu");
  assert.equal(resolveSocialRouteRuntimeKey({
    ...baseState,
    profileTopTab: "favorites"
  }), "publicMenu");
});

test("qr menu access stays on publicMenu runtime", () => {
  const state = {
    activeTab: "profile",
    profileTopTab: "profile",
    profileView: {
      profile: { restaurantId: "restaurant-1" },
      routePayload: { menuAccessSource: "qr" }
    }
  };

  assert.equal(resolveSocialRouteRuntimeKey(state), "publicMenu");
});

test("publicBusiness runtime can override the fallback public profile renderer", () => {
  const state = {
    activeTab: "profile",
    profileTopTab: "profile",
    profileView: {
      profile: { restaurantId: "restaurant-1" }
    }
  };
  const calls = [];
  const registry = createSocialRouteRuntimeRegistry({
    state,
    renderers: {
      publicProfile: () => "fallback-public-profile"
    },
    routeRuntimes: {
      publicBusiness: {
        render: () => {
          calls.push("render");
          return "runtime-public-business";
        },
        preload: () => {
          calls.push("preload");
        }
      }
    }
  });

  assert.equal(registry.renderActiveRoute(), "runtime-public-business");
  assert.deepEqual(calls, ["preload", "render"]);
});

test("publicMenu runtime can override public business runtime independently", () => {
  const state = {
    activeTab: "profile",
    profileTopTab: "menu",
    profileView: {
      profile: { restaurantId: "restaurant-1" }
    }
  };
  const registry = createSocialRouteRuntimeRegistry({
    state,
    renderers: {
      publicProfile: () => "fallback-public-profile"
    },
    routeRuntimes: {
      publicBusiness: {
        render: () => "runtime-public-business"
      },
      publicMenu: {
        render: () => "runtime-public-menu"
      }
    }
  });

  assert.equal(registry.renderActiveRoute(), "runtime-public-menu");
});

test("public runtime slots keep the existing renderer as fallback", () => {
  const state = {
    activeTab: "profile",
    profileTopTab: "menu",
    profileView: {
      profile: { restaurantId: "restaurant-1" }
    }
  };
  const registry = createSocialRouteRuntimeRegistry({
    state,
    renderers: {
      publicProfile: () => "fallback-public-profile"
    }
  });

  assert.equal(registry.renderActiveRoute(), "fallback-public-profile");
});

test("pending public profile renders the public profile fallback instead of own profile", () => {
  const state = {
    activeTab: "profile",
    profileTopTab: "profile",
    profileView: null,
    __pendingProfileTarget: {
      active: true,
      kind: "business",
      targetKey: "business:restaurant-1",
      restaurantId: "restaurant-1",
      topTab: "profile"
    }
  };
  const registry = createSocialRouteRuntimeRegistry({
    state,
    renderers: {
      profile: () => "own-profile",
      publicProfile: () => "pending-public-profile"
    }
  });

  assert.equal(registry.renderActiveRoute(), "pending-public-profile");
});
