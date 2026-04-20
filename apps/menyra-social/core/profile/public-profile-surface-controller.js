const SURFACE_STATUSES = new Set(["pending", "loading", "ready", "empty", "error"]);
const SETTLING_SURFACE_STATUSES = new Set(["pending", "loading"]);

function safeLower(value = "") {
  return String(value || "").trim().toLowerCase();
}

function normalizeTruthyCount(value) {
  if (value === null || value === undefined) return false;
  const numeric = Number(value);
  return Number.isFinite(numeric) && numeric >= 0;
}

function resolveProfileTruthState(value = "") {
  const truthState = safeLower(value);
  if (!truthState) return "";
  if (truthState === "route-pending-loading") return "loading";
  if (truthState.includes("pending")) return "pending";
  if (truthState.includes("loading")) return "loading";
  if (truthState === "stable" || truthState === "ready") return "ready";
  if (truthState === "empty") return "empty";
  if (truthState === "error") return "error";
  return "";
}

function resolveIdentityTruthState(value = "") {
  const identityState = safeLower(value);
  if (identityState === "pending") return "pending";
  if (identityState === "loading") return "loading";
  if (identityState === "ready") return "ready";
  if (identityState === "error") return "error";
  return "";
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

function normalizeProfileContentTab(value = "", fallback = "posts") {
  const contentTab = safeLower(value);
  if (contentTab === "posts") return "posts";
  if (contentTab === "media") return "media";
  if (contentTab === "menu") return "menu";
  if (contentTab === "checkins") return "checkins";
  return safeLower(fallback) || "posts";
}

function resolveActiveProfileContentTab({ topTab = "profile", contentTab = "posts" } = {}) {
  if (topTab === "menu") return "menu";
  if (topTab !== "profile" && topTab !== "landing") return "posts";
  return normalizeProfileContentTab(contentTab, "posts");
}

function hasHeaderSeed(profile = null) {
  if (!profile || typeof profile !== "object") return false;
  const avatar = !!String(profile.avatar || "").trim();
  const hasName = !!String(profile.name || "").trim();
  const hasHandle = !!String(profile.handle || "").trim();
  const hasFollowers = normalizeTruthyCount(profile.followers);
  const hasFollowing = normalizeTruthyCount(profile.following);
  return avatar || hasName || hasHandle || hasFollowers || hasFollowing;
}

function resolveHeaderStatus(profile = null) {
  if (!profile || typeof profile !== "object") return "loading";
  const identityState = resolveIdentityTruthState(profile.identityTruthState || "");
  const truthState = resolveProfileTruthState(profile.truthState || "");
  const seeded = hasHeaderSeed(profile);
  if (identityState === "error") return seeded ? "ready" : "error";
  if (identityState === "ready") return "ready";
  if (identityState === "pending" || identityState === "loading") {
    if (seeded) return "ready";
    return identityState;
  }
  if (truthState === "error") return seeded ? "ready" : "error";
  if (truthState === "pending" || truthState === "loading") {
    if (seeded) return "ready";
    return truthState;
  }
  if (seeded) return "ready";
  return "loading";
}

function resolvePostsStatus({
  profile = null,
  posts = [],
  contentTab = "posts"
} = {}) {
  const safeContentTab = normalizeProfileContentTab(contentTab, "posts");
  if (safeContentTab !== "posts" && safeContentTab !== "media") return "ready";
  const list = Array.isArray(posts) ? posts : [];
  if (list.length) return "ready";
  const truthState = resolveProfileTruthState(profile?.truthState || "");
  if (profile?.postsLoaded === true) {
    if (truthState === "error") return "error";
    return "empty";
  }
  if (truthState === "pending") return "pending";
  if (truthState === "loading") return "loading";
  if (truthState === "error") return "error";
  if (truthState === "empty") return "empty";
  return "loading";
}

function resolveMenuStatus(state = {}, { restaurantId = "" } = {}) {
  const safeRestaurantId = String(restaurantId || "").trim();
  if (!safeRestaurantId) return "ready";
  const menu = state?.menu || {};
  const menuRestaurantId = String(menu.restaurantId || "").trim();
  const sameRestaurant = menuRestaurantId && menuRestaurantId === safeRestaurantId;
  const menuSource = safeLower(menu.source || "");
  const hasPublicMenuTruth = !!sameRestaurant && menuSource === "public";
  const menuItems = hasPublicMenuTruth && Array.isArray(menu.items)
    ? menu.items
    : [];
  if (menuItems.length) return "ready";
  if (sameRestaurant && menu.loading) return "loading";
  if (hasPublicMenuTruth) {
    const error = String(menu.error || "").trim();
    if (error) return "error";
    return "empty";
  }
  return "loading";
}

function resolveFocusStatus(state = {}, { restaurantId = "" } = {}) {
  const safeRestaurantId = String(restaurantId || "").trim();
  if (!safeRestaurantId) return "ready";
  const focus = state?.focus || {};
  const focusRestaurantId = String(focus.restaurantId || "").trim();
  const sameRestaurant = focusRestaurantId && focusRestaurantId === safeRestaurantId;
  const focusItems = sameRestaurant && Array.isArray(focus.items) ? focus.items : [];
  if (focusItems.length && focus.enabled !== false) return "ready";
  if (sameRestaurant && focus.loading) return "loading";
  if (sameRestaurant) {
    const error = String(focus.error || "").trim();
    if (error) return "error";
    return "empty";
  }
  return "loading";
}

function resolveContractStatus({
  activeTab = "feed",
  activeTopTab = "profile",
  activeContentTab = "posts",
  profileStatus = "loading",
  menuStatus = "loading",
  focusStatus = "loading"
} = {}) {
  const tabKey = safeLower(activeTab) || "feed";
  if (tabKey !== "profile") return "ready";
  if (activeTopTab === "menu") return menuStatus;
  if (activeTopTab === "landing") return profileStatus;
  if (activeTopTab !== "profile") return "ready";
  if (activeContentTab === "menu") return menuStatus;
  if (activeContentTab === "checkins") return focusStatus;
  return profileStatus;
}

export function normalizeProfileSurfaceStatus(value = "", fallback = "loading") {
  const status = safeLower(value);
  if (SURFACE_STATUSES.has(status)) return status;
  const fallbackStatus = safeLower(fallback);
  if (SURFACE_STATUSES.has(fallbackStatus)) return fallbackStatus;
  return "loading";
}

export function isSettlingProfileSurfaceStatus(value = "") {
  return SETTLING_SURFACE_STATUSES.has(normalizeProfileSurfaceStatus(value, ""));
}

export function isProfileSettling(profile = null) {
  const truth = resolveProfileTruthState(profile?.truthState || "");
  const identity = resolveIdentityTruthState(profile?.identityTruthState || "");
  return isSettlingProfileSurfaceStatus(truth) || isSettlingProfileSurfaceStatus(identity);
}

export function resolveVisibleProfileSurface(state = {}, {
  profileView = null,
  profileTopTab = "",
  profileContentTab = ""
} = {}) {
  const activeTab = safeLower(state?.activeTab || "") || "feed";
  const view = profileView && typeof profileView === "object"
    ? profileView
    : (state?.profileView && typeof state.profileView === "object" ? state.profileView : null);
  const directEntry = view?.directEntry && typeof view.directEntry === "object"
    ? view.directEntry
    : null;
  const directEntryTopTabRaw = normalizeProfileTopTab(directEntry?.topTab || "", "");
  const directEntryTopTab = directEntryTopTabRaw === "landing" && directEntry?.explicitLanding !== true
    ? "profile"
    : directEntryTopTabRaw;
  const directEntryActive = activeTab === "profile"
    && !!directEntryTopTab
    && directEntry?.active !== false;
  const directEntryContentTab = normalizeProfileContentTab(
    directEntry?.contentTab || "",
    directEntryTopTab === "menu" ? "menu" : "posts"
  );
  const directEntryPhase = safeLower(directEntry?.phase || "");
  const directEntryOwner = safeLower(directEntry?.owner || "");
  const profile = view?.profile && typeof view.profile === "object"
    ? view.profile
    : null;
  const posts = Array.isArray(view?.posts)
    ? view.posts
    : (Array.isArray(profile?.posts) ? profile.posts : []);
  const targetRestaurantId = String(profile?.restaurantId || "").trim();
  const targetUid = String(profile?.uid || "").trim();
  const targetHandle = String(profile?.handle || profile?.name || "").trim().toLowerCase();
  const requestedTopTab = directEntryActive
    ? directEntryTopTab
    : (profileTopTab || state?.profileTopTab || "");
  const activeTopTab = normalizeProfileTopTab(
    requestedTopTab,
    profile?.restaurantId ? "profile" : "profile"
  );
  const requestedContentTab = directEntryActive
    ? directEntryContentTab
    : (profileContentTab || state?.profileContentTab || "");
  const activeContentTab = resolveActiveProfileContentTab({
    topTab: activeTopTab,
    contentTab: requestedContentTab
  });
  const headerStatus = normalizeProfileSurfaceStatus(resolveHeaderStatus(profile), "loading");
  const profileStatus = normalizeProfileSurfaceStatus(resolvePostsStatus({
    profile,
    posts,
    contentTab: "posts"
  }), "loading");
  const postsStatus = normalizeProfileSurfaceStatus(resolvePostsStatus({
    profile,
    posts,
    contentTab: activeContentTab
  }), "loading");
  const menuStatus = normalizeProfileSurfaceStatus(resolveMenuStatus(state, { restaurantId: targetRestaurantId }), "loading");
  const focusStatus = normalizeProfileSurfaceStatus(resolveFocusStatus(state, { restaurantId: targetRestaurantId }), "loading");
  let visibleStatus = normalizeProfileSurfaceStatus(resolveContractStatus({
    activeTab,
    activeTopTab,
    activeContentTab,
    profileStatus,
    menuStatus,
    focusStatus
  }), "loading");
  if (directEntryActive && directEntryPhase === "seeded" && visibleStatus === "pending") {
    visibleStatus = "loading";
  }
  const startupActiveSurface = activeTab !== "profile"
    ? (activeTab || "feed")
    : (activeTopTab === "menu" ? "menu" : "profile");
  const startupActiveStatus = normalizeProfileSurfaceStatus(
    activeTab !== "profile"
      ? "ready"
      : (startupActiveSurface === "menu" ? menuStatus : profileStatus),
    "loading"
  );

  return {
    target: {
      key: targetRestaurantId || targetUid || targetHandle || "",
      restaurantId: targetRestaurantId,
      uid: targetUid,
      handle: targetHandle
    },
    header: {
      status: headerStatus,
      truthState: resolveProfileTruthState(profile?.truthState || ""),
      identityTruthState: resolveIdentityTruthState(profile?.identityTruthState || "")
    },
    posts: {
      status: postsStatus,
      count: posts.length,
      loaded: profile?.postsLoaded === true
    },
    menu: {
      status: menuStatus,
      restaurantId: targetRestaurantId,
      source: safeLower(state?.menu?.source || ""),
      count: Array.isArray(state?.menu?.items) ? state.menu.items.length : 0
    },
    focus: {
      status: focusStatus,
      restaurantId: targetRestaurantId,
      count: Array.isArray(state?.focus?.items) ? state.focus.items.length : 0
    },
    activeTab,
    activeTopTab,
    activeContentTab,
    directEntry: {
      active: directEntryActive,
      phase: safeLower(directEntry?.phase || ""),
      owner: directEntryActive ? directEntryOwner : "",
      topTab: directEntryActive ? directEntryTopTab : "",
      contentTab: directEntryActive ? directEntryContentTab : ""
    },
    status: visibleStatus,
    startup: {
      profileStatus,
      menuStatus,
      activeStatus: startupActiveStatus,
      activeSurface: startupActiveSurface
    }
  };
}

export function isVisibleProfileSettledForShortCircuit(
  state = {},
  {
    currentProfile = null,
    nextProfile = null
  } = {}
) {
  const startupProfileStatus = normalizeProfileSurfaceStatus(state?.startupSurface?.profile || "", "loading");
  const startupActiveStatus = normalizeProfileSurfaceStatus(state?.startupSurface?.active || "", "loading");
  if (isSettlingProfileSurfaceStatus(startupProfileStatus) || isSettlingProfileSurfaceStatus(startupActiveStatus)) {
    return false;
  }
  if (isProfileSettling(currentProfile) || isProfileSettling(nextProfile)) {
    return false;
  }
  return true;
}
