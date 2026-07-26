export const USE_NEW_PUBLIC_MENU_RUNTIME = false;
export const USE_NEW_PUBLIC_PROFILE_RUNTIME = false;
export const USE_NEW_QR_MENU_RUNTIME = false;
export const USE_NEW_WAITER_RUNTIME = false;
export const USE_NEW_OWNER_RUNTIME = false;
export const USE_CREATE_RESTAURANT_ORDER_FUNCTION = true;

// Travel und Shopping sind vorerst abgeschaltet, damit Mnyra auf Restaurants
// fokussiert bleibt. Code und Daten bleiben erhalten: das Umstellen auf true
// bringt Navigation und Routen unveraendert zurueck.
export const SHOW_TRAVEL_TAB = false;
export const SHOW_SHOPPING_TAB = false;

export const MNYRA_FEATURE_FLAGS = Object.freeze({
  USE_NEW_PUBLIC_MENU_RUNTIME,
  USE_NEW_PUBLIC_PROFILE_RUNTIME,
  USE_NEW_QR_MENU_RUNTIME,
  USE_NEW_WAITER_RUNTIME,
  USE_NEW_OWNER_RUNTIME,
  USE_CREATE_RESTAURANT_ORDER_FUNCTION,
  SHOW_TRAVEL_TAB,
  SHOW_SHOPPING_TAB,
});

export default MNYRA_FEATURE_FLAGS;
