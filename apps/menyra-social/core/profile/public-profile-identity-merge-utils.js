import { resolveLaunchPublicBusinessRouteCore } from "../router/public-business-route-resolver.js";

const IDENTITY_STRENGTH = Object.freeze({
  "": 0,
  unknown: 0,
  "route-pending": 1,
  pending: 1,
  "route-pending-loading": 1,
  loading: 2,
  seeded: 3,
  ready: 4,
  stable: 4,
  empty: 4,
  error: 4
});

function safeText(value = "") {
  return String(value || "").trim();
}

function safeLower(value = "") {
  return safeText(value).toLowerCase();
}

function normalizeStateKey(value = "") {
  const key = safeLower(value);
  if (key === "knownempty" || key === "known-empty") return "empty";
  if (key.includes("route-pending")) return "route-pending-loading";
  if (key.includes("pending")) return "pending";
  if (key.includes("loading")) return "loading";
  return key;
}

function strengthForState(value = "") {
  const key = normalizeStateKey(value);
  return IDENTITY_STRENGTH[key] ?? 0;
}

function hasCountValue(value) {
  if (value === null || value === undefined) return false;
  const numeric = Number(value);
  return Number.isFinite(numeric) && numeric >= 0;
}

function hasRealText(value = "", { generic = null } = {}) {
  const text = safeText(value);
  if (!text) return false;
  if (typeof generic === "function" && generic(text)) return false;
  return true;
}

function isGenericBusinessName(value = "") {
  const key = safeLower(value);
  return !key || key === "lokal";
}

function isGenericBio(value = "") {
  const key = safeLower(value);
  return !key
    || key === "profil wird geladen..."
    || key === "noch keine bio."
    || key.startsWith("offizieller account auf ");
}

function isGenericLocation(value = "") {
  const key = safeLower(value);
  return !key || key === "-";
}

function hasRealImage(value = "") {
  const text = safeText(value);
  if (!text) return false;
  const key = text.toLowerCase();
  if (key === "undefined" || key === "null" || key === "data") return false;
  return true;
}

function addRouteIdentityKey(keys, value = "") {
  const raw = safeText(value);
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
      const text = safeText(candidate);
      if (!text) return;
      keys.add(text);
      keys.add(text.toLowerCase());
    });
  } catch {}
}

export function collectPublicRestaurantIdentityKeys(profile = null, routePayload = null) {
  const keys = new Set();
  const safeProfile = profile && typeof profile === "object" ? profile : {};
  const safeRoutePayload = routePayload && typeof routePayload === "object" ? routePayload : {};
  const snapshot = safeRoutePayload?.businessSnapshot && typeof safeRoutePayload.businessSnapshot === "object"
    ? safeRoutePayload.businessSnapshot
    : {};
  const payloadIdentity = safeRoutePayload?.identity && typeof safeRoutePayload.identity === "object"
    ? safeRoutePayload.identity
    : {};
  const snapshotIdentity = snapshot?.identity && typeof snapshot.identity === "object"
    ? snapshot.identity
    : {};
  [
    safeProfile.canonicalRestaurantId,
    safeProfile.restaurantId,
    safeProfile.publicSlug,
    safeProfile.landingSlug,
    safeProfile.handle,
    safeRoutePayload.canonicalRestaurantId,
    safeRoutePayload.restaurantId,
    snapshot.restaurantId,
    payloadIdentity.publicSlug,
    payloadIdentity.landingSlug,
    payloadIdentity.handle,
    snapshotIdentity.publicSlug,
    snapshotIdentity.landingSlug,
    snapshotIdentity.handle
  ].forEach((value) => addRouteIdentityKey(keys, value));
  return keys;
}

export function isSamePublicRestaurantIdentity({
  currentProfile = null,
  incomingProfile = null,
  currentRoutePayload = null,
  incomingRoutePayload = null
} = {}) {
  const currentKeys = collectPublicRestaurantIdentityKeys(currentProfile, currentRoutePayload);
  const incomingKeys = collectPublicRestaurantIdentityKeys(incomingProfile, incomingRoutePayload);
  if (!currentKeys.size || !incomingKeys.size) return false;
  for (const key of incomingKeys) {
    if (currentKeys.has(key)) return true;
  }
  return false;
}

function resolveProfileIdentityStrength(profile = null, routePayload = null) {
  const safeProfile = profile && typeof profile === "object" ? profile : {};
  const safePayload = routePayload && typeof routePayload === "object" ? routePayload : {};
  const snapshot = safePayload?.businessSnapshot && typeof safePayload.businessSnapshot === "object"
    ? safePayload.businessSnapshot
    : {};
  const payloadTruth = safePayload?.truth && typeof safePayload.truth === "object" ? safePayload.truth : {};
  const snapshotTruth = snapshot?.truth && typeof snapshot.truth === "object" ? snapshot.truth : {};
  const rawStrength = Math.max(
    strengthForState(safeProfile.identityTruthState),
    strengthForState(safeProfile.truthState),
    strengthForState(payloadTruth.identity),
    strengthForState(snapshotTruth.identity)
  );
  const hasSeed = hasRealText(safeProfile.name, { generic: isGenericBusinessName })
    || hasRealImage(safeProfile.avatar)
    || hasRealImage(safeProfile.titleImageUrl || safeProfile.coverImageUrl || safeProfile.coverUrl || safeProfile.heroUrl)
    || hasRealText(safeProfile.bio, { generic: isGenericBio })
    || hasRealText(safeProfile.location, { generic: isGenericLocation })
    || hasCountValue(safeProfile.followers)
    || hasCountValue(safeProfile.following);
  return Math.max(rawStrength, hasSeed ? IDENTITY_STRENGTH.seeded : 0);
}

function mergeTextField(next, current, incoming, key, {
  generic = null,
  currentStrength = 0,
  incomingStrength = 0
} = {}) {
  const currentValue = current?.[key];
  const incomingValue = incoming?.[key];
  const currentReal = hasRealText(currentValue, { generic });
  const incomingReal = hasRealText(incomingValue, { generic });
  if (incomingReal && (incomingStrength >= currentStrength || !currentReal)) return;
  if (currentReal && (!incomingReal || incomingStrength < currentStrength)) {
    next[key] = currentValue;
  }
}

function mergeImageField(next, current, incoming, key, {
  currentStrength = 0,
  incomingStrength = 0
} = {}) {
  const currentValue = current?.[key];
  const incomingValue = incoming?.[key];
  const currentReal = hasRealImage(currentValue);
  const incomingReal = hasRealImage(incomingValue);
  if (incomingReal && (incomingStrength >= currentStrength || !currentReal)) return;
  if (currentReal && (!incomingReal || incomingStrength < currentStrength)) {
    next[key] = currentValue;
  }
}

function mergeCountField(next, current, incoming, key, {
  currentStrength = 0,
  incomingStrength = 0
} = {}) {
  const currentValue = current?.[key];
  const incomingValue = incoming?.[key];
  const currentKnown = hasCountValue(currentValue);
  const incomingKnown = hasCountValue(incomingValue);
  if (incomingKnown && (incomingStrength >= currentStrength || !currentKnown)) return;
  if (currentKnown && (!incomingKnown || incomingStrength < currentStrength)) {
    next[key] = currentValue;
  }
}

function mergeMetadataField(next, current, incoming, key) {
  if (safeText(incoming?.[key])) return;
  const currentValue = current?.[key];
  if (safeText(currentValue)) next[key] = currentValue;
}

function strongerIdentityState(currentValue = "", incomingValue = "") {
  return strengthForState(currentValue) > strengthForState(incomingValue)
    ? currentValue
    : incomingValue;
}

export function mergeMonotonicPublicProfileIdentity({
  currentProfile = null,
  incomingProfile = null,
  currentRoutePayload = null,
  incomingRoutePayload = null
} = {}) {
  if (!currentProfile || !incomingProfile) return incomingProfile;
  if (!isSamePublicRestaurantIdentity({
    currentProfile,
    incomingProfile,
    currentRoutePayload,
    incomingRoutePayload
  })) {
    return incomingProfile;
  }

  const currentStrength = resolveProfileIdentityStrength(currentProfile, currentRoutePayload);
  const incomingStrength = resolveProfileIdentityStrength(incomingProfile, incomingRoutePayload);
  const next = { ...incomingProfile };

  mergeTextField(next, currentProfile, incomingProfile, "name", {
    generic: isGenericBusinessName,
    currentStrength,
    incomingStrength
  });
  mergeTextField(next, currentProfile, incomingProfile, "handle", { currentStrength, incomingStrength });
  mergeTextField(next, currentProfile, incomingProfile, "bio", {
    generic: isGenericBio,
    currentStrength,
    incomingStrength
  });
  mergeTextField(next, currentProfile, incomingProfile, "location", {
    generic: isGenericLocation,
    currentStrength,
    incomingStrength
  });
  ["avatar", "titleImageUrl", "coverImageUrl", "coverUrl", "heroUrl"].forEach((key) => {
    mergeImageField(next, currentProfile, incomingProfile, key, { currentStrength, incomingStrength });
  });
  ["followers", "following"].forEach((key) => {
    mergeCountField(next, currentProfile, incomingProfile, key, { currentStrength, incomingStrength });
  });
  [
    "restaurantId",
    "canonicalRestaurantId",
    "publicSlug",
    "landingSlug",
    "canonicalPublicPath",
    "type",
    "customerType",
    "place",
    "locationPlace",
    "address",
    "phone",
    "instagram",
    "instagramUrl",
    "tiktok",
    "tiktokUrl"
  ].forEach((key) => mergeMetadataField(next, currentProfile, incomingProfile, key));
  if (Array.isArray(currentProfile.coverImages) && currentProfile.coverImages.length && !Array.isArray(incomingProfile.coverImages)) {
    next.coverImages = currentProfile.coverImages;
  }
  next.identityTruthState = strongerIdentityState(currentProfile.identityTruthState, incomingProfile.identityTruthState);
  return next;
}
