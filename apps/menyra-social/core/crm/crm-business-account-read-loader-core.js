export const CRM_BUSINESS_ACCOUNT_READ_LOADER_CORE_VERSION =
  "crm-business-account-read-loader-core.v1";

function asText(value = "") {
  return String(value || "").trim();
}

export function normalizeCrmBusinessAccountEntryCore(source = {}, id = "") {
  const data = source && typeof source === "object" ? source : {};
  const permissions = data.permissions && typeof data.permissions === "object" ? data.permissions : {};
  const firstName = asText(data.firstName);
  const lastName = asText(data.lastName);
  const name = asText(data.name || `${firstName} ${lastName}`.trim() || data.displayName);
  const statusKey = asText(data.status || (data.active === false ? "disabled" : "active")).toLowerCase();
  const active = data.active === false ? false : statusKey !== "disabled";
  const roleKey = asText(data.role || data.staffRole).toLowerCase();
  return {
    uid: asText(id || data.uid || data.userId),
    userId: asText(data.userId || data.uid || id),
    restaurantId: asText(data.restaurantId),
    firstName,
    lastName,
    name,
    email: asText(data.email),
    role: roleKey === "manager" ? "manager" : "waiter",
    businessAccess: data.businessAccess === true || permissions.businessAccess === true,
    waiterAccess: data.waiterAccess === true || permissions.waiterAccess === true,
    active,
    status: active ? "active" : "disabled",
    createdAt: data.createdAt || null,
    updatedAt: data.updatedAt || null
  };
}

export async function loadCrmBusinessAccountsCore({
  db,
  collectionFn,
  getDocsFn,
  restaurantId = "",
  normalizeBusinessAccountEntryFn = normalizeCrmBusinessAccountEntryCore
} = {}) {
  const safeRestaurantId = asText(restaurantId);
  const missing = [];
  if (!db) missing.push("db");
  if (typeof collectionFn !== "function") missing.push("collection");
  if (typeof getDocsFn !== "function") missing.push("getDocs");
  if (!safeRestaurantId) missing.push("restaurantId");
  if (missing.length) {
    throw new Error(`loadCrmBusinessAccountsCore missing read deps: ${missing.join(", ")}`);
  }
  const snap = await getDocsFn(collectionFn(db, "restaurants", safeRestaurantId, "staff"));
  const items = [];
  if (snap?.forEach) {
    snap.forEach((docSnap) => {
      const entry = normalizeBusinessAccountEntryFn(docSnap.data?.() || {}, docSnap.id);
      if (!entry.uid) return;
      items.push(entry);
    });
  }
  items.sort((a, b) => {
    const aName = `${asText(a.firstName)} ${asText(a.lastName)}`.trim().toLowerCase();
    const bName = `${asText(b.firstName)} ${asText(b.lastName)}`.trim().toLowerCase();
    return aName.localeCompare(bName);
  });
  return {
    rows: items,
    items,
    hasMore: false,
    knownCount: items.length,
    countExact: true,
    restaurantId: safeRestaurantId
  };
}
