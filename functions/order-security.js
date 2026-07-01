"use strict";

class OrderValidationError extends Error {
  constructor(message, code = "invalid-argument", details = {}) {
    super(message);
    this.name = "OrderValidationError";
    this.code = code;
    this.details = details;
  }
}

function asText(value, maxLength = 240) {
  return String(value ?? "")
    .trim()
    .slice(0, maxLength);
}

function firstText(...values) {
  for (const value of values) {
    const text = asText(value);
    if (text) return text;
  }
  return "";
}

function normalizePriceText(value) {
  let text = asText(value, 120)
    .replace(/\s+/g, "")
    .replace(/[^0-9,.-]/g, "");
  if (!text) return "";
  const commaIndex = text.lastIndexOf(",");
  const dotIndex = text.lastIndexOf(".");
  if (commaIndex >= 0 && dotIndex >= 0) {
    const decimalSeparator = commaIndex > dotIndex ? "," : ".";
    const groupingSeparator = decimalSeparator === "," ? "." : ",";
    text = text.split(groupingSeparator).join("");
    if (decimalSeparator === ",") text = text.replace(",", ".");
  } else if (commaIndex >= 0) {
    text = text.replace(/\./g, "").replace(",", ".");
  } else {
    const parts = text.split(".");
    if (parts.length > 2) {
      text = `${parts.slice(0, -1).join("")}.${parts.at(-1)}`;
    }
  }
  return text;
}

function parsePriceToCents(value) {
  const numeric =
    typeof value === "number" ? value : Number(normalizePriceText(value));
  if (!Number.isFinite(numeric)) return null;
  return Math.round(numeric * 100);
}

function centsToAmount(cents) {
  return Number((Number(cents || 0) / 100).toFixed(2));
}

function normalizeQuantity(value) {
  const quantity = Math.trunc(Number(value));
  if (!Number.isFinite(quantity) || quantity < 1 || quantity > 99) {
    throw new OrderValidationError("item quantity must be between 1 and 99");
  }
  return quantity;
}

function normalizeCropPercent(value, fallback = 50) {
  const number = Number(value);
  return Number.isFinite(number)
    ? Math.min(100, Math.max(0, number))
    : fallback;
}

function normalizeContact(contact = {}, tableNumber = 0, tableLabel = "") {
  const source = contact && typeof contact === "object" ? contact : {};
  return {
    name: asText(source.name, 160),
    phone: asText(source.phone, 80),
    email: asText(source.email, 240),
    city: asText(source.city, 160),
    address: asText(source.address, 300),
    tableNumber,
    tableLabel: tableLabel || asText(source.tableLabel, 120),
  };
}

function normalizeRequestItem(item = {}) {
  const source = item && typeof item === "object" ? item : {};
  const itemId = asText(source.itemId || source.id, 180);
  if (!itemId) throw new OrderValidationError("itemId is required");
  return {
    itemId,
    quantity: normalizeQuantity(source.quantity),
    comment: asText(source.comment || source.note, 500),
    cartKey: asText(source.cartKey, 240),
    selectedSize: asText(source.selectedSize || source.size, 120),
    selectedColor: asText(source.selectedColor || source.color, 120),
    cropX: normalizeCropPercent(source.cropX, 50),
    cropY: normalizeCropPercent(source.cropY, 50),
  };
}

function normalizeCreateOrderInput(data = {}) {
  const source = data && typeof data === "object" ? data : {};
  const restaurantId = asText(source.restaurantId, 180);
  if (!restaurantId) throw new OrderValidationError("restaurantId is required");
  if (restaurantId.includes("/"))
    throw new OrderValidationError("restaurantId is invalid");
  const rawItems = Array.isArray(source.items) ? source.items : [];
  if (!rawItems.length || rawItems.length > 100) {
    throw new OrderValidationError(
      "items must contain between 1 and 100 entries",
    );
  }
  const tableNumber = Math.max(0, Math.trunc(Number(source.tableNumber) || 0));
  const tableLabel = asText(source.tableLabel, 120);
  return {
    restaurantId,
    serviceMode: asText(source.serviceMode, 40),
    source: asText(source.source, 40),
    tableId: asText(source.tableId, 180),
    tableNumber,
    tableLabel,
    contact: normalizeContact(source.contact, tableNumber, tableLabel),
    items: rawItems.map(normalizeRequestItem),
    guestScopeUid: asText(source.guestScopeUid, 180),
    guestSessionId: asText(source.guestSessionId, 180),
  };
}

function normalizeOptionList(value) {
  return (Array.isArray(value) ? value : [])
    .map((entry) =>
      asText(entry?.name || entry?.label || entry?.value || entry, 120),
    )
    .filter(Boolean);
}

function validateSelectedOption(requested, available, label, itemId) {
  const options = normalizeOptionList(available);
  const selected = asText(requested, 120);
  if (!options.length) return selected;
  if (!selected) return options[0];
  const match = options.find(
    (option) => option.toLocaleLowerCase() === selected.toLocaleLowerCase(),
  );
  if (!match) {
    throw new OrderValidationError(
      `${label} is not available for item`,
      "failed-precondition",
      { itemId },
    );
  }
  return match;
}

function isMenuItemOrderable(item = {}) {
  if (
    item.available === false ||
    item.active === false ||
    item.enabled === false ||
    item.outOfStock === true
  ) {
    return false;
  }
  const stock = item.stock ?? item.stockCount ?? item.inventory;
  if (stock !== undefined && stock !== null && asText(stock) !== "") {
    const stockNumber = Number(stock);
    if (Number.isFinite(stockNumber) && stockNumber <= 0) return false;
  }
  return true;
}

function getMenuItemId(item = {}) {
  return firstText(
    item.id,
    item.itemId,
    item.menuItemId,
    item.productId,
    item.sku,
  );
}

function buildMenuItemIndex(menuItems = []) {
  const index = new Map();
  for (const item of Array.isArray(menuItems) ? menuItems : []) {
    if (!item || typeof item !== "object") continue;
    const itemId = getMenuItemId(item);
    if (itemId) index.set(itemId, item);
  }
  return index;
}

function normalizeOrderMenuItem(menuItem, requestItem) {
  const itemId = getMenuItemId(menuItem);
  if (!itemId || !isMenuItemOrderable(menuItem)) {
    throw new OrderValidationError(
      "menu item is not orderable",
      "failed-precondition",
      { itemId },
    );
  }
  const priceCents = parsePriceToCents(menuItem.price);
  if (priceCents === null || priceCents < 0) {
    throw new OrderValidationError(
      "menu item price is invalid",
      "failed-precondition",
      { itemId },
    );
  }
  const selectedSize = validateSelectedOption(
    requestItem.selectedSize,
    menuItem.sizes,
    "size",
    itemId,
  );
  const selectedColor = validateSelectedOption(
    requestItem.selectedColor,
    menuItem.colors,
    "color",
    itemId,
  );
  const imageUrls = Array.isArray(menuItem.imageUrls)
    ? menuItem.imageUrls.filter(Boolean)
    : [];
  return {
    id: itemId,
    itemId,
    name: firstText(menuItem.name, menuItem.title, "Produkt"),
    price: centsToAmount(priceCents),
    priceCents,
    quantity: requestItem.quantity,
    imageUrl: firstText(menuItem.imageUrl, imageUrls[0]),
    imageUrls,
    category: firstText(menuItem.category, menuItem.menuSection),
    comment: requestItem.comment,
    cartKey:
      requestItem.cartKey || `${itemId}:${selectedSize}:${selectedColor}`,
    selectedSize,
    selectedColor,
    cropX: requestItem.cropX,
    cropY: requestItem.cropY,
  };
}

function resolveActorData({
  authUid = "",
  authData = {},
  actorData = {},
  contact = {},
} = {}) {
  const uid = asText(authUid, 180);
  return {
    buyerUid: uid,
    buyerName: firstText(
      actorData.name,
      actorData.displayName,
      authData.name,
      contact.name,
      uid ? "User" : "Gast",
    ),
    buyerHandle: uid
      ? firstText(
          actorData.handle,
          actorData.username,
          authData.email && String(authData.email).split("@")[0],
          "user",
        ).replace(/^@/, "")
      : "guest",
    buyerAvatar: uid
      ? firstText(
          actorData.avatar,
          actorData.photoURL,
          actorData.photoUrl,
          authData.picture,
        )
      : "",
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
  tokenFactory = null,
} = {}) {
  const normalizedInput = input?.items
    ? input
    : normalizeCreateOrderInput(input);
  const safeOrderId = asText(orderId, 180);
  if (!safeOrderId)
    throw new OrderValidationError("orderId is required", "internal");
  const menuItemIndex = buildMenuItemIndex(menuItems);
  const canonicalItems = normalizedInput.items.map((requestItem) => {
    const menuItem = menuItemIndex.get(requestItem.itemId);
    if (!menuItem) {
      throw new OrderValidationError(
        "menu item was not found",
        "failed-precondition",
        { itemId: requestItem.itemId },
      );
    }
    return normalizeOrderMenuItem(menuItem, requestItem);
  });
  const itemCount = canonicalItems.reduce(
    (sum, item) => sum + item.quantity,
    0,
  );
  const totalCents = canonicalItems.reduce(
    (sum, item) => sum + item.priceCents * item.quantity,
    0,
  );
  const createdAtClient = asText(nowIso, 80) || new Date().toISOString();
  const actor = resolveActorData({
    authUid,
    authData,
    actorData,
    contact: normalizedInput.contact,
  });
  const guestLookupToken = actor.buyerUid
    ? ""
    : asText(tokenFactory?.("order"), 180);
  if (!actor.buyerUid && !guestLookupToken) {
    throw new OrderValidationError(
      "guest lookup token could not be created",
      "internal",
    );
  }
  const timestamp = serverTimestampValue ?? null;
  const writeData = {
    id: safeOrderId,
    restaurantId: normalizedInput.restaurantId,
    businessName: firstText(
      restaurantData.name,
      restaurantData.restaurantName,
      restaurantData.businessName,
      restaurantData.displayName,
      "Shop",
    ),
    businessAvatar: firstText(
      restaurantData.logoUrl,
      restaurantData.logo,
      restaurantData.avatar,
      restaurantData.photoUrl,
      restaurantData.coverUrl,
    ),
    buyerUid: actor.buyerUid,
    buyerName: actor.buyerName,
    buyerHandle: actor.buyerHandle,
    buyerAvatar: actor.buyerAvatar,
    contact: normalizedInput.contact,
    tableId: normalizedInput.tableId,
    tableNumber: normalizedInput.tableNumber,
    tableLabel:
      normalizedInput.tableLabel || normalizedInput.contact.tableLabel,
    serviceMode: normalizedInput.serviceMode,
    source: normalizedInput.source,
    items: canonicalItems,
    itemCount,
    total: centsToAmount(totalCents),
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
    updatedAtClient: createdAtClient,
  };
  return {
    writeData,
    clientOrder: {
      ...writeData,
      createdAt: createdAtClient,
      updatedAt: createdAtClient,
    },
    orderId: safeOrderId,
    restaurantId: normalizedInput.restaurantId,
    guestLookupToken,
  };
}

module.exports = {
  OrderValidationError,
  normalizeCreateOrderInput,
  buildSecureRestaurantOrderPayload,
  parsePriceToCents,
};
