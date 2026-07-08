// Mnyra Analytics: einheitliches Event-Schema + pure Helfer.
// Dieses Modul ist bewusst frei von Browser-/Firebase-Abhaengigkeiten,
// damit Tracker, Dashboards und Tests dieselbe Wahrheit teilen.

export const ANALYTICS_EVENT_NAMES = Object.freeze([
  "business_profile_view",
  "profile_contact_click",
  "post_impression",
  "post_click",
  "post_like",
  "post_share",
  "menu_open",
  "category_open",
  "product_view",
  "product_like",
  "qr_scan",
  "call_waiter_click",
  "order_started",
  "order_completed",
  "feed_impression",
  "feed_click"
]);

const ANALYTICS_EVENT_NAME_SET = new Set(ANALYTICS_EVENT_NAMES);

export const ANALYTICS_PROFILE_SOURCES = Object.freeze([
  "feed",
  "restaurants",
  "search",
  "map",
  "qr",
  "external",
  "direct",
  "other"
]);

const ANALYTICS_PROFILE_SOURCE_SET = new Set(ANALYTICS_PROFILE_SOURCES);

export const ANALYTICS_CONTACT_KINDS = Object.freeze([
  "phone",
  "address",
  "map",
  "hours",
  "social"
]);

const ANALYTICS_CONTACT_KIND_SET = new Set(ANALYTICS_CONTACT_KINDS);

// Events, deren "Reichweite" pro Session/Tag nur einmal zaehlen soll.
export const ANALYTICS_UNIQUE_EVENTS = Object.freeze([
  "business_profile_view",
  "menu_open",
  "qr_scan"
]);

export function isKnownAnalyticsEvent(name = "") {
  return ANALYTICS_EVENT_NAME_SET.has(String(name || "").trim());
}

export function normalizeAnalyticsSource(value = "") {
  const key = String(value || "").trim().toLowerCase();
  if (!key) return "direct";
  if (ANALYTICS_PROFILE_SOURCE_SET.has(key)) return key;
  if (key === "home") return "feed";
  if (key === "restaurant" || key === "marketplace") return "restaurants";
  if (key === "table" || key === "table-qr" || key === "qr-code") return "qr";
  if (key === "link" || key === "share" || key === "referrer") return "external";
  return "other";
}

export function normalizeContactKind(value = "") {
  const key = String(value || "").trim().toLowerCase();
  return ANALYTICS_CONTACT_KIND_SET.has(key) ? key : "";
}

// Firestore-Map-Keys duerfen keine Pfadzeichen enthalten und sollen kurz bleiben.
export function sanitizeAnalyticsMapKey(value = "", { prefix = "" } = {}) {
  const raw = String(value ?? "").trim();
  if (!raw) return "";
  const cleaned = raw
    .replace(/[.~*/[\]#$]/g, "_")
    .replace(/\s+/g, "_")
    .slice(0, 120);
  if (!cleaned) return "";
  return prefix ? `${prefix}${cleaned}` : cleaned;
}

export function analyticsTableKey(tableId = "", tableNumber = 0) {
  const numeric = Math.max(0, Math.trunc(Number(tableNumber) || 0));
  const fromId = sanitizeAnalyticsMapKey(tableId);
  if (fromId) return fromId.startsWith("t") ? fromId : `t${fromId}`;
  if (numeric > 0) return `t${numeric}`;
  return "";
}

export function analyticsDayKey(dateInput = new Date()) {
  const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
  if (Number.isNaN(date.getTime())) return "";
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function analyticsHourKey(dateInput = new Date()) {
  const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
  if (Number.isNaN(date.getTime())) return "0";
  return String(date.getHours());
}

function asSafeText(value = "", maxLength = 200) {
  return String(value ?? "").trim().slice(0, maxLength);
}

function asSafeNumber(value, fallback = 0) {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
}

// Normalisiert ein rohes Event zu einem flachen, speicherbaren Payload.
// Gibt null zurueck, wenn Pflichtfelder fehlen.
export function buildAnalyticsEvent(name = "", meta = {}, { now = new Date(), sessionId = "", userId = "" } = {}) {
  const safeName = String(name || "").trim();
  if (!isKnownAnalyticsEvent(safeName)) return null;
  const businessId = asSafeText(meta.businessId, 180);
  if (!businessId) return null;
  const event = {
    name: safeName,
    businessId,
    sessionId: asSafeText(sessionId, 120),
    day: analyticsDayKey(now),
    hour: Math.max(0, Math.min(23, Math.trunc(asSafeNumber(analyticsHourKey(now), 0))))
  };
  const optionalText = {
    userId: asSafeText(userId || meta.userId, 180),
    source: normalizeAnalyticsSource(meta.source),
    postId: asSafeText(meta.postId, 180),
    productId: asSafeText(meta.productId, 180),
    productName: asSafeText(meta.productName, 160),
    menuId: asSafeText(meta.menuId, 180),
    categoryId: asSafeText(meta.categoryId, 120),
    categoryName: asSafeText(meta.categoryName, 120),
    contactKind: normalizeContactKind(meta.contactKind),
    tableId: analyticsTableKey(meta.tableId, meta.tableNumber),
    orderId: asSafeText(meta.orderId, 180)
  };
  Object.entries(optionalText).forEach(([key, value]) => {
    if (value) event[key] = value;
  });
  const value = asSafeNumber(meta.value, 0);
  if (value > 0) event.value = Math.round(value * 100) / 100;
  const quantity = Math.max(0, Math.trunc(asSafeNumber(meta.quantity, 0)));
  if (quantity > 0) event.quantity = quantity;
  if (meta.isUnique === true) event.isUnique = true;
  if (Array.isArray(meta.items)) {
    const items = meta.items
      .map((item) => ({
        productId: asSafeText(item?.productId || item?.itemId || item?.id, 180),
        name: asSafeText(item?.name, 160),
        quantity: Math.max(1, Math.trunc(asSafeNumber(item?.quantity, 1))),
        revenue: Math.max(0, Math.round(asSafeNumber(item?.revenue, 0) * 100) / 100)
      }))
      .filter((item) => item.productId)
      .slice(0, 60);
    if (items.length) event.items = items;
  }
  return event;
}

// Baut den Increment-Plan fuer das Tages-Aggregat:
// eine Liste { path: ["counters","menu_open"], n: 1 } bzw. { path, set: "wert" }.
export function buildDailyIncrementPlan(event = null) {
  if (!event || !event.name || !event.businessId) return [];
  const plan = [];
  const add = (path, n = 1) => plan.push({ path, n });
  const set = (path, value) => plan.push({ path, set: value });

  add(["counters", event.name], 1);
  if (event.isUnique && ANALYTICS_UNIQUE_EVENTS.includes(event.name)) {
    add(["uniques", event.name], 1);
  }

  const hourKey = String(Math.max(0, Math.min(23, Math.trunc(Number(event.hour) || 0))));
  const tableKey = analyticsTableKey(event.tableId, event.tableNumber);

  switch (event.name) {
    case "business_profile_view": {
      add(["profileSources", normalizeAnalyticsSource(event.source)], 1);
      break;
    }
    case "profile_contact_click": {
      const kind = normalizeContactKind(event.contactKind);
      if (kind) add(["contacts", kind], 1);
      break;
    }
    case "post_impression":
    case "post_click":
    case "post_like":
    case "post_share": {
      const postKey = sanitizeAnalyticsMapKey(event.postId);
      if (postKey) {
        const field = event.name === "post_impression"
          ? "impressions"
          : (event.name === "post_click" ? "clicks" : (event.name === "post_like" ? "likes" : "shares"));
        add(["posts", postKey, field], 1);
      }
      break;
    }
    case "category_open": {
      const catKey = sanitizeAnalyticsMapKey(event.categoryId);
      if (catKey) {
        add(["categories", catKey, "opens"], 1);
        if (event.categoryName) set(["categories", catKey, "name"], event.categoryName);
      }
      break;
    }
    case "product_view":
    case "product_like": {
      const productKey = sanitizeAnalyticsMapKey(event.productId);
      if (productKey) {
        add(["products", productKey, event.name === "product_view" ? "views" : "likes"], 1);
        if (event.productName) set(["products", productKey, "name"], event.productName);
      }
      break;
    }
    case "qr_scan": {
      add(["hourly", hourKey, "qrScans"], 1);
      if (tableKey) add(["tables", tableKey, "qrScans"], 1);
      break;
    }
    case "call_waiter_click": {
      add(["hourly", hourKey, "waiterCalls"], 1);
      if (tableKey) add(["tables", tableKey, "waiterCalls"], 1);
      break;
    }
    case "order_started": {
      add(["orders", "started"], 1);
      break;
    }
    case "order_completed": {
      add(["orders", "completed"], 1);
      add(["hourly", hourKey, "ordersCompleted"], 1);
      add(["orders", normalizeAnalyticsSource(event.source) === "qr" ? "qr" : "external"], 1);
      const revenue = Math.max(0, Number(event.value) || 0);
      if (revenue > 0) add(["orders", "revenue"], Math.round(revenue * 100) / 100);
      const quantity = Math.max(0, Math.trunc(Number(event.quantity) || 0));
      if (quantity > 0) add(["orders", "itemCount"], quantity);
      if (tableKey) add(["tables", tableKey, "ordersCompleted"], 1);
      (Array.isArray(event.items) ? event.items : []).forEach((item) => {
        const productKey = sanitizeAnalyticsMapKey(item.productId);
        if (!productKey) return;
        add(["products", productKey, "orders"], 1);
        add(["products", productKey, "quantity"], Math.max(1, Math.trunc(Number(item.quantity) || 1)));
        const itemRevenue = Math.max(0, Number(item.revenue) || 0);
        if (itemRevenue > 0) add(["products", productKey, "revenue"], Math.round(itemRevenue * 100) / 100);
        if (item.name) set(["products", productKey, "name"], item.name);
      });
      break;
    }
    default:
      break;
  }
  return plan;
}

// Fuegt einen Increment-Plan in ein verschachteltes Patch-Objekt ein.
// makeIncrement wandelt eine Zahl in den Firestore-increment-Sentinel um;
// in Tests kann eine einfache Additionsfunktion uebergeben werden.
export function applyIncrementPlanToPatch(patch = {}, plan = [], makeIncrement = (n) => n) {
  (Array.isArray(plan) ? plan : []).forEach((entry) => {
    const path = Array.isArray(entry?.path) ? entry.path.map((part) => String(part || "").trim()).filter(Boolean) : [];
    if (!path.length) return;
    let node = patch;
    for (let i = 0; i < path.length - 1; i += 1) {
      const key = path[i];
      if (!node[key] || typeof node[key] !== "object") node[key] = {};
      node = node[key];
    }
    const leaf = path[path.length - 1];
    if (Object.prototype.hasOwnProperty.call(entry, "set")) {
      node[leaf] = entry.set;
      return;
    }
    const n = Number(entry?.n);
    if (!Number.isFinite(n) || n === 0) return;
    node[leaf] = makeIncrement(n);
  });
  return patch;
}
