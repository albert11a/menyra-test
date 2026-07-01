import assert from "node:assert/strict";
import test from "node:test";

import { createPublicProfileRuntimeController } from "../apps/menyra-social/core/profile/public-profile-runtime-controller.js";

async function withMutedConsoleError(task) {
  const original = console.error;
  console.error = () => {};
  try {
    return await task();
  } finally {
    console.error = original;
  }
}

function createProfileSwitchState() {
  return {
    activeTab: "profile",
    profileTopTab: "profile",
    profileContentTab: "posts",
    profileBackTab: "",
    profileLandingStep: 0,
    profileLandingGreetingIndex: 0,
    profileLandingTourIndex: 0,
    drawerOpen: false,
    profileViewMode: "grid",
    profilePostMenuId: null,
    profileModal: { open: false, profile: null },
    profileView: {
      profile: {
        restaurantId: "casarita",
        canonicalRestaurantId: "casarita",
        name: "Casarita",
        handle: "casarita",
        postsLoaded: true,
        truthState: "stable"
      },
      posts: [],
      routePayload: {
        owner: "web-direct",
        routeFirst: true,
        restaurantId: "casarita",
        canonicalRestaurantId: "casarita",
        businessSnapshot: { restaurantId: "casarita" }
      },
      directEntry: {
        active: true,
        owner: "web-direct",
        routeFirst: true,
        webPriority: true,
        postsFirst: true,
        topTab: "profile",
        contentTab: "posts"
      }
    },
    __webDirectEntry: {
      active: true,
      restaurantId: "casarita",
      canonicalRestaurantId: "casarita",
      owner: "web-direct",
      routeFirst: true,
      webPriority: true,
      postsFirst: true,
      topTab: "profile",
      contentTab: "posts"
    },
    menu: {
      restaurantId: "casarita",
      items: [{ id: "casarita-item" }],
      loading: false,
      error: "",
      source: "public",
      statusBadgeVisible: true,
      truthState: "seeded"
    },
    focus: {
      restaurantId: "casarita",
      items: [{ id: "casarita-focus" }],
      loading: false,
      enabled: true,
      error: "",
      index: 0,
      truthSource: "public-menu",
      truthState: "seeded"
    }
  };
}

test("public profile switch does not inherit stale route/menu state from previous business", () => {
  const state = createProfileSwitchState();
  let renderCount = 0;
  const controller = createPublicProfileRuntimeController({
    state,
    render: () => {
      renderCount += 1;
    },
    normalizeHandle: (value = "") => String(value || "").trim().toLowerCase()
  });

  controller.showPublicProfile({
    restaurantId: "moka",
    name: "Moka Coffee",
    handle: "moka-coffee",
    postsLoaded: true,
    truthState: "stable"
  }, [], {
    showBack: true,
    backTab: "search",
    topTab: "profile",
    contentTab: "posts"
  });

  assert.equal(state.profileView.profile.restaurantId, "moka");
  assert.equal(state.profileView.profile.canonicalRestaurantId, "moka");
  assert.equal(state.profileView.routePayload, null);
  assert.equal(state.profileView.directEntry, null);
  assert.equal(state.__webDirectEntry.active, false);
  assert.equal(state.menu.restaurantId, "moka");
  assert.deepEqual(state.menu.items, []);
  assert.equal(state.menu.truthState, "unknown");
  assert.equal(state.focus.restaurantId, "moka");
  assert.deepEqual(state.focus.items, []);
  assert.equal(state.focus.truthState, "unknown");
  assert.equal(renderCount, 1);
});

test("direct public profile route does not queue browser history push", () => {
  const state = {
    activeTab: "feed",
    profileTopTab: "profile",
    profileContentTab: "posts",
    profileBackTab: "",
    profileLandingStep: 0,
    profileLandingGreetingIndex: 0,
    profileLandingTourIndex: 0,
    drawerOpen: false,
    profileViewMode: "grid",
    profilePostMenuId: null,
    profileModal: { open: false, profile: null },
    profileView: null,
    __nextRouteHistoryMode: ""
  };
  const controller = createPublicProfileRuntimeController({
    state,
    render: () => {},
    normalizeHandle: (value = "") => String(value || "").trim().toLowerCase()
  });

  controller.showPublicProfile({
    restaurantId: "casarita",
    canonicalRestaurantId: "casarita",
    name: "Casarita",
    handle: "casarita",
    postsLoaded: true,
    truthState: "stable"
  }, [], {
    showBack: false,
    topTab: "profile",
    contentTab: "posts"
  });

  assert.equal(state.activeTab, "profile");
  assert.equal(state.profileBackTab, "");
  assert.equal(state.__nextRouteHistoryMode, "");
});

test("public profile header preserve does not keep loading bio as final bio", () => {
  const state = {
    activeTab: "profile",
    profileTopTab: "menu",
    profileContentTab: "menu",
    profileBackTab: "",
    profileLandingStep: 0,
    profileLandingGreetingIndex: 0,
    profileLandingTourIndex: 0,
    drawerOpen: false,
    profileViewMode: "grid",
    profilePostMenuId: null,
    profileModal: { open: false, profile: null },
    profileView: {
      profile: {
        restaurantId: "mama-id",
        canonicalRestaurantId: "mama-id",
        name: "Mama Mantia",
        handle: "mama-mantia",
        bio: "Profil wird geladen...",
        identityTruthState: "ready",
        postsLoaded: false,
        truthState: "route-pending-loading"
      },
      posts: [],
      routePayload: {
        owner: "web-direct",
        routeFirst: true,
        restaurantId: "mama-mantia",
        canonicalRestaurantId: "mama-id",
        truth: { identity: "seeded" },
        identity: { name: "Mama Mantia", handle: "mama-mantia" },
        businessSnapshot: {
          restaurantId: "mama-id",
          truth: { identity: "seeded" }
        }
      },
      directEntry: {
        active: true,
        owner: "web-direct",
        routeFirst: true,
        webPriority: true,
        menuFirst: true,
        topTab: "menu",
        contentTab: "menu"
      }
    },
    __webDirectEntry: {
      active: true,
      restaurantId: "mama-mantia",
      canonicalRestaurantId: "mama-id",
      owner: "web-direct",
      routeFirst: true,
      webPriority: true,
      menuFirst: true,
      topTab: "menu",
      contentTab: "menu"
    },
    menu: {
      restaurantId: "mama-id",
      items: [],
      loading: true,
      error: "",
      source: "public",
      truthState: "unknown"
    },
    focus: {
      restaurantId: "mama-id",
      items: [],
      loading: true,
      error: "",
      truthSource: "public-menu",
      truthState: "unknown"
    }
  };
  const controller = createPublicProfileRuntimeController({
    state,
    render: () => {},
    normalizeHandle: (value = "") => String(value || "").trim().toLowerCase()
  });

  controller.showPublicProfile({
    restaurantId: "mama-id",
    canonicalRestaurantId: "mama-id",
    name: "Mama Mantia",
    handle: "mama-mantia",
    bio: "",
    identityTruthState: "ready",
    postsLoaded: false,
    truthState: "loading"
  }, [], {
    showBack: false,
    topTab: "menu",
    contentTab: "menu",
    directEntry: {
      active: true,
      owner: "web-direct",
      routeFirst: true,
      webPriority: true,
      menuFirst: true,
      topTab: "menu",
      contentTab: "menu"
    },
    routePayload: state.profileView.routePayload
  });

  assert.equal(state.profileView.profile.name, "Mama Mantia");
  assert.equal(state.profileView.profile.bio, "");
});

function createDocsSnapshot(rows = []) {
  return {
    forEach(callback) {
      rows.forEach((row) => {
        callback({
          id: row.id,
          data: () => ({ ...row })
        });
      });
    }
  };
}

function createBusinessPostsController({
  rows = [],
  fastLimits = {},
  getDocsFn = null,
  queryCalls = []
} = {}) {
  const safeRows = Array.isArray(rows) ? rows : [];
  const readDocs = typeof getDocsFn === "function"
    ? getDocsFn
    : async (refOrQuery) => {
      const constraints = Array.isArray(refOrQuery?.constraints) ? refOrQuery.constraints : [];
      queryCalls.push(constraints);
      const limitValue = constraints.find((constraint) => constraint?.type === "limit")?.value;
      const selectedRows = Number.isFinite(Number(limitValue))
        ? safeRows.slice(0, Number(limitValue))
        : safeRows;
      return createDocsSnapshot(selectedRows);
    };
  return createPublicProfileRuntimeController({
    state: {},
    db: {},
    fastLimits,
    collectionFn: (_db, ...path) => ({ path }),
    queryFn: (ref, ...constraints) => ({ ref, constraints }),
    orderByFn: (field, direction) => ({ type: "orderBy", field, direction }),
    limitFn: (value) => ({ type: "limit", value }),
    getDocsFn: readDocs
  });
}

test("public business posts initial page uses a bounded read without becoming the full cache", async () => {
  const queryCalls = [];
  const rows = Array.from({ length: 5 }, (_value, index) => ({
    id: `post-${index + 1}`,
    url: `https://cdn.example/post-${index + 1}.jpg`,
    status: "active",
    createdAt: index
  }));
  const controller = createBusinessPostsController({
    rows,
    fastLimits: { publicBusinessPostsInitialPage: 2 },
    queryCalls
  });

  const initialPosts = await controller.loadBusinessPostsForRestaurant("restaurant-1", {
    skipProfileResolve: true,
    initialPage: true
  });
  assert.equal(initialPosts.length, 2);
  assert.equal(queryCalls.length, 1);
  assert.equal(queryCalls[0].find((constraint) => constraint?.type === "limit")?.value, 2);

  const fullPosts = await controller.loadBusinessPostsForRestaurant("restaurant-1", {
    skipProfileResolve: true
  });
  assert.equal(fullPosts.length, 5);
  assert.equal(queryCalls.length, 2);
  assert.equal(queryCalls[1].some((constraint) => constraint?.type === "limit"), false);
});

test("public business posts initial page dedupes concurrent visible reads", async () => {
  let resolveSnapshot = null;
  let getDocsCalls = 0;
  const queryCalls = [];
  const rows = [
    { id: "post-1", url: "https://cdn.example/post-1.jpg", status: "active" },
    { id: "post-2", url: "https://cdn.example/post-2.jpg", status: "active" }
  ];
  const controller = createBusinessPostsController({
    rows,
    fastLimits: { publicBusinessPostsInitialPage: 1 },
    queryCalls,
    getDocsFn: async (refOrQuery) => {
      getDocsCalls += 1;
      queryCalls.push(Array.isArray(refOrQuery?.constraints) ? refOrQuery.constraints : []);
      return new Promise((resolve) => {
        resolveSnapshot = () => {
          const constraints = Array.isArray(refOrQuery?.constraints) ? refOrQuery.constraints : [];
          const limitValue = constraints.find((constraint) => constraint?.type === "limit")?.value;
          resolve(createDocsSnapshot(rows.slice(0, Number(limitValue) || rows.length)));
        };
      });
    }
  });

  const firstRead = controller.loadBusinessPostsForRestaurant("restaurant-2", {
    skipProfileResolve: true,
    initialPage: true
  });
  const secondRead = controller.loadBusinessPostsForRestaurant("restaurant-2", {
    skipProfileResolve: true,
    initialPage: true
  });

  assert.equal(getDocsCalls, 1);
  assert.equal(queryCalls[0].find((constraint) => constraint?.type === "limit")?.value, 1);

  resolveSnapshot();
  const [firstPosts, secondPosts] = await Promise.all([firstRead, secondRead]);
  assert.equal(firstPosts.length, 1);
  assert.deepEqual(secondPosts, firstPosts);
});

test("public business posts transient read uses positive cache instead of empty fallback", async () => {
  let failReads = false;
  const rows = [
    { id: "post-1", url: "https://cdn.example/post-1.jpg", status: "active" }
  ];
  const controller = createBusinessPostsController({
    rows,
    getDocsFn: async (refOrQuery) => {
      if (failReads) throw new Error("transient posts read failed");
      const constraints = Array.isArray(refOrQuery?.constraints) ? refOrQuery.constraints : [];
      const limitValue = constraints.find((constraint) => constraint?.type === "limit")?.value;
      return createDocsSnapshot(Number.isFinite(Number(limitValue)) ? rows.slice(0, Number(limitValue)) : rows);
    }
  });

  const firstPosts = await controller.loadBusinessPostsForRestaurant("restaurant-cache", {
    skipProfileResolve: true,
    initialPage: true
  });
  assert.equal(firstPosts.length, 1);

  failReads = true;
  const fallbackPosts = await withMutedConsoleError(() => (
    controller.loadBusinessPostsForRestaurant("restaurant-cache", {
      skipProfileResolve: true,
      force: true,
      initialPage: true
    })
  ));

  assert.equal(fallbackPosts.length, 1);
  assert.equal(fallbackPosts[0].id, "post-1");
});

test("public business posts transient read throws when no cache or known empty exists", async () => {
  const controller = createBusinessPostsController({
    getDocsFn: async () => {
      throw new Error("transient posts read failed");
    }
  });

  await assert.rejects(
    () => withMutedConsoleError(() => (
      controller.loadBusinessPostsForRestaurant("restaurant-error", {
        skipProfileResolve: true,
        initialPage: true
      })
    )),
    /transient posts read failed/
  );
});

test("public business posts confirmed empty remains empty on later transient read failure", async () => {
  let failReads = false;
  const controller = createBusinessPostsController({
    rows: [],
    getDocsFn: async () => {
      if (failReads) throw new Error("transient posts read failed");
      return createDocsSnapshot([]);
    }
  });

  const emptyPosts = await controller.loadBusinessPostsForRestaurant("restaurant-empty", {
    skipProfileResolve: true,
    initialPage: true
  });
  assert.deepEqual(emptyPosts, []);

  failReads = true;
  const stillEmptyPosts = await withMutedConsoleError(() => (
    controller.loadBusinessPostsForRestaurant("restaurant-empty", {
      skipProfileResolve: true,
      force: true,
      initialPage: true
    })
  ));

  assert.deepEqual(stillEmptyPosts, []);
});

test("business profile doc reuses cached public route restaurant id", async () => {
  const previousCache = globalThis.__MENYRA_PUBLIC_ROUTE_RESOLUTIONS__;
  globalThis.__MENYRA_PUBLIC_ROUTE_RESOLUTIONS__ = new Map([
    ["casarita", {
      found: true,
      status: "active",
      inputSlug: "casarita",
      canonicalSlug: "casarita",
      restaurantId: "restaurant-canonical-1"
    }]
  ]);

  try {
    const readPaths = [];
    const controller = createPublicProfileRuntimeController({
      state: {},
      db: {},
      docFn: (_db, ...path) => ({ path }),
      getDocFn: async (ref) => {
        readPaths.push(ref.path.join("/"));
        if (ref.path.join("/") === "restaurants/restaurant-canonical-1") {
          return {
            id: "restaurant-canonical-1",
            exists: () => true,
            data: () => ({
              name: "Casarita",
              publicSlug: "casarita",
              status: "active"
            })
          };
        }
        return {
          exists: () => false,
          data: () => ({})
        };
      },
      isPublicBusinessRecord: () => true
    });

    const resolved = await controller.fetchBusinessProfileDoc({ restaurantId: "casarita" });

    assert.equal(resolved.id, "restaurant-canonical-1");
    assert.deepEqual(readPaths, ["restaurants/restaurant-canonical-1"]);
  } finally {
    if (previousCache === undefined) {
      delete globalThis.__MENYRA_PUBLIC_ROUTE_RESOLUTIONS__;
    } else {
      globalThis.__MENYRA_PUBLIC_ROUTE_RESOLUTIONS__ = previousCache;
    }
  }
});
