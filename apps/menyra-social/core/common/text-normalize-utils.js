export function sanitizeDisplayNameCore(value, fallback) {
  const cleaned = String(value || "").trim();
  if (!cleaned) return fallback;
  const lower = cleaned.toLowerCase();
  if (lower === "data" || lower === "undefined" || lower === "null") return fallback;
  return cleaned;
}

export function normalizeSearchQueryCore(value) {
  return String(value || "").trim();
}

export function normalizeSearchKeyCore(value) {
  return normalizeSearchQueryCore(value).toLowerCase();
}
