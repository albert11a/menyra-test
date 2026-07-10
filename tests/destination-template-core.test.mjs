import test from "node:test";
import assert from "node:assert/strict";

import {
  DESTINATION_PLACE_CATEGORY_KEYS,
  buildDestinationPublicProjectionCore,
  buildDestinationSlugCore,
  createDestinationPlaceIdCore,
  destinationDraftDiffersFromPublishedCore,
  normalizeDestinationCategoryKeyCore,
  normalizeDestinationDocCore,
  normalizeDestinationPlaceCore
} from "../apps/menyra-social/core/destinations/destination-template-core.js";

test("normalizeDestinationCategoryKeyCore maps aliases and falls back to nearby", () => {
  assert.equal(normalizeDestinationCategoryKeyCore("beach"), "beach");
  assert.equal(normalizeDestinationCategoryKeyCore("Plazha"), "beach");
  assert.equal(normalizeDestinationCategoryKeyCore("Qyteti"), "city");
  assert.equal(normalizeDestinationCategoryKeyCore("Natur"), "nature");
  assert.equal(normalizeDestinationCategoryKeyCore("unbekannt"), "nearby");
  assert.ok(DESTINATION_PLACE_CATEGORY_KEYS.includes("sights"));
});

test("buildDestinationSlugCore builds url-safe slugs", () => {
  assert.equal(buildDestinationSlugCore("Velipojë"), "velipoje");
  assert.equal(buildDestinationSlugCore("Shëngjin & Rana e Hedhun"), "shengjin-and-rana-e-hedhun");
  assert.equal(buildDestinationSlugCore(""), "");
});

test("normalizeDestinationPlaceCore sanitizes fields and keeps ids", () => {
  const place = normalizeDestinationPlaceCore({
    id: "place_a",
    name: "  Plazhi i Velipojës ",
    category: "Plazha",
    lat: "41.8734",
    lng: "19.4231",
    priority: 350,
    pinned: true,
    seasonal: "summer",
    gallery: ["https://a.jpg", "", "https://b.jpg"],
    active: false
  });
  assert.equal(place.id, "place_a");
  assert.equal(place.name, "Plazhi i Velipojës");
  assert.equal(place.category, "beach");
  assert.equal(place.lat, 41.8734);
  assert.equal(place.lng, 19.4231);
  assert.equal(place.priority, 100);
  assert.equal(place.pinned, true);
  assert.equal(place.season, "summer");
  assert.deepEqual(place.gallery, ["https://a.jpg", "https://b.jpg"]);
  assert.equal(place.active, false);
});

test("normalizeDestinationPlaceCore generates ids when missing", () => {
  const place = normalizeDestinationPlaceCore({ name: "Test" });
  assert.match(place.id, /^place_/);
  assert.match(createDestinationPlaceIdCore(1234, 0.5), /^place_ya_/);
});

test("normalizeDestinationDocCore builds draft/published shape", () => {
  const destination = normalizeDestinationDocCore("dest_velipoje", {
    name: "Velipojë",
    draft: { name: "Velipojë", places: [{ id: "p1", name: "Plazhi", category: "beach" }] },
    published: { name: "Velipojë", places: [{ id: "p1", name: "Plazhi", category: "beach" }] },
    publishedVersion: 2
  });
  assert.equal(destination.id, "dest_velipoje");
  assert.equal(destination.hasPublished, true);
  assert.equal(destination.publishedVersion, 2);
  assert.equal(destination.draft.places.length, 1);
  assert.equal(destinationDraftDiffersFromPublishedCore(destination), false);

  const changed = normalizeDestinationDocCore("dest_velipoje", {
    name: "Velipojë",
    draft: { name: "Velipojë", places: [{ id: "p1", name: "Plazhi NEU", category: "beach" }] },
    published: { name: "Velipojë", places: [{ id: "p1", name: "Plazhi", category: "beach" }] }
  });
  assert.equal(destinationDraftDiffersFromPublishedCore(changed), true);
});

test("normalizeDestinationDocCore treats legacy flat docs as draft", () => {
  const destination = normalizeDestinationDocCore("dest_x", {
    name: "Shëngjin",
    places: [{ id: "p1", name: "Rana e Hedhun", category: "beach" }]
  });
  assert.equal(destination.hasPublished, false);
  assert.equal(destination.draft.places.length, 1);
  assert.equal(destinationDraftDiffersFromPublishedCore(destination), true);
});

test("buildDestinationPublicProjectionCore publishes only active named places", () => {
  const projection = buildDestinationPublicProjectionCore({
    id: "dest_velipoje",
    name: "Velipojë",
    slug: "velipoje",
    draft: {
      name: "Velipojë",
      places: [
        { id: "p1", name: "Plazhi i Velipojës", category: "beach", active: true },
        { id: "p2", name: "Versteckt", category: "beach", active: false },
        { id: "p3", name: "", category: "beach", active: true }
      ]
    }
  }, { version: 3, publishedAtIso: "2026-07-10T00:00:00.000Z" });
  assert.equal(projection.destinationId, "dest_velipoje");
  assert.equal(projection.version, 3);
  assert.equal(projection.places.length, 1);
  assert.equal(projection.places[0].id, "p1");
  assert.equal(projection.publishedAt, "2026-07-10T00:00:00.000Z");
});
