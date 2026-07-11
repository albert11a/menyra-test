import test from "node:test";
import assert from "node:assert/strict";

import {
  buildHotelRoomMetaPartsCore,
  collectHotelRoomsCore,
  createHotelRoomIdCore,
  formatHotelRoomPriceLabelCore,
  normalizeHotelRoomCore,
  normalizeHotelRoomsCore
} from "../apps/menyra-social/core/profile/hotel-rooms-utils.js";

test("normalizeHotelRoomCore sanitizes fields", () => {
  const room = normalizeHotelRoomCore({
    id: "room_a",
    title: "  Dhome Deluxe ",
    price: "118,50",
    persons: "2",
    beds: "1 king",
    size: "31.4",
    tag: "Me e zgjedhura",
    active: false
  });
  assert.equal(room.id, "room_a");
  assert.equal(room.title, "Dhome Deluxe");
  assert.equal(room.price, 118.5);
  assert.equal(room.persons, 2);
  assert.equal(room.beds, "1 king");
  assert.equal(room.size, 31);
  assert.equal(room.tag, "Me e zgjedhura");
  assert.equal(room.active, false);
  assert.equal(room.currency, "EUR");
});

test("normalizeHotelRoomCore generates ids and nulls invalid numbers", () => {
  const room = normalizeHotelRoomCore({ title: "Test", price: "abc", persons: -3, size: "" });
  assert.match(room.id, /^room_/);
  assert.equal(room.price, null);
  assert.equal(room.persons, null);
  assert.equal(room.size, null);
  assert.match(createHotelRoomIdCore(1234, 0.5), /^room_ya_/);
});

test("collectHotelRoomsCore keeps only titled rooms from hotelRooms", () => {
  const rooms = collectHotelRoomsCore({
    hotelRooms: [
      { id: "a", title: "Dhome Deluxe" },
      { id: "b", title: "" },
      { id: "c", title: "Suite", active: false }
    ]
  });
  assert.deepEqual(rooms.map((room) => room.id), ["a", "c"]);
  assert.deepEqual(collectHotelRoomsCore({}), []);
});

test("normalizeHotelRoomsCore caps list length", () => {
  const many = Array.from({ length: 30 }, (_, index) => ({ id: `r${index}`, title: `Room ${index}` }));
  assert.equal(normalizeHotelRoomsCore(many).length, 20);
});

test("buildHotelRoomMetaPartsCore builds persons/beds/size parts", () => {
  const parts = buildHotelRoomMetaPartsCore({ persons: 2, beds: "1 king", size: 31 });
  assert.deepEqual(parts.map((part) => part.label), ["2 persona", "1 king", "31 m²"]);
  assert.deepEqual(buildHotelRoomMetaPartsCore({}), []);
});

test("formatHotelRoomPriceLabelCore formats price with currency", () => {
  assert.equal(formatHotelRoomPriceLabelCore({ price: 118, currency: "EUR" }), "€118");
  assert.equal(formatHotelRoomPriceLabelCore({ price: 118.5, currency: "EUR" }), "€118.50");
  assert.equal(formatHotelRoomPriceLabelCore({ price: 4500, currency: "LEK" }), "4500 LEK");
  assert.equal(formatHotelRoomPriceLabelCore({ price: 0 }), "");
});

test("normalizeHotelRoomCore normalizes multi-image gallery", () => {
  const room = normalizeHotelRoomCore({
    id: "room_g",
    title: "Suite",
    images: ["https://one.jpg", " https://two.jpg ", "", "https://one.jpg"],
    imageUrl: "https://legacy.jpg"
  });
  assert.deepEqual(room.images, ["https://one.jpg", "https://two.jpg", "https://legacy.jpg"]);
  assert.equal(room.imageUrl, "https://one.jpg");
});

test("normalizeHotelRoomCore keeps legacy single imageUrl as gallery", () => {
  const room = normalizeHotelRoomCore({ id: "room_l", title: "Basic", imageUrl: "https://legacy.jpg" });
  assert.deepEqual(room.images, ["https://legacy.jpg"]);
  assert.equal(room.imageUrl, "https://legacy.jpg");
});

test("normalizeHotelRoomCore caps gallery at 8 images", () => {
  const many = Array.from({ length: 12 }, (_, index) => `https://img${index}.jpg`);
  const room = normalizeHotelRoomCore({ id: "room_m", title: "Grande", images: many });
  assert.equal(room.images.length, 8);
  assert.equal(room.imageUrl, "https://img0.jpg");
});
