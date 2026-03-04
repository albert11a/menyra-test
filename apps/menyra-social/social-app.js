import { auth, db, app } from "@shared/firebase-config.js";
import { BUNNY_EDGE_BASE } from "@shared/bunny-edge.js";
import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-app.js";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  onAuthStateChanged,
  signOut,
  getAuth
} from "https://www.gstatic.com/firebasejs/11.0.0/firebase-auth.js";
import {
  collection,
  collectionGroup,
  doc,
  documentId,
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
  buildUrl,
  qs
} from "./_shared/social-core.js";
import { compressImage } from "./_shared/image-compressor.js";
import { getOptimizedImageUrl, getFirebaseStorageUrl, isPlaceholderUrl, PLACEHOLDER_IMAGE } from "./_shared/image-resolver.js";

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
  shopCart: "menyra_social_shop_cart_v1",
  chatIndex: "menyra_social_chat_index_v1",
  chatThreads: "menyra_social_chat_threads_v1",
  postMeta: "menyra_social_post_meta_v1",
  feed: "menyra_social_feed_v1",
  logoCache: "menyra_social_logo_cache_v1",
  avatarCache: "menyra_social_avatar_cache_v1",
  menuLayout: "menyra_social_menu_layout_v1"
};

const profileKey = (uid) => (uid ? `${STORAGE_KEYS.profile}::${uid}` : "");
const avatarKey = (uid) => (uid ? `${STORAGE_KEYS.avatarCache}::${uid}` : "");
const notificationsKey = (uid) => (uid ? `${STORAGE_KEYS.notifications}::${uid}` : "");
const followingKey = (uid) => (uid ? `${STORAGE_KEYS.following}::${uid}` : "");
const shopCartKey = (uid) => (uid ? `${STORAGE_KEYS.shopCart}::${uid}` : "");

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
  address: "",
  followers: 0,
  following: 0,
  privateAccount: false,
  karma: "0",
  roles: [],
  role: "user",
  isPremium: false,
  restaurantId: "",
  leadSettings: null,
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

const DEFAULT_MENU_LAYOUT = {
  cardColor: "white"
};

function createEmptyShopCart() {
  return {
    restaurantId: "",
    businessName: "",
    businessAvatar: "",
    items: [],
    checkoutOpen: false,
    form: {
      name: "",
      phone: "",
      city: "",
      address: ""
    },
    status: "",
    loading: false
  };
}

function createEmptyOrdersState() {
  return {
    items: [],
    loading: false,
    error: ""
  };
}

const CHAT_MESSAGE_TTL_MS = 24 * 60 * 60 * 1000;
const CHAT_ATTACHMENT_INLINE_MAX_BYTES = 1.5 * 1024 * 1024;
const CHAT_MESSAGE_READ_LIMIT = 30;
const COMMENT_AVATAR_REMOTE_FETCH_ENABLED = false;
const DETAIL_COMMENTS_LIMIT = 8;
const DETAIL_LIKES_LIMIT = 12;

const LEAD_SOCIAL_DEFAULT_PASSWORD = "Alberthoti1992";
const LEAD_STATUS_ORDER = ["registered", "contacted", "testphase", "kunde", "no_interest"];
const LEAD_STATUS_LABELS = {
  registered: "Registriert",
  contacted: "Kontaktiert",
  testphase: "Testphase",
  kunde: "Kunde",
  no_interest: "Keine Interesse"
};
const LEAD_TYPE_ORDER = ["restaurant", "cafe", "fastfood", "ecommerce", "tankstelle", "lebensmittel", "apotheken", "services"];
const LEAD_TYPE_LABELS = {
  restaurant: "Restaurant",
  cafe: "Cafe",
  fastfood: "Fastfood",
  ecommerce: "E-Commerce",
  tankstelle: "Tankstelle",
  lebensmittel: "Lebensmittel",
  apotheken: "Apotheke",
  services: "Services"
};
const ALBERT_CEO_UID = "aklBkkIuZ7Nrpx266TJn63rrxX62";
const ALBERT_CEO_ALIASES = Object.freeze(["alberthoti", "albert_hoti"]);
const ALBERT_CEO_EMAILS = Object.freeze(["alberthoti.vsa@gmail.com"]);
const HIDDEN_LEGACY_CEO_EMAILS = Object.freeze(["albert.hoti@menyra.com"]);
const LEGACY_CEO_DELETE_UIDS = Object.freeze(["rtnM3XzNsKhpp5wzJhxNToyyjsU2"]);
const MILAN_OWNED_LEAD_EMAILS = Object.freeze([
  "restorandis@menyra.com",
  "restoranbelvedere@menyra.com",
  "restoranoresac@menyra.com",
  "zeigelrestaurant@menyra.com"
]);
const MILAN_OWNED_LEAD_BUSINESSES = Object.freeze([
  "restoran dis",
  "restoran belvedere",
  "restoran oresac",
  "zeigelrestaurant"
]);
const ALBERT_OWNED_LEAD_EMAILS = Object.freeze([
  "mobishopniti@menyra.com",
  "pizzeriadon@menyra.com",
  "antica@menyra.com"
]);
const ALBERT_OWNED_LEAD_BUSINESSES = Object.freeze([
  "mobi shop niti",
  "pizzeria don napoletano",
  "antica"
]);
const CEO_COUNTRIES = Object.freeze(["Albanien", "Kosovo", "Serbien"]);
const LEAD_SETTINGS_DEFAULT_COUNTRY = "Kosovo";
const LEAD_COUNTRY_CENTERS = Object.freeze({
  Kosovo: Object.freeze({ lat: 42.6629, lng: 21.1655 }),
  Serbien: Object.freeze({ lat: 44.7866, lng: 20.4489 }),
  Albanien: Object.freeze({ lat: 41.3275, lng: 19.8187 })
});
const PRISHTINA_COORDS = Object.freeze({ lat: 42.6629, lng: 21.1655 });
const OLC_ALPHABET = "23456789CFGHJMPQRVWX";
const OLC_SEPARATOR = "+";
const OLC_SEPARATOR_POSITION = 8;
const OLC_PAIR_RESOLUTIONS = [20, 1, 0.05, 0.0025, 0.000125];
const OLC_GRID_ROWS = 5;
const OLC_GRID_COLUMNS = 4;

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

const MENU_LAYOUT_COLORS = [
  { id: "white", label: "White", swatch: "bg-white border border-slate-200", cardClass: "bg-white border-slate-100" },
  { id: "mint", label: "Mint", swatch: "bg-emerald-400", cardClass: "bg-emerald-50 border-emerald-100" },
  { id: "sky", label: "Sky", swatch: "bg-sky-400", cardClass: "bg-sky-50 border-sky-100" },
  { id: "lemon", label: "Lemon", swatch: "bg-yellow-300", cardClass: "bg-yellow-50 border-yellow-100" },
  { id: "peach", label: "Peach", swatch: "bg-orange-300", cardClass: "bg-orange-50 border-orange-100" },
  { id: "rose", label: "Rose", swatch: "bg-rose-300", cardClass: "bg-rose-50 border-rose-100" }
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
const menuCache = new Map();
const focusCache = new Map();
const menuItemCountsRequested = new Set();
const FAST_LIMITS = {
  feed: 20,
  feedFallback: 40,
  feedDelta: 8,
  userPosts: 24,
  businessPosts: 24,
  restaurants: 80,
  stories: 24,
  storiesFallback: 30,
  likes: 20,
  comments: 40
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
const staffCacheKey = (uid) => (uid ? `menyra_social_staff_cache_v1::${uid}` : "");
const leadPageCacheKey = (uid, scope) => (uid && scope ? `menyra_social_leads_cache_v1::${uid}::${scope}` : "");
const customerPageCacheKey = (uid, scope) => (uid && scope ? `menyra_social_customers_cache_v1::${uid}::${scope}` : "");
const CACHE_TTL_MS = {
  feed: 10 * 60 * 1000,
  posts: 10 * 60 * 1000,
  restaurants: 60 * 60 * 1000,
  stories: 10 * 60 * 1000,
  staff: 90 * 1000,
  crmPages: 90 * 1000
};
const FEED_DELTA_MIN_MS = 15 * 60 * 1000;
const FEED_PRELOAD_LIMIT = 3;
const FEED_PRELOAD_ATTR = "data-menyrasocial-feed-preload";
const FEED_META_LISTEN_LIMIT = 20;
const CRM_PAGE_SIZE = 20;

function createLeadScopeMap(factory = () => null) {
  return {
    own: factory("own"),
    staff: factory("staff"),
    archived: factory("archived")
  };
}

function createCustomerScopeMap(factory = () => null) {
  return {
    own: factory("own"),
    staff: factory("staff")
  };
}

function createEmptyLeadsState() {
  return {
    items: [],
    loading: false,
    loadingMore: false,
    error: "",
    query: "",
    status: "",
    scope: "own",
    view: "list",
    settingsSaving: false,
    settingsStatus: "",
    keepFocus: false,
    pages: createLeadScopeMap(() => []),
    pageSize: createLeadScopeMap(() => CRM_PAGE_SIZE),
    hasMore: createLeadScopeMap(() => false),
    loaded: createLeadScopeMap(() => false),
    knownCount: createLeadScopeMap(() => 0),
    countExact: createLeadScopeMap(() => false)
  };
}

function createEmptyCustomersState() {
  return {
    items: [],
    loading: false,
    loadingMore: false,
    error: "",
    query: "",
    scope: "own",
    keepFocus: false,
    pages: createCustomerScopeMap(() => []),
    pageSize: createCustomerScopeMap(() => CRM_PAGE_SIZE),
    hasMore: createCustomerScopeMap(() => false),
    loaded: createCustomerScopeMap(() => false),
    knownCount: createCustomerScopeMap(() => 0),
    countExact: createCustomerScopeMap(() => false)
  };
}

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
  pendingFollowRequests: [],
  chatThreads: [],
  shopCart: createEmptyShopCart(),
  orders: createEmptyOrdersState(),
  profileView: null,
  profileBackTab: "feed",
  profileViewMode: "grid",
  profileTopTab: "profile",
  profileContentTab: "posts",
  profileCheckins: [],
  profilePostMenuId: null,
  profileModal: {
    open: false,
    profile: null
  },
  chatModal: {
    open: false,
    profile: null,
    messages: [],
    draft: "",
    attachments: []
  },
  menu: {
    restaurantId: "",
    items: [],
    loading: false,
    error: "",
    filter: "all",
    query: "",
    source: "hybrid"
  },
  menuModal: {
    open: false,
    mode: "create",
    item: null,
    status: "",
    loading: false,
    imageUrlDraft: "",
    cropX: 50,
    cropY: 50,
    imageFiles: [],
    imagePreviews: [],
    existingImages: []
  },
  menuDetail: {
    open: false,
    item: null,
    index: 0,
    restaurantId: "",
    selectedSize: "",
    selectedColor: "",
    commentText: "",
    loading: false,
    sending: false
  },
  focus: {
    restaurantId: "",
    items: [],
    loading: false,
    enabled: true,
    error: "",
    index: 0
  },
  focusModal: {
    open: false,
    mode: "create",
    item: null,
    status: "",
    loading: false,
    cropX: 50,
    cropY: 50,
    imageFile: null,
    imagePreview: ""
  },
  leads: createEmptyLeadsState(),
  customers: createEmptyCustomersState(),
  staff: {
    items: [],
    view: "list",
    editorUid: "",
    loading: false,
    loadingMore: false,
    hasMore: false,
    pageSize: CRM_PAGE_SIZE,
    saving: false,
    deleting: false,
    error: "",
    status: "",
    form: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      country: CEO_COUNTRIES[0],
      locationLabel: "",
      coords: null,
      avatarUrl: "",
      avatarPreview: "",
      avatarFile: null
    }
  },
  leadModal: {
    open: false,
    mode: "create",
    lead: null,
    status: "",
    loading: false,
    logoFile: null,
    logoPreview: "",
    coords: null,
    locations: []
  },
  customerModal: {
    open: false,
    mode: "edit",
    customer: null,
    status: "",
    loading: false,
    logoFile: null,
    logoPreview: ""
  },
  settings: { ...DEFAULT_SETTINGS },
  menuLayout: { ...DEFAULT_MENU_LAYOUT },
  menuItemMeta: {},
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
let ceoStaffLoadPromise = null;
let ceoOwnershipReconcilePromise = null;
let ceoOwnershipReconciled = false;
let ceoCrmCountsPromise = null;
let hiddenLegacyCeoUids = [];
let plusCodeSearchCache = new Map();
let renderQueued = false;
let modalEscapeBound = false;
let profileMenuBound = false;
let pendingCommentHighlight = "";
let lastCommentKey = "";
let lastCommentAt = 0;
let lastMenuCommentKey = "";
let lastMenuCommentAt = 0;
let menuDetailCloseBound = false;
let overlayCache = { profile: "", chat: "", post: "", likes: "", menu: "", menuDetail: "", focus: "", lead: "", customer: "" };
let pendingProfileRestaurantId = "";
let pendingProfileTopTab = "";
let pendingProfileHandled = false;
let dataLoaded = {
  feed: false,
  profile: false,
  restaurants: false,
  stories: false,
  following: false,
  notifications: false,
  leads: false,
  customers: false,
  staff: false
};
let lastAppHtml = "";
let lastRenderMode = "";
let lastRenderedMainTab = "";
let authReadyTimer = null;
let feedDeltaTimer = null;
let searchTimer = null;
let searchToken = 0;
let crmAutoLoadObserver = null;
const searchCache = new Map();
let notificationsUnsub = null;
let followingUnsub = null;
let userDocUnsub = null;
let userDocLiveKey = "";
let profileViewUnsub = null;
let feedUnsub = null;
let storiesUnsub = null;
let chatThreadsUnsub = null;
let chatMessagesUnsub = null;
let ordersUnsub = null;
let ordersListenerKey = "";
let restaurantsUnsub = null;
let userPostsUnsub = null;
let businessPostsUnsub = null;
let modalPostDocUnsub = null;
let modalLikesUnsub = null;
let modalCommentsUnsub = null;
let menuDetailDocUnsub = null;
let menuDetailLikesUnsub = null;
let menuDetailCommentsUnsub = null;
let restaurantMetaUnsubs = new Map();
let storyRefreshTimer = null;
let liveFeedDisabled = false;
let liveStoriesDisabled = false;
let feedStoriesSignature = "";
let storiesRowSignature = "";
let focusRotateTimer = null;
let focusRotateKey = "";

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
try {
  pendingProfileRestaurantId = qs("r") || qs("restaurant") || "";
  pendingProfileTopTab = qs("tab") || qs("top") || "";
} catch {}

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

function saveMenuLayoutToStorage(layout = state.menuLayout) {
  try {
    safeStorage.setItem(STORAGE_KEYS.menuLayout, JSON.stringify(layout || {}));
  } catch {}
}

function getMenuLayoutTheme(colorId = state.menuLayout?.cardColor) {
  const id = String(colorId || "").trim();
  return MENU_LAYOUT_COLORS.find((theme) => theme.id === id) || MENU_LAYOUT_COLORS[0];
}

function getFocusCardClass() {
  const theme = getMenuLayoutTheme();
  return theme?.cardClass || "bg-white border-slate-100";
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
  if (!COMMENT_AVATAR_REMOTE_FETCH_ENABLED) return;
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
  return {
    title: "MENYRA",
    subtitle: "Social",
    logoUrl: resolveShellAvatarUrl(),
    isBusinessLogo: isLocalBusinessProfile(state.userProfile)
  };
}

function normalizeSearchQuery(value) {
  return String(value || "").trim();
}

function normalizeSearchKey(value) {
  return normalizeSearchQuery(value).toLowerCase();
}

function normalizeLeadCountry(value) {
  const safe = String(value || "").trim().toLowerCase();
  if (safe === "serbia" || safe === "serbien") return "Serbien";
  if (safe === "albania" || safe === "albanien") return "Albanien";
  if (safe === "kosovo" || safe === "kosova") return "Kosovo";
  return CEO_COUNTRIES.includes(String(value || "").trim()) ? String(value || "").trim() : LEAD_SETTINGS_DEFAULT_COUNTRY;
}

function createDefaultLeadPricing() {
  return LEAD_TYPE_ORDER.reduce((acc, key) => {
    acc[key] = 0;
    return acc;
  }, {});
}

function normalizeLeadPricing(raw = {}) {
  const base = createDefaultLeadPricing();
  Object.keys(base).forEach((key) => {
    const num = Number(raw?.[key]);
    base[key] = Number.isFinite(num) && num >= 0 ? num : 0;
  });
  return base;
}

function normalizeLeadSettings(raw = {}) {
  const input = raw && typeof raw === "object" ? raw : {};
  return {
    defaultPassword: String(input.defaultPassword || LEAD_SOCIAL_DEFAULT_PASSWORD || "").trim() || LEAD_SOCIAL_DEFAULT_PASSWORD,
    defaultCountry: normalizeLeadCountry(input.defaultCountry || input.locationCountry || LEAD_SETTINGS_DEFAULT_COUNTRY),
    pricing: normalizeLeadPricing(input.pricing || input.typePricing || {})
  };
}

function getLeadSettingsConfig() {
  return normalizeLeadSettings(state.userProfile?.leadSettings || {});
}

function getLeadCountryCenter(country = LEAD_SETTINGS_DEFAULT_COUNTRY) {
  const key = normalizeLeadCountry(country);
  return LEAD_COUNTRY_CENTERS[key] || LEAD_COUNTRY_CENTERS[LEAD_SETTINGS_DEFAULT_COUNTRY] || PRISHTINA_COORDS;
}

function buildLeadAccountEmail(name = "") {
  const localPart = String(name || "")
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/_/g, "")
    .replace(/[^a-z0-9]/g, "");
  return localPart ? `${localPart}@menyra.com` : "";
}

function buildLeadContactName(firstName = "", lastName = "", fallback = "") {
  const combined = `${String(firstName || "").trim()} ${String(lastName || "").trim()}`.trim();
  return combined || String(fallback || "").trim();
}

function getLeadMonthlyPrice(type = "", config = getLeadSettingsConfig()) {
  const pricing = normalizeLeadPricing(config?.pricing || {});
  const key = resolveCustomerType(type || "cafe");
  return Number(pricing[key]) || 0;
}

function getLeadPriceForCycle(type = "", cycle = "monthly", config = getLeadSettingsConfig()) {
  const monthly = getLeadMonthlyPrice(type, config);
  return cycle === "yearly" ? monthly * 12 : monthly;
}

function inferLeadCountryFromText(text = "", fallbackCountry = "") {
  const value = normalizeSearchKey(text);
  if (value.includes("serbien") || value.includes("serbia") || value.includes("beograd") || value.includes("belgrad")) return "Serbien";
  if (value.includes("albanien") || value.includes("albania") || value.includes("tirana")) return "Albanien";
  if (value.includes("kosovo") || value.includes("kosova") || value.includes("prishtina") || value.includes("pristina")) return "Kosovo";
  return normalizeLeadCountry(fallbackCountry || getLeadSettingsConfig().defaultCountry);
}

function isCeoUser() {
  if (state.roleSwitchRoles?.includes("ceo")) return true;
  const roles = normalizeRoleList(state.userProfile?.roles || state.userProfile?.role || "");
  return roles.includes("ceo");
}

function isAlbertCeoUser() {
  if (!state.user) return false;
  const email = normalizeEmailValue(state.user?.email || "");
  if (isHiddenLegacyCeoEmail(email)) return false;
  const handleCandidates = [
    state.userProfile?.handle,
    state.userProfile?.name,
    state.user?.displayName
  ].map((value) => normalizeHandle(value || "")).filter(Boolean);
  if (handleCandidates.some((value) => ALBERT_CEO_ALIASES.includes(value))) return true;
  if (ALBERT_CEO_EMAILS.includes(email)) return true;
  return ALBERT_CEO_ALIASES.some((alias) => email.startsWith(`${alias}@`));
}

function hasGlobalCeoAccess(profile = state.userProfile, user = state.user) {
  const uid = String(user?.uid || profile?.uid || "").trim();
  return uid === ALBERT_CEO_UID || isAlbertCeoUser();
}

function getCeoGpsOverride(profile = state.userProfile) {
  if (!isCeoUser()) return null;
  const lat = Number(profile?.gpsLat);
  const lng = Number(profile?.gpsLng);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  return { lat, lng };
}

function getAlbertCeoGpsOverride() {
  if (!isAlbertCeoUser()) return null;
  return getCeoGpsOverride(state.userProfile);
}

function normalizeLeadStatusKey(value) {
  const raw = String(value || "").trim().toLowerCase();
  if (!raw) return "";
  const key = raw.replace(/[\s-]+/g, "_");
  if (["kein_interesse", "keine_interesse", "no_interest", "nointerest", "nointeresse"].includes(key)) return "no_interest";
  if (["demo", "testphase", "test_phase", "trial", "test"].includes(key)) return "testphase";
  if (["kunde", "customer", "converted", "active"].includes(key)) return "kunde";
  if (["contacted", "kontakt", "kontaktiert", "follow_up", "waiting", "interested"].includes(key)) return "contacted";
  if (["registered", "registriert", "new", "lead", "prospect", "open"].includes(key)) return "registered";
  if (["archived", "archive", "archiv"].includes(key)) return "no_interest";
  return key;
}

function normalizeLeadTypeKey(value) {
  const key = String(value || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[\s-]+/g, "_");
  if (!key) return "";
  if (key === "e_commerce") return "ecommerce";
  if (["online_shop", "onlineshop", "online-shop", "shop", "store", "laden"].includes(key)) return "ecommerce";
  if (["fast_food", "imbiss", "snack"].includes(key)) return "fastfood";
  if (["tank", "gas_station", "gasstation", "fuel", "petrol"].includes(key)) return "tankstelle";
  if (["grocery", "supermarket", "supermarkt", "market"].includes(key)) return "lebensmittel";
  if (["apotheke", "pharmacy"].includes(key)) return "apotheken";
  if (["service", "dienstleistung", "dienstleistungen"].includes(key)) return "services";
  return key || "";
}

function leadStatusLabel(value) {
  const key = normalizeLeadStatusKey(value);
  return LEAD_STATUS_LABELS[key] || value || "-";
}

function leadTypeLabel(value) {
  const key = normalizeLeadTypeKey(value);
  return LEAD_TYPE_LABELS[key] || value || "-";
}

function resolveCustomerType(value) {
  const key = normalizeLeadTypeKey(value);
  if (LEAD_TYPE_ORDER.includes(key)) return key;
  return "cafe";
}

function hasLeadLocationCoords(location) {
  return Number.isFinite(Number(location?.lat)) && Number.isFinite(Number(location?.lng));
}

function toFiniteCoordNumber(value) {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value === "string") {
    const cleaned = value.trim().replace(",", ".");
    if (!cleaned) return null;
    const parsed = Number(cleaned);
    return Number.isFinite(parsed) ? parsed : null;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function normalizeCoordPair(latValue, lngValue) {
  const lat = toFiniteCoordNumber(latValue);
  const lng = toFiniteCoordNumber(lngValue);
  if (lat === null || lng === null) return null;
  if (Math.abs(lat) < 0.000001 && Math.abs(lng) < 0.000001) return null;
  if (Math.abs(lat) <= 90 && Math.abs(lng) <= 180) return { lat, lng };
  if (Math.abs(lat) <= 180 && Math.abs(lng) <= 90) return { lat: lng, lng: lat };
  return null;
}

function preferStableCoords(candidate, reference) {
  const direct = candidate ? normalizeCoordPair(candidate.lat, candidate.lng) : null;
  const ref = reference ? normalizeCoordPair(reference.lat, reference.lng) : null;
  if (!direct) return ref;
  if (!ref) return direct;
  const isExtremeOutlier = Math.abs(direct.lat - ref.lat) > 1.5 || Math.abs(direct.lng - ref.lng) > 1.5;
  return isExtremeOutlier ? ref : direct;
}

function resolveCoordsFromShape(shape) {
  if (!shape || typeof shape !== "object") return null;
  return normalizeCoordPair(shape.lat, shape.lng)
    || normalizeCoordPair(shape.latitude, shape.longitude)
    || normalizeCoordPair(shape.lat, shape.lon)
    || normalizeCoordPair(shape.latitude, shape.lon)
    || normalizeCoordPair(shape._lat, shape._long)
    || normalizeCoordPair(shape._latitude, shape._longitude);
}

function resolveCoordsFromEntity(entity) {
  if (!entity || typeof entity !== "object") return null;
  return normalizeCoordPair(entity.gpsLat, entity.gpsLng)
    || normalizeCoordPair(entity.lat, entity.lng)
    || normalizeCoordPair(entity.latitude, entity.longitude)
    || normalizeCoordPair(entity.lat, entity.lon)
    || normalizeCoordPair(entity.latitude, entity.lon)
    || resolveCoordsFromShape(entity.geo)
    || resolveCoordsFromShape(entity.coords)
    || resolveCoordsFromShape(entity.gps)
    || resolveCoordsFromShape(entity.location)
    || resolveCoordsFromShape(entity.position);
}

function olcNormalizeLongitude(value) {
  let lng = Number(value);
  if (!Number.isFinite(lng)) return null;
  while (lng < -180) lng += 360;
  while (lng >= 180) lng -= 360;
  return lng;
}

function olcClipLatitude(value) {
  const lat = Number(value);
  if (!Number.isFinite(lat)) return null;
  return Math.min(90, Math.max(-90, lat));
}

function sanitizePlusCode(raw) {
  const text = String(raw || "").toUpperCase();
  return text
    .replace(/\s+/g, "")
    .replace(/[^23456789CFGHJMPQRVWX+0]/g, "");
}

function extractPlusCodeFromText(text) {
  const input = String(text || "");
  if (!input.includes("+")) return null;
  const match = input.toUpperCase().match(/([23456789CFGHJMPQRVWX]{2,8}\+[23456789CFGHJMPQRVWX]{2,})/);
  if (!match?.[1]) return null;
  const code = sanitizePlusCode(match[1]);
  if (!code.includes(OLC_SEPARATOR)) return null;
  const remainder = input.replace(match[1], " ").replace(/\s+/g, " ").trim();
  return { code, remainder };
}

function olcDecodeValue(ch) {
  const idx = OLC_ALPHABET.indexOf(String(ch || "").toUpperCase());
  return idx >= 0 ? idx : -1;
}

function isLikelyFullPlusCode(code) {
  const clean = sanitizePlusCode(code);
  const sep = clean.indexOf(OLC_SEPARATOR);
  if (sep !== OLC_SEPARATOR_POSITION) return false;
  if (clean.indexOf(OLC_SEPARATOR, sep + 1) !== -1) return false;
  const withoutSep = clean.replace(OLC_SEPARATOR, "").replace(/0/g, "");
  if (withoutSep.length < 2) return false;
  return /^[23456789CFGHJMPQRVWX]+$/.test(withoutSep);
}

function isLikelyShortPlusCode(code) {
  const clean = sanitizePlusCode(code);
  const sep = clean.indexOf(OLC_SEPARATOR);
  if (sep <= 0 || sep >= OLC_SEPARATOR_POSITION) return false;
  if (clean.indexOf(OLC_SEPARATOR, sep + 1) !== -1) return false;
  const withoutSep = clean.replace(OLC_SEPARATOR, "").replace(/0/g, "");
  if (withoutSep.length < 2) return false;
  return /^[23456789CFGHJMPQRVWX]+$/.test(withoutSep);
}

function olcDecodeFullPlusCode(code) {
  if (!isLikelyFullPlusCode(code)) return null;
  const clean = sanitizePlusCode(code);
  const digits = clean.replace(OLC_SEPARATOR, "").replace(/0/g, "");
  if (!digits.length) return null;

  const pairLength = Math.min(10, digits.length - (digits.length % 2));
  if (pairLength < 2) return null;

  let lat = -90;
  let lng = -180;
  let latPlace = 20;
  let lngPlace = 20;

  for (let i = 0; i < pairLength; i += 2) {
    const latVal = olcDecodeValue(digits[i]);
    const lngVal = olcDecodeValue(digits[i + 1]);
    if (latVal < 0 || lngVal < 0) return null;
    const place = OLC_PAIR_RESOLUTIONS[i / 2];
    lat += latVal * place;
    lng += lngVal * place;
    latPlace = place;
    lngPlace = place;
  }

  if (digits.length > pairLength) {
    latPlace = OLC_PAIR_RESOLUTIONS[OLC_PAIR_RESOLUTIONS.length - 1];
    lngPlace = OLC_PAIR_RESOLUTIONS[OLC_PAIR_RESOLUTIONS.length - 1];
    for (let i = pairLength; i < digits.length; i += 1) {
      const val = olcDecodeValue(digits[i]);
      if (val < 0) return null;
      const row = Math.floor(val / OLC_GRID_COLUMNS);
      const col = val % OLC_GRID_COLUMNS;
      latPlace /= OLC_GRID_ROWS;
      lngPlace /= OLC_GRID_COLUMNS;
      lat += row * latPlace;
      lng += col * lngPlace;
    }
  }

  return normalizeCoordPair(lat + (latPlace / 2), lng + (lngPlace / 2));
}

function olcEncodePairPrefix(latValue, lngValue, prefixLength) {
  const latClipped = olcClipLatitude(latValue);
  const lngNorm = olcNormalizeLongitude(lngValue);
  const length = Math.max(0, Number(prefixLength) || 0);
  if (latClipped === null || lngNorm === null || !length) return "";

  let lat = latClipped;
  let lng = lngNorm;
  if (lat === 90) lat = 90 - 1e-12;
  lat += 90;
  lng += 180;

  let out = "";
  for (let i = 0; i < OLC_PAIR_RESOLUTIONS.length && out.length < Math.max(length, OLC_SEPARATOR_POSITION); i += 1) {
    const place = OLC_PAIR_RESOLUTIONS[i];
    const latDigit = Math.floor(lat / place);
    const lngDigit = Math.floor(lng / place);
    lat -= latDigit * place;
    lng -= lngDigit * place;
    out += OLC_ALPHABET[Math.max(0, Math.min(OLC_ALPHABET.length - 1, latDigit))];
    out += OLC_ALPHABET[Math.max(0, Math.min(OLC_ALPHABET.length - 1, lngDigit))];
  }

  return out.slice(0, length);
}

function olcRecoverShortCode(shortCode, refLat, refLng) {
  if (!isLikelyShortPlusCode(shortCode)) return null;
  const clean = sanitizePlusCode(shortCode);
  const sep = clean.indexOf(OLC_SEPARATOR);
  if (sep <= 0 || sep >= OLC_SEPARATOR_POSITION) return null;

  const prefixLength = OLC_SEPARATOR_POSITION - sep;
  const refLatClipped = olcClipLatitude(refLat);
  const refLngNorm = olcNormalizeLongitude(refLng);
  if (refLatClipped === null || refLngNorm === null) return null;

  const prefix = olcEncodePairPrefix(refLatClipped, refLngNorm, prefixLength);
  if (!prefix || prefix.length !== prefixLength) return null;
  const fullCode = `${prefix}${clean}`;
  const decoded = olcDecodeFullPlusCode(fullCode);
  if (!decoded) return null;

  const resolution = Math.pow(20, 2 - (prefixLength / 2));
  const edge = resolution / 2;
  let lat = decoded.lat;
  let lng = decoded.lng;

  if (refLatClipped + edge < lat) lat -= resolution;
  else if (refLatClipped - edge > lat) lat += resolution;
  if (refLngNorm + edge < lng) lng -= resolution;
  else if (refLngNorm - edge > lng) lng += resolution;

  return normalizeCoordPair(lat, lng);
}

function resolvePlusCodeReferenceCoords(value = "", refCoords = null) {
  const direct = normalizeCoordPair(refCoords?.lat, refCoords?.lng);
  if (direct) return direct;
  const extracted = extractPlusCodeFromText(value);
  const inferredCountry = inferLeadCountryFromText(
    `${String(value || "")} ${String(extracted?.remainder || "")}`,
    ""
  );
  return getLeadCountryCenter(inferredCountry);
}

async function geocodeReferenceSearch(text = "") {
  const queryText = String(text || "").trim();
  if (!queryText) return null;
  const cacheKey = normalizeSearchKey(queryText);
  if (plusCodeSearchCache.has(cacheKey)) {
    return plusCodeSearchCache.get(cacheKey) || null;
  }
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(queryText)}&limit=1`);
    const data = await res.json();
    const coords = Array.isArray(data) && data[0]
      ? normalizeCoordPair(data[0].lat, data[0].lon)
      : null;
    plusCodeSearchCache.set(cacheKey, coords || null);
    return coords;
  } catch {
    plusCodeSearchCache.set(cacheKey, null);
    return null;
  }
}

function parsePlusCodeFromAddressInput(value, refCoords = null) {
  const extracted = extractPlusCodeFromText(value);
  if (!extracted?.code) return null;

  if (isLikelyFullPlusCode(extracted.code)) {
    return olcDecodeFullPlusCode(extracted.code);
  }

  if (isLikelyShortPlusCode(extracted.code)) {
    const ref = resolvePlusCodeReferenceCoords(value, refCoords);
    return olcRecoverShortCode(extracted.code, ref.lat, ref.lng);
  }

  return null;
}

async function parseCoordsFromAddressInputAsync(value, refCoords = null) {
  const direct = parseCoordsFromAddressInput(value, refCoords);
  const extracted = extractPlusCodeFromText(value);
  const remainder = String(extracted?.remainder || "").trim();
  if (!extracted?.code || !isLikelyShortPlusCode(extracted.code) || !remainder) {
    return direct;
  }
  const preciseRef = await geocodeReferenceSearch(remainder);
  if (!preciseRef) return direct;
  return olcRecoverShortCode(extracted.code, preciseRef.lat, preciseRef.lng) || direct;
}

function parseCoordsFromAddressInput(value, refCoords = null) {
  const text = String(value || "").trim();
  if (!text) return null;
  const plusCodeCoords = parsePlusCodeFromAddressInput(text, refCoords);
  if (plusCodeCoords) return plusCodeCoords;
  const cleaned = text.replace(/[|;]/g, ",").replace(/\s+/g, " ").trim();
  const labeledPattern = /(lat(?:itude)?|lng|lon|long|longitude)\s*[:=]\s*(-?\d+(?:[.,]\d+)?)/gi;
  const labeledCoords = {};
  let labeledMatch = null;
  while ((labeledMatch = labeledPattern.exec(cleaned)) !== null) {
    const key = String(labeledMatch[1] || "").toLowerCase();
    const num = toFiniteCoordNumber(labeledMatch[2]);
    if (num === null) continue;
    if (key.startsWith("lat")) labeledCoords.lat = num;
    else labeledCoords.lng = num;
  }
  if (Number.isFinite(labeledCoords.lat) && Number.isFinite(labeledCoords.lng)) {
    return normalizeCoordPair(labeledCoords.lat, labeledCoords.lng);
  }

  const pairMatch = cleaned.match(/^(-?\d+(?:[.,]\d+)?)\s*[, ]\s*(-?\d+(?:[.,]\d+)?)$/);
  if (!pairMatch) return null;
  const first = toFiniteCoordNumber(pairMatch[1]);
  const second = toFiniteCoordNumber(pairMatch[2]);
  if (first === null || second === null) return null;

  const kosovoLat = (v) => v >= 41 && v <= 44.5;
  const kosovoLng = (v) => v >= 19 && v <= 22.5;
  if (kosovoLng(first) && kosovoLat(second)) {
    return { lat: second, lng: first };
  }
  if (kosovoLat(first) && kosovoLng(second)) {
    return { lat: first, lng: second };
  }

  return normalizeCoordPair(first, second);
}

function createLeadLocation({ address = "", lat = null, lng = null } = {}) {
  const nextAddress = String(address || "").trim();
  const nextLat = Number(lat);
  const nextLng = Number(lng);
  return {
    address: nextAddress,
    lat: Number.isFinite(nextLat) ? nextLat : null,
    lng: Number.isFinite(nextLng) ? nextLng : null
  };
}

function normalizeLeadLocations(locations, fallbackAddress = "", fallbackCoords = null) {
  const source = Array.isArray(locations) ? locations : [];
  const list = source.map((entry) => {
    const row = entry || {};
    const directCoords = resolveCoordsFromEntity(row);
    return createLeadLocation({
      address: row.address || row.label || "",
      lat: directCoords?.lat ?? row.gpsLat ?? row.lat ?? row.latitude ?? row.coords?.lat ?? row.coords?.latitude,
      lng: directCoords?.lng ?? row.gpsLng ?? row.lng ?? row.lon ?? row.longitude ?? row.coords?.lng ?? row.coords?.longitude
    });
  }).filter((row) => row.address || hasLeadLocationCoords(row));

  if (!list.length) {
    const fallback = createLeadLocation({
      address: fallbackAddress,
      lat: fallbackCoords?.lat,
      lng: fallbackCoords?.lng
    });
    if (fallback.address || hasLeadLocationCoords(fallback)) {
      list.push(fallback);
    }
  }

  if (!list.length) {
    list.push(createLeadLocation());
  }

  return list.slice(0, 12);
}

function getPrimaryLeadLocation(locations) {
  const list = normalizeLeadLocations(locations);
  const withCoords = list.find((item) => hasLeadLocationCoords(item));
  return withCoords || list[0] || createLeadLocation();
}

function customerStatusLabel(value) {
  if (!value) return "Kunde";
  const key = normalizeLeadStatusKey(value || "kunde") || "kunde";
  if (key === "testphase") return "Testphase";
  if (key === "no_interest") return "Keine Interesse";
  if (key === "registered") return "Registriert";
  if (key === "contacted") return "Kontaktiert";
  if (key === "kunde") return "Kunde";
  return String(value || "").toUpperCase();
}

function slugify(input) {
  return String(input || "")
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
    .slice(0, 60) || "kunde";
}

function isCustomerRestaurant(rest = {}) {
  const statusKey = normalizeLeadStatusKey(rest.status || "");
  if (statusKey === "kunde") return true;
  return false;
}

function normalizeRestaurantType(value) {
  const normalized = normalizeLeadTypeKey(value);
  if (normalized) return normalized;
  const raw = String(value || "").toLowerCase().trim();
  if (!raw) return "";
  if (raw.includes("cafe") || raw.includes("coffee")) return "cafe";
  if (raw.includes("restaurant") || raw.includes("resto")) return "restaurant";
  if (raw.includes("fast")) return "fastfood";
  if (raw.includes("ecom") || raw.includes("online") || raw.includes("shop") || raw.includes("store")) return "ecommerce";
  if (raw.includes("tank") || raw.includes("gas") || raw.includes("fuel")) return "tankstelle";
  if (raw.includes("lebens") || raw.includes("grocery") || raw.includes("supermarkt")) return "lebensmittel";
  if (raw.includes("apothek") || raw.includes("pharmacy")) return "apotheken";
  if (raw.includes("service") || raw.includes("dienst")) return "services";
  return raw;
}

function getBusinessProfileType(profile = state.userProfile) {
  if (!profile?.restaurantId) return "";
  const rest = getRestaurantMetaById(profile.restaurantId);
  const typeRaw = rest?.type
    || rest?.customerType
    || rest?.category
    || rest?.kind
    || rest?.restaurantType
    || profile?.type
    || profile?.customerType
    || profile?.category
    || profile?.kind
    || profile?.restaurantType
    || "";
  return normalizeRestaurantType(typeRaw);
}

function getBusinessCatalogMode(profile = state.userProfile) {
  const type = getBusinessProfileType(profile);
  if (!type) return "menu";
  if (type === "ecommerce") return "shop";
  return "menu";
}

function getBusinessCatalogLabel(profile = state.userProfile) {
  return getBusinessCatalogMode(profile) === "shop" ? "Shop" : "Menue";
}

function isShopCatalogProfile(profile = state.userProfile) {
  return getBusinessCatalogMode(profile) === "shop";
}

function isRestaurantCafeProfile(profile = state.userProfile) {
  if (!profile?.restaurantId) return false;
  const type = getBusinessProfileType(profile);
  if (!type) return true;
  return LEAD_TYPE_ORDER.includes(type);
}

function normalizeOptionList(value) {
  const values = [];
  const add = (entry) => {
    const str = String(entry || "").trim();
    if (!str) return;
    const normalized = str.replace(/\s+/g, " ");
    if (!values.some((item) => item.toLowerCase() === normalized.toLowerCase())) {
      values.push(normalized);
    }
  };
  if (Array.isArray(value)) {
    value.forEach((entry) => {
      if (entry && typeof entry === "object") {
        add(entry.label || entry.name || entry.value || "");
      } else {
        add(entry);
      }
    });
    return values;
  }
  String(value || "")
    .split(/[\n,;|]+/)
    .forEach(add);
  return values;
}

function buildShopVariantKey(itemId, { size = "", color = "" } = {}) {
  const baseId = String(itemId || "").trim();
  const sizeKey = String(size || "").trim().toLowerCase();
  const colorKey = String(color || "").trim().toLowerCase();
  return `${baseId}::${sizeKey || "-"}::${colorKey || "-"}`;
}

function normalizeShopCartState(raw) {
  const base = createEmptyShopCart();
  const source = raw && typeof raw === "object" ? raw : {};
  const items = (Array.isArray(source.items) ? source.items : []).map((item) => ({
    id: String(item?.id || item?.itemId || "").trim(),
    itemId: String(item?.itemId || item?.id || "").trim(),
    cartKey: String(
      item?.cartKey
      || buildShopVariantKey(item?.itemId || item?.id || "", {
        size: item?.selectedSize || item?.size || "",
        color: item?.selectedColor || item?.color || ""
      })
    ).trim(),
    name: String(item?.name || "Produkt").trim() || "Produkt",
    price: String(item?.price ?? "").trim(),
    quantity: Math.max(1, Number(item?.quantity || 1) || 1),
    imageUrl: String(item?.imageUrl || "").trim(),
    category: String(item?.category || "").trim(),
    selectedSize: String(item?.selectedSize || item?.size || "").trim(),
    selectedColor: String(item?.selectedColor || item?.color || "").trim(),
    cropX: clampCropPercent(item?.cropX ?? 50, 50),
    cropY: clampCropPercent(item?.cropY ?? 50, 50)
  })).filter((item) => item.id && item.itemId && item.cartKey);
  return {
    ...base,
    restaurantId: String(source.restaurantId || "").trim(),
    businessName: String(source.businessName || "").trim(),
    businessAvatar: String(source.businessAvatar || "").trim(),
    items,
    checkoutOpen: !!source.checkoutOpen,
    form: {
      name: String(source.form?.name || "").trim(),
      phone: String(source.form?.phone || "").trim(),
      city: String(source.form?.city || "").trim(),
      address: String(source.form?.address || "").trim()
    },
    status: String(source.status || "").trim(),
    loading: !!source.loading
  };
}

function saveShopCartToStorage(uid = state.user?.uid || "") {
  const key = shopCartKey(uid);
  if (!key) return;
  try {
    const payload = normalizeShopCartState(state.shopCart);
    payload.status = "";
    payload.loading = false;
    safeStorage.setItem(key, JSON.stringify(payload));
  } catch {}
}

function getCartCountForRestaurant(restaurantId = "") {
  const safeRestaurantId = String(restaurantId || "").trim();
  if (!safeRestaurantId || String(state.shopCart?.restaurantId || "").trim() !== safeRestaurantId) return 0;
  return (state.shopCart.items || []).reduce((sum, item) => sum + Math.max(0, Number(item?.quantity || 0) || 0), 0);
}

function canAddToShopCart(profile = state.profileView?.profile || state.userProfile) {
  const restaurantId = String(profile?.restaurantId || "").trim();
  if (!state.user || !restaurantId || !isShopCatalogProfile(profile)) return false;
  if (state.userProfile?.restaurantId && String(state.userProfile.restaurantId).trim() === restaurantId) return false;
  return true;
}

function normalizeMenuType(value) {
  const t = String(value || "").toLowerCase().trim();
  if (t === "drink" || t === "drinks" || t === "beverage" || t === "getraenke" || t === "getränke") return "drink";
  return "food";
}

function formatPrice(value, currency = "€") {
  if (value === null || value === undefined || value === "") return "-";
  const num = Number(value);
  if (Number.isFinite(num)) return `${num.toFixed(2)} ${currency}`;
  const str = String(value).trim();
  return str ? `${str} ${currency}` : "-";
}

function parsePriceValue(value) {
  const raw = String(value ?? "").trim();
  if (!raw) return 0;
  const normalized = raw.replace(/[^0-9,.-]/g, "").replace(",", ".");
  const num = Number(normalized);
  return Number.isFinite(num) ? num : 0;
}

function normalizeMenuItemDoc(data, id) {
  const d = data || {};
  const looksLikeImageString = (value) => {
    const str = String(value || "").trim();
    if (!str) return false;
    const lower = str.toLowerCase();
    if (lower.startsWith("http://") || lower.startsWith("https://") || lower.startsWith("data:") || lower.startsWith("blob:") || lower.startsWith("gs://")) return true;
    if (lower.startsWith("media/") || lower.startsWith("social/") || lower.startsWith("menu/")) return true;
    return /\.(avif|webp|png|jpe?g|gif|svg|bmp|tiff?)(\?.*)?$/i.test(str);
  };
  const normalizeImg = (value, depth = 0, seen = new WeakSet()) => {
    if (!value) return "";
    if (typeof value === "string") {
      const cleaned = value.trim();
      if (!cleaned) return "";
      const lower = cleaned.toLowerCase();
      if (lower === "null" || lower === "undefined" || lower === "data") return "";
      if ((cleaned.startsWith("{") && cleaned.endsWith("}")) || (cleaned.startsWith("[") && cleaned.endsWith("]"))) {
        try {
          const parsed = JSON.parse(cleaned);
          return normalizeImg(parsed, depth + 1, seen);
        } catch {}
      }
      return cleaned;
    }
    if (typeof value === "object") {
      if (seen.has(value)) return "";
      seen.add(value);
      const candidate = value.url
        || value.src
        || value.imageUrl
        || value.imageURL
        || value.image_url
        || value.imagePath
        || value.image_path
        || value.imageSrc
        || value.image_src
        || value.path
        || value.cdnUrl
        || value.cdnURL
        || value.downloadURL
        || value.downloadUrl
        || value.photoUrl
        || value.photoURL
        || value.photo_url
        || value.picture
        || value.pictureUrl
        || value.pictureURL
        || value.photo
        || value.img
        || value.imgUrl
        || value.imgURL
        || value.img_src
        || value.imgSrc
        || value.thumbnail
        || value.thumbnailUrl
        || value.thumbnailURL
        || value.thumb
        || value.original
        || value.file
        || value.fileUrl
        || value.fileURL
        || value.publicUrl
        || value.publicURL
        || value.secure_url
        || value.secureUrl;
      const resolved = normalizeImg(candidate, depth + 1, seen);
      if (resolved) return resolved;
      if (depth < 2) {
        for (const val of Object.values(value)) {
          if (typeof val === "string" && looksLikeImageString(val)) {
            const found = normalizeImg(val, depth + 1, seen);
            if (found) return found;
          } else if (val && typeof val === "object") {
            const found = normalizeImg(val, depth + 1, seen);
            if (found) return found;
          }
        }
      }
      return "";
    }
    return "";
  };
  const rawImages = [];
  [d.imageUrls, d.images, d.image, d.gallery, d.photos, d.media, d.mediaUrls, d.photoUrls, d.pictureUrls].forEach((list) => {
    if (Array.isArray(list)) {
      rawImages.push(...list);
    } else if (typeof list === "string" && list.trim()) {
      rawImages.push(list);
    }
  });
  const primaryImage = normalizeImg(
    d.imageUrl
      || d.imageURL
      || d.image_url
      || d.image
      || d.photoUrl
      || d.photoURL
      || d.photo_url
      || d.img
      || d.imgUrl
      || d.imgURL
      || d.thumbnail
      || d.thumb
      || d.cover
      || d.coverUrl
      || d.coverURL
      || ""
  );
  const mergedImages = Array.from(new Set([primaryImage, ...rawImages.map(normalizeImg)].filter(Boolean)));
  const sizes = normalizeOptionList(d.sizes || d.sizeOptions || d.availableSizes || d.variants || d.size);
  const colors = normalizeOptionList(d.colors || d.colours || d.colorOptions || d.availableColors || d.color);
  const stockRaw = d.stock ?? d.stockCount ?? d.inventory ?? d.quantity ?? "";
  const stockNumber = Number(stockRaw);
  const crop = getMenuItemCrop(d);
  return {
    id: d.id || id || "",
    type: normalizeMenuType(d.type || d.menuType || d.kind || d.group || d.section),
    category: d.category || "Sonstiges",
    name: d.name || d.title || "Produkt",
    description: d.description || d.desc || "",
    longDescription: d.longDescription || "",
    allergens: d.allergens || d.allergen || "",
    brand: String(d.brand || d.manufacturer || "").trim(),
    sku: String(d.sku || d.articleNumber || d.articleNo || d.code || "").trim(),
    stock: stockRaw === "" || stockRaw === null || stockRaw === undefined
      ? null
      : (Number.isFinite(stockNumber) ? Math.max(0, Math.round(stockNumber)) : null),
    sizes,
    colors,
    cropX: crop.x,
    cropY: crop.y,
    price: d.price ?? "",
    available: d.available !== false,
    imageUrl: mergedImages[0] || "",
    imageUrls: mergedImages
  };
}

function foldMenuText(value) {
  try {
    return String(value || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  } catch {
    return String(value || "").toLowerCase();
  }
}

function inferMenuTypeHint(value) {
  const raw = foldMenuText(value).trim();
  if (!raw) return "";
  if (raw.includes("drink") || raw.includes("beverage") || raw.includes("getraenk") || raw.includes("getranke") || raw.includes("getraenke")) return "drink";
  if (raw.includes("kafe") || raw.includes("cafe") || raw.includes("coffee") || raw.includes("tea") || raw.includes("pije")) return "drink";
  if (raw.includes("speise") || raw.includes("speisen") || raw.includes("food")) return "food";
  return "";
}

function coerceMenuItemsFromData(data) {
  const items = [];
  const seen = new Set();

  const addItems = (list, typeHint = "", categoryHint = "") => {
    if (!Array.isArray(list)) return;
    list.forEach((raw, idx) => {
      if (!raw) return;
      const obj = typeof raw === "string" ? { name: raw } : raw;
      if (!obj || typeof obj !== "object" || Array.isArray(obj)) return;
      if (categoryHint && !obj.category && !obj.categoryName && !obj.cat) obj.category = categoryHint;
      if (typeHint && !obj.type && !obj.menuType && !obj.kind && !obj.section && !obj.group) obj.type = typeHint;

      const baseKey = String(obj.id || obj._id || obj.menuItemId || obj.name || obj.title || obj.product || "");
      const key = baseKey ? `${baseKey}|${obj.price ?? ""}|${obj.category || ""}` : `idx_${items.length}_${idx}`;
      if (seen.has(key)) return;
      seen.add(key);

      const normalized = normalizeMenuItemDoc(obj, obj.id || obj._id || obj.menuItemId || `item_${items.length}`);
      items.push(normalized);
    });
  };

  const addBuckets = (obj) => {
    if (!obj || typeof obj !== "object" || Array.isArray(obj)) return;
    Object.entries(obj).forEach(([key, val]) => {
      if (!Array.isArray(val)) return;
      const hint = inferMenuTypeHint(key);
      addItems(val, hint, key);
    });
  };

  if (!data) return items;
  if (Array.isArray(data)) {
    addItems(data);
    return items;
  }

  addItems(data.items);
  addItems(data.menuItems);
  addItems(data.menu);
  addItems(data.speisekarte);
  addItems(data.food || data.foodItems || data.speisen || data.speise, "food");
  addItems(data.drinks || data.drinkItems || data.getraenke || data.getranke || data.beverages, "drink");

  if (data.menu && typeof data.menu === "object" && !Array.isArray(data.menu)) {
    const m = data.menu;
    addItems(m.items);
    addItems(m.menuItems);
    addItems(m.speisekarte);
    addItems(m.food || m.foodItems || m.speisen || m.speise, "food");
    addItems(m.drinks || m.drinkItems || m.getraenke || m.getranke || m.beverages, "drink");
    addBuckets(m);
  }

  if (Array.isArray(data.categories)) {
    data.categories.forEach((cat) => {
      if (!cat || typeof cat !== "object") return;
      const catName = cat.name || cat.title || cat.category || "";
      const hint = inferMenuTypeHint(cat.type || catName);
      addItems(cat.items || cat.products || cat.list, hint, catName);
    });
  }

  addBuckets(data);
  return items;
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

function focusInputById(id) {
  const input = document.getElementById(id);
  if (!input) return;
  input.focus({ preventScroll: true });
  const len = String(input.value || "").length;
  try {
    input.setSelectionRange(len, len);
  } catch {}
}

function autosizeTextarea(el, { minHeight = 56, maxHeight = 160 } = {}) {
  if (!(el instanceof HTMLTextAreaElement)) return;
  el.style.height = "auto";
  const next = Math.max(minHeight, Math.min(maxHeight, el.scrollHeight || minHeight));
  el.style.height = `${next}px`;
}

function clampCropPercent(value, fallback = 50) {
  const num = Number(value);
  if (!Number.isFinite(num)) return fallback;
  return Math.max(0, Math.min(100, Math.round(num)));
}

function getMenuItemCrop(item) {
  return {
    x: clampCropPercent(item?.cropX ?? item?.focusX ?? item?.imageFocusX ?? 50, 50),
    y: clampCropPercent(item?.cropY ?? item?.focusY ?? item?.imageFocusY ?? 50, 50)
  };
}

function getMenuItemObjectPosition(item) {
  const crop = getMenuItemCrop(item);
  return `${crop.x}% ${crop.y}%`;
}

function getMenuModalCrop() {
  return {
    x: clampCropPercent(state.menuModal?.cropX ?? 50, 50),
    y: clampCropPercent(state.menuModal?.cropY ?? 50, 50)
  };
}

function syncMenuModalCropPreview() {
  const preview = document.getElementById("menuItemHeroPreview");
  const crop = getMenuModalCrop();
  if (preview) {
    preview.style.objectPosition = `${crop.x}% ${crop.y}%`;
  }
  const xValue = document.getElementById("menuCropXValue");
  const yValue = document.getElementById("menuCropYValue");
  if (xValue) xValue.textContent = `${crop.x}%`;
  if (yValue) yValue.textContent = `${crop.y}%`;
}

function getFocusItemCrop(item) {
  return {
    x: clampCropPercent(item?.cropX ?? item?.focusX ?? 50, 50),
    y: clampCropPercent(item?.cropY ?? item?.focusY ?? 50, 50)
  };
}

function getFocusItemObjectPosition(item) {
  const crop = getFocusItemCrop(item);
  return `${crop.x}% ${crop.y}%`;
}

function getFocusModalCrop() {
  return {
    x: clampCropPercent(state.focusModal?.cropX ?? 50, 50),
    y: clampCropPercent(state.focusModal?.cropY ?? 50, 50)
  };
}

function syncFocusModalCropPreview() {
  const preview = document.getElementById("focusHeroPreview");
  const crop = getFocusModalCrop();
  if (preview) {
    preview.style.objectPosition = `${crop.x}% ${crop.y}%`;
  }
  const xValue = document.getElementById("focusCropXValue");
  const yValue = document.getElementById("focusCropYValue");
  if (xValue) xValue.textContent = `${crop.x}%`;
  if (yValue) yValue.textContent = `${crop.y}%`;
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

function syncPrivateSettingFromProfile(value) {
  const nextValue = !!value;
  if (state.settings.privateAccount === nextValue) return;
  state.settings = { ...state.settings, privateAccount: nextValue };
  saveSettings(state.settings);
}

function getFollowDocId(targetType, targetId, handle) {
  return `${targetType || "handle"}_${targetId || handle}`;
}

function applyFollowingHandles(handles, { shouldRender = true } = {}) {
  const nextHandles = Array.from(new Set(
    (Array.isArray(handles) ? handles : [])
      .map((item) => String(item || "").replace(/^@/, "").trim())
      .filter(Boolean)
  ));
  const prevKey = state.followingHandles.join("|");
  const nextKey = nextHandles.join("|");
  state.followingHandles = nextHandles;
  state.pendingFollowRequests = state.pendingFollowRequests.filter((handle) => !nextHandles.includes(handle));
  if (state.profileModal.profile) {
    const modalHandle = String(state.profileModal.profile.handle || "").replace(/^@/, "");
    if (modalHandle && nextHandles.includes(modalHandle)) {
      state.profileModal.profile.pendingFollowRequest = false;
    }
  }
  if (state.profileView?.profile) {
    const viewHandle = String(state.profileView.profile.handle || "").replace(/^@/, "");
    if (viewHandle && nextHandles.includes(viewHandle)) {
      state.profileView.profile.pendingFollowRequest = false;
    }
  }
  saveFollowing(nextHandles);
  if (!shouldRender || prevKey === nextKey || lastRenderMode !== "main") return;
  render();
}

function chatIndexStorageKey(uid = state.user?.uid || "") {
  const safeUid = String(uid || "").trim();
  return safeUid ? `${STORAGE_KEYS.chatIndex}::${safeUid}` : "";
}

function saveChatThreadIndex(threads) {
  const key = chatIndexStorageKey();
  if (!key) return;
  try {
    safeStorage.setItem(key, JSON.stringify((Array.isArray(threads) ? threads : []).slice(0, 100)));
  } catch {}
}

function readChatThreadIndexList(key) {
  if (!key) return [];
  try {
    const raw = safeStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function buildChatThreadSummaryFromMessages(threadId, value, fallback = {}) {
  const safeThreadId = String(threadId || "").replace(/^@/, "").trim();
  if (!safeThreadId) return null;
  const meta = value && typeof value === "object" && !Array.isArray(value) ? value : {};
  const rawMessages = Array.isArray(value)
    ? value
    : (Array.isArray(meta.messages) ? meta.messages : []);
  const messages = pruneChatMessages(rawMessages);
  const lastMessage = messages[messages.length - 1] || null;
  const unreadCount = messages.filter((message) => message?.from !== "self" && !message?.read).length;
  return {
    id: safeThreadId,
    uid: String(meta.uid || fallback.uid || safeThreadId).trim(),
    restaurantId: String(meta.restaurantId || fallback.restaurantId || "").trim(),
    handle: String(meta.handle || fallback.handle || safeThreadId).replace(/^@/, "").trim(),
    name: String(meta.name || fallback.name || safeThreadId).trim() || safeThreadId,
    avatar: String(meta.avatar || fallback.avatar || "").trim(),
    lastMessage: buildChatPreviewText(lastMessage),
    updatedAt: lastMessage ? getChatMessageTimestamp(lastMessage) : Number(meta.updatedAt || fallback.updatedAt || Date.now()),
    unreadCount
  };
}

function rebuildLegacyChatThreadIndexFromStorage() {
  const threads = [];
  if (typeof localStorage === "undefined") return threads;
  const legacyPrefix = `${STORAGE_KEYS.chatThreads}::`;
  try {
    const rawMap = localStorage.getItem(STORAGE_KEYS.chatThreads);
    if (rawMap) {
      try {
        const parsedMap = JSON.parse(rawMap);
        if (parsedMap && typeof parsedMap === "object" && !Array.isArray(parsedMap)) {
          Object.entries(parsedMap).forEach(([threadId, value]) => {
            const summary = buildChatThreadSummaryFromMessages(threadId, value);
            if (summary) threads.push(summary);
          });
        }
      } catch {}
    }
    for (let i = 0; i < localStorage.length; i += 1) {
      const key = localStorage.key(i);
      if (!key || !key.startsWith(legacyPrefix)) continue;
      const suffix = key.slice(legacyPrefix.length).trim();
      if (!suffix || suffix.includes("::")) continue;
      const summary = buildChatThreadSummaryFromMessages(suffix, (() => {
        try {
          const raw = localStorage.getItem(key);
          return raw ? JSON.parse(raw) : [];
        } catch {
          return [];
        }
      })());
      if (summary) threads.push(summary);
    }
  } catch {}
  return sortChatThreads(threads);
}

function mergeChatThreadLists(...lists) {
  const byId = new Map();
  lists.flat().forEach((thread) => {
    if (!thread || typeof thread !== "object") return;
    const rawId = String(thread.id || thread.uid || thread.restaurantId || thread.handle || "").replace(/^@/, "").trim();
    if (!rawId) return;
    const existing = byId.get(rawId) || {};
    byId.set(rawId, {
      ...existing,
      ...thread,
      id: rawId,
      uid: String(thread.uid || existing.uid || rawId).trim(),
      restaurantId: String(thread.restaurantId || existing.restaurantId || "").trim(),
      handle: String(thread.handle || existing.handle || rawId).replace(/^@/, "").trim(),
      name: String(thread.name || existing.name || rawId).trim() || rawId,
      avatar: String(thread.avatar || existing.avatar || "").trim(),
      lastMessage: String(thread.lastMessage || existing.lastMessage || "").trim(),
      unreadCount: Math.max(0, Number(thread.unreadCount ?? existing.unreadCount ?? 0) || 0),
      updatedAt: Number(thread.updatedAt || existing.updatedAt || 0) || 0
    });
  });
  return sortChatThreads(Array.from(byId.values()));
}

function loadChatThreadIndex(uid = state.user?.uid || "") {
  const key = chatIndexStorageKey(uid);
  const scopedIndex = readChatThreadIndexList(key);
  const legacyIndex = readChatThreadIndexList(STORAGE_KEYS.chatIndex);
  const scopedThreads = rebuildChatThreadIndexFromStorage(uid);
  const legacyThreads = rebuildLegacyChatThreadIndexFromStorage();
  return mergeChatThreadLists(scopedThreads, legacyThreads, legacyIndex, scopedIndex);
}

function sortChatThreads(threads) {
  return (Array.isArray(threads) ? threads.slice() : [])
    .sort((a, b) => (Number(b?.updatedAt || 0) - Number(a?.updatedAt || 0)));
}

function rebuildChatThreadIndexFromStorage(uid = state.user?.uid || "") {
  const safeUid = String(uid || "").trim();
  if (!safeUid || typeof localStorage === "undefined") return [];
  const prefix = `${STORAGE_KEYS.chatThreads}::${safeUid}::`;
  const threads = [];
  try {
    for (let i = 0; i < localStorage.length; i += 1) {
      const key = localStorage.key(i);
      if (!key || !key.startsWith(prefix)) continue;
      const threadId = key.slice(prefix.length).trim();
      if (!threadId) continue;
      let messages = [];
      try {
        const raw = localStorage.getItem(key);
        const parsed = raw ? JSON.parse(raw) : [];
        messages = pruneChatMessages(Array.isArray(parsed) ? parsed : []);
      } catch {
        messages = [];
      }
      const lastMessage = messages[messages.length - 1] || null;
      const unreadCount = messages.filter((message) => message?.from !== "self" && !message?.read).length;
      threads.push({
        id: threadId,
        uid: threadId,
        restaurantId: "",
        handle: threadId,
        name: threadId,
        avatar: "",
        lastMessage: buildChatPreviewText(lastMessage),
        updatedAt: lastMessage ? getChatMessageTimestamp(lastMessage) : Date.now(),
        unreadCount
      });
    }
  } catch {}
  return sortChatThreads(threads);
}

function getChatUnreadCount() {
  return (state.chatThreads || []).reduce((sum, thread) => {
    const count = Number(thread?.unreadCount || 0);
    return sum + (Number.isFinite(count) ? count : 0);
  }, 0);
}

function upsertChatThread(profile, patch = {}) {
  if (!profile) return;
  const threadId = getChatThreadId(profile);
  if (!threadId) return;
  const existingThread = (state.chatThreads || []).find((item) => String(item?.id || "") === threadId) || null;
  const nextThread = {
    id: threadId,
    uid: profile.uid || "",
    restaurantId: profile.restaurantId || "",
    handle: String(profile.handle || normalizeHandle(profile.name || "user")).replace(/^@/, ""),
    name: profile.name || "User",
    avatar: profile.avatar || "",
    lastMessage: "",
    unreadCount: Number(existingThread?.unreadCount || 0),
    updatedAt: Date.now(),
    ...patch
  };
  const existing = Array.isArray(state.chatThreads) ? state.chatThreads : [];
  const rest = existing.filter((item) => String(item?.id || "") !== threadId);
  state.chatThreads = sortChatThreads([nextThread, ...rest]);
  saveChatThreadIndex(state.chatThreads);
}

function getChatThreadId(profile = state.chatModal.profile) {
  return String(profile?.uid || profile?.restaurantId || profile?.handle || profile?.id || "").replace(/^@/, "").trim();
}

function chatThreadStorageKey(profile = state.chatModal.profile) {
  const threadId = getChatThreadId(profile);
  const ownerUid = String(state.user?.uid || "guest").trim();
  if (!threadId || !ownerUid) return "";
  return `${STORAGE_KEYS.chatThreads}::${ownerUid}::${threadId}`;
}

function chatThreadDocRef(ownerUid, threadId) {
  const safeOwnerUid = String(ownerUid || "").trim();
  const safeThreadId = String(threadId || "").replace(/^@/, "").trim();
  if (!safeOwnerUid || !safeThreadId) return null;
  return doc(db, "users", safeOwnerUid, "chatThreads", safeThreadId);
}

function chatMessageDocRef(ownerUid, threadId, messageId) {
  const safeOwnerUid = String(ownerUid || "").trim();
  const safeThreadId = String(threadId || "").replace(/^@/, "").trim();
  const safeMessageId = String(messageId || "").trim();
  if (!safeOwnerUid || !safeThreadId || !safeMessageId) return null;
  return doc(db, "users", safeOwnerUid, "chatThreads", safeThreadId, "messages", safeMessageId);
}

function chatMessagesCollectionRef(ownerUid, threadId) {
  const safeOwnerUid = String(ownerUid || "").trim();
  const safeThreadId = String(threadId || "").replace(/^@/, "").trim();
  if (!safeOwnerUid || !safeThreadId) return null;
  return collection(db, "users", safeOwnerUid, "chatThreads", safeThreadId, "messages");
}

function normalizeChatThreadSummary(threadId, data = {}, fallback = {}) {
  const safeThreadId = String(threadId || "").replace(/^@/, "").trim();
  if (!safeThreadId) return null;
  const source = data && typeof data === "object" ? data : {};
  const updatedAt = toDateSafe(source.updatedAt || source.updatedAtClient)?.getTime()
    || Number(source.updatedAtMs || fallback.updatedAt || 0)
    || Date.now();
  return {
    id: safeThreadId,
    uid: String(source.uid || fallback.uid || safeThreadId).trim(),
    restaurantId: String(source.restaurantId || fallback.restaurantId || "").trim(),
    handle: String(source.handle || fallback.handle || safeThreadId).replace(/^@/, "").trim(),
    name: String(source.name || fallback.name || safeThreadId).trim() || safeThreadId,
    avatar: String(source.avatar || fallback.avatar || "").trim(),
    lastMessage: String(source.lastMessage || fallback.lastMessage || "").trim(),
    unreadCount: Math.max(0, Number(source.unreadCount ?? fallback.unreadCount ?? 0) || 0),
    updatedAt
  };
}

function getCurrentChatSenderProfile() {
  const handle = String(state.userProfile.handle || normalizeHandle(state.userProfile.name || state.user?.displayName || "user"))
    .replace(/^@/, "")
    .trim();
  return {
    uid: String(state.user?.uid || "").trim(),
    handle,
    name: String(state.userProfile.name || state.user?.displayName || "User").trim() || "User",
    avatar: String(state.userProfile.avatar || "").trim()
  };
}

function sanitizeChatAttachmentsForSync(attachments) {
  return (Array.isArray(attachments) ? attachments : []).slice(0, 4).map((attachment, index) => {
    const rawDataUrl = String(attachment?.dataUrl || "");
    const inlineDataUrl = rawDataUrl && rawDataUrl.length <= 250000 ? rawDataUrl : "";
    return {
      id: String(attachment?.id || `att_${index}`).trim() || `att_${index}`,
      name: String(attachment?.name || "Datei").trim() || "Datei",
      mime: String(attachment?.mime || "application/octet-stream").trim() || "application/octet-stream",
      kind: String(attachment?.kind || "file").trim() || "file",
      dataUrl: inlineDataUrl,
      size: Math.max(0, Number(attachment?.size || 0) || 0),
      oversize: !!attachment?.oversize || (!inlineDataUrl && !!rawDataUrl)
    };
  });
}

function normalizeChatMessageRecord(messageId, data = {}, localMap = new Map()) {
  const safeMessageId = String(messageId || "").trim();
  if (!safeMessageId) return null;
  const source = data && typeof data === "object" ? data : {};
  const local = localMap.get(safeMessageId) || {};
  const sourceAttachments = Array.isArray(source.attachments) ? source.attachments : [];
  const localAttachments = Array.isArray(local.attachments) ? local.attachments : [];
  const localAttachmentMap = new Map(localAttachments.map((attachment) => [String(attachment?.id || "").trim(), attachment]));
  const mergedAttachments = (sourceAttachments.length ? sourceAttachments : localAttachments).slice(0, 4).map((attachment, index) => {
    const safeAttachmentId = String(attachment?.id || `att_${index}`).trim() || `att_${index}`;
    const localAttachment = localAttachmentMap.get(safeAttachmentId) || {};
    const rawDataUrl = String(attachment?.dataUrl || localAttachment?.dataUrl || "");
    const inlineDataUrl = rawDataUrl && rawDataUrl.length <= 250000 ? rawDataUrl : "";
    return {
      id: safeAttachmentId,
      name: String(attachment?.name || localAttachment?.name || "Datei").trim() || "Datei",
      mime: String(attachment?.mime || localAttachment?.mime || "application/octet-stream").trim() || "application/octet-stream",
      kind: String(attachment?.kind || localAttachment?.kind || "file").trim() || "file",
      dataUrl: inlineDataUrl,
      size: Math.max(0, Number(attachment?.size || localAttachment?.size || 0) || 0),
      oversize: !!attachment?.oversize || !!localAttachment?.oversize || (!inlineDataUrl && !!rawDataUrl)
    };
  });
  return {
    id: safeMessageId,
    from: String(source.from || local.from || "other") === "self" ? "self" : "other",
    text: String(source.text || local.text || ""),
    attachments: mergedAttachments,
    liked: typeof local.liked === "boolean" ? local.liked : !!source.liked,
    saved: typeof local.saved === "boolean" ? local.saved : !!source.saved,
    read: !!source.read,
    createdAt: source.createdAt || source.createdAtClient || local.createdAt || new Date().toISOString()
  };
}

function getChatMessageTimestamp(message) {
  return toDateSafe(message?.createdAt)?.getTime() || 0;
}

function pruneChatMessages(messages) {
  const now = Date.now();
  return (Array.isArray(messages) ? messages : []).filter((message) => {
    if (!message) return false;
    if (message.saved) return true;
    const createdAt = getChatMessageTimestamp(message);
    if (!createdAt) return false;
    return (now - createdAt) <= CHAT_MESSAGE_TTL_MS;
  });
}

function buildChatPreviewText(message) {
  if (!message) return "";
  const text = String(message.text || "").trim();
  if (text) return text;
  const count = Array.isArray(message.attachments) ? message.attachments.length : 0;
  if (!count) return "Chat";
  return count === 1 ? "1 Anhang" : `${count} Anhaenge`;
}

function loadLegacyChatThreadMessages(threadId) {
  const safeThreadId = String(threadId || "").replace(/^@/, "").trim();
  if (!safeThreadId || typeof localStorage === "undefined") return [];
  try {
    const legacyKey = `${STORAGE_KEYS.chatThreads}::${safeThreadId}`;
    const rawThread = localStorage.getItem(legacyKey);
    if (rawThread) {
      try {
        const parsedThread = JSON.parse(rawThread);
        if (Array.isArray(parsedThread)) {
          return pruneChatMessages(parsedThread);
        }
        if (parsedThread && typeof parsedThread === "object" && Array.isArray(parsedThread.messages)) {
          return pruneChatMessages(parsedThread.messages);
        }
      } catch {}
    }
    const rawMap = localStorage.getItem(STORAGE_KEYS.chatThreads);
    if (!rawMap) return [];
    const parsedMap = JSON.parse(rawMap);
    const entry = parsedMap && typeof parsedMap === "object" ? parsedMap[safeThreadId] : null;
    if (Array.isArray(entry)) return pruneChatMessages(entry);
    if (entry && typeof entry === "object" && Array.isArray(entry.messages)) {
      return pruneChatMessages(entry.messages);
    }
  } catch {}
  return [];
}

async function readFileAsDataUrl(file) {
  return await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(reader.error || new Error("file_read_failed"));
    reader.readAsDataURL(file);
  });
}

function loadChatThreadMessages(profile) {
  const key = chatThreadStorageKey(profile);
  if (key) {
    try {
      const raw = safeStorage.getItem(key);
      if (raw !== null) {
        const parsed = JSON.parse(raw);
        const list = Array.isArray(parsed) ? parsed : [];
        const next = pruneChatMessages(list);
        if (next.length !== list.length) {
          safeStorage.setItem(key, JSON.stringify(next.slice(-100)));
        }
        return next;
      }
    } catch {
      return [];
    }
  }
  const legacyMessages = loadLegacyChatThreadMessages(getChatThreadId(profile));
  if (legacyMessages.length && key) {
    try {
      safeStorage.setItem(key, JSON.stringify(legacyMessages.slice(-100)));
    } catch {}
  }
  if (!legacyMessages.length) return [];
  return legacyMessages;
}

function saveChatThreadMessages(profile, messages) {
  const key = chatThreadStorageKey(profile);
  if (!key) return;
  try {
    const next = pruneChatMessages(messages);
    safeStorage.setItem(key, JSON.stringify(next.slice(-100)));
  } catch {}
}

function stopChatThreadsListener() {
  if (chatThreadsUnsub) {
    chatThreadsUnsub();
    chatThreadsUnsub = null;
  }
}

function stopActiveChatMessagesListener() {
  if (chatMessagesUnsub) {
    chatMessagesUnsub();
    chatMessagesUnsub = null;
  }
}

function syncLocalChatThreadsFromRemote(remoteThreads, ownerUid = state.user?.uid || "") {
  const merged = mergeChatThreadLists(loadChatThreadIndex(ownerUid), state.chatThreads, remoteThreads);
  state.chatThreads = merged;
  saveChatThreadIndex(merged);
  if (lastRenderMode === "main" && state.activeTab === "chat" && !state.chatModal.open) {
    render();
    return;
  }
  updateNotificationBadges();
}

function startChatThreadsListener(user = state.user) {
  stopChatThreadsListener();
  const ownerUid = String(user?.uid || "").trim();
  if (!ownerUid) return;
  const ref = collection(db, "users", ownerUid, "chatThreads");
  const threadQuery = query(ref, orderBy("updatedAt", "desc"), limit(25));
  chatThreadsUnsub = onSnapshot(threadQuery, (snap) => {
    const remoteThreads = snap.docs
      .map((docSnap) => normalizeChatThreadSummary(docSnap.id, docSnap.data() || {}))
      .filter(Boolean);
    syncLocalChatThreadsFromRemote(remoteThreads, ownerUid);
  }, (err) => {
    console.error(err);
  });
}

async function syncRemoteChatReadState(profile, messages = state.chatModal.messages || []) {
  const ownerUid = String(state.user?.uid || "").trim();
  const threadId = getChatThreadId(profile);
  if (!ownerUid || !threadId) return;
  const unreadMessages = pruneChatMessages(messages).filter((message) => message?.from !== "self" && !message?.read);
  if (!unreadMessages.length) {
    const threadRef = chatThreadDocRef(ownerUid, threadId);
    if (!threadRef) return;
    try {
      await setDoc(threadRef, { unreadCount: 0 }, { merge: true });
    } catch {}
    return;
  }
  const threadRef = chatThreadDocRef(ownerUid, threadId);
  if (!threadRef) return;
  try {
    await Promise.all([
      ...unreadMessages.map((message) => {
        const messageRef = chatMessageDocRef(ownerUid, threadId, message.id);
        if (!messageRef) return Promise.resolve();
        return setDoc(messageRef, { read: true }, { merge: true });
      }),
      setDoc(threadRef, { unreadCount: 0 }, { merge: true })
    ]);
  } catch {}
}

function startActiveChatMessagesListener(profile = state.chatModal.profile) {
  stopActiveChatMessagesListener();
  const ownerUid = String(state.user?.uid || "").trim();
  const threadId = getChatThreadId(profile);
  const ref = chatMessagesCollectionRef(ownerUid, threadId);
  if (!ref) return;
  const messageQuery = query(ref, orderBy("createdAtClient", "desc"), limit(CHAT_MESSAGE_READ_LIMIT));
  chatMessagesUnsub = onSnapshot(messageQuery, (snap) => {
    if (!state.chatModal.open || getChatThreadId(state.chatModal.profile) !== threadId) return;
    const localSeed = pruneChatMessages([
      ...loadChatThreadMessages(profile),
      ...(Array.isArray(state.chatModal.messages) ? state.chatModal.messages : [])
    ]);
    if (!snap.docs.length && localSeed.length) {
      state.chatModal.messages = localSeed;
      render();
      return;
    }
    const localMap = new Map(localSeed.map((message) => [String(message?.id || "").trim(), message]));
    const remoteMessages = snap.docs
      .map((docSnap) => normalizeChatMessageRecord(docSnap.id, docSnap.data() || {}, localMap))
      .filter(Boolean)
      .sort((a, b) => getChatMessageTimestamp(a) - getChatMessageTimestamp(b));
    const hasUnreadIncoming = remoteMessages.some((message) => message?.from !== "self" && !message?.read);
    let nextMessages = remoteMessages;
    if (hasUnreadIncoming) {
      nextMessages = markChatThreadAsRead(profile, remoteMessages);
      void syncRemoteChatReadState(profile, remoteMessages);
    } else {
      saveChatThreadMessages(profile, remoteMessages);
      syncChatThreadSummary(profile, remoteMessages);
    }
    state.chatModal.messages = pruneChatMessages(nextMessages);
    render();
  }, (err) => {
    console.error(err);
  });
}

async function persistCurrentChatMessagePatch(messageId, patch = {}) {
  const ownerUid = String(state.user?.uid || "").trim();
  const threadId = getChatThreadId(state.chatModal.profile);
  const safeMessageId = String(messageId || "").trim();
  if (!ownerUid || !threadId || !safeMessageId || !patch || typeof patch !== "object") return;
  const messageRef = chatMessageDocRef(ownerUid, threadId, safeMessageId);
  if (!messageRef) return;
  try {
    await setDoc(messageRef, patch, { merge: true });
  } catch {}
}

async function syncChatMessageToRemote(message, partnerProfile = state.chatModal.profile) {
  const senderProfile = getCurrentChatSenderProfile();
  const senderUid = senderProfile.uid;
  const partnerUid = String(partnerProfile?.uid || "").trim();
  const senderThreadId = getChatThreadId(partnerProfile);
  const recipientThreadId = senderUid;
  if (!senderUid || !partnerUid || !senderThreadId || !recipientThreadId || senderUid === partnerUid) return;

  const safeAttachments = sanitizeChatAttachmentsForSync(message?.attachments);
  const preview = buildChatPreviewText({ text: String(message?.text || ""), attachments: safeAttachments });
  const createdAtClient = String(message?.createdAt || new Date().toISOString());
  const senderThreadRef = chatThreadDocRef(senderUid, senderThreadId);
  const senderMessageRef = chatMessageDocRef(senderUid, senderThreadId, message?.id);
  const recipientThreadRef = chatThreadDocRef(partnerUid, recipientThreadId);
  const recipientMessageRef = chatMessageDocRef(partnerUid, recipientThreadId, message?.id);
  if (!senderThreadRef || !senderMessageRef || !recipientThreadRef || !recipientMessageRef) return;

  const senderPayload = {
    id: String(message?.id || "").trim(),
    from: "self",
    text: String(message?.text || ""),
    attachments: safeAttachments,
    liked: !!message?.liked,
    saved: !!message?.saved,
    read: true,
    senderUid,
    createdAt: serverTimestamp(),
    createdAtClient
  };
  const recipientPayload = {
    id: String(message?.id || "").trim(),
    from: "other",
    text: String(message?.text || ""),
    attachments: safeAttachments,
    liked: false,
    saved: false,
    read: false,
    senderUid,
    senderHandle: senderProfile.handle,
    senderName: senderProfile.name,
    senderAvatar: senderProfile.avatar,
    createdAt: serverTimestamp(),
    createdAtClient
  };

  await Promise.all([
    setDoc(senderThreadRef, {
      uid: partnerUid,
      restaurantId: String(partnerProfile?.restaurantId || "").trim(),
      handle: String(partnerProfile?.handle || "").replace(/^@/, "").trim(),
      name: String(partnerProfile?.name || "User").trim() || "User",
      avatar: String(partnerProfile?.avatar || "").trim(),
      lastMessage: preview,
      unreadCount: 0,
      updatedAt: serverTimestamp(),
      updatedAtClient: createdAtClient
    }, { merge: true }),
    setDoc(senderMessageRef, senderPayload, { merge: true })
  ]);

  await runTransaction(db, async (tx) => {
    const recipientSnap = await tx.get(recipientThreadRef);
    const recipientUnread = Math.max(0, Number(recipientSnap.exists() ? recipientSnap.data()?.unreadCount : 0) || 0);
    tx.set(recipientThreadRef, {
      uid: senderUid,
      restaurantId: "",
      handle: senderProfile.handle,
      name: senderProfile.name,
      avatar: senderProfile.avatar,
      lastMessage: preview,
      unreadCount: recipientUnread + 1,
      updatedAt: serverTimestamp(),
      updatedAtClient: createdAtClient
    }, { merge: true });
    tx.set(recipientMessageRef, recipientPayload, { merge: true });
  });
}

function syncChatThreadSummary(profile, messages) {
  if (!profile) return;
  const threadId = getChatThreadId(profile);
  const existing = (state.chatThreads || []).find((item) => String(item?.id || "") === threadId) || null;
  const list = pruneChatMessages(messages);
  const lastMessage = list[list.length - 1] || null;
  upsertChatThread(profile, {
    lastMessage: buildChatPreviewText(lastMessage),
    updatedAt: lastMessage
      ? Math.max(getChatMessageTimestamp(lastMessage), Number(existing?.updatedAt || 0))
      : Number(existing?.updatedAt || Date.now())
  });
}

function markChatThreadAsRead(profile, messages = null) {
  if (!profile) return [];
  const threadId = getChatThreadId(profile);
  const existing = (state.chatThreads || []).find((item) => String(item?.id || "") === threadId) || null;
  const currentMessages = pruneChatMessages(Array.isArray(messages) ? messages : loadChatThreadMessages(profile));
  let changed = false;
  const nextMessages = currentMessages.map((message) => {
    if (message?.from !== "self" && !message?.read) {
      changed = true;
      return { ...message, read: true };
    }
    return message;
  });
  if (changed) {
    saveChatThreadMessages(profile, nextMessages);
  }
  const lastMessage = nextMessages[nextMessages.length - 1] || null;
  upsertChatThread(profile, {
    lastMessage: buildChatPreviewText(lastMessage),
    unreadCount: 0,
    updatedAt: lastMessage
      ? Math.max(getChatMessageTimestamp(lastMessage), Number(existing?.updatedAt || 0))
      : Number(existing?.updatedAt || Date.now())
  });
  return nextMessages;
}

function updateCurrentChatMessages(updater) {
  if (!state.chatModal.profile) return;
  const current = pruneChatMessages(state.chatModal.messages || []);
  const nextRaw = typeof updater === "function" ? updater(current) : updater;
  const nextMessages = pruneChatMessages(nextRaw);
  state.chatModal.messages = nextMessages;
  saveChatThreadMessages(state.chatModal.profile, nextMessages);
  syncChatThreadSummary(state.chatModal.profile, nextMessages);
}

async function addChatAttachments(fileList) {
  const files = Array.from(fileList || []).filter(Boolean);
  if (!files.length) return;
  const existing = Array.isArray(state.chatModal.attachments) ? state.chatModal.attachments : [];
  const slotsLeft = Math.max(0, 4 - existing.length);
  if (!slotsLeft) return;
  const selected = files.slice(0, slotsLeft);
  const nextAttachments = [];
  for (const file of selected) {
    const isImage = /^image\//i.test(String(file.type || ""));
    let dataUrl = "";
    if (Number(file.size || 0) <= CHAT_ATTACHMENT_INLINE_MAX_BYTES) {
      try {
        dataUrl = await readFileAsDataUrl(file);
      } catch {
        dataUrl = "";
      }
    }
    nextAttachments.push({
      id: `att_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      name: file.name || "Datei",
      mime: file.type || "application/octet-stream",
      kind: isImage ? "image" : "file",
      dataUrl,
      size: Number(file.size || 0),
      oversize: Number(file.size || 0) > CHAT_ATTACHMENT_INLINE_MAX_BYTES
    });
  }
  state.chatModal.attachments = [...existing, ...nextAttachments];
  render();
}

function removePendingChatAttachment(attachmentId) {
  const safeId = String(attachmentId || "");
  if (!safeId) return;
  state.chatModal.attachments = (state.chatModal.attachments || []).filter((item) => String(item?.id || "") !== safeId);
  render();
}

function toggleChatMessageSaved(messageId) {
  const safeId = String(messageId || "");
  if (!safeId) return;
  let nextSaved = null;
  updateCurrentChatMessages((messages) => messages.map((message) => (
    String(message?.id || "") === safeId
      ? (() => {
        nextSaved = !message.saved;
        return { ...message, saved: nextSaved };
      })()
      : message
  )));
  render();
  if (typeof nextSaved === "boolean") {
    void persistCurrentChatMessagePatch(safeId, { saved: nextSaved });
  }
}

function toggleChatMessageLiked(messageId) {
  const safeId = String(messageId || "");
  if (!safeId) return;
  let nextLiked = null;
  updateCurrentChatMessages((messages) => messages.map((message) => (
    String(message?.id || "") === safeId
      ? (() => {
        nextLiked = !message.liked;
        return { ...message, liked: nextLiked };
      })()
      : message
  )));
  render();
  if (typeof nextLiked === "boolean") {
    void persistCurrentChatMessagePatch(safeId, { liked: nextLiked });
  }
}

function openChatWithProfile(profile) {
  if (!state.user || !profile) return;
  const nextProfile = {
    uid: profile.uid || "",
    restaurantId: profile.restaurantId || "",
    handle: String(profile.handle || normalizeHandle(profile.name || "user")).replace(/^@/, ""),
    name: profile.name || "User",
    avatar: profile.avatar || ""
  };
  upsertChatThread(nextProfile);
  state.drawerOpen = false;
  state.profileModal = { open: false, profile: null };
  state.activeTab = "chat";
  const sameThread = state.chatModal.open && getChatThreadId(state.chatModal.profile) === getChatThreadId(nextProfile);
  const nextMessages = markChatThreadAsRead(nextProfile);
  state.chatModal = {
    open: true,
    profile: nextProfile,
    messages: nextMessages,
    draft: sameThread ? (state.chatModal.draft || "") : "",
    attachments: sameThread ? (state.chatModal.attachments || []) : []
  };
  syncChatThreadSummary(nextProfile, state.chatModal.messages);
  void syncRemoteChatReadState(nextProfile, state.chatModal.messages);
  startActiveChatMessagesListener(nextProfile);
  render();
}

function closeChatModal() {
  if (typeof document !== "undefined" && document.activeElement instanceof HTMLElement) {
    document.activeElement.blur();
  }
  stopActiveChatMessagesListener();
  state.chatModal = { ...state.chatModal, open: false, profile: null, messages: [], draft: "", attachments: [] };
  if (state.activeTab === "chat") {
    render();
  }
}

async function sendChatMessage() {
  if (!state.chatModal.open || !state.chatModal.profile) return;
  const input = document.getElementById("chatMessageInput");
  const text = String(input?.value ?? state.chatModal.draft ?? "").trim();
  const attachments = Array.isArray(state.chatModal.attachments) ? state.chatModal.attachments.slice() : [];
  if (!text && !attachments.length) return;
  const createdAt = new Date().toISOString();
  const outgoingMessage = {
    id: `msg_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    from: "self",
    text,
    attachments,
    liked: false,
    saved: false,
    read: true,
    createdAt
  };
  const nextMessages = [...(state.chatModal.messages || []), outgoingMessage];
  state.chatModal.messages = pruneChatMessages(nextMessages);
  state.chatModal.draft = "";
  state.chatModal.attachments = [];
  saveChatThreadMessages(state.chatModal.profile, state.chatModal.messages);
  upsertChatThread(state.chatModal.profile, {
    lastMessage: text || buildChatPreviewText({ attachments }),
    unreadCount: 0,
    updatedAt: getChatMessageTimestamp({ createdAt })
  });
  render();
  try {
    await syncChatMessageToRemote(outgoingMessage, state.chatModal.profile);
  } catch (err) {
    console.error(err);
  }
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

function readLeadScopeCache(uid, scope) {
  const safeUid = String(uid || "").trim();
  const safeScope = normalizeLeadScopeKey(scope);
  if (!safeUid) return null;
  return readCache(leadPageCacheKey(safeUid, safeScope), CACHE_TTL_MS.crmPages);
}

function writeLeadScopeCache(uid, scope, rows, meta = {}) {
  const safeUid = String(uid || "").trim();
  const safeScope = normalizeLeadScopeKey(scope);
  if (!safeUid || !Array.isArray(rows)) return;
  writeCache(leadPageCacheKey(safeUid, safeScope), rows, meta);
}

function readCustomerScopeCache(uid, scope) {
  const safeUid = String(uid || "").trim();
  const safeScope = normalizeCustomerScopeKey(scope);
  if (!safeUid) return null;
  return readCache(customerPageCacheKey(safeUid, safeScope), CACHE_TTL_MS.crmPages);
}

function writeCustomerScopeCache(uid, scope, rows, meta = {}) {
  const safeUid = String(uid || "").trim();
  const safeScope = normalizeCustomerScopeKey(scope);
  if (!safeUid || !Array.isArray(rows)) return;
  writeCache(customerPageCacheKey(safeUid, safeScope), rows, meta);
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
  const savedMenuLayout = safeStorage.getItem(STORAGE_KEYS.menuLayout);
  if (savedMenuLayout) {
    try { state.menuLayout = { ...DEFAULT_MENU_LAYOUT, ...JSON.parse(savedMenuLayout) }; } catch {}
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
    const cachedHydrationIds = collectFeedHydrationIds(feedCache.data, { max: 6 });
    if (cachedHydrationIds.length) {
      const needsHydrate = cachedHydrationIds.some((id) => {
        const rest = state.restaurants.find((item) => item.id === id);
        return !rest || !(rest.logoUrl || rest.logo || rest.logoURL);
      });
      if (needsHydrate) {
        suspendRender();
        Promise.resolve(hydrateRestaurantsByIds(cachedHydrationIds, { max: cachedHydrationIds.length }))
          .finally(() => resumeRender());
      } else {
        void hydrateRestaurantsByIds(cachedHydrationIds, { max: cachedHydrationIds.length });
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

  const scopedCart = safeStorage.getItem(shopCartKey(uid));
  if (scopedCart) {
    try {
      state.shopCart = normalizeShopCartState(JSON.parse(scopedCart));
    } catch {
      state.shopCart = createEmptyShopCart();
    }
  } else {
    state.shopCart = createEmptyShopCart();
  }
  state.orders = createEmptyOrdersState();

  state.chatThreads = sortChatThreads(loadChatThreadIndex(uid).map((thread) => {
    const messages = loadChatThreadMessages(thread);
    const lastMessage = messages[messages.length - 1] || null;
    return {
      ...thread,
      lastMessage: lastMessage ? buildChatPreviewText(lastMessage) : String(thread?.lastMessage || ""),
      updatedAt: lastMessage
        ? Math.max(getChatMessageTimestamp(lastMessage), Number(thread?.updatedAt || 0))
        : Number(thread?.updatedAt || Date.now())
    };
  }));
  saveChatThreadIndex(state.chatThreads);
}

function resetUserScopedState() {
  stopActiveChatMessagesListener();
  stopRestaurantMetaListeners();
  stopMenuItemMetaListeners();
  menuDetailCloseBound = false;
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
  state.chatModal = { open: false, profile: null, messages: [], draft: "", attachments: [] };
  state.postModal = { open: false, post: null, commentText: "", replyTo: null, loading: false, animate: false, sending: false };
  state.likesModal = { open: false, postId: "", animate: false };
  state.menuDetail = { open: false, item: null, index: 0, restaurantId: "", selectedSize: "", selectedColor: "", commentText: "", loading: false, sending: false };
  state.menuItemMeta = {};
  menuItemCountsRequested.clear();
  state.leads = createEmptyLeadsState();
  state.customers = createEmptyCustomersState();
  state.staff = {
    items: [],
    view: "list",
    editorUid: "",
    loading: false,
    loadingMore: false,
    hasMore: false,
    pageSize: CRM_PAGE_SIZE,
    saving: false,
    deleting: false,
    error: "",
    status: "",
    form: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      country: CEO_COUNTRIES[0],
      locationLabel: "",
      coords: null,
      avatarUrl: "",
      avatarPreview: "",
      avatarFile: null
    }
  };
  state.leadModal = { open: false, mode: "create", lead: null, status: "", loading: false, logoFile: null, logoPreview: "", coords: null, locations: [] };
  state.customerModal = { open: false, mode: "edit", customer: null, status: "", loading: false, logoFile: null, logoPreview: "" };
  state.selectedBusiness = null;
  state.followingHandles = [];
  state.pendingFollowRequests = [];
  state.chatThreads = [];
  state.shopCart = createEmptyShopCart();
  state.orders = createEmptyOrdersState();
  state.notifications = [];
  state.roleSwitchRoles = [];
  state.roleSwitchRestaurantId = "";
  state.userProfile = { ...DEFAULT_PROFILE };
  userAvatarCache = "";
  lastShellAvatarUrl = "";
  dataLoaded.profile = false;
  dataLoaded.following = false;
  dataLoaded.notifications = false;
  dataLoaded.leads = false;
  dataLoaded.customers = false;
  dataLoaded.staff = false;
}

function collectFeedHydrationIds(feedRows = [], { max = 6 } = {}) {
  if (!Array.isArray(feedRows) || !feedRows.length) return [];
  const existing = new Map((state.restaurants || []).map((rest) => [String(rest?.id || "").trim(), rest]));
  const ids = [];
  const seen = new Set();
  for (const row of feedRows) {
    if (ids.length >= max) break;
    const rid = String(row?.restaurantId || row?.rid || row?.ownerId || "").trim();
    if (!rid || seen.has(rid)) continue;
    seen.add(rid);
    const cached = existing.get(rid) || null;
    const cachedName = String(cached?.name || cached?.restaurantName || "").trim();
    const cachedLogo = String(cached?.logoUrl || cached?.logo || cached?.logoURL || "").trim();
    const rowName = String(row?.businessName || row?.restaurantName || row?.business || "").trim();
    const rowLogo = String(row?.logoUrl || row?.logo || row?.logoURL || "").trim();
    if ((cachedName && cachedLogo) || (rowName && rowLogo)) continue;
    ids.push(rid);
  }
  return ids;
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
      const stored = existing.get(rid) || {};
      let metaData = {};
      try {
        const metaSnap = await getDoc(doc(db, "restaurants", rid, "public", "meta"));
        if (metaSnap.exists()) metaData = metaSnap.data() || {};
      } catch {}

      let restData = stored;
      const currentName = metaData.name || metaData.restaurantName || stored.name || stored.restaurantName || "";
      const currentLogo = metaData.logoUrl || metaData.logo || stored.logoUrl || stored.logo || stored.logoURL || "";
      if (!currentName || !currentLogo) {
        try {
          const restSnap = await getDoc(doc(db, "restaurants", rid));
          if (restSnap.exists()) {
            restData = { ...restData, ...(restSnap.data() || {}) };
          }
        } catch {}
      }

      const name = metaData.name || metaData.restaurantName || restData.name || restData.restaurantName || "";
      const logoUrl = metaData.logoUrl || metaData.logo || restData.logoUrl || restData.logo || restData.logoURL || "";
      const city = metaData.city || restData.city || "";
      const type = normalizeRestaurantType(
        metaData.type
        || metaData.customerType
        || restData.type
        || restData.customerType
        || restData.category
        || restData.kind
        || restData.restaurantType
        || ""
      );
      if (name || logoUrl || city || type) {
        loaded.push({
          id: rid,
          name,
          restaurantName: restData.restaurantName || "",
          logoUrl,
          city,
          ...(type ? { type, customerType: type } : {})
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
  state.businessLocations = state.restaurants.flatMap((rest, idx) => buildRestaurantLocations(rest, idx));
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
  const type = normalizeRestaurantType(
    data.type
    || data.customerType
    || rest.type
    || rest.customerType
    || rest.category
    || rest.kind
    || rest.restaurantType
    || ""
  );
  return {
    ...rest,
    name: name || rest.name || "",
    restaurantName: rest.restaurantName || "",
    logoUrl,
    city: data.city || rest.city || "",
    ...(type ? { type, customerType: type } : {})
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
  void feedPosts;
  void limit;
  stopRestaurantMetaListeners();
}

async function enrichRestaurantsWithPublicMeta(restaurants) {
  if (!Array.isArray(restaurants) || !restaurants.length) return restaurants || [];
  const lookups = restaurants.map((rest) => {
    const rid = rest?.id || "";
    if (!rid) return Promise.resolve(null);
    const hasCoreName = !!String(rest?.name || rest?.restaurantName || "").trim();
    const hasCoreLogo = !!String(rest?.logoUrl || rest?.logo || rest?.logoURL || "").trim();
    const hasCoreCity = !!String(rest?.city || "").trim();
    const hasCoreType = !!normalizeRestaurantType(
      rest?.type
      || rest?.customerType
      || rest?.category
      || rest?.kind
      || rest?.restaurantType
      || ""
    );
    if (hasCoreName && hasCoreLogo && hasCoreCity && hasCoreType) {
      return Promise.resolve(null);
    }
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

function isGenericHandle(handle) {
  const key = normalizeHandle(handle || "");
  if (!key || key.length < 3) return true;
  return ["admin", "owner", "user", "business", "staff", "ceo", "demo"].includes(key);
}

function resolvePreferredHandle(profile, fallbackName = "") {
  const raw = String(profile?.handle || "").trim();
  const name = fallbackName || profile?.name || "";
  const candidate = raw || normalizeHandle(name || "user");
  return isGenericHandle(candidate) ? normalizeHandle(name || "user") : candidate;
}

function parseCoordNumber(value) {
  const raw = typeof value === "string" ? value.replace(",", ".").trim() : value;
  const num = Number(raw);
  return Number.isFinite(num) ? num : null;
}

function uniqueStringList(values = []) {
  return Array.from(new Set(
    (values || [])
      .map((value) => String(value || "").trim())
      .filter(Boolean)
  ));
}

function normalizeCeoCountry(value) {
  const raw = String(value || "").trim().toLowerCase();
  if (!raw) return CEO_COUNTRIES[0];
  if (["xk", "kosovo", "kosove", "kosova"].includes(raw)) return "Kosovo";
  if (["al", "albania", "albanien", "shqiperi", "shqiperia"].includes(raw)) return "Albanien";
  if (["rs", "serbia", "serbien", "srbija"].includes(raw)) return "Serbien";
  const match = CEO_COUNTRIES.find((entry) => entry.toLowerCase() === raw);
  return match || CEO_COUNTRIES[0];
}

function normalizeCeoPath(value, fallback = []) {
  const base = Array.isArray(value)
    ? value
    : String(value || "")
      .split(/[,\s]+/)
      .filter(Boolean);
  return uniqueStringList([...(base || []), ...(fallback || [])]);
}

function buildCeoName({ firstName = "", lastName = "", fallback = "", email = "" } = {}) {
  const combined = `${String(firstName || "").trim()} ${String(lastName || "").trim()}`.trim();
  if (combined) return combined;
  const safeFallback = String(fallback || "").trim();
  if (safeFallback) return safeFallback;
  const safeEmail = String(email || "").trim();
  return safeEmail ? safeEmail.split("@")[0] : "CEO";
}

function getCurrentCeoMeta(profile = state.userProfile, user = state.user) {
  const uid = String(user?.uid || profile?.uid || "").trim();
  const name = String(profile?.name || user?.displayName || user?.email || "").trim() || "CEO";
  const parentUid = String(profile?.ceoParentUid || profile?.parentCeoUid || "").trim();
  const rootUid = String(profile?.ceoRootUid || profile?.rootCeoUid || "").trim() || uid;
  let path = normalizeCeoPath(profile?.ceoPath);
  if (!path.length) {
    if (hasGlobalCeoAccess(profile, user)) {
      path = uid ? [uid] : [];
    } else {
      path = normalizeCeoPath([], [rootUid, parentUid, uid]);
    }
  }
  if (uid && !path.includes(uid)) path = uniqueStringList([...path, uid]);
  return {
    uid,
    name,
    parentUid,
    rootUid: rootUid || uid,
    rootName: String(profile?.ceoRootName || profile?.rootCeoName || name).trim() || name,
    path,
    isRoot: !parentUid || hasGlobalCeoAccess(profile, user)
  };
}

function normalizeCeoStaffRecord(record = {}, userRecord = {}) {
  const merged = { ...(userRecord || {}), ...(record || {}) };
  const uid = String(merged.uid || merged.userId || merged.id || "").trim();
  const email = String(merged.email || "").trim();
  const firstName = String(merged.firstName || "").trim();
  const lastName = String(merged.lastName || "").trim();
  const name = buildCeoName({
    firstName,
    lastName,
    fallback: merged.name || merged.displayName || "",
    email
  });
  const parentUid = String(merged.ceoParentUid || merged.parentCeoUid || merged.managerUid || "").trim();
  const rootUid = String(merged.ceoRootUid || merged.rootCeoUid || parentUid || uid).trim() || uid;
  let ceoPath = normalizeCeoPath(merged.ceoPath, [rootUid, parentUid, uid]);
  if (!ceoPath.length && uid) ceoPath = [uid];
  return {
    ...merged,
    uid,
    userId: uid,
    id: uid,
    email,
    firstName,
    lastName,
    name,
    displayName: name,
    handle: merged.handle || normalizeHandle(name || email || "ceo"),
    role: "ceo",
    roles: ["ceo"],
    country: normalizeCeoCountry(merged.country),
    locationLabel: String(merged.locationLabel || merged.location || merged.city || "").trim(),
    ceoParentUid: parentUid,
    ceoParentName: String(merged.ceoParentName || merged.parentCeoName || merged.managerName || "").trim(),
    ceoRootUid: rootUid,
    ceoRootName: String(merged.ceoRootName || merged.rootCeoName || "").trim(),
    ceoPath,
    crmCounts: hasStoredCeoCrmCounts(merged.crmCounts) ? sanitizeCeoCrmCounts(merged.crmCounts) : null,
    lat: parseCoordNumber(merged.gpsLat ?? merged.lat),
    lng: parseCoordNumber(merged.gpsLng ?? merged.lng),
    gpsLat: parseCoordNumber(merged.gpsLat ?? merged.lat),
    gpsLng: parseCoordNumber(merged.gpsLng ?? merged.lng)
  };
}

function overlayCeoStaffProfile(record = {}, userRecord = {}) {
  const next = { ...(record || {}) };
  const readText = (...keys) => {
    for (const key of keys) {
      const value = String(userRecord?.[key] || "").trim();
      if (value) return value;
    }
    return "";
  };
  const avatarUrl = readText("avatarUrl", "avatar");
  if (avatarUrl) {
    next.avatarUrl = avatarUrl;
    next.avatar = avatarUrl;
  }
  const displayName = readText("displayName", "name");
  if (displayName) {
    next.displayName = displayName;
    next.name = displayName;
  }
  const firstName = readText("firstName");
  const lastName = readText("lastName");
  if (firstName) next.firstName = firstName;
  if (lastName) next.lastName = lastName;
  const email = readText("email");
  if (email) next.email = email;
  const handle = readText("handle");
  if (handle) next.handle = handle;
  const country = readText("country");
  if (country) next.country = country;
  const city = readText("city");
  if (city) next.city = city;
  const location = readText("locationLabel", "location", "city");
  if (location) {
    next.locationLabel = location;
    if (!String(next.location || "").trim()) next.location = location;
  }
  const lat = parseCoordNumber(userRecord?.gpsLat ?? userRecord?.lat);
  const lng = parseCoordNumber(userRecord?.gpsLng ?? userRecord?.lng);
  if (Number.isFinite(lat) && Number.isFinite(lng)) {
    next.lat = lat;
    next.lng = lng;
    next.gpsLat = lat;
    next.gpsLng = lng;
  }
  return next;
}

function buildCeoDirectorySyncPatch(record = {}, userRecord = {}) {
  const patched = overlayCeoStaffProfile(record, userRecord);
  const nextAvatar = String(patched.avatarUrl || patched.avatar || "").trim();
  const prevAvatar = String(record.avatarUrl || record.avatar || "").trim();
  const patch = {};
  if (nextAvatar && nextAvatar !== prevAvatar) {
    patch.avatarUrl = nextAvatar;
    patch.avatar = nextAvatar;
  }
  const textKeys = ["displayName", "name", "firstName", "lastName", "email", "handle", "country", "city", "locationLabel"];
  textKeys.forEach((key) => {
    const nextValue = String(patched[key] || "").trim();
    const prevValue = String(record[key] || "").trim();
    if (nextValue && nextValue !== prevValue) {
      patch[key] = nextValue;
    }
  });
  ["lat", "lng", "gpsLat", "gpsLng"].forEach((key) => {
    const nextValue = parseCoordNumber(patched[key]);
    const prevValue = parseCoordNumber(record[key]);
    if (Number.isFinite(nextValue) && nextValue !== prevValue) {
      patch[key] = nextValue;
    }
  });
  return patch;
}

async function hydrateStaffRecordsFromUserProfiles(items = [], { syncDirectory = false } = {}) {
  const list = Array.isArray(items) ? items.slice() : [];
  const uids = uniqueStringList(list.map((item) => String(item?.uid || "").trim()).filter(Boolean));
  if (!uids.length) return list;
  const userMap = new Map();
  const usersRef = collection(db, "users");
  const chunks = chunkStringList(uids, 10);
  await Promise.all(chunks.map(async (chunk) => {
    if (!chunk.length) return;
    try {
      const snap = await getDocs(query(usersRef, where(documentId(), "in", chunk)));
      snap.forEach((docSnap) => {
        userMap.set(docSnap.id, docSnap.data() || {});
      });
      return;
    } catch {}
    await Promise.all(chunk.map(async (uid) => {
      try {
        const snap = await getDoc(doc(db, "users", uid));
        if (snap.exists()) userMap.set(uid, snap.data() || {});
      } catch {}
    }));
  }));
  const syncWrites = [];
  const nextItems = list.map((item) => {
    const uid = String(item?.uid || "").trim();
    if (!uid) return item;
    const userRecord = userMap.get(uid);
    if (!userRecord) return item;
    if (syncDirectory) {
      const patch = buildCeoDirectorySyncPatch(item, userRecord);
      if (Object.keys(patch).length) {
        syncWrites.push(setDoc(doc(db, "superadmins", uid), {
          ...patch,
          updatedAt: serverTimestamp()
        }, { merge: true }).catch(() => {}));
      }
    }
    return normalizeCeoStaffRecord(overlayCeoStaffProfile(item, userRecord));
  });
  if (syncWrites.length) {
    void Promise.all(syncWrites);
  }
  return nextItems;
}

function canViewCeoRecord(record = {}) {
  const current = getCurrentCeoMeta();
  if (!current.uid) return false;
  if (String(record.uid || "") === current.uid) return true;
  const path = normalizeCeoPath(record.ceoPath, [record.ceoRootUid, record.ceoParentUid, record.uid]);
  if (path.includes(current.uid)) return true;
  if (hasGlobalCeoAccess() && !String(record.ceoParentUid || "").trim()) return true;
  return false;
}

function getOwnerMeta(row = {}) {
  const source = applyKnownLeadOwnershipOverride(row);
  const creatorUid = String(
    source.createdByUid
    || source.ownerUid
    || source.socialUid
    || source.uid
    || ""
  ).trim();
  const creatorName = String(
    source.createdByName
    || source.createdByHandle
    || source.ownerName
    || ""
  ).trim();
  let ceoPath = normalizeCeoPath(source.ceoPath);
  if (!ceoPath.length && creatorUid) {
    ceoPath = normalizeCeoPath([], [
      source.ceoRootUid || source.rootCeoUid || "",
      source.ceoParentUid || source.parentCeoUid || "",
      creatorUid
    ]);
  }
  return { creatorUid, creatorName, ceoPath };
}

function chunkStringList(values = [], size = 10) {
  const out = [];
  const list = uniqueStringList(values);
  for (let i = 0; i < list.length; i += size) {
    out.push(list.slice(i, i + size));
  }
  return out;
}

function getVisibleCeoTeamUids() {
  if (!isCeoUser()) return [];
  const current = getCurrentCeoMeta();
  const staffUids = (Array.isArray(state.staff.items) ? state.staff.items : [])
    .filter((item) => canViewCeoRecord(item))
    .map((item) => String(item.uid || "").trim())
    .filter(Boolean);
  return uniqueStringList([current.uid, ...staffUids]);
}

function isOwnedByVisibleCeoTeam(row = {}) {
  if (!isCeoUser()) return true;
  const current = getCurrentCeoMeta();
  if (!current.uid) return false;
  const meta = getOwnerMeta(row);
  const teamUids = getVisibleCeoTeamUids();
  if (meta.creatorUid && meta.creatorUid === current.uid) return true;
  if (meta.ceoPath.includes(current.uid)) return true;
  if (meta.creatorUid && teamUids.includes(meta.creatorUid)) return true;
  if (meta.ceoPath.some((uid) => teamUids.includes(uid))) return true;
  return false;
}

function canCurrentCeoSeeRow(row = {}) {
  if (!isCeoUser()) return true;
  const current = getCurrentCeoMeta();
  if (!current.uid) return true;
  const meta = getOwnerMeta(row);
  if (isOwnedByVisibleCeoTeam(row)) return true;
  if (hasGlobalCeoAccess() && !meta.ceoPath.length && !meta.creatorUid) return true;
  return false;
}

function resolveOwnershipMeta(row = {}) {
  if (!isCeoUser()) return null;
  const current = getCurrentCeoMeta();
  if (!current.uid) return null;
  const meta = getOwnerMeta(row);
  if (!meta.creatorUid || meta.creatorUid === current.uid) {
    return { own: true, label: "Eigene", creatorName: "" };
  }
  return {
    own: false,
    label: "Staff",
    creatorName: meta.creatorName || meta.creatorUid || "Unbekannt"
  };
}

function isCurrentCeoOwnRow(row = {}) {
  const meta = resolveOwnershipMeta(row);
  return !meta || !!meta.own;
}

function normalizeLeadScopeKey(value) {
  return ["own", "staff", "archived"].includes(String(value || "").trim()) ? String(value || "").trim() : "own";
}

function normalizeCustomerScopeKey(value) {
  return String(value || "").trim() === "staff" ? "staff" : "own";
}

function formatPagedScopeCount(count = 0, hasMore = false) {
  const safeCount = Math.max(0, Number(count) || 0);
  return hasMore ? `${safeCount}+` : String(safeCount);
}

function resolvePagedScopeCount(count = 0, hasMore = false, isLoaded = false) {
  return isLoaded ? formatPagedScopeCount(count, hasMore) : "...";
}

function resolveKnownScopeCountLabel(count = 0, isExact = false, isLoaded = false) {
  if (!isLoaded) return "...";
  const safeCount = Math.max(0, Number(count) || 0);
  return isExact ? String(safeCount) : `${safeCount}+`;
}

function renderCeoScopeTabs({
  idPrefix = "ceoScope",
  active = "own",
  ownLabel = "Meine",
  ownCount = 0,
  staffLabel = "Staff",
  staffCount = 0,
  tabs = null
} = {}) {
  const tabList = Array.isArray(tabs) && tabs.length
    ? tabs
    : [
      {
        key: "own",
        label: ownLabel,
        count: ownCount
      },
      {
        key: "staff",
        label: staffLabel,
        count: staffCount
      }
    ];
  return `
    <div class="grid gap-2 mb-4 w-full" style="grid-template-columns: repeat(${Math.max(1, tabList.length)}, minmax(0, 1fr));">
      ${tabList.map((tab) => {
        const selected = tab.key === active;
        return `
          <button
            type="button"
            data-${escapeHtml(idPrefix)}="${escapeHtml(tab.key)}"
            class="rounded-[1.5rem] px-3 py-2.5 text-left border transition-all ${selected ? "bg-slate-900 text-white border-slate-900 shadow-lg shadow-slate-200/70" : "bg-white text-slate-600 border-slate-100 shadow-sm"}"
          >
            <p class="text-[8px] font-black uppercase tracking-[0.16em] ${selected ? "text-white/70" : "text-slate-400"}">${escapeHtml(tab.label)}</p>
            <p class="text-base font-black tracking-tight mt-1">${escapeHtml(String(tab.count))}</p>
          </button>
        `;
      }).join("")}
    </div>
  `;
}

function renderOwnershipPills(row = {}, { hideOwn = false } = {}) {
  const meta = resolveOwnershipMeta(row);
  if (!meta) return "";
  if (meta.own && hideOwn) return "";
  const chips = [
    `<span class="px-2.5 py-1 rounded-full bg-slate-100 text-slate-500 text-[9px] font-black uppercase tracking-widest">${escapeHtml(meta.label)}</span>`
  ];
  if (!meta.own && meta.creatorName) {
    chips.push(`<span class="px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-600 text-[9px] font-black uppercase tracking-widest">${escapeHtml(meta.creatorName)}</span>`);
  }
  return `<div class="flex flex-wrap gap-2 mt-3">${chips.join("")}</div>`;
}

function buildCeoCreatorMeta(profile = state.userProfile, user = state.user) {
  const current = getCurrentCeoMeta(profile, user);
  const handle = String(profile?.handle || normalizeHandle(current.name || "ceo")).trim();
  return {
    createdByUid: current.uid || "",
    createdByRole: "ceo",
    createdByName: current.name || "",
    createdByHandle: handle,
    ceoRootUid: current.rootUid || current.uid || "",
    ceoRootName: current.rootName || current.name || "",
    ceoParentUid: current.parentUid || "",
    ceoPath: Array.isArray(current.path) ? current.path.slice() : []
  };
}

function resolveStoredCeoCreatorMeta(...sources) {
  let createdByUid = "";
  let createdByRole = "";
  let createdByName = "";
  let createdByHandle = "";
  let ceoRootUid = "";
  let ceoRootName = "";
  let ceoParentUid = "";
  let ceoPath = [];
  for (const source of sources) {
    if (!source || typeof source !== "object") continue;
    if (!createdByUid) createdByUid = String(source.createdByUid || "").trim();
    if (!createdByRole) createdByRole = String(source.createdByRole || "").trim();
    if (!createdByName) createdByName = String(source.createdByName || "").trim();
    if (!createdByHandle) createdByHandle = String(source.createdByHandle || "").trim();
    if (!ceoRootUid) ceoRootUid = String(source.ceoRootUid || "").trim();
    if (!ceoRootName) ceoRootName = String(source.ceoRootName || "").trim();
    if (!ceoParentUid) ceoParentUid = String(source.ceoParentUid || "").trim();
    if (!ceoPath.length) {
      ceoPath = normalizeCeoPath(source.ceoPath, [ceoRootUid, ceoParentUid, createdByUid]);
    }
  }
  if (!createdByUid && ceoPath.length) createdByUid = ceoPath[ceoPath.length - 1];
  if (!ceoRootUid && ceoPath.length) ceoRootUid = ceoPath[0];
  if (!ceoParentUid && ceoPath.length > 1) ceoParentUid = ceoPath[ceoPath.length - 2];
  ceoPath = normalizeCeoPath(ceoPath, [ceoRootUid, ceoParentUid, createdByUid]);
  if (!(createdByUid || createdByName || createdByHandle || ceoRootUid || ceoParentUid || ceoPath.length)) {
    return buildCeoCreatorMeta();
  }
  return {
    createdByUid,
    createdByRole: createdByRole || "ceo",
    createdByName,
    createdByHandle,
    ceoRootUid: ceoRootUid || createdByUid,
    ceoRootName: ceoRootName || createdByName,
    ceoParentUid,
    ceoPath
  };
}

function createEmptyCeoCrmCounts() {
  return {
    ownLeads: 0,
    staffLeads: 0,
    archivedLeads: 0,
    ownCustomers: 0,
    staffCustomers: 0,
    ownArchivedLeads: 0
  };
}

function sanitizeCeoCrmCounts(raw = {}) {
  const base = createEmptyCeoCrmCounts();
  Object.keys(base).forEach((key) => {
    const num = Number(raw?.[key]);
    base[key] = Number.isFinite(num) ? num : 0;
  });
  return base;
}

function hasStoredCeoCrmCounts(raw = {}) {
  if (!raw || typeof raw !== "object") return false;
  return Object.keys(createEmptyCeoCrmCounts()).some((key) => Number.isFinite(Number(raw?.[key])));
}

function applyLocalCeoCrmCountDelta(uid, delta = {}) {
  const safeUid = String(uid || "").trim();
  if (!safeUid) return;
  const keys = Object.keys(createEmptyCeoCrmCounts());
  if (String(state.user?.uid || state.userProfile?.uid || "") === safeUid) {
    const next = sanitizeCeoCrmCounts(state.userProfile?.crmCounts || {});
    keys.forEach((key) => {
      const amount = Number(delta?.[key]) || 0;
      if (!amount) return;
      next[key] = Math.max(0, next[key] + amount);
    });
    state.userProfile = {
      ...state.userProfile,
      crmCounts: next
    };
    saveUserProfileToStorage();
  }
  if (Array.isArray(state.staff.items) && state.staff.items.length) {
    state.staff.items = state.staff.items.map((item) => {
      if (String(item?.uid || "") !== safeUid) return item;
      const next = sanitizeCeoCrmCounts(item?.crmCounts || {});
      keys.forEach((key) => {
        const amount = Number(delta?.[key]) || 0;
        if (!amount) return;
        next[key] = Math.max(0, next[key] + amount);
      });
      return {
        ...item,
        crmCounts: next
      };
    });
  }
}

function buildLeadCrmContribution(lead = null) {
  if (!lead) return null;
  const normalized = normalizeLeadDoc(lead);
  const meta = getOwnerMeta(normalized);
  const path = normalizeCeoPath(meta.ceoPath, [normalized.ceoRootUid, normalized.ceoParentUid, meta.creatorUid]);
  const creatorUid = String(meta.creatorUid || path[path.length - 1] || "").trim();
  if (!creatorUid && !path.length) return null;
  const statusKey = normalizeLeadStatusKey(normalized.status || "");
  if (statusKey === "kunde") return null;
  return {
    creatorUid,
    path: normalizeCeoPath(path, [creatorUid]),
    ownLeads: statusKey === "no_interest" ? 0 : 1,
    ownArchivedLeads: statusKey === "no_interest" ? 1 : 0,
    ownCustomers: 0
  };
}

function buildCustomerCrmContribution(customer = null) {
  if (!customer || !isCustomerRestaurant(customer)) return null;
  const meta = getOwnerMeta(customer);
  const path = normalizeCeoPath(meta.ceoPath, [customer.ceoRootUid, customer.ceoParentUid, meta.creatorUid]);
  const creatorUid = String(meta.creatorUid || path[path.length - 1] || "").trim();
  if (!creatorUid && !path.length) return null;
  return {
    creatorUid,
    path: normalizeCeoPath(path, [creatorUid]),
    ownLeads: 0,
    ownArchivedLeads: 0,
    ownCustomers: 1
  };
}

function accumulateCeoCrmDelta(deltaMap, contribution, sign = 1) {
  if (!contribution || !sign) return;
  const path = normalizeCeoPath(contribution.path, [contribution.creatorUid]);
  const creatorUid = String(contribution.creatorUid || path[path.length - 1] || "").trim();
  const leadDelta = (Number(contribution.ownLeads) || 0) * sign;
  const archivedDelta = (Number(contribution.ownArchivedLeads) || 0) * sign;
  const customerDelta = (Number(contribution.ownCustomers) || 0) * sign;
  const ensure = (uid) => {
    const key = String(uid || "").trim();
    if (!key) return null;
    if (!deltaMap.has(key)) deltaMap.set(key, createEmptyCeoCrmCounts());
    return deltaMap.get(key);
  };
  const creatorCounts = ensure(creatorUid);
  if (creatorCounts) {
    creatorCounts.ownLeads += leadDelta;
    creatorCounts.ownArchivedLeads += archivedDelta;
    creatorCounts.archivedLeads += archivedDelta;
    creatorCounts.ownCustomers += customerDelta;
  }
  path.forEach((uid) => {
    const key = String(uid || "").trim();
    if (!key || key === creatorUid) return;
    const target = ensure(key);
    if (!target) return;
    target.staffLeads += leadDelta;
    target.staffCustomers += customerDelta;
    target.archivedLeads += archivedDelta;
  });
}

async function applyCeoCrmCountDeltas(deltaMap) {
  if (!(deltaMap instanceof Map) || !deltaMap.size) return;
  const writes = [];
  deltaMap.forEach((delta, uid) => {
    const safeUid = String(uid || "").trim();
    if (!safeUid) return;
    const nested = {};
    Object.entries(delta || {}).forEach(([key, value]) => {
      const amount = Number(value) || 0;
      if (!amount) return;
      nested[key] = increment(amount);
    });
    if (!Object.keys(nested).length) return;
    const payload = {
      crmCounts: nested,
      updatedAt: serverTimestamp()
    };
    writes.push(setDoc(doc(db, "users", safeUid), payload, { merge: true }).catch(() => {}));
    writes.push(setDoc(doc(db, "superadmins", safeUid), payload, { merge: true }).catch(() => {}));
    applyLocalCeoCrmCountDelta(safeUid, delta);
  });
  if (writes.length) {
    await Promise.all(writes);
  }
}

async function fetchCeoTeamEntriesForCrmCounts(currentMeta = getCurrentCeoMeta()) {
  const currentUid = String(currentMeta?.uid || "").trim();
  if (!currentUid) return [];
  const staffRef = collection(db, "superadmins");
  const queryRefs = [
    query(staffRef, where("ceoPath", "array-contains", currentUid)),
    query(staffRef, where("ceoParentUid", "==", currentUid))
  ];
  if (hasGlobalCeoAccess()) {
    queryRefs.push(query(staffRef));
  }
  const snaps = await Promise.all(queryRefs.map((ref) => getDocs(ref).catch(() => null)));
  const rowMap = new Map();
  snaps.forEach((snap) => {
    if (!snap?.docs?.length) return;
    snap.docs.forEach((docSnap) => {
      rowMap.set(docSnap.id, { id: docSnap.id, ...(docSnap.data() || {}) });
    });
  });
  return Array.from(rowMap.values())
    .map((row) => normalizeCeoStaffRecord(row))
    .filter((item) => canViewCeoRecord(item) && String(item.uid || "") !== currentUid)
    .filter((item) => !isHiddenLegacyCeoEmail(item.email || ""))
    .sort((a, b) => {
      const ta = toDateSafe(a.createdAt)?.getTime() || 0;
      const tb = toDateSafe(b.createdAt)?.getTime() || 0;
      if (tb !== ta) return tb - ta;
      return String(a.name || "").localeCompare(String(b.name || ""));
    });
}

async function fetchNestedCeoStaffEntries(rootUids = []) {
  const roots = uniqueStringList(rootUids);
  if (!roots.length) return [];
  const staffRef = collection(db, "superadmins");
  const queryRefs = [];
  chunkStringList(roots, 10).forEach((uids) => {
    if (!uids.length) return;
    queryRefs.push(query(staffRef, where("ceoPath", "array-contains-any", uids)));
    queryRefs.push(query(staffRef, where("ceoParentUid", "in", uids)));
  });
  const snaps = await Promise.all(queryRefs.map((ref) => getDocs(ref).catch(() => null)));
  const rowMap = new Map();
  snaps.forEach((snap) => {
    if (!snap?.docs?.length) return;
    snap.docs.forEach((docSnap) => {
      rowMap.set(docSnap.id, { id: docSnap.id, ...(docSnap.data() || {}) });
    });
  });
  return Array.from(rowMap.values())
    .map((row) => normalizeCeoStaffRecord(row))
    .filter((item) => !isHiddenLegacyCeoEmail(item.email || ""))
    .sort((a, b) => {
      const ta = toDateSafe(a.createdAt)?.getTime() || 0;
      const tb = toDateSafe(b.createdAt)?.getTime() || 0;
      if (tb !== ta) return tb - ta;
      return String(a.name || "").localeCompare(String(b.name || ""));
    });
}

async function ensureCeoCrmCountsLoaded({ force = false } = {}) {
  if (!isCeoUser()) return;
  const current = getCurrentCeoMeta();
  if (!current.uid) return;
  const currentReady = hasStoredCeoCrmCounts(state.userProfile?.crmCounts || {});
  const staffReady = (Array.isArray(state.staff.items) ? state.staff.items : []).every((item) => hasStoredCeoCrmCounts(item?.crmCounts || {}));
  if (!force && currentReady && staffReady) return;
  if (ceoCrmCountsPromise) {
    await ceoCrmCountsPromise;
    return;
  }
  ceoCrmCountsPromise = (async () => {
    const currentMeta = getCurrentCeoMeta();
    const visibleStaffItems = Array.isArray(state.staff.items) ? state.staff.items : [];
    const missingVisibleStaff = visibleStaffItems.filter((item) => !hasStoredCeoCrmCounts(item?.crmCounts || {}));
    const needsCurrentRecount = force || !currentReady;
    let teamStaffEntries = [];
    if (needsCurrentRecount) {
      teamStaffEntries = (dataLoaded.staff && !state.staff.hasMore && visibleStaffItems.length)
        ? visibleStaffItems.slice()
        : await fetchCeoTeamEntriesForCrmCounts(currentMeta);
    } else if (missingVisibleStaff.length) {
      const nestedStaff = await fetchNestedCeoStaffEntries(missingVisibleStaff.map((item) => String(item?.uid || "").trim()));
      const mergedStaff = new Map();
      [...missingVisibleStaff, ...nestedStaff].forEach((item) => {
        const uid = String(item?.uid || "").trim();
        if (!uid) return;
        mergedStaff.set(uid, item);
      });
      teamStaffEntries = Array.from(mergedStaff.values());
    }
    const teamEntries = [
      ...(needsCurrentRecount ? [{
        uid: currentMeta.uid,
        ceoPath: Array.isArray(currentMeta.path) ? currentMeta.path.slice() : [currentMeta.uid]
      }] : []),
      ...(teamStaffEntries.map((item) => ({
        uid: String(item?.uid || "").trim(),
        ceoPath: normalizeCeoPath(item?.ceoPath, [item?.ceoRootUid, item?.ceoParentUid, item?.uid])
      })))
    ].filter((entry) => entry.uid);
    const teamUids = uniqueStringList(teamEntries.map((entry) => entry.uid));
    if (!teamUids.length) return;

    const ownMap = new Map(teamUids.map((uid) => [uid, createEmptyCeoCrmCounts()]));

    const leadSnaps = await Promise.all(chunkStringList(teamUids, 10).map((uids) => (
      getDocs(query(collection(db, "leads"), where("createdByUid", "in", uids))).catch(() => null)
    )));
    leadSnaps.forEach((snap) => {
      if (!snap?.docs?.length) return;
      snap.docs.forEach((docSnap) => {
        const lead = normalizeLeadDoc({ id: docSnap.id, ...(docSnap.data() || {}) });
        const uid = String(lead.createdByUid || "").trim();
        if (!uid || !ownMap.has(uid)) return;
        const counts = ownMap.get(uid);
        const statusKey = normalizeLeadStatusKey(lead.status || "");
        if (statusKey === "kunde") return;
        if (statusKey === "no_interest") {
          counts.ownArchivedLeads += 1;
        } else {
          counts.ownLeads += 1;
        }
      });
    });

    const customerSnaps = await Promise.all(chunkStringList(teamUids, 10).map((uids) => (
      getDocs(query(collection(db, "restaurants"), where("createdByUid", "in", uids))).catch(() => null)
    )));
    customerSnaps.forEach((snap) => {
      if (!snap?.docs?.length) return;
      snap.docs.forEach((docSnap) => {
        const row = { id: docSnap.id, ...(docSnap.data() || {}) };
        if (!isCustomerRestaurant(row)) return;
        const uid = String(row.createdByUid || "").trim();
        if (!uid || !ownMap.has(uid)) return;
        ownMap.get(uid).ownCustomers += 1;
      });
    });

    const aggregateMap = new Map();
    teamUids.forEach((uid) => {
      const own = sanitizeCeoCrmCounts(ownMap.get(uid) || {});
      aggregateMap.set(uid, {
        ...createEmptyCeoCrmCounts(),
        ...own,
        archivedLeads: own.ownArchivedLeads
      });
    });

    teamEntries.forEach((entry) => {
      const uid = String(entry.uid || "").trim();
      if (!uid) return;
      const own = sanitizeCeoCrmCounts(ownMap.get(uid) || {});
      const path = normalizeCeoPath(entry.ceoPath, [uid]);
      path.forEach((ancestorUid) => {
        const safeAncestorUid = String(ancestorUid || "").trim();
        if (!safeAncestorUid || safeAncestorUid === uid || !aggregateMap.has(safeAncestorUid)) return;
        const target = aggregateMap.get(safeAncestorUid);
        target.staffLeads += own.ownLeads;
        target.staffCustomers += own.ownCustomers;
        target.archivedLeads += own.ownArchivedLeads;
      });
    });

    const persistWrites = [];
    aggregateMap.forEach((counts, uid) => {
      const safeUid = String(uid || "").trim();
      if (!safeUid) return;
      const payload = {
        crmCounts: sanitizeCeoCrmCounts(counts),
        updatedAt: serverTimestamp()
      };
      persistWrites.push(setDoc(doc(db, "users", safeUid), payload, { merge: true }).catch(() => {}));
      persistWrites.push(setDoc(doc(db, "superadmins", safeUid), payload, { merge: true }).catch(() => {}));
      if (safeUid === String(state.user?.uid || state.userProfile?.uid || "")) {
        state.userProfile = {
          ...state.userProfile,
          crmCounts: sanitizeCeoCrmCounts(counts)
        };
        saveUserProfileToStorage();
      }
    });
    if (persistWrites.length) {
      await Promise.all(persistWrites);
    }
    if (Array.isArray(state.staff.items) && state.staff.items.length) {
      state.staff.items = state.staff.items.map((item) => {
        const counts = aggregateMap.get(String(item?.uid || "").trim());
        return counts ? { ...item, crmCounts: sanitizeCeoCrmCounts(counts) } : item;
      });
    }
    render();
  })();
  try {
    await ceoCrmCountsPromise;
  } finally {
    ceoCrmCountsPromise = null;
  }
}

function normalizeProfile(data, user) {
  const displayName = data?.displayName || user?.displayName || user?.email?.split("@")[0] || "User";
  const roles = normalizeRoleList(data?.roles || data?.role || "");
  const lat = data?.gpsLat ?? data?.lat ?? null;
  const lng = data?.gpsLng ?? data?.lng ?? null;
  return {
    name: displayName,
    handle: data?.handle || normalizeHandle(displayName),
    bio: data?.bio || "",
    avatar: data?.avatarUrl || data?.avatar || user?.photoURL || "",
    location: data?.city || "Prishtina",
    address: data?.address || "",
    followers: data?.followersCount ?? 0,
    following: data?.followingCount ?? 0,
    privateAccount: !!data?.privateAccount,
    karma: String(data?.score ?? "0"),
    roles,
    role: data?.role || "user",
    isPremium: data?.isPremium || false,
    restaurantId: data?.restaurantId || "",
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

function normalizeBusinessProfile(rest = {}, user) {
  const displayName = rest?.name || rest?.restaurantName || user?.displayName || user?.email?.split("@")[0] || "Business";
  const handle = resolvePreferredHandle({ handle: rest?.handle || "", name: displayName }, displayName);
  const lat = rest?.gpsLat ?? rest?.lat ?? null;
  const lng = rest?.gpsLng ?? rest?.lng ?? null;
  const type = normalizeRestaurantType(rest?.type || rest?.customerType || rest?.category || rest?.kind || rest?.restaurantType || "");
  return {
    name: displayName,
    handle: handle || normalizeHandle(displayName),
    bio: rest?.bio || rest?.description || "",
    avatar: rest?.logoUrl || rest?.logo || "",
    location: rest?.city || "Prishtina",
    address: rest?.address || "",
    followers: rest?.followersCount ?? rest?.followers ?? 0,
    following: rest?.followingCount ?? rest?.following ?? 0,
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

function syncSelfAvatarCachesFromProfile(profile = state.userProfile) {
  const resolvedAvatar = getOptimizedImageUrl(profile?.avatar || "", "avatar");
  if (isPlaceholderUrl(resolvedAvatar)) return "";
  primeSelfAvatarCache(resolvedAvatar);
  return resolvedAvatar;
}

function commitLiveSelfProfile(normalized, { syncPrivate = true } = {}) {
  if (!normalized || typeof normalized !== "object") return;
  state.userProfile = normalized;
  if (state.user?.uid) state.userProfile.uid = state.user.uid;
  if (syncPrivate) syncPrivateSettingFromProfile(normalized.privateAccount);
  saveUserProfileToStorage();
  syncSelfAvatarCachesFromProfile(state.userProfile);
  if (lastRenderMode === "main") {
    updateShellDom();
    if (state.activeTab === "search" && refreshSearchView()) return;
    if (state.activeTab === "feed") return;
  }
  render();
}

function applyLiveUserProfileSnapshot(data = {}) {
  if (!state.user) return;
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
  if ((!normalized.avatar || isPlaceholderUrl(normalizedResolved)) && prevAvatar) normalized.avatar = prevAvatar;
  normalized.uid = state.user.uid;
  commitLiveSelfProfile(normalized);
}

function applyLiveBusinessProfileSnapshot(restData = {}, restaurantId = "") {
  if (!state.user) return;
  const safeRestaurantId = String(restaurantId || restData?.id || restData?.restaurantId || state.userProfile?.restaurantId || "").trim();
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
  const normalized = normalizeBusinessProfile(seed, state.user);
  const normalizedResolved = getOptimizedImageUrl(normalized.avatar || "", "avatar");
  if ((!normalized.avatar || isPlaceholderUrl(normalizedResolved)) && prevAvatar) normalized.avatar = prevAvatar;
  normalized.uid = state.user.uid;
  state.restaurants = mergeRestaurants(state.restaurants, [{ id: safeRestaurantId, ...seed }]);
  rebuildBusinessLocations();
  commitLiveSelfProfile(normalized, { syncPrivate: false });
}

function attachCurrentUserProfileListener() {
  const uid = String(state.user?.uid || "").trim();
  if (!uid) return;
  const restaurantId = String(state.userProfile?.restaurantId || "").trim();
  const useRestaurantDoc = !!(restaurantId && isLocalBusinessProfile(state.userProfile));
  const nextKey = useRestaurantDoc ? `restaurant:${restaurantId}` : `user:${uid}`;
  if (userDocUnsub && userDocLiveKey === nextKey) return;
  if (userDocUnsub) {
    userDocUnsub();
    userDocUnsub = null;
  }
  userDocLiveKey = nextKey;
  const ref = useRestaurantDoc ? doc(db, "restaurants", restaurantId) : doc(db, "users", uid);
  userDocUnsub = onSnapshot(ref, (snap) => {
    if (!snap.exists()) return;
    const data = snap.data() || {};
    if (useRestaurantDoc) {
      applyLiveBusinessProfileSnapshot({ id: restaurantId, ...data }, restaurantId);
      return;
    }
    applyLiveUserProfileSnapshot(data);
  }, () => {});
}

async function syncCeoDirectoryProfilePatch(patch = {}) {
  const uid = String(state.user?.uid || "").trim();
  if (!uid || !isCeoUser()) return;
  const payload = {};
  const textFields = ["name", "displayName", "handle", "city", "locationLabel", "country", "firstName", "lastName", "ceoParentName", "ceoRootName"];
  textFields.forEach((key) => {
    if (!(key in patch)) return;
    const value = String(patch[key] || "").trim();
    if (!value) return;
    payload[key] = value;
  });
  ["lat", "lng", "gpsLat", "gpsLng"].forEach((key) => {
    if (!(key in patch)) return;
    const value = Number(patch[key]);
    if (!Number.isFinite(value)) return;
    payload[key] = value;
  });
  const avatarUrl = String(patch.avatarUrl || patch.avatar || "").trim();
  if (avatarUrl) {
    payload.avatarUrl = avatarUrl;
    payload.avatar = avatarUrl;
  }
  if (!Object.keys(payload).length) return;
  payload.updatedAt = serverTimestamp();
  try {
    await setDoc(doc(db, "superadmins", uid), payload, { merge: true });
  } catch {}
}

function normalizeEmailValue(value) {
  return String(value || "").trim().toLowerCase();
}

function getRestaurantEmailCandidates(rest = {}) {
  return [
    rest.ownerEmail,
    rest.email,
    rest.contactEmail,
    rest.socialEmail,
    rest.loginEmail,
    rest.accountEmail,
    rest?.owner?.email,
    rest?.contact?.email,
    rest?.account?.email
  ].map((item) => String(item || "").trim()).filter(Boolean);
}

function getRestaurantUidCandidates(rest = {}) {
  return [
    rest.ownerUid,
    rest.socialUid,
    rest.uid,
    rest.userUid,
    rest.accountUid,
    rest.ownerId
  ].map((item) => String(item || "").trim()).filter(Boolean);
}

function matchesRestaurantIdentity(rest, { uid = "", email = "" } = {}) {
  if (!rest) return false;
  const uidKey = String(uid || "").trim();
  if (uidKey) {
    const byUid = getRestaurantUidCandidates(rest).some((candidate) => candidate === uidKey);
    if (byUid) return true;
  }
  const emailKey = normalizeEmailValue(email);
  if (emailKey) {
    const byEmail = getRestaurantEmailCandidates(rest).some((candidate) => normalizeEmailValue(candidate) === emailKey);
    if (byEmail) return true;
  }
  return false;
}

async function scanRestaurantsForMatch(matchFn, { max = 25 } = {}) {
  try {
    const snap = await getDocs(query(collection(db, "restaurants"), limit(max)));
    if (snap.empty) return null;
    const rows = snap.docs.map((docSnap) => ({ id: docSnap.id, ...(docSnap.data() || {}) }));
    if (rows.length) {
      state.restaurants = mergeRestaurants(state.restaurants, rows);
    }
    return rows.find((row) => matchFn(row)) || null;
  } catch {}
  return null;
}

async function queryRestaurantByField(field, value) {
  const needle = String(value || "").trim();
  if (!needle) return null;
  try {
    const snap = await getDocs(query(collection(db, "restaurants"), where(field, "==", needle), limit(1)));
    if (!snap.empty) {
      const docSnap = snap.docs[0];
      return { id: docSnap.id, ...(docSnap.data() || {}) };
    }
  } catch {}
  return null;
}

async function findRestaurantByEmail(email) {
  const needle = String(email || "").trim();
  if (!needle) return null;
  const lower = needle.toLowerCase();
  const variants = lower && lower !== needle ? [needle, lower] : [needle];
  const fields = ["ownerEmail", "email", "contactEmail", "socialEmail", "loginEmail", "accountEmail"];
  for (const variant of variants) {
    for (const field of fields) {
      const rest = await queryRestaurantByField(field, variant);
      if (rest) return rest;
    }
  }
  const cached = (state.restaurants || []).find((rest) => matchesRestaurantIdentity(rest, { email: needle })) || null;
  if (cached) return cached;
  return scanRestaurantsForMatch((rest) => matchesRestaurantIdentity(rest, { email: needle }));
}

async function findRestaurantByUid(uid) {
  const needle = String(uid || "").trim();
  if (!needle) return null;
  const fields = ["ownerUid", "socialUid", "uid", "userUid", "accountUid"];
  for (const field of fields) {
    const rest = await queryRestaurantByField(field, needle);
    if (rest) return rest;
  }
  const cached = (state.restaurants || []).find((rest) => matchesRestaurantIdentity(rest, { uid: needle })) || null;
  if (cached) return cached;
  return scanRestaurantsForMatch((rest) => matchesRestaurantIdentity(rest, { uid: needle }));
}

async function queryLeadByField(field, value) {
  const needle = String(value || "").trim();
  if (!needle) return null;
  try {
    const snap = await getDocs(query(collection(db, "leads"), where(field, "==", needle), limit(1)));
    if (!snap.empty) {
      const docSnap = snap.docs[0];
      return { id: docSnap.id, ...(docSnap.data() || {}) };
    }
  } catch {}
  return null;
}

async function scanLeadsForMatch(matchFn, { max = 25 } = {}) {
  try {
    const snap = await getDocs(query(collection(db, "leads"), limit(max)));
    if (snap.empty) return null;
    const rows = snap.docs.map((docSnap) => ({ id: docSnap.id, ...(docSnap.data() || {}) }));
    return rows.find((row) => matchFn(row)) || null;
  } catch {}
  return null;
}

async function resolveLeadByEmail(email) {
  const needle = String(email || "").trim();
  if (!needle) return null;
  const lower = needle.toLowerCase();
  const variants = lower && lower !== needle ? [needle, lower] : [needle];
  for (const variant of variants) {
    const fields = ["email", "socialEmail", "ownerEmail", "loginEmail"];
    for (const field of fields) {
      const lead = await queryLeadByField(field, variant);
      if (lead) return lead;
    }
  }
  return scanLeadsForMatch((lead) => {
    const values = [lead.email, lead.socialEmail, lead.ownerEmail, lead.loginEmail];
    return values.some((item) => normalizeEmailValue(item) === normalizeEmailValue(needle));
  });
}

async function resolveLeadByUid(uid) {
  const needle = String(uid || "").trim();
  if (!needle) return null;
  const fields = ["socialUid", "ownerUid", "uid", "userUid"];
  for (const field of fields) {
    const lead = await queryLeadByField(field, needle);
    if (lead) return lead;
  }
  return scanLeadsForMatch((lead) => {
    const values = [lead.socialUid, lead.ownerUid, lead.uid, lead.userUid];
    return values.some((item) => String(item || "").trim() === needle);
  });
}

function findRestaurantByLeadId(leadId) {
  const key = String(leadId || "").trim();
  if (!key) return null;
  return (state.restaurants || []).find((rest) => String(rest?.leadId || "").trim() === key) || null;
}

async function ensureRestaurantForLead(lead, user) {
  if (!lead) return null;
  let restaurantId = lead.restaurantId || lead.restaurant || "";
  const email = lead.email || lead.socialEmail || user?.email || "";
  const ownerName = lead.contactName || lead.ownerName || lead.businessName || lead.name || "";
  if (restaurantId) {
    try {
      const restSnap = await getDoc(doc(db, "restaurants", restaurantId));
      if (restSnap.exists()) {
        const restData = restSnap.data() || {};
        const patch = {};
        if (user?.uid && !restData.ownerUid) patch.ownerUid = user.uid;
        if (email && !restData.ownerEmail) patch.ownerEmail = email;
        if (ownerName && !restData.ownerName) patch.ownerName = ownerName;
        if (Object.keys(patch).length) {
          patch.updatedAt = serverTimestamp();
          await setDoc(doc(db, "restaurants", restaurantId), patch, { merge: true });
        }
        return { id: restSnap.id, ...restData, ...patch };
      }
    } catch {}
  }

  const restRef = doc(collection(db, "restaurants"));
  restaurantId = restRef.id;
  const status = resolveRestaurantStatusFromLead(lead.status || "registered", "");
  const locations = normalizeLeadLocations(lead.locations || [], lead.address || "", {
    lat: lead.lat ?? null,
    lng: lead.lng ?? null
  });
  const primaryLocation = getPrimaryLeadLocation(locations);
  const locationPayload = locations
    .filter((item) => item.address || hasLeadLocationCoords(item))
    .map((item) => {
      const row = { address: item.address || "" };
      if (hasLeadLocationCoords(item)) {
        row.lat = Number(item.lat);
        row.lng = Number(item.lng);
      }
      return row;
    });
  const restPayload = {
    name: lead.businessName || lead.name || ownerName || "Business",
    restaurantName: lead.businessName || lead.name || ownerName || "Business",
    type: resolveCustomerType(lead.customerType || lead.type || "cafe"),
    city: lead.city || "",
    address: primaryLocation.address || lead.address || "",
    phone: lead.phone || "",
    instagram: lead.instagram || lead.insta || "",
    insta: lead.instagram || lead.insta || "",
    ownerEmail: email || "",
    ownerName: ownerName || "",
    ownerUid: user?.uid || "",
    logoUrl: lead.logoUrl || lead.logo || lead.imageUrl || "",
    logo: lead.logoUrl || lead.logo || lead.imageUrl || "",
    status,
    leadId: lead.id || "",
    locations: locationPayload,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    createdByRole: "migration"
  };
  if (hasLeadLocationCoords(primaryLocation)) {
    restPayload.lat = Number(primaryLocation.lat);
    restPayload.lng = Number(primaryLocation.lng);
  } else if (Number.isFinite(Number(lead.lat)) && Number.isFinite(Number(lead.lng))) {
    restPayload.lat = Number(lead.lat);
    restPayload.lng = Number(lead.lng);
  }
  await setDoc(restRef, restPayload, { merge: true });
  await ensureRestaurantPublicMeta(restaurantId, restPayload);
  if (lead.id) {
    await setDoc(doc(db, "leads", lead.id), {
      restaurantId,
      updatedAt: serverTimestamp()
    }, { merge: true });
  }
  return { id: restaurantId, ...restPayload };
}

function matchesRestaurantOwner(rest, user) {
  if (!rest || !user) return false;
  return matchesRestaurantIdentity(rest, {
    uid: String(user.uid || ""),
    email: String(user.email || "")
  });
}

async function resolveRestaurantForAuthUser(user, { preferCached = true } = {}) {
  if (!user) return null;
  const uid = String(user.uid || "");
  const email = String(user.email || "").toLowerCase();
  const hintId = String(state.userProfile?.restaurantId || "").trim();

  if (preferCached && hintId) {
    const hinted = state.restaurants.find((rest) => String(rest.id) === hintId) || null;
    if (hinted && matchesRestaurantOwner(hinted, user)) return hinted;
    try {
      const hintSnap = await getDoc(doc(db, "restaurants", hintId));
      if (hintSnap.exists()) {
        const hintedDoc = { id: hintSnap.id, ...(hintSnap.data() || {}) };
        state.restaurants = mergeRestaurants(state.restaurants, [hintedDoc]);
        if (matchesRestaurantOwner(hintedDoc, user)) return hintedDoc;
      }
    } catch {}
  }

  if (preferCached && Array.isArray(state.restaurants) && state.restaurants.length) {
    const cached = state.restaurants.find((rest) => matchesRestaurantOwner(rest, user));
    if (cached) return cached;
  }

  if (uid) {
    const byUid = await findRestaurantByUid(uid);
    if (byUid) return byUid;
  }

  if (email) {
    const byEmail = await findRestaurantByEmail(email);
    if (byEmail) return byEmail;
  }

  return null;
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

  const needsRemoteRoleCheck = !profileRoles.length;
  if (needsRemoteRoleCheck) {
    const [ceoSnap, staffSnap] = await Promise.all([
      getDoc(doc(db, "superadmins", user.uid)).catch(() => null),
      getDoc(doc(db, "staffAdmins", user.uid)).catch(() => null)
    ]);

    if (ceoSnap?.exists?.()) roles.add("ceo");
    if (staffSnap?.exists?.()) roles.add("staff");
  }

  if (!roles.has("owner") && profile?.restaurantId) {
    try {
      const staffSnap = await getDoc(doc(db, "restaurants", profile.restaurantId, "staff", user.uid));
      if (staffSnap.exists()) {
        const staffRoles = normalizeRoleList(staffSnap.data()?.roles || staffSnap.data()?.role || "");
        if (staffRoles.includes("owner") || staffRoles.includes("admin")) roles.add("owner");
      }
    } catch {}
  }

  const shouldResolveOwnerRestaurant = !ownerRestaurantId && (
    roles.has("owner")
    || String(profile.role || "").toLowerCase() === "business"
    || !profileRoles.length
  );
  if (shouldResolveOwnerRestaurant && !ownerRestaurantId) {
    ownerRestaurantId = await findOwnerRestaurantId(user);
  }
  if (shouldResolveOwnerRestaurant && !ownerRestaurantId) {
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
  const value = normalizeLeadTypeKey(type) || String(type || "").toLowerCase();
  if (["food", "restaurant", "cafe", "fastfood"].includes(value)) return "utensils";
  if (["ecommerce", "lebensmittel"].includes(value)) return "shopping-bag";
  if (["apotheken"].includes(value)) return "cross";
  if (["tankstelle"].includes(value)) return "fuel";
  if (["services"].includes(value)) return "wrench";
  if (["live", "nightlife", "club", "bar"].includes(value)) return "radio";
  if (["drink", "cocktail"].includes(value)) return "zap";
  return "zap";
}

let leafletMap = null;
let leafletBizMarkers = [];
let leafletUserMarker = null;
let locationPickerMap = null; // NEU: Fuer das Settings-Modal
let locationPickerBizMarkers = [];
let verifiedMapLocation = null; // NEU: Fuer die Koordinaten-Speicherung
let locationPickerTarget = { addressInputId: "settingsAddress", coordsDisplayId: "coordsDisplay", context: "settings" };

function hashValue(input) {
  return Array.from(String(input || "")).reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
}

function getRestaurantLocations(rest) {
  const geo = getGeo(rest) || {};
  return normalizeLeadLocations(rest?.locations || [], rest?.address || rest?.city || "", {
    lat: rest?.lat ?? geo?.lat,
    lng: rest?.lng ?? geo?.lng
  });
}

function normalizeBusinessLocation(rest, idx, location = null, locationIndex = 0) {
  const geo = getGeo(rest);
  const baseLat = 42.6629;
  const baseLng = 21.1655;
  const hash = hashValue(`${rest.id || rest.name || idx}:${locationIndex}`);

  const row = location || {};
  let lat = parseFloat(row.lat ?? rest.lat ?? geo?.lat);
  let lng = parseFloat(row.lng ?? rest.lng ?? geo?.lng);

  if (isNaN(lat) || isNaN(lng)) {
    lat = baseLat + (((hash % 200) - 100) * 0.0025);
    lng = baseLng + ((((hash >> 3) % 200) - 100) * 0.003);
  }

  return {
    id: rest.id,
    markerKey: `${rest.id || "biz"}:${locationIndex}`,
    locationIndex,
    name: rest.name || rest.restaurantName || "Business",
    type: rest.type || "food",
    lat,
    lng,
    address: row.address || rest.address || rest.city || "Prishtina",
    hours: rest.hours || rest.openHours || "08:00 - 23:00",
    rating: rest.rating || rest.score || 4.8,
    img: rest.logoUrl || rest.logo || rest.heroUrl || rest.coverUrl || "",
    desc: rest.description || rest.bio || "Offizielles Lokal auf MENYRA.",
    raw: rest
  };
}

function buildRestaurantLocations(rest, idx) {
  const locations = getRestaurantLocations(rest);
  if (!locations.length) {
    return [normalizeBusinessLocation(rest, idx, null, 0)];
  }
  return locations.map((location, locationIndex) => normalizeBusinessLocation(rest, idx, location, locationIndex));
}

function cleanupLeaflet() {
  try {
    if (leafletMap) leafletMap.remove();
  } catch {}
  leafletMap = null;
  leafletBizMarkers = [];
  leafletUserMarker = null;
}

function isLeafletMapMountedOn(element) {
  if (!leafletMap || !element) return false;
  try {
    const container = typeof leafletMap.getContainer === "function" ? leafletMap.getContainer() : null;
    if (!container) return false;
    if (container !== element) return false;
    if (!document.body.contains(container)) return false;
    return true;
  } catch {
    return false;
  }
}

function scheduleLeafletRefresh(retries = 3) {
  if (!leafletMap || !document.getElementById("leafletMap")) return;
  const run = (left) => {
    if (!leafletMap) return;
    const el = document.getElementById("leafletMap");
    if (!el || !isLeafletMapMountedOn(el)) return;
    try { leafletMap.invalidateSize(); } catch {}
    if (left <= 0) return;
    window.setTimeout(() => run(left - 1), 180);
  };
  run(Math.max(0, Number(retries) || 0));
}

function makeLocationPickerBizIcon(location) {
  const safeImg = location.img && !isPlaceholderUrl(location.img) ? escapeHtml(location.img) : PLACEHOLDER_IMAGE;
  const html = `
    <div class="relative flex flex-col items-center justify-center z-[400]">
      <div class="w-11 h-11 rounded-[0.9rem] shadow-lg flex items-center justify-center border-[3px] border-white bg-white overflow-hidden p-0.5">
        <img src="${safeImg}" class="w-full h-full object-cover rounded-[0.7rem]" onerror="this.src='${PLACEHOLDER_IMAGE}'"/>
      </div>
      <div class="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-white drop-shadow-md -mt-1"></div>
    </div>
  `;
  return window.L.divIcon({ className: "custom-div-icon", html, iconSize: [44, 54], iconAnchor: [22, 54] });
}

function clearLocationPickerBizMarkers() {
  if (!locationPickerMap) {
    locationPickerBizMarkers = [];
    return;
  }
  locationPickerBizMarkers.forEach((marker) => {
    try { locationPickerMap.removeLayer(marker); } catch {}
  });
  locationPickerBizMarkers = [];
}

function buildLeadLocationPickerLocations() {
  const out = [];
  const seen = new Set();
  const pushLocation = (entry) => {
    const coords = normalizeCoordPair(entry?.lat, entry?.lng);
    if (!coords) return;
    const lat = coords.lat;
    const lng = coords.lng;
    const key = `${entry.markerKey || entry.id || "loc"}:${lat.toFixed(6)}:${lng.toFixed(6)}`;
    if (seen.has(key)) return;
    seen.add(key);
    out.push({ ...entry, lat, lng });
  };
  const businessLocationsByRestaurant = new Map();
  (Array.isArray(state.businessLocations) ? state.businessLocations : []).forEach((biz) => {
    const id = String(biz?.id || "");
    if (!id) return;
    if (!businessLocationsByRestaurant.has(id)) businessLocationsByRestaurant.set(id, []);
    businessLocationsByRestaurant.get(id).push(biz);
  });

  const customers = Array.isArray(state.customers.items) && state.customers.items.length
    ? state.customers.items
    : (Array.isArray(state.restaurants) ? state.restaurants.filter(isCustomerRestaurant) : []);

  customers.forEach((rest, restIndex) => {
    const restId = String(rest?.id || "");
    const mapLocations = restId ? (businessLocationsByRestaurant.get(restId) || []) : [];
    const mapCoordRows = mapLocations
      .map((biz, idx) => {
        const coords = normalizeCoordPair(biz?.lat, biz?.lng);
        if (!coords) return null;
        return { ...coords, biz, idx };
      })
      .filter(Boolean);
    if (mapCoordRows.length && !(Array.isArray(rest?.locations) && rest.locations.length)) {
      mapLocations.forEach((biz, bizIndex) => {
        pushLocation({
          id: rest.id || `customer_${restIndex}`,
          markerKey: `customer:${rest.id || restIndex}:${biz.locationIndex ?? bizIndex}`,
          name: rest.name || rest.restaurantName || biz.name || "Business",
          img: rest.logoUrl || rest.logo || rest.heroUrl || rest.coverUrl || biz.img || "",
          address: biz.address || rest.address || rest.city || "Prishtina",
          lat: biz.lat,
          lng: biz.lng
        });
      });
      return;
    }

    const restCoords = resolveCoordsFromEntity(rest);
    const locations = normalizeLeadLocations(rest?.locations || [], rest?.address || rest?.city || "", restCoords || null);
    let placed = false;
    locations.forEach((loc, locIndex) => {
      const directCoords = resolveCoordsFromEntity(loc) || restCoords || null;
      const refCoords = mapCoordRows[locIndex] || mapCoordRows[0] || null;
      const coords = preferStableCoords(directCoords, refCoords);
      if (!coords) return;
      placed = true;
      pushLocation({
        id: rest.id || `customer_${restIndex}`,
        markerKey: `customer:${rest.id || restIndex}:${locIndex}`,
        name: rest.name || rest.restaurantName || "Business",
        img: rest.logoUrl || rest.logo || rest.heroUrl || rest.coverUrl || "",
        address: loc.address || rest.address || rest.city || "Prishtina",
        lat: coords.lat,
        lng: coords.lng
      });
    });

    if (!placed && mapCoordRows.length) {
      mapCoordRows.forEach(({ biz, idx, lat, lng }) => {
        pushLocation({
          id: rest.id || `customer_${restIndex}`,
          markerKey: `customer:${rest.id || restIndex}:${biz.locationIndex ?? idx}`,
          name: rest.name || rest.restaurantName || biz.name || "Business",
          img: rest.logoUrl || rest.logo || rest.heroUrl || rest.coverUrl || biz.img || "",
          address: biz.address || rest.address || rest.city || "Prishtina",
          lat,
          lng
        });
      });
    }
  });

  const leads = Array.isArray(state.leads.items) ? state.leads.items : [];
  leads
    .filter((lead) => normalizeLeadStatusKey(lead?.status || "") !== "kunde")
    .forEach((lead, leadIndex) => {
      const leadRestaurantId = String(lead?.restaurantId || "");
      const restMapLocations = leadRestaurantId ? (businessLocationsByRestaurant.get(leadRestaurantId) || []) : [];
      const restMapCoordRows = restMapLocations
        .map((biz, idx) => {
          const coords = normalizeCoordPair(biz?.lat, biz?.lng);
          if (!coords) return null;
          return { ...coords, biz, idx };
        })
        .filter(Boolean);
      if (restMapCoordRows.length && !(Array.isArray(lead?.locations) && lead.locations.length)) {
        restMapCoordRows.forEach(({ biz, idx, lat, lng }) => {
          pushLocation({
            id: lead.id || lead.restaurantId || `lead_${leadIndex}`,
            markerKey: `lead:${lead.id || lead.restaurantId || leadIndex}:rest:${biz.locationIndex ?? idx}`,
            name: lead.businessName || lead.contactName || biz.name || "Lead",
            img: lead.logoUrl || lead.logo || lead.imageUrl || biz.img || "",
            address: lead.address || biz.address || lead.city || "Prishtina",
            lat,
            lng
          });
        });
        return;
      }

      const leadCoords = resolveCoordsFromEntity(lead);
      const locations = normalizeLeadLocations(lead?.locations || [], lead?.address || "", {
        lat: leadCoords?.lat ?? null,
        lng: leadCoords?.lng ?? null
      });
      let placed = false;
      locations.forEach((loc, locIndex) => {
        const directCoords = resolveCoordsFromEntity(loc) || leadCoords || null;
        const refCoords = restMapCoordRows[locIndex] || restMapCoordRows[0] || null;
        const coords = preferStableCoords(directCoords, refCoords);
        if (!coords) return;
        placed = true;
        pushLocation({
          id: lead.id || lead.restaurantId || `lead_${leadIndex}`,
          markerKey: `lead:${lead.id || lead.restaurantId || leadIndex}:${locIndex}`,
          name: lead.businessName || lead.contactName || "Lead",
          img: lead.logoUrl || lead.logo || lead.imageUrl || "",
          address: loc.address || lead.address || lead.city || "Prishtina",
          lat: coords.lat,
          lng: coords.lng
        });
      });

      if (!placed && restMapCoordRows.length) {
        restMapCoordRows.forEach(({ biz, idx, lat, lng }) => {
          pushLocation({
            id: lead.id || lead.restaurantId || `lead_${leadIndex}`,
            markerKey: `lead:${lead.id || lead.restaurantId || leadIndex}:rest:${biz.locationIndex ?? idx}`,
            name: lead.businessName || lead.contactName || biz.name || "Lead",
            img: lead.logoUrl || lead.logo || lead.imageUrl || biz.img || "",
            address: lead.address || biz.address || lead.city || "Prishtina",
            lat,
            lng
          });
        });
      }
    });

  return out;
}

function renderLocationPickerContextMarkers() {
  if (!locationPickerMap || !window.L) return;
  const context = String(locationPickerTarget.context || "");
  clearLocationPickerBizMarkers();
  if (!(context === "lead" || context.startsWith("lead_location:"))) return;

  const locations = buildLeadLocationPickerLocations();
  locationPickerBizMarkers = locations.map((location) => (
    window.L.marker([location.lat, location.lng], {
      icon: makeLocationPickerBizIcon(location),
      keyboard: false,
      interactive: false
    }).addTo(locationPickerMap)
  ));
}

function makeBizDivIcon(b) {
  const selected = state.selectedBusiness || {};
  const selectedKey = String(selected.markerKey || "");
  const isSelected = selectedKey
    ? selectedKey === String(b.markerKey || "")
    : (String(selected.id || "") === String(b.id || "")
      && Number(selected.locationIndex || 0) === Number(b.locationIndex || 0));
  const safeImg = b.img && !isPlaceholderUrl(b.img) ? escapeHtml(b.img) : PLACEHOLDER_IMAGE;
  const html = `
    <div class="relative flex flex-col items-center justify-center transition-all duration-300 ${isSelected ? 'scale-110 z-[500]' : 'hover:scale-105 z-[400]'}">
      <div class="w-12 h-12 rounded-[1rem] shadow-lg flex items-center justify-center border-[3px] ${isSelected ? 'border-indigo-600' : 'border-white'} bg-white overflow-hidden p-0.5">
        <img src="${safeImg}" class="w-full h-full object-cover rounded-xl" onerror="this.src='${PLACEHOLDER_IMAGE}'"/>
      </div>
      <div class="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] ${isSelected ? 'border-t-indigo-600' : 'border-t-white drop-shadow-md'} -mt-1"></div>
    </div>
  `;
  return window.L.divIcon({ className: "custom-div-icon", html, iconSize: [48, 58], iconAnchor: [24, 58] });
}

function isDiscoverableMapBusiness(location = {}) {
  const typeKey = normalizeRestaurantType(
    location?.type
    || location?.raw?.type
    || location?.raw?.customerType
    || location?.raw?.category
    || location?.raw?.kind
    || location?.raw?.restaurantType
    || ""
  );
  return typeKey !== "ecommerce";
}

function getDiscoverableMapLocations(locations = state.businessLocations) {
  return (Array.isArray(locations) ? locations : []).filter(isDiscoverableMapBusiness);
}

function updateMapSheet() {
  const slot = document.getElementById("mapSheetSlot");
  if (!slot) return;
  if (state.selectedBusiness && !isDiscoverableMapBusiness(state.selectedBusiness)) {
    state.selectedBusiness = null;
  }
  slot.innerHTML = state.selectedBusiness ? renderMapSheet(state.selectedBusiness) : "";
  bindMapSheetEvents();
  if (window.lucide?.createIcons) window.lucide.createIcons();
}

function bindMapSheetEvents() {
  const mapCloseBtn = document.getElementById("mapCloseBtn");
  if (mapCloseBtn) {
    mapCloseBtn.addEventListener("click", () => {
      state.selectedBusiness = null;
      renderLeafletMarkers(state.businessLocations);
      updateMapSheet();
    });
  }

  const mapOpenRouteBtn = document.getElementById("mapOpenRouteBtn");
  if (mapOpenRouteBtn) {
    mapOpenRouteBtn.addEventListener("click", () => {
      if (!state.selectedBusiness) return;
      const { lat, lng } = state.selectedBusiness;
      if (typeof lat !== "number" || typeof lng !== "number") return;
      const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
      window.open(url, "_blank");
    });
  }

  const mapVisitProfileBtn = document.getElementById("mapVisitProfileBtn");
  const mapVisitProfileImgBtn = document.getElementById("mapVisitProfileImgBtn");
  [mapVisitProfileBtn, mapVisitProfileImgBtn].forEach(btn => {
    if (btn) {
      btn.addEventListener("click", () => {
        if (!state.selectedBusiness) return;
        openProfileViewFromBusiness({
          id: state.selectedBusiness.id,
          name: state.selectedBusiness.name
        });
      });
    }
  });
}

function initLeafletIfNeeded() {
  if (!state.user || state.activeTab !== "map") {
    cleanupLeaflet();
    return;
  }

  const el = document.getElementById("leafletMap");
  if (!el || !window.L) return;

  if (leafletMap && !isLeafletMapMountedOn(el)) {
    cleanupLeaflet();
  }

  if (leafletMap) {
    try { leafletMap.invalidateSize(); } catch {}
    scheduleLeafletRefresh(2);
    bindMapSearchInput();
    return;
  }

  // Zoom Level 15 = ca 2km Radius
  leafletMap = window.L.map(el, { zoomControl: false, attributionControl: false, preferCanvas: true }).setView([42.6629, 21.1655], 15);
  window.L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", { maxZoom: 19 }).addTo(leafletMap);
  try {
    leafletMap.whenReady(() => {
      scheduleLeafletRefresh(3);
    });
  } catch {}

  renderLeafletMarkers(getDiscoverableMapLocations(state.businessLocations));
  updateMapSheet();
  if (window.lucide?.createIcons) window.lucide.createIcons();

  mapLocate();
  bindMapSearchInput();
  scheduleLeafletRefresh(3);
}

function renderLeafletMarkers(locations) {
  if (!leafletMap || !window.L) return;
  const visibleLocations = getDiscoverableMapLocations(locations);
  leafletBizMarkers.forEach(marker => { try { leafletMap.removeLayer(marker); } catch {} });
  leafletBizMarkers = visibleLocations.map((b) => {
    const marker = window.L.marker([b.lat, b.lng], { icon: makeBizDivIcon(b) }).addTo(leafletMap);
    marker.__biz = b;
    marker.on("click", () => {
      state.selectedBusiness = b;
      renderLeafletMarkers(visibleLocations);
      updateMapSheet();
      try { leafletMap.panTo([b.lat - 0.003, b.lng], { animate: true, duration: 0.5 }); } catch {}
    });
    return marker;
  });
}

function filterMapLocationsByQuery(query) {
  const key = String(query || "").toLowerCase().trim();
  const baseLocations = getDiscoverableMapLocations(state.businessLocations);
  if (!key) return baseLocations;
  return baseLocations.filter(b =>
    b.name.toLowerCase().includes(key) || (b.address || b.city || "").toLowerCase().includes(key)
  );
}

function bindMapSearchInput() {
  const searchInput = document.getElementById("mapSearchInput");
  if (!searchInput || searchInput.dataset.bound === "true") return;
  searchInput.addEventListener("input", (e) => {
    const query = e.target.value.toLowerCase();
    const filtered = filterMapLocationsByQuery(query);
    renderLeafletMarkers(filtered);
    state.selectedBusiness = null;
    updateMapSheet();
    if (filtered.length > 0 && query.length > 2) {
      try { leafletMap.panTo([filtered[0].lat, filtered[0].lng], { animate: true, duration: 0.5 }); } catch {}
    }
  });
  searchInput.dataset.bound = "true";
}

function setUserMarker(lat, lng, label = "Deine Position") {
  if (!leafletMap || !window.L) return;
  
  let avatarUrl = getSelfAvatarUrl();
  if (!avatarUrl || isPlaceholderUrl(avatarUrl)) {
    const nameStr = state.userProfile.name || "User";
    avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(nameStr)}&background=4f46e5&color=fff`;
  }

  const html = `
    <div class="relative w-12 h-12 z-[1000] user-radar">
      <img src="${escapeHtml(avatarUrl)}" class="w-full h-full rounded-full object-cover border-[3px] border-white shadow-lg relative z-10 bg-slate-200" onerror="this.src='${PLACEHOLDER_IMAGE}'" />
    </div>
  `;
  const markerIcon = window.L.divIcon({ className: "custom-div-icon", html, iconSize: [48, 48], iconAnchor: [24, 24] });

  if (!leafletUserMarker) {
    leafletUserMarker = window.L.marker([lat, lng], { icon: markerIcon, zIndexOffset: 2000 }).addTo(leafletMap);
  } else {
    leafletUserMarker.setLatLng([lat, lng]);
    leafletUserMarker.setIcon(markerIcon);
  }
}

function mapLocate() {
  const override = getCeoGpsOverride();
  if (isCeoUser() && override) {
    if (leafletMap) {
      try { leafletMap.setView([override.lat, override.lng], 15, { animate: true }); } catch {}
      setUserMarker(override.lat, override.lng, "Deine Position");
    }
    return;
  }
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
  let snap = null;
  if (typeof getDocFromServer === "function") {
    try {
      snap = await getDocFromServer(ref);
    } catch {
      // Fall through to cached getDoc
    }
  }
  try {
    snap = snap || await getDoc(ref);
  } catch {
    snap = null;
  }
  if (snap && typeof snap.exists === "function" && snap.exists()) return snap;
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
    if (isLocalBusinessProfile(state.userProfile) && state.userProfile.restaurantId) {
      const restSnap = await getDoc(doc(db, "restaurants", state.userProfile.restaurantId));
      if (restSnap.exists()) {
        const restData = restSnap.data() || {};
        const raw = restData.logoUrl || restData.logo || "";
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
      }
      return fallbackFromState();
    }
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
  const restaurantId = state.menuDetail.restaurantId
    || state.menu.restaurantId
    || state.profileView?.profile?.restaurantId
    || state.userProfile.restaurantId
    || "";
  const itemId = getMenuItemSocialId(item);
  if (!restaurantId || !itemId) return null;
  const key = menuItemMetaKey(restaurantId, itemId);
  const ref = doc(db, "restaurants", restaurantId, "menuSocial", itemId);
  return { item, restaurantId, itemId, key, ref };
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
  if (queryKey.length < 3) {
    state.search.userResults = [];
    state.search.loading = false;
    state.search.error = "";
    if (!refreshSearchView()) render();
    return;
  }
  if (!refreshSearchView()) render();
  searchTimer = window.setTimeout(() => {
    void searchRemote(raw);
  }, 450);
}

function ensureTabData(tab) {
  if (!state.user) return;
  stopRestaurantsListener();
  if (tab === "chat") {
    startChatThreadsListener(state.user);
  } else {
    stopChatThreadsListener();
  }
  if (tab === "orders") {
    startOrdersListener(state.user);
  } else {
    stopOrdersListener();
  }
  if (tab !== "feed") {
    stopRestaurantMetaListeners();
    if (feedUnsub) {
      feedUnsub();
      feedUnsub = null;
    }
    if (storiesUnsub) {
      storiesUnsub();
      storiesUnsub = null;
    }
  }
  if (tab !== "feed" && feedDeltaTimer) {
    clearInterval(feedDeltaTimer);
    feedDeltaTimer = null;
  }

  if (tab === "feed" && !dataLoaded.feed) {
    dataLoaded.feed = true;
    dataLoaded.stories = true;
    void loadFeedPosts();
  }

  const needsRestaurants = tab === "map" || tab === "search" || (!FAST_MODE && tab === "feed");
  if (needsRestaurants && !dataLoaded.restaurants) {
    dataLoaded.restaurants = true;
    scheduleIdle(() => {
      loadRestaurants().catch((err) => console.error(err));
    });
  }

  if (tab === "profile" && !dataLoaded.profile) {
    dataLoaded.profile = true;
    const hasBusinessProfile = isLocalBusinessProfile(state.userProfile);
    if (!hasBusinessProfile) {
      void loadUserPosts();
    }
    if (hasBusinessProfile) {
      void loadBusinessPosts();
    }
  }
  if (tab === "profile") {
    void loadAuthProfile(state.user);
  }

  if (tab === "menu") {
    void loadAuthProfile(state.user).then(() => {
      const restaurantId = state.userProfile.restaurantId || "";
      if (restaurantId) {
        void loadMenuForRestaurant(restaurantId, { source: "hybrid" });
        void loadFocusForRestaurant(restaurantId);
      }
    });
  }

  if (tab === "notifications" && !dataLoaded.notifications) {
    dataLoaded.notifications = true;
    void loadNotificationsFromFirebase({ force: true });
  }

  if (tab === "leads" && !dataLoaded.leads) {
    dataLoaded.leads = true;
    if (isCeoUser()) {
      void loadLeads({ scope: state.leads.scope });
    }
  } else if (tab === "leads" && isCeoUser() && !state.leads.loaded?.[normalizeLeadScopeKey(state.leads.scope)]) {
    void loadLeads({ scope: state.leads.scope });
  }

  if (tab === "customers" && !dataLoaded.customers) {
    dataLoaded.customers = true;
    if (isCeoUser()) {
      void loadCustomers({ scope: state.customers.scope });
    }
  } else if (tab === "customers" && isCeoUser() && !state.customers.loaded?.[normalizeCustomerScopeKey(state.customers.scope)]) {
    void loadCustomers({ scope: state.customers.scope });
  }

  if (tab === "staff" && !dataLoaded.staff) {
    dataLoaded.staff = true;
    if (isCeoUser()) {
      void loadCeoStaff().catch(() => {});
    }
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

function closeProfileModal() {
  state.profileModal = { open: false, profile: null };
  renderOverlays();
}

function closeLikesModal() {
  state.likesModal = { open: false, postId: "", animate: false };
  renderOverlays({ updateLikes: true });
}

function closeActiveModal() {
  if (state.likesModal.open) {
    closeLikesModal();
    return true;
  }
  if (state.menuDetail.open) {
    closeMenuDetail();
    return true;
  }
  if (state.menuModal.open) {
    closeMenuModal();
    return true;
  }
  if (state.focusModal.open) {
    closeFocusModal();
    return true;
  }
  if (state.customerModal.open) {
    closeCustomerModal();
    return true;
  }
  if (state.leadModal.open) {
    closeLeadModal();
    return true;
  }
  if (state.postModal.open) {
    closePostModal();
    return true;
  }
  if (state.profileModal.open) {
    closeProfileModal();
    return true;
  }
  return false;
}

function isAnyModalOpen() {
  return !!(
    state.profileModal.open
    || state.postModal.open
    || state.likesModal.open
    || state.menuModal.open
    || state.menuDetail.open
    || state.focusModal.open
    || state.leadModal.open
    || state.customerModal.open
  );
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
  attachPostMetaListeners(post);
  void loadPostMetaFromFirebase(post).then(() => {
    if (state.postModal.open && state.postModal.post && String(state.postModal.post.id) === String(post.id)) {
      updatePostModalMeta();
    }
  });
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

async function toggleMenuItemLike() {
  if (!state.user) return;
  const ctx = getMenuDetailContext();
  if (!ctx) return;
  const { ref, key } = ctx;
  const user = currentUserBadge();
  if (!user.uid) return;
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
    if (delta < 0) {
      const idx = meta.likes.findIndex((item) => item.uid === user.uid || item.handle === user.handle);
      if (idx >= 0) meta.likes.splice(idx, 1);
    } else {
      meta.likes.unshift({ uid: user.uid, name: user.name, handle: user.handle, avatar: user.avatar });
    }
    meta.counts = meta.counts || { likes: 0, comments: 0 };
    meta.counts.likes = Math.max(0, (Number(meta.counts.likes) || 0) + delta);
    state.menuItemMeta[key] = meta;
    updateMenuDetailCountsOnly();
    updateMenuCardCountNodes(ctx.itemId, resolveMenuItemCounts(meta));
  } catch (err) {
    console.error(err);
  }
}

async function addMenuItemComment(text) {
  const trimmed = String(text || "").trim();
  if (!trimmed || !state.user) return;
  const ctx = getMenuDetailContext();
  if (!ctx) return;
  const { ref, key } = ctx;
  const dedupeKey = `${key}|${state.user.uid || ""}|${trimmed}`;
  const now = Date.now();
  if (dedupeKey === lastMenuCommentKey && now - lastMenuCommentAt < 1500) return;
  lastMenuCommentKey = dedupeKey;
  lastMenuCommentAt = now;
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
    if (user.uid) commentAvatarCache.set(user.uid, finalAvatar);
    if (handleKey) commentAvatarCache.set(handleKey, finalAvatar);
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
    lastMenuCommentKey = "";
    lastMenuCommentAt = 0;
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
  const input = document.getElementById("menuDetailCommentInput");
  if (input) {
    input.value = "";
    autosizeTextarea(input, { minHeight: 56, maxHeight: 160 });
  }

  state.menuDetail.sending = false;
  updateMenuDetailMeta();
  updateMenuCardCountNodes(ctx.itemId, resolveMenuItemCounts(meta));
  if (finalAvatar) scheduleCommentAvatarDomUpdate(user.uid || "", handleKey, finalAvatar);
  refreshSelfCommentAvatars();
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
    <div class="h-full min-h-full overflow-y-auto bg-slate-50 flex flex-col p-8 font-sans animate-in">
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
            <div class="pt-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Registrierung nur fuer User
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
  const chatUnread = getChatUnreadCount();
  const switchLinks = renderRoleSwitchLinks();
  const isCeo = isCeoUser();
  const catalogLabel = getBusinessCatalogLabel(state.userProfile);
  const catalogIcon = catalogLabel === "Shop" ? "shopping-bag" : "utensils";
  const showMenuTab = isLocalBusinessProfile(state.userProfile)
    || !!state.userProfile.restaurantId
    || !!state.roleSwitchRestaurantId
    || isRestaurantCafeProfile(state.userProfile);
  const avatarUrl = resolveUserAvatar(state.userProfile.avatar);
  const avatarFit = logoFitClass(isLocalBusinessProfile(state.userProfile));
  const navItems = [
    { id: "feed", label: "Feed", icon: "home" },
    { id: "chat", label: "Chats", icon: "messages-square", badge: chatUnread, badgeType: "chat" },
    { id: "search", label: "Suche", icon: "search" },
    { id: "map", label: "Karte", icon: "map" },
    { id: "profile", label: "Profil", icon: "user" },
    { id: "menu", label: catalogLabel, icon: catalogIcon, hidden: !showMenuTab },
    { id: "orders", label: "Bestellungen", icon: "shopping-cart" },
    { id: "notifications", label: "Updates", icon: "bell", badge: unread, badgeType: "notifications" },
    { id: "leads", label: "Leads", icon: "clipboard-list", hidden: !isCeo },
    { id: "staff", label: "Staff", icon: "users-round", hidden: !isCeo },
    { id: "customers", label: "Kunden", icon: "users", hidden: !isCeo },
    { id: "settings", label: "Optionen", icon: "settings" }
  ];
  return `
    <div id="drawerRoot" class="fixed inset-0 z-[2000] overflow-hidden transition-all duration-500 ${state.drawerOpen ? "visible" : "invisible"}" style="overscroll-behavior:none;">
      <div id="drawerOverlay" class="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity ${state.drawerOpen ? "opacity-100" : "opacity-0"}" style="touch-action:none; overscroll-behavior:none;"></div>
      <div id="drawerPanel" class="absolute left-0 top-0 bottom-0 w-80 max-w-[86vw] bg-white shadow-2xl transition-transform duration-500 p-8 flex flex-col overflow-y-auto ${state.drawerOpen ? "translate-x-0" : "-translate-x-full"}" style="overscroll-behavior:contain; -webkit-overflow-scrolling:touch;">
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
          ${navItems.map((item) => `
            <button data-nav="${item.id}" class="w-full flex items-center justify-between p-4 rounded-2xl font-black text-xs transition-all ${item.hidden ? "hidden" : ""} ${state.activeTab === item.id ? "bg-indigo-600 text-white shadow-xl shadow-indigo-500/20" : "text-slate-400 hover:bg-slate-50"}">
              <div class="flex items-center gap-4">
                ${item.id === "menu"
                  ? `<i data-menu-nav-icon data-lucide="${item.icon}" class="w-4 h-4"></i><span data-menu-nav-label>${item.label}</span>`
                  : `${icon(item.icon, "w-4 h-4")} ${item.label}`
                }
              </div>
              ${item.badge ? `<span ${item.badgeType === "chat" ? 'data-chat-badge="drawer"' : 'data-unread-badge="drawer"'} class="bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md">${item.badge > 9 ? "9+" : item.badge}</span>` : ""}
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
      ${isLocalBusinessProfile(state.userProfile) ? `
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
          likesModal: { open: false, postId: "", animate: false },
          leadModal: { open: false, mode: "create", lead: null, status: "", loading: false, logoFile: null, logoPreview: "", coords: null, locations: [] },
          customerModal: { open: false, mode: "edit", customer: null, status: "", loading: false, logoFile: null, logoPreview: "" }
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
  const isBusiness = isLocalBusinessProfile(state.userProfile);
  const branding = resolveHeaderBranding();
  const catalogLabel = getBusinessCatalogLabel(state.userProfile);
  const catalogIcon = catalogLabel === "Shop" ? "shopping-bag" : "utensils";
  const showMenuTab = isLocalBusinessProfile(state.userProfile)
    || !!state.userProfile.restaurantId
    || !!state.roleSwitchRestaurantId
    || isRestaurantCafeProfile(state.userProfile);
  const showCeoTabs = isCeoUser();
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
    headerTitle.classList.remove("font-elegant", "font-semibold", "tracking-wide");
    headerTitle.classList.add("font-black", "italic", "tracking-tighter");
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
  const menuNavBtn = document.querySelector('[data-nav="menu"]');
  if (menuNavBtn) {
    menuNavBtn.classList.toggle("hidden", !showMenuTab);
    const menuLabel = menuNavBtn.querySelector("[data-menu-nav-label]");
    if (menuLabel && menuLabel.textContent !== catalogLabel) {
      menuLabel.textContent = catalogLabel;
    }
    const menuIcon = menuNavBtn.querySelector("[data-menu-nav-icon]");
    if (menuIcon) {
      const currentIcon = menuIcon.getAttribute("data-lucide") || "";
      if (currentIcon !== catalogIcon) {
        menuIcon.setAttribute("data-lucide", catalogIcon);
      }
    }
  }
  document.querySelectorAll('[data-nav="leads"], [data-nav="customers"]').forEach((btn) => {
    btn.classList.toggle("hidden", !showCeoTabs);
  });
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
  stopChatThreadsListener();
  stopActiveChatMessagesListener();
  stopOrdersListener();
  if (feedDeltaTimer) {
    clearInterval(feedDeltaTimer);
    feedDeltaTimer = null;
  }
  if (notificationsUnsub) {
    notificationsUnsub();
    notificationsUnsub = null;
  }
  if (followingUnsub) {
    followingUnsub();
    followingUnsub = null;
  }
  if (userDocUnsub) {
    userDocUnsub();
    userDocUnsub = null;
  }
  userDocLiveKey = "";
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
  stopRestaurantsListener();
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
  const chatUnread = getChatUnreadCount();
  const headerUnread = unread + chatUnread;
  const headerBadgeText = headerUnread > 9 ? "9+" : String(headerUnread);
  const notifBadgeText = unread > 9 ? "9+" : String(unread);
  const chatBadgeText = chatUnread > 9 ? "9+" : String(chatUnread);
  const drawerToggle = document.getElementById("drawerToggle");
  if (drawerToggle) {
    let badge = drawerToggle.querySelector("[data-unread-badge=\"header\"]");
    if (headerUnread > 0) {
      if (!badge) {
        badge = document.createElement("span");
        badge.dataset.unreadBadge = "header";
        badge.className = "absolute -top-1 -right-1 min-w-[20px] h-5 px-1.5 rounded-full bg-rose-500 text-white text-[10px] font-black flex items-center justify-center shadow-lg";
        drawerToggle.appendChild(badge);
      }
      if (badge.textContent !== headerBadgeText) badge.textContent = headerBadgeText;
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
      if (badge.textContent !== notifBadgeText) badge.textContent = notifBadgeText;
    } else if (badge) {
      badge.remove();
    }
  }

  const drawerChatBtn = document.querySelector("[data-nav=\"chat\"]");
  if (drawerChatBtn) {
    let badge = drawerChatBtn.querySelector("[data-chat-badge=\"drawer\"]");
    if (chatUnread > 0) {
      if (!badge) {
        badge = document.createElement("span");
        badge.dataset.chatBadge = "drawer";
        badge.className = "bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md";
        drawerChatBtn.appendChild(badge);
      }
      if (badge.textContent !== chatBadgeText) badge.textContent = chatBadgeText;
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
    const acceptBtn = target.closest("[data-follow-request-accept]");
    if (acceptBtn) {
      const id = acceptBtn.dataset.followRequestAccept;
      if (!id) return;
      void acceptFollowRequest(id);
      return;
    }
    const deleteBtn = target.closest("[data-notif-delete]");
    if (deleteBtn) {
      const id = deleteBtn.dataset.notifDelete;
      if (!id) return;
      const notif = state.notifications.find((n) => n.id === id) || null;
      state.notifications = state.notifications.filter((n) => n.id !== id);
      saveNotifications(state.notifications);
      updateNotificationsDom();
      if (state.user?.uid) {
        void deleteDoc(doc(db, "users", state.user.uid, "notifications", id));
        if (notif?.type === "follow_request" && notif.userUid) {
          void deleteDoc(doc(db, "users", state.user.uid, "followRequests", notif.userUid));
        }
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
  attachCurrentUserProfileListener();
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
      viewProfile.privateAccount = !!data.privateAccount;
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

function updateMenuCardCountNodes(itemId, counts = { likes: 0, comments: 0 }) {
  if (!itemId) return;
  const safeId = escapeSelector(itemId);
  const likesLabel = formatCount(counts.likes ?? 0);
  const commentsLabel = formatCount(counts.comments ?? 0);
  document.querySelectorAll(`[data-menu-like-count="${safeId}"]`).forEach((el) => {
    el.textContent = likesLabel;
  });
  document.querySelectorAll(`[data-menu-comment-count="${safeId}"]`).forEach((el) => {
    el.textContent = commentsLabel;
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
}

function stopMenuItemMetaListeners() {
  if (menuDetailDocUnsub) {
    menuDetailDocUnsub();
    menuDetailDocUnsub = null;
  }
  if (menuDetailLikesUnsub) {
    menuDetailLikesUnsub();
    menuDetailLikesUnsub = null;
  }
  if (menuDetailCommentsUnsub) {
    menuDetailCommentsUnsub();
    menuDetailCommentsUnsub = null;
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

  menuDetailDocUnsub = onSnapshot(ref, (docSnap) => {
    if (!docSnap.exists()) return;
    const data = docSnap.data() || {};
    const meta = ensureMenuItemMeta(key);
    meta.counts = {
      likes: Number(data.likesCount ?? data.likes ?? meta.likes?.length ?? 0) || 0,
      comments: Number(data.commentsCount ?? data.comments ?? meta.comments?.length ?? 0) || 0
    };
    state.menuItemMeta[key] = meta;
    updateMenuDetailCountsOnly();
  });
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
    const commentsSnap = await getDocs(query(collection(ref, "comments"), orderBy("createdAt", "desc"), limit(DETAIL_COMMENTS_LIMIT)));
    const rows = commentsSnap.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }));
    meta.comments = rows.filter((row) => !row.parentId).map((row) => ensureCommentShape(row));
  } catch (err) {
    console.error(err);
  }
  state.menuItemMeta[key] = meta;
  return meta;
}

function renderMapSheet(selected) {
  const imageUrl = getOptimizedImageUrl(selected.img, "thumb");
  return `
    <div class="animate-in slide-in-from-bottom-6 duration-300">
      <div class="bg-white/95 backdrop-blur-xl rounded-[2rem] p-5 shadow-[0_30px_60px_rgba(0,0,0,0.25)] border border-slate-100/50 relative">
        <div class="absolute top-2 left-1/2 -translate-x-1/2 w-12 h-1 bg-slate-200 rounded-full"></div>

        <button id="mapCloseBtn" class="absolute top-4 right-4 w-8 h-8 bg-slate-100/80 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors">
          ${icon("x", "w-4 h-4")}
        </button>

        <div class="flex gap-4 pr-6 mt-2">
          <div id="mapVisitProfileImgBtn" class="w-20 h-20 rounded-[1.5rem] bg-slate-50 p-1 border border-slate-100 shadow-sm flex-shrink-0 overflow-hidden relative group cursor-pointer">
            <img src="${escapeHtml(imageUrl)}" class="w-full h-full object-cover rounded-[1.3rem] group-hover:scale-105 transition-transform" onerror="this.src='${PLACEHOLDER_IMAGE}'" />
          </div>
          <div class="flex-1 pt-1">
            <span class="text-[9px] font-black text-indigo-600 uppercase tracking-widest bg-indigo-50 px-2 py-0.5 rounded-md inline-block mb-1">Restaurant</span>
            <h3 class="text-lg font-black tracking-tight text-slate-900 leading-tight line-clamp-1">${escapeHtml(selected.name || "Business")}</h3>
            <div class="flex items-center gap-2 mt-1 text-[11px] font-black text-slate-700">
              <span class="flex items-center gap-1 text-indigo-600">${icon("star", "w-3 h-3 fill-indigo-600 text-indigo-600")} ${escapeHtml(selected.rating)}</span>
              <span class="text-emerald-500 flex items-center gap-1.5 ml-2"><div class="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.6)]"></div> Geoeffnet</span>
            </div>
            <div class="flex items-center gap-1.5 mt-2 text-slate-500 text-[10px] font-bold line-clamp-1">
              ${icon("map-pin", "w-3 h-3")} ${escapeHtml(selected.address)}
            </div>
          </div>
        </div>

        <div class="mt-5 flex gap-3">
          <button id="mapVisitProfileBtn" class="flex-1 bg-slate-900 text-white py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-wider active:scale-95 transition-all shadow-md flex items-center justify-center gap-2 hover:bg-slate-800">
            ${icon("user", "w-4 h-4")} Profil
          </button>
          <button id="mapOpenRouteBtn" class="w-14 h-[46px] bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center active:scale-95 transition-all hover:bg-indigo-100 border border-indigo-100/50">
            ${icon("navigation", "w-5 h-5")}
          </button>
        </div>
      </div>
    </div>
  `;
}

function renderMapView() {
  const hasLeaflet = !!window.L;
  return `
    <div class="p-5 pb-8 h-full flex flex-col relative animate-in fade-in duration-700">
      <div class="mb-4 px-2 flex justify-between items-end">
        <div>
          <h2 class="text-2xl font-black italic uppercase tracking-tighter text-slate-900">Karte</h2>
          <p class="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1 italic">Entdecke Lokale</p>
        </div>
      </div>

      <div class="relative flex-1 bg-slate-200 rounded-[2.5rem] overflow-hidden shadow-xl border border-slate-200/50 min-h-[500px]">
        
        ${hasLeaflet ? `<div id="leafletMap" class="absolute inset-0 z-10 bg-slate-200"></div>` : `<div class="absolute inset-0 flex items-center justify-center opacity-30 text-slate-500 text-xs font-black uppercase tracking-widest">Leaflet laedt nicht...</div>`}
        
        <div class="absolute top-5 left-4 right-4 z-30">
          <div class="relative group shadow-lg rounded-2xl">
            ${icon("search", "absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400")}
            <input id="mapSearchInput" type="text" placeholder="Stadt, Lokal suchen..." class="w-full h-14 rounded-2xl border border-white/20 bg-white/90 backdrop-blur-xl pl-12 pr-12 text-sm font-bold text-slate-800 outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/50 transition-all" />
          </div>
        </div>

        <div class="absolute bottom-6 right-4 z-30 flex flex-col gap-3">
          <button id="mapLocateBtn" class="w-12 h-12 rounded-2xl bg-indigo-600 shadow-[0_8px_20px_rgba(79,70,229,0.4)] flex items-center justify-center text-white active:scale-95 transition-all">
            ${icon("navigation", "w-5 h-5 fill-white")}
          </button>
        </div>

        <div id="mapSheetSlot" class="absolute bottom-4 left-4 right-4 z-40"></div>
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
  const isBusiness = isLocalBusinessProfile(state.userProfile);
  if (isBusiness) {
    if (state.userProfile.restaurantId) {
      writeCache(businessPostsKey(state.userProfile.restaurantId), state.businessPosts);
    }
  } else {
    if (state.user?.uid) {
      writeCache(userPostsKey(state.user.uid), state.userPosts);
    }
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

async function loadPostMetaFromFirebase(post, { includeLikes = false, includeComments = true } = {}) {
  const postRef = getPostDocRef(post);
  const postId = String(post?.id || "");
  if (!postRef || !postId) return { likes: [], comments: [] };
  const meta = ensurePostMeta(postId);
  const userUid = String(state.user?.uid || "");
  if (includeLikes) {
    try {
      const likesSnap = await getDocs(query(collection(postRef, "likes"), orderBy("createdAt", "desc"), limit(DETAIL_LIKES_LIMIT)));
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
      const commentsSnap = await getDocs(query(collection(postRef, "comments"), orderBy("createdAt", "desc"), limit(DETAIL_COMMENTS_LIMIT)));
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

function renderPublicProfileView() {
  const view = state.profileView;
  if (!view || !view.profile) return "";
  const profile = view.profile;
  const posts = view.posts || profile.posts || [];
  const followKey = String(profile.handle || "").replace(/^@/, "");
  const isFollowing = state.followingHandles.includes(followKey);
  const isLocked = !!profile.privateAccount && profile.uid && String(profile.uid) !== String(state.user?.uid || "") && !isFollowing;
  const hasPendingFollowRequest = !!profile.pendingFollowRequest && !isFollowing;
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
  const topTab = profile.restaurantId ? (state.profileTopTab || "profile") : "profile";
  const topPaddingClass = profile.restaurantId ? (topTab === "profile" ? "pt-2" : "pt-4") : "pt-10";
  const followLabel = isFollowing ? "Following" : (hasPendingFollowRequest ? "Requested" : (isLocked ? "Request" : "Follow"));
  const followTone = isFollowing
    ? "bg-slate-100 text-slate-600 shadow-none border border-slate-200"
    : (hasPendingFollowRequest
      ? "bg-amber-50 text-amber-700 shadow-none border border-amber-200"
      : "bg-gradient-to-r from-slate-900 to-slate-800 text-white border border-transparent");
  return `
    <div class="pb-24">
      ${topTab === "profile" ? `
      <div class="px-5 pb-2 ${topPaddingClass}">

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
              <button data-public-profile-follow="${escapeHtml(profile.handle)}" data-target-type="${escapeHtml(profile.restaurantId ? "restaurant" : (profile.uid ? "user" : ""))}" data-target-id="${escapeHtml(profile.restaurantId || profile.uid || "")}" data-target-name="${escapeHtml(profile.name || "")}" data-target-avatar="${escapeHtml(profile.avatar || "")}" ${hasPendingFollowRequest ? "disabled" : ""} class="flex-1 h-[56px] rounded-[1.2rem] font-bold text-xs uppercase tracking-widest shadow-[0_10px_20px_-5px_rgba(15,23,42,0.25)] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2 relative overflow-hidden ${followTone} ${hasPendingFollowRequest ? "opacity-90 cursor-default" : ""}">
                <span class="relative z-10 flex items-center gap-2">
                  ${isFollowing ? icon("check", "w-4 h-4") : ""}
                  ${followLabel}
                </span>
              </button>
              <button data-open-chat="profile" data-chat-uid="${escapeHtml(profile.uid || "")}" data-chat-handle="${escapeHtml(profile.handle || "")}" data-chat-name="${escapeHtml(profile.name || "")}" data-chat-avatar="${escapeHtml(profile.avatar || "")}" ${isLocked ? "disabled" : ""} class="w-[56px] h-[56px] flex items-center justify-center rounded-[1.2rem] border border-slate-200 ${isLocked ? "bg-slate-100 text-slate-300 cursor-not-allowed" : "bg-white text-slate-900 active:scale-[0.95]"} transition-all duration-300 shadow-sm hover:shadow-md hover:border-slate-300 group">
                ${icon("message-circle", "w-5 h-5")}
              </button>
            </div>
          </div>
        </div>
      </div>

      ${!isLocked ? `
        ${renderProfileTabs()}
        ${renderProfileViewControls()}

        ${isCheckinTab ? `
          ${renderProfileCheckins()}
        ` : `
          <div class="${state.profileViewMode === "grid" ? "grid grid-cols-2 gap-4 px-6 grid-flow-dense" : "flex flex-col gap-8 px-6"}">
            ${renderProfilePostsFancy(filteredPosts, state.profileViewMode, false)}
          </div>
        `}
      ` : `
        <div class="px-6 pt-4">
          <div class="bg-white rounded-[2.2rem] border border-slate-100 p-8 text-center">
            <div class="w-16 h-16 rounded-[1.6rem] bg-slate-100 text-slate-500 mx-auto flex items-center justify-center mb-4">
              ${icon("lock", "w-7 h-7")}
            </div>
            <h3 class="text-sm font-black text-slate-900 uppercase tracking-widest">Privates Profil</h3>
            <p class="text-[11px] font-bold text-slate-400 mt-3 uppercase tracking-wider">Folgen muss zuerst akzeptiert werden</p>
          </div>
        </div>
      `}
      ` : `
        ${topTab === "cart" ? renderProfileShopCartView(profile) : renderProfileMenuView(profile)}
      `}
    </div>
  `;
}

function getFilteredMenuItems(items, { filter = "all", query = "" } = {}) {
  const list = Array.isArray(items) ? items : [];
  const q = normalizeSearchKey(query || "");
  return list.filter((item) => {
    const typeOk = filter === "all" || normalizeMenuType(item.type) === filter;
    if (!typeOk) return false;
    if (!q) return true;
    const hay = `${item.name || ""} ${item.category || ""} ${item.description || ""}`.toLowerCase();
    return hay.includes(q);
  });
}

function getMenuItemImages(item) {
  const looksLikeImageString = (value) => {
    const str = String(value || "").trim();
    if (!str) return false;
    const lower = str.toLowerCase();
    if (lower.startsWith("http://") || lower.startsWith("https://") || lower.startsWith("data:") || lower.startsWith("blob:") || lower.startsWith("gs://")) return true;
    if (lower.startsWith("media/") || lower.startsWith("social/") || lower.startsWith("menu/")) return true;
    return /\.(avif|webp|png|jpe?g|gif|svg|bmp|tiff?)(\?.*)?$/i.test(str);
  };
  const normalizeImg = (value, depth = 0, seen = new WeakSet()) => {
    if (!value) return "";
    if (typeof value === "string") {
      const cleaned = value.trim();
      if (!cleaned) return "";
      const lower = cleaned.toLowerCase();
      if (lower === "null" || lower === "undefined" || lower === "data") return "";
      if ((cleaned.startsWith("{") && cleaned.endsWith("}")) || (cleaned.startsWith("[") && cleaned.endsWith("]"))) {
        try {
          const parsed = JSON.parse(cleaned);
          return normalizeImg(parsed, depth + 1, seen);
        } catch {}
      }
      return cleaned;
    }
    if (typeof value === "object") {
      if (seen.has(value)) return "";
      seen.add(value);
      const candidate = value.url
        || value.src
        || value.imageUrl
        || value.imageURL
        || value.image_url
        || value.imagePath
        || value.image_path
        || value.imageSrc
        || value.image_src
        || value.path
        || value.cdnUrl
        || value.cdnURL
        || value.downloadURL
        || value.downloadUrl
        || value.photoUrl
        || value.photoURL
        || value.photo_url
        || value.picture
        || value.pictureUrl
        || value.pictureURL
        || value.photo
        || value.img
        || value.imgUrl
        || value.imgURL
        || value.img_src
        || value.imgSrc
        || value.thumbnail
        || value.thumbnailUrl
        || value.thumbnailURL
        || value.thumb
        || value.original
        || value.file
        || value.fileUrl
        || value.fileURL
        || value.publicUrl
        || value.publicURL
        || value.secure_url
        || value.secureUrl;
      const resolved = normalizeImg(candidate, depth + 1, seen);
      if (resolved) return resolved;
      if (depth < 2) {
        for (const val of Object.values(value)) {
          if (typeof val === "string" && looksLikeImageString(val)) {
            const found = normalizeImg(val, depth + 1, seen);
            if (found) return found;
          } else if (val && typeof val === "object") {
            const found = normalizeImg(val, depth + 1, seen);
            if (found) return found;
          }
        }
      }
      return "";
    }
    return "";
  };
  const rawList = [];
  [item?.imageUrls, item?.images, item?.image, item?.gallery, item?.photos, item?.media, item?.mediaUrls, item?.photoUrls, item?.pictureUrls].forEach((list) => {
    if (Array.isArray(list)) {
      rawList.push(...list);
    } else if (typeof list === "string" && list.trim()) {
      rawList.push(list);
    }
  });
  const list = rawList.map(normalizeImg);
  const primary = normalizeImg(
    item?.imageUrl
      || item?.imageURL
      || item?.image_url
      || item?.image
      || item?.photoUrl
      || item?.photoURL
      || item?.photo_url
      || item?.img
      || item?.imgUrl
      || item?.imgURL
      || item?.thumbnail
      || item?.thumb
      || item?.cover
      || item?.coverUrl
      || item?.coverURL
      || ""
  );
  if (primary) list.unshift(primary);
  const unique = Array.from(new Set(list.filter(Boolean)));
  return unique.length ? unique : [];
}

function isDirectImageUrl(value) {
  const str = String(value || "").trim();
  if (!str) return false;
  const lower = str.toLowerCase();
  return lower.startsWith("http://") || lower.startsWith("https://") || lower.startsWith("data:") || lower.startsWith("blob:") || lower.startsWith("gs://");
}

function resolveMenuItemHero(item) {
  const images = getMenuItemImages(item);
  return images[0] || "";
}

function renderMenuFilterRow() {
  const filter = state.menu.filter || "all";
  const isShop = isShopCatalogProfile(state.userProfile);
  const labels = isShop
    ? [
      { id: "all", label: "Alle" },
      { id: "food", label: "Produkte" },
      { id: "drink", label: "Varianten" }
    ]
    : [
      { id: "all", label: "Alle" },
      { id: "food", label: "Speisen" },
      { id: "drink", label: "Getraenke" }
    ];
  return `
    <div class="flex gap-2 mb-5">
      ${labels.map((item) => `
        <button data-menu-filter="${item.id}" class="px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition ${filter === item.id ? "bg-slate-900 text-white shadow-md" : "bg-white text-slate-400 border border-slate-100"}">
          ${item.label}
        </button>
      `).join("")}
    </div>
  `;
}

function renderMenuLayoutSection() {
  const activeId = getMenuLayoutTheme().id;
  return `
    <div class="mb-5 bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm">
      <div class="flex items-center justify-between mb-4">
        <div>
          <span class="text-[9px] font-black text-indigo-600 uppercase tracking-widest">Layouts</span>
          <h3 class="text-xl font-black italic tracking-tighter">Farben</h3>
          <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Sot ne Fokus</p>
        </div>
      </div>
      <div class="flex flex-wrap gap-3">
        ${MENU_LAYOUT_COLORS.map((theme) => {
          const isActive = theme.id === activeId;
          const checkClass = theme.id === "white" ? "text-slate-700" : "text-white";
          return `
            <button type="button" data-menu-layout-color="${theme.id}" class="w-12 h-12 rounded-2xl ${theme.swatch} ${isActive ? "ring-2 ring-slate-900 ring-offset-2 ring-offset-white" : "border border-white/60"} shadow flex items-center justify-center">
              ${isActive ? icon("check", `w-4 h-4 ${checkClass}`) : ""}
            </button>
          `;
        }).join("")}
      </div>
    </div>
  `;
}

function renderMenuItemCard(item, { mode = "profile" } = {}) {
  const rawImg = resolveMenuItemHero(item);
  const imgSrc = getOptimizedImageUrl(rawImg, "thumb");
  const safeImg = isPlaceholderUrl(imgSrc) ? PLACEHOLDER_IMAGE : imgSrc;
  const firebaseFallback = getFirebaseStorageUrl(rawImg);
  const fallbackImg = isDirectImageUrl(rawImg) && rawImg !== safeImg ? rawImg : firebaseFallback;
  const priceLabel = formatPrice(item.price);
  const catalogProfile = state.activeTab === "menu" ? state.userProfile : (state.profileView?.profile || state.userProfile);
  const isShopMode = isShopCatalogProfile(catalogProfile);
  const typeLabel = isShopMode
    ? (normalizeMenuType(item.type) === "drink" ? "Variante" : "Produkt")
    : (normalizeMenuType(item.type) === "drink" ? "Getraenk" : "Speise");
  const category = item.category || "";
  const desc = item.description || "";
  const availability = item.available === false
    ? `<span class="text-[9px] font-black uppercase tracking-widest text-slate-400">Nicht verfuegbar</span>`
    : `<span class="text-[9px] font-black uppercase tracking-widest text-emerald-600">Verfuegbar</span>`;
  const wrapperAttrs = mode === "profile"
    ? `data-menu-open="${escapeHtml(item.id)}" role="button"`
    : "";
  return `
    <div ${wrapperAttrs} class="w-full p-4 rounded-[2rem] bg-white border border-slate-100 shadow-sm hover:shadow-md transition-all flex items-center gap-4 ${mode === "profile" ? "cursor-pointer" : ""}">
      <div class="w-16 h-16 rounded-2xl overflow-hidden bg-slate-100 shrink-0">
        <img src="${escapeHtml(safeImg)}" data-fallback-src="${escapeHtml(fallbackImg)}" class="w-full h-full object-cover" style="object-position:${getMenuItemObjectPosition(item)};" loading="lazy" decoding="async" />
      </div>
      <div class="flex-1 min-w-0">
        <div class="flex items-center justify-between gap-4">
          <p class="text-sm font-black text-slate-900 truncate">${escapeHtml(item.name || "Produkt")}</p>
          <span class="text-xs font-black text-slate-900">${escapeHtml(priceLabel)}</span>
        </div>
        <div class="flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest text-slate-400 mt-1">
          ${category ? `<span>${escapeHtml(category)}</span>` : ""}
          <span>${escapeHtml(typeLabel)}</span>
        </div>
        ${desc ? `<p class="text-xs text-slate-500 mt-2 line-clamp-2">${escapeHtml(desc)}</p>` : ""}
        <div class="mt-2">${availability}</div>
      </div>
      ${mode === "admin" ? `
        <div class="flex flex-col gap-2">
          <button data-menu-edit="${escapeHtml(item.id)}" class="px-3 py-1.5 rounded-xl bg-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-200">Edit</button>
          <button data-menu-delete="${escapeHtml(item.id)}" class="px-3 py-1.5 rounded-xl bg-rose-50 text-[10px] font-black uppercase tracking-widest text-rose-600 hover:bg-rose-100">Loeschen</button>
        </div>
      ` : ""}
    </div>
  `;
}

function renderMenuItemCardStacked(item, { mode = "profile", variant = "food" } = {}) {
  const rawImg = resolveMenuItemHero(item);
  const imgSrc = getOptimizedImageUrl(rawImg, variant === "drink" ? "thumb" : "large");
  const safeImg = isPlaceholderUrl(imgSrc) ? PLACEHOLDER_IMAGE : imgSrc;
  const firebaseFallback = getFirebaseStorageUrl(rawImg);
  const fallbackImg = isDirectImageUrl(rawImg) && rawImg !== safeImg ? rawImg : firebaseFallback;
  const priceLabel = formatPrice(item.price);
  const catalogProfile = state.activeTab === "menu" ? state.userProfile : (state.profileView?.profile || state.userProfile);
  const isShopMode = isShopCatalogProfile(catalogProfile);
  const typeLabel = isShopMode
    ? (normalizeMenuType(item.type) === "drink" ? "Variante" : "Produkt")
    : (normalizeMenuType(item.type) === "drink" ? "Getraenk" : "Speise");
  const category = item.category || "";
  const desc = item.description || "";
  const availability = item.available === false
    ? `<span class="text-[9px] font-black uppercase tracking-widest text-slate-400">Nicht verfuegbar</span>`
    : `<span class="text-[9px] font-black uppercase tracking-widest text-emerald-600">Verfuegbar</span>`;
  const wrapperAttrs = mode === "profile"
    ? `data-menu-open="${escapeHtml(item.id)}" role="button"`
    : "";
  const restaurantId = state.menu.restaurantId
    || state.profileView?.profile?.restaurantId
    || state.userProfile.restaurantId
    || "";
  const itemId = getMenuItemSocialId(item);
  const metaKey = menuItemMetaKey(restaurantId, itemId);
  const meta = metaKey ? ensureMenuItemMeta(metaKey) : { likes: [], comments: [], counts: { likes: 0, comments: 0 } };
  const counts = resolveMenuItemCounts(meta);
  const countsRow = `
    <div class="mt-2 flex items-center gap-3 text-[10px] font-bold text-slate-400">
      <span class="inline-flex items-center gap-1">
        ${icon("heart", "w-3 h-3 text-rose-400")} <span data-menu-like-count="${escapeHtml(itemId)}">${escapeHtml(formatCount(counts.likes))}</span>
      </span>
      <span class="inline-flex items-center gap-1">
        ${icon("message-circle", "w-3 h-3 text-indigo-400")} <span data-menu-comment-count="${escapeHtml(itemId)}">${escapeHtml(formatCount(counts.comments))}</span>
      </span>
    </div>
  `;
  const isDrink = variant === "drink";
  return `
    <div ${wrapperAttrs} class="w-full ${isDrink ? "p-3 rounded-[1.6rem]" : "p-4 rounded-[2rem]"} bg-white border border-slate-100 shadow-sm hover:shadow-md transition-all ${mode === "profile" ? "cursor-pointer" : ""}">
      <div class="w-full ${isDrink ? "h-28 rounded-[1.4rem]" : "h-44 rounded-[1.8rem]"} overflow-hidden bg-slate-100">
        <img src="${escapeHtml(safeImg)}" data-fallback-src="${escapeHtml(fallbackImg)}" class="w-full h-full object-cover" style="object-position:${getMenuItemObjectPosition(item)};" loading="lazy" decoding="async" />
      </div>
      ${isDrink ? `
        <div class="mt-3">
          <p class="text-sm font-black text-slate-900 leading-snug">${escapeHtml(item.name || "Produkt")}</p>
          <p class="text-xs font-black text-slate-700 mt-1">${escapeHtml(priceLabel)}</p>
          ${countsRow}
        </div>
      ` : `
        <div class="mt-4">
          <div class="flex items-start justify-between gap-4">
            <p class="text-sm font-black text-slate-900">${escapeHtml(item.name || "Produkt")}</p>
            <span class="text-xs font-black text-slate-900">${escapeHtml(priceLabel)}</span>
          </div>
          <div class="flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest text-slate-400 mt-1">
            ${category ? `<span>${escapeHtml(category)}</span>` : ""}
            <span>${escapeHtml(typeLabel)}</span>
          </div>
          ${desc ? `<p class="text-xs text-slate-500 mt-2 line-clamp-2">${escapeHtml(desc)}</p>` : ""}
          <div class="mt-2">${availability}</div>
          ${countsRow}
        </div>
      `}
    </div>
  `;
}

function renderMenuDrinkGrid(items, { mode = "profile" } = {}) {
  if (!items.length) return "";
  return `
    <div class="grid grid-cols-2 gap-4">
      ${items.map((item) => renderMenuItemCardStacked(item, { mode, variant: "drink" })).join("")}
    </div>
  `;
}

function renderMenuFoodList(items, { mode = "profile" } = {}) {
  if (!items.length) return "";
  return `
    <div class="space-y-4">
      ${items.map((item) => renderMenuItemCardStacked(item, { mode, variant: "food" })).join("")}
    </div>
  `;
}

function renderMenuList(items, { mode = "profile" } = {}) {
  if (!items.length) {
    return `
      <div class="text-center py-16 text-slate-300 font-black uppercase text-[10px] tracking-[0.3em]">
        Keine Produkte
      </div>
    `;
  }
  return `
    <div class="space-y-4">
      ${items.map((item) => renderMenuItemCard(item, { mode })).join("")}
    </div>
  `;
}

function getActiveFocusItems(items = state.focus.items) {
  const list = Array.isArray(items) ? items : [];
  return list
    .map((item, idx) => normalizeFocusItem(item, item?.id || `focus_${idx}`))
    .filter((item) => item && item.active !== false);
}

function getFocusStateForRestaurant(restaurantId, { includeInactive = false } = {}) {
  const same = !!restaurantId && state.focus.restaurantId === restaurantId;
  const rawItems = same ? (Array.isArray(state.focus.items) ? state.focus.items : []) : [];
  const normalized = rawItems.map((item, idx) => normalizeFocusItem(item, item?.id || `focus_${idx}`));
  const items = includeInactive ? normalized : normalized.filter((item) => item && item.active !== false);
  const enabled = same ? state.focus.enabled !== false : true;
  const loading = !!restaurantId && (state.focus.loading || !same);
  return { items, enabled, loading, same };
}

function getFocusIndex(items) {
  const max = (items?.length || 0) - 1;
  if (max < 0) return 0;
  const raw = Number(state.focus.index || 0);
  if (!Number.isFinite(raw) || raw < 0 || raw > max) return 0;
  return raw;
}

function setFocusIndex(nextIndex) {
  const items = getActiveFocusItems();
  if (!items.length) return;
  const max = items.length;
  let idx = Number(nextIndex);
  if (!Number.isFinite(idx)) idx = 0;
  if (idx < 0) idx = max - 1;
  if (idx >= max) idx = 0;
  if (idx === state.focus.index) return;
  state.focus.index = idx;
  if (!updateFocusCarouselDom()) {
    render();
  }
}

function clearFocusRotation() {
  if (!focusRotateTimer) return;
  if (typeof window !== "undefined") {
    window.clearInterval(focusRotateTimer);
  }
  focusRotateTimer = null;
}

function isFocusRotationActive() {
  const profile = state.profileView?.profile || state.userProfile;
  const restaurantId = profile?.restaurantId || "";
  if (!restaurantId) return false;
  if (state.activeTab !== "profile" || state.profileTopTab !== "menu") return false;
  if (!isRestaurantCafeProfile(profile)) return false;
  if (state.focus.enabled === false) return false;
  if (state.focus.restaurantId !== restaurantId) return false;
  const items = getActiveFocusItems();
  return items.length > 1;
}

function updateFocusRotation() {
  if (typeof window === "undefined") return;
  const profile = state.profileView?.profile || state.userProfile;
  const restaurantId = profile?.restaurantId || "";
  const items = getActiveFocusItems();
  const shouldRotate = isFocusRotationActive();
  const nextKey = shouldRotate ? `${restaurantId}|${items.length}` : "";
  if (!shouldRotate) {
    clearFocusRotation();
    focusRotateKey = nextKey;
    return;
  }
  if (focusRotateKey !== nextKey) {
    clearFocusRotation();
    focusRotateKey = nextKey;
  }
  if (!focusRotateTimer) {
    focusRotateTimer = window.setInterval(() => {
      if (document.visibilityState !== "visible") return;
      if (!isFocusRotationActive()) {
        clearFocusRotation();
        return;
      }
      setFocusIndex(state.focus.index + 1);
    }, 5000);
  }
}

function updateFocusCarouselDom() {
  if (typeof document === "undefined") return false;
  const root = document.getElementById("focusCarousel");
  if (!root) return false;
  const profile = state.profileView?.profile || state.userProfile;
  const restaurantId = profile?.restaurantId || "";
  if (!restaurantId || !isRestaurantCafeProfile(profile)) return false;
  const { items, enabled } = getFocusStateForRestaurant(restaurantId);
  if (!enabled || !items.length) return false;
  const idx = getFocusIndex(items);
  const item = items[idx] || items[0];
  const imgUrl = getOptimizedImageUrl(item.imageUrl || "", "large");
  const safeImg = isPlaceholderUrl(imgUrl) ? PLACEHOLDER_IMAGE : imgUrl;

  const imgEl = root.querySelector("[data-focus-image]");
  if (imgEl instanceof HTMLImageElement) {
    if (imgEl.getAttribute("src") !== safeImg) imgEl.setAttribute("src", safeImg);
  }
  const titleEl = root.querySelector("[data-focus-title]");
  if (titleEl) titleEl.textContent = item.title || "Sot ne Fokus";
  const textEl = root.querySelector("[data-focus-text]");
  if (textEl) {
    if (item.text) {
      textEl.textContent = item.text;
      textEl.classList.remove("hidden");
    } else {
      textEl.textContent = "";
      textEl.classList.add("hidden");
    }
  }
  root.querySelectorAll("[data-focus-dot]").forEach((btn) => {
    const dotIdx = Number(btn.dataset.focusDot || "0");
    btn.classList.toggle("bg-slate-900", dotIdx === idx);
    btn.classList.toggle("bg-slate-200", dotIdx !== idx);
  });
  return true;
}

function renderFocusAdminSection(restaurantId) {
  if (!restaurantId) return "";
  const { items, enabled, loading } = getFocusStateForRestaurant(restaurantId, { includeInactive: true });
  const countLabel = formatCount(items.length);
  return `
    <div class="mb-6 bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm">
      <div class="flex items-center justify-between mb-4">
        <div>
          <span class="text-[9px] font-black text-amber-500 uppercase tracking-widest">Sot ne Fokus</span>
          <h3 class="text-xl font-black italic tracking-tighter">Highlights</h3>
          <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">${escapeHtml(countLabel)} Eintraege</p>
        </div>
        <button type="button" data-focus-add class="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow active:scale-95">
          ${icon("plus", "w-4 h-4")}
        </button>
      </div>

      <label class="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 mb-4">
        <div>
          <p class="text-xs font-black text-slate-800">Im Fokus anzeigen</p>
          <p class="text-[10px] font-bold text-slate-400">Im Profil sichtbar</p>
        </div>
        <input id="focusEnabledToggle" type="checkbox" class="w-5 h-5 accent-amber-500" ${enabled ? "checked" : ""} />
      </label>

      ${loading ? `
        <div class="text-center py-10 text-[10px] font-bold uppercase tracking-widest text-slate-400">Fokus wird geladen...</div>
      ` : items.length ? `
        <div class="space-y-3">
          ${items.map((item) => {
            const imgUrl = getOptimizedImageUrl(item.imageUrl || "", "thumb");
            const safeImg = isPlaceholderUrl(imgUrl) ? PLACEHOLDER_IMAGE : imgUrl;
            const status = item.active !== false ? "Aktiv" : "Inaktiv";
            const statusClass = item.active !== false ? "text-emerald-600" : "text-slate-400";
            return `
              <div class="flex items-start gap-4 p-4 rounded-[1.6rem] bg-slate-50 border border-slate-100">
                <div class="w-16 h-16 rounded-2xl overflow-hidden bg-white shrink-0">
                  <img src="${escapeHtml(safeImg)}" class="w-full h-full object-cover" style="object-position:${getFocusItemObjectPosition(item)};" loading="lazy" decoding="async" />
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-black text-slate-900 truncate">${escapeHtml(item.title || "Sot ne Fokus")}</p>
                  ${item.text ? `<p class="text-xs text-slate-500 mt-1 line-clamp-2">${escapeHtml(item.text)}</p>` : ""}
                  <p class="text-[9px] font-black uppercase tracking-widest mt-2 ${statusClass}">${status}</p>
                </div>
                <div class="flex flex-col gap-2">
                  <button data-focus-edit="${escapeHtml(item.id)}" class="px-3 py-1.5 rounded-xl bg-white text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-100 border border-slate-200">Edit</button>
                  <button data-focus-delete="${escapeHtml(item.id)}" class="px-3 py-1.5 rounded-xl bg-rose-50 text-[10px] font-black uppercase tracking-widest text-rose-600 hover:bg-rose-100">Loeschen</button>
                </div>
              </div>
            `;
          }).join("")}
        </div>
      ` : `
        <div class="text-center py-10 text-[10px] font-bold uppercase tracking-widest text-slate-300">Noch keine Fokus-Eintraege</div>
      `}
    </div>
  `;
}

function renderFocusCarousel(profile) {
  const restaurantId = profile?.restaurantId || "";
  if (!restaurantId) return "";
  if (!isRestaurantCafeProfile(profile)) return "";
  if (!state.focus.loading && state.focus.restaurantId !== restaurantId) {
    ensureFocusDataForProfile(profile);
  }
  const { items, enabled, loading } = getFocusStateForRestaurant(restaurantId);
  if (!enabled) return "";
  if (!items.length && !loading) return "";
  if (loading && !items.length) {
    const focusCardClass = getFocusCardClass();
    return `
      <div class="${focusCardClass} rounded-[2.5rem] p-6 border shadow-sm">
        <div class="text-center py-8 text-[10px] font-bold uppercase tracking-widest text-slate-400">Fokus wird geladen...</div>
      </div>
    `;
  }

  const idx = getFocusIndex(items);
  const item = items[idx] || items[0];
  const imgUrl = getOptimizedImageUrl(item.imageUrl || "", "large");
  const safeImg = isPlaceholderUrl(imgUrl) ? PLACEHOLDER_IMAGE : imgUrl;
  const text = item.text || "";
  const focusCardClass = getFocusCardClass();
  return `
    <div id="focusCarousel" class="${focusCardClass} rounded-[2.5rem] p-6 border shadow-sm">
      <div class="flex items-center justify-between mb-4">
        <span class="text-[9px] font-black text-amber-500 uppercase tracking-widest">Sot ne Fokus</span>
        ${items.length > 1 ? `
          <div class="flex items-center gap-2">
            <button type="button" data-focus-nav="prev" class="w-9 h-9 rounded-full bg-slate-50 border border-slate-100 text-slate-600 flex items-center justify-center">
              ${icon("chevron-left", "w-4 h-4")}
            </button>
            <button type="button" data-focus-nav="next" class="w-9 h-9 rounded-full bg-slate-50 border border-slate-100 text-slate-600 flex items-center justify-center">
              ${icon("chevron-right", "w-4 h-4")}
            </button>
          </div>
        ` : ""}
      </div>
      <div class="relative rounded-[2rem] overflow-hidden border border-slate-100 bg-slate-50">
        <img data-focus-image src="${escapeHtml(safeImg)}" class="w-full h-56 object-cover" style="object-position:${getFocusItemObjectPosition(item)};" />
      </div>
      <div class="mt-4">
        <p data-focus-title class="text-lg font-black text-slate-900">${escapeHtml(item.title || "Sot ne Fokus")}</p>
        <p data-focus-text class="text-sm text-slate-500 mt-2 leading-relaxed ${text ? "" : "hidden"}">${escapeHtml(text)}</p>
      </div>
      ${items.length > 1 ? `
        <div class="flex items-center justify-center gap-2 mt-4">
          ${items.map((_, dotIdx) => `
            <button type="button" data-focus-dot="${dotIdx}" class="w-2.5 h-2.5 rounded-full ${dotIdx === idx ? "bg-slate-900" : "bg-slate-200"}"></button>
          `).join("")}
        </div>
      ` : ""}
    </div>
  `;
}

function buildQrImageUrl(value, size = 220) {
  const safe = encodeURIComponent(value || "");
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${safe}`;
}

function renderMenuQrCard({ label, url, caption }) {
  if (!url) return "";
  const qrUrl = buildQrImageUrl(url, 240);
  return `
    <div class="p-4 rounded-[2rem] bg-white border border-slate-100 shadow-sm flex flex-col items-center gap-3">
      <div class="w-full aspect-square rounded-2xl bg-slate-50 overflow-hidden flex items-center justify-center">
        <img src="${escapeHtml(qrUrl)}" class="w-full h-full object-cover" loading="lazy" decoding="async" />
      </div>
      <div class="text-center">
        <p class="text-[11px] font-black uppercase tracking-widest text-slate-700">${escapeHtml(label)}</p>
        ${caption ? `<p class="text-[10px] font-bold text-slate-400 mt-1">${escapeHtml(caption)}</p>` : ""}
      </div>
    </div>
  `;
}

function renderMenuAdminView() {
  const profile = state.userProfile;
  const restaurantId = profile.restaurantId || "";
  const isEligible = isRestaurantCafeProfile(profile);
  const catalogLabel = getBusinessCatalogLabel(profile);
  const restaurant = restaurantId ? getRestaurantMetaById(restaurantId) : null;
  const restaurantName = restaurant?.name || restaurant?.restaurantName || profile.name || "Business";
  const sameRestaurant = restaurantId && state.menu.restaurantId === restaurantId;
  const isLoading = restaurantId && (state.menu.loading || !sameRestaurant);
  const items = sameRestaurant
    ? getFilteredMenuItems(state.menu.items, { filter: state.menu.filter, query: state.menu.query })
    : [];
  const countLabel = formatCount(items.length);
  const profileUrl = restaurantId ? buildUrl("apps/menyra-social/index.html", { r: restaurantId }) : "";
  const menuUrl = restaurantId ? buildUrl("apps/menyra-social/index.html", { r: restaurantId, tab: "menu" }) : "";

  if (restaurantId && isEligible && !state.focus.loading && state.focus.restaurantId !== restaurantId) {
    ensureFocusDataForProfile(profile);
  }

  if (!isEligible) {
    return `
      <div class="p-6 pb-24 animate-in slide-in-from-right-10 duration-500">
        <div class="bg-white rounded-[2.5rem] p-8 border border-slate-100 text-center">
          <div class="w-16 h-16 rounded-[1.8rem] bg-slate-100 flex items-center justify-center text-slate-400 mx-auto mb-4">
            ${icon("lock", "w-6 h-6")}
          </div>
          <h2 class="text-lg font-black italic text-slate-900 mb-2">${catalogLabel}</h2>
          <p class="text-sm text-slate-500">Diese Funktion ist nur fuer Business-Profile.</p>
        </div>
      </div>
    `;
  }

  return `
    <div class="p-6 pb-24 animate-in slide-in-from-right-10 duration-500">
      <div class="flex items-end justify-between mb-6">
        <div>
          <span class="text-[9px] font-black text-indigo-600 uppercase tracking-widest">${catalogLabel}</span>
          <h2 class="text-2xl font-black italic uppercase tracking-tighter">Editor</h2>
          <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">${escapeHtml(restaurantName)}</p>
        </div>
        <button type="button" data-menu-add class="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-xl shadow-slate-200/60 active:scale-95">
          ${icon("plus", "w-4 h-4")}
        </button>
      </div>

      ${restaurantId ? `
        <div class="mb-5 flex items-center justify-between p-4 rounded-[2rem] bg-white border border-slate-100">
          <div>
            <p class="text-[10px] font-bold uppercase tracking-widest text-slate-400">Produkte</p>
            <p class="text-lg font-black text-slate-900">${escapeHtml(countLabel)}</p>
          </div>
          <button type="button" data-menu-add class="px-4 py-2 rounded-xl bg-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-200">Neu</button>
        </div>
      ` : `
        <div class="mb-6 bg-white rounded-[2.5rem] p-6 border border-slate-100 text-center">
          <p class="text-sm font-bold text-slate-500 mb-4">Bitte zuerst dein Business im Account auswaehlen.</p>
          <button data-nav="settings" class="px-5 py-3 rounded-2xl bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest">Zu den Einstellungen</button>
        </div>
      `}

      ${restaurantId ? renderFocusAdminSection(restaurantId) : ""}
      ${restaurantId ? renderMenuLayoutSection() : ""}

      ${restaurantId ? `
        <div class="mb-4 bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-3">
          ${icon("search", "w-4 h-4 text-slate-400")}
          <input id="menuSearchInput" type="text" value="${escapeHtml(state.menu.query || "")}" placeholder="Produkt suchen..." class="w-full bg-transparent text-sm font-bold outline-none" />
        </div>

        ${renderMenuFilterRow()}

        ${isLoading
          ? `<div class="text-center py-12 text-[10px] font-bold uppercase tracking-widest text-slate-400">${catalogLabel} wird geladen...</div>`
          : renderMenuList(items, { mode: "admin" })
        }
        ${state.menu.error ? `<div class="text-center text-[10px] font-bold uppercase tracking-widest text-rose-500 mt-4">${escapeHtml(state.menu.error)}</div>` : ""}
      ` : ""}

      ${restaurantId ? `
        <div class="mt-10">
          <div class="flex items-end justify-between mb-4">
            <div>
              <span class="text-[9px] font-black text-indigo-600 uppercase tracking-widest">QR Codes</span>
              <h3 class="text-xl font-black italic tracking-tighter">Teilen</h3>
              <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Direkt zum Profil oder zu ${catalogLabel}</p>
            </div>
          </div>
          <div class="grid grid-cols-2 gap-4">
            ${renderMenuQrCard({ label: "Profil", url: profileUrl, caption: "Social Profil" })}
            ${renderMenuQrCard({ label: catalogLabel, url: menuUrl, caption: `${catalogLabel} & Preise` })}
          </div>
        </div>
      ` : ""}
    </div>
  `;
}

function renderProfileMenuView(profile) {
  const restaurantId = profile?.restaurantId || "";
  if (!restaurantId) {
    return `
      <div class="p-10 text-center text-slate-400 text-sm font-bold uppercase tracking-widest">
        Keine Restaurant-ID gefunden
      </div>
    `;
  }
  if (!state.menu.loading && state.menu.restaurantId !== restaurantId) {
    ensureMenuDataForProfile(profile);
  }
  if (!state.focus.loading && state.focus.restaurantId !== restaurantId) {
    ensureFocusDataForProfile(profile);
  }
  const isSameRestaurant = state.menu.restaurantId === restaurantId;
  const isLoading = state.menu.loading || !isSameRestaurant;
  const items = isSameRestaurant
    ? getFilteredMenuItems(state.menu.items, { filter: "all", query: "" })
    : [];
  const isShop = isShopCatalogProfile(profile);
  const catalogLabel = getBusinessCatalogLabel(profile);
  const error = isSameRestaurant ? state.menu.error : "";
  const drinkItems = items.filter((item) => normalizeMenuType(item.type) === "drink");
  const foodItems = items.filter((item) => normalizeMenuType(item.type) !== "drink");
  const hasItems = items.length > 0;
  if (hasItems && restaurantId) {
    primeMenuItemCounts(items, restaurantId);
  }
  return `
    <div class="px-5 pb-24 space-y-5">
      ${renderFocusCarousel(profile)}
      ${isLoading ? `
        <div class="bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm">
          <div class="text-center py-12 text-[10px] font-bold uppercase tracking-widest text-slate-400">${escapeHtml(catalogLabel)} wird geladen...</div>
        </div>
      ` : `
        ${!hasItems ? `
          <div class="bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm">
            <div class="text-center py-16 text-slate-300 font-black uppercase text-[10px] tracking-[0.3em]">
              Keine Produkte
            </div>
          </div>
        ` : `
          ${isShop ? `
            ${renderShopProductList(items, { profile })}
          ` : `
            ${drinkItems.length ? `
              <div class="bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm">
                <div class="flex items-center justify-between mb-4">
                  <h3 class="text-lg font-black italic tracking-tighter">Getraenke</h3>
                </div>
                ${renderMenuDrinkGrid(drinkItems, { mode: "profile" })}
              </div>
            ` : ""}
            ${foodItems.length ? `
              <div class="bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm">
                <div class="flex items-center justify-between mb-4">
                  <h3 class="text-lg font-black italic tracking-tighter">Speisen</h3>
                </div>
                ${renderMenuFoodList(foodItems, { mode: "profile" })}
              </div>
            ` : ""}
          `}
        `}
        ${error ? `<div class="text-center text-[10px] font-bold uppercase tracking-widest text-rose-500">${escapeHtml(error)}</div>` : ""}
      `}
    </div>
  `;
}

function renderProfileView() {
  const profile = state.userProfile;
  const isBusiness = isLocalBusinessProfile(profile);
  const posts = isBusiness ? state.businessPosts : state.userPosts;
  const handle = String(profile.handle || normalizeHandle(profile.name || "user")).replace(/^@/, "");
  const safeBio = escapeHtml(profile.bio || "").replace(/\n/g, "<br>");
  const bioHtml = safeBio || "Noch keine Bio.";
  const isMediaTab = state.profileContentTab === "media";
  const isCheckinTab = state.profileContentTab === "checkins";
  const filteredPosts = isMediaTab ? posts.filter((p) => p.isVideo) : posts;
  const avatarUrl = getOptimizedImageUrl(profile.avatar, "avatar");
  const avatarFit = logoFitClass(isBusiness);
  const topTab = profile.restaurantId ? (state.profileTopTab || "profile") : "profile";
  const topPaddingClass = profile.restaurantId ? (topTab === "profile" ? "pt-2" : "pt-4") : "pt-10";
  return `
    <div class="pb-24">
      ${topTab === "profile" ? `
      <div class="px-5 pb-2 ${topPaddingClass}">
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
      ` : `
        ${topTab === "cart" ? renderProfileShopCartView(profile) : renderProfileMenuView(profile)}
      `}
    </div>
  `;
}

async function openProfileFromBusiness(input) {
  try {
    const safeName = String(typeof input === "string" ? input : input?.name || "").trim();
    const restaurantId = typeof input === "string" ? "" : (input?.id || "");
    if (!safeName && !restaurantId) return;

    if (isOwnBusinessTarget({ restaurantId, name: safeName })) {
      openOwnBusinessProfile({ showBack: false, topTab: "profile" });
      return;
    }

    if (restaurantId) {
      void hydrateRestaurantsByIds([restaurantId], { max: 1 });
    }

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

function showPublicProfile(profile, posts, { showBack = true, backTab, topTab } = {}) {
  state.profileView = { profile, posts: posts || profile.posts || [] };
  state.profileModal = { open: false, profile: null };
  state.profileContentTab = "posts";
  state.profileTopTab = profile?.restaurantId
    ? (topTab || "profile")
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
  render();
  attachProfileViewListener(profile);
}

function isOwnBusinessTarget({ restaurantId = "", name = "" } = {}) {
  if (!isLocalBusinessProfile(state.userProfile)) return false;
  const ownRestaurantId = String(state.userProfile.restaurantId || "").trim();
  const targetRestaurantId = String(restaurantId || "").trim();
  if (ownRestaurantId && targetRestaurantId && ownRestaurantId === targetRestaurantId) return true;

  const ownRest = ownRestaurantId ? getRestaurantMetaById(ownRestaurantId) : null;
  const ownNames = [
    state.userProfile.name,
    ownRest?.name,
    ownRest?.restaurantName
  ].map((item) => normalizeSearchKey(item)).filter(Boolean);
  const targetName = normalizeSearchKey(name);
  if (!targetName) return false;
  return ownNames.includes(targetName);
}

function openOwnBusinessProfile({ showBack = true, topTab } = {}) {
  const prevTab = state.activeTab || "feed";
  const nextTopTab = topTab === "menu" ? "menu" : "profile";
  state.profileView = null;
  state.profileModal = { open: false, profile: null };
  state.profileContentTab = "posts";
  state.profileTopTab = nextTopTab;
  state.profileViewMode = "grid";
  state.profilePostMenuId = null;
  state.drawerOpen = false;
  state.activeTab = "profile";
  state.profileBackTab = showBack ? prevTab : "";
  render();
  if (nextTopTab === "menu") {
    ensureMenuDataForProfile();
    ensureFocusDataForProfile();
  }
}

function maybeOpenProfileFromQuery() {
  if (pendingProfileHandled) return;
  if (!pendingProfileRestaurantId) return;
  if (!state.user) return;
  if (state.profileView?.profile?.restaurantId === pendingProfileRestaurantId) {
    pendingProfileHandled = true;
    pendingProfileRestaurantId = "";
    pendingProfileTopTab = "";
    return;
  }
  pendingProfileHandled = true;
  const nextId = pendingProfileRestaurantId;
  const nextTabRaw = pendingProfileTopTab;
  pendingProfileRestaurantId = "";
  pendingProfileTopTab = "";
  const nextTab = (() => {
    const key = String(nextTabRaw || "").trim().toLowerCase();
    if (!key) return "";
    if (key === "menu" || key === "karte" || key === "speisekarte" || key === "shop") return "menu";
    return "";
  })();
  openProfileViewFromBusiness({ id: nextId }, { showBack: false, topTab: nextTab });
}

async function openProfileViewFromBusiness(input, { showBack = true, topTab } = {}) {
  try {
    const safeName = String(typeof input === "string" ? input : input?.name || "").trim();
    const restaurantId = typeof input === "string" ? "" : (input?.id || "");
    if (!safeName && !restaurantId) return;

    if (isOwnBusinessTarget({ restaurantId, name: safeName })) {
      openOwnBusinessProfile({ showBack, topTab });
      return;
    }

    if (restaurantId) {
      void hydrateRestaurantsByIds([restaurantId], { max: 1 });
    }

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

    showPublicProfile(placeholderProfile, placeholderProfile.posts, { showBack, topTab });

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
    showPublicProfile(resolved, resolved.posts, { showBack, topTab });
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
      cached.pendingFollowRequest = await hasPendingFollowRequest(cached.uid || uid || "");
      showPublicProfile(cached, cached.posts || []);
      return;
    }

    const fallbackProfile = normalizeExternalUserProfile({ userDoc: null, fallback: input || {}, posts: [] });
    fallbackProfile.pendingFollowRequest = await hasPendingFollowRequest(fallbackProfile.uid || uid || "");
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
    resolvedProfile.pendingFollowRequest = await hasPendingFollowRequest(resolvedProfile.uid || "");
    userProfileCache.set(cacheKey, resolvedProfile);
    if (state.activeTab !== "profile") return;
    if (uid && state.profileView?.profile?.uid !== uid) return;
    showPublicProfile(resolvedProfile, resolvedProfile.posts);
  } catch (err) {
    console.error(err);
  }
}

async function loadFollowingFromFirebase({ force = false } = {}) {
  void force;
  if (!state.user) return;
  try {
    const ref = collection(db, "users", state.user.uid, "following");
    const snap = await getDocs(ref);
    const handles = [];
    snap.forEach((docSnap) => {
      const data = docSnap.data() || {};
      if (data.handle) handles.push(String(data.handle));
    });
    applyFollowingHandles(handles, { shouldRender: false });
  } catch (err) {
    console.error(err);
    state.followingHandles = [];
  }
}

async function loadNotificationsFromFirebase({ force = false } = {}) {
  if (!state.user) return;
  try {
    const ref = collection(db, "users", state.user.uid, "notifications");
    const snap = await getDocs(query(ref, orderBy("createdAt", "desc"), limit(20)));
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

async function hasPendingFollowRequest(targetUid) {
  const safeTargetUid = String(targetUid || "").trim();
  if (!safeTargetUid || !state.user?.uid || safeTargetUid === String(state.user.uid)) return false;
  try {
    const snap = await getDoc(doc(db, "users", safeTargetUid, "followRequests", state.user.uid));
    return snap.exists();
  } catch (err) {
    console.error(err);
    return false;
  }
}

async function sendFollowRequest(handle, target = {}) {
  if (!state.user) return;
  const safeHandle = String(handle || "").replace(/^@/, "").trim();
  const targetUid = String(target.id || target.uid || "").trim();
  if (!safeHandle || !targetUid || targetUid === String(state.user.uid)) return;
  if (state.followingHandles.includes(safeHandle) || state.pendingFollowRequests.includes(safeHandle)) return;
  try {
    const actor = currentUserBadge();
    await setDoc(doc(db, "users", targetUid, "followRequests", state.user.uid), {
      requesterUid: actor.uid,
      requesterHandle: actor.handle,
      requesterName: actor.name,
      requesterAvatar: actor.avatar,
      targetUid,
      targetHandle: safeHandle,
      createdAt: serverTimestamp()
    }, { merge: true });
    await setDoc(doc(db, "users", targetUid, "notifications", `follow_request_${state.user.uid}`), {
      type: "follow_request",
      user: actor.name,
      userHandle: actor.handle,
      userUid: actor.uid,
      avatar: actor.avatar,
      text: "moechte dir folgen",
      read: false,
      createdAt: serverTimestamp()
    }, { merge: true });
    state.pendingFollowRequests = Array.from(new Set([safeHandle, ...state.pendingFollowRequests]));
    if (state.profileModal.profile?.uid === targetUid) {
      state.profileModal.profile.pendingFollowRequest = true;
    }
    if (state.profileView?.profile?.uid === targetUid) {
      state.profileView.profile.pendingFollowRequest = true;
    }
    render();
  } catch (err) {
    console.error(err);
  }
}

async function acceptFollowRequest(notificationId) {
  if (!state.user?.uid || !notificationId) return;
  const notif = state.notifications.find((item) => item.id === notificationId);
  if (!notif || notif.type !== "follow_request") return;
  const requesterUid = String(notif.userUid || "").trim();
  if (!requesterUid || requesterUid === String(state.user.uid)) return;

  const actor = currentUserBadge();
  const targetHandle = String(state.userProfile.handle || actor.handle || normalizeHandle(state.userProfile.name || "user")).replace(/^@/, "");
  const followRef = doc(db, "users", requesterUid, "following", getFollowDocId("user", state.user.uid, targetHandle));

  try {
    const existing = await getDoc(followRef);
    if (!existing.exists()) {
      await setDoc(followRef, {
        handle: targetHandle,
        targetType: "user",
        targetId: state.user.uid,
        name: state.userProfile.name || actor.name || "User",
        avatar: state.userProfile.avatar || actor.avatar || "",
        createdAt: serverTimestamp()
      }, { merge: true });
      await Promise.allSettled([
        updateDoc(doc(db, "users", requesterUid), { followingCount: increment(1) }),
        updateDoc(doc(db, "users", state.user.uid), { followersCount: increment(1) })
      ]);
    }

    await Promise.allSettled([
      deleteDoc(doc(db, "users", state.user.uid, "followRequests", requesterUid)),
      deleteDoc(doc(db, "users", state.user.uid, "notifications", notificationId))
    ]);

    state.notifications = state.notifications.filter((item) => item.id !== notificationId);
    saveNotifications(state.notifications);
    updateNotificationsDom();

    await pushUserNotification(requesterUid, {
      type: "follow_accepted",
      user: actor.name,
      userHandle: actor.handle,
      userUid: actor.uid,
      avatar: actor.avatar,
      text: "hat deine Anfrage akzeptiert"
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
  if (notif.type === "follow" || notif.type === "follow_request" || notif.type === "follow_accepted") {
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

  const ownRestaurantId = String(state.userProfile.restaurantId || "");
  const ownUid = String(state.user.uid || "");
  const ownHandle = String(state.userProfile.handle || "").replace(/^@/, "").toLowerCase();
  if (targetType === "restaurant" && ownRestaurantId && String(targetId) === ownRestaurantId) return;
  if (targetType === "user" && ownUid && String(targetId) === ownUid) return;
  if (!targetId && ownHandle && safeHandle.toLowerCase() === ownHandle) return;

  const idx = state.followingHandles.indexOf(safeHandle);
  const isUnfollow = idx >= 0;
  let targetIsPrivate = false;
  if (!isUnfollow && targetType === "user" && targetId) {
    if (state.profileView?.profile?.uid === targetId) {
      targetIsPrivate = !!state.profileView.profile.privateAccount;
    } else if (state.profileModal.profile?.uid === targetId) {
      targetIsPrivate = !!state.profileModal.profile.privateAccount;
    } else if (typeof target.privateAccount === "boolean") {
      targetIsPrivate = !!target.privateAccount;
    } else {
      try {
        const snap = await getDoc(doc(db, "users", targetId));
        if (snap.exists()) targetIsPrivate = !!(snap.data() || {}).privateAccount;
      } catch (err) {
        console.error(err);
      }
    }
  }
  if (!isUnfollow && targetIsPrivate) {
    await sendFollowRequest(safeHandle, { ...target, id: targetId, uid: targetId, type: "user" });
    return;
  }

  const followRef = doc(db, "users", state.user.uid, "following", getFollowDocId(targetType, targetId, safeHandle));
  const delta = isUnfollow ? -1 : 1;
  const toNum = (value) => {
    const n = Number(value);
    return Number.isFinite(n) ? n : 0;
  };
  const isBusiness = isLocalBusinessProfile(state.userProfile);

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
      if (isBusiness && state.userProfile.restaurantId) {
        await updateDoc(doc(db, "restaurants", state.userProfile.restaurantId), { followingCount: increment(delta) });
      } else {
        await updateDoc(doc(db, "users", state.user.uid), { followingCount: increment(delta) });
      }
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
      if (delta > 0) profileView.pendingFollowRequest = false;
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

function renderChatModal() {
  if (!state.chatModal.open || !state.chatModal.profile) return "";
  const partner = state.chatModal.profile;
  const avatarUrl = getOptimizedImageUrl(partner.avatar, "avatar");
  const messages = Array.isArray(state.chatModal.messages) ? state.chatModal.messages : [];
  return `
    <div class="fixed inset-0 z-[65] modal-overlay">
      <div id="chatModalOverlay" class="absolute inset-0 bg-black/60"></div>
      <div class="absolute inset-x-0 bottom-0 max-w-md mx-auto">
        <div class="bg-white rounded-t-[3rem] shadow-2xl border border-slate-100 h-[85vh] flex flex-col overflow-hidden modal-sheet">
          <div class="px-5 py-4 border-b border-slate-100 flex items-center gap-3">
            <button id="chatModalClose" class="w-11 h-11 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-500">${icon("arrow-left", "w-4 h-4")}</button>
            <img src="${escapeHtml(avatarUrl)}" class="w-12 h-12 rounded-2xl object-cover shadow-sm" />
            <div class="min-w-0 flex-1">
              <div class="text-sm font-black text-slate-900 truncate">${escapeHtml(partner.name || "User")}</div>
              <div class="text-[10px] font-bold uppercase tracking-widest text-slate-400 truncate">@${escapeHtml(String(partner.handle || "user").replace(/^@/, ""))}</div>
            </div>
          </div>
          <div id="chatMessages" class="flex-1 min-h-0 overflow-y-auto no-scrollbar modal-scroll px-5 py-4 space-y-3 bg-slate-50">
            ${messages.length ? messages.map((message) => `
              <div class="flex ${message.from === "self" ? "justify-end" : "justify-start"}">
                <div class="max-w-[82%] rounded-[1.6rem] px-4 py-3 ${message.from === "self" ? "bg-slate-900 text-white" : "bg-white text-slate-700 border border-slate-100"}">
                  <div class="text-sm font-medium leading-relaxed whitespace-pre-wrap">${escapeHtml(message.text || "")}</div>
                  <div class="text-[9px] font-bold uppercase tracking-widest mt-2 ${message.from === "self" ? "text-slate-300" : "text-slate-400"}">${escapeHtml(formatRelative(toDateSafe(message.createdAt) || new Date()))}</div>
                </div>
              </div>
            `).join("") : `
              <div class="h-full flex items-center justify-center text-center py-16">
                <div>
                  <div class="w-14 h-14 rounded-[1.4rem] bg-white border border-slate-100 text-slate-400 mx-auto flex items-center justify-center mb-4">
                    ${icon("message-circle", "w-6 h-6")}
                  </div>
                  <p class="text-[10px] font-black uppercase tracking-widest text-slate-400">Noch keine Nachrichten</p>
                </div>
              </div>
            `}
          </div>
          <div class="p-4 border-t border-slate-100 bg-white">
            <div class="flex items-end gap-3">
              <textarea id="chatMessageInput" rows="1" placeholder="Nachricht..." class="flex-1 p-4 rounded-2xl border border-slate-100 bg-slate-50 text-sm font-medium outline-none resize-none">${escapeHtml(state.chatModal.draft || "")}</textarea>
              <button id="chatSendBtn" class="px-5 h-[52px] rounded-2xl bg-slate-900 text-white font-black text-[10px] uppercase tracking-widest active:scale-95">Send</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderShopProductList(items) {
  if (!items.length) {
    return `
      <div class="bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm">
        <div class="text-center py-16 text-slate-300 font-black uppercase text-[10px] tracking-[0.3em]">
          Keine Produkte
        </div>
      </div>
    `;
  }
  return `
    <div class="grid grid-cols-2 gap-4">
      ${items.map((item) => {
        const images = getMenuItemImages(item);
        const rawImg = images[0] || resolveMenuItemHero(item);
        const imgSrc = getOptimizedImageUrl(rawImg, "large");
        const safeImg = isPlaceholderUrl(imgSrc) ? PLACEHOLDER_IMAGE : imgSrc;
        const firebaseFallback = getFirebaseStorageUrl(rawImg);
        const fallbackImg = isDirectImageUrl(rawImg) && rawImg !== safeImg ? rawImg : firebaseFallback;
        const priceLabel = formatPrice(item.price);
        const stock = Number.isFinite(Number(item.stock)) ? Math.max(0, Number(item.stock)) : null;
        const thumbImages = images.slice(1, 4);
        const soldOut = item.available === false || stock === 0;
        const availabilityLabel = soldOut ? "Nicht verfuegbar" : "Verfuegbar";
        const availabilityClass = soldOut ? "text-slate-300" : "text-emerald-600";
        return `
          <article data-menu-open="${escapeHtml(item.id)}" role="button" class="min-w-0 p-3 rounded-[2rem] bg-white border border-slate-100 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col">
            <div class="rounded-[1.5rem] overflow-hidden bg-slate-100">
              <img src="${escapeHtml(safeImg)}" data-fallback-src="${escapeHtml(fallbackImg)}" class="w-full h-40 object-cover" style="object-position:${getMenuItemObjectPosition(item)};" loading="lazy" decoding="async" />
            </div>
            ${thumbImages.length ? `
              <div class="grid grid-cols-3 gap-2 mt-2">
                ${thumbImages.map((thumb) => `
                  <div class="rounded-xl overflow-hidden bg-slate-100 border border-slate-100">
                    <img src="${escapeHtml(getOptimizedImageUrl(thumb, "thumb"))}" class="w-full h-12 object-cover" loading="lazy" decoding="async" />
                  </div>
                `).join("")}
              </div>
            ` : ""}
            <div class="pt-3 flex-1 flex flex-col min-w-0">
              <div class="flex items-start justify-between gap-2">
                <div class="min-w-0">
                  <p class="text-[13px] font-black text-slate-900 leading-tight line-clamp-2">${escapeHtml(item.name || "Produkt")}</p>
                </div>
                <span class="text-[11px] font-black text-slate-900 shrink-0">${escapeHtml(priceLabel)}</span>
              </div>
              ${item.description ? `<p class="text-[11px] text-slate-500 mt-2 line-clamp-2">${escapeHtml(item.description)}</p>` : ""}
              <div class="mt-auto pt-3">
                <span class="block text-[9px] font-black uppercase tracking-widest ${availabilityClass}">${availabilityLabel}</span>
              </div>
            </div>
          </article>
        `;
      }).join("")}
    </div>
  `;
}

function renderProfileShopCartView(profile = state.profileView?.profile || state.userProfile) {
  const context = getShopCartProfileContext(profile);
  const cartMatches = context.restaurantId && String(state.shopCart.restaurantId || "") === context.restaurantId;
  const items = cartMatches ? (state.shopCart.items || []) : [];
  const total = cartMatches ? getShopCartTotal() : 0;
  const hasOtherCart = !!state.shopCart.restaurantId && !cartMatches && (state.shopCart.items || []).length;
  return `
    <div class="px-5 pb-24 space-y-5">
      <div class="bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm">
        <div class="flex items-center justify-between mb-4">
          <div>
            <span class="text-[9px] font-black text-indigo-600 uppercase tracking-widest">Warenkorb</span>
            <h3 class="text-xl font-black italic tracking-tighter">${escapeHtml(context.businessName || "Shop")}</h3>
          </div>
          <div class="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-600">
            ${icon("shopping-cart", "w-5 h-5")}
          </div>
        </div>
        ${hasOtherCart ? `
          <p class="text-[11px] font-bold text-amber-600 uppercase tracking-wider">Dein aktueller Warenkorb gehoert zu einem anderen Shop.</p>
        ` : items.length ? `
          <div class="space-y-3">
            ${items.map((item) => `
              <div class="flex items-center gap-3 p-3 rounded-[1.6rem] bg-slate-50 border border-slate-100">
                <div class="w-14 h-14 rounded-2xl overflow-hidden bg-white shrink-0">
                  <img src="${escapeHtml(getOptimizedImageUrl(item.imageUrl || "", "thumb"))}" class="w-full h-full object-cover" style="object-position:${clampCropPercent(item.cropX ?? 50, 50)}% ${clampCropPercent(item.cropY ?? 50, 50)}%;" />
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-black text-slate-900 truncate">${escapeHtml(item.name)}</p>
                  ${item.selectedSize || item.selectedColor ? `<p class="text-[9px] font-bold uppercase tracking-widest text-slate-300 mt-1">${escapeHtml([item.selectedSize, item.selectedColor].filter(Boolean).join(" / "))}</p>` : ""}
                  <p class="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1">${escapeHtml(formatPrice(item.price))}</p>
                </div>
                <div class="flex items-center gap-2">
                  <button data-cart-qty="${escapeHtml(item.cartKey || item.itemId)}" data-cart-delta="-1" class="w-8 h-8 rounded-xl bg-white border border-slate-200 text-slate-500 flex items-center justify-center">${icon("minus", "w-3 h-3")}</button>
                  <span class="w-6 text-center text-sm font-black text-slate-900">${escapeHtml(item.quantity)}</span>
                  <button data-cart-qty="${escapeHtml(item.cartKey || item.itemId)}" data-cart-delta="1" class="w-8 h-8 rounded-xl bg-white border border-slate-200 text-slate-500 flex items-center justify-center">${icon("plus", "w-3 h-3")}</button>
                </div>
              </div>
            `).join("")}
            <div class="pt-3 flex items-center justify-between">
              <span class="text-[10px] font-black uppercase tracking-widest text-slate-400">Gesamt</span>
              <span class="text-lg font-black text-slate-900">${escapeHtml(formatPrice(total))}</span>
            </div>
            <button data-cart-checkout="open" class="w-full py-4 rounded-[1.8rem] bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-slate-200/60 active:scale-95">
              Checkout starten
            </button>
            ${state.shopCart.status && !state.shopCart.checkoutOpen ? `<p class="text-center text-[10px] font-bold uppercase tracking-widest text-slate-400">${escapeHtml(state.shopCart.status)}</p>` : ""}
          </div>
        ` : `
          <div class="text-center py-14">
            <div class="w-14 h-14 rounded-[1.4rem] bg-slate-100 text-slate-400 mx-auto flex items-center justify-center mb-4">
              ${icon("shopping-bag", "w-6 h-6")}
            </div>
            <p class="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">Warenkorb leer</p>
            <p class="text-sm font-medium text-slate-500 mt-3">Tippe auf das Plus bei einem Produkt.</p>
          </div>
        `}
      </div>
      ${cartMatches && items.length && state.shopCart.checkoutOpen ? `
        <div class="bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm space-y-4">
          <div>
            <span class="text-[9px] font-black text-indigo-600 uppercase tracking-widest">Checkout</span>
            <h3 class="text-xl font-black italic tracking-tighter">Lieferdaten</h3>
          </div>
          <div class="grid grid-cols-1 gap-3">
            <input data-cart-field="name" type="text" value="${escapeHtml(state.shopCart.form.name || "")}" placeholder="Name" class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100" />
            <input data-cart-field="phone" type="text" value="${escapeHtml(state.shopCart.form.phone || "")}" placeholder="Tel Nummer" class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100" />
            <input data-cart-field="city" type="text" value="${escapeHtml(state.shopCart.form.city || "")}" placeholder="Qyteti" class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100" />
            <textarea data-cart-field="address" rows="3" placeholder="Adresa" class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100 resize-none">${escapeHtml(state.shopCart.form.address || "")}</textarea>
          </div>
          <button data-cart-checkout="submit" class="w-full py-4 rounded-[1.8rem] bg-indigo-600 text-white text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-indigo-500/20 active:scale-95" ${state.shopCart.loading ? "disabled" : ""}>
            ${state.shopCart.loading ? "Senden..." : "Bestellung absenden"}
          </button>
          ${state.shopCart.status ? `<p class="text-center text-[10px] font-bold uppercase tracking-widest ${state.shopCart.loading ? "text-slate-400" : "text-slate-500"}">${escapeHtml(state.shopCart.status)}</p>` : ""}
        </div>
      ` : ""}
    </div>
  `;
}

function renderProfileModal() {
  if (!state.profileModal.open || !state.profileModal.profile) return "";
  const p = state.profileModal.profile;
  const followKey = String(p.handle || "").replace(/^@/, "");
  const isFollowing = state.followingHandles.includes(followKey);
  const hasPendingFollowRequest = !!p.pendingFollowRequest && !isFollowing;
  const isLocked = !!p.privateAccount && p.uid && String(p.uid) !== String(state.user?.uid || "") && !isFollowing;
  const typeLabel = p.restaurantId ? "Business" : "User";
  const avatarUrl = getOptimizedImageUrl(p.avatar, "avatar");
  return `
    <div class="fixed inset-0 z-[60] modal-overlay">
      <div id="profileModalOverlay" class="absolute inset-0 bg-black/60"></div>
      <div class="absolute inset-x-0 bottom-0 max-w-md mx-auto">
        <div class="bg-white rounded-t-[3rem] shadow-2xl border border-slate-100 h-[85vh] flex flex-col overflow-hidden modal-sheet">
          <div class="flex-1 overflow-y-auto no-scrollbar modal-scroll p-7">
            <div class="flex justify-end mb-4">
              <button id="profileModalClose" class="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-500">${icon("x", "w-4 h-4")}</button>
            </div>

            <div class="flex items-center gap-4">
              <img src="${escapeHtml(avatarUrl)}" class="w-16 h-16 rounded-2xl object-cover shadow" />
              <div class="flex-1 min-w-0">
                <p class="text-xs font-black">@${escapeHtml(p.handle)}</p>
                <p class="text-[10px] text-slate-400 font-bold uppercase tracking-widest">${escapeHtml(p.location)} / ${typeLabel}</p>
              </div>
              <div class="flex items-center gap-2">
                <button id="profileChatBtn" data-chat-uid="${escapeHtml(p.uid || "")}" data-chat-handle="${escapeHtml(p.handle || "")}" data-chat-name="${escapeHtml(p.name || "")}" data-chat-avatar="${escapeHtml(p.avatar || "")}" ${isLocked ? "disabled" : ""} class="w-11 h-11 rounded-2xl border border-slate-200 ${isLocked ? "bg-slate-100 text-slate-300 cursor-not-allowed" : "bg-white text-slate-700"} flex items-center justify-center">
                  ${icon("message-circle", "w-4 h-4")}
                </button>
                <button id="profileFollowBtn" data-handle="${escapeHtml(p.handle)}" data-target-type="${escapeHtml(p.restaurantId ? "restaurant" : (p.uid ? "user" : ""))}" data-target-id="${escapeHtml(p.restaurantId || p.uid || "")}" data-target-name="${escapeHtml(p.name || "")}" data-target-avatar="${escapeHtml(p.avatar || "")}" ${hasPendingFollowRequest ? "disabled" : ""} class="px-5 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest active:scale-95 transition-transform ${isFollowing ? "bg-slate-100 text-slate-700" : (hasPendingFollowRequest ? "bg-amber-50 text-amber-700 border border-amber-200" : "bg-indigo-600 text-white shadow-xl shadow-indigo-500/20")} ${hasPendingFollowRequest ? "cursor-default" : ""}">
                  ${isFollowing ? "Following" : (hasPendingFollowRequest ? "Requested" : (isLocked ? "Request" : "Follow"))}
                </button>
              </div>
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

function renderMenuCommentItem(comment) {
  const avatarUrl = resolveCommentAvatar(comment);
  if (isPlaceholderUrl(avatarUrl)) scheduleCommentAvatarFetch(comment);
  const safeSrc = (!avatarUrl || isPlaceholderUrl(avatarUrl)) ? PLACEHOLDER_IMAGE : avatarUrl;
  const handleKey = normalizeHandle(comment.handle || comment.author || "");
  return `
    <div class="flex gap-3" data-comment-id="${escapeHtml(comment.id || "")}" data-comment-uid="${escapeHtml(comment.uid || "")}" data-comment-handle="${escapeHtml(handleKey)}">
      <img src="${escapeHtml(safeSrc)}" data-img-key="comment-avatar:${escapeHtml(comment.id || "")}" data-comment-id="${escapeHtml(comment.id || "")}" data-comment-handle="${escapeHtml(handleKey)}" data-comment-uid="${escapeHtml(comment.uid || "")}" data-uid="${escapeHtml(comment.uid || "")}" data-handle="${escapeHtml(comment.handle || "")}" class="comment-avatar w-9 h-9 rounded-2xl object-cover shadow" loading="lazy" decoding="async" referrerpolicy="no-referrer" onerror="this.src='${PLACEHOLDER_IMAGE}'" alt="" />
      <div class="flex-1">
        <div class="flex items-center justify-between">
          <div class="text-xs font-black text-slate-900">${escapeHtml(comment.author || "User")}</div>
          <div class="text-[10px] font-bold text-slate-400">${escapeHtml(formatDateTimeLabel(comment.createdAt))}</div>
        </div>
        <div class="text-sm text-slate-600 leading-relaxed mt-1">${escapeHtml(comment.text || "")}</div>
      </div>
    </div>
  `;
}

function renderMenuDetailComments(comments) {
  if (state.menuDetail.loading) {
    return `<div class="text-center text-[10px] font-bold uppercase text-slate-400">Kommentare laden...</div>`;
  }
  const sendingRow = state.menuDetail.sending
    ? `<div class="text-center text-[10px] font-bold uppercase text-slate-400">Senden...</div>`
    : "";
  if (!comments.length) {
    return sendingRow || `<div class="text-center text-[10px] font-bold uppercase text-slate-400">Noch keine Kommentare</div>`;
  }
  return `${sendingRow}${comments.map((comment) => renderMenuCommentItem(comment)).join("")}`;
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
      <div class="fixed inset-0 z-[70] modal-overlay">
        <div id="postModalOverlay" class="absolute inset-0 bg-black/60"></div>
        <div class="absolute inset-x-0 bottom-0 max-w-md mx-auto">
          <div class="bg-white rounded-t-[3rem] shadow-2xl border border-slate-100 ${animClass} flex flex-col h-[85vh] overflow-hidden modal-sheet">
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
      <div class="fixed inset-0 z-[80] modal-overlay">
        <div id="likesModalOverlay" class="absolute inset-0 bg-black/70"></div>
      <div class="absolute inset-x-0 bottom-0 max-w-md mx-auto">
        <div class="bg-white rounded-t-[3rem] shadow-2xl border border-slate-100 ${animClass} flex flex-col h-[85vh] overflow-hidden modal-sheet">
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

function renderLeadModal() {
  if (!state.leadModal.open) return "";
  const lead = state.leadModal.lead || {};
  const isEdit = state.leadModal.mode === "edit";
  const logoRaw = state.leadModal.logoPreview || lead.logoUrl || lead.logo || lead.imageUrl || "";
  const logoUrl = logoRaw ? getOptimizedImageUrl(logoRaw, "avatar") : PLACEHOLDER_IMAGE;
  const status = state.leadModal.status || "";
  const customerType = resolveCustomerType(lead.customerType || "cafe");
  const leadEmail = lead.socialEmail || lead.email || "";
  const leadStatus = normalizeLeadStatusKey(lead.status || "registered") || "registered";
  const leadInstagram = lead.instagram || lead.insta || "";
  const locations = normalizeLeadLocations(state.leadModal.locations, lead.address || "", state.leadModal.coords || null);
  const canConvert = isEdit && !!lead.id && normalizeLeadStatusKey(lead.status || "") !== "kunde";

  const headerHtml = `
    <div class="flex items-start justify-between px-6 pt-6 pb-4 border-b border-slate-100">
      <div>
        <span class="text-[9px] font-black text-indigo-600 uppercase tracking-widest">${isEdit ? "Bearbeiten" : "Neu"}</span>
        <h3 class="text-xl font-black italic tracking-tighter">${isEdit ? "Lead bearbeiten" : "Neuer Lead"}</h3>
      </div>
      <button id="leadModalClose" class="w-11 h-11 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-500">
        ${icon("x", "w-4 h-4")}
      </button>
    </div>
  `;

  const bodyHtml = `
    <div class="flex-1 overflow-y-auto no-scrollbar modal-scroll px-6 py-5 space-y-4">
      <input type="file" id="leadLogoInput" class="hidden" accept="image/*" />
      <div class="rounded-[2.5rem] overflow-hidden border border-slate-100 bg-slate-50">
        <img id="leadLogoPreview" src="${escapeHtml(logoUrl)}" class="w-full h-44 object-contain bg-white" />
      </div>
      <button id="leadLogoTrigger" class="w-full py-3 rounded-2xl bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest">
        Logo hochladen
      </button>

      <div class="p-5 rounded-[2rem] border border-slate-100 bg-white space-y-4">
        <div>
          <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Business Name</label>
          <input id="leadBusinessName" type="text" value="${escapeHtml(lead.businessName || lead.name || "")}" placeholder="Business Name" class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100" />
        </div>
        <div>
          <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Typ</label>
          <select id="leadCustomerType" class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100">
            ${LEAD_TYPE_ORDER.map((key) => `
              <option value="${key}" ${customerType === key ? "selected" : ""}>${LEAD_TYPE_LABELS[key]}</option>
            `).join("")}
          </select>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Kontakt</label>
            <input id="leadContactName" type="text" value="${escapeHtml(lead.contactName || lead.contact || "")}" placeholder="Kontaktname" class="w-full px-4 py-3 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100" />
          </div>
          <div>
            <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Telefon</label>
            <input id="leadPhone" type="text" value="${escapeHtml(lead.phone || "")}" placeholder="+383" class="w-full px-4 py-3 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100" />
          </div>
        </div>
        <div>
          <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Instagram</label>
          <input id="leadInstagram" type="text" value="${escapeHtml(leadInstagram)}" placeholder="@menyra" class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100" />
        </div>
        <div>
          <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Email (Login)</label>
          <input id="leadEmail" type="email" value="${escapeHtml(leadEmail)}" placeholder="owner@menyra.com" class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100" />
        </div>
        <div>
          <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Passwort (optional)</label>
          <input id="leadPassword" type="password" value="" placeholder="leer = Standardpasswort" class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100" />
        </div>
        <div>
          <label class="text-[10px] font-black text-slate-400 uppercase ml-2">City</label>
          <input id="leadCity" type="text" value="${escapeHtml(lead.city || "")}" placeholder="Prishtina" class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100" />
        </div>
        <div class="space-y-3">
          <div class="flex items-center justify-between">
            <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Standorte</label>
            <button type="button" data-lead-location-add class="px-3 py-2 rounded-xl bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
              ${icon("plus", "w-3.5 h-3.5")} Standort
            </button>
          </div>
          ${locations.map((location, index) => {
            const hasCoords = hasLeadLocationCoords(location);
            return `
              <div class="bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100/50 space-y-3">
                <div class="flex items-center justify-between">
                  <p class="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Standort ${index + 1}</p>
                  ${index > 0 ? `
                    <button type="button" data-lead-location-remove="${index}" class="w-8 h-8 rounded-lg bg-white text-slate-500 flex items-center justify-center border border-slate-200">
                      ${icon("x", "w-3.5 h-3.5")}
                    </button>
                  ` : ""}
                </div>
                <input
                  id="leadLocationAddress_${index}"
                  data-lead-location-address="${index}"
                  type="text"
                  value="${escapeHtml(location.address || "")}"
                  placeholder="Adresse fuer Standort ${index + 1}"
                  class="w-full px-5 py-4 bg-white rounded-2xl text-sm font-bold border border-slate-100 outline-none focus:ring-2 focus:ring-indigo-100"
                />
                <div id="leadLocationCoords_${index}" class="text-[9px] font-bold text-emerald-600 flex items-center gap-1 ${hasCoords ? "" : "hidden"}">
                  ${icon("check-circle-2", "w-3 h-3")} Standort auf Karte fixiert!
                </div>
                <button type="button" data-lead-location-pick="${index}" class="w-full bg-indigo-600 text-white py-3 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-transform">
                  ${icon("map-pin", "w-3.5 h-3.5")} Auf Karte festlegen
                </button>
              </div>
            `;
          }).join("")}
        </div>
        <div>
          <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Logo URL (optional)</label>
          <input id="leadLogoUrl" type="text" value="${escapeHtml(lead.logoUrl || lead.logo || "")}" placeholder="https://..." class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100" />
        </div>
        <div>
          <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Status</label>
          <select id="leadStatus" class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100">
            ${LEAD_STATUS_ORDER.map((key) => `
              <option value="${key}" ${leadStatus === key ? "selected" : ""}>${LEAD_STATUS_LABELS[key]}</option>
            `).join("")}
          </select>
        </div>
        <div>
          <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Notiz</label>
          <textarea id="leadNote" rows="3" placeholder="Kurz notieren..." class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100 resize-none">${escapeHtml(lead.note || "")}</textarea>
        </div>
      </div>
    </div>
  `;

  const footerHtml = `
    <div class="px-6 pb-6 pt-4 border-t border-slate-100 bg-white">
      ${canConvert ? `
        <button id="leadConvertBtn" class="w-full py-4 rounded-[1.8rem] bg-emerald-600 text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-emerald-500/20 active:scale-95 transition-all mb-3">
          Zu Kunde
        </button>
      ` : ""}
      <button id="leadModalSave" class="w-full py-4 rounded-[1.8rem] bg-indigo-600 text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-500/20 active:scale-95 transition-all" ${state.leadModal.loading ? "disabled" : ""}>
        ${state.leadModal.loading ? "Speichern..." : "Speichern"}
      </button>
      <div class="text-center text-[10px] font-bold text-slate-400 mt-3">${escapeHtml(status)}</div>
    </div>
  `;

  return `
    <div class="fixed inset-0 z-[75] modal-overlay">
      <div id="leadModalOverlay" class="absolute inset-0 bg-black/60"></div>
      <div class="absolute inset-x-0 bottom-0 max-w-md mx-auto">
        <div class="bg-white rounded-t-[3rem] shadow-2xl border border-slate-100 flex flex-col h-[85vh] overflow-hidden modal-sheet">
          ${headerHtml}
          ${bodyHtml}
          ${footerHtml}
        </div>
      </div>
    </div>
  `;
}

function renderCustomerModal() {
  if (!state.customerModal.open || !state.customerModal.customer) return "";
  const customer = state.customerModal.customer || {};
  const logoRaw = state.customerModal.logoPreview || customer.logoUrl || customer.logo || "";
  const logoUrl = logoRaw ? getOptimizedImageUrl(logoRaw, "avatar") : PLACEHOLDER_IMAGE;
  const status = state.customerModal.status || "";
  const typeKey = resolveCustomerType(customer.type || customer.customerType || "cafe");
  const customerStatus = normalizeLeadStatusKey(customer.status || "kunde") || "kunde";
  const customerInstagram = customer.instagram || customer.insta || "";

  const headerHtml = `
    <div class="flex items-start justify-between px-6 pt-6 pb-4 border-b border-slate-100">
      <div>
        <span class="text-[9px] font-black text-indigo-600 uppercase tracking-widest">Kunde</span>
        <h3 class="text-xl font-black italic tracking-tighter">Kundenprofil</h3>
      </div>
      <button id="customerModalClose" class="w-11 h-11 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-500">
        ${icon("x", "w-4 h-4")}
      </button>
    </div>
  `;

  const bodyHtml = `
    <div class="flex-1 overflow-y-auto no-scrollbar modal-scroll px-6 py-5 space-y-4">
      <input type="file" id="customerLogoInput" class="hidden" accept="image/*" />
      <div class="rounded-[2.5rem] overflow-hidden border border-slate-100 bg-slate-50">
        <img id="customerLogoPreview" src="${escapeHtml(logoUrl)}" class="w-full h-44 object-contain bg-white" />
      </div>
      <button id="customerLogoTrigger" class="w-full py-3 rounded-2xl bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest">
        Logo hochladen
      </button>

      <div class="p-5 rounded-[2rem] border border-slate-100 bg-white space-y-4">
        <div>
          <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Business Name</label>
          <input id="customerName" type="text" value="${escapeHtml(customer.name || customer.restaurantName || "")}" placeholder="Business Name" class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100" />
        </div>
        <div>
          <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Typ</label>
          <select id="customerType" class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100">
            ${LEAD_TYPE_ORDER.map((key) => `
              <option value="${key}" ${typeKey === key ? "selected" : ""}>${LEAD_TYPE_LABELS[key]}</option>
            `).join("")}
          </select>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Owner</label>
            <input id="customerOwnerName" type="text" value="${escapeHtml(customer.ownerName || "")}" placeholder="Owner Name" class="w-full px-4 py-3 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100" />
          </div>
          <div>
            <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Email</label>
            <input id="customerOwnerEmail" type="email" value="${escapeHtml(customer.ownerEmail || "")}" placeholder="owner@menyra.com" class="w-full px-4 py-3 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100" />
          </div>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Telefon</label>
            <input id="customerPhone" type="text" value="${escapeHtml(customer.phone || "")}" placeholder="+383" class="w-full px-4 py-3 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100" />
          </div>
          <div>
            <label class="text-[10px] font-black text-slate-400 uppercase ml-2">City</label>
            <input id="customerCity" type="text" value="${escapeHtml(customer.city || "")}" placeholder="Prishtina" class="w-full px-4 py-3 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100" />
          </div>
        </div>
        <div>
          <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Adresse</label>
          <input id="customerAddress" type="text" value="${escapeHtml(customer.address || "")}" placeholder="Strasse, Nr" class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100" />
        </div>
        <div>
          <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Instagram</label>
          <input id="customerInstagram" type="text" value="${escapeHtml(customerInstagram)}" placeholder="@menyra" class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100" />
        </div>
        <div>
          <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Logo URL (optional)</label>
          <input id="customerLogoUrl" type="text" value="${escapeHtml(customer.logoUrl || customer.logo || "")}" placeholder="https://..." class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100" />
        </div>
        <div>
          <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Status</label>
          <select id="customerStatus" class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100">
            ${LEAD_STATUS_ORDER.map((key) => `
              <option value="${key}" ${customerStatus === key ? "selected" : ""}>${LEAD_STATUS_LABELS[key]}</option>
            `).join("")}
          </select>
        </div>
      </div>
    </div>
  `;

  const footerHtml = `
    <div class="px-6 pb-6 pt-4 border-t border-slate-100 bg-white">
      <button id="customerModalSave" class="w-full py-4 rounded-[1.8rem] bg-indigo-600 text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-500/20 active:scale-95 transition-all" ${state.customerModal.loading ? "disabled" : ""}>
        ${state.customerModal.loading ? "Speichern..." : "Speichern"}
      </button>
      <div class="text-center text-[10px] font-bold text-slate-400 mt-3">${escapeHtml(status)}</div>
    </div>
  `;

  return `
    <div class="fixed inset-0 z-[75] modal-overlay">
      <div id="customerModalOverlay" class="absolute inset-0 bg-black/60"></div>
      <div class="absolute inset-x-0 bottom-0 max-w-md mx-auto">
        <div class="bg-white rounded-t-[3rem] shadow-2xl border border-slate-100 flex flex-col h-[85vh] overflow-hidden modal-sheet">
          ${headerHtml}
          ${bodyHtml}
          ${footerHtml}
        </div>
      </div>
    </div>
  `;
}

function renderMenuItemModal() {
  if (!state.menuModal.open) return "";
  const item = state.menuModal.item || {};
  const isEdit = state.menuModal.mode === "edit";
  const isShop = isShopCatalogProfile(state.userProfile);
  const title = isEdit ? "Produkt bearbeiten" : "Produkt hinzufuegen";
  const existingImages = Array.isArray(state.menuModal.existingImages) ? state.menuModal.existingImages : [];
  const newPreviews = Array.isArray(state.menuModal.imagePreviews) ? state.menuModal.imagePreviews : [];
  const imageUrlDraft = String(state.menuModal.imageUrlDraft || "").trim();
  const gallery = [
    ...existingImages.map((src, idx) => ({ src, kind: "existing", idx })),
    ...newPreviews.map((src, idx) => ({ src, kind: "new", idx }))
  ].filter((img) => img.src);
  const heroRaw = gallery[0]?.src || imageUrlDraft || item.imageUrl || "";
  const heroUrl = heroRaw ? getOptimizedImageUrl(heroRaw, "large") : PLACEHOLDER_IMAGE;
  const safeImage = isPlaceholderUrl(heroUrl) ? PLACEHOLDER_IMAGE : heroUrl;
  const typeValue = normalizeMenuType(item.type || "food");
  const available = item.available !== false;
  const status = state.menuModal.status || "";
  const sizesValue = Array.isArray(item.sizes) ? item.sizes.join(", ") : "";
  const colorsValue = Array.isArray(item.colors) ? item.colors.join(", ") : "";
  const stockValue = Number.isFinite(Number(item.stock)) ? String(Math.max(0, Number(item.stock))) : "";
  const crop = getMenuModalCrop();

  const titleId = "menuModalTitle";
  const headerHtml = `
    <div class="flex items-start justify-between px-6 pt-6 pb-4 border-b border-slate-100">
      <div>
        <span class="text-[9px] font-black text-indigo-600 uppercase tracking-widest">${isEdit ? "Bearbeiten" : "Neu"}</span>
        <h3 id="${titleId}" class="text-xl font-black italic tracking-tighter">${title}</h3>
      </div>
      <button id="menuModalClose" class="w-11 h-11 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-500">
        ${icon("x", "w-4 h-4")}
      </button>
    </div>
  `;
  const bodyHtml = `
    <div class="flex-1 overflow-y-auto no-scrollbar modal-scroll px-6 py-5 space-y-4">
      <input type="file" id="menuItemImageInput" class="hidden" accept="image/*" multiple />
      <div class="rounded-[2.5rem] overflow-hidden border border-slate-100 bg-slate-50">
        <img id="menuItemHeroPreview" src="${escapeHtml(safeImage)}" class="w-full h-52 object-cover" style="object-position:${crop.x}% ${crop.y}%;" />
      </div>
      <button id="menuItemImageTrigger" class="w-full py-3 rounded-2xl bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest">
        Fotos hochladen
      </button>
      <div class="p-4 rounded-[1.8rem] border border-slate-100 bg-white space-y-3">
        <div class="flex items-center justify-between">
          <p class="text-[10px] font-black uppercase tracking-widest text-slate-400">Crop Horizontal</p>
          <span id="menuCropXValue" class="text-[10px] font-black uppercase tracking-widest text-slate-500">${crop.x}%</span>
        </div>
        <input id="menuItemCropX" type="range" min="0" max="100" step="1" value="${crop.x}" class="w-full accent-indigo-600" />
        <div class="flex items-center justify-between">
          <p class="text-[10px] font-black uppercase tracking-widest text-slate-400">Crop Vertikal</p>
          <span id="menuCropYValue" class="text-[10px] font-black uppercase tracking-widest text-slate-500">${crop.y}%</span>
        </div>
        <input id="menuItemCropY" type="range" min="0" max="100" step="1" value="${crop.y}" class="w-full accent-indigo-600" />
      </div>
      ${gallery.length ? `
        <div class="grid grid-cols-4 gap-2">
          ${gallery.map((img) => `
            <div class="relative rounded-xl overflow-hidden border border-slate-100 bg-slate-50">
              <img src="${escapeHtml(getOptimizedImageUrl(img.src, "thumb"))}" class="w-full h-16 object-cover" />
              <button type="button" data-menu-image-remove="${img.idx}" data-menu-image-source="${img.kind}" class="absolute top-1 right-1 w-6 h-6 rounded-full bg-white/90 text-slate-600 text-[10px] flex items-center justify-center shadow">
                ${icon("x", "w-3 h-3")}
              </button>
            </div>
          `).join("")}
        </div>
      ` : ""}

      <div class="p-5 rounded-[2rem] border border-slate-100 bg-white space-y-4">
        <div>
          <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Name</label>
          <input id="menuItemName" type="text" value="${escapeHtml(item.name || "")}" placeholder="Produktname" class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100" />
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Preis</label>
            <input id="menuItemPrice" type="text" value="${escapeHtml(item.price ?? "")}" placeholder="z.B. 4.50" class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100" />
          </div>
          <div>
            <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Kategorie</label>
            <input id="menuItemCategory" type="text" value="${escapeHtml(item.category || "")}" placeholder="z.B. Pizza" class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100" />
          </div>
        </div>
        <div>
          <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Typ</label>
          <select id="menuItemType" class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100">
            <option value="food" ${typeValue === "food" ? "selected" : ""}>${isShop ? "Produkt" : "Speise"}</option>
            <option value="drink" ${typeValue === "drink" ? "selected" : ""}>${isShop ? "Variante" : "Getraenk"}</option>
          </select>
        </div>
        <div>
          <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Beschreibung</label>
          <textarea id="menuItemDesc" rows="3" placeholder="Beschreibung..." class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100 resize-none">${escapeHtml(item.description || "")}</textarea>
        </div>
        ${isShop ? `
          <div>
            <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Details</label>
            <textarea id="menuItemLongDesc" rows="4" placeholder="Material, Zustand, Lieferdetails..." class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100 resize-none">${escapeHtml(item.longDescription || "")}</textarea>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Marke</label>
              <input id="menuItemBrand" type="text" value="${escapeHtml(item.brand || "")}" placeholder="z.B. Nike" class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100" />
            </div>
            <div>
              <label class="text-[10px] font-black text-slate-400 uppercase ml-2">SKU</label>
              <input id="menuItemSku" type="text" value="${escapeHtml(item.sku || "")}" placeholder="ART-001" class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100" />
            </div>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Groessen</label>
              <input id="menuItemSizes" type="text" value="${escapeHtml(sizesValue)}" placeholder="XS, S, M, L" class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100" />
            </div>
            <div>
              <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Farben</label>
              <input id="menuItemColors" type="text" value="${escapeHtml(colorsValue)}" placeholder="Schwarz, Weiss" class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100" />
            </div>
          </div>
          <div>
            <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Lagerbestand</label>
            <input id="menuItemStock" type="number" min="0" inputmode="numeric" value="${escapeHtml(stockValue)}" placeholder="0" class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100" />
          </div>
        ` : ""}
        <div>
          <label class="text-[10px] font-black text-slate-400 uppercase ml-2">${isShop ? "Hinweise" : "Allergene"}</label>
          <input id="menuItemAllergens" type="text" value="${escapeHtml(item.allergens || "")}" placeholder="${isShop ? "z.B. limitierte Edition, ohne Rueckgabe" : "z.B. Milch, Gluten"}" class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100" />
        </div>
        <div>
          <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Bild URL (optional)</label>
          <input id="menuItemImageUrl" type="text" value="${escapeHtml(imageUrlDraft)}" placeholder="https://..." class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100" />
        </div>
        <label class="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
          <div>
            <p class="text-xs font-black text-slate-800">Verfuegbar</p>
            <p class="text-[10px] font-bold text-slate-400">Sichtbar fuer Gaeste</p>
          </div>
          <input id="menuItemAvailable" type="checkbox" class="w-5 h-5 accent-indigo-600" ${available ? "checked" : ""} />
        </label>
      </div>
    </div>
  `;
  const footerHtml = `
    <div class="px-6 pb-6 pt-4 border-t border-slate-100 bg-white">
      <button id="menuModalSave" class="w-full py-4 rounded-[1.8rem] bg-indigo-600 text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-500/20 active:scale-95 transition-all" ${state.menuModal.loading ? "disabled" : ""}>
        ${state.menuModal.loading ? "Speichern..." : "Speichern"}
      </button>
      <div class="text-center text-[10px] font-bold text-slate-400 mt-3">${escapeHtml(status)}</div>
    </div>
  `;
  const animClass = "";

  return `
    <div class="fixed inset-0 z-[75] modal-overlay">
      <div id="menuModalOverlay" class="absolute inset-0 bg-black/60"></div>
      <div class="absolute inset-x-0 bottom-0 max-w-md mx-auto">
        <div class="bg-white rounded-t-[3rem] shadow-2xl border border-slate-100 ${animClass} flex flex-col h-[85vh] overflow-hidden modal-sheet">
          ${headerHtml}
          ${bodyHtml}
          ${footerHtml}
        </div>
      </div>
    </div>
  `;
}

function renderMenuDetailModal() {
  if (!state.menuDetail.open || !state.menuDetail.item) return "";
  const item = state.menuDetail.item;
  const images = getMenuItemImages(item);
  const maxIndex = images.length ? images.length - 1 : 0;
  const safeIndex = Math.max(0, Math.min(state.menuDetail.index || 0, maxIndex));
  const rawImg = images[safeIndex] || "";
  const imgSrc = getOptimizedImageUrl(rawImg, "large");
  const safeImg = isPlaceholderUrl(imgSrc) ? PLACEHOLDER_IMAGE : imgSrc;
  const firebaseFallback = getFirebaseStorageUrl(rawImg);
  const fallbackImg = isDirectImageUrl(rawImg) && rawImg !== safeImg ? rawImg : firebaseFallback;
  const priceLabel = formatPrice(item.price);
  const catalogProfile = state.profileView?.profile || state.userProfile;
  const typeLabel = isShopCatalogProfile(catalogProfile)
    ? (normalizeMenuType(item.type) === "drink" ? "Variante" : "Produkt")
    : (normalizeMenuType(item.type) === "drink" ? "Getraenk" : "Speise");
  const category = item.category || "";
  const desc = item.longDescription || item.description || "";
  const allergens = item.allergens || "";
  const brand = String(item.brand || "").trim();
  const sku = String(item.sku || "").trim();
  const sizes = Array.isArray(item.sizes) ? item.sizes : [];
  const colors = Array.isArray(item.colors) ? item.colors : [];
  const stock = Number.isFinite(Number(item.stock)) ? Math.max(0, Number(item.stock)) : null;
  const isShop = isShopCatalogProfile(catalogProfile);
  const soldOut = item.available === false || stock === 0;
  const availability = soldOut ? "Nicht verfuegbar" : "Verfuegbar";
  const availabilityClass = soldOut ? "text-rose-500" : "text-emerald-600";
  const selectedSize = sizes.length ? (String(state.menuDetail.selectedSize || sizes[0]).trim() || String(sizes[0])) : "";
  const selectedColor = colors.length ? (String(state.menuDetail.selectedColor || colors[0]).trim() || String(colors[0])) : "";
  const canAddToCart = isShop && canAddToShopCart(catalogProfile);
  const restaurantId = state.menuDetail.restaurantId
    || state.menu.restaurantId
    || state.profileView?.profile?.restaurantId
    || state.userProfile.restaurantId
    || "";
  const itemId = getMenuItemSocialId(item);
  const metaKey = menuItemMetaKey(restaurantId, itemId);
  const meta = metaKey ? ensureMenuItemMeta(metaKey) : { likes: [], comments: [], counts: { likes: 0, comments: 0 } };
  const counts = resolveMenuItemCounts(meta);
  const userBadge = currentUserBadge();
  const isLiked = meta.likes?.some((row) => row.uid === userBadge.uid || row.handle === userBadge.handle);
  const comments = (meta.comments || []).map(ensureCommentShape);
  const canSocial = !!restaurantId && !!itemId;
  const canInteract = canSocial && !!state.user;
  const titleId = "menuDetailTitle";
  const headerHtml = `
    <div class="flex items-start justify-between px-7 pt-7 pb-5 border-b border-slate-100 bg-white/95 backdrop-blur-sm">
      <div>
        <span class="text-[9px] font-black text-indigo-600 uppercase tracking-widest">${escapeHtml(category || typeLabel)}</span>
        <h3 id="${titleId}" class="text-xl font-black italic tracking-tighter">${escapeHtml(item.name || "Produkt")}</h3>
      </div>
      <button id="menuDetailClose" data-menu-detail-close="true" class="w-11 h-11 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-500">
        ${icon("x", "w-4 h-4")}
      </button>
    </div>
  `;
  const bodyHtml = `
    <div class="flex-1 overflow-y-auto no-scrollbar modal-scroll px-7 py-6 space-y-5 bg-gradient-to-b from-slate-50 via-white to-slate-50">
      <div class="relative rounded-[2.8rem] overflow-hidden border border-slate-100 bg-slate-50 shadow-sm" data-menu-gallery style="touch-action: pan-y;">
        <img src="${escapeHtml(safeImg)}" data-fallback-src="${escapeHtml(fallbackImg)}" class="w-full ${isShop ? "h-[24rem]" : "h-56"} object-cover" style="object-position:${getMenuItemObjectPosition(item)};" />
        ${images.length > 1 ? `
          <button type="button" data-menu-gallery-nav="prev" class="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 shadow text-slate-600 flex items-center justify-center">
            ${icon("chevron-left", "w-4 h-4")}
          </button>
          <button type="button" data-menu-gallery-nav="next" class="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 shadow text-slate-600 flex items-center justify-center">
            ${icon("chevron-right", "w-4 h-4")}
          </button>
        ` : ""}
      </div>
      ${images.length > 1 ? `
        <div class="flex items-center justify-center gap-2">
          ${images.map((_, idx) => `
            <button type="button" data-menu-gallery-dot="${idx}" class="w-2.5 h-2.5 rounded-full ${idx === safeIndex ? "bg-slate-900" : "bg-slate-200"}"></button>
          `).join("")}
        </div>
      ` : ""}
      <div class="flex items-center justify-between">
        <span class="text-lg font-black text-slate-900">${escapeHtml(priceLabel)}</span>
        <span class="text-[10px] font-black uppercase tracking-widest ${availabilityClass}">${availability}</span>
      </div>
      <div class="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
        ${category ? `<span>${escapeHtml(category)}</span>` : ""}
        <span>${escapeHtml(typeLabel)}</span>
      </div>
      ${brand || sku ? `
        <div class="grid ${brand && sku ? "grid-cols-2" : "grid-cols-1"} gap-3">
          ${brand ? `<div class="p-4 rounded-[1.6rem] bg-white border border-slate-100 shadow-sm"><p class="text-[9px] font-black uppercase tracking-widest text-slate-300">Marke</p><p class="text-xs font-bold text-slate-700 mt-1 truncate">${escapeHtml(brand)}</p></div>` : ""}
          ${sku ? `<div class="p-4 rounded-[1.6rem] bg-white border border-slate-100 shadow-sm"><p class="text-[9px] font-black uppercase tracking-widest text-slate-300">SKU</p><p class="text-xs font-bold text-slate-700 mt-1 truncate">${escapeHtml(sku)}</p></div>` : ""}
        </div>
      ` : ""}
      ${isShop && sizes.length ? `
        <div class="p-4 rounded-[1.8rem] bg-white border border-slate-100 shadow-sm">
          <p class="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Groessen</p>
          <select data-menu-detail-variant="size" class="w-full h-12 px-4 rounded-2xl bg-white text-sm font-bold text-slate-700 border border-slate-200 outline-none">
            ${sizes.map((size) => `<option value="${escapeHtml(size)}" ${selectedSize === String(size) ? "selected" : ""}>${escapeHtml(size)}</option>`).join("")}
          </select>
        </div>
      ` : ""}
      ${isShop && colors.length ? `
        <div class="p-4 rounded-[1.8rem] bg-white border border-slate-100 shadow-sm">
          <p class="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Farben</p>
          <select data-menu-detail-variant="color" class="w-full h-12 px-4 rounded-2xl bg-white text-sm font-bold text-slate-700 border border-slate-200 outline-none">
            ${colors.map((color) => `<option value="${escapeHtml(color)}" ${selectedColor === String(color) ? "selected" : ""}>${escapeHtml(color)}</option>`).join("")}
          </select>
        </div>
      ` : ""}
      ${desc ? `<p class="text-sm text-slate-600 leading-relaxed">${escapeHtml(desc)}</p>` : ""}
      ${allergens ? `
        <div class="p-4 rounded-[1.8rem] bg-white border border-slate-100 shadow-sm">
          <p class="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">${isShop ? "Hinweise" : "Allergene"}</p>
          <p class="text-sm text-slate-600">${escapeHtml(allergens)}</p>
        </div>
      ` : ""}
      ${isShop && canAddToCart ? `
        <button id="menuDetailAddToCart" class="w-full py-4 rounded-[1.8rem] ${soldOut ? "bg-slate-200 text-slate-400" : "bg-slate-900 text-white shadow-xl shadow-slate-300/50"} text-[10px] font-black uppercase tracking-[0.2em] active:scale-95" ${soldOut ? "disabled" : ""}>
          ${soldOut ? "Nicht verfuegbar" : "Shto ne shporte"}
        </button>
      ` : ""}

      <div class="flex items-center justify-between">
        <button id="menuDetailLikeBtn" class="flex items-center gap-2 text-sm font-black ${isLiked ? "text-rose-500" : "text-slate-700"} ${canInteract ? "" : "opacity-50 pointer-events-none"}">
          ${icon("heart", "w-5 h-5")} ${isLiked ? "Gefaellt" : "Like"}
        </button>
        <div class="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">
          <span id="menuDetailLikesCount">${escapeHtml(formatCount(counts.likes))} Likes</span>
          <span id="menuDetailCommentsCount">${escapeHtml(formatCount(counts.comments))} Kommentare</span>
        </div>
      </div>

      <div id="menuDetailComments" class="space-y-4">
        ${renderMenuDetailComments(comments)}
      </div>
    </div>
  `;
  const footerHtml = `
    <div class="px-7 pb-7 pt-5 border-t border-slate-100 bg-white/98 backdrop-blur-sm">
      <div class="flex gap-3">
        <textarea id="menuDetailCommentInput" placeholder="${canInteract ? "Schreib einen Kommentar..." : "Bitte einloggen, um zu kommentieren."}" class="flex-1 px-5 py-4 rounded-[1.8rem] border border-slate-100 bg-slate-50 text-sm font-medium outline-none resize-none leading-relaxed ${canInteract ? "" : "opacity-60"}" rows="1" ${canInteract ? "" : "disabled"}>${escapeHtml(state.menuDetail.commentText || "")}</textarea>
        <button id="menuDetailCommentSend" class="w-14 h-14 rounded-[1.8rem] bg-indigo-600 text-white flex items-center justify-center shadow-xl shadow-indigo-500/20 ${canInteract ? "" : "opacity-60 cursor-not-allowed"}" ${canInteract ? "" : "disabled"}>
          ${icon("send", "w-4 h-4")}
        </button>
      </div>
    </div>
  `;
  const animClass = "";

  return `
    <div class="fixed inset-0 z-[75] modal-overlay">
      <div id="menuDetailOverlay" data-menu-detail-close="true" class="absolute inset-0 bg-black/60"></div>
      <div class="absolute inset-x-0 bottom-0 max-w-md mx-auto">
        <div class="bg-white rounded-t-[3.2rem] shadow-[0_-24px_80px_rgba(15,23,42,0.22)] border border-slate-100 ${animClass} flex flex-col h-[88vh] overflow-hidden modal-sheet">
          ${headerHtml}
          ${bodyHtml}
          ${footerHtml}
        </div>
      </div>
    </div>
  `;
}

function renderFocusModal() {
  if (!state.focusModal.open) return "";
  const item = state.focusModal.item || {};
  const isEdit = state.focusModal.mode === "edit";
  const title = isEdit ? "Fokus bearbeiten" : "Fokus hinzufuegen";
  const preview = state.focusModal.imagePreview || item.imageUrl || "";
  const imageUrl = getOptimizedImageUrl(preview, "large");
  const safeImage = isPlaceholderUrl(imageUrl) ? PLACEHOLDER_IMAGE : imageUrl;
  const active = item.active !== false;
  const status = state.focusModal.status || "";
  const crop = getFocusModalCrop();

  const titleId = "focusModalTitle";
  const headerHtml = `
    <div class="flex items-start justify-between px-6 pt-6 pb-4 border-b border-slate-100">
      <div>
        <span class="text-[9px] font-black text-amber-500 uppercase tracking-widest">${isEdit ? "Bearbeiten" : "Neu"}</span>
        <h3 id="${titleId}" class="text-xl font-black italic tracking-tighter">${title}</h3>
      </div>
      <button id="focusModalClose" class="w-11 h-11 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-500">
        ${icon("x", "w-4 h-4")}
      </button>
    </div>
  `;
  const bodyHtml = `
    <div class="flex-1 overflow-y-auto no-scrollbar modal-scroll px-6 py-5 space-y-4">
      <input type="file" id="focusImageInput" class="hidden" accept="image/*" />
      <div class="rounded-[2.5rem] overflow-hidden border border-slate-100 bg-slate-50">
        <img id="focusHeroPreview" src="${escapeHtml(safeImage)}" class="w-full h-52 object-cover" style="object-position:${crop.x}% ${crop.y}%;" />
      </div>
      <button id="focusImageTrigger" class="w-full py-3 rounded-2xl bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest">
        Foto hochladen
      </button>
      <div class="p-4 rounded-[1.8rem] border border-slate-100 bg-white space-y-3">
        <div class="flex items-center justify-between">
          <p class="text-[10px] font-black uppercase tracking-widest text-slate-400">Crop Horizontal</p>
          <span id="focusCropXValue" class="text-[10px] font-black uppercase tracking-widest text-slate-500">${crop.x}%</span>
        </div>
        <input id="focusCropX" type="range" min="0" max="100" step="1" value="${crop.x}" class="w-full accent-amber-500" />
        <div class="flex items-center justify-between">
          <p class="text-[10px] font-black uppercase tracking-widest text-slate-400">Crop Vertikal</p>
          <span id="focusCropYValue" class="text-[10px] font-black uppercase tracking-widest text-slate-500">${crop.y}%</span>
        </div>
        <input id="focusCropY" type="range" min="0" max="100" step="1" value="${crop.y}" class="w-full accent-amber-500" />
      </div>

      <div class="p-5 rounded-[2rem] border border-slate-100 bg-white space-y-4">
        <div>
          <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Titel</label>
          <input id="focusTitle" type="text" value="${escapeHtml(item.title || "")}" placeholder="Sot ne Fokus" class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-amber-100" />
        </div>
        <div>
          <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Text</label>
          <textarea id="focusText" rows="3" placeholder="Beschreibung..." class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-amber-100 resize-none">${escapeHtml(item.text || "")}</textarea>
        </div>
        <div>
          <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Bild URL (optional)</label>
          <input id="focusImageUrl" type="text" value="${escapeHtml(item.imageUrl || "")}" placeholder="https://..." class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-amber-100" />
        </div>
        <label class="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
          <div>
            <p class="text-xs font-black text-slate-800">Aktiv</p>
            <p class="text-[10px] font-bold text-slate-400">Sichtbar fuer Gaeste</p>
          </div>
          <input id="focusActive" type="checkbox" class="w-5 h-5 accent-amber-500" ${active ? "checked" : ""} />
        </label>
      </div>
    </div>
  `;
  const footerHtml = `
    <div class="px-6 pb-6 pt-4 border-t border-slate-100 bg-white">
      <button id="focusModalSave" class="w-full py-4 rounded-[1.8rem] bg-amber-500 text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-amber-400/30 active:scale-95 transition-all" ${state.focusModal.loading ? "disabled" : ""}>
        ${state.focusModal.loading ? "Speichern..." : "Speichern"}
      </button>
      <div class="text-center text-[10px] font-bold text-slate-400 mt-3">${escapeHtml(status)}</div>
    </div>
  `;
  const animClass = "";

  return `
    <div class="fixed inset-0 z-[75] modal-overlay">
      <div id="focusModalOverlay" class="absolute inset-0 bg-black/60"></div>
      <div class="absolute inset-x-0 bottom-0 max-w-md mx-auto">
        <div class="bg-white rounded-t-[3rem] shadow-2xl border border-slate-100 ${animClass} flex flex-col h-[85vh] overflow-hidden modal-sheet">
          ${headerHtml}
          ${bodyHtml}
          ${footerHtml}
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

function updateMenuDetailMeta() {
  if (!state.menuDetail.open || !state.menuDetail.item) return;
  updateMenuDetailCountsOnly();
  updateMenuDetailCommentsOnly();
}

function updateMenuDetailCountsOnly() {
  if (!state.menuDetail.open || !state.menuDetail.item) return;
  const ctx = getMenuDetailContext();
  if (!ctx) return;
  const meta = ensureMenuItemMeta(ctx.key);
  const counts = resolveMenuItemCounts(meta);
  const userBadge = currentUserBadge();
  const isLiked = meta.likes?.some((item) => item.uid === userBadge.uid || item.handle === userBadge.handle);

  const likeBtn = document.getElementById("menuDetailLikeBtn");
  if (likeBtn) {
    likeBtn.classList.toggle("text-rose-500", !!isLiked);
    likeBtn.classList.toggle("text-slate-700", !isLiked);
    likeBtn.innerHTML = `${icon("heart", "w-5 h-5")} ${isLiked ? "Gefaellt" : "Like"}`;
  }
  const likesCount = document.getElementById("menuDetailLikesCount");
  if (likesCount) likesCount.textContent = `${formatCount(counts.likes)} Likes`;
  const commentsCount = document.getElementById("menuDetailCommentsCount");
  if (commentsCount) commentsCount.textContent = `${formatCount(counts.comments)} Kommentare`;
  if (window.lucide?.createIcons) window.lucide.createIcons();
}

function updateMenuDetailCommentsOnly() {
  if (!state.menuDetail.open || !state.menuDetail.item) return;
  const ctx = getMenuDetailContext();
  if (!ctx) return;
  const meta = ensureMenuItemMeta(ctx.key);
  const comments = (meta.comments || []).map(ensureCommentShape);
  const commentsRoot = document.getElementById("menuDetailComments");
  if (commentsRoot) {
    commentsRoot.innerHTML = renderMenuDetailComments(comments);
    applyCommentAvatarCache(commentsRoot);
  }
  if (window.lucide?.createIcons) window.lucide.createIcons();
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
  const avatarFit = logoFitClass(isLocalBusinessProfile(profile));
  const allowGpsSettings = isLocalBusinessProfile(profile) || isCeoUser();

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
    const avatarFit = logoFitClass(isLocalBusinessProfile(profile));
    return `
      <div class="p-6 animate-in slide-in-from-right-10 duration-500">
        <header class="flex items-center gap-4 mb-8">
          <button data-settings-back="true" class="p-3 bg-slate-100 rounded-2xl text-slate-500 hover:bg-slate-200">${icon("arrow-left", "w-4 h-4")}</button>
          <h2 class="text-xl font-black italic uppercase tracking-tighter">Account</h2>
        </header>
        
        <div class="flex flex-col items-center mb-8">
          <input type="file" id="settingsAvatarInput" class="hidden" accept="image/*" />
          <div id="settingsAvatarTrigger" class="relative group cursor-pointer">
            <img src="${escapeHtml(resolveUserAvatar(profile.avatar))}" class="w-28 h-28 rounded-[3rem] ${avatarFit} border-4 border-white shadow-xl" onerror="this.src='${PLACEHOLDER_IMAGE}'" />
            <div class="absolute -bottom-2 -right-2 w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg">${icon("camera", "w-4 h-4")}</div>
          </div>
        </div>
        
        <div class="p-6 rounded-[2rem] border border-slate-200/60 space-y-4 bg-white shadow-xl shadow-slate-200/20 relative overflow-hidden">
          <div class="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 to-purple-500"></div>

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
          
          ${allowGpsSettings ? `
            <div class="bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100/50 mt-4">
              <label class="text-[10px] font-black text-indigo-600 uppercase flex items-center gap-1 mb-2 ml-1">
                ${icon("map-pin", "w-3 h-3")} Exakter Standort (Karte)
              </label>
              <input id="settingsAddress" type="text" value="${escapeHtml(profile.address || "")}" placeholder="z.B. Rruga Garibaldi, Prishtina" class="w-full px-4 py-3 bg-white rounded-xl text-sm font-bold border border-slate-200 outline-none" />
              
              <div id="coordsDisplay" class="text-[9px] font-bold text-emerald-600 mt-2 hidden flex items-center gap-1">
                ${icon("check-circle-2", "w-3 h-3")} Standort auf Karte fixiert!
              </div>

              <button id="openLocationPickerBtn" type="button" class="w-full mt-3 bg-indigo-600 text-white py-3 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-transform">
                ${icon("map-pin", "w-3.5 h-3.5")} Auf Karte festlegen
              </button>
            </div>
          ` : ""}
          
          <button id="saveAccountBtn" class="w-full mt-6 bg-slate-900 text-white py-4 rounded-xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 active:scale-95 shadow-lg">
            ${icon("save", "w-4 h-4")} Profil Speichern
          </button>
        </div>
        <div class="mt-4 text-center text-[10px] font-bold text-slate-400" id="settingsStatus"></div>
      </div>

      <!-- LOCATION PICKER MODAL (FEINJUSTIERUNG) -->
      <div id="locationPickerModal" class="fixed inset-0 z-[3000] hidden flex flex-col p-4 pt-10">
        <div class="absolute inset-0 bg-slate-900/80 backdrop-blur-md transition-opacity duration-300 opacity-0" id="pickerOverlay"></div>
        <div class="bg-white rounded-[2.5rem] flex-1 flex flex-col overflow-hidden relative shadow-2xl transition-transform duration-300 translate-y-full" id="pickerPanel">
          <div class="p-5 flex justify-between items-center bg-white z-20 shadow-sm">
            <div>
              <h3 class="font-black text-lg leading-none">Standort anpassen</h3>
              <p class="text-[10px] font-bold text-slate-400 mt-1">Verschiebe die Karte unter den Pin</p>
            </div>
            <button id="closeLocationPickerBtn" type="button" class="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-600">${icon("x", "w-5 h-5")}</button>
          </div>
          
          <div class="flex-1 relative bg-slate-200">
            <div id="pickerMap" class="absolute inset-0 z-10"></div>
            <!-- Statischer Pin in der Mitte der Karte -->
            <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-full z-30 pointer-events-none drop-shadow-2xl">
              <div class="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center border-4 border-white shadow-xl animate-bounce">
                ${icon("map-pin", "w-5 h-5 text-white fill-indigo-600")}
              </div>
              <div class="w-1 h-4 bg-slate-800 mx-auto -mt-1 rounded-full shadow-lg"></div>
            </div>
          </div>
          
          <div class="p-5 bg-white z-20 shadow-[0_-10px_30px_rgba(0,0,0,0.1)]">
            <button id="confirmLocationBtn" type="button" class="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl flex items-center justify-center gap-2 active:scale-95 transition-transform">
              ${icon("check", "w-4 h-4")} Hier bestätigen
            </button>
          </div>
        </div>
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
        ${n.type === "follow_request" ? `<button data-follow-request-accept="${escapeHtml(n.id)}" class="px-3 py-2 rounded-xl bg-slate-900 text-white text-[9px] font-black uppercase tracking-widest active:scale-95">Accept</button>` : ""}
        ${!n.read ? "<div class=\"w-2 h-2 bg-indigo-500 rounded-full\"></div>" : ""}
        <button data-notif-delete="${n.id}" class="p-2 text-slate-300 hover:text-rose-500">${icon("trash-2", "w-4 h-4")}</button>
      </div>
    </div>
  `).join("");
}

function renderCeoGuard(title = "CRM") {
  return `
    <div class="p-6 text-center">
      <div class="w-20 h-20 rounded-[2.5rem] bg-slate-100 mx-auto flex items-center justify-center text-slate-300 mb-6">
        ${icon("lock", "w-8 h-8")}
      </div>
      <h2 class="text-lg font-black tracking-tight text-slate-900">${escapeHtml(title)}</h2>
      <p class="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-2">Nur CEO Zugriff</p>
    </div>
  `;
}

function renderLeadsView() {
  if (!isCeoUser()) return renderCeoGuard("Leads");
  if (state.leads.view === "settings") return renderLeadSettingsView();
  if (state.leads.view === "create") return renderLeadCreationView();
  const queryKey = normalizeSearchKey(state.leads.query || "");
  const statusFilter = normalizeLeadStatusKey(state.leads.status || "");
  const scope = normalizeLeadScopeKey(state.leads.scope);
  const scopePages = state.leads.pages || createLeadScopeMap(() => []);
  const scopeHasMore = state.leads.hasMore || createLeadScopeMap(() => false);
  const scopeLoaded = state.leads.loaded || createLeadScopeMap(() => false);
  const knownCount = state.leads.knownCount || createLeadScopeMap(() => 0);
  const countExact = state.leads.countExact || createLeadScopeMap(() => false);
  const profileCounts = sanitizeCeoCrmCounts(state.userProfile?.crmCounts || {});
  const ownCount = hasStoredCeoCrmCounts(state.userProfile?.crmCounts)
    ? String(profileCounts.ownLeads)
    : resolveKnownScopeCountLabel(knownCount.own, !!countExact.own, !!scopeLoaded.own);
  const staffCount = hasStoredCeoCrmCounts(state.userProfile?.crmCounts)
    ? String(profileCounts.staffLeads)
    : resolveKnownScopeCountLabel(knownCount.staff, !!countExact.staff, !!scopeLoaded.staff);
  const archivedCount = hasStoredCeoCrmCounts(state.userProfile?.crmCounts)
    ? String(profileCounts.archivedLeads)
    : resolveKnownScopeCountLabel(knownCount.archived, !!countExact.archived, !!scopeLoaded.archived);
  let items = Array.isArray(scopePages[scope]) ? scopePages[scope].slice() : [];
  if (statusFilter && scope !== "archived") {
    items = items.filter((lead) => normalizeLeadStatusKey(lead.status) === statusFilter);
  }
  items = items.filter((lead) => leadMatchesQuery(lead, queryKey));

  const listHtml = state.leads.loading
    ? `<div class="text-center text-[10px] font-bold uppercase tracking-widest text-slate-400 py-16">Leads laden...</div>`
    : (items.length ? items.map((lead) => {
      const tone = leadStatusTone(lead.status);
      const statusLabel = leadStatusLabel(lead.status);
      const rest = lead.restaurantId ? state.restaurants.find((r) => String(r.id) === String(lead.restaurantId)) : null;
      const logoRaw = lead.logoUrl || lead.logo || rest?.logoUrl || rest?.logo || "";
      const logoUrl = logoRaw ? getOptimizedImageUrl(logoRaw, "avatar") : PLACEHOLDER_IMAGE;
      const businessName = lead.businessName || rest?.name || rest?.restaurantName || "Business";
      const emailLine = lead.email || lead.socialEmail || "";
      const ownershipHtml = renderOwnershipPills(lead, { hideOwn: scope === "own" });
      return `
        <div class="bg-white p-4 rounded-[2rem] border border-slate-100 shadow-sm">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-2xl bg-slate-100 overflow-hidden flex items-center justify-center">
              <img src="${escapeHtml(logoUrl)}" class="w-full h-full object-contain bg-white" />
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-black text-slate-900 truncate">${escapeHtml(businessName)}</p>
              ${emailLine ? `<p class="text-[9px] font-bold text-slate-400 uppercase tracking-widest truncate">${escapeHtml(emailLine)}</p>` : ""}
            </div>
            <span class="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${tone.bg} ${tone.text}">${escapeHtml(statusLabel)}</span>
          </div>
          ${ownershipHtml}
          <div class="flex gap-2 mt-4">
            <button data-lead-edit="${escapeHtml(lead.id)}" class="flex-1 py-3 rounded-2xl bg-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-100">Bearbeiten</button>
          </div>
        </div>
      `;
    }).join("") : `<div class="text-center text-[10px] font-bold uppercase tracking-widest text-slate-400 py-16">Keine Leads</div>`);

  return `
    <div id="leadsView" class="p-6 animate-in slide-in-from-right-10 duration-500">
      <div class="flex items-center justify-between mb-6">
        <div>
          <span class="text-[9px] font-black text-indigo-600 uppercase tracking-widest">CRM</span>
          <h2 class="text-2xl font-black italic uppercase tracking-tighter">Leads</h2>
        </div>
        <div class="flex items-center gap-2">
          <button id="leadSettingsBtn" class="w-12 h-12 rounded-2xl bg-white text-slate-700 border border-slate-100 flex items-center justify-center shadow-sm active:scale-95">
            ${icon("settings", "w-4 h-4")}
          </button>
          <button id="newLeadBtn" class="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-xl shadow-slate-200/60 active:scale-95">
            ${icon("plus", "w-4 h-4")}
          </button>
        </div>
      </div>
      ${renderCeoScopeTabs({
        idPrefix: "lead-scope",
        active: scope,
        tabs: [
          { key: "own", label: "Meine Leads", count: ownCount },
          { key: "staff", label: "Staff Leads", count: staffCount },
          { key: "archived", label: "Archiviert", count: archivedCount }
        ]
      })}
      <div class="bg-white p-4 rounded-[2rem] border border-slate-100 shadow-sm mb-3 flex items-center gap-3">
        ${icon("search", "w-4 h-4 text-slate-400")}
        <input id="leadsSearchInput" type="text" value="${escapeHtml(state.leads.query || "")}" placeholder="Lead suchen..." class="flex-1 min-w-0 bg-transparent text-sm font-semibold text-slate-700 placeholder:text-slate-400 outline-none" />
      </div>
      ${scope !== "archived" ? `
        <div class="bg-white p-4 rounded-[2rem] border border-slate-100 shadow-sm mb-4 flex items-center gap-3">
          ${icon("list-filter", "w-4 h-4 text-slate-400")}
          <select id="leadsStatusFilter" class="flex-1 min-w-0 bg-transparent text-sm font-semibold text-slate-700 outline-none appearance-none">
            <option value="">Alle Status</option>
            ${LEAD_STATUS_ORDER.filter((key) => key !== "kunde" && key !== "no_interest").map((key) => `
              <option value="${key}" ${statusFilter === key ? "selected" : ""}>${LEAD_STATUS_LABELS[key]}</option>
            `).join("")}
          </select>
          ${icon("chevron-down", "w-4 h-4 text-slate-400")}
        </div>
      ` : ""}
      ${state.leads.error ? `<div class="text-center text-[10px] font-bold uppercase tracking-widest text-rose-500 mb-4">${escapeHtml(state.leads.error)}</div>` : ""}
      <div class="space-y-4">${listHtml}</div>
      ${state.leads.hasMore?.[scope] ? `
        <div id="leadsLoadMoreSentinel" class="w-full mt-4 py-4 rounded-[1.8rem] bg-white text-slate-400 text-[10px] font-black uppercase tracking-widest border border-slate-100 shadow-sm text-center">
          ${escapeHtml(state.leads.loadingMore ? "Laedt..." : "Scrollt weiter...")}
        </div>
      ` : ""}
    </div>
  `;
}

function isLeadInlineCreateView() {
  return state.activeTab === "leads" && state.leads?.view === "create";
}

function isLeadInlineSettingsView() {
  return state.activeTab === "leads" && state.leads?.view === "settings";
}

function renderLeadEditorUi() {
  if (isLeadInlineCreateView()) {
    render();
    return;
  }
  renderOverlays({ updateLead: true });
}

async function refineLeadLocationAddressIndex(index, value, { hydratePrimary = false } = {}) {
  const idx = Number(index);
  if (!Number.isInteger(idx) || idx < 0) return null;
  const inputValue = String(value || "").trim();
  if (!inputValue) return null;
  const extracted = extractPlusCodeFromText(inputValue);
  if (!extracted?.code || !isLikelyShortPlusCode(extracted.code) || !String(extracted.remainder || "").trim()) {
    return null;
  }
  const refined = await parseCoordsFromAddressInputAsync(inputValue, getLeadPlusCodeReference(inputValue));
  if (!refined) return null;
  const list = normalizeLeadLocations(state.leadModal.locations, state.leadModal.lead?.address || "", state.leadModal.coords || null);
  while (list.length <= idx) list.push(createLeadLocation());
  const current = list[idx] || createLeadLocation();
  list[idx] = createLeadLocation({
    address: inputValue,
    lat: refined.lat,
    lng: refined.lng
  });
  state.leadModal.locations = list;
  if (idx === 0) {
    state.leadModal.coords = { lat: refined.lat, lng: refined.lng };
    if (hydratePrimary) {
      await hydrateLeadGeoFieldsFromCoords(refined, { sourceInputId: `leadLocationAddress_${idx}` });
    }
  } else if (hasLeadLocationCoords(current) || hasLeadLocationCoords(list[idx])) {
    const primary = getPrimaryLeadLocation(list);
    state.leadModal.coords = hasLeadLocationCoords(primary) ? { lat: primary.lat, lng: primary.lng } : state.leadModal.coords;
  }
  const badgeId = idx === 0 ? "leadCoordsDisplay" : `leadLocationCoords_${idx}`;
  const badge = document.getElementById(badgeId);
  if (badge) {
    badge.classList.remove("hidden");
    if (idx === 0) {
      badge.innerHTML = `${icon("check-circle-2", "w-3 h-3")} ${escapeHtml(`${refined.lat.toFixed(4)}, ${refined.lng.toFixed(4)}`)}`;
      if (window.lucide?.createIcons) window.lucide.createIcons();
    }
  }
  return refined;
}

function renderLeadSettingsView() {
  const config = getLeadSettingsConfig();
  const explicitPassword = String(state.userProfile?.leadSettings?.defaultPassword || "").trim();
  const passwordValue = explicitPassword && explicitPassword !== LEAD_SOCIAL_DEFAULT_PASSWORD
    ? explicitPassword
    : "";
  return `
    <div id="leadSettingsView" class="p-6 animate-in slide-in-from-right-10 duration-500 pb-24">
      <div class="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm">
        <div class="space-y-4">
          <div>
            <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Lead Passwort Standard</label>
            <input id="leadSettingsPassword" type="text" value="${escapeHtml(passwordValue)}" placeholder="Hier eingeben" class="w-full mt-2 px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100" />
          </div>
          <div>
            <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Standard Standort Land</label>
            <div class="relative mt-2">
              <select id="leadSettingsDefaultCountry" class="w-full px-5 py-4 pr-12 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none appearance-none focus:ring-2 focus:ring-indigo-100">
                ${CEO_COUNTRIES.map((country) => `<option value="${escapeHtml(country)}" ${config.defaultCountry === country ? "selected" : ""}>${escapeHtml(country)}</option>`).join("")}
              </select>
              <div class="absolute inset-y-0 right-5 flex items-center text-slate-400 pointer-events-none">${icon("chevron-down", "w-4 h-4")}</div>
            </div>
          </div>
        </div>
        <div class="mt-6">
          <div class="flex items-center justify-between mb-3">
            <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Lead Typen / Monatlicher Abo Preis</p>
            <span class="text-[9px] font-black text-slate-300 uppercase tracking-widest">x12 = Jahr</span>
          </div>
          <div class="space-y-3">
            ${LEAD_TYPE_ORDER.map((key) => {
              const price = Number(config.pricing?.[key]) || 0;
              return `
                <div class="grid grid-cols-[1.2fr_0.8fr] gap-3 items-center">
                  <div class="px-4 py-4 rounded-2xl bg-slate-50 text-sm font-black text-slate-700">${escapeHtml(LEAD_TYPE_LABELS[key])}</div>
                  <div class="relative">
                    <input id="leadPrice_${escapeHtml(key)}" type="number" min="0" step="0.01" value="${escapeHtml(price ? price.toFixed(2) : "0.00")}" class="w-full px-4 py-4 pr-12 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100" />
                    <span class="absolute inset-y-0 right-4 flex items-center text-[10px] font-black text-slate-400 uppercase">EUR</span>
                  </div>
                </div>
              `;
            }).join("")}
          </div>
        </div>
        ${state.leads.settingsStatus ? `<div class="mt-5 text-center text-[10px] font-bold uppercase tracking-widest text-slate-500">${escapeHtml(state.leads.settingsStatus)}</div>` : ""}
        <button id="leadSettingsSaveBtn" type="button" class="w-full mt-6 py-4 rounded-[1.8rem] bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest shadow-xl shadow-slate-200/70 active:scale-95 transition-transform" ${state.leads.settingsSaving ? "disabled" : ""}>
          ${escapeHtml(state.leads.settingsSaving ? "Speichern..." : "Leads Settings speichern")}
        </button>
      </div>
    </div>
  `;
}

function renderLeadCreationView() {
  const lead = state.leadModal.lead || {};
  const settings = getLeadSettingsConfig();
  const logoRaw = state.leadModal.logoPreview || lead.logoUrl || "";
  const logoUrl = logoRaw ? getOptimizedImageUrl(logoRaw, "avatar") : PLACEHOLDER_IMAGE;
  const customerType = resolveCustomerType(lead.customerType || "cafe");
  const billingCycle = lead.billingCycle === "yearly" ? "yearly" : "monthly";
  const locations = normalizeLeadLocations(state.leadModal.locations, lead.address || "", state.leadModal.coords || getLeadCountryCenter(lead.country || settings.defaultCountry));
  const monthlyPrice = getLeadMonthlyPrice(customerType, settings);
  const yearlyPrice = monthlyPrice * 12;
  const totalPrice = billingCycle === "yearly" ? yearlyPrice : monthlyPrice;
  const coords = state.leadModal.coords && Number.isFinite(Number(state.leadModal.coords.lat)) && Number.isFinite(Number(state.leadModal.coords.lng))
    ? { lat: Number(state.leadModal.coords.lat), lng: Number(state.leadModal.coords.lng) }
    : null;
  return `
    <div id="leadCreateView" class="p-6 animate-in slide-in-from-right-10 duration-500 pb-28">
      <div class="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm">
        <input type="file" id="leadLogoInput" class="hidden" accept="image/*" />
        <div class="rounded-[2.5rem] overflow-hidden border border-slate-100 bg-slate-50">
          <img id="leadLogoPreview" src="${escapeHtml(logoUrl)}" class="w-full h-44 object-contain bg-white" />
        </div>
        <button id="leadLogoTrigger" type="button" class="w-full mt-4 py-3 rounded-2xl bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest">Logo hochladen</button>
        <div class="mt-5 space-y-4">
          <div>
            <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Typ</label>
            <div class="relative mt-2">
              <select id="leadCustomerType" class="w-full px-5 py-4 pr-12 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none appearance-none focus:ring-2 focus:ring-indigo-100">
                ${LEAD_TYPE_ORDER.map((key) => `<option value="${key}" ${customerType === key ? "selected" : ""}>${escapeHtml(LEAD_TYPE_LABELS[key])}</option>`).join("")}
              </select>
              <div class="absolute inset-y-0 right-5 flex items-center text-slate-400 pointer-events-none">${icon("chevron-down", "w-4 h-4")}</div>
            </div>
          </div>
          <div>
            <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Business Name</label>
            <input id="leadBusinessName" type="text" value="${escapeHtml(lead.businessName || "")}" placeholder="Business Name" class="w-full mt-2 px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100" />
          </div>
          <div>
            <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Email</label>
            <input id="leadEmail" type="email" value="${escapeHtml(lead.email || buildLeadAccountEmail(lead.businessName || ""))}" readonly class="w-full mt-2 px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold text-slate-500 border-none outline-none" />
          </div>
          <div>
            <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Passwort</label>
            <input id="leadPassword" type="text" value="${escapeHtml(lead.password || settings.defaultPassword || "")}" readonly class="w-full mt-2 px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold text-slate-500 border-none outline-none" />
          </div>
        </div>
        <div class="mt-6 p-5 rounded-[2rem] bg-slate-50 border border-slate-100 space-y-4">
          <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Kunden Daten</p>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Vorname</label>
              <input id="leadCustomerFirstName" type="text" value="${escapeHtml(lead.contactFirstName || "")}" placeholder="Vorname" class="w-full mt-2 px-4 py-3 bg-white rounded-2xl text-sm font-bold border border-slate-100 outline-none focus:ring-2 focus:ring-indigo-100" />
            </div>
            <div>
              <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Nachname</label>
              <input id="leadCustomerLastName" type="text" value="${escapeHtml(lead.contactLastName || "")}" placeholder="Nachname" class="w-full mt-2 px-4 py-3 bg-white rounded-2xl text-sm font-bold border border-slate-100 outline-none focus:ring-2 focus:ring-indigo-100" />
            </div>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Telefon</label>
              <input id="leadPhone" type="text" value="${escapeHtml(lead.phone || "")}" placeholder="+383" class="w-full mt-2 px-4 py-3 bg-white rounded-2xl text-sm font-bold border border-slate-100 outline-none focus:ring-2 focus:ring-indigo-100" />
            </div>
            <div>
              <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Instagram</label>
              <input id="leadInstagram" type="text" value="${escapeHtml(lead.instagram || "")}" placeholder="@menyra" class="w-full mt-2 px-4 py-3 bg-white rounded-2xl text-sm font-bold border border-slate-100 outline-none focus:ring-2 focus:ring-indigo-100" />
            </div>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Facebook</label>
              <input id="leadFacebook" type="text" value="${escapeHtml(lead.facebook || "")}" placeholder="Facebook" class="w-full mt-2 px-4 py-3 bg-white rounded-2xl text-sm font-bold border border-slate-100 outline-none focus:ring-2 focus:ring-indigo-100" />
            </div>
            <div>
              <label class="text-[10px] font-black text-slate-400 uppercase ml-2">TikTok</label>
              <input id="leadTiktok" type="text" value="${escapeHtml(lead.tiktok || "")}" placeholder="TikTok" class="w-full mt-2 px-4 py-3 bg-white rounded-2xl text-sm font-bold border border-slate-100 outline-none focus:ring-2 focus:ring-indigo-100" />
            </div>
          </div>
          <div>
            <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Google Maps</label>
            <input id="leadGoogleMaps" type="text" value="${escapeHtml(lead.googleMaps || "")}" placeholder="https://maps.google.com/..." class="w-full mt-2 px-5 py-4 bg-white rounded-2xl text-sm font-bold border border-slate-100 outline-none focus:ring-2 focus:ring-indigo-100" />
          </div>
        </div>
        <div class="mt-6 p-5 rounded-[2rem] bg-slate-50 border border-slate-100 space-y-4">
          <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Abo</p>
          <div>
            <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Laufzeit</label>
            <div class="relative mt-2">
              <select id="leadBillingCycle" class="w-full px-5 py-4 pr-12 bg-white rounded-2xl text-sm font-bold border border-slate-100 outline-none appearance-none focus:ring-2 focus:ring-indigo-100">
                <option value="monthly" ${billingCycle === "monthly" ? "selected" : ""}>Monatlich</option>
                <option value="yearly" ${billingCycle === "yearly" ? "selected" : ""}>Jaehrlich</option>
              </select>
              <div class="absolute inset-y-0 right-5 flex items-center text-slate-400 pointer-events-none">${icon("chevron-down", "w-4 h-4")}</div>
            </div>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Preis monatlich</label>
              <input id="leadMonthlyPrice" type="text" value="${escapeHtml(monthlyPrice ? `${monthlyPrice.toFixed(2)} EUR / Monat` : "0.00 EUR / Monat")}" readonly class="w-full mt-2 px-4 py-3 bg-white rounded-2xl text-sm font-bold text-slate-500 border border-slate-100 outline-none" />
            </div>
            <div>
              <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Preis jaehrlich</label>
              <input id="leadAnnualPrice" type="text" value="${escapeHtml(yearlyPrice ? `${yearlyPrice.toFixed(2)} EUR / Jahr` : "0.00 EUR / Jahr")}" readonly class="w-full mt-2 px-4 py-3 bg-white rounded-2xl text-sm font-bold text-slate-500 border border-slate-100 outline-none" />
            </div>
          </div>
          <div>
            <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Aktueller Preis</label>
            <input id="leadPriceValue" type="text" value="${escapeHtml(totalPrice ? `${totalPrice.toFixed(2)} EUR` : "0.00 EUR")}" readonly class="w-full mt-2 px-5 py-4 bg-white rounded-2xl text-sm font-bold text-slate-500 border border-slate-100 outline-none" />
          </div>
        </div>
        <div class="mt-6 p-5 rounded-[2rem] bg-slate-50 border border-slate-100 space-y-4">
          <div class="flex items-center justify-between">
            <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Standorte</p>
            <button type="button" data-lead-location-add class="px-3 py-2 rounded-xl bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-1">${icon("plus", "w-3.5 h-3.5")} Standort</button>
          </div>
          ${locations.map((location, index) => {
            const hasCoords = hasLeadLocationCoords(location);
            return `
              <div class="bg-white p-4 rounded-2xl border border-slate-100 space-y-3">
                <div class="flex items-center justify-between">
                  <p class="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Standort ${index + 1}</p>
                  ${index > 0 ? `<button type="button" data-lead-location-remove="${index}" class="w-8 h-8 rounded-lg bg-slate-50 text-slate-500 flex items-center justify-center border border-slate-200">${icon("x", "w-3.5 h-3.5")}</button>` : ""}
                </div>
                <input id="leadLocationAddress_${index}" data-lead-location-address="${index}" type="text" value="${escapeHtml(location.address || "")}" placeholder="Plus Code oder Adresse" class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100" />
                <div id="leadLocationCoords_${index}" class="text-[9px] font-bold text-emerald-600 flex items-center gap-1 ${hasCoords ? "" : "hidden"}">${icon("check-circle-2", "w-3 h-3")} Standort auf Karte fixiert</div>
                <button type="button" data-lead-location-pick="${index}" class="w-full bg-indigo-600 text-white py-3 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-transform">${icon("map-pin", "w-3.5 h-3.5")} Auf Karte festlegen</button>
              </div>
            `;
          }).join("")}
          <div id="leadCoordsDisplay" class="${coords ? "" : "hidden"} text-[9px] font-bold text-emerald-600 flex items-center gap-1">
            ${icon("check-circle-2", "w-3 h-3")} ${coords ? escapeHtml(`${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}`) : ""}
          </div>
        </div>
        <div class="mt-6 space-y-4">
          <div>
            <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Land</label>
            <div class="relative mt-2">
              <select id="leadCountry" class="w-full px-5 py-4 pr-12 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none appearance-none focus:ring-2 focus:ring-indigo-100">
                ${CEO_COUNTRIES.map((country) => `<option value="${escapeHtml(country)}" ${normalizeLeadCountry(lead.country || settings.defaultCountry) === country ? "selected" : ""}>${escapeHtml(country)}</option>`).join("")}
              </select>
              <div class="absolute inset-y-0 right-5 flex items-center text-slate-400 pointer-events-none">${icon("chevron-down", "w-4 h-4")}</div>
            </div>
          </div>
          <div>
            <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Stadt</label>
            <input id="leadCity" type="text" value="${escapeHtml(lead.city || "")}" placeholder="Stadt" class="w-full mt-2 px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100" />
          </div>
          <div>
            <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Adresse</label>
            <input id="leadAddress" type="text" value="${escapeHtml(lead.address || "")}" placeholder="Adresse" class="w-full mt-2 px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100" />
          </div>
          <div>
            <label class="text-[10px] font-black text-slate-400 uppercase ml-2">ZIP Code</label>
            <input id="leadZipCode" type="text" value="${escapeHtml(lead.zipCode || "")}" placeholder="10000" class="w-full mt-2 px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100" />
          </div>
          <div>
            <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Notiz</label>
            <textarea id="leadNote" rows="3" placeholder="Kurz notieren..." class="w-full mt-2 px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100 resize-none">${escapeHtml(lead.note || "")}</textarea>
          </div>
        </div>
        <input id="leadLogoUrl" type="hidden" value="${escapeHtml(lead.logoUrl || "")}" />
        <input id="leadStatus" type="hidden" value="${escapeHtml(lead.status || "registered")}" />
        <input id="leadContactName" type="hidden" value="${escapeHtml(buildLeadContactName(lead.contactFirstName, lead.contactLastName, lead.contactName || ""))}" />
        <div class="mt-6 text-center text-[10px] font-bold uppercase tracking-widest text-slate-500">${escapeHtml(state.leadModal.status || "")}</div>
        <button id="leadInlineSaveBtn" type="button" class="w-full mt-5 py-4 rounded-[1.8rem] bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest shadow-xl shadow-indigo-500/20 active:scale-95 transition-transform" ${state.leadModal.loading ? "disabled" : ""}>${escapeHtml(state.leadModal.loading ? "Speichern..." : "Lead erstellen")}</button>
      </div>
    </div>
  `;
}

function resetLeadDraft() {
  state.leadModal = {
    open: false,
    mode: "create",
    lead: null,
    status: "",
    loading: false,
    logoFile: null,
    logoPreview: "",
    coords: null,
    locations: []
  };
}

function createLeadDraftState(mode = "create", lead = null) {
  const rest = lead?.restaurantId ? state.restaurants.find((r) => String(r.id) === String(lead.restaurantId)) : null;
  const leadCoords = resolveCoordsFromEntity(lead || {});
  const restCoords = resolveCoordsFromEntity(rest || {});
  const coords = preferStableCoords(leadCoords, restCoords);
  const lat = coords?.lat;
  const lng = coords?.lng;
  const locations = normalizeLeadLocations(
    lead?.locations || rest?.locations || [],
    lead?.address || rest?.address || "",
    coords
  );
  const primary = getPrimaryLeadLocation(locations);
  const settings = getLeadSettingsConfig();
  const businessName = lead?.businessName || rest?.name || rest?.restaurantName || "";
  const monthlyPrice = getLeadMonthlyPrice(lead?.customerType || rest?.type || "cafe", settings);
  const yearlyPrice = monthlyPrice * 12;
  const country = normalizeLeadCountry(lead?.country || rest?.country || settings.defaultCountry);
  const merged = {
    ...(lead || {}),
    businessName,
    city: lead?.city || rest?.city || "",
    address: locations[0]?.address || lead?.address || rest?.address || "",
    phone: lead?.phone || rest?.phone || "",
    instagram: lead?.instagram || lead?.insta || rest?.instagram || rest?.insta || "",
    facebook: lead?.facebook || rest?.facebook || "",
    tiktok: lead?.tiktok || rest?.tiktok || "",
    googleMaps: lead?.googleMaps || rest?.googleMaps || "",
    logoUrl: lead?.logoUrl || rest?.logoUrl || rest?.logo || "",
    email: lead?.email || lead?.socialEmail || buildLeadAccountEmail(businessName),
    password: lead?.password || settings.defaultPassword,
    country,
    zipCode: lead?.zipCode || rest?.zipCode || "",
    contactFirstName: lead?.contactFirstName || rest?.contactFirstName || "",
    contactLastName: lead?.contactLastName || rest?.contactLastName || "",
    billingCycle: lead?.billingCycle === "yearly" ? "yearly" : "monthly",
    monthlyPrice,
    yearlyPrice,
    lat: hasLeadLocationCoords(primary) ? primary.lat : (Number.isFinite(lat) ? lat : undefined),
    lng: hasLeadLocationCoords(primary) ? primary.lng : (Number.isFinite(lng) ? lng : undefined),
    locations,
    status: normalizeLeadStatusKey(lead?.status || "registered") || "registered"
  };
  return {
    open: false,
    mode,
    lead: merged,
    status: "",
    loading: false,
    logoFile: null,
    logoPreview: merged.logoUrl || "",
    coords: hasLeadLocationCoords(primary)
      ? { lat: primary.lat, lng: primary.lng }
      : (coords || getLeadCountryCenter(country)),
    locations
  };
}

function openLeadCreator() {
  if (!isCeoUser()) return;
  state.leads.view = "create";
  state.leads.settingsStatus = "";
  state.leadModal = createLeadDraftState("create", null);
  render();
}

function openLeadSettingsView() {
  if (!isCeoUser()) return;
  state.leads.view = "settings";
  state.leads.settingsStatus = "";
  render();
}

function closeLeadSubview() {
  state.leads.view = "list";
  state.leads.settingsStatus = "";
  if (!state.leadModal.open) {
    resetLeadDraft();
  }
  render();
}

async function saveLeadSettings() {
  if (!state.user) return;
  const password = String(document.getElementById("leadSettingsPassword")?.value || "").trim();
  const defaultCountry = normalizeLeadCountry(document.getElementById("leadSettingsDefaultCountry")?.value || LEAD_SETTINGS_DEFAULT_COUNTRY);
  const pricing = LEAD_TYPE_ORDER.reduce((acc, key) => {
    const raw = Number(document.getElementById(`leadPrice_${key}`)?.value);
    acc[key] = Number.isFinite(raw) && raw >= 0 ? Number(raw) : 0;
    return acc;
  }, {});

  state.leads.settingsSaving = true;
  state.leads.settingsStatus = "Speichern...";
  render();

  try {
    const leadSettings = normalizeLeadSettings({
      defaultPassword: password || LEAD_SOCIAL_DEFAULT_PASSWORD,
      defaultCountry,
      pricing
    });
    await setDoc(doc(db, "users", state.user.uid), { leadSettings, updatedAt: serverTimestamp() }, { merge: true });
    state.userProfile = {
      ...state.userProfile,
      leadSettings
    };
    saveUserProfileToStorage();
    state.leads.settingsSaving = false;
    state.leads.settingsStatus = "Leads Settings gespeichert.";
    render();
  } catch (err) {
    console.error(err);
    state.leads.settingsSaving = false;
    state.leads.settingsStatus = err?.message || "Leads Settings konnten nicht gespeichert werden.";
    render();
  }
}

function getLeadFormCountryValue() {
  const inputValue = document.getElementById("leadCountry")?.value || state.leadModal?.lead?.country || "";
  return normalizeLeadCountry(inputValue || getLeadSettingsConfig().defaultCountry);
}

function getLeadPlusCodeReference(value = "") {
  return getLeadCountryCenter(inferLeadCountryFromText(value, getLeadFormCountryValue()));
}

async function reverseGeocodeCoords(coords) {
  const lat = Number(coords?.lat);
  const lng = Number(coords?.lng);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lng)}&zoom=18&addressdetails=1`;
    const res = await fetch(url);
    const data = await res.json();
    const addr = data?.address || {};
    const addressLine = [
      addr.road,
      addr.house_number
    ].filter(Boolean).join(" ").trim();
    return {
      displayName: String(data?.display_name || "").trim(),
      country: normalizeLeadCountry(addr.country || addr.country_code || ""),
      city: String(addr.city || addr.town || addr.village || addr.state_district || addr.county || "").trim(),
      zipCode: String(addr.postcode || "").trim(),
      addressLine
    };
  } catch {
    return null;
  }
}

async function hydrateLeadGeoFieldsFromCoords(coords, { sourceInputId = "" } = {}) {
  const details = await reverseGeocodeCoords(coords);
  const sourceInput = sourceInputId ? document.getElementById(sourceInputId) : null;
  const sourceValue = sourceInput ? String(sourceInput.value || "").trim() : "";
  const country = normalizeLeadCountry(details?.country || getLeadFormCountryValue());
  const city = String(details?.city || "").trim();
  const zipCode = String(details?.zipCode || "").trim();
  const address = String(details?.displayName || details?.addressLine || sourceValue || "").trim();

  const countryInput = document.getElementById("leadCountry");
  const cityInput = document.getElementById("leadCity");
  const addressInput = document.getElementById("leadAddress");
  const zipInput = document.getElementById("leadZipCode");
  const googleMapsInput = document.getElementById("leadGoogleMaps");

  if (countryInput) countryInput.value = country;
  if (cityInput && city) cityInput.value = city;
  if (addressInput && address) addressInput.value = address;
  if (zipInput && zipCode) zipInput.value = zipCode;
  if (sourceInput && address) sourceInput.value = address;
  if (googleMapsInput && !String(googleMapsInput.value || "").trim()) {
    googleMapsInput.value = `https://maps.google.com/?q=${coords.lat},${coords.lng}`;
  }

  const currentLocations = normalizeLeadLocations(state.leadModal.locations, state.leadModal.lead?.address || "", state.leadModal.coords || null);
  if (currentLocations.length && address) {
    const first = currentLocations[0] || createLeadLocation();
    currentLocations[0] = createLeadLocation({
      address,
      lat: Number.isFinite(Number(first.lat)) ? Number(first.lat) : coords.lat,
      lng: Number.isFinite(Number(first.lng)) ? Number(first.lng) : coords.lng
    });
    state.leadModal.locations = currentLocations;
  }

  const currentLead = { ...(state.leadModal.lead || {}) };
  currentLead.country = country;
  if (city) currentLead.city = city;
  if (address) currentLead.address = address;
  if (zipCode) currentLead.zipCode = zipCode;
  if (!String(currentLead.googleMaps || "").trim()) {
    currentLead.googleMaps = `https://maps.google.com/?q=${coords.lat},${coords.lng}`;
  }
  state.leadModal.lead = currentLead;
}

function syncLeadDerivedFields() {
  if (!isLeadInlineCreateView()) return;
  const settings = getLeadSettingsConfig();
  const businessName = String(document.getElementById("leadBusinessName")?.value || state.leadModal?.lead?.businessName || "").trim();
  const type = resolveCustomerType(document.getElementById("leadCustomerType")?.value || state.leadModal?.lead?.customerType || "cafe");
  const cycle = document.getElementById("leadBillingCycle")?.value === "yearly" ? "yearly" : "monthly";
  const email = buildLeadAccountEmail(businessName);
  const password = settings.defaultPassword;
  const monthly = getLeadMonthlyPrice(type, settings);
  const total = getLeadPriceForCycle(type, cycle, settings);
  const yearly = monthly * 12;

  const emailInput = document.getElementById("leadEmail");
  const passwordInput = document.getElementById("leadPassword");
  const monthlyInput = document.getElementById("leadMonthlyPrice");
  const yearlyInput = document.getElementById("leadAnnualPrice");
  const priceInput = document.getElementById("leadPriceValue");

  if (emailInput) emailInput.value = email;
  if (passwordInput) passwordInput.value = password;
  if (monthlyInput) monthlyInput.value = monthly ? `${monthly.toFixed(2)} EUR / Monat` : "0.00 EUR / Monat";
  if (yearlyInput) yearlyInput.value = yearly ? `${yearly.toFixed(2)} EUR / Jahr` : "0.00 EUR / Jahr";
  if (priceInput) priceInput.value = total ? `${total.toFixed(2)} EUR` : "0.00 EUR";

  if (state.leadModal?.lead) {
    state.leadModal.lead = {
      ...state.leadModal.lead,
      businessName,
      customerType: type,
      email,
      password,
      billingCycle: cycle,
      monthlyPrice: monthly,
      yearlyPrice: yearly
    };
  }
}

function renderCustomersView() {
  if (!isCeoUser()) return renderCeoGuard("Kunden");
  const queryKey = normalizeSearchKey(state.customers.query || "");
  const scope = normalizeCustomerScopeKey(state.customers.scope);
  const scopePages = state.customers.pages || createCustomerScopeMap(() => []);
  const scopeHasMore = state.customers.hasMore || createCustomerScopeMap(() => false);
  const scopeLoaded = state.customers.loaded || createCustomerScopeMap(() => false);
  const knownCount = state.customers.knownCount || createCustomerScopeMap(() => 0);
  const countExact = state.customers.countExact || createCustomerScopeMap(() => false);
  const profileCounts = sanitizeCeoCrmCounts(state.userProfile?.crmCounts || {});
  const ownCount = hasStoredCeoCrmCounts(state.userProfile?.crmCounts)
    ? String(profileCounts.ownCustomers)
    : resolveKnownScopeCountLabel(knownCount.own, !!countExact.own, !!scopeLoaded.own);
  const staffCount = hasStoredCeoCrmCounts(state.userProfile?.crmCounts)
    ? String(profileCounts.staffCustomers)
    : resolveKnownScopeCountLabel(knownCount.staff, !!countExact.staff, !!scopeLoaded.staff);
  const items = (Array.isArray(scopePages[scope]) ? scopePages[scope].slice() : [])
    .filter((rest) => customerMatchesQuery(rest, queryKey))
    .sort((a, b) => (toDateSafe(b?.createdAt)?.getTime() || 0) - (toDateSafe(a?.createdAt)?.getTime() || 0));
  const listHtml = state.customers.loading
    ? `<div class="text-center text-[10px] font-bold uppercase tracking-widest text-slate-400 py-16">Kunden laden...</div>`
    : (items.length ? items.map((rest) => {
      const logoRaw = rest.logoUrl || rest.logo || "";
      const logoUrl = logoRaw ? getOptimizedImageUrl(logoRaw, "avatar") : PLACEHOLDER_IMAGE;
      const name = rest.name || rest.restaurantName || "Business";
      const typeLabel = leadTypeLabel(rest.type || rest.customerType || "");
      const city = rest.city || "";
      const statusLabel = customerStatusLabel(isCustomerRestaurant(rest) ? "kunde" : rest.status);
      const ownershipHtml = renderOwnershipPills(rest, { hideOwn: scope === "own" });
      return `
        <div class="bg-white p-4 rounded-[2rem] border border-slate-100 shadow-sm">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-2xl bg-slate-100 overflow-hidden flex items-center justify-center">
              <img src="${escapeHtml(logoUrl)}" class="w-full h-full object-contain bg-white" />
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-black text-slate-900 truncate">${escapeHtml(name)}</p>
              <p class="text-[9px] font-bold text-slate-400 uppercase tracking-widest truncate">${escapeHtml([typeLabel, city].filter(Boolean).join(" / "))}</p>
            </div>
            <span class="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest bg-slate-100 text-slate-500">${escapeHtml(statusLabel)}</span>
          </div>
          ${ownershipHtml}
          <div class="flex gap-2 mt-4">
            <button data-customer-edit="${escapeHtml(rest.id)}" class="flex-1 py-3 rounded-2xl bg-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-100">Bearbeiten</button>
          </div>
        </div>
      `;
    }).join("") : `<div class="text-center text-[10px] font-bold uppercase tracking-widest text-slate-400 py-16">Keine Kunden</div>`);

  return `
    <div id="customersView" class="p-6 animate-in slide-in-from-right-10 duration-500">
      <div class="flex items-center justify-between mb-6">
        <div>
          <span class="text-[9px] font-black text-indigo-600 uppercase tracking-widest">CRM</span>
          <h2 class="text-2xl font-black italic uppercase tracking-tighter">Kunden</h2>
        </div>
      </div>
      ${renderCeoScopeTabs({
        idPrefix: "customer-scope",
        active: scope,
        ownLabel: "Meine Kunden",
        ownCount,
        staffLabel: "Staff Kunden",
        staffCount
      })}
      <div class="bg-white p-4 rounded-[2rem] border border-slate-100 shadow-sm mb-4 flex items-center gap-3">
        ${icon("search", "w-4 h-4 text-slate-400")}
        <input id="customersSearchInput" type="text" value="${escapeHtml(state.customers.query || "")}" placeholder="Kunde suchen..." class="flex-1 min-w-0 bg-transparent text-sm font-semibold text-slate-700 placeholder:text-slate-400 outline-none" />
      </div>
      ${state.customers.error ? `<div class="text-center text-[10px] font-bold uppercase tracking-widest text-rose-500 mb-4">${escapeHtml(state.customers.error)}</div>` : ""}
      <div class="space-y-4">${listHtml}</div>
      ${state.customers.hasMore?.[scope] ? `
        <div id="customersLoadMoreSentinel" class="w-full mt-4 py-4 rounded-[1.8rem] bg-white text-slate-400 text-[10px] font-black uppercase tracking-widest border border-slate-100 shadow-sm text-center">
          ${escapeHtml(state.customers.loadingMore ? "Laedt..." : "Scrollt weiter...")}
        </div>
      ` : ""}
    </div>
  `;
}

function renderStaffEditorView() {
  const current = getCurrentCeoMeta();
  const form = state.staff.form || {};
  const isEditing = !!state.staff.editorUid;
  const isSelfEdit = isEditing && String(state.staff.editorUid || "") === String(current.uid || "");
  const coords = form.coords && Number.isFinite(Number(form.coords.lat)) && Number.isFinite(Number(form.coords.lng))
    ? { lat: Number(form.coords.lat), lng: Number(form.coords.lng) }
    : null;
  const emailValue = getStaffFormEmail(form, { preferStored: isEditing });
  const avatarRaw = form.avatarPreview || form.avatarUrl || "";
  const avatarUrl = avatarRaw ? getOptimizedImageUrl(avatarRaw, "avatar") : PLACEHOLDER_IMAGE;
  const safeAvatar = (!avatarUrl || isPlaceholderUrl(avatarUrl)) ? PLACEHOLDER_IMAGE : avatarUrl;
  const saveLabel = state.staff.saving
    ? (isEditing ? "Speichern..." : "Erstelle CEO...")
    : (isEditing ? "CEO speichern" : "CEO erstellen");

  return `
    <div id="staffEditorView" class="p-6 animate-in slide-in-from-right-10 duration-500 pb-24">
      <div class="mb-6">
        <span class="text-[9px] font-black text-indigo-600 uppercase tracking-widest">CEO</span>
        <h2 class="text-2xl font-black italic uppercase tracking-tighter">${escapeHtml(isEditing ? "Edit CEO" : "Create CEO")}</h2>
      </div>

      <div class="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm">
        <input type="file" id="staffAvatarInput" class="hidden" accept="image/*" />
        <div class="flex flex-col items-center mb-6">
          <button id="staffAvatarTrigger" type="button" class="relative group">
            <img id="staffAvatarPreview" src="${escapeHtml(safeAvatar)}" class="w-28 h-28 rounded-[2.6rem] object-cover border-4 border-white shadow-xl bg-slate-100" onerror="this.src='${PLACEHOLDER_IMAGE}'" />
            <div class="absolute -bottom-2 -right-2 w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
              ${icon("camera", "w-4 h-4")}
            </div>
          </button>
          <p class="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-4">Profilbild hochladen</p>
        </div>

        <div class="space-y-4">
          <div>
            <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Vorname</label>
            <input id="staffFirstName" type="text" value="${escapeHtml(form.firstName || "")}" placeholder="Vorname" class="w-full mt-2 px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100" />
          </div>
          <div>
            <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Nachname</label>
            <input id="staffLastName" type="text" value="${escapeHtml(form.lastName || "")}" placeholder="Nachname" class="w-full mt-2 px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100" />
          </div>
          <div>
            <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Email</label>
            <input id="staffEmail" type="email" value="${escapeHtml(emailValue)}" placeholder="vornamenachname@menyra.com" readonly class="w-full mt-2 px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold text-slate-500 border-none outline-none" />
          </div>
          <div>
            <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Passwort</label>
            <input id="staffPassword" type="password" value="" placeholder="${escapeHtml(isEditing ? "Passwort bleibt unveraendert" : "Passwort eingeben")}" ${isEditing ? "disabled" : ""} class="w-full mt-2 px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100 ${isEditing ? "text-slate-400" : ""}" />
          </div>
          <div>
            <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Land</label>
            <div class="relative mt-2">
              <select id="staffCountry" class="w-full px-5 py-4 pr-12 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none appearance-none focus:ring-2 focus:ring-indigo-100">
                ${CEO_COUNTRIES.map((country) => `<option value="${escapeHtml(country)}" ${normalizeCeoCountry(form.country) === country ? "selected" : ""}>${escapeHtml(country)}</option>`).join("")}
              </select>
              <div class="absolute inset-y-0 right-5 flex items-center text-slate-400 pointer-events-none">${icon("chevron-down", "w-4 h-4")}</div>
            </div>
          </div>
          <div>
            <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Standort</label>
            <input id="staffLocationLabel" type="text" value="${escapeHtml(form.locationLabel || "")}" placeholder="Standort / Adresse" class="w-full mt-2 px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100" />
          </div>
        </div>

        <button id="staffLocationPickBtn" type="button" class="w-full mt-4 py-4 rounded-2xl bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20 active:scale-95 transition-transform">
          ${icon("map-pin", "w-4 h-4")} Standort mit Pin waehlen
        </button>
        <div id="staffCoordsDisplay" class="mt-3 ${coords ? "" : "hidden"} px-3 py-3 rounded-2xl bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2">
          ${icon("check-circle-2", "w-4 h-4")} ${coords ? escapeHtml(`${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}`) : ""}
        </div>

        ${state.staff.error ? `<div class="mt-4 text-center text-[10px] font-bold uppercase tracking-widest text-rose-500">${escapeHtml(state.staff.error)}</div>` : ""}
        ${state.staff.status ? `<div class="mt-4 text-center text-[10px] font-bold uppercase tracking-widest text-slate-500">${escapeHtml(state.staff.status)}</div>` : ""}

        <button id="staffSaveBtn" type="button" class="w-full mt-5 py-4 rounded-[1.8rem] bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest shadow-xl shadow-slate-200/70 active:scale-95 transition-transform" ${state.staff.saving ? "disabled" : ""}>
          ${escapeHtml(saveLabel)}
        </button>
        ${isEditing ? `
          <button id="staffDeleteBtn" type="button" class="w-full mt-3 py-4 rounded-[1.8rem] bg-rose-50 text-rose-600 text-[10px] font-black uppercase tracking-widest border border-rose-100 active:scale-95 transition-transform ${isSelfEdit ? "opacity-60 cursor-not-allowed" : ""}" ${(state.staff.deleting || isSelfEdit) ? "disabled" : ""}>
            ${escapeHtml(state.staff.deleting ? "Loeschen..." : "CEO loeschen")}
          </button>
        ` : ""}
      </div>
    </div>
  `;
}

function renderStaffView() {
  if (!isCeoUser()) return renderCeoGuard("Staff");
  if (state.staff.view === "form") return renderStaffEditorView();
  const current = getCurrentCeoMeta();
  const items = Array.isArray(state.staff.items) ? state.staff.items.slice() : [];
  const loadedLeadRows = [
    ...(Array.isArray(state.leads.pages?.own) ? state.leads.pages.own : []),
    ...(Array.isArray(state.leads.pages?.staff) ? state.leads.pages.staff : []),
    ...(Array.isArray(state.leads.pages?.archived) ? state.leads.pages.archived : [])
  ];
  const loadedCustomerRows = [
    ...(Array.isArray(state.customers.pages?.own) ? state.customers.pages.own : []),
    ...(Array.isArray(state.customers.pages?.staff) ? state.customers.pages.staff : [])
  ];
  const listHtml = state.staff.loading
    ? `<div class="text-center text-[10px] font-bold uppercase tracking-widest text-slate-400 py-16">Staff laden...</div>`
    : (items.length ? items.map((entry) => {
      const isSelf = String(entry.uid || "") === String(current.uid || "");
      const relation = isSelf ? "Du" : (String(entry.ceoParentUid || "") === String(current.uid || "") ? "Direkt" : "Unterstaff");
      const storedCounts = entry.crmCounts && typeof entry.crmCounts === "object" ? entry.crmCounts : {};
      const leadCount = Number.isFinite(Number(storedCounts.ownLeads))
        ? Number(storedCounts.ownLeads)
        : loadedLeadRows.filter((lead) => String(lead.createdByUid || "") === String(entry.uid || "")).length;
      const customerCount = Number.isFinite(Number(storedCounts.ownCustomers))
        ? Number(storedCounts.ownCustomers)
        : loadedCustomerRows.filter((customer) => String(customer.createdByUid || "") === String(entry.uid || "")).length;
      const locationText = entry.locationLabel || entry.location || entry.city || entry.country || "-";
      const avatarRaw = entry.avatarPreview || entry.avatarUrl || entry.avatar || "";
      const avatarUrl = avatarRaw ? getOptimizedImageUrl(avatarRaw, "avatar") : PLACEHOLDER_IMAGE;
      const safeAvatar = (!avatarUrl || isPlaceholderUrl(avatarUrl)) ? PLACEHOLDER_IMAGE : avatarUrl;
      return `
        <button data-staff-edit="${escapeHtml(entry.uid || "")}" class="w-full text-left bg-white p-4 rounded-[2rem] border border-slate-100 shadow-sm active:scale-[0.99] transition-transform">
          <div class="flex items-center gap-3">
            <div class="w-14 h-14 rounded-[1.4rem] overflow-hidden bg-slate-100 shrink-0">
              <img src="${escapeHtml(safeAvatar)}" class="w-full h-full object-cover" onerror="this.src='${PLACEHOLDER_IMAGE}'" />
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-black text-slate-900 truncate">${escapeHtml(entry.name || "CEO")}</p>
              <p class="text-[9px] font-bold text-slate-400 uppercase tracking-widest truncate">@${escapeHtml(entry.handle || normalizeHandle(entry.name || "ceo"))}</p>
              <p class="text-[10px] font-bold text-slate-500 mt-2 truncate">${escapeHtml(entry.email || "-")}</p>
            </div>
            <span class="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${isSelf ? "bg-slate-900 text-white" : "bg-indigo-50 text-indigo-600"}">${escapeHtml(relation)}</span>
          </div>
          <div class="flex flex-wrap gap-2 mt-3">
            <span class="px-2.5 py-1 rounded-full bg-slate-100 text-slate-500 text-[9px] font-black uppercase tracking-widest">${escapeHtml(entry.country || "-")}</span>
            <span class="px-2.5 py-1 rounded-full bg-slate-100 text-slate-500 text-[9px] font-black uppercase tracking-widest truncate max-w-full">${escapeHtml(locationText)}</span>
          </div>
          <div class="grid grid-cols-2 gap-3 mt-4">
            <div class="rounded-2xl bg-slate-50 px-4 py-3">
              <p class="text-[9px] font-black uppercase tracking-widest text-slate-400">Leads</p>
              <p class="text-sm font-black text-slate-900 mt-1">${escapeHtml(String(leadCount))}</p>
            </div>
            <div class="rounded-2xl bg-slate-50 px-4 py-3">
              <p class="text-[9px] font-black uppercase tracking-widest text-slate-400">Kunden</p>
              <p class="text-sm font-black text-slate-900 mt-1">${escapeHtml(String(customerCount))}</p>
            </div>
          </div>
          <div class="flex items-center justify-between mt-4 pt-3 border-t border-slate-100">
            <span class="text-[10px] font-black uppercase tracking-widest text-slate-400">Tippen zum Bearbeiten</span>
            <span class="w-9 h-9 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center">${icon("chevron-right", "w-4 h-4")}</span>
          </div>
        </button>
      `;
    }).join("") : `<div class="text-center text-[10px] font-bold uppercase tracking-widest text-slate-400 py-16">Noch kein CEO Staff</div>`);

  return `
    <div id="staffView" class="p-6 animate-in slide-in-from-right-10 duration-500 pb-24">
      <div class="flex items-center justify-between mb-6">
        <div>
          <span class="text-[9px] font-black text-indigo-600 uppercase tracking-widest">CEO</span>
          <h2 class="text-2xl font-black italic uppercase tracking-tighter">Staff</h2>
        </div>
        <button id="staffNewBtn" class="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-xl shadow-slate-200/60 active:scale-95">
          ${icon("plus", "w-4 h-4")}
        </button>
      </div>
      ${state.staff.error ? `<div class="text-center text-[10px] font-bold uppercase tracking-widest text-rose-500 mb-4">${escapeHtml(state.staff.error)}</div>` : ""}
      ${state.staff.status ? `<div class="text-center text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-4">${escapeHtml(state.staff.status)}</div>` : ""}
      <div class="space-y-4">${listHtml}</div>
      ${state.staff.hasMore ? `
        <div id="staffLoadMoreSentinel" class="w-full mt-4 py-4 rounded-[1.8rem] bg-white text-slate-400 text-[10px] font-black uppercase tracking-widest border border-slate-100 shadow-sm text-center">
          ${escapeHtml(state.staff.loadingMore ? "Laedt..." : "Scrollt weiter...")}
        </div>
      ` : ""}
    </div>
  `;
}

function renderOrdersView() {
  const isBusiness = isLocalBusinessProfile(state.userProfile) && !!state.userProfile.restaurantId;
  const orders = Array.isArray(state.orders.items) ? state.orders.items : [];
  return `
    <div id="ordersView" class="p-6 animate-in slide-in-from-right-10 duration-500">
      <div class="flex items-center justify-between mb-6">
        <div>
          <span class="text-[9px] font-black text-indigo-600 uppercase tracking-widest">Orders</span>
          <h2 class="text-2xl font-black italic uppercase tracking-tighter">Bestellungen</h2>
        </div>
      </div>
      ${state.orders.loading ? `
        <div class="text-center py-16 text-[10px] font-black uppercase tracking-widest text-slate-400">Bestellungen werden geladen...</div>
      ` : state.orders.error ? `
        <div class="text-center py-16 text-[10px] font-black uppercase tracking-widest text-rose-500">${escapeHtml(state.orders.error)}</div>
      ` : orders.length ? `
        <div class="space-y-4">
          ${orders.map((order) => {
            const avatarRaw = isBusiness ? order.buyerAvatar : order.businessAvatar;
            const avatarUrl = getOptimizedImageUrl(avatarRaw, "avatar");
            const fallbackName = isBusiness ? (order.contact.name || order.buyerName || "Kunde") : (order.businessName || "Shop");
            const metaLine = isBusiness
              ? [order.contact.phone, order.contact.city].filter(Boolean).join(" / ")
              : `${order.itemCount} Artikel`;
            return `
              <div class="bg-white rounded-[2rem] p-4 border border-slate-100 shadow-sm">
                <div class="flex items-center gap-3 mb-4">
                  <div class="w-12 h-12 rounded-2xl overflow-hidden bg-slate-100 shrink-0">
                    <img src="${escapeHtml(avatarUrl)}" class="w-full h-full ${isBusiness ? "object-cover" : "object-contain bg-white"}" />
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-black text-slate-900 truncate">${escapeHtml(fallbackName)}</p>
                    <p class="text-[10px] font-bold uppercase tracking-widest text-slate-400 truncate">${escapeHtml(metaLine)}</p>
                  </div>
                  <span class="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-700">${escapeHtml(order.status || "Neu")}</span>
                </div>
                <div class="space-y-2">
                  ${order.items.slice(0, 3).map((item) => `
                    <div class="flex items-center justify-between text-sm">
                      <span class="font-semibold text-slate-700 truncate pr-3">${escapeHtml(item.quantity)}x ${escapeHtml(item.name)}${item.selectedSize || item.selectedColor ? ` <span class="text-slate-400">(${escapeHtml([item.selectedSize, item.selectedColor].filter(Boolean).join(" / "))})</span>` : ""}</span>
                      <span class="font-black text-slate-900">${escapeHtml(formatPrice(parsePriceValue(item.price) * item.quantity))}</span>
                    </div>
                  `).join("")}
                  ${order.items.length > 3 ? `<p class="text-[10px] font-bold uppercase tracking-widest text-slate-300">+${escapeHtml(order.items.length - 3)} weitere</p>` : ""}
                </div>
                <div class="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                  <div class="min-w-0">
                    ${isBusiness ? `<p class="text-[10px] font-bold uppercase tracking-widest text-slate-400 truncate">${escapeHtml([order.contact.city, order.contact.address].filter(Boolean).join(" / "))}</p>` : `<p class="text-[10px] font-bold uppercase tracking-widest text-slate-400 truncate">@${escapeHtml(order.buyerHandle || "user")}</p>`}
                    <p class="text-[10px] font-bold uppercase tracking-widest text-slate-300 mt-1">${escapeHtml(formatRelative(toDateSafe(order.createdAt) || new Date()))}</p>
                  </div>
                  <span class="text-base font-black text-slate-900 shrink-0">${escapeHtml(formatPrice(order.total))}</span>
                </div>
              </div>
            `;
          }).join("")}
        </div>
      ` : `
        <div class="text-center py-16 text-[10px] font-black uppercase tracking-widest text-slate-300">Noch keine Bestellungen</div>
      `}
    </div>
  `;
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
          <p class="text-sm font-medium text-slate-500">Posten als ${isLocalBusinessProfile(profile) ? "Business (Feed)" : "User (Profil)"}</p>
        </div>
      `}
    </div>
  `;
}

function renderChatView() {
  const threads = sortChatThreads(state.chatThreads);
  if (!state.chatModal.open || !state.chatModal.profile) {
    return `
      <div id="chatListView" class="flex-1 min-h-0 overflow-y-auto no-scrollbar p-6 animate-in slide-in-from-right-10 duration-500">
        ${threads.length ? `
          <div class="space-y-3">
            ${threads.map((thread) => {
              const avatarUrl = getOptimizedImageUrl(thread.avatar, "avatar");
              const unreadCount = Math.max(0, Number(thread.unreadCount || 0));
              return `
                <button
                  data-chat-open-thread="true"
                  data-chat-uid="${escapeHtml(thread.uid || "")}"
                  data-chat-handle="${escapeHtml(thread.handle || "")}"
                  data-chat-name="${escapeHtml(thread.name || "User")}"
                  data-chat-avatar="${escapeHtml(thread.avatar || "")}"
                  class="w-full p-4 rounded-[2rem] bg-white border border-slate-100 shadow-sm text-left flex items-center gap-4 active:scale-[0.99] transition-all"
                >
                  <img src="${escapeHtml(avatarUrl)}" class="w-14 h-14 rounded-2xl object-cover shadow-sm" />
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center justify-between gap-3">
                      <div class="min-w-0 flex-1 flex items-center gap-2">
                        <p class="text-sm font-black text-slate-900 truncate">${escapeHtml(thread.name || "User")}</p>
                        ${unreadCount ? `<span class="shrink-0 min-w-[20px] h-5 px-1.5 rounded-full bg-rose-500 text-white text-[10px] font-black flex items-center justify-center">${unreadCount > 9 ? "9+" : unreadCount}</span>` : ""}
                      </div>
                      <span class="text-[9px] font-bold uppercase tracking-widest text-slate-300">${escapeHtml(formatRelative(new Date(Number(thread.updatedAt || Date.now()))))}</span>
                    </div>
                    <p class="text-[10px] font-bold uppercase tracking-widest text-slate-400 truncate mt-1">@${escapeHtml(String(thread.handle || "user").replace(/^@/, ""))}</p>
                    <p class="text-sm ${unreadCount ? "text-slate-800 font-semibold" : "text-slate-500"} truncate mt-2">${escapeHtml(thread.lastMessage || "Chat oeffnen")}</p>
                  </div>
                </button>
              `;
            }).join("")}
          </div>
        ` : `
          <div class="min-h-[60vh] flex items-center justify-center text-center">
            <div>
              <div class="w-16 h-16 rounded-[1.8rem] bg-white border border-slate-100 text-slate-400 mx-auto flex items-center justify-center mb-5 shadow-sm">
                ${icon("messages-square", "w-7 h-7")}
              </div>
              <p class="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">Noch keine Chats</p>
              <p class="text-sm font-medium text-slate-500 mt-3">Oeffne ein Profil und tippe auf das Chat-Icon.</p>
            </div>
          </div>
        `}
      </div>
    `;
  }

  const partner = state.chatModal.profile;
  const messages = Array.isArray(state.chatModal.messages) ? state.chatModal.messages : [];
  const pendingAttachments = Array.isArray(state.chatModal.attachments) ? state.chatModal.attachments : [];
  return `
    <div id="chatThreadView" class="flex-1 min-h-0 px-4 pb-4 flex flex-col animate-in slide-in-from-right-10 duration-500">
      <div class="bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden flex flex-col flex-1 min-h-0 shadow-sm">
        <div id="chatMessages" class="flex-1 min-h-0 overflow-y-auto no-scrollbar p-4 space-y-3 bg-slate-50/70">
          ${messages.length ? messages.map((message) => `
            <div class="flex ${message.from === "self" ? "justify-end" : "justify-start"}">
              <div class="max-w-[84%]">
                <div class="rounded-[1.6rem] px-4 py-3 ${message.from === "self" ? "bg-slate-900 text-white" : "bg-white text-slate-700 border border-slate-100"}">
                  ${(Array.isArray(message.attachments) && message.attachments.length) ? `
                    <div class="space-y-2 ${message.text ? "mb-3" : ""}">
                      ${message.attachments.map((attachment) => `
                        ${attachment.kind === "image" && attachment.dataUrl ? `
                          <img src="${escapeHtml(attachment.dataUrl)}" class="w-full max-h-56 rounded-2xl object-cover border ${message.from === "self" ? "border-slate-700" : "border-slate-100"}" />
                        ` : `
                          ${attachment.dataUrl ? `
                            <a href="${escapeHtml(attachment.dataUrl)}" download="${escapeHtml(attachment.name || "datei")}" class="flex items-center gap-3 p-3 rounded-2xl ${message.from === "self" ? "bg-slate-800 text-white" : "bg-slate-50 text-slate-700"}">
                              <div class="w-9 h-9 rounded-xl flex items-center justify-center ${message.from === "self" ? "bg-slate-700" : "bg-white border border-slate-200"}">${icon("paperclip", "w-4 h-4")}</div>
                              <div class="min-w-0 flex-1">
                                <div class="text-xs font-black truncate">${escapeHtml(attachment.name || "Datei")}</div>
                                <div class="text-[9px] font-bold uppercase tracking-widest ${message.from === "self" ? "text-slate-300" : "text-slate-400"}">Datei</div>
                              </div>
                            </a>
                          ` : `
                            <div class="flex items-center gap-3 p-3 rounded-2xl ${message.from === "self" ? "bg-slate-800 text-white" : "bg-slate-50 text-slate-700"}">
                              <div class="w-9 h-9 rounded-xl flex items-center justify-center ${message.from === "self" ? "bg-slate-700" : "bg-white border border-slate-200"}">${icon("file", "w-4 h-4")}</div>
                              <div class="min-w-0 flex-1">
                                <div class="text-xs font-black truncate">${escapeHtml(attachment.name || "Datei")}</div>
                                <div class="text-[9px] font-bold uppercase tracking-widest ${message.from === "self" ? "text-slate-300" : "text-slate-400"}">${attachment.oversize ? "Zu gross fuer Vorschau" : "Datei"}</div>
                              </div>
                            </div>
                          `}
                        `}
                      `).join("")}
                    </div>
                  ` : ""}
                  ${message.text ? `<div class="text-sm font-medium leading-relaxed whitespace-pre-wrap">${escapeHtml(message.text || "")}</div>` : ""}
                </div>
                <div class="flex items-center ${message.from === "self" ? "justify-end" : "justify-start"} gap-2 mt-2 px-1">
                  <button data-chat-save="${escapeHtml(message.id)}" class="w-7 h-7 rounded-full flex items-center justify-center ${message.saved ? "bg-emerald-100 text-emerald-600" : "bg-white text-slate-400 border border-slate-200"}">
                    ${icon(message.saved ? "check" : "plus", "w-3.5 h-3.5")}
                  </button>
                  <button data-chat-like="${escapeHtml(message.id)}" class="w-7 h-7 rounded-full flex items-center justify-center ${message.liked ? "bg-rose-100 text-rose-500" : "bg-white text-slate-400 border border-slate-200"}">
                    ${icon("heart", `w-3.5 h-3.5 ${message.liked ? "fill-rose-500 text-rose-500" : ""}`)}
                  </button>
                  <div class="text-[9px] font-bold uppercase tracking-widest ${message.from === "self" ? "text-slate-400" : "text-slate-300"}">
                    ${message.saved ? "Gespeichert" : "24h"}
                  </div>
                </div>
                <div class="text-[9px] font-bold uppercase tracking-widest mt-2 ${message.from === "self" ? "text-slate-300" : "text-slate-400"}">${escapeHtml(formatRelative(toDateSafe(message.createdAt) || new Date()))}</div>
              </div>
            </div>
          `).join("") : `
            <div class="h-full min-h-[40vh] flex items-center justify-center text-center">
              <div>
                <div class="w-14 h-14 rounded-[1.4rem] bg-white border border-slate-100 text-slate-400 mx-auto flex items-center justify-center mb-4">
                  ${icon("message-circle", "w-6 h-6")}
                </div>
                <p class="text-[10px] font-black uppercase tracking-widest text-slate-400">Schreib ${escapeHtml(partner.name || "User")} zuerst</p>
              </div>
            </div>
          `}
        </div>
        <div class="p-4 border-t border-slate-100 bg-white">
          ${(pendingAttachments.length) ? `
            <div class="flex gap-2 overflow-x-auto no-scrollbar pb-3">
              ${pendingAttachments.map((attachment) => `
                <div class="shrink-0 min-w-[84px] max-w-[120px] rounded-2xl border border-slate-100 bg-slate-50 p-2 relative">
                  <button data-chat-remove-attachment="${escapeHtml(attachment.id)}" class="absolute top-1 right-1 w-5 h-5 rounded-full bg-white border border-slate-200 text-slate-400 flex items-center justify-center">
                    ${icon("x", "w-3 h-3")}
                  </button>
                  ${attachment.kind === "image" && attachment.dataUrl ? `
                    <img src="${escapeHtml(attachment.dataUrl)}" class="w-full h-16 rounded-xl object-cover mb-2" />
                  ` : `
                    <div class="w-full h-16 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 mb-2">
                      ${icon(attachment.kind === "image" ? "image" : "file", "w-5 h-5")}
                    </div>
                  `}
                  <div class="text-[10px] font-black text-slate-600 truncate pr-4">${escapeHtml(attachment.name || "Datei")}</div>
                </div>
              `).join("")}
            </div>
          ` : ""}
          <input type="file" id="chatAttachmentInput" class="hidden" multiple />
          <div class="flex items-end gap-3">
            <button id="chatAttachmentTrigger" class="w-[52px] h-[52px] shrink-0 rounded-2xl bg-slate-100 text-slate-600 flex items-center justify-center active:scale-95">
              ${icon("plus", "w-5 h-5")}
            </button>
            <textarea id="chatMessageInput" rows="1" placeholder="Nachricht..." class="flex-1 p-4 rounded-2xl border border-slate-100 bg-slate-50 text-sm font-medium outline-none resize-none max-h-28">${escapeHtml(state.chatModal.draft || "")}</textarea>
            <button id="chatSendBtn" class="px-5 h-[52px] rounded-2xl bg-slate-900 text-white font-black text-[10px] uppercase tracking-widest active:scale-95">Send</button>
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderHeader() {
  const unread = state.notifications.filter((n) => !n.read).length;
  const chatUnread = getChatUnreadCount();
  const headerUnread = unread + chatUnread;
  const badge = headerUnread > 9 ? "9+" : String(headerUnread || "");
  const branding = resolveHeaderBranding();
  const avatarUrl = branding.logoUrl;
  const avatarFit = logoFitClass(branding.isBusinessLogo);
  const titleClass = "text-2xl font-black italic tracking-tighter leading-none text-slate-900 max-w-[220px] mx-auto truncate";
  const subtitleClass = `text-[9px] font-black text-indigo-600 uppercase tracking-[0.4em] block${branding.subtitle ? "" : " hidden"}`;
  if (state.activeTab === "staff" && state.staff?.view === "form") {
    return `
      <header class="p-6 pb-2 flex justify-between items-center relative z-40 bg-slate-50">
        <button data-staff-back="true" class="w-14 h-14 rounded-3xl shadow-xl flex items-center justify-center active:scale-95 transition-all bg-white border border-slate-50 shadow-slate-200/30">
          ${icon("arrow-left", "w-5 h-5")}
        </button>
        <div class="text-center">
          <h1 class="${titleClass}">MENYRA</h1>
          <span class="text-[9px] font-black text-indigo-600 uppercase tracking-[0.3em] block">CEO Creation</span>
        </div>
        <button data-nav="profile" class="w-14 h-14 rounded-3xl shadow-xl overflow-hidden p-1 active:scale-95 transition-transform bg-white border border-slate-50 shadow-slate-200/30">
          <img id="headerAvatar" data-img-key="avatar:header" src="${escapeHtml(avatarUrl)}" class="w-full h-full rounded-[1.4rem] ${avatarFit}" />
        </button>
      </header>
    `;
  }
  if (state.activeTab === "leads" && (state.leads?.view === "create" || state.leads?.view === "settings")) {
    const isSettingsView = state.leads?.view === "settings";
    return `
      <header class="p-6 pb-2 flex justify-between items-center relative z-40 bg-slate-50">
        <button data-leads-back="true" class="w-14 h-14 rounded-3xl shadow-xl flex items-center justify-center active:scale-95 transition-all bg-white border border-slate-50 shadow-slate-200/30">
          ${icon("arrow-left", "w-5 h-5")}
        </button>
        <div class="text-center">
          <h1 class="${titleClass}">MENYRA</h1>
          <span class="text-[9px] font-black text-indigo-600 uppercase tracking-[0.3em] block">${isSettingsView ? "Leads Settings" : "Leads Creation"}</span>
        </div>
        <button data-nav="profile" class="w-14 h-14 rounded-3xl shadow-xl overflow-hidden p-1 active:scale-95 transition-transform bg-white border border-slate-50 shadow-slate-200/30">
          <img id="headerAvatar" data-img-key="avatar:header" src="${escapeHtml(avatarUrl)}" class="w-full h-full rounded-[1.4rem] ${avatarFit}" />
        </button>
      </header>
    `;
  }
  if (state.activeTab === "chat" && state.chatModal.open && state.chatModal.profile) {
    const partner = state.chatModal.profile;
    const partnerAvatar = getOptimizedImageUrl(partner.avatar, "avatar");
    return `
      <header class="p-6 pb-3 flex items-center justify-between gap-3 relative z-40 bg-slate-50">
        <button data-chat-back="true" class="w-14 h-14 rounded-3xl shadow-xl flex items-center justify-center active:scale-95 transition-all bg-white border border-slate-50 shadow-slate-200/30">
          ${icon("arrow-left", "w-5 h-5")}
        </button>
        <div class="flex-1 min-w-0 text-center">
          <h1 class="text-lg font-black tracking-tight text-slate-900 truncate">${escapeHtml(partner.name || "User")}</h1>
          <span class="text-[9px] font-black text-slate-400 uppercase tracking-[0.35em] block truncate">@${escapeHtml(String(partner.handle || "user").replace(/^@/, ""))}</span>
        </div>
        <div class="flex items-center gap-2">
          <div class="w-12 h-12 rounded-2xl overflow-hidden p-1 bg-white border border-slate-100 shadow-sm">
            <img src="${escapeHtml(partnerAvatar)}" class="w-full h-full rounded-[1rem] object-cover" />
          </div>
          <button data-chat-gift="true" class="w-12 h-12 rounded-2xl bg-white border border-slate-100 text-slate-500 flex items-center justify-center shadow-sm active:scale-95">
            ${icon("gift", "w-4 h-4")}
          </button>
        </div>
      </header>
    `;
  }
  if (state.activeTab === "chat") {
    return `
      <header class="p-6 pb-3 flex justify-between items-center relative z-40 bg-slate-50">
        <button id="drawerToggle" class="w-14 h-14 rounded-3xl shadow-xl flex flex-col gap-1.5 items-start justify-center p-4 active:scale-95 transition-all bg-white border border-slate-50 shadow-slate-200/30 relative">
          <div class="w-6 h-0.5 rounded-full bg-slate-900"></div>
          <div class="w-4 h-0.5 rounded-full bg-slate-900"></div>
          <div class="w-5 h-0.5 rounded-full bg-slate-900"></div>
          ${headerUnread ? `<span data-unread-badge="header" class="absolute -top-1 -right-1 min-w-[20px] h-5 px-1.5 rounded-full bg-rose-500 text-white text-[10px] font-black flex items-center justify-center shadow-lg">${badge}</span>` : ""}
        </button>
        <div class="text-center">
          <h1 class="text-2xl font-black italic tracking-tighter leading-none text-slate-900">CHATS</h1>
          <span class="text-[9px] font-black text-indigo-600 uppercase tracking-[0.4em] block">DIRECT</span>
        </div>
        <button data-nav="profile" class="w-14 h-14 rounded-3xl shadow-xl overflow-hidden p-1 active:scale-95 transition-transform bg-white border border-slate-50 shadow-slate-200/30">
          <img id="headerAvatar" data-img-key="avatar:header" src="${escapeHtml(avatarUrl)}" class="w-full h-full rounded-[1.4rem] ${avatarFit}" />
        </button>
      </header>
    `;
  }
  return `
    <header class="p-6 pb-2 flex justify-between items-center relative z-40 bg-slate-50">
      <button id="drawerToggle" class="w-14 h-14 rounded-3xl shadow-xl flex flex-col gap-1.5 items-start justify-center p-4 active:scale-95 transition-all bg-white border border-slate-50 shadow-slate-200/30 relative">
        <div class="w-6 h-0.5 rounded-full bg-slate-900"></div>
        <div class="w-4 h-0.5 rounded-full bg-slate-900"></div>
        <div class="w-5 h-0.5 rounded-full bg-slate-900"></div>
        ${headerUnread ? `<span data-unread-badge="header" class="absolute -top-1 -right-1 min-w-[20px] h-5 px-1.5 rounded-full bg-rose-500 text-white text-[10px] font-black flex items-center justify-center shadow-lg">${badge}</span>` : ""}
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
  if (state.activeTab !== "profile") return false;
  const profile = state.profileView?.profile || state.userProfile;
  return isRestaurantCafeProfile(profile);
}

function renderBusinessTopTabs() {
  if (!shouldShowBusinessTopTabs()) return "";
  const profile = state.profileView?.profile || state.userProfile;
  const catalogLabel = getBusinessCatalogLabel(profile);
  const isShop = isShopCatalogProfile(profile);
  const base = "flex-1 py-3 rounded-[1.5rem] text-[11px] font-bold uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2";
  const activeTop = state.profileTopTab || "profile";
  const isProfileActive = activeTop === "profile";
  const isMenuActive = activeTop === "menu";
  const isCartActive = activeTop === "cart";
  const cartCount = isShop ? getCartCountForRestaurant(profile?.restaurantId || "") : 0;
  const spacingClass = isProfileActive ? "pb-1" : "pb-3";
  return `
    <div class="px-6 ${spacingClass}">
      <div class="bg-white/60 p-1.5 rounded-[2rem] border border-white/50 shadow-sm flex items-center gap-1 backdrop-blur-sm">
        <button type="button" data-profile-top-tab="profile" class="${base} ${isProfileActive ? "bg-white text-slate-900 shadow-[0_4px_12px_-2px_rgba(0,0,0,0.08),0_2px_6px_-1px_rgba(0,0,0,0.04)] scale-[1.02]" : "text-slate-400 hover:text-slate-600"}">
          Profil
        </button>
        <button type="button" data-profile-top-tab="menu" class="${base} ${isMenuActive ? "bg-white text-slate-900 shadow-[0_4px_12px_-2px_rgba(0,0,0,0.08),0_2px_6px_-1px_rgba(0,0,0,0.04)] scale-[1.02]" : "text-slate-400 hover:text-slate-600"}">
          ${catalogLabel}
        </button>
        ${isShop ? `
          <button type="button" data-profile-top-tab="cart" class="${base} relative ${isCartActive ? "bg-white text-slate-900 shadow-[0_4px_12px_-2px_rgba(0,0,0,0.08),0_2px_6px_-1px_rgba(0,0,0,0.04)] scale-[1.02]" : "text-slate-400 hover:text-slate-600"}">
            ${icon("shopping-cart", "w-4 h-4")}
            ${cartCount ? `<span class="absolute top-1 right-2 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-500 text-white text-[9px] font-black flex items-center justify-center">${cartCount > 9 ? "9+" : cartCount}</span>` : ""}
          </button>
        ` : `
          <button type="button" disabled class="${base} text-slate-300 cursor-not-allowed">
            Reviews
          </button>
        `}
      </div>
    </div>
  `;
}

function renderMain() {
  let view = "";
  if (state.activeTab === "feed") view = renderFeedView();
  if (state.activeTab === "chat") view = renderChatView();
  if (state.activeTab === "search") view = renderSearchView();
  if (state.activeTab === "map") view = renderMapView();
  if (state.activeTab === "profile") view = state.profileView ? renderPublicProfileView() : renderProfileView();
  if (state.activeTab === "menu") view = renderMenuAdminView();
  if (state.activeTab === "orders") view = renderOrdersView();
  if (state.activeTab === "leads") view = renderLeadsView();
  if (state.activeTab === "staff") view = renderStaffView();
  if (state.activeTab === "customers") view = renderCustomersView();
  if (state.activeTab === "settings") view = renderSettingsView();
  if (state.activeTab === "notifications") view = renderNotificationsView();
  if (state.activeTab === "upload") view = renderUploadView();
  const mainClass = state.activeTab === "chat"
    ? "flex-1 min-h-0 flex flex-col overflow-hidden"
    : "flex-1 min-h-0 overflow-y-auto no-scrollbar pb-24";

  return `
    <div class="h-full min-h-full bg-slate-50 text-slate-900 max-w-md mx-auto shadow-2xl relative flex flex-col overflow-hidden font-sans">
      ${renderDrawer()}
      <main class="${mainClass}">
        ${renderHeader()}
        ${renderBusinessTopTabs()}
        ${view}
      </main>
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
  if (!document.getElementById("modalUnderlay")) {
    const underlay = document.createElement("div");
    underlay.id = "modalUnderlay";
    underlay.className = "fixed inset-0 bg-white z-[50] hidden pointer-events-none";
    root.appendChild(underlay);
  }
  if (!document.getElementById("profileOverlayRoot")) {
    const profileRoot = document.createElement("div");
    profileRoot.id = "profileOverlayRoot";
    root.appendChild(profileRoot);
  }
  if (!document.getElementById("chatOverlayRoot")) {
    const chatRoot = document.createElement("div");
    chatRoot.id = "chatOverlayRoot";
    root.appendChild(chatRoot);
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
  if (!document.getElementById("menuOverlayRoot")) {
    const menuRoot = document.createElement("div");
    menuRoot.id = "menuOverlayRoot";
    root.appendChild(menuRoot);
  }
  if (!document.getElementById("menuDetailOverlayRoot")) {
    const menuDetailRoot = document.createElement("div");
    menuDetailRoot.id = "menuDetailOverlayRoot";
    root.appendChild(menuDetailRoot);
  }
  if (!document.getElementById("focusOverlayRoot")) {
    const focusRoot = document.createElement("div");
    focusRoot.id = "focusOverlayRoot";
    root.appendChild(focusRoot);
  }
  if (!document.getElementById("leadOverlayRoot")) {
    const leadRoot = document.createElement("div");
    leadRoot.id = "leadOverlayRoot";
    root.appendChild(leadRoot);
  }
  if (!document.getElementById("customerOverlayRoot")) {
    const customerRoot = document.createElement("div");
    customerRoot.id = "customerOverlayRoot";
    root.appendChild(customerRoot);
  }
  return root;
}

function ensureModalEscapeHandler() {
  if (modalEscapeBound || typeof document === "undefined") return;
  const handler = (evt) => {
    if (evt.key !== "Escape") return;
    if (closeActiveModal()) {
      evt.preventDefault();
    }
  };
  document.addEventListener("keydown", handler);
  modalEscapeBound = true;
}

function syncModalOpenUiState() {
  const anyModalOpen = isAnyModalOpen();
  const underlay = document.getElementById("modalUnderlay");
  if (underlay) underlay.classList.toggle("hidden", !anyModalOpen);
  document.documentElement.classList.toggle("modal-open", anyModalOpen);
  document.body.classList.toggle("modal-open", anyModalOpen);
  if (anyModalOpen) ensureModalEscapeHandler();
}

function renderOverlays(options = {}) {
  const updateProfile = Object.prototype.hasOwnProperty.call(options, "updateProfile")
    ? options.updateProfile
    : !state.likesModal.open;
  const updateChat = Object.prototype.hasOwnProperty.call(options, "updateChat")
    ? options.updateChat
    : false;
  const updatePost = Object.prototype.hasOwnProperty.call(options, "updatePost")
    ? options.updatePost
    : !state.likesModal.open;
  const updateLikes = Object.prototype.hasOwnProperty.call(options, "updateLikes")
    ? options.updateLikes
    : !state.likesModal.open;
  const updateMenu = Object.prototype.hasOwnProperty.call(options, "updateMenu")
    ? options.updateMenu
    : !state.likesModal.open;
  const updateMenuDetail = Object.prototype.hasOwnProperty.call(options, "updateMenuDetail")
    ? options.updateMenuDetail
    : !state.likesModal.open;
  const updateFocus = Object.prototype.hasOwnProperty.call(options, "updateFocus")
    ? options.updateFocus
    : !state.likesModal.open;
  const updateLead = Object.prototype.hasOwnProperty.call(options, "updateLead")
    ? options.updateLead
    : !state.likesModal.open;
  const updateCustomer = Object.prototype.hasOwnProperty.call(options, "updateCustomer")
    ? options.updateCustomer
    : !state.likesModal.open;
  const root = ensureOverlayRoot();
  const profileRoot = document.getElementById("profileOverlayRoot");
  const chatRoot = document.getElementById("chatOverlayRoot");
  const postRoot = document.getElementById("postOverlayRoot");
  const likesRoot = document.getElementById("likesOverlayRoot");
  const menuRoot = document.getElementById("menuOverlayRoot");
  const menuDetailRoot = document.getElementById("menuDetailOverlayRoot");
  const focusRoot = document.getElementById("focusOverlayRoot");
  const leadRoot = document.getElementById("leadOverlayRoot");
  const customerRoot = document.getElementById("customerOverlayRoot");
  let profileChanged = false;
  let chatChanged = false;
  let postChanged = false;
  let likesChanged = false;
  let menuChanged = false;
  let menuDetailChanged = false;
  let focusChanged = false;
  let leadChanged = false;
  let customerChanged = false;

  if (updateProfile) {
    const profileHtml = renderProfileModal();
    profileChanged = profileHtml !== overlayCache.profile;
    if (profileRoot && profileChanged) {
      profileRoot.innerHTML = profileHtml;
      overlayCache.profile = profileHtml;
    }
  }
  if (updateChat) {
    const chatHtml = renderChatModal();
    chatChanged = chatHtml !== overlayCache.chat;
    if (chatRoot && chatChanged) {
      chatRoot.innerHTML = chatHtml;
      overlayCache.chat = chatHtml;
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
  if (updateMenu) {
    const menuHtml = renderMenuItemModal();
    menuChanged = menuHtml !== overlayCache.menu;
    if (menuRoot && menuChanged) {
      menuRoot.innerHTML = menuHtml;
      overlayCache.menu = menuHtml;
    }
  }
  if (updateMenuDetail) {
    const detailHtml = renderMenuDetailModal();
    menuDetailChanged = detailHtml !== overlayCache.menuDetail;
    if (menuDetailRoot && menuDetailChanged) {
      menuDetailRoot.innerHTML = detailHtml;
      overlayCache.menuDetail = detailHtml;
    }
  }
  if (updateFocus) {
    const focusHtml = renderFocusModal();
    focusChanged = focusHtml !== overlayCache.focus;
    if (focusRoot && focusChanged) {
      focusRoot.innerHTML = focusHtml;
      overlayCache.focus = focusHtml;
    }
  }
  if (updateLead) {
    const leadHtml = renderLeadModal();
    leadChanged = leadHtml !== overlayCache.lead;
    if (leadRoot && leadChanged) {
      leadRoot.innerHTML = leadHtml;
      overlayCache.lead = leadHtml;
    }
  }
  if (updateCustomer) {
    const customerHtml = renderCustomerModal();
    customerChanged = customerHtml !== overlayCache.customer;
    if (customerRoot && customerChanged) {
      customerRoot.innerHTML = customerHtml;
      overlayCache.customer = customerHtml;
    }
  }
  syncModalOpenUiState();
  if (window.lucide?.createIcons && (profileChanged || chatChanged || postChanged || likesChanged || menuChanged || menuDetailChanged || focusChanged || leadChanged || customerChanged)) {
    window.lucide.createIcons();
  }
  bindOverlayEvents({ profileChanged, chatChanged, postChanged, likesChanged, menuChanged, menuDetailChanged, focusChanged, leadChanged, customerChanged });
}

function bindImageFallbacks(root = document) {
  if (!root) return;
  root.querySelectorAll("img[data-fallback-src]").forEach((img) => {
    if (!(img instanceof HTMLImageElement)) return;
    if (img.dataset.fallbackBound === "true") return;
    img.dataset.fallbackBound = "true";
    img.addEventListener("error", () => {
      const fallback = img.dataset.fallbackSrc || "";
      const current = img.getAttribute("src") || "";
      if (fallback && current !== fallback) {
        img.setAttribute("src", fallback);
        return;
      }
      if (current !== PLACEHOLDER_IMAGE) {
        img.setAttribute("src", PLACEHOLDER_IMAGE);
      }
    });
  });
}

function renderLoading() {
  return `
    <div class="h-full min-h-full flex items-center justify-center text-slate-400 text-sm font-bold">
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
    const preserveMainScroll = mode === "main"
      && lastRenderMode === "main"
      && state.activeTab === lastRenderedMainTab;
    const reuseFeed = preserveMainScroll && state.activeTab === "feed"
      ? document.getElementById("feedView")
      : null;
    const prevScrollTop = preserveMainScroll ? document.querySelector("main")?.scrollTop ?? 0 : 0;
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
    } else if (preserveMainScroll) {
      const nextMain = document.querySelector("main");
      if (nextMain) nextMain.scrollTop = prevScrollTop;
    }
    if (window.lucide?.createIcons) window.lucide.createIcons();
    if (state.activeTab === "search" && state.search.keepFocus) {
      state.search.keepFocus = false;
      focusSearchInput();
    }
    if (state.activeTab === "leads" && state.leads.keepFocus) {
      state.leads.keepFocus = false;
      focusInputById("leadsSearchInput");
    }
    if (state.activeTab === "customers" && state.customers.keepFocus) {
      state.customers.keepFocus = false;
      focusInputById("customersSearchInput");
    }
    if (mode === "main") lastRenderedMainTab = state.activeTab;
    else lastRenderedMainTab = "";
  }

  renderOverlays();
  if (mode === "main" || lastRenderMode === "main") {
    updateNotificationBadges();
  }
  updateFocusRotation();

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
  if (toggleBtn) {
    toggleBtn.addEventListener("click", () => {
      state.auth.mode = state.auth.mode === "login" ? "register" : "login";
      state.auth.error = "";
      state.auth.role = "user";
      render();
    });
  }

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
          if (admin) {
            await ensureUserProfile(cred.user, admin?.profile || {});
          }
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
            role: "user",
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

function bindModalDismiss(target, handler, { selfOnly = false } = {}) {
  if (!target || typeof handler !== "function") return;
  const onDismiss = (evt) => {
    if (selfOnly && evt.target !== target) return;
    if (evt.type === "touchstart") evt.preventDefault();
    handler();
  };
  target.addEventListener("click", onDismiss);
  target.addEventListener("pointerdown", onDismiss);
  target.addEventListener("touchstart", onDismiss, { passive: false });
}

function bindOverlayEvents({
  profileChanged = true,
  chatChanged = true,
  postChanged = true,
  likesChanged = true,
  menuChanged = true,
  menuDetailChanged = true,
  focusChanged = true,
  leadChanged = true,
  customerChanged = true
} = {}) {
  if (!menuDetailCloseBound) {
    menuDetailCloseBound = true;
    const closeHandler = (evt) => {
      const target = evt.target?.closest?.("[data-menu-detail-close]");
      if (!target) return;
      if (!state.menuDetail.open) return;
      evt.preventDefault();
      closeMenuDetail();
    };
    document.addEventListener("click", closeHandler, true);
    document.addEventListener("pointerdown", closeHandler, true);
    document.addEventListener("touchstart", closeHandler, { capture: true, passive: false });
  }
  if (profileChanged) {
    const profileModalOverlay = document.getElementById("profileModalOverlay");
    const profileModalClose = document.getElementById("profileModalClose");
    const profileChatBtn = document.getElementById("profileChatBtn");
    const profileFollowBtn = document.getElementById("profileFollowBtn");
    const profileOpenBtn = document.getElementById("profileOpenBtn");
    bindModalDismiss(profileModalOverlay, closeProfileModal, { selfOnly: true });
    bindModalDismiss(profileModalClose, closeProfileModal);
    if (profileChatBtn) {
      profileChatBtn.addEventListener("click", () => {
        openChatWithProfile({
          uid: profileChatBtn.dataset.chatUid || "",
          handle: profileChatBtn.dataset.chatHandle || "",
          name: profileChatBtn.dataset.chatName || "User",
          avatar: profileChatBtn.dataset.chatAvatar || ""
        });
      });
    }
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

  if (chatChanged) {
    const chatModalOverlay = document.getElementById("chatModalOverlay");
    const chatModalClose = document.getElementById("chatModalClose");
    const chatSendBtn = document.getElementById("chatSendBtn");
    const chatInput = document.getElementById("chatMessageInput");
    const chatMessages = document.getElementById("chatMessages");
    bindModalDismiss(chatModalOverlay, closeChatModal, { selfOnly: true });
    bindModalDismiss(chatModalClose, closeChatModal);
    if (chatSendBtn) {
      chatSendBtn.addEventListener("click", () => {
        sendChatMessage();
      });
    }
    if (chatInput) {
      chatInput.addEventListener("input", () => {
        state.chatModal.draft = chatInput.value;
      });
      chatInput.addEventListener("keydown", (evt) => {
        if (evt.key === "Enter" && !evt.shiftKey) {
          evt.preventDefault();
          sendChatMessage();
        }
      });
      queueMicrotask(() => {
        chatInput.focus({ preventScroll: true });
        const len = chatInput.value.length;
        try {
          chatInput.setSelectionRange(len, len);
        } catch {}
      });
    }
    if (chatMessages) {
      queueMicrotask(() => {
        chatMessages.scrollTop = chatMessages.scrollHeight;
      });
    }
  }

  if (postChanged) {
    const postModalOverlay = document.getElementById("postModalOverlay");
    const postModalClose = document.getElementById("postModalClose");
    bindModalDismiss(postModalOverlay, closePostModal, { selfOnly: true });
    bindModalDismiss(postModalClose, closePostModal);

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
        void loadPostLikesForModal(postId);
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
    bindModalDismiss(likesModalOverlay, closeLikesModal, { selfOnly: true });
    bindModalDismiss(likesModalClose, closeLikesModal);
  }

  if (menuChanged) {
    const menuModalOverlay = document.getElementById("menuModalOverlay");
    const menuModalClose = document.getElementById("menuModalClose");
    const menuModalSave = document.getElementById("menuModalSave");
    const menuImageTrigger = document.getElementById("menuItemImageTrigger");
    const menuImageInput = document.getElementById("menuItemImageInput");
    const menuImageUrl = document.getElementById("menuItemImageUrl");
    const menuCropX = document.getElementById("menuItemCropX");
    const menuCropY = document.getElementById("menuItemCropY");

    bindModalDismiss(menuModalOverlay, closeMenuModal, { selfOnly: true });
    bindModalDismiss(menuModalClose, closeMenuModal);
    if (menuModalSave) {
      menuModalSave.addEventListener("click", () => {
        if (state.menuModal.loading) return;
        void saveMenuItemFromModal();
      });
    }
    if (menuImageTrigger && menuImageInput) {
      menuImageTrigger.addEventListener("click", () => menuImageInput.click());
    }
    if (menuImageInput) {
      menuImageInput.addEventListener("change", (e) => {
        const files = Array.from(e.target.files || []);
        if (!files.length) return;
        const nextFiles = [...(state.menuModal.imageFiles || []), ...files];
        const previews = [];
        let remaining = files.length;
        files.forEach((file) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            previews.push(reader.result || "");
            remaining -= 1;
            if (remaining <= 0) {
              state.menuModal.imageFiles = nextFiles;
              state.menuModal.imagePreviews = [
                ...(state.menuModal.imagePreviews || []),
                ...previews
              ];
              renderOverlays({ updateMenu: true });
            }
          };
          reader.readAsDataURL(file);
        });
      });
    }
    if (menuImageUrl) {
      menuImageUrl.addEventListener("input", () => {
        state.menuModal.imageUrlDraft = menuImageUrl.value || "";
        const preview = document.getElementById("menuItemHeroPreview");
        const hasGallery = !!(state.menuModal.existingImages || []).length || !!(state.menuModal.imagePreviews || []).length;
        if (preview && !hasGallery) {
          preview.setAttribute("src", menuImageUrl.value.trim() || PLACEHOLDER_IMAGE);
          syncMenuModalCropPreview();
        }
      });
    }
    if (menuCropX) {
      menuCropX.addEventListener("input", () => {
        state.menuModal.cropX = clampCropPercent(menuCropX.value, 50);
        syncMenuModalCropPreview();
      });
    }
    if (menuCropY) {
      menuCropY.addEventListener("input", () => {
        state.menuModal.cropY = clampCropPercent(menuCropY.value, 50);
        syncMenuModalCropPreview();
      });
    }
    syncMenuModalCropPreview();

    document.querySelectorAll("[data-menu-image-remove]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const idx = Number(btn.dataset.menuImageRemove || "0");
        const source = btn.dataset.menuImageSource || "existing";
        if (source === "existing") {
          const next = (state.menuModal.existingImages || []).filter((_, i) => i !== idx);
          state.menuModal.existingImages = next;
        } else {
          const nextFiles = (state.menuModal.imageFiles || []).filter((_, i) => i !== idx);
          const nextPreviews = (state.menuModal.imagePreviews || []).filter((_, i) => i !== idx);
          state.menuModal.imageFiles = nextFiles;
          state.menuModal.imagePreviews = nextPreviews;
        }
        renderOverlays({ updateMenu: true });
      });
    });
  }

  if (menuDetailChanged) {
    const menuDetailOverlay = document.getElementById("menuDetailOverlay");
    const menuDetailClose = document.getElementById("menuDetailClose");
    bindModalDismiss(menuDetailOverlay, closeMenuDetail, { selfOnly: true });
    bindModalDismiss(menuDetailClose, closeMenuDetail);

    document.querySelectorAll("[data-menu-detail-variant]").forEach((input) => {
      input.addEventListener("change", () => {
        const field = input.dataset.menuDetailVariant || "";
        setMenuDetailVariant(field, input.value || "");
      });
    });

    const menuDetailAddToCart = document.getElementById("menuDetailAddToCart");
    if (menuDetailAddToCart) {
      menuDetailAddToCart.addEventListener("click", () => {
        if (!state.menuDetail.item) return;
        const profile = state.profileView?.profile || state.userProfile;
        addMenuItemToShopCart(state.menuDetail.item, profile, {
          size: state.menuDetail.selectedSize || "",
          color: state.menuDetail.selectedColor || ""
        });
      });
    }

    const menuDetailLikeBtn = document.getElementById("menuDetailLikeBtn");
    if (menuDetailLikeBtn) {
      menuDetailLikeBtn.addEventListener("click", () => {
        void toggleMenuItemLike();
      });
    }

    const menuDetailCommentInput = document.getElementById("menuDetailCommentInput");
    if (menuDetailCommentInput) {
      autosizeTextarea(menuDetailCommentInput, { minHeight: 56, maxHeight: 160 });
      menuDetailCommentInput.addEventListener("input", () => {
        state.menuDetail.commentText = menuDetailCommentInput.value;
        autosizeTextarea(menuDetailCommentInput, { minHeight: 56, maxHeight: 160 });
      });
      menuDetailCommentInput.addEventListener("focus", () => {
        window.setTimeout(() => {
          try {
            menuDetailCommentInput.scrollIntoView({ block: "nearest", behavior: "smooth" });
          } catch {}
        }, 180);
      });
      menuDetailCommentInput.addEventListener("keydown", (evt) => {
        if (evt.key === "Enter" && !evt.shiftKey) {
          evt.preventDefault();
          const text = menuDetailCommentInput.value || state.menuDetail.commentText;
          if (!String(text || "").trim() || state.menuDetail.sending) return;
          state.menuDetail.commentText = text;
          void addMenuItemComment(text);
        }
      });
    }

    const menuDetailCommentSend = document.getElementById("menuDetailCommentSend");
    if (menuDetailCommentSend) {
      menuDetailCommentSend.addEventListener("click", () => {
        const inputEl = document.getElementById("menuDetailCommentInput");
        const text = inputEl ? inputEl.value : state.menuDetail.commentText;
        if (!String(text || "").trim() || state.menuDetail.sending) return;
        state.menuDetail.commentText = text;
        void addMenuItemComment(text);
      });
    }

    const menuDetailComments = document.getElementById("menuDetailComments");
    if (menuDetailComments) applyCommentAvatarCache(menuDetailComments);

    document.querySelectorAll("[data-menu-gallery-nav]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const dir = btn.dataset.menuGalleryNav || "next";
        const delta = dir === "prev" ? -1 : 1;
        setMenuDetailIndex(state.menuDetail.index + delta);
      });
    });

    document.querySelectorAll("[data-menu-gallery-dot]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const idx = Number(btn.dataset.menuGalleryDot || "0");
        setMenuDetailIndex(idx);
      });
    });

    const gallery = document.querySelector("[data-menu-gallery]");
    if (gallery) {
      let startX = 0;
      let startY = 0;
      let tracking = false;
      gallery.addEventListener("pointerdown", (evt) => {
        tracking = true;
        startX = evt.clientX;
        startY = evt.clientY;
        try { gallery.setPointerCapture(evt.pointerId); } catch {}
      });
      gallery.addEventListener("pointerup", (evt) => {
        if (!tracking) return;
        tracking = false;
        try { gallery.releasePointerCapture(evt.pointerId); } catch {}
        const dx = evt.clientX - startX;
        const dy = evt.clientY - startY;
        if (Math.abs(dx) < 30 || Math.abs(dx) < Math.abs(dy)) return;
        if (dx < 0) setMenuDetailIndex(state.menuDetail.index + 1);
        else setMenuDetailIndex(state.menuDetail.index - 1);
      });
      gallery.addEventListener("pointercancel", () => { tracking = false; });
    }
  }

  if (focusChanged) {
    const focusOverlay = document.getElementById("focusModalOverlay");
    const focusClose = document.getElementById("focusModalClose");
    const focusSave = document.getElementById("focusModalSave");
    const focusImageTrigger = document.getElementById("focusImageTrigger");
    const focusImageInput = document.getElementById("focusImageInput");
    const focusCropX = document.getElementById("focusCropX");
    const focusCropY = document.getElementById("focusCropY");

    bindModalDismiss(focusOverlay, closeFocusModal, { selfOnly: true });
    bindModalDismiss(focusClose, closeFocusModal);
    if (focusSave) {
      focusSave.addEventListener("click", () => {
        if (state.focusModal.loading) return;
        void saveFocusItemFromModal();
      });
    }
    if (focusImageTrigger && focusImageInput) {
      focusImageTrigger.addEventListener("click", () => focusImageInput.click());
    }
    if (focusImageInput) {
      focusImageInput.addEventListener("change", (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onloadend = () => {
          state.focusModal.imageFile = file;
          state.focusModal.imagePreview = reader.result || "";
          renderOverlays({ updateFocus: true });
        };
        reader.readAsDataURL(file);
      });
    }
    if (focusCropX) {
      focusCropX.addEventListener("input", () => {
        state.focusModal.cropX = clampCropPercent(focusCropX.value, 50);
        syncFocusModalCropPreview();
      });
    }
    if (focusCropY) {
      focusCropY.addEventListener("input", () => {
        state.focusModal.cropY = clampCropPercent(focusCropY.value, 50);
        syncFocusModalCropPreview();
      });
    }
    syncFocusModalCropPreview();
  }

  if (leadChanged) {
    const leadOverlay = document.getElementById("leadModalOverlay");
    const leadClose = document.getElementById("leadModalClose");
    const leadSave = document.getElementById("leadModalSave");
    const leadConvert = document.getElementById("leadConvertBtn");
    const leadLogoTrigger = document.getElementById("leadLogoTrigger");
    const leadLogoInput = document.getElementById("leadLogoInput");
    const leadLogoUrl = document.getElementById("leadLogoUrl");

    bindModalDismiss(leadOverlay, closeLeadModal, { selfOnly: true });
    bindModalDismiss(leadClose, closeLeadModal);
    if (leadSave) {
      leadSave.addEventListener("click", () => {
        if (state.leadModal.loading) return;
        void saveLeadFromModal();
      });
    }
    if (leadConvert) {
      leadConvert.addEventListener("click", async () => {
        if (state.leadModal.loading) return;
        const id = state.leadModal.lead?.id || "";
        if (!id) return;
        const converted = await convertLeadToCustomer(id);
        if (converted) closeLeadModal();
      });
    }
    if (leadLogoTrigger && leadLogoInput) {
      leadLogoTrigger.addEventListener("click", () => leadLogoInput.click());
    }
    if (leadLogoInput) {
      leadLogoInput.addEventListener("change", (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        state.leadModal.logoFile = file;
        const reader = new FileReader();
        reader.onloadend = () => {
          const preview = String(reader.result || "");
          state.leadModal.logoPreview = preview;
          const img = document.getElementById("leadLogoPreview");
          if (img && preview) img.setAttribute("src", preview);
        };
        reader.readAsDataURL(file);
      });
    }
    if (leadLogoUrl) {
      leadLogoUrl.addEventListener("input", () => {
        const val = leadLogoUrl.value.trim();
        const img = document.getElementById("leadLogoPreview");
        if (img) img.setAttribute("src", val || PLACEHOLDER_IMAGE);
      });
    }
    document.querySelectorAll("[data-lead-location-add]").forEach((btn) => {
      btn.addEventListener("click", () => {
        if (state.leadModal.loading) return;
        addLeadModalLocationRow();
      });
    });
    document.querySelectorAll("[data-lead-location-remove]").forEach((btn) => {
      btn.addEventListener("click", () => {
        if (state.leadModal.loading) return;
        removeLeadModalLocationRow(Number(btn.getAttribute("data-lead-location-remove")));
      });
    });
    document.querySelectorAll("[data-lead-location-pick]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const index = Number(btn.getAttribute("data-lead-location-pick"));
        if (!Number.isInteger(index) || index < 0) return;
        syncLeadModalDraftFromForm();
        void openLocationPicker({
          addressInputId: `leadLocationAddress_${index}`,
          coordsDisplayId: `leadLocationCoords_${index}`,
          context: `lead_location:${index}`
        });
      });
    });
    document.querySelectorAll("[data-lead-location-address]").forEach((input) => {
      input.addEventListener("input", () => {
        const index = Number(input.getAttribute("data-lead-location-address"));
        if (!Number.isInteger(index) || index < 0) return;
        const list = normalizeLeadLocations(state.leadModal.locations, state.leadModal.lead?.address || "", state.leadModal.coords || null);
        while (list.length <= index) list.push(createLeadLocation());
        const currentRow = list[index] || createLeadLocation();
        const parsedCoords = parseCoordsFromAddressInput(input.value, getLeadPlusCodeReference(input.value));
        list[index] = createLeadLocation({
          address: input.value,
          lat: parsedCoords ? parsedCoords.lat : (hasLeadLocationCoords(currentRow) ? currentRow.lat : null),
          lng: parsedCoords ? parsedCoords.lng : (hasLeadLocationCoords(currentRow) ? currentRow.lng : null)
        });
        state.leadModal.locations = list;
        state.leadModal.lead = { ...(state.leadModal.lead || {}), address: list[0]?.address || "" };
        const badge = document.getElementById(`leadLocationCoords_${index}`);
        if (badge) badge.classList.toggle("hidden", !hasLeadLocationCoords(list[index]));
        const primary = getPrimaryLeadLocation(list);
        state.leadModal.coords = hasLeadLocationCoords(primary) ? { lat: primary.lat, lng: primary.lng } : null;
      });
      input.addEventListener("blur", () => {
        const index = Number(input.getAttribute("data-lead-location-address"));
        if (!Number.isInteger(index) || index < 0) return;
        void refineLeadLocationAddressIndex(index, input.value, { hydratePrimary: index === 0 }).then(() => {
          renderOverlays({ updateLead: true });
        });
      });
    });
  }

  if (customerChanged) {
    const customerOverlay = document.getElementById("customerModalOverlay");
    const customerClose = document.getElementById("customerModalClose");
    const customerSave = document.getElementById("customerModalSave");
    const customerLogoTrigger = document.getElementById("customerLogoTrigger");
    const customerLogoInput = document.getElementById("customerLogoInput");
    const customerLogoUrl = document.getElementById("customerLogoUrl");

    bindModalDismiss(customerOverlay, closeCustomerModal, { selfOnly: true });
    bindModalDismiss(customerClose, closeCustomerModal);
    if (customerSave) {
      customerSave.addEventListener("click", () => {
        if (state.customerModal.loading) return;
        void saveCustomerFromModal();
      });
    }
    if (customerLogoTrigger && customerLogoInput) {
      customerLogoTrigger.addEventListener("click", () => customerLogoInput.click());
    }
    if (customerLogoInput) {
      customerLogoInput.addEventListener("change", (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        state.customerModal.logoFile = file;
        const reader = new FileReader();
        reader.onloadend = () => {
          const preview = String(reader.result || "");
          state.customerModal.logoPreview = preview;
          const img = document.getElementById("customerLogoPreview");
          if (img && preview) img.setAttribute("src", preview);
        };
        reader.readAsDataURL(file);
      });
    }
    if (customerLogoUrl) {
      customerLogoUrl.addEventListener("input", () => {
        const val = customerLogoUrl.value.trim();
        const img = document.getElementById("customerLogoPreview");
        if (img) img.setAttribute("src", val || PLACEHOLDER_IMAGE);
      });
    }
  }

  if (menuChanged || menuDetailChanged || focusChanged || leadChanged || customerChanged) {
    bindImageFallbacks();
  }
}

function stopCrmAutoLoadObserver() {
  if (crmAutoLoadObserver) {
    try { crmAutoLoadObserver.disconnect(); } catch {}
    crmAutoLoadObserver = null;
  }
}

function bindCrmAutoLoadObserver() {
  stopCrmAutoLoadObserver();
  if (typeof IntersectionObserver !== "function") return;
  const sentinels = [
    document.getElementById("leadsLoadMoreSentinel"),
    document.getElementById("customersLoadMoreSentinel"),
    document.getElementById("staffLoadMoreSentinel")
  ].filter(Boolean);
  if (!sentinels.length) return;
  crmAutoLoadObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry?.isIntersecting) return;
      const node = entry.target;
      if (!(node instanceof HTMLElement)) return;
      if (node.id === "leadsLoadMoreSentinel") {
        if (!state.leads.loadingMore && !state.leads.loading && state.leads.hasMore?.[normalizeLeadScopeKey(state.leads.scope)]) {
          void loadLeads({ scope: state.leads.scope, grow: true });
        }
        return;
      }
      if (node.id === "customersLoadMoreSentinel") {
        if (!state.customers.loadingMore && !state.customers.loading && state.customers.hasMore?.[normalizeCustomerScopeKey(state.customers.scope)]) {
          void loadCustomers({ scope: state.customers.scope, grow: true });
        }
        return;
      }
      if (node.id === "staffLoadMoreSentinel") {
        if (!state.staff.loadingMore && !state.staff.loading && state.staff.hasMore) {
          void loadCeoStaff({ grow: true });
        }
      }
    });
  }, {
    root: null,
    rootMargin: "0px 0px 240px 0px",
    threshold: 0.05
  });
  sentinels.forEach((node) => crmAutoLoadObserver.observe(node));
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
          safeStorage.removeItem(chatIndexStorageKey(state.user.uid));
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
        likesModal: { open: false, postId: "", animate: false },
        leadModal: { open: false, mode: "create", lead: null, status: "", loading: false, logoFile: null, logoPreview: "", coords: null, locations: [] },
        customerModal: { open: false, mode: "edit", customer: null, status: "", loading: false, logoFile: null, logoPreview: "" }
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

  document.querySelectorAll("[data-profile-top-tab]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const tab = btn.dataset.profileTopTab;
      if (!tab) return;
      state.profileTopTab = tab;
      if (tab === "menu") {
        ensureMenuDataForProfile();
        ensureFocusDataForProfile();
      }
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

  const menuSearchInput = document.getElementById("menuSearchInput");
  if (menuSearchInput) {
    menuSearchInput.addEventListener("input", () => {
      state.menu.query = menuSearchInput.value;
      render();
    });
  }

  document.querySelectorAll("[data-menu-filter]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const filter = btn.dataset.menuFilter || "all";
      state.menu.filter = filter;
      render();
    });
  });

  document.querySelectorAll("[data-menu-layout-color]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const color = btn.dataset.menuLayoutColor || "";
      if (!color) return;
      state.menuLayout = { ...state.menuLayout, cardColor: color };
      saveMenuLayoutToStorage();
      render();
    });
  });

  document.querySelectorAll("[data-menu-add]").forEach((btn) => {
    btn.addEventListener("click", () => {
      openMenuModal("create");
    });
  });

  document.querySelectorAll("[data-menu-edit]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const itemId = btn.dataset.menuEdit || "";
      const item = (state.menu.items || []).find((it) => String(it.id) === String(itemId));
      if (!item) return;
      openMenuModal("edit", item);
    });
  });

  document.querySelectorAll("[data-menu-delete]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const itemId = btn.dataset.menuDelete || "";
      if (!itemId) return;
      void deleteMenuItemById(itemId);
    });
  });

  document.querySelectorAll("[data-menu-open]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const itemId = btn.dataset.menuOpen || "";
      const item = (state.menu.items || []).find((it) => String(it.id) === String(itemId));
      if (!item) return;
      void openMenuDetail(item, state.menu.restaurantId || state.profileView?.profile?.restaurantId || state.userProfile.restaurantId || "");
    });
  });

  document.querySelectorAll("[data-cart-qty]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const itemId = btn.dataset.cartQty || "";
      const delta = Number(btn.dataset.cartDelta || "0");
      if (!itemId || !delta) return;
      updateShopCartQuantity(itemId, delta);
    });
  });

  document.querySelectorAll("[data-cart-checkout]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const action = btn.dataset.cartCheckout || "";
      if (action === "open") {
        openShopCheckout();
        return;
      }
      if (action === "submit") {
        void submitShopCheckout();
      }
    });
  });

  document.querySelectorAll("[data-cart-field]").forEach((input) => {
    input.addEventListener("input", () => {
      updateShopCheckoutField(input.dataset.cartField || "", input.value || "");
    });
  });

  const focusEnabledToggle = document.getElementById("focusEnabledToggle");
  if (focusEnabledToggle) {
    focusEnabledToggle.addEventListener("change", () => {
      const restaurantId = state.userProfile.restaurantId || "";
      if (!restaurantId) return;
      const enabled = !!focusEnabledToggle.checked;
      state.focus.enabled = enabled;
      const cachedItems = state.focus.restaurantId === restaurantId ? (state.focus.items || []) : [];
      focusCache.set(focusCacheKey(restaurantId), { items: cachedItems, enabled, ts: Date.now() });
      void saveFocusEnabled(restaurantId, enabled);
      render();
    });
  }

  document.querySelectorAll("[data-focus-add]").forEach((btn) => {
    btn.addEventListener("click", () => {
      openFocusModal("create");
    });
  });

  document.querySelectorAll("[data-focus-edit]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const itemId = btn.dataset.focusEdit || "";
      const item = (state.focus.items || []).find((it) => String(it.id) === String(itemId));
      if (!item) return;
      openFocusModal("edit", item);
    });
  });

  document.querySelectorAll("[data-focus-delete]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const itemId = btn.dataset.focusDelete || "";
      if (!itemId) return;
      void deleteFocusItemById(itemId);
    });
  });

  document.querySelectorAll("[data-focus-nav]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const dir = btn.dataset.focusNav || "next";
      const delta = dir === "prev" ? -1 : 1;
      setFocusIndex(state.focus.index + delta);
    });
  });

  document.querySelectorAll("[data-focus-dot]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const idx = Number(btn.dataset.focusDot || "0");
      setFocusIndex(idx);
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
    btn.addEventListener("click", () => {
      setState({ settingsView: "main" });
    });
  });

  const saveAccountBtn = document.getElementById("saveAccountBtn");
  if (saveAccountBtn) {
    saveAccountBtn.addEventListener("click", async () => {
      if (saveAccountBtn.disabled) return;
      saveAccountBtn.innerHTML = `${icon("loader-2", "w-4 h-4 animate-spin")} Speichere...`;
      await saveAccountSettings();
      setState({ settingsView: "main" });
    });
  }

  const openLocationPickerBtn = document.getElementById("openLocationPickerBtn");
  if (openLocationPickerBtn) {
    openLocationPickerBtn.addEventListener("click", () => openLocationPicker({
      addressInputId: "settingsAddress",
      coordsDisplayId: "coordsDisplay",
      context: "settings"
    }));
  }

  const settingsAddress = document.getElementById("settingsAddress");
  if (settingsAddress) {
    settingsAddress.addEventListener("input", () => {
      verifiedMapLocation = null;
      const badge = document.getElementById("coordsDisplay");
      if (badge) badge.classList.add("hidden");
    });
  }

  document.querySelectorAll("[data-toggle]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const key = btn.dataset.toggle;
      if (!key) return;
      const next = { ...state.settings, [key]: !state.settings[key] };
      state.settings = next;
      if (key === "privateAccount") {
        state.userProfile.privateAccount = !!next[key];
        saveUserProfileToStorage();
        void persistPrivateAccountSetting(next[key]);
      }
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

  document.querySelectorAll("[data-open-chat]").forEach((btn) => {
    btn.addEventListener("click", () => {
      openChatWithProfile({
        uid: btn.dataset.chatUid || "",
        handle: btn.dataset.chatHandle || "",
        name: btn.dataset.chatName || "User",
        avatar: btn.dataset.chatAvatar || ""
      });
    });
  });

  document.querySelectorAll("[data-chat-open-thread]").forEach((btn) => {
    btn.addEventListener("click", () => {
      openChatWithProfile({
        uid: btn.dataset.chatUid || "",
        handle: btn.dataset.chatHandle || "",
        name: btn.dataset.chatName || "User",
        avatar: btn.dataset.chatAvatar || ""
      });
    });
  });

  document.querySelectorAll("[data-chat-back]").forEach((btn) => {
    btn.addEventListener("click", () => {
      closeChatModal();
    });
  });

  document.querySelectorAll("[data-chat-gift]").forEach((btn) => {
    btn.addEventListener("click", () => {});
  });

  document.querySelectorAll("[data-chat-save]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.chatSave || "";
      if (!id) return;
      toggleChatMessageSaved(id);
    });
  });

  document.querySelectorAll("[data-chat-like]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.chatLike || "";
      if (!id) return;
      toggleChatMessageLiked(id);
    });
  });

  document.querySelectorAll("[data-chat-remove-attachment]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.chatRemoveAttachment || "";
      if (!id) return;
      removePendingChatAttachment(id);
    });
  });

  const chatAttachmentTrigger = document.getElementById("chatAttachmentTrigger");
  const chatAttachmentInput = document.getElementById("chatAttachmentInput");
  if (chatAttachmentTrigger && chatAttachmentInput) {
    chatAttachmentTrigger.addEventListener("click", () => chatAttachmentInput.click());
    chatAttachmentInput.addEventListener("change", async (e) => {
      await addChatAttachments(e.target.files || []);
      chatAttachmentInput.value = "";
    });
  }

  const chatSendBtn = document.getElementById("chatSendBtn");
  if (chatSendBtn) {
    chatSendBtn.addEventListener("click", () => {
      sendChatMessage();
    });
  }

  const chatMessageInput = document.getElementById("chatMessageInput");
  if (chatMessageInput) {
    chatMessageInput.addEventListener("input", () => {
      state.chatModal.draft = chatMessageInput.value;
      chatMessageInput.style.height = "auto";
      chatMessageInput.style.height = `${Math.min(chatMessageInput.scrollHeight, 112)}px`;
    });
    chatMessageInput.addEventListener("keydown", (evt) => {
      if (evt.key === "Enter" && !evt.shiftKey) {
        evt.preventDefault();
        sendChatMessage();
      }
    });
    queueMicrotask(() => {
      chatMessageInput.style.height = "auto";
      chatMessageInput.style.height = `${Math.min(chatMessageInput.scrollHeight, 112)}px`;
    });
  }

  const chatMessages = document.getElementById("chatMessages");
  if (chatMessages) {
    queueMicrotask(() => {
      chatMessages.scrollTop = chatMessages.scrollHeight;
    });
  }

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

  const newLeadBtn = document.getElementById("newLeadBtn");
  if (newLeadBtn) {
    newLeadBtn.addEventListener("click", () => openLeadCreator());
  }

  const leadSettingsBtn = document.getElementById("leadSettingsBtn");
  if (leadSettingsBtn) {
    leadSettingsBtn.addEventListener("click", () => openLeadSettingsView());
  }

  document.querySelectorAll("[data-leads-back]").forEach((btn) => {
    btn.addEventListener("click", () => {
      closeLeadSubview();
    });
  });

  const leadSettingsSaveBtn = document.getElementById("leadSettingsSaveBtn");
  if (leadSettingsSaveBtn) {
    leadSettingsSaveBtn.addEventListener("click", () => {
      if (state.leads.settingsSaving) return;
      void saveLeadSettings();
    });
  }

  if (isLeadInlineCreateView()) {
    const leadInlineSaveBtn = document.getElementById("leadInlineSaveBtn");
    if (leadInlineSaveBtn) {
      leadInlineSaveBtn.addEventListener("click", () => {
        if (state.leadModal.loading) return;
        void saveLeadFromModal();
      });
    }
    const leadLogoTrigger = document.getElementById("leadLogoTrigger");
    const leadLogoInput = document.getElementById("leadLogoInput");
    if (leadLogoTrigger && leadLogoInput) {
      leadLogoTrigger.addEventListener("click", () => leadLogoInput.click());
    }
    if (leadLogoInput) {
      leadLogoInput.addEventListener("change", (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        state.leadModal.logoFile = file;
        const reader = new FileReader();
        reader.onloadend = () => {
          const preview = String(reader.result || "");
          state.leadModal.logoPreview = preview;
          const img = document.getElementById("leadLogoPreview");
          if (img && preview) img.setAttribute("src", preview);
        };
        reader.readAsDataURL(file);
      });
    }

    const syncIds = ["leadBusinessName", "leadCustomerType", "leadBillingCycle"];
    syncIds.forEach((id) => {
      const node = document.getElementById(id);
      if (!node) return;
      node.addEventListener("input", () => syncLeadDerivedFields());
      node.addEventListener("change", () => syncLeadDerivedFields());
    });

    document.querySelectorAll("[data-lead-location-add]").forEach((btn) => {
      btn.addEventListener("click", () => {
        if (state.leadModal.loading) return;
        addLeadModalLocationRow();
      });
    });
    document.querySelectorAll("[data-lead-location-remove]").forEach((btn) => {
      btn.addEventListener("click", () => {
        if (state.leadModal.loading) return;
        removeLeadModalLocationRow(Number(btn.getAttribute("data-lead-location-remove")));
      });
    });
    document.querySelectorAll("[data-lead-location-pick]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const index = Number(btn.getAttribute("data-lead-location-pick"));
        if (!Number.isInteger(index) || index < 0) return;
        syncLeadModalDraftFromForm();
        void openLocationPicker({
          addressInputId: `leadLocationAddress_${index}`,
          coordsDisplayId: index === 0 ? "leadCoordsDisplay" : `leadLocationCoords_${index}`,
          context: `lead_location:${index}`
        });
      });
    });
    document.querySelectorAll("[data-lead-location-address]").forEach((input) => {
      input.addEventListener("input", () => {
        const index = Number(input.getAttribute("data-lead-location-address"));
        if (!Number.isInteger(index) || index < 0) return;
        const list = normalizeLeadLocations(state.leadModal.locations, state.leadModal.lead?.address || "", state.leadModal.coords || null);
        while (list.length <= index) list.push(createLeadLocation());
        const currentRow = list[index] || createLeadLocation();
        const parsedCoords = parseCoordsFromAddressInput(input.value, getLeadPlusCodeReference(input.value));
        list[index] = createLeadLocation({
          address: input.value,
          lat: parsedCoords ? parsedCoords.lat : (hasLeadLocationCoords(currentRow) ? currentRow.lat : null),
          lng: parsedCoords ? parsedCoords.lng : (hasLeadLocationCoords(currentRow) ? currentRow.lng : null)
        });
        state.leadModal.locations = list;
        const badge = document.getElementById(index === 0 ? "leadCoordsDisplay" : `leadLocationCoords_${index}`);
        if (badge) badge.classList.toggle("hidden", !hasLeadLocationCoords(list[index]));
        const primary = getPrimaryLeadLocation(list);
        state.leadModal.coords = hasLeadLocationCoords(primary) ? { lat: primary.lat, lng: primary.lng } : null;
      });
      input.addEventListener("change", () => {
        const index = Number(input.getAttribute("data-lead-location-address"));
        if (index !== 0) return;
        const parsedCoords = parseCoordsFromAddressInput(input.value, getLeadPlusCodeReference(input.value));
        if (!parsedCoords) return;
        void hydrateLeadGeoFieldsFromCoords(parsedCoords, { sourceInputId: input.id });
      });
      input.addEventListener("blur", () => {
        const index = Number(input.getAttribute("data-lead-location-address"));
        if (!Number.isInteger(index) || index < 0) return;
        void refineLeadLocationAddressIndex(index, input.value, { hydratePrimary: index === 0 }).then(() => {
          if (isLeadInlineCreateView()) render();
        });
      });
    });
    syncLeadDerivedFields();
  }

  const leadsSearchInput = document.getElementById("leadsSearchInput");
  if (leadsSearchInput) {
    leadsSearchInput.addEventListener("input", () => {
      state.leads.query = leadsSearchInput.value || "";
      state.leads.keepFocus = true;
      render();
    });
  }

  const leadsStatusFilter = document.getElementById("leadsStatusFilter");
  if (leadsStatusFilter) {
    leadsStatusFilter.addEventListener("change", () => {
      state.leads.status = leadsStatusFilter.value || "";
      render();
    });
  }

  document.querySelectorAll("[data-lead-scope]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const nextScope = normalizeLeadScopeKey(btn.dataset.leadScope || "");
      if (state.leads.scope === nextScope) return;
      state.leads.scope = nextScope;
      if (state.leads.loaded?.[nextScope]) {
        state.leads.items = Array.isArray(state.leads.pages?.[nextScope]) ? state.leads.pages[nextScope].slice() : [];
        render();
        return;
      }
      void loadLeads({ scope: nextScope });
    });
  });

  document.querySelectorAll("[data-lead-edit]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.leadEdit;
      if (!id) return;
      const lead = state.leads.items.find((item) => String(item.id) === String(id));
      if (lead) openLeadModal("edit", lead);
    });
  });

  const customersSearchInput = document.getElementById("customersSearchInput");
  if (customersSearchInput) {
    customersSearchInput.addEventListener("input", () => {
      state.customers.query = customersSearchInput.value || "";
      state.customers.keepFocus = true;
      render();
    });
  }

  document.querySelectorAll("[data-customer-scope]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const nextScope = normalizeCustomerScopeKey(btn.dataset.customerScope || "");
      if (state.customers.scope === nextScope) return;
      state.customers.scope = nextScope;
      if (state.customers.loaded?.[nextScope]) {
        state.customers.items = Array.isArray(state.customers.pages?.[nextScope]) ? state.customers.pages[nextScope].slice() : [];
        render();
        return;
      }
      void loadCustomers({ scope: nextScope });
    });
  });

  document.querySelectorAll("[data-customer-edit]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.customerEdit;
      if (!id) return;
      const customer = (state.customers.items || []).find((item) => String(item.id) === String(id));
      if (customer) openCustomerModal(customer);
    });
  });

  document.querySelectorAll("[data-staff-back]").forEach((btn) => {
    btn.addEventListener("click", () => {
      closeStaffEditor();
      render();
    });
  });

  const staffNewBtn = document.getElementById("staffNewBtn");
  if (staffNewBtn) {
    staffNewBtn.addEventListener("click", () => {
      openStaffEditor("create");
    });
  }

  document.querySelectorAll("[data-staff-edit]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.staffEdit || "";
      if (!id) return;
      const entry = (state.staff.items || []).find((item) => String(item.uid || "") === String(id));
      if (entry) openStaffEditor("edit", entry);
    });
  });

  [
    ["staffFirstName", "firstName"],
    ["staffLastName", "lastName"],
    ["staffPassword", "password"],
    ["staffLocationLabel", "locationLabel"]
  ].forEach(([id, key]) => {
    const node = document.getElementById(id);
    if (!node) return;
    node.addEventListener("input", () => {
      state.staff.form = {
        ...state.staff.form,
        [key]: String(node.value || "")
      };
      state.staff.status = "";
      if (state.staff.error) state.staff.error = "";
      if (key === "firstName" || key === "lastName") {
        syncStaffDerivedEmailField();
      }
    });
  });

  const staffCountry = document.getElementById("staffCountry");
  if (staffCountry) {
    staffCountry.addEventListener("change", () => {
      state.staff.form = {
        ...state.staff.form,
        country: normalizeCeoCountry(staffCountry.value)
      };
      state.staff.status = "";
      if (state.staff.error) state.staff.error = "";
    });
  }

  const staffAvatarTrigger = document.getElementById("staffAvatarTrigger");
  const staffAvatarInput = document.getElementById("staffAvatarInput");
  if (staffAvatarTrigger && staffAvatarInput) {
    staffAvatarTrigger.addEventListener("click", () => staffAvatarInput.click());
  }
  if (staffAvatarInput) {
    staffAvatarInput.addEventListener("change", (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      state.staff.form = {
        ...state.staff.form,
        avatarFile: file
      };
      state.staff.status = "";
      if (state.staff.error) state.staff.error = "";
      const reader = new FileReader();
      reader.onloadend = () => {
        const preview = String(reader.result || "");
        state.staff.form = {
          ...state.staff.form,
          avatarPreview: preview
        };
        const img = document.getElementById("staffAvatarPreview");
        if (img && preview) img.setAttribute("src", preview);
      };
      reader.readAsDataURL(file);
    });
  }

  const staffLocationPickBtn = document.getElementById("staffLocationPickBtn");
  if (staffLocationPickBtn) {
    staffLocationPickBtn.addEventListener("click", () => {
      syncStaffFormFromDom();
      state.staff.status = "";
      openLocationPicker({
        addressInputId: "staffLocationLabel",
        coordsDisplayId: "staffCoordsDisplay",
        context: "staff"
      });
    });
  }

  const staffSaveBtn = document.getElementById("staffSaveBtn");
  if (staffSaveBtn) {
    staffSaveBtn.addEventListener("click", () => {
      void saveCeoStaffFromView();
    });
  }

  const staffDeleteBtn = document.getElementById("staffDeleteBtn");
  if (staffDeleteBtn) {
    staffDeleteBtn.addEventListener("click", () => {
      void deleteCeoStaffFromView();
    });
  }

  // Business selection removed from account settings by design.

  bindImageFallbacks();
  bindCrmAutoLoadObserver();
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
    const isBusiness = isLocalBusinessProfile(state.userProfile);
    const ownerId = isBusiness ? state.userProfile.restaurantId : state.user.uid;
    const { cdnUrl } = await uploadCompressedImage(file, ownerId, { maxSize: 512, quality: 0.80, mimeType: 'image/jpeg'});
    if (isBusiness && state.userProfile.restaurantId) {
      await setDoc(doc(db, "restaurants", state.userProfile.restaurantId), {
        logoUrl: cdnUrl,
        logo: cdnUrl,
        updatedAt: serverTimestamp()
      }, { merge: true });
      const rest = state.restaurants.find((r) => String(r.id) === String(state.userProfile.restaurantId)) || {};
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
      await setDoc(doc(db, "users", state.user.uid), {
        avatarUrl: cdnUrl,
        avatar: cdnUrl,
        updatedAt: serverTimestamp()
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

function ensureLocationPickerModal() {
  if (document.getElementById("locationPickerModal")) return;
  const modal = document.createElement("div");
  modal.id = "locationPickerModal";
  modal.className = "fixed inset-0 z-[3000] hidden flex flex-col p-4 pt-10";
  modal.innerHTML = `
    <div class="absolute inset-0 bg-slate-900/80 backdrop-blur-md transition-opacity duration-300 opacity-0" id="pickerOverlay"></div>
    <div class="bg-white rounded-[2.5rem] flex-1 flex flex-col overflow-hidden relative shadow-2xl transition-transform duration-300 translate-y-full" id="pickerPanel">
      <div class="p-5 flex justify-between items-center bg-white z-20 shadow-sm">
        <div>
          <h3 class="font-black text-lg leading-none">Standort anpassen</h3>
          <p class="text-[10px] font-bold text-slate-400 mt-1">Verschiebe die Karte unter den Pin</p>
        </div>
        <button id="closeLocationPickerBtn" type="button" class="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-600">${icon("x", "w-5 h-5")}</button>
      </div>
      <div class="flex-1 relative bg-slate-200">
        <div id="pickerMap" class="absolute inset-0 z-10"></div>
        <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-full z-30 pointer-events-none drop-shadow-2xl">
          <div class="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center border-4 border-white shadow-xl animate-bounce">
            ${icon("map-pin", "w-5 h-5 text-white fill-indigo-600")}
          </div>
          <div class="w-1 h-4 bg-slate-800 mx-auto -mt-1 rounded-full shadow-lg"></div>
        </div>
      </div>
      <div class="p-5 bg-white z-20 shadow-[0_-10px_30px_rgba(0,0,0,0.1)]">
        <button id="confirmLocationBtn" type="button" class="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl flex items-center justify-center gap-2 active:scale-95 transition-transform">
          ${icon("check", "w-4 h-4")} Hier bestaetigen
        </button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
}

function bindLocationPickerEvents() {
  const modal = document.getElementById("locationPickerModal");
  if (!modal || modal.dataset.bound === "true") return;
  const overlay = document.getElementById("pickerOverlay");
  const closeBtn = document.getElementById("closeLocationPickerBtn");
  const confirmBtn = document.getElementById("confirmLocationBtn");
  if (overlay) overlay.addEventListener("click", closeLocationPicker);
  if (closeBtn) closeBtn.addEventListener("click", closeLocationPicker);
  if (confirmBtn) confirmBtn.addEventListener("click", confirmLocation);
  modal.dataset.bound = "true";
}

async function openLocationPicker({ addressInputId = "settingsAddress", coordsDisplayId = "coordsDisplay", context = "settings" } = {}) {
  ensureLocationPickerModal();
  bindLocationPickerEvents();
  locationPickerTarget = { addressInputId, coordsDisplayId, context };
  const address = document.getElementById(addressInputId)?.value?.trim() || "";
  const pickerContext = String(context || "");
  const isLeadPickerContext = pickerContext === "lead" || pickerContext.startsWith("lead_location:");
  const isStaffPickerContext = pickerContext === "staff";
  if (isLeadPickerContext && isCeoUser()) {
    const tasks = [];
    if (!state.leads.loading && (!Array.isArray(state.leads.items) || !state.leads.items.length)) {
      tasks.push(loadLeads().catch(() => {}));
    }
    if (!state.customers.loading && (!Array.isArray(state.customers.items) || !state.customers.items.length)) {
      tasks.push(loadCustomers().catch(() => {}));
    }
    if (tasks.length) await Promise.all(tasks);
    if (Array.isArray(state.restaurants) && state.restaurants.length) {
      rebuildBusinessLocations();
      refreshCustomersFromRestaurants();
    }
  }
  let targetCoords = null;
  const resolveLeadRestaurantFallback = () => {
    const restId = String(state.leadModal?.lead?.restaurantId || "");
    if (!restId) return null;
    const biz = (Array.isArray(state.businessLocations) ? state.businessLocations : [])
      .find((item) => String(item?.id || "") === restId);
    if (!biz) return null;
    return normalizeCoordPair(biz.lat, biz.lng);
  };
  if (isLeadPickerContext) {
    const restFallback = resolveLeadRestaurantFallback();
    if (pickerContext === "lead") {
      const list = normalizeLeadLocations(state.leadModal.locations, state.leadModal.lead?.address || "", state.leadModal.coords || null);
      const primary = getPrimaryLeadLocation(list);
      const direct = resolveCoordsFromEntity(primary) || resolveCoordsFromEntity(state.leadModal.coords || {}) || null;
      targetCoords = preferStableCoords(direct, restFallback);
    } else if (pickerContext.startsWith("lead_location:")) {
      const index = Number(pickerContext.split(":")[1]);
      const list = normalizeLeadLocations(state.leadModal.locations, state.leadModal.lead?.address || "", state.leadModal.coords || null);
      const row = Number.isInteger(index) && index >= 0 ? list[index] : null;
      const addressValue = String(row?.address || document.getElementById(addressInputId)?.value || "").trim();
      targetCoords = await parseCoordsFromAddressInputAsync(addressValue, getLeadPlusCodeReference(addressValue));
      if (!targetCoords) {
        targetCoords = resolveCoordsFromEntity(row) || null;
      }
      if (!targetCoords) {
        const primary = getPrimaryLeadLocation(list);
        targetCoords = resolveCoordsFromEntity(primary) || resolveCoordsFromEntity(state.leadModal.coords || {}) || null;
      }
      targetCoords = preferStableCoords(targetCoords, restFallback);
    }
  } else if (isStaffPickerContext) {
    const staffCoords = state.staff.form?.coords;
    if (staffCoords && Number.isFinite(Number(staffCoords.lat)) && Number.isFinite(Number(staffCoords.lng))) {
      targetCoords = { lat: Number(staffCoords.lat), lng: Number(staffCoords.lng) };
    }
  } else if (pickerContext === "settings") {
    if (verifiedMapLocation && Number.isFinite(Number(verifiedMapLocation.lat)) && Number.isFinite(Number(verifiedMapLocation.lng))) {
      targetCoords = { lat: Number(verifiedMapLocation.lat), lng: Number(verifiedMapLocation.lng) };
    } else {
      const override = getCeoGpsOverride();
      if (override) {
        targetCoords = override;
      } else if (Number.isFinite(Number(state.userProfile?.lat)) && Number.isFinite(Number(state.userProfile?.lng))) {
        targetCoords = { lat: Number(state.userProfile.lat), lng: Number(state.userProfile.lng) };
      }
    }
  }
  const modal = document.getElementById("locationPickerModal");
  const overlay = document.getElementById("pickerOverlay");
  const panel = document.getElementById("pickerPanel");

  if (modal) modal.classList.remove("hidden");
  setTimeout(() => {
    overlay?.classList.remove("opacity-0");
    panel?.classList.remove("translate-y-full");
  }, 10);

  if (locationPickerMap && !document.getElementById("pickerMap")?.hasChildNodes()) {
    locationPickerMap.remove();
    locationPickerMap = null;
  }

  if (!locationPickerMap && window.L) {
    locationPickerMap = window.L.map("pickerMap", { zoomControl: false, attributionControl: false }).setView([PRISHTINA_COORDS.lat, PRISHTINA_COORDS.lng], 16);
    window.L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", { maxZoom: 19 }).addTo(locationPickerMap);
  }
  renderLocationPickerContextMarkers();

  if (locationPickerMap) {
    setTimeout(() => locationPickerMap.invalidateSize(), 300);
    if (targetCoords && Number.isFinite(Number(targetCoords.lat)) && Number.isFinite(Number(targetCoords.lng))) {
      locationPickerMap.setView([targetCoords.lat, targetCoords.lng], 17, { animate: false });
    } else if (isLeadPickerContext) {
      const center = getLeadCountryCenter(getLeadFormCountryValue());
      locationPickerMap.setView([center.lat, center.lng], 16, { animate: false });
    } else if (address) {
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`);
        const data = await res.json();
        if (data.length > 0) locationPickerMap.setView([data[0].lat, data[0].lon], 17, { animate: false });
      } catch {}
    }
  }
}

function closeLocationPicker() {
  const modal = document.getElementById('locationPickerModal');
  document.getElementById('pickerOverlay')?.classList.add('opacity-0');
  document.getElementById('pickerPanel')?.classList.add('translate-y-full');
  setTimeout(() => {
    modal?.classList.add('hidden');
  }, 300);
}

async function confirmLocation() {
  if (!locationPickerMap) return;
  const center = locationPickerMap.getCenter();
  const coords = { lat: center.lat, lng: center.lng };
  const context = String(locationPickerTarget.context || "");
  if (context === "lead") {
    state.leadModal.coords = coords;
  } else if (context.startsWith("lead_location:")) {
    const index = Number(context.split(":")[1]);
    if (Number.isInteger(index) && index >= 0) {
      const list = normalizeLeadLocations(state.leadModal.locations, state.leadModal.lead?.address || "", state.leadModal.coords || null);
      while (list.length <= index) list.push(createLeadLocation());
      const addressInput = document.getElementById(locationPickerTarget.addressInputId || "");
      const address = addressInput ? String(addressInput.value || "").trim() : list[index].address || "";
      list[index] = createLeadLocation({ address, lat: coords.lat, lng: coords.lng });
      state.leadModal.locations = list;
      state.leadModal.lead = { ...(state.leadModal.lead || {}), address: list[0]?.address || "" };
      const primary = getPrimaryLeadLocation(list);
      state.leadModal.coords = hasLeadLocationCoords(primary) ? { lat: primary.lat, lng: primary.lng } : null;
      if (index === 0) {
        await hydrateLeadGeoFieldsFromCoords(coords, { sourceInputId: locationPickerTarget.addressInputId || "" });
      }
    }
  } else if (context === "staff") {
    const addressInput = document.getElementById(locationPickerTarget.addressInputId || "");
    const locationLabel = addressInput ? String(addressInput.value || "").trim() : "";
    state.staff = {
      ...state.staff,
      form: {
        ...state.staff.form,
        locationLabel: locationLabel || state.staff.form.locationLabel || state.staff.form.country || CEO_COUNTRIES[0],
        coords
      }
    };
  } else {
    verifiedMapLocation = coords;
  }
  if (context === "staff") {
    closeLocationPicker();
    render();
    return;
  }
  const badge = document.getElementById(locationPickerTarget.coordsDisplayId || "coordsDisplay");
  badge?.classList.remove("hidden");
  closeLocationPicker();
  if (isLeadInlineCreateView()) {
    render();
  }
}

async function saveAccountSettings() {
  if (!state.user) return;
  const name = document.getElementById("settingsName")?.value?.trim() || state.userProfile.name || "User";
  const handle = document.getElementById("settingsHandle")?.value?.trim() || state.userProfile.handle || normalizeHandle(name);
  const bio = document.getElementById("settingsBio")?.value?.trim() || "";
  const city = document.getElementById("settingsCity")?.value?.trim() || "Prishtina";
  const address = document.getElementById("settingsAddress")?.value?.trim() || "";
  const restaurantId = state.userProfile.restaurantId || ""; // Fix: Verlinkung wurde entfernt, bleibt also der bestehende State
  const allowCeoOverride = isCeoUser();
  const gpsCoords = verifiedMapLocation
    ? { lat: Number(verifiedMapLocation.lat), lng: Number(verifiedMapLocation.lng) }
    : null;
  const fallbackCeoCoords = allowCeoOverride ? getCeoGpsOverride() : null;
  const effectiveGps = gpsCoords
    || (fallbackCeoCoords && Number.isFinite(Number(fallbackCeoCoords.lat)) && Number.isFinite(Number(fallbackCeoCoords.lng))
      ? { lat: Number(fallbackCeoCoords.lat), lng: Number(fallbackCeoCoords.lng) }
      : null);
  
  const statusEl = document.getElementById("settingsStatus");
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
        address,
        updatedAt: serverTimestamp()
      };
      if (effectiveGps && Number.isFinite(effectiveGps.lat) && Number.isFinite(effectiveGps.lng)) {
        restPayload.lat = effectiveGps.lat;
        restPayload.lng = effectiveGps.lng;
      }
      await setDoc(doc(db, "restaurants", restaurantId), restPayload, { merge: true });
      const rest = state.restaurants.find((r) => String(r.id) === String(restaurantId)) || {};
      await ensureRestaurantPublicMeta(restaurantId, {
        name,
        restaurantName: name,
        type: rest.type || rest.customerType || "cafe",
        city,
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
        restaurantId,
        updatedAt: serverTimestamp()
      };
      await setDoc(doc(db, "users", state.user.uid), payload, { merge: true });
      await syncCeoDirectoryProfilePatch({
        name,
        displayName: name,
        handle,
        city,
        locationLabel: city,
        ...(effectiveGps && Number.isFinite(effectiveGps.lat) && Number.isFinite(effectiveGps.lng) ? {
          lat: effectiveGps.lat,
          lng: effectiveGps.lng,
          gpsLat: effectiveGps.lat,
          gpsLng: effectiveGps.lng
        } : {})
      });
    }

    if (allowCeoOverride) {
      const userGpsPayload = {
        handle,
        city,
        address,
        updatedAt: serverTimestamp()
      };
      if (effectiveGps && Number.isFinite(effectiveGps.lat) && Number.isFinite(effectiveGps.lng)) {
        userGpsPayload.lat = effectiveGps.lat;
        userGpsPayload.lng = effectiveGps.lng;
        userGpsPayload.gpsLat = effectiveGps.lat;
        userGpsPayload.gpsLng = effectiveGps.lng;
      }
      await setDoc(doc(db, "users", state.user.uid), userGpsPayload, { merge: true });
    }

    await updateProfile(state.user, { displayName: name });
    state.userProfile = {
      ...state.userProfile,
      name,
      handle,
      bio,
      location: city,
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
    setTimeout(() => { if (statusEl) statusEl.textContent = ""; }, 2000);
  } catch (err) {
    console.error(err);
    if (statusEl) statusEl.textContent = "Fehler beim Speichern.";
  }
}

async function updateRestaurantSelection(restaurantId) {
  if (!state.user) return;
  state.userProfile.restaurantId = restaurantId || "";
  state.roleSwitchRestaurantId = restaurantId || state.roleSwitchRestaurantId || "";
  saveUserProfileToStorage();
  attachCurrentUserProfileListener();
  render();
  if (state.activeTab === "menu") {
    if (restaurantId) {
      void loadMenuForRestaurant(restaurantId, { source: "hybrid", force: true });
    } else {
      state.menu = { ...state.menu, restaurantId: "", items: [], loading: false, error: "", source: "hybrid" };
      render();
    }
  }
  if (isLocalBusinessProfile(state.userProfile)) {
    await loadBusinessPosts();
    return;
  }
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

async function persistPrivateAccountSetting(value) {
  if (!state.user?.uid) return;
  try {
    await setDoc(doc(db, "users", state.user.uid), {
      privateAccount: !!value,
      updatedAt: serverTimestamp()
    }, { merge: true });
  } catch (err) {
    console.error(err);
  }
}

async function handleUploadPost() {
  if (!state.user || !state.upload.file) return;

  const caption = document.getElementById("uploadCaption")?.value?.trim() || "";
  const isBusiness = isLocalBusinessProfile(state.userProfile);
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
  const ensured = await ensureUserProfile(user, { city: "Prishtina" });
  void force;
  const data = ensured && typeof ensured === "object" ? ensured : {};
  const prevAvatar = state.userProfile?.avatar || "";
  const normalized = normalizeProfile(data, user);
  const normalizedResolved = getOptimizedImageUrl(normalized.avatar || "", "avatar");
  if ((!normalized.avatar || isPlaceholderUrl(normalizedResolved)) && prevAvatar) normalized.avatar = prevAvatar;
  state.userProfile = normalized;
  state.userProfile.uid = user.uid;
  syncPrivateSettingFromProfile(normalized.privateAccount);
  saveUserProfileToStorage();
  attachCurrentUserProfileListener();
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
    if (state.activeTab === "search" && refreshSearchView()) return normalized;
    if (state.activeTab === "feed") return normalized;
  }
  render();
  return normalized;
}

async function loadBusinessProfile(user, { restaurant = null, force = false } = {}) {
  if (!user) return;
  const rest = restaurant || await resolveRestaurantForAuthUser(user, { preferCached: !force });
  if (!rest) {
    await loadUserProfile(user, { force });
    return;
  }
  const prevAvatar = state.userProfile?.avatar || "";
  const normalized = normalizeBusinessProfile(rest, user);
  normalized.uid = user.uid;
  const normalizedResolved = getOptimizedImageUrl(normalized.avatar || "", "avatar");
  if ((!normalized.avatar || isPlaceholderUrl(normalizedResolved)) && prevAvatar) normalized.avatar = prevAvatar;
  if (!Number.isFinite(Number(rest.followingCount ?? rest.following))) {
    normalized.following = state.userProfile?.following ?? normalized.following;
  }
  if (!Number.isFinite(Number(rest.followersCount ?? rest.followers))) {
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
    state.restaurants = mergeRestaurants(state.restaurants, [{ id: rest.id, ...rest }]);
    rebuildBusinessLocations();
  }
  if (lastRenderMode === "main") {
    updateShellDom();
    if (state.activeTab === "search" && refreshSearchView()) return;
    if (state.activeTab === "feed") return;
  }
  render();
}

async function loadAuthProfile(user, { force = false } = {}) {
  if (!user) return;
  const profileHint = state.userProfile || {};
  const hintRoles = normalizeRoleList(profileHint.roles || profileHint.role || "");
  const hintRoleKey = String(profileHint.role || "").toLowerCase();
  const hasStoredProfileHint = (
    hintRoles.length > 0
    || !!String(profileHint.name || "").trim()
    || !!String(profileHint.handle || "").trim()
    || !!String(profileHint.ceoParentUid || profileHint.ceoRootUid || "").trim()
    || !!String(profileHint.restaurantId || "").trim()
    || hintRoleKey !== "user"
  );
  const hasBusinessHint = !!String(profileHint.restaurantId || "").trim() || hintRoleKey === "business" || hintRoles.includes("owner");
  const hasTrustedNonBusinessHint = hasStoredProfileHint && !hasBusinessHint && (
    hintRoleKey === "ceo"
    || hintRoleKey === "staff"
    || hintRoleKey === "user"
    || hintRoles.includes("ceo")
    || hintRoles.includes("staff")
  );
  if (hasTrustedNonBusinessHint && !force) {
    const profile = await loadUserProfile(user, { force });
    const normalizedRoles = normalizeRoleList(profile?.roles || profile?.role || "");
    const normalizedRoleKey = String(profile?.role || "").toLowerCase();
    const hasBusinessProfile = !!String(profile?.restaurantId || "").trim() || normalizedRoleKey === "business" || normalizedRoles.includes("owner");
    if (!hasBusinessProfile) return;
  }
  let rest = await resolveRestaurantForAuthUser(user, { preferCached: !force });
  if (!rest && user?.uid) {
    const leadByUid = await resolveLeadByUid(user.uid);
    if (leadByUid) {
      rest = findRestaurantByLeadId(leadByUid.id) || await ensureRestaurantForLead(leadByUid, user);
    }
  }
  if (!rest && user?.email) {
    const lead = await resolveLeadByEmail(user.email);
    if (lead) {
      rest = findRestaurantByLeadId(lead.id) || await ensureRestaurantForLead(lead, user);
    }
  }
  if (!rest) {
    try {
      const legacySnap = await getDoc(doc(db, "users", user.uid));
      if (legacySnap.exists()) {
        const legacy = legacySnap.data() || {};
        const roleKey = String(legacy.role || "").toLowerCase();
        const restId = legacy.restaurantId || "";
        if ((roleKey === "business" || restId) && restId) {
          const restSnap = await getDoc(doc(db, "restaurants", restId));
          if (restSnap.exists()) {
            const restData = restSnap.data() || {};
            const patch = {};
            const legacyEmail = legacy.email || user.email || "";
            if (!restData.ownerUid) patch.ownerUid = user.uid;
            if (legacyEmail && !restData.ownerEmail) patch.ownerEmail = legacyEmail;
            const legacyName = legacy.displayName || legacy.name || "";
            if (legacyName && !(restData.name || restData.restaurantName)) {
              patch.name = legacyName;
              patch.restaurantName = legacyName;
            }
            const legacyAvatar = legacy.avatarUrl || legacy.avatar || "";
            if (legacyAvatar && !(restData.logoUrl || restData.logo)) {
              patch.logoUrl = legacyAvatar;
              patch.logo = legacyAvatar;
            }
            if (legacy.city && !restData.city) patch.city = legacy.city;
            if (legacy.address && !restData.address) patch.address = legacy.address;
            if (legacy.phone && !restData.phone) patch.phone = legacy.phone;
            if (legacy.instagram && !restData.instagram) {
              patch.instagram = legacy.instagram;
              patch.insta = legacy.instagram;
            }
            if (Object.keys(patch).length) {
              patch.updatedAt = serverTimestamp();
              await setDoc(doc(db, "restaurants", restId), patch, { merge: true });
            }
            rest = { id: restSnap.id, ...restData, ...patch };
          }
        }
      }
    } catch {}
  }
  if (rest && user?.uid) {
    const patch = {};
    const email = user.email || "";
    if (!rest.ownerUid) patch.ownerUid = user.uid;
    if (email && !rest.ownerEmail) patch.ownerEmail = email;
    if (Object.keys(patch).length && rest.id) {
      patch.updatedAt = serverTimestamp();
      await setDoc(doc(db, "restaurants", rest.id), patch, { merge: true });
      rest = { ...rest, ...patch };
    }
  }
  if (rest) {
    await loadBusinessProfile(user, { restaurant: rest, force });
    return;
  }
  await loadUserProfile(user, { force });
}

function stopRestaurantsListener() {
  if (restaurantsUnsub) {
    restaurantsUnsub();
    restaurantsUnsub = null;
  }
}

function startRestaurantsListener() {
  if (restaurantsUnsub) return;
  const restRef = collection(db, "restaurants");
  const restQuery = query(restRef, limit(FAST_LIMITS.restaurants));
  restaurantsUnsub = onSnapshot(restQuery, (snap) => {
    const rawList = [];
    snap.forEach((docSnap) => rawList.push({ id: docSnap.id, ...docSnap.data() }));

    const prevMap = new Map(state.restaurants.map((rest) => [rest.id, rest]));
    const next = rawList.map((row) => ({ ...prevMap.get(row.id), ...row, id: row.id }));
    state.restaurants = next;
    writeCache(CACHE_KEYS.restaurants, next);
    rebuildBusinessLocations();

    if (state.selectedBusiness?.id) {
      const selectedId = String(state.selectedBusiness.id || "");
      const selectedMarkerKey = String(state.selectedBusiness.markerKey || "");
      const selectedLocationIndex = Number(state.selectedBusiness.locationIndex || 0);
      const updated = state.businessLocations.find((b) => selectedMarkerKey && String(b.markerKey || "") === selectedMarkerKey)
        || state.businessLocations.find((b) => String(b.id) === selectedId && Number(b.locationIndex || 0) === selectedLocationIndex)
        || state.businessLocations.find((b) => String(b.id) === selectedId);
      state.selectedBusiness = updated || null;
    }

    if (state.activeTab === "map" && lastRenderMode === "main") {
      const queryValue = document.getElementById("mapSearchInput")?.value || "";
      const filtered = filterMapLocationsByQuery(queryValue);
      if (leafletMap) {
        renderLeafletMarkers(filtered);
        updateMapSheet();
      } else {
        render();
      }
    }
  }, (err) => {
    console.error(err);
  });
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
  const rest = restaurant || {};
  const displayName = data?.displayName || data?.name || rest?.name || rest?.restaurantName || fallbackName || "Business";
  const handle = resolvePreferredHandle({ handle: data?.handle || rest?.handle || "", name: displayName }, displayName);
  const followers = data?.followersCount ?? data?.followers ?? rest?.followersCount ?? rest?.followers ?? 0;
  const following = data?.followingCount ?? data?.following ?? rest?.followingCount ?? rest?.following ?? 0;
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
    bio: data?.bio || rest?.description || rest?.bio || "Offizieller Account auf MENYRA Social.",
    avatar: data?.avatarUrl || data?.avatar || rest?.logoUrl || rest?.logo || "",
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
    bio: data?.bio || fallback?.bio || "",
    avatar: data?.avatarUrl || data?.avatar || fallback?.avatar || '',
    location: data?.city || fallback?.location || "Prishtina",
    followers: data?.followersCount ?? data?.followers ?? fallback?.followers ?? 0,
    following: data?.followingCount ?? data?.following ?? fallback?.following ?? 0,
    privateAccount: !!data?.privateAccount,
    role: data?.role || fallback?.role || "user",
    pendingFollowRequest: false,
    posts: posts || []
  };
}

async function fetchBusinessProfileDoc({ restaurantId, restaurant }) {
  const rest = restaurant || (restaurantId ? state.restaurants.find((r) => r.id === restaurantId) : null) || null;
  if (rest?.id) return { id: rest.id, data: rest };
  const restId = restaurantId || rest?.id || "";
  if (!restId) return null;
  try {
    const snap = await getDoc(doc(db, "restaurants", restId));
    if (snap.exists()) return { id: snap.id, data: snap.data() || {} };
  } catch {}
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
    const hydrationIds = collectFeedHydrationIds(rows, { max: 8 });
    if (hydrationIds.length) {
      await hydrateRestaurantsByIds(hydrationIds, { max: hydrationIds.length });
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
    const hydrationIds = collectFeedHydrationIds(rows, { max: 4 });
    if (hydrationIds.length) {
      await hydrateRestaurantsByIds(hydrationIds, { max: hydrationIds.length });
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

async function loadPublicMenuItems(restaurantId) {
  if (!restaurantId) return [];
  try {
    const snap = await getDoc(doc(db, "restaurants", restaurantId, "public", "menu"));
    if (!snap.exists()) return [];
    const data = snap.data() || {};
    const items = coerceMenuItemsFromData(data);
    return items;
  } catch (err) {
    console.error(err);
    return [];
  }
}

async function loadLegacyMenuItems(restaurantId) {
  if (!restaurantId) return [];
  try {
    const snap = await getDoc(doc(db, "restaurants", restaurantId));
    if (!snap.exists()) return [];
    const data = snap.data() || {};
    return coerceMenuItemsFromData(data);
  } catch (err) {
    console.error(err);
    return [];
  }
}

async function loadMenuItemsFromCollection(restaurantId) {
  if (!restaurantId) return [];
  try {
    const ref = collection(db, "restaurants", restaurantId, "menuItems");
    const snap = await getDocs(ref);
    return snap.docs.map((docSnap) => normalizeMenuItemDoc(docSnap.data(), docSnap.id));
  } catch (err) {
    console.error(err);
    return [];
  }
}

function hasMenuItemImages(item) {
  return getMenuItemImages(item).length > 0;
}

function fillMenuImagesFromFallback(baseItems, fallbackItems) {
  const list = Array.isArray(baseItems) ? baseItems : [];
  const fallback = Array.isArray(fallbackItems) ? fallbackItems : [];
  if (!list.length || !fallback.length) return list;
  const fallbackById = new Map(fallback.map((it) => [String(it.id || ""), it]));
  const fallbackByNameCatPrice = new Map();
  const fallbackByNameCat = new Map();
  const fallbackByName = new Map();
  fallback.forEach((fb) => {
    if (!fb) return;
    const nameKey = foldMenuText(fb.name || "").trim();
    const catKey = foldMenuText(fb.category || "").trim();
    const priceKey = String(fb.price ?? "").trim();
    if (nameKey) {
      const byName = fallbackByName.get(nameKey) || [];
      byName.push(fb);
      fallbackByName.set(nameKey, byName);
    }
    if (nameKey || catKey) {
      const key = `${nameKey}|${catKey}`;
      if (!fallbackByNameCat.has(key)) fallbackByNameCat.set(key, fb);
    }
    if (nameKey || catKey || priceKey) {
      const key = `${nameKey}|${catKey}|${priceKey}`;
      if (!fallbackByNameCatPrice.has(key)) fallbackByNameCatPrice.set(key, fb);
    }
  });
  return list.map((it) => {
    if (!it || hasMenuItemImages(it)) return it;
    const byId = it.id ? fallbackById.get(String(it.id)) : null;
    if (byId && hasMenuItemImages(byId)) {
      return {
        ...it,
        imageUrl: byId.imageUrl || "",
        imageUrls: Array.isArray(byId.imageUrls) ? byId.imageUrls : []
      };
    }
    const nameKey = foldMenuText(it.name || "").trim();
    const catKey = foldMenuText(it.category || "").trim();
    const priceKey = String(it.price ?? "").trim();
    let match = null;
    if (nameKey || catKey || priceKey) {
      match = fallbackByNameCatPrice.get(`${nameKey}|${catKey}|${priceKey}`) || null;
    }
    if (!match && (nameKey || catKey)) {
      match = fallbackByNameCat.get(`${nameKey}|${catKey}`) || null;
    }
    if (!match && nameKey) {
      const listByName = fallbackByName.get(nameKey) || [];
      if (listByName.length === 1) match = listByName[0];
    }
    if (match && hasMenuItemImages(match)) {
      return {
        ...it,
        imageUrl: match.imageUrl || "",
        imageUrls: Array.isArray(match.imageUrls) ? match.imageUrls : []
      };
    }
    return it;
  });
}

async function publishMenuToPublic(restaurantId, items) {
  if (!restaurantId) return;
  const ref = doc(db, "restaurants", restaurantId, "public", "menu");
  const payload = {
    items: (items || []).map((item) => ({
      id: item.id || "",
      type: item.type || null,
      category: item.category || "Sonstiges",
      name: item.name || "Produkt",
      description: item.description || "",
      longDescription: item.longDescription || "",
      allergens: item.allergens || "",
      brand: item.brand || "",
      sku: item.sku || "",
      stock: Number.isFinite(Number(item.stock)) ? Math.max(0, Number(item.stock)) : null,
      sizes: Array.isArray(item.sizes) ? item.sizes : [],
      colors: Array.isArray(item.colors) ? item.colors : [],
      cropX: clampCropPercent(item.cropX ?? 50, 50),
      cropY: clampCropPercent(item.cropY ?? 50, 50),
      price: item.price ?? "",
      available: item.available !== false,
      imageUrl: item.imageUrl || null,
      imageUrls: Array.isArray(item.imageUrls) ? item.imageUrls : []
    })),
    publishedAt: serverTimestamp()
  };
  await setDoc(ref, payload, { merge: true });
}

async function loadMenuHybrid(restaurantId) {
  const pub = await loadPublicMenuItems(restaurantId);
  if (pub && pub.length) {
    const needsImages = pub.some((it) => !hasMenuItemImages(it));
    if (!needsImages) return pub;
    const [col, legacy] = await Promise.all([
      loadMenuItemsFromCollection(restaurantId),
      loadLegacyMenuItems(restaurantId)
    ]);
    const fallbackItems = col.length ? col : legacy;
    if (!fallbackItems.length) return pub;
    const merged = fillMenuImagesFromFallback(pub, fallbackItems);
    return merged;
  }
  const col = await loadMenuItemsFromCollection(restaurantId);
  if (col && col.length) {
    try {
      await publishMenuToPublic(restaurantId, col);
    } catch (err) {
      console.error(err);
    }
    return col;
  }
  const legacy = await loadLegacyMenuItems(restaurantId);
  if (legacy && legacy.length) {
    try {
      await publishMenuToPublic(restaurantId, legacy);
    } catch (err) {
      console.error(err);
    }
    return legacy;
  }
  return [];
}

function menuCacheKey(restaurantId, source) {
  return `${restaurantId || ""}::${source || "hybrid"}`;
}

function normalizeFocusItem(data, fallbackId) {
  const d = data || {};
  const id = d.id || d._id || fallbackId || (crypto.randomUUID?.() || String(Math.random()).slice(2));
  const crop = getFocusItemCrop(d);
  return {
    id,
    title: d.title || d.name || "Sot ne Fokus",
    text: d.text || d.desc || d.description || "",
    imageUrl: d.imageUrl || d.image || d.photoUrl || "",
    cropX: crop.x,
    cropY: crop.y,
    active: d.active !== false
  };
}

async function loadFocusItems(restaurantId) {
  if (!restaurantId) return [];
  try {
    const snap = await getDoc(doc(db, "restaurants", restaurantId, "public", "offers"));
    if (!snap.exists()) return [];
    const data = snap.data() || {};
    const arr = Array.isArray(data.items) ? data.items : [];
    return arr.map((item, idx) => normalizeFocusItem(item, item?.id || `focus_${idx}`));
  } catch (err) {
    console.error(err);
    return [];
  }
}

async function loadFocusMeta(restaurantId) {
  if (!restaurantId) return true;
  try {
    const snap = await getDoc(doc(db, "restaurants", restaurantId, "public", "meta"));
    if (!snap.exists()) return true;
    const data = snap.data() || {};
    if (typeof data.offersEnabled === "boolean") return data.offersEnabled;
  } catch (err) {
    console.error(err);
  }
  return true;
}

async function saveFocusEnabled(restaurantId, enabled) {
  if (!restaurantId) return;
  try {
    await setDoc(doc(db, "restaurants", restaurantId, "public", "meta"), {
      offersEnabled: !!enabled,
      updatedAt: serverTimestamp()
    }, { merge: true });
  } catch (err) {
    console.error(err);
  }
}

async function publishFocusItems(restaurantId, items) {
  if (!restaurantId) return;
  const payload = {
    items: (items || []).map((item) => ({
      id: item.id || "",
      title: item.title || "",
      text: item.text || "",
      imageUrl: item.imageUrl || "",
      cropX: clampCropPercent(item.cropX ?? 50, 50),
      cropY: clampCropPercent(item.cropY ?? 50, 50),
      active: item.active !== false
    })),
    updatedAt: serverTimestamp()
  };
  await setDoc(doc(db, "restaurants", restaurantId, "public", "offers"), payload, { merge: true });
}

function focusCacheKey(restaurantId) {
  return `${restaurantId || ""}`;
}

async function loadFocusForRestaurant(restaurantId, { force = false } = {}) {
  if (!restaurantId) {
    state.focus = { ...state.focus, restaurantId: "", items: [], loading: false, error: "" };
    return;
  }
  const cacheKey = focusCacheKey(restaurantId);
  const cached = focusCache.get(cacheKey);
  if (cached && cached.items?.length && !force) {
    state.focus = { ...state.focus, restaurantId, items: cached.items, enabled: cached.enabled, loading: false, error: "", index: 0 };
    return;
  }
  state.focus = { ...state.focus, restaurantId, loading: true, error: "" };
  render();
  try {
    const [items, enabled] = await Promise.all([
      loadFocusItems(restaurantId),
      loadFocusMeta(restaurantId)
    ]);
    focusCache.set(cacheKey, { items, enabled, ts: Date.now() });
    state.focus = { ...state.focus, restaurantId, items, enabled, loading: false, error: "", index: 0 };
    render();
  } catch (err) {
    console.error(err);
    state.focus = { ...state.focus, restaurantId, items: [], loading: false, error: "Fokus laden fehlgeschlagen." };
    render();
  }
}

async function loadMenuForRestaurant(restaurantId, { force = false, source = "hybrid" } = {}) {
  if (!restaurantId) {
    state.menu = { ...state.menu, restaurantId: "", items: [], loading: false, error: "", source };
    return;
  }
  const cacheKey = menuCacheKey(restaurantId, source);
  const cached = menuCache.get(cacheKey);
  if (cached && cached.items?.length && !force) {
    const cachedNeedsImages = cached.items.some((it) => !hasMenuItemImages(it));
    if (!cachedNeedsImages) {
      state.menu = { ...state.menu, restaurantId, items: cached.items, loading: false, error: "", source };
      return;
    }
  }
  state.menu = { ...state.menu, restaurantId, loading: true, error: "", source };
  render();
  try {
    let items = [];
    if (source === "collection") {
      items = await loadMenuItemsFromCollection(restaurantId);
      const needsImages = items.some((it) => !hasMenuItemImages(it));
      if (needsImages) {
        const publicItems = await loadPublicMenuItems(restaurantId);
        const fallbackItems = publicItems.length ? publicItems : await loadLegacyMenuItems(restaurantId);
        if (fallbackItems.length) {
          items = fillMenuImagesFromFallback(items, fallbackItems);
        }
      }
    } else {
      items = await loadMenuHybrid(restaurantId);
    }
    menuCache.set(cacheKey, { items, ts: Date.now() });
    state.menu = { ...state.menu, restaurantId, items, loading: false, error: "", source };
    render();
  } catch (err) {
    console.error(err);
    state.menu = { ...state.menu, restaurantId, items: [], loading: false, error: "Menu laden fehlgeschlagen.", source };
    render();
  }
}

function syncMenuCaches(restaurantId, items) {
  const list = Array.isArray(items) ? items : [];
  menuCache.set(menuCacheKey(restaurantId, "collection"), { items: list, ts: Date.now() });
  menuCache.set(menuCacheKey(restaurantId, "hybrid"), { items: list, ts: Date.now() });
  if (state.menu.restaurantId === restaurantId) {
    state.menu = { ...state.menu, items: list };
  }
}

function getMenuRestaurantForProfile(profile) {
  return profile?.restaurantId || "";
}

function ensureMenuDataForProfile(profile = state.profileView?.profile || state.userProfile) {
  const restaurantId = getMenuRestaurantForProfile(profile);
  if (!restaurantId) return;
  void loadMenuForRestaurant(restaurantId, { source: "hybrid" });
}

function ensureFocusDataForProfile(profile = state.profileView?.profile || state.userProfile) {
  const restaurantId = getMenuRestaurantForProfile(profile);
  if (!restaurantId) return;
  void loadFocusForRestaurant(restaurantId);
}

function normalizeOrderItem(item) {
  return {
    id: String(item?.id || item?.itemId || "").trim(),
    itemId: String(item?.itemId || item?.id || "").trim(),
    cartKey: String(
      item?.cartKey
      || buildShopVariantKey(item?.itemId || item?.id || "", {
        size: item?.selectedSize || item?.size || "",
        color: item?.selectedColor || item?.color || ""
      })
    ).trim(),
    name: String(item?.name || "Produkt").trim() || "Produkt",
    price: String(item?.price ?? "").trim(),
    quantity: Math.max(1, Number(item?.quantity || 1) || 1),
    imageUrl: String(item?.imageUrl || "").trim(),
    category: String(item?.category || "").trim(),
    selectedSize: String(item?.selectedSize || item?.size || "").trim(),
    selectedColor: String(item?.selectedColor || item?.color || "").trim(),
    cropX: clampCropPercent(item?.cropX ?? 50, 50),
    cropY: clampCropPercent(item?.cropY ?? 50, 50)
  };
}

function normalizeOrderDoc(data, id) {
  const source = data && typeof data === "object" ? data : {};
  const items = (Array.isArray(source.items) ? source.items : []).map(normalizeOrderItem).filter((item) => item.id && item.itemId);
  const total = Number(source.total);
  return {
    id: String(id || source.id || "").trim(),
    restaurantId: String(source.restaurantId || "").trim(),
    businessName: String(source.businessName || "").trim(),
    businessAvatar: String(source.businessAvatar || "").trim(),
    buyerUid: String(source.buyerUid || "").trim(),
    buyerName: String(source.buyerName || "").trim(),
    buyerHandle: String(source.buyerHandle || "").trim(),
    buyerAvatar: String(source.buyerAvatar || "").trim(),
    contact: {
      name: String(source.contact?.name || "").trim(),
      phone: String(source.contact?.phone || "").trim(),
      city: String(source.contact?.city || "").trim(),
      address: String(source.contact?.address || "").trim()
    },
    items,
    itemCount: Math.max(1, Number(source.itemCount || items.reduce((sum, item) => sum + item.quantity, 0) || 1) || 1),
    total: Number.isFinite(total) ? total : items.reduce((sum, item) => sum + (parsePriceValue(item.price) * item.quantity), 0),
    status: String(source.status || "Neu").trim() || "Neu",
    createdAt: source.createdAt || source.createdAtClient || new Date().toISOString(),
    updatedAt: source.updatedAt || source.updatedAtClient || source.createdAt || source.createdAtClient || new Date().toISOString()
  };
}

function stopOrdersListener() {
  if (ordersUnsub) {
    ordersUnsub();
    ordersUnsub = null;
  }
  ordersListenerKey = "";
}

function startOrdersListener(user = state.user) {
  const uid = String(user?.uid || "").trim();
  if (!uid) {
    stopOrdersListener();
    return;
  }
  const isBusiness = isLocalBusinessProfile(state.userProfile) && !!state.userProfile.restaurantId;
  const nextListenerKey = isBusiness
    ? `restaurant:${String(state.userProfile.restaurantId || "").trim()}`
    : `user:${uid}`;
  if (!nextListenerKey || (ordersUnsub && ordersListenerKey === nextListenerKey)) return;
  stopOrdersListener();
  const pathRef = isBusiness
    ? collection(db, "restaurants", state.userProfile.restaurantId, "orders")
    : collection(db, "users", uid, "orders");
  ordersListenerKey = nextListenerKey;
  state.orders = { ...state.orders, loading: true, error: "" };
  if (state.activeTab === "orders") render();
  ordersUnsub = onSnapshot(query(pathRef, orderBy("createdAt", "desc"), limit(60)), (snap) => {
    const items = snap.docs.map((docSnap) => normalizeOrderDoc(docSnap.data() || {}, docSnap.id));
    state.orders = { ...state.orders, items, loading: false, error: "" };
    if (state.activeTab === "orders" && lastRenderMode === "main") {
      render();
    }
  }, (err) => {
    console.error(err);
    ordersUnsub = null;
    ordersListenerKey = "";
    state.orders = { ...state.orders, loading: false, error: "Bestellungen konnten nicht geladen werden." };
    if (state.activeTab === "orders" && lastRenderMode === "main") {
      render();
    }
  });
}

function clearShopCart({ keepForm = false } = {}) {
  const form = keepForm
    ? { ...(state.shopCart?.form || createEmptyShopCart().form) }
    : { ...createEmptyShopCart().form };
  state.shopCart = {
    ...createEmptyShopCart(),
    form
  };
  saveShopCartToStorage();
}

function getCurrentShopProfile() {
  return state.profileView?.profile || state.userProfile;
}

function getShopCartProfileContext(profile = getCurrentShopProfile()) {
  const restaurantId = String(profile?.restaurantId || "").trim();
  const rest = restaurantId ? getRestaurantMetaById(restaurantId) : null;
  return {
    restaurantId,
    businessName: String(profile?.name || rest?.name || rest?.restaurantName || "Shop").trim() || "Shop",
    businessAvatar: String(profile?.avatar || rest?.logoUrl || rest?.logo || "").trim()
  };
}

function addMenuItemToShopCart(item, profile = getCurrentShopProfile(), options = {}) {
  if (!item || !canAddToShopCart(profile)) return;
  const context = getShopCartProfileContext(profile);
  if (!context.restaurantId) return;
  const currentRestaurantId = String(state.shopCart?.restaurantId || "").trim();
  if (currentRestaurantId && currentRestaurantId !== context.restaurantId) {
    const shouldReplace = confirm("Dein Warenkorb enthaelt Produkte von einem anderen Shop. Ersetzen?");
    if (!shouldReplace) return;
    clearShopCart({ keepForm: true });
  }
  const nextCart = normalizeShopCartState(state.shopCart);
  const selectedSize = String(options?.size || "").trim();
  const selectedColor = String(options?.color || "").trim();
  const cartKey = buildShopVariantKey(item.id, { size: selectedSize, color: selectedColor });
  const existingIndex = nextCart.items.findIndex((entry) => String(entry.cartKey || entry.itemId) === cartKey);
  const entry = {
    id: String(item.id || "").trim(),
    itemId: String(item.id || "").trim(),
    cartKey,
    name: String(item.name || "Produkt").trim() || "Produkt",
    price: String(item.price ?? "").trim(),
    quantity: 1,
    imageUrl: String(resolveMenuItemHero(item) || "").trim(),
    category: String(item.category || "").trim(),
    selectedSize,
    selectedColor,
    cropX: clampCropPercent(item?.cropX ?? 50, 50),
    cropY: clampCropPercent(item?.cropY ?? 50, 50)
  };
  if (existingIndex >= 0) {
    nextCart.items[existingIndex] = {
      ...nextCart.items[existingIndex],
      quantity: Math.max(1, Number(nextCart.items[existingIndex].quantity || 1) + 1)
    };
  } else {
    nextCart.items.unshift(entry);
  }
  nextCart.restaurantId = context.restaurantId;
  nextCart.businessName = context.businessName;
  nextCart.businessAvatar = context.businessAvatar;
  nextCart.status = `${entry.name} wurde zum Warenkorb hinzugefuegt.`;
  state.shopCart = nextCart;
  saveShopCartToStorage();
  render();
}

function updateShopCartQuantity(itemId, delta) {
  const safeId = String(itemId || "").trim();
  if (!safeId) return;
  const nextCart = normalizeShopCartState(state.shopCart);
  nextCart.items = nextCart.items
    .map((entry) => (
      String(entry.cartKey || entry.itemId) === safeId
        ? { ...entry, quantity: Math.max(0, Number(entry.quantity || 1) + Number(delta || 0)) }
        : entry
    ))
    .filter((entry) => entry.quantity > 0);
  nextCart.status = "";
  if (!nextCart.items.length) {
    clearShopCart({ keepForm: true });
  } else {
    state.shopCart = nextCart;
    saveShopCartToStorage();
  }
  render();
}

function openShopCheckout() {
  const nextCart = normalizeShopCartState(state.shopCart);
  if (!nextCart.items.length) return;
  nextCart.checkoutOpen = true;
  nextCart.status = "";
  if (!nextCart.form.name) nextCart.form.name = String(state.userProfile?.name || state.user?.displayName || "").trim();
  if (!nextCart.form.phone) nextCart.form.phone = String(state.userProfile?.phone || state.user?.phoneNumber || "").trim();
  if (!nextCart.form.city) nextCart.form.city = String(state.userProfile?.location || "").trim();
  if (!nextCart.form.address) nextCart.form.address = String(state.userProfile?.address || "").trim();
  state.shopCart = nextCart;
  saveShopCartToStorage();
  render();
}

function updateShopCheckoutField(field, value) {
  if (!field) return;
  const nextCart = normalizeShopCartState(state.shopCart);
  if (!(field in nextCart.form)) return;
  nextCart.form[field] = String(value || "");
  nextCart.status = "";
  state.shopCart = nextCart;
  saveShopCartToStorage();
}

function getShopCartTotal() {
  return (state.shopCart.items || []).reduce((sum, item) => {
    return sum + (parsePriceValue(item.price) * Math.max(1, Number(item.quantity || 1) || 1));
  }, 0);
}

async function submitShopCheckout() {
  if (!state.user) return;
  const cart = normalizeShopCartState(state.shopCart);
  if (cart.loading || !cart.restaurantId || !cart.items.length) return;
  const contact = {
    name: String(cart.form.name || "").trim(),
    phone: String(cart.form.phone || "").trim(),
    city: String(cart.form.city || "").trim(),
    address: String(cart.form.address || "").trim()
  };
  if (!contact.name || !contact.phone || !contact.city || !contact.address) {
    state.shopCart = { ...cart, status: "Bitte Name, Tel, Qyteti und Adresse eingeben." };
    saveShopCartToStorage();
    render();
    return;
  }
  const restaurant = getRestaurantMetaById(cart.restaurantId) || {};
  const businessAvatar = cart.businessAvatar || restaurant.logoUrl || restaurant.logo || "";
  const orderRef = doc(collection(db, "restaurants", cart.restaurantId, "orders"));
  const orderId = orderRef.id;
  const nowIso = new Date().toISOString();
  const buyerHandle = String(state.userProfile.handle || normalizeHandle(state.userProfile.name || state.user?.displayName || "user")).replace(/^@/, "").trim();
  const payload = {
    id: orderId,
    restaurantId: cart.restaurantId,
    businessName: cart.businessName || restaurant.name || restaurant.restaurantName || "Shop",
    businessAvatar,
    buyerUid: state.user.uid,
    buyerName: state.userProfile.name || state.user?.displayName || "User",
    buyerHandle,
    buyerAvatar: state.userProfile.avatar || "",
    contact,
    items: cart.items.map((item) => ({
      id: item.id,
      itemId: item.itemId,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      imageUrl: item.imageUrl,
      category: item.category,
      cartKey: item.cartKey || buildShopVariantKey(item.itemId || item.id || "", {
        size: item.selectedSize || "",
        color: item.selectedColor || ""
      }),
      selectedSize: item.selectedSize || "",
      selectedColor: item.selectedColor || "",
      cropX: clampCropPercent(item.cropX ?? 50, 50),
      cropY: clampCropPercent(item.cropY ?? 50, 50)
    })),
    itemCount: cart.items.reduce((sum, item) => sum + item.quantity, 0),
    total: getShopCartTotal(),
    status: "Neu",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    createdAtClient: nowIso,
    updatedAtClient: nowIso
  };
  state.shopCart = { ...cart, loading: true, status: "Bestellung wird gesendet..." };
  render();
  try {
    const batch = writeBatch(db);
    batch.set(orderRef, payload, { merge: true });
    batch.set(doc(db, "users", state.user.uid, "orders", orderId), payload, { merge: true });
    await batch.commit();
    clearShopCart({ keepForm: true });
    state.activeTab = "orders";
    state.drawerOpen = false;
    render();
  } catch (err) {
    console.error(err);
    state.shopCart = { ...cart, loading: false, checkoutOpen: true, status: "Bestellung konnte nicht gesendet werden." };
    saveShopCartToStorage();
    render();
  }
}

function openFocusModal(mode = "create", item = null) {
  const crop = getFocusItemCrop(item);
  state.focusModal = {
    open: true,
    mode,
    item,
    status: "",
    loading: false,
    cropX: crop.x,
    cropY: crop.y,
    imageFile: null,
    imagePreview: ""
  };
  renderOverlays({ updateFocus: true });
}

function closeFocusModal() {
  state.focusModal = {
    open: false,
    mode: "create",
    item: null,
    status: "",
    loading: false,
    cropX: 50,
    cropY: 50,
    imageFile: null,
    imagePreview: ""
  };
  renderOverlays({ updateFocus: true });
}

async function saveFocusItemFromModal() {
  if (!state.user) return;
  const restaurantId = state.userProfile.restaurantId || "";
  if (!restaurantId) {
    state.focusModal.status = "Kein Restaurant ausgewaehlt.";
    renderOverlays({ updateFocus: true });
    return;
  }
  const title = document.getElementById("focusTitle")?.value?.trim() || "";
  const text = document.getElementById("focusText")?.value?.trim() || "";
  const imageUrlInput = document.getElementById("focusImageUrl")?.value?.trim() || "";
  const active = document.getElementById("focusActive")?.checked !== false;
  const crop = getFocusModalCrop();
  if (!title) {
    state.focusModal.status = "Bitte Titel eingeben.";
    renderOverlays({ updateFocus: true });
    return;
  }

  state.focusModal.loading = true;
  state.focusModal.status = "Speichern...";
  renderOverlays({ updateFocus: true });

  try {
    let imageUrl = imageUrlInput || state.focusModal.item?.imageUrl || "";
    if (state.focusModal.imageFile) {
      const { cdnUrl } = await uploadCompressedImage(
        state.focusModal.imageFile,
        restaurantId,
        { maxSize: 1080, quality: 0.8, mimeType: "image/jpeg" }
      );
      imageUrl = cdnUrl || imageUrl;
    }

    const id = state.focusModal.item?.id || (crypto.randomUUID?.() || String(Math.random()).slice(2));
    const payload = {
      id,
      title,
      text,
      imageUrl,
      cropX: crop.x,
      cropY: crop.y,
      active
    };
    const nextItems = Array.isArray(state.focus.items) ? state.focus.items.slice() : [];
    const idx = nextItems.findIndex((it) => String(it.id) === String(id));
    if (idx >= 0) {
      nextItems[idx] = { ...nextItems[idx], ...payload };
    } else {
      nextItems.unshift(payload);
    }
    await publishFocusItems(restaurantId, nextItems);
    focusCache.set(focusCacheKey(restaurantId), { items: nextItems, enabled: state.focus.enabled, ts: Date.now() });
    state.focus = { ...state.focus, restaurantId, items: nextItems, loading: false, error: "" };

    state.focusModal.loading = false;
    state.focusModal.status = "Gespeichert.";
    closeFocusModal();
    render();
  } catch (err) {
    console.error(err);
    state.focusModal.status = err?.message || "Speichern fehlgeschlagen.";
    state.focusModal.loading = false;
    renderOverlays({ updateFocus: true });
  }
}

async function deleteFocusItemById(itemId) {
  if (!state.user || !itemId) return;
  const restaurantId = state.userProfile.restaurantId || "";
  if (!restaurantId) return;
  if (!confirm("Fokus-Eintrag wirklich loeschen?")) return;
  try {
    const nextItems = (state.focus.items || []).filter((it) => String(it.id) !== String(itemId));
    await publishFocusItems(restaurantId, nextItems);
    focusCache.set(focusCacheKey(restaurantId), { items: nextItems, enabled: state.focus.enabled, ts: Date.now() });
    state.focus = { ...state.focus, restaurantId, items: nextItems };
    render();
  } catch (err) {
    console.error(err);
    alert("Loeschen fehlgeschlagen.");
  }
}

// --- CRM: Leads & Customers (CEO) ---
let __secondaryAuth = null;
function getSecondaryAuth() {
  if (__secondaryAuth) return __secondaryAuth;
  const existing = getApps().find((item) => item.name === "menyra-secondary");
  const secondaryApp = existing || initializeApp(app.options, "menyra-secondary");
  __secondaryAuth = getAuth(secondaryApp);
  return __secondaryAuth;
}

async function createAuthUser(email, password) {
  if (!email || !password) throw new Error("Email/Passwort fehlt.");
  const auth2 = getSecondaryAuth();
  let cred = null;
  try {
    cred = await createUserWithEmailAndPassword(auth2, email, password);
  } catch (err) {
    if (err?.code === "auth/email-already-in-use") {
      cred = await signInWithEmailAndPassword(auth2, email, password);
    } else {
      throw err;
    }
  }
  try { await signOut(auth2); } catch {}
  return cred?.user || null;
}

async function ensureSocialBusinessProfile({ uid, email, name, restaurantId, city, address, phone, logoUrl, instagram, roles }) {
  void uid;
  void email;
  void name;
  void restaurantId;
  void city;
  void address;
  void phone;
  void logoUrl;
  void instagram;
  void roles;
}

async function ensureRestaurantPublicMeta(restaurantId, base) {
  if (!restaurantId) return;
  const payload = {
    name: base?.name || base?.restaurantName || "",
    restaurantName: base?.restaurantName || base?.name || "",
    type: base?.type || "cafe",
    city: base?.city || "",
    logoUrl: base?.logoUrl || base?.logo || "",
    logo: base?.logo || "",
    updatedAt: serverTimestamp()
  };
  await setDoc(doc(db, "restaurants", restaurantId, "public", "meta"), payload, { merge: true });
}

function normalizeLeadDoc(docSnap) {
  const sourceData = typeof docSnap?.data === "function" ? docSnap.data() : (docSnap?.data || docSnap || {});
  const data = applyKnownLeadOwnershipOverride(sourceData);
  const status = normalizeLeadStatusKey(data.status || "registered") || "registered";
  const fallbackCoords = resolveCoordsFromEntity(data);
  const fallbackLat = fallbackCoords?.lat ?? null;
  const fallbackLng = fallbackCoords?.lng ?? null;
  const locations = normalizeLeadLocations(data.locations || [], data.address || "", {
    lat: fallbackLat,
    lng: fallbackLng
  });
  const primary = getPrimaryLeadLocation(locations);
  return {
    id: docSnap?.id || data.id || "",
    businessName: data.businessName || data.name || "",
    customerType: resolveCustomerType(data.customerType || data.type || "cafe"),
    contactName: data.contactName || data.contact || "",
    phone: data.phone || "",
    email: data.email || "",
    instagram: data.instagram || data.insta || "",
    city: data.city || "",
    address: locations[0]?.address || data.address || "",
    lat: hasLeadLocationCoords(primary) ? primary.lat : (fallbackLat ?? null),
    lng: hasLeadLocationCoords(primary) ? primary.lng : (fallbackLng ?? null),
    gpsLat: Number.isFinite(Number(fallbackLat)) ? Number(fallbackLat) : null,
    gpsLng: Number.isFinite(Number(fallbackLng)) ? Number(fallbackLng) : null,
    locations,
    logoUrl: data.logoUrl || data.logo || data.imageUrl || "",
    note: data.note || "",
    status,
    restaurantId: data.restaurantId || data.restaurant || "",
    socialUid: data.socialUid || "",
    socialEmail: data.socialEmail || "",
    createdByUid: data.createdByUid || "",
    createdByRole: data.createdByRole || "",
    createdByName: data.createdByName || "",
    createdByHandle: data.createdByHandle || "",
    ceoRootUid: data.ceoRootUid || "",
    ceoRootName: data.ceoRootName || "",
    ceoParentUid: data.ceoParentUid || "",
    ceoPath: normalizeCeoPath(data.ceoPath),
    createdAt: data.createdAt,
    updatedAt: data.updatedAt
  };
}

function normalizeLeadFromRestaurant(rest) {
  if (!rest?.id) return null;
  const data = applyKnownLeadOwnershipOverride(rest);
  const status = normalizeLeadStatusKey(data.status || "registered") || "registered";
  const fallbackCoords = resolveCoordsFromEntity(data);
  const fallbackLat = fallbackCoords?.lat ?? null;
  const fallbackLng = fallbackCoords?.lng ?? null;
  const locations = normalizeLeadLocations(data.locations || [], data.address || "", {
    lat: fallbackLat,
    lng: fallbackLng
  });
  const primary = getPrimaryLeadLocation(locations);
  return {
    id: data.leadId || data.id,
    businessName: data.name || data.restaurantName || "",
    customerType: resolveCustomerType(data.type || data.customerType || "cafe"),
    contactName: data.ownerName || "",
    phone: data.phone || "",
    email: data.ownerEmail || "",
    instagram: data.instagram || data.insta || "",
    city: data.city || "",
    address: locations[0]?.address || data.address || "",
    logoUrl: data.logoUrl || data.logo || "",
    note: "",
    status,
    restaurantId: data.id,
    socialUid: data.ownerUid || "",
    socialEmail: data.ownerEmail || "",
    createdByUid: data.createdByUid || "",
    createdByRole: data.createdByRole || "",
    createdByName: data.createdByName || "",
    createdByHandle: data.createdByHandle || "",
    ceoRootUid: data.ceoRootUid || "",
    ceoRootName: data.ceoRootName || "",
    ceoParentUid: data.ceoParentUid || "",
    ceoPath: normalizeCeoPath(data.ceoPath),
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
    lat: hasLeadLocationCoords(primary) ? primary.lat : (fallbackLat ?? null),
    lng: hasLeadLocationCoords(primary) ? primary.lng : (fallbackLng ?? null),
    gpsLat: Number.isFinite(Number(fallbackLat)) ? Number(fallbackLat) : null,
    gpsLng: Number.isFinite(Number(fallbackLng)) ? Number(fallbackLng) : null,
    locations
  };
}

function isRestaurantLeadCandidate(rest = {}) {
  const typeKey = normalizeRestaurantType(rest?.type || rest?.customerType || rest?.category || rest?.kind || rest?.restaurantType || "");
  const hasLinkedOwner = !!String(rest?.ownerUid || rest?.socialUid || rest?.uid || rest?.userUid || "").trim();
  const statusKey = normalizeLeadStatusKey(rest.status || "");
  if (typeKey === "ecommerce" && hasLinkedOwner && (!statusKey || ["registered", "contacted"].includes(statusKey))) return false;
  if (statusKey === "kunde") return false;
  if (["registered", "contacted", "testphase", "no_interest"].includes(statusKey)) return true;
  if (rest.leadId) return true;
  const noOwner = !rest.ownerUid && !rest.ownerEmail;
  if (!statusKey && noOwner) return true;
  return false;
}

function leadStatusTone(status) {
  const key = normalizeLeadStatusKey(status);
  if (key === "registered") return { bg: "bg-indigo-50", text: "text-indigo-600" };
  if (key === "contacted") return { bg: "bg-amber-50", text: "text-amber-600" };
  if (key === "testphase") return { bg: "bg-sky-50", text: "text-sky-600" };
  if (key === "kunde") return { bg: "bg-emerald-100", text: "text-emerald-700" };
  if (key === "no_interest") return { bg: "bg-slate-100", text: "text-slate-500" };
  return { bg: "bg-slate-100", text: "text-slate-500" };
}

function resolveRestaurantStatusFromLead(leadStatus, currentStatus = "") {
  const leadKey = normalizeLeadStatusKey(leadStatus);
  if (leadKey === "kunde") return "active";
  if (leadKey === "testphase") return "testphase";
  if (["registered", "contacted", "no_interest"].includes(leadKey)) return "lead";
  if (currentStatus) return currentStatus;
  return "lead";
}

function leadMatchesQuery(lead, queryKey) {
  if (!queryKey) return true;
  const locationText = Array.isArray(lead.locations)
    ? lead.locations.map((item) => item?.address || "").join(" ")
    : "";
  const hay = normalizeSearchKey([
    lead.businessName,
    lead.contactName,
    lead.phone,
    lead.email,
    lead.instagram,
    lead.city,
    lead.customerType,
    locationText
  ].filter(Boolean).join(" "));
  return hay.includes(queryKey);
}

function customerMatchesQuery(rest, queryKey) {
  if (!queryKey) return true;
  const hay = normalizeSearchKey([
    rest.name,
    rest.restaurantName,
    rest.city,
    rest.ownerName,
    rest.ownerEmail,
    rest.phone,
    rest.instagram,
    rest.insta
  ].filter(Boolean).join(" "));
  return hay.includes(queryKey);
}

function leadBelongsToScope(lead, scope = state.leads.scope) {
  const safeScope = normalizeLeadScopeKey(scope);
  const statusKey = normalizeLeadStatusKey(lead?.status || "");
  if (statusKey === "kunde") return false;
  if (safeScope === "archived") return statusKey === "no_interest";
  if (statusKey === "no_interest") return false;
  return safeScope === "own" ? isCurrentCeoOwnRow(lead) : !isCurrentCeoOwnRow(lead);
}

function customerBelongsToScope(customer, scope = state.customers.scope) {
  const safeScope = normalizeCustomerScopeKey(scope);
  if (!isCustomerRestaurant(customer)) return false;
  return safeScope === "own" ? isCurrentCeoOwnRow(customer) : !isCurrentCeoOwnRow(customer);
}

async function fetchLeadScopeRows(scope, desiredCount) {
  const current = getCurrentCeoMeta();
  const safeScope = normalizeLeadScopeKey(scope);
  if (!current.uid) return [];
  const leadRef = collection(db, "leads");
  const restaurantRef = collection(db, "restaurants");
  const fetchLimit = Math.min(Math.max((Number(desiredCount) || CRM_PAGE_SIZE) * (safeScope === "own" ? 3 : 4), CRM_PAGE_SIZE + 1), 160);
  const leadQueries = [];
  const restaurantQueries = [];

  if (safeScope === "own") {
    leadQueries.push(query(leadRef, where("createdByUid", "==", current.uid), limit(fetchLimit)));
    restaurantQueries.push(query(restaurantRef, where("createdByUid", "==", current.uid), limit(fetchLimit)));
  } else {
    leadQueries.push(query(leadRef, where("ceoPath", "array-contains", current.uid), limit(fetchLimit)));
    restaurantQueries.push(query(restaurantRef, where("ceoPath", "array-contains", current.uid), limit(fetchLimit)));
    if (hasGlobalCeoAccess()) {
      leadQueries.push(query(leadRef, limit(fetchLimit)));
      restaurantQueries.push(query(restaurantRef, limit(fetchLimit)));
    }
  }

  const [leadSnaps, restaurantSnaps] = await Promise.all([
    Promise.all(leadQueries.map((ref) => getDocs(ref).catch(() => null))),
    Promise.all(restaurantQueries.map((ref) => getDocs(ref).catch(() => null)))
  ]);
  const leadMap = new Map();
  leadSnaps.forEach((snap) => {
    if (!snap?.docs?.length) return;
    snap.docs.forEach((docSnap) => {
      leadMap.set(docSnap.id, normalizeLeadDoc({ id: docSnap.id, ...(docSnap.data() || {}) }));
    });
  });
  const restaurantMap = new Map();
  restaurantSnaps.forEach((snap) => {
    if (!snap?.docs?.length) return;
    snap.docs.forEach((docSnap) => {
      restaurantMap.set(docSnap.id, { id: docSnap.id, ...(docSnap.data() || {}) });
    });
  });

  const storedLeads = Array.from(leadMap.values());
  const byRestaurant = new Map();
  const byId = new Map();
  storedLeads.forEach((lead) => {
    if (lead?.restaurantId) byRestaurant.set(String(lead.restaurantId), true);
    if (lead?.id) byId.set(String(lead.id), true);
  });

  const restaurantRows = Array.from(restaurantMap.values());
  if (restaurantRows.length) {
    state.restaurants = mergeRestaurants(state.restaurants, restaurantRows);
    rebuildBusinessLocations();
  }
  const derivedLeads = restaurantRows
    .filter((rest) => isRestaurantLeadCandidate(rest))
    .map((rest) => normalizeLeadFromRestaurant(rest))
    .filter((lead) => lead && (!lead.restaurantId || !byRestaurant.has(String(lead.restaurantId))) && (!lead.id || !byId.has(String(lead.id))));

  const rows = [...storedLeads, ...derivedLeads]
    .filter((lead) => canCurrentCeoSeeRow(lead))
    .filter((lead) => normalizeLeadStatusKey(lead.status) !== "kunde")
    .filter((lead) => {
      const statusKey = normalizeLeadStatusKey(lead.status);
      if (safeScope === "archived") return statusKey === "no_interest";
      if (statusKey === "no_interest") return false;
      return safeScope === "own" ? isCurrentCeoOwnRow(lead) : !isCurrentCeoOwnRow(lead);
    })
    .sort((a, b) => (toDateSafe(b.createdAt)?.getTime() || 0) - (toDateSafe(a.createdAt)?.getTime() || 0));

  return rows;
}

async function fetchCustomerScopeRows(scope, desiredCount) {
  const current = getCurrentCeoMeta();
  const safeScope = normalizeCustomerScopeKey(scope);
  if (!current.uid) return [];
  const baseRef = collection(db, "restaurants");
  const fetchLimit = Math.min(Math.max((Number(desiredCount) || CRM_PAGE_SIZE) * (safeScope === "own" ? 3 : 4), CRM_PAGE_SIZE + 1), 160);
  const queryRefs = [];

  if (safeScope === "own") {
    queryRefs.push(query(baseRef, where("createdByUid", "==", current.uid), limit(fetchLimit)));
  } else {
    queryRefs.push(query(baseRef, where("ceoPath", "array-contains", current.uid), limit(fetchLimit)));
    if (hasGlobalCeoAccess()) {
      queryRefs.push(query(baseRef, limit(fetchLimit)));
    }
  }

  const snaps = await Promise.all(queryRefs.map((ref) => getDocs(ref).catch(() => null)));
  const rowMap = new Map();
  snaps.forEach((snap) => {
    if (!snap?.docs?.length) return;
    snap.docs.forEach((docSnap) => {
      rowMap.set(docSnap.id, { id: docSnap.id, ...(docSnap.data() || {}) });
    });
  });

  const rows = Array.from(rowMap.values())
    .filter((row) => isCustomerRestaurant(row))
    .filter((row) => canCurrentCeoSeeRow(row))
    .filter((row) => customerBelongsToScope(row, safeScope))
    .sort((a, b) => (toDateSafe(b.createdAt)?.getTime() || 0) - (toDateSafe(a.createdAt)?.getTime() || 0));

  return rows;
}

function refreshCustomersFromRestaurants() {
  const scope = normalizeCustomerScopeKey(state.customers.scope);
  const size = Math.max(CRM_PAGE_SIZE, Number(state.customers.pageSize?.[scope]) || CRM_PAGE_SIZE);
  const currentUid = String(state.user?.uid || "").trim();
  const list = Array.isArray(state.restaurants)
    ? state.restaurants.filter((rest) => (
      isCustomerRestaurant(rest)
      && (isCeoUser() ? isOwnedByVisibleCeoTeam(rest) : true)
    ))
      .filter((rest) => customerBelongsToScope(rest, scope))
    : [];
  list.sort((a, b) => (toDateSafe(b.createdAt)?.getTime() || 0) - (toDateSafe(a.createdAt)?.getTime() || 0));
  state.customers.pages = {
    ...state.customers.pages,
    [scope]: list.slice(0, size)
  };
  state.customers.hasMore = {
    ...state.customers.hasMore,
    [scope]: list.length > size
  };
  state.customers.loaded = {
    ...state.customers.loaded,
    [scope]: true
  };
  state.customers.items = state.customers.pages[scope].slice();
  writeCustomerScopeCache(currentUid, scope, state.customers.pages[scope], {
    hasMore: state.customers.hasMore?.[scope] || false,
    knownCount: Array.isArray(list) ? list.length : 0,
    countExact: true,
    pageSize: size
  });
}

function syncVisibleLeadPageFromItems() {
  const scope = normalizeLeadScopeKey(state.leads.scope);
  const size = Math.max(CRM_PAGE_SIZE, Number(state.leads.pageSize?.[scope]) || CRM_PAGE_SIZE);
  const currentUid = String(state.user?.uid || "").trim();
  const sourceItems = Array.isArray(state.leads.items) ? state.leads.items.slice() : [];
  const nextItems = sourceItems.slice(0, size);
  state.leads.pages = {
    ...state.leads.pages,
    [scope]: nextItems
  };
  state.leads.hasMore = {
    ...state.leads.hasMore,
    [scope]: !!state.leads.hasMore?.[scope] || sourceItems.length > size
  };
  state.leads.loaded = {
    ...state.leads.loaded,
    [scope]: true
  };
  writeLeadScopeCache(currentUid, scope, nextItems, {
    hasMore: state.leads.hasMore?.[scope] || sourceItems.length > size,
    knownCount: sourceItems.length,
    countExact: !(state.leads.hasMore?.[scope] || sourceItems.length > size),
    pageSize: size
  });
}

async function loadLeads({ scope = state.leads.scope, grow = false } = {}) {
  if (!isCeoUser()) return;
  if (!hasStoredCeoCrmCounts(state.userProfile?.crmCounts) && !ceoCrmCountsPromise) {
    void ensureCeoCrmCountsLoaded();
  }
  const safeScope = normalizeLeadScopeKey(scope);
  const currentUid = String(state.user?.uid || "").trim();
  const currentSize = Math.max(CRM_PAGE_SIZE, Number(state.leads.pageSize?.[safeScope]) || CRM_PAGE_SIZE);
  const nextSize = grow ? currentSize + CRM_PAGE_SIZE : currentSize;
  const fetchLimit = Math.min(Math.max(nextSize * (safeScope === "own" ? 3 : 4), CRM_PAGE_SIZE + 1), 160);
  if (!grow && !state.leads.loaded?.[safeScope] && currentUid) {
    const cached = readLeadScopeCache(currentUid, safeScope);
    if (cached?.fresh && Array.isArray(cached.data)) {
      const cachedRows = cached.data.map((row) => normalizeLeadDoc(row));
      const cachedPageSize = Math.max(nextSize, Number(cached.meta?.pageSize) || cachedRows.length || nextSize);
      state.leads.scope = safeScope;
      state.leads.pageSize = {
        ...state.leads.pageSize,
        [safeScope]: cachedPageSize
      };
      state.leads.pages = {
        ...state.leads.pages,
        [safeScope]: cachedRows.slice(0, cachedPageSize)
      };
      state.leads.loaded = {
        ...state.leads.loaded,
        [safeScope]: true
      };
      state.leads.hasMore = {
        ...state.leads.hasMore,
        [safeScope]: !!cached.meta?.hasMore
      };
      state.leads.knownCount = {
        ...state.leads.knownCount,
        [safeScope]: Math.max(cachedRows.length, Number(cached.meta?.knownCount) || 0)
      };
      state.leads.countExact = {
        ...state.leads.countExact,
        [safeScope]: cached.meta?.countExact !== false
      };
      state.leads.items = state.leads.pages[safeScope].slice();
      state.leads.loading = false;
      state.leads.loadingMore = false;
      state.leads.error = "";
      render();
      return;
    }
  }
  state.leads.scope = safeScope;
  state.leads.pageSize = {
    ...state.leads.pageSize,
    [safeScope]: nextSize
  };
  state.leads.loading = !grow;
  state.leads.loadingMore = !!grow;
  if (!grow) state.leads.error = "";
  render();
  try {
    const rows = await fetchLeadScopeRows(safeScope, nextSize);
    const nextItems = rows.slice(0, nextSize);
    state.leads.pages = {
      ...state.leads.pages,
      [safeScope]: nextItems
    };
    state.leads.loaded = {
      ...state.leads.loaded,
      [safeScope]: true
    };
    state.leads.hasMore = {
      ...state.leads.hasMore,
      [safeScope]: rows.length > nextSize
    };
    state.leads.knownCount = {
      ...state.leads.knownCount,
      [safeScope]: rows.length
    };
    state.leads.countExact = {
      ...state.leads.countExact,
      [safeScope]: rows.length < fetchLimit
    };
    state.leads.items = nextItems.slice();
    state.leads.error = "";
    writeLeadScopeCache(currentUid, safeScope, nextItems, {
      hasMore: rows.length > nextSize,
      knownCount: rows.length,
      countExact: rows.length < fetchLimit,
      pageSize: nextSize
    });
  } catch (err) {
    console.error(err);
    state.leads.error = "Leads laden fehlgeschlagen.";
  } finally {
    state.leads.loading = false;
    state.leads.loadingMore = false;
    render();
  }
}

async function loadCustomers({ scope = state.customers.scope, grow = false } = {}) {
  if (!isCeoUser()) return;
  if (!hasStoredCeoCrmCounts(state.userProfile?.crmCounts) && !ceoCrmCountsPromise) {
    void ensureCeoCrmCountsLoaded();
  }
  const safeScope = normalizeCustomerScopeKey(scope);
  const currentUid = String(state.user?.uid || "").trim();
  const currentSize = Math.max(CRM_PAGE_SIZE, Number(state.customers.pageSize?.[safeScope]) || CRM_PAGE_SIZE);
  const nextSize = grow ? currentSize + CRM_PAGE_SIZE : currentSize;
  const fetchLimit = Math.min(Math.max(nextSize * (safeScope === "own" ? 3 : 4), CRM_PAGE_SIZE + 1), 160);
  if (!grow && !state.customers.loaded?.[safeScope] && currentUid) {
    const cached = readCustomerScopeCache(currentUid, safeScope);
    if (cached?.fresh && Array.isArray(cached.data)) {
      const cachedRows = cached.data.slice();
      const cachedPageSize = Math.max(nextSize, Number(cached.meta?.pageSize) || cachedRows.length || nextSize);
      if (cachedRows.length) {
        state.restaurants = mergeRestaurants(state.restaurants, cachedRows);
        rebuildBusinessLocations();
      }
      state.customers.scope = safeScope;
      state.customers.pageSize = {
        ...state.customers.pageSize,
        [safeScope]: cachedPageSize
      };
      state.customers.pages = {
        ...state.customers.pages,
        [safeScope]: cachedRows.slice(0, cachedPageSize)
      };
      state.customers.loaded = {
        ...state.customers.loaded,
        [safeScope]: true
      };
      state.customers.hasMore = {
        ...state.customers.hasMore,
        [safeScope]: !!cached.meta?.hasMore
      };
      state.customers.knownCount = {
        ...state.customers.knownCount,
        [safeScope]: Math.max(cachedRows.length, Number(cached.meta?.knownCount) || 0)
      };
      state.customers.countExact = {
        ...state.customers.countExact,
        [safeScope]: cached.meta?.countExact !== false
      };
      state.customers.items = state.customers.pages[safeScope].slice();
      state.customers.loading = false;
      state.customers.loadingMore = false;
      state.customers.error = "";
      render();
      return;
    }
  }
  state.customers.scope = safeScope;
  state.customers.pageSize = {
    ...state.customers.pageSize,
    [safeScope]: nextSize
  };
  state.customers.loading = !grow;
  state.customers.loadingMore = !!grow;
  if (!grow) state.customers.error = "";
  render();
  try {
    const rows = await fetchCustomerScopeRows(safeScope, nextSize);
    if (rows.length) {
      state.restaurants = mergeRestaurants(state.restaurants, rows);
      rebuildBusinessLocations();
    }
    const nextItems = rows.slice(0, nextSize);
    state.customers.pages = {
      ...state.customers.pages,
      [safeScope]: nextItems
    };
    state.customers.loaded = {
      ...state.customers.loaded,
      [safeScope]: true
    };
    state.customers.hasMore = {
      ...state.customers.hasMore,
      [safeScope]: rows.length > nextSize
    };
    state.customers.knownCount = {
      ...state.customers.knownCount,
      [safeScope]: rows.length
    };
    state.customers.countExact = {
      ...state.customers.countExact,
      [safeScope]: rows.length < fetchLimit
    };
    state.customers.items = nextItems.slice();
    state.customers.error = "";
    writeCustomerScopeCache(currentUid, safeScope, nextItems, {
      hasMore: rows.length > nextSize,
      knownCount: rows.length,
      countExact: rows.length < fetchLimit,
      pageSize: nextSize
    });
  } catch (err) {
    console.error(err);
    state.customers.error = "Kunden laden fehlgeschlagen.";
  } finally {
    state.customers.loading = false;
    state.customers.loadingMore = false;
    render();
  }
}

async function ensureCeoStaffIndexLoaded() {
  if (!isCeoUser()) return;
  if (ceoStaffLoadPromise) {
    await ceoStaffLoadPromise;
  } else if (!(dataLoaded.staff && !state.staff.error)) {
    await loadCeoStaff();
  }
  await reconcileKnownLegacyOwnership();
}

async function fetchCeoScopedRows(collectionName, { maxDocs = 200 } = {}) {
  if (!isCeoUser()) return [];
  const current = getCurrentCeoMeta();
  if (!current.uid) return [];
  const baseRef = collection(db, collectionName);
  const teamUids = getVisibleCeoTeamUids();
  const queryRefs = [
    query(baseRef, where("ceoPath", "array-contains", current.uid), limit(maxDocs))
  ];
  if (hasGlobalCeoAccess()) {
    queryRefs.push(query(baseRef, limit(maxDocs)));
  }
  chunkStringList(teamUids, 10).forEach((uids) => {
    if (!uids.length) return;
    queryRefs.push(query(baseRef, where("createdByUid", "in", uids), limit(maxDocs)));
  });
  if (collectionName === "leads") {
    chunkStringList(MILAN_OWNED_LEAD_EMAILS, 10).forEach((emails) => {
      if (!emails.length) return;
      queryRefs.push(query(baseRef, where("email", "in", emails), limit(maxDocs)));
    });
  }
  if (collectionName === "restaurants") {
    chunkStringList(MILAN_OWNED_LEAD_EMAILS, 10).forEach((emails) => {
      if (!emails.length) return;
      queryRefs.push(query(baseRef, where("ownerEmail", "in", emails), limit(maxDocs)));
    });
  }
  const snaps = await Promise.all(queryRefs.map((ref) => getDocs(ref).catch(() => null)));
  const rowMap = new Map();
  snaps.forEach((snap) => {
    if (!snap?.docs?.length) return;
    snap.docs.forEach((docSnap) => {
      rowMap.set(docSnap.id, { id: docSnap.id, ...(docSnap.data() || {}) });
    });
  });
  return Array.from(rowMap.values());
}

function isHiddenLegacyCeoEmail(email = "") {
  return HIDDEN_LEGACY_CEO_EMAILS.includes(normalizeEmailValue(email));
}

function resolveKnownLeadOwnerMeta(entity = {}) {
  const email = normalizeEmailValue(entity.email || entity.ownerEmail || entity.socialEmail || "");
  const businessKey = normalizeSearchKey(entity.businessName || entity.name || entity.restaurantName || "");
  const creatorUid = String(entity.createdByUid || "").trim();
  const hasStoredMeta = !!String(entity.createdByUid || "").trim() || normalizeCeoPath(entity.ceoPath).length > 0;
  let targetHandle = "";
  let targetName = "";

  if (MILAN_OWNED_LEAD_EMAILS.includes(email) || MILAN_OWNED_LEAD_BUSINESSES.includes(businessKey)) {
    targetHandle = "milannikolic";
    targetName = "Milan Nikolic";
  } else if (ALBERT_OWNED_LEAD_EMAILS.includes(email) || ALBERT_OWNED_LEAD_BUSINESSES.includes(businessKey)) {
    targetHandle = "alberthoti";
    targetName = "Albert Hoti";
  } else if (creatorUid && hiddenLegacyCeoUids.includes(creatorUid) && isAlbertCeoUser()) {
    return buildCeoCreatorMeta();
  } else if (!hasStoredMeta && isAlbertCeoUser()) {
    return buildCeoCreatorMeta();
  }

  if (!targetHandle) return null;

  const normalizedTargetHandle = normalizeHandle(targetHandle);
  const currentHandle = normalizeHandle(state.userProfile.handle || state.userProfile.name || state.user?.displayName || "");
  if (currentHandle && currentHandle === normalizedTargetHandle) {
    const selfMeta = buildCeoCreatorMeta();
    return {
      ...selfMeta,
      createdByName: selfMeta.createdByName || targetName,
      createdByHandle: state.userProfile.handle || normalizedTargetHandle
    };
  }

  const staffEntry = (Array.isArray(state.staff.items) ? state.staff.items : []).find((item) => (
    normalizeHandle(item.handle || item.name || "") === normalizedTargetHandle
  ));
  if (!staffEntry) return null;

  const ceoPath = normalizeCeoPath(staffEntry.ceoPath, [staffEntry.ceoRootUid, staffEntry.ceoParentUid, staffEntry.uid]);
  return {
    createdByUid: String(staffEntry.uid || "").trim(),
    createdByRole: "ceo",
    createdByName: staffEntry.name || targetName,
    createdByHandle: staffEntry.handle || normalizedTargetHandle,
    ceoRootUid: String(staffEntry.ceoRootUid || ceoPath[0] || staffEntry.uid || "").trim(),
    ceoRootName: String(staffEntry.ceoRootName || "").trim(),
    ceoParentUid: String(staffEntry.ceoParentUid || "").trim(),
    ceoPath
  };
}

function applyKnownLeadOwnershipOverride(entity = {}) {
  const meta = resolveKnownLeadOwnerMeta(entity);
  return meta ? { ...entity, ...meta } : entity;
}

function hasMatchingOwnerMeta(row = {}, meta = {}) {
  const currentPath = normalizeCeoPath(row.ceoPath, [row.ceoRootUid, row.ceoParentUid, row.createdByUid]);
  const nextPath = normalizeCeoPath(meta.ceoPath, [meta.ceoRootUid, meta.ceoParentUid, meta.createdByUid]);
  if (String(row.createdByUid || "").trim() !== String(meta.createdByUid || "").trim()) return false;
  if (String(row.createdByHandle || "").trim() !== String(meta.createdByHandle || "").trim()) return false;
  if (String(row.ceoRootUid || "").trim() !== String(meta.ceoRootUid || "").trim()) return false;
  if (String(row.ceoParentUid || "").trim() !== String(meta.ceoParentUid || "").trim()) return false;
  if (currentPath.length !== nextPath.length) return false;
  return currentPath.every((value, index) => value === nextPath[index]);
}

async function reconcileKnownLegacyOwnership() {
  if (!isCeoUser() || !hasGlobalCeoAccess()) return;
  if (ceoOwnershipReconciled) return;
  if (ceoOwnershipReconcilePromise) {
    await ceoOwnershipReconcilePromise;
    return;
  }
  ceoOwnershipReconcilePromise = (async () => {
    try {
      const knownEmails = uniqueStringList([
        ...MILAN_OWNED_LEAD_EMAILS,
        ...ALBERT_OWNED_LEAD_EMAILS
      ]);
      const leadPromises = chunkStringList(knownEmails, 10).map(async (emails) => {
        const snap = await getDocs(query(collection(db, "leads"), where("email", "in", emails), limit(20)));
        const writes = snap.docs.map((docSnap) => {
          const row = { id: docSnap.id, ...(docSnap.data() || {}) };
          const meta = resolveKnownLeadOwnerMeta(row);
          if (!meta || hasMatchingOwnerMeta(row, meta)) return null;
          return setDoc(doc(db, "leads", docSnap.id), {
            ...meta,
            updatedAt: serverTimestamp()
          }, { merge: true });
        }).filter(Boolean);
        if (writes.length) await Promise.all(writes);
      });
      const restaurantPromises = chunkStringList(knownEmails, 10).map(async (emails) => {
        const snap = await getDocs(query(collection(db, "restaurants"), where("ownerEmail", "in", emails), limit(20)));
        const writes = snap.docs.map((docSnap) => {
          const row = { id: docSnap.id, ...(docSnap.data() || {}) };
          const meta = resolveKnownLeadOwnerMeta(row);
          if (!meta || hasMatchingOwnerMeta(row, meta)) return null;
          return setDoc(doc(db, "restaurants", docSnap.id), {
            ...meta,
            updatedAt: serverTimestamp()
          }, { merge: true });
        }).filter(Boolean);
        if (writes.length) await Promise.all(writes);
      });
      await Promise.all([...leadPromises, ...restaurantPromises]);
      if (LEGACY_CEO_DELETE_UIDS.length) {
        await Promise.all(LEGACY_CEO_DELETE_UIDS.map(async (uid) => {
          await Promise.all([
            deleteDoc(doc(db, "superadmins", uid)).catch(() => {}),
            deleteDoc(doc(db, "users", uid)).catch(() => {})
          ]);
          state.staff.items = (state.staff.items || []).filter((item) => String(item.uid || "") !== uid);
          hiddenLegacyCeoUids = hiddenLegacyCeoUids.filter((value) => value !== uid);
        }));
      }
      ceoOwnershipReconciled = true;
    } catch (err) {
      console.error(err);
    } finally {
      ceoOwnershipReconcilePromise = null;
    }
  })();
  await ceoOwnershipReconcilePromise;
}

function createEmptyStaffForm() {
  return {
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    country: normalizeCeoCountry(state.userProfile?.country || CEO_COUNTRIES[0]),
    locationLabel: "",
    coords: null,
    avatarUrl: "",
    avatarPreview: "",
    avatarFile: null
  };
}

function buildStaffAccountEmail(firstName = "", lastName = "", fallback = "") {
  const toEmailLocal = (value) => String(value || "")
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/_/g, "")
    .replace(/[^a-z0-9]/g, "");
  const localPart = toEmailLocal(`${firstName || ""}${lastName || ""}`) || toEmailLocal(fallback || "");
  return localPart ? `${localPart}@menyra.com` : "";
}

function getStaffFormEmail(form = state.staff.form, { preferStored = false } = {}) {
  const safeForm = form || {};
  const stored = normalizeEmailValue(safeForm.email || "");
  if (preferStored && stored) return stored;
  return buildStaffAccountEmail(safeForm.firstName || "", safeForm.lastName || "", safeForm.name || stored.split("@")[0] || "");
}

function syncStaffDerivedEmailField() {
  if (!state.staff.editorUid) {
    state.staff.form = {
      ...state.staff.form,
      email: getStaffFormEmail(state.staff.form)
    };
  }
  const input = document.getElementById("staffEmail");
  if (input instanceof HTMLInputElement) {
    input.value = getStaffFormEmail(state.staff.form, { preferStored: !!state.staff.editorUid });
  }
}

function openStaffEditor(mode = "create", entry = null) {
  if (!isCeoUser()) return;
  if (mode === "edit" && entry) {
    const fallbackParts = String(entry.name || "").trim().split(/\s+/).filter(Boolean);
    const firstName = String(entry.firstName || fallbackParts[0] || "").trim();
    const lastName = String(entry.lastName || fallbackParts.slice(1).join(" ") || "").trim();
    const coords = Number.isFinite(Number(entry.gpsLat ?? entry.lat)) && Number.isFinite(Number(entry.gpsLng ?? entry.lng))
      ? { lat: Number(entry.gpsLat ?? entry.lat), lng: Number(entry.gpsLng ?? entry.lng) }
      : null;
    const avatarUrl = String(entry.avatarUrl || entry.avatar || "").trim();
    state.staff = {
      ...state.staff,
      view: "form",
      editorUid: String(entry.uid || entry.userId || entry.id || "").trim(),
      saving: false,
      deleting: false,
      error: "",
      status: "",
      form: {
        firstName,
        lastName,
        email: normalizeEmailValue(entry.email || buildStaffAccountEmail(firstName, lastName, entry.name || "")),
        password: "",
        country: normalizeCeoCountry(entry.country),
        locationLabel: String(entry.locationLabel || entry.location || entry.city || "").trim(),
        coords,
        avatarUrl,
        avatarPreview: avatarUrl,
        avatarFile: null
      }
    };
  } else {
    state.staff = {
      ...state.staff,
      view: "form",
      editorUid: "",
      saving: false,
      deleting: false,
      error: "",
      status: "",
      form: createEmptyStaffForm()
    };
  }
  render();
}

function closeStaffEditor(status = "") {
  state.staff = {
    ...state.staff,
    view: "list",
    editorUid: "",
    saving: false,
    deleting: false,
    status,
    form: createEmptyStaffForm()
  };
}

function syncStaffFormFromDom() {
  const read = (id) => {
    const node = document.getElementById(id);
    return node ? String(node.value || "") : "";
  };
  const nextCoords = state.staff.form.coords && Number.isFinite(Number(state.staff.form.coords.lat)) && Number.isFinite(Number(state.staff.form.coords.lng))
    ? { lat: Number(state.staff.form.coords.lat), lng: Number(state.staff.form.coords.lng) }
    : null;
  const nextForm = {
    ...state.staff.form,
    firstName: read("staffFirstName").trim(),
    lastName: read("staffLastName").trim(),
    password: read("staffPassword"),
    country: normalizeCeoCountry(read("staffCountry")),
    locationLabel: read("staffLocationLabel").trim(),
    coords: nextCoords
  };
  nextForm.email = getStaffFormEmail(nextForm, { preferStored: !!state.staff.editorUid });
  state.staff.form = nextForm;
}

function resetStaffForm(status = "") {
  closeStaffEditor(status);
}

async function loadCeoStaff({ grow = false } = {}) {
  if (!isCeoUser()) return;
  if (ceoStaffLoadPromise) return ceoStaffLoadPromise;
  ceoStaffLoadPromise = (async () => {
    const currentSize = Math.max(CRM_PAGE_SIZE, Number(state.staff.pageSize) || CRM_PAGE_SIZE);
    const nextSize = grow ? currentSize + CRM_PAGE_SIZE : currentSize;
    state.staff.pageSize = nextSize;
    state.staff.loading = !grow;
    state.staff.loadingMore = !!grow;
    if (!grow) state.staff.error = "";
    render();
    try {
      const current = getCurrentCeoMeta();
      const staffRef = collection(db, "superadmins");
      const staffQueries = [
        query(staffRef, where("ceoPath", "array-contains", current.uid), limit(nextSize + 1)),
        query(staffRef, where("ceoParentUid", "==", current.uid), limit(nextSize + 1))
      ];
      if (hasGlobalCeoAccess()) {
        staffQueries.push(query(staffRef, limit(nextSize + 1)));
      }
      const staffSnaps = await Promise.all(staffQueries.map((ref) => getDocs(ref).catch(() => null)));
      const rowMap = new Map();
      staffSnaps.forEach((snap) => {
        if (!snap?.docs?.length) return;
        snap.docs.forEach((docSnap) => {
          rowMap.set(docSnap.id, { id: docSnap.id, ...(docSnap.data() || {}) });
        });
      });
      hiddenLegacyCeoUids = uniqueStringList(Array.from(rowMap.values())
        .filter((row) => isHiddenLegacyCeoEmail(row.email || row.loginEmail || row.ownerEmail || ""))
        .map((row) => String(row.uid || row.userId || row.id || "").trim()));
      let items = Array.from(rowMap.values()).map((row) => normalizeCeoStaffRecord(row));
      items = items.filter((item) => canViewCeoRecord(item) && String(item.uid || "") !== String(current.uid || ""));
      items = items.filter((item) => !isHiddenLegacyCeoEmail(item.email || ""));
      items = await hydrateStaffRecordsFromUserProfiles(items, { syncDirectory: true });
      items = items.sort((a, b) => {
        const ta = toDateSafe(a.createdAt)?.getTime() || 0;
        const tb = toDateSafe(b.createdAt)?.getTime() || 0;
        if (tb !== ta) return tb - ta;
        return String(a.name || "").localeCompare(String(b.name || ""));
      });
      dataLoaded.staff = true;
      state.staff.hasMore = items.length > nextSize;
      state.staff.items = items.slice(0, nextSize);
      state.staff.error = "";
      if (!ceoCrmCountsPromise && (
        !hasStoredCeoCrmCounts(state.userProfile?.crmCounts)
        || state.staff.items.some((item) => !hasStoredCeoCrmCounts(item?.crmCounts || {}))
      )) {
        void ensureCeoCrmCountsLoaded();
      }
    } catch (err) {
      console.error(err);
      state.staff.error = "Staff laden fehlgeschlagen.";
    } finally {
      state.staff.loading = false;
      state.staff.loadingMore = false;
      render();
    }
  })();
  try {
    return await ceoStaffLoadPromise;
  } finally {
    ceoStaffLoadPromise = null;
  }
}

async function saveCeoStaffFromView() {
  if (!state.user || !isCeoUser()) return;
  syncStaffFormFromDom();
  const form = state.staff.form || {};
  const isEditing = !!state.staff.editorUid;
  const existingEntry = isEditing
    ? (state.staff.items || []).find((item) => String(item.uid || "") === String(state.staff.editorUid || ""))
    : null;
  const firstName = String(form.firstName || "").trim();
  const lastName = String(form.lastName || "").trim();
  const email = getStaffFormEmail(form, { preferStored: isEditing });
  const password = String(form.password || "");
  const country = normalizeCeoCountry(form.country);
  const locationLabel = String(form.locationLabel || "").trim() || country;
  const coords = form.coords && Number.isFinite(Number(form.coords.lat)) && Number.isFinite(Number(form.coords.lng))
    ? { lat: Number(form.coords.lat), lng: Number(form.coords.lng) }
    : null;
  const name = buildCeoName({ firstName, lastName, email });
  if (!firstName || !lastName || !email || (!isEditing && !password)) {
    state.staff.status = isEditing
      ? "Vorname, Nachname und Email sind erforderlich."
      : "Vorname, Nachname, Email und Passwort sind erforderlich.";
    render();
    return;
  }
  if (!coords) {
    state.staff.status = "Standort mit Pin waehlen.";
    render();
    return;
  }

  const current = getCurrentCeoMeta();
  state.staff.saving = true;
  state.staff.deleting = false;
  state.staff.status = isEditing ? "CEO wird gespeichert..." : "CEO Staff wird erstellt...";
  render();

  try {
    let uid = String(state.staff.editorUid || "").trim();
    if (!isEditing) {
      const authUser = await createAuthUser(email, password);
      uid = String(authUser?.uid || "").trim();
      if (!uid) throw new Error("Account konnte nicht erstellt werden.");
    }
    let avatarUrl = String(form.avatarUrl || "").trim();
    if (form.avatarFile && uid) {
      const { cdnUrl } = await uploadCompressedImage(
        form.avatarFile,
        uid,
        { maxSize: 512, quality: 0.82, mimeType: "image/jpeg" }
      );
      avatarUrl = cdnUrl || avatarUrl;
    }
    const ceoParentUid = String(existingEntry?.ceoParentUid || current.uid || "").trim();
    const ceoParentName = String(
      existingEntry?.ceoParentName
      || ((ceoParentUid && ceoParentUid === current.uid) ? current.name : "")
      || ""
    ).trim();
    const ceoRootUid = String(existingEntry?.ceoRootUid || current.rootUid || current.uid || uid).trim() || uid;
    const ceoRootName = String(existingEntry?.ceoRootName || current.rootName || current.name || name).trim() || name;
    const ceoPath = isEditing
      ? normalizeCeoPath(existingEntry?.ceoPath, [ceoRootUid, ceoParentUid, uid])
      : uniqueStringList([...(current.path || []), uid]);
    const handle = normalizeHandle(`${firstName}${lastName}`) || normalizeHandle(name) || "ceo";
    const superadminPayload = {
      uid,
      userId: uid,
      firstName,
      lastName,
      name,
      displayName: name,
      email,
      handle,
      role: "ceo",
      roles: ["ceo"],
      status: "active",
      avatarUrl,
      avatar: avatarUrl,
      country,
      locationLabel,
      city: locationLabel,
      lat: coords.lat,
      lng: coords.lng,
      gpsLat: coords.lat,
      gpsLng: coords.lng,
      ceoParentUid,
      ceoParentName,
      ceoRootUid,
      ceoRootName,
      ceoPath,
      createdByUid: String(existingEntry?.createdByUid || current.uid || "").trim(),
      createdByRole: String(existingEntry?.createdByRole || "ceo").trim() || "ceo",
      createdByName: String(existingEntry?.createdByName || current.name || "").trim(),
      crmCounts: existingEntry?.crmCounts && typeof existingEntry.crmCounts === "object" ? existingEntry.crmCounts : {},
      updatedAt: serverTimestamp()
    };
    if (!isEditing) superadminPayload.createdAt = serverTimestamp();
    await setDoc(doc(db, "superadmins", uid), superadminPayload, { merge: true });
    const userPayload = {
      displayName: name,
      name,
      firstName,
      lastName,
      email,
      handle,
      avatarUrl,
      avatar: avatarUrl,
      city: locationLabel,
      location: locationLabel,
      address: locationLabel,
      country,
      role: "ceo",
      roles: ["ceo"],
      ceoParentUid,
      ceoParentName,
      ceoRootUid,
      ceoRootName,
      ceoPath,
      crmCounts: existingEntry?.crmCounts && typeof existingEntry.crmCounts === "object" ? existingEntry.crmCounts : createEmptyCeoCrmCounts(),
      lat: coords.lat,
      lng: coords.lng,
      gpsLat: coords.lat,
      gpsLng: coords.lng,
      updatedAt: serverTimestamp()
    };
    if (!isEditing) {
      userPayload.bio = "";
      userPayload.createdAt = serverTimestamp();
    }
    await setDoc(doc(db, "users", uid), userPayload, { merge: true });
    if (String(uid) === String(state.user.uid || "")) {
      state.userProfile = {
        ...state.userProfile,
        uid,
        name,
        displayName: name,
        firstName,
        lastName,
        email,
        handle,
        avatar: avatarUrl || state.userProfile.avatar,
        avatarUrl: avatarUrl || state.userProfile.avatar,
        location: locationLabel,
        address: locationLabel,
        city: locationLabel,
        country,
        role: "ceo",
        roles: ["ceo"],
        crmCounts: sanitizeCeoCrmCounts(state.userProfile?.crmCounts || existingEntry?.crmCounts || {}),
        ceoParentUid,
        ceoParentName,
        ceoRootUid,
        ceoRootName,
        ceoPath,
        lat: coords.lat,
        lng: coords.lng,
        gpsLat: coords.lat,
        gpsLng: coords.lng
      };
      saveUserProfileToStorage();
    }
    resetStaffForm(isEditing ? "CEO gespeichert." : "CEO Staff erstellt.");
    await loadCeoStaff();
  } catch (err) {
    console.error(err);
    state.staff.status = err?.message || (isEditing ? "CEO konnte nicht gespeichert werden." : "CEO Staff konnte nicht erstellt werden.");
    state.staff.saving = false;
    state.staff.deleting = false;
    render();
  }
}

async function deleteCeoStaffFromView() {
  if (!state.user || !isCeoUser()) return;
  const uid = String(state.staff.editorUid || "").trim();
  if (!uid) return;
  if (uid === String(state.user.uid || "")) {
    state.staff.status = "Du kannst deinen eigenen CEO hier nicht loeschen.";
    render();
    return;
  }
  const entry = (state.staff.items || []).find((item) => String(item.uid || "") === uid);
  const label = entry?.name || "diesen CEO";
  if (!confirm(`Willst du ${label} wirklich loeschen?`)) return;

  state.staff.deleting = true;
  state.staff.saving = false;
  state.staff.status = "CEO wird geloescht...";
  render();

  try {
    await Promise.all([
      deleteDoc(doc(db, "superadmins", uid)),
      deleteDoc(doc(db, "users", uid))
    ]);
    resetStaffForm("CEO Staff geloescht.");
    await loadCeoStaff();
  } catch (err) {
    console.error(err);
    state.staff.status = err?.message || "CEO Staff konnte nicht geloescht werden.";
    state.staff.deleting = false;
    render();
  }
}

function readLeadModalLocationsFromForm() {
  const inputs = Array.from(document.querySelectorAll("[data-lead-location-address]"));
  if (!inputs.length) {
    return normalizeLeadLocations(state.leadModal.locations, state.leadModal.lead?.address || "", state.leadModal.coords || null);
  }
  const current = normalizeLeadLocations(state.leadModal.locations, state.leadModal.lead?.address || "", state.leadModal.coords || null);
  const rows = inputs.map((input, index) => {
    const saved = current[index] || createLeadLocation();
    const address = String(input.value || "").trim();
    const parsedCoords = parseCoordsFromAddressInput(address, getLeadPlusCodeReference(address));
    const keepSavedCoords = hasLeadLocationCoords(saved);
    const extracted = extractPlusCodeFromText(address);
    const shouldPreferSaved = !!(extracted?.code && isLikelyShortPlusCode(extracted.code) && String(extracted.remainder || "").trim() && keepSavedCoords);
    return createLeadLocation({
      address,
      lat: shouldPreferSaved ? saved.lat : (parsedCoords ? parsedCoords.lat : (keepSavedCoords ? saved.lat : null)),
      lng: shouldPreferSaved ? saved.lng : (parsedCoords ? parsedCoords.lng : (keepSavedCoords ? saved.lng : null))
    });
  });
  return normalizeLeadLocations(rows, state.leadModal.lead?.address || "", state.leadModal.coords || null);
}

function syncLeadModalDraftFromForm() {
  if (!state.leadModal.open && !isLeadInlineCreateView()) return;
  const lead = { ...(state.leadModal.lead || {}) };
  const readText = (id) => {
    const node = document.getElementById(id);
    return node ? String(node.value || "").trim() : "";
  };
  const readValue = (id) => {
    const node = document.getElementById(id);
    return node ? String(node.value || "") : "";
  };

  lead.businessName = readText("leadBusinessName") || lead.businessName || "";
  lead.customerType = resolveCustomerType(readValue("leadCustomerType") || lead.customerType || "cafe");
  lead.contactFirstName = readText("leadCustomerFirstName") || lead.contactFirstName || "";
  lead.contactLastName = readText("leadCustomerLastName") || lead.contactLastName || "";
  lead.contactName = buildLeadContactName(
    lead.contactFirstName,
    lead.contactLastName,
    readText("leadContactName") || lead.contactName || ""
  );
  lead.phone = readText("leadPhone") || lead.phone || "";
  lead.instagram = readText("leadInstagram") || lead.instagram || "";
  lead.facebook = readText("leadFacebook") || lead.facebook || "";
  lead.tiktok = readText("leadTiktok") || lead.tiktok || "";
  lead.googleMaps = readText("leadGoogleMaps") || lead.googleMaps || "";
  lead.email = readText("leadEmail") || lead.email || "";
  lead.password = readValue("leadPassword") || lead.password || getLeadSettingsConfig().defaultPassword;
  lead.country = normalizeLeadCountry(readValue("leadCountry") || lead.country || "");
  lead.city = readText("leadCity") || lead.city || "";
  lead.zipCode = readText("leadZipCode") || lead.zipCode || "";
  lead.address = readText("leadAddress") || lead.address || "";
  lead.logoUrl = readText("leadLogoUrl") || lead.logoUrl || "";
  lead.note = readText("leadNote") || lead.note || "";
  lead.billingCycle = readValue("leadBillingCycle") === "yearly" ? "yearly" : (lead.billingCycle || "monthly");
  lead.status = normalizeLeadStatusKey(readValue("leadStatus") || lead.status || "registered") || "registered";

  const locations = readLeadModalLocationsFromForm();
  state.leadModal.locations = locations;
  if (!readText("leadAddress")) lead.address = locations[0]?.address || lead.address || "";
  state.leadModal.lead = lead;
  const primary = getPrimaryLeadLocation(locations);
  state.leadModal.coords = hasLeadLocationCoords(primary) ? { lat: primary.lat, lng: primary.lng } : null;
  syncLeadDerivedFields();
}

function addLeadModalLocationRow() {
  syncLeadModalDraftFromForm();
  const next = normalizeLeadLocations(state.leadModal.locations, state.leadModal.lead?.address || "", state.leadModal.coords || null);
  next.push(createLeadLocation());
  state.leadModal.locations = next;
  renderLeadEditorUi();
}

function removeLeadModalLocationRow(index) {
  syncLeadModalDraftFromForm();
  const idx = Number(index);
  if (!Number.isInteger(idx) || idx < 0) return;
  const next = normalizeLeadLocations(state.leadModal.locations, state.leadModal.lead?.address || "", state.leadModal.coords || null);
  if (next.length <= 1) return;
  next.splice(idx, 1);
  state.leadModal.locations = next.length ? next : [createLeadLocation()];
  state.leadModal.lead = { ...(state.leadModal.lead || {}), address: state.leadModal.locations[0]?.address || "" };
  const primary = getPrimaryLeadLocation(state.leadModal.locations);
  state.leadModal.coords = hasLeadLocationCoords(primary) ? { lat: primary.lat, lng: primary.lng } : null;
  renderLeadEditorUi();
}

function openLeadModal(mode = "create", lead = null) {
  if (!isCeoUser()) return;
  if (mode === "edit") {
    state.leads.view = "create";
    state.leads.settingsStatus = "";
    state.leadModal = createLeadDraftState("edit", lead);
    render();
    return;
  }
  state.leadModal = {
    ...createLeadDraftState(mode, lead),
    open: true
  };
  renderOverlays({ updateLead: true });
}

function closeLeadModal() {
  if (typeof document !== "undefined" && document.activeElement instanceof HTMLElement) {
    document.activeElement.blur();
  }
  resetLeadDraft();
  syncModalOpenUiState();
  renderOverlays({ updateLead: true });
}

function openCustomerModal(customer) {
  if (!isCeoUser() || !customer) return;
  state.customerModal = {
    open: true,
    mode: "edit",
    customer,
    status: "",
    loading: false,
    logoFile: null,
    logoPreview: customer.logoUrl || customer.logo || ""
  };
  renderOverlays({ updateCustomer: true });
}

function closeCustomerModal() {
  if (typeof document !== "undefined" && document.activeElement instanceof HTMLElement) {
    document.activeElement.blur();
  }
  state.customerModal = {
    open: false,
    mode: "edit",
    customer: null,
    status: "",
    loading: false,
    logoFile: null,
    logoPreview: ""
  };
  syncModalOpenUiState();
  renderOverlays({ updateCustomer: true });
}

async function saveLeadFromModal() {
  if (!state.user) return;
  const lead = state.leadModal.lead || {};
  const isInlineCreate = isLeadInlineCreateView();
  const settings = getLeadSettingsConfig();
  syncLeadModalDraftFromForm();
  const businessName = document.getElementById("leadBusinessName")?.value?.trim() || "";
  const customerType = resolveCustomerType(document.getElementById("leadCustomerType")?.value || lead.customerType || "cafe");
  const contactFirstName = document.getElementById("leadCustomerFirstName")?.value?.trim() || lead.contactFirstName || "";
  const contactLastName = document.getElementById("leadCustomerLastName")?.value?.trim() || lead.contactLastName || "";
  const contactName = buildLeadContactName(
    contactFirstName,
    contactLastName,
    document.getElementById("leadContactName")?.value?.trim() || lead.contactName || ""
  );
  const phone = document.getElementById("leadPhone")?.value?.trim() || "";
  const instagram = document.getElementById("leadInstagram")?.value?.trim() || "";
  const facebook = document.getElementById("leadFacebook")?.value?.trim() || lead.facebook || "";
  const tiktok = document.getElementById("leadTiktok")?.value?.trim() || lead.tiktok || "";
  const googleMaps = document.getElementById("leadGoogleMaps")?.value?.trim() || lead.googleMaps || "";
  const emailInput = document.getElementById("leadEmail")?.value?.trim() || (isInlineCreate ? buildLeadAccountEmail(businessName) : "");
  const passwordInput = document.getElementById("leadPassword")?.value || (isInlineCreate ? settings.defaultPassword : "");
  const country = normalizeLeadCountry(document.getElementById("leadCountry")?.value || lead.country || settings.defaultCountry);
  const city = document.getElementById("leadCity")?.value?.trim() || "";
  const addressInputValue = document.getElementById("leadAddress")?.value?.trim() || "";
  const zipCode = document.getElementById("leadZipCode")?.value?.trim() || lead.zipCode || "";
  const logoUrlInput = document.getElementById("leadLogoUrl")?.value?.trim() || "";
  const note = document.getElementById("leadNote")?.value?.trim() || "";
  const billingCycle = document.getElementById("leadBillingCycle")?.value === "yearly" ? "yearly" : "monthly";
  const statusValue = document.getElementById("leadStatus")?.value || lead.status || "registered";
  const locationInputs = Array.from(document.querySelectorAll("[data-lead-location-address]"));
  if (locationInputs.length) {
    await Promise.all(locationInputs.map((input, index) => (
      refineLeadLocationAddressIndex(index, String(input.value || "").trim(), { hydratePrimary: index === 0 }).catch(() => null)
    )));
  }
  const locations = readLeadModalLocationsFromForm();
  state.leadModal.locations = locations;
  const primaryLocation = getPrimaryLeadLocation(locations);
  const address = addressInputValue || primaryLocation.address || "";
  const coords = hasLeadLocationCoords(primaryLocation)
    ? { lat: primaryLocation.lat, lng: primaryLocation.lng }
    : null;
  state.leadModal.coords = coords;
  const locationPayload = locations
    .filter((item) => item.address || hasLeadLocationCoords(item))
    .map((item) => {
      const row = { address: item.address || "" };
      if (hasLeadLocationCoords(item)) {
        row.lat = Number(item.lat);
        row.lng = Number(item.lng);
      }
      return row;
    });

  if (!businessName) {
    state.leadModal.status = "Bitte Business Name eingeben.";
    renderLeadEditorUi();
    return;
  }

  state.leadModal.loading = true;
  state.leadModal.status = "Speichern...";
  renderLeadEditorUi();

  try {
    let restaurantId = lead.restaurantId || "";
    let restRef = null;
    if (!restaurantId) {
      restRef = doc(collection(db, "restaurants"));
      restaurantId = restRef.id;
    }

    let logoUrl = logoUrlInput || state.leadModal.logoPreview || lead.logoUrl || "";
    if (state.leadModal.logoFile) {
      const { cdnUrl } = await uploadCompressedImage(
        state.leadModal.logoFile,
        restaurantId || state.user.uid,
        { maxSize: 512, quality: 0.82, mimeType: "image/jpeg" }
      );
      logoUrl = cdnUrl || logoUrl;
    }
    const existingRest = restaurantId ? state.restaurants.find((r) => String(r.id) === String(restaurantId)) : null;
    const prevLeadContribution = lead?.id ? buildLeadCrmContribution(lead) : null;
    const prevCustomerContribution = existingRest ? buildCustomerCrmContribution(existingRest) : null;
    const restaurantStatus = resolveRestaurantStatusFromLead(statusValue, existingRest?.status || "");
    const creatorMeta = resolveStoredCeoCreatorMeta(lead, existingRest);
    const monthlyPrice = getLeadMonthlyPrice(customerType, settings);
    const yearlyPrice = monthlyPrice * 12;
    const activePrice = billingCycle === "yearly" ? yearlyPrice : monthlyPrice;
    const restPayload = {
      name: businessName,
      restaurantName: businessName,
      type: customerType,
      country,
      city,
      address,
      zipCode,
      phone,
      instagram,
      insta: instagram,
      facebook,
      tiktok,
      googleMaps,
      ownerName: contactName || "",
      ownerEmail: emailInput || "",
      contactFirstName,
      contactLastName,
      billingCycle,
      monthlyPrice,
      yearlyPrice,
      price: activePrice,
      logoUrl,
      logo: logoUrl,
      status: restaurantStatus,
      leadId: lead.id || "",
      locations: locationPayload,
      ...creatorMeta,
      updatedAt: serverTimestamp()
    };
    if (coords && Number.isFinite(coords.lat) && Number.isFinite(coords.lng)) {
      restPayload.lat = coords.lat;
      restPayload.lng = coords.lng;
      restPayload.gpsLat = coords.lat;
      restPayload.gpsLng = coords.lng;
    }

    if (restRef) {
      await setDoc(restRef, {
        ...restPayload,
        createdAt: serverTimestamp()
      });
    } else {
      await setDoc(doc(db, "restaurants", restaurantId), restPayload, { merge: true });
    }
    await ensureRestaurantPublicMeta(restaurantId, restPayload);

    let socialUid = lead.socialUid || "";
    let socialEmail = lead.socialEmail || "";
    const loginEmail = emailInput || socialEmail || "";
    let loginError = "";
    if (!socialUid && loginEmail) {
      try {
        const password = passwordInput || LEAD_SOCIAL_DEFAULT_PASSWORD;
        const user = await createAuthUser(loginEmail, password);
        if (user?.uid) {
          socialUid = user.uid;
          socialEmail = loginEmail;
        }
      } catch (err) {
        loginError = err?.message || "Login fehlgeschlagen.";
      }
    }
    if (restaurantId) {
      const ownerPatch = {};
      if (socialUid) ownerPatch.ownerUid = socialUid;
      if (loginEmail || socialEmail) ownerPatch.ownerEmail = loginEmail || socialEmail;
      if (contactName || businessName) ownerPatch.ownerName = contactName || businessName;
      if (Object.keys(ownerPatch).length) {
        ownerPatch.updatedAt = serverTimestamp();
        await setDoc(doc(db, "restaurants", restaurantId), ownerPatch, { merge: true });
      }
    }

    const leadRef = lead.id ? doc(db, "leads", lead.id) : doc(collection(db, "leads"));
    const leadId = lead.id || leadRef.id;
    const leadStatusKey = normalizeLeadStatusKey(statusValue) || "registered";
    const leadPayload = {
      businessName,
      customerType,
      contactName,
      phone,
      instagram,
      insta: instagram,
      facebook,
      tiktok,
      googleMaps,
      email: loginEmail,
      country,
      city,
      address,
      zipCode,
      locations: locationPayload,
      logoUrl,
      note,
      contactFirstName,
      contactLastName,
      billingCycle,
      monthlyPrice,
      yearlyPrice,
      price: activePrice,
      status: leadStatusKey,
      restaurantId,
      socialUid,
      socialEmail,
      updatedAt: serverTimestamp(),
      ...creatorMeta
    };
    if (coords && Number.isFinite(coords.lat) && Number.isFinite(coords.lng)) {
      leadPayload.lat = coords.lat;
      leadPayload.lng = coords.lng;
      leadPayload.gpsLat = coords.lat;
      leadPayload.gpsLng = coords.lng;
    }
    if (!lead.id) {
      leadPayload.createdAt = serverTimestamp();
    }
    await setDoc(leadRef, leadPayload, { merge: true });
    if (restaurantId && leadId) {
      await setDoc(doc(db, "restaurants", restaurantId), { leadId }, { merge: true });
    }
    const nextLeadContribution = buildLeadCrmContribution({ id: leadId, ...leadPayload });
    const nextCustomerContribution = buildCustomerCrmContribution({ id: restaurantId, ...(existingRest || {}), ...restPayload });
    const crmDeltaMap = new Map();
    accumulateCeoCrmDelta(crmDeltaMap, prevLeadContribution, -1);
    accumulateCeoCrmDelta(crmDeltaMap, prevCustomerContribution, -1);
    accumulateCeoCrmDelta(crmDeltaMap, nextLeadContribution, 1);
    accumulateCeoCrmDelta(crmDeltaMap, nextCustomerContribution, 1);
    await applyCeoCrmCountDeltas(crmDeltaMap);

    const normalized = normalizeLeadDoc({ id: leadId, ...leadPayload });
    const idx = state.leads.items.findIndex((item) => String(item.id) === String(leadId));
    const visibleInCurrentScope = leadBelongsToScope(normalized);
    if (leadStatusKey === "kunde") {
      state.leads.items = state.leads.items.filter((item) => (
        String(item.id || "") !== String(leadId)
        && String(item.restaurantId || "") !== String(restaurantId)
      ));
    } else if (!visibleInCurrentScope) {
      state.leads.items = state.leads.items.filter((item) => String(item.id || "") !== String(leadId));
    } else if (idx >= 0) {
      state.leads.items[idx] = { ...state.leads.items[idx], ...normalized };
    } else {
      state.leads.items.unshift(normalized);
    }
    syncVisibleLeadPageFromItems();

    state.restaurants = mergeRestaurants(state.restaurants, [{ id: restaurantId, ...(existingRest || {}), ...restPayload }]);
    rebuildBusinessLocations();
    refreshCustomersFromRestaurants();

    state.leadModal.loading = false;
    if (isInlineCreate) {
      state.leads.view = "list";
      resetLeadDraft();
      render();
    } else {
      closeLeadModal();
      render();
    }
    if (loginError) {
      alert(`Lead gespeichert. Login fehlgeschlagen: ${loginError}`);
    }
  } catch (err) {
    console.error(err);
    state.leadModal.status = err?.message || "Speichern fehlgeschlagen.";
    state.leadModal.loading = false;
    renderLeadEditorUi();
  }
}

async function saveCustomerFromModal() {
  if (!state.user) return;
  const customer = state.customerModal.customer;
  if (!customer?.id) return;

  const name = document.getElementById("customerName")?.value?.trim() || "";
  const type = resolveCustomerType(document.getElementById("customerType")?.value || customer.type || "cafe");
  const ownerName = document.getElementById("customerOwnerName")?.value?.trim() || "";
  const ownerEmail = document.getElementById("customerOwnerEmail")?.value?.trim() || "";
  const phone = document.getElementById("customerPhone")?.value?.trim() || "";
  const instagram = document.getElementById("customerInstagram")?.value?.trim() || "";
  const city = document.getElementById("customerCity")?.value?.trim() || "";
  const address = document.getElementById("customerAddress")?.value?.trim() || "";
  const logoUrlInput = document.getElementById("customerLogoUrl")?.value?.trim() || "";
  const statusValue = document.getElementById("customerStatus")?.value || customer.status || "kunde";

  if (!name) {
    state.customerModal.status = "Bitte Business Name eingeben.";
    renderOverlays({ updateCustomer: true });
    return;
  }

  state.customerModal.loading = true;
  state.customerModal.status = "Speichern...";
  renderOverlays({ updateCustomer: true });

  try {
    const prevCustomerContribution = buildCustomerCrmContribution(customer);
    let logoUrl = logoUrlInput || state.customerModal.logoPreview || customer.logoUrl || "";
    if (state.customerModal.logoFile) {
      const { cdnUrl } = await uploadCompressedImage(
        state.customerModal.logoFile,
        customer.id,
        { maxSize: 512, quality: 0.82, mimeType: "image/jpeg" }
      );
      logoUrl = cdnUrl || logoUrl;
    }

    const statusKey = normalizeLeadStatusKey(statusValue) || "kunde";
    const restaurantStatus = resolveRestaurantStatusFromLead(statusKey, customer.status || "");
    const payload = {
      name,
      restaurantName: name,
      type,
      ownerName,
      ownerEmail,
      phone,
      instagram,
      insta: instagram,
      city,
      address,
      logoUrl,
      logo: logoUrl,
      status: restaurantStatus,
      updatedAt: serverTimestamp()
    };
    await setDoc(doc(db, "restaurants", customer.id), payload, { merge: true });
    await ensureRestaurantPublicMeta(customer.id, payload);

    const crmDeltaMap = new Map();
    accumulateCeoCrmDelta(crmDeltaMap, prevCustomerContribution, -1);

    if (statusKey !== "kunde") {
      const leadId = customer.leadId || payload.leadId || "";
      const matchedLead = (leadId
        ? state.leads.items.find((item) => String(item.id || "") === String(leadId))
        : null)
        || state.leads.items.find((item) => String(item.restaurantId || "") === String(customer.id));
      const creatorMeta = resolveStoredCeoCreatorMeta(matchedLead, customer);
      const leadRef = leadId ? doc(db, "leads", leadId) : doc(collection(db, "leads"));
      const leadPayload = {
        businessName: name,
        customerType: type,
        contactName: ownerName,
        phone,
        instagram,
        insta: instagram,
        email: ownerEmail,
        city,
        address,
        logoUrl,
        status: statusKey,
        restaurantId: customer.id,
        updatedAt: serverTimestamp(),
        ...creatorMeta
      };
      if (!leadId) leadPayload.createdAt = serverTimestamp();
      await setDoc(leadRef, leadPayload, { merge: true });
      if (!leadId) {
        await setDoc(doc(db, "restaurants", customer.id), { leadId: leadRef.id }, { merge: true });
        payload.leadId = leadRef.id;
      }
      accumulateCeoCrmDelta(crmDeltaMap, buildLeadCrmContribution({ id: leadRef.id, ...leadPayload }), 1);
      const normalizedLead = normalizeLeadDoc({ id: leadRef.id, ...leadPayload });
      const idx = state.leads.items.findIndex((item) => String(item.id) === String(leadRef.id));
      const visibleInCurrentScope = leadBelongsToScope(normalizedLead);
      if (!visibleInCurrentScope) {
        state.leads.items = state.leads.items.filter((item) => String(item.id || "") !== String(leadRef.id));
      } else if (idx >= 0) state.leads.items[idx] = { ...state.leads.items[idx], ...normalizedLead };
      else state.leads.items.unshift(normalizedLead);
      syncVisibleLeadPageFromItems();
    } else {
      const matchedLead = state.leads.items.find((item) => String(item.restaurantId || "") === String(customer.id));
      const leadId = customer.leadId || matchedLead?.id || "";
      if (leadId) {
        await setDoc(doc(db, "leads", leadId), {
          status: "kunde",
          updatedAt: serverTimestamp()
        }, { merge: true });
      }
      accumulateCeoCrmDelta(crmDeltaMap, buildCustomerCrmContribution({ id: customer.id, ...customer, ...payload }), 1);
      state.leads.items = state.leads.items.filter((item) => (
        String(item.restaurantId || "") !== String(customer.id)
        && String(item.id || "") !== String(leadId)
      ));
      syncVisibleLeadPageFromItems();
    }

    await applyCeoCrmCountDeltas(crmDeltaMap);

    state.restaurants = mergeRestaurants(state.restaurants, [{ id: customer.id, ...customer, ...payload }]);
    rebuildBusinessLocations();
    refreshCustomersFromRestaurants();

    state.customerModal.loading = false;
    closeCustomerModal();
    render();
  } catch (err) {
    console.error(err);
    state.customerModal.status = err?.message || "Speichern fehlgeschlagen.";
    state.customerModal.loading = false;
    renderOverlays({ updateCustomer: true });
  }
}

async function convertLeadToCustomer(leadId) {
  if (!state.user || !leadId) return false;
  const lead = state.leads.items.find((item) => String(item.id) === String(leadId));
  if (!lead) return false;
  if (!confirm("Lead als Kunde aktivieren?")) return false;

  try {
    const prevLeadContribution = buildLeadCrmContribution(lead);
    let restaurantId = lead.restaurantId || "";
    let existingRest = restaurantId ? state.restaurants.find((r) => String(r.id) === String(restaurantId)) : null;
    const businessName = lead.businessName || "Neuer Kunde";
    const type = resolveCustomerType(lead.customerType || "cafe");
    const creatorMeta = resolveStoredCeoCreatorMeta(lead, existingRest);
    const locations = normalizeLeadLocations(lead.locations || [], lead.address || "", {
      lat: lead.lat ?? null,
      lng: lead.lng ?? null
    });
    const primaryLocation = getPrimaryLeadLocation(locations);
    const locationPayload = locations
      .filter((item) => item.address || hasLeadLocationCoords(item))
      .map((item) => {
        const row = { address: item.address || "" };
        if (hasLeadLocationCoords(item)) {
          row.lat = Number(item.lat);
          row.lng = Number(item.lng);
        }
        return row;
      });
    const restPayload = {
      name: businessName,
      restaurantName: businessName,
      type,
      city: lead.city || "",
      address: primaryLocation.address || lead.address || "",
      phone: lead.phone || "",
      instagram: lead.instagram || lead.insta || "",
      insta: lead.instagram || lead.insta || "",
      ownerName: lead.contactName || "",
      ownerEmail: lead.email || lead.socialEmail || "",
      logoUrl: lead.logoUrl || "",
      logo: lead.logoUrl || "",
      status: "active",
      leadId: lead.id || "",
      locations: locationPayload,
      ...creatorMeta,
      updatedAt: serverTimestamp()
    };
    if (hasLeadLocationCoords(primaryLocation)) {
      restPayload.lat = Number(primaryLocation.lat);
      restPayload.lng = Number(primaryLocation.lng);
    } else if (Number.isFinite(Number(lead.lat)) && Number.isFinite(Number(lead.lng))) {
      restPayload.lat = Number(lead.lat);
      restPayload.lng = Number(lead.lng);
    }

    if (!restaurantId) {
      const restRef = doc(collection(db, "restaurants"));
      restaurantId = restRef.id;
      await setDoc(restRef, {
        ...restPayload,
        createdAt: serverTimestamp()
      });
    } else {
      await setDoc(doc(db, "restaurants", restaurantId), restPayload, { merge: true });
    }
    await ensureRestaurantPublicMeta(restaurantId, restPayload);

    let socialUid = lead.socialUid || "";
    let socialEmail = lead.socialEmail || lead.email || "";
    let loginError = "";
    if (!socialUid && socialEmail) {
      try {
        const user = await createAuthUser(socialEmail, LEAD_SOCIAL_DEFAULT_PASSWORD);
        if (user?.uid) {
          socialUid = user.uid;
        }
      } catch (err) {
        loginError = err?.message || "Login fehlgeschlagen.";
      }
    }
    if (restaurantId) {
      const ownerPatch = {};
      if (socialUid) ownerPatch.ownerUid = socialUid;
      if (socialEmail) ownerPatch.ownerEmail = socialEmail;
      if (lead.contactName || businessName) ownerPatch.ownerName = lead.contactName || businessName;
      if (Object.keys(ownerPatch).length) {
        ownerPatch.updatedAt = serverTimestamp();
        await setDoc(doc(db, "restaurants", restaurantId), ownerPatch, { merge: true });
      }
    }

    await setDoc(doc(db, "leads", lead.id), {
      status: "kunde",
      restaurantId,
      socialUid,
      socialEmail,
      convertedAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }, { merge: true });
    const crmDeltaMap = new Map();
    accumulateCeoCrmDelta(crmDeltaMap, prevLeadContribution, -1);
    accumulateCeoCrmDelta(crmDeltaMap, buildCustomerCrmContribution({ id: restaurantId, ...(existingRest || {}), ...restPayload, status: "active" }), 1);
    await applyCeoCrmCountDeltas(crmDeltaMap);

    state.leads.items = state.leads.items.filter((item) => String(item.id) !== String(lead.id));
    syncVisibleLeadPageFromItems();
    state.restaurants = mergeRestaurants(state.restaurants, [{ id: restaurantId, ...(existingRest || {}), ...restPayload, status: "active" }]);
    rebuildBusinessLocations();
    refreshCustomersFromRestaurants();
    render();
    if (loginError) {
      alert(`Kunde aktiviert. Login fehlgeschlagen: ${loginError}`);
    }
    return true;
  } catch (err) {
    console.error(err);
    alert(err?.message || "Umwandlung fehlgeschlagen.");
    return false;
  }
}

function openMenuModal(mode = "create", item = null) {
  const existingImages = getMenuItemImages(item).filter(Boolean);
  const uniqImages = Array.from(new Set(existingImages));
  const crop = getMenuItemCrop(item);
  state.menuModal = {
    open: true,
    mode,
    item,
    status: "",
    loading: false,
    imageUrlDraft: "",
    cropX: crop.x,
    cropY: crop.y,
    imageFiles: [],
    imagePreviews: [],
    existingImages: uniqImages
  };
  renderOverlays({ updateMenu: true });
}

function closeMenuModal() {
  state.menuModal = {
    open: false,
    mode: "create",
    item: null,
    status: "",
    loading: false,
    imageUrlDraft: "",
    cropX: 50,
    cropY: 50,
    imageFiles: [],
    imagePreviews: [],
    existingImages: []
  };
  renderOverlays({ updateMenu: true });
}

async function openMenuDetail(item, restaurantIdOverride = "") {
  if (!item) return;
  stopMenuItemMetaListeners();
  const restaurantId = restaurantIdOverride
    || state.menu.restaurantId
    || state.profileView?.profile?.restaurantId
    || state.userProfile.restaurantId
    || "";
  state.menuDetail = {
    open: true,
    item,
    index: 0,
    restaurantId,
    selectedSize: Array.isArray(item?.sizes) && item.sizes.length ? String(item.sizes[0]) : "",
    selectedColor: Array.isArray(item?.colors) && item.colors.length ? String(item.colors[0]) : "",
    commentText: "",
    loading: true,
    sending: false
  };
  renderOverlays({ updateMenuDetail: true });
  if (!restaurantId) {
    state.menuDetail.loading = false;
    updateMenuDetailMeta();
    return;
  }
  attachMenuItemMetaListeners(item, restaurantId);
  void loadMenuItemMetaFromFirebase(item, restaurantId).then(() => {
    if (state.menuDetail.open && state.menuDetail.item && String(state.menuDetail.item.id || "") === String(item.id || "")) {
      updateMenuDetailMeta();
    }
  });
  state.menuDetail.loading = false;
  updateMenuDetailMeta();
}

function closeMenuDetail() {
  stopMenuItemMetaListeners();
  state.menuDetail = { open: false, item: null, index: 0, restaurantId: "", selectedSize: "", selectedColor: "", commentText: "", loading: false, sending: false };
  renderOverlays({ updateMenuDetail: true });
}

function setMenuDetailIndex(nextIndex) {
  if (!state.menuDetail.open || !state.menuDetail.item) return;
  const images = getMenuItemImages(state.menuDetail.item);
  if (!images.length) return;
  const max = images.length;
  let idx = Number(nextIndex);
  if (!Number.isFinite(idx)) idx = 0;
  if (idx < 0) idx = max - 1;
  if (idx >= max) idx = 0;
  if (idx === state.menuDetail.index) return;
  state.menuDetail.index = idx;
  renderOverlays({ updateMenuDetail: true });
}

function setMenuDetailVariant(field, value) {
  if (!state.menuDetail.open) return;
  if (field !== "size" && field !== "color") return;
  const key = field === "size" ? "selectedSize" : "selectedColor";
  state.menuDetail[key] = String(value || "").trim();
}

async function saveMenuItemFromModal() {
  if (!state.user) return;
  const restaurantId = state.userProfile.restaurantId || "";
  const isShop = isShopCatalogProfile(state.userProfile);
  if (!restaurantId) {
    state.menuModal.status = "Kein Restaurant ausgewaehlt.";
    renderOverlays({ updateMenu: true });
    return;
  }
  const name = document.getElementById("menuItemName")?.value?.trim() || "";
  const price = document.getElementById("menuItemPrice")?.value?.trim() || "";
  const category = document.getElementById("menuItemCategory")?.value?.trim() || "";
  const type = document.getElementById("menuItemType")?.value || "food";
  const description = document.getElementById("menuItemDesc")?.value?.trim() || "";
  const longDescription = document.getElementById("menuItemLongDesc")?.value?.trim() || "";
  const allergens = document.getElementById("menuItemAllergens")?.value?.trim() || "";
  const brand = document.getElementById("menuItemBrand")?.value?.trim() || "";
  const sku = document.getElementById("menuItemSku")?.value?.trim() || "";
  const stockRaw = document.getElementById("menuItemStock")?.value?.trim() || "";
  const sizes = normalizeOptionList(document.getElementById("menuItemSizes")?.value || "");
  const colors = normalizeOptionList(document.getElementById("menuItemColors")?.value || "");
  const available = document.getElementById("menuItemAvailable")?.checked !== false;
  const imageUrlInput = String(state.menuModal.imageUrlDraft || "").trim()
    || document.getElementById("menuItemImageUrl")?.value?.trim()
    || "";
  const stock = stockRaw === ""
    ? null
    : Math.max(0, Math.round(Number(stockRaw) || 0));
  const crop = getMenuModalCrop();

  if (!name) {
    state.menuModal.status = "Bitte Namen eingeben.";
    renderOverlays({ updateMenu: true });
    return;
  }

  state.menuModal.loading = true;
  state.menuModal.status = "Speichern...";
  renderOverlays({ updateMenu: true });

  try {
    const ownerId = restaurantId;
    const existingImages = Array.isArray(state.menuModal.existingImages)
      ? state.menuModal.existingImages.slice()
      : [];
    const uploadedUrls = [];
    const files = Array.isArray(state.menuModal.imageFiles) ? state.menuModal.imageFiles : [];
    for (const file of files) {
      const { cdnUrl } = await uploadCompressedImage(
        file,
        ownerId,
        { maxSize: 1080, quality: 0.8, mimeType: "image/jpeg" }
      );
      if (cdnUrl) uploadedUrls.push(String(cdnUrl));
    }

    const merged = [
      imageUrlInput,
      ...(existingImages || []),
      ...(uploadedUrls || [])
    ].filter(Boolean);
    const imageUrls = Array.from(new Set(merged));
    let imageUrl = imageUrls[0] || "";

    const mode = state.menuModal.mode;
    const ref = mode === "edit" && state.menuModal.item?.id
      ? doc(db, "restaurants", restaurantId, "menuItems", state.menuModal.item.id)
      : doc(collection(db, "restaurants", restaurantId, "menuItems"));
    const id = state.menuModal.item?.id || ref.id;

    const payload = {
      id,
      type: normalizeMenuType(type),
      category: category || "Sonstiges",
      name,
      description,
      longDescription,
      allergens,
      brand: isShop ? brand : "",
      sku: isShop ? sku : "",
      stock: isShop ? stock : null,
      sizes: isShop ? sizes : [],
      colors: isShop ? colors : [],
      cropX: crop.x,
      cropY: crop.y,
      price: price ?? "",
      available,
      imageUrl: imageUrl || "",
      imageUrls,
      updatedAt: serverTimestamp()
    };
    if (mode !== "edit") payload.createdAt = serverTimestamp();

    await setDoc(ref, payload, { merge: true });

    const nextItems = Array.isArray(state.menu.items) ? state.menu.items.slice() : [];
    const idx = nextItems.findIndex((it) => String(it.id) === String(id));
    const normalized = normalizeMenuItemDoc(payload, id);
    if (idx >= 0) {
      nextItems[idx] = { ...nextItems[idx], ...normalized };
    } else {
      nextItems.unshift(normalized);
    }
    syncMenuCaches(restaurantId, nextItems);
    await publishMenuToPublic(restaurantId, nextItems);

    state.menuModal.status = "Gespeichert.";
    state.menuModal.loading = false;
    closeMenuModal();
    render();
  } catch (err) {
    console.error(err);
    state.menuModal.status = err?.message || "Speichern fehlgeschlagen.";
    state.menuModal.loading = false;
    renderOverlays({ updateMenu: true });
  }
}

async function deleteMenuItemById(itemId) {
  if (!state.user || !itemId) return;
  const restaurantId = state.userProfile.restaurantId || "";
  if (!restaurantId) return;
  if (!confirm("Produkt wirklich loeschen?")) return;
  try {
    await deleteDoc(doc(db, "restaurants", restaurantId, "menuItems", itemId));
    const nextItems = (state.menu.items || []).filter((it) => String(it.id) !== String(itemId));
    syncMenuCaches(restaurantId, nextItems);
    await publishMenuToPublic(restaurantId, nextItems);
    render();
  } catch (err) {
    console.error(err);
    alert("Loeschen fehlgeschlagen.");
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
    await loadAuthProfile(user);
    if (state.userProfile.restaurantId) {
      await hydrateRestaurantsByIds([state.userProfile.restaurantId], { max: 1 });
    }
    await resolveRoleSwitchTargets(user);
  } finally {
  }
  if (!dataLoaded.following) {
    dataLoaded.following = true;
    const cachedFollowing = Array.isArray(state.followingHandles) ? state.followingHandles.length : 0;
    const followingCount = Number(state.userProfile?.following || 0) || 0;
    if (!cachedFollowing && followingCount > 0) {
      void loadFollowingFromFirebase();
    }
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
    queueMicrotask(() => maybeOpenProfileFromQuery());
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

