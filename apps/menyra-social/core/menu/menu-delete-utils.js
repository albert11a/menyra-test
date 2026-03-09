export async function deleteMenuItemByIdCore({
  itemId,
  state,
  confirmFn,
  doc,
  db,
  deleteDoc,
  syncMenuCaches,
  publishMenuToPublic,
  render,
  alertFn
} = {}) {
  if (!state || !state.user || !itemId) return;
  const restaurantId = state.userProfile.restaurantId || "";
  if (!restaurantId) return;
  if (!confirmFn("Produkt wirklich loeschen?")) return;
  try {
    await deleteDoc(doc(db, "restaurants", restaurantId, "menuItems", itemId));
    const nextItems = (state.menu.items || []).filter((it) => String(it.id) !== String(itemId));
    syncMenuCaches(restaurantId, nextItems);
    await publishMenuToPublic(restaurantId, nextItems);
    render();
  } catch (err) {
    console.error(err);
    alertFn("Loeschen fehlgeschlagen.");
  }
}
