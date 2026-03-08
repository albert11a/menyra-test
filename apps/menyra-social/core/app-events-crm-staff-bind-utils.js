export function bindLeadInlineCreateEventsCore({
  documentObj,
  state,
  renderFn,
  deleteLeadFromModalFn,
  saveLeadFromModalFn,
  syncLeadDerivedFieldsFn,
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
  hydrateLeadGeoFieldsFromCoordsFn,
  refineLeadLocationAddressIndexFn
} = {}) {
  const doc = documentObj || null;
  if (!doc || !state) return;
  const render = typeof renderFn === "function" ? renderFn : (() => {});
  const deleteLeadFromModal = typeof deleteLeadFromModalFn === "function" ? deleteLeadFromModalFn : null;
  const saveLeadFromModal = typeof saveLeadFromModalFn === "function" ? saveLeadFromModalFn : null;
  const syncLeadDerivedFields = typeof syncLeadDerivedFieldsFn === "function" ? syncLeadDerivedFieldsFn : (() => {});
  const addLeadModalLocationRow = typeof addLeadModalLocationRowFn === "function" ? addLeadModalLocationRowFn : (() => {});
  const removeLeadModalLocationRow = typeof removeLeadModalLocationRowFn === "function" ? removeLeadModalLocationRowFn : (() => {});
  const syncLeadModalDraftFromForm = typeof syncLeadModalDraftFromFormFn === "function" ? syncLeadModalDraftFromFormFn : (() => {});
  const openLocationPicker = typeof openLocationPickerFn === "function" ? openLocationPickerFn : null;
  const normalizeLeadLocations = typeof normalizeLeadLocationsFn === "function" ? normalizeLeadLocationsFn : ((list) => Array.isArray(list) ? list : []);
  const createLeadLocation = typeof createLeadLocationFn === "function" ? createLeadLocationFn : (() => ({ address: "", lat: null, lng: null }));
  const parseCoordsFromAddressInput = typeof parseCoordsFromAddressInputFn === "function" ? parseCoordsFromAddressInputFn : (() => null);
  const getLeadPlusCodeReference = typeof getLeadPlusCodeReferenceFn === "function" ? getLeadPlusCodeReferenceFn : (() => null);
  const hasLeadLocationCoords = typeof hasLeadLocationCoordsFn === "function" ? hasLeadLocationCoordsFn : (() => false);
  const getPrimaryLeadLocation = typeof getPrimaryLeadLocationFn === "function" ? getPrimaryLeadLocationFn : ((rows) => rows?.[0] || null);
  const hydrateLeadGeoFieldsFromCoords = typeof hydrateLeadGeoFieldsFromCoordsFn === "function"
    ? hydrateLeadGeoFieldsFromCoordsFn
    : null;
  const refineLeadLocationAddressIndex = typeof refineLeadLocationAddressIndexFn === "function"
    ? refineLeadLocationAddressIndexFn
    : null;

  const leadInlineActionsToggle = doc.getElementById("leadInlineActionsToggle");
  const leadInlineActionsBackdrop = doc.getElementById("leadInlineActionsBackdrop");
  const leadInlineDeleteBtn = doc.getElementById("leadInlineDeleteBtn");

  if (leadInlineActionsToggle) {
    leadInlineActionsToggle.addEventListener("click", (evt) => {
      evt.preventDefault();
      evt.stopPropagation();
      if (state.leadModal.loading || state.leadModal.deleting) return;
      state.leadModal.actionsOpen = !state.leadModal.actionsOpen;
      render();
    });
  }

  if (leadInlineActionsBackdrop) {
    leadInlineActionsBackdrop.addEventListener("click", () => {
      if (!state.leadModal.actionsOpen) return;
      state.leadModal.actionsOpen = false;
      render();
    });
  }

  if (leadInlineDeleteBtn) {
    leadInlineDeleteBtn.addEventListener("click", () => {
      if (state.leadModal.loading || state.leadModal.deleting || !deleteLeadFromModal) return;
      void deleteLeadFromModal();
    });
  }

  const leadInlineSaveBtn = doc.getElementById("leadInlineSaveBtn");
  if (leadInlineSaveBtn) {
    leadInlineSaveBtn.addEventListener("click", () => {
      if (state.leadModal.loading || !saveLeadFromModal) return;
      void saveLeadFromModal();
    });
  }
  const leadLogoTrigger = doc.getElementById("leadLogoTrigger");
  const leadLogoInput = doc.getElementById("leadLogoInput");
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

  const syncIds = ["leadBusinessName", "leadCustomerType", "leadBillingCycle"];
  syncIds.forEach((id) => {
    const node = doc.getElementById(id);
    if (!node) return;
    node.addEventListener("input", () => syncLeadDerivedFields());
    node.addEventListener("change", () => syncLeadDerivedFields());
  });

  doc.querySelectorAll("[data-lead-location-add]").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (state.leadModal.loading) return;
      addLeadModalLocationRow();
    });
  });
  doc.querySelectorAll("[data-lead-location-remove]").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (state.leadModal.loading) return;
      removeLeadModalLocationRow(Number(btn.getAttribute("data-lead-location-remove")));
    });
  });
  doc.querySelectorAll("[data-lead-location-pick]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const index = Number(btn.getAttribute("data-lead-location-pick"));
      if (!Number.isInteger(index) || index < 0 || !openLocationPicker) return;
      syncLeadModalDraftFromForm();
      void openLocationPicker({
        addressInputId: `leadLocationAddress_${index}`,
        coordsDisplayId: index === 0 ? "leadCoordsDisplay" : `leadLocationCoords_${index}`,
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
      const badge = doc.getElementById(index === 0 ? "leadCoordsDisplay" : `leadLocationCoords_${index}`);
      if (badge) badge.classList.toggle("hidden", !hasLeadLocationCoords(list[index]));
      const primary = getPrimaryLeadLocation(list);
      state.leadModal.coords = hasLeadLocationCoords(primary) ? { lat: primary.lat, lng: primary.lng } : null;
    });
    input.addEventListener("change", () => {
      const index = Number(input.getAttribute("data-lead-location-address"));
      if (index !== 0 || !hydrateLeadGeoFieldsFromCoords) return;
      const parsedCoords = parseCoordsFromAddressInput(input.value, getLeadPlusCodeReference(input.value));
      if (!parsedCoords) return;
      void hydrateLeadGeoFieldsFromCoords(parsedCoords, { sourceInputId: input.id });
    });
    input.addEventListener("blur", () => {
      const index = Number(input.getAttribute("data-lead-location-address"));
      if (!Number.isInteger(index) || index < 0 || !refineLeadLocationAddressIndex) return;
      void refineLeadLocationAddressIndex(index, input.value, { hydratePrimary: index === 0 }).then(() => {
        render();
      });
    });
  });
  syncLeadDerivedFields();
}

export function bindCrmStaffEventsCore({
  documentObj,
  state,
  renderFn,
  openLeadCreatorFn,
  openLeadSettingsViewFn,
  closeLeadSubviewFn,
  saveLeadSettingsFn,
  isLeadInlineCreateViewFn,
  bindLeadInlineCreateEventsFn,
  normalizeLeadScopeKeyFn,
  loadLeadsFn,
  openLeadModalFn,
  normalizeCustomerScopeKeyFn,
  loadCustomersFn,
  openCustomerModalFn,
  closeStaffEditorFn,
  openStaffEditorFn,
  syncStaffDerivedEmailFieldFn,
  normalizeCeoCountryFn,
  syncStaffFormFromDomFn,
  openLocationPickerFn,
  saveCeoStaffFromViewFn,
  deleteCeoStaffFromViewFn
} = {}) {
  const doc = documentObj || null;
  if (!doc || !state) return;
  const render = typeof renderFn === "function" ? renderFn : (() => {});
  const openLeadCreator = typeof openLeadCreatorFn === "function" ? openLeadCreatorFn : (() => {});
  const openLeadSettingsView = typeof openLeadSettingsViewFn === "function" ? openLeadSettingsViewFn : (() => {});
  const closeLeadSubview = typeof closeLeadSubviewFn === "function" ? closeLeadSubviewFn : (() => {});
  const saveLeadSettings = typeof saveLeadSettingsFn === "function" ? saveLeadSettingsFn : null;
  const isLeadInlineCreateView = typeof isLeadInlineCreateViewFn === "function" ? isLeadInlineCreateViewFn : (() => false);
  const bindLeadInlineCreateEvents = typeof bindLeadInlineCreateEventsFn === "function" ? bindLeadInlineCreateEventsFn : null;
  const normalizeLeadScopeKey = typeof normalizeLeadScopeKeyFn === "function" ? normalizeLeadScopeKeyFn : ((value) => String(value || "").trim());
  const loadLeads = typeof loadLeadsFn === "function" ? loadLeadsFn : null;
  const openLeadModal = typeof openLeadModalFn === "function" ? openLeadModalFn : (() => {});
  const normalizeCustomerScopeKey = typeof normalizeCustomerScopeKeyFn === "function"
    ? normalizeCustomerScopeKeyFn
    : ((value) => String(value || "").trim());
  const loadCustomers = typeof loadCustomersFn === "function" ? loadCustomersFn : null;
  const openCustomerModal = typeof openCustomerModalFn === "function" ? openCustomerModalFn : (() => {});
  const closeStaffEditor = typeof closeStaffEditorFn === "function" ? closeStaffEditorFn : (() => {});
  const openStaffEditor = typeof openStaffEditorFn === "function" ? openStaffEditorFn : (() => {});
  const syncStaffDerivedEmailField = typeof syncStaffDerivedEmailFieldFn === "function"
    ? syncStaffDerivedEmailFieldFn
    : (() => {});
  const normalizeCeoCountry = typeof normalizeCeoCountryFn === "function"
    ? normalizeCeoCountryFn
    : ((value) => String(value || "").trim());
  const syncStaffFormFromDom = typeof syncStaffFormFromDomFn === "function" ? syncStaffFormFromDomFn : (() => {});
  const openLocationPicker = typeof openLocationPickerFn === "function" ? openLocationPickerFn : null;
  const saveCeoStaffFromView = typeof saveCeoStaffFromViewFn === "function" ? saveCeoStaffFromViewFn : null;
  const deleteCeoStaffFromView = typeof deleteCeoStaffFromViewFn === "function" ? deleteCeoStaffFromViewFn : null;

  const newLeadBtn = doc.getElementById("newLeadBtn");
  if (newLeadBtn) {
    newLeadBtn.addEventListener("click", () => openLeadCreator());
  }

  const leadSettingsBtn = doc.getElementById("leadSettingsBtn");
  if (leadSettingsBtn) {
    leadSettingsBtn.addEventListener("click", () => openLeadSettingsView());
  }

  doc.querySelectorAll("[data-leads-back]").forEach((btn) => {
    btn.addEventListener("click", () => {
      closeLeadSubview();
    });
  });

  const leadSettingsSaveBtn = doc.getElementById("leadSettingsSaveBtn");
  if (leadSettingsSaveBtn) {
    leadSettingsSaveBtn.addEventListener("click", () => {
      if (state.leads.settingsSaving || !saveLeadSettings) return;
      void saveLeadSettings();
    });
  }

  if (isLeadInlineCreateView() && bindLeadInlineCreateEvents) {
    bindLeadInlineCreateEvents();
  }

  const leadsSearchInput = doc.getElementById("leadsSearchInput");
  if (leadsSearchInput) {
    leadsSearchInput.addEventListener("input", () => {
      state.leads.query = leadsSearchInput.value || "";
      state.leads.keepFocus = true;
      render();
    });
  }

  const leadsStatusFilter = doc.getElementById("leadsStatusFilter");
  if (leadsStatusFilter) {
    leadsStatusFilter.addEventListener("change", () => {
      state.leads.status = leadsStatusFilter.value || "";
      render();
    });
  }

  doc.querySelectorAll("[data-lead-scope]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const nextScope = normalizeLeadScopeKey(btn.dataset.leadScope || "");
      if (state.leads.scope === nextScope) return;
      state.leads.scope = nextScope;
      if (state.leads.loaded?.[nextScope]) {
        state.leads.items = Array.isArray(state.leads.pages?.[nextScope]) ? state.leads.pages[nextScope].slice() : [];
        render();
        return;
      }
      if (loadLeads) void loadLeads({ scope: nextScope });
    });
  });

  doc.querySelectorAll("[data-lead-edit]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.leadEdit;
      if (!id) return;
      const lead = state.leads.items.find((item) => String(item.id) === String(id));
      if (lead) openLeadModal("edit", lead);
    });
  });

  const customersSearchInput = doc.getElementById("customersSearchInput");
  if (customersSearchInput) {
    customersSearchInput.addEventListener("input", () => {
      state.customers.query = customersSearchInput.value || "";
      state.customers.keepFocus = true;
      render();
    });
  }

  doc.querySelectorAll("[data-customer-scope]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const nextScope = normalizeCustomerScopeKey(btn.dataset.customerScope || "");
      if (state.customers.scope === nextScope) return;
      state.customers.scope = nextScope;
      if (state.customers.loaded?.[nextScope]) {
        state.customers.items = Array.isArray(state.customers.pages?.[nextScope]) ? state.customers.pages[nextScope].slice() : [];
        render();
        return;
      }
      if (loadCustomers) void loadCustomers({ scope: nextScope });
    });
  });

  doc.querySelectorAll("[data-customer-edit]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.customerEdit;
      if (!id) return;
      const customer = (state.customers.items || []).find((item) => String(item.id) === String(id));
      if (customer) openCustomerModal(customer);
    });
  });

  doc.querySelectorAll("[data-staff-back]").forEach((btn) => {
    btn.addEventListener("click", () => {
      closeStaffEditor();
      render();
    });
  });

  const staffNewBtn = doc.getElementById("staffNewBtn");
  if (staffNewBtn) {
    staffNewBtn.addEventListener("click", () => {
      openStaffEditor("create");
    });
  }

  doc.querySelectorAll("[data-staff-edit]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.staffEdit || "";
      if (!id) return;
      const entry = (state.staff.items || []).find((item) => String(item.uid || "") === String(id));
      if (entry) openStaffEditor("edit", entry);
    });
  });

  [
    ["staffFirstName", "firstName"],
    ["staffLastName", "lastName"],
    ["staffPassword", "password"],
    ["staffLocationLabel", "locationLabel"]
  ].forEach(([id, key]) => {
    const node = doc.getElementById(id);
    if (!node) return;
    node.addEventListener("input", () => {
      state.staff.form = {
        ...state.staff.form,
        [key]: String(node.value || "")
      };
      state.staff.status = "";
      if (state.staff.error) state.staff.error = "";
      if (key === "firstName" || key === "lastName") {
        syncStaffDerivedEmailField();
      }
    });
  });

  const staffCountry = doc.getElementById("staffCountry");
  if (staffCountry) {
    staffCountry.addEventListener("change", () => {
      state.staff.form = {
        ...state.staff.form,
        country: normalizeCeoCountry(staffCountry.value)
      };
      state.staff.status = "";
      if (state.staff.error) state.staff.error = "";
    });
  }

  const staffAvatarTrigger = doc.getElementById("staffAvatarTrigger");
  const staffAvatarInput = doc.getElementById("staffAvatarInput");
  if (staffAvatarTrigger && staffAvatarInput) {
    staffAvatarTrigger.addEventListener("click", () => staffAvatarInput.click());
  }
  if (staffAvatarInput) {
    staffAvatarInput.addEventListener("change", (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      state.staff.form = {
        ...state.staff.form,
        avatarFile: file
      };
      state.staff.status = "";
      if (state.staff.error) state.staff.error = "";
      const reader = new FileReader();
      reader.onloadend = () => {
        const preview = String(reader.result || "");
        state.staff.form = {
          ...state.staff.form,
          avatarPreview: preview
        };
        const img = doc.getElementById("staffAvatarPreview");
        if (img && preview) img.setAttribute("src", preview);
      };
      reader.readAsDataURL(file);
    });
  }

  const staffLocationPickBtn = doc.getElementById("staffLocationPickBtn");
  if (staffLocationPickBtn) {
    staffLocationPickBtn.addEventListener("click", () => {
      syncStaffFormFromDom();
      state.staff.status = "";
      if (!openLocationPicker) return;
      openLocationPicker({
        addressInputId: "staffLocationLabel",
        coordsDisplayId: "staffCoordsDisplay",
        context: "staff"
      });
    });
  }

  const staffSaveBtn = doc.getElementById("staffSaveBtn");
  if (staffSaveBtn) {
    staffSaveBtn.addEventListener("click", () => {
      if (!saveCeoStaffFromView) return;
      void saveCeoStaffFromView();
    });
  }

  const staffDeleteBtn = doc.getElementById("staffDeleteBtn");
  if (staffDeleteBtn) {
    staffDeleteBtn.addEventListener("click", () => {
      if (!deleteCeoStaffFromView) return;
      void deleteCeoStaffFromView();
    });
  }
}
