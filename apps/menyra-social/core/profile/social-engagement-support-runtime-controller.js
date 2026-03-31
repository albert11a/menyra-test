import {
  renderCommentItemCore,
  renderPostCommentsCore,
  renderMenuCommentItemCore,
  renderMenuDetailCommentsCore
} from "../overlays/overlay-comment-render-utils.js";
import {
  updatePostModalCountsOnlyCore,
  updatePostModalCommentsOnlyCore
} from "../overlays/post-modal-update-utils.js";
import {
  updateMenuDetailCountsOnlyCore,
  updateMenuDetailCommentsOnlyCore
} from "../overlays/menu-detail-update-utils.js";

export function createSocialEngagementSupportRuntimeController(deps = {}) {
  const state = deps.state;
  const db = deps.db;
  const docObj = deps.documentObj || (typeof document !== "undefined" ? document : null);
  const win = deps.windowObj || (typeof window !== "undefined" ? window : null);
  const doc = typeof deps.docFn === "function" ? deps.docFn : (() => null);
  const setDoc = typeof deps.setDocFn === "function" ? deps.setDocFn : async () => {};
  const deleteDoc = typeof deps.deleteDocFn === "function" ? deps.deleteDocFn : async () => {};
  const serverTimestamp = typeof deps.serverTimestampFn === "function"
    ? deps.serverTimestampFn
    : (() => null);
  const confirmFn = typeof deps.confirmFn === "function" ? deps.confirmFn : (() => false);
  const render = typeof deps.renderFn === "function" ? deps.renderFn : (() => {});
  const readCache = typeof deps.readCacheFn === "function" ? deps.readCacheFn : (() => null);
  const writeCache = typeof deps.writeCacheFn === "function" ? deps.writeCacheFn : (() => {});
  const saveFeedPosts = typeof deps.saveFeedPostsFn === "function" ? deps.saveFeedPostsFn : (() => {});
  const userPostsKey = typeof deps.userPostsKeyFn === "function" ? deps.userPostsKeyFn : (() => "");
  const businessPostsKey = typeof deps.businessPostsKeyFn === "function" ? deps.businessPostsKeyFn : (() => "");
  const CACHE_KEYS = deps.cacheKeys || {};
  const getRestaurantMetaById = typeof deps.getRestaurantMetaByIdFn === "function"
    ? deps.getRestaurantMetaByIdFn
    : (() => null);
  const resolvePreferredHandle = typeof deps.resolvePreferredHandleFn === "function"
    ? deps.resolvePreferredHandleFn
    : ((profile, fallback = "") => String(profile?.handle || fallback || "").trim());
  const normalizeRestaurantType = typeof deps.normalizeRestaurantTypeFn === "function"
    ? deps.normalizeRestaurantTypeFn
    : ((value) => String(value || "").trim().toLowerCase());
  const getMenuItemImages = typeof deps.getMenuItemImagesFn === "function"
    ? deps.getMenuItemImagesFn
    : (() => []);
  const resolveMenuItemHero = typeof deps.resolveMenuItemHeroFn === "function"
    ? deps.resolveMenuItemHeroFn
    : (() => "");
  const clampCropPercent = typeof deps.clampCropPercentFn === "function"
    ? deps.clampCropPercentFn
    : ((value, fallback = 50) => {
      const numeric = Number(value);
      if (!Number.isFinite(numeric)) return fallback;
      return Math.max(0, Math.min(100, numeric));
    });
  const formatCount = typeof deps.formatCountFn === "function" ? deps.formatCountFn : ((value) => String(value || 0));
  const icon = typeof deps.iconFn === "function" ? deps.iconFn : (() => "");
  const escapeHtml = typeof deps.escapeHtmlFn === "function" ? deps.escapeHtmlFn : ((value) => String(value || ""));
  const toDateSafe = typeof deps.toDateSafeFn === "function"
    ? deps.toDateSafeFn
    : ((value) => {
      try {
        return value ? new Date(value) : null;
      } catch {
        return null;
      }
    });
  const currentUserBadge = typeof deps.currentUserBadgeFn === "function"
    ? deps.currentUserBadgeFn
    : (() => ({ uid: "", name: "User", handle: "user", avatar: "" }));
  const normalizeHandle = typeof deps.normalizeHandleFn === "function"
    ? deps.normalizeHandleFn
    : ((value) => String(value || "").replace(/^@/, "").trim().toLowerCase());
  const resolveCommentAvatar = typeof deps.resolveCommentAvatarFn === "function"
    ? deps.resolveCommentAvatarFn
    : (() => "");
  const getSelfAvatarUrl = typeof deps.getSelfAvatarUrlFn === "function"
    ? deps.getSelfAvatarUrlFn
    : (() => "");
  const isPlaceholderUrl = typeof deps.isPlaceholderUrlFn === "function"
    ? deps.isPlaceholderUrlFn
    : (() => false);
  const scheduleCommentAvatarFetch = typeof deps.scheduleCommentAvatarFetchFn === "function"
    ? deps.scheduleCommentAvatarFetchFn
    : (() => {});
  const applyCommentAvatarCache = typeof deps.applyCommentAvatarCacheFn === "function"
    ? deps.applyCommentAvatarCacheFn
    : (() => {});
  const hydrateCommentAvatars = typeof deps.hydrateCommentAvatarsFn === "function"
    ? deps.hydrateCommentAvatarsFn
    : (() => {});
  const highlightCommentInModal = typeof deps.highlightCommentInModalFn === "function"
    ? deps.highlightCommentInModalFn
    : (() => {});
  const getPendingCommentHighlight = typeof deps.getPendingCommentHighlightFn === "function"
    ? deps.getPendingCommentHighlightFn
    : (() => null);
  const setPendingCommentHighlight = typeof deps.setPendingCommentHighlightFn === "function"
    ? deps.setPendingCommentHighlightFn
    : (() => {});
  const getModalCommentsUnsub = typeof deps.getModalCommentsUnsubFn === "function"
    ? deps.getModalCommentsUnsubFn
    : (() => null);
  const placeholderImage = String(deps.placeholderImage || "").trim();
  const isLocalBusinessProfile = typeof deps.isLocalBusinessProfileFn === "function"
    ? deps.isLocalBusinessProfileFn
    : (() => false);

  function formatDateLabel(value) {
    const date = toDateSafe(value) || new Date();
    return date.toLocaleDateString("de-DE", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  }

  function formatDateTimeLabel(value) {
    const date = toDateSafe(value) || new Date();
    return date.toLocaleString("de-DE", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  }

  function ensurePostMeta(postId) {
    if (!postId) return { likes: [], comments: [] };
    if (!state.postMeta[postId]) {
      state.postMeta[postId] = { likes: [], comments: [] };
    }
    return state.postMeta[postId];
  }

  function getMenuItemSocialId(item) {
    const raw = item?.id || item?.menuItemId || item?.menuId || "";
    const name = String(item?.name || "").trim();
    const category = String(item?.category || "").trim();
    const price = String(item?.price ?? "").trim();
    const base = raw || [name, category, price].filter(Boolean).join("|");
    if (!base) return "";
    return encodeURIComponent(String(base));
  }

  function menuItemMetaKey(restaurantId, itemId) {
    if (!restaurantId || !itemId) return "";
    return `${restaurantId}::${itemId}`;
  }

  function getMenuDetailRestaurantId(item = state.menuDetail?.item) {
    return String(
      state.menuDetail?.restaurantId
      || item?.restaurantId
      || state.menu.restaurantId
      || state.profileView?.profile?.restaurantId
      || state.userProfile.restaurantId
      || ""
    ).trim();
  }

  function getMenuItemSocialDocRef(item, restaurantIdOverride = "") {
    const restaurantId = restaurantIdOverride
      || state.menu.restaurantId
      || state.profileView?.profile?.restaurantId
      || state.userProfile.restaurantId
      || "";
    const itemId = getMenuItemSocialId(item);
    if (!restaurantId || !itemId) return null;
    return doc(db, "restaurants", restaurantId, "menuSocial", itemId);
  }

  function favoriteMenuItemDocId(restaurantId, itemId) {
    const safeRestaurantId = encodeURIComponent(String(restaurantId || "").trim());
    const safeItemId = String(itemId || "").trim();
    if (!safeRestaurantId || !safeItemId) return "";
    return `${safeRestaurantId}__${safeItemId}`;
  }

  function buildFavoriteMenuItemPayload(item, restaurantId, { includeServerTimestamp = false } = {}) {
    const safeRestaurantId = String(restaurantId || "").trim();
    const itemId = getMenuItemSocialId(item);
    const profileMatch = state.profileView?.profile?.restaurantId === safeRestaurantId
      ? state.profileView.profile
      : (state.userProfile?.restaurantId === safeRestaurantId ? state.userProfile : null);
    const restaurantMeta = getRestaurantMetaById(safeRestaurantId) || {};
    const images = getMenuItemImages(item);
    const nowIso = new Date().toISOString();
    const catalogType = normalizeRestaurantType(
      profileMatch?.type
      || profileMatch?.customerType
      || profileMatch?.category
      || profileMatch?.kind
      || profileMatch?.restaurantType
      || restaurantMeta?.type
      || restaurantMeta?.customerType
      || restaurantMeta?.category
      || restaurantMeta?.kind
      || restaurantMeta?.restaurantType
      || item?.restaurantType
      || item?.customerType
      || "ecommerce"
    ) || "ecommerce";
    return {
      restaurantId: safeRestaurantId,
      itemId,
      restaurantName: String(
        profileMatch?.name
        || restaurantMeta?.name
        || restaurantMeta?.restaurantName
        || "Shop"
      ).trim() || "Shop",
      restaurantAvatar: String(
        profileMatch?.avatar
        || restaurantMeta?.logoUrl
        || restaurantMeta?.logo
        || ""
      ).trim(),
      type: item?.type || "food",
      category: String(item?.category || "").trim(),
      name: String(item?.name || "Produkt").trim() || "Produkt",
      description: String(item?.description || "").trim(),
      ingredients: String(item?.ingredients || item?.ingredient || item?.inhaltsstoffe || "").trim(),
      longDescription: String(item?.longDescription || "").trim(),
      allergens: String(item?.allergens || "").trim(),
      brand: String(item?.brand || "").trim(),
      sku: String(item?.sku || "").trim(),
      stock: (() => {
        const stockRaw = item?.stock;
        const stockValue = typeof stockRaw === "string" ? stockRaw.trim() : stockRaw;
        if (stockValue === "" || stockValue === null || stockValue === undefined) return null;
        const parsedStock = Number(stockValue);
        return Number.isFinite(parsedStock) ? Math.max(0, parsedStock) : null;
      })(),
      sizes: Array.isArray(item?.sizes) ? item.sizes : [],
      colors: Array.isArray(item?.colors) ? item.colors : [],
      cropX: clampCropPercent(item?.cropX ?? 50, 50),
      cropY: clampCropPercent(item?.cropY ?? 50, 50),
      price: item?.price ?? "",
      available: item?.available !== false,
      cardStyle: String(item?.cardStyle || "").trim(),
      catalogMode: "shop",
      restaurantType: catalogType,
      customerType: catalogType,
      imageUrl: images[0] || resolveMenuItemHero(item) || "",
      imageUrls: images,
      savedAtClient: nowIso,
      ...(includeServerTimestamp ? { savedAt: serverTimestamp() } : {})
    };
  }

  function ensureMenuItemMeta(key) {
    if (!key) return { likes: [], comments: [], counts: { likes: 0, comments: 0 } };
    if (!state.menuItemMeta[key]) {
      state.menuItemMeta[key] = { likes: [], comments: [], counts: { likes: 0, comments: 0 } };
    } else if (!state.menuItemMeta[key].counts) {
      state.menuItemMeta[key].counts = { likes: 0, comments: 0 };
    }
    return state.menuItemMeta[key];
  }

  function resolveMenuItemCounts(meta) {
    const rawLikes = Number.isFinite(Number(meta?.counts?.likes)) ? Number(meta.counts.likes) : null;
    const rawComments = Number.isFinite(Number(meta?.counts?.comments)) ? Number(meta.counts.comments) : null;
    const likeFromList = meta?.likes?.length ?? 0;
    const commentFromList = meta?.comments?.length ?? 0;
    const likes = Math.max(rawLikes ?? 0, likeFromList);
    const comments = Math.max(rawComments ?? 0, commentFromList);
    return { likes, comments };
  }

  function escapeSelector(value) {
    const str = String(value);
    if (typeof CSS !== "undefined" && typeof CSS.escape === "function") {
      return CSS.escape(str);
    }
    return str.replace(/["\\]/g, "\\$&");
  }

  function updateMenuCardCountNodes(itemId, counts = { likes: 0, comments: 0 }) {
    if (!itemId || !docObj) return;
    const safeId = escapeSelector(itemId);
    const likesLabel = formatCount(counts.likes ?? 0);
    const commentsLabel = formatCount(counts.comments ?? 0);
    docObj.querySelectorAll(`[data-menu-like-count="${safeId}"]`).forEach((el) => {
      el.textContent = likesLabel;
    });
    docObj.querySelectorAll(`[data-menu-comment-count="${safeId}"]`).forEach((el) => {
      el.textContent = commentsLabel;
    });
  }

  function updateMenuCardLikeButtons(itemId, isLiked = false) {
    if (!itemId || !docObj) return;
    const safeId = escapeSelector(itemId);
    const supportsHover = !!docObj.defaultView?.matchMedia?.("(hover: hover)")?.matches;
    docObj.querySelectorAll(`[data-menu-card-like="${safeId}"]`).forEach((btn) => {
      btn.classList.toggle("text-rose-500", !!isLiked);
      btn.classList.toggle("text-slate-300", !isLiked);
      btn.classList.toggle("hover:text-rose-500", !isLiked && supportsHover);
      btn.dataset.menuCardLiked = isLiked ? "1" : "0";
      btn.setAttribute("aria-pressed", isLiked ? "true" : "false");
    });
  }

  function primeMenuItemCounts(items, restaurantId) {
    if (!restaurantId) return;
    const list = Array.isArray(items) ? items : [];
    list.forEach((item) => {
      const itemId = getMenuItemSocialId(item);
      if (!itemId) return;
      const key = menuItemMetaKey(restaurantId, itemId);
      if (!key) return;
      const meta = ensureMenuItemMeta(key);
      meta.counts = {
        likes: Number(item?.likesCount ?? item?.likes ?? meta.counts?.likes ?? 0) || 0,
        comments: Number(item?.commentsCount ?? item?.comments ?? meta.counts?.comments ?? 0) || 0
      };
      state.menuItemMeta[key] = meta;
      updateMenuCardCountNodes(itemId, resolveMenuItemCounts(meta));
    });
  }

  function getMenuDetailContext() {
    if (!state.menuDetail?.open || !state.menuDetail?.item) return null;
    const item = state.menuDetail.item;
    const restaurantId = getMenuDetailRestaurantId(item);
    const itemId = getMenuItemSocialId(item);
    if (!restaurantId || !itemId) return null;
    const key = menuItemMetaKey(restaurantId, itemId);
    const ref = doc(db, "restaurants", restaurantId, "menuSocial", itemId);
    return { item, restaurantId, itemId, key, ref };
  }

  function buildCatalogProfileForRestaurant(restaurantId = "", fallback = {}) {
    const safeRestaurantId = String(restaurantId || fallback?.restaurantId || "").trim();
    if (!safeRestaurantId) return fallback || {};
    if (String(state.profileView?.profile?.restaurantId || "").trim() === safeRestaurantId) {
      return state.profileView.profile;
    }
    if (String(state.userProfile?.restaurantId || "").trim() === safeRestaurantId) {
      return state.userProfile;
    }
    const restaurant = getRestaurantMetaById(safeRestaurantId) || {};
    const displayName = String(
      restaurant?.name
      || restaurant?.restaurantName
      || fallback?.restaurantName
      || fallback?.name
      || "Shop"
    ).trim() || "Shop";
    const explicitCatalogMode = String(
      fallback?.catalogMode
      || restaurant?.catalogMode
      || restaurant?.catalog
      || ""
    ).trim().toLowerCase();
    const fallbackCatalogMode = String(fallback?.catalogMode || "").trim().toLowerCase();
    const type = explicitCatalogMode === "shop"
      ? "ecommerce"
      : normalizeRestaurantType(
        restaurant?.type
        || restaurant?.customerType
        || restaurant?.category
        || restaurant?.kind
        || restaurant?.restaurantType
        || fallback?.type
        || fallback?.customerType
        || fallback?.restaurantType
        || (fallbackCatalogMode === "shop" ? "ecommerce" : "")
      );
    return {
      name: displayName,
      handle: resolvePreferredHandle({
        handle: restaurant?.handle || fallback?.handle || "",
        name: displayName
      }, displayName),
      uid: String(restaurant?.ownerUid || restaurant?.ownerId || fallback?.uid || "").trim(),
      bio: String(restaurant?.description || restaurant?.bio || fallback?.description || "").trim(),
      avatar: String(
        restaurant?.logoUrl
        || restaurant?.logo
        || fallback?.restaurantAvatar
        || fallback?.avatar
        || ""
      ).trim(),
      location: String(restaurant?.city || restaurant?.location || fallback?.location || "").trim(),
      followers: Number(restaurant?.followersCount ?? restaurant?.followers ?? fallback?.followers ?? 0) || 0,
      following: Number(restaurant?.followingCount ?? restaurant?.following ?? fallback?.following ?? 0) || 0,
      privateAccount: false,
      role: "business",
      catalogMode: explicitCatalogMode || (type === "ecommerce" ? "shop" : "menu"),
      restaurantId: safeRestaurantId,
      ...(type ? { type, customerType: type } : {})
    };
  }

  function getMenuDetailCatalogProfile(item = state.menuDetail?.item) {
    const restaurantId = getMenuDetailRestaurantId(item);
    if (!restaurantId) return state.profileView?.profile || state.userProfile;
    return buildCatalogProfileForRestaurant(restaurantId, item || {});
  }

  function toTimestampMs(value) {
    if (!value) return 0;
    try {
      if (typeof value?.toDate === "function") return value.toDate()?.getTime?.() || 0;
      if (value instanceof Date) return value.getTime() || 0;
      if (typeof value === "number") return Number.isFinite(value) ? value : 0;
      return toDateSafe(value)?.getTime?.() || 0;
    } catch {
      return 0;
    }
  }

  function getPostTruthScore(post = {}) {
    if (!post || typeof post !== "object") return 0;
    const freshnessScore = Math.max(
      toTimestampMs(post.updatedAt),
      toTimestampMs(post.updatedAtClient),
      toTimestampMs(post.createdAtClient),
      toTimestampMs(post.createdAt)
    );
    const contentScore = [
      post.content,
      post.caption,
      post.url,
      post.image,
      post.title,
      post.business,
      post.logo
    ].reduce((sum, value) => (String(value || "").trim() ? sum + 1 : sum), 0);
    const ownerScore = post.ownerType && post.ownerId ? 100 : 0;
    return freshnessScore + (contentScore * 10) + ownerScore;
  }

  function collectPostTargets(postId) {
    const safePostId = String(postId || "").trim();
    if (!safePostId) return [];
    const unique = new Set();
    const targets = [];
    const push = (candidate) => {
      if (!candidate || String(candidate?.id || "").trim() !== safePostId || unique.has(candidate)) return;
      unique.add(candidate);
      targets.push(candidate);
    };
    push(state.postModal?.post);
    [
      state.userPosts,
      state.businessPosts,
      state.feedPosts,
      state.profileView?.posts,
      state.profileModal?.profile?.posts
    ].forEach((list) => {
      if (!Array.isArray(list)) return;
      list.forEach((candidate) => push(candidate));
    });
    return targets;
  }

  function pickCanonicalPostCandidate(postId, preferred = null) {
    const candidates = [...collectPostTargets(postId)];
    if (preferred && String(preferred?.id || "").trim() === String(postId || "").trim()) {
      candidates.push(preferred);
    }
    if (!candidates.length) return null;
    return candidates
      .slice()
      .sort((a, b) => getPostTruthScore(b) - getPostTruthScore(a))[0];
  }

  function mergePostTruthIntoTarget(target, canonical) {
    if (!target || !canonical) return;
    const canonicalCaption = String(canonical.caption || canonical.content || "").trim();
    const canonicalContent = String(canonical.content || canonical.caption || "").trim();
    const canonicalUrl = String(canonical.url || canonical.image || "").trim();
    const canonicalImage = String(canonical.image || canonical.url || "").trim();
    if (canonical.ownerType && canonical.ownerId) {
      target.ownerType = canonical.ownerType;
      target.ownerId = canonical.ownerId;
    }
    if (canonical.restaurantId) target.restaurantId = canonical.restaurantId;
    if (canonical.uid) target.uid = canonical.uid;
    if (canonical.userId) target.userId = canonical.userId;
    if (canonicalCaption) target.caption = canonicalCaption;
    if (canonicalContent) target.content = canonicalContent;
    if (canonicalUrl) target.url = canonicalUrl;
    if (canonicalImage) target.image = canonicalImage;
    if (String(canonical.title || "").trim()) target.title = canonical.title;
    if (String(canonical.type || "").trim()) target.type = canonical.type;
    if (String(canonical.category || "").trim()) target.category = canonical.category;
    if (String(canonical.business || "").trim()) target.business = canonical.business;
    if (String(canonical.logo || "").trim()) target.logo = canonical.logo;
    if (String(canonical.location || "").trim()) target.location = canonical.location;
    if (canonical.createdAt) target.createdAt = canonical.createdAt;
    if (canonical.updatedAt) target.updatedAt = canonical.updatedAt;
    if (canonical.updatedAtClient) target.updatedAtClient = canonical.updatedAtClient;
    target.likes = Math.max(0, Number(canonical.likes ?? target.likes ?? 0) || 0);
    target.comments = Math.max(0, Number(canonical.comments ?? target.comments ?? 0) || 0);
    target.isVideo = !!(canonical.isVideo ?? target.isVideo);
  }

  function resolvePostCounts(post) {
    const likeCount = typeof post.likes === "number" ? post.likes : Number(post.likes) || 0;
    const commentCount = typeof post.comments === "number" ? post.comments : Number(post.comments) || 0;
    return { likeLabel: String(likeCount), commentLabel: String(commentCount) };
  }

  function updatePostCountNodes(post) {
    if (!post?.id || !docObj) return;
    const postId = escapeSelector(post.id);
    const likeLabel = formatCount(post.likes);
    const commentLabel = formatCount(post.comments);
    const meta = ensurePostMeta(post.id);
    const userBadge = currentUserBadge();
    const isLiked = !!meta.likes?.some((item) => item.uid === userBadge.uid || item.handle === userBadge.handle);
    docObj.querySelectorAll(`[data-post-like-count="${postId}"]`).forEach((el) => {
      el.textContent = likeLabel;
    });
    docObj.querySelectorAll(`[data-post-comment-count="${postId}"]`).forEach((el) => {
      el.textContent = commentLabel;
    });
    docObj.querySelectorAll(`[data-post-like-btn="${postId}"]`).forEach((btn) => {
      btn.classList.toggle("text-rose-400", isLiked);
      btn.classList.toggle("text-white/80", !isLiked);
      btn.setAttribute("aria-pressed", isLiked ? "true" : "false");
    });
  }

  function updatePostCaches(post) {
    if (!post?.id) return;
    const postId = String(post.id);
    const canonical = pickCanonicalPostCandidate(postId, post) || post;
    collectPostTargets(postId).forEach((target) => mergePostTruthIntoTarget(target, canonical));
    if (state.postModal?.post && String(state.postModal.post.id || "").trim() === postId) {
      mergePostTruthIntoTarget(state.postModal.post, canonical);
    }
    const inUser = state.userPosts.some((item) => String(item.id) === postId);
    const inBusiness = state.businessPosts.some((item) => String(item.id) === postId);
    const inFeed = state.feedPosts.some((item) => String(item.id) === postId);
    if (inUser && state.user?.uid) writeCache(userPostsKey(state.user.uid), state.userPosts);
    if (inBusiness && state.userProfile.restaurantId) {
      writeCache(businessPostsKey(state.userProfile.restaurantId), state.businessPosts);
    }
    if (inFeed) {
      const cached = readCache(CACHE_KEYS.feed);
      saveFeedPosts(state.feedPosts, { lastDeltaCheck: cached?.meta?.lastDeltaCheck || 0 });
    }
  }

  function findPostById(postId) {
    const safePostId = String(postId || "").trim();
    if (!safePostId) return null;
    const canonical = pickCanonicalPostCandidate(safePostId);
    if (!canonical) return null;
    collectPostTargets(safePostId).forEach((target) => mergePostTruthIntoTarget(target, canonical));
    if (state.postModal?.post && String(state.postModal.post.id || "").trim() === safePostId) {
      mergePostTruthIntoTarget(state.postModal.post, canonical);
    }
    return canonical;
  }

  function ensureCommentShape(comment) {
    const rawLikes = Array.isArray(comment.likes) ? comment.likes : [];
    const likesCount = Number.isFinite(Number(comment.likesCount)) ? Number(comment.likesCount) : rawLikes.length;
    const avatar = comment.avatar || comment.avatarUrl || comment.avatarURL || comment.photoURL || "";
    const avatarUrl = comment.avatarUrl || comment.avatarURL || "";
    return {
      id: comment.id,
      uid: comment.uid || "",
      author: comment.author || "User",
      handle: comment.handle || "user",
      avatar,
      avatarUrl,
      text: comment.text || "",
      createdAt: comment.createdAt || new Date().toISOString(),
      likesCount,
      replies: (comment.replies || []).map((reply) => ({
        id: reply.id,
        uid: reply.uid || "",
        author: reply.author || "User",
        handle: reply.handle || "user",
        avatar: reply.avatar || reply.avatarUrl || reply.avatarURL || reply.photoURL || "",
        avatarUrl: reply.avatarUrl || reply.avatarURL || "",
        text: reply.text || "",
        createdAt: reply.createdAt || new Date().toISOString(),
        likesCount: Number.isFinite(Number(reply.likesCount))
          ? Number(reply.likesCount)
          : (Array.isArray(reply.likes) ? reply.likes.length : 0)
      }))
    };
  }

  function renderCommentItem(postId, comment, parentId = "") {
    return renderCommentItemCore({
      postId,
      comment,
      parentId,
      state,
      normalizeHandle,
      resolveCommentAvatar,
      getSelfAvatarUrl,
      isPlaceholderUrl,
      scheduleCommentAvatarFetch,
      placeholderImage,
      escapeHtml,
      formatDateTimeLabel,
      icon
    });
  }

  function renderPostComments(comments) {
    return renderPostCommentsCore({
      state,
      comments,
      hasLiveComments: typeof getModalCommentsUnsub() === "function",
      renderCommentItemFn: renderCommentItem
    });
  }

  function renderMenuCommentItem(comment) {
    return renderMenuCommentItemCore({
      comment,
      normalizeHandle,
      resolveCommentAvatar,
      isPlaceholderUrl,
      scheduleCommentAvatarFetch,
      placeholderImage,
      escapeHtml,
      formatDateTimeLabel
    });
  }

  function renderMenuDetailComments(comments) {
    return renderMenuDetailCommentsCore({
      state,
      comments,
      renderMenuCommentItemFn: renderMenuCommentItem
    });
  }

  function updatePostModalMeta() {
    if (!state.postModal.open || !state.postModal.post) return;
    updatePostModalCountsOnly();
    updatePostModalCommentsOnly();
  }

  function updatePostModalCountsOnly() {
    return updatePostModalCountsOnlyCore({
      state,
      documentObj: docObj,
      windowObj: win,
      ensurePostMetaFn: ensurePostMeta,
      currentUserBadgeFn: currentUserBadge,
      formatCountFn: formatCount,
      iconFn: icon
    });
  }

  function updatePostModalCommentsOnly() {
    return updatePostModalCommentsOnlyCore({
      state,
      documentObj: docObj,
      windowObj: win,
      ensurePostMetaFn: ensurePostMeta,
      ensureCommentShapeFn: ensureCommentShape,
      renderPostCommentsFn: renderPostComments,
      applyCommentAvatarCacheFn: applyCommentAvatarCache,
      hydrateCommentAvatarsFn: hydrateCommentAvatars,
      getPendingCommentHighlightFn: getPendingCommentHighlight,
      setPendingCommentHighlightFn: setPendingCommentHighlight,
      highlightCommentInModalFn: highlightCommentInModal
    });
  }

  function updateMenuDetailMeta() {
    if (!state.menuDetail.open || !state.menuDetail.item) return;
    updateMenuDetailCountsOnly();
    updateMenuDetailCommentsOnly();
  }

  function updateMenuDetailCountsOnly() {
    return updateMenuDetailCountsOnlyCore({
      state,
      documentObj: docObj,
      windowObj: win,
      getMenuDetailContextFn: getMenuDetailContext,
      ensureMenuItemMetaFn: ensureMenuItemMeta,
      resolveMenuItemCountsFn: resolveMenuItemCounts,
      currentUserBadgeFn: currentUserBadge,
      formatCountFn: formatCount,
      iconFn: icon
    });
  }

  function updateMenuDetailCommentsOnly() {
    return updateMenuDetailCommentsOnlyCore({
      state,
      documentObj: docObj,
      windowObj: win,
      getMenuDetailContextFn: getMenuDetailContext,
      ensureMenuItemMetaFn: ensureMenuItemMeta,
      ensureCommentShapeFn: ensureCommentShape,
      renderMenuDetailCommentsFn: renderMenuDetailComments,
      applyCommentAvatarCacheFn: applyCommentAvatarCache
    });
  }

  function updateCommentLikeButton(postId, commentId, replyId, likeCount) {
    if (!postId || !commentId || !docObj) return;
    const safePost = escapeSelector(postId);
    const safeComment = escapeSelector(commentId);
    const selector = `[data-comment-like="true"][data-post-id="${safePost}"][data-comment-id="${safeComment}"]`;
    const replyKey = replyId ? String(replyId) : "";
    docObj.querySelectorAll(selector).forEach((btn) => {
      const btnReply = btn.getAttribute("data-reply-id") || "";
      if (replyKey !== btnReply) return;
      btn.innerHTML = `${icon("heart", "w-3 h-3")} ${escapeHtml(String(likeCount))}`;
    });
    if (win?.lucide?.createIcons) win.lucide.createIcons();
  }

  function findProfilePostCardNode(postId) {
    if (!docObj) return null;
    const targetId = String(postId || "");
    const nodes = docObj.querySelectorAll("[data-open-post]");
    for (const node of nodes) {
      if (node.dataset.openPost === targetId) return node;
    }
    return null;
  }

  function findProfilePostToggleButton(card, postId) {
    if (!card) return null;
    const targetId = String(postId || "");
    const nodes = card.querySelectorAll("[data-profile-post-toggle]");
    for (const node of nodes) {
      if (node.dataset.profilePostToggle === targetId) return node;
    }
    return null;
  }

  function updateProfileGridPlaceholder(container) {
    if (!container || !docObj) return false;
    const existing = container.querySelector("[data-profile-grid-placeholder]");
    if (state.profileViewMode !== "grid") {
      if (existing) existing.remove();
      return true;
    }
    let slotCount = 0;
    container.querySelectorAll("[data-open-post]").forEach((node) => {
      slotCount += node.classList.contains("col-span-2") ? 2 : 1;
    });
    const needsPlaceholder = slotCount % 2 === 1;
    if (needsPlaceholder && !existing) {
      const placeholder = docObj.createElement("div");
      placeholder.dataset.profileGridPlaceholder = "true";
      placeholder.className = "col-start-2 aspect-[4/5] rounded-[2rem] invisible pointer-events-none";
      container.prepend(placeholder);
    } else if (!needsPlaceholder && existing) {
      existing.remove();
    }
    return true;
  }

  function updateProfilePostCardDom(postId, nextType) {
    const card = findProfilePostCardNode(postId);
    if (!card) return false;
    const isWide = nextType === "wide" || nextType === "hero";
    const isGrid = state.profileViewMode === "grid";
    card.classList.toggle("col-span-2", isGrid && isWide);
    card.classList.remove("aspect-[1.8/1]", "aspect-[4/5]");
    card.classList.add(isGrid ? (isWide ? "aspect-[1.8/1]" : "aspect-[4/5]") : "aspect-[4/5]");
    const img = card.querySelector("img");
    if (img) {
      img.width = isWide ? 800 : 400;
      img.height = isWide ? 400 : 500;
    }
    const toggleBtn = findProfilePostToggleButton(card, postId);
    if (toggleBtn) {
      toggleBtn.innerHTML = `${icon(isWide ? "minimize-2" : "maximize-2", "w-3.5 h-3.5")} ${isWide ? "Schmaler" : "Breiter"}`;
    }
    updateProfileGridPlaceholder(card.parentElement);
    if (win?.lucide?.createIcons) win.lucide.createIcons();
    return true;
  }

  function getProfilePostList() {
    return isLocalBusinessProfile(state.userProfile) ? state.businessPosts : state.userPosts;
  }

  function findProfilePost(postId) {
    const list = getProfilePostList();
    const idx = list.findIndex((item) => String(item.id) === String(postId));
    return { list, idx, post: idx >= 0 ? list[idx] : null };
  }

  async function updateProfilePostType(postId, nextType) {
    if (!postId || !state.user) return;
    const isBusiness = isLocalBusinessProfile(state.userProfile);
    if (isBusiness) {
      const restaurantId = state.userProfile.restaurantId;
      if (!restaurantId) return;
      await setDoc(doc(db, "restaurants", restaurantId, "socialPosts", postId), { type: nextType }, { merge: true });
      return;
    }
    await setDoc(doc(db, "users", state.user.uid, "posts", postId), { type: nextType }, { merge: true });
  }

  async function toggleProfilePostWidth(postId) {
    if (!postId) return;
    const { post } = findProfilePost(postId);
    if (!post) return;
    const isWide = post.type === "wide" || post.type === "hero";
    const nextType = isWide ? "square" : "wide";
    post.type = nextType;
    state.profilePostMenuId = null;
    setProfileMenuOpen(null);
    const updated = updateProfilePostCardDom(postId, nextType);
    if (!updated && state.activeTab === "profile") {
      render();
    }
    updatePostCaches(post);
    try {
      await updateProfilePostType(postId, nextType);
    } catch (err) {
      console.error(err);
    }
  }

  async function deleteProfilePost(postId) {
    if (!postId || !state.user) return;
    if (!confirmFn("Beitrag wirklich loeschen?")) return;
    const { list, idx } = findProfilePost(postId);
    if (idx < 0) return;
    list.splice(idx, 1);
    state.profilePostMenuId = null;
    render();
    const isBusiness = isLocalBusinessProfile(state.userProfile);
    if (isBusiness) {
      if (state.userProfile.restaurantId) {
        writeCache(businessPostsKey(state.userProfile.restaurantId), state.businessPosts);
      }
    } else if (state.user?.uid) {
      writeCache(userPostsKey(state.user.uid), state.userPosts);
    }
    try {
      if (isBusiness) {
        const restaurantId = state.userProfile.restaurantId;
        if (restaurantId) {
          await deleteDoc(doc(db, "restaurants", restaurantId, "socialPosts", postId));
        }
        await deleteDoc(doc(db, "socialFeed", postId));
      } else {
        await deleteDoc(doc(db, "users", state.user.uid, "posts", postId));
      }
    } catch (err) {
      console.error(err);
    }
  }

  function toggleProfilePostMenu(postId) {
    if (!postId) return;
    const next = String(state.profilePostMenuId) === String(postId) ? null : String(postId);
    state.profilePostMenuId = next;
    setProfileMenuOpen(next);
  }

  function setProfileMenuOpen(postId) {
    if (!docObj) return;
    const menus = docObj.querySelectorAll("[data-profile-menu]");
    const next = postId ? String(postId) : "";
    menus.forEach((menu) => {
      const isOpen = next && menu.dataset.profileMenu === next;
      menu.classList.toggle("hidden", !isOpen);
    });
  }

  return {
    formatDateLabel,
    formatDateTimeLabel,
    ensurePostMeta,
    getMenuItemSocialId,
    menuItemMetaKey,
    getMenuItemSocialDocRef,
    favoriteMenuItemDocId,
    buildFavoriteMenuItemPayload,
    ensureMenuItemMeta,
    resolveMenuItemCounts,
    primeMenuItemCounts,
    getMenuDetailContext,
    getMenuDetailRestaurantId,
    buildCatalogProfileForRestaurant,
    getMenuDetailCatalogProfile,
    resolvePostCounts,
    escapeSelector,
    updatePostCountNodes,
    updatePostCaches,
    findPostById,
    ensureCommentShape,
    renderCommentItem,
    renderPostComments,
    renderMenuCommentItem,
    renderMenuDetailComments,
    updatePostModalMeta,
    updatePostModalCountsOnly,
    updatePostModalCommentsOnly,
    updateMenuDetailMeta,
    updateMenuDetailCountsOnly,
    updateMenuDetailCommentsOnly,
    updateCommentLikeButton,
    updateMenuCardLikeButtons,
    updateMenuCardCountNodes,
    findProfilePostCardNode,
    findProfilePostToggleButton,
    updateProfileGridPlaceholder,
    updateProfilePostCardDom,
    getProfilePostList,
    findProfilePost,
    updateProfilePostType,
    toggleProfilePostWidth,
    deleteProfilePost,
    toggleProfilePostMenu,
    setProfileMenuOpen
  };
}
