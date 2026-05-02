import { projectPostCollectionThroughEntityMap } from "./post-entity-registry-utils.js";
import {
  isProfileSettling,
  isSettlingProfileSurfaceStatus,
  isVisibleProfileSettledForShortCircuit,
  resolveVisibleProfileSurface
} from "./public-profile-surface-controller.js";
import { resolveVisiblePublicMenuSurfaceState } from "./public-menu-surface-state-utils.js";

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
  let profileViewListenerKey = "";
  let profileViewReadOnceKey = "";
  const profileViewReadOnceCompletedKeys = new Set();
  const profileViewReadOnceInFlight = new Map();
  const publicBusinessPostsCache = new Map();
  const publicBusinessPostsEmptyUntilCache = new Map();
  const publicBusinessPostsInFlight = new Map();
  const restaurantDocRouteCache = new Map();
  const restaurantDocRouteInFlight = new Map();
  const canonicalRestaurantIdByRouteId = new Map();
  const PUBLIC_BUSINESS_EMPTY_POSTS_TTL_MS = 15_000;

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
      data?.publicSlug,
      rest?.publicSlug,
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

  function buildRestaurantRouteCacheKeys(routeRestaurantId = "", restaurant = null) {
    const keys = new Set();
    const addKey = (value = "") => {
      const raw = String(value || "").trim();
      if (!raw) return;
      keys.add(raw);
      const slugKey = normalizeLandingSlugKey(raw);
      if (slugKey) keys.add(slugKey);
    };
    addKey(routeRestaurantId);
    addKey(restaurant?.id);
    addKey(restaurant?.publicSlug);
    addKey(restaurant?.landingSlug);
    addKey(restaurant?.handle);
    return Array.from(keys.values());
  }

  function cacheResolvedRestaurantDoc(routeRestaurantId = "", restaurant = null, resolved = null) {
    const safeResolved = resolved && typeof resolved === "object" ? resolved : null;
    if (!safeResolved?.id) return;
    const cacheKeys = new Set(buildRestaurantRouteCacheKeys(routeRestaurantId, restaurant));
    const resolvedData = safeResolved?.data && typeof safeResolved.data === "object"
      ? safeResolved.data
      : {};
    [
      safeResolved.id,
      resolvedData.publicSlug,
      resolvedData.landingSlug,
      resolvedData.handle
    ].forEach((value) => {
      const raw = String(value || "").trim();
      if (!raw) return;
      cacheKeys.add(raw);
      const slugKey = normalizeLandingSlugKey(raw);
      if (slugKey) cacheKeys.add(slugKey);
    });
    cacheKeys.forEach((key) => {
      restaurantDocRouteCache.set(key, safeResolved);
      canonicalRestaurantIdByRouteId.set(key, String(safeResolved.id || "").trim());
    });
    canonicalRestaurantIdByRouteId.set(String(safeResolved.id || "").trim(), String(safeResolved.id || "").trim());
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
        row?.publicSlug || row?.landingSlug || row?.handle || row?.name || row?.restaurantName || ""
      );
      return !!rowSlug && rowSlug === routeSlug;
    }) || null;
  }

  async function resolveRestaurantDocByRouteId(routeRestaurantId = "", restaurant = null) {
    const routeId = String(routeRestaurantId || restaurant?.id || "").trim();
    const cacheKeys = buildRestaurantRouteCacheKeys(routeId, restaurant);
    for (const key of cacheKeys) {
      const cached = restaurantDocRouteCache.get(key);
      if (cached?.id) return cached;
    }
    const inFlightKey = cacheKeys[0] || routeId;
    const inFlightRequest = restaurantDocRouteInFlight.get(inFlightKey);
    if (inFlightRequest) {
      return inFlightRequest;
    }
    const request = (async () => {
      const cachedRestaurant = restaurant || findRestaurantInStateByRouteId(routeId) || null;
      const directRestaurantId = String(cachedRestaurant?.id || routeId || "").trim();

      if (directRestaurantId && makeDocRef && db) {
        try {
          const snap = await getDocSafe(makeDocRef(db, "restaurants", directRestaurantId));
          if (snap.exists()) {
            const data = snap.data() || {};
            if (!isPublicBusinessRecord({ id: snap.id, ...data })) return null;
            const resolved = { id: snap.id, data };
            cacheResolvedRestaurantDoc(routeId, cachedRestaurant, resolved);
            return resolved;
          }
        } catch {}
      }

      const routeSlug = normalizeLandingSlugKey(routeId || cachedRestaurant?.publicSlug || cachedRestaurant?.landingSlug || "");
      if (routeSlug && makeDocRef && db) {
        try {
          const routeSnap = await getDocSafe(makeDocRef(db, "publicRoutes", routeSlug));
          if (routeSnap?.exists?.()) {
            const routeData = routeSnap.data() || {};
            const routeStatus = String(routeData.status || routeData.publicRouteStatus || "active").trim().toLowerCase();
            if (["inactive", "disabled", "deleted", "blocked", "archived", "private", "not-found", "notfound"].includes(routeStatus)) {
              return null;
            }
            const routeRestaurantId = String(
              routeData.restaurantId
              || routeData.canonicalRestaurantId
              || ""
            ).trim();
            if (routeRestaurantId) {
              const restaurantSnap = await getDocSafe(makeDocRef(db, "restaurants", routeRestaurantId));
              if (restaurantSnap.exists()) {
                const data = restaurantSnap.data() || {};
                if (isPublicBusinessRecord({ id: restaurantSnap.id, ...data })) {
                  const resolved = { id: restaurantSnap.id, data };
                  cacheResolvedRestaurantDoc(routeSlug, cachedRestaurant, resolved);
                  cacheResolvedRestaurantDoc(routeId, cachedRestaurant, resolved);
                  return resolved;
                }
              }
            }
          }
        } catch {}
      }
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
        const [publicSlugMatch, landingSlugMatch, handleMatch] = await Promise.all([
          queryRestaurantByField("publicSlug", routeSlug),
          queryRestaurantByField("landingSlug", routeSlug),
          queryRestaurantByField("handle", routeSlug)
        ]);
        const routeFieldMatch = publicSlugMatch || landingSlugMatch || handleMatch;
        if (routeFieldMatch) {
          cacheResolvedRestaurantDoc(routeId, cachedRestaurant, routeFieldMatch);
          return routeFieldMatch;
        }
      }

      if (cachedRestaurant?.id) {
        if (!isPublicBusinessRecord(cachedRestaurant)) return null;
        const resolved = { id: String(cachedRestaurant.id || "").trim(), data: cachedRestaurant };
        cacheResolvedRestaurantDoc(routeId, cachedRestaurant, resolved);
        return resolved;
      }
      return null;
    })().finally(() => {
      restaurantDocRouteInFlight.delete(inFlightKey);
    });
    restaurantDocRouteInFlight.set(inFlightKey, request);
    return request;
  }

  function getProfileViewUnsub() {
    return profileViewUnsub;
  }

  function setProfileViewUnsub(next) {
    profileViewUnsub = typeof next === "function" ? next : null;
  }

  function clearProfileViewReadOnceState(...listenerKeys) {
    for (const listenerKeyRaw of listenerKeys) {
      const listenerKey = String(listenerKeyRaw || "").trim();
      if (!listenerKey) continue;
      profileViewReadOnceCompletedKeys.delete(listenerKey);
      profileViewReadOnceInFlight.delete(listenerKey);
    }
  }

  function stopProfileViewListener() {
    const previousListenerKey = String(profileViewListenerKey || "").trim();
    const previousReadOnceKey = String(profileViewReadOnceKey || "").trim();
    if (typeof profileViewUnsub === "function") {
      try {
        profileViewUnsub();
      } catch {}
    }
    profileViewUnsub = null;
    profileViewListenerKey = "";
    profileViewReadOnceKey = "";
    clearProfileViewReadOnceState(previousListenerKey, previousReadOnceKey);
  }

  function resolveProfileCanonicalRestaurantId(profile = null, routePayload = null) {
    const safeProfile = profile && typeof profile === "object" ? profile : null;
    const safeRoutePayload = routePayload && typeof routePayload === "object"
      ? routePayload
      : null;
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

  function resolveProfileViewListenerTarget(profile = null) {
    const safeProfile = profile && typeof profile === "object" ? profile : null;
    if (!safeProfile || !makeDocRef || !db) {
      return { ref: null, listenerPath: "", listenerKey: "" };
    }
    const routePayload = state?.profileView?.routePayload && typeof state.profileView.routePayload === "object"
      ? state.profileView.routePayload
      : null;
    const restaurantId = resolveProfileCanonicalRestaurantId(safeProfile, routePayload);
    if (restaurantId) {
      return {
        ref: makeDocRef(db, "restaurants", restaurantId),
        listenerPath: `restaurants/${restaurantId}`,
        listenerKey: `restaurant:${restaurantId}`
      };
    }
    const uid = String(safeProfile.uid || "").trim();
    if (uid) {
      return {
        ref: makeDocRef(db, "users", uid),
        listenerPath: `users/${uid}`,
        listenerKey: `user:${uid}`
      };
    }
    return { ref: null, listenerPath: "", listenerKey: "" };
  }

  function isGuestPublicBusinessRouteContext(profile = null) {
    const safeProfile = profile && typeof profile === "object" ? profile : null;
    if (!safeProfile) return false;
    const routePayload = state?.profileView?.routePayload && typeof state.profileView.routePayload === "object"
      ? state.profileView.routePayload
      : null;
    const restaurantId = resolveProfileCanonicalRestaurantId(safeProfile, routePayload);
    if (!restaurantId) return false;
    const hasAuthenticatedSession = !!String(state?.user?.uid || "").trim();
    if (hasAuthenticatedSession) return false;
    const directEntry = state?.profileView?.directEntry && typeof state.profileView.directEntry === "object"
      ? state.profileView.directEntry
      : (state?.__webDirectEntry && typeof state.__webDirectEntry === "object" ? state.__webDirectEntry : null);
    const directEntryOwner = String(directEntry?.owner || "").trim().toLowerCase();
    const isWebDirectRoute = directEntry?.active !== false
      && directEntryOwner === "web-direct"
      && directEntry?.routeFirst === true;
    if (isWebDirectRoute) return true;
    const activeTab = String(state?.activeTab || "").trim().toLowerCase();
    const topTab = String(state?.profileTopTab || "").trim().toLowerCase();
    const hasBackTab = !!String(state?.profileBackTab || "").trim();
    const isPublicTopTab = !topTab || topTab === "profile" || topTab === "menu" || topTab === "landing";
    return (activeTab === "profile" || !activeTab) && isPublicTopTab && !hasBackTab;
  }

  function applyProfileViewDocToVisibleState(profile = null, data = {}) {
    const viewProfile = state?.profileView?.profile;
    if (!viewProfile) return false;
    if (!isSameVisibleProfile(viewProfile, profile)) return false;
    let changed = false;
    const assignIfDefined = (key, value) => {
      if (value === undefined) return;
      if (viewProfile[key] === value) return;
      viewProfile[key] = value;
      changed = true;
    };
    if (profile?.restaurantId) {
      assignIfDefined("followers", data.followersCount ?? viewProfile.followers);
      assignIfDefined("following", data.followingCount ?? viewProfile.following);
      assignIfDefined("avatar", data.logoUrl || data.logo || viewProfile.avatar);
      assignIfDefined("name", data.name || data.restaurantName || viewProfile.name);
      assignIfDefined("location", data.city || viewProfile.location);
    } else {
      assignIfDefined("followers", data.followersCount ?? viewProfile.followers);
      assignIfDefined("following", data.followingCount ?? viewProfile.following);
      assignIfDefined("privateAccount", !!data.privateAccount);
      assignIfDefined("avatar", data.avatarUrl || data.avatar || viewProfile.avatar);
      assignIfDefined("name", data.displayName || viewProfile.name);
      assignIfDefined("location", data.city || viewProfile.location);
    }
    if (!changed) return false;
    state.profileSurface = resolveVisibleProfileSurface(state, {
      profileView: state?.profileView || null,
      profileTopTab: state?.profileTopTab || "",
      profileContentTab: state?.profileContentTab || ""
    });
    renderApp();
    return true;
  }

  function refreshProfileViewOnce(profile = null, {
    ref = null,
    listenerPath = "",
    listenerKey = ""
  } = {}) {
    const safeListenerKey = String(listenerKey || "").trim();
    if (!safeListenerKey || !ref) return null;
    if (profileViewReadOnceCompletedKeys.has(safeListenerKey)) {
      return null;
    }
    const inFlight = profileViewReadOnceInFlight.get(safeListenerKey);
    if (inFlight) {
      return inFlight;
    }
    profileViewReadOnceKey = safeListenerKey;
    const request = Promise.resolve(getDocSafe(ref))
      .then((snap) => {
        if (!snap?.exists?.()) {
          profileViewReadOnceCompletedKeys.add(safeListenerKey);
          return;
        }
        const data = snap.data() || {};
        applyProfileViewDocToVisibleState(profile, data);
        profileViewReadOnceCompletedKeys.add(safeListenerKey);
      })
      .catch((err) => {
        console.error(`[mnyra][firestore.read.publicProfileOnce] ${listenerPath}`, err);
      })
      .finally(() => {
        if (profileViewReadOnceInFlight.get(safeListenerKey) === request) {
          profileViewReadOnceInFlight.delete(safeListenerKey);
        }
        if (profileViewReadOnceKey === safeListenerKey) {
          profileViewReadOnceKey = "";
        }
      });
    profileViewReadOnceInFlight.set(safeListenerKey, request);
    return request;
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

  function normalizeCountOrNull(value) {
    if (value === null || value === undefined) return null;
    const numeric = Number(value);
    if (!Number.isFinite(numeric) || numeric < 0) return null;
    return Math.max(0, Math.round(numeric));
  }

  function addPublicSurfaceTargetId(targetSet, value = "") {
    const safeValue = String(value || "").trim();
    if (safeValue) targetSet.add(safeValue);
  }

  function collectProfilePublicSurfaceTargetIds({
    profile = null,
    routePayload = null,
    directEntry = null,
    restaurantId = ""
  } = {}) {
    const ids = new Set();
    const safeProfile = profile && typeof profile === "object" ? profile : {};
    const safeRoutePayload = routePayload && typeof routePayload === "object" ? routePayload : {};
    const routeSnapshot = safeRoutePayload?.businessSnapshot && typeof safeRoutePayload.businessSnapshot === "object"
      ? safeRoutePayload.businessSnapshot
      : {};
    const routeIdentity = safeRoutePayload?.identity && typeof safeRoutePayload.identity === "object"
      ? safeRoutePayload.identity
      : {};
    const snapshotIdentity = routeSnapshot?.identity && typeof routeSnapshot.identity === "object"
      ? routeSnapshot.identity
      : {};
    const safeDirectEntry = directEntry && typeof directEntry === "object" && directEntry.active !== false
      ? directEntry
      : {};
    [
      restaurantId,
      safeProfile.canonicalRestaurantId,
      safeProfile.restaurantId,
      safeProfile.publicSlug,
      safeProfile.landingSlug,
      safeProfile.handle,
      safeRoutePayload.canonicalRestaurantId,
      safeRoutePayload.restaurantId,
      safeRoutePayload.publicSlug,
      safeRoutePayload.landingSlug,
      routeIdentity.publicSlug,
      routeIdentity.landingSlug,
      routeIdentity.handle,
      routeSnapshot.restaurantId,
      snapshotIdentity.publicSlug,
      snapshotIdentity.landingSlug,
      snapshotIdentity.handle,
      safeDirectEntry.canonicalRestaurantId,
      safeDirectEntry.restaurantId
    ].forEach((value) => addPublicSurfaceTargetId(ids, value));
    return ids;
  }

  function resolvePrimaryPublicSurfaceTargetId({
    profile = null,
    routePayload = null,
    directEntry = null,
    restaurantId = ""
  } = {}) {
    const safeProfile = profile && typeof profile === "object" ? profile : {};
    const safeRoutePayload = routePayload && typeof routePayload === "object" ? routePayload : {};
    const routeSnapshot = safeRoutePayload?.businessSnapshot && typeof safeRoutePayload.businessSnapshot === "object"
      ? safeRoutePayload.businessSnapshot
      : {};
    const safeDirectEntry = directEntry && typeof directEntry === "object" && directEntry.active !== false
      ? directEntry
      : {};
    return String(
      restaurantId
      || safeProfile.canonicalRestaurantId
      || safeRoutePayload.canonicalRestaurantId
      || routeSnapshot.restaurantId
      || safeDirectEntry.canonicalRestaurantId
      || safeProfile.restaurantId
      || safeRoutePayload.restaurantId
      || safeDirectEntry.restaurantId
      || ""
    ).trim();
  }

  function resetStalePublicMenuStateForProfileSwitch({
    sameVisibleProfile = false,
    profile = null,
    routePayload = null,
    directEntry = null,
    restaurantId = "",
    topTab = "",
    contentTab = ""
  } = {}) {
    if (sameVisibleProfile || !state || typeof state !== "object") return false;
    const targetIds = collectProfilePublicSurfaceTargetIds({
      profile,
      routePayload,
      directEntry,
      restaurantId
    });
    if (!targetIds.size) return false;
    const nextRestaurantId = resolvePrimaryPublicSurfaceTargetId({
      profile,
      routePayload,
      directEntry,
      restaurantId
    });
    const shouldLoadMenuSurface = String(topTab || "").trim().toLowerCase() === "menu"
      || String(contentTab || "").trim().toLowerCase() === "menu";
    let changed = false;
    const currentMenu = state.menu && typeof state.menu === "object" ? state.menu : null;
    const currentMenuRestaurantId = String(currentMenu?.restaurantId || "").trim();
    const currentMenuSource = String(currentMenu?.source || "").trim().toLowerCase() || "public";
    if (currentMenu && currentMenuSource === "public") {
      const currentMenuTruth = String(currentMenu.truthState || "").trim().toLowerCase();
      const currentMenuHasPayload = !!currentMenuRestaurantId
        || (Array.isArray(currentMenu.items) && currentMenu.items.length > 0)
        || currentMenu.loading === true
        || (!!currentMenuTruth && currentMenuTruth !== "unknown");
      const currentMenuMatchesTarget = !!currentMenuRestaurantId && targetIds.has(currentMenuRestaurantId);
      if (currentMenuHasPayload && !currentMenuMatchesTarget) {
        state.menu = {
          ...currentMenu,
          restaurantId: nextRestaurantId,
          items: [],
          loading: shouldLoadMenuSurface,
          error: "",
          source: "public",
          statusBadgeVisible: currentMenu.statusBadgeVisible !== false,
          routeSeed: false,
          truthState: "unknown"
        };
        changed = true;
      }
    }
    const currentFocus = state.focus && typeof state.focus === "object" ? state.focus : null;
    const currentFocusRestaurantId = String(currentFocus?.restaurantId || "").trim();
    const currentFocusTruthSource = String(currentFocus?.truthSource || "").trim().toLowerCase();
    const currentFocusTruth = String(currentFocus?.truthState || "").trim().toLowerCase();
    const currentFocusLooksPublic = currentFocusTruthSource === "public-menu"
      || (
        currentMenuSource === "public"
        && !!currentFocusRestaurantId
        && currentFocusRestaurantId === currentMenuRestaurantId
      );
    if (currentFocus && currentFocusLooksPublic) {
      const currentFocusHasPayload = !!currentFocusRestaurantId
        || (Array.isArray(currentFocus.items) && currentFocus.items.length > 0)
        || currentFocus.loading === true
        || (!!currentFocusTruth && currentFocusTruth !== "unknown");
      const currentFocusMatchesTarget = !!currentFocusRestaurantId && targetIds.has(currentFocusRestaurantId);
      if (currentFocusHasPayload && !currentFocusMatchesTarget) {
        state.focus = {
          ...currentFocus,
          restaurantId: nextRestaurantId,
          items: [],
          loading: shouldLoadMenuSurface,
          enabled: currentFocus.enabled !== false,
          error: "",
          index: 0,
          truthSource: "public-menu",
          truthState: "unknown"
        };
        changed = true;
      }
    }
    return changed;
  }

  function syncWebDirectEntryState({
    restaurantId = "",
    canonicalRestaurantId = "",
    topTab = "",
    contentTab = "",
    menuAccessSource = "",
    tableNumber = 0,
    directEntry = null
  } = {}) {
    if (!state || typeof state !== "object") return;
    const current = state.__webDirectEntry && typeof state.__webDirectEntry === "object"
      ? state.__webDirectEntry
      : null;
    const safeRestaurantId = String(restaurantId || "").trim();
    const safeCanonicalRestaurantId = String(canonicalRestaurantId || "").trim();
    const entry = directEntry && typeof directEntry === "object" ? directEntry : null;
    const entryOwner = String(entry?.owner || "").trim().toLowerCase();
    const isDirectWebOwner = entryOwner === "web-direct";
    if (!safeRestaurantId || !entry || entry.active === false || !isDirectWebOwner) {
      if (current?.active === true) {
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
    const safeMenuAccessSource = String(menuAccessSource || entry?.menuAccessSource || "").trim().toLowerCase() === "qr"
      ? "qr"
      : "";
    const safeTableNumber = safeMenuAccessSource === "qr"
      ? Math.max(0, Number(tableNumber || entry?.tableNumber || 0) || 0)
      : 0;
    const surface = safeTopTab === "menu" ? "menu" : "profile";
    state.__webDirectEntry = {
      ...(current || {}),
      active: true,
      restaurantId: safeRestaurantId,
      canonicalRestaurantId: safeCanonicalRestaurantId,
      surface,
      topTab: safeTopTab || surface,
      contentTab: safeContentTab || (surface === "menu" ? "menu" : "posts"),
      menuAccessSource: safeMenuAccessSource,
      tableNumber: safeTableNumber,
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
    const currentCanonicalRestaurantId = resolveProfileCanonicalRestaurantId(currentProfile);
    const nextCanonicalRestaurantId = resolveProfileCanonicalRestaurantId(nextProfile);
    if (currentCanonicalRestaurantId && nextCanonicalRestaurantId) {
      return currentCanonicalRestaurantId === nextCanonicalRestaurantId;
    }
    const currentRestaurantId = String(currentProfile?.restaurantId || "").trim();
    const nextRestaurantId = String(nextProfile?.restaurantId || "").trim();
    if (currentCanonicalRestaurantId && nextRestaurantId) {
      return currentCanonicalRestaurantId === nextRestaurantId;
    }
    if (nextCanonicalRestaurantId && currentRestaurantId) {
      return nextCanonicalRestaurantId === currentRestaurantId;
    }
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
    const canonicalRestaurantId = resolveProfileCanonicalRestaurantId(profile);
    return [
      String(profile.uid || "").trim(),
      String(profile.restaurantId || "").trim(),
      String(canonicalRestaurantId || "").trim(),
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
    const currentSnapshot = currentPayload?.businessSnapshot && typeof currentPayload.businessSnapshot === "object"
      ? currentPayload.businessSnapshot
      : null;
    const safePosts = Array.isArray(posts) ? posts : [];
    const safeCanonicalRestaurantId = String(
      safeProfile.canonicalRestaurantId
      || currentPayload?.canonicalRestaurantId
      || currentSnapshot?.restaurantId
      || ""
    ).trim();
    const safeRestaurantId = String(
      safeCanonicalRestaurantId
      || safeProfile.restaurantId
      || currentPayload?.restaurantId
      || currentSnapshot?.restaurantId
      || ""
    ).trim();
    const safeTopTab = String(topTab || "").trim().toLowerCase() || "profile";
    const safeContentTab = String(contentTab || "").trim().toLowerCase() || (safeTopTab === "menu" ? "menu" : "posts");
    const safeMenuAccessSource = String(menuAccessSource || "").trim().toLowerCase();
    const safeTableNumber = Math.max(0, Number(tableNumber || 0) || 0);
    const menu = state?.menu || {};
    const focus = state?.focus || {};
    const menuSurfaceState = resolveVisiblePublicMenuSurfaceState(state, {
      profile: safeProfile,
      routePayload: currentPayload,
      webDirectEntry: state?.__webDirectEntry,
      restaurantId: safeRestaurantId
    });
    const sameRestaurantMenu = menuSurfaceState.menu.matches === true;
    const sameRestaurantFocus = menuSurfaceState.focus.matches === true;
    const menuItemsFromLive = Array.isArray(menuSurfaceState.menu.items) ? menuSurfaceState.menu.items : [];
    const focusItemsFromLive = menuSurfaceState.focus.canRenderFocus && Array.isArray(menuSurfaceState.focus.items)
      ? menuSurfaceState.focus.items
      : [];
    const postsCountFromPayload = Math.max(0, Number(currentPayload?.posts?.count || 0) || 0);
    const postsCount = Math.max(safePosts.length, postsCountFromPayload);
    const menuCount = menuItemsFromLive.length;
    const focusCount = focusItemsFromLive.length;
    let postsTruthState = normalizeTruthState(
      currentSnapshot?.posts?.state
      || currentPayload?.posts?.state
      || currentPayload?.truth?.posts
      || "",
      safePosts.length > 0
        ? "seeded"
        : (safeProfile?.postsLoaded === true ? "knownEmpty" : "unknown")
    );
    if (safePosts.length > 0) postsTruthState = "seeded";
    const menuTruthFallback = sameRestaurantMenu
      ? (menuItemsFromLive.length ? "seeded" : (menuSurfaceState.menu.status === "loading" ? "unknown" : "knownEmpty"))
      : "unknown";
    let menuTruthState = normalizeTruthState(
      sameRestaurantMenu ? (menuSurfaceState.menu.truthState || "") : "",
      menuTruthFallback
    );
    if (menuItemsFromLive.length > 0) menuTruthState = "seeded";
    const focusTruthFallback = menuTruthState === "knownEmpty"
      ? "knownEmpty"
      : (sameRestaurantFocus
        ? (focusItemsFromLive.length ? "seeded" : (menuSurfaceState.focus.loading ? "unknown" : "knownEmpty"))
        : "unknown");
    let focusTruthState = normalizeTruthState(
      sameRestaurantFocus ? (menuSurfaceState.focus.truthState || "") : "",
      focusTruthFallback
    );
    if (menuTruthState === "knownEmpty") focusTruthState = "knownEmpty";
    if (focusItemsFromLive.length > 0) focusTruthState = "seeded";
    const followersValue = normalizeCountOrNull(safeProfile.followers ?? safeIdentity?.followers);
    const followingValue = normalizeCountOrNull(safeProfile.following ?? safeIdentity?.following);
    const identityName = String(safeProfile.name || safeIdentity?.name || "").trim();
    const identityHandle = String(safeProfile.handle || safeIdentity?.handle || "").trim();
    const identityAvatar = String(safeProfile.avatar || safeIdentity?.avatar || "").trim();
    const identityLocation = String(safeProfile.location || safeIdentity?.location || "").trim();
    const identityBio = String(safeProfile.bio || safeIdentity?.bio || "").trim();
    const identityTruth = normalizeTruthState(
      currentSnapshot?.truth?.identity
      || currentPayload?.truth?.identity
      || "",
      (identityName || identityHandle || identityAvatar || identityLocation) ? "seeded" : "unknown"
    );
    const bioTruth = normalizeTruthState(
      currentSnapshot?.truth?.bio
      || currentPayload?.truth?.bio
      || "",
      identityBio ? "seeded" : "knownEmpty"
    );
    const avatarTruth = normalizeTruthState(
      currentSnapshot?.truth?.avatar
      || currentPayload?.truth?.avatar
      || "",
      identityAvatar ? "seeded" : "knownEmpty"
    );
    const countsTruth = normalizeTruthState(
      currentSnapshot?.truth?.counts
      || currentPayload?.truth?.counts
      || "",
      (followersValue !== null || followingValue !== null) ? "seeded" : "unknown"
    );
    const layoutMenuCardColor = String(
      state?.menuLayout?.cardColor
      || currentSnapshot?.layout?.menuCardColor
      || currentPayload?.layout?.menuCardColor
      || ""
    ).trim().toLowerCase() || "white";
    const layoutTruth = normalizeTruthState(
      currentSnapshot?.truth?.layout
      || currentPayload?.truth?.layout
      || "",
      layoutMenuCardColor ? "seeded" : "unknown"
    );
    const snapshotVersion = String(
      currentSnapshot?.snapshotVersion
      || currentPayload?.snapshotVersion
      || "business-page-v1"
    ).trim() || "business-page-v1";
    const snapshotUpdatedAt = Math.max(
      0,
      Number(currentSnapshot?.updatedAt || currentPayload?.snapshotUpdatedAt || 0) || 0
    ) || Date.now();
    const snapshotVersionKey = String(
      currentSnapshot?.version
      || currentPayload?.snapshotVersionKey
      || `${safeRestaurantId}:${snapshotUpdatedAt}:${snapshotVersion}`
    ).trim() || `${safeRestaurantId}:${snapshotUpdatedAt}:${snapshotVersion}`;
    const resolvedMenuItems = menuTruthState === "seeded"
      ? menuItemsFromLive
      : [];
    const resolvedFocusItems = focusTruthState === "seeded"
      ? focusItemsFromLive
      : [];
    const nextSnapshot = {
      snapshotVersion,
      version: snapshotVersionKey,
      updatedAt: snapshotUpdatedAt,
      restaurantId: safeRestaurantId,
      identity: {
        name: identityName,
        handle: identityHandle,
        avatar: identityAvatar,
        location: identityLocation,
        bio: identityBio,
        followers: followersValue,
        following: followingValue,
        type: String(safeProfile.type || safeProfile.customerType || safeIdentity?.type || safeIdentity?.customerType || "").trim(),
        customerType: String(safeProfile.customerType || safeProfile.type || safeIdentity?.customerType || safeIdentity?.type || "").trim()
      },
      posts: {
        state: postsTruthState,
        seeded: postsTruthState === "seeded",
        knownEmpty: postsTruthState === "knownEmpty",
        unknown: postsTruthState === "unknown",
        count: postsCount,
        items: safePosts
      },
      menu: {
        state: menuTruthState,
        seeded: menuTruthState === "seeded",
        knownEmpty: menuTruthState === "knownEmpty",
        unknown: menuTruthState === "unknown",
        count: menuCount,
        items: resolvedMenuItems,
        statusBadgeVisible: menu.statusBadgeVisible !== false
      },
      focus: {
        state: focusTruthState,
        seeded: focusTruthState === "seeded",
        knownEmpty: focusTruthState === "knownEmpty",
        unknown: focusTruthState === "unknown",
        count: focusCount,
        items: resolvedFocusItems,
        enabled: focus.enabled !== false
      },
      layout: {
        menuCardColor: layoutMenuCardColor
      },
      truth: {
        identity: identityTruth,
        bio: bioTruth,
        avatar: avatarTruth,
        counts: countsTruth,
        posts: postsTruthState,
        menu: menuTruthState,
        focus: focusTruthState,
        layout: layoutTruth
      }
    };
    const phaseReady = identityTruth === "seeded"
      && postsTruthState !== "unknown"
      && menuTruthState !== "unknown"
      && focusTruthState !== "unknown";
    return {
      ...(currentPayload || {}),
      owner: "web-direct",
      routeFirst: true,
      restaurantId: safeRestaurantId,
      canonicalRestaurantId: safeCanonicalRestaurantId,
      surface: safeTopTab === "menu" ? "menu" : "profile",
      topTab: safeTopTab,
      contentTab: safeContentTab,
      phase: normalizeDirectEntryPhase(entry?.phase || currentPayload?.phase || "", phaseReady ? "ready" : "loading"),
      menuAccessSource: safeMenuAccessSource,
      tableNumber: safeTableNumber,
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
        state: postsTruthState,
        count: postsCount,
        seeded: postsTruthState === "seeded",
        knownEmpty: postsTruthState === "knownEmpty",
        unknown: postsTruthState === "unknown",
        items: safePosts
      },
      menu: {
        state: menuTruthState,
        count: menuCount,
        seeded: menuTruthState === "seeded",
        knownEmpty: menuTruthState === "knownEmpty",
        unknown: menuTruthState === "unknown",
        items: resolvedMenuItems,
        statusBadgeVisible: menu.statusBadgeVisible !== false
      },
      focus: {
        state: focusTruthState,
        count: focusCount,
        seeded: focusTruthState === "seeded",
        knownEmpty: focusTruthState === "knownEmpty",
        unknown: focusTruthState === "unknown",
        items: resolvedFocusItems,
        enabled: focus.enabled !== false
      },
      layout: {
        menuCardColor: layoutMenuCardColor
      },
      truth: {
        identity: identityTruth,
        bio: bioTruth,
        avatar: avatarTruth,
        counts: countsTruth,
        posts: postsTruthState,
        menu: menuTruthState,
        focus: focusTruthState,
        layout: layoutTruth
      },
      snapshotVersion: nextSnapshot.snapshotVersion,
      snapshotUpdatedAt: nextSnapshot.updatedAt,
      snapshotVersionKey: nextSnapshot.version,
      businessSnapshot: nextSnapshot,
      ts: Date.now()
    };
  }

  function serializeRoutePayload(payload = null) {
    if (!payload || typeof payload !== "object") return "";
    return [
      String(payload?.restaurantId || "").trim(),
      String(payload?.canonicalRestaurantId || "").trim(),
      String(payload?.surface || "").trim().toLowerCase(),
      String(payload?.topTab || "").trim().toLowerCase(),
      String(payload?.contentTab || "").trim().toLowerCase(),
      String(payload?.phase || "").trim().toLowerCase(),
      String(payload?.identity?.name || "").trim(),
      String(payload?.identity?.avatar || "").trim(),
      String(payload?.identity?.location || "").trim(),
      String(payload?.identity?.followers ?? ""),
      String(payload?.identity?.following ?? ""),
      String(payload?.truth?.identity || "").trim().toLowerCase(),
      String(payload?.truth?.posts || "").trim().toLowerCase(),
      String(payload?.truth?.menu || "").trim().toLowerCase(),
      String(payload?.truth?.focus || "").trim().toLowerCase(),
      String(payload?.posts?.count ?? ""),
      String(payload?.posts?.state || "").trim().toLowerCase(),
      String(payload?.menu?.count ?? ""),
      String(payload?.menu?.state || "").trim().toLowerCase(),
      String(payload?.focus?.count ?? ""),
      String(payload?.focus?.state || "").trim().toLowerCase(),
      String(payload?.layout?.menuCardColor || "").trim().toLowerCase(),
      String(payload?.menuAccessSource || "").trim().toLowerCase(),
      String(Math.max(0, Number(payload?.tableNumber || 0) || 0)),
      String(payload?.snapshotVersion || "").trim(),
      String(payload?.snapshotVersionKey || "").trim(),
      String(Math.max(0, Number(payload?.snapshotUpdatedAt || 0) || 0))
    ].join("::");
  }

  function attachProfileViewListener(profile) {
    if (!profile || !makeDocRef || !db) {
      stopProfileViewListener();
      return;
    }
    const { ref, listenerPath, listenerKey: nextListenerKey } = resolveProfileViewListenerTarget(profile);
    if (!ref || !nextListenerKey) {
      stopProfileViewListener();
      return;
    }
    if (!onSnapshotSafe || isGuestPublicBusinessRouteContext(profile)) {
      stopProfileViewListener();
      void refreshProfileViewOnce(profile, { ref, listenerPath, listenerKey: nextListenerKey });
      return;
    }
    if (
      nextListenerKey
      && profileViewListenerKey === nextListenerKey
      && typeof profileViewUnsub === "function"
    ) {
      return;
    }
    stopProfileViewListener();
    profileViewListenerKey = nextListenerKey;
    profileViewUnsub = onSnapshotSafe(ref, (snap) => {
      if (!snap.exists()) return;
      const data = snap.data() || {};
      applyProfileViewDocToVisibleState(profile, data);
    }, (err) => {
      console.error(`[mnyra][firestore.listen.publicProfile] ${listenerPath}`, err);
    });
    if (typeof profileViewUnsub !== "function") {
      profileViewUnsub = null;
      profileViewListenerKey = "";
    }
  }

  function showPublicProfile(profile, posts, {
    showBack = true,
    backTab,
    topTab,
    contentTab = "",
    menuAccessSource = null,
    tableNumber = null,
    directEntry = null,
    routePayload = null
  } = {}) {
    const hasExplicitMenuAccessSource = menuAccessSource !== null && menuAccessSource !== undefined;
    const requestedMenuAccessSource = hasExplicitMenuAccessSource
      ? String(menuAccessSource || "").trim().toLowerCase()
      : "";
    const hasExplicitTableNumber = tableNumber !== null && tableNumber !== undefined;
    const requestedTableNumber = hasExplicitTableNumber
      ? Math.max(0, Number(tableNumber || 0) || 0)
      : 0;
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
    const currentMenuAccessSource = String(currentView?.menuAccessSource || "").trim().toLowerCase();
    const currentTableNumber = Math.max(0, Number(currentView?.tableNumber || 0) || 0);
    const currentDirectEntry = currentView?.directEntry && typeof currentView.directEntry === "object"
      ? currentView.directEntry
      : null;
    const currentRoutePayload = currentView?.routePayload && typeof currentView.routePayload === "object"
      ? currentView.routePayload
      : null;
    const incomingRoutePayload = routePayload && typeof routePayload === "object"
      ? routePayload
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
    const normalizedMenuAccessSource = hasExplicitMenuAccessSource
      ? (requestedMenuAccessSource === "qr" ? "qr" : "")
      : (sameVisibleIncomingProfile && currentMenuAccessSource === "qr" ? "qr" : "");
    const safeTableNumber = normalizedMenuAccessSource === "qr"
      ? (
        hasExplicitTableNumber
          ? requestedTableNumber
          : (sameVisibleIncomingProfile ? currentTableNumber : 0)
      )
      : 0;
    const incomingProjectedPosts = projectPostCollectionThroughEntityMap(state, posts || profile?.posts || []);
    const incomingProfileSettling = isProfileSettling(profile);
    const currentSurface = resolveVisibleProfileSurface(state, {
      profileView: currentView,
      profileTopTab: state?.profileTopTab || "",
      profileContentTab: state?.profileContentTab || ""
    });
    const currentRoutePayloadIsWebDirect = String(currentRoutePayload?.owner || "").trim().toLowerCase() === "web-direct"
      && currentRoutePayload?.routeFirst === true;
    const currentRoutePostsState = normalizeTruthState(
      currentRoutePayload?.businessSnapshot?.posts?.state
      || currentRoutePayload?.posts?.state
      || currentRoutePayload?.truth?.posts
      || "",
      ""
    );
    const currentRouteIdentityState = normalizeTruthState(
      currentRoutePayload?.businessSnapshot?.truth?.identity
      || currentRoutePayload?.truth?.identity
      || "",
      ""
    );
    const currentRoutePayloadHasPostsTruth = currentRoutePayloadIsWebDirect
      && (currentRoutePostsState === "seeded" || currentRoutePostsState === "knownEmpty");
    const currentRoutePayloadHasIdentityTruth = currentRoutePayloadIsWebDirect
      && (
        currentRouteIdentityState === "seeded"
        || !!(
          String(currentRoutePayload?.identity?.name || "").trim()
          || String(currentRoutePayload?.identity?.avatar || "").trim()
          || String(currentRoutePayload?.identity?.handle || "").trim()
        )
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
    const currentCanonicalRestaurantId = resolveProfileCanonicalRestaurantId(currentProfile, currentRoutePayload);
    const incomingCanonicalRoutePayload = incomingRoutePayload || (sameVisibleIncomingProfile ? currentRoutePayload : null);
    const incomingCanonicalRestaurantId = resolveProfileCanonicalRestaurantId(profile, incomingCanonicalRoutePayload);
    const resolvedCanonicalRestaurantId = String(
      incomingCanonicalRestaurantId
      || (sameVisibleIncomingProfile ? currentCanonicalRestaurantId : "")
      || ""
    ).trim();
    const nextProfile = profile ? {
      ...profile,
      ...(resolvedCanonicalRestaurantId ? { canonicalRestaurantId: resolvedCanonicalRestaurantId } : {}),
      ...(
        resolvedCanonicalRestaurantId && !String(profile?.restaurantId || "").trim()
          ? { restaurantId: resolvedCanonicalRestaurantId }
          : {}
      ),
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
    const normalizedExplicitTopTab = explicitTopTab
      ? normalizeTopTab(explicitTopTab, "profile")
      : "";
    const liveTopTabValue = String(state?.profileTopTab || "").trim();
    const normalizedCurrentTopTab = liveTopTabValue
      ? normalizeTopTab(liveTopTabValue, "profile")
      : "";
    const currentDirectEntryTopTab = String(currentDirectEntry?.topTab || "").trim();
    const normalizedCurrentDirectEntryTopTab = currentDirectEntryTopTab
      ? normalizeTopTab(currentDirectEntryTopTab, "profile")
      : "";
    const preserveLiveBusinessTopTab = sameVisibleProfile
      && normalizedExplicitTopTab
      && normalizedCurrentTopTab
      && normalizedExplicitTopTab !== normalizedCurrentTopTab
      && normalizedCurrentTopTab !== normalizedCurrentDirectEntryTopTab
      && currentDirectEntry?.routeFirst === true
      && String(state?.activeTab || "").trim().toLowerCase() === "profile"
      && !!String(
        nextProfile?.canonicalRestaurantId
        || nextProfile?.restaurantId
        || currentProfile?.canonicalRestaurantId
        || currentProfile?.restaurantId
        || ""
      ).trim();
    const effectiveExplicitTopTab = preserveLiveBusinessTopTab ? "" : explicitTopTab;
    const preservedTopTab = sameVisibleProfile
      ? String(state?.profileTopTab || "").trim()
      : "";
    const resolvedTopTab = (nextProfile?.canonicalRestaurantId || nextProfile?.restaurantId)
      ? normalizeTopTab(effectiveExplicitTopTab || preservedTopTab || "profile", "profile")
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
    const explicitContentTab = String(contentTab || "").trim().toLowerCase();
    const effectiveExplicitContentTab = preserveLiveBusinessTopTab ? "" : explicitContentTab;
    const nextContentTab = resolvedTopTab === "menu"
      ? "menu"
      : (preserveLandingState && previousContentTab
        ? previousContentTab
        : normalizeContentTab(effectiveExplicitContentTab || "posts", "posts"));
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
    const explicitRoutePayload = incomingRoutePayload;
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
    const nextCanonicalRestaurantId = String(
      nextProfile?.canonicalRestaurantId
      || nextRoutePayload?.canonicalRestaurantId
      || nextRoutePayload?.businessSnapshot?.restaurantId
      || ""
    ).trim();
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
    const currentMenuAccessSourceSignature = currentMenuAccessSource;
    const currentTableNumberSignature = currentTableNumber;
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
      && currentMenuAccessSourceSignature === normalizedMenuAccessSource
      && currentTableNumberSignature === safeTableNumber
      && currentDirectEntrySignature === nextDirectEntrySignature
      && currentRoutePayloadSignature === nextRoutePayloadSignature
      && String(state?.profileBackTab || "") === String(nextProfileBackTab || "")
      && String(state?.activeTab || "").trim().toLowerCase() === "profile"
    ) {
      state.profileSurface = nextSurface;
      syncWebDirectEntryState({
        restaurantId: String(nextProfile?.restaurantId || nextCanonicalRestaurantId || "").trim(),
        canonicalRestaurantId: nextCanonicalRestaurantId,
        topTab: resolvedTopTab,
        contentTab: nextContentTab,
        menuAccessSource: normalizedMenuAccessSource,
        tableNumber: safeTableNumber,
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
    resetStalePublicMenuStateForProfileSwitch({
      sameVisibleProfile,
      profile: nextProfile,
      routePayload: nextRoutePayload,
      directEntry: nextDirectEntry,
      restaurantId: nextCanonicalRestaurantId || nextProfile?.restaurantId || "",
      topTab: resolvedTopTab,
      contentTab: nextContentTab
    });
    state.profileSurface = resolveVisibleProfileSurface(state, {
      profileView: nextView,
      profileTopTab: resolvedTopTab,
      profileContentTab: nextContentTab
    });
    syncWebDirectEntryState({
      restaurantId: String(nextProfile?.restaurantId || nextCanonicalRestaurantId || "").trim(),
      canonicalRestaurantId: nextCanonicalRestaurantId,
      topTab: resolvedTopTab,
      contentTab: nextContentTab,
      menuAccessSource: normalizedMenuAccessSource,
      tableNumber: safeTableNumber,
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
    const publicSlug = String(data?.publicSlug || rest?.publicSlug || data?.landingSlug || rest?.landingSlug || "").trim();
    const landingSlug = String(data?.landingSlug || rest?.landingSlug || publicSlug).trim();
    const canonicalPublicPath = String(
      publicSlug
        ? `/${encodeURIComponent(publicSlug)}`
        : (data?.canonicalPublicPath || rest?.canonicalPublicPath || "")
    ).trim();
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
      canonicalRestaurantId: restaurantId,
      publicSlug,
      canonicalPublicPath,
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

  function markBusinessPostsKnownEmpty(...restaurantIds) {
    const emptyUntil = Date.now() + PUBLIC_BUSINESS_EMPTY_POSTS_TTL_MS;
    for (const restaurantIdRaw of restaurantIds) {
      const restaurantId = String(restaurantIdRaw || "").trim();
      if (!restaurantId) continue;
      publicBusinessPostsEmptyUntilCache.set(restaurantId, emptyUntil);
    }
  }

  function clearBusinessPostsKnownEmpty(...restaurantIds) {
    for (const restaurantIdRaw of restaurantIds) {
      const restaurantId = String(restaurantIdRaw || "").trim();
      if (!restaurantId) continue;
      publicBusinessPostsEmptyUntilCache.delete(restaurantId);
    }
  }

  function isBusinessPostsKnownEmpty(restaurantId) {
    const safeRestaurantId = String(restaurantId || "").trim();
    if (!safeRestaurantId) return false;
    const emptyUntil = Number(publicBusinessPostsEmptyUntilCache.get(safeRestaurantId) || 0);
    if (!Number.isFinite(emptyUntil) || emptyUntil <= 0) return false;
    if (emptyUntil <= Date.now()) {
      publicBusinessPostsEmptyUntilCache.delete(safeRestaurantId);
      return false;
    }
    return true;
  }

  async function loadBusinessPostsForRestaurant(restaurantId, { skipProfileResolve = false, force = false } = {}) {
    const routeRestaurantId = String(restaurantId || "").trim();
    if (!routeRestaurantId || !makeCollectionRef || !db) return [];
    const directCached = publicBusinessPostsCache.get(routeRestaurantId);
    if (!force && Array.isArray(directCached) && directCached.length > 0) {
      clearBusinessPostsKnownEmpty(routeRestaurantId);
      return directCached;
    }
    if (!force && isBusinessPostsKnownEmpty(routeRestaurantId)) return [];
    const inFlight = publicBusinessPostsInFlight.get(routeRestaurantId);
    if (inFlight) {
      return inFlight;
    }
    const request = (async () => {
      let effectiveRestaurantId = routeRestaurantId;
      let shouldSkipProfileResolve = !!skipProfileResolve;
      const cachedCanonicalRestaurantId = String(
        canonicalRestaurantIdByRouteId.get(routeRestaurantId)
        || canonicalRestaurantIdByRouteId.get(normalizeLandingSlugKey(routeRestaurantId))
        || ""
      ).trim();
      if (cachedCanonicalRestaurantId) {
        effectiveRestaurantId = cachedCanonicalRestaurantId;
        shouldSkipProfileResolve = true;
      }
      if (!shouldSkipProfileResolve) {
        const resolvedDoc = await fetchBusinessProfileDoc({ restaurantId: routeRestaurantId });
        effectiveRestaurantId = String(resolvedDoc?.id || routeRestaurantId || "").trim();
        if (resolvedDoc?.id) {
          cacheResolvedRestaurantDoc(routeRestaurantId, null, resolvedDoc);
        }
      }
      if (!effectiveRestaurantId) return [];
      const resolvedCached = publicBusinessPostsCache.get(effectiveRestaurantId);
      if (!force && Array.isArray(resolvedCached) && resolvedCached.length > 0) {
        clearBusinessPostsKnownEmpty(effectiveRestaurantId, routeRestaurantId);
        if (routeRestaurantId !== effectiveRestaurantId) {
          publicBusinessPostsCache.set(routeRestaurantId, resolvedCached);
        }
        return resolvedCached;
      }
      if (!force && isBusinessPostsKnownEmpty(effectiveRestaurantId)) {
        markBusinessPostsKnownEmpty(effectiveRestaurantId, routeRestaurantId);
        return [];
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
        if (normalizedPosts.length > 0) {
          clearBusinessPostsKnownEmpty(effectiveRestaurantId, routeRestaurantId);
          publicBusinessPostsCache.set(effectiveRestaurantId, normalizedPosts);
          if (routeRestaurantId !== effectiveRestaurantId) {
            publicBusinessPostsCache.set(routeRestaurantId, normalizedPosts);
          }
        } else {
          markBusinessPostsKnownEmpty(effectiveRestaurantId, routeRestaurantId);
          publicBusinessPostsCache.delete(effectiveRestaurantId);
          publicBusinessPostsCache.delete(routeRestaurantId);
        }
        return normalizedPosts;
      } catch (err) {
        console.error(err);
        const fallbackCached = publicBusinessPostsCache.get(effectiveRestaurantId) || publicBusinessPostsCache.get(routeRestaurantId);
        if (Array.isArray(fallbackCached) && fallbackCached.length > 0) {
          clearBusinessPostsKnownEmpty(effectiveRestaurantId, routeRestaurantId);
          return fallbackCached;
        }
        if (isBusinessPostsKnownEmpty(effectiveRestaurantId) || isBusinessPostsKnownEmpty(routeRestaurantId)) {
          return [];
        }
        return [];
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
