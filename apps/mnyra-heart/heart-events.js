function findActionTarget(target) {
  return target?.closest?.([
    "[data-action]",
    "[data-nav-key]",
    "[data-analytics-range]",
    "[data-analytics-custom-apply]",
    "[data-analytics-retry]",
    "[data-run-id]",
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

    if (target.hasAttribute("data-nav-key")) {
      event.preventDefault();
      operations.openView?.(target.getAttribute("data-nav-key"));
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

    const action = String(target.getAttribute("data-action") || "").trim();
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
    if (action === "toggle-quick-actions") {
      operations.toggleQuickActions?.();
      return;
    }
    if (action === "toggle-run-launcher") {
      operations.toggleRunLauncher?.();
      return;
    }
    if (action === "open-run-guide") {
      operations.openRunGuide?.(target.getAttribute("data-pack-key"));
      return;
    }
    if (action === "start-pack-from-guide") {
      await operations.startPackFromGuide?.(target.getAttribute("data-pack-key"));
      return;
    }
    if (action === "open-run-detail") {
      await operations.openRunDetail?.(target.getAttribute("data-run-id"));
      return;
    }
    if (action === "toggle-run-detail-more") {
      operations.toggleRunDetailMore?.();
      return;
    }
    if (action === "delete-run-artifact") {
      await operations.deleteRunArtifact?.(
        target.getAttribute("data-run-id"),
        target.getAttribute("data-artifact-id")
      );
      return;
    }
    if (action === "delete-run-artifacts") {
      await operations.deleteRunArtifacts?.(target.getAttribute("data-run-id"));
      return;
    }
    if (action === "set-runs-history-tab") {
      operations.setRunsHistoryTab?.(target.getAttribute("data-history-tab"));
      return;
    }
    if (action === "toggle-runs-history-edit") {
      operations.toggleRunsHistoryEdit?.();
      return;
    }
    if (action === "toggle-runs-history-selection") {
      operations.toggleRunsHistorySelection?.(target.getAttribute("data-run-id"));
      return;
    }
    if (action === "update-run-archive") {
      await operations.updateRunArchive?.(target.getAttribute("data-archive-state"));
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
    if (action === "refresh-heart") {
      await operations.refresh?.();
      return;
    }
    if (action === "delete-incident") {
      await operations.deleteIncident?.(target.getAttribute("data-incident-id"));
      return;
    }
    if (action === "start-smoke") {
      await operations.startSmoke?.();
      return;
    }
    if (action === "start-synthetic") {
      await operations.startSynthetic?.();
      return;
    }
    if (action === "start-pack") {
      await operations.startPack?.(target.getAttribute("data-pack-key"));
      return;
    }
    if (action === "logout") {
      await operations.logout?.();
      return;
    }
    if (action === "open-run") {
      await operations.openRun?.(target.getAttribute("data-run-id"));
      return;
    }
    if (action === "cancel-run") {
      await operations.cancelRun?.(target.getAttribute("data-run-id"));
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
      return;
    }

    const select = event.target?.closest?.("[data-incident-filter]");
    if (!select) return;
    operations.setIncidentFilter?.(select.getAttribute("data-incident-filter"), select.value);
  }

  function handleInput(event) {
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

  return () => {
    root.removeEventListener("click", handleClick);
    root.removeEventListener("submit", handleSubmit);
    root.removeEventListener("change", handleChange);
    root.removeEventListener("input", handleInput);
    root.removeEventListener("focusout", handleFocusOut);
  };
}
