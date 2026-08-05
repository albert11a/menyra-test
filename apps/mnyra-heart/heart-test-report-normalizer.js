// Was der Heart-Server schickt, in die Form bringen, die die Oberflaeche
// erwartet. Uebrig sind die zwei Dinge, die Heart noch vom Server holt: die
// Verbindungen und die Einrichtung.

function asText(value = "", fallback = "") {
  const text = String(value || "").trim();
  return text || fallback;
}

function toIso(value = "") {
  if (!value) return "";
  const date = value instanceof Date ? value : new Date(value);
  return Number.isFinite(date.getTime()) ? date.toISOString() : "";
}

function normalizeStatus(value = "", fallback = "idle") {
  const status = String(value || "").trim().toLowerCase();
  if (!status) return fallback;
  if (status === "in_progress") return "running";
  if (status === "failure") return "failed";
  if (status === "timed_out") return "failed";
  if (status === "action_required") return "warning";
  if (status === "not-configured") return "not_configured";
  if (status === "needs-setup") return "not_configured";
  return status;
}

export function normalizeConnection(item = {}) {
  return {
    id: asText(item.id || item.key || item.source),
    name: asText(item.name || item.label || item.source || "Verbindung"),
    kind: asText(item.kind || item.source || "internal"),
    status: normalizeStatus(item.status, "idle"),
    note: asText(item.note || item.summary),
    lastCheckedAt: toIso(item.lastCheckedAt || item.updatedAt),
    mode: asText(item.mode || item.integrationMode),
    detail: asText(item.detail)
  };
}

export function normalizeSetupData(item = {}) {
  const personas = item.personas && typeof item.personas === "object" ? item.personas : {};
  return {
    id: asText(item.id || "default"),
    restaurantId: asText(item.restaurantId),
    restaurantName: asText(item.restaurantName),
    restaurantHandle: asText(item.restaurantHandle),
    restaurantQuery: asText(item.restaurantQuery || item.restaurantName || item.restaurantId),
    guestRouteUrl: asText(item.guestRouteUrl),
    allowLiveMutations: item.allowLiveMutations !== false,
    syntheticIsolationKeyReady: !!asText(item.syntheticIsolationKey),
    packConfig: item.packConfig && typeof item.packConfig === "object" ? item.packConfig : {},
    updatedAt: toIso(item.updatedAt || item.createdAt),
    personas: Object.fromEntries(
      Object.entries(personas).map(([key, value]) => [key, {
        key,
        email: asText(value?.email),
        password: asText(value?.password),
        uid: asText(value?.uid),
        handle: asText(value?.handle),
        displayName: asText(value?.displayName),
        role: asText(value?.role || key),
        managed: value?.managed === true,
        ready: value?.ready !== false && !!asText(value?.email) && !!asText(value?.password),
        updatedAt: toIso(value?.updatedAt || item.updatedAt)
      }])
    )
  };
}
