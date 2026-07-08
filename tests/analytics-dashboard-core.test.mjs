import test from "node:test";
import assert from "node:assert/strict";

import {
  resolveAnalyticsRange,
  listDaysBetween,
  summarizeAnalyticsDays,
  computeDeltaPercent,
  formatDeltaLabel,
  buildDailySeries,
  buildTopProducts,
  buildTopPosts,
  buildSourceBreakdown,
  buildHourlyDistribution,
  buildConversionFunnel,
  buildAnalyticsDashboardModel,
  describeAnalyticsError
} from "../apps/menyra-social/core/analytics/analytics-dashboard-core.js";

const NOW = new Date(2026, 6, 8, 15, 0); // 2026-07-08

test("range presets resolve current and previous period", () => {
  const range = resolveAnalyticsRange({ rangeKey: "7d", now: NOW });
  assert.equal(range.fromDay, "2026-07-02");
  assert.equal(range.toDay, "2026-07-08");
  assert.equal(range.prevFromDay, "2026-06-25");
  assert.equal(range.prevToDay, "2026-07-01");
  assert.equal(range.lengthDays, 7);

  const today = resolveAnalyticsRange({ rangeKey: "today", now: NOW });
  assert.equal(today.fromDay, "2026-07-08");
  assert.equal(today.toDay, "2026-07-08");
  assert.equal(today.prevFromDay, "2026-07-07");
});

test("custom range validates and clamps to today", () => {
  assert.equal(resolveAnalyticsRange({ rangeKey: "custom", customFrom: "", customTo: "", now: NOW }), null);
  assert.equal(resolveAnalyticsRange({ rangeKey: "custom", customFrom: "2026-07-05", customTo: "2026-07-01", now: NOW }), null);
  const range = resolveAnalyticsRange({ rangeKey: "custom", customFrom: "2026-07-01", customTo: "2026-12-31", now: NOW });
  assert.equal(range.fromDay, "2026-07-01");
  assert.equal(range.toDay, "2026-07-08");
});

test("listDaysBetween is inclusive", () => {
  assert.deepEqual(listDaysBetween("2026-07-06", "2026-07-08"), ["2026-07-06", "2026-07-07", "2026-07-08"]);
  assert.deepEqual(listDaysBetween("2026-07-08", "2026-07-06"), []);
});

function sampleDay(date, overrides = {}) {
  return {
    date,
    counters: {
      business_profile_view: 10,
      menu_open: 6,
      product_view: 4,
      order_started: 2,
      order_completed: 1,
      qr_scan: 3,
      call_waiter_click: 1,
      post_impression: 20,
      post_click: 5,
      feed_impression: 30,
      feed_click: 3,
      ...(overrides.counters || {})
    },
    uniques: { business_profile_view: 7 },
    profileSources: { feed: 4, qr: 3, direct: 3 },
    hourly: { 13: { qrScans: 2 }, 20: { qrScans: 1, ordersCompleted: 1 } },
    posts: { post1: { impressions: 12, clicks: 4, likes: 2 }, post2: { impressions: 8, clicks: 1 } },
    products: {
      p1: { views: 3, orders: 1, quantity: 2, revenue: 15, name: "Pizza" },
      p2: { views: 1, orders: 0, name: "Salat" }
    },
    tables: { t4: { qrScans: 2, ordersCompleted: 1 } },
    orders: { started: 2, completed: 1, revenue: 15, itemCount: 2, qr: 1 }
  };
}

test("summarize merges days and computes derived metrics", () => {
  const { summary } = summarizeAnalyticsDays([sampleDay("2026-07-07"), sampleDay("2026-07-08")]);
  assert.equal(summary.profileViews, 20);
  assert.equal(summary.uniqueVisitors, 14);
  assert.equal(summary.menuOpens, 12);
  assert.equal(summary.ordersCompleted, 2);
  assert.equal(summary.revenue, 30);
  assert.equal(summary.avgOrderValue, 15);
  assert.equal(summary.feedCtr, 10);
  assert.equal(summary.orderConversion, 16.7);
});

test("delta percent and label handle zero previous", () => {
  assert.equal(computeDeltaPercent(112, 100), 12);
  assert.equal(computeDeltaPercent(80, 100), -20);
  assert.equal(computeDeltaPercent(5, 0), null);
  assert.equal(computeDeltaPercent(0, 0), 0);
  assert.equal(formatDeltaLabel(12), "+12 %");
  assert.equal(formatDeltaLabel(-20), "−20 %");
  assert.equal(formatDeltaLabel(null), "neu");
});

test("daily series fills missing days with zero", () => {
  const { byDay } = summarizeAnalyticsDays([sampleDay("2026-07-08")]);
  const series = buildDailySeries({
    fromDay: "2026-07-06",
    toDay: "2026-07-08",
    byDay,
    resolveValue: (doc) => doc?.counters?.business_profile_view
  });
  assert.deepEqual(series.map((p) => p.value), [0, 0, 10]);
});

test("top lists, sources, funnel and hourly work on merged data", () => {
  const { summary, merged } = summarizeAnalyticsDays([sampleDay("2026-07-08")]);
  const products = buildTopProducts(merged);
  assert.equal(products[0].productId, "p1");
  assert.equal(products[0].name, "Pizza");
  const posts = buildTopPosts(merged);
  assert.equal(posts[0].postId, "post1");
  assert.equal(posts[0].ctr, 33.3);
  const sources = buildSourceBreakdown(merged);
  assert.equal(sources[0].key, "feed");
  assert.equal(sources.reduce((sum, row) => sum + row.share, 0) > 99, true);
  const hourly = buildHourlyDistribution(merged, "qrScans");
  assert.equal(hourly.length, 24);
  assert.equal(hourly[13].value, 2);
  const funnel = buildConversionFunnel(summary);
  assert.equal(funnel[0].value, 6);
  assert.equal(funnel[3].value, 1);
  assert.ok(funnel[3].shareOfFirst > 0);
});

test("dashboard model compares against previous period", () => {
  const range = resolveAnalyticsRange({ rangeKey: "today", now: NOW });
  const model = buildAnalyticsDashboardModel({
    range,
    currentDays: [sampleDay("2026-07-08", { counters: { business_profile_view: 22 } })],
    previousDays: [sampleDay("2026-07-07")]
  });
  assert.equal(model.summary.profileViews, 22);
  assert.equal(model.deltas.profileViews, 120);
  assert.equal(model.hasAnyData, true);
  assert.equal(model.trend.profileViews.length, 1);

  const emptyModel = buildAnalyticsDashboardModel({ range, currentDays: [], previousDays: [] });
  assert.equal(emptyModel.hasAnyData, false);
});

test("describeAnalyticsError classifies permission, network and validation", () => {
  assert.equal(describeAnalyticsError({ code: "permission-denied" }).kind, "permission");
  assert.equal(
    describeAnalyticsError({ message: "Missing or insufficient permissions." }).kind,
    "permission"
  );
  assert.equal(describeAnalyticsError({ code: "unavailable" }).kind, "network");
  // Reine Validierungsmeldung ohne Firestore-Code bleibt erhalten.
  const validation = describeAnalyticsError(new Error("Ungültiger Zeitraum: Bitte Von/Bis prüfen."));
  assert.equal(validation.kind, "validation");
  assert.match(validation.message, /Ungültiger Zeitraum/);
  assert.equal(describeAnalyticsError({}).kind, "unknown");
});
