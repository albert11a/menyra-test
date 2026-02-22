import { auth, db } from "@shared/firebase-config.js";
import { BUNNY_EDGE_BASE } from "@shared/bunny-edge.js";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/11.0.0/firebase-auth.js";
import {
  collection,
  collectionGroup,
  doc,
  getDoc,
  getDocFromServer,
  getDocs,
  onSnapshot,
  query,
  where,
  orderBy,
  startAt,
  endAt,
  limit,
  deleteDoc,
  setDoc,
  updateDoc,
  increment,
  writeBatch,
  runTransaction,
  serverTimestamp,
  Timestamp
} from "https://www.gstatic.com/firebasejs/11.0.0/firebase-firestore.js";
import {
  ensureUserProfile,
  formatRelative,
  getGeo,
  toDateSafe,
  buildUrl
} from "./_shared/social-core.js";
import { compressImage } from "./_shared/image-compressor.js";
import { getOptimizedImageUrl, isPlaceholderUrl, PLACEHOLDER_IMAGE } from "./_shared/image-resolver.js";

const appEl = document.getElementById("app");

// --- SAFE STORAGE HELPER ---
const safeStorage = {
  getItem: (key) => {
    try { return localStorage.getItem(key); } catch { return null; }
  },
  setItem: (key, val) => {
    try { localStorage.setItem(key, val); } catch {}
  },
  removeItem: (key) => {
    try { localStorage.removeItem(key); } catch {}
  }
};

const STORAGE_KEYS = {
  profile: "menyra_social_profile_v3",
  settings: "menyra_social_settings_v3",
  notifications: "menyra_social_notifications_v1",
  following: "menyra_social_following_v1",
  postMeta: "menyra_social_post_meta_v1",
  feed: "menyra_social_feed_v1",
  logoCache: "menyra_social_logo_cache_v1",
  avatarCache: "menyra_social_avatar_cache_v1"
};

const profileKey = (uid) => (uid ? `${STORAGE_KEYS.profile}::${uid}` : "");
const avatarKey = (uid) => (uid ? `${STORAGE_KEYS.avatarCache}::${uid}` : "");
const notificationsKey = (uid) => (uid ? `${STORAGE_KEYS.notifications}::${uid}` : "");
const followingKey = (uid) => (uid ? `${STORAGE_KEYS.following}::${uid}` : "");

const ADMIN_LOGINS = {
  admin: {
    email: "admin@menyra.local",
    password: "admin",
    profile: {
      displayName: "Menyra HQ",
      city: "Prishtina",
      role: "business",
      avatarUrl: ""
    }
  },
  admin1: {
    email: "admin1@menyra.local",
    password: "admin1",
    profile: {
      displayName: "Max Mustermann",
      city: "Prishtina",
      role: "user",
      avatarUrl: ""
    }
  }
};

const DEFAULT_PROFILE = {
  name: "",
  handle: "",
  bio: "",
  avatar: "",
  location: "",
  followers: 0,
  following: 0,
  karma: "0",
  role: "user",
  isPremium: false,
  restaurantId: "",
  posts: []
};

const DEFAULT_SETTINGS = {
  darkMode: false,
  privateAccount: false,
  showOnline: false,
  pushNotifs: true,
  emailNotifs: false,
  language: "Deutsch"
};

const DEFAULT_NOTIFICATIONS = [
  {
    id: "n1",
    type: "like",
    user: "Marco",
    text: "hat dein Foto geliked",
    time: "10m",
    img: "",
    read: false
  },
  {
    id: "n2",
    type: "follow",
    user: "Elena",
    text: "folgt dir jetzt",
    time: "1h",
    img: "",
    read: false
  },
  {
    id: "n3",
    type: "system",
    user: "Menyra Team",
    text: "Willkommen zurueck!",
    time: "2h",
    img: "",
    read: true
  }
];

const ROLE_SWITCH_ORDER = ["ceo", "owner", "staff"];
const ROLE_SWITCH_LABELS = {
  ceo: "CEO",
  owner: "Owner",
  staff: "Staff"
};
const ROLE_HOSTS = new Set(["ceo", "owner", "staff", "waiter", "kitchen", "social"]);
const businessProfileCache = new Map();
const userProfileCache = new Map();
const restaurantOwnerCache = new Map();
const FAST_LIMITS = {
  feed: 20,
  feedFallback: 40,
  feedDelta: 8,
  userPosts: 24,
  businessPosts: 24,
  restaurants: 80,
  stories: 24,
  storiesFallback: 30,
  likes: 40,
  comments: 80
};
const SEARCH_LIMITS = {
  users: 10,
  businesses: 12
};
const FAST_MODE = true;
const CACHE_KEYS = {
  feed: "menyra_social_feed_cache_v1",
  restaurants: "menyra_social_restaurants_cache_v1",
  stories: "menyra_social_stories_cache_v1"
};
const userPostsKey = (uid) => (uid ? `menyra_social_user_posts_cache_v1::${uid}` : "");
const businessPostsKey = (rid) => (rid ? `menyra_social_business_posts_cache_v1::${rid}` : "");
const CACHE_TTL_MS = {
  feed: 10 * 60 * 1000,
  posts: 10 * 60 * 1000,
  restaurants: 60 * 60 * 1000,
  stories: 10 * 60 * 1000
};
const FEED_DELTA_MIN_MS = 3 * 60 * 1000;
const FEED_PRELOAD_LIMIT = 3;
const FEED_PRELOAD_ATTR = "data-menyrasocial-feed-preload";
const FEED_META_LISTEN_LIMIT = 20;

const state = {
  sessionReady: false,
  user: null,
  activeTab: "feed",
  drawerOpen: false,
  feedCategory: "all",
  settingsView: "main",
  selectedBusiness: null,
  isLoading: false,
  feedPosts: [],
  restaurants: [],
  restaurantMap: new Map(),
  businessLocations: [],
  stories: [],
  userPosts: [],
  businessPosts: [],
  userProfile: { ...DEFAULT_PROFILE },
  roleSwitchRoles: [],
  roleSwitchRestaurantId: "",
  followingHandles: [],
  profileView: null,
  profileBackTab: "feed",
  profileViewMode: "grid",
  profileContentTab: "posts",
  profileCheckins: [],
  profilePostMenuId: null,
  profileModal: {
    open: false,
    profile: null
  },
  settings: { ...DEFAULT_SETTINGS },
  notifications: [...DEFAULT_NOTIFICATIONS],
  postMeta: {},
  postModal: {
    open: false,
    post: null,
    commentText: "",
    replyTo: null,
    loading: false,
    animate: false,
    sending: false
  },
  likesModal: {
    open: false,
    postId: "",
    animate: false
  },
  upload: {
    preview: "",
    caption: "",
    file: null,
    status: ""
  },
  search: {
    query: "",
    filter: "all",
    userResults: [],
    businessResults: [],
    loading: false,
    error: "",
    keepFocus: false
  },
  auth: {
    mode: "login",
    role: "user",
    loading: false,
    error: ""
  }
};

let renderSuspended = 0;
let renderQueued = false;
let bodyScrollLocked = false;
let bodyScrollTop = 0;
let profileMenuBound = false;
let pendingCommentHighlight = "";
let lastCommentKey = "";
let lastCommentAt = 0;
let overlayCache = { profile: "", post: "", likes: "" };
let dataLoaded = {
  feed: false,
  profile: false,
  restaurants: false,
  stories: false,
  following: false,
  notifications: false
};
let lastAppHtml = "";
let lastRenderMode = "";
let authReadyTimer = null;
let feedDeltaTimer = null;
let searchTimer = null;
let searchToken = 0;
const searchCache = new Map();
let notificationsUnsub = null;
let userDocUnsub = null;
let profileViewUnsub = null;
let feedUnsub = null;
let storiesUnsub = null;
let userPostsUnsub = null;
let businessPostsUnsub = null;
let modalPostDocUnsub = null;
let modalLikesUnsub = null;
let modalCommentsUnsub = null;
let restaurantMetaUnsubs = new Map();
let storyRefreshTimer = null;
let liveFeedDisabled = false;
let liveStoriesDisabled = false;
let feedStoriesSignature = "";
let storiesRowSignature = "";

function suspendRender() {
  renderSuspended += 1;
}

function resumeRender() {
  if (renderSuspended > 0) renderSuspended -= 1;
  if (renderSuspended === 0 && renderQueued) {
    renderQueued = false;
    render();
  }
}


const restaurantLogoCache = new Map();
const userSearchAvatarCache = new Map();
const commentAvatarCache = new Map();
const commentAvatarPending = new Set();
let userAvatarCache = "";
let lastShellAvatarUrl = "";
let logoCacheWriteTimer = null;
let avatarCacheWriteTimer = null;
let lastAuthUid = "";

function getActiveUid() {
  return state.user?.uid || state.userProfile?.uid || "";
}

function saveUserProfileToStorage(profile = state.userProfile) {
  const uid = profile?.uid || state.user?.uid || "";
  if (!uid) return;
  try {
    safeStorage.setItem(profileKey(uid), JSON.stringify(profile));
  } catch {}
}

function loadLogoCache() {
  const raw = safeStorage.getItem(STORAGE_KEYS.logoCache);
  if (!raw) return;
  try {
    const data = JSON.parse(raw);
    if (!data || typeof data !== "object") return;
    Object.entries(data).forEach(([id, url]) => {
      if (id && url && !isPlaceholderUrl(url)) restaurantLogoCache.set(id, url);
    });
  } catch {}
}

function scheduleLogoCacheWrite() {
  if (typeof window === "undefined") return;
  if (logoCacheWriteTimer) return;
  logoCacheWriteTimer = window.setTimeout(() => {
    logoCacheWriteTimer = null;
    try {
      const payload = {};
      restaurantLogoCache.forEach((url, id) => {
        if (id && url) payload[id] = url;
      });
      safeStorage.setItem(STORAGE_KEYS.logoCache, JSON.stringify(payload));
    } catch {}
  }, 400);
}

function loadAvatarCache(uid) {
  if (!uid) return;
  const raw = safeStorage.getItem(avatarKey(uid));
  if (!raw) return;
  const trimmed = String(raw || "").trim();
  if (!trimmed || trimmed === "undefined" || trimmed === "null") return;
  userAvatarCache = trimmed;
}

function scheduleAvatarCacheWrite(url, uid = getActiveUid()) {
  if (typeof window === "undefined") return;
  if (!url || isPlaceholderUrl(url)) return;
  if (!uid) return;
  if (avatarCacheWriteTimer) return;
  avatarCacheWriteTimer = window.setTimeout(() => {
    avatarCacheWriteTimer = null;
    safeStorage.setItem(avatarKey(uid), url);
  }, 300);
}

function resolveRestaurantLogo(restaurantId, raw, size = "avatar") {
  const url = getOptimizedImageUrl(raw, size);
  if (restaurantId) {
    if (!isPlaceholderUrl(url)) {
      if (restaurantLogoCache.get(restaurantId) !== url) {
        restaurantLogoCache.set(restaurantId, url);
        scheduleLogoCacheWrite();
      }
      return url;
    }
    const cached = restaurantLogoCache.get(restaurantId);
    if (cached) return cached;
  }
  return url;
}

function resolveUserAvatar(raw) {
  const candidate = raw || state.user?.photoURL || "";
  const url = getOptimizedImageUrl(candidate, "avatar");
  if (!isPlaceholderUrl(url)) {
    userAvatarCache = url;
    scheduleAvatarCacheWrite(url);
    return url;
  }
  if (userAvatarCache && !isPlaceholderUrl(userAvatarCache)) return userAvatarCache;
  return getOptimizedImageUrl("", "avatar");
}

function resolveShellAvatarUrl() {
  const raw = state.userProfile.avatar || state.user?.photoURL || userAvatarCache || "";
  const resolved = getOptimizedImageUrl(raw, "avatar");
  if (!isPlaceholderUrl(resolved)) {
    userAvatarCache = resolved;
    scheduleAvatarCacheWrite(resolved);
    lastShellAvatarUrl = resolved;
    return resolved;
  }
  if (lastShellAvatarUrl && !isPlaceholderUrl(lastShellAvatarUrl)) return lastShellAvatarUrl;
  return PLACEHOLDER_IMAGE;
}

function captureShellAvatarFromDom() {
  return;
}

function getLiveAvatarFromDom() {
  return "";
}

function getSelfAvatarUrl() {
  const raw = state.userProfile.avatar || state.user?.photoURL || userAvatarCache || "";
  const url = getOptimizedImageUrl(raw, "avatar");
  return isPlaceholderUrl(url) ? "" : url;
}

function primeSelfAvatarCache(url) {
  if (!url || isPlaceholderUrl(url)) return;
  userAvatarCache = url;
  scheduleAvatarCacheWrite(url);
  const canTouchDom = typeof document !== "undefined";
  if (state.user?.uid) {
    commentAvatarCache.set(state.user.uid, url);
    if (canTouchDom) updateCommentAvatarNodesByUid(state.user.uid, url);
  }
  const handleKey = normalizeHandle(state.userProfile.handle || state.userProfile.name || "");
  if (handleKey) {
    commentAvatarCache.set(handleKey, url);
    if (canTouchDom) updateCommentAvatarNodes(handleKey, url);
  }
}

function resolveUserAvatarInstant(raw) {
  return resolveUserAvatar(raw);
}

function resolveSearchUserAvatar(uid, raw) {
  const url = getOptimizedImageUrl(raw, "avatar");
  if (uid) {
    if (!isPlaceholderUrl(url)) {
      if (userSearchAvatarCache.get(uid) !== url) {
        userSearchAvatarCache.set(uid, url);
      }
      return url;
    }
    const cached = userSearchAvatarCache.get(uid);
    if (cached) return cached;
  }
  return getOptimizedImageUrl("", "avatar");
}

function resolveSearchUserAvatarDisplay(user) {
  const uid = user?.uid || "";
  const name = user?.name || user?.displayName || "";
  const handle = user?.handle || "";
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
  const selfUid = state.user?.uid || "";
  const selfHandle = normalizeHandle(state.userProfile.handle || state.userProfile.name || "");
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
    if (state.user?.uid && comment.uid === state.user.uid) {
      const selfAvatar = resolveUserAvatarInstant(state.userProfile.avatar);
      if (!isPlaceholderUrl(selfAvatar)) {
        commentAvatarCache.set(comment.uid, selfAvatar);
        if (handleKey) commentAvatarCache.set(handleKey, selfAvatar);
        return selfAvatar;
      }
    }
  } else if (handleKey) {
    const selfKey = normalizeHandle(state.userProfile.handle || state.userProfile.name || "user");
    if (handleKey === selfKey) {
      const selfAvatar = resolveUserAvatar(state.userProfile.avatar);
      if (!isPlaceholderUrl(selfAvatar)) {
        commentAvatarCache.set(handleKey, selfAvatar);
        return selfAvatar;
      }
    }
  }
  return getOptimizedImageUrl("", "avatar");
}

function updateCommentAvatarNodes(handleKey, url) {
  if (!handleKey || !url || isPlaceholderUrl(url)) return;
  const safe = escapeSelector(handleKey);
  document.querySelectorAll(`[data-comment-handle="${safe}"]`).forEach((img) => {
    if (!(img instanceof HTMLImageElement)) return;
    if (img.getAttribute("src") !== url) img.setAttribute("src", url);
  });
}

function updateCommentAvatarNodesByUid(uid, url) {
  if (!uid || !url || isPlaceholderUrl(url)) return;
  const safe = escapeSelector(uid);
  document.querySelectorAll(`[data-comment-uid="${safe}"]`).forEach((img) => {
    if (!(img instanceof HTMLImageElement)) return;
    if (img.getAttribute("src") !== url) img.setAttribute("src", url);
  });
}

function updateCommentAvatarNodesById(commentId, url) {
  if (!commentId || !url || isPlaceholderUrl(url)) return;
  const safe = escapeSelector(commentId);
  document.querySelectorAll(`img[data-img-key="comment-avatar:${safe}"]`).forEach((img) => {
    if (!(img instanceof HTMLImageElement)) return;
    if (img.getAttribute("src") !== url) img.setAttribute("src", url);
  });
}

function scheduleCommentAvatarDomUpdate(uid, handleKey, url) {
  if (!url || isPlaceholderUrl(url)) return;
  if (typeof window === "undefined") return;
  window.requestAnimationFrame(() => {
    if (uid) updateCommentAvatarNodesByUid(uid, url);
    if (handleKey) updateCommentAvatarNodes(handleKey, url);
  });
}

function refreshSelfCommentAvatars({ attempt = 0, maxAttempts = 6 } = {}) {
  const url = getSelfAvatarUrl() || userAvatarCache || "";
  if (!url || isPlaceholderUrl(url)) {
    if (attempt < maxAttempts && typeof window !== "undefined") {
      window.setTimeout(() => refreshSelfCommentAvatars({ attempt: attempt + 1, maxAttempts }), 250);
    }
    return;
  }
  if (state.user?.uid) updateCommentAvatarNodesByUid(state.user.uid, url);
  const handleKey = normalizeHandle(state.userProfile.handle || state.userProfile.name || "");
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
  if (!containerEl) return;
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
    const safeSrc = (!resolved || isPlaceholderUrl(resolved)) ? PLACEHOLDER_IMAGE : resolved;
    const img = document.createElement("img");
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
      img.src = PLACEHOLDER_IMAGE;
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

function applyCommentAvatarCache(root = document) {
  if (!root) return;
  const selfUid = state.user?.uid || "";
  const selfHandle = normalizeHandle(state.userProfile.handle || state.userProfile.name || "");
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
  if (!comment) return;
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

function logoFitClass(isBusiness) {
  return isBusiness ? "object-contain bg-white" : "object-cover";
}

function escapeHtml(value) {
  return String(value || "").replace(/[&<>"']/g, (ch) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[ch] || ch));
}

function formatCount(value) {
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  const num = Number(value);
  if (Number.isFinite(num)) return String(num);
  const str = String(value ?? "").trim();
  return str || "0";
}

function sanitizeDisplayName(value, fallback) {
  const cleaned = String(value || "").trim();
  if (!cleaned) return fallback;
  const lower = cleaned.toLowerCase();
  if (lower === "data" || lower === "undefined" || lower === "null") return fallback;
  return cleaned;
}

function isLocalBusinessProfile(profile = state.userProfile) {
  return !!profile?.restaurantId && profile?.role === "business";
}

function getRestaurantMetaById(restaurantId) {
  if (!restaurantId) return null;
  return state.restaurants.find((rest) => String(rest.id) === String(restaurantId)) || null;
}

function resolveHeaderBranding() {
  if (!isLocalBusinessProfile()) {
    return {
      title: "MENYRA",
      subtitle: "Social",
      logoUrl: resolveShellAvatarUrl(),
      isBusinessLogo: state.userProfile.role === "business"
    };
  }

  const restaurantId = state.userProfile.restaurantId || "";
  const restaurant = getRestaurantMetaById(restaurantId);
  const fallbackName = state.userProfile.name || "Business";
  const title = sanitizeDisplayName(restaurant?.name || restaurant?.restaurantName, fallbackName);
  const rawLogo = restaurant?.logoUrl || restaurant?.logo || restaurant?.logoURL || state.userProfile.avatar || "";
  let logoUrl = resolveRestaurantLogo(restaurantId, rawLogo, "avatar");
  if (isPlaceholderUrl(logoUrl)) {
    logoUrl = resolveShellAvatarUrl();
  }
  return {
    title,
    subtitle: "",
    logoUrl,
    isBusinessLogo: true
  };
}

function normalizeSearchQuery(value) {
  return String(value || "").trim();
}

function normalizeSearchKey(value) {
  return normalizeSearchQuery(value).toLowerCase();
}

function scoreSearchMatch(text, query) {
  if (!text || !query) return 0;
  const hay = String(text).toLowerCase();
  if (hay.startsWith(query)) return 3;
  if (hay.includes(query)) return 1;
  return 0;
}

function icon(name, className = "") {
  return `<i data-lucide="${name}" class="${className}"></i>`;
}

function focusSearchInput() {
  const input = document.getElementById("searchInput");
  if (!input) return;
  input.focus({ preventScroll: true });
  const len = input.value.length;
  try {
    input.setSelectionRange(len, len);
  } catch {}
}

function setState(patch) {
  const prevTab = state.activeTab;
  const keys = Object.keys(patch || {});
  const drawerOnly = keys.length === 1 && keys[0] === "drawerOpen";
  Object.assign(state, patch);
  if (drawerOnly && lastRenderMode === "main") {
    updateDrawerDom();
    return;
  }
  render();
  if (patch.activeTab && patch.activeTab !== prevTab) {
    queueMicrotask(() => ensureTabData(state.activeTab));
  }
}

function saveSettings(settings) {
  safeStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(settings));
}

function saveNotifications(notifications) {
  const uid = state.user?.uid || "";
  if (!uid) return;
  safeStorage.setItem(notificationsKey(uid), JSON.stringify(notifications));
}

function saveFollowing(handles) {
  if (!Array.isArray(handles)) return;
  try {
    const uid = state.user?.uid || "";
    if (!uid) return;
    safeStorage.setItem(followingKey(uid), JSON.stringify(handles.slice(0, 500)));
  } catch {}
}

function savePostMeta(meta) {
  void meta;
}

function readCache(key, ttlMs) {
  const raw = safeStorage.getItem(key);
  if (!raw) return null;
  try {
    const payload = JSON.parse(raw);
    if (Array.isArray(payload)) {
      return { data: payload, fresh: false };
    }
    if (!payload || !Array.isArray(payload.data)) return null;
    const age = Date.now() - (payload.ts || 0);
    return { data: payload.data, meta: payload.meta || null, fresh: ttlMs ? age <= ttlMs : true };
  } catch {
    return null;
  }
}

function writeCache(key, data, meta = null) {
  if (!Array.isArray(data)) return;
  try {
    safeStorage.setItem(key, JSON.stringify({ ts: Date.now(), data, meta }));
  } catch {}
}

function computeLatestTimestamp(posts) {
  let latest = 0;
  posts.forEach((post) => {
    const ts = toDateSafe(post.createdAt)?.getTime() || 0;
    if (ts > latest) latest = ts;
  });
  return latest;
}

function saveFeedPosts(posts, extraMeta = {}) {
  if (!Array.isArray(posts)) return;
  const latestTs = computeLatestTimestamp(posts);
  writeCache(
    CACHE_KEYS.feed,
    posts.slice(0, FAST_LIMITS.feedFallback),
    { latestTs, ...extraMeta }
  );
}

function loadPersisted() {
  loadLogoCache();
  const savedSettings = safeStorage.getItem(STORAGE_KEYS.settings);
  if (savedSettings) {
    try { state.settings = { ...DEFAULT_SETTINGS, ...JSON.parse(savedSettings) }; } catch {}
  }

  // user-scoped profile/avatar loaded after login

  const restaurantsCache = readCache(CACHE_KEYS.restaurants);
  if (restaurantsCache?.data?.length) {
    state.restaurants = restaurantsCache.data;
    rebuildBusinessLocations();
    syncFeedPostLogos();
    refreshFeedStories({ force: true });
    const needsMeta = restaurantsCache.data.some((rest) => !(rest?.logoUrl || rest?.logo || rest?.logoURL));
    if (needsMeta) {
      suspendRender();
      Promise.resolve(enrichRestaurantsWithPublicMeta(restaurantsCache.data))
        .then((list) => {
          state.restaurants = list;
          rebuildBusinessLocations();
          syncFeedPostLogos();
          refreshFeedStories({ force: true });
          writeCache(CACHE_KEYS.restaurants, list);
        })
        .finally(() => resumeRender());
    }
  }

  const feedCache = readCache(CACHE_KEYS.feed);
  if (feedCache?.data?.length) {
    state.feedPosts = feedCache.data;
    syncFeedPostLogos();
    refreshFeedStories({ posts: feedCache.data, force: true });
    preloadFeedHeroImages(state.feedPosts);
    const cachedRestaurantIds = Array.from(new Set(feedCache.data
      .map((post) => post.restaurantId || post.ownerId || "")
      .filter(Boolean)));
    if (cachedRestaurantIds.length) {
      const needsHydrate = cachedRestaurantIds.some((id) => {
        const rest = state.restaurants.find((item) => item.id === id);
        return !rest || !(rest.logoUrl || rest.logo || rest.logoURL);
      });
      if (needsHydrate) {
        suspendRender();
        Promise.resolve(hydrateRestaurantsByIds(cachedRestaurantIds, { max: cachedRestaurantIds.length }))
          .finally(() => resumeRender());
      } else {
        void hydrateRestaurantsByIds(cachedRestaurantIds, { max: cachedRestaurantIds.length });
      }
    }
  }

  const storiesCache = readCache(CACHE_KEYS.stories);
  if (!state.stories.length && storiesCache?.data?.length) state.stories = storiesCache.data;

  state.postMeta = {};
}

function loadUserScopedPersisted(user) {
  if (!user?.uid) return;
  const uid = user.uid;
  const savedProfile = safeStorage.getItem(profileKey(uid));
  if (savedProfile) {
    try { state.userProfile = { ...DEFAULT_PROFILE, ...JSON.parse(savedProfile) }; } catch { state.userProfile = { ...DEFAULT_PROFILE }; }
  } else {
    state.userProfile = { ...DEFAULT_PROFILE };
  }
  state.userProfile.uid = uid;

  userAvatarCache = "";
  lastShellAvatarUrl = "";
  loadAvatarCache(uid);
  if (!state.userProfile.avatar && userAvatarCache && !isPlaceholderUrl(userAvatarCache)) {
    state.userProfile.avatar = userAvatarCache;
  }
  if (userAvatarCache && !isPlaceholderUrl(userAvatarCache)) {
    lastShellAvatarUrl = userAvatarCache;
  }

  try {
    const raw = state.userProfile.avatar || userAvatarCache || "";
    const url = getOptimizedImageUrl(raw, "avatar");
    if (url && !isPlaceholderUrl(url)) {
      primeSelfAvatarCache(url);
    }
  } catch {}

  const userPostsCache = readCache(userPostsKey(uid));
  state.userPosts = userPostsCache?.data?.length ? userPostsCache.data : [];

  const rid = state.userProfile.restaurantId || "";
  if (rid) {
    const businessCache = readCache(businessPostsKey(rid));
    state.businessPosts = businessCache?.data?.length ? businessCache.data : [];
  } else {
    state.businessPosts = [];
  }

  const scopedNotifs = safeStorage.getItem(notificationsKey(uid));
  if (scopedNotifs) {
    try { state.notifications = JSON.parse(scopedNotifs); } catch { state.notifications = []; }
  } else {
    const legacyNotifs = safeStorage.getItem(STORAGE_KEYS.notifications);
    if (legacyNotifs) {
      try {
        state.notifications = JSON.parse(legacyNotifs);
        safeStorage.setItem(notificationsKey(uid), JSON.stringify(state.notifications));
        safeStorage.removeItem(STORAGE_KEYS.notifications);
      } catch {
        state.notifications = [];
      }
    } else {
      state.notifications = [];
    }
  }

  const scopedFollowing = safeStorage.getItem(followingKey(uid));
  if (scopedFollowing) {
    try { state.followingHandles = JSON.parse(scopedFollowing); } catch { state.followingHandles = []; }
  } else {
    const legacyFollowing = safeStorage.getItem(STORAGE_KEYS.following);
    if (legacyFollowing) {
      try {
        state.followingHandles = JSON.parse(legacyFollowing);
        safeStorage.setItem(followingKey(uid), JSON.stringify(state.followingHandles.slice(0, 500)));
        safeStorage.removeItem(STORAGE_KEYS.following);
      } catch {
        state.followingHandles = [];
      }
    } else {
      state.followingHandles = [];
    }
  }
}

function resetUserScopedState() {
  stopRestaurantMetaListeners();
  commentAvatarCache.clear();
  commentAvatarPending.clear();
  userSearchAvatarCache.clear();
  businessProfileCache.clear();
  userProfileCache.clear();
  state.postMeta = {};
  state.userPosts = [];
  state.businessPosts = [];
  state.profileView = null;
  state.profileModal = { open: false, profile: null };
  state.postModal = { open: false, post: null, commentText: "", replyTo: null, loading: false, animate: false, sending: false };
  state.likesModal = { open: false, postId: "", animate: false };
  state.selectedBusiness = null;
  state.followingHandles = [];
  state.notifications = [];
  state.roleSwitchRoles = [];
  state.roleSwitchRestaurantId = "";
  state.userProfile = { ...DEFAULT_PROFILE };
  userAvatarCache = "";
  lastShellAvatarUrl = "";
  dataLoaded.profile = false;
  dataLoaded.following = false;
  dataLoaded.notifications = false;
}

async function hydrateRestaurantsByIds(restaurantIds, { max = 24 } = {}) {
  if (!Array.isArray(restaurantIds) || restaurantIds.length === 0) return;

  const uniqueIds = Array.from(new Set(restaurantIds.filter(Boolean)));
  if (!uniqueIds.length) return;

  const existing = new Map((state.restaurants || []).map((rest) => [rest.id, rest]));
  const missing = uniqueIds.filter((id) => {
    const stored = existing.get(id);
    if (!stored) return true;
    return !(stored.logoUrl || stored.logo || stored.logoURL);
  }).slice(0, max);
  if (missing.length === 0) return;

  const loaded = [];

  for (const rid of missing) {
    try {
      const [restSnap, metaSnap] = await Promise.all([
        getDoc(doc(db, "restaurants", rid)),
        getDoc(doc(db, "restaurants", rid, "public", "meta"))
      ]);
      const restData = restSnap.exists() ? (restSnap.data() || {}) : {};
      const metaData = metaSnap.exists() ? (metaSnap.data() || {}) : {};
      const name = metaData.name || metaData.restaurantName || restData.name || restData.restaurantName || "";
      const logoUrl = metaData.logoUrl || metaData.logo || restData.logoUrl || restData.logo || restData.logoURL || "";
      if (name || logoUrl) {
        loaded.push({
          id: rid,
          name,
          restaurantName: restData.restaurantName || "",
          logoUrl
        });
      }
    } catch (e) {
      console.warn("hydrateRestaurantsByIds failed for", rid, e);
    }
  }

  if (loaded.length) {
    state.restaurants = mergeRestaurants(state.restaurants, loaded);
    rebuildBusinessLocations();
    const feedUpdated = syncFeedPostLogos();
    const storiesUpdated = refreshFeedStories({ force: true });
    if ((feedUpdated || storiesUpdated) && state.activeTab === "feed" && lastRenderMode === "main") {
      updateFeedDom();
    } else if (feedUpdated || storiesUpdated) {
      render();
    }
  }
}

function mergeRestaurants(existing = [], additions = []) {
  if (!additions.length) return existing;
  const orderedIds = [];
  const map = new Map();
  existing.forEach((rest) => {
    if (!rest?.id) return;
    orderedIds.push(rest.id);
    map.set(rest.id, rest);
  });
  additions.forEach((rest) => {
    if (!rest?.id) return;
    if (!map.has(rest.id)) orderedIds.push(rest.id);
    const previous = map.get(rest.id) || {};
    map.set(rest.id, { ...previous, ...rest });
  });
  return orderedIds.map((id) => map.get(id)).filter(Boolean);
}

function rebuildBusinessLocations() {
  state.businessLocations = state.restaurants.map((rest, idx) => normalizeBusinessLocation(rest, idx));
  state.restaurants.forEach((rest) => {
    if (!rest?.id) return;
    const rawLogo = rest.logoUrl || rest.logo || rest.logoURL || "";
    if (rawLogo) resolveRestaurantLogo(rest.id, rawLogo, "avatar");
  });
}

function mergeRestaurantMeta(rest, meta) {
  if (!rest) return rest;
  const data = meta || {};
  const name = data.name || data.restaurantName || rest.name || rest.restaurantName || "";
  const logoUrl = data.logoUrl || data.logo || rest.logoUrl || rest.logo || rest.logoURL || "";
  return {
    ...rest,
    name: name || rest.name || "",
    restaurantName: rest.restaurantName || "",
    logoUrl
  };
}

function applyRestaurantMetaUpdate(restaurantId, meta) {
  if (!restaurantId) return;
  const idx = state.restaurants.findIndex((r) => r.id === restaurantId);
  const base = idx >= 0 ? state.restaurants[idx] : { id: restaurantId };
  const merged = mergeRestaurantMeta(base, meta);
  const prevLogo = base.logoUrl || base.logo || base.logoURL || "";
  const nextLogo = merged.logoUrl || merged.logo || merged.logoURL || "";
  const prevName = base.name || base.restaurantName || "";
  const nextName = merged.name || merged.restaurantName || "";
  const logoChanged = !!nextLogo && nextLogo !== prevLogo;
  const nameChanged = !!nextName && nextName !== prevName;

  if (idx >= 0) {
    state.restaurants[idx] = { ...base, ...merged };
  } else {
    state.restaurants = [...state.restaurants, merged];
  }

  if (logoChanged || nameChanged) {
    state.feedPosts.forEach((post) => {
      const rid = post.restaurantId || post.ownerId || "";
      if (String(rid) === String(restaurantId)) {
        updateFeedLogoNodes(post);
      }
    });

    const storyIdx = state.stories.findIndex((s) => s.restaurantId === restaurantId);
    if (storyIdx >= 0) {
      const prevStory = state.stories[storyIdx];
      const nextStory = {
        ...prevStory,
        img: logoChanged ? (nextLogo || prevStory.img || "") : prevStory.img,
        name: nameChanged ? (nextName || prevStory.name || "") : prevStory.name
      };
      state.stories[storyIdx] = nextStory;
      updateStoryLogoNodes(nextStory);
      if (nameChanged) updateStoryMetaNodes(nextStory);
    } else if (logoChanged) {
      updateStoryLogoNodes({ restaurantId, img: nextLogo });
    }
  }

  if (String(state.userProfile.restaurantId || "") === String(restaurantId)) {
    updateShellDom();
  }
}

function stopRestaurantMetaListeners() {
  restaurantMetaUnsubs.forEach((unsub) => {
    try { unsub(); } catch {}
  });
  restaurantMetaUnsubs.clear();
}

function ensureFeedRestaurantMetaListeners(feedPosts = state.feedPosts, { limit = FEED_META_LISTEN_LIMIT } = {}) {
  if (!Array.isArray(feedPosts) || !feedPosts.length) {
    stopRestaurantMetaListeners();
    return;
  }
  const ids = [];
  const seen = new Set();
  for (const post of feedPosts) {
    const rid = post.restaurantId || post.ownerId || "";
    if (!rid || seen.has(rid)) continue;
    seen.add(rid);
    ids.push(rid);
    if (ids.length >= limit) break;
  }
  const nextSet = new Set(ids);

  restaurantMetaUnsubs.forEach((unsub, rid) => {
    if (!nextSet.has(rid)) {
      try { unsub(); } catch {}
      restaurantMetaUnsubs.delete(rid);
    }
  });

  ids.forEach((rid) => {
    if (restaurantMetaUnsubs.has(rid)) return;
    const ref = doc(db, "restaurants", rid, "public", "meta");
    const unsub = onSnapshot(ref, (snap) => {
      if (!snap.exists()) return;
      applyRestaurantMetaUpdate(rid, snap.data() || {});
    });
    restaurantMetaUnsubs.set(rid, unsub);
  });
}

async function enrichRestaurantsWithPublicMeta(restaurants) {
  if (!Array.isArray(restaurants) || !restaurants.length) return restaurants || [];
  const lookups = restaurants.map((rest) => {
    const rid = rest?.id || "";
    if (!rid) return Promise.resolve(null);
    return getDoc(doc(db, "restaurants", rid, "public", "meta")).catch(() => null);
  });
  const metaSnaps = await Promise.all(lookups);
  return restaurants.map((rest, idx) => {
    const snap = metaSnaps[idx];
    const meta = snap && typeof snap.exists === "function" && snap.exists() ? (snap.data() || {}) : {};
    return mergeRestaurantMeta(rest, meta);
  });
}

function syncFeedPostLogos() {
  if (!state.feedPosts.length) return false;
  const restMap = new Map();
  state.restaurants.forEach((rest) => {
    if (rest?.id) restMap.set(rest.id, rest);
  });
  let changed = false;
  const next = state.feedPosts.map((post) => {
    const restaurant = restMap.get(post.restaurantId) || restMap.get(post.ownerId) || {};
    const bestLogo = restaurant.logoUrl || restaurant.logo || restaurant.logoURL || post.logo || "";
    const resolved = resolveRestaurantLogo(post.restaurantId || post.ownerId, bestLogo, "avatar");
    if (isPlaceholderUrl(resolved) || resolved === post.logo) return post;
    changed = true;
    return { ...post, logo: resolved };
  });
  if (!changed) return false;
  state.feedPosts = next;
  return true;
}

function refreshFeedStories({ posts = state.feedPosts, force = false } = {}) {
  if (!FAST_MODE) return false;
  if (!Array.isArray(posts) || !posts.length) return false;
  const storySeed = buildStoriesFromFeed(posts);
  if (!storySeed.length) return false;
  const nextSig = buildStoriesSignature(storySeed);
  if (!force && feedStoriesSignature === nextSig) return false;
  feedStoriesSignature = nextSig;
  state.stories = storySeed;
  writeCache(CACHE_KEYS.stories, storySeed);
  return true;
}

function preloadFeedHeroImages(feedPosts, { limit = FEED_PRELOAD_LIMIT } = {}) {
  if (!Array.isArray(feedPosts)) return;
  if (typeof document === "undefined") return;
  const head = document.head || document.querySelector("head");
  if (!head) return;
  const wildcard = `[${FEED_PRELOAD_ATTR}]`;
  head.querySelectorAll(wildcard).forEach((node) => node.remove());
  feedPosts.slice(0, limit).forEach((post, index) => {
    const imageUrl = getOptimizedImageUrl(post.image, "large");
    if (!imageUrl) return;
    const link = document.createElement("link");
    link.rel = "preload";
    link.as = "image";
    link.href = imageUrl;
    link.setAttribute(FEED_PRELOAD_ATTR, "hero");
    if (index === 0) link.setAttribute("fetchpriority", "high");
    head.appendChild(link);
  });
}

function resolveAdminLogin(email, pass) {
  const key = String(email || "").trim().toLowerCase();
  if (!key || pass !== key) return null;
  return ADMIN_LOGINS[key] || null;
}

async function signInOrCreateAdmin(admin) {
  try {
    return await signInWithEmailAndPassword(auth, admin.email, admin.password);
  } catch (err) {
    const created = await createUserWithEmailAndPassword(auth, admin.email, admin.password);
    if (admin.profile?.displayName) {
      await updateProfile(created.user, { displayName: admin.profile.displayName });
    }
    return created;
  }
}

function normalizeHandle(name) {
  return String(name || "user")
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_]/g, "");
}

function normalizeProfile(data, user) {
  const displayName = data?.displayName || user?.displayName || user?.email?.split("@")[0] || "User";
  return {
    name: displayName,
    handle: data?.handle || normalizeHandle(displayName),
    bio: data?.bio || "",
    avatar: data?.avatarUrl || data?.avatar || user?.photoURL || "",
    location: data?.city || "Prishtina",
    followers: data?.followersCount ?? 0,
    following: data?.followingCount ?? 0,
    karma: String(data?.score ?? "0"),
    role: data?.role || "user",
    isPremium: data?.isPremium || false,
    restaurantId: data?.restaurantId || "",
    posts: []
  };
}

function normalizeRoleList(value) {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value
      .map((item) => String(item || "").trim().toLowerCase())
      .filter(Boolean);
  }
  return String(value)
    .split(/[,\s]+/)
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
}

function roleLabel(role) {
  if (!role) return "";
  const key = String(role || "").toLowerCase();
  return ROLE_SWITCH_LABELS[key] || (key.charAt(0).toUpperCase() + key.slice(1));
}

function getRoleOrigin(role) {
  const host = window.location.hostname;
  const proto = window.location.protocol;
  const isLocal = host === "localhost" || host === "127.0.0.1" || host.endsWith(".local");
  if (isLocal || host.endsWith(".vercel.app")) return window.location.origin;
  const parts = host.split(".");
  const root = ROLE_HOSTS.has(parts[0]) ? parts.slice(1).join(".") : host;
  return `${proto}//${role}.${root}`;
}

function roleBasePath(role) {
  const origin = getRoleOrigin(role);
  return origin === window.location.origin ? `/${role}/` : "/";
}

function buildRoleUrl(role, params = "") {
  const origin = getRoleOrigin(role);
  const basePath = roleBasePath(role);
  const suffix = params ? `?${params}` : "";
  return `${origin}${basePath}${suffix}`;
}

function buildRoleSwitchUrl(role, profile, restaurantIdOverride = "") {
  const params = new URLSearchParams();
  const ownerRestaurantId = restaurantIdOverride || profile?.restaurantId || "";
  if (role === "owner" && ownerRestaurantId) params.set("r", ownerRestaurantId);
  const query = params.toString();
  const path = window.location.pathname || "";
  const fileMap = {
    ceo: "/apps/menyra-ceo/dashboard.html",
    owner: "/apps/menyra-owner/index.html",
    staff: "/apps/menyra-staff/dashboard.html"
  };

  if (path.includes("/apps/") && fileMap[role]) {
    return `${window.location.origin}${fileMap[role]}${query ? `?${query}` : ""}`;
  }

  return buildRoleUrl(role, query);
}

async function findOwnerRestaurantId(user) {
  if (!user) return "";
  const uid = user.uid || "";
  const email = user.email || "";
  if (uid) {
    try {
      const snap = await getDocs(query(collection(db, "restaurants"), where("ownerUid", "==", uid), limit(1)));
      if (!snap.empty) return snap.docs[0].id;
    } catch {}
  }
  if (email) {
    try {
      const snap = await getDocs(query(collection(db, "restaurants"), where("ownerEmail", "==", email), limit(1)));
      if (!snap.empty) return snap.docs[0].id;
    } catch {}
  }
  return "";
}

async function findOwnerRestaurantFromStaffIndex(user) {
  const uid = user?.uid || "";
  if (!uid) return "";
  try {
    const snap = await getDoc(doc(db, "staffIndex", uid));
    if (!snap.exists()) return "";
    const ids = snap.data()?.restaurantIds || [];
    for (const rid of ids.slice(0, 4)) {
      const staffSnap = await getDoc(doc(db, "restaurants", rid, "staff", uid));
      if (!staffSnap.exists()) continue;
      const row = staffSnap.data() || {};
      const roles = normalizeRoleList(row.roles || row.role || "");
      if (roles.includes("owner") || roles.includes("admin")) return rid;
    }
  } catch {}
  return "";
}

async function resolveRoleSwitchTargets(user) {
  if (!user) {
    state.roleSwitchRoles = [];
    state.roleSwitchRestaurantId = "";
    return;
  }

  const roles = new Set();
  const profile = state.userProfile || {};
  const profileRoles = normalizeRoleList(profile.roles || profile.role || "");
  let ownerRestaurantId = profile.restaurantId || "";

  if (profileRoles.includes("ceo")) roles.add("ceo");
  if (profileRoles.includes("staff")) roles.add("staff");
  if (profileRoles.includes("owner")) roles.add("owner");
  if (String(profile.role || "").toLowerCase() === "business") roles.add("owner");

  const [ceoSnap, staffSnap] = await Promise.all([
    getDoc(doc(db, "superadmins", user.uid)).catch(() => null),
    getDoc(doc(db, "staffAdmins", user.uid)).catch(() => null)
  ]);

  if (ceoSnap?.exists?.()) roles.add("ceo");
  if (staffSnap?.exists?.()) roles.add("staff");

  if (!roles.has("owner") && profile?.restaurantId) {
    try {
      const staffSnap = await getDoc(doc(db, "restaurants", profile.restaurantId, "staff", user.uid));
      if (staffSnap.exists()) {
        const staffRoles = normalizeRoleList(staffSnap.data()?.roles || staffSnap.data()?.role || "");
        if (staffRoles.includes("owner") || staffRoles.includes("admin")) roles.add("owner");
      }
    } catch {}
  }

  if (!ownerRestaurantId) {
    ownerRestaurantId = await findOwnerRestaurantId(user);
  }
  if (!ownerRestaurantId) {
    ownerRestaurantId = await findOwnerRestaurantFromStaffIndex(user);
  }
  if (ownerRestaurantId) roles.add("owner");

  state.roleSwitchRoles = ROLE_SWITCH_ORDER.filter((role) => roles.has(role));
  state.roleSwitchRestaurantId = ownerRestaurantId || profile.restaurantId || "";
  if (lastRenderMode === "main") {
    updateShellDom();
    if (state.activeTab === "search" && refreshSearchView()) return;
    if (state.activeTab === "feed") return;
  }
  render();
}

function mapRestaurantToCard(rest, idx) {
  const hash = Array.from(rest.id || "").reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  const x = 20 + ((hash + idx * 13) % 60);
  const y = 20 + ((hash + idx * 29) % 55);
  return {
    ...rest,
    x: `${x}%`,
    y: `${y}%`,
    rating: rest.rating || rest.score || 4.6,
    hours: rest.hours || rest.openHours || "08:00 - 23:00",
    img: rest.heroUrl || rest.coverUrl || rest.logoUrl || rest.logo || "",
    desc: rest.description || rest.bio || "Menyra Business"
  };
}

function businessIcon(type) {
  const value = String(type || "").toLowerCase();
  if (["food", "restaurant", "cafe"].includes(value)) return "utensils";
  if (["live", "nightlife", "club", "bar"].includes(value)) return "radio";
  if (["drink", "cocktail"].includes(value)) return "zap";
  return "zap";
}

let leafletMap = null;
let leafletBizMarkers = [];
let leafletUserMarker = null;

function hashValue(input) {
  return Array.from(String(input || "")).reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
}

function normalizeBusinessLocation(rest, idx) {
  const geo = getGeo(rest);
  const baseLat = 42.6629;
  const baseLng = 21.1655;
  const hash = hashValue(rest.id || rest.name || idx);
  const lat = geo?.lat ?? (baseLat + (((hash % 200) - 100) * 0.0025));
  const lng = geo?.lng ?? (baseLng + ((((hash >> 3) % 200) - 100) * 0.003));

  return {
    id: rest.id,
    name: rest.name || rest.restaurantName || "Business",
    type: rest.type || "food",
    lat,
    lng,
    hours: rest.hours || rest.openHours || "08:00 - 23:00",
    rating: rest.rating || rest.score || 4.6,
    img: rest.heroUrl || rest.coverUrl || rest.logoUrl || rest.logo || "",
    desc: rest.description || rest.bio || "Menyra Business",
    raw: rest
  };
}

function cleanupLeaflet() {
  try {
    if (leafletMap) leafletMap.remove();
  } catch {}
  leafletMap = null;
  leafletBizMarkers = [];
  leafletUserMarker = null;
}

function makeBizDivIcon(b) {
  const isSelected = state.selectedBusiness?.id === b.id;
  const html = `
    <div class="w-12 h-12 rounded-2xl shadow-2xl flex items-center justify-center border-2 border-white transition-colors ${isSelected ? "bg-indigo-600 text-white scale-110" : "bg-white text-indigo-600"}">
      <div class="pointer-events-none">${icon(businessIcon(b.type), "w-4 h-4")}</div>
    </div>
  `;

  return window.L.divIcon({
    className: "",
    html,
    iconSize: [48, 48],
    iconAnchor: [24, 48]
  });
}

function updateMapSheet() {
  const slot = document.getElementById("mapSheetSlot");
  if (!slot) return;
  slot.innerHTML = state.selectedBusiness ? renderMapSheet(state.selectedBusiness) : "";
  bindMapSheetEvents();
  if (window.lucide?.createIcons) window.lucide.createIcons();
}

function bindMapSheetEvents() {
  const mapCloseBtn = document.getElementById("mapCloseBtn");
  if (mapCloseBtn) {
    mapCloseBtn.addEventListener("click", () => {
      state.selectedBusiness = null;
      leafletBizMarkers.forEach((item) => {
        try { item.setIcon(makeBizDivIcon(item.__biz)); } catch {}
      });
      updateMapSheet();
    });
  }

  const mapOpenMapsBtn = document.getElementById("mapOpenMapsBtn");
  if (mapOpenMapsBtn) {
    mapOpenMapsBtn.addEventListener("click", () => {
      if (!state.selectedBusiness) return;
      const { lat, lng } = state.selectedBusiness;
      if (typeof lat !== "number" || typeof lng !== "number") return;
      const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
      window.open(url, "_blank");
    });
  }
}

function initLeafletIfNeeded() {
  if (!state.user || state.activeTab !== "map") {
    cleanupLeaflet();
    return;
  }

  const el = document.getElementById("leafletMap");
  if (!el || !window.L) return;

  if (leafletMap) {
    try { leafletMap.invalidateSize(); } catch {}
    return;
  }

  leafletMap = window.L.map(el, {
    zoomControl: false,
    attributionControl: false,
    preferCanvas: true
  }).setView([42.6026, 20.9029], 8);

  window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19
  }).addTo(leafletMap);

  leafletBizMarkers = state.businessLocations.map((b) => {
    const marker = window.L.marker([b.lat, b.lng], { icon: makeBizDivIcon(b) }).addTo(leafletMap);
    marker.__biz = b;
    marker.on("click", () => {
      state.selectedBusiness = b;
      leafletBizMarkers.forEach((item) => {
        try { item.setIcon(makeBizDivIcon(item.__biz)); } catch {}
      });
      updateMapSheet();
      try { leafletMap.panTo([b.lat, b.lng], { animate: true, duration: 0.35 }); } catch {}
    });
    return marker;
  });

  updateMapSheet();
  if (window.lucide?.createIcons) window.lucide.createIcons();
}

function setUserMarker(lat, lng, label = "Deine Position") {
  if (!leafletMap || !window.L) return;
  const html = `
    <div class="w-12 h-12 rounded-2xl shadow-2xl flex items-center justify-center border-2 border-white bg-slate-900 text-white">
      <div class="pointer-events-none">${icon("user", "w-4 h-4")}</div>
    </div>
  `;
  const markerIcon = window.L.divIcon({
    className: "",
    html,
    iconSize: [48, 48],
    iconAnchor: [24, 48]
  });

  if (!leafletUserMarker) {
    leafletUserMarker = window.L.marker([lat, lng], { icon: markerIcon }).addTo(leafletMap);
  } else {
    leafletUserMarker.setLatLng([lat, lng]);
    leafletUserMarker.setIcon(markerIcon);
  }

  try { leafletUserMarker.bindPopup(`<b>${escapeHtml(label)}</b>`).openPopup(); } catch {}
  if (window.lucide?.createIcons) window.lucide.createIcons();
}

function mapLocate() {
  if (!navigator.geolocation) {
    alert("Geolocation nicht verfuegbar.");
    return;
  }
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;
      if (leafletMap) {
        try { leafletMap.setView([lat, lng], 15, { animate: true }); } catch {}
        setUserMarker(lat, lng, "Deine Position");
      }
    },
    () => alert("Standort konnte nicht abgerufen werden (Berechtigung?)."),
    { enableHighAccuracy: true, timeout: 8000, maximumAge: 10000 }
  );
}

async function fetchUserDoc(uid) {
  if (!uid) return null;
  const ref = doc(db, "users", uid);
  if (typeof getDocFromServer === "function") {
    try {
      return await getDocFromServer(ref);
    } catch {
      // Fall through to cached getDoc
    }
  }
  try {
    return await getDoc(ref);
  } catch {
    return null;
  }
}

async function ensureSelfAvatarReady({ force = false } = {}) {
  if (!state.user?.uid) return "";
  const fallbackFromState = () => {
    const existing = getOptimizedImageUrl(state.userProfile.avatar || "", "avatar");
    if (!isPlaceholderUrl(existing)) return existing;
    if (userAvatarCache && !isPlaceholderUrl(userAvatarCache)) return userAvatarCache;
    return "";
  };

  if (!force) {
    const cached = fallbackFromState();
    if (cached) return cached;
  }

  try {
    const snap = await fetchUserDoc(state.user.uid);
    if (!snap) return fallbackFromState();
    const data = snap.exists() ? snap.data() : {};
    const raw = data.avatarUrl || data.avatar || data.avatarURL || data.photoURL || state.user?.photoURL || "";
    const resolved = getOptimizedImageUrl(raw, "avatar");
    if (!isPlaceholderUrl(resolved)) {
      state.userProfile.avatar = raw;
      userAvatarCache = resolved;
      scheduleAvatarCacheWrite(resolved);
      if (state.user?.uid) {
        commentAvatarCache.set(state.user.uid, resolved);
        updateCommentAvatarNodesByUid(state.user.uid, resolved);
      }
      const handleKey = normalizeHandle(state.userProfile.handle || state.userProfile.name || "");
      if (handleKey) {
        commentAvatarCache.set(handleKey, resolved);
        updateCommentAvatarNodes(handleKey, resolved);
      }
      return resolved;
    }
    const authUrl = state.user?.photoURL || "";
    if (authUrl) {
      const authResolved = getOptimizedImageUrl(authUrl, "avatar");
      if (!isPlaceholderUrl(authResolved)) {
        try {
          await setDoc(doc(db, "users", state.user.uid), {
            avatarUrl: authUrl,
            updatedAt: serverTimestamp()
          }, { merge: true });
        } catch {}
        state.userProfile.avatar = authUrl;
        userAvatarCache = authResolved;
        scheduleAvatarCacheWrite(authResolved);
        if (state.user?.uid) {
          commentAvatarCache.set(state.user.uid, authResolved);
          updateCommentAvatarNodesByUid(state.user.uid, authResolved);
        }
        const handleKey = normalizeHandle(state.userProfile.handle || state.userProfile.name || "");
        if (handleKey) {
          commentAvatarCache.set(handleKey, authResolved);
          updateCommentAvatarNodes(handleKey, authResolved);
        }
        return authResolved;
      }
    }
  } catch (err) {
    console.error("ensureSelfAvatarReady failed", err);
  }
  const authFallback = state.user?.photoURL ? getOptimizedImageUrl(state.user.photoURL, "avatar") : "";
  if (authFallback && !isPlaceholderUrl(authFallback)) return authFallback;
  return fallbackFromState();
}

function currentUserBadge() {
  const avatarRaw = state.userProfile.avatar || state.user?.photoURL || "";
  const resolvedAvatar = resolveUserAvatarInstant(avatarRaw);
  const finalAvatar = isPlaceholderUrl(resolvedAvatar) ? "" : resolvedAvatar;
  if (finalAvatar) primeSelfAvatarCache(finalAvatar);
  return {
    uid: state.user?.uid || "",
    name: state.userProfile.name || "User",
    handle: state.userProfile.handle || "user",
    avatar: finalAvatar
  };
}

function formatDateLabel(value) {
  const date = toDateSafe(value) || new Date();
  return date.toLocaleDateString("de-DE", { day: "2-digit", month: "short", year: "numeric" });
}

function formatDateTimeLabel(value) {
  const date = toDateSafe(value) || new Date();
  return date.toLocaleString("de-DE", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

function ensurePostMeta(postId) {
  if (!postId) return { likes: [], comments: [] };
  if (!state.postMeta[postId]) {
    state.postMeta[postId] = { likes: [], comments: [] };
  }
  return state.postMeta[postId];
}

function resolvePostCounts(post) {
  const likeCount = typeof post.likes === "number" ? post.likes : Number(post.likes) || 0;
  const commentCount = typeof post.comments === "number" ? post.comments : Number(post.comments) || 0;
  return { likeLabel: String(likeCount), commentLabel: String(commentCount) };
}

function escapeSelector(value) {
  const str = String(value);
  if (typeof CSS !== "undefined" && typeof CSS.escape === "function") {
    return CSS.escape(str);
  }
  return str.replace(/["\\]/g, "\\$&");
}

function updatePostCountNodes(post) {
  if (!post || !post.id) return;
  const postId = escapeSelector(post.id);
  const likeLabel = formatCount(post.likes);
  const commentLabel = formatCount(post.comments);
  document.querySelectorAll(`[data-post-like-count="${postId}"]`).forEach((el) => {
    el.textContent = likeLabel;
  });
  document.querySelectorAll(`[data-post-comment-count="${postId}"]`).forEach((el) => {
    el.textContent = commentLabel;
  });
}

function updateFeedLogoNodes(post) {
  if (!post || !post.id) return;
  const postId = escapeSelector(post.id);
  const restaurant = state.restaurants.find((r) => r.id === (post.restaurantId || post.ownerId)) || {};
  const logoSource = restaurant.logoUrl || restaurant.logo || restaurant.logoURL || post.logo || "";
  const logoUrl = resolveRestaurantLogo(post.restaurantId || post.ownerId, logoSource, "avatar");
  document.querySelectorAll(`[data-feed-logo="${postId}"]`).forEach((img) => {
    if (!(img instanceof HTMLImageElement)) return;
    if (img.getAttribute("src") !== logoUrl) img.setAttribute("src", logoUrl);
  });
}

function updateStoryLogoNodes(story) {
  if (!story?.restaurantId) return;
  const storyId = escapeSelector(story.restaurantId);
  const restaurant = state.restaurants.find((r) => r.id === story.restaurantId) || {};
  const logoSource = restaurant.logoUrl || restaurant.logo || story.img || "";
  const logoUrl = resolveRestaurantLogo(story.restaurantId, logoSource, "thumb");
  document.querySelectorAll(`[data-story-logo="${storyId}"]`).forEach((img) => {
    if (!(img instanceof HTMLImageElement)) return;
    if (img.getAttribute("src") !== logoUrl) img.setAttribute("src", logoUrl);
  });
}

function updateStoryMetaNodes(story) {
  if (!story?.restaurantId) return;
  const storyId = escapeSelector(story.restaurantId);
  const label = story.name || "Business";
  const live = !!story.isLive;
  document.querySelectorAll(`[data-story-border="${storyId}"]`).forEach((el) => {
    if (!(el instanceof HTMLElement)) return;
    el.classList.toggle("border-red-500", live);
    el.classList.toggle("animate-pulse", live);
    el.classList.toggle("border-slate-200", !live);
  });
  document.querySelectorAll(`[data-story-name="${storyId}"]`).forEach((el) => {
    if (!(el instanceof HTMLElement)) return;
    if (el.textContent !== label) el.textContent = label;
  });
}

function updateSearchLogoNodes(biz) {
  if (!biz?.id) return;
  const bizId = escapeSelector(biz.id);
  const restaurant = state.restaurants.find((r) => r.id === biz.id) || {};
  const logoSource = restaurant.logoUrl || restaurant.logo || biz.logo || biz.image || "";
  const logoUrl = resolveRestaurantLogo(biz.id, logoSource, "avatar");
  document.querySelectorAll(`[data-search-logo="${bizId}"]`).forEach((img) => {
    if (!(img instanceof HTMLImageElement)) return;
    if (img.getAttribute("src") !== logoUrl) img.setAttribute("src", logoUrl);
  });
}

function updateSearchBusinessNodes(biz) {
  if (!biz?.id) return;
  const bizId = escapeSelector(biz.id);
  const name = biz.name || "Business";
  const city = biz.city || "Prishtina";
  document.querySelectorAll(`[data-search-business="${bizId}"]`).forEach((el) => {
    if (!(el instanceof HTMLElement)) return;
    el.dataset.searchName = name;
    const nameEl = el.querySelector("[data-search-business-name]");
    if (nameEl && nameEl.textContent !== name) nameEl.textContent = name;
    const cityEl = el.querySelector("[data-search-business-city]");
    if (cityEl && cityEl.textContent !== city) cityEl.textContent = city;
  });
  updateSearchLogoNodes(biz);
}

function updateSearchUserNodes(user) {
  if (!user?.uid) return;
  const uid = escapeSelector(user.uid);
  const handle = user.handle || normalizeHandle(user.name || "user");
  const displayName = sanitizeDisplayName(user.name, handle || "User");
  const avatarUrl = resolveSearchUserAvatarDisplay(user);
  document.querySelectorAll(`[data-search-user="${uid}"]`).forEach((el) => {
    if (!(el instanceof HTMLElement)) return;
    el.dataset.searchHandle = handle;
    el.dataset.searchName = displayName;
    el.dataset.searchAvatar = user.avatarUrl || user.avatar || "";
    el.dataset.searchLocation = user.location || "";
    const nameEl = el.querySelector("[data-search-user-name]");
    if (nameEl && nameEl.textContent !== displayName) nameEl.textContent = displayName;
    const handleEl = el.querySelector("[data-search-user-handle]");
    const handleLabel = `@${handle}`;
    if (handleEl && handleEl.textContent !== handleLabel) handleEl.textContent = handleLabel;
    const img = el.querySelector("img");
    if (img instanceof HTMLImageElement && img.getAttribute("src") !== avatarUrl) {
      img.setAttribute("src", avatarUrl);
    }
  });
}

function updatePostCaches(post) {
  if (!post?.id) return;
  const postId = String(post.id);
  const inUser = state.userPosts.some((item) => String(item.id) === postId);
  const inBusiness = state.businessPosts.some((item) => String(item.id) === postId);
  const inFeed = state.feedPosts.some((item) => String(item.id) === postId);
  if (inUser && state.user?.uid) writeCache(userPostsKey(state.user.uid), state.userPosts);
  if (inBusiness && state.userProfile.restaurantId) writeCache(businessPostsKey(state.userProfile.restaurantId), state.businessPosts);
  if (inFeed) {
    const cached = readCache(CACHE_KEYS.feed);
    saveFeedPosts(state.feedPosts, { lastDeltaCheck: cached?.meta?.lastDeltaCheck || 0 });
  }
}

function scheduleIdle(fn) {
  if (typeof window === "undefined") return;
  if ("requestIdleCallback" in window) {
    window.requestIdleCallback(fn, { timeout: 800 });
  } else {
    window.setTimeout(fn, 0);
  }
}

function normalizeBusinessResult(rest) {
  const name = rest.name || rest.restaurantName || "Business";
  return {
    id: rest.id || rest.restaurantId || "",
    name,
    city: rest.city || rest.location || rest.address || "Prishtina",
    logo: rest.logoUrl || rest.logo || rest.image || ""
  };
}

function buildBusinessResultsFromFeed(posts) {
  const map = new Map();
  posts.forEach((post) => {
    const id = post.restaurantId || post.ownerId || "";
    const key = id || String(post.business || "").toLowerCase();
    if (!key || map.has(key)) return;
    map.set(key, {
      id: id || key,
      name: post.business || "Business",
      city: post.location || "Prishtina",
      logo: post.logo || ""
    });
  });
  return Array.from(map.values()).slice(0, SEARCH_LIMITS.businesses);
}

function buildLocalBusinessResults(queryKey) {
  const list = state.restaurants.length ? state.restaurants.map(normalizeBusinessResult) : buildBusinessResultsFromFeed(state.feedPosts);
  const localKey = normalizeSearchKey(state.userProfile.location || "");
  const isLocalQuery = queryKey === "lokal" || queryKey === "local" || (!queryKey && localKey);
  const filtered = list.filter((item) => {
    if (isLocalQuery && localKey) {
      return normalizeSearchKey(item.city).includes(localKey);
    }
    const score = Math.max(
      scoreSearchMatch(item.name, queryKey),
      scoreSearchMatch(item.city, queryKey)
    );
    return score > 0;
  }).map((item) => {
    const score = queryKey ? Math.max(
      scoreSearchMatch(item.name, queryKey),
      scoreSearchMatch(item.city, queryKey)
    ) : 0;
    return { ...item, _score: score };
  });
  return filtered.sort((a, b) => (b._score || 0) - (a._score || 0)).slice(0, SEARCH_LIMITS.businesses);
}

function normalizeUserSearchResult(doc) {
  const data = typeof doc?.data === "function" ? doc.data() : (doc?.data || doc || {});
  const rawName = data.displayName || data.name || data.handle || "";
  const handle = data.handle || normalizeHandle(rawName || "user");
  const name = sanitizeDisplayName(rawName, handle || "User");
  return {
    uid: doc?.id || data.uid || "",
    name,
    handle,
    avatar: data.avatarUrl || data.avatar || '',
    location: data.city || "Prishtina",
    followers: data.followersCount ?? data.followers ?? 0,
    following: data.followingCount ?? data.following ?? 0,
    role: data.role || "user",
    restaurantId: data.restaurantId || "",
    bio: data.bio || ""
  };
}

function isBusinessSearchUser(user) {
  const role = String(user?.role || "").toLowerCase();
  return role === "business" || !!user?.restaurantId;
}

async function searchUsersRemote(queryRaw, token) {
  const queryKey = normalizeSearchKey(queryRaw);
  const nameKey = normalizeSearchQuery(queryRaw);
  if (!queryKey) {
    state.search.userResults = [];
    return;
  }
  const cacheKey = `users:${queryKey}`;
  const cached = searchCache.get(cacheKey);
  if (cached) {
    state.search.userResults = cached.filter((item) => !isBusinessSearchUser(item));
    return;
  }
  try {
    const handleKey = normalizeHandle(queryKey);
    const users = new Map();
    if (handleKey) {
      const snap = await getDocs(query(
        collection(db, "users"),
        orderBy("handle"),
        startAt(handleKey),
        endAt(`${handleKey}\uf8ff`),
        limit(SEARCH_LIMITS.users)
      ));
      snap.forEach((docSnap) => {
        const item = normalizeUserSearchResult(docSnap);
        if (item.uid && !isBusinessSearchUser(item)) users.set(item.uid, item);
      });
    }
    const nameVariants = new Set();
    if (nameKey) {
      nameVariants.add(nameKey);
      const cap = nameKey.charAt(0).toUpperCase() + nameKey.slice(1);
      nameVariants.add(cap);
    }
    for (const variant of nameVariants) {
      const nameSnap = await getDocs(query(
        collection(db, "users"),
        orderBy("displayName"),
        startAt(variant),
        endAt(`${variant}\uf8ff`),
        limit(SEARCH_LIMITS.users)
      ));
      nameSnap.forEach((docSnap) => {
        const item = normalizeUserSearchResult(docSnap);
        if (item.uid && !isBusinessSearchUser(item)) users.set(item.uid, item);
      });
    }
    if (token !== searchToken) return;
    const key = normalizeSearchKey(queryRaw);
    const results = Array.from(users.values())
      .filter((item) => !isBusinessSearchUser(item))
      .map((item) => ({
        ...item,
        _score: Math.max(
          scoreSearchMatch(item.handle, key),
          scoreSearchMatch(item.name, key)
        )
      }))
      .sort((a, b) => (b._score || 0) - (a._score || 0));
    searchCache.set(cacheKey, results);
    state.search.userResults = results;
  } catch (err) {
    if (token !== searchToken) return;
    state.search.error = "Suche fehlgeschlagen.";
  }
}

async function searchBusinessesRemote(queryRaw, token) {
  const queryKey = normalizeSearchQuery(queryRaw);
  const key = normalizeSearchKey(queryRaw);
  if (!key) return;
  const cacheKey = `biz:${key}`;
  const cached = searchCache.get(cacheKey);
  if (cached) {
    state.search.businessResults = cached;
    return;
  }
  try {
    const results = new Map();
    const restRef = collection(db, "restaurants");
    try {
      const snap = await getDocs(query(
        restRef,
        orderBy("name"),
        startAt(queryKey),
        endAt(`${queryKey}\uf8ff`),
        limit(SEARCH_LIMITS.businesses)
      ));
      snap.forEach((docSnap) => {
        const row = normalizeBusinessResult({ id: docSnap.id, ...docSnap.data() });
        if (row.id) results.set(row.id, row);
      });
    } catch {}
    try {
      const snap = await getDocs(query(
        restRef,
        orderBy("restaurantName"),
        startAt(queryKey),
        endAt(`${queryKey}\uf8ff`),
        limit(SEARCH_LIMITS.businesses)
      ));
      snap.forEach((docSnap) => {
        const row = normalizeBusinessResult({ id: docSnap.id, ...docSnap.data() });
        if (row.id) results.set(row.id, row);
      });
    } catch {}
    if (token !== searchToken) return;
    const list = Array.from(results.values())
      .map((item) => ({
        ...item,
        _score: Math.max(
          scoreSearchMatch(item.name, key),
          scoreSearchMatch(item.city, key)
        )
      }))
      .sort((a, b) => (b._score || 0) - (a._score || 0));
    if (list.length) {
      searchCache.set(cacheKey, list);
      state.search.businessResults = list;
    }
  } catch (err) {
    if (token !== searchToken) return;
    state.search.error = "Suche fehlgeschlagen.";
  }
}

async function searchRemote(queryRaw) {
  const token = ++searchToken;
  state.search.loading = true;
  state.search.error = "";
  if (!refreshSearchView()) render();
  await Promise.all([
    searchUsersRemote(queryRaw, token),
    searchBusinessesRemote(queryRaw, token)
  ]);
  if (token === searchToken) {
    state.search.loading = false;
    if (!refreshSearchView()) render();
  }
}

function handleSearchInput(value) {
  const raw = normalizeSearchQuery(value);
  const queryKey = normalizeSearchKey(raw);
  state.search.query = raw;
  state.search.businessResults = buildLocalBusinessResults(queryKey);
  state.search.keepFocus = true;
  if (searchTimer) {
    clearTimeout(searchTimer);
    searchTimer = null;
  }
  if (!queryKey) {
    state.search.userResults = [];
    state.search.loading = false;
    state.search.error = "";
    if (!refreshSearchView()) render();
    return;
  }
  if (!refreshSearchView()) render();
  searchTimer = window.setTimeout(() => {
    void searchRemote(raw);
  }, 180);
}

function ensureTabData(tab) {
  if (!state.user) return;

  if (tab === "feed" && !dataLoaded.feed) {
    dataLoaded.feed = true;
    void loadFeedPosts();
    scheduleIdle(() => void loadFeedDelta());
  }

  if (tab === "feed" && !feedDeltaTimer) {
    feedDeltaTimer = window.setInterval(() => {
      if (document.visibilityState !== "visible") return;
      if (state.activeTab !== "feed") return;
      void loadFeedDelta();
    }, FEED_DELTA_MIN_MS);
  }

  const needsRestaurants = tab === "map" || tab === "search" || (!FAST_MODE && tab === "feed");
  if (needsRestaurants && !dataLoaded.restaurants) {
    dataLoaded.restaurants = true;
    scheduleIdle(() => {
      loadRestaurants().then(() => {
        if (!dataLoaded.stories && (state.activeTab === "feed" || state.activeTab === "map")) {
          dataLoaded.stories = true;
          scheduleIdle(() => void loadStories());
        }
      }).catch((err) => console.error(err));
    });
  } else if ((tab === "feed" || tab === "map") && !dataLoaded.stories) {
    dataLoaded.stories = true;
    scheduleIdle(() => void loadStories());
  }

  if (tab === "profile" && !dataLoaded.profile) {
    dataLoaded.profile = true;
    void loadUserPosts();
    if (state.userProfile.role === "business") {
      void loadBusinessPosts();
    }
  }
  if (tab === "profile") {
    void loadUserProfile(state.user, { force: true });
  }

  if (tab === "notifications" && !dataLoaded.notifications) {
    dataLoaded.notifications = true;
    void loadNotificationsFromFirebase({ force: true });
  }
}

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

async function openPostModal(post) {
  if (!post) return;
  ensurePostMeta(post.id);
  state.profileModal = { open: false, profile: null };
  state.postModal = {
    open: true,
    post,
    commentText: "",
    replyTo: null,
    loading: true,
    animate: true,
    sending: false
  };
  renderOverlays();
  state.postModal.animate = false;
  await loadPostMetaFromFirebase(post);
  attachPostMetaListeners(post);
  state.postModal.loading = false;
  updatePostModalMeta();
}

function closePostModal() {
  state.postModal = { open: false, post: null, commentText: "", replyTo: null, loading: false, animate: false, sending: false };
  state.likesModal = { open: false, postId: "", animate: false };
  pendingCommentHighlight = "";
  stopPostMetaListeners();
  renderOverlays();
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
      likesCount: Number.isFinite(Number(reply.likesCount)) ? Number(reply.likesCount) : (Array.isArray(reply.likes) ? reply.likes.length : 0)
    }))
  };
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
  if (!trimmed || !state.user) return;
  const key = `${postId}|${state.user.uid || ""}|${trimmed}`;
  const now = Date.now();
  if (key === lastCommentKey && now - lastCommentAt < 1500) return;
  lastCommentKey = key;
  lastCommentAt = now;
  const post = findPostById(postId);
  const postRef = getPostDocRef(post);
  if (!post || !postRef) {
    lastCommentKey = "";
    lastCommentAt = 0;
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
    if (user.uid) commentAvatarCache.set(user.uid, finalAvatar);
    if (handleKey) commentAvatarCache.set(handleKey, finalAvatar);
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
    lastCommentKey = "";
    lastCommentAt = 0;
    state.postModal.sending = false;
    return;
  }

  // --- INSTANT UI FIX: make sure the just-created comment avatar appears without refresh ---
  try {
    if (finalAvatar) {
      if (payload.uid) commentAvatarCache.set(payload.uid, finalAvatar);
      if (handleKey) commentAvatarCache.set(handleKey, finalAvatar);
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
  const hasLiveComments = typeof modalCommentsUnsub === "function";
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
  const commentInput = document.getElementById("postCommentInput");
  if (commentInput) commentInput.value = "";
  state.postModal.replyTo = null;
  if (state.postModal.open && state.postModal.post && String(state.postModal.post.id) === String(postId)) {
    updatePostModalMeta();
    if (finalAvatar) scheduleCommentAvatarDomUpdate(user.uid || "", handleKey, finalAvatar);
    const postComments = document.getElementById("postModalComments");
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
  if (!state.user) return;
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

async function toggleCommentLike(postId, commentId, replyId) {
  if (!state.user) return;
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
function renderAuthScreen() {
  const isRegister = state.auth.mode === "register";
  return `
    <div class="min-h-screen bg-slate-50 flex flex-col p-8 font-sans animate-in">
      <div class="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full">
        <div class="mb-10 text-center">
          <div class="w-16 h-16 bg-slate-900 rounded-2xl mx-auto mb-6 flex items-center justify-center text-white shadow-2xl">
            ${icon("zap", "w-8 h-8")}
          </div>
          <h1 class="text-4xl font-black italic tracking-tighter text-slate-900">MENYRA</h1>
          <p class="text-slate-400 font-bold text-xs uppercase tracking-widest mt-2">Social Login</p>
        </div>

        <form id="authForm" class="space-y-4">
          ${isRegister ? `
            <div class="bg-white p-4 rounded-3xl flex items-center gap-3 border border-slate-100 shadow-sm">
              ${icon("user", "w-5 h-5 text-slate-400 ml-2")}
              <input id="authName" type="text" placeholder="Dein Name" class="bg-transparent w-full text-sm font-bold outline-none" />
            </div>
          ` : ""}
          <div class="bg-white p-4 rounded-3xl flex items-center gap-3 border border-slate-100 shadow-sm">
            ${icon("mail", "w-5 h-5 text-slate-400 ml-2")}
            <input id="authEmail" type="text" placeholder="Email / User" class="bg-transparent w-full text-sm font-bold outline-none" />
          </div>
          <div class="bg-white p-4 rounded-3xl flex items-center gap-3 border border-slate-100 shadow-sm">
            ${icon("lock", "w-5 h-5 text-slate-400 ml-2")}
            <input id="authPassword" type="password" placeholder="Passwort" class="bg-transparent w-full text-sm font-bold outline-none" />
          </div>

          ${isRegister ? `
            <div class="grid grid-cols-2 gap-3 pt-2">
              <button type="button" data-auth-role="user" class="p-4 rounded-3xl border-2 flex flex-col items-center justify-center gap-1 transition-all ${state.auth.role === "user" ? "border-indigo-600 bg-indigo-50 text-indigo-700" : "border-slate-200 bg-white text-slate-400"}">
                ${icon("user", "w-5 h-5")} <span class="text-[10px] font-black uppercase">User</span>
              </button>
              <button type="button" data-auth-role="business" class="p-4 rounded-3xl border-2 flex flex-col items-center justify-center gap-1 transition-all ${state.auth.role === "business" ? "border-indigo-600 bg-indigo-50 text-indigo-700" : "border-slate-200 bg-white text-slate-400"}">
                ${icon("briefcase", "w-5 h-5")} <span class="text-[10px] font-black uppercase">Business</span>
              </button>
            </div>
          ` : ""}

          ${state.auth.error ? `<div class="mt-4 text-center text-rose-500 text-xs font-black bg-rose-50 p-3 rounded-xl">${escapeHtml(state.auth.error)}</div>` : ""}

          <button type="submit" class="w-full mt-8 bg-slate-900 text-white py-5 rounded-3xl font-black text-xs uppercase tracking-widest shadow-xl shadow-slate-300 active:scale-95 transition-all flex items-center justify-center gap-2" ${state.auth.loading ? "disabled" : ""}>
            ${state.auth.loading ? `${icon("loader-2", "w-4 h-4 animate-spin")}` : (isRegister ? "Konto erstellen" : "Weiter")}
          </button>
        </form>

        <div class="mt-8 text-center">
          <button id="authToggle" class="text-xs font-bold text-slate-400 hover:text-slate-900 transition-colors">
            ${isRegister ? "Bereits registriert? Login" : "Noch kein Account? Erstellen"}
          </button>
        </div>
      </div>
    </div>
  `;
}

function renderDrawer() {
  const unread = state.notifications.filter((n) => !n.read).length;
  const switchLinks = renderRoleSwitchLinks();
  const avatarUrl = resolveShellAvatarUrl();
  const avatarFit = logoFitClass(state.userProfile.role === "business");
  return `
    <div id="drawerRoot" class="fixed inset-0 z-50 transition-all duration-500 ${state.drawerOpen ? "visible" : "invisible"}">
      <div id="drawerOverlay" class="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity ${state.drawerOpen ? "opacity-100" : "opacity-0"}"></div>
      <div id="drawerPanel" class="absolute left-0 top-0 bottom-0 w-80 bg-white shadow-2xl transition-transform duration-500 p-8 flex flex-col ${state.drawerOpen ? "translate-x-0" : "-translate-x-full"}">
        <div class="flex justify-between items-center mb-10">
          <div>
            <span class="text-[9px] font-black text-indigo-600 uppercase tracking-widest">Menue</span>
            <h3 class="text-2xl font-black italic">NAVIGATE</h3>
          </div>
          <button id="drawerClose" class="p-2.5 rounded-xl bg-slate-50">${icon("x", "w-4 h-4")}</button>
        </div>
        <div class="p-4 rounded-3xl mb-6 flex items-center gap-3 bg-slate-50">
          <img id="drawerAvatar" data-img-key="avatar:drawer" src="${escapeHtml(avatarUrl)}" class="w-10 h-10 rounded-xl ${avatarFit}" />
          <div>
            <p id="drawerName" class="text-xs font-black">${escapeHtml(state.userProfile.name || "User")}</p>
            <p id="drawerHandle" class="text-[9px] font-bold text-slate-400 uppercase">@${escapeHtml(state.userProfile.handle || "user")}</p>
          </div>
        </div>
        <nav class="space-y-2 flex-1">
          ${[
            { id: "feed", label: "Feed", icon: "home" },
            { id: "search", label: "Suche", icon: "search" },
            { id: "map", label: "Karte", icon: "map" },
            { id: "profile", label: "Profil", icon: "user" },
            { id: "notifications", label: "Updates", icon: "bell", badge: unread },
            { id: "settings", label: "Optionen", icon: "settings" }
          ].map((item) => `
            <button data-nav="${item.id}" class="w-full flex items-center justify-between p-4 rounded-2xl font-black text-xs transition-all ${state.activeTab === item.id ? "bg-indigo-600 text-white shadow-xl shadow-indigo-500/20" : "text-slate-400 hover:bg-slate-50"}">
              <div class="flex items-center gap-4">${icon(item.icon, "w-4 h-4")} ${item.label}</div>
              ${item.badge ? `<span data-unread-badge="drawer" class="bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md">${item.badge}</span>` : ""}
            </button>
          `).join("")}
        </nav>
        <div id="drawerSwitchLinks">${switchLinks}</div>
        <button id="logoutBtn" class="mt-auto flex items-center gap-3 p-4 text-rose-500 font-black uppercase text-[10px] tracking-widest hover:bg-rose-500/10 rounded-2xl transition-colors">${icon("log-out", "w-4 h-4")} Abmelden</button>
      </div>
    </div>
  `;
}

function renderRoleSwitchLinks() {
  if (!(state.user && state.roleSwitchRoles.length)) return "";
  return `
    <div class="mt-6 space-y-2">
      <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest">Switch</p>
      ${state.roleSwitchRoles.map((role) => {
        const label = roleLabel(role);
        const url = buildRoleSwitchUrl(role, state.userProfile, state.roleSwitchRestaurantId);
        return `
        <a href="${escapeHtml(url)}" class="w-full flex items-center justify-between p-4 rounded-2xl font-black text-xs transition-all bg-slate-900 text-white hover:bg-slate-800">
          <div class="flex items-center gap-4">${icon("arrow-right-left", "w-4 h-4")} Switch to ${escapeHtml(label)}</div>
        </a>
      `;
      }).join("")}
    </div>
  `;
}

function renderFeedView() {
  const feedPosts = state.feedPosts
    .filter((p) => state.feedCategory === "all" || p.category === state.feedCategory)
    .sort((a, b) => (toDateSafe(b.createdAt)?.getTime() || 0) - (toDateSafe(a.createdAt)?.getTime() || 0));
  const stories = state.stories.length ? state.stories : (FAST_MODE ? buildStoriesFromFeed(feedPosts) : state.stories);
  return `
    <div id="feedView">
      <div id="storiesRow" class="flex gap-4 overflow-x-auto px-8 pb-8 no-scrollbar">
        ${renderStoriesRow(stories)}
      </div>
      ${state.userProfile.role === "business" ? `
        <div class="px-8 mb-6">
          <button data-nav="upload" class="w-full p-4 rounded-[2rem] bg-slate-900 text-white text-xs font-black uppercase tracking-widest shadow-xl flex items-center justify-center gap-2 active:scale-95 transition-transform">
            ${icon("plus-square", "w-4 h-4")} Neuer Feed Post
          </button>
        </div>
      ` : ""}
      <div id="feedList" class="px-8 py-4 space-y-12">
        ${renderFeedList(feedPosts)}
      </div>
    </div>
  `;
}

function renderStoryItem(story, index = 0) {
  const borderClass = story.isLive ? "border-red-500 animate-pulse" : "border-slate-200";
  const storyUrl = buildUrl("apps/menyra-restaurants/guest/story/index.html", { r: story.restaurantId });
  const restaurant = state.restaurants.find((r) => r.id === story.restaurantId) || {};
  const logoSource = restaurant.logoUrl || restaurant.logo || story.img || "";
  const imgUrl = resolveRestaurantLogo(story.restaurantId, logoSource, "thumb");
  const storyId = story.restaurantId ? escapeHtml(story.restaurantId) : "";
  const storyAttr = storyId ? `data-story-logo="${storyId}"` : "";
  const storyKeyAttr = storyId ? `data-img-key="story-logo:${storyId}"` : "";
  const storyBorderAttr = storyId ? `data-story-border="${storyId}"` : "";
  const storyNameAttr = storyId ? `data-story-name="${storyId}"` : "";
  const storyItemAttr = storyId ? `data-story-item="${storyId}"` : "";
  const eager = index < 6;
  const imgAttrs = eager ? `fetchpriority="high"` : `loading="lazy"`;
  return `
    <a href="${storyUrl}" ${storyItemAttr} class="flex-shrink-0 flex flex-col items-center gap-2 group cursor-pointer">
      <div class="w-20 h-20 rounded-[2.2rem] p-0.5 border-2 ${borderClass} bg-slate-200" ${storyBorderAttr}>
        <img src="${escapeHtml(imgUrl)}" ${imgAttrs} decoding="async" width="80" height="80" ${storyAttr} ${storyKeyAttr} class="w-full h-full rounded-[1.8rem] object-contain bg-white group-hover:scale-105 transition-transform" />
      </div>
      <span class="text-[9px] font-bold tracking-tighter text-slate-800" ${storyNameAttr}>${escapeHtml(story.name)}</span>
    </a>
  `;
}

function renderStoriesRow(stories) {
  return `
    <div class="flex-shrink-0 flex flex-col items-center gap-2" data-story-upload-wrap data-nav="upload">
      <div data-story-upload class="w-20 h-20 rounded-[2.2rem] bg-indigo-600 flex items-center justify-center text-white shadow-2xl shadow-indigo-500/30 overflow-hidden relative group">
        <div class="absolute inset-0 bg-gradient-to-br from-indigo-400 to-indigo-800"></div>
        ${icon("camera", "w-7 h-7 relative z-10")}
      </div>
      <span class="text-[9px] font-black text-indigo-600 uppercase tracking-widest">Story</span>
    </div>
    ${stories.length ? stories.map((story, index) => renderStoryItem(story, index)).join("") : `
      <div class="flex items-center text-slate-400 text-xs font-bold uppercase">Keine Stories</div>
    `}
  `;
}

function renderFeedItem(post, index) {
  const postId = post.id ? String(post.id) : "";
  const likeAttr = postId ? `data-post-like-count="${escapeHtml(postId)}"` : "";
  const commentAttr = postId ? `data-post-comment-count="${escapeHtml(postId)}"` : "";
  const feedAttr = postId ? `data-feed-id="${escapeHtml(postId)}"` : `data-feed-id=""`;
  const logoAttr = postId ? `data-feed-logo="${escapeHtml(postId)}"` : "";
  const logoKeyAttr = postId ? `data-img-key="feed-logo:${escapeHtml(postId)}"` : "";
  const heroKeyAttr = postId ? `data-img-key="feed-hero:${escapeHtml(postId)}"` : "";
  const eager = index < 2;
  const heroAttrs = eager ? `fetchpriority="high"` : `loading="lazy"`;
  const logoAttrs = index < 2 ? `fetchpriority="high"` : `loading="lazy"`;
  const restaurant = state.restaurants.find((r) => r.id === (post.restaurantId || post.ownerId)) || {};
  const logoSource = restaurant.logoUrl || restaurant.logo || post.logo || "";
  const logoUrl = resolveRestaurantLogo(post.restaurantId || post.ownerId, logoSource, "avatar");
  const imageUrl = getOptimizedImageUrl(post.image, "large");
  return `
    <div class="group feed-card" ${feedAttr}>
      <div class="flex items-center justify-between mb-5 px-2">
        <button data-profile-business="${escapeHtml(post.business)}" data-profile-id="${escapeHtml(post.restaurantId || "")}" class="flex items-center gap-3 text-left">
          <div class="w-12 h-12 rounded-2xl shadow-xl flex items-center justify-center border border-slate-50 italic overflow-hidden bg-slate-200">
            <img src="${escapeHtml(logoUrl)}" ${logoAttrs} ${logoAttr} ${logoKeyAttr} decoding="async" width="48" height="48" class="w-full h-full object-contain bg-white" />
          </div>
          <div>
            <h4 class="text-sm font-black flex items-center gap-1.5 uppercase tracking-tighter italic text-slate-900">${escapeHtml(post.business)} ${icon("star", "w-3 h-3 text-indigo-500")}</h4>
            <p class="text-[9px] text-slate-400 font-bold uppercase tracking-widest">${escapeHtml(post.location)}</p>
          </div>
        </button>
        ${icon("more-horizontal", "w-5 h-5 text-slate-400")}
      </div>
      <div class="p-2.5 rounded-[3.5rem] shadow-2xl overflow-hidden relative bg-white shadow-slate-200/50 border border-slate-50">
        <div class="relative rounded-[3rem] overflow-hidden bg-slate-200">
          <img src="${escapeHtml(imageUrl)}" ${heroAttrs} ${heroKeyAttr} decoding="async" class="w-full h-auto block object-cover group-hover:scale-105 transition-transform duration-1000" />
          ${post.isLive ? `
            <div class="absolute top-6 left-6 bg-red-600 text-white text-[9px] font-black px-4 py-2 rounded-full flex items-center gap-2 shadow-lg">
              <div class="w-1.5 h-1.5 bg-white rounded-full animate-ping"></div> LIVE
            </div>
          ` : ""}
          <div class="absolute bottom-6 left-6 right-6 p-6 bg-black/40 backdrop-blur-xl rounded-[2.5rem] border border-white/10 text-white">
            <p class="text-sm font-medium mb-4 line-clamp-2 leading-relaxed">${escapeHtml(post.content)}</p>
            <div class="flex items-center justify-between">
              <div class="flex gap-4">
                <button class="flex items-center gap-2 hover:text-red-400 transition-colors">
                  ${icon("heart", "w-5 h-5")} <span ${likeAttr} class="text-[10px] font-black">${escapeHtml(post.likes)}</span>
                </button>
                <button class="flex items-center gap-2 text-white/70 hover:text-white">
                  ${icon("message-circle", "w-5 h-5")} <span ${commentAttr} class="text-[10px] font-black">${escapeHtml(post.comments)}</span>
                </button>
              </div>
              <button class="text-white/70 hover:text-white">${icon("share-2", "w-4 h-4")}</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderFeedList(feedPosts) {
  if (!feedPosts.length) {
    return `<div class="text-center py-20 text-slate-400 font-bold text-xs uppercase">Keine Posts vorhanden</div>`;
  }
  return feedPosts.slice(0, 10).map((post, index) => renderFeedItem(post, index)).join("");
}

function patchFeedList(feedPosts) {
  const feedList = document.getElementById("feedList");
  if (!feedList) return false;
  if (!feedPosts.length) {
    feedList.innerHTML = renderFeedList(feedPosts);
    return true;
  }
  const existingItems = Array.from(feedList.querySelectorAll("[data-feed-id]"));
  const currentIds = existingItems.map((el) => el.dataset.feedId || "");
  const nextIds = feedPosts.map((post) => String(post.id || ""));
  if (currentIds.join("|") === nextIds.join("|")) {
    feedPosts.forEach(updatePostCountNodes);
    return true;
  }
  const existingMap = new Map();
  existingItems.forEach((el) => existingMap.set(el.dataset.feedId || "", el));
  const fragment = document.createDocumentFragment();
  feedPosts.forEach((post, index) => {
    const postId = String(post.id || "");
    const existing = postId ? existingMap.get(postId) : null;
    if (existing) {
      existingMap.delete(postId);
      fragment.appendChild(existing);
    } else {
      const tpl = document.createElement("template");
      tpl.innerHTML = renderFeedItem(post, index);
      const node = tpl.content.firstElementChild;
      if (node) fragment.appendChild(node);
    }
  });
  feedList.replaceChildren(fragment);
  feedPosts.forEach(updatePostCountNodes);
  feedPosts.forEach(updateFeedLogoNodes);
  return true;
}

function patchStoriesRow(stories) {
  const storiesRow = document.getElementById("storiesRow");
  if (!storiesRow) return false;
  if (!Array.isArray(stories) || stories.length === 0) {
    storiesRow.innerHTML = renderStoriesRow([]);
    return true;
  }
  const uploadWrap = storiesRow.querySelector("[data-story-upload-wrap]");
  if (!uploadWrap) {
    storiesRow.innerHTML = renderStoriesRow(stories);
    return true;
  }
  const existingItems = Array.from(storiesRow.querySelectorAll("[data-story-item]"));
  const existingMap = new Map();
  existingItems.forEach((el) => existingMap.set(el.dataset.storyItem || "", el));
  const fragment = document.createDocumentFragment();
  fragment.appendChild(uploadWrap);
  stories.forEach((story) => {
    const id = String(story.restaurantId || "");
    const existing = id ? existingMap.get(id) : null;
    if (existing) {
      existingMap.delete(id);
      fragment.appendChild(existing);
    } else {
      const tpl = document.createElement("template");
      tpl.innerHTML = renderStoryItem(story);
      const node = tpl.content.firstElementChild;
      if (node) fragment.appendChild(node);
    }
  });
  storiesRow.replaceChildren(fragment);
  return true;
}

function updateFeedDom() {
  const feedView = document.getElementById("feedView");
  if (!feedView) return false;
  const feedPosts = state.feedPosts
    .filter((p) => state.feedCategory === "all" || p.category === state.feedCategory)
    .sort((a, b) => (toDateSafe(b.createdAt)?.getTime() || 0) - (toDateSafe(a.createdAt)?.getTime() || 0));
  const stories = state.stories.length ? state.stories : (FAST_MODE ? buildStoriesFromFeed(feedPosts) : state.stories);
  const storiesRow = document.getElementById("storiesRow");
  const nextSig = buildStoriesRowSignature(stories);
  if (storiesRow) {
    if (storiesRowSignature !== nextSig) {
      patchStoriesRow(stories);
      storiesRowSignature = nextSig;
    }
    stories.forEach((story) => {
      updateStoryLogoNodes(story);
      updateStoryMetaNodes(story);
    });
  }
  patchFeedList(feedPosts);
  feedPosts.forEach(updateFeedLogoNodes);
  ensureFeedRestaurantMetaListeners(feedPosts);
  bindFeedDelegation();
  preloadFeedHeroImages(feedPosts);
  if (window.lucide?.createIcons) window.lucide.createIcons();
  return true;
}

function bindFeedDelegation() {
  const feedView = document.getElementById("feedView");
  if (!feedView || feedView.dataset.bound === "true") return;
  feedView.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    const navBtn = target.closest("[data-nav]");
    if (navBtn) {
      const tab = navBtn.dataset.nav;
      if (tab) {
        setState({
          activeTab: tab,
          drawerOpen: false,
          settingsView: "main",
          selectedBusiness: null,
          profileView: null,
          profileModal: { open: false, profile: null },
          postModal: { open: false, post: null, commentText: "", replyTo: null, loading: false, animate: false, sending: false },
          likesModal: { open: false, postId: "", animate: false }
        });
      }
      return;
    }
    const profileBtn = target.closest("[data-profile-business]");
    if (profileBtn) {
      openProfileViewFromBusiness({
        id: profileBtn.dataset.profileId || "",
        name: profileBtn.dataset.profileBusiness || ""
      }, { showBack: false });
    }
  });
  feedView.dataset.bound = "true";
}

function updateShellDom() {
  const avatarUrl = resolveShellAvatarUrl();
  const isBusiness = state.userProfile.role === "business";
  const branding = resolveHeaderBranding();
  const isBusinessHeader = isLocalBusinessProfile();
  const headerAvatar = document.getElementById("headerAvatar");
  if (headerAvatar) {
    const current = headerAvatar.getAttribute("src") || "";
    if (!isPlaceholderUrl(branding.logoUrl) || !current || isPlaceholderUrl(current)) {
      if (current !== branding.logoUrl) headerAvatar.setAttribute("src", branding.logoUrl);
    }
  }
  if (headerAvatar) {
    headerAvatar.classList.toggle("object-contain", branding.isBusinessLogo);
    headerAvatar.classList.toggle("bg-white", branding.isBusinessLogo);
    headerAvatar.classList.toggle("object-cover", !branding.isBusinessLogo);
  }
  const headerTitle = document.getElementById("headerTitle");
  if (headerTitle && headerTitle.textContent !== branding.title) {
    headerTitle.textContent = branding.title;
  }
  if (headerTitle) {
    headerTitle.classList.toggle("font-elegant", isBusinessHeader);
    headerTitle.classList.toggle("font-semibold", isBusinessHeader);
    headerTitle.classList.toggle("tracking-wide", isBusinessHeader);
    headerTitle.classList.toggle("font-black", !isBusinessHeader);
    headerTitle.classList.toggle("italic", !isBusinessHeader);
    headerTitle.classList.toggle("tracking-tighter", !isBusinessHeader);
  }
  const headerSubtitle = document.getElementById("headerSubtitle");
  if (headerSubtitle) {
    if (headerSubtitle.textContent !== branding.subtitle) {
      headerSubtitle.textContent = branding.subtitle;
    }
    headerSubtitle.classList.toggle("hidden", !branding.subtitle);
  }
  const drawerAvatar = document.getElementById("drawerAvatar");
  if (drawerAvatar) {
    const current = drawerAvatar.getAttribute("src") || "";
    if (!isPlaceholderUrl(avatarUrl) || !current || isPlaceholderUrl(current)) {
      if (current !== avatarUrl) drawerAvatar.setAttribute("src", avatarUrl);
    }
  }
  if (drawerAvatar) {
    drawerAvatar.classList.toggle("object-contain", isBusiness);
    drawerAvatar.classList.toggle("bg-white", isBusiness);
    drawerAvatar.classList.toggle("object-cover", !isBusiness);
  }
  const drawerName = document.getElementById("drawerName");
  if (drawerName) drawerName.textContent = state.userProfile.name || "User";
  const drawerHandle = document.getElementById("drawerHandle");
  if (drawerHandle) drawerHandle.textContent = `@${state.userProfile.handle || "user"}`;
  const switchLinks = document.getElementById("drawerSwitchLinks");
  if (switchLinks) switchLinks.innerHTML = renderRoleSwitchLinks();
  refreshSelfCommentAvatars({ attempt: 0, maxAttempts: 2 });
  if (window.lucide?.createIcons) window.lucide.createIcons();
}

function updateDrawerDom() {
  const root = document.getElementById("drawerRoot");
  const overlay = document.getElementById("drawerOverlay");
  const panel = document.getElementById("drawerPanel");
  if (!root || !overlay || !panel) return;
  root.classList.toggle("visible", state.drawerOpen);
  root.classList.toggle("invisible", !state.drawerOpen);
  overlay.classList.toggle("opacity-100", state.drawerOpen);
  overlay.classList.toggle("opacity-0", !state.drawerOpen);
  panel.classList.toggle("translate-x-0", state.drawerOpen);
  panel.classList.toggle("-translate-x-full", !state.drawerOpen);
}

function stopLiveListeners() {
  if (notificationsUnsub) {
    notificationsUnsub();
    notificationsUnsub = null;
  }
  if (userDocUnsub) {
    userDocUnsub();
    userDocUnsub = null;
  }
  if (profileViewUnsub) {
    profileViewUnsub();
    profileViewUnsub = null;
  }
  if (feedUnsub) {
    feedUnsub();
    feedUnsub = null;
  }
  if (storiesUnsub) {
    storiesUnsub();
    storiesUnsub = null;
  }
  if (userPostsUnsub) {
    userPostsUnsub();
    userPostsUnsub = null;
  }
  if (businessPostsUnsub) {
    businessPostsUnsub();
    businessPostsUnsub = null;
  }
  if (modalPostDocUnsub) {
    modalPostDocUnsub();
    modalPostDocUnsub = null;
  }
  if (modalLikesUnsub) {
    modalLikesUnsub();
    modalLikesUnsub = null;
  }
  if (modalCommentsUnsub) {
    modalCommentsUnsub();
    modalCommentsUnsub = null;
  }
  if (storyRefreshTimer) {
    clearInterval(storyRefreshTimer);
    storyRefreshTimer = null;
  }
}

function updateNotificationBadges() {
  const unread = state.notifications.filter((n) => !n.read).length;
  const badgeText = unread > 9 ? "9+" : String(unread);
  const drawerToggle = document.getElementById("drawerToggle");
  if (drawerToggle) {
    let badge = drawerToggle.querySelector("[data-unread-badge=\"header\"]");
    if (unread > 0) {
      if (!badge) {
        badge = document.createElement("span");
        badge.dataset.unreadBadge = "header";
        badge.className = "absolute -top-1 -right-1 min-w-[20px] h-5 px-1.5 rounded-full bg-rose-500 text-white text-[10px] font-black flex items-center justify-center shadow-lg";
        drawerToggle.appendChild(badge);
      }
      if (badge.textContent !== badgeText) badge.textContent = badgeText;
    } else if (badge) {
      badge.remove();
    }
  }

  const drawerNotifBtn = document.querySelector("[data-nav=\"notifications\"]");
  if (drawerNotifBtn) {
    let badge = drawerNotifBtn.querySelector("[data-unread-badge=\"drawer\"]");
    if (unread > 0) {
      if (!badge) {
        badge = document.createElement("span");
        badge.dataset.unreadBadge = "drawer";
        badge.className = "bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md";
        drawerNotifBtn.appendChild(badge);
      }
      if (badge.textContent !== badgeText) badge.textContent = badgeText;
    } else if (badge) {
      badge.remove();
    }
  }
}

function updateNotificationsDom() {
  updateNotificationBadges();
  if (state.activeTab !== "notifications" || lastRenderMode !== "main") return false;
  const list = document.getElementById("notificationsList");
  if (!list) return false;
  list.innerHTML = renderNotificationsList(state.notifications);
  if (window.lucide?.createIcons) window.lucide.createIcons();
  bindNotificationsDelegation();
  return true;
}

function bindNotificationsDelegation() {
  const view = document.getElementById("notificationsView");
  if (!view || view.dataset.bound === "true") return;
  view.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    const markAll = target.closest("#markAllRead");
    if (markAll) {
      void markAllNotificationsRead();
      return;
    }
    const deleteBtn = target.closest("[data-notif-delete]");
    if (deleteBtn) {
      const id = deleteBtn.dataset.notifDelete;
      if (!id) return;
      state.notifications = state.notifications.filter((n) => n.id !== id);
      saveNotifications(state.notifications);
      updateNotificationsDom();
      if (state.user?.uid) {
        void deleteDoc(doc(db, "users", state.user.uid, "notifications", id));
      }
      return;
    }
    const openBtn = target.closest("[data-notif-open]");
    if (openBtn) {
      const id = openBtn.dataset.notifOpen;
      if (!id) return;
      void openNotificationTarget(id);
    }
  });
  view.dataset.bound = "true";
}

function handleNotificationsUpdate(items) {
  state.notifications = items;
  saveNotifications(items);
  const updated = updateNotificationsDom();
  if (!updated && state.activeTab === "notifications") {
    render();
  }
}

function startLiveListeners(user) {
  stopLiveListeners();
  if (!user) return;
  liveFeedDisabled = false;
  liveStoriesDisabled = false;

  const userRef = doc(db, "users", user.uid);
  userDocUnsub = onSnapshot(userRef, (snap) => {
    if (!snap.exists()) return;
    const data = snap.data() || {};
    const rawAvatar = data.avatarUrl || data.avatar || "";
    const resolvedAvatarCandidate = getOptimizedImageUrl(rawAvatar, "avatar");
    const safeAvatar = (!rawAvatar || isPlaceholderUrl(resolvedAvatarCandidate)) ? state.userProfile.avatar : rawAvatar;
    const next = {
      name: data.displayName || state.userProfile.name,
      handle: data.handle || state.userProfile.handle,
      avatar: safeAvatar,
      followers: data.followersCount ?? state.userProfile.followers,
      following: data.followingCount ?? state.userProfile.following,
      role: data.role || state.userProfile.role,
      location: data.city || state.userProfile.location,
      bio: data.bio || state.userProfile.bio
    };
    Object.assign(state.userProfile, next);
    saveUserProfileToStorage();
    const resolvedAvatar = getOptimizedImageUrl(state.userProfile.avatar || "", "avatar");
    if (!isPlaceholderUrl(resolvedAvatar)) {
      userAvatarCache = resolvedAvatar;
      scheduleAvatarCacheWrite(resolvedAvatar);
      if (state.user?.uid) {
        commentAvatarCache.set(state.user.uid, resolvedAvatar);
        updateCommentAvatarNodesByUid(state.user.uid, resolvedAvatar);
      }
      const handleKey = normalizeHandle(state.userProfile.handle || state.userProfile.name || "");
      if (handleKey) {
        commentAvatarCache.set(handleKey, resolvedAvatar);
        updateCommentAvatarNodes(handleKey, resolvedAvatar);
      }
    }
    updateShellDom();
    if (state.activeTab === "profile" && !state.profileView) {
      render();
    } else if (state.activeTab === "search") {
      refreshSearchView();
    }
  });

  const notifRef = collection(db, "users", user.uid, "notifications");
  notificationsUnsub = onSnapshot(query(notifRef, orderBy("createdAt", "desc"), limit(60)), (snap) => {
    const items = snap.docs.map((docSnap) => {
      const data = docSnap.data() || {};
      return {
        id: docSnap.id,
        type: data.type || "system",
        user: data.user || data.userName || "User",
        text: data.text || "folgt dir jetzt",
        time: formatRelative(toDateSafe(data.createdAt)),
        img: data.avatar || data.img || "",
        read: !!data.read,
        createdAt: data.createdAt,
        postId: data.postId || "",
        commentId: data.commentId || "",
        userHandle: data.userHandle || data.handle || "",
        userUid: data.userUid || data.uid || "",
        ownerType: data.ownerType || "",
        ownerId: data.ownerId || "",
        restaurantId: data.restaurantId || ""
      };
    });
    handleNotificationsUpdate(items);
  });

  startFeedListener();
  startStoriesListener();
  startUserPostsListener(user.uid);
  if (state.userProfile.role === "business" && state.userProfile.restaurantId) {
    startBusinessPostsListener(state.userProfile.restaurantId);
  }
}

function attachProfileViewListener(profile) {
  if (profileViewUnsub) {
    profileViewUnsub();
    profileViewUnsub = null;
  }
  if (!profile) return;
  const ref = profile.restaurantId
    ? doc(db, "restaurants", profile.restaurantId)
    : (profile.uid ? doc(db, "users", profile.uid) : null);
  if (!ref) return;
  profileViewUnsub = onSnapshot(ref, (snap) => {
    if (!snap.exists()) return;
    const data = snap.data() || {};
    const viewProfile = state.profileView?.profile;
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
      viewProfile.avatar = data.avatarUrl || data.avatar || viewProfile.avatar;
      viewProfile.name = data.displayName || viewProfile.name;
      viewProfile.location = data.city || viewProfile.location;
    }
    render();
  });
}

function startFeedListener() {
  if (liveFeedDisabled) return;
  if (feedUnsub) {
    feedUnsub();
    feedUnsub = null;
  }
  const ref = collection(db, "socialFeed");
  const feedQuery = query(ref, where("status", "==", "active"), orderBy("createdAt", "desc"), limit(FAST_LIMITS.feedFallback));
  feedUnsub = onSnapshot(feedQuery, (snap) => {
    const rows = snap.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }));
    const next = rows
      .filter((row) => (row.status || "active") === "active")
      .map(normalizeFeedPost)
      .sort((a, b) => (toDateSafe(b.createdAt)?.getTime() || 0) - (toDateSafe(a.createdAt)?.getTime() || 0));
    const prevIds = state.feedPosts.map((item) => String(item.id)).join("|");
    const nextIds = next.map((item) => String(item.id)).join("|");
    if (prevIds === nextIds) {
      state.feedPosts = next;
      updateFeedDom();
      return;
    }
    state.feedPosts = next;
    preloadFeedHeroImages(next);
    saveFeedPosts(next);
    if (liveStoriesDisabled) {
      const storySeed = buildStoriesFromFeed(next);
      if (storySeed.length) {
        state.stories = storySeed;
        writeCache(CACHE_KEYS.stories, storySeed);
      }
    }
    const inMain = lastRenderMode === "main";
    const updatedFeed = state.activeTab === "feed" && inMain && updateFeedDom();
    if (updatedFeed) return;
    const updatedSearch = state.activeTab === "search" && inMain && refreshSearchView();
    if (updatedSearch) return;
    if (!inMain) {
      render();
      return;
    }
    if (state.activeTab === "feed" || state.activeTab === "search") {
      render();
    }
  }, (err) => {
    if (err?.code === "failed-precondition") {
      liveFeedDisabled = true;
      if (feedUnsub) {
        feedUnsub();
        feedUnsub = null;
      }
      startFeedFallbackListener();
    } else {
      console.error(err);
    }
  });
}

function startFeedFallbackListener() {
  if (feedUnsub) {
    feedUnsub();
    feedUnsub = null;
  }
  const ref = collection(db, "socialFeed");
  const feedQuery = query(ref, orderBy("createdAt", "desc"), limit(FAST_LIMITS.feedFallback));
  feedUnsub = onSnapshot(feedQuery, (snap) => {
    const rows = snap.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }));
    const next = rows
      .filter((row) => (row.status || "active") === "active")
      .map(normalizeFeedPost)
      .sort((a, b) => (toDateSafe(b.createdAt)?.getTime() || 0) - (toDateSafe(a.createdAt)?.getTime() || 0));
    state.feedPosts = next;
    saveFeedPosts(next);
    if (liveStoriesDisabled) {
      const storySeed = buildStoriesFromFeed(next);
      if (storySeed.length) {
        state.stories = storySeed;
        writeCache(CACHE_KEYS.stories, storySeed);
      }
    }
    const inMain = lastRenderMode === "main";
    const updatedFeed = state.activeTab === "feed" && inMain && updateFeedDom();
    if (updatedFeed) return;
    if (!inMain) {
      render();
      return;
    }
    if (state.activeTab === "feed") {
      render();
    }
  }, (err) => console.error(err));
}

function startStoriesListener() {
  if (liveStoriesDisabled) return;
  if (storiesUnsub) {
    storiesUnsub();
    storiesUnsub = null;
  }
  const now = Timestamp.now();
  const storyQuery = query(
    collectionGroup(db, "stories"),
    where("expiresAt", ">", now),
    orderBy("expiresAt", "desc"),
    limit(FAST_LIMITS.stories)
  );
  storiesUnsub = onSnapshot(storyQuery, (snap) => {
    const map = new Map();
    snap.forEach((docSnap) => {
      const rid = docSnap.ref.parent?.parent?.id;
      if (!rid || map.has(rid)) return;
      const rest = state.restaurants.find((r) => r.id === rid) || {};
      map.set(rid, {
        restaurantId: rid,
        name: rest.name || rest.restaurantName || docSnap.data()?.restaurantName || "Business",
        img: rest.logoUrl || rest.logo || docSnap.data()?.logoUrl || docSnap.data()?.logo || "",
        isLive: true
      });
    });
    const items = Array.from(map.values());
    state.stories = items;
    writeCache(CACHE_KEYS.stories, items);
    if (!(state.activeTab === "feed" && lastRenderMode === "main" && updateFeedDom())) {
      render();
    }
  }, (err) => {
    if (err?.code === "failed-precondition") {
      liveStoriesDisabled = true;
      if (storiesUnsub) {
        storiesUnsub();
        storiesUnsub = null;
      }
      const storySeed = buildStoriesFromFeed(state.feedPosts);
      if (storySeed.length) {
        state.stories = storySeed;
        writeCache(CACHE_KEYS.stories, storySeed);
      }
      if (!(state.activeTab === "feed" && lastRenderMode === "main" && updateFeedDom())) {
        render();
      }
    } else {
      console.error(err);
    }
  });

  if (!storyRefreshTimer) {
    storyRefreshTimer = setInterval(() => {
      startStoriesListener();
    }, 2 * 60 * 1000);
  }
}

function areProfilePostsEquivalent(prev, next) {
  if (prev.length !== next.length) return false;
  for (let i = 0; i < next.length; i += 1) {
    const a = prev[i];
    const b = next[i];
    if (!a || !b) return false;
    if (String(a.id) !== String(b.id)) return false;
    if ((a.url || "") !== (b.url || "")) return false;
    if ((a.type || "square") !== (b.type || "square")) return false;
    if (!!a.isVideo !== !!b.isVideo) return false;
    const aLikes = Number(a.likes) || 0;
    const bLikes = Number(b.likes) || 0;
    if (aLikes !== bLikes) return false;
    const aComments = Number(a.comments) || 0;
    const bComments = Number(b.comments) || 0;
    if (aComments !== bComments) return false;
  }
  return true;
}

function areProfilePostsStructureEquivalent(prev, next) {
  if (prev.length !== next.length) return false;
  for (let i = 0; i < next.length; i += 1) {
    const a = prev[i];
    const b = next[i];
    if (!a || !b) return false;
    if (String(a.id) !== String(b.id)) return false;
    if ((a.url || "") !== (b.url || "")) return false;
    if ((a.type || "square") !== (b.type || "square")) return false;
    if (!!a.isVideo !== !!b.isVideo) return false;
  }
  return true;
}

function patchProfilePostCounts(prev, next) {
  const prevMap = new Map((prev || []).map((post) => [String(post.id), post]));
  (next || []).forEach((post) => {
    const old = prevMap.get(String(post.id));
    const oldLikes = Number(old?.likes) || 0;
    const oldComments = Number(old?.comments) || 0;
    const newLikes = Number(post?.likes) || 0;
    const newComments = Number(post?.comments) || 0;
    if (oldLikes !== newLikes || oldComments !== newComments) {
      updatePostCountNodes(post);
    }
  });

  if (state.postModal?.open && state.postModal?.post?.id) {
    const pid = String(state.postModal.post.id);
    const match = (next || []).find((item) => String(item.id) === pid);
    if (match) {
      state.postModal.post.likes = Number(match.likes) || 0;
      state.postModal.post.comments = Number(match.comments) || 0;
      updatePostModalCountsOnly();
    }
  }
}

function startUserPostsListener(uid) {
  if (!uid) return;
  if (userPostsUnsub) {
    userPostsUnsub();
    userPostsUnsub = null;
  }
  const ref = collection(db, "users", uid, "posts");
  const userQuery = query(ref, orderBy("createdAt", "desc"), limit(FAST_LIMITS.userPosts));
  userPostsUnsub = onSnapshot(userQuery, (snap) => {
    const rows = snap.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }));
    const next = rows.map((row) => ({
      id: row.id,
      url: row.url || row.mediaUrl || row.media?.[0]?.url || "",
      type: row.type || "square",
      title: "",
      caption: row.caption || "",
      createdAt: row.createdAt,
      likes: row.likesCount ?? row.likes ?? 0,
      comments: row.commentsCount ?? row.comments ?? 0,
      isVideo: row.media?.[0]?.type === "video",
      ownerType: "user",
      ownerId: uid
    })).filter((row) => row.url);
    const prev = state.userPosts || [];
    const isOnOwnProfile = state.activeTab === "profile" && !state.profileView;
    const structureSame = areProfilePostsStructureEquivalent(prev, next);
    state.userPosts = next;
    writeCache(userPostsKey(uid), next);
    if (isOnOwnProfile) {
      if (structureSame) {
        patchProfilePostCounts(prev, next);
      } else {
        render();
      }
    }
  });
}

function startBusinessPostsListener(restaurantId) {
  if (!restaurantId) return;
  if (businessPostsUnsub) {
    businessPostsUnsub();
    businessPostsUnsub = null;
  }
  const ref = collection(db, "restaurants", restaurantId, "socialPosts");
  const bizQuery = query(ref, orderBy("createdAt", "desc"), limit(FAST_LIMITS.businessPosts));
  businessPostsUnsub = onSnapshot(bizQuery, (snap) => {
    const rows = snap.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }));
    const next = rows
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
      .filter((row) => row.url);
    const prev = state.businessPosts || [];
    const isOnOwnProfile = state.activeTab === "profile" && !state.profileView;
    const structureSame = areProfilePostsStructureEquivalent(prev, next);
    state.businessPosts = next;
    writeCache(businessPostsKey(restaurantId), next);
    if (isOnOwnProfile) {
      if (structureSame) {
        patchProfilePostCounts(prev, next);
      } else {
        render();
      }
    }
  });
}

function stopPostMetaListeners() {
  if (modalPostDocUnsub) {
    modalPostDocUnsub();
    modalPostDocUnsub = null;
  }
  if (modalLikesUnsub) {
    modalLikesUnsub();
    modalLikesUnsub = null;
  }
  if (modalCommentsUnsub) {
    modalCommentsUnsub();
    modalCommentsUnsub = null;
  }
}

function attachPostMetaListeners(post) {
  stopPostMetaListeners();
  const postRef = getPostDocRef(post);
  if (!postRef || !post?.id) return;
  const postId = String(post.id);
  modalPostDocUnsub = onSnapshot(postRef, (docSnap) => {
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
  });
  modalLikesUnsub = onSnapshot(query(collection(postRef, "likes"), orderBy("createdAt", "desc"), limit(FAST_LIMITS.likes)), (snap) => {
    const meta = ensurePostMeta(postId);
    meta.likes = snap.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }));
    state.postMeta[postId] = meta;
    updatePostModalCountsOnly();
  });
  modalCommentsUnsub = onSnapshot(query(collection(postRef, "comments"), orderBy("createdAt", "desc"), limit(FAST_LIMITS.comments)), (snap) => {
    const meta = ensurePostMeta(postId);
    const rows = snap.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }));
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
    state.postMeta[postId] = meta;
    updatePostModalCountsOnly();
    updatePostModalCommentsOnly();
  });
}

function renderMapSheet(selected) {
  const imageUrl = getOptimizedImageUrl(selected.img, "thumb");
  return `
    <div class="absolute bottom-6 left-6 right-6 animate-in slide-in-from-bottom-6 duration-300 z-50">
      <div class="bg-white rounded-[2.5rem] p-5 shadow-2xl border border-slate-100 relative">
        <button id="mapCloseBtn" class="absolute top-4 right-4 w-10 h-10 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 hover:bg-slate-100 transition-colors">
          ${icon("x", "w-4 h-4")}
        </button>
        <div class="flex gap-4">
          <img src="${escapeHtml(imageUrl)}" class="w-24 h-24 rounded-3xl object-cover shadow-lg" />
          <div class="flex-1">
            <span class="text-[9px] font-black text-indigo-600 uppercase tracking-widest">Business</span>
            <h3 class="text-lg font-black tracking-tight text-slate-900 mt-1">${escapeHtml(selected.name || "Business")}</h3>
            <div class="flex items-center gap-1.5 mt-2 text-[10px] font-black uppercase text-indigo-600">
              ${icon("star", "w-3 h-3 fill-indigo-600 text-indigo-600")} ${escapeHtml(selected.rating)} / <span class="text-emerald-500">Geoeffnet</span>
            </div>
            <div class="flex items-center gap-2 mt-3 text-slate-400 text-[10px] font-bold">${icon("clock", "w-4 h-4")} ${escapeHtml(selected.hours)}</div>
          </div>
        </div>
        <p class="text-xs text-slate-500 mt-3 font-medium px-1 line-clamp-2 leading-relaxed">${escapeHtml(selected.desc)}</p>
        <div class="mt-4">
          <button id="mapOpenMapsBtn" class="w-full bg-slate-900 text-white py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all shadow-xl shadow-slate-200">In Maps oeffnen</button>
        </div>
      </div>
    </div>
  `;
}

function renderMapView() {
  const hasLeaflet = !!window.L;
  return `
    <div class="p-6 h-full flex flex-col animate-in fade-in duration-700">
      <div class="mb-6 px-2">
        <h2 class="text-2xl font-black italic uppercase tracking-tighter">Business Karte</h2>
        <p class="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1 italic">Kosovo Explorer</p>
      </div>
      <div class="relative flex-1 bg-slate-900 rounded-[3.5rem] overflow-hidden shadow-2xl border-[8px] border-white min-h-[500px]">
        ${hasLeaflet ? `<div id="leafletMap" class="absolute inset-0"></div>` : `<div class="absolute inset-0 flex items-center justify-center opacity-30 text-white text-xs font-black uppercase tracking-widest">Leaflet laedt nicht...</div>`}
        <div class="absolute top-6 right-6 z-50 flex flex-col gap-3">
          <button id="mapLocateBtn" class="w-12 h-12 rounded-2xl bg-white/95 backdrop-blur-xl border border-white/40 shadow-xl flex items-center justify-center text-slate-900 active:scale-95 transition-transform">${icon("navigation", "w-4 h-4")}</button>
        </div>
        <div id="mapSheetSlot"></div>
      </div>
    </div>
  `;
}

function renderProfilePosts(posts) {
  if (!posts.length) {
    return `
      <div class="aspect-square rounded-[2rem] border-2 border-dashed flex flex-col items-center justify-center gap-2 text-slate-300 border-slate-200">
        ${icon("image", "w-6 h-6")}<span class="text-[9px] font-black uppercase text-slate-400">Leer</span>
      </div>
    `;
  }
  return posts.map((item) => renderProfileGridItem(item)).join("");
}

function renderProfileGridItem(item) {
  const counts = resolvePostCounts(item);
  const postId = item.id ? String(item.id) : "";
  const postAttr = postId ? `data-open-post="${escapeHtml(postId)}"` : "";
  const likeAttr = postId ? `data-post-like-count="${escapeHtml(postId)}"` : "";
  const commentAttr = postId ? `data-post-comment-count="${escapeHtml(postId)}"` : "";
  const imgKeyAttr = postId ? `data-img-key="profile-post:${escapeHtml(postId)}"` : "";
  return `
    <button type="button" ${postAttr} class="rounded-[2.5rem] overflow-hidden shadow-md relative group text-left ${item.type === "wide" || item.type === "hero" ? "col-span-2 aspect-[2/1]" : "aspect-square"}">
      <img src="${escapeHtml(item.url)}" loading="lazy" decoding="async" width="400" height="400" ${imgKeyAttr} class="w-full h-full object-cover" />
      ${item.title ? `<div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent p-6 flex flex-col justify-end"><h3 class="text-white text-lg font-black italic">${escapeHtml(item.title)}</h3></div>` : ""}
      <div class="absolute inset-x-0 bottom-0 p-3">
        <div class="flex items-center justify-between text-white bg-black/45 backdrop-blur rounded-2xl px-3 py-2">
          <div class="flex items-center gap-3 text-[10px] font-black">
            <div class="flex items-center gap-1">${icon("heart", "w-3 h-3")}<span ${likeAttr}>${escapeHtml(counts.likeLabel)}</span></div>
            <div class="flex items-center gap-1">${icon("message-circle", "w-3 h-3")}<span ${commentAttr}>${escapeHtml(counts.commentLabel)}</span></div>
          </div>
          ${item.isVideo ? `<div class="w-9 h-9 rounded-2xl bg-white/15 backdrop-blur flex items-center justify-center">${icon("play", "w-4 h-4")}</div>` : ""}
        </div>
      </div>
    </button>
  `;
}

function renderProfilePostCardFancy(item, isGrid, allowMenu = true) {
  const counts = resolvePostCounts(item);
  const postId = item.id ? String(item.id) : "";
  const postAttr = postId ? `data-open-post="${escapeHtml(postId)}"` : "";
  const likeAttr = postId ? `data-post-like-count="${escapeHtml(postId)}"` : "";
  const commentAttr = postId ? `data-post-comment-count="${escapeHtml(postId)}"` : "";
  const imgKeyAttr = postId ? `data-img-key="profile-post:${escapeHtml(postId)}"` : "";
  const isWide = item.type === "wide" || item.type === "hero";
  const colClass = isGrid && isWide ? "col-span-2" : "";
  const aspectClass = isGrid
    ? (isWide ? "aspect-[1.8/1]" : "aspect-[4/5]")
    : "aspect-[4/5]";
  const imageUrl = getOptimizedImageUrl(item.url, isWide ? "large" : "medium");
  const width = isWide ? 800 : 400;
  const height = isWide ? 400 : 500;
  return `
    <div ${postAttr} role="button" tabindex="0" class="${colClass} relative ${aspectClass} rounded-[2rem] overflow-hidden bg-white shadow-[0_30px_60px_-12px_rgba(50,50,93,0.15),0_18px_36px_-18px_rgba(0,0,0,0.15)] cursor-pointer transition-transform">
      <div class="absolute inset-0 rounded-[2rem] overflow-hidden active:scale-[0.98] transition-transform">
        <img src="${escapeHtml(imageUrl)}" loading="lazy" decoding="async" width="${width}" height="${height}" ${imgKeyAttr} class="w-full h-full object-cover" />
        ${item.isVideo ? `<div class="absolute top-3 left-3 text-white drop-shadow-md bg-black/20 backdrop-blur-sm rounded-full p-1">${icon("play", "w-3 h-3 fill-white")}</div>` : ""}
        <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex flex-col justify-end p-3 pb-4 pointer-events-none">
          <div class="w-full flex items-end justify-center">
            <div class="flex items-center gap-2.5 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-3 py-1.5 text-white shadow-[0_4px_12px_rgba(0,0,0,0.08)]">
              <div class="flex items-center gap-1">
                ${icon("heart", "w-3 h-3 fill-rose-500 text-rose-500")}
                <span ${likeAttr} class="text-[10px] font-bold tracking-wide">${escapeHtml(counts.likeLabel)}</span>
              </div>
              <div class="w-px h-3 bg-white/20"></div>
              <div class="flex items-center gap-1">
                ${icon("message-circle", "w-3 h-3 text-indigo-200")}
                <span ${commentAttr} class="text-[10px] font-bold tracking-wide">${escapeHtml(counts.commentLabel)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      ${postId && allowMenu ? `
        <button type="button" data-profile-menu-button="${escapeHtml(postId)}" class="absolute top-3 right-3 p-2 bg-black/20 backdrop-blur-md rounded-full text-white/90 z-20 active:bg-black/40 hover:bg-black/30 transition-colors">
          ${icon("more-horizontal", "w-3.5 h-3.5")}
        </button>
        <div data-profile-menu="${escapeHtml(postId)}" class="absolute top-12 right-3 w-40 bg-white/95 backdrop-blur-xl rounded-2xl shadow-[0_10px_25px_-5px_rgba(0,0,0,0.1),0_0_1px_rgba(0,0,0,0.1)] border border-slate-100 p-1.5 z-30 hidden origin-top-right flex flex-col gap-1">
          <button type="button" data-profile-post-toggle="${escapeHtml(postId)}" class="flex items-center gap-3 px-3 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-xl transition-colors text-left w-full">
            ${icon(isWide ? "minimize-2" : "maximize-2", "w-3.5 h-3.5")}
            ${isWide ? "Schmaler" : "Breiter"}
          </button>
          <div class="h-px bg-slate-100 w-full my-0.5"></div>
          <button type="button" data-profile-post-delete="${escapeHtml(postId)}" class="flex items-center gap-3 px-3 py-2.5 text-xs font-bold text-rose-500 hover:bg-rose-50 rounded-xl transition-colors text-left w-full">
            ${icon("trash-2", "w-3.5 h-3.5")}
            Loeschen
          </button>
        </div>
      ` : ""}
    </div>
  `;
}

function renderProfilePostsFancy(posts, viewMode, allowMenu = true) {
  const isGrid = viewMode === "grid";
  if (!posts.length) {
    return `
      <div class="col-span-2 py-24 text-center">
        <div class="w-24 h-24 rounded-[2.5rem] bg-gradient-to-tr from-slate-100 to-white mx-auto flex items-center justify-center text-slate-300 mb-6 shadow-sm rotate-6 border border-slate-50">
          ${icon("image", "w-9 h-9")}
        </div>
        <p class="text-slate-400 text-sm font-bold tracking-wide">Keine Inhalte gefunden</p>
      </div>
    `;
  }
  const cards = posts.map((post) => renderProfilePostCardFancy(post, isGrid, allowMenu));
  const slotCount = posts.reduce((total, post) => {
    const isWide = post?.type === "wide" || post?.type === "hero";
    return total + (isWide ? 2 : 1);
  }, 0);
  if (isGrid && (slotCount % 2 === 1)) {
    cards.unshift(`
      <div data-profile-grid-placeholder="true" class="col-start-2 aspect-[4/5] rounded-[2rem] invisible pointer-events-none"></div>
    `);
  }
  return cards.join("");
}

function findProfilePostCardNode(postId) {
  const targetId = String(postId || "");
  const nodes = document.querySelectorAll("[data-open-post]");
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
  if (!container) return false;
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
    const placeholder = document.createElement("div");
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
  if (window.lucide?.createIcons) window.lucide.createIcons();
  return true;
}

function renderProfileCheckins() {
  const checkins = state.profileCheckins || [];
  if (!checkins.length) {
    return `
      <div class="px-6 pb-24 text-center">
        <div class="w-24 h-24 rounded-[2.5rem] bg-gradient-to-tr from-slate-100 to-white mx-auto flex items-center justify-center text-slate-300 mb-6 shadow-sm rotate-6 border border-slate-50">
          ${icon("map-pin", "w-9 h-9")}
        </div>
        <p class="text-slate-400 text-sm font-bold tracking-wide">Keine Check-ins gefunden</p>
      </div>
    `;
  }
  return `
    <div class="px-6 flex flex-col gap-4 pb-24 animate-in fade-in duration-300">
      ${checkins.map((place) => {
        const imageUrl = getOptimizedImageUrl(place.image, "thumb");
        return `
        <div class="flex items-center gap-4 bg-white p-4 rounded-[2rem] border border-slate-50 shadow-[0_30px_60px_-12px_rgba(50,50,93,0.15),0_18px_36px_-18px_rgba(0,0,0,0.15)] active:scale-[0.98] transition-all cursor-pointer group">
          <div class="w-16 h-16 rounded-2xl bg-slate-100 overflow-hidden shrink-0 shadow-inner group-hover:shadow-md transition-all">
            <img src="${escapeHtml(imageUrl)}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
          </div>
          <div class="flex-1">
            <h4 class="font-black text-slate-900 text-sm mb-1">${escapeHtml(place.name || "Ort")}</h4>
            <div class="flex items-center gap-1.5 text-xs text-slate-500 font-bold">
              ${icon("map-pin", "w-3 h-3 text-indigo-500 fill-indigo-500/20")} ${escapeHtml(place.city || "Stadt")}
            </div>
          </div>
          <button class="w-10 h-10 flex items-center justify-center rounded-full bg-slate-50 text-slate-300 group-hover:text-indigo-500 group-hover:bg-indigo-50 transition-colors">
            ${icon("arrow-right", "w-4 h-4")}
          </button>
        </div>
      `}).join("")}
    </div>
  `;
}

function renderProfileTabs() {
  return `
    <div class="px-6 mb-6 mt-4">
      <div class="bg-white/60 p-1.5 rounded-[2rem] border border-white/50 shadow-sm flex items-center relative backdrop-blur-sm">
        ${[
          { id: "posts", label: "Beitraege" },
          { id: "media", label: "Medien" },
          { id: "checkins", label: "Check-ins" }
        ].map((tab) => `
          <button data-profile-tab="${tab.id}" class="flex-1 py-3.5 rounded-[1.5rem] text-[11px] font-bold uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 ${state.profileContentTab === tab.id ? "bg-white text-slate-900 shadow-[0_4px_12px_-2px_rgba(0,0,0,0.08),0_2px_6px_-1px_rgba(0,0,0,0.04)] scale-[1.02]" : "text-slate-400 hover:text-slate-600"}">
            ${tab.label}
          </button>
        `).join("")}
      </div>
    </div>
  `;
}

function renderProfileViewControls() {
  if (state.profileContentTab === "checkins") return "";
  return `
    <div class="flex items-center justify-between px-8 mb-6">
      <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-2">Ansicht</span>
      <div class="flex gap-1 bg-white p-1 rounded-2xl border border-slate-100 shadow-sm">
        <button data-profile-view="grid" class="p-2.5 rounded-xl transition-all active:scale-95 ${state.profileViewMode === "grid" ? "bg-slate-900 text-white shadow-md" : "text-slate-300 active:text-slate-500"}">
          ${icon("layout-grid", "w-4 h-4")}
        </button>
        <button data-profile-view="feed" class="p-2.5 rounded-xl transition-all active:scale-95 ${state.profileViewMode === "feed" ? "bg-slate-900 text-white shadow-md" : "text-slate-300 active:text-slate-500"}">
          ${icon("square", "w-4 h-4")}
        </button>
      </div>
    </div>
  `;
}

function getProfilePostList() {
  return state.userProfile.role === "business" ? state.businessPosts : state.userPosts;
}

function findProfilePost(postId) {
  const list = getProfilePostList();
  const idx = list.findIndex((item) => String(item.id) === String(postId));
  return { list, idx, post: idx >= 0 ? list[idx] : null };
}

async function updateProfilePostType(postId, nextType) {
  if (!postId || !state.user) return;
  const isBusiness = state.userProfile.role === "business";
  if (isBusiness) {
    const restaurantId = state.userProfile.restaurantId;
    if (!restaurantId) return;
    await setDoc(doc(db, "restaurants", restaurantId, "socialPosts", postId), { type: nextType }, { merge: true });
  } else {
    await setDoc(doc(db, "users", state.user.uid, "posts", postId), { type: nextType }, { merge: true });
  }
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
  if (!confirm("Beitrag wirklich loeschen?")) return;
  const { list, idx } = findProfilePost(postId);
  if (idx < 0) return;
  list.splice(idx, 1);
  state.profilePostMenuId = null;
  render();
  if (state.userProfile.role === "business") {
    if (state.userProfile.restaurantId) {
      writeCache(businessPostsKey(state.userProfile.restaurantId), state.businessPosts);
    }
  } else {
    if (state.user?.uid) {
      writeCache(userPostsKey(state.user.uid), state.userPosts);
    }
  }
  try {
    if (state.userProfile.role === "business") {
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
  const menus = document.querySelectorAll("[data-profile-menu]");
  const next = postId ? String(postId) : "";
  menus.forEach((menu) => {
    const isOpen = next && menu.dataset.profileMenu === next;
    menu.classList.toggle("hidden", !isOpen);
  });
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

  if (ownerType === "restaurant" && ownerId) {
    return doc(db, "restaurants", ownerId, "socialPosts", id);
  }
  if (ownerType === "user" && ownerId) {
    return doc(db, "users", ownerId, "posts", id);
  }

  const profileOwner = state.profileView?.profile;
  if (profileOwner?.restaurantId) {
    return doc(db, "restaurants", profileOwner.restaurantId, "socialPosts", id);
  }
  if (profileOwner?.uid) {
    return doc(db, "users", profileOwner.uid, "posts", id);
  }

  if (state.user?.uid) {
    return doc(db, "users", state.user.uid, "posts", id);
  }
  return null;
}

function getFeedDocRef(post) {
  if (!post?.id) return null;
  return doc(db, "socialFeed", String(post.id));
}

async function resolveRestaurantOwnerUid(restaurantId) {
  if (!restaurantId) return "";
  if (restaurantOwnerCache.has(restaurantId)) {
    return restaurantOwnerCache.get(restaurantId) || "";
  }
  const cached = state.restaurants.find((r) => r.id === restaurantId);
  const ownerUid = cached?.ownerUid || cached?.ownerId || "";
  if (ownerUid) {
    restaurantOwnerCache.set(restaurantId, ownerUid);
    return ownerUid;
  }
  try {
    const snap = await getDoc(doc(db, "restaurants", restaurantId));
    if (snap.exists()) {
      const data = snap.data() || {};
      const uid = data.ownerUid || data.ownerId || "";
      restaurantOwnerCache.set(restaurantId, uid);
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
  if (post.ownerType === "restaurant" && post.ownerId) {
    return resolveRestaurantOwnerUid(post.ownerId);
  }
  if (post.restaurantId) {
    return resolveRestaurantOwnerUid(post.restaurantId);
  }
  return "";
}

async function loadPostMetaFromFirebase(post) {
  const postRef = getPostDocRef(post);
  if (!postRef) return { likes: [], comments: [] };
  const meta = { likes: [], comments: [] };
  try {
    const likesSnap = await getDocs(query(collection(postRef, "likes"), orderBy("createdAt", "desc"), limit(FAST_LIMITS.likes)));
    meta.likes = likesSnap.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }));
  } catch (err) {
    console.error(err);
  }
  try {
    const commentsSnap = await getDocs(query(collection(postRef, "comments"), orderBy("createdAt", "desc"), limit(FAST_LIMITS.comments)));
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
  state.postMeta[post.id] = meta;
  return meta;
}

function renderPublicProfileView() {
  const view = state.profileView;
  if (!view || !view.profile) return "";
  const profile = view.profile;
  const posts = view.posts || profile.posts || [];
  const followKey = String(profile.handle || "").replace(/^@/, "");
  const isFollowing = state.followingHandles.includes(followKey);
  const typeLabel = profile.restaurantId ? "Business" : "User";
  const handle = String(profile.handle || normalizeHandle(profile.name || "user")).replace(/^@/, "");
  const safeBio = escapeHtml(profile.bio || "").replace(/\n/g, "<br>");
  const bioHtml = safeBio || "Noch keine Bio.";
  const isMediaTab = state.profileContentTab === "media";
  const isCheckinTab = state.profileContentTab === "checkins";
  const filteredPosts = isMediaTab ? posts.filter((p) => p.isVideo) : posts;
  const avatarUrl = getOptimizedImageUrl(profile.avatar, "avatar");
  const avatarFit = logoFitClass(!!profile.restaurantId);
  const avatarKey = profile.uid || profile.restaurantId || handle || "public";
  return `
    <div class="pb-24">
      <div class="px-5 pb-2 pt-10">

        <div class="bg-white rounded-[2.5rem] p-8 relative overflow-hidden z-10 border border-slate-100">
          <div class="relative z-10">
            <div class="flex justify-between items-start mb-8">
              <div class="relative">
                <div class="relative w-[100px] h-[100px] rounded-[2rem] p-[3px] bg-gradient-to-br from-indigo-500 to-purple-500">
                  <img src="${escapeHtml(avatarUrl)}" decoding="async" width="100" height="100" data-img-key="avatar:public:${escapeHtml(avatarKey)}" class="w-full h-full rounded-[1.8rem] ${avatarFit} border-2 border-white" />
                </div>
                ${profile.isPremium ? `
                  <div class="absolute -bottom-1 -right-1 bg-white rounded-full p-1.5 shadow-lg text-blue-500 border-2 border-slate-50">
                    ${icon("badge-check", "w-4 h-4 fill-blue-500 text-white")}
                  </div>
                ` : ""}
              </div>

              <div class="flex items-center gap-6 pt-3 pr-2">
                 <div class="flex flex-col items-center">
                    <span class="font-black text-2xl text-slate-900 leading-none mb-1">${escapeHtml(formatCount(profile.followers))}</span>
                    <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest opacity-80">Fans</span>
                 </div>
                 <div class="w-px h-8 bg-slate-100"></div>
                 <div class="flex flex-col items-center">
                    <span class="font-black text-2xl text-slate-900 leading-none mb-1">${escapeHtml(formatCount(profile.following))}</span>
                    <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest opacity-80">Folgt</span>
                 </div>
              </div>
            </div>

            <div class="mb-8">
              <h1 class="font-black text-[28px] bg-gradient-to-br from-slate-900 to-indigo-600 text-transparent bg-clip-text tracking-tight leading-none mb-3">${escapeHtml(profile.name || "User")}</h1>
              <p class="text-[11px] font-bold text-slate-400 uppercase tracking-[0.3em] mb-2">@${escapeHtml(handle)}</p>
              <p class="text-[15px] text-slate-500 font-medium leading-relaxed max-w-[300px]">${bioHtml}</p>
              <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-4">${escapeHtml(profile.location || "-")} / ${typeLabel}</p>
            </div>

            <div class="flex gap-4">
              <button data-public-profile-follow="${escapeHtml(profile.handle)}" data-target-type="${escapeHtml(profile.restaurantId ? "restaurant" : (profile.uid ? "user" : ""))}" data-target-id="${escapeHtml(profile.restaurantId || profile.uid || "")}" data-target-name="${escapeHtml(profile.name || "")}" data-target-avatar="${escapeHtml(profile.avatar || "")}" class="flex-1 h-[56px] rounded-[1.2rem] font-bold text-xs uppercase tracking-widest shadow-[0_10px_20px_-5px_rgba(15,23,42,0.25)] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2 relative overflow-hidden ${isFollowing ? "bg-slate-100 text-slate-600 shadow-none border border-slate-200" : "bg-gradient-to-r from-slate-900 to-slate-800 text-white border border-transparent"}">
                <span class="relative z-10 flex items-center gap-2">
                  ${isFollowing ? icon("check", "w-4 h-4") : ""}
                  ${isFollowing ? "Following" : "Follow"}
                </span>
              </button>
              <button class="w-[56px] h-[56px] flex items-center justify-center rounded-[1.2rem] border border-slate-200 bg-white text-slate-900 active:scale-[0.95] transition-all duration-300 shadow-sm hover:shadow-md hover:border-slate-300 group">
                ${icon("message-circle", "w-5 h-5")}
              </button>
            </div>
          </div>
        </div>
      </div>

      ${renderProfileTabs()}
      ${renderProfileViewControls()}

      ${isCheckinTab ? `
        ${renderProfileCheckins()}
      ` : `
        <div class="${state.profileViewMode === "grid" ? "grid grid-cols-2 gap-4 px-6 grid-flow-dense" : "flex flex-col gap-8 px-6"}">
          ${renderProfilePostsFancy(filteredPosts, state.profileViewMode, false)}
        </div>
      `}
    </div>
  `;
}

function renderProfileView() {
  const profile = state.userProfile;
  const posts = profile.role === "business" ? state.businessPosts : state.userPosts;
  const handle = String(profile.handle || normalizeHandle(profile.name || "user")).replace(/^@/, "");
  const safeBio = escapeHtml(profile.bio || "").replace(/\n/g, "<br>");
  const bioHtml = safeBio || "Noch keine Bio.";
  const isMediaTab = state.profileContentTab === "media";
  const isCheckinTab = state.profileContentTab === "checkins";
  const filteredPosts = isMediaTab ? posts.filter((p) => p.isVideo) : posts;
  const avatarUrl = getOptimizedImageUrl(profile.avatar, "avatar");
  const avatarFit = logoFitClass(profile.role === "business");
  return `
    <div class="pb-24">
      <div class="px-5 pb-2 pt-10">
        <input type="file" id="profileAvatarInput" class="hidden" accept="image/*" />
        <div class="bg-white rounded-[2.5rem] p-8 relative overflow-hidden z-10 border border-slate-100">
          <div class="relative z-10">
            <div class="flex justify-between items-start mb-8">
              <div id="profileAvatarTrigger" class="relative cursor-pointer group">
                <div class="relative w-[100px] h-[100px] rounded-[2rem] p-[3px] bg-gradient-to-br from-indigo-500 to-purple-500">
                  <img src="${escapeHtml(avatarUrl)}" decoding="async" width="100" height="100" data-img-key="avatar:self" class="w-full h-full rounded-[1.8rem] ${avatarFit} border-2 border-white" />
                </div>
                ${profile.isPremium ? `
                  <div class="absolute -bottom-1 -right-1 bg-white rounded-full p-1.5 shadow-lg text-blue-500 border-2 border-slate-50">
                    ${icon("badge-check", "w-4 h-4 fill-blue-500 text-white")}
                  </div>
                ` : ""}
              </div>

              <div class="flex items-center gap-6 pt-3 pr-2">
                 <div class="flex flex-col items-center">
                    <span class="font-black text-2xl text-slate-900 leading-none mb-1">${escapeHtml(formatCount(profile.followers))}</span>
                    <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest opacity-80">Fans</span>
                 </div>
                 <div class="w-px h-8 bg-slate-100"></div>
                 <div class="flex flex-col items-center">
                    <span class="font-black text-2xl text-slate-900 leading-none mb-1">${escapeHtml(formatCount(profile.following))}</span>
                    <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest opacity-80">Folgt</span>
                 </div>
              </div>
            </div>

            <div class="mb-8">
              <h1 class="font-black text-[28px] bg-gradient-to-br from-slate-900 to-indigo-600 text-transparent bg-clip-text tracking-tight leading-none mb-3">${escapeHtml(profile.name || "User")}</h1>
              <p class="text-[11px] font-bold text-slate-400 uppercase tracking-[0.3em] mb-2">@${escapeHtml(handle)}</p>
              <p class="text-[15px] text-slate-500 font-medium leading-relaxed max-w-[300px]">${bioHtml}</p>
              <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-4">${escapeHtml(profile.location || "-")}</p>
            </div>

            <div class="flex gap-4">
              <button data-nav="upload" class="flex-1 h-[56px] rounded-[1.2rem] font-bold text-xs uppercase tracking-widest shadow-[0_10px_20px_-5px_rgba(15,23,42,0.25)] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2 relative overflow-hidden bg-gradient-to-r from-slate-900 to-slate-800 text-white border border-transparent group">
                <span class="relative z-10 flex items-center gap-2">${icon("plus", "w-4 h-4")} Status</span>
                <div class="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
              </button>
              <button data-nav="settings" class="w-[56px] h-[56px] flex items-center justify-center rounded-[1.2rem] border border-slate-200 bg-white text-slate-900 active:scale-[0.95] transition-all duration-300 shadow-sm hover:shadow-md hover:border-slate-300 group">
                ${icon("settings", "w-5 h-5")}
              </button>
            </div>
          </div>
        </div>
      </div>

      ${renderProfileTabs()}
      ${renderProfileViewControls()}

      ${isCheckinTab ? `
        ${renderProfileCheckins()}
      ` : `
        <div class="${state.profileViewMode === "grid" ? "grid grid-cols-2 gap-4 px-6 grid-flow-dense" : "flex flex-col gap-8 px-6"}">
          ${renderProfilePostsFancy(filteredPosts, state.profileViewMode)}
        </div>
        ${state.profileContentTab === "posts" ? `
          <div class="px-6 mt-8 mb-4">
            <button data-nav="upload" class="w-full py-5 rounded-[2rem] bg-slate-900 text-white font-black text-xs uppercase tracking-[0.2em] shadow-[0_10px_20px_-5px_rgba(15,23,42,0.25)] active:scale-95 transition-all flex items-center justify-center gap-3 group relative overflow-hidden">
              <span class="relative z-10 flex items-center gap-2">
                ${icon("plus", "w-4 h-4")} Neuen Beitrag
              </span>
              <div class="absolute inset-0 bg-indigo-600 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
            </button>
          </div>
        ` : ""}
      `}
    </div>
  `;
}

async function openProfileFromBusiness(input) {
  try {
    const safeName = String(typeof input === "string" ? input : input?.name || "").trim();
    const restaurantId = typeof input === "string" ? "" : (input?.id || "");
    if (!safeName && !restaurantId) return;

    const rest = restaurantId
      ? (state.restaurants.find((r) => r.id === restaurantId) || { id: restaurantId })
      : (state.restaurants.find((r) => (r.name || r.restaurantName || "") === safeName) || {});

    const fallbackPosts = state.feedPosts
      .filter((p) => (restaurantId ? p.restaurantId === restaurantId : p.business === safeName))
      .map((p, idx) => ({
        id: p.id || `feed_${idx}`,
        url: p.image,
        type: p.type || "square",
        caption: p.content || "",
        createdAt: p.createdAt,
        likes: p.likes ?? 0,
        comments: p.comments ?? 0,
        ownerType: "restaurant",
        ownerId: restaurantId || p.restaurantId || ""
      }));

    const cacheKey = restaurantId || safeName;
    const cached = businessProfileCache.get(cacheKey);
    if (cached) {
    state.profileModal = { open: true, profile: cached };
    renderOverlays();
    return;
  }

    const placeholderProfile = normalizeExternalProfile({
      profileDoc: null,
      restaurant: rest,
      fallbackName: safeName || rest.name || rest.restaurantName || "Business",
      posts: fallbackPosts
    });

    state.profileModal = { open: true, profile: placeholderProfile };
    renderOverlays();

    const [profileSnap, posts] = await Promise.all([
      fetchBusinessProfileDoc({ restaurantId, restaurant: rest }),
      restaurantId ? loadBusinessPostsForRestaurant(restaurantId) : Promise.resolve(fallbackPosts)
    ]);

    const resolved = normalizeExternalProfile({
      profileDoc: profileSnap,
      restaurant: rest,
      fallbackName: safeName || rest.name || rest.restaurantName || "Business",
      posts: posts && posts.length ? posts : fallbackPosts
    });

    businessProfileCache.set(cacheKey, resolved);
    state.profileModal = { open: true, profile: resolved };
    renderOverlays();
  } catch (err) {
    console.error(err);
  }
}

function showPublicProfile(profile, posts, { showBack = true, backTab } = {}) {
  state.profileView = { profile, posts: posts || profile.posts || [] };
  state.profileModal = { open: false, profile: null };
  state.profileContentTab = "posts";
  state.profileViewMode = "grid";
  state.profilePostMenuId = null;
  state.drawerOpen = false;
  if (showBack) {
    state.profileBackTab = backTab || state.activeTab || "feed";
  } else {
    state.profileBackTab = "";
  }
  state.activeTab = "profile";
  render();
  attachProfileViewListener(profile);
}

async function openProfileViewFromBusiness(input, { showBack = true } = {}) {
  try {
    const safeName = String(typeof input === "string" ? input : input?.name || "").trim();
    const restaurantId = typeof input === "string" ? "" : (input?.id || "");
    if (!safeName && !restaurantId) return;

    const rest = restaurantId
      ? (state.restaurants.find((r) => r.id === restaurantId) || { id: restaurantId })
      : (state.restaurants.find((r) => (r.name || r.restaurantName || "") === safeName) || {});

    const fallbackPosts = state.feedPosts
      .filter((p) => (restaurantId ? p.restaurantId === restaurantId : p.business === safeName))
      .map((p, idx) => ({
        id: p.id || `feed_${idx}`,
        url: p.image,
        type: p.type || "square",
        caption: p.content || "",
        createdAt: p.createdAt,
        likes: p.likes ?? 0,
        comments: p.comments ?? 0,
        ownerType: "restaurant",
        ownerId: restaurantId || p.restaurantId || ""
      }));

    const placeholderProfile = normalizeExternalProfile({
      profileDoc: null,
      restaurant: rest,
      fallbackName: safeName || rest.name || rest.restaurantName || "Business",
      posts: fallbackPosts
    });

    showPublicProfile(placeholderProfile, placeholderProfile.posts, { showBack });

    const [profileSnap, posts] = await Promise.all([
      fetchBusinessProfileDoc({ restaurantId, restaurant: rest }),
      restaurantId ? loadBusinessPostsForRestaurant(restaurantId) : Promise.resolve(fallbackPosts)
    ]);

    const resolved = normalizeExternalProfile({
      profileDoc: profileSnap,
      restaurant: rest,
      fallbackName: safeName || rest.name || rest.restaurantName || "Business",
      posts: posts && posts.length ? posts : fallbackPosts
    });

    if (state.activeTab !== "profile") return;
    if (restaurantId && state.profileView?.profile?.restaurantId !== restaurantId) return;
    showPublicProfile(resolved, resolved.posts, { showBack });
  } catch (err) {
    console.error(err);
  }
}

async function openProfileFromUser(input) {
  try {
    const uid = typeof input === "string" ? input : (input?.uid || "");
    const handle = String(typeof input === "string" ? "" : (input?.handle || input?.name || "")).replace(/^@/, "");
    if (!uid && !handle) return;

    const cacheKey = uid || handle;
    const cached = userProfileCache.get(cacheKey);
    if (cached) {
      showPublicProfile(cached, cached.posts || []);
      return;
    }

    const fallbackProfile = normalizeExternalUserProfile({ userDoc: null, fallback: input || {}, posts: [] });
    showPublicProfile(fallbackProfile, []);

    let userDoc = null;
    if (uid) {
      const snap = await getDoc(doc(db, "users", uid));
      if (snap.exists()) userDoc = snap;
    } else if (handle) {
      const resolved = await resolveUserByHandle(handle);
      if (resolved?.id) userDoc = { id: resolved.id, data: resolved.data };
    }

    if (!userDoc) return;
    const posts = await loadUserPostsForUser(userDoc.id);
    const resolvedProfile = normalizeExternalUserProfile({
      userDoc,
      fallback: input || {},
      posts
    });
    userProfileCache.set(cacheKey, resolvedProfile);
    if (state.activeTab !== "profile") return;
    if (uid && state.profileView?.profile?.uid !== uid) return;
    showPublicProfile(resolvedProfile, resolvedProfile.posts);
  } catch (err) {
    console.error(err);
  }
}

async function loadFollowingFromFirebase({ force = false } = {}) {
  if (!state.user) return;
  try {
    const ref = collection(db, "users", state.user.uid, "following");
    const snap = await getDocs(ref);
    const handles = [];
    snap.forEach((docSnap) => {
      const data = docSnap.data() || {};
      if (data.handle) handles.push(String(data.handle));
    });
    state.followingHandles = handles;
    saveFollowing(handles);
  } catch (err) {
    console.error(err);
    state.followingHandles = [];
  }
}

async function loadNotificationsFromFirebase({ force = false } = {}) {
  if (!state.user) return;
  try {
    const ref = collection(db, "users", state.user.uid, "notifications");
    const snap = await getDocs(query(ref, orderBy("createdAt", "desc"), limit(60)));
    const items = [];
    snap.forEach((docSnap) => {
      const data = docSnap.data() || {};
      items.push({
        id: docSnap.id,
        type: data.type || "system",
        user: data.user || data.userName || "User",
        text: data.text || "folgt dir jetzt",
        time: formatRelative(toDateSafe(data.createdAt)),
        img: data.avatar || data.img || "",
        read: !!data.read,
        createdAt: data.createdAt,
        postId: data.postId || "",
        commentId: data.commentId || "",
        userHandle: data.userHandle || data.handle || "",
        userUid: data.userUid || data.uid || "",
        ownerType: data.ownerType || "",
        ownerId: data.ownerId || "",
        restaurantId: data.restaurantId || ""
      });
    });
    state.notifications = items;
    saveNotifications(items);
    const updated = updateNotificationsDom();
    if (!updated && state.activeTab === "notifications") {
      render();
    }
  } catch (err) {
    console.error(err);
  }
}

async function pushUserNotification(targetUid, payload) {
  if (!targetUid) return;
  try {
    const ref = doc(collection(db, "users", targetUid, "notifications"));
    await setDoc(ref, {
      ...payload,
      read: false,
      createdAt: serverTimestamp()
    });
  } catch (err) {
    console.error(err);
  }
}

async function markNotificationRead(id) {
  if (!id) return;
  const idx = state.notifications.findIndex((n) => n.id === id);
  if (idx >= 0 && !state.notifications[idx].read) {
    state.notifications[idx].read = true;
    saveNotifications(state.notifications);
    const updated = updateNotificationsDom();
    if (!updated && state.activeTab === "notifications") {
      render();
    }
  }
  if (state.user?.uid) {
    try {
      await updateDoc(doc(db, "users", state.user.uid, "notifications", id), { read: true });
    } catch (err) {
      console.error(err);
    }
  }
}

async function markAllNotificationsRead() {
  const unread = state.notifications.filter((n) => !n.read);
  if (!unread.length) return;
  state.notifications = state.notifications.map((n) => ({ ...n, read: true }));
  saveNotifications(state.notifications);
  const updated = updateNotificationsDom();
  if (!updated && state.activeTab === "notifications") {
    render();
  }
  if (state.user?.uid) {
    await Promise.allSettled(unread.map((n) =>
      updateDoc(doc(db, "users", state.user.uid, "notifications", n.id), { read: true })
    ));
  }
}

function normalizeUserPostDoc(postId, data, ownerId) {
  return {
    id: postId,
    url: data.url || "",
    type: data.type || "square",
    title: data.title || "",
    caption: data.caption || "",
    createdAt: data.createdAt,
    likes: data.likesCount ?? data.likes ?? 0,
    comments: data.commentsCount ?? data.comments ?? 0,
    isVideo: !!data.isVideo,
    ownerType: "user",
    ownerId: ownerId || ""
  };
}

function normalizeRestaurantPostDoc(postId, data, restaurantId) {
  return {
    id: postId,
    url: data.media?.[0]?.url || data.mediaUrl || "",
    type: data.type || "square",
    title: data.title || "",
    caption: data.caption || "",
    createdAt: data.createdAt,
    likes: data.likesCount ?? data.likes ?? 0,
    comments: data.commentsCount ?? data.comments ?? 0,
    isVideo: data.media?.[0]?.type === "video",
    ownerType: "restaurant",
    ownerId: restaurantId || "",
    restaurantId: restaurantId || ""
  };
}

async function fetchPostForNotification(notif) {
  const postId = String(notif.postId || "");
  if (!postId) return null;
  const ownerType = notif.ownerType || "";
  const ownerId = notif.ownerId || notif.restaurantId || "";

  try {
    if (ownerType === "user" && ownerId) {
      const snap = await getDoc(doc(db, "users", ownerId, "posts", postId));
      if (snap.exists()) return normalizeUserPostDoc(postId, snap.data() || {}, ownerId);
    }
    if (ownerType === "restaurant" && ownerId) {
      const snap = await getDoc(doc(db, "restaurants", ownerId, "socialPosts", postId));
      if (snap.exists()) return normalizeRestaurantPostDoc(postId, snap.data() || {}, ownerId);
    }
    const feedSnap = await getDoc(doc(db, "socialFeed", postId));
    if (feedSnap.exists()) return normalizeFeedPost({ id: feedSnap.id, ...feedSnap.data() });
  } catch (err) {
    console.error(err);
  }
  return null;
}

function highlightCommentInModal(commentId) {
  const commentsRoot = document.getElementById("postModalComments");
  if (!commentsRoot) return false;
  const safeId = String(commentId || "");
  if (!safeId) return false;
  const target = commentsRoot.querySelector(`[data-comment-id="${safeId}"]`);
  if (!target) return false;
  target.classList.add("ring-2", "ring-indigo-300", "bg-indigo-50/70");
  target.scrollIntoView({ behavior: "smooth", block: "center" });
  setTimeout(() => {
    target.classList.remove("ring-2", "ring-indigo-300", "bg-indigo-50/70");
  }, 2000);
  return true;
}

async function openPostFromNotification(notif) {
  const postId = String(notif.postId || "");
  if (!postId) return;
  let post = findPostById(postId) || state.feedPosts.find((item) => String(item.id) === postId) || null;
  if (!post) {
    post = await fetchPostForNotification(notif);
  }
  if (!post) {
    pendingCommentHighlight = "";
    return;
  }
  if (notif.type === "comment" && notif.commentId) {
    pendingCommentHighlight = String(notif.commentId);
  }
  await openPostModal(post);
  if (pendingCommentHighlight) {
    if (highlightCommentInModal(pendingCommentHighlight)) {
      pendingCommentHighlight = "";
    }
  }
}

async function openNotificationTarget(id) {
  const notif = state.notifications.find((n) => n.id === id);
  if (!notif) return;
  void markNotificationRead(id);
  if (notif.type === "follow") {
    openProfileFromUser({
      uid: notif.userUid || "",
      handle: notif.userHandle || notif.user || "",
      name: notif.user || "User",
      avatar: notif.img || ""
    });
    return;
  }
  if (notif.type === "like" || notif.type === "comment") {
    await openPostFromNotification(notif);
  }
}

async function resolveUserByHandle(handle) {
  if (!handle) return null;
  const safeHandle = String(handle || "").replace(/^@/, "");
  try {
    const snap = await getDocs(query(collection(db, "users"), where("handle", "==", safeHandle), limit(1)));
    if (!snap.empty) {
      const docSnap = snap.docs[0];
      return { id: docSnap.id, data: docSnap.data() || {} };
    }
  } catch (err) {
    console.error(err);
  }
  return null;
}

async function toggleFollow(handle, target = {}) {
  if (!state.user) return;
  const safeHandle = String(handle || "").replace(/^@/, "");
  if (!safeHandle) return;

  let targetType = target.type || "";
  let targetId = target.id || "";
  if (!targetType) {
    if (target.restaurantId) {
      targetType = "restaurant";
      targetId = target.restaurantId;
    } else if (target.uid) {
      targetType = "user";
      targetId = target.uid;
    }
  }

  if (!targetId && safeHandle) {
    const userSnap = await resolveUserByHandle(safeHandle);
    if (userSnap?.id) {
      targetType = "user";
      targetId = userSnap.id;
    }
  }

  const docId = `${targetType || "handle"}_${targetId || safeHandle}`;
  const followRef = doc(db, "users", state.user.uid, "following", docId);
  const idx = state.followingHandles.indexOf(safeHandle);
  const isUnfollow = idx >= 0;
  const delta = isUnfollow ? -1 : 1;
  const toNum = (value) => {
    const n = Number(value);
    return Number.isFinite(n) ? n : 0;
  };

  try {
    if (isUnfollow) {
      await deleteDoc(followRef);
      state.followingHandles.splice(idx, 1);
    } else {
      await setDoc(followRef, {
        handle: safeHandle,
        targetType: targetType || "handle",
        targetId: targetId || "",
        name: target.name || "",
        avatar: target.avatar || "",
        createdAt: serverTimestamp()
      });
      state.followingHandles.unshift(safeHandle);
    }

    state.userProfile.following = Math.max(0, toNum(state.userProfile.following) + delta);
    try {
      await updateDoc(doc(db, "users", state.user.uid), { followingCount: increment(delta) });
    } catch (err) {
      console.error(err);
    }

    if (targetType === "user" && targetId) {
      try {
        await updateDoc(doc(db, "users", targetId), { followersCount: increment(delta) });
        if (delta > 0) {
          const actor = currentUserBadge();
          await pushUserNotification(targetId, {
            type: "follow",
            user: actor.name,
            userHandle: actor.handle,
            userUid: actor.uid,
            avatar: actor.avatar,
            text: "folgt dir jetzt"
          });
        }
      } catch (err) {
        console.error(err);
      }
    }
    if (targetType === "restaurant" && targetId) {
      try {
        await updateDoc(doc(db, "restaurants", targetId), { followersCount: increment(delta) });
      } catch (err) {
        console.error(err);
      }
    }
    saveFollowing(state.followingHandles);

    const profileModal = state.profileModal.profile;
    const profileView = state.profileView?.profile || null;
    if (profileModal && profileModal.handle === safeHandle) {
      profileModal.followers = Math.max(0, toNum(profileModal.followers) + delta);
    }
    if (profileView && profileView.handle === safeHandle) {
      profileView.followers = Math.max(0, toNum(profileView.followers) + delta);
    }

    businessProfileCache.forEach((cached) => {
      if (cached?.handle !== safeHandle) return;
      cached.followers = Math.max(0, toNum(cached.followers) + delta);
    });
  } catch (err) {
    console.error(err);
  }

  if (state.profileModal.open && !state.profileView) {
    renderOverlays();
  } else {
    render();
  }
}

function renderProfileModal() {
  if (!state.profileModal.open || !state.profileModal.profile) return "";
  const p = state.profileModal.profile;
  const followKey = String(p.handle || "").replace(/^@/, "");
  const isFollowing = state.followingHandles.includes(followKey);
  const typeLabel = p.restaurantId ? "Business" : "User";
  const avatarUrl = getOptimizedImageUrl(p.avatar, "avatar");

  return `
    <div class="fixed inset-0 z-[60]">
      <div id="profileModalOverlay" class="absolute inset-0 bg-black/60"></div>
      <div class="absolute inset-x-0 bottom-0 max-w-md mx-auto">
        <div class="bg-white rounded-t-[3rem] shadow-2xl border border-slate-100 p-7">
          <div class="flex justify-end mb-4">
            <button id="profileModalClose" class="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-500">${icon("x", "w-4 h-4")}</button>
          </div>

          <div class="flex items-center gap-4">
            <img src="${escapeHtml(avatarUrl)}" class="w-16 h-16 rounded-2xl object-cover shadow" />
            <div class="flex-1 min-w-0">
              <p class="text-xs font-black">@${escapeHtml(p.handle)}</p>
              <p class="text-[10px] text-slate-400 font-bold uppercase tracking-widest">${escapeHtml(p.location)} / ${typeLabel}</p>
            </div>
            <button id="profileFollowBtn" data-handle="${escapeHtml(p.handle)}" data-target-type="${escapeHtml(p.restaurantId ? "restaurant" : (p.uid ? "user" : ""))}" data-target-id="${escapeHtml(p.restaurantId || p.uid || "")}" data-target-name="${escapeHtml(p.name || "")}" data-target-avatar="${escapeHtml(p.avatar || "")}" class="px-5 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest active:scale-95 transition-transform ${isFollowing ? "bg-slate-100 text-slate-700" : "bg-indigo-600 text-white shadow-xl shadow-indigo-500/20"}">
              ${isFollowing ? "Following" : "Follow"}
            </button>
          </div>

          <p class="mt-5 text-sm font-medium text-slate-600 leading-relaxed">${escapeHtml(p.bio)}</p>

          <div class="flex gap-3 mt-6">
            <div class="flex-1 p-4 rounded-2xl bg-slate-50 border border-slate-100 text-center">
              <div class="text-lg font-black text-slate-900">${escapeHtml(formatCount(p.posts?.length || 0))}</div>
              <div class="text-[9px] font-bold text-slate-400 uppercase">Posts</div>
            </div>
            <div class="flex-1 p-4 rounded-2xl bg-slate-50 border border-slate-100 text-center">
              <div class="text-lg font-black text-slate-900">${escapeHtml(formatCount(p.followers))}</div>
              <div class="text-[9px] font-bold text-slate-400 uppercase">Follower</div>
            </div>
            <div class="flex-1 p-4 rounded-2xl bg-slate-50 border border-slate-100 text-center">
              <div class="text-lg font-black text-slate-900">${escapeHtml(formatCount(p.following))}</div>
              <div class="text-[9px] font-bold text-slate-400 uppercase">Following</div>
            </div>
          </div>

          <div class="h-2"></div>
        </div>
      </div>
    </div>
  `;
}

function renderCommentItem(postId, comment, parentId = "") {
  const likeCount = Number.isFinite(Number(comment.likesCount))
    ? Number(comment.likesCount)
    : (Array.isArray(comment.likes) ? comment.likes.length : 0);
  const isReply = !!parentId;
  const handleKey = normalizeHandle(comment.handle || comment.author || "");
  let avatarUrl = resolveCommentAvatar(comment);
  const selfUid = state.user?.uid || "";
  const selfHandle = normalizeHandle(state.userProfile.handle || state.userProfile.name || "");
  const isSelf = (!!selfUid && comment.uid && String(comment.uid) === String(selfUid))
    || (!!selfHandle && handleKey && handleKey === selfHandle);
  if (isSelf) {
    const selfAvatar = getSelfAvatarUrl();
    if (selfAvatar) avatarUrl = selfAvatar;
  }
  if (isPlaceholderUrl(avatarUrl)) scheduleCommentAvatarFetch(comment);
  const safeSrc = (!avatarUrl || isPlaceholderUrl(avatarUrl)) ? PLACEHOLDER_IMAGE : avatarUrl;
  return `
    <div class="flex gap-3 ${isReply ? "ml-10" : ""}" data-comment-id="${escapeHtml(comment.id)}" data-comment-parent="${escapeHtml(parentId || "")}" data-comment-uid="${escapeHtml(comment.uid || "")}" data-comment-handle="${escapeHtml(handleKey)}">
      <img src="${escapeHtml(safeSrc)}" data-img-key="comment-avatar:${escapeHtml(comment.id)}" data-comment-id="${escapeHtml(comment.id)}" data-comment-handle="${escapeHtml(handleKey)}" data-comment-uid="${escapeHtml(comment.uid || "")}" data-uid="${escapeHtml(comment.uid || "")}" data-handle="${escapeHtml(comment.handle || "")}" class="comment-avatar w-9 h-9 rounded-2xl object-cover shadow" loading="lazy" decoding="async" referrerpolicy="no-referrer" onerror="this.src='${PLACEHOLDER_IMAGE}'" alt="" />
      <div class="flex-1">
        <div class="flex items-center justify-between">
          <div class="text-xs font-black text-slate-900">${escapeHtml(comment.author)}</div>
          <div class="text-[10px] font-bold text-slate-400">${escapeHtml(formatDateTimeLabel(comment.createdAt))}</div>
        </div>
        <div class="text-sm text-slate-600 leading-relaxed mt-1">${escapeHtml(comment.text)}</div>
        <div class="flex items-center gap-3 mt-2 text-[10px] font-bold uppercase tracking-widest">
          <button data-comment-like="true" data-post-id="${escapeHtml(postId)}" data-comment-id="${escapeHtml(parentId || comment.id)}" data-reply-id="${isReply ? escapeHtml(comment.id) : ""}" class="flex items-center gap-1 text-slate-400 hover:text-rose-500">
            ${icon("heart", "w-3 h-3")} ${escapeHtml(likeCount)}
          </button>
          ${!isReply ? `<button data-comment-reply="true" data-post-id="${escapeHtml(postId)}" data-comment-id="${escapeHtml(comment.id)}" class="text-slate-400 hover:text-slate-900">Antworten</button>` : ""}
        </div>
      </div>
    </div>
  `;
}

function renderPostComments(comments) {
  if (state.postModal.loading) {
    return `<div class="text-center text-[10px] font-bold uppercase text-slate-400">Kommentare laden...</div>`;
  }
  const hasLiveComments = typeof modalCommentsUnsub === "function";
  const sendingRow = state.postModal.sending && hasLiveComments
    ? `<div class="text-center text-[10px] font-bold uppercase text-slate-400">Senden...</div>`
    : "";
  if (!comments.length) {
    return sendingRow || `<div class="text-center text-[10px] font-bold uppercase text-slate-400">Noch keine Kommentare</div>`;
  }
  return `${sendingRow}${comments.map((comment) => `
    <div class="space-y-3">
      ${renderCommentItem(state.postModal.post.id, comment)}
      ${(comment.replies || []).map((reply) => renderCommentItem(state.postModal.post.id, reply, comment.id)).join("")}
    </div>
  `).join("")}`;
}

function renderPostModal() {
  if (!state.postModal.open || !state.postModal.post) return "";
  const post = state.postModal.post;
  const meta = ensurePostMeta(post.id);
  const counts = resolvePostCounts(post);
  const caption = post.caption || post.title || "";
  const rawImageUrl = post.url || post.image || "";
  const imageUrl = getOptimizedImageUrl(rawImageUrl, "large");
  const comments = (meta.comments || []).map(ensureCommentShape);
  const userBadge = currentUserBadge();
  const isLiked = meta.likes?.some((item) => item.uid === userBadge.uid || item.handle === userBadge.handle);
  const replyTarget = comments.find((item) => item.id === state.postModal.replyTo);
  const animClass = "";

  return `
      <div class="fixed inset-0 z-[70]">
        <div id="postModalOverlay" class="absolute inset-0 bg-black/60"></div>
        <div class="absolute inset-x-0 bottom-0 max-w-md mx-auto">
          <div class="bg-white rounded-t-[3rem] shadow-2xl border border-slate-100 ${animClass} flex flex-col max-h-[85vh] overflow-hidden">
            <div class="flex-1 overflow-y-auto no-scrollbar modal-scroll p-7">
              <div class="flex items-center justify-between mb-4">
                <div>
                  <span class="text-[9px] font-black text-indigo-600 uppercase tracking-widest">Post</span>
                  <h3 class="text-xl font-black italic tracking-tighter">${escapeHtml(formatDateLabel(post.createdAt || new Date()))}</h3>
                  <p class="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1">Foto</p>
                </div>
                <button id="postModalClose" class="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-500">${icon("x", "w-4 h-4")}</button>
              </div>

              <div class="rounded-[2.5rem] overflow-hidden shadow-lg border border-slate-100">
                <img src="${escapeHtml(imageUrl)}" data-img-key="post-modal:${escapeHtml(post.id)}" class="w-full h-[22rem] object-cover" />
              </div>

              ${caption ? `
                <div class="mt-4 text-sm text-slate-600 leading-relaxed">${escapeHtml(caption)}</div>
              ` : ""}

              <div class="mt-4 flex items-center justify-between">
                <button id="postLikeBtn" data-post-id="${escapeHtml(post.id)}" class="flex items-center gap-2 text-sm font-black ${isLiked ? "text-rose-500" : "text-slate-700"}">
                  ${icon("heart", "w-5 h-5")} ${isLiked ? "Gefaellt" : "Like"}
                </button>
                <div class="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  <button id="postLikesBtn" data-post-id="${escapeHtml(post.id)}" class="hover:text-slate-700">${escapeHtml(counts.likeLabel)} Likes</button>
                  <span id="postCommentsCount">${escapeHtml(counts.commentLabel)} Kommentare</span>
                </div>
              </div>

              <div id="postModalComments" class="mt-5 space-y-4">
                ${renderPostComments(comments)}
              </div>

              ${replyTarget ? `
                <div class="mt-4 flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100">
                  <div class="text-[10px] font-bold uppercase text-slate-400">Antwort an @${escapeHtml(replyTarget.handle)}</div>
                  <button id="postReplyCancel" class="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Abbrechen</button>
                </div>
              ` : ""}
            </div>

            <div class="p-7 pt-4 border-t border-slate-100 bg-white">
              <div class="flex gap-3">
                <textarea id="postCommentInput" placeholder="Schreib einen Kommentar..." class="flex-1 p-4 rounded-2xl border border-slate-100 bg-white text-sm font-medium outline-none resize-none" rows="2">${escapeHtml(state.postModal.commentText || "")}</textarea>
                <button id="postCommentSend" data-post-id="${escapeHtml(post.id)}" class="w-14 h-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-xl shadow-indigo-500/20">
                  ${icon("send", "w-4 h-4")}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderLikesModal() {
  if (!state.likesModal.open || !state.likesModal.postId) return "";
  const meta = ensurePostMeta(state.likesModal.postId);
  const likes = meta.likes || [];
  const postForCount = findPostById(state.likesModal.postId);
  const likeTotal = Number(postForCount?.likes) || likes.length;
  const animClass = "";

  return `
      <div class="fixed inset-0 z-[80]">
        <div id="likesModalOverlay" class="absolute inset-0 bg-black/70"></div>
      <div class="absolute inset-x-0 bottom-0 max-w-md mx-auto">
        <div class="bg-white rounded-t-[3rem] shadow-2xl border border-slate-100 ${animClass} flex flex-col max-h-[80vh] overflow-hidden">
          <div class="p-7 pb-4 flex items-center justify-between">
            <div>
              <span class="text-[9px] font-black text-indigo-600 uppercase tracking-widest">Likes</span>
              <h3 class="text-xl font-black italic tracking-tighter">${likeTotal} Likes</h3>
            </div>
            <button id="likesModalClose" class="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-500">${icon("x", "w-4 h-4")}</button>
          </div>

          <div class="px-7 pb-7 space-y-3 overflow-y-auto no-scrollbar modal-scroll flex-1">
            ${likes.length ? likes.map((user) => {
              const avatarUrl = resolveLikeAvatar(user);
              return `
              <div class="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <img src="${escapeHtml(avatarUrl)}" class="w-10 h-10 rounded-2xl object-cover" />
                <div>
                  <div class="text-xs font-black">${escapeHtml(user.name)}</div>
                  <div class="text-[9px] font-bold text-slate-400 uppercase">@${escapeHtml(user.handle)}</div>
                </div>
              </div>
            `}).join("") : `
              <div class="text-center text-[10px] font-bold uppercase text-slate-400">Noch keine Likes</div>
            `}
          </div>
        </div>
      </div>
    </div>
  `;
}


function updatePostModalMeta() {
  if (!state.postModal.open || !state.postModal.post) return;
  updatePostModalCountsOnly();
  updatePostModalCommentsOnly();
}

function updatePostModalCountsOnly() {
  if (!state.postModal.open || !state.postModal.post) return;
  const post = state.postModal.post;
  const meta = ensurePostMeta(post.id);
  const likeCount = Number(post.likes) || 0;
  const commentCount = Number(post.comments) || 0;
  const userBadge = currentUserBadge();
  const isLiked = meta.likes?.some((item) => item.uid === userBadge.uid || item.handle === userBadge.handle);

  const postLikeBtn = document.getElementById("postLikeBtn");
  if (postLikeBtn) {
    postLikeBtn.classList.toggle("text-rose-500", !!isLiked);
    postLikeBtn.classList.toggle("text-slate-700", !isLiked);
    postLikeBtn.innerHTML = `${icon("heart", "w-5 h-5")} ${isLiked ? "Gefaellt" : "Like"}`;
  }
  const postLikesBtn = document.getElementById("postLikesBtn");
  if (postLikesBtn) postLikesBtn.textContent = `${formatCount(likeCount)} Likes`;
  const postCommentsCount = document.getElementById("postCommentsCount");
  if (postCommentsCount) postCommentsCount.textContent = `${formatCount(commentCount)} Kommentare`;
  if (window.lucide?.createIcons) window.lucide.createIcons();
}

function updatePostModalCommentsOnly() {
  if (!state.postModal.open || !state.postModal.post) return;
  const post = state.postModal.post;
  const meta = ensurePostMeta(post.id);
  const comments = (meta.comments || []).map(ensureCommentShape);
  const postComments = document.getElementById("postModalComments");
  if (postComments) {
    postComments.innerHTML = renderPostComments(comments);
    applyCommentAvatarCache(postComments);
    hydrateCommentAvatars(postComments, { postId: post.id });
  }
  if (window.lucide?.createIcons) window.lucide.createIcons();
  if (pendingCommentHighlight) {
    if (highlightCommentInModal(pendingCommentHighlight)) {
      pendingCommentHighlight = "";
    }
  }
}

function updateCommentLikeButton(postId, commentId, replyId, likeCount) {
  if (!postId || !commentId) return;
  const safePost = escapeSelector(postId);
  const safeComment = escapeSelector(commentId);
  const selector = `[data-comment-like="true"][data-post-id="${safePost}"][data-comment-id="${safeComment}"]`;
  const replyKey = replyId ? String(replyId) : "";
  document.querySelectorAll(selector).forEach((btn) => {
    const btnReply = btn.getAttribute("data-reply-id") || "";
    if (replyKey !== btnReply) return;
    btn.innerHTML = `${icon("heart", "w-3 h-3")} ${escapeHtml(String(likeCount))}`;
  });
  if (window.lucide?.createIcons) window.lucide.createIcons();
}

function renderSettingsView() {
  const settings = state.settings;
  const profile = state.userProfile;
  const avatarFit = logoFitClass(profile.role === "business");

  if (state.settingsView === "main") {
    return `
      <div class="p-6 animate-in slide-in-from-left-10 duration-500 pb-24">
        <h2 class="text-2xl font-black italic uppercase mb-8 px-2">Einstellungen</h2>
        <div class="space-y-3 mb-8">
          ${[
            { id: "account", label: "Account", icon: "user", desc: "Profil bearbeiten" },
            { id: "privacy", label: "Privatsphaere", icon: "lock", desc: "Sicherheit" },
            { id: "notifs", label: "Benachrichtigungen", icon: "bell", desc: "Push & Email" },
            { id: "saved", label: "Gespeichert", icon: "bookmark", desc: "Favoriten" }
          ].map((item) => `
            <button data-settings="${item.id}" class="w-full flex items-center justify-between p-5 bg-white rounded-[2.5rem] border border-slate-50 hover:bg-slate-50 transition-all">
              <div class="flex items-center gap-4">
                <div class="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-500">${icon(item.icon, "w-4 h-4")}</div>
                <div class="text-left">
                  <span class="font-black text-slate-800 text-sm block">${item.label}</span>
                  <span class="text-[10px] font-bold text-slate-400 uppercase">${item.desc}</span>
                </div>
              </div>
              ${icon("chevron-right", "w-4 h-4 text-slate-300")}
            </button>
          `).join("")}
        </div>
        <button id="settingsLogout" class="w-full p-5 bg-rose-50 text-rose-500 rounded-[2.5rem] font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2">${icon("log-out", "w-4 h-4")} Abmelden</button>
      </div>
    `;
  }

  if (state.settingsView === "account") {
    const restaurantOptions = state.restaurants.map((r) => {
      const label = escapeHtml(r.name || r.restaurantName || "Business");
      return `<option value="${r.id}" ${r.id === profile.restaurantId ? "selected" : ""}>${label}</option>`;
    }).join("");

    return `
      <div class="p-6 animate-in slide-in-from-right-10 duration-500">
        <header class="flex items-center gap-4 mb-8">
          <button data-settings-back="true" class="p-3 bg-slate-100 rounded-2xl text-slate-500 hover:bg-slate-200">${icon("arrow-left", "w-4 h-4")}</button>
          <h2 class="text-xl font-black italic uppercase tracking-tighter">Account</h2>
        </header>
        <div class="flex flex-col items-center mb-8">
          <input type="file" id="settingsAvatarInput" class="hidden" accept="image/*" />
          <div id="settingsAvatarTrigger" class="relative group cursor-pointer">
            <img src="${escapeHtml(resolveUserAvatar(profile.avatar))}" class="w-28 h-28 rounded-[3rem] ${avatarFit} border-4 border-white shadow-xl" />
            <div class="absolute -bottom-2 -right-2 w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg">${icon("camera", "w-4 h-4")}</div>
          </div>
        </div>
        <div class="p-6 rounded-[2.5rem] border border-slate-100 space-y-4 bg-white">
          <div>
            <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Name</label>
            <input id="settingsName" type="text" value="${escapeHtml(profile.name)}" class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100" />
          </div>
          <div>
            <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Handle</label>
            <input id="settingsHandle" type="text" value="${escapeHtml(profile.handle)}" class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100" />
          </div>
          <div>
            <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Bio</label>
            <textarea id="settingsBio" rows="3" class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100 resize-none">${escapeHtml(profile.bio)}</textarea>
          </div>
          <div>
            <label class="text-[10px] font-black text-slate-400 uppercase ml-2">City</label>
            <input id="settingsCity" type="text" value="${escapeHtml(profile.location)}" class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100" />
          </div>
          ${profile.role === "business" ? `
            <div>
              <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Business</label>
              <select id="settingsRestaurant" class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100">
                <option value="">Bitte waehlen</option>
                ${restaurantOptions}
              </select>
            </div>
          ` : ""}
        </div>
        <div class="mt-4 text-center text-[10px] font-bold text-slate-400" id="settingsStatus"></div>
      </div>
    `;
  }

  if (state.settingsView === "privacy") {
    return `
      <div class="p-6 animate-in slide-in-from-right-10 duration-500">
        <header class="flex items-center gap-4 mb-8">
          <button data-settings-back="true" class="p-3 bg-slate-100 rounded-2xl text-slate-500 hover:bg-slate-200">${icon("arrow-left", "w-4 h-4")}</button>
          <h2 class="text-xl font-black italic uppercase tracking-tighter">Privatsphaere</h2>
        </header>
        <div class="bg-white p-6 rounded-[2.5rem] border border-slate-100 space-y-6">
          <div class="flex justify-between items-center">
            <div>
              <p class="font-black text-slate-800 text-sm">Privates Konto</p>
              <p class="text-[10px] font-bold text-slate-400">Nur Follower sehen Posts</p>
            </div>
            <button data-toggle="privateAccount" class="w-11 h-6 rounded-full relative transition-colors duration-300 ${settings.privateAccount ? "bg-indigo-600" : "bg-slate-200"}">
              <div class="absolute top-1 w-4 h-4 bg-white rounded-full shadow-md transition-all duration-300 ${settings.privateAccount ? "right-1" : "left-1"}"></div>
            </button>
          </div>
          <div class="flex justify-between items-center">
            <div>
              <p class="font-black text-slate-800 text-sm">Online Status</p>
              <p class="text-[10px] font-bold text-slate-400">Fuer andere sichtbar</p>
            </div>
            <button data-toggle="showOnline" class="w-11 h-6 rounded-full relative transition-colors duration-300 ${settings.showOnline ? "bg-indigo-600" : "bg-slate-200"}">
              <div class="absolute top-1 w-4 h-4 bg-white rounded-full shadow-md transition-all duration-300 ${settings.showOnline ? "right-1" : "left-1"}"></div>
            </button>
          </div>
        </div>
      </div>
    `;
  }

  if (state.settingsView === "notifs") {
    return `
      <div class="p-6 animate-in slide-in-from-right-10 duration-500">
        <header class="flex items-center gap-4 mb-8">
          <button data-settings-back="true" class="p-3 bg-slate-100 rounded-2xl text-slate-500 hover:bg-slate-200">${icon("arrow-left", "w-4 h-4")}</button>
          <h2 class="text-xl font-black italic uppercase tracking-tighter">Mitteilungen</h2>
        </header>
        <div class="bg-white p-6 rounded-[2.5rem] border border-slate-100 space-y-6">
          <div class="flex justify-between items-center">
            <div>
              <p class="font-black text-slate-800 text-sm">Push Alerts</p>
              <p class="text-[10px] font-bold text-slate-400">Auf diesem Geraet</p>
            </div>
            <button data-toggle="pushNotifs" class="w-11 h-6 rounded-full relative transition-colors duration-300 ${settings.pushNotifs ? "bg-indigo-600" : "bg-slate-200"}">
              <div class="absolute top-1 w-4 h-4 bg-white rounded-full shadow-md transition-all duration-300 ${settings.pushNotifs ? "right-1" : "left-1"}"></div>
            </button>
          </div>
          <div class="flex justify-between items-center">
            <div>
              <p class="font-black text-slate-800 text-sm">Email Updates</p>
              <p class="text-[10px] font-bold text-slate-400">News & Highlights</p>
            </div>
            <button data-toggle="emailNotifs" class="w-11 h-6 rounded-full relative transition-colors duration-300 ${settings.emailNotifs ? "bg-indigo-600" : "bg-slate-200"}">
              <div class="absolute top-1 w-4 h-4 bg-white rounded-full shadow-md transition-all duration-300 ${settings.emailNotifs ? "right-1" : "left-1"}"></div>
            </button>
          </div>
        </div>
      </div>
    `;
  }

  return `
    <div class="p-6 animate-in slide-in-from-right-10 duration-500">
      <header class="flex items-center gap-4 mb-8">
        <button data-settings-back="true" class="p-3 bg-slate-100 rounded-2xl text-slate-500 hover:bg-slate-200">${icon("arrow-left", "w-4 h-4")}</button>
        <h2 class="text-xl font-black italic uppercase tracking-tighter">Gespeichert</h2>
      </header>
      <div class="grid grid-cols-2 gap-4">
        <div class="aspect-square bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-300">
          ${icon("bookmark", "w-8 h-8")}
          <span class="text-[10px] font-black uppercase mt-2">Leer</span>
        </div>
      </div>
    </div>
  `;
}

function renderNotificationsView() {
  return `
    <div id="notificationsView" class="p-6 animate-in slide-in-from-right-10 duration-700 h-full">
      <div class="flex justify-between items-end mb-8 px-2">
        <h2 class="text-2xl font-black italic uppercase">Updates</h2>
        <button id="markAllRead" class="text-[10px] font-bold text-indigo-600 uppercase tracking-widest hover:text-indigo-500">Alle gelesen</button>
      </div>
      <div id="notificationsList" class="space-y-3">
        ${renderNotificationsList(state.notifications)}
      </div>
    </div>
  `;
}

function renderNotificationsList(items) {
  if (!items.length) {
    return "<div class='text-center py-20 text-slate-400 font-bold text-xs uppercase'>Keine neuen Updates</div>";
  }
  return items.map((n) => `
    <div data-notif-open="${escapeHtml(n.id)}" class="flex items-center gap-4 p-4 rounded-[2rem] border transition-all relative overflow-hidden group cursor-pointer ${n.read ? "bg-white border-slate-50" : "bg-indigo-50/50 border-indigo-100"}">
      <img src="${escapeHtml(resolveNotificationAvatar(n))}" data-img-key="notif:${escapeHtml(n.id)}" class="w-12 h-12 rounded-2xl object-cover shadow-sm" />
      <div class="flex-1 min-w-0">
        <p class="text-xs font-medium text-slate-800"><span class="font-black">${escapeHtml(n.user)}</span> ${escapeHtml(n.text)}</p>
        <p class="text-[9px] text-slate-400 font-bold uppercase mt-1">${escapeHtml(n.time)}</p>
      </div>
      <div class="flex items-center gap-2">
        ${!n.read ? "<div class=\"w-2 h-2 bg-indigo-500 rounded-full\"></div>" : ""}
        <button data-notif-delete="${n.id}" class="p-2 text-slate-300 hover:text-rose-500">${icon("trash-2", "w-4 h-4")}</button>
      </div>
    </div>
  `).join("");
}

function renderSearchUserItem(user) {
  const handle = user.handle || normalizeHandle(user.name || "user");
  const displayName = sanitizeDisplayName(user.name, handle || "User");
  const avatarUrl = resolveSearchUserAvatarDisplay(user);
  const avatarRaw = user.avatarUrl || user.avatar || "";
  return `
    <button data-search-user="${escapeHtml(user.uid)}" data-search-handle="${escapeHtml(handle)}" data-search-name="${escapeHtml(displayName)}" data-search-avatar="${escapeHtml(avatarRaw)}" data-search-location="${escapeHtml(user.location)}" class="w-full flex items-center gap-4 p-4 rounded-[2rem] bg-white border border-slate-100 shadow-sm hover:shadow-md transition-all text-left">
      <img src="${escapeHtml(avatarUrl)}" data-img-key="search-user:${escapeHtml(user.uid)}" class="w-12 h-12 rounded-2xl object-cover bg-slate-200" />
      <div class="flex-1 min-w-0">
        <p data-search-user-name class="text-sm font-black text-slate-900 truncate">${escapeHtml(displayName)}</p>
        <p data-search-user-handle class="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate">@${escapeHtml(handle)}</p>
      </div>
      <span class="text-[9px] font-black text-indigo-500 uppercase tracking-widest">User</span>
    </button>
  `;
}

function renderSearchBusinessItem(biz) {
  const name = biz.name || "Business";
  const logoUrl = resolveRestaurantLogo(biz.id, biz.logo, "avatar");
  const logoAttr = biz.id ? `data-search-logo="${escapeHtml(biz.id)}"` : "";
  return `
    <button data-search-business="${escapeHtml(biz.id)}" data-search-name="${escapeHtml(name)}" class="w-full flex items-center gap-4 p-4 rounded-[2rem] bg-white border border-slate-100 shadow-sm hover:shadow-md transition-all text-left">
      <img src="${escapeHtml(logoUrl)}" ${logoAttr} data-img-key="search-biz:${escapeHtml(biz.id)}" class="w-12 h-12 rounded-2xl object-contain bg-white" />
      <div class="flex-1 min-w-0">
        <p data-search-business-name class="text-sm font-black text-slate-900 truncate">${escapeHtml(name)}</p>
        <p data-search-business-city class="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate">${escapeHtml(biz.city)}</p>
      </div>
      <span class="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Business</span>
    </button>
  `;
}

function renderSearchView() {
  const query = state.search.query;
  const queryKey = normalizeSearchKey(query);
  const filter = state.search.filter;
  const users = state.search.userResults || [];
  const businesses = state.search.businessResults?.length ? state.search.businessResults : buildLocalBusinessResults(queryKey);
  const showUsers = filter === "all" || filter === "users";
  const showBusinesses = filter === "all" || filter === "business" || filter === "local";
  const localLabel = filter === "local" || queryKey === "lokal" || queryKey === "local" ? "Lokal" : "Business";
  const hasResults = (showUsers && users.length) || (showBusinesses && businesses.length);

  return `
    <div id="searchView" class="p-6 animate-in slide-in-from-right-10 duration-700 h-full">
      <div class="mb-6 px-1">
        <p class="text-[9px] font-black text-indigo-600 uppercase tracking-widest">Entdecken</p>
        <h2 class="text-2xl font-black italic uppercase tracking-tighter">Suche</h2>
      </div>

      <div class="relative mb-5">
        <input id="searchInput" type="text" value="${escapeHtml(query)}" placeholder="Suche nach User, Name oder Lokal..." class="w-full h-14 rounded-[2rem] border border-slate-100 bg-white px-5 pr-12 text-sm font-semibold outline-none shadow-sm focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition" />
        <button id="searchClearBtn" class="absolute right-4 top-1/2 -translate-y-1/2 w-9 h-9 rounded-2xl bg-slate-50 text-slate-400 hover:text-slate-700 transition">
          ${icon("x", "w-4 h-4")}
        </button>
      </div>

      <div class="flex gap-2 mb-6">
        ${[
          { id: "all", label: "Alles" },
          { id: "users", label: "User" },
          { id: "business", label: "Business" },
          { id: "local", label: "Lokal" }
        ].map((item) => `
          <button data-search-filter="${item.id}" class="px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition ${filter === item.id ? "bg-slate-900 text-white shadow-md" : "bg-white text-slate-400 border border-slate-100"}">
            ${item.label}
          </button>
        `).join("")}
      </div>

      <div id="searchStatusLoading" class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 ${state.search.loading ? "" : "hidden"}">Suche...</div>
      <div id="searchStatusError" class="text-xs font-bold text-rose-500 mb-4 ${state.search.error ? "" : "hidden"}">${escapeHtml(state.search.error || "")}</div>
      <div id="searchEmptyState" class="text-center py-16 text-slate-300 font-black uppercase text-[10px] tracking-[0.3em] ${!hasResults && !query ? "" : "hidden"}">Tippe, um zu suchen</div>

      <div id="searchUsersSection" class="space-y-4 mb-10 ${showUsers ? "" : "hidden"}">
        <div class="flex items-center justify-between px-1">
          <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">User</p>
          <p id="searchUsersCount" class="text-[10px] font-bold text-slate-300">${users.length}</p>
        </div>
        <div id="searchUsersList" class="space-y-4">
          ${users.length ? users.map(renderSearchUserItem).join("") : (query ? `<div class="text-xs font-bold text-slate-300 px-2">Keine User gefunden.</div>` : "")}
        </div>
      </div>

      <div id="searchBizSection" class="space-y-4 ${showBusinesses ? "" : "hidden"}">
        <div class="flex items-center justify-between px-1">
          <p id="searchBizLabel" class="text-[10px] font-black text-slate-400 uppercase tracking-widest">${localLabel}</p>
          <p id="searchBizCount" class="text-[10px] font-bold text-slate-300">${businesses.length}</p>
        </div>
        <div id="searchBizList" class="space-y-4">
          ${businesses.length ? businesses.map(renderSearchBusinessItem).join("") : (query ? `<div class="text-xs font-bold text-slate-300 px-2">Keine ${localLabel} gefunden.</div>` : "")}
        </div>
      </div>
    </div>
  `;
}

function updateSearchDom() {
  const searchView = document.getElementById("searchView");
  if (!searchView) return false;

  const query = state.search.query;
  const queryKey = normalizeSearchKey(query);
  const filter = state.search.filter;
  const users = state.search.userResults || [];
  const businesses = state.search.businessResults?.length ? state.search.businessResults : buildLocalBusinessResults(queryKey);
  const showUsers = filter === "all" || filter === "users";
  const showBusinesses = filter === "all" || filter === "business" || filter === "local";
  const localLabel = filter === "local" || queryKey === "lokal" || queryKey === "local" ? "Lokal" : "Business";
  const hasResults = (showUsers && users.length) || (showBusinesses && businesses.length);

  const searchInput = document.getElementById("searchInput");
  if (searchInput && document.activeElement !== searchInput && searchInput.value !== query) {
    searchInput.value = query;
  }

  const loadingEl = document.getElementById("searchStatusLoading");
  if (loadingEl) loadingEl.classList.toggle("hidden", !state.search.loading);
  const errorEl = document.getElementById("searchStatusError");
  if (errorEl) {
    errorEl.textContent = state.search.error || "";
    errorEl.classList.toggle("hidden", !state.search.error);
  }
  const emptyEl = document.getElementById("searchEmptyState");
  if (emptyEl) emptyEl.classList.toggle("hidden", !!query || hasResults);

  const usersSection = document.getElementById("searchUsersSection");
  if (usersSection) usersSection.classList.toggle("hidden", !showUsers);
  const usersCount = document.getElementById("searchUsersCount");
  if (usersCount) usersCount.textContent = String(users.length);
  const usersList = document.getElementById("searchUsersList");
  if (usersList) {
    if (!users.length) {
      usersList.innerHTML = query
        ? `<div class="text-xs font-bold text-slate-300 px-2">Keine User gefunden.</div>`
        : "";
    } else {
      patchSearchUserList(users);
    }
  }

  const bizSection = document.getElementById("searchBizSection");
  if (bizSection) bizSection.classList.toggle("hidden", !showBusinesses);
  const bizLabel = document.getElementById("searchBizLabel");
  if (bizLabel) bizLabel.textContent = localLabel;
  const bizCount = document.getElementById("searchBizCount");
  if (bizCount) bizCount.textContent = String(businesses.length);
  const bizList = document.getElementById("searchBizList");
  if (bizList) {
    if (!businesses.length) {
      bizList.innerHTML = query
        ? `<div class="text-xs font-bold text-slate-300 px-2">Keine ${localLabel} gefunden.</div>`
        : "";
    } else {
      patchSearchBusinessList(businesses);
      businesses.forEach(updateSearchBusinessNodes);
    }
  }

  document.querySelectorAll("[data-search-filter]").forEach((btn) => {
    const isActive = btn.dataset.searchFilter === filter;
    btn.classList.toggle("bg-slate-900", isActive);
    btn.classList.toggle("text-white", isActive);
    btn.classList.toggle("shadow-md", isActive);
    btn.classList.toggle("bg-white", !isActive);
    btn.classList.toggle("text-slate-400", !isActive);
    btn.classList.toggle("border", !isActive);
    btn.classList.toggle("border-slate-100", !isActive);
  });

  if (window.lucide?.createIcons) window.lucide.createIcons();
  return true;
}

function patchSearchBusinessList(businesses) {
  const bizList = document.getElementById("searchBizList");
  if (!bizList) return false;
  const existingItems = Array.from(bizList.querySelectorAll("[data-search-business]"));
  const currentIds = existingItems.map((el) => el.dataset.searchBusiness || "");
  const nextIds = businesses.map((biz) => String(biz.id || ""));
  if (currentIds.join("|") === nextIds.join("|")) {
    return true;
  }
  const existingMap = new Map();
  existingItems.forEach((el) => existingMap.set(el.dataset.searchBusiness || "", el));
  const fragment = document.createDocumentFragment();
  businesses.forEach((biz) => {
    const id = String(biz.id || "");
    const existing = id ? existingMap.get(id) : null;
    if (existing) {
      existingMap.delete(id);
      fragment.appendChild(existing);
    } else {
      const tpl = document.createElement("template");
      tpl.innerHTML = renderSearchBusinessItem(biz);
      const node = tpl.content.firstElementChild;
      if (node) fragment.appendChild(node);
    }
  });
  bizList.replaceChildren(fragment);
  return true;
}

function refreshSearchView() {
  if (state.activeTab === "search" && lastRenderMode === "main") {
    if (updateSearchDom()) return true;
  }
  return false;
}

function patchSearchUserList(users) {
  const usersList = document.getElementById("searchUsersList");
  if (!usersList) return false;
  const existingItems = Array.from(usersList.querySelectorAll("[data-search-user]"));
  const currentIds = existingItems.map((el) => el.dataset.searchUser || "");
  const nextIds = users.map((user) => String(user.uid || ""));
  if (currentIds.join("|") === nextIds.join("|")) {
    users.forEach(updateSearchUserNodes);
    return true;
  }
  const existingMap = new Map();
  existingItems.forEach((el) => existingMap.set(el.dataset.searchUser || "", el));
  const fragment = document.createDocumentFragment();
  users.forEach((user) => {
    const id = String(user.uid || "");
    const existing = id ? existingMap.get(id) : null;
    if (existing) {
      existingMap.delete(id);
      fragment.appendChild(existing);
    } else {
      const tpl = document.createElement("template");
      tpl.innerHTML = renderSearchUserItem(user);
      const node = tpl.content.firstElementChild;
      if (node) fragment.appendChild(node);
    }
  });
  usersList.replaceChildren(fragment);
  users.forEach(updateSearchUserNodes);
  return true;
}

function renderUploadView() {
  const profile = state.userProfile;
  const previewUrl = getOptimizedImageUrl(state.upload.preview, "large");
  return `
    <div class="p-6 animate-in slide-in-from-bottom-10 duration-700 min-h-[70vh] flex flex-col">
      <header class="flex items-center justify-between mb-8">
        <button data-nav="feed" class="p-3 rounded-2xl bg-slate-100 text-slate-500">${icon("arrow-left", "w-4 h-4")}</button>
        <h2 class="text-xl font-black italic uppercase text-slate-900">Neuer Post</h2>
        <div class="w-10"></div>
      </header>
      <input type="file" id="uploadFileInput" class="hidden" accept="image/*" />
      ${state.upload.preview ? `
        <div class="space-y-6">
          <img src="${escapeHtml(previewUrl)}" class="w-full h-64 object-cover rounded-[2.5rem] shadow-lg" />
          <div class="p-5 rounded-[2rem] border bg-white border-slate-100">
            <textarea id="uploadCaption" placeholder="Bildunterschrift..." class="w-full bg-transparent text-sm font-medium outline-none resize-none" rows="2">${escapeHtml(state.upload.caption)}</textarea>
          </div>
          <button id="uploadPostBtn" class="w-full bg-indigo-600 text-white py-4 rounded-[2rem] font-black uppercase tracking-widest shadow-xl shadow-indigo-500/30">${state.upload.status || "Posten"}</button>
          <div class="text-center text-[10px] font-bold text-slate-400">${escapeHtml(state.upload.status)}</div>
        </div>
      ` : `
        <div id="uploadFileTrigger" class="flex-1 flex flex-col items-center justify-center rounded-[3rem] border-4 border-dashed p-8 text-center cursor-pointer transition-all border-slate-200 bg-white">
          <div class="w-20 h-20 bg-indigo-50 rounded-[2rem] flex items-center justify-center text-indigo-600 mb-6">${icon("upload", "w-8 h-8")}</div>
          <h3 class="text-lg font-black mb-2 italic text-slate-900">Foto waehlen</h3>
          <p class="text-sm font-medium text-slate-500">Posten als ${profile.role === "business" ? "Business (Feed)" : "User (Profil)"}</p>
        </div>
      `}
    </div>
  `;
}

function renderHeader() {
  const unread = state.notifications.filter((n) => !n.read).length;
  const badge = unread > 9 ? "9+" : String(unread || "");
  const branding = resolveHeaderBranding();
  const avatarUrl = branding.logoUrl;
  const avatarFit = logoFitClass(branding.isBusinessLogo);
  const isBusinessHeader = isLocalBusinessProfile();
  const titleClass = isBusinessHeader
    ? "text-2xl font-elegant font-semibold tracking-wide leading-none text-slate-900 max-w-[220px] mx-auto truncate"
    : "text-2xl font-black italic tracking-tighter leading-none text-slate-900 max-w-[220px] mx-auto truncate";
  const subtitleClass = `text-[9px] font-black text-indigo-600 uppercase tracking-[0.4em] block${branding.subtitle ? "" : " hidden"}`;
  return `
    <header class="p-6 pb-2 flex justify-between items-center sticky top-0 z-40 backdrop-blur-xl bg-slate-50/80">
      <button id="drawerToggle" class="w-14 h-14 rounded-3xl shadow-xl flex flex-col gap-1.5 items-start justify-center p-4 active:scale-95 transition-all bg-white border border-slate-50 shadow-slate-200/30 relative">
        <div class="w-6 h-0.5 rounded-full bg-slate-900"></div>
        <div class="w-4 h-0.5 rounded-full bg-slate-900"></div>
        <div class="w-5 h-0.5 rounded-full bg-slate-900"></div>
        ${unread ? `<span data-unread-badge="header" class="absolute -top-1 -right-1 min-w-[20px] h-5 px-1.5 rounded-full bg-rose-500 text-white text-[10px] font-black flex items-center justify-center shadow-lg">${badge}</span>` : ""}
      </button>
      <div class="text-center cursor-pointer" data-nav="feed">
        <h1 id="headerTitle" class="${titleClass}">${escapeHtml(branding.title)}</h1>
        <span id="headerSubtitle" class="${subtitleClass}">${escapeHtml(branding.subtitle)}</span>
      </div>
      <button data-nav="profile" class="w-14 h-14 rounded-3xl shadow-xl overflow-hidden p-1 active:scale-95 transition-transform bg-white border border-slate-50 shadow-slate-200/30">
        <img id="headerAvatar" data-img-key="avatar:header" src="${escapeHtml(avatarUrl)}" class="w-full h-full rounded-[1.4rem] ${avatarFit}" />
      </button>
    </header>
  `;
}

function shouldShowBusinessTopTabs() {
  return isLocalBusinessProfile() && !state.profileView;
}

function renderBusinessTopTabs() {
  if (!shouldShowBusinessTopTabs()) return "";
  const menuUrl = buildUrl("apps/menyra-restaurants/guest/karte/index.html", {
    r: state.userProfile.restaurantId
  });
  const base = "flex-1 py-3 rounded-[1.5rem] text-[11px] font-bold uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2";
  const isFeedActive = state.activeTab === "feed";
  return `
    <div class="px-6 pb-4">
      <div class="bg-white/60 p-1.5 rounded-[2rem] border border-white/50 shadow-sm flex items-center gap-1 backdrop-blur-sm">
        <button type="button" data-nav="feed" class="${base} ${isFeedActive ? "bg-white text-slate-900 shadow-[0_4px_12px_-2px_rgba(0,0,0,0.08),0_2px_6px_-1px_rgba(0,0,0,0.04)] scale-[1.02]" : "text-slate-400 hover:text-slate-600"}">
          Social
        </button>
        <a href="${escapeHtml(menuUrl)}" class="${base} text-slate-400 hover:text-slate-600">
          Karten
        </a>
        <button type="button" disabled class="${base} text-slate-300 cursor-not-allowed">
          Reviews
        </button>
      </div>
    </div>
  `;
}

function renderMain() {
  let view = "";
  if (state.activeTab === "feed") view = renderFeedView();
  if (state.activeTab === "search") view = renderSearchView();
  if (state.activeTab === "map") view = renderMapView();
  if (state.activeTab === "profile") view = state.profileView ? renderPublicProfileView() : renderProfileView();
  if (state.activeTab === "settings") view = renderSettingsView();
  if (state.activeTab === "notifications") view = renderNotificationsView();
  if (state.activeTab === "upload") view = renderUploadView();

  return `
    <div class="min-h-screen bg-slate-50 text-slate-900 max-w-md mx-auto shadow-2xl relative flex flex-col overflow-hidden font-sans transition-colors duration-500">
      ${renderDrawer()}
      ${renderHeader()}
      ${renderBusinessTopTabs()}
      <main class="flex-1 overflow-y-auto no-scrollbar pb-24">${view}</main>
    </div>
  `;
}

function ensureOverlayRoot() {
  let root = document.getElementById("overlayRoot");
  if (!root) {
    root = document.createElement("div");
    root.id = "overlayRoot";
    document.body.appendChild(root);
  }
  if (!document.getElementById("profileOverlayRoot")) {
    const profileRoot = document.createElement("div");
    profileRoot.id = "profileOverlayRoot";
    root.appendChild(profileRoot);
  }
  if (!document.getElementById("postOverlayRoot")) {
    const postRoot = document.createElement("div");
    postRoot.id = "postOverlayRoot";
    root.appendChild(postRoot);
  }
  if (!document.getElementById("likesOverlayRoot")) {
    const likesRoot = document.createElement("div");
    likesRoot.id = "likesOverlayRoot";
    root.appendChild(likesRoot);
  }
  return root;
}

function renderOverlays(options = {}) {
  const updateProfile = Object.prototype.hasOwnProperty.call(options, "updateProfile")
    ? options.updateProfile
    : !state.likesModal.open;
  const updatePost = Object.prototype.hasOwnProperty.call(options, "updatePost")
    ? options.updatePost
    : !state.likesModal.open;
  const updateLikes = Object.prototype.hasOwnProperty.call(options, "updateLikes")
    ? options.updateLikes
    : !state.likesModal.open;
  const root = ensureOverlayRoot();
  const profileRoot = document.getElementById("profileOverlayRoot");
  const postRoot = document.getElementById("postOverlayRoot");
  const likesRoot = document.getElementById("likesOverlayRoot");
  let profileChanged = false;
  let postChanged = false;
  let likesChanged = false;

  if (updateProfile) {
    const profileHtml = renderProfileModal();
    profileChanged = profileHtml !== overlayCache.profile;
    if (profileRoot && profileChanged) {
      profileRoot.innerHTML = profileHtml;
      overlayCache.profile = profileHtml;
    }
  }
  if (updatePost) {
    const postHtml = renderPostModal();
    postChanged = postHtml !== overlayCache.post;
    if (postRoot && postChanged) {
      postRoot.innerHTML = postHtml;
      overlayCache.post = postHtml;
    }
  }
  if (updateLikes) {
    const likesHtml = renderLikesModal();
    likesChanged = likesHtml !== overlayCache.likes;
    if (likesRoot && likesChanged) {
      likesRoot.innerHTML = likesHtml;
      overlayCache.likes = likesHtml;
    }
  }
  const open = !!(state.profileModal.open || state.postModal.open || state.likesModal.open);
  document.documentElement.classList.toggle("modal-open", open);
  document.body.classList.toggle("modal-open", open);
  if (open && !bodyScrollLocked) {
    bodyScrollTop = window.scrollY || document.documentElement.scrollTop || document.body.scrollTop || 0;
    document.body.style.position = "fixed";
    document.body.style.top = `-${bodyScrollTop}px`;
    document.body.style.left = "0";
    document.body.style.right = "0";
    document.body.style.width = "100%";
    bodyScrollLocked = true;
  } else if (!open && bodyScrollLocked) {
    document.body.style.position = "";
    document.body.style.top = "";
    document.body.style.left = "";
    document.body.style.right = "";
    document.body.style.width = "";
    window.scrollTo(0, bodyScrollTop);
    bodyScrollLocked = false;
  }
  if (window.lucide?.createIcons && (profileChanged || postChanged || likesChanged)) {
    window.lucide.createIcons();
  }
  bindOverlayEvents({ profileChanged, postChanged, likesChanged });
}

function renderLoading() {
  return `
    <div class="min-h-screen flex items-center justify-center text-slate-400 text-sm font-bold">
      Lade MENYRA Social...
    </div>
  `;
}

function getImageKey(img) {
  if (!img) return "";
  const direct = img.dataset.imgKey;
  if (direct) return direct;
  if (img.id) return `id:${img.id}`;
  if (img.dataset.feedLogo) return `feed-logo:${img.dataset.feedLogo}`;
  if (img.dataset.storyLogo) return `story-logo:${img.dataset.storyLogo}`;
  if (img.dataset.searchLogo) return `search-logo:${img.dataset.searchLogo}`;
  const feed = img.closest("[data-feed-id]");
  if (feed?.dataset.feedId) return `feed-image:${feed.dataset.feedId}`;
  const profilePost = img.closest("[data-open-post]");
  if (profilePost?.dataset.openPost) return `profile-post:${profilePost.dataset.openPost}`;
  const searchUser = img.closest("[data-search-user]");
  if (searchUser?.dataset.searchUser) return `search-user:${searchUser.dataset.searchUser}`;
  const searchBiz = img.closest("[data-search-business]");
  if (searchBiz?.dataset.searchBusiness) return `search-biz:${searchBiz.dataset.searchBusiness}`;
  const comment = img.closest("[data-comment-id]");
  if (comment?.dataset.commentId) return `comment-avatar:${comment.dataset.commentId}`;
  const notif = img.closest("[data-notif-open]");
  if (notif?.dataset.notifOpen) return `notif-avatar:${notif.dataset.notifOpen}`;
  return "";
}

function cacheCurrentImages(root = appEl) {
  const cache = { byKey: new Map(), bySrc: new Map() };
  if (!root) return cache;
  root.querySelectorAll("img").forEach((img) => {
    if (!(img instanceof HTMLImageElement)) return;
    const src = img.currentSrc || img.getAttribute("src") || "";
    if (!src || isPlaceholderUrl(src)) return;
    const key = getImageKey(img);
    if (key) {
      const list = cache.byKey.get(key);
      if (list) list.push(img);
      else cache.byKey.set(key, [img]);
    }
    const bySrc = cache.bySrc.get(src);
    if (bySrc) bySrc.push(img);
    else cache.bySrc.set(src, [img]);
  });
  return cache;
}

function syncImageAttributes(target, source, { preserveSource = true } = {}) {
  if (!target || !source) return;
  target.className = source.className;
  target.style.cssText = source.style.cssText || "";
  target.width = source.width;
  target.height = source.height;
  if (source.alt) {
    target.alt = source.alt;
  } else {
    target.removeAttribute("alt");
  }
  if (source.loading) {
    target.loading = source.loading;
  } else {
    target.removeAttribute("loading");
  }
  if (source.decoding) {
    target.decoding = source.decoding;
  } else {
    target.removeAttribute("decoding");
  }
  const fetchPriority = source.getAttribute("fetchpriority");
  if (fetchPriority) {
    target.setAttribute("fetchpriority", fetchPriority);
  } else {
    target.removeAttribute("fetchpriority");
  }
  if (source.referrerPolicy) {
    target.referrerPolicy = source.referrerPolicy;
  } else {
    target.removeAttribute("referrerpolicy");
  }
  if (!preserveSource) {
    if (source.sizes) {
      target.sizes = source.sizes;
    } else {
      target.removeAttribute("sizes");
    }
    if (source.srcset) {
      target.srcset = source.srcset;
    } else {
      target.removeAttribute("srcset");
    }
  }
  Object.keys(target.dataset).forEach((key) => {
    if (!(key in source.dataset)) delete target.dataset[key];
  });
  Object.keys(source.dataset).forEach((key) => {
    target.dataset[key] = source.dataset[key];
  });
}

function queueImageSwap(target, source) {
  if (!target || !source) return;
  const nextSrc = source.currentSrc || source.getAttribute("src") || "";
  if (!nextSrc || isPlaceholderUrl(nextSrc)) return;
  if (target.dataset.pendingSrc === nextSrc) return;
  target.dataset.pendingSrc = nextSrc;
  const loader = new Image();
  const nextSrcset = source.getAttribute("srcset") || "";
  const nextSizes = source.getAttribute("sizes") || "";
  if (nextSrcset) loader.srcset = nextSrcset;
  if (nextSizes) loader.sizes = nextSizes;
  loader.decoding = "async";
  loader.onload = () => {
    if (target.dataset.pendingSrc !== nextSrc) return;
    target.src = nextSrc;
    if (nextSrcset) {
      target.srcset = nextSrcset;
    } else {
      target.removeAttribute("srcset");
    }
    if (nextSizes) {
      target.sizes = nextSizes;
    } else {
      target.removeAttribute("sizes");
    }
    delete target.dataset.pendingSrc;
  };
  loader.onerror = () => {
    if (target.dataset.pendingSrc === nextSrc) {
      delete target.dataset.pendingSrc;
    }
  };
  loader.src = nextSrc;
}

function rehydrateImages() {
  return;
}

function render() {
  if (renderSuspended > 0) {
    renderQueued = true;
    return;
  }
  document.body.classList.toggle("fast-mode", FAST_MODE);
  let nextHtml = "";
  let mode = "";
  if (!state.sessionReady) {
    nextHtml = renderLoading();
    mode = "loading";
  } else if (!state.user) {
    nextHtml = renderAuthScreen();
    mode = "auth";
  } else {
    nextHtml = renderMain();
    mode = "main";
  }
  const changed = nextHtml !== lastAppHtml || mode !== lastRenderMode;
  if (changed) {
    const reuseFeed = mode === "main" && lastRenderMode === "main" && state.activeTab === "feed"
      ? document.getElementById("feedView")
      : null;
    const prevScrollTop = reuseFeed ? document.querySelector("main")?.scrollTop ?? 0 : 0;
    appEl.innerHTML = nextHtml;
    lastAppHtml = nextHtml;
    lastRenderMode = mode;
    if (mode === "auth") {
      bindAuthEvents();
    } else if (mode === "main") {
      bindAppEvents();
      bindFeedDelegation();
    }
    if (reuseFeed) {
      const nextFeed = document.getElementById("feedView");
      if (nextFeed && reuseFeed !== nextFeed) {
        nextFeed.replaceWith(reuseFeed);
      }
      const nextMain = document.querySelector("main");
      if (nextMain) nextMain.scrollTop = prevScrollTop;
      updateFeedDom();
    }
    if (window.lucide?.createIcons) window.lucide.createIcons();
    if (state.activeTab === "search" && state.search.keepFocus) {
      state.search.keepFocus = false;
      focusSearchInput();
    }
  }

  renderOverlays();

  if (state.user && state.activeTab === "map") {
    window.setTimeout(() => {
      initLeafletIfNeeded();
      updateMapSheet();
    }, 0);
  } else {
    cleanupLeaflet();
  }
}

function bindAuthEvents() {
  const authForm = document.getElementById("authForm");
  const toggleBtn = document.getElementById("authToggle");
  const roleButtons = Array.from(document.querySelectorAll("[data-auth-role]"));

  if (toggleBtn) {
    toggleBtn.addEventListener("click", () => {
      state.auth.mode = state.auth.mode === "login" ? "register" : "login";
      state.auth.error = "";
      render();
    });
  }

  roleButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      state.auth.role = btn.dataset.authRole || "user";
      render();
    });
  });

  if (authForm) {
    authForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const email = document.getElementById("authEmail")?.value?.trim() || "";
      const password = document.getElementById("authPassword")?.value || "";
      const name = document.getElementById("authName")?.value?.trim() || "";

      state.auth.loading = true;
      state.auth.error = "";
      render();

      try {
        if (state.auth.mode === "login") {
          const admin = resolveAdminLogin(email, password);
          const cred = admin ? await signInOrCreateAdmin(admin) : await signInWithEmailAndPassword(auth, email, password);
          await ensureUserProfile(cred.user, admin?.profile || {});
        } else {
          if (!name || !email || !password) {
            throw new Error("Bitte alles ausfuellen.");
          }
          const cred = await createUserWithEmailAndPassword(auth, email, password);
          await updateProfile(cred.user, { displayName: name });
          await setDoc(doc(db, "users", cred.user.uid), {
            displayName: name,
            handle: normalizeHandle(name),
            city: "Prishtina",
            email,
            role: state.auth.role,
            bio: "",
            score: 0,
            followersCount: 0,
            followingCount: 0,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          }, { merge: true });
        }
      } catch (err) {
        state.auth.error = err?.message || "Login fehlgeschlagen.";
      } finally {
        state.auth.loading = false;
        render();
      }
    });
  }
}

function bindOverlayEvents({ profileChanged = true, postChanged = true, likesChanged = true } = {}) {
  if (profileChanged) {
    const profileModalOverlay = document.getElementById("profileModalOverlay");
    const profileModalClose = document.getElementById("profileModalClose");
    const profileFollowBtn = document.getElementById("profileFollowBtn");
    const profileOpenBtn = document.getElementById("profileOpenBtn");
    const closeProfileModal = () => {
      state.profileModal = { open: false, profile: null };
      renderOverlays();
    };

    if (profileModalOverlay) profileModalOverlay.addEventListener("click", closeProfileModal);
    if (profileModalClose) profileModalClose.addEventListener("click", closeProfileModal);
    if (profileFollowBtn) {
      profileFollowBtn.addEventListener("click", () => {
        const handle = profileFollowBtn.dataset.handle;
        if (!handle) return;
        toggleFollow(handle, {
          type: profileFollowBtn.dataset.targetType || "",
          id: profileFollowBtn.dataset.targetId || "",
          name: profileFollowBtn.dataset.targetName || "",
          avatar: profileFollowBtn.dataset.targetAvatar || ""
        });
      });
    }
    if (profileOpenBtn) {
      profileOpenBtn.addEventListener("click", () => {
        if (!state.profileModal.profile) return;
        state.profileView = {
          profile: state.profileModal.profile,
          posts: state.profileModal.profile.posts || []
        };
        state.profileModal = { open: false, profile: null };
        state.activeTab = "profile";
        render();
      });
    }
  }

  if (postChanged) {
    const postModalOverlay = document.getElementById("postModalOverlay");
    const postModalClose = document.getElementById("postModalClose");
    if (postModalOverlay) postModalOverlay.addEventListener("click", closePostModal);
    if (postModalClose) postModalClose.addEventListener("click", closePostModal);

    const postLikeBtn = document.getElementById("postLikeBtn");
    if (postLikeBtn) {
      postLikeBtn.addEventListener("click", () => {
        const postId = postLikeBtn.dataset.postId;
        if (postId) togglePostLike(postId);
      });
    }

    const postLikesBtn = document.getElementById("postLikesBtn");
    if (postLikesBtn) {
      postLikesBtn.addEventListener("click", () => {
        const postId = postLikesBtn.dataset.postId;
        if (!postId) return;
        state.likesModal = { open: true, postId, animate: false };
        renderOverlays({ updateProfile: false, updatePost: false, updateLikes: true });
      });
    }

    const postReplyCancel = document.getElementById("postReplyCancel");
    if (postReplyCancel) {
      postReplyCancel.addEventListener("click", () => {
        state.postModal.replyTo = null;
        renderOverlays();
      });
    }

    const postCommentSend = document.getElementById("postCommentSend");
    if (postCommentSend) {
      postCommentSend.addEventListener("click", () => {
        const postId = postCommentSend.dataset.postId;
        if (!postId) return;
        const inputEl = document.getElementById("postCommentInput");
        const text = inputEl ? inputEl.value : state.postModal.commentText;
        if (!String(text || "").trim() || state.postModal.sending) return;
        state.postModal.commentText = text;
        addComment(postId, text, state.postModal.replyTo);
      });
    }

    document.querySelectorAll("[data-comment-reply]").forEach((btn) => {
      btn.addEventListener("click", () => {
        state.postModal.replyTo = btn.dataset.commentId || null;
        renderOverlays();
      });
    });

    document.querySelectorAll("[data-comment-like]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const postId = btn.dataset.postId;
        const commentId = btn.dataset.commentId;
        const replyId = btn.dataset.replyId || "";
        if (!postId || !commentId) return;
        toggleCommentLike(postId, commentId, replyId || null);
      });
    });

    const postCommentInput = document.getElementById("postCommentInput");
    if (postCommentInput) {
      postCommentInput.addEventListener("input", () => {
        state.postModal.commentText = postCommentInput.value;
      });
    }
  }

  if (likesChanged) {
    const likesModalOverlay = document.getElementById("likesModalOverlay");
    const likesModalClose = document.getElementById("likesModalClose");
    const closeLikes = () => {
      state.likesModal = { open: false, postId: "", animate: false };
      renderOverlays({ updateLikes: true });
    };
    if (likesModalOverlay) likesModalOverlay.addEventListener("click", closeLikes);
    if (likesModalClose) likesModalClose.addEventListener("click", closeLikes);
  }
}

function bindAppEvents() {
  const drawerToggle = document.getElementById("drawerToggle");
  const drawerOverlay = document.getElementById("drawerOverlay");
  const drawerClose = document.getElementById("drawerClose");
  const logoutBtn = document.getElementById("logoutBtn");
  const settingsLogout = document.getElementById("settingsLogout");

  if (drawerToggle) drawerToggle.addEventListener("click", () => setState({ drawerOpen: true }));
  if (drawerOverlay) drawerOverlay.addEventListener("click", () => setState({ drawerOpen: false }));
  if (drawerClose) drawerClose.addEventListener("click", () => setState({ drawerOpen: false }));

  [logoutBtn, settingsLogout].forEach((btn) => {
    if (btn) {
      btn.addEventListener("click", async () => {
        await signOut(auth);
        if (state.user?.uid) {
          safeStorage.removeItem(profileKey(state.user.uid));
          safeStorage.removeItem(avatarKey(state.user.uid));
          safeStorage.removeItem(notificationsKey(state.user.uid));
          safeStorage.removeItem(followingKey(state.user.uid));
        }
        safeStorage.removeItem(STORAGE_KEYS.postMeta);
        resetUserScopedState();
        cleanupLeaflet();
        setState({ activeTab: "feed", drawerOpen: false });
      });
    }
  });

  document.querySelectorAll("[data-nav]").forEach((btn) => {
    if (btn.closest("#feedView")) return;
    btn.addEventListener("click", () => {
      const tab = btn.dataset.nav;
      if (!tab) return;
      setState({
        activeTab: tab,
        drawerOpen: false,
        settingsView: "main",
        selectedBusiness: null,
        profileView: null,
        profileModal: { open: false, profile: null },
        postModal: { open: false, post: null, commentText: "", replyTo: null, loading: false, animate: false, sending: false },
        likesModal: { open: false, postId: "", animate: false }
      });
    });
  });

  document.querySelectorAll("[data-profile-tab]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const tab = btn.dataset.profileTab;
      if (!tab) return;
      state.profileContentTab = tab;
      render();
    });
  });

  document.querySelectorAll("[data-profile-view]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const mode = btn.dataset.profileView;
      if (!mode) return;
      state.profileViewMode = mode;
      render();
    });
  });

  document.querySelectorAll("[data-profile-menu-button]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const postId = btn.dataset.profileMenuButton;
      if (!postId) return;
      toggleProfilePostMenu(postId);
    });
  });

  document.querySelectorAll("[data-profile-post-toggle]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const postId = btn.dataset.profilePostToggle;
      if (!postId) return;
      toggleProfilePostWidth(postId);
    });
  });

  document.querySelectorAll("[data-profile-post-delete]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const postId = btn.dataset.profilePostDelete;
      if (!postId) return;
      deleteProfilePost(postId);
    });
  });

  if (!profileMenuBound) {
    document.addEventListener("click", (e) => {
      if (!state.profilePostMenuId) return;
      const target = e.target;
      if (!(target instanceof Element)) return;
      if (target.closest("[data-profile-menu]") || target.closest("[data-profile-menu-button]")) return;
      state.profilePostMenuId = null;
      setProfileMenuOpen(null);
    });
    profileMenuBound = true;
  }

  if (state.profilePostMenuId) {
    setProfileMenuOpen(state.profilePostMenuId);
  }

  const mapLocateBtn = document.getElementById("mapLocateBtn");
  if (mapLocateBtn) {
    mapLocateBtn.addEventListener("click", () => mapLocate());
  }

  bindNotificationsDelegation();

  document.querySelectorAll("[data-settings]").forEach((btn) => {
    btn.addEventListener("click", () => {
      setState({ settingsView: btn.dataset.settings });
    });
  });

  document.querySelectorAll("[data-settings-back]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      if (state.settingsView === "account") {
        await saveAccountSettings();
      }
      setState({ settingsView: "main" });
    });
  });

  document.querySelectorAll("[data-toggle]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const key = btn.dataset.toggle;
      if (!key) return;
      const next = { ...state.settings, [key]: !state.settings[key] };
      state.settings = next;
      saveSettings(next);
      render();
    });
  });

  const profileAvatarTrigger = document.getElementById("profileAvatarTrigger");
  const profileAvatarInput = document.getElementById("profileAvatarInput");
  if (profileAvatarTrigger && profileAvatarInput) {
    profileAvatarTrigger.addEventListener("click", () => profileAvatarInput.click());
    profileAvatarInput.addEventListener("change", async (e) => {
      const file = e.target.files?.[0];
      if (file) {
        await uploadAvatar(file);
      }
    });
  }

  const settingsAvatarTrigger = document.getElementById("settingsAvatarTrigger");
  const settingsAvatarInput = document.getElementById("settingsAvatarInput");
  if (settingsAvatarTrigger && settingsAvatarInput) {
    settingsAvatarTrigger.addEventListener("click", () => settingsAvatarInput.click());
    settingsAvatarInput.addEventListener("change", async (e) => {
      const file = e.target.files?.[0];
      if (file) {
        await uploadAvatar(file);
      }
    });
  }

  document.querySelectorAll("[data-profile-business]").forEach((btn) => {
    if (btn.closest("#feedView")) return;
    btn.addEventListener("click", () => {
      openProfileViewFromBusiness({
        id: btn.dataset.profileId || "",
        name: btn.dataset.profileBusiness || ""
      }, { showBack: false });
    });
  });

  document.querySelectorAll("[data-open-post]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const target = e.target;
      if (target instanceof Element) {
        if (target.closest("[data-profile-menu]") || target.closest("[data-profile-menu-button]")) return;
      }
      const postId = btn.dataset.openPost;
      const post = findPostById(postId);
      if (post) openPostModal(post);
    });
  });

  document.querySelectorAll("[data-public-profile-back]").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.profileView = null;
      const backTab = state.profileBackTab || "feed";
      state.profileBackTab = "feed";
      if (profileViewUnsub) {
        profileViewUnsub();
        profileViewUnsub = null;
      }
      setState({ activeTab: backTab, drawerOpen: false });
    });
  });

  document.querySelectorAll("[data-public-profile-follow]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const handle = btn.dataset.publicProfileFollow;
      if (!handle) return;
      toggleFollow(handle, {
        type: btn.dataset.targetType || "",
        id: btn.dataset.targetId || "",
        name: btn.dataset.targetName || "",
        avatar: btn.dataset.targetAvatar || ""
      });
    });
  });

  const uploadFileInput = document.getElementById("uploadFileInput");
  const uploadTrigger = document.getElementById("uploadFileTrigger");
  if (uploadTrigger && uploadFileInput) {
    uploadTrigger.addEventListener("click", () => uploadFileInput.click());
  }
  if (uploadFileInput) {
    uploadFileInput.addEventListener("change", (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onloadend = () => {
        state.upload.preview = reader.result;
        state.upload.file = file;
        state.upload.status = "";
        render();
      };
      reader.readAsDataURL(file);
    });
  }

  const uploadPostBtn = document.getElementById("uploadPostBtn");
  if (uploadPostBtn) {
    uploadPostBtn.addEventListener("click", async () => {
      await handleUploadPost();
    });
  }

  const uploadCaption = document.getElementById("uploadCaption");
  if (uploadCaption) {
    uploadCaption.addEventListener("input", () => {
      state.upload.caption = uploadCaption.value;
    });
  }

  const settingsRestaurant = document.getElementById("settingsRestaurant");
  if (settingsRestaurant) {
    settingsRestaurant.addEventListener("change", async () => {
      await updateRestaurantSelection(settingsRestaurant.value);
    });
  }

  bindSearchEvents();
}

function bindSearchEvents() {
  const searchView = document.getElementById("searchView");
  if (!searchView || searchView.dataset.bound === "true") return;

  searchView.addEventListener("input", (e) => {
    const target = e.target;
    if (target instanceof HTMLInputElement && target.id === "searchInput") {
      handleSearchInput(target.value);
    }
  });

  searchView.addEventListener("keydown", (e) => {
    const target = e.target;
    if (target instanceof HTMLInputElement && target.id === "searchInput" && e.key === "Enter") {
      e.preventDefault();
    }
  });

  searchView.addEventListener("click", (e) => {
    const target = e.target;
    if (!(target instanceof Element)) return;

    const clearBtn = target.closest("#searchClearBtn");
    if (clearBtn) {
      state.search.query = "";
      state.search.userResults = [];
      state.search.businessResults = buildLocalBusinessResults("");
      state.search.loading = false;
      state.search.error = "";
      state.search.keepFocus = true;
      if (!refreshSearchView()) render();
      focusSearchInput();
      return;
    }

    const filterBtn = target.closest("[data-search-filter]");
    if (filterBtn) {
      const filter = filterBtn.dataset.searchFilter || "all";
      state.search.filter = filter;
      if (!refreshSearchView()) render();
      return;
    }

    const userBtn = target.closest("[data-search-user]");
    if (userBtn) {
      openProfileFromUser({
        uid: userBtn.dataset.searchUser || "",
        handle: userBtn.dataset.searchHandle || "",
        name: userBtn.dataset.searchName || "",
        avatar: userBtn.dataset.searchAvatar || "",
        location: userBtn.dataset.searchLocation || ""
      });
      return;
    }

    const bizBtn = target.closest("[data-search-business]");
    if (bizBtn) {
      openProfileViewFromBusiness({
        id: bizBtn.dataset.searchBusiness || "",
        name: bizBtn.dataset.searchName || ""
      }, { showBack: false });
    }
  });

  searchView.dataset.bound = "true";
}

async function uploadCompressedImage(file, ownerId, { maxSize, quality, mimeType }) {
  const maxBytes = 15 * 1024 * 1024;
  if (file.size > maxBytes) throw new Error("Max 15MB pro Bild.");
  if (!String(file.type || "").startsWith("image/")) throw new Error("Nur Bilder erlaubt.");

  const compressedFile = await compressImage(file, maxSize, quality, mimeType);

  const form = new FormData();
  form.append("file", compressedFile, compressedFile.name || "image.jpg");
  form.append("restaurantId", ownerId || "");

  const res = await fetch(`${BUNNY_EDGE_BASE}/image/upload`, {
    method: "POST",
    body: form
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data?.url) throw new Error(data?.error || "Upload fehlgeschlagen.");
  return {url: String(data.url), cdnUrl: String(data.cdnUrl) };
}

async function uploadAvatar(file) {
  if (!state.user) return;
  try {
    const { cdnUrl } = await uploadCompressedImage(file, state.user.uid, { maxSize: 512, quality: 0.80, mimeType: 'image/jpeg'});
    await setDoc(doc(db, "users", state.user.uid), {
      avatarUrl: cdnUrl,
      updatedAt: serverTimestamp()
    }, { merge: true });
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
  if (!state.user) return;
  const name = document.getElementById("settingsName")?.value?.trim() || state.userProfile.name || "User";
  const handle = document.getElementById("settingsHandle")?.value?.trim() || state.userProfile.handle || normalizeHandle(name);
  const bio = document.getElementById("settingsBio")?.value?.trim() || "";
  const city = document.getElementById("settingsCity")?.value?.trim() || "Prishtina";
  const restaurantId = document.getElementById("settingsRestaurant")?.value || state.userProfile.restaurantId || "";

  const payload = {
    displayName: name,
    handle,
    bio,
    city,
    restaurantId,
    updatedAt: serverTimestamp()
  };

  try {
    await setDoc(doc(db, "users", state.user.uid), payload, { merge: true });
    await updateProfile(state.user, { displayName: name });
    state.userProfile = {
      ...state.userProfile,
      name,
      handle,
      bio,
      location: city,
      restaurantId
    };
    saveUserProfileToStorage();
  } catch (err) {
    console.error(err);
  }
}

async function updateRestaurantSelection(restaurantId) {
  if (!state.user) return;
  state.userProfile.restaurantId = restaurantId || "";
  state.roleSwitchRestaurantId = restaurantId || state.roleSwitchRestaurantId || "";
  saveUserProfileToStorage();
  render();
  try {
    await setDoc(doc(db, "users", state.user.uid), {
      restaurantId: restaurantId || "",
      updatedAt: serverTimestamp()
    }, { merge: true });
    await loadBusinessPosts();
  } catch (err) {
    console.error(err);
  }
}

async function handleUploadPost() {
  if (!state.user || !state.upload.file) return;

  const caption = document.getElementById("uploadCaption")?.value?.trim() || "";
  const isBusiness = state.userProfile.role === "business";
  const restaurantId = state.userProfile.restaurantId || document.getElementById("uploadRestaurantSelect")?.value || "";

  if (isBusiness && !restaurantId) {
    state.upload.status = "Bitte Business im Account waehlen.";
    render();
    return;
  }

  try {
    state.upload.status = "Upload startet.";
    render();

    const ownerId = isBusiness ? restaurantId : state.user.uid;
    const { cdnUrl } = await uploadCompressedImage(state.upload.file, ownerId, {maxSize: 1080, quality: 0.78, mimeType: 'image/jpeg'});

    if (isBusiness) {
      await createBusinessPost({
        restaurantId,
        caption,
        mediaUrl: cdnUrl,
        mediaType: "image"
      });
      await loadFeedPosts({ force: true });
      await loadBusinessPosts({ force: true });
    } else {
      await createUserPost({
        uid: state.user.uid,
        caption,
        url: cdnUrl
      });
      await loadUserPosts({ force: true });
    }

    state.upload = { preview: "", caption: "", file: null, status: "" };
    setState({ activeTab: isBusiness ? "feed" : "profile" });
  } catch (err) {
    console.error(err);
    state.upload.status = err?.message || "Upload fehlgeschlagen.";
    render();
  }
}

async function createBusinessPost({ restaurantId, caption, mediaUrl, mediaType }) {
  const base = state.restaurants.find((r) => r.id === restaurantId) || {};
  const postRef = doc(collection(db, "restaurants", restaurantId, "socialPosts"));
  const postId = postRef.id;

  const payload = {
    postType: "food",
    caption,
    media: [{
      url: mediaUrl,
      type: mediaType,
      thumbUrl: mediaType === "image" ? mediaUrl : ""
    }],
    city: base.city || "Prishtina",
    createdAt: serverTimestamp(),
    createdByUid: state.user?.uid || "",
    likesCount: 0,
    commentsCount: 0,
    status: "active"
  };

  const feedPayload = {
    rid: restaurantId,
    postType: payload.postType,
    city: payload.city,
    createdAt: serverTimestamp(),
    captionShort: caption.slice(0, 90),
    thumbUrl: mediaType === "image" ? mediaUrl : "",
    mediaType,
    likesCount: 0,
    commentsCount: 0,
    status: "active",
    businessName: base.name || base.restaurantName || ""
  };

  await setDoc(postRef, payload);
  await setDoc(doc(db, "socialFeed", postId), feedPayload, { merge: true });
}

async function createUserPost({ uid, caption, url }) {
  const postRef = doc(collection(db, "users", uid, "posts"));
  await setDoc(postRef, {
    url,
    caption,
    type: "square",
    likesCount: 0,
    commentsCount: 0,
    createdAt: serverTimestamp()
  });
}

async function loadUserProfile(user, { force = false } = {}) {
  if (!user) return;
  await ensureUserProfile(user, { city: "Prishtina" });
  const snap = await getDoc(doc(db, "users", user.uid));
  const data = snap.exists() ? snap.data() : {};
  const prevAvatar = state.userProfile?.avatar || "";
  const normalized = normalizeProfile(data, user);
  const normalizedResolved = getOptimizedImageUrl(normalized.avatar || "", "avatar");
  if ((!normalized.avatar || isPlaceholderUrl(normalizedResolved)) && prevAvatar) normalized.avatar = prevAvatar;
  state.userProfile = normalized;
  state.userProfile.uid = user.uid;
  saveUserProfileToStorage();
  const resolvedAvatar = getOptimizedImageUrl(state.userProfile.avatar || "", "avatar");
  if (!isPlaceholderUrl(resolvedAvatar)) {
    userAvatarCache = resolvedAvatar;
    scheduleAvatarCacheWrite(resolvedAvatar);
    if (state.user?.uid) {
      commentAvatarCache.set(state.user.uid, resolvedAvatar);
      updateCommentAvatarNodesByUid(state.user.uid, resolvedAvatar);
    }
    const handleKey = normalizeHandle(state.userProfile.handle || state.userProfile.name || "");
    if (handleKey) {
      commentAvatarCache.set(handleKey, resolvedAvatar);
      updateCommentAvatarNodes(handleKey, resolvedAvatar);
    }
  }
  if (lastRenderMode === "main") {
    updateShellDom();
    if (state.activeTab === "search" && refreshSearchView()) return;
    if (state.activeTab === "feed") return;
  }
  render();
}

async function loadRestaurants({ force = false } = {}) {
  const cached = readCache(CACHE_KEYS.restaurants, CACHE_TTL_MS.restaurants);
  if (cached?.data?.length) {
    if (!state.restaurants.length) {
      state.restaurants = await enrichRestaurantsWithPublicMeta(cached.data);
      rebuildBusinessLocations();
      if (lastRenderMode === "main") updateShellDom();
      syncFeedPostLogos();
      refreshFeedStories({ force: true });
      cleanupLeaflet();
      const inMain = lastRenderMode === "main";
      const updatedFeed = state.activeTab === "feed" && inMain && updateFeedDom();
      const updatedSearch = state.activeTab === "search" && inMain && refreshSearchView();
      if (!updatedFeed && !updatedSearch) {
        if (!inMain) {
          render();
        } else if (state.activeTab === "map") {
          render();
        } else if (state.activeTab === "feed" || state.activeTab === "search") {
          render();
        }
      }
    }
    if (cached.fresh && !force) return;
  }
  try {
    const snap = await getDocs(query(collection(db, "restaurants"), limit(FAST_LIMITS.restaurants)));
    const rawList = [];
    snap.forEach((docSnap) => rawList.push({ id: docSnap.id, ...docSnap.data() }));
    const list = await enrichRestaurantsWithPublicMeta(rawList);
    writeCache(CACHE_KEYS.restaurants, list);
    const prevIds = state.restaurants.map((item) => String(item.id)).join("|");
    const nextIds = list.map((item) => String(item.id)).join("|");
    if (prevIds === nextIds) return;
    state.restaurants = list;
    rebuildBusinessLocations();
    if (lastRenderMode === "main") updateShellDom();
    syncFeedPostLogos();
    refreshFeedStories({ force: true });
    cleanupLeaflet();
    const inMain = lastRenderMode === "main";
    const updatedFeed = state.activeTab === "feed" && inMain && updateFeedDom();
    const updatedSearch = state.activeTab === "search" && inMain && refreshSearchView();
    if (!updatedFeed && !updatedSearch) {
      if (!inMain) {
        render();
      } else if (state.activeTab === "map") {
        render();
      } else if (state.activeTab === "feed" || state.activeTab === "search") {
        render();
      }
    }
  } catch (err) {
    console.error(err);
  }
}

function normalizeFeedPost(row) {
  const restaurant = state.restaurants.find((r) => r.id === (row.rid || row.restaurantId)) || {};
  const thumb = row.thumbUrl || row.mediaUrl || row.media?.[0]?.thumbUrl || row.media?.[0]?.url || "";
  const rowLogo = row.logoUrl || row.logo || row.logoURL || "";
  const caption = row.caption || row.captionShort || "";
  return {
    id: row.id,
    restaurantId: row.rid || row.restaurantId || "",
    business: row.businessName || row.restaurantName || restaurant.name || restaurant.restaurantName || "Business",
    logo: restaurant.logoUrl || restaurant.logo || rowLogo || "",
    location: row.city || restaurant.city || "Prishtina",
    content: caption,
    image: thumb || "",
    likes: row.likesCount || "0",
    comments: row.commentsCount || "0",
    time: formatRelative(toDateSafe(row.createdAt)),
    createdAt: row.createdAt,
    category: row.postType || "food",
    isLive: row.isLive || false,
    ownerType: "restaurant",
    ownerId: row.rid || row.restaurantId || ""
  };
}

function buildStoriesFromFeed(posts) {
  if (!Array.isArray(posts)) return [];
  const map = new Map();
  posts.forEach((post) => {
    const rid = post.restaurantId || post.ownerId || "";
    if (!rid || map.has(rid)) return;
    const rest = state.restaurants.find(r => r.id === rid) || {};
    const logo = rest.logoUrl || rest.logo || post.logo || "";
    map.set(rid, {
      restaurantId: rid,
      name: post.business || post.restaurantName || "Business",
      img: logo,
      isLive: false
    });
  });
  return Array.from(map.values()).slice(0, FAST_LIMITS.stories);
}

function buildStoriesRowSignature(items) {
  return (items || [])
    .map((item) => item.restaurantId || "")
    .join(";");
}

function normalizeExternalProfile({ profileDoc, restaurant, fallbackName, posts }) {
  const data = profileDoc?.data || profileDoc || {};
  const displayName = data?.displayName || fallbackName || restaurant?.name || restaurant?.restaurantName || "Business";
  const handle = data?.handle || normalizeHandle(displayName);
  return {
    name: displayName,
    handle: handle || "business",
    uid: profileDoc?.id || data?.uid || "",
    bio: data?.bio || restaurant?.description || restaurant?.bio || "Offizieller Account auf MENYRA Social.",
    avatar: data?.avatarUrl || data?.avatar || restaurant?.logoUrl || restaurant?.logo || "",
    location: data?.city || restaurant?.city || "Kosovo",
    followers: data?.followersCount ?? data?.followers ?? 0,
    following: data?.followingCount ?? data?.following ?? 0,
    role: "business",
    restaurantId: data?.restaurantId || restaurant?.id || "",
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
    bio: data?.bio || fallback?.bio || "",
    avatar: data?.avatarUrl || data?.avatar || fallback?.avatar || '',
    location: data?.city || fallback?.location || "Prishtina",
    followers: data?.followersCount ?? data?.followers ?? fallback?.followers ?? 0,
    following: data?.followingCount ?? data?.following ?? fallback?.following ?? 0,
    role: data?.role || fallback?.role || "user",
    posts: posts || []
  };
}

async function fetchBusinessProfileDoc({ restaurantId, restaurant }) {
  const rest = restaurant || (restaurantId ? state.restaurants.find((r) => r.id === restaurantId) : null) || {};
  const ownerUid = rest.ownerUid || "";
  const ownerEmail = rest.ownerEmail || "";
  if (ownerUid) {
    try {
      const snap = await getDoc(doc(db, "users", ownerUid));
      if (snap.exists()) return { id: snap.id, data: snap.data() || {} };
    } catch {}
  }
  if (restaurantId) {
    try {
      const snap = await getDocs(query(collection(db, "users"), where("restaurantId", "==", restaurantId), limit(1)));
      if (!snap.empty) {
        const docSnap = snap.docs[0];
        return { id: docSnap.id, data: docSnap.data() || {} };
      }
    } catch {}
  }
  if (ownerEmail) {
    try {
      const snap = await getDocs(query(collection(db, "users"), where("email", "==", ownerEmail), limit(1)));
      if (!snap.empty) {
        const docSnap = snap.docs[0];
        return { id: docSnap.id, data: docSnap.data() || {} };
      }
    } catch {}
  }
  return null;
}

async function loadBusinessPostsForRestaurant(restaurantId) {
  if (!restaurantId) return [];
  try {
    const ref = collection(db, "restaurants", restaurantId, "socialPosts");
    let snap = null;
    try {
      snap = await getDocs(query(ref, orderBy("createdAt", "desc"), limit(FAST_LIMITS.businessPosts)));
    } catch (err) {
      snap = await getDocs(ref);
    }
    const rows = [];
    snap.forEach((docSnap) => rows.push({ id: docSnap.id, ...docSnap.data() }));
    return rows
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
      .filter((row) => row.url);
  } catch (err) {
    console.error(err);
    return [];
  }
}

async function loadFeedPosts({ force = false } = {}) {
  const cached = readCache(CACHE_KEYS.feed, CACHE_TTL_MS.feed);
  if (cached?.data?.length) {
    const wasEmpty = !state.feedPosts.length;
    if (wasEmpty) {
      state.feedPosts = cached.data;
    }
    syncFeedPostLogos();
    const storiesUpdated = refreshFeedStories({ force: wasEmpty });
    if (wasEmpty || storiesUpdated) {
      const inMain = lastRenderMode === "main";
      const updatedFeed = state.activeTab === "feed" && inMain && updateFeedDom();
      if (updatedFeed) return;
      if (!inMain) {
        render();
        return;
      }
      if (state.activeTab === "feed") {
        render();
      }
    }
    preloadFeedHeroImages(state.feedPosts);
    if (cached.fresh && !force) return;
  }

  try {
    const ref = collection(db, "socialFeed");
    let snap = null;
    try {
      snap = await getDocs(query(ref, where("status", "==", "active"), orderBy("createdAt", "desc"), limit(FAST_LIMITS.feed)));
    } catch (err) {
      snap = await getDocs(query(ref, limit(FAST_LIMITS.feedFallback)));
    }
    const rows = [];
    snap.forEach((docSnap) => rows.push({ id: docSnap.id, ...docSnap.data() }));
    const restaurantIds = Array.from(new Set(rows
      .map((row) => row.rid || row.restaurantId || "")
      .filter(Boolean)));
    if (restaurantIds.length) {
      await hydrateRestaurantsByIds(restaurantIds, { max: restaurantIds.length });
    }
    const next = rows
      .filter((row) => (row.status || "active") === "active")
      .map(normalizeFeedPost)
      .sort((a, b) => (toDateSafe(b.createdAt)?.getTime() || 0) - (toDateSafe(a.createdAt)?.getTime() || 0));
    const cachedFeed = readCache(CACHE_KEYS.feed);
    saveFeedPosts(next, { lastDeltaCheck: cachedFeed?.meta?.lastDeltaCheck || 0 });

    const prevIds = state.feedPosts.map((item) => String(item.id)).join("|");
    const nextIds = next.map((item) => String(item.id)).join("|");
    state.feedPosts = next;
    const storiesChanged = refreshFeedStories({ posts: next });
    preloadFeedHeroImages(next);
    if (prevIds === nextIds && !storiesChanged) return;
    const inMain = lastRenderMode === "main";
    const updatedFeed = state.activeTab === "feed" && inMain && updateFeedDom();
    if (updatedFeed) return;
    const updatedSearch = state.activeTab === "search" && inMain && refreshSearchView();
    if (updatedSearch) return;
    if (!inMain) {
      render();
      return;
    }
    if (state.activeTab === "feed" || state.activeTab === "search") {
      render();
    }
  } catch (err) {
    console.error(err);
  }
}

async function loadFeedDelta({ force = false } = {}) {
  const cached = readCache(CACHE_KEYS.feed);
  const latestTs = cached?.meta?.latestTs || computeLatestTimestamp(state.feedPosts);
  if (!latestTs) return;
  const lastCheck = cached?.meta?.lastDeltaCheck || 0;
  if (!force && Date.now() - lastCheck < FEED_DELTA_MIN_MS) return;

  try {
    const ref = collection(db, "socialFeed");
    const snap = await getDocs(query(
      ref,
      where("createdAt", ">", Timestamp.fromMillis(latestTs)),
      orderBy("createdAt", "desc"),
      limit(FAST_LIMITS.feedDelta)
    ));
    if (snap.empty) {
      saveFeedPosts(state.feedPosts, { lastDeltaCheck: Date.now() });
      return;
    }
    const rows = [];
    snap.forEach((docSnap) => rows.push({ id: docSnap.id, ...docSnap.data() }));
    const restaurantIds = Array.from(new Set(rows
      .map((row) => row.rid || row.restaurantId || "")
      .filter(Boolean)));
    if (restaurantIds.length) {
      await hydrateRestaurantsByIds(restaurantIds, { max: restaurantIds.length });
    }
    const fresh = rows
      .filter((row) => (row.status || "active") === "active")
      .map(normalizeFeedPost);
    if (!fresh.length) {
      saveFeedPosts(state.feedPosts, { lastDeltaCheck: Date.now() });
      return;
    }
    const merged = [...fresh, ...state.feedPosts];
    const seen = new Set();
    const unique = merged.filter((item) => {
      const id = String(item.id);
      if (seen.has(id)) return false;
      seen.add(id);
      return true;
    }).sort((a, b) => (toDateSafe(b.createdAt)?.getTime() || 0) - (toDateSafe(a.createdAt)?.getTime() || 0));

    state.feedPosts = unique;
    const storiesChanged = refreshFeedStories({ posts: unique });
    preloadFeedHeroImages(unique);
    saveFeedPosts(unique, { lastDeltaCheck: Date.now() });
    if (storiesChanged || unique.length) {
      if (!(state.activeTab === "feed" && lastRenderMode === "main" && updateFeedDom())) {
        render();
      }
    }
  } catch (err) {
    console.error(err);
  }
}

async function loadUserPostsForUser(uid) {
  if (!uid) return [];
  try {
    const ref = collection(db, "users", uid, "posts");
    let snap = null;
    try {
      snap = await getDocs(query(ref, orderBy("createdAt", "desc"), limit(FAST_LIMITS.userPosts)));
    } catch (err) {
      snap = await getDocs(ref);
    }
    const rows = [];
    snap.forEach((docSnap) => rows.push({ id: docSnap.id, ...docSnap.data() }));
    return rows
      .map((row) => ({
        id: row.id,
        url: row.url || row.mediaUrl || row.media?.[0]?.url || "",
        type: row.type || "square",
        title: "",
        caption: row.caption || "",
        createdAt: row.createdAt,
        likes: row.likesCount ?? row.likes ?? 0,
        comments: row.commentsCount ?? row.comments ?? 0,
        isVideo: row.media?.[0]?.type === "video",
        ownerType: "user",
        ownerId: uid
      }))
      .filter((row) => row.url);
  } catch (err) {
    console.error(err);
    return [];
  }
}

async function loadUserPosts({ force = false } = {}) {
  if (!state.user) return;
  const cached = readCache(userPostsKey(state.user.uid), CACHE_TTL_MS.posts);
  if (cached?.data?.length) {
    if (!state.userPosts.length) {
      state.userPosts = cached.data.map((post) => ({
        ...post,
        ownerType: post.ownerType || "user",
        ownerId: post.ownerId || state.user.uid
      }));
      render();
    }
    if (cached.fresh && !force) return;
  }
  try {
    const ref = collection(db, "users", state.user.uid, "posts");
    let snap = null;
    try {
      snap = await getDocs(query(ref, orderBy("createdAt", "desc"), limit(FAST_LIMITS.userPosts)));
    } catch (err) {
      snap = await getDocs(ref);
    }
    const rows = [];
    snap.forEach((docSnap) => rows.push({ id: docSnap.id, ...docSnap.data() }));
    const next = rows.map((row) => ({
      id: row.id,
      url: row.url,
      type: row.type || "square",
      title: row.title || "",
      caption: row.caption || "",
      createdAt: row.createdAt,
      likes: row.likesCount ?? row.likes ?? 0,
      comments: row.commentsCount ?? row.comments ?? 0,
      isVideo: !!row.isVideo,
      ownerType: "user",
      ownerId: state.user.uid
    }));
    writeCache(userPostsKey(state.user.uid), next);
    const prevIds = state.userPosts.map((item) => String(item.id)).join("|");
    const nextIds = next.map((item) => String(item.id)).join("|");
    if (prevIds === nextIds) return;
    state.userPosts = next;
    render();
  } catch (err) {
    console.error(err);
  }
}

async function loadBusinessPosts({ force = false } = {}) {
  const restaurantId = state.userProfile.restaurantId;
  if (!restaurantId) {
    state.businessPosts = [];
    render();
    return;
  }
  const cached = readCache(businessPostsKey(restaurantId), CACHE_TTL_MS.posts);
  if (cached?.data?.length) {
    if (!state.businessPosts.length) {
      state.businessPosts = cached.data.map((post) => ({
        ...post,
        ownerType: post.ownerType || "restaurant",
        ownerId: post.ownerId || restaurantId,
        restaurantId: post.restaurantId || restaurantId
      }));
      render();
    }
    if (cached.fresh && !force) return;
  }
  try {
    const ref = collection(db, "restaurants", restaurantId, "socialPosts");
    let snap = null;
    try {
      snap = await getDocs(query(ref, orderBy("createdAt", "desc"), limit(FAST_LIMITS.businessPosts)));
    } catch (err) {
      snap = await getDocs(ref);
    }
    const rows = [];
    snap.forEach((docSnap) => rows.push({ id: docSnap.id, ...docSnap.data() }));
    const next = rows
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
      .filter((row) => row.url);
    writeCache(businessPostsKey(restaurantId), next);
    const prevIds = state.businessPosts.map((item) => String(item.id)).join("|");
    const nextIds = next.map((item) => String(item.id)).join("|");
    if (prevIds === nextIds) return;
    state.businessPosts = next;
    render();
  } catch (err) {
    console.error(err);
  }
}

function buildStoriesSignature(storyItems) {
  return storyItems
    .map(x => `${x.id}|${x.img || ""}`)
    .join(",");
}

async function loadStories() {
  if (liveStoriesDisabled) return;

  const cached = readCache(CACHE_KEYS.stories, CACHE_TTL_MS.stories);
  if (cached?.data?.length) {
    if (cached.fresh) {
      state.stories = cached.data;
      const inMain = lastRenderMode === "main";
      const updatedFeed = state.activeTab === "feed" && inMain && updateFeedDom();
      if (updatedFeed) return;
      if (!inMain) {
        render();
        return;
      }
      if (state.activeTab === "feed") {
        render();
      }
      return;
    }
    state.stories = cached.data;
    const inMain = lastRenderMode === "main";
    const updatedFeed = state.activeTab === "feed" && inMain && updateFeedDom();
    if (!updatedFeed && !inMain) {
      render();
    } else if (!updatedFeed && state.activeTab === "feed") {
      render();
    }
  }

  try {
    const live = await getDocs(query(
      collectionGroup(db, "stories"),
      where("active", "==", true),
      orderBy("createdAt", "desc"),
      limit(FAST_LIMITS.stories)
    ));

    const storyItems = [];
    const seen = new Set();
    
    const rids = [...new Set(live.docs.map(docSnap => (docSnap.data().restaurantId || docSnap.data().ownerId)).filter(Boolean))];
    await hydrateRestaurantsByIds(rids, { max: 24 });

    live.forEach((docSnap) => {
      const data = docSnap.data() || {};
      const restId = data.restaurantId || data.ownerId || "";
      if (!restId || seen.has(restId)) return;

      const rest = state.restaurants.find(r => r.id === restId);
      storyItems.push({
        id: docSnap.id,
        restaurantId: restId,
        name: rest?.name || data.restaurantName || "Restaurant",
        img: rest?.logoUrl || rest?.logo || data.logoUrl || data.logo || "",
        isLive: data.isLive || false,
        createdAt: toDateSafe(data.createdAt)?.toISOString() || new Date().toISOString()
      });
      seen.add(restId);
    });

    if (storyItems.length < FAST_LIMITS.stories) {
      const fallback = await loadStoriesFallback(state.restaurants);
      fallback.forEach(item => {
        if (!seen.has(item.restaurantId)) {
          storyItems.push(item);
          seen.add(item.restaurantId);
        }
      });
    }

    const finalStories = storyItems
      .sort((a, b) => (b.isLive ? 1 : 0) - (a.isLive ? 1 : 0))
      .slice(0, FAST_LIMITS.stories);
    
    const nextSig = buildStoriesSignature(finalStories);
    if (state._storiesSig === nextSig) return;
    state._storiesSig = nextSig;

    state.stories = finalStories;
    writeCache(CACHE_KEYS.stories, finalStories);
    const inMain = lastRenderMode === "main";
    const updatedFeed = state.activeTab === "feed" && inMain && updateFeedDom();
    if (updatedFeed) return;
    if (!inMain) {
      render();
      return;
    }
    if (state.activeTab === "feed") {
      render();
    }
  } catch (err) {
    console.error("Failed to load stories:", err);
    liveStoriesDisabled = true;
  }
}

async function bootstrapUser(user) {
  if (!user) return;
  try {
    await loadUserProfile(user, { force: true });
    await resolveRoleSwitchTargets(user);
  } finally {
  }
  if (!dataLoaded.following) {
    dataLoaded.following = true;
    void loadFollowingFromFirebase();
  }
  if (!dataLoaded.notifications) {
    dataLoaded.notifications = true;
    void loadNotificationsFromFirebase({ force: true });
  }
  startLiveListeners(user);
  ensureTabData(state.activeTab);
}

loadPersisted();
render();

onAuthStateChanged(auth, (user) => {
  if (authReadyTimer) {
    clearTimeout(authReadyTimer);
    authReadyTimer = null;
  }
  const nextUid = user?.uid || "";
  const prevUid = lastAuthUid;
  if ((prevUid && !nextUid) || (prevUid && nextUid && prevUid !== nextUid)) {
    resetUserScopedState();
  }
  state.user = user;
  state.sessionReady = true;
  if (user) {
    loadUserScopedPersisted(user);
    render();
    bootstrapUser(user);
  } else {
    state.roleSwitchRoles = [];
    state.roleSwitchRestaurantId = "";
    stopLiveListeners();
    render();
  }
  lastAuthUid = nextUid;
});

authReadyTimer = window.setTimeout(() => {
  if (!state.sessionReady) {
    state.sessionReady = true;
    render();
  }
}, 4000);

window.addEventListener("load", () => {
  if (window.lucide?.createIcons) {
    window.lucide.createIcons();
  }
});

