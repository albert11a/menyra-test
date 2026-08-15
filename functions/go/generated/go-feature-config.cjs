"use strict";

// Generated from ../../../shared/go/go-feature-config.js. Do not edit manually.
// Run: node functions/scripts/sync-go-shared.cjs

// Mnyra GO - die Konstanten des Features. Pur.
//
// "Mnyra GO" ist ein Arbeitstitel. Damit aus einer spaeteren Umbenennung kein
// Suchen-und-Ersetzen quer durch die App wird, steht der Name an genau einer
// Stelle: hier. Im Code heisst das Feature ueberall GO_FEATURE_KEY ("go") -
// ein Schluessel, der sich nicht aendert, auch wenn die Karte im Qyteti
// morgen "Mnyra Tani" heisst.
//
// Ebenso die Berechtigungen: Welcher Plan wie viele GO-Angebote hat, steht
// nicht als if (plan === "pro") im Code, sondern als Eintrag, den der Server
// beantwortet. Preise aendern sich oefter als Programme.

const GO_FEATURE_KEY = "go";

// Die sichtbaren Namen. Eine Zeile aendern, und das Feature heisst anders.
const GO_BRAND = Object.freeze({
  name: "Mnyra GO",
  short: "GO",
  // Der Blitz steht fuer "jetzt" - er ist Schmuck, nie der einzige Traeger
  // einer Information (Barrierefreiheit, Spezifikation Punkt 142).
  mark: "⚡"
});

// Berechtigungen. Der Server entscheidet, der Client zeigt nur an.
const GO_ENTITLEMENT_KEYS = Object.freeze({
  enabled: "go_enabled",
  offerLimit: "go_offer_limit",
  reservations: "go_reservations_enabled",
  advancedCapacity: "go_advanced_capacity",
  analytics: "go_analytics",
  autoOffers: "go_auto_offers"
});

// Die Grundausstattung, solange kein Eintrag am Konto haengt. Grosszuegig
// gewaehlt: Ein Lokal soll GO erlebt haben, bevor es dafuer bezahlt.
const GO_DEFAULT_ENTITLEMENTS = Object.freeze({
  go_enabled: true,
  go_offer_limit: 1,
  go_reservations_enabled: true,
  go_advanced_capacity: false,
  go_analytics: true,
  go_auto_offers: false
});

const GO_PRO_ENTITLEMENTS = Object.freeze({
  go_enabled: true,
  go_offer_limit: 0, // 0 = ohne Begrenzung
  go_reservations_enabled: true,
  go_advanced_capacity: true,
  go_analytics: true,
  go_auto_offers: true
});

// Die Kategorien der Suche. "Krejt" ist vorausgewaehlt und passt auf alles -
// deshalb steht es zuerst und braucht keine Auswahl.
const GO_CATEGORY_ALL = "all";

const GO_CATEGORIES = Object.freeze([
  { key: GO_CATEGORY_ALL, label: "Krejt", icon: "sparkles" },
  { key: "coffee", label: "Kafe", icon: "coffee" },
  { key: "food", label: "Ushqim", icon: "utensils" },
  { key: "drinks", label: "Pije", icon: "wine" },
  { key: "brunch", label: "Brunch", icon: "croissant" },
  { key: "dessert", label: "Ëmbëlsirë", icon: "cake" }
]);

const GO_CATEGORY_KEYS = Object.freeze(GO_CATEGORIES.map((entry) => entry.key));

// Gruppengroessen der Suche. 6 steht fuer "6 und mehr" - groessere Gruppen
// rufen ohnehin an.
const GO_PARTY_SIZE_MIN = 1;
const GO_PARTY_SIZE_MAX = 6;
const GO_PARTY_SIZE_OPTIONS = Object.freeze([1, 2, 3, 4, 5, 6]);
const GO_PARTY_SIZE_DEFAULT = 2;

// Die Gruppenbereiche des Angebots-Editors.
const GO_PARTY_RANGES = Object.freeze([
  { key: "1-2", min: 1, max: 2, label: "1–2" },
  { key: "2-4", min: 2, max: 4, label: "2–4" },
  { key: "4-6", min: 4, max: 6, label: "4–6" },
  { key: "6+", min: 6, max: 99, label: "6+" }
]);

// Budget bleibt freiwillig und zweitrangig (Spezifikation Punkt 12).
const GO_BUDGET_LEVELS = Object.freeze([
  { key: "low", label: "deri 10 €", maxPerPerson: 10 },
  { key: "mid", label: "10–20 €", maxPerPerson: 20 },
  { key: "high", label: "20–30 €", maxPerPerson: 30 },
  { key: "top", label: "30 €+", maxPerPerson: 0 }
]);

// Die Zeitauswahl. "Tani" ist vorausgewaehlt; nur "Më vonë" oeffnet ueberhaupt
// eine weitere Auswahl.
const GO_WHEN_OPTIONS = Object.freeze([
  { key: "now", label: "Tani", offsetMinutes: 0 },
  { key: "in30", label: "+30 min", offsetMinutes: 30 },
  { key: "in60", label: "+1 orë", offsetMinutes: 60 },
  { key: "later", label: "Më vonë", offsetMinutes: -1 }
]);

// Zwei Arten von GO-Angebot, sauber getrennt (Spezifikation Punkt 26):
// "claim" sichert nur das Angebot, "reservation" sichert zusaetzlich einen
// Tisch. Nur die zweite Art belegt Kapazitaet und kollidiert mit sich selbst.
const GO_BOOKING_TYPE_CLAIM = "claim";
const GO_BOOKING_TYPE_RESERVATION = "reservation";
const GO_BOOKING_TYPES = Object.freeze([GO_BOOKING_TYPE_CLAIM, GO_BOOKING_TYPE_RESERVATION]);

// Vorteilsarten des Angebots.
const GO_BENEFIT_KINDS = Object.freeze([
  { key: "percent", label: "Zbritje %" },
  { key: "freeItem", label: "Produkt falas" },
  { key: "bundle", label: "Paket / Çmim special" },
  { key: "table", label: "Tavolinë" },
  { key: "custom", label: "Oferta ime" }
]);

// Wieviele Treffer die Suche hoechstens zurueckgibt. Nicht funfzig - fuenf bis
// acht sind eine Entscheidung, funfzig sind eine Liste (Spezifikation Punkt 21).
const GO_SEARCH_RESULT_LIMIT = 8;
const GO_SEARCH_CANDIDATE_LIMIT = 120;

// Kapazitaet wird in halben Stunden gefuehrt. Das ist ein Planungsraster fuer
// das Lokal, keine Einlasskontrolle fuer den Gast (Punkt 78).
const GO_CAPACITY_SLOT_MINUTES = 30;

// Zwei GO-Tischreservierungen desselben Gastes, die sich um weniger als zwei
// Stunden unterscheiden, gelten als dieselbe Verabredung (Punkt 34).
const GO_RESERVATION_CONFLICT_MINUTES = 120;

// Wie weit im Voraus GO ueberhaupt plant. GO ist fuer "wir gehen jetzt raus",
// nicht fuer den Geburtstag in drei Wochen.
const GO_MAX_LEAD_DAYS = 7;

function resolveGoEntitlements(source = {}) {
  const raw = source && typeof source === "object" ? source : {};
  const merged = { ...GO_DEFAULT_ENTITLEMENTS };
  Object.keys(GO_DEFAULT_ENTITLEMENTS).forEach((key) => {
    if (raw[key] === undefined || raw[key] === null) return;
    merged[key] = typeof GO_DEFAULT_ENTITLEMENTS[key] === "boolean"
      ? raw[key] !== false
      : Math.max(0, Math.trunc(Number(raw[key]) || 0));
  });
  return merged;
}

function goCategoryLabel(key = "") {
  const found = GO_CATEGORIES.find((entry) => entry.key === String(key || "").trim().toLowerCase());
  return found ? found.label : "";
}

function goBudgetLevel(key = "") {
  const wanted = String(key || "").trim().toLowerCase();
  return GO_BUDGET_LEVELS.find((entry) => entry.key === wanted) || null;
}

function goPartyRange(key = "") {
  const wanted = String(key || "").trim().toLowerCase();
  return GO_PARTY_RANGES.find((entry) => entry.key === wanted) || null;
}

module.exports = {
  GO_FEATURE_KEY,
  GO_BRAND,
  GO_ENTITLEMENT_KEYS,
  GO_DEFAULT_ENTITLEMENTS,
  GO_PRO_ENTITLEMENTS,
  GO_CATEGORY_ALL,
  GO_CATEGORIES,
  GO_CATEGORY_KEYS,
  GO_PARTY_SIZE_MIN,
  GO_PARTY_SIZE_MAX,
  GO_PARTY_SIZE_OPTIONS,
  GO_PARTY_SIZE_DEFAULT,
  GO_PARTY_RANGES,
  GO_BUDGET_LEVELS,
  GO_WHEN_OPTIONS,
  GO_BOOKING_TYPE_CLAIM,
  GO_BOOKING_TYPE_RESERVATION,
  GO_BOOKING_TYPES,
  GO_BENEFIT_KINDS,
  GO_SEARCH_RESULT_LIMIT,
  GO_SEARCH_CANDIDATE_LIMIT,
  GO_CAPACITY_SLOT_MINUTES,
  GO_RESERVATION_CONFLICT_MINUTES,
  GO_MAX_LEAD_DAYS,
  resolveGoEntitlements,
  goCategoryLabel,
  goBudgetLevel,
  goPartyRange
};
