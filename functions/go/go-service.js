"use strict";

// Mnyra GO - der Dienst.
//
// Hier faellt jede Entscheidung, die etwas kostet: ob ein Angebot erscheint,
// ob eine Buchung entsteht, ob ein Platz belegt wird. Der Browser fragt nur -
// er entscheidet nichts (Spezifikation Punkt 146).
//
// Vier Dinge tut dieser Dienst und sonst nichts:
//
//  1. Er gibt anonymen Browsern eine Gastkennung (kein Login noetig, Punkt 30).
//  2. Er sucht passende Angebote - mit derselben Domaene, die auch der Browser
//     kennt, aber mit der Zeit und den Zahlen des Servers (Punkt 107).
//  3. Er legt Buchungen an. In einer Transaktion, mit einem Schluessel gegen
//     Doppelklicks und einer eingefrorenen Kopie der Bedingungen
//     (Punkt 28, 92, 99, 109).
//  4. Er fuehrt sie zu Ende: Check-in, Absage, Abschluss.
//
// Die Datenbank wird von aussen hereingereicht, damit dieser Dienst ohne
// Firebase testbar bleibt.

const {
  GO_BOOKING_TYPE_RESERVATION,
  GO_CAPACITY_SLOT_MINUTES,
  GO_SEARCH_CANDIDATE_LIMIT,
  GO_SEARCH_RESULT_LIMIT,
  resolveGoEntitlements
} = require("./generated/go-feature-config.cjs");
const {
  GO_DEFAULT_TIME_ZONE,
  resolveGoLocalTime,
  toGoMillis
} = require("./generated/go-time-core.cjs");
const { normalizeGoOffer } = require("./generated/go-offer-core.cjs");
const {
  GO_MATCH_REASONS,
  GO_SOLD_OUT_REASONS,
  buildGoResultCard,
  matchGoOffer,
  normalizeGoSearchRequest,
  rankGoMatches
} = require("./generated/go-matching-core.cjs");
const {
  GO_BOOKING_STATUS,
  GO_OPEN_BOOKING_STATUSES,
  buildGoBookingRecord,
  buildGoBookingSnapshot,
  buildGoCapacitySlotKey,
  buildGoDayKey,
  buildGoIdempotencyKey,
  canTransitionGoBooking,
  createGoShortCode,
  findConflictingGoReservation,
  goCapacityWeight,
  normalizeGoBooking,
  resolveGoBookingClosure
} = require("./generated/go-booking-core.cjs");
const {
  applyGoGuestActivity,
  buildGoBookingToken,
  buildGoGuestToken,
  goGuestActionAllowed,
  parseGoBookingToken,
  parseGoGuestToken,
  resolveGoGuestTrustLevel
} = require("./generated/go-guest-identity-core.cjs");
const { readGoOpeningWindows } = require("./generated/go-opening-hours-core.cjs");
const defaultTokens = require("./go-tokens");

const RESTAURANTS_COLLECTION = "restaurants";
const GO_OFFERS_SUBCOLLECTION = "goOffers";
const GO_SETTINGS_SUBCOLLECTION = "goSettings";
const GO_SETTINGS_DOC = "config";
const GO_CAPACITY_SUBCOLLECTION = "goCapacity";
const GO_BOOKINGS_COLLECTION = "goBookings";
const GO_GUEST_SESSIONS_COLLECTION = "goGuestSessions";

const MAX_GUEST_OPEN_BOOKINGS = 25;

// Fehler mit einem Satz, den der Gast lesen kann. Technische Gruende bleiben
// im Log (Punkt 136).
class GoServiceError extends Error {
  constructor(message, code = "failed-precondition", details = {}) {
    super(message);
    this.name = "GoServiceError";
    this.code = code;
    this.details = details || {};
  }
}

function asText(value, maxLength = 240) {
  return String(value === null || value === undefined ? "" : value).trim().slice(0, maxLength);
}

function docData(snapshot) {
  if (!snapshot || snapshot.exists === false) return null;
  const data = typeof snapshot.data === "function" ? snapshot.data() : null;
  return data && typeof data === "object" ? data : null;
}

function createGoService({
  db,
  serverTimestamp = null,
  now = () => Date.now(),
  tokens = defaultTokens,
  searchResultLimit = GO_SEARCH_RESULT_LIMIT,
  candidateLimit = GO_SEARCH_CANDIDATE_LIMIT
} = {}) {
  if (!db) throw new Error("createGoService requires a Firestore instance");

  const restaurantRef = (restaurantId) => db.collection(RESTAURANTS_COLLECTION).doc(asText(restaurantId, 180));
  const offerRef = (restaurantId, offerId) => restaurantRef(restaurantId)
    .collection(GO_OFFERS_SUBCOLLECTION)
    .doc(asText(offerId, 180));
  const settingsRef = (restaurantId) => restaurantRef(restaurantId)
    .collection(GO_SETTINGS_SUBCOLLECTION)
    .doc(GO_SETTINGS_DOC);
  const capacityRef = (restaurantId, key) => restaurantRef(restaurantId)
    .collection(GO_CAPACITY_SUBCOLLECTION)
    .doc(asText(key, 240));
  const bookingRef = (bookingId) => db.collection(GO_BOOKINGS_COLLECTION).doc(asText(bookingId, 180));
  const guestRef = (guestId) => db.collection(GO_GUEST_SESSIONS_COLLECTION).doc(asText(guestId, 180));

  const stamp = () => serverTimestamp || new Date(now()).toISOString();

  // Der Tages- und der Scheibenzaehler eines Ortes. Zwei Dokumente, damit
  // "hoechstens zwei Gruppen um 19 Uhr" und "hoechstens zwanzig Gruppen heute"
  // unabhaengig voneinander gezaehlt werden koennen (Punkt 77, 80).
  const slotDocId = (locationId, slotKey) => `slot__${asText(locationId, 60) || "main"}__${asText(slotKey, 160)}`;
  const dayDocId = (locationId, dayKey) => `day__${asText(locationId, 60) || "main"}__${asText(dayKey, 20)}`;

  function resolveTimeZone(restaurant, settings) {
    return asText(settings?.timeZone || restaurant?.timeZone, 60) || GO_DEFAULT_TIME_ZONE;
  }

  function buildBusinessView(restaurantId, data) {
    const source = data || {};
    return {
      id: asText(restaurantId, 180),
      name: asText(source.name || source.restaurantName, 120),
      city: asText(source.city, 120),
      address: asText(source.address, 240),
      logoUrl: asText(source.logoUrl || source.logo || source.avatarUrl, 500),
      openingHours: source.openingHours || source.openHours || source.hours || "",
      coords: source.coords || source.location || (Number.isFinite(Number(source.lat)) ? { lat: source.lat, lng: source.lng } : null),
      priceLevel: Number(source.priceLevel) || 0,
      timeZone: asText(source.timeZone, 60),
      active: source.active !== false && source.deleted !== true,
      goReliability: Number.isFinite(Number(source.goReliability)) ? Number(source.goReliability) : 1
    };
  }

  // -----------------------------------------------------------------------
  // Gastkennung
  // -----------------------------------------------------------------------

  // Ein Browser ohne Token bekommt einen. Ein Browser mit gueltigem Token
  // behaelt seinen. Ein Browser mit erfundenem Token bekommt einen neuen -
  // er ist damit ein neuer Gast, nicht ein abgewiesener.
  async function ensureGuestSession({ guestToken = "", uid = "" } = {}) {
    const parsed = parseGoGuestToken(guestToken);
    if (parsed.valid) {
      const snapshot = await guestRef(parsed.guestId).get();
      const data = docData(snapshot);
      if (data && tokens.secretMatchesHash(parsed.secret, data.secretHash)) {
        const updates = { lastSeenAt: stamp() };
        // Meldet sich ein Gast spaeter an, gehoert seine Sitzung ab jetzt zum
        // Konto - ohne dass eine zweite Buchung entsteht (Punkt 46).
        if (uid && asText(data.uid, 180) !== asText(uid, 180)) updates.uid = asText(uid, 180);
        await guestRef(parsed.guestId).set(updates, { merge: true });
        return {
          guestId: parsed.guestId,
          guestToken,
          created: false,
          stats: data.stats || {},
          uid: updates.uid || asText(data.uid, 180)
        };
      }
    }

    const guestId = tokens.createGuestId();
    const secret = tokens.createSecret();
    const token = buildGoGuestToken({ guestId, secret });
    if (!token) throw new GoServiceError("Guest session could not be created.", "internal");
    await guestRef(guestId).set({
      guestId,
      secretHash: tokens.hashSecret(secret),
      uid: asText(uid, 180),
      stats: {},
      createdAt: stamp(),
      lastSeenAt: stamp()
    });
    return { guestId, guestToken: token, created: true, stats: {}, uid: asText(uid, 180) };
  }

  async function requireGuest({ guestToken = "", uid = "" } = {}) {
    const session = await ensureGuestSession({ guestToken, uid });
    const trust = resolveGoGuestTrustLevel(session.stats, { nowMs: now() });
    return { ...session, trust };
  }

  // -----------------------------------------------------------------------
  // Suche
  // -----------------------------------------------------------------------

  function readOfferDocs(snapshot) {
    const offers = [];
    snapshot.forEach((doc) => {
      const data = docData(doc);
      if (!data) return;
      const restaurantId = asText(data.restaurantId, 180)
        || asText(doc.ref?.parent?.parent?.id, 180);
      offers.push(normalizeGoOffer({ ...data, id: doc.id, restaurantId }, doc.id));
    });
    return offers;
  }

  async function loadCandidateOffers(request) {
    const active = db.collectionGroup(GO_OFFERS_SUBCOLLECTION).where("status", "==", "active");
    if (!request.cityKey) return readOfferDocs(await active.limit(candidateLimit).get());

    // Die Stadt engt nur die Abfrage ein. Ob ein Lokal wirklich in dieser
    // Stadt steht, entscheidet weiter unten das Profil des Lokals.
    const narrowed = await active.where("cityKey", "==", request.cityKey).limit(candidateLimit).get();
    const offers = readOfferDocs(narrowed);
    if (offers.length) return offers;

    // Leer heisst hier nicht "nichts da". Ein Angebot, das gespeichert wurde,
    // bevor der Schluessel geschrieben wurde, hat das Feld gar nicht - und ein
    // fehlendes Feld faellt aus jeder Gleichheitsabfrage heraus. Es dann nicht
    // zu zeigen, waere die Antwort auf eine Frage, die niemand gestellt hat.
    // Also wird ohne die Einengung nachgefragt; aussortiert wird ohnehin erst
    // unten, am Profil des Lokals.
    return readOfferDocs(await active.limit(candidateLimit).get());
  }

  async function loadBusinessContexts(restaurantIds = []) {
    const ids = [...new Set(restaurantIds.filter(Boolean))];
    const contexts = new Map();
    await Promise.all(ids.map(async (id) => {
      const [restaurantSnapshot, settingsSnapshot] = await Promise.all([
        restaurantRef(id).get(),
        settingsRef(id).get()
      ]);
      const restaurantData = docData(restaurantSnapshot);
      if (!restaurantData) return;
      const settings = docData(settingsSnapshot) || {};
      contexts.set(id, {
        business: buildBusinessView(id, restaurantData),
        settings,
        entitlements: resolveGoEntitlements(restaurantData.goEntitlements),
        timeZone: resolveTimeZone(restaurantData, settings)
      });
    }));
    return contexts;
  }

  async function loadUsage({ restaurantId, locationId, slotKey, dayKey, offer }) {
    const [slotSnapshot, daySnapshot] = await Promise.all([
      capacityRef(restaurantId, slotDocId(locationId, slotKey)).get(),
      capacityRef(restaurantId, dayDocId(locationId, dayKey)).get()
    ]);
    const slot = docData(slotSnapshot) || {};
    const day = docData(daySnapshot) || {};
    return {
      slotGroups: Number(slot.groups) || 0,
      slotGuests: Number(slot.guests) || 0,
      dailyGroups: Number(day.groups) || 0,
      redeemed: Number(offer?.redeemedCount) || 0
    };
  }

  function buildMatchContext({ offer, context, request }) {
    const timeZone = context.timeZone;
    const slotKey = buildGoCapacitySlotKey({
      restaurantId: offer.restaurantId,
      locationId: offer.locationId,
      expectedArrivalAt: request.requestedAt,
      timeZone,
      slotMinutes: GO_CAPACITY_SLOT_MINUTES
    });
    const dayKey = buildGoDayKey({ expectedArrivalAt: request.requestedAt, timeZone });
    return { timeZone, slotKey, dayKey };
  }

  async function search({ request = {}, guestToken = "", uid = "" } = {}) {
    const nowMs = now();
    const normalizedRequest = normalizeGoSearchRequest(request, { nowMs });
    const offers = await loadCandidateOffers(normalizedRequest);
    if (!offers.length) return { request: normalizedRequest, results: [], total: 0 };

    const contexts = await loadBusinessContexts(offers.map((offer) => offer.restaurantId));

    // Kapazitaet wird nur fuer die Angebote gelesen, die ueberhaupt Kapazitaet
    // verbrauchen - ein Kaffee-Angebot braucht keinen Zaehler.
    const entries = await Promise.all(offers.map(async (offer) => {
      const context = contexts.get(offer.restaurantId);
      if (!context) return null;
      const { timeZone, slotKey, dayKey } = buildMatchContext({ offer, context, request: normalizedRequest });
      const needsCounters = offer.bookingType === GO_BOOKING_TYPE_RESERVATION
        || offer.limits.dailyGroups > 0
        || offer.limits.totalRedemptions > 0;
      const usage = needsCounters
        ? await loadUsage({
          restaurantId: offer.restaurantId,
          locationId: offer.locationId,
          slotKey,
          dayKey,
          offer
        })
        : { slotGroups: 0, slotGuests: 0, dailyGroups: 0, redeemed: 0 };
      const match = matchGoOffer({
        offer,
        business: { ...context.business, timeZone },
        settings: context.settings,
        usage,
        entitlements: context.entitlements,
        request: normalizedRequest,
        nowMs
      });
      return { offer, business: context.business, match };
    }));

    const ranked = rankGoMatches(entries.filter(Boolean), {
      request: normalizedRequest,
      limit: searchResultLimit
    });

    // Zaehlen, aber nie blockieren (Punkt 115).
    if (guestToken) {
      recordGuestActivity({ guestToken, uid, kind: "search" }).catch(() => {});
    }

    return {
      request: normalizedRequest,
      total: ranked.length,
      results: ranked.map((entry) => buildGoResultCard({
        match: entry.match,
        business: entry.business,
        request: normalizedRequest
      }))
    };
  }

  async function recordGuestActivity({ guestToken = "", uid = "", kind = "" } = {}) {
    const parsed = parseGoGuestToken(guestToken);
    if (!parsed.valid) return;
    const snapshot = await guestRef(parsed.guestId).get();
    const data = docData(snapshot);
    if (!data || !tokens.secretMatchesHash(parsed.secret, data.secretHash)) return;
    const stats = applyGoGuestActivity(data.stats || {}, { kind, nowMs: now() });
    await guestRef(parsed.guestId).set({ stats, lastSeenAt: stamp(), uid: asText(uid || data.uid, 180) }, { merge: true });
  }

  // -----------------------------------------------------------------------
  // Buchen
  // -----------------------------------------------------------------------

  async function createBooking({
    offerId = "",
    restaurantId = "",
    request = {},
    guestToken = "",
    uid = "",
    idempotencyKey = ""
  } = {}) {
    const nowMs = now();
    const normalizedRequest = normalizeGoSearchRequest(request, { nowMs });
    const guest = await requireGuest({ guestToken, uid });

    const allowed = goGuestActionAllowed(guest.trust.level, { isSignedIn: !!uid });
    if (!allowed.allowed) {
      throw new GoServiceError(allowed.message, "permission-denied", { requiresSignIn: true });
    }

    const fullIdempotencyKey = buildGoIdempotencyKey({
      guestId: guest.guestId,
      offerId,
      clientKey: idempotencyKey
    });

    const secret = tokens.createSecret();
    const bookingId = tokens.createBookingId();
    const shortCode = createGoShortCode(tokens.randomBytes);

    const outcome = await db.runTransaction(async (transaction) => {
      // --- Lesen. Firestore verlangt alle Lesevorgaenge vor dem ersten
      // Schreiben, deshalb steht hier alles beieinander.
      const existingByKey = await transaction.get(
        db.collection(GO_BOOKINGS_COLLECTION).where("idempotencyKey", "==", fullIdempotencyKey).limit(1)
      );
      if (!existingByKey.empty) {
        // Derselbe Schluessel, dieselbe Buchung. Ein Doppeltap im schwachen
        // Netz erzeugt keine zweite Reservierung (Punkt 99, 100).
        const doc = existingByKey.docs[0];
        return { reused: true, booking: normalizeGoBooking({ ...docData(doc), id: doc.id }, doc.id) };
      }

      const [offerSnapshot, restaurantSnapshot, settingsSnapshot] = await Promise.all([
        transaction.get(offerRef(restaurantId, offerId)),
        transaction.get(restaurantRef(restaurantId)),
        transaction.get(settingsRef(restaurantId))
      ]);
      const offerData = docData(offerSnapshot);
      const restaurantData = docData(restaurantSnapshot);
      if (!offerData || !restaurantData) {
        throw new GoServiceError("Kjo ofertë nuk është më aktive.", "not-found", { reason: "offer_missing" });
      }

      const offer = normalizeGoOffer({ ...offerData, id: offerId, restaurantId }, offerId);
      const settings = docData(settingsSnapshot) || {};
      const business = buildBusinessView(restaurantId, restaurantData);
      const timeZone = resolveTimeZone(restaurantData, settings);
      const slotKey = buildGoCapacitySlotKey({
        restaurantId,
        locationId: offer.locationId,
        expectedArrivalAt: normalizedRequest.requestedAt,
        timeZone
      });
      const dayKey = buildGoDayKey({ expectedArrivalAt: normalizedRequest.requestedAt, timeZone });

      const [slotSnapshot, daySnapshot, guestBookings] = await Promise.all([
        transaction.get(capacityRef(restaurantId, slotDocId(offer.locationId, slotKey))),
        transaction.get(capacityRef(restaurantId, dayDocId(offer.locationId, dayKey))),
        transaction.get(
          db.collection(GO_BOOKINGS_COLLECTION)
            .where("guestId", "==", guest.guestId)
            .where("status", "in", GO_OPEN_BOOKING_STATUSES)
            .limit(MAX_GUEST_OPEN_BOOKINGS)
        )
      ]);
      const slotData = docData(slotSnapshot) || {};
      const dayData = docData(daySnapshot) || {};

      // --- Pruefen. Dieselbe Domaene wie in der Suche, mit den Zahlen von
      // gerade eben - nicht mit denen von vor dreissig Sekunden (Punkt 27).
      const match = matchGoOffer({
        offer,
        business: { ...business, timeZone },
        settings,
        usage: {
          slotGroups: Number(slotData.groups) || 0,
          slotGuests: Number(slotData.guests) || 0,
          dailyGroups: Number(dayData.groups) || 0,
          redeemed: Number(offerData.redeemedCount) || 0
        },
        entitlements: resolveGoEntitlements(restaurantData.goEntitlements),
        request: normalizedRequest,
        nowMs
      });

      if (!match.ok) {
        const soldOut = match.reasons.some((reason) => GO_SOLD_OUT_REASONS.includes(reason));
        throw new GoServiceError(
          soldOut ? "Kjo ofertë sapo u plotësua." : "Kjo ofertë nuk vlen për këtë kërkesë.",
          soldOut ? "resource-exhausted" : "failed-precondition",
          { reasons: match.reasons, soldOut }
        );
      }

      const openBookings = guestBookings.docs.map((doc) => normalizeGoBooking({ ...docData(doc), id: doc.id }, doc.id));
      const conflict = findConflictingGoReservation({
        bookings: openBookings,
        bookingType: offer.bookingType,
        expectedArrivalAt: normalizedRequest.requestedAt,
        offerId,
        restaurantId
      });
      if (conflict.conflict) {
        if (conflict.reason === "duplicate") {
          // Dieselbe Oferta im selben Lokal: das ist kein Fehler, das ist
          // derselbe Wunsch zweimal.
          return { reused: true, booking: conflict.conflict };
        }
        throw new GoServiceError(
          "Ke tashmë një tavolinë të rezervuar për këtë orë.",
          "already-exists",
          { reason: conflict.reason, bookingShortCode: conflict.conflict.shortCode }
        );
      }

      // --- Schreiben.
      const snapshot = buildGoBookingSnapshot({
        offer,
        business,
        request: normalizedRequest,
        nowMs
      });
      const record = buildGoBookingRecord({
        bookingId,
        snapshot,
        request: normalizedRequest,
        guest: { guestId: guest.guestId, uid },
        tokenHash: tokens.hashSecret(secret),
        shortCode,
        idempotencyKey: fullIdempotencyKey,
        timeZone,
        nowMs,
        serverTimestamp
      });

      transaction.set(bookingRef(bookingId), record);

      const weight = goCapacityWeight(record);
      if (weight.groups > 0) {
        transaction.set(
          capacityRef(restaurantId, slotDocId(offer.locationId, slotKey)),
          {
            restaurantId,
            locationId: offer.locationId,
            slotKey,
            dayKey,
            groups: (Number(slotData.groups) || 0) + weight.groups,
            guests: (Number(slotData.guests) || 0) + weight.guests,
            updatedAt: stamp()
          },
          { merge: true }
        );
      }
      // Der Tageszaehler zaehlt jede GO-Buchung, auch die ohne Tisch: "hoechstens
      // zwanzig GO-Gruppen pro Tag" meint alle (Punkt 80).
      transaction.set(
        capacityRef(restaurantId, dayDocId(offer.locationId, dayKey)),
        {
          restaurantId,
          locationId: offer.locationId,
          dayKey,
          groups: (Number(dayData.groups) || 0) + 1,
          guests: (Number(dayData.guests) || 0) + record.partySize,
          updatedAt: stamp()
        },
        { merge: true }
      );
      transaction.set(
        offerRef(restaurantId, offerId),
        { redeemedCount: (Number(offerData.redeemedCount) || 0) + 1, lastBookingAt: stamp() },
        { merge: true }
      );

      return { reused: false, booking: normalizeGoBooking(record, bookingId), record };
    });

    if (outcome.reused) {
      // Beim Wiederverwenden gibt es kein Geheimnis mehr zurueckzugeben - der
      // Browser hat es aus dem ersten Versuch. Er fragt die Buchung mit seinem
      // Token nach (Punkt 100).
      return { booking: outcome.booking, bookingToken: "", reused: true, guestToken: guest.guestToken };
    }

    recordGuestActivity({
      guestToken: guest.guestToken,
      uid,
      kind: outcome.booking.type === GO_BOOKING_TYPE_RESERVATION ? "reservation" : "booking"
    }).catch(() => {});

    return {
      booking: outcome.booking,
      bookingToken: buildGoBookingToken({ bookingId, secret }),
      reused: false,
      guestToken: guest.guestToken
    };
  }

  // -----------------------------------------------------------------------
  // Lesen, absagen, einchecken
  // -----------------------------------------------------------------------

  async function loadBookingByToken(bookingToken) {
    const parsed = parseGoBookingToken(bookingToken);
    if (!parsed.valid) throw new GoServiceError("Rezervimi nuk u gjet.", "not-found");
    const snapshot = await bookingRef(parsed.bookingId).get();
    const data = docData(snapshot);
    if (!data || !tokens.secretMatchesHash(parsed.secret, data.tokenHash)) {
      throw new GoServiceError("Rezervimi nuk u gjet.", "not-found");
    }
    return { id: parsed.bookingId, data, booking: normalizeGoBooking({ ...data, id: parsed.bookingId }, parsed.bookingId) };
  }

  // Beim Lesen wird nachgetragen, was die Zeit inzwischen entschieden hat -
  // aber erst nach dem Ende des Betriebstages, nie wegen Verspaetung
  // (Punkt 74).
  async function getBooking({ bookingToken = "" } = {}) {
    const loaded = await loadBookingByToken(bookingToken);
    const closure = await resolveClosure(loaded.booking);
    if (!closure.shouldClose) return { booking: loaded.booking };
    await bookingRef(loaded.id).set(
      { status: closure.nextStatus, closedAt: stamp(), updatedAt: stamp() },
      { merge: true }
    );
    return { booking: { ...loaded.booking, status: closure.nextStatus } };
  }

  async function resolveClosure(booking) {
    const restaurantSnapshot = await restaurantRef(booking.restaurantId).get();
    const restaurantData = docData(restaurantSnapshot) || {};
    const arrivalWeekday = resolveGoLocalTime(booking.expectedArrivalMs || now(), booking.timeZone).weekday;
    const opening = readGoOpeningWindows(restaurantData, arrivalWeekday);
    return resolveGoBookingClosure(booking, {
      nowMs: now(),
      openingWindows: opening.hasData ? opening.windows : [],
      timeZone: booking.timeZone
    });
  }

  async function cancelBookingByGuest({ bookingToken = "", guestToken = "" } = {}) {
    const loaded = await loadBookingByToken(bookingToken);
    const parsedGuest = parseGoGuestToken(guestToken);
    // Der lange Token ist der Beweis. Die Gastkennung wird zusaetzlich
    // geprueft, wenn sie mitkommt - passt sie nicht, ist es eine fremde
    // Buchung in einem geteilten Browser.
    if (parsedGuest.valid && loaded.booking.guestId && parsedGuest.guestId !== loaded.booking.guestId) {
      throw new GoServiceError("Rezervimi nuk u gjet.", "not-found");
    }
    return applyStatus({
      bookingId: loaded.id,
      booking: loaded.booking,
      nextStatus: GO_BOOKING_STATUS.cancelledByUser,
      extra: { cancelReason: "user" }
    });
  }

  async function applyStatus({ bookingId, booking, nextStatus, extra = {} }) {
    if (!canTransitionGoBooking(booking.status, nextStatus)) {
      throw new GoServiceError("Ky veprim nuk është i mundur për këtë rezervim.", "failed-precondition", {
        from: booking.status,
        to: nextStatus
      });
    }

    await db.runTransaction(async (transaction) => {
      const snapshot = await transaction.get(bookingRef(bookingId));
      const data = docData(snapshot);
      if (!data) throw new GoServiceError("Rezervimi nuk u gjet.", "not-found");
      const current = normalizeGoBooking({ ...data, id: bookingId }, bookingId);
      if (!canTransitionGoBooking(current.status, nextStatus)) {
        // Zwei Mitarbeiter scannen denselben Code: der zweite bekommt eine
        // ruhige Auskunft, keine zweite Buchung (Punkt 91, 123).
        throw new GoServiceError("Ky veprim nuk është i mundur për këtë rezervim.", "failed-precondition", {
          from: current.status,
          to: nextStatus,
          alreadyApplied: current.status === nextStatus
        });
      }

      const updates = { status: nextStatus, updatedAt: stamp(), ...extra };
      if (nextStatus === GO_BOOKING_STATUS.checkedIn) updates.checkedInAt = stamp();
      if (nextStatus === GO_BOOKING_STATUS.completed) updates.completedAt = stamp();
      if (
        nextStatus === GO_BOOKING_STATUS.cancelledByUser
        || nextStatus === GO_BOOKING_STATUS.cancelledByBusiness
      ) {
        updates.cancelledAt = stamp();
      }
      transaction.set(bookingRef(bookingId), updates, { merge: true });

      // Eine abgesagte Reservierung gibt ihren Platz sofort zurueck
      // (Punkt 96).
      const releasesCapacity = nextStatus === GO_BOOKING_STATUS.cancelledByUser
        || nextStatus === GO_BOOKING_STATUS.cancelledByBusiness;
      if (releasesCapacity) {
        const weight = goCapacityWeight(current);
        if (weight.groups > 0) {
          const slotDoc = capacityRef(current.restaurantId, slotDocId(current.locationId, current.slotKey));
          const slotSnapshot = await transaction.get(slotDoc);
          const slotData = docData(slotSnapshot) || {};
          transaction.set(slotDoc, {
            groups: Math.max(0, (Number(slotData.groups) || 0) - weight.groups),
            guests: Math.max(0, (Number(slotData.guests) || 0) - weight.guests),
            updatedAt: stamp()
          }, { merge: true });
        }
        const dayDoc = capacityRef(current.restaurantId, dayDocId(current.locationId, current.dayKey));
        const daySnapshot = await transaction.get(dayDoc);
        const dayData = docData(daySnapshot) || {};
        transaction.set(dayDoc, {
          groups: Math.max(0, (Number(dayData.groups) || 0) - 1),
          guests: Math.max(0, (Number(dayData.guests) || 0) - current.partySize),
          updatedAt: stamp()
        }, { merge: true });
      }
    });

    if (nextStatus === GO_BOOKING_STATUS.cancelledByUser && booking.guestId) {
      guestRef(booking.guestId).get()
        .then((snapshot) => {
          const data = docData(snapshot);
          if (!data) return null;
          return guestRef(booking.guestId).set({
            stats: applyGoGuestActivity(data.stats || {}, { kind: "cancel", nowMs: now() })
          }, { merge: true });
        })
        .catch(() => {});
    }

    return { booking: { ...booking, status: nextStatus } };
  }

  /**
   * Check-in.
   *
   * Weder zu frueh noch zu spaet ist ein Grund, jemanden abzuweisen
   * (Punkt 72, 73). Geprueft wird nur: Gibt es diese Buchung, gehoert sie zu
   * diesem Lokal, und ist sie noch offen.
   */
  async function checkIn({ bookingToken = "", shortCode = "", restaurantId = "" } = {}) {
    let loaded = null;
    if (bookingToken) {
      loaded = await loadBookingByToken(bookingToken);
    } else if (shortCode && restaurantId) {
      const snapshot = await db.collection(GO_BOOKINGS_COLLECTION)
        .where("restaurantId", "==", asText(restaurantId, 180))
        .where("shortCode", "==", asText(shortCode, 12).toUpperCase())
        .where("status", "in", GO_OPEN_BOOKING_STATUSES)
        .limit(1)
        .get();
      if (snapshot.empty) throw new GoServiceError("Rezervimi nuk u gjet.", "not-found");
      const doc = snapshot.docs[0];
      loaded = { id: doc.id, data: docData(doc), booking: normalizeGoBooking({ ...docData(doc), id: doc.id }, doc.id) };
    } else {
      throw new GoServiceError("Rezervimi nuk u gjet.", "not-found");
    }

    if (restaurantId && loaded.booking.restaurantId !== asText(restaurantId, 180)) {
      throw new GoServiceError("Ky rezervim është për një lokal tjetër.", "failed-precondition");
    }
    if (loaded.booking.status === GO_BOOKING_STATUS.checkedIn) {
      return { booking: loaded.booking, alreadyCheckedIn: true };
    }
    const result = await applyStatus({
      bookingId: loaded.id,
      booking: loaded.booking,
      nextStatus: GO_BOOKING_STATUS.checkedIn
    });
    return { ...result, alreadyCheckedIn: false };
  }

  // -----------------------------------------------------------------------
  // Business
  // -----------------------------------------------------------------------

  async function businessUpdateBooking({ bookingId = "", restaurantId = "", action = "", reason = "" } = {}) {
    const snapshot = await bookingRef(bookingId).get();
    const data = docData(snapshot);
    if (!data) throw new GoServiceError("Rezervimi nuk u gjet.", "not-found");
    const booking = normalizeGoBooking({ ...data, id: bookingId }, bookingId);
    if (booking.restaurantId !== asText(restaurantId, 180)) {
      throw new GoServiceError("Nuk keni qasje në këtë rezervim.", "permission-denied");
    }

    if (action === "seen") {
      await bookingRef(bookingId).set({ businessSeenAt: stamp(), updatedAt: stamp() }, { merge: true });
      return { booking: { ...booking, businessSeenAt: stamp() } };
    }

    const statusByAction = {
      cancel: GO_BOOKING_STATUS.cancelledByBusiness,
      complete: GO_BOOKING_STATUS.completed,
      notArrived: GO_BOOKING_STATUS.notArrived,
      checkin: GO_BOOKING_STATUS.checkedIn
    };
    const nextStatus = statusByAction[asText(action, 40)];
    if (!nextStatus) throw new GoServiceError("Veprim i panjohur.", "invalid-argument");
    if (nextStatus === GO_BOOKING_STATUS.cancelledByBusiness && !asText(reason, 200)) {
      // Ein Storno des Lokals braucht einen Grund - er zaehlt intern mit
      // (Punkt 97).
      throw new GoServiceError("Zgjidh një arsye.", "invalid-argument");
    }
    return applyStatus({
      bookingId,
      booking,
      nextStatus,
      extra: nextStatus === GO_BOOKING_STATUS.cancelledByBusiness
        ? { cancelReason: asText(reason, 200) }
        : {}
    });
  }

  // Die Alternativen, die einem Gast sofort angeboten werden, wenn sein
  // Wunsch gerade voll wurde (Punkt 28, 98, 118).
  async function findAlternatives({ request = {}, excludeRestaurantId = "", limit = 3 } = {}) {
    const found = await search({ request });
    return found.results
      .filter((entry) => entry.restaurantId !== asText(excludeRestaurantId, 180))
      .slice(0, Math.max(1, Math.trunc(Number(limit) || 3)));
  }

  return {
    ensureGuestSession,
    search,
    createBooking,
    getBooking,
    cancelBookingByGuest,
    checkIn,
    businessUpdateBooking,
    findAlternatives,
    recordGuestActivity,
    GoServiceError
  };
}

module.exports = {
  createGoService,
  GoServiceError,
  GO_BOOKINGS_COLLECTION,
  GO_GUEST_SESSIONS_COLLECTION,
  GO_OFFERS_SUBCOLLECTION,
  GO_SETTINGS_SUBCOLLECTION,
  GO_CAPACITY_SUBCOLLECTION,
  GO_MATCH_REASONS,
  toGoMillis
};
