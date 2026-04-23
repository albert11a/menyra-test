export function buildStoriesSignatureCore(storyItems = []) {
  return (Array.isArray(storyItems) ? storyItems : [])
    .map((item) => {
      const restaurantId = String(item?.restaurantId || item?.id || "").trim();
      const isLive = item?.isLive ? "1" : "0";
      const truth = String(
        item?.truthSource
        || item?.storyTruthSource
        || item?.storyTruth
        || ""
      ).trim().toLowerCase() || "canonical";
      const mediaType = String(item?.mediaType || item?.type || "").trim().toLowerCase();
      const mediaSrc = String(
        item?.videoUrl
        || item?.imageUrl
        || item?.mediaUrl
        || item?.embedUrl
        || item?.url
        || ""
      ).trim();
      const createdAt = item?.createdAt?.seconds !== undefined
        ? `${item.createdAt.seconds}:${Number(item.createdAt?.nanoseconds) || 0}`
        : String(item?.createdAt || item?.updatedAt || "").trim();
      return `${restaurantId}|${isLive}|${truth}|${mediaType}|${mediaSrc}|${createdAt}`;
    })
    .join(",");
}

export function refreshFeedStoriesCore({
  posts = [],
  force = false,
  fastMode = false,
  allowFeedFallback = false,
  buildStoriesFromFeed,
  currentSignature = ""
} = {}) {
  if (!fastMode || !allowFeedFallback) return { updated: false, signature: currentSignature, stories: [] };
  if (!Array.isArray(posts) || !posts.length) return { updated: false, signature: currentSignature, stories: [] };
  if (typeof buildStoriesFromFeed !== "function") return { updated: false, signature: currentSignature, stories: [] };

  const storySeed = buildStoriesFromFeed(posts);
  if (!storySeed.length) return { updated: false, signature: currentSignature, stories: [] };

  const nextSig = buildStoriesSignatureCore(storySeed);
  if (!force && currentSignature === nextSig) {
    return { updated: false, signature: currentSignature, stories: [] };
  }
  return { updated: true, signature: nextSig, stories: storySeed };
}
