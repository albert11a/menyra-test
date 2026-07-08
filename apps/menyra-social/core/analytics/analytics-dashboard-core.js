// Mnyra Analytics Dashboard-Core: pure Berechnungen (Zeitraeume, Merge,
// Vergleich zur Vorperiode, Top-Listen, Funnel, Formatierung).
// Keine DOM-/Firebase-Abhaengigkeiten – vollstaendig testbar.

import { analyticsDayKey } from "./analytics-event-schema.js";

export const ANALYTICS_RANGE_PRESETS = Object.freeze([
  { key: "today", label: "Heute", days: 1 },
  { key: "7d", label: "7 Tage", days: 7 },
  { key: "30d", label: "30 Tage", days: 30 },
  { key: "90d", label: "90 Tage", days: 90 },
  { key: "custom", label: "Eigene", days: 0 }
]);

const DAY_MS = 24 * 60 * 60 * 1000;
const MAX_CUSTOM_DAYS = 366;

function startOfDay(date) {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

function parseDayKey(dayKey = "") {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(dayKey || "").trim());
  if (!match) return null;
  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  return Number.isNaN(date.getTime()) ? null : startOfDay(date);
}

// Loest einen Range-Key (oder custom from/to) in aktuellen + Vorperioden-Zeitraum auf.
export function resolveAnalyticsRange({
  rangeKey = "7d",
  customFrom = "",
  customTo = "",
  now = new Date()
} = {}) {
  const today = startOfDay(now);
  const preset = ANALYTICS_RANGE_PRESETS.find((item) => item.key === rangeKey) || ANALYTICS_RANGE_PRESETS[1];
  let from = today;
  let to = today;
  if (preset.key === "custom") {
    const parsedFrom = parseDayKey(customFrom);
    const parsedTo = parseDayKey(customTo);
    if (!parsedFrom || !parsedTo || parsedFrom.getTime() > parsedTo.getTime()) {
      return null;
    }
    from = parsedFrom;
    to = parsedTo.getTime() > today.getTime() ? today : parsedTo;
    const spanDays = Math.round((to.getTime() - from.getTime()) / DAY_MS) + 1;
    if (spanDays > MAX_CUSTOM_DAYS) {
      from = new Date(to.getTime() - (MAX_CUSTOM_DAYS - 1) * DAY_MS);
    }
  } else {
    from = new Date(today.getTime() - (preset.days - 1) * DAY_MS);
  }
  const lengthDays = Math.round((to.getTime() - from.getTime()) / DAY_MS) + 1;
  const prevTo = new Date(from.getTime() - DAY_MS);
  const prevFrom = new Date(prevTo.getTime() - (lengthDays - 1) * DAY_MS);
  return {
    rangeKey: preset.key,
    label: preset.key === "custom"
      ? `${analyticsDayKey(from)} – ${analyticsDayKey(to)}`
      : preset.label,
    fromDay: analyticsDayKey(from),
    toDay: analyticsDayKey(to),
    prevFromDay: analyticsDayKey(prevFrom),
    prevToDay: analyticsDayKey(prevTo),
    lengthDays
  };
}

export function listDaysBetween(fromDay = "", toDay = "") {
  const from = parseDayKey(fromDay);
  const to = parseDayKey(toDay);
  if (!from || !to || from.getTime() > to.getTime()) return [];
  const days = [];
  for (let time = from.getTime(); time <= to.getTime(); time += DAY_MS) {
    days.push(analyticsDayKey(new Date(time)));
    if (days.length > MAX_CUSTOM_DAYS + 2) break;
  }
  return days;
}

function num(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function mergeCounterMap(target = {}, source = {}) {
  Object.entries(source && typeof source === "object" ? source : {}).forEach(([key, value]) => {
    if (value && typeof value === "object") {
      target[key] = mergeCounterMap(target[key] && typeof target[key] === "object" ? target[key] : {}, value);
      return;
    }
    if (typeof value === "string") {
      // Namensfelder (z. B. products.<id>.name): letzter Wert gewinnt.
      target[key] = value;
      return;
    }
    target[key] = num(target[key]) + num(value);
  });
  return target;
}

// Fasst eine Liste von analyticsDaily-Docs zu einer Summary zusammen.
export function summarizeAnalyticsDays(days = []) {
  const merged = {
    counters: {},
    uniques: {},
    profileSources: {},
    contacts: {},
    hourly: {},
    posts: {},
    products: {},
    categories: {},
    tables: {},
    orders: {}
  };
  const byDay = new Map();
  (Array.isArray(days) ? days : []).forEach((docData) => {
    if (!docData || typeof docData !== "object") return;
    const dayKey = String(docData.date || docData.id || "").trim();
    if (dayKey) byDay.set(dayKey, docData);
    mergeCounterMap(merged.counters, docData.counters);
    mergeCounterMap(merged.uniques, docData.uniques);
    mergeCounterMap(merged.profileSources, docData.profileSources);
    mergeCounterMap(merged.contacts, docData.contacts);
    mergeCounterMap(merged.hourly, docData.hourly);
    mergeCounterMap(merged.posts, docData.posts);
    mergeCounterMap(merged.products, docData.products);
    mergeCounterMap(merged.categories, docData.categories);
    mergeCounterMap(merged.tables, docData.tables);
    mergeCounterMap(merged.orders, docData.orders);
  });
  const counters = merged.counters;
  const orders = merged.orders;
  const ordersCompleted = num(orders.completed);
  const revenue = Math.round(num(orders.revenue) * 100) / 100;
  const summary = {
    profileViews: num(counters.business_profile_view),
    uniqueVisitors: num(merged.uniques.business_profile_view),
    contactClicks: num(counters.profile_contact_click),
    postImpressions: num(counters.post_impression),
    postClicks: num(counters.post_click),
    postLikes: num(counters.post_like),
    postShares: num(counters.post_share),
    menuOpens: num(counters.menu_open),
    categoryOpens: num(counters.category_open),
    productViews: num(counters.product_view),
    qrScans: num(counters.qr_scan),
    waiterCalls: num(counters.call_waiter_click),
    ordersStarted: num(counters.order_started),
    ordersCompleted,
    revenue,
    avgOrderValue: ordersCompleted > 0 ? Math.round((revenue / ordersCompleted) * 100) / 100 : 0,
    ordersQr: num(orders.qr),
    ordersExternal: num(orders.external),
    feedImpressions: num(counters.feed_impression),
    feedClicks: num(counters.feed_click)
  };
  summary.feedCtr = summary.feedImpressions > 0
    ? Math.round((summary.feedClicks / summary.feedImpressions) * 1000) / 10
    : 0;
  summary.orderConversion = summary.menuOpens > 0
    ? Math.round((summary.ordersCompleted / summary.menuOpens) * 1000) / 10
    : 0;
  return { summary, merged, byDay };
}

// Klassifiziert einen Ladefehler und liefert eine verstaendliche Meldung.
// Permission-Fehler werden klar benannt (nicht als generischer Fehler getarnt),
// alles andere bekommt eine neutrale Meldung. Wird von Social und Heart geteilt.
export function describeAnalyticsError(error = null) {
  const code = String(error?.code || "").trim().toLowerCase();
  const message = String(error?.message || "").trim().toLowerCase();
  const isPermission = code === "permission-denied"
    || code.endsWith("/permission-denied")
    || message.includes("missing or insufficient permissions")
    || message.includes("permission_denied");
  if (isPermission) {
    return {
      kind: "permission",
      message: "Kein Zugriff auf diese Analytics. Bitte prüfen, ob die Berechtigung (Business-Owner oder CEO) korrekt ist."
    };
  }
  const isNetwork = code === "unavailable"
    || message.includes("network")
    || message.includes("offline")
    || message.includes("failed to fetch");
  if (isNetwork) {
    return {
      kind: "network",
      message: "Verbindung unterbrochen. Bitte Internetverbindung prüfen und erneut versuchen."
    };
  }
  // Reine Validierungsfehler (kein Firestore-Fehlercode) behalten ihre
  // aussagekraeftige Original-Meldung, z. B. "Ungültiger Zeitraum …".
  const original = String(error?.message || "").trim();
  if (!code && original) {
    return { kind: "validation", message: original };
  }
  return {
    kind: "unknown",
    message: "Analytics konnten nicht geladen werden. Bitte erneut versuchen."
  };
}

export function computeDeltaPercent(current = 0, previous = 0) {
  const cur = num(current);
  const prev = num(previous);
  if (prev <= 0) return cur > 0 ? null : 0; // null = "neu", kein sinnvoller Prozentwert
  return Math.round(((cur - prev) / prev) * 1000) / 10;
}

export function formatDeltaLabel(delta) {
  if (delta === null) return "neu";
  const value = num(delta);
  if (value === 0) return "±0 %";
  const sign = value > 0 ? "+" : "−";
  return `${sign}${Math.abs(value).toLocaleString("de-DE")} %`;
}

export function formatCompactNumber(value = 0) {
  const parsed = num(value);
  const abs = Math.abs(parsed);
  if (abs >= 1000000) return `${(parsed / 1000000).toLocaleString("de-DE", { maximumFractionDigits: 1 })} Mio.`;
  if (abs >= 10000) return `${(parsed / 1000).toLocaleString("de-DE", { maximumFractionDigits: 1 })}k`;
  return parsed.toLocaleString("de-DE", { maximumFractionDigits: abs < 100 ? 2 : 0 });
}

// Tages-Zeitreihe fuer eine Kennzahl (fehlende Tage = 0).
export function buildDailySeries({ fromDay = "", toDay = "", byDay = new Map(), resolveValue = () => 0 } = {}) {
  return listDaysBetween(fromDay, toDay).map((dayKey) => {
    const docData = byDay.get(dayKey) || null;
    return { day: dayKey, value: num(resolveValue(docData)) };
  });
}

export function buildTopProducts(merged = {}, limitCount = 8) {
  return Object.entries(merged.products || {})
    .map(([productId, data]) => ({
      productId,
      name: String(data?.name || "").trim() || productId,
      views: num(data?.views),
      likes: num(data?.likes),
      orders: num(data?.orders),
      quantity: num(data?.quantity),
      revenue: Math.round(num(data?.revenue) * 100) / 100
    }))
    .sort((a, b) => (b.views + b.orders * 3) - (a.views + a.orders * 3))
    .slice(0, limitCount);
}

export function buildLowAttentionProducts(merged = {}, limitCount = 5) {
  const rows = Object.entries(merged.products || {})
    .map(([productId, data]) => ({
      productId,
      name: String(data?.name || "").trim() || productId,
      views: num(data?.views),
      orders: num(data?.orders)
    }))
    .sort((a, b) => (a.views + a.orders * 3) - (b.views + b.orders * 3));
  return rows.slice(0, limitCount);
}

export function buildTopPosts(merged = {}, limitCount = 8) {
  return Object.entries(merged.posts || {})
    .map(([postId, data]) => {
      const impressions = num(data?.impressions);
      const clicks = num(data?.clicks);
      return {
        postId,
        impressions,
        clicks,
        likes: num(data?.likes),
        shares: num(data?.shares),
        ctr: impressions > 0 ? Math.round((clicks / impressions) * 1000) / 10 : 0
      };
    })
    .sort((a, b) => (b.impressions + b.clicks * 2) - (a.impressions + a.clicks * 2))
    .slice(0, limitCount);
}

const SOURCE_LABELS = Object.freeze({
  feed: "Feed",
  restaurants: "Restaurant-Tab",
  search: "Suche",
  map: "Karte",
  qr: "QR-Code",
  external: "Externe Links",
  direct: "Direkt",
  other: "Sonstige"
});

export function buildSourceBreakdown(merged = {}) {
  const entries = Object.entries(merged.profileSources || {})
    .map(([key, value]) => ({
      key,
      label: SOURCE_LABELS[key] || key,
      count: num(value)
    }))
    .filter((row) => row.count > 0)
    .sort((a, b) => b.count - a.count);
  const total = entries.reduce((sum, row) => sum + row.count, 0);
  return entries.map((row) => ({
    ...row,
    share: total > 0 ? Math.round((row.count / total) * 1000) / 10 : 0
  }));
}

export function buildHourlyDistribution(merged = {}, field = "qrScans") {
  const hourly = merged.hourly && typeof merged.hourly === "object" ? merged.hourly : {};
  return Array.from({ length: 24 }, (_, hour) => ({
    hour,
    value: num(hourly[String(hour)]?.[field])
  }));
}

export function buildTableBreakdown(merged = {}, limitCount = 12) {
  return Object.entries(merged.tables || {})
    .map(([tableKey, data]) => ({
      tableKey,
      label: /^t\d+$/.test(tableKey) ? `Tisch ${tableKey.slice(1)}` : tableKey,
      qrScans: num(data?.qrScans),
      waiterCalls: num(data?.waiterCalls),
      ordersCompleted: num(data?.ordersCompleted)
    }))
    .sort((a, b) => (b.qrScans + b.ordersCompleted) - (a.qrScans + a.ordersCompleted))
    .slice(0, limitCount);
}

export function buildCategoryBreakdown(merged = {}, limitCount = 10) {
  return Object.entries(merged.categories || {})
    .map(([categoryId, data]) => ({
      categoryId,
      name: String(data?.name || "").trim() || categoryId,
      opens: num(data?.opens)
    }))
    .sort((a, b) => b.opens - a.opens)
    .slice(0, limitCount);
}

export function buildConversionFunnel(summary = {}) {
  const steps = [
    { key: "menuOpens", label: "Menü geöffnet", value: num(summary.menuOpens) },
    { key: "productViews", label: "Produkt angesehen", value: num(summary.productViews) },
    { key: "ordersStarted", label: "Bestellung gestartet", value: num(summary.ordersStarted) },
    { key: "ordersCompleted", label: "Bestellung abgeschlossen", value: num(summary.ordersCompleted) }
  ];
  const base = steps[0].value;
  return steps.map((step, index) => {
    const prev = index === 0 ? step.value : steps[index - 1].value;
    return {
      ...step,
      shareOfFirst: base > 0 ? Math.round((step.value / base) * 1000) / 10 : 0,
      dropFromPrev: index === 0 || prev <= 0
        ? 0
        : Math.max(0, Math.round(((prev - step.value) / prev) * 1000) / 10)
    };
  });
}

// Komplettes Dashboard-Modell aus aktuellen + Vorperioden-Docs.
export function buildAnalyticsDashboardModel({
  range = null,
  currentDays = [],
  previousDays = []
} = {}) {
  if (!range) return null;
  const current = summarizeAnalyticsDays(currentDays);
  const previous = summarizeAnalyticsDays(previousDays);
  const kpiKeys = [
    "profileViews",
    "uniqueVisitors",
    "menuOpens",
    "productViews",
    "postImpressions",
    "qrScans",
    "waiterCalls",
    "ordersCompleted",
    "revenue",
    "feedImpressions"
  ];
  const deltas = {};
  kpiKeys.forEach((key) => {
    deltas[key] = computeDeltaPercent(current.summary[key], previous.summary[key]);
  });
  const hasAnyData = Object.values(current.summary).some((value) => num(value) > 0);
  return {
    range,
    summary: current.summary,
    previousSummary: previous.summary,
    deltas,
    hasAnyData,
    trend: {
      profileViews: buildDailySeries({
        fromDay: range.fromDay,
        toDay: range.toDay,
        byDay: current.byDay,
        resolveValue: (docData) => docData?.counters?.business_profile_view
      }),
      menuOpens: buildDailySeries({
        fromDay: range.fromDay,
        toDay: range.toDay,
        byDay: current.byDay,
        resolveValue: (docData) => docData?.counters?.menu_open
      })
    },
    funnel: buildConversionFunnel(current.summary),
    topProducts: buildTopProducts(current.merged),
    lowProducts: buildLowAttentionProducts(current.merged),
    topPosts: buildTopPosts(current.merged),
    sources: buildSourceBreakdown(current.merged),
    categories: buildCategoryBreakdown(current.merged),
    tables: buildTableBreakdown(current.merged),
    hourlyQr: buildHourlyDistribution(current.merged, "qrScans"),
    hourlyWaiter: buildHourlyDistribution(current.merged, "waiterCalls"),
    hourlyOrders: buildHourlyDistribution(current.merged, "ordersCompleted"),
    contacts: {
      phone: num(current.merged.contacts?.phone),
      address: num(current.merged.contacts?.address),
      map: num(current.merged.contacts?.map),
      hours: num(current.merged.contacts?.hours),
      social: num(current.merged.contacts?.social)
    }
  };
}
