const DEFAULT_ALLOWED_META_KEYS = new Set([
  "active",
  "cacheHit",
  "commitAccepted",
  "count",
  "discardReason",
  "duplicateRequestsPrevented",
  "elapsedMs",
  "force",
  "functionName",
  "generation",
  "items",
  "label",
  "phase",
  "prefetchOnly",
  "profileKey",
  "requestedId",
  "requestId",
  "resultStatus",
  "restaurantId",
  "route",
  "scope",
  "section",
  "source",
  "status",
  "targetId",
  "truthState"
]);

const COUNTER_KEYS = new Set([
  "cache_hits",
  "cache_misses",
  "canonical_resolves",
  "cloud_function_calls",
  "duplicate_requests_prevented",
  "firestore_read_count",
  "menu_reads",
  "focus_reads",
  "posts_reads",
  "retry_count",
  "stale_results_discarded"
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

function getCounterStore(windowObj = null) {
  const win = getWindowObj(windowObj);
  if (win) {
    if (!win.__mnyraLoadingCounters || typeof win.__mnyraLoadingCounters !== "object") {
      win.__mnyraLoadingCounters = {};
    }
    return win.__mnyraLoadingCounters;
  }
  const root = typeof globalThis !== "undefined" ? globalThis : null;
  if (!root) return {};
  if (!root.__mnyraLoadingCounters || typeof root.__mnyraLoadingCounters !== "object") {
    root.__mnyraLoadingCounters = {};
  }
  return root.__mnyraLoadingCounters;
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

export function incrementMnyraLoadingCounterCore(key = "", amount = 1, {
  windowObj = null
} = {}) {
  const safeKey = String(key || "").trim();
  if (!COUNTER_KEYS.has(safeKey)) return 0;
  const numericAmount = Number(amount);
  const increment = Number.isFinite(numericAmount) ? numericAmount : 1;
  const store = getCounterStore(windowObj);
  store[safeKey] = Math.max(0, Number(store[safeKey] || 0) || 0) + increment;
  return store[safeKey];
}

export function getMnyraLoadingCountersCore({
  windowObj = null
} = {}) {
  return { ...getCounterStore(windowObj) };
}

export function resetMnyraLoadingCountersCore({
  windowObj = null
} = {}) {
  const store = getCounterStore(windowObj);
  Object.keys(store).forEach((key) => {
    delete store[key];
  });
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
