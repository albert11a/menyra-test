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
  goIntentsFromCategory,
  BUSINESS_GO_TEXTS,
  GO_TAB_GROUPS,
  goTabGroupIndex
} from "./business-go-render-utils.js";
import { createGoAdminDataController } from "./business-go-runtime-controller.js";
import { normalizeGoOffer, parseGoPriceCents } from "../../../../shared/go/go-offer-core.js";
import {
  GO_PARTY_RANGES,
  goPartyRangeKeysForEditor
} from "../../../../shared/go/go-feature-config.js";
import { GO_WEEKDAY_KEYS, formatGoClock } from "../../../../shared/go/go-time-core.js";

function asFn(candidate, fallback) {
  return typeof candidate === "function" ? candidate : fallback;
}

// Die eigene Wurzel des GO-Editors in der Overlay-Flaeche. Sie steht neben
// den Wurzeln der anderen Modals (menuOverlayRoot, focusOverlayRoot ...) und
// wird nur von hier beschrieben.
const EDITOR_OVERLAY_ID = "goOfferOverlayRoot";

// Wieviel Finger es braucht, um die Gruppe zu wechseln. 48 Punkte sind
// deutlich mehr als das Wackeln beim Antippen und deutlich weniger als die
// Breite eines Telefons.
const SWIPE_MIN_DISTANCE = 48;
// Und ab wann ueberhaupt entschieden wird, wohin die Geste gehoert. Vorher
// weiss niemand, ob das ein Wisch oder der Beginn eines Scrollens ist.
const SWIPE_DECIDE_AFTER = 8;
// Und wie eindeutig waagerecht: anderthalbmal so weit zur Seite wie nach
// oben, sonst gehoert die Geste dem Scrollen.
const SWIPE_DIRECTION_RATIO = 1.5;


export function createGoAdminViewController({
  state = null,
  renderFn = () => {},
  documentObj = null,
  helperApi = {},
  profileApi = {},
  bookingActionFn = null,
  findBookingFn = null,
  finalizeBookingFn = null,
  // Der Weg zum Server, bevor jemand ihn braucht. Siehe prewarm().
  prewarmFn = null,
  // Die fuenf Zahlen der Karten-Reihe. Sie kommen vom Server, damit Panel und
  // Heart dieselbe Zahl nennen (Punkt 54) - siehe refreshOverview.
  overviewFn = null,
  // Das Foto des Angebots geht denselben Weg wie das Foto eines Gerichts: ueber
  // den Media-Worker, komprimiert, mit einer kleinen Fassung daneben. Fehlt die
  // Funktion, bleibt die Section stehen und sagt es - ein Formular, das ein
  // Feld verschweigt, weil ein Dienst fehlt, ist schwerer zu verstehen als
  // eines, in dem etwas nicht geht.
  uploadImageFn = null,
  nowFn = () => Date.now()
} = {}) {
  const doc = documentObj || (typeof document === "undefined" ? null : document);
  // Das Fenster hinter dem Dokument. Es wird fuer zwei Dinge gebraucht: die
  // Kamera (navigator.mediaDevices) und die Frage, ob der Nutzer Bewegung
  // abbestellt hat.
  const win = doc?.defaultView || (typeof window === "undefined" ? null : window);
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
  // An welcher Leiste die Wischgeste gerade haengt. Ein Neuzeichnen ersetzt
  // den Knoten - siehe ensureSwipeBinding.
  let boundSwipeNode = null;
  let afterPaintQueued = false;
  // Die Karten-Reihe und wo sie zuletzt stand - siehe rememberKpiScroll.
  let lastKpiRow = null;
  let lastKpiScroll = 0;
  // Was zuletzt in der Overlay-Flaeche stand. Siehe syncEditorOverlay.
  let lastEditorHtml = "";
  // Welche Angebotsart zuletzt gezeichnet wurde. Nur wenn sie sich aendert,
  // blendet der Angebotsbereich weich ein (Punkt 27) - beim Tippen einer Pille
  // innerhalb derselben Art soll nichts blitzen.
  let lastEditorKind = "";
  // Steht auf "wahr", solange ein Neuzeichnen aus dem Editor selbst kommt.
  let editorRepaintForced = false;
  // Der laufende Kamerastrom der Aktivizo-Karte. Er liegt hier und nicht im
  // Zustand: Die Seite zeichnet sich oft neu, und jedes Neuzeichnen ersetzt
  // das <video>. Der STROM ueberlebt das - er wird nach dem Zeichnen einfach
  // wieder an den neuen Knoten gehaengt (siehe attachCameraStream).
  let cameraStream = null;
  // Zeigt die Karte GERADE die gefundene Buchung? Das ist etwas anderes als
  // die Frage, ob eine gefunden wurde - und der Unterschied ist die Bewegung.
  //
  // Ein frisch gezeichneter Knoten bewegt sich nicht, er steht sofort da.
  // Damit die Karte sich verwandelt statt umzuspringen, wird sie in dem
  // Zustand gezeichnet, in dem sie schon war, und erst NACH dem Zeichnen auf
  // ihr Ziel gestellt - dann liegt eine Aenderung an einem lebenden Knoten
  // vor, und die faehrt das Blatt.
  let shownBooking = false;
  // Der Nachlauf der Rueckbewegung nach einem Abschluss. Solange er laeuft,
  // steht die Buchung noch im Aufbau, obwohl sie aus dem Zustand schon weg
  // ist - sie ist das, was da hinausfaehrt.
  let bookingExitTimer = 0;
  // So lange dauert die Rueckbewegung im Blatt: 110ms fahert die Buchung
  // hinaus, ab 120ms kommt die Eingabemaske fuer 160ms zurueck, und die
  // Karte zieht sich ueber 300ms auf ihre kleine Hoehe zusammen. Der Nachlauf
  // liegt bewusst darueber - wer frueher neu zeichnet, ersetzt einen Knoten,
  // der noch faehrt, und dann steht die Bewegung mitten im Bild still.
  const BOOKING_EXIT_MS = 340;
  // So lange steht ein Haken oder ein Kreuz im Knopf, bevor es weitergeht.
  // Der Haken ist eine Quittung und keine Pause: Er ist nur so lange da, wie
  // ein Auge braucht, um ihn zu sehen. Das Kreuz steht laenger - es soll
  // gelesen werden, nicht bemerkt.
  const PHASE_DONE_MS = 300;
  const PHASE_FAIL_MS = 900;
  // Wenn die Kamera nach so langer Zeit noch kein Bild mit Massen geliefert
  // hat, laeuft sie nicht. Ein schwarzes Rechteck, das stehen bleibt, ist
  // schlimmer als ein Satz, der sagt, dass es den Code auch noch gibt.
  const CAMERA_READY_TIMEOUT_MS = 4000;
  let phaseTimer = 0;
  let cameraReadyTimer = 0;
  // Einmal je Sitzung: den Weg zum Server warmlaufen lassen. Siehe prewarm().
  let prewarmed = false;

  function view() {
    if (!state) return null;
    if (!state.goAdmin || typeof state.goAdmin !== "object") {
      state.goAdmin = {
        restaurantId: "",
        tab: "active",
        // Welche der zwei Gruppen die Leiste zeigt. Sie steht NEBEN dem
        // Reiter und nicht in ihm: Weiterblaettern zeigt, was daneben liegt,
        // und oeffnet nichts. Geoeffnet wird erst beim Antippen.
        tabGroup: 0,
        editor: null,
        bookings: [],
        offers: [],
        settings: {},
        paused: false,
        summary: { unseen: 0, open: 0, today: 0, guests: 0 },
        stats: { impressions: 0, accepted: 0 },
        // `null` heisst "noch nicht bekannt", eine Zahl heisst "gemessen" -
        // jede der fuenf fuer sich (siehe business-go-runtime-controller.js).
        overview: {
          uniqueViewers: null,
          accepted: null,
          visits: null,
          visitors: null,
          openCents: null
        },
        // Das Suchfeld ueber der Aktiv-Liste. "booking" ist die Buchung, die
        // der eingetippte Code gefunden hat - nur sie traegt den
        // Bestaetigen-Knopf.
        search: { code: "", status: "", busy: false, booking: null },
        // Die Kamera der Aktivizo-Karte. Sie steht NEBEN der Suche: Sie liest
        // heute noch nichts und aendert nichts am Code - sie geht auf und
        // wieder zu. Der Strom selbst liegt nicht hier, sondern als
        // cameraStream im Modul: Ein MediaStream gehoert nicht in einen
        // Zustand, der bei jedem Zeichnen mitgelesen wird.
        camera: { open: false, error: "" },
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
    current.overview = data.overview;
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
      overviewFn,
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
      // "Të gjithë" ist die Vorgabe (Punkt 15, 44): Ein Lokal, dem die
      // Gruppengroesse gleich ist - und das sind die meisten - muss hier nichts
      // antippen. Vorher stand dort "2-4", also eine Einschraenkung, die
      // niemand gewaehlt hatte und die ein Paar von zwei Personen ausschloss,
      // sobald es zu dritt kam.
      partyRanges: GO_PARTY_RANGES.map((entry) => entry.key),
      // "all" heisst hier: beide Kreuze gesetzt, Ushqim und Pije.
      category: "all",
      schedule: { mode: "always" },
      // Tischreservierungen laufen nicht ueber GO - das Lokal haelt seine
      // Tische selbst frei. Jede Oferta ist deshalb ein claim.
      bookingType: "claim",
      status: "active"
    };
    // Zweimal normalisieren, und der Grund steht in der Mitte: Ein Angebot von
    // damals traegt Bereiche, die das Formular nicht mehr zeigt ("2-4"). Ohne
    // Uebersetzung stuende die Auswahl leer da, als haette das Lokal nie eine
    // getroffen - mit ihr stehen die Bereiche des heutigen Formulars da, und
    // minParty/maxParty werden aus DIESEN neu gerechnet.
    const stored = normalizeGoOffer(base);
    const draft = normalizeGoOffer({
      ...stored,
      partyRanges: goPartyRangeKeysForEditor(stored.partyRanges)
    });
    const window = draft.schedule?.windows?.[0] || null;
    return {
      mode: offer ? "edit" : "create",
      draft,
      // Was in den anderen drei Angebotsarten schon getippt wurde, solange das
      // Modal offen ist (Punkt 10). Wer eine Zbritje einstellt, dann eine
      // Paketa ausprobiert und zurueckwechselt, findet seine 20 % wieder.
      //
      // Gespeichert wird davon nur die Art, die beim Antippen von AKTIVIZO
      // gewaehlt ist (Punkt 11) - der Rest verschwindet mit dem Modal.
      benefits: { [draft.benefit.kind]: draft.benefit },
      // Steht "Tjetër" bei der Zbritje offen? Das ist eine Frage an den
      // Bildschirm, nicht an das Angebot: Ein Prozentsatz von 0 kann beides
      // heissen - noch nichts gewaehlt, oder das Feld ist offen und leer.
      percentCustom: false,
      // Bei einer neuen Oferta ist nichts angekreuzt. Der Entwurf kann das
      // nicht ausdruecken (eine leere Kategorie wird zu "all"), deshalb steht
      // die Auswahl hier. Bei einer bestehenden Oferta steht da, was sie
      // wirklich traegt.
      intents: offer ? goIntentsFromCategory(draft.category) : [],
      // Das Foto, waehrend es noch unterwegs ist: die Adresse aus dem Speicher
      // des Telefons (previewUrl) und der Zustand des Uploads. Im Entwurf steht
      // erst die Adresse, die der Server zurueckgegeben hat - eine blob:-Adresse
      // ist morgen niemandes Foto.
      photo: { status: "idle", previewUrl: "", error: "" },
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
    renderEditor();
  }

  /**
   * Neu zeichnen, weil im Editor selbst etwas passiert ist.
   *
   * Der Unterschied zu einem gewoehnlichen render() ist die Erlaubnis, das
   * Modal neu zu schreiben, auch wenn gerade ein Feld den Fokus hat: Der Wirt
   * hat es ja selbst ausgeloest. Was von aussen kommt - eine Buchung, die
   * eintrifft - darf das nicht (siehe syncEditorOverlay).
   */
  function renderEditor() {
    editorRepaintForced = true;
    render();
    editorRepaintForced = false;
  }

  /**
   * Etwas am Vorteil aendern - eine Pille, ein Bereich, eine Bedingung.
   *
   * Wie patchDraft: Was auf dem Bildschirm steht, wird zuerst gerettet. Sonst
   * verliert der Wirt seinen halb getippten Paketnamen, weil er danebengetippt
   * hat, wo der Rabatt gilt.
   */
  function patchBenefit(patch = {}) {
    const current = view();
    if (!current?.editor) return;
    const typed = readEditorInputs().benefit || {};
    patchDraft({ benefit: { ...current.editor.draft?.benefit, ...typed, ...patch } });
  }

  /**
   * Die Angebotsart wechseln (Punkt 9, 10).
   *
   * Zwei Dinge passieren hier, und beide sind wichtig:
   *
   * Die verlassene Art wird gemerkt - mit dem, was gerade in ihren Feldern
   * stand. Und die neue kommt zurueck, wie sie verlassen wurde. Wer zwischen
   * den vier Arten hin und her tippt, um zu sehen, was es gibt, soll dabei
   * nichts verlieren.
   *
   * Vermischt wird trotzdem nichts: Der Entwurf traegt immer nur die Werte der
   * gewaehlten Art. Frueher blieb eine einmal getippte 10 im Vorteil stehen,
   * waehrend ihr Feld gar nicht mehr auf dem Bildschirm war - und die Vorschau
   * zeigte "–10 %" zu einer Paketa, die es fuer 14,90 € gab.
   */
  function setBenefitKind(nextKind = "") {
    const current = view();
    const editor = current?.editor;
    if (!editor) return;
    // Was auf dem Bildschirm steht, kommt zuerst - sonst wirft der Wechsel
    // weg, was gerade getippt und noch nicht in den Entwurf gelaufen ist.
    const typed = readEditorInputs().benefit || {};
    const active = { ...editor.draft?.benefit, ...typed };
    if (!editor.benefits || typeof editor.benefits !== "object") editor.benefits = {};
    if (active.kind) editor.benefits[active.kind] = active;
    if (active.kind === nextKind) {
      patchDraft({ benefit: active });
      return;
    }
    const remembered = editor.benefits[nextKind];
    patchDraft({ benefit: remembered ? { ...remembered, kind: nextKind } : { kind: nextKind } });
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
    // Die Zahl hinter "Tjetër". Sie steht nur da, wenn das Feld offen ist -
    // eine gewaehlte Pille schreibt ihren Wert direkt in den Entwurf.
    const percent = value("[data-go-benefit-percent]");
    if (percent !== null) benefit.percent = Number(String(percent).replace(/[^\d]/g, "")) || 0;
    // Ein Feld fuer drei Fragen: Paketinhalt, Gratisprodukt, Produktname.
    // Auf dem Bildschirm steht immer nur eines davon.
    const itemName = value("[data-go-benefit-item]");
    if (itemName !== null) benefit.itemName = itemName;
    // Preise kommen als Text ("14,90") und werden zu Cent - gerechnet wird in
    // ganzen Cent, damit aus 20,00 minus 14,90 nicht 5,099999999999999 wird.
    const regularPrice = value("[data-go-benefit-regular]");
    if (regularPrice !== null) benefit.regularPriceCents = parseGoPriceCents(regularPrice);
    const goPrice = value("[data-go-benefit-go]");
    if (goPrice !== null) benefit.goPriceCents = parseGoPriceCents(goPrice);
    const customCondition = value("[data-go-benefit-condition-text]");
    if (customCondition !== null) benefit.customCondition = customCondition;

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
      if (host && lastEditorHtml) host.innerHTML = "";
      lastEditorHtml = "";
      lastEditorKind = "";
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
    // Nur schreiben, wenn sich wirklich etwas geaendert hat.
    //
    // Die GO-Seite haengt am Firestore-Listener und zeichnet sich neu, sobald
    // irgendwo eine Buchung eintrifft. Wurde das Modal dabei jedes Mal neu
    // geschrieben, sprang der Bildlauf des Formulars zurueck nach oben und der
    // Finger scrollte gegen einen Kasten, der sich unter ihm zuruecksetzte.
    // Genau so fuehlte sich "man kann nicht gescheit scrollen" an.
    const nextHtml = renderGoOfferEditorCore({
      editor: current.editor,
      businessName,
      deps
    });
    if (nextHtml === lastEditorHtml) return;
    // Und waehrend getippt wird, schreibt nur der Editor selbst. Ein Neuaufbau
    // von aussen naehme dem Feld den Fokus und dem Telefon die Tastatur -
    // mitten im Wort. Die Vorschau zieht dabei von Hand nach (repaintPreview),
    // der Rest wartet auf den naechsten Handgriff.
    if (!editorRepaintForced && editorFieldHasFocus()) return;
    // Der Bildlauf bleibt, wo er war (Punkt 9, 27).
    //
    // Neu geschrieben wird das ganze Modal - und ein neuer Kasten faengt oben
    // an. Wer bei "Ku vlen zbritja?" stand und eine Pille antippte, sass danach
    // wieder bei der Ueberschrift und musste den Weg zurueck scrollen. Deshalb
    // wird die Hoehe vorher gelesen und nachher gesetzt: Die Section wechselt,
    // die Seite bleibt.
    const previousScroll = host.querySelector?.("[data-go-editor-scroll]")?.scrollTop || 0;
    host.innerHTML = nextHtml;
    lastEditorHtml = nextHtml;
    const scroller = host.querySelector?.("[data-go-editor-scroll]");
    if (scroller && previousScroll > 0) scroller.scrollTop = previousScroll;
    // Und nur bei einem echten Wechsel der Angebotsart blendet der neue
    // Bereich weich ein - nicht bei jedem angetippten Wert darin.
    const nextKind = String(current.editor.draft?.benefit?.kind || "");
    if (lastEditorKind && lastEditorKind !== nextKind) {
      host.querySelector?.("[data-go-benefit-form]")?.classList?.add("go-offer-form--enter");
    }
    lastEditorKind = nextKind;
  }

  function editorFieldHasFocus() {
    const active = doc?.activeElement;
    if (!active || typeof active.closest !== "function") return false;
    if (!active.closest("[data-go-offer-editor]")) return false;
    const tag = String(active.tagName || "").toLowerCase();
    return tag === "input" || tag === "textarea" || tag === "select";
  }

  function repaintPreview() {
    const current = view();
    const host = doc?.querySelector?.("[data-go-offer-preview]");
    if (!current?.editor || !host?.parentElement) return;
    const html = renderGoOfferPreviewCore({
      offer: current.editor.draft,
      businessName: current.restaurantName || "",
      // Auch beim Tippen bleibt das Foto in der Vorschau stehen, solange es
      // noch unterwegs ist.
      previewImageUrl: current.editor.photo?.previewUrl || "",
      deps
    });
    const holder = doc.createElement("div");
    holder.innerHTML = html;
    const next = holder.firstElementChild;
    if (next) host.replaceWith(next);
  }

  /**
   * Das Foto, das der Wirt gerade gewaehlt hat (Punkt 11, 12, 41).
   *
   * Drei Dinge passieren in dieser Reihenfolge, und die Reihenfolge ist der
   * Punkt:
   *
   * 1. Das Bild steht sofort da - aus dem Speicher des Telefons. Auf die
   *    Antwort des Servers zu warten, bevor ueberhaupt etwas zu sehen ist,
   *    fuehlt sich auf einer langsamen Leitung wie ein Fehler an.
   * 2. Es geht komprimiert zum Server. Ein Telefonfoto hat 12 Megapixel; auf
   *    der Karte des Gastes steht es 340 Punkte breit. Was hochgeladen wird,
   *    hat die lange Seite 1600 - alles darueber kostet den Gast Ladezeit und
   *    zeigt ihm kein Pixel mehr.
   * 3. Erst die Adresse des Servers geht in den Entwurf. Waere es die
   *    blob:-Adresse, stuende sie morgen in Firestore und zeigte nichts.
   */
  async function pickOfferPhoto(file = null) {
    const current = view();
    const editor = current?.editor;
    if (!editor || !file) return;
    if (!uploadImageFn) {
      editor.photo = { status: "error", previewUrl: "", error: "Ngarkimi i fotos nuk është i disponueshëm." };
      renderEditor();
      return;
    }
    const previousPreview = String(editor.photo?.previewUrl || "");
    let previewUrl = "";
    try {
      previewUrl = doc?.defaultView?.URL?.createObjectURL?.(file) || "";
    } catch {
      previewUrl = "";
    }
    // Die vorige Vorschau wird freigegeben - eine blob:-Adresse haelt die Datei
    // im Speicher, solange sie lebt.
    revokePreview(previousPreview);
    editor.photo = { status: "uploading", previewUrl, error: "" };
    renderEditor();

    try {
      const uploaded = await uploadImageFn(file, current.restaurantId);
      const url = String(uploaded?.cdnUrl || uploaded?.url || "").trim();
      if (!url) throw new Error("go-photo-missing-url");
      const live = view();
      // Das Modal kann in der Zwischenzeit geschlossen worden sein. Dann gibt
      // es keinen Entwurf mehr, in den das Bild gehoerte.
      if (!live?.editor) {
        revokePreview(previewUrl);
        return;
      }
      live.editor.photo = { status: "idle", previewUrl: "", error: "" };
      revokePreview(previewUrl);
      patchDraft({ imageUrl: url });
    } catch (error) {
      const live = view();
      if (!live?.editor) {
        revokePreview(previewUrl);
        return;
      }
      // Das Bild bleibt stehen, die Meldung steht darunter: Der naechste
      // Handgriff ist "noch einmal", nicht "von vorne".
      live.editor.photo = {
        status: "error",
        previewUrl,
        error: String(error?.message || "").trim() || "Fotoja nuk u ngarkua. Provo prapë."
      };
      renderEditor();
    }
  }

  function revokePreview(url = "") {
    const value = String(url || "");
    if (!value.startsWith("blob:")) return;
    try {
      doc?.defaultView?.URL?.revokeObjectURL?.(value);
    } catch {
      // Ein nicht freigegebener Blob ist Speicher, kein Fehler.
    }
  }

  function removeOfferPhoto() {
    const current = view();
    if (!current?.editor) return;
    revokePreview(current.editor.photo?.previewUrl);
    current.editor.photo = { status: "idle", previewUrl: "", error: "" };
    patchDraft({ imageUrl: "" });
  }

  /**
   * Nach AKTIVIZO zur ersten fehlenden Angabe (Punkt 43).
   *
   * Nicht zehn Meldungen auf einmal und keine Liste oben im Modal: Die
   * Meldungen stehen an ihren Feldern, und der Editor faehrt zur ersten davon.
   * Wer sie gelesen hat, hat das Feld schon vor sich.
   */
  function focusFirstError() {
    const host = doc?.getElementById?.(EDITOR_OVERLAY_ID);
    const node = host?.querySelector?.("[data-go-error]");
    if (!node || typeof node.scrollIntoView !== "function") return;
    try {
      node.scrollIntoView({ block: "center", behavior: "smooth" });
    } catch {
      node.scrollIntoView();
    }
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
    // aus einer leeren Kategorie stillschweigend "all". Gefragt wird deshalb
    // die Auswahl des Editors, nicht der Entwurf.
    const chosenIntents = Array.isArray(current.editor.intents)
      ? current.editor.intents
      : goIntentsFromCategory(current.editor.draft.category);
    if (!goCategoryFromIntents(chosenIntents).length) {
      current.editor.errors = [{ field: "category", message: "Zgjidh kur duhet të shfaqet oferta." }];
      renderEditor();
      focusFirstError();
      return;
    }
    current.editor.saving = true;
    current.editor.errors = [];
    current.editor.status = "";
    renderEditor();

    const result = await dataController.saveOffer(current.editor.draft);
    if (!result.ok) {
      current.editor.saving = false;
      current.editor.errors = result.errors.filter((entry) => entry.field);
      current.editor.status = result.errors.find((entry) => !entry.field)?.message || "";
      renderEditor();
      focusFirstError();
      return;
    }
    current.editor = null;
    current.tab = "offers";
    render();
  }

  /**
   * Der Zustand eines Handgriffs - am Knoten, nicht ueber ein Neuzeichnen.
   *
   * Ein Neuzeichnen ersetzte den Knopf, und ein ersetzter Knopf faengt seine
   * Bewegung von vorne an - der Bogen spraenge bei jedem Durchgang zurueck.
   * Deshalb ist der Wechsel hier EIN Attribut, und den Rest macht das Blatt.
   */
  function setPhase(node, phase = "idle") {
    if (!node) return;
    node.setAttribute("data-go-phase", phase);
  }

  function laterPhase(node, phase, delay) {
    if (phaseTimer) clearTimeout(phaseTimer);
    phaseTimer = setTimeout(() => {
      phaseTimer = 0;
      setPhase(node, phase);
    }, delay);
  }

  function setBusyAttr(node, busy) {
    if (!node) return;
    if (busy) node.setAttribute("disabled", "disabled");
    else node.removeAttribute("disabled");
  }

  /**
   * Die Zeile unter dem Feld - oder unter dem Angebot, je nachdem, welche
   * Schicht gerade zu sehen ist.
   *
   * Beide Zeilen stehen IMMER im Aufbau; hier kommt nur der Satz hinein und
   * an die Karte das Zeichen, dass es einen gibt. Daran haengt ihre Hoehe.
   *
   * Das ist der Grund, warum ein Fehler nichts kostet: kein Neuzeichnen, also
   * bleibt der getippte Code im Feld, die gefundene Oferta auf der Karte und
   * die eingestellte Personenzahl im Zaehler. Der Kellner drueckt einfach
   * noch einmal.
   */
  function setNote(text = "") {
    const card = activateCardNode();
    const value = String(text || "").trim();
    const inDone = card?.getAttribute?.("data-go-found") === "1";
    const node = doc?.querySelector?.(inDone ? "[data-go-done-status]" : "[data-go-code-status]");
    if (node) node.textContent = value;
    if (card) card.setAttribute("data-go-note", value ? "1" : "0");
  }

  function codeButtonNode() {
    return doc?.querySelector?.("[data-go-code-submit]") || null;
  }

  function finalizeButtonNode() {
    return doc?.querySelector?.("[data-go-booking-finalize]") || null;
  }

  /**
   * Den Satz aus einem Fehler holen.
   *
   * Der Server schickt bereits einen Satz auf Albanisch - ein zweiter daneben
   * waere nur Rauschen. Was KEIN Satz ist (ein blosser Code wie
   * "unavailable"), wird zu dem einen kurzen Satz, mit dem ein Kellner etwas
   * anfangen kann.
   */
  function noteFromError(error) {
    const raw = String(error?.message || "").trim();
    return raw && raw.includes(" ") ? raw : BUSINESS_GO_TEXTS.codeRetry;
  }

  /**
   * Den Weg zum Server warmlaufen lassen.
   *
   * Der erste Klick auf "Aktivizo" bezahlte bisher drei Dinge auf einmal: das
   * Nachladen des API-Moduls, das Nachladen des Firebase-Functions-SDK und
   * erst dann den Aufruf selbst. Auf einem Telefon im Lokal sind das
   * Sekunden, und sie fallen genau in dem Augenblick an, in dem der Gast
   * davorsteht.
   *
   * Die ersten beiden kann man vorziehen: Sie brauchen kein Netz zum Server
   * und keine Anmeldung, sie sind nur Dateien. Sobald der Reiter offen ist,
   * werden sie geholt - dann steht der Weg, wenn der Kellner ihn braucht.
   *
   * Es wird dabei NICHTS aufgerufen und nichts geschrieben. Faellt es aus,
   * faellt es still aus: Der Klick laedt dann eben selbst nach, so wie
   * vorher.
   */
  function prewarm() {
    if (prewarmed || typeof prewarmFn !== "function") return;
    prewarmed = true;
    try {
      const done = prewarmFn();
      if (done && typeof done.catch === "function") done.catch(() => {});
    } catch {}
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
   *
   * Gezeichnet wird hier erst am Ende und nur im Erfolgsfall. Alles davor
   * geht an lebende Knoten: der Knopf faehrt seine Bewegung, die Zeile unter
   * dem Feld bekommt ihren Satz. Ein Neuzeichnen mittendrin haette beides
   * abgeschnitten und den getippten Code aus dem Feld genommen.
   */
  async function searchByCode() {
    const current = view();
    if (!current || !findBookingFn) return;
    // Zweimal tippen ist einmal. Der Knopf ist zwar zu, aber ein Doppelklick
    // trifft ihn, bevor er es ist.
    if (current.search?.busy) return;
    const code = readCodeInput();
    if (!code) return;

    const button = codeButtonNode();
    current.search = { ...current.search, code, status: "", booking: null, busy: true };
    setNote("");
    setPhase(button, "busy");
    setBusyAttr(button, true);

    let booking = null;
    let failure = "";
    try {
      booking = await findBookingFn({ shortCode: code, restaurantId: current.restaurantId });
      // Ein Server, der nichts findet, kann das auf zwei Arten sagen: mit
      // einem Fehler oder mit einer leeren Antwort. Beide bedeuten dasselbe,
      // und der Kellner soll beide Male denselben Satz lesen.
      if (!booking) failure = BUSINESS_GO_TEXTS.codeNotFound;
    } catch (error) {
      failure = noteFromError(error);
    }

    if (!view()) return;

    if (failure) {
      // Der Code bleibt im Feld: Ein Kellner vertippt sich in einer Ziffer
      // und will genau die eine aendern, nicht alles neu tippen.
      current.search = { code, status: failure, busy: false, booking: null };
      setNote(failure);
      setPhase(button, "fail");
      setBusyAttr(button, false);
      laterPhase(button, "idle", PHASE_FAIL_MS);
      return;
    }

    // Der Haken als Quittung, und danach faehrt die Karte auf.
    current.search = { code, status: "", busy: false, booking };
    setPhase(button, "done");
    if (phaseTimer) clearTimeout(phaseTimer);
    phaseTimer = setTimeout(() => {
      phaseTimer = 0;
      if (!view()?.search?.booking) return;
      render();
    }, PHASE_DONE_MS);
  }

  /**
   * Die Personenzahl um eins - am Feld selbst, ohne Neuzeichnen.
   *
   * Das Feld ist unveraendert die einzige Stelle, an der diese Zahl steht:
   * Es haelt sie, die Finalisierung liest sie von dort, und niemand sonst
   * kennt sie. Ein Griff schreibt deshalb in dasselbe Feld, statt einen
   * zweiten Zustand daneben aufzumachen - sonst gaebe es zwei Zahlen, und
   * abgerechnet wuerde irgendwann die falsche.
   *
   * Die Grenzen kommen aus dem Feld (min/max) und nicht von hier: Was
   * erlaubt ist, steht im Aufbau, und es soll an genau EINER Stelle stehen.
   *
   * Gezeichnet wird nicht. Ein Neuzeichnen ersetzte die Schicht, in der der
   * Griff gerade gedrueckt wurde - und eine ersetzte Schicht faehrt ihre
   * Bewegung von vorne. Getippte Zahlen ueberlebten frueher aus demselben
   * Grund nur, weil hier nichts gezeichnet wurde; das bleibt so.
   */
  function stepPartySize(delta = 0) {
    const input = doc?.querySelector?.("[data-go-confirm-party]");
    if (!input || !delta) return;
    const min = Math.trunc(Number(input.min) || 1);
    const max = Math.trunc(Number(input.max) || 10);
    const now = Math.trunc(Number(input.value) || min);
    const next = Math.min(max, Math.max(min, now + delta));
    if (next === now) return;
    input.value = String(next);
  }

  /**
   * Die Finalisierung. Sie geht ueber den Code, nicht ueber die Kennung -
   * deshalb steht der Code hier noch einmal mit auf der Leitung.
   *
   * Hier entsteht Geld. Ein Knopf an einer Zeile der Liste waere ein Knopf,
   * den das Lokal ohne Gast druecken kann - deshalb gibt es ihn nur an der
   * Buchung, die gerade ueber ihren Code gefunden wurde.
   */
  async function finalizeFoundBooking(bookingId = "") {
    const current = view();
    if (!current || !finalizeBookingFn || !current.search?.booking) return;
    if (bookingId && current.search.booking.id !== bookingId) return;
    // Zweimal tippen ist einmal - und hier entsteht Geld.
    if (current.search.busy) return;

    const button = finalizeButtonNode();
    const partyNode = doc?.querySelector?.("[data-go-confirm-party]");
    const partySize = Math.trunc(Number(partyNode?.value) || 0);
    current.search = { ...current.search, busy: true, status: "" };
    setNote("");
    setPhase(button, "busy");
    setBusyAttr(button, true);

    try {
      await finalizeBookingFn({
        shortCode: current.search.code,
        restaurantId: current.restaurantId,
        partySize
      });
    } catch (error) {
      if (!view()) return;
      // Die Karte bleibt stehen, und mit ihr die Oferta, der Code und die
      // Zahl, die der Kellner gerade eingestellt hat. Es wird NICHT
      // gezeichnet: Ein Neuaufbau naehme genau diese Zahl wieder aus dem
      // Zaehler, und der Kellner muesste von vorne anfangen.
      const failure = noteFromError(error) === BUSINESS_GO_TEXTS.codeRetry
        ? BUSINESS_GO_TEXTS.finalizeFailed
        : noteFromError(error);
      current.search = { ...current.search, busy: false, status: failure };
      setNote(failure);
      setPhase(button, "fail");
      setBusyAttr(button, false);
      laterPhase(button, "idle", PHASE_FAIL_MS);
      return;
    }

    if (!view()) return;
    current.search = { ...current.search, busy: false, status: "" };
    setPhase(button, "done");
    // Hier ist gerade Geld entstanden. Die Karte "Per pagese" soll das jetzt
    // zeigen und nicht erst, wenn der naechste Gast sucht - aber NIEMAND
    // wartet darauf: Der Abschluss ist bestaetigt, und die Zahl daneben darf
    // eine Sekunde spaeter stimmen (fire and forget).
    void dataController?.refreshOverview?.({ force: true });
    // Der Haken steht kurz, dann faehrt die Karte dieselbe Bewegung
    // rueckwaerts, die die Buchung hergebracht hat, und steht danach wieder
    // als leere Eingabemaske da - bereit fuer den naechsten Gast.
    if (phaseTimer) clearTimeout(phaseTimer);
    phaseTimer = setTimeout(() => {
      phaseTimer = 0;
      if (!view()) return;
      closeFoundBooking();
    }, PHASE_DONE_MS);
  }

  /**
   * Die sichtbare Gruppe wechseln - und NUR sie.
   *
   * Zwei Dinge passieren hier nicht, und beide sind der Punkt:
   *
   *  1. Es wird KEIN Reiter geoeffnet. Was offen ist, bleibt offen, bis
   *     jemand eine Pille antippt.
   *  2. Es wird NICHT neu gezeichnet. Ein Neuzeichnen geht durch die Shell,
   *     und die ersetzt appEl.innerHTML - damit waere auch die Karten-Reihe
   *     darueber neu, und ihre waagerechte Scrollposition spraenge zurueck
   *     auf die erste Karte. Genau das war der Sprung, den man beim Wischen
   *     gesehen hat.
   *
   * Stattdessen wird ein Attribut an der Leiste gesetzt. Das Stylesheet
   * haengt daran: die Verschiebung des Bandes und welcher Pfeil sichtbar ist.
   * Kein Knoten der Seite wird ersetzt, also kann auch keiner seine
   * Scrollposition verlieren.
   *
   * Ohne DOM - im Test - bleibt der Zustand trotzdem richtig; gezeichnet wird
   * dann beim naechsten regulaeren Durchgang.
   */
  function setTabGroup(next) {
    const current = view();
    if (!current) return;
    const last = GO_TAB_GROUPS.length - 1;
    const target = Math.min(Math.max(Math.trunc(Number(next) || 0), 0), last);
    if (target === current.tabGroup) return;
    current.tabGroup = target;
    applyTabGroupToDom();
  }

  /**
   * Den Wechsel in die Leiste schreiben, ohne die Seite anzufassen.
   *
   * Drei Attribute, ein Knopf - mehr braucht es nicht: Die Verschiebung und
   * der Pfeil stehen im Stylesheet, die Gruppe hinter dem Fensterrand
   * bekommt inert und aria-hidden, damit weder Finger noch Tabulatortaste
   * noch Sprachausgabe sie dort finden.
   */
  function applyTabGroupToDom() {
    const current = view();
    const bar = doc?.querySelector?.("[data-go-tabs]");
    if (!current || !bar) return false;
    bar.setAttribute("data-go-tab-group", String(current.tabGroup));
    const panes = bar.querySelectorAll?.("[data-go-tab-pane]") || [];
    panes.forEach((pane) => {
      const shown = Number(pane.getAttribute("data-go-tab-pane")) === current.tabGroup;
      if (shown) {
        pane.removeAttribute("aria-hidden");
        pane.removeAttribute("inert");
        return;
      }
      pane.setAttribute("aria-hidden", "true");
      pane.setAttribute("inert", "");
    });
    const turn = bar.querySelector?.("[data-go-tab-group-turn]");
    if (turn) {
      const label = current.tabGroup < GO_TAB_GROUPS.length - 1
        ? BUSINESS_GO_TEXTS.groupNext
        : BUSINESS_GO_TEXTS.groupBack;
      turn.setAttribute("aria-label", label);
      turn.setAttribute("title", label);
    }
    return true;
  }

  /**
   * Waagerecht wischen wechselt die Gruppe.
   *
   * Die Zuhoerer haengen an der LEISTE und nicht am Dokument. Das ist keine
   * Feinheit: Ein Zuhoerer am Dokument haette jede Geste der Seite gesehen -
   * die Karten-Reihe darueber wischt selbst, die Listen darunter scrollen -
   * und zwei Dinge, die auf denselben Finger hoeren, streiten sich.
   *
   * Die Seite darf dabei nicht mitgehen. Dafuer greifen zwei Regeln
   * ineinander:
   *
   *  - touch-action: pan-y an der Leiste. Der Browser uebernimmt nur noch das
   *    senkrechte Scrollen; waagerecht wird gar nicht erst gepannt.
   *  - Sobald die Geste eindeutig waagerecht ist, sagt touchmove das Scrollen
   *    ab (preventDefault). Deshalb ist dieser eine Zuhoerer nicht passiv -
   *    die beiden anderen schon, denn sie halten nichts auf.
   *
   * Entschieden wird erst nach acht Punkten Bewegung: Bis dahin weiss
   * niemand, ob das ein Wisch oder der Beginn eines Scrollens ist, und
   * solange bleibt das Scrollen unangetastet.
   */
  function bindSwipe(bar) {
    if (!bar || typeof bar.addEventListener !== "function") return;
    let startX = 0;
    let startY = 0;
    let tracking = false;
    let axis = "";

    const reset = () => { tracking = false; axis = ""; };

    bar.addEventListener("touchstart", (event) => {
      reset();
      const touch = event.touches && event.touches.length === 1 ? event.touches[0] : null;
      if (!touch) return;
      startX = touch.clientX;
      startY = touch.clientY;
      tracking = true;
    }, { passive: true });

    bar.addEventListener("touchmove", (event) => {
      if (!tracking) return;
      const touch = event.touches && event.touches.length === 1 ? event.touches[0] : null;
      if (!touch) return;
      const dx = touch.clientX - startX;
      const dy = touch.clientY - startY;
      if (!axis) {
        if (Math.abs(dx) < SWIPE_DECIDE_AFTER && Math.abs(dy) < SWIPE_DECIDE_AFTER) return;
        axis = Math.abs(dx) > Math.abs(dy) * SWIPE_DIRECTION_RATIO ? "x" : "y";
      }
      // Waagerecht: Die Seite bleibt stehen. Senkrecht: Sie scrollt wie
      // ueberall sonst, und wir sehen nur zu.
      if (axis === "x" && event.cancelable) event.preventDefault();
    }, { passive: false });

    bar.addEventListener("touchend", (event) => {
      if (!tracking) return;
      const wasHorizontal = axis === "x";
      reset();
      if (!wasHorizontal) return;
      const touch = event.changedTouches && event.changedTouches.length ? event.changedTouches[0] : null;
      if (!touch) return;
      const dx = touch.clientX - startX;
      if (Math.abs(dx) < SWIPE_MIN_DISTANCE) return;
      const current = view();
      if (!current) return;
      // Nach links wischen heisst weiterblaettern - die naechste Gruppe kommt
      // von rechts herein, wie das Band es zeigt.
      setTabGroup(current.tabGroup + (dx < 0 ? 1 : -1));
    }, { passive: true });

    bar.addEventListener("touchcancel", reset, { passive: true });
  }

  /**
   * Die Geste an die Leiste haengen, die gerade im Dokument steht.
   *
   * Ein Neuzeichnen der Seite ersetzt die Leiste durch einen neuen Knoten -
   * die Zuhoerer am alten sind damit wertlos. Statt sie am Dokument zu
   * befestigen (wo sie jede fremde Geste saehen), wird nach jedem Zeichnen
   * geprueft, ob die Leiste noch dieselbe ist, und nur dann neu gebunden.
   */
  /**
   * Wo die Karten-Reihe steht, bevor die Seite neu geschrieben wird.
   *
   * Die Shell ersetzt appEl.innerHTML - jeder Knoten der Seite ist danach ein
   * neuer, und ein neuer Kasten faengt links an. Ein Wirt, der zur dritten
   * Karte gewischt hat und dann eine Buchung hereinkommt, sass danach wieder
   * bei der ersten.
   *
   * Der Gruppenwechsel der Leiste geht diesen Weg gar nicht mehr (siehe
   * setTabGroup). Aber die Reihe wird auch von jeder Buchung und jeder Zahl
   * neu geschrieben, und der Sprung sieht dort genauso aus.
   */
  function rememberKpiScroll() {
    const row = doc?.querySelector?.("[data-go-kpis]");
    if (!row) return;
    lastKpiRow = row;
    lastKpiScroll = Number(row.scrollLeft) || 0;
  }

  /**
   * Und sie wieder dorthin stellen - aber nur, wenn sie WIRKLICH ersetzt
   * wurde.
   *
   * Der Vergleich der Knoten ist der ganze Unterschied: Steht dieselbe Reihe
   * noch da, hat niemand sie ersetzt, und dann gehoert ihre Position dem
   * Finger und nicht diesem Code. Nur eine neue Reihe bekommt den alten Stand
   * gesetzt.
   */
  function restoreKpiScroll() {
    const row = doc?.querySelector?.("[data-go-kpis]");
    if (!row || !lastKpiScroll) return;
    if (row === lastKpiRow) return;
    lastKpiRow = row;
    row.scrollLeft = lastKpiScroll;
  }

  // Was nach dem Zeichnen zu tun ist, wenn die Seite wirklich im Dokument
  // steht: die Geste an die neue Leiste haengen und die Karten-Reihe dorthin
  // stellen, wo sie stand.
  function scheduleAfterPaint() {
    if (!doc || afterPaintQueued) return;
    afterPaintQueued = true;
    const run = () => {
      afterPaintQueued = false;
      restoreKpiScroll();
      ensureSwipeBinding();
      // Ein Neuzeichnen ersetzt das <video> der Aktivizo-Karte. Der Strom
      // laeuft weiter - er muss nur wieder an den neuen Knoten.
      if (view()?.camera?.open === true) attachCameraStream();
      // Und jetzt, wo die Karte im Dokument steht, faehrt sie auf ihr Ziel.
      applyFoundState();
      // Der Weg zum Server wird jetzt geholt und nicht erst beim Klick.
      prewarm();
    };
    const raf = typeof requestAnimationFrame === "function" ? requestAnimationFrame : null;
    if (raf) raf(run); else setTimeout(run, 0);
  }

  function ensureSwipeBinding() {
    const bar = doc?.querySelector?.("[data-go-tabs]");
    if (!bar || bar === boundSwipeNode) return;
    boundSwipeNode = bar;
    bindSwipe(bar);
  }

  // ==========================================================================
  // Die Kamera der Aktivizo-Karte.
  //
  // Was sie HEUTE tut: aufgehen, das Bild zeigen, wieder zugehen. Mehr nicht.
  // Es wird nichts gelesen, nichts erkannt und nichts aktiviert - der Weg zur
  // Aktivierung bleibt der Code im Feld daneben, unveraendert. Wenn spaeter
  // eine Erkennung dazukommt, haengt sie sich an diesen Strom und schliesst
  // die Karte ueber genau dieselbe Rueckbewegung.
  // ==========================================================================

  function activateCardNode() {
    return doc?.querySelector?.("[data-go-activate]") || null;
  }

  /**
   * Den Zustand an die Karte schreiben - ohne die Seite neu zu zeichnen.
   *
   * Ein Neuzeichnen wuerde den <video>-Knoten ersetzen, und ein ersetzter
   * Knoten zeigt kein Bild mehr, bis der Strom wieder daran haengt. Deshalb
   * ist der Wechsel hier ein Attribut an einem Knoten, der stehen bleibt.
   * Gerendert wird der Zustand trotzdem (data-go-camera kommt aus dem
   * Zustand) - dann naemlich, wenn die Seite aus einem anderen Grund neu
   * gezeichnet wird.
   */
  function applyCameraState() {
    const current = view();
    const card = activateCardNode();
    if (!current) return;
    if (!card) {
      render();
      return;
    }
    // EIN Attribut, und den Rest macht das Stylesheet: Beide Zustaende sind
    // gleich gross und liegen deckungsgleich, also gibt es hier keine Hoehe zu
    // messen und keine Bewegung zu steuern. Frueher stand hier genau das - und
    // es war nur noetig, weil die Karte ihre Hoehe wechselte.
    card.setAttribute("data-go-camera", current.camera?.open ? "1" : "0");
  }

  /**
   * Die Schicht der gefundenen Buchung an ihr Ziel stellen.
   *
   * Genau wie bei der Kamera ist der Wechsel EIN Attribut und kein Neuaufbau:
   * Das Blatt kennt beide Zustaende und faehrt die Bewegung, sobald sich das
   * Attribut an einem Knoten aendert, der schon im Dokument steht.
   */
  function applyFoundState() {
    const card = activateCardNode();
    if (!card) {
      // Keine Karte auf dem Schirm - dann zeigt sie auch keine Buchung. Wer
      // zurueckkommt, soll die Bewegung wieder von vorn sehen.
      shownBooking = false;
      return;
    }
    const wanted = !!view()?.search?.booking;
    card.setAttribute("data-go-found", wanted ? "1" : "0");
    shownBooking = wanted;
  }

  /**
   * Die Buchung wieder hinausfahren - nach einem Abschluss.
   *
   * Hier wird bewusst NICHT gezeichnet: Ein Neuzeichnen ersetzte die Schicht,
   * und eine ersetzte Schicht bewegt sich nicht, sie ist einfach weg. Der
   * Zustand ist sofort leer, im Aufbau steht die Buchung noch - und was da
   * hinausfaehrt, ist genau dieses Bild. Aufgeraeumt wird, wenn die Bewegung
   * durch ist.
   */
  function closeFoundBooking() {
    const current = view();
    if (!current) return;
    current.search = { code: "", status: "", busy: false, booking: null };
    shownBooking = false;
    const card = activateCardNode();
    if (!card) {
      render();
      return;
    }
    // Das Feld ist gleich wieder zu sehen, und es soll leer sein: Der naechste
    // Gast faengt nicht mit dem Code des vorigen an. Der Knoten lebt, also
    // steht die Leere sofort da und nicht erst nach dem Aufraeumen.
    const input = doc?.querySelector?.("[data-go-code-input]");
    if (input) input.value = "";
    // Und ohne die Meldung von vorhin: Sie gehoerte zu einem Abschluss, der
    // nicht durchging, und die Karte haelt fuer sie eine Zeile Hoehe frei.
    // Bliebe die Marke stehen, zoege sich die Karte auf eine Hoehe zusammen,
    // die eine Zeile zu gross ist - und rutschte beim naechsten Zeichnen
    // nach.
    card.setAttribute("data-go-note", "0");
    card.setAttribute("data-go-found", "0");
    if (bookingExitTimer) clearTimeout(bookingExitTimer);
    bookingExitTimer = setTimeout(() => {
      bookingExitTimer = 0;
      if (!view()) return;
      render();
    }, BOOKING_EXIT_MS);
  }

  /**
   * Ob das Kamerabild zu sehen ist. Die Flaeche darunter steht die ganze Zeit
   * in ihrer Endgroesse - hier geht es nur darum, ob etwas darin steht.
   */
  function markCameraReady(ready) {
    const card = activateCardNode();
    if (card) card.setAttribute("data-go-cam-ready", ready ? "1" : "0");
  }

  /**
   * Den Strom an das Bild haengen - und das Bild erst zeigen, wenn es eines
   * ist.
   *
   * Ein <video>, das schon sichtbar ist, waehrend der Strom anlaeuft, ist
   * erst leer und dann kurz hochkant, bevor es sich zurechtrueckt. Beides
   * sieht man. Deshalb wird gewartet, bis der Knoten MASSE hat
   * (videoWidth/videoHeight) und play() durch ist - und erst dann blendet das
   * Bild auf.
   *
   * Kommt in vier Sekunden nichts, laeuft die Kamera nicht. Dann wird sie
   * sauber beendet und die Karte geht zurueck auf das Codefeld: Ein schwarzes
   * Rechteck, das stehen bleibt, ist schlimmer als ein Satz, der sagt, dass
   * es den Code auch noch gibt.
   */
  function attachCameraStream() {
    const video = doc?.querySelector?.("[data-go-camera-video]");
    if (!video || !cameraStream) return;
    if (video.srcObject !== cameraStream) video.srcObject = cameraStream;
    markCameraReady(false);

    const settle = () => {
      if (!cameraStream || view()?.camera?.open !== true) return;
      if (!(Number(video.videoWidth) > 0 && Number(video.videoHeight) > 0)) return;
      if (cameraReadyTimer) { clearTimeout(cameraReadyTimer); cameraReadyTimer = 0; }
      markCameraReady(true);
    };

    try {
      video.addEventListener?.("loadedmetadata", settle, { once: true });
      video.addEventListener?.("playing", settle, { once: true });
    } catch {}

    if (cameraReadyTimer) clearTimeout(cameraReadyTimer);
    cameraReadyTimer = setTimeout(() => {
      cameraReadyTimer = 0;
      if (view()?.camera?.open !== true) return;
      if (activateCardNode()?.getAttribute?.("data-go-cam-ready") === "1") return;
      failCamera(BUSINESS_GO_TEXTS.cameraFailed);
    }, CAMERA_READY_TIMEOUT_MS);

    try {
      const played = video.play?.();
      // Safari gibt ein Versprechen zurueck, das bricht, wenn der Knoten
      // gerade wieder verschwindet. Das ist kein Fehler, den jemand sehen
      // muss - aber ein Bild gibt es dann auch nicht.
      if (played && typeof played.then === "function") played.then(settle).catch(() => {});
      else settle();
    } catch {}
  }

  /**
   * Die Kamera aufgeben - und dabei nichts stehen lassen.
   *
   * Der Strom wird vollstaendig angehalten (sonst leuchtet die Kamera des
   * Telefons weiter), die Karte faehrt zurueck auf das Codefeld, und unter
   * dem Feld steht, was passiert ist. Getippt werden kann sofort wieder: Das
   * Feld war die ganze Zeit da, nur nicht zu sehen.
   */
  function failCamera(message = "") {
    const current = view();
    stopCameraStream();
    markCameraReady(false);
    if (!current) return;
    current.camera = { open: false, error: message };
    applyCameraState();
    setNote(message);
  }

  function stopCameraStream() {
    if (cameraReadyTimer) { clearTimeout(cameraReadyTimer); cameraReadyTimer = 0; }
    const video = doc?.querySelector?.("[data-go-camera-video]");
    if (video) {
      try { video.pause?.(); } catch {}
      try { video.srcObject = null; } catch {}
    }
    if (!cameraStream) return;
    // Jede Spur einzeln anhalten. Nur den Verweis fallen zu lassen liesse die
    // Kamera auf dem Telefon weiterlaufen - samt Leuchte daneben.
    try {
      cameraStream.getTracks?.().forEach((track) => {
        try { track.stop?.(); } catch {}
      });
    } catch {}
    cameraStream = null;
  }

  async function openCamera() {
    const current = view();
    if (!current || current.camera?.open) return;
    const media = win?.navigator?.mediaDevices
      || (typeof navigator === "undefined" ? null : navigator.mediaDevices);
    // Kein Zugang zu Kameras - ein alter Browser, oder die Seite laeuft nicht
    // ueber https. Das kann der Kellner nicht erlauben; er braucht den Code.
    if (!media?.getUserMedia) {
      current.camera = { open: false, error: BUSINESS_GO_TEXTS.cameraFailed };
      setNote(BUSINESS_GO_TEXTS.cameraFailed);
      return;
    }
    setNote("");
    // Erst aufmachen, dann fragen: Der Browser fragt selbst nach der
    // Erlaubnis, und das dauert. Eine Karte, die erst nach dem Ja umschaltet,
    // sieht in dieser Zeit aus, als haette der Knopf nicht getroffen.
    current.camera = { open: true, error: "" };
    applyCameraState();
    let stream = null;
    try {
      stream = await media.getUserMedia({
        // Die Kamera auf der Rueckseite - ein Kellner haelt das Telefon auf
        // den Code des Gastes. "ideal" und nicht "exact": Auf einem Geraet mit
        // nur einer Kamera waere "exact" ein Fehlschlag statt der Kamera, die
        // da ist.
        video: { facingMode: { ideal: "environment" } },
        audio: false
      });
    } catch (error) {
      // Zwei verschiedene Sachen, zwei verschiedene Saetze: Wer verweigert
      // hat, kann etwas erlauben; wessen Kamera nicht da ist, kann das nicht
      // und soll den Code nehmen. Der Systemdialog des Browsers wird dabei
      // nicht nachgebaut - er gehoert dem Browser.
      const denied = /NotAllowed|Permission|SecurityError/i.test(
        String(error?.name || "") + " " + String(error?.message || "")
      );
      failCamera(denied ? BUSINESS_GO_TEXTS.cameraDenied : BUSINESS_GO_TEXTS.cameraFailed);
      return;
    }
    // Zwischenzeitlich zugemacht? Dann gehoert der Strom niemandem mehr.
    if (view()?.camera?.open !== true) {
      try {
        stream.getTracks?.().forEach((track) => {
          try { track.stop?.(); } catch {}
        });
      } catch {}
      return;
    }
    cameraStream = stream;
    attachCameraStream();
  }

  function closeCamera({ silent = false } = {}) {
    const current = view();
    const wasOpen = current?.camera?.open === true;
    stopCameraStream();
    markCameraReady(false);
    if (!current) return;
    current.camera = { open: false, error: "" };
    if (silent || !wasOpen) return;
    applyCameraState();
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
      // Die einzige Ausnahme steht in der globalen Kopfzeile: der Knopf zu den
      // Einstellungen. Er liegt ausserhalb der Seite, meint aber genau ihren
      // Reiter "options" - denselben, den frueher der runde Knopf im Inhalt
      // oeffnete.
      if (!target.closest("[data-go-admin], [data-go-offer-editor], [data-go-header-settings]")) return;

      // Der Pfeil blaettert die Gruppe - und sonst nichts. Er steht VOR dem
      // Reiter-Griff, weil er selbst kein Reiter ist: Waere er einer, waehlte
      // jedes Blaettern etwas aus, und der Wirt saehe unter der Leiste eine
      // andere Ansicht, ohne sie geoeffnet zu haben.
      // Der Pfeil zeigt immer auf die andere Gruppe - bei zweien ist das die
      // jeweils andere. Die Richtung steht deshalb nicht am Knopf, sondern
      // ergibt sich aus dem Stand.
      if (target.closest("[data-go-tab-group-turn]")) {
        setTabGroup(current.tabGroup === 0 ? 1 : 0);
        return;
      }

      // Die Kamera. Sie steht VOR dem Reiter-Griff, weil ihre beiden Knoepfe
      // in der Karte liegen und sonst nichts auswaehlen.
      if (target.closest("[data-go-camera-open]")) {
        void openCamera();
        return;
      }
      if (target.closest("[data-go-camera-close]")) {
        closeCamera();
        return;
      }

      const tab = target.closest("[data-go-business-tab]");
      if (tab) {
        // Wer den Reiter wechselt, laesst keine laufende Kamera hinter sich:
        // Die Karte verschwindet mit dem Reiter, der Strom nicht.
        closeCamera({ silent: true });
        current.tab = tab.getAttribute("data-go-business-tab") || "active";
        // Ein Reiter, der von aussen kommt - der Knopf fuer die Einstellungen
        // oben steht in keiner Gruppe -, laesst die Leiste dort, wo sie ist.
        // Einer aus der Leiste behaelt sie ohnehin.
        const belongsTo = goTabGroupIndex(current.tab);
        if (belongsTo !== -1) current.tabGroup = belongsTo;
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

      // Minus und Plus am Zaehler. Sie stehen VOR dem Abschluss, weil sie in
      // derselben Schicht liegen und mit ihm nichts zu tun haben: Sie
      // bewegen eine Zahl, sie schliessen nichts ab.
      const partyStep = target.closest("[data-go-party-step]");
      if (partyStep) {
        stepPartySize(Math.trunc(Number(partyStep.getAttribute("data-go-party-step")) || 0));
        return;
      }

      const finalize = target.closest("[data-go-booking-finalize]");
      if (finalize) {
        void finalizeFoundBooking(finalize.getAttribute("data-go-booking-id") || "");
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
        setBenefitKind(kind.getAttribute("data-go-benefit-kind"));
        return;
      }
      // Die schnellen Prozentwerte und "Tjetër" (Punkt 4.1, 4.2). "Tjetër"
      // aendert am Angebot nichts - es oeffnet nur das Feld, in das das Lokal
      // seine eigene Zahl schreibt.
      const discount = target.closest("[data-go-discount]");
      if (discount) {
        const raw = discount.getAttribute("data-go-discount") || "";
        if (!current.editor) return;
        if (raw === "other") {
          current.editor.percentCustom = true;
          patchBenefit({});
          return;
        }
        current.editor.percentCustom = false;
        patchBenefit({ percent: Number(raw) || 0 });
        return;
      }
      const scope = target.closest("[data-go-discount-scope]");
      if (scope) {
        patchBenefit({ scope: scope.getAttribute("data-go-discount-scope") || "all" });
        return;
      }
      const condition = target.closest("[data-go-benefit-condition]");
      if (condition) {
        patchBenefit({ conditionType: condition.getAttribute("data-go-benefit-condition") || "" });
        return;
      }
      // Das Foto: ein Knopf, der das versteckte Dateifeld antippt. Auf dem
      // Telefon oeffnet sich dann die Auswahl des Systems - aufnehmen, aus der
      // Mediathek, aus den Dateien (Punkt 11).
      if (target.closest("[data-go-offer-photo-pick]")) {
        const input = doc.querySelector("[data-go-offer-photo-input]");
        input?.click?.();
        return;
      }
      if (target.closest("[data-go-offer-photo-remove]")) {
        removeOfferPhoto();
        return;
      }

      const party = target.closest("[data-go-offer-party]");
      if (party) {
        const key = party.getAttribute("data-go-offer-party");
        const ranges = Array.isArray(current.editor?.draft?.partyRanges) ? current.editor.draft.partyRanges : [];
        const allKeys = GO_PARTY_RANGES.map((entry) => entry.key);
        // "Të gjithë" setzt alle vier - und ist es schon alles, laesst ein
        // zweites Antippen es dabei: Ein Angebot fuer niemanden waere keine
        // Auswahl, sondern ein Formular, das sich selbst leer geraeumt hat.
        if (key === "all") {
          patchDraft({ partyRanges: allKeys });
          return;
        }
        const next = ranges.includes(key) ? ranges.filter((entry) => entry !== key) : [...ranges, key];
        patchDraft({ partyRanges: next.length ? next : ranges });
        return;
      }
      // Die Wochentage eines Orar specifik (Punkt 23). Der letzte Tag laesst
      // sich nicht abwaehlen - ein Zeitfenster an keinem Tag gilt nie.
      const day = target.closest("[data-go-offer-day]");
      if (day) {
        const key = day.getAttribute("data-go-offer-day") || "";
        const schedule = current.editor?.draft?.schedule || {};
        const days = Array.isArray(schedule.days) && schedule.days.length
          ? schedule.days
          : GO_WEEKDAY_KEYS.slice();
        const next = days.includes(key)
          ? days.filter((entry) => entry !== key)
          : GO_WEEKDAY_KEYS.filter((entry) => entry === key || days.includes(entry));
        patchDraft({
          schedule: {
            ...schedule,
            mode: "windows",
            days: next.length ? next : days,
            windows: [{
              start: current.editor?.windowFrom || "14:00",
              end: current.editor?.windowTo || "18:00"
            }]
          }
        });
        return;
      }
      // Ushqim und Pije sind ankreuzbar, nicht ausschliessend: Ein Angebot
      // kann fuer beide gelten. Beide zusammen ergeben die Kategorie "all" -
      // und die passt zusaetzlich auf Gaeste, die "Nuk e di" antworten.
      const intent = target.closest("[data-go-offer-intent]");
      if (intent) {
        const key = intent.getAttribute("data-go-offer-intent");
        const active = Array.isArray(current.editor?.intents)
          ? current.editor.intents
          : goIntentsFromCategory(current.editor?.draft?.category);
        const next = active.includes(key)
          ? active.filter((entry) => entry !== key)
          : [...active, key];
        // Auch das letzte Kreuz darf wieder weg - dann steht das Formular
        // wieder da, wo es angefangen hat. Gespeichert wird es so nicht: Ein
        // Angebot ohne Adressat waere fuer niemanden sichtbar, und darauf
        // zeigt der Editor beim Speichern.
        if (current.editor) current.editor.intents = next;
        patchDraft({ category: goCategoryFromIntents(next) });
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

    // Das gewaehlte Foto. "change" und nicht "input": Ein Dateifeld meldet
    // seine Datei erst, wenn die Auswahl des Systems geschlossen ist.
    doc.addEventListener("change", (event) => {
      const target = event.target;
      if (!target || typeof target.closest !== "function") return;
      if (!target.closest("[data-go-offer-photo-input]")) return;
      const file = target.files?.[0] || null;
      // Das Feld wird geleert, damit dieselbe Datei ein zweites Mal gewaehlt
      // werden kann - sonst meldet der Browser keine Aenderung.
      target.value = "";
      void pickOfferPhoto(file);
    });

    // Ein Feld, in das getippt wird, muss zu sehen sein (Punkt 28).
    //
    // Unten im Modal steht der AKTIVIZO-Knopf fest, und darunter schiebt das
    // Telefon seine Tastatur herauf. Ein Preisfeld am unteren Rand lag damit
    // hinter beidem: Der Wirt tippte in ein Feld, das er nicht sah. "center"
    // holt das Feld in die Mitte des Bildlaufs, bevor die Tastatur oben ist.
    doc.addEventListener("focusin", (event) => {
      const target = event.target;
      if (!target || typeof target.closest !== "function") return;
      if (!target.closest("[data-go-offer-editor]")) return;
      const tag = String(target.tagName || "").toLowerCase();
      if (tag !== "input" && tag !== "textarea") return;
      if (typeof target.scrollIntoView !== "function") return;
      try {
        target.scrollIntoView({ block: "center", behavior: "smooth" });
      } catch {
        target.scrollIntoView();
      }
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
    // Die Zeichenkette geht gleich an die Shell, die sie ins Dokument
    // schreibt - erst DANACH gibt es die Knoten, um die sich hier jemand
    // kuemmern kann. Vorher wird nur gemerkt, wo die Karten-Reihe steht.
    rememberKpiScroll();
    scheduleAfterPaint();
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
      group: current.tabGroup,
      overview: current.overview,
      search: current.search,
      camera: current.camera,
      // Ist die Buchung neu, steht die Karte noch in der Eingabemaske - und
      // scheduleAfterPaint legt sie danach um. Siehe shownBooking.
      bookingEntering: !!current.search?.booking && !shownBooking,
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
      // Wer die GO-Seite verlaesst, laesst auch keine laufende Kamera hinter
      // sich - sonst bliebe die Leuchte des Telefons an, waehrend im Feed
      // gescrollt wird.
      closeCamera({ silent: true });
      // Und kein Nachlauf, der gleich noch eine Seite zeichnet, die niemand
      // mehr ansieht.
      if (bookingExitTimer) clearTimeout(bookingExitTimer);
      bookingExitTimer = 0;
      if (phaseTimer) clearTimeout(phaseTimer);
      phaseTimer = 0;
      if (cameraReadyTimer) clearTimeout(cameraReadyTimer);
      cameraReadyTimer = 0;
      shownBooking = false;
      const host = doc?.getElementById?.(EDITOR_OVERLAY_ID);
      if (host) host.innerHTML = "";
      // Und kein Bild im Speicher, das niemand mehr zeichnet.
      revokePreview(view()?.editor?.photo?.previewUrl);
      lastEditorHtml = "";
      lastEditorKind = "";
      dataController?.disconnect();
    },
    __view: view,
    __setTabGroup: setTabGroup,
    __ensureSwipeBinding: ensureSwipeBinding,
    __rememberKpiScroll: rememberKpiScroll,
    __restoreKpiScroll: restoreKpiScroll,
    __buildDraft: buildDraft,
    __patchDraft: patchDraft,
    __stepPartySize: stepPartySize,
    __patchBenefit: patchBenefit,
    __setBenefitKind: setBenefitKind,
    __readEditorInputs: readEditorInputs,
    __pickOfferPhoto: pickOfferPhoto,
    __removeOfferPhoto: removeOfferPhoto
  });
}
