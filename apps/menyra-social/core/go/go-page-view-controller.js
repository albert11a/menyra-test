// Mnyra GO - der Ablauf auf der Seite.
//
// Gebaut wie die GO-Seite des Panels (core/go/go-admin-view-controller.js)
// und der Ofertat-Editor: eine Seite, die die Shell rendert, ein einziger
// delegierter Zuhoerer, kein Overlay.
//
// Der Zustand liegt in state.go, damit ein Neuzeichnen der Shell ihn nicht
// verliert. Waehrend am Regler gezogen oder im Stadtfeld getippt wird, wird
// NICHT neu gezeichnet: Ein Neuaufbau nimmt dem Finger den Griff, den er
// gerade haelt, und dem Feld die Tastatur.
//
//   view = "search" | "matching" | "loading" | "results" | "booking" | "error"
//
// "loading" ist ein eigener Zustand und kein Beiwerk: Zwischen "wird
// gesendet" und "bestaetigt" wird nie geschummelt (Punkt 140). Es traegt
// heute nur noch die Buchung; die Suche hat mit "matching" ihren eigenen
// Zustand, weil dort mehr passiert als Warten.

import {
  GO_PAGE_TEXTS,
  GO_LIVE_ICONS,
  GO_STEPS,
  GO_WHEEL_ITEM_HEIGHT,
  clampGoPartySize,
  goPartyWord,
  nextGoStep,
  previousGoStep,
  renderGoPageCore
} from "./go-page-render-utils.js";
import { createGoApiClient } from "./go-api-client.js";
import {
  goValidUntilLabel,
  normalizeGoBookingStatus
} from "../../../../shared/go/go-booking-core.js";
import {
  createGoIdempotencyKey,
  buildGoBookingLink,
  forgetGoBooking,
  readGoActiveBookings,
  readGoBookingLinkToken,
  rememberGoBooking,
  syncGoBookingStatus
} from "./go-client-store.js";

function asFn(candidate, fallback) {
  return typeof candidate === "function" ? candidate : fallback;
}

// Der Takt der Suche.
//
// Erst geht die Anfrage hinaus (LIVE_SEND_MS), dann treffen die Lokale ein -
// eines nach dem anderen, im Abstand von LIVE_ARRIVE_MS. Die Zahlen sind
// gewaehlt, nicht geraten:
//
//   - Die erste Phase dauert mindestens drei Sekunden, auch wenn der Server
//     schneller antwortet. Eine Suche, die in 200ms fertig ist, sieht nicht
//     nach Suche aus, sondern nach einer vorbereiteten Liste - und der Gast
//     glaubt nicht, dass irgendjemand gefragt wurde.
//   - Antwortet der Server langsamer, wartet die Karte weiter. Der Zaehler
//     bleibt dann bei 0 stehen und sagt es ("Po presim përgjigjet...") statt
//     eine Zahl zu erfinden.
//   - Die zweite Phase endet, wenn das letzte Angebot da ist. Sie zaehlt genau
//     so weit, wie es Angebote GIBT (hoechstens GO_SEARCH_RESULT_LIMIT = 8):
//     acht Lokale brauchen 5,2 Sekunden, drei brauchen 2. Ein Zaehler, der
//     immer bis zehn laeuft und dann drei Angebote zeigt, ist eine Luege mit
//     Animation.
const LIVE_SEND_MS = 3000;
const LIVE_SEND_SECONDS = 3;
const LIVE_ARRIVE_MS = 650;
// Nach dem letzten Lokal steht die Zahl noch einen Moment allein da, bevor der
// Knopf kommt. Ohne diese Pause erscheint der Knopf im selben Augenblick, in
// dem die Zahl wechselt, und der Daumen trifft ihn, bevor er ihn gesehen hat.
const LIVE_HOLD_MS = 900;
const LIVE_ICON_MS = 800;

export function createGoPageViewController({
  state = null,
  renderFn = () => {},
  documentObj = null,
  windowObj = null,
  api = null,
  getCityFn = () => "",
  getCoordsFn = () => null,
  isSignedInFn = () => false,
  onAnalyticsFn = () => {},
  openMenuFn = null,
  openSignInFn = null,
  // Der Weg herein kann eine Buchung mitbringen: die Karte im Qyteti traegt,
  // solange ein Vorgang laeuft, dessen Kennung. "take" und nicht "get" - die
  // Kennung gilt fuer diesen einen Eintritt und wird dabei verbraucht, sonst
  // risse jedes Neuzeichnen die Seite wieder in die Buchung zurueck.
  takePendingBookingIdFn = () => "",
  // Die Uhren der Suche stehen an einer Stelle und sind austauschbar. Nicht
  // aus Ordnungsliebe: Ein Test, der acht Sekunden Animation abwarten muss,
  // wird entweder langsam oder unzuverlaessig - hier setzt er eine Uhr ein,
  // die sofort klingelt.
  timers = null,
  nowFn = () => Date.now()
} = {}) {
  const doc = documentObj || (typeof document === "undefined" ? null : document);
  const win = windowObj || (typeof window === "undefined" ? null : window);
  const clock = {
    setTimeout: asFn(timers?.setTimeout, (fn, ms) => setTimeout(fn, ms)),
    clearTimeout: asFn(timers?.clearTimeout, (id) => clearTimeout(id)),
    setInterval: asFn(timers?.setInterval, (fn, ms) => setInterval(fn, ms)),
    clearInterval: asFn(timers?.clearInterval, (id) => clearInterval(id))
  };
  const client = api || createGoApiClient();
  const render = asFn(renderFn, () => {});
  const track = asFn(onAnalyticsFn, () => {});
  const takePendingBookingId = asFn(takePendingBookingIdFn, () => "");

  let delegationBound = false;
  let storyObserver = null;
  let liveTimeouts = [];
  let liveIntervals = [];

  // Ein Schluessel je Absicht, nicht je Tipp: Er entsteht, sobald der Gast ein
  // Angebot annimmt, und ueberlebt jeden erneuten Versuch (Punkt 99).
  const idempotencyByOffer = new Map();

  // Wann ein Schluessel weggeworfen werden darf - und wann auf keinen Fall.
  //
  // Hat der Server abgelehnt, ist sicher keine Buchung entstanden: neuer
  // Versuch, neuer Schluessel. Bricht dagegen die Leitung ab, weiss der
  // Browser gar nichts - die Buchung kann sehr wohl stehen. Dann MUSS derselbe
  // Schluessel wieder hinaus (Punkt 100).
  const DEFINITE_REJECTIONS = new Set([
    "resource-exhausted",
    "failed-precondition",
    "not-found",
    "invalid-argument",
    "already-exists",
    "permission-denied",
    "unauthenticated"
  ]);

  function releaseIdempotencyKey(offerId, error) {
    if (DEFINITE_REJECTIONS.has(String(error?.code || "").trim())) idempotencyByOffer.delete(offerId);
  }

  function view() {
    if (!state) return null;
    if (!state.go || typeof state.go !== "object") {
      state.go = {
        view: "search",
        form: {
          step: GO_STEPS[0],
          partySize: 2,
          // "Nuk e di" ist der Anfang: Der Gast muss nichts entscheiden, um
          // etwas zu sehen.
          intent: "unsure",
          city: "",
          citySelect: false,
          citySearch: ""
        },
        // Was waehrend der Suche auf der Karte steht. Es liegt im Zustand und
        // nicht im Modul, damit ein Neuzeichnen der Shell mitten in der
        // Animation nicht bei null anfaengt.
        live: { count: 0, total: 0, name: "", seconds: LIVE_SEND_SECONDS, done: false },
        results: [],
        alternatives: [],
        // Welche Bilder der Geschichte schon aufgedeckt sind. Im Zustand, weil
        // ein Neuzeichnen sie sonst wieder zudeckt.
        storyShown: [],
        booking: null,
        bookingToken: "",
        // Laeuft gerade ein Wisch? Er darf genau einen Aufruf ausloesen, auch
        // wenn der Daumen zehnmal ueber die Bahn geht. Die eigentliche
        // Sicherheit ist die Transaktion auf dem Server - das hier ist
        // Hoeflichkeit gegenueber dem Netz.
        activating: false,
        busyOfferId: "",
        confirmCancel: false,
        error: "",
        notice: "",
        canSignIn: false,
        nowMs: nowFn(),
        opened: false
      };
    }
    return state.go;
  }

  function fail(current, error) {
    stopLive();
    current.view = "error";
    current.error = String(error?.message || "").trim();
    current.alternatives = Array.isArray(error?.alternatives) ? error.alternatives : [];
    current.busyOfferId = "";
    // Bringt der Fehler Alternativen mit, sind sie das Ergebnis - und die
    // Seite faehrt zu ihnen hinunter wie zu Angeboten. Bringt er keine, steht
    // alles Noetige oben auf der Karte, und ein Sprung ginge ins Leere.
    if (current.alternatives.length) current.pendingScroll = true;
    render();
  }

  function buildRequest(current) {
    const form = current.form;
    const coords = getCoordsFn();
    return {
      city: String(form.city || "").trim() || getCityFn(),
      partySize: clampGoPartySize(form.partySize),
      intent: form.intent,
      // Kein requestedAt mehr: Gesucht wird immer jetzt, und die Zeit dafuer
      // nimmt der Server von seiner eigenen Uhr (Punkt 57).
      // Der Standort ist freiwillig. Ohne ihn funktioniert GO vollstaendig,
      // nur ohne Entfernungsangabe (Punkt 13).
      lat: coords?.lat,
      lng: coords?.lng
    };
  }

  // -------------------------------------------------------------------------
  // Die Suche und was der Gast dabei sieht
  // -------------------------------------------------------------------------

  function stopLive() {
    liveTimeouts.forEach((id) => clock.clearTimeout(id));
    liveIntervals.forEach((id) => clock.clearInterval(id));
    liveTimeouts = [];
    liveIntervals = [];
  }

  function queue(fn, ms) {
    liveTimeouts.push(clock.setTimeout(fn, ms));
  }

  function node(selector) {
    try {
      return doc?.querySelector?.(selector) || null;
    } catch {
      return null;
    }
  }

  // Ein Wechsel, den man sieht: Die Marke wird abgenommen und neu gesetzt,
  // damit dieselbe Animation ein zweites Mal laeuft. Ohne den Umweg ueber das
  // erzwungene Nachrechnen (offsetWidth) fasst der Browser beides zu einem
  // Schritt zusammen, und nichts bewegt sich.
  function pop(target) {
    if (!target?.setAttribute) return;
    target.removeAttribute("data-go-pop");
    void target.offsetWidth;
    target.setAttribute("data-go-pop", "1");
  }

  /**
   * Die laufende Karte von Hand nachziehen.
   *
   * Hier wird NICHT neu gezeichnet, und das ist der ganze Punkt: Ein Neuaufbau
   * der Seite alle 650ms setzt jede Animation zurueck und haengt die vier
   * Bilder im Bento erneut ein. Geaendert wird nur, was sich geaendert hat.
   */
  function paintLive() {
    const current = state?.go;
    const card = node("[data-go-live-card]");
    if (!current || !card) return;
    const live = current.live || {};
    const texts = GO_PAGE_TEXTS;
    const count = Math.max(0, Math.trunc(Number(live.count) || 0));

    card.setAttribute("data-go-live", count > 0 ? "arrive" : "send");
    card.setAttribute("data-go-live-done", live.done ? "1" : "0");

    const seconds = node("[data-go-live-seconds]");
    if (seconds) {
      // Bei 0 wird nicht weitergezaehlt und nichts erfunden - dann steht dort,
      // was tatsaechlich passiert: Wir warten noch.
      seconds.textContent = live.seconds > 0
        ? `${texts.liveWait}: ${live.seconds} ${texts.liveSeconds}`
        : texts.liveStillWaiting;
    }

    const countNode = node("[data-go-live-count]");
    if (countNode && countNode.textContent !== String(count)) {
      countNode.textContent = String(count);
      pop(countNode);
    }
    const word = node("[data-go-live-word]");
    if (word) word.textContent = count === 1 ? texts.liveOne : texts.liveMany;
    const name = node("[data-go-live-name]");
    if (name && name.textContent !== String(live.name || "")) {
      name.textContent = String(live.name || "");
      pop(name);
    }
  }

  /**
   * Die Lokale treffen ein - eines nach dem anderen, mit ihrem Namen.
   *
   * Der Zaehler laeuft bis results.length und keinen Schritt weiter, und jeder
   * Name gehoert zu dem Angebot, das der Gast gleich sehen wird. Damit ist die
   * Animation eine Anzeige und keine Verzierung.
   */
  function runArrivals(current, results = []) {
    current.results = Array.isArray(results) ? results : [];
    track("go_results", { count: current.results.length });

    // Ohne Angebot gibt es nichts zurueckzuhalten: Der eine ehrliche Satz
    // steht sofort da, statt dass jemand fuenf Sekunden auf ein Nichts wartet.
    if (!current.results.length) {
      stopLive();
      current.view = "results";
      render();
      return;
    }

    current.live.total = current.results.length;
    current.results.forEach((result, index) => {
      queue(() => {
        if (current.view !== "matching") return;
        current.live.count = index + 1;
        current.live.name = String(result.businessName || "");
        paintLive();
        if (index !== current.results.length - 1) return;
        queue(() => {
          if (current.view !== "matching") return;
          current.live.done = true;
          liveIntervals.forEach((id) => clock.clearInterval(id));
          liveIntervals = [];
          paintLive();
        }, LIVE_HOLD_MS);
      }, index * LIVE_ARRIVE_MS);
    });
  }

  async function submitSearch() {
    const current = view();
    if (!current) return;
    stopLive();
    current.view = "matching";
    current.error = "";
    current.notice = "";
    current.results = [];
    current.live = { count: 0, total: 0, name: "", seconds: LIVE_SEND_SECONDS, done: false };
    render();

    const request = buildRequest(current);
    track("go_search", { partySize: request.partySize, intent: request.intent });

    // Die Uhr laeuft, waehrend der Server rechnet - und die Symbole im Kopf
    // wechseln, damit die Karte nicht wie eingefroren aussieht.
    liveIntervals.push(clock.setInterval(() => {
      if (current.view !== "matching") return stopLive();
      if (current.live.count > 0) return undefined;
      current.live.seconds = Math.max(0, (Number(current.live.seconds) || 0) - 1);
      paintLive();
      return undefined;
    }, 1000));
    let iconIndex = 0;
    liveIntervals.push(clock.setInterval(() => {
      const badge = node("[data-go-live-icon]");
      if (!badge) return;
      iconIndex = (iconIndex + 1) % GO_LIVE_ICONS.length;
      badge.setAttribute("data-go-live-icon", String(iconIndex));
    }, LIVE_ICON_MS));

    const startedAt = nowFn();
    let found = null;
    try {
      found = await client.search(request);
    } catch (error) {
      fail(current, error);
      return;
    }
    // Zwischendurch kann der Gast abgebrochen oder die Seite verlassen haben.
    if (current.view !== "matching") return;
    queue(
      () => runArrivals(current, found?.results || []),
      Math.max(0, LIVE_SEND_MS - (nowFn() - startedAt))
    );
  }

  /**
   * "Shiko ofertat": Jetzt gehoeren die Angebote dem Gast.
   *
   * Die Seite faehrt dabei zum ersten Angebot hinunter - der Knopf steht oben
   * in der Karte, die Angebote stehen unten im Bento, und dazwischen liegt der
   * Weg, den sonst der Daumen suchen muesste. Gescrollt wird erst, wenn die
   * Knoten stehen (siehe renderGoPageView).
   */
  function openResults() {
    const current = view();
    if (!current) return;
    stopLive();
    current.view = "results";
    current.pendingScroll = true;
    render();
  }

  function scrollToFirstResult() {
    const target = node("[data-go-result]");
    if (!target?.scrollIntoView) return;
    try {
      target.scrollIntoView({
        behavior: prefersReducedMotion() ? "auto" : "smooth",
        block: "start"
      });
    } catch {
      target.scrollIntoView();
    }
  }

  async function acceptOffer(offerId = "", restaurantId = "") {
    const current = view();
    if (!current || !offerId || current.busyOfferId) return;
    current.busyOfferId = offerId;
    current.error = "";
    render();

    if (!idempotencyByOffer.has(offerId)) {
      idempotencyByOffer.set(offerId, createGoIdempotencyKey(win?.crypto));
    }
    track("go_offer_accept", { offerId });

    try {
      const result = await client.createBooking({
        offerId,
        restaurantId,
        request: buildRequest(current),
        idempotencyKey: idempotencyByOffer.get(offerId)
      });
      const booking = result?.booking || null;
      if (!booking) throw new Error("go-booking-missing");

      // Der geheime Link kommt genau einmal. Beim Wiederverwenden einer
      // Buchung kennt der Browser ihn bereits.
      const token = String(result.bookingToken || "").trim()
        || readGoActiveBookings().find((entry) => entry.bookingId === booking.id)?.bookingToken
        || "";

      rememberGoBooking({
        bookingId: booking.id,
        bookingToken: token,
        shortCode: booking.shortCode,
        restaurantId: booking.restaurantId,
        businessName: booking.businessName,
        benefitLabel: booking.benefitLabel,
        type: booking.type,
        status: booking.status,
        partySize: booking.partySize,
        expectedArrivalAt: booking.expectedArrivalAt
      });

      current.booking = booking;
      current.bookingToken = token;
      // Ein frisch geoeffneter Vorgang hat noch nichts kopiert.
      current.linkCopied = false;
      current.view = "booking";
      current.busyOfferId = "";
      current.canSignIn = !isSignedInFn();
      render();
      track("go_booking_created", { offerId, restaurantId });
    } catch (error) {
      if (error?.soldOut) {
        // Voll geworden, waehrend der Gast hinsah: der eine ehrliche Satz und
        // sofort Alternativen (Punkt 28, 119).
        current.view = "error";
        current.error = error.message;
        current.alternatives = error.alternatives || [];
        current.busyOfferId = "";
        if (current.alternatives.length) current.pendingScroll = true;
        releaseIdempotencyKey(offerId, error);
        render();
        return;
      }
      releaseIdempotencyKey(offerId, error);
      fail(current, error);
    }
  }

  /**
   * Eine Oferta aus einem Link oeffnen.
   *
   * Der Token im Fragment ist der Schluessel - mehr braucht es nicht. Deshalb
   * funktioniert der Link auf jedem Geraet, im privaten Fenster und auf dem
   * Telefon eines Freundes, dem der Gast ihn weitergegeben hat.
   *
   * Danach wird das Fragment aus der Adresse genommen. Nicht aus Scham,
   * sondern damit der Token nicht in der Verlaufsliste stehen bleibt und beim
   * naechsten Teilen der Seite mitgeht. Gemerkt hat der Browser ihn zu dem
   * Zeitpunkt schon.
   */
  async function openBookingFromLink(bookingToken = "") {
    const current = view();
    const token = String(bookingToken || "").trim();
    if (!current || !token) return;

    current.view = "loading";
    render();
    try {
      const booking = await client.getBooking(token);
      if (!booking) throw new Error("go-booking-missing");
      rememberGoBooking({
        bookingId: booking.id,
        bookingToken: token,
        shortCode: booking.shortCode,
        restaurantId: booking.restaurantId,
        businessName: booking.businessName,
        benefitLabel: booking.benefitLabel,
        type: booking.type,
        status: booking.status,
        partySize: booking.partySize,
        expectedArrivalAt: booking.expectedArrivalAt
      });
      current.booking = booking;
      current.bookingToken = token;
      // Ein frisch geoeffneter Vorgang hat noch nichts kopiert.
      current.linkCopied = false;
      current.view = "booking";
      current.canSignIn = !isSignedInFn();
      render();
    } catch (error) {
      if (error?.code === "not-found") {
        // Ein Link, der ins Leere zeigt, ist kein Absturz: Der Gast landet auf
        // der Suche und kann von vorn anfangen.
        current.view = "search";
        current.notice = "";
        render();
        return;
      }
      fail(current, error);
    }
  }

  function takeBookingLinkToken() {
    const win = typeof window === "undefined" ? null : window;
    const token = readGoBookingLinkToken(String(win?.location?.hash || ""));
    if (!token) return "";
    try {
      win.history?.replaceState?.(
        win.history.state,
        "",
        `${win.location.pathname || "/"}${win.location.search || ""}`
      );
    } catch {
      // Ohne Verlaufszugriff bleibt das Fragment stehen. Der Link
      // funktioniert trotzdem - nur die Adresse ist haesslicher.
    }
    return token;
  }

  async function openBooking(bookingId = "") {
    const current = view();
    if (!current) return;
    const remembered = readGoActiveBookings().find((entry) => entry.bookingId === bookingId)
      || readGoActiveBookings()[0]
      || null;
    if (!remembered) return;

    current.view = "loading";
    current.confirmCancel = false;
    render();

    try {
      // Der Server ist die Wahrheit: Was im Browser liegt, ist nur die
      // Erinnerung daran, dass es eine Buchung gibt (Punkt 41).
      const booking = await client.getBooking(remembered.bookingToken);
      if (!booking) throw new Error("go-booking-missing");
      syncGoBookingStatus(booking);
      current.booking = { ...remembered, ...booking };
      current.bookingToken = remembered.bookingToken;
      // Ein frisch geoeffneter Vorgang hat noch nichts kopiert.
      current.linkCopied = false;
      current.view = "booking";
      current.canSignIn = !isSignedInFn();
      render();
    } catch (error) {
      if (error?.code === "not-found") {
        forgetGoBooking(bookingId);
        current.view = "search";
        current.notice = "";
        render();
        return;
      }
      fail(current, error);
    }
  }

  /**
   * Der Wisch.
   *
   * Er wird hier einmal abgefangen und einmal weitergegeben. Alles Weitere -
   * ob die Frist noch laeuft, ob schon aktiviert wurde, ob es einen Code gibt -
   * entscheidet der Server; der Browser glaubt seinem eigenen Zustand nicht.
   */
  async function activateBooking() {
    const current = view();
    if (!current?.bookingToken || current.activating) return;
    // Uebersetzt gelesen, genau wie beim Zeichnen der Karte. Sonst zeigt die
    // Seite die Bahn (sie normalisiert) und der Wisch tut nichts (er
    // normalisierte nicht): Ein Server, der noch "confirmed" schickt, liess
    // den Gast bis zum Anschlag ziehen, ohne dass etwas passierte.
    if (normalizeGoBookingStatus(current.booking?.status) !== "accepted") return;
    current.activating = true;
    render();
    try {
      const booking = await client.activateBooking(current.bookingToken);
      current.booking = booking;
      syncGoBookingStatus(booking);
      track("go_activated", { bookingId: booking?.id || "" });
      current.activating = false;
      render();
    } catch (error) {
      current.activating = false;
      // Ein abgelaufener Wisch ist kein Absturz: Die Buchung steht danach auf
      // "skaduar", und genau das soll der Gast lesen - nicht "Mnyra GO ist
      // voruebergehend nicht verfuegbar".
      if (error?.details?.expired) {
        current.booking = { ...(current.booking || {}), status: "expired" };
        render();
        return;
      }
      fail(current, error);
    }
  }

  async function cancelBooking() {
    const current = view();
    if (!current?.bookingToken) return;
    current.view = "loading";
    render();
    try {
      const booking = await client.cancelBooking(current.bookingToken);
      forgetGoBooking(current.booking?.id || "");
      track("go_cancel", { bookingId: current.booking?.id || "" });
      current.booking = booking;
      current.confirmCancel = false;
      current.view = "search";
      current.form.step = GO_STEPS[0];
      current.form.city = current.form.city || getCityFn();
      render();
    } catch (error) {
      fail(current, error);
    }
  }

  function setForm(current, patch = {}) {
    Object.assign(current.form, patch);
    render();
  }

  // Eine angetippte Pille IST die Antwort - danach steht die naechste Frage
  // da. Nur "Më vonë" bleibt stehen: es hat erst eine Antwort, wenn auch die
  // Uhrzeit da ist.
  function answerAndAdvance(current, patch = {}, { hold = false } = {}) {
    Object.assign(current.form, patch);
    if (!hold) current.form.step = nextGoStep(current.form.step);
    render();
  }

  // -------------------------------------------------------------------------
  // Die Raeder
  // -------------------------------------------------------------------------

  // Welches Rad welche Antwort einstellt. Zahlen kommen als Zahl heraus, alles
  // andere als zweistellige Zeichenkette - so, wie es der Aufbau erwartet.
  // Nur noch eines. Das Rad fuer Stunde und Minute gehoerte zur Frage "Kur?".
  const WHEELS = Object.freeze({
    party: (form, value) => { form.partySize = clampGoPartySize(value); }
  });

  function wheelItems(list) {
    return Array.from(list?.querySelectorAll?.("[data-go-wheel-pick]") || []);
  }

  /**
   * Ein Rad auf seinen Wert stellen - ohne Neuaufbau.
   *
   * Der sichtbare Wert steht an drei Stellen: in der Liste (aria-selected), am
   * Rad selbst (data-go-wheel-value, damit das Scrollen weiss, ob sich etwas
   * geaendert hat) und im Kopf der Karte noch einmal.
   *
   * Die dritte ist keine Zierde: Der Daumen liegt beim Drehen auf dem Rad und
   * verdeckt die Zeile darin. Oben rechts steht die Zahl frei.
   */
  function markWheel(list, value) {
    if (!list) return;
    list.setAttribute("data-go-wheel-value", String(value));
    wheelItems(list).forEach((item) => {
      const own = item.getAttribute("data-go-wheel-pick") || "";
      item.setAttribute("aria-selected", own === String(value) ? "true" : "false");
    });

    if (!state?.go?.form) return;
    if (list.getAttribute("data-go-wheel") !== "party") return;
    const output = node("[data-go-party-value]");
    if (!output) return;
    const size = clampGoPartySize(value);
    output.innerHTML = `<b>${size}</b> ${goPartyWord(size)}`;
  }

  /**
   * Die gewaehlte Zeile in die Mitte stellen.
   *
   * Aufgerufen nach jedem Aufbau: Ein frisch gezeichnetes Rad steht auf 0, und
   * das waere immer die erste Zeile - "1 person", egal was eingestellt war.
   */
  function armWheels() {
    const lists = doc?.querySelectorAll?.("[data-go-wheel]");
    if (!lists) return;
    Array.from(lists).forEach((list) => {
      const value = list.getAttribute("data-go-wheel-value") || "";
      const index = wheelItems(list).findIndex(
        (item) => (item.getAttribute("data-go-wheel-pick") || "") === value
      );
      if (index < 0) return;
      list.scrollTop = index * GO_WHEEL_ITEM_HEIGHT;
    });
  }

  /**
   * Was unter dem Band steht, ist die Antwort.
   *
   * Waehrend das Rad laeuft, wird nicht neu gezeichnet - ein Neuaufbau nimmt
   * dem Finger den Schwung, den er dem Rad gerade gegeben hat. Es geht nur der
   * Zustand mit.
   */
  function readWheel(list) {
    const current = state?.go;
    const name = list?.getAttribute?.("data-go-wheel") || "";
    const apply = WHEELS[name];
    if (!current || !apply) return;
    const items = wheelItems(list);
    if (!items.length) return;
    const index = Math.min(
      items.length - 1,
      Math.max(0, Math.round((list.scrollTop || 0) / GO_WHEEL_ITEM_HEIGHT))
    );
    const value = items[index].getAttribute("data-go-wheel-pick") || "";
    if (value === list.getAttribute("data-go-wheel-value")) return;
    apply(current.form, value);
    markWheel(list, value);
  }

  function pickWheelValue(item) {
    const list = item.closest("[data-go-wheel]");
    const value = item.getAttribute("data-go-wheel-pick") || "";
    const current = state?.go;
    const apply = WHEELS[list?.getAttribute?.("data-go-wheel") || ""];
    if (!list || !current || !apply) return;
    apply(current.form, value);
    markWheel(list, value);
    const index = wheelItems(list).indexOf(item);
    if (index < 0) return;
    const top = index * GO_WHEEL_ITEM_HEIGHT;
    if (typeof list.scrollTo === "function") {
      list.scrollTo({ top, behavior: prefersReducedMotion() ? "auto" : "smooth" });
      return;
    }
    list.scrollTop = top;
  }

  // -------------------------------------------------------------------------
  // Die Staedteliste
  // -------------------------------------------------------------------------

  /**
   * Suchen heisst hier ausblenden, nicht neu bauen: Ein Neuaufbau bei jedem
   * Buchstaben naehme dem Feld die Tastatur und dem Wort die Einfuegemarke.
   */
  function filterCityList(query = "") {
    const wanted = String(query || "").trim().toLowerCase();
    const options = Array.from(doc?.querySelectorAll?.("[data-go-city]") || []);
    let exact = false;
    options.forEach((option) => {
      const name = option.getAttribute("data-go-city-name") || "";
      if (name === wanted) exact = true;
      option.hidden = Boolean(wanted) && !name.includes(wanted);
    });
    const free = node("[data-go-city-free]");
    if (!free) return;
    // Die letzte Zeile nimmt an, was in keiner Liste steht - sonst waere die
    // Liste eine Schranke fuer jeden, der nicht in einer der grossen Staedte
    // wohnt.
    free.hidden = !wanted || exact;
    const label = node("[data-go-city-free-label]");
    if (label) label.textContent = `${GO_PAGE_TEXTS.cityUse}: ${String(query || "").trim()}`;
  }

  function chooseCity(current, value = "") {
    const city = String(value || "").trim();
    if (!city) return;
    setForm(current, { city, citySelect: false, citySearch: "" });
  }

  /**
   * Hier stand ensureLaterDefaults: Es hat Datum und Uhrzeit vorbelegt, sobald
   * jemand "Më vonë" antippte - die naechste halbe Stunde in einer Stunde,
   * nicht 19:00, weil wer um 22:30 sucht nicht den Abend von gestern meint.
   *
   * Mit "Kur?" ist auch das weg. Der Gast waehlt keine Zeit mehr; seine Oferta
   * gilt 24 Stunden ab dem Augenblick, in dem er zugreift.
   */

  // -------------------------------------------------------------------------
  // Die Bildergeschichte im Bento
  // -------------------------------------------------------------------------

  function prefersReducedMotion() {
    try {
      return win?.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches === true;
    } catch {
      return false;
    }
  }

  /**
   * Deckt die Bilder auf, sobald sie ins Bild kommen.
   *
   * Was aufgedeckt ist, wird im Zustand vermerkt und nicht nur im DOM: Jede
   * Antwort auf eine Frage zeichnet die Seite neu, und ein Aufdecken, das nur
   * am Knoten haengt, finge dann jedes Mal von vorne an.
   *
   * Aufgerufen nach jedem Aufbau - die Knoten sind dann neu und muessen neu
   * beobachtet werden. Der Beobachter wird dafuer weggeworfen und nicht
   * weiterverwendet: er haelt sonst die alten, laengst ersetzten Knoten fest.
   */
  function armStoryReveal() {
    const current = state?.go;
    if (!doc?.querySelectorAll || !current) return;
    if (storyObserver) {
      storyObserver.disconnect();
      storyObserver = null;
    }
    // Beobachtet werden die STUECKE, nicht die Kapitel: jedes Bild und jeder
    // Satz einzeln. So kommt beim Scrollen eines nach dem anderen herein -
    // Bild, ein Stueck weiter der Satz, ein Stueck weiter das naechste Bild.
    // Beobachtete man das Kapitel, erschiene es als Ganzes, und wer scrollt,
    // saehe entweder alles oder nichts.
    const pending = Array.from(doc.querySelectorAll("[data-go-reveal]"))
      .filter((part) => part.getAttribute("data-go-reveal-in") !== "1");
    if (!pending.length) return;

    const markShown = (part) => {
      part.setAttribute("data-go-reveal-in", "1");
      const index = Number(part.getAttribute("data-go-reveal"));
      if (!Number.isInteger(index)) return;
      if (!Array.isArray(current.storyShown)) current.storyShown = [];
      if (!current.storyShown.includes(index)) current.storyShown.push(index);
    };

    // Ohne Beobachter oder ohne Bewegungswunsch steht alles sofort da. Eine
    // Erklaerung, die man nicht sieht, ist keine.
    if (typeof IntersectionObserver === "undefined" || prefersReducedMotion()) {
      pending.forEach(markShown);
      return;
    }

    /**
     * Aufdecken heisst: dieses Stueck UND alles darueber.
     *
     * Der Grund ist ein schneller Wisch. Ein Beobachter meldet, was in einem
     * Einzelbild zu sehen ist - fliegt die Seite mit einem Schwung durch, war
     * ein Stueck dazwischen in keinem einzigen davon zu sehen und bliebe fuer
     * immer unsichtbar. Das ist kein gedachter Fall: Er faellt schon beim
     * Sprung ans Seitenende auf.
     *
     * Die Stuecke stehen untereinander in ihrer Reihenfolge. Ist Nummer fuenf
     * im Blick, ist man an eins bis vier vorbeigekommen - sie duerfen nicht
     * mehr warten.
     */
    const revealUpTo = (part, observer) => {
      const stop = pending.indexOf(part);
      if (stop < 0) return;
      pending.slice(0, stop + 1).forEach((entry) => {
        if (entry.getAttribute("data-go-reveal-in") === "1") return;
        markShown(entry);
        observer.unobserve(entry);
      });
    };

    // Der untere Rand ist eingezogen (-12%): Ein Stueck deckt sich auf, wenn
    // es wirklich im Blick ist, nicht schon wenn seine Oberkante den unteren
    // Bildschirmrand streift.
    storyObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        revealUpTo(entry.target, observer);
      });
    }, { root: null, rootMargin: "0px 0px -12% 0px", threshold: 0.15 });
    pending.forEach((part) => storyObserver.observe(part));
  }

  function bindDelegatedEvents() {
    if (!doc || delegationBound) return;
    delegationBound = true;

    doc.addEventListener("click", (event) => {
      const current = view();
      if (!current) return;
      const target = event.target;
      if (!target || typeof target.closest !== "function") return;
      // Nur innerhalb der GO-Seite: ein Klick woanders geht uns nichts an.
      if (!target.closest("[data-go-page]")) return;

      const intent = target.closest("[data-go-intent]");
      if (intent) {
        return answerAndAdvance(current, { intent: intent.getAttribute("data-go-intent") || "unsure" });
      }

      const pick = target.closest("[data-go-wheel-pick]");
      if (pick) return pickWheelValue(pick);

      // Vor und zurueck durch die Fragen. Der Pfeil geht immer genau einen
      // Schritt - und die Staedteliste ist ein solcher Schritt, sonst faende
      // niemand aus ihr heraus.
      if (target.closest("[data-go-step-next]")) {
        return setForm(current, { step: nextGoStep(current.form.step) });
      }
      if (target.closest("[data-go-step-back]")) {
        const form = current.form;
        if (form.citySelect) return setForm(current, { citySelect: false });
        return setForm(current, { step: previousGoStep(form.step) });
      }

      if (target.closest("[data-go-change-city]")) {
        return setForm(current, { citySelect: true, citySearch: "" });
      }
      const city = target.closest("[data-go-city]");
      if (city) return chooseCity(current, city.getAttribute("data-go-city") || "");
      if (target.closest("[data-go-city-free]")) return chooseCity(current, current.form.citySearch);
      if (target.closest("[data-go-city-save]")) return setForm(current, { citySelect: false, citySearch: "" });

      if (target.closest("[data-go-submit]") || target.closest("[data-go-retry]")) return submitSearch();
      if (target.closest("[data-go-live-open]")) return openResults();
      if (target.closest("[data-go-live-cancel]")) {
        stopLive();
        current.form.step = GO_STEPS[GO_STEPS.length - 1];
        current.view = "search";
        return render();
      }
      if (target.closest("[data-go-back]")) {
        // Zurueck aus dem Ergebnis heisst "eine Kleinigkeit anders", nicht
        // "von vorn": der letzte Schritt steht da, und darueber der Merkzettel
        // mit allen Antworten.
        current.form.step = GO_STEPS[GO_STEPS.length - 1];
        current.view = "search";
        return render();
      }

      const accept = target.closest("[data-go-accept]");
      if (accept) {
        return acceptOffer(
          accept.getAttribute("data-go-accept") || "",
          accept.getAttribute("data-go-restaurant") || ""
        );
      }

      const copy = target.closest("[data-go-link-copy]");
      if (copy) {
        const link = copy.getAttribute("data-go-link") || "";
        // Die Zwischenablage kann fehlen oder verweigert werden - dann bleibt
        // der Link trotzdem lesbar auf der Seite stehen und der Gast markiert
        // ihn von Hand. Ein Fehler ist das nicht.
        Promise.resolve(win?.navigator?.clipboard?.writeText?.(link))
          .then(() => {
            current.linkCopied = true;
            render();
          })
          .catch(() => {});
        return undefined;
      }

      if (target.closest("[data-go-cancel-dismiss]")) {
        current.confirmCancel = false;
        return render();
      }
      // Der Knopf statt der Bahn - fuer alle, die Bewegung abbestellt haben.
      if (target.closest("[data-go-activate]")) return activateBooking();
      if (target.closest("[data-go-cancel-confirm]")) return cancelBooking();
      if (target.closest("[data-go-cancel]")) {
        current.confirmCancel = true;
        return render();
      }

      if (target.closest("[data-go-menu]") && openMenuFn) {
        return openMenuFn(current.booking?.restaurantId || "");
      }
      if (target.closest("[data-go-signin]") && openSignInFn) return openSignInFn();
      if (target.closest("[data-go-directions]")) {
        const query = encodeURIComponent(
          [current.booking?.businessName, current.booking?.city].filter(Boolean).join(" ")
        );
        if (win && query) win.open(`https://www.google.com/maps/search/?api=1&query=${query}`, "_blank", "noopener");
      }
    });

    // Waehrend das Rad laeuft und getippt wird, wird NICHT neu gezeichnet -
    // sonst verliert der Finger den Schwung und das Feld die Tastatur. Es geht
    // nur der Zustand mit, und von Hand das Stueck Anzeige, das sich mit ihm
    // aendert.
    doc.addEventListener("input", (event) => {
      const current = view();
      const input = event.target;
      if (!current || !input || typeof input.matches !== "function") return;
      if (typeof input.closest === "function" && !input.closest("[data-go-page]")) return;
      if (!input.matches("[data-go-city-input]")) return;
      current.form.citySearch = input.value || "";
      filterCityList(input.value || "");
    });

    // ---------------------------------------------------------------------
    // Der Wisch
    //
    // Er wird von Hand gezeichnet und nicht ueber den Zustand: Waehrend der
    // Daumen zieht, darf die Seite sich nicht neu aufbauen - sonst waere der
    // Griff bei jedem Bild wieder links. Erst der Erfolg loest ein Neuzeichnen
    // aus, und dann steht dort ohnehin der Code statt der Bahn.
    //
    // Die Schwelle liegt bei 90 % der Bahn. Sie ist mit Absicht hoch: Ein
    // halber Wisch in der Hosentasche soll den Code nicht freigeben.
    // ---------------------------------------------------------------------
    // Die Bahn muss zu neunzig Prozent durchgezogen werden. Sie ist mit
    // Absicht hoch: Ein halber Wisch in der Hosentasche soll den Code nicht
    // freigeben.
    const SWIPE_THRESHOLD = 0.9;
    // Die Geometrie der Bahn, dieselben Zahlen wie im Stylesheet: 62px hoch,
    // Griff 56px, 3px Rand links und rechts.
    const SWIPE_KNOB = 56;
    const SWIPE_EDGE = 3;
    let swipe = null;

    function swipeTravel(track) {
      const width = Number(track?.clientWidth) || 0;
      return Math.max(1, width - SWIPE_KNOB - 2 * SWIPE_EDGE);
    }

    function paintSwipe(track, ratio) {
      const knob = track?.querySelector?.("[data-go-swipe-knob]");
      const fill = track?.querySelector?.("[data-go-swipe-fill]");
      const travel = swipeTravel(track) * Math.min(1, Math.max(0, Number(ratio) || 0));
      if (knob?.style) knob.style.transform = `translateX(${travel}px)`;
      if (fill?.style) fill.style.width = `${travel + SWIPE_KNOB}px`;
    }

    /**
     * Wie weit der Griff steht, gemessen an der Bahn - nicht am Finger.
     *
     * Der Unterschied ist der Fall, an dem die erste Fassung scheiterte: Sie
     * rechnete die Strecke ab dem Punkt, an dem der Finger aufsetzte. Wer die
     * Bahn nicht am Griff anfasste, sondern weiter rechts, hatte damit von
     * vornherein zu wenig Weg vor sich und kam nie ans Ende - er zog "bis zum
     * Anschlag", und der Anschlag war nicht der der Bahn, sondern der seines
     * Armes.
     *
     * Jetzt zaehlt, wo der Griff steht. Wo der Finger ihn gepackt hat, geht
     * nur noch als Versatz ein, damit der Griff nicht unter den Daumen
     * springt.
     */
    function swipeRatio(event) {
      if (!swipe) return 0;
      const x = Number(event?.clientX);
      if (!Number.isFinite(x)) return 0;
      return (x - swipe.left - SWIPE_EDGE - swipe.grab) / swipeTravel(swipe.track);
    }

    function endSwipe(done) {
      if (!swipe) return;
      const track = swipe.track;
      swipe = null;
      if (done) {
        paintSwipe(track, 1);
        activateBooking();
        return;
      }
      // Nicht weit genug: Der Griff faellt zurueck. Kein Fehler, keine
      // Meldung - der Gast sieht selbst, dass nichts passiert ist.
      paintSwipe(track, 0);
    }

    doc.addEventListener("pointerdown", (event) => {
      const target = event.target;
      if (!target?.closest) return;
      const track = target.closest("[data-go-swipe]");
      if (!track || track.getAttribute("data-go-swipe-busy") === "1") return;

      const rect = track.getBoundingClientRect?.() || { left: 0 };
      const left = Number(rect.left) || 0;
      const x = Number(event.clientX) || 0;
      swipe = {
        track,
        left,
        pointerId: event.pointerId,
        // Wo innerhalb des Griffs der Finger sitzt. Wer die Bahn daneben
        // anfasst, bekommt den Griff mittig unter den Finger gelegt statt an
        // seinen Rand - sonst springt er um seine halbe Breite.
        grab: Math.min(SWIPE_KNOB, Math.max(0, x - left - SWIPE_EDGE))
      };
      // Der Griff behaelt den Zeiger, auch wenn der Finger die Bahn verlaesst.
      // Ohne das endet der Wisch, sobald jemand leicht nach oben zieht.
      const knob = track.querySelector?.("[data-go-swipe-knob]");
      try { knob?.setPointerCapture?.(event.pointerId); } catch { /* aelterer Browser */ }
      paintSwipe(track, swipeRatio(event));
    });

    doc.addEventListener("pointermove", (event) => {
      if (!swipe || event.pointerId !== swipe.pointerId) return;
      // Sonst deutet der Browser den Zug als Auswahl oder als eigenes Wischen.
      if (typeof event.preventDefault === "function") event.preventDefault();
      paintSwipe(swipe.track, swipeRatio(event));
    });

    doc.addEventListener("pointerup", (event) => {
      if (!swipe || event.pointerId !== swipe.pointerId) return;
      endSwipe(swipeRatio(event) >= SWIPE_THRESHOLD);
    });

    // Der Browser nimmt den Zeiger an sich - beim Scrollen, bei einem Anruf,
    // beim Wechsel der App. Der Griff faellt dann zurueck.
    doc.addEventListener("pointercancel", (event) => {
      if (!swipe || event.pointerId !== swipe.pointerId) return;
      endSwipe(false);
    });

    // Ein Rad meldet sich nur beim Scrollen, und Scrollen steigt nicht auf -
    // deshalb wird es in der Fangphase gehoert.
    doc.addEventListener("scroll", (event) => {
      const list = event.target;
      if (!list?.getAttribute?.("data-go-wheel")) return;
      readWheel(list);
    }, true);

    // Enter im Stadtfeld heisst "fertig": Was dort steht, ist die Stadt - auch
    // wenn sie in keiner Liste steht.
    doc.addEventListener("keydown", (event) => {
      const current = view();
      const input = event.target;
      if (!current || event.key !== "Enter") return;
      if (!input || typeof input.matches !== "function" || !input.matches("[data-go-city-input]")) return;
      event.preventDefault();
      chooseCity(current, input.value || "");
    });
  }

  /**
   * Die Seite. Beim ersten Aufruf wird die Gastsitzung im Hintergrund geholt -
   * der Gast wartet nicht darauf, und ein Fehlschlag hier stoppt nichts.
   */
  function renderGoPageView() {
    bindDelegatedEvents();
    const current = view();
    if (!current) return "";
    current.nowMs = nowFn();
    // Der Link entsteht aus dem Token, den der Browser ohnehin hat - er wird
    // nirgends gespeichert. Ohne Token gibt es keinen, und dann steht der
    // Kasten auch nicht da.
    current.bookingLink = current.bookingToken
      ? buildGoBookingLink(current.bookingToken, {
        origin: (typeof window === "undefined" ? "" : window?.location?.origin) || ""
      })
      : "";
    // Bis wann die Oferta gilt. Gerechnet wird aus der Frist, die am Dokument
    // steht - nicht aus der Uhr des Telefons (Punkt 57).
    current.validUntil = current.booking
      ? goValidUntilLabel(current.booking, { nowMs: current.nowMs })
      : "";
    if (!current.opened) {
      current.opened = true;
      current.form.city = current.form.city || getCityFn();
      current.canSignIn = !isSignedInFn();
      track("go_open", {});
      client.ensureGuestSession().catch(() => {});
    }
    // Beides erst nach diesem Aufbau: Der Aufbau liefert nur eine
    // Zeichenkette, die Knoten dazu setzt die Huelle danach. Ein Microtask
    // laeuft, wenn sie damit fertig ist - vorher gaebe es nichts zu
    // beobachten, und openBooking zeichnete mitten im Zeichnen neu.
    const pendingBookingId = String(takePendingBookingId() || "").trim();
    // Ein Link schlaegt alles andere: Wer eine Adresse mit seiner Oferta
    // geoeffnet hat, will genau die sehen und nicht die Suche.
    const linkToken = current.linkTokenTaken ? "" : takeBookingLinkToken();
    current.linkTokenTaken = true;
    const pendingScroll = current.pendingScroll === true;
    current.pendingScroll = false;
    Promise.resolve().then(() => {
      armStoryReveal();
      // Ein frisch gezeichnetes Rad steht auf der ersten Zeile, egal was
      // eingestellt war - es muss auf seinen Wert gestellt werden.
      armWheels();
      if (pendingScroll) scrollToFirstResult();
      if (linkToken) return openBookingFromLink(linkToken);
      if (pendingBookingId) return openBooking(pendingBookingId);
      return undefined;
    }).catch(() => {});
    return renderGoPageCore(current);
  }

  return Object.freeze({
    renderGoPageView,
    openBooking,
    __view: view,
    __submitSearch: submitSearch,
    __openResults: openResults,
    __acceptOffer: acceptOffer
  });
}
