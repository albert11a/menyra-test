import {
  buildPublicAdsProjection,
  buildPublicOffersProjection
} from "../public-profile/public-projection-builders.js";

function toFiniteNumber(value) {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value === "string") {
    const cleaned = value.trim().replace(",", ".");
    if (!cleaned) return null;
    const parsed = Number(cleaned);
    return Number.isFinite(parsed) ? parsed : null;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function toMillisLoose(value) {
  if (!value && value !== 0) return 0;
  if (value instanceof Date) {
    const millis = value.getTime();
    return Number.isFinite(millis) ? millis : 0;
  }
  if (typeof value?.toMillis === "function") {
    const millis = Number(value.toMillis());
    return Number.isFinite(millis) ? millis : 0;
  }
  if (typeof value?.seconds === "number") {
    const seconds = Number(value.seconds);
    const nanos = Number(value.nanoseconds || 0);
    if (Number.isFinite(seconds) && Number.isFinite(nanos)) {
      return (seconds * 1000) + Math.floor(nanos / 1000000);
    }
  }
  const numeric = Number(value);
  if (Number.isFinite(numeric) && numeric > 1000000000000) return numeric;
  const parsed = Date.parse(String(value));
  return Number.isFinite(parsed) ? parsed : 0;
}

function normalizeCoordPairLoose(latValue, lngValue) {
  const lat = toFiniteNumber(latValue);
  const lng = toFiniteNumber(lngValue);
  if (lat === null || lng === null) return null;
  if (Math.abs(lat) < 0.000001 && Math.abs(lng) < 0.000001) return null;
  if (Math.abs(lat) <= 90 && Math.abs(lng) <= 180) return { lat, lng };
  if (Math.abs(lat) <= 180 && Math.abs(lng) <= 90) return { lat: lng, lng: lat };
  return null;
}

function readCoordsFromRecord(record = {}) {
  if (!record || typeof record !== "object") return null;
  return normalizeCoordPairLoose(record.lat, record.lng)
    || normalizeCoordPairLoose(record.latitude, record.longitude)
    || normalizeCoordPairLoose(record.gpsLat, record.gpsLng)
    || normalizeCoordPairLoose(record.geo?.lat, record.geo?.lng)
    || normalizeCoordPairLoose(record.geo?.latitude, record.geo?.longitude)
    || normalizeCoordPairLoose(record.coords?.lat, record.coords?.lng)
    || normalizeCoordPairLoose(record.coords?.latitude, record.coords?.longitude)
    || normalizeCoordPairLoose(record.location?.lat, record.location?.lng);
}

function isGenericBusinessLabel(value = "") {
  return String(value || "").trim().toLowerCase() === "business";
}

export function isBootstrapRestaurantPreviewRecordCore(record = {}) {
  if (!record || typeof record !== "object") return false;
  if (record.__truthPartial === true || record.__isPreview === true) return true;
  const source = String(
    record.__truthSource
    || record.truthSource
    || record.source
    || ""
  ).trim().toLowerCase();
  return source === "bootstrap-preview" || source === "preview";
}

function pickFirstMillis(candidates = []) {
  for (const candidate of candidates) {
    const millis = toMillisLoose(candidate);
    if (millis > 0) return millis;
  }
  return 0;
}

function pickHighestVersion(candidates = []) {
  let highest = 0;
  candidates.forEach((candidate) => {
    const parsed = toFiniteNumber(candidate);
    if (parsed !== null && parsed > highest) highest = parsed;
  });
  return highest;
}

export function readRestaurantTruthMetaCore(record = {}) {
  const row = record && typeof record === "object" ? record : {};
  const version = pickHighestVersion([
    row.version,
    row.revision,
    row.rev,
    row.identityVersion,
    row.profileVersion,
    row.metaVersion,
    row.geoVersion
  ]);
  const updatedAtMs = pickFirstMillis([
    row.updatedAt,
    row.updated_at,
    row.modifiedAt,
    row.modified_at,
    row.lastUpdatedAt,
    row.lastUpdateAt,
    row.geoUpdatedAt,
    row.coordsUpdatedAt,
    row.locationUpdatedAt,
    row.metaUpdatedAt,
    row.publicMetaUpdatedAt,
    row.geo?.updatedAt,
    row.coords?.updatedAt
  ]);
  const deletedAtMs = pickFirstMillis([
    row.deletedAt,
    row.removedAt
  ]);
  const sourceRank = isBootstrapRestaurantPreviewRecordCore(row) ? 1 : 3;
  return {
    version,
    updatedAtMs,
    deletedAtMs,
    sourceRank
  };
}

function hasMeaningfulValue(value) {
  if (value === null || value === undefined) return false;
  if (typeof value === "string") return value.trim().length > 0;
  if (typeof value === "number") return Number.isFinite(value);
  if (typeof value === "boolean") return true;
  if (value instanceof Date) return Number.isFinite(value.getTime());
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === "object") {
    if (typeof value.toMillis === "function") return true;
    return Object.keys(value).length > 0;
  }
  return true;
}

function normalizeLooseTypeKey(value = "") {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[ëèéê]/g, "e")
    .replace(/[çćč]/g, "c")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function collectOfferTextList(value) {
  if (Array.isArray(value)) {
    return value.map((item) => String(item || "").trim()).filter(Boolean);
  }
  const raw = String(value || "").trim();
  if (!raw) return [];
  return raw.split(/[\n,;|]/).map((item) => item.trim()).filter(Boolean);
}

function normalizeOfferPriceUnit(value = "") {
  const key = normalizeLooseTypeKey(value);
  if (key === "total" || key === "totali" || key === "gesamt") return "total";
  return "per_person";
}

function collectTravelOfferFeatures(item = {}) {
  return [
    ...collectOfferTextList(item.features),
    ...collectOfferTextList(item.offerFeatures),
    ...collectOfferTextList(item.hotelFeatures),
    String(item.hotelFeatureOneText || "").trim(),
    String(item.hotelFeatureTwoText || "").trim(),
    String(item.hotelFeatureThreeText || "").trim()
  ].filter(Boolean).filter((entry, index, list) => list.indexOf(entry) === index);
}

function collectPublicTravelOffers(data = {}) {
  return buildPublicOffersProjection(data).items;
}

function normalizePublicAdStatus(value = "") {
  const key = normalizeLooseTypeKey(value);
  if (key === "approved" || key === "accepted" || key === "active") return "approved";
  if (key === "rejected" || key === "declined" || key === "denied") return "rejected";
  return "pending";
}

function collectPublicAds(data = {}) {
  return buildPublicAdsProjection(data).items;
}

function hasTravelBusinessShape(record = {}, normalizeRestaurantTypeFn = (value) => value) {
  const normalizedType = normalizeLooseTypeKey(normalizeRestaurantTypeFn(
    record?.type
    || record?.customerType
    || record?.category
    || record?.kind
    || record?.restaurantType
    || record?.businessProfileType
    || record?.profileType
    || record?.vertical
    || record?.leadType
    || ""
  ));
  if (["hotel", "hotels", "motel", "motels", "travel", "hostel", "resort", "accommodation"].includes(normalizedType)) {
    return true;
  }
  const searchable = [
    record?.name,
    record?.restaurantName,
    record?.businessName,
    record?.description,
    record?.bio,
    record?.about
  ].map((value) => String(value || "").trim().toLowerCase()).join(" ");
  return /\bhotel(s)?\b|\bmotel(s)?\b|\bhostel\b|\bresort\b|\baccommodation\b/.test(searchable);
}

function hasAdsBusinessShape(record = {}, normalizeRestaurantTypeFn = (value) => value) {
  const normalizedType = normalizeLooseTypeKey(normalizeRestaurantTypeFn(
    record?.type
    || record?.customerType
    || record?.category
    || record?.kind
    || record?.restaurantType
    || record?.businessProfileType
    || record?.profileType
    || record?.vertical
    || record?.leadType
    || ""
  ));
  if (["hotel", "hotels", "motel", "motels", "travel", "hostel", "resort", "accommodation"].includes(normalizedType)) {
    return false;
  }
  if (!normalizedType) return true;
  return ["restaurant", "cafe", "coffee", "fastfood", "food", "ecommerce"].includes(normalizedType);
}

function buildTravelOffersSignature(record = {}) {
  const items = Array.isArray(record.publicOffers)
    ? record.publicOffers
    : (Array.isArray(record.travelOffers) ? record.travelOffers : []);
  return items
    .map((item = {}) => [
      String(item.id || item.offerId || "").trim(),
      item.active === false ? "0" : "1",
      String(item.title || item.name || "").trim(),
      String(item.imageUrl || item.offerImageUrl || "").trim(),
      String(item.offerBadgeLabel || item.badgeLabel || "").trim(),
      String(item.offerDurationLabel || item.nightsDaysLabel || "").trim(),
      String(item.distanceCenter || item.distanceToCenter || "").trim(),
      String(item.distanceBeach || item.distanceToBeach || "").trim(),
      String(item.hotelStartingPrice || item.startingPrice || item.priceFrom || "").trim(),
      normalizeOfferPriceUnit(item.priceUnit || item.offerPriceUnit || ""),
      collectTravelOfferFeatures(item).join("+")
    ].join(":"))
    .join("~");
}

function buildRestaurantAdsSignature(record = {}) {
  const items = Array.isArray(record.publicAds)
    ? record.publicAds
    : (Array.isArray(record.restaurantAds) ? record.restaurantAds : []);
  return items
    .map((item = {}) => [
      String(item.id || item.adId || "").trim(),
      item.active === false ? "0" : "1",
      normalizePublicAdStatus(item.status || item.approvalStatus || ""),
      String(item.title || item.name || "").trim(),
      String(item.imageUrl || "").trim(),
      String(item.category || "").trim(),
      String(item.priceSegment || item.priceRange || "").trim()
    ].join(":"))
    .join("~");
}

function mergeDefinedRestaurantFields(base = {}, patch = {}) {
  const next = { ...(base || {}) };
  Object.entries(patch || {}).forEach(([key, value]) => {
    if (!hasMeaningfulValue(value)) return;
    next[key] = value;
  });
  return next;
}

function computeRestaurantTruthCompletenessScore(record = {}, {
  normalizeRestaurantTypeFn
} = {}) {
  const normalizeRestaurantType = typeof normalizeRestaurantTypeFn === "function"
    ? normalizeRestaurantTypeFn
    : (value) => String(value || "").trim().toLowerCase();
  const row = record && typeof record === "object" ? record : {};
  const name = String(
    row.name
    || row.restaurantName
    || row.displayName
    || row.businessName
    || ""
  ).trim();
  const logo = String(row.logoUrl || row.logo || row.logoURL || "").trim();
  const type = normalizeRestaurantType(
    row.type
    || row.customerType
    || row.category
    || row.kind
    || row.restaurantType
    || ""
  );
  const city = String(row.city || "").trim();
  const address = String(row.address || row.location || "").trim();
  const coords = readCoordsFromRecord(row);
  const truthMeta = readRestaurantTruthMetaCore(row);
  let score = 0;
  if (name && !isGenericBusinessLabel(name)) score += 2;
  if (logo) score += 2;
  if (type) score += 1;
  if (city || address) score += 1;
  if (coords) score += 2;
  if (truthMeta.version > 0 || truthMeta.updatedAtMs > 0) score += 1;
  if (!isBootstrapRestaurantPreviewRecordCore(row)) score += 1;
  return score;
}

export function buildRestaurantTruthSignatureCore(items = [], {
  normalizeRestaurantTypeFn
} = {}) {
  const normalizeRestaurantType = typeof normalizeRestaurantTypeFn === "function"
    ? normalizeRestaurantTypeFn
    : (value) => String(value || "").trim().toLowerCase();
  return (Array.isArray(items) ? items : [])
    .map((record) => {
      const row = record && typeof record === "object" ? record : {};
      const coords = readCoordsFromRecord(row);
      const truthMeta = readRestaurantTruthMetaCore(row);
      const name = String(
        row.name
        || row.restaurantName
        || row.displayName
        || row.businessName
        || ""
      ).trim();
      const logo = String(row.logoUrl || row.logo || row.logoURL || "").trim();
      const type = normalizeRestaurantType(
        row.type
        || row.customerType
        || row.category
        || row.kind
        || row.restaurantType
        || ""
      );
      const city = String(row.city || "").trim();
      const address = String(row.address || row.location || "").trim();
      const lat = coords ? Number(coords.lat).toFixed(6) : "";
      const lng = coords ? Number(coords.lng).toFixed(6) : "";
      const travelOffersCount = Number(row.travelOffersCount ?? row.publicOffersCount ?? (Array.isArray(row.publicOffers) ? row.publicOffers.length : 0));
      const hasTravelOffers = row.hasTravelOffers === true ? "1" : (row.hasTravelOffers === false ? "0" : "");
      const travelOffersSignature = buildTravelOffersSignature(row);
      const publicAdsCount = Number(row.publicAdsCount ?? (Array.isArray(row.publicAds) ? row.publicAds.length : 0));
      const approvedAdsCount = Number(row.approvedAdsCount ?? 0);
      const hasApprovedAds = row.hasApprovedAds === true ? "1" : (row.hasApprovedAds === false ? "0" : "");
      const restaurantAdsSignature = buildRestaurantAdsSignature(row);
      return [
        String(row.id || "").trim(),
        name,
        logo,
        type,
        city,
        address,
        lat,
        lng,
        Number.isFinite(travelOffersCount) ? String(travelOffersCount) : "0",
        hasTravelOffers,
        travelOffersSignature,
        Number.isFinite(publicAdsCount) ? String(publicAdsCount) : "0",
        Number.isFinite(approvedAdsCount) ? String(approvedAdsCount) : "0",
        hasApprovedAds,
        restaurantAdsSignature,
        String(truthMeta.version || 0),
        String(truthMeta.updatedAtMs || 0),
        String(truthMeta.deletedAtMs || 0),
        String(truthMeta.sourceRank || 0)
      ].join("|");
    })
    .join(",");
}

export function reconcileRestaurantTruthRecordCore(existing = {}, incoming = {}, {
  normalizeRestaurantTypeFn
} = {}) {
  const existingRow = existing && typeof existing === "object" ? existing : {};
  const incomingRow = incoming && typeof incoming === "object" ? incoming : {};
  const existingMeta = readRestaurantTruthMetaCore(existingRow);
  const incomingMeta = readRestaurantTruthMetaCore(incomingRow);
  const existingScore = computeRestaurantTruthCompletenessScore(existingRow, {
    normalizeRestaurantTypeFn
  });
  const incomingScore = computeRestaurantTruthCompletenessScore(incomingRow, {
    normalizeRestaurantTypeFn
  });

  let preferIncoming = true;
  if (incomingMeta.version > existingMeta.version) {
    preferIncoming = true;
  } else if (existingMeta.version > incomingMeta.version) {
    preferIncoming = false;
  } else if (incomingMeta.updatedAtMs > existingMeta.updatedAtMs) {
    preferIncoming = true;
  } else if (existingMeta.updatedAtMs > incomingMeta.updatedAtMs) {
    preferIncoming = false;
  } else if (incomingMeta.sourceRank > existingMeta.sourceRank) {
    preferIncoming = true;
  } else if (existingMeta.sourceRank > incomingMeta.sourceRank) {
    preferIncoming = false;
  } else {
    preferIncoming = incomingScore >= existingScore;
  }

  const merged = preferIncoming
    ? mergeDefinedRestaurantFields(existingRow, incomingRow)
    : mergeDefinedRestaurantFields(incomingRow, existingRow);

  const keepPreview = isBootstrapRestaurantPreviewRecordCore(existingRow)
    && isBootstrapRestaurantPreviewRecordCore(incomingRow);
  if (!keepPreview) {
    delete merged.__truthPartial;
    delete merged.__isPreview;
    if (String(merged.__truthSource || "").trim().toLowerCase() === "bootstrap-preview") {
      delete merged.__truthSource;
    }
  }
  return merged;
}

export function createRestaurantIdentityRuntimeController({
  state = null,
  db = null,
  docFn = null,
  getDocFn = async () => null,
  normalizeRestaurantType = (value) => value,
  isGenericStoryBusinessLabel = () => false,
  queueMicrotaskFn = null,
  buildRestaurantLocationsFn = () => [],
  resolveRestaurantLogoFn = (_restaurantId, source = "") => String(source || ""),
  isPublicBusinessRecordFn = () => true,
  syncFeedPostLogos = () => false,
  refreshFeedStories = () => false,
  render = () => {},
  updateFeedDom = () => {},
  getLastRenderMode = () => ""
} = {}) {
  const queueMicrotaskSafe = typeof queueMicrotaskFn === "function"
    ? queueMicrotaskFn
    : ((fn) => fn?.());
  const getDocSafe = typeof getDocFn === "function" ? getDocFn : (async () => null);
  const makeDocRef = typeof docFn === "function" ? docFn : null;
  const buildRestaurantLocations = typeof buildRestaurantLocationsFn === "function"
    ? buildRestaurantLocationsFn
    : (() => []);
  const resolveRestaurantLogo = typeof resolveRestaurantLogoFn === "function"
    ? resolveRestaurantLogoFn
    : ((_restaurantId, source = "") => String(source || ""));
  const isPublicBusinessRecord = typeof isPublicBusinessRecordFn === "function"
    ? isPublicBusinessRecordFn
    : (() => true);
  const pendingStoryIdentityHydrationIds = new Set();
  const restaurantMetaUnsubs = new Map();
  let storyIdentityHydrationQueued = false;

  function mergeRestaurants(existing = [], additions = []) {
    if (!additions.length) return existing;
    const orderedIds = [];
    const map = new Map();
    existing.forEach((rest) => {
      if (!rest?.id) return;
      orderedIds.push(rest.id);
      map.set(rest.id, rest);
    });
    additions.forEach((rest) => {
      if (!rest?.id) return;
      if (!map.has(rest.id)) orderedIds.push(rest.id);
      const previous = map.get(rest.id) || {};
      map.set(rest.id, reconcileRestaurantTruthRecordCore(previous, rest, {
        normalizeRestaurantTypeFn: normalizeRestaurantType
      }));
    });
    return orderedIds.map((id) => map.get(id)).filter(Boolean);
  }

  function collectFeedHydrationIds(feedRows = [], { max = 6 } = {}) {
    if (!Array.isArray(feedRows) || !feedRows.length) return [];
    const existing = new Map((state?.restaurants || []).map((rest) => [String(rest?.id || "").trim(), rest]));
    const ids = [];
    const seen = new Set();
    for (const row of feedRows) {
      if (ids.length >= max) break;
      const rid = String(row?.restaurantId || row?.rid || row?.ownerId || "").trim();
      if (!rid || seen.has(rid)) continue;
      seen.add(rid);
      const cached = existing.get(rid) || null;
      const cachedName = String(cached?.name || cached?.restaurantName || cached?.displayName || "").trim();
      const cachedLogo = String(cached?.logoUrl || cached?.logo || cached?.logoURL || "").trim();
      const hasCachedName = !!cachedName && !isGenericStoryBusinessLabel(cachedName);
      const rowName = String(row?.businessName || row?.restaurantName || row?.business || "").trim();
      const hasRowName = !!rowName && !isGenericStoryBusinessLabel(rowName);
      const rowLogo = String(row?.logoUrl || row?.logo || row?.logoURL || "").trim();
      if ((hasCachedName && cachedLogo) || (hasRowName && rowLogo)) continue;
      ids.push(rid);
    }
    return ids;
  }

  function collectStoryHydrationIds(storyRows = [], { max = 12 } = {}) {
    if (!Array.isArray(storyRows) || !storyRows.length) return [];
    const existing = new Map((state?.restaurants || []).map((rest) => [String(rest?.id || "").trim(), rest]));
    const ids = [];
    const seen = new Set();
    for (const row of storyRows) {
      if (ids.length >= max) break;
      const rid = String(row?.restaurantId || row?.id || row?.rid || "").trim();
      if (!rid || seen.has(rid)) continue;
      seen.add(rid);
      const cached = existing.get(rid) || null;
      const cachedName = String(
        cached?.name
        || cached?.restaurantName
        || cached?.displayName
        || cached?.businessName
        || ""
      ).trim();
      const cachedLogo = String(cached?.logoUrl || cached?.logo || cached?.logoURL || "").trim();
      const hasCachedName = !!cachedName && !isGenericStoryBusinessLabel(cachedName);
      const hasCachedLogo = !!cachedLogo;
      if (hasCachedName && hasCachedLogo) continue;
      ids.push(rid);
    }
    return ids;
  }

  function queueStoryIdentityHydration(storyRows = state?.stories, { max = 12 } = {}) {
    const ids = collectStoryHydrationIds(storyRows, { max });
    if (!ids.length) return;
    ids.forEach((id) => pendingStoryIdentityHydrationIds.add(id));
    if (storyIdentityHydrationQueued) return;
    storyIdentityHydrationQueued = true;
    queueMicrotaskSafe(() => {
      storyIdentityHydrationQueued = false;
      const nextIds = Array.from(pendingStoryIdentityHydrationIds);
      pendingStoryIdentityHydrationIds.clear();
      if (!nextIds.length) return;
      void hydrateRestaurantsByIds(nextIds, { max: nextIds.length });
    });
  }

  function rebuildBusinessLocations() {
    state.businessLocations = (state?.restaurants || [])
      .filter((rest) => isPublicBusinessRecord(rest))
      .flatMap((rest, idx) => buildRestaurantLocations(rest, idx));
    (state?.restaurants || []).forEach((rest) => {
      if (!rest?.id) return;
      const rawLogo = rest.logoUrl || rest.logo || rest.logoURL || "";
      if (rawLogo) resolveRestaurantLogo(rest.id, rawLogo, "avatar");
    });
  }

  function mergeRestaurantMeta(rest, meta, offerInfo = null, adInfo = null) {
    if (!rest) return rest;
    const data = meta || {};
    const name = data.name || data.restaurantName || rest.name || rest.restaurantName || "";
    const logoUrl = data.logoUrl || data.logo || rest.logoUrl || rest.logo || rest.logoURL || "";
    const city = data.city || rest.city || "";
    const address = data.address || data.location || rest.address || rest.location || "";
    const type = normalizeRestaurantType(
      data.type
      || data.customerType
      || rest.type
      || rest.customerType
      || rest.category
      || rest.kind
      || rest.restaurantType
      || ""
    );
    const merged = {
      ...rest,
      name: name || rest.name || "",
      restaurantName: rest.restaurantName || "",
      logoUrl,
      city,
      address,
      ...(type ? { type, customerType: type } : {})
    };
    const coords = readCoordsFromRecord(data) || readCoordsFromRecord(rest);
    if (coords) {
      merged.lat = coords.lat;
      merged.lng = coords.lng;
    }
    if (hasMeaningfulValue(data.updatedAt)) merged.updatedAt = data.updatedAt;
    if (hasMeaningfulValue(data.modifiedAt)) merged.modifiedAt = data.modifiedAt;
    if (hasMeaningfulValue(data.version)) merged.version = data.version;
    if (hasMeaningfulValue(data.revision)) merged.revision = data.revision;
    if (hasMeaningfulValue(data.geo)) merged.geo = data.geo;
    if (hasMeaningfulValue(data.coords)) merged.coords = data.coords;
    if (typeof data.offersEnabled === "boolean") merged.offersEnabled = data.offersEnabled;
    if (offerInfo && typeof offerInfo === "object") {
      const publicOffers = Array.isArray(offerInfo.items) ? offerInfo.items : [];
      const activeOffers = publicOffers.filter((item) => item && item.active !== false);
      merged.publicOffers = publicOffers;
      merged.travelOffers = publicOffers;
      merged.publicOffersCount = publicOffers.length;
      merged.travelOffersCount = publicOffers.length;
      merged.hasTravelOffers = activeOffers.length > 0;
      merged.offersTruthState = publicOffers.length ? "seeded" : "knownEmpty";
    }
    if (adInfo && typeof adInfo === "object") {
      const publicAds = Array.isArray(adInfo.items) ? adInfo.items : [];
      const approvedAds = publicAds.filter((item) => (
        item && item.active !== false && normalizePublicAdStatus(item.status || item.approvalStatus || "") === "approved"
      ));
      merged.publicAds = publicAds;
      merged.restaurantAds = publicAds;
      merged.publicAdsCount = publicAds.length;
      merged.approvedAdsCount = approvedAds.length;
      merged.hasApprovedAds = approvedAds.length > 0;
      merged.adsTruthState = publicAds.length ? "seeded" : "knownEmpty";
    }
    const reconciled = reconcileRestaurantTruthRecordCore(rest, merged, {
      normalizeRestaurantTypeFn: normalizeRestaurantType
    });
    if (offerInfo && typeof offerInfo === "object") {
      const publicOffers = Array.isArray(offerInfo.items) ? offerInfo.items : [];
      const activeOffers = publicOffers.filter((item) => item && item.active !== false);
      reconciled.publicOffers = publicOffers;
      reconciled.travelOffers = publicOffers;
      reconciled.publicOffersCount = publicOffers.length;
      reconciled.travelOffersCount = publicOffers.length;
      reconciled.hasTravelOffers = activeOffers.length > 0;
      reconciled.offersTruthState = publicOffers.length ? "seeded" : "knownEmpty";
    }
    if (adInfo && typeof adInfo === "object") {
      const publicAds = Array.isArray(adInfo.items) ? adInfo.items : [];
      const approvedAds = publicAds.filter((item) => (
        item && item.active !== false && normalizePublicAdStatus(item.status || item.approvalStatus || "") === "approved"
      ));
      reconciled.publicAds = publicAds;
      reconciled.restaurantAds = publicAds;
      reconciled.publicAdsCount = publicAds.length;
      reconciled.approvedAdsCount = approvedAds.length;
      reconciled.hasApprovedAds = approvedAds.length > 0;
      reconciled.adsTruthState = publicAds.length ? "seeded" : "knownEmpty";
    }
    return reconciled;
  }

  function stopRestaurantMetaListeners() {
    restaurantMetaUnsubs.forEach((unsub) => {
      try { unsub(); } catch {}
    });
    restaurantMetaUnsubs.clear();
  }

  function ensureFeedRestaurantMetaListeners(feedPosts = state?.feedPosts, { limit = 12 } = {}) {
    void feedPosts;
    void limit;
    stopRestaurantMetaListeners();
  }

  async function enrichRestaurantsWithPublicMeta(restaurants) {
    if (!Array.isArray(restaurants) || !restaurants.length) return restaurants || [];
    const lookups = restaurants.map(async (rest) => {
      const rid = rest?.id || "";
      if (!rid || !makeDocRef || !db) return Promise.resolve(null);
      const hasCoreName = !!String(rest?.name || rest?.restaurantName || "").trim();
      const hasCoreLogo = !!String(rest?.logoUrl || rest?.logo || rest?.logoURL || "").trim();
      const hasCoreCity = !!String(rest?.city || rest?.address || rest?.location || "").trim();
      const hasCoreType = !!normalizeRestaurantType(
        rest?.type
        || rest?.customerType
        || rest?.category
        || rest?.kind
        || rest?.restaurantType
        || ""
      );
      const hasCoords = !!readCoordsFromRecord(rest);
      const isPreview = isBootstrapRestaurantPreviewRecordCore(rest);
      const shouldReadMeta = !(hasCoreName && hasCoreLogo && hasCoreCity && hasCoreType && hasCoords && !isPreview);
      let meta = {};
      if (shouldReadMeta) {
        try {
          const metaSnap = await getDocSafe(makeDocRef(db, "restaurants", rid, "public", "meta"));
          if (metaSnap && typeof metaSnap.exists === "function" && metaSnap.exists()) {
            meta = metaSnap.data() || {};
          }
        } catch {}
      }
      const metaMergedForType = mergeRestaurantMeta(rest, meta);
      let offerInfo = null;
      let adInfo = null;
      if (hasTravelBusinessShape(metaMergedForType, normalizeRestaurantType)) {
        try {
          const offersSnap = await getDocSafe(makeDocRef(db, "restaurants", rid, "public", "offers"));
          const offerData = offersSnap && typeof offersSnap.exists === "function" && offersSnap.exists()
            ? (offersSnap.data() || {})
            : {};
          offerInfo = { items: collectPublicTravelOffers(offerData) };
        } catch {
          offerInfo = { items: [] };
        }
      }
      if (hasAdsBusinessShape(metaMergedForType, normalizeRestaurantType)) {
        try {
          const adsSnap = await getDocSafe(makeDocRef(db, "restaurants", rid, "public", "ads"));
          const adData = adsSnap && typeof adsSnap.exists === "function" && adsSnap.exists()
            ? (adsSnap.data() || {})
            : {};
          adInfo = { items: collectPublicAds(adData) };
        } catch {
          adInfo = { items: [] };
        }
      }
      return { meta, offerInfo, adInfo };
    });
    const metaResults = await Promise.all(lookups);
    return restaurants.map((rest, idx) => {
      const result = metaResults[idx] || {};
      return mergeRestaurantMeta(rest, result.meta || {}, result.offerInfo || null, result.adInfo || null);
    });
  }

  async function hydrateRestaurantsByIds(restaurantIds, { max = 24 } = {}) {
    if (!Array.isArray(restaurantIds) || restaurantIds.length === 0) return;
    const uniqueIds = Array.from(new Set(restaurantIds.filter(Boolean)));
    if (!uniqueIds.length) return;
    const existing = new Map((state?.restaurants || []).map((rest) => [rest.id, rest]));
    const missing = uniqueIds.filter((id) => {
      const stored = existing.get(id);
      if (!stored) return true;
      if (isBootstrapRestaurantPreviewRecordCore(stored)) return true;
      const name = String(
        stored.name
        || stored.restaurantName
        || stored.displayName
        || stored.businessName
        || ""
      ).trim();
      const logo = String(stored.logoUrl || stored.logo || stored.logoURL || "").trim();
      const type = normalizeRestaurantType(
        stored.type
        || stored.customerType
        || stored.category
        || stored.kind
        || stored.restaurantType
        || ""
      );
      const city = String(stored.city || stored.address || stored.location || "").trim();
      const coords = readCoordsFromRecord(stored);
      const hasUsableName = !!name && !isGenericStoryBusinessLabel(name);
      const hasUsableLogo = !!logo;
      const hasUsableType = !!type;
      const hasUsableCity = !!city;
      const hasUsableCoords = !!coords;
      return !(hasUsableName && hasUsableLogo && hasUsableType && hasUsableCity && hasUsableCoords);
    }).slice(0, max);
    if (missing.length === 0 || !makeDocRef || !db) return;

    const loaded = (await Promise.all(missing.map(async (rid) => {
      try {
        const stored = existing.get(rid) || {};
        let metaData = {};
        try {
          const metaSnap = await getDocSafe(makeDocRef(db, "restaurants", rid, "public", "meta"));
          if (metaSnap.exists()) metaData = metaSnap.data() || {};
        } catch {}

        let restData = stored;
        const currentName = metaData.name || metaData.restaurantName || stored.name || stored.restaurantName || "";
        const currentLogo = metaData.logoUrl || metaData.logo || stored.logoUrl || stored.logo || stored.logoURL || "";
        if (!currentName || !currentLogo) {
          try {
            const restSnap = await getDocSafe(makeDocRef(db, "restaurants", rid));
            if (restSnap.exists()) {
              restData = { ...restData, ...(restSnap.data() || {}) };
            }
          } catch {}
        }

        const name = metaData.name || metaData.restaurantName || restData.name || restData.restaurantName || "";
        const logoUrl = metaData.logoUrl || metaData.logo || restData.logoUrl || restData.logo || restData.logoURL || "";
        const city = metaData.city || restData.city || "";
        const address = metaData.address || metaData.location || restData.address || restData.location || "";
        const coords = readCoordsFromRecord(metaData) || readCoordsFromRecord(restData);
        const type = normalizeRestaurantType(
          metaData.type
          || metaData.customerType
          || restData.type
          || restData.customerType
          || restData.category
          || restData.kind
          || restData.restaurantType
          || ""
        );
        if (!(name || logoUrl || city || type || address || coords)) return null;
        const next = {
          id: rid,
          name,
          restaurantName: restData.restaurantName || "",
          logoUrl,
          city,
          address,
          ...(type ? { type, customerType: type } : {})
        };
        if (coords) {
          next.lat = coords.lat;
          next.lng = coords.lng;
        }
        if (hasMeaningfulValue(restData.updatedAt)) next.updatedAt = restData.updatedAt;
        if (hasMeaningfulValue(restData.modifiedAt)) next.modifiedAt = restData.modifiedAt;
        if (hasMeaningfulValue(restData.version)) next.version = restData.version;
        if (hasMeaningfulValue(restData.revision)) next.revision = restData.revision;
        if (hasMeaningfulValue(restData.geo)) next.geo = restData.geo;
        if (hasMeaningfulValue(restData.coords)) next.coords = restData.coords;
        return next;
      } catch (err) {
        console.warn("hydrateRestaurantsByIds failed for", rid, err);
        return null;
      }
    }))).filter(Boolean);

    if (loaded.length) {
      state.restaurants = mergeRestaurants(state.restaurants, loaded);
      rebuildBusinessLocations();
      const feedUpdated = syncFeedPostLogos();
      const storiesUpdated = state?.stories?.length ? false : refreshFeedStories({ force: true });
      if ((feedUpdated || storiesUpdated) && state?.activeTab === "feed" && getLastRenderMode() === "main") {
        updateFeedDom();
      } else if (feedUpdated || storiesUpdated) {
        render();
      }
    }
  }

  return {
    collectFeedHydrationIds,
    queueStoryIdentityHydration,
    hydrateRestaurantsByIds,
    mergeRestaurants,
    rebuildBusinessLocations,
    stopRestaurantMetaListeners,
    ensureFeedRestaurantMetaListeners,
    enrichRestaurantsWithPublicMeta
  };
}

