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

export function preferStableCoordsCore(candidate, reference, {
  normalizeCoordPairFn
} = {}) {
  const normalizeCoordPair = typeof normalizeCoordPairFn === "function"
    ? normalizeCoordPairFn
    : normalizeCoordPairCore;
  const direct = candidate ? normalizeCoordPair(candidate.lat, candidate.lng) : null;
  const ref = reference ? normalizeCoordPair(reference.lat, reference.lng) : null;
  if (!direct) return ref;
  if (!ref) return direct;
  const isExtremeOutlier = Math.abs(direct.lat - ref.lat) > 1.5 || Math.abs(direct.lng - ref.lng) > 1.5;
  return isExtremeOutlier ? ref : direct;
}

export function resolveCoordsFromShapeCore(shape, {
  normalizeCoordPairFn
} = {}) {
  const normalizeCoordPair = typeof normalizeCoordPairFn === "function"
    ? normalizeCoordPairFn
    : normalizeCoordPairCore;
  if (!shape || typeof shape !== "object") return null;
  return normalizeCoordPair(shape.lat, shape.lng)
    || normalizeCoordPair(shape.latitude, shape.longitude)
    || normalizeCoordPair(shape.lat, shape.lon)
    || normalizeCoordPair(shape.latitude, shape.lon)
    || normalizeCoordPair(shape._lat, shape._long)
    || normalizeCoordPair(shape._latitude, shape._longitude);
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
  return normalizeCoordPair(entity.gpsLat, entity.gpsLng)
    || normalizeCoordPair(entity.lat, entity.lng)
    || normalizeCoordPair(entity.latitude, entity.longitude)
    || normalizeCoordPair(entity.lat, entity.lon)
    || normalizeCoordPair(entity.latitude, entity.lon)
    || resolveCoordsFromShape(entity.geo)
    || resolveCoordsFromShape(entity.coords)
    || resolveCoordsFromShape(entity.gps)
    || resolveCoordsFromShape(entity.location)
    || resolveCoordsFromShape(entity.position);
}
