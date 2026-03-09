export function normalizeOrderItemCore(item, {
  buildShopVariantKeyFn,
  clampCropPercentFn
} = {}) {
  const buildVariant = typeof buildShopVariantKeyFn === "function"
    ? buildShopVariantKeyFn
    : (() => "");
  const clamp = typeof clampCropPercentFn === "function"
    ? clampCropPercentFn
    : ((value, fallback) => {
      const num = Number(value);
      if (!Number.isFinite(num)) return fallback;
      return Math.max(0, Math.min(100, Math.round(num)));
    });

  return {
    id: String(item?.id || item?.itemId || "").trim(),
    itemId: String(item?.itemId || item?.id || "").trim(),
    cartKey: String(
      item?.cartKey
      || buildVariant(item?.itemId || item?.id || "", {
        size: item?.selectedSize || item?.size || "",
        color: item?.selectedColor || item?.color || ""
      })
    ).trim(),
    name: String(item?.name || "Produkt").trim() || "Produkt",
    price: String(item?.price ?? "").trim(),
    quantity: Math.max(1, Number(item?.quantity || 1) || 1),
    imageUrl: String(item?.imageUrl || "").trim(),
    category: String(item?.category || "").trim(),
    selectedSize: String(item?.selectedSize || item?.size || "").trim(),
    selectedColor: String(item?.selectedColor || item?.color || "").trim(),
    cropX: clamp(item?.cropX ?? 50, 50),
    cropY: clamp(item?.cropY ?? 50, 50)
  };
}

export function normalizeOrderDocCore(data, id, {
  normalizeOrderItemFn,
  parsePriceValueFn
} = {}) {
  const toItem = typeof normalizeOrderItemFn === "function"
    ? normalizeOrderItemFn
    : ((item) => item);
  const toPrice = typeof parsePriceValueFn === "function"
    ? parsePriceValueFn
    : (() => 0);

  const source = data && typeof data === "object" ? data : {};
  const items = (Array.isArray(source.items) ? source.items : [])
    .map(toItem)
    .filter((item) => item.id && item.itemId);
  const total = Number(source.total);

  return {
    id: String(id || source.id || "").trim(),
    restaurantId: String(source.restaurantId || "").trim(),
    businessName: String(source.businessName || "").trim(),
    businessAvatar: String(source.businessAvatar || "").trim(),
    buyerUid: String(source.buyerUid || "").trim(),
    buyerName: String(source.buyerName || "").trim(),
    buyerHandle: String(source.buyerHandle || "").trim(),
    buyerAvatar: String(source.buyerAvatar || "").trim(),
    contact: {
      name: String(source.contact?.name || "").trim(),
      phone: String(source.contact?.phone || "").trim(),
      city: String(source.contact?.city || "").trim(),
      address: String(source.contact?.address || "").trim()
    },
    items,
    itemCount: Math.max(1, Number(source.itemCount || items.reduce((sum, item) => sum + item.quantity, 0) || 1) || 1),
    total: Number.isFinite(total) ? total : items.reduce((sum, item) => sum + (toPrice(item.price) * item.quantity), 0),
    status: String(source.status || "Neu").trim() || "Neu",
    createdAt: source.createdAt || source.createdAtClient || new Date().toISOString(),
    updatedAt: source.updatedAt || source.updatedAtClient || source.createdAt || source.createdAtClient || new Date().toISOString()
  };
}
