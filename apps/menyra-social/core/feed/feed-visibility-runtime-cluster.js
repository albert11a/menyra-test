import { buildStoriesSignatureCore } from "./feed-story-utils.js";
import { normalizeUserPostDocCore } from "./post-doc-normalize-utils.js";
import { projectPostCollectionThroughEntityMap } from "../profile/post-entity-registry-utils.js";

const FEED_COUNTRY_CODE_ALIASES = new Map([
  ["xk", "xk"],
  ["kosove", "xk"],
  ["kosova", "xk"],
  ["kosovo", "xk"],
  ["al", "al"],
  ["shqiperi", "al"],
  ["shqiperia", "al"],
  ["albania", "al"],
  ["rs", "rs"],
  ["serbi", "rs"],
  ["serbia", "rs"],
  ["srbija", "rs"]
]);
const FEED_COUNTRY_LABEL_BY_CODE = Object.freeze({
  xk: "Kosove",
  al: "Shqiperi",
  rs: "Serbi"
});

function normalizeLocationToken(value = "") {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeFeedCountryCode(value = "") {
  const normalized = normalizeLocationToken(value);
  if (!normalized) return "";
  return FEED_COUNTRY_CODE_ALIASES.get(normalized) || "";
}

function normalizeFeedCoordPair(latValue, lngValue) {
  const lat = Number(latValue);
  const lng = Number(lngValue);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  if (Math.abs(lat) < 0.000001 && Math.abs(lng) < 0.000001) return null;
  if (Math.abs(lat) <= 90 && Math.abs(lng) <= 180) return { lat, lng };
  if (Math.abs(lat) <= 180 && Math.abs(lng) <= 90) return { lat: lng, lng: lat };
  return null;
}

function readFeedCoords(record = {}) {
  if (!record || typeof record !== "object") return null;
  return normalizeFeedCoordPair(record.lat, record.lng)
    || normalizeFeedCoordPair(record.latitude, record.longitude)
    || normalizeFeedCoordPair(record.gpsLat, record.gpsLng)
    || normalizeFeedCoordPair(record.geo?.lat, record.geo?.lng)
    || normalizeFeedCoordPair(record.geo?.latitude, record.geo?.longitude)
    || normalizeFeedCoordPair(record.coords?.lat, record.coords?.lng)
    || normalizeFeedCoordPair(record.coords?.latitude, record.coords?.longitude)
    || normalizeFeedCoordPair(record.location?.lat, record.location?.lng);
}

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
    const coords = readFeedCoords(restaurant) || readFeedCoords(row) || readFeedCoords(canonicalPost);
    const countryCode = normalizeFeedCountryCode(
      restaurant?.countryCode
      || restaurant?.country_code
      || restaurant?.country
      || row?.countryCode
      || row?.country_code
      || row?.country
      || canonicalPost?.countryCode
      || canonicalPost?.country
    );
    const country = countryCode
      ? (FEED_COUNTRY_LABEL_BY_CODE[countryCode] || "")
      : String(
        restaurant?.country
        || row?.country
        || canonicalPost?.country
        || ""
      ).trim();
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
    const mediaType = String(canonicalPost?.mediaType || row?.mediaType || row?.media?.[0]?.type || "").trim().toLowerCase();
    const rawMediaUrl = String(canonicalPost?.url || row?.mediaUrl || row?.media?.[0]?.url || "").trim();
    const isVideo = mediaType === "video" || row?.isVideo === true || /\.(mp4|webm|mov|m3u8)(\?|$)/i.test(rawMediaUrl);
    const videoUrl = isVideo ? rawMediaUrl : "";
    const poster = String(row?.thumbUrl || row?.media?.[0]?.thumbUrl || canonicalPost?.thumbUrl || "").trim();
    return {
      id: postId,
      restaurantId,
      isVideo,
      videoUrl,
      poster,
      business: row?.businessName || row?.restaurantName || restaurant?.name || restaurant?.restaurantName || "Business",
      logo: restaurant?.logoUrl || restaurant?.logo || rowLogo || "",
      location: row?.city || restaurant?.city || "",
      country,
      countryCode,
      lat: coords?.lat ?? null,
      lng: coords?.lng ?? null,
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
        const constraints = [orderBy("createdAt", "desc")];
        if (limit && constants.fastLimits?.userPosts) constraints.push(limit(constants.fastLimits.userPosts));
        const orderedQuery = query
          ? query(ref, ...constraints)
          : ref;
        snap = await getDocs(orderedQuery);
      } catch (_err) {
        const fallbackLimit = Number(constants.fastLimits?.userPosts) || 24;
        snap = (query && limit)
          ? await getDocs(query(ref, limit(fallbackLimit)))
          : await getDocs(ref);
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
    } catch {
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
