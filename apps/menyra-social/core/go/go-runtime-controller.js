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
  GO_STEPS,
  clampGoPartySize,
  goPartyFillPercent,
  goPartyLabel,
  goPartyWord,
  nextGoStep,
  previousGoStep,
  renderGoModalContentCore,
  resolveGoStep
} from "./go-modal-render-utils.js";
import {
  ensureOverlayRootCore,
  syncModalOpenUiStateCore
} from "../overlays/overlay-root-ui-utils.js";
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

// Dieselbe Buehne wie beim Posto-Modal, und zwar wirklich dieselbe: die Buehne
// legt ensureOverlayRootCore an, nicht GO.
//
// Der Unterschied ist nicht kosmetisch. An dieser Buehne haengen zwei
// unscheinbare Flaechen, #safariChromeTintTop und #safariChromeTintBottom, die
// den sicheren Bereich oben und unten in der Farbe des offenen Modals
// einfaerben. GO hatte sich seinen Wirt selbst gebaut - ohne die beiden. Ueber
// und unter dem weissen Modal blieb deshalb das Grau der App stehen.
function ensureOverlayHost(doc) {
  if (!doc?.body) return null;
  try {
    const root = ensureOverlayRootCore({ documentObj: doc });
    if (root) return root;
  } catch {
    // Faellt die Buehne aus, steht das Modal immer noch - nur ohne die
    // Einfaerbung der Raender.
  }
  return doc.getElementById("overlayRoot");
}

// Was die App tut, sobald irgendein Modal offen ist: theme-color setzen, die
// beiden Raender einfaerben, den Grund hinter dem Modal stilllegen. GO tat
// nichts davon und war damit das einzige Modal, das oben und unten eine andere
// Farbe trug als seine eigene Flaeche.
//
// Es ist bewusst dieselbe Funktion, die auch die Shell ruft, und nicht eine
// dritte Abschrift: Die Regel, welche Farbe der Rand traegt, darf es nur
// einmal geben.
function syncModalChrome(doc) {
  if (!doc) return;
  try {
    syncModalOpenUiStateCore({ documentObj: doc });
  } catch {
    // Ein Modal, das steht, ist mehr wert als ein eingefaerbter Rand.
  }
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
    // Nach dem Budget wird nicht mehr gefragt - es steht deshalb auch nicht
    // mehr im Formular. Was der Gast nicht angibt, schickt der Browser auch
    // nicht mit.
    //
    // "step" ist das einzige Feld, das keine Antwort ist, sondern die Frage,
    // die gerade im Bild steht.
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
      // Und erst NACH dem Entfernen die Raender zuruecksetzen - die Funktion
      // sieht am Baum nach, ob noch ein Modal steht.
      syncModalChrome(doc);
      renderSticky();
      return;
    }
    const host = ensureOverlayHost(doc);
    if (host && node.parentNode !== host) host.appendChild(node);
    node.innerHTML = renderGoModalContentCore(state);
    syncModalChrome(doc);
    focusCityInput();
    renderSticky();
  }

  // Das Stadtfeld erscheint erst auf Tipp - und wer es antippt, will
  // schreiben, nicht danach noch einmal hineintippen. Der Cursor steht am
  // Ende, damit ein bestehender Name ergaenzt und nicht ueberschrieben wird.
  function focusCityInput() {
    if (!state.open || !state.form.editCity) return;
    try {
      const input = root?.querySelector?.("[data-go-city-input]");
      if (!input || typeof input.focus !== "function") return;
      input.focus({ preventScroll: true });
      const end = String(input.value || "").length;
      input.setSelectionRange?.(end, end);
    } catch {
      // Ein Feld, das sich nicht scharfstellen laesst, ist trotzdem benutzbar.
    }
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

  async function openSearch() {
    state.open = true;
    state.view = "search";
    state.error = "";
    state.notice = "";
    state.form.city = state.form.city || getCityFn();
    // Ein Modal, das mit offenem Stadtfeld aufgeht, waere eine Frage, die
    // niemand gestellt hat. Und es faengt bei der ersten Frage an, nicht dort,
    // wo eine fruehere Sitzung stehengeblieben ist.
    state.form.editCity = false;
    state.form.step = GO_STEPS[0];
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
      state.form.step = GO_STEPS[0];
      render();
    } catch (error) {
      fail(error);
    }
  }

  function setForm(patch = {}) {
    Object.assign(state.form, patch);
    render();
  }

  // Eine angetippte Pille IST die Antwort - danach steht die naechste Frage
  // da, ohne dass jemand noch etwas bestaetigen muesste. Nur "Më vonë" bleibt
  // stehen: es hat erst eine Antwort, wenn auch die Uhrzeit da ist.
  function answerAndAdvance(patch = {}, { hold = false } = {}) {
    Object.assign(state.form, patch);
    if (!hold) state.form.step = nextGoStep(state.form.step);
    render();
  }

  function goToStep(step = "") {
    setForm({ step: resolveGoStep(step), editCity: false });
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

      const category = target.closest("[data-go-category]");
      if (category) {
        return answerAndAdvance({ category: category.getAttribute("data-go-category") || "all" });
      }

      const when = target.closest("[data-go-when]");
      if (when) {
        const value = when.getAttribute("data-go-when") || "now";
        return answerAndAdvance({ when: value }, { hold: value === "later" });
      }

      // Vor und zurueck durch die Fragen. "goto" springt auf eine schon
      // gegebene Antwort - das ist der Weg zurueck aus dem Merkzettel oben.
      if (target.closest("[data-go-step-next]")) {
        return setForm({ step: nextGoStep(state.form.step), editCity: false });
      }
      if (target.closest("[data-go-step-back]")) {
        return setForm({ step: previousGoStep(state.form.step), editCity: false });
      }
      const goto = target.closest("[data-go-goto]");
      if (goto) return goToStep(goto.getAttribute("data-go-goto") || "");

      // Der Ort: "Ndrysho" oeffnet das Feld, "Ruaj" schliesst es wieder. Der
      // getippte Name steht schon im Zustand - er wird waehrend des Tippens
      // mitgeschrieben, nicht erst beim Speichern.
      if (target.closest("[data-go-change-city]")) return setForm({ editCity: true });
      if (target.closest("[data-go-city-save]")) return setForm({ editCity: false });

      if (target.closest("[data-go-submit]") || target.closest("[data-go-retry]")) return submitSearch();
      if (target.closest("[data-go-back]")) {
        // Zurueck aus dem Ergebnis heisst "eine Kleinigkeit anders", nicht
        // "von vorn": der letzte Schritt steht da, und darueber der Merkzettel
        // mit allen Antworten - eine davon antippen genuegt.
        state.form.step = GO_STEPS[GO_STEPS.length - 1];
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

    // Waehrend getippt und gezogen wird, wird NICHT neu gezeichnet.
    //
    // Ein Neuaufbau des Inhalts waehrend des Ziehens nimmt dem Finger den
    // Griff, den er gerade haelt, und dem Stadtfeld die Tastatur. Deshalb
    // geht hier nur der Zustand mit - und von Hand genau das Stueck Anzeige,
    // das sich mit ihm aendert: die Zahl ueber dem Regler und die gefuellte
    // Schiene darunter.
    node.addEventListener("input", (event) => {
      const input = event.target;
      if (!input || typeof input.matches !== "function") return;

      if (input.matches("[data-go-party-range]")) {
        const size = clampGoPartySize(input.value);
        state.form.partySize = size;
        try {
          const output = node.querySelector?.("[data-go-party-value]");
          if (output) output.innerHTML = `${size} <span>${goPartyWord(size)}</span>`;
          input.style?.setProperty?.("--go-range-fill", `${goPartyFillPercent(size)}%`);
          input.setAttribute?.("aria-valuetext", goPartyLabel(size));
        } catch {
          // Die Zahl daneben ist Beiwerk; der Wert steht im Zustand.
        }
        return;
      }

      if (input.matches("[data-go-city-input]")) {
        state.form.city = input.value || "";
      }
    });

    node.addEventListener("change", (event) => {
      const input = event.target;
      if (!input || typeof input.matches !== "function") return;
      if (input.matches("[data-go-when-input]")) state.form.laterValue = input.value || "";
      if (input.matches("[data-go-city-input]")) state.form.city = input.value || "";
    });

    // Enter im Stadtfeld heisst "fertig" - dieselbe Handlung wie "Ruaj".
    node.addEventListener("keydown", (event) => {
      const input = event.target;
      if (event.key !== "Enter") return;
      if (!input || typeof input.matches !== "function" || !input.matches("[data-go-city-input]")) return;
      event.preventDefault();
      state.form.city = input.value || "";
      setForm({ editCity: false });
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
