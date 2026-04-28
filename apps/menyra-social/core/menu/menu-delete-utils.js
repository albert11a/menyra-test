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
    syncMenuCaches(restaurantId, nextItems, { includePublic: true });
    await publishMenuToPublic(restaurantId, nextItems);
    if (typeof deleteDoc === "function" && typeof doc === "function" && db) {
      deleteDoc(doc(db, "restaurants", restaurantId, "menuItems", itemId)).catch(() => {});
    }
    render();
  } catch (err) {
    console.error(err);
    alertFn("Loeschen fehlgeschlagen.");
  }
}
