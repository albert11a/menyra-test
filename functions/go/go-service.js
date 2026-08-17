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
  GO_PARTY_SIZE_MAX,
  GO_PARTY_SIZE_MIN,
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
  GO_COMMISSION_VERSION,
  resolveGoCommission
} = require("./generated/go-commission-core.cjs");
const {
  GO_BOOKING_STATUS,
  GO_COMMISSION_STATUS,
  GO_OPEN_BOOKING_STATUSES,
  buildGoBookingCodeRecord,
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
// Was das Lokal von seinen Angeboten sieht: pro Tag ein Dokument, zwei Zahlen.
// Sie stehen hier und nicht im Angebot, weil sie zum Tag gehoeren und nicht
// zum Angebot - ein Lokal will wissen, was HEUTE passiert ist, auch wenn es
// die Oferta seitdem geaendert hat.
const GO_STATS_SUBCOLLECTION = "goStats";
const GO_BOOKINGS_COLLECTION = "goBookings";
// Die Kurzcodes, getrennt von den Buchungen. Kein Browser liest diese Sammlung
// - weder das Lokal noch der Gast. Das Lokal prueft einen Code, indem es ihn
// eintippt; nachschlagen kann es ihn nicht (siehe buildGoBookingCodeRecord).
const GO_BOOKING_CODES_COLLECTION = "goBookingCodes";
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
  // Das atomare Hochzaehlen von Firestore. Es wird hereingereicht wie die
  // Serverzeit, damit dieser Dienst ohne Firebase testbar bleibt.
  //
  // Ohne diese Abhaengigkeit faellt der Zaehler auf Lesen-Rechnen-Schreiben
  // zurueck. Das ist in einem Test richtig und in der Cloud nur fast: Zwei
  // Suchen in derselben Millisekunde koennen sich dort gegenseitig
  // ueberschreiben. Eine verlorene Zaehlung ist der Preis dafuer, dass der
  // Dienst ohne Firebase laeuft - eine verlorene BUCHUNG waere es nicht, und
  // die entsteht deshalb weiter in einer Transaktion.
  increment = null,
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
  const statsRef = (restaurantId, dayKey) => restaurantRef(restaurantId)
    .collection(GO_STATS_SUBCOLLECTION)
    .doc(asText(dayKey, 20));
  const bookingRef = (bookingId) => db.collection(GO_BOOKINGS_COLLECTION).doc(asText(bookingId, 180));
  const bookingCodeRef = (bookingId) => db.collection(GO_BOOKING_CODES_COLLECTION).doc(asText(bookingId, 180));
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

    // Zuerst ohne jede Einengung. `cityKey` ist ein Hinweis und keine Wahrheit:
    // Er wird beim Speichern nur mitgeschrieben, wenn das Profil zu diesem
    // Zeitpunkt eine Stadt trug. Angebote, die vorher gespeichert wurden, deren
    // Lokal die Stadt spaeter eingetragen oder seitdem geaendert hat, haben das
    // Feld gar nicht - und ein fehlendes Feld faellt aus jeder
    // Gleichheitsabfrage heraus.
    //
    // Frueher lief diese Abfrage nur, wenn die eingeengte NICHTS fand. Damit
    // genuegte ein einziges Angebot MIT cityKey in der gesuchten Stadt, um alle
    // Angebote OHNE cityKey unsichtbar zu machen - auch die aus demselben Ort,
    // desselben Lokals. Das war der Grund, aus dem Ofertat nicht erschienen,
    // die erscheinen mussten.
    const offers = readOfferDocs(await active.limit(candidateLimit).get());

    // Unter der Obergrenze steht hier bereits jedes aktive Angebot - eine
    // zweite Abfrage koennte nichts mehr hinzufuegen. Erst wenn die Abfrage an
    // ihre Grenze stoesst, ist die Auswahl nach Dokumentpfad geschnitten, und
    // dann muessen die Angebote der gefragten Stadt eigens geholt werden,
    // damit sie nicht hinter dem Schnitt liegen bleiben.
    if (!request.cityKey || offers.length < candidateLimit) return offers;

    const narrowed = readOfferDocs(
      await active.where("cityKey", "==", request.cityKey).limit(candidateLimit).get()
    );
    const seen = new Set(offers.map((offer) => `${offer.restaurantId}/${offer.id}`));
    narrowed.forEach((offer) => {
      const key = `${offer.restaurantId}/${offer.id}`;
      if (seen.has(key)) return;
      seen.add(key);
      offers.push(offer);
    });
    return offers;
  }

  // Viele Dokumente, ein Weg zur Datenbank.
  //
  // Das Admin-SDK kann genau das (getAll). Ohne diesen Sammelaufruf kostete
  // eine Suche ueber vierzig Lokale achtzig einzelne Wege - parallel zwar, aber
  // jeder mit seiner eigenen Latenz, und in einer Cloud-Funktion, die selbst
  // schon ueber den Atlantik antwortet, summiert sich das.
  //
  // Der Ersatzweg bleibt stehen: Dieser Dienst soll ohne Firebase testbar
  // sein, und eine Attrappe muss getAll nicht koennen.
  async function readDocs(refs = []) {
    const list = refs.filter(Boolean);
    if (!list.length) return [];
    if (typeof db.getAll === "function") return db.getAll(...list);
    return Promise.all(list.map((ref) => ref.get()));
  }

  async function loadBusinessContexts(restaurantIds = []) {
    const ids = [...new Set(restaurantIds.filter(Boolean))];
    const contexts = new Map();
    if (!ids.length) return contexts;

    // Profil und GO-Einstellung je Lokal, alle in einem Zug. Die Reihenfolge
    // der Antwort entspricht der Reihenfolge der Anfrage - darauf ruht die
    // Zuordnung unten.
    const refs = [];
    ids.forEach((id) => {
      refs.push(restaurantRef(id));
      refs.push(settingsRef(id));
    });
    const snapshots = await readDocs(refs);

    ids.forEach((id, index) => {
      const restaurantData = docData(snapshots[index * 2]);
      if (!restaurantData) return;
      const settings = docData(snapshots[index * 2 + 1]) || {};
      contexts.set(id, {
        business: buildBusinessView(id, restaurantData),
        settings,
        entitlements: resolveGoEntitlements(restaurantData.goEntitlements),
        timeZone: resolveTimeZone(restaurantData, settings)
      });
    });
    return contexts;
  }

  // Die Belegung eines Ortes - die Scheibe und der Tag getrennt, und beide nur
  // dann, wenn ein Angebot ueberhaupt eine Grenze darauf gesetzt hat.
  //
  // Getrennt, weil ein Angebot fast nie beide braucht: Ein Tisch-Angebot
  // interessiert die Scheibe ("zwei Gruppen um 19 Uhr"), eine Tagesgrenze
  // interessiert den Tag. Zusammen gelesen kostete jedes Angebot zwei
  // Dokumente, von denen eines niemanden interessiert.
  //
  // Der Zaehler `redeemed` steht am Angebot selbst und kostet gar nichts - er
  // wird deshalb nicht hier, sondern beim Aufrufer angehaengt.
  // Welche Zaehler ein Angebot ueberhaupt braucht.
  //
  // Die Scheibe zaehlt nur fuer Tischreservierungen, der Tag nur bei einer
  // Tagesgrenze. Der Einloesezaehler steht am Angebot selbst und kostet gar
  // nichts - er ist deshalb kein Grund, irgendein Dokument zu lesen.
  function resolveCapacityNeeds(offer = {}) {
    const limits = offer.limits || {};
    const isReservation = offer.bookingType === GO_BOOKING_TYPE_RESERVATION;
    return {
      needsSlot: isReservation && (limits.slotGroups > 0 || limits.slotGuests > 0),
      needsDay: limits.dailyGroups > 0
    };
  }

  /**
   * Die Belegung aller gefragten Orte - in einem Zug.
   *
   * Zwei Angebote desselben Lokals in derselben Scheibe lesen dasselbe
   * Dokument; hier wird es einmal geholt. Und alles zusammen geht als ein
   * Sammelaufruf hinaus statt als ein Weg je Angebot.
   */
  async function loadCapacityMap(entries = []) {
    const wanted = new Map();
    entries.forEach((entry) => {
      const { needsSlot, needsDay } = resolveCapacityNeeds(entry.offer);
      const restaurantId = entry.offer.restaurantId;
      const locationId = entry.offer.locationId;
      if (needsSlot) {
        const id = slotDocId(locationId, entry.slotKey);
        wanted.set(`${restaurantId}/${id}`, { restaurantId, docId: id });
      }
      if (needsDay) {
        const id = dayDocId(locationId, entry.dayKey);
        wanted.set(`${restaurantId}/${id}`, { restaurantId, docId: id });
      }
    });

    const keys = [...wanted.keys()];
    const snapshots = await readDocs(keys.map((key) => {
      const target = wanted.get(key);
      return capacityRef(target.restaurantId, target.docId);
    }));

    const byKey = new Map();
    keys.forEach((key, index) => byKey.set(key, docData(snapshots[index]) || {}));
    return byKey;
  }

  function readCapacityFor(entry, capacityByKey) {
    const { needsSlot, needsDay } = resolveCapacityNeeds(entry.offer);
    const restaurantId = entry.offer.restaurantId;
    const locationId = entry.offer.locationId;
    const slot = needsSlot
      ? (capacityByKey.get(`${restaurantId}/${slotDocId(locationId, entry.slotKey)}`) || {})
      : {};
    const day = needsDay
      ? (capacityByKey.get(`${restaurantId}/${dayDocId(locationId, entry.dayKey)}`) || {})
      : {};
    return {
      slotGroups: Number(slot.groups) || 0,
      slotGuests: Number(slot.guests) || 0,
      dailyGroups: Number(day.groups) || 0
    };
  }

  // Den Kurzcode einer Buchung nachschlagen. Nur der Server kommt hier hin.
  async function readShortCode(bookingId = "") {
    const data = docData(await bookingCodeRef(bookingId).get());
    return asText(data?.shortCode, 12).toUpperCase();
  }

  // Dem Gast gehoert sein Code - er hat den Token, der die Buchung oeffnet.
  // Deshalb wird er hier wieder angehaengt, nachdem er aus dem gespeicherten
  // Dokument verschwunden ist.
  async function withShortCode(booking = {}) {
    if (!booking || !booking.id) return booking;
    return { ...booking, shortCode: await readShortCode(booking.id) };
  }

  // Eine Zahl des Tages hochzaehlen. Beilaeufig: Faellt sie aus, faellt nur
  // die Zahl aus - nie die Suche und nie eine Buchung (Punkt 115).
  async function bumpGoStat({ restaurantId = "", dayKey = "", field = "", by = 1 } = {}) {
    const id = asText(restaurantId, 180);
    const day = asText(dayKey, 20);
    const amount = Math.trunc(Number(by) || 0);
    if (!id || !day || !field || amount <= 0) return;
    const ref = statsRef(id, day);
    if (typeof increment === "function") {
      await ref.set({ restaurantId: id, dayKey: day, [field]: increment(amount), updatedAt: stamp() }, { merge: true });
      return;
    }
    const current = docData(await ref.get()) || {};
    await ref.set(
      { restaurantId: id, dayKey: day, [field]: (Number(current[field]) || 0) + amount, updatedAt: stamp() },
      { merge: true }
    );
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

    // Die Pruefung laeuft in zwei Zuegen, und der Grund ist eine Eigenschaft
    // der Domaene: Belegung kann eine Ablehnung nur HINZUFUEGEN, nie eine
    // aufheben. Ein Angebot, das schon mit leeren Zaehlern durchfaellt - falsche
    // Stadt, falsche Gruppengroesse, Lokal geschlossen -, faellt mit den echten
    // Zaehlern erst recht durch.
    //
    // Also erst die guenstige Pruefung ohne ein einziges zusaetzliches
    // Dokument, und die Kapazitaet danach nur noch fuer die wenigen Angebote,
    // die es bis dahin geschafft haben. Vorher las die Suche die Zaehler fuer
    // jeden Kandidaten - auch fuer die, die schon an der Stadt scheiterten.
    const NO_USAGE = Object.freeze({ slotGroups: 0, slotGuests: 0, dailyGroups: 0, redeemed: 0 });
    const survivors = offers.map((offer) => {
      const context = contexts.get(offer.restaurantId);
      if (!context) return null;
      const { timeZone, slotKey, dayKey } = buildMatchContext({ offer, context, request: normalizedRequest });
      const business = { ...context.business, timeZone };
      const match = matchGoOffer({
        offer,
        business,
        settings: context.settings,
        usage: NO_USAGE,
        entitlements: context.entitlements,
        request: normalizedRequest,
        nowMs
      });
      if (!match.ok) return null;
      return { offer, business, context, slotKey, dayKey, match };
    }).filter(Boolean);

    const capacityByKey = await loadCapacityMap(survivors);
    const entries = survivors.map((entry) => {
      const { offer, context } = entry;
      const limits = offer.limits || {};
      const { needsSlot, needsDay } = resolveCapacityNeeds(offer);
      // Kennt das Angebot ueberhaupt keine Grenze, steht das Ergebnis des
      // ersten Zuges bereits fest - eine zweite Pruefung koennte nichts
      // aendern.
      if (!needsSlot && !needsDay && !(limits.totalRedemptions > 0)) {
        return { offer, business: context.business, match: entry.match };
      }
      const match = matchGoOffer({
        offer,
        business: entry.business,
        settings: context.settings,
        usage: {
          ...readCapacityFor(entry, capacityByKey),
          redeemed: Number(offer.redeemedCount) || 0
        },
        entitlements: context.entitlements,
        request: normalizedRequest,
        nowMs
      });
      return { offer, business: context.business, match };
    });

    const ranked = rankGoMatches(entries.filter(Boolean), {
      request: normalizedRequest,
      limit: searchResultLimit
    });

    // Zaehlen, aber nie blockieren (Punkt 115).
    if (guestToken) {
      recordGuestActivity({ guestToken, uid, kind: "search" }).catch(() => {});
    }

    // Was das Lokal heute vorgezeigt bekommen hat. Gezaehlt wird jede Karte,
    // die wirklich in der Antwort steht - nicht jedes Angebot, das die Abfrage
    // hergab. Ein Angebot, das die Pruefung nicht bestanden hat, hat niemand
    // gesehen, und ein Lokal, das nicht in den Ergebnissen stand, auch nicht.
    //
    // Der Tag ist der des Lokals, nicht der des Servers: Ein Lokal soll seinen
    // Betriebstag sehen und nicht den von Greenwich.
    const shownPerRestaurant = new Map();
    ranked.forEach((entry) => {
      const id = asText(entry.offer?.restaurantId || entry.business?.id, 180);
      if (!id) return;
      shownPerRestaurant.set(id, (shownPerRestaurant.get(id) || 0) + 1);
    });
    shownPerRestaurant.forEach((count, id) => {
      const timeZone = contexts.get(id)?.timeZone || GO_DEFAULT_TIME_ZONE;
      bumpGoStat({
        restaurantId: id,
        dayKey: buildGoDayKey({ expectedArrivalAt: nowMs, timeZone }),
        field: "impressions",
        by: count
      }).catch(() => {});
    });

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
        idempotencyKey: fullIdempotencyKey,
        // Die Preisliste wird hier eingefroren, gerechnet wird erst beim
        // Bestaetigen. So weiss das Lokal von Anfang an, nach welcher Liste
        // dieser Gast abgerechnet wird - und eine spaetere Aenderung
        // schreibt nichts um.
        commissionVersion: GO_COMMISSION_VERSION,
        timeZone,
        nowMs,
        serverTimestamp
      });

      transaction.set(bookingRef(bookingId), record);
      // Der Code geht in dasselbe Alles-oder-nichts wie die Buchung: Eine
      // Buchung ohne Code waere nicht einloesbar, ein Code ohne Buchung
      // zeigte ins Leere.
      transaction.set(bookingCodeRef(bookingId), buildGoBookingCodeRecord({
        bookingId,
        restaurantId,
        shortCode,
        nowMs,
        serverTimestamp
      }));

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

      return {
        reused: false,
        // Der Code steht nicht mehr im gespeicherten Dokument - hier ist er
        // aber bekannt, und der Gast bekommt ihn nur dieses eine Mal frisch.
        booking: { ...normalizeGoBooking(record, bookingId), shortCode },
        record
      };
    });

    if (outcome.reused) {
      // Beim Wiederverwenden gibt es kein Geheimnis mehr zurueckzugeben - der
      // Browser hat es aus dem ersten Versuch. Er fragt die Buchung mit seinem
      // Token nach (Punkt 100).
      //
      // Den Kurzcode bekommt er trotzdem: Er gehoert zu der Buchung, die es
      // schon gibt, und ohne ihn stuende der Gast im Lokal ohne etwas zu
      // zeigen.
      return {
        booking: await withShortCode(outcome.booking),
        bookingToken: "",
        reused: true,
        guestToken: guest.guestToken
      };
    }

    recordGuestActivity({
      guestToken: guest.guestToken,
      uid,
      kind: outcome.booking.type === GO_BOOKING_TYPE_RESERVATION ? "reservation" : "booking"
    }).catch(() => {});

    // Angenommen heisst angenommen: gezaehlt wird der Tag, an dem der Gast
    // zugegriffen hat, nicht der Tag, an dem er kommen will. Ein Gast, der
    // heute fuer Samstag bucht, hat heute angenommen.
    //
    // Nur bei einer neuen Buchung. Ein Doppeltap im schwachen Netz gibt
    // dieselbe Buchung zurueck (reused) - er waere sonst eine zweite Annahme,
    // die nie stattgefunden hat.
    bumpGoStat({
      restaurantId,
      dayKey: buildGoDayKey({
        expectedArrivalAt: nowMs,
        timeZone: asText(outcome.record?.timeZone, 60) || GO_DEFAULT_TIME_ZONE
      }),
      field: "accepted",
      by: 1
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
    // Wer den Token hat, ist der Gast - er bekommt seinen Code zu sehen. Das
    // ist der einzige Weg, auf dem der Code das Haus verlaesst, und der Grund,
    // warum ein Gast im Inkognito-Fenster seinen Link braucht.
    const booking = await withShortCode(loaded.booking);
    const closure = await resolveClosure(booking);
    if (!closure.shouldClose) return { booking };
    await bookingRef(loaded.id).set(
      { status: closure.nextStatus, closedAt: stamp(), updatedAt: stamp() },
      { merge: true }
    );
    return { booking: { ...booking, status: closure.nextStatus } };
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

      // Eine abgesagte Reservierung gibt ihren Platz sofort zurueck
      // (Punkt 96).
      const releasesCapacity = nextStatus === GO_BOOKING_STATUS.cancelledByUser
        || nextStatus === GO_BOOKING_STATUS.cancelledByBusiness;

      // ERST LESEN, DANN SCHREIBEN - alles, ausnahmslos.
      //
      // Firestore laesst in einer Transaktion keinen Lesevorgang nach dem
      // ersten Schreibvorgang zu. Genau daran ist das Absagen frueher
      // gescheitert: Der Statuswechsel wurde geschrieben, und die Zaehler
      // wollten DANACH gelesen werden. Die Transaktion brach ab, der Gast sah
      // "Mnyra GO është përkohësisht i padisponueshëm", und seine Buchung
      // stand unveraendert da.
      //
      // Deshalb stehen die Zaehler hier oben, noch vor dem ersten set().
      const weight = releasesCapacity ? goCapacityWeight(current) : { groups: 0, guests: 0 };
      const slotDoc = releasesCapacity && weight.groups > 0
        ? capacityRef(current.restaurantId, slotDocId(current.locationId, current.slotKey))
        : null;
      const dayDoc = releasesCapacity
        ? capacityRef(current.restaurantId, dayDocId(current.locationId, current.dayKey))
        : null;
      const slotData = slotDoc ? (docData(await transaction.get(slotDoc)) || {}) : {};
      const dayData = dayDoc ? (docData(await transaction.get(dayDoc)) || {}) : {};

      // --- Ab hier wird nur noch geschrieben.
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

      if (slotDoc) {
        transaction.set(slotDoc, {
          groups: Math.max(0, (Number(slotData.groups) || 0) - weight.groups),
          guests: Math.max(0, (Number(slotData.guests) || 0) - weight.guests),
          updatedAt: stamp()
        }, { merge: true });
      }
      if (dayDoc) {
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
  /**
   * Eine offene Buchung ueber ihren Kurzcode finden.
   *
   * Der Weg fuehrt zuerst durch die Sammlung, die das Lokal nicht lesen kann.
   * Es kommt hier also nur durch, wenn es den Code kennt - und den kennt es
   * nur vom Gast, der davorsteht.
   *
   * Das Lokal steht mit im Schluessel: Ein Code aus einem anderen Lokal findet
   * hier nichts. Er ist keine Kennung ueber Lokale hinweg.
   */
  async function loadOpenBookingByShortCode({ shortCode = "", restaurantId = "" } = {}) {
    const codeSnapshot = await db.collection(GO_BOOKING_CODES_COLLECTION)
      .where("restaurantId", "==", asText(restaurantId, 180))
      .where("shortCode", "==", asText(shortCode, 12).toUpperCase())
      .limit(1)
      .get();
    if (codeSnapshot.empty) throw new GoServiceError("Rezervimi nuk u gjet.", "not-found");
    const bookingId = asText(docData(codeSnapshot.docs[0])?.bookingId, 180);
    const doc = await bookingRef(bookingId).get();
    const data = docData(doc);
    if (!data) throw new GoServiceError("Rezervimi nuk u gjet.", "not-found");
    const booking = normalizeGoBooking({ ...data, id: bookingId }, bookingId);
    // Ein bereits geschlossener Vorgang ist kein Treffer - sonst liesse sich
    // dieselbe Oferta ein zweites Mal einloesen.
    if (!GO_OPEN_BOOKING_STATUSES.includes(booking.status)) {
      throw new GoServiceError("Rezervimi nuk u gjet.", "not-found");
    }
    return { id: bookingId, data, booking };
  }

  /**
   * Nachschlagen, ohne etwas zu veraendern.
   *
   * Der Kellner tippt den Code, sieht die Buchung und entscheidet dann. Ein
   * Suchen, das schon bestaetigt, waere ein Knopf, den man nicht mehr
   * loslassen kann - und hier haengt Geld dran.
   */
  async function findBookingByCode({ shortCode = "", restaurantId = "" } = {}) {
    if (!shortCode || !restaurantId) throw new GoServiceError("Rezervimi nuk u gjet.", "not-found");
    const loaded = await loadOpenBookingByShortCode({ shortCode, restaurantId });
    // Der Code geht NICHT zurueck. Das Lokal hat ihn gerade selbst getippt -
    // es braucht ihn nicht von uns, und was nicht herausgeht, kann auch nicht
    // abgeschrieben werden.
    return { booking: loaded.booking };
  }

  /**
   * Die Bestaetigung im Lokal.
   *
   * Weder zu frueh noch zu spaet ist ein Grund, jemanden abzuweisen
   * (Punkt 72, 73). Geprueft wird nur: Gibt es diese Buchung, gehoert sie zu
   * diesem Lokal, und ist sie noch offen.
   *
   * Die Gruppengroesse darf das Lokal hier berichtigen: Der Kellner sitzt vor
   * der Gruppe und sieht, wieviele es wirklich sind. Der Gast hat sie beim
   * Zugreifen geschaetzt.
   */
  async function checkIn({ bookingToken = "", shortCode = "", restaurantId = "", partySize = 0 } = {}) {
    let loaded = null;
    if (bookingToken) {
      loaded = await loadBookingByToken(bookingToken);
    } else if (shortCode && restaurantId) {
      loaded = await loadOpenBookingByShortCode({ shortCode, restaurantId });
    } else {
      throw new GoServiceError("Rezervimi nuk u gjet.", "not-found");
    }

    if (restaurantId && loaded.booking.restaurantId !== asText(restaurantId, 180)) {
      throw new GoServiceError("Ky rezervim është për një lokal tjetër.", "failed-precondition");
    }
    if (loaded.booking.status === GO_BOOKING_STATUS.checkedIn) {
      return { booking: loaded.booking, alreadyCheckedIn: true };
    }

    // Eine berichtigte Gruppengroesse gilt nur, wenn sie im erlaubten Rahmen
    // liegt. Sonst bleibt die des Gastes stehen - eine Null oder eine
    // Fantasiezahl darf keine Buchung veraendern, und schon gar keine
    // Rechnung.
    const corrected = Math.trunc(Number(partySize) || 0);
    const usesCorrection = corrected >= GO_PARTY_SIZE_MIN
      && corrected <= GO_PARTY_SIZE_MAX
      && corrected !== loaded.booking.partySize;
    const confirmedPartySize = usesCorrection ? corrected : loaded.booking.partySize;

    // Hier entsteht das Geld. Gerechnet wird mit der Personenzahl, die beide
    // gesehen haben, und nach der Preisliste, die beim Zugreifen eingefroren
    // wurde.
    const commission = {
      ...resolveGoCommission({
        partySize: confirmedPartySize,
        version: asText(loaded.data?.commissionVersion, 40)
      }),
      status: GO_COMMISSION_STATUS.pending,
      confirmedAt: stamp()
    };

    const extra = {
      ...(usesCorrection ? { partySize: corrected } : {}),
      // Der Posten geht in dieselbe Transaktion wie der Statuswechsel. Ein
      // bestaetigter Gast ohne Posten waere eine verlorene Einnahme, ein
      // Posten ohne Bestaetigung eine erfundene - beides darf es nicht
      // getrennt geben.
      commission
    };

    const result = await applyStatus({
      bookingId: loaded.id,
      booking: loaded.booking,
      nextStatus: GO_BOOKING_STATUS.checkedIn,
      extra
    });

    // Die Tagesrechnung des Lokals. Sie ist eine Zusammenfassung, keine
    // Wahrheit - die Wahrheit steht an der Buchung. Deshalb darf sie
    // beilaeufig laufen (Punkt 115).
    bumpGoStat({
      restaurantId: loaded.booking.restaurantId,
      dayKey: buildGoDayKey({
        expectedArrivalAt: now(),
        timeZone: asText(loaded.booking.timeZone, 60) || GO_DEFAULT_TIME_ZONE
      }),
      field: "confirmed",
      by: 1
    }).catch(() => {});
    bumpGoStat({
      restaurantId: loaded.booking.restaurantId,
      dayKey: buildGoDayKey({
        expectedArrivalAt: now(),
        timeZone: asText(loaded.booking.timeZone, 60) || GO_DEFAULT_TIME_ZONE
      }),
      field: "commissionCents",
      by: commission.amountCents
    }).catch(() => {});

    return {
      booking: { ...result.booking, ...extra },
      alreadyCheckedIn: false
    };
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

    // Bestaetigen steht hier bewusst NICHT.
    //
    // Es ist der Augenblick, in dem Geld entsteht, und es darf nur gelingen,
    // wenn ein Gast davorsteht und seinen Code zeigt. Waere "checkin" hier
    // erlaubt, koennte das Lokal jede Buchung, die es in seiner Liste sieht,
    // ueber die Kennung bestaetigen - ohne je einen Code gesehen zu haben.
    // Der einzige Weg dorthin ist checkIn() mit dem Code.
    const statusByAction = {
      cancel: GO_BOOKING_STATUS.cancelledByBusiness,
      complete: GO_BOOKING_STATUS.completed,
      notArrived: GO_BOOKING_STATUS.notArrived
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
    findBookingByCode,
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
  GO_STATS_SUBCOLLECTION,
  GO_MATCH_REASONS,
  toGoMillis
};
