// Laedt analyticsDaily-Aggregate fuer einen Datumsbereich.
// Firestore-Funktionen werden injiziert, damit Social-App und Heart
// ihre jeweils schon geladenen Firebase-Instanzen weiterverwenden.

export async function loadAnalyticsDailyRange({
  db,
  collectionFn,
  queryFn,
  whereFn,
  documentIdFn,
  getDocsFn,
  restaurantId = "",
  fromDay = "",
  toDay = ""
} = {}) {
  const safeRestaurantId = String(restaurantId || "").trim();
  const safeFrom = String(fromDay || "").trim();
  const safeTo = String(toDay || "").trim();
  if (
    !db
    || typeof collectionFn !== "function"
    || typeof queryFn !== "function"
    || typeof whereFn !== "function"
    || typeof documentIdFn !== "function"
    || typeof getDocsFn !== "function"
    || !safeRestaurantId
    || !safeFrom
    || !safeTo
  ) {
    return [];
  }
  const dailyRef = collectionFn(db, "restaurants", safeRestaurantId, "analyticsDaily");
  const snap = await getDocsFn(queryFn(
    dailyRef,
    whereFn(documentIdFn(), ">=", safeFrom),
    whereFn(documentIdFn(), "<=", safeTo)
  ));
  return snap.docs.map((docSnap) => ({ id: docSnap.id, ...(docSnap.data() || {}) }));
}
