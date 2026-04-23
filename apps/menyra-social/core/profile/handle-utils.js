export function normalizeHandleCore(name) {
  return String(name || "user")
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_]/g, "");
}

export function isGenericHandleCore(handle, {
  normalizeHandleFn
} = {}) {
  const normalizeHandle = typeof normalizeHandleFn === "function"
    ? normalizeHandleFn
    : normalizeHandleCore;
  const key = normalizeHandle(handle || "");
  if (!key || key.length < 3) return true;
  return ["admin", "owner", "user", "business", "staff", "ceo", "demo"].includes(key);
}

export function resolvePreferredHandleCore(profile = {}, fallbackName = "", {
  normalizeHandleFn,
  isGenericHandleFn
} = {}) {
  const normalizeHandle = typeof normalizeHandleFn === "function"
    ? normalizeHandleFn
    : normalizeHandleCore;
  const isGenericHandle = typeof isGenericHandleFn === "function"
    ? isGenericHandleFn
    : ((value) => isGenericHandleCore(value, { normalizeHandleFn: normalizeHandle }));
  const raw = String(profile?.handle || "").trim();
  const name = fallbackName || profile?.name || "";
  const candidate = raw || normalizeHandle(name || "user");
  return isGenericHandle(candidate) ? normalizeHandle(name || "user") : candidate;
}

export function normalizeFollowHandleCore(value, {
  normalizeHandleFn
} = {}) {
  const normalizeHandle = typeof normalizeHandleFn === "function"
    ? normalizeHandleFn
    : normalizeHandleCore;
  const raw = String(value || "").replace(/^@+/, "").trim();
  if (!raw) return "";
  return normalizeHandle(raw);
}
