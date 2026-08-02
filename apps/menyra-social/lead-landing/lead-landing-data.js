// Read-only Datenzugriff der Lead-Landing.
//
// WICHTIG: Dieses Modul liest ausschliesslich. Es gibt hier bewusst kein
// setDoc/updateDoc/addDoc und keinen Import aus der Social-App. Die Landing
// zeigt echte Profildaten, kann sie aber strukturell nicht veraendern - die
// Firestore-Rules erlauben Schreibzugriff auf restaurants/** ohnehin nur
// Inhaber und CEO.

import { db } from "/shared/firebase-config.js";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  where
} from "/shared/vendor/firebase/11.0.0/firebase-firestore.js";
import { firstText, num, text } from "./lead-landing-format.js";

const POSTS_LIMIT = 12;
const MENU_LIMIT = 120;

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

function snapData(snapshot) {
  if (!snapshot) return null;
  const exists = typeof snapshot.exists === "function" ? snapshot.exists() : snapshot.exists;
  if (!exists) return null;
  const data = typeof snapshot.data === "function" ? snapshot.data() : snapshot.data;
  return data && typeof data === "object" ? data : null;
}

// Slug -> restaurantId. Drei Wege, damit sowohl /oferta/<slug> als auch
// /oferta/<restaurantId> funktionieren.
async function resolveRestaurantId(rawKey = "") {
  const key = text(rawKey);
  if (!key) return "";

  const slug = slugify(key);
  if (slug) {
    try {
      const routeData = snapData(await getDoc(doc(db, "publicRoutes", slug)));
      const routeRestaurantId = firstText(routeData?.restaurantId, routeData?.canonicalRestaurantId);
      if (routeRestaurantId) return routeRestaurantId;
    } catch {}
  }

  try {
    const direct = snapData(await getDoc(doc(db, "restaurants", key)));
    if (direct) return key;
  } catch {}

  for (const field of ["publicSlug", "landingSlug"]) {
    if (!slug) break;
    try {
      const snapshot = await getDocs(query(collection(db, "restaurants"), where(field, "==", slug), limit(1)));
      const first = snapshot.docs?.[0];
      if (first?.id) return first.id;
    } catch {}
  }

  return "";
}

async function readRestaurant(restaurantId = "") {
  try {
    return snapData(await getDoc(doc(db, "restaurants", restaurantId))) || {};
  } catch {
    return {};
  }
}

async function readPublicDoc(restaurantId = "", docId = "") {
  try {
    return snapData(await getDoc(doc(db, "restaurants", restaurantId, "public", docId))) || {};
  } catch {
    return {};
  }
}

async function readPosts(restaurantId = "") {
  try {
    const snapshot = await getDocs(query(
      collection(db, "restaurants", restaurantId, "socialPosts"),
      orderBy("createdAt", "desc"),
      limit(POSTS_LIMIT)
    ));
    return snapshot.docs.map((entry) => ({ id: entry.id, ...(entry.data() || {}) }));
  } catch {
    // Ohne createdAt-Index/Feld faellt die Query aus - dann ungeordnet lesen.
    try {
      const snapshot = await getDocs(query(
        collection(db, "restaurants", restaurantId, "socialPosts"),
        limit(POSTS_LIMIT)
      ));
      return snapshot.docs.map((entry) => ({ id: entry.id, ...(entry.data() || {}) }));
    } catch {
      return [];
    }
  }
}

async function readMenuItems(restaurantId = "") {
  try {
    const snapshot = await getDocs(query(
      collection(db, "restaurants", restaurantId, "menuItems"),
      limit(MENU_LIMIT)
    ));
    return snapshot.docs.map((entry) => ({ id: entry.id, ...(entry.data() || {}) }));
  } catch {
    return [];
  }
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
    commentCount: num(raw.commentCount ?? raw.comments) || 0
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

// Die im Lead/CRM gepflegten Verkaufs-Inhalte (QR-Fotos, Pakete, Notiz).
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

  const [restaurant, meta, ads] = await Promise.all([
    readRestaurant(restaurantId),
    readPublicDoc(restaurantId, "meta"),
    readPublicDoc(restaurantId, "ads")
  ]);

  const merged = { ...restaurant, ...meta };
  const hasAnyProfile = !!firstText(merged.name, merged.restaurantName);
  if (!hasAnyProfile && !Object.keys(restaurant).length) {
    return { ok: false, reason: "not-found", restaurantId };
  }

  const [posts, menuItemsRaw] = await Promise.all([
    readPosts(restaurantId),
    readMenuItems(restaurantId)
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
    posts: posts.map(normalizePost).filter((post) => post.imageUrl),
    menuItems,
    focusItems: normalizeFocusItems(ads),
    sales: normalizeSalesConfig(salesSource)
  };
}
