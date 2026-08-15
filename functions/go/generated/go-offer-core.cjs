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

function cleanGoText(value = "", maxLength = 240) {
  return String(value ?? "").trim().slice(0, maxLength);
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

// Der Vorteil, den der Gast bekommt. Der Text darunter ist das, was auf der
// Karte steht - er wird beim Buchen eingefroren und aendert sich fuer diese
// Buchung nie wieder (Punkt 92).
function normalizeGoBenefit(raw = {}) {
  const source = raw && typeof raw === "object" ? raw : {};
  const kind = String(source.kind || source.type || "").trim().toLowerCase();
  const percent = Math.min(90, Math.max(0, asCount(source.percent ?? source.discountPercent, 0)));
  const benefit = {
    kind: ["percent", "freeItem", "bundle", "table", "custom"].includes(kind)
      ? kind
      : (percent > 0 ? "percent" : "custom"),
    percent,
    itemId: cleanGoText(source.itemId, 180),
    itemName: cleanGoText(source.itemName || source.item, 160),
    priceText: cleanGoText(source.priceText || source.price, 60),
    // `text` ist der eigene Satz des Lokals, `label` das Ergebnis. Die beiden
    // duerfen nicht ineinanderlaufen: Wuerde `label` beim naechsten
    // Normalisieren wieder als `text` gelesen, waere aus einem abgeleiteten
    // "-10 %" ein handgeschriebener Text geworden - und eine spaetere
    // Aenderung des Prozentsatzes kaeme nie mehr auf der Karte an.
    text: cleanGoText(source.text, 160)
  };
  benefit.label = buildGoBenefitLabel(benefit);
  return benefit;
}

// Die eine Zeile, die auf der Karte gross steht. Kein Satz, keine Erklaerung -
// der Gast soll in einem Blick sehen, was er bekommt.
function buildGoBenefitLabel(benefit = {}) {
  const source = benefit && typeof benefit === "object" ? benefit : {};
  const text = cleanGoText(source.text, 160);
  if (text) return text;
  const percent = asCount(source.percent, 0);
  if (source.kind === "percent" || percent > 0) return percent > 0 ? `–${percent} %` : "";
  if (source.kind === "freeItem") {
    const item = cleanGoText(source.itemName, 160);
    return item ? `${item} falas` : "Produkt falas";
  }
  if (source.kind === "bundle") {
    const item = cleanGoText(source.itemName, 160);
    const price = cleanGoText(source.priceText, 60);
    if (item && price) return `${item} ${price}`;
    return item || price || "Paket special";
  }
  if (source.kind === "table") return "Tavolinë e rezervuar";
  return "";
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
 * Prueft ein Angebot, bevor es gespeichert wird.
 * Meldungen sind albanisch - sie stehen im Editor unter dem Feld.
 */
function validateGoOffer(offer = {}) {
  const normalized = normalizeGoOffer(offer);
  const errors = [];
  if (!normalized.restaurantId) errors.push({ field: "restaurantId", message: "Lokali mungon." });
  if (!normalized.benefitLabel) errors.push({ field: "benefit", message: "Shkruaj çka po ofron." });
  if (!normalized.partyRanges.length) errors.push({ field: "partyRanges", message: "Zgjidh sa persona." });
  if (normalized.schedule.mode === "windows") {
    if (!normalized.schedule.days.length) errors.push({ field: "schedule", message: "Zgjidh ditët." });
    if (!normalized.schedule.windows.length) errors.push({ field: "schedule", message: "Zgjidh orarin." });
  }
  if (normalized.benefit.kind === "percent" && normalized.benefit.percent <= 0) {
    errors.push({ field: "benefit", message: "Zbritja duhet të jetë mbi 0 %." });
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
function describeGoSchedule(offer = {}) {
  const normalized = offer && offer.schedule ? offer : normalizeGoOffer(offer);
  const schedule = normalized.schedule;
  if (schedule.mode === "always") return "Gjithmonë";
  const dayLabels = {
    mon: "Hën", tue: "Mar", wed: "Mër", thu: "Enj", fri: "Pre", sat: "Sht", sun: "Die"
  };
  const days = schedule.days.map((day) => dayLabels[day] || day).join(", ");
  const windows = schedule.windows
    .map((entry) => `${formatGoClock(entry.start)}-${formatGoClock(entry.end)}`)
    .join(", ");
  return [days, windows].filter(Boolean).join(" · ");
}

function describeGoPartyRanges(offer = {}) {
  const normalized = offer && offer.partyRanges ? offer : normalizeGoOffer(offer);
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
  cleanGoText,
  normalizeGoCategory,
  normalizeGoBookingType,
  normalizeGoBenefit,
  buildGoBenefitLabel,
  normalizeGoPartyRanges,
  resolveGoPartyBounds,
  normalizeGoSchedule,
  normalizeGoDateRange,
  normalizeGoLimits,
  normalizeGoOffer,
  toGoOfferStoragePayload,
  validateGoOffer,
  resolveGoOfferWindowsForDay,
  isGoOfferWithinDateRange,
  describeGoSchedule,
  describeGoPartyRanges,
  isGoOfferBookable,
  buildGoOfferWindow
};
