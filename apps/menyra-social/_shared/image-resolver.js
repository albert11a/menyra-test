import { BUNNY_EDGE_BASE } from "/shared/bunny-edge.js";

export const PLACEHOLDER_IMAGE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23f0f0f0'/%3E%3C/svg%3E";
const FIREBASE_STORAGE_BUCKET = "menyra-c0e68.firebasestorage.app";
const EDGE_BASE = (BUNNY_EDGE_BASE || "https://menyra-media.alberthoti-vsa.workers.dev/").replace(/\/+$/, "");
const CDN_BASE = `${EDGE_BASE}/media/`;
const EDGE_HOST = (() => {
  try {
    return new URL(EDGE_BASE).hostname.toLowerCase();
  } catch {
    return "";
  }
})();
const IMAGE_SIZE_PRESETS = {
  avatar: { width: 96, quality: 72, fit: "contain" },
  thumb: { width: 160, quality: 72, fit: "cover" },
  medium: { width: 768, quality: 76, fit: "cover" },
  large: { width: 1280, quality: 80, fit: "cover" }
};

export function isPlaceholderUrl(url) {
  if (!url) return true;
  return url === PLACEHOLDER_IMAGE;
}

export function getFirebaseStorageUrl(path) {
  if (!path || typeof path !== "string") return "";
  const trimmed = path.trim();
  if (!trimmed) return "";
  const lowered = trimmed.toLowerCase();
  if (lowered.startsWith("http://") || lowered.startsWith("https://") || lowered.startsWith("data:") || lowered.startsWith("blob:")) {
    return trimmed;
  }
  if (lowered.startsWith("gs://")) {
    const match = trimmed.match(/^gs:\/\/([^/]+)\/(.+)$/);
    if (match) {
      const safePath = encodeURIComponent(String(match[2] || "").replace(/^\/+/, ""));
      return `https://firebasestorage.googleapis.com/v0/b/${match[1]}/o/${safePath}?alt=media`;
    }
  }
  const safePath = encodeURIComponent(trimmed.replace(/^\/+/, ""));
  return FIREBASE_STORAGE_BUCKET && safePath
    ? `https://firebasestorage.googleapis.com/v0/b/${FIREBASE_STORAGE_BUCKET}/o/${safePath}?alt=media`
    : "";
}

function normalizeSizeKey(size = "large") {
  const key = String(size || "").trim().toLowerCase();
  if (key === "avatar" || key === "thumb" || key === "medium" || key === "large") return key;
  return "large";
}

function addEdgeImageParams(url, size = "large") {
  const preset = IMAGE_SIZE_PRESETS[normalizeSizeKey(size)] || IMAGE_SIZE_PRESETS.large;
  let parsed = null;
  try {
    parsed = new URL(url);
  } catch {
    return url;
  }
  const host = String(parsed.hostname || "").toLowerCase();
  const path = String(parsed.pathname || "");
  const isEdgeHost = EDGE_HOST && host === EDGE_HOST;
  const isWorkerHost = host.endsWith(".workers.dev");
  if (!path.startsWith("/media/")) return url;
  if (!isEdgeHost && !isWorkerHost) return url;
  if (preset.width) parsed.searchParams.set("w", String(preset.width));
  if (preset.quality) parsed.searchParams.set("q", String(preset.quality));
  if (preset.fit) parsed.searchParams.set("fit", String(preset.fit));
  parsed.searchParams.set("fm", "auto");
  return parsed.toString();
}

export function getOptimizedImageUrl(path, size = "large") {
  const sizeKey = normalizeSizeKey(size);
  const buildFirebaseUrl = (bucket, objectPath) => {
    const safePath = encodeURIComponent(String(objectPath || "").replace(/^\/+/, ""));
    if (!bucket || !safePath) return "";
    return `https://firebasestorage.googleapis.com/v0/b/${bucket}/o/${safePath}?alt=media`;
  };

  if (!path || typeof path !== "string") {
    return PLACEHOLDER_IMAGE;
  }
  const trimmed = path.trim();
  const lowered = trimmed.toLowerCase();
  if (!trimmed || lowered === "undefined" || lowered === "null" || lowered === "data") {
    return PLACEHOLDER_IMAGE;
  }
  if (lowered.startsWith("data:") || lowered.startsWith("blob:")) {
    return trimmed;
  }

  if (lowered.startsWith("gs://")) {
    const match = trimmed.match(/^gs:\/\/([^/]+)\/(.+)$/);
    if (match) {
      const firebaseUrl = buildFirebaseUrl(match[1], match[2]);
      if (firebaseUrl) return firebaseUrl;
    }
  }

  if (trimmed.includes(".workers.dev/media/")) {
    return addEdgeImageParams(trimmed, sizeKey);
  }

  const stripMediaPrefix = (value) => value.startsWith("media/") ? value.slice(6) : value;

  if (trimmed.includes("cdn.menyra.com") || trimmed.includes("r2.dev") || trimmed.includes("digitaloceanspaces")) {
    const key = trimmed.split("/").slice(3).join("/");
    return addEdgeImageParams(CDN_BASE + stripMediaPrefix(key), sizeKey);
  }

  const r2Match = trimmed.match(/https?:\/\/pub-[a-zA-Z0-9]+\.r2\.dev\/(.*)/);
  if (r2Match && r2Match[1]) {
    return addEdgeImageParams(CDN_BASE + stripMediaPrefix(r2Match[1]), sizeKey);
  }

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  // Handle bare keys
  const cleanedPath = trimmed.replace(/^\//, "");
  return addEdgeImageParams(CDN_BASE + stripMediaPrefix(cleanedPath), sizeKey);
}
