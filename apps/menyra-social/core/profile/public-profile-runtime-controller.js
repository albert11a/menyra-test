import { projectPostCollectionThroughEntityMap } from "./post-entity-registry-utils.js";

export function createPublicProfileRuntimeController({
  state = null,
  db = null,
  docFn = null,
  collectionFn = null,
  queryFn = null,
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
  const buildOrderBy = typeof orderByFn === "function" ? orderByFn : null;
  const buildLimit = typeof limitFn === "function" ? limitFn : null;
  const brandSocialName = String(brandUi?.social || "Menyra").trim() || "Menyra";
  const profilePostLimit = fastLimits?.profilePosts || fastLimits?.businessPosts || 12;
  let profileViewUnsub = null;

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
        viewProfile.headerLogoUrl = data.headerLogoUrl || data.headerLogo || viewProfile.headerLogoUrl || "";
        viewProfile.headerLogo = viewProfile.headerLogoUrl || data.headerLogo || viewProfile.headerLogo || "";
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

  function showPublicProfile(profile, posts, { showBack = true, backTab, topTab, menuAccessSource = "", tableNumber = 0 } = {}) {
    const safeMenuAccessSource = String(menuAccessSource || "").trim().toLowerCase();
    const safeTableNumber = Math.max(0, Number(tableNumber || 0) || 0);
    const projectedPosts = projectPostCollectionThroughEntityMap(state, posts || profile.posts || []);
    const nextProfile = profile ? { ...profile, posts: projectedPosts } : profile;
    const sameVisibleProfile = isSameVisibleProfile(state?.profileView?.profile || null, nextProfile);
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
    state.profileContentTab = "posts";
    state.profileTopTab = profile?.restaurantId
      ? (explicitTopTab || preservedTopTab || "profile")
      : "profile";
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
    const displayName = data?.displayName || data?.name || rest?.name || rest?.restaurantName || fallbackName || "Business";
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
    const restaurantId = data?.restaurantId || rest?.id || "";
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
      headerLogoUrl: data?.headerLogoUrl || data?.headerLogo || rest?.headerLogoUrl || rest?.headerLogo || "",
      headerLogo: data?.headerLogo || data?.headerLogoUrl || rest?.headerLogo || rest?.headerLogoUrl || "",
      location: data?.city || rest?.city || "Kosovo",
      followers,
      following,
      privateAccount: false,
      role: "business",
      restaurantId,
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
      headerLogoUrl: data?.headerLogoUrl || data?.headerLogo || fallback?.headerLogoUrl || fallback?.headerLogo || "",
      headerLogo: data?.headerLogo || data?.headerLogoUrl || fallback?.headerLogo || fallback?.headerLogoUrl || "",
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
    const rest = restaurant || (restaurantId ? state?.restaurants?.find?.((row) => row.id === restaurantId) : null) || null;
    const restId = restaurantId || rest?.id || "";
    if (restId && makeDocRef && db) {
      try {
        const snap = await getDocSafe(makeDocRef(db, "restaurants", restId));
        if (snap.exists()) {
          const data = snap.data() || {};
          if (!isPublicBusinessRecord({ id: snap.id, ...data })) return null;
          return { id: snap.id, data };
        }
      } catch {}
    }
    if (rest?.id) {
      if (!isPublicBusinessRecord(rest)) return null;
      return { id: rest.id, data: rest };
    }
    return null;
  }

  async function loadBusinessPostsForRestaurant(restaurantId) {
    if (!restaurantId || !makeCollectionRef || !db) return [];
    try {
      const ref = makeCollectionRef(db, "restaurants", restaurantId, "socialPosts");
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
          ownerId: restaurantId,
          restaurantId
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
