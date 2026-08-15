// Mnyra GO im Panel - Daten und Realtime.
//
// Die Anforderung aus der Spezifikation (Punkt 52 bis 57) ist: Das Panel
// aktualisiert sich ohne Refresh, auf mehreren Geraeten gleichzeitig, mit
// Wiederverbindung nach einem Abbruch, und nach einer Offline-Phase zuerst
// mit dem vollstaendigen Stand und dann mit den laufenden Aenderungen.
//
// Empfohlen war dafuer SSE. Der Stack traegt das nicht: Mnyra liegt als
// statisches Bundle auf Vercel, der Server sind Firebase Functions - beide
// halten keine dauerhaft offene Verbindung.
//
// Umgesetzt ist deshalb das Ziel, nicht die Technik: ein Firestore-Listener
// auf die eigenen Buchungen. Er liefert genau diese fuenf Eigenschaften, ohne
// eine zweite Infrastruktur - und er haengt nur an Business-Seiten. Ein Gast
// im Qyteti bekommt keine Verbindung (Punkt 54).
//
// Angelegt und veraendert werden Buchungen hier NICHT. Das Panel liest sie
// und ruft fuer jede Aenderung den Server (Punkt 146).

import { renderBusinessGoPanelCore } from "./business-go-render-utils.js";
import {
  normalizeGoOffer,
  toGoOfferStoragePayload,
  validateGoOffer
} from "../../../../shared/go/go-offer-core.js";
import { normalizeGoBooking } from "../../../../shared/go/go-booking-core.js";

const CONTAINER_ID = "mnyraGoBusinessRoot";
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
 * Er haengt an derselben Sammlung wie die Liste, liest aber nur die offenen
 * Vorgaenge des eigenen Lokals. Sobald ein Gast ein Angebot annimmt, steht
 * die Zahl da - ohne dass jemand die Seite neu laedt.
 *
 * Er laeuft nur, solange eine Business-Seite offen ist. `stop()` beendet ihn.
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
    if (!restaurantId || stopped) return () => {};
    try {
      const { db, api } = firestore || (await loadFirestore());
      const openQuery = api.query(
        api.collection(db, "goBookings"),
        api.where("restaurantId", "==", restaurantId),
        api.where("status", "in", ["confirmed", "checked_in"]),
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
          guests += Number(data.partySize) || 0;
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

export function createBusinessGoRuntimeController({
  documentObj = null,
  restaurantId = "",
  businessName = "",
  firestore = null,
  bookingActionFn = null,
  onBadgeFn = () => {},
  nowFn = () => Date.now()
} = {}) {
  const doc = documentObj || (typeof document === "undefined" ? null : document);

  const state = {
    open: false,
    tab: "active",
    loading: true,
    error: "",
    bookings: [],
    offers: [],
    settings: {},
    paused: false,
    summary: { unseen: 0, open: 0, today: 0, guests: 0 },
    editor: null,
    editorErrors: [],
    businessName
  };

  let unsubscribeBookings = null;
  let unsubscribeOffers = null;

  function container() {
    if (!doc) return null;
    let node = doc.getElementById(CONTAINER_ID);
    if (!node) {
      node = doc.createElement("div");
      node.id = CONTAINER_ID;
      doc.body.appendChild(node);
    }
    return node;
  }

  function render() {
    const node = container();
    if (!node) return;
    node.innerHTML = renderBusinessGoPanelCore(state);
  }

  // Das Abzeichen zaehlt nur, was das Lokal noch nicht gesehen hat - nicht
  // alles, was laeuft (Punkt 51).
  function recomputeSummary() {
    const day = todayKey(nowFn());
    const open = state.bookings.filter((booking) => ["confirmed", "checked_in"].includes(booking.status));
    const summary = {
      unseen: open.filter((booking) => !booking.businessSeenAt).length,
      open: open.length,
      today: state.bookings.filter((booking) => booking.dayKey === day).length,
      guests: open.reduce((total, booking) => total + (Number(booking.partySize) || 0), 0)
    };
    state.summary = summary;
    onBadgeFn(summary);
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
    state.bookings = [...byId.values()].sort((a, b) => (
      Date.parse(b.createdAt || 0) - Date.parse(a.createdAt || 0)
    ));
    recomputeSummary();
  }

  async function connect() {
    if (!restaurantId) {
      state.loading = false;
      state.error = "";
      render();
      return;
    }
    try {
      const { db, api } = firestore || (await loadFirestore());
      // Erst der vollstaendige Stand, dann die laufenden Aenderungen: Genau
      // das macht onSnapshot beim Verbinden und nach jeder Wiederverbindung
      // von selbst - dadurch geht nichts verloren, was waehrend einer
      // Offline-Phase passiert ist (Punkt 57, 122).
      const bookingsQuery = api.query(
        api.collection(db, "goBookings"),
        api.where("restaurantId", "==", restaurantId),
        api.orderBy("createdAt", "desc"),
        api.limit(BOOKING_LIMIT)
      );
      unsubscribeBookings = api.onSnapshot(
        bookingsQuery,
        (snapshot) => {
          const docs = [];
          snapshot.forEach((entry) => docs.push({ id: entry.id, data: entry.data() }));
          applyBookingDocs(docs);
          state.loading = false;
          state.error = "";
          render();
        },
        () => {
          // Firestore verbindet von selbst neu; die Meldung sagt nur, dass
          // der Stand gerade nicht frisch ist.
          state.error = "Lidhja u ndërpre. Po provojmë përsëri...";
          render();
        }
      );

      const offersQuery = api.query(
        api.collection(db, "restaurants", restaurantId, "goOffers")
      );
      unsubscribeOffers = api.onSnapshot(offersQuery, (snapshot) => {
        const offers = [];
        snapshot.forEach((entry) => offers.push(normalizeGoOffer({ ...entry.data(), id: entry.id, restaurantId }, entry.id)));
        state.offers = offers;
        render();
      });

      const settingsSnapshot = await api.getDoc(
        api.doc(db, "restaurants", restaurantId, "goSettings", "config")
      );
      state.settings = settingsSnapshot.exists() ? (settingsSnapshot.data() || {}) : {};
      state.paused = !!state.settings.paused
        || (Number(state.settings.pausedUntil) || 0) > nowFn();
      state.loading = false;
      render();
    } catch {
      state.loading = false;
      state.error = "Mnyra GO është përkohësisht i padisponueshëm.";
      render();
    }
  }

  function disconnect() {
    if (typeof unsubscribeBookings === "function") unsubscribeBookings();
    if (typeof unsubscribeOffers === "function") unsubscribeOffers();
    unsubscribeBookings = null;
    unsubscribeOffers = null;
  }

  // Gesehen heisst gesehen: Sobald das Lokal die Liste offen hat, verschwindet
  // das Abzeichen - die Buchungen selbst bleiben unveraendert (Punkt 114).
  async function markSeen() {
    if (!bookingActionFn) return;
    const unseen = state.bookings.filter(
      (booking) => !booking.businessSeenAt && ["confirmed", "checked_in"].includes(booking.status)
    );
    await Promise.allSettled(unseen.map((booking) => bookingActionFn({
      bookingId: booking.id,
      restaurantId,
      action: "seen"
    })));
  }

  async function bookingAction(bookingId = "", action = "", reason = "") {
    if (!bookingActionFn) return;
    try {
      await bookingActionFn({ bookingId, restaurantId, action, reason });
    } catch (error) {
      state.error = String(error?.message || "").trim() || "Ky veprim nuk është i mundur.";
      render();
    }
  }

  function newDraft() {
    return normalizeGoOffer({
      restaurantId,
      benefit: { kind: "percent", percent: 10 },
      partyRanges: ["2-4"],
      category: "all",
      schedule: { mode: "always" },
      bookingType: "claim",
      status: "active"
    });
  }

  function editDraft(patch = {}) {
    state.editor = normalizeGoOffer({ ...state.editor, ...patch, restaurantId });
    // Die Vorschau soll sofort mitwandern - sie ist die Zusage, die das Lokal
    // gleich gibt (Punkt 81).
    render();
  }

  async function saveOffer(extra = {}) {
    const draft = { ...state.editor, ...extra, restaurantId };
    const check = validateGoOffer(draft);
    state.editorErrors = check.errors;
    if (!check.ok) return render();

    try {
      const { db, api } = firestore || (await loadFirestore());
      const payload = {
        ...toGoOfferStoragePayload(check.offer, { serverTimestamp: api.serverTimestamp() }),
        // Nur ein Hinweis fuer die Abfrage - ob das Lokal wirklich in dieser
        // Stadt steht, entscheidet der Server am Profil.
        cityKey: String(state.settings?.cityKey || "").trim() || undefined
      };
      const ref = check.offer.id
        ? api.doc(db, "restaurants", restaurantId, "goOffers", check.offer.id)
        : api.doc(api.collection(db, "restaurants", restaurantId, "goOffers"));
      await api.setDoc(ref, payload, { merge: true });
      state.editor = null;
      state.editorErrors = [];
      state.tab = "offers";
      render();
    } catch {
      state.error = "Nuk u ruajt. Provo prapë.";
      render();
    }
  }

  async function setOfferStatus(offerId = "", status = "active") {
    try {
      const { db, api } = firestore || (await loadFirestore());
      // Ein Angebot mit Buchungen wird archiviert, nie geloescht - sonst
      // verlieren bestehende Buchungen ihren Ursprung (Punkt 94).
      await api.setDoc(
        api.doc(db, "restaurants", restaurantId, "goOffers", offerId),
        { status, updatedAt: api.serverTimestamp() },
        { merge: true }
      );
    } catch {
      state.error = "Nuk u ruajt. Provo prapë.";
      render();
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
        api.doc(db, "restaurants", restaurantId, "goSettings", "config"),
        { enabled: true, paused, pausedUntil, updatedAt: api.serverTimestamp() },
        { merge: true }
      );
      state.settings = { ...state.settings, paused, pausedUntil };
      state.paused = paused;
      render();
    } catch {
      state.error = "Nuk u ruajt. Provo prapë.";
      render();
    }
  }

  function bind() {
    const node = container();
    if (!node || node.dataset.goBound === "1") return;
    node.dataset.goBound = "1";

    node.addEventListener("click", (event) => {
      const target = event.target;
      if (!target || typeof target.closest !== "function") return;

      if (target.closest("[data-go-business-close]")) {
        state.open = false;
        disconnect();
        return render();
      }

      const tab = target.closest("[data-go-business-tab]");
      if (tab) {
        state.tab = tab.getAttribute("data-go-business-tab") || "active";
        state.editor = null;
        render();
        if (state.tab === "active") markSeen();
        return;
      }

      const action = target.closest("[data-go-booking-action]");
      if (action) {
        return bookingAction(
          action.getAttribute("data-go-booking-id") || "",
          action.getAttribute("data-go-booking-action") || ""
        );
      }

      if (target.closest("[data-go-offer-new]")) {
        state.editor = newDraft();
        state.editorErrors = [];
        return render();
      }
      const edit = target.closest("[data-go-offer-edit]");
      if (edit) {
        const offerId = edit.getAttribute("data-go-offer-edit");
        state.editor = state.offers.find((offer) => offer.id === offerId) || newDraft();
        state.editorErrors = [];
        return render();
      }
      const toggle = target.closest("[data-go-offer-toggle]");
      if (toggle) {
        const offerId = toggle.getAttribute("data-go-offer-toggle");
        const offer = state.offers.find((entry) => entry.id === offerId);
        return setOfferStatus(offerId, offer?.status === "active" ? "paused" : "active");
      }
      const archive = target.closest("[data-go-offer-archive]");
      if (archive) return setOfferStatus(archive.getAttribute("data-go-offer-archive"), "archived");

      if (target.closest("[data-go-offer-cancel]")) {
        state.editor = null;
        return render();
      }
      if (target.closest("[data-go-offer-save]")) return saveOffer(readEditorInputs(node));

      const kind = target.closest("[data-go-benefit-kind]");
      if (kind) {
        return editDraft({
          benefit: { ...state.editor?.benefit, kind: kind.getAttribute("data-go-benefit-kind") }
        });
      }
      const party = target.closest("[data-go-offer-party]");
      if (party) {
        const key = party.getAttribute("data-go-offer-party");
        const current = Array.isArray(state.editor?.partyRanges) ? state.editor.partyRanges : [];
        const next = current.includes(key) ? current.filter((entry) => entry !== key) : [...current, key];
        return editDraft({ partyRanges: next.length ? next : current });
      }
      const category = target.closest("[data-go-offer-category]");
      if (category) return editDraft({ category: category.getAttribute("data-go-offer-category") });
      const schedule = target.closest("[data-go-offer-schedule]");
      if (schedule) {
        const mode = schedule.getAttribute("data-go-offer-schedule");
        return editDraft({
          schedule: mode === "always"
            ? { mode: "always" }
            : { mode: "windows", days: ["mon", "tue", "wed", "thu"], windows: [{ start: "14:00", end: "18:00" }] }
        });
      }
      const day = target.closest("[data-go-offer-day]");
      if (day) {
        const key = day.getAttribute("data-go-offer-day");
        const days = Array.isArray(state.editor?.schedule?.days) ? state.editor.schedule.days : [];
        const nextDays = days.includes(key) ? days.filter((entry) => entry !== key) : [...days, key];
        return editDraft({
          schedule: { ...state.editor.schedule, mode: "windows", days: nextDays }
        });
      }
      const type = target.closest("[data-go-offer-type]");
      if (type) return editDraft({ bookingType: type.getAttribute("data-go-offer-type") });

      const pause = target.closest("[data-go-pause]");
      if (pause) return setPause(pause.getAttribute("data-go-pause") || "0");
    });
  }

  // Die Eingabefelder werden erst beim Speichern gelesen: Ein Neuzeichnen bei
  // jedem Tastendruck wuerde den Fokus aus dem Feld nehmen - auf dem Telefon
  // faellt dabei die Tastatur zu.
  function readEditorInputs(node) {
    if (!node || typeof node.querySelector !== "function") return {};
    const read = (selector) => node.querySelector(selector)?.value ?? "";
    const from = read("[data-go-offer-from]");
    const to = read("[data-go-offer-to]");
    const limits = {};
    ["slotGroups", "slotGuests", "dailyGroups", "totalRedemptions"].forEach((key) => {
      limits[key] = Number(read(`[data-go-offer-limit="${key}"]`)) || 0;
    });
    const patch = {
      benefit: {
        ...state.editor?.benefit,
        percent: Number(read("[data-go-benefit-percent]")) || state.editor?.benefit?.percent || 0,
        itemName: read("[data-go-benefit-item]") || state.editor?.benefit?.itemName || "",
        priceText: read("[data-go-benefit-price]") || state.editor?.benefit?.priceText || "",
        text: read("[data-go-benefit-text]")
      },
      limits,
      dateRange: {
        startDate: read("[data-go-offer-start]"),
        endDate: read("[data-go-offer-end]")
      }
    };
    if (state.editor?.schedule?.mode === "windows" && from && to) {
      patch.schedule = { ...state.editor.schedule, mode: "windows", windows: [{ start: from, end: to }] };
    }
    return patch;
  }

  return {
    state,
    async open(tab = "active") {
      bind();
      state.open = true;
      state.tab = tab;
      state.loading = true;
      render();
      await connect();
      if (state.tab === "active") markSeen();
    },
    close() {
      state.open = false;
      disconnect();
      render();
    },
    disconnect,
    __render: render,
    __applyBookingDocs: applyBookingDocs,
    __setPause: setPause,
    __saveOffer: saveOffer
  };
}
