import test from "node:test";
import assert from "node:assert/strict";

import {
  resolveBusinessTypeLabelCore,
  resolveDashboardKindCore,
  resolveDashboardGreetingCore,
  buildDashboardQuickActionsCore,
  buildDashboardKpiDefsCore,
  renderDashboardGreeting,
  renderDashboardQuickActions,
  renderDashboardKpis,
  renderDashboardRecentPosts,
  renderDashboardDataSkeleton,
  renderDashboardErrorState,
  renderDashboardNoBusinessState
} from "../apps/menyra-social/core/dashboard/dashboard-render-utils.js";
import { resolveBusinessDashboardStartTabCore } from "../apps/menyra-social/core/auth/session-tab-guards.js";
import {
  normalizeDashboardPostCore,
  buildDashboardModelCore,
  createDashboardViewController
} from "../apps/menyra-social/core/dashboard/dashboard-view-controller.js";

test("dashboard kind resolves per business type", () => {
  assert.equal(resolveDashboardKindCore({ businessType: "restaurant" }), "restaurant");
  assert.equal(resolveDashboardKindCore({ businessType: "cafe" }), "restaurant");
  assert.equal(resolveDashboardKindCore({ businessType: "fastfood" }), "restaurant");
  assert.equal(resolveDashboardKindCore({ businessType: "hotel" }), "hotel");
  assert.equal(resolveDashboardKindCore({ businessType: "motel" }), "hotel");
  assert.equal(resolveDashboardKindCore({ businessType: "ecommerce", isShopCatalog: true }), "shop");
  assert.equal(resolveDashboardKindCore({ businessType: "", isShopCatalog: false }), "restaurant");
  // Expliziter Shop-Katalog gewinnt vor dem Typ.
  assert.equal(resolveDashboardKindCore({ businessType: "hotel", isShopCatalog: true }), "shop");
});

test("business type labels are human readable", () => {
  assert.equal(resolveBusinessTypeLabelCore("restaurant"), "Restaurant");
  assert.equal(resolveBusinessTypeLabelCore("ecommerce"), "Online-Shop");
  assert.equal(resolveBusinessTypeLabelCore(""), "Business");
  assert.equal(resolveBusinessTypeLabelCore("bar"), "Bar");
});

test("quick actions are type aware and role aware", () => {
  const restaurant = buildDashboardQuickActionsCore({ kind: "restaurant", isOwner: true, canAccessOrders: true });
  const restaurantNavs = restaurant.map((a) => `${a.nav}:${a.label}`);
  assert.ok(restaurantNavs.some((entry) => entry.includes("Menü bearbeiten")));
  assert.ok(restaurant.some((a) => a.nav === "orders"));
  assert.ok(restaurant.some((a) => a.nav === "businessAccounts"));
  assert.ok(restaurant.some((a) => a.nav === "upload" && a.uploadIntent === "chooser"));
  assert.ok(restaurant.some((a) => a.nav === "upload" && a.uploadIntent === "story"));

  const hotel = buildDashboardQuickActionsCore({ kind: "hotel", isOwner: false, canAccessOrders: false });
  assert.ok(hotel.some((a) => a.label === "Hotel & Zimmer"));
  assert.ok(!hotel.some((a) => a.nav === "orders"));
  assert.ok(!hotel.some((a) => a.nav === "businessAccounts"));

  const shop = buildDashboardQuickActionsCore({ kind: "shop", isOwner: false, canAccessOrders: true });
  assert.ok(shop.some((a) => a.label === "Shop bearbeiten"));
  assert.ok(shop.some((a) => a.nav === "orders"));
});

test("kpi defs are type aware", () => {
  const restaurant = buildDashboardKpiDefsCore("restaurant").map((d) => d.key);
  assert.deepEqual(restaurant.slice(0, 3), ["profileViews", "postImpressions", "contactClicks"]);
  assert.ok(restaurant.includes("qrScans"));
  assert.ok(restaurant.includes("revenue"));

  const hotel = buildDashboardKpiDefsCore("hotel").map((d) => d.key);
  assert.ok(!hotel.includes("qrScans"));
  assert.ok(hotel.includes("uniqueVisitors"));

  const shop = buildDashboardKpiDefsCore("shop").map((d) => d.key);
  assert.ok(shop.includes("productViews"));
  assert.ok(shop.includes("revenue"));
});

test("greeting resolves albanian day part by hour", () => {
  assert.deepEqual(resolveDashboardGreetingCore(5), { dayPart: "mengjes", text: "Ju urojmë një mëngjes të mbarë!" });
  assert.equal(resolveDashboardGreetingCore(10).dayPart, "mengjes");
  assert.deepEqual(resolveDashboardGreetingCore(11), { dayPart: "dite", text: "Ju urojmë një ditë të mbarë!" });
  assert.equal(resolveDashboardGreetingCore(17).dayPart, "dite");
  assert.deepEqual(resolveDashboardGreetingCore(18), { dayPart: "mbremje", text: "Ju urojmë një mbrëmje të mbarë!" });
  assert.equal(resolveDashboardGreetingCore(21).dayPart, "mbremje");
  assert.deepEqual(resolveDashboardGreetingCore(22), { dayPart: "nate", text: "Ju urojmë një natë të mbarë!" });
  assert.equal(resolveDashboardGreetingCore(4).dayPart, "nate");
  assert.equal(resolveDashboardGreetingCore(0).dayPart, "nate");
  // Ungueltige Stunde -> sicherer Tages-Gruss.
  assert.equal(resolveDashboardGreetingCore(NaN).dayPart, "dite");
});

test("greeting renders logo, name line and day-part line without card", () => {
  const html = renderDashboardGreeting({ name: "Bro Pizza", logoUrl: "https://img/logo.jpg", hour: 12 });
  // "Përshëndetje," traegt die Social-Blau-Farbe (eigener Span), Name dahinter.
  assert.ok(html.includes('<span class="mnyra-dash__greet-hello">Përshëndetje,</span> Bro Pizza'));
  assert.ok(html.includes("Ju urojmë një ditë të mbarë!"));
  assert.ok(html.includes("https://img/logo.jpg"));
  assert.ok(html.includes("mnyra-dash__greet"));
  // Bewusst keine Card-Klassen um den Gruss.
  assert.ok(!html.includes("mnyra-dash__state"));
});

test("greeting escapes html in names", () => {
  const html = renderDashboardGreeting({ name: "<script>x</script>", hour: 9 });
  assert.ok(!html.includes("<script>x"));
  assert.ok(html.includes("&lt;script&gt;"));
});

test("business dashboard start tab decision", () => {
  const businessProfile = { restaurantId: "r1" };
  // Business ohne Deep-Link auf Default-Tab -> anwenden.
  assert.equal(resolveBusinessDashboardStartTabCore({
    uid: "u1", userProfile: businessProfile, activeTab: "feed"
  }), "apply");
  // Bereits fuer diese UID entschieden -> nie wieder umleiten.
  assert.equal(resolveBusinessDashboardStartTabCore({
    uid: "u1", appliedUid: "u1", userProfile: businessProfile, activeTab: "feed"
  }), "skip");
  // Kein User -> spaeter erneut pruefen.
  assert.equal(resolveBusinessDashboardStartTabCore({ uid: "" }), "retry");
  // Profil noch ohne restaurantId (laedt noch) -> retry.
  assert.equal(resolveBusinessDashboardStartTabCore({
    uid: "u1", userProfile: {}, activeTab: "feed"
  }), "retry");
  // Expliziter Deep-Link/Tab gewinnt und beendet die Entscheidung.
  assert.equal(resolveBusinessDashboardStartTabCore({
    uid: "u1", userProfile: businessProfile, activeTab: "orders"
  }), "skip");
  assert.equal(resolveBusinessDashboardStartTabCore({
    uid: "u1", userProfile: businessProfile, activeTab: "feed", pendingInitialTab: "menu"
  }), "skip");
  assert.equal(resolveBusinessDashboardStartTabCore({
    uid: "u1", userProfile: businessProfile, activeTab: "feed", pendingProfileRestaurantId: "r9"
  }), "skip");
  assert.equal(resolveBusinessDashboardStartTabCore({
    uid: "u1", userProfile: businessProfile, activeTab: "feed", pendingPostId: "p1"
  }), "skip");
  assert.equal(resolveBusinessDashboardStartTabCore({
    uid: "u1", userProfile: businessProfile, activeTab: "feed", hasProfileView: true
  }), "skip");
  // Waiter-only/blockierte Staff-Accounts nie umleiten.
  assert.equal(resolveBusinessDashboardStartTabCore({
    uid: "u1", userProfile: { restaurantId: "r1", socialAccessMode: "waiteronly" }, activeTab: "feed"
  }), "skip");
  // Staff mit staffRestaurantId zaehlt als Business.
  assert.equal(resolveBusinessDashboardStartTabCore({
    uid: "u1", userProfile: { staffRestaurantId: "r1" }, activeTab: ""
  }), "apply");
});

test("quick action tiles carry data-nav and upload intent", () => {
  const html = renderDashboardQuickActions({
    actions: buildDashboardQuickActionsCore({ kind: "restaurant", isOwner: false, canAccessOrders: false })
  });
  assert.ok(html.includes('data-nav="upload" data-upload-intent="chooser"'));
  assert.ok(html.includes('data-nav="upload" data-upload-intent="story"'));
  assert.ok(html.includes('data-nav="menu"'));
  assert.ok(html.includes('data-nav="analytics"'));
  assert.ok(html.includes('data-nav="settings"'));
});

test("kpi grid renders week value with today line", () => {
  const html = renderDashboardKpis({
    kpiDefs: buildDashboardKpiDefsCore("restaurant"),
    week: { profileViews: 240, revenue: 1250.5, ordersCompleted: 18, qrScans: 33, postImpressions: 900, contactClicks: 12 },
    today: { profileViews: 31, revenue: 89, ordersCompleted: 2, qrScans: 4, postImpressions: 120, contactClicks: 1 }
  });
  assert.ok(html.includes("Profilaufrufe"));
  assert.ok(html.includes("240"));
  assert.ok(html.includes("Heute: 31"));
  assert.ok(html.includes("€"));
  assert.ok(html.includes('data-nav="analytics"'));
});

test("recent posts render meta and empty state offers CTA", () => {
  const filled = renderDashboardRecentPosts({
    posts: [{
      id: "p1",
      caption: "Pizza Napoli",
      thumbUrl: "https://img/p1.jpg",
      mediaType: "image",
      likesCount: 12,
      commentsCount: 3,
      impressions: 480,
      dateLabel: "10.07."
    }]
  });
  assert.ok(filled.includes("Pizza Napoli"));
  assert.ok(filled.includes("12 Likes"));
  assert.ok(filled.includes("480"));

  const empty = renderDashboardRecentPosts({ posts: [] });
  assert.ok(empty.includes("Noch keine Beiträge"));
  assert.ok(empty.includes('data-nav="upload"'));
});

test("skeleton mirrors kpi count and states render", () => {
  const skeleton = renderDashboardDataSkeleton({ kpiCount: 6 });
  const tiles = skeleton.match(/min-height:86px/g) || [];
  assert.equal(tiles.length, 6);
  assert.ok(renderDashboardErrorState({}).includes("data-dashboard-retry"));
  assert.ok(renderDashboardNoBusinessState().includes("Kein Business-Profil verbunden"));
});

test("post normalization handles media, dates and status", () => {
  const post = normalizeDashboardPostCore("p1", {
    caption: "  Hallo  ",
    media: [{ url: "https://img/full.jpg", type: "image" }],
    likesCount: "7",
    commentsCount: null,
    createdAtClient: "2026-07-10T10:00:00.000Z"
  });
  assert.equal(post.caption, "Hallo");
  assert.equal(post.thumbUrl, "https://img/full.jpg");
  assert.equal(post.likesCount, 7);
  assert.equal(post.commentsCount, 0);
  assert.ok(post.dateLabel.includes("07"));

  const video = normalizeDashboardPostCore("p2", {
    media: [{ url: "https://img/v.mp4", type: "video", thumbUrl: "https://img/poster.jpg" }]
  });
  assert.equal(video.mediaType, "video");
  assert.equal(video.thumbUrl, "https://img/poster.jpg");
});

test("dashboard model aggregates week, today and post impressions", () => {
  const days = [
    {
      id: "2026-07-10",
      date: "2026-07-10",
      counters: { business_profile_view: 10, post_impression: 100, profile_contact_click: 2 },
      orders: { completed: 3, revenue: 45 },
      posts: { p1: { impressions: 60 } }
    },
    {
      id: "2026-07-11",
      date: "2026-07-11",
      counters: { business_profile_view: 5, post_impression: 40, profile_contact_click: 1 },
      orders: { completed: 1, revenue: 12 },
      posts: { p1: { impressions: 20 } }
    }
  ];
  const rawPosts = [
    { id: "p1", data: { caption: "A", createdAtClient: "2026-07-11T09:00:00.000Z", media: [{ url: "u", type: "image" }] } },
    { id: "p2", data: { caption: "B", createdAtClient: "2026-07-09T09:00:00.000Z", media: [{ url: "u2", type: "image" }] } },
    { id: "p3", data: { caption: "C", createdAtClient: "2026-07-08T09:00:00.000Z" } },
    { id: "p4", data: { caption: "D", createdAtClient: "2026-07-07T09:00:00.000Z" } }
  ];
  const model = buildDashboardModelCore({ days, todayKey: "2026-07-11", rawPosts });
  assert.equal(model.day, "2026-07-11");
  assert.equal(model.week.profileViews, 15);
  assert.equal(model.week.ordersCompleted, 4);
  assert.equal(model.week.revenue, 57);
  assert.equal(model.today.profileViews, 5);
  assert.equal(model.today.ordersCompleted, 1);
  // Nur die 3 neuesten Posts, sortiert, mit Wochen-Impressionen gemerged.
  assert.equal(model.posts.length, 3);
  assert.equal(model.posts[0].id, "p1");
  assert.equal(model.posts[0].impressions, 80);
  assert.equal(model.posts[1].impressions, 0);
});

test("controller renders no-business state without restaurant id", () => {
  const state = { userProfile: {}, user: null, activeTab: "dashboard" };
  const controller = createDashboardViewController({ state, documentObj: null });
  const html = controller.renderDashboardView();
  assert.ok(html.includes("Kein Business-Profil verbunden"));
  assert.ok(html.includes("data-dashboard-root"));
});

test("controller renders skeleton while auth bootstrap is resolving", () => {
  const state = {
    userProfile: {},
    user: { uid: "u1" },
    activeTab: "dashboard",
    __authBootstrapInFlightUid: "u1"
  };
  const controller = createDashboardViewController({ state, documentObj: null });
  const html = controller.renderDashboardView();
  assert.ok(!html.includes("Kein Business-Profil verbunden"));
  assert.ok(html.includes("mnyra-dash__skeleton"));
});

test("controller renders hero and actions immediately for business, data as skeleton", () => {
  const state = {
    userProfile: { restaurantId: "r1", name: "Casa Rita", location: "Prishtina" },
    user: { uid: "u1" },
    activeTab: "dashboard"
  };
  const controller = createDashboardViewController({
    state,
    documentObj: null,
    profileApi: {
      getBusinessProfileTypeFn: () => "restaurant",
      isShopCatalogProfileFn: () => false,
      isBusinessOwnerProfileFn: () => true,
      canAccessRestaurantOrdersFn: () => true,
      getRestaurantMetaByIdFn: () => ({ name: "Casa Rita", city: "Prishtina" })
    }
  });
  const html = controller.renderDashboardView();
  assert.ok(html.includes("Casa Rita"));
  assert.ok(html.includes("Menü bearbeiten"));
  assert.ok(html.includes('data-nav="orders"'));
  assert.ok(html.includes("mnyra-dash__skeleton"));
  assert.equal(state.dashboardView.status, "loading");
});

test("controller resolves logo through shell avatar chain, never raw avatar", () => {
  const state = {
    userProfile: { restaurantId: "r1", name: "Bro Pizza", avatar: "users/u1/raw-avatar-ref" },
    user: { uid: "u1" },
    activeTab: "dashboard"
  };
  const controller = createDashboardViewController({
    state,
    documentObj: null,
    profileApi: {
      getBusinessProfileTypeFn: () => "restaurant",
      isShopCatalogProfileFn: () => false,
      isBusinessOwnerProfileFn: () => false,
      canAccessRestaurantOrdersFn: () => false,
      getRestaurantMetaByIdFn: () => null,
      resolveOwnAvatarUrlFn: () => "https://cdn.mnyra.com/logo-optimized.jpg"
    }
  });
  const html = controller.renderDashboardView();
  assert.ok(html.includes("https://cdn.mnyra.com/logo-optimized.jpg"));
  assert.ok(!html.includes("raw-avatar-ref"));
});

test("controller falls back to restaurant logo when shell chain is empty", () => {
  const state = {
    userProfile: { restaurantId: "r1", name: "Bro Pizza", avatar: "users/u1/raw-avatar-ref" },
    user: { uid: "u1" },
    activeTab: "dashboard"
  };
  const controller = createDashboardViewController({
    state,
    documentObj: null,
    profileApi: {
      getBusinessProfileTypeFn: () => "restaurant",
      isShopCatalogProfileFn: () => false,
      isBusinessOwnerProfileFn: () => false,
      canAccessRestaurantOrdersFn: () => false,
      getRestaurantMetaByIdFn: () => ({ name: "Bro Pizza" }),
      resolveOwnAvatarUrlFn: () => "",
      resolveRestaurantLogoFn: () => "https://cdn.mnyra.com/rest-logo.jpg"
    }
  });
  const html = controller.renderDashboardView();
  assert.ok(html.includes("https://cdn.mnyra.com/rest-logo.jpg"));
  assert.ok(!html.includes("raw-avatar-ref"));
});

test("controller uses cached model for same day and renders data instantly", () => {
  const model = buildDashboardModelCore({ days: [], todayKey: "2099-01-01", rawPosts: [] });
  const todayKey = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  const dayKey = `${todayKey.getFullYear()}-${pad(todayKey.getMonth() + 1)}-${pad(todayKey.getDate())}`;
  model.day = dayKey;
  const storage = new Map();
  const storageObj = {
    getItem: (key) => (storage.has(key) ? storage.get(key) : null),
    setItem: (key, value) => storage.set(key, String(value))
  };
  storageObj.setItem(`menyra_social_dashboard_cache_v1::r1`, JSON.stringify({ day: dayKey, model }));
  const state = {
    userProfile: { restaurantId: "r1", name: "Casa Rita" },
    user: { uid: "u1" },
    activeTab: "dashboard"
  };
  const controller = createDashboardViewController({
    state,
    documentObj: null,
    storageObj,
    profileApi: {
      getBusinessProfileTypeFn: () => "restaurant",
      isShopCatalogProfileFn: () => false,
      isBusinessOwnerProfileFn: () => false,
      canAccessRestaurantOrdersFn: () => false,
      getRestaurantMetaByIdFn: () => null
    }
  });
  return controller.loadDashboard({ force: false }).then(() => {
    assert.equal(state.dashboardView.status, "ready");
    assert.ok(state.dashboardView.model);
    const html = controller.renderDashboardView();
    assert.ok(html.includes("Letzte 7 Tage"));
    assert.ok(!html.includes("mnyra-dash__skeleton"));
  });
});
