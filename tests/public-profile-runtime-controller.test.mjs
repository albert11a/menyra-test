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

test("same public business keeps user-selected menu tab against stale posts update", () => {
  const profile = {
    restaurantId: "casarita",
    canonicalRestaurantId: "casarita",
    publicSlug: "casarita",
    landingSlug: "casarita",
    name: "Casarita",
    handle: "casarita",
    followers: 2,
    following: 1,
    postsLoaded: true,
    truthState: "stable",
    identityTruthState: "ready"
  };
  const state = createStableProfileRuntimeState(profile);
  state.profileTopTab = "menu";
  state.profileContentTab = "menu";
  state.profileView.directEntry = {
    ...state.profileView.directEntry,
    menuFirst: true,
    postsFirst: false,
    topTab: "menu",
    contentTab: "menu",
    phase: "ready"
  };
  const controller = createProfileRuntimeController(state);

  controller.showPublicProfile({
    ...profile,
    postsLoaded: true,
    truthState: "stable"
  }, [], {
    showBack: false,
    topTab: "profile",
    contentTab: "posts",
    directEntry: {
      active: true,
      owner: "web-direct",
      routeFirst: true,
      webPriority: true,
      postsFirst: true,
      topTab: "profile",
      contentTab: "posts",
      phase: "ready"
    }
  });

  assert.equal(state.profileTopTab, "menu");
  assert.equal(state.profileContentTab, "menu");
  assert.equal(state.profileView.directEntry.topTab, "menu");
  assert.equal(state.profileView.directEntry.contentTab, "menu");
  assert.equal(state.profileView.directEntry.menuFirst, true);
});

test("same in-app business keeps user-selected menu tab against late profile update", () => {
  const profile = {
    restaurantId: "moka",
    canonicalRestaurantId: "moka",
    publicSlug: "moka",
    landingSlug: "moka",
    name: "Moka Coffee",
    handle: "moka",
    postsLoaded: true,
    truthState: "stable",
    identityTruthState: "ready"
  };
  const state = createStableProfileRuntimeState(profile);
  state.profileTopTab = "menu";
  state.profileContentTab = "menu";
  state.profileBackTab = "search";
  state.profileView.routePayload = null;
  state.profileView.directEntry = null;
  state.__webDirectEntry = { active: false };
  const controller = createProfileRuntimeController(state);

  controller.showPublicProfile({
    ...profile,
    postsLoaded: true,
    truthState: "stable"
  }, [], {
    showBack: true,
    backTab: "search",
    topTab: "profile",
    contentTab: "posts"
  });

  assert.equal(state.profileTopTab, "menu");
  assert.equal(state.profileContentTab, "menu");
  assert.equal(state.profileView.directEntry, null);
});

function createStableProfileRuntimeState(profile = {}, posts = []) {
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
      profile,
      posts,
      routePayload: {
        owner: "web-direct",
        routeFirst: true,
        restaurantId: profile.restaurantId || "",
        canonicalRestaurantId: profile.canonicalRestaurantId || profile.restaurantId || "",
        identity: {
          name: profile.name || "",
          handle: profile.handle || "",
          avatar: profile.avatar || "",
          titleImageUrl: profile.titleImageUrl || "",
          coverImageUrl: profile.coverImageUrl || "",
          coverUrl: profile.coverUrl || "",
          heroUrl: profile.heroUrl || "",
          bio: profile.bio || ""
        },
        truth: {
          identity: profile.identityTruthState || profile.truthState || "",
          posts: profile.postsLoaded ? "seeded" : ""
        },
        businessSnapshot: {
          restaurantId: profile.canonicalRestaurantId || profile.restaurantId || "",
          identity: {
            publicSlug: profile.publicSlug || "",
            landingSlug: profile.landingSlug || "",
            handle: profile.handle || ""
          },
          truth: { identity: profile.identityTruthState || profile.truthState || "" },
          posts: { state: profile.postsLoaded ? "seeded" : "" }
        }
      },
      directEntry: {
        active: true,
        owner: "web-direct",
        routeFirst: true,
        webPriority: true,
        postsFirst: true,
        topTab: "profile",
        contentTab: "posts",
        phase: profile.postsLoaded ? "ready" : "loading"
      }
    },
    menu: { restaurantId: profile.restaurantId || "", items: [], truthState: "unknown" },
    focus: { restaurantId: profile.restaurantId || "", items: [], truthState: "unknown" }
  };
}

function createProfileRuntimeController(state) {
  return createPublicProfileRuntimeController({
    state,
    render: () => {},
    normalizeHandle: (value = "") => String(value || "").trim().toLowerCase()
  });
}

function readyRestaurantProfile(overrides = {}) {
  return {
    restaurantId: "restaurant-a",
    canonicalRestaurantId: "restaurant-a",
    publicSlug: "restaurant-a",
    landingSlug: "restaurant-a",
    name: "Restaurant A",
    handle: "restaurant-a",
    bio: "Known bio",
    location: "Known city",
    followers: 12,
    following: 3,
    avatar: "https://cdn.example/restaurant-a-avatar.jpg",
    titleImageUrl: "https://cdn.example/restaurant-a-cover.jpg",
    coverImageUrl: "https://cdn.example/restaurant-a-cover.jpg",
    coverUrl: "https://cdn.example/restaurant-a-cover.jpg",
    heroUrl: "https://cdn.example/restaurant-a-cover.jpg",
    postsLoaded: true,
    truthState: "stable",
    identityTruthState: "ready",
    ...overrides
  };
}

test("public identity normalizer keeps missing fan counts unknown", () => {
  const controller = createPublicProfileRuntimeController({
    state: {},
    normalizeHandle: (value = "") => String(value || "").trim().toLowerCase()
  });

  const missingCountsProfile = controller.normalizeExternalProfile({
    profileDoc: {
      id: "restaurant-no-counts",
      data: {
        name: "No Counts",
        publicSlug: "no-counts"
      }
    }
  });
  const zeroCountsProfile = controller.normalizeExternalProfile({
    profileDoc: {
      id: "restaurant-zero-counts",
      data: {
        name: "Zero Counts",
        publicSlug: "zero-counts",
        followersCount: 0,
        followingCount: 0
      }
    }
  });
  const liveCountsProfile = controller.normalizeExternalProfile({
    profileDoc: {
      id: "restaurant-live-counts",
      data: {
        name: "Live Counts",
        publicSlug: "live-counts",
        followersCount: 2,
        followingCount: 1
      }
    }
  });

  assert.equal(missingCountsProfile.followers, null);
  assert.equal(missingCountsProfile.following, null);
  assert.equal(zeroCountsProfile.followers, 0);
  assert.equal(zeroCountsProfile.following, 0);
  assert.equal(liveCountsProfile.followers, 2);
  assert.equal(liveCountsProfile.following, 1);
});

test("same restaurant loading update cannot regress ready public profile identity", () => {
  const casaritaId = "Lzm6RpNu3ErSDtGCHxpi";
  const state = createStableProfileRuntimeState({
    restaurantId: casaritaId,
    canonicalRestaurantId: casaritaId,
    publicSlug: "casarita",
    landingSlug: "casarita",
    name: "Lokal",
    handle: "casarita",
    bio: "Profil wird geladen...",
    location: "-",
    followers: null,
    following: null,
    avatar: "",
    titleImageUrl: "",
    coverImageUrl: "",
    coverUrl: "",
    heroUrl: "",
    postsLoaded: false,
    truthState: "route-pending-loading",
    identityTruthState: "loading"
  });
  const controller = createProfileRuntimeController(state);

  controller.showPublicProfile(readyRestaurantProfile({
    restaurantId: casaritaId,
    canonicalRestaurantId: casaritaId,
    publicSlug: "casarita",
    landingSlug: "casarita",
    name: "Casa Rita Restaurant",
    handle: "casarita",
    bio: "Mexican food in Prishtina",
    location: "Prishtina",
    followers: 47,
    following: 5,
    avatar: "https://cdn.example/casarita-logo.jpg",
    titleImageUrl: "https://cdn.example/casarita-cover.jpg",
    coverImageUrl: "https://cdn.example/casarita-cover.jpg",
    coverUrl: "https://cdn.example/casarita-cover.jpg",
    heroUrl: "https://cdn.example/casarita-cover.jpg"
  }), [], {
    showBack: false,
    topTab: "profile",
    contentTab: "posts",
    directEntry: {
      active: true,
      owner: "web-direct",
      routeFirst: true,
      webPriority: true,
      topTab: "profile",
      contentTab: "posts",
      phase: "ready"
    }
  });

  controller.showPublicProfile({
    restaurantId: "casarita",
    canonicalRestaurantId: "",
    publicSlug: "casarita",
    landingSlug: "casarita",
    name: "Lokal",
    handle: "casarita",
    bio: "Profil wird geladen...",
    location: "-",
    followers: null,
    following: null,
    avatar: "",
    titleImageUrl: "",
    coverImageUrl: "",
    coverUrl: "",
    heroUrl: "",
    postsLoaded: false,
    truthState: "route-pending-loading",
    identityTruthState: "loading"
  }, [], {
    showBack: false,
    topTab: "profile",
    contentTab: "posts",
    directEntry: {
      active: true,
      owner: "web-direct",
      routeFirst: true,
      webPriority: true,
      topTab: "profile",
      contentTab: "posts",
      phase: "loading"
    }
  });

  assert.equal(state.profileView.profile.name, "Casa Rita Restaurant");
  assert.equal(state.profileView.profile.bio, "Mexican food in Prishtina");
  assert.equal(state.profileView.profile.location, "Prishtina");
  assert.equal(state.profileView.profile.followers, 47);
  assert.equal(state.profileView.profile.following, 5);
  assert.equal(state.profileView.profile.avatar, "https://cdn.example/casarita-logo.jpg");
  assert.equal(state.profileView.profile.titleImageUrl, "https://cdn.example/casarita-cover.jpg");
  assert.equal(state.profileView.directEntry.phase, "ready");
});

test("same restaurant empty image update preserves visible Bro Pizza avatar and cover", () => {
  const broPizza = readyRestaurantProfile({
    restaurantId: "bro-pizza-id",
    canonicalRestaurantId: "bro-pizza-id",
    publicSlug: "bro-pizza",
    landingSlug: "bro-pizza",
    name: "Bro Pizza",
    handle: "bro-pizza",
    avatar: "https://cdn.example/bro-pizza-logo.jpg",
    titleImageUrl: "https://cdn.example/bro-pizza-cover.jpg",
    coverImageUrl: "https://cdn.example/bro-pizza-cover.jpg",
    coverUrl: "https://cdn.example/bro-pizza-cover.jpg",
    heroUrl: "https://cdn.example/bro-pizza-cover.jpg"
  });
  const state = createStableProfileRuntimeState(broPizza);
  const controller = createProfileRuntimeController(state);

  controller.showPublicProfile({
    ...broPizza,
    avatar: "",
    titleImageUrl: "",
    coverImageUrl: "",
    coverUrl: "",
    heroUrl: "",
    postsLoaded: false,
    truthState: "loading",
    identityTruthState: "loading"
  }, []);

  assert.equal(state.profileView.profile.avatar, "https://cdn.example/bro-pizza-logo.jpg");
  assert.equal(state.profileView.profile.titleImageUrl, "https://cdn.example/bro-pizza-cover.jpg");
  assert.equal(state.profileView.profile.coverImageUrl, "https://cdn.example/bro-pizza-cover.jpg");
  assert.equal(state.profileView.profile.coverUrl, "https://cdn.example/bro-pizza-cover.jpg");
  assert.equal(state.profileView.profile.heroUrl, "https://cdn.example/bro-pizza-cover.jpg");
});

test("posts loading and ready updates do not weaken profile identity", () => {
  const readyProfile = readyRestaurantProfile();
  const state = createStableProfileRuntimeState(readyProfile);
  const controller = createProfileRuntimeController(state);

  controller.showPublicProfile({
    restaurantId: readyProfile.restaurantId,
    canonicalRestaurantId: readyProfile.canonicalRestaurantId,
    publicSlug: readyProfile.publicSlug,
    landingSlug: readyProfile.landingSlug,
    handle: readyProfile.handle,
    postsLoaded: false,
    truthState: "loading",
    identityTruthState: "loading"
  }, []);
  controller.showPublicProfile({
    restaurantId: readyProfile.restaurantId,
    canonicalRestaurantId: readyProfile.canonicalRestaurantId,
    publicSlug: readyProfile.publicSlug,
    landingSlug: readyProfile.landingSlug,
    handle: readyProfile.handle,
    postsLoaded: true,
    truthState: "stable",
    identityTruthState: "ready"
  }, [{ id: "post-1", restaurantId: readyProfile.restaurantId }]);

  assert.equal(state.profileView.profile.name, readyProfile.name);
  assert.equal(state.profileView.profile.bio, readyProfile.bio);
  assert.equal(state.profileView.profile.location, readyProfile.location);
  assert.equal(state.profileView.profile.followers, readyProfile.followers);
  assert.equal(state.profileView.profile.avatar, readyProfile.avatar);
  assert.equal(state.profileView.profile.titleImageUrl, readyProfile.titleImageUrl);
  assert.deepEqual(state.profileView.posts, [{ id: "post-1", restaurantId: readyProfile.restaurantId }]);
});

test("different restaurant loading state does not inherit previous restaurant identity", () => {
  const state = createStableProfileRuntimeState(readyRestaurantProfile({
    restaurantId: "restaurant-a",
    canonicalRestaurantId: "restaurant-a",
    publicSlug: "restaurant-a",
    name: "Restaurant A"
  }));
  const controller = createProfileRuntimeController(state);

  controller.showPublicProfile({
    restaurantId: "restaurant-b",
    canonicalRestaurantId: "restaurant-b",
    publicSlug: "restaurant-b",
    landingSlug: "restaurant-b",
    name: "Lokal",
    handle: "restaurant-b",
    bio: "Profil wird geladen...",
    location: "-",
    followers: null,
    following: null,
    avatar: "",
    titleImageUrl: "",
    coverImageUrl: "",
    coverUrl: "",
    heroUrl: "",
    postsLoaded: false,
    truthState: "loading",
    identityTruthState: "loading"
  }, []);

  assert.equal(state.profileView.profile.restaurantId, "restaurant-b");
  assert.equal(state.profileView.profile.name, "Lokal");
  assert.equal(state.profileView.profile.bio, "Profil wird geladen...");
  assert.equal(state.profileView.profile.avatar, "");
  assert.equal(state.profileView.profile.titleImageUrl, "");
});

test("newer confirmed real public profile images can replace older real images", () => {
  const readyProfile = readyRestaurantProfile({
    avatar: "https://cdn.example/old-avatar.jpg",
    titleImageUrl: "https://cdn.example/old-cover.jpg",
    coverImageUrl: "https://cdn.example/old-cover.jpg",
    coverUrl: "https://cdn.example/old-cover.jpg",
    heroUrl: "https://cdn.example/old-cover.jpg"
  });
  const state = createStableProfileRuntimeState(readyProfile);
  const controller = createProfileRuntimeController(state);

  controller.showPublicProfile({
    ...readyProfile,
    avatar: "https://cdn.example/new-avatar.jpg",
    titleImageUrl: "https://cdn.example/new-cover.jpg",
    coverImageUrl: "https://cdn.example/new-cover.jpg",
    coverUrl: "https://cdn.example/new-cover.jpg",
    heroUrl: "https://cdn.example/new-cover.jpg",
    postsLoaded: true,
    truthState: "stable",
    identityTruthState: "ready"
  }, []);

  assert.equal(state.profileView.profile.avatar, "https://cdn.example/new-avatar.jpg");
  assert.equal(state.profileView.profile.titleImageUrl, "https://cdn.example/new-cover.jpg");
  assert.equal(state.profileView.profile.coverImageUrl, "https://cdn.example/new-cover.jpg");
  assert.equal(state.profileView.profile.coverUrl, "https://cdn.example/new-cover.jpg");
  assert.equal(state.profileView.profile.heroUrl, "https://cdn.example/new-cover.jpg");
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
  getDocFn = null,
  docFn = null,
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
    docFn: typeof docFn === "function" ? docFn : ((_db, ...path) => ({ path })),
    getDocFn: typeof getDocFn === "function"
      ? getDocFn
      : (async () => ({ exists: () => false, data: () => ({}) })),
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

  await Promise.resolve();

  assert.equal(getDocsCalls, 1);
  assert.equal(queryCalls[0].find((constraint) => constraint?.type === "limit")?.value, 1);

  resolveSnapshot();
  const [firstPosts, secondPosts] = await Promise.all([firstRead, secondRead]);
  assert.equal(firstPosts.length, 1);
  assert.deepEqual(secondPosts, firstPosts);
});

test("public business posts initial fallback stays bounded", async () => {
  const queryCalls = [];
  const rows = [
    { id: "post-1", url: "https://cdn.example/post-1.jpg", status: "active" },
    { id: "post-2", url: "https://cdn.example/post-2.jpg", status: "active" },
    { id: "post-3", url: "https://cdn.example/post-3.jpg", status: "active" }
  ];
  const controller = createBusinessPostsController({
    fastLimits: { publicBusinessPostsInitialPage: 2 },
    getDocsFn: async (refOrQuery) => {
      const constraints = Array.isArray(refOrQuery?.constraints) ? refOrQuery.constraints : [];
      queryCalls.push(constraints);
      const hasOrderBy = constraints.some((constraint) => constraint?.type === "orderBy");
      const limitValue = constraints.find((constraint) => constraint?.type === "limit")?.value;
      if (hasOrderBy) throw new Error("ordered query unavailable");
      assert.equal(limitValue, 2);
      return createDocsSnapshot(rows.slice(0, Number(limitValue)));
    }
  });

  const posts = await controller.loadBusinessPostsForRestaurant("restaurant-fallback", {
    skipProfileResolve: true,
    initialPage: true
  });

  assert.equal(posts.length, 2);
  assert.equal(queryCalls.length, 2);
  assert.equal(queryCalls[0].some((constraint) => constraint?.type === "orderBy"), true);
  assert.equal(queryCalls[1].some((constraint) => constraint?.type === "limit"), true);
});

test("public business posts status keeps read errors distinct from empty", async () => {
  const controller = createBusinessPostsController({
    getDocsFn: async () => {
      throw new Error("posts unavailable");
    }
  });

  const result = await withMutedConsoleError(() => controller.loadBusinessPostsForRestaurant("restaurant-error", {
    skipProfileResolve: true,
    returnStatus: true
  }));

  assert.deepEqual(result.posts, []);
  assert.equal(result.status, "error");
  assert.equal(result.restaurantId, "restaurant-error");
});

test("public business posts read deadline returns an error instead of hanging", async () => {
  const controller = createBusinessPostsController({
    fastLimits: {
      publicBusinessPostsInitialReadMs: 20
    },
    getDocsFn: async () => new Promise(() => {})
  });

  const startedAt = Date.now();
  const result = await withMutedConsoleError(() => controller.loadBusinessPostsForRestaurant("restaurant-timeout", {
    skipProfileResolve: true,
    initialPage: true,
    returnStatus: true
  }));

  assert.deepEqual(result.posts, []);
  assert.equal(result.status, "error");
  assert.equal(result.restaurantId, "restaurant-timeout");
  assert.equal(result.error?.code, "deadline-exceeded");
  assert.ok(Date.now() - startedAt < 1000);
});

test("public business posts profile resolve timeout does not create a known empty posts cache", async () => {
  let calls = 0;
  const controller = createBusinessPostsController({
    fastLimits: {
      publicProfileDocReadMs: 20,
      publicBusinessPostsInitialReadMs: 100
    },
    getDocFn: async () => new Promise(() => {}),
    getDocsFn: async () => {
      calls += 1;
      return createDocsSnapshot([]);
    }
  });

  const result = await withMutedConsoleError(() => controller.loadBusinessPostsForRestaurant("restaurant-resolve-timeout", {
    initialPage: true,
    returnStatus: true
  }));
  const second = await withMutedConsoleError(() => controller.loadBusinessPostsForRestaurant("restaurant-resolve-timeout", {
    skipProfileResolve: true,
    initialPage: true,
    returnStatus: true
  }));

  assert.deepEqual(result.posts, []);
  assert.equal(result.status, "error");
  assert.equal(result.error?.code, "deadline-exceeded");
  assert.equal(second.status, "empty");
  assert.equal(calls, 2);
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
