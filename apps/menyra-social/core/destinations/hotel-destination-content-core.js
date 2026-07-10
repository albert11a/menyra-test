import {
  groupDestinationPlacesByCategoryCore,
  normalizeDestinationOverridesCore,
  resolveLeadDestinationPlacesCore
} from "./destination-merge-core.js";
import {
  formatDistanceLabelCore,
  formatTravelLabelCore
} from "./destination-distance-core.js";

export const HOTEL_DESTINATION_CONTENT_CORE_VERSION = "hotel-destination-content-core.v1";

function asText(value = "") {
  if (value == null) return "";
  return String(value).trim();
}

// Sektionstexte (sq, wie die restliche Hotel-Detailseite) und Lucide-Icons je
// Destination-Kategorie fuer die Hotel-Detailseite.
export const HOTEL_DESTINATION_SECTION_META = Object.freeze({
  city: Object.freeze({ eyebrow: "Përreth teje", icon: "building-2" }),
  beach: Object.freeze({ eyebrow: "Deti afër", icon: "waves" }),
  sights: Object.freeze({ eyebrow: "Vlen të shihet", icon: "landmark" }),
  activities: Object.freeze({ eyebrow: "Koha e lirë", icon: "compass" }),
  nature: Object.freeze({ eyebrow: "Natyra afër", icon: "trees" }),
  food: Object.freeze({ eyebrow: "Shije lokale", icon: "utensils" }),
  nearby: Object.freeze({ eyebrow: "Afër teje", icon: "map-pin" })
});

// Liest die Destination-Verknuepfung vom Restaurant-/Hotel-Dokument
// (geschrieben vom Heart-Lead-Save): nur ID, Name und Overrides.
export function resolveHotelDestinationContextCore(record = {}) {
  const source = record && typeof record === "object" ? record : {};
  return {
    destinationId: asText(source.destinationId),
    destinationName: asText(source.destinationName),
    overrides: normalizeDestinationOverridesCore(source.destinationOverrides || {})
  };
}

// Template-Orte + Hotel-Overrides + Hotel-Pin -> sichtbare, sortierte
// Kategorien-Sektionen inkl. Anzeige-Metadaten.
export function buildHotelDestinationSectionsCore({
  places = [],
  overrides = {},
  hotelCoords = null
} = {}) {
  const resolved = resolveLeadDestinationPlacesCore({
    places,
    overrides,
    hotelCoords,
    includeHidden: false
  });
  return groupDestinationPlacesByCategoryCore(resolved).map((group) => ({
    ...group,
    meta: HOTEL_DESTINATION_SECTION_META[group.key] || HOTEL_DESTINATION_SECTION_META.nearby
  }));
}

export function formatHotelPlaceDistanceCore(distanceMeters) {
  // formatDistanceLabelCore behandelt null/"" als 0 m - ohne echte Distanz
  // (kein Hotel-Pin oder Ort ohne Koordinaten) darf gar kein Label erscheinen.
  if (distanceMeters == null || !Number.isFinite(Number(distanceMeters))) {
    return { distance: "", travel: "" };
  }
  return {
    distance: formatDistanceLabelCore(distanceMeters),
    travel: formatTravelLabelCore(distanceMeters, {
      walk: "min në këmbë",
      drive: "min me makinë"
    })
  };
}
