export const ALBERT_CEO_UID = "aklBkkIuZ7Nrpx266TJn63rrxX62";
export const ALBERT_CEO_ALIASES = Object.freeze(["alberthoti", "albert_hoti"]);
export const ALBERT_CEO_EMAILS = Object.freeze(["alberthoti.vsa@gmail.com"]);
export const HIDDEN_LEGACY_CEO_EMAILS = Object.freeze(["albert.hoti@menyra.com"]);

export function normalizeRoleList(value = "") {
  if (Array.isArray(value)) {
    return value.map((item) => String(item || "").trim().toLowerCase()).filter(Boolean);
  }
  return String(value || "")
    .split(",")
    .map((item) => String(item || "").trim().toLowerCase())
    .filter(Boolean);
}

export function normalizeEmailValue(value = "") {
  return String(value || "").trim().toLowerCase();
}

export function normalizeHandleValue(value = "") {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_]+/g, "");
}

export function isCeoUserCore(state = {}, {
  normalizeRoleListFn
} = {}) {
  const normalizeRoles = typeof normalizeRoleListFn === "function"
    ? normalizeRoleListFn
    : normalizeRoleList;
  if (state?.roleSwitchRoles?.includes("ceo")) return true;
  const roles = normalizeRoles(state?.userProfile?.roles || state?.userProfile?.role || "");
  return roles.includes("ceo");
}

export function isAlbertCeoUserCore(state = {}, {
  normalizeEmailValueFn,
  isHiddenLegacyCeoEmailFn,
  normalizeHandleFn,
  albertCeoAliases = ALBERT_CEO_ALIASES,
  albertCeoEmails = ALBERT_CEO_EMAILS
} = {}) {
  const normalizeEmail = typeof normalizeEmailValueFn === "function"
    ? normalizeEmailValueFn
    : normalizeEmailValue;
  const isHiddenLegacyCeoEmail = typeof isHiddenLegacyCeoEmailFn === "function"
    ? isHiddenLegacyCeoEmailFn
    : ((email) => HIDDEN_LEGACY_CEO_EMAILS.includes(normalizeEmail(email)));
  const normalizeHandle = typeof normalizeHandleFn === "function"
    ? normalizeHandleFn
    : normalizeHandleValue;
  if (!state?.user) return false;
  const email = normalizeEmail(state.user?.email || "");
  if (isHiddenLegacyCeoEmail(email)) return false;
  const handleCandidates = [
    state.userProfile?.handle,
    state.userProfile?.name,
    state.user?.displayName
  ].map((value) => normalizeHandle(value || "")).filter(Boolean);
  if (handleCandidates.some((value) => albertCeoAliases.includes(value))) return true;
  if (albertCeoEmails.includes(email)) return true;
  return albertCeoAliases.some((alias) => email.startsWith(`${alias}@`));
}

export function hasGlobalCeoAccessCore(profile = {}, user = {}, {
  albertCeoUid = ALBERT_CEO_UID,
  isAlbertCeoUserFn
} = {}) {
  const isAlbertCeoUser = typeof isAlbertCeoUserFn === "function"
    ? isAlbertCeoUserFn
    : (() => false);
  const uid = String(user?.uid || profile?.uid || "").trim();
  return uid === albertCeoUid || isAlbertCeoUser();
}

export function getCeoGpsOverrideCore(profile = {}, {
  isCeoUserFn
} = {}) {
  const isCeoUser = typeof isCeoUserFn === "function"
    ? isCeoUserFn
    : (() => false);
  if (!isCeoUser()) return null;
  const lat = Number(profile?.gpsLat);
  const lng = Number(profile?.gpsLng);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  return { lat, lng };
}

export function canAccessHeartAsCeo(state = {}) {
  const isCeo = isCeoUserCore(state, { normalizeRoleListFn: normalizeRoleList });
  const isAlbertCeo = isAlbertCeoUserCore(state, {
    normalizeEmailValueFn: normalizeEmailValue,
    normalizeHandleFn: normalizeHandleValue
  });
  const hasGlobalAccess = hasGlobalCeoAccessCore(state?.userProfile || {}, state?.user || {}, {
    albertCeoUid: ALBERT_CEO_UID,
    isAlbertCeoUserFn: () => isAlbertCeo
  });
  return isCeo || hasGlobalAccess;
}
