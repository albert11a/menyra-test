function readPerfNow() {
  try {
    if (typeof performance !== "undefined" && typeof performance.now === "function") {
      return performance.now();
    }
  } catch {}
  return Date.now();
}

function normalizeDetailValue(value) {
  if (value === undefined) return undefined;
  if (value === null) return null;
  if (Array.isArray(value)) {
    return value.map((item) => normalizeDetailValue(item));
  }
  if (typeof value === "object") {
    const next = {};
    Object.entries(value).forEach(([key, item]) => {
      const normalized = normalizeDetailValue(item);
      if (normalized !== undefined) {
        next[key] = normalized;
      }
    });
    return next;
  }
  if (typeof value === "number") {
    return Number.isFinite(value) ? Number(value) : String(value);
  }
  if (typeof value === "boolean") return value;
  return String(value || "");
}

function formatPayload(details = {}) {
  const safeDetails = normalizeDetailValue(details);
  if (!safeDetails || typeof safeDetails !== "object" || !Object.keys(safeDetails).length) {
    return "";
  }
  try {
    return ` ${JSON.stringify(safeDetails)}`;
  } catch {
    return "";
  }
}

function ensureTraceState(state, {
  create = false,
  origin = "implicit"
} = {}) {
  if (!state || typeof state !== "object") return null;
  const existing = state.__authStartupTrace;
  if (existing && typeof existing === "object") return existing;
  if (!create) return null;
  const now = readPerfNow();
  const nextSeq = Number(state.__authStartupTraceSeq || 0) + 1;
  const trace = {
    id: `auth-${nextSeq}`,
    origin: String(origin || "implicit").trim() || "implicit",
    startedAt: now,
    lastAt: now
  };
  state.__authStartupTrace = trace;
  state.__authStartupTraceSeq = nextSeq;
  return trace;
}

function emitTrace(trace, step = "", details = {}) {
  if (!trace) return;
  const now = readPerfNow();
  const totalMs = Math.max(0, now - Number(trace.startedAt || now));
  const stepMs = Math.max(0, now - Number(trace.lastAt || trace.startedAt || now));
  trace.lastAt = now;
  const safeStep = String(step || "step").trim() || "step";
  const prefix = `[mnyra][auth-startup][${trace.id}][+${totalMs.toFixed(1)}ms][Δ${stepMs.toFixed(1)}ms] ${safeStep}`;
  console.info(`${prefix}${formatPayload(details)}`);
}

export function summarizeAuthProfile(profile = null, extras = {}) {
  const source = profile && typeof profile === "object" ? profile : {};
  const roles = Array.isArray(source.roles) ? source.roles.filter(Boolean) : [];
  return normalizeDetailValue({
    role: String(source.role || "user").trim().toLowerCase() || "user",
    sourceUserRole: String(source.sourceUserRole || source.role || "user").trim().toLowerCase() || "user",
    roles,
    restaurantId: String(source.restaurantId || "").trim(),
    staffRestaurantId: String(source.staffRestaurantId || "").trim(),
    waiterRestaurantId: String(source.waiterRestaurantId || "").trim(),
    businessAccess: source.businessAccess === true,
    waiterAccess: source.waiterAccess === true,
    ceoParentUid: String(source.ceoParentUid || "").trim(),
    ceoRootUid: String(source.ceoRootUid || "").trim(),
    avatarReady: !!String(source.avatar || "").trim(),
    ...extras
  });
}

export function beginAuthStartupTrace(state, step = "auth.login.start", details = {}) {
  const trace = ensureTraceState(state, {
    create: true,
    origin: step
  });
  emitTrace(trace, step, details);
  return trace?.id || "";
}

export function markAuthStartupTrace(state, step = "auth.step", details = {}) {
  const trace = ensureTraceState(state, {
    create: true,
    origin: step
  });
  emitTrace(trace, step, details);
  return trace?.id || "";
}

export function finishAuthStartupTrace(state, step = "auth.finish", details = {}) {
  const trace = ensureTraceState(state, {
    create: false
  });
  if (!trace) return "";
  emitTrace(trace, step, details);
  state.__lastAuthStartupTrace = {
    ...trace,
    finishedAt: readPerfNow()
  };
  state.__authStartupTrace = null;
  return trace.id || "";
}

export function clearAuthStartupTrace(state) {
  if (!state || typeof state !== "object") return;
  state.__authStartupTrace = null;
}
