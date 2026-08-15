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

// Mnyra GO. Der Schalter, an dem das ganze Feature haengt: Steht er auf
// false, laedt Qyteti keine GO-Karte, das Panel keine GO-Seite und der
// Browser kein Byte GO-Code - der Bundler wirft alles heraus. Faellt GO nach
// einem Deployment auf, wird hier eine Zeile zurueckgestellt und Mnyra laeuft
// weiter (Spezifikation Punkt 129).
//
// ACHTUNG - auf diesem Branch steht er absichtlich auf true.
//
// Nur so ist GO auf der Vercel-Vorschau ueberhaupt zu sehen; mit false gaebe
// es nichts anzuschauen. Vor dem Weg nach main ist das eine bewusste
// Entscheidung, kein Versehen: entweder zurueck auf false (GO liegt dann
// fertig, aber unsichtbar in main) oder wissentlich auf true.
export const MNYRA_GO_ENABLED = true;

export const MNYRA_FEATURE_FLAGS = Object.freeze({
  USE_NEW_PUBLIC_MENU_RUNTIME,
  USE_NEW_PUBLIC_PROFILE_RUNTIME,
  USE_NEW_QR_MENU_RUNTIME,
  USE_NEW_WAITER_RUNTIME,
  USE_NEW_OWNER_RUNTIME,
  USE_CREATE_RESTAURANT_ORDER_FUNCTION,
  SHOW_TRAVEL_TAB,
  SHOW_SHOPPING_TAB,
  MNYRA_GO_ENABLED,
});

export default MNYRA_FEATURE_FLAGS;
