import { projectPostCollectionThroughEntityMap } from "./post-entity-registry-utils.js";
import {
  isProfileSettling,
  isSettlingProfileSurfaceStatus,
  isVisibleProfileSettledForShortCircuit,
  resolveVisibleProfileSurface
} from "./public-profile-surface-controller.js";

export function createPublicProfileRuntimeController({
  state = null,
  db = null,
  docFn = null,
  collectionFn = null,
  queryFn = null,
  whereFn = null,
  orderByFn = null,
  limitFn = null,
  getDocFn = async () => null,
  getDocsFn = async () => null,
  onSnapshotFn = null,
  render = () => {},
  brandUi = null,
  fastLimits = {},
  resolvePreferredHandle = () => "",
  pickCountValue = () => 0,
  normalizeRestaurantType = (value) => value,
  normalizeHandle = (value = "") => String(value || "").trim().toLowerCase(),
  sanitizeDisplayName = (value = "", fallback = "") => String(value || fallback || ""),
  isPublicBusinessRecord = () => false
} = {}) {
  const renderApp = typeof render === "function" ? render : (() => {});
  const getDocSafe = typeof getDocFn === "function" ? getDocFn : (async () => null);
  const getDocsSafe = typeof getDocsFn === "function" ? getDocsFn : (async () => null);
  const onSnapshotSafe = typeof onSnapshotFn === "function" ? onSnapshotFn : null;
  const makeDocRef = typeof docFn === "function" ? docFn : null;
  const makeCollectionRef = typeof collectionFn === "function" ? collectionFn : null;
  const buildQuery = typeof queryFn === "function" ? queryFn : null;
  const buildWhere = typeof whereFn === "function" ? whereFn : null;
  const buildOrderBy = typeof orderByFn === "function" ? orderByFn : null;
  const buildLimit = typeof limitFn === "function" ? limitFn : null;
  const brandSocialName = String(brandUi?.social || "Menyra").trim() || "Menyra";
  const profilePostLimit = fastLimits?.profilePosts || fastLimits?.businessPosts || 12;
  let profileViewUnsub = null;
  const publicBusinessPostsCache = new Map();
  const publicBusinessPostsInFlight = new Map();

  function normalizeLandingSlugKey(value = "") {
    let key = String(value || "").trim().toLowerCase();
    if (!key) return "";
    try {
      if (typeof key.normalize === "function") {
        key = key.normalize("NFKD").replace(/[\u0300-\u036f]/g, "");
      }
    } catch {}
    return key
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .trim();
  }

  function humanizeBusinessLabel(value = "") {
    const raw = String(value || "").trim();
    if (!raw) return "";
    const slug = normalizeLandingSlugKey(raw);
    if (!slug) return raw;
    const parts = slug.split("-").filter(Boolean);
    if (!parts.length) return raw;
    return parts
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ");
  }

  function isLikelyOpaqueBusinessId(value = "") {
    const raw = String(value || "").trim();
    if (!raw) return false;
    if (/\s|\./.test(raw)) return false;
    const compact = raw.replace(/[-_]/g, "");
    if (!compact) return false;
    if (/^[a-f0-9]{16,}$/i.test(compact)) return true;
    if (/^[a-z0-9]{20,}$/i.test(compact)) return true;
    const digits = (compact.match(/\d/g) || []).length;
    return compact.length >= 16 && digits >= 4;
  }

  function resolveBusinessDisplayName(data = {}, rest = {}, fallbackName = "") {
    const directName = String(
      data?.displayName
      || data?.name
      || rest?.name
      || rest?.restaurantName
      || ""
    ).trim();
    if (directName) return directName;
    const fallbackCandidates = [
      fallbackName,
      data?.landingSlug,
      rest?.landingSlug,
      data?.handle,
      rest?.handle
    ];
    for (const candidateRaw of fallbackCandidates) {
      const candidate = String(candidateRaw || "").trim();
      if (!candidate) continue;
      if (isLikelyOpaqueBusinessId(candidate)) continue;
      return humanizeBusinessLabel(candidate) || candidate;
    }
    return "Lokal";
  }

  function getFirstSnapshotDoc(snap = null) {
    if (!snap) return null;
    if (Array.isArray(snap.docs) && snap.docs.length) return snap.docs[0] || null;
    let first = null;
    if (typeof snap.forEach === "function") {
      snap.forEach((docSnap) => {
        if (!first) first = docSnap;
      });
    }
    return first;
  }

  function findRestaurantInStateByRouteId(routeRestaurantId = "") {
    const routeId = String(routeRestaurantId || "").trim();
    if (!routeId) return null;
    const rows = Array.isArray(state?.restaurants) ? state.restaurants : [];
    const direct = rows.find((row) => String(row?.id || "").trim() === routeId) || null;
    if (direct?.id) return direct;
    const routeSlug = normalizeLandingSlugKey(routeId);
    if (!routeSlug) return null;
    return rows.find((row) => {
      const rowSlug = normalizeLandingSlugKey(
        row?.landingSlug || row?.handle || row?.name || row?.restaurantName || ""
      );
      return !!rowSlug && rowSlug === routeSlug;
    }) || null;
  }

  async function resolveRestaurantDocByRouteId(routeRestaurantId = "", restaurant = null) {
    const routeId = String(routeRestaurantId || restaurant?.id || "").trim();
    const cachedRestaurant = restaurant || findRestaurantInStateByRouteId(routeId) || null;
    const directRestaurantId = String(cachedRestaurant?.id || routeId || "").trim();

    if (directRestaurantId && makeDocRef && db) {
      try {
        const snap = await getDocSafe(makeDocRef(db, "restaurants", directRestaurantId));
        if (snap.exists()) {
          const data = snap.data() || {};
          if (!isPublicBusinessRecord({ id: snap.id, ...data })) return null;
          return { id: snap.id, data };
        }
      } catch {}
    }

    const routeSlug = normalizeLandingSlugKey(routeId || cachedRestaurant?.landingSlug || "");
    if (routeSlug && makeCollectionRef && buildQuery && buildWhere && db) {
      const queryRestaurantByField = async (fieldName = "", fieldValue = "") => {
        const safeFieldName = String(fieldName || "").trim();
        const safeFieldValue = String(fieldValue || "").trim();
        if (!safeFieldName || !safeFieldValue) return null;
        try {
          const ref = makeCollectionRef(db, "restaurants");
          const constraints = [buildWhere(safeFieldName, "==", safeFieldValue)];
          if (buildLimit) constraints.push(buildLimit(1));
          const snap = await getDocsSafe(buildQuery(ref, ...constraints));
          const firstDoc = getFirstSnapshotDoc(snap);
          if (!firstDoc?.id) return null;
          const data = firstDoc.data?.() || {};
          if (!isPublicBusinessRecord({ id: firstDoc.id, ...data })) return null;
          return { id: firstDoc.id, data };
        } catch {
          return null;
        }
      };
      try {
        const ref = makeCollectionRef(db, "restaurants");
        const constraints = [buildWhere("landingSlug", "==", routeSlug)];
        if (buildLimit) constraints.push(buildLimit(1));
        const snap = await getDocsSafe(buildQuery(ref, ...constraints));
        const firstDoc = getFirstSnapshotDoc(snap);
        if (firstDoc?.id) {
          const data = firstDoc.data?.() || {};
          if (!isPublicBusinessRecord({ id: firstDoc.id, ...data })) return null;
          return { id: firstDoc.id, data };
        }
      } catch {}
      const handleMatch = await queryRestaurantByField("handle", routeSlug);
      if (handleMatch) return handleMatch;
    }

    if (cachedRestaurant?.id) {
      if (!isPublicBusinessRecord(cachedRestaurant)) return null;
      return { id: String(cachedRestaurant.id || "").trim(), data: cachedRestaurant };
    }
    return null;
  }

  function getProfileViewUnsub() {
    return profileViewUnsub;
  }

  function setProfileViewUnsub(next) {
    profileViewUnsub = typeof next === "function" ? next : null;
  }

  function stopProfileViewListener() {
    if (typeof profileViewUnsub === "function") {
      try {
        profileViewUnsub();
      } catch {}
    }
    profileViewUnsub = null;
  }

  function normalizeDirectEntryPhase(value = "", fallback = "loading") {
    const phase = String(value || "").trim().toLowerCase();
    if (phase === "seeded") return "seeded";
    if (phase === "loading") return "loading";
    if (phase === "ready") return "ready";
    if (phase === "error") return "error";
    const fallbackPhase = String(fallback || "").trim().toLowerCase();
    if (fallbackPhase === "seeded" || fallbackPhase === "loading" || fallbackPhase === "ready" || fallbackPhase === "error") {
      return fallbackPhase;
    }
    return "loading";
  }

  function syncWebDirectEntryState({
    restaurantId = "",
    topTab = "",
    contentTab = "",
    directEntry = null
  } = {}) {
    if (!state || typeof state !== "object") return;
    const current = state.__webDirectEntry && typeof state.__webDirectEntry === "object"
      ? state.__webDirectEntry
      : null;
    const safeRestaurantId = String(restaurantId || "").trim();
    const entry = directEntry && typeof directEntry === "object" ? directEntry : null;
    const entryOwner = String(entry?.owner || "").trim().toLowerCase();
    const isDirectWebOwner = entryOwner === "web-direct";
    if (!safeRestaurantId || !entry || entry.active === false || !isDirectWebOwner) {
      if (current?.active === true && (!safeRestaurantId || String(current.restaurantId || "").trim() === safeRestaurantId)) {
        state.__webDirectEntry = {
          ...current,
          active: false,
          phase: "",
          ts: Date.now()
        };
      }
      return;
    }
    const safeTopTab = String(topTab || entry?.topTab || "").trim().toLowerCase();
    const safeContentTab = String(contentTab || entry?.contentTab || "").trim().toLowerCase();
    const surface = safeTopTab === "menu" ? "menu" : "profile";
    state.__webDirectEntry = {
      ...(current || {}),
      active: true,
      restaurantId: safeRestaurantId,
      surface,
      topTab: safeTopTab || surface,
      contentTab: safeContentTab || (surface === "menu" ? "menu" : "posts"),
      explicitLanding: entry?.explicitLanding === true,
      menuFirst: surface === "menu",
      postsFirst: surface === "profile",
      webPriority: surface === "menu" || surface === "profile",
      phase: normalizeDirectEntryPhase(entry?.phase || "", "loading"),
      ts: Date.now()
    };
  }

  function isSameVisibleProfile(currentProfile = null, nextProfile = null) {
    if (!currentProfile || !nextProfile) return false;
    const currentRestaurantId = String(currentProfile?.restaurantId || "").trim();
    const nextRestaurantId = String(nextProfile?.restaurantId || "").trim();
    if (currentRestaurantId && nextRestaurantId) {
      return currentRestaurantId === nextRestaurantId;
    }
    const currentUid = String(currentProfile?.uid || "").trim();
    const nextUid = String(nextProfile?.uid || "").trim();
    if (currentUid && nextUid) {
      return currentUid === nextUid;
    }
    const currentHandle = normalizeHandle(currentProfile?.handle || currentProfile?.name || "");
    const nextHandle = normalizeHandle(nextProfile?.handle || nextProfile?.name || "");
    return !!currentHandle && currentHandle === nextHandle;
  }

  function haveSamePostIdentity(currentPosts = [], nextPosts = []) {
    if (!Array.isArray(currentPosts) || !Array.isArray(nextPosts)) return false;
    if (currentPosts.length !== nextPosts.length) return false;
    for (let i = 0; i < currentPosts.length; i += 1) {
      const currentId = String(currentPosts[i]?.id || "").trim();
      const nextId = String(nextPosts[i]?.id || "").trim();
      if (currentId !== nextId) return false;
    }
    return true;
  }

  function buildProfileRenderSignature(profile = null) {
    if (!profile || typeof profile !== "object") return "";
    return [
      String(profile.uid || "").trim(),
      String(profile.restaurantId || "").trim(),
      String(profile.name || "").trim(),
      String(profile.handle || "").trim().toLowerCase(),
      String(profile.avatar || "").trim(),
      String(profile.location || "").trim(),
      String(profile.bio || "").trim(),
      String(profile.role || "").trim().toLowerCase(),
      String(profile.identityTruthState || "").trim().toLowerCase(),
      String(profile.truthState || "").trim().toLowerCase(),
      String(profile.postsLoaded === true ? "1" : "0"),
      String(Number(profile.followers) || 0),
      String(Number(profile.following) || 0),
      String(profile.pendingFollowRequest === true ? "1" : "0")
    ].join("::");
  }

  function buildWebDirectRoutePayload(basePayload = null, {
    profile = null,
    posts = [],
    topTab = "profile",
    contentTab = "posts",
    directEntry = null,
    menuAccessSource = "",
    tableNumber = 0
  } = {}) {
    const entry = directEntry && typeof directEntry === "object" ? directEntry : null;
    const entryOwner = String(entry?.owner || "").trim().toLowerCase();
    const isWebDirectRoute = entry?.active !== false
      && entryOwner === "web-direct"
      && entry?.routeFirst === true;
    const currentPayload = basePayload && typeof basePayload === "object" ? basePayload : null;
    if (!isWebDirectRoute && !currentPayload) return null;
    const safeProfile = profile && typeof profile === "object" ? profile : {};
    const safeIdentity = currentPayload?.identity && typeof currentPayload.identity === "object"
      ? currentPayload.identity
      : {};
    const safePosts = Array.isArray(posts) ? posts : [];
    const safeRestaurantId = String(
      safeProfile.restaurantId
      || currentPayload?.restaurantId
      || ""
    ).trim();
    const safeTopTab = String(topTab || "").trim().toLowerCase() || "profile";
    const safeContentTab = String(contentTab || "").trim().toLowerCase() || (safeTopTab === "menu" ? "menu" : "posts");
    const safeMenuAccessSource = String(menuAccessSource || "").trim().toLowerCase();
    const safeTableNumber = Math.max(0, Number(tableNumber || 0) || 0);
    const menu = state?.menu || {};
    const sameRestaurantMenu = String(menu.restaurantId || "").trim() === safeRestaurantId;
    const menuCountFromLive = sameRestaurantMenu && Array.isArray(menu.items)
      ? menu.items.length
      : 0;
    const menuCountFromPayload = Math.max(0, Number(currentPayload?.menu?.count || 0) || 0);
    const menuCount = Math.max(menuCountFromLive, menuCountFromPayload);
    const postsCountFromPayload = Math.max(0, Number(currentPayload?.posts?.count || 0) || 0);
    const postsCount = Math.max(safePosts.length, postsCountFromPayload);
    const postsSeeded = safePosts.length > 0 || currentPayload?.posts?.seeded === true;
    const menuSeeded = menuCount > 0 || currentPayload?.menu?.seeded === true;
    const followersValue = Number(safeProfile.followers);
    const followingValue = Number(safeProfile.following);
    return {
      ...(currentPayload || {}),
      owner: "web-direct",
      routeFirst: true,
      restaurantId: safeRestaurantId,
      surface: safeTopTab === "menu" ? "menu" : "profile",
      topTab: safeTopTab,
      contentTab: safeContentTab,
      phase: normalizeDirectEntryPhase(entry?.phase || currentPayload?.phase || "", "loading"),
      menuAccessSource: safeMenuAccessSource,
      tableNumber: safeTableNumber,
      identity: {
        name: String(safeProfile.name || safeIdentity?.name || "").trim(),
        handle: String(safeProfile.handle || safeIdentity?.handle || "").trim(),
        avatar: String(safeProfile.avatar || safeIdentity?.avatar || "").trim(),
        location: String(safeProfile.location || safeIdentity?.location || "").trim(),
        followers: Number.isFinite(followersValue)
          ? followersValue
          : (Number.isFinite(Number(safeIdentity?.followers)) ? Number(safeIdentity.followers) : null),
        following: Number.isFinite(followingValue)
          ? followingValue
          : (Number.isFinite(Number(safeIdentity?.following)) ? Number(safeIdentity.following) : null)
      },
      posts: {
        ...(currentPayload?.posts && typeof currentPayload.posts === "object" ? currentPayload.posts : {}),
        count: postsCount,
        seeded: postsSeeded
      },
      menu: {
        ...(currentPayload?.menu && typeof currentPayload.menu === "object" ? currentPayload.menu : {}),
        count: menuCount,
        seeded: menuSeeded
      },
      layout: {
        menuCardColor: String(
          state?.menuLayout?.cardColor
          || currentPayload?.layout?.menuCardColor
          || ""
        ).trim().toLowerCase() || "white"
      },
      ts: Date.now()
    };
  }

  function serializeRoutePayload(payload = null) {
    if (!payload || typeof payload !== "object") return "";
    return [
      String(payload?.restaurantId || "").trim(),
      String(payload?.surface || "").trim().toLowerCase(),
      String(payload?.topTab || "").trim().toLowerCase(),
      String(payload?.contentTab || "").trim().toLowerCase(),
      String(payload?.phase || "").trim().toLowerCase(),
      String(payload?.identity?.name || "").trim(),
      String(payload?.identity?.avatar || "").trim(),
      String(payload?.identity?.location || "").trim(),
      String(payload?.identity?.followers ?? ""),
      String(payload?.identity?.following ?? ""),
      String(payload?.posts?.count ?? ""),
      String(payload?.menu?.count ?? ""),
      String(payload?.layout?.menuCardColor || "").trim().toLowerCase(),
      String(payload?.menuAccessSource || "").trim().toLowerCase(),
      String(Math.max(0, Number(payload?.tableNumber || 0) || 0))
    ].join("::");
  }

  function attachProfileViewListener(profile) {
    stopProfileViewListener();
    if (!profile || !makeDocRef || !onSnapshotSafe || !db) return;
    const listenerPath = profile.restaurantId
      ? `restaurants/${profile.restaurantId}`
      : (profile.uid ? `users/${profile.uid}` : "");
    const ref = profile.restaurantId
      ? makeDocRef(db, "restaurants", profile.restaurantId)
      : (profile.uid ? makeDocRef(db, "users", profile.uid) : null);
    if (!ref) return;
    profileViewUnsub = onSnapshotSafe(ref, (snap) => {
      if (!snap.exists()) return;
      const data = snap.data() || {};
      const viewProfile = state?.profileView?.profile;
      if (!viewProfile) return;
      if (profile.restaurantId) {
        viewProfile.followers = data.followersCount ?? viewProfile.followers;
        viewProfile.following = data.followingCount ?? viewProfile.following;
        viewProfile.avatar = data.logoUrl || data.logo || viewProfile.avatar;
        viewProfile.name = data.name || data.restaurantName || viewProfile.name;
        viewProfile.location = data.city || viewProfile.location;
      } else {
        viewProfile.followers = data.followersCount ?? viewProfile.followers;
        viewProfile.following = data.followingCount ?? viewProfile.following;
        viewProfile.privateAccount = !!data.privateAccount;
        viewProfile.avatar = data.avatarUrl || data.avatar || viewProfile.avatar;
        viewProfile.name = data.displayName || viewProfile.name;
        viewProfile.location = data.city || viewProfile.location;
      }
      state.profileSurface = resolveVisibleProfileSurface(state, {
        profileView: state?.profileView || null,
        profileTopTab: state?.profileTopTab || "",
        profileContentTab: state?.profileContentTab || ""
      });
      renderApp();
    }, (err) => {
      console.error(`[mnyra][firestore.listen.publicProfile] ${listenerPath}`, err);
    });
  }

  function showPublicProfile(profile, posts, {
    showBack = true,
    backTab,
    topTab,
    contentTab = "",
    menuAccessSource = "",
    tableNumber = 0,
    directEntry = null,
    routePayload = null
  } = {}) {
    const safeMenuAccessSource = String(menuAccessSource || "").trim().toLowerCase();
    const safeTableNumber = Math.max(0, Number(tableNumber || 0) || 0);
    const normalizeTopTab = (value = "", fallback = "profile") => {
      const key = String(value || "").trim().toLowerCase();
      if (key === "profile") return "profile";
      if (key === "menu") return "menu";
      if (key === "landing") return "landing";
      if (key === "cart") return "cart";
      if (key === "favorites") return "favorites";
      return String(fallback || "profile").trim().toLowerCase() || "profile";
    };
    const normalizeContentTab = (value = "", fallback = "posts") => {
      const key = String(value || "").trim().toLowerCase();
      if (key === "posts") return "posts";
      if (key === "media") return "media";
      if (key === "menu") return "menu";
      if (key === "checkins") return "checkins";
      return String(fallback || "posts").trim().toLowerCase() || "posts";
    };
    const currentView = state?.profileView || null;
    const currentProfile = currentView?.profile || null;
    const currentPosts = Array.isArray(currentView?.posts) ? currentView.posts : [];
    const currentDirectEntry = currentView?.directEntry && typeof currentView.directEntry === "object"
      ? currentView.directEntry
      : null;
    const currentRoutePayload = currentView?.routePayload && typeof currentView.routePayload === "object"
      ? currentView.routePayload
      : null;
    const incomingDirectEntry = directEntry && typeof directEntry === "object"
      ? directEntry
      : null;
    const directEntryStalePolicy = incomingDirectEntry || currentDirectEntry || null;
    const blockStaleCarryForWebDirect = String(directEntryStalePolicy?.owner || "").trim().toLowerCase() === "web-direct"
      && directEntryStalePolicy?.routeFirst === true
      && directEntryStalePolicy?.webPriority === true
      && directEntryStalePolicy?.active !== false;
    const sameVisibleIncomingProfile = isSameVisibleProfile(currentProfile || null, profile || null);
    const incomingProjectedPosts = projectPostCollectionThroughEntityMap(state, posts || profile?.posts || []);
    const incomingProfileSettling = isProfileSettling(profile);
    const currentSurface = resolveVisibleProfileSurface(state, {
      profileView: currentView,
      profileTopTab: state?.profileTopTab || "",
      profileContentTab: state?.profileContentTab || ""
    });
    const currentRoutePayloadIsWebDirect = String(currentRoutePayload?.owner || "").trim().toLowerCase() === "web-direct"
      && currentRoutePayload?.routeFirst === true;
    const currentRoutePayloadHasPostsTruth = currentRoutePayloadIsWebDirect
      && (
        Number(currentRoutePayload?.posts?.count || 0) > 0
        || currentRoutePayload?.posts?.seeded === true
      );
    const currentRoutePayloadHasIdentityTruth = currentRoutePayloadIsWebDirect
      && !!(
        String(currentRoutePayload?.identity?.name || "").trim()
        || String(currentRoutePayload?.identity?.avatar || "").trim()
        || String(currentRoutePayload?.identity?.handle || "").trim()
      );
    const preserveWebDirectRouteTruth = sameVisibleIncomingProfile && currentRoutePayloadIsWebDirect;
    const shouldPreserveVisiblePosts = sameVisibleIncomingProfile
      && currentPosts.length > 0
      && incomingProjectedPosts.length === 0
      && incomingProfileSettling
      && currentSurface?.posts?.status === "ready"
      && profile?.postsLoaded !== true
      && (
        !blockStaleCarryForWebDirect
        || (preserveWebDirectRouteTruth && currentRoutePayloadHasPostsTruth)
      );
    const projectedPosts = shouldPreserveVisiblePosts
      ? currentPosts
      : incomingProjectedPosts;
    const shouldPreserveHeaderSeed = sameVisibleIncomingProfile
      && currentProfile
      && incomingProfileSettling
      && (
        !blockStaleCarryForWebDirect
        || (preserveWebDirectRouteTruth && currentRoutePayloadHasIdentityTruth)
      );
    const nextProfile = profile ? {
      ...profile,
      ...(shouldPreserveHeaderSeed ? {
        name: String(profile?.name || "").trim() ? profile.name : currentProfile?.name,
        handle: String(profile?.handle || "").trim() ? profile.handle : currentProfile?.handle,
        bio: String(profile?.bio || "").trim() ? profile.bio : currentProfile?.bio,
        avatar: String(profile?.avatar || "").trim() ? profile.avatar : currentProfile?.avatar,
        location: String(profile?.location || "").trim() ? profile.location : currentProfile?.location,
        followers: profile?.followers ?? currentProfile?.followers,
        following: profile?.following ?? currentProfile?.following,
        pendingFollowRequest: typeof profile?.pendingFollowRequest === "boolean"
          ? profile.pendingFollowRequest
          : currentProfile?.pendingFollowRequest
      } : {}),
      posts: projectedPosts
    } : profile;

    const sameVisibleProfile = isSameVisibleProfile(currentProfile || null, nextProfile);
    const previousTopTab = String(state?.profileTopTab || "").trim().toLowerCase();
    const explicitTopTab = String(topTab || "").trim();
    const preservedTopTab = sameVisibleProfile
      ? String(state?.profileTopTab || "").trim()
      : "";
    const resolvedTopTab = profile?.restaurantId
      ? normalizeTopTab(explicitTopTab || preservedTopTab || "profile", "profile")
      : "profile";
    const preserveLandingState = sameVisibleProfile
      && previousTopTab === "landing"
      && resolvedTopTab === "landing";
    const clampLandingStep = (value = 0) => {
      const parsed = Math.round(Number(value || 0));
      if (!Number.isFinite(parsed)) return 0;
      return Math.max(0, Math.min(3, parsed));
    };
    const normalizeLandingIndex = (value = 0) => {
      const parsed = Math.round(Number(value || 0));
      if (!Number.isFinite(parsed)) return 0;
      return Math.max(0, parsed);
    };
    const preservedLandingStep = preserveLandingState ? clampLandingStep(state?.profileLandingStep) : 0;
    const preservedLandingGreetingIndex = preserveLandingState ? normalizeLandingIndex(state?.profileLandingGreetingIndex) : 0;
    const preservedLandingTourIndex = preserveLandingState ? normalizeLandingIndex(state?.profileLandingTourIndex) : 0;
    const previousContentTab = String(state?.profileContentTab || "").trim().toLowerCase();
    const nextProfileBackTab = showBack
      ? (backTab || state.activeTab || "feed")
      : "";
    const normalizedMenuAccessSource = safeMenuAccessSource === "qr" ? "qr" : "";
    const explicitContentTab = String(contentTab || "").trim().toLowerCase();
    const nextContentTab = resolvedTopTab === "menu"
      ? "menu"
      : (preserveLandingState && previousContentTab
        ? previousContentTab
        : normalizeContentTab(explicitContentTab || "posts", "posts"));
    const explicitDirectEntry = incomingDirectEntry;
    const isWebEntryTopTab = resolvedTopTab === "profile" || resolvedTopTab === "menu" || resolvedTopTab === "landing";
    const baseDirectEntry = explicitDirectEntry
      || (sameVisibleProfile && currentDirectEntry?.active === true ? currentDirectEntry : null);
    const requestedDirectEntryPhase = normalizeDirectEntryPhase(
      baseDirectEntry?.phase || "",
      incomingProfileSettling ? "loading" : "ready"
    );
    const currentDirectEntryPhase = normalizeDirectEntryPhase(currentDirectEntry?.phase || "", requestedDirectEntryPhase);
    const stableDirectEntryPhase = currentDirectEntryPhase === "ready"
      && (requestedDirectEntryPhase === "seeded" || requestedDirectEntryPhase === "loading")
      ? "ready"
      : requestedDirectEntryPhase;
    const directEntryOwner = String(
      baseDirectEntry?.owner
      || (showBack === false && isWebEntryTopTab ? "web-direct" : "")
    ).trim().toLowerCase();
    const nextDirectEntry = explicitDirectEntry
      ? {
        ...explicitDirectEntry,
        active: explicitDirectEntry.active !== false,
        owner: directEntryOwner,
        routeFirst: explicitDirectEntry.routeFirst === true || (showBack === false && isWebEntryTopTab),
        webPriority: explicitDirectEntry.webPriority === true || (showBack === false && (resolvedTopTab === "menu" || resolvedTopTab === "profile")),
        menuFirst: explicitDirectEntry.menuFirst === true || resolvedTopTab === "menu",
        postsFirst: explicitDirectEntry.postsFirst === true || (resolvedTopTab === "profile" && nextContentTab !== "menu"),
        phase: stableDirectEntryPhase,
        topTab: resolvedTopTab,
        contentTab: nextContentTab,
        explicitLanding: resolvedTopTab === "landing"
      }
      : (showBack === false
        ? {
          active: true,
          source: "route",
          owner: directEntryOwner || (isWebEntryTopTab ? "web-direct" : "route"),
          routeFirst: showBack === false && isWebEntryTopTab,
          webPriority: isWebEntryTopTab && (resolvedTopTab === "menu" || resolvedTopTab === "profile"),
          menuFirst: resolvedTopTab === "menu",
          postsFirst: resolvedTopTab === "profile" && nextContentTab !== "menu",
          phase: stableDirectEntryPhase,
          topTab: resolvedTopTab,
          contentTab: nextContentTab,
          explicitLanding: resolvedTopTab === "landing"
        }
        : (sameVisibleProfile && currentDirectEntry?.active === true
          ? {
            ...currentDirectEntry,
            owner: directEntryOwner,
            routeFirst: currentDirectEntry?.routeFirst === true,
            webPriority: currentDirectEntry?.webPriority === true,
            menuFirst: currentDirectEntry?.menuFirst === true || resolvedTopTab === "menu",
            postsFirst: currentDirectEntry?.postsFirst === true || (resolvedTopTab === "profile" && nextContentTab !== "menu"),
            phase: stableDirectEntryPhase,
            topTab: resolvedTopTab,
            contentTab: nextContentTab,
            explicitLanding: resolvedTopTab === "landing"
          }
          : null));
    const explicitRoutePayload = routePayload && typeof routePayload === "object"
      ? routePayload
      : null;
    const baseRoutePayload = explicitRoutePayload
      || (sameVisibleProfile ? currentRoutePayload : null);
    const nextRoutePayload = buildWebDirectRoutePayload(baseRoutePayload, {
      profile: nextProfile,
      posts: projectedPosts,
      topTab: resolvedTopTab,
      contentTab: nextContentTab,
      directEntry: nextDirectEntry,
      menuAccessSource: normalizedMenuAccessSource,
      tableNumber: safeTableNumber
    });
    const nextView = {
      profile: nextProfile,
      posts: projectedPosts,
      menuAccessSource: normalizedMenuAccessSource,
      tableNumber: safeTableNumber,
      routePayload: nextRoutePayload,
      directEntry: nextDirectEntry
    };
    const currentSignature = buildProfileRenderSignature(currentProfile);
    const nextSignature = buildProfileRenderSignature(nextProfile);
    const currentTopTab = String(state?.profileTopTab || "").trim();
    const currentContentTab = String(state?.profileContentTab || "").trim().toLowerCase();
    const currentMenuAccessSource = String(currentView?.menuAccessSource || "").trim().toLowerCase();
    const currentTableNumber = Math.max(0, Number(currentView?.tableNumber || 0) || 0);
    const serializeDirectEntry = (entry = null) => {
      if (!entry || typeof entry !== "object") return "";
      return [
        entry.active === false ? "0" : "1",
        String(entry.source || "").trim().toLowerCase(),
        String(entry.phase || "").trim().toLowerCase(),
        String(entry.topTab || "").trim().toLowerCase(),
        String(entry.contentTab || "").trim().toLowerCase(),
        entry.explicitLanding === true ? "1" : "0"
      ].join("::");
    };
    const currentDirectEntrySignature = serializeDirectEntry(currentDirectEntry);
    const nextDirectEntrySignature = serializeDirectEntry(nextDirectEntry);
    const currentRoutePayloadSignature = serializeRoutePayload(currentRoutePayload);
    const nextRoutePayloadSignature = serializeRoutePayload(nextRoutePayload);
    const nextSurface = resolveVisibleProfileSurface(state, {
      profileView: nextView,
      profileTopTab: resolvedTopTab,
      profileContentTab: nextContentTab
    });
    const canShortCircuitSurface = isVisibleProfileSettledForShortCircuit(state, {
      currentProfile,
      nextProfile
    })
      && !isSettlingProfileSurfaceStatus(currentSurface?.status || "")
      && !isSettlingProfileSurfaceStatus(nextSurface?.status || "");
    if (
      canShortCircuitSurface
      && sameVisibleProfile
      && currentSignature
      && currentSignature === nextSignature
      && haveSamePostIdentity(currentPosts, projectedPosts)
      && currentTopTab === String(resolvedTopTab || "").trim()
      && currentContentTab === String(nextContentTab || "").trim().toLowerCase()
      && currentMenuAccessSource === normalizedMenuAccessSource
      && currentTableNumber === safeTableNumber
      && currentDirectEntrySignature === nextDirectEntrySignature
      && currentRoutePayloadSignature === nextRoutePayloadSignature
      && String(state?.profileBackTab || "") === String(nextProfileBackTab || "")
      && String(state?.activeTab || "").trim().toLowerCase() === "profile"
    ) {
      state.profileSurface = nextSurface;
      syncWebDirectEntryState({
        restaurantId: String(nextProfile?.restaurantId || "").trim(),
        topTab: resolvedTopTab,
        contentTab: nextContentTab,
        directEntry: nextDirectEntry
      });
      attachProfileViewListener(nextProfile);
      return;
    }
    state.profileView = nextView;
    state.profileModal = { open: false, profile: null };
    state.profileContentTab = nextContentTab;
    state.profileTopTab = resolvedTopTab;
    if (resolvedTopTab === "landing") {
      if (preserveLandingState) {
        state.profileLandingStep = preservedLandingStep;
        state.profileLandingGreetingIndex = preservedLandingGreetingIndex;
        state.profileLandingTourIndex = preservedLandingTourIndex;
      } else {
        state.profileLandingStep = 0;
        state.profileLandingGreetingIndex = 0;
        state.profileLandingTourIndex = 0;
      }
    } else {
      state.profileLandingStep = 0;
      state.profileLandingGreetingIndex = 0;
      state.profileLandingTourIndex = 0;
    }
    state.profileViewMode = "grid";
    state.profilePostMenuId = null;
    state.drawerOpen = false;
    state.profileBackTab = nextProfileBackTab;
    state.activeTab = "profile";
    state.profileSurface = resolveVisibleProfileSurface(state, {
      profileView: nextView,
      profileTopTab: resolvedTopTab,
      profileContentTab: nextContentTab
    });
    syncWebDirectEntryState({
      restaurantId: String(nextProfile?.restaurantId || "").trim(),
      topTab: resolvedTopTab,
      contentTab: nextContentTab,
      directEntry: nextDirectEntry
    });
    renderApp();
    attachProfileViewListener(nextProfile);
  }

  function normalizeExternalProfile({ profileDoc, restaurant, fallbackName, posts }) {
    const data = profileDoc?.data || profileDoc || {};
    const rest = restaurant || {};
    const displayName = resolveBusinessDisplayName(data, rest, fallbackName);
    const handle = resolvePreferredHandle({ handle: data?.handle || rest?.handle || "", name: displayName }, displayName);
    const followers = pickCountValue(
      data?.followersCount,
      data?.followers,
      data?.fansCount,
      data?.fans,
      rest?.followersCount,
      rest?.followers,
      rest?.fansCount,
      rest?.fans
    );
    const following = pickCountValue(data?.followingCount, data?.following, rest?.followingCount, rest?.following);
    const restaurantId = String(data?.restaurantId || data?.landingRestaurantId || profileDoc?.id || rest?.id || "").trim();
    const landingEnabled = data?.landingEnabled ?? rest?.landingEnabled ?? true;
    const landingTemplate = String(data?.landingTemplate || rest?.landingTemplate || "").trim();
    const landingSlug = String(data?.landingSlug || rest?.landingSlug || "").trim();
    const landingPageUrl = String(data?.landingPageUrl || rest?.landingPageUrl || "").trim();
    const landingScreenOne = data?.landingScreenOne || rest?.landingScreenOne || null;
    const type = normalizeRestaurantType(
      data?.type
      || data?.customerType
      || rest?.type
      || rest?.customerType
      || rest?.category
      || rest?.kind
      || rest?.restaurantType
      || ""
    );
    return {
      name: displayName,
      handle: handle || normalizeHandle(displayName),
      uid: data?.uid || rest?.ownerUid || profileDoc?.id || "",
      bio: data?.bio || data?.description || rest?.description || rest?.bio || rest?.about || `Offizieller Account auf ${brandSocialName}.`,
      avatar: data?.avatarUrl || data?.avatar || rest?.logoUrl || rest?.logo || "",
      location: data?.city || rest?.city || "Kosovo",
      followers,
      following,
      privateAccount: false,
      role: "business",
      restaurantId,
      landingEnabled: landingEnabled !== false,
      landingTemplate,
      landingSlug,
      landingPageUrl,
      ...(landingScreenOne && typeof landingScreenOne === "object" ? { landingScreenOne } : {}),
      ...(type ? { type, customerType: type } : {}),
      pendingFollowRequest: false,
      identityTruthState: "ready",
      posts: posts || []
    };
  }

  function normalizeExternalUserProfile({ userDoc, fallback, posts }) {
    const data = typeof userDoc?.data === "function" ? userDoc.data() : (userDoc?.data || userDoc || {});
    const fallbackName = fallback?.name || fallback?.handle || "User";
    const displayName = sanitizeDisplayName(data?.displayName || data?.name, fallbackName);
    const handle = data?.handle || normalizeHandle(displayName || fallbackName);
    return {
      name: displayName || fallbackName,
      handle: handle || "user",
      uid: userDoc?.id || data?.uid || fallback?.uid || "",
      bio: data?.bio || data?.description || fallback?.bio || "",
      avatar: data?.avatarUrl || data?.avatar || fallback?.avatar || "",
      location: data?.city || fallback?.location || "Prishtina",
      followers: pickCountValue(data?.followersCount, data?.followers, data?.fansCount, data?.fans, fallback?.followers),
      following: pickCountValue(data?.followingCount, data?.following, fallback?.following),
      privateAccount: !!data?.privateAccount,
      role: data?.role || fallback?.role || "user",
      pendingFollowRequest: false,
      identityTruthState: "ready",
      posts: posts || []
    };
  }

  async function fetchBusinessProfileDoc({ restaurantId, restaurant }) {
    return resolveRestaurantDocByRouteId(restaurantId, restaurant);
  }

  async function loadBusinessPostsForRestaurant(restaurantId, { skipProfileResolve = false } = {}) {
    const routeRestaurantId = String(restaurantId || "").trim();
    if (!routeRestaurantId || !makeCollectionRef || !db) return [];
    const directCached = publicBusinessPostsCache.get(routeRestaurantId);
    if (Array.isArray(directCached)) return directCached;
    const inFlight = publicBusinessPostsInFlight.get(routeRestaurantId);
    if (inFlight) {
      return inFlight;
    }
    const request = (async () => {
      let effectiveRestaurantId = routeRestaurantId;
      if (!skipProfileResolve) {
        const resolvedDoc = await fetchBusinessProfileDoc({ restaurantId: routeRestaurantId });
        effectiveRestaurantId = String(resolvedDoc?.id || routeRestaurantId || "").trim();
      }
      if (!effectiveRestaurantId) return [];
      const resolvedCached = publicBusinessPostsCache.get(effectiveRestaurantId);
      if (Array.isArray(resolvedCached)) {
        if (routeRestaurantId !== effectiveRestaurantId) {
          publicBusinessPostsCache.set(routeRestaurantId, resolvedCached);
        }
        return resolvedCached;
      }
      try {
        const ref = makeCollectionRef(db, "restaurants", effectiveRestaurantId, "socialPosts");
        let snap = null;
        try {
          if (buildQuery && buildOrderBy && buildLimit) {
            snap = await getDocsSafe(buildQuery(ref, buildOrderBy("createdAt", "desc"), buildLimit(profilePostLimit)));
          } else {
            snap = await getDocsSafe(ref);
          }
        } catch {
          snap = await getDocsSafe(ref);
        }
        const rows = [];
        snap.forEach((docSnap) => rows.push({ id: docSnap.id, ...docSnap.data() }));
        const normalizedPosts = projectPostCollectionThroughEntityMap(state, rows
          .filter((row) => (row.status || "active") === "active")
          .map((row) => ({
            id: row.id,
            url: row.media?.[0]?.url || row.mediaUrl || "",
            type: row.type || "square",
            title: "",
            caption: row.caption || "",
            createdAt: row.createdAt,
            likes: row.likesCount ?? row.likes ?? 0,
            comments: row.commentsCount ?? row.comments ?? 0,
            isVideo: row.media?.[0]?.type === "video",
            ownerType: "restaurant",
            ownerId: effectiveRestaurantId,
            restaurantId: effectiveRestaurantId
          }))
          .filter((row) => row.url));
        publicBusinessPostsCache.set(effectiveRestaurantId, normalizedPosts);
        if (routeRestaurantId !== effectiveRestaurantId) {
          publicBusinessPostsCache.set(routeRestaurantId, normalizedPosts);
        }
        return normalizedPosts;
      } catch (err) {
        console.error(err);
        const fallbackCached = publicBusinessPostsCache.get(effectiveRestaurantId) || publicBusinessPostsCache.get(routeRestaurantId);
        return Array.isArray(fallbackCached) ? fallbackCached : [];
      }
    })().finally(() => {
      publicBusinessPostsInFlight.delete(routeRestaurantId);
    });
    publicBusinessPostsInFlight.set(routeRestaurantId, request);
    return request;
  }

  return {
    getProfileViewUnsub,
    setProfileViewUnsub,
    stopProfileViewListener,
    attachProfileViewListener,
    showPublicProfile,
    normalizeExternalProfile,
    normalizeExternalUserProfile,
    fetchBusinessProfileDoc,
    loadBusinessPostsForRestaurant
  };
}
