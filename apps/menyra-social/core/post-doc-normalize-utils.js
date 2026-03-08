export function normalizeUserPostDocCore(postId, data = {}, ownerId = "") {
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

export function normalizeRestaurantPostDocCore(postId, data = {}, restaurantId = "") {
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
