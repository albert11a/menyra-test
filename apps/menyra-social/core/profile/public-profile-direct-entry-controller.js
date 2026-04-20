import {
  normalizePendingProfileRestaurantIdCore,
  normalizeProfileTopTabFromRouteCore
} from "./profile-route-open-utils.js";

function safeLower(value = "") {
  return String(value || "").trim().toLowerCase();
}

function normalizeCountOrNull(value) {
  if (value === null || value === undefined) return null;
  const numeric = Number(value);
  if (!Number.isFinite(numeric) || numeric < 0) return null;
  return Math.max(0, Math.round(numeric));
}

function normalizeLookupSlug(value = "") {
  const raw = String(value || "").trim().toLowerCase();
  if (!raw) return "";
  return raw
    .replace(/^@+/, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function mapFeedPostToProfileSeedPost(post = {}, restaurantId = "") {
  const id = String(post?.id || "").trim();
  const url = String(post?.url || post?.image || "").trim();
  if (!id || !url) return null;
  const ownerRestaurantId = String(post?.restaurantId || post?.ownerId || "").trim() || restaurantId;
  return {
    id,
    url,
    type: String(post?.type || "square").trim() || "square",
    title: String(post?.title || "").trim(),
    caption: String(post?.caption || post?.content || "").trim(),
    createdAt: post?.createdAt || null,
    likes: Number.isFinite(Number(post?.likes)) ? Number(post.likes) : 0,
    comments: Number.isFinite(Number(post?.comments)) ? Number(post.comments) : 0,
    isVideo: !!post?.isVideo,
    ownerType: "restaurant",
    ownerId: ownerRestaurantId,
    restaurantId: ownerRestaurantId
  };
}

function normalizeProfileTopTab(value = "", fallback = "profile") {
  const topTab = safeLower(value);
  if (topTab === "profile") return "profile";
  if (topTab === "menu") return "menu";
  if (topTab === "landing") return "landing";
  if (topTab === "cart") return "cart";
  if (topTab === "favorites") return "favorites";
  return safeLower(fallback) || "profile";
}

function normalizeProfileContentTabForTopTab(topTab = "", value = "") {
  const safeTopTab = normalizeProfileTopTab(topTab, "profile");
  if (safeTopTab === "menu") return "menu";
  const contentTab = safeLower(value);
  if (contentTab === "media") return "media";
  if (contentTab === "checkins") return "checkins";
  if (contentTab === "menu") return "menu";
  return "posts";
}

function isQrLikeProfileAccessSource(value = "") {
  const safeAccessSource = safeLower(value);
  return safeAccessSource === "qr"
    || safeAccessSource === "qrcode"
    || safeAccessSource === "qr-code"
    || safeAccessSource === "menuqr"
    || safeAccessSource === "menu-qr"
    || safeAccessSource === "scanqr"
    || safeAccessSource === "scan-qr";
}

function normalizeDirectEntryPhase(value = "", fallback = "seeded") {
  const phase = safeLower(value);
  if (phase === "seeded") return "seeded";
  if (phase === "loading") return "loading";
  if (phase === "ready") return "ready";
  if (phase === "error") return "error";
  return safeLower(fallback) || "seeded";
}

function normalizeSeedBusinessLabel(value = "") {
  const raw = String(value || "").trim();
  if (!raw) return "Lokal";
  const slug = raw.startsWith("@") ? raw.slice(1) : raw;
  const compact = String(slug || "").trim();
  if (!compact) return "Lokal";
  const alphaNumeric = compact.replace(/[-_]/g, "");
  const likelyOpaqueId = /^[a-f0-9]{16,}$/i.test(alphaNumeric)
    || /^[a-z0-9]{20,}$/i.test(alphaNumeric)
    || (alphaNumeric.length >= 16 && (alphaNumeric.match(/\d/g) || []).length >= 4);
  if (likelyOpaqueId) return "Lokal";
  const words = compact
    .replace(/[^a-z0-9]+/gi, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (!words.length) return "Lokal";
  return words
    .slice(0, 4)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

function resolveRestaurantPreviewForRoute(state = null, restaurantId = "") {
  const safeRestaurantId = String(restaurantId || "").trim();
  if (!safeRestaurantId || !state || typeof state !== "object") return null;
  const routeSlug = normalizeLookupSlug(safeRestaurantId);
  const listGroups = [
    Array.isArray(state.bootstrapRestaurantPreview) ? state.bootstrapRestaurantPreview : [],
    Array.isArray(state.restaurants) ? state.restaurants : []
  ];
  for (const list of listGroups) {
    const byId = list.find((row) => String(row?.id || "").trim() === safeRestaurantId);
    if (byId) return byId;
  }
  if (!routeSlug) return null;
  for (const list of listGroups) {
    const bySlug = list.find((row) => {
      const rowSlug = normalizeLookupSlug(
        row?.landingSlug
        || row?.handle
        || row?.name
        || row?.restaurantName
        || ""
      );
      return !!rowSlug && rowSlug === routeSlug;
    });
    if (bySlug) return bySlug;
  }
  return null;
}

function resolveSeedPostsForRoute(state = null, restaurantId = "", { max = 8 } = {}) {
  if (!state || typeof state !== "object") return [];
  const safeRestaurantId = String(restaurantId || "").trim();
  if (!safeRestaurantId) return [];
  const targetLimit = Math.max(1, Number(max) || 8);
  const rows = Array.isArray(state.feedPosts) ? state.feedPosts : [];
  if (!rows.length) return [];
  const next = [];
  const seen = new Set();
  for (const row of rows) {
    const rowRestaurantId = String(row?.restaurantId || row?.ownerId || "").trim();
    if (!rowRestaurantId || rowRestaurantId !== safeRestaurantId) continue;
    const normalized = mapFeedPostToProfileSeedPost(row, safeRestaurantId);
    if (!normalized?.id || seen.has(normalized.id)) continue;
    seen.add(normalized.id);
    next.push(normalized);
    if (next.length >= targetLimit) break;
  }
  return next;
}

function resolveRouteBootstrapSeedForEntry(state = null, entry = null) {
  if (!state || typeof state !== "object") return null;
  const safeEntry = entry && typeof entry === "object" ? entry : {};
  const safeRestaurantId = String(safeEntry.restaurantId || "").trim();
  if (!safeRestaurantId) return null;
  const candidate = state.__publicRouteBootstrap;
  if (!candidate || typeof candidate !== "object") return null;
  if (String(candidate.restaurantId || "").trim() !== safeRestaurantId) return null;
  return candidate;
}

function buildRoutePayloadSeed({
  state = null,
  entry = null,
  profile = null,
  posts = [],
  routeBootstrap = null,
  phase = "seeded"
} = {}) {
  const safeEntry = entry && typeof entry === "object" ? entry : {};
  const safeProfile = profile && typeof profile === "object" ? profile : {};
  const safePosts = Array.isArray(posts) ? posts : [];
  const safeRestaurantId = String(safeProfile.restaurantId || safeEntry.restaurantId || "").trim();
  const safeRouteBootstrap = routeBootstrap && typeof routeBootstrap === "object" ? routeBootstrap : null;
  const menu = state?.menu || {};
  const routeMenuCount = Math.max(0, Number(safeRouteBootstrap?.menu?.count || 0) || 0);
  const routePostsCount = Math.max(0, Number(safeRouteBootstrap?.posts?.count || 0) || 0);
  const menuCount = String(menu.restaurantId || "").trim() === safeRestaurantId && Array.isArray(menu.items)
    ? menu.items.length
    : routeMenuCount;
  const postsCount = safePosts.length > 0 ? safePosts.length : routePostsCount;
  return {
    owner: "web-direct",
    routeFirst: true,
    restaurantId: safeRestaurantId,
    surface: safeEntry.visibleSurface || (safeEntry.topTab === "menu" ? "menu" : "profile"),
    topTab: safeEntry.topTab || "profile",
    contentTab: safeEntry.contentTab || (safeEntry.topTab === "menu" ? "menu" : "posts"),
    phase: normalizeDirectEntryPhase(
      safeRouteBootstrap?.phase || phase,
      "seeded"
    ),
    menuAccessSource: String(safeRouteBootstrap?.menuAccessSource || safeEntry.menuAccessSource || "").trim().toLowerCase(),
    tableNumber: Math.max(0, Number(safeRouteBootstrap?.tableNumber || safeEntry.tableNumber || 0) || 0),
    identity: {
      name: String(safeProfile.name || "").trim(),
      handle: String(safeProfile.handle || "").trim(),
      avatar: String(safeProfile.avatar || "").trim(),
      location: String(safeProfile.location || "").trim(),
      followers: normalizeCountOrNull(safeProfile.followers),
      following: normalizeCountOrNull(safeProfile.following)
    },
    posts: {
      count: postsCount,
      seeded: safePosts.length > 0 || safeRouteBootstrap?.posts?.seeded === true,
      items: Array.isArray(safeRouteBootstrap?.posts?.items) ? safeRouteBootstrap.posts.items : safePosts
    },
    menu: {
      count: menuCount,
      seeded: menuCount > 0 || safeRouteBootstrap?.menu?.seeded === true,
      items: Array.isArray(safeRouteBootstrap?.menu?.items) ? safeRouteBootstrap.menu.items : [],
      statusBadgeVisible: safeRouteBootstrap?.menu?.statusBadgeVisible !== false
    },
    layout: {
      menuCardColor: String(
        state?.menuLayout?.cardColor
        || safeRouteBootstrap?.layout?.menuCardColor
        || ""
      ).trim().toLowerCase() || "white"
    },
    ts: Date.now()
  };
}

export function createPublicProfileDirectEntryController({
  state = null,
  resolveVisibleProfileSurface = () => null
} = {}) {
  const resolveVisibleProfileSurfaceSafe = typeof resolveVisibleProfileSurface === "function"
    ? resolveVisibleProfileSurface
    : (() => null);

  function resolvePendingDirectEntry(pendingRoute = {}) {
    const pendingProfileRestaurantId = normalizePendingProfileRestaurantIdCore(pendingRoute?.pendingProfileRestaurantId || "");
    if (!pendingProfileRestaurantId) {
      return {
        active: false,
        restaurantId: "",
        topTab: "profile",
        contentTab: "posts",
        menuAccessSource: "",
        tableNumber: 0,
        explicitLanding: false,
        visibleSurface: "",
        webPriority: false,
        menuFirst: false,
        postsFirst: false
      };
    }
    const requestedTopTab = normalizeProfileTopTabFromRouteCore(pendingRoute?.pendingProfileTopTab || "");
    const explicitLanding = requestedTopTab === "landing";
    const resolvedTopTab = normalizeProfileTopTab(requestedTopTab || "profile", "profile");
    const resolvedMenuAccessSource = resolvedTopTab === "menu" && isQrLikeProfileAccessSource(pendingRoute?.pendingProfileAccessSource || "")
      ? "qr"
      : "";
    const pendingTableNumber = Math.max(0, Number(pendingRoute?.pendingProfileTableNumber || 0) || 0);
    const resolvedTableNumber = resolvedMenuAccessSource === "qr" ? pendingTableNumber : 0;
    const visibleSurface = resolvedTopTab === "menu"
      ? "menu"
      : (resolvedTopTab === "landing" ? "landing" : "profile");
    const menuFirst = visibleSurface === "menu";
    const postsFirst = visibleSurface === "profile";
    const webPriority = menuFirst || postsFirst;
    return {
      active: true,
      restaurantId: pendingProfileRestaurantId,
      topTab: resolvedTopTab,
      contentTab: normalizeProfileContentTabForTopTab(resolvedTopTab, ""),
      menuAccessSource: resolvedMenuAccessSource,
      tableNumber: resolvedTableNumber,
      explicitLanding,
      visibleSurface,
      webPriority,
      menuFirst,
      postsFirst
    };
  }

  function writeWebDirectEntryState(entry = {}, {
    phase = "seeded",
    active = true
  } = {}) {
    if (!state || typeof state !== "object") return null;
    const safeEntry = entry && typeof entry === "object" ? entry : {};
    const restaurantId = String(safeEntry.restaurantId || "").trim();
    const visibleSurface = String(safeEntry.visibleSurface || "").trim().toLowerCase();
    if (!restaurantId || !visibleSurface) {
      state.__webDirectEntry = {
        active: false,
        restaurantId: "",
        surface: "",
        topTab: "",
        contentTab: "",
        explicitLanding: false,
        menuFirst: false,
        postsFirst: false,
        webPriority: false,
        phase: "",
        ts: 0
      };
      return state.__webDirectEntry;
    }
    state.__webDirectEntry = {
      active: !!active,
      restaurantId,
      surface: visibleSurface,
      topTab: String(safeEntry.topTab || "").trim().toLowerCase(),
      contentTab: String(safeEntry.contentTab || "").trim().toLowerCase(),
      explicitLanding: safeEntry.explicitLanding === true,
      menuFirst: safeEntry.menuFirst === true,
      postsFirst: safeEntry.postsFirst === true,
      webPriority: safeEntry.webPriority === true,
      phase: normalizeDirectEntryPhase(phase, "seeded"),
      ts: Date.now()
    };
    return state.__webDirectEntry;
  }

  function seedPendingDirectEntry(pendingRoute = {}, {
    phase = "seeded"
  } = {}) {
    if (!state || typeof state !== "object") return null;
    const entry = resolvePendingDirectEntry(pendingRoute);
    if (!entry.active || !entry.restaurantId) return null;
    const routeBootstrap = resolveRouteBootstrapSeedForEntry(state, entry);
    const routeIdentity = routeBootstrap?.identity && typeof routeBootstrap.identity === "object"
      ? routeBootstrap.identity
      : null;
    const routePostsSeed = Array.isArray(routeBootstrap?.posts?.items)
      ? routeBootstrap.posts.items
      : [];
    const routeMenuSeed = Array.isArray(routeBootstrap?.menu?.items)
      ? routeBootstrap.menu.items
      : [];
    const routeLayoutColor = String(routeBootstrap?.layout?.menuCardColor || "").trim().toLowerCase();
    const preview = resolveRestaurantPreviewForRoute(state, entry.restaurantId);
    const seedBusinessName = String(
      routeIdentity?.name
      || preview?.name
      || preview?.restaurantName
      || normalizeSeedBusinessLabel(entry.restaurantId)
    ).trim() || normalizeSeedBusinessLabel(entry.restaurantId);
    const seedHandle = String(routeIdentity?.handle || preview?.handle || "").trim().replace(/^@/, "").toLowerCase();
    const seedAvatar = String(routeIdentity?.avatar || preview?.logoUrl || preview?.logo || preview?.avatar || "").trim();
    const seedLocation = String(routeIdentity?.location || preview?.city || preview?.address || "").trim();
    const seedFollowers = normalizeCountOrNull(
      routeIdentity?.followers
      ?? preview?.followersCount
      ?? preview?.followers
      ?? preview?.fansCount
      ?? preview?.fans
    );
    const seedFollowing = normalizeCountOrNull(
      routeIdentity?.following
      ?? preview?.followingCount
      ?? preview?.following
    );
    const seededPosts = entry.postsFirst
      ? (routePostsSeed.length
        ? routePostsSeed.slice(0, 12)
        : resolveSeedPostsForRoute(state, entry.restaurantId, { max: 8 }))
      : [];
    const postsKnownEmptyFromRoute = entry.postsFirst
      && !!routeBootstrap
      && Number(routeBootstrap?.posts?.count || 0) === 0
      && routeBootstrap?.posts?.seeded !== true;
    const hasHeaderTruth = !!(seedBusinessName || seedHandle || seedAvatar || seedLocation || seedFollowers !== null || seedFollowing !== null);
    const postsReadySeed = seededPosts.length > 0 || postsKnownEmptyFromRoute;
    if (routeLayoutColor && String(state?.menuLayout?.cardColor || "").trim().toLowerCase() !== routeLayoutColor) {
      state.menuLayout = {
        ...(state?.menuLayout || {}),
        cardColor: routeLayoutColor
      };
    }
    const seededProfile = {
      name: seedBusinessName,
      handle: seedHandle,
      uid: "",
      bio: "",
      avatar: seedAvatar,
      location: seedLocation,
      followers: seedFollowers,
      following: seedFollowing,
      privateAccount: false,
      role: "business",
      restaurantId: entry.restaurantId,
      pendingFollowRequest: false,
      postsLoaded: postsReadySeed,
      posts: seededPosts,
      identityTruthState: hasHeaderTruth ? "ready" : "loading",
      truthState: postsReadySeed
        ? (seededPosts.length > 0 ? "stable" : "empty")
        : "route-pending-loading"
    };
    const routePayloadSeed = buildRoutePayloadSeed({
      state,
      entry,
      profile: seededProfile,
      posts: seededPosts,
      routeBootstrap,
      phase
    });
    state.profileView = {
      profile: seededProfile,
      posts: seededPosts,
      menuAccessSource: entry.menuAccessSource,
      tableNumber: entry.tableNumber,
      routePayload: routePayloadSeed,
      directEntry: {
        active: true,
        source: "route",
        owner: "web-direct",
        routeFirst: true,
        webPriority: entry.webPriority === true,
        menuFirst: entry.menuFirst === true,
        postsFirst: entry.postsFirst === true,
        phase: normalizeDirectEntryPhase(
          routeBootstrap?.phase || phase,
          "seeded"
        ),
        topTab: entry.topTab,
        contentTab: entry.contentTab,
        explicitLanding: entry.explicitLanding
      }
    };
    if (entry.menuFirst && state.menu && typeof state.menu === "object") {
      const menuKnownEmptyFromRoute = !!routeBootstrap
        && Number(routeBootstrap?.menu?.count || 0) === 0
        && routeBootstrap?.menu?.seeded !== true;
      if (routeMenuSeed.length) {
        state.menu = {
          ...state.menu,
          restaurantId: entry.restaurantId,
          items: routeMenuSeed,
          loading: false,
          error: "",
          source: "public",
          statusBadgeVisible: routeBootstrap?.menu?.statusBadgeVisible !== false,
          routeSeed: true
        };
      } else if (menuKnownEmptyFromRoute) {
        state.menu = {
          ...state.menu,
          restaurantId: entry.restaurantId,
          items: [],
          loading: false,
          error: "",
          source: "public",
          statusBadgeVisible: routeBootstrap?.menu?.statusBadgeVisible !== false,
          routeSeed: false
        };
      } else {
        state.menu = {
          ...state.menu,
          restaurantId: entry.restaurantId,
          items: [],
          loading: true,
          error: "",
          source: "public",
          routeSeed: false
        };
      }
    }
    state.profileModal = { open: false, profile: null };
    state.profileContentTab = entry.contentTab;
    state.profileTopTab = entry.topTab;
    if (entry.topTab !== "landing") {
      state.profileLandingStep = 0;
      state.profileLandingGreetingIndex = 0;
      state.profileLandingTourIndex = 0;
    }
    state.profileViewMode = "grid";
    state.profilePostMenuId = null;
    state.profileBackTab = "";
    state.drawerOpen = false;
    state.activeTab = "profile";
    writeWebDirectEntryState(entry, {
      active: entry.webPriority === true,
      phase: routeBootstrap?.phase || phase
    });
    const nextSurface = resolveVisibleProfileSurfaceSafe(state, {
      profileView: state.profileView,
      profileTopTab: state.profileTopTab,
      profileContentTab: state.profileContentTab
    });
    if (nextSurface) {
      state.profileSurface = nextSurface;
    }
    return entry;
  }

  return {
    resolvePendingDirectEntry,
    seedPendingDirectEntry,
    writeWebDirectEntryState
  };
}
