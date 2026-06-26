export const PROFILE_SECTION_KEYS = Object.freeze([
  "identity",
  "counts",
  "posts",
  "menu",
  "focus",
  "relationship"
]);

const PROFILE_SECTION_KEY_SET = new Set(PROFILE_SECTION_KEYS);
const SECTION_STATUSES = new Set(["idle", "loading", "refreshing", "ready", "empty", "error"]);
const SETTLED_SECTION_STATUSES = new Set(["ready", "empty", "error"]);

function nowMs() {
  try {
    if (typeof performance !== "undefined" && typeof performance.now === "function") {
      return performance.now();
    }
  } catch {}
  return Date.now();
}

function safeText(value = "") {
  return String(value || "").trim();
}

function normalizeEntityType(value = "") {
  const key = safeText(value).toLowerCase();
  if (key === "business" || key === "restaurant") return "business";
  if (key === "user" || key === "profile") return "user";
  return "";
}

export function createProfileKey(entityType = "", canonicalId = "") {
  const safeEntityType = normalizeEntityType(entityType);
  const safeCanonicalId = safeText(canonicalId);
  if (!safeEntityType || !safeCanonicalId) return "";
  return `${safeEntityType}:${safeCanonicalId}`;
}

function normalizeSectionKey(section = "") {
  const key = safeText(section).toLowerCase();
  return PROFILE_SECTION_KEY_SET.has(key) ? key : "";
}

export function normalizeProfileSectionStatus(value = "", fallback = "idle") {
  const status = safeText(value).toLowerCase();
  if (SECTION_STATUSES.has(status)) return status;
  const safeFallback = safeText(fallback).toLowerCase();
  return SECTION_STATUSES.has(safeFallback) ? safeFallback : "idle";
}

export function createProfileSectionState(overrides = {}) {
  const safeOverrides = overrides && typeof overrides === "object" ? overrides : {};
  return {
    status: normalizeProfileSectionStatus(safeOverrides.status, "idle"),
    data: Object.prototype.hasOwnProperty.call(safeOverrides, "data") ? safeOverrides.data : null,
    error: safeOverrides.error ?? null,
    requestId: safeText(safeOverrides.requestId),
    updatedAt: Number(safeOverrides.updatedAt || 0) || 0,
    attempt: Math.max(0, Number(safeOverrides.attempt || 0) || 0),
    source: safeText(safeOverrides.source),
    version: safeOverrides.version ?? null
  };
}

function createEmptySections() {
  return PROFILE_SECTION_KEYS.reduce((out, key) => {
    out[key] = createProfileSectionState();
    return out;
  }, {});
}

function cloneSectionState(sectionState = {}) {
  return createProfileSectionState(sectionState);
}

function cloneSession(session = null) {
  if (!session) return null;
  const copy = {
    key: session.key,
    entityType: session.entityType,
    canonicalId: session.canonicalId,
    generation: session.generation,
    selectedSurface: session.selectedSurface
  };
  PROFILE_SECTION_KEYS.forEach((key) => {
    copy[key] = cloneSectionState(session[key]);
  });
  return copy;
}

function getCacheBucket(cache, profileKey = "") {
  const safeKey = safeText(profileKey);
  if (!safeKey) return null;
  const existing = cache.get(safeKey);
  if (existing && typeof existing === "object") return existing;
  const next = {};
  cache.set(safeKey, next);
  return next;
}

function readCachedSections(cache, profileKey = "") {
  const bucket = cache.get(safeText(profileKey));
  return bucket && typeof bucket === "object" ? bucket : null;
}

function writeCachedSection(cache, profileKey = "", section = "", sectionState = null) {
  const safeSection = normalizeSectionKey(section);
  if (!safeSection || !sectionState) return;
  const status = normalizeProfileSectionStatus(sectionState.status, "idle");
  if (status !== "ready" && status !== "empty") return;
  const bucket = getCacheBucket(cache, profileKey);
  if (!bucket) return;
  bucket[safeSection] = cloneSectionState({
    ...sectionState,
    requestId: ""
  });
}

function mergeObjectKeepingMissing(previous = {}, next = {}) {
  const base = previous && typeof previous === "object" && !Array.isArray(previous)
    ? { ...previous }
    : {};
  Object.entries(next && typeof next === "object" ? next : {}).forEach(([key, value]) => {
    if (value === undefined) return;
    base[key] = value;
  });
  return base;
}

function mergeSectionData(previousData, nextData, { replace = false } = {}) {
  if (nextData === undefined) return previousData;
  if (replace) return nextData;
  if (Array.isArray(nextData)) return nextData;
  if (nextData && typeof nextData === "object") {
    if (previousData && typeof previousData === "object" && !Array.isArray(previousData)) {
      return mergeObjectKeepingMissing(previousData, nextData);
    }
    return mergeObjectKeepingMissing({}, nextData);
  }
  return nextData;
}

function asNumericVersion(value) {
  if (value === null || value === undefined || value === "") return null;
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : null;
}

function isSeedSource(result = {}) {
  if (result.seed === true) return true;
  const source = safeText(result.source).toLowerCase();
  return source.includes("seed") || source.includes("bootstrap") || source.includes("route");
}

function shouldRejectStaleSeed(sectionState = {}, result = {}) {
  if (!isSeedSource(result)) return false;
  const status = normalizeProfileSectionStatus(sectionState.status, "idle");
  if (!SETTLED_SECTION_STATUSES.has(status)) return false;
  const currentUpdatedAt = Number(sectionState.updatedAt || 0) || 0;
  const nextUpdatedAt = Number(result.updatedAt || 0) || 0;
  if (currentUpdatedAt > 0 && nextUpdatedAt > 0 && nextUpdatedAt < currentUpdatedAt) return true;
  const currentNumericVersion = asNumericVersion(sectionState.version);
  const nextNumericVersion = asNumericVersion(result.version);
  return currentNumericVersion !== null
    && nextNumericVersion !== null
    && nextNumericVersion < currentNumericVersion;
}

function normalizeLoaderResult(result, fallback = {}) {
  if (Array.isArray(result)) {
    return {
      ...fallback,
      data: result,
      status: result.length ? "ready" : "empty"
    };
  }
  if (!result || typeof result !== "object") {
    return {
      ...fallback,
      data: result ?? null,
      status: result === null ? "empty" : "ready"
    };
  }
  const data = Object.prototype.hasOwnProperty.call(result, "data")
    ? result.data
    : (
      Object.prototype.hasOwnProperty.call(result, "items")
        ? result.items
        : (
          Object.prototype.hasOwnProperty.call(result, "posts")
            ? result.posts
            : result.value
        )
    );
  let status = normalizeProfileSectionStatus(result.status, "");
  if (!status) {
    if (result.error) status = "error";
    else if (Array.isArray(data)) status = data.length ? "ready" : "empty";
    else if (data === null) status = "empty";
    else status = "ready";
  }
  return {
    ...fallback,
    ...result,
    data,
    status
  };
}

function resolveTarget(input = {}) {
  const safeInput = input && typeof input === "object" ? input : {};
  const entityType = normalizeEntityType(
    safeInput.entityType
    || safeInput.type
    || (safeInput.uid ? "user" : "")
    || (safeInput.restaurantId || safeInput.canonicalRestaurantId ? "business" : "")
  );
  const canonicalId = safeText(
    safeInput.canonicalId
    || safeInput.canonicalRestaurantId
    || safeInput.restaurantId
    || safeInput.uid
    || safeInput.id
  );
  const key = safeText(safeInput.profileKey || safeInput.key) || createProfileKey(entityType, canonicalId);
  return {
    key,
    entityType,
    canonicalId,
    selectedSurface: safeText(safeInput.selectedSurface || safeInput.surface || "profile").toLowerCase() || "profile"
  };
}

export function createProfileLoadCoordinator({
  nowFn = nowMs,
  requestIdFactory = null,
  logEvent = null,
  incrementCounter = null
} = {}) {
  let currentSession = null;
  let generationSeq = 0;
  let requestSeq = 0;
  const cache = new Map();
  const inFlight = new Map();
  const timers = new Map();
  const counters = {
    cacheHits: 0,
    cacheMisses: 0,
    duplicateRequestsPrevented: 0,
    staleResultsDiscarded: 0,
    retryCount: 0
  };

  const getNow = () => Number(typeof nowFn === "function" ? nowFn() : Date.now()) || Date.now();
  const emit = (label = "", meta = {}) => {
    if (typeof logEvent !== "function") return;
    try {
      logEvent(label, meta);
    } catch {}
  };
  const count = (key = "", amount = 1) => {
    if (typeof incrementCounter !== "function") return;
    try {
      incrementCounter(key, amount);
    } catch {}
  };
  const nextRequestId = (section = "") => {
    if (typeof requestIdFactory === "function") {
      const requested = safeText(requestIdFactory({ section, requestSeq: requestSeq + 1 }));
      if (requested) {
        requestSeq += 1;
        return requested;
      }
    }
    requestSeq += 1;
    return `${safeText(section) || "section"}:${requestSeq}`;
  };
  const inFlightKey = (profileKey = "", section = "") => `${profileKey}:${section}`;
  const clearTimers = () => {
    timers.forEach((timerId) => clearTimeout(timerId));
    timers.clear();
  };
  const hydrateCachedSections = (session) => {
    const cached = readCachedSections(cache, session.key);
    if (!cached) return;
    PROFILE_SECTION_KEYS.forEach((section) => {
      if (!cached[section]) return;
      session[section] = cloneSectionState(cached[section]);
      counters.cacheHits += 1;
      count("cache_hits");
    });
  };

  const beginProfileSession = (target = {}) => {
    const resolved = resolveTarget(target);
    if (!resolved.key) return null;
    if (currentSession?.key === resolved.key) {
      currentSession.selectedSurface = resolved.selectedSurface || currentSession.selectedSurface;
      return currentSession;
    }
    clearTimers();
    generationSeq += 1;
    currentSession = {
      key: resolved.key,
      entityType: resolved.entityType,
      canonicalId: resolved.canonicalId,
      generation: generationSeq,
      selectedSurface: resolved.selectedSurface,
      ...createEmptySections()
    };
    hydrateCachedSections(currentSession);
    emit("profile.session.begin", {
      profileKey: currentSession.key,
      generation: currentSession.generation,
      source: "coordinator",
      status: currentSession.selectedSurface
    });
    return currentSession;
  };

  const canCommit = (result = {}) => {
    const section = normalizeSectionKey(result.section);
    return !!(
      currentSession
      && section
      && safeText(result.profileKey) === currentSession.key
      && Number(result.generation || 0) === currentSession.generation
      && safeText(result.requestId)
      && safeText(result.requestId) === safeText(currentSession[section]?.requestId)
    );
  };

  const applySectionResult = (result = {}, { guard = true } = {}) => {
    const section = normalizeSectionKey(result.section);
    if (!currentSession || !section) return { accepted: false, reason: "missing-session" };
    if (guard && !canCommit(result)) {
      counters.staleResultsDiscarded += 1;
      count("stale_results_discarded");
      emit("profile.section.discard", {
        profileKey: safeText(result.profileKey),
        generation: Number(result.generation || 0) || 0,
        section,
        requestId: safeText(result.requestId),
        discardReason: "stale-result",
        commitAccepted: false
      });
      return { accepted: false, reason: "stale-result" };
    }
    const current = currentSession[section] || createProfileSectionState();
    if (shouldRejectStaleSeed(current, result)) {
      counters.staleResultsDiscarded += 1;
      count("stale_results_discarded");
      return { accepted: false, reason: "older-seed" };
    }
    const status = normalizeProfileSectionStatus(result.status, current.status || "ready");
    const updatedAt = Number(result.updatedAt || 0) || getNow();
    const nextState = createProfileSectionState({
      ...current,
      status,
      data: mergeSectionData(current.data, result.data, { replace: result.replace === true }),
      error: result.error ?? null,
      requestId: status === "loading" || status === "refreshing" ? safeText(result.requestId) : "",
      updatedAt,
      attempt: Math.max(current.attempt || 0, Number(result.attempt || current.attempt || 0) || 0),
      source: safeText(result.source || current.source),
      version: result.version ?? current.version
    });
    if (status === "empty" && result.data === undefined) {
      nextState.data = current.data ?? null;
    }
    currentSession[section] = nextState;
    writeCachedSection(cache, currentSession.key, section, nextState);
    emit("profile.section.commit", {
      profileKey: currentSession.key,
      generation: currentSession.generation,
      section,
      requestId: safeText(result.requestId),
      source: nextState.source,
      resultStatus: nextState.status,
      commitAccepted: true
    });
    return { accepted: true, section: nextState, session: currentSession };
  };

  const seedProfileSession = (seed = {}) => {
    if (!currentSession) return null;
    const safeSeed = seed && typeof seed === "object" ? seed : {};
    PROFILE_SECTION_KEYS.forEach((section) => {
      const sectionSeed = safeSeed[section];
      if (!sectionSeed || typeof sectionSeed !== "object") return;
      const normalized = normalizeLoaderResult(sectionSeed, {
        section,
        profileKey: currentSession.key,
        generation: currentSession.generation,
        requestId: "",
        source: "seed",
        seed: true
      });
      applySectionResult(normalized, { guard: false });
    });
    return currentSession;
  };

  const selectProfileSurface = (surface = "") => {
    if (!currentSession) return null;
    const safeSurface = safeText(surface).toLowerCase() || "profile";
    currentSession.selectedSurface = safeSurface;
    emit("profile.surface.select", {
      profileKey: currentSession.key,
      generation: currentSession.generation,
      status: safeSurface
    });
    return currentSession;
  };

  const ensureProfileSection = (section = "", loader = null, options = {}) => {
    const safeSection = normalizeSectionKey(section);
    if (!currentSession || !safeSection) return Promise.resolve({ accepted: false, reason: "missing-session" });
    const sectionState = currentSession[safeSection] || createProfileSectionState();
    const safeOptions = options && typeof options === "object" ? options : {};
    const force = safeOptions.force === true;
    const requestKey = inFlightKey(currentSession.key, safeSection);
    const existingRequest = inFlight.get(requestKey);
    if (existingRequest && !force) {
      counters.duplicateRequestsPrevented += 1;
      count("duplicate_requests_prevented");
      emit("profile.section.duplicate", {
        profileKey: currentSession.key,
        generation: currentSession.generation,
        section: safeSection,
        requestId: sectionState.requestId,
        source: safeOptions.source || sectionState.source,
        duplicateRequestsPrevented: 1
      });
      return existingRequest;
    }
    if (!force && (sectionState.status === "ready" || sectionState.status === "empty")) {
      counters.cacheHits += 1;
      count("cache_hits");
      return Promise.resolve({
        accepted: true,
        cacheHit: true,
        section: sectionState,
        session: currentSession
      });
    }
    counters.cacheMisses += 1;
    count("cache_misses");
    const requestId = nextRequestId(safeSection);
    const generation = currentSession.generation;
    const profileKey = currentSession.key;
    const startedAt = getNow();
    const attempt = Math.max(1, Number(sectionState.attempt || 0) + 1);
    currentSession[safeSection] = createProfileSectionState({
      ...sectionState,
      status: SETTLED_SECTION_STATUSES.has(sectionState.status) && sectionState.data !== null
        ? "refreshing"
        : "loading",
      requestId,
      attempt,
      source: safeOptions.source || sectionState.source
    });
    const loaderContext = {
      session: cloneSession(currentSession),
      profileKey,
      generation,
      section: safeSection,
      requestId,
      attempt,
      source: safeOptions.source || "",
      startedAt
    };
    emit("profile.section.start", {
      profileKey,
      generation,
      section: safeSection,
      requestId,
      source: loaderContext.source,
      attempt,
      cacheHit: false
    });
    const request = Promise.resolve()
      .then(() => {
        if (typeof loader !== "function") {
          return { status: "ready", data: currentSession?.[safeSection]?.data ?? null };
        }
        return loader(loaderContext);
      })
      .then((result) => normalizeLoaderResult(result, {
        profileKey,
        generation,
        section: safeSection,
        requestId,
        attempt,
        source: loaderContext.source,
        duration: getNow() - startedAt
      }))
      .then((result) => applySectionResult(result))
      .catch((error) => applySectionResult({
        profileKey,
        generation,
        section: safeSection,
        requestId,
        attempt,
        source: loaderContext.source,
        status: "error",
        error,
        duration: getNow() - startedAt
      }))
      .finally(() => {
        if (inFlight.get(requestKey) === request) inFlight.delete(requestKey);
      });
    inFlight.set(requestKey, request);
    return request;
  };

  const commitProfileSection = (result = {}) => applySectionResult(result, { guard: true });

  const refreshProfileSection = (section = "", loader = null, options = {}) => ensureProfileSection(section, loader, {
    ...(options || {}),
    force: true
  });

  const scheduleProfileSectionRetry = (section = "", callback = null, delayMs = 0) => {
    const safeSection = normalizeSectionKey(section);
    if (!currentSession || !safeSection || typeof callback !== "function") return null;
    const timerKey = `${currentSession.key}:${currentSession.generation}:${safeSection}`;
    const existing = timers.get(timerKey);
    if (existing) clearTimeout(existing);
    counters.retryCount += 1;
    count("retry_count");
    const timerId = setTimeout(() => {
      timers.delete(timerKey);
      callback(cloneSession(currentSession));
    }, Math.max(0, Number(delayMs || 0) || 0));
    timers.set(timerKey, timerId);
    return timerId;
  };

  const disposeProfileSession = () => {
    clearTimers();
    if (currentSession) {
      emit("profile.session.dispose", {
        profileKey: currentSession.key,
        generation: currentSession.generation,
        source: "coordinator"
      });
    }
    currentSession = null;
    inFlight.clear();
  };

  return {
    beginProfileSession,
    seedProfileSession,
    selectProfileSurface,
    ensureProfileSection,
    commitProfileSection,
    refreshProfileSection,
    disposeProfileSession,
    scheduleProfileSectionRetry,
    getSession: () => currentSession,
    getSnapshot: () => cloneSession(currentSession),
    getCounters: () => ({ ...counters }),
    getCacheSnapshot: () => {
      const out = {};
      cache.forEach((value, key) => {
        out[key] = {};
        PROFILE_SECTION_KEYS.forEach((section) => {
          if (value?.[section]) out[key][section] = cloneSectionState(value[section]);
        });
      });
      return out;
    },
    canCommit
  };
}
