"use strict";

class OrderValidationError extends Error {
  constructor(message, code = "invalid-argument", details = {}) {
    super(message);
    this.name = "OrderValidationError";
    this.code = code;
    this.details = details;
  }
}

const MAX_ORDER_ITEMS = 80;
const MAX_ITEM_QUANTITY = 99;

function asText(value, fallback = "") {
  const text = String(value ?? "").trim();
  return text || fallback;
}

function truncateText(value, maxLength, fallback = "") {
  const text = asText(value, fallback);
  if (!text) return "";
  return text.length > maxLength ? text.slice(0, maxLength) : text;
}

function firstText(...values) {
  for (const value of values) {
    const text = asText(value);
    if (text) return text;
  }
  return "";
}

function normalizeInteger(value, {
  min = 0,
  max = Number.MAX_SAFE_INTEGER,
  fallback = 0
} = {}) {
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.min(max, Math.max(min, Math.floor(number)));
}

function parsePriceToCents(value) {
  if (typeof value === "number") {
    if (!Number.isFinite(value)) return null;
    return Math.round(value * 100);
  }
  const raw = String(value ?? "").trim();
  if (!raw) return null;
  const normalized = raw
    .replace(/[^\d,.-]/g, "")
    .replace(/\.(?=\d{3}(?:\D|$))/g, "")
    .replace(",", ".");
  const number = Number(normalized);
  if (!Number.isFinite(number)) return null;
  return Math.round(number * 100);
}

function centsToDisplay(cents) {
  const safeCents = normalizeInteger(cents, { min: 0, fallback: 0 });
  return Number((safeCents / 100).toFixed(2));
}

function normalizeOptionText(value) {
  return asText(value).toLowerCase();
}

function normalizeOptionList(value) {
  if (!Array.isArray(value)) return [];
  return value
    .map((entry) => {
      if (entry && typeof entry === "object") {
        return firstText(entry.name, entry.label, entry.value, entry.title, entry.id);
      }
      return asText(entry);
    })
    .filter(Boolean)
    .slice(0, 120);
}

function normalizeCreateOrderInput(data = {}, { authUid = "" } = {}) {
  const source = data && typeof data === "object" ? data : {};
  const restaurantId = truncateText(source.restaurantId || source.rid, 160);
  if (!restaurantId) {
    throw new OrderValidationError("restaurantId is required");
  }

  const itemsRaw = Array.isArray(source.items) ? source.items : [];
  if (!itemsRaw.length) {
    throw new OrderValidationError("items are required");
  }
  if (itemsRaw.length > MAX_ORDER_ITEMS) {
    throw new OrderValidationError("too many order items");
  }

  const items = itemsRaw.map((item, index) => {
    const rawItem = item && typeof item === "object" ? item : {};
    const itemId = truncateText(
      firstText(rawItem.itemId, rawItem.menuItemId, rawItem.productId, rawItem.id),
      180
    );
    if (!itemId) {
      throw new OrderValidationError("itemId is required", "invalid-argument", { index });
    }
    return {
      itemId,
      quantity: normalizeInteger(rawItem.quantity, { min: 1, max: MAX_ITEM_QUANTITY, fallback: 1 }),
      selectedSize: truncateText(rawItem.selectedSize || rawItem.size, 120),
      selectedColor: truncateText(rawItem.selectedColor || rawItem.color, 120),
      comment: truncateText(rawItem.comment || rawItem.note || rawItem.message, 300),
      cartKey: truncateText(rawItem.cartKey, 240),
      cropX: normalizeInteger(rawItem.cropX ?? 50, { min: 0, max: 100, fallback: 50 }),
      cropY: normalizeInteger(rawItem.cropY ?? 50, { min: 0, max: 100, fallback: 50 })
    };
  });

  const contactSource = source.contact && typeof source.contact === "object" ? source.contact : {};
  const tableNumber = normalizeInteger(
    source.tableNumber || contactSource.tableNumber,
    { min: 0, max: 9999, fallback: 0 }
  );
  const requestedBuyerUid = asText(source.buyerUid);
  if (requestedBuyerUid && requestedBuyerUid !== asText(authUid)) {
    throw new OrderValidationError("buyerUid does not match auth user", "permission-denied");
  }

  return {
    restaurantId,
    serviceMode: truncateText(source.serviceMode, 80).toLowerCase(),
    tableNumber,
    tableLabel: truncateText(source.tableLabel || contactSource.tableLabel || (tableNumber ? `Tisch ${tableNumber}` : ""), 120),
    contact: {
      name: truncateText(contactSource.name, 120),
      phone: truncateText(contactSource.phone, 80),
      city: truncateText(contactSource.city, 120),
      address: truncateText(contactSource.address, 240),
      tableNumber,
      tableLabel: truncateText(contactSource.tableLabel || source.tableLabel || (tableNumber ? `Tisch ${tableNumber}` : ""), 120)
    },
    guestScopeUid: truncateText(source.guestScopeUid, 180),
    guestSessionId: truncateText(source.guestSessionId, 180),
    items
  };
}

function getMenuItemId(item = {}) {
  return firstText(item.id, item.itemId, item.menuItemId, item.productId, item.sku);
}

function isMenuItemOrderable(item = {}) {
  if (!item || typeof item !== "object") return false;
  if (item.available === false) return false;
  if (item.hidden === true || item.menuHidden === true) return false;
  if (item.statusHidden === true && item.menuHidden === true) return false;
  const status = asText(item.status || item.visibility || item.menuVisibility).toLowerCase();
  if (status === "hidden" || status === "archived" || status === "deleted") return false;
  if (item.soldOut === true || item.outOfStock === true) return false;
  const stock = item.stock ?? item.stockCount ?? item.inventory;
  if (stock !== undefined && stock !== null && asText(stock) !== "") {
    const stockNumber = Number(stock);
    if (Number.isFinite(stockNumber) && stockNumber <= 0) return false;
  }
  return true;
}

function buildMenuItemIndex(menuItems = []) {
  const index = new Map();
  (Array.isArray(menuItems) ? menuItems : []).forEach((item) => {
    if (!item || typeof item !== "object") return;
    const ids = [
      item.id,
      item.itemId,
      item.menuItemId,
      item.productId,
      item.sku
    ].map(asText).filter(Boolean);
    ids.forEach((id) => {
      if (!index.has(id)) index.set(id, item);
    });
  });
  return index;
}

function validateSelectedOption({ requested = "", available = [], label = "option", itemId = "" } = {}) {
  const selected = asText(requested);
  const options = normalizeOptionList(available);
  if (!options.length) return selected;
  if (!selected) return options[0] || "";
  const selectedKey = normalizeOptionText(selected);
  const match = options.find((option) => normalizeOptionText(option) === selectedKey);
  if (!match) {
    throw new OrderValidationError(`${label} is not available for item`, "failed-precondition", { itemId });
  }
  return match;
}

function normalizeOrderMenuItem(item = {}, requestItem = {}) {
  const itemId = getMenuItemId(item);
  if (!itemId) {
    throw new OrderValidationError("menu item id missing", "failed-precondition");
  }
  if (!isMenuItemOrderable(item)) {
    throw new OrderValidationError("menu item is not orderable", "failed-precondition", { itemId });
  }
  const priceCents = parsePriceToCents(item.price);
  if (priceCents === null || priceCents < 0) {
    throw new OrderValidationError("menu item price is invalid", "failed-precondition", { itemId });
  }
  const selectedSize = validateSelectedOption({
    requested: requestItem.selectedSize,
    available: item.sizes,
    label: "size",
    itemId
  });
  const selectedColor = validateSelectedOption({
    requested: requestItem.selectedColor,
    available: item.colors,
    label: "color",
    itemId
  });
  const imageUrls = Array.isArray(item.imageUrls) ? item.imageUrls.filter(Boolean) : [];
  return {
    id: itemId,
    itemId,
    name: firstText(item.name, item.title, "Produkt"),
    price: item.price ?? centsToDisplay(priceCents),
    priceCents,
    quantity: requestItem.quantity,
    imageUrl: firstText(item.imageUrl, imageUrls[0]),
    imageUrls,
    category: firstText(item.category, item.menuSection),
    comment: requestItem.comment,
    cartKey: requestItem.cartKey || `${itemId}:${selectedSize}:${selectedColor}`,
    selectedSize,
    selectedColor,
    cropX: requestItem.cropX,
    cropY: requestItem.cropY
  };
}

function resolveActorData({ authUid = "", authData = {}, actorData = {}, contact = {} } = {}) {
  const uid = asText(authUid);
  const profile = actorData && typeof actorData === "object" ? actorData : {};
  const auth = authData && typeof authData === "object" ? authData : {};
  const safeContact = contact && typeof contact === "object" ? contact : {};
  const fallbackName = uid ? "User" : "Gast";
  return {
    buyerUid: uid,
    buyerName: firstText(profile.name, profile.displayName, auth.name, auth.displayName, safeContact.name, fallbackName),
    buyerHandle: uid
      ? firstText(profile.handle, profile.username, auth.email && String(auth.email).split("@")[0], "user").replace(/^@/, "")
      : "guest",
    buyerAvatar: uid ? firstText(profile.avatar, profile.photoURL, profile.photoUrl, auth.picture) : ""
  };
}

function buildSecureRestaurantOrderPayload({
  input,
  authUid = "",
  authData = {},
  actorData = {},
  restaurantData = {},
  menuItems = [],
  orderId = "",
  nowIso = "",
  serverTimestampValue = null,
  tokenFactory = null
} = {}) {
  const normalizedInput = input?.items ? input : normalizeCreateOrderInput(input, { authUid });
  const safeOrderId = asText(orderId);
  if (!safeOrderId) {
    throw new OrderValidationError("orderId is required", "internal");
  }
  const index = buildMenuItemIndex(menuItems);
  const canonicalItems = normalizedInput.items.map((requestItem) => {
    const menuItem = index.get(requestItem.itemId);
    if (!menuItem) {
      throw new OrderValidationError("menu item was not found", "failed-precondition", { itemId: requestItem.itemId });
    }
    return normalizeOrderMenuItem(menuItem, requestItem);
  });
  const itemCount = canonicalItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalCents = canonicalItems.reduce((sum, item) => sum + (item.priceCents * item.quantity), 0);
  const restaurant = restaurantData && typeof restaurantData === "object" ? restaurantData : {};
  const timestamp = serverTimestampValue ?? null;
  const createdAtClient = asText(nowIso) || new Date().toISOString();
  const actor = resolveActorData({
    authUid,
    authData,
    actorData,
    contact: normalizedInput.contact
  });
  const createToken = typeof tokenFactory === "function"
    ? tokenFactory
    : (() => "");
  const guestLookupToken = actor.buyerUid ? "" : truncateText(createToken("order"), 180);
  if (!actor.buyerUid && !guestLookupToken) {
    throw new OrderValidationError("guest lookup token could not be created", "internal");
  }
  const writeData = {
    id: safeOrderId,
    restaurantId: normalizedInput.restaurantId,
    businessName: firstText(restaurant.name, restaurant.restaurantName, restaurant.businessName, restaurant.displayName, "Shop"),
    businessAvatar: firstText(restaurant.logoUrl, restaurant.logo, restaurant.avatar, restaurant.photoUrl, restaurant.coverUrl),
    buyerUid: actor.buyerUid,
    buyerName: actor.buyerName,
    buyerHandle: actor.buyerHandle,
    buyerAvatar: actor.buyerAvatar,
    contact: normalizedInput.contact,
    tableNumber: normalizedInput.tableNumber,
    tableLabel: normalizedInput.tableLabel || normalizedInput.contact.tableLabel,
    items: canonicalItems,
    itemCount,
    total: centsToDisplay(totalCents),
    totalCents,
    status: "Neu",
    statusKey: "bestellung",
    orderSource: "serverCallable",
    pricingSource: "server_menu",
    pricingVersion: 1,
    guestScopeUid: actor.buyerUid ? "" : normalizedInput.guestScopeUid,
    guestSessionId: actor.buyerUid ? "" : normalizedInput.guestSessionId,
    guestLookupToken,
    orderLookupToken: guestLookupToken,
    createdAt: timestamp,
    updatedAt: timestamp,
    createdAtClient,
    updatedAtClient: createdAtClient
  };
  const clientOrder = {
    ...writeData,
    createdAt: createdAtClient,
    updatedAt: createdAtClient
  };
  return {
    writeData,
    clientOrder,
    orderId: safeOrderId,
    restaurantId: normalizedInput.restaurantId,
    guestLookupToken
  };
}

function coerceMenuItemsFromOrderSource(data = {}, docId = "") {
  const source = data && typeof data === "object" ? data : {};
  if (Array.isArray(source.items)) return source.items;
  if (Array.isArray(source.menuItems)) return source.menuItems;
  if (Array.isArray(source.menu)) return source.menu;
  return docId ? [{ id: docId, ...source }] : [];
}

module.exports = {
  OrderValidationError,
  normalizeCreateOrderInput,
  buildSecureRestaurantOrderPayload,
  coerceMenuItemsFromOrderSource,
  parsePriceToCents
};
