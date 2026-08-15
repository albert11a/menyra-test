// Mnyra GO - der Ablauf im Browser.
//
// Dieses Modul wird erst geladen, wenn jemand die GO-Karte antippt. Es haelt
// den Zustand des Modals, ruft den Server und schreibt eine bestaetigte
// Buchung in den Browser-Speicher.
//
// Es haengt bewusst NICHT im Renderbaum der App: Das Modal bekommt einen
// eigenen Container am Ende des Dokuments. Faellt hier etwas um, faellt es in
// sich zusammen - Qyteti, Stories, Ofertat und Profile stehen daneben und
// merken nichts davon (Punkt 131).
//
// Der Zustand ist klein und ausdruecklich benannt:
//
//   view = "search" | "loading" | "results" | "booking" | "error"
//
// "loading" ist ein eigener Zustand und kein Beiwerk: Zwischen "wird
// gesendet" und "bestaetigt" wird nie geschummelt (Punkt 140).

import {
  GO_MODAL_CSS,
  GO_MODAL_ROOT_ELEMENT_ID,
  GO_MODAL_STYLE_ELEMENT_ID,
  GO_MODAL_SURFACE_COLOR,
  renderGoModalContentCore
} from "./go-modal-render-utils.js";
import { renderGoStickyBarCore } from "./go-entry-card-render-utils.js";
import { createGoApiClient } from "./go-api-client.js";
import {
  createGoIdempotencyKey,
  forgetGoBooking,
  readGoActiveBookings,
  rememberGoBooking,
  syncGoBookingStatus
} from "./go-client-store.js";

const STICKY_ID = "mnyraGoSticky";

function asFn(candidate, fallback) {
  return typeof candidate === "function" ? candidate : fallback;
}

// Dieselbe Buehne wie beim Posto-Modal: ein Wirt am Ende des Dokuments, ueber
// dem die Overlays der App liegen. Ein eigener zweiter Wirt wuerde frueher
// oder spaeter unter oder ueber dem falschen Ding landen.
function ensureOverlayHost(doc) {
  if (!doc?.body) return null;
  let host = doc.getElementById("overlayRoot");
  if (!host) {
    host = doc.createElement("div");
    host.id = "overlayRoot";
    host.style.position = "relative";
    host.style.zIndex = "200";
    host.style.isolation = "isolate";
    doc.body.appendChild(host);
  }
  return host;
}

function ensureStylesInjected(doc) {
  if (!doc || doc.getElementById(GO_MODAL_STYLE_ELEMENT_ID)) return;
  try {
    const style = doc.createElement("style");
    style.id = GO_MODAL_STYLE_ELEMENT_ID;
    style.textContent = GO_MODAL_CSS;
    doc.head?.appendChild(style);
  } catch {
    // Ohne eigenes Stylesheet sieht das Modal karg aus, aber es steht.
  }
}

export function createGoRuntimeController({
  documentObj = null,
  windowObj = null,
  api = null,
  getCityFn = () => "",
  getCoordsFn = () => null,
  isSignedInFn = () => false,
  onAnalyticsFn = () => {},
  openMenuFn = null,
  openSignInFn = null,
  nowFn = () => Date.now()
} = {}) {
  const doc = documentObj || (typeof document === "undefined" ? null : document);
  const win = windowObj || (typeof window === "undefined" ? null : window);
  const client = api || createGoApiClient();
  const track = asFn(onAnalyticsFn, () => {});

  const state = {
    open: false,
    view: "search",
    form: { partySize: 2, category: "all", when: "now", budget: "", showBudget: false, laterValue: "", city: "" },
    results: [],
    alternatives: [],
    booking: null,
    bookingToken: "",
    busyOfferId: "",
    confirmCancel: false,
    error: "",
    notice: "",
    canSignIn: false,
    nowMs: nowFn()
  };

  // Ein Schluessel je Absicht, nicht je Tipp: Er entsteht, sobald der Gast
  // ein Angebot annimmt, und ueberlebt jeden erneuten Versuch (Punkt 99).
  const idempotencyByOffer = new Map();

  // Wann ein Schluessel weggeworfen werden darf - und wann auf keinen Fall.
  //
  // Hat der Server abgelehnt (voll, ungueltig, nicht gefunden), ist sicher
  // keine Buchung entstanden: neuer Versuch, neuer Schluessel.
  //
  // Bricht dagegen die Leitung ab oder laeuft die Zeit aus, weiss der Browser
  // gerade gar nichts - die Buchung kann sehr wohl angelegt worden sein. Dann
  // MUSS derselbe Schluessel wieder hinaus, damit der Server dieselbe Buchung
  // zurueckgibt statt einer zweiten (Punkt 100).
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
    const code = String(error?.code || "").trim();
    if (DEFINITE_REJECTIONS.has(code)) idempotencyByOffer.delete(offerId);
  }

  // Die Flaeche wird einmal angelegt und bleibt stehen; neu geschrieben wird
  // nur ihr Inhalt. Der Composer macht es genauso - ein Modal, das sich ganz
  // neu aufbaut, verliert bei jedem Tastendruck den Fokus.
  let root = null;

  function container() {
    if (!doc) return null;
    if (root) return root;
    ensureStylesInjected(doc);
    root = doc.createElement("div");
    root.id = GO_MODAL_ROOT_ELEMENT_ID;
    root.className = "mnyra-go modal-overlay";
    root.setAttribute("data-go-modal", "");
    root.setAttribute("role", "dialog");
    root.setAttribute("aria-modal", "true");
    root.setAttribute("aria-label", "Mnyra GO");
    root.setAttribute("data-modal-surface", GO_MODAL_SURFACE_COLOR);
    try {
      root.style.setProperty("--modal-surface", GO_MODAL_SURFACE_COLOR);
    } catch {}
    return root;
  }

  function render() {
    const node = container();
    if (!node) return;
    state.nowMs = nowFn();
    if (!state.open) {
      // Geschlossen heisst weg: kein unsichtbares Modal, das Taps abfaengt.
      try {
        node.remove();
      } catch {}
      renderSticky();
      return;
    }
    const host = ensureOverlayHost(doc);
    if (host && node.parentNode !== host) host.appendChild(node);
    node.innerHTML = renderGoModalContentCore(state);
    renderSticky();
  }

  function renderSticky() {
    if (!doc) return;
    let node = doc.getElementById(STICKY_ID);
    const html = state.open ? "" : renderGoStickyBarCore({ activeBookings: readGoActiveBookings() });
    if (!html) {
      if (node) node.remove();
      return;
    }
    if (!node) {
      node = doc.createElement("div");
      node.id = STICKY_ID;
      doc.body.appendChild(node);
    }
    node.innerHTML = html;
  }

  function close() {
    state.open = false;
    state.busyOfferId = "";
    state.confirmCancel = false;
    render();
  }

  function fail(error) {
    state.view = "error";
    state.error = String(error?.message || "").trim();
    state.alternatives = Array.isArray(error?.alternatives) ? error.alternatives : [];
    state.busyOfferId = "";
    render();
  }

  function buildRequest() {
    const form = state.form;
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
      city: form.city || getCityFn(),
      partySize: form.partySize,
      category: form.category,
      requestedAt,
      budget: form.budget,
      // Der Standort ist freiwillig. Ohne ihn funktioniert GO vollstaendig,
      // nur ohne Entfernungsangabe (Punkt 13).
      lat: coords?.lat,
      lng: coords?.lng
    };
  }

  async function openSearch() {
    state.open = true;
    state.view = "search";
    state.error = "";
    state.notice = "";
    state.form.city = state.form.city || getCityFn();
    state.canSignIn = !isSignedInFn();
    render();
    track("go_open", {});
    // Die Gastsitzung wird im Hintergrund geholt - der Gast wartet nicht
    // darauf, und ein Fehlschlag hier stoppt nichts.
    client.ensureGuestSession().catch(() => {});
  }

  async function submitSearch() {
    state.view = "loading";
    state.error = "";
    render();
    const request = buildRequest();
    track("go_search", { partySize: request.partySize, category: request.category });
    try {
      const found = await client.search(request);
      state.results = found.results;
      state.view = "results";
      state.notice = "";
      render();
      track("go_results", { count: found.results.length });
    } catch (error) {
      fail(error);
    }
  }

  async function acceptOffer(offerId = "", restaurantId = "") {
    if (!offerId || state.busyOfferId) return;
    state.busyOfferId = offerId;
    state.error = "";
    render();

    if (!idempotencyByOffer.has(offerId)) {
      idempotencyByOffer.set(offerId, createGoIdempotencyKey(win?.crypto));
    }
    track("go_offer_accept", { offerId });

    try {
      const result = await client.createBooking({
        offerId,
        restaurantId,
        request: buildRequest(),
        idempotencyKey: idempotencyByOffer.get(offerId)
      });
      const booking = result?.booking || null;
      if (!booking) throw new Error("go-booking-missing");

      // Der geheime Link kommt genau einmal. Beim Wiederverwenden einer
      // Buchung (zweiter Tipp) kennt der Browser ihn bereits.
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

      state.booking = booking;
      state.bookingToken = token;
      state.view = "booking";
      state.busyOfferId = "";
      state.canSignIn = !isSignedInFn();
      render();
      track("go_booking_created", { offerId, type: booking.type });
    } catch (error) {
      if (error?.soldOut) {
        // Voll geworden, waehrend der Gast hinsah: der eine ehrliche Satz und
        // sofort Alternativen (Punkt 28, 119).
        state.view = "error";
        state.error = error.message;
        state.alternatives = error.alternatives || [];
        state.busyOfferId = "";
        releaseIdempotencyKey(offerId, error);
        render();
        return;
      }
      releaseIdempotencyKey(offerId, error);
      fail(error);
    }
  }

  async function openBooking(bookingId = "") {
    const remembered = readGoActiveBookings().find((entry) => entry.bookingId === bookingId)
      || readGoActiveBookings()[0]
      || null;
    if (!remembered) return openSearch();

    state.open = true;
    state.view = "loading";
    state.confirmCancel = false;
    render();

    try {
      // Der Server ist die Wahrheit: Was im Browser liegt, ist nur die
      // Erinnerung daran, dass es eine Buchung gibt (Punkt 41).
      const booking = await client.getBooking(remembered.bookingToken);
      if (!booking) throw new Error("go-booking-missing");
      syncGoBookingStatus(booking);
      state.booking = { ...remembered, ...booking };
      state.bookingToken = remembered.bookingToken;
      state.view = "booking";
      state.canSignIn = !isSignedInFn();
      render();
    } catch (error) {
      if (error?.code === "not-found") {
        forgetGoBooking(bookingId);
        state.view = "search";
        state.notice = "";
        render();
        return;
      }
      fail(error);
    }
  }

  async function cancelBooking() {
    const token = state.bookingToken;
    if (!token) return;
    state.view = "loading";
    render();
    try {
      const booking = await client.cancelBooking(token);
      forgetGoBooking(state.booking?.id || "");
      track("go_cancel", { bookingId: state.booking?.id || "" });
      state.booking = booking;
      state.confirmCancel = false;
      state.view = "search";
      state.form.city = state.form.city || getCityFn();
      render();
    } catch (error) {
      fail(error);
    }
  }

  function setForm(patch = {}) {
    Object.assign(state.form, patch);
    render();
  }

  // Ein einziger Zuhoerer am eigenen Container. Er faengt nur, was in GO
  // passiert - er sieht keinen Klick der uebrigen App.
  function bind() {
    const node = container();
    if (!node || node.dataset.goBound === "1") return;
    node.dataset.goBound = "1";

    node.addEventListener("click", (event) => {
      const target = event.target;
      if (!target || typeof target.closest !== "function") return;

      if (target.closest("[data-go-close]")) return close();

      const party = target.closest("[data-go-party]");
      if (party) return setForm({ partySize: Number(party.getAttribute("data-go-party")) || 2 });

      const category = target.closest("[data-go-category]");
      if (category) return setForm({ category: category.getAttribute("data-go-category") || "all" });

      const when = target.closest("[data-go-when]");
      if (when) return setForm({ when: when.getAttribute("data-go-when") || "now" });

      const budget = target.closest("[data-go-budget]");
      if (budget) {
        const value = budget.getAttribute("data-go-budget") || "";
        return setForm({ budget: state.form.budget === value ? "" : value });
      }
      if (target.closest("[data-go-budget-toggle]")) return setForm({ showBudget: true });

      if (target.closest("[data-go-submit]") || target.closest("[data-go-retry]")) return submitSearch();
      if (target.closest("[data-go-back]")) {
        state.view = "search";
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
        state.confirmCancel = false;
        return render();
      }
      if (target.closest("[data-go-cancel-confirm]")) return cancelBooking();
      if (target.closest("[data-go-cancel]")) {
        state.confirmCancel = true;
        return render();
      }

      if (target.closest("[data-go-menu]") && openMenuFn) {
        return openMenuFn(state.booking?.restaurantId || "");
      }
      if (target.closest("[data-go-signin]") && openSignInFn) {
        return openSignInFn();
      }
      if (target.closest("[data-go-directions]")) {
        const query = encodeURIComponent(
          [state.booking?.businessName, state.booking?.city].filter(Boolean).join(" ")
        );
        if (win && query) win.open(`https://www.google.com/maps/search/?api=1&query=${query}`, "_blank", "noopener");
        return;
      }
    });

    node.addEventListener("change", (event) => {
      const input = event.target;
      if (input && typeof input.matches === "function" && input.matches("[data-go-when-input]")) {
        state.form.laterValue = input.value || "";
      }
    });

    if (doc) {
      doc.addEventListener("keydown", (event) => {
        if (state.open && event.key === "Escape") close();
      });
    }
  }

  return {
    state,
    open: (mode = "search", bookingId = "") => {
      bind();
      return mode === "booking" ? openBooking(bookingId) : openSearch();
    },
    close,
    refreshSticky: renderSticky,
    // Nur fuer Tests und die Wiederherstellung nach einem Neuladen.
    __render: render,
    __submitSearch: submitSearch,
    __acceptOffer: acceptOffer
  };
}
