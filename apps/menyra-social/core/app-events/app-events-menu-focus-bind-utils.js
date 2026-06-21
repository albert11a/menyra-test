export function bindAppMenuFocusEventsCore({
  documentObj,
  state,
  renderFn,
  saveMenuLayoutToStorageFn,
  openMenuModalFn,
  deleteMenuItemByIdFn,
  triggerMenuDetailOpenFromGestureFn,
  updateShopCartQuantityFn,
  updateShopCartItemCommentFn,
  openShopCheckoutFn,
  submitShopCheckoutFn,
  updateShopCheckoutFieldFn,
  saveTableQrConfigFn,
  setDocFn,
  docFn,
  db,
  serverTimestampFn,
  uploadCompressedImageFn,
  focusCache,
  focusCacheKeyFn,
  saveFocusEnabledFn,
  openFocusModalFn,
  deleteFocusItemByIdFn,
  setFocusIndexFn,
  toggleProfilePostMenuFn,
  toggleProfilePostWidthFn,
  deleteProfilePostFn,
  setProfileMenuOpenFn,
  profileMenuBound = false,
  mapLocateFn,
  bindNotificationsDelegationFn
} = {}) {
  const doc = documentObj || null;
  if (!doc || !state) return { profileMenuBound };
  const render = typeof renderFn === "function" ? renderFn : (() => {});
  const saveMenuLayoutToStorage = typeof saveMenuLayoutToStorageFn === "function"
    ? saveMenuLayoutToStorageFn
    : (() => {});
  const openMenuModal = typeof openMenuModalFn === "function" ? openMenuModalFn : (() => {});
  const deleteMenuItemById = typeof deleteMenuItemByIdFn === "function" ? deleteMenuItemByIdFn : null;
  const triggerMenuDetailOpenFromGesture = typeof triggerMenuDetailOpenFromGestureFn === "function"
    ? triggerMenuDetailOpenFromGestureFn
    : (() => {});
  const updateShopCartQuantity = typeof updateShopCartQuantityFn === "function"
    ? updateShopCartQuantityFn
    : (() => {});
  const updateShopCartItemComment = typeof updateShopCartItemCommentFn === "function"
    ? updateShopCartItemCommentFn
    : (() => {});
  const openShopCheckout = typeof openShopCheckoutFn === "function" ? openShopCheckoutFn : (() => {});
  const submitShopCheckout = typeof submitShopCheckoutFn === "function" ? submitShopCheckoutFn : null;
  const updateShopCheckoutField = typeof updateShopCheckoutFieldFn === "function"
    ? updateShopCheckoutFieldFn
    : (() => {});
  const saveTableQrConfig = typeof saveTableQrConfigFn === "function"
    ? saveTableQrConfigFn
    : null;
  const setDoc = typeof setDocFn === "function" ? setDocFn : null;
  const makeDocRef = typeof docFn === "function" ? docFn : null;
  const serverTimestamp = typeof serverTimestampFn === "function" ? serverTimestampFn : (() => null);
  const uploadCompressedImage = typeof uploadCompressedImageFn === "function" ? uploadCompressedImageFn : null;
  const focusCacheKey = typeof focusCacheKeyFn === "function" ? focusCacheKeyFn : (() => "");
  const saveFocusEnabled = typeof saveFocusEnabledFn === "function" ? saveFocusEnabledFn : null;
  const openFocusModal = typeof openFocusModalFn === "function" ? openFocusModalFn : (() => {});
  const deleteFocusItemById = typeof deleteFocusItemByIdFn === "function" ? deleteFocusItemByIdFn : null;
  const setFocusIndex = typeof setFocusIndexFn === "function" ? setFocusIndexFn : (() => {});
  const toggleProfilePostMenu = typeof toggleProfilePostMenuFn === "function" ? toggleProfilePostMenuFn : (() => {});
  const toggleProfilePostWidth = typeof toggleProfilePostWidthFn === "function" ? toggleProfilePostWidthFn : (() => {});
  const deleteProfilePost = typeof deleteProfilePostFn === "function" ? deleteProfilePostFn : (() => {});
  const setProfileMenuOpen = typeof setProfileMenuOpenFn === "function" ? setProfileMenuOpenFn : (() => {});
  const mapLocate = typeof mapLocateFn === "function" ? mapLocateFn : (() => {});
  const bindNotificationsDelegation = typeof bindNotificationsDelegationFn === "function"
    ? bindNotificationsDelegationFn
    : (() => {});
  let copyStatusTimer = 0;

  function scheduleCopyStatusReset() {
    const win = doc.defaultView;
    try {
      if (copyStatusTimer) {
        if (win && typeof win.clearTimeout === "function") win.clearTimeout(copyStatusTimer);
        else clearTimeout(copyStatusTimer);
      }
    } catch {}
    const clearStatus = () => {
      if (!state?.tableQr || typeof state.tableQr !== "object") return;
      if (String(state.tableQr.status || "").trim() !== "Link kopiert.") return;
      state.tableQr = {
        ...state.tableQr,
        status: ""
      };
      render();
    };
    try {
      if (win && typeof win.setTimeout === "function") {
        copyStatusTimer = win.setTimeout(clearStatus, 2200);
      } else {
        copyStatusTimer = setTimeout(clearStatus, 2200);
      }
    } catch {}
  }

  async function copyTextToClipboard(text = "") {
    const value = String(text || "").trim();
    if (!value) return false;
    const win = doc.defaultView;
    try {
      if (win?.navigator?.clipboard?.writeText) {
        await win.navigator.clipboard.writeText(value);
        return true;
      }
    } catch {}
    try {
      const textarea = doc.createElement("textarea");
      textarea.value = value;
      textarea.setAttribute("readonly", "true");
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      textarea.style.pointerEvents = "none";
      doc.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      textarea.setSelectionRange(0, textarea.value.length);
      const copied = typeof doc.execCommand === "function" ? doc.execCommand("copy") : false;
      textarea.remove();
      return !!copied;
    } catch {
      return false;
    }
  }

  const readHotelCardInput = (id = "") => {
    const node = doc.getElementById(id);
    return node ? String(node.value || "").trim() : "";
  };

  const isHotelCardChecked = (id = "") => {
    const node = doc.getElementById(id);
    return !!(node && node.checked === true);
  };

  function uniqueTextList(values = []) {
    const unique = [];
    (Array.isArray(values) ? values : []).forEach((value) => {
      const safeValue = String(value || "").trim();
      if (safeValue && !unique.includes(safeValue)) unique.push(safeValue);
    });
    return unique;
  }

  function getVisibleHotelCardRestaurantId() {
    const editorNode = doc.querySelector("[data-hotel-card-editor]");
    const editorRestaurantId = String(editorNode?.getAttribute("data-hotel-card-editor") || "").trim();
    return editorRestaurantId || String(state.userProfile?.restaurantId || "").trim();
  }

  function hasHotelCardEditorDraft(editor = {}) {
    if (!editor || typeof editor !== "object") return false;
    return Array.isArray(editor.existingImages)
      || Array.isArray(editor.imageFiles)
      || Array.isArray(editor.imagePreviews)
      || !!String(editor.imageUrlDraft || "").trim()
      || editor.saving === true
      || editor.detailsOpen === true
      || !!String(editor.status || "").trim();
  }

  function getHotelCardEditorStateForRestaurant(restaurantId = "") {
    const safeRestaurantId = String(restaurantId || getVisibleHotelCardRestaurantId() || "").trim();
    const current = state.hotelCardEditor && typeof state.hotelCardEditor === "object"
      ? state.hotelCardEditor
      : {};
    const currentRestaurantId = String(current.restaurantId || "").trim();
    if (safeRestaurantId && currentRestaurantId && currentRestaurantId !== safeRestaurantId) {
      return { restaurantId: safeRestaurantId };
    }
    if (safeRestaurantId && !currentRestaurantId && hasHotelCardEditorDraft(current)) {
      return { restaurantId: safeRestaurantId };
    }
    return {
      ...current,
      ...(safeRestaurantId ? { restaurantId: safeRestaurantId } : {})
    };
  }

  function readHotelCardExistingImagesFromDom(restaurantId = "") {
    const safeRestaurantId = String(restaurantId || getVisibleHotelCardRestaurantId() || "").trim();
    const images = [];
    doc.querySelectorAll("[data-hotel-card-existing-image]").forEach((node) => {
      const editorNode = typeof node.closest === "function" ? node.closest("[data-hotel-card-editor]") : null;
      const editorRestaurantId = String(editorNode?.getAttribute("data-hotel-card-editor") || "").trim();
      if (safeRestaurantId && editorRestaurantId && editorRestaurantId !== safeRestaurantId) return;
      const value = String(node.getAttribute("data-hotel-card-existing-image") || "").trim();
      if (value && !images.includes(value)) images.push(value);
    });
    return images;
  }

  function readHotelCardTextList(id = "") {
    const raw = readHotelCardInput(id);
    if (!raw) return [];
    return raw.split(/[\n,;|]/).map((entry) => entry.trim()).filter(Boolean);
  }

  function readHotelCardDistanceField(idPrefix = "", directLabel = "", suffix = "") {
    if (isHotelCardChecked(`${idPrefix}Direct`)) return directLabel;
    const amount = readHotelCardInput(`${idPrefix}Value`).replace(",", ".");
    const unitRaw = readHotelCardInput(`${idPrefix}Unit`).toLowerCase();
    const unit = unitRaw === "km" ? "km" : "m";
    if (!amount) return readHotelCardInput(idPrefix);
    return [amount, unit, suffix].filter(Boolean).join(" ");
  }

  function ensureHotelCardEditorState() {
    const restaurantId = getVisibleHotelCardRestaurantId();
    const current = getHotelCardEditorStateForRestaurant(restaurantId);
    state.hotelCardEditor = current;
    if (!Array.isArray(current.existingImages)) {
      current.existingImages = readHotelCardExistingImagesFromDom(restaurantId);
    }
    if (!Array.isArray(current.imageFiles)) current.imageFiles = [];
    if (!Array.isArray(current.imagePreviews)) current.imagePreviews = [];
    current.imageUrlDraft = String(current.imageUrlDraft || readHotelCardInput("hotelCardCoverImageUrl") || "").trim();
    if (restaurantId) current.restaurantId = restaurantId;
    return current;
  }

  function setHotelCardDetailsOpen(open = false) {
    const restaurantId = getVisibleHotelCardRestaurantId();
    const current = getHotelCardEditorStateForRestaurant(restaurantId);
    state.hotelCardEditor = {
      ...current,
      ...(restaurantId ? { restaurantId } : {}),
      detailsOpen: !!open,
      status: open ? "" : String(current.status || "")
    };
    doc.querySelectorAll("[data-hotel-card-details-panel]").forEach((panel) => {
      panel.classList.toggle("hidden", !open);
    });
    doc.querySelectorAll("[data-hotel-card-details-state]").forEach((node) => {
      node.textContent = open ? "Hapur" : "Hap detajet";
    });
    doc.querySelectorAll("[data-hotel-card-details-open]").forEach((btn) => {
      btn.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  function collectHotelCardIdentityIds(record = {}) {
    const ids = [];
    [
      record?.canonicalRestaurantId,
      record?.restaurantId,
      record?.id,
      record?.landingRestaurantId,
      record?.linkedRestaurantId,
      record?.businessId
    ].forEach((value) => {
      const safeValue = String(value || "").trim();
      if (safeValue && !ids.includes(safeValue)) ids.push(safeValue);
    });
    return ids;
  }

  function collectHotelCardTargetIds(record = {}) {
    const ids = [];
    [
      record?.canonicalRestaurantId,
      record?.restaurantId,
      record?.landingRestaurantId,
      record?.linkedRestaurantId,
      record?.businessId
    ].forEach((value) => {
      const safeValue = String(value || "").trim();
      if (safeValue && !ids.includes(safeValue)) ids.push(safeValue);
    });
    return ids;
  }

  function updateHotelCardRows(rows = [], targetIds = new Set(), payload = {}) {
    if (!Array.isArray(rows) || !rows.length) return { rows: [], seen: false };
    let seen = false;
    const nextRows = rows.map((row) => {
      const ids = collectHotelCardIdentityIds(row);
      const matches = ids.some((id) => targetIds.has(id));
      if (!matches) return row;
      seen = true;
      const primaryId = ids.find((id) => targetIds.has(id)) || Array.from(targetIds)[0] || "";
      return {
        ...row,
        ...payload,
        ...(primaryId && !String(row?.id || "").trim() ? { id: primaryId } : {}),
        ...(primaryId && !String(row?.restaurantId || "").trim() ? { restaurantId: primaryId } : {}),
        ...(primaryId && !String(row?.canonicalRestaurantId || "").trim() ? { canonicalRestaurantId: primaryId } : {})
      };
    });
    return { rows: nextRows, seen };
  }

  function updateHotelCardLocalState(restaurantId = "", payload = {}) {
    const safeRestaurantId = String(restaurantId || "").trim();
    if (!safeRestaurantId || !payload || typeof payload !== "object") return;
    const targetIds = new Set([
      safeRestaurantId,
      ...collectHotelCardTargetIds(state.userProfile)
    ].map((value) => String(value || "").trim()).filter(Boolean));
    const existing = Array.isArray(state.restaurants) ? state.restaurants : [];
    const restaurantUpdate = updateHotelCardRows(existing, targetIds, payload);
    state.restaurants = restaurantUpdate.rows;
    if (!restaurantUpdate.seen) {
      state.restaurants = [...state.restaurants, { ...payload, id: safeRestaurantId, restaurantId: safeRestaurantId }];
    }
    if (Array.isArray(state.bootstrapRestaurantPreview)) {
      state.bootstrapRestaurantPreview = updateHotelCardRows(state.bootstrapRestaurantPreview, targetIds, payload).rows;
    }
    if (collectHotelCardIdentityIds(state.userProfile).some((id) => targetIds.has(id))) {
      state.userProfile = {
        ...state.userProfile,
        ...payload,
        restaurantId: safeRestaurantId
      };
    }
    if (collectHotelCardIdentityIds(state.profileView?.profile).some((id) => targetIds.has(id))) {
      state.profileView = {
        ...state.profileView,
        profile: {
          ...state.profileView.profile,
          ...payload,
          restaurantId: safeRestaurantId
        }
      };
    }
  }

  async function saveHotelCardDetails() {
    const userRestaurantId = String(state.userProfile?.restaurantId || "").trim();
    const visibleRestaurantId = getVisibleHotelCardRestaurantId();
    const restaurantId = userRestaurantId || visibleRestaurantId;
    if (!restaurantId || !setDoc || !makeDocRef || !db) return;
    if (userRestaurantId && visibleRestaurantId && userRestaurantId !== visibleRestaurantId) {
      state.hotelCardEditor = {
        restaurantId: visibleRestaurantId,
        existingImages: readHotelCardExistingImagesFromDom(visibleRestaurantId),
        imageFiles: [],
        imagePreviews: [],
        imageUrlDraft: readHotelCardInput("hotelCardCoverImageUrl"),
        saving: false,
        detailsOpen: true,
        status: "Bitte Hotel-Editor neu laden."
      };
      render();
      return;
    }
    const editorState = ensureHotelCardEditorState();
    const urlDraft = readHotelCardInput("hotelCardCoverImageUrl");
    const existingImages = uniqueTextList(editorState.existingImages || readHotelCardExistingImagesFromDom(restaurantId));
    const filesFromState = Array.isArray(editorState.imageFiles) ? editorState.imageFiles : [];
    const filesFromInput = Array.from(doc.getElementById("hotelCardCoverImagesInput")?.files || []);
    const files = filesFromState.length ? filesFromState : filesFromInput;
    const imagePreviews = Array.isArray(editorState.imagePreviews) ? editorState.imagePreviews.slice() : [];
    const distanceCenter = readHotelCardDistanceField("hotelCardDistanceCenter", "Në qendër", "nga qendra");
    const distanceBeach = readHotelCardDistanceField("hotelCardDistanceBeach", "Në plazh", "nga plazhi");
    const distanceCenterDirect = isHotelCardChecked("hotelCardDistanceCenterDirect");
    const distanceBeachDirect = isHotelCardChecked("hotelCardDistanceBeachDirect");
    const startingPrice = readHotelCardInput("hotelCardStartingPrice").replace(/^\s*ab\s+/i, "").replace(/\s*(eur|€)\s*$/i, "").trim();
    const featureOne = readHotelCardInput("hotelCardFeatureOneText");
    const featureTwo = readHotelCardInput("hotelCardFeatureTwoText");
    const featureThree = readHotelCardInput("hotelCardFeatureThreeText");
    const customFeatures = readHotelCardTextList("hotelCardCustomFeaturesText");
    const featureList = uniqueTextList([featureOne, featureTwo, featureThree, ...customFeatures]);

    state.hotelCardEditor = {
      ...editorState,
      restaurantId,
      existingImages,
      imageFiles: files,
      imagePreviews,
      imageUrlDraft: urlDraft,
      saving: true,
      detailsOpen: true,
      status: "Po ruhet..."
    };
    render();

    try {
      if (files.length && !uploadCompressedImage) {
        throw new Error("Ngarkimi i fotos nuk eshte gati.");
      }
      const uploadedUrls = [];
      for (const file of files) {
        if (!file) continue;
        const uploaded = await uploadCompressedImage(file, restaurantId, {
          maxSize: 1080,
          quality: 0.8,
          mimeType: "image/jpeg"
        });
        const imageUrl = String(uploaded?.cdnUrl || uploaded?.url || "").trim();
        if (!imageUrl) {
          throw new Error("Ngarkimi nuk dha URL te fotos.");
        }
        if (imageUrl && !uploadedUrls.includes(imageUrl)) {
          uploadedUrls.push(imageUrl);
        }
      }
      const coverImages = uniqueTextList([
        ...uploadedUrls,
        urlDraft,
        ...existingImages
      ]);

      const titleImageUrl = coverImages[0] || "";
      const payload = {
        hotelCoverImages: coverImages,
        coverImages,
        titleImages: coverImages,
        titleImageUrl,
        coverImageUrl: titleImageUrl,
        coverUrl: titleImageUrl,
        heroUrl: titleImageUrl,
        distanceCenter,
        distanceToCenter: distanceCenter,
        centerDistance: distanceCenter,
        centerDistanceLabel: distanceCenter,
        zentrumEntfernung: distanceCenter,
        directCenter: distanceCenterDirect,
        inCenter: distanceCenterDirect,
        cityCenterDirect: distanceCenterDirect,
        distanceBeach,
        distanceToBeach: distanceBeach,
        beachDistance: distanceBeach,
        beachDistanceLabel: distanceBeach,
        strandEntfernung: distanceBeach,
        beachfront: distanceBeachDirect,
        onBeach: distanceBeachDirect,
        hotelStartingPrice: startingPrice,
        startingPrice,
        priceFrom: startingPrice,
        roomStartingPrice: startingPrice,
        hotelFeatureOneText: featureOne,
        hotelFeatureTwoText: featureTwo,
        hotelFeatureThreeText: featureThree,
        gardenTerraceText: featureOne,
        accessibilityText: featureTwo,
        veganOptionsText: featureThree,
        restaurantFeatures: {
          gardenTerrace: featureOne,
          accessibility: featureTwo,
          veganOptions: featureThree
        },
        features: featureList,
        updatedAt: serverTimestamp()
      };
      await setDoc(makeDocRef(db, "restaurants", restaurantId), payload, { merge: true });
      updateHotelCardLocalState(restaurantId, payload);
      state.hotelCardEditor = {
        restaurantId,
        existingImages: coverImages,
        imageFiles: [],
        imagePreviews: [],
        imageUrlDraft: "",
        saving: false,
        detailsOpen: false,
        status: "U ruajt."
      };
      render();
    } catch (err) {
      console.error(err);
      state.hotelCardEditor = {
        ...editorState,
        restaurantId,
        existingImages,
        imageFiles: files,
        imagePreviews,
        imageUrlDraft: urlDraft,
        saving: false,
        detailsOpen: true,
        status: err?.message || "Hotel Details nuk u ruajten."
      };
      render();
    }
  }

  doc.querySelectorAll("[data-hotel-card-details-open]").forEach((btn) => {
    btn.addEventListener("click", () => {
      setHotelCardDetailsOpen(true);
    });
  });

  doc.querySelectorAll("[data-hotel-card-details-close]").forEach((btn) => {
    btn.addEventListener("click", () => {
      setHotelCardDetailsOpen(false);
    });
  });

  const hotelCardCoverTrigger = doc.getElementById("hotelCardCoverImagesTrigger");
  const hotelCardCoverInput = doc.getElementById("hotelCardCoverImagesInput");
  if (hotelCardCoverTrigger && hotelCardCoverInput) {
    hotelCardCoverTrigger.addEventListener("click", () => {
      if (typeof hotelCardCoverInput.click === "function") hotelCardCoverInput.click();
    });
  }

  if (hotelCardCoverInput) {
    hotelCardCoverInput.addEventListener("change", () => {
      const files = Array.from(hotelCardCoverInput.files || []).filter((file) => file && String(file.type || "").startsWith("image/"));
      if (!files.length) return;
      const editorState = ensureHotelCardEditorState();
      const previews = files.map((file) => {
        try {
          return doc.defaultView?.URL?.createObjectURL
            ? doc.defaultView.URL.createObjectURL(file)
            : "";
        } catch {
          return "";
        }
      }).filter(Boolean);
      state.hotelCardEditor = {
        ...editorState,
        restaurantId: String(editorState.restaurantId || getVisibleHotelCardRestaurantId() || "").trim(),
        imageFiles: [
          ...(Array.isArray(editorState.imageFiles) ? editorState.imageFiles : []),
          ...files
        ],
        imagePreviews: [
          ...(Array.isArray(editorState.imagePreviews) ? editorState.imagePreviews : []),
          ...previews
        ],
        imageUrlDraft: readHotelCardInput("hotelCardCoverImageUrl"),
        status: ""
      };
      try {
        hotelCardCoverInput.value = "";
      } catch {}
      render();
    });
  }

  const hotelCardCoverUrlInput = doc.getElementById("hotelCardCoverImageUrl");
  if (hotelCardCoverUrlInput) {
    hotelCardCoverUrlInput.addEventListener("input", () => {
      const editorState = ensureHotelCardEditorState();
      state.hotelCardEditor = {
        ...editorState,
        restaurantId: String(editorState.restaurantId || getVisibleHotelCardRestaurantId() || "").trim(),
        imageUrlDraft: String(hotelCardCoverUrlInput.value || "").trim(),
        status: ""
      };
    });
  }

  doc.querySelectorAll("[data-hotel-card-image-remove]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const editorState = ensureHotelCardEditorState();
      const index = Number(btn.getAttribute("data-hotel-card-image-remove"));
      const source = String(btn.getAttribute("data-hotel-card-image-source") || "").trim();
      if (!Number.isFinite(index)) return;
      const existingImages = Array.isArray(editorState.existingImages) ? editorState.existingImages.slice() : [];
      const imageFiles = Array.isArray(editorState.imageFiles) ? editorState.imageFiles.slice() : [];
      const imagePreviews = Array.isArray(editorState.imagePreviews) ? editorState.imagePreviews.slice() : [];
      if (source === "existing") {
        existingImages.splice(index, 1);
      } else if (source === "new") {
        imageFiles.splice(index, 1);
        imagePreviews.splice(index, 1);
      }
      state.hotelCardEditor = {
        ...editorState,
        restaurantId: String(editorState.restaurantId || getVisibleHotelCardRestaurantId() || "").trim(),
        existingImages: uniqueTextList(existingImages),
        imageFiles,
        imagePreviews,
        imageUrlDraft: readHotelCardInput("hotelCardCoverImageUrl"),
        status: ""
      };
      render();
    });
  });

  const hotelCardSaveBtn = doc.getElementById("hotelCardSaveBtn");
  if (hotelCardSaveBtn) {
    hotelCardSaveBtn.addEventListener("click", () => {
      if (state.hotelCardEditor?.saving === true) return;
      void saveHotelCardDetails();
    });
  }

  const menuSearchInput = doc.getElementById("menuSearchInput");
  if (menuSearchInput) {
    menuSearchInput.addEventListener("input", () => {
      state.menu.query = menuSearchInput.value;
      render();
    });
  }

  doc.querySelectorAll("[data-menu-filter]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const filter = btn.dataset.menuFilter || "all";
      state.menu.filter = filter;
      render();
    });
  });

  doc.querySelectorAll("[data-menu-layout-color]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const color = btn.dataset.menuLayoutColor || "";
      if (!color) return;
      state.menuLayout = { ...state.menuLayout, cardColor: color };
      saveMenuLayoutToStorage();
      render();
    });
  });

  doc.querySelectorAll("[data-menu-add]").forEach((btn) => {
    btn.addEventListener("click", () => {
      openMenuModal("create");
    });
  });

  doc.querySelectorAll("[data-menu-add-food]").forEach((btn) => {
    btn.addEventListener("click", () => {
      openMenuModal("create", {
        type: "food",
        category: "Speisen",
        name: "",
        description: "",
        ingredients: "",
        crossSellItemIds: [],
        available: true,
        hidden: false,
        cardStyle: "testfirst_food"
      });
    });
  });

  doc.querySelectorAll("[data-menu-add-drink]").forEach((btn) => {
    btn.addEventListener("click", () => {
      openMenuModal("create", {
        type: "drink",
        category: "Getraenke",
        name: "",
        description: "",
        ingredients: "",
        crossSellItemIds: [],
        available: true,
        hidden: false,
        cardStyle: "testfirst_drink"
      });
    });
  });

  doc.querySelectorAll("[data-menu-add-special]").forEach((btn) => {
    btn.addEventListener("click", () => {
      openMenuModal("create", {
        type: "drink",
        category: "Special",
        name: "Special",
        description: "",
        crossSellItemIds: [],
        available: true,
        hidden: false,
        menuSection: "drink",
        cardStyle: "testfirst_special",
        specialSize: "default",
        specialActionType: "self",
        specialActionUrl: "",
        specialActionProductId: ""
      });
    });
  });

  doc.querySelectorAll("[data-menu-edit]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const itemId = btn.dataset.menuEdit || "";
      const item = (state.menu.items || []).find((it) => String(it.id) === String(itemId));
      if (!item) return;
      openMenuModal("edit", item);
    });
  });

  doc.querySelectorAll("[data-menu-delete]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const itemId = btn.dataset.menuDelete || "";
      if (!itemId || !deleteMenuItemById) return;
      void deleteMenuItemById(itemId);
    });
  });

  function shouldSkipMenuOpenFromGalleryDrag(target) {
    if (!(target instanceof Element)) return false;
    const track = target.closest("[data-menu-card-gallery-track]");
    if (!track) return false;
    const draggedAt = Number(track.dataset.menuCardGalleryDragAt || "0");
    return draggedAt > 0 && Date.now() - draggedAt < 550;
  }

  function updateMenuGalleryDots(track) {
    const galleryId = track.dataset.menuCardGalleryTrack || "";
    if (!galleryId) return;
    const width = track.clientWidth || 1;
    const slides = track.querySelectorAll("[data-menu-card-gallery-slide]");
    const index = Math.max(0, Math.min(Math.max(slides.length - 1, 0), Math.round(track.scrollLeft / width)));
    slides.forEach((slide, slideIndex) => {
      if (!(slide instanceof Element)) return;
      if (Math.abs(slideIndex - index) > 1) return;
      const deferredImage = slide.querySelector("img[data-menu-card-deferred-src]");
      if (!(deferredImage instanceof HTMLImageElement)) return;
      const deferredSrc = String(deferredImage.getAttribute("data-menu-card-deferred-src") || "").trim();
      if (!deferredSrc) return;
      const deferredFallback = String(deferredImage.getAttribute("data-menu-card-deferred-fallback") || "").trim();
      const deferredSrcset = String(deferredImage.getAttribute("data-menu-card-deferred-srcset") || "").trim();
      const deferredSizes = String(deferredImage.getAttribute("data-menu-card-deferred-sizes") || "").trim();
      if (deferredSrcset) deferredImage.setAttribute("srcset", deferredSrcset);
      if (deferredSizes) deferredImage.setAttribute("sizes", deferredSizes);
      deferredImage.setAttribute("src", deferredSrc);
      if (deferredFallback) deferredImage.setAttribute("data-fallback-src", deferredFallback);
      deferredImage.removeAttribute("data-menu-card-deferred-src");
      deferredImage.removeAttribute("data-menu-card-deferred-fallback");
      deferredImage.removeAttribute("data-menu-card-deferred-srcset");
      deferredImage.removeAttribute("data-menu-card-deferred-sizes");
    });
    doc.querySelectorAll(`[data-menu-card-gallery-dot="${galleryId}"]`).forEach((dot, dotIndex) => {
      dot.className = dotIndex === index
        ? "w-4 h-1.5 bg-white rounded-full shadow-sm"
        : "w-1.5 h-1.5 bg-white/60 rounded-full shadow-sm";
    });
  }

  doc.querySelectorAll("[data-menu-card-gallery-track]").forEach((track) => {
    let startX = 0;
    let startY = 0;
    let moved = false;
    let dragging = false;
    let lastScrollLeft = Number(track.scrollLeft || 0);
    const begin = (x, y) => {
      startX = Number(x) || 0;
      startY = Number(y) || 0;
      moved = false;
      dragging = false;
      track.dataset.menuCardGalleryDragAt = "0";
    };
    const move = (x, y) => {
      const dx = Math.abs((Number(x) || 0) - startX);
      const dy = Math.abs((Number(y) || 0) - startY);
      if (dx > 8 || dy > 8) moved = true;
      if (dx > 10 && dx > dy) dragging = true;
    };
    const end = () => {
      if (moved || dragging) {
        track.dataset.menuCardGalleryDragAt = String(Date.now());
      }
      moved = false;
      dragging = false;
    };
    track.addEventListener("pointerdown", (evt) => begin(evt.clientX, evt.clientY));
    track.addEventListener("pointermove", (evt) => move(evt.clientX, evt.clientY));
    track.addEventListener("pointerup", end);
    track.addEventListener("pointercancel", end);
    track.addEventListener("touchstart", (evt) => {
      const touch = evt.touches?.[0];
      if (!touch) return;
      begin(touch.clientX, touch.clientY);
    }, { passive: true });
    track.addEventListener("touchmove", (evt) => {
      const touch = evt.touches?.[0];
      if (!touch) return;
      move(touch.clientX, touch.clientY);
    }, { passive: true });
    track.addEventListener("touchend", end, { passive: true });
    track.addEventListener("touchcancel", end, { passive: true });
    track.addEventListener("scroll", () => {
      const currentScrollLeft = Number(track.scrollLeft || 0);
      if (Math.abs(currentScrollLeft - lastScrollLeft) > 0.5) {
        track.dataset.menuCardGalleryDragAt = String(Date.now());
        lastScrollLeft = currentScrollLeft;
      }
      updateMenuGalleryDots(track);
    }, { passive: true });
    updateMenuGalleryDots(track);
  });

  function toggleMenuItemLikeFromCard(btn) {
    const handler = doc.defaultView?.__MENYRA_TOGGLE_MENU_ITEM_LIKE_FROM_CARD__;
    if (typeof handler !== "function") return;
    const itemId = btn.dataset.menuCardLike || btn.closest("[data-menu-open]")?.dataset.menuOpen || "";
    if (!itemId) return;
    const restaurantId = btn.closest("[data-menu-open]")?.dataset.menuOpenRestaurant
      || state.menu.restaurantId
      || state.profileView?.profile?.restaurantId
      || state.userProfile.restaurantId
      || "";
    void handler(itemId, restaurantId);
  }

  doc.querySelectorAll("[data-menu-card-like]").forEach((btn) => {
    btn.addEventListener("click", (evt) => {
      evt.preventDefault();
      evt.stopPropagation();
      toggleMenuItemLikeFromCard(btn);
    });
  });

  function openSpecialCardLink(linkValue) {
    const win = doc.defaultView;
    if (!win) return;
    const raw = String(linkValue || "").trim();
    if (!raw) return;
    const url = /^(https?:\/\/|mailto:|tel:)/i.test(raw) ? raw : `https://${raw.replace(/^\/+/, "")}`;
    try {
      win.open(url, "_blank", "noopener,noreferrer");
    } catch {
      try {
        win.location.assign(url);
      } catch {}
    }
  }

  doc.querySelectorAll("[data-menu-special-link]").forEach((btn) => {
    btn.addEventListener("click", (evt) => {
      if (shouldSkipMenuOpenFromGalleryDrag(evt.target)) return;
      evt.preventDefault();
      evt.stopPropagation();
      openSpecialCardLink(btn.dataset.menuSpecialLink || "");
    });
    btn.addEventListener("keydown", (evt) => {
      if (evt.key !== "Enter" && evt.key !== " ") return;
      evt.preventDefault();
      openSpecialCardLink(btn.dataset.menuSpecialLink || "");
    });
  });

  async function reorderMenuItemsFromAdmin(sourceId, targetId) {
    const handler = doc.defaultView?.__MENYRA_REORDER_MENU_ITEM_FROM_ADMIN__;
    if (typeof handler !== "function") return;
    const from = String(sourceId || "").trim();
    const to = String(targetId || "").trim();
    if (!from || !to || from === to) return;
    await handler(from, to);
  }

  const orderRows = Array.from(doc.querySelectorAll("[data-menu-order-item]"));
  if (orderRows.length) {
    let draggingId = "";
    let touchDraggingId = "";
    let touchHoverId = "";
    let touchDragActive = false;
    let touchStartX = 0;
    let touchStartY = 0;
    let touchDragTimer = 0;
    const activeDragClass = ["ring-2", "ring-indigo-300", "bg-indigo-50/50"];
    const clearTouchDragTimer = () => {
      if (!touchDragTimer) return;
      try {
        const win = doc.defaultView;
        if (win && typeof win.clearTimeout === "function") {
          win.clearTimeout(touchDragTimer);
        } else {
          clearTimeout(touchDragTimer);
        }
      } catch {}
      touchDragTimer = 0;
    };
    const clearDragMarkers = () => {
      orderRows.forEach((row) => row.classList.remove(...activeDragClass));
    };
    const clearTouchDragState = () => {
      clearTouchDragTimer();
      orderRows.forEach((row) => row.classList.remove("opacity-60"));
      touchDraggingId = "";
      touchHoverId = "";
      touchDragActive = false;
      touchStartX = 0;
      touchStartY = 0;
      clearDragMarkers();
    };
    const findOrderRowAtPoint = (x, y) => {
      if (typeof doc.elementFromPoint !== "function") return null;
      const node = doc.elementFromPoint(Number(x) || 0, Number(y) || 0);
      if (!(node instanceof Element)) return null;
      return node.closest("[data-menu-order-item]");
    };
    orderRows.forEach((row) => {
      const rowId = String(row.dataset.menuOrderItem || "").trim();
      const rowDraggable = String(row.dataset.menuOrderDraggable || "").trim().toLowerCase() === "true";
      if (!rowId) return;
      row.addEventListener("dragstart", (evt) => {
        if (!rowDraggable) {
          evt.preventDefault();
          return;
        }
        draggingId = rowId;
        row.classList.add("opacity-60");
        if (evt.dataTransfer) {
          evt.dataTransfer.effectAllowed = "move";
          evt.dataTransfer.setData("text/plain", rowId);
        }
      });
      row.addEventListener("dragend", () => {
        draggingId = "";
        row.classList.remove("opacity-60");
        clearDragMarkers();
      });
      row.addEventListener("dragover", (evt) => {
        evt.preventDefault();
        if (!draggingId || draggingId === rowId) return;
        clearDragMarkers();
        row.classList.add(...activeDragClass);
      });
      row.addEventListener("dragleave", () => {
        row.classList.remove(...activeDragClass);
      });
      row.addEventListener("drop", (evt) => {
        evt.preventDefault();
        const from = String(draggingId || evt.dataTransfer?.getData("text/plain") || "").trim();
        const to = rowId;
        clearDragMarkers();
        if (!from || !to || from === to) return;
        void reorderMenuItemsFromAdmin(from, to);
      });
      row.addEventListener("touchstart", (evt) => {
        if (!rowDraggable) return;
        const touch = evt.touches?.[0];
        if (!touch) return;
        clearTouchDragState();
        touchDraggingId = rowId;
        touchStartX = Number(touch.clientX) || 0;
        touchStartY = Number(touch.clientY) || 0;
        const win = doc.defaultView;
        const setTimer = win && typeof win.setTimeout === "function" ? win.setTimeout.bind(win) : setTimeout;
        touchDragTimer = setTimer(() => {
          touchDragActive = true;
          row.classList.add("opacity-60");
        }, 220);
      }, { passive: true });
      row.addEventListener("touchmove", (evt) => {
        const touch = evt.touches?.[0];
        if (!touch || !touchDraggingId) return;
        const dx = Math.abs((Number(touch.clientX) || 0) - touchStartX);
        const dy = Math.abs((Number(touch.clientY) || 0) - touchStartY);
        if (!touchDragActive) {
          if (dx > 10 || dy > 10) {
            clearTouchDragState();
          }
          return;
        }
        evt.preventDefault();
        const hoverRow = findOrderRowAtPoint(touch.clientX, touch.clientY);
        const hoverId = String(hoverRow?.dataset?.menuOrderItem || "").trim();
        clearDragMarkers();
        if (!hoverId || hoverId === touchDraggingId) {
          touchHoverId = "";
          return;
        }
        touchHoverId = hoverId;
        hoverRow.classList.add(...activeDragClass);
      }, { passive: false });
      row.addEventListener("touchend", (evt) => {
        if (!touchDraggingId) return;
        const touch = evt.changedTouches?.[0];
        const from = String(touchDraggingId || "").trim();
        let to = String(touchHoverId || "").trim();
        if (!to && touch) {
          const hoverRow = findOrderRowAtPoint(touch.clientX, touch.clientY);
          to = String(hoverRow?.dataset?.menuOrderItem || "").trim();
        }
        const canReorder = touchDragActive && from && to && from !== to;
        clearTouchDragState();
        if (!canReorder) return;
        void reorderMenuItemsFromAdmin(from, to);
      }, { passive: true });
      row.addEventListener("touchcancel", () => {
        clearTouchDragState();
      }, { passive: true });
    });
  }

  doc.querySelectorAll("[data-menu-open]").forEach((btn) => {
    btn.addEventListener("click", (evt) => {
      if (shouldSkipMenuOpenFromGalleryDrag(evt.target)) return;
      triggerMenuDetailOpenFromGesture(btn);
    });
    btn.addEventListener("keydown", (evt) => {
      if (evt.key !== "Enter" && evt.key !== " ") return;
      evt.preventDefault();
      triggerMenuDetailOpenFromGesture(btn);
    });
  });

  doc.querySelectorAll("[data-cart-qty]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const itemId = btn.dataset.cartQty || "";
      const delta = Number(btn.dataset.cartDelta || "0");
      if (!itemId || !delta) return;
      updateShopCartQuantity(itemId, delta);
    });
  });

  doc.querySelectorAll("[data-cart-checkout]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const action = btn.dataset.cartCheckout || "";
      if (action === "open") {
        openShopCheckout();
        return;
      }
      if (action === "submit" && submitShopCheckout) {
        void submitShopCheckout();
      }
    });
  });

  doc.querySelectorAll("[data-cart-item-comment]").forEach((input) => {
    input.addEventListener("input", () => {
      updateShopCartItemComment(input.dataset.cartItemComment || "", input.value || "");
    });
  });

  doc.querySelectorAll("[data-cart-field]").forEach((input) => {
    input.addEventListener("input", () => {
      updateShopCheckoutField(input.dataset.cartField || "", input.value || "");
    });
  });

  const tableQrCountInput = doc.getElementById("tableQrCountInput");
  const tableQrEnabledToggle = doc.getElementById("tableQrEnabledToggle");
  const submitTableQrConfig = () => {
    const restaurantId = String(state.userProfile?.restaurantId || state.profileView?.profile?.restaurantId || "").trim();
    if (!restaurantId || !saveTableQrConfig) return;
    const count = Number(tableQrCountInput?.value || "0");
    const enabled = !!tableQrEnabledToggle?.checked;
    void saveTableQrConfig(restaurantId, { count, enabled });
  };
  if (tableQrCountInput) {
    tableQrCountInput.addEventListener("keydown", (evt) => {
      if (evt.key !== "Enter") return;
      evt.preventDefault();
      submitTableQrConfig();
    });
  }
  if (tableQrEnabledToggle) {
    tableQrEnabledToggle.addEventListener("change", () => {
      submitTableQrConfig();
    });
  }
  doc.querySelectorAll("[data-table-qr-save]").forEach((btn) => {
    btn.addEventListener("click", () => {
      submitTableQrConfig();
    });
  });

  doc.querySelectorAll("[data-copy-url]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const url = btn.dataset.copyUrl || "";
      const label = String(btn.dataset.copyLabel || "Link").trim();
      const copied = await copyTextToClipboard(url);
      if (!state.tableQr || typeof state.tableQr !== "object") {
        state.tableQr = { status: "", error: "" };
      }
      state.tableQr = {
        ...state.tableQr,
        error: copied ? "" : `Link fuer ${label} konnte nicht kopiert werden.`,
        status: copied ? "Link kopiert." : ""
      };
      render();
      if (copied) {
        scheduleCopyStatusReset();
      }
    });
  });

  const focusEnabledToggle = doc.getElementById("focusEnabledToggle");
  if (focusEnabledToggle) {
    focusEnabledToggle.addEventListener("change", () => {
      const restaurantId = state.userProfile.restaurantId || "";
      if (!restaurantId) return;
      const enabled = !!focusEnabledToggle.checked;
      state.focus.enabled = enabled;
      const cachedItems = state.focus.restaurantId === restaurantId ? (state.focus.items || []) : [];
      focusCache?.set?.(focusCacheKey(restaurantId), { items: cachedItems, enabled, ts: Date.now() });
      if (saveFocusEnabled) void saveFocusEnabled(restaurantId, enabled);
      render();
    });
  }

  doc.querySelectorAll("[data-focus-add]").forEach((btn) => {
    btn.addEventListener("click", () => {
      openFocusModal("create");
    });
  });

  doc.querySelectorAll("[data-focus-edit]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const itemId = btn.dataset.focusEdit || "";
      const item = (state.focus.items || []).find((it) => String(it.id) === String(itemId));
      if (!item) return;
      openFocusModal("edit", item);
    });
  });

  doc.querySelectorAll("[data-focus-delete]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const itemId = btn.dataset.focusDelete || "";
      if (!itemId || !deleteFocusItemById) return;
      void deleteFocusItemById(itemId);
    });
  });

  doc.querySelectorAll("[data-focus-nav]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const dir = btn.dataset.focusNav || "next";
      const delta = dir === "prev" ? -1 : 1;
      setFocusIndex(state.focus.index + delta);
    });
  });

  doc.querySelectorAll("[data-focus-dot]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const idx = Number(btn.dataset.focusDot || "0");
      setFocusIndex(idx);
    });
  });

  doc.querySelectorAll("[data-profile-menu-button]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const postId = btn.dataset.profileMenuButton;
      if (!postId) return;
      toggleProfilePostMenu(postId);
    });
  });

  doc.querySelectorAll("[data-profile-post-toggle]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const postId = btn.dataset.profilePostToggle;
      if (!postId) return;
      toggleProfilePostWidth(postId);
    });
  });

  doc.querySelectorAll("[data-profile-post-delete]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const postId = btn.dataset.profilePostDelete;
      if (!postId) return;
      deleteProfilePost(postId);
    });
  });

  let nextProfileMenuBound = !!profileMenuBound;
  if (!nextProfileMenuBound) {
    doc.addEventListener("click", (e) => {
      if (!state.profilePostMenuId) return;
      const target = e.target;
      if (!(target instanceof Element)) return;
      if (target.closest("[data-profile-menu]") || target.closest("[data-profile-menu-button]")) return;
      state.profilePostMenuId = null;
      setProfileMenuOpen(null);
    });
    nextProfileMenuBound = true;
  }

  if (state.profilePostMenuId) {
    setProfileMenuOpen(state.profilePostMenuId);
  }

  const mapLocateBtn = doc.getElementById("mapLocateBtn");
  if (mapLocateBtn) {
    mapLocateBtn.addEventListener("click", () => mapLocate());
  }

  bindNotificationsDelegation();

  return { profileMenuBound: nextProfileMenuBound };
}
