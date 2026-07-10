import test from "node:test";
import assert from "node:assert/strict";
import {
  HOTEL_DESTINATION_SECTION_META,
  buildHotelDestinationSectionsCore,
  formatHotelPlaceDistanceCore,
  resolveHotelDestinationContextCore
} from "../apps/menyra-social/core/destinations/hotel-destination-content-core.js";

const HOTEL_COORDS = { lat: 41.87, lng: 19.42 };

function templatePlaces() {
  return [
    {
      id: "place-beach",
      name: "Plazhi i Velipojes",
      category: "beach",
      description: "Reret e gjera",
      lat: 41.8712,
      lng: 19.4205,
      priority: 50,
      active: true
    },
    {
      id: "place-city",
      name: "Qendra",
      category: "city",
      description: "Shetitorja",
      lat: 41.88,
      lng: 19.43,
      priority: 40,
      active: true
    },
    {
      id: "place-hidden",
      name: "Ort i fshehur",
      category: "city",
      active: true
    },
    {
      id: "place-inactive",
      name: "Jo aktiv",
      category: "nature",
      active: false
    }
  ];
}

test("resolveHotelDestinationContextCore reads id, name and overrides from the record", () => {
  const context = resolveHotelDestinationContextCore({
    destinationId: " velipoje ",
    destinationName: " Velipoje ",
    destinationOverrides: {
      hidden: ["place-hidden", "place-hidden"],
      pinned: ["place-city"],
      placePatches: {
        "place-beach": { name: "Plazhi kryesor", junk: "ignored" }
      }
    }
  });
  assert.equal(context.destinationId, "velipoje");
  assert.equal(context.destinationName, "Velipoje");
  assert.deepEqual(context.overrides.hidden, ["place-hidden"]);
  assert.deepEqual(context.overrides.pinned, ["place-city"]);
  assert.equal(context.overrides.placePatches["place-beach"].name, "Plazhi kryesor");
  assert.equal(context.overrides.placePatches["place-beach"].junk, undefined);
});

test("resolveHotelDestinationContextCore is safe for missing/invalid records", () => {
  for (const record of [null, undefined, {}, { destinationOverrides: "kaputt" }]) {
    const context = resolveHotelDestinationContextCore(record);
    assert.equal(context.destinationId, "");
    assert.deepEqual(context.overrides.hidden, []);
  }
});

test("buildHotelDestinationSectionsCore filters hidden/inactive, applies patches and distances", () => {
  const sections = buildHotelDestinationSectionsCore({
    places: templatePlaces(),
    overrides: {
      hidden: ["place-hidden"],
      placePatches: { "place-beach": { name: "Plazhi kryesor" } }
    },
    hotelCoords: HOTEL_COORDS
  });

  const keys = sections.map((section) => section.key);
  assert.deepEqual(keys, ["city", "beach"]);

  const beach = sections.find((section) => section.key === "beach");
  assert.equal(beach.places.length, 1);
  assert.equal(beach.places[0].name, "Plazhi kryesor");
  assert.ok(Number.isFinite(beach.places[0].distanceMeters));
  assert.equal(beach.meta.icon, HOTEL_DESTINATION_SECTION_META.beach.icon);
  assert.equal(beach.label, "Plazha");

  const city = sections.find((section) => section.key === "city");
  assert.equal(city.places.length, 1);
  assert.equal(city.places[0].id, "place-city");
});

test("buildHotelDestinationSectionsCore works without hotel coords (no distances)", () => {
  const sections = buildHotelDestinationSectionsCore({
    places: templatePlaces(),
    overrides: {},
    hotelCoords: null
  });
  const beach = sections.find((section) => section.key === "beach");
  assert.equal(beach.places[0].distanceMeters, null);
});

test("formatHotelPlaceDistanceCore renders Albanian walk/drive labels", () => {
  const walk = formatHotelPlaceDistanceCore(240);
  assert.equal(walk.distance, "240 m");
  assert.equal(walk.travel, "3 min në këmbë");

  const drive = formatHotelPlaceDistanceCore(12000);
  assert.equal(drive.distance, "12 km");
  assert.ok(drive.travel.endsWith("min me makinë"));

  const none = formatHotelPlaceDistanceCore(null);
  assert.equal(none.distance, "");
  assert.equal(none.travel, "");
});
