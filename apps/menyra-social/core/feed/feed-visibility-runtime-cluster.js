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

  function toTimestampMs(value) {
    if (!value) return 0;
    try {
      if (typeof value?.toDate === "function") {
        return value.toDate()?.getTime?.() || 0;
      }
      if (typeof value === "number") return Number.isFinite(value) ? value : 0;
      if (value instanceof Date) return value.getTime() || 0;
      const parsed = toDateSafe(value);
      return parsed?.getTime?.() || 0;
    } catch {
      return 0;
    }
  }

  function resolveCanonicalPostById(postId = "", restaurantId = "") {
    const safePostId = String(postId || "").trim();
    if (!safePostId || !(state?.postEntityMap instanceof Map) || !state.postEntityMap.size) return null;
    const targetRestaurantId = String(restaurantId || "").trim();
    let best = null;
    let bestScore = -1;
    state.postEntityMap.forEach((candidate) => {
      if (!candidate || String(candidate?.id || "").trim() !== safePostId) return;
      const candidateRestaurantId = String(
        candidate?.restaurantId
        || (candidate?.ownerType === "restaurant" ? candidate?.ownerId : "")
        || candidate?.rid
        || ""
      ).trim();
      const sameRestaurantBonus = targetRestaurantId && candidateRestaurantId === targetRestaurantId ? 1000000 : 0;
      const contentScore = [
        candidate?.caption,
        candidate?.content,
        candidate?.url,
        candidate?.image,
        candidate?.title
      ].reduce((sum, entry) => (String(entry || "").trim() ? sum + 1 : sum), 0);
      const freshnessScore = Math.max(
        toTimestampMs(candidate?.updatedAt),
        toTimestampMs(candidate?.updatedAtClient),
        toTimestampMs(candidate?.createdAtClient),
        toTimestampMs(candidate?.createdAt)
      );
      const score = sameRestaurantBonus + freshnessScore + (contentScore * 10);
      if (!best || score > bestScore) {
        best = candidate;
        bestScore = score;
      }
    });
    return best;
  }

  function normalizeFeedPost(row = {}) {
    const restaurantId = String(row?.rid || row?.restaurantId || "").trim();
    if (isForceHiddenBusinessEntity({ id: restaurantId, restaurantId, ...(row || {}) })) return null;
    if (!canShowFeedRestaurantId(restaurantId)) return null;
    const canonicalPost = resolveCanonicalPostById(row?.id, restaurantId);
    const restaurant = (state?.restaurants || []).find((entry) => entry?.id === restaurantId) || {};
    const thumb = row?.thumbUrl || row?.mediaUrl || row?.media?.[0]?.thumbUrl || row?.media?.[0]?.url || "";
    const rowLogo = row?.logoUrl || row?.logo || row?.logoURL || "";
    const caption = String(
      canonicalPost?.content
      || canonicalPost?.caption
      || row?.caption
      || row?.content
      || row?.captionShort
      || ""
    ).trim();
    const image = String(
      canonicalPost?.image
      || canonicalPost?.url
      || row?.imageUrl
      || thumb
      || ""
    ).trim();
    const postId = String(row?.id || canonicalPost?.id || "").trim();
    return {
      id: postId,
      restaurantId,
      business: row?.businessName || row?.restaurantName || restaurant?.name || restaurant?.restaurantName || "Business",
      logo: restaurant?.logoUrl || restaurant?.logo || rowLogo || "",
      location: row?.city || restaurant?.city || "",
      content: caption,
      image,
      likes: Number(row?.likesCount ?? row?.likes ?? canonicalPost?.likes ?? 0) || 0,
      comments: Number(row?.commentsCount ?? row?.comments ?? canonicalPost?.comments ?? 0) || 0,
      time: formatRelative(toDateSafe(canonicalPost?.createdAt || row?.createdAt)),
      createdAt: canonicalPost?.createdAt || row?.createdAt,
      updatedAt: row?.updatedAt || canonicalPost?.updatedAt || canonicalPost?.updatedAtClient || row?.createdAt,
      category: row?.postType || "food",
      isLive: row?.isLive || false,
      ownerType: "restaurant",
      ownerId: restaurantId,
      truthSource: "feed-projection",
      canonicalPath: String(
        row?.canonicalPath
        || (restaurantId && postId ? `restaurants/${restaurantId}/socialPosts/${postId}` : "")
      ).trim()
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
