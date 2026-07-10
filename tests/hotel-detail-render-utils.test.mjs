import test from "node:test";
import assert from "node:assert/strict";

import {
  HOTEL_DESTINATION_SECTIONS_CONTAINER_ID,
  HOTEL_DETAIL_MAP_CONTAINER_ID,
  parseManualDistanceLabelToMetersCore,
  renderHotelAmenitiesSectionCore,
  renderHotelCityFallbackSectionCore,
  renderHotelDestinationSectionsCore,
  renderHotelDetailPendingViewCore,
  renderHotelDetailViewCore,
  renderHotelMapSectionCore,
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

test("manual beach distance from the lead replaces the computed meters", () => {
  const html = renderHotelDestinationSectionsCore({
    template: TEMPLATE,
    overrides: {},
    hotelCoords: HOTEL_COORDS,
    manualBeachDistance: { label: "300 m", direct: false }
  });
  // Der erste Plazha-Ort zeigt die Lead-Eingabe statt der Haversine-Meter.
  assert.match(html, />300 m</);
  // Gehzeit wird aus der Lead-Eingabe geschaetzt (300 m -> Minuten in Fuss).
  assert.match(html, /min në këmbë/);
});

test("manual beach distance direct flag renders Në plazh", () => {
  const html = renderHotelDestinationSectionsCore({
    template: TEMPLATE,
    overrides: {},
    hotelCoords: HOTEL_COORDS,
    manualBeachDistance: { label: "", direct: true }
  });
  assert.match(html, /Në plazh/);
});

test("parseManualDistanceLabelToMetersCore parses m and km labels", () => {
  assert.equal(parseManualDistanceLabelToMetersCore("300 m"), 300);
  assert.equal(parseManualDistanceLabelToMetersCore("1,2 km"), 1200);
  assert.equal(parseManualDistanceLabelToMetersCore("450"), 450);
  assert.equal(parseManualDistanceLabelToMetersCore(""), null);
  assert.equal(parseManualDistanceLabelToMetersCore("direkt"), null);
});

test("renderHotelDetailPendingViewCore renders skeleton sections", () => {
  const html = renderHotelDetailPendingViewCore();
  assert.match(html, /mhd-skeleton/);
  assert.ok((html.match(/mhd-skeleton/g) || []).length >= 3);
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

test("renderHotelRoomsSectionCore prefers rooms with meta parts over offers", () => {
  const html = renderHotelRoomsSectionCore({
    rooms: [{
      title: "Dhome Deluxe",
      priceLabel: "€118",
      metaParts: [
        { icon: "users", label: "2 persona" },
        { icon: "bed", label: "1 king" },
        { icon: "size", label: "31 m²" }
      ],
      active: true
    }],
    offers: [{ title: "Alte Oferta", active: true }]
  });
  assert.match(html, /Dhome Deluxe/);
  assert.match(html, /2 persona/);
  assert.match(html, /31 m²/);
  assert.match(html, /€118/);
  assert.doesNotMatch(html, /Alte Oferta/);
});

test("renderHotelCityFallbackSectionCore renders city card without template", () => {
  const html = renderHotelCityFallbackSectionCore({ city: "Velipoje", address: "Rruga e Plazhit 1" });
  assert.match(html, /Qyteti/);
  assert.match(html, /Velipoje/);
  assert.match(html, /Rruga e Plazhit 1/);
  assert.equal(renderHotelCityFallbackSectionCore({ city: "" }), "");
});

test("renderHotelDetailViewCore shows city fallback only without destination", () => {
  const withoutDestination = renderHotelDetailViewCore({ city: "Velipoje", address: "Rruga 1" });
  assert.match(withoutDestination, /Velipoje/);
  const withDestination = renderHotelDetailViewCore({ city: "Velipoje", destinationId: "dest_1" });
  assert.doesNotMatch(withDestination, /mhd-pill">Qyteti/);
});

test("renderHotelMapSectionCore emits live map container with coords", () => {
  const html = renderHotelMapSectionCore({
    address: "Rruga 1",
    city: "Velipoje",
    mapsUrl: "https://maps.google.com/?q=1,2",
    hotelCoords: { lat: 41.87, lng: 19.42 },
    hotelName: "Hotel Vela"
  });
  assert.match(html, new RegExp(HOTEL_DETAIL_MAP_CONTAINER_ID));
  assert.match(html, /data-map-lat="41.87"/);
  assert.match(html, /data-map-name="Hotel Vela"/);
  assert.match(html, /Harta e zbulimit/);
  const withoutCoords = renderHotelMapSectionCore({ address: "Rruga 1", city: "Velipoje", mapsUrl: "x" });
  assert.doesNotMatch(withoutCoords, new RegExp(HOTEL_DETAIL_MAP_CONTAINER_ID));
});
