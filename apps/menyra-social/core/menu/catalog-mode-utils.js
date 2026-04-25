export function getBusinessCatalogModeCore(profile = {}, {
  getBusinessProfileTypeFn
} = {}) {
  const getBusinessType = typeof getBusinessProfileTypeFn === "function"
    ? getBusinessProfileTypeFn
    : (() => "");
  const explicitMode = String(profile?.catalogMode || "").trim().toLowerCase();
  if (explicitMode === "shop") return "shop";
  if (explicitMode === "menu") return "menu";
  const type = getBusinessType(profile);
  if (!type) return "menu";
  if (type === "ecommerce") return "shop";
  return "menu";
}

export function getBusinessCatalogLabelCore(profile = {}, {
  getBusinessCatalogModeFn
} = {}) {
  const getCatalogMode = typeof getBusinessCatalogModeFn === "function"
    ? getBusinessCatalogModeFn
    : (() => "menu");
  return getCatalogMode(profile) === "shop" ? "Shop" : "Menue";
}

export function isShopCatalogProfileCore(profile = {}, {
  getBusinessCatalogModeFn
} = {}) {
  const getCatalogMode = typeof getBusinessCatalogModeFn === "function"
    ? getBusinessCatalogModeFn
    : (() => "menu");
  return getCatalogMode(profile) === "shop";
}

export function isRestaurantCafeProfileCore(profile = {}, {
  getBusinessProfileTypeFn,
  leadTypeOrder = []
} = {}) {
  if (!profile?.restaurantId) return false;
  const getBusinessType = typeof getBusinessProfileTypeFn === "function"
    ? getBusinessProfileTypeFn
    : (() => "");
  const type = getBusinessType(profile);
  if (!type) return true;
  return leadTypeOrder.includes(type);
}
