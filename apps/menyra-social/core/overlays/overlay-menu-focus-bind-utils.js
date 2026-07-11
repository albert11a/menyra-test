import { isVideoFileCore, captureVideoPosterFileCore } from "../media/video-poster-utils.js";
import { MAX_FOCUS_OFFER_EXTRA_IMAGES } from "../menu/customer-focus-modal-render-utils.js";

function revokeObjectUrlSafe(url) {
  const safe = String(url || "").trim();
  if (!safe.startsWith("blob:")) return;
  if (typeof URL === "undefined" || typeof URL.revokeObjectURL !== "function") return;
  try {
    URL.revokeObjectURL(safe);
  } catch {}
}

export function bindMenuOverlayEventsCore({
  documentObj,
  bindModalDismissFn,
  closeMenuModalFn,
  saveMenuItemFromModalFn,
  renderOverlaysFn,
  syncMenuModalCropPreviewFn,
  clampCropPercentFn,
  state,
  placeholderImage = ""
} = {}) {
  const doc = documentObj || null;
  const bindModalDismiss = typeof bindModalDismissFn === "function"
    ? bindModalDismissFn
    : null;
  if (!doc || !bindModalDismiss) return;
  const closeMenuModal = typeof closeMenuModalFn === "function"
    ? closeMenuModalFn
    : (() => {});
  const saveMenuItemFromModal = typeof saveMenuItemFromModalFn === "function"
    ? saveMenuItemFromModalFn
    : null;
  const renderOverlays = typeof renderOverlaysFn === "function"
    ? renderOverlaysFn
    : (() => {});
  const syncMenuModalCropPreview = typeof syncMenuModalCropPreviewFn === "function"
    ? syncMenuModalCropPreviewFn
    : (() => {});
  const clampCropPercent = typeof clampCropPercentFn === "function"
    ? clampCropPercentFn
    : ((value, fallback = 50) => {
      const numeric = Number(value);
      if (!Number.isFinite(numeric)) return Number(fallback) || 50;
      return Math.min(100, Math.max(0, numeric));
    });

  const menuModalOverlay = doc.getElementById("menuModalOverlay");
  const menuModalClose = doc.getElementById("menuModalClose");
  const menuModalSave = doc.getElementById("menuModalSave");
  const menuImageTrigger = doc.getElementById("menuItemImageTrigger");
  const menuImageInput = doc.getElementById("menuItemImageInput");
  const menuCropX = doc.getElementById("menuItemCropX");
  const menuCropY = doc.getElementById("menuItemCropY");
  const menuCardStyle = doc.getElementById("menuItemCardStyle");
  const menuSmallCardCropControl = doc.getElementById("menuSmallCardCropControl");
  const menuSmallCropButtons = Array.from(doc.querySelectorAll("[data-menu-small-crop]"));
  const menuSpecialActionType = doc.getElementById("menuItemSpecialActionType");
  const menuSpecialActionProductField = doc.getElementById("menuItemSpecialActionProductField");
  const menuSpecialActionLinkField = doc.getElementById("menuItemSpecialActionLinkField");

  const resolveSmallCropPreset = (value) => {
    const numeric = Number(value);
    if (!Number.isFinite(numeric)) return "center";
    if (numeric <= 33) return "left";
    if (numeric >= 67) return "right";
    return "center";
  };
  const syncSmallCropButtonState = () => {
    if (!menuSmallCropButtons.length) return;
    const activePreset = resolveSmallCropPreset(state.menuModal?.cropX ?? 50);
    menuSmallCropButtons.forEach((btn) => {
      const preset = String(btn.dataset.menuSmallCrop || "center").trim().toLowerCase();
      const active = preset === activePreset;
      btn.classList.toggle("bg-slate-900", active);
      btn.classList.toggle("text-white", active);
      btn.classList.toggle("border-slate-900", active);
      btn.classList.toggle("bg-white", !active);
      btn.classList.toggle("text-slate-500", !active);
      btn.classList.toggle("border-slate-200", !active);
    });
  };
  const syncSmallCropControlVisibility = () => {
    if (!menuSmallCardCropControl) return;
    const styleValue = String(
      menuCardStyle?.value
      || state.menuModal?.item?.cardStyle
      || ""
    ).trim().toLowerCase();
    menuSmallCardCropControl.classList.toggle("hidden", styleValue !== "testfirst_drink");
    syncSmallCropButtonState();
  };

  bindModalDismiss(menuModalOverlay, closeMenuModal, { selfOnly: true });
  bindModalDismiss(menuModalClose, closeMenuModal);
  if (menuModalSave) {
    menuModalSave.addEventListener("click", () => {
      if (state.menuModal.loading) return;
      if (!saveMenuItemFromModal) return;
      void saveMenuItemFromModal();
    });
  }
  if (menuImageTrigger && menuImageInput) {
    menuImageTrigger.addEventListener("click", () => menuImageInput.click());
  }
  const clearMenuVideoDraft = () => {
    revokeObjectUrlSafe(state.menuModal?.videoPreview);
    state.menuModal.videoFile = null;
    state.menuModal.videoPreview = "";
    state.menuModal.videoPosterPreview = "";
  };
  if (menuImageInput) {
    menuImageInput.addEventListener("change", (e) => {
      const allFiles = Array.from(e.target.files || []);
      if (!allFiles.length) return;
      const videoFile = allFiles.find((file) => isVideoFileCore(file));
      if (videoFile) {
        // Video ausgewaehlt: ersetzt die Foto-Auswahl. Erstes Frame als
        // Poster einfangen, damit die Vorschau sofort ein Bild zeigt.
        clearMenuVideoDraft();
        const objectUrl = (typeof URL !== "undefined" && typeof URL.createObjectURL === "function")
          ? URL.createObjectURL(videoFile)
          : "";
        state.menuModal.videoFile = videoFile;
        state.menuModal.videoPreview = objectUrl;
        state.menuModal.imageFiles = [];
        state.menuModal.imagePreviews = [];
        if (menuImageInput) menuImageInput.value = "";
        renderOverlays({ updateMenu: true });
        void (async () => {
          try {
            const posterFile = await captureVideoPosterFileCore(videoFile, { documentObj: doc });
            if (!posterFile) return;
            const reader = new FileReader();
            reader.onloadend = () => {
              if (state.menuModal?.videoFile !== videoFile) return;
              state.menuModal.videoPosterPreview = reader.result || "";
              renderOverlays({ updateMenu: true });
            };
            reader.readAsDataURL(posterFile);
          } catch {}
        })();
        return;
      }
      const files = allFiles.filter((file) => !isVideoFileCore(file));
      if (!files.length) return;
      clearMenuVideoDraft();
      const nextFiles = [...(state.menuModal.imageFiles || []), ...files];
      const previews = [];
      let remaining = files.length;
      files.forEach((file) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          previews.push(reader.result || "");
          remaining -= 1;
          if (remaining <= 0) {
            state.menuModal.imageFiles = nextFiles;
            state.menuModal.imagePreviews = [
              ...(state.menuModal.imagePreviews || []),
              ...previews
            ];
            if (menuImageInput) menuImageInput.value = "";
            renderOverlays({ updateMenu: true });
          }
        };
        reader.readAsDataURL(file);
      });
    });
  }
  const menuVideoRemove = doc.getElementById("menuItemVideoRemove");
  if (menuVideoRemove) {
    menuVideoRemove.addEventListener("click", () => {
      clearMenuVideoDraft();
      // Bestehendes gespeichertes Video ebenfalls entfernen, damit Speichern
      // das Item auf "kein Medium" zuruecksetzt.
      if (state.menuModal.item) {
        state.menuModal.item = {
          ...state.menuModal.item,
          mediaType: "image",
          videoUrl: "",
          posterUrl: ""
        };
      }
      renderOverlays({ updateMenu: true });
    });
  }
  const syncSpecialActionFields = () => {
    const action = String(menuSpecialActionType?.value || "").trim().toLowerCase();
    if (menuSpecialActionProductField) {
      menuSpecialActionProductField.classList.toggle("hidden", action !== "product");
    }
    if (menuSpecialActionLinkField) {
      menuSpecialActionLinkField.classList.toggle("hidden", action !== "link");
    }
  };
  if (menuSpecialActionType) {
    menuSpecialActionType.addEventListener("change", syncSpecialActionFields);
    syncSpecialActionFields();
  }
  if (menuCropX) {
    menuCropX.addEventListener("input", () => {
      state.menuModal.cropX = clampCropPercent(menuCropX.value, 50);
      syncMenuModalCropPreview();
      syncSmallCropButtonState();
    });
  }
  if (menuCropY) {
    menuCropY.addEventListener("input", () => {
      state.menuModal.cropY = clampCropPercent(menuCropY.value, 50);
      syncMenuModalCropPreview();
    });
  }
  if (menuCardStyle) {
    menuCardStyle.addEventListener("change", syncSmallCropControlVisibility);
  }
  if (menuSmallCropButtons.length) {
    menuSmallCropButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const preset = String(btn.dataset.menuSmallCrop || "center").trim().toLowerCase();
        const nextCropX = preset === "left" ? 0 : (preset === "right" ? 100 : 50);
        state.menuModal.cropX = clampCropPercent(nextCropX, 50);
        if (menuCropX) {
          menuCropX.value = String(state.menuModal.cropX);
        }
        syncMenuModalCropPreview();
        syncSmallCropButtonState();
      });
    });
  }
  syncMenuModalCropPreview();
  syncSmallCropControlVisibility();

  doc.querySelectorAll("[data-menu-image-remove]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const idx = Number(btn.dataset.menuImageRemove || "0");
      const source = btn.dataset.menuImageSource || "existing";
      if (source === "existing") {
        const next = (state.menuModal.existingImages || []).filter((_, i) => i !== idx);
        state.menuModal.existingImages = next;
      } else {
        const nextFiles = (state.menuModal.imageFiles || []).filter((_, i) => i !== idx);
        const nextPreviews = (state.menuModal.imagePreviews || []).filter((_, i) => i !== idx);
        state.menuModal.imageFiles = nextFiles;
        state.menuModal.imagePreviews = nextPreviews;
      }
      renderOverlays({ updateMenu: true });
    });
  });
}

export function bindFocusOverlayEventsCore({
  documentObj,
  bindModalDismissFn,
  closeFocusModalFn,
  saveFocusItemFromModalFn,
  renderOverlaysFn,
  syncFocusModalCropPreviewFn,
  clampCropPercentFn,
  state
} = {}) {
  const doc = documentObj || null;
  const bindModalDismiss = typeof bindModalDismissFn === "function"
    ? bindModalDismissFn
    : null;
  if (!doc || !bindModalDismiss) return;
  const closeFocusModal = typeof closeFocusModalFn === "function"
    ? closeFocusModalFn
    : (() => {});
  const saveFocusItemFromModal = typeof saveFocusItemFromModalFn === "function"
    ? saveFocusItemFromModalFn
    : null;
  const renderOverlays = typeof renderOverlaysFn === "function"
    ? renderOverlaysFn
    : (() => {});
  const syncFocusModalCropPreview = typeof syncFocusModalCropPreviewFn === "function"
    ? syncFocusModalCropPreviewFn
    : (() => {});
  const clampCropPercent = typeof clampCropPercentFn === "function"
    ? clampCropPercentFn
    : ((value, fallback = 50) => {
      const numeric = Number(value);
      if (!Number.isFinite(numeric)) return Number(fallback) || 50;
      return Math.min(100, Math.max(0, numeric));
    });

  const focusOverlay = doc.getElementById("focusModalOverlay");
  const focusClose = doc.getElementById("focusModalClose");
  const focusSave = doc.getElementById("focusModalSave");
  const focusImageTrigger = doc.getElementById("focusImageTrigger");
  const focusImageInput = doc.getElementById("focusImageInput");
  const focusCropX = doc.getElementById("focusCropX");
  const focusCropY = doc.getElementById("focusCropY");

  bindModalDismiss(focusOverlay, closeFocusModal, { selfOnly: true });
  bindModalDismiss(focusClose, closeFocusModal);
  if (focusSave) {
    focusSave.addEventListener("click", () => {
      if (state.focusModal.loading) return;
      if (!saveFocusItemFromModal) return;
      void saveFocusItemFromModal();
    });
  }
  if (focusImageTrigger && focusImageInput) {
    focusImageTrigger.addEventListener("click", () => focusImageInput.click());
  }
  const clearFocusVideoDraft = () => {
    revokeObjectUrlSafe(state.focusModal?.videoPreview);
    state.focusModal.videoFile = null;
    state.focusModal.videoPreview = "";
    state.focusModal.videoPosterPreview = "";
  };
  if (focusImageInput) {
    focusImageInput.addEventListener("change", (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      if (isVideoFileCore(file)) {
        // Fokus-Video ausgewaehlt: ersetzt die Foto-Auswahl, erstes Frame
        // als Poster fuer die sofortige Vorschau.
        clearFocusVideoDraft();
        const objectUrl = (typeof URL !== "undefined" && typeof URL.createObjectURL === "function")
          ? URL.createObjectURL(file)
          : "";
        state.focusModal.videoFile = file;
        state.focusModal.videoPreview = objectUrl;
        state.focusModal.imageFile = null;
        state.focusModal.imagePreview = "";
        if (focusImageInput) focusImageInput.value = "";
        renderOverlays({ updateFocus: true });
        void (async () => {
          try {
            const posterFile = await captureVideoPosterFileCore(file, { documentObj: doc });
            if (!posterFile) return;
            const posterReader = new FileReader();
            posterReader.onloadend = () => {
              if (state.focusModal?.videoFile !== file) return;
              state.focusModal.videoPosterPreview = posterReader.result || "";
              renderOverlays({ updateFocus: true });
            };
            posterReader.readAsDataURL(posterFile);
          } catch {}
        })();
        return;
      }
      clearFocusVideoDraft();
      const reader = new FileReader();
      reader.onloadend = () => {
        state.focusModal.imageFile = file;
        state.focusModal.imagePreview = reader.result || "";
        renderOverlays({ updateFocus: true });
      };
      reader.readAsDataURL(file);
    });
  }
  // Zusatzfotos der Oferta-Galerie: mehrere Dateien pro Auswahl, Vorschau
  // per Object-URL; Files und Previews bleiben index-synchron.
  const focusExtraTrigger = doc.getElementById("focusExtraImagesTrigger");
  const focusExtraInput = doc.getElementById("focusExtraImagesInput");
  if (focusExtraTrigger && focusExtraInput) {
    focusExtraTrigger.addEventListener("click", () => focusExtraInput.click());
  }
  if (focusExtraInput) {
    focusExtraInput.addEventListener("change", (e) => {
      const files = Array.from(e.target.files || []).filter((file) => file && !isVideoFileCore(file));
      if (!files.length) return;
      const existingCount = (state.focusModal.existingExtraImages || []).length;
      const currentFiles = Array.isArray(state.focusModal.extraImageFiles) ? state.focusModal.extraImageFiles : [];
      const currentPreviews = Array.isArray(state.focusModal.extraImagePreviews) ? state.focusModal.extraImagePreviews : [];
      const freeSlots = Math.max(0, MAX_FOCUS_OFFER_EXTRA_IMAGES - existingCount - currentFiles.length);
      const accepted = files.slice(0, freeSlots);
      const newPreviews = accepted.map((file) => {
        try {
          return (typeof URL !== "undefined" && typeof URL.createObjectURL === "function")
            ? URL.createObjectURL(file)
            : "";
        } catch {
          return "";
        }
      });
      state.focusModal.extraImageFiles = [...currentFiles, ...accepted];
      state.focusModal.extraImagePreviews = [...currentPreviews, ...newPreviews];
      if (accepted.length < files.length) {
        state.focusModal.status = `Maksimumi ${MAX_FOCUS_OFFER_EXTRA_IMAGES} foto shtesë.`;
      }
      try { focusExtraInput.value = ""; } catch {}
      renderOverlays({ updateFocus: true });
    });
  }
  doc.querySelectorAll("[data-focus-extra-image-remove]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const idx = Number(btn.getAttribute("data-focus-extra-image-remove"));
      const source = btn.getAttribute("data-focus-extra-image-source") || "existing";
      if (!Number.isFinite(idx)) return;
      if (source === "existing") {
        state.focusModal.existingExtraImages = (state.focusModal.existingExtraImages || []).filter((_, i) => i !== idx);
      } else {
        revokeObjectUrlSafe((state.focusModal.extraImagePreviews || [])[idx]);
        state.focusModal.extraImageFiles = (state.focusModal.extraImageFiles || []).filter((_, i) => i !== idx);
        state.focusModal.extraImagePreviews = (state.focusModal.extraImagePreviews || []).filter((_, i) => i !== idx);
      }
      renderOverlays({ updateFocus: true });
    });
  });
  const focusVideoRemove = doc.getElementById("focusVideoRemove");
  if (focusVideoRemove) {
    focusVideoRemove.addEventListener("click", () => {
      clearFocusVideoDraft();
      if (state.focusModal.item) {
        state.focusModal.item = {
          ...state.focusModal.item,
          mediaType: "image",
          videoUrl: "",
          posterUrl: ""
        };
      }
      renderOverlays({ updateFocus: true });
    });
  }
  if (focusCropX) {
    focusCropX.addEventListener("input", () => {
      state.focusModal.cropX = clampCropPercent(focusCropX.value, 50);
      syncFocusModalCropPreview();
    });
  }
  if (focusCropY) {
    focusCropY.addEventListener("input", () => {
      state.focusModal.cropY = clampCropPercent(focusCropY.value, 50);
      syncFocusModalCropPreview();
    });
  }
  syncFocusModalCropPreview();
}
