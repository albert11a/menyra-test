import test from "node:test";
import assert from "node:assert/strict";

import {
  HOTEL_STAY_SECTION_OFFERS,
  HOTEL_STAY_SECTION_ROOMS,
  collectHotelStayImagesCore,
  normalizeHotelStaySectionCore,
  resolveHotelStaySectionCore
} from "../apps/menyra-social/core/profile/hotel-stay-section-utils.js";

test("normalizeHotelStaySectionCore defaults to rooms", () => {
  assert.equal(normalizeHotelStaySectionCore(), HOTEL_STAY_SECTION_ROOMS);
  assert.equal(normalizeHotelStaySectionCore(""), HOTEL_STAY_SECTION_ROOMS);
  assert.equal(normalizeHotelStaySectionCore("unbekannt"), HOTEL_STAY_SECTION_ROOMS);
  assert.equal(normalizeHotelStaySectionCore("rooms"), HOTEL_STAY_SECTION_ROOMS);
});

test("normalizeHotelStaySectionCore accepts offers aliases", () => {
  assert.equal(normalizeHotelStaySectionCore("offers"), HOTEL_STAY_SECTION_OFFERS);
  assert.equal(normalizeHotelStaySectionCore(" OFERTA "), HOTEL_STAY_SECTION_OFFERS);
  assert.equal(normalizeHotelStaySectionCore("offer"), HOTEL_STAY_SECTION_OFFERS);
});

test("resolveHotelStaySectionCore falls back when preferred source is empty", () => {
  assert.equal(
    resolveHotelStaySectionCore({ preferred: "offers", roomsCount: 2, offersCount: 0 }),
    HOTEL_STAY_SECTION_ROOMS
  );
  assert.equal(
    resolveHotelStaySectionCore({ preferred: "offers", roomsCount: 0, offersCount: 3 }),
    HOTEL_STAY_SECTION_OFFERS
  );
  assert.equal(
    resolveHotelStaySectionCore({ preferred: "rooms", roomsCount: 0, offersCount: 3 }),
    HOTEL_STAY_SECTION_OFFERS
  );
  assert.equal(
    resolveHotelStaySectionCore({ preferred: "rooms", roomsCount: 1, offersCount: 3 }),
    HOTEL_STAY_SECTION_ROOMS
  );
});

test("collectHotelStayImagesCore dedupes images with imageUrl fallback", () => {
  assert.deepEqual(
    collectHotelStayImagesCore({
      images: ["https://a.jpg", "", "https://b.jpg", "https://a.jpg"],
      imageUrl: "https://b.jpg"
    }),
    ["https://a.jpg", "https://b.jpg"]
  );
  assert.deepEqual(
    collectHotelStayImagesCore({ imageUrl: " https://only.jpg " }),
    ["https://only.jpg"]
  );
  assert.deepEqual(collectHotelStayImagesCore({}), []);
});
