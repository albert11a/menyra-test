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
  small: { width: 480, quality: 74, fit: "cover" },
  medium: { width: 768, quality: 76, fit: "cover" },
  large: { width: 1280, quality: 80, fit: "cover" }
};
const LAST_GOOD_IMAGE_BY_KEY = new Map();
const LAST_GOOD_IMAGE_MAX_ENTRIES = 500;
const LAST_GOOD_IMAGE_TTL_MS = 6000;

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
  if (key === "avatar" || key === "thumb" || key === "small" || key === "medium" || key === "large") return key;
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
  const options = arguments.length > 2 && arguments[2] && typeof arguments[2] === "object"
    ? arguments[2]
    : null;
  let stableKey = "";
  const variantGroup = options ? String(options.variantGroup || "").trim().toLowerCase() : "";
  if (options) {
    stableKey = String(options.stableKey || "").trim();
  }
  const normalizedSizeKey = normalizeSizeKey(size);
  let sizeKey = normalizedSizeKey;
  if (variantGroup === "menu-detail" && (normalizedSizeKey === "thumb" || normalizedSizeKey === "medium")) {
    sizeKey = "large";
  } else if (variantGroup === "post-detail" && normalizedSizeKey === "medium") {
    sizeKey = "large";
  }
  const buildFirebaseUrl = (bucket, objectPath) => {
    const safePath = encodeURIComponent(String(objectPath || "").replace(/^\/+/, ""));
    if (!bucket || !safePath) return "";
    return `https://firebasestorage.googleapis.com/v0/b/${bucket}/o/${safePath}?alt=media`;
  };
  const getCachedStableImage = () => {
    if (!stableKey) return "";
    const entry = LAST_GOOD_IMAGE_BY_KEY.get(stableKey);
    if (!entry || typeof entry !== "object") return "";
    const url = String(entry.url || "").trim();
    const at = Number(entry.at) || 0;
    if (!url || !at || Date.now() - at > LAST_GOOD_IMAGE_TTL_MS) {
      LAST_GOOD_IMAGE_BY_KEY.delete(stableKey);
      return "";
    }
    return url;
  };
  const rememberStableImage = (url) => {
    if (!stableKey || !url || isPlaceholderUrl(url)) return;
    LAST_GOOD_IMAGE_BY_KEY.set(stableKey, { url, at: Date.now() });
    if (LAST_GOOD_IMAGE_BY_KEY.size <= LAST_GOOD_IMAGE_MAX_ENTRIES) return;
    let oldestKey = "";
    let oldestAt = Infinity;
    LAST_GOOD_IMAGE_BY_KEY.forEach((entry, key) => {
      const at = Number(entry?.at) || 0;
      if (at < oldestAt) {
        oldestAt = at;
        oldestKey = key;
      }
    });
    if (oldestKey) LAST_GOOD_IMAGE_BY_KEY.delete(oldestKey);
  };
  const fallbackToStable = (fallbackValue = PLACEHOLDER_IMAGE) => {
    const cached = getCachedStableImage();
    return cached || fallbackValue;
  };

  if (!path || typeof path !== "string") {
    return fallbackToStable();
  }
  const trimmed = path.trim();
  const lowered = trimmed.toLowerCase();
  if (!trimmed || lowered === "undefined" || lowered === "null" || lowered === "data") {
    return fallbackToStable();
  }
  if (lowered.startsWith("data:") || lowered.startsWith("blob:")) {
    if (!isPlaceholderUrl(trimmed)) rememberStableImage(trimmed);
    return isPlaceholderUrl(trimmed) ? fallbackToStable(trimmed) : trimmed;
  }

  if (lowered.startsWith("gs://")) {
    const match = trimmed.match(/^gs:\/\/([^/]+)\/(.+)$/);
    if (match) {
      const firebaseUrl = buildFirebaseUrl(match[1], match[2]);
      if (firebaseUrl) {
        rememberStableImage(firebaseUrl);
        return firebaseUrl;
      }
    }
  }

  if (trimmed.includes(".workers.dev/media/")) {
    const resolved = addEdgeImageParams(trimmed, sizeKey);
    rememberStableImage(resolved);
    return resolved;
  }

  const stripMediaPrefix = (value) => value.startsWith("media/") ? value.slice(6) : value;

  if (trimmed.includes("cdn.menyra.com") || trimmed.includes("r2.dev") || trimmed.includes("digitaloceanspaces")) {
    const key = trimmed.split("/").slice(3).join("/");
    const resolved = addEdgeImageParams(CDN_BASE + stripMediaPrefix(key), sizeKey);
    rememberStableImage(resolved);
    return resolved;
  }

  const r2Match = trimmed.match(/https?:\/\/pub-[a-zA-Z0-9]+\.r2\.dev\/(.*)/);
  if (r2Match && r2Match[1]) {
    const resolved = addEdgeImageParams(CDN_BASE + stripMediaPrefix(r2Match[1]), sizeKey);
    rememberStableImage(resolved);
    return resolved;
  }

  if (/^https?:\/\//i.test(trimmed)) {
    rememberStableImage(trimmed);
    return trimmed;
  }

  // Handle bare keys
  const cleanedPath = trimmed.replace(/^\//, "");
  const resolved = addEdgeImageParams(CDN_BASE + stripMediaPrefix(cleanedPath), sizeKey);
  rememberStableImage(resolved);
  return resolved;
}
