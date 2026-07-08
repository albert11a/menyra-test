import test from "node:test";
import assert from "node:assert/strict";

import {
  ANALYTICS_EVENT_NAMES,
  isKnownAnalyticsEvent,
  normalizeAnalyticsSource,
  sanitizeAnalyticsMapKey,
  analyticsTableKey,
  analyticsDayKey,
  buildAnalyticsEvent,
  buildDailyIncrementPlan,
  applyIncrementPlanToPatch
} from "../apps/menyra-social/core/analytics/analytics-event-schema.js";

test("canonical event names are defined", () => {
  for (const name of [
    "business_profile_view",
    "post_impression",
    "post_click",
    "menu_open",
    "product_view",
    "qr_scan",
    "call_waiter_click",
    "order_started",
    "order_completed"
  ]) {
    assert.equal(isKnownAnalyticsEvent(name), true, `${name} should be known`);
  }
  assert.equal(isKnownAnalyticsEvent("unknown_event"), false);
  assert.ok(ANALYTICS_EVENT_NAMES.length >= 14);
});

test("sources normalize to the fixed source set", () => {
  assert.equal(normalizeAnalyticsSource("qr"), "qr");
  assert.equal(normalizeAnalyticsSource("table-qr"), "qr");
  assert.equal(normalizeAnalyticsSource("home"), "feed");
  assert.equal(normalizeAnalyticsSource(""), "direct");
  assert.equal(normalizeAnalyticsSource("weird-source"), "other");
});

test("map keys are sanitized for firestore paths", () => {
  assert.equal(sanitizeAnalyticsMapKey("a.b/c~d"), "a_b_c_d");
  assert.equal(sanitizeAnalyticsMapKey("  spaced key  "), "spaced_key");
  assert.equal(analyticsTableKey("", 12), "t12");
  assert.equal(analyticsTableKey("t5", 0), "t5");
  assert.equal(analyticsTableKey("", 0), "");
});

test("buildAnalyticsEvent requires known name and businessId", () => {
  const now = new Date(2026, 6, 8, 13, 30);
  assert.equal(buildAnalyticsEvent("nope", { businessId: "r1" }), null);
  assert.equal(buildAnalyticsEvent("menu_open", {}), null);
  const event = buildAnalyticsEvent("menu_open", { businessId: "r1", source: "qr", tableNumber: 4 }, {
    now,
    sessionId: "sess-1",
    userId: "user-1"
  });
  assert.equal(event.name, "menu_open");
  assert.equal(event.businessId, "r1");
  assert.equal(event.day, analyticsDayKey(now));
  assert.equal(event.day, "2026-07-08");
  assert.equal(event.hour, 13);
  assert.equal(event.source, "qr");
  assert.equal(event.tableId, "t4");
  assert.equal(event.sessionId, "sess-1");
  assert.equal(event.userId, "user-1");
});

test("daily increment plan aggregates order_completed with items and revenue", () => {
  const event = buildAnalyticsEvent("order_completed", {
    businessId: "r1",
    source: "qr",
    tableNumber: 7,
    value: 24.5,
    quantity: 3,
    items: [
      { productId: "p1", name: "Pizza", quantity: 2, revenue: 18 },
      { productId: "p2", name: "Cola", quantity: 1, revenue: 6.5 }
    ]
  }, { now: new Date(2026, 6, 8, 20, 5), sessionId: "s" });
  const plan = buildDailyIncrementPlan(event);
  const patch = applyIncrementPlanToPatch({}, plan, (n) => n);
  assert.equal(patch.counters.order_completed, 1);
  assert.equal(patch.orders.completed, 1);
  assert.equal(patch.orders.qr, 1);
  assert.equal(patch.orders.revenue, 24.5);
  assert.equal(patch.orders.itemCount, 3);
  assert.equal(patch.hourly["20"].ordersCompleted, 1);
  assert.equal(patch.tables.t7.ordersCompleted, 1);
  assert.equal(patch.products.p1.orders, 1);
  assert.equal(patch.products.p1.quantity, 2);
  assert.equal(patch.products.p1.revenue, 18);
  assert.equal(patch.products.p1.name, "Pizza");
  assert.equal(patch.products.p2.revenue, 6.5);
});

test("unique flag only counts for whitelisted events", () => {
  const uniqueView = buildAnalyticsEvent("business_profile_view", { businessId: "r1", isUnique: true }, { now: new Date() });
  const planA = buildDailyIncrementPlan(uniqueView);
  const patchA = applyIncrementPlanToPatch({}, planA, (n) => n);
  assert.equal(patchA.uniques.business_profile_view, 1);

  const clickEvent = buildAnalyticsEvent("post_click", { businessId: "r1", postId: "post9", isUnique: true }, { now: new Date() });
  const planB = buildDailyIncrementPlan(clickEvent);
  const patchB = applyIncrementPlanToPatch({}, planB, (n) => n);
  assert.equal(patchB.uniques, undefined);
  assert.equal(patchB.posts.post9.clicks, 1);
});

test("profile view records its source bucket", () => {
  const event = buildAnalyticsEvent("business_profile_view", { businessId: "r1", source: "feed" }, { now: new Date() });
  const patch = applyIncrementPlanToPatch({}, buildDailyIncrementPlan(event), (n) => n);
  assert.equal(patch.profileSources.feed, 1);
  assert.equal(patch.counters.business_profile_view, 1);
});
