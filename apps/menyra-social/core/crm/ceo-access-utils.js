export function isCeoUserCore(state = {}, {
  normalizeRoleListFn
} = {}) {
  const normalizeRoleList = typeof normalizeRoleListFn === "function"
    ? normalizeRoleListFn
    : ((value) => String(value || "").split(",").map((item) => String(item || "").trim()).filter(Boolean));
  if (state?.roleSwitchRoles?.includes("ceo")) return true;
  const roles = normalizeRoleList(state?.userProfile?.roles || state?.userProfile?.role || "");
  return roles.includes("ceo");
}

export function isAlbertCeoUserCore(state = {}, {
  normalizeEmailValueFn,
  isHiddenLegacyCeoEmailFn,
  normalizeHandleFn,
  albertCeoAliases = [],
  albertCeoEmails = []
} = {}) {
  const normalizeEmailValue = typeof normalizeEmailValueFn === "function"
    ? normalizeEmailValueFn
    : ((value) => String(value || "").trim().toLowerCase());
  const isHiddenLegacyCeoEmail = typeof isHiddenLegacyCeoEmailFn === "function"
    ? isHiddenLegacyCeoEmailFn
    : (() => false);
  const normalizeHandle = typeof normalizeHandleFn === "function"
    ? normalizeHandleFn
    : ((value) => String(value || "").trim().toLowerCase());
  const aliases = Array.isArray(albertCeoAliases) ? albertCeoAliases : [];
  const emails = Array.isArray(albertCeoEmails) ? albertCeoEmails : [];
  if (!state?.user) return false;
  const email = normalizeEmailValue(state.user?.email || "");
  if (isHiddenLegacyCeoEmail(email)) return false;
  const handleCandidates = [
    state.userProfile?.handle,
    state.userProfile?.name,
    state.user?.displayName
  ].map((value) => normalizeHandle(value || "")).filter(Boolean);
  if (handleCandidates.some((value) => aliases.includes(value))) return true;
  if (emails.includes(email)) return true;
  return aliases.some((alias) => email.startsWith(`${alias}@`));
}

export function hasGlobalCeoAccessCore(profile = {}, user = {}, {
  albertCeoUid = "",
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
