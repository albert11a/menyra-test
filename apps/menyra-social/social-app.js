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
  getDocs,
  query,
  where,
  orderBy,
  limit,
  setDoc,
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
  postMeta: "menyra_social_post_meta_v1"
};

const ADMIN_LOGINS = {
  admin: {
    email: "admin@menyra.local",
    password: "admin",
    profile: {
      displayName: "Menyra HQ",
      city: "Prishtina",
      role: "business",
      avatarUrl: "https://via.placeholder.com/300/4f46e5/ffffff?text=HQ"
    }
  },
  admin1: {
    email: "admin1@menyra.local",
    password: "admin1",
    profile: {
      displayName: "Max Mustermann",
      city: "Prishtina",
      role: "user",
      avatarUrl: "https://i.pravatar.cc/300?u=max"
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
    img: "https://i.pravatar.cc/100?u=1",
    read: false
  },
  {
    id: "n2",
    type: "follow",
    user: "Elena",
    text: "folgt dir jetzt",
    time: "1h",
    img: "https://i.pravatar.cc/100?u=2",
    read: false
  },
  {
    id: "n3",
    type: "system",
    user: "Menyra Team",
    text: "Willkommen zurueck!",
    time: "2h",
    img: "https://via.placeholder.com/100/6366f1/ffffff?text=M",
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
  businessLocations: [],
  stories: [],
  userPosts: [],
  businessPosts: [],
  userProfile: { ...DEFAULT_PROFILE },
  roleSwitchRoles: [],
  roleSwitchRestaurantId: "",
  followingHandles: [],
  profileView: null,
  profileViewMode: "grid",
  profileContentTab: "posts",
  profileCheckins: [],
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
    replyTo: null
  },
  likesModal: {
    open: false,
    postId: ""
  },
  upload: {
    preview: "",
    caption: "",
    file: null,
    status: ""
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

function icon(name, className = "") {
  return `<i data-lucide="${name}" class="${className}"></i>`;
}

function setState(patch) {
  Object.assign(state, patch);
  render();
}

function saveSettings(settings) {
  safeStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(settings));
}

function saveNotifications(notifications) {
  safeStorage.setItem(STORAGE_KEYS.notifications, JSON.stringify(notifications));
}

function saveFollowing(handles) {
  safeStorage.setItem(STORAGE_KEYS.following, JSON.stringify(handles));
}

function savePostMeta(meta) {
  safeStorage.setItem(STORAGE_KEYS.postMeta, JSON.stringify(meta));
}

function loadPersisted() {
  const savedSettings = safeStorage.getItem(STORAGE_KEYS.settings);
  if (savedSettings) {
    try { state.settings = { ...DEFAULT_SETTINGS, ...JSON.parse(savedSettings) }; } catch {}
  }

  const savedNotifs = safeStorage.getItem(STORAGE_KEYS.notifications);
  if (savedNotifs) {
    try { state.notifications = JSON.parse(savedNotifs); } catch {}
  }

  const savedProfile = safeStorage.getItem(STORAGE_KEYS.profile);
  if (savedProfile) {
    try { state.userProfile = { ...DEFAULT_PROFILE, ...JSON.parse(savedProfile) }; } catch {}
  }

  const savedFollowing = safeStorage.getItem(STORAGE_KEYS.following);
  if (savedFollowing) {
    try { state.followingHandles = JSON.parse(savedFollowing) || []; } catch {}
  }

  const savedMeta = safeStorage.getItem(STORAGE_KEYS.postMeta);
  if (savedMeta) {
    try { state.postMeta = JSON.parse(savedMeta) || {}; } catch {}
  }
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
    avatar: data?.avatarUrl || "",
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
    img: rest.heroUrl || rest.coverUrl || rest.logoUrl || rest.logo || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400",
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
    img: rest.heroUrl || rest.coverUrl || rest.logoUrl || rest.logo || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400",
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

function currentUserBadge() {
  return {
    name: state.userProfile.name || "User",
    handle: state.userProfile.handle || "user",
    avatar: state.userProfile.avatar || "https://i.pravatar.cc/120?u=menyra"
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
    savePostMeta(state.postMeta);
  }
  return state.postMeta[postId];
}

function resolvePostCounts(post) {
  const meta = ensurePostMeta(post.id);
  const likeBase = typeof post.likes === "number" ? post.likes : 0;
  const commentBase = typeof post.comments === "number" ? post.comments : 0;
  const likeCount = likeBase + (meta.likes?.length || 0);
  const commentCount = commentBase + (meta.comments?.length || 0);

  const likeLabel = meta.likes?.length
    ? String(likeCount)
    : (typeof post.likes === "number" ? String(likeCount) : String(post.likes ?? 0));

  const commentLabel = meta.comments?.length
    ? String(commentCount)
    : (typeof post.comments === "number" ? String(commentCount) : String(post.comments ?? 0));

  return { likeLabel, commentLabel };
}

function findPostById(postId) {
  const all = [...state.userPosts, ...state.businessPosts];
  const found = all.find((item) => String(item.id) === String(postId));
  if (found) return found;
  const viewPosts = state.profileView?.posts || [];
  const viewFound = viewPosts.find((item) => String(item.id) === String(postId));
  if (viewFound) return viewFound;
  const modalPosts = state.profileModal.profile?.posts || [];
  return modalPosts.find((item) => String(item.id) === String(postId)) || null;
}

function openPostModal(post) {
  if (!post) return;
  ensurePostMeta(post.id);
  state.profileModal = { open: false, profile: null };
  state.postModal = {
    open: true,
    post,
    commentText: "",
    replyTo: null
  };
  renderOverlays();
}

function closePostModal() {
  state.postModal = { open: false, post: null, commentText: "", replyTo: null };
  state.likesModal = { open: false, postId: "" };
  renderOverlays();
}

function ensureCommentShape(comment) {
  return {
    id: comment.id,
    author: comment.author || "User",
    handle: comment.handle || "user",
    avatar: comment.avatar || "https://i.pravatar.cc/120?u=menyra",
    text: comment.text || "",
    createdAt: comment.createdAt || new Date().toISOString(),
    likes: comment.likes || [],
    replies: (comment.replies || []).map((reply) => ({
      id: reply.id,
      author: reply.author || "User",
      handle: reply.handle || "user",
      avatar: reply.avatar || "https://i.pravatar.cc/120?u=menyra",
      text: reply.text || "",
      createdAt: reply.createdAt || new Date().toISOString(),
      likes: reply.likes || []
    }))
  };
}

function addComment(postId, text, replyTo) {
  const trimmed = String(text || "").trim();
  if (!trimmed) return;
  const meta = ensurePostMeta(postId);
  const user = currentUserBadge();
  const newComment = {
    id: `c_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    author: user.name,
    handle: user.handle,
    avatar: user.avatar,
    text: trimmed,
    createdAt: new Date().toISOString(),
    likes: [],
    replies: []
  };

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
  savePostMeta(state.postMeta);
  state.postModal.commentText = "";
  state.postModal.replyTo = null;
  renderOverlays();
}

function togglePostLike(postId) {
  const meta = ensurePostMeta(postId);
  const user = currentUserBadge();
  const idx = meta.likes.findIndex((item) => item.handle === user.handle);
  if (idx >= 0) {
    meta.likes.splice(idx, 1);
  } else {
    meta.likes.unshift(user);
  }
  state.postMeta[postId] = meta;
  savePostMeta(state.postMeta);
  renderOverlays();
}

function toggleCommentLike(postId, commentId, replyId) {
  const meta = ensurePostMeta(postId);
  const user = currentUserBadge();
  const list = meta.comments || [];
  const comment = list.find((item) => item.id === commentId);
  if (!comment) return;

  const target = replyId ? (comment.replies || []).find((item) => item.id === replyId) : comment;
  if (!target) return;

  const likes = target.likes || [];
  const idx = likes.findIndex((item) => item.handle === user.handle);
  if (idx >= 0) {
    likes.splice(idx, 1);
  } else {
    likes.unshift(user);
  }
  target.likes = likes;
  state.postMeta[postId] = meta;
  savePostMeta(state.postMeta);
  renderOverlays();
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
  const switchLinks = (state.user && state.roleSwitchRoles.length) ? `
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
      ` : "";
  return `
    <div class="fixed inset-0 z-50 transition-all duration-500 ${state.drawerOpen ? "visible" : "invisible"}">
      <div id="drawerOverlay" class="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity ${state.drawerOpen ? "opacity-100" : "opacity-0"}"></div>
      <div class="absolute left-0 top-0 bottom-0 w-80 bg-white shadow-2xl transition-transform duration-500 p-8 flex flex-col ${state.drawerOpen ? "translate-x-0" : "-translate-x-full"}">
        <div class="flex justify-between items-center mb-10">
          <div>
            <span class="text-[9px] font-black text-indigo-600 uppercase tracking-widest">Menue</span>
            <h3 class="text-2xl font-black italic">NAVIGATE</h3>
          </div>
          <button id="drawerClose" class="p-2.5 rounded-xl bg-slate-50">${icon("x", "w-4 h-4")}</button>
        </div>
        <div class="p-4 rounded-3xl mb-6 flex items-center gap-3 bg-slate-50">
          <img src="${escapeHtml(state.userProfile.avatar || "https://via.placeholder.com/80")}" class="w-10 h-10 rounded-xl object-cover" />
          <div>
            <p class="text-xs font-black">${escapeHtml(state.userProfile.name || "User")}</p>
            <p class="text-[9px] font-bold text-slate-400 uppercase">@${escapeHtml(state.userProfile.handle || "user")}</p>
          </div>
        </div>
        <nav class="space-y-2 flex-1">
          ${[
            { id: "feed", label: "Feed", icon: "home" },
            { id: "map", label: "Karte", icon: "map" },
            { id: "profile", label: "Profil", icon: "user" },
            { id: "notifications", label: "Updates", icon: "bell", badge: unread },
            { id: "settings", label: "Optionen", icon: "settings" }
          ].map((item) => `
            <button data-nav="${item.id}" class="w-full flex items-center justify-between p-4 rounded-2xl font-black text-xs transition-all ${state.activeTab === item.id ? "bg-indigo-600 text-white shadow-xl shadow-indigo-500/20" : "text-slate-400 hover:bg-slate-50"}">
              <div class="flex items-center gap-4">${icon(item.icon, "w-4 h-4")} ${item.label}</div>
              ${item.badge ? `<span class="bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md">${item.badge}</span>` : ""}
            </button>
          `).join("")}
        </nav>
        ${switchLinks}
        <button id="logoutBtn" class="mt-auto flex items-center gap-3 p-4 text-rose-500 font-black uppercase text-[10px] tracking-widest hover:bg-rose-500/10 rounded-2xl transition-colors">${icon("log-out", "w-4 h-4")} Abmelden</button>
      </div>
    </div>
  `;
}

function renderFeedView() {
  const stories = state.stories;
  const feedPosts = state.feedPosts.filter((p) => state.feedCategory === "all" || p.category === state.feedCategory);
  return `
    <div class="animate-in fade-in duration-500">
      <div class="flex gap-4 overflow-x-auto px-8 pb-8 no-scrollbar">
        <div class="flex-shrink-0 flex flex-col items-center gap-2">
          <div data-nav="upload" class="w-20 h-20 rounded-[2.2rem] bg-indigo-600 flex items-center justify-center text-white shadow-2xl shadow-indigo-500/30 overflow-hidden relative group">
            <div class="absolute inset-0 bg-gradient-to-br from-indigo-400 to-indigo-800"></div>
            ${icon("camera", "w-7 h-7 relative z-10")}
          </div>
          <span class="text-[9px] font-black text-indigo-600 uppercase tracking-widest">Story</span>
        </div>
        ${stories.length ? stories.map((s) => {
          const borderClass = s.isLive ? "border-red-500 animate-pulse" : "border-slate-200";
          const storyUrl = buildUrl("apps/menyra-restaurants/guest/story/index.html", { r: s.restaurantId });
          return `
            <a href="${storyUrl}" class="flex-shrink-0 flex flex-col items-center gap-2 group cursor-pointer">
              <div class="w-20 h-20 rounded-[2.2rem] p-0.5 border-2 ${borderClass}">
                <img src="${escapeHtml(s.img)}" class="w-full h-full rounded-[1.8rem] object-cover group-hover:scale-105 transition-transform" />
              </div>
              <span class="text-[9px] font-bold tracking-tighter text-slate-800">${escapeHtml(s.name)}</span>
            </a>
          `;
        }).join("") : `
          <div class="flex items-center text-slate-400 text-xs font-bold uppercase">Keine Stories</div>
        `}
      </div>
      ${state.userProfile.role === "business" ? `
        <div class="px-8 mb-6">
          <button data-nav="upload" class="w-full p-4 rounded-[2rem] bg-slate-900 text-white text-xs font-black uppercase tracking-widest shadow-xl flex items-center justify-center gap-2 active:scale-95 transition-transform">
            ${icon("plus-square", "w-4 h-4")} Neuer Feed Post
          </button>
        </div>
      ` : ""}
      <div class="px-8 py-4 space-y-12">
        ${feedPosts.length ? feedPosts.map((post) => `
          <div class="group">
            <div class="flex items-center justify-between mb-5 px-2">
              <button data-profile-business="${escapeHtml(post.business)}" data-profile-id="${escapeHtml(post.restaurantId || "")}" class="flex items-center gap-3 text-left">
                <div class="w-12 h-12 rounded-2xl shadow-xl flex items-center justify-center border border-slate-50 italic overflow-hidden bg-white">
                  <img src="${escapeHtml(post.logo || post.image)}" class="w-full h-full object-cover" />
                </div>
                <div>
                  <h4 class="text-sm font-black flex items-center gap-1.5 uppercase tracking-tighter italic text-slate-900">${escapeHtml(post.business)} ${icon("star", "w-3 h-3 text-indigo-500")}</h4>
                  <p class="text-[9px] text-slate-400 font-bold uppercase tracking-widest">${escapeHtml(post.location)}</p>
                </div>
              </button>
              ${icon("more-horizontal", "w-5 h-5 text-slate-400")}
            </div>
            <div class="p-2.5 rounded-[3.5rem] shadow-2xl overflow-hidden relative bg-white shadow-slate-200/50 border border-slate-50">
              <div class="relative h-[30rem] rounded-[3rem] overflow-hidden">
                <img src="${escapeHtml(post.image)}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" />
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
                        ${icon("heart", "w-5 h-5")} <span class="text-[10px] font-black">${escapeHtml(post.likes)}</span>
                      </button>
                      <button class="flex items-center gap-2 text-white/70 hover:text-white">
                        ${icon("message-circle", "w-5 h-5")} <span class="text-[10px] font-black">${escapeHtml(post.comments)}</span>
                      </button>
                    </div>
                    <button class="text-white/70 hover:text-white">${icon("share-2", "w-4 h-4")}</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        `).join("") : `
          <div class="text-center py-20 text-slate-400 font-bold text-xs uppercase">Keine Posts vorhanden</div>
        `}
      </div>
    </div>
  `;
}

function renderMapSheet(selected) {
  return `
    <div class="absolute bottom-6 left-6 right-6 animate-in slide-in-from-bottom-6 duration-300 z-50">
      <div class="bg-white rounded-[2.5rem] p-5 shadow-2xl border border-slate-100 relative">
        <button id="mapCloseBtn" class="absolute top-4 right-4 w-10 h-10 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 hover:bg-slate-100 transition-colors">
          ${icon("x", "w-4 h-4")}
        </button>
        <div class="flex gap-4">
          <img src="${escapeHtml(selected.img)}" class="w-24 h-24 rounded-3xl object-cover shadow-lg" />
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
  const postAttr = item.id ? `data-open-post="${escapeHtml(item.id)}"` : "";
  return `
    <button type="button" ${postAttr} class="rounded-[2.5rem] overflow-hidden shadow-md relative group text-left ${item.type === "wide" || item.type === "hero" ? "col-span-2 aspect-[2/1]" : "aspect-square"}">
      <img src="${escapeHtml(item.url)}" class="w-full h-full object-cover" />
      ${item.title ? `<div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent p-6 flex flex-col justify-end"><h3 class="text-white text-lg font-black italic">${escapeHtml(item.title)}</h3></div>` : ""}
      <div class="absolute inset-x-0 bottom-0 p-3">
        <div class="flex items-center justify-between text-white bg-black/45 backdrop-blur rounded-2xl px-3 py-2">
          <div class="flex items-center gap-3 text-[10px] font-black">
            <div class="flex items-center gap-1">${icon("heart", "w-3 h-3")}${escapeHtml(counts.likeLabel)}</div>
            <div class="flex items-center gap-1">${icon("message-circle", "w-3 h-3")}${escapeHtml(counts.commentLabel)}</div>
          </div>
          ${item.isVideo ? `<div class="w-9 h-9 rounded-2xl bg-white/15 backdrop-blur flex items-center justify-center">${icon("play", "w-4 h-4")}</div>` : ""}
        </div>
      </div>
    </button>
  `;
}

function renderProfilePostCardFancy(item, isGrid) {
  const counts = resolvePostCounts(item);
  const postAttr = item.id ? `data-open-post="${escapeHtml(item.id)}"` : "";
  const isWide = item.type === "wide" || item.type === "hero";
  const colClass = isGrid && isWide ? "col-span-2" : "";
  const aspectClass = isGrid
    ? (isWide ? "aspect-[1.8/1]" : "aspect-[4/5]")
    : "aspect-[4/5]";
  return `
    <button type="button" ${postAttr} class="${colClass} relative ${aspectClass} rounded-[2rem] overflow-hidden bg-white shadow-[0_30px_60px_-12px_rgba(50,50,93,0.15),0_18px_36px_-18px_rgba(0,0,0,0.15)] cursor-pointer transition-transform">
      <div class="absolute inset-0 rounded-[2rem] overflow-hidden active:scale-[0.98] transition-transform">
        <img src="${escapeHtml(item.url)}" loading="lazy" class="w-full h-full object-cover" />
        ${item.isVideo ? `<div class="absolute top-3 left-3 text-white drop-shadow-md bg-black/20 backdrop-blur-sm rounded-full p-1">${icon("play", "w-3 h-3 fill-white")}</div>` : ""}
        <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex flex-col justify-end p-3 pb-4 pointer-events-none">
          <div class="w-full flex items-end justify-center">
            <div class="flex items-center gap-2.5 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-3 py-1.5 text-white shadow-[0_4px_12px_rgba(0,0,0,0.08)]">
              <div class="flex items-center gap-1">
                ${icon("heart", "w-3 h-3 fill-rose-500 text-rose-500")}
                <span class="text-[10px] font-bold tracking-wide">${escapeHtml(counts.likeLabel)}</span>
              </div>
              <div class="w-px h-3 bg-white/20"></div>
              <div class="flex items-center gap-1">
                ${icon("message-circle", "w-3 h-3 text-indigo-200")}
                <span class="text-[10px] font-bold tracking-wide">${escapeHtml(counts.commentLabel)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </button>
  `;
}

function renderProfilePostsFancy(posts, viewMode) {
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
  return posts.map((post) => renderProfilePostCardFancy(post, isGrid)).join("");
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
      ${checkins.map((place) => `
        <div class="flex items-center gap-4 bg-white p-4 rounded-[2rem] border border-slate-50 shadow-[0_30px_60px_-12px_rgba(50,50,93,0.15),0_18px_36px_-18px_rgba(0,0,0,0.15)] active:scale-[0.98] transition-all cursor-pointer group">
          <div class="w-16 h-16 rounded-2xl bg-slate-100 overflow-hidden shrink-0 shadow-inner group-hover:shadow-md transition-all">
            <img src="${escapeHtml(place.image || "")}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
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
      `).join("")}
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

function renderPublicProfileView() {
  const view = state.profileView;
  if (!view || !view.profile) return "";
  const profile = view.profile;
  const posts = view.posts || profile.posts || [];
  const isFollowing = state.followingHandles.includes(profile.handle);
  return `
    <div class="p-8 animate-in slide-in-from-bottom-10 duration-700 pb-24">
      <div class="flex items-center gap-3 mb-8">
        <button data-public-profile-back="true" class="w-11 h-11 rounded-2xl bg-slate-100 text-slate-500 flex items-center justify-center hover:bg-slate-200">${icon("arrow-left", "w-4 h-4")}</button>
        <div>
          <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest">Profil</p>
          <h2 class="text-xl font-black italic tracking-tighter">${escapeHtml(profile.name || "Business")}</h2>
        </div>
      </div>
      <div class="flex flex-col items-center text-center mb-10">
        <div class="w-32 h-32 rounded-[3.5rem] bg-gradient-to-tr from-indigo-600 to-purple-500 p-1 shadow-2xl shadow-indigo-500/20">
          <img src="${escapeHtml(profile.avatar || "https://via.placeholder.com/300")}" class="w-full h-full rounded-[3.2rem] object-cover border-4 border-white" />
        </div>
        <p class="text-slate-400 font-bold text-[10px] uppercase tracking-widest mt-3">${escapeHtml(profile.location || "-")} / Business</p>
        <div class="flex gap-3 mt-6 w-full max-w-xs justify-center">
          <div class="flex flex-col items-center"><span class="text-lg font-black text-slate-900">${escapeHtml(formatCount(posts.length))}</span><span class="text-[9px] font-bold text-slate-400 uppercase">Posts</span></div>
          <div class="w-px h-8 bg-slate-200 mx-1"></div>
          <div class="flex flex-col items-center"><span class="text-lg font-black text-slate-900">${escapeHtml(formatCount(profile.followers))}</span><span class="text-[9px] font-bold text-slate-400 uppercase">Follower</span></div>
          <div class="w-px h-8 bg-slate-200 mx-1"></div>
          <div class="flex flex-col items-center"><span class="text-lg font-black text-slate-900">${escapeHtml(formatCount(profile.following))}</span><span class="text-[9px] font-bold text-slate-400 uppercase">Following</span></div>
        </div>
        <div class="flex gap-3 mt-8 w-full max-w-xs">
          <button data-public-profile-follow="${escapeHtml(profile.handle)}" class="flex-1 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest active:scale-95 transition-transform ${isFollowing ? "bg-slate-100 text-slate-700" : "bg-indigo-600 text-white shadow-xl shadow-indigo-500/20"}">
            ${isFollowing ? "Following" : "Follow"}
          </button>
        </div>
        <p class="mt-5 text-sm font-medium text-slate-600 leading-relaxed">${escapeHtml(profile.bio || "")}</p>
      </div>
      <div class="grid grid-cols-2 gap-3">
        ${renderProfilePosts(posts)}
      </div>
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
  return `
    <div class="pb-24">
      <div class="px-5 pb-2 pt-10">
        <input type="file" id="profileAvatarInput" class="hidden" accept="image/*" />
        <div class="bg-white rounded-[2.5rem] p-8 shadow-[0_30px_60px_-12px_rgba(50,50,93,0.15),0_18px_36px_-18px_rgba(0,0,0,0.15)] relative overflow-hidden z-10 border border-slate-100">
          <div class="absolute top-[-60px] right-[-60px] w-64 h-64 bg-gradient-to-bl from-indigo-100 via-purple-100 to-transparent rounded-full blur-3xl opacity-60 pointer-events-none mix-blend-multiply"></div>
          <div class="absolute top-[-20px] right-[-20px] w-32 h-32 bg-white/40 rounded-full blur-xl pointer-events-none"></div>

          <div class="relative z-10">
            <div class="flex justify-between items-start mb-8">
              <div id="profileAvatarTrigger" class="relative cursor-pointer group">
                <div class="absolute -inset-2 bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 rounded-[2.5rem] blur-md group-hover:blur-lg transition-all duration-500"></div>
                <div class="relative w-[100px] h-[100px] rounded-[2rem] p-[3px] bg-gradient-to-br from-white to-slate-50 shadow-sm">
                  <img src="${escapeHtml(profile.avatar || "https://via.placeholder.com/300")}" class="w-full h-full rounded-[1.8rem] object-cover" />
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
        <div class="${state.profileViewMode === "grid" ? "grid grid-cols-2 gap-4 px-6" : "flex flex-col gap-8 px-6"}">
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
        type: "square",
        caption: p.content || "",
        createdAt: p.createdAt,
        likes: p.likes ?? 0,
        comments: p.comments ?? 0
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

    const profileDoc = profileSnap?.data || null;
    const resolved = normalizeExternalProfile({
      profileDoc,
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

function toggleFollow(handle) {
  if (!handle) return;
  const idx = state.followingHandles.indexOf(handle);
  const profileModal = state.profileModal.profile;
  const profileView = state.profileView?.profile || null;
  const toNum = (value) => {
    const n = Number(value);
    return Number.isFinite(n) ? n : 0;
  };
  const delta = idx >= 0 ? -1 : 1;

  if (idx >= 0) {
    state.followingHandles.splice(idx, 1);
    state.userProfile.following = Math.max(0, toNum(state.userProfile.following) - 1);
    if (profileModal && profileModal.handle === handle) {
      profileModal.followers = Math.max(0, toNum(profileModal.followers) - 1);
    }
    if (profileView && profileView.handle === handle) {
      profileView.followers = Math.max(0, toNum(profileView.followers) - 1);
    }
  } else {
    state.followingHandles.unshift(handle);
    state.userProfile.following = toNum(state.userProfile.following) + 1;
    if (profileModal && profileModal.handle === handle) {
      profileModal.followers = toNum(profileModal.followers) + 1;
    }
    if (profileView && profileView.handle === handle) {
      profileView.followers = toNum(profileView.followers) + 1;
    }
  }

  businessProfileCache.forEach((cached) => {
    if (cached?.handle !== handle) return;
    cached.followers = Math.max(0, toNum(cached.followers) + delta);
  });

  saveFollowing(state.followingHandles);
  if (state.profileModal.open && !state.profileView) {
    renderOverlays();
  } else {
    render();
  }
}

function renderProfileModal() {
  if (!state.profileModal.open || !state.profileModal.profile) return "";
  const p = state.profileModal.profile;
  const isFollowing = state.followingHandles.includes(p.handle);

  return `
    <div class="fixed inset-0 z-[60]">
      <div id="profileModalOverlay" class="absolute inset-0 bg-black/60"></div>
      <div class="absolute inset-x-0 bottom-0 max-w-md mx-auto">
        <div class="bg-white rounded-t-[3rem] shadow-2xl border border-slate-100 p-7">
          <div class="flex justify-end mb-4">
            <button id="profileModalClose" class="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-500">${icon("x", "w-4 h-4")}</button>
          </div>

          <div class="flex items-center gap-4">
            <img src="${escapeHtml(p.avatar)}" class="w-16 h-16 rounded-2xl object-cover shadow" />
            <div class="flex-1 min-w-0">
              <p class="text-xs font-black">@${escapeHtml(p.handle)}</p>
              <p class="text-[10px] text-slate-400 font-bold uppercase tracking-widest">${escapeHtml(p.location)} / Business</p>
            </div>
            <button id="profileFollowBtn" data-handle="${escapeHtml(p.handle)}" class="px-5 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest active:scale-95 transition-transform ${isFollowing ? "bg-slate-100 text-slate-700" : "bg-indigo-600 text-white shadow-xl shadow-indigo-500/20"}">
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
  const likeCount = comment.likes?.length || 0;
  const isReply = !!parentId;
  return `
    <div class="flex gap-3 ${isReply ? "ml-10" : ""}">
      <img src="${escapeHtml(comment.avatar)}" class="w-9 h-9 rounded-2xl object-cover shadow" />
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

function renderPostModal() {
  if (!state.postModal.open || !state.postModal.post) return "";
  const post = state.postModal.post;
  const meta = ensurePostMeta(post.id);
  const counts = resolvePostCounts(post);
  const caption = post.caption || post.title || "";
  const imageUrl = post.url || post.image || "";
  const comments = (meta.comments || []).map(ensureCommentShape);
  const isLiked = meta.likes?.some((item) => item.handle === currentUserBadge().handle);
  const replyTarget = comments.find((item) => item.id === state.postModal.replyTo);

  return `
    <div class="fixed inset-0 z-[70]">
      <div id="postModalOverlay" class="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
      <div class="absolute inset-x-0 bottom-0 max-w-md mx-auto">
        <div class="bg-white rounded-t-[3rem] shadow-2xl border border-slate-100 p-7 animate-in slide-in-from-bottom-10">
          <div class="flex items-center justify-between mb-4">
            <div>
              <span class="text-[9px] font-black text-indigo-600 uppercase tracking-widest">Post</span>
              <h3 class="text-xl font-black italic tracking-tighter">${escapeHtml(formatDateLabel(post.createdAt || new Date()))}</h3>
              <p class="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1">Foto</p>
            </div>
            <button id="postModalClose" class="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-500">${icon("x", "w-4 h-4")}</button>
          </div>

          <div class="rounded-[2.5rem] overflow-hidden shadow-lg border border-slate-100">
            <img src="${escapeHtml(imageUrl)}" class="w-full h-[22rem] object-cover" />
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
              <span>${escapeHtml(counts.commentLabel)} Kommentare</span>
            </div>
          </div>

          <div class="mt-5 space-y-4 max-h-56 overflow-y-auto no-scrollbar">
            ${comments.length ? comments.map((comment) => `
              <div class="space-y-3">
                ${renderCommentItem(post.id, comment)}
                ${(comment.replies || []).map((reply) => renderCommentItem(post.id, reply, comment.id)).join("")}
              </div>
            `).join("") : `
              <div class="text-center text-[10px] font-bold uppercase text-slate-400">Noch keine Kommentare</div>
            `}
          </div>

          ${replyTarget ? `
            <div class="mt-4 flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100">
              <div class="text-[10px] font-bold uppercase text-slate-400">Antwort an @${escapeHtml(replyTarget.handle)}</div>
              <button id="postReplyCancel" class="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Abbrechen</button>
            </div>
          ` : ""}

          <div class="mt-4 flex gap-3">
            <textarea id="postCommentInput" placeholder="Schreib einen Kommentar..." class="flex-1 p-4 rounded-2xl border border-slate-100 bg-white text-sm font-medium outline-none resize-none" rows="2">${escapeHtml(state.postModal.commentText || "")}</textarea>
            <button id="postCommentSend" data-post-id="${escapeHtml(post.id)}" class="w-14 h-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-xl shadow-indigo-500/20">
              ${icon("send", "w-4 h-4")}
            </button>
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

  return `
    <div class="fixed inset-0 z-[80]">
      <div id="likesModalOverlay" class="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
      <div class="absolute inset-x-0 bottom-0 max-w-md mx-auto">
        <div class="bg-white rounded-t-[3rem] shadow-2xl border border-slate-100 p-7 animate-in slide-in-from-bottom-10">
          <div class="flex items-center justify-between mb-6">
            <div>
              <span class="text-[9px] font-black text-indigo-600 uppercase tracking-widest">Likes</span>
              <h3 class="text-xl font-black italic tracking-tighter">${likes.length} Likes</h3>
            </div>
            <button id="likesModalClose" class="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-500">${icon("x", "w-4 h-4")}</button>
          </div>

          <div class="space-y-3 max-h-60 overflow-y-auto no-scrollbar">
            ${likes.length ? likes.map((user) => `
              <div class="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <img src="${escapeHtml(user.avatar)}" class="w-10 h-10 rounded-2xl object-cover" />
                <div>
                  <div class="text-xs font-black">${escapeHtml(user.name)}</div>
                  <div class="text-[9px] font-bold text-slate-400 uppercase">@${escapeHtml(user.handle)}</div>
                </div>
              </div>
            `).join("") : `
              <div class="text-center text-[10px] font-bold uppercase text-slate-400">Noch keine Likes</div>
            `}
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderSettingsView() {
  const settings = state.settings;
  const profile = state.userProfile;

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
            <img src="${escapeHtml(profile.avatar || "https://via.placeholder.com/300")}" class="w-28 h-28 rounded-[3rem] object-cover border-4 border-white shadow-xl" />
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
    <div class="p-6 animate-in slide-in-from-right-10 duration-700 h-full">
      <div class="flex justify-between items-end mb-8 px-2">
        <h2 class="text-2xl font-black italic uppercase">Updates</h2>
        <button id="markAllRead" class="text-[10px] font-bold text-indigo-600 uppercase tracking-widest hover:text-indigo-500">Alle gelesen</button>
      </div>
      <div class="space-y-3">
        ${state.notifications.length === 0 ? "<div class='text-center py-20 text-slate-400 font-bold text-xs uppercase'>Keine neuen Updates</div>" :
          state.notifications.map((n) => `
            <div class="flex items-center gap-4 p-4 rounded-[2rem] border transition-all relative overflow-hidden group ${n.read ? "bg-white border-slate-50" : "bg-indigo-50/50 border-indigo-100"}">
              <img src="${escapeHtml(n.img)}" class="w-12 h-12 rounded-2xl object-cover shadow-sm" />
              <div class="flex-1 min-w-0">
                <p class="text-xs font-medium text-slate-800"><span class="font-black">${escapeHtml(n.user)}</span> ${escapeHtml(n.text)}</p>
                <p class="text-[9px] text-slate-400 font-bold uppercase mt-1">${escapeHtml(n.time)}</p>
              </div>
              <div class="flex items-center gap-2">
                ${!n.read ? "<div class=\"w-2 h-2 bg-indigo-500 rounded-full\"></div>" : ""}
                <button data-notif-delete="${n.id}" class="p-2 text-slate-300 hover:text-rose-500">${icon("trash-2", "w-4 h-4")}</button>
              </div>
            </div>
          `).join("")}
      </div>
    </div>
  `;
}

function renderUploadView() {
  const profile = state.userProfile;
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
          <img src="${escapeHtml(state.upload.preview)}" class="w-full h-64 object-cover rounded-[2.5rem] shadow-lg" />
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
  return `
    <header class="p-6 pb-2 flex justify-between items-center sticky top-0 z-40 backdrop-blur-xl bg-slate-50/80">
      <button id="drawerToggle" class="w-14 h-14 rounded-3xl shadow-xl flex flex-col gap-1.5 items-start justify-center p-4 active:scale-95 transition-all bg-white border border-slate-50 shadow-slate-200/30">
        <div class="w-6 h-0.5 rounded-full bg-slate-900"></div>
        <div class="w-4 h-0.5 rounded-full bg-slate-900"></div>
        <div class="w-5 h-0.5 rounded-full bg-slate-900"></div>
      </button>
      <div class="text-center cursor-pointer" data-nav="feed">
        <h1 class="text-2xl font-black italic tracking-tighter leading-none text-slate-900">MENYRA</h1>
        <span class="text-[9px] font-black text-indigo-600 uppercase tracking-[0.4em] block">Social</span>
      </div>
      <button data-nav="profile" class="w-14 h-14 rounded-3xl shadow-xl overflow-hidden p-1 active:scale-95 transition-transform bg-white border border-slate-50 shadow-slate-200/30">
        <img src="${escapeHtml(state.userProfile.avatar || "https://via.placeholder.com/80")}" class="w-full h-full rounded-[1.4rem] object-cover" />
      </button>
    </header>
  `;
}

function renderMain() {
  let view = "";
  if (state.activeTab === "feed") view = renderFeedView();
  if (state.activeTab === "map") view = renderMapView();
  if (state.activeTab === "profile") view = state.profileView ? renderPublicProfileView() : renderProfileView();
  if (state.activeTab === "settings") view = renderSettingsView();
  if (state.activeTab === "notifications") view = renderNotificationsView();
  if (state.activeTab === "upload") view = renderUploadView();

  return `
    <div class="min-h-screen bg-slate-50 text-slate-900 max-w-md mx-auto shadow-2xl relative flex flex-col overflow-hidden font-sans transition-colors duration-500">
      ${renderDrawer()}
      ${renderHeader()}
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
  return root;
}

function renderOverlays() {
  const root = ensureOverlayRoot();
  root.innerHTML = `${renderProfileModal()}${renderPostModal()}${renderLikesModal()}`;
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
  if (window.lucide?.createIcons) {
    window.lucide.createIcons();
  }
  bindOverlayEvents();
}

function renderLoading() {
  return `
    <div class="min-h-screen flex items-center justify-center text-slate-400 text-sm font-bold">
      Lade MENYRA Social...
    </div>
  `;
}

function render() {
  if (renderSuspended > 0) {
    renderQueued = true;
    return;
  }
  if (!state.sessionReady) {
    appEl.innerHTML = renderLoading();
  } else if (!state.user) {
    appEl.innerHTML = renderAuthScreen();
    bindAuthEvents();
  } else {
    appEl.innerHTML = renderMain();
    bindAppEvents();
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

function bindOverlayEvents() {
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
      if (handle) toggleFollow(handle);
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
      state.likesModal = { open: true, postId };
      renderOverlays();
    });
  }

  const likesModalOverlay = document.getElementById("likesModalOverlay");
  const likesModalClose = document.getElementById("likesModalClose");
  const closeLikes = () => {
    state.likesModal = { open: false, postId: "" };
    renderOverlays();
  };
  if (likesModalOverlay) likesModalOverlay.addEventListener("click", closeLikes);
  if (likesModalClose) likesModalClose.addEventListener("click", closeLikes);

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
      addComment(postId, state.postModal.commentText, state.postModal.replyTo);
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
        safeStorage.removeItem(STORAGE_KEYS.profile);
        safeStorage.removeItem(STORAGE_KEYS.following);
        safeStorage.removeItem(STORAGE_KEYS.postMeta);
        state.followingHandles = [];
        state.postMeta = {};
        state.profileModal = { open: false, profile: null };
        state.profileView = null;
        state.postModal = { open: false, post: null, commentText: "", replyTo: null };
        state.likesModal = { open: false, postId: "" };
        state.selectedBusiness = null;
        cleanupLeaflet();
        setState({ activeTab: "feed", drawerOpen: false });
      });
    }
  });

  document.querySelectorAll("[data-nav]").forEach((btn) => {
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
        postModal: { open: false, post: null, commentText: "", replyTo: null },
        likesModal: { open: false, postId: "" }
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

  const mapLocateBtn = document.getElementById("mapLocateBtn");
  if (mapLocateBtn) {
    mapLocateBtn.addEventListener("click", () => mapLocate());
  }

  const markAll = document.getElementById("markAllRead");
  if (markAll) {
    markAll.addEventListener("click", () => {
      state.notifications = state.notifications.map((n) => ({ ...n, read: true }));
      saveNotifications(state.notifications);
      render();
    });
  }

  document.querySelectorAll("[data-notif-delete]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.notifDelete;
      state.notifications = state.notifications.filter((n) => n.id !== id);
      saveNotifications(state.notifications);
      render();
    });
  });

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
    btn.addEventListener("click", () => {
      openProfileFromBusiness({
        id: btn.dataset.profileId || "",
        name: btn.dataset.profileBusiness || ""
      });
    });
  });

  document.querySelectorAll("[data-open-post]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const postId = btn.dataset.openPost;
      const post = findPostById(postId);
      if (post) openPostModal(post);
    });
  });

  document.querySelectorAll("[data-public-profile-back]").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.profileView = null;
      state.activeTab = "feed";
      render();
    });
  });

  document.querySelectorAll("[data-public-profile-follow]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const handle = btn.dataset.publicProfileFollow;
      if (handle) toggleFollow(handle);
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
}

async function uploadImage(file, ownerId) {
  const maxBytes = 15 * 1024 * 1024;
  if (file.size > maxBytes) throw new Error("Max 15MB pro Bild.");
  if (!String(file.type || "").startsWith("image/")) throw new Error("Nur Bilder erlaubt.");

  const form = new FormData();
  form.append("file", file, file.name || "image.jpg");
  form.append("restaurantId", ownerId || "");

  const res = await fetch(`${BUNNY_EDGE_BASE}/image/upload`, {
    method: "POST",
    body: form
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data?.url) throw new Error(data?.error || "Upload fehlgeschlagen.");
  return String(data.url);
}

async function uploadAvatar(file) {
  if (!state.user) return;
  try {
    const url = await uploadImage(file, state.user.uid);
    await setDoc(doc(db, "users", state.user.uid), {
      avatarUrl: url,
      updatedAt: serverTimestamp()
    }, { merge: true });
    state.userProfile.avatar = url;
    safeStorage.setItem(STORAGE_KEYS.profile, JSON.stringify(state.userProfile));
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
    safeStorage.setItem(STORAGE_KEYS.profile, JSON.stringify(state.userProfile));
  } catch (err) {
    console.error(err);
  }
}

async function updateRestaurantSelection(restaurantId) {
  if (!state.user) return;
  state.userProfile.restaurantId = restaurantId || "";
  state.roleSwitchRestaurantId = restaurantId || state.roleSwitchRestaurantId || "";
  safeStorage.setItem(STORAGE_KEYS.profile, JSON.stringify(state.userProfile));
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
    const url = await uploadImage(state.upload.file, ownerId);

    if (isBusiness) {
      await createBusinessPost({
        restaurantId,
        caption,
        mediaUrl: url,
        mediaType: "image"
      });
      await loadFeedPosts();
    } else {
      await createUserPost({
        uid: state.user.uid,
        caption,
        url
      });
      await loadUserPosts();
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

async function loadUserProfile(user) {
  if (!user) return;
  await ensureUserProfile(user, { city: "Prishtina" });
  const snap = await getDoc(doc(db, "users", user.uid));
  const data = snap.exists() ? snap.data() : {};
  state.userProfile = normalizeProfile(data, user);
  safeStorage.setItem(STORAGE_KEYS.profile, JSON.stringify(state.userProfile));
  render();
}

async function loadRestaurants() {
  try {
    const snap = await getDocs(query(collection(db, "restaurants"), limit(200)));
    const list = [];
    snap.forEach((docSnap) => list.push({ id: docSnap.id, ...docSnap.data() }));
    state.restaurants = list;
    state.businessLocations = list.map((rest, idx) => normalizeBusinessLocation(rest, idx));
    cleanupLeaflet();
    render();
  } catch (err) {
    console.error(err);
  }
}

function normalizeFeedPost(row) {
  const restaurant = state.restaurants.find((r) => r.id === (row.rid || row.restaurantId)) || {};
  const thumb = row.thumbUrl || row.mediaUrl || row.media?.[0]?.thumbUrl || row.media?.[0]?.url || "";
  const caption = row.caption || row.captionShort || "";
  return {
    id: row.id,
    restaurantId: row.rid || row.restaurantId || "",
    business: row.businessName || row.restaurantName || restaurant.name || restaurant.restaurantName || "Business",
    logo: row.logoUrl || restaurant.logoUrl || restaurant.logo || thumb,
    location: row.city || restaurant.city || "Prishtina",
    content: caption,
    image: thumb || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800",
    likes: row.likesCount || "0",
    comments: row.commentsCount || "0",
    time: formatRelative(toDateSafe(row.createdAt)),
    createdAt: row.createdAt,
    category: row.postType || "food",
    isLive: row.isLive || false
  };
}

function normalizeExternalProfile({ profileDoc, restaurant, fallbackName, posts }) {
  const displayName = profileDoc?.displayName || fallbackName || restaurant?.name || restaurant?.restaurantName || "Business";
  const handle = profileDoc?.handle || normalizeHandle(displayName);
  return {
    name: displayName,
    handle: handle || "business",
    bio: profileDoc?.bio || restaurant?.description || restaurant?.bio || "Offizieller Account auf MENYRA Social.",
    avatar: profileDoc?.avatarUrl || restaurant?.logoUrl || restaurant?.logo || "https://i.pravatar.cc/300?u=business",
    location: profileDoc?.city || restaurant?.city || "Kosovo",
    followers: profileDoc?.followersCount ?? profileDoc?.followers ?? 0,
    following: profileDoc?.followingCount ?? profileDoc?.following ?? 0,
    role: "business",
    restaurantId: profileDoc?.restaurantId || restaurant?.id || "",
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
      snap = await getDocs(query(ref, orderBy("createdAt", "desc"), limit(50)));
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
        type: "square",
        title: "",
        caption: row.caption || "",
        createdAt: row.createdAt,
        likes: row.likesCount ?? row.likes ?? 0,
        comments: row.commentsCount ?? row.comments ?? 0,
        isVideo: row.media?.[0]?.type === "video"
      }))
      .filter((row) => row.url);
  } catch (err) {
    console.error(err);
    return [];
  }
}

async function loadFeedPosts() {
  try {
    const ref = collection(db, "socialFeed");
    let snap = null;
    try {
      snap = await getDocs(query(ref, where("status", "==", "active"), orderBy("createdAt", "desc"), limit(30)));
    } catch (err) {
      snap = await getDocs(query(ref, limit(60)));
    }
    const rows = [];
    snap.forEach((docSnap) => rows.push({ id: docSnap.id, ...docSnap.data() }));
    state.feedPosts = rows
      .filter((row) => (row.status || "active") === "active")
      .map(normalizeFeedPost);
    render();
  } catch (err) {
    console.error(err);
  }
}

async function loadUserPosts() {
  if (!state.user) return;
  try {
    const ref = collection(db, "users", state.user.uid, "posts");
    let snap = null;
    try {
      snap = await getDocs(query(ref, orderBy("createdAt", "desc"), limit(50)));
    } catch (err) {
      snap = await getDocs(ref);
    }
    const rows = [];
    snap.forEach((docSnap) => rows.push({ id: docSnap.id, ...docSnap.data() }));
    state.userPosts = rows.map((row) => ({
      id: row.id,
      url: row.url,
      type: row.type || "square",
      title: row.title || "",
      caption: row.caption || "",
      createdAt: row.createdAt,
      likes: row.likesCount ?? row.likes ?? 0,
      comments: row.commentsCount ?? row.comments ?? 0,
      isVideo: !!row.isVideo
    }));
    render();
  } catch (err) {
    console.error(err);
  }
}

async function loadBusinessPosts() {
  const restaurantId = state.userProfile.restaurantId;
  if (!restaurantId) {
    state.businessPosts = [];
    render();
    return;
  }
  try {
    const ref = collection(db, "restaurants", restaurantId, "socialPosts");
    let snap = null;
    try {
      snap = await getDocs(query(ref, orderBy("createdAt", "desc"), limit(50)));
    } catch (err) {
      snap = await getDocs(ref);
    }
    const rows = [];
    snap.forEach((docSnap) => rows.push({ id: docSnap.id, ...docSnap.data() }));
    state.businessPosts = rows
      .filter((row) => (row.status || "active") === "active")
      .map((row) => ({
        id: row.id,
        url: row.media?.[0]?.url || row.mediaUrl || "",
        type: "square",
        title: "",
        caption: row.caption || "",
        createdAt: row.createdAt,
        likes: row.likesCount ?? row.likes ?? 0,
        comments: row.commentsCount ?? row.comments ?? 0,
        isVideo: row.media?.[0]?.type === "video"
      }))
      .filter((row) => row.url);
    render();
  } catch (err) {
    console.error(err);
  }
}

async function loadStoriesFallback(restaurants) {
  const now = Timestamp.now();
  const items = [];
  const slice = restaurants.slice(0, 60);
  for (const rest of slice) {
    try {
      const ref = collection(db, "restaurants", rest.id, "stories");
      const snap = await getDocs(query(ref, where("expiresAt", ">", now), limit(1)));
      if (!snap.empty) {
        items.push({
          restaurantId: rest.id,
          name: rest.name || rest.restaurantName || "Business",
          img: rest.logoUrl || rest.logo || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=150",
          isLive: true
        });
      }
    } catch (err) {
      console.warn(err);
    }
  }
  return items;
}

async function loadStories() {
  try {
    const now = Timestamp.now();
    const snap = await getDocs(query(
      collectionGroup(db, "stories"),
      where("expiresAt", ">", now),
      orderBy("expiresAt", "desc"),
      limit(40)
    ));

    const map = new Map();
    snap.forEach((docSnap) => {
      const rid = docSnap.ref.parent?.parent?.id;
      if (!rid || map.has(rid)) return;
      map.set(rid, docSnap.data() || {});
    });

    const items = Array.from(map.keys()).map((rid) => {
      const rest = state.restaurants.find((r) => r.id === rid) || {};
      return {
        restaurantId: rid,
        name: rest.name || rest.restaurantName || "Business",
        img: rest.logoUrl || rest.logo || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=150",
        isLive: true
      };
    });

    state.stories = items;
    render();
  } catch (err) {
    console.warn("stories fallback", err);
    state.stories = await loadStoriesFallback(state.restaurants);
    render();
  }
}

async function bootstrapUser(user) {
  if (!user) return;
  state.isLoading = true;
  render();
  suspendRender();
  try {
    await loadUserProfile(user);
    await resolveRoleSwitchTargets(user);
    await loadRestaurants();
    await loadFeedPosts();
    await loadUserPosts();
    if (state.userProfile.role === "business") {
      await loadBusinessPosts();
    }
    await loadStories();
  } finally {
    state.isLoading = false;
    resumeRender();
  }
}

loadPersisted();
render();

onAuthStateChanged(auth, (user) => {
  state.user = user;
  state.sessionReady = true;
  if (user) {
    bootstrapUser(user);
  } else {
    state.roleSwitchRoles = [];
    state.roleSwitchRestaurantId = "";
    render();
  }
});

window.addEventListener("load", () => {
  if (window.lucide?.createIcons) {
    window.lucide.createIcons();
  }
});

