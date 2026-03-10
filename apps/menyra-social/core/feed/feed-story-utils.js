export function buildStoriesSignatureCore(storyItems = []) {
  return (Array.isArray(storyItems) ? storyItems : [])
    .map((item) => {
      const restaurantId = String(item?.restaurantId || item?.id || "").trim();
      const img = String(item?.img || item?.logo || "").trim();
      const name = String(item?.name || "").trim();
      const isLive = item?.isLive ? "1" : "0";
      return `${restaurantId}|${img}|${name}|${isLive}`;
    })
    .join(",");
}

export function refreshFeedStoriesCore({
  posts = [],
  force = false,
  fastMode = false,
  buildStoriesFromFeed,
  currentSignature = ""
} = {}) {
  if (!fastMode) return { updated: false, signature: currentSignature, stories: [] };
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
