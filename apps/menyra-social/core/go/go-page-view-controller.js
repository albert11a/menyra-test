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
//   view = "search" | "loading" | "results" | "booking" | "error"
//
// "loading" ist ein eigener Zustand und kein Beiwerk: Zwischen "wird
// gesendet" und "bestaetigt" wird nie geschummelt (Punkt 140).

import {
  GO_STEPS,
  clampGoPartySize,
  goPartyFillPercent,
  goPartyLabel,
  goPartyWord,
  nextGoStep,
  previousGoStep,
  renderGoPageCore,
  resolveGoStep
} from "./go-page-render-utils.js";
import { createGoApiClient } from "./go-api-client.js";
import {
  createGoIdempotencyKey,
  forgetGoBooking,
  readGoActiveBookings,
  rememberGoBooking,
  syncGoBookingStatus
} from "./go-client-store.js";

function asFn(candidate, fallback) {
  return typeof candidate === "function" ? candidate : fallback;
}

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
  nowFn = () => Date.now()
} = {}) {
  const doc = documentObj || (typeof document === "undefined" ? null : document);
  const win = windowObj || (typeof window === "undefined" ? null : window);
  const client = api || createGoApiClient();
  const render = asFn(renderFn, () => {});
  const track = asFn(onAnalyticsFn, () => {});
  const takePendingBookingId = asFn(takePendingBookingIdFn, () => "");

  let delegationBound = false;

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
          category: "all",
          when: "now",
          laterValue: "",
          city: "",
          editCity: false
        },
        results: [],
        alternatives: [],
        booking: null,
        bookingToken: "",
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
    current.view = "error";
    current.error = String(error?.message || "").trim();
    current.alternatives = Array.isArray(error?.alternatives) ? error.alternatives : [];
    current.busyOfferId = "";
    render();
  }

  function buildRequest(current) {
    const form = current.form;
    const offsets = { now: 0, in30: 30, in60: 60 };
    let requestedAt = nowFn();
    if (form.when === "later" && form.laterValue) {
      const parsed = Date.parse(form.laterValue);
      if (Number.isFinite(parsed)) requestedAt = parsed;
    } else {
      requestedAt += (offsets[form.when] || 0) * 60 * 1000;
    }
    const coords = getCoordsFn();
    return {
      city: String(form.city || "").trim() || getCityFn(),
      partySize: clampGoPartySize(form.partySize),
      category: form.category,
      requestedAt,
      // Der Standort ist freiwillig. Ohne ihn funktioniert GO vollstaendig,
      // nur ohne Entfernungsangabe (Punkt 13).
      lat: coords?.lat,
      lng: coords?.lng
    };
  }

  async function submitSearch() {
    const current = view();
    if (!current) return;
    current.view = "loading";
    current.error = "";
    render();
    const request = buildRequest(current);
    track("go_search", { partySize: request.partySize, category: request.category });
    try {
      const found = await client.search(request);
      current.results = found.results;
      current.view = "results";
      current.notice = "";
      render();
      track("go_results", { count: found.results.length });
    } catch (error) {
      fail(current, error);
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
      current.view = "booking";
      current.busyOfferId = "";
      current.canSignIn = !isSignedInFn();
      render();
      track("go_booking_created", { offerId, type: booking.type });
    } catch (error) {
      if (error?.soldOut) {
        // Voll geworden, waehrend der Gast hinsah: der eine ehrliche Satz und
        // sofort Alternativen (Punkt 28, 119).
        current.view = "error";
        current.error = error.message;
        current.alternatives = error.alternatives || [];
        current.busyOfferId = "";
        releaseIdempotencyKey(offerId, error);
        render();
        return;
      }
      releaseIdempotencyKey(offerId, error);
      fail(current, error);
    }
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

      const category = target.closest("[data-go-category]");
      if (category) {
        return answerAndAdvance(current, { category: category.getAttribute("data-go-category") || "all" });
      }

      const when = target.closest("[data-go-when]");
      if (when) {
        const value = when.getAttribute("data-go-when") || "now";
        return answerAndAdvance(current, { when: value }, { hold: value === "later" });
      }

      // Vor und zurueck durch die Fragen. "goto" springt auf eine schon
      // gegebene Antwort - der Weg zurueck aus dem Merkzettel oben.
      if (target.closest("[data-go-step-next]")) {
        return setForm(current, { step: nextGoStep(current.form.step), editCity: false });
      }
      if (target.closest("[data-go-step-back]")) {
        return setForm(current, { step: previousGoStep(current.form.step), editCity: false });
      }
      const goto = target.closest("[data-go-goto]");
      if (goto) {
        return setForm(current, { step: resolveGoStep(goto.getAttribute("data-go-goto") || ""), editCity: false });
      }

      if (target.closest("[data-go-change-city]")) return setForm(current, { editCity: true });
      if (target.closest("[data-go-city-save]")) return setForm(current, { editCity: false });

      if (target.closest("[data-go-submit]") || target.closest("[data-go-retry]")) return submitSearch();
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

      if (target.closest("[data-go-cancel-dismiss]")) {
        current.confirmCancel = false;
        return render();
      }
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

    // Waehrend gezogen und getippt wird, wird NICHT neu gezeichnet - sonst
    // verliert der Finger den Griff und das Feld die Tastatur. Es geht nur der
    // Zustand mit, und von Hand das Stueck Anzeige, das sich mit ihm aendert.
    doc.addEventListener("input", (event) => {
      const current = view();
      const input = event.target;
      if (!current || !input || typeof input.matches !== "function") return;
      if (typeof input.closest === "function" && !input.closest("[data-go-page]")) return;

      if (input.matches("[data-go-party-range]")) {
        const size = clampGoPartySize(input.value);
        current.form.partySize = size;
        try {
          const output = doc.querySelector("[data-go-party-value]");
          if (output) output.innerHTML = `${size} <span>${goPartyWord(size)}</span>`;
          input.style?.setProperty?.("--go-range-fill", `${goPartyFillPercent(size)}%`);
          input.setAttribute?.("aria-valuetext", goPartyLabel(size));
        } catch {
          // Die Zahl daneben ist Beiwerk; der Wert steht im Zustand.
        }
        return;
      }

      if (input.matches("[data-go-city-input]")) current.form.city = input.value || "";
      if (input.matches("[data-go-when-input]")) current.form.laterValue = input.value || "";
    });

    doc.addEventListener("change", (event) => {
      const current = view();
      const input = event.target;
      if (!current || !input || typeof input.matches !== "function") return;
      if (typeof input.closest === "function" && !input.closest("[data-go-page]")) return;
      if (input.matches("[data-go-when-input]")) current.form.laterValue = input.value || "";
      if (input.matches("[data-go-city-input]")) current.form.city = input.value || "";
    });

    // Enter im Stadtfeld heisst "fertig" - dieselbe Handlung wie "Ruaj".
    doc.addEventListener("keydown", (event) => {
      const current = view();
      const input = event.target;
      if (!current || event.key !== "Enter") return;
      if (!input || typeof input.matches !== "function" || !input.matches("[data-go-city-input]")) return;
      event.preventDefault();
      current.form.city = input.value || "";
      setForm(current, { editCity: false });
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
    if (!current.opened) {
      current.opened = true;
      current.form.city = current.form.city || getCityFn();
      current.canSignIn = !isSignedInFn();
      track("go_open", {});
      client.ensureGuestSession().catch(() => {});
    }
    // Kam der Eintritt aus einem laufenden Vorgang, holt sich die Seite
    // dessen Stand vom Server - erst nach diesem Aufbau. openBooking zeichnet
    // selbst neu, und ein Neuzeichnen mitten im Zeichnen waere ein Aufbau im
    // Aufbau; der Microtask laesst den hier erst fertig werden.
    const pendingBookingId = String(takePendingBookingId() || "").trim();
    if (pendingBookingId) {
      Promise.resolve().then(() => openBooking(pendingBookingId)).catch(() => {});
    }
    return renderGoPageCore(current);
  }

  return Object.freeze({
    renderGoPageView,
    openBooking,
    __view: view,
    __submitSearch: submitSearch,
    __acceptOffer: acceptOffer
  });
}
