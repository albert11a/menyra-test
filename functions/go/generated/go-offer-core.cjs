"use strict";

// Generated from ../../../shared/go/go-offer-core.js. Do not edit manually.
// Run: node functions/scripts/sync-go-shared.cjs

// Mnyra GO - das Angebot. Pur.
//
// Ein GO-Angebot ist die Zusage, die ein Lokal im Voraus gibt: "Montag bis
// Donnerstag, 14 bis 18 Uhr, fuer zwei bis vier Personen, minus zehn Prozent,
// und ja - ein Tisch ist dabei." Genau diese Zusage beschreibt dieses Modul.
//
// Alles daran ist eine Bedingung, die der Server spaeter erneut prueft. Der
// Client rechnet mit denselben Funktionen, damit die Vorschau im Editor
// dasselbe zeigt, was der Gast spaeter bekommt - aber die Entscheidung faellt
// immer am Server (Spezifikation Punkt 27, 137).
//
// Eine zweite Angebots-Maschine neben den Ofertat entsteht dabei nicht: Ein
// Angebot traegt Kanaele (channels). Dasselbe Angebot kann oeffentlich in den
// Ofertat stehen, nur in GO erscheinen oder in beidem (Punkt 82).

const {
  GO_BOOKING_TYPE_CLAIM,
  GO_BOOKING_TYPE_RESERVATION,
  GO_CATEGORY_ALL,
  GO_CATEGORY_KEYS,
  GO_PARTY_RANGES,
  GO_PARTY_SIZE_MAX,
  goPartyRange
} = require("./go-feature-config.cjs");
const {
  GO_WEEKDAY_KEYS,
  buildGoWindow,
  describeGoWeekdays,
  formatGoClock,
  mergeGoWindows,
  normalizeGoWindows,
  toGoIso
} = require("./go-time-core.cjs");

const GO_OFFERS_COLLECTION = "goOffers";

const GO_OFFER_STATUS_ACTIVE = "active";
const GO_OFFER_STATUS_PAUSED = "paused";
const GO_OFFER_STATUS_ARCHIVED = "archived";

const GO_CHANNEL_GO = "go";
const GO_CHANNEL_PUBLIC = "public";

// Die vier Arten, auf die ein Lokal etwas geben kann (Spezifikation
// "ÇKA PO OFRON?", Punkt 20 und 26). Die Schluessel sind die, die schon in
// Firestore stehen - "percent" ist die Zbritje, nicht ein neues "discount":
// Ein bestehendes Angebot soll nach diesem Schritt dasselbe Angebot bleiben.
const GO_BENEFIT_DISCOUNT = "percent";
const GO_BENEFIT_BUNDLE = "bundle";
const GO_BENEFIT_FREE_ITEM = "freeItem";
const GO_BENEFIT_SPECIAL_PRICE = "specialPrice";

// Die Arten, die das Formular heute anbietet - in der Reihenfolge der
// Spezifikation. "table" und "custom" stehen bewusst nicht dabei: Sie sind
// Vergangenheit, die gelesen wird, aber nicht mehr angelegt.
const GO_BENEFIT_KINDS = Object.freeze([
  GO_BENEFIT_DISCOUNT,
  GO_BENEFIT_BUNDLE,
  GO_BENEFIT_FREE_ITEM,
  GO_BENEFIT_SPECIAL_PRICE
]);

// Worauf ein Rabatt gilt (Punkt 4.3). "all" ist die ganze Rechnung.
const GO_DISCOUNT_SCOPES = Object.freeze(["all", "food", "drinks"]);

// Unter welcher Bedingung es etwas gratis gibt (Punkt 6.2).
const GO_FREE_CONDITIONS = Object.freeze(["food", "drink", "any_order", "custom"]);

// Die Halbsaetze, die Mnyra an die Zeile des Gastes haengt. Sie stehen hier
// und nicht im Formular: Das Lokal schreibt seine Werbebotschaft nicht selbst
// (Punkt 8), also muss der Satz dort entstehen, wo aus den Eingaben eine
// Zusage wird - und nicht in der Datei, die sie zeichnet.
const GO_DISCOUNT_SCOPE_TEXTS = Object.freeze({
  all: "",
  food: "në ushqim",
  drinks: "në pije"
});

const GO_FREE_CONDITION_TEXTS = Object.freeze({
  food: "me porosi ushqimi",
  drink: "me porosi të pijes",
  any_order: "me çdo porosi"
});

function cleanGoText(value = "", maxLength = 240) {
  return String(value ?? "").trim().slice(0, maxLength);
}

/**
 * Die Adresse des Angebotsfotos - oder nichts.
 *
 * Erlaubt ist, was der Media-Worker zurueckgibt: eine Adresse ueber https,
 * oder eine ohne Schema, die derselbe Server ausliefert ("/media/..."). Alles
 * andere wird nicht bereinigt, sondern verworfen: Eine Karte ohne Foto ist ein
 * Anblick, eine Karte mit einer fremden Adresse darin ist ein Loch.
 */
function cleanGoImageUrl(value = "") {
  const url = cleanGoText(value, 500);
  if (!url) return "";
  if (url.startsWith("/") && !url.startsWith("//")) return url;
  return /^https:\/\/[^\s]+$/i.test(url) ? url : "";
}

// Der hoechste Preis, den ein Feld annimmt: 99.999,99 €. Keine Grenze waere
// eine Einladung, aus einem Tippfehler eine Zahl zu machen, die auf der Karte
// des Gastes steht.
const GO_PRICE_CENTS_MAX = 9999999;

/**
 * Ein Preis aus dem Formular in ganze Cent.
 *
 * Geld wird hier in Cent gehalten, nicht in Kommazahlen - dieselbe Regel wie
 * in go-commission-core.js: 0.1 + 0.2 ist in JavaScript nicht 0.3, und ein
 * Ersparnis-Betrag, der als 5.099999999999999 € auf der Karte steht, ist kein
 * Betrag, sondern ein Fehler mit Nachkommastellen.
 *
 * Gelesen wird, was ein Wirt tippt: "14,90", "14.90", "20", "1.234,50" - und
 * das €-Zeichen, das er nicht schreiben muss, aber schreiben darf.
 */
function parseGoPriceCents(value) {
  if (typeof value === "number") {
    if (!Number.isFinite(value) || value <= 0) return 0;
    return Math.min(GO_PRICE_CENTS_MAX, Math.round(value * 100));
  }
  const cleaned = String(value ?? "").trim().replace(/[^\d.,]/g, "");
  if (!cleaned) return 0;
  const decimalAt = Math.max(cleaned.lastIndexOf(","), cleaned.lastIndexOf("."));
  const tail = decimalAt < 0 ? "" : cleaned.slice(decimalAt + 1);
  // Ein Zeichen mit einer oder zwei Stellen dahinter trennt die Cent. Alles
  // andere - drei Stellen, keine Stelle - ist eine Tausendergruppe.
  const isDecimal = tail.length === 1 || tail.length === 2;
  const digits = isDecimal
    ? `${cleaned.slice(0, decimalAt).replace(/[.,]/g, "")}.${tail}`
    : cleaned.replace(/[.,]/g, "");
  const parsed = Number.parseFloat(digits);
  if (!Number.isFinite(parsed) || parsed <= 0) return 0;
  return Math.min(GO_PRICE_CENTS_MAX, Math.round(parsed * 100));
}

// "14,90 €" - die Schreibweise, die der Gast im Kosovo liest.
function formatGoPrice(cents = 0) {
  const amount = Math.max(0, Math.trunc(Number(cents) || 0));
  if (!amount) return "";
  return `${(amount / 100).toFixed(2).replace(".", ",")} €`;
}

// Derselbe Betrag ohne Zeichen - so steht er im Eingabefeld, dessen €
// rechts daneben klebt (Punkt 5.2).
function formatGoPriceInput(cents = 0) {
  const amount = Math.max(0, Math.trunc(Number(cents) || 0));
  if (!amount) return "";
  return (amount / 100).toFixed(2).replace(".", ",");
}

function asCount(value, fallback = 0) {
  const parsed = Math.trunc(Number(value));
  if (!Number.isFinite(parsed) || parsed < 0) return fallback;
  return parsed;
}

function normalizeStatus(value = "") {
  const key = String(value || "").trim().toLowerCase();
  if (key === GO_OFFER_STATUS_PAUSED) return GO_OFFER_STATUS_PAUSED;
  if (key === GO_OFFER_STATUS_ARCHIVED) return GO_OFFER_STATUS_ARCHIVED;
  return GO_OFFER_STATUS_ACTIVE;
}

function normalizeGoCategory(value = "") {
  const key = String(value || "").trim().toLowerCase();
  return GO_CATEGORY_KEYS.includes(key) ? key : GO_CATEGORY_ALL;
}

function normalizeGoBookingType(value = "") {
  return String(value || "").trim().toLowerCase() === GO_BOOKING_TYPE_RESERVATION
    ? GO_BOOKING_TYPE_RESERVATION
    : GO_BOOKING_TYPE_CLAIM;
}

// Die Art des Vorteils. Sie entscheidet ueber alles Weitere - deshalb wird sie
// hier auf einen der vier Schluessel gebracht, egal ob sie als "special_price"
// aus der Spezifikation, als "specialPrice" aus dem Formular oder als "custom"
// aus einem Angebot von damals kommt.
function normalizeBenefitKind(value = "", percent = 0) {
  const key = String(value || "").trim().toLowerCase();
  if (key === "percent" || key === "discount") return GO_BENEFIT_DISCOUNT;
  if (key === "bundle") return GO_BENEFIT_BUNDLE;
  if (key === "freeitem" || key === "free_item") return GO_BENEFIT_FREE_ITEM;
  if (key === "specialprice" || key === "special_price") return GO_BENEFIT_SPECIAL_PRICE;
  if (key === "table") return "table";
  if (key === "custom") return "custom";
  return percent > 0 ? GO_BENEFIT_DISCOUNT : "custom";
}

// Ein Preis kommt entweder schon als Cent (aus Firestore, aus einem zweiten
// Normalisieren) oder als das, was jemand getippt hat.
function readPriceCents(centsValue, priceValue) {
  const direct = Math.trunc(Number(centsValue));
  if (Number.isFinite(direct) && direct > 0) return Math.min(GO_PRICE_CENTS_MAX, direct);
  return parseGoPriceCents(priceValue);
}

// Der Vorteil, den der Gast bekommt. Der Text darunter ist das, was auf der
// Karte steht - er wird beim Buchen eingefroren und aendert sich fuer diese
// Buchung nie wieder (Punkt 92).
function normalizeGoBenefit(raw = {}) {
  const source = raw && typeof raw === "object" ? raw : {};
  const percent = Math.min(90, Math.max(0, asCount(source.percent ?? source.discountPercent, 0)));
  const kind = normalizeBenefitKind(source.kind || source.type || source.offerType, percent);
  const scopeKey = String(source.scope || source.discountScope || "").trim().toLowerCase();
  const conditionKey = String(source.conditionType || source.condition || "").trim().toLowerCase();
  const regularPriceCents = readPriceCents(source.regularPriceCents, source.regularPrice);
  const goPriceCents = readPriceCents(source.goPriceCents, source.goPrice);
  // Die Ersparnis wird gerechnet, nie eingegeben (Punkt 5.3, 7.4). Sie ist
  // reine Auskunft: Ob ein Angebot gut ist, entscheidet das Lokal (Punkt 30).
  const savingCents = goPriceCents > 0 && regularPriceCents > goPriceCents
    ? regularPriceCents - goPriceCents
    : 0;
  const benefit = {
    kind,
    percent,
    // Ohne Angabe gilt der Rabatt fuer die ganze Rechnung - das ist auch die
    // Vorgabe im Formular, und ein Angebot von damals hat nie etwas anderes
    // gemeint.
    scope: GO_DISCOUNT_SCOPES.includes(scopeKey) ? scopeKey : "all",
    itemId: cleanGoText(source.itemId, 180),
    // Ein Feld fuer drei Fragen: der Inhalt der Paketa, das Produkt, das es
    // gratis gibt, der Name des Gerichts mit Sonderpreis. Es ist immer
    // dasselbe - "was genau", ohne Beschreibung ringsherum.
    itemName: cleanGoText(source.itemName || source.item || source.bundleTitle || source.productName || source.freeItem, 160),
    // Der frei getippte Preis der alten "Aksion"-Angebote. Das Formular zeigt
    // ihn nicht mehr, aber ein Angebot, das ihn traegt, verliert ihn nicht -
    // sonst stuende nach dem naechsten Speichern eine Paketa ohne Preis da.
    priceText: cleanGoText(source.priceText || source.price, 60),
    regularPriceCents,
    goPriceCents,
    savingCents,
    // Genau, nicht gerundet: 20,00 € auf 14,90 € sind 25,5 %, 8,00 € auf
    // 5,90 € sind 26,25 %. Auf der Karte steht daraus -26 % - gerundet wird
    // erst dort, wo es gelesen wird.
    savingPercent: savingCents > 0 && regularPriceCents > 0
      ? Math.round((savingCents / regularPriceCents) * 10000) / 100
      : 0,
    conditionType: GO_FREE_CONDITIONS.includes(conditionKey) ? conditionKey : "",
    customCondition: cleanGoText(source.customCondition, 120),
    // `text` ist der eigene Satz des Lokals, `label` das Ergebnis. Die beiden
    // duerfen nicht ineinanderlaufen: Wuerde `label` beim naechsten
    // Normalisieren wieder als `text` gelesen, waere aus einem abgeleiteten
    // "-20%" ein handgeschriebener Text geworden - und eine spaetere
    // Aenderung des Prozentsatzes kaeme nie mehr auf der Karte an.
    //
    // Neu geschrieben wird er nirgends mehr: Das Formular hat kein Freitextfeld
    // (Punkt 8). Er steht hier fuer die Angebote, die eines hatten.
    text: cleanGoText(source.text, 160)
  };
  benefit.label = buildGoBenefitLabel(benefit);
  return benefit;
}

// Der Halbsatz hinter einer Zbritje: "në ushqim". Bei der ganzen Rechnung
// steht dort nichts - "-20%" ist dann schon der ganze Satz.
function goDiscountScopeText(scope = "") {
  const key = String(scope || "").trim().toLowerCase();
  return GO_DISCOUNT_SCOPE_TEXTS[key] || "";
}

// Die Bedingung eines Falas-Angebots als Satz: "me porosi ushqimi". Bei
// "Tjetër" ist es der Satz, den das Lokal selbst geschrieben hat.
function goFreeConditionText(benefit = {}) {
  const source = benefit && typeof benefit === "object" ? benefit : {};
  const key = String(source.conditionType || "").trim().toLowerCase();
  if (key === "custom") return cleanGoText(source.customCondition, 120);
  return GO_FREE_CONDITION_TEXTS[key] || "";
}

// Der Preis, der auf der Karte gross steht - der GO-Preis. Ein Angebot von
// damals hat ihn als Text ("2,50 €"), ein neues in Cent.
//
// Gelesen wird beides, weil buildGoBenefitLabel auch mit einem Vorteil
// aufgerufen wird, der noch nicht durch normalizeGoBenefit gelaufen ist.
function benefitGoPriceLabel(source = {}) {
  return formatGoPrice(readPriceCents(source.goPriceCents, source.goPrice))
    || cleanGoText(source.priceText, 60);
}

/**
 * Die eine Zeile, die ein Angebot ueberall beschreibt, wo nur eine Zeile Platz
 * hat: in der Liste des Lokals, in der Buchung des Gastes, in der eingefrorenen
 * Kopie.
 *
 * Sie entsteht aus den Eingaben - das Lokal schreibt sie nicht (Punkt 8, 25).
 * Deshalb sehen alle GO-Angebote gleich aus, und keines heisst
 * "SUPER AKSIONNNNN!!!".
 */
function buildGoBenefitLabel(benefit = {}) {
  const source = benefit && typeof benefit === "object" ? benefit : {};
  const text = cleanGoText(source.text, 160);
  if (text) return text;
  const percent = asCount(source.percent, 0);
  const kind = normalizeBenefitKind(source.kind, percent);
  const item = cleanGoText(source.itemName, 160);

  if (kind === GO_BENEFIT_DISCOUNT) {
    if (percent <= 0) return "";
    return [`-${percent}%`, goDiscountScopeText(source.scope)].filter(Boolean).join(" ");
  }
  if (kind === GO_BENEFIT_FREE_ITEM) {
    if (!item) return "";
    // FALAS gross - es ist das Wort, um das es geht (Punkt 6.7).
    return [`${item} FALAS`, goFreeConditionText(source)].filter(Boolean).join(" ");
  }
  if (kind === GO_BENEFIT_BUNDLE || kind === GO_BENEFIT_SPECIAL_PRICE) {
    const price = benefitGoPriceLabel(source);
    if (!item) return price;
    return [item, price].filter(Boolean).join(" ");
  }
  if (kind === "table") return "Tavolinë e rezervuar";
  return "";
}

/**
 * Dasselbe Angebot, aufgeteilt in die Zeilen der Kundenkarte.
 *
 * Die Karte des Gastes ist fuer alle vier Arten dieselbe (Punkt 8): oben ein
 * kleiner Hinweis, darunter die eine grosse Zeile, dann eine Ergaenzung, und
 * bei Preisen der alte Preis klein und durchgestrichen neben dem GO-Preis.
 * Wer die Karte zeichnet, entscheidet nichts mehr - hier steht schon, was
 * hingehoert.
 */
function buildGoBenefitView(benefit = {}) {
  const source = benefit && typeof benefit === "object" && benefit.label !== undefined
    ? benefit
    : normalizeGoBenefit(benefit);
  const view = {
    kind: source.kind || "",
    eyebrow: "",
    headline: source.label || "",
    note: "",
    priceRegular: "",
    priceGo: "",
    savingLabel: ""
  };
  const item = cleanGoText(source.itemName, 160);

  if (source.kind === GO_BENEFIT_DISCOUNT) {
    const percent = asCount(source.percent, 0);
    view.headline = percent > 0 ? `-${percent}%` : "";
    view.note = goDiscountScopeText(source.scope);
    return view;
  }
  if (source.kind === GO_BENEFIT_FREE_ITEM) {
    // "1 Pije FALAS", nicht "1 PIJE FALAS": Gross ist das Wort, um das es
    // geht - und das ist FALAS. Ein Produktname in Grossbuchstaben nimmt ihm
    // genau die Betonung, fuer die er dort steht (Punkt 33).
    view.headline = item ? `${item} FALAS` : "";
    view.note = goFreeConditionText(source);
    return view;
  }
  if (source.kind === GO_BENEFIT_BUNDLE || source.kind === GO_BENEFIT_SPECIAL_PRICE) {
    view.eyebrow = source.kind === GO_BENEFIT_BUNDLE ? "Paketë GO" : "Çmim special GO";
    view.headline = item;
    view.priceRegular = formatGoPrice(source.regularPriceCents);
    view.priceGo = benefitGoPriceLabel(source);
    const saving = formatGoPrice(source.savingCents);
    view.savingLabel = saving ? `Kursen ${saving}` : "";
    return view;
  }
  return view;
}

// Gruppengroessen. Gespeichert werden die Bereiche des Editors ("2-4"),
// gerechnet wird mit min/max - so bleibt der Editor lesbar und das Matching
// eine einzige Zahlenpruefung.
function normalizeGoPartyRanges(value) {
  const list = Array.isArray(value) ? value : (value ? [value] : []);
  const keys = [];
  list.forEach((entry) => {
    const key = String(entry || "").trim().toLowerCase();
    if (goPartyRange(key) && !keys.includes(key)) keys.push(key);
  });
  return keys.length ? keys : GO_PARTY_RANGES.map((entry) => entry.key);
}

function resolveGoPartyBounds(ranges = []) {
  const keys = normalizeGoPartyRanges(ranges);
  let min = Number.POSITIVE_INFINITY;
  let max = 0;
  keys.forEach((key) => {
    const range = goPartyRange(key);
    if (!range) return;
    min = Math.min(min, range.min);
    max = Math.max(max, range.max);
  });
  if (!Number.isFinite(min) || !max) return { min: 1, max: 99 };
  return { min, max };
}

// Der Wochenplan. "Gjithmonë" heisst: jeden Tag, den ganzen Tag - begrenzt
// wird das Angebot dann allein von den Oeffnungszeiten.
function normalizeGoSchedule(raw = {}) {
  const source = raw && typeof raw === "object" ? raw : {};
  const mode = String(source.mode || "").trim().toLowerCase() === "windows" ? "windows" : "always";
  const days = [];
  const rawDays = Array.isArray(source.days) ? source.days : [];
  rawDays.forEach((day) => {
    const key = String(day || "").trim().toLowerCase();
    if (GO_WEEKDAY_KEYS.includes(key) && !days.includes(key)) days.push(key);
  });
  const windows = normalizeGoWindows(
    (Array.isArray(source.windows) ? source.windows : []).map((entry) => ({
      start: entry?.start ?? entry?.from,
      end: entry?.end ?? entry?.to
    }))
  );
  if (mode === "always" || (!days.length && !windows.length)) {
    return { mode: "always", days: GO_WEEKDAY_KEYS.slice(), windows: [] };
  }
  return {
    mode: "windows",
    days: days.length ? days : GO_WEEKDAY_KEYS.slice(),
    windows
  };
}

// Ein Zeitraum in Tagesschluesseln der oertlichen Zeit ("2026-08-15"), nicht
// in Millisekunden: "nur vom 15. bis 20. August" ist eine Aussage ueber
// Kalendertage des Lokals, nicht ueber einen Moment auf der Weltuhr.
function normalizeGoDateRange(raw = {}) {
  const source = raw && typeof raw === "object" ? raw : {};
  const read = (value) => {
    const text = cleanGoText(value, 10);
    return /^\d{4}-\d{2}-\d{2}$/.test(text) ? text : "";
  };
  const startDate = read(source.startDate || source.from);
  const endDate = read(source.endDate || source.to);
  if (startDate && endDate && endDate < startDate) return { startDate: endDate, endDate: startDate };
  return { startDate, endDate };
}

// Die Grenzen, die ein Lokal seinem GO-Angebot geben kann. Alles 0 bedeutet
// "keine Grenze" - eine 0 als "nichts erlaubt" waere eine Falle.
function normalizeGoLimits(raw = {}) {
  const source = raw && typeof raw === "object" ? raw : {};
  return {
    slotGroups: asCount(source.slotGroups ?? source.maxGroupsPerSlot, 0),
    slotGuests: asCount(source.slotGuests ?? source.maxGuestsPerSlot, 0),
    dailyGroups: asCount(source.dailyGroups ?? source.maxGroupsPerDay, 0),
    totalRedemptions: asCount(source.totalRedemptions ?? source.maxRedemptions, 0)
  };
}

function normalizeChannels(value) {
  const list = Array.isArray(value) ? value : [];
  const channels = [];
  list.forEach((entry) => {
    const key = String(entry || "").trim().toLowerCase();
    if ((key === GO_CHANNEL_GO || key === GO_CHANNEL_PUBLIC) && !channels.includes(key)) channels.push(key);
  });
  return channels.length ? channels : [GO_CHANNEL_GO];
}

/**
 * Ein GO-Angebot in seiner vollstaendigen, gerechneten Form.
 * Aus jeder Quelle (Firestore, Editor, Test) kommt dasselbe Objekt heraus.
 */
function normalizeGoOffer(raw = {}, fallbackId = "") {
  const source = raw && typeof raw === "object" ? raw : {};
  const partyRanges = normalizeGoPartyRanges(source.partyRanges || source.partySizes);
  const bounds = resolveGoPartyBounds(partyRanges);
  const benefit = normalizeGoBenefit(source.benefit);
  const bookingType = normalizeGoBookingType(source.bookingType);
  return {
    id: cleanGoText(source.id || fallbackId, 180),
    restaurantId: cleanGoText(source.restaurantId, 180),
    // Mehrfilialbetriebe: jedes Angebot haengt an genau einer Adresse
    // (Punkt 124). Solange ein Lokal nur eine hat, ist das "main".
    locationId: cleanGoText(source.locationId, 180) || "main",
    title: cleanGoText(source.title, 120),
    description: cleanGoText(source.description || source.text, 400),
    terms: cleanGoText(source.terms || source.conditions, 400),
    // Das Foto des Angebots (Punkt 9 bis 13). Eines, nicht fuenf - und
    // freiwillig: Ohne Foto zeichnet die Karte des Gastes ihre eigene Fassung
    // und sieht dabei nicht wie eine Karte mit einem Loch aus.
    imageUrl: cleanGoImageUrl(source.imageUrl || source.image?.url || source.photoUrl),
    benefit,
    benefitLabel: benefit.label,
    category: normalizeGoCategory(source.category),
    partyRanges,
    minParty: bounds.min,
    maxParty: bounds.max,
    schedule: normalizeGoSchedule(source.schedule),
    dateRange: normalizeGoDateRange(source.dateRange),
    bookingType,
    limits: normalizeGoLimits(source.limits),
    channels: normalizeChannels(source.channels),
    status: normalizeStatus(source.status),
    sponsored: source.sponsored === true || source.sponsored?.active === true,
    sponsoredUntil: toGoIso(source.sponsored?.until),
    priceLevel: Math.min(4, Math.max(0, asCount(source.priceLevel, 0))),
    redeemedCount: asCount(source.redeemedCount, 0),
    createdAt: toGoIso(source.createdAt),
    updatedAt: toGoIso(source.updatedAt)
  };
}

// Was tatsaechlich in Firestore landet. Gerechnete Felder (benefitLabel,
// minParty) werden mitgeschrieben, weil der Server danach filtert und sortiert
// - ein Index kann nur lesen, was auch dasteht.
function toGoOfferStoragePayload(offer = {}, { serverTimestamp = null } = {}) {
  const normalized = normalizeGoOffer(offer);
  const payload = {
    restaurantId: normalized.restaurantId,
    locationId: normalized.locationId,
    title: normalized.title,
    description: normalized.description,
    terms: normalized.terms,
    imageUrl: normalized.imageUrl,
    benefit: normalized.benefit,
    benefitLabel: normalized.benefitLabel,
    category: normalized.category,
    partyRanges: normalized.partyRanges,
    minParty: normalized.minParty,
    maxParty: normalized.maxParty,
    schedule: normalized.schedule,
    dateRange: normalized.dateRange,
    bookingType: normalized.bookingType,
    limits: normalized.limits,
    channels: normalized.channels,
    status: normalized.status,
    sponsored: normalized.sponsored,
    priceLevel: normalized.priceLevel
  };
  if (serverTimestamp) {
    payload.updatedAt = serverTimestamp;
    if (!normalized.createdAt) payload.createdAt = serverTimestamp;
  }
  return payload;
}

/**
 * Was der aktuellen Angebotsart fehlt (Punkt 12 bis 15).
 *
 * Kurze Saetze, jeder an seinem Feld. Geprueft wird nur, was fuer die
 * GEWAEHLTE Art gebraucht wird - was in einer anderen Art getippt und dann
 * verlassen wurde, geht niemanden mehr etwas an (Punkt 11).
 *
 * Und: Hier steht keine Bewertung. Dass der GO-Preis unter dem normalen liegen
 * muss, ist Logik und keine Meinung darueber, ob das Angebot gut ist
 * (Punkt 13, 30).
 */
function validateGoBenefit(benefit = {}) {
  const source = benefit && typeof benefit === "object" && benefit.label !== undefined
    ? benefit
    : normalizeGoBenefit(benefit);
  const errors = [];
  const item = cleanGoText(source.itemName, 160);
  const priceErrors = (productMessage = "") => {
    if (!item) errors.push({ field: "benefitItem", message: productMessage });
    // Ein Angebot von damals traegt seinen Preis als Text. Es hat nie zwei
    // Preise gehabt, und der Wirt soll es aendern koennen, ohne beide
    // nachtragen zu muessen.
    if (source.priceText && !source.regularPriceCents && !source.goPriceCents) return;
    if (!source.regularPriceCents) errors.push({ field: "regularPrice", message: "Shkruaj çmimin normal." });
    if (!source.goPriceCents) errors.push({ field: "goPrice", message: "Shkruaj çmimin GO." });
    if (source.regularPriceCents && source.goPriceCents && source.goPriceCents >= source.regularPriceCents) {
      errors.push({ field: "goPrice", message: "Çmimi GO duhet të jetë më i ulët se çmimi normal." });
    }
  };

  if (source.kind === GO_BENEFIT_DISCOUNT) {
    if (source.percent <= 0) errors.push({ field: "benefitPercent", message: "Shkruaj zbritjen." });
    if (!GO_DISCOUNT_SCOPES.includes(source.scope)) {
      errors.push({ field: "benefitScope", message: "Zgjidh ku vlen zbritja." });
    }
    return errors;
  }
  if (source.kind === GO_BENEFIT_FREE_ITEM) {
    if (!item) errors.push({ field: "benefitItem", message: "Shkruaj çka merr klienti falas." });
    if (!source.conditionType) {
      errors.push({ field: "benefitCondition", message: "Zgjidh kushtin e ofertës." });
    } else if (source.conditionType === "custom" && !source.customCondition) {
      errors.push({ field: "benefitCondition", message: "Shkruaj kushtin e ofertës." });
    }
    return errors;
  }
  if (source.kind === GO_BENEFIT_BUNDLE) {
    priceErrors("Shkruaj çka përfshin paketa.");
    return errors;
  }
  if (source.kind === GO_BENEFIT_SPECIAL_PRICE) {
    priceErrors("Shkruaj produktin.");
    return errors;
  }
  // Die Arten von damals ("table", "custom") haben kein eigenes Formular mehr.
  // Fuer sie gilt weiter die eine Frage: Steht da ueberhaupt etwas?
  if (!source.label) errors.push({ field: "benefit", message: "Shkruaj çka po ofron." });
  return errors;
}

/**
 * Prueft ein Angebot, bevor es gespeichert wird.
 * Meldungen sind albanisch - sie stehen im Editor unter dem Feld.
 */
function validateGoOffer(offer = {}) {
  const normalized = normalizeGoOffer(offer);
  const errors = [];
  if (!normalized.restaurantId) errors.push({ field: "restaurantId", message: "Lokali mungon." });
  errors.push(...validateGoBenefit(normalized.benefit));
  if (!normalized.partyRanges.length) errors.push({ field: "partyRanges", message: "Zgjidh sa persona." });
  if (normalized.schedule.mode === "windows") {
    if (!normalized.schedule.days.length) errors.push({ field: "schedule", message: "Zgjidh ditët." });
    if (!normalized.schedule.windows.length) errors.push({ field: "schedule", message: "Zgjidh orarin." });
  }
  return { ok: errors.length === 0, errors, offer: normalized };
}

// Die Fenster des Angebots an einem Wochentag - noch ohne Oeffnungszeiten.
// Der Schnitt mit den Oeffnungszeiten passiert in der Matching-Engine, weil
// nur dort das Profil des Lokals bekannt ist.
function resolveGoOfferWindowsForDay(offer = {}, weekday = "") {
  const normalized = offer && offer.schedule ? offer : normalizeGoOffer(offer);
  const schedule = normalized.schedule || { mode: "always", days: [], windows: [] };
  const day = String(weekday || "").trim().toLowerCase();
  if (schedule.mode === "always") return { open: true, windows: [] };
  if (day && !schedule.days.includes(day)) return { open: false, windows: [] };
  return { open: true, windows: mergeGoWindows(schedule.windows) };
}

// Liegt der Kalendertag im Zeitraum des Angebots? Ohne Zeitraum: immer ja.
function isGoOfferWithinDateRange(offer = {}, dayKey = "") {
  const range = offer && offer.dateRange ? offer.dateRange : normalizeGoOffer(offer).dateRange;
  const day = cleanGoText(dayKey, 10);
  if (!day) return true;
  if (range.startDate && day < range.startDate) return false;
  if (range.endDate && day > range.endDate) return false;
  return true;
}

// Die Zeile im Editor: "Hën–Enj · 14:00-18:00".
//
// "Gjithmonë" statt "Nonstop" (Punkt 21): Ein Wirt liest daran sofort, dass
// sein Angebot immer gilt, solange sein Lokal offen ist - "Nonstop" klang wie
// eine Aussage ueber die Nacht.
//
// Gelten alle sieben Tage, steht dort nur die Uhrzeit. Sieben Woerter
// aufzuzaehlen, um "jeden Tag" zu sagen, belegt auf der Karte des Gastes die
// Zeile, in der sein Zeitfenster stehen soll.
function describeGoSchedule(offer = {}) {
  const normalized = offer && offer.schedule ? offer : normalizeGoOffer(offer);
  const schedule = normalized.schedule;
  if (schedule.mode === "always") return "Gjithmonë";
  const days = describeGoWeekdays(schedule.days);
  const windows = schedule.windows
    .map((entry) => `${formatGoClock(entry.start)}-${formatGoClock(entry.end)}`)
    .join(", ");
  return [days, windows].filter(Boolean).join(" · ");
}

// "3–4 persona" - und "Të gjithë", wenn das Angebot fuer jede Gruppe gilt.
// "1+ persona" waere dieselbe Aussage in einer Sprache, die niemand spricht.
function describeGoPartyRanges(offer = {}) {
  const normalized = offer && offer.partyRanges ? offer : normalizeGoOffer(offer);
  if (normalized.minParty <= 1 && normalized.maxParty >= GO_PARTY_SIZE_MAX) return "Të gjithë";
  const max = normalized.maxParty >= GO_PARTY_SIZE_MAX ? `${normalized.minParty}+` : `${normalized.minParty}–${normalized.maxParty}`;
  return `${max} persona`;
}

// Ein Angebot ist buchbar, solange es aktiv ist. Pausiert und archiviert
// heissen beide: keine neuen Buchungen - bestehende bleiben unberuehrt
// (Punkt 94, 95).
function isGoOfferBookable(offer = {}) {
  return normalizeStatus(offer?.status) === GO_OFFER_STATUS_ACTIVE;
}

function buildGoOfferWindow(startValue, endValue) {
  return buildGoWindow(startValue, endValue);
}

module.exports = {
  GO_OFFERS_COLLECTION,
  GO_OFFER_STATUS_ACTIVE,
  GO_OFFER_STATUS_PAUSED,
  GO_OFFER_STATUS_ARCHIVED,
  GO_CHANNEL_GO,
  GO_CHANNEL_PUBLIC,
  GO_BENEFIT_DISCOUNT,
  GO_BENEFIT_BUNDLE,
  GO_BENEFIT_FREE_ITEM,
  GO_BENEFIT_SPECIAL_PRICE,
  GO_BENEFIT_KINDS,
  GO_DISCOUNT_SCOPES,
  GO_FREE_CONDITIONS,
  cleanGoText,
  cleanGoImageUrl,
  parseGoPriceCents,
  formatGoPrice,
  formatGoPriceInput,
  normalizeGoCategory,
  normalizeGoBookingType,
  normalizeGoBenefit,
  goDiscountScopeText,
  goFreeConditionText,
  buildGoBenefitLabel,
  buildGoBenefitView,
  normalizeGoPartyRanges,
  resolveGoPartyBounds,
  normalizeGoSchedule,
  normalizeGoDateRange,
  normalizeGoLimits,
  normalizeGoOffer,
  toGoOfferStoragePayload,
  validateGoBenefit,
  validateGoOffer,
  resolveGoOfferWindowsForDay,
  isGoOfferWithinDateRange,
  describeGoSchedule,
  describeGoPartyRanges,
  isGoOfferBookable,
  buildGoOfferWindow
};
