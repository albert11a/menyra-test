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

import {
  GO_CATEGORY_ALL,
  GO_PARTY_SIZE_DEFAULT,
  GO_PARTY_SIZE_MAX,
  GO_PARTY_SIZE_MIN,
  GO_SEARCH_RESULT_LIMIT,
  goBudgetLevel,
  goIntentCategories,
  normalizeGoIntent
} from "./go-feature-config.js";
import { goCityKey } from "./go-city-core.js";
import {
  buildGoBenefitView,
  cleanGoText,
  describeGoSchedule,
  isGoOfferBookable,
  isGoOfferWithinDateRange,
  normalizeGoCategory,
  normalizeGoOffer,
  resolveGoOfferWindowsForDay
} from "./go-offer-core.js";
import { readGoOpeningWindows } from "./go-opening-hours-core.js";
import {
  GO_DEFAULT_TIME_ZONE,
  intersectGoWindows,
  isWithinGoWindows,
  resolveGoLocalTime,
  toGoMillis
} from "./go-time-core.js";

export const GO_MATCH_REASONS = Object.freeze({
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
  dailyLimitReached: "daily_limit_reached",
  totalLimitReached: "total_limit_reached",
  // Hier standen einmal capacity_full (Scheibe voll), reservations_not_allowed
  // (Tarif ohne Tischreservierung) und lead_too_far (weiter als sieben Tage
  // voraus). Alle drei brauchten eine Uhrzeit des Gastes, und die gibt es ohne
  // "Kur?" nicht mehr. Uebrig bleiben die zwei Grenzen, die ein Wirt wirklich
  // fuehrt: wie viele Gruppen an einem Tag, und wie oft insgesamt.
  bookingLocked: "restaurant_locked"
});

// Die Gruende, die der Gast als eigenen Text zu sehen bekommt: Das Angebot war
// eben noch da und ist jetzt voll.
export const GO_SOLD_OUT_REASONS = Object.freeze([
  GO_MATCH_REASONS.dailyLimitReached,
  GO_MATCH_REASONS.totalLimitReached
]);

const EARTH_RADIUS_KM = 6371;

function toNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function goDistanceKm(from, to) {
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
/**
 * Die Kategorien einer Anfrage - egal, wie sie hereinkommt.
 *
 * Der normalisierte Weg fuehrt ueber "categories". Ein Aufrufer, der die
 * Anfrage nicht durch normalizeGoSearchRequest geschickt hat (Tests, ein
 * alter Browser), bringt stattdessen "intent" oder das alte "category" mit.
 * Alle drei landen hier an derselben Stelle, damit Filter und Punkte nie
 * verschiedener Meinung sind.
 */
function readWantedCategories(request = {}) {
  if (Array.isArray(request?.categories)) return request.categories;
  if (request?.intent) return goIntentCategories(request.intent);
  const single = normalizeGoCategory(request?.category);
  return single === GO_CATEGORY_ALL ? [] : [single];
}

export function normalizeGoSearchRequest(raw = {}, { nowMs = Date.now() } = {}) {
  const source = raw && typeof raw === "object" ? raw : {};
  const now = toGoMillis(nowMs) || Date.now();
  const partySize = Math.min(
    GO_PARTY_SIZE_MAX,
    Math.max(GO_PARTY_SIZE_MIN, Math.trunc(toNumber(source.partySize, GO_PARTY_SIZE_DEFAULT)))
  );
  // Gesucht wird immer JETZT.
  //
  // Frueher stand hier eine erwartete Ankunft, die der Gast im Schritt "Kur?"
  // gewaehlt hatte, samt Vorlauffenster von sieben Tagen. Die Frage gibt es
  // nicht mehr, und damit auch keinen Grund, dem Browser eine Uhrzeit zu
  // glauben: Was ein Angebot zeigt, entscheidet die Serverzeit (Punkt 57).
  // Ein alter Browser, der noch ein requestedAt mitschickt, wird nicht
  // abgewiesen - sein Wert wird nur nicht gelesen.
  const requestedAt = now;
  const budget = goBudgetLevel(source.budget);
  const lat = toNumber(source.coords?.lat ?? source.lat, NaN);
  const lng = toNumber(source.coords?.lng ?? source.lng, NaN);

  // Der Gast antwortet auf "Për çka jeni?", das Angebot traegt eine Kategorie
  // - dazwischen steht diese Uebersetzung.
  //
  // "category" ist der alte Weg und bleibt lesbar: Ein Browser, der die Seite
  // noch aus dem Zwischenspeicher hat, sendet weiter einen einzelnen Wert.
  // Ihn abzuweisen hiesse, ihm bis zum naechsten Neuladen nichts zu zeigen.
  const intent = normalizeGoIntent(source.intent);
  const legacyCategory = normalizeGoCategory(source.category);
  const categories = source.intent
    ? goIntentCategories(intent)
    : (legacyCategory === GO_CATEGORY_ALL ? [] : [legacyCategory]);

  return {
    city: cleanGoText(source.city, 120),
    cityKey: goCityKey(source.city),
    partySize,
    intent,
    // Die Kategorien, nach denen wirklich gefiltert wird. Leer heisst "kein
    // Filter" - deshalb steht hier eine Liste und kein einzelner Wert: Eine
    // Antwort des Gastes kann mehrere Kategorien meinen ("Ushqim" meint Ushqim
    // und Ëmbëlsira), und "Nuk e di" meint keine.
    categories,
    // Der Zeitpunkt, gegen den die Zeitfenster der Angebote geprueft werden.
    // Er ist immer jetzt; er steht hier trotzdem als Feld, weil matchGoOffer
    // eine Uhr braucht und ein Test ihr eine andere geben koennen soll.
    requestedAt,
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
export function isGoBusinessOpenForNewBookings(settings = {}, nowMs = Date.now()) {
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
export function matchGoOffer({
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

  if (!isGoOfferBookable(normalizedOffer)) push(GO_MATCH_REASONS.offerInactive);
  if (!isGoOfferWithinDateRange(normalizedOffer, arrival.dayKey)) push(GO_MATCH_REASONS.dateOutOfRange);

  // Kategorie. Drei Faelle, und der erste ist der haeufigste:
  //
  //   keine Kategorie gewaehlt ("Nuk e di")  -> alles passt
  //   das Angebot gilt fuer alles ("Krejt")  -> es passt immer
  //   sonst                                  -> es muss in der Liste stehen
  //
  // Die Liste kommt aus der Antwort des Gastes: "Ushqim" steht fuer Ushqim und
  // Ëmbëlsira, "Pije" fuer Kafe und Pije. Ein Angebot muss auf EINE davon
  // passen, nicht auf alle.
  const wantedCategories = readWantedCategories(request);
  if (
    wantedCategories.length
    && normalizedOffer.category !== GO_CATEGORY_ALL
    && !wantedCategories.includes(normalizedOffer.category)
  ) {
    push(GO_MATCH_REASONS.categoryMismatch);
  }

  const partySize = Math.max(1, Math.trunc(toNumber(request?.partySize, GO_PARTY_SIZE_DEFAULT)));
  if (partySize < normalizedOffer.minParty || partySize > normalizedOffer.maxParty) {
    push(GO_MATCH_REASONS.partyMismatch);
  }

  // Stadt: nur vergleichen, wenn beide Seiten eine haben. Ein Lokal ohne
  // Stadtangabe soll nicht unsichtbar werden.
  //
  // Verglichen werden Schluessel, keine Namen: Der Gast waehlt "Prishtinë",
  // im Profil steht "Prishtina" - dasselbe Lokal, dieselbe Stadt
  // (siehe go-city-core.js).
  const requestCity = goCityKey(request?.cityKey || request?.city);
  const businessCity = goCityKey(business?.city);
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
  // Die Preisstufe des Angebots geht vor, die des Lokals traegt sie, wenn das
  // Angebot keine eigene hat.
  //
  // Mit `??` stand hier eine Weiche, die nie umsprang: Ein normalisiertes
  // Angebot hat priceLevel IMMER - notfalls als 0 -, und 0 ist nicht nullish.
  // Die Preisstufe des Lokals wurde damit nie gelesen, und der Budgetfilter
  // war fuer jedes Angebot ohne eigene Stufe wirkungslos. Gemeint war "keine
  // eigene Stufe", und das heisst hier 0.
  const offerPriceLevel = Math.trunc(toNumber(normalizedOffer.priceLevel, 0));
  const priceLevel = offerPriceLevel > 0
    ? offerPriceLevel
    : Math.trunc(toNumber(business?.priceLevel, 0));
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
export function scoreGoMatch({ match = {}, request = {}, business = {} } = {}) {
  if (!match || !match.ok) return -1;
  const offer = match.offer || {};
  let score = 100;

  // Genauigkeit zuerst: ein Angebot, das ausdruecklich fuer diese
  // Gruppengroesse und diese Kategorie gemacht ist, steht vor einem, das
  // ohnehin auf alles passt.
  const spread = Math.max(1, toNumber(offer.maxParty, 99) - toNumber(offer.minParty, 1));
  score += Math.max(0, 24 - spread * 3);
  const wantedCategories = readWantedCategories(request);
  if (offer.category && offer.category !== GO_CATEGORY_ALL && wantedCategories.includes(offer.category)) {
    score += 18;
  }

  // Entfernung: nur wenn der Gast seinen Standort freigegeben hat. Ohne
  // Koordinaten wird niemand bestraft (Punkt 13).
  const distanceKm = toNumber(match.distanceKm, -1);
  if (distanceKm >= 0) score += Math.max(0, 30 - distanceKm * 6);

  // Zeitpassung: Wieviel von seinem Fenster hat das Angebot noch vor sich? Ein
  // Angebot, das in zehn Minuten endet, ist ein schlechterer Vorschlag - der
  // Gast muesste sofort losgehen.
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

  // Verlaesslichkeit des Lokals: Wer selbst absagt, rutscht nach unten.
  const reliability = Math.min(1, Math.max(0, toNumber(business?.goReliability, 1)));
  score *= 0.7 + 0.3 * reliability;

  if (offer.sponsored) score += 25;
  return Math.round(score * 100) / 100;
}

/**
 * Ein Lokal, ein Platz in der Liste (Punkt 18).
 *
 * Ein Lokal darf mehrere GO-Oferten gleichzeitig haben - Mittagsmenue,
 * Kaffeepreis, Paketa am Abend. Es darf davon nur nicht drei Plaetze derselben
 * Ergebnisliste besetzen: Der Gast bekommt hoechstens acht Karten zu sehen, und
 * wenn vier davon dasselbe Lokal sind, hat er in Wahrheit fuenf Lokale zur
 * Auswahl statt acht.
 *
 * Aussortiert wird NACH dem Sortieren, nicht davor. Nur so bleibt von jedem
 * Lokal das beste Angebot stehen - vorher wuesste noch niemand, welches das
 * ist.
 */
export function dedupeGoMatchesByRestaurant(entries = []) {
  const seen = new Set();
  return (Array.isArray(entries) ? entries : []).filter((entry) => {
    const id = cleanGoText(entry?.offer?.restaurantId || entry?.business?.id, 180);
    // Ein Eintrag ohne Lokal ist kaputt, aber nicht unser Problem: Er faellt
    // hier nicht heraus, sonst verschwaende er stillschweigend.
    if (!id) return true;
    if (seen.has(id)) return false;
    seen.add(id);
    return true;
  });
}

export function rankGoMatches(entries = [], { request = {}, limit = GO_SEARCH_RESULT_LIMIT } = {}) {
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
  // Erst entdoppeln, dann abschneiden. Andersherum haette ein Lokal mit vier
  // guten Angeboten die halbe Liste belegt und danach waeren drei davon
  // verschwunden - der Gast saehe fuenf Karten statt acht.
  return dedupeGoMatchesByRestaurant(list).slice(0, max);
}

/**
 * Was ueber die Leitung geht.
 *
 * Bewusst klein: Name, ein kleines Bild, der Vorteil, Entfernung, Art der
 * Buchung. Keine Menuekarte, keine Beitraege, keine Bewertungen, keine
 * grossen Bilder - GO wird im Mobilfunknetz benutzt (Punkt 102).
 */
export function buildGoResultCard({ match = {}, business = {}, request = {} } = {}) {
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
    // Die Zeilen der Karte, schon aufgeteilt. Sie kommen mit, weil die Karte
    // beim Gast fuer alle vier Angebotsarten dieselbe ist (Punkt 8): Ohne den
    // aufgeteilten Vorteil muesste der Browser aus "2 Burger + 2 Pije 14,90 €"
    // wieder Titel und Preis herausschneiden - und eine Paketa saehe beim Gast
    // anders aus als in der Vorschau, die der Wirt gesehen hat.
    benefitView: buildGoBenefitView(offer.benefit || {}),
    // Das Foto des Angebots. Es entscheidet, welche der Kartenfassungen der
    // Gast sieht: ohne Foto die ruhige Karte, mit Foto die mit dem Bild oben
    // (Punkt 32). Deshalb kommt es mit und wird nicht nachgeladen.
    imageUrl: cleanGoText(offer.imageUrl, 500),
    description: cleanGoText(offer.description, 200),
    category: offer.category,
    partySize: Math.max(1, Math.trunc(toNumber(request?.partySize, 1))),
    // Wann das Angebot gilt, als Zeile fuer die Karte ("Hën–Enj · 07:00-11:30").
    // Hier standen einmal expectedArrivalAt und isNow: die Uhrzeit, zu der der
    // Gast kommen wollte. Die Karte machte daraus "Rreth 19:00" - und tat es
    // falsch, weil sie Millisekunden mit Date.parse las und dabei NaN bekam.
    // Beides ist weg; was den Gast wirklich angeht, ist nicht wann er wollte,
    // sondern wann das Lokal kann.
    scheduleLabel: describeGoSchedule(offer),
    distanceKm: distanceKm >= 0 ? Math.round(distanceKm * 10) / 10 : null,
    priceLevel: Math.trunc(toNumber(offer.priceLevel, 0)),
    sponsored: !!offer.sponsored,
    terms: cleanGoText(offer.terms, 200)
  };
}
