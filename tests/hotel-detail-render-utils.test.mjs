import test from "node:test";
import assert from "node:assert/strict";

import {
  HOTEL_DESTINATION_SECTIONS_CONTAINER_ID,
  renderHotelAmenitiesSectionCore,
  renderHotelDestinationSectionsCore,
  renderHotelDetailViewCore,
  renderHotelRoomsSectionCore
} from "../apps/menyra-social/core/profile/hotel-detail-render-utils.js";

const TEMPLATE = {
  id: "dest_velipoje",
  name: "Velipoje",
  places: [
    { id: "plazhi", name: "Plazhi i Velipojes", category: "beach", lat: 41.8720, lng: 19.4240, pinned: true },
    { id: "rana", name: "Rana e Hedhun", category: "beach", lat: 41.9600, lng: 19.5400 },
    { id: "shkodra", name: "Qyteti i Shkodres", category: "city", lat: 42.0683, lng: 19.5126, priority: 40 }
  ]
};

const HOTEL_COORDS = { lat: 41.8734, lng: 19.4231 };

test("renderHotelDestinationSectionsCore groups by category with distance and nearest pill", () => {
  const html = renderHotelDestinationSectionsCore({
    template: TEMPLATE,
    overrides: {},
    hotelCoords: HOTEL_COORDS
  });
  assert.match(html, /Qyteti/);
  assert.match(html, /Plazha/);
  assert.match(html, /Plazhi i Velipojes/);
  // Naechster Ort bekommt den Sonder-Pill
  assert.match(html, /Më afër hotelit/);
  // Distanz + Reise-Label werden gerendert
  assert.match(html, /mhd-distance/);
  assert.match(html, /min/);
});

test("renderHotelDestinationSectionsCore respects hidden override", () => {
  const html = renderHotelDestinationSectionsCore({
    template: TEMPLATE,
    overrides: { hidden: ["rana"] },
    hotelCoords: HOTEL_COORDS
  });
  assert.doesNotMatch(html, /Rana e Hedhun/);
});

test("renderHotelDestinationSectionsCore returns empty string without places", () => {
  assert.equal(renderHotelDestinationSectionsCore({ template: null }), "");
  assert.equal(renderHotelDestinationSectionsCore({ template: { places: [] } }), "");
});

test("renderHotelRoomsSectionCore renders active offers with price", () => {
  const html = renderHotelRoomsSectionCore({
    offers: [
      { title: "Dhome Deluxe", text: "Pamje nga deti", price: 118, tag: "Me e zgjedhura", active: true },
      { title: "Fshehur", active: false }
    ]
  });
  assert.match(html, /Dhome Deluxe/);
  assert.match(html, /€118/);
  assert.match(html, /Me e zgjedhura/);
  assert.doesNotMatch(html, /Fshehur/);
});

test("renderHotelAmenitiesSectionCore maps known amenity icons", () => {
  const html = renderHotelAmenitiesSectionCore({ amenities: ["WLAN", "Parking", "Mengjes"] });
  assert.match(html, /Përfshihet/);
  assert.match(html, /WLAN/);
});

test("renderHotelDetailViewCore emits destination container with skeleton when uncached", () => {
  const html = renderHotelDetailViewCore({
    offers: [{ title: "Dhome", active: true }],
    amenities: ["WLAN"],
    destinationId: "dest_velipoje",
    destinationName: "Velipoje"
  });
  assert.match(html, new RegExp(HOTEL_DESTINATION_SECTIONS_CONTAINER_ID));
  assert.match(html, /data-destination-id="dest_velipoje"/);
  assert.match(html, /mhd-skeleton/);
});

test("renderHotelDetailViewCore inlines destination sections when provided", () => {
  const sections = renderHotelDestinationSectionsCore({
    template: TEMPLATE,
    overrides: {},
    hotelCoords: HOTEL_COORDS
  });
  const html = renderHotelDetailViewCore({
    destinationId: "dest_velipoje",
    destinationSectionsHtml: sections
  });
  assert.match(html, /Plazhi i Velipojes/);
  assert.doesNotMatch(html, /mhd-skeleton/);
});

test("renderHotelDetailViewCore omits destination container content without destination", () => {
  const html = renderHotelDetailViewCore({ offers: [{ title: "Dhome", active: true }] });
  assert.doesNotMatch(html, /mhd-skeleton/);
  assert.match(html, /data-destination-id=""/);
});
