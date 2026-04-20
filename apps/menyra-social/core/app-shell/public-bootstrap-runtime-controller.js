import { projectPostCollectionThroughEntityMap } from "../profile/post-entity-registry-utils.js";

function isGenericBusinessBootstrapLabel(value = "") {
  return String(value || "").trim().toLowerCase() === "business";
}

function buildRestaurantBootstrapSignature(restaurants = []) {
  return (Array.isArray(restaurants) ? restaurants : [])
    .map((rest) => {
      const id = String(rest?.id || "").trim();
      const name = String(rest?.name || rest?.restaurantName || "").trim();
      const logo = String(rest?.logoUrl || rest?.logo || "").trim();
      const city = String(rest?.city || rest?.address || "").trim();
      const type = String(rest?.type || rest?.customerType || rest?.restaurantType || "").trim();
      return `${id}|${name}|${logo}|${city}|${type}`;
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

function normalizeIncomingWebRoutePayload(payload = null) {
  if (!payload || typeof payload !== "object") return null;
  const restaurantId = String(payload?.restaurantId || payload?.targetRestaurantId || "").trim();
  if (!restaurantId) return null;
  const surface = String(payload?.surface || payload?.topTab || "").trim().toLowerCase() === "menu"
    ? "menu"
    : "profile";
  const topTab = String(payload?.topTab || surface).trim().toLowerCase() || surface;
  const contentTab = String(payload?.contentTab || (surface === "menu" ? "menu" : "posts")).trim().toLowerCase()
    || (surface === "menu" ? "menu" : "posts");
  const identity = payload?.identity && typeof payload.identity === "object"
    ? payload.identity
    : {};
  const postsItemsRaw = Array.isArray(payload?.posts?.items)
    ? payload.posts.items
    : (Array.isArray(payload?.postItems) ? payload.postItems : []);
  const postsItems = postsItemsRaw
    .map((row) => normalizeWebRouteSeedPost(row, restaurantId))
    .filter(Boolean);
  const menuItemsRaw = Array.isArray(payload?.menu?.items)
    ? payload.menu.items
    : (Array.isArray(payload?.menuItems) ? payload.menuItems : []);
  const menuItems = menuItemsRaw
    .map((row, index) => normalizeWebRouteMenuItem(row, restaurantId, index))
    .filter(Boolean)
    .sort((a, b) => normalizeBootstrapMenuOrderIndex(a?.orderIndex) - normalizeBootstrapMenuOrderIndex(b?.orderIndex));
  const requestedPostsCount = Number(payload?.posts?.count);
  const requestedMenuCount = Number(payload?.menu?.count);
  const postsCount = Number.isFinite(requestedPostsCount)
    ? Math.max(postsItems.length, Math.max(0, Math.round(requestedPostsCount)))
    : postsItems.length;
  const menuCount = Number.isFinite(requestedMenuCount)
    ? Math.max(menuItems.length, Math.max(0, Math.round(requestedMenuCount)))
    : menuItems.length;
  return {
    owner: "web-direct",
    routeFirst: true,
    restaurantId,
    surface,
    topTab,
    contentTab,
    phase: String(payload?.phase || "loading").trim().toLowerCase() || "loading",
    menuAccessSource: String(payload?.menuAccessSource || "").trim().toLowerCase(),
    tableNumber: Math.max(0, Number(payload?.tableNumber || 0) || 0),
    identity: {
      name: String(identity?.name || "").trim(),
      handle: String(identity?.handle || "").trim(),
      avatar: String(identity?.avatar || "").trim(),
      location: String(identity?.location || "").trim(),
      followers: normalizeCountOrNull(identity?.followers),
      following: normalizeCountOrNull(identity?.following),
      type: String(identity?.type || identity?.customerType || "").trim(),
      customerType: String(identity?.customerType || identity?.type || "").trim()
    },
    posts: {
      count: postsCount,
      seeded: postsItems.length > 0 || payload?.posts?.seeded === true,
      items: postsItems
    },
    menu: {
      count: menuCount,
      seeded: menuItems.length > 0 || payload?.menu?.seeded === true,
      items: menuItems,
      statusBadgeVisible: payload?.menu?.statusBadgeVisible !== false
    },
    layout: {
      menuCardColor: String(payload?.layout?.menuCardColor || "").trim().toLowerCase() || "white"
    },
    ts: Number(payload?.ts || 0) || Date.now()
  };
}

function resolveWebRoutePayloadForRestaurant(routePayload = null, restaurantId = "") {
  if (!routePayload || typeof routePayload !== "object") return null;
  const safeRestaurantId = String(restaurantId || "").trim();
  if (!safeRestaurantId) return null;
  return String(routePayload?.restaurantId || "").trim() === safeRestaurantId
    ? routePayload
    : null;
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
  const safeRestaurantId = String(routeRestaurantId || "").trim();
  if (!safeRestaurantId) return false;
  const view = state.profileView && typeof state.profileView === "object" ? state.profileView : null;
  const profile = view?.profile && typeof view.profile === "object" ? view.profile : null;
  if (!view || !profile) return false;
  const visibleRestaurantId = String(profile.restaurantId || "").trim();
  if (visibleRestaurantId && visibleRestaurantId !== safeRestaurantId) return false;
  const directEntry = view?.directEntry && typeof view.directEntry === "object" ? view.directEntry : null;
  const directOwner = String(directEntry?.owner || "").trim().toLowerCase();
  if (directOwner !== "web-direct") return false;
  const directTopTab = String(directEntry?.topTab || "").trim().toLowerCase();
  const directWebPriority = directEntry?.webPriority === true && directEntry?.routeFirst === true;
  const safeRoutePayload = resolveWebRoutePayloadForRestaurant(routePayload, safeRestaurantId);
  const routeIdentity = safeRoutePayload?.identity && typeof safeRoutePayload.identity === "object"
    ? safeRoutePayload.identity
    : null;
  const routePostsSeed = Array.isArray(safeRoutePayload?.posts?.items)
    ? safeRoutePayload.posts.items
    : [];
  const routeMenuSeed = Array.isArray(safeRoutePayload?.menu?.items)
    ? safeRoutePayload.menu.items
    : [];
  const routeLayoutColor = String(safeRoutePayload?.layout?.menuCardColor || "").trim().toLowerCase();
  const allowPostsSeedFromRoutePayload = directTopTab === "profile" && routePostsSeed.length > 0;
  const allowPostsSeedFromFeed = directTopTab === "profile" && !directWebPriority && !routePostsSeed.length;
  const allowPostsSeed = allowPostsSeedFromRoutePayload || allowPostsSeedFromFeed;
  let changed = false;
  const restaurantPreview = (Array.isArray(incomingRestaurants) ? incomingRestaurants : [])
    .find((row) => String(row?.id || "").trim() === safeRestaurantId) || null;
  const nextName = String(
    routeIdentity?.name
    || restaurantPreview?.name
    || restaurantPreview?.restaurantName
    || ""
  ).trim();
  const nextHandle = String(routeIdentity?.handle || "").trim();
  const nextAvatar = String(
    routeIdentity?.avatar
    || restaurantPreview?.logoUrl
    || ""
  ).trim();
  const nextLocation = String(
    routeIdentity?.location
    || restaurantPreview?.city
    || ""
  ).trim();
  const nextType = String(
    routeIdentity?.type
    || routeIdentity?.customerType
    || restaurantPreview?.type
    || restaurantPreview?.customerType
    || ""
  ).trim();
  const nextFollowers = normalizeCountOrNull(routeIdentity?.followers);
  const nextFollowing = normalizeCountOrNull(routeIdentity?.following);
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
  if (nextLocation && nextLocation !== String(profile.location || "").trim()) {
    profile.location = nextLocation;
    changed = true;
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
  if (profile.identityTruthState !== "ready" && (nextName || nextAvatar || nextLocation || nextHandle)) {
    profile.identityTruthState = "ready";
    changed = true;
  }
  if (
    directTopTab === "menu"
    && routeMenuSeed.length
    && (
      String(state?.menu?.restaurantId || "").trim() !== safeRestaurantId
      || !Array.isArray(state?.menu?.items)
      || state.menu.items.length === 0
    )
  ) {
    state.menu = {
      ...(state?.menu || {}),
      restaurantId: safeRestaurantId,
      items: routeMenuSeed,
      loading: false,
      error: "",
      source: "public",
      statusBadgeVisible: safeRoutePayload?.menu?.statusBadgeVisible !== false,
      routeSeed: true
    };
    changed = true;
  } else if (
    directTopTab === "menu"
    && safeRoutePayload
    && Number(safeRoutePayload?.menu?.count || 0) === 0
    && safeRoutePayload?.menu?.seeded !== true
    && String(state?.menu?.restaurantId || "").trim() === safeRestaurantId
    && state?.menu?.loading
  ) {
    state.menu = {
      ...(state?.menu || {}),
      restaurantId: safeRestaurantId,
      items: [],
      loading: false,
      error: "",
      source: "public",
      statusBadgeVisible: safeRoutePayload?.menu?.statusBadgeVisible !== false,
      routeSeed: false
    };
    changed = true;
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
  const safeMaxPosts = Math.max(1, Number(maxPosts) || 8);
  const feedRows = Array.isArray(normalizedFeedPosts) ? normalizedFeedPosts : [];
  const seededPosts = allowPostsSeedFromRoutePayload
    ? routePostsSeed.slice(0, safeMaxPosts)
    : (allowPostsSeedFromFeed
      ? feedRows
        .filter((row) => String(row?.restaurantId || "").trim() === safeRestaurantId)
        .map((row) => normalizeWebRouteSeedPost(row, safeRestaurantId))
        .filter(Boolean)
        .slice(0, safeMaxPosts)
      : []);
  const currentPosts = Array.isArray(view.posts) ? view.posts : [];
  const canOverrideVisiblePosts = allowPostsSeedFromRoutePayload
    || !currentPosts.length;
  if (allowPostsSeed && canOverrideVisiblePosts && seededPosts.length) {
    const projected = projectPostCollectionThroughEntityMap(state, seededPosts);
    if (projected.length) {
      view.posts = projected;
      profile.posts = projected;
      profile.postsLoaded = true;
      profile.truthState = "stable";
      changed = true;
    }
  } else if (
    directTopTab === "profile"
    && safeRoutePayload
    && Number(safeRoutePayload?.posts?.count || 0) === 0
    && safeRoutePayload?.posts?.seeded !== true
    && !currentPosts.length
  ) {
    if (profile.postsLoaded !== true || String(profile.truthState || "").trim().toLowerCase() !== "empty") {
      profile.postsLoaded = true;
      profile.truthState = "empty";
      changed = true;
    }
  }
  if (changed) {
    const routePayload = view.routePayload && typeof view.routePayload === "object"
      ? view.routePayload
      : null;
    const activePosts = Array.isArray(view.posts) ? view.posts : [];
    const menuCount = String(state?.menu?.restaurantId || "").trim() === safeRestaurantId && Array.isArray(state?.menu?.items)
      ? state.menu.items.length
      : Math.max(
        0,
        Number(safeRoutePayload?.menu?.count || routePayload?.menu?.count || 0) || 0
      );
    const activePostsCount = activePosts.length > 0
      ? activePosts.length
      : Math.max(0, Number(safeRoutePayload?.posts?.count || routePayload?.posts?.count || 0) || 0);
    const readyFromMenuSeed = directTopTab === "menu" && (
      menuCount > 0
      || safeRoutePayload?.menu?.seeded === true
      || (safeRoutePayload?.menu?.seeded === false && Number(safeRoutePayload?.menu?.count || 0) === 0)
    );
    const readyFromPostsSeed = directTopTab === "profile" && (
      activePostsCount > 0
      || safeRoutePayload?.posts?.seeded === true
      || (safeRoutePayload?.posts?.seeded === false && Number(safeRoutePayload?.posts?.count || 0) === 0)
    );
    view.routePayload = {
      ...(routePayload || {}),
      owner: "web-direct",
      routeFirst: true,
      restaurantId: safeRestaurantId,
      surface: String(view?.directEntry?.topTab || "").trim().toLowerCase() === "menu" ? "menu" : "profile",
      topTab: String(view?.directEntry?.topTab || "").trim().toLowerCase() || "profile",
      contentTab: String(view?.directEntry?.contentTab || "").trim().toLowerCase() || "posts",
      phase: readyFromMenuSeed || readyFromPostsSeed
        ? "ready"
        : (String(view?.directEntry?.phase || routePayload?.phase || "").trim().toLowerCase() || "loading"),
      menuAccessSource: String(safeRoutePayload?.menuAccessSource || routePayload?.menuAccessSource || "").trim().toLowerCase(),
      tableNumber: Math.max(0, Number(safeRoutePayload?.tableNumber || routePayload?.tableNumber || 0) || 0),
      identity: {
        name: String(profile.name || "").trim(),
        handle: String(profile.handle || "").trim(),
        avatar: String(profile.avatar || "").trim(),
        location: String(profile.location || "").trim(),
        followers: profile.followers ?? null,
        following: profile.following ?? null
      },
      posts: {
        count: activePostsCount,
        seeded: activePosts.length > 0 || safeRoutePayload?.posts?.seeded === true,
        items: Array.isArray(safeRoutePayload?.posts?.items) ? safeRoutePayload.posts.items : []
      },
      menu: {
        count: menuCount,
        seeded: menuCount > 0 || safeRoutePayload?.menu?.seeded === true,
        items: Array.isArray(safeRoutePayload?.menu?.items) ? safeRoutePayload.menu.items : [],
        statusBadgeVisible: safeRoutePayload?.menu?.statusBadgeVisible !== false
      },
      layout: {
        menuCardColor: String(
          state?.menuLayout?.cardColor
          || safeRoutePayload?.layout?.menuCardColor
          || routePayload?.layout?.menuCardColor
          || ""
        ).trim().toLowerCase() || "white"
      },
      ts: Date.now()
    };
    if (
      (readyFromPostsSeed || readyFromMenuSeed)
      && view?.directEntry
      && String(view.directEntry.owner || "").trim().toLowerCase() === "web-direct"
    ) {
      view.directEntry.phase = "ready";
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
      const webDirectEntry = state?.__webDirectEntry && typeof state.__webDirectEntry === "object"
        ? state.__webDirectEntry
        : null;
      const routeRestaurantId = String(
        webDirectEntry?.restaurantId
        || state?.profileView?.profile?.restaurantId
        || ""
      ).trim();
      if (routeRestaurantId && !url.searchParams.get("r")) {
        url.searchParams.set("r", routeRestaurantId);
      }
      const routeTopTab = String(
        webDirectEntry?.topTab
        || state?.profileTopTab
        || ""
      ).trim().toLowerCase();
      if (routeTopTab && !url.searchParams.get("top")) {
        url.searchParams.set("top", routeTopTab);
      }
      const routeSource = String(
        state?.profileView?.menuAccessSource
        || webDirectEntry?.menuAccessSource
        || ""
      ).trim().toLowerCase();
      if (routeSource && !url.searchParams.get("src")) {
        url.searchParams.set("src", routeSource);
      }
      const tableNumber = Math.max(0, Number(
        state?.profileView?.tableNumber
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
    const webDirectEntry = state?.__webDirectEntry && typeof state.__webDirectEntry === "object"
      ? state.__webDirectEntry
      : null;
    const isWebDirectProfileVisiblePath = activeTabKey === "profile"
      && webDirectEntry?.active === true
      && webDirectEntry?.webPriority === true;
    const webDirectRouteRestaurantId = isWebDirectProfileVisiblePath
      ? String(webDirectEntry?.restaurantId || "").trim()
      : "";
    const incomingRoutePayload = resolveIncomingRouteBootstrapPayload(payload);
    if (incomingRoutePayload) {
      state.__publicRouteBootstrap = incomingRoutePayload;
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
