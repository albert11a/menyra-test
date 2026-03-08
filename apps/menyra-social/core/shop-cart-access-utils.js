export function getShopCartProfileContextCore(profile = {}, {
  getRestaurantMetaByIdFn
} = {}) {
  const getRestaurantMetaById = typeof getRestaurantMetaByIdFn === "function"
    ? getRestaurantMetaByIdFn
    : (() => null);
  const restaurantId = String(profile?.restaurantId || "").trim();
  const rest = restaurantId ? getRestaurantMetaById(restaurantId) : null;
  return {
    restaurantId,
    businessName: String(profile?.name || rest?.name || rest?.restaurantName || "Shop").trim() || "Shop",
    businessAvatar: String(profile?.avatar || rest?.logoUrl || rest?.logo || "").trim()
  };
}

export function getCartCountForRestaurantCore(restaurantId = "", shopCart = null) {
  const safeRestaurantId = String(restaurantId || "").trim();
  if (!safeRestaurantId || String(shopCart?.restaurantId || "").trim() !== safeRestaurantId) return 0;
  return (shopCart?.items || []).reduce((sum, item) => sum + Math.max(0, Number(item?.quantity || 0) || 0), 0);
}

export function canAddToShopCartCore(profile = {}, {
  isShopCatalogProfileFn,
  currentUserRestaurantId = ""
} = {}) {
  const isShopCatalogProfile = typeof isShopCatalogProfileFn === "function"
    ? isShopCatalogProfileFn
    : (() => false);
  const restaurantId = String(profile?.restaurantId || "").trim();
  if (!restaurantId || !isShopCatalogProfile(profile)) return false;
  if (currentUserRestaurantId && String(currentUserRestaurantId).trim() === restaurantId) return false;
  return true;
}

export function getShopCartTotalCore(items = [], {
  parsePriceValueFn
} = {}) {
  const parsePriceValue = typeof parsePriceValueFn === "function"
    ? parsePriceValueFn
    : (() => 0);
  return (items || []).reduce((sum, item) => {
    return sum + (parsePriceValue(item.price) * Math.max(1, Number(item.quantity || 1) || 1));
  }, 0);
}
