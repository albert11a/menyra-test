import { projectPostCollectionThroughEntityMap } from "../profile/post-entity-registry-utils.js";
import { isBootstrapRestaurantPreviewRecordCore } from "../common/restaurant-identity-runtime-controller.js";

function isGenericBusinessBootstrapLabel(value = "") {
  return String(value || "").trim().toLowerCase() === "business";
}

function buildRestaurantBootstrapSignature(restaurants = []) {
  return (Array.isArray(restaurants) ? restaurants : [])
    .map((rest) => {
      const id = String(rest?.id || "").trim();
      const name = String(rest?.name || rest?.restaurantName || "").trim();
      const publicSlug = String(rest?.publicSlug || rest?.landingSlug || rest?.handle || "").trim();
      const logo = String(rest?.logoUrl || rest?.logo || "").trim();
      const city = String(rest?.city || rest?.address || "").trim();
      const type = String(rest?.type || rest?.customerType || rest?.restaurantType || "").trim();
      return `${id}|${name}|${publicSlug}|${logo}|${city}|${type}`;
    })
    .join(",");
}

function normalizePublicBootstrapRestaurants(restaurants = [], { normalizeRestaurantType = (value) => String(value || "").trim() } = {}) {
  const seen = new Set();
  return (Array.isArray(restaurants) ? restaurants : [])
    .map((row) => {
      const id = String(row?.id || row?.restaurantId || "").trim();
      if (!id || seen.has(id)) return null;
      seen.add(id);
      const nameRaw = String(row?.name || row?.restaurantName || row?.displayName || row?.businessName || "").trim();
      const name = isGenericBusinessBootstrapLabel(nameRaw) ? "" : nameRaw;
      const publicSlug = String(row?.publicSlug || row?.landingSlug || row?.handle || "").trim();
      const logoUrl = String(row?.logoUrl || row?.logo || row?.logoURL || "").trim();
      const city = String(row?.city || "").trim();
      const type = normalizeRestaurantType(
        row?.type
        || row?.customerType
        || row?.category
        || row?.kind
        || row?.restaurantType
        || ""
      );
      if (!(name || logoUrl || city || type)) return null;
      return {
        id,
        name,
        restaurantName: String(row?.restaurantName || "").trim(),
        publicSlug,
        landingSlug: String(row?.landingSlug || publicSlug).trim(),
        handle: String(row?.handle || publicSlug).trim(),
        canonicalPublicPath: String(
          publicSlug
            ? `/${encodeURIComponent(publicSlug)}`
            : (row?.canonicalPublicPath || "")
        ).trim(),
        logoUrl,
        city,
        ...(type ? { type, customerType: type } : {})
      };
    })
    .filter(Boolean);
}

function mergeBootstrapRestaurantPreview(existing = [], incoming = []) {
  const byId = new Map();
  (Array.isArray(existing) ? existing : []).forEach((row) => {
    const id = String(row?.id || "").trim();
    if (!id) return;
    byId.set(id, row);
  });
  (Array.isArray(incoming) ? incoming : []).forEach((row) => {
    const id = String(row?.id || "").trim();
    if (!id) return;
    const previous = byId.get(id) || {};
    byId.set(id, {
      ...previous,
      ...row,
      id,
      __truthSource: "bootstrap-preview",
      __truthPartial: true,
      __isPreview: true
    });
  });
  return Array.from(byId.values());
}

function normalizePublicBootstrapFeedPosts(rows = [], {
  toDateSafe = () => null,
  formatRelative = () => ""
} = {}) {
  return (Array.isArray(rows) ? rows : [])
    .map((row) => {
      const id = String(row?.id || "").trim();
      const restaurantId = String(row?.restaurantId || row?.rid || row?.ownerId || "").trim();
      if (!id || !restaurantId) return null;
      const businessRaw = String(row?.business || row?.businessName || row?.restaurantName || "").trim();
      const business = isGenericBusinessBootstrapLabel(businessRaw) ? "" : businessRaw;
      const image = String(row?.image || row?.thumbUrl || row?.mediaUrl || row?.url || "").trim();
      if (!image) return null;
      const createdAtRaw = row?.createdAt;
      const createdAtDate = toDateSafe(createdAtRaw);
      const createdAt = createdAtDate || createdAtRaw || null;
      return {
        id,
        restaurantId,
        business: business || "Business",
        logo: String(row?.logo || row?.logoUrl || row?.logoURL || "").trim(),
        location: String(row?.location || row?.city || "").trim(),
        content: String(row?.content || row?.caption || row?.captionShort || "").trim(),
        image,
        likes: Number.isFinite(Number(row?.likes)) ? Number(row.likes) : (Number.isFinite(Number(row?.likesCount)) ? Number(row.likesCount) : 0),
        comments: Number.isFinite(Number(row?.comments)) ? Number(row.comments) : (Number.isFinite(Number(row?.commentsCount)) ? Number(row.commentsCount) : 0),
        time: formatRelative(createdAtDate),
        createdAt,
        category: String(row?.category || row?.postType || "food").trim() || "food",
        isLive: !!row?.isLive,
        ownerType: "restaurant",
        ownerId: restaurantId
      };
    })
    .filter(Boolean)
    .sort((a, b) => (toDateSafe(b.createdAt)?.getTime() || 0) - (toDateSafe(a.createdAt)?.getTime() || 0));
}

function normalizePublicBootstrapStories(rows = []) {
  return (Array.isArray(rows) ? rows : [])
    .map((row) => {
      const restaurantId = String(row?.restaurantId || row?.id || row?.rid || "").trim();
      if (!restaurantId) return null;
      const nameRaw = String(row?.name || row?.businessName || row?.restaurantName || "").trim();
      const name = isGenericBusinessBootstrapLabel(nameRaw) ? "" : nameRaw;
      const img = String(row?.img || row?.logo || row?.logoUrl || "").trim();
      return {
        id: restaurantId,
        restaurantId,
        name,
        img,
        isLive: !!row?.isLive
      };
    })
    .filter(Boolean);
}

function normalizeWebRouteSeedPost(post = {}, restaurantId = "") {
  const id = String(post?.id || "").trim();
  const url = String(post?.image || post?.url || "").trim();
  if (!id || !url) return null;
  const safeRestaurantId = String(restaurantId || post?.restaurantId || post?.ownerId || "").trim();
  if (!safeRestaurantId) return null;
  return {
    id,
    url,
    type: String(post?.type || "square").trim() || "square",
    title: "",
    caption: String(post?.content || "").trim(),
    createdAt: post?.createdAt || null,
    likes: Number.isFinite(Number(post?.likes)) ? Number(post.likes) : 0,
    comments: Number.isFinite(Number(post?.comments)) ? Number(post.comments) : 0,
    isVideo: !!post?.isVideo,
    ownerType: "restaurant",
    ownerId: safeRestaurantId,
    restaurantId: safeRestaurantId
  };
}

function normalizeCountOrNull(value) {
  if (value === null || value === undefined || value === "") return null;
  const numeric = Number(value);
  if (!Number.isFinite(numeric) || numeric < 0) return null;
  return Math.max(0, Math.round(numeric));
}

function normalizeTruthState(value = "", fallback = "unknown") {
  const truth = String(value || "").trim().toLowerCase();
  if (truth === "seeded") return "seeded";
  if (truth === "knownempty" || truth === "known-empty") return "knownEmpty";
  if (truth === "unknown") return "unknown";
  const fallbackTruth = String(fallback || "").trim().toLowerCase();
  if (fallbackTruth === "seeded") return "seeded";
  if (fallbackTruth === "knownempty" || fallbackTruth === "known-empty") return "knownEmpty";
  return "unknown";
}

function normalizeBootstrapMenuOrderIndex(value, fallback = 0) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return Math.max(0, Number(fallback) || 0);
  return Math.max(0, Math.floor(numeric));
}

function normalizeWebRouteMenuItem(item = {}, restaurantId = "", index = 0) {
  const row = item && typeof item === "object" ? item : {};
  const safeRestaurantId = String(restaurantId || row.restaurantId || "").trim();
  if (!safeRestaurantId) return null;
  const fallbackNameToken = String(row?.name || row?.title || row?.category || "item")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "item";
  const id = String(
    row?.id
    || row?.itemId
    || row?.menuItemId
    || row?.productId
    || `${fallbackNameToken}_${Math.max(0, Number(index) || 0)}`
  ).trim();
  if (!id) return null;
  const imageUrlsRaw = [];
  if (Array.isArray(row?.imageUrls)) imageUrlsRaw.push(...row.imageUrls);
  if (Array.isArray(row?.images)) imageUrlsRaw.push(...row.images);
  if (row?.imageUrl) imageUrlsRaw.unshift(row.imageUrl);
  if (row?.image) imageUrlsRaw.push(row.image);
  const imageUrls = Array.from(new Set(imageUrlsRaw
    .map((entry) => String(entry || "").trim())
    .filter(Boolean)));
  const imageUrl = String(row?.imageUrl || imageUrls[0] || "").trim();
  return {
    ...row,
    id,
    restaurantId: safeRestaurantId,
    orderIndex: normalizeBootstrapMenuOrderIndex(
      row?.orderIndex ?? row?.sortOrder ?? row?.position ?? row?.rank,
      index
    ),
    imageUrl,
    imageUrls
  };
}

function normalizeWebRouteFocusItem(item = {}, index = 0) {
  const row = item && typeof item === "object" ? item : {};
  const id = String(row?.id || row?._id || `focus_${Math.max(0, Number(index) || 0)}`).trim();
  if (!id) return null;
  return {
    id,
    title: String(row?.title || row?.name || "Sot ne Fokus").trim() || "Sot ne Fokus",
    text: String(row?.text || row?.desc || row?.description || "").trim(),
    imageUrl: String(row?.imageUrl || row?.image || row?.photoUrl || "").trim(),
    cropX: Number.isFinite(Number(row?.cropX)) ? Number(row.cropX) : 50,
    cropY: Number.isFinite(Number(row?.cropY)) ? Number(row.cropY) : 50,
    active: row?.active !== false
  };
}

function normalizeIncomingWebRoutePayload(payload = null) {
  if (!payload || typeof payload !== "object") return null;
  const snapshotPayload = payload?.businessSnapshot && typeof payload.businessSnapshot === "object"
    ? payload.businessSnapshot
    : null;
  const restaurantId = String(
    payload?.canonicalRestaurantId
    || payload?.restaurantId
    || payload?.targetRestaurantId
    || snapshotPayload?.restaurantId
    || ""
  ).trim();
  if (!restaurantId) return null;
  const surface = String(payload?.surface || payload?.topTab || "").trim().toLowerCase() === "menu"
    ? "menu"
    : "profile";
  const topTab = String(payload?.topTab || surface).trim().toLowerCase() || surface;
  const contentTab = String(payload?.contentTab || (surface === "menu" ? "menu" : "posts")).trim().toLowerCase()
    || (surface === "menu" ? "menu" : "posts");
  const identity = snapshotPayload?.identity && typeof snapshotPayload.identity === "object"
    ? snapshotPayload.identity
    : (payload?.identity && typeof payload.identity === "object"
      ? payload.identity
      : {});
  const snapshotPosts = snapshotPayload?.posts && typeof snapshotPayload.posts === "object"
    ? snapshotPayload.posts
    : {};
  const snapshotMenu = snapshotPayload?.menu && typeof snapshotPayload.menu === "object"
    ? snapshotPayload.menu
    : {};
  const snapshotFocus = snapshotPayload?.focus && typeof snapshotPayload.focus === "object"
    ? snapshotPayload.focus
    : {};
  const postsItemsRaw = Array.isArray(snapshotPosts?.items)
    ? snapshotPosts.items
    : (Array.isArray(payload?.posts?.items)
      ? payload.posts.items
      : (Array.isArray(payload?.postItems) ? payload.postItems : []));
  const postsItems = postsItemsRaw
    .map((row) => normalizeWebRouteSeedPost(row, restaurantId))
    .filter(Boolean);
  const menuItemsRaw = Array.isArray(snapshotMenu?.items)
    ? snapshotMenu.items
    : (Array.isArray(payload?.menu?.items)
      ? payload.menu.items
      : (Array.isArray(payload?.menuItems) ? payload.menuItems : []));
  const menuItems = menuItemsRaw
    .map((row, index) => normalizeWebRouteMenuItem(row, restaurantId, index))
    .filter(Boolean)
    .sort((a, b) => normalizeBootstrapMenuOrderIndex(a?.orderIndex) - normalizeBootstrapMenuOrderIndex(b?.orderIndex));
  const focusItemsRaw = Array.isArray(snapshotFocus?.items)
    ? snapshotFocus.items
    : (Array.isArray(payload?.focus?.items)
      ? payload.focus.items
      : (Array.isArray(payload?.focusItems) ? payload.focusItems : []));
  const focusItems = focusItemsRaw
    .map((row, index) => normalizeWebRouteFocusItem(row, index))
    .filter(Boolean)
    .filter((row) => row.active !== false);
  const resolveSectionTruthState = (section = {}, fallbackCount = 0) => {
    const explicitState = normalizeTruthState(String(section?.state || "").trim().toLowerCase(), "unknown");
    if (explicitState === "knownEmpty") return "knownEmpty";
    if (explicitState === "seeded") return fallbackCount > 0 ? "seeded" : "unknown";
    if (explicitState === "unknown") return "unknown";
    if (section?.seeded === true) return fallbackCount > 0 ? "seeded" : "unknown";
    if (fallbackCount > 0) return "seeded";
    if (section?.knownEmpty === true || (Number(section?.count) === 0 && section?.unknown !== true)) return "knownEmpty";
    return "unknown";
  };
  const postsState = resolveSectionTruthState(snapshotPosts?.state ? snapshotPosts : payload?.posts, postsItems.length);
  const menuState = resolveSectionTruthState(snapshotMenu?.state ? snapshotMenu : payload?.menu, menuItems.length);
  const focusState = resolveSectionTruthState(snapshotFocus?.state ? snapshotFocus : payload?.focus, focusItems.length);
  const requestedPostsCount = Number(snapshotPosts?.count ?? payload?.posts?.count);
  const postsCount = Number.isFinite(requestedPostsCount)
    ? Math.max(postsItems.length, Math.max(0, Math.round(requestedPostsCount)))
    : postsItems.length;
  const requestedMenuCount = Number(snapshotMenu?.count ?? payload?.menu?.count);
  const menuCount = Number.isFinite(requestedMenuCount)
    ? Math.max(menuItems.length, Math.max(0, Math.round(requestedMenuCount)))
    : menuItems.length;
  const requestedFocusCount = Number(snapshotFocus?.count ?? payload?.focus?.count);
  const focusCount = Number.isFinite(requestedFocusCount)
    ? Math.max(focusItems.length, Math.max(0, Math.round(requestedFocusCount)))
    : focusItems.length;
  const snapshotVersion = String(
    snapshotPayload?.snapshotVersion
    || payload?.snapshotVersion
    || "business-page-v1"
  ).trim() || "business-page-v1";
  const snapshotUpdatedAt = Math.max(
    0,
    Number(snapshotPayload?.updatedAt || payload?.snapshotUpdatedAt || 0) || 0
  ) || Date.now();
  const snapshotVersionKey = String(
    snapshotPayload?.version
    || payload?.snapshotVersionKey
    || `${restaurantId}:${snapshotUpdatedAt}:${snapshotVersion}`
  ).trim() || `${restaurantId}:${snapshotUpdatedAt}:${snapshotVersion}`;
  const menuStatusBadgeVisible = snapshotMenu?.statusBadgeVisible !== false
    && payload?.menu?.statusBadgeVisible !== false;
  const focusEnabled = snapshotFocus?.enabled !== false
    && payload?.focus?.enabled !== false;
  const truthPayload = snapshotPayload?.truth && typeof snapshotPayload.truth === "object"
    ? snapshotPayload.truth
    : (payload?.truth && typeof payload.truth === "object" ? payload.truth : {});
  const identityTruth = normalizeTruthState(truthPayload?.identity || "", (
    String(identity?.name || "").trim()
    || String(identity?.handle || "").trim()
    || String(identity?.avatar || "").trim()
  ) ? "seeded" : "unknown");
  const bioTruth = normalizeTruthState(truthPayload?.bio || "", String(identity?.bio || "").trim() ? "seeded" : "knownEmpty");
  const avatarTruth = normalizeTruthState(truthPayload?.avatar || "", String(identity?.avatar || "").trim() ? "seeded" : "knownEmpty");
  const countsTruth = normalizeTruthState(truthPayload?.counts || "", (
    normalizeCountOrNull(identity?.followers) !== null
    || normalizeCountOrNull(identity?.following) !== null
  ) ? "seeded" : "unknown");
  const layoutMenuCardColor = String(payload?.layout?.menuCardColor || snapshotPayload?.layout?.menuCardColor || "").trim().toLowerCase() || "white";
  const layoutTruth = normalizeTruthState(truthPayload?.layout || "", layoutMenuCardColor ? "seeded" : "unknown");
  const businessSnapshot = {
    snapshotVersion,
    version: snapshotVersionKey,
    updatedAt: snapshotUpdatedAt,
    restaurantId,
    identity: {
      name: String(identity?.name || "").trim(),
      handle: String(identity?.handle || "").trim(),
      publicSlug: String(identity?.publicSlug || identity?.landingSlug || "").trim(),
      avatar: String(identity?.avatar || "").trim(),
      titleImageUrl: String(identity?.titleImageUrl || identity?.coverImageUrl || identity?.coverUrl || identity?.heroUrl || "").trim(),
      coverImageUrl: String(identity?.coverImageUrl || identity?.titleImageUrl || "").trim(),
      coverUrl: String(identity?.coverUrl || identity?.titleImageUrl || "").trim(),
      heroUrl: String(identity?.heroUrl || identity?.titleImageUrl || "").trim(),
      location: String(identity?.location || "").trim(),
      bio: String(identity?.bio || "").trim(),
      followers: normalizeCountOrNull(identity?.followers),
      following: normalizeCountOrNull(identity?.following),
      type: String(identity?.type || identity?.customerType || "").trim(),
      customerType: String(identity?.customerType || identity?.type || "").trim()
    },
    posts: {
      state: postsState,
      seeded: postsState === "seeded",
      knownEmpty: postsState === "knownEmpty",
      unknown: postsState === "unknown",
      count: postsCount,
      items: postsItems
    },
    menu: {
      state: menuState,
      seeded: menuState === "seeded",
      knownEmpty: menuState === "knownEmpty",
      unknown: menuState === "unknown",
      count: menuCount,
      items: menuItems,
      statusBadgeVisible: menuStatusBadgeVisible
    },
    focus: {
      state: focusState,
      seeded: focusState === "seeded",
      knownEmpty: focusState === "knownEmpty",
      unknown: focusState === "unknown",
      count: focusCount,
      items: focusItems,
      enabled: focusEnabled
    },
    layout: {
      menuCardColor: layoutMenuCardColor
    },
    truth: {
      identity: identityTruth,
      bio: bioTruth,
      avatar: avatarTruth,
      counts: countsTruth,
      posts: postsState,
      menu: menuState,
      focus: focusState,
      layout: layoutTruth
    }
  };
  return {
    owner: "web-direct",
    routeFirst: true,
    restaurantId,
    canonicalRestaurantId: restaurantId,
    surface,
    topTab,
    contentTab,
    phase: String(payload?.phase || "loading").trim().toLowerCase() || "loading",
    menuAccessSource: String(payload?.menuAccessSource || "").trim().toLowerCase(),
    tableNumber: Math.max(0, Number(payload?.tableNumber || 0) || 0),
    identity: {
      name: businessSnapshot.identity.name,
      handle: businessSnapshot.identity.handle,
      publicSlug: businessSnapshot.identity.publicSlug,
      avatar: businessSnapshot.identity.avatar,
      location: businessSnapshot.identity.location,
      bio: businessSnapshot.identity.bio,
      followers: businessSnapshot.identity.followers,
      following: businessSnapshot.identity.following,
      type: businessSnapshot.identity.type,
      customerType: businessSnapshot.identity.customerType
    },
    posts: {
      state: businessSnapshot.posts.state,
      count: businessSnapshot.posts.count,
      seeded: businessSnapshot.posts.seeded,
      knownEmpty: businessSnapshot.posts.knownEmpty,
      unknown: businessSnapshot.posts.unknown,
      items: businessSnapshot.posts.items
    },
    menu: {
      state: businessSnapshot.menu.state,
      count: businessSnapshot.menu.count,
      seeded: businessSnapshot.menu.seeded,
      knownEmpty: businessSnapshot.menu.knownEmpty,
      unknown: businessSnapshot.menu.unknown,
      items: businessSnapshot.menu.items,
      statusBadgeVisible: businessSnapshot.menu.statusBadgeVisible
    },
    focus: {
      state: businessSnapshot.focus.state,
      count: businessSnapshot.focus.count,
      seeded: businessSnapshot.focus.seeded,
      knownEmpty: businessSnapshot.focus.knownEmpty,
      unknown: businessSnapshot.focus.unknown,
      items: businessSnapshot.focus.items,
      enabled: businessSnapshot.focus.enabled
    },
    layout: {
      menuCardColor: businessSnapshot.layout.menuCardColor
    },
    truth: {
      identity: businessSnapshot.truth.identity,
      bio: businessSnapshot.truth.bio,
      avatar: businessSnapshot.truth.avatar,
      counts: businessSnapshot.truth.counts,
      posts: businessSnapshot.truth.posts,
      menu: businessSnapshot.truth.menu,
      focus: businessSnapshot.truth.focus,
      layout: businessSnapshot.truth.layout
    },
    snapshotVersion: businessSnapshot.snapshotVersion,
    snapshotUpdatedAt: businessSnapshot.updatedAt,
    snapshotVersionKey: businessSnapshot.version,
    businessSnapshot,
    ts: Number(payload?.ts || 0) || Date.now()
  };
}

function resolveWebRoutePayloadForRestaurant(routePayload = null, restaurantId = "") {
  if (!routePayload || typeof routePayload !== "object") return null;
  const safeRestaurantId = String(restaurantId || "").trim();
  if (!safeRestaurantId) return null;
  const normalizeRouteLookupKey = (value = "") => String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  const snapshot = routePayload?.businessSnapshot && typeof routePayload.businessSnapshot === "object"
    ? routePayload.businessSnapshot
    : null;
  const payloadRestaurantId = String(
    routePayload?.canonicalRestaurantId
    || snapshot?.restaurantId
    || routePayload?.restaurantId
    || ""
  ).trim();
  if (payloadRestaurantId && payloadRestaurantId === safeRestaurantId) {
    return routePayload;
  }
  const requestedLookup = normalizeRouteLookupKey(safeRestaurantId);
  if (!requestedLookup) return null;
  const snapshotIdentity = snapshot?.identity && typeof snapshot.identity === "object"
    ? snapshot.identity
    : null;
  const payloadIdentity = routePayload?.identity && typeof routePayload.identity === "object"
    ? routePayload.identity
    : null;
  const payloadLookupCandidates = [
    snapshotIdentity?.publicSlug,
    snapshotIdentity?.landingSlug,
    snapshotIdentity?.handle,
    payloadIdentity?.publicSlug,
    payloadIdentity?.landingSlug,
    payloadIdentity?.handle,
    payloadRestaurantId
  ];
  const hasLookupMatch = payloadLookupCandidates.some((candidate) => {
    const normalized = normalizeRouteLookupKey(candidate);
    return !!normalized && normalized === requestedLookup;
  });
  return hasLookupMatch ? routePayload : null;
}

function applyWebDirectRouteSeedFromBootstrap({
  state = null,
  routeRestaurantId = "",
  incomingRestaurants = [],
  normalizedFeedPosts = [],
  routePayload = null,
  maxPosts = 8
} = {}) {
  if (!state || typeof state !== "object") return false;
  const requestedRouteRestaurantId = String(routeRestaurantId || "").trim();
  if (!requestedRouteRestaurantId) return false;
  const view = state.profileView && typeof state.profileView === "object" ? state.profileView : null;
  const profile = view?.profile && typeof view.profile === "object" ? view.profile : null;
  if (!view || !profile) return false;
  const directEntry = view?.directEntry && typeof view.directEntry === "object" ? view.directEntry : null;
  const directOwner = String(directEntry?.owner || "").trim().toLowerCase();
  if (directOwner !== "web-direct") return false;
  const safeRoutePayload = resolveWebRoutePayloadForRestaurant(routePayload, requestedRouteRestaurantId);
  if (!safeRoutePayload) return false;
  const routeSnapshot = safeRoutePayload?.businessSnapshot && typeof safeRoutePayload.businessSnapshot === "object"
    ? safeRoutePayload.businessSnapshot
    : null;
  const safeRestaurantId = String(
    safeRoutePayload?.canonicalRestaurantId
    || routeSnapshot?.restaurantId
    || safeRoutePayload?.restaurantId
    || requestedRouteRestaurantId
    || ""
  ).trim();
  if (!safeRestaurantId) return false;
  const webDirectEntry = state?.__webDirectEntry && typeof state.__webDirectEntry === "object" && state.__webDirectEntry.active === true
    ? state.__webDirectEntry
    : null;
  const routeTargetIds = [
    safeRestaurantId,
    requestedRouteRestaurantId,
    safeRoutePayload?.canonicalRestaurantId,
    routeSnapshot?.restaurantId,
    safeRoutePayload?.restaurantId,
    webDirectEntry?.canonicalRestaurantId,
    webDirectEntry?.restaurantId
  ].map((value) => String(value || "").trim()).filter(Boolean);
  const isRouteTargetId = (value = "") => routeTargetIds.includes(String(value || "").trim());
  const visibleRestaurantId = String(
    profile.canonicalRestaurantId
    || profile.restaurantId
    || ""
  ).trim();
  if (
    visibleRestaurantId
    && visibleRestaurantId !== requestedRouteRestaurantId
    && visibleRestaurantId !== safeRestaurantId
  ) {
    return false;
  }
  const currentRoutePayload = view?.routePayload && typeof view.routePayload === "object"
    ? view.routePayload
    : null;
  const currentDirectEntryPhase = String(view?.directEntry?.phase || "").trim().toLowerCase();
  const currentRoutePayloadOwner = String(currentRoutePayload?.owner || "").trim().toLowerCase();
  const currentRoutePayloadRestaurantId = String(
    currentRoutePayload?.canonicalRestaurantId
    || currentRoutePayload?.businessSnapshot?.restaurantId
    || currentRoutePayload?.restaurantId
    || ""
  ).trim();
  const currentMenuTruthState = String(state?.menu?.truthState || "").trim().toLowerCase();
  const currentFocusTruthState = String(state?.focus?.truthState || "").trim().toLowerCase();
  const currentIdentityReady = String(profile?.identityTruthState || "").trim().toLowerCase() === "ready"
    || !!(
      String(profile?.name || "").trim()
      || String(profile?.avatar || "").trim()
      || String(profile?.handle || "").trim()
    );
  const currentPostsSettled = profile?.postsLoaded === true
    || ["stable", "empty"].includes(String(profile?.truthState || "").trim().toLowerCase());
  const currentMenuSettled = isRouteTargetId(state?.menu?.restaurantId)
    && String(state?.menu?.source || "").trim().toLowerCase() === "public"
    && (
      currentMenuTruthState === "seeded"
      || currentMenuTruthState === "knownempty"
      || currentMenuTruthState === "known-empty"
    );
  const currentPublicMenuKnownEmpty = currentMenuSettled
    && (currentMenuTruthState === "knownempty" || currentMenuTruthState === "known-empty");
  const currentPublicMenuHasItems = currentMenuSettled
    && currentMenuTruthState === "seeded"
    && Array.isArray(state?.menu?.items)
    && state.menu.items.length > 0;
  const currentFocusSettled = currentPublicMenuKnownEmpty
    || (
      isRouteTargetId(state?.focus?.restaurantId)
      && currentPublicMenuHasItems
      && String(state?.focus?.truthSource || "").trim().toLowerCase() === "public-menu"
      && (
        currentFocusTruthState === "seeded"
        || currentFocusTruthState === "knownempty"
        || currentFocusTruthState === "known-empty"
      )
    );
  const currentWebDirectSurfaceSettled = currentDirectEntryPhase === "ready"
    && currentRoutePayloadOwner === "web-direct"
    && currentRoutePayloadRestaurantId === safeRestaurantId
    && currentIdentityReady
    && currentPostsSettled
    && currentMenuSettled
    && currentFocusSettled;
  if (currentWebDirectSurfaceSettled) {
    return false;
  }
  const routeIdentity = routeSnapshot?.identity && typeof routeSnapshot.identity === "object"
    ? routeSnapshot.identity
    : (safeRoutePayload?.identity && typeof safeRoutePayload.identity === "object"
      ? safeRoutePayload.identity
      : null);
  const routePostsSeed = Array.isArray(routeSnapshot?.posts?.items)
    ? routeSnapshot.posts.items
    : (Array.isArray(safeRoutePayload?.posts?.items) ? safeRoutePayload.posts.items : []);
  const routeMenuSeed = [];
  const routeFocusSeed = [];
  const routeTruth = routeSnapshot?.truth && typeof routeSnapshot.truth === "object"
    ? routeSnapshot.truth
    : (safeRoutePayload?.truth && typeof safeRoutePayload.truth === "object" ? safeRoutePayload.truth : {});
  const routePostsState = normalizeTruthState(routeSnapshot?.posts?.state || safeRoutePayload?.posts?.state || routeTruth?.posts || "", (
    routePostsSeed.length ? "seeded" : "unknown"
  ));
  const routeMenuState = "unknown";
  const routeFocusState = "unknown";
  let resolvedRoutePostsState = routePostsState;
  let resolvedRouteMenuState = routeMenuState;
  let resolvedRouteFocusState = routeFocusState;
  const routeIdentityState = normalizeTruthState(routeTruth?.identity || "", (
    routeIdentity?.name || routeIdentity?.avatar || routeIdentity?.handle
  ) ? "seeded" : "unknown");
  const routeBioState = normalizeTruthState(routeTruth?.bio || "", String(routeIdentity?.bio || "").trim() ? "seeded" : "knownEmpty");
  const routeFocusEnabled = true;
  const routeMenuStatusBadgeVisible = routeSnapshot?.menu?.statusBadgeVisible !== false
    && safeRoutePayload?.menu?.statusBadgeVisible !== false;
  const routeLayoutColor = String(safeRoutePayload?.layout?.menuCardColor || "").trim().toLowerCase();
  const currentMenuAccessSource = String(
    view?.menuAccessSource
    || safeRoutePayload?.menuAccessSource
    || currentRoutePayload?.menuAccessSource
    || ""
  ).trim().toLowerCase();
  const currentTableNumber = Math.max(0, Number(
    view?.tableNumber
    || safeRoutePayload?.tableNumber
    || currentRoutePayload?.tableNumber
    || 0
  ) || 0);
  const safeMaxPosts = Math.max(1, Number(maxPosts) || 8);
  let changed = false;
  const restaurantPreview = (Array.isArray(incomingRestaurants) ? incomingRestaurants : [])
    .find((row) => String(row?.id || "").trim() === safeRestaurantId) || null;
  const canonicalRestaurant = (Array.isArray(state?.restaurants) ? state.restaurants : [])
    .find((row) => String(row?.id || "").trim() === safeRestaurantId && !isBootstrapRestaurantPreviewRecordCore(row))
    || null;
  const stateRestaurantPreview = canonicalRestaurant
    ? null
    : ((Array.isArray(state?.restaurants) ? state.restaurants : [])
      .find((row) => String(row?.id || "").trim() === safeRestaurantId && isBootstrapRestaurantPreviewRecordCore(row)) || null);
  const previewFallback = restaurantPreview || stateRestaurantPreview;
  const currentName = String(profile.name || "").trim();
  const currentHandle = String(profile.handle || "").trim();
  const currentAvatar = String(profile.avatar || "").trim();
  const currentTitleImage = String(profile.titleImageUrl || profile.coverImageUrl || profile.coverUrl || profile.heroUrl || "").trim();
  const currentLocation = String(profile.location || "").trim();
  const currentType = String(profile.type || profile.customerType || "").trim();
  const canUsePreviewName = !currentName || isGenericBusinessBootstrapLabel(currentName);
  const canUsePreviewHandle = !currentHandle;
  const canUsePreviewAvatar = !currentAvatar;
  const canUsePreviewTitleImage = !currentTitleImage;
  const canUsePreviewLocation = !currentLocation;
  const canUsePreviewType = !currentType;
  const nextName = String(
    routeIdentity?.name
    || canonicalRestaurant?.name
    || canonicalRestaurant?.restaurantName
    || (canUsePreviewName ? (previewFallback?.name || previewFallback?.restaurantName || "") : "")
    || ""
  ).trim();
  const nextHandle = String(
    routeIdentity?.handle
    || canonicalRestaurant?.handle
    || canonicalRestaurant?.publicSlug
    || canonicalRestaurant?.landingSlug
    || (canUsePreviewHandle ? (previewFallback?.handle || previewFallback?.publicSlug || previewFallback?.landingSlug || "") : "")
    || ""
  ).trim();
  const nextAvatar = String(
    routeIdentity?.avatar
    || canonicalRestaurant?.logoUrl
    || canonicalRestaurant?.logo
    || canonicalRestaurant?.logoURL
    || (canUsePreviewAvatar ? (previewFallback?.logoUrl || previewFallback?.logo || previewFallback?.logoURL || "") : "")
    || ""
  ).trim();
  const nextTitleImage = String(
    routeIdentity?.titleImageUrl
    || routeIdentity?.coverImageUrl
    || routeIdentity?.coverUrl
    || routeIdentity?.heroUrl
    || canonicalRestaurant?.titleImageUrl
    || canonicalRestaurant?.coverImageUrl
    || canonicalRestaurant?.coverUrl
    || canonicalRestaurant?.heroUrl
    || (canUsePreviewTitleImage ? (previewFallback?.titleImageUrl || previewFallback?.coverImageUrl || previewFallback?.coverUrl || previewFallback?.heroUrl || "") : "")
    || ""
  ).trim();
  const nextLocation = String(
    routeIdentity?.location
    || canonicalRestaurant?.city
    || canonicalRestaurant?.address
    || canonicalRestaurant?.location
    || (canUsePreviewLocation ? (previewFallback?.city || previewFallback?.address || previewFallback?.location || "") : "")
    || ""
  ).trim();
  const nextType = String(
    routeIdentity?.type
    || routeIdentity?.customerType
    || canonicalRestaurant?.type
    || canonicalRestaurant?.customerType
    || canonicalRestaurant?.restaurantType
    || (canUsePreviewType
      ? (previewFallback?.type || previewFallback?.customerType || previewFallback?.restaurantType || "")
      : "")
    || ""
  ).trim();
  const nextFollowers = normalizeCountOrNull(routeIdentity?.followers);
  const nextFollowing = normalizeCountOrNull(routeIdentity?.following);
  const nextBio = String(routeIdentity?.bio || "").trim();
  if (String(profile.canonicalRestaurantId || "").trim() !== safeRestaurantId) {
    profile.canonicalRestaurantId = safeRestaurantId;
    changed = true;
  }
  if (!String(profile.restaurantId || "").trim()) {
    profile.restaurantId = safeRestaurantId;
    changed = true;
  }
  if (nextName && nextName !== String(profile.name || "").trim()) {
    profile.name = nextName;
    changed = true;
  }
  if (nextHandle && nextHandle !== String(profile.handle || "").trim()) {
    profile.handle = nextHandle;
    changed = true;
  }
  if (nextAvatar && nextAvatar !== String(profile.avatar || "").trim()) {
    profile.avatar = nextAvatar;
    changed = true;
  }
  if (nextTitleImage && nextTitleImage !== currentTitleImage) {
    profile.titleImageUrl = nextTitleImage;
    profile.coverImageUrl = profile.coverImageUrl || nextTitleImage;
    profile.coverUrl = profile.coverUrl || nextTitleImage;
    profile.heroUrl = profile.heroUrl || nextTitleImage;
    changed = true;
  }
  if (nextLocation && nextLocation !== String(profile.location || "").trim()) {
    profile.location = nextLocation;
    changed = true;
  }
  if (routeBioState !== "unknown") {
    const resolvedBio = nextBio || (routeBioState === "knownEmpty" ? "" : String(profile.bio || "").trim());
    if (resolvedBio !== String(profile.bio || "").trim()) {
      profile.bio = resolvedBio;
      changed = true;
    }
  }
  if (nextType && nextType !== String(profile.type || "").trim()) {
    profile.type = nextType;
    profile.customerType = nextType;
    changed = true;
  }
  if (nextFollowers !== null && nextFollowers !== normalizeCountOrNull(profile.followers)) {
    profile.followers = nextFollowers;
    changed = true;
  }
  if (nextFollowing !== null && nextFollowing !== normalizeCountOrNull(profile.following)) {
    profile.following = nextFollowing;
    changed = true;
  }
  const nextIdentityTruthState = routeIdentityState === "seeded" || (nextName || nextAvatar || nextLocation || nextHandle)
    ? "ready"
    : "loading";
  if (String(profile.identityTruthState || "").trim().toLowerCase() !== nextIdentityTruthState) {
    profile.identityTruthState = nextIdentityTruthState;
    changed = true;
  }
  if (resolvedRouteMenuState === "seeded") {
    state.menu = {
      ...(state?.menu || {}),
      restaurantId: safeRestaurantId,
      items: routeMenuSeed,
      loading: false,
      error: "",
      source: "public",
      statusBadgeVisible: routeMenuStatusBadgeVisible,
      routeSeed: true,
      truthState: "seeded"
    };
    changed = true;
  } else if (resolvedRouteMenuState === "knownEmpty") {
    state.menu = {
      ...(state?.menu || {}),
      restaurantId: safeRestaurantId,
      items: [],
      loading: false,
      error: "",
      source: "public",
      statusBadgeVisible: routeMenuStatusBadgeVisible,
      routeSeed: false,
      truthState: "knownEmpty"
    };
    changed = true;
  } else if (resolvedRouteMenuState === "unknown") {
    const currentMenuTruth = String(state?.menu?.truthState || "").trim().toLowerCase();
    const currentMenuRestaurantId = String(state?.menu?.restaurantId || "").trim();
    const hasSeededMenuTruth = isRouteTargetId(currentMenuRestaurantId)
      && String(state?.menu?.source || "").trim().toLowerCase() === "public"
      && (currentMenuTruth === "seeded" || currentMenuTruth === "knownempty" || currentMenuTruth === "known-empty");
    if (hasSeededMenuTruth) {
      resolvedRouteMenuState = currentMenuTruth === "seeded" ? "seeded" : "knownEmpty";
      const mergedMenuState = {
        ...(state?.menu || {}),
        restaurantId: currentMenuRestaurantId || safeRestaurantId,
        source: "public",
        statusBadgeVisible: routeMenuStatusBadgeVisible,
        loading: false
      };
      if (
        mergedMenuState.source !== state?.menu?.source
        || mergedMenuState.statusBadgeVisible !== state?.menu?.statusBadgeVisible
        || mergedMenuState.loading !== state?.menu?.loading
      ) {
        state.menu = mergedMenuState;
        changed = true;
      }
    } else {
      const sameRestaurantItems = isRouteTargetId(state?.menu?.restaurantId)
        && String(state?.menu?.source || "").trim().toLowerCase() === "public"
        && Array.isArray(state?.menu?.items)
        ? state.menu.items
        : [];
      state.menu = {
        ...(state?.menu || {}),
        restaurantId: safeRestaurantId,
        items: sameRestaurantItems,
        loading: true,
        error: "",
        source: "public",
        statusBadgeVisible: routeMenuStatusBadgeVisible,
        routeSeed: false,
        truthState: "unknown"
      };
      changed = true;
    }
  }
  if (resolvedRouteFocusState === "seeded") {
    state.focus = {
      ...(state?.focus || {}),
      restaurantId: safeRestaurantId,
      items: routeFocusSeed,
      enabled: routeFocusEnabled,
      loading: false,
      error: "",
      index: 0,
      truthSource: "public-menu",
      truthState: "seeded"
    };
    changed = true;
  } else if (resolvedRouteFocusState === "knownEmpty") {
    state.focus = {
      ...(state?.focus || {}),
      restaurantId: safeRestaurantId,
      items: [],
      enabled: routeFocusEnabled,
      loading: false,
      error: "",
      index: 0,
      truthSource: "public-menu",
      truthState: "knownEmpty"
    };
    changed = true;
  } else if (resolvedRouteFocusState === "unknown") {
    const currentFocusTruth = String(state?.focus?.truthState || "").trim().toLowerCase();
    const publicMenuHasItemsForFocus = isRouteTargetId(state?.menu?.restaurantId)
      && String(state?.menu?.source || "").trim().toLowerCase() === "public"
      && String(state?.menu?.truthState || "").trim().toLowerCase() === "seeded"
      && Array.isArray(state?.menu?.items)
      && state.menu.items.length > 0;
    const publicMenuKnownEmptyForFocus = isRouteTargetId(state?.menu?.restaurantId)
      && String(state?.menu?.source || "").trim().toLowerCase() === "public"
      && (
        String(state?.menu?.truthState || "").trim().toLowerCase() === "knownempty"
        || String(state?.menu?.truthState || "").trim().toLowerCase() === "known-empty"
      );
    const currentFocusRestaurantId = String(state?.focus?.restaurantId || "").trim();
    const hasSeededFocusTruth = isRouteTargetId(currentFocusRestaurantId)
      && publicMenuHasItemsForFocus
      && String(state?.focus?.truthSource || "").trim().toLowerCase() === "public-menu"
      && (currentFocusTruth === "seeded" || currentFocusTruth === "knownempty" || currentFocusTruth === "known-empty");
    if (hasSeededFocusTruth) {
      resolvedRouteFocusState = currentFocusTruth === "seeded" ? "seeded" : "knownEmpty";
      const mergedFocusState = {
        ...(state?.focus || {}),
        restaurantId: currentFocusRestaurantId || safeRestaurantId,
        enabled: routeFocusEnabled,
        loading: false
      };
      if (
        mergedFocusState.enabled !== state?.focus?.enabled
        || mergedFocusState.loading !== state?.focus?.loading
      ) {
        state.focus = mergedFocusState;
        changed = true;
      }
    } else if (publicMenuKnownEmptyForFocus) {
      resolvedRouteFocusState = "knownEmpty";
      state.focus = {
        ...(state?.focus || {}),
        restaurantId: safeRestaurantId,
        items: [],
        enabled: routeFocusEnabled,
        loading: false,
        error: "",
        index: 0,
        truthSource: "public-menu",
        truthState: "knownEmpty"
      };
      changed = true;
    } else {
      const sameRestaurantItems = isRouteTargetId(state?.focus?.restaurantId)
        && publicMenuHasItemsForFocus
        && String(state?.focus?.truthSource || "").trim().toLowerCase() === "public-menu"
        && Array.isArray(state?.focus?.items)
        ? state.focus.items
        : [];
      state.focus = {
        ...(state?.focus || {}),
        restaurantId: safeRestaurantId,
        items: sameRestaurantItems,
        enabled: routeFocusEnabled,
        loading: true,
        error: "",
        truthSource: "public-menu",
        truthState: "unknown"
      };
      changed = true;
    }
  }
  if (routeLayoutColor && String(state?.menuLayout?.cardColor || "").trim().toLowerCase() !== routeLayoutColor) {
    state.menuLayout = {
      ...(state?.menuLayout || {}),
      cardColor: routeLayoutColor
    };
    changed = true;
  }
  if (restaurantPreview) {
    profile.restaurantId = String(profile.restaurantId || safeRestaurantId).trim() || safeRestaurantId;
  }
  if (resolvedRoutePostsState === "seeded") {
    const seededPosts = routePostsSeed.length
      ? routePostsSeed.slice(0, safeMaxPosts)
      : [];
    const projected = projectPostCollectionThroughEntityMap(state, seededPosts);
    if (projected.length) {
      view.posts = projected;
      profile.posts = projected;
      profile.postsLoaded = true;
      profile.truthState = "stable";
      changed = true;
    } else if (seededPosts.length === 0) {
      view.posts = [];
      profile.posts = [];
      profile.postsLoaded = false;
      profile.truthState = "route-pending-loading";
      resolvedRoutePostsState = "unknown";
      changed = true;
    }
  } else if (resolvedRoutePostsState === "knownEmpty") {
    view.posts = [];
    profile.posts = [];
    profile.postsLoaded = true;
    profile.truthState = "empty";
    changed = true;
  } else {
    const existingPosts = Array.isArray(view.posts) ? view.posts : [];
    const currentPostsTruth = String(profile.truthState || "").trim().toLowerCase();
    const hasSeededPostsTruth = existingPosts.length > 0
      || profile.postsLoaded === true
      || currentPostsTruth === "stable"
      || currentPostsTruth === "empty";
    if (hasSeededPostsTruth) {
      resolvedRoutePostsState = existingPosts.length > 0 ? "seeded" : "knownEmpty";
      if (!Array.isArray(profile.posts)) {
        profile.posts = existingPosts.slice();
        changed = true;
      }
      if (profile.postsLoaded !== true) {
        profile.postsLoaded = true;
        changed = true;
      }
      const nextTruthState = existingPosts.length > 0 ? "stable" : "empty";
      if (String(profile.truthState || "").trim().toLowerCase() !== nextTruthState) {
        profile.truthState = nextTruthState;
        changed = true;
      }
    } else {
      if (!Array.isArray(view.posts)) view.posts = [];
      if (!Array.isArray(profile.posts)) profile.posts = [];
      profile.postsLoaded = false;
      profile.truthState = "route-pending-loading";
      changed = true;
    }
  }
  if (changed) {
    const activePosts = Array.isArray(view.posts) ? view.posts : [];
    const hasPublicMenuStateForRoute = isRouteTargetId(state?.menu?.restaurantId)
      && String(state?.menu?.source || "").trim().toLowerCase() === "public"
      && Array.isArray(state?.menu?.items);
    const menuCount = isRouteTargetId(state?.menu?.restaurantId)
      && String(state?.menu?.source || "").trim().toLowerCase() === "public"
      ? (Array.isArray(state?.menu?.items) ? state.menu.items.length : 0)
      : 0;
    const hasPublicFocusStateForRoute = isRouteTargetId(state?.focus?.restaurantId)
      && String(state?.focus?.truthSource || "").trim().toLowerCase() === "public-menu"
      && hasPublicMenuStateForRoute;
    const focusCount = hasPublicFocusStateForRoute
      ? (Array.isArray(state?.focus?.items) ? state.focus.items.length : 0)
      : 0;
    const activePostsCount = activePosts.length > 0
      ? activePosts.length
      : Math.max(0, Number(routeSnapshot?.posts?.count || safeRoutePayload?.posts?.count || 0) || 0);
    const snapshotPhaseReady = resolvedRoutePostsState !== "unknown"
      && resolvedRouteMenuState !== "unknown"
      && resolvedRouteFocusState !== "unknown"
      && nextIdentityTruthState === "ready";
    const nextSnapshot = {
      ...(routeSnapshot && typeof routeSnapshot === "object" ? routeSnapshot : {}),
      snapshotVersion: String(
        routeSnapshot?.snapshotVersion
        || safeRoutePayload?.snapshotVersion
        || "business-page-v1"
      ).trim() || "business-page-v1",
      version: String(
        routeSnapshot?.version
        || safeRoutePayload?.snapshotVersionKey
        || `${safeRestaurantId}:${Date.now()}:business-page-v1`
      ).trim(),
      updatedAt: Math.max(
        0,
        Number(routeSnapshot?.updatedAt || safeRoutePayload?.snapshotUpdatedAt || 0) || 0
      ) || Date.now(),
      restaurantId: safeRestaurantId,
      identity: {
        name: String(profile.name || "").trim(),
        handle: String(profile.handle || "").trim(),
        publicSlug: String(profile.publicSlug || profile.landingSlug || "").trim(),
        avatar: String(profile.avatar || "").trim(),
        titleImageUrl: String(profile.titleImageUrl || profile.coverImageUrl || profile.coverUrl || profile.heroUrl || "").trim(),
        coverImageUrl: String(profile.coverImageUrl || profile.titleImageUrl || "").trim(),
        coverUrl: String(profile.coverUrl || profile.titleImageUrl || "").trim(),
        heroUrl: String(profile.heroUrl || profile.titleImageUrl || "").trim(),
        location: String(profile.location || "").trim(),
        bio: String(profile.bio || "").trim(),
        followers: profile.followers ?? null,
        following: profile.following ?? null,
        type: String(profile.type || profile.customerType || "").trim(),
        customerType: String(profile.customerType || profile.type || "").trim()
      },
      posts: {
        state: resolvedRoutePostsState,
        seeded: resolvedRoutePostsState === "seeded",
        knownEmpty: resolvedRoutePostsState === "knownEmpty",
        unknown: resolvedRoutePostsState === "unknown",
        count: activePostsCount,
        items: activePosts
      },
      menu: {
        state: resolvedRouteMenuState,
        seeded: resolvedRouteMenuState === "seeded",
        knownEmpty: resolvedRouteMenuState === "knownEmpty",
        unknown: resolvedRouteMenuState === "unknown",
        count: menuCount,
        items: hasPublicMenuStateForRoute ? state.menu.items : [],
        statusBadgeVisible: state?.menu?.statusBadgeVisible !== false
      },
      focus: {
        state: resolvedRouteFocusState,
        seeded: resolvedRouteFocusState === "seeded",
        knownEmpty: resolvedRouteFocusState === "knownEmpty",
        unknown: resolvedRouteFocusState === "unknown",
        count: focusCount,
        items: hasPublicFocusStateForRoute && Array.isArray(state?.focus?.items) ? state.focus.items : [],
        enabled: state?.focus?.enabled !== false
      },
      layout: {
        menuCardColor: String(
          state?.menuLayout?.cardColor
          || safeRoutePayload?.layout?.menuCardColor
          || ""
        ).trim().toLowerCase() || "white"
      },
      truth: {
        identity: nextIdentityTruthState === "ready" ? "seeded" : "unknown",
        bio: routeBioState,
        avatar: String(profile.avatar || "").trim() ? "seeded" : "knownEmpty",
        counts: (normalizeCountOrNull(profile.followers) !== null || normalizeCountOrNull(profile.following) !== null)
          ? "seeded"
          : "unknown",
        posts: resolvedRoutePostsState,
        menu: resolvedRouteMenuState,
        focus: resolvedRouteFocusState,
        layout: "seeded"
      }
    };
    view.routePayload = {
      ...(safeRoutePayload || {}),
      owner: "web-direct",
      routeFirst: true,
      restaurantId: safeRestaurantId,
      canonicalRestaurantId: safeRestaurantId,
      surface: String(view?.directEntry?.topTab || "").trim().toLowerCase() === "menu" ? "menu" : "profile",
      topTab: String(view?.directEntry?.topTab || "").trim().toLowerCase() || "profile",
      contentTab: String(view?.directEntry?.contentTab || "").trim().toLowerCase() || "posts",
      phase: snapshotPhaseReady ? "ready" : "loading",
      menuAccessSource: currentMenuAccessSource === "qr" ? "qr" : "",
      tableNumber: currentMenuAccessSource === "qr" ? currentTableNumber : 0,
      identity: {
        name: String(profile.name || "").trim(),
        handle: String(profile.handle || "").trim(),
        publicSlug: String(profile.publicSlug || profile.landingSlug || "").trim(),
        avatar: String(profile.avatar || "").trim(),
        location: String(profile.location || "").trim(),
        bio: String(profile.bio || "").trim(),
        followers: profile.followers ?? null,
        following: profile.following ?? null
      },
      posts: {
        state: resolvedRoutePostsState,
        count: activePostsCount,
        seeded: resolvedRoutePostsState === "seeded",
        knownEmpty: resolvedRoutePostsState === "knownEmpty",
        unknown: resolvedRoutePostsState === "unknown",
        items: activePosts
      },
      menu: {
        state: resolvedRouteMenuState,
        count: menuCount,
        seeded: resolvedRouteMenuState === "seeded",
        knownEmpty: resolvedRouteMenuState === "knownEmpty",
        unknown: resolvedRouteMenuState === "unknown",
        items: hasPublicMenuStateForRoute ? state.menu.items : [],
        statusBadgeVisible: state?.menu?.statusBadgeVisible !== false
      },
      focus: {
        state: resolvedRouteFocusState,
        count: focusCount,
        seeded: resolvedRouteFocusState === "seeded",
        knownEmpty: resolvedRouteFocusState === "knownEmpty",
        unknown: resolvedRouteFocusState === "unknown",
        items: hasPublicFocusStateForRoute && Array.isArray(state?.focus?.items) ? state.focus.items : [],
        enabled: state?.focus?.enabled !== false
      },
      layout: {
        menuCardColor: String(
          state?.menuLayout?.cardColor
          || safeRoutePayload?.layout?.menuCardColor
          || ""
        ).trim().toLowerCase() || "white"
      },
      truth: {
        identity: nextIdentityTruthState === "ready" ? "seeded" : "unknown",
        bio: routeBioState,
        avatar: String(profile.avatar || "").trim() ? "seeded" : "knownEmpty",
        counts: (normalizeCountOrNull(profile.followers) !== null || normalizeCountOrNull(profile.following) !== null)
          ? "seeded"
          : "unknown",
        posts: resolvedRoutePostsState,
        menu: resolvedRouteMenuState,
        focus: resolvedRouteFocusState,
        layout: "seeded"
      },
      snapshotVersion: nextSnapshot.snapshotVersion,
      snapshotUpdatedAt: nextSnapshot.updatedAt,
      snapshotVersionKey: nextSnapshot.version,
      businessSnapshot: nextSnapshot,
      ts: Date.now()
    };
    if (
      snapshotPhaseReady
      && view?.directEntry
      && String(view.directEntry.owner || "").trim().toLowerCase() === "web-direct"
    ) {
      view.directEntry.phase = "ready";
    } else if (view?.directEntry && String(view.directEntry.owner || "").trim().toLowerCase() === "web-direct") {
      view.directEntry.phase = "loading";
    }
  }
  return changed;
}

export function createPublicBootstrapRuntimeController({
  state = null,
  windowObj = null,
  fetchFn = null,
  abortControllerCtor = null,
  defaultPublicBootstrapEndpoint = "",
  publicBootstrapEvent = "",
  normalizeRestaurantType = (value) => String(value || "").trim(),
  toDateSafe = () => null,
  formatRelative = () => "",
  mergeRestaurants = (restaurants) => restaurants,
  writeCache = () => {},
  readCache = () => null,
  cacheKeys = {},
  rebuildBusinessLocations = () => {},
  saveFeedPosts = () => {},
  normalizeStoryItemsForDisplay = (stories) => stories,
  buildStoriesSignature = () => "",
  setFeedStoriesSignature = () => {},
  queueStoryIdentityHydration = () => {},
  syncFeedPostLogos = () => false,
  updateFeedDom = () => false,
  render = () => {},
  reportCriticalRuntimeFailure = () => {},
  getLastRenderMode = () => "",
  fastLimits = {}
} = {}) {
  const win = windowObj || (typeof window === "undefined" ? null : window);
  const fetchRequest = typeof fetchFn === "function"
    ? fetchFn
    : (typeof fetch === "function" ? fetch : null);
  const AbortControllerCtor = typeof abortControllerCtor === "function"
    ? abortControllerCtor
    : (typeof AbortController === "function" ? AbortController : null);
  let publicBootstrapListenerBound = false;
  let publicBootstrapFetchPromise = null;
  let renderRequested = false;

  function requestRender() {
    if (renderRequested) return;
    renderRequested = true;
    Promise.resolve().then(() => {
      renderRequested = false;
      render();
    });
  }

  function scheduleNonCriticalTask(task, delayMs = 180) {
    if (typeof task !== "function") return;
    const safeDelay = Math.max(0, Number(delayMs) || 0);
    if (win && typeof win.setTimeout === "function") {
      win.setTimeout(task, safeDelay);
      return;
    }
    if (typeof setTimeout === "function") {
      setTimeout(task, safeDelay);
      return;
    }
    Promise.resolve().then(task);
  }

  function toMillisSafe(value) {
    const parsed = toDateSafe(value);
    if (parsed && typeof parsed.getTime === "function") {
      const millis = parsed.getTime();
      if (Number.isFinite(millis)) return millis;
    }
    const numeric = Number(value);
    return Number.isFinite(numeric) ? numeric : 0;
  }

  function buildFeedBootstrapSignature(items = []) {
    return (Array.isArray(items) ? items : [])
      .map((item) => {
        const id = String(item?.id || "").trim();
        const createdAt = toMillisSafe(item?.createdAt);
        const image = String(item?.image || "").trim();
        const logo = String(item?.logo || "").trim();
        return `${id}|${createdAt}|${image}|${logo}`;
      })
      .join(",");
  }

  function buildStoryBootstrapSignature(items = []) {
    return (Array.isArray(items) ? items : [])
      .map((item) => {
        const restaurantId = String(item?.restaurantId || item?.id || "").trim();
        const name = String(item?.name || "").trim();
        const img = String(item?.img || item?.logo || "").trim();
        const isLive = item?.isLive ? "1" : "0";
        return `${restaurantId}|${name}|${img}|${isLive}`;
      })
      .join(",");
  }

  function mergeBootstrapFeedPosts(existing = [], incoming = []) {
    const byId = new Map();
    (Array.isArray(existing) ? existing : []).forEach((row) => {
      const id = String(row?.id || "").trim();
      if (!id) return;
      byId.set(id, row);
    });
    (Array.isArray(incoming) ? incoming : []).forEach((row) => {
      const id = String(row?.id || "").trim();
      if (!id) return;
      byId.set(id, row);
    });
    return Array.from(byId.values())
      .sort((a, b) => toMillisSafe(b?.createdAt) - toMillisSafe(a?.createdAt));
  }

  function mergeBootstrapStories(existing = [], incoming = []) {
    const byRestaurant = new Map();
    (Array.isArray(incoming) ? incoming : []).forEach((row) => {
      const id = String(row?.restaurantId || row?.id || "").trim();
      if (!id) return;
      byRestaurant.set(id, row);
    });
    (Array.isArray(existing) ? existing : []).forEach((row) => {
      const id = String(row?.restaurantId || row?.id || "").trim();
      if (!id || byRestaurant.has(id)) return;
      byRestaurant.set(id, row);
    });
    return Array.from(byRestaurant.values());
  }

  function resolveBootstrapTimeoutMs(timeoutMs) {
    const requested = Number(timeoutMs);
    if (Number.isFinite(requested) && requested > 0) return requested;
    const fromWindow = Number(win?.__MENYRA_SOCIAL_BOOTSTRAP_TIMEOUT_MS__ || 0);
    if (Number.isFinite(fromWindow) && fromWindow > 0) return fromWindow;
    return 3800;
  }

  function resolveIncomingRouteBootstrapPayload(payload = null) {
    if (!payload || typeof payload !== "object") return null;
    const rawRoutePayload = payload.publicRoute || payload.routePayload || payload.route || null;
    return normalizeIncomingWebRoutePayload(rawRoutePayload);
  }

  function readWindowRouteParam(param = "") {
    const safeParam = String(param || "").trim();
    if (!safeParam) return "";
    try {
      const search = String(win?.location?.search || "");
      const params = new URLSearchParams(search);
      return String(params.get(safeParam) || "").trim();
    } catch {
      return "";
    }
  }

  function buildBootstrapRequestUrl(endpoint = "") {
    const baseEndpoint = String(endpoint || "").trim();
    if (!baseEndpoint) return "";
    try {
      const locationHref = String(win?.location?.href || "");
      const url = new URL(baseEndpoint, locationHref || undefined);
      const queryKeys = [
        "r",
        "restaurant",
        "restaurantId",
        "rid",
        "businessId",
        "tab",
        "view",
        "top",
        "surface",
        "screen",
        "src",
        "source",
        "menuSource",
        "menuAccessSource",
        "access",
        "table",
        "tableNumber",
        "t",
        "qr",
        "isQr",
        "menuQr"
      ];
      queryKeys.forEach((key) => {
        const value = readWindowRouteParam(key);
        if (value) {
          url.searchParams.set(key, value);
        }
      });
      const routePathname = String(win?.location?.pathname || "").trim();
      if (routePathname) {
        url.searchParams.set("pathname", routePathname);
      }
      const activeTabKey = String(state?.activeTab || "").trim().toLowerCase();
      const webDirectEntry = state?.__webDirectEntry && typeof state.__webDirectEntry === "object" && state.__webDirectEntry.active === true
        ? state.__webDirectEntry
        : null;
      const canUseProfileRouteFallback = activeTabKey === "profile" || !!webDirectEntry;
      const routeRestaurantId = String(
        webDirectEntry?.canonicalRestaurantId
        || webDirectEntry?.restaurantId
        || (canUseProfileRouteFallback ? state?.profileView?.profile?.canonicalRestaurantId : "")
        || (canUseProfileRouteFallback ? state?.profileView?.profile?.restaurantId : "")
        || ""
      ).trim();
      if (routeRestaurantId && !url.searchParams.get("r")) {
        url.searchParams.set("r", routeRestaurantId);
      }
      const routeTopTab = String(
        webDirectEntry?.topTab
        || (canUseProfileRouteFallback ? state?.profileTopTab : "")
        || ""
      ).trim().toLowerCase();
      if (routeTopTab && !url.searchParams.get("top")) {
        url.searchParams.set("top", routeTopTab);
      }
      const routeSource = String(
        (canUseProfileRouteFallback ? state?.profileView?.menuAccessSource : "")
        || webDirectEntry?.menuAccessSource
        || ""
      ).trim().toLowerCase();
      if (routeSource && !url.searchParams.get("src")) {
        url.searchParams.set("src", routeSource);
      }
      const tableNumber = Math.max(0, Number(
        canUseProfileRouteFallback ? state?.profileView?.tableNumber : 0
        || 0
      ) || 0);
      if (tableNumber > 0 && !url.searchParams.get("table")) {
        url.searchParams.set("table", String(tableNumber));
      }
      return url.toString();
    } catch {
      return baseEndpoint;
    }
  }

  function applyPublicBootstrapPayload(payload, { refreshUi = false } = {}) {
    if (!payload || typeof payload !== "object" || !state) return false;
    void mergeRestaurants;
    void rebuildBusinessLocations;
    const activeTabKey = String(state?.activeTab || "").trim().toLowerCase();
    const webDirectEntry = state?.__webDirectEntry && typeof state.__webDirectEntry === "object" && state.__webDirectEntry.active === true
      ? state.__webDirectEntry
      : null;
    const isWebDirectProfileVisiblePath = activeTabKey === "profile"
      && webDirectEntry?.active === true
      && webDirectEntry?.webPriority === true;
    const webDirectRouteRestaurantId = isWebDirectProfileVisiblePath
      ? String(webDirectEntry?.canonicalRestaurantId || webDirectEntry?.restaurantId || "").trim()
      : "";
    const incomingRoutePayload = resolveIncomingRouteBootstrapPayload(payload);
    const canAcceptRouteBootstrapPayload = activeTabKey === "profile"
      && (!!webDirectEntry || !!state?.profileView);
    if (incomingRoutePayload && canAcceptRouteBootstrapPayload) {
      state.__publicRouteBootstrap = incomingRoutePayload;
    } else if (incomingRoutePayload && !canAcceptRouteBootstrapPayload) {
      state.__publicRouteBootstrap = null;
    } else if (Object.prototype.hasOwnProperty.call(payload, "publicRoute")) {
      state.__publicRouteBootstrap = null;
    }
    const storedRoutePayload = state?.__publicRouteBootstrap && typeof state.__publicRouteBootstrap === "object"
      ? state.__publicRouteBootstrap
      : null;
    const resolvedWebRoutePayload = resolveWebRoutePayloadForRestaurant(
      incomingRoutePayload || storedRoutePayload,
      webDirectRouteRestaurantId
    );
    const incomingRestaurants = normalizePublicBootstrapRestaurants(payload.restaurants, {
      normalizeRestaurantType
    });
    const normalizedFeedPosts = normalizePublicBootstrapFeedPosts(payload.feedPosts || payload.feed || payload.posts, {
      toDateSafe,
      formatRelative
    });
    const incomingFeedPosts = isWebDirectProfileVisiblePath
      ? []
      : normalizedFeedPosts;
    const incomingStories = isWebDirectProfileVisiblePath
      ? []
      : normalizePublicBootstrapStories(payload.stories);
    let changed = false;
    let previewChanged = false;
    const deferFeedBootstrapPostProcessing = activeTabKey === "profile";
    const webDirectRouteSeedChanged = isWebDirectProfileVisiblePath
      && webDirectRouteRestaurantId
      ? applyWebDirectRouteSeedFromBootstrap({
        state,
        routeRestaurantId: webDirectRouteRestaurantId,
        incomingRestaurants,
        normalizedFeedPosts,
        routePayload: resolvedWebRoutePayload,
        maxPosts: fastLimits?.profilePosts || 8
      })
      : false;
    if (webDirectRouteSeedChanged) {
      changed = true;
    }

    if (incomingRestaurants.length) {
      const existingPreview = Array.isArray(state.bootstrapRestaurantPreview)
        ? state.bootstrapRestaurantPreview
        : [];
      const mergedPreview = mergeBootstrapRestaurantPreview(existingPreview, incomingRestaurants);
      const prevSignature = buildRestaurantBootstrapSignature(existingPreview);
      const nextSignature = buildRestaurantBootstrapSignature(mergedPreview);
      if (nextSignature !== prevSignature) {
        state.bootstrapRestaurantPreview = mergedPreview;
        if (cacheKeys?.restaurantsPreview) {
          writeCache(cacheKeys.restaurantsPreview, mergedPreview);
        }
        previewChanged = true;
      }
    }

    if (incomingFeedPosts.length) {
      const existingFeedPosts = Array.isArray(state.feedPosts) ? state.feedPosts : [];
      const mergedFeedPosts = projectPostCollectionThroughEntityMap(
        state,
        mergeBootstrapFeedPosts(existingFeedPosts, incomingFeedPosts)
      );
      const prevFeedSignature = buildFeedBootstrapSignature(existingFeedPosts);
      const nextFeedSignature = buildFeedBootstrapSignature(mergedFeedPosts);
      if (nextFeedSignature !== prevFeedSignature) {
        state.feedPosts = mergedFeedPosts;
        const existingFeedMeta = readCache(cacheKeys.feed)?.meta || {};
        saveFeedPosts(state.feedPosts, {
          lastDeltaCheck: Number(existingFeedMeta?.lastDeltaCheck || 0) || 0
        });
        changed = true;
      }
    }

    if (incomingStories.length) {
      const existingStories = Array.isArray(state.stories) ? state.stories : [];
      const normalizedIncomingStories = normalizeStoryItemsForDisplay(incomingStories);
      const mergedStories = normalizeStoryItemsForDisplay(
        mergeBootstrapStories(existingStories, normalizedIncomingStories)
      );
      const prevStorySignature = buildStoryBootstrapSignature(existingStories);
      const nextStorySignature = buildStoryBootstrapSignature(mergedStories);
      if (mergedStories.length && nextStorySignature !== prevStorySignature) {
        state.stories = mergedStories;
        setFeedStoriesSignature(buildStoriesSignature(mergedStories));
        writeCache(cacheKeys.stories, mergedStories);
        changed = true;
      }
    }

    if (deferFeedBootstrapPostProcessing) {
      scheduleNonCriticalTask(() => {
        try {
          syncFeedPostLogos();
          if (state.stories.length) {
            queueStoryIdentityHydration(state.stories, { max: fastLimits.storyIdentityHydration });
          }
        } catch {}
      }, 260);
    } else {
      if (syncFeedPostLogos()) {
        changed = true;
      }
      if (state.stories.length) {
        queueStoryIdentityHydration(state.stories, { max: fastLimits.storyIdentityHydration });
      }
    }

    if (changed) {
      const inMain = getLastRenderMode() === "main";
      const updatedFeed = state.activeTab === "feed" && inMain && updateFeedDom();
      const activeTab = String(state.activeTab || "").trim().toLowerCase();
      const shouldRefreshVisibleBootstrapSurface = activeTab === "feed"
        || activeTab === "restaurants"
        || activeTab === "travel"
        || activeTab === "shopping"
        || activeTab === "search"
        || activeTab === "map"
        || (activeTab === "profile" && webDirectRouteSeedChanged);
      if (!updatedFeed && shouldRefreshVisibleBootstrapSurface) {
        requestRender();
      }
    } else if (previewChanged && refreshUi) {
      requestRender();
    }
    return changed || previewChanged;
  }

  function getPublicBootstrapEndpoint() {
    if (win) {
      const fromWindow = String(win.__MENYRA_SOCIAL_BOOTSTRAP_ENDPOINT__ || "").trim();
      if (fromWindow) return fromWindow;
    }
    return defaultPublicBootstrapEndpoint;
  }

  function applyWindowBootstrapPayload() {
    const inlinePayload = win?.__MENYRA_SOCIAL_BOOTSTRAP_PAYLOAD__;
    if (!inlinePayload || typeof inlinePayload !== "object") return false;
    return applyPublicBootstrapPayload(inlinePayload, { refreshUi: state?.activeTab === "feed" });
  }

  async function awaitWindowBootstrapPayload() {
    const pending = win?.__MENYRA_SOCIAL_BOOTSTRAP_PROMISE__;
    if (!pending || typeof pending.then !== "function") return false;
    try {
      await pending;
    } catch {}
    return applyWindowBootstrapPayload();
  }

  function fetchPublicBootstrapPayload({ force = false, timeoutMs = null } = {}) {
    if (publicBootstrapFetchPromise && !force) return publicBootstrapFetchPromise;
    if (!force && applyWindowBootstrapPayload()) return Promise.resolve(true);
    if (!force && win?.__MENYRA_SOCIAL_BOOTSTRAP_PROMISE__) {
      return Promise.resolve(awaitWindowBootstrapPayload());
    }
    if (!fetchRequest) return Promise.resolve(false);
    const endpoint = getPublicBootstrapEndpoint();
    if (!endpoint) return Promise.resolve(false);
    const effectiveTimeoutMs = resolveBootstrapTimeoutMs(timeoutMs);
    const request = (async () => {
      const controller = AbortControllerCtor ? new AbortControllerCtor() : null;
      const timeoutId = win && typeof win.setTimeout === "function"
        ? win.setTimeout(() => controller?.abort(), effectiveTimeoutMs)
        : null;
      const requestUrl = buildBootstrapRequestUrl(endpoint) || endpoint;
      try {
        const response = await fetchRequest(requestUrl, {
          method: "GET",
          mode: "cors",
          credentials: "omit",
          cache: "no-store",
          signal: controller?.signal
        });
        if (!response.ok) return false;
        const json = await response.json().catch(() => null);
        const data = json && typeof json === "object" ? json.data : null;
        if (!data || typeof data !== "object") return false;
        if (win) {
          win.__MENYRA_SOCIAL_BOOTSTRAP_PAYLOAD__ = data;
        }
        return applyPublicBootstrapPayload(data, { refreshUi: state?.activeTab === "feed" });
      } catch (err) {
        reportCriticalRuntimeFailure("startup.publicBootstrapFetch", err, { suppressAbort: true });
        return false;
      } finally {
        if (timeoutId !== null && win && typeof win.clearTimeout === "function") {
          win.clearTimeout(timeoutId);
        }
      }
    })();
    const settledRequest = request.finally(() => {
      if (publicBootstrapFetchPromise === settledRequest) {
        publicBootstrapFetchPromise = null;
      }
    });
    publicBootstrapFetchPromise = settledRequest;
    return settledRequest;
  }

  function bindPublicBootstrapPayloadListener() {
    if (publicBootstrapListenerBound || !win || !publicBootstrapEvent) return;
    publicBootstrapListenerBound = true;
    win.addEventListener(publicBootstrapEvent, (event) => {
      const data = event?.detail;
      if (!data || typeof data !== "object") return;
      applyPublicBootstrapPayload(data, { refreshUi: state?.activeTab === "feed" });
    });
  }

  return {
    applyPublicBootstrapPayload,
    getPublicBootstrapEndpoint,
    fetchPublicBootstrapPayload,
    bindPublicBootstrapPayloadListener
  };
}
