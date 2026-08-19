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

// Wie lange die Aktivizo-Karte braucht, um zwischen Codefeld und Kamera zu
// wechseln. Dieselbe Zahl steht im Stylesheet der Karte (.go-activate); hier
// wird sie gebraucht, um die feste Hoehe danach wieder freizugeben.
const CAMERA_MOTION_MS = 200;

export function createGoAdminViewController({
  state = null,
  renderFn = () => {},
  documentObj = null,
  helperApi = {},
  profileApi = {},
  bookingActionFn = null,
  findBookingFn = null,
  finalizeBookingFn = null,
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
  // Der Zeitgeber, der die feste Hoehe der Karte nach der Bewegung wieder
  // freigibt.
  let cameraHeightTimer = null;

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
    const partyNode = doc?.querySelector?.("[data-go-confirm-party]");
    const partySize = Math.trunc(Number(partyNode?.value) || 0);
    current.search = { ...current.search, busy: true, status: "" };
    render();
    try {
      await finalizeBookingFn({
        shortCode: current.search.code,
        restaurantId: current.restaurantId,
        partySize
      });
      // Erledigt: Das Feld wird leer, damit der naechste Gast nicht auf den
      // Code des vorigen trifft.
      current.search = { code: "", status: "", busy: false, booking: null };
      // Hier ist gerade Geld entstanden. Die Karte "Per pagese" soll das jetzt
      // zeigen und nicht erst, wenn der naechste Gast sucht - deshalb ohne
      // Abstand (force).
      void dataController?.refreshOverview?.({ force: true });
    } catch (error) {
      current.search = {
        ...current.search,
        busy: false,
        status: String(error?.message || "").trim() || "Nuk u finalizua. Provo prapë."
      };
    }
    render();
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

  function prefersReducedMotion() {
    try {
      return win?.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches === true;
    } catch {
      return false;
    }
  }

  /**
   * Die Karte von ihrer jetzigen Hoehe auf ihre neue bringen.
   *
   * Beide Hoehen stehen nirgends als Zahl: Die eine haengt am Codefeld, die
   * andere am Kamerabild, und beide an der Breite des Telefons. Also werden
   * sie gemessen - erst die alte, dann (nach dem Umschalten) die neue -, und
   * dazwischen laeuft die Bewegung, die im Stylesheet steht.
   *
   * Der erzwungene Umbruch (offsetHeight) ist der Kern: Ohne ihn faellt der
   * Browser beide Zuweisungen in einem Rutsch zusammen und es gibt gar keine
   * Bewegung, nur einen Sprung.
   */
  function morphActivateCard(applyState) {
    const card = activateCardNode();
    if (!card || typeof card.getBoundingClientRect !== "function" || prefersReducedMotion()) {
      applyState();
      return;
    }
    const from = card.getBoundingClientRect().height;
    applyState();
    card.style.height = "";
    const to = card.getBoundingClientRect().height;
    if (!(from > 0) || !(to > 0) || Math.abs(to - from) < 1) return;
    card.style.height = `${from}px`;
    void card.offsetHeight;
    card.style.height = `${to}px`;
    if (cameraHeightTimer) clearTimeout(cameraHeightTimer);
    // Danach gehoert die Hoehe wieder dem Inhalt. Ein "transitionend" waere
    // genauer, kann aber ausbleiben (abgebrochene Bewegung, Tab im
    // Hintergrund) - und eine Karte, die dann fuer immer festgenagelt ist,
    // waere der schlimmere Fehler.
    cameraHeightTimer = setTimeout(() => {
      cameraHeightTimer = null;
      const node = activateCardNode();
      if (node) node.style.height = "";
    }, CAMERA_MOTION_MS + 80);
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
    morphActivateCard(() => {
      card.setAttribute("data-go-camera", current.camera?.open ? "1" : "0");
    });
  }

  function attachCameraStream() {
    const video = doc?.querySelector?.("[data-go-camera-video]");
    if (!video || !cameraStream) return;
    if (video.srcObject !== cameraStream) video.srcObject = cameraStream;
    try {
      const played = video.play?.();
      // Safari gibt ein Versprechen zurueck, das bricht, wenn der Knoten
      // gerade wieder verschwindet. Das ist kein Fehler, den jemand sehen
      // muss.
      if (played && typeof played.catch === "function") played.catch(() => {});
    } catch {}
  }

  function stopCameraStream() {
    if (cameraHeightTimer) {
      clearTimeout(cameraHeightTimer);
      cameraHeightTimer = null;
    }
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
    if (!media?.getUserMedia) {
      current.camera = { open: false, error: BUSINESS_GO_TEXTS.cameraDenied };
      render();
      return;
    }
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
    } catch {
      current.camera = { open: false, error: BUSINESS_GO_TEXTS.cameraDenied };
      applyCameraState();
      // Und einmal zeichnen, damit der Satz unter dem Feld erscheint. Das
      // Codefeld steht dabei genau so da wie vorher - der getippte Code liegt
      // im Zustand und nicht im Knoten.
      render();
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
    __patchBenefit: patchBenefit,
    __setBenefitKind: setBenefitKind,
    __readEditorInputs: readEditorInputs,
    __pickOfferPhoto: pickOfferPhoto,
    __removeOfferPhoto: removeOfferPhoto
  });
}
