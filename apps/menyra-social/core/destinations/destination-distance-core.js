export const DESTINATION_DISTANCE_CORE_VERSION = "destination-distance-core.v1";

const EARTH_RADIUS_METERS = 6371000;
const WALK_METERS_PER_MINUTE = 80;
const DRIVE_METERS_PER_MINUTE = 600;
const WALK_MAX_METERS = 1600;

function toRadians(value = 0) {
  return (Number(value) || 0) * (Math.PI / 180);
}

// Number(null)/Number("") sind 0 und damit "finite" - Koordinaten muessen
// deshalb explizit vorhanden sein, bevor sie als Zahl gelten.
function parseCoordValue(value) {
  if (value == null || value === "") return NaN;
  return Number(value);
}

export function hasFiniteCoordsCore(value = {}) {
  return Number.isFinite(parseCoordValue(value?.lat)) && Number.isFinite(parseCoordValue(value?.lng));
}

export function haversineDistanceMetersCore(fromLat, fromLng, toLat, toLng) {
  const lat1 = parseCoordValue(fromLat);
  const lng1 = parseCoordValue(fromLng);
  const lat2 = parseCoordValue(toLat);
  const lng2 = parseCoordValue(toLng);
  if (![lat1, lng1, lat2, lng2].every(Number.isFinite)) return null;
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2
    + Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLng / 2) ** 2;
  return Math.round(2 * EARTH_RADIUS_METERS * Math.asin(Math.min(1, Math.sqrt(a))));
}

export function formatDistanceLabelCore(meters) {
  const value = Number(meters);
  if (!Number.isFinite(value) || value < 0) return "";
  if (value < 1000) return `${Math.max(10, Math.round(value / 10) * 10)} m`;
  if (value < 10000) return `${(value / 1000).toFixed(1).replace(/\.0$/, "")} km`;
  return `${Math.round(value / 1000)} km`;
}

export function estimateTravelCore(meters) {
  const value = Number(meters);
  if (!Number.isFinite(value) || value < 0) return null;
  if (value <= WALK_MAX_METERS) {
    return {
      mode: "walk",
      minutes: Math.max(1, Math.round(value / WALK_METERS_PER_MINUTE))
    };
  }
  return {
    mode: "drive",
    minutes: Math.max(1, Math.round(value / DRIVE_METERS_PER_MINUTE))
  };
}

export function formatTravelLabelCore(meters, labels = {}) {
  const travel = estimateTravelCore(meters);
  if (!travel) return "";
  const walkLabel = String(labels.walk || "min in Gehweite");
  const driveLabel = String(labels.drive || "min mit dem Auto");
  return `${travel.minutes} ${travel.mode === "walk" ? walkLabel : driveLabel}`;
}
