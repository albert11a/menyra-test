import { buildStoriesSignatureCore } from "./feed-story-utils.js";
import { normalizeUserPostDocCore } from "./post-doc-normalize-utils.js";
import { projectPostCollectionThroughEntityMap } from "../profile/post-entity-registry-utils.js";

export function createFeedVisibilityRuntimeCluster({
  state = null,
  firebaseApi = {},
  constants = {},
  visibilityApi = {},
  utilityApi = {}
} = {}) {
  const collection = typeof firebaseApi.collectionFn === "function" ? firebaseApi.collectionFn : null;
  const query = typeof firebaseApi.queryFn === "function" ? firebaseApi.queryFn : null;
  const orderBy = typeof firebaseApi.orderByFn === "function" ? firebaseApi.orderByFn : null;
  const limit = typeof firebaseApi.limitFn === "function" ? firebaseApi.limitFn : null;
  const getDocs = typeof firebaseApi.getDocsFn === "function" ? firebaseApi.getDocsFn : null;
  const fastLimits = constants.fastLimits || {};
  const isForceHiddenUid = typeof visibilityApi.isForceHiddenUidFn === "function"
    ? visibilityApi.isForceHiddenUidFn
    : (() => false);
  const isForceHiddenHandle = typeof visibilityApi.isForceHiddenHandleFn === "function"
    ? visibilityApi.isForceHiddenHandleFn
    : (() => false);
  const isForceHiddenBusinessEntity = typeof visibilityApi.isForceHiddenBusinessEntityFn === "function"
    ? visibilityApi.isForceHiddenBusinessEntityFn
    : (() => false);
  const isPublicBusinessRecord = typeof visibilityApi.isPublicBusinessRecordFn === "function"
    ? visibilityApi.isPublicBusinessRecordFn
    : (() => true);
  const formatRelative = typeof utilityApi.formatRelativeFn === "function"
    ? utilityApi.formatRelativeFn
    : ((value) => String(value || ""));
  const toDateSafe = typeof utilityApi.toDateSafeFn === "function"
    ? utilityApi.toDateSafeFn
    : ((value) => value);

  function canShowFeedRestaurantId(restaurantId) {
    const rid = String(restaurantId || "").trim();
    if (!rid) return true;
    const ownRestaurantId = String(state?.userProfile?.restaurantId || "").trim();
    if (ownRestaurantId && rid === ownRestaurantId) return true;
    if (isForceHiddenUid(rid) || isForceHiddenHandle(rid)) return false;
    const restaurant = (state?.restaurants || []).find((row) => String(row?.id || "") === rid) || null;
    if (!restaurant) return true;
    return isPublicBusinessRecord(restaurant);
  }

  function normalizeFeedPost(row = {}) {
    const restaurantId = String(row?.rid || row?.restaurantId || "").trim();
    if (isForceHiddenBusinessEntity({ id: restaurantId, restaurantId, ...(row || {}) })) return null;
    if (!canShowFeedRestaurantId(restaurantId)) return null;
    const restaurant = (state?.restaurants || []).find((entry) => entry?.id === restaurantId) || {};
    const thumb = row?.thumbUrl || row?.mediaUrl || row?.media?.[0]?.thumbUrl || row?.media?.[0]?.url || "";
    const rowLogo = row?.logoUrl || row?.logo || row?.logoURL || "";
    const caption = row?.caption || row?.captionShort || "";
    return {
      id: row?.id,
      restaurantId,
      business: row?.businessName || row?.restaurantName || restaurant?.name || restaurant?.restaurantName || "Business",
      logo: restaurant?.logoUrl || restaurant?.logo || rowLogo || "",
      location: row?.city || restaurant?.city || "Prishtina",
      content: caption,
      image: thumb || "",
      likes: row?.likesCount || "0",
      comments: row?.commentsCount || "0",
      time: formatRelative(toDateSafe(row?.createdAt)),
      createdAt: row?.createdAt,
      category: row?.postType || "food",
      isLive: row?.isLive || false,
      ownerType: "restaurant",
      ownerId: restaurantId
    };
  }

  function buildStoriesRowSignature(items = []) {
    return buildStoriesSignatureCore(items || []);
  }

  async function loadUserPostsForUser(uid) {
    const safeUid = String(uid || "").trim();
    if (!safeUid || !firebaseApi.db || !collection || !getDocs) return [];
    try {
      const ref = collection(firebaseApi.db, "users", safeUid, "posts");
      let snap = null;
      try {
        const orderedQuery = query && orderBy && limit
          ? query(ref, orderBy("createdAt", "desc"), limit(fastLimits.profilePosts || fastLimits.userPosts))
          : ref;
        snap = await getDocs(orderedQuery);
      } catch (_err) {
        snap = await getDocs(ref);
      }
      const rows = [];
      snap?.forEach?.((docSnap) => rows.push({ id: docSnap.id, ...docSnap.data() }));
      const projectedRows = rows
        .map((row) => normalizeUserPostDocCore(row.id, {
          ...row,
          url: row.url || row.mediaUrl || row.media?.[0]?.url || "",
          isVideo: row.isVideo ?? row.media?.[0]?.type === "video"
        }, safeUid))
        .filter((row) => row.url);
      return projectPostCollectionThroughEntityMap(state, projectedRows);
    } catch (err) {
      console.error(err);
      return [];
    }
  }

  return {
    canShowFeedRestaurantId,
    normalizeFeedPost,
    buildStoriesRowSignature,
    loadUserPostsForUser
  };
}
