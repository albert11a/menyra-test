import { projectPostCollectionThroughEntityMap } from "./post-entity-registry-utils.js";

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
      renderApp();
    }, (err) => {
      console.error(`[mnyra][firestore.listen.publicProfile] ${listenerPath}`, err);
    });
  }

  function showPublicProfile(profile, posts, { showBack = true, backTab, topTab, landingStep = 0, menuAccessSource = "", tableNumber = 0 } = {}) {
    const safeMenuAccessSource = String(menuAccessSource || "").trim().toLowerCase();
    const safeTableNumber = Math.max(0, Number(tableNumber || 0) || 0);
    const projectedPosts = projectPostCollectionThroughEntityMap(state, posts || profile.posts || []);
    const nextProfile = profile ? { ...profile, posts: projectedPosts } : profile;
    const sameVisibleProfile = isSameVisibleProfile(state?.profileView?.profile || null, nextProfile);
    const previousTopTab = String(state?.profileTopTab || "").trim().toLowerCase();
    const preserveLandingState = sameVisibleProfile && previousTopTab === "landing";
    const clampLandingStep = (value = 0) => {
      const parsed = Math.round(Number(value || 0));
      if (!Number.isFinite(parsed)) return 0;
      return Math.max(0, Math.min(5, parsed));
    };
    const normalizeLandingIndex = (value = 0) => {
      const parsed = Math.round(Number(value || 0));
      if (!Number.isFinite(parsed)) return 0;
      return Math.max(0, parsed);
    };
    const preservedLandingStep = preserveLandingState ? clampLandingStep(state?.profileLandingStep) : 0;
    const preservedLandingGreetingIndex = preserveLandingState ? normalizeLandingIndex(state?.profileLandingGreetingIndex) : 0;
    const preservedLandingTourIndex = preserveLandingState ? normalizeLandingIndex(state?.profileLandingTourIndex) : 0;
    const requestedLandingStep = clampLandingStep(landingStep);
    const previousContentTab = String(state?.profileContentTab || "").trim().toLowerCase();
    const explicitTopTab = String(topTab || "").trim();
    const preservedTopTab = sameVisibleProfile
      ? String(state?.profileTopTab || "").trim()
      : "";
    state.profileView = {
      profile: nextProfile,
      posts: projectedPosts,
      menuAccessSource: safeMenuAccessSource === "qr" ? "qr" : "",
      tableNumber: safeTableNumber
    };
    state.profileModal = { open: false, profile: null };
    state.profileContentTab = preserveLandingState && previousContentTab
      ? previousContentTab
      : "posts";
    const resolvedTopTab = profile?.restaurantId
      ? (explicitTopTab || preservedTopTab || "profile")
      : "profile";
    state.profileTopTab = resolvedTopTab;
    if (resolvedTopTab === "landing") {
      if (preserveLandingState) {
        state.profileLandingStep = preservedLandingStep;
        state.profileLandingGreetingIndex = preservedLandingGreetingIndex;
        state.profileLandingTourIndex = preservedLandingTourIndex;
      } else {
        state.profileLandingStep = requestedLandingStep;
        state.profileLandingGreetingIndex = 0;
        state.profileLandingTourIndex = 0;
      }
    }
    state.profileViewMode = "grid";
    state.profilePostMenuId = null;
    state.drawerOpen = false;
    if (showBack) {
      state.profileBackTab = backTab || state.activeTab || "feed";
    } else {
      state.profileBackTab = "";
    }
    state.activeTab = "profile";
    renderApp();
    attachProfileViewListener(nextProfile);
  }

  function normalizeExternalProfile({ profileDoc, restaurant, fallbackName, posts }) {
    const data = profileDoc?.data || profileDoc || {};
    const rest = restaurant || {};
    const parseCoordCandidate = (value = null) => {
      if (value === null || value === undefined || value === "") return null;
      const parsed = Number(String(value).trim().replace(",", "."));
      return Number.isFinite(parsed) ? parsed : null;
    };
    const resolveCoords = () => {
      const candidates = [
        [data?.lat, data?.lng],
        [data?.latitude, data?.longitude],
        [data?.gpsLat, data?.gpsLng],
        [rest?.lat, rest?.lng],
        [rest?.latitude, rest?.longitude],
        [rest?.gpsLat, rest?.gpsLng],
        [rest?.geo?.lat, rest?.geo?.lng],
        [rest?.coords?.lat, rest?.coords?.lng],
        [rest?.location?.lat, rest?.location?.lng]
      ];
      for (const pair of candidates) {
        const lat = parseCoordCandidate(pair?.[0]);
        const lng = parseCoordCandidate(pair?.[1]);
        if (!Number.isFinite(lat) || !Number.isFinite(lng)) continue;
        if (Math.abs(lat) < 0.000001 && Math.abs(lng) < 0.000001) continue;
        if (Math.abs(lat) <= 90 && Math.abs(lng) <= 180) return { lat, lng };
        if (Math.abs(lat) <= 180 && Math.abs(lng) <= 90) return { lat: lng, lng: lat };
      }
      return null;
    };
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
    const coords = resolveCoords();
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
      ...(coords ? {
        lat: coords.lat,
        lng: coords.lng,
        latitude: coords.lat,
        longitude: coords.lng,
        gpsLat: coords.lat,
        gpsLng: coords.lng
      } : {}),
      ...(landingScreenOne && typeof landingScreenOne === "object" ? { landingScreenOne } : {}),
      ...(type ? { type, customerType: type } : {}),
      pendingFollowRequest: false,
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
      posts: posts || []
    };
  }

  async function fetchBusinessProfileDoc({ restaurantId, restaurant }) {
    return resolveRestaurantDocByRouteId(restaurantId, restaurant);
  }

  async function loadBusinessPostsForRestaurant(restaurantId) {
    const routeRestaurantId = String(restaurantId || "").trim();
    if (!routeRestaurantId || !makeCollectionRef || !db) return [];
    const resolvedDoc = await fetchBusinessProfileDoc({ restaurantId: routeRestaurantId });
    const effectiveRestaurantId = String(resolvedDoc?.id || routeRestaurantId || "").trim();
    if (!effectiveRestaurantId) return [];
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
      return projectPostCollectionThroughEntityMap(state, rows
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
    } catch (err) {
      console.error(err);
      return [];
    }
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
