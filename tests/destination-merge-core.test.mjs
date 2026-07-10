import test from "node:test";
import assert from "node:assert/strict";

import {
  destinationOverridesAreEmptyCore,
  groupDestinationPlacesByCategoryCore,
  normalizeDestinationOverridesCore,
  parseDestinationOverridesJsonCore,
  resolveLeadDestinationPlacesCore,
  serializeDestinationOverridesCore
} from "../apps/menyra-social/core/destinations/destination-merge-core.js";

const HOTEL_COORDS = { lat: 41.8734, lng: 19.4231 };

const TEMPLATE_PLACES = [
  { id: "plazhi", name: "Plazhi i Velipojës", category: "beach", lat: 41.8720, lng: 19.4240, priority: 0, pinned: true },
  { id: "rana", name: "Rana e Hedhun", category: "beach", lat: 41.9600, lng: 19.5400, priority: 0 },
  { id: "viluni", name: "Laguna e Vilunit", category: "nature", lat: 41.9000, lng: 19.4400, priority: 0 },
  { id: "shkodra", name: "Qyteti i Shkodrës", category: "city", lat: 42.0683, lng: 19.5126, priority: 40 },
  { id: "qendra", name: "Qendra e Velipojës", category: "city", lat: 41.8760, lng: 19.4300, priority: 0 },
  { id: "inaktiv", name: "Deaktiviert", category: "city", active: false }
];

test("resolveLeadDestinationPlacesCore sorts pinned > priority > distance", () => {
  const resolved = resolveLeadDestinationPlacesCore({
    places: TEMPLATE_PLACES,
    overrides: {},
    hotelCoords: HOTEL_COORDS
  });
  const ids = resolved.map((place) => place.id);
  // Template-pinned zuerst, dann Prioritaet, dann Naehe; inaktive fehlen ganz.
  assert.equal(ids[0], "plazhi");
  assert.equal(ids[1], "shkodra");
  assert.deepEqual(ids.slice(2), ["qendra", "viluni", "rana"]);
  assert.ok(!ids.includes("inaktiv"));
  assert.ok(resolved[0].distanceMeters < 500);
});

test("lead pins beat template pins and keep pin order", () => {
  const resolved = resolveLeadDestinationPlacesCore({
    places: TEMPLATE_PLACES,
    overrides: { pinned: ["viluni", "rana"] },
    hotelCoords: HOTEL_COORDS
  });
  assert.deepEqual(resolved.slice(0, 2).map((place) => place.id), ["viluni", "rana"]);
});

test("hidden overrides remove places unless includeHidden", () => {
  const withoutHidden = resolveLeadDestinationPlacesCore({
    places: TEMPLATE_PLACES,
    overrides: { hidden: ["rana"] },
    hotelCoords: HOTEL_COORDS
  });
  assert.ok(!withoutHidden.some((place) => place.id === "rana"));

  const withHidden = resolveLeadDestinationPlacesCore({
    places: TEMPLATE_PLACES,
    overrides: { hidden: ["rana"] },
    hotelCoords: HOTEL_COORDS,
    includeHidden: true
  });
  const rana = withHidden.find((place) => place.id === "rana");
  assert.equal(rana.hidden, true);
});

test("place patches override name, description and cover image", () => {
  const resolved = resolveLeadDestinationPlacesCore({
    places: TEMPLATE_PLACES,
    overrides: {
      placePatches: {
        plazhi: { coverImageUrl: "https://hotel-eigenes-foto.jpg", description: "Direkt vor dem Hotel." }
      }
    },
    hotelCoords: HOTEL_COORDS
  });
  const plazhi = resolved.find((place) => place.id === "plazhi");
  assert.equal(plazhi.coverImageUrl, "https://hotel-eigenes-foto.jpg");
  assert.equal(plazhi.description, "Direkt vor dem Hotel.");
});

test("distances stay null without hotel coords", () => {
  const resolved = resolveLeadDestinationPlacesCore({
    places: TEMPLATE_PLACES,
    overrides: {}
  });
  assert.ok(resolved.every((place) => place.distanceMeters === null));
});

test("overrides serialize/parse round trip and empty detection", () => {
  const overrides = normalizeDestinationOverridesCore({
    hidden: ["a", "a", "", "b"],
    pinned: ["c"],
    placePatches: { a: { coverImageUrl: "https://x.jpg" }, bad: {} }
  });
  assert.deepEqual(overrides.hidden, ["a", "b"]);
  assert.deepEqual(Object.keys(overrides.placePatches), ["a"]);
  const json = serializeDestinationOverridesCore(overrides);
  assert.deepEqual(parseDestinationOverridesJsonCore(json), overrides);
  assert.deepEqual(parseDestinationOverridesJsonCore("kaputt{"), normalizeDestinationOverridesCore({}));
  assert.equal(destinationOverridesAreEmptyCore(overrides), false);
  assert.equal(destinationOverridesAreEmptyCore({}), true);
});

test("groupDestinationPlacesByCategoryCore groups in fixed category order", () => {
  const resolved = resolveLeadDestinationPlacesCore({
    places: TEMPLATE_PLACES,
    overrides: {},
    hotelCoords: HOTEL_COORDS
  });
  const groups = groupDestinationPlacesByCategoryCore(resolved);
  assert.deepEqual(groups.map((group) => group.key), ["city", "beach", "nature"]);
  assert.equal(groups.find((group) => group.key === "beach").places.length, 2);
});
