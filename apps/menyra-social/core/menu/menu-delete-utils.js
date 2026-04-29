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
  if (!confirmFn("Möchten Sie wirklich löschen?")) return;
  try {
    const nextItems = (state.menu.items || []).filter((it) => String(it.id) !== String(itemId));
    if (typeof deleteDoc === "function" && typeof doc === "function" && db) {
      await deleteDoc(doc(db, "restaurants", restaurantId, "menuItems", itemId));
    }
    syncMenuCaches(restaurantId, nextItems, { includePublic: true });
    await publishMenuToPublic(restaurantId, nextItems);
    render();
  } catch (err) {
    console.error(err);
    alertFn("Loeschen fehlgeschlagen.");
  }
}
