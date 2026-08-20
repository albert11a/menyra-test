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
import { readGoOpenAmount, rememberGoOpenAmount } from "./go-client-store.js";

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
  // Der Speicher des Browsers. Hereingereicht wie firestore, damit dieses
  // Modul ohne Browser testbar bleibt.
  storageObj = null,
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
    // `known` sagt, ob das Tagesdokument schon da war. Vier der fuenf Zahlen
    // der Karten-Reihe stehen darin - siehe applyOverview.
    stats: { known: false, impressions: 0, uniqueViewers: 0, accepted: 0, activated: 0, finalized: 0, visitors: 0, commissionCents: 0 },
    // Welcher Tag im Tagesdokument steht, auf dem der Listener sitzt. Siehe
    // ensureStatsDay: Um Mitternacht wechselt das Lokal den Tag, das Panel
    // muss mitwechseln.
    statsDayKey: "",
    // Die Zeitzone des Lokals aus seinem Profil - der Tag ist seiner, nicht
    // der des Geraets.
    timeZone: "",
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
  // Was der SERVER zuletzt gesagt hat. Getrennt vom angezeigten Stand, damit
  // eine Serverzahl nie von einer Tageszahl ueberschrieben wird - die
  // Reihenfolge in applyOverview haengt daran.
  const server = { uniqueViewers: null, accepted: null, visits: null, visitors: null, openCents: null };
  // Der Zugang zu Firestore, wie connect() ihn bekommen hat - ensureStatsDay
  // braucht ihn, um um Mitternacht neu zu abonnieren.
  let lastFirestore = null;
  // Was der Browser sich vom letzten Mal gemerkt hat. Nur der offene Betrag:
  // Die vier anderen Zahlen stehen ohnehin gleich im Tagesdokument, und eine
  // Zahl von gestern waere dort schlechter als eine halbe Sekunde Skelett.
  let rememberedOpenCents = readGoOpenAmount(restaurantId, storageObj);

  // Wie lange zwischen zwei Aufrufen mindestens vergeht. Der Ausloeser ist das
  // Tagesdokument, und das geht bei JEDER vorgezeigten Karte hoch - an einem
  // vollen Abend im Sekundentakt. Ein Aufruf je Zaehlung waere ein zweites
  // Suchsystem mit der Rechnung des Lokals daran.
  const OVERVIEW_MIN_GAP_MS = 15000;

  function notify() {
    onChangeFn(data);
  }

  /**
   * Die fuenf Zahlen der Karten-Reihe, aus zwei Quellen zusammengesetzt.
   *
   * Vorher kamen alle fuenf aus EINEM Aufruf beim Server, und der rechnete
   * sie aus Tausenden Dokumenten neu: bis zu 2000 Buchungen und bis zu 5000
   * Zeilen des Finanzbuchs, je Aufruf. Gemessen gegen den Emulator waren das
   * ~100 ms fuer die Buchungen und ~170 ms fuer das Buch - vor Kaltstart der
   * Funktion und Netzweg. Die Karten standen so lange leer.
   *
   * Vier der fuenf Zahlen lagen die ganze Zeit schon fertig summiert im
   * Tagesdokument des Lokals - in genau dem Dokument, das diese Datei ohnehin
   * per Listener offen hat. Dieselbe Zahl, ein Dokument statt Tausender: 4 ms
   * gegen 220 ms, und sie kommt mit dem ersten Snapshot mit, nicht mit einem
   * zweiten Netzweg.
   *
   * Deshalb gilt hier eine Reihenfolge statt einer Quelle:
   *
   *   1. Das Tagesdokument. Sofort da, in Echtzeit, vier Zahlen.
   *   2. Die Erinnerung des Browsers an den offenen Betrag. Der steht im
   *      Finanzbuch, das kein Browser lesen darf - gemerkt wird deshalb, was
   *      der Server zuletzt gesagt hat.
   *   3. Die Antwort des Servers. Sie ist die Wahrheit und ueberschreibt
   *      beide, sobald sie da ist.
   *
   * Die Tageszahlen sind eine Zusammenfassung, die beilaeufig geschrieben
   * wird - faellt eine Zaehlung aus, steht dort eine zu wenig. Genau deshalb
   * bleibt der Aufruf beim Server: Er rechnet aus den Buchungen selbst und
   * setzt gerade. Neu ist nur, dass niemand mehr darauf WARTET.
   */
  function applyOverview() {
    // Die Tageszahlen gelten nur, solange sie von HEUTE sind. Ein Panel, das
    // ueber Nacht offen bleibt, haengt sonst am Dokument von gestern und
    // zeigte morgens dessen Zahlen als die des neuen Tages.
    const dayIsCurrent = data.stats.known && data.statsDayKey === currentDayKey();
    const fromDay = dayIsCurrent
      ? {
        uniqueViewers: data.stats.uniqueViewers,
        accepted: data.stats.accepted,
        visits: data.stats.finalized,
        visitors: data.stats.visitors
      }
      : {};
    const next = {
      uniqueViewers: highest(server.uniqueViewers, fromDay.uniqueViewers),
      accepted: highest(server.accepted, fromDay.accepted),
      visits: highest(server.visits, fromDay.visits),
      visitors: highest(server.visitors, fromDay.visitors),
      // Der offene Betrag steht in keinem Tagesdokument, und er faellt, wenn
      // das Lokal bezahlt - hier gilt deshalb der Server allein, und davor
      // die Erinnerung an das, was er zuletzt gesagt hat.
      openCents: server.openCents !== null ? server.openCents : rememberedOpenCents
    };
    const before = data.overview;
    if (before.uniqueViewers === next.uniqueViewers
      && before.accepted === next.accepted
      && before.visits === next.visits
      && before.visitors === next.visitors
      && before.openCents === next.openCents) return false;
    data.overview = next;
    return true;
  }

  /**
   * Zwei Zahlen fuer dieselbe Sache - die groessere gilt.
   *
   * Das klingt nach einem Trick und ist eine Eigenschaft dieser beiden
   * Quellen: Beide zaehlen an einem Tag nur AUFWAERTS, und sie koennen sich
   * nur in eine Richtung unterscheiden. Der Server rechnet aus den Buchungen
   * selbst und ist damit vollstaendig; das Tagesdokument wird beilaeufig
   * hochgezaehlt und kann eine Zaehlung verloren haben, aber niemals eine
   * erfinden.
   *
   * Also: Der Serverwert ist der Boden, das Tagesdokument bringt live dazu,
   * was seit der letzten Antwort passiert ist. Wer nur den Server naehme,
   * saehe eine Zahl, die zwischen zwei Aufrufen steht; wer nur das
   * Tagesdokument naehme, behielte eine verlorene Zaehlung fuer immer.
   */
  function highest(fromServer, fromDay) {
    const a = Number.isFinite(fromServer) ? fromServer : null;
    const b = Number.isFinite(fromDay) ? fromDay : null;
    if (a === null) return b;
    if (b === null) return a;
    return Math.max(a, b);
  }

  // Der Tag des LOKALS, nicht der des Geraets - derselbe Schluessel, unter dem
  // der Server zaehlt.
  function currentDayKey() {
    const timeZone = String(data.settings?.timeZone || data.timeZone || "").trim();
    return buildGoDayKey({ atMs: nowFn(), ...(timeZone ? { timeZone } : {}) });
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
    ensureStatsDay();
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
      server.uniqueViewers = known(sources.stats !== false, overview.reach?.uniqueViewers, server.uniqueViewers);
      server.accepted = known(sources.bookings !== false, overview.funnel?.accepted, server.accepted);
      server.visits = known(sources.bookings !== false, overview.visitors?.visits, server.visits);
      server.visitors = known(sources.bookings !== false, overview.visitors?.visitors, server.visitors);
      server.openCents = known(sources.ledger !== false, overview.openCents, server.openCents);
      // Der offene Betrag ist die einzige Zahl, die der Browser nirgends
      // sonst herbekommt - deshalb merkt er sie sich fuer das naechste Mal.
      if (server.openCents !== null) {
        rememberedOpenCents = server.openCents;
        rememberGoOpenAmount(data.restaurantId, server.openCents, storageObj, { nowMs: nowFn() });
      }
      if (applyOverview()) notify();
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

  /**
   * Der Listener auf das Tagesdokument des Lokals.
   *
   * Er steht in einer eigenen Funktion, weil er ZWEIMAL gebraucht wird: beim
   * Verbinden und um Mitternacht. Der Tagesschluessel ist der des LOKALS,
   * nicht der des Geraets - sonst liest ein Telefon mit falsch gestellter
   * Zeitzone das Dokument von gestern und das Lokal sieht Nullen. Denselben
   * Schluessel bildet der Server beim Zaehlen.
   *
   * Dieses eine Dokument traegt vier der fuenf Zahlen der Karten-Reihe
   * fertig summiert (siehe applyOverview) - deshalb ist es kein Nebenweg,
   * sondern der schnelle.
   */
  function subscribeStats({ db, api }) {
    const dayKey = currentDayKey();
    if (typeof unsubscribeStats === "function") unsubscribeStats();
    data.statsDayKey = dayKey;
    // Der neue Tag faengt bei "noch nichts bekannt" an und nicht bei den
    // Zahlen von gestern.
    data.stats = { known: false, impressions: 0, uniqueViewers: 0, accepted: 0, activated: 0, finalized: 0, visitors: 0, commissionCents: 0 };
    unsubscribeStats = api.onSnapshot(
      api.doc(db, "restaurants", data.restaurantId, "goStats", dayKey),
      (snapshot) => {
        const exists = snapshot.exists();
        const stats = exists ? (snapshot.data() || {}) : {};
        const previousCommission = data.stats.commissionCents;
        data.stats = {
          // Existiert das Dokument, sind seine Zahlen bekannt - auch die, die
          // noch bei null stehen: An einem Tag, an dem gezaehlt wurde, ist
          // eine fehlende Zahl eine echte Null. Existiert es nicht, ist heute
          // noch gar nichts passiert - auch das ist eine Auskunft und keine
          // Luecke.
          known: true,
          impressions: Number(stats.impressions) || 0,
          uniqueViewers: Number(stats.uniqueViewers) || 0,
          accepted: Number(stats.accepted) || 0,
          // Der Trichter des Tages. "activated" ist der Wisch des Gastes,
          // "finalized" der Handgriff des Kellners - und "visitors" sind
          // Personen und nicht Oferten (Punkt 11).
          activated: Number(stats.activated) || 0,
          finalized: Number(stats.finalized) || 0,
          visitors: Number(stats.visitors) || 0,
          commissionCents: Number(stats.commissionCents) || 0
        };
        applyOverview();
        notify();
        // Nachgeschlagen wird nur, wenn sich GELD geaendert haben kann.
        //
        // Vorher loeste jede Aenderung dieses Dokuments einen Aufruf aus - und
        // es geht bei JEDER vorgezeigten Karte hoch. An einem vollen Abend war
        // das ein Aufruf im Takt der Gaeste, jedes Mal ueber bis zu 2000
        // Buchungen und 5000 Zeilen des Finanzbuchs, fuer vier Zahlen, die
        // eine Zeile weiter oben schon dastanden.
        //
        // Beim Server bleibt genau eine Frage: was das Lokal schuldet. Die
        // Antwort darauf aendert sich, wenn eine Gebuehr entsteht - und genau
        // das steht hier als commissionCents.
        if (exists && Number(stats.commissionCents || 0) !== previousCommission) {
          void refreshOverview({ force: true });
        }
      },
      () => {
        // Ohne die Zahlen steht die Seite trotzdem - sie sind eine Auskunft,
        // keine Voraussetzung.
      }
    );
  }

  /**
   * Mitternacht im Lokal.
   *
   * Ein Panel, das ueber Nacht offen bleibt, haengt sonst am Dokument von
   * gestern - und zeigte am Morgen dessen Zahlen als die des neuen Tages.
   * Geprueft wird bei jedem Ereignis, das ohnehin durchkommt; das kostet
   * einen Vergleich zweier Zeichenketten.
   */
  function ensureStatsDay() {
    if (!lastFirestore || !data.connected) return;
    if (data.statsDayKey === currentDayKey()) return;
    subscribeStats(lastFirestore);
    // Der neue Tag hat noch keine Serverzahlen - die alten waeren die von
    // gestern.
    server.uniqueViewers = null;
    server.accepted = null;
    server.visits = null;
    server.visitors = null;
    applyOverview();
    void refreshOverview({ force: true });
  }

  async function connect() {
    if (data.connected || !data.restaurantId) return;
    data.connected = true;
    // Was der Browser vom letzten Mal weiss, steht sofort da - noch vor dem
    // ersten Netzweg. Es ist nur der offene Betrag; die vier anderen Zahlen
    // bringt der Listener gleich selbst mit.
    rememberedOpenCents = readGoOpenAmount(data.restaurantId, storageObj, { nowMs: nowFn() });
    applyOverview();
    // Und der Aufruf beim Server steht ausserhalb des Versuchs darunter: Er
    // haengt nicht an Firestore. Faellt die Realtime-Verbindung aus, steht die
    // Seite zwar mit einer Meldung da - aber was das Lokal schuldet, kann es
    // trotzdem lesen.
    void refreshOverview({ force: true });
    try {
      lastFirestore = firestore || (await loadFirestore());
      const { db, api } = lastFirestore;
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
          ensureStatsDay();
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

      data.timeZone = String(restaurant.timeZone || "").trim();
      subscribeStats({ db, api });

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
    lastFirestore = null;
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
    // Der heutige Tag des Lokals. Er steht hier und nicht als Feld an `data`,
    // weil er keine Nachricht ist, sondern eine Frage: Wer ihn braucht, fragt
    // in dem Augenblick, in dem er zeichnet - dann stimmt er auch dann noch,
    // wenn seit der letzten Aenderung Mitternacht war.
    //
    // Es ist DIESELBE Rechnung, mit der der Listener auf das Tagesdokument
    // seinen Tag bildet (ensureStatsDay) und mit der der Server zaehlt. Zwei
    // Rechenwege gaeben irgendwann zwei Tage.
    currentDayKey,
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
