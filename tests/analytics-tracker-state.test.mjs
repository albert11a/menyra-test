import test from "node:test";
import assert from "node:assert/strict";

import {
  __resetAnalyticsTrackerForTests,
  __getAnalyticsQueueForTests,
  observeAnalyticsState,
  trackAnalyticsEvent
} from "../apps/menyra-social/core/analytics/analytics-tracker.js";

function createDocStub() {
  return {
    referrer: "",
    visibilityState: "visible",
    addEventListener() {},
    querySelectorAll() { return []; }
  };
}

function createWindowStub() {
  return {
    location: { host: "mnyra.app" },
    addEventListener() {}
    // bewusst KEIN setTimeout: es darf kein Flush-Timer in Tests entstehen
  };
}

function setup(state) {
  __resetAnalyticsTrackerForTests({
    state,
    windowObj: createWindowStub(),
    documentObj: createDocStub()
  });
  return state;
}

test("profile view transition tracks business_profile_view with feed source", () => {
  const state = setup({ activeTab: "feed", userProfile: {}, user: null });
  observeAnalyticsState();
  state.activeTab = "profile";
  state.profileView = { profile: { restaurantId: "resto-1" } };
  observeAnalyticsState();
  const queue = __getAnalyticsQueueForTests();
  const view = queue.find((event) => event.name === "business_profile_view");
  assert.ok(view, "profile view event expected");
  assert.equal(view.businessId, "resto-1");
  assert.equal(view.source, "feed");
  // Feed-Quelle erzeugt zusaetzlich einen feed_click
  assert.ok(queue.some((event) => event.name === "feed_click" && event.businessId === "resto-1"));
});

test("re-render without state change does not double count", () => {
  const state = setup({ activeTab: "feed", userProfile: {}, user: null });
  observeAnalyticsState();
  state.activeTab = "profile";
  state.profileView = { profile: { restaurantId: "resto-1" } };
  observeAnalyticsState();
  observeAnalyticsState();
  observeAnalyticsState();
  const views = __getAnalyticsQueueForTests().filter((event) => event.name === "business_profile_view");
  assert.equal(views.length, 1);
});

test("qr entry tracks qr_scan once per session with table id", () => {
  const state = setup({ activeTab: "", userProfile: {}, user: null });
  observeAnalyticsState();
  state.activeTab = "profile";
  state.profileView = {
    profile: { restaurantId: "resto-2" },
    menuAccessSource: "qr",
    tableNumber: 5
  };
  observeAnalyticsState();
  const queue = __getAnalyticsQueueForTests();
  const scan = queue.find((event) => event.name === "qr_scan");
  assert.ok(scan, "qr_scan expected");
  assert.equal(scan.tableId, "t5");
  const view = queue.find((event) => event.name === "business_profile_view");
  assert.equal(view.source, "qr");

  // Zweiter Einstieg in derselben Session: kein zweiter qr_scan (Dedupe).
  state.profileView = null;
  observeAnalyticsState();
  state.profileView = {
    profile: { restaurantId: "resto-2" },
    menuAccessSource: "qr",
    tableNumber: 5
  };
  observeAnalyticsState();
  const scans = __getAnalyticsQueueForTests().filter((event) => event.name === "qr_scan");
  assert.equal(scans.length, 1);
});

test("menu open and product view transitions are tracked", () => {
  const state = setup({ activeTab: "profile", userProfile: {}, user: null });
  state.profileView = { profile: { restaurantId: "resto-3" } };
  state.profileTopTab = "profile";
  observeAnalyticsState();
  state.profileTopTab = "menu";
  observeAnalyticsState();
  state.menuDetail = { open: true, item: { id: "item-9", name: "Burger" }, restaurantId: "resto-3" };
  observeAnalyticsState();
  const queue = __getAnalyticsQueueForTests();
  assert.ok(queue.some((event) => event.name === "menu_open" && event.businessId === "resto-3"));
  const product = queue.find((event) => event.name === "product_view");
  assert.equal(product.productId, "item-9");
  assert.equal(product.productName, "Burger");
});

test("checkout open tracks order_started with qr context", () => {
  const state = setup({ activeTab: "profile", userProfile: {}, user: null });
  state.profileView = { profile: { restaurantId: "resto-4" } };
  observeAnalyticsState();
  state.shopCart = { checkoutOpen: true, restaurantId: "resto-4", tableNumber: 3, serviceMode: "table" };
  observeAnalyticsState();
  const started = __getAnalyticsQueueForTests().find((event) => event.name === "order_started");
  assert.ok(started, "order_started expected");
  assert.equal(started.source, "qr");
  assert.equal(started.tableId, "t3");
});

test("own business views are never tracked", () => {
  const state = setup({
    activeTab: "feed",
    userProfile: { restaurantId: "resto-own" },
    user: { uid: "owner-1" }
  });
  observeAnalyticsState();
  state.activeTab = "profile";
  state.profileView = { profile: { restaurantId: "resto-own" } };
  observeAnalyticsState();
  assert.equal(__getAnalyticsQueueForTests().length, 0);
  assert.equal(trackAnalyticsEvent("menu_open", { businessId: "resto-own" }), false);
});

test("ceo profiles do not pollute analytics", () => {
  const state = setup({
    activeTab: "feed",
    userProfile: { role: "ceo" },
    user: { uid: "ceo-1" }
  });
  observeAnalyticsState();
  state.activeTab = "profile";
  state.profileView = { profile: { restaurantId: "resto-5" } };
  observeAnalyticsState();
  assert.equal(__getAnalyticsQueueForTests().length, 0);
});

test("trackAnalyticsEvent validates event names and attaches session", () => {
  setup({ activeTab: "feed", userProfile: {}, user: { uid: "user-7" } });
  assert.equal(trackAnalyticsEvent("not_a_real_event", { businessId: "r" }), false);
  assert.equal(trackAnalyticsEvent("call_waiter_click", { businessId: "resto-6", tableNumber: 2 }), true);
  const event = __getAnalyticsQueueForTests().find((entry) => entry.name === "call_waiter_click");
  assert.equal(event.userId, "user-7");
  assert.ok(event.sessionId);
  assert.equal(event.tableId, "t2");
});
