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

export const GUEST_SCOPE_UID = "guest";
