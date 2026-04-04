export function createSocialEngagementRuntimeController({
  state = null,
  db = null,
  detailLikesLimit = 12,
  detailCommentsLimit = 8,
  restaurantOwnerCache = null,
  commentAvatarCache = null,
  documentObj = null,
  collectionFn = () => null,
  docFn = () => null,
  getDocFn = async () => ({ exists: () => false, data: () => ({}) }),
  getDocsFn = async () => ({ docs: [] }),
  onSnapshotFn = () => () => {},
  queryFn = (value) => value,
  orderByFn = () => null,
  limitFn = () => null,
  updateDocFn = async () => {},
  writeBatchFn = () => ({
    set: () => {},
    update: () => {},
    commit: async () => {}
  }),
  runTransactionFn = async (_db, runFn) => runFn({
    get: async () => ({ exists: () => false }),
    set: () => {},
    update: () => {},
    delete: () => {}
  }),
  serverTimestampFn = () => null,
  incrementFn = (value) => value,
  openGuestAuthPromptFn = () => {},
  currentUserBadgeFn = () => ({ uid: "", name: "User", handle: "user", avatar: "" }),
  ensurePostMetaFn = () => ({ likes: [], comments: [] }),
  ensureMenuItemMetaFn = () => ({ likes: [], comments: [], counts: { likes: 0, comments: 0 } }),
  resolveMenuItemCountsFn = () => ({ likes: 0, comments: 0 }),
  getMenuDetailContextFn = () => null,
  ensureCommentShapeFn = (comment) => comment,
  updatePostCountNodesFn = () => {},
  updatePostCachesFn = () => {},
  updateMenuCardCountNodesFn = () => {},
  updateMenuCardLikeButtonsFn = () => {},
  updatePostModalMetaFn = () => {},
  updatePostModalCountsOnlyFn = () => {},
  updateMenuDetailCountsOnlyFn = () => {},
  updateMenuDetailCommentsOnlyFn = () => {},
  updateMenuDetailMetaFn = () => {},
  updateCommentLikeButtonFn = () => {},
  ensureSelfAvatarReadyFn = async () => "",
  normalizeHandleFn = (value) => String(value || ""),
  isPlaceholderUrlFn = () => false,
  primeSelfAvatarCacheFn = () => {},
  scheduleCommentAvatarDomUpdateFn = () => {},
  updateCommentAvatarNodesByIdFn = () => {},
  scheduleCommentAvatarFetchFn = () => {},
  hydrateCommentAvatarsFn = () => {},
  refreshSelfCommentAvatarsFn = () => {},
  renderOverlaysFn = () => {},
  updateShellDomFn = () => {},
  pushUserNotificationFn = async () => {},
  updateFavoriteMenuItemsLocalFn = () => {},
  autosizeTextareaFn = () => {},
  favoriteMenuItemDocIdFn = () => "",
  buildFavoriteMenuItemPayloadFn = () => ({}),
  getMenuItemSocialDocRefFn = () => null,
  getMenuItemSocialIdFn = () => "",
  menuItemMetaKeyFn = () => "",
  getLastCommentKeyFn = () => "",
  setLastCommentKeyFn = () => {},
  getLastCommentAtFn = () => 0,
  setLastCommentAtFn = () => {},
  getLastMenuCommentKeyFn = () => "",
  setLastMenuCommentKeyFn = () => {},
  getLastMenuCommentAtFn = () => 0,
  setLastMenuCommentAtFn = () => {},
  getModalPostDocUnsubFn = () => null,
  setModalPostDocUnsubFn = () => {},
  getModalLikesUnsubFn = () => null,
  setModalLikesUnsubFn = () => {},
  getModalCommentsUnsubFn = () => null,
  setModalCommentsUnsubFn = () => {},
  getMenuDetailDocUnsubFn = () => null,
  setMenuDetailDocUnsubFn = () => {},
  getMenuDetailLikesUnsubFn = () => null,
  setMenuDetailLikesUnsubFn = () => {},
  getMenuDetailCommentsUnsubFn = () => null,
  setMenuDetailCommentsUnsubFn = () => {}
} = {}) {
  const noop = () => {};
  const asyncNoop = async () => {};
  const empty = {
    updatePostCounts: asyncNoop,
    addComment: asyncNoop,
    togglePostLike: asyncNoop,
    toggleMenuItemLike: asyncNoop,
    addMenuItemComment: asyncNoop,
    toggleCommentLike: asyncNoop,
    stopPostMetaListeners: noop,
    attachPostMetaListeners: noop,
    stopMenuItemMetaListeners: noop,
    attachMenuItemMetaListeners: noop,
    loadMenuItemMetaFromFirebase: async () => null,
    hydrateMenuCardViewerLikes: asyncNoop,
    getPostDocRef: () => null,
    getFeedDocRef: () => null,
    resolveRestaurantOwnerUid: async () => "",
    resolvePostOwnerUid: async () => "",
    loadPostMetaFromFirebase: async () => ({ likes: [], comments: [] }),
    loadPostLikesForModal: async () => []
  };
  if (!state || !db) return empty;

  const docObj = documentObj || (typeof document !== "undefined" ? document : null);
  const ownerCache = restaurantOwnerCache || new Map();
  const avatarCache = commentAvatarCache || new Map();

  const collection = collectionFn;
  const doc = docFn;
  const getDoc = getDocFn;
  const getDocs = getDocsFn;
  const onSnapshot = onSnapshotFn;
  const query = queryFn;
  const orderBy = orderByFn;
  const limit = limitFn;
  const updateDoc = updateDocFn;
  const writeBatch = writeBatchFn;
  const runTransaction = runTransactionFn;
  const serverTimestamp = serverTimestampFn;
  const increment = incrementFn;

  const openGuestAuthPrompt = openGuestAuthPromptFn;
  const currentUserBadge = currentUserBadgeFn;
  const ensurePostMeta = ensurePostMetaFn;
  const ensureMenuItemMeta = ensureMenuItemMetaFn;
  const resolveMenuItemCounts = resolveMenuItemCountsFn;
  const getMenuDetailContext = getMenuDetailContextFn;
  const ensureCommentShape = ensureCommentShapeFn;
  const updatePostCountNodes = updatePostCountNodesFn;
  const updatePostCaches = updatePostCachesFn;
  const updateMenuCardCountNodes = updateMenuCardCountNodesFn;
  const updateMenuCardLikeButtons = updateMenuCardLikeButtonsFn;
  const updatePostModalMeta = updatePostModalMetaFn;
  const updatePostModalCountsOnly = updatePostModalCountsOnlyFn;
  const updateMenuDetailCountsOnly = updateMenuDetailCountsOnlyFn;
  const updateMenuDetailCommentsOnly = updateMenuDetailCommentsOnlyFn;
  const updateMenuDetailMeta = updateMenuDetailMetaFn;
  const updateCommentLikeButton = updateCommentLikeButtonFn;

  const ensureSelfAvatarReady = ensureSelfAvatarReadyFn;
  const normalizeHandle = normalizeHandleFn;
  const isPlaceholderUrl = isPlaceholderUrlFn;
  const primeSelfAvatarCache = primeSelfAvatarCacheFn;
  const scheduleCommentAvatarDomUpdate = scheduleCommentAvatarDomUpdateFn;
  const updateCommentAvatarNodesById = updateCommentAvatarNodesByIdFn;
  const scheduleCommentAvatarFetch = scheduleCommentAvatarFetchFn;
  const hydrateCommentAvatars = hydrateCommentAvatarsFn;
  const refreshSelfCommentAvatars = refreshSelfCommentAvatarsFn;
  const renderOverlays = renderOverlaysFn;
  const updateShellDom = updateShellDomFn;
  const pushUserNotification = pushUserNotificationFn;
  const updateFavoriteMenuItemsLocal = updateFavoriteMenuItemsLocalFn;
  const autosizeTextarea = autosizeTextareaFn;
  const pendingPostLikeIds = new Set();
  const pendingCommentLikeKeys = new Set();
  const pendingMenuItemActionKeys = new Set();
  const postMetaLoadInFlight = new Map();
  const menuItemMetaLoadInFlight = new Map();
  const META_LIKES_SOFT_REFRESH_MS = 10000;
  const META_COMMENTS_SOFT_REFRESH_MS = 15000;
  const META_VIEWER_LIKE_SOFT_REFRESH_MS = 10000;

  const favoriteMenuItemDocId = favoriteMenuItemDocIdFn;
  const buildFavoriteMenuItemPayload = buildFavoriteMenuItemPayloadFn;
  const getMenuItemSocialDocRef = getMenuItemSocialDocRefFn;
  const getMenuItemSocialId = getMenuItemSocialIdFn;
  const menuItemMetaKey = menuItemMetaKeyFn;

  function ensureMetaLoadState(meta) {
    if (!meta || typeof meta !== "object") {
      return {
        commentsHydrated: false,
        likesHydrated: false,
        userLikeHydratedUid: "",
        commentsFetchedAt: 0,
        likesFetchedAt: 0,
        viewerLikeFetchedAt: 0
      };
    }
    let loadState = meta.__loadState;
    if (!loadState || typeof loadState !== "object") {
      loadState = {
        commentsHydrated: false,
        likesHydrated: false,
        userLikeHydratedUid: "",
        commentsFetchedAt: 0,
        likesFetchedAt: 0,
        viewerLikeFetchedAt: 0
      };
      try {
        Object.defineProperty(meta, "__loadState", {
          value: loadState,
          writable: true,
          configurable: true,
          enumerable: false
        });
      } catch (_err) {
        meta.__loadState = loadState;
      }
      return loadState;
    }
    if (typeof loadState.commentsHydrated !== "boolean") loadState.commentsHydrated = false;
    if (typeof loadState.likesHydrated !== "boolean") loadState.likesHydrated = false;
    if (typeof loadState.userLikeHydratedUid !== "string") loadState.userLikeHydratedUid = "";
    if (!Number.isFinite(Number(loadState.commentsFetchedAt))) loadState.commentsFetchedAt = 0;
    if (!Number.isFinite(Number(loadState.likesFetchedAt))) loadState.likesFetchedAt = 0;
    if (!Number.isFinite(Number(loadState.viewerLikeFetchedAt))) loadState.viewerLikeFetchedAt = 0;
    return loadState;
  }

  function isFreshMetaTimestamp(timestamp, maxAgeMs) {
    const ts = Number(timestamp) || 0;
    if (!ts || !maxAgeMs) return false;
    return Date.now() - ts <= maxAgeMs;
  }

  function toTimestampMs(value) {
    if (!value) return 0;
    try {
      if (typeof value?.toDate === "function") return value.toDate()?.getTime?.() || 0;
      if (value instanceof Date) return value.getTime() || 0;
      if (typeof value === "number") return Number.isFinite(value) ? value : 0;
      const parsed = new Date(value);
      return Number.isFinite(parsed.getTime()) ? parsed.getTime() : 0;
    } catch {
      return 0;
    }
  }

  function getPostTruthScore(post = {}) {
    if (!post || typeof post !== "object") return 0;
    const freshness = Math.max(
      toTimestampMs(post.updatedAt),
      toTimestampMs(post.updatedAtClient),
      toTimestampMs(post.createdAtClient),
      toTimestampMs(post.createdAt)
    );
    const content = [
      post.content,
      post.caption,
      post.url,
      post.image,
      post.title
    ].reduce((sum, value) => (String(value || "").trim() ? sum + 1 : sum), 0);
    const owner = post.ownerType && post.ownerId ? 100 : 0;
    return freshness + (content * 10) + owner;
  }

  function collectPostCandidates(postId = "") {
    const safePostId = String(postId || "").trim();
    if (!safePostId) return [];
    const list = [];
    const seen = new Set();
    const push = (candidate) => {
      if (!candidate || String(candidate?.id || "").trim() !== safePostId || seen.has(candidate)) return;
      seen.add(candidate);
      list.push(candidate);
    };
    push(state.postModal?.post);
    [
      state.userPosts,
      state.businessPosts,
      state.feedPosts,
      state.profileView?.posts,
      state.profileModal?.profile?.posts
    ].forEach((rows) => {
      if (!Array.isArray(rows)) return;
      rows.forEach((candidate) => push(candidate));
    });
    return list;
  }

  function findPostById(postId) {
    const candidates = collectPostCandidates(postId);
    if (!candidates.length) return null;
    return candidates
      .slice()
      .sort((a, b) => getPostTruthScore(b) - getPostTruthScore(a))[0] || null;
  }

  function getPostDocRef(post) {
    if (!post || !post.id) return null;
    const id = String(post.id);
    const ownerType = post.ownerType
      || (post.restaurantId || post.rid ? "restaurant" : "")
      || (post.uid || post.userId ? "user" : "");
    const ownerId = post.ownerId
      || post.restaurantId
      || post.rid
      || post.uid
      || post.userId
      || "";
    if (!post.ownerType && ownerType) post.ownerType = ownerType;
    if (!post.ownerId && ownerId) post.ownerId = ownerId;
    if (ownerType === "restaurant" && ownerId) return doc(db, "restaurants", ownerId, "socialPosts", id);
    if (ownerType === "user" && ownerId) return doc(db, "users", ownerId, "posts", id);
    const profileOwner = state.profileView?.profile;
    if (profileOwner?.restaurantId) return doc(db, "restaurants", profileOwner.restaurantId, "socialPosts", id);
    if (profileOwner?.uid) return doc(db, "users", profileOwner.uid, "posts", id);
    if (state.user?.uid) return doc(db, "users", state.user.uid, "posts", id);
    return null;
  }

  function getFeedDocRef(post) {
    if (!post?.id) return null;
    return doc(db, "socialFeed", String(post.id));
  }

  async function resolveRestaurantOwnerUid(restaurantId) {
    if (!restaurantId) return "";
    if (ownerCache.has(restaurantId)) return ownerCache.get(restaurantId) || "";
    const cached = state.restaurants.find((r) => r.id === restaurantId);
    const ownerUid = cached?.ownerUid || cached?.ownerId || "";
    if (ownerUid) {
      ownerCache.set(restaurantId, ownerUid);
      return ownerUid;
    }
    try {
      const snap = await getDoc(doc(db, "restaurants", restaurantId));
      if (snap.exists()) {
        const uid = snap.data()?.ownerUid || snap.data()?.ownerId || "";
        ownerCache.set(restaurantId, uid);
        return uid;
      }
    } catch (err) {
      console.error(err);
    }
    return "";
  }

  async function resolvePostOwnerUid(post) {
    if (!post) return "";
    if (post.ownerType === "user" && post.ownerId) return post.ownerId;
    if (post.ownerType === "restaurant" && post.ownerId) return resolveRestaurantOwnerUid(post.ownerId);
    if (post.restaurantId) return resolveRestaurantOwnerUid(post.restaurantId);
    return "";
  }

  async function loadPostMetaFromFirebase(post, { includeLikes = false, includeComments = true } = {}) {
    const postRef = getPostDocRef(post);
    const postId = String(post?.id || "");
    if (!postRef || !postId) return { likes: [], comments: [] };
    const meta = ensurePostMeta(postId);
    const loadState = ensureMetaLoadState(meta);
    const userUid = String(state.user?.uid || "");
    const hasLikesCache = !includeLikes || (loadState.likesHydrated && Array.isArray(meta.likes));
    const hasCommentsCache = !includeComments || (loadState.commentsHydrated && Array.isArray(meta.comments));
    const hasViewerLikeCache = includeLikes || !userUid || loadState.userLikeHydratedUid === userUid;
    const likesFresh = !includeLikes || (hasLikesCache && isFreshMetaTimestamp(loadState.likesFetchedAt, META_LIKES_SOFT_REFRESH_MS));
    const commentsFresh = !includeComments || (hasCommentsCache && isFreshMetaTimestamp(loadState.commentsFetchedAt, META_COMMENTS_SOFT_REFRESH_MS));
    const viewerLikeFresh = includeLikes
      || !userUid
      || (hasViewerLikeCache && isFreshMetaTimestamp(loadState.viewerLikeFetchedAt, META_VIEWER_LIKE_SOFT_REFRESH_MS));
    const shouldLoadLikes = includeLikes && (!hasLikesCache || !likesFresh);
    const shouldProbeViewerLike = !includeLikes && !!userUid && (!hasViewerLikeCache || !viewerLikeFresh);
    const shouldLoadComments = includeComments && (!hasCommentsCache || !commentsFresh);
    if (!shouldLoadLikes && !shouldProbeViewerLike && !shouldLoadComments) {
      state.postMeta[postId] = meta;
      return meta;
    }

    const loadKey = `${postId}|likes:${shouldLoadLikes ? 1 : 0}|viewer:${shouldProbeViewerLike ? 1 : 0}|comments:${shouldLoadComments ? 1 : 0}|user:${userUid}`;
    if (postMetaLoadInFlight.has(loadKey)) {
      return postMetaLoadInFlight.get(loadKey);
    }

    const loadPromise = (async () => {
      if (shouldLoadLikes) {
        try {
          const likesSnap = await getDocs(query(collection(postRef, "likes"), orderBy("createdAt", "desc"), limit(detailLikesLimit)));
          meta.likes = likesSnap.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }));
          loadState.likesHydrated = true;
          loadState.likesFetchedAt = Date.now();
        } catch (err) {
          console.error(err);
        }
      } else if (shouldProbeViewerLike) {
        try {
          const likeSnap = await getDoc(doc(collection(postRef, "likes"), userUid));
          const retainedLikes = (Array.isArray(meta.likes) ? meta.likes : []).filter((row) => String(row?.uid || "") !== userUid);
          meta.likes = likeSnap.exists()
            ? [{ id: likeSnap.id, ...likeSnap.data() }, ...retainedLikes]
            : retainedLikes;
          loadState.userLikeHydratedUid = userUid;
          loadState.viewerLikeFetchedAt = Date.now();
        } catch (err) {
          console.error(err);
        }
      }

      if (shouldLoadComments) {
        try {
          const commentsSnap = await getDocs(query(collection(postRef, "comments"), orderBy("createdAt", "desc"), limit(detailCommentsLimit)));
          const rows = commentsSnap.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }));
          const byId = new Map();
          const top = [];
          rows.forEach((row) => {
            const item = ensureCommentShape(row);
            byId.set(item.id, item);
          });
          rows.forEach((row) => {
            const item = byId.get(row.id);
            const parentId = row.parentId || null;
            if (parentId && byId.has(parentId)) {
              const parent = byId.get(parentId);
              parent.replies = [item, ...(parent.replies || [])];
            } else if (item) {
              top.push(item);
            }
          });
          meta.comments = top;
          loadState.commentsHydrated = true;
          loadState.commentsFetchedAt = Date.now();
        } catch (err) {
          console.error(err);
        }
      }

      state.postMeta[postId] = meta;
      return meta;
    })();

    postMetaLoadInFlight.set(loadKey, loadPromise);
    try {
      return await loadPromise;
    } finally {
      postMetaLoadInFlight.delete(loadKey);
    }
  }

  async function loadPostLikesForModal(postId) {
    const targetId = String(postId || "");
    if (!targetId) return [];
    const post = findPostById(targetId);
    const postRef = getPostDocRef(post);
    if (!postRef) return [];
    const meta = await loadPostMetaFromFirebase(post, { includeLikes: true, includeComments: false });
    updatePostCountNodes(post);
    if (state.likesModal.open && String(state.likesModal.postId || "") === targetId) {
      renderOverlays({ updateProfile: false, updatePost: false, updateLikes: true });
    } else if (state.postModal.open && String(state.postModal.post?.id || "") === targetId) {
      updatePostModalCountsOnly();
    }
    return meta.likes || [];
  }

  function collectPostCountTargets(post) {
    const postId = String(post?.id || "").trim();
    if (!postId) return [];
    const unique = new Set();
    const targets = [];
    const pushTarget = (candidate) => {
      if (!candidate || String(candidate?.id || "").trim() !== postId || unique.has(candidate)) return;
      unique.add(candidate);
      targets.push(candidate);
    };
    pushTarget(post);
    pushTarget(state.postModal?.post);
    [
      state.userPosts,
      state.businessPosts,
      state.feedPosts,
      state.profileView?.posts,
      state.profileModal?.profile?.posts
    ].forEach((list) => {
      if (!Array.isArray(list)) return;
      list.forEach((candidate) => pushTarget(candidate));
    });
    return targets;
  }

  function applyPostCounts(post, { likes = null, comments = null } = {}) {
    const targets = collectPostCountTargets(post);
    if (!targets.length) return;
    targets.forEach((target) => {
      if (likes !== null) target.likes = Math.max(0, Number(likes) || 0);
      if (comments !== null) target.comments = Math.max(0, Number(comments) || 0);
    });
  }

  async function reconcilePostCountsFromRemote(post, { fallbackLikes = null, fallbackComments = null } = {}) {
    if (!post) return;
    const applyCounts = (likes = null, comments = null) => {
      applyPostCounts(post, { likes, comments });
      updatePostCountNodes(post);
      updatePostCaches(post);
      if (state.postModal.open && String(state.postModal.post?.id || "") === String(post.id || "")) {
        updatePostModalCountsOnly();
      }
    };
    if (fallbackLikes !== null || fallbackComments !== null) {
      applyCounts(fallbackLikes, fallbackComments);
    }
    const postRef = getPostDocRef(post);
    let nextLikes = fallbackLikes;
    let nextComments = fallbackComments;
    if (postRef) {
      try {
        const snap = await getDoc(postRef);
        if (snap.exists()) {
          const data = snap.data() || {};
          nextLikes = Number(data.likesCount ?? data.likes ?? nextLikes ?? post.likes ?? 0) || 0;
          nextComments = Number(data.commentsCount ?? data.comments ?? nextComments ?? post.comments ?? 0) || 0;
        }
      } catch (err) {
        console.error(err);
      }
    }
    applyCounts(nextLikes, nextComments);
  }

  async function updatePostCounts(post, { likesDelta = 0, commentsDelta = 0, skipRemote = false, baseLikes = null, baseComments = null } = {}) {
    if (!post) return;
    const likeBase = baseLikes === null ? (Number(post.likes) || 0) : (Number(baseLikes) || 0);
    const commentBase = baseComments === null ? (Number(post.comments) || 0) : (Number(baseComments) || 0);
    const nextLikes = likesDelta ? Math.max(0, likeBase + likesDelta) : likeBase;
    const nextComments = commentsDelta ? Math.max(0, commentBase + commentsDelta) : commentBase;
    applyPostCounts(post, { likes: nextLikes, comments: nextComments });
    const updates = {};
    if (likesDelta) updates.likesCount = increment(likesDelta);
    if (commentsDelta) updates.commentsCount = increment(commentsDelta);
    if (!skipRemote && Object.keys(updates).length) {
      const postRef = getPostDocRef(post);
      if (postRef) {
        try {
          await updateDoc(postRef, updates);
        } catch (err) {
          console.error(err);
        }
      }
      const feedRef = getFeedDocRef(post);
      if (feedRef) {
        try {
          await updateDoc(feedRef, updates);
        } catch {}
      }
    }
    updatePostCountNodes(post);
    updatePostCaches(post);
  }

  async function addComment(postId, text, replyTo) {
    const trimmed = String(text || "").trim();
    if (!trimmed) return;
    if (!state.user) {
      openGuestAuthPrompt("Bitte registrieren oder einloggen, um Kommentare zu schreiben.");
      return;
    }
    const submitPostId = String(postId || "");
    const startedPostModalId = state.postModal.open && state.postModal.post
      ? String(state.postModal.post.id || "")
      : "";
    const isSamePostModalContext = () => (
      !!startedPostModalId
      && startedPostModalId === submitPostId
      && !!state.postModal.open
      && String(state.postModal.post?.id || "") === startedPostModalId
    );
    const key = `${postId}|${state.user.uid || ""}|${trimmed}`;
    const now = Date.now();
    if (key === getLastCommentKeyFn() && now - getLastCommentAtFn() < 1500) return;
    setLastCommentKeyFn(key);
    setLastCommentAtFn(now);
    const post = findPostById(postId);
    const postRef = getPostDocRef(post);
    if (!post || !postRef) {
      setLastCommentKeyFn("");
      setLastCommentAtFn(0);
      return;
    }
    if (state.postModal.sending) return;
    state.postModal.sending = true;
    try {
      const meta = ensurePostMeta(postId);
      const commentBaseBeforeWrite = Number(post.comments) || 0;
      const ensuredAvatar = await ensureSelfAvatarReady({ force: true });
      const user = currentUserBadge();
      const handleKey = normalizeHandle(user.handle || user.name || "");
      const avatarCandidate = ensuredAvatar || user.avatar || "";
      const finalAvatar = avatarCandidate && !isPlaceholderUrl(avatarCandidate) ? avatarCandidate : "";
      if (finalAvatar) {
        user.avatar = finalAvatar;
        primeSelfAvatarCache(finalAvatar);
        if (user.uid) avatarCache.set(user.uid, finalAvatar);
        if (handleKey) avatarCache.set(handleKey, finalAvatar);
      }
      const commentRef = doc(collection(postRef, "comments"));
      const payload = {
        uid: user.uid || "",
        author: user.name,
        handle: user.handle,
        avatarUrl: finalAvatar,
        avatar: finalAvatar,
        text: trimmed,
        createdAt: serverTimestamp(),
        parentId: replyTo || null,
        likesCount: 0
      };
      try {
        const batch = writeBatch(db);
        batch.set(commentRef, payload);
        batch.update(postRef, { commentsCount: increment(1) });
        const feedRef = getFeedDocRef(post);
        if (feedRef) {
          try {
            const feedSnap = await getDoc(feedRef);
            if (feedSnap.exists()) {
              batch.update(feedRef, { commentsCount: increment(1) });
            }
          } catch {}
        }
        await batch.commit();
      } catch (err) {
        console.error(err);
        setLastCommentKeyFn("");
        setLastCommentAtFn(0);
        return;
      }
      try {
        if (finalAvatar) {
          if (payload.uid) avatarCache.set(payload.uid, finalAvatar);
          if (handleKey) avatarCache.set(handleKey, finalAvatar);
          scheduleCommentAvatarDomUpdate(payload.uid || "", handleKey, finalAvatar);
          updateCommentAvatarNodesById(commentRef.id, finalAvatar);
        } else {
          scheduleCommentAvatarFetch({
            uid: payload.uid || "",
            handle: payload.handle || "",
            author: payload.author || ""
          });
        }
      } catch {}
      void reconcilePostCountsFromRemote(post, {
        fallbackComments: commentBaseBeforeWrite + 1
      }).catch((err) => {
        console.error(err);
      });
      const hasLiveComments = typeof getModalCommentsUnsubFn() === "function";
      if (!hasLiveComments) {
        const newComment = ensureCommentShape({
          id: commentRef.id,
          ...payload,
          createdAt: new Date().toISOString()
        });
        if (replyTo) {
          const target = meta.comments.find((item) => item.id === replyTo);
          if (target) {
            target.replies = [newComment, ...(target.replies || [])];
          } else {
            meta.comments = [newComment, ...(meta.comments || [])];
          }
        } else {
          meta.comments = [newComment, ...(meta.comments || [])];
        }
        const loadState = ensureMetaLoadState(meta);
        if (loadState.commentsHydrated) {
          loadState.commentsFetchedAt = Date.now();
        }
        state.postMeta[postId] = meta;
      }
      if (isSamePostModalContext()) {
        state.postModal.commentText = "";
        const commentInput = docObj?.getElementById("postCommentInput");
        if (commentInput) commentInput.value = "";
        state.postModal.replyTo = null;
        updatePostModalMeta();
        if (finalAvatar) scheduleCommentAvatarDomUpdate(user.uid || "", handleKey, finalAvatar);
        const postComments = docObj?.getElementById("postModalComments");
        if (postComments) hydrateCommentAvatars(postComments, { postId: postId });
      }
      refreshSelfCommentAvatars();
      const commenterUid = String(user.uid || "");
      void resolvePostOwnerUid(post)
        .then((ownerUid) => {
          if (!ownerUid || ownerUid === commenterUid) return null;
          return pushUserNotification(ownerUid, {
            type: "comment",
            user: user.name,
            userHandle: user.handle,
            userUid: commenterUid,
            avatar: payload.avatar,
            text: "hat deinen Beitrag kommentiert",
            postId: String(post.id || ""),
            commentId: String(commentRef.id || ""),
            ownerType: post.ownerType || "",
            ownerId: post.ownerId || "",
            restaurantId: post.restaurantId || ""
          });
        })
        .catch(() => null);
    } finally {
      state.postModal.sending = false;
    }
  }

  async function togglePostLike(postId) {
    if (!state.user) {
      openGuestAuthPrompt("Bitte registrieren oder einloggen, um Beitrage zu liken.");
      return;
    }
    const safePostId = String(postId || "").trim();
    if (!safePostId || pendingPostLikeIds.has(safePostId)) return;
    const meta = ensurePostMeta(postId);
    const user = currentUserBadge();
    if (!user.uid) return;
    const post = findPostById(postId);
    const postRef = getPostDocRef(post);
    if (!post || !postRef) return;
    const likeBaseBeforeWrite = Number(post.likes) || 0;
    pendingPostLikeIds.add(safePostId);
    const likeId = user.uid;
    const likeRef = doc(collection(postRef, "likes"), likeId);
    const feedRef = getFeedDocRef(post);
    let delta = 0;
    try {
      await runTransaction(db, async (tx) => {
        const likeSnap = await tx.get(likeRef);
        const feedSnap = feedRef ? await tx.get(feedRef) : null;
        if (likeSnap.exists()) {
          tx.delete(likeRef);
          delta = -1;
        } else {
          tx.set(likeRef, {
            uid: user.uid,
            name: user.name,
            handle: user.handle,
            avatar: user.avatar,
            createdAt: serverTimestamp()
          });
          delta = 1;
        }
        tx.update(postRef, { likesCount: increment(delta) });
        if (feedRef && feedSnap?.exists()) {
          tx.update(feedRef, { likesCount: increment(delta) });
        }
      });
      if (!delta) return;
      if (delta < 0) {
        const idx = meta.likes.findIndex((item) => item.uid === user.uid || item.handle === user.handle);
        if (idx >= 0) meta.likes.splice(idx, 1);
      } else {
        meta.likes.unshift({ uid: user.uid, name: user.name, handle: user.handle, avatar: user.avatar });
      }
      const loadState = ensureMetaLoadState(meta);
      loadState.userLikeHydratedUid = String(user.uid || "");
      loadState.viewerLikeFetchedAt = Date.now();
      if (loadState.likesHydrated) {
        loadState.likesFetchedAt = Date.now();
      }
      state.postMeta[postId] = meta;
      void reconcilePostCountsFromRemote(post, {
        fallbackLikes: likeBaseBeforeWrite + delta
      }).catch((err) => {
        console.error(err);
      });
      const isSamePostModalContext = state.postModal.open
        && state.postModal.post
        && String(state.postModal.post.id) === String(postId);
      const isSameLikesModalContext = state.likesModal.open
        && String(state.likesModal.postId || "") === String(postId);
      if (isSamePostModalContext) {
        updatePostModalCountsOnly();
      } else {
        renderOverlays();
      }
      if (isSameLikesModalContext) {
        renderOverlays({ updateProfile: false, updatePost: false, updateLikes: true });
      }
      if (delta > 0) {
        const likerUid = String(user.uid || "");
        void resolvePostOwnerUid(post)
          .then((ownerUid) => {
            if (!ownerUid || ownerUid === likerUid) return null;
            return pushUserNotification(ownerUid, {
              type: "like",
              user: user.name,
              userHandle: user.handle,
              userUid: likerUid,
              avatar: user.avatar,
              text: "hat deinen Beitrag geliked",
              postId: String(post.id || ""),
              ownerType: post.ownerType || "",
              ownerId: post.ownerId || "",
              restaurantId: post.restaurantId || ""
            });
          })
          .catch(() => null);
      }
      updateShellDom();
    } catch (err) {
      console.error(err);
    } finally {
      pendingPostLikeIds.delete(safePostId);
    }
  }

  function resolveMenuItemTargetContext(target = null) {
    if (target && typeof target === "object" && target.ref && target.key && target.itemId) {
      const ref = target.ref;
      const key = String(target.key || "").trim();
      const restaurantId = String(target.restaurantId || "").trim();
      const itemId = String(target.itemId || "").trim();
      const item = target.item || null;
      if (ref && key && restaurantId && itemId) {
        return { ref, key, restaurantId, itemId, item };
      }
    }
    if (!target) return getMenuDetailContext();
    const targetObj = typeof target === "object" ? target : {};
    const itemCandidate = targetObj.item && typeof targetObj.item === "object"
      ? targetObj.item
      : target;
    const item = itemCandidate && typeof itemCandidate === "object" ? itemCandidate : null;
    if (!item) return null;
    const restaurantId = String(
      targetObj.restaurantId
      || targetObj.rid
      || item.restaurantId
      || state.menu.restaurantId
      || state.profileView?.profile?.restaurantId
      || state.userProfile.restaurantId
      || ""
    ).trim();
    const itemId = String(
      targetObj.itemId
      || getMenuItemSocialId(item)
      || ""
    ).trim();
    if (!restaurantId || !itemId) return null;
    const key = menuItemMetaKey(restaurantId, itemId);
    const ref = getMenuItemSocialDocRef(item, restaurantId);
    if (!ref || !key) return null;
    return { ref, key, restaurantId, itemId, item };
  }

  function isActiveMenuDetailContext(ctx) {
    if (!ctx) return false;
    const activeCtx = getMenuDetailContext();
    return !!activeCtx && String(activeCtx.key || "") === String(ctx.key || "");
  }

  function isMenuItemLikedByUser(meta, userUid = "", userHandle = "") {
    const safeUid = String(userUid || "").trim();
    const safeHandle = normalizeHandle(userHandle);
    const rows = Array.isArray(meta?.likes) ? meta.likes : [];
    return rows.some((row) => {
      const rowUid = String(row?.uid || "").trim();
      if (safeUid && rowUid && rowUid === safeUid) return true;
      const rowHandle = normalizeHandle(row?.handle || "");
      return !!safeHandle && !!rowHandle && rowHandle === safeHandle;
    });
  }

  function removeViewerLikeRows(rows, userUid = "", userHandle = "") {
    const safeUid = String(userUid || "").trim();
    const safeHandle = normalizeHandle(userHandle);
    const list = Array.isArray(rows) ? rows : [];
    return list.filter((row) => {
      const rowUid = String(row?.uid || "").trim();
      if (safeUid && rowUid && rowUid === safeUid) return false;
      const rowHandle = normalizeHandle(row?.handle || "");
      if (safeHandle && rowHandle && rowHandle === safeHandle) return false;
      return true;
    });
  }

  async function toggleMenuItemFavorite(ctx) {
    if (!state.user) {
      openGuestAuthPrompt("Bitte registrieren oder einloggen, um Favoriten zu nutzen.");
      return;
    }
    if (!ctx) return;
    const { restaurantId, itemId, item } = ctx;
    const user = currentUserBadge();
    if (!user.uid) return;
    const favoriteId = favoriteMenuItemDocId(restaurantId, itemId);
    if (!favoriteId) return;
    const pendingKey = `favorite::${String(ctx.key || `${restaurantId}::${itemId}`)}`;
    if (pendingMenuItemActionKeys.has(pendingKey)) return;
    pendingMenuItemActionKeys.add(pendingKey);
    const favoriteRef = doc(db, "users", user.uid, "menuFavorites", favoriteId);
    let removeFavorite = false;
    try {
      await runTransaction(db, async (tx) => {
        const favoriteSnap = await tx.get(favoriteRef);
        if (favoriteSnap.exists()) {
          tx.delete(favoriteRef);
          removeFavorite = true;
          return;
        }
        tx.set(
          favoriteRef,
          buildFavoriteMenuItemPayload(item, restaurantId, { includeServerTimestamp: true }),
          { merge: true }
        );
        removeFavorite = false;
      });
      updateFavoriteMenuItemsLocal(item, restaurantId, { remove: removeFavorite });
      if (isActiveMenuDetailContext(ctx)) {
        updateMenuDetailCountsOnly();
      }
    } catch (err) {
      console.error(err);
    } finally {
      pendingMenuItemActionKeys.delete(pendingKey);
    }
  }

  async function toggleMenuItemLike(target = null) {
    const targetObj = target && typeof target === "object" ? target : null;
    const favoriteOnly = !!targetObj && (
      targetObj.favoriteOnly === true
      || String(targetObj.action || "").trim().toLowerCase() === "favorite"
    );
    if (!state.user) {
      openGuestAuthPrompt(
        favoriteOnly
          ? "Bitte registrieren oder einloggen, um Favoriten zu nutzen."
          : "Bitte registrieren oder einloggen, um Produkte zu liken."
      );
      return;
    }
    const ctx = resolveMenuItemTargetContext(favoriteOnly ? null : target);
    if (!ctx) return;
    if (favoriteOnly) {
      await toggleMenuItemFavorite(ctx);
      return;
    }
    const { ref, key, item, itemId } = ctx;
    const user = currentUserBadge();
    if (!user.uid) return;
    const pendingKey = `like::${key}`;
    if (pendingMenuItemActionKeys.has(pendingKey)) return;
    pendingMenuItemActionKeys.add(pendingKey);
    const likeId = user.uid;
    const likeRef = doc(collection(ref, "likes"), likeId);
    let delta = 0;
    try {
      await runTransaction(db, async (tx) => {
        const likeSnap = await tx.get(likeRef);
        if (likeSnap.exists()) {
          tx.delete(likeRef);
          delta = -1;
        } else {
          tx.set(likeRef, {
            uid: user.uid,
            name: user.name,
            handle: user.handle,
            avatar: user.avatar,
            createdAt: serverTimestamp()
          });
          delta = 1;
        }
        tx.set(ref, { likesCount: increment(delta) }, { merge: true });
      });
      if (!delta) return;
      const meta = ensureMenuItemMeta(key);
      const retainedLikes = removeViewerLikeRows(meta.likes, user.uid, user.handle);
      if (delta < 0) {
        meta.likes = retainedLikes;
      } else {
        meta.likes = [{ uid: user.uid, name: user.name, handle: user.handle, avatar: user.avatar }, ...retainedLikes];
      }
      const loadState = ensureMetaLoadState(meta);
      loadState.userLikeHydratedUid = String(user.uid || "");
      loadState.viewerLikeFetchedAt = Date.now();
      if (loadState.likesHydrated) {
        loadState.likesFetchedAt = Date.now();
      }
      meta.counts = meta.counts || { likes: 0, comments: 0 };
      meta.counts.likes = Math.max(0, (Number(meta.counts.likes) || 0) + delta);
      state.menuItemMeta[key] = meta;
      if (isActiveMenuDetailContext(ctx)) {
        updateMenuDetailCountsOnly();
      }
      const cardItemId = String(item?.id || itemId || "").trim();
      updateMenuCardLikeButtons(cardItemId, isMenuItemLikedByUser(meta, user.uid, user.handle || ""));
      updateMenuCardCountNodes(ctx.itemId, resolveMenuItemCounts(meta));
    } catch (err) {
      console.error(err);
    } finally {
      pendingMenuItemActionKeys.delete(pendingKey);
    }
  }

  async function addMenuItemComment(text) {
    const trimmed = String(text || "").trim();
    if (!trimmed) return;
    if (!state.user) {
      openGuestAuthPrompt("Bitte registrieren oder einloggen, um Kommentare zu schreiben.");
      return;
    }
    const ctx = getMenuDetailContext();
    if (!ctx) return;
    const { ref, key } = ctx;
    const meta = ensureMenuItemMeta(key);
    const countsBeforeSubmit = resolveMenuItemCounts(meta);
    const startedMenuDetailKey = String(key || "");
    const isSameMenuDetailContext = () => {
      const activeCtx = getMenuDetailContext();
      return !!startedMenuDetailKey && !!activeCtx && String(activeCtx.key || "") === startedMenuDetailKey;
    };
    const dedupeKey = `${key}|${state.user.uid || ""}|${trimmed}`;
    const now = Date.now();
    if (dedupeKey === getLastMenuCommentKeyFn() && now - getLastMenuCommentAtFn() < 1500) return;
    setLastMenuCommentKeyFn(dedupeKey);
    setLastMenuCommentAtFn(now);
    if (state.menuDetail.sending) return;
    state.menuDetail.sending = true;
    updateMenuDetailCommentsOnly();
    try {
      const ensuredAvatar = await ensureSelfAvatarReady({ force: true });
      const user = currentUserBadge();
      const handleKey = normalizeHandle(user.handle || user.name || "");
      const avatarCandidate = ensuredAvatar || user.avatar || "";
      const finalAvatar = avatarCandidate && !isPlaceholderUrl(avatarCandidate) ? avatarCandidate : "";
      if (finalAvatar) {
        user.avatar = finalAvatar;
        primeSelfAvatarCache(finalAvatar);
        if (user.uid) avatarCache.set(user.uid, finalAvatar);
        if (handleKey) avatarCache.set(handleKey, finalAvatar);
      }
      const commentRef = doc(collection(ref, "comments"));
      const payload = {
        uid: user.uid || "",
        author: user.name,
        handle: user.handle,
        avatarUrl: finalAvatar,
        avatar: finalAvatar,
        text: trimmed,
        createdAt: serverTimestamp(),
        parentId: null,
        likesCount: 0
      };
      try {
        const batch = writeBatch(db);
        batch.set(commentRef, payload);
        batch.set(ref, { commentsCount: increment(1) }, { merge: true });
        await batch.commit();
      } catch (err) {
        console.error(err);
        setLastMenuCommentKeyFn("");
        setLastMenuCommentAtFn(0);
        if (isSameMenuDetailContext()) {
          state.menuDetail.sending = false;
          updateMenuDetailCommentsOnly();
        }
        return;
      }
      const newComment = ensureCommentShape({
        id: commentRef.id,
        ...payload,
        createdAt: new Date().toISOString()
      });
      meta.comments = [
        newComment,
        ...(meta.comments || []).filter((entry) => String(entry?.id || "") !== String(newComment.id || ""))
      ];
      const loadState = ensureMetaLoadState(meta);
      if (loadState.commentsHydrated) {
        loadState.commentsFetchedAt = Date.now();
      }
      meta.counts = meta.counts || { likes: 0, comments: 0 };
      const optimisticCommentCount = Math.max(
        0,
        (Number(countsBeforeSubmit.comments) || 0) + 1,
        Number(meta.counts.comments) || 0,
        meta.comments.length
      );
      meta.counts.comments = optimisticCommentCount;
      state.menuItemMeta[key] = meta;
      if (isSameMenuDetailContext()) {
        state.menuDetail.commentText = "";
        const input = docObj?.getElementById("menuDetailCommentInput");
        if (input) {
          input.value = "";
          autosizeTextarea(input, { minHeight: 52, maxHeight: 160 });
        }
        state.menuDetail.sending = false;
        updateMenuDetailMeta();
      }
      updateMenuCardCountNodes(ctx.itemId, resolveMenuItemCounts(meta));
      if (finalAvatar) scheduleCommentAvatarDomUpdate(user.uid || "", handleKey, finalAvatar);
      refreshSelfCommentAvatars();
    } finally {
      state.menuDetail.sending = false;
    }
  }

  async function toggleCommentLike(postId, commentId, replyId) {
    if (!state.user) {
      openGuestAuthPrompt("Bitte registrieren oder einloggen, um Kommentare zu liken.");
      return;
    }
    const pendingKey = `${String(postId || "").trim()}::${String(commentId || "").trim()}::${String(replyId || "").trim()}`;
    if (!String(postId || "").trim() || !String(commentId || "").trim() || pendingCommentLikeKeys.has(pendingKey)) return;
    const meta = ensurePostMeta(postId);
    const user = currentUserBadge();
    if (!user.uid) return;
    const list = meta.comments || [];
    const comment = list.find((item) => item.id === commentId);
    if (!comment) return;
    const target = replyId ? (comment.replies || []).find((item) => item.id === replyId) : comment;
    if (!target) return;
    const post = findPostById(postId);
    const postRef = getPostDocRef(post);
    if (!post || !postRef) return;
    pendingCommentLikeKeys.add(pendingKey);
    const commentDocId = replyId || commentId;
    const commentRef = doc(collection(postRef, "comments"), String(commentDocId));
    try {
      const likeId = user.uid;
      const likeRef = doc(collection(commentRef, "likes"), likeId);
      let delta = 0;
      await runTransaction(db, async (tx) => {
        const likeSnap = await tx.get(likeRef);
        if (likeSnap.exists()) {
          tx.delete(likeRef);
          delta = -1;
        } else {
          tx.set(likeRef, {
            uid: user.uid,
            name: user.name,
            handle: user.handle,
            avatar: user.avatar,
            createdAt: serverTimestamp()
          });
          delta = 1;
        }
        tx.update(commentRef, { likesCount: increment(delta) });
      });
      if (delta) {
        target.likesCount = Math.max(0, (Number(target.likesCount) || 0) + delta);
        state.postMeta[postId] = meta;
        if (state.postModal.open && state.postModal.post && String(state.postModal.post.id) === String(postId)) {
          updateCommentLikeButton(postId, commentId, replyId, target.likesCount);
        } else {
          renderOverlays();
        }
      }
      updateShellDom();
    } catch (err) {
      console.error(err);
    } finally {
      pendingCommentLikeKeys.delete(pendingKey);
    }
  }

  function stopPostMetaListeners() {
    const modalPostDocUnsub = getModalPostDocUnsubFn();
    if (modalPostDocUnsub) {
      modalPostDocUnsub();
      setModalPostDocUnsubFn(null);
    }
    const modalLikesUnsub = getModalLikesUnsubFn();
    if (modalLikesUnsub) {
      modalLikesUnsub();
      setModalLikesUnsubFn(null);
    }
    const modalCommentsUnsub = getModalCommentsUnsubFn();
    if (modalCommentsUnsub) {
      modalCommentsUnsub();
      setModalCommentsUnsubFn(null);
    }
  }

  function attachPostMetaListeners(post) {
    stopPostMetaListeners();
    const postRef = getPostDocRef(post);
    if (!postRef || !post?.id) return;
    const postId = String(post.id);
    setModalPostDocUnsubFn(onSnapshot(postRef, (docSnap) => {
      if (!docSnap.exists()) return;
      const data = docSnap.data() || {};
      const nextLikes = Number(data.likesCount ?? data.likes ?? post.likes ?? 0) || 0;
      const nextComments = Number(data.commentsCount ?? data.comments ?? post.comments ?? 0) || 0;
      applyPostCounts(post, { likes: nextLikes, comments: nextComments });
      updatePostCountNodes(post);
      updatePostModalCountsOnly();
    }));
  }

  function stopMenuItemMetaListeners() {
    const menuDetailDocUnsub = getMenuDetailDocUnsubFn();
    if (menuDetailDocUnsub) {
      menuDetailDocUnsub();
      setMenuDetailDocUnsubFn(null);
    }
    const menuDetailLikesUnsub = getMenuDetailLikesUnsubFn();
    if (menuDetailLikesUnsub) {
      menuDetailLikesUnsub();
      setMenuDetailLikesUnsubFn(null);
    }
    const menuDetailCommentsUnsub = getMenuDetailCommentsUnsubFn();
    if (menuDetailCommentsUnsub) {
      menuDetailCommentsUnsub();
      setMenuDetailCommentsUnsubFn(null);
    }
  }

  function attachMenuItemMetaListeners(item, restaurantId) {
    stopMenuItemMetaListeners();
    const ctx = getMenuDetailContext() || (() => {
      const ref = getMenuItemSocialDocRef(item, restaurantId);
      const itemId = getMenuItemSocialId(item);
      const rid = restaurantId || state.menu.restaurantId || state.profileView?.profile?.restaurantId || state.userProfile.restaurantId || "";
      if (!ref || !rid || !itemId) return null;
      return { ref, key: menuItemMetaKey(rid, itemId), itemId };
    })();
    if (!ctx) return;
    const { ref, key, itemId } = ctx;
    setMenuDetailDocUnsubFn(onSnapshot(ref, (docSnap) => {
      if (!docSnap.exists()) return;
      const data = docSnap.data() || {};
      const meta = ensureMenuItemMeta(key);
      meta.counts = {
        likes: Number(data.likesCount ?? data.likes ?? meta.likes?.length ?? 0) || 0,
        comments: Number(data.commentsCount ?? data.comments ?? meta.comments?.length ?? 0) || 0
      };
      state.menuItemMeta[key] = meta;
      updateMenuCardCountNodes(itemId, resolveMenuItemCounts(meta));
      updateMenuDetailCountsOnly();
    }));
  }

  async function loadMenuItemMetaFromFirebase(item, restaurantId, options = {}) {
    const includeComments = options?.includeComments !== false;
    const ref = getMenuItemSocialDocRef(item, restaurantId);
    const rid = restaurantId || state.menu.restaurantId || state.profileView?.profile?.restaurantId || state.userProfile.restaurantId || "";
    const itemId = getMenuItemSocialId(item);
    if (!ref || !rid || !itemId) return;
    const key = menuItemMetaKey(rid, itemId);
    const meta = ensureMenuItemMeta(key);
    const loadState = ensureMetaLoadState(meta);
    const userUid = String(state.user?.uid || "");
    const hasCommentsCache = !includeComments || (loadState.commentsHydrated && Array.isArray(meta.comments));
    const hasViewerLikeCache = !userUid || loadState.userLikeHydratedUid === userUid;
    const commentsFresh = !includeComments
      || (hasCommentsCache && isFreshMetaTimestamp(loadState.commentsFetchedAt, META_COMMENTS_SOFT_REFRESH_MS));
    const viewerLikeFresh = !userUid || (hasViewerLikeCache && isFreshMetaTimestamp(loadState.viewerLikeFetchedAt, META_VIEWER_LIKE_SOFT_REFRESH_MS));
    const shouldProbeViewerLike = !!userUid && (!hasViewerLikeCache || !viewerLikeFresh);
    const shouldLoadComments = includeComments && (!hasCommentsCache || !commentsFresh);
    if (!shouldProbeViewerLike && !shouldLoadComments) {
      state.menuItemMeta[key] = meta;
      return meta;
    }

    const loadKey = `${key}|viewer:${shouldProbeViewerLike ? 1 : 0}|comments:${shouldLoadComments ? 1 : 0}|user:${userUid}`;
    if (menuItemMetaLoadInFlight.has(loadKey)) {
      return menuItemMetaLoadInFlight.get(loadKey);
    }

    const loadPromise = (async () => {
      if (shouldProbeViewerLike) {
        try {
          const likeSnap = await getDoc(doc(collection(ref, "likes"), userUid));
          const retainedLikes = removeViewerLikeRows(meta.likes, userUid, state.user?.handle || "");
          meta.likes = likeSnap.exists()
            ? [{ id: likeSnap.id, ...likeSnap.data() }, ...retainedLikes]
            : retainedLikes;
          loadState.userLikeHydratedUid = userUid;
          loadState.viewerLikeFetchedAt = Date.now();
        } catch (err) {
          console.error(err);
        }
      }
      if (shouldLoadComments) {
        try {
          const commentsSnap = await getDocs(query(collection(ref, "comments"), orderBy("createdAt", "desc"), limit(detailCommentsLimit)));
          const rows = commentsSnap.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }));
          meta.comments = rows.filter((row) => !row.parentId).map((row) => ensureCommentShape(row));
          loadState.commentsHydrated = true;
          loadState.commentsFetchedAt = Date.now();
        } catch (err) {
          console.error(err);
        }
      }
      state.menuItemMeta[key] = meta;
      const isLiked = isMenuItemLikedByUser(meta, userUid, state.user?.handle || "");
      updateMenuCardLikeButtons(String(item?.id || itemId || "").trim(), isLiked);
      updateMenuCardCountNodes(itemId, resolveMenuItemCounts(meta));
      return meta;
    })();

    menuItemMetaLoadInFlight.set(loadKey, loadPromise);
    try {
      return await loadPromise;
    } finally {
      menuItemMetaLoadInFlight.delete(loadKey);
    }
  }

  async function hydrateMenuCardViewerLikes(items = [], restaurantId = "") {
    const userUid = String(state.user?.uid || "").trim();
    if (!userUid) return;
    const list = Array.isArray(items) ? items : [];
    if (!list.length) return;
    const rid = String(
      restaurantId
      || state.menu.restaurantId
      || state.profileView?.profile?.restaurantId
      || state.userProfile.restaurantId
      || ""
    ).trim();
    if (!rid) return;
    const seen = new Set();
    const jobs = [];
    list.forEach((item) => {
      const socialId = String(getMenuItemSocialId(item) || "").trim();
      if (!socialId) return;
      const dedupeKey = `${rid}::${socialId}`;
      if (seen.has(dedupeKey)) return;
      seen.add(dedupeKey);
      jobs.push(loadMenuItemMetaFromFirebase(item, rid, { includeComments: false }));
    });
    if (!jobs.length) return;
    const settled = await Promise.allSettled(jobs);
    settled.forEach((row) => {
      if (row.status === "rejected") {
        console.error(row.reason);
      }
    });
  }

  return {
    updatePostCounts,
    addComment,
    togglePostLike,
    toggleMenuItemLike,
    addMenuItemComment,
    toggleCommentLike,
    stopPostMetaListeners,
    attachPostMetaListeners,
    stopMenuItemMetaListeners,
    attachMenuItemMetaListeners,
    loadMenuItemMetaFromFirebase,
    hydrateMenuCardViewerLikes,
    getPostDocRef,
    getFeedDocRef,
    resolveRestaurantOwnerUid,
    resolvePostOwnerUid,
    loadPostMetaFromFirebase,
    loadPostLikesForModal
  };
}
