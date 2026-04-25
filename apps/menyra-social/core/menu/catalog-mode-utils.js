const HOSPITALITY_MENU_TYPES = new Set(["restaurant", "cafe", "fastfood"]);

function normalizeCatalogType(value = "") {
  return String(value || "").trim().toLowerCase();
}

function resolveProfileTypeHint(profile = {}, { getBusinessProfileTypeFn } = {}) {
  const getBusinessType = typeof getBusinessProfileTypeFn === "function"
    ? getBusinessProfileTypeFn
    : null;
  return normalizeCatalogType(
    (getBusinessType ? getBusinessType(profile) : "")
    || profile?.type
    || profile?.customerType
    || profile?.businessType
    || ""
  );
}

export function getBusinessCatalogModeCore(profile = {}, {
  getBusinessProfileTypeFn
} = {}) {
  const explicitMode = normalizeCatalogType(profile?.catalogMode || "");
  if (explicitMode === "shop") return "shop";
  if (explicitMode === "menu") return "menu";
  const type = resolveProfileTypeHint(profile, { getBusinessProfileTypeFn });
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
  getBusinessCatalogModeFn,
  getBusinessProfileTypeFn
} = {}) {
  const getCatalogMode = typeof getBusinessCatalogModeFn === "function"
    ? getBusinessCatalogModeFn
    : (() => "menu");
  if (getCatalogMode(profile) === "shop") return true;

  const restaurantId = String(profile?.canonicalRestaurantId || profile?.restaurantId || "").trim();
  if (!restaurantId) return false;

  const type = resolveProfileTypeHint(profile, { getBusinessProfileTypeFn });
  if (!type) return true;
  return HOSPITALITY_MENU_TYPES.has(type);
}

export function isRestaurantCafeProfileCore(profile = {}, {
  getBusinessProfileTypeFn,
  leadTypeOrder = []
} = {}) {
  if (!profile?.restaurantId) return false;
  const type = resolveProfileTypeHint(profile, { getBusinessProfileTypeFn });
  if (!type) return true;
  return leadTypeOrder.includes(type);
}
