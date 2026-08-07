import { normalizePostSurfaceCore } from "../common/post-surface-utils.js";

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

// Standbild fuer Video-Posts (Poster/erstes Frame): eigenes Feld, damit
// Grid-Karten und das Post-Modal eine Vorschau zeigen koennen, ohne die
// Video-Bytes zu laden.
function resolvePostPosterUrl(data = {}) {
  return String(
    data.posterUrl
    || data.thumbUrl
    || data.media?.[0]?.thumbUrl
    || data.media?.[0]?.posterUrl
    || data.imageUrl
    || data.image
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
    posterUrl: resolvePostPosterUrl(data),
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
    posterUrl: resolvePostPosterUrl(data),
    // Entscheidet, ob der Beitrag im Profil-Grid steht. Leer = Beitrag von
    // frueher, der weiter im Profil bleibt.
    surface: normalizePostSurfaceCore(data.surface),
    ownerType: "restaurant",
    ownerId: restaurantId || "",
    restaurantId: restaurantId || ""
  };
}
