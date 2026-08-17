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
  renderGoOfferEditorCore,
  renderGoOfferPreviewCore,
  goCategoryFromIntents,
  goIntentsFromCategory
} from "./business-go-render-utils.js";
import { createGoAdminDataController } from "./business-go-runtime-controller.js";
import { normalizeGoOffer } from "../../../../shared/go/go-offer-core.js";
import { GO_WEEKDAY_KEYS, formatGoClock } from "../../../../shared/go/go-time-core.js";

function asFn(candidate, fallback) {
  return typeof candidate === "function" ? candidate : fallback;
}

// Die eigene Wurzel des GO-Editors in der Overlay-Flaeche. Sie steht neben
// den Wurzeln der anderen Modals (menuOverlayRoot, focusOverlayRoot ...) und
// wird nur von hier beschrieben.
const EDITOR_OVERLAY_ID = "goOfferOverlayRoot";

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
      // Ohne Vorgabe im Prozentfeld: Der Wirt soll seine Zahl schreiben, nicht
      // eine fremde wegloeschen. Der Platzhalter sagt, was hingehoert.
      benefit: { kind: "percent", percent: 0 },
      partyRanges: ["2-4"],
      // "all" heisst hier: beide Kreuze gesetzt, Ushqim und Pije.
      category: "all",
      schedule: { mode: "always" },
      // Tischreservierungen laufen nicht ueber GO - das Lokal haelt seine
      // Tische selbst frei. Jede Oferta ist deshalb ein claim.
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

  /**
   * Etwas am Entwurf aendern - nachdem gerettet wurde, was im DOM steht.
   *
   * Die Reihenfolge ist der ganze Punkt. Frueher zeichnete eine angetippte
   * Pille sofort neu, und alles, was der Wirt bis dahin getippt hatte, stand
   * nur im DOM: Der Neuaufbau setzte die Felder aus dem Entwurf zurueck, in
   * dem es nie angekommen war. Wer "1 Kafe + 1 kroasan" schrieb und danach
   * die Gruppengroesse antippte, sah sein Feld wieder leer.
   */
  function patchDraft(patch = {}) {
    const current = view();
    if (!current?.editor) return;
    current.editor.draft = normalizeGoOffer({
      ...current.editor.draft,
      ...readEditorInputs(),
      ...patch,
      restaurantId: current.restaurantId
    });
    // Die Vorschau wandert sofort mit - sie ist die Zusage, die das Lokal
    // gleich gibt (Punkt 81).
    render();
  }

  /**
   * Was gerade in den Feldern steht.
   *
   * Gelesen wird ausschliesslich, was auch WIRKLICH auf dem Bildschirm steht.
   * Das ist keine Vorsicht, sondern eine Regel: Ein Feld, das nicht gezeichnet
   * ist, liefert einen leeren Wert - und ein leerer Wert, blind uebernommen,
   * loescht still, was das Lokal einmal eingestellt hat. Genau daran haetten
   * die Kufijet gehangen, als sie aus dem Formular verschwanden: Jedes
   * Speichern haette sie auf 0 gesetzt, ohne dass jemand etwas angefasst hat.
   *
   * Deshalb steht hier nirgends ein `|| 0` auf einem fehlenden Feld, sondern
   * ein "gibt es das Feld ueberhaupt?".
   */
  function readEditorInputs() {
    if (!doc) return {};
    const current = view();
    const editor = current?.editor;
    if (!editor) return {};
    const node = (selector) => doc.querySelector(selector);
    const value = (selector) => node(selector)?.value ?? null;

    const benefit = { ...editor.draft.benefit };
    const percent = value("[data-go-benefit-percent]");
    if (percent !== null) benefit.percent = Number(percent) || 0;
    const itemName = value("[data-go-benefit-item]");
    if (itemName !== null) benefit.itemName = itemName;
    const priceText = value("[data-go-benefit-price]");
    if (priceText !== null) benefit.priceText = priceText;

    const patch = { benefit };
    const from = value("[data-go-offer-from]");
    const to = value("[data-go-offer-to]");
    if (editor.draft.schedule?.mode === "windows" && from && to) {
      // Die Wochentage werden NICHT angefasst. Das Formular zeigt sie nicht
      // mehr, aber ein Angebot, das einmal nur fuer Hën–Enj galt, soll das
      // nicht dadurch verlieren, dass jemand seinen Preis aendert.
      patch.schedule = { ...editor.draft.schedule, mode: "windows", windows: [{ start: from, end: to }] };
      editor.windowFrom = from;
      editor.windowTo = to;
    }
    return patch;
  }

  /**
   * Nur die Vorschau neu zeichnen.
   *
   * Sie ist die Zusage, die das Lokal gleich gibt (Punkt 81) - sie muss also
   * mitwandern, waehrend getippt wird. Aber sie ist auch das einzige Stueck,
   * das das tun muss: Der Rest des Formulars steht still, und genau deshalb
   * behaelt das Feld seinen Fokus.
   */
  /**
   * Den Editor in die Overlay-Flaeche der App haengen - dorthin, wo auch das
   * Speisen-Modal liegt.
   *
   * Das ist keine Kosmetik, sondern der Grund, aus dem der erste Versuch
   * gebrochen ist: Ein `position: fixed` bezieht sich auf den Bildschirm nur
   * so lange, wie kein Vorfahre eine Transformation traegt. Der Seitenrumpf
   * der App traegt eine (die Einblend-Animation der Ansicht), und damit war
   * das Modal kein Modal mehr, sondern ein Kasten im Textfluss - die Liste mit
   * ihren Kacheln schien mitten hindurch.
   *
   * #overlayRoot haengt direkt am body, hat seinen eigenen Stapelkontext
   * (isolation: isolate) und ist genau dafuer da. Angelegt wird er von der
   * App; findet er sich nicht, legt ihn dieser Aufruf an - der Editor soll
   * nicht davon abhaengen, ob vorher schon ein anderes Modal offen war.
   */
  function syncEditorOverlay(businessName = "") {
    if (!doc?.getElementById) return;
    const current = view();
    let host = doc.getElementById(EDITOR_OVERLAY_ID);
    if (!current?.editor) {
      if (host) host.innerHTML = "";
      return;
    }
    if (!host) {
      let root = doc.getElementById("overlayRoot");
      if (!root) {
        root = doc.createElement("div");
        root.id = "overlayRoot";
        root.style.position = "relative";
        root.style.zIndex = "50";
        root.style.isolation = "isolate";
        doc.body.appendChild(root);
      }
      host = doc.createElement("div");
      host.id = EDITOR_OVERLAY_ID;
      root.appendChild(host);
    }
    host.innerHTML = renderGoOfferEditorCore({
      editor: current.editor,
      businessName,
      deps
    });
  }

  function repaintPreview() {
    const current = view();
    const host = doc?.querySelector?.("[data-go-offer-preview]");
    if (!current?.editor || !host?.parentElement) return;
    const html = renderGoOfferPreviewCore({
      offer: current.editor.draft,
      businessName: current.restaurantName || "",
      deps
    });
    const holder = doc.createElement("div");
    holder.innerHTML = html;
    const next = holder.firstElementChild;
    if (next) host.replaceWith(next);
  }

  async function saveOffer() {
    const current = view();
    if (!current?.editor || !dataController) return;
    current.editor.draft = normalizeGoOffer({
      ...current.editor.draft,
      ...readEditorInputs(),
      restaurantId: current.restaurantId
    });

    // Ein Angebot ohne Adressat waere fuer niemanden sichtbar. Das faengt der
    // Editor hier ab, weil die Domaene es nicht kann: normalizeGoOffer macht
    // aus einer leeren Kategorie stillschweigend "all".
    if (!goCategoryFromIntents(goIntentsFromCategory(current.editor.draft.category)).length) {
      current.editor.errors = [{ field: "category", message: "Zgjidh për kë vlen kjo ofertë." }];
      render();
      return;
    }
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
      // Ushqim und Pije sind ankreuzbar, nicht ausschliessend: Ein Angebot
      // kann fuer beide gelten. Beide zusammen ergeben die Kategorie "all" -
      // und die passt zusaetzlich auf Gaeste, die "Nuk e di" antworten.
      const intent = target.closest("[data-go-offer-intent]");
      if (intent) {
        const key = intent.getAttribute("data-go-offer-intent");
        const active = goIntentsFromCategory(current.editor?.draft?.category);
        const next = active.includes(key)
          ? active.filter((entry) => entry !== key)
          : [...active, key];
        // Das letzte Kreuz laesst sich nicht wegnehmen: Ein Angebot ohne
        // Adressat waere fuer niemanden sichtbar, und das ist keine
        // Einstellung, die jemand absichtlich trifft.
        patchDraft({ category: goCategoryFromIntents(next.length ? next : active) });
        return;
      }
      const schedule = target.closest("[data-go-offer-schedule]");
      if (schedule) {
        const mode = schedule.getAttribute("data-go-offer-schedule");
        const existingDays = Array.isArray(current.editor?.draft?.schedule?.days)
          ? current.editor.draft.schedule.days
          : [];
        patchDraft({
          schedule: mode === "always"
            ? { mode: "always" }
            : {
              mode: "windows",
              // Ohne Wochentagswahl im Formular gilt "jeden Tag, aber nur zu
              // diesen Stunden". Ein Angebot, das schon Tage trug, behaelt sie.
              days: existingDays.length ? existingDays : GO_WEEKDAY_KEYS.slice(),
              windows: [{
                start: current.editor?.windowFrom || "14:00",
                end: current.editor?.windowTo || "18:00"
              }]
            }
        });
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
      const current = view();
      if (!current) return;

      if (target.closest("[data-go-code-input]")) {
        current.search = { ...current.search, code: String(target.value || "").trim().toUpperCase() };
        return;
      }

      // Im Editor gilt dasselbe: Das Getippte geht sofort in den Entwurf,
      // damit ein Neuzeichnen es nicht mehr wegwerfen kann. Und weil der
      // Entwurf jetzt stimmt, laesst sich die Vorschau nachziehen - von Hand,
      // nur dieser eine Knoten. Ein render() nach jedem Zeichen naehme dem
      // Feld den Fokus und der Tastatur den Platz.
      if (!current.editor || !target.closest("[data-go-offer-editor]")) return;
      current.editor.draft = normalizeGoOffer({
        ...current.editor.draft,
        ...readEditorInputs(),
        restaurantId: current.restaurantId
      });
      repaintPreview();
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
    // Die Vorschau zieht beim Tippen von Hand nach und braucht den Namen
    // dann ausserhalb dieser Funktion.
    current.restaurantName = restaurantName;

    // Der Editor geht NICHT in diese Zeichenkette. Er gehoert in die
    // Overlay-Flaeche der App - siehe syncEditorOverlay.
    syncEditorOverlay(restaurantName);

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
    disconnect: () => {
      // Wer die GO-Seite verlaesst, laesst kein Modal ueber der naechsten
      // Ansicht stehen. Die Overlay-Flaeche liegt am body und wuerde sonst
      // ueberall mitkommen.
      const host = doc?.getElementById?.(EDITOR_OVERLAY_ID);
      if (host) host.innerHTML = "";
      dataController?.disconnect();
    },
    __view: view,
    __buildDraft: buildDraft,
    __patchDraft: patchDraft,
    __readEditorInputs: readEditorInputs
  });
}
