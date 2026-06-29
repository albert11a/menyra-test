const PROFILE_STATUSES = new Set(["resolving", "ready", "empty", "notfound", "not-found", "error"]);
const SECTION_STATUSES = new Set(["unknown", "loading", "ready", "empty", "error"]);

function cleanText(value = "") {
  return String(value || "").trim();
}

function cleanLower(value = "") {
  return cleanText(value).toLowerCase();
}

function firstText(...values) {
  for (const value of values) {
    const safeValue = cleanText(value);
    if (safeValue) return safeValue;
  }
  return "";
}

function addUnique(list, value = "") {
  const safeValue = cleanText(value);
  if (safeValue && !list.includes(safeValue)) list.push(safeValue);
}

function normalizeKnownStatus(value = "", fallback = "unknown", allowed = SECTION_STATUSES) {
  const key = cleanLower(value);
  if (allowed.has(key)) return key === "notfound" ? "notFound" : key;
  if (key === "not-found" && allowed.has("not-found")) return "notFound";
  return fallback;
}

function normalizeTableNumber(value = 0) {
  const parsed = Math.trunc(Number(value || 0));
  if (!Number.isFinite(parsed)) return 0;
  return parsed >= 1 && parsed <= 200 ? parsed : 0;
}

function isLikelyRestaurantId(value = "") {
  const safeValue = cleanText(value);
  return /^[A-Za-z0-9_-]{16,}$/.test(safeValue);
}

function normalizeRouteSource({
  routeSource = "",
  accessSource = "",
  inputSlug = "",
  inputId = "",
  routeContext = null,
  userProfile = null
} = {}) {
  const explicit = cleanLower(routeSource);
  if (explicit) return explicit;
  const access = cleanLower(accessSource || routeContext?.pendingProfileAccessSource || routeContext?.publicBusiness?.accessSource || "");
  if (access === "qr") return "qr";
  if (cleanText(userProfile?.uid || userProfile?.restaurantId || "")) return "businessUser";
  if (isLikelyRestaurantId(inputId || routeContext?.pendingProfileRestaurantId || routeContext?.publicBusiness?.routeId || "")) return "directId";
  if (cleanText(inputSlug || routeContext?.publicBusiness?.routeId || "")) return "slug";
  return "";
}

export function normalizeCanonicalPublicBusinessProfileStatus(value = "", fallback = "resolving") {
  const safeFallback = PROFILE_STATUSES.has(cleanLower(fallback)) ? fallback : "resolving";
  return normalizeKnownStatus(value, safeFallback, PROFILE_STATUSES);
}

export function normalizeCanonicalPublicBusinessSectionStatus(value = "", fallback = "unknown") {
  return normalizeKnownStatus(value, fallback, SECTION_STATUSES);
}

export function createCanonicalPublicBusinessContextCore({
  profile = null,
  routePayload = null,
  webDirectEntry = null,
  routeContext = null,
  userProfile = null,
  restaurantId = "",
  inputId = "",
  inputSlug = "",
  canonicalSlug = "",
  routeSource = "",
  accessSource = "",
  tableNumber = null,
  profileStatus = "",
  menuStatus = "",
  postsStatus = "",
  lastStableProfileData = null,
  lastStableMenuData = null,
  lastStablePostsData = null,
  coldStart = false,
  hardRefresh = false
} = {}) {
  const safeProfile = profile && typeof profile === "object" ? profile : {};
  const safeRoutePayload = routePayload && typeof routePayload === "object" ? routePayload : {};
  const routeSnapshot = safeRoutePayload?.businessSnapshot && typeof safeRoutePayload.businessSnapshot === "object"
    ? safeRoutePayload.businessSnapshot
    : {};
  const safeWebDirectEntry = webDirectEntry && typeof webDirectEntry === "object" && webDirectEntry.active === true
    ? webDirectEntry
    : {};
  const safeRouteContext = routeContext && typeof routeContext === "object" ? routeContext : {};
  const publicBusiness = safeRouteContext?.publicBusiness && typeof safeRouteContext.publicBusiness === "object"
    ? safeRouteContext.publicBusiness
    : {};
  const safeUserProfile = userProfile && typeof userProfile === "object" ? userProfile : {};
  const routeId = firstText(restaurantId, inputId, publicBusiness.routeId, safeRouteContext.pendingProfileRestaurantId);
  const explicitCanonicalRestaurantId = firstText(
    safeProfile.canonicalRestaurantId,
    safeRoutePayload.canonicalRestaurantId,
    routeSnapshot.restaurantId,
    safeWebDirectEntry.canonicalRestaurantId
  );
  const userRestaurantId = firstText(safeUserProfile.restaurantId, safeUserProfile.businessRestaurantId);
  const canonicalRestaurantId = firstText(
    explicitCanonicalRestaurantId,
    safeProfile.restaurantId,
    userRestaurantId,
    isLikelyRestaurantId(routeId) ? routeId : ""
  );
  const routeSlug = firstText(
    inputSlug,
    safeRoutePayload.publicSlug,
    safeRoutePayload.landingSlug,
    safeRoutePayload?.identity?.publicSlug,
    safeRoutePayload?.identity?.landingSlug,
    safeRoutePayload?.identity?.handle,
    routeSnapshot?.identity?.publicSlug,
    routeSnapshot?.identity?.landingSlug,
    routeSnapshot?.identity?.handle,
    safeProfile.publicSlug,
    safeProfile.landingSlug,
    safeProfile.handle,
    !isLikelyRestaurantId(routeId) ? routeId : ""
  );
  const normalizedAccessSource = cleanLower(
    accessSource
    || safeRouteContext.pendingProfileAccessSource
    || publicBusiness.accessSource
    || safeWebDirectEntry.menuAccessSource
  );
  const normalizedTableNumber = normalizeTableNumber(
    tableNumber ?? safeRouteContext.pendingProfileTableNumber ?? publicBusiness.tableNumber ?? safeWebDirectEntry.tableNumber
  );
  const isQr = normalizedAccessSource === "qr" || publicBusiness.isQr === true || normalizedTableNumber > 0;
  const source = normalizeRouteSource({
    routeSource,
    accessSource: normalizedAccessSource,
    inputSlug: routeSlug,
    inputId: routeId,
    routeContext: safeRouteContext,
    userProfile: safeUserProfile
  });
  const targets = [];
  [
    canonicalRestaurantId,
    safeProfile.canonicalRestaurantId,
    safeRoutePayload.canonicalRestaurantId,
    routeSnapshot.restaurantId,
    safeWebDirectEntry.canonicalRestaurantId,
    safeProfile.restaurantId,
    safeRoutePayload.restaurantId,
    safeWebDirectEntry.restaurantId,
    routeId,
    routeSlug,
    safeProfile.publicSlug,
    safeProfile.landingSlug,
    safeProfile.handle,
    safeRoutePayload.publicSlug,
    safeRoutePayload.landingSlug,
    safeRoutePayload?.identity?.publicSlug,
    safeRoutePayload?.identity?.landingSlug,
    safeRoutePayload?.identity?.handle,
    routeSnapshot?.identity?.publicSlug,
    routeSnapshot?.identity?.landingSlug,
    routeSnapshot?.identity?.handle
  ].forEach((value) => addUnique(targets, value));
  const resolvedProfileStatus = normalizeCanonicalPublicBusinessProfileStatus(
    profileStatus,
    canonicalRestaurantId ? "ready" : (targets.length ? "resolving" : "empty")
  );
  return {
    canonicalRestaurantId,
    canonicalSlug: cleanText(canonicalSlug || safeProfile.publicSlug || safeProfile.landingSlug || safeRoutePayload.canonicalSlug || ""),
    inputSlug: cleanText(routeSlug),
    inputId: cleanText(routeId),
    routeSource: source,
    tableNumber: normalizedTableNumber,
    isQr,
    accessSource: normalizedAccessSource,
    profileStatus: resolvedProfileStatus,
    menuStatus: normalizeCanonicalPublicBusinessSectionStatus(menuStatus, "unknown"),
    postsStatus: normalizeCanonicalPublicBusinessSectionStatus(postsStatus, "unknown"),
    lastStableProfileData: lastStableProfileData || null,
    lastStableMenuData: lastStableMenuData || null,
    lastStablePostsData: lastStablePostsData || null,
    coldStart: coldStart === true,
    hardRefresh: hardRefresh === true,
    targetIds: targets
  };
}

export function getCanonicalPublicBusinessLoadIds(context = {}, { includeHints = true } = {}) {
  const ids = [];
  addUnique(ids, context?.canonicalRestaurantId);
  if (includeHints !== false) {
    (Array.isArray(context?.targetIds) ? context.targetIds : []).forEach((value) => addUnique(ids, value));
  }
  return ids;
}

export function isCanonicalPublicBusinessTarget(context = {}, value = "") {
  const safeValue = cleanText(value);
  if (!safeValue) return false;
  return getCanonicalPublicBusinessLoadIds(context).includes(safeValue);
}

export function mergeStableCanonicalProfileShellCore(currentProfile = null, incomingProfile = null, context = {}) {
  const current = currentProfile && typeof currentProfile === "object" ? currentProfile : {};
  const incoming = incomingProfile && typeof incomingProfile === "object" ? incomingProfile : {};
  const currentId = firstText(current.canonicalRestaurantId, current.restaurantId);
  const incomingId = firstText(incoming.canonicalRestaurantId, incoming.restaurantId, context?.canonicalRestaurantId);
  const sameCanonical = !!currentId && !!incomingId && currentId === incomingId;
  if (!sameCanonical) return incomingProfile;
  const next = { ...incoming };
  [
    "name",
    "handle",
    "bio",
    "avatar",
    "logoUrl",
    "titleImageUrl",
    "coverImageUrl",
    "coverUrl",
    "heroUrl",
    "location",
    "address",
    "phone",
    "openingHours"
  ].forEach((field) => {
    if (!cleanText(next[field]) && cleanText(current[field])) next[field] = current[field];
  });
  ["followers", "following", "followersCount", "followingCount"].forEach((field) => {
    if (next[field] === undefined && current[field] !== undefined) next[field] = current[field];
  });
  if (incomingId) {
    next.restaurantId = incomingId;
    next.canonicalRestaurantId = incomingId;
  }
  return next;
}
