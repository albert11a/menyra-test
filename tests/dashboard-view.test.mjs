import test from "node:test";
import assert from "node:assert/strict";

import {
  resolveBusinessTypeLabelCore,
  resolveDashboardKindCore,
  resolveDashboardGreetingCore,
  buildDashboardQuickActionsCore,
  buildDashboardKpiDefsCore,
  renderDashboardGreeting,
  renderDashboardOfferCard,
  renderDashboardCatalogCard,
  renderDashboardQuickActions,
  renderDashboardKpis,
  renderDashboardRecentPosts,
  renderDashboardDataSkeleton,
  renderDashboardMetricCards,
  renderDashboardErrorState,
  renderDashboardNoBusinessState,
  DASHBOARD_CSS
} from "../apps/menyra-social/core/dashboard/dashboard-render-utils.js";
import { resolveBusinessDashboardStartTabCore } from "../apps/menyra-social/core/auth/session-tab-guards.js";
import {
  normalizeDashboardPostCore,
  buildDashboardModelCore,
  buildDashboardMetricCardsCore,
  resolveBestDashboardPostCore,
  resolveDashboardSubscriptionCore,
  resolveDashboardCoverUrlCore,
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
  const restaurant = buildDashboardQuickActionsCore({ kind: "restaurant", isOwner: true });
  const restaurantNavs = restaurant.map((a) => `${a.nav}:${a.label}`);
  assert.ok(restaurantNavs.some((entry) => entry.includes("Ndrysho menune")));
  assert.ok(restaurant.some((a) => a.nav === "businessAccounts"));
  assert.ok(restaurant.some((a) => a.nav === "settings"));

  const hotel = buildDashboardQuickActionsCore({ kind: "hotel", isOwner: false });
  assert.ok(hotel.some((a) => a.label === "Hotel & Dhoma"));
  assert.ok(!hotel.some((a) => a.nav === "businessAccounts"));

  const shop = buildDashboardQuickActionsCore({ kind: "shop", isOwner: false });
  assert.ok(shop.some((a) => a.label === "Ndrysho dyqanin"));
});

// Vier Kacheln sind raus, weil es sie woanders schon gibt: Beitrag und Story
// oeffnet die Posting-Karte darueber, Porosite und Analytics stehen im
// Drawer (Analytics ausserdem als "Gjithe analitika" ueber den Kennzahlen).
// Kaeme eine davon zurueck, stuende sie doppelt in der Seite.
test("post, story, orders and analytics are not quick actions anymore", () => {
  const alleArten = ["restaurant", "hotel", "shop"].flatMap((kind) => [
    ...buildDashboardQuickActionsCore({ kind, isOwner: true }),
    ...buildDashboardQuickActionsCore({ kind, isOwner: false })
  ]);
  ["upload", "orders", "analytics"].forEach((nav) => {
    assert.equal(
      alleArten.some((action) => action.nav === nav),
      false,
      `${nav} steht wieder im Schnellzugriff`
    );
  });
  // Und keine Kachel traegt noch eine Upload-Absicht.
  assert.equal(alleArten.some((action) => action.uploadIntent), false);
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

test("greeting renders the hello line with the logo in it and the day-part line below", () => {
  const html = renderDashboardGreeting({ name: "Bro Pizza", logoUrl: "https://img/logo.jpg", hour: 12 });
  // Erste Zeile: "Përshëndetje," (eigener Span) und direkt daneben das Logo -
  // der Name steht nicht mehr als Text daneben, er haengt am Bild.
  assert.ok(html.includes('<span class="mnyra-dash__greet-hello">Përshëndetje,</span>'));
  assert.ok(html.indexOf("mnyra-dash__greet-logo") > html.indexOf("mnyra-dash__greet-hello"));
  assert.ok(html.indexOf("mnyra-dash__greet-logo") < html.indexOf("mnyra-dash__greet-sub"));
  assert.ok(html.includes('alt="Bro Pizza"'));
  assert.ok(html.includes("Ju urojmë një ditë të mbarë!"));
  assert.ok(html.includes("https://img/logo.jpg"));
  assert.ok(html.includes("mnyra-dash__greet"));
  // Bewusst keine Card-Klassen um den Gruss.
  assert.ok(!html.includes("mnyra-dash__state"));
});

test("greeting without a logo keeps the fallback in the hello line", () => {
  const html = renderDashboardGreeting({ name: "Bro Pizza", hour: 12 });
  assert.ok(html.includes("mnyra-dash__greet-logo-fallback"));
  assert.ok(html.includes('title="Bro Pizza"'));
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

test("quick action tiles carry data-nav", () => {
  const html = renderDashboardQuickActions({
    actions: buildDashboardQuickActionsCore({ kind: "restaurant", isOwner: false })
  });
  assert.ok(html.includes('data-nav="menu"'));
  assert.ok(html.includes('data-nav="settings"'));
  assert.ok(html.includes("Ndrysho menune"));
  // Das kaufmaennische Und steht escaped in der Seite.
  assert.ok(html.includes("Oferta &amp; Reklama"));
  // Keine Upload-Absicht mehr an den Kacheln.
  assert.equal(html.includes("data-upload-intent"), false);
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
  assert.ok(empty.includes("Ende nuk ka postime"));
  assert.ok(empty.includes('data-nav="upload"'));
});

test("skeleton mirrors kpi count and states render", () => {
  const skeleton = renderDashboardDataSkeleton({ kpiCount: 6 });
  const tiles = skeleton.match(/min-height:86px/g) || [];
  assert.equal(tiles.length, 6);
  assert.ok(renderDashboardErrorState({}).includes("data-dashboard-retry"));
  assert.ok(renderDashboardNoBusinessState().includes("Nuk ka profil biznesi te lidhur"));
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
  assert.ok(html.includes("Nuk ka profil biznesi te lidhur"));
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
  assert.ok(!html.includes("Nuk ka profil biznesi te lidhur"));
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
      getRestaurantMetaByIdFn: () => ({ name: "Casa Rita", city: "Prishtina" })
    }
  });
  const html = controller.renderDashboardView();
  assert.ok(html.includes("Casa Rita"));
  assert.ok(html.includes("Ndrysho menune"));
  assert.ok(html.includes('data-nav="businessAccounts"'));
  assert.ok(html.includes("mnyra-dash__skeleton"));
  assert.equal(state.dashboardView.status, "loading");
});

// Unter der schwarzen Karte steht genau eine Flaeche, und darin steht alles:
// Schnellzugriffe, Kennzahlen, letzte Beitraege. Nichts davon darf daneben auf
// dem Panel-Hintergrund landen.
test("shortcuts, numbers and latest posts all sit inside the one bento", () => {
  const state = {
    userProfile: { restaurantId: "r1", name: "Casa Rita" },
    user: { uid: "u1" },
    activeTab: "dashboard",
    dashboardView: {
      status: "ready",
      error: "",
      loadedSignature: "",
      model: {
        day: "2026-07-11",
        week: { profileViews: 240 },
        today: { profileViews: 31 },
        posts: [{ id: "p1", caption: "Pizza Napoli", mediaType: "image", thumbUrl: "", likesCount: 1, commentsCount: 0, impressions: 0, dateLabel: "10.07." }]
      }
    }
  };
  const controller = createDashboardViewController({
    state,
    documentObj: null,
    profileApi: {
      getBusinessProfileTypeFn: () => "restaurant",
      isShopCatalogProfileFn: () => false,
      isBusinessOwnerProfileFn: () => true,
      canAccessRestaurantOrdersFn: () => true,
      getRestaurantMetaByIdFn: () => ({ name: "Casa Rita" })
    }
  });
  const html = controller.renderDashboardView();

  // Genau ein Bento.
  assert.equal((html.match(/mnyra-dash__bento/g) || []).length, 1);
  // Ueber dem Bento steht nur noch die Kennzahl-Reihe, im Bento alles andere -
  // die Posting-Karte als erstes darin.
  const bento = html.indexOf("mnyra-dash__bento");
  assert.ok(html.indexOf("data-dashboard-metrics") < bento, "die Kennzahl-Reihe steht ueber dem Bento");
  ["mnyra-dash__composer ", "mnyra-dash__actions", "data-dashboard-kpis", "data-dashboard-posts"].forEach((marke) => {
    assert.ok(html.indexOf(marke) > bento, `${marke} steht nicht im Bento`);
  });
  // Und in dieser Reihenfolge: Karte, Schnellzugriffe, Kennzahlen, Beitraege.
  assert.ok(html.indexOf("mnyra-dash__composer ") < html.indexOf("mnyra-dash__actions"));
  assert.ok(html.indexOf("mnyra-dash__actions") < html.indexOf("data-dashboard-kpis"));
  assert.ok(html.indexOf("data-dashboard-kpis") < html.indexOf("data-dashboard-posts"));
  // Und die Ueberschrift ueber den Kacheln ist weg.
  assert.equal(html.includes("Schnellzugriff"), false);
  // Unter der Posting-Karte stehen die Offerten- und die Katalog-Karte, alle
  // drei in derselben Form (mnyra-dash__composer) und noch vor den
  // Schnellzugriffen.
  const offerCard = html.indexOf("data-dashboard-offer-card");
  const catalogCard = html.indexOf("data-dashboard-catalog-card");
  assert.ok(offerCard > html.indexOf("data-dashboard-composer-card"), "die Offerten-Karte steht unter der Posting-Karte");
  assert.ok(catalogCard > offerCard, "die Katalog-Karte steht unter der Offerten-Karte");
  assert.ok(catalogCard < html.indexOf("mnyra-dash__actions"), "beide Karten stehen ueber den Schnellzugriffen");
  assert.equal((html.match(/mnyra-dash__composer /g) || []).length, 3);
  // Die Abschnitte, die es weiter gibt, behalten ihre Ueberschrift.
  assert.ok(html.includes("Letzte 7 Tage"));
  assert.ok(html.includes("Letzte Beiträge"));
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

// Der Composer ist ein eigener Chunk. Beim ersten Tap auf "+ Posto" waere das
// Nachladen eine Netzrunde mitten in der Geste - deshalb holt das Dashboard
// ihn im Leerlauf vor. Nur bei ausdruecklich sparsamer Verbindung nicht.
function createPrefetchHarness({ connection = null } = {}) {
  const idleTasks = [];
  const timeouts = [];
  const documentObj = {
    defaultView: {
      navigator: connection ? { connection } : {},
      requestIdleCallback: (fn, options) => {
        idleTasks.push({ fn, options });
        return idleTasks.length;
      },
      setTimeout: (fn, ms) => {
        timeouts.push({ fn, ms });
        return timeouts.length;
      }
    },
    addEventListener: () => {},
    getElementById: () => null,
    querySelector: () => null,
    head: { appendChild: () => {} },
    createElement: () => ({ setAttribute: () => {}, appendChild: () => {}, style: {} })
  };
  const state = {
    userProfile: { restaurantId: "r1", name: "Casa Rita" },
    user: { uid: "u1" },
    activeTab: "dashboard"
  };
  let prewarmCount = 0;
  const controller = createDashboardViewController({
    state,
    documentObj,
    storageObj: { getItem: () => null, setItem: () => {} },
    composerApi: { prewarmFn: () => { prewarmCount += 1; } },
    profileApi: {
      getBusinessProfileTypeFn: () => "restaurant",
      isShopCatalogProfileFn: () => false,
      isBusinessOwnerProfileFn: () => true,
      canAccessRestaurantOrdersFn: () => true,
      getRestaurantMetaByIdFn: () => ({ name: "Casa Rita", city: "Prishtina" })
    }
  });
  return { controller, idleTasks, timeouts, prewarmCount: () => prewarmCount };
}

test("dashboard prefetches the composer while the browser is idle", () => {
  const harness = createPrefetchHarness();

  harness.controller.renderDashboardView();
  assert.equal(harness.idleTasks.length, 1, "der Vorabruf haengt am Leerlauf, nicht am Render");
  assert.ok(Number(harness.idleTasks[0].options?.timeout) > 0, "und kommt auch ohne Leerlauf irgendwann dran");

  harness.idleTasks[0].fn();
  assert.equal(harness.prewarmCount(), 1, "die Upload-Runtime waermt mit vor");

  // Weitere Renders starten kein zweites Vorladen.
  harness.controller.renderDashboardView();
  harness.controller.renderDashboardView();
  assert.equal(harness.idleTasks.length, 1);
});

test("a data saver connection keeps the composer on demand", () => {
  const saveData = createPrefetchHarness({ connection: { saveData: true, effectiveType: "4g" } });
  saveData.controller.renderDashboardView();
  assert.equal(saveData.idleTasks.length, 0);
  assert.equal(saveData.timeouts.length, 0);

  const slow = createPrefetchHarness({ connection: { saveData: false, effectiveType: "2g" } });
  slow.controller.renderDashboardView();
  assert.equal(slow.idleTasks.length, 0);

  // 3G ist kein Sparmodus - dort lohnt der Vorabruf besonders.
  const normal = createPrefetchHarness({ connection: { saveData: false, effectiveType: "3g" } });
  normal.controller.renderDashboardView();
  assert.equal(normal.idleTasks.length, 1);
});

// ---------------------------------------------------------------------------
// Die Kennzahl-Reihe unter der Begruessung.
// ---------------------------------------------------------------------------

test("the best post is the one with the widest reach, not the newest", () => {
  const posts = [
    { id: "neu", impressions: 10, likesCount: 0, createdAtMs: 900 },
    { id: "stark", impressions: 400, likesCount: 2, createdAtMs: 100 },
    { id: "mittel", impressions: 90, likesCount: 30, createdAtMs: 500 }
  ];
  assert.equal(resolveBestDashboardPostCore(posts).id, "stark");
  // Bei gleicher Reichweite entscheiden die Likes, dann das juengere Datum.
  assert.equal(resolveBestDashboardPostCore([
    { id: "a", impressions: 5, likesCount: 1, createdAtMs: 900 },
    { id: "b", impressions: 5, likesCount: 9, createdAtMs: 100 }
  ]).id, "b");
  assert.equal(resolveBestDashboardPostCore([
    { id: "alt", impressions: 5, likesCount: 1, createdAtMs: 100 },
    { id: "neu", impressions: 5, likesCount: 1, createdAtMs: 900 }
  ]).id, "neu");
  assert.equal(resolveBestDashboardPostCore([]), null);
  assert.equal(resolveBestDashboardPostCore(null), null);
});

test("the model carries the best post beyond the three newest ones", () => {
  // Der beste Beitrag steht NICHT unter den drei juengsten - er darf trotzdem
  // nicht verloren gehen, sonst zeigt die Karte den falschen.
  const model = buildDashboardModelCore({
    days: [{ date: "2026-07-11", counters: {}, posts: { alt: { impressions: 999 } } }],
    todayKey: "2026-07-11",
    rawPosts: [
      { id: "p4", data: { caption: "d", createdAtClient: "2026-07-11T10:00:00Z" } },
      { id: "p3", data: { caption: "c", createdAtClient: "2026-07-10T10:00:00Z" } },
      { id: "p2", data: { caption: "b", createdAtClient: "2026-07-09T10:00:00Z" } },
      { id: "alt", data: { caption: "a", createdAtClient: "2026-07-01T10:00:00Z" } }
    ]
  });
  assert.equal(model.posts.length, 3);
  assert.equal(model.posts.some((post) => post.id === "alt"), false);
  assert.equal(model.bestPost.id, "alt");
  assert.equal(model.bestPost.impressions, 999);
});

test("without an explicit subscription the paid cards stay locked", () => {
  // Es gibt noch kein Abo-Feld: im Zweifel NEIN.
  assert.equal(resolveDashboardSubscriptionCore({}), false);
  assert.equal(resolveDashboardSubscriptionCore({ profile: {}, restaurant: {} }), false);
  assert.equal(resolveDashboardSubscriptionCore({ restaurant: { plan: "free" } }), false);
  assert.equal(resolveDashboardSubscriptionCore({ restaurant: { subscriptionActive: "ja" } }), false);
  // Und ja, sobald es ausdruecklich dasteht.
  assert.equal(resolveDashboardSubscriptionCore({ restaurant: { subscriptionActive: true } }), true);
  assert.equal(resolveDashboardSubscriptionCore({ restaurant: { plan: "pro" } }), true);
  assert.equal(resolveDashboardSubscriptionCore({ profile: { subscriptionPlan: "Premium" } }), true);
  assert.equal(resolveDashboardSubscriptionCore({ profile: { isSubscriber: true } }), true);
});

test("cover image follows the same chain the crm view reads", () => {
  assert.equal(resolveDashboardCoverUrlCore({ titleImageUrl: "a", coverUrl: "b" }), "a");
  assert.equal(resolveDashboardCoverUrlCore({ coverImageUrl: "b", heroUrl: "c" }), "b");
  assert.equal(resolveDashboardCoverUrlCore({ heroUrl: "c" }), "c");
  assert.equal(resolveDashboardCoverUrlCore({}), "");
  assert.equal(resolveDashboardCoverUrlCore(null), "");
});

test("four metric cards, two of them behind the paid plan", () => {
  const model = {
    today: { profileViews: 31, menuOpens: 12, qrScans: 7 },
    bestPost: { id: "p1", thumbUrl: "https://img/post.jpg", impressions: 1240 }
  };
  const cards = buildDashboardMetricCardsCore({
    model,
    coverUrl: "https://img/cover.jpg",
    subscribed: true,
    assets: { menuImageUrl: "/menu.jpg", qrImageUrl: "/qr.jpg" }
  });
  assert.deepEqual(cards.map((card) => card.key), ["bestPost", "profileViews", "menuOpens", "qrScans"]);
  // Kurz und auf Albanisch - jede Beschriftung passt in eine Zeile.
  assert.deepEqual(cards.map((card) => card.label), [
    "Postimi", "Profili sot", "Menyja sot", "Skanime sot"
  ]);
  // Beim Beitrag sagt ein Auge vor der Zahl, worum es geht - nur dort.
  assert.deepEqual(cards.map((card) => !!card.withEye), [true, false, false, false]);
  // Mit Abo tragen alle vier ihre Zahl, keine ist verschlossen.
  assert.deepEqual(cards.map((card) => card.value), ["1.240", "31", "12", "7"]);
  assert.equal(cards.some((card) => card.locked), false);
  // Jede Karte hat ihr Bild: Beitrag, Titelbild, und die beiden festen.
  assert.deepEqual(cards.map((card) => card.imageUrl), [
    "https://img/post.jpg", "https://img/cover.jpg", "/menu.jpg", "/qr.jpg"
  ]);

  // Ohne Abo sind genau die beiden hinteren Karten zu - und tragen KEINE Zahl
  // im Markup, nicht nur eine unscharfe.
  const locked = buildDashboardMetricCardsCore({ model, subscribed: false });
  assert.deepEqual(locked.map((card) => !!card.locked), [false, false, true, true]);
  const html = renderDashboardMetricCards({ cards: locked });
  assert.ok(html.includes('data-dashboard-metric-locked="menuOpens"'));
  assert.ok(html.includes('data-dashboard-metric-locked="qrScans"'));
  assert.ok(html.includes("Me pagesë"));
  assert.equal(html.includes(">12<"), false, "die verschlossene Zahl darf nicht im Markup stehen");
  assert.equal(html.includes(">7<"), false, "die verschlossene Zahl darf nicht im Markup stehen");
  // Eine verschlossene Karte navigiert nicht - sie oeffnet nur den Hinweis.
  const lockedBlock = html.slice(html.indexOf('data-dashboard-metric-locked="menuOpens"'));
  assert.equal(lockedBlock.slice(0, lockedBlock.indexOf("</button>")).includes("data-nav"), false);
});

test("while the numbers load the layout is already there", () => {
  // Genau das Verhalten von Qyteti und Lokalet: was sofort feststeht, steht
  // sofort da - nur die Zahl wartet.
  const cards = buildDashboardMetricCardsCore({ model: null, coverUrl: "https://img/cover.jpg", subscribed: true });
  // Der beste Beitrag hat ohne Daten noch kein Bild -> Platzhalter.
  assert.equal(cards[0].pending, true);
  // Die anderen stehen mit Bild und Beschriftung da, nur die Zahl fehlt noch.
  assert.equal(cards[1].pending, undefined);
  assert.equal(cards[1].loading, true);
  assert.equal(cards[1].imageUrl, "https://img/cover.jpg");
  const html = renderDashboardMetricCards({ cards });
  assert.ok(html.includes("mnyra-dash__hl-card--pending"));
  assert.ok(html.includes("mnyra-dash__hl-value--pending"));
  assert.ok(html.includes("Profili sot"), "die Beschriftung steht sofort da");

  // Verschlossene Karten warten auf gar nichts: sie zeigen ohnehin keine Zahl.
  const lockedCards = buildDashboardMetricCardsCore({ model: null, subscribed: false });
  assert.equal(lockedCards[2].loading, false);
  assert.equal(lockedCards[3].loading, false);
});

test("the metric row runs to both screen edges but starts in the panel flush", () => {
  const block = (selector) => {
    const start = DASHBOARD_CSS.indexOf(selector);
    assert.ok(start > -1, `${selector} fehlt`);
    return DASHBOARD_CSS.slice(start, DASHBOARD_CSS.indexOf("}", start));
  };
  // Die negative Marge ist genau das Seitenpolster von .mnyra-dash, das
  // Polster darin schiebt die erste Karte wieder in die Flucht.
  const row = block(".mnyra-dash__hl {");
  assert.ok(row.includes("margin: 18px -28px 0;"), row);
  assert.ok(row.includes("padding: 0 28px;"), row);
  assert.ok(row.includes("overflow-x: auto;"), row);
  // Die Reihe verschluckt das senkrechte Scrollen der Seite nicht.
  assert.ok(row.includes("touch-action: manipulation;"), row);
  // Zweieinhalb Karten im Bild.
  const card = block(".mnyra-dash__hl-card {");
  assert.ok(card.includes("flex: 0 0 calc((100% + 28px - 20px) / 2.5);"), card);
  // Der Verlauf liegt genau ueber dem Bildfenster und macht dessen Unterkante
  // weiss - das Bild geht ins Weiss der Karte ueber, statt mit einer Linie zu
  // enden.
  const fade = block(".mnyra-dash__hl-fade {");
  assert.ok(
    fade.includes("linear-gradient(0deg, #ffffff 0%, rgba(255, 255, 255, 0.92) 12%, rgba(255, 255, 255, 0.55) 30%, rgba(255, 255, 255, 0.16) 52%, rgba(255, 255, 255, 0) 75%)"),
    fade
  );
  // Und die Karte selbst ist weiss, nicht dunkelblau - sie gehoert zur hellen
  // Seite, nicht zur schwarzen Posting-Karte.
  assert.ok(card.includes("background: var(--dash-surface);"), card);
  assert.ok(DASHBOARD_CSS.includes("--dash-surface: #ffffff;"));
  // Darauf steht die Schrift in den Farben der uebrigen Kennzahlen.
  const value = block(".mnyra-dash__hl-value {");
  assert.ok(value.includes("color: var(--dash-ink);"), value);
  const labelColor = block(".mnyra-dash__hl-label {");
  assert.ok(labelColor.includes("color: var(--dash-muted);"), labelColor);
  // Alle Bilder stehen im selben Fenster: eine Hoehe fuer alle vier Karten,
  // damit die Reihe eine Linie haelt.
  const media = block(".mnyra-dash__hl-media {");
  assert.ok(media.includes("width: 100%;"), media);
  assert.ok(media.includes("height: var(--dash-hl-media);"), media);
  assert.ok(media.includes("object-fit: cover;"), media);
  assert.ok(DASHBOARD_CSS.includes("--dash-hl-media: 140px;"));
  // Die Karte ist so hoch wie Bildfenster + Abstand + Textblock + Polster.
  assert.ok(card.includes("height: calc(var(--dash-hl-media) + 74px);"), card);
  // Beschriftung und Zahl stehen UNTER dem Bildfenster, mit Abstand dazu -
  // ganz im Weissen, nicht mit einem Fuss im ausgeblendeten Teil des Bildes.
  const body = block(".mnyra-dash__hl-body {");
  assert.ok(body.includes("top: calc(var(--dash-hl-media) + 14px);"), body);
  assert.equal(body.includes("bottom:"), false, body);
  // Und der Ersatz fuer ein fehlendes Bild fuellt genau dasselbe Fenster -
  // sonst spraenge die Karte, sobald ein Bild fehlt.
  const plate = block(".mnyra-dash__hl-plate {");
  assert.ok(plate.includes("height: var(--dash-hl-media);"), plate);

  // Keine Beschriftung darf auf zwei Zeilen laufen - das wuerde die Zahl
  // darunter nach unten druecken.
  const label = block(".mnyra-dash__hl-label {");
  assert.ok(label.includes("white-space: nowrap;"), label);
  assert.ok(label.includes("text-overflow: ellipsis;"), label);
  // Und eine verschlossene Karte zeichnet ihr Bild NICHT weich - verschlossen
  // ist die Zahl, nicht das Motiv. Im ganzen Panel wird kein Bild
  // weichgezeichnet; das einzige Weichzeichnen ist der Glas-Grund hinter dem
  // Schild und hinter dem Hinweis.
  // backdrop-filter enthaelt "filter:" - fuer diese Frage zaehlt nur das
  // Weichzeichnen des Elements selbst, deshalb faellt der Glas-Grund vorher raus.
  const ohneGlas = DASHBOARD_CSS.replace(/(-webkit-)?backdrop-filter/g, "glasgrund");
  assert.equal(ohneGlas.includes("filter: blur("), false, "kein Bild im Panel wird weichgezeichnet");
  // Das Schild steht auf der hellen Karte dunkel gefuellt - ein Glas-Grund
  // waere auf Weiss nicht zu sehen.
  const lock = block(".mnyra-dash__hl-lock {");
  assert.ok(lock.includes("background: var(--dash-black);"), lock);
  assert.ok(lock.includes("color: var(--dash-black-ink);"), lock);
});

test("a locked card opens the notice and closes it again", () => {
  const clickHandlers = [];
  const documentObj = {
    getElementById: () => ({}),
    addEventListener: (type, handler) => { if (type === "click") clickHandlers.push(handler); },
    head: { appendChild: () => {} },
    createElement: () => ({})
  };
  const state = {
    userProfile: { restaurantId: "r1", name: "Casa Rita" },
    user: { uid: "u1" },
    activeTab: "dashboard",
    dashboardView: { status: "ready", error: "", loadedSignature: "", paywall: "", model: { day: "", week: {}, today: {}, posts: [], bestPost: null } }
  };
  let renders = 0;
  const controller = createDashboardViewController({
    state,
    documentObj,
    renderFn: () => { renders += 1; },
    profileApi: {
      getBusinessProfileTypeFn: () => "restaurant",
      isShopCatalogProfileFn: () => false,
      isBusinessOwnerProfileFn: () => true,
      canAccessRestaurantOrdersFn: () => true,
      getRestaurantMetaByIdFn: () => ({ name: "Casa Rita" })
    }
  });
  // Ohne Abo sind die beiden Karten zu, der Hinweis ist es auch.
  let html = controller.renderDashboardView();
  assert.ok(html.includes('data-dashboard-metric-locked="qrScans"'));
  assert.equal(html.includes("data-dashboard-paywall"), false);

  assert.equal(clickHandlers.length, 1, "die Klick-Delegation haengt genau einmal");
  const fire = (attr, value) => clickHandlers[0]({
    preventDefault: () => {},
    target: { closest: (sel) => (sel === `[${attr}]` ? { getAttribute: () => value } : null) }
  });

  fire("data-dashboard-metric-locked", "qrScans");
  assert.equal(state.dashboardView.paywall, "qrScans");
  assert.ok(renders > 0);
  html = controller.renderDashboardView();
  assert.ok(html.includes("data-dashboard-paywall"));
  assert.ok(html.includes("QR-Scans"));

  fire("data-dashboard-paywall-close", "");
  assert.equal(state.dashboardView.paywall, "");
  assert.equal(controller.renderDashboardView().includes("data-dashboard-paywall"), false);
});

// Ein Kontowechsel ist ein Schnitt: das Panel des vorigen Lokals darf keinen
// Moment laenger stehenbleiben. Genau das ist es hier gewesen - der beste
// Beitrag und die Zahlen des Tages blieben vom alten Konto stehen, und es kam
// nicht einmal ein Neuladen in Gang, weil der Status noch auf "ready" stand.
test("switching accounts drops the panel of the previous business", () => {
  const state = {
    userProfile: { restaurantId: "r1", name: "Casa Rita" },
    user: { uid: "u1" },
    activeTab: "dashboard",
    dashboardView: {
      status: "ready",
      error: "",
      loadedSignature: "r1::2026-07-11",
      restaurantId: "r1",
      paywall: "qrScans",
      model: {
        day: "2026-07-11",
        week: { profileViews: 240 },
        today: { profileViews: 999, menuOpens: 888, qrScans: 777 },
        posts: [],
        bestPost: { id: "p1", thumbUrl: "https://img/casa-rita.jpg", impressions: 4321 }
      }
    }
  };
  const controller = createDashboardViewController({
    state,
    documentObj: null,
    profileApi: {
      getBusinessProfileTypeFn: () => "restaurant",
      isShopCatalogProfileFn: () => false,
      isBusinessOwnerProfileFn: () => true,
      canAccessRestaurantOrdersFn: () => true,
      getRestaurantMetaByIdFn: (id) => ({ name: id === "r1" ? "Casa Rita" : "Bro Pizza" })
    }
  });

  // Erst das eine Lokal: seine Zahlen und sein bester Beitrag stehen da.
  let html = controller.renderDashboardView();
  assert.ok(html.includes("999"), "die Zahl des ersten Lokals fehlt");
  assert.ok(html.includes("https://img/casa-rita.jpg"));

  // Jetzt das Konto wechseln.
  state.userProfile = { restaurantId: "r2", name: "Bro Pizza" };
  html = controller.renderDashboardView();

  // Nichts vom vorigen Lokal darf uebrig sein - weder eine Zahl noch sein Bild.
  ["999", "888", "777", "4.321", "https://img/casa-rita.jpg"].forEach((rest) => {
    assert.equal(html.includes(rest), false, `"${rest}" steht noch vom vorigen Lokal da`);
  });
  assert.equal(state.dashboardView.model, null);
  assert.equal(state.dashboardView.restaurantId, "r2");
  assert.equal(state.dashboardView.loadedSignature, "");
  // Auch ein offener Hinweis gehoerte zum alten Konto.
  assert.equal(state.dashboardView.paywall, "");
  // Und der Ladeweg faengt von vorne an, statt auf "ready" stehenzubleiben.
  assert.equal(state.dashboardView.status, "loading");
  // Solange steht der Platzhalter da, nicht die alten Zahlen.
  assert.ok(html.includes("mnyra-dash__hl-card--pending"));
  assert.ok(html.includes("mnyra-dash__skeleton"));
});

test("a load started for the previous business never lands in the new one", async () => {
  const state = {
    userProfile: { restaurantId: "r1" },
    user: { uid: "u1" },
    activeTab: "dashboard"
  };
  let releaseFirstLoad = () => {};
  const firstLoad = new Promise((resolve) => { releaseFirstLoad = resolve; });
  let call = 0;
  const controller = createDashboardViewController({
    state,
    documentObj: null,
    profileApi: {
      getBusinessProfileTypeFn: () => "restaurant",
      isShopCatalogProfileFn: () => false,
      isBusinessOwnerProfileFn: () => true,
      canAccessRestaurantOrdersFn: () => true,
      getRestaurantMetaByIdFn: () => ({ name: "X" })
    },
    firestoreApi: {
      db: {},
      collectionFn: () => ({}),
      queryFn: () => ({}),
      whereFn: () => ({}),
      orderByFn: () => ({}),
      limitFn: () => ({}),
      documentIdFn: () => ({}),
      getDocsFn: async () => {
        call += 1;
        // Der erste Abruf (Lokal 1) haengt, bis der Wechsel passiert ist.
        if (call === 1) await firstLoad;
        return { docs: [] };
      }
    }
  });

  const pending = controller.loadDashboard({ force: true });
  // Waehrend der Abruf laeuft: Konto wechseln.
  state.userProfile = { restaurantId: "r2" };
  controller.renderDashboardView();
  releaseFirstLoad();
  await pending;
  // Der Nachlade-Anstoss des Wechsels haengt an einem Microtask.
  await new Promise((resolve) => setTimeout(resolve, 0));

  // Die Antwort von Lokal 1 darf den Zustand von Lokal 2 nicht fuellen: was
  // am Ende dasteht, gehoert zu r2 - oder ist noch leer, aber nie r1.
  assert.equal(state.dashboardView.restaurantId, "r2");
  const signature = String(state.dashboardView.loadedSignature || "");
  assert.equal(
    signature.startsWith("r1::"),
    false,
    `der Zustand traegt die Signatur des vorigen Lokals: ${signature}`
  );
});

test("without a post the card says so in albanian and leads to the composer", () => {
  const cards = buildDashboardMetricCardsCore({
    model: { today: { profileViews: 4 }, bestPost: null },
    subscribed: true
  });
  const post = cards[0];
  assert.equal(post.emptyText, "S'ka postim");
  // Keine Null, die nichts sagt - und kein Auge ohne Zahl davor.
  assert.equal(post.value, undefined);
  assert.equal(post.withEye, undefined);
  // Die leere Karte fuehrt zum Composer, nicht in die Analyse: eine Zahl, die
  // es noch nicht gibt, dort zu suchen waere ein Weg ins Leere.
  assert.equal(post.composer, "post");
  assert.equal(post.nav, undefined);

  const html = renderDashboardMetricCards({ cards });
  assert.ok(html.includes("S&#39;ka postim"), html.slice(0, 400));
  assert.ok(html.includes('data-dashboard-composer="post"'));
  // Der Apostroph steht escaped im Markup, nicht roh.
  assert.equal(html.includes("S'ka postim"), false);

  // Und sobald es einen Beitrag gibt, steht wieder die Zahl da.
  const mitPost = buildDashboardMetricCardsCore({
    model: { today: {}, bestPost: { id: "p1", impressions: 12, thumbUrl: "https://img/p1.jpg" } },
    subscribed: true
  });
  assert.equal(mitPost[0].emptyText, undefined);
  assert.equal(mitPost[0].value, "12");
  assert.equal(mitPost[0].withEye, true);
});

// Ein Video als bester Beitrag: die Karte zeigt ein Bild, nie einen laufenden
// Film. Beitraege aus dem Composer bringen ein Standbild mit (media.thumbUrl);
// wo keins da ist, holt die Karte den ersten Moment aus dem Video selbst.
test("a video post shows a still, never a running film", () => {
  // Mit Standbild: das ist das Bild der Karte, das Video wird nicht angefasst.
  const mitPoster = normalizeDashboardPostCore("p1", {
    caption: "Pizza",
    media: [{ url: "https://cdn/clip.mp4", type: "video", thumbUrl: "https://cdn/clip.jpg" }]
  });
  assert.equal(mitPoster.mediaType, "video");
  assert.equal(mitPoster.thumbUrl, "https://cdn/clip.jpg");
  assert.equal(mitPoster.videoUrl, "https://cdn/clip.mp4");

  let cards = buildDashboardMetricCardsCore({
    model: { today: {}, bestPost: mitPoster },
    subscribed: true
  });
  assert.equal(cards[0].imageUrl, "https://cdn/clip.jpg");
  assert.equal(cards[0].videoUrl, "", "mit Standbild braucht die Karte das Video nicht");
  let html = renderDashboardMetricCards({ cards });
  assert.equal(html.includes("<video"), false);

  // Ohne Standbild (aeltere Beitraege): der erste Moment aus dem Video.
  const ohnePoster = normalizeDashboardPostCore("p2", {
    caption: "Pizza",
    media: [{ url: "https://cdn/clip.mp4", type: "video" }]
  });
  assert.equal(ohnePoster.thumbUrl, "", "ein Video ist selbst kein Vorschaubild");
  assert.equal(ohnePoster.videoUrl, "https://cdn/clip.mp4");

  cards = buildDashboardMetricCardsCore({
    model: { today: {}, bestPost: ohnePoster },
    subscribed: true
  });
  assert.equal(cards[0].imageUrl, "");
  assert.equal(cards[0].videoUrl, "https://cdn/clip.mp4");
  html = renderDashboardMetricCards({ cards });
  // Nur der Anfang der Datei wird geholt, und daraus genau ein Moment.
  assert.ok(html.includes('src="https://cdn/clip.mp4#t=0.1"'), html);
  assert.ok(html.includes('preload="metadata"'));
  assert.ok(html.includes("muted"));
  assert.ok(html.includes("playsinline"));
  // Nichts, was den Film in Gang setzt oder bedienbar macht.
  ["autoplay", "controls", "loop"].forEach((attr) => {
    assert.equal(html.includes(attr), false, `${attr} steht auf dem Standbild`);
  });

  // Ein Bild-Beitrag bleibt ein Bild - kein Video-Feld im Spiel.
  const bild = normalizeDashboardPostCore("p3", {
    media: [{ url: "https://cdn/foto.jpg", type: "image" }]
  });
  assert.equal(bild.thumbUrl, "https://cdn/foto.jpg");
  assert.equal(bild.videoUrl, "");
});

// Die Offerten-Karte fuehrt in den Offerten-Editor des Business
// ("ofertatbiznes"), nicht in den Kundentab "ofertat". Sie laeuft ueber
// data-nav wie die Kacheln darunter - und traegt bewusst kein
// data-dashboard-composer, sonst finge der Klick-Handler des Dashboards sie ab
// und oeffnete statt des Editors den Composer.
test("the offer card leads to the business offer editor, not to the composer", () => {
  const state = {
    userProfile: { restaurantId: "r1", name: "Casa Rita" },
    user: { uid: "u1" },
    activeTab: "dashboard",
    dashboardView: {
      status: "ready",
      error: "",
      loadedSignature: "",
      model: { day: "2026-07-11", week: {}, today: {}, posts: [] }
    }
  };
  const controller = createDashboardViewController({
    state,
    documentObj: null,
    profileApi: {
      getBusinessProfileTypeFn: () => "restaurant",
      isShopCatalogProfileFn: () => false,
      isBusinessOwnerProfileFn: () => true,
      canAccessRestaurantOrdersFn: () => true,
      getRestaurantMetaByIdFn: () => ({ name: "Casa Rita" })
    }
  });
  const html = controller.renderDashboardView();

  const cardStart = html.indexOf("data-dashboard-offer-card");
  assert.ok(cardStart > -1, "die Offerten-Karte steht im Panel");
  const card = html.slice(html.lastIndexOf("<button", cardStart), html.indexOf("</button>", cardStart));
  assert.ok(card.includes('data-nav="ofertatbiznes"'), card);
  assert.equal(card.includes("data-dashboard-composer"), false, card);
  // Dieselbe Form wie die Posting-Karte, aber in der Farbe der Kacheln.
  assert.ok(card.includes("mnyra-dash__composer--plane"), card);
  // Ueberschrift, Text und die Aktionszeile unten.
  assert.ok(card.includes("Lësho"));
  assert.ok(card.includes("ofertë"));
  assert.ok(card.includes("Krijo një zbritje ose një kupon për klientët e tu."));
  assert.ok(card.includes("mnyra-dash__composer-cta"));
});

// Ohne aufgeloestes Lokal gibt es keinen Editor, in den die Karte fuehren
// koennte - dann steht sie auch nicht da.
test("without a resolved business the offer card stays away", () => {
  assert.equal(renderDashboardOfferCard({ showEditor: false }), "");
});

// Der Katalog-Editor heisst je nach Lokal anders, fuehrt aber immer auf
// denselben Tab. Die Karte darf also nur die Worte wechseln, nicht den Weg.
test("the catalog card speaks the language of the business but keeps one way", () => {
  const wege = ["restaurant", "shop", "hotel"].map((kind) => {
    const html = renderDashboardCatalogCard({ kind });
    assert.ok(html.includes('data-nav="menu"'), kind);
    assert.ok(html.includes("mnyra-dash__composer--plane"), kind);
    // Kein data-dashboard-composer - sonst faengt der Klick-Handler des
    // Dashboards sie ab und oeffnet den Composer statt den Editor.
    assert.equal(html.includes("data-dashboard-composer"), false, kind);
    return html;
  });
  assert.ok(wege[0].includes("menunë"));
  assert.ok(wege[1].includes("dyqanin"));
  assert.ok(wege[2].includes("hotelin"));
  // Das erste Wort traegt bei allen dreien die Farbe.
  wege.forEach((html) => {
    assert.ok(html.includes('<span class="mnyra-dash__composer-accent">Ndrysho</span>'), html);
  });
});

test("an unknown business kind still gets a usable catalog card", () => {
  const html = renderDashboardCatalogCard({ kind: "was-auch-immer" });
  assert.ok(html.includes('data-nav="menu"'));
  assert.ok(html.includes("menunë"));
});

// Ohne aufgeloestes Lokal gibt es keinen Editor, in den die Karten fuehren
// koennten - dann stehen sie auch nicht da.
test("without a resolved business neither editor card shows up", () => {
  assert.equal(renderDashboardOfferCard({ showEditor: false }), "");
  assert.equal(renderDashboardCatalogCard({ showEditor: false }), "");
});
