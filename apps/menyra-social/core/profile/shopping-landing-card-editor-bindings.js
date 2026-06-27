function readInput(documentObj, id = "") {
  const node = documentObj?.getElementById?.(id);
  return node ? String(node.value || "").trim() : "";
}

function getVisibleRestaurantId(documentObj, state) {
  const editorNode = documentObj?.querySelector?.("[data-shopping-landing-card-editor]");
  const editorRestaurantId = String(editorNode?.getAttribute("data-shopping-landing-card-editor") || "").trim();
  return editorRestaurantId || String(state?.userProfile?.restaurantId || "").trim();
}

function getEditorState(state, restaurantId = "") {
  const safeRestaurantId = String(restaurantId || "").trim();
  const current = state?.shoppingLandingCardEditor && typeof state.shoppingLandingCardEditor === "object"
    ? state.shoppingLandingCardEditor
    : {};
  const currentRestaurantId = String(current.restaurantId || "").trim();
  if (safeRestaurantId && currentRestaurantId && currentRestaurantId !== safeRestaurantId) {
    return { restaurantId: safeRestaurantId };
  }
  return {
    ...current,
    ...(safeRestaurantId ? { restaurantId: safeRestaurantId } : {})
  };
}

function collectProductIdsFromDom(documentObj) {
  const ids = [];
  documentObj?.querySelectorAll?.("[data-shopping-landing-product]").forEach((node) => {
    if (!node.checked) return;
    const id = String(node.getAttribute("data-shopping-landing-product") || "").trim();
    if (id && !ids.includes(id)) ids.push(id);
  });
  return ids;
}

function getItemImage(item = {}) {
  const candidates = [
    ...(Array.isArray(item.imageUrls) ? item.imageUrls : []),
    ...(Array.isArray(item.images) ? item.images : []),
    item.imageUrl,
    item.image,
    item.photoUrl,
    item.coverUrl,
    item.img,
    item.thumbnail
  ].map((entry) => String(entry || "").trim()).filter(Boolean);
  return candidates[0] || "";
}

function formatItemPrice(item = {}) {
  const explicit = String(item.priceLabel || item.displayPrice || item.formattedPrice || "").trim();
  if (explicit) return explicit;
  const value = Number(item.price ?? item.amount ?? 0);
  if (!Number.isFinite(value) || value <= 0) return "";
  const currency = String(item.currency || item.currencyCode || "€").trim();
  const normalized = value % 1 === 0 ? String(value) : value.toFixed(2).replace(".", ",");
  return currency === "EUR" || currency === "€" ? `${normalized} €` : `${normalized} ${currency}`;
}

function buildProductSnapshot(item = {}, restaurantId = "") {
  const id = String(item.id || item.productId || item.menuItemId || "").trim();
  if (!id) return null;
  const imageUrl = getItemImage(item);
  const name = String(item.name || item.title || "Produkt").trim();
  return {
    id,
    restaurantId,
    name,
    title: name,
    description: String(item.description || item.text || "").trim(),
    category: String(item.category || "").trim(),
    price: item.price ?? "",
    priceLabel: formatItemPrice(item),
    currency: String(item.currency || item.currencyCode || "").trim(),
    imageUrl,
    imageUrls: imageUrl ? [imageUrl] : [],
    type: String(item.type || "food").trim() || "food",
    catalogMode: "shop",
    restaurantType: "ecommerce",
    customerType: "ecommerce",
    available: item.available !== false,
    hidden: item.hidden === true
  };
}

function buildProductSnapshots(state, restaurantId = "", selectedIds = []) {
  const menuItems = Array.isArray(state?.menu?.items) ? state.menu.items : [];
  const selected = new Set((Array.isArray(selectedIds) ? selectedIds : []).map((id) => String(id || "").trim()).filter(Boolean));
  const candidates = selected.size
    ? menuItems.filter((item) => selected.has(String(item?.id || "").trim()))
    : menuItems.filter((item) => item && item.hidden !== true && item.available !== false);
  const snapshots = [];
  candidates.forEach((item) => {
    const snapshot = buildProductSnapshot(item, restaurantId);
    if (!snapshot?.id || snapshots.some((entry) => entry.id === snapshot.id)) return;
    snapshots.push(snapshot);
  });
  return snapshots.slice(0, 8);
}

function collectIdentityIds(record = {}) {
  const ids = [];
  [
    record?.canonicalRestaurantId,
    record?.restaurantId,
    record?.id,
    record?.landingRestaurantId,
    record?.linkedRestaurantId,
    record?.businessId
  ].forEach((value) => {
    const id = String(value || "").trim();
    if (id && !ids.includes(id)) ids.push(id);
  });
  return ids;
}

function updateRows(rows = [], targetIds = new Set(), payload = {}) {
  if (!Array.isArray(rows) || !rows.length) return { rows: [], seen: false };
  let seen = false;
  const nextRows = rows.map((row) => {
    const ids = collectIdentityIds(row);
    if (!ids.some((id) => targetIds.has(id))) return row;
    seen = true;
    return {
      ...row,
      ...payload
    };
  });
  return { rows: nextRows, seen };
}

function updateLocalState(state, restaurantId = "", payload = {}) {
  const safeRestaurantId = String(restaurantId || "").trim();
  if (!safeRestaurantId || !payload || typeof payload !== "object") return;
  const targetIds = new Set([
    safeRestaurantId,
    ...collectIdentityIds(state?.userProfile)
  ].map((value) => String(value || "").trim()).filter(Boolean));
  const restaurantUpdate = updateRows(state.restaurants || [], targetIds, payload);
  state.restaurants = restaurantUpdate.rows;
  if (!restaurantUpdate.seen) {
    state.restaurants = [
      ...(Array.isArray(state.restaurants) ? state.restaurants : []),
      { ...payload, id: safeRestaurantId, restaurantId: safeRestaurantId }
    ];
  }
  if (Array.isArray(state.bootstrapRestaurantPreview)) {
    state.bootstrapRestaurantPreview = updateRows(state.bootstrapRestaurantPreview, targetIds, payload).rows;
  }
  if (collectIdentityIds(state.userProfile).some((id) => targetIds.has(id))) {
    state.userProfile = {
      ...state.userProfile,
      ...payload,
      restaurantId: safeRestaurantId
    };
  }
  if (collectIdentityIds(state.profileView?.profile).some((id) => targetIds.has(id))) {
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

function buildEditorPatch(documentObj, state, restaurantId = "", overrides = {}) {
  return {
    ...getEditorState(state, restaurantId),
    restaurantId,
    titleDraft: readInput(documentObj, "shoppingLandingTitleInput"),
    productIds: collectProductIdsFromDom(documentObj),
    imageUrlDraft: readInput(documentObj, "shoppingLandingImageUrl"),
    active: documentObj.getElementById("shoppingLandingActiveToggle")?.checked !== false,
    status: "",
    ...overrides
  };
}

export function bindShoppingLandingCardEditorEvents({
  documentObj,
  state,
  renderFn,
  setDocFn,
  docFn,
  db,
  serverTimestampFn,
  uploadCompressedImageFn
} = {}) {
  const doc = documentObj || null;
  if (!doc || !state) return;
  const root = doc.querySelector("[data-shopping-landing-card-editor]");
  if (!root) return;
  if (root.dataset.shoppingLandingEditorBound === "1") return;
  root.dataset.shoppingLandingEditorBound = "1";

  const render = typeof renderFn === "function" ? renderFn : (() => {});
  const setDoc = typeof setDocFn === "function" ? setDocFn : null;
  const makeDocRef = typeof docFn === "function" ? docFn : null;
  const serverTimestamp = typeof serverTimestampFn === "function" ? serverTimestampFn : (() => null);
  const uploadCompressedImage = typeof uploadCompressedImageFn === "function" ? uploadCompressedImageFn : null;

  const getVisibleId = () => getVisibleRestaurantId(doc, state);
  const getState = (restaurantId = "") => getEditorState(state, restaurantId || getVisibleId());

  async function saveShoppingLandingCard() {
    const userRestaurantId = String(state.userProfile?.restaurantId || "").trim();
    const visibleRestaurantId = getVisibleId();
    const restaurantId = userRestaurantId || visibleRestaurantId;
    if (!restaurantId || !setDoc || !makeDocRef || !db) return;
    const editorState = getState(restaurantId);
    const title = readInput(doc, "shoppingLandingTitleInput");
    const selectedProductIds = collectProductIdsFromDom(doc);
    const active = doc.getElementById("shoppingLandingActiveToggle")?.checked !== false;
    const urlDraft = readInput(doc, "shoppingLandingImageUrl");
    const file = doc.getElementById("shoppingLandingImageInput")?.files?.[0] || editorState.imageFile || null;
    state.shoppingLandingCardEditor = {
      ...editorState,
      restaurantId,
      titleDraft: title,
      productIds: selectedProductIds,
      active,
      imageUrlDraft: urlDraft,
      imageFile: file,
      saving: true,
      status: "Wird gespeichert..."
    };
    render();

    try {
      let imageUrl = urlDraft || "";
      if (file) {
        if (!uploadCompressedImage) throw new Error("Bild-Upload ist nicht bereit.");
        const uploaded = await uploadCompressedImage(file, restaurantId, {
          maxSize: 1080,
          quality: 0.8,
          mimeType: "image/jpeg"
        });
        imageUrl = String(uploaded?.cdnUrl || uploaded?.url || imageUrl || "").trim();
      }
      const products = buildProductSnapshots(state, restaurantId, selectedProductIds);
      const landingCard = {
        active,
        title,
        imageUrl,
        productIds: selectedProductIds,
        products
      };
      const payload = {
        shoppingLandingCard: landingCard,
        shoppingLandingCardEnabled: active,
        shoppingLandingCardTitle: title,
        shoppingLandingCardImageUrl: imageUrl,
        shoppingLandingCardProductIds: selectedProductIds,
        shoppingLandingProducts: products,
        shoppingLandingProductsCount: products.length,
        shoppingLandingUpdatedAt: serverTimestamp()
      };
      await setDoc(makeDocRef(db, "restaurants", restaurantId), payload, { merge: true });
      updateLocalState(state, restaurantId, payload);
      state.shoppingLandingCardEditor = {
        restaurantId,
        titleDraft: title,
        productIds: selectedProductIds,
        active,
        imageUrlDraft: imageUrl,
        imageFile: null,
        imagePreview: "",
        saving: false,
        status: "Landing Card gespeichert."
      };
      render();
    } catch (err) {
      console.error(err);
      state.shoppingLandingCardEditor = {
        ...editorState,
        restaurantId,
        titleDraft: title,
        productIds: selectedProductIds,
        active,
        imageUrlDraft: urlDraft,
        imageFile: file,
        saving: false,
        status: err?.message || "Landing Card konnte nicht gespeichert werden."
      };
      render();
    }
  }

  const imageTrigger = doc.getElementById("shoppingLandingImageTrigger");
  const imageInput = doc.getElementById("shoppingLandingImageInput");
  if (imageTrigger && imageInput) {
    imageTrigger.addEventListener("click", () => {
      if (typeof imageInput.click === "function") imageInput.click();
    });
  }

  if (imageInput) {
    imageInput.addEventListener("change", () => {
      const file = Array.from(imageInput.files || []).find((entry) => entry && String(entry.type || "").startsWith("image/"));
      if (!file) return;
      const restaurantId = getVisibleId();
      let preview = "";
      try {
        preview = doc.defaultView?.URL?.createObjectURL
          ? doc.defaultView.URL.createObjectURL(file)
          : "";
      } catch {}
      state.shoppingLandingCardEditor = buildEditorPatch(doc, state, restaurantId, {
        imageFile: file,
        imagePreview: preview
      });
      render();
    });
  }

  const titleInput = doc.getElementById("shoppingLandingTitleInput");
  if (titleInput) {
    titleInput.addEventListener("input", () => {
      const restaurantId = getVisibleId();
      state.shoppingLandingCardEditor = buildEditorPatch(doc, state, restaurantId, {
        titleDraft: titleInput.value || ""
      });
    });
  }

  doc.querySelectorAll("[data-shopping-landing-product]").forEach((input) => {
    input.addEventListener("change", () => {
      const restaurantId = getVisibleId();
      state.shoppingLandingCardEditor = buildEditorPatch(doc, state, restaurantId);
      render();
    });
  });

  const activeToggle = doc.getElementById("shoppingLandingActiveToggle");
  if (activeToggle) {
    activeToggle.addEventListener("change", () => {
      const restaurantId = getVisibleId();
      state.shoppingLandingCardEditor = buildEditorPatch(doc, state, restaurantId, {
        active: activeToggle.checked !== false
      });
    });
  }

  const saveBtn = doc.getElementById("shoppingLandingSaveBtn");
  if (saveBtn) {
    saveBtn.addEventListener("click", () => {
      if (state.shoppingLandingCardEditor?.saving === true) return;
      void saveShoppingLandingCard();
    });
  }
}
