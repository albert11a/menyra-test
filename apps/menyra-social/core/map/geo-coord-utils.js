export function hasLeadLocationCoordsCore(location) {
  return Number.isFinite(Number(location?.lat)) && Number.isFinite(Number(location?.lng));
}

export function toFiniteCoordNumberCore(value) {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value === "string") {
    const cleaned = value.trim().replace(",", ".");
    if (!cleaned) return null;
    const parsed = Number(cleaned);
    return Number.isFinite(parsed) ? parsed : null;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export function normalizeCoordPairCore(latValue, lngValue, {
  toFiniteCoordNumberFn
} = {}) {
  const toFiniteCoordNumber = typeof toFiniteCoordNumberFn === "function"
    ? toFiniteCoordNumberFn
    : toFiniteCoordNumberCore;
  const lat = toFiniteCoordNumber(latValue);
  const lng = toFiniteCoordNumber(lngValue);
  if (lat === null || lng === null) return null;
  if (Math.abs(lat) < 0.000001 && Math.abs(lng) < 0.000001) return null;
  if (Math.abs(lat) <= 90 && Math.abs(lng) <= 180) return { lat, lng };
  if (Math.abs(lat) <= 180 && Math.abs(lng) <= 90) return { lat: lng, lng: lat };
  return null;
}

function toTimestampMillis(value) {
  if (!value && value !== 0) return 0;
  if (value instanceof Date) {
    const millis = value.getTime();
    return Number.isFinite(millis) ? millis : 0;
  }
  if (typeof value?.toMillis === "function") {
    const millis = Number(value.toMillis());
    return Number.isFinite(millis) ? millis : 0;
  }
  if (typeof value?.seconds === "number") {
    const seconds = Number(value.seconds);
    const nanos = Number(value.nanoseconds || 0);
    if (Number.isFinite(seconds) && Number.isFinite(nanos)) {
      return (seconds * 1000) + Math.floor(nanos / 1000000);
    }
  }
  const numeric = Number(value);
  if (Number.isFinite(numeric) && numeric > 1000000000000) return numeric;
  const parsed = Date.parse(String(value));
  return Number.isFinite(parsed) ? parsed : 0;
}

function withCoordMeta(coords, source = null) {
  if (!coords || !source || typeof source !== "object") return coords;
  const next = { ...coords };
  const metaFields = [
    "verified",
    "isVerified",
    "verifiedAt",
    "updatedAt",
    "updated_at",
    "accuracy",
    "accuracyMeters",
    "horizontalAccuracy",
    "confidence",
    "confidenceScore",
    "source"
  ];
  metaFields.forEach((field) => {
    const value = source?.[field];
    if (value === undefined || value === null || value === "") return;
    next[field] = value;
  });
  return next;
}

function extractCoordTrustScoreCore(value = {}) {
  if (!value || typeof value !== "object") return 0;
  let score = 0;
  if (value.verified === true || value.isVerified === true) {
    score += 2;
  }
  const verifiedAtMs = toTimestampMillis(value.verifiedAt);
  if (verifiedAtMs > 0) score += 2;
  const updatedAtMs = Math.max(
    toTimestampMillis(value.updatedAt),
    toTimestampMillis(value.updated_at)
  );
  if (updatedAtMs > 0) score += 1;
  const confidence = Number(value.confidence ?? value.confidenceScore);
  if (Number.isFinite(confidence)) {
    if (confidence >= 0.95) score += 2;
    else if (confidence >= 0.8) score += 1;
  }
  const accuracy = Number(value.accuracy ?? value.accuracyMeters ?? value.horizontalAccuracy);
  if (Number.isFinite(accuracy) && accuracy > 0 && accuracy <= 200) score += 1;
  return score;
}

export function preferStableCoordsCore(candidate, reference, {
  normalizeCoordPairFn
} = {}) {
  const normalizeCoordPair = typeof normalizeCoordPairFn === "function"
    ? normalizeCoordPairFn
    : normalizeCoordPairCore;
  const direct = candidate ? withCoordMeta(normalizeCoordPair(candidate.lat, candidate.lng), candidate) : null;
  const ref = reference ? withCoordMeta(normalizeCoordPair(reference.lat, reference.lng), reference) : null;
  if (!direct) return ref;
  if (!ref) return direct;
  const candidateTrust = extractCoordTrustScoreCore(candidate);
  const referenceTrust = extractCoordTrustScoreCore(reference);
  if (candidateTrust > referenceTrust) return direct;
  if (referenceTrust > candidateTrust + 1) return ref;
  const isExtremeOutlier = Math.abs(direct.lat - ref.lat) > 1.5 || Math.abs(direct.lng - ref.lng) > 1.5;
  return (isExtremeOutlier && referenceTrust > candidateTrust) ? ref : direct;
}

export function resolveCoordsFromShapeCore(shape, {
  normalizeCoordPairFn
} = {}) {
  const normalizeCoordPair = typeof normalizeCoordPairFn === "function"
    ? normalizeCoordPairFn
    : normalizeCoordPairCore;
  if (!shape || typeof shape !== "object") return null;
  return withCoordMeta(normalizeCoordPair(shape.lat, shape.lng), shape)
    || withCoordMeta(normalizeCoordPair(shape.latitude, shape.longitude), shape)
    || withCoordMeta(normalizeCoordPair(shape.lat, shape.lon), shape)
    || withCoordMeta(normalizeCoordPair(shape.latitude, shape.lon), shape)
    || withCoordMeta(normalizeCoordPair(shape._lat, shape._long), shape)
    || withCoordMeta(normalizeCoordPair(shape._latitude, shape._longitude), shape);
}

export function resolveCoordsFromEntityCore(entity, {
  normalizeCoordPairFn,
  resolveCoordsFromShapeFn
} = {}) {
  const normalizeCoordPair = typeof normalizeCoordPairFn === "function"
    ? normalizeCoordPairFn
    : normalizeCoordPairCore;
  const resolveCoordsFromShape = typeof resolveCoordsFromShapeFn === "function"
    ? resolveCoordsFromShapeFn
    : ((value) => resolveCoordsFromShapeCore(value, { normalizeCoordPairFn: normalizeCoordPair }));
  if (!entity || typeof entity !== "object") return null;
  return withCoordMeta(normalizeCoordPair(entity.gpsLat, entity.gpsLng), entity)
    || withCoordMeta(normalizeCoordPair(entity.lat, entity.lng), entity)
    || withCoordMeta(normalizeCoordPair(entity.latitude, entity.longitude), entity)
    || withCoordMeta(normalizeCoordPair(entity.lat, entity.lon), entity)
    || withCoordMeta(normalizeCoordPair(entity.latitude, entity.lon), entity)
    || resolveCoordsFromShape(entity.geo)
    || resolveCoordsFromShape(entity.coords)
    || resolveCoordsFromShape(entity.gps)
    || resolveCoordsFromShape(entity.location)
    || resolveCoordsFromShape(entity.position);
}
