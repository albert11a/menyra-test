// =========================================================
// MENYRA - Media Edge Script Base (Cloudflare Worker)
// Set this to your Cloudflare Worker URL.
// =========================================================

const normalizeBase = (value) => String(value || "").trim().replace(/\/+$/, "");

const RUNTIME_BASE = (typeof window !== "undefined" && window.MENYRA_MEDIA_EDGE)
  ? normalizeBase(window.MENYRA_MEDIA_EDGE)
  : "";

const FALLBACK_BASE = normalizeBase("https://menyra-media.alberthoti-vsa.workers.dev/");

export const BUNNY_EDGE_BASE = RUNTIME_BASE || FALLBACK_BASE;
