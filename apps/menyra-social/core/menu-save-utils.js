export async function saveMenuItemFromModalCore({
  state,
  documentObj,
  isShopCatalogProfile,
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
  if (!restaurantId) {
    state.menuModal.status = "Kein Restaurant ausgewaehlt.";
    renderOverlays({ updateMenu: true });
    return;
  }
  const name = documentObj.getElementById("menuItemName")?.value?.trim() || "";
  const price = documentObj.getElementById("menuItemPrice")?.value?.trim() || "";
  const category = documentObj.getElementById("menuItemCategory")?.value?.trim() || "";
  const type = documentObj.getElementById("menuItemType")?.value || "food";
  const description = documentObj.getElementById("menuItemDesc")?.value?.trim() || "";
  const longDescription = documentObj.getElementById("menuItemLongDesc")?.value?.trim() || "";
  const allergens = documentObj.getElementById("menuItemAllergens")?.value?.trim() || "";
  const brand = documentObj.getElementById("menuItemBrand")?.value?.trim() || "";
  const sku = documentObj.getElementById("menuItemSku")?.value?.trim() || "";
  const stockRaw = documentObj.getElementById("menuItemStock")?.value?.trim() || "";
  const sizes = normalizeOptionList(documentObj.getElementById("menuItemSizes")?.value || "");
  const colors = normalizeOptionList(documentObj.getElementById("menuItemColors")?.value || "");
  const available = documentObj.getElementById("menuItemAvailable")?.checked !== false;
  const imageUrlInput = String(state.menuModal.imageUrlDraft || "").trim()
    || documentObj.getElementById("menuItemImageUrl")?.value?.trim()
    || "";
  const stock = stockRaw === ""
    ? null
    : Math.max(0, Math.round(Number(stockRaw) || 0));
  const crop = getMenuModalCrop();

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

    const payload = {
      id,
      type: normalizeMenuType(type),
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
      nextItems.unshift(normalized);
    }
    syncMenuCaches(restaurantId, nextItems);
    await publishMenuToPublic(restaurantId, nextItems);

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
