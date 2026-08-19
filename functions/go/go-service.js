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
//  4. Er fuehrt sie zu Ende: aktivieren, finalisieren, absagen.
//
// Der Weg einer Buchung hat drei Stationen, und an jeder passiert genau eine
// Sache:
//
//   createBooking    Die Oferta gehoert dem Gast. Noch kein Code, noch kein Geld.
//   activateBooking  Der Gast hat gewischt. Jetzt gibt es einen Code.
//   finalizeBooking  Das Lokal hat den Code eingetippt. Jetzt entsteht Geld.
//
// Der Code liegt zwischen zwei und drei - und zwar bei niemandem sonst. Vor der
// Aktivierung gibt der Server ihn nicht heraus, auch nicht an den Gast, der
// seinen Token hat: Sonst koennte man ihn zuhause abschreiben und jemandem
// schicken, der gar nicht dabei war.
//
// Die Datenbank wird von aussen hereingereicht, damit dieser Dienst ohne
// Firebase testbar bleibt.

const {
  GO_PARTY_SIZE_MAX,
  GO_PARTY_SIZE_MIN,
  GO_SEARCH_CANDIDATE_LIMIT,
  GO_SEARCH_RESULT_LIMIT,
  resolveGoEntitlements
} = require("./generated/go-feature-config.cjs");
const {
  GO_DEFAULT_TIME_ZONE,
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
  buildGoDayKey,
  buildGoIdempotencyKey,
  canTransitionGoBooking,
  createGoShortCode,
  findOpenGoBookingForRestaurant,
  goCapacityWeight,
  isGoBookingLive,
  normalizeGoBooking,
  resolveGoBookingClosure
} = require("./generated/go-booking-core.cjs");
const {
  GO_LEDGER_COLLECTION,
  buildGoChargeEntry,
  sumGoLedgerBalance
} = require("./generated/go-ledger-core.cjs");
const {
  buildGoCohortFunnel,
  countGoVisitors,
  normalizeGoPeriod,
  resolveGoPeriodRange,
  sumGoEarnedCents
} = require("./generated/go-period-core.cjs");
const {
  applyGoGuestActivity,
  buildGoBookingToken,
  buildGoGuestToken,
  goGuestActionAllowed,
  parseGoBookingToken,
  parseGoGuestToken,
  resolveGoGuestTrustLevel
} = require("./generated/go-guest-identity-core.cjs");
// Die Oeffnungszeiten liest jetzt nur noch die Suche - ueber matchGoOffer, das
// sie selbst aus dem Lokal holt. Eine Buchung braucht sie nicht mehr: Ihre
// Frist haengt am Augenblick der Annahme und nicht daran, wann das Lokal
// schliesst.
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
// Wer heute schon gezaehlt wurde. Ein Dokument je Gast und Tag, unter dem
// Tagesdokument des Lokals - siehe markGoViewerSeen. Kein Browser liest diese
// Sammlung; sie traegt keine Zahl, sondern nur die Antwort auf "schon
// dagewesen?".
const GO_VIEWERS_SUBCOLLECTION = "goViewers";
const GO_BOOKINGS_COLLECTION = "goBookings";
// Die Kurzcodes, getrennt von den Buchungen. Kein Browser liest diese Sammlung
// - weder das Lokal noch der Gast. Das Lokal prueft einen Code, indem es ihn
// eintippt; nachschlagen kann es ihn nicht (siehe buildGoBookingCodeRecord).
const GO_BOOKING_CODES_COLLECTION = "goBookingCodes";
const GO_GUEST_SESSIONS_COLLECTION = "goGuestSessions";

const MAX_GUEST_OPEN_BOOKINGS = 25;
// Wieviele Tagesdokumente eine Uebersicht hoechstens liest. Ein Zeitraum in GO
// ist Tag, Woche oder Monat - 40 deckt den laengsten mit Rand.
const GO_OVERVIEW_MAX_STAT_DAYS = 40;

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

/**
 * Die Reichweite eines Zeitraums aus seinen Tagesdokumenten.
 *
 * Zwei Zahlen, die zwei verschiedene Fragen beantworten und deshalb nie
 * miteinander verrechnet werden:
 *
 *   impressions    Wie oft eine Karte dieses Lokals vorgezeigt wurde.
 *   uniqueViewers  Wieviele Menschen es waren.
 *
 * Ueber MEHRERE Tage ist die zweite Zahl eine Summe von Tagessummen: Wer
 * Montag und Dienstag geschaut hat, steht darin zweimal. Fuer den Zeitraum
 * "sot" - den, den das Panel zeigt - ist sie exakt, weil ein Tag genau ein
 * Dokument ist. Ein tagesuebergreifend eindeutiger Zaehler waere ein zweiter
 * Satz Marken mit einem zweiten Verfallsdatum; solange niemand danach fragt,
 * ist die ehrliche Tagessumme die bessere Zahl.
 */
function sumGoReachDays(days = []) {
  let impressions = 0;
  let uniqueViewers = 0;
  (Array.isArray(days) ? days : []).forEach((day) => {
    impressions += Math.max(0, Math.trunc(Number(day?.impressions) || 0));
    uniqueViewers += Math.max(0, Math.trunc(Number(day?.uniqueViewers) || 0));
  });
  return { impressions, uniqueViewers };
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
  const viewerRef = (restaurantId, dayKey, viewerId) => statsRef(restaurantId, dayKey)
    .collection(GO_VIEWERS_SUBCOLLECTION)
    .doc(asText(viewerId, 180));
  const bookingRef = (bookingId) => db.collection(GO_BOOKINGS_COLLECTION).doc(asText(bookingId, 180));
  const bookingCodeRef = (bookingId) => db.collection(GO_BOOKING_CODES_COLLECTION).doc(asText(bookingId, 180));
  const guestRef = (guestId) => db.collection(GO_GUEST_SESSIONS_COLLECTION).doc(asText(guestId, 180));
  const ledgerRef = () => db.collection(GO_LEDGER_COLLECTION).doc();

  const stamp = () => serverTimestamp || new Date(now()).toISOString();

  // Der Tageszaehler eines Ortes. Nur noch einer: Die Scheibe zu einer halben
  // Stunde ist mit der erwarteten Ankunft weggefallen (Punkt 80). Die alten
  // slot__-Dokumente bleiben unberuehrt in der Sammlung liegen; sie werden
  // weder gelesen noch geschrieben und stoeren dort niemanden.
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

  // Welche Zaehler ein Angebot ueberhaupt braucht.
  //
  // Nur noch einer, und nur wenn eine Tagesgrenze gesetzt ist. Der
  // Einloesezaehler steht am Angebot selbst und kostet gar nichts - er ist
  // deshalb kein Grund, irgendein Dokument zu lesen.
  function resolveCapacityNeeds(offer = {}) {
    return { needsDay: (offer.limits || {}).dailyGroups > 0 };
  }

  /**
   * Die Belegung aller gefragten Orte - in einem Zug.
   *
   * Zwei Angebote desselben Lokals am selben Tag lesen dasselbe Dokument; hier
   * wird es einmal geholt. Und alles zusammen geht als ein Sammelaufruf hinaus
   * statt als ein Weg je Angebot.
   */
  async function loadCapacityMap(entries = []) {
    const wanted = new Map();
    entries.forEach((entry) => {
      if (!resolveCapacityNeeds(entry.offer).needsDay) return;
      const restaurantId = entry.offer.restaurantId;
      const id = dayDocId(entry.offer.locationId, entry.dayKey);
      wanted.set(`${restaurantId}/${id}`, { restaurantId, docId: id });
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
    if (!resolveCapacityNeeds(entry.offer).needsDay) return { dailyGroups: 0 };
    const key = `${entry.offer.restaurantId}/${dayDocId(entry.offer.locationId, entry.dayKey)}`;
    return { dailyGroups: Number((capacityByKey.get(key) || {}).groups) || 0 };
  }

  // Den Kurzcode einer Buchung nachschlagen. Nur der Server kommt hier hin.
  async function readShortCode(bookingId = "") {
    const data = docData(await bookingCodeRef(bookingId).get());
    return asText(data?.shortCode, 12).toUpperCase();
  }

  /**
   * Den Code anhaengen - aber nur, wenn die Buchung aktiviert ist.
   *
   * Das ist die eine Stelle, an der der Code das Haus verlaesst, und sie hat
   * genau eine Bedingung. Vorher bekommt ihn niemand: nicht das Lokal (es liest
   * die Sammlung ohnehin nicht), und auch nicht der Gast, dem er gehoert. Der
   * Grund steht im Konzept unter Punkt 5 und 6: Ein Code, den man zuhause
   * abschreiben kann, ist ein Code, den man weitergeben kann - und dann steht
   * am Ende jemand mit einem Rabatt an der Theke, der die Oferta nie
   * angenommen hat.
   *
   * Nach dem Finalisieren gibt es ihn auch nicht mehr zurueck. Er hat dann
   * seine Aufgabe erfuellt, und die Buchung sagt es mit ihrem Status.
   */
  async function withShortCode(booking = {}) {
    if (!booking || !booking.id) return booking;
    if (booking.status !== GO_BOOKING_STATUS.activated) return booking;
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

  /**
   * Ein Gast, einmal am Tag, je Lokal (Karte "Shikime te ofertave").
   *
   * "impressions" beantwortet eine andere Frage als diese hier: Es zaehlt
   * KARTEN. Wer einmal sucht und drei Oferten desselben Lokals sieht, macht
   * dort drei impressions - und wer dreimal sucht, neun. Als Reichweite
   * gelesen ist das eine Zahl, die mit der Unruhe des Gastes waechst und
   * nicht mit der Zahl der Menschen.
   *
   * Deshalb steht daneben ein zweiter Zaehler, und er zaehlt PERSONEN: Beim
   * ersten Mal, das ein Gast ein Lokal an einem Tag zu sehen bekommt, wird
   * eine Marke gesetzt; nur wenn diese Marke wirklich neu war, geht
   * "uniqueViewers" um eins hoch. Beide bleiben stehen - der Trichter des
   * Panels braucht Personen, Heart rechnet weiter mit Karten.
   *
   * Die Marke wird mit `create` gesetzt und nicht mit `set`: Zwei Suchen
   * desselben Gastes in derselben Sekunde laufen sonst beide durch die
   * Pruefung "gibt es die Marke schon?" und zaehlen ihn zweimal. `create`
   * scheitert beim zweiten Mal in der Datenbank selbst - das ist die einzige
   * Stelle, an der die Frage ohne Wettlauf beantwortet wird.
   *
   * Fehlt `create` (die Attrappe im Test kennt nur `set`), faellt es auf
   * Lesen-dann-Schreiben zurueck - mit demselben Vorbehalt wie beim Zaehler
   * ohne `increment`: im Test richtig, in der Cloud nur fast.
   *
   * Und wie alles Zaehlen: Es haelt nichts auf (Punkt 115). Ein Fehler hier
   * kostet eine Zahl, keine Suche.
   */
  async function markGoViewerSeen({ restaurantId = "", dayKey = "", viewerId = "" } = {}) {
    const id = asText(restaurantId, 180);
    const day = asText(dayKey, 20);
    const viewer = asText(viewerId, 180);
    if (!id || !day || !viewer) return false;
    const ref = viewerRef(id, day, viewer);
    const mark = { restaurantId: id, dayKey: day, seenAt: stamp() };
    if (typeof ref.create === "function") {
      try {
        await ref.create(mark);
        return true;
      } catch {
        // Schon da: Dieser Gast ist heute nicht neu.
        return false;
      }
    }
    const existing = await ref.get();
    if (existing?.exists) return false;
    await ref.set(mark, { merge: true });
    return true;
  }

  function buildMatchContext({ context, request }) {
    const timeZone = context.timeZone;
    // Der Tag des Lokals, nicht der von Greenwich - und der Tag von JETZT, weil
    // GO keine Ankunft mehr in der Zukunft kennt.
    return { timeZone, dayKey: buildGoDayKey({ atMs: request.requestedAt, timeZone }) };
  }

  /**
   * Die Lokale, die dieser Gast gerade nicht sehen soll (Punkt 14).
   *
   * Wer in einem Lokal schon eine laufende Oferta hat, bekommt es aus seinen
   * weiteren Suchen genommen - egal, welches andere Angebot es sonst noch
   * hat. Nicht das Angebot verschwindet, sondern das ganze Lokal: Sonst
   * stuende dort eine zweite Karte desselben Wirts, die der Gast antippen
   * kann und die ihm dann abgewiesen wird.
   *
   * Gefiltert wird nach isGoBookingLive und nicht nach dem Status. Eine
   * Buchung, deren 24 Stunden herum sind, versteckt nichts mehr (Punkt 15) -
   * und weil kein Cronjob sie umschreibt, ist das hier der einzige Ort, an dem
   * dieser Unterschied auffaellt.
   */
  async function loadLockedRestaurantIds(guestId = "", nowMs = Date.now()) {
    const id = asText(guestId, 180);
    if (!id) return new Set();
    const snapshot = await db.collection(GO_BOOKINGS_COLLECTION)
      .where("guestId", "==", id)
      .where("status", "in", GO_OPEN_BOOKING_STATUSES)
      .limit(MAX_GUEST_OPEN_BOOKINGS)
      .get();
    const locked = new Set();
    snapshot.docs.forEach((doc) => {
      const booking = normalizeGoBooking({ ...docData(doc), id: doc.id }, doc.id);
      if (isGoBookingLive(booking, nowMs)) locked.add(booking.restaurantId);
    });
    return locked;
  }

  async function search({ request = {}, guestToken = "", uid = "" } = {}) {
    const nowMs = now();
    const normalizedRequest = normalizeGoSearchRequest(request, { nowMs });

    // Die gesperrten Lokale und die Kandidaten gehen gleichzeitig hinaus. Der
    // Gast wartet sonst zweimal hintereinander auf dieselbe Datenbank, und die
    // zweite Frage haengt nicht an der Antwort der ersten.
    const parsedGuest = parseGoGuestToken(guestToken);
    const [offers, lockedRestaurantIds] = await Promise.all([
      loadCandidateOffers(normalizedRequest),
      parsedGuest.valid
        ? loadLockedRestaurantIds(parsedGuest.guestId, nowMs).catch(() => new Set())
        : Promise.resolve(new Set())
    ]);
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
    const NO_USAGE = Object.freeze({ dailyGroups: 0, redeemed: 0 });
    const survivors = offers.map((offer) => {
      // Das Lokal ist fuer diesen Gast gerade vergeben. Das kostet keine
      // Pruefung und kein Dokument - es faellt vor allem anderen heraus.
      if (lockedRestaurantIds.has(offer.restaurantId)) return null;
      const context = contexts.get(offer.restaurantId);
      if (!context) return null;
      const { timeZone, dayKey } = buildMatchContext({ context, request: normalizedRequest });
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
      return { offer, business, context, dayKey, match };
    }).filter(Boolean);

    const capacityByKey = await loadCapacityMap(survivors);
    const entries = survivors.map((entry) => {
      const { offer, context } = entry;
      const limits = offer.limits || {};
      // Kennt das Angebot ueberhaupt keine Grenze, steht das Ergebnis des
      // ersten Zuges bereits fest - eine zweite Pruefung koennte nichts
      // aendern.
      if (!resolveCapacityNeeds(offer).needsDay && !(limits.totalRedemptions > 0)) {
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
    // Und daneben: WIEVIELE MENSCHEN es waren. Das Panel liest beides
    // getrennt (siehe markGoViewerSeen).
    //
    // Die Kennung ist der Gast, nicht das Konto: Ein Gast hat seinen Token,
    // bevor er sich anmeldet, und behaelt ihn danach. Ueber das Konto zu
    // zaehlen liesse jeden Nicht-Angemeldeten aus der Reichweite fallen -
    // und das sind in GO die meisten. Ohne beides bleibt nur die Karte
    // gezaehlt: Eine Person, die sich nicht wiedererkennen laesst, kann man
    // nicht von der naechsten unterscheiden.
    const viewerId = parsedGuest.valid ? parsedGuest.guestId : asText(uid, 180);
    shownPerRestaurant.forEach((count, id) => {
      const timeZone = contexts.get(id)?.timeZone || GO_DEFAULT_TIME_ZONE;
      const dayKey = buildGoDayKey({ atMs: nowMs, timeZone });
      bumpGoStat({
        restaurantId: id,
        dayKey,
        field: "impressions",
        by: count
      }).catch(() => {});
      if (!viewerId) return;
      markGoViewerSeen({ restaurantId: id, dayKey, viewerId })
        .then((isNew) => (isNew
          ? bumpGoStat({ restaurantId: id, dayKey, field: "uniqueViewers", by: 1 })
          : null))
        .catch(() => {});
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
      const dayKey = buildGoDayKey({ atMs: nowMs, timeZone });

      const [daySnapshot, guestBookings] = await Promise.all([
        transaction.get(capacityRef(restaurantId, dayDocId(offer.locationId, dayKey))),
        transaction.get(
          db.collection(GO_BOOKINGS_COLLECTION)
            .where("guestId", "==", guest.guestId)
            .where("status", "in", GO_OPEN_BOOKING_STATUSES)
            .limit(MAX_GUEST_OPEN_BOOKINGS)
        )
      ]);
      const dayData = docData(daySnapshot) || {};

      // --- Pruefen. Dieselbe Domaene wie in der Suche, mit den Zahlen von
      // gerade eben - nicht mit denen von vor dreissig Sekunden (Punkt 27).
      const match = matchGoOffer({
        offer,
        business: { ...business, timeZone },
        settings,
        usage: {
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

      // Der Restaurant-Lock (Punkt 13, 16). Er steht hier drin und nicht nur in
      // der Suche: Zwei Tabs, ein Doppelklick, zwei Geraete desselben Kontos -
      // alle drei kaemen an einer Filterliste vorbei, aber keiner an einer
      // Transaktion.
      const openBookings = guestBookings.docs.map((doc) => normalizeGoBooking({ ...docData(doc), id: doc.id }, doc.id));
      const conflict = findOpenGoBookingForRestaurant({
        bookings: openBookings,
        restaurantId,
        nowMs
      });
      if (conflict.conflict) {
        // Dieselbe Oferta noch einmal ist kein Fehler, sondern derselbe Wunsch
        // zweimal - der Gast bekommt die Buchung, die er schon hat.
        if (conflict.conflict.offerId === asText(offerId, 180)) {
          return { reused: true, booking: conflict.conflict };
        }
        // Ein ANDERES Angebot desselben Lokals ist dagegen eine Absage, und
        // zwar eine, die man erklaeren muss: Der Gast sieht dieses Lokal
        // gerade in seiner Liste stehen und versteht sonst nicht, warum es
        // ihn abweist.
        throw new GoServiceError(
          "Ke tashmë një ofertë të hapur në këtë lokal.",
          "already-exists",
          { reason: conflict.reason, bookingId: conflict.conflict.id }
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
      // Der Code entsteht mit der Buchung, obwohl ihn erst die Aktivierung
      // sichtbar macht. Beides in einem Alles-oder-nichts: Eine Buchung ohne
      // Code liesse sich nie einloesen, ein Code ohne Buchung zeigte ins Leere.
      // Ihn erst beim Wischen zu erzeugen hiesse, an genau dem Handgriff, der
      // im Lokal vor dem Kellner passiert, noch einen Schreibvorgang zu haben,
      // der schiefgehen kann.
      transaction.set(bookingCodeRef(bookingId), buildGoBookingCodeRecord({
        bookingId,
        restaurantId,
        shortCode,
        nowMs,
        serverTimestamp
      }));

      // Der Tageszaehler zaehlt jede GO-Buchung: "hoechstens zwanzig
      // GO-Gruppen pro Tag" meint alle (Punkt 80).
      const weight = goCapacityWeight(record);
      transaction.set(
        capacityRef(restaurantId, dayDocId(offer.locationId, dayKey)),
        {
          restaurantId,
          locationId: offer.locationId,
          dayKey,
          groups: (Number(dayData.groups) || 0) + weight.groups,
          guests: (Number(dayData.guests) || 0) + weight.guests,
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
        // Kein shortCode. Er ist hier bekannt - und geht trotzdem nicht mit:
        // Vor dem Wischen hat ihn niemand zu sehen, auch nicht der Gast, dem er
        // gehoert (Punkt 8). Sonst koennte er ihn zuhause abschreiben und
        // jemandem schicken, der nie im Lokal war.
        booking: normalizeGoBooking(record, bookingId),
        record
      };
    });

    if (outcome.reused) {
      // Beim Wiederverwenden gibt es kein Geheimnis mehr zurueckzugeben - der
      // Browser hat es aus dem ersten Versuch. Er fragt die Buchung mit seinem
      // Token nach (Punkt 100).
      return {
        booking: outcome.booking,
        bookingToken: "",
        reused: true,
        guestToken: guest.guestToken
      };
    }

    recordGuestActivity({ guestToken: guest.guestToken, uid, kind: "booking" }).catch(() => {});

    // Angenommen heisst angenommen: gezaehlt wird der Tag, an dem der Gast
    // zugegriffen hat.
    //
    // Nur bei einer neuen Buchung. Ein Doppeltap im schwachen Netz gibt
    // dieselbe Buchung zurueck (reused) - er waere sonst eine zweite Annahme,
    // die nie stattgefunden hat.
    bumpGoStat({
      restaurantId,
      dayKey: buildGoDayKey({
        atMs: nowMs,
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

  /**
   * Der Stand einer Buchung, wie ihn der Gast sieht.
   *
   * Zwei Dinge passieren hier in dieser Reihenfolge, und die Reihenfolge ist
   * wichtig: Erst wird nachgetragen, was die Uhr inzwischen entschieden hat,
   * dann wird der Code angehaengt. Andersherum bekaeme ein Gast, dessen 26
   * Stunden gerade abgelaufen sind, noch einmal seinen Code zu sehen - und
   * ginge damit ins Lokal.
   */
  async function getBooking({ bookingToken = "" } = {}) {
    const loaded = await loadBookingByToken(bookingToken);
    const closure = resolveGoBookingClosure(loaded.booking, { nowMs: now() });
    if (!closure.shouldClose) return { booking: await withShortCode(loaded.booking) };

    // Der Status wird beim Lesen nachgezogen. Das ist kein Cronjob-Ersatz -
    // die Wahrheit ist die Frist, und die galt schon vorher (Punkt 58). Es
    // spart nur allen danach die Frage, ob das Dokument noch aktuell ist.
    const expiredAt = stamp();
    await bookingRef(loaded.id).set(
      {
        status: closure.nextStatus,
        expiredAt,
        expiredReason: closure.expiredReason,
        updatedAt: expiredAt
      },
      { merge: true }
    );
    return {
      booking: {
        ...loaded.booking,
        status: closure.nextStatus,
        expiredReason: closure.expiredReason
      }
    };
  }

  // Wer den langen Token hat, ist der Gast. Kommt zusaetzlich eine Gastkennung
  // mit und passt sie nicht, ist es eine fremde Buchung in einem geteilten
  // Browser - dann gibt es sie fuer diesen Aufrufer schlicht nicht.
  function assertGuestOwnsBooking(booking, guestToken) {
    const parsedGuest = parseGoGuestToken(guestToken);
    if (parsedGuest.valid && booking.guestId && parsedGuest.guestId !== booking.guestId) {
      throw new GoServiceError("Rezervimi nuk u gjet.", "not-found");
    }
  }

  /**
   * Der Wisch.
   *
   * Er ist der einzige Handgriff des Gastes, der im Lokal passiert, und er darf
   * genau einmal zaehlen (Regel 2). Alles, was danach kommt - die Seite zehnmal
   * oeffnen, das Telefon neu starten, noch dreimal wischen -, findet die
   * Buchung bereits aktiviert vor und bekommt denselben Code zurueck. Es
   * entsteht kein zweiter, und es wird nichts zweites gezaehlt.
   *
   * Ein versehentlicher Wisch zuhause ist ausdruecklich kein Schaden (Punkt 6):
   * Er kostet nichts, er zaehlt keinen Besuch, und der Gast kann mit demselben
   * Code spaeter ins Lokal gehen. Er verkuerzt nur seine eigene Frist nicht -
   * die 24 Stunden liefen ohnehin.
   */
  async function activateBooking({ bookingToken = "", guestToken = "" } = {}) {
    const loaded = await loadBookingByToken(bookingToken);
    assertGuestOwnsBooking(loaded.booking, guestToken);

    // Schon aktiviert: eine ruhige Auskunft und derselbe Code. Das ist der
    // haeufigste Fall nach dem ersten Wisch - jedes Neuladen der Seite laeuft
    // hier durch.
    if (loaded.booking.status === GO_BOOKING_STATUS.activated) {
      const closure = resolveGoBookingClosure(loaded.booking, { nowMs: now() });
      if (!closure.shouldClose) {
        return { booking: await withShortCode(loaded.booking), alreadyActivated: true };
      }
    }

    if (loaded.booking.status !== GO_BOOKING_STATUS.accepted) {
      throw new GoServiceError(
        "Kjo ofertë nuk mund të aktivizohet më.",
        "failed-precondition",
        { status: loaded.booking.status }
      );
    }

    // Die Frist. Sie wird hier geprueft und gleich darauf noch einmal in der
    // Transaktion - hier, damit der Gast einen ehrlichen Satz bekommt statt
    // eines Zustandswechsel-Fehlers.
    const closure = resolveGoBookingClosure(loaded.booking, { nowMs: now() });
    if (closure.shouldClose) {
      await expireBooking(loaded.id, closure);
      throw new GoServiceError("Oferta ka skaduar.", "failed-precondition", {
        expired: true,
        expiredReason: closure.expiredReason
      });
    }

    const result = await applyStatus({
      bookingId: loaded.id,
      booking: loaded.booking,
      nextStatus: GO_BOOKING_STATUS.activated,
      extra: { activatedAt: stamp() }
    });

    bumpGoStat({
      restaurantId: loaded.booking.restaurantId,
      dayKey: buildGoDayKey({
        atMs: now(),
        timeZone: asText(loaded.booking.timeZone, 60) || GO_DEFAULT_TIME_ZONE
      }),
      field: "activated",
      by: 1
    }).catch(() => {});

    return {
      booking: await withShortCode(result.booking),
      alreadyActivated: false
    };
  }

  // Eine abgelaufene Buchung nachtragen. Beilaeufig wie eine Zaehlung: Die
  // Frist galt schon, ob das Dokument sie kennt oder nicht.
  async function expireBooking(bookingId, closure) {
    const at = stamp();
    await bookingRef(bookingId).set(
      {
        status: GO_BOOKING_STATUS.expired,
        expiredAt: at,
        expiredReason: closure?.expiredReason || "",
        updatedAt: at
      },
      { merge: true }
    ).catch(() => {});
  }

  async function cancelBookingByGuest({ bookingToken = "", guestToken = "" } = {}) {
    const loaded = await loadBookingByToken(bookingToken);
    assertGuestOwnsBooking(loaded.booking, guestToken);
    // Nach dem Wischen geht das nicht mehr, und das entscheidet nicht diese
    // Funktion, sondern die Zustandstabelle in der Domaene (Punkt 23). Der
    // Gast bekommt hier denselben Satz wie bei jedem unmoeglichen Wechsel.
    return applyStatus({
      bookingId: loaded.id,
      booking: loaded.booking,
      nextStatus: GO_BOOKING_STATUS.cancelled,
      extra: { cancelledAt: stamp() }
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

      // Eine abgesagte Oferta gibt ihren Platz im Tageszaehler sofort zurueck
      // (Punkt 96). Eine abgelaufene ausdruecklich NICHT: Sie hat dem Lokal
      // den Platz den ganzen Tag ueber blockiert, und ein Lokal, das seine
      // Tagesgrenze auf zwanzig gesetzt hat, will nicht am Abend feststellen,
      // dass es dreissig Karten verteilt hat, weil zehn Gaeste nie kamen.
      const releasesCapacity = nextStatus === GO_BOOKING_STATUS.cancelled;

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
      const dayDoc = releasesCapacity
        ? capacityRef(current.restaurantId, dayDocId(current.locationId, current.dayKey))
        : null;
      const dayData = dayDoc ? (docData(await transaction.get(dayDoc)) || {}) : {};

      // --- Ab hier wird nur noch geschrieben.
      transaction.set(
        bookingRef(bookingId),
        { status: nextStatus, updatedAt: stamp(), ...extra },
        { merge: true }
      );

      if (dayDoc) {
        transaction.set(dayDoc, {
          groups: Math.max(0, (Number(dayData.groups) || 0) - weight.groups),
          guests: Math.max(0, (Number(dayData.guests) || 0) - weight.guests),
          updatedAt: stamp()
        }, { merge: true });
      }
    });

    if (nextStatus === GO_BOOKING_STATUS.cancelled && booking.guestId) {
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
   * Eine aktivierte Buchung ueber ihren Kurzcode finden.
   *
   * Der Weg fuehrt zuerst durch die Sammlung, die das Lokal nicht lesen kann.
   * Es kommt hier also nur durch, wenn es den Code kennt - und den kennt es
   * nur vom Gast, der davorsteht.
   *
   * Das Lokal steht mit im Schluessel: Ein Code aus einem anderen Lokal findet
   * hier nichts (Regel 10). Er ist keine Kennung ueber Lokale hinweg.
   *
   * Verlangt wird `activated` und nicht "offen". Eine Buchung, die der Gast nur
   * angenommen hat, ist hier nicht zu finden - ihr Code ist noch nirgends
   * sichtbar gewesen, und ein Lokal, das ihn trotzdem nennt, hat ihn nicht vom
   * Gast. Ebenso wenig zu finden ist eine, deren Frist abgelaufen ist: Sie
   * steht vielleicht noch als "activated" im Dokument, aber die Uhr hat
   * entschieden.
   */
  async function loadActivatedBookingByShortCode({ shortCode = "", restaurantId = "" } = {}) {
    const codeSnapshot = await db.collection(GO_BOOKING_CODES_COLLECTION)
      .where("restaurantId", "==", asText(restaurantId, 180))
      .where("shortCode", "==", asText(shortCode, 12).toUpperCase())
      .limit(1)
      .get();
    if (codeSnapshot.empty) throw new GoServiceError("Kodi nuk u gjet.", "not-found");
    const bookingId = asText(docData(codeSnapshot.docs[0])?.bookingId, 180);
    const doc = await bookingRef(bookingId).get();
    const data = docData(doc);
    if (!data) throw new GoServiceError("Kodi nuk u gjet.", "not-found");
    const booking = normalizeGoBooking({ ...data, id: bookingId }, bookingId);

    // Ein bereits finalisierter Vorgang ist kein Treffer - sonst liesse sich
    // dieselbe Oferta ein zweites Mal einloesen (Regel 4).
    if (booking.status === GO_BOOKING_STATUS.finalized) {
      throw new GoServiceError("Kjo ofertë është finalizuar tashmë.", "failed-precondition", {
        alreadyFinalized: true
      });
    }
    if (booking.status === GO_BOOKING_STATUS.accepted) {
      // Der ehrliche Satz: Der Gast steht daneben und muss noch wischen. Ein
      // "nicht gefunden" schickte den Kellner auf Fehlersuche bei sich selbst.
      throw new GoServiceError(
        "Klienti duhet ta aktivizojë ofertën në telefon.",
        "failed-precondition",
        { needsActivation: true }
      );
    }
    if (booking.status !== GO_BOOKING_STATUS.activated) {
      throw new GoServiceError("Oferta ka skaduar.", "failed-precondition", { expired: true });
    }
    const closure = resolveGoBookingClosure(booking, { nowMs: now() });
    if (closure.shouldClose) {
      await expireBooking(bookingId, closure);
      throw new GoServiceError("Oferta ka skaduar.", "failed-precondition", {
        expired: true,
        expiredReason: closure.expiredReason
      });
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
    if (!shortCode || !restaurantId) throw new GoServiceError("Kodi nuk u gjet.", "not-found");
    const loaded = await loadActivatedBookingByShortCode({ shortCode, restaurantId });
    // Der Code geht NICHT zurueck. Das Lokal hat ihn gerade selbst getippt -
    // es braucht ihn nicht von uns, und was nicht herausgeht, kann auch nicht
    // abgeschrieben werden (Regel 9).
    return { booking: loaded.booking };
  }

  /**
   * Die Finalisierung im Lokal. Hier entsteht Geld.
   *
   * Es ist der einzige Weg dorthin, und er hat genau eine Eintrittskarte: den
   * Code, den der Gast auf seinem Telefon zeigt. Das Lokal kann ihn nirgends
   * nachschlagen (Regel 9), es kann keine Buchung aus seiner eigenen Liste
   * finalisieren (siehe businessUpdateBooking), und ein Code aus einem anderen
   * Lokal findet hier nichts (Regel 10).
   *
   * Sechs Dinge passieren in einer Transaktion (Punkt 10), oder keines:
   * Status, finalizedAt, bestaetigte Personenzahl, Provision, Freigabe des
   * Lokals fuer neue Suchen dieses Gastes, und der Code wird verbraucht.
   *
   * Die Personenzahl darf das Lokal hier berichtigen (Punkt 12): Der Kellner
   * steht vor der Gruppe und sieht, wieviele es wirklich sind. Der Gast hat
   * beim Zugreifen geschaetzt. Gerechnet wird mit dem, was beide gesehen haben.
   */
  async function finalizeBooking({ shortCode = "", restaurantId = "", partySize = 0 } = {}) {
    if (!shortCode || !restaurantId) throw new GoServiceError("Kodi nuk u gjet.", "not-found");
    const loaded = await loadActivatedBookingByShortCode({ shortCode, restaurantId });

    // Der Code wurde ueber restaurantId gefunden; diese Pruefung ist der
    // Guertel zum Hosentraeger und kostet nichts.
    if (loaded.booking.restaurantId !== asText(restaurantId, 180)) {
      throw new GoServiceError("Ky kod është për një lokal tjetër.", "failed-precondition");
    }

    // Eine berichtigte Gruppengroesse gilt nur, wenn sie im erlaubten Rahmen
    // liegt. Sonst bleibt die des Gastes stehen - eine Null oder eine
    // Fantasiezahl darf keine Buchung veraendern, und schon gar keine
    // Rechnung.
    const corrected = Math.trunc(Number(partySize) || 0);
    const verifiedPartySize = corrected >= GO_PARTY_SIZE_MIN && corrected <= GO_PARTY_SIZE_MAX
      ? corrected
      : loaded.booking.partySizeRequested;

    // Hier entsteht das Geld. Nach der Preisliste, die beim Zugreifen
    // eingefroren wurde - nicht nach der von heute.
    const commission = {
      ...resolveGoCommission({
        partySize: verifiedPartySize,
        version: asText(loaded.data?.commissionVersion, 40)
      }),
      status: GO_COMMISSION_STATUS.pending,
      confirmedAt: stamp()
    };

    const finalizedAt = stamp();
    const result = await applyStatus({
      bookingId: loaded.id,
      booking: loaded.booking,
      nextStatus: GO_BOOKING_STATUS.finalized,
      extra: {
        finalizedAt,
        // Die bestaetigte Zahl steht neben der angefragten, nicht an ihrer
        // Stelle. Heart soll spaeter sehen koennen, wie weit Schaetzung und
        // Wirklichkeit auseinanderliegen.
        partySizeVerified: verifiedPartySize,
        // Der Posten geht in dieselbe Transaktion wie der Statuswechsel. Ein
        // finalisierter Gast ohne Posten waere eine verlorene Einnahme, ein
        // Posten ohne Finalisierung eine erfundene - beides darf es nicht
        // getrennt geben (Regel 5, 11).
        commission
      }
    });

    // Die Gebuehr ins Buch. Sie steht damit an zwei Stellen: als `commission`
    // an der Buchung, wo sie in derselben Transaktion wie der Statuswechsel
    // entstanden ist, und als Zeile im Finanzbuch, wo sie bezahlt werden kann.
    //
    // Das ist keine doppelte Wahrheit, sondern eine Wahrheit und ihr Abbild:
    // Die Buchung sagt, was dieser Gast gekostet hat; das Buch sagt, was das
    // Lokal insgesamt schuldet. Faellt der Eintrag hier aus, fehlt eine Zeile
    // im Buch - und sie laesst sich aus der Buchung wiederherstellen, weil
    // dort dieselbe Zahl steht (Regel 20).
    ledgerRef()
      .set(buildGoChargeEntry({
        restaurantId: loaded.booking.restaurantId,
        bookingId: loaded.id,
        amountCents: commission.amountCents,
        commissionVersion: commission.version,
        partySize: verifiedPartySize,
        dayKey: loaded.booking.dayKey,
        nowMs: now(),
        serverTimestamp
      }))
      .catch(() => {});

    // Der Code ist verbraucht. Streng genommen reicht der Status: Ein zweiter
    // Versuch faellt oben schon durch, weil die Buchung nicht mehr `activated`
    // ist. Der Vermerk steht trotzdem hier - wer die Sammlung spaeter aufraeumt
    // oder prueft, soll es dem Code selbst ansehen und nicht erst die Buchung
    // dazuholen muessen.
    bookingCodeRef(loaded.id)
      .set({ usedAt: finalizedAt }, { merge: true })
      .catch(() => {});

    // Die Tagesrechnung des Lokals. Sie ist eine Zusammenfassung, keine
    // Wahrheit - die Wahrheit steht an der Buchung. Deshalb darf sie
    // beilaeufig laufen (Punkt 115).
    const statsDay = buildGoDayKey({
      atMs: now(),
      timeZone: asText(loaded.booking.timeZone, 60) || GO_DEFAULT_TIME_ZONE
    });
    const bump = (field, by) => bumpGoStat({
      restaurantId: loaded.booking.restaurantId,
      dayKey: statsDay,
      field,
      by
    }).catch(() => {});
    bump("finalized", 1);
    // Besucher sind Personen, nicht Oferten (Punkt 11) - und ausschliesslich
    // bestaetigte.
    bump("visitors", verifiedPartySize);
    bump("commissionCents", commission.amountCents);

    return {
      booking: { ...result.booking, partySizeVerified: verifiedPartySize, commission },
      commission
    };
  }

  // -----------------------------------------------------------------------
  // Business
  // -----------------------------------------------------------------------

  async function businessUpdateBooking({ bookingId = "", restaurantId = "", action = "" } = {}) {
    const snapshot = await bookingRef(bookingId).get();
    const data = docData(snapshot);
    if (!data) throw new GoServiceError("Rezervimi nuk u gjet.", "not-found");
    const booking = normalizeGoBooking({ ...data, id: bookingId }, bookingId);
    if (booking.restaurantId !== asText(restaurantId, 180)) {
      throw new GoServiceError("Nuk keni qasje në këtë rezervim.", "permission-denied");
    }

    // "seen" ist das Einzige, was das Lokal an einer Buchung aendern darf.
    //
    // Frueher standen hier drei weitere Wege: absagen, abschliessen, "nicht
    // gekommen". Alle drei sind weg (Punkt 25). Der Grund ist derselbe fuer
    // alle: Das Lokal entscheidet nicht darueber, ob Mnyra Geld bekommt. Es
    // kann einen gueltigen Code finalisieren - mehr nicht.
    //
    // "Nicht gekommen" braucht ohnehin niemand mehr: Wer nicht finalisiert
    // wurde, laeuft nach 26 Stunden von selbst aus, ohne dass jemand einen
    // Knopf druecken muesste und ohne Strafpunkt fuer den Gast.
    if (action !== "seen") throw new GoServiceError("Veprim i panjohur.", "invalid-argument");
    const seenAt = stamp();
    await bookingRef(bookingId).set({ businessSeenAt: seenAt, updatedAt: seenAt }, { merge: true });
    return { booking: { ...booking, businessSeenAt: seenAt } };
  }

  /**
   * Die GO-Oferten eines angemeldeten Kontos (Punkt 28).
   *
   * Drei Faecher, und der Gast liest sie als drei Reiter: was laeuft, was er
   * benutzt hat, und was daraus geworden ist. Der Kurzcode geht hier NICHT
   * mit - eine Liste ist kein Lokal, und wer eine Oferta benutzen will, oeffnet
   * sie einzeln.
   *
   * Abgelaufene Buchungen werden beim Lesen erkannt, aber nicht geschrieben:
   * Eine Liste soll nicht heimlich zwanzig Dokumente anfassen. Der Status wird
   * nachgezogen, sobald der Gast die Buchung wirklich oeffnet.
   */
  /**
   * Die Zahlen eines Lokals fuer einen Zeitraum.
   *
   * Sie entstehen hier und nicht im Browser - und das ist der ganze Punkt:
   * Heart rechnet spaeter mit demselben Modul ueber dieselben Dokumente. Wenn
   * das Panel "Hapur 23,50 €" zeigt, zeigt Heart dieselbe Zahl, weil beide
   * dieselbe Rechnung angestellt haben (Punkt 54, Regel 13).
   *
   * Geholt wird ein Fenster, das gross genug fuer beide Fragen ist: Der
   * Trichter braucht die Buchungen, die IM Zeitraum angenommen wurden, die
   * Besucher die, die IM Zeitraum finalisiert wurden - und eine gestern
   * angenommene Buchung, die heute eingeloest wurde, gehoert nur in die
   * zweite. Deshalb reicht die Abfrage zwei Tage weiter zurueck als der
   * Zeitraum selbst: 26 Stunden ist die laengste Strecke, die eine Buchung
   * ueberhaupt leben kann.
   */
  async function businessOverview({ restaurantId = "", period = "sot" } = {}) {
    const id = asText(restaurantId, 180);
    if (!id) throw new GoServiceError("Restaurant was not found.", "not-found");

    const [restaurantSnapshot, settingsSnapshot] = await Promise.all([
      restaurantRef(id).get(),
      settingsRef(id).get()
    ]);
    const timeZone = resolveTimeZone(docData(restaurantSnapshot) || {}, docData(settingsSnapshot) || {});
    const range = resolveGoPeriodRange({
      period: normalizeGoPeriod(period),
      nowMs: now(),
      timeZone
    });

    // Zwei Tage Vorlauf, damit eine Buchung von gestern, die heute
    // finalisiert wurde, in den Besuchern auftaucht.
    const windowFrom = new Date(range.fromMs - 2 * 24 * 60 * 60 * 1000).toISOString();
    // Die Reichweite steht nicht an den Buchungen: Wer nur geschaut hat, hat
    // keine. Sie steht in den Tagesdokumenten, und die werden hier ueber den
    // Zeitraum gelesen - dieselben Dokumente, die das Panel abonniert, damit
    // beide dieselbe Zahl nennen.
    const fromDayKey = buildGoDayKey({ atMs: range.fromMs, timeZone });
    const toDayKey = buildGoDayKey({ atMs: range.toMs, timeZone });
    // Faellt eine der drei Abfragen aus, wird das GESAGT und nicht zu einer
    // Null gerechnet.
    //
    // Vorher fing jede ihren Fehler mit einer leeren Liste ab - und aus einer
    // leeren Liste wird eine Null, die aussieht wie eine gemessene. Ein Lokal
    // haette dann "0 vizita" gelesen, wo in Wahrheit "wir konnten gerade
    // nicht nachsehen" stand. Diese beiden Saetze duerfen nicht dieselbe
    // Anzeige haben (Punkt 117): Was nicht gelesen werden konnte, bleibt im
    // Panel ein Skelett und wird keine Zahl.
    const readOr = (promise) => promise.then(
      (snapshot) => ({ ok: true, docs: snapshot.docs || [] }),
      () => ({ ok: false, docs: [] })
    );
    const [bookingRead, ledgerRead, statsRead] = await Promise.all([
      readOr(db.collection(GO_BOOKINGS_COLLECTION)
        .where("restaurantId", "==", id)
        .where("createdAt", ">=", windowFrom)
        .limit(2000)
        .get()),
      // Das Buch wird ganz gelesen: Offen ist offen, egal wie alt. Eine
      // Gebuehr aus dem Januar verschwindet nicht, weil der Wirt gerade auf
      // "Sot" getippt hat.
      //
      // Hier stand einmal ein Filter auf die Zeilenarten, die den offenen
      // Betrag ueberhaupt bewegen (charge, allocation, reversal) - Zahlungen
      // tun das nicht, und sie machen ein Drittel des Buchs aus. Gemessen war
      // die gefilterte Abfrage LANGSAMER: 204 ms gegen 159 ms bei 5000
      // Zeilen. Ein "in" laeuft in Firestore als drei Abfragen, deren
      // Ergebnisse zusammengefuehrt werden - drei Laeufe ueber den Index
      // kosten mehr, als die gesparten Dokumente einbringen.
      //
      // Es bleibt also beim einen Lauf. Schneller wird das Panel nicht hier,
      // sondern dadurch, dass niemand mehr auf diese Antwort WARTET (siehe
      // applyOverview in business-go-runtime-controller.js).
      readOr(db.collection(GO_LEDGER_COLLECTION)
        .where("restaurantId", "==", id)
        .limit(5000)
        .get()),
      readOr(restaurantRef(id)
        .collection(GO_STATS_SUBCOLLECTION)
        .where("dayKey", ">=", fromDayKey)
        .where("dayKey", "<=", toDayKey)
        .limit(GO_OVERVIEW_MAX_STAT_DAYS)
        .get())
    ]);

    const bookings = bookingRead.docs.map((doc) => normalizeGoBooking({ ...docData(doc), id: doc.id }, doc.id));
    const ledger = ledgerRead.docs.map((doc) => ({ ...docData(doc), id: doc.id }));

    const funnel = buildGoCohortFunnel({ bookings, fromMs: range.fromMs, toMs: range.toMs });
    const visitors = countGoVisitors({ bookings, fromMs: range.fromMs, toMs: range.toMs });
    const balance = sumGoLedgerBalance(ledger);
    const reach = sumGoReachDays(statsRead.docs.map((doc) => docData(doc) || {}));

    return {
      restaurantId: id,
      period: range.key,
      timeZone,
      from: new Date(range.fromMs).toISOString(),
      to: new Date(range.toMs).toISOString(),
      funnel,
      visitors,
      reach,
      // Welche der drei Quellen wirklich gelesen werden konnte. Das Panel
      // haengt daran, ob es an einer Stelle eine Zahl zeigt oder weiter
      // wartet - siehe readOr oben.
      sources: {
        bookings: bookingRead.ok,
        ledger: ledgerRead.ok,
        stats: statsRead.ok
      },
      earnedCents: sumGoEarnedCents({ bookings, fromMs: range.fromMs, toMs: range.toMs }),
      // Hapur und Barazuar sind nicht an den Zeitraum gebunden. Ein Lokal will
      // wissen, was es SCHULDET - nicht, was es diese Woche geschuldet hat.
      openCents: balance.openCents,
      settledCents: balance.settledCents
    };
  }

  async function listMyBookings({ uid = "", limit = 60 } = {}) {
    const owner = asText(uid, 180);
    if (!owner) throw new GoServiceError("Authentication required.", "unauthenticated");
    const snapshot = await db.collection(GO_BOOKINGS_COLLECTION)
      .where("uid", "==", owner)
      .orderBy("createdAt", "desc")
      .limit(Math.max(1, Math.min(200, Math.trunc(Number(limit) || 60))))
      .get();

    const nowMs = now();
    const active = [];
    const used = [];
    const history = [];
    snapshot.docs.forEach((doc) => {
      const booking = normalizeGoBooking({ ...docData(doc), id: doc.id }, doc.id);
      if (booking.status === GO_BOOKING_STATUS.finalized) {
        used.push(booking);
        return;
      }
      if (isGoBookingLive(booking, nowMs)) {
        active.push(booking);
        return;
      }
      // Offen im Dokument, aber die Frist ist herum: Der Gast sieht sie unter
      // Historia, weil dort hingehoert, was vorbei ist.
      history.push(
        GO_OPEN_BOOKING_STATUSES.includes(booking.status)
          ? { ...booking, status: GO_BOOKING_STATUS.expired }
          : booking
      );
    });
    return { active, used, history };
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
    activateBooking,
    cancelBookingByGuest,
    finalizeBooking,
    findBookingByCode,
    businessUpdateBooking,
    businessOverview,
    listMyBookings,
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
