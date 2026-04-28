import {
  normalizePendingProfileRestaurantIdCore,
  normalizeProfileTopTabFromRouteCore
} from "./profile-route-open-utils.js";
import {
  buildCanonicalPublicBusinessPathCore,
  isQrLikePublicBusinessAccessSourceCore,
  normalizePublicBusinessContentTabCore,
  normalizePublicBusinessSlugCore
} from "../router/public-business-route-utils.js";
import { isBootstrapRestaurantPreviewRecordCore } from "../common/restaurant-identity-runtime-controller.js";

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
  return normalizePublicBusinessSlugCore(value || "");
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
  if (safeTopTab === "menu") {
    return normalizePublicBusinessContentTabCore(value || "menu", "menu");
  }
  return normalizePublicBusinessContentTabCore(value || "posts", "posts");
}

function isQrLikeProfileAccessSource(value = "") {
  return isQrLikePublicBusinessAccessSourceCore(value);
}

function normalizeDirectEntryPhase(value = "", fallback = "seeded") {
  const phase = safeLower(value);
  if (phase === "seeded") return "seeded";
  if (phase === "loading") return "loading";
  if (phase === "ready") return "ready";
  if (phase === "error") return "error";
  return safeLower(fallback) || "seeded";
}

function normalizeTruthState(value = "", fallback = "unknown") {
  const truth = safeLower(value);
  if (truth === "seeded") return "seeded";
  if (truth === "knownempty" || truth === "known-empty") return "knownEmpty";
  if (truth === "unknown") return "unknown";
  const fallbackTruth = safeLower(fallback);
  if (fallbackTruth === "seeded") return "seeded";
  if (fallbackTruth === "knownempty" || fallbackTruth === "known-empty") return "knownEmpty";
  return "unknown";
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
  const restaurants = Array.isArray(state.restaurants) ? state.restaurants : [];
  const canonicalRestaurants = restaurants.filter((row) => !isBootstrapRestaurantPreviewRecordCore(row));
  const listGroups = [
    canonicalRestaurants,
    restaurants,
    Array.isArray(state.bootstrapRestaurantPreview) ? state.bootstrapRestaurantPreview : []
  ];
  for (const list of listGroups) {
    const byId = list.find((row) => String(row?.id || "").trim() === safeRestaurantId);
    if (byId) return byId;
  }
  if (!routeSlug) return null;
  for (const list of listGroups) {
    const bySlug = list.find((row) => {
      const rowSlug = normalizeLookupSlug(
        row?.publicSlug
        || row?.landingSlug
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

function resolveCanonicalPublicPath(publicSlug = "") {
  return buildCanonicalPublicBusinessPathCore({
    slug: publicSlug
  });
}

function resolveProfileSeedPublicSlug(routeIdentity = null, preview = null) {
  const routeSlug = normalizeLookupSlug(
    routeIdentity?.publicSlug
    || routeIdentity?.landingSlug
    || routeIdentity?.handle
    || ""
  );
  if (routeSlug) return routeSlug;
  return normalizeLookupSlug(
    preview?.publicSlug
    || preview?.landingSlug
    || preview?.handle
    || ""
  );
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
  const safeRouteRestaurantId = String(safeEntry.restaurantId || "").trim();
  if (!safeRouteRestaurantId) return null;
  const candidate = state.__publicRouteBootstrap;
  if (!candidate || typeof candidate !== "object") return null;
  const candidateRestaurantId = String(candidate.restaurantId || "").trim();
  if (!candidateRestaurantId) return null;
  if (candidateRestaurantId === safeRouteRestaurantId) return candidate;
  const safeRouteLookup = normalizeLookupSlug(safeRouteRestaurantId);
  if (!safeRouteLookup) return null;
  const candidateRestaurantLookup = normalizeLookupSlug(candidateRestaurantId);
  if (candidateRestaurantLookup && candidateRestaurantLookup === safeRouteLookup) return candidate;
  const candidateIdentity = candidate?.businessSnapshot?.identity && typeof candidate.businessSnapshot.identity === "object"
    ? candidate.businessSnapshot.identity
    : (candidate?.identity && typeof candidate.identity === "object" ? candidate.identity : {});
  const candidateIdentityLookup = normalizeLookupSlug(
    candidateIdentity?.publicSlug
    || candidateIdentity?.landingSlug
    || candidateIdentity?.handle
    || ""
  );
  if (candidateIdentityLookup && candidateIdentityLookup === safeRouteLookup) return candidate;
  return null;
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
  const safeRouteBootstrap = routeBootstrap && typeof routeBootstrap === "object" ? routeBootstrap : null;
  const safeSnapshot = safeRouteBootstrap?.businessSnapshot && typeof safeRouteBootstrap.businessSnapshot === "object"
    ? safeRouteBootstrap.businessSnapshot
    : null;
  const safeCanonicalRestaurantId = String(
    safeProfile.canonicalRestaurantId
    || safeEntry.canonicalRestaurantId
    || safeRouteBootstrap?.canonicalRestaurantId
    || safeSnapshot?.restaurantId
    || safeRouteBootstrap?.restaurantId
    || ""
  ).trim();
  const safeRestaurantId = String(
    safeCanonicalRestaurantId
    || safeProfile.restaurantId
    || safeEntry.restaurantId
    || ""
  ).trim();
  const safeTruth = safeSnapshot?.truth && typeof safeSnapshot.truth === "object"
    ? safeSnapshot.truth
    : (safeRouteBootstrap?.truth && typeof safeRouteBootstrap.truth === "object" ? safeRouteBootstrap.truth : {});
  const routeIdentity = safeSnapshot?.identity && typeof safeSnapshot.identity === "object"
    ? safeSnapshot.identity
    : (safeRouteBootstrap?.identity && typeof safeRouteBootstrap.identity === "object" ? safeRouteBootstrap.identity : {});
  const routePosts = safeSnapshot?.posts && typeof safeSnapshot.posts === "object"
    ? safeSnapshot.posts
    : (safeRouteBootstrap?.posts && typeof safeRouteBootstrap.posts === "object" ? safeRouteBootstrap.posts : {});
  const routeMenu = safeSnapshot?.menu && typeof safeSnapshot.menu === "object"
    ? safeSnapshot.menu
    : (safeRouteBootstrap?.menu && typeof safeRouteBootstrap.menu === "object" ? safeRouteBootstrap.menu : {});
  const routeFocus = safeSnapshot?.focus && typeof safeSnapshot.focus === "object"
    ? safeSnapshot.focus
    : (safeRouteBootstrap?.focus && typeof safeRouteBootstrap.focus === "object" ? safeRouteBootstrap.focus : {});
  const routePostsItems = Array.isArray(routePosts?.items) ? routePosts.items : [];
  const menu = state?.menu || {};
  const hasLivePublicMenu = String(menu.restaurantId || "").trim() === safeRestaurantId
    && String(menu.source || "").trim().toLowerCase() === "public"
    && String(menu.truthState || "").trim().toLowerCase() === "seeded"
    && Array.isArray(menu.items)
    && menu.items.length > 0;
  const livePublicMenuItems = hasLivePublicMenu ? menu.items : [];
  const livePublicMenuState = normalizeTruthState(
    hasLivePublicMenu ? (menu.truthState || "") : "",
    hasLivePublicMenu
      ? (livePublicMenuItems.length ? "seeded" : (menu.loading ? "unknown" : "knownEmpty"))
      : "unknown"
  );
  const routeMenuItems = livePublicMenuState === "seeded" ? livePublicMenuItems : [];
  const focus = state?.focus || {};
  const livePublicFocusItems = hasLivePublicMenu
    && String(focus.restaurantId || "").trim() === safeRestaurantId
    && String(focus.truthSource || "").trim().toLowerCase() === "public-menu"
    && Array.isArray(focus.items)
    ? focus.items
    : [];
  const routeFocusItems = livePublicFocusItems;
  const routePostsState = normalizeTruthState(routePosts?.state || safeTruth?.posts || "", (
    safePosts.length || routePostsItems.length ? "seeded" : "unknown"
  ));
  const routeMenuState = hasLivePublicMenu ? livePublicMenuState : "unknown";
  const routeFocusState = livePublicFocusItems.length ? "seeded" : "unknown";
  const routeIdentityState = normalizeTruthState(safeTruth?.identity || "", (
    String(routeIdentity?.name || "").trim()
    || String(routeIdentity?.handle || "").trim()
    || String(routeIdentity?.avatar || "").trim()
  ) ? "seeded" : "unknown");
  const routeBioState = normalizeTruthState(
    safeTruth?.bio || "",
    String(routeIdentity?.bio || safeProfile?.bio || "").trim() ? "seeded" : "knownEmpty"
  );
  const nextMenuItems = routeMenuState === "seeded"
    ? routeMenuItems
    : [];
  const nextFocusItems = routeFocusState === "seeded"
    ? routeFocusItems
    : [];
  const routeMenuCount = 0;
  const routePostsCount = Math.max(0, Number(routePosts?.count || 0) || 0);
  const routeFocusCount = 0;
  const menuCount = routeMenuState === "seeded"
    ? nextMenuItems.length
    : (routeMenuState === "knownEmpty"
      ? 0
      : (hasLivePublicMenu ? menu.items.length : routeMenuCount));
  const postsCount = routePostsState === "seeded"
    ? safePosts.length
    : (routePostsState === "knownEmpty" ? 0 : routePostsCount);
  const focusCount = routeFocusState === "seeded"
    ? nextFocusItems.length
    : (routeFocusState === "knownEmpty" ? 0 : routeFocusCount);
  const snapshotVersion = String(
    safeSnapshot?.snapshotVersion
    || safeRouteBootstrap?.snapshotVersion
    || "business-page-v1"
  ).trim() || "business-page-v1";
  const snapshotUpdatedAt = Math.max(
    0,
    Number(safeSnapshot?.updatedAt || safeRouteBootstrap?.snapshotUpdatedAt || 0) || 0
  ) || Date.now();
  const snapshotVersionKey = String(
    safeSnapshot?.version
    || safeRouteBootstrap?.snapshotVersionKey
    || `${safeRestaurantId}:${snapshotUpdatedAt}:${snapshotVersion}`
  ).trim() || `${safeRestaurantId}:${snapshotUpdatedAt}:${snapshotVersion}`;
  const nextSnapshot = {
    snapshotVersion,
    version: snapshotVersionKey,
    updatedAt: snapshotUpdatedAt,
    restaurantId: safeRestaurantId,
    identity: {
      name: String(safeProfile.name || routeIdentity?.name || "").trim(),
      handle: String(safeProfile.handle || routeIdentity?.handle || "").trim(),
      avatar: String(safeProfile.avatar || routeIdentity?.avatar || "").trim(),
      location: String(safeProfile.location || routeIdentity?.location || "").trim(),
      bio: String(safeProfile.bio || routeIdentity?.bio || "").trim(),
      followers: normalizeCountOrNull(safeProfile.followers ?? routeIdentity?.followers),
      following: normalizeCountOrNull(safeProfile.following ?? routeIdentity?.following),
      type: String(safeProfile.type || safeProfile.customerType || routeIdentity?.type || routeIdentity?.customerType || "").trim(),
      customerType: String(safeProfile.customerType || safeProfile.type || routeIdentity?.customerType || routeIdentity?.type || "").trim()
    },
    posts: {
      state: routePostsState,
      seeded: routePostsState === "seeded",
      knownEmpty: routePostsState === "knownEmpty",
      unknown: routePostsState === "unknown",
      count: postsCount,
      items: safePosts
    },
    menu: {
      state: routeMenuState,
      seeded: routeMenuState === "seeded",
      knownEmpty: routeMenuState === "knownEmpty",
      unknown: routeMenuState === "unknown",
      count: menuCount,
      items: nextMenuItems,
      statusBadgeVisible: routeMenu?.statusBadgeVisible !== false
    },
    focus: {
      state: routeFocusState,
      seeded: routeFocusState === "seeded",
      knownEmpty: routeFocusState === "knownEmpty",
      unknown: routeFocusState === "unknown",
      count: focusCount,
      items: nextFocusItems,
      enabled: routeFocus?.enabled !== false
    },
    layout: {
      menuCardColor: String(
        state?.menuLayout?.cardColor
        || safeSnapshot?.layout?.menuCardColor
        || safeRouteBootstrap?.layout?.menuCardColor
        || ""
      ).trim().toLowerCase() || "white"
    },
    truth: {
      identity: routeIdentityState,
      bio: routeBioState,
      avatar: String(safeProfile.avatar || routeIdentity?.avatar || "").trim() ? "seeded" : "knownEmpty",
      counts: (normalizeCountOrNull(safeProfile.followers) !== null || normalizeCountOrNull(safeProfile.following) !== null)
        ? "seeded"
        : "unknown",
      posts: routePostsState,
      menu: routeMenuState,
      focus: routeFocusState,
      layout: "seeded"
    }
  };
  const routePhaseReady = routeIdentityState === "seeded"
    && routePostsState !== "unknown"
    && routeMenuState !== "unknown"
    && routeFocusState !== "unknown";
  return {
    ...(safeRouteBootstrap || {}),
    owner: "web-direct",
    routeFirst: true,
    restaurantId: safeRestaurantId,
    canonicalRestaurantId: safeCanonicalRestaurantId,
    surface: safeEntry.visibleSurface || (safeEntry.topTab === "menu" ? "menu" : "profile"),
    topTab: safeEntry.topTab || "profile",
    contentTab: safeEntry.contentTab || (safeEntry.topTab === "menu" ? "menu" : "posts"),
    phase: normalizeDirectEntryPhase(safeRouteBootstrap?.phase || phase, routePhaseReady ? "ready" : "loading"),
    menuAccessSource: String(safeRouteBootstrap?.menuAccessSource || safeEntry.menuAccessSource || "").trim().toLowerCase(),
    tableNumber: Math.max(0, Number(safeRouteBootstrap?.tableNumber || safeEntry.tableNumber || 0) || 0),
    identity: {
      name: nextSnapshot.identity.name,
      handle: nextSnapshot.identity.handle,
      avatar: nextSnapshot.identity.avatar,
      location: nextSnapshot.identity.location,
      bio: nextSnapshot.identity.bio,
      followers: nextSnapshot.identity.followers,
      following: nextSnapshot.identity.following,
      type: nextSnapshot.identity.type,
      customerType: nextSnapshot.identity.customerType
    },
    posts: {
      state: routePostsState,
      count: postsCount,
      seeded: routePostsState === "seeded",
      knownEmpty: routePostsState === "knownEmpty",
      unknown: routePostsState === "unknown",
      items: safePosts
    },
    menu: {
      state: routeMenuState,
      count: menuCount,
      seeded: routeMenuState === "seeded",
      knownEmpty: routeMenuState === "knownEmpty",
      unknown: routeMenuState === "unknown",
      items: nextMenuItems,
      statusBadgeVisible: routeMenu?.statusBadgeVisible !== false
    },
    focus: {
      state: routeFocusState,
      count: focusCount,
      seeded: routeFocusState === "seeded",
      knownEmpty: routeFocusState === "knownEmpty",
      unknown: routeFocusState === "unknown",
      items: nextFocusItems,
      enabled: routeFocus?.enabled !== false
    },
    layout: {
      menuCardColor: nextSnapshot.layout.menuCardColor
    },
    truth: {
      identity: nextSnapshot.truth.identity,
      bio: nextSnapshot.truth.bio,
      avatar: nextSnapshot.truth.avatar,
      counts: nextSnapshot.truth.counts,
      posts: nextSnapshot.truth.posts,
      menu: nextSnapshot.truth.menu,
      focus: nextSnapshot.truth.focus,
      layout: nextSnapshot.truth.layout
    },
    snapshotVersion: nextSnapshot.snapshotVersion,
    snapshotUpdatedAt: nextSnapshot.updatedAt,
    snapshotVersionKey: nextSnapshot.version,
    businessSnapshot: nextSnapshot,
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
        canonicalRestaurantId: "",
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
    const resolvedMenuAccessSource = isQrLikeProfileAccessSource(pendingRoute?.pendingProfileAccessSource || "")
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
      canonicalRestaurantId: "",
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
        canonicalRestaurantId: "",
        surface: "",
        topTab: "",
        contentTab: "",
        menuAccessSource: "",
        tableNumber: 0,
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
      canonicalRestaurantId: String(safeEntry.canonicalRestaurantId || "").trim(),
      surface: visibleSurface,
      topTab: String(safeEntry.topTab || "").trim().toLowerCase(),
      contentTab: String(safeEntry.contentTab || "").trim().toLowerCase(),
      menuAccessSource: String(safeEntry.menuAccessSource || "").trim().toLowerCase() === "qr" ? "qr" : "",
      tableNumber: Math.max(0, Number(safeEntry.tableNumber || 0) || 0),
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
    const routeSnapshot = routeBootstrap?.businessSnapshot && typeof routeBootstrap.businessSnapshot === "object"
      ? routeBootstrap.businessSnapshot
      : null;
    const canonicalRestaurantId = String(
      routeSnapshot?.restaurantId
      || routeBootstrap?.canonicalRestaurantId
      || routeBootstrap?.restaurantId
      || ""
    ).trim();
    const entryRestaurantId = canonicalRestaurantId || String(entry.restaurantId || "").trim();
    const routePostsSeed = Array.isArray(routeBootstrap?.posts?.items)
      ? routeBootstrap.posts.items
      : [];
    const routeMenuSeed = [];
    const routeFocusSeed = [];
    const routeTruth = routeSnapshot?.truth && typeof routeSnapshot.truth === "object"
      ? routeSnapshot.truth
      : (routeBootstrap?.truth && typeof routeBootstrap.truth === "object" ? routeBootstrap.truth : {});
    const routePostsState = normalizeTruthState(
      routeSnapshot?.posts?.state || routeBootstrap?.posts?.state || routeTruth?.posts || "",
      routePostsSeed.length ? "seeded" : "unknown"
    );
    const routeMenuState = "unknown";
    const routeFocusState = "unknown";
    const routeIdentityState = normalizeTruthState(routeTruth?.identity || "", (
      String(routeIdentity?.name || "").trim()
      || String(routeIdentity?.handle || "").trim()
      || String(routeIdentity?.avatar || "").trim()
    ) ? "seeded" : "unknown");
    const routeBioState = normalizeTruthState(
      routeTruth?.bio || "",
      String(routeIdentity?.bio || "").trim() ? "seeded" : "knownEmpty"
    );
    const routeLayoutColor = String(routeBootstrap?.layout?.menuCardColor || "").trim().toLowerCase();
    const preview = resolveRestaurantPreviewForRoute(state, entryRestaurantId || entry.restaurantId);
    const seedBusinessName = String(
      routeIdentity?.name
      || preview?.name
      || preview?.restaurantName
      || normalizeSeedBusinessLabel(entryRestaurantId || entry.restaurantId)
    ).trim() || normalizeSeedBusinessLabel(entryRestaurantId || entry.restaurantId);
    const seedHandle = String(routeIdentity?.handle || preview?.handle || "").trim().replace(/^@/, "").toLowerCase();
    const seedPublicSlug = resolveProfileSeedPublicSlug(routeIdentity, preview);
    const seedAvatar = String(routeIdentity?.avatar || preview?.logoUrl || preview?.logo || preview?.avatar || "").trim();
    const seedLocation = String(routeIdentity?.location || preview?.city || preview?.address || "").trim();
    const seedBio = String(routeIdentity?.bio || "").trim();
    const seedFollowers = normalizeCountOrNull(routeIdentity?.followers);
    const seedFollowing = normalizeCountOrNull(routeIdentity?.following);
    const hasCanonicalSnapshot = !!routeSnapshot;
    const seededPosts = routePostsState === "seeded"
      ? (routePostsSeed.length
        ? routePostsSeed.slice(0, 12)
        : (hasCanonicalSnapshot ? [] : resolveSeedPostsForRoute(state, entryRestaurantId || entry.restaurantId, { max: 8 })))
      : [];
    const hasRouteSeededPosts = routePostsState === "seeded" && seededPosts.length > 0;
    const postsReadySeed = hasRouteSeededPosts || routePostsState === "knownEmpty";
    const hasHeaderTruth = routeIdentityState === "seeded"
      || !!(seedBusinessName || seedHandle || seedAvatar || seedLocation || seedFollowers !== null || seedFollowing !== null);
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
      bio: routeBioState === "knownEmpty" ? "" : seedBio,
      avatar: seedAvatar,
      location: seedLocation,
      followers: seedFollowers,
      following: seedFollowing,
      privateAccount: false,
      role: "business",
      restaurantId: entryRestaurantId,
      canonicalRestaurantId,
      publicSlug: seedPublicSlug,
      landingSlug: seedPublicSlug,
      canonicalPublicPath: resolveCanonicalPublicPath(seedPublicSlug),
      pendingFollowRequest: false,
      postsLoaded: postsReadySeed,
      posts: seededPosts,
      identityTruthState: hasHeaderTruth ? "ready" : "loading",
      truthState: hasRouteSeededPosts
        ? "stable"
        : (routePostsState === "knownEmpty" ? "empty" : "route-pending-loading")
    };
    const routeSnapshotReady = routeIdentityState === "seeded"
      && routePostsState !== "unknown"
      && routeMenuState !== "unknown"
      && routeFocusState !== "unknown";
    const directPhase = normalizeDirectEntryPhase(
      routeBootstrap?.phase || phase,
      routeSnapshotReady ? "ready" : "loading"
    );
    const entryForSeed = {
      ...entry,
      restaurantId: entryRestaurantId,
      canonicalRestaurantId
    };
    const routePayloadSeed = buildRoutePayloadSeed({
      state,
      entry: entryForSeed,
      profile: seededProfile,
      posts: seededPosts,
      routeBootstrap,
      phase: directPhase
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
        canonicalRestaurantId,
        webPriority: entry.webPriority === true,
        menuFirst: entry.menuFirst === true,
        postsFirst: entry.postsFirst === true,
        phase: directPhase,
        topTab: entry.topTab,
        contentTab: entry.contentTab,
        explicitLanding: entry.explicitLanding
      }
    };
    if (state.menu && typeof state.menu === "object") {
      if (routeMenuState === "seeded") {
        state.menu = {
          ...state.menu,
          restaurantId: entryRestaurantId,
          items: routeMenuSeed,
          loading: false,
          error: "",
          source: "public",
          statusBadgeVisible: routeBootstrap?.menu?.statusBadgeVisible !== false,
          routeSeed: true,
          truthState: "seeded"
        };
      } else if (routeMenuState === "knownEmpty") {
        state.menu = {
          ...state.menu,
          restaurantId: entryRestaurantId,
          items: [],
          loading: false,
          error: "",
          source: "public",
          statusBadgeVisible: routeBootstrap?.menu?.statusBadgeVisible !== false,
          routeSeed: false,
          truthState: "knownEmpty"
        };
      } else {
        const existingMenuTruth = String(state.menu.truthState || "").trim().toLowerCase();
        const hasKnownMenuTruth = String(state.menu.restaurantId || "").trim() === entryRestaurantId
          && String(state.menu.source || "").trim().toLowerCase() === "public"
          && (existingMenuTruth === "seeded" || existingMenuTruth === "knownempty" || existingMenuTruth === "known-empty");
        const existingItems = String(state.menu.restaurantId || "").trim() === entryRestaurantId
          && String(state.menu.source || "").trim().toLowerCase() === "public"
          && Array.isArray(state.menu.items)
          ? state.menu.items
          : [];
        state.menu = {
          ...state.menu,
          restaurantId: entryRestaurantId,
          items: existingItems,
          loading: hasKnownMenuTruth ? false : true,
          error: "",
          source: "public",
          routeSeed: hasKnownMenuTruth ? state.menu.routeSeed === true : false,
          truthState: hasKnownMenuTruth
            ? (existingMenuTruth === "seeded" ? "seeded" : "knownEmpty")
            : "unknown"
        };
      }
    }
    if (state.focus && typeof state.focus === "object") {
      if (routeFocusState === "seeded") {
        state.focus = {
          ...state.focus,
          restaurantId: entryRestaurantId,
          items: routeFocusSeed,
          enabled: routeBootstrap?.focus?.enabled !== false,
          loading: false,
          error: "",
          index: 0,
          truthState: "seeded"
        };
      } else if (routeFocusState === "knownEmpty") {
        state.focus = {
          ...state.focus,
          restaurantId: entryRestaurantId,
          items: [],
          enabled: routeBootstrap?.focus?.enabled !== false,
          loading: false,
          error: "",
          index: 0,
          truthState: "knownEmpty"
        };
      } else {
        const existingFocusTruth = String(state.focus.truthState || "").trim().toLowerCase();
        const publicMenuHasItemsForFocus = String(state.menu?.restaurantId || "").trim() === entryRestaurantId
          && String(state.menu?.source || "").trim().toLowerCase() === "public"
          && String(state.menu?.truthState || "").trim().toLowerCase() === "seeded"
          && Array.isArray(state.menu?.items)
          && state.menu.items.length > 0;
        const hasKnownFocusTruth = String(state.focus.restaurantId || "").trim() === entryRestaurantId
          && publicMenuHasItemsForFocus
          && String(state.focus.truthSource || "").trim().toLowerCase() === "public-menu"
          && (existingFocusTruth === "seeded" || existingFocusTruth === "knownempty" || existingFocusTruth === "known-empty");
        const existingItems = String(state.focus.restaurantId || "").trim() === entryRestaurantId
          && publicMenuHasItemsForFocus
          && String(state.focus.truthSource || "").trim().toLowerCase() === "public-menu"
          && Array.isArray(state.focus.items)
          ? state.focus.items
          : [];
        state.focus = {
          ...state.focus,
          restaurantId: entryRestaurantId,
          items: existingItems,
          enabled: routeBootstrap?.focus?.enabled !== false,
          loading: hasKnownFocusTruth ? false : true,
          error: "",
          truthState: hasKnownFocusTruth
            ? (existingFocusTruth === "seeded" ? "seeded" : "knownEmpty")
            : "unknown"
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
    writeWebDirectEntryState(entryForSeed, {
      active: entry.webPriority === true,
      phase: directPhase
    });
    const nextSurface = resolveVisibleProfileSurfaceSafe(state, {
      profileView: state.profileView,
      profileTopTab: state.profileTopTab,
      profileContentTab: state.profileContentTab
    });
    if (nextSurface) {
      state.profileSurface = nextSurface;
    }
    return entryForSeed;
  }

  return {
    resolvePendingDirectEntry,
    seedPendingDirectEntry,
    writeWebDirectEntryState
  };
}
