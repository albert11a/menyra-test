export const DESTINATION_TEMPLATE_CORE_VERSION = "destination-template-core.v1";

export const DESTINATION_PLACE_CATEGORIES = Object.freeze([
  Object.freeze({ key: "city", label: "Qyteti", labelDe: "Stadt" }),
  Object.freeze({ key: "beach", label: "Plazha", labelDe: "Straende" }),
  Object.freeze({ key: "sights", label: "Vende per te pare", labelDe: "Sehenswuerdigkeiten" }),
  Object.freeze({ key: "activities", label: "Aktivitete", labelDe: "Aktivitaeten" }),
  Object.freeze({ key: "nature", label: "Natyre", labelDe: "Natur" }),
  Object.freeze({ key: "food", label: "Restorante & Kafene", labelDe: "Restaurants & Cafes" }),
  Object.freeze({ key: "nearby", label: "Vende te rendesishme", labelDe: "Wichtige Orte" })
]);

export const DESTINATION_PLACE_CATEGORY_KEYS = Object.freeze(
  DESTINATION_PLACE_CATEGORIES.map((category) => category.key)
);

export const DESTINATION_PLACE_SEASONS = Object.freeze([
  Object.freeze({ key: "all", labelDe: "Ganzjaehrig" }),
  Object.freeze({ key: "summer", labelDe: "Saisonal Sommer" }),
  Object.freeze({ key: "winter", labelDe: "Saisonal Winter" })
]);

const DESTINATION_SEASON_KEYS = Object.freeze(DESTINATION_PLACE_SEASONS.map((season) => season.key));
const MAX_DESTINATION_PLACES = 120;
const MAX_GALLERY_IMAGES = 12;

function asText(value = "") {
  if (value == null) return "";
  return String(value).trim();
}

function asFiniteNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export function normalizeDestinationCategoryKeyCore(value = "") {
  const key = asText(value).toLowerCase();
  if (DESTINATION_PLACE_CATEGORY_KEYS.includes(key)) return key;
  const aliases = {
    qyteti: "city",
    stadt: "city",
    plazha: "beach",
    plazhi: "beach",
    strand: "beach",
    straende: "beach",
    sehenswuerdigkeiten: "sights",
    sehenswurdigkeiten: "sights",
    aktivitete: "activities",
    aktivitaeten: "activities",
    natyre: "nature",
    natur: "nature",
    restorante: "food",
    restaurants: "food",
    cafes: "food",
    kafene: "food",
    umgebung: "nearby",
    rrethina: "nearby"
  };
  return aliases[key] || "nearby";
}

export function normalizeDestinationSeasonKeyCore(value = "") {
  const key = asText(value).toLowerCase();
  return DESTINATION_SEASON_KEYS.includes(key) ? key : "all";
}

export function buildDestinationSlugCore(value = "") {
  let slug = asText(value).toLowerCase();
  if (!slug) return "";
  try {
    slug = slug.normalize("NFKD").replace(/[\u0300-\u036f]/g, "");
  } catch {}
  return slug
    .replace(/ë/g, "e")
    .replace(/ç/g, "c")
    .replace(/&/g, " and ")
    .replace(/['"`]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);
}

export function createDestinationPlaceIdCore(nowMs = Date.now(), randomValue = Math.random()) {
  const timePart = Math.max(0, Number(nowMs) || 0).toString(36);
  const randomPart = Math.floor(Math.max(0, Math.min(0.999999, Number(randomValue) || 0)) * 36 ** 6)
    .toString(36)
    .padStart(6, "0");
  return `place_${timePart}_${randomPart}`;
}

export function normalizeDestinationGalleryCore(value) {
  if (!Array.isArray(value)) return [];
  return value
    .map((entry) => asText(entry))
    .filter(Boolean)
    .slice(0, MAX_GALLERY_IMAGES);
}

export function normalizeDestinationPlaceCore(raw = {}, { index = 0 } = {}) {
  const source = raw && typeof raw === "object" ? raw : {};
  const lat = asFiniteNumber(source.lat ?? source.latitude ?? source.coords?.lat);
  const lng = asFiniteNumber(source.lng ?? source.lon ?? source.longitude ?? source.coords?.lng);
  const priorityRaw = asFiniteNumber(source.priority);
  return {
    id: asText(source.id) || createDestinationPlaceIdCore(Date.now() + index),
    name: asText(source.name),
    category: normalizeDestinationCategoryKeyCore(source.category),
    description: asText(source.description ?? source.text).slice(0, 600),
    address: asText(source.address ?? source.plusCode).slice(0, 240),
    lat,
    lng,
    coverImageUrl: asText(source.coverImageUrl ?? source.imageUrl ?? source.coverUrl),
    gallery: normalizeDestinationGalleryCore(source.gallery),
    priority: priorityRaw == null ? 0 : Math.max(0, Math.min(100, Math.round(priorityRaw))),
    pinned: source.pinned === true,
    season: normalizeDestinationSeasonKeyCore(source.season ?? source.seasonal),
    active: source.active !== false
  };
}

export function normalizeDestinationPayloadCore(raw = {}) {
  const source = raw && typeof raw === "object" ? raw : {};
  const places = (Array.isArray(source.places) ? source.places : [])
    .slice(0, MAX_DESTINATION_PLACES)
    .map((place, index) => normalizeDestinationPlaceCore(place, { index }));
  return {
    name: asText(source.name),
    description: asText(source.description).slice(0, 600),
    places
  };
}

export function normalizeDestinationDocCore(id = "", raw = {}) {
  const source = raw && typeof raw === "object" ? raw : {};
  const name = asText(source.name) || asText(source.draft?.name) || asText(source.published?.name);
  const draft = normalizeDestinationPayloadCore(source.draft || { name, places: source.places });
  if (!draft.name) draft.name = name;
  const hasPublished = source.published && typeof source.published === "object";
  const published = hasPublished ? normalizeDestinationPayloadCore(source.published) : null;
  if (published && !published.name) published.name = name;
  return {
    id: asText(id),
    name: name || draft.name,
    slug: asText(source.slug) || buildDestinationSlugCore(name || draft.name),
    draft,
    published,
    hasPublished: !!published,
    publishedVersion: Math.max(0, Number(source.publishedVersion) || 0),
    draftUpdatedAt: source.draftUpdatedAt || source.updatedAt || null,
    publishedAt: source.publishedAt || null,
    createdAt: source.createdAt || null,
    updatedAt: source.updatedAt || null,
    createdByUid: asText(source.createdByUid),
    createdByName: asText(source.createdByName)
  };
}

export function destinationDraftDiffersFromPublishedCore(destination = {}) {
  if (!destination?.hasPublished) return true;
  const stripIds = (payload) => JSON.stringify({
    name: payload?.name || "",
    description: payload?.description || "",
    places: (payload?.places || []).map((place) => ({ ...place }))
  });
  return stripIds(destination.draft) !== stripIds(destination.published);
}

export function buildDestinationPublicProjectionCore(destination = {}, {
  version = 0,
  publishedAtIso = ""
} = {}) {
  const payload = normalizeDestinationPayloadCore(destination.draft || {});
  return {
    destinationId: asText(destination.id),
    name: payload.name || asText(destination.name),
    slug: asText(destination.slug) || buildDestinationSlugCore(payload.name || destination.name),
    description: payload.description,
    places: payload.places.filter((place) => place.active && place.name),
    version: Math.max(1, Number(version) || 1),
    publishedAt: asText(publishedAtIso) || new Date().toISOString()
  };
}
