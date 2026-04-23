// Shared local storage utilities and key builders for the social app.

export const safeStorage = {
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

export const STORAGE_KEYS = {
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
  menuLayout: "menyra_social_menu_layout_v1",
  authSnapshot: "menyra_social_auth_snapshot_v1"
};

export const profileKey = (uid) => (uid ? `${STORAGE_KEYS.profile}::${uid}` : "");
export const avatarKey = (uid) => (uid ? `${STORAGE_KEYS.avatarCache}::${uid}` : "");
export const notificationsKey = (uid) => (uid ? `${STORAGE_KEYS.notifications}::${uid}` : "");
export const followingKey = (uid) => (uid ? `${STORAGE_KEYS.following}::${uid}` : "");
export const shopCartKey = (uid) => (uid ? `${STORAGE_KEYS.shopCart}::${uid}` : "");
export const chatIndexKey = (uid) => (uid ? `${STORAGE_KEYS.chatIndex}::${uid}` : "");
export const pushSeenKey = (uid) => (uid ? `${STORAGE_KEYS.notifications}::push_seen::${uid}` : "");
export const pushTokenMetaKey = (uid) => (uid ? `${STORAGE_KEYS.notifications}::push_meta::${uid}` : "");
export const pushDeviceIdKey = () => `${STORAGE_KEYS.notifications}::push_device_id`;

const GUEST_SCOPE_SESSION_KEY = "menyra_social_guest_scope_session_v1";
const LEGACY_GLOBAL_GUEST_SCOPE_UID = "guest";
let guestScopeUidMemo = "";

function createGuestScopeUidToken() {
  const randomPart = (() => {
    try {
      if (globalThis?.crypto?.getRandomValues) {
        const bytes = new Uint8Array(12);
        globalThis.crypto.getRandomValues(bytes);
        return Array.from(bytes).map((value) => value.toString(16).padStart(2, "0")).join("");
      }
    } catch {}
    return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 12)}`;
  })();
  return `guest_${randomPart}`;
}

function readGuestScopeUidFromSessionStorage() {
  try {
    return String(globalThis?.sessionStorage?.getItem?.(GUEST_SCOPE_SESSION_KEY) || "").trim();
  } catch {
    return "";
  }
}

function writeGuestScopeUidToSessionStorage(guestScopeUid = "") {
  const safeGuestScopeUid = String(guestScopeUid || "").trim();
  if (!safeGuestScopeUid) return;
  try {
    globalThis?.sessionStorage?.setItem?.(GUEST_SCOPE_SESSION_KEY, safeGuestScopeUid);
  } catch {}
}

export function getGuestScopeUid() {
  if (guestScopeUidMemo) return guestScopeUidMemo;
  const stored = readGuestScopeUidFromSessionStorage();
  if (stored) {
    guestScopeUidMemo = stored;
    return guestScopeUidMemo;
  }
  guestScopeUidMemo = createGuestScopeUidToken();
  writeGuestScopeUidToSessionStorage(guestScopeUidMemo);
  return guestScopeUidMemo;
}

export const GUEST_SCOPE_UID = getGuestScopeUid();
export const LEGACY_GUEST_SCOPE_UID = LEGACY_GLOBAL_GUEST_SCOPE_UID;
