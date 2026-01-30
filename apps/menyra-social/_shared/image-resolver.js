import { BUNNY_EDGE_BASE } from "@shared/bunny-edge.js";

export const PLACEHOLDER_IMAGE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23f0f0f0'/%3E%3C/svg%3E";

export function isPlaceholderUrl(url) {
  if (!url) return true;
  return url === PLACEHOLDER_IMAGE;
}

export function getOptimizedImageUrl(path, size = "large") {
  const CDN_BASE = (BUNNY_EDGE_BASE || "https://menyra-media.alberthoti-vsa.workers.dev/").replace(/\/+$/, "") + "/media/";

  if (!path || typeof path !== "string") {
    return PLACEHOLDER_IMAGE;
  }
  const trimmed = path.trim();
  if (!trimmed || trimmed === "undefined" || trimmed === "null" || trimmed === "data") {
    return PLACEHOLDER_IMAGE;
  }
  if (path.startsWith("data:") || path.startsWith("blob:")) {
    return path;
  }

  if (path.includes(".workers.dev/media/")) {
    return path;
  }

  const stripMediaPrefix = (value) => value.startsWith("media/") ? value.slice(6) : value;

  if (path.includes("cdn.menyra.com") || path.includes("r2.dev") || path.includes("digitaloceanspaces")) {
    const key = path.split("/").slice(3).join("/");
    return CDN_BASE + stripMediaPrefix(key);
  }

  const r2Match = path.match(/https?:\/\/pub-[a-zA-Z0-9]+\.r2\.dev\/(.*)/);
  if (r2Match && r2Match[1]) {
    return CDN_BASE + stripMediaPrefix(r2Match[1]);
  }

  if (path.startsWith("http")) {
    return path;
  }

  // Handle bare keys
  const cleanedPath = path.replace(/^\//, "");
  return CDN_BASE + stripMediaPrefix(cleanedPath);
}
