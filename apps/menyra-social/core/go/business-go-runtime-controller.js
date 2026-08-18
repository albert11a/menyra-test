// Mnyra GO im Panel - Daten und Realtime. Ohne DOM.
//
// Dieses Modul haelt die Buchungen, die Angebote und die Einstellungen eines
// Lokals aktuell und meldet jede Aenderung nach oben. Wie das aussieht,
// entscheidet die Ansicht (go-admin-view-controller.js) - hier steht kein
// einziges Stueck Auszeichnung.
//
// Die Anforderung aus der Spezifikation (Punkt 52 bis 57) ist: Das Panel
// aktualisiert sich ohne Refresh, auf mehreren Geraeten gleichzeitig, mit
// Wiederverbindung nach einem Abbruch, und nach einer Offline-Phase zuerst
// mit dem vollstaendigen Stand und dann mit den laufenden Aenderungen.
//
// Empfohlen war dafuer SSE. Der Stack traegt das nicht: Mnyra liegt als
// statisches Bundle auf Vercel, der Server sind Firebase Functions - beide
// halten keine dauerhaft offene Verbindung. Umgesetzt ist deshalb das Ziel,
// nicht die Technik: ein Firestore-Listener auf die eigenen Buchungen. Er
// liefert genau diese fuenf Eigenschaften, ohne eine zweite Infrastruktur -
// und er haengt nur an Business-Seiten. Ein Gast im Qyteti bekommt keine
// Verbindung (Punkt 54).
//
// Angelegt und veraendert werden Buchungen hier NICHT. Das Panel liest sie
// und ruft fuer jede Aenderung den Server (Punkt 146).

import {
  normalizeGoOffer,
  toGoOfferStoragePayload,
  validateGoOffer
} from "../../../../shared/go/go-offer-core.js";
import {
  buildGoDayKey,
  normalizeGoBooking,
  normalizeGoBookingStatus
} from "../../../../shared/go/go-booking-core.js";
import { goCityKey } from "../../../../shared/go/go-city-core.js";

const BOOKING_LIMIT = 60;

let firestorePromise = null;

async function loadFirestore() {
  if (!firestorePromise) {
    firestorePromise = Promise.all([
      import("/shared/firebase-config.js?v=2026-05-02-public-startup-diet-01"),
      import("/shared/vendor/firebase/11.0.0/firebase-firestore.js")
    ])
      .then(([configModule, firestoreModule]) => ({
        db: configModule?.db || firestoreModule.getFirestore(configModule?.app),
        api: firestoreModule
      }))
      .catch((error) => {
        firestorePromise = null;
        throw error;
      });
  }
  return firestorePromise;
}

function todayKey(nowMs = Date.now()) {
  const date = new Date(nowMs);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

/**
 * Der Zaehler auf der Karte im Panel (Punkt 50, 52).
 *
 * Er liest nur die offenen Vorgaenge des eigenen Lokals. Sobald ein Gast ein
 * Angebot annimmt, steht die Zahl da - ohne dass jemand die Seite neu laedt.
 * Er laeuft nur, solange eine Business-Seite offen ist.
 */
export function createGoBadgeWatcher({
  restaurantId = "",
  firestore = null,
  onCount = () => {},
  nowFn = () => Date.now()
} = {}) {
  let unsubscribe = null;
  let stopped = false;

  async function start() {
    if (!restaurantId || stopped) return stop;
    try {
      const { db, api } = firestore || (await loadFirestore());
      const openQuery = api.query(
        api.collection(db, "goBookings"),
        api.where("restaurantId", "==", restaurantId),
        api.where("status", "in", ["accepted", "activated"]),
        api.limit(BOOKING_LIMIT)
      );
      unsubscribe = api.onSnapshot(openQuery, (snapshot) => {
        if (stopped) return;
        const day = todayKey(nowFn());
        let unseen = 0;
        let open = 0;
        let today = 0;
        let guests = 0;
        snapshot.forEach((entry) => {
          const data = entry.data() || {};
          open += 1;
          guests += Number(data.partySizeVerified || data.partySizeRequested || data.partySize) || 0;
          if (!data.businessSeenAt) unseen += 1;
          if (data.dayKey === day) today += 1;
        });
        onCount({ unseen, open, today, guests });
      }, () => {
        // Bricht die Verbindung ab, bleibt die letzte Zahl stehen. Firestore
        // verbindet von selbst neu und liefert dann den vollen Stand.
      });
    } catch {
      // Ohne Zaehler ist die Karte still, aber vorhanden.
    }
    return stop;
  }

  function stop() {
    stopped = true;
    if (typeof unsubscribe === "function") unsubscribe();
    unsubscribe = null;
  }

  return { start, stop };
}

/**
 * Die Daten der GO-Seite.
 *
 * @param {(patch:object)=>void} params.onChangeFn wird nach jeder Aenderung
 *        gerufen - die Ansicht zeichnet daraufhin neu.
 */
export function createGoAdminDataController({
  restaurantId = "",
  firestore = null,
  bookingActionFn = null,
  // Die Zahlen des Tages holt der SERVER (goBusinessGetOverview). Sie werden
  // hier nicht aus den Buchungen gerechnet, obwohl die daneben liegen - siehe
  // refreshOverview.
  overviewFn = null,
  onChangeFn = () => {},
  nowFn = () => Date.now()
} = {}) {
  const data = {
    restaurantId,
    bookings: [],
    offers: [],
    settings: {},
    // Die Stadt aus dem Profil des Lokals. Sie ist die Wahrheit, an der die
    // Suche das Angebot spaeter misst - deshalb wird sie hier gelesen und
    // nicht im Editor noch einmal getippt.
    city: "",
    // Was heute passiert ist: wie oft eine Oferta vorgezeigt wurde und wie
    // oft zugegriffen wurde. Der Server zaehlt, das Panel liest nur - die
    // beiden Zahlen entstehen bei den Gaesten, nicht hier.
    stats: { impressions: 0, accepted: 0 },
    // Die fuenf Zahlen der Karten-Reihe, wie der Server sie gerechnet hat.
    //
    // `null` heisst "noch nicht bekannt", eine Zahl heisst "gemessen". Das ist
    // der ganze Unterschied, und er braucht keinen zweiten Satz Merker
    // daneben: Eine Null, die noch nicht geladen ist, sieht sonst aus wie eine
    // Null, die es wirklich ist - und von diesen fuenf Zahlen ist genau eine
    // Null eine schlechte Nachricht.
    //
    // Jede Zahl steht dabei fuer sich. Kommt die eine Quelle und die andere
    // nicht, steht die eine Zahl da und die andere wartet weiter - keine
    // Zahl haengt darauf, dass alle fuenf beisammen sind.
    overview: {
      uniqueViewers: null,
      accepted: null,
      visits: null,
      visitors: null,
      openCents: null
    },
    paused: false,
    summary: { unseen: 0, open: 0, today: 0, guests: 0 },
    loading: true,
    error: "",
    connected: false
  };

  let unsubscribeBookings = null;
  let unsubscribeOffers = null;
  let unsubscribeStats = null;
  // Die Uebersicht laeuft ueber einen Aufruf und nicht ueber einen Listener.
  // Diese zwei Werte halten sie im Zaum - siehe refreshOverview.
  let overviewInFlight = false;
  let overviewNextAllowedAt = 0;
  let overviewPending = false;

  // Wie lange zwischen zwei Aufrufen mindestens vergeht. Der Ausloeser ist das
  // Tagesdokument, und das geht bei JEDER vorgezeigten Karte hoch - an einem
  // vollen Abend im Sekundentakt. Ein Aufruf je Zaehlung waere ein zweites
  // Suchsystem mit der Rechnung des Lokals daran.
  const OVERVIEW_MIN_GAP_MS = 15000;

  function notify() {
    onChangeFn(data);
  }

  /**
   * Die fuenf Zahlen der Karten-Reihe, vom Server.
   *
   * Sie werden NICHT hier gerechnet, obwohl die Buchungen daneben liegen. Drei
   * Gruende, und jeder allein genuegt:
   *
   *  1. Der offene Betrag steht im Finanzbuch, und das ist fuer keinen Browser
   *     lesbar (Punkt 54). Eine Geldsumme, die im Browser entsteht, kann im
   *     Browser auch geaendert werden.
   *  2. Die Reichweite steht nicht an den Buchungen: Wer nur geschaut hat,
   *     hinterlaesst keine.
   *  3. Heart rechnet mit demselben Modul ueber dieselben Dokumente. Zwei
   *     Rechenwege geben irgendwann zwei Antworten auf dieselbe Frage.
   *
   * Ausgeloest wird sie vom Tagesdokument: Es geht genau dann hoch, wenn sich
   * eine der Zahlen geaendert haben kann. Der Abstand haelt daraus einen
   * Aufruf statt eines Stroms, und was waehrend eines laufenden Aufrufs
   * hereinkommt, wird zu genau einem Nachschlag zusammengefasst.
   */
  async function refreshOverview({ force = false } = {}) {
    if (typeof overviewFn !== "function" || !data.restaurantId) return;
    if (overviewInFlight) {
      overviewPending = true;
      return;
    }
    const now = nowFn();
    if (!force && now < overviewNextAllowedAt) {
      if (overviewPending) return;
      overviewPending = true;
      const wait = Math.max(0, overviewNextAllowedAt - now);
      setTimeout(() => {
        overviewPending = false;
        void refreshOverview({ force: true });
      }, wait);
      return;
    }
    overviewInFlight = true;
    overviewNextAllowedAt = now + OVERVIEW_MIN_GAP_MS;
    try {
      const overview = await overviewFn({ restaurantId: data.restaurantId, period: "sot" });
      // Ein Aufruf, der nach dem Verlassen der Seite zurueckkommt, schreibt
      // nichts mehr - und einer fuer ein anderes Lokal erst recht nicht.
      if (!overview || overview.restaurantId !== data.restaurantId) return;
      // Der Server sagt, welche seiner drei Quellen er wirklich lesen konnte.
      // Was er nicht lesen konnte, bleibt `null` - und im Panel ein Skelett.
      // Aeltere Antworten kennen `sources` nicht; die galten immer als
      // vollstaendig, also gelten sie es weiter.
      const sources = overview.sources && typeof overview.sources === "object"
        ? overview.sources
        : { bookings: true, ledger: true, stats: true };
      const known = (available, value, previous) => {
        if (!available) return previous ?? null;
        const parsed = Math.trunc(Number(value));
        return Number.isFinite(parsed) && parsed >= 0 ? parsed : (previous ?? null);
      };
      const before = data.overview;
      data.overview = {
        uniqueViewers: known(sources.stats !== false, overview.reach?.uniqueViewers, before.uniqueViewers),
        accepted: known(sources.bookings !== false, overview.funnel?.accepted, before.accepted),
        visits: known(sources.bookings !== false, overview.visitors?.visits, before.visits),
        visitors: known(sources.bookings !== false, overview.visitors?.visitors, before.visitors),
        openCents: known(sources.ledger !== false, overview.openCents, before.openCents)
      };
      notify();
    } catch {
      // Ohne die Zahlen steht die Seite trotzdem - sie sind eine Auskunft,
      // keine Voraussetzung. Was zuletzt geladen war, bleibt stehen; war noch
      // nichts geladen, bleibt der Strich.
    } finally {
      overviewInFlight = false;
      if (overviewPending) {
        overviewPending = false;
        setTimeout(() => void refreshOverview(), OVERVIEW_MIN_GAP_MS);
      }
    }
  }

  function recomputeSummary() {
    const day = todayKey(nowFn());
    const open = data.bookings.filter(
      (booking) => ["accepted", "activated"].includes(normalizeGoBookingStatus(booking.status))
    );
    data.summary = {
      // Das Abzeichen zaehlt nur, was das Lokal noch nicht gesehen hat -
      // nicht alles, was laeuft (Punkt 51).
      unseen: open.filter((booking) => !booking.businessSeenAt).length,
      open: open.length,
      today: data.bookings.filter((booking) => booking.dayKey === day).length,
      guests: open.reduce((total, booking) => total + (Number(booking.partySizeVerified || booking.partySizeRequested || booking.partySize) || 0), 0)
    };
  }

  function applyBookingDocs(docs = []) {
    // Eine Buchung, die zweimal ankommt, ist dieselbe Buchung: Die Liste wird
    // ueber die Kennung gefuehrt, nicht angehaengt (Punkt 112).
    const byId = new Map();
    docs.forEach((entry) => {
      const booking = normalizeGoBooking({ ...entry.data, id: entry.id }, entry.id);
      byId.set(booking.id, {
        ...booking,
        benefitLabel: booking.benefitLabel || booking.snapshot?.benefitLabel || ""
      });
    });
    data.bookings = [...byId.values()].sort((a, b) => (
      Date.parse(b.createdAt || 0) - Date.parse(a.createdAt || 0)
    ));
    recomputeSummary();
  }

  async function connect() {
    if (data.connected || !data.restaurantId) return;
    data.connected = true;
    // Die fuenf Zahlen zuerst, und ausserhalb des Versuchs darunter: Sie
    // haengen nicht an Firestore, sondern an einem Aufruf. Faellt die
    // Realtime-Verbindung aus, steht die Seite zwar mit einer Meldung da -
    // aber was das Lokal schuldet, kann es trotzdem lesen.
    void refreshOverview({ force: true });
    try {
      const { db, api } = firestore || (await loadFirestore());
      // Erst der vollstaendige Stand, dann die laufenden Aenderungen: Genau
      // das macht onSnapshot beim Verbinden und nach jeder Wiederverbindung
      // von selbst - dadurch geht nichts verloren, was waehrend einer
      // Offline-Phase passiert ist (Punkt 57, 122).
      unsubscribeBookings = api.onSnapshot(
        api.query(
          api.collection(db, "goBookings"),
          api.where("restaurantId", "==", data.restaurantId),
          api.orderBy("createdAt", "desc"),
          api.limit(BOOKING_LIMIT)
        ),
        (snapshot) => {
          const docs = [];
          snapshot.forEach((entry) => docs.push({ id: entry.id, data: entry.data() }));
          applyBookingDocs(docs);
          data.loading = false;
          data.error = "";
          notify();
        },
        () => {
          // Firestore verbindet von selbst neu; die Meldung sagt nur, dass
          // der Stand gerade nicht frisch ist.
          data.error = "Lidhja u ndërpre. Po provojmë përsëri...";
          notify();
        }
      );

      unsubscribeOffers = api.onSnapshot(
        api.query(api.collection(db, "restaurants", data.restaurantId, "goOffers")),
        (snapshot) => {
          const offers = [];
          snapshot.forEach((entry) => offers.push(
            normalizeGoOffer({ ...entry.data(), id: entry.id, restaurantId: data.restaurantId }, entry.id)
          ));
          data.offers = offers;
          notify();
        }
      );

      const [settingsSnapshot, restaurantSnapshot] = await Promise.all([
        api.getDoc(api.doc(db, "restaurants", data.restaurantId, "goSettings", "config")),
        api.getDoc(api.doc(db, "restaurants", data.restaurantId))
      ]);
      data.settings = settingsSnapshot.exists() ? (settingsSnapshot.data() || {}) : {};
      const restaurant = restaurantSnapshot.exists() ? (restaurantSnapshot.data() || {}) : {};
      data.city = String(restaurant.city || "").trim();

      // Die Zahlen des Tages. Der Tagesschluessel ist der des LOKALS, nicht
      // der des Geraets - sonst liest ein Telefon mit falsch gestellter
      // Zeitzone das Dokument von gestern und das Lokal sieht Nullen.
      // Denselben Schluessel bildet der Server beim Zaehlen.
      const timeZone = String(data.settings?.timeZone || restaurant.timeZone || "").trim();
      const dayKey = buildGoDayKey({
        atMs: nowFn(),
        ...(timeZone ? { timeZone } : {})
      });
      unsubscribeStats = api.onSnapshot(
        api.doc(db, "restaurants", data.restaurantId, "goStats", dayKey),
        (snapshot) => {
          const stats = snapshot.exists() ? (snapshot.data() || {}) : {};
          data.stats = {
            impressions: Number(stats.impressions) || 0,
            accepted: Number(stats.accepted) || 0,
            // Der Trichter des Tages. "activated" ist der Wisch des Gastes,
            // "finalized" der Handgriff des Kellners - und "visitors" sind
            // Personen und nicht Oferten (Punkt 11).
            activated: Number(stats.activated) || 0,
            finalized: Number(stats.finalized) || 0,
            visitors: Number(stats.visitors) || 0
          };
          notify();
          // Das Tagesdokument geht genau dann hoch, wenn sich eine der fuenf
          // Zahlen geaendert haben kann. Es ist deshalb der Ausloeser fuer den
          // Nachschlag beim Server - und nicht selbst die Quelle der Karten:
          // Der offene Betrag steht nicht darin, und die Reichweite in
          // Personen soll aus derselben Rechnung kommen wie der Rest.
          void refreshOverview();
        },
        () => {
          // Ohne die Zahlen steht die Seite trotzdem - sie sind eine Auskunft,
          // keine Voraussetzung.
        }
      );
      data.paused = !!data.settings.paused || (Number(data.settings.pausedUntil) || 0) > nowFn();
      data.loading = false;
      notify();
    } catch {
      data.loading = false;
      data.error = "Mnyra GO është përkohësisht i padisponueshëm.";
      notify();
    }
  }

  function disconnect() {
    if (typeof unsubscribeBookings === "function") unsubscribeBookings();
    if (typeof unsubscribeOffers === "function") unsubscribeOffers();
    if (typeof unsubscribeStats === "function") unsubscribeStats();
    unsubscribeBookings = null;
    unsubscribeOffers = null;
    unsubscribeStats = null;
    // Ein Aufruf, der noch unterwegs ist, schreibt nach dem Verlassen nichts
    // mehr: Er prueft das Lokal, bevor er den Zustand anfasst. Der Nachschlag
    // wird hier trotzdem abbestellt, damit er nicht noch einmal losgeht.
    overviewPending = false;
    data.connected = false;
  }

  // Gesehen heisst gesehen: Sobald das Lokal die Liste offen hat, verschwindet
  // das Abzeichen - die Buchungen selbst bleiben unveraendert (Punkt 114).
  async function markSeen() {
    if (!bookingActionFn) return;
    const unseen = data.bookings.filter(
      (booking) => !booking.businessSeenAt
        && ["accepted", "activated"].includes(normalizeGoBookingStatus(booking.status))
    );
    await Promise.allSettled(unseen.map((booking) => bookingActionFn({
      bookingId: booking.id,
      restaurantId: data.restaurantId,
      action: "seen"
    })));
  }

  async function bookingAction(bookingId = "", action = "", reason = "") {
    if (!bookingActionFn) return;
    try {
      await bookingActionFn({ bookingId, restaurantId: data.restaurantId, action, reason });
    } catch (error) {
      data.error = String(error?.message || "").trim() || "Ky veprim nuk është i mundur.";
      notify();
    }
  }

  async function saveOffer(draft = {}) {
    const check = validateGoOffer({ ...draft, restaurantId: data.restaurantId });
    if (!check.ok) return { ok: false, errors: check.errors };
    try {
      const { db, api } = firestore || (await loadFirestore());
      const payload = toGoOfferStoragePayload(check.offer, { serverTimestamp: api.serverTimestamp() });
      // Nur ein Hinweis fuer die Abfrage - ob das Lokal wirklich in dieser
      // Stadt steht, entscheidet der Server am Profil.
      //
      // Der Wert kommt aus dem Profil, nicht aus den GO-Einstellungen: Dort
      // hat ihn nie jemand hingeschrieben, und ein Feld, das immer leer ist,
      // hat jedes Angebot aus der Abfrage gehalten. Durch goCityKey geht er,
      // damit hier derselbe Schluessel steht, nach dem die Suche fragt.
      const cityKey = goCityKey(data.city || data.settings?.cityKey || data.settings?.city);
      if (cityKey) payload.cityKey = cityKey;
      const ref = check.offer.id
        ? api.doc(db, "restaurants", data.restaurantId, "goOffers", check.offer.id)
        : api.doc(api.collection(db, "restaurants", data.restaurantId, "goOffers"));
      await api.setDoc(ref, payload, { merge: true });
      return { ok: true, errors: [] };
    } catch {
      return { ok: false, errors: [{ field: "", message: "Nuk u ruajt. Provo prapë." }] };
    }
  }

  async function setOfferStatus(offerId = "", status = "active") {
    try {
      const { db, api } = firestore || (await loadFirestore());
      // Ein Angebot mit Buchungen wird archiviert, nie geloescht - sonst
      // verlieren bestehende Buchungen ihren Ursprung (Punkt 94).
      await api.setDoc(
        api.doc(db, "restaurants", data.restaurantId, "goOffers", offerId),
        { status, updatedAt: api.serverTimestamp() },
        { merge: true }
      );
    } catch {
      data.error = "Nuk u ruajt. Provo prapë.";
      notify();
    }
  }

  async function setPause(value = "0") {
    const now = nowFn();
    let pausedUntil = 0;
    let paused = false;
    if (value === "tomorrow") {
      const date = new Date(now);
      date.setHours(24, 0, 0, 0);
      pausedUntil = date.getTime();
      paused = true;
    } else if (Number(value) > 0) {
      pausedUntil = now + Number(value) * 60 * 1000;
      paused = true;
    } else if (Number(value) < 0) {
      paused = true;
    }
    try {
      const { db, api } = firestore || (await loadFirestore());
      await api.setDoc(
        api.doc(db, "restaurants", data.restaurantId, "goSettings", "config"),
        { enabled: true, paused, pausedUntil, updatedAt: api.serverTimestamp() },
        { merge: true }
      );
      data.settings = { ...data.settings, paused, pausedUntil };
      data.paused = paused;
      notify();
    } catch {
      data.error = "Nuk u ruajt. Provo prapë.";
      notify();
    }
  }

  return {
    data,
    connect,
    disconnect,
    markSeen,
    bookingAction,
    saveOffer,
    setOfferStatus,
    setPause,
    // Nach einer Finalisierung entsteht Geld: Die Karte "Per pagese" soll das
    // sofort zeigen und nicht erst beim naechsten Gast, der sucht.
    refreshOverview,
    __applyBookingDocs: applyBookingDocs
  };
}
