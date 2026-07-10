import {
  DESTINATION_PLACE_CATEGORIES,
  normalizeDestinationPlaceCore
} from "./destination-template-core.js";
import {
  hasFiniteCoordsCore,
  haversineDistanceMetersCore
} from "./destination-distance-core.js";

export const DESTINATION_MERGE_CORE_VERSION = "destination-merge-core.v1";

const MAX_OVERRIDE_IDS = 200;

function asText(value = "") {
  if (value == null) return "";
  return String(value).trim();
}

function uniqueIdList(value) {
  if (!Array.isArray(value)) return [];
  return Array.from(new Set(value.map((entry) => asText(entry)).filter(Boolean))).slice(0, MAX_OVERRIDE_IDS);
}

export function normalizeDestinationOverridesCore(raw = {}) {
  const source = raw && typeof raw === "object" ? raw : {};
  const placePatchesSource = source.placePatches && typeof source.placePatches === "object"
    ? source.placePatches
    : {};
  const placePatches = {};
  Object.entries(placePatchesSource).slice(0, MAX_OVERRIDE_IDS).forEach(([placeId, patch]) => {
    const safeId = asText(placeId);
    if (!safeId || !patch || typeof patch !== "object") return;
    const safePatch = {};
    if (asText(patch.name)) safePatch.name = asText(patch.name);
    if (asText(patch.description)) safePatch.description = asText(patch.description).slice(0, 600);
    if (asText(patch.coverImageUrl)) safePatch.coverImageUrl = asText(patch.coverImageUrl);
    if (Object.keys(safePatch).length) placePatches[safeId] = safePatch;
  });
  return {
    hidden: uniqueIdList(source.hidden),
    pinned: uniqueIdList(source.pinned),
    placePatches
  };
}

export function parseDestinationOverridesJsonCore(rawJson = "") {
  const text = asText(rawJson);
  if (!text) return normalizeDestinationOverridesCore({});
  try {
    return normalizeDestinationOverridesCore(JSON.parse(text));
  } catch {
    return normalizeDestinationOverridesCore({});
  }
}

export function serializeDestinationOverridesCore(overrides = {}) {
  return JSON.stringify(normalizeDestinationOverridesCore(overrides));
}

export function destinationOverridesAreEmptyCore(overrides = {}) {
  const normalized = normalizeDestinationOverridesCore(overrides);
  return !normalized.hidden.length
    && !normalized.pinned.length
    && !Object.keys(normalized.placePatches).length;
}

/**
 * Merge des veroeffentlichten Destination-Templates mit den Hotel-Abweichungen
 * eines Leads: Patches anwenden, Distanz zum Hotel-Pin berechnen und sortieren
 * (fest markierte Orte -> Prioritaet -> Naehe -> Name).
 */
export function resolveLeadDestinationPlacesCore({
  places = [],
  overrides = {},
  hotelCoords = null,
  includeHidden = false
} = {}) {
  const safeOverrides = normalizeDestinationOverridesCore(overrides);
  const hiddenSet = new Set(safeOverrides.hidden);
  const pinnedRank = new Map(safeOverrides.pinned.map((placeId, index) => [placeId, index]));
  const coords = hasFiniteCoordsCore(hotelCoords) ? hotelCoords : null;

  const resolved = (Array.isArray(places) ? places : [])
    .map((place, index) => normalizeDestinationPlaceCore(place, { index }))
    .filter((place) => place.name && place.active)
    .map((place) => {
      const patch = safeOverrides.placePatches[place.id] || {};
      const distanceMeters = coords && hasFiniteCoordsCore(place)
        ? haversineDistanceMetersCore(coords.lat, coords.lng, place.lat, place.lng)
        : null;
      return {
        ...place,
        ...patch,
        hidden: hiddenSet.has(place.id),
        pinned: pinnedRank.has(place.id) || place.pinned,
        pinnedRank: pinnedRank.has(place.id) ? pinnedRank.get(place.id) : null,
        distanceMeters
      };
    })
    .filter((place) => includeHidden || !place.hidden);

  return resolved.sort((a, b) => {
    const aLeadPin = a.pinnedRank != null;
    const bLeadPin = b.pinnedRank != null;
    if (aLeadPin !== bLeadPin) return aLeadPin ? -1 : 1;
    if (aLeadPin && bLeadPin && a.pinnedRank !== b.pinnedRank) return a.pinnedRank - b.pinnedRank;
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    if (a.priority !== b.priority) return b.priority - a.priority;
    const aDistance = Number.isFinite(a.distanceMeters) ? a.distanceMeters : Infinity;
    const bDistance = Number.isFinite(b.distanceMeters) ? b.distanceMeters : Infinity;
    if (aDistance !== bDistance) return aDistance - bDistance;
    return String(a.name).localeCompare(String(b.name));
  });
}

export function groupDestinationPlacesByCategoryCore(places = []) {
  const list = Array.isArray(places) ? places : [];
  return DESTINATION_PLACE_CATEGORIES
    .map((category) => ({
      ...category,
      places: list.filter((place) => place.category === category.key)
    }))
    .filter((group) => group.places.length);
}
