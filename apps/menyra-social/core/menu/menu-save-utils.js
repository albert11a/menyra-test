import { isTestfirstMenuProfileTypeCore, normalizeMenuCardStyleCore } from "./menu-card-style-utils.js";

export async function saveMenuItemFromModalCore({
  state,
  documentObj,
  isShopCatalogProfile,
  getBusinessProfileType,
  renderOverlays,
  normalizeOptionList,
  getMenuModalCrop,
  uploadCompressedImage,
  doc,
  collection,
  db,
  normalizeMenuType,
  serverTimestamp,
  setDoc,
  normalizeMenuItemDoc,
  syncMenuCaches,
  publishMenuToPublic,
  closeMenuModal,
  render
} = {}) {
  if (
    !state
    || !state.user
    || !documentObj
    || typeof isShopCatalogProfile !== "function"
    || typeof getBusinessProfileType !== "function"
    || typeof renderOverlays !== "function"
    || typeof normalizeOptionList !== "function"
    || typeof getMenuModalCrop !== "function"
    || typeof uploadCompressedImage !== "function"
    || typeof doc !== "function"
    || typeof collection !== "function"
    || !db
    || typeof normalizeMenuType !== "function"
    || typeof serverTimestamp !== "function"
    || typeof setDoc !== "function"
    || typeof normalizeMenuItemDoc !== "function"
    || typeof syncMenuCaches !== "function"
    || typeof publishMenuToPublic !== "function"
    || typeof closeMenuModal !== "function"
    || typeof render !== "function"
  ) {
    return;
  }

  const restaurantId = state.userProfile.restaurantId || "";
  const isShop = isShopCatalogProfile(state.userProfile);
  const businessType = String(getBusinessProfileType(state.userProfile) || "").trim().toLowerCase();
  const canPersistCardStyle = !isShop && isTestfirstMenuProfileTypeCore(businessType);
  if (!restaurantId) {
    state.menuModal.status = "Kein Restaurant ausgewaehlt.";
    renderOverlays({ updateMenu: true });
    return;
  }
  const name = documentObj.getElementById("menuItemName")?.value?.trim() || "";
  const price = documentObj.getElementById("menuItemPrice")?.value?.trim() || "";
  const category = documentObj.getElementById("menuItemCategory")?.value?.trim() || "";
  const type = documentObj.getElementById("menuItemType")?.value || "food";
  const normalizedType = normalizeMenuType(type);
  const description = documentObj.getElementById("menuItemDesc")?.value?.trim() || "";
  const longDescription = documentObj.getElementById("menuItemLongDesc")?.value?.trim() || "";
  const allergens = documentObj.getElementById("menuItemAllergens")?.value?.trim() || "";
  const brand = documentObj.getElementById("menuItemBrand")?.value?.trim() || "";
  const sku = documentObj.getElementById("menuItemSku")?.value?.trim() || "";
  const stockRaw = documentObj.getElementById("menuItemStock")?.value?.trim() || "";
  const sizes = normalizeOptionList(documentObj.getElementById("menuItemSizes")?.value || "");
  const colors = normalizeOptionList(documentObj.getElementById("menuItemColors")?.value || "");
  const visibilityInput = String(documentObj.getElementById("menuItemVisibility")?.value || "").trim().toLowerCase();
  let available = state.menuModal.item?.available !== false;
  let statusHidden = state.menuModal.item?.statusHidden === true
    || String(state.menuModal.item?.statusVisibility || "").trim().toLowerCase() === "hidden"
    || state.menuModal.item?.hidden === true
    || state.menuModal.item?.visible === false
    || String(state.menuModal.item?.visibility || "").trim().toLowerCase() === "hidden";
  if (visibilityInput === "available") {
    available = true;
    statusHidden = false;
  } else if (visibilityInput === "unavailable") {
    available = false;
    statusHidden = false;
  } else if (visibilityInput === "hidden") {
    statusHidden = true;
  }
  const menuSection = normalizedType === "drink" ? "drink" : "food";
  const specialSizeRaw = String(
    documentObj.getElementById("menuItemSpecialSize")?.value
      || state.menuModal.item?.specialSize
      || state.menuModal.item?.specialCardSize
      || ""
  ).trim().toLowerCase();
  const specialSize = specialSizeRaw === "food" ? "food" : "default";
  const specialActionTypeRaw = String(
    documentObj.getElementById("menuItemSpecialActionType")?.value
      || state.menuModal.item?.specialActionType
      || state.menuModal.item?.actionType
      || "product"
  ).trim().toLowerCase();
  const specialActionType = specialActionTypeRaw === "link" ? "link" : "product";
  const specialActionUrl = String(
    documentObj.getElementById("menuItemSpecialActionUrl")?.value
      || state.menuModal.item?.specialActionUrl
      || state.menuModal.item?.linkUrl
      || state.menuModal.item?.actionUrl
      || ""
  ).trim();
  const specialActionProductId = String(
    documentObj.getElementById("menuItemSpecialActionProductId")?.value
      || state.menuModal.item?.specialActionProductId
      || state.menuModal.item?.targetProductId
      || ""
  ).trim();
  const orderPositionRaw = String(documentObj.getElementById("menuItemOrderPosition")?.value || "").trim();
  const orderPositionInput = Number(orderPositionRaw);
  const hasOrderPositionInput = Number.isFinite(orderPositionInput) && orderPositionInput > 0;
  const cardStyleInput = documentObj.getElementById("menuItemCardStyle")?.value || state.menuModal.item?.cardStyle || "";
  const normalizedCardStyle = canPersistCardStyle
    ? normalizeMenuCardStyleCore(cardStyleInput, normalizedType)
    : "";
  const isSpecialCardStyle = normalizedCardStyle === "testfirst_special";
  const imageUrlInput = String(state.menuModal.imageUrlDraft || "").trim() || "";
  const stock = stockRaw === ""
    ? null
    : Math.max(0, Math.round(Number(stockRaw) || 0));
  const crop = getMenuModalCrop();
  const normalizeOrderIndex = (value, fallback = 0) => {
    const numeric = Number(value);
    if (!Number.isFinite(numeric)) return Math.max(0, Number(fallback) || 0);
    return Math.max(0, Math.floor(numeric));
  };
  const sortMenuItemsByOrder = (list = []) => {
    const safe = Array.isArray(list) ? list.slice() : [];
    return safe
      .map((entry, idx) => ({
        entry,
        idx,
        order: normalizeOrderIndex(entry?.orderIndex, idx)
      }))
      .sort((a, b) => (a.order - b.order) || (a.idx - b.idx))
      .map((wrapped, idx) => ({
        ...wrapped.entry,
        orderIndex: normalizeOrderIndex(wrapped.entry?.orderIndex, idx)
      }));
  };

  if (!name) {
    state.menuModal.status = "Bitte Namen eingeben.";
    renderOverlays({ updateMenu: true });
    return;
  }

  state.menuModal.loading = true;
  state.menuModal.status = "Speichern...";
  renderOverlays({ updateMenu: true });

  try {
    const ownerId = restaurantId;
    const existingImages = Array.isArray(state.menuModal.existingImages)
      ? state.menuModal.existingImages.slice()
      : [];
    const uploadedUrls = [];
    const files = Array.isArray(state.menuModal.imageFiles) ? state.menuModal.imageFiles : [];
    for (const file of files) {
      const { cdnUrl } = await uploadCompressedImage(
        file,
        ownerId,
        { maxSize: 1080, quality: 0.8, mimeType: "image/jpeg" }
      );
      if (cdnUrl) uploadedUrls.push(String(cdnUrl));
    }

    const merged = [
      imageUrlInput,
      ...(existingImages || []),
      ...(uploadedUrls || [])
    ].filter(Boolean);
    const imageUrls = Array.from(new Set(merged));
    let imageUrl = imageUrls[0] || "";

    const mode = state.menuModal.mode;
    const ref = mode === "edit" && state.menuModal.item?.id
      ? doc(db, "restaurants", restaurantId, "menuItems", state.menuModal.item.id)
      : doc(collection(db, "restaurants", restaurantId, "menuItems"));
    const id = state.menuModal.item?.id || ref.id;
    const existingIndexInList = (state.menu.items || []).findIndex((it) => String(it?.id || "") === String(id));
    const defaultOrderIndex = normalizeOrderIndex(
      state.menuModal.item?.orderIndex,
      existingIndexInList >= 0 ? existingIndexInList : (state.menu.items || []).length
    );
    const orderIndex = hasOrderPositionInput
      ? normalizeOrderIndex(orderPositionInput - 1, defaultOrderIndex)
      : defaultOrderIndex;
    const normalizedSpecialActionUrl = isSpecialCardStyle && specialActionType === "link" ? specialActionUrl : "";
    const normalizedSpecialActionProductId = isSpecialCardStyle && specialActionType === "product" ? specialActionProductId : "";
    const normalizedSpecialSize = isSpecialCardStyle && specialSize === "food" ? "food" : "default";
    const normalizedSpecialActionType = isSpecialCardStyle ? specialActionType : "self";

    const payload = {
      id,
      type: normalizedType,
      category: category || "Sonstiges",
      name,
      description,
      longDescription,
      allergens,
      brand: isShop ? brand : "",
      sku: isShop ? sku : "",
      stock: isShop ? stock : null,
      sizes: isShop ? sizes : [],
      colors: isShop ? colors : [],
      cropX: crop.x,
      cropY: crop.y,
      price: price ?? "",
      available,
      hidden: false,
      statusHidden: statusHidden === true,
      statusVisibility: statusHidden ? "hidden" : "auto",
      menuSection,
      orderIndex,
      ...(canPersistCardStyle
        ? {
          specialSize: normalizedSpecialSize,
          specialActionType: normalizedSpecialActionType,
          specialActionUrl: normalizedSpecialActionUrl,
          specialActionProductId: normalizedSpecialActionProductId
        }
        : {}),
      ...(canPersistCardStyle
        ? { cardStyle: normalizedCardStyle }
        : {}),
      imageUrl: imageUrl || "",
      imageUrls,
      updatedAt: serverTimestamp()
    };
    if (mode !== "edit") payload.createdAt = serverTimestamp();

    await setDoc(ref, payload, { merge: true });

    const nextItems = Array.isArray(state.menu.items) ? state.menu.items.slice() : [];
    const idx = nextItems.findIndex((it) => String(it.id) === String(id));
    const normalized = normalizeMenuItemDoc(payload, id);
    if (idx >= 0) {
      nextItems[idx] = { ...nextItems[idx], ...normalized };
    } else {
      nextItems.push(normalized);
    }
    const currentItem = nextItems.find((entry) => String(entry?.id || "") === String(id));
    const withoutCurrent = sortMenuItemsByOrder(nextItems).filter((entry) => String(entry?.id || "") !== String(id));
    const insertAt = Math.max(
      0,
      Math.min(
        withoutCurrent.length,
        hasOrderPositionInput
          ? normalizeOrderIndex(orderPositionInput - 1, withoutCurrent.length)
          : normalizeOrderIndex(currentItem?.orderIndex, withoutCurrent.length)
      )
    );
    if (currentItem) {
      withoutCurrent.splice(insertAt, 0, currentItem);
    }
    const orderedItems = withoutCurrent.map((entry, idxOrder) => ({
      ...entry,
      orderIndex: idxOrder
    }));
    await Promise.all(
      orderedItems.map((entry, idxOrder) => {
        const entryId = String(entry?.id || "").trim();
        if (!entryId) return Promise.resolve();
        return setDoc(
          doc(db, "restaurants", restaurantId, "menuItems", entryId),
          { orderIndex: idxOrder },
          { merge: true }
        );
      })
    );
    syncMenuCaches(restaurantId, orderedItems);
    await publishMenuToPublic(restaurantId, orderedItems);

    state.menuModal.status = "Gespeichert.";
    state.menuModal.loading = false;
    closeMenuModal();
    render();
  } catch (err) {
    console.error(err);
    state.menuModal.status = err?.message || "Speichern fehlgeschlagen.";
    state.menuModal.loading = false;
    renderOverlays({ updateMenu: true });
  }
}
