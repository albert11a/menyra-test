import { normalizePublicBusinessTopTabCore } from "../router/public-business-route-utils.js";
import { resolveLaunchPublicBusinessRouteCore } from "../router/public-business-route-resolver.js";

export function normalizePendingProfileRestaurantIdCore(value = "") {
  return String(value || "").trim();
}

export function isPendingProfileAlreadyOpenCore({
  pendingProfileRestaurantId = "",
  currentProfileRestaurantId = "",
  currentProfileCanonicalRestaurantId = "",
  currentProfilePublicSlug = "",
  currentProfileLandingSlug = "",
  currentProfileHandle = "",
  currentRoutePayload = null,
  currentProfileTruthState = ""
} = {}) {
  const pendingId = String(pendingProfileRestaurantId || "").trim();
  if (!pendingId) return false;
  const truthState = String(currentProfileTruthState || "").trim().toLowerCase();
  if (
    truthState === "loading"
    || truthState === "pending"
  ) {
    return false;
  }
  const addRouteKey = (keys, value = "") => {
    const raw = String(value || "").trim();
    if (!raw) return;
    keys.add(raw);
    keys.add(raw.toLowerCase());
    try {
      const resolved = resolveLaunchPublicBusinessRouteCore(raw);
      [
        resolved?.restaurantId,
        resolved?.canonicalRestaurantId,
        resolved?.canonicalSlug,
        resolved?.inputSlug
      ].forEach((candidate) => {
        const text = String(candidate || "").trim();
        if (!text) return;
        keys.add(text);
        keys.add(text.toLowerCase());
      });
    } catch {}
  };
  const payload = currentRoutePayload && typeof currentRoutePayload === "object"
    ? currentRoutePayload
    : {};
  const snapshot = payload?.businessSnapshot && typeof payload.businessSnapshot === "object"
    ? payload.businessSnapshot
    : {};
  const payloadIdentity = payload?.identity && typeof payload.identity === "object" ? payload.identity : {};
  const snapshotIdentity = snapshot?.identity && typeof snapshot.identity === "object" ? snapshot.identity : {};
  const pendingKeys = new Set();
  const currentKeys = new Set();
  addRouteKey(pendingKeys, pendingId);
  [
    currentProfileRestaurantId,
    currentProfileCanonicalRestaurantId,
    currentProfilePublicSlug,
    currentProfileLandingSlug,
    currentProfileHandle,
    payload.restaurantId,
    payload.canonicalRestaurantId,
    snapshot.restaurantId,
    payloadIdentity.publicSlug,
    payloadIdentity.landingSlug,
    payloadIdentity.handle,
    snapshotIdentity.publicSlug,
    snapshotIdentity.landingSlug,
    snapshotIdentity.handle
  ].forEach((value) => addRouteKey(currentKeys, value));
  if (!currentKeys.size) return false;
  for (const key of pendingKeys) {
    if (currentKeys.has(key)) return true;
  }
  return false;
}

export function normalizeProfileTopTabFromRouteCore(value = "") {
  const key = normalizePublicBusinessTopTabCore(value, "");
  if (!key) return "";
  if (key === "landing" || key === "menu" || key === "cart" || key === "profile") return key;
  return "";
}
