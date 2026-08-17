// Mnyra GO im Panel - die Ansicht.
//
// Gebaut wie der Ofertat-Editor (core/vouchers/voucher-view-controller.js):
// eine Seite, die die Shell rendert, ein einziger delegierter Zuhoerer, und
// der Editor als eigener Bildschirm innerhalb derselben Seite - kein Overlay.
//
// Der Zustand liegt in state.goAdmin, damit ein Neuzeichnen der Shell ihn
// nicht verliert. Eingabefelder werden erst beim Speichern gelesen: Wuerde
// bei jedem Tastendruck neu gezeichnet, spraenge auf dem Telefon der Fokus
// aus dem Feld und die Tastatur zu.

import {
  renderGoAdminBodyCore,
  renderGoAdminNoBusinessStateCore,
  renderGoOfferEditorCore
} from "./business-go-render-utils.js";
import { createGoAdminDataController } from "./business-go-runtime-controller.js";
import { normalizeGoOffer } from "../../../../shared/go/go-offer-core.js";
import { formatGoClock } from "../../../../shared/go/go-time-core.js";

function asFn(candidate, fallback) {
  return typeof candidate === "function" ? candidate : fallback;
}

export function createGoAdminViewController({
  state = null,
  renderFn = () => {},
  documentObj = null,
  helperApi = {},
  profileApi = {},
  bookingActionFn = null,
  findBookingFn = null,
  confirmBookingFn = null,
  nowFn = () => Date.now()
} = {}) {
  const doc = documentObj || (typeof document === "undefined" ? null : document);
  const render = asFn(renderFn, () => {});
  const escapeHtml = asFn(helperApi.escapeHtmlFn, (value) => String(value ?? ""));
  const icon = asFn(helperApi.iconFn, () => "");
  const resolveOwnRestaurantId = asFn(profileApi.resolveOwnRestaurantIdFn, () => "");
  const getRestaurantMetaById = asFn(profileApi.getRestaurantMetaByIdFn, () => null);
  const isBusinessProfile = asFn(profileApi.isBusinessProfileFn, () => false);
  const isResolvingBusinessProfile = asFn(profileApi.isResolvingBusinessProfileFn, () => false);

  const deps = { escapeHtml, icon };
  let dataController = null;
  let delegationBound = false;

  function view() {
    if (!state) return null;
    if (!state.goAdmin || typeof state.goAdmin !== "object") {
      state.goAdmin = {
        restaurantId: "",
        tab: "active",
        editor: null,
        bookings: [],
        offers: [],
        settings: {},
        paused: false,
        summary: { unseen: 0, open: 0, today: 0, guests: 0 },
        stats: { impressions: 0, accepted: 0 },
        // Das Suchfeld ueber der Aktiv-Liste. "booking" ist die Buchung, die
        // der eingetippte Code gefunden hat - nur sie traegt den
        // Bestaetigen-Knopf.
        search: { code: "", status: "", busy: false, booking: null },
        loading: true,
        error: ""
      };
    }
    return state.goAdmin;
  }

  function syncFromData(data) {
    const current = view();
    if (!current) return;
    current.bookings = data.bookings;
    current.offers = data.offers;
    current.settings = data.settings;
    current.paused = data.paused;
    current.summary = data.summary;
    current.stats = data.stats;
    current.loading = data.loading;
    current.error = data.error;
    render();
  }

  function ensureData(restaurantId = "") {
    const current = view();
    if (!current) return null;
    if (dataController && current.restaurantId === restaurantId) return dataController;
    if (dataController) dataController.disconnect();
    current.restaurantId = restaurantId;
    dataController = createGoAdminDataController({
      restaurantId,
      bookingActionFn,
      onChangeFn: syncFromData,
      nowFn
    });
    // Erst der volle Stand, dann die laufenden Aenderungen - beides bringt
    // der Listener mit.
    void dataController.connect();
    return dataController;
  }

  function buildDraft(offer = null) {
    const base = offer || {
      restaurantId: view()?.restaurantId || "",
      benefit: { kind: "percent", percent: 10 },
      partyRanges: ["2-4"],
      category: "all",
      schedule: { mode: "always" },
      bookingType: "claim",
      status: "active"
    };
    const draft = normalizeGoOffer(base);
    const window = draft.schedule?.windows?.[0] || null;
    return {
      mode: offer ? "edit" : "create",
      draft,
      windowFrom: window ? formatGoClock(window.start) : "14:00",
      windowTo: window ? formatGoClock(window.end) : "18:00",
      errors: [],
      status: "",
      saving: false
    };
  }

  function patchDraft(patch = {}) {
    const current = view();
    if (!current?.editor) return;
    current.editor.draft = normalizeGoOffer({
      ...current.editor.draft,
      ...patch,
      restaurantId: current.restaurantId
    });
    // Die Vorschau wandert sofort mit - sie ist die Zusage, die das Lokal
    // gleich gibt (Punkt 81).
    render();
  }

  // Die Felder werden in einem Rutsch gelesen, kurz bevor gespeichert wird.
  function readEditorInputs() {
    if (!doc) return {};
    const read = (selector) => doc.querySelector(selector)?.value ?? "";
    const current = view();
    const editor = current?.editor;
    if (!editor) return {};
    const limits = {};
    ["slotGroups", "slotGuests", "dailyGroups", "totalRedemptions"].forEach((key) => {
      limits[key] = Number(read(`[data-go-offer-limit="${key}"]`)) || 0;
    });
    const from = read("[data-go-offer-from]");
    const to = read("[data-go-offer-to]");
    const patch = {
      benefit: {
        ...editor.draft.benefit,
        percent: Number(read("[data-go-benefit-percent]")) || editor.draft.benefit?.percent || 0,
        itemName: read("[data-go-benefit-item]") || editor.draft.benefit?.itemName || "",
        priceText: read("[data-go-benefit-price]") || editor.draft.benefit?.priceText || "",
        text: read("[data-go-benefit-text]")
      },
      limits,
      dateRange: {
        startDate: read("[data-go-offer-start]"),
        endDate: read("[data-go-offer-end]")
      }
    };
    if (editor.draft.schedule?.mode === "windows" && from && to) {
      patch.schedule = { ...editor.draft.schedule, mode: "windows", windows: [{ start: from, end: to }] };
      editor.windowFrom = from;
      editor.windowTo = to;
    }
    return patch;
  }

  async function saveOffer() {
    const current = view();
    if (!current?.editor || !dataController) return;
    current.editor.draft = normalizeGoOffer({
      ...current.editor.draft,
      ...readEditorInputs(),
      restaurantId: current.restaurantId
    });
    current.editor.saving = true;
    current.editor.errors = [];
    current.editor.status = "";
    render();

    const result = await dataController.saveOffer(current.editor.draft);
    if (!result.ok) {
      current.editor.saving = false;
      current.editor.errors = result.errors.filter((entry) => entry.field);
      current.editor.status = result.errors.find((entry) => !entry.field)?.message || "";
      render();
      return;
    }
    current.editor = null;
    current.tab = "offers";
    render();
  }

  function readCodeInput() {
    const node = doc?.querySelector?.("[data-go-code-input]");
    return String(node?.value || "").trim().toUpperCase();
  }

  /**
   * Den Code nachschlagen, den der Gast zeigt.
   *
   * Gefunden wird nur, wer den richtigen Code hat - das Nachschlagen selbst
   * veraendert nichts. Erst der Knopf an der gefundenen Buchung loest ein.
   */
  async function searchByCode() {
    const current = view();
    if (!current || !findBookingFn) return;
    const code = readCodeInput();
    current.search = { ...current.search, code, status: "", booking: null };
    if (!code) {
      render();
      return;
    }
    current.search.busy = true;
    render();
    try {
      const booking = await findBookingFn({ shortCode: code, restaurantId: current.restaurantId });
      current.search = { code, status: "", busy: false, booking: booking || null };
    } catch (error) {
      // Der Satz des Servers steht schon auf Albanisch da - ein zweiter
      // daneben waere nur Rauschen.
      current.search = {
        code,
        status: String(error?.message || "").trim() || "Ky kod nuk u gjet.",
        busy: false,
        booking: null
      };
    }
    render();
  }

  /**
   * Die Bestaetigung. Sie geht ueber den Code, nicht ueber die Kennung -
   * deshalb steht der Code hier noch einmal mit auf der Leitung.
   */
  async function confirmFoundBooking(bookingId = "") {
    const current = view();
    if (!current || !confirmBookingFn || !current.search?.booking) return;
    if (bookingId && current.search.booking.id !== bookingId) return;
    const partyNode = doc?.querySelector?.("[data-go-confirm-party]");
    const partySize = Math.trunc(Number(partyNode?.value) || 0);
    current.search = { ...current.search, busy: true, status: "" };
    render();
    try {
      await confirmBookingFn({
        shortCode: current.search.code,
        restaurantId: current.restaurantId,
        partySize
      });
      // Erledigt: Das Feld wird leer, damit der naechste Gast nicht auf den
      // Code des vorigen trifft.
      current.search = { code: "", status: "", busy: false, booking: null };
    } catch (error) {
      current.search = {
        ...current.search,
        busy: false,
        status: String(error?.message || "").trim() || "Nuk u konfirmua. Provo prapë."
      };
    }
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
      if (!target.closest("[data-go-admin], [data-go-offer-editor]")) return;

      const tab = target.closest("[data-go-business-tab]");
      if (tab) {
        current.tab = tab.getAttribute("data-go-business-tab") || "active";
        current.editor = null;
        render();
        if (current.tab === "active") void dataController?.markSeen();
        return;
      }

      const action = target.closest("[data-go-booking-action]");
      if (action) {
        void dataController?.bookingAction(
          action.getAttribute("data-go-booking-id") || "",
          action.getAttribute("data-go-booking-action") || ""
        );
        return;
      }

      if (target.closest("[data-go-code-submit]")) {
        void searchByCode();
        return;
      }

      const confirm = target.closest("[data-go-booking-confirm]");
      if (confirm) {
        void confirmFoundBooking(confirm.getAttribute("data-go-booking-id") || "");
        return;
      }

      if (target.closest("[data-go-offer-new]")) {
        current.editor = buildDraft(null);
        render();
        return;
      }
      const edit = target.closest("[data-go-offer-edit]");
      if (edit) {
        const offerId = edit.getAttribute("data-go-offer-edit");
        const offer = current.offers.find((entry) => entry.id === offerId) || null;
        current.editor = buildDraft(offer);
        render();
        return;
      }
      const toggle = target.closest("[data-go-offer-toggle]");
      if (toggle) {
        const offerId = toggle.getAttribute("data-go-offer-toggle");
        const offer = current.offers.find((entry) => entry.id === offerId);
        void dataController?.setOfferStatus(offerId, offer?.status === "active" ? "paused" : "active");
        return;
      }
      const archive = target.closest("[data-go-offer-archive]");
      if (archive) {
        void dataController?.setOfferStatus(archive.getAttribute("data-go-offer-archive"), "archived");
        return;
      }
      if (target.closest("[data-go-offer-cancel]")) {
        current.editor = null;
        render();
        return;
      }
      if (target.closest("[data-go-offer-save]")) {
        void saveOffer();
        return;
      }

      const kind = target.closest("[data-go-benefit-kind]");
      if (kind) {
        patchDraft({ benefit: { ...current.editor?.draft?.benefit, kind: kind.getAttribute("data-go-benefit-kind") } });
        return;
      }
      const party = target.closest("[data-go-offer-party]");
      if (party) {
        const key = party.getAttribute("data-go-offer-party");
        const ranges = Array.isArray(current.editor?.draft?.partyRanges) ? current.editor.draft.partyRanges : [];
        const next = ranges.includes(key) ? ranges.filter((entry) => entry !== key) : [...ranges, key];
        patchDraft({ partyRanges: next.length ? next : ranges });
        return;
      }
      const category = target.closest("[data-go-offer-category]");
      if (category) {
        patchDraft({ category: category.getAttribute("data-go-offer-category") });
        return;
      }
      const schedule = target.closest("[data-go-offer-schedule]");
      if (schedule) {
        const mode = schedule.getAttribute("data-go-offer-schedule");
        patchDraft({
          schedule: mode === "always"
            ? { mode: "always" }
            : {
              mode: "windows",
              days: ["mon", "tue", "wed", "thu"],
              windows: [{
                start: current.editor?.windowFrom || "14:00",
                end: current.editor?.windowTo || "18:00"
              }]
            }
        });
        return;
      }
      const day = target.closest("[data-go-offer-day]");
      if (day) {
        const key = day.getAttribute("data-go-offer-day");
        const days = Array.isArray(current.editor?.draft?.schedule?.days) ? current.editor.draft.schedule.days : [];
        const nextDays = days.includes(key) ? days.filter((entry) => entry !== key) : [...days, key];
        patchDraft({ schedule: { ...current.editor.draft.schedule, mode: "windows", days: nextDays } });
        return;
      }
      const type = target.closest("[data-go-offer-type]");
      if (type) {
        patchDraft({ bookingType: type.getAttribute("data-go-offer-type") });
        return;
      }
      const pause = target.closest("[data-go-pause]");
      if (pause) {
        void dataController?.setPause(pause.getAttribute("data-go-pause") || "0");
      }
    });

    // Das Getippte gehoert in den Zustand, nicht nur ins Feld.
    //
    // Die Seite zeichnet sich bei jeder Aenderung an den Buchungen neu - und
    // sie tut das oft, weil sie am Firestore-Listener haengt. Stuende der Code
    // nur im Feld, waere er beim naechsten Gast, der irgendwo zugreift, mitten
    // im Tippen weg. Gerendert wird hier NICHT: Das naehme dem Feld bei jedem
    // Zeichen den Fokus.
    doc.addEventListener("input", (event) => {
      const target = event.target;
      if (!target || typeof target.closest !== "function") return;
      if (!target.closest("[data-go-code-input]")) return;
      const current = view();
      if (!current) return;
      current.search = { ...current.search, code: String(target.value || "").trim().toUpperCase() };
    });

    // Auf dem Telefon ist die Eingabetaste der naheliegende Weg - der Kellner
    // tippt den Code und drueckt ab, ohne den Knopf zu suchen.
    doc.addEventListener("keydown", (event) => {
      if (event.key !== "Enter") return;
      const target = event.target;
      if (!target || typeof target.closest !== "function") return;
      if (!target.closest("[data-go-code-input]")) return;
      event.preventDefault();
      void searchByCode();
    });
  }

  function renderGoAdminView() {
    bindDelegatedEvents();
    const current = view();
    if (!current) return "";

    const restaurantId = String(resolveOwnRestaurantId() || "").trim();
    if (!restaurantId || !isBusinessProfile(state?.userProfile)) {
      return renderGoAdminNoBusinessStateCore({
        deps,
        resolving: !restaurantId && isResolvingBusinessProfile()
      });
    }

    ensureData(restaurantId);

    const meta = getRestaurantMetaById(restaurantId) || {};
    const restaurantName = String(meta.name || meta.restaurantName || state?.userProfile?.name || "").trim() || "Business";

    if (current.editor) {
      return renderGoOfferEditorCore({
        editor: current.editor,
        businessName: restaurantName,
        deps
      });
    }

    return renderGoAdminBodyCore({
      restaurantName,
      tab: current.tab,
      stats: current.stats,
      search: current.search,
      bookings: current.bookings,
      offers: current.offers,
      settings: current.settings,
      paused: current.paused,
      loading: current.loading,
      error: current.error,
      deps
    });
  }

  return Object.freeze({
    renderGoAdminView,
    disconnect: () => dataController?.disconnect(),
    __view: view,
    __buildDraft: buildDraft
  });
}
