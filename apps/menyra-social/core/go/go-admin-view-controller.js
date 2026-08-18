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

export function createGoAdminViewController({
  state = null,
  renderFn = () => {},
  documentObj = null,
  helperApi = {},
  profileApi = {},
  bookingActionFn = null,
  findBookingFn = null,
  finalizeBookingFn = null,
  // Das Foto des Angebots geht denselben Weg wie das Foto eines Gerichts: ueber
  // den Media-Worker, komprimiert, mit einer kleinen Fassung daneben. Fehlt die
  // Funktion, bleibt die Section stehen und sagt es - ein Formular, das ein
  // Feld verschweigt, weil ein Dienst fehlt, ist schwerer zu verstehen als
  // eines, in dem etwas nicht geht.
  uploadImageFn = null,
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
  // Was zuletzt in der Overlay-Flaeche stand. Siehe syncEditorOverlay.
  let lastEditorHtml = "";
  // Welche Angebotsart zuletzt gezeichnet wurde. Nur wenn sie sich aendert,
  // blendet der Angebotsbereich weich ein (Punkt 27) - beim Tippen einer Pille
  // innerhalb derselben Art soll nichts blitzen.
  let lastEditorKind = "";
  // Steht auf "wahr", solange ein Neuzeichnen aus dem Editor selbst kommt.
  let editorRepaintForced = false;

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
    } catch (error) {
      current.search = {
        ...current.search,
        busy: false,
        status: String(error?.message || "").trim() || "Nuk u finalizua. Provo prapë."
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
      // Und kein Bild im Speicher, das niemand mehr zeichnet.
      revokePreview(view()?.editor?.photo?.previewUrl);
      lastEditorHtml = "";
      lastEditorKind = "";
      dataController?.disconnect();
    },
    __view: view,
    __buildDraft: buildDraft,
    __patchDraft: patchDraft,
    __patchBenefit: patchBenefit,
    __setBenefitKind: setBenefitKind,
    __readEditorInputs: readEditorInputs,
    __pickOfferPhoto: pickOfferPhoto,
    __removeOfferPhoto: removeOfferPhoto
  });
}
