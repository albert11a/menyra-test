export function normalizeCeoStaffRecordCore(record = {}, userRecord = {}, {
  buildCeoNameFn,
  normalizeCeoPathFn,
  normalizeHandleFn,
  normalizeCeoCountryFn,
  hasStoredCeoCrmCountsFn,
  sanitizeCeoCrmCountsFn,
  parseCoordNumberFn
} = {}) {
  const buildCeoName = typeof buildCeoNameFn === "function"
    ? buildCeoNameFn
    : (() => "CEO");
  const normalizeCeoPath = typeof normalizeCeoPathFn === "function"
    ? normalizeCeoPathFn
    : ((value, fallback = []) => Array.from(new Set([...(Array.isArray(value) ? value : []), ...(fallback || [])].map((entry) => String(entry || "").trim()).filter(Boolean))));
  const normalizeHandle = typeof normalizeHandleFn === "function"
    ? normalizeHandleFn
    : ((value) => String(value || "").trim().toLowerCase().replace(/\s+/g, "_"));
  const normalizeCeoCountry = typeof normalizeCeoCountryFn === "function"
    ? normalizeCeoCountryFn
    : ((value) => String(value || "").trim() || "Kosovo");
  const hasStoredCeoCrmCounts = typeof hasStoredCeoCrmCountsFn === "function"
    ? hasStoredCeoCrmCountsFn
    : (() => false);
  const sanitizeCeoCrmCounts = typeof sanitizeCeoCrmCountsFn === "function"
    ? sanitizeCeoCrmCountsFn
    : (() => null);
  const parseCoordNumber = typeof parseCoordNumberFn === "function"
    ? parseCoordNumberFn
    : ((value) => {
      const num = Number(value);
      return Number.isFinite(num) ? num : null;
    });
  const merged = { ...(userRecord || {}), ...(record || {}) };
  const uid = String(merged.uid || merged.userId || merged.id || "").trim();
  const email = String(merged.email || "").trim();
  const firstName = String(merged.firstName || "").trim();
  const lastName = String(merged.lastName || "").trim();
  const name = buildCeoName({
    firstName,
    lastName,
    fallback: merged.name || merged.displayName || "",
    email
  });
  const parentUid = String(merged.ceoParentUid || merged.parentCeoUid || merged.managerUid || "").trim();
  const rootUid = String(merged.ceoRootUid || merged.rootCeoUid || parentUid || uid).trim() || uid;
  let ceoPath = normalizeCeoPath(merged.ceoPath, [rootUid, parentUid, uid]);
  if (!ceoPath.length && uid) ceoPath = [uid];
  return {
    ...merged,
    uid,
    userId: uid,
    id: uid,
    email,
    firstName,
    lastName,
    name,
    displayName: name,
    handle: merged.handle || normalizeHandle(name || email || "ceo"),
    role: "ceo",
    roles: ["ceo"],
    country: normalizeCeoCountry(merged.country),
    locationLabel: String(merged.locationLabel || merged.location || merged.city || "").trim(),
    ceoParentUid: parentUid,
    ceoParentName: String(merged.ceoParentName || merged.parentCeoName || merged.managerName || "").trim(),
    ceoRootUid: rootUid,
    ceoRootName: String(merged.ceoRootName || merged.rootCeoName || "").trim(),
    ceoPath,
    crmCounts: hasStoredCeoCrmCounts(merged.crmCounts) ? sanitizeCeoCrmCounts(merged.crmCounts) : null,
    lat: parseCoordNumber(merged.gpsLat ?? merged.lat),
    lng: parseCoordNumber(merged.gpsLng ?? merged.lng),
    gpsLat: parseCoordNumber(merged.gpsLat ?? merged.lat),
    gpsLng: parseCoordNumber(merged.gpsLng ?? merged.lng)
  };
}

export function overlayCeoStaffProfileCore(record = {}, userRecord = {}, {
  parseCoordNumberFn
} = {}) {
  const parseCoordNumber = typeof parseCoordNumberFn === "function"
    ? parseCoordNumberFn
    : ((value) => {
      const num = Number(value);
      return Number.isFinite(num) ? num : null;
    });
  const next = { ...(record || {}) };
  const readText = (...keys) => {
    for (const key of keys) {
      const value = String(userRecord?.[key] || "").trim();
      if (value) return value;
    }
    return "";
  };
  const avatarUrl = readText("avatarUrl", "avatar");
  if (avatarUrl) {
    next.avatarUrl = avatarUrl;
    next.avatar = avatarUrl;
  }
  const displayName = readText("displayName", "name");
  if (displayName) {
    next.displayName = displayName;
    next.name = displayName;
  }
  const firstName = readText("firstName");
  const lastName = readText("lastName");
  if (firstName) next.firstName = firstName;
  if (lastName) next.lastName = lastName;
  const email = readText("email");
  if (email) next.email = email;
  const handle = readText("handle");
  if (handle) next.handle = handle;
  const country = readText("country");
  if (country) next.country = country;
  const city = readText("city");
  if (city) next.city = city;
  const location = readText("locationLabel", "location", "city");
  if (location) {
    next.locationLabel = location;
    if (!String(next.location || "").trim()) next.location = location;
  }
  const lat = parseCoordNumber(userRecord?.gpsLat ?? userRecord?.lat);
  const lng = parseCoordNumber(userRecord?.gpsLng ?? userRecord?.lng);
  if (Number.isFinite(lat) && Number.isFinite(lng)) {
    next.lat = lat;
    next.lng = lng;
    next.gpsLat = lat;
    next.gpsLng = lng;
  }
  return next;
}

export function buildCeoDirectorySyncPatchCore(record = {}, userRecord = {}, {
  overlayCeoStaffProfileFn,
  parseCoordNumberFn
} = {}) {
  const overlayCeoStaffProfile = typeof overlayCeoStaffProfileFn === "function"
    ? overlayCeoStaffProfileFn
    : ((base, source) => ({ ...(base || {}), ...(source || {}) }));
  const parseCoordNumber = typeof parseCoordNumberFn === "function"
    ? parseCoordNumberFn
    : ((value) => {
      const num = Number(value);
      return Number.isFinite(num) ? num : null;
    });
  const patched = overlayCeoStaffProfile(record, userRecord);
  const nextAvatar = String(patched.avatarUrl || patched.avatar || "").trim();
  const prevAvatar = String(record.avatarUrl || record.avatar || "").trim();
  const patch = {};
  if (nextAvatar && nextAvatar !== prevAvatar) {
    patch.avatarUrl = nextAvatar;
    patch.avatar = nextAvatar;
  }
  const textKeys = ["displayName", "name", "firstName", "lastName", "email", "handle", "country", "city", "locationLabel"];
  textKeys.forEach((key) => {
    const nextValue = String(patched[key] || "").trim();
    const prevValue = String(record[key] || "").trim();
    if (nextValue && nextValue !== prevValue) {
      patch[key] = nextValue;
    }
  });
  ["lat", "lng", "gpsLat", "gpsLng"].forEach((key) => {
    const nextValue = parseCoordNumber(patched[key]);
    const prevValue = parseCoordNumber(record[key]);
    if (Number.isFinite(nextValue) && nextValue !== prevValue) {
      patch[key] = nextValue;
    }
  });
  return patch;
}
