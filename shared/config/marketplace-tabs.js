import { SHOW_SHOPPING_TAB, SHOW_TRAVEL_TAB } from "./feature-flags.js";

// Zieltab, wenn ein abgeschalteter Marktplatz-Tab angefragt wird. Restaurants
// ist der fachliche Nachbar von Travel/Shopping, deshalb landen alte Links und
// Deep-Links dort statt auf einem leeren Shell oder auf dem Feed.
export const MARKETPLACE_FALLBACK_TAB = "restaurants";

// Marktplatz-Tabs, die hinter einem Flag liegen. Steht das Flag auf false,
// verschwindet der Tab aus der Navigation und jede Route darauf wird auf
// MARKETPLACE_FALLBACK_TAB umgebogen.
const FLAGGED_MARKETPLACE_TABS = Object.freeze({
  travel: () => SHOW_TRAVEL_TAB === true,
  shopping: () => SHOW_SHOPPING_TAB === true,
});

function tabKey(value = "") {
  return String(value || "")
    .trim()
    .toLowerCase();
}

export function isTravelTabEnabled() {
  return SHOW_TRAVEL_TAB === true;
}

export function isShoppingTabEnabled() {
  return SHOW_SHOPPING_TAB === true;
}

// Nicht geflaggte Tabs gelten immer als aktiv, damit dieser Helfer ueberall im
// Tab-Pfad aufgerufen werden kann, ohne andere Tabs zu beeinflussen.
export function isMarketplaceTabEnabled(tab = "") {
  const readFlag = FLAGGED_MARKETPLACE_TABS[tabKey(tab)];
  return readFlag ? readFlag() : true;
}

export function isHiddenMarketplaceTab(tab = "") {
  return !isMarketplaceTabEnabled(tab);
}

// Gibt den Tab unveraendert zurueck, solange er sichtbar ist. Das erhaelt die
// Schreibweise von Tabs wie "businessAccounts", die nicht kleingeschrieben sind.
export function resolveVisibleAppTab(
  tab = "",
  fallback = MARKETPLACE_FALLBACK_TAB,
) {
  return isMarketplaceTabEnabled(tab) ? tab : fallback;
}

export default {
  MARKETPLACE_FALLBACK_TAB,
  isTravelTabEnabled,
  isShoppingTabEnabled,
  isMarketplaceTabEnabled,
  isHiddenMarketplaceTab,
  resolveVisibleAppTab,
};
