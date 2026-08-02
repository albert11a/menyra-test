// Read-only Datenzugriff der Lead-Landing - ueber die Firestore-REST-API.
//
// Kein Firebase-SDK, kein Import aus /shared/, kein Import aus core/.
// Die Landing teilt dadurch weder Code noch Firebase-Instanz noch
// IndexedDB-Persistenz mit der echten App und kann sie nicht beeinflussen.
//
// Es gibt hier ausschliesslich GET/runQuery. Geschrieben wird nichts - und
// die Firestore-Rules erlauben Schreibzugriff auf restaurants/** ohnehin nur
// Inhaber und CEO.

import { LEAD_LANDING_API_KEY, LEAD_LANDING_FIRESTORE_BASE } from "./lead-landing-config.js";
import { firstText, num, text } from "./lead-landing-format.js";

const POSTS_LIMIT = 12;
const MENU_LIMIT = 120;
const REQUEST_TIMEOUT_MS = 9000;

function slugify(value = "") {
  let slug = text(value).toLowerCase();
  if (!slug) return "";
  try {
    slug = slug.normalize("NFKD").replace(/[̀-ͯ]/g, "");
  } catch {}
  return slug
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 72);
}

async function requestJson(url, init = null) {
  const controller = typeof AbortController !== "undefined" ? new AbortController() : null;
  const timer = controller
    ? setTimeout(() => {
      try { controller.abort(); } catch {}
    }, REQUEST_TIMEOUT_MS)
    : null;
  try {
    const response = await fetch(url, {
      ...(init || {}),
      signal: controller ? controller.signal : undefined
    });
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  } finally {
    if (timer) clearTimeout(timer);
  }
}

function docUrl(path = "") {
  return `${LEAD_LANDING_FIRESTORE_BASE}/${path}?key=${encodeURIComponent(LEAD_LANDING_API_KEY)}`;
}

function listUrl(path = "", pageSize = 50) {
  return `${LEAD_LANDING_FIRESTORE_BASE}/${path}?key=${encodeURIComponent(LEAD_LANDING_API_KEY)}&pageSize=${pageSize}`;
}

// Firestore-REST liefert getypte Werte ({stringValue}, {integerValue}, ...).
// Diese Funktion macht daraus normales JavaScript.
function decodeValue(value) {
  if (!value || typeof value !== "object") return null;
  if ("stringValue" in value) return value.stringValue;
  if ("integerValue" in value) return Number(value.integerValue);
  if ("doubleValue" in value) return Number(value.doubleValue);
  if ("booleanValue" in value) return !!value.booleanValue;
  if ("nullValue" in value) return null;
  if ("timestampValue" in value) return value.timestampValue;
  if ("arrayValue" in value) {
    const list = Array.isArray(value.arrayValue?.values) ? value.arrayValue.values : [];
    return list.map(decodeValue);
  }
  if ("mapValue" in value) return decodeFields(value.mapValue?.fields);
  if ("geoPointValue" in value) {
    return {
      lat: Number(value.geoPointValue?.latitude),
      lng: Number(value.geoPointValue?.longitude)
    };
  }
  if ("referenceValue" in value) return value.referenceValue;
  return null;
}

function decodeFields(fields) {
  if (!fields || typeof fields !== "object") return {};
  const out = {};
  Object.keys(fields).forEach((key) => {
    out[key] = decodeValue(fields[key]);
  });
  return out;
}

function docIdFromName(name = "") {
  const parts = String(name || "").split("/");
  return parts[parts.length - 1] || "";
}

async function readDoc(path = "") {
  const json = await requestJson(docUrl(path));
  if (!json || json.error) return null;
  return decodeFields(json.fields);
}

async function readCollection(path = "", pageSize = 50) {
  const json = await requestJson(listUrl(path, pageSize));
  if (!json || json.error || !Array.isArray(json.documents)) return [];
  return json.documents.map((entry) => ({
    id: docIdFromName(entry?.name),
    ...decodeFields(entry?.fields)
  }));
}

// Slug -> restaurantId. Erst der Routen-Index, dann die Doc-ID direkt,
// zuletzt eine Feldsuche.
async function resolveRestaurantId(rawKey = "") {
  const key = text(rawKey);
  if (!key) return "";

  const slug = slugify(key);

  if (slug) {
    const routeDoc = await readDoc(`publicRoutes/${encodeURIComponent(slug)}`);
    const routeRestaurantId = firstText(routeDoc?.restaurantId, routeDoc?.canonicalRestaurantId);
    if (routeRestaurantId) return routeRestaurantId;
  }

  const direct = await readDoc(`restaurants/${encodeURIComponent(key)}`);
  if (direct) return key;

  if (!slug) return "";

  for (const field of ["publicSlug", "landingSlug"]) {
    const json = await requestJson(
      `${LEAD_LANDING_FIRESTORE_BASE}:runQuery?key=${encodeURIComponent(LEAD_LANDING_API_KEY)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          structuredQuery: {
            from: [{ collectionId: "restaurants" }],
            where: {
              fieldFilter: {
                field: { fieldPath: field },
                op: "EQUAL",
                value: { stringValue: slug }
              }
            },
            limit: 1
          }
        })
      }
    );
    const row = Array.isArray(json) ? json.find((entry) => entry?.document) : null;
    const foundId = docIdFromName(row?.document?.name);
    if (foundId) return foundId;
  }

  return "";
}

function normalizeMenuItem(raw = {}) {
  const images = []
    .concat(Array.isArray(raw.imageUrls) ? raw.imageUrls : [])
    .concat(Array.isArray(raw.images) ? raw.images : [])
    .concat([raw.imageUrl, raw.image, raw.photoUrl])
    .map((entry) => text(typeof entry === "string" ? entry : entry?.url))
    .filter(Boolean);

  const crossSellItemIds = []
    .concat(raw.crossSellItemIds || raw.crossSellIds || raw.crossSell || raw.crossSelling || [])
    .map((entry) => text(entry))
    .filter(Boolean);

  return {
    id: text(raw.id),
    category: firstText(raw.category, "Sonstiges"),
    menuSection: text(raw.menuSection || raw.displaySection || raw.menuPlacement).toLowerCase(),
    name: firstText(raw.name, raw.title, "Produkt"),
    description: firstText(raw.description, raw.desc),
    ingredients: firstText(raw.ingredients, raw.ingredient, raw.inhaltsstoffe),
    allergens: firstText(raw.allergens, raw.allergen),
    price: num(raw.price),
    imageUrl: images[0] || "",
    woltUrl: firstText(raw.woltUrl, raw.wolt),
    crossSellItemIds,
    orderIndex: num(raw.orderIndex),
    hidden: raw.hidden === true || raw.statusHidden === true,
    available: raw.available !== false
  };
}

function normalizePost(raw = {}) {
  const images = []
    .concat(Array.isArray(raw.imageUrls) ? raw.imageUrls : [])
    .concat(Array.isArray(raw.images) ? raw.images : [])
    .concat([raw.imageUrl, raw.image, raw.mediaUrl, raw.posterUrl])
    .map((entry) => text(typeof entry === "string" ? entry : entry?.url))
    .filter(Boolean);

  return {
    id: text(raw.id),
    imageUrl: images[0] || "",
    caption: firstText(raw.caption, raw.text, raw.description),
    likeCount: num(raw.likeCount ?? raw.likes) || 0,
    commentCount: num(raw.commentCount ?? raw.comments) || 0,
    createdAt: text(raw.createdAt)
  };
}

function normalizeFocusItems(adsData = {}) {
  const items = Array.isArray(adsData?.items) ? adsData.items : [];
  return items
    .filter((item) => item && item.active !== false)
    .map((item) => ({
      id: text(item.id),
      title: text(item.title),
      body: firstText(item.text, item.body),
      imageUrl: text(item.imageUrl)
    }))
    .filter((item) => item.title || item.imageUrl);
}

function normalizeLocations(restaurant = {}) {
  const list = Array.isArray(restaurant.locations) ? restaurant.locations : [];
  const mapped = list
    .map((entry) => ({
      address: text(entry?.address),
      lat: num(entry?.lat),
      lng: num(entry?.lng)
    }))
    .filter((entry) => entry.address || (entry.lat !== null && entry.lng !== null));

  if (mapped.length) return mapped;

  const fallbackAddress = text(restaurant.address);
  const fallbackLat = num(restaurant.lat);
  const fallbackLng = num(restaurant.lng);
  if (fallbackAddress || (fallbackLat !== null && fallbackLng !== null)) {
    return [{ address: fallbackAddress, lat: fallbackLat, lng: fallbackLng }];
  }
  return [];
}

// Im Lead/CRM gepflegte Verkaufs-Inhalte (QR-Fotos, Pakete, Kontakt).
function normalizeSalesConfig(source = {}) {
  const raw = source && typeof source === "object" ? source : {};
  const photos = []
    .concat(Array.isArray(raw.qrPhotos) ? raw.qrPhotos : [])
    .map((entry) => (typeof entry === "string"
      ? { url: text(entry), caption: "" }
      : { url: text(entry?.url), caption: text(entry?.caption) }))
    .filter((entry) => entry.url);

  const packages = (Array.isArray(raw.packages) ? raw.packages : [])
    .map((entry) => ({
      key: text(entry?.key),
      name: text(entry?.name),
      price: text(entry?.price),
      period: text(entry?.period),
      note: text(entry?.note),
      highlight: entry?.highlight === true,
      features: (Array.isArray(entry?.features) ? entry.features : []).map((f) => text(f)).filter(Boolean)
    }))
    .filter((entry) => entry.name);

  return {
    qrPhotos: photos,
    packages,
    contactPhone: text(raw.contactPhone),
    contactName: text(raw.contactName),
    intro: text(raw.intro)
  };
}

export async function loadLeadLandingData(routeKey = "") {
  const restaurantId = await resolveRestaurantId(routeKey);
  if (!restaurantId) {
    return { ok: false, reason: "not-found", restaurantId: "" };
  }

  const encodedId = encodeURIComponent(restaurantId);
  const [restaurant, meta, ads] = await Promise.all([
    readDoc(`restaurants/${encodedId}`),
    readDoc(`restaurants/${encodedId}/public/meta`),
    readDoc(`restaurants/${encodedId}/public/ads`)
  ]);

  if (!restaurant && !meta) {
    return { ok: false, reason: "not-found", restaurantId };
  }

  const merged = { ...(restaurant || {}), ...(meta || {}) };

  const [postsRaw, menuItemsRaw] = await Promise.all([
    readCollection(`restaurants/${encodedId}/socialPosts`, POSTS_LIMIT),
    readCollection(`restaurants/${encodedId}/menuItems`, MENU_LIMIT)
  ]);

  const menuItems = menuItemsRaw
    .map(normalizeMenuItem)
    .filter((item) => !item.hidden)
    .sort((a, b) => {
      const ai = a.orderIndex === null ? Number.MAX_SAFE_INTEGER : a.orderIndex;
      const bi = b.orderIndex === null ? Number.MAX_SAFE_INTEGER : b.orderIndex;
      if (ai !== bi) return ai - bi;
      return a.name.localeCompare(b.name);
    });

  const posts = postsRaw
    .map(normalizePost)
    .filter((post) => post.imageUrl)
    .sort((a, b) => String(b.createdAt || "").localeCompare(String(a.createdAt || "")));

  const salesSource = merged.landingSales && typeof merged.landingSales === "object"
    ? merged.landingSales
    : {};

  return {
    ok: true,
    restaurantId,
    profile: {
      name: firstText(merged.name, merged.restaurantName, "Business"),
      bio: firstText(merged.bio, merged.description),
      city: firstText(merged.city, "Kosovo"),
      address: firstText(merged.address),
      phone: firstText(merged.phone),
      type: firstText(merged.type, merged.customerType),
      currency: firstText(merged.currencyCode, merged.currency, "EUR"),
      openingHours: firstText(merged.openingHours, merged.hours),
      logoUrl: firstText(merged.logoUrl, merged.logo, merged.avatarUrl),
      coverUrl: firstText(merged.titleImageUrl, merged.coverImageUrl, merged.coverUrl, merged.heroUrl),
      instagram: firstText(merged.instagram, merged.insta),
      instagramUrl: firstText(merged.instagramUrl),
      tiktok: firstText(merged.tiktok, merged.tikTok),
      tiktokUrl: firstText(merged.tiktokUrl, merged.tikTokUrl),
      facebook: firstText(merged.facebook),
      facebookUrl: firstText(merged.facebookUrl),
      woltUrl: firstText(merged.woltUrl, merged.wolt),
      followers: num(merged.followerCount ?? merged.followers) || 0,
      publicSlug: firstText(merged.publicSlug, merged.landingSlug),
      businessNameColorPart1: firstText(merged.businessNameColorPart1, merged.landingBusinessNameColorPart1),
      businessNameColorPart2: firstText(merged.businessNameColorPart2, merged.landingBusinessNameColorPart2),
      locations: normalizeLocations(merged)
    },
    posts,
    menuItems,
    focusItems: normalizeFocusItems(ads || {}),
    sales: normalizeSalesConfig(salesSource)
  };
}
