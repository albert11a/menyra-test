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

function normalizeTruthState(value = "") {
  const truth = safeLower(value);
  if (truth === "route-pending-loading") return "loading";
  if (truth.includes("pending")) return "pending";
  if (truth.includes("loading")) return "loading";
  if (truth === "unknown") return "loading";
  if (truth === "seeded") return "ready";
  if (truth === "stable" || truth === "ready") return "ready";
  if (truth === "knownempty" || truth === "known-empty" || truth === "empty") return "empty";
  if (truth === "error") return "error";
  return "";
}

function normalizeSectionTruthState(value = "") {
  const truth = safeLower(value);
  if (truth === "knownempty" || truth === "known-empty") return "knownEmpty";
  if (truth === "unknown") return "unknown";
  if (truth === "seeded") return "seeded";
  if (truth === "error") return "error";
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

function resolveProfileCanonicalRestaurantId(profile = null, routePayload = null) {
  const safeProfile = profile && typeof profile === "object" ? profile : null;
  const safeRoutePayload = routePayload && typeof routePayload === "object" ? routePayload : null;
  const snapshot = safeRoutePayload?.businessSnapshot && typeof safeRoutePayload.businessSnapshot === "object"
    ? safeRoutePayload.businessSnapshot
    : null;
  return String(
    safeProfile?.canonicalRestaurantId
    || safeRoutePayload?.canonicalRestaurantId
    || snapshot?.restaurantId
    || safeProfile?.restaurantId
    || safeRoutePayload?.restaurantId
    || ""
  ).trim();
}

function hasHeaderSeed(profile = null) {
  if (!profile || typeof profile !== "object") return false;
  return !!(
    String(profile.avatar || "").trim()
    || String(profile.name || "").trim()
    || String(profile.handle || "").trim()
    || normalizeTruthyCount(profile.followers)
    || normalizeTruthyCount(profile.following)
  );
}

function resolveHeaderStatus(profile = null) {
  if (!profile || typeof profile !== "object") return "loading";
  const identityStatus = normalizeTruthState(profile.identityTruthState || "");
  const profileStatus = normalizeTruthState(profile.truthState || "");
  const seeded = hasHeaderSeed(profile);
  if (identityStatus === "error" || profileStatus === "error") return seeded ? "ready" : "error";
  if (identityStatus === "ready" || profileStatus === "ready" || seeded) return "ready";
  if (identityStatus === "pending" || profileStatus === "pending") return "pending";
  return "loading";
}

function resolvePostsStatus({ profile = null, posts = [], contentTab = "posts" } = {}) {
  const safeContentTab = normalizeProfileContentTab(contentTab, "posts");
  if (safeContentTab !== "posts" && safeContentTab !== "media") return "ready";
  const list = Array.isArray(posts) ? posts : [];
  if (list.length) return "ready";
  const truthState = normalizeTruthState(profile?.truthState || "");
  if (profile?.postsLoaded === true) return truthState === "error" ? "error" : "empty";
  if (truthState === "error") return "error";
  if (truthState === "empty") return "empty";
  if (truthState === "pending") return "pending";
  return "loading";
}

function routeSectionKnownEmpty(routePayload = null, section = "") {
  if (!routePayload || typeof routePayload !== "object") return false;
  const sectionKey = safeLower(section);
  if (!sectionKey) return false;
  const snapshot = routePayload?.businessSnapshot && typeof routePayload.businessSnapshot === "object"
    ? routePayload.businessSnapshot
    : null;
  const snapshotSection = snapshot?.[sectionKey] && typeof snapshot[sectionKey] === "object" ? snapshot[sectionKey] : null;
  const payloadSection = routePayload?.[sectionKey] && typeof routePayload[sectionKey] === "object" ? routePayload[sectionKey] : null;
  const state = normalizeSectionTruthState(
    snapshotSection?.state
    || payloadSection?.state
    || snapshot?.truth?.[sectionKey]
    || routePayload?.truth?.[sectionKey]
    || ""
  );
  return state === "knownEmpty" || payloadSection?.knownEmpty === true || snapshotSection?.knownEmpty === true;
}

function resolveMenuStatus(state = {}, { restaurantId = "", routePayload = null } = {}) {
  const safeRestaurantId = String(restaurantId || "").trim();
  if (!safeRestaurantId) return "ready";
  const menu = state?.menu || {};
  const menuRestaurantId = String(menu.restaurantId || "").trim();
  const sameRestaurant = !!menuRestaurantId && menuRestaurantId === safeRestaurantId;
  const items = sameRestaurant && Array.isArray(menu.items) ? menu.items : [];

  if (items.length) return "ready";
  if (sameRestaurant && menu.loading) return "loading";

  const truthState = sameRestaurant ? normalizeSectionTruthState(menu.truthState || "") : "";
  if (truthState === "knownEmpty") return "empty";
  if (truthState === "error") return "error";
  if (truthState === "unknown" || truthState === "seeded") return "loading";

  if (sameRestaurant && String(menu.error || "").trim()) return "error";
  if (routeSectionKnownEmpty(routePayload, "menu")) return "empty";

  return "loading";
}

function resolveFocusStatus(state = {}, { restaurantId = "", routePayload = null } = {}) {
  const safeRestaurantId = String(restaurantId || "").trim();
  if (!safeRestaurantId) return "ready";
  const focus = state?.focus || {};
  const focusRestaurantId = String(focus.restaurantId || "").trim();
  const sameRestaurant = !!focusRestaurantId && focusRestaurantId === safeRestaurantId;
  const items = sameRestaurant && Array.isArray(focus.items) ? focus.items : [];
  if (items.length && focus.enabled !== false) return "ready";
  if (sameRestaurant && focus.loading) return "loading";
  const truthState = normalizeSectionTruthState(focus.truthState || "");
  if (truthState === "knownEmpty") return "empty";
  if (truthState === "error") return "error";
  if (routeSectionKnownEmpty(routePayload, "focus")) return "empty";
  return sameRestaurant ? "empty" : "loading";
}

function resolveContractStatus({ activeTab = "feed", activeTopTab = "profile", activeContentTab = "posts", profileStatus = "loading", menuStatus = "loading", focusStatus = "loading" } = {}) {
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
  const truth = normalizeProfileSurfaceStatus(normalizeTruthState(profile?.truthState || ""), "");
  const identity = normalizeProfileSurfaceStatus(normalizeTruthState(profile?.identityTruthState || ""), "");
  return isSettlingProfileSurfaceStatus(truth) || isSettlingProfileSurfaceStatus(identity);
}

export function resolveVisibleProfileSurface(state = {}, { profileView = null, profileTopTab = "", profileContentTab = "" } = {}) {
  const activeTab = safeLower(state?.activeTab || "") || "feed";
  const view = profileView && typeof profileView === "object"
    ? profileView
    : (state?.profileView && typeof state.profileView === "object" ? state.profileView : null);
  const directEntry = view?.directEntry && typeof view.directEntry === "object" ? view.directEntry : null;
  const directEntryTopTabRaw = normalizeProfileTopTab(directEntry?.topTab || "", "");
  const directEntryTopTab = directEntryTopTabRaw === "landing" && directEntry?.explicitLanding !== true ? "profile" : directEntryTopTabRaw;
  const directEntryActive = activeTab === "profile" && !!directEntryTopTab && directEntry?.active !== false;
  const directEntryContentTab = normalizeProfileContentTab(
    directEntry?.contentTab || "",
    directEntryTopTab === "menu" ? "menu" : "posts"
  );
  const routePayload = view?.routePayload && typeof view.routePayload === "object" ? view.routePayload : null;
  const profile = view?.profile && typeof view.profile === "object" ? view.profile : null;
  const posts = Array.isArray(view?.posts) ? view.posts : (Array.isArray(profile?.posts) ? profile.posts : []);
  const targetRestaurantId = resolveProfileCanonicalRestaurantId(profile, routePayload);
  const targetUid = String(profile?.uid || "").trim();
  const targetHandle = String(profile?.handle || profile?.name || "").trim().toLowerCase();

  const requestedTopTab = String(profileTopTab || "").trim()
    || (directEntryActive ? directEntryTopTab : (state?.profileTopTab || ""));
  const activeTopTab = normalizeProfileTopTab(requestedTopTab, "profile");
  const requestedContentTab = String(profileContentTab || "").trim()
    || (directEntryActive ? directEntryContentTab : (state?.profileContentTab || ""));
  const activeContentTab = resolveActiveProfileContentTab({ topTab: activeTopTab, contentTab: requestedContentTab });

  const headerStatus = normalizeProfileSurfaceStatus(resolveHeaderStatus(profile), "loading");
  const profileStatus = normalizeProfileSurfaceStatus(resolvePostsStatus({ profile, posts, contentTab: "posts" }), "loading");
  const postsStatus = normalizeProfileSurfaceStatus(resolvePostsStatus({ profile, posts, contentTab: activeContentTab }), "loading");
  const menuStatus = normalizeProfileSurfaceStatus(resolveMenuStatus(state, { restaurantId: targetRestaurantId, routePayload }), "loading");
  const focusStatus = normalizeProfileSurfaceStatus(resolveFocusStatus(state, { restaurantId: targetRestaurantId, routePayload }), "loading");
  const visibleStatus = normalizeProfileSurfaceStatus(resolveContractStatus({
    activeTab,
    activeTopTab,
    activeContentTab,
    profileStatus,
    menuStatus,
    focusStatus
  }), "loading");
  const startupActiveSurface = activeTab !== "profile" ? (activeTab || "feed") : (activeTopTab === "menu" ? "menu" : "profile");
  const startupActiveStatus = normalizeProfileSurfaceStatus(
    activeTab !== "profile" ? "ready" : (startupActiveSurface === "menu" ? menuStatus : profileStatus),
    "loading"
  );

  return {
    target: {
      key: targetRestaurantId || targetUid || targetHandle || "",
      restaurantId: targetRestaurantId,
      canonicalRestaurantId: String(profile?.canonicalRestaurantId || routePayload?.canonicalRestaurantId || routePayload?.businessSnapshot?.restaurantId || "").trim(),
      uid: targetUid,
      handle: targetHandle
    },
    header: {
      status: headerStatus,
      truthState: normalizeTruthState(profile?.truthState || ""),
      identityTruthState: normalizeTruthState(profile?.identityTruthState || "")
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
      owner: directEntryActive ? safeLower(directEntry?.owner || "") : "",
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

export function isVisibleProfileSettledForShortCircuit(state = {}, { currentProfile = null, nextProfile = null } = {}) {
  const startupProfileStatus = normalizeProfileSurfaceStatus(state?.startupSurface?.profile || "", "loading");
  const startupActiveStatus = normalizeProfileSurfaceStatus(state?.startupSurface?.active || "", "loading");
  if (isSettlingProfileSurfaceStatus(startupProfileStatus) || isSettlingProfileSurfaceStatus(startupActiveStatus)) return false;
  if (isProfileSettling(currentProfile) || isProfileSettling(nextProfile)) return false;
  return true;
}
