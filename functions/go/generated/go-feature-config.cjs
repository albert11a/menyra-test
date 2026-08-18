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
//
// Fuenf, nicht mehr: Kafe, Pije, Ushqim, Ëmbëlsira - und "Krejt" darueber. Ein
// Gast, der abends losgeht, denkt in genau diesen vier Woertern. "Brunch" war
// eine fuenfte Schublade, die weder der Gast noch das Lokal sicher trifft; sie
// ist weg. Ein altes Angebot mit dieser Kategorie faellt ueber
// normalizeGoCategory() auf "Krejt" zurueck und bleibt damit auffindbar - es
// verschwindet nichts.
const GO_CATEGORY_ALL = "all";

const GO_CATEGORIES = Object.freeze([
  { key: GO_CATEGORY_ALL, label: "Krejt", icon: "sparkles" },
  { key: "coffee", label: "Kafe", icon: "coffee" },
  { key: "drinks", label: "Pije", icon: "cup-soda" },
  { key: "food", label: "Ushqim", icon: "utensils" },
  { key: "dessert", label: "Ëmbëlsira", icon: "cake-slice" }
]);

const GO_CATEGORY_KEYS = Object.freeze(GO_CATEGORIES.map((entry) => entry.key));

// Wonach der GAST gefragt wird - und das ist etwas anderes als das, was ein
// Angebot traegt.
//
// Das Lokal sagt weiter genau, wofuer sein Rabatt gilt (die vier Kategorien
// oben). Der Gast beantwortet dagegen eine Frage nach der Rechnung, nicht
// nach dem Geschmack: Wer isst, macht einen grossen Bon, und darauf kann ein
// Lokal mehr geben. Wer nur einen Kaffee trinkt, macht einen kleinen - da
// sind zehn Prozent das Aeusserste. Genau diese zwei Faelle kalkuliert ein
// Wirt, und genau danach wird gefragt.
//
// Ëmbëlsira liegt dabei bei "Ushqim". Sie lag einmal bei "Pije", mit dem
// Gedanken, das Dessert-Angebot sei fuer den, der NICHT isst. Der Gedanke
// stimmt fuer die Rechnung, aber er stimmt nicht fuer die Frage, die das Lokal
// im Editor liest: Dort steht "Nëse kërkohet kafe / pije - Kafe, lëngje dhe
// pije të tjera", und ein Kuchen ist keine Pije. Ein Wirt, der sein
// Dessert-Angebot einstellt, sucht es unter Ushqim - findet es dort nicht und
// kreuzt Pije an, ohne zu wissen, was er damit sagt. Eine Einteilung, die man
// erklaeren muss, ist im Formular die falsche.
//
// Drei Antworten und keine vier: "Nuk e di" ist die ehrliche Antwort fuer
// den, der erst einmal schauen will. Frueher stand dort "Krejt", und das
// klang wie eine Entscheidung.
const GO_INTENT_FOOD = "food";
const GO_INTENT_DRINKS = "drinks";
const GO_INTENT_UNSURE = "unsure";

const GO_INTENTS = Object.freeze([
  Object.freeze({
    key: GO_INTENT_FOOD,
    label: "Ushqim",
    hint: "Mëngjes, drekë, darkë, ëmbëlsirë",
    icon: "utensils",
    // Die Mahlzeit steht nur als Zeile darunter und ist keine eigene Frage.
    // Die Matching-Engine filtert nach den vier Kategorien, nicht nach
    // Mahlzeiten - eine Auswahl, die nur gespeichert und nie gelesen wird,
    // waere ein Versprechen an den Gast, das niemand einloest.
    categories: Object.freeze(["food", "dessert"])
  }),
  Object.freeze({
    key: GO_INTENT_DRINKS,
    label: "Pije",
    hint: "Kafe, lëngje dhe pije të tjera",
    icon: "cup-soda",
    categories: Object.freeze(["coffee", "drinks"])
  }),
  Object.freeze({
    key: GO_INTENT_UNSURE,
    label: "Nuk e di",
    hint: "Gjitha ofertat për rreth teje.",
    icon: "sparkles",
    // Leer heisst: kein Filter. Nicht "alle vier aufzaehlen" - ein Angebot
    // ohne Kategorie waere sonst nicht dabei.
    categories: Object.freeze([])
  })
]);

const GO_INTENT_KEYS = Object.freeze(GO_INTENTS.map((entry) => entry.key));

function normalizeGoIntent(value = "") {
  const key = String(value || "").trim().toLowerCase();
  return GO_INTENT_KEYS.includes(key) ? key : GO_INTENT_UNSURE;
}

/**
 * Die Kategorien hinter einer Antwort.
 *
 * Leer heisst "kein Filter" und nicht "nichts" - der Unterschied entscheidet
 * darueber, ob "Nuk e di" alles zeigt oder gar nichts.
 */
function goIntentCategories(value = "") {
  const found = GO_INTENTS.find((entry) => entry.key === normalizeGoIntent(value));
  return found ? found.categories.slice() : [];
}

// Gruppengroessen der Suche: 1 bis 10.
//
// Im Modal ist das ein Regler, keine Reihe von Knoepfen - zehn Knoepfe waeren
// auf dem Telefon eine zweite Zeile und zehn Ziele fuer einen Daumen. Die
// Liste bleibt trotzdem stehen: Sie ist die Wahrheit darueber, welche Werte
// ueberhaupt gueltig sind, und Server wie Editor lesen daraus.
const GO_PARTY_SIZE_MIN = 1;
const GO_PARTY_SIZE_MAX = 10;
const GO_PARTY_SIZE_OPTIONS = Object.freeze([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
const GO_PARTY_SIZE_DEFAULT = 2;

// Die Gruppenbereiche des Angebots-Editors. "7+" reicht bis an das obere Ende
// des Reglers (10) und darueber hinaus - ein Lokal, das grosse Gruppen nimmt,
// muss dafuer nichts nachtragen.
//
// Die Bereiche beruehren sich nicht mehr. Vorher standen dort 1–2, 2–4, 4–6
// und 6+, und damit lag Person 2 in zwei Bereichen und Person 4 in zwei
// weiteren: Ein Wirt, der "1–2" und "2–4" sah, musste raten, was das Kreuz bei
// "2–4" ueber die zwei Personen sagt, die schon im ersten Bereich standen. Eine
// Grenze, die zweimal vorkommt, ist keine Grenze.
const GO_PARTY_RANGES = Object.freeze([
  { key: "1-2", min: 1, max: 2, label: "1–2" },
  { key: "3-4", min: 3, max: 4, label: "3–4" },
  { key: "5-6", min: 5, max: 6, label: "5–6" },
  { key: "7+", min: 7, max: 99, label: "7+" }
]);

// Die Bereiche von damals. Sie stehen nicht mehr im Formular, werden aber
// weiter gelesen: Ein Angebot, das "2-4" traegt, gilt weiter genau fuer zwei
// bis vier Personen - der Server rechnet aus diesen Grenzen minParty und
// maxParty, und ein unbekannter Schluessel haette daraus stillschweigend
// "jede Gruppe" gemacht.
const GO_PARTY_RANGES_LEGACY = Object.freeze([
  { key: "2-4", min: 2, max: 4, label: "2–4" },
  { key: "4-6", min: 4, max: 6, label: "4–6" },
  { key: "6+", min: 6, max: 99, label: "6+" }
]);

/**
 * Die Bereiche des heutigen Formulars, die ein gespeicherter Bereich beruehrt.
 *
 * Gebraucht wird das genau einmal: wenn ein Angebot von damals im Editor
 * geoeffnet wird. Der Editor kennt nur die vier Bereiche oben - ein "2-4" waere
 * dort kein Kreuz, und das Lokal saehe seine Auswahl leer, als haette es nie
 * eine getroffen.
 *
 * Uebersetzt wird ueber die Zahlen, nicht ueber eine Tabelle: Ein Bereich
 * gehoert dazu, wenn er sich mit dem alten ueberschneidet. "2-4" wird damit zu
 * "1–2" und "3–4" - eine Person mehr als vorher (die 1), aber keine weniger.
 * Die andere Richtung waere schlimmer: Wer "3–4" allein waehlte, haette die
 * Zweiergruppen verloren, fuer die das Angebot bisher galt.
 */
function goPartyRangeKeysForEditor(keys = []) {
  const list = Array.isArray(keys) ? keys : (keys ? [keys] : []);
  const result = [];
  list.forEach((entry) => {
    const range = goPartyRange(entry);
    if (!range) return;
    GO_PARTY_RANGES.forEach((current) => {
      if (current.min > range.max || current.max < range.min) return;
      if (!result.includes(current.key)) result.push(current.key);
    });
  });
  // Die Reihenfolge des Formulars, nicht die des Speichers.
  return GO_PARTY_RANGES.filter((entry) => result.includes(entry.key)).map((entry) => entry.key);
}

// Budget bleibt freiwillig und zweitrangig (Spezifikation Punkt 12).
const GO_BUDGET_LEVELS = Object.freeze([
  { key: "low", label: "deri 10 €", maxPerPerson: 10 },
  { key: "mid", label: "10–20 €", maxPerPerson: 20 },
  { key: "high", label: "20–30 €", maxPerPerson: 30 },
  { key: "top", label: "30 €+", maxPerPerson: 0 }
]);

// Wie lange eine angenommene Oferta dem Gast gehoert, und wie lange das Lokal
// danach noch finalisieren darf.
//
// Die Frage "Kur?" gibt es nicht mehr. Sie war eine Verabredung auf eine
// Uhrzeit, und daran haengte alles: Kapazitaetsscheiben, Tischkollisionen, ein
// Kalender im Modal. Der Gast weiss aber selten auf die halbe Stunde, wann er
// losgeht - er weiss, dass er heute oder morgen hingeht. Also gilt die Oferta
// einfach 24 Stunden ab dem Augenblick, in dem er zugreift.
//
// Die zwei Stunden danach gehoeren allein dem Lokal. Sie sind kein
// Nachschlag fuer den Gast: Wer um 17:55 aktiviert und um 18:05 bedient wird,
// soll nicht daran scheitern, dass der Kellner den Code erst nach der Schicht
// eintippt. Neu aktivieren kann der Gast in diesen zwei Stunden nicht mehr.
const GO_ACTIVATION_WINDOW_HOURS = 24;
const GO_FINALIZATION_GRACE_HOURS = 2;

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

// Kapazitaet wird nur noch je Tag gefuehrt - es gibt hier deshalb keine
// Scheibengroesse mehr.
//
// Vorher stand hier GO_CAPACITY_SLOT_MINUTES = 30. Die Scheiben haengten an der
// erwarteten Ankunft, und die gibt es ohne "Kur?" nicht mehr. Eine Scheibe
// waere jetzt nur noch der Zeitpunkt, an dem jemand auf einen Knopf getippt
// hat - danach plant kein Wirt seinen Abend. Was bleibt, ist die Frage, die er
// wirklich beantworten kann: wie viele GO-Gruppen an einem Tag.

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
  return GO_PARTY_RANGES.find((entry) => entry.key === wanted)
    || GO_PARTY_RANGES_LEGACY.find((entry) => entry.key === wanted)
    || null;
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
  GO_INTENT_FOOD,
  GO_INTENT_DRINKS,
  GO_INTENT_UNSURE,
  GO_INTENTS,
  GO_INTENT_KEYS,
  normalizeGoIntent,
  goIntentCategories,
  GO_PARTY_SIZE_MIN,
  GO_PARTY_SIZE_MAX,
  GO_PARTY_SIZE_OPTIONS,
  GO_PARTY_SIZE_DEFAULT,
  GO_PARTY_RANGES,
  GO_PARTY_RANGES_LEGACY,
  goPartyRangeKeysForEditor,
  GO_BUDGET_LEVELS,
  GO_ACTIVATION_WINDOW_HOURS,
  GO_FINALIZATION_GRACE_HOURS,
  GO_BENEFIT_KINDS,
  GO_SEARCH_RESULT_LIMIT,
  GO_SEARCH_CANDIDATE_LIMIT,
  resolveGoEntitlements,
  goCategoryLabel,
  goBudgetLevel,
  goPartyRange
};
