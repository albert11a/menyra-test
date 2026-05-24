export function bindCrmStaffEventsCore({
  documentObj,
  state,
  renderFn,
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
