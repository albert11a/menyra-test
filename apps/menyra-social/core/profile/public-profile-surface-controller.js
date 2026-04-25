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

function normalizeSectionTruthState(value = "") {
  const truth = safeLower(value);
  if (truth === "seeded") return "seeded";
  if (truth === "knownempty" || truth === "known-empty") return "knownEmpty";
  if (truth === "unknown") return "unknown";
  return "";
}

function resolveRoutePayloadSectionState(routePayload = null, section = "") {
  if (!routePayload || typeof routePayload !== "object") return "";
  const sectionKey = String(section || "").trim().toLowerCase();
  if (!sectionKey) return "";
  const snapshot = routePayload?.businessSnapshot && typeof routePayload.businessSnapshot === "object"
    ? routePayload.businessSnapshot
    : null;
  const snapshotSection = snapshot?.[sectionKey] && typeof snapshot[sectionKey] === "object"
    ? snapshot[sectionKey]
    : null;
  const payloadSection = routePayload?.[sectionKey] && typeof routePayload[sectionKey] === "object"
    ? routePayload[sectionKey]
    : null;
  const items = Array.isArray(snapshotSection?.items)
    ? snapshotSection.items
    : (Array.isArray(payloadSection?.items) ? payloadSection.items : []);
  const truthState = normalizeSectionTruthState(
    snapshotSection?.state
    || payloadSection?.state
    || snapshot?.truth?.[sectionKey]
    || routePayload?.truth?.[sectionKey]
    || ""
  );
  if (truthState === "seeded") return items.length > 0 ? "seeded" : "unknown";
  if (truthState === "knownEmpty") return "knownEmpty";
  if (truthState === "unknown") return "unknown";
  if (items.length > 0) return "seeded";
  if (payloadSection?.knownEmpty === true || snapshotSection?.knownEmpty === true) return "knownEmpty";
  if (payloadSection?.unknown === true || snapshotSection?.unknown === true) return "unknown";
  const count = Number(snapshotSection?.count ?? payloadSection?.count);
  if (Number.isFinite(count) && count === 0 && payloadSection?.seeded !== true && snapshotSection?.seeded !== true) {
    return "knownEmpty";
  }
  return "";
}

function resolveRoutePayloadIdentityState(routePayload = null) {
  if (!routePayload || typeof routePayload !== "object") return "";
  const snapshot = routePayload?.businessSnapshot && typeof routePayload.businessSnapshot === "object"
    ? routePayload.businessSnapshot
    : null;
  const truth = normalizeSectionTruthState(
    snapshot?.truth?.identity
    || routePayload?.truth?.identity
    || ""
  );
  if (truth) return truth;
  const identity = snapshot?.identity && typeof snapshot.identity === "object"
    ? snapshot.identity
    : (routePayload?.identity && typeof routePayload.identity === "object" ? routePayload.identity : {});
  const hasSeed = !!(
    String(identity?.name || "").trim()
    || String(identity?.handle || "").trim()
    || String(identity?.avatar || "").trim()
    || normalizeTruthyCount(identity?.followers)
    || normalizeTruthyCount(identity?.following)
  );
  return hasSeed ? "seeded" : "";
}

function resolveSectionSurfaceStatusFromTruthState(value = "", fallback = "loading") {
  const truthState = normalizeSectionTruthState(value);
  if (truthState === "seeded") return "ready";
  if (truthState === "knownEmpty") return "empty";
  if (truthState === "unknown") return "loading";
  return normalizeProfileSurfaceStatus(fallback, "loading");
}

function resolveProfileTruthState(value = "") {
  const truthState = safeLower(value);
  if (!truthState) return "";
  if (truthState === "route-pending-loading") return "loading";
  if (truthState.includes("pending")) return "pending";
  if (truthState.includes("loading")) return "loading";
  if (truthState === "unknown") return "loading";
  if (truthState === "seeded") return "ready";
  if (truthState === "knownempty" || truthState === "known-empty") return "empty";
  if (truthState === "stable" || truthState === "ready") return "ready";
  if (truthState === "empty") return "empty";
  if (truthState === "error") return "error";
  return "";
}

function resolveIdentityTruthState(value = "") {
  const identityState = safeLower(value);
  if (identityState === "seeded") return "ready";
  if (identityState === "unknown") return "loading";
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
  contentTab = "posts",
  routePayload = null
} = {}) {
  const safeContentTab = normalizeProfileContentTab(contentTab, "posts");
  if (safeContentTab !== "posts" && safeContentTab !== "media") return "ready";
  const list = Array.isArray(posts) ? posts : [];
  if (list.length) return "ready";
  const routePostsState = resolveRoutePayloadSectionState(routePayload, "posts");
  if (routePostsState === "seeded") return "ready";
  if (routePostsState === "knownEmpty") return "empty";
  if (routePostsState === "unknown" && profile?.postsLoaded !== true) return "loading";
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

function resolveProfileRestaurantIds(profile = null, routePayload = null) {
  const safeProfile = profile && typeof profile === "object" ? profile : null;
  const safeRoutePayload = routePayload && typeof routePayload === "object" ? routePayload : null;
  const snapshot = safeRoutePayload?.businessSnapshot && typeof safeRoutePayload.businessSnapshot === "object"
    ? safeRoutePayload.businessSnapshot
    : null;
  return Array.from(new Set([
    safeProfile?.canonicalRestaurantId,
    safeRoutePayload?.canonicalRestaurantId,
    snapshot?.restaurantId,
    safeProfile?.restaurantId,
    safeRoutePayload?.restaurantId
  ].map((value) => String(value || "").trim()).filter(Boolean)));
}

function resolveMenuStatus(state = {}, { restaurantId = "", restaurantIds = [], routePayload = null } = {}) {
  const restaurantIdSet = new Set([
    restaurantId,
    ...(Array.isArray(restaurantIds) ? restaurantIds : [])
  ].map((value) => String(value || "").trim()).filter(Boolean));
  if (!restaurantIdSet.size) return "ready";
  const menu = state?.menu || {};
  const menuRestaurantId = String(menu.restaurantId || "").trim();
  const sameRestaurant = menuRestaurantId && restaurantIdSet.has(menuRestaurantId);
  const menuItems = sameRestaurant && Array.isArray(menu.items) ? menu.items : [];
  if (menuItems.length) return "ready";
  if (sameRestaurant && menu.loading) return "loading";
  const menuTruthState = sameRestaurant ? normalizeSectionTruthState(menu.truthState || "") : "";
  if (menuTruthState === "knownEmpty") return "empty";
  if (menuTruthState === "unknown") return "loading";
  if (menuTruthState === "seeded") return "ready";
  const routeMenuState = resolveRoutePayloadSectionState(routePayload, "menu");
  if (routeMenuState === "knownEmpty") return "empty";
  if (routeMenuState === "unknown") return "loading";
  if (routeMenuState === "seeded") return "ready";
  if (sameRestaurant) {
    const error = String(menu.error || "").trim();
    if (error) return "error";
    return "empty";
  }
  return "loading";
}

function resolveFocusStatus(state = {}, { restaurantId = "", restaurantIds = [], routePayload = null } = {}) {
  const restaurantIdSet = new Set([
    restaurantId,
    ...(Array.isArray(restaurantIds) ? restaurantIds : [])
  ].map((value) => String(value || "").trim()).filter(Boolean));
  if (!restaurantIdSet.size) return "ready";
  const focus = state?.focus || {};
  const focusRestaurantId = String(focus.restaurantId || "").trim();
  const sameRestaurant = focusRestaurantId && restaurantIdSet.has(focusRestaurantId);
  const focusItems = sameRestaurant && Array.isArray(focus.items) ? focus.items : [];
  if (focusItems.length && focus.enabled !== false) return "ready";
  if (sameRestaurant && focus.loading) return "loading";
  const focusTruthState = sameRestaurant ? normalizeSectionTruthState(focus.truthState || "") : "";
  if (focusTruthState === "knownEmpty") return "empty";
  if (focusTruthState === "unknown") return "loading";
  if (focusTruthState === "seeded") return "ready";
  const routeFocusState = resolveRoutePayloadSectionState(routePayload, "focus");
  if (routeFocusState === "knownEmpty") return "empty";
  if (routeFocusState === "unknown") return "loading";
  if (routeFocusState === "seeded") return "ready";
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

function hasRoutePayloadIdentitySeed(routePayload = null) {
  if (!routePayload || typeof routePayload !== "object") return false;
  const routeIdentityState = resolveRoutePayloadIdentityState(routePayload);
  if (routeIdentityState === "seeded") return true;
  if (routeIdentityState === "unknown") return false;
  const identity = routePayload.identity && typeof routePayload.identity === "object"
    ? routePayload.identity
    : {};
  const hasName = !!String(identity.name || "").trim();
  const hasHandle = !!String(identity.handle || "").trim();
  const hasAvatar = !!String(identity.avatar || "").trim();
  const hasFollowers = normalizeTruthyCount(identity.followers);
  const hasFollowing = normalizeTruthyCount(identity.following);
  return hasName || hasHandle || hasAvatar || hasFollowers || hasFollowing;
}

function getRoutePayloadSectionItems(routePayload = null, section = "") {
  if (!routePayload || typeof routePayload !== "object") return [];
  const sectionKey = String(section || "").trim().toLowerCase();
  if (!sectionKey) return [];
  const snapshot = routePayload?.businessSnapshot && typeof routePayload.businessSnapshot === "object"
    ? routePayload.businessSnapshot
    : null;
  const snapshotSection = snapshot?.[sectionKey] && typeof snapshot[sectionKey] === "object"
    ? snapshot[sectionKey]
    : null;
  const payloadSection = routePayload?.[sectionKey] && typeof routePayload[sectionKey] === "object"
    ? routePayload[sectionKey]
    : null;
  if (Array.isArray(snapshotSection?.items)) return snapshotSection.items;
  if (Array.isArray(payloadSection?.items)) return payloadSection.items;
  return [];
}

function hasRoutePayloadPostsSeed(routePayload = null) {
  if (!routePayload || typeof routePayload !== "object") return false;
  const routePostsState = resolveRoutePayloadSectionState(routePayload, "posts");
  if (routePostsState === "knownEmpty") return true;
  if (routePostsState === "unknown") return false;
  const items = getRoutePayloadSectionItems(routePayload, "posts");
  return items.length > 0;
}

function hasRoutePayloadMenuSeed(routePayload = null) {
  if (!routePayload || typeof routePayload !== "object") return false;
  const routeMenuState = resolveRoutePayloadSectionState(routePayload, "menu");
  if (routeMenuState === "knownEmpty") return true;
  if (routeMenuState === "unknown") return false;
  const items = getRoutePayloadSectionItems(routePayload, "menu");
  return items.length > 0;
}

function resolveProfileCanonicalRestaurantId(profile = null, routePayload = null) {
  return resolveProfileRestaurantIds(profile, routePayload)[0] || "";
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
  const explicitTopTab = String(profileTopTab || "").trim();
  const explicitContentTab = String(profileContentTab || "").trim();
  const directEntryActive = activeTab === "profile"
    && !!directEntryTopTab
    && directEntry?.active !== false;
  const directEntryContentTab = normalizeProfileContentTab(
    directEntry?.contentTab || "",
    directEntryTopTab === "menu" ? "menu" : "posts"
  );
  const directEntryPhase = safeLower(directEntry?.phase || "");
  const directEntryOwner = safeLower(directEntry?.owner || "");
  const routePayload = view?.routePayload && typeof view.routePayload === "object"
    ? view.routePayload
    : null;
  const profile = view?.profile && typeof view.profile === "object"
    ? view.profile
    : null;
  const posts = Array.isArray(view?.posts)
    ? view.posts
    : (Array.isArray(profile?.posts) ? profile.posts : []);
  const targetRestaurantIds = resolveProfileRestaurantIds(profile, routePayload);
  const targetRestaurantId = targetRestaurantIds[0] || "";
  const targetUid = String(profile?.uid || "").trim();
  const targetHandle = String(profile?.handle || profile?.name || "").trim().toLowerCase();
  const requestedTopTab = explicitTopTab
    ? explicitTopTab
    : (directEntryActive ? directEntryTopTab : (state?.profileTopTab || ""));
  const activeTopTab = normalizeProfileTopTab(
    requestedTopTab,
    targetRestaurantId ? "profile" : "profile"
  );
  const requestedContentTab = explicitContentTab
    ? explicitContentTab
    : (directEntryActive ? directEntryContentTab : (state?.profileContentTab || ""));
  const activeContentTab = resolveActiveProfileContentTab({
    topTab: activeTopTab,
    contentTab: requestedContentTab
  });
  let headerStatus = normalizeProfileSurfaceStatus(resolveHeaderStatus(profile), "loading");
  let profileStatus = normalizeProfileSurfaceStatus(resolvePostsStatus({
    profile,
    posts,
    contentTab: "posts",
    routePayload
  }), "loading");
  let postsStatus = normalizeProfileSurfaceStatus(resolvePostsStatus({
    profile,
    posts,
    contentTab: activeContentTab,
    routePayload
  }), "loading");
  let menuStatus = normalizeProfileSurfaceStatus(resolveMenuStatus(state, {
    restaurantId: targetRestaurantId,
    restaurantIds: targetRestaurantIds,
    routePayload
  }), "loading");
  const focusStatus = normalizeProfileSurfaceStatus(resolveFocusStatus(state, {
    restaurantId: targetRestaurantId,
    restaurantIds: targetRestaurantIds,
    routePayload
  }), "loading");
  if (directEntryActive && directEntryOwner === "web-direct") {
    const routePayloadIdentityState = resolveRoutePayloadIdentityState(routePayload);
    const routePayloadIdentityStatus = resolveSectionSurfaceStatusFromTruthState(routePayloadIdentityState, "loading");
    if (routePayloadIdentityStatus === "ready" && isSettlingProfileSurfaceStatus(headerStatus)) {
      headerStatus = "ready";
    }
    const routePayloadPostsState = resolveRoutePayloadSectionState(routePayload, "posts");
    const routePayloadPostsStatus = resolveSectionSurfaceStatusFromTruthState(routePayloadPostsState, "loading");
    const routePayloadPostsReady = hasRoutePayloadPostsSeed(routePayload);
    if (routePayloadPostsReady && activeTopTab === "profile" && (activeContentTab === "posts" || activeContentTab === "media")) {
      if (isSettlingProfileSurfaceStatus(postsStatus)) postsStatus = routePayloadPostsStatus;
      if (isSettlingProfileSurfaceStatus(profileStatus)) profileStatus = routePayloadPostsStatus;
    }
    const routePayloadMenuState = resolveRoutePayloadSectionState(routePayload, "menu");
    const routePayloadMenuStatus = resolveSectionSurfaceStatusFromTruthState(routePayloadMenuState, "loading");
    const routePayloadMenuReady = hasRoutePayloadMenuSeed(routePayload);
    if (routePayloadMenuReady && activeTopTab === "menu" && isSettlingProfileSurfaceStatus(menuStatus)) {
      menuStatus = routePayloadMenuStatus;
    }
  }
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
      restaurantIds: targetRestaurantIds,
      canonicalRestaurantId: String(
        profile?.canonicalRestaurantId
        || routePayload?.canonicalRestaurantId
        || routePayload?.businessSnapshot?.restaurantId
        || ""
      ).trim(),
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
      restaurantIds: targetRestaurantIds,
      source: safeLower(state?.menu?.source || ""),
      count: Array.isArray(state?.menu?.items) ? state.menu.items.length : 0
    },
    focus: {
      status: focusStatus,
      restaurantId: targetRestaurantId,
      restaurantIds: targetRestaurantIds,
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
