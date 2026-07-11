export const HOTEL_ROOMS_UTILS_VERSION = "hotel-rooms-utils.v2";

const MAX_HOTEL_ROOMS = 20;
export const MAX_HOTEL_ROOM_IMAGES = 8;

function asText(value = "") {
  if (value == null) return "";
  return String(value).trim();
}

function asPositiveNumber(value) {
  if (value == null || value === "") return null;
  const parsed = Number(String(value).replace(",", "."));
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

export function createHotelRoomIdCore(nowMs = Date.now(), randomValue = Math.random()) {
  const timePart = Math.max(0, Number(nowMs) || 0).toString(36);
  const randomPart = Math.floor(Math.max(0, Math.min(0.999999, Number(randomValue) || 0)) * 36 ** 6)
    .toString(36)
    .padStart(6, "0");
  return `room_${timePart}_${randomPart}`;
}

// Mehrere Fotos pro Zimmer: images[0] bleibt als imageUrl gespiegelt, damit
// Altbestand (nur imageUrl) und neue Galerie-Daten dieselbe Wahrheit teilen.
export function normalizeHotelRoomImagesCore(source = {}) {
  const raw = source && typeof source === "object" ? source : {};
  const list = [
    ...(Array.isArray(raw.images) ? raw.images : []),
    asText(raw.imageUrl ?? raw.image ?? raw.photoUrl)
  ];
  const unique = [];
  list.forEach((entry) => {
    const url = asText(entry);
    if (url && !unique.includes(url)) unique.push(url);
  });
  return unique.slice(0, MAX_HOTEL_ROOM_IMAGES);
}

export function normalizeHotelRoomCore(raw = {}, { index = 0 } = {}) {
  const source = raw && typeof raw === "object" ? raw : {};
  const persons = asPositiveNumber(source.persons ?? source.guests ?? source.capacity);
  const size = asPositiveNumber(source.size ?? source.sizeSqm ?? source.area);
  const images = normalizeHotelRoomImagesCore(source);
  return {
    id: asText(source.id) || createHotelRoomIdCore(Date.now() + index),
    title: asText(source.title ?? source.name),
    description: asText(source.description ?? source.text).slice(0, 400),
    imageUrl: images[0] || "",
    images,
    price: asPositiveNumber(source.price ?? source.pricePerNight),
    currency: asText(source.currency ?? source.currencyCode).toUpperCase() || "EUR",
    persons: persons == null ? null : Math.min(20, Math.round(persons)),
    beds: asText(source.beds ?? source.bedsLabel).slice(0, 60),
    size: size == null ? null : Math.min(500, Math.round(size)),
    tag: asText(source.tag ?? source.badge).slice(0, 40),
    active: source.active !== false
  };
}

export function normalizeHotelRoomsCore(value = []) {
  return (Array.isArray(value) ? value : [])
    .slice(0, MAX_HOTEL_ROOMS)
    .map((room, index) => normalizeHotelRoomCore(room, { index }));
}

// Zimmer aus dem Restaurant-Datensatz: nur benannte Zimmer zaehlen; inaktive
// bleiben fuer den Editor erhalten, die Detailseite filtert selbst.
export function collectHotelRoomsCore(record = {}) {
  const source = record && typeof record === "object" ? record : {};
  return normalizeHotelRoomsCore(source.hotelRooms).filter((room) => room.title);
}

export function buildHotelRoomMetaPartsCore(room = {}) {
  const parts = [];
  if (Number.isFinite(room?.persons) && room.persons > 0) {
    parts.push({ icon: "users", label: `${room.persons} persona` });
  }
  if (asText(room?.beds)) {
    parts.push({ icon: "bed", label: asText(room.beds) });
  }
  if (Number.isFinite(room?.size) && room.size > 0) {
    parts.push({ icon: "size", label: `${room.size} m²` });
  }
  return parts;
}

export function formatHotelRoomPriceLabelCore(room = {}) {
  const price = Number(room?.price);
  if (!Number.isFinite(price) || price <= 0) return "";
  const currency = asText(room?.currency).toUpperCase() || "EUR";
  const priceText = Number.isInteger(price) ? String(price) : price.toFixed(2);
  return currency === "EUR" ? `€${priceText}` : `${priceText} ${currency}`;
}
