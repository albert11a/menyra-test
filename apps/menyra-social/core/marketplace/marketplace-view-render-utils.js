const MARKETPLACE_SECTIONS = Object.freeze({
  restaurants: Object.freeze({
    key: "restaurants",
    title: "Restaurants",
    emptyTitle: "Ende nuk ka restorante",
    emptyBody: "Nuk u gjeten profile te pershtatshme.",
    icon: "utensils",
    typeKeys: Object.freeze(["restaurant", "cafe", "coffee", "fastfood", "food"])
  }),
  travel: Object.freeze({
    key: "travel",
    title: "Travel",
    emptyTitle: "Ende nuk ka profile Travel",
    emptyBody: "Nuk u gjeten profile te pershtatshme.",
    icon: "plane",
    typeKeys: Object.freeze(["hotel", "hotels", "motel", "motels", "travel", "hostel", "resort", "accommodation"])
  }),
  shopping: Object.freeze({
    key: "shopping",
    title: "Shopping",
    emptyTitle: "Ende nuk ka profile Shopping",
    emptyBody: "Nuk u gjeten profile te pershtatshme.",
    icon: "shopping-bag",
    typeKeys: Object.freeze(["ecommerce"])
  })
});

const SECTION_BY_TYPE = new Map();
Object.values(MARKETPLACE_SECTIONS).forEach((section) => {
  section.typeKeys.forEach((typeKey) => {
    SECTION_BY_TYPE.set(typeKey, section.key);
  });
});

const BEST_LIMIT = 8;
const LIST_LIMIT = 24;
const RESTAURANTS_GATE_COLOR = "#ff4f3f";
const FEED_LOCATION_STORAGE_KEY = "mnyra_social_feed_viewer_location_v1";
const TRAVEL_BLUE = "#00cce5";
const TRAVEL_SEARCH_TEAL = "#005f73";
const SHOPPING_BRAND_INTRO_COLOR = "#4b766d";
const SHOPPING_BRAND_INTRO_LINES = Object.freeze([
  "FASHION",
  "BEAUTY",
  "SNEAKER",
  "BABY",
  "HOME",
  "GROCERY",
  "ELECTRONICS",
  "LOCAL"
]);
const RESTAURANT_COORD_CITY_MAX_DISTANCE_KM = 35;
const RESTAURANT_COORD_CITY_OPTIONS = Object.freeze([
  Object.freeze({ label: "Prishtina", lat: 42.6629, lng: 21.1655 }),
  Object.freeze({ label: "Prizren", lat: 42.2139, lng: 20.7397 }),
  Object.freeze({ label: "Peja", lat: 42.6591, lng: 20.2883 }),
  Object.freeze({ label: "Gjakova", lat: 42.3803, lng: 20.4308 }),
  Object.freeze({ label: "Ferizaj", lat: 42.3706, lng: 21.1553 }),
  Object.freeze({ label: "Gjilan", lat: 42.4635, lng: 21.4699 }),
  Object.freeze({ label: "Mitrovica", lat: 42.8914, lng: 20.8660 }),
  Object.freeze({ label: "Vushtrria", lat: 42.8231, lng: 20.9675 }),
  Object.freeze({ label: "Podujeva", lat: 42.9106, lng: 21.1930 }),
  Object.freeze({ label: "Tirana", lat: 41.3275, lng: 19.8187 }),
  Object.freeze({ label: "Kukes", lat: 42.0769, lng: 20.4219 }),
  Object.freeze({ label: "Smederevo", lat: 44.6644, lng: 20.9276 })
]);
const TRAVEL_DESTINATION_ALIAS_GROUPS = Object.freeze([
  Object.freeze(["prishtina", "prishtine", "prishtin", "pristina"]),
  Object.freeze(["ferizaj", "ferizaji", "uroshevac"]),
  Object.freeze(["peja", "peje", "pec"]),
  Object.freeze(["prizren", "prizreni"]),
  Object.freeze(["gjakova", "gjakove", "djakova"]),
  Object.freeze(["gjilan", "gjilani"]),
  Object.freeze(["mitrovica", "mitrovice"]),
  Object.freeze(["vushtrria", "vushtrri"]),
  Object.freeze(["podujeva", "podujeve", "podujevo", "besiana"]),
  Object.freeze(["fushe kosove", "fushe kosova", "fush kosove", "fush kosova"]),
  Object.freeze(["lipjan"]),
  Object.freeze(["suhareka", "suhareke", "theranda"]),
  Object.freeze(["rahovec", "rahoveci"]),
  Object.freeze(["drenas", "gllogoc"]),
  Object.freeze(["skenderaj", "skenderaji"]),
  Object.freeze(["malisheva", "malisheve"]),
  Object.freeze(["kamenica", "kamenice", "kamenica kosove"]),
  Object.freeze(["decan", "decani"]),
  Object.freeze(["istog", "istogu"]),
  Object.freeze(["klina", "kline"]),
  Object.freeze(["vite", "vitia"]),
  Object.freeze(["hani i elezit", "hani elezit"]),
  Object.freeze(["tirana", "tirane"]),
  Object.freeze(["durres", "durresi"]),
  Object.freeze(["vlora", "vlore"]),
  Object.freeze(["shkoder", "shkodra"]),
  Object.freeze(["shengjin", "shëngjin", "shen gjin", "shengjini"]),
  Object.freeze(["ksamil", "ksamili"]),
  Object.freeze(["dhermi", "dhërmi", "dhermiu"]),
  Object.freeze(["velipoje", "velipojë", "velipoja"]),
  Object.freeze(["theth", "thethi"]),
  Object.freeze(["valbone", "valbonë", "valbona"]),
  Object.freeze(["elbasan", "elbasani"]),
  Object.freeze(["fier", "fieri"]),
  Object.freeze(["korce", "korca"]),
  Object.freeze(["sarande", "saranda"]),
  Object.freeze(["berat", "berati"]),
  Object.freeze(["gjirokaster", "gjirokastra"]),
  Object.freeze(["kukes", "kukesi"]),
  Object.freeze(["lezhe", "lezha"]),
  Object.freeze(["pogradec", "pogradeci"]),
  Object.freeze(["kruje", "kruja"]),
  Object.freeze(["fushe kruje", "fushë krujë", "fushe-kruje", "fush kruje"]),
  Object.freeze(["lushnje", "lushnja"]),
  Object.freeze(["himare", "himarë", "himara"]),
  Object.freeze(["kavaje", "kavajë", "kavaja"]),
  Object.freeze(["kamze", "kamëz", "kamza"]),
  Object.freeze(["vore", "vorë", "vora"]),
  Object.freeze(["divjake", "divjakë", "divjaka"]),
  Object.freeze(["permet", "përmet", "permeti"]),
  Object.freeze(["tepelene", "tepelenë", "tepelena"]),
  Object.freeze(["delvine", "delvinë", "delvina"]),
  Object.freeze(["peshkopi", "peshkopia", "diber", "dibër"]),
  Object.freeze(["burrel", "burreli", "mat"]),
  Object.freeze(["puke", "pukë", "puka"]),
  Object.freeze(["bajram curri", "bajramcurri", "tropoje", "tropojë"]),
  Object.freeze(["krume", "krumë", "has"]),
  Object.freeze(["lac", "laç", "kurbin"]),
  Object.freeze(["orikum", "orikumi"]),
  Object.freeze(["golem", "golemi"]),
  Object.freeze(["jale", "jalë", "jali"]),
  Object.freeze(["qepare", "qeparo", "qeparoi"]),
  Object.freeze(["borsh", "borshi"]),
  Object.freeze(["lukove", "lukovë", "lukova"]),
  Object.freeze(["palase", "palasë", "palasa"]),
  Object.freeze(["drimadhe", "drymades", "drimadhes"]),
  Object.freeze(["spille", "spilleja"]),
  Object.freeze(["gjiri i lalzit", "lalzi", "lalez", "lalëz"])
]);
const RESTAURANT_LOCATION_ALIAS_GROUPS = Object.freeze([
  Object.freeze(["prishtina", "prishtine", "prishtin", "pristina"]),
  Object.freeze(["ferizaj", "ferizaji", "uroshevac"]),
  Object.freeze(["peja", "peje", "pec"]),
  Object.freeze(["prizren", "prizreni"]),
  Object.freeze(["gjakova", "gjakove", "djakova"]),
  Object.freeze(["gjilan", "gjilani"]),
  Object.freeze(["mitrovica", "mitrovice"]),
  Object.freeze(["vushtrria", "vushtrri"]),
  Object.freeze(["podujeva", "podujeve", "podujevo", "besiana"]),
  Object.freeze(["fushe kosove", "fushe kosova", "fush kosove", "fush kosova"]),
  Object.freeze(["lipjan"]),
  Object.freeze(["suhareka", "suhareke", "theranda"]),
  Object.freeze(["rahovec", "rahoveci"]),
  Object.freeze(["drenas", "gllogoc"]),
  Object.freeze(["skenderaj", "skenderaji"]),
  Object.freeze(["malisheva", "malisheve"]),
  Object.freeze(["kamenica", "kamenice", "kamenica kosove"]),
  Object.freeze(["decan", "decani"]),
  Object.freeze(["istog", "istogu"]),
  Object.freeze(["klina", "kline"]),
  Object.freeze(["vite", "vitia"]),
  Object.freeze(["hani i elezit", "hani elezit"])
]);
const RESTAURANT_LOCATION_TEXT_FIELDS = Object.freeze([
  "city",
  "locationCity",
  "primaryCity",
  "place",
  "locationPlace",
  "primaryPlace",
  "postalCity",
  "address",
  "primaryAddress",
  "formattedAddress",
  "fullAddress",
  "addressText",
  "streetAddress",
  "street",
  "locationLabel",
  "displayLocation",
  "locality",
  "town",
  "municipality",
  "village",
  "neighborhood",
  "area",
  "district",
  "county",
  "region",
  "state",
  "province",
  "country",
  "countryCode"
]);
const RESTAURANT_NAMED_LOCATION_TEXT_FIELDS = Object.freeze([
  ...RESTAURANT_LOCATION_TEXT_FIELDS,
  "label",
  "name",
  "title"
]);
const RESTAURANT_NESTED_LOCATION_FIELDS = Object.freeze([
  "location",
  "primaryLocation",
  "businessLocation",
  "venueLocation",
  "addressInfo",
  "place",
  "geo",
  "coords",
  "coordinates",
  "geoPoint"
]);

function asFn(candidate, fallback = () => "") {
  return typeof candidate === "function" ? candidate : fallback;
}

function cleanText(value = "") {
  return String(value || "").trim();
}

function normalizeLooseKey(value = "") {
  const raw = cleanText(value).toLowerCase();
  if (!raw) return "";
  return raw
    .replace(/[ëèéê]/g, "e")
    .replace(/[çćč]/g, "c")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function expandTravelDestinationKeys(value = "") {
  const key = normalizeLooseKey(value);
  if (!key) return [];
  const keys = new Set([key]);
  TRAVEL_DESTINATION_ALIAS_GROUPS.forEach((group) => {
    const normalizedGroup = group.map(normalizeLooseKey).filter(Boolean);
    if (normalizedGroup.includes(key)) normalizedGroup.forEach((alias) => keys.add(alias));
  });
  return Array.from(keys);
}

function expandRestaurantLocationKeys(value = "") {
  const key = normalizeLooseKey(value);
  if (!key) return [];
  const keys = new Set(expandTravelDestinationKeys(value));
  RESTAURANT_LOCATION_ALIAS_GROUPS.forEach((group) => {
    const normalizedGroup = group.map(normalizeLooseKey).filter(Boolean);
    if (normalizedGroup.includes(key)) normalizedGroup.forEach((alias) => keys.add(alias));
  });
  return Array.from(keys);
}

function normalizeSectionKey(value = "") {
  const key = normalizeLooseKey(value);
  if (key === "restaurant") return "restaurants";
  if (["hotel", "hotels", "motel", "motels"].includes(key)) return "travel";
  if (["shop", "ecommerce", "e_commerce", "shopping"].includes(key)) return "shopping";
  return MARKETPLACE_SECTIONS[key] ? key : "restaurants";
}

function normalizeTypeAlias(key = "") {
  const safeKey = normalizeLooseKey(key);
  if (!safeKey) return "";
  if (safeKey === "e_commerce" || safeKey === "online_shop" || safeKey === "onlineshop" || safeKey === "shop" || safeKey === "store") return "ecommerce";
  if (safeKey === "coffee" || safeKey === "coffe" || safeKey === "coffee_shop" || safeKey === "coffeeshop" || safeKey === "kaffee" || safeKey === "caffe") return "cafe";
  if (safeKey === "fast_food" || safeKey === "snack" || safeKey === "imbiss") return "fastfood";
  if (safeKey === "hotels") return "hotel";
  if (safeKey === "motels") return "motel";
  return safeKey;
}

function collectTypeCandidates(record = {}) {
  return [
    record.type,
    record.customerType,
    record.restaurantType,
    record.businessProfileType,
    record.profileType,
    record.catalogMode,
    record.category,
    record.kind,
    record.vertical,
    record.leadType
  ];
}

function resolveBusinessType(record = {}, {
  normalizeRestaurantType,
  normalizeLeadTypeKey
} = {}) {
  const normalizeRestaurant = typeof normalizeRestaurantType === "function"
    ? normalizeRestaurantType
    : ((value) => value);
  const normalizeLeadType = typeof normalizeLeadTypeKey === "function"
    ? normalizeLeadTypeKey
    : ((value) => value);
  const candidates = collectTypeCandidates(record);
  for (const candidate of candidates) {
    const normalized = normalizeTypeAlias(
      normalizeRestaurant(candidate)
      || normalizeLeadType(candidate)
      || candidate
    );
    if (normalized) return normalized;
  }
  const searchable = [
    record.name,
    record.restaurantName,
    record.businessName,
    record.description,
    record.bio
  ].map((value) => cleanText(value).toLowerCase()).join(" ");
  if (/\bhotel(s)?\b/.test(searchable)) return "hotel";
  if (/\bmotel(s)?\b/.test(searchable)) return "motel";
  if (/\bcoffee\b|\bcoffe\b|\bcafe\b|\bcaffe\b/.test(searchable)) return "cafe";
  if (/\bfast\s*food\b|\bfastfood\b/.test(searchable)) return "fastfood";
  if (/\be-?commerce\b|\bonline\s*shop\b/.test(searchable)) return "ecommerce";
  if (/\brestaurant\b|\brestoran\b|\bpizza\b|\bpizzeria\b/.test(searchable)) return "restaurant";
  return "";
}

export function resolveMarketplaceSectionForBusinessCore(record = {}, deps = {}) {
  const typeKey = resolveBusinessType(record, deps);
  return SECTION_BY_TYPE.get(typeKey) || "";
}

function getBusinessId(record = {}) {
  return cleanText(record.canonicalRestaurantId || record.restaurantId || record.id || record.landingRestaurantId || "");
}

function getBusinessName(record = {}) {
  return cleanText(record.name || record.restaurantName || record.businessName || record.displayName || "Business");
}

function getBusinessPlaceLabel(record = {}) {
  return cleanText(
    record.place
    || record.locationPlace
    || record.locality
    || record.district
    || record.neighborhood
    || record.neighbourhood
    || record.area
    || record.quarter
    || record.cityArea
    || record.primaryPlace
    || ""
  );
}

function getBusinessLocationLabel(record = {}) {
  const city = cleanText(record.city || record.locationCity || record.primaryCity);
  const place = getBusinessPlaceLabel(record);
  if (city && place && normalizeLooseKey(city) !== normalizeLooseKey(place)) return `${city} - ${place}`;
  const address = cleanText(record.address || record.location || record.primaryAddress);
  return city || place || inferLocationLabelFromCoords(record) || cleanText(record.country || record.region || "") || address || "Vendndodhja se shpejti";
}

function normalizeLocationCoords(value = {}) {
  const lat = Number(String(value?.lat ?? value?.latitude ?? "").replace(",", "."));
  const lng = Number(String(value?.lng ?? value?.lon ?? value?.longitude ?? "").replace(",", "."));
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) return null;
  if (Math.abs(lat) < 0.000001 && Math.abs(lng) < 0.000001) return null;
  return { lat, lng };
}

function distanceKmBetweenCoords(a = {}, b = {}) {
  const lat1 = Number(a.lat);
  const lng1 = Number(a.lng);
  const lat2 = Number(b.lat);
  const lng2 = Number(b.lng);
  if (![lat1, lng1, lat2, lng2].every(Number.isFinite)) return Number.POSITIVE_INFINITY;
  const toRad = (value) => value * Math.PI / 180;
  const earthKm = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const sinLat = Math.sin(dLat / 2);
  const sinLng = Math.sin(dLng / 2);
  const h = sinLat * sinLat
    + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * sinLng * sinLng;
  return 2 * earthKm * Math.atan2(Math.sqrt(h), Math.sqrt(Math.max(0, 1 - h)));
}

function inferLocationLabelFromCoords(record = {}) {
  const coords = readCoords(record);
  if (!coords) return "";
  const nearest = RESTAURANT_COORD_CITY_OPTIONS
    .map((entry) => ({
      label: entry.label,
      distanceKm: distanceKmBetweenCoords(coords, entry)
    }))
    .filter((entry) => Number.isFinite(entry.distanceKm))
    .sort((a, b) => a.distanceKm - b.distanceKm)[0];
  if (nearest && nearest.distanceKm <= RESTAURANT_COORD_CITY_MAX_DISTANCE_KM) {
    return nearest.label;
  }
  return "E shenuar ne harte";
}

function collectLocationTextCandidates(record = {}) {
  const values = [
    record.id,
    record.restaurantId,
    record.canonicalRestaurantId,
    record.publicSlug,
    record.landingSlug,
    record.handle,
    record.type,
    record.customerType,
    record.restaurantType,
    record.businessProfileType,
    record.profileType,
    record.catalogMode,
    record.category,
    record.kind,
    record.vertical,
    record.leadType,
    record.city,
    record.locationCity,
    record.primaryCity,
    record.place,
    record.locationPlace,
    record.locality,
    record.neighborhood,
    record.neighbourhood,
    record.address,
    record.location,
    record.primaryAddress,
    inferLocationLabelFromCoords(record),
    record.country,
    record.region,
    record.district,
    record.name,
    record.restaurantName,
    record.businessName,
    record.displayName,
    record.description,
    record.bio,
    record.about
  ];
  if (Array.isArray(record.locations)) {
    record.locations.forEach((location) => {
      if (!location || typeof location !== "object") return;
      values.push(location.city, location.place, location.locationPlace, location.locality, location.district, location.address, location.country, location.region, location.name);
    });
  }
  return values;
}

function matchesTravelDestination(record = {}, query = "") {
  const destinationKeys = expandTravelDestinationKeys(query);
  if (!destinationKeys.length) return true;
  const haystack = collectLocationTextCandidates(record)
    .map(normalizeLooseKey)
    .filter(Boolean)
    .join("_");
  return destinationKeys.some((destinationKey) => {
    const queryTokens = destinationKey.split("_").filter(Boolean);
    if (haystack.includes(destinationKey)) return true;
    return queryTokens.length > 0 && queryTokens.every((token) => haystack.includes(token));
  });
}

function pushRestaurantLocationText(values = [], value = "") {
  if (typeof value === "string" || typeof value === "number") {
    const text = cleanText(value);
    if (text) values.push(text);
  }
}

function appendRestaurantLocationFields(values = [], source = {}, fields = RESTAURANT_LOCATION_TEXT_FIELDS) {
  if (!source || typeof source !== "object") return;
  fields.forEach((field) => pushRestaurantLocationText(values, source[field]));
}

function collectRestaurantLocationTextCandidates(record = {}) {
  const values = [];
  appendRestaurantLocationFields(values, record);
  pushRestaurantLocationText(values, record.location);
  pushRestaurantLocationText(values, inferLocationLabelFromCoords(record));
  RESTAURANT_NESTED_LOCATION_FIELDS.forEach((field) => {
    appendRestaurantLocationFields(values, record[field], RESTAURANT_NAMED_LOCATION_TEXT_FIELDS);
  });
  if (Array.isArray(record.locations)) {
    record.locations.forEach((location) => {
      if (!location || typeof location !== "object") return;
      appendRestaurantLocationFields(values, location, RESTAURANT_NAMED_LOCATION_TEXT_FIELDS);
      pushRestaurantLocationText(values, inferLocationLabelFromCoords(location));
    });
  }
  return values;
}

function matchesRestaurantLocationText(record = {}, query = "") {
  const locationKeys = expandRestaurantLocationKeys(query);
  if (!locationKeys.length) return false;
  const haystack = collectRestaurantLocationTextCandidates(record)
    .map(normalizeLooseKey)
    .filter(Boolean)
    .join("_");
  if (!haystack) return false;
  return locationKeys.some((locationKey) => {
    const tokens = locationKey.split("_").filter(Boolean);
    return haystack.includes(locationKey) || (tokens.length > 0 && tokens.every((token) => haystack.includes(token)));
  });
}

function matchesRestaurantViewerLocation(record = {}, viewerLocation = null) {
  if (!viewerLocation) return true;
  const query = cleanText(viewerLocation.city || viewerLocation.label || "");
  if (query) {
    if (matchesRestaurantLocationText(record, query)) return true;
    return false;
  }
  const viewerCoords = normalizeLocationCoords(viewerLocation);
  const recordCoords = readCoords(record);
  if (viewerCoords && recordCoords) {
    return distanceKmBetweenCoords(viewerCoords, recordCoords) <= RESTAURANT_COORD_CITY_MAX_DISTANCE_KM;
  }
  return !query && !viewerCoords;
}

function readCoords(record = {}) {
  const candidates = [
    { lat: record.lat, lng: record.lng },
    { lat: record.latitude, lng: record.longitude },
    { lat: record.latitude, lng: record.lon },
    { lat: record._lat, lng: record._long },
    { lat: record._latitude, lng: record._longitude },
    { lat: record.gpsLat, lng: record.gpsLng },
    { lat: record.mapLat, lng: record.mapLng },
    { lat: record.geo?.lat, lng: record.geo?.lng },
    { lat: record.geo?.latitude, lng: record.geo?.longitude },
    { lat: record.geo?.latitude, lng: record.geo?.lon },
    { lat: record.coords?.lat, lng: record.coords?.lng },
    { lat: record.coords?.latitude, lng: record.coords?.longitude },
    { lat: record.coordinates?.lat, lng: record.coordinates?.lng },
    { lat: record.coordinates?.latitude, lng: record.coordinates?.longitude },
    { lat: record.coordinates?._lat, lng: record.coordinates?._long },
    { lat: record.coordinates?._latitude, lng: record.coordinates?._longitude },
    { lat: record.geoPoint?.lat, lng: record.geoPoint?.lng },
    { lat: record.geoPoint?.latitude, lng: record.geoPoint?.longitude },
    { lat: record.geoPoint?._lat, lng: record.geoPoint?._long },
    { lat: record.geoPoint?._latitude, lng: record.geoPoint?._longitude },
    { lat: record.geopoint?.lat, lng: record.geopoint?.lng },
    { lat: record.geopoint?.latitude, lng: record.geopoint?.longitude },
    { lat: record.geopoint?._lat, lng: record.geopoint?._long },
    { lat: record.geopoint?._latitude, lng: record.geopoint?._longitude },
    { lat: record.location?.lat, lng: record.location?.lng },
    { lat: record.location?.latitude, lng: record.location?.longitude },
    { lat: record.primaryLocation?.lat, lng: record.primaryLocation?.lng },
    { lat: record.primaryLocation?.latitude, lng: record.primaryLocation?.longitude },
    { lat: record.businessLocation?.lat, lng: record.businessLocation?.lng },
    { lat: record.businessLocation?.latitude, lng: record.businessLocation?.longitude }
  ];
  for (const candidate of candidates) {
    const coords = normalizeLocationCoords(candidate);
    if (coords) return coords;
  }
  if (Array.isArray(record.locations)) {
    for (const location of record.locations) {
      const coords = readCoords(location || {});
      if (coords) return coords;
    }
  }
  return null;
}

function getBusinessHours(record = {}) {
  const raw = record.openingHours || record.openHours || record.hours || record.businessHours || record.workingHours || "";
  if (typeof raw === "string" && cleanText(raw)) return cleanText(raw);
  if (raw && typeof raw === "object") {
    const values = Object.values(raw).map(cleanText).filter(Boolean);
    if (values.length) return values[0];
  }
  return "Oeffnungszeiten folgen";
}

function getBusinessPhone(record = {}) {
  return cleanText(record.phone || record.telephone || record.contactPhone || record.ownerPhone || "");
}

function getBusinessDescription(record = {}) {
  return cleanText(record.description || record.bio || record.about || record.shortDescription || "");
}

function getBusinessRating(record = {}) {
  const value = Number(record.rating ?? record.avgRating ?? record.score ?? record.publicRating ?? 0);
  if (!Number.isFinite(value) || value <= 0) return "";
  return Math.min(5, Math.max(1, value)).toFixed(1);
}

function getBusinessImage(record = {}, {
  getOptimizedImageUrl,
  resolveRestaurantLogo,
  placeholderImage = ""
} = {}) {
  const id = getBusinessId(record);
  const raw = cleanText(
    record.logoUrl
    || record.logo
    || record.logoURL
    || record.heroUrl
    || record.coverUrl
    || record.imageUrl
    || record.img
    || ""
  );
  const resolvedLogo = id && typeof resolveRestaurantLogo === "function"
    ? cleanText(resolveRestaurantLogo(id, raw, "medium"))
    : raw;
  const source = resolvedLogo || raw || placeholderImage;
  const optimized = typeof getOptimizedImageUrl === "function"
    ? cleanText(getOptimizedImageUrl(source, "medium"))
    : source;
  return optimized || placeholderImage || "";
}

function getBusinessCoverImage(record = {}, {
  getOptimizedImageUrl,
  placeholderImage = ""
} = {}) {
  const raw = cleanText(
    record.titleImageUrl
    || record.coverImageUrl
    || record.coverImage
    || record.coverUrl
    || record.heroImageUrl
    || record.heroUrl
    || record.imageUrl
    || record.bestSpotLogoUrl
    || record.spotLogoUrl
    || record.logoUrl
    || record.logo
    || ""
  );
  const source = raw || placeholderImage;
  const optimized = typeof getOptimizedImageUrl === "function"
    ? cleanText(getOptimizedImageUrl(source, "large"))
    : source;
  return optimized || placeholderImage || "";
}

function collectStringList(value) {
  if (Array.isArray(value)) {
    return value.map(cleanText).filter(Boolean);
  }
  const raw = cleanText(value);
  if (!raw) return [];
  return raw.split(/[\n,;|]/).map(cleanText).filter(Boolean);
}

function getBusinessCoverImages(record = {}, deps = {}) {
  const rawImages = [
    ...collectStringList(record.offerCoverImages),
    ...collectStringList(record.coverImages),
    ...collectStringList(record.hotelCoverImages),
    ...collectStringList(record.titleImages),
    record.offerImageUrl,
    record.titleImageUrl,
    record.coverImageUrl,
    record.coverImage,
    record.coverUrl,
    record.heroImageUrl,
    record.heroUrl,
    record.imageUrl
  ].map(cleanText).filter(Boolean);
  const unique = [];
  rawImages.forEach((image) => {
    if (!unique.includes(image)) unique.push(image);
  });
  const fallback = getBusinessCoverImage(record, deps);
  if (fallback && !unique.includes(fallback)) unique.push(fallback);
  const optimized = unique.map((image) => (
    typeof deps.getOptimizedImageUrl === "function"
      ? cleanText(deps.getOptimizedImageUrl(image, "large"))
      : image
  )).filter(Boolean);
  return optimized.length ? optimized.slice(0, 5) : [deps.placeholderImage || ""].filter(Boolean);
}

function getRestaurantCuisineLabel(record = {}) {
  return cleanText(
    record.cuisine
    || record.kitchen
    || record.foodType
    || record.categoryLabel
    || record.__marketplaceTypeLabel
    || record.type
    || record.customerType
    || ""
  );
}

function getRestaurantPriceRange(record = {}) {
  return cleanText(record.priceRange || record.priceLevel || record.priceLabel || record.budget || "");
}

function normalizeFeatureText(value, fallback = "") {
  if (typeof value === "string") return cleanText(value);
  if (value === true) return cleanText(fallback);
  return "";
}

function getRestaurantFeatureChips(record = {}) {
  const featureState = record.restaurantFeatures && typeof record.restaurantFeatures === "object"
    ? record.restaurantFeatures
    : {};
  const primary = [
    normalizeFeatureText(record.gardenTerraceText || record.gardenTerrace || record.gardenOrTerrace || featureState.gardenTerrace, "Gastgarten"),
    normalizeFeatureText(record.accessibilityText || record.barrierFreeText || record.accessibleText || record.barrierefrei || record.accessible || featureState.accessibility, "Barrierefrei"),
    normalizeFeatureText(record.veganOptionsText || record.veganOptions || record.veganText || record.vegan || featureState.veganOptions, "Vegane Optionen")
  ].filter(Boolean);
  if (primary.length) return primary.slice(0, 3);
  const fromArray = Array.isArray(record.features)
    ? record.features.map(cleanText).filter(Boolean)
    : [];
  if (fromArray.length) return fromArray.slice(0, 3);
  const raw = cleanText(record.features || record.amenities || "");
  if (!raw) return [];
  return raw.split(/[,;|]/).map(cleanText).filter(Boolean).slice(0, 3);
}

function getHotelCategoryLabel(record = {}) {
  return cleanText(
    record.hotelCategory
    || record.categoryLabel
    || record.__marketplaceTypeLabel
    || record.travelCategory
    || record.typeLabel
    || record.type
    || record.customerType
    || "Hotel"
  );
}

function formatHotelDistanceLabel(value = "", { suffix = "", directLabel = "" } = {}) {
  const raw = cleanText(value);
  if (!raw) return "";
  const key = normalizeLooseKey(raw);
  if (
    key === "direkt_im_zentrum"
    || key === "direkt_am_zentrum"
    || key === "direkt_am_strand"
    || key === "ne_qender"
    || key === "ne_plazh"
    || key === "direkt_ne_qender"
    || key === "direkt_ne_plazh"
  ) {
    return directLabel || raw;
  }
  const suffixKey = normalizeLooseKey(suffix);
  if (suffixKey && key.includes(suffixKey)) return raw;
  const match = raw.match(/(\d+(?:[.,]\d+)?)\s*(km|kilometer|m|meter)\b/i);
  if (!match || !suffix) return raw;
  return `${match[1].replace(",", ".")} ${match[2].toLowerCase().startsWith("k") ? "km" : "m"} ${suffix}`;
}

function getHotelDistanceCenter(record = {}) {
  return formatHotelDistanceLabel(
    record.distanceCenter
    || record.distanceToCenter
    || record.centerDistance
    || record.cityCenterDistance
    || record.centerDistanceLabel
    || record.zentrumEntfernung
    || record.distanceCentre
    || "",
    { suffix: "nga qendra", directLabel: "Në qendër" }
  );
}

function getHotelDistanceBeach(record = {}) {
  return formatHotelDistanceLabel(
    record.distanceBeach
    || record.distanceToBeach
    || record.beachDistance
    || record.beachDistanceLabel
    || record.strandEntfernung
    || record.lakeDistance
    || record.distanceToLake
    || "",
    { suffix: "nga plazhi", directLabel: "Në plazh" }
  );
}

function getHotelStartingPrice(record = {}) {
  const raw = cleanText(
    record.hotelStartingPrice
    || record.startingPrice
    || record.priceFrom
    || record.fromPrice
    || record.bestPrice
    || record.roomStartingPrice
    || ""
  );
  return raw.replace(/^\s*ab\s+/i, "").replace(/\s*(eur|€)\s*$/i, "").trim();
}

function normalizeHotelPriceUnit(value = "") {
  const key = normalizeLooseKey(value);
  if (key === "total" || key === "totali" || key === "gesamt") return "total";
  return "per_person";
}

function getHotelPriceUnitLabel(record = {}) {
  return normalizeHotelPriceUnit(record.priceUnit || record.hotelPriceUnit || record.offerPriceUnit || "") === "total"
    ? "Totali"
    : "p.P";
}

function getTravelOfferPriceSuffix(record = {}) {
  return normalizeHotelPriceUnit(record.priceUnit || record.hotelPriceUnit || record.offerPriceUnit || "") === "total"
    ? "Totali"
    : "Për person";
}

function getTravelOfferBadgeLabel(record = {}) {
  const raw = cleanText(record.offerBadgeLabel || record.travelOfferBadgeLabel || record.badgeLabel || "Ofertë");
  const key = normalizeLooseKey(raw);
  if (!raw || key === "oferta" || key === "oferte") return "Ofertë";
  return raw;
}

function getTravelOfferDurationLabel(record = {}) {
  return cleanText(record.offerDurationLabel || record.nightsDaysLabel || record.durationLabel || "");
}

function getTravelOfferDestinationLabel(record = {}) {
  return cleanText(
    record.offerDestination
    || record.destination
    || record.travelDestination
    || record.city
    || record.locationCity
    || record.primaryCity
    || getBusinessLocationLabel(record)
  );
}

function getTravelOfferDescription(record = {}) {
  return cleanText(
    record.offerText
    || record.offerDescription
    || record.text
    || record.description
    || record.bio
    || record.about
    || ""
  );
}

function collectTravelOfferDetailList(record = {}) {
  const rawItems = [
    record.offerDetails,
    record.offerDetailItems,
    record.includedServices,
    record.inclusions,
    record.packageIncludes,
    record.includes
  ];
  const details = [];
  rawItems.forEach((value) => {
    if (Array.isArray(value)) {
      value.map(cleanText).filter(Boolean).forEach((entry) => {
        if (!details.includes(entry)) details.push(entry);
      });
      return;
    }
    if (typeof value === "string") {
      collectStringList(value).forEach((entry) => {
        if (!details.includes(entry)) details.push(entry);
      });
    }
  });
  if (details.length) return details.slice(0, 8);
  return getHotelFeatureChips(record).slice(0, 6);
}

function getHotelFeatureChips(record = {}) {
  if (record.__travelOffer === true) {
    const travelFeatures = [
      ...collectStringList(record.offerFeatures),
      ...collectStringList(record.features),
      ...collectStringList(record.hotelFeatures)
    ];
    if (travelFeatures.length) return travelFeatures.slice(0, 6);
  }
  const explicit = [
    record.hotelFeatureOneText,
    record.hotelFeatureTwoText,
    record.hotelFeatureThreeText
  ].map(cleanText).filter(Boolean);
  const custom = [
    ...collectStringList(record.features),
    ...collectStringList(record.hotelFeatures)
  ].filter(Boolean);
  const combined = [];
  [...explicit, ...custom].forEach((feature) => {
    if (feature && !combined.includes(feature)) combined.push(feature);
  });
  if (combined.length) return combined.slice(0, 6);
  const fromRestaurantFields = getRestaurantFeatureChips(record);
  if (fromRestaurantFields.length) return fromRestaurantFields.slice(0, 3);
  const fromAmenities = collectStringList(record.hotelAmenities || record.amenities || record.facilities);
  return fromAmenities.slice(0, 3);
}

function resolveHotelFeatureIconName(feature = "") {
  const key = normalizeLooseKey(feature);
  if (/(mengjes|gjysme|pension|inclusive|restorant|ushqim|fruehstueck|breakfast|food)/.test(key)) return "utensils";
  if (/(shezlong|plazh|strand|beach|lounger)/.test(key)) return "waves";
  if (/(parking|parkplatz|garage|garazh)/.test(key)) return "parking";
  return "check";
}

function renderHotelFeatureChip(feature = "", deps = {}, className = "") {
  const escapeHtml = deps.escapeHtml;
  const safeFeature = cleanText(feature);
  if (!safeFeature) return "";
  const chipClass = className || "text-[9px] font-semibold bg-slate-50 text-slate-500 px-2.5 py-0.5 rounded-md border border-slate-100";
  const iconName = resolveHotelFeatureIconName(safeFeature);
  return `
    <span class="${chipClass} inline-flex items-center gap-1.5">
      ${renderRestaurantCardIcon(iconName, "w-3 h-3 shrink-0", deps)}
      <span>${escapeHtml(safeFeature)}</span>
    </span>
  `;
}

function renderRestaurantCardIcon(name = "", className = "", deps = {}) {
  const icon = deps.icon;
  const escapeHtml = deps.escapeHtml;
  const safeClassName = cleanText(className);
  const classAttr = safeClassName ? ` class="${escapeHtml(safeClassName)}"` : "";
  const svgAttrs = `xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"${classAttr} aria-hidden="true" focusable="false"`;
  if (name === "share-2") {
    return `<svg ${svgAttrs}><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><path d="m8.59 13.51 6.83 3.98"></path><path d="m15.41 6.51-6.82 3.98"></path></svg>`;
  }
  if (name === "phone") {
    return `<svg ${svgAttrs}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>`;
  }
  if (name === "book-open") {
    return `<svg ${svgAttrs}><path d="M12 7v14"></path><path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"></path></svg>`;
  }
  if (name === "navigation") {
    return `<svg ${svgAttrs}><polygon points="3 11 22 2 13 21 11 13 3 11"></polygon></svg>`;
  }
  if (name === "waves") {
    return `<svg ${svgAttrs}><path d="M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"></path><path d="M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"></path><path d="M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"></path></svg>`;
  }
  if (name === "utensils") {
    return `<svg ${svgAttrs}><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"></path><path d="M7 2v20"></path><path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"></path></svg>`;
  }
  if (name === "star") {
    return `<svg ${svgAttrs}><path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.12 2.12 0 0 0 1.595 1.16l5.166.751a.53.53 0 0 1 .294.904l-3.738 3.644a2.12 2.12 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.12 2.12 0 0 0-1.973 0L6.393 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.12 2.12 0 0 0-.611-1.879L2.155 9.79a.53.53 0 0 1 .294-.906l5.165-.75a2.12 2.12 0 0 0 1.596-1.16z"></path></svg>`;
  }
  if (name === "user") {
    return `<svg ${svgAttrs}><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>`;
  }
  if (name === "parking" || name === "square-parking") {
    return `<svg ${svgAttrs}><rect width="18" height="18" x="3" y="3" rx="2"></rect><path d="M9 17V7h5a3 3 0 0 1 0 6H9"></path></svg>`;
  }
  if (name === "check") {
    return `<svg ${svgAttrs}><path d="M20 6 9 17l-5-5"></path></svg>`;
  }
  return typeof icon === "function" ? icon(name, className) : "";
}

function getBusinessSortScore(record = {}) {
  const rating = Number(record.rating ?? record.avgRating ?? record.publicRating ?? 0);
  const score = Number(record.score ?? record.publicScore ?? 0);
  const followers = Number(record.followersCount ?? record.followerCount ?? 0);
  const posts = Number(record.postsCount ?? record.postCount ?? 0);
  const updated = Number(record.updatedAt?.seconds || record.createdAt?.seconds || 0);
  return (Number.isFinite(rating) ? rating * 1000 : 0)
    + (Number.isFinite(score) ? score : 0)
    + (Number.isFinite(followers) ? Math.min(followers, 500) : 0)
    + (Number.isFinite(posts) ? Math.min(posts, 200) : 0)
    + (Number.isFinite(updated) ? Math.min(updated / 100000, 100) : 0);
}

function collectMarketplaceBusinesses(state = {}, deps = {}) {
  const byId = new Map();
  const addRecord = (record = {}) => {
    if (!record || typeof record !== "object") return;
    const id = getBusinessId(record);
    if (!id) return;
    const previous = byId.get(id) || {};
    byId.set(id, { ...previous, ...record, id });
  };
  (Array.isArray(state.bootstrapRestaurantPreview) ? state.bootstrapRestaurantPreview : []).forEach(addRecord);
  (Array.isArray(state.restaurants) ? state.restaurants : []).forEach(addRecord);
  return Array.from(byId.values())
    .map((record) => ({
      ...record,
      __marketplaceSection: resolveMarketplaceSectionForBusinessCore(record, deps),
      __marketplaceScore: getBusinessSortScore(record)
    }))
    .filter((record) => record.__marketplaceSection)
    .sort((a, b) => b.__marketplaceScore - a.__marketplaceScore || getBusinessName(a).localeCompare(getBusinessName(b)));
}

export function filterMarketplaceBusinessesCore(state = {}, sectionKey = "", deps = {}) {
  const section = normalizeSectionKey(sectionKey);
  return collectMarketplaceBusinesses(state, deps)
    .filter((record) => record.__marketplaceSection === section);
}

function renderImage(url = "", alt = "", {
  escapeHtml,
  isPlaceholderUrl,
  extraClass = ""
} = {}) {
  const safeUrl = cleanText(url);
  const usePlaceholder = !safeUrl || (typeof isPlaceholderUrl === "function" && isPlaceholderUrl(safeUrl));
  return `
    <img
      src="${escapeHtml(safeUrl)}"
      alt="${escapeHtml(alt)}"
      loading="lazy"
      class="w-full h-full object-cover bg-slate-100 ${extraClass}"
      ${usePlaceholder ? 'data-placeholder-image="true"' : ""}
    />
  `;
}

function renderBestCard(record = {}, deps = {}) {
  const escapeHtml = deps.escapeHtml;
  const icon = deps.icon;
  const name = getBusinessName(record);
  const id = getBusinessId(record);
  const image = getBusinessImage(record, deps);
  const rating = getBusinessRating(record);
  const location = getBusinessLocationLabel(record);
  return `
    <button type="button" data-marketplace-open-business="${escapeHtml(id)}" class="shrink-0 w-44 text-left rounded-[2rem] overflow-hidden bg-white border border-slate-100 shadow-sm active:scale-[0.98] transition-transform">
      <div class="h-28 bg-slate-100 overflow-hidden">
        ${renderImage(image, name, deps)}
      </div>
      <div class="p-4">
        <div class="flex items-center justify-between gap-2 mb-2">
          <span class="text-[9px] font-black text-indigo-600 uppercase tracking-widest line-clamp-1">${escapeHtml(record.__marketplaceTypeLabel || "Top")}</span>
          ${rating ? `<span class="text-[10px] font-black text-amber-500 flex items-center gap-1">${icon("star", "w-3 h-3 fill-current")} ${escapeHtml(rating)}</span>` : ""}
        </div>
        <h3 class="text-sm font-black text-slate-900 leading-tight line-clamp-2">${escapeHtml(name)}</h3>
        <p class="mt-2 text-[10px] font-bold text-slate-400 leading-4 line-clamp-1">${escapeHtml(location)}</p>
      </div>
    </button>
  `;
}

function normalizeAdStatus(value = "") {
  const key = cleanText(value).toLowerCase();
  if (key === "approved" || key === "accepted" || key === "active") return "approved";
  if (key === "rejected" || key === "declined" || key === "denied") return "rejected";
  return "pending";
}

function getApprovedRestaurantAds(record = {}) {
  const items = Array.isArray(record.publicAds)
    ? record.publicAds
    : (Array.isArray(record.restaurantAds) ? record.restaurantAds : []);
  return items.filter((item) => (
    item
    && item.active !== false
    && normalizeAdStatus(item.status || item.approvalStatus || "") === "approved"
  ));
}

function collectApprovedRestaurantAdCards(items = []) {
  return (Array.isArray(items) ? items : [])
    .flatMap((record) => getApprovedRestaurantAds(record).map((ad, index) => ({ record, ad, index })))
    .slice(0, BEST_LIMIT);
}

function renderRestaurantAdImageFallback(record = {}, title = "", deps = {}) {
  const escapeHtml = deps.escapeHtml;
  const logoImage = getBusinessImage(record, deps);
  const fallbackLabel = cleanText(title || getBusinessName(record) || "Premium Highlight");
  const categoryLabel = cleanText(record.__marketplaceTypeLabel || "Restaurant");
  if (logoImage) {
    return `
      <div class="w-full h-full bg-[#fdfdfd] flex flex-col items-center justify-center p-4 border-b border-slate-100" style="background:#fdfdfd;padding:1rem;border-bottom:1px solid #f1f5f9;">
        <img
          src="${escapeHtml(logoImage)}"
          alt="${escapeHtml(`${fallbackLabel} Logo`)}"
          loading="lazy"
          decoding="async"
          class="w-28 h-28 rounded-full border border-slate-100 bg-white object-contain"
          style="width:7rem;height:7rem;border-radius:9999px;border:1px solid #f1f5f9;background:#fff;object-fit:contain;padding:0.65rem;"
        />
        <span class="text-[10px] font-black tracking-widest text-[#a37f4c] uppercase mt-2 line-clamp-1" style="font-size:10px;font-weight:900;letter-spacing:0.1em;color:#a37f4c;text-transform:uppercase;margin-top:0.5rem;max-width:80%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">
          ${escapeHtml(fallbackLabel)}
        </span>
      </div>
    `;
  }
  return `
    <div class="w-full h-full bg-[#fdfdfd] flex flex-col items-center justify-center p-4 border-b border-slate-100" style="background:#fdfdfd;padding:1rem;border-bottom:1px solid #f1f5f9;">
      ${renderRestaurantCardIcon("utensils", "w-12 h-12 text-amber-500 mb-1.5", deps)}
      <span class="text-[10px] font-black tracking-widest text-[#a37f4c] uppercase mt-1" style="font-size:10px;font-weight:900;letter-spacing:0.1em;color:#a37f4c;text-transform:uppercase;margin-top:0.25rem;">
        ${escapeHtml(categoryLabel)}
      </span>
    </div>
  `;
}

function renderRestaurantAdCard(entry = {}, deps = {}) {
  const escapeHtml = deps.escapeHtml;
  const cardIcon = (name, className) => renderRestaurantCardIcon(name, className, deps);
  const record = entry.record || {};
  const ad = entry.ad || {};
  const id = getBusinessId(record);
  const businessName = getBusinessName(record);
  const title = cleanText(ad.title || businessName);
  const category = cleanText(ad.category || getRestaurantCuisineLabel(record) || record.__marketplaceTypeLabel || "RESTAURANT").toUpperCase();
  const rating = getBusinessRating(record) || "0.0";
  const priceSegment = cleanText(ad.priceSegment || getRestaurantPriceRange(record) || "€€ - €€€");
  const rawImage = cleanText(ad.imageUrl || getBusinessCoverImage(record, deps));
  const image = typeof deps.getOptimizedImageUrl === "function"
    ? cleanText(deps.getOptimizedImageUrl(rawImage, "large"))
    : rawImage;
  const cropX = Math.max(0, Math.min(100, Number(ad.cropX ?? 50) || 50));
  const cropY = Math.max(0, Math.min(100, Number(ad.cropY ?? 50) || 50));
  const showBestChoice = ad.bestChoiceBadgeEnabled !== false;
  const showDelivery = ad.deliveryBadgeEnabled !== false;
  const showWolt = ad.woltEnabled !== false;
  return `
    <article class="w-72 h-[24rem] flex-shrink-0 bg-white rounded-[1.5rem] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col overflow-hidden border border-slate-100 snap-start relative group" style="width:min(18rem, calc(100vw - 4.5rem));height:24rem;flex:0 0 auto;border-radius:1.5rem;border:1px solid #f1f5f9;background:#fff;">
      <div class="relative h-44 flex-shrink-0 overflow-hidden bg-slate-100" style="height:11rem;flex:0 0 auto;background:#f1f5f9;">
        ${image ? `
          <img
            src="${escapeHtml(image)}"
            alt="${escapeHtml(title)}"
            loading="lazy"
            decoding="async"
            class="w-full h-full object-cover"
            style="width:100%;height:100%;object-fit:cover;object-position:${cropX}% ${cropY}%;"
          />
        ` : renderRestaurantAdImageFallback(record, title, deps)}

        ${(showBestChoice || showDelivery) ? `
          <div class="absolute top-3 right-3 flex flex-col gap-1 w-[82px] z-10" style="top:0.75rem;right:0.75rem;width:82px;gap:0.25rem;z-index:10;">
            ${showBestChoice ? `<span class="bg-[#c5a059] text-white text-[6.5px] font-black uppercase tracking-wider h-[18px] flex items-center justify-center rounded-md border border-white/5 shadow-none" style="height:18px;border-radius:0.375rem;background:#c5a059;color:#fff;font-size:6.5px;font-weight:900;letter-spacing:0.05em;text-transform:uppercase;border:1px solid rgba(255,255,255,0.05);">Best Choice</span>` : ""}
            ${showDelivery ? `<span class="bg-[#1f5f4c] text-white text-[6.5px] font-black uppercase tracking-wider h-[18px] flex items-center justify-center rounded-md border border-white/5 shadow-none" style="height:18px;border-radius:0.375rem;background:#1f5f4c;color:#fff;font-size:6.5px;font-weight:900;letter-spacing:0.05em;text-transform:uppercase;border:1px solid rgba(255,255,255,0.05);">For Delivery</span>` : ""}
          </div>
        ` : ""}

        ${showWolt ? `
          <div class="absolute bottom-4 left-4 bg-[#00b4d8] text-white h-[25px] px-3.5 rounded-md flex items-center justify-center border border-cyan-400/20 z-10 shadow-none" style="bottom:1rem;left:1rem;height:25px;padding-left:0.875rem;padding-right:0.875rem;border-radius:0.375rem;background:#00b4d8;color:#fff;border:1px solid rgba(34,211,238,0.2);z-index:10;">
            <span class="font-sans font-black tracking-widest text-[9px] uppercase" style="font-size:9px;font-weight:900;letter-spacing:0.1em;text-transform:uppercase;">WOLT</span>
          </div>
        ` : ""}
      </div>

      <div class="px-5 flex-1 flex flex-col bg-white" style="padding-left:1.25rem;padding-right:1.25rem;flex:1 1 0%;display:flex;flex-direction:column;background:#fff;">
        <div class="flex-1 flex flex-col justify-center pt-4 pb-4" style="flex:1 1 0%;display:flex;flex-direction:column;justify-content:center;padding-top:1rem;padding-bottom:1rem;min-height:0;">
          <span class="text-[10px] font-extrabold text-[#c5a059] tracking-widest uppercase block mb-0.5 line-clamp-1" style="font-size:10px;font-weight:800;color:#c5a059;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:0.125rem;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${escapeHtml(category)}</span>
          <h3 class="text-xl font-extrabold text-slate-800 line-clamp-1 group-hover:text-slate-900 transition-colors duration-200" style="font-size:1.25rem;line-height:1.75rem;font-weight:800;color:#1e293b;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${escapeHtml(title)}</h3>
        </div>

        <div class="flex items-center justify-between text-[10px] text-slate-600 font-semibold border-t border-slate-100 pt-3.5 pb-5" style="display:flex;align-items:center;justify-content:space-between;font-size:10px;color:#475569;font-weight:600;border-top:1px solid #f1f5f9;padding-top:0.875rem;padding-bottom:1.25rem;gap:0.625rem;">
          <div class="flex items-center justify-center gap-1 bg-slate-50 rounded-md border border-slate-100/50" style="width:88px;height:24px;border-radius:0.375rem;background:#f8fafc;border:1px solid rgba(241,245,249,0.5);display:flex;align-items:center;justify-content:center;gap:0.25rem;min-width:0;">
            ${cardIcon("star", "w-3 h-3 text-amber-500 fill-amber-500 flex-shrink-0")}
            <span class="font-bold text-slate-800">${escapeHtml(rating)}</span>
          </div>
          <div class="flex items-center justify-center gap-1 bg-slate-50 rounded-md border border-slate-100/50" style="width:88px;height:24px;border-radius:0.375rem;background:#f8fafc;border:1px solid rgba(241,245,249,0.5);display:flex;align-items:center;justify-content:center;gap:0.25rem;min-width:0;">
            ${cardIcon("utensils", "w-3 h-3 text-slate-400 flex-shrink-0")}
            <span class="font-bold text-[10px] truncate" style="font-size:10px;font-weight:700;max-width:60px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${escapeHtml(priceSegment)}</span>
          </div>
        </div>

        <div class="pb-6" style="padding-bottom:1.5rem;">
          <button type="button" data-marketplace-open-business="${escapeHtml(id)}" data-tab="profile" class="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 rounded-xl transition-all text-xs flex items-center justify-center gap-2 shadow-sm active:scale-[0.98]" style="width:100%;background:#0f172a;color:#fff;font-weight:700;padding-top:0.875rem;padding-bottom:0.875rem;border-radius:0.75rem;font-size:0.75rem;line-height:1rem;display:flex;align-items:center;justify-content:center;gap:0.5rem;">
            ${cardIcon("user", "w-3.5 h-3.5 text-slate-300")}
            <span>Shiko profilin</span>
          </button>
        </div>
      </div>
    </article>
  `;
}

function renderListCard(record = {}, deps = {}) {
  const escapeHtml = deps.escapeHtml;
  const icon = deps.icon;
  const name = getBusinessName(record);
  const id = getBusinessId(record);
  const image = getBusinessImage(record, deps);
  const rating = getBusinessRating(record);
  const location = getBusinessLocationLabel(record);
  const hours = getBusinessHours(record);
  const description = getBusinessDescription(record);
  const typeLabel = cleanText(record.__marketplaceTypeLabel || record.type || record.customerType || "");
  return `
    <article class="bg-white border border-slate-100 rounded-[2rem] shadow-sm overflow-hidden">
      <button type="button" data-marketplace-open-business="${escapeHtml(id)}" class="w-full text-left active:scale-[0.99] transition-transform">
        <div class="h-48 bg-slate-100 overflow-hidden">
          ${renderImage(image, name, deps)}
        </div>
        <div class="p-5">
          <div class="flex items-start justify-between gap-4">
            <div class="min-w-0">
              ${typeLabel ? `<p class="text-[9px] font-black text-indigo-600 uppercase tracking-widest mb-1">${escapeHtml(typeLabel)}</p>` : ""}
              <h3 class="text-lg font-black tracking-tight text-slate-900 leading-tight">${escapeHtml(name)}</h3>
            </div>
            ${rating ? `<span class="shrink-0 px-2.5 py-1 rounded-xl bg-amber-50 text-amber-600 text-[10px] font-black flex items-center gap-1">${icon("star", "w-3 h-3 fill-current")} ${escapeHtml(rating)}</span>` : ""}
          </div>
          ${description ? `<p class="mt-3 text-xs font-semibold text-slate-500 leading-5 line-clamp-2">${escapeHtml(description)}</p>` : ""}
          <div class="mt-4 grid grid-cols-1 gap-2 text-[11px] font-bold text-slate-500">
            <div class="flex items-center gap-2 min-w-0">
              ${icon("map-pin", "w-3.5 h-3.5 text-slate-400 shrink-0")}
              <span class="truncate">${escapeHtml(location)}</span>
            </div>
            <div class="flex items-center gap-2 min-w-0">
              ${icon("clock", "w-3.5 h-3.5 text-slate-400 shrink-0")}
              <span class="truncate">${escapeHtml(hours)}</span>
            </div>
          </div>
        </div>
      </button>
    </article>
  `;
}

function readShoppingList(value) {
  if (Array.isArray(value)) return value.map(cleanText).filter(Boolean);
  const raw = cleanText(value);
  if (!raw) return [];
  return raw.split(/[\n,;|]/).map(cleanText).filter(Boolean);
}

function getShoppingProductId(product = {}) {
  return cleanText(product.id || product.productId || product.menuItemId || product.itemId || "");
}

function getShoppingProductName(product = {}) {
  return cleanText(product.name || product.title || product.productName || "Produkt");
}

function readShoppingProductImageCandidate(entry) {
  if (!entry) return "";
  if (typeof entry === "string") return cleanText(entry);
  if (typeof entry !== "object") return cleanText(entry);
  return cleanText(
    entry.url
    || entry.src
    || entry.cdnUrl
    || entry.imageUrl
    || entry.image
    || entry.photoUrl
    || entry.thumbnail
    || ""
  );
}

function getShoppingProductSourceImages(product = {}) {
  const candidates = [
    ...(Array.isArray(product.imageUrls) ? product.imageUrls : []),
    ...(Array.isArray(product.images) ? product.images : []),
    product.imageUrl,
    product.image,
    product.photoUrl,
    product.coverUrl,
    product.img,
    product.thumbnail
  ].map(readShoppingProductImageCandidate).filter(Boolean);
  return candidates.filter((entry, index) => candidates.indexOf(entry) === index);
}

function getShoppingProductCardImageRaw(product = {}) {
  return cleanText(
    product.cardImageUrl
    || product.shoppingCardImageUrl
    || product.shoppingLandingImageUrl
    || product.productCardImageUrl
    || ""
  );
}

function getShoppingProductImage(product = {}, deps = {}) {
  const source = getShoppingProductCardImageRaw(product) || getShoppingProductSourceImages(product)[0] || "";
  if (!source) return "";
  return typeof deps.getOptimizedImageUrl === "function"
    ? cleanText(deps.getOptimizedImageUrl(source, "medium"))
    : source;
}

function formatShoppingProductPrice(product = {}) {
  const explicit = cleanText(product.priceLabel || product.displayPrice || product.formattedPrice || "");
  if (explicit) return explicit;
  const value = Number(product.price ?? product.amount ?? 0);
  if (!Number.isFinite(value) || value <= 0) return "";
  const currency = cleanText(product.currency || product.currencyCode || "€");
  const normalized = value % 1 === 0 ? String(value) : value.toFixed(2).replace(".", ",");
  return currency === "EUR" || currency === "€" ? `${normalized} €` : `${normalized} ${currency}`;
}

function buildShoppingProductSnapshot(product = {}, deps = {}, restaurantId = "") {
  const id = getShoppingProductId(product);
  if (!id) return null;
  const imageUrls = getShoppingProductSourceImages(product);
  const imageUrl = imageUrls[0] || "";
  return {
    id,
    restaurantId,
    name: getShoppingProductName(product),
    title: getShoppingProductName(product),
    description: cleanText(product.description || product.text || ""),
    category: cleanText(product.category || product.type || ""),
    price: product.price ?? "",
    priceLabel: formatShoppingProductPrice(product),
    currency: cleanText(product.currency || product.currencyCode || ""),
    cardImageUrl: getShoppingProductCardImageRaw(product),
    imageUrl,
    imageUrls,
    type: cleanText(product.type || "food") || "food",
    catalogMode: "shop",
    restaurantType: "ecommerce",
    customerType: "ecommerce"
  };
}

function mergeShoppingProductSnapshot(base = {}, next = {}) {
  const imageUrls = [
    ...(Array.isArray(base.imageUrls) ? base.imageUrls : []),
    base.imageUrl,
    ...(Array.isArray(next.imageUrls) ? next.imageUrls : []),
    next.imageUrl
  ].map(readShoppingProductImageCandidate).filter(Boolean)
    .filter((entry, index, list) => list.indexOf(entry) === index);
  return {
    ...next,
    ...base,
    imageUrl: imageUrls[0] || base.imageUrl || next.imageUrl || "",
    imageUrls,
    cardImageUrl: cleanText(base.cardImageUrl || next.cardImageUrl || "")
  };
}

function collectShoppingProductSources(record = {}) {
  const card = record.shoppingLandingCard && typeof record.shoppingLandingCard === "object"
    ? record.shoppingLandingCard
    : {};
  return [
    ...(Array.isArray(card.products) ? card.products : []),
    ...(Array.isArray(record.shoppingLandingProducts) ? record.shoppingLandingProducts : []),
    ...(Array.isArray(record.landingProducts) ? record.landingProducts : []),
    ...(Array.isArray(record.productPreview) ? record.productPreview : []),
    ...(Array.isArray(record.productsPreview) ? record.productsPreview : []),
    ...(Array.isArray(record.publicMenuItems) ? record.publicMenuItems : []),
    ...(Array.isArray(record.menuItems) ? record.menuItems : [])
  ].filter((item) => item && typeof item === "object");
}

function getShoppingLandingProductIds(record = {}) {
  const card = record.shoppingLandingCard && typeof record.shoppingLandingCard === "object"
    ? record.shoppingLandingCard
    : {};
  const ids = [
    ...readShoppingList(card.productIds),
    ...readShoppingList(record.shoppingLandingCardProductIds),
    ...readShoppingList(record.shoppingLandingProductIds)
  ];
  return ids.filter((id, index) => ids.indexOf(id) === index);
}

function collectShoppingLandingProducts(record = {}, deps = {}) {
  const restaurantId = getBusinessId(record);
  const byId = new Map();
  collectShoppingProductSources(record).forEach((product) => {
    const snapshot = buildShoppingProductSnapshot(product, deps, restaurantId);
    if (!snapshot?.id) return;
    if (byId.has(snapshot.id)) {
      byId.set(snapshot.id, mergeShoppingProductSnapshot(byId.get(snapshot.id), snapshot));
      return;
    }
    byId.set(snapshot.id, snapshot);
  });
  const all = Array.from(byId.values());
  if (!all.length) return [];
  const selectedIds = getShoppingLandingProductIds(record);
  if (!selectedIds.length) return all.slice(0, 4);
  const selected = selectedIds.map((id) => byId.get(id)).filter(Boolean);
  return (selected.length ? selected : all).slice(0, 4);
}

function getShoppingLandingCard(record = {}, deps = {}) {
  const card = record.shoppingLandingCard && typeof record.shoppingLandingCard === "object"
    ? record.shoppingLandingCard
    : {};
  if (card.active === false || record.shoppingLandingCardEnabled === false) return null;
  const name = getBusinessName(record);
  const logoImage = getBusinessImage(record, deps);
  const rawHero = cleanText(
    card.imageUrl
    || card.heroImageUrl
    || record.shoppingLandingCardImageUrl
    || record.shoppingLandingImageUrl
    || ""
  );
  const heroImage = rawHero
    ? (typeof deps.getOptimizedImageUrl === "function" ? cleanText(deps.getOptimizedImageUrl(rawHero, "large")) : rawHero)
    : logoImage;
  const title = cleanText(card.title || record.shoppingLandingCardTitle || record.landingCardTitle || name);
  const mainText = cleanText(card.subtitle || card.text || record.shoppingLandingCardSubtitle || record.categoryLabel || "");
  return {
    id: getBusinessId(record),
    title,
    brand: name,
    heroImage,
    logoImage,
    mainText,
    products: collectShoppingLandingProducts(record, deps)
  };
}

function renderShoppingLandingHero(card = {}, deps = {}) {
  const escapeHtml = deps.escapeHtml;
  if (card.heroImage) {
    return `
      <img
        src="${escapeHtml(card.heroImage)}"
        alt="${escapeHtml(card.title || card.brand)}"
        loading="lazy"
        decoding="async"
        class="absolute inset-0 w-full h-full object-cover"
      />
    `;
  }
  return `
    <div class="absolute inset-0 bg-slate-100"></div>
  `;
}

function renderShoppingProductVisual(product = {}, deps = {}) {
  const escapeHtml = deps.escapeHtml;
  const name = getShoppingProductName(product);
  const image = getShoppingProductImage(product, deps);
  const payload = escapeHtml(JSON.stringify(product));
  const id = getShoppingProductId(product);
  const restaurantId = cleanText(product.restaurantId || "");
  return `
    <button
      type="button"
      data-menu-open="${escapeHtml(id)}"
      data-menu-open-source="marketplace"
      data-menu-open-restaurant="${escapeHtml(restaurantId)}"
      data-menu-open-product="${payload}"
      class="flex-shrink-0 rounded-2xl shadow-sm border border-slate-100 cursor-pointer flex items-center justify-center relative overflow-hidden bg-white outline-none focus:outline-none focus-visible:outline-none focus:ring-0"
      style="width:62%;height:12.25rem;scroll-snap-align:start;outline:none;-webkit-tap-highlight-color:transparent;"
      aria-label="${escapeHtml(name)}"
    >
      ${image ? `
        <img src="${escapeHtml(image)}" alt="${escapeHtml(name)}" loading="lazy" decoding="async" class="w-full h-full object-cover" />
      ` : `
        <span class="text-4xl font-black text-slate-300">${escapeHtml(name.slice(0, 1).toUpperCase() || "S")}</span>
      `}
      ${product.oldPrice || product.compareAtPrice ? `
        <span class="absolute top-2 right-2 bg-rose-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-lg leading-none shadow-sm">%</span>
      ` : ""}
    </button>
  `;
}

function renderShoppingLandingCard(record = {}, deps = {}) {
  const escapeHtml = deps.escapeHtml;
  const icon = deps.icon;
  const card = getShoppingLandingCard(record, deps);
  if (!card?.id) return "";
  return `
    <article class="flex flex-col group" data-shopping-card data-shopping-search-text="${escapeHtml(`${card.brand} ${card.title}`.toLowerCase())}">
      <div class="relative rounded-2xl flex flex-col items-center justify-center overflow-hidden p-3 shadow-sm hover:shadow-md transition-all duration-300 bg-slate-100" style="height:11.5rem;">
        ${renderShoppingLandingHero(card, deps)}
        ${card.logoImage ? `
          <div class="absolute top-2 right-2 z-20 w-9 h-9 rounded-2xl bg-white border border-white/70 shadow-sm overflow-hidden" aria-hidden="true">
            <img src="${escapeHtml(card.logoImage)}" alt="" loading="lazy" decoding="async" class="w-full h-full object-cover" />
          </div>
        ` : ""}
      </div>

      ${card.products.length ? `
        <div class="mt-2 px-2.5 overflow-hidden" style="margin-left:-0.625rem;margin-right:-0.625rem;">
          <div class="flex gap-2.5 overflow-x-auto hide-scrollbar py-1 px-0.5" style="-webkit-overflow-scrolling:touch;scrollbar-width:none;scroll-behavior:smooth;scroll-snap-type:x mandatory;">
            ${card.products.map((product) => renderShoppingProductVisual(product, deps)).join("")}
          </div>
        </div>
      ` : ""}

      <div class="mt-2 px-0.5 flex flex-col">
        <div class="flex flex-col gap-1">
          <span class="text-[10px] font-bold text-slate-400 uppercase tracking-tight truncate leading-tight">${escapeHtml(card.brand)}</span>
          <div class="flex items-center justify-between gap-1.5">
            <span class="text-[12px] font-bold text-slate-800 leading-tight">Më shumë</span>
            <button
              type="button"
              data-marketplace-open-business="${escapeHtml(card.id)}"
              data-tab="profile"
              class="w-6 h-6 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-all duration-300 active:scale-95 flex-shrink-0"
              aria-label="Hap dyqanin"
            >
              ${icon("chevron-right", "w-4 h-4")}
            </button>
          </div>
        </div>
      </div>
    </article>
  `;
}

function renderShoppingBrandIntroCard(deps = {}) {
  const escapeHtml = deps.escapeHtml;
  return `
    <style>
      .shopping-brand-intro-card .text-slider-wrapper {
        position: relative;
        height: 1.08em;
        width: 100%;
        overflow: hidden;
        margin-bottom: 0.04rem;
      }
      .shopping-brand-intro-card .text-slide-item {
        position: absolute;
        inset: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        white-space: nowrap;
        opacity: 0;
        animation: shoppingBrandIntroTextFadeSlide 24s ease-in-out infinite;
        will-change: transform, opacity;
      }
      @keyframes shoppingBrandIntroTextFadeSlide {
        0% { opacity: 0; transform: translateY(100%); }
        2%, 10.5% { opacity: 1; transform: translateY(0); }
        12.5%, 100% { opacity: 0; transform: translateY(-100%); }
      }
    </style>
    <article
      class="shopping-brand-intro-card flex items-center justify-center text-center shadow-sm overflow-hidden"
      style="width:100%;min-height:12.75rem;border-radius:1rem;background:${SHOPPING_BRAND_INTRO_COLOR};color:#ffffff;padding:1.15rem 0.75rem;"
      aria-label="Shopping Brand"
    >
      <div class="w-full" style="font-weight:900;letter-spacing:0;line-height:1.08;font-size:1.65rem;">
        <div class="text-slider-wrapper">
          ${SHOPPING_BRAND_INTRO_LINES.map((line, index) => `
            <div class="text-slide-item" style="animation-delay:${index * 3}s;">
              ${escapeHtml(line)}
            </div>
          `).join("")}
        </div>
        <div style="font-weight:900;color:#ffffff;">SHOP</div>
      </div>
    </article>
  `;
}

function renderShoppingView({ state, dataLoaded, section, deps } = {}) {
  const icon = deps.icon;
  const items = filterMarketplaceBusinessesCore(state, section.key, deps)
    .slice(0, LIST_LIMIT)
    .map((record) => withTypeLabel({
      ...record,
      __marketplaceType: resolveBusinessType(record, deps)
    }, section));
  const loaded = dataLoaded?.restaurants === true;
  if (!items.length) {
    return `
      <section data-shopping-view class="p-6 pb-24 animate-in slide-in-from-right-10 duration-500">
        ${loaded ? renderEmptyState(section, deps) : renderDataLoadingState(section, deps)}
      </section>
    `;
  }
  const left = [];
  const right = [];
  items.forEach((record, index) => {
    const markup = renderShoppingLandingCard(record, deps);
    if (!markup) return;
    (index % 2 === 0 ? left : right).push(markup);
  });
  const hasRenderedShoppingCards = left.length + right.length > 0;
  return `
    <section data-shopping-view class="min-h-full bg-slate-50 text-slate-900 animate-in slide-in-from-right-10 duration-500">
      <header class="sticky top-0 z-30 bg-slate-50/95 backdrop-blur-md px-4 pt-6 pb-4 h-16 flex items-center justify-between overflow-hidden">
        <div data-shopping-search-title class="transition-all duration-300 ease-in-out flex-shrink-0 opacity-100" style="max-width:80%;">
          <h1 class="text-[13px] font-black text-slate-800 tracking-tight whitespace-nowrap uppercase">Zbulo dyqanet me te mira</h1>
        </div>
        <div data-shopping-search-shell class="flex items-center transition-all duration-300 ease-in-out w-9">
          <button type="button" data-shopping-search-toggle class="p-2 hover:bg-slate-200 rounded-full text-slate-700 transition-all ml-auto active:scale-90 outline-none focus:outline-none focus-visible:outline-none focus:ring-0" style="outline:none;box-shadow:none;" aria-label="Kerko dyqane">
            ${icon("search", "w-4 h-4")}
          </button>
          <div data-shopping-search-panel class="hidden items-center w-full border-b border-slate-900 pb-1.5 outline-none focus-within:outline-none focus-within:ring-0" style="border-bottom-width:2px;box-shadow:none;">
            ${icon("search", "w-4 h-4 text-slate-400 flex-shrink-0 mr-2")}
            <input type="text" data-shopping-search-input placeholder="Kerko dyqane..." class="bg-transparent text-xs font-bold text-slate-800 w-full outline-none focus:outline-none focus-visible:outline-none focus:ring-0 placeholder-slate-400" style="box-shadow:none;" autocomplete="off" />
            <button type="button" data-shopping-search-close class="p-1 hover:bg-slate-200 rounded-full text-slate-500 transition-colors flex-shrink-0 outline-none focus:outline-none focus-visible:outline-none focus:ring-0" style="outline:none;box-shadow:none;" aria-label="Mbyll kerkimin">
              ${icon("x", "w-3.5 h-3.5")}
            </button>
          </div>
        </div>
      </header>

      <main class="flex-1 px-2 pt-3 pb-24">
        <div class="grid grid-cols-2 gap-2 items-start" data-shopping-card-grid>
          <div class="flex flex-col gap-6">${left.join("")}</div>
          <div class="flex flex-col gap-6">${hasRenderedShoppingCards ? renderShoppingBrandIntroCard(deps) : ""}${right.join("")}</div>
        </div>
      </main>
    </section>
  `;
}

function renderRestaurantListCard(record = {}, deps = {}) {
  const escapeHtml = deps.escapeHtml;
  const icon = deps.icon;
  const cardIcon = (name, className) => renderRestaurantCardIcon(name, className, deps);
  const name = getBusinessName(record);
  const id = getBusinessId(record);
  const coverImage = getBusinessCoverImage(record, deps);
  const logoImage = getBusinessImage(record, deps);
  const rating = getBusinessRating(record);
  const reviewsCount = Number(record.reviewsCount ?? record.reviewCount ?? record.ratingsCount ?? 0);
  const displayRating = rating || "0.0";
  const displayReviewsCount = Number.isFinite(reviewsCount) && reviewsCount > 0 ? reviewsCount : 0;
  const cuisine = getRestaurantCuisineLabel(record);
  const priceRange = getRestaurantPriceRange(record) || "€€ - €€€";
  const location = getBusinessLocationLabel(record);
  const phone = getBusinessPhone(record);
  const hours = getBusinessHours(record);
  const features = getRestaurantFeatureChips(record);
  const isLiked = record.isLiked === true || record.liked === true || record.favorite === true || record.favorited === true;
  return `
    <article class="w-full bg-white rounded-[28px] overflow-hidden shadow-lg shadow-slate-200/80 border border-slate-100/60 relative flex flex-col" style="border-radius:28px;border-color:rgba(241,245,249,0.6);box-shadow:0 10px 15px -3px rgba(226,232,240,0.8),0 4px 6px -4px rgba(226,232,240,0.8);">
      <div class="h-44 relative overflow-hidden group">
        ${renderImage(coverImage, name, { ...deps, extraClass: "transition-transform duration-700 group-hover:scale-105" })}
        <div class="absolute inset-0 bg-gradient-to-t from-white via-white/20 to-black/20" style="background:linear-gradient(to top,#fff 0%,rgba(255,255,255,0.2) 50%,rgba(0,0,0,0.2) 100%);"></div>

        <div class="absolute top-3.5 right-3.5 flex gap-2 z-10" style="top:0.875rem;right:0.875rem;">
          <button
            type="button"
            data-marketplace-open-map="${escapeHtml(id)}"
            class="w-8 h-8 rounded-full bg-white/95 backdrop-blur-sm flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-white transition-all active:scale-95 border border-slate-200/50 shadow-sm cursor-pointer"
            title="Shfaq ne harte"
            aria-label="Shfaq ne harte"
          >
            ${icon("map", "w-4 h-4")}
          </button>
          <button
            type="button"
            class="w-8 h-8 rounded-full bg-white/95 backdrop-blur-sm flex items-center justify-center text-slate-700 hover:text-rose-500 hover:bg-white transition-all active:scale-95 border border-slate-200/50 shadow-sm cursor-pointer"
            aria-label="Favorit"
          >
            ${icon("heart", `w-4 h-4 ${isLiked ? "fill-rose-500 text-rose-500" : "text-slate-600"}`)}
          </button>
          <button
            type="button"
            class="w-8 h-8 rounded-full bg-white/95 backdrop-blur-sm flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-white transition-all active:scale-95 border border-slate-200/50 shadow-sm cursor-pointer"
            title="Ndaj"
            aria-label="Ndaj"
          >
            ${cardIcon("share-2", "w-4 h-4")}
          </button>
        </div>

        <div class="absolute bottom-3.5 right-4 bg-slate-900/90 text-white font-medium px-2.5 py-0.5 rounded-md text-[9px] tracking-wider shadow" style="bottom:0.875rem;background-color:rgba(15,23,42,0.9);">
          ${escapeHtml(priceRange)}
        </div>
      </div>

      <div class="px-5 pb-5 pt-12 relative flex-1 flex flex-col gap-3.5" style="padding-top:3rem;gap:0.875rem;">
        <div class="absolute -top-10 left-5 z-10" style="top:-2.5rem;left:1.25rem;">
          <div class="w-[76px] h-[76px] rounded-full p-1 bg-white shadow-md border border-slate-100 overflow-hidden" style="width:76px;height:76px;">
            ${renderImage(logoImage, `${name} Logo`, { ...deps, extraClass: "rounded-full" })}
          </div>
        </div>

        <div>
          <div class="flex items-center gap-1.5 mb-1">
            <div class="flex text-amber-500">
              ${icon("star", "w-3.5 h-3.5 fill-amber-500 text-amber-500")}
            </div>
            <span class="text-[11px] font-bold text-slate-800">${escapeHtml(displayRating)}</span>
            <span class="text-[11px] text-slate-400">(${escapeHtml(String(displayReviewsCount))} Bewertungen)</span>
          </div>

          <h2 class="text-lg font-black text-slate-900 leading-snug tracking-tight">${escapeHtml(name)}</h2>
          ${cuisine ? `<p class="text-[10px] text-amber-600 font-bold uppercase tracking-wider mt-0.5" style="margin-top:0.125rem;">${escapeHtml(cuisine)}</p>` : ""}
        </div>

        <hr class="border-slate-100" />

        <div class="flex flex-col gap-2.5 text-slate-600">
          <div class="flex items-start gap-3">
            ${icon("map-pin", "w-4 h-4 text-slate-400 shrink-0 mt-0.5")}
            <span class="text-[11px] leading-relaxed text-slate-600">${escapeHtml(location)}</span>
          </div>
          ${phone ? `
            <div class="flex items-center gap-3">
              ${cardIcon("phone", "w-4 h-4 text-slate-400 shrink-0")}
              <span class="text-[11px] text-slate-600">${escapeHtml(phone)}</span>
            </div>
          ` : ""}
          <div class="flex items-center gap-3">
            ${icon("clock", "w-4 h-4 text-slate-400 shrink-0")}
            <span class="text-[11px] text-slate-600">${escapeHtml(hours)}</span>
          </div>
        </div>

        ${features.length ? `
          <div class="flex flex-wrap gap-1.5">
            ${features.map((feature) => `
              <span class="text-[9px] font-semibold bg-slate-50 text-slate-500 px-2.5 py-0.5 rounded-md border border-slate-100">${escapeHtml(feature)}</span>
            `).join("")}
          </div>
        ` : ""}

        <hr class="border-slate-100" />

        <div class="grid grid-cols-2 gap-2.5 mt-0.5">
          <button
            type="button"
            data-marketplace-open-business="${escapeHtml(id)}"
            data-tab="profile"
            class="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs transition-all duration-150 active:scale-95 cursor-pointer"
          >
            ${icon("user", "w-3.5 h-3.5 text-slate-400")}
            Profil
          </button>

          <button
            type="button"
            data-marketplace-open-business="${escapeHtml(id)}"
            data-tab="menu"
            class="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs tracking-wide shadow-sm transition-all duration-150 active:scale-95 cursor-pointer"
          >
            ${cardIcon("book-open", "w-3.5 h-3.5 text-slate-200")}
            Menu
          </button>
        </div>
      </div>
    </article>
  `;
}

function withTypeLabel(record = {}, section = {}) {
  const type = cleanText(record.__marketplaceType || record.type || record.customerType || "");
  const normalized = normalizeTypeAlias(type);
  const labels = {
    restaurant: "Restaurant",
    cafe: "Cafe",
    coffee: "Cafe",
    fastfood: "Fastfood",
    hotel: "Hotel",
    motel: "Motel",
    ecommerce: "E-Commerce"
  };
  return {
    ...record,
    __marketplaceTypeLabel: labels[normalized] || section.title,
    __marketplaceType: normalized
  };
}

function renderEmptyState(section = {}, deps = {}) {
  const escapeHtml = deps.escapeHtml;
  const icon = deps.icon;
  return `
    <div class="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-8 text-center">
      <div class="w-16 h-16 mx-auto mb-5 rounded-[1.5rem] bg-slate-100 text-slate-400 flex items-center justify-center">
        ${icon(section.icon, "w-6 h-6")}
      </div>
      <h3 class="text-lg font-black tracking-tight text-slate-900">${escapeHtml(section.emptyTitle)}</h3>
      <p class="mt-2 text-xs font-semibold text-slate-400 leading-5">${escapeHtml(section.emptyBody)}</p>
    </div>
  `;
}

function renderDataLoadingState(section = {}, deps = {}) {
  const escapeHtml = deps.escapeHtml;
  const icon = deps.icon;
  return `
    <div class="rounded-[2rem] border border-slate-100 bg-white p-5 text-[11px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-3">
      ${icon("loader-2", "w-4 h-4 animate-spin")}
      Te dhenat po ngarkohen ...
    </div>
  `;
}

function readStoredRestaurantLocation() {
  const storage = globalThis?.localStorage || null;
  if (!storage) return null;
  try {
    const raw = storage.getItem(FEED_LOCATION_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    const coords = normalizeLocationCoords(parsed);
    if (!coords) return null;
    const source = cleanText(parsed?.source || "");
    const label = cleanText(parsed?.label || parsed?.city || "");
    const rawCity = cleanText(parsed?.city || "");
    const labelKey = normalizeLooseKey(label);
    const isGenericLocationLabel = labelKey === "current_location"
      || labelKey === "currentlocation"
      || labelKey === "standort"
      || labelKey === "aktueller_standort";
    return {
      lat: coords.lat,
      lng: coords.lng,
      label,
      city: rawCity || (isGenericLocationLabel ? "" : label),
      source
    };
  } catch {
    return null;
  }
}

function renderRestaurantSearchGate({ deps } = {}) {
  const icon = deps.icon;
  return `
    <div id="restaurantsSearchTop" data-restaurant-search-top style="background:${RESTAURANTS_GATE_COLOR};">
      <div class="loc-top">
        <div class="loc-title">
          <div class="text-slider-wrapper">
            <div class="text-slide-item">BEST RESTAURANTS.</div>
            <div class="text-slide-item">BEST COFFEES.</div>
          </div>
          <div>IN YOUR CITY.</div>
        </div>

        <div class="loc-search-wrap">
          <div class="loc-input-row">
            <span class="loc-pin">${icon("map-pin", "w-5 h-5")}</span>
            <input
              id="restaurantLocationCityInput"
              data-restaurant-location-city-input="true"
              type="text"
              placeholder="Shkruaj qytetin tend..."
              class="loc-input"
              inputmode="search"
              autocomplete="off"
              autocapitalize="words"
              spellcheck="false"
              aria-autocomplete="list"
              aria-controls="restaurantLocationCitySuggestions"
              aria-expanded="false"
            />
            <div class="loc-request-wrap">
              <button id="btnRestaurantLocateMe" type="button" data-restaurant-location-request class="loc-request-btn" aria-label="Perdor vendndodhjen">
                ${icon("crosshair", "w-5 h-5 relative z-10")}
                <span id="restaurantLocatePulse" class="loc-request-pulse opacity-0"></span>
              </button>
            </div>
          </div>
          <div id="restaurantLocationCitySuggestions" data-restaurant-location-city-suggestions role="listbox" aria-hidden="true" class="feed-location-suggestions"></div>
          <p id="restaurantLocationStatus" class="loc-status hidden"></p>
        </div>
      </div>
      <span data-travel-tab="" hidden aria-hidden="true"></span>
    </div>
  `;
}

function renderRestaurantsContent({
  items = [],
  adItems = [],
  section = {},
  deps = {}
} = {}) {
  const escapeHtml = deps.escapeHtml;
  const icon = deps.icon;
  if (!items.length) {
    return renderEmptyState(section, deps);
  }
  return `
    ${adItems.length ? `
      <div class="w-full space-y-5 mb-6" style="width:100%;margin-bottom:1.5rem;">
        <div class="flex items-center justify-between px-0" style="padding-left:0;padding-right:0;">
          <div>
            <h2 class="text-xl font-black tracking-tight text-slate-900 md:text-2xl">Highlights</h2>
            <p class="text-[11px] text-slate-400 font-semibold mt-0.5">${escapeHtml("Partner premium ne afersine tende")}</p>
          </div>
          <div class="hidden md:flex items-center gap-1.5">
            <button type="button" data-restaurant-ads-scroll="left" class="bg-white hover:bg-slate-50 text-slate-800 p-2 rounded-full shadow-sm border border-slate-100 transition-all active:scale-95" aria-label="Levize majtas">
              ${icon("chevron-left", "w-3.5 h-3.5")}
            </button>
            <button type="button" data-restaurant-ads-scroll="right" class="bg-white hover:bg-slate-50 text-slate-800 p-2 rounded-full shadow-sm border border-slate-100 transition-all active:scale-95" aria-label="Levize djathtas">
              ${icon("chevron-right", "w-3.5 h-3.5")}
            </button>
          </div>
        </div>
        <div class="relative">
          <div data-restaurant-ads-track class="flex gap-6 overflow-x-auto hide-scrollbar pb-5 pt-2 px-0 snap-x snap-mandatory scroll-smooth" style="-webkit-overflow-scrolling:touch;scrollbar-width:none;display:flex;gap:1.5rem;overflow-x:auto;padding:0.5rem 0 1.25rem;scroll-snap-type:x mandatory;scroll-behavior:smooth;">
            ${adItems.map((entry) => renderRestaurantAdCard(entry, deps)).join("")}
          </div>
        </div>
      </div>
    ` : ""}

    <div class="space-y-4">
      ${items.map((record) => renderRestaurantListCard(record, deps)).join("")}
    </div>
  `;
}

function renderRestaurantsView({ state, dataLoaded, section, deps } = {}) {
  const allItems = filterMarketplaceBusinessesCore(state, section.key, deps)
    .map((record) => withTypeLabel({
      ...record,
      __marketplaceType: resolveBusinessType(record, deps)
    }, section));
  const storedLocation = readStoredRestaurantLocation();
  const hasLocation = !!storedLocation;
  const locationItems = hasLocation
    ? allItems.filter((record) => matchesRestaurantViewerLocation(record, storedLocation))
    : allItems;
  const visibleItems = hasLocation ? locationItems : locationItems.slice(0, LIST_LIMIT);
  const adItems = collectApprovedRestaurantAdCards(visibleItems);
  const restaurantsLoaded = dataLoaded?.restaurants === true;
  const content = restaurantsLoaded || allItems.length ? renderRestaurantsContent({
    items: visibleItems,
    adItems,
    section,
    deps
  }) : renderDataLoadingState(section, deps);

  if (hasLocation) {
    return `
      <section class="p-6 pb-24 animate-in slide-in-from-right-10 duration-500">
        ${content}
      </section>
    `;
  }

  return `
    <section id="restaurantsView" class="animate-in slide-in-from-right-10 duration-500" style="background:#f8fafc; min-height:100%;">
      ${renderRestaurantSearchGate({ deps })}
      <div id="restaurantsBenko" data-restaurants-benko class="loc-bento loc-bento--feed-content">
      </div>
    </section>
  `;
}

function getTravelViewState(state = {}) {
  const view = state?.travelView && typeof state.travelView === "object" ? state.travelView : {};
  const query = cleanText(view.query || "");
  const activeTabRaw = cleanText(view.activeTab || "").toLowerCase();
  const activeTab = ["offers", "hotels", "map"].includes(activeTabRaw)
    ? activeTabRaw
    : (query ? "hotels" : "offers");
  return {
    query,
    activeTab: query ? activeTab : "offers",
    notice: cleanText(view.notice || "")
  };
}

function renderTravelSearchHero({ travel, deps } = {}) {
  const escapeHtml = deps.escapeHtml;
  const icon = deps.icon;
  return `
    <div id="travelSearchTop" data-travel-search-top style="background:${TRAVEL_SEARCH_TEAL};">
      <div class="loc-top">
        <div class="loc-title">
          <div class="text-slider-wrapper">
            <div class="text-slide-item">Find Hotels.</div>
            <div class="text-slide-item">Find Motels.</div>
            <div class="text-slide-item">Best Offers.</div>
          </div>
          <div>For your Travel.</div>
        </div>

        <div class="loc-search-wrap">
          <div class="loc-input-row">
            <span class="loc-pin">${icon("map-pin", "w-5 h-5")}</span>
            <input
              id="travelDestinationInput"
              data-travel-destination-input="true"
              type="text"
              value="${escapeHtml(travel.query)}"
              placeholder="Shkruaj destinacionin tend"
              class="loc-input"
              inputmode="search"
              autocomplete="off"
              autocapitalize="words"
              spellcheck="false"
              aria-autocomplete="list"
              aria-controls="travelDestinationSuggestions"
              aria-expanded="false"
            />
            <div class="loc-request-wrap">
              <button type="button" data-travel-submit="true" class="loc-request-btn" aria-label="Search destination">
                ${icon("search", "w-5 h-5")}
              </button>
            </div>
          </div>
          <div id="travelDestinationSuggestions" data-travel-destination-suggestions role="listbox" aria-hidden="true" class="travel-destination-suggestions"></div>
          ${travel.notice ? `
            <p data-travel-notice class="loc-status">${escapeHtml(travel.notice)}</p>
          ` : ""}
        </div>
      </div>
    </div>
  `;
}

function renderTravelTabs({ activeTab, hasDestination, hotelCount, deps } = {}) {
  const escapeHtml = deps.escapeHtml;
  const tabs = [
    { id: "offers", label: "Ofertat" },
    { id: "hotels", label: "Hotels" },
    { id: "map", label: "Harta" }
  ];
  return `
    <div class="bg-white/70 p-1.5 border border-white/50 shadow-sm flex items-center relative backdrop-blur-sm" style="border-radius:2rem;">
      ${tabs.map((tab) => {
        const selected = activeTab === tab.id;
        const disabledLook = !hasDestination && tab.id !== "offers";
        const count = tab.id === "hotels" && hasDestination ? ` ${hotelCount}` : "";
        return `
          <button
            type="button"
            data-travel-tab="${escapeHtml(tab.id)}"
            class="flex-1 py-3.5 rounded-[1.5rem] text-[11px] font-bold uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 ${selected ? "bg-white text-slate-900 shadow-[0_4px_12px_-2px_rgba(0,0,0,0.08),0_2px_6px_-1px_rgba(0,0,0,0.04)] scale-[1.02]" : (disabledLook ? "text-slate-300" : "text-slate-400 hover:text-slate-600")}"
          >
            ${escapeHtml(`${tab.label}${count}`)}
          </button>
        `;
      }).join("")}
    </div>
  `;
}

function renderTravelOfferCard(record = {}, deps = {}) {
  const escapeHtml = deps.escapeHtml;
  const icon = deps.icon;
  const name = getBusinessName(record);
  const id = getBusinessId(record);
  const image = getBusinessImage(record, deps);
  const location = getBusinessLocationLabel(record);
  const rating = getBusinessRating(record);
  return `
    <button type="button" data-marketplace-open-business="${escapeHtml(id)}" class="w-full text-left bg-white border border-slate-100 shadow-sm active:scale-[0.99] transition-transform overflow-hidden" style="border-radius:2rem;">
      <div class="h-40 bg-slate-100 overflow-hidden">
        ${renderImage(image, name, deps)}
      </div>
      <div class="p-5">
        <div class="flex items-start justify-between gap-4">
          <div class="min-w-0">
            <p class="text-[9px] font-black uppercase tracking-widest mb-1" style="color:${TRAVEL_BLUE};">Ofertat</p>
            <h3 class="text-lg font-black tracking-tight text-slate-900 leading-tight line-clamp-2">${escapeHtml(name)}</h3>
          </div>
          ${rating ? `<span class="shrink-0 px-2.5 py-1 rounded-xl bg-amber-50 text-amber-600 text-[10px] font-black flex items-center gap-1">${icon("star", "w-3 h-3 fill-current")} ${escapeHtml(rating)}</span>` : ""}
        </div>
        <div class="mt-4 flex items-center gap-2 min-w-0 text-[11px] font-bold text-slate-500">
          ${icon("map-pin", "w-3.5 h-3.5 text-slate-400 shrink-0")}
          <span class="truncate">${escapeHtml(location)}</span>
        </div>
      </div>
    </button>
  `;
}

function renderTravelHotelCard(record = {}, deps = {}) {
  const escapeHtml = deps.escapeHtml;
  const icon = deps.icon;
  const cardIcon = (name, className) => renderRestaurantCardIcon(name, className, deps);
  const name = getBusinessName(record);
  const id = getBusinessId(record);
  const coverImages = getBusinessCoverImages(record, deps);
  const firstCoverImage = coverImages[0] || deps.placeholderImage || "";
  const logoImage = getBusinessImage(record, deps);
  const rating = getBusinessRating(record) || "0.0";
  const reviewsCount = Number(record.reviewsCount ?? record.reviewCount ?? record.ratingsCount ?? 0);
  const displayReviewsCount = Number.isFinite(reviewsCount) && reviewsCount > 0 ? reviewsCount : 0;
  const category = getHotelCategoryLabel(record);
  const address = getBusinessLocationLabel(record);
  const distanceCenter = getHotelDistanceCenter(record);
  const distanceBeach = getHotelDistanceBeach(record);
  const features = getHotelFeatureChips(record);
  const startingPrice = getHotelStartingPrice(record);
  const priceUnitLabel = getHotelPriceUnitLabel(record);
  const offerBadgeLabel = cleanText(record.offerBadgeLabel || record.travelOfferBadgeLabel || record.badgeLabel || "");
  const offerDurationLabel = cleanText(record.offerDurationLabel || record.nightsDaysLabel || record.durationLabel || "");
  const isLiked = record.isLiked === true || record.liked === true || record.favorite === true || record.favorited === true;
  return `
    <article
      data-travel-hotel-card="${escapeHtml(id)}"
      data-travel-hotel-image-index="0"
      class="w-full bg-white rounded-[28px] overflow-hidden shadow-lg shadow-slate-200/80 border border-slate-100/60 relative flex flex-col"
      style="border-radius:28px;border-color:rgba(241,245,249,0.6);box-shadow:0 10px 15px -3px rgba(226,232,240,0.8),0 4px 6px -4px rgba(226,232,240,0.8);"
    >
      <div data-travel-hotel-gallery class="h-44 relative overflow-hidden group select-none touch-pan-y" style="touch-action:pan-y;">
        <img
          data-travel-hotel-main-image
          src="${escapeHtml(firstCoverImage)}"
          alt="${escapeHtml(`${name} pamja 1`)}"
          loading="lazy"
          class="w-full h-full object-cover transition-all duration-500 bg-slate-100"
        />
        <div class="absolute top-0 inset-x-0 h-14 bg-gradient-to-b from-black/30 to-transparent pointer-events-none"></div>

        ${offerBadgeLabel || offerDurationLabel ? `
          <div class="absolute top-3.5 left-3.5 flex items-center gap-2 z-10">
            ${offerBadgeLabel ? `<span class="px-3 py-1.5 rounded-full bg-white/95 text-[9px] font-black uppercase tracking-widest shadow-sm border border-white/70" style="color:${TRAVEL_BLUE};">${escapeHtml(offerBadgeLabel)}</span>` : ""}
            ${offerDurationLabel ? `<span class="px-3 py-1.5 rounded-full bg-slate-900/85 text-white text-[9px] font-black uppercase tracking-widest shadow-sm border border-white/20">${escapeHtml(offerDurationLabel)}</span>` : ""}
          </div>
        ` : ""}

        ${coverImages.length > 1 ? `
          <button
            type="button"
            data-travel-hotel-image-nav="prev"
            class="absolute left-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-slate-700 hover:text-slate-900 shadow-sm transition-all active:scale-90 cursor-pointer"
            style="left:0.75rem;top:50%;transform:translateY(-50%);z-index:20;"
            aria-label="Fotoja e meparshme"
          >
            ${icon("chevron-left", "w-4 h-4")}
          </button>

          <button
            type="button"
            data-travel-hotel-image-nav="next"
            class="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-slate-700 hover:text-slate-900 shadow-sm transition-all active:scale-90 cursor-pointer"
            style="right:0.75rem;top:50%;transform:translateY(-50%);z-index:20;"
            aria-label="Fotoja tjeter"
          >
            ${icon("chevron-right", "w-4 h-4")}
          </button>

          <div class="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1 z-10">
            ${coverImages.map((imageUrl, index) => `
              <button
                type="button"
                data-travel-hotel-dot="${index}"
                data-travel-hotel-image-src="${escapeHtml(imageUrl)}"
                class="${index === 0 ? "w-4 bg-white shadow-sm" : "w-1.5 bg-white/50"} h-1.5 rounded-full transition-all duration-300"
                aria-label="Hotelbild ${index + 1}"
              ></button>
            `).join("")}
          </div>
        ` : `
          <span data-travel-hotel-dot="0" data-travel-hotel-image-src="${escapeHtml(firstCoverImage)}" class="hidden"></span>
        `}

        <div class="absolute top-3.5 right-3.5 flex gap-2 z-10" style="position:absolute;top:0.875rem;right:0.875rem;z-index:30;display:flex;gap:0.5rem;">
          <button
            type="button"
            data-marketplace-open-map="${escapeHtml(id)}"
            class="w-8 h-8 rounded-full bg-white/95 backdrop-blur-sm flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-white transition-all active:scale-95 border border-slate-200/50 shadow-sm cursor-pointer"
            title="Shfaq ne harte"
            aria-label="Shfaq ne harte"
          >
            ${icon("map", "w-4 h-4")}
          </button>
          <button
            type="button"
            data-travel-hotel-like="${escapeHtml(id)}"
            class="w-8 h-8 rounded-full bg-white/95 backdrop-blur-sm flex items-center justify-center text-slate-700 hover:text-rose-500 hover:bg-white transition-all active:scale-95 border border-slate-200/50 shadow-sm cursor-pointer"
            aria-label="Shto te te preferuarat"
          >
            ${icon("heart", `w-4 h-4 ${isLiked ? "fill-rose-500 text-rose-500" : "text-slate-600"}`)}
          </button>
          <button
            type="button"
            data-travel-hotel-share="${escapeHtml(id)}"
            class="w-8 h-8 rounded-full bg-white/95 backdrop-blur-sm flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-white transition-all active:scale-95 border border-slate-200/50 shadow-sm cursor-pointer"
            title="Ndaj"
            aria-label="Ndaj"
          >
            ${icon("share-2", "w-4 h-4")}
          </button>
        </div>
      </div>

      <div class="px-5 pb-5 pt-12 relative flex-1 flex flex-col gap-3.5" style="padding-top:3rem;gap:0.875rem;">
        <div class="absolute -top-10 left-5 z-10" style="top:-2.5rem;left:1.25rem;">
          <div class="w-[76px] h-[76px] rounded-full p-1 bg-white shadow-md border border-slate-100 overflow-hidden" style="width:76px;height:76px;">
            ${renderImage(logoImage, `${name} Logo`, { ...deps, extraClass: "rounded-full" })}
          </div>
        </div>

        <div>
          <div class="flex items-center gap-1.5 mb-2" style="margin-bottom:0.5rem;">
            <div class="flex text-amber-500">
              ${icon("star", "w-3.5 h-3.5 fill-amber-500 text-amber-500")}
            </div>
            <span class="text-[11px] font-bold text-slate-800">${escapeHtml(rating)}</span>
            <span class="text-[11px] text-slate-400">(${escapeHtml(String(displayReviewsCount))} vlerësime)</span>
          </div>

          <h2 class="text-lg font-black text-slate-900 leading-snug tracking-tight">${escapeHtml(name)}</h2>
          <p class="text-[10px] text-amber-600 font-bold uppercase tracking-wider mt-2" style="margin-top:0.5rem;">${escapeHtml(category)}</p>
        </div>

        <hr class="border-slate-100" />

        <div class="flex flex-col gap-2.5 text-slate-600">
          <div class="flex items-start gap-3">
            ${icon("map-pin", "w-4 h-4 text-slate-400 shrink-0 mt-0.5")}
            <span class="text-[11px] leading-relaxed text-slate-600">${escapeHtml(address)}</span>
          </div>
          <div class="flex items-center gap-3">
            ${cardIcon("navigation", "w-4 h-4 text-slate-400 shrink-0")}
            <span class="text-[11px] text-slate-600">${escapeHtml(distanceCenter || "Qendra mungon")}</span>
          </div>
          <div class="flex items-center gap-3">
            ${cardIcon("waves", "w-4 h-4 text-slate-400 shrink-0")}
            <span class="text-[11px] text-slate-600">${escapeHtml(distanceBeach || "Plazhi mungon")}</span>
          </div>
        </div>

        ${features.length ? `
          <div class="flex flex-wrap gap-1.5">
            ${features.map((feature) => renderHotelFeatureChip(feature, deps)).join("")}
          </div>
        ` : ""}

        <hr class="border-slate-100" />

        <div class="flex items-center justify-between mt-0.5 gap-4">
          <div class="flex flex-col">
            <span class="text-[9px] uppercase tracking-wider text-slate-400 font-bold">Cmimi me i mire</span>
            <div class="flex items-baseline gap-1">
              ${startingPrice ? `
                <span class="text-base font-black text-slate-900">ab ${escapeHtml(startingPrice)} €</span>
                <span class="text-[9px] text-slate-500 font-bold">${escapeHtml(priceUnitLabel)}</span>
              ` : `
                <span class="text-base font-black text-slate-900">Cmimi se shpejti</span>
              `}
            </div>
          </div>

          <button
            type="button"
            data-marketplace-open-business="${escapeHtml(id)}"
            data-tab="profile"
            class="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs tracking-wide shadow-sm transition-all duration-150 active:scale-95 cursor-pointer max-w-[140px]"
            style="max-width:140px;"
          >
            <span>Mehr</span>
            ${icon("chevron-right", "w-3.5 h-3.5")}
          </button>
        </div>
      </div>
    </article>
  `;
}

function renderTravelOfertaPremiumCard(record = {}, deps = {}) {
  const escapeHtml = deps.escapeHtml;
  const icon = deps.icon;
  const cardIcon = (name, className) => renderRestaurantCardIcon(name, className, deps);
  const name = getBusinessName(record);
  const id = getBusinessId(record);
  const coverImages = getBusinessCoverImages(record, deps);
  const firstCoverImage = coverImages[0] || deps.placeholderImage || "";
  const logoImage = getBusinessImage(record, deps);
  const rating = getBusinessRating(record) || "0.0";
  const reviewsCount = Number(record.reviewsCount ?? record.reviewCount ?? record.ratingsCount ?? 0);
  const displayReviewsCount = Number.isFinite(reviewsCount) && reviewsCount > 0 ? reviewsCount : 0;
  const destination = getTravelOfferDestinationLabel(record);
  const distanceCenter = getHotelDistanceCenter(record);
  const distanceBeach = getHotelDistanceBeach(record);
  const features = getHotelFeatureChips(record).slice(0, 3);
  const details = collectTravelOfferDetailList(record);
  const description = getTravelOfferDescription(record) || `${name} - ${destination || record.address || ""}`;
  const startingPrice = getHotelStartingPrice(record);
  const priceSuffix = getTravelOfferPriceSuffix(record);
  const badgeLabel = getTravelOfferBadgeLabel(record);
  const durationText = getTravelOfferDurationLabel(record);
  const priceHeadline = durationText || badgeLabel || "Ofertë";
  const isLiked = record.isLiked === true || record.liked === true || record.favorite === true || record.favorited === true;

  return `
    <article
      data-travel-hotel-card="${escapeHtml(id)}"
      data-travel-offer-card="${escapeHtml(record.__travelOfferId || record.offerId || id)}"
      data-travel-hotel-image-index="0"
      aria-label="${escapeHtml(name)}"
      class="w-full max-w-[340px] mx-auto bg-white rounded-[28px] overflow-hidden shadow-xl shadow-slate-200 border border-slate-100/60 relative flex flex-col"
      style="border-radius:28px;border-color:rgba(241,245,249,0.6);"
    >
      <div data-travel-offer-toast class="hidden absolute top-4 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-4 py-2.5 rounded-full text-[10px] font-semibold shadow-xl z-40 items-center gap-2 max-w-[92%] text-center"></div>

      <div data-travel-hotel-gallery class="h-44 relative overflow-hidden group select-none touch-pan-y" style="touch-action:pan-y;">
        <img
          data-travel-hotel-main-image
          src="${escapeHtml(firstCoverImage)}"
          alt="${escapeHtml(`${name} foto 1`)}"
          loading="lazy"
          class="w-full h-full object-cover transition-all duration-500 bg-slate-100"
        />
        <div class="absolute top-0 inset-x-0 h-12 bg-gradient-to-b from-black/25 to-transparent pointer-events-none"></div>

        ${coverImages.length > 1 ? `
          <button
            type="button"
            data-travel-hotel-image-nav="prev"
            class="absolute left-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/95 backdrop-blur-sm flex items-center justify-center text-slate-700 hover:text-slate-900 shadow-sm transition-all active:scale-90 cursor-pointer"
            style="left:0.75rem;top:50%;transform:translateY(-50%);z-index:20;"
            aria-label="Fotoja e meparshme"
          >
            ${icon("chevron-left", "w-4 h-4")}
          </button>

          <button
            type="button"
            data-travel-hotel-image-nav="next"
            class="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/95 backdrop-blur-sm flex items-center justify-center text-slate-700 hover:text-slate-900 shadow-sm transition-all active:scale-90 cursor-pointer"
            style="right:0.75rem;top:50%;transform:translateY(-50%);z-index:20;"
            aria-label="Fotoja tjeter"
          >
            ${icon("chevron-right", "w-4 h-4")}
          </button>

          <div class="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1 z-10">
            ${coverImages.map((imageUrl, index) => `
              <button
                type="button"
                data-travel-hotel-dot="${index}"
                data-travel-hotel-image-src="${escapeHtml(imageUrl)}"
                class="${index === 0 ? "w-[18px] bg-white shadow-sm" : "w-1.5 bg-white/60"} h-1.5 rounded-full transition-all duration-300"
                aria-label="Hotelbild ${index + 1}"
              ></button>
            `).join("")}
          </div>
        ` : `
          <span data-travel-hotel-dot="0" data-travel-hotel-image-src="${escapeHtml(firstCoverImage)}" class="hidden"></span>
        `}

        <div
          class="absolute top-3.5 left-3.5 bg-red-600 text-white shadow-md px-3 py-1 rounded-full text-[10px] font-black tracking-wider uppercase z-10 border border-red-500"
          style="position:absolute;top:0.875rem;left:0.875rem;z-index:25;display:inline-flex;align-items:center;justify-content:center;background:#dc2626;color:#fff;border:1px solid #ef4444;border-radius:9999px;padding:0.25rem 0.75rem;font-size:10px;line-height:1rem;font-weight:900;letter-spacing:0.08em;text-transform:uppercase;box-shadow:0 4px 6px -1px rgba(15,23,42,0.18),0 2px 4px -2px rgba(15,23,42,0.18);"
        >
          <span>${escapeHtml(badgeLabel)}</span>
        </div>

        <div class="absolute top-3 right-3 flex gap-1.5 z-10" style="position:absolute;top:0.75rem;right:0.75rem;z-index:30;display:flex;gap:0.375rem;">
          <button
            type="button"
            data-marketplace-open-map="${escapeHtml(id)}"
            class="w-8 h-8 rounded-full bg-white/95 backdrop-blur-sm flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-white transition-all active:scale-95 shadow-sm cursor-pointer"
            title="Shfaq ne harte"
            aria-label="Shfaq ne harte"
          >
            ${icon("map", "w-3.5 h-3.5")}
          </button>
          <button
            type="button"
            data-travel-hotel-like="${escapeHtml(id)}"
            class="w-8 h-8 rounded-full bg-white/95 backdrop-blur-sm flex items-center justify-center text-slate-700 hover:text-rose-500 hover:bg-white transition-all active:scale-95 shadow-sm cursor-pointer"
            aria-label="Shto te te preferuarat"
          >
            ${icon("heart", `w-4 h-4 ${isLiked ? "fill-rose-500 text-rose-500" : "text-slate-600"}`)}
          </button>
          <button
            type="button"
            data-travel-hotel-share="${escapeHtml(id)}"
            class="w-8 h-8 rounded-full bg-white/95 backdrop-blur-sm flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-white transition-all active:scale-95 shadow-sm cursor-pointer"
            title="Ndaj"
            aria-label="Ndaj"
          >
            ${icon("share-2", "w-3.5 h-3.5")}
          </button>
        </div>
      </div>

      <div class="px-5 pb-5 pt-12 relative flex-1 flex flex-col gap-3.5" style="padding-top:3rem;gap:0.875rem;">
        <div class="absolute -top-10 left-5 z-10" style="top:-2.5rem;left:1.25rem;">
          <div class="w-[76px] h-[76px] rounded-full p-1 bg-white shadow-md border border-slate-100 overflow-hidden" style="width:76px;height:76px;">
            ${renderImage(logoImage, `${name} Logo`, { ...deps, extraClass: "rounded-full" })}
          </div>
        </div>

        <div>
          <div class="flex items-center gap-1.5 mb-2" style="margin-bottom:0.5rem;">
            <div class="flex text-amber-500">
              ${icon("star", "w-3.5 h-3.5 fill-amber-500 text-amber-500")}
            </div>
            <span class="text-[11px] font-bold text-slate-800">${escapeHtml(rating)}</span>
            <span class="text-[11px] text-slate-400">(${escapeHtml(String(displayReviewsCount))} vlerësime)</span>
          </div>
          <h2 class="text-lg font-black text-slate-900 leading-snug tracking-tight">${escapeHtml(name)}</h2>
          <p class="text-[10px] text-amber-600 font-bold uppercase tracking-wider mt-2 flex items-center gap-1.5" style="margin-top:0.5rem;color:#d97706;">
            ${icon("map-pin", "w-3 h-3 text-amber-600 shrink-0")}
            <span>${escapeHtml(destination)}</span>
          </p>
        </div>

        <hr class="border-slate-100" />

        <div class="flex flex-col gap-2.5 text-slate-600">
          <div class="flex items-center gap-3">
            ${cardIcon("navigation", "w-4 h-4 text-slate-400 shrink-0")}
            <span class="text-[11px] text-slate-600 font-semibold">${escapeHtml(distanceCenter || "Qendra mungon")}</span>
          </div>
          <div class="flex items-center gap-3">
            ${cardIcon("waves", "w-4 h-4 text-slate-400 shrink-0")}
            <span class="text-[11px] text-slate-600 font-semibold">${escapeHtml(distanceBeach || "Plazhi mungon")}</span>
          </div>
        </div>

        ${features.length ? `
          <div class="flex flex-wrap gap-1.5 pt-0.5">
            ${features.map((feature) => renderHotelFeatureChip(feature, deps, "text-[9px] font-bold bg-slate-50 text-slate-600 px-2.5 py-1 rounded-md border border-slate-100/80")).join("")}
          </div>
        ` : ""}

        <hr class="border-slate-100" />

        <div class="flex items-center justify-between mt-0.5 gap-4">
          <div class="flex flex-col min-w-0">
            <span class="text-[9px] uppercase tracking-wider text-rose-600 font-black">${escapeHtml(priceHeadline)}</span>
            <div class="flex items-baseline gap-0.5">
              ${startingPrice ? `
                <span class="text-xl font-black text-slate-900 leading-none">${escapeHtml(startingPrice)}€</span>
                <span class="text-[9px] text-slate-400 font-bold ml-1 uppercase">${escapeHtml(priceSuffix)}</span>
              ` : `
                <span class="text-base font-black text-slate-900 leading-none">Cmimi se shpejti</span>
              `}
            </div>
          </div>

          <button
            type="button"
            data-travel-offer-details="true"
            class="flex-1 flex items-center justify-center gap-1 py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs tracking-wide shadow-sm transition-all duration-150 active:scale-95 cursor-pointer max-w-[130px]"
            style="max-width:130px;"
          >
            <span>Mehr Details</span>
            ${icon("chevron-right", "w-3.5 h-3.5")}
          </button>
        </div>
      </div>

      <div data-travel-offer-modal class="hidden absolute inset-0 bg-white/98 backdrop-blur-md z-30 flex-col p-4" aria-hidden="true">
        <div class="flex justify-between items-center mb-3.5">
          <div class="flex items-center gap-1.5">
            ${icon("compass", "w-4 h-4 text-slate-900")}
            <span class="font-extrabold text-xs text-slate-900 uppercase tracking-wider">Detajet e Ofertës</span>
          </div>
          <button
            type="button"
            data-travel-offer-close="true"
            class="w-6 h-6 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
            aria-label="Mbyll"
          >
            ${icon("x", "w-3.5 h-3.5")}
          </button>
        </div>

        <div class="flex-1 overflow-y-auto flex flex-col gap-4 pr-1 no-scrollbar">
          <div class="flex items-center gap-2.5 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
            <div class="w-10 h-10 rounded-full border border-slate-100 shadow-sm overflow-hidden bg-white shrink-0">
              ${renderImage(logoImage, `${name} Logo`, { ...deps, extraClass: "rounded-full" })}
            </div>
            <div class="min-w-0">
              <h3 class="font-extrabold text-xs text-slate-900 truncate">${escapeHtml(name)}</h3>
              <p class="text-[9px] text-amber-600 font-semibold uppercase truncate">${escapeHtml(destination)}</p>
            </div>
          </div>

          <div class="text-[11px] text-slate-600 leading-relaxed bg-slate-50/50 p-3 rounded-xl border border-slate-100">
            <p class="font-extrabold text-slate-800 text-[10px] uppercase tracking-wider mb-1">Përshkrimi (Beschreibung)</p>
            ${escapeHtml(description)}
          </div>

          ${details.length ? `
            <div class="flex flex-col gap-2">
              <h4 class="text-[9px] font-extrabold uppercase tracking-wider text-slate-400">Çfarë përfshihet (Inklusive):</h4>
              <div class="flex flex-col gap-1.5 pl-1">
                ${details.map((detail) => `
                  <div class="flex items-start gap-2 text-[10px] text-slate-700">
                    ${icon("check-circle-2", "w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5")}
                    <span>${escapeHtml(detail)}</span>
                  </div>
                `).join("")}
              </div>
            </div>
          ` : ""}

          <div class="bg-slate-50 p-3.5 rounded-xl border border-slate-100 mt-1">
            <h4 class="text-[10px] font-extrabold uppercase tracking-wider text-slate-800 mb-2.5 flex items-center gap-1">
              ${icon("calendar", "w-3.5 h-3.5 text-rose-500")}
              Rezervo Online
            </h4>

            <div data-travel-offer-booking-success class="hidden bg-emerald-50 text-emerald-800 text-center p-3 rounded-lg border border-emerald-200 text-[10px] font-semibold">
              Sukses! Kërkesa juaj u dërgua. Ju faleminderit!
            </div>

            <form data-travel-offer-booking-form class="flex flex-col gap-2">
              <input
                type="text"
                data-travel-offer-booking-name
                placeholder="Emri dhe Mbiemri"
                class="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-[11px] text-slate-800 focus:outline-none focus:border-slate-900 transition-colors"
              />
              <input
                type="tel"
                data-travel-offer-booking-phone
                placeholder="Numri i telefonit"
                class="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-[11px] text-slate-800 focus:outline-none focus:border-slate-900 transition-colors"
              />
              <button
                type="submit"
                class="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2 rounded-lg text-[10px] transition-all flex items-center justify-center gap-1 cursor-pointer"
              >
                ${icon("send", "w-3 h-3")}
                Dërgo Kërkesën
              </button>
            </form>
          </div>
        </div>

        <div class="pt-3 border-t border-slate-100 flex items-center justify-between mt-2 gap-3">
          <div class="flex flex-col min-w-0">
            <span class="text-[8px] uppercase tracking-wider text-slate-400 font-bold">${priceSuffix === "Totali" ? "Total" : "Total për person"}</span>
            <span class="text-sm font-black text-slate-900 truncate">${startingPrice ? `${escapeHtml(startingPrice)} €` : "Cmimi se shpejti"}${durationText ? ` (${escapeHtml(durationText)})` : ""}</span>
          </div>
          <button
            type="button"
            data-travel-offer-close="true"
            class="text-[9px] bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold px-3 py-1.5 rounded-lg transition-all shrink-0"
          >
            Mbyll (Schließen)
          </button>
        </div>
      </div>
    </article>
  `;
}

function getTravelOfferItems(record = {}) {
  const rawItems = [
    ...(Array.isArray(record.publicOffers) ? record.publicOffers : []),
    ...(Array.isArray(record.travelOffers) ? record.travelOffers : []),
    ...(Array.isArray(record.offerItems) ? record.offerItems : [])
  ];
  const seen = new Set();
  return rawItems
    .filter((item) => item && typeof item === "object" && item.active !== false)
    .filter((item, index) => {
      const key = cleanText(item.id || item.offerId || item._id || `idx_${index}`);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

function collectTravelOfferFeatures(offer = {}) {
  return [
    ...collectStringList(offer.features),
    ...collectStringList(offer.offerFeatures),
    ...collectStringList(offer.hotelFeatures),
    cleanText(offer.hotelFeatureOneText),
    cleanText(offer.hotelFeatureTwoText),
    cleanText(offer.hotelFeatureThreeText)
  ].filter(Boolean).filter((entry, index, list) => list.indexOf(entry) === index);
}

function buildTravelOfferRecord(hotel = {}, offer = {}, index = 0) {
  const features = collectTravelOfferFeatures(offer);
  const offerDetails = collectTravelOfferDetailList(offer);
  const imageUrl = cleanText(offer.imageUrl || offer.offerImageUrl || offer.titleImageUrl || offer.coverImageUrl || "");
  const offerId = cleanText(offer.id || offer.offerId || offer._id || `offer_${index}`);
  return {
    ...hotel,
    __travelOffer: true,
    __travelOfferId: offerId,
    offerId,
    offerTitle: cleanText(offer.title || offer.name || ""),
    offerText: cleanText(offer.text || offer.description || ""),
    offerDescription: cleanText(offer.offerDescription || offer.description || offer.text || ""),
    offerDestination: cleanText(offer.offerDestination || offer.destination || offer.travelDestination || "") || hotel.offerDestination || hotel.destination,
    offerDetails,
    includedServices: offerDetails,
    offerBadgeLabel: cleanText(offer.offerBadgeLabel || offer.travelOfferBadgeLabel || offer.badgeLabel || "OFERTA"),
    offerDurationLabel: cleanText(offer.offerDurationLabel || offer.nightsDaysLabel || offer.durationLabel || ""),
    offerImageUrl: imageUrl,
    titleImageUrl: imageUrl || hotel.titleImageUrl,
    coverImageUrl: imageUrl || hotel.coverImageUrl,
    offerCoverImages: imageUrl ? [imageUrl] : collectStringList(offer.coverImages || offer.hotelCoverImages),
    distanceCenter: cleanText(offer.distanceCenter || offer.distanceToCenter || offer.centerDistance || "") || hotel.distanceCenter,
    distanceToCenter: cleanText(offer.distanceToCenter || offer.distanceCenter || offer.centerDistance || "") || hotel.distanceToCenter,
    centerDistance: cleanText(offer.centerDistance || offer.distanceCenter || offer.distanceToCenter || "") || hotel.centerDistance,
    distanceBeach: cleanText(offer.distanceBeach || offer.distanceToBeach || offer.beachDistance || "") || hotel.distanceBeach,
    distanceToBeach: cleanText(offer.distanceToBeach || offer.distanceBeach || offer.beachDistance || "") || hotel.distanceToBeach,
    beachDistance: cleanText(offer.beachDistance || offer.distanceBeach || offer.distanceToBeach || "") || hotel.beachDistance,
    hotelStartingPrice: cleanText(offer.hotelStartingPrice || offer.startingPrice || offer.priceFrom || offer.fromPrice || offer.bestPrice || "") || hotel.hotelStartingPrice,
    startingPrice: cleanText(offer.startingPrice || offer.hotelStartingPrice || offer.priceFrom || offer.fromPrice || offer.bestPrice || "") || hotel.startingPrice,
    priceFrom: cleanText(offer.priceFrom || offer.startingPrice || offer.hotelStartingPrice || "") || hotel.priceFrom,
    priceUnit: normalizeHotelPriceUnit(offer.priceUnit || offer.hotelPriceUnit || offer.offerPriceUnit || hotel.priceUnit || ""),
    features: features.length ? features : hotel.features
  };
}

function buildTravelOfferRecords(items = []) {
  return (Array.isArray(items) ? items : []).flatMap((record) => (
    getTravelOfferItems(record).map((offer, index) => buildTravelOfferRecord(record, offer, index))
  ));
}

function renderTravelOffers(items = [], deps = {}) {
  const displayItems = buildTravelOfferRecords(items).slice(0, 12);
  if (!displayItems.length) {
    return renderEmptyState({
      title: "Ofertat",
      emptyTitle: "Ende nuk ka oferta",
      emptyBody: "Nuk u gjeten oferta hoteli te pershtatshme.",
      icon: "plane"
    }, deps);
  }
  return `
    <div class="space-y-4">
      ${displayItems.map((record) => renderTravelOfertaPremiumCard(record, deps)).join("")}
    </div>
  `;
}

function renderTravelHotels(items = [], deps = {}) {
  if (!items.length) {
    return renderEmptyState({
      emptyTitle: "Nuk u gjeten hotele",
      emptyBody: "Nuk u gjeten hotele te pershtatshme per kete destinacion.",
      icon: "plane"
    }, deps);
  }
  return `
    <div class="space-y-4">
      ${items.map((record) => renderTravelHotelCard(record, deps)).join("")}
    </div>
  `;
}

function renderTravelMapPin(record = {}, index = 0, deps = {}) {
  const escapeHtml = deps.escapeHtml;
  const coords = readCoords(record);
  const name = getBusinessName(record);
  const id = getBusinessId(record);
  const location = getBusinessLocationLabel(record);
  const left = 18 + ((index * 23) % 58);
  const top = 22 + ((index * 17) % 46);
  return `
    <button
      type="button"
      data-marketplace-open-business="${escapeHtml(id)}"
      class="absolute w-12 h-12 rounded-full bg-white shadow-lg border-4 border-white flex items-center justify-center active:scale-95 transition-all"
      style="left:${left}%; top:${top}%; transform:translate(-50%,-50%); color:${TRAVEL_BLUE};"
      title="${escapeHtml(`${name} - ${location}`)}"
    >
      ${deps.icon("plane", "w-5 h-5")}
      ${coords ? `<span style="position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0;">${escapeHtml(`${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)}`)}</span>` : ""}
    </button>
  `;
}

function renderTravelMap(items = [], deps = {}) {
  if (typeof deps.renderMapView === "function") {
    return deps.renderMapView();
  }
  const mapped = items.filter((record) => readCoords(record)).slice(0, 8);
  if (!items.length) return renderTravelHotels(items, deps);
  return `
    <div class="space-y-4">
      <div class="relative overflow-hidden border border-slate-200 bg-slate-200 shadow-sm" style="height:24rem; border-radius:2.5rem;">
        <div class="absolute inset-0" style="background:linear-gradient(135deg,#e0f7fb 0%,#dbeafe 45%,#e2e8f0 100%);"></div>
        <div class="absolute inset-0 opacity-60" style="background-image:linear-gradient(rgba(255,255,255,.65) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.65) 1px, transparent 1px); background-size:42px 42px;"></div>
        ${mapped.map((record, index) => renderTravelMapPin(record, index, deps)).join("")}
        <div class="absolute left-4 right-4 bottom-4">
          <div class="bg-white/95 backdrop-blur-xl border border-white/50 shadow-lg p-4" style="border-radius:1.75rem;">
            <p class="text-[10px] font-black uppercase tracking-widest text-slate-400">Hotels</p>
            <p class="mt-1 text-sm font-black text-slate-900">${deps.escapeHtml(String(items.length))} ${items.length === 1 ? "Hotel" : "Hotels"}</p>
          </div>
        </div>
      </div>
      ${!mapped.length ? `
        <div class="bg-white border border-slate-100 shadow-sm p-5 text-[11px] font-bold text-slate-400" style="border-radius:2rem;">
          Nuk u gjeten koordinata hoteli per kete destinacion.
        </div>
      ` : ""}
    </div>
  `;
}

function renderTravelView({ state, dataLoaded, section, deps } = {}) {
  const allItems = filterMarketplaceBusinessesCore(state, section.key, deps)
    .map((record) => withTypeLabel({
      ...record,
      __marketplaceType: resolveBusinessType(record, deps)
    }, section));
  const travel = getTravelViewState(state);
  const hasDestination = !!travel.query;
  const filteredItems = hasDestination
    ? allItems.filter((record) => matchesTravelDestination(record, travel.query))
    : allItems.slice(0, LIST_LIMIT);
  const visibleItems = filteredItems.slice(0, LIST_LIMIT);
  const activeTab = hasDestination ? travel.activeTab : "offers";
  const restaurantsLoaded = dataLoaded?.restaurants === true;
  const restaurantsLoading = state?.__restaurantsLoading === true || state?.__restaurantsMetaHydrating === true;
  const isOffersTab = activeTab !== "map" && activeTab !== "hotels";
  const hasVisibleOfferRecords = isOffersTab && buildTravelOfferRecords(visibleItems).length > 0;
  const shouldShowOffersLoading = isOffersTab && restaurantsLoading && !hasVisibleOfferRecords;
  const content = activeTab === "map"
    ? renderTravelMap(visibleItems, deps)
    : (activeTab === "hotels" ? renderTravelHotels(visibleItems, deps) : renderTravelOffers(visibleItems, deps));

  return `
    <section id="travelView" class="animate-in slide-in-from-right-10 duration-500" style="background:#f8fafc; min-height:100%;">
      ${renderTravelSearchHero({ travel, deps })}
      <div id="travelBenko" data-travel-benko style="position:relative; z-index:3; margin-top:-2.5rem; border-top-left-radius:2.5rem; border-top-right-radius:2.5rem; background:#f8fafc; padding:2rem 1.5rem 6.5rem; box-shadow:0 -18px 34px -18px rgb(15 23 42 / 0.2);">
        ${renderTravelTabs({ activeTab, hasDestination, hotelCount: filteredItems.length, deps })}
        <div class="mt-5">
          ${shouldShowOffersLoading
            ? renderDataLoadingState(section, deps)
            : (restaurantsLoaded || allItems.length ? content : renderDataLoadingState(section, deps))}
        </div>
      </div>
    </section>
  `;
}

export function renderMarketplaceViewCore({
  state = {},
  dataLoaded = null,
  sectionKey = "restaurants",
  escapeHtmlFn,
  iconFn,
  getOptimizedImageUrlFn,
  isPlaceholderUrlFn,
  placeholderImage = "",
  normalizeRestaurantTypeFn,
  normalizeLeadTypeKeyFn,
  resolveRestaurantLogoFn,
  renderMapViewFn
} = {}) {
  const section = MARKETPLACE_SECTIONS[normalizeSectionKey(sectionKey)] || MARKETPLACE_SECTIONS.restaurants;
  const escapeHtml = asFn(escapeHtmlFn, (value = "") => String(value || ""));
  const icon = asFn(iconFn, () => "");
  const deps = {
    escapeHtml,
    icon,
    getOptimizedImageUrl: getOptimizedImageUrlFn,
    isPlaceholderUrl: isPlaceholderUrlFn,
    placeholderImage,
    resolveRestaurantLogo: resolveRestaurantLogoFn,
    renderMapView: renderMapViewFn,
    normalizeRestaurantType: normalizeRestaurantTypeFn,
    normalizeLeadTypeKey: normalizeLeadTypeKeyFn
  };
  const restaurantsLoaded = dataLoaded?.restaurants === true;

  if (section.key === "travel") {
    return renderTravelView({ state, dataLoaded, section, deps });
  }

  if (section.key === "restaurants") {
    return renderRestaurantsView({ state, dataLoaded, section, deps });
  }

  if (section.key === "shopping") {
    return renderShoppingView({ state, dataLoaded, section, deps });
  }

  const items = filterMarketplaceBusinessesCore(state, section.key, deps)
    .slice(0, LIST_LIMIT)
    .map((record) => withTypeLabel({
      ...record,
      __marketplaceType: resolveBusinessType(record, deps)
    }, section));
  const bestItems = items.slice(0, BEST_LIMIT);

  return `
    <section class="p-6 pb-24 animate-in slide-in-from-right-10 duration-500">
      ${items.length ? `
        <div style="margin-bottom:2rem;">
          <div class="flex gap-3 overflow-x-auto hide-scrollbar snap-x" style="-webkit-overflow-scrolling:touch; scrollbar-width:none;">
            ${bestItems.map((record) => renderBestCard(record, deps)).join("")}
          </div>
        </div>

        <div class="space-y-4">
          ${items.map((record) => renderListCard(record, deps)).join("")}
        </div>
      ` : (restaurantsLoaded ? renderEmptyState(section, deps) : renderDataLoadingState(section, deps))}
    </section>
  `;
}
