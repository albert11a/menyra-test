export function normalizeShopCartStateCore(raw, {
  createEmptyShopCartFn,
  buildShopVariantKeyFn,
  clampCropPercentFn
} = {}) {
  const createEmpty = typeof createEmptyShopCartFn === "function"
    ? createEmptyShopCartFn
    : (() => ({
      restaurantId: "",
      businessName: "",
      businessAvatar: "",
      items: [],
      checkoutOpen: false,
      form: { name: "", phone: "", city: "", address: "" },
      status: "",
      loading: false
    }));
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

  const base = createEmpty();
  const source = raw && typeof raw === "object" ? raw : {};
  const items = (Array.isArray(source.items) ? source.items : []).map((item) => ({
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
  })).filter((item) => item.id && item.itemId && item.cartKey);
  return {
    ...base,
    restaurantId: String(source.restaurantId || "").trim(),
    businessName: String(source.businessName || "").trim(),
    businessAvatar: String(source.businessAvatar || "").trim(),
    tableNumber: Math.max(0, Number(source.tableNumber || source.form?.tableNumber || 0) || 0),
    tableLabel: String(source.tableLabel || source.form?.tableLabel || "").trim(),
    serviceMode: String(source.serviceMode || "").trim().toLowerCase(),
    items,
    checkoutOpen: !!source.checkoutOpen,
    form: {
      name: String(source.form?.name || "").trim(),
      phone: String(source.form?.phone || "").trim(),
      city: String(source.form?.city || "").trim(),
      address: String(source.form?.address || "").trim(),
      tableNumber: Math.max(0, Number(source.form?.tableNumber || source.tableNumber || 0) || 0),
      tableLabel: String(source.form?.tableLabel || source.tableLabel || "").trim()
    },
    status: String(source.status || "").trim(),
    loading: !!source.loading
  };
}
