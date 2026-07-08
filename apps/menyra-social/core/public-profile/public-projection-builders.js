function isRecord(value) {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

function asRecord(value) {
  return isRecord(value) ? value : {};
}

function hasOwn(record, key) {
  return Object.prototype.hasOwnProperty.call(asRecord(record), key);
}

function collectSources(input, nestedKeys = []) {
  const root = asRecord(input);
  const nested = nestedKeys
    .map((key) => asRecord(root[key]))
    .filter((record) => Object.keys(record).length > 0);
  return [...nested, root];
}

function readFirst(sources, keys = []) {
  for (const source of sources) {
    for (const key of keys) {
      if (
        hasOwn(source, key) &&
        source[key] !== undefined &&
        source[key] !== null
      ) {
        return source[key];
      }
    }
  }
  return undefined;
}

function hasAny(sources, keys = []) {
  return sources.some((source) => keys.some((key) => hasOwn(source, key)));
}

function cleanText(value) {
  if (typeof value === "string") return value.trim();
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return "";
}

function cleanSlug(value) {
  return cleanText(value)
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function cleanUrl(value) {
  const text = cleanText(value);
  if (!text) return "";
  if (/^(https?:\/\/|mailto:|tel:|\/)/i.test(text)) return text;
  return "";
}

function cleanCurrency(value) {
  return cleanText(value)
    .toUpperCase()
    .replace(/[^A-Z]/g, "")
    .slice(0, 3);
}

function cleanSocialReference(value) {
  const text = cleanText(value);
  if (!text) return "";
  const url = cleanUrl(text);
  if (url) return url;
  return /^@?[a-z0-9._-]+$/i.test(text) ? text : "";
}

function cleanStringList(value) {
  const list = Array.isArray(value)
    ? value
    : typeof value === "string"
      ? value.split(/[\n,;|]/)
      : [];
  return Array.from(new Set(list.map(cleanText).filter(Boolean)));
}

function normalizeBoolean(value) {
  return typeof value === "boolean" ? value : undefined;
}

function normalizeFiniteNumber(value) {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (typeof value !== "string") return null;
  let text = value.trim();
  if (!text) return null;
  text = text.replace(/\s+/g, "").replace(/[^0-9,.-]/g, "");
  if (!text || !/[0-9]/.test(text)) return null;
  const commaIndex = text.lastIndexOf(",");
  const dotIndex = text.lastIndexOf(".");
  if (commaIndex >= 0 && dotIndex >= 0) {
    const decimalIndex = Math.max(commaIndex, dotIndex);
    const whole = text.slice(0, decimalIndex).replace(/[.,]/g, "");
    const fraction = text.slice(decimalIndex + 1).replace(/[.,]/g, "");
    text = `${whole}.${fraction}`;
  } else if (commaIndex >= 0) {
    text = text.replace(/,/g, ".");
  }
  const parsed = Number(text);
  return Number.isFinite(parsed) ? parsed : null;
}

function normalizeInteger(value) {
  const numeric = normalizeFiniteNumber(value);
  return numeric === null ? null : Math.round(numeric);
}

function normalizePercent(value, fallback = null) {
  const numeric = normalizeFiniteNumber(value);
  if (numeric === null) return fallback;
  return Math.max(0, Math.min(100, numeric));
}

function normalizeSerializableDate(value) {
  if (value === null || value === undefined || value === "") return undefined;
  if (typeof value === "string" || typeof value === "number") return value;
  try {
    if (value instanceof Date) {
      return Number.isFinite(value.getTime()) ? value.toISOString() : undefined;
    }
    if (typeof value?.toDate === "function") {
      const date = value.toDate();
      return date instanceof Date && Number.isFinite(date.getTime())
        ? date.toISOString()
        : undefined;
    }
    if (Number.isFinite(Number(value?.seconds))) {
      const millis =
        Number(value.seconds) * 1000 +
        Math.floor(Number(value.nanoseconds || 0) / 1000000);
      const date = new Date(millis);
      return Number.isFinite(date.getTime()) ? date.toISOString() : undefined;
    }
  } catch {}
  return undefined;
}

function assignText(target, key, value) {
  const text = cleanText(value);
  if (text) target[key] = text;
}

function assignUrl(target, key, value) {
  const url = cleanUrl(value);
  if (url) target[key] = url;
}

function assignBoolean(target, key, value) {
  const normalized = normalizeBoolean(value);
  if (normalized !== undefined) target[key] = normalized;
}

function assignNumber(
  target,
  key,
  value,
  { includeNull = false, integer = false } = {},
) {
  const normalized = integer
    ? normalizeInteger(value)
    : normalizeFiniteNumber(value);
  if (normalized !== null || includeNull) target[key] = normalized;
}

function assignSerializableDate(target, key, value) {
  const normalized = normalizeSerializableDate(value);
  if (normalized !== undefined) target[key] = normalized;
}

function normalizePublicAddress(value) {
  const direct = cleanText(value);
  if (direct) return direct;
  const source = asRecord(value);
  const streetLine = [
    cleanText(source.street || source.streetName),
    cleanText(source.number || source.streetNumber),
  ]
    .filter(Boolean)
    .join(" ");
  const cityLine = [
    cleanText(source.postalCode || source.zip),
    cleanText(source.city),
  ]
    .filter(Boolean)
    .join(" ");
  return [streetLine, cityLine, cleanText(source.country)]
    .filter(Boolean)
    .join(", ");
}

function normalizePublicImageList(value) {
  const items = Array.isArray(value) ? value : [];
  return items.flatMap((item) => {
    if (typeof item === "string") {
      const url = cleanUrl(item);
      return url ? [url] : [];
    }
    const source = asRecord(item);
    const url = cleanUrl(source.url || source.src || source.imageUrl);
    if (!url) return [];
    const image = { url };
    assignText(image, "alt", source.alt || source.label);
    assignText(image, "type", source.type || source.kind);
    if (hasOwn(source, "cropX"))
      image.cropX = normalizePercent(source.cropX, 50);
    if (hasOwn(source, "cropY"))
      image.cropY = normalizePercent(source.cropY, 50);
    return [image];
  });
}

function normalizePublicSocialLinks(value) {
  const source = asRecord(value);
  const links = {};
  [
    ["instagram", ["instagram", "instagramUrl"]],
    ["tiktok", ["tiktok", "tiktokUrl", "tikTokUrl"]],
    ["facebook", ["facebook", "facebookUrl"]],
    ["youtube", ["youtube", "youtubeUrl"]],
    ["website", ["website", "websiteUrl"]],
    ["whatsapp", ["whatsapp", "whatsappUrl"]],
  ].forEach(([key, aliases]) => {
    const value = readFirst([source], aliases);
    if (key === "instagram" || key === "tiktok") {
      const reference = cleanSocialReference(value);
      if (reference) links[key] = reference;
      return;
    }
    assignUrl(links, key, value);
  });
  return links;
}

function normalizePublicContact(value) {
  const source = asRecord(value);
  const contact = {};
  assignText(contact, "phone", source.phone || source.publicPhone);
  assignUrl(contact, "website", source.website || source.websiteUrl);
  assignUrl(contact, "whatsappUrl", source.whatsappUrl || source.whatsapp);
  assignText(contact, "label", source.label || source.contactLabel);
  return contact;
}

function normalizePublicTable(value) {
  const source = asRecord(value);
  const table = {};
  assignText(table, "id", source.id || source.tableId);
  if (hasOwn(source, "number") || hasOwn(source, "tableNumber")) {
    const rawNumber = source.number ?? source.tableNumber;
    const numeric = normalizeFiniteNumber(rawNumber);
    if (numeric !== null) table.number = numeric;
    else assignText(table, "number", rawNumber);
  }
  assignText(table, "label", source.label || source.name || source.displayName);
  return Object.keys(table).length ? table : null;
}

function readRestaurantId(sources) {
  return readFirst(sources, [
    "restaurantId",
    "canonicalRestaurantId",
    "landingRestaurantId",
    "businessId",
    "id",
  ]);
}

function readSlug(sources) {
  return readFirst(sources, [
    "slug",
    "canonicalSlug",
    "publicSlug",
    "landingSlug",
    "handle",
  ]);
}

export function buildPublicRouteProjection(input = {}) {
  const sources = collectSources(input, [
    "publicRoute",
    "route",
    "restaurant",
    "business",
  ]);
  const output = {};
  const slug = cleanSlug(readSlug(sources));
  const restaurantId = cleanText(readRestaurantId(sources));
  if (slug) output.slug = slug;
  if (restaurantId) output.restaurantId = restaurantId;
  if (slug || restaurantId) output.type = "business";
  const surface = cleanText(readFirst(sources, ["surface", "publicSurface"]));
  if (surface) output.surface = surface;
  else if (slug || restaurantId) output.surface = "profile";
  assignBoolean(output, "public", readFirst(sources, ["public", "isPublic"]));
  const canonicalPath = cleanText(
    readFirst(sources, ["canonicalPath", "canonicalPublicPath"]),
  );
  const menuPath = cleanText(
    readFirst(sources, ["menuPath", "publicMenuPath"]),
  );
  if (canonicalPath) output.canonicalPath = canonicalPath;
  else if (slug) output.canonicalPath = `/${encodeURIComponent(slug)}`;
  if (menuPath) output.menuPath = menuPath;
  else if (slug) output.menuPath = `/${encodeURIComponent(slug)}/menu`;
  return output;
}

export function buildPublicProfileProjection(input = {}) {
  const sources = collectSources(input, [
    "publicProfile",
    "profile",
    "restaurant",
    "business",
  ]);
  const output = {};
  assignText(output, "restaurantId", readRestaurantId(sources));
  const slug = cleanSlug(readSlug(sources));
  if (slug) output.slug = slug;
  assignText(
    output,
    "name",
    readFirst(sources, ["name", "restaurantName", "businessName"]),
  );
  assignText(output, "displayName", readFirst(sources, ["displayName"]));
  assignText(output, "bio", readFirst(sources, ["bio", "publicBio"]));
  assignText(output, "about", readFirst(sources, ["about", "publicAbout"]));
  assignText(
    output,
    "description",
    readFirst(sources, ["description", "publicDescription"]),
  );
  assignText(output, "city", readFirst(sources, ["city", "publicCity"]));
  assignText(
    output,
    "country",
    readFirst(sources, ["country", "publicCountry"]),
  );
  const address = normalizePublicAddress(
    readFirst(sources, ["address", "publicAddress"]),
  );
  if (address) output.address = address;
  assignText(output, "phone", readFirst(sources, ["phone", "publicPhone"]));
  assignUrl(
    output,
    "website",
    readFirst(sources, ["website", "websiteUrl", "publicWebsite"]),
  );
  const instagram = cleanSocialReference(readFirst(sources, ["instagram"]));
  if (instagram) output.instagram = instagram;
  assignUrl(output, "instagramUrl", readFirst(sources, ["instagramUrl"]));
  const tiktok = cleanSocialReference(readFirst(sources, ["tiktok", "tikTok"]));
  if (tiktok) output.tiktok = tiktok;
  assignUrl(
    output,
    "tiktokUrl",
    readFirst(sources, ["tiktokUrl", "tikTokUrl"]),
  );
  assignUrl(output, "facebookUrl", readFirst(sources, ["facebookUrl"]));
  assignUrl(output, "youtubeUrl", readFirst(sources, ["youtubeUrl"]));
  assignUrl(output, "whatsappUrl", readFirst(sources, ["whatsappUrl"]));
  assignUrl(output, "avatarUrl", readFirst(sources, ["avatarUrl", "avatar"]));
  assignUrl(
    output,
    "logoUrl",
    readFirst(sources, ["logoUrl", "logo", "logoURL"]),
  );
  assignUrl(output, "coverUrl", readFirst(sources, ["coverUrl"]));
  assignUrl(output, "coverImageUrl", readFirst(sources, ["coverImageUrl"]));
  assignUrl(output, "titleImageUrl", readFirst(sources, ["titleImageUrl"]));
  assignUrl(output, "heroUrl", readFirst(sources, ["heroUrl"]));
  assignText(output, "businessType", readFirst(sources, ["businessType"]));
  assignText(
    output,
    "category",
    readFirst(sources, ["category", "publicCategory"]),
  );
  assignText(
    output,
    "type",
    readFirst(sources, ["type", "customerType", "restaurantType"]),
  );
  assignBoolean(output, "public", readFirst(sources, ["public", "isPublic"]));

  const socialLinks = normalizePublicSocialLinks(
    readFirst(sources, ["socialLinks", "publicSocialLinks"]),
  );
  if (Object.keys(socialLinks).length) output.socialLinks = socialLinks;
  const contact = normalizePublicContact(
    readFirst(sources, ["publicContact", "contact"]),
  );
  if (Object.keys(contact).length) output.publicContact = contact;
  const images = normalizePublicImageList(
    readFirst(sources, ["images", "publicImages"]),
  );
  if (images.length) output.images = images;
  const coverImages = normalizePublicImageList(
    readFirst(sources, ["coverImages"]),
  );
  if (coverImages.length) output.coverImages = coverImages;
  return output;
}

export function buildPublicMetaProjection(input = {}) {
  const sources = collectSources(input, [
    "publicMeta",
    "meta",
    "restaurant",
    "business",
  ]);
  const output = {};
  assignText(output, "restaurantId", readRestaurantId(sources));
  const slug = cleanSlug(readSlug(sources));
  if (slug) output.slug = slug;
  assignText(
    output,
    "name",
    readFirst(sources, ["name", "restaurantName", "businessName"]),
  );
  assignText(output, "type", readFirst(sources, ["type", "restaurantType"]));
  assignText(output, "customerType", readFirst(sources, ["customerType"]));
  assignText(output, "businessType", readFirst(sources, ["businessType"]));
  assignText(
    output,
    "category",
    readFirst(sources, ["category", "publicCategory"]),
  );
  assignText(output, "city", readFirst(sources, ["city", "publicCity"]));
  assignText(
    output,
    "country",
    readFirst(sources, ["country", "publicCountry"]),
  );
  const address = normalizePublicAddress(
    readFirst(sources, ["address", "publicAddress"]),
  );
  if (address) output.address = address;
  assignText(output, "phone", readFirst(sources, ["phone", "publicPhone"]));
  const instagram = cleanSocialReference(readFirst(sources, ["instagram"]));
  if (instagram) output.instagram = instagram;
  assignUrl(output, "instagramUrl", readFirst(sources, ["instagramUrl"]));
  const tiktok = cleanSocialReference(readFirst(sources, ["tiktok", "tikTok"]));
  if (tiktok) output.tiktok = tiktok;
  assignUrl(
    output,
    "tiktokUrl",
    readFirst(sources, ["tiktokUrl", "tikTokUrl"]),
  );
  assignUrl(
    output,
    "logoUrl",
    readFirst(sources, ["logoUrl", "logo", "logoURL"]),
  );
  assignUrl(output, "coverUrl", readFirst(sources, ["coverUrl"]));
  assignText(
    output,
    "visibility",
    readFirst(sources, ["visibility", "publicVisibility"]),
  );
  [
    "public",
    "profileVisible",
    "menuVisible",
    "postsVisible",
    "offersVisible",
    "adsVisible",
    "menuAvailabilityBadgeVisible",
    "menuStatusBadgeVisible",
    "tableQrEnabled",
    "offersEnabled",
    "adsEnabled",
  ].forEach((key) => assignBoolean(output, key, readFirst(sources, [key])));
  if (hasAny(sources, ["tableQrCount"])) {
    assignNumber(output, "tableQrCount", readFirst(sources, ["tableQrCount"]), {
      includeNull: true,
      integer: true,
    });
  }
  const rawTables = readFirst(sources, ["tables", "publicTables", "qrTables"]);
  if (Array.isArray(rawTables)) {
    output.tables = rawTables.map(normalizePublicTable).filter(Boolean);
  }
  assignSerializableDate(
    output,
    "updatedAt",
    readFirst(sources, ["updatedAt"]),
  );
  return output;
}

function normalizePublicOfferItem(value, index = 0) {
  const source = asRecord(value);
  const id = cleanText(
    source.id || source.offerId || source._id || `offer_${index}`,
  );
  const output = { id };
  assignText(output, "title", source.title || source.name);
  assignText(output, "description", source.description || source.desc);
  assignText(output, "text", source.text);
  assignText(output, "city", source.city);
  assignText(output, "location", source.location || source.locationLabel);
  assignText(output, "itemId", source.itemId || source.targetItemId);
  assignText(
    output,
    "menuItemId",
    source.menuItemId || source.targetMenuItemId,
  );
  assignText(output, "productId", source.productId || source.targetProductId);
  assignText(
    output,
    "targetCategory",
    source.targetCategory || source.categoryTarget || source.menuCategory,
  );
  assignText(output, "referenceId", source.referenceId);
  assignUrl(
    output,
    "imageUrl",
    source.imageUrl || source.image || source.photoUrl || source.offerImageUrl,
  );
  assignUrl(output, "videoUrl", source.videoUrl || source.video || source.clipUrl);
  assignUrl(output, "posterUrl", source.posterUrl || source.poster || source.videoPoster);
  if (
    cleanText(source.mediaType).toLowerCase() === "video"
    || cleanUrl(source.videoUrl || source.video || source.clipUrl)
  ) {
    output.mediaType = "video";
  }
  assignUrl(output, "mediaUrl", source.mediaUrl);
  assignUrl(output, "referenceUrl", source.referenceUrl);
  assignText(
    output,
    "ctaLabel",
    source.ctaLabel || source.bookingCtaLabel || source.contactCtaLabel,
  );
  assignUrl(output, "ctaUrl", source.ctaUrl);
  assignUrl(output, "bookingUrl", source.bookingUrl);
  assignUrl(output, "contactUrl", source.contactUrl);
  assignText(
    output,
    "offerBadgeLabel",
    source.offerBadgeLabel || source.travelOfferBadgeLabel || source.badgeLabel,
  );
  assignText(
    output,
    "offerDurationLabel",
    source.offerDurationLabel || source.nightsDaysLabel || source.durationLabel,
  );
  assignText(
    output,
    "distanceCenter",
    source.distanceCenter || source.distanceToCenter || source.centerDistance,
  );
  assignText(output, "distanceToCenter", source.distanceToCenter);
  assignText(output, "centerDistance", source.centerDistance);
  assignText(
    output,
    "distanceBeach",
    source.distanceBeach || source.distanceToBeach || source.beachDistance,
  );
  assignText(output, "distanceToBeach", source.distanceToBeach);
  assignText(output, "beachDistance", source.beachDistance);
  assignText(
    output,
    "priceUnit",
    source.priceUnit || source.hotelPriceUnit || source.offerPriceUnit,
  );
  const currency = cleanCurrency(source.currency);
  if (currency) output.currency = currency;
  if (source.travelOffer === true && !hasOwn(source, "isTravelOffer")) {
    output.isTravelOffer = true;
  }
  [
    ["price", ["price", "publicPrice"]],
    ["startingPrice", ["startingPrice"]],
    ["priceFrom", ["priceFrom", "fromPrice"]],
    ["hotelStartingPrice", ["hotelStartingPrice"]],
  ].forEach(([key, aliases]) => {
    if (aliases.some((alias) => hasOwn(source, alias))) {
      assignNumber(output, key, readFirst([source], aliases), {
        includeNull: true,
      });
    }
  });
  [
    "active",
    "isTravelOffer",
    "directCenter",
    "inCenter",
    "beachfront",
    "onBeach",
  ].forEach((key) => assignBoolean(output, key, source[key]));
  if (hasOwn(source, "cropX"))
    output.cropX = normalizePercent(source.cropX, 50);
  if (hasOwn(source, "cropY"))
    output.cropY = normalizePercent(source.cropY, 50);
  const features = cleanStringList(
    source.features || source.offerFeatures || source.featureLabels,
  );
  if (features.length) output.features = features;
  const labels = cleanStringList(source.labels || source.publicLabels);
  if (labels.length) output.labels = labels;
  return output;
}

export function buildPublicOffersProjection(input = {}) {
  const sources = collectSources(input, ["publicOffers", "offers"]);
  const output = {};
  assignText(output, "restaurantId", readRestaurantId(sources));
  assignBoolean(output, "public", readFirst(sources, ["public", "isPublic"]));
  const rawItems = readFirst(sources, ["items", "offers", "focusItems"]);
  output.items = (Array.isArray(rawItems) ? rawItems : [])
    .map(normalizePublicOfferItem)
    .filter(Boolean);
  assignSerializableDate(
    output,
    "updatedAt",
    readFirst(sources, ["updatedAt"]),
  );
  return output;
}

function normalizePublicAdStatus(value) {
  const status = cleanText(value)
    .toLowerCase()
    .replace(/[^a-z]+/g, "_")
    .replace(/^_+|_+$/g, "");
  return status === "approved" || status === "accepted" ? "approved" : "";
}

function normalizePublicAdItem(value, index = 0) {
  const source = asRecord(value);
  const status = normalizePublicAdStatus(
    source.status || source.approvalStatus,
  );
  if (status !== "approved" || source.active === false) return null;
  const id = cleanText(source.id || source.adId || source._id || `ad_${index}`);
  const output = { id };
  assignText(output, "title", source.title || source.name);
  assignText(output, "copy", source.copy);
  assignText(output, "text", source.text || source.description || source.desc);
  assignUrl(
    output,
    "imageUrl",
    source.imageUrl || source.image || source.photoUrl,
  );
  assignUrl(output, "mediaUrl", source.mediaUrl);
  assignUrl(output, "ctaUrl", source.ctaUrl);
  assignText(output, "ctaLabel", source.ctaLabel);
  assignText(
    output,
    "category",
    source.category || source.adCategory || source.typeLabel,
  );
  assignText(
    output,
    "priceSegment",
    source.priceSegment || source.priceRange || source.priceLabel,
  );
  if (hasOwn(source, "active")) output.active = true;
  output.status = status;
  ["bestChoiceBadgeEnabled", "deliveryBadgeEnabled", "woltEnabled"].forEach(
    (key) => {
      assignBoolean(output, key, source[key]);
    },
  );
  if (hasOwn(source, "cropX"))
    output.cropX = normalizePercent(source.cropX, 50);
  if (hasOwn(source, "cropY"))
    output.cropY = normalizePercent(source.cropY, 50);
  if (hasOwn(source, "displayPriority")) {
    assignNumber(output, "displayPriority", source.displayPriority, {
      includeNull: true,
      integer: true,
    });
  }
  assignSerializableDate(output, "publishedAt", source.publishedAt);
  assignSerializableDate(output, "expiresAt", source.expiresAt);
  return output;
}

export function buildPublicAdsProjection(input = {}) {
  const sources = collectSources(input, ["publicAds", "ads"]);
  const output = {};
  assignText(output, "restaurantId", readRestaurantId(sources));
  assignBoolean(output, "public", readFirst(sources, ["public", "isPublic"]));
  const rawItems = readFirst(sources, ["items", "ads"]);
  output.items = (Array.isArray(rawItems) ? rawItems : [])
    .map(normalizePublicAdItem)
    .filter(Boolean);
  assignSerializableDate(
    output,
    "updatedAt",
    readFirst(sources, ["updatedAt"]),
  );
  return output;
}
