export function createLeadLocationCore({
  address = "",
  lat = null,
  lng = null
} = {}) {
  const nextAddress = String(address || "").trim();
  const nextLat = Number(lat);
  const nextLng = Number(lng);
  return {
    address: nextAddress,
    lat: Number.isFinite(nextLat) ? nextLat : null,
    lng: Number.isFinite(nextLng) ? nextLng : null
  };
}

export function normalizeLeadLocationsCore(locations, fallbackAddress = "", fallbackCoords = null, {
  resolveCoordsFromEntityFn,
  createLeadLocationFn,
  hasLeadLocationCoordsFn
} = {}) {
  const resolveCoordsFromEntity = typeof resolveCoordsFromEntityFn === "function"
    ? resolveCoordsFromEntityFn
    : (() => null);
  const createLeadLocation = typeof createLeadLocationFn === "function"
    ? createLeadLocationFn
    : createLeadLocationCore;
  const hasLeadLocationCoords = typeof hasLeadLocationCoordsFn === "function"
    ? hasLeadLocationCoordsFn
    : (() => false);
  const source = Array.isArray(locations) ? locations : [];
  const list = source.map((entry) => {
    const row = entry || {};
    const directCoords = resolveCoordsFromEntity(row);
    return createLeadLocation({
      address: row.address || row.label || "",
      lat: directCoords?.lat ?? row.gpsLat ?? row.lat ?? row.latitude ?? row.coords?.lat ?? row.coords?.latitude,
      lng: directCoords?.lng ?? row.gpsLng ?? row.lng ?? row.lon ?? row.longitude ?? row.coords?.lng ?? row.coords?.longitude
    });
  }).filter((row) => row.address || hasLeadLocationCoords(row));

  if (!list.length) {
    const fallback = createLeadLocation({
      address: fallbackAddress,
      lat: fallbackCoords?.lat,
      lng: fallbackCoords?.lng
    });
    if (fallback.address || hasLeadLocationCoords(fallback)) {
      list.push(fallback);
    }
  }

  if (!list.length) {
    list.push(createLeadLocation());
  }

  return list.slice(0, 12);
}

export function getPrimaryLeadLocationCore(locations, {
  normalizeLeadLocationsFn,
  hasLeadLocationCoordsFn,
  createLeadLocationFn
} = {}) {
  const normalizeLeadLocations = typeof normalizeLeadLocationsFn === "function"
    ? normalizeLeadLocationsFn
    : ((value) => value || []);
  const hasLeadLocationCoords = typeof hasLeadLocationCoordsFn === "function"
    ? hasLeadLocationCoordsFn
    : (() => false);
  const createLeadLocation = typeof createLeadLocationFn === "function"
    ? createLeadLocationFn
    : createLeadLocationCore;
  const list = normalizeLeadLocations(locations);
  const withCoords = list.find((item) => hasLeadLocationCoords(item));
  return withCoords || list[0] || createLeadLocation();
}
