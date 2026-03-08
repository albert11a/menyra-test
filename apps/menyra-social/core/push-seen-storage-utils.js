export function readPushSeenIdsCore({
  uid = "",
  resolvePushSeenKey,
  storage
} = {}) {
  const readKey = typeof resolvePushSeenKey === "function" ? resolvePushSeenKey : (() => "");
  const key = readKey(uid);
  if (!key || !storage?.getItem) return [];
  try {
    const raw = storage.getItem(key);
    const parsed = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((item) => String(item || "").trim())
      .filter(Boolean);
  } catch {
    return [];
  }
}

export function writePushSeenIdsCore({
  ids = [],
  uid = "",
  resolvePushSeenKey,
  storage,
  maxItems = 200
} = {}) {
  const readKey = typeof resolvePushSeenKey === "function" ? resolvePushSeenKey : (() => "");
  const key = readKey(uid);
  if (!key || !storage?.setItem) return;
  const normalized = Array.from(new Set(
    (Array.isArray(ids) ? ids : [])
      .map((item) => String(item || "").trim())
      .filter(Boolean)
  )).slice(-Math.max(1, Number(maxItems) || 200));
  storage.setItem(key, JSON.stringify(normalized));
}
