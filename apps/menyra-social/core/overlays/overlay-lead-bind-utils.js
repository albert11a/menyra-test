export function bindLeadOverlayEventsCore({
  documentObj,
  bindModalDismissFn,
  closeLeadModalFn,
  saveLeadFromModalFn,
  convertLeadToCustomerFn,
  addLeadModalLocationRowFn,
  removeLeadModalLocationRowFn,
  syncLeadModalDraftFromFormFn,
  openLocationPickerFn,
  normalizeLeadLocationsFn,
  createLeadLocationFn,
  parseCoordsFromAddressInputFn,
  getLeadPlusCodeReferenceFn,
  hasLeadLocationCoordsFn,
  getPrimaryLeadLocationFn,
  refineLeadLocationAddressIndexFn,
  renderOverlaysFn,
  state,
  placeholderImage = ""
} = {}) {
  const doc = documentObj || null;
  const bindModalDismiss = typeof bindModalDismissFn === "function"
    ? bindModalDismissFn
    : null;
  if (!doc || !bindModalDismiss) return;
  const closeLeadModal = typeof closeLeadModalFn === "function"
    ? closeLeadModalFn
    : (() => {});
  const saveLeadFromModal = typeof saveLeadFromModalFn === "function"
    ? saveLeadFromModalFn
    : null;
  const convertLeadToCustomer = typeof convertLeadToCustomerFn === "function"
    ? convertLeadToCustomerFn
    : null;
  const addLeadModalLocationRow = typeof addLeadModalLocationRowFn === "function"
    ? addLeadModalLocationRowFn
    : null;
  const removeLeadModalLocationRow = typeof removeLeadModalLocationRowFn === "function"
    ? removeLeadModalLocationRowFn
    : null;
  const syncLeadModalDraftFromForm = typeof syncLeadModalDraftFromFormFn === "function"
    ? syncLeadModalDraftFromFormFn
    : (() => {});
  const openLocationPicker = typeof openLocationPickerFn === "function"
    ? openLocationPickerFn
    : null;
  const normalizeLeadLocations = typeof normalizeLeadLocationsFn === "function"
    ? normalizeLeadLocationsFn
    : ((rows) => Array.isArray(rows) ? rows : []);
  const createLeadLocation = typeof createLeadLocationFn === "function"
    ? createLeadLocationFn
    : (() => ({ address: "", lat: null, lng: null }));
  const parseCoordsFromAddressInput = typeof parseCoordsFromAddressInputFn === "function"
    ? parseCoordsFromAddressInputFn
    : (() => null);
  const getLeadPlusCodeReference = typeof getLeadPlusCodeReferenceFn === "function"
    ? getLeadPlusCodeReferenceFn
    : (() => null);
  const hasLeadLocationCoords = typeof hasLeadLocationCoordsFn === "function"
    ? hasLeadLocationCoordsFn
    : (() => false);
  const getPrimaryLeadLocation = typeof getPrimaryLeadLocationFn === "function"
    ? getPrimaryLeadLocationFn
    : ((rows) => (Array.isArray(rows) ? rows[0] : null));
  const refineLeadLocationAddressIndex = typeof refineLeadLocationAddressIndexFn === "function"
    ? refineLeadLocationAddressIndexFn
    : (() => Promise.resolve());
  const renderOverlays = typeof renderOverlaysFn === "function"
    ? renderOverlaysFn
    : (() => {});

  const leadOverlay = doc.getElementById("leadModalOverlay");
  const leadClose = doc.getElementById("leadModalClose");
  const leadSave = doc.getElementById("leadModalSave");
  const leadConvert = doc.getElementById("leadConvertBtn");
  const leadLogoTrigger = doc.getElementById("leadLogoTrigger");
  const leadLogoInput = doc.getElementById("leadLogoInput");
  const leadLogoUrl = doc.getElementById("leadLogoUrl");
  const leadBestSpotLogoTrigger = doc.getElementById("leadBestSpotLogoTrigger");
  const leadBestSpotLogoInput = doc.getElementById("leadBestSpotLogoInput");
  const leadBestSpotLogoUrl = doc.getElementById("leadBestSpotLogoUrl");
  const leadPassword = doc.getElementById("leadPassword");

  bindModalDismiss(leadOverlay, closeLeadModal, { selfOnly: true });
  bindModalDismiss(leadClose, closeLeadModal);
  if (leadSave) {
    leadSave.addEventListener("click", () => {
      if (state.leadModal.loading) return;
      if (!saveLeadFromModal) return;
      void saveLeadFromModal();
    });
  }
  if (leadConvert) {
    leadConvert.addEventListener("click", async () => {
      if (state.leadModal.loading) return;
      const id = state.leadModal.lead?.id || "";
      if (!id || !convertLeadToCustomer) return;
      const converted = await convertLeadToCustomer(id);
      if (converted) closeLeadModal();
    });
  }
  if (leadLogoTrigger && leadLogoInput) {
    leadLogoTrigger.addEventListener("click", () => leadLogoInput.click());
  }
  if (leadLogoInput) {
    leadLogoInput.addEventListener("change", (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      state.leadModal.logoFile = file;
      const reader = new FileReader();
      reader.onloadend = () => {
        const preview = String(reader.result || "");
        state.leadModal.logoPreview = preview;
        const img = doc.getElementById("leadLogoPreview");
        if (img && preview) img.setAttribute("src", preview);
      };
      reader.readAsDataURL(file);
    });
  }
  if (leadLogoUrl) {
    leadLogoUrl.addEventListener("input", () => {
      const val = leadLogoUrl.value.trim();
      const img = doc.getElementById("leadLogoPreview");
      if (img) img.setAttribute("src", val || placeholderImage);
    });
  }
  if (leadBestSpotLogoTrigger && leadBestSpotLogoInput) {
    leadBestSpotLogoTrigger.addEventListener("click", () => leadBestSpotLogoInput.click());
  }
  if (leadBestSpotLogoInput) {
    leadBestSpotLogoInput.addEventListener("change", (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      state.leadModal.bestSpotLogoFile = file;
      const reader = new FileReader();
      reader.onloadend = () => {
        const preview = String(reader.result || "");
        state.leadModal.bestSpotLogoPreview = preview;
        const img = doc.getElementById("leadBestSpotLogoPreview");
        if (img && preview) img.setAttribute("src", preview);
      };
      reader.readAsDataURL(file);
    });
  }
  if (leadBestSpotLogoUrl) {
    leadBestSpotLogoUrl.addEventListener("input", () => {
      const val = leadBestSpotLogoUrl.value.trim();
      const fallback = state.leadModal.logoPreview || state.leadModal.lead?.logoUrl || placeholderImage;
      const img = doc.getElementById("leadBestSpotLogoPreview");
      if (img) img.setAttribute("src", val || fallback);
      state.leadModal.lead = {
        ...(state.leadModal.lead || {}),
        bestSpotLogoUrl: val,
        spotLogoUrl: val
      };
    });
  }
  if (leadPassword) {
    leadPassword.addEventListener("input", () => {
      state.leadModal.lead = {
        ...(state.leadModal.lead || {}),
        password: String(leadPassword.value || "")
      };
    });
  }
  doc.querySelectorAll("[data-lead-location-add]").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (state.leadModal.loading) return;
      if (!addLeadModalLocationRow) return;
      addLeadModalLocationRow();
    });
  });
  doc.querySelectorAll("[data-lead-location-remove]").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (state.leadModal.loading) return;
      const idx = Number(btn.getAttribute("data-lead-location-remove"));
      if (!Number.isInteger(idx) || idx < 0 || !removeLeadModalLocationRow) return;
      removeLeadModalLocationRow(idx);
    });
  });
  doc.querySelectorAll("[data-lead-location-pick]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const index = Number(btn.getAttribute("data-lead-location-pick"));
      if (!Number.isInteger(index) || index < 0 || !openLocationPicker) return;
      syncLeadModalDraftFromForm();
      void openLocationPicker({
        addressInputId: `leadLocationAddress_${index}`,
        coordsDisplayId: `leadLocationCoords_${index}`,
        context: `lead_location:${index}`
      });
    });
  });
  doc.querySelectorAll("[data-lead-location-address]").forEach((input) => {
    input.addEventListener("input", () => {
      const index = Number(input.getAttribute("data-lead-location-address"));
      if (!Number.isInteger(index) || index < 0) return;
      const list = normalizeLeadLocations(state.leadModal.locations, state.leadModal.lead?.address || "", state.leadModal.coords || null);
      while (list.length <= index) list.push(createLeadLocation());
      const currentRow = list[index] || createLeadLocation();
      const parsedCoords = parseCoordsFromAddressInput(input.value, getLeadPlusCodeReference(input.value));
      list[index] = createLeadLocation({
        address: input.value,
        lat: parsedCoords ? parsedCoords.lat : (hasLeadLocationCoords(currentRow) ? currentRow.lat : null),
        lng: parsedCoords ? parsedCoords.lng : (hasLeadLocationCoords(currentRow) ? currentRow.lng : null)
      });
      state.leadModal.locations = list;
      state.leadModal.lead = { ...(state.leadModal.lead || {}), address: list[0]?.address || "" };
      const badge = doc.getElementById(`leadLocationCoords_${index}`);
      if (badge) badge.classList.toggle("hidden", !hasLeadLocationCoords(list[index]));
      const primary = getPrimaryLeadLocation(list);
      state.leadModal.coords = hasLeadLocationCoords(primary) ? { lat: primary.lat, lng: primary.lng } : null;
    });
    input.addEventListener("blur", () => {
      const index = Number(input.getAttribute("data-lead-location-address"));
      if (!Number.isInteger(index) || index < 0) return;
      void refineLeadLocationAddressIndex(index, input.value, { hydratePrimary: index === 0 }).then(() => {
        renderOverlays({ updateLead: true });
      });
    });
  });
}
