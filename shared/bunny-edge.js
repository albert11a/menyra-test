// =========================================================
// MENYRA - Media Edge Script Base (Cloudflare Worker)
// Set this to your Cloudflare Worker URL.
// =========================================================

const normalizeBase = (value) => String(value || "").trim().replace(/\/+$/, "");
const normalizeUrl = (value) => String(value || "").trim();

const RUNTIME_BASE = (typeof window !== "undefined" && window.MENYRA_MEDIA_EDGE)
  ? normalizeBase(window.MENYRA_MEDIA_EDGE)
  : "";
const RUNTIME_TICKET_ENDPOINT = (typeof window !== "undefined" && window.MENYRA_MEDIA_TICKET_ENDPOINT)
  ? normalizeUrl(window.MENYRA_MEDIA_TICKET_ENDPOINT)
  : "";

const FALLBACK_BASE = normalizeBase("https://menyra-media.alberthoti-vsa.workers.dev/");
const FALLBACK_TICKET_ENDPOINT = "https://us-central1-menyra-c0e68.cloudfunctions.net/issueMediaActionTicket";

export const BUNNY_EDGE_BASE = RUNTIME_BASE || FALLBACK_BASE;
export const MEDIA_TICKET_ENDPOINT = RUNTIME_TICKET_ENDPOINT || FALLBACK_TICKET_ENDPOINT;
