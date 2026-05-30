export const CRM_ADMIN_READ_LOADER_CORE_VERSION = "crm-admin-read-loader-core.v1";

export {
  loadCrmBusinessAccountsCore,
  normalizeCrmBusinessAccountEntryCore
} from "./crm-business-account-read-loader-core.js";

function asText(value = "") {
  return String(value || "").trim();
}

function getSnapshotRows(snap) {
  if (!snap?.docs?.length) return [];
  return snap.docs.map((docSnap) => ({
    id: asText(docSnap?.id),
    data: typeof docSnap?.data === "function" ? (docSnap.data() || {}) : {}
  }));
}

function getReadLimit(desiredCount, scope = "own", pageSize = 20) {
  const safeCount = Math.max(Number(pageSize) || 20, Number(desiredCount) || Number(pageSize) || 20);
  const multiplier = scope === "own" ? 3 : 4;
  return Math.min(Math.max(safeCount * multiplier, (Number(pageSize) || 20) + 1), 160);
}

function createEmptyReadResult({
  scope = "",
  pageSize = 20,
  fetchLimit = 0,
  restaurantRows = []
} = {}) {
  return {
    rows: [],
    items: [],
    restaurantRows: Array.isArray(restaurantRows) ? restaurantRows.slice() : [],
    hasMore: false,
    knownCount: 0,
    countExact: true,
    pageSize,
    fetchLimit,
    scope
  };
}

function assertReadApi({
  db,
  collectionFn,
  queryFn,
  whereFn,
  limitFn,
  getDocsFn
} = {}, loaderName = "CRM read loader") {
  const missing = [];
  if (!db) missing.push("db");
  if (typeof collectionFn !== "function") missing.push("collection");
  if (typeof queryFn !== "function") missing.push("query");
  if (typeof whereFn !== "function") missing.push("where");
  if (typeof limitFn !== "function") missing.push("limit");
  if (typeof getDocsFn !== "function") missing.push("getDocs");
  if (missing.length) {
    throw new Error(`${loaderName} missing read deps: ${missing.join(", ")}`);
  }
}

function toDateMs(value, toDateSafeFn) {
  const date = typeof toDateSafeFn === "function" ? toDateSafeFn(value) : null;
  if (date && typeof date.getTime === "function") return date.getTime() || 0;
  if (value instanceof Date) return value.getTime() || 0;
  if (value && typeof value.toDate === "function") {
    try {
      return value.toDate()?.getTime?.() || 0;
    } catch {}
  }
  const parsed = value ? new Date(value) : null;
  return parsed && !Number.isNaN(parsed.getTime()) ? parsed.getTime() : 0;
}

export async function loadCrmLeadsCore({
  db,
  collectionFn,
  queryFn,
  whereFn,
  limitFn,
  getDocsFn,
  scope = "own",
  desiredCount = 20,
  pageSize = 20,
  getCurrentCeoMetaFn,
  normalizeLeadScopeKeyFn,
  normalizeLeadDocFn,
  normalizeLeadFromRestaurantFn,
  isRestaurantLeadCandidateFn,
  canCurrentCeoSeeRowFn,
  isCurrentCeoOwnRowFn,
  normalizeLeadStatusKeyFn,
  hasGlobalCeoAccessFn,
  toDateSafeFn
} = {}) {
  assertReadApi({ db, collectionFn, queryFn, whereFn, limitFn, getDocsFn }, "loadCrmLeadsCore");
  const normalizeScope = typeof normalizeLeadScopeKeyFn === "function"
    ? normalizeLeadScopeKeyFn
    : ((value) => (["own", "staff", "archived"].includes(asText(value)) ? asText(value) : "own"));
  const safeScope = normalizeScope(scope);
  const current = typeof getCurrentCeoMetaFn === "function" ? (getCurrentCeoMetaFn() || {}) : {};
  const currentUid = asText(current.uid);
  const safePageSize = Math.max(Number(pageSize) || 20, Number(desiredCount) || Number(pageSize) || 20);
  const fetchLimit = getReadLimit(safePageSize, safeScope, pageSize);
  if (!currentUid) return createEmptyReadResult({ scope: safeScope, pageSize: safePageSize, fetchLimit });

  const leadRef = collectionFn(db, "leads");
  const restaurantRef = collectionFn(db, "restaurants");
  const leadQueries = [];
  const restaurantQueries = [];

  if (safeScope === "own") {
    leadQueries.push(queryFn(leadRef, whereFn("createdByUid", "==", currentUid), limitFn(fetchLimit)));
    restaurantQueries.push(queryFn(restaurantRef, whereFn("createdByUid", "==", currentUid), limitFn(fetchLimit)));
  } else {
    leadQueries.push(queryFn(leadRef, whereFn("ceoPath", "array-contains", currentUid), limitFn(fetchLimit)));
    restaurantQueries.push(queryFn(restaurantRef, whereFn("ceoPath", "array-contains", currentUid), limitFn(fetchLimit)));
    if (typeof hasGlobalCeoAccessFn === "function" && hasGlobalCeoAccessFn()) {
      leadQueries.push(queryFn(leadRef, limitFn(fetchLimit)));
      restaurantQueries.push(queryFn(restaurantRef, limitFn(fetchLimit)));
    }
  }

  const [leadSnaps, restaurantSnaps] = await Promise.all([
    Promise.all(leadQueries.map((ref) => getDocsFn(ref).catch(() => null))),
    Promise.all(restaurantQueries.map((ref) => getDocsFn(ref).catch(() => null)))
  ]);
  const leadMap = new Map();
  leadSnaps.forEach((snap) => {
    getSnapshotRows(snap).forEach((row) => {
      const normalized = typeof normalizeLeadDocFn === "function"
        ? normalizeLeadDocFn({ id: row.id, ...row.data })
        : { id: row.id, ...row.data };
      leadMap.set(row.id, normalized);
    });
  });

  const restaurantMap = new Map();
  restaurantSnaps.forEach((snap) => {
    getSnapshotRows(snap).forEach((row) => {
      restaurantMap.set(row.id, { id: row.id, ...row.data });
    });
  });
  const restaurantRows = Array.from(restaurantMap.values());
  const storedLeads = Array.from(leadMap.values());
  const byRestaurant = new Map();
  const byId = new Map();
  storedLeads.forEach((lead) => {
    if (lead?.restaurantId) byRestaurant.set(asText(lead.restaurantId), true);
    if (lead?.id) byId.set(asText(lead.id), true);
  });

  const isLeadCandidate = typeof isRestaurantLeadCandidateFn === "function"
    ? isRestaurantLeadCandidateFn
    : (() => false);
  const normalizeLeadFromRestaurant = typeof normalizeLeadFromRestaurantFn === "function"
    ? normalizeLeadFromRestaurantFn
    : ((rest) => (rest?.id ? { id: rest.leadId || rest.id, restaurantId: rest.id, ...rest } : null));
  const normalizeStatus = typeof normalizeLeadStatusKeyFn === "function"
    ? normalizeLeadStatusKeyFn
    : ((value) => asText(value));
  const canSee = typeof canCurrentCeoSeeRowFn === "function" ? canCurrentCeoSeeRowFn : (() => true);
  const isOwn = typeof isCurrentCeoOwnRowFn === "function" ? isCurrentCeoOwnRowFn : (() => true);
  const derivedLeads = restaurantRows
    .filter((rest) => isLeadCandidate(rest))
    .map((rest) => normalizeLeadFromRestaurant(rest))
    .filter((lead) => lead && (!lead.restaurantId || !byRestaurant.has(asText(lead.restaurantId))) && (!lead.id || !byId.has(asText(lead.id))));

  const rows = [...storedLeads, ...derivedLeads]
    .filter((lead) => canSee(lead))
    .filter((lead) => normalizeStatus(lead.status) !== "kunde")
    .filter((lead) => {
      const statusKey = normalizeStatus(lead.status);
      if (safeScope === "archived") return statusKey === "no_interest";
      if (statusKey === "no_interest") return false;
      return safeScope === "own" ? isOwn(lead) : !isOwn(lead);
    })
    .sort((a, b) => toDateMs(b.createdAt, toDateSafeFn) - toDateMs(a.createdAt, toDateSafeFn));

  return {
    rows,
    items: rows.slice(0, safePageSize),
    restaurantRows,
    hasMore: rows.length > safePageSize,
    knownCount: rows.length,
    countExact: rows.length < fetchLimit,
    pageSize: safePageSize,
    fetchLimit,
    scope: safeScope
  };
}

export async function loadCrmCustomersCore({
  db,
  collectionFn,
  queryFn,
  whereFn,
  limitFn,
  getDocsFn,
  scope = "own",
  desiredCount = 20,
  pageSize = 20,
  getCurrentCeoMetaFn,
  normalizeCustomerScopeKeyFn,
  isCustomerRestaurantFn,
  canCurrentCeoSeeRowFn,
  isCurrentCeoOwnRowFn,
  hasGlobalCeoAccessFn,
  toDateSafeFn
} = {}) {
  assertReadApi({ db, collectionFn, queryFn, whereFn, limitFn, getDocsFn }, "loadCrmCustomersCore");
  const normalizeScope = typeof normalizeCustomerScopeKeyFn === "function"
    ? normalizeCustomerScopeKeyFn
    : ((value) => (asText(value) === "staff" ? "staff" : "own"));
  const safeScope = normalizeScope(scope);
  const current = typeof getCurrentCeoMetaFn === "function" ? (getCurrentCeoMetaFn() || {}) : {};
  const currentUid = asText(current.uid);
  const safePageSize = Math.max(Number(pageSize) || 20, Number(desiredCount) || Number(pageSize) || 20);
  const fetchLimit = getReadLimit(safePageSize, safeScope, pageSize);
  if (!currentUid) return createEmptyReadResult({ scope: safeScope, pageSize: safePageSize, fetchLimit });

  const baseRef = collectionFn(db, "restaurants");
  const queryRefs = [];
  if (safeScope === "own") {
    queryRefs.push(queryFn(baseRef, whereFn("createdByUid", "==", currentUid), limitFn(fetchLimit)));
  } else {
    queryRefs.push(queryFn(baseRef, whereFn("ceoPath", "array-contains", currentUid), limitFn(fetchLimit)));
    if (typeof hasGlobalCeoAccessFn === "function" && hasGlobalCeoAccessFn()) {
      queryRefs.push(queryFn(baseRef, limitFn(fetchLimit)));
    }
  }

  const snaps = await Promise.all(queryRefs.map((ref) => getDocsFn(ref).catch(() => null)));
  const rowMap = new Map();
  snaps.forEach((snap) => {
    getSnapshotRows(snap).forEach((row) => {
      rowMap.set(row.id, { id: row.id, ...row.data });
    });
  });
  const isCustomer = typeof isCustomerRestaurantFn === "function" ? isCustomerRestaurantFn : (() => false);
  const canSee = typeof canCurrentCeoSeeRowFn === "function" ? canCurrentCeoSeeRowFn : (() => true);
  const isOwn = typeof isCurrentCeoOwnRowFn === "function" ? isCurrentCeoOwnRowFn : (() => true);
  const rows = Array.from(rowMap.values())
    .filter((row) => isCustomer(row))
    .filter((row) => canSee(row))
    .filter((row) => (safeScope === "own" ? isOwn(row) : !isOwn(row)))
    .sort((a, b) => toDateMs(b.createdAt, toDateSafeFn) - toDateMs(a.createdAt, toDateSafeFn));

  return {
    rows,
    items: rows.slice(0, safePageSize),
    restaurantRows: rows.slice(),
    hasMore: rows.length > safePageSize,
    knownCount: rows.length,
    countExact: rows.length < fetchLimit,
    pageSize: safePageSize,
    fetchLimit,
    scope: safeScope
  };
}

export async function loadCrmCeoStaffCore({
  db,
  collectionFn,
  queryFn,
  whereFn,
  limitFn,
  getDocsFn,
  grow = false,
  currentPageSize = 20,
  pageSize = 20,
  getCurrentCeoMetaFn,
  hasGlobalCeoAccessFn,
  normalizeCeoStaffRecordFn,
  canViewCeoRecordFn,
  hydrateStaffRecordsFromUserProfilesFn,
  isHiddenLegacyCeoEmailFn,
  uniqueStringListFn,
  toDateSafeFn,
  syncDirectory = false
} = {}) {
  assertReadApi({ db, collectionFn, queryFn, whereFn, limitFn, getDocsFn }, "loadCrmCeoStaffCore");
  const current = typeof getCurrentCeoMetaFn === "function" ? (getCurrentCeoMetaFn() || {}) : {};
  const currentUid = asText(current.uid);
  const nextSize = grow
    ? Math.max(Number(pageSize) || 20, Number(currentPageSize) || 20) + (Number(pageSize) || 20)
    : Math.max(Number(pageSize) || 20, Number(currentPageSize) || 20);
  if (!currentUid) {
    return {
      rows: [],
      items: [],
      hiddenLegacyCeoUids: [],
      hasMore: false,
      pageSize: nextSize
    };
  }

  const staffRef = collectionFn(db, "superadmins");
  const staffQueries = [
    queryFn(staffRef, whereFn("ceoPath", "array-contains", currentUid), limitFn(nextSize + 1)),
    queryFn(staffRef, whereFn("ceoParentUid", "==", currentUid), limitFn(nextSize + 1))
  ];
  if (typeof hasGlobalCeoAccessFn === "function" && hasGlobalCeoAccessFn()) {
    staffQueries.push(queryFn(staffRef, limitFn(nextSize + 1)));
  }
  const staffSnaps = await Promise.all(staffQueries.map((ref) => getDocsFn(ref).catch(() => null)));
  const rowMap = new Map();
  staffSnaps.forEach((snap) => {
    getSnapshotRows(snap).forEach((row) => {
      rowMap.set(row.id, { id: row.id, ...row.data });
    });
  });
  const uniqueList = typeof uniqueStringListFn === "function"
    ? uniqueStringListFn
    : ((values = []) => Array.from(new Set((values || []).map((value) => asText(value)).filter(Boolean))));
  const isHiddenLegacyCeoEmail = typeof isHiddenLegacyCeoEmailFn === "function" ? isHiddenLegacyCeoEmailFn : (() => false);
  const hiddenLegacyCeoUids = uniqueList(Array.from(rowMap.values())
    .filter((row) => isHiddenLegacyCeoEmail(row.email || row.loginEmail || row.ownerEmail || ""))
    .map((row) => asText(row.uid || row.userId || row.id)));
  const normalizeStaff = typeof normalizeCeoStaffRecordFn === "function"
    ? normalizeCeoStaffRecordFn
    : ((row) => ({ ...(row || {}), uid: asText(row?.uid || row?.userId || row?.id), id: asText(row?.uid || row?.userId || row?.id) }));
  const canView = typeof canViewCeoRecordFn === "function" ? canViewCeoRecordFn : (() => true);
  let rows = Array.from(rowMap.values()).map((row) => normalizeStaff(row));
  rows = rows.filter((item) => canView(item) && asText(item.uid) !== currentUid);
  rows = rows.filter((item) => !isHiddenLegacyCeoEmail(item.email || ""));
  if (typeof hydrateStaffRecordsFromUserProfilesFn === "function") {
    rows = await hydrateStaffRecordsFromUserProfilesFn(rows, { syncDirectory });
  }
  rows = rows.sort((a, b) => {
    const ta = toDateMs(a.createdAt, toDateSafeFn);
    const tb = toDateMs(b.createdAt, toDateSafeFn);
    if (tb !== ta) return tb - ta;
    return asText(a.name).localeCompare(asText(b.name));
  });
  return {
    rows,
    items: rows.slice(0, nextSize),
    hiddenLegacyCeoUids,
    hasMore: rows.length > nextSize,
    pageSize: nextSize
  };
}
