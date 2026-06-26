const DEFAULT_ALLOWED_META_KEYS = new Set([
  "active",
  "count",
  "elapsedMs",
  "force",
  "items",
  "label",
  "phase",
  "prefetchOnly",
  "requestedId",
  "restaurantId",
  "route",
  "scope",
  "source",
  "status",
  "targetId",
  "truthState"
]);

function getWindowObj(windowObj = null) {
  if (windowObj) return windowObj;
  if (typeof window !== "undefined") return window;
  return null;
}

function isEnabled(windowObj = null) {
  const win = getWindowObj(windowObj);
  if (!win) return false;
  try {
    const params = new URLSearchParams(String(win.location?.search || ""));
    if (params.get("mnyraDebugLoading") === "1" || params.get("debugLoading") === "1") return true;
  } catch {}
  try {
    return win.localStorage?.getItem?.("mnyraDebugLoading") === "1";
  } catch {}
  return false;
}

function nowMs() {
  try {
    if (typeof performance !== "undefined" && typeof performance.now === "function") {
      return performance.now();
    }
  } catch {}
  return Date.now();
}

function sanitizeMeta(meta = {}, extraAllowedKeys = []) {
  const out = {};
  const allowed = new Set([
    ...DEFAULT_ALLOWED_META_KEYS,
    ...(Array.isArray(extraAllowedKeys) ? extraAllowedKeys : [])
  ]);
  Object.entries(meta && typeof meta === "object" ? meta : {}).forEach(([key, value]) => {
    if (!allowed.has(key)) return;
    if (value === null || value === undefined) return;
    if (typeof value === "string") {
      const safeValue = value.trim();
      if (safeValue) out[key] = safeValue.slice(0, 160);
      return;
    }
    if (typeof value === "number" && Number.isFinite(value)) {
      out[key] = Math.round(value * 100) / 100;
      return;
    }
    if (typeof value === "boolean") {
      out[key] = value;
    }
  });
  return out;
}

export function isMnyraLoadingDebugEnabledCore({ windowObj = null } = {}) {
  return isEnabled(windowObj);
}

export function markMnyraLoadingEventCore(label = "", meta = {}, {
  windowObj = null,
  allowedMetaKeys = []
} = {}) {
  if (!isEnabled(windowObj)) return;
  const safeLabel = String(label || "event").trim() || "event";
  const safeMeta = sanitizeMeta(meta, allowedMetaKeys);
  try {
    console.debug("[mnyra][loading]", safeLabel, safeMeta);
  } catch {}
}

export async function timeMnyraLoadingAsyncCore(label = "", task = null, meta = {}, {
  windowObj = null,
  allowedMetaKeys = []
} = {}) {
  const enabled = isEnabled(windowObj);
  const safeLabel = String(label || "task").trim() || "task";
  const safeMeta = sanitizeMeta(meta, allowedMetaKeys);
  const startedAt = nowMs();
  if (enabled) markMnyraLoadingEventCore(`${safeLabel}:start`, safeMeta, { windowObj, allowedMetaKeys });
  try {
    const result = typeof task === "function" ? await task() : undefined;
    if (enabled) {
      markMnyraLoadingEventCore(`${safeLabel}:end`, {
        ...safeMeta,
        elapsedMs: nowMs() - startedAt
      }, { windowObj, allowedMetaKeys });
    }
    return result;
  } catch (err) {
    if (enabled) {
      markMnyraLoadingEventCore(`${safeLabel}:error`, {
        ...safeMeta,
        elapsedMs: nowMs() - startedAt,
        status: "error"
      }, { windowObj, allowedMetaKeys });
    }
    throw err;
  }
}
