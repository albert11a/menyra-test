export function createSelfProfileRuntimeController({
  state = null,
  db = null,
  documentObj = null,
  windowObj = null,
  safeStorage = null,
  logoCacheKey = "",
  avatarKey = "",
  commentAvatarRemoteFetchEnabled = false,
  placeholderImage = "",
  getOptimizedImageUrl = (value) => String(value || "").trim(),
  isPlaceholderUrl = () => false,
  loadLogoCacheCoreFn = () => {},
  scheduleLogoCacheWriteCoreFn = () => {},
  loadAvatarCacheCoreFn = () => "",
  scheduleAvatarCacheWriteCoreFn = () => {},
  resolveRestaurantLogoCoreFn = () => "",
  resolveUserAvatarCoreFn = () => ({ url: "", nextUserAvatarCache: "", shouldScheduleWrite: false }),
  resolveShellAvatarUrlCoreFn = () => ({ url: "", nextUserAvatarCache: "", nextLastShellAvatarUrl: "", shouldScheduleWrite: false }),
  collectionFn = null,
  queryFn = null,
  whereFn = null,
  limitFn = null,
  docFn = null,
  getDocFn = async () => null,
  getDocFromServerFn = null,
  getDocsFn = async () => null,
  onSnapshotFn = null,
  setDocFn = async () => {},
  serverTimestampFn = () => null,
  updateProfileFn = async () => {},
  uploadCompressedImageFn = async () => ({}),
  ensureUserProfileFn = async () => ({}),
  ensurePostMetaFn = () => ({ comments: [] }),
  resolveUserByHandleFn = async () => null,
  ensureRestaurantPublicMetaFn = async () => {},
  syncCeoDirectoryProfilePatchFn = async () => {},
  resolveRestaurantForAuthUserFn = async () => null,
  saveUserProfileToStorage = () => {},
  writeAuthBootstrapSnapshot = () => {},
  syncPrivateSettingFromProfile = () => {},
  mergeRestaurants = (existing = []) => existing,
  rebuildBusinessLocations = () => {},
  render = () => {},
  updateShellDom = () => {},
  updateFeedDom = () => false,
  refreshSearchView = () => false,
  getLastRenderMode = () => "",
  normalizeHandle = (value = "") => String(value || "").trim().toLowerCase(),
  normalizeRoleList = (value = []) => (Array.isArray(value) ? value : []),
  resolvePreferredHandle = ({ handle = "", name = "" } = {}) => String(handle || name || "").trim().toLowerCase(),
  normalizeRestaurantType = (value = "") => String(value || "").trim(),
  normalizeLeadSettings = (value = null) => value,
  normalizeCeoCountry = (value = "") => String(value || "").trim(),
  normalizeCeoPath = (value = []) => (Array.isArray(value) ? value : []),
  hasStoredCeoCrmCounts = () => false,
  sanitizeCeoCrmCounts = (value = null) => value,
  pickCountValue = (...values) => {
    for (const value of values) {
      const numeric = Number(value);
      if (Number.isFinite(numeric)) return Math.max(0, numeric);
    }
    return 0;
  },
  sanitizeDisplayName = (value = "", fallback = "") => String(value || fallback || "").trim(),
  isLocalBusinessProfile = () => false,
  isCeoUser = () => false,
  getVerifiedMapLocation = () => null,
  getCeoGpsOverride = () => null,
  isRestaurantMarkedDeleted = () => false
} = {}) {
  const docObj = documentObj || (typeof document === "undefined" ? null : document);
  const win = windowObj || (typeof window === "undefined" ? null : window);
  const safeStorageObj = safeStorage || {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {}
  };
  const collection = typeof collectionFn === "function" ? collectionFn : null;
  const query = typeof queryFn === "function" ? queryFn : null;
  const where = typeof whereFn === "function" ? whereFn : null;
  const limit = typeof limitFn === "function" ? limitFn : null;
  const makeDocRef = typeof docFn === "function" ? docFn : null;
  const getDoc = typeof getDocFn === "function" ? getDocFn : (async () => null);
  const getDocFromServer = typeof getDocFromServerFn === "function" ? getDocFromServerFn : null;
  const getDocs = typeof getDocsFn === "function" ? getDocsFn : (async () => null);
  const onSnapshot = typeof onSnapshotFn === "function" ? onSnapshotFn : null;
  const setDoc = typeof setDocFn === "function" ? setDocFn : (async () => {});
  const updateProfile = typeof updateProfileFn === "function" ? updateProfileFn : (async () => {});
  const uploadCompressedImage = typeof uploadCompressedImageFn === "function"
    ? uploadCompressedImageFn
    : (async () => ({}));
  const ensureUserProfile = typeof ensureUserProfileFn === "function"
    ? ensureUserProfileFn
    : (async () => ({}));
  const ensurePostMeta = typeof ensurePostMetaFn === "function"
    ? ensurePostMetaFn
    : (() => ({ comments: [] }));
  const resolveUserByHandle = typeof resolveUserByHandleFn === "function"
    ? resolveUserByHandleFn
    : (async () => null);
  const ensureRestaurantPublicMeta = typeof ensureRestaurantPublicMetaFn === "function"
    ? ensureRestaurantPublicMetaFn
    : (async () => {});
  const syncCeoDirectoryProfilePatch = typeof syncCeoDirectoryProfilePatchFn === "function"
    ? syncCeoDirectoryProfilePatchFn
    : (async () => {});
  const resolveRestaurantForAuthUser = typeof resolveRestaurantForAuthUserFn === "function"
    ? resolveRestaurantForAuthUserFn
    : (async () => null);
  const commentAvatarCache = new Map();
  const commentAvatarPending = new Set();
  const userSearchAvatarCache = new Map();
  const restaurantLogoCache = new Map();
  let userAvatarCache = "";
  let lastShellAvatarUrl = "";
  let logoCacheWriteTimer = null;
  let avatarCacheWriteTimer = null;
  let userDocUnsub = null;
  let userDocLiveKey = "";

  function getUserAvatarCache() {
    return userAvatarCache;
  }

  function setUserAvatarCache(next) {
    userAvatarCache = String(next || "");
  }

  function getLastShellAvatarUrl() {
    return lastShellAvatarUrl;
  }

  function setLastShellAvatarUrl(next) {
    lastShellAvatarUrl = String(next || "");
  }

  function getActiveUid() {
    return state?.user?.uid || state?.userProfile?.uid || "";
  }

  function refreshProfileUi() {
    if (getLastRenderMode() === "main") {
      updateShellDom();
      if (state?.activeTab === "search" && refreshSearchView()) return;
      if (state?.activeTab === "feed") {
        const updatedFeed = updateFeedDom();
        if (!updatedFeed) render();
        return;
      }
    }
    render();
  }

  function stopCurrentUserProfileListener() {
    if (typeof userDocUnsub === "function") {
      try {
        userDocUnsub();
      } catch {}
    }
    userDocUnsub = null;
    userDocLiveKey = "";
  }

  function escapeSelector(value) {
    return String(value || "").replace(/([\"\\.#:[\],>+~*^$|= ])/g, "\\$1");
  }

  function loadLogoCache() {
    loadLogoCacheCoreFn({
      safeStorage: safeStorageObj,
      logoCacheKey,
      isPlaceholderUrl,
      restaurantLogoCache
    });
  }

  function scheduleLogoCacheWrite() {
    scheduleLogoCacheWriteCoreFn({
      windowObj: win,
      hasPendingTimer: !!logoCacheWriteTimer,
      setPendingTimer: (timer) => {
        logoCacheWriteTimer = timer;
      },
      safeStorage: safeStorageObj,
      logoCacheKey,
      restaurantLogoCache,
      delayMs: 400
    });
  }

  function loadAvatarCache(uid) {
    const cached = loadAvatarCacheCoreFn({
      uid,
      safeStorage: safeStorageObj,
      avatarKey
    });
    if (!cached) return "";
    setUserAvatarCache(cached);
    return cached;
  }

  function scheduleAvatarCacheWrite(url, uid = getActiveUid()) {
    scheduleAvatarCacheWriteCoreFn({
      windowObj: win,
      url,
      uid,
      isPlaceholderUrl,
      hasPendingTimer: !!avatarCacheWriteTimer,
      setPendingTimer: (timer) => {
        avatarCacheWriteTimer = timer;
      },
      safeStorage: safeStorageObj,
      avatarKey,
      onPersist: (persistedUid, persistedUrl) => {
        writeAuthBootstrapSnapshot({ uid: persistedUid, avatar: persistedUrl });
      },
      delayMs: 300
    });
  }

  function resolveRestaurantLogo(restaurantId, raw, size = "avatar", allowCacheFallback = true) {
    return resolveRestaurantLogoCoreFn({
      restaurantId,
      raw,
      size,
      allowCacheFallback,
      getOptimizedImageUrl,
      isPlaceholderUrl,
      restaurantLogoCache,
      onCacheUpdated: scheduleLogoCacheWrite
    });
  }

  function resolveUserAvatar(raw) {
    const result = resolveUserAvatarCoreFn({
      raw,
      userPhotoURL: state?.user?.photoURL || "",
      userAvatarCache,
      getOptimizedImageUrl,
      isPlaceholderUrl
    });
    if (result.nextUserAvatarCache && result.nextUserAvatarCache !== userAvatarCache) {
      userAvatarCache = result.nextUserAvatarCache;
    }
    if (result.shouldScheduleWrite && userAvatarCache) {
      scheduleAvatarCacheWrite(userAvatarCache);
    }
    return result.url;
  }

  function resolveShellAvatarUrl() {
    const result = resolveShellAvatarUrlCoreFn({
      profileAvatar: state?.userProfile?.avatar || "",
      userPhotoURL: state?.user?.photoURL || "",
      userAvatarCache,
      lastShellAvatarUrl,
      getOptimizedImageUrl,
      isPlaceholderUrl,
      placeholderImage
    });
    if (result.nextUserAvatarCache && result.nextUserAvatarCache !== userAvatarCache) {
      userAvatarCache = result.nextUserAvatarCache;
    }
    if (result.nextLastShellAvatarUrl && result.nextLastShellAvatarUrl !== lastShellAvatarUrl) {
      lastShellAvatarUrl = result.nextLastShellAvatarUrl;
    }
    if (result.shouldScheduleWrite && result.url && !isPlaceholderUrl(result.url)) {
      scheduleAvatarCacheWrite(result.url);
    }
    return result.url;
  }

  function getSelfAvatarUrl() {
    const raw = state?.userProfile?.avatar || state?.user?.photoURL || userAvatarCache || "";
    const url = getOptimizedImageUrl(raw, "avatar");
    return isPlaceholderUrl(url) ? "" : url;
  }

  function updateCommentAvatarNodes(handleKey, url) {
    if (!docObj || !handleKey || !url || isPlaceholderUrl(url)) return;
    const safe = escapeSelector(handleKey);
    docObj.querySelectorAll(`[data-comment-handle="${safe}"]`).forEach((img) => {
      if (!(img instanceof HTMLImageElement)) return;
      if (img.getAttribute("src") !== url) img.setAttribute("src", url);
    });
  }

  function updateCommentAvatarNodesByUid(uid, url) {
    if (!docObj || !uid || !url || isPlaceholderUrl(url)) return;
    const safe = escapeSelector(uid);
    docObj.querySelectorAll(`[data-comment-uid="${safe}"]`).forEach((img) => {
      if (!(img instanceof HTMLImageElement)) return;
      if (img.getAttribute("src") !== url) img.setAttribute("src", url);
    });
  }

  function updateCommentAvatarNodesById(commentId, url) {
    if (!docObj || !commentId || !url || isPlaceholderUrl(url)) return;
    const safe = escapeSelector(commentId);
    docObj.querySelectorAll(`img[data-img-key="comment-avatar:${safe}"]`).forEach((img) => {
      if (!(img instanceof HTMLImageElement)) return;
      if (img.getAttribute("src") !== url) img.setAttribute("src", url);
    });
  }

  function primeSelfAvatarCache(url) {
    if (!url || isPlaceholderUrl(url)) return;
    setUserAvatarCache(url);
    scheduleAvatarCacheWrite(url);
    if (state?.user?.uid) {
      commentAvatarCache.set(state.user.uid, url);
      updateCommentAvatarNodesByUid(state.user.uid, url);
    }
    const handleKey = normalizeHandle(state?.userProfile?.handle || state?.userProfile?.name || "");
    if (handleKey) {
      commentAvatarCache.set(handleKey, url);
      updateCommentAvatarNodes(handleKey, url);
    }
  }

  function resolveSearchUserAvatarDisplay(user) {
    const uid = user?.uid || "";
    const raw = user?.avatarUrl || user?.avatar || "";
    const url = getOptimizedImageUrl(raw, "avatar");
    if (!isPlaceholderUrl(url)) {
      if (uid && userSearchAvatarCache.get(uid) !== url) {
        userSearchAvatarCache.set(uid, url);
      }
      return url;
    }
    if (uid) {
      const cached = userSearchAvatarCache.get(uid);
      if (cached) return cached;
    }
    return getOptimizedImageUrl("", "avatar");
  }

  function resolveNotificationAvatar(notif) {
    const raw = notif?.img || notif?.avatar || "";
    const url = getOptimizedImageUrl(raw, "avatar");
    if (!isPlaceholderUrl(url)) return url;
    return getOptimizedImageUrl("", "avatar");
  }

  function resolveLikeAvatar(user) {
    const raw = user?.avatarUrl || user?.avatar || "";
    const url = getOptimizedImageUrl(raw, "avatar");
    if (!isPlaceholderUrl(url)) return url;
    return getOptimizedImageUrl("", "avatar");
  }

  function resolveCommentAvatar(comment) {
    if (!comment) return getOptimizedImageUrl("", "avatar");
    const handleKey = normalizeHandle(comment.handle || comment.author || "");
    const selfUid = state?.user?.uid || "";
    const selfHandle = normalizeHandle(state?.userProfile?.handle || state?.userProfile?.name || "");
    const isSelf = (!!selfUid && comment.uid && String(comment.uid) === String(selfUid))
      || (!!selfHandle && handleKey && handleKey === selfHandle);
    const selfAvatar = getSelfAvatarUrl();
    if (isSelf && selfAvatar) {
      primeSelfAvatarCache(selfAvatar);
      if (selfUid) commentAvatarCache.set(selfUid, selfAvatar);
      if (handleKey) commentAvatarCache.set(handleKey, selfAvatar);
      return selfAvatar;
    }
    const url = getOptimizedImageUrl(
      comment.avatarUrl || comment.avatar || comment.avatarURL || comment.photoURL || "",
      "avatar"
    );
    if (!isPlaceholderUrl(url)) {
      if (handleKey && commentAvatarCache.get(handleKey) !== url) {
        commentAvatarCache.set(handleKey, url);
      }
      if (comment.uid && commentAvatarCache.get(comment.uid) !== url) {
        commentAvatarCache.set(comment.uid, url);
      }
      return url;
    }
    if (handleKey) {
      const cached = commentAvatarCache.get(handleKey);
      if (cached) return cached;
    }
    if (comment.uid) {
      const cachedByUid = commentAvatarCache.get(comment.uid);
      if (cachedByUid) return cachedByUid;
      if (state?.user?.uid && comment.uid === state.user.uid) {
        const resolvedSelfAvatar = resolveUserAvatar(state?.userProfile?.avatar);
        if (!isPlaceholderUrl(resolvedSelfAvatar)) {
          commentAvatarCache.set(comment.uid, resolvedSelfAvatar);
          if (handleKey) commentAvatarCache.set(handleKey, resolvedSelfAvatar);
          return resolvedSelfAvatar;
        }
      }
    } else if (handleKey) {
      const selfKey = normalizeHandle(state?.userProfile?.handle || state?.userProfile?.name || "user");
      if (handleKey === selfKey) {
        const resolvedSelfAvatar = resolveUserAvatar(state?.userProfile?.avatar);
        if (!isPlaceholderUrl(resolvedSelfAvatar)) {
          commentAvatarCache.set(handleKey, resolvedSelfAvatar);
          return resolvedSelfAvatar;
        }
      }
    }
    return getOptimizedImageUrl("", "avatar");
  }

  function scheduleCommentAvatarDomUpdate(uid, handleKey, url) {
    if (!url || isPlaceholderUrl(url) || !win || typeof win.requestAnimationFrame !== "function") return;
    win.requestAnimationFrame(() => {
      if (uid) updateCommentAvatarNodesByUid(uid, url);
      if (handleKey) updateCommentAvatarNodes(handleKey, url);
    });
  }

  function refreshSelfCommentAvatars({ attempt = 0, maxAttempts = 6 } = {}) {
    const url = getSelfAvatarUrl() || userAvatarCache || "";
    if (!url || isPlaceholderUrl(url)) {
      if (attempt < maxAttempts && win && typeof win.setTimeout === "function") {
        win.setTimeout(() => refreshSelfCommentAvatars({ attempt: attempt + 1, maxAttempts }), 250);
      }
      return;
    }
    if (state?.user?.uid) updateCommentAvatarNodesByUid(state.user.uid, url);
    const handleKey = normalizeHandle(state?.userProfile?.handle || state?.userProfile?.name || "");
    if (handleKey) updateCommentAvatarNodes(handleKey, url);
  }

  function collectPostComments(postId) {
    if (!postId) return [];
    const meta = ensurePostMeta(postId);
    const all = [];
    (meta.comments || []).forEach((comment) => {
      if (!comment) return;
      all.push(comment);
      (comment.replies || []).forEach((reply) => {
        if (reply) all.push(reply);
      });
    });
    return all;
  }

  function hydrateCommentAvatars(containerEl, { postId = "" } = {}) {
    if (!containerEl || !docObj) return;
    const commentMap = new Map();
    if (postId) {
      collectPostComments(postId).forEach((comment) => {
        if (comment?.id) commentMap.set(String(comment.id), comment);
      });
    }
    containerEl.querySelectorAll("div[data-comment-id][data-comment-parent]").forEach((row) => {
      if (!(row instanceof HTMLElement)) return;
      if (row.querySelector("img.comment-avatar")) return;
      const commentId = row.dataset.commentId || "";
      const fromMap = commentId ? commentMap.get(String(commentId)) : null;
      const uid = fromMap?.uid || row.dataset.commentUid || "";
      const handle = fromMap?.handle || row.dataset.commentHandle || "";
      const raw = fromMap?.avatarUrl || fromMap?.avatar || "";
      const resolved = getOptimizedImageUrl(raw, "avatar");
      const safeSrc = (!resolved || isPlaceholderUrl(resolved)) ? placeholderImage : resolved;
      const img = docObj.createElement("img");
      img.className = "comment-avatar w-9 h-9 rounded-2xl object-cover shadow";
      img.src = safeSrc;
      img.loading = "lazy";
      img.decoding = "async";
      img.referrerPolicy = "no-referrer";
      img.alt = "";
      img.setAttribute("data-img-key", `comment-avatar:${commentId || ""}`);
      img.setAttribute("data-comment-id", commentId || "");
      img.setAttribute("data-comment-uid", uid);
      img.setAttribute("data-comment-handle", normalizeHandle(handle));
      img.setAttribute("data-uid", uid);
      img.setAttribute("data-handle", handle);
      img.onerror = () => {
        img.src = placeholderImage;
      };
      row.prepend(img);
    });
    const imgs = containerEl.querySelectorAll("img.comment-avatar[data-uid], img.comment-avatar[data-handle]");
    imgs.forEach((img) => {
      if (!(img instanceof HTMLImageElement)) return;
      const uid = img.getAttribute("data-uid") || "";
      const handle = img.getAttribute("data-handle") || "";
      const handleKey = normalizeHandle(handle);
      let cached = "";
      if (uid && commentAvatarCache.has(uid)) cached = commentAvatarCache.get(uid);
      else if (handleKey && commentAvatarCache.has(handleKey)) cached = commentAvatarCache.get(handleKey);
      if (cached && !isPlaceholderUrl(cached) && img.getAttribute("src") !== cached) {
        img.setAttribute("src", cached);
        return;
      }
      if (uid) {
        scheduleCommentAvatarFetch({
          id: img.getAttribute("data-comment-id") || "",
          uid,
          handle
        });
      }
    });
  }

  function applyCommentAvatarCache(root = docObj) {
    if (!root) return;
    const selfUid = state?.user?.uid || "";
    const selfHandle = normalizeHandle(state?.userProfile?.handle || state?.userProfile?.name || "");
    const cachedSelf = userAvatarCache && !isPlaceholderUrl(userAvatarCache) ? userAvatarCache : "";
    root.querySelectorAll("img[data-comment-uid], img[data-comment-handle]").forEach((img) => {
      if (!(img instanceof HTMLImageElement)) return;
      const uid = img.dataset.commentUid || "";
      const handleKey = img.dataset.commentHandle || "";
      let url = "";
      if (uid && commentAvatarCache.has(uid)) url = commentAvatarCache.get(uid);
      if (!url && handleKey && commentAvatarCache.has(handleKey)) url = commentAvatarCache.get(handleKey);
      if (!url && selfUid && uid === selfUid && cachedSelf) url = cachedSelf;
      if (!url && selfHandle && handleKey === selfHandle && cachedSelf) url = cachedSelf;
      if (url && !isPlaceholderUrl(url) && img.getAttribute("src") !== url) {
        img.setAttribute("src", url);
      }
    });
  }

  function scheduleCommentAvatarFetch(comment) {
    if (!commentAvatarRemoteFetchEnabled || !comment) return;
    const handleKey = normalizeHandle(comment.handle || comment.author || "");
    const commentId = comment.id ? String(comment.id) : "";
    if (comment.uid) {
      const uid = String(comment.uid);
      if (commentAvatarCache.has(uid) || commentAvatarPending.has(uid)) return;
      commentAvatarPending.add(uid);
      fetchUserDoc(uid).then((snap) => {
        commentAvatarPending.delete(uid);
        if (!snap || !snap.exists()) return;
        const data = snap.data() || {};
        const avatar = data.avatarUrl || data.avatar || data.avatarURL || data.photoURL || "";
        const url = getOptimizedImageUrl(avatar, "avatar");
        if (isPlaceholderUrl(url)) return;
        commentAvatarCache.set(uid, url);
        if (handleKey) commentAvatarCache.set(handleKey, url);
        scheduleCommentAvatarDomUpdate(uid, handleKey, url);
        if (commentId) updateCommentAvatarNodesById(commentId, url);
      }).catch(() => {
        commentAvatarPending.delete(uid);
      });
      return;
    }
    if (!handleKey || commentAvatarCache.has(handleKey) || commentAvatarPending.has(handleKey)) return;
    commentAvatarPending.add(handleKey);
    resolveUserByHandle(handleKey).then((resolved) => {
      commentAvatarPending.delete(handleKey);
      const data = resolved?.data || {};
      const avatar = data.avatarUrl || data.avatar || "";
      const url = getOptimizedImageUrl(avatar, "avatar");
      if (isPlaceholderUrl(url)) return;
      commentAvatarCache.set(handleKey, url);
      scheduleCommentAvatarDomUpdate("", handleKey, url);
      if (commentId) updateCommentAvatarNodesById(commentId, url);
    }).catch(() => {
      commentAvatarPending.delete(handleKey);
    });
  }

  function normalizeProfile(data, user) {
    const displayName = data?.displayName || user?.displayName || user?.email?.split("@")[0] || "User";
    const roles = normalizeRoleList(data?.roles || data?.role || "");
    const lat = data?.gpsLat ?? data?.lat ?? null;
    const lng = data?.gpsLng ?? data?.lng ?? null;
    const permissions = data?.permissions && typeof data.permissions === "object" ? data.permissions : {};
    const businessAccess = data?.businessAccess === true || permissions.businessAccess === true;
    const waiterAccess = data?.waiterAccess === true || permissions.waiterAccess === true;
    const sourceUserRole = String(data?.sourceUserRole || data?.role || "user").trim().toLowerCase() || "user";
    return {
      name: displayName,
      handle: data?.handle || normalizeHandle(displayName),
      bio: data?.bio || data?.description || "",
      avatar: data?.avatarUrl || data?.avatar || user?.photoURL || "",
      location: data?.city || "Prishtina",
      place: data?.place || data?.locationPlace || data?.locality || data?.district || "",
      locationPlace: data?.locationPlace || data?.place || data?.locality || data?.district || "",
      address: data?.address || "",
      followers: pickCountValue(data?.followersCount, data?.followers, data?.fansCount, data?.fans),
      following: pickCountValue(data?.followingCount, data?.following),
      privateAccount: !!data?.privateAccount,
      karma: String(data?.score ?? "0"),
      roles,
      role: data?.role || "user",
      sourceUserRole,
      isPremium: data?.isPremium || false,
      restaurantId: data?.restaurantId || "",
      staffRestaurantId: data?.staffRestaurantId || "",
      waiterRestaurantId: data?.waiterRestaurantId || "",
      businessAccess,
      waiterAccess,
      permissions: {
        businessAccess,
        waiterAccess
      },
      staffRole: data?.staffRole || "",
      businessOwnerUid: data?.businessOwnerUid || "",
      staffActive: data?.staffActive === false ? false : String(data?.staffStatus || "").trim().toLowerCase() !== "disabled",
      staffStatus: data?.staffStatus || "",
      leadSettings: normalizeLeadSettings(data?.leadSettings || null),
      country: normalizeCeoCountry(data?.country),
      ceoParentUid: data?.ceoParentUid || data?.parentCeoUid || "",
      ceoParentName: data?.ceoParentName || data?.parentCeoName || "",
      ceoRootUid: data?.ceoRootUid || data?.rootCeoUid || "",
      ceoRootName: data?.ceoRootName || data?.rootCeoName || "",
      ceoPath: normalizeCeoPath(data?.ceoPath),
      crmCounts: hasStoredCeoCrmCounts(data?.crmCounts) ? sanitizeCeoCrmCounts(data.crmCounts) : null,
      lat: Number.isFinite(Number(lat)) ? Number(lat) : null,
      lng: Number.isFinite(Number(lng)) ? Number(lng) : null,
      gpsLat: Number.isFinite(Number(lat)) ? Number(lat) : null,
      gpsLng: Number.isFinite(Number(lng)) ? Number(lng) : null,
      posts: []
    };
  }

  function hasCountValue(...values) {
    return values.some((value) => Number.isFinite(Number(value)));
  }

  function applyWorkspaceAccessContext(profile = {}, source = {}) {
    const base = profile && typeof profile === "object" ? profile : {};
    const context = source && typeof source === "object" ? source : {};
    const permissions = context?.permissions && typeof context.permissions === "object" ? context.permissions : {};
    const sourceUserRole = String(context?.sourceUserRole || context?.role || "").trim().toLowerCase();
    const isStaffContext = sourceUserRole === "staff";
    const businessAccess = isStaffContext
      ? (context?.businessAccess === true || permissions.businessAccess === true)
      : true;
    const waiterAccess = isStaffContext
      ? (context?.waiterAccess === true || permissions.waiterAccess === true)
      : true;
    return {
      ...base,
      sourceUserRole: isStaffContext
        ? "staff"
        : (sourceUserRole || String(base?.sourceUserRole || base?.role || "").trim().toLowerCase() || "business"),
      businessAccess,
      waiterAccess,
      permissions: {
        businessAccess,
        waiterAccess
      },
      staffRole: isStaffContext ? String(context?.staffRole || "").trim() : "",
      businessOwnerUid: isStaffContext ? String(context?.businessOwnerUid || "").trim() : "",
      staffRestaurantId: isStaffContext ? String(context?.staffRestaurantId || "").trim() : "",
      waiterRestaurantId: isStaffContext
        ? String(context?.waiterRestaurantId || context?.staffRestaurantId || base?.restaurantId || "").trim()
        : String(base?.restaurantId || "").trim(),
      staffActive: isStaffContext
        ? (context?.staffActive === false ? false : String(context?.staffStatus || "").trim().toLowerCase() !== "disabled")
        : true,
      staffStatus: isStaffContext ? String(context?.staffStatus || "").trim() : ""
    };
  }

  function normalizeBusinessProfile(rest = {}, user) {
    const displayName = rest?.name || rest?.restaurantName || user?.displayName || user?.email?.split("@")[0] || "Business";
    const handle = resolvePreferredHandle({ handle: rest?.handle || "", name: displayName }, displayName);
    const lat = rest?.gpsLat ?? rest?.lat ?? null;
    const lng = rest?.gpsLng ?? rest?.lng ?? null;
    const type = normalizeRestaurantType(rest?.type || rest?.customerType || rest?.category || rest?.kind || rest?.restaurantType || "");
    return {
      name: displayName,
      handle: handle || normalizeHandle(displayName),
      bio: rest?.bio || rest?.description || rest?.about || "",
      avatar: rest?.logoUrl || rest?.logo || "",
      location: rest?.city || "Prishtina",
      place: rest?.place || rest?.locationPlace || rest?.locality || rest?.district || "",
      locationPlace: rest?.locationPlace || rest?.place || rest?.locality || rest?.district || "",
      address: rest?.address || "",
      followers: pickCountValue(rest?.followersCount, rest?.followers, rest?.fansCount, rest?.fans),
      following: pickCountValue(rest?.followingCount, rest?.following),
      privateAccount: false,
      karma: "0",
      roles: normalizeRoleList(rest?.roles || "owner"),
      role: "business",
      isPremium: rest?.isPremium || false,
      restaurantId: rest?.id || rest?.restaurantId || "",
      phone: rest?.phone || "",
      instagram: rest?.instagram || rest?.insta || "",
      ...(type ? { type, customerType: type } : {}),
      lat: Number.isFinite(Number(lat)) ? Number(lat) : null,
      lng: Number.isFinite(Number(lng)) ? Number(lng) : null,
      gpsLat: Number.isFinite(Number(lat)) ? Number(lat) : null,
      gpsLng: Number.isFinite(Number(lng)) ? Number(lng) : null,
      posts: []
    };
  }

  function syncSelfAvatarCachesFromProfile(profile = state?.userProfile) {
    const resolvedAvatar = getOptimizedImageUrl(profile?.avatar || "", "avatar");
    if (isPlaceholderUrl(resolvedAvatar)) return "";
    primeSelfAvatarCache(resolvedAvatar);
    return resolvedAvatar;
  }

  function commitLiveSelfProfile(normalized, { syncPrivate = true } = {}) {
    if (!normalized || typeof normalized !== "object") return;
    state.userProfile = normalized;
    if (state?.user?.uid) state.userProfile.uid = state.user.uid;
    if (syncPrivate) syncPrivateSettingFromProfile(normalized.privateAccount);
    saveUserProfileToStorage();
    syncSelfAvatarCachesFromProfile(state.userProfile);
    refreshProfileUi();
  }

  function applyLiveUserProfileSnapshot(data = {}) {
    if (!state?.user) return;
    const prevAvatar = state.userProfile?.avatar || "";
    const seed = {
      displayName: state.userProfile?.name || "",
      handle: state.userProfile?.handle || "",
      bio: state.userProfile?.bio || "",
      avatarUrl: state.userProfile?.avatar || "",
      city: state.userProfile?.location || "",
      address: state.userProfile?.address || "",
      followersCount: state.userProfile?.followers ?? 0,
      followingCount: state.userProfile?.following ?? 0,
      privateAccount: !!state.userProfile?.privateAccount,
      score: Number(state.userProfile?.karma || 0),
      roles: state.userProfile?.roles || [],
      role: state.userProfile?.role || "user",
      restaurantId: state.userProfile?.restaurantId || "",
      leadSettings: state.userProfile?.leadSettings || null,
      country: state.userProfile?.country || "",
      ceoParentUid: state.userProfile?.ceoParentUid || "",
      ceoParentName: state.userProfile?.ceoParentName || "",
      ceoRootUid: state.userProfile?.ceoRootUid || "",
      ceoRootName: state.userProfile?.ceoRootName || "",
      ceoPath: Array.isArray(state.userProfile?.ceoPath) ? state.userProfile.ceoPath.slice() : [],
      crmCounts: state.userProfile?.crmCounts || null,
      gpsLat: state.userProfile?.gpsLat ?? state.userProfile?.lat ?? null,
      gpsLng: state.userProfile?.gpsLng ?? state.userProfile?.lng ?? null,
      ...(data || {})
    };
    const normalized = normalizeProfile(seed, state.user);
    const normalizedResolved = getOptimizedImageUrl(normalized.avatar || "", "avatar");
    if ((!normalized.avatar || isPlaceholderUrl(normalizedResolved)) && prevAvatar) {
      normalized.avatar = prevAvatar;
    }
    normalized.uid = state.user.uid;
    commitLiveSelfProfile(normalized);
  }

  function applyLiveBusinessProfileSnapshot(restData = {}, restaurantId = "") {
    if (!state?.user) return;
    const safeRestaurantId = String(
      restaurantId
      || restData?.id
      || restData?.restaurantId
      || state.userProfile?.restaurantId
      || ""
    ).trim();
    if (!safeRestaurantId) return;
    const prevAvatar = state.userProfile?.avatar || "";
    const seed = {
      id: safeRestaurantId,
      restaurantId: safeRestaurantId,
      name: state.userProfile?.name || "",
      restaurantName: state.userProfile?.name || "",
      handle: state.userProfile?.handle || "",
      bio: state.userProfile?.bio || "",
      description: state.userProfile?.bio || "",
      logoUrl: state.userProfile?.avatar || "",
      city: state.userProfile?.location || "",
      address: state.userProfile?.address || "",
      followersCount: state.userProfile?.followers ?? 0,
      followingCount: state.userProfile?.following ?? 0,
      phone: state.userProfile?.phone || "",
      instagram: state.userProfile?.instagram || "",
      roles: state.userProfile?.roles || ["owner"],
      type: state.userProfile?.type || state.userProfile?.customerType || "",
      customerType: state.userProfile?.customerType || state.userProfile?.type || "",
      gpsLat: state.userProfile?.gpsLat ?? state.userProfile?.lat ?? null,
      gpsLng: state.userProfile?.gpsLng ?? state.userProfile?.lng ?? null,
      ...(restData || {}),
      id: safeRestaurantId,
      restaurantId: safeRestaurantId
    };
    const isStaffWorkspace = String(state?.userProfile?.sourceUserRole || "").trim().toLowerCase() === "staff";
    const normalized = isStaffWorkspace
      ? applyWorkspaceAccessContext(
        normalizeBusinessProfile(seed, state.user),
        state.userProfile
      )
      : normalizeBusinessProfile(seed, state.user);
    const normalizedResolved = getOptimizedImageUrl(normalized.avatar || "", "avatar");
    if ((!normalized.avatar || isPlaceholderUrl(normalizedResolved)) && prevAvatar) {
      normalized.avatar = prevAvatar;
    }
    normalized.uid = state.user.uid;
    state.restaurants = mergeRestaurants(state.restaurants, [{ id: safeRestaurantId, ...seed }]);
    rebuildBusinessLocations();
    commitLiveSelfProfile(normalized, { syncPrivate: false });
  }

  function attachCurrentUserProfileListener() {
    const uid = String(state?.user?.uid || "").trim();
    if (!uid || !makeDocRef || !onSnapshot || !db) return;
    const restaurantId = String(state?.userProfile?.restaurantId || "").trim();
    const useRestaurantDoc = !!(restaurantId && isLocalBusinessProfile(state?.userProfile));
    const nextKey = useRestaurantDoc ? `restaurant:${restaurantId}` : `user:${uid}`;
    if (userDocUnsub && userDocLiveKey === nextKey) return;
    stopCurrentUserProfileListener();
    userDocLiveKey = nextKey;
    const listenerPath = useRestaurantDoc ? `restaurants/${restaurantId}` : `users/${uid}`;
    const ref = useRestaurantDoc ? makeDocRef(db, "restaurants", restaurantId) : makeDocRef(db, "users", uid);
    userDocUnsub = onSnapshot(ref, (snap) => {
      if (!snap.exists()) return;
      const data = snap.data() || {};
      if (useRestaurantDoc) {
        applyLiveBusinessProfileSnapshot({ id: restaurantId, ...data }, restaurantId);
        return;
      }
      applyLiveUserProfileSnapshot(data);
    }, (err) => {
      console.error(`[mnyra][firestore.listen.selfProfile] ${listenerPath}`, err);
    });
  }

  async function fetchUserDoc(uid) {
    if (!uid || !makeDocRef || !db) return null;
    const ref = makeDocRef(db, "users", uid);
    let snap = null;
    if (getDocFromServer) {
      try {
        snap = await getDocFromServer(ref);
      } catch {}
    }
    try {
      snap = snap || await getDoc(ref);
    } catch {
      snap = null;
    }
    if (snap && typeof snap.exists === "function" && snap.exists()) return snap;
    if (!collection || !query || !where || !limit) return snap;
    try {
      const restSnap = await getDocs(query(collection(db, "restaurants"), where("ownerUid", "==", uid), limit(1)));
      if (!restSnap.empty) {
        const docSnap = restSnap.docs[0];
        const data = docSnap.data() || {};
        const payload = { ...data };
        if (!payload.avatarUrl && (payload.logoUrl || payload.logo)) {
          payload.avatarUrl = payload.logoUrl || payload.logo || "";
        }
        return {
          id: docSnap.id,
          exists: () => true,
          data: () => payload
        };
      }
    } catch {}
    return snap;
  }

  function fallbackSelfAvatarFromState() {
    const existing = getOptimizedImageUrl(state?.userProfile?.avatar || "", "avatar");
    if (!isPlaceholderUrl(existing)) return existing;
    if (userAvatarCache && !isPlaceholderUrl(userAvatarCache)) return userAvatarCache;
    return "";
  }

  async function ensureSelfAvatarReady({ force = false } = {}) {
    if (!state?.user?.uid || !makeDocRef || !db) return "";
    if (!force) {
      const cached = fallbackSelfAvatarFromState();
      if (cached) return cached;
    }

    try {
      if (isLocalBusinessProfile(state.userProfile) && state.userProfile.restaurantId) {
        const restSnap = await getDoc(makeDocRef(db, "restaurants", state.userProfile.restaurantId));
        if (restSnap.exists()) {
          const restData = restSnap.data() || {};
          const raw = restData.logoUrl || restData.logo || "";
          const resolved = getOptimizedImageUrl(raw, "avatar");
          if (!isPlaceholderUrl(resolved)) {
            state.userProfile.avatar = raw;
            primeSelfAvatarCache(resolved);
            return resolved;
          }
        }
        return fallbackSelfAvatarFromState();
      }

      const snap = await fetchUserDoc(state.user.uid);
      if (!snap) return fallbackSelfAvatarFromState();
      const data = snap.exists() ? snap.data() : {};
      const raw = data.avatarUrl || data.avatar || data.avatarURL || data.photoURL || state.user?.photoURL || "";
      const resolved = getOptimizedImageUrl(raw, "avatar");
      if (!isPlaceholderUrl(resolved)) {
        state.userProfile.avatar = raw;
        primeSelfAvatarCache(resolved);
        return resolved;
      }

      const authUrl = state.user?.photoURL || "";
      if (authUrl) {
        const authResolved = getOptimizedImageUrl(authUrl, "avatar");
        if (!isPlaceholderUrl(authResolved)) {
          try {
            await setDoc(makeDocRef(db, "users", state.user.uid), {
              avatarUrl: authUrl,
              updatedAt: serverTimestampFn()
            }, { merge: true });
          } catch {}
          state.userProfile.avatar = authUrl;
          primeSelfAvatarCache(authResolved);
          return authResolved;
        }
      }
    } catch (err) {
      console.error("ensureSelfAvatarReady failed", err);
    }

    const authFallback = state?.user?.photoURL ? getOptimizedImageUrl(state.user.photoURL, "avatar") : "";
    if (authFallback && !isPlaceholderUrl(authFallback)) return authFallback;
    return fallbackSelfAvatarFromState();
  }

  function currentUserBadge() {
    const avatarRaw = state?.userProfile?.avatar || state?.user?.photoURL || "";
    const resolvedAvatar = resolveUserAvatar(avatarRaw);
    const finalAvatar = isPlaceholderUrl(resolvedAvatar) ? "" : resolvedAvatar;
    if (finalAvatar) primeSelfAvatarCache(finalAvatar);
    return {
      uid: state?.user?.uid || "",
      name: state?.userProfile?.name || "User",
      handle: state?.userProfile?.handle || "user",
      avatar: finalAvatar
    };
  }

  async function uploadAvatar(file) {
    if (!state?.user || !makeDocRef || !db) return;
    try {
      const isBusiness = isLocalBusinessProfile(state.userProfile);
      const ownerId = isBusiness ? state.userProfile.restaurantId : state.user.uid;
      const { cdnUrl } = await uploadCompressedImage(file, ownerId, {
        maxSize: 512,
        quality: 0.80,
        mimeType: "image/jpeg"
      });
      if (isBusiness && state.userProfile.restaurantId) {
        await setDoc(makeDocRef(db, "restaurants", state.userProfile.restaurantId), {
          logoUrl: cdnUrl,
          logo: cdnUrl,
          updatedAt: serverTimestampFn()
        }, { merge: true });
        const rest = state.restaurants.find((row) => String(row.id) === String(state.userProfile.restaurantId)) || {};
        await ensureRestaurantPublicMeta(state.userProfile.restaurantId, {
          name: rest.name || rest.restaurantName || state.userProfile.name,
          restaurantName: rest.restaurantName || rest.name || state.userProfile.name,
          type: rest.type || rest.customerType || "cafe",
          city: rest.city || state.userProfile.location || "",
          logoUrl: cdnUrl,
          logo: cdnUrl
        });
        state.restaurants = mergeRestaurants(state.restaurants, [{
          id: state.userProfile.restaurantId,
          ...rest,
          logoUrl: cdnUrl,
          logo: cdnUrl
        }]);
        rebuildBusinessLocations();
      } else {
        await setDoc(makeDocRef(db, "users", state.user.uid), {
          avatarUrl: cdnUrl,
          avatar: cdnUrl,
          updatedAt: serverTimestampFn()
        }, { merge: true });
        await syncCeoDirectoryProfilePatch({
          avatarUrl: cdnUrl
        });
      }
      state.userProfile.avatar = cdnUrl;
      saveUserProfileToStorage();
      primeSelfAvatarCache(getOptimizedImageUrl(cdnUrl, "avatar"));
      refreshSelfCommentAvatars();
      render();
    } catch (err) {
      console.error(err);
    }
  }

  async function saveAccountSettings() {
    if (!state?.user || !docObj || !makeDocRef || !db) return;
    const name = docObj.getElementById("settingsName")?.value?.trim() || state.userProfile.name || "User";
    const handle = docObj.getElementById("settingsHandle")?.value?.trim() || state.userProfile.handle || normalizeHandle(name);
    const bio = docObj.getElementById("settingsBio")?.value?.trim() || "";
    const city = docObj.getElementById("settingsCity")?.value?.trim() || "Prishtina";
    const place = docObj.getElementById("settingsPlace")?.value?.trim() || "";
    const address = docObj.getElementById("settingsAddress")?.value?.trim() || "";
    const restaurantId = state.userProfile.restaurantId || "";
    const allowCeoOverride = isCeoUser();
    const verifiedMapLocation = getVerifiedMapLocation();
    const gpsCoords = verifiedMapLocation
      ? { lat: Number(verifiedMapLocation.lat), lng: Number(verifiedMapLocation.lng) }
      : null;
    const fallbackCeoCoords = allowCeoOverride ? getCeoGpsOverride() : null;
    const effectiveGps = gpsCoords
      || (fallbackCeoCoords && Number.isFinite(Number(fallbackCeoCoords.lat)) && Number.isFinite(Number(fallbackCeoCoords.lng))
        ? { lat: Number(fallbackCeoCoords.lat), lng: Number(fallbackCeoCoords.lng) }
        : null);

    const statusEl = docObj.getElementById("settingsStatus");
    if (statusEl) statusEl.textContent = "Speichere Profil...";

    try {
      const isBusiness = isLocalBusinessProfile(state.userProfile);
      if (isBusiness && restaurantId) {
        const restPayload = {
          name,
          restaurantName: name,
          handle,
          bio,
          description: bio,
          city,
          place,
          locationPlace: place,
          address,
          updatedAt: serverTimestampFn()
        };
        if (effectiveGps && Number.isFinite(effectiveGps.lat) && Number.isFinite(effectiveGps.lng)) {
          restPayload.lat = effectiveGps.lat;
          restPayload.lng = effectiveGps.lng;
        }
        await setDoc(makeDocRef(db, "restaurants", restaurantId), restPayload, { merge: true });
        const rest = state.restaurants.find((row) => String(row.id) === String(restaurantId)) || {};
        await ensureRestaurantPublicMeta(restaurantId, {
          name,
          restaurantName: name,
          type: rest.type || rest.customerType || "cafe",
          city,
          place,
          locationPlace: place,
          logoUrl: rest.logoUrl || rest.logo || "",
          logo: rest.logo || rest.logoUrl || ""
        });
        state.restaurants = mergeRestaurants(state.restaurants, [{ id: restaurantId, ...rest, ...restPayload }]);
        rebuildBusinessLocations();
      } else {
        const payload = {
          displayName: name,
          handle,
          bio,
          city,
          place,
          locationPlace: place,
          restaurantId,
          updatedAt: serverTimestampFn()
        };
        await setDoc(makeDocRef(db, "users", state.user.uid), payload, { merge: true });
        await syncCeoDirectoryProfilePatch({
          name,
          displayName: name,
          handle,
          city,
          place,
          locationPlace: place,
          locationLabel: city,
          ...(effectiveGps && Number.isFinite(effectiveGps.lat) && Number.isFinite(effectiveGps.lng)
            ? {
              lat: effectiveGps.lat,
              lng: effectiveGps.lng,
              gpsLat: effectiveGps.lat,
              gpsLng: effectiveGps.lng
            }
            : {})
        });
      }

      if (allowCeoOverride) {
        const userGpsPayload = {
          handle,
          city,
          place,
          locationPlace: place,
          address,
          updatedAt: serverTimestampFn()
        };
        if (effectiveGps && Number.isFinite(effectiveGps.lat) && Number.isFinite(effectiveGps.lng)) {
          userGpsPayload.lat = effectiveGps.lat;
          userGpsPayload.lng = effectiveGps.lng;
          userGpsPayload.gpsLat = effectiveGps.lat;
          userGpsPayload.gpsLng = effectiveGps.lng;
        }
        await setDoc(makeDocRef(db, "users", state.user.uid), userGpsPayload, { merge: true });
      }

      await updateProfile(state.user, { displayName: name });
      state.userProfile = {
        ...state.userProfile,
        name,
        handle,
        bio,
        location: city,
        place,
        locationPlace: place,
        address,
        restaurantId
      };
      if (effectiveGps && Number.isFinite(effectiveGps.lat) && Number.isFinite(effectiveGps.lng)) {
        state.userProfile.lat = effectiveGps.lat;
        state.userProfile.lng = effectiveGps.lng;
        if (allowCeoOverride) {
          state.userProfile.gpsLat = effectiveGps.lat;
          state.userProfile.gpsLng = effectiveGps.lng;
        }
      }

      saveUserProfileToStorage();
      attachCurrentUserProfileListener();

      if (statusEl) statusEl.textContent = "Erfolgreich gespeichert!";
      if (win && typeof win.setTimeout === "function") {
        win.setTimeout(() => {
          if (statusEl) statusEl.textContent = "";
        }, 2000);
      }
    } catch (err) {
      console.error(err);
      if (statusEl) statusEl.textContent = "Fehler beim Speichern.";
    }
  }

  async function loadUserProfile(user, { force = false } = {}) {
    if (!user) return;
    const ensured = await ensureUserProfile(user, { city: "Prishtina" });
    void force;
    const data = ensured && typeof ensured === "object" ? ensured : {};
    const prevAvatar = state.userProfile?.avatar || "";
    const normalized = normalizeProfile(data, user);
    const normalizedResolved = getOptimizedImageUrl(normalized.avatar || "", "avatar");
    if ((!normalized.avatar || isPlaceholderUrl(normalizedResolved)) && prevAvatar) {
      normalized.avatar = prevAvatar;
    }
    state.userProfile = normalized;
    state.userProfile.uid = user.uid;
    syncPrivateSettingFromProfile(normalized.privateAccount);
    saveUserProfileToStorage();
    attachCurrentUserProfileListener();
    const resolvedAvatar = getOptimizedImageUrl(state.userProfile.avatar || "", "avatar");
    if (!isPlaceholderUrl(resolvedAvatar)) {
      primeSelfAvatarCache(resolvedAvatar);
    }
    refreshProfileUi();
    return normalized;
  }

  async function loadBusinessProfile(user, { restaurant = null, force = false } = {}) {
    if (!user || !makeDocRef || !db) return;
    const rest = restaurant || await resolveRestaurantForAuthUser(user, { preferCached: !force });
    if (!rest || isRestaurantMarkedDeleted(rest)) {
      await loadUserProfile(user, { force });
      return;
    }
    let profileSeed = { ...rest };
    const prevAvatar = state.userProfile?.avatar || "";
    const normalized = normalizeBusinessProfile(profileSeed, user);
    normalized.uid = user.uid;
    const normalizedResolved = getOptimizedImageUrl(normalized.avatar || "", "avatar");
    if ((!normalized.avatar || isPlaceholderUrl(normalizedResolved)) && prevAvatar) {
      normalized.avatar = prevAvatar;
    }
    if (!hasCountValue(profileSeed.followingCount, profileSeed.following)) {
      normalized.following = state.userProfile?.following ?? normalized.following;
    }
    if (!hasCountValue(profileSeed.followersCount, profileSeed.followers, profileSeed.fansCount, profileSeed.fans)) {
      normalized.followers = state.userProfile?.followers ?? normalized.followers;
    }
    state.userProfile = normalized;
    state.userProfile.uid = user.uid;
    syncPrivateSettingFromProfile(false);
    saveUserProfileToStorage();
    attachCurrentUserProfileListener();
    const resolvedAvatar = getOptimizedImageUrl(state.userProfile.avatar || "", "avatar");
    if (!isPlaceholderUrl(resolvedAvatar)) {
      primeSelfAvatarCache(resolvedAvatar);
    }
    if (rest?.id) {
      const identityPatch = { id: rest.id, ...rest };
      const fallbackName = String(profileSeed.name || profileSeed.restaurantName || "").trim();
      const fallbackLogo = String(profileSeed.logoUrl || profileSeed.logo || "").trim();
      const fallbackCity = String(profileSeed.city || "").trim();
      if (!String(identityPatch.name || identityPatch.restaurantName || "").trim() && fallbackName) {
        identityPatch.name = fallbackName;
        identityPatch.restaurantName = fallbackName;
      }
      if (!String(identityPatch.logoUrl || identityPatch.logo || identityPatch.logoURL || "").trim() && fallbackLogo) {
        identityPatch.logoUrl = fallbackLogo;
        identityPatch.logo = fallbackLogo;
      }
      if (!String(identityPatch.city || "").trim() && fallbackCity) {
        identityPatch.city = fallbackCity;
      }
      state.restaurants = mergeRestaurants(state.restaurants, [identityPatch]);
      rebuildBusinessLocations();
    }
    refreshProfileUi();
  }

  async function loadBusinessStaffProfile(user, { restaurant = null, staffData = null, force = false } = {}) {
    if (!user || !makeDocRef || !db) return;
    const context = staffData && typeof staffData === "object" ? staffData : {};
    const restaurantId = String(
      restaurant?.id
      || restaurant?.restaurantId
      || context?.staffRestaurantId
      || context?.waiterRestaurantId
      || context?.restaurantId
      || ""
    ).trim();
    if (!restaurantId) {
      await loadUserProfile(user, { force });
      return;
    }
    let rest = restaurant;
    if (!rest) {
      try {
        const restSnap = await getDoc(makeDocRef(db, "restaurants", restaurantId));
        if (restSnap.exists()) {
          rest = { id: restSnap.id, ...(restSnap.data() || {}) };
        }
      } catch {}
    }
    if (!rest || isRestaurantMarkedDeleted(rest)) {
      await loadUserProfile(user, { force });
      return;
    }
    const prevAvatar = state.userProfile?.avatar || "";
    const normalized = applyWorkspaceAccessContext(
      normalizeBusinessProfile({ ...rest, id: restaurantId, restaurantId }, user),
      {
        ...context,
        sourceUserRole: "staff",
        role: "staff",
        staffRestaurantId: restaurantId,
        waiterRestaurantId: context?.waiterRestaurantId || restaurantId
      }
    );
    normalized.uid = user.uid;
    const normalizedResolved = getOptimizedImageUrl(normalized.avatar || "", "avatar");
    if ((!normalized.avatar || isPlaceholderUrl(normalizedResolved)) && prevAvatar) {
      normalized.avatar = prevAvatar;
    }
    state.userProfile = normalized;
    state.userProfile.uid = user.uid;
    syncPrivateSettingFromProfile(false);
    saveUserProfileToStorage();
    attachCurrentUserProfileListener();
    const resolvedAvatar = getOptimizedImageUrl(state.userProfile.avatar || "", "avatar");
    if (!isPlaceholderUrl(resolvedAvatar)) {
      primeSelfAvatarCache(resolvedAvatar);
    }
    state.restaurants = mergeRestaurants(state.restaurants, [{ id: restaurantId, ...rest }]);
    rebuildBusinessLocations();
    refreshProfileUi();
  }

  return {
    commentAvatarCache,
    commentAvatarPending,
    userSearchAvatarCache,
    getUserAvatarCache,
    setUserAvatarCache,
    getLastShellAvatarUrl,
    setLastShellAvatarUrl,
    stopCurrentUserProfileListener,
    loadLogoCache,
    loadAvatarCache,
    resolveRestaurantLogo,
    resolveUserAvatar,
    resolveShellAvatarUrl,
    getSelfAvatarUrl,
    primeSelfAvatarCache,
    resolveSearchUserAvatarDisplay,
    resolveNotificationAvatar,
    resolveLikeAvatar,
    resolveCommentAvatar,
    scheduleCommentAvatarDomUpdate,
    updateCommentAvatarNodesById,
    refreshSelfCommentAvatars,
    hydrateCommentAvatars,
    applyCommentAvatarCache,
    scheduleCommentAvatarFetch,
    attachCurrentUserProfileListener,
    fetchUserDoc,
    ensureSelfAvatarReady,
    currentUserBadge,
    uploadAvatar,
    saveAccountSettings,
    loadUserProfile,
    loadBusinessProfile,
    loadBusinessStaffProfile
  };
}
