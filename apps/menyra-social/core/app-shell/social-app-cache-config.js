export const CACHE_KEYS = {
  feed: "menyra_social_feed_cache_v1",
  restaurants: "menyra_social_restaurants_cache_v1",
  restaurantsPreview: "menyra_social_restaurants_preview_cache_v1",
  stories: "menyra_social_stories_cache_v1",
  menu: "menyra_social_menu_cache_v1"
};

export const userPostsKey = (uid) => (uid ? `menyra_social_user_posts_cache_v2::${uid}` : "");
export const businessPostsKey = (rid) => (rid ? `menyra_social_business_posts_cache_v2::${rid}` : "");
export const staffCacheKey = (uid) => (uid ? `menyra_social_staff_cache_v1::${uid}` : "");
export const leadPageCacheKey = (uid, scope) => (uid && scope ? `menyra_social_leads_cache_v1::${uid}::${scope}` : "");
export const customerPageCacheKey = (uid, scope) => (uid && scope ? `menyra_social_customers_cache_v1::${uid}::${scope}` : "");

export const CACHE_TTL_MS = {
  feed: 10 * 60 * 1000,
  menu: 15 * 60 * 1000,
  posts: 10 * 60 * 1000,
  restaurants: 60 * 60 * 1000,
  stories: 10 * 60 * 1000,
  staff: 90 * 1000,
  crmPages: 90 * 1000
};

export const FEED_DELTA_MIN_MS = 15 * 60 * 1000;
export const FEED_PRELOAD_LIMIT = 3;
export const FEED_PRELOAD_ATTR = "data-menyrasocial-feed-preload";
export const FEED_META_LISTEN_LIMIT = 20;
