"use strict";

// Generated from ../../../shared/go/go-matching-core.js. Do not edit manually.
// Run: node functions/scripts/sync-go-shared.cjs

// Mnyra GO - die Matching-Engine. Pur.
//
// Sie beantwortet genau eine Frage: Darf dieses Angebot diesem Gast in diesem
// Augenblick gezeigt werden - und wenn ja, wie weit oben?
//
// Zwei Eigenschaften sind dabei wichtiger als alles andere:
//
//  1. Sie ist eine reine Funktion. Dieselben Eingaben ergeben dieselbe
//     Antwort, auf dem Server wie im Test. Die Suche und die zweite Pruefung
//     beim Buchen laufen durch denselben Code - so kann ein Angebot nicht
//     erscheinen, das beim Zugreifen abgelehnt wuerde, und andersherum
//     (Spezifikation Punkt 27, 119).
//
//  2. Sie sagt nicht nur nein, sondern warum. Die Gruende sind Codes, keine
//     Saetze - der Server entscheidet damit, ob er dem Gast "Kjo ofertë sapo u
//     plotësua" zeigt oder still einen anderen Treffer nimmt.
//
// Die Uhrzeit des Gastes ist hier eine erwartete Ankunft. Sie waehlt aus,
// welche Angebote passen - sie ist kein Einlassfenster (Punkt 11, 71).

const {
  GO_BOOKING_TYPE_RESERVATION,
  GO_CATEGORY_ALL,
  GO_MAX_LEAD_DAYS,
  GO_PARTY_SIZE_DEFAULT,
  GO_PARTY_SIZE_MAX,
  GO_PARTY_SIZE_MIN,
  GO_SEARCH_RESULT_LIMIT,
  goBudgetLevel
} = require("./go-feature-config.cjs");
const {
  cleanGoText,
  isGoOfferBookable,
  isGoOfferWithinDateRange,
  normalizeGoCategory,
  normalizeGoOffer,
  resolveGoOfferWindowsForDay
} = require("./go-offer-core.cjs");
const { readGoOpeningWindows } = require("./go-opening-hours-core.cjs");
const {
  GO_DEFAULT_TIME_ZONE,
  intersectGoWindows,
  isWithinGoWindows,
  resolveGoLocalTime,
  toGoMillis
} = require("./go-time-core.cjs");

const GO_MATCH_REASONS = Object.freeze({
  businessInactive: "business_inactive",
  goDisabled: "go_disabled",
  goPaused: "go_paused",
  offerInactive: "offer_inactive",
  dateOutOfRange: "date_out_of_range",
  scheduleClosed: "schedule_closed",
  venueClosed: "venue_closed",
  categoryMismatch: "category_mismatch",
  partyMismatch: "party_mismatch",
  cityMismatch: "city_mismatch",
  budgetMismatch: "budget_mismatch",
  capacityFull: "capacity_full",
  dailyLimitReached: "daily_limit_reached",
  totalLimitReached: "total_limit_reached",
  reservationsNotAllowed: "reservations_not_allowed",
  leadTooFar: "lead_too_far"
});

// Der eine Grund, den der Gast als eigenen Text zu sehen bekommt: Das
// Angebot war eben noch da und ist jetzt voll.
const GO_SOLD_OUT_REASONS = Object.freeze([
  GO_MATCH_REASONS.capacityFull,
  GO_MATCH_REASONS.dailyLimitReached,
  GO_MATCH_REASONS.totalLimitReached
]);

const EARTH_RADIUS_KM = 6371;

function toNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function foldCity(value = "") {
  let text = String(value ?? "").toLowerCase().trim();
  try {
    text = text.normalize("NFKD").replace(/[̀-ͯ]/g, "");
  } catch {
    // Ohne Normalisierung vergleicht sich weniger, aber nichts falsch.
  }
  return text.replace(/[^a-z0-9]+/g, "");
}

function goDistanceKm(from, to) {
  const fromLat = toNumber(from?.lat ?? from?.latitude, NaN);
  const fromLng = toNumber(from?.lng ?? from?.longitude, NaN);
  const toLat = toNumber(to?.lat ?? to?.latitude, NaN);
  const toLng = toNumber(to?.lng ?? to?.longitude, NaN);
  if (![fromLat, fromLng, toLat, toLng].every(Number.isFinite)) return -1;
  const toRad = (value) => (value * Math.PI) / 180;
  const deltaLat = toRad(toLat - fromLat);
  const deltaLng = toRad(toLng - fromLng);
  const a = Math.sin(deltaLat / 2) ** 2
    + Math.cos(toRad(fromLat)) * Math.cos(toRad(toLat)) * Math.sin(deltaLng / 2) ** 2;
  return EARTH_RADIUS_KM * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * Die Anfrage des Gastes, auf ihre Kernangaben gebracht.
 *
 * Mitgeschickt wird nur, was das Matching braucht: Stadt, Gruppengroesse,
 * Kategorie, erwartete Ankunft, optional Budget und Koordinaten. Kein Profil,
 * keine Kennung, kein Geraet (Punkt 16).
 */
function normalizeGoSearchRequest(raw = {}, { nowMs = Date.now() } = {}) {
  const source = raw && typeof raw === "object" ? raw : {};
  const now = toGoMillis(nowMs) || Date.now();
  const partySize = Math.min(
    GO_PARTY_SIZE_MAX,
    Math.max(GO_PARTY_SIZE_MIN, Math.trunc(toNumber(source.partySize, GO_PARTY_SIZE_DEFAULT)))
  );
  const requestedRaw = toGoMillis(source.requestedAt || source.expectedArrivalAt);
  // Eine Ankunft in der Vergangenheit ist keine Ablehnung wert - der Gast ist
  // dann eben jetzt da. Zu weit voraus wird auf das Ende des Fensters gelegt.
  const maxAheadMs = now + GO_MAX_LEAD_DAYS * 24 * 60 * 60 * 1000;
  const requestedAt = !requestedRaw || requestedRaw < now
    ? now
    : Math.min(requestedRaw, maxAheadMs);
  const budget = goBudgetLevel(source.budget);
  const lat = toNumber(source.coords?.lat ?? source.lat, NaN);
  const lng = toNumber(source.coords?.lng ?? source.lng, NaN);
  return {
    city: cleanGoText(source.city, 120),
    cityKey: foldCity(source.city),
    partySize,
    category: normalizeGoCategory(source.category),
    requestedAt,
    // Nur wenn der Gast selbst spaeter gewaehlt hat, ist es ein Termin -
    // sonst ist es "jetzt". Der Unterschied zaehlt nur fuer die Anzeige.
    isNow: requestedAt - now < 5 * 60 * 1000,
    budget: budget ? budget.key : "",
    budgetMaxPerPerson: budget ? budget.maxPerPerson : 0,
    coords: Number.isFinite(lat) && Number.isFinite(lng) ? { lat, lng } : null,
    locale: cleanGoText(source.locale, 12)
  };
}

function readBusinessCoords(business = {}) {
  const source = business && typeof business === "object" ? business : {};
  const direct = source.coords || source.location || source.geo || null;
  const lat = toNumber(direct?.lat ?? direct?.latitude ?? source.lat ?? source.latitude, NaN);
  const lng = toNumber(direct?.lng ?? direct?.longitude ?? source.lng ?? source.longitude, NaN);
  return Number.isFinite(lat) && Number.isFinite(lng) ? { lat, lng } : null;
}

// Ist GO fuer dieses Lokal ueberhaupt an? Pausiert wird mit einem Zeitpunkt,
// nicht mit einem Schalter - "bis morgen" muss von selbst enden.
function isGoBusinessOpenForNewBookings(settings = {}, nowMs = Date.now()) {
  const source = settings && typeof settings === "object" ? settings : {};
  if (source.enabled === false) return { ok: false, reason: GO_MATCH_REASONS.goDisabled };
  const pausedUntil = toGoMillis(source.pausedUntil);
  const now = toGoMillis(nowMs) || Date.now();
  // Ohne Ende pausiert: pausedUntil = 0 und paused = true.
  if (source.paused === true && !pausedUntil) return { ok: false, reason: GO_MATCH_REASONS.goPaused };
  if (pausedUntil && pausedUntil > now) return { ok: false, reason: GO_MATCH_REASONS.goPaused };
  return { ok: true, reason: "" };
}

/**
 * Die eigentliche Pruefung.
 *
 * @param {object} params.offer     Rohes oder normalisiertes GO-Angebot.
 * @param {object} params.business  Lokal (Name, Stadt, Koordinaten, Oeffnungszeiten).
 * @param {object} params.settings  GO-Einstellungen des Lokals (enabled, pausedUntil).
 * @param {object} params.usage     Belegung: { slotGroups, slotGuests, dailyGroups, redeemed }.
 * @param {object} params.request   Normalisierte Anfrage des Gastes.
 * @param {number} params.nowMs     Serverzeit. Nie die Uhr des Telefons (Punkt 107).
 */
function matchGoOffer({
  offer = {},
  business = {},
  settings = {},
  usage = {},
  entitlements = null,
  request = {},
  nowMs = Date.now()
} = {}) {
  const normalizedOffer = offer && offer.benefitLabel !== undefined ? offer : normalizeGoOffer(offer);
  const reasons = [];
  const push = (reason) => {
    if (reason && !reasons.includes(reason)) reasons.push(reason);
  };

  const timeZone = cleanGoText(business?.timeZone || settings?.timeZone, 60) || GO_DEFAULT_TIME_ZONE;
  const arrival = resolveGoLocalTime(request?.requestedAt || nowMs, timeZone);

  if (business?.active === false || business?.deleted === true) push(GO_MATCH_REASONS.businessInactive);

  const openState = isGoBusinessOpenForNewBookings(settings, nowMs);
  if (!openState.ok) push(openState.reason);

  if (entitlements && entitlements.go_enabled === false) push(GO_MATCH_REASONS.goDisabled);
  if (
    entitlements
    && entitlements.go_reservations_enabled === false
    && normalizedOffer.bookingType === GO_BOOKING_TYPE_RESERVATION
  ) {
    push(GO_MATCH_REASONS.reservationsNotAllowed);
  }

  if (!isGoOfferBookable(normalizedOffer)) push(GO_MATCH_REASONS.offerInactive);
  if (!isGoOfferWithinDateRange(normalizedOffer, arrival.dayKey)) push(GO_MATCH_REASONS.dateOutOfRange);

  // Kategorie: "Krejt" passt auf alles - auf beiden Seiten. Ein Angebot ohne
  // Kategorie ist fuer jede Suche offen.
  const wantedCategory = normalizeGoCategory(request?.category);
  if (
    wantedCategory !== GO_CATEGORY_ALL
    && normalizedOffer.category !== GO_CATEGORY_ALL
    && normalizedOffer.category !== wantedCategory
  ) {
    push(GO_MATCH_REASONS.categoryMismatch);
  }

  const partySize = Math.max(1, Math.trunc(toNumber(request?.partySize, GO_PARTY_SIZE_DEFAULT)));
  if (partySize < normalizedOffer.minParty || partySize > normalizedOffer.maxParty) {
    push(GO_MATCH_REASONS.partyMismatch);
  }

  // Stadt: nur vergleichen, wenn beide Seiten eine haben. Ein Lokal ohne
  // Stadtangabe soll nicht unsichtbar werden.
  const requestCity = request?.cityKey || foldCity(request?.city);
  const businessCity = foldCity(business?.city);
  if (requestCity && businessCity && requestCity !== businessCity) push(GO_MATCH_REASONS.cityMismatch);

  // Zeit. Erst der Plan des Angebots, dann - und das ist die staerkere
  // Wahrheit - die Oeffnungszeit des Lokals (Punkt 18).
  const offerDay = resolveGoOfferWindowsForDay(normalizedOffer, arrival.weekday);
  if (!offerDay.open) push(GO_MATCH_REASONS.scheduleClosed);
  const opening = readGoOpeningWindows(business, arrival.weekday);
  let windows = offerDay.windows;
  if (opening.hasData) {
    if (!opening.windows.length) {
      push(GO_MATCH_REASONS.venueClosed);
      windows = [];
    } else {
      windows = offerDay.windows.length
        ? intersectGoWindows(offerDay.windows, opening.windows)
        : opening.windows.slice();
      if (!windows.length) push(GO_MATCH_REASONS.venueClosed);
    }
  }
  if (offerDay.open && windows.length && !isWithinGoWindows(arrival.minutes, windows)) {
    push(GO_MATCH_REASONS.scheduleClosed);
  }

  // Budget: Ein Lokal ohne Preisstufe wird nie wegen des Budgets
  // aussortiert - eine geratene Preisklasse waere schlechter als keine.
  const budgetMax = toNumber(request?.budgetMaxPerPerson, 0);
  const priceLevel = Math.trunc(toNumber(normalizedOffer.priceLevel ?? business?.priceLevel, 0));
  if (budgetMax > 0 && priceLevel > 0) {
    const levelCeiling = [0, 10, 20, 30, 60][Math.min(4, priceLevel)];
    if (levelCeiling > budgetMax) push(GO_MATCH_REASONS.budgetMismatch);
  }

  // Grenzen. Die Zahlen kommen aus der Zaehlung des Servers, nie aus dem
  // Browser (Punkt 146: keine clientseitige Kapazitaetslogik).
  const limits = normalizedOffer.limits || {};
  const used = usage && typeof usage === "object" ? usage : {};
  if (limits.totalRedemptions > 0 && toNumber(used.redeemed, 0) >= limits.totalRedemptions) {
    push(GO_MATCH_REASONS.totalLimitReached);
  }
  if (limits.dailyGroups > 0 && toNumber(used.dailyGroups, 0) >= limits.dailyGroups) {
    push(GO_MATCH_REASONS.dailyLimitReached);
  }
  if (normalizedOffer.bookingType === GO_BOOKING_TYPE_RESERVATION) {
    if (limits.slotGroups > 0 && toNumber(used.slotGroups, 0) >= limits.slotGroups) {
      push(GO_MATCH_REASONS.capacityFull);
    }
    if (limits.slotGuests > 0 && toNumber(used.slotGuests, 0) + partySize > limits.slotGuests) {
      push(GO_MATCH_REASONS.capacityFull);
    }
  }

  const distanceKm = request?.coords ? goDistanceKm(request.coords, readBusinessCoords(business)) : -1;

  return {
    ok: reasons.length === 0,
    reasons,
    soldOut: reasons.some((reason) => GO_SOLD_OUT_REASONS.includes(reason)),
    offer: normalizedOffer,
    windows,
    distanceKm,
    arrival
  };
}

/**
 * Die Reihenfolge der Treffer.
 *
 * Bezahlte Platzierung verschiebt nur innerhalb der passenden Treffer - ein
 * unpassendes Angebot kauft sich nicht nach oben (Punkt 23).
 */
function scoreGoMatch({ match = {}, request = {}, business = {} } = {}) {
  if (!match || !match.ok) return -1;
  const offer = match.offer || {};
  let score = 100;

  // Genauigkeit zuerst: ein Angebot, das ausdruecklich fuer diese
  // Gruppengroesse und diese Kategorie gemacht ist, steht vor einem, das
  // ohnehin auf alles passt.
  const spread = Math.max(1, toNumber(offer.maxParty, 99) - toNumber(offer.minParty, 1));
  score += Math.max(0, 24 - spread * 3);
  if (offer.category && offer.category !== "all" && offer.category === request?.category) score += 18;

  // Entfernung: nur wenn der Gast seinen Standort freigegeben hat. Ohne
  // Koordinaten wird niemand bestraft (Punkt 13).
  const distanceKm = toNumber(match.distanceKm, -1);
  if (distanceKm >= 0) score += Math.max(0, 30 - distanceKm * 6);

  // Zeitpassung: Wie mittig liegt die erwartete Ankunft im Fenster? Ein
  // Angebot, das in zehn Minuten endet, ist ein schlechterer Vorschlag.
  const windows = Array.isArray(match.windows) ? match.windows : [];
  const minutes = toNumber(match.arrival?.minutes, -1);
  if (windows.length && minutes >= 0) {
    const remaining = windows.reduce((best, entry) => {
      const left = entry.end - minutes;
      return left > 0 && (best < 0 || left < best) ? left : best;
    }, -1);
    if (remaining >= 0) score += Math.min(16, remaining / 15);
  } else {
    score += 8;
  }

  // Der Vorteil selbst - ein hoeherer Rabatt ist der bessere Vorschlag,
  // aber nie so stark, dass er Passgenauigkeit ueberstimmt.
  score += Math.min(14, toNumber(offer.benefit?.percent, 0) * 0.5);
  if (offer.bookingType === GO_BOOKING_TYPE_RESERVATION) score += 6;

  // Verlaesslichkeit des Lokals: Wer selbst absagt, rutscht nach unten.
  const reliability = Math.min(1, Math.max(0, toNumber(business?.goReliability, 1)));
  score *= 0.7 + 0.3 * reliability;

  if (offer.sponsored) score += 25;
  return Math.round(score * 100) / 100;
}

function rankGoMatches(entries = [], { request = {}, limit = GO_SEARCH_RESULT_LIMIT } = {}) {
  const list = (Array.isArray(entries) ? entries : [])
    .filter((entry) => entry && entry.match && entry.match.ok)
    .map((entry) => ({
      ...entry,
      score: scoreGoMatch({ match: entry.match, request, business: entry.business })
    }))
    .sort((a, b) => (
      b.score - a.score
      // Gleichstand: das naehere Lokal zuerst, danach der Name - damit die
      // Reihenfolge zwischen zwei Aufrufen nicht springt.
      || toNumber(a.match.distanceKm, 9999) - toNumber(b.match.distanceKm, 9999)
      || String(a.business?.name || "").localeCompare(String(b.business?.name || ""))
    ));
  const max = Math.max(1, Math.trunc(toNumber(limit, GO_SEARCH_RESULT_LIMIT)));
  return list.slice(0, max);
}

/**
 * Was ueber die Leitung geht.
 *
 * Bewusst klein: Name, ein kleines Bild, der Vorteil, Entfernung, Art der
 * Buchung. Keine Menuekarte, keine Beitraege, keine Bewertungen, keine
 * grossen Bilder - GO wird im Mobilfunknetz benutzt (Punkt 102).
 */
function buildGoResultCard({ match = {}, business = {}, request = {} } = {}) {
  const offer = match?.offer || {};
  const distanceKm = toNumber(match?.distanceKm, -1);
  return {
    offerId: offer.id,
    restaurantId: offer.restaurantId || business?.id || "",
    locationId: offer.locationId || "main",
    businessName: cleanGoText(business?.name, 120),
    logoUrl: cleanGoText(business?.logoUrl, 500),
    city: cleanGoText(business?.city, 120),
    benefitLabel: offer.benefitLabel || "",
    description: cleanGoText(offer.description, 200),
    category: offer.category,
    bookingType: offer.bookingType,
    partySize: Math.max(1, Math.trunc(toNumber(request?.partySize, 1))),
    expectedArrivalAt: toGoMillis(request?.requestedAt) || 0,
    isNow: !!request?.isNow,
    distanceKm: distanceKm >= 0 ? Math.round(distanceKm * 10) / 10 : null,
    priceLevel: Math.trunc(toNumber(offer.priceLevel, 0)),
    sponsored: !!offer.sponsored,
    terms: cleanGoText(offer.terms, 200)
  };
}

module.exports = {
  GO_MATCH_REASONS,
  GO_SOLD_OUT_REASONS,
  goDistanceKm,
  normalizeGoSearchRequest,
  isGoBusinessOpenForNewBookings,
  matchGoOffer,
  scoreGoMatch,
  rankGoMatches,
  buildGoResultCard
};
