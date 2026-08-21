// Read-only Datenzugriff von Landing 2 - ueber die Firestore-REST-API.
//
// Kein Firebase-SDK, kein Import aus /shared/, kein Import aus core/, kein
// Import aus der Lead-Landing. Landing 2 teilt dadurch weder Code noch
// Firebase-Instanz noch IndexedDB-Persistenz mit der echten App und kann sie
// nicht beeinflussen.
//
// Es gibt hier ausschliesslich GET und :runQuery. Geschrieben wird nichts.
// Was die Seite spaeter zeigt - Bestellungen, GO-Vorgaenge, Speicherungen -
// sind Vorfuehrungen aus genau diesen gelesenen Daten und beruehren kein
// einziges Dokument.

import { LANDING2_API_KEY, LANDING2_FIRESTORE_BASE } from "./landing2-config.js";
import { firstText, num, text } from "./landing2-format.js";

const POSTS_LIMIT = 12;
const MENU_LIMIT = 120;
// Nachbarlokale fuer "Te Lokalet", "Kërko" und die Vision. Gelesen werden ein
// paar mehr, als gebraucht werden: Ohne Logo oder Titelbild taugt ein Lokal
// nicht als Kachel, und wie viele das sind, weiss man erst danach.
const NEIGHBOURS_LIMIT = 24;
const NEIGHBOURS_SHOWN = 6;
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
  return `${LANDING2_FIRESTORE_BASE}/${path}?key=${encodeURIComponent(LANDING2_API_KEY)}`;
}

function listUrl(path = "", pageSize = 50) {
  return `${LANDING2_FIRESTORE_BASE}/${path}?key=${encodeURIComponent(LANDING2_API_KEY)}&pageSize=${pageSize}`;
}

// Firestore-REST liefert getypte Werte ({stringValue}, {integerValue}, ...).
// Diese Funktion macht daraus normales JavaScript.
export function decodeValue(value) {
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

export function decodeFields(fields) {
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
//
// Die ersten beiden laufen nebeneinander, nicht nacheinander: Der Reihe nach
// gefragt kostete jeder Weg eine eigene Rundreise, und der zweite wird immer
// dann gebraucht, wenn die Adresse schon die Kennung des Lokals ist. Dort
// wartete man sonst eine volle Rundreise auf ein "gibt es nicht", bevor die
// erste Zeile Inhalt ueberhaupt angefragt wird.
async function resolveRestaurantId(rawKey = "") {
  const key = text(rawKey);
  if (!key) return "";

  const slug = slugify(key);

  const [routeDoc, direct] = await Promise.all([
    slug ? readDoc(`publicRoutes/${encodeURIComponent(slug)}`) : Promise.resolve(null),
    readDoc(`restaurants/${encodeURIComponent(key)}`)
  ]);

  const routeRestaurantId = firstText(routeDoc?.restaurantId, routeDoc?.canonicalRestaurantId);
  if (routeRestaurantId) return routeRestaurantId;
  if (direct) return key;

  if (!slug) return "";

  for (const field of ["publicSlug", "landingSlug"]) {
    const json = await requestJson(
      `${LANDING2_FIRESTORE_BASE}:runQuery?key=${encodeURIComponent(LANDING2_API_KEY)}`,
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

// Bildquellen exakt wie in core/menu/menu-doc-normalize-utils.js.
function resolveMenuImages(raw = {}) {
  const listed = [];
  [raw.imageUrls, raw.images, raw.image, raw.gallery, raw.photos, raw.media, raw.mediaUrls, raw.photoUrls, raw.pictureUrls]
    .forEach((entry) => {
      if (Array.isArray(entry)) listed.push(...entry);
      else if (typeof entry === "string" && entry.trim()) listed.push(entry);
    });
  const primary = firstText(
    raw.imageUrl, raw.imageURL, raw.image_url, raw.image,
    raw.photoUrl, raw.photoURL, raw.photo_url,
    raw.img, raw.imgUrl, raw.imgURL,
    raw.thumbnail, raw.thumb, raw.cover, raw.coverUrl, raw.coverURL
  );
  return [primary, ...listed.map((entry) => text(typeof entry === "string" ? entry : entry?.url))]
    .filter(Boolean);
}

// 1:1 aus core/menu/menu-input-utils.js (normalizeMenuTypeCore).
function normalizeMenuType(value) {
  const type = text(value).toLowerCase();
  if (type === "drink" || type === "drinks" || type === "beverage" || type === "getraenke" || type === "getränke") {
    return "drink";
  }
  return "food";
}

// 1:1 aus core/menu/menu-card-style-utils.js (normalizeMenuCardStyleCore).
// Die Kartenform steht am Artikel selbst, nicht an Speise/Getraenk: Wer seine
// Speisen als Getraenkekachel pflegt, bekommt genau diese Kachel - hier wie
// im echten Menue.
function normalizeMenuCardStyle(value = "", fallbackType = "food") {
  const normalizedType = normalizeMenuType(fallbackType);
  const raw = text(value).toLowerCase().replace(/[\s-]+/g, "_");
  if (raw === "testfirst_focus" || raw === "focus") return "testfirst_focus";
  if (raw === "testfirst_special" || raw === "special") return "testfirst_special";
  if (raw === "testfirst_drink" || raw === "drink") return "testfirst_drink";
  if (raw === "testfirst_food" || raw === "food") return "testfirst_food";
  return normalizedType === "drink" ? "testfirst_drink" : "testfirst_food";
}

// 1:1 aus resolveMenuDisplaySection im Profil-Renderer.
function resolveMenuDisplaySection(raw = {}) {
  const section = text(raw.menuSection || raw.displaySection || raw.menuPlacement).toLowerCase();
  if (section === "drink") return "drink";
  if (section === "food") return "food";
  return normalizeMenuType(raw.type) === "drink" ? "drink" : "food";
}

function normalizeMenuItem(raw = {}) {
  const images = resolveMenuImages(raw);
  const type = normalizeMenuType(raw.type);
  const menuVisibility = text(raw.menuVisibility).toLowerCase();

  return {
    id: text(raw.id),
    category: firstText(raw.category, "Tjera"),
    section: resolveMenuDisplaySection(raw),
    type,
    cardStyle: normalizeMenuCardStyle(raw.cardStyle, type),
    name: firstText(raw.name, raw.title, "Produkt"),
    description: firstText(raw.description, raw.desc),
    ingredients: firstText(raw.ingredients, raw.ingredient, raw.inhaltsstoffe),
    allergens: firstText(raw.allergens, raw.allergen),
    price: num(raw.price),
    imageUrl: images[0] || "",
    orderIndex: num(raw.orderIndex),
    // Wie isMenuItemHidden in der App - nicht "hidden", sondern menuHidden.
    hidden: raw.menuHidden === true || menuVisibility === "hidden",
    available: raw.available !== false
  };
}

// Feldreihenfolge exakt wie in core/feed/post-doc-normalize-utils.js, damit
// die Vorschau dieselben Posts findet wie das echte Profil.
function resolvePostMediaUrl(raw = {}) {
  const media = Array.isArray(raw.media) ? raw.media : [];
  return firstText(
    raw.url,
    raw.mediaUrl,
    media[0]?.url,
    media[0]?.thumbUrl,
    raw.imageUrl,
    raw.image,
    raw.photoUrl,
    raw.pictureUrl
  );
}

function resolvePostPosterUrl(raw = {}) {
  const media = Array.isArray(raw.media) ? raw.media : [];
  return firstText(
    raw.posterUrl,
    raw.thumbUrl,
    media[0]?.thumbUrl,
    media[0]?.posterUrl,
    raw.imageUrl,
    raw.image
  );
}

function isVideoPost(raw = {}) {
  const media = Array.isArray(raw.media) ? raw.media : [];
  const type = text(media[0]?.type || raw.mediaType || raw.type).toLowerCase();
  return raw.isVideo === true || type === "video" || type.startsWith("video/");
}

function normalizePost(raw = {}) {
  const mediaUrl = resolvePostMediaUrl(raw);
  const posterUrl = resolvePostPosterUrl(raw);
  const video = isVideoPost(raw);
  return {
    id: text(raw.id),
    // Video-Posts zeigen das Standbild, nicht die Videodatei.
    imageUrl: video ? (posterUrl || mediaUrl) : (mediaUrl || posterUrl),
    isVideo: video,
    caption: firstText(raw.caption, raw.title, raw.text, raw.description),
    likeCount: num(raw.likesCount ?? raw.likes) || 0,
    commentCount: num(raw.commentsCount ?? raw.comments) || 0,
    status: firstText(raw.status, "active"),
    createdAt: text(raw.createdAt)
  };
}

// Die Artikel im oeffentlichen Menue-Dokument koennen in mehreren Feldern
// liegen (items, food, drinks, categories ...) - dieselben Buckets, die
// core/menu/menu-item-coercion-utils.js kennt.
function collectMenuDocItems(data = {}) {
  const out = [];
  const push = (list, categoryHint = "") => {
    if (!Array.isArray(list)) return;
    list.forEach((raw) => {
      if (!raw || typeof raw !== "object") return;
      out.push(categoryHint && !raw.category ? { ...raw, category: categoryHint } : raw);
    });
  };

  push(data.items);
  push(data.menuItems);
  push(data.speisekarte);
  push(data.food || data.foodItems || data.speisen, "Ushqim");
  push(data.drinks || data.drinkItems || data.getraenke || data.beverages, "Pije");

  const nested = data.menu && typeof data.menu === "object" && !Array.isArray(data.menu) ? data.menu : null;
  if (Array.isArray(data.menu)) push(data.menu);
  if (nested) {
    push(nested.items);
    push(nested.menuItems);
    push(nested.food || nested.foodItems || nested.speisen, "Ushqim");
    push(nested.drinks || nested.drinkItems || nested.getraenke || nested.beverages, "Pije");
  }

  if (Array.isArray(data.categories)) {
    data.categories.forEach((cat) => {
      if (!cat || typeof cat !== "object") return;
      push(cat.items || cat.products || cat.entries, text(cat.name || cat.title || cat.category));
    });
  }

  return out;
}

// "Sot ne fokus" kommt aus public/offers und verweist auf Menue-Artikel.
// Fehlt am Fokus-Eintrag ein Bild, wird das des verknuepften Artikels
// genommen - sonst saehe die Karte anders aus als im echten Menue.
function normalizeFocusItems(offersData = {}, menuItems = []) {
  const items = Array.isArray(offersData?.items) ? offersData.items : [];
  const byId = new Map();
  menuItems.forEach((item) => {
    if (item.id) byId.set(String(item.id), item);
  });

  return items
    .filter((item) => item && item.active !== false)
    .map((item) => {
      const linkedId = firstText(
        item.menuItemId, item.targetMenuItemId, item.itemId,
        item.targetItemId, item.productId, item.targetProductId
      );
      const linked = linkedId ? byId.get(String(linkedId)) : null;
      const isVideo = String(item.mediaType || item.type || "").toLowerCase().startsWith("video") || item.isVideo === true;
      const ownImage = firstText(
        isVideo ? firstText(item.posterUrl, item.poster) : "",
        item.imageUrl,
        item.image,
        item.photoUrl
      );
      return {
        id: text(item.id),
        title: firstText(item.title, item.name, linked?.name, "Sot në fokus"),
        body: firstText(item.text, item.desc, item.description),
        imageUrl: ownImage || text(linked?.imageUrl),
        price: linked?.price ?? null,
        category: text(linked?.category)
      };
    })
    .filter((item) => item.title || item.imageUrl);
}

// public/meta wird beim Anlegen im CRM geschrieben und enthaelt Felder, die
// damals leer waren, als leere Zeichenkette - zum Beispiel titleImageUrl,
// wenn das Titelbild erst spaeter in der App hochgeladen wurde. Ein einfaches
// Ueberschreiben wuerde den echten Wert aus restaurants/{id} damit verdecken.
// Deshalb zaehlen leere Werte aus meta nicht.
export function mergePublicMeta(restaurant = null, meta = null) {
  const merged = { ...(restaurant || {}) };
  const source = meta || {};
  Object.keys(source).forEach((key) => {
    const value = source[key];
    if (value === null || value === undefined) return;
    if (typeof value === "string" && !value.trim()) return;
    if (Array.isArray(value) && !value.length) return;
    merged[key] = value;
  });
  return merged;
}

// Feldreihenfolge 1:1 aus resolveBusinessTitleImageRaw der echten App -
// inklusive der Listen coverImages/titleImages, aus denen sie das erste
// gefuellte Bild nimmt.
export function resolveTitleImage(source = {}) {
  const list = Array.isArray(source.coverImages)
    ? source.coverImages
    : (Array.isArray(source.titleImages) ? source.titleImages : []);
  const fromList = list.map((entry) => text(entry)).find(Boolean) || "";
  return firstText(
    source.titleImageUrl,
    source.coverImageUrl,
    source.coverUrl,
    source.heroUrl,
    fromList
  );
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

// Die Nachbarn: andere Lokale in Mnyra.
//
// Sie tragen die Abschnitte "Te Lokalet", "Kërko" und die Vision - dort geht
// es darum, dass dieses Lokal zwischen anderen steht und dass ueberall
// dieselbe Oberflaeche laeuft. Mit erfundenen Namen waere genau das die eine
// Stelle, an der die Seite luegt; deshalb sind es echte Lokale.
//
// Ohne Bild taugt ein Lokal nicht als Kachel - es bliebe ein grauer Kasten
// und wuerde die Reihe schwaecher machen, statt sie zu tragen.
export function pickNeighbours(rows = [], selfId = "", limit = NEIGHBOURS_SHOWN) {
  const skip = text(selfId);
  const seen = new Set();
  const out = [];
  for (const raw of Array.isArray(rows) ? rows : []) {
    if (!raw || text(raw.id) === skip) continue;
    const name = firstText(raw.name, raw.restaurantName);
    if (!name || seen.has(name.toLowerCase())) continue;
    const logoUrl = firstText(raw.logoUrl, raw.logo, raw.avatarUrl);
    const coverUrl = resolveTitleImage(raw);
    if (!logoUrl && !coverUrl) continue;
    seen.add(name.toLowerCase());
    out.push({
      id: text(raw.id),
      name,
      city: firstText(raw.city),
      type: firstText(raw.type, raw.customerType),
      logoUrl,
      coverUrl
    });
    if (out.length >= limit) break;
  }
  return out;
}

// hint: Die Kennung des Lokals, wenn der Server sie schon mitgeschickt hat
// (api/prezantim.js, <meta name="l2-restaurant">). Sie erspart die Suche
// danach - eine volle Rundreise, bevor ueberhaupt die erste Zeile Inhalt
// angefragt wird. Fehlt sie, wird gesucht wie sonst.
export async function loadLanding2Data(routeKey = "", { hint = "" } = {}) {
  const restaurantId = text(hint) || await resolveRestaurantId(routeKey);
  if (!restaurantId) {
    return { ok: false, reason: "not-found", restaurantId: "" };
  }

  const encodedId = encodeURIComponent(restaurantId);

  // Alles, was nur an der Kennung des Lokals haengt, laeuft nebeneinander.
  // Nacheinander gefragt kostete jede Zeile eine eigene Rundreise, in der
  // nichts anderes passiert.
  const [restaurant, meta, offers, publicMenu, postsRaw, neighbourRows] = await Promise.all([
    readDoc(`restaurants/${encodedId}`),
    readDoc(`restaurants/${encodedId}/public/meta`),
    readDoc(`restaurants/${encodedId}/public/offers`),
    readDoc(`restaurants/${encodedId}/public/menu`),
    readCollection(`restaurants/${encodedId}/socialPosts`, POSTS_LIMIT),
    readCollection("restaurants", NEIGHBOURS_LIMIT)
  ]);

  if (!restaurant && !meta) {
    return { ok: false, reason: "not-found", restaurantId };
  }

  const merged = mergePublicMeta(restaurant, meta);

  // Das oeffentliche Menue-Dokument ist die Hauptquelle; die Sammlung
  // menuItems ist der Rueckfall, wenn es noch nicht veroeffentlicht wurde.
  // Nur dieser Rueckfall braucht noch eine eigene Rundreise - er kommt selten
  // vor, und ohne das Menue-Dokument laesst sich nicht wissen, ob er noetig
  // ist.
  const menuDocItems = collectMenuDocItems(publicMenu || {});
  const menuItemsRaw = menuDocItems.length
    ? menuDocItems
    : await readCollection(`restaurants/${encodedId}/menuItems`, MENU_LIMIT);

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
    .filter((post) => post.status === "active" && post.imageUrl)
    .sort((a, b) => String(b.createdAt || "").localeCompare(String(a.createdAt || "")));

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
      coverUrl: resolveTitleImage(merged) || resolveTitleImage(restaurant || {}),
      instagram: firstText(merged.instagram, merged.insta),
      instagramUrl: firstText(merged.instagramUrl),
      tiktok: firstText(merged.tiktok, merged.tikTok),
      tiktokUrl: firstText(merged.tiktokUrl, merged.tikTokUrl),
      facebook: firstText(merged.facebook),
      facebookUrl: firstText(merged.facebookUrl),
      followers: num(merged.followerCount ?? merged.followers) || 0,
      publicSlug: firstText(merged.publicSlug, merged.landingSlug),
      locations: normalizeLocations(merged)
    },
    posts,
    menuItems,
    focusItems: normalizeFocusItems(offers || {}, menuItems),
    neighbours: pickNeighbours(neighbourRows, restaurantId)
  };
}
