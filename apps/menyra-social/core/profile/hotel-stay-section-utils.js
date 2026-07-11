export const HOTEL_STAY_SECTION_UTILS_VERSION = "hotel-stay-section-utils.v1";

export const HOTEL_STAY_SECTION_ROOMS = "rooms";
export const HOTEL_STAY_SECTION_OFFERS = "offers";
const MAX_HOTEL_STAY_IMAGES = 12;

function asText(value = "") {
  if (value == null) return "";
  return String(value).trim();
}

/**
 * Auswahl des Hoteliers, was die Qendrimi-Sektion der Detailseite zeigt:
 * "rooms" (Dhomat, Default) oder "offers" (Oferta).
 */
export function normalizeHotelStaySectionCore(value = "") {
  const key = asText(value).toLowerCase();
  if (key === HOTEL_STAY_SECTION_OFFERS || key === "oferta" || key === "offer") {
    return HOTEL_STAY_SECTION_OFFERS;
  }
  return HOTEL_STAY_SECTION_ROOMS;
}

/**
 * Effektive Sektion mit Fallback: die gewuenschte Quelle muss Eintraege haben,
 * sonst greift die jeweils andere - die Sektion wirkt so nie leer.
 */
export function resolveHotelStaySectionCore({
  preferred = "",
  roomsCount = 0,
  offersCount = 0
} = {}) {
  const wanted = normalizeHotelStaySectionCore(preferred);
  const hasRooms = Number(roomsCount) > 0;
  const hasOffers = Number(offersCount) > 0;
  if (wanted === HOTEL_STAY_SECTION_OFFERS) {
    return hasOffers ? HOTEL_STAY_SECTION_OFFERS : HOTEL_STAY_SECTION_ROOMS;
  }
  return hasRooms || !hasOffers ? HOTEL_STAY_SECTION_ROOMS : HOTEL_STAY_SECTION_OFFERS;
}

/**
 * Galerie-Bilder eines Zimmers/einer Oferta: images[] zuerst, imageUrl als
 * Altbestand-Fallback; dedupliziert und gedeckelt.
 */
export function collectHotelStayImagesCore(item = {}) {
  const source = item && typeof item === "object" ? item : {};
  const list = [
    ...(Array.isArray(source.images) ? source.images : []),
    asText(source.imageUrl || source.image || source.photoUrl)
  ];
  const unique = [];
  list.forEach((entry) => {
    const url = asText(entry);
    if (url && !unique.includes(url)) unique.push(url);
  });
  return unique.slice(0, MAX_HOTEL_STAY_IMAGES);
}
