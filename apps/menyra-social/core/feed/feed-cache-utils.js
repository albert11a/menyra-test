export function computeLatestTimestampCore({
  posts = [],
  toDateSafe
} = {}) {
  if (!Array.isArray(posts) || typeof toDateSafe !== "function") return 0;
  let latest = 0;
  posts.forEach((post) => {
    const ts = toDateSafe(post?.createdAt)?.getTime?.() || 0;
    if (ts > latest) latest = ts;
  });
  return latest;
}

export function saveFeedPostsCore({
  posts = [],
  extraMeta = {},
  toDateSafe,
  writeCache,
  feedCacheKey,
  feedFallbackLimit = 0
} = {}) {
  if (!Array.isArray(posts)) return;
  if (typeof writeCache !== "function") return;
  if (!feedCacheKey) return;
  const latestTs = computeLatestTimestampCore({ posts, toDateSafe });
  const limit = Math.max(0, Number(feedFallbackLimit) || 0);
  const trimmed = limit > 0 ? posts.slice(0, limit) : posts.slice();
  writeCache(feedCacheKey, trimmed, { latestTs, ...extraMeta });
}
