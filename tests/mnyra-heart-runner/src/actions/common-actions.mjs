function asText(value, fallback = "") {
  const text = String(value || "").trim();
  return text || fallback;
}

export function replaceRunTokens(template = "", env = {}) {
  return asText(template)
    .replaceAll("<runId>", asText(env.runId))
    .replaceAll("<syntheticPrefix>", asText(env.syntheticPrefix))
    .replaceAll("<timestamp>", new Date().toISOString().replace(/[.:TZ-]/g, "").slice(0, 14));
}

export function hasRequiredConfig(config = {}, keys = []) {
  return keys.every((key) => {
    const value = config?.[key];
    if (Array.isArray(value)) return value.length > 0;
    return !!asText(value);
  });
}

export function markNotConfigured(heart, moduleKey, message, extras = {}) {
  heart.notConfiguredModule(moduleKey, message, extras);
}

export function markGuarded(heart, moduleKey, message, extras = {}) {
  heart.guardModule(moduleKey, message, extras);
}

export function markSkipped(heart, moduleKey, message, extras = {}) {
  heart.skipModule(moduleKey, message, extras);
}

export function markSuccess(heart, moduleKey, message, extras = {}) {
  heart.passModule(moduleKey, message, extras);
}

export function createCleanupItem(label, status, note = "") {
  return {
    id: asText(label).toLowerCase().replace(/[^a-z0-9]+/g, "_"),
    label: asText(label, "Cleanup item"),
    status: asText(status, "idle"),
    note: asText(note)
  };
}
