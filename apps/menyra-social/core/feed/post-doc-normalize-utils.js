function resolvePostMediaUrl(data = {}) {
  return String(
    data.url
    || data.mediaUrl
    || data.media?.[0]?.url
    || data.media?.[0]?.thumbUrl
    || data.imageUrl
    || data.image
    || data.photoUrl
    || data.pictureUrl
    || ""
  ).trim();
}

function resolvePostIsVideo(data = {}) {
  const type = String(
    data.media?.[0]?.type
    || data.mediaType
    || data.type
    || ""
  ).trim().toLowerCase();
  return data.isVideo === true || type === "video" || type.startsWith("video/");
}

export function normalizeUserPostDocCore(postId, data = {}, ownerId = "") {
  return {
    id: postId,
    url: resolvePostMediaUrl(data),
    type: data.type || "square",
    title: data.title || "",
    caption: data.caption || "",
    createdAt: data.createdAt,
    likes: data.likesCount ?? data.likes ?? 0,
    comments: data.commentsCount ?? data.comments ?? 0,
    isVideo: resolvePostIsVideo(data),
    ownerType: "user",
    ownerId: ownerId || ""
  };
}

export function normalizeRestaurantPostDocCore(postId, data = {}, restaurantId = "") {
  return {
    id: postId,
    url: resolvePostMediaUrl(data),
    type: data.type || "square",
    title: data.title || "",
    caption: data.caption || "",
    createdAt: data.createdAt,
    likes: data.likesCount ?? data.likes ?? 0,
    comments: data.commentsCount ?? data.comments ?? 0,
    isVideo: resolvePostIsVideo(data),
    ownerType: "restaurant",
    ownerId: restaurantId || "",
    restaurantId: restaurantId || ""
  };
}
