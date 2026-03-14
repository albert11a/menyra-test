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

  const favoriteMenuItemDocId = favoriteMenuItemDocIdFn;
  const buildFavoriteMenuItemPayload = buildFavoriteMenuItemPayloadFn;
  const getMenuItemSocialDocRef = getMenuItemSocialDocRefFn;
  const getMenuItemSocialId = getMenuItemSocialIdFn;
  const menuItemMetaKey = menuItemMetaKeyFn;

  function findPostById(postId) {
    const modalPost = state.postModal?.post;
    if (modalPost && String(modalPost.id) === String(postId)) return modalPost;
    const all = [...state.userPosts, ...state.businessPosts, ...state.feedPosts];
    const found = all.find((item) => String(item.id) === String(postId));
    if (found) return found;
    const viewPosts = state.profileView?.posts || [];
    const viewFound = viewPosts.find((item) => String(item.id) === String(postId));
    if (viewFound) return viewFound;
    const modalPosts = state.profileModal.profile?.posts || [];
    return modalPosts.find((item) => String(item.id) === String(postId)) || null;
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
    const userUid = String(state.user?.uid || "");
    if (includeLikes) {
      try {
        const likesSnap = await getDocs(query(collection(postRef, "likes"), orderBy("createdAt", "desc"), limit(detailLikesLimit)));
        meta.likes = likesSnap.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }));
      } catch (err) {
        console.error(err);
      }
    } else if (userUid) {
      try {
        const likeSnap = await getDoc(doc(collection(postRef, "likes"), userUid));
        const retainedLikes = (Array.isArray(meta.likes) ? meta.likes : []).filter((row) => String(row?.uid || "") !== userUid);
        meta.likes = likeSnap.exists()
          ? [{ id: likeSnap.id, ...likeSnap.data() }, ...retainedLikes]
          : retainedLikes;
      } catch (err) {
        console.error(err);
      }
    }
    if (includeComments) {
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
      } catch (err) {
        console.error(err);
      }
    }
    state.postMeta[postId] = meta;
    return meta;
  }

  async function loadPostLikesForModal(postId) {
    const targetId = String(postId || "");
    if (!targetId) return [];
    const post = findPostById(targetId);
    const postRef = getPostDocRef(post);
    if (!postRef) return [];
    const meta = await loadPostMetaFromFirebase(post, { includeLikes: true, includeComments: false });
    if (state.likesModal.open && String(state.likesModal.postId || "") === targetId) {
      renderOverlays({ updateProfile: false, updatePost: false, updateLikes: true });
    } else if (state.postModal.open && String(state.postModal.post?.id || "") === targetId) {
      updatePostModalCountsOnly();
    }
    return meta.likes || [];
  }

  async function updatePostCounts(post, { likesDelta = 0, commentsDelta = 0, skipRemote = false } = {}) {
    if (!post) return;
    const likeBase = Number(post.likes) || 0;
    const commentBase = Number(post.comments) || 0;
    if (likesDelta) post.likes = Math.max(0, likeBase + likesDelta);
    if (commentsDelta) post.comments = Math.max(0, commentBase + commentsDelta);
    const feedMatch = state.feedPosts.find((item) => String(item.id) === String(post.id));
    if (feedMatch) {
      if (likesDelta) feedMatch.likes = Math.max(0, (Number(feedMatch.likes) || 0) + likesDelta);
      if (commentsDelta) feedMatch.comments = Math.max(0, (Number(feedMatch.comments) || 0) + commentsDelta);
    }
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
    const meta = ensurePostMeta(postId);
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
      state.postModal.sending = false;
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
    try {
      await updatePostCounts(post, { commentsDelta: 1, skipRemote: true });
    } catch (err) {
      console.error(err);
    }
    updatePostCountNodes(post);
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
      state.postMeta[postId] = meta;
    }
    state.postModal.commentText = "";
    const commentInput = docObj?.getElementById("postCommentInput");
    if (commentInput) commentInput.value = "";
    state.postModal.replyTo = null;
    if (state.postModal.open && state.postModal.post && String(state.postModal.post.id) === String(postId)) {
      updatePostModalMeta();
      if (finalAvatar) scheduleCommentAvatarDomUpdate(user.uid || "", handleKey, finalAvatar);
      const postComments = docObj?.getElementById("postModalComments");
      if (postComments) hydrateCommentAvatars(postComments, { postId: postId });
    } else {
      renderOverlays();
    }
    refreshSelfCommentAvatars();
    state.postModal.sending = false;
    const ownerUid = await resolvePostOwnerUid(post);
    if (ownerUid && ownerUid !== state.user.uid) {
      try {
        await pushUserNotification(ownerUid, {
          type: "comment",
          user: user.name,
          userHandle: user.handle,
          userUid: user.uid || "",
          avatar: payload.avatar,
          text: "hat deinen Beitrag kommentiert",
          postId: String(post.id || ""),
          commentId: String(commentRef.id || ""),
          ownerType: post.ownerType || "",
          ownerId: post.ownerId || "",
          restaurantId: post.restaurantId || ""
        });
      } catch {}
    }
  }

  async function togglePostLike(postId) {
    if (!state.user) {
      openGuestAuthPrompt("Bitte registrieren oder einloggen, um Beitrage zu liken.");
      return;
    }
    const meta = ensurePostMeta(postId);
    const user = currentUserBadge();
    if (!user.uid) return;
    const post = findPostById(postId);
    const postRef = getPostDocRef(post);
    if (!post || !postRef) return;
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
      state.postMeta[postId] = meta;
      await updatePostCounts(post, { likesDelta: delta, skipRemote: true });
      if (state.postModal.open && state.postModal.post && String(state.postModal.post.id) === String(postId)) {
        updatePostModalCountsOnly();
      } else {
        renderOverlays();
      }
      if (delta > 0) {
        const ownerUid = await resolvePostOwnerUid(post);
        if (ownerUid && ownerUid !== state.user.uid) {
          await pushUserNotification(ownerUid, {
            type: "like",
            user: user.name,
            userHandle: user.handle,
            userUid: user.uid || "",
            avatar: user.avatar,
            text: "hat deinen Beitrag geliked",
            postId: String(post.id || ""),
            ownerType: post.ownerType || "",
            ownerId: post.ownerId || "",
            restaurantId: post.restaurantId || ""
          });
        }
      }
      updateShellDom();
    } catch (err) {
      console.error(err);
    }
  }

  async function toggleMenuItemLike() {
    if (!state.user) {
      openGuestAuthPrompt("Bitte registrieren oder einloggen, um Produkte zu liken.");
      return;
    }
    const ctx = getMenuDetailContext();
    if (!ctx) return;
    const { ref, key, item, restaurantId, itemId } = ctx;
    const user = currentUserBadge();
    if (!user.uid) return;
    const likeId = user.uid;
    const likeRef = doc(collection(ref, "likes"), likeId);
    const favoriteRef = doc(db, "users", user.uid, "menuFavorites", favoriteMenuItemDocId(restaurantId, itemId));
    let delta = 0;
    try {
      await runTransaction(db, async (tx) => {
        const likeSnap = await tx.get(likeRef);
        if (likeSnap.exists()) {
          tx.delete(likeRef);
          tx.delete(favoriteRef);
          delta = -1;
        } else {
          tx.set(likeRef, {
            uid: user.uid,
            name: user.name,
            handle: user.handle,
            avatar: user.avatar,
            createdAt: serverTimestamp()
          });
          tx.set(favoriteRef, buildFavoriteMenuItemPayload(item, restaurantId, { includeServerTimestamp: true }), { merge: true });
          delta = 1;
        }
        tx.set(ref, { likesCount: increment(delta) }, { merge: true });
      });
      if (!delta) return;
      const meta = ensureMenuItemMeta(key);
      if (delta < 0) {
        const idx = meta.likes.findIndex((item) => item.uid === user.uid || item.handle === user.handle);
        if (idx >= 0) meta.likes.splice(idx, 1);
      } else {
        meta.likes.unshift({ uid: user.uid, name: user.name, handle: user.handle, avatar: user.avatar });
      }
      meta.counts = meta.counts || { likes: 0, comments: 0 };
      meta.counts.likes = Math.max(0, (Number(meta.counts.likes) || 0) + delta);
      state.menuItemMeta[key] = meta;
      updateFavoriteMenuItemsLocal(item, restaurantId, { remove: delta < 0 });
      updateMenuDetailCountsOnly();
      updateMenuCardCountNodes(ctx.itemId, resolveMenuItemCounts(meta));
    } catch (err) {
      console.error(err);
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
    const dedupeKey = `${key}|${state.user.uid || ""}|${trimmed}`;
    const now = Date.now();
    if (dedupeKey === getLastMenuCommentKeyFn() && now - getLastMenuCommentAtFn() < 1500) return;
    setLastMenuCommentKeyFn(dedupeKey);
    setLastMenuCommentAtFn(now);
    if (state.menuDetail.sending) return;
    state.menuDetail.sending = true;
    updateMenuDetailCommentsOnly();
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
      state.menuDetail.sending = false;
      updateMenuDetailCommentsOnly();
      return;
    }
    const meta = ensureMenuItemMeta(key);
    const newComment = ensureCommentShape({
      id: commentRef.id,
      ...payload,
      createdAt: new Date().toISOString()
    });
    meta.comments = [newComment, ...(meta.comments || [])];
    meta.counts = meta.counts || { likes: 0, comments: 0 };
    meta.counts.comments = Math.max(0, (Number(meta.counts.comments) || 0) + 1);
    state.menuItemMeta[key] = meta;
    state.menuDetail.commentText = "";
    const input = docObj?.getElementById("menuDetailCommentInput");
    if (input) {
      input.value = "";
      autosizeTextarea(input, { minHeight: 52, maxHeight: 160 });
    }
    state.menuDetail.sending = false;
    updateMenuDetailMeta();
    updateMenuCardCountNodes(ctx.itemId, resolveMenuItemCounts(meta));
    if (finalAvatar) scheduleCommentAvatarDomUpdate(user.uid || "", handleKey, finalAvatar);
    refreshSelfCommentAvatars();
  }

  async function toggleCommentLike(postId, commentId, replyId) {
    if (!state.user) {
      openGuestAuthPrompt("Bitte registrieren oder einloggen, um Kommentare zu liken.");
      return;
    }
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
      post.likes = nextLikes;
      post.comments = nextComments;
      if (state.postModal.post && String(state.postModal.post.id) === postId) {
        state.postModal.post.likes = nextLikes;
        state.postModal.post.comments = nextComments;
      }
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
      return { ref, key: menuItemMetaKey(rid, itemId) };
    })();
    if (!ctx) return;
    const { ref, key } = ctx;
    setMenuDetailDocUnsubFn(onSnapshot(ref, (docSnap) => {
      if (!docSnap.exists()) return;
      const data = docSnap.data() || {};
      const meta = ensureMenuItemMeta(key);
      meta.counts = {
        likes: Number(data.likesCount ?? data.likes ?? meta.likes?.length ?? 0) || 0,
        comments: Number(data.commentsCount ?? data.comments ?? meta.comments?.length ?? 0) || 0
      };
      state.menuItemMeta[key] = meta;
      updateMenuDetailCountsOnly();
    }));
  }

  async function loadMenuItemMetaFromFirebase(item, restaurantId) {
    const ref = getMenuItemSocialDocRef(item, restaurantId);
    const rid = restaurantId || state.menu.restaurantId || state.profileView?.profile?.restaurantId || state.userProfile.restaurantId || "";
    const itemId = getMenuItemSocialId(item);
    if (!ref || !rid || !itemId) return;
    const key = menuItemMetaKey(rid, itemId);
    const meta = ensureMenuItemMeta(key);
    const userUid = String(state.user?.uid || "");
    if (userUid) {
      try {
        const likeSnap = await getDoc(doc(collection(ref, "likes"), userUid));
        const retainedLikes = (Array.isArray(meta.likes) ? meta.likes : []).filter((row) => String(row?.uid || "") !== userUid);
        meta.likes = likeSnap.exists()
          ? [{ id: likeSnap.id, ...likeSnap.data() }, ...retainedLikes]
          : retainedLikes;
      } catch (err) {
        console.error(err);
      }
    }
    try {
      const commentsSnap = await getDocs(query(collection(ref, "comments"), orderBy("createdAt", "desc"), limit(detailCommentsLimit)));
      const rows = commentsSnap.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }));
      meta.comments = rows.filter((row) => !row.parentId).map((row) => ensureCommentShape(row));
    } catch (err) {
      console.error(err);
    }
    state.menuItemMeta[key] = meta;
    return meta;
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
    getPostDocRef,
    getFeedDocRef,
    resolveRestaurantOwnerUid,
    resolvePostOwnerUid,
    loadPostMetaFromFirebase,
    loadPostLikesForModal
  };
}
