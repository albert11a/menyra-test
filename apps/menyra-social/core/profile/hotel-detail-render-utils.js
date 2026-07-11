import {
  DESTINATION_PLACE_CATEGORIES
} from "../destinations/destination-template-core.js";
import {
  formatDistanceLabelCore,
  formatTravelLabelCore,
  hasFiniteCoordsCore
} from "../destinations/destination-distance-core.js";
import {
  groupDestinationPlacesByCategoryCore,
  resolveLeadDestinationPlacesCore
} from "../destinations/destination-merge-core.js";
import {
  HOTEL_STAY_SECTION_OFFERS,
  collectHotelStayImagesCore,
  resolveHotelStaySectionCore
} from "./hotel-stay-section-utils.js";

export const HOTEL_DETAIL_RENDER_UTILS_VERSION = "hotel-detail-render-utils.v2";

export const HOTEL_DESTINATION_SECTIONS_CONTAINER_ID = "mnyraHotelDestinationSections";

const HOTEL_DETAIL_STYLE_ID = "mnyraHotelDetailStyles";
const HOTEL_DETAIL_STYLE_HREF = "/apps/menyra-social/styles/hotel-detail.css?v=2026-07-11-hotel-detail-v9";

const TRAVEL_LABELS_SQ = Object.freeze({ walk: "min në këmbë", drive: "min me makinë" });

const SECTION_EYEBROWS_SQ = Object.freeze({
  rooms: "Qëndrimi yt",
  offers: "Oferta për ty",
  city: "Përreth teje",
  beach: "Deti afër",
  sights: "Vlen të shihet",
  activities: "Përjeto zonën",
  nature: "Natyrë e gjallë",
  food: "Shijo lokal",
  nearby: "Afër teje",
  amenities: "Pa pagesë shtesë",
  map: "Zbulo zonën",
  rating: "Nga vizitorët"
});

const SECTION_TITLES_SQ = Object.freeze({
  city: "Qyteti",
  beach: "Plazha",
  sights: "Vende për të parë",
  activities: "Aktivitete",
  nature: "Natyra",
  food: "Restorante & Kafene",
  nearby: "Vende të rëndësishme"
});

const ICON_PATHS = Object.freeze({
  bed: `<path d="M2 20v-8a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v8M4 10V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v4M12 4v6M2 18h20"/>`,
  building: `<path d="M10 12h4M10 8h4M14 21v-3a2 2 0 0 0-4 0v3M6 10H4a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-2M6 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16"/>`,
  waves: `<path d="M2 5q2.5 2 5 0t5 0 5 0 5 0M2 12q2.5 2 5 0t5 0 5 0 5 0M2 19q2.5 2 5 0t5 0 5 0 5 0"/>`,
  compass: `<circle cx="12" cy="12" r="10"/><path d="m16.24 7.76-2.12 6.36-6.36 2.12 2.12-6.36z"/>`,
  sparkles: `<path d="m12 3-1.2 3.1L8 7.5l2.8 1.4L12 12l1.2-3.1L16 7.5l-2.8-1.4zM5 14l-.8 2.2L2 17l2.2.8L5 20l.8-2.2L8 17l-2.2-.8zM18 13l-1 2.7-3 1.3 3 1.3 1 2.7 1-2.7 3-1.3-3-1.3z"/>`,
  tree: `<path d="m17 14 3 3h-5l3 3H6l3-3H4l3-3H3l5-5H5l7-7 7 7h-3l5 5zM12 20v2"/>`,
  coffee: `<path d="M10 2v2M14 2v2M6 2v2M18 8h1a3 3 0 0 1 0 6h-1M4 8h14v9a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3z"/>`,
  pin: `<path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0"/><circle cx="12" cy="10" r="3"/>`,
  nav: `<path d="m3 11 19-9-9 19-2-8z"/>`,
  clock: `<circle cx="12" cy="12" r="10"/><path d="M12 6v6h4"/>`,
  star: `<path d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z"/>`,
  expand: `<path d="M8 3H3v5M16 3h5v5M8 21H3v-5M16 21h5v-5M3 3l6 6M21 3l-6 6M3 21l6-6M21 21l-6-6"/>`,
  arrowRight: `<path d="M5 12h14M13 6l6 6-6 6"/>`,
  check: `<path d="m20 6-11 11-5-5"/>`,
  wifi: `<path d="M5 12.55a11 11 0 0 1 14 0M1.42 9a16 16 0 0 1 21.16 0M8.53 16.11a6 6 0 0 1 6.95 0M12 20h.01"/>`,
  car: `<path d="m5 17-2-1v-4l2-5h14l2 5v4l-2 1M5 17v2M19 17v2M3 13h18M7 13h.01M17 13h.01"/>`,
  snow: `<path d="M12 2v20M4.93 4.93l14.14 14.14M2 12h20M4.93 19.07 19.07 4.93M8 5l4 2 4-2M8 19l4-2 4 2"/>`,
  shield: `<path d="M20 13c0 5-3.5 7.5-8 9-4.5-1.5-8-4-8-9V5l8-3 8 3z"/><path d="m9 12 2 2 4-4"/>`,
  umbrella: `<path d="M2 12h20M12 12v8a2 2 0 0 0 4 0M2 12a10 10 0 0 1 20 0M12 2v1"/>`,
  users: `<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M16 3.2a4 4 0 0 1 0 7.6M22 21v-2a4 4 0 0 0-3-3.9"/><circle cx="9" cy="7" r="4"/>`,
  size: `<path d="M15 3h6v6M21 3l-7 7M3 21l7-7M9 21H3v-6"/>`
});

const CATEGORY_ICONS = Object.freeze({
  city: "building",
  beach: "waves",
  sights: "compass",
  activities: "sparkles",
  nature: "tree",
  food: "coffee",
  nearby: "pin"
});

const AMENITY_ICON_KEYWORDS = Object.freeze([
  { keywords: ["wifi", "wi-fi", "internet"], icon: "wifi" },
  { keywords: ["parkim", "parking", "garazh"], icon: "car" },
  { keywords: ["mengjes", "mëngjes", "breakfast", "fruehstueck"], icon: "coffee" },
  { keywords: ["klime", "klimë", "kondicioner", "ac"], icon: "snow" },
  { keywords: ["plazh", "det", "beach", "pishine", "pishinë", "pool"], icon: "waves" },
  { keywords: ["shezlong", "ombrelle", "umbrella"], icon: "umbrella" },
  { keywords: ["recepsion", "reception", "siguri", "security", "24"], icon: "shield" },
  { keywords: ["pastrim", "cleaning", "spa"], icon: "sparkles" },
  { keywords: ["famil", "person"], icon: "users" }
]);

function asText(value = "") {
  if (value == null) return "";
  return String(value).trim();
}

function escapeHtml(value = "") {
  return asText(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function mhdIcon(name = "pin", extraClass = "") {
  const path = ICON_PATHS[name] || ICON_PATHS.pin;
  return `<svg class="mhd-icon ${extraClass}" viewBox="0 0 24 24" aria-hidden="true">${path}</svg>`;
}

export function ensureHotelDetailStylesInjectedCore(documentObj = typeof document === "undefined" ? null : document) {
  if (!documentObj || documentObj.getElementById(HOTEL_DETAIL_STYLE_ID)) return;
  const link = documentObj.createElement("link");
  link.id = HOTEL_DETAIL_STYLE_ID;
  link.rel = "stylesheet";
  link.href = HOTEL_DETAIL_STYLE_HREF;
  documentObj.head.appendChild(link);
}

function renderSectionTitle({ iconName = "pin", eyebrow = "", title = "" } = {}) {
  return `
    <div class="mhd-section-title">
      <span class="mhd-section-icon">${mhdIcon(iconName)}</span>
      <div>
        ${eyebrow ? `<small>${escapeHtml(eyebrow)}</small>` : ""}
        <h2>${escapeHtml(title)}</h2>
      </div>
    </div>
  `;
}

// "300 m" / "1.2 km" (Lead-Eingabe) -> Meter, fuer die Geh-/Fahrzeit-Schaetzung.
export function parseManualDistanceLabelToMetersCore(label = "") {
  const raw = asText(label);
  if (!raw) return null;
  const match = raw.match(/(\d+(?:[.,]\d+)?)\s*(km|kilometer|m|meter)?/i);
  if (!match) return null;
  const amount = Number(String(match[1] || "").replace(",", "."));
  if (!Number.isFinite(amount) || amount < 0) return null;
  const unit = String(match[2] || "m").trim().toLowerCase();
  return Math.round(unit.startsWith("k") ? amount * 1000 : amount);
}

function renderPlaceDistance(place = {}) {
  // Manuell gepflegte Distanz (z. B. Deti/Plazha aus dem Lead-Editor) hat
  // Vorrang vor der automatisch berechneten Entfernung. Eine manuell
  // gepflegte Gehzeit hat Vorrang vor der Schaetzung und erscheint auch
  // bei "Në plazh" mit Uhr-Icon.
  const manual = place.manualDistance && typeof place.manualDistance === "object" ? place.manualDistance : null;
  if (manual) {
    const manualLabel = asText(manual.label);
    const manualTimeLabel = asText(manual.timeLabel);
    const distanceText = manualLabel || formatDistanceLabelCore(place.distanceMeters);
    const manualMeters = parseManualDistanceLabelToMetersCore(manualLabel);
    const fallbackMeters = Number.isFinite(manualMeters) ? manualMeters : place.distanceMeters;
    const travelLabel = manualTimeLabel
      || (manual.direct !== true && Number.isFinite(fallbackMeters)
        ? formatTravelLabelCore(fallbackMeters, TRAVEL_LABELS_SQ)
        : "");
    if (!distanceText && !travelLabel) return "";
    return `
      <div class="mhd-distance">
        ${distanceText ? `<span>${mhdIcon("nav", "mhd-icon--sm")}${escapeHtml(distanceText)}</span>` : ""}
        ${travelLabel ? `<span>${mhdIcon("clock", "mhd-icon--sm")}${escapeHtml(travelLabel)}</span>` : ""}
      </div>
    `;
  }
  const distanceLabel = formatDistanceLabelCore(place.distanceMeters);
  if (!distanceLabel) return "";
  const travelLabel = formatTravelLabelCore(place.distanceMeters, TRAVEL_LABELS_SQ);
  return `
    <div class="mhd-distance">
      <span>${mhdIcon("nav", "mhd-icon--sm")}${escapeHtml(distanceLabel)}</span>
      ${travelLabel ? `<span>${mhdIcon("clock", "mhd-icon--sm")}${escapeHtml(travelLabel)}</span>` : ""}
    </div>
  `;
}

function renderPlaceCard(place = {}, { nearestPlaceId = "", imageUrlFn = null } = {}) {
  const categoryLabel = DESTINATION_PLACE_CATEGORIES.find((category) => category.key === place.category)?.label || "";
  const pill = place.id && place.id === nearestPlaceId ? "Më afër hotelit" : categoryLabel;
  const rawImage = asText(place.coverImageUrl);
  const imageUrl = rawImage && typeof imageUrlFn === "function" ? asText(imageUrlFn(rawImage)) || rawImage : rawImage;
  return `
    <article class="mhd-card">
      <div class="mhd-photo">
        ${imageUrl ? `<img src="${escapeHtml(imageUrl)}" alt="${escapeHtml(place.name)}" loading="lazy" decoding="async" />` : ""}
        ${pill ? `<span class="mhd-pill mhd-pill--overlay ${place.id === nearestPlaceId ? "mhd-pill--accent" : ""}">${escapeHtml(pill)}</span>` : ""}
      </div>
      <div class="mhd-card-body">
        <h3>${escapeHtml(place.name)}</h3>
        ${renderPlaceDistance(place)}
        ${place.description ? `<p class="mhd-copy">${escapeHtml(place.description)}</p>` : ""}
      </div>
    </article>
  `;
}

/**
 * Rendert die Destination-Sektionen (Qyteti, Plazha, ...) aus dem
 * veroeffentlichten Template + Hotel-Overrides, sortiert nach
 * fixiert -> Prioritaet -> Naehe zum Hotel-Pin.
 */
export function renderHotelDestinationSectionsCore({
  template = null,
  overrides = {},
  hotelCoords = null,
  imageUrlFn = null,
  manualBeachDistance = null
} = {}) {
  if (!template || !Array.isArray(template.places) || !template.places.length) return "";
  const resolved = resolveLeadDestinationPlacesCore({
    places: template.places,
    overrides,
    hotelCoords: hasFiniteCoordsCore(hotelCoords) ? hotelCoords : null
  });
  if (!resolved.length) return "";
  const nearestPlace = resolved
    .filter((place) => Number.isFinite(place.distanceMeters))
    .sort((a, b) => a.distanceMeters - b.distanceMeters)[0] || null;
  const groups = groupDestinationPlacesByCategoryCore(resolved);
  // Deti/Plazha: die im Lead gepflegte Stranddistanz ("300 m", "Në plazh")
  // ersetzt beim ersten Plazha-Ort die automatisch berechneten Meter.
  const manualBeach = manualBeachDistance && typeof manualBeachDistance === "object" ? manualBeachDistance : null;
  const manualBeachLabel = manualBeach
    ? (manualBeach.direct === true ? "Në plazh" : asText(manualBeach.label))
    : "";
  const manualBeachTimeLabel = manualBeach ? asText(manualBeach.timeLabel) : "";
  if (manualBeachLabel || manualBeachTimeLabel) {
    const beachGroup = groups.find((group) => group.key === "beach");
    if (beachGroup?.places?.length) {
      beachGroup.places[0] = {
        ...beachGroup.places[0],
        manualDistance: {
          label: manualBeachLabel,
          direct: manualBeach.direct === true,
          timeLabel: manualBeachTimeLabel
        }
      };
    }
  }
  return groups.map((group) => `
    <section class="mhd-section">
      ${renderSectionTitle({
        iconName: CATEGORY_ICONS[group.key] || "pin",
        eyebrow: SECTION_EYEBROWS_SQ[group.key] || "",
        title: SECTION_TITLES_SQ[group.key] || group.label
      })}
      <div class="mhd-rail">
        ${group.places.map((place) => renderPlaceCard(place, {
          nearestPlaceId: nearestPlace?.id || "",
          imageUrlFn
        })).join("")}
      </div>
    </section>
  `).join("");
}

export function renderHotelDestinationSkeletonCore() {
  return `
    <section class="mhd-section">
      <div class="mhd-skeleton" aria-hidden="true"><span></span><span></span><span></span></div>
    </section>
  `;
}

// Ganzseitiges Skeleton fuer die Details-Ansicht, solange der Hotel-Datensatz
// (Zimmer, Destination, Ausstattung) noch nicht geladen ist - verhindert,
// dass erst nur die Karte erscheint und die restlichen Sektionen nachspringen.
export function renderHotelDetailPendingViewCore() {
  return `
    <div class="mhd">
      ${renderHotelDestinationSkeletonCore()}
      ${renderHotelDestinationSkeletonCore()}
      ${renderHotelDestinationSkeletonCore()}
    </div>
  `;
}

function normalizeRoomPriceLabel(item = {}, fallbackCurrency = "€") {
  const label = asText(item.priceLabel || item.priceText);
  if (label) return label;
  const price = Number(item.price ?? item.startingPrice ?? item.pricePerNight);
  if (!Number.isFinite(price) || price <= 0) return "";
  const currency = asText(item.currency || item.currencyCode) || fallbackCurrency;
  return currency === "€" || currency.toUpperCase() === "EUR" ? `€${price}` : `${price} ${currency}`;
}

function renderRoomMetaRow(metaParts = []) {
  const parts = (Array.isArray(metaParts) ? metaParts : [])
    .filter((part) => asText(part?.label));
  if (!parts.length) return "";
  return `
    <div class="mhd-distance">
      ${parts.map((part) => `<span>${mhdIcon(part.icon || "check", "mhd-icon--sm")}${escapeHtml(part.label)}</span>`).join("")}
    </div>
  `;
}

function filterActiveStayItems(list = []) {
  return (Array.isArray(list) ? list : [])
    .filter((item) => item && item.active !== false && asText(item.title));
}

export function renderHotelRoomsSectionCore({
  rooms = [],
  offers = [],
  staySection = "",
  imageUrlFn = null
} = {}) {
  const activeRooms = filterActiveStayItems(rooms);
  const activeOffers = filterActiveStayItems(offers);
  // Der Hotelier waehlt im Editor, ob die Sektion Dhomat oder Oferta zeigt;
  // ohne Auswahl bleibt das alte Verhalten (Zimmer, Angebote als Fallback).
  const effectiveSection = resolveHotelStaySectionCore({
    preferred: staySection,
    roomsCount: activeRooms.length,
    offersCount: activeOffers.length
  });
  const showOffers = effectiveSection === HOTEL_STAY_SECTION_OFFERS;
  const items = showOffers ? activeOffers : (activeRooms.length ? activeRooms : activeOffers);
  const stayKind = showOffers || !activeRooms.length ? "offer" : "room";
  if (!items.length) return "";
  return `
    <section class="mhd-section">
      ${renderSectionTitle({
        iconName: showOffers ? "sparkles" : "bed",
        eyebrow: showOffers ? SECTION_EYEBROWS_SQ.offers : SECTION_EYEBROWS_SQ.rooms,
        title: showOffers ? "Oferta" : "Dhoma"
      })}
      <div class="mhd-rail">
        ${items.map((item) => {
          const images = collectHotelStayImagesCore(item);
          const rawImage = images[0] || "";
          const imageUrl = rawImage && typeof imageUrlFn === "function" ? asText(imageUrlFn(rawImage)) || rawImage : rawImage;
          const priceLabel = normalizeRoomPriceLabel(item);
          const priceSuffix = asText(item.priceSuffix) || "/ natë";
          return `
            <article class="mhd-card">
              <div class="mhd-photo">
                ${imageUrl ? `<img src="${escapeHtml(imageUrl)}" alt="${escapeHtml(item.title)}" loading="lazy" decoding="async" />` : ""}
                ${asText(item.tag || item.badge) ? `<span class="mhd-pill mhd-pill--overlay mhd-pill--accent">${escapeHtml(item.tag || item.badge)}</span>` : ""}
                ${images.length > 1 ? `<span class="mhd-photo-count">${images.length} foto</span>` : ""}
              </div>
              <div class="mhd-card-body">
                <div class="mhd-heading-price">
                  <h3>${escapeHtml(item.title)}</h3>
                  ${priceLabel ? `<span class="mhd-price"><strong>${escapeHtml(priceLabel)}</strong><small>${escapeHtml(priceSuffix)}</small></span>` : ""}
                </div>
                ${renderRoomMetaRow(item.metaParts)}
                ${asText(item.text || item.description) ? `<p class="mhd-copy">${escapeHtml(item.text || item.description)}</p>` : ""}
                <button type="button" class="mhd-more" data-hotel-stay-more="${escapeHtml(asText(item.id))}" data-hotel-stay-kind="${stayKind}">
                  Më shumë
                  ${mhdIcon("arrowRight", "mhd-icon--sm")}
                </button>
              </div>
            </article>
          `;
        }).join("")}
      </div>
    </section>
  `;
}

// Qyteti-Fallback ohne Destination-Template: eine Karte aus der Hotel-Location
// (Stadt + Adresse), damit die Sektion nie leer wirkt.
export function renderHotelCityFallbackSectionCore({
  city = "",
  address = "",
  imageUrl = "",
  imageUrlFn = null
} = {}) {
  const safeCity = asText(city);
  if (!safeCity) return "";
  const rawImage = asText(imageUrl);
  const resolvedImage = rawImage && typeof imageUrlFn === "function" ? asText(imageUrlFn(rawImage)) || rawImage : rawImage;
  return `
    <section class="mhd-section">
      ${renderSectionTitle({ iconName: "building", eyebrow: SECTION_EYEBROWS_SQ.city, title: SECTION_TITLES_SQ.city })}
      <div class="mhd-rail">
        <article class="mhd-card">
          <div class="mhd-photo">
            ${resolvedImage ? `<img src="${escapeHtml(resolvedImage)}" alt="${escapeHtml(safeCity)}" loading="lazy" decoding="async" />` : ""}
            <span class="mhd-pill mhd-pill--overlay">${escapeHtml(SECTION_TITLES_SQ.city)}</span>
          </div>
          <div class="mhd-card-body">
            <h3>${escapeHtml(safeCity)}</h3>
            ${asText(address) ? `<p class="mhd-copy">${escapeHtml(address)}</p>` : ""}
          </div>
        </article>
      </div>
    </section>
  `;
}

function resolveAmenityIcon(label = "") {
  const key = asText(label).toLowerCase();
  for (const entry of AMENITY_ICON_KEYWORDS) {
    if (entry.keywords.some((keyword) => key.includes(keyword))) return entry.icon;
  }
  return "check";
}

export function renderHotelAmenitiesSectionCore({ amenities = [] } = {}) {
  const items = (Array.isArray(amenities) ? amenities : []).map((item) => asText(item)).filter(Boolean);
  if (!items.length) return "";
  return `
    <section class="mhd-section">
      ${renderSectionTitle({ iconName: "check", eyebrow: SECTION_EYEBROWS_SQ.amenities, title: "Përfshihet" })}
      <div class="mhd-amenities">
        ${items.slice(0, 12).map((item) => `
          <article class="mhd-amenity">
            <span class="mhd-amenity-icon">${mhdIcon(resolveAmenityIcon(item))}</span>
            <h3>${escapeHtml(item)}</h3>
          </article>
        `).join("")}
      </div>
    </section>
  `;
}

export const HOTEL_DETAIL_MAP_CONTAINER_ID = "mnyraHotelDetailMap";

export function renderHotelMapSectionCore({
  address = "",
  city = "",
  destinationName = "",
  mapsUrl = "",
  hotelCoords = null,
  hotelName = ""
} = {}) {
  const addressLine = [asText(address), asText(city)].filter(Boolean).join(", ")
    || asText(destinationName);
  if (!addressLine && !mapsUrl) return "";
  const hasLiveMap = hasFiniteCoordsCore(hotelCoords);
  const coordAttrs = hasLiveMap
    ? `id="${HOTEL_DETAIL_MAP_CONTAINER_ID}" data-map-lat="${escapeHtml(String(hotelCoords.lat))}" data-map-lng="${escapeHtml(String(hotelCoords.lng))}" data-map-name="${escapeHtml(asText(hotelName))}"`
    : "";
  return `
    <section class="mhd-section">
      ${renderSectionTitle({ iconName: "compass", eyebrow: SECTION_EYEBROWS_SQ.map, title: "Harta e zbulimit" })}
      <div class="mhd-map-card">
        <div class="mhd-map-art ${hasLiveMap ? "mhd-map-art--live" : ""}" ${coordAttrs}>
          <div class="mhd-map-water"></div>
          <span class="mhd-map-pin">${mhdIcon("bed")}</span>
        </div>
        <div class="mhd-map-info">
          <div class="mhd-address">
            <span>${mhdIcon("pin")}</span>
            <div>
              <small>Lokacioni</small>
              <strong>${escapeHtml(addressLine || "Hotel")}</strong>
              ${asText(destinationName) ? `<p>Plazhi, qyteti dhe vendet kryesore rreth ${escapeHtml(destinationName)}.</p>` : ""}
            </div>
          </div>
          ${mapsUrl ? `<a class="mhd-primary" href="${escapeHtml(mapsUrl)}" target="_blank" rel="noopener noreferrer">${mhdIcon("expand", "mhd-icon--sm")}Hap hartën</a>` : ""}
        </div>
      </div>
    </section>
  `;
}

export function renderHotelRatingSectionCore({
  rating = "",
  reviewCount = "",
  summary = ""
} = {}) {
  const ratingValue = Number(asText(rating).replace(",", "."));
  if (!Number.isFinite(ratingValue) || ratingValue <= 0) return "";
  const starCount = Math.max(1, Math.min(5, Math.round(ratingValue)));
  const stars = Array.from({ length: starCount })
    .map(() => `<svg class="mhd-icon mhd-star" viewBox="0 0 24 24" aria-hidden="true">${ICON_PATHS.star}</svg>`)
    .join("");
  const countText = asText(reviewCount);
  return `
    <section class="mhd-section">
      ${renderSectionTitle({ iconName: "star", eyebrow: SECTION_EYEBROWS_SQ.rating, title: "Vlerësimet" })}
      <div class="mhd-rating">
        <div class="mhd-score">
          <strong>${escapeHtml(ratingValue.toFixed(1))}</strong>
          <div>
            <div class="mhd-stars">${stars}</div>
            <p>${escapeHtml([summary, countText ? `${countText} vlerësime` : ""].filter(Boolean).join(" · ") || "Nga vizitorët")}</p>
          </div>
        </div>
      </div>
    </section>
  `;
}

/**
 * Gesamtansicht: synchron renderbare Sektionen + Platzhalter-Container fuer
 * die Destination-Sektionen (werden nach dem Laden des Templates per DOM
 * eingesetzt; bei Cache-Treffer koennen sie direkt mitgegeben werden).
 */
export function renderHotelDetailViewCore({
  rooms = [],
  offers = [],
  staySection = "",
  amenities = [],
  address = "",
  city = "",
  cityImageUrl = "",
  destinationId = "",
  destinationName = "",
  destinationSectionsHtml = "",
  mapsUrl = "",
  hotelCoords = null,
  hotelName = "",
  rating = "",
  reviewCount = "",
  ratingSummary = "",
  imageUrlFn = null
} = {}) {
  const hasDestination = !!asText(destinationId);
  const destinationContent = destinationSectionsHtml
    || (hasDestination ? renderHotelDestinationSkeletonCore() : "");
  return `
    <div class="mhd">
      ${renderHotelRoomsSectionCore({ rooms, offers, staySection, imageUrlFn })}
      ${renderHotelAmenitiesSectionCore({ amenities })}
      <div id="${HOTEL_DESTINATION_SECTIONS_CONTAINER_ID}" data-destination-id="${escapeHtml(destinationId)}" style="display:contents">
        ${destinationContent}
      </div>
      ${hasDestination ? "" : renderHotelCityFallbackSectionCore({ city, address, imageUrl: cityImageUrl, imageUrlFn })}
      ${renderHotelMapSectionCore({ address, city, destinationName, mapsUrl, hotelCoords, hotelName })}
      ${renderHotelRatingSectionCore({ rating, reviewCount, summary: ratingSummary })}
    </div>
  `;
}
