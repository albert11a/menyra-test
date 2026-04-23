export function getMenuRestaurantForProfileCore(profile = {}) {
  return profile?.restaurantId || "";
}

export function ensureMenuDataForProfileCore(profile = {}, {
  getMenuRestaurantForProfileFn,
  loadMenuForRestaurantFn
} = {}) {
  const getMenuRestaurantForProfile = typeof getMenuRestaurantForProfileFn === "function"
    ? getMenuRestaurantForProfileFn
    : ((value) => value?.restaurantId || "");
  const loadMenuForRestaurant = typeof loadMenuForRestaurantFn === "function"
    ? loadMenuForRestaurantFn
    : null;
  if (!loadMenuForRestaurant) return;
  const restaurantId = getMenuRestaurantForProfile(profile);
  if (!restaurantId) return;
  void loadMenuForRestaurant(restaurantId, { source: "public" });
}

export function ensureFocusDataForProfileCore(profile = {}, {
  getMenuRestaurantForProfileFn,
  loadFocusForRestaurantFn
} = {}) {
  const getMenuRestaurantForProfile = typeof getMenuRestaurantForProfileFn === "function"
    ? getMenuRestaurantForProfileFn
    : ((value) => value?.restaurantId || "");
  const loadFocusForRestaurant = typeof loadFocusForRestaurantFn === "function"
    ? loadFocusForRestaurantFn
    : null;
  if (!loadFocusForRestaurant) return;
  const restaurantId = getMenuRestaurantForProfile(profile);
  if (!restaurantId) return;
  void loadFocusForRestaurant(restaurantId);
}
