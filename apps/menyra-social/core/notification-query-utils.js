export function buildNotificationsLiveQueryCore({
  db,
  ownerUid = "",
  collection,
  query,
  orderBy,
  limit,
  liveLimit = 50
} = {}) {
  const collect = typeof collection === "function" ? collection : (() => null);
  const buildQuery = typeof query === "function" ? query : ((value) => value);
  const buildOrderBy = typeof orderBy === "function" ? orderBy : (() => null);
  const buildLimit = typeof limit === "function" ? limit : (() => null);
  const safeUid = String(ownerUid || "").trim();
  if (!safeUid) return null;
  const ref = collect(db, "users", safeUid, "notifications");
  return buildQuery(ref, buildOrderBy("createdAt", "desc"), buildLimit(liveLimit));
}

export function buildNotificationsFetchQueryCore({
  db,
  ownerUid = "",
  collection,
  query,
  orderBy,
  limit,
  fetchLimit = 20
} = {}) {
  const collect = typeof collection === "function" ? collection : (() => null);
  const buildQuery = typeof query === "function" ? query : ((value) => value);
  const buildOrderBy = typeof orderBy === "function" ? orderBy : (() => null);
  const buildLimit = typeof limit === "function" ? limit : (() => null);
  const safeUid = String(ownerUid || "").trim();
  if (!safeUid) return null;
  const ref = collect(db, "users", safeUid, "notifications");
  return buildQuery(ref, buildOrderBy("createdAt", "desc"), buildLimit(fetchLimit));
}

export async function fetchNotificationsFromQueryCore({
  queryRef,
  getDocs,
  mapNotificationSnapshot
} = {}) {
  if (!queryRef) return [];
  const readDocs = typeof getDocs === "function" ? getDocs : (async () => null);
  const mapItems = typeof mapNotificationSnapshot === "function"
    ? mapNotificationSnapshot
    : (() => []);
  const snap = await readDocs(queryRef);
  return mapItems(snap);
}
