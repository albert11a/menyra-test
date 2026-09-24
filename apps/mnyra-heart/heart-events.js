function findActionTarget(target) {
  return target?.closest?.([
    "[data-action]",
    "[data-nav-key]",
    "[data-analytics-range]",
    "[data-heart-go-range]",
    "[data-heart-go-reload]",
    "[data-analytics-custom-apply]",
    "[data-analytics-retry]",
    "[data-lead-location-add]",
    "[data-lead-location-remove]",
    "[data-lead-location-pick]",
    "#leadInlineSaveBtn",
    "#leadModalSave",
    "#leadInlineDeleteBtn",
    "#leadConvertBtn",
    "#leadLogoTrigger",
    "#leadBestSpotLogoTrigger",
    "#leadTitleImageTrigger",
    "#leadInlineActionsToggle",
    "#leadInlineActionsBackdrop",
    "#leadModalClose"
  ].join(", ")) || null;
}

export function bindHeartEvents({
  root,
  operations
} = {}) {
  if (!root || !operations) {
    return () => {};
  }

  async function handleClick(event) {
    const target = findActionTarget(event.target);
    if (!target) return;

    const action = String(target.getAttribute("data-action") || "").trim();

    // "Was gibt es Neues" traegt beides: die Ansicht, in die es fuehrt, und das
    // Lokal, das dort geoeffnet werden soll. Darum vor der reinen Navigation.
    if (action === "open-start-news") {
      event.preventDefault();
      operations.openStartNews?.(
        target.getAttribute("data-nav-key"),
        target.getAttribute("data-landing-id") || ""
      );
      return;
    }

    if (!action && target.hasAttribute("data-nav-key")) {
      event.preventDefault();
      operations.openView?.(target.getAttribute("data-nav-key"));
      return;
    }

    if (target.hasAttribute("data-heart-go-range")) {
      event.preventDefault();
      await operations.setMnyraGoRange?.(target.getAttribute("data-heart-go-range"));
      return;
    }
    if (target.hasAttribute("data-heart-go-reload")) {
      event.preventDefault();
      await operations.reloadMnyraGo?.();
      return;
    }

    if (target.hasAttribute("data-analytics-range")) {
      event.preventDefault();
      await operations.setAnalyticsRange?.(target.getAttribute("data-analytics-range"));
      return;
    }
    if (target.hasAttribute("data-analytics-custom-apply")) {
      event.preventDefault();
      await operations.applyAnalyticsCustomRange?.();
      return;
    }
    if (target.hasAttribute("data-analytics-retry")) {
      event.preventDefault();
      await operations.retryAnalytics?.();
      return;
    }

    event.preventDefault();

    if (!action && target.hasAttribute("data-lead-location-add")) {
      operations.addCrmLeadLocation?.();
      return;
    }
    if (!action && target.hasAttribute("data-lead-location-remove")) {
      operations.removeCrmLeadLocation?.(target.getAttribute("data-lead-location-remove"));
      return;
    }
    if (!action && target.hasAttribute("data-lead-location-pick")) {
      await operations.pickCrmLeadLocation?.(target.getAttribute("data-lead-location-pick"));
      return;
    }
    if (!action && (target.id === "leadInlineSaveBtn" || target.id === "leadModalSave")) {
      await operations.saveCrmLead?.();
      return;
    }
    if (!action && target.id === "leadInlineDeleteBtn") {
      await operations.deleteCrmLead?.();
      return;
    }
    if (!action && target.id === "leadConvertBtn") {
      await operations.convertCrmLead?.();
      return;
    }
    if (!action && target.id === "leadLogoTrigger") {
      operations.triggerCrmFile?.("leadLogoInput");
      return;
    }
    if (!action && target.id === "leadBestSpotLogoTrigger") {
      operations.triggerCrmFile?.("leadBestSpotLogoInput");
      return;
    }
    if (!action && target.id === "leadTitleImageTrigger") {
      operations.triggerCrmFile?.("leadTitleImageInput");
      return;
    }
    if (!action && target.id === "leadInlineActionsToggle") {
      operations.toggleCrmLeadActions?.();
      return;
    }
    if (!action && target.id === "leadInlineActionsBackdrop") {
      operations.toggleCrmLeadActions?.(false);
      return;
    }
    if (!action && target.id === "leadModalClose") {
      operations.closeModal?.();
      return;
    }
    if (!action) return;

    if (action === "copy-lead-pitch-link") {
      await operations.copyLeadPitchLink?.(target.getAttribute("data-pitch-url"));
      return;
    }
    if (action === "open-landing") {
      operations.openLanding?.(target.getAttribute("data-landing-id"));
      return;
    }
    if (action === "close-landing") {
      operations.closeLanding?.();
      return;
    }
    if (action === "set-landing-tab") {
      operations.setLandingTab?.(target.getAttribute("data-landing-tab"));
      return;
    }
    if (action === "add-landing-next") {
      await operations.addLandingNext?.({
        restaurantId: target.getAttribute("data-landing-id"),
        name: target.getAttribute("data-landing-name"),
        city: target.getAttribute("data-landing-city"),
        publicSlug: target.getAttribute("data-landing-slug"),
        logoUrl: target.getAttribute("data-landing-logo")
      });
      return;
    }
    if (action === "remove-landing-next") {
      await operations.removeLandingNext?.(target.getAttribute("data-landing-id"));
      return;
    }
    if (action === "move-landing-waiting" || action === "move-landing-next") {
      await operations.moveLandingBoard?.({
        restaurantId: target.getAttribute("data-landing-id"),
        name: target.getAttribute("data-landing-name"),
        city: target.getAttribute("data-landing-city"),
        publicSlug: target.getAttribute("data-landing-slug"),
        logoUrl: target.getAttribute("data-landing-logo")
      }, action === "move-landing-waiting" ? "waiting" : "next");
      return;
    }
    if (action === "remove-landing-waiting") {
      await operations.removeLandingWaiting?.(target.getAttribute("data-landing-id"));
      return;
    }
    if (action === "reset-landing") {
      await operations.resetLanding?.({
        restaurantId: target.getAttribute("data-landing-id"),
        name: target.getAttribute("data-landing-name"),
        city: target.getAttribute("data-landing-city"),
        publicSlug: target.getAttribute("data-landing-slug"),
        logoUrl: target.getAttribute("data-landing-logo"),
        total: Number(target.getAttribute("data-landing-total")) || 0
      });
      return;
    }
    if (action === "toggle-landing-archive") {
      await operations.toggleLandingArchive?.(
        target.getAttribute("data-landing-id"),
        target.getAttribute("data-landing-archived") !== "1"
      );
      return;
    }
    if (action === "toggle-nav") {
      operations.toggleNav?.();
      return;
    }
    if (action === "select-setup-restaurant") {
      await operations.selectSetupRestaurant?.({
        restaurantId: target.getAttribute("data-restaurant-id"),
        restaurantName: target.getAttribute("data-restaurant-name"),
        restaurantHandle: target.getAttribute("data-restaurant-handle"),
        guestRouteUrl: target.getAttribute("data-guest-route-url")
      });
      return;
    }
    if (action === "clear-setup-restaurant") {
      await operations.clearSetupRestaurant?.();
      return;
    }
    if (action === "provision-setup-personas") {
      await operations.provisionSetupPersonas?.(target.getAttribute("data-personas"));
      return;
    }
    if (action === "delete-setup-persona") {
      await operations.deleteSetupPersona?.(target.getAttribute("data-persona-key"));
      return;
    }
    if (action === "close-modal") {
      operations.closeModal?.();
      return;
    }
    if (action === "open-crm-editor") {
      operations.openCrmEditor?.({
        domainKey: target.getAttribute("data-crm-domain"),
        itemId: target.getAttribute("data-crm-item-id"),
        mode: target.getAttribute("data-crm-mode") || "edit"
      });
      return;
    }
    if (action === "save-crm-lead") {
      await operations.saveCrmLead?.();
      return;
    }
    if (action === "save-crm-lead-settings") {
      await operations.saveCrmLeadSettings?.();
      return;
    }
    if (action === "delete-crm-lead") {
      await operations.deleteCrmLead?.();
      return;
    }
    if (action === "convert-crm-lead") {
      await operations.convertCrmLead?.();
      return;
    }
    if (action === "save-crm-customer") {
      await operations.saveCrmCustomer?.();
      return;
    }
    if (action === "move-crm-customer-to-lead") {
      await operations.moveCrmCustomerToLead?.();
      return;
    }
    if (action === "save-crm-staff") {
      await operations.saveCrmStaff?.();
      return;
    }
    if (action === "delete-crm-staff") {
      await operations.deleteCrmStaff?.();
      return;
    }
    if (action === "set-crm-ad-status") {
      await operations.setCrmAdStatus?.(
        target.getAttribute("data-ad-id"),
        target.getAttribute("data-ad-status")
      );
      return;
    }
    if (action === "trigger-crm-file") {
      operations.triggerCrmFile?.(target.getAttribute("data-crm-file-input"));
      return;
    }
    if (action === "add-crm-lead-location") {
      operations.addCrmLeadLocation?.();
      return;
    }
    if (action === "remove-crm-lead-location") {
      operations.removeCrmLeadLocation?.(target.getAttribute("data-lead-location-remove"));
      return;
    }
    if (action === "pick-crm-lead-location") {
      await operations.pickCrmLeadLocation?.(target.getAttribute("data-lead-location-pick"));
      return;
    }
    if (action === "pick-crm-staff-location") {
      await operations.pickCrmStaffLocation?.();
      return;
    }
    if (action === "open-destination-editor") {
      await operations.openDestinationEditor?.(target.getAttribute("data-destination-id") || "");
      return;
    }
    if (action === "close-destination-editor") {
      operations.closeDestinationEditor?.();
      return;
    }
    if (action === "add-destination-place") {
      operations.addDestinationPlace?.(target.getAttribute("data-category") || "");
      return;
    }
    if (action === "remove-destination-place") {
      operations.removeDestinationPlace?.(target.getAttribute("data-place-id") || "");
      return;
    }
    if (action === "pick-destination-place-location") {
      await operations.pickDestinationPlaceLocation?.(target.getAttribute("data-place-id") || "");
      return;
    }
    if (action === "remove-destination-gallery-image") {
      operations.removeDestinationGalleryImage?.(
        target.getAttribute("data-place-id") || "",
        target.getAttribute("data-image-index") || ""
      );
      return;
    }
    if (action === "remove-destination-cover-image") {
      operations.removeDestinationCoverImage?.(target.getAttribute("data-place-id") || "");
      return;
    }
    if (action === "save-destination-draft") {
      await operations.saveDestinationDraft?.();
      return;
    }
    if (action === "publish-destination") {
      await operations.publishDestination?.(
        target.getAttribute("data-destination-id") || "",
        target.getAttribute("data-destination-from-editor") === "true"
      );
      return;
    }
    if (action === "delete-destination") {
      await operations.deleteDestination?.(target.getAttribute("data-destination-id") || "");
      return;
    }
    if (action === "toggle-lead-destination-pin") {
      operations.toggleLeadDestinationPin?.(target.getAttribute("data-place-id") || "");
      return;
    }
    if (action === "toggle-lead-destination-visibility") {
      operations.toggleLeadDestinationVisibility?.(target.getAttribute("data-place-id") || "");
      return;
    }
    if (action === "set-crm-scope") {
      await operations.setCrmScope?.(
        target.getAttribute("data-crm-domain"),
        target.getAttribute("data-crm-scope")
      );
      return;
    }
    // Lifeskin. Diese vier Zeilen fehlten: Die Knoepfe standen von Anfang an
    // im Markup, aber es hat sie nie jemand aufgefangen - ein Druck darauf
    // tat schlicht nichts.
    if (action === "lifeskin-sitzung") {
      await operations.openLifeskinSitzung?.(target.getAttribute("data-id"));
      return;
    }
    if (action === "lifeskin-sitzung-zu") {
      operations.closeLifeskinSitzung?.();
      return;
    }
    if (action === "lifeskin-reset") {
      await operations.lifeskinZuruecksetzen?.();
      return;
    }
    if (action === "lifeskin-produkt") {
      operations.openLifeskinProdukt?.(target.getAttribute("data-id"));
      return;
    }
    if (action === "lifeskin-produkte-bizele") {
      await operations.lifeskinProdukteBizele?.();
      return;
    }
    if (action === "lifeskin-produkte-anlegen") {
      await operations.lifeskinProdukteAnlegen?.();
      return;
    }
    // Die Vorher/Nachher-Faelle (heart-lifeskin-raste.js).
    if (action === "lifeskin-rasti") {
      operations.openLifeskinRasti?.(target.getAttribute("data-id"));
      return;
    }
    if (action === "lifeskin-rasti-neu") {
      operations.neuesLifeskinRasti?.();
      return;
    }
    if (action === "lifeskin-rasti-zu") {
      operations.closeLifeskinRasti?.();
      return;
    }
    if (action === "lifeskin-rasti-foto") {
      // Ohne await davor: Die Dateiwahl muss im Griff des Fingers aufgehen.
      operations.lifeskinRastiFoto?.(target.getAttribute("data-seite"));
      return;
    }
    if (action === "lifeskin-rasti-speichern") {
      await operations.speichereLifeskinRasti?.();
      return;
    }
    if (action === "lifeskin-rasti-loeschen") {
      await operations.loescheLifeskinRasti?.();
      return;
    }
    if (action === "lifeskin-rasti-ort") {
      await operations.lifeskinRastiOrt?.(target.getAttribute("data-id"), target.getAttribute("data-ort"));
      return;
    }
    if (action === "lifeskin-rasti-schieben") {
      await operations.lifeskinRastiSchieben?.(target.getAttribute("data-id"), target.getAttribute("data-richtung"));
      return;
    }
    if (action === "lifeskin-rasti-produkt-neu") {
      operations.lifeskinRastiDom?.("produkt-neu", target);
      return;
    }
    if (action === "lifeskin-rasti-produkt-weg") {
      operations.lifeskinRastiDom?.("produkt-weg", target);
      return;
    }
    if (action === "lifeskin-rasti-platz-neu") {
      operations.lifeskinRastiDom?.("platz-neu", target);
      return;
    }
    if (action === "lifeskin-rasti-platz-weg") {
      operations.lifeskinRastiDom?.("platz-weg", target);
      return;
    }
    if (action === "lifeskin-produkt-neu") {
      operations.neuesLifeskinProdukt?.();
      return;
    }
    if (action === "lifeskin-trichter") {
      operations.setLifeskinTrichter?.(target.getAttribute("data-wert"));
      return;
    }
    if (action === "lifeskin-zeitraum") {
      operations.setLifeskinZeitraum?.(target.getAttribute("data-wert"));
      return;
    }
    if (action === "heart-push-einschalten") {
      operations.schalteHeartPushEin?.();
      return;
    }
    if (action === "heart-deploy") {
      operations.starteDeploy?.(target);
      return;
    }
    if (action === "lifeskin-auswahl") {
      operations.lifeskinAuswahl?.();
      return;
    }
    if (action === "lifeskin-auswahl-fall") {
      operations.lifeskinAuswahlFall?.(target.getAttribute("data-id"));
      return;
    }
    if (action === "lifeskin-auswahl-alle") {
      operations.lifeskinAuswahlAlle?.(target.getAttribute("data-wert"));
      return;
    }
    if (action === "lifeskin-auswahl-tun") {
      await operations.lifeskinAuswahlTun?.(target.getAttribute("data-wert"), target);
      return;
    }
    if (action === "lifeskin-fach") {
      operations.setLifeskinFach?.(target.getAttribute("data-wert"));
      return;
    }
    if (action === "lifeskin-bestellzeitraum") {
      operations.setLifeskinBestellZeitraum?.(target.getAttribute("data-wert"));
      return;
    }
    // BEFUND ODER TEXTE - umgeschaltet OHNE den Zustand anzufassen.
    //
    // Der ganze Befundbogen lebt im DOM: Eingefuegtes JSON, getippte
    // Saetze, angehakte Produkte stehen in den Feldern und nirgends sonst,
    // bis jemand freigibt. Ein Zustandswechsel zeichnet Heart neu - und
    // haette bei jedem Umschalten alles Getippte weggewischt.
    if (action === "lifeskin-bogen") {
      const wunsch = String(target.getAttribute("data-wert") || "befund");
      for (const knopf of root.querySelectorAll('[data-action="lifeskin-bogen"]')) {
        const an = knopf.getAttribute("data-wert") === wunsch;
        knopf.classList.toggle("heart-lifeskin-chip--an", an);
        knopf.setAttribute("aria-pressed", an ? "true" : "false");
      }
      for (const bogen of root.querySelectorAll("[data-bogen]")) {
        bogen.hidden = bogen.getAttribute("data-bogen") !== wunsch;
      }
      return;
    }
    if (action === "lifeskin-viber") {
      operations.lifeskinViber?.(target.getAttribute("data-wert"), target.getAttribute("data-nummer"));
      return;
    }
    if (action === "lifeskin-text-kopieren") {
      await operations.lifeskinTextKopieren?.(target.getAttribute("data-wert"),
        target.getAttribute("data-was"));
      return;
    }
    if (action === "lifeskin-link-kopieren") {
      await operations.lifeskinLinkKopieren?.(target.getAttribute("data-id"));
      return;
    }
    if (action === "lifeskin-sitzung-loeschen") {
      await operations.loescheLifeskinSitzung?.(target.getAttribute("data-id"));
      return;
    }
    if (action === "lifeskin-spaeter") {
      await operations.markiereLifeskinSitzung?.(target.getAttribute("data-id"),
        { spaeter: target.getAttribute("data-wert") === "ja" });
      return;
    }
    if (action === "lifeskin-archivieren") {
      await operations.markiereLifeskinSitzung?.(target.getAttribute("data-id"),
        { archiviert: target.getAttribute("data-wert") === "ja" });
      return;
    }
    if (action === "lifeskin-alstest") {
      await operations.markiereLifeskinSitzung?.(target.getAttribute("data-id"),
        { test: target.getAttribute("data-wert") === "ja" });
      return;
    }
    if (action === "lifeskin-produkt-foto-weg") {
      operations.lifeskinProduktfotoWeg?.();
      return;
    }
    if (action === "lifeskin-landingbild-weg") {
      await operations.lifeskinLandingbildWeg?.(Number(target.getAttribute("data-index")));
      return;
    }
    if (action === "lifeskin-landingbild-schieben") {
      await operations.lifeskinLandingbildSchieben?.(
        Number(target.getAttribute("data-index")),
        target.getAttribute("data-richtung"));
      return;
    }
    if (action === "lifeskin-produkt-zu") {
      operations.closeLifeskinProdukt?.();
      return;
    }
    if (action === "lifeskin-produkt-speichern") {
      await operations.speichereLifeskinProdukt?.();
      return;
    }
    if (action === "lifeskin-anbieter-speichern") {
      await operations.speichereLifeskinAnbieter?.();
      return;
    }
    if (action === "lifeskin-produkt-loeschen") {
      await operations.loescheLifeskinProdukt?.();
      return;
    }
    if (action === "lifeskin-produkt-satz-neu") {
      operations.lifeskinProduktSatzNeu?.(target.getAttribute("data-id"));
      return;
    }
    if (action === "lifeskin-prompt-kopieren") {
      await operations.lifeskinPrompt?.();
      return;
    }
    if (action === "lifeskin-json-uebernehmen") {
      await operations.lifeskinJson?.();
      return;
    }
    if (action === "lifeskin-bericht-vorschau") {
      await operations.gibLifeskinBerichtFrei?.(target.getAttribute("data-id"), { nurStaff: true });
      return;
    }
    if (action === "lifeskin-bericht-freigeben") {
      await operations.gibLifeskinBerichtFrei?.(target.getAttribute("data-id"));
      return;
    }
    if (action === "lifeskin-versand") {
      await operations.setzeLifeskinVersand?.(
        target.getAttribute("data-id"), target.getAttribute("data-stand")
      );
      return;
    }
    if (action === "lifeskin-reset-abbrechen") {
      operations.lifeskinResetAbbrechen?.();
      return;
    }

    if (action === "refresh-heart") {
      await operations.refresh?.();
      return;
    }
    if (action === "logout") {
      await operations.logout?.();
    }
  }

  async function handleSubmit(event) {
    const form = event.target?.closest?.("[data-heart-login]");
    if (form) {
      event.preventDefault();
      const formData = new FormData(form);
      await operations.login?.({
        email: formData.get("email"),
        password: formData.get("password")
      });
      return;
    }

    const searchForm = event.target?.closest?.("[data-heart-setup-search]");
    if (searchForm) {
      event.preventDefault();
      const formData = new FormData(searchForm);
      await operations.searchSetupRestaurants?.(formData.get("query"));
      return;
    }

    const setupForm = event.target?.closest?.("[data-heart-setup-save]");
    if (setupForm) {
      event.preventDefault();
      const formData = new FormData(setupForm);
      await operations.saveSetup?.({
        restaurantId: formData.get("restaurantId"),
        restaurantName: formData.get("restaurantName"),
        guestRouteUrl: formData.get("guestRouteUrl"),
        allowLiveMutations: formData.get("allowLiveMutations") === "on"
      });
    }
  }

  async function handleChange(event) {
    // HIER STANDEN DIE ZWEI BILDWAHLEN VON LIFESKIN.
    //
    // Sie horchten auf ein Feld, das im neu gezeichneten Kasten stand -
    // und ein solches Feld haengt an keinem Dokument mehr, sobald der
    // Bereich neu geschrieben wurde. Sein "change" stieg dann zu
    // niemandem auf. Genau das war "beim ersten Mal geht es nicht".
    // Das Feld entsteht jetzt an <body> und bringt seinen eigenen
    // Horcher mit: oeffneDateiwahl() in heart.js.

    // Ein Haken an einem Mittel fuellt die Begruendung und laesst den Preis
    // der Zahl der Mittel folgen. Ohne Neuzeichnen: Was Dr. Gashi gerade
    // getippt hat, soll dabei nicht verschwinden.
    if (event.target?.matches?.("[data-bogen-weg]")) {
      operations.lifeskinWeg?.(String(event.target.value || ""));
      return;
    }
    if (event.target?.matches?.("[data-bogen-art]")) {
      operations.lifeskinEntwurfMerken?.();
      operations.lifeskinVorschau?.();
      return;
    }
    // Auswahlfelder der Analyse-Details (Stufe, Niveli) und der Ergebnisse:
    // Vorschau und Zeichen im Kopf nachziehen.
    if (event.target?.matches?.("[data-raport], [data-par-shkalla], [data-befund-rasti], [data-befund-klienti]")) {
      operations.lifeskinMarkenAuffrischen?.();
      operations.lifeskinVorschau?.();
      return;
    }
    if (event.target?.matches?.("[data-shitja-problem]")) {
      operations.lifeskinVorschau?.();
      return;
    }

    const produktWahl = event.target?.closest?.("[data-produkt-wahl]");
    if (produktWahl) {
      operations.lifeskinProduktWahl?.(String(produktWahl.value || ""), produktWahl.checked);
      return;
    }

    const destFileInput = event.target?.closest?.("[data-dest-file-input]");
    if (destFileInput) {
      const files = Array.from(destFileInput.files || []);
      await operations.handleDestinationFileChange?.(
        destFileInput.getAttribute("data-dest-place-id") || "",
        destFileInput.getAttribute("data-dest-file-kind") || "",
        files
      );
      destFileInput.value = "";
      return;
    }

    const crmFileInput = event.target?.closest?.([
      "[data-crm-file-input]",
      "#leadLogoInput",
      "#leadBestSpotLogoInput",
      "#leadTitleImageInput",
      "#customerLogoInput",
      "#staffAvatarInput"
    ].join(", "));
    if (crmFileInput) {
      await operations.handleCrmFileChange?.(crmFileInput.id || crmFileInput.getAttribute("data-crm-file-input"), crmFileInput.files?.[0] || null);
      return;
    }

    const changedId = String(event.target?.id || "").trim();
    if (["leadCustomerType", "leadBillingCycle", "leadCountry", "leadStatus"].includes(changedId)) {
      operations.syncCrmLeadDerivedFields?.();
      return;
    }
    if (changedId === "leadDestinationSelect") {
      operations.setLeadDestination?.(event.target.value);
      return;
    }
    if (changedId === "staffCountry") {
      operations.syncCrmStaffDerivedEmailField?.();
      return;
    }

    // Das kleine Kreuz in einem Suchfeld meldet sich je nach Browser als
    // "change" statt als "input" - beides muss den Text wegnehmen.
    const landingNextSearch = event.target?.closest?.("[data-landing-next-search]");
    if (landingNextSearch) {
      operations.setLandingNextQuery?.(landingNextSearch.value);
      return;
    }

    const crmSearch = event.target?.closest?.("[data-crm-search]");
    if (crmSearch) {
      operations.setCrmQuery?.(crmSearch.getAttribute("data-crm-domain"), crmSearch.value);
      return;
    }

    const crmCategory = event.target?.closest?.("[data-crm-category]");
    if (crmCategory) {
      operations.setCrmCategoryFilter?.(crmCategory.getAttribute("data-crm-domain"), crmCategory.value);
      return;
    }

    const crmStatus = event.target?.closest?.("[data-crm-status]");
    if (crmStatus) {
      operations.setCrmStatusFilter?.(crmStatus.getAttribute("data-crm-domain"), crmStatus.value);
      return;
    }

    const analyticsSelect = event.target?.closest?.("[data-analytics-business-select]");
    if (analyticsSelect) {
      await operations.selectAnalyticsBusiness?.(analyticsSelect.value);
    }
  }

  // Ein Textfeld im Befund waechst mit seinem Text - kein Scrollen im Feld.
  function feldAnpassen(feld) {
    if (!feld?.matches?.(".heart-befund textarea")) return;
    feld.style.height = "auto";
    feld.style.height = `${feld.scrollHeight + 2}px`;
  }

  function handleInput(event) {
    feldAnpassen(event.target);
    // Die Markierung am Feld folgt dem Tippen. Sie sagt "leer" oder
    // "gefuellt", "Standard" oder "eigener Text" - und waere nichts wert,
    // wenn sie erst nach dem Speichern stimmte. Die Vorschau darunter auch.
    if (event.target?.matches?.("[data-raport], [data-text]")) {
      operations.lifeskinMarkenAuffrischen?.();
      operations.lifeskinVorschau?.();
      return;
    }
    if (event.target?.matches?.("[data-zona-ort], [data-zona-text], [data-par-emri], [data-par-vlera], [data-par-grada], [data-par-thjeshte]")) {
      operations.lifeskinVorschau?.();
      return;
    }
    // Die Vorschau unter den Texten der Therapieseite folgt jedem Tastendruck.
    if (event.target?.matches?.("[data-shitja], [data-shitja-problem], [data-shitja-punkt]")) {
      operations.lifeskinVorschau?.();
      return;
    }
    // Wofuer und Preis: sofort auf dem Geraet merken (Entwurf).
    if (event.target?.matches?.("[data-produkt-zweck], #lifeskin-preis")) {
      operations.lifeskinEntwurfMerken?.();
      return;
    }

    const landingNextSearch = event.target?.closest?.("[data-landing-next-search]");
    if (landingNextSearch) {
      operations.setLandingNextQuery?.(landingNextSearch.value);
      return;
    }

    const crmSearch = event.target?.closest?.("[data-crm-search]");
    if (crmSearch) {
      operations.setCrmQuery?.(crmSearch.getAttribute("data-crm-domain"), crmSearch.value);
      return;
    }

    const analyticsSearch = event.target?.closest?.("[data-analytics-business-search]");
    if (analyticsSearch) {
      operations.setAnalyticsBusinessQuery?.(analyticsSearch.value);
      return;
    }

    const inputId = String(event.target?.id || "").trim();
    if (["leadBusinessName", "leadCustomerType", "leadBillingCycle", "leadCountry"].includes(inputId)) {
      operations.syncCrmLeadDerivedFields?.();
      return;
    }
    if (inputId.startsWith("leadLocationAddress_") || inputId === "leadAddress" || inputId === "leadCity") {
      operations.syncCrmLeadDraftFromForm?.();
      return;
    }
    if (["staffFirstName", "staffLastName", "staffCountry"].includes(inputId)) {
      operations.syncCrmStaffDerivedEmailField?.();
    }
  }

  async function handleFocusOut(event) {
    const destPlaceAddressInput = event.target?.closest?.("[data-dest-place-address]");
    if (destPlaceAddressInput) {
      await operations.refineDestinationPlaceAddress?.(
        destPlaceAddressInput.getAttribute("data-dest-place-address"),
        destPlaceAddressInput.value
      );
      return;
    }
    const leadLocationInput = event.target?.closest?.("[data-lead-location-address]");
    if (!leadLocationInput) return;
    await operations.refineCrmLeadLocationAddress?.(
      leadLocationInput.getAttribute("data-lead-location-address"),
      leadLocationInput.value
    );
  }

  root.addEventListener("click", handleClick);
  root.addEventListener("submit", handleSubmit);
  root.addEventListener("change", handleChange);
  root.addEventListener("input", handleInput);
  root.addEventListener("focusout", handleFocusOut);
  // Aufgeklappte Karten merken (data-klapp), sonst klappt sie das naechste
  // Neuzeichnen wieder zu. "toggle" steigt nicht auf - daher capture.
  root.addEventListener("toggle", (event) => {
    const karte = event.target;
    const name = karte?.getAttribute?.("data-klapp");
    if (name) operations.lifeskinKlapp?.(name, karte.open === true);
    // Beim Aufklappen im Befund: Textfelder auf ihre Hoehe bringen (zu
    // hatten sie keine).
    if (karte?.open && karte.closest?.(".heart-befund")) operations.lifeskinFelderAnpassen?.(karte);
  }, true);

  return () => {
    root.removeEventListener("click", handleClick);
    root.removeEventListener("submit", handleSubmit);
    root.removeEventListener("change", handleChange);
    root.removeEventListener("input", handleInput);
    root.removeEventListener("focusout", handleFocusOut);
  };
}
