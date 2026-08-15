import test from "node:test";
import assert from "node:assert/strict";

import {
  resolveBusinessTypeLabelCore,
  resolveDashboardKindCore,
  resolveDashboardGreetingCore,
  buildDashboardQuickActionsCore,
  renderDashboardGreeting,
  renderDashboardOfferCard,
  renderDashboardCatalogCard,
  renderDashboardPanelTabs,
  resolveDashboardPanelTabCore,
  renderDashboardQuickActions,
  renderDashboardRecentPosts,
  renderDashboardDataSkeleton,
  renderDashboardMetricCards,
  buildDashboardMetricRowSignatureCore,
  renderDashboardErrorState,
  renderDashboardNoBusinessState,
  DASHBOARD_CSS
} from "../apps/menyra-social/core/dashboard/dashboard-render-utils.js";
import { resolveBusinessDashboardStartTabCore } from "../apps/menyra-social/core/auth/session-tab-guards.js";
import {
  normalizeDashboardPostCore,
  buildDashboardModelCore,
  buildDashboardMetricCardsCore,
  resolveLatestDashboardPostCore,
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

// Der Umriss zeigt nur noch, was auch wirklich kommt: die Beitrags-Liste.
// Die Kennzahlen-Reihe ist in die Analitika gewandert - ein Umriss dafuer
// wuerde hier auf etwas warten, das nie eintrifft.
test("the skeleton mirrors the posts list and nothing else", () => {
  const skeleton = renderDashboardDataSkeleton();
  assert.ok(skeleton.includes("data-dashboard-posts"));
  assert.equal(skeleton.includes("data-dashboard-kpis"), false);
  assert.equal(skeleton.includes("min-height:86px"), false);
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
  ["mnyra-dash__composer ", "mnyra-dash__actions", "data-dashboard-panel-tabs", "data-dashboard-posts"].forEach((marke) => {
    assert.ok(html.indexOf(marke) > bento, `${marke} steht nicht im Bento`);
  });
  // Und in dieser Reihenfolge: Tab-Leiste, Karten, Schnellzugriffe, Beitraege.
  assert.ok(html.indexOf("data-dashboard-panel-tabs") < html.indexOf("mnyra-dash__composer "));
  assert.ok(html.indexOf("mnyra-dash__composer ") < html.indexOf("mnyra-dash__actions"));
  assert.ok(html.indexOf("mnyra-dash__actions") < html.indexOf("data-dashboard-posts"));
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
  // Die Kennzahlen-Reihe steht nicht mehr in Funksionet - sie ist in die
  // Analitika gewandert, die als eigene Seite im Bento haengt.
  assert.equal(html.includes("Letzte 7 Tage"), false);
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
    assert.ok(html.includes("Letzte Beiträge"));
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
  let analyticsWarmCount = 0;
  const controller = createDashboardViewController({
    state,
    documentObj,
    storageObj: { getItem: () => null, setItem: () => {} },
    composerApi: { prewarmFn: () => { prewarmCount += 1; } },
    viewApi: { warmAnalyticsFn: () => { analyticsWarmCount += 1; } },
    profileApi: {
      getBusinessProfileTypeFn: () => "restaurant",
      isShopCatalogProfileFn: () => false,
      isBusinessOwnerProfileFn: () => true,
      canAccessRestaurantOrdersFn: () => true,
      getRestaurantMetaByIdFn: () => ({ name: "Casa Rita", city: "Prishtina" })
    }
  });
  return {
    controller, idleTasks, timeouts,
    prewarmCount: () => prewarmCount,
    analyticsWarmCount: () => analyticsWarmCount
  };
}

test("the panel warms the composer and the analitika while the browser is idle", () => {
  const harness = createPrefetchHarness();

  harness.controller.renderDashboardView();
  // Zwei Vorabrufe: der Composer-Baustein und die Zahlen der Analitika.
  assert.equal(harness.idleTasks.length, 2, "die Vorabrufe haengen am Leerlauf, nicht am Render");
  harness.idleTasks.forEach((task) => {
    assert.ok(Number(task.options?.timeout) > 0, "und kommen auch ohne Leerlauf irgendwann dran");
    task.fn();
  });
  assert.equal(harness.prewarmCount(), 1, "die Upload-Runtime waermt mit vor");
  assert.equal(harness.analyticsWarmCount(), 1, "die Analitika waermt mit vor");

  // Weitere Renders starten kein zweites Vorladen.
  harness.controller.renderDashboardView();
  harness.controller.renderDashboardView();
  assert.equal(harness.idleTasks.length, 2);
});

test("a data saver connection keeps both warm-ups on demand", () => {
  const saveData = createPrefetchHarness({ connection: { saveData: true, effectiveType: "4g" } });
  saveData.controller.renderDashboardView();
  assert.equal(saveData.idleTasks.length, 0);
  assert.equal(saveData.timeouts.length, 0);
  assert.equal(saveData.analyticsWarmCount(), 0, "auf Save-Data keine Abfragen auf Verdacht");

  const slow = createPrefetchHarness({ connection: { saveData: false, effectiveType: "2g" } });
  slow.controller.renderDashboardView();
  assert.equal(slow.idleTasks.length, 0);
  assert.equal(slow.analyticsWarmCount(), 0);

  // 3G ist kein Sparmodus - dort lohnt der Vorabruf besonders.
  const normal = createPrefetchHarness({ connection: { saveData: false, effectiveType: "3g" } });
  normal.controller.renderDashboardView();
  assert.equal(normal.idleTasks.length, 2);
});

// ---------------------------------------------------------------------------
// Die Kennzahl-Reihe unter der Begruessung.
// ---------------------------------------------------------------------------

test("the latest post is the newest one, not the one with the widest reach", () => {
  const posts = [
    { id: "neu", impressions: 10, likesCount: 0, createdAtMs: 900 },
    { id: "stark", impressions: 400, likesCount: 2, createdAtMs: 100 },
    { id: "mittel", impressions: 90, likesCount: 30, createdAtMs: 500 }
  ];
  assert.equal(resolveLatestDashboardPostCore(posts).id, "neu");
  // Bei gleicher Zeit entscheidet die Reichweite, dann die Likes - damit die
  // Wahl auch dann eindeutig ist und nicht von der Ladereihenfolge abhaengt.
  assert.equal(resolveLatestDashboardPostCore([
    { id: "a", impressions: 5, likesCount: 1, createdAtMs: 900 },
    { id: "b", impressions: 50, likesCount: 0, createdAtMs: 900 }
  ]).id, "b");
  assert.equal(resolveLatestDashboardPostCore([
    { id: "a", impressions: 5, likesCount: 1, createdAtMs: 900 },
    { id: "b", impressions: 5, likesCount: 9, createdAtMs: 900 }
  ]).id, "b");
  // Beitraege ganz ohne Datum (Serverzeit steht noch aus) fallen nicht heraus.
  assert.equal(resolveLatestDashboardPostCore([
    { id: "ohne", impressions: 3 },
    { id: "mit", impressions: 1, createdAtMs: 10 }
  ]).id, "mit");
  assert.equal(resolveLatestDashboardPostCore([]), null);
  assert.equal(resolveLatestDashboardPostCore(null), null);
});

test("the model carries the latest post even when it is not in the three shown", () => {
  // Die Liste zeigt die drei juengsten. Der juengste davon ist zugleich der
  // Beitrag der Karte - und er darf nicht aus der Liste kommen, sondern aus
  // ALLEN geladenen: sonst haenge die Karte an einer Abschneidung.
  const model = buildDashboardModelCore({
    days: [{ date: "2026-07-11", counters: {}, posts: { p4: { impressions: 999 } } }],
    todayKey: "2026-07-11",
    rawPosts: [
      { id: "p2", data: { caption: "b", createdAtClient: "2026-07-09T10:00:00Z" } },
      { id: "alt", data: { caption: "a", createdAtClient: "2026-07-01T10:00:00Z" } },
      { id: "p4", data: { caption: "d", createdAtClient: "2026-07-11T10:00:00Z" } },
      { id: "p3", data: { caption: "c", createdAtClient: "2026-07-10T10:00:00Z" } }
    ]
  });
  assert.equal(model.posts.length, 3);
  assert.equal(model.posts.some((post) => post.id === "alt"), false);
  assert.equal(model.latestPost.id, "p4");
  assert.equal(model.latestPost.impressions, 999);
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
    latestPost: { id: "p1", thumbUrl: "https://img/post.jpg", impressions: 1240 }
  };
  const cards = buildDashboardMetricCardsCore({
    model,
    coverUrl: "https://img/cover.jpg",
    subscribed: true,
    assets: { menuImageUrl: "/menu.jpg", qrImageUrl: "/qr.jpg" }
  });
  assert.deepEqual(cards.map((card) => card.key), ["latestPost", "profileViews", "menuOpens", "qrScans"]);
  assert.deepEqual(cards.map((card) => card.label), [
    "Postimi fundit", "Vizitor n'profil", "Vizitor n'meny", "Skanime n'tavolina"
  ]);
  // Alle vier sagen dasselbe auf dieselbe Weise: ein Auge vor der Zahl.
  assert.deepEqual(cards.map((card) => !!card.withEye), [true, true, true, true]);
  // Und alle vier fuehren in die Analitika - als Seite im Bento, nicht als
  // Seitenwechsel: keine traegt noch ein data-nav.
  assert.deepEqual(cards.map((card) => card.panelTab), ["analitika", "analitika", "analitika", "analitika"]);
  assert.equal(cards.some((card) => card.nav), false);
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
  assert.equal(lockedBlock.slice(0, lockedBlock.indexOf("</button>")).includes("data-dashboard-panel-tab"), false);
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
  assert.ok(html.includes("Vizitor n&#39;profil"), "die Beschriftung steht sofort da");

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
  // Der weisse Verlauf ueber dem Bildfenster ist weg - weder als Regel noch
  // als Knoten. Das Bild steht ganz und scharf im Fenster.
  assert.equal(DASHBOARD_CSS.includes(".mnyra-dash__hl-fade"), false);
  assert.equal(renderDashboardMetricCards({
    cards: [{ key: "k", label: "L", value: "1", withEye: true }]
  }).includes("mnyra-dash__hl-fade"), false);
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
  assert.ok(card.includes("height: calc(var(--dash-hl-media) + 88px);"), card);
  // Beschriftung und Zahl stehen UNTER dem Bildfenster, mit Abstand dazu -
  // ganz im Weissen, nicht mit einem Fuss im ausgeblendeten Teil des Bildes.
  const body = block(".mnyra-dash__hl-body {");
  assert.ok(body.includes("top: calc(var(--dash-hl-media) + 14px);"), body);
  assert.equal(body.includes("bottom:"), false, body);
  // Und der Ersatz fuer ein fehlendes Bild fuellt genau dasselbe Fenster -
  // sonst spraenge die Karte, sobald ein Bild fehlt.
  const plate = block(".mnyra-dash__hl-plate {");
  assert.ok(plate.includes("height: var(--dash-hl-media);"), plate);

  // Jede Beschriftung bekommt zwei Zeilen - auch wenn sie nur eine braucht.
  // "Skanime n'tavolina" passt nicht in eine; der reservierte Platz haelt die
  // Zahlen aller vier Karten trotzdem auf derselben Hoehe.
  const label = block(".mnyra-dash__hl-label {");
  assert.ok(label.includes("-webkit-line-clamp: 2;"), label);
  assert.ok(label.includes("min-height: 25px;"), label);
  assert.equal(label.includes("white-space: nowrap;"), false, label);
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
    dashboardView: { status: "ready", error: "", loadedSignature: "", paywall: "", model: { day: "", week: {}, today: {}, posts: [], latestPost: null } }
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
        latestPost: { id: "p1", thumbUrl: "https://img/casa-rita.jpg", impressions: 4321 }
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
    model: { today: { profileViews: 4 }, latestPost: null },
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
    model: { today: {}, latestPost: { id: "p1", impressions: 12, thumbUrl: "https://img/p1.jpg" } },
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
    model: { today: {}, latestPost: mitPoster },
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
    model: { today: {}, latestPost: ohnePoster },
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

// ---------------------------------------------------------------------------
// Die drei Seiten des Bentos.
// ---------------------------------------------------------------------------

function createPanelController({ state = {}, viewApi = {} } = {}) {
  return createDashboardViewController({
    state,
    documentObj: null,
    viewApi,
    profileApi: {
      getBusinessProfileTypeFn: () => "restaurant",
      isShopCatalogProfileFn: () => false,
      isBusinessOwnerProfileFn: () => true,
      canAccessRestaurantOrdersFn: () => true,
      getRestaurantMetaByIdFn: () => ({ name: "Casa Rita" })
    }
  });
}

function panelState(extra = {}) {
  return {
    userProfile: { restaurantId: "r1", name: "Casa Rita" },
    user: { uid: "u1" },
    activeTab: "dashboard",
    dashboardView: {
      status: "ready",
      error: "",
      loadedSignature: "",
      model: { day: "", week: {}, today: {}, posts: [], latestPost: null }
    },
    ...extra
  };
}

test("an unknown or missing panel tab always lands on funksionet", () => {
  assert.equal(resolveDashboardPanelTabCore(""), "funksionet");
  assert.equal(resolveDashboardPanelTabCore(null), "funksionet");
  assert.equal(resolveDashboardPanelTabCore("was-auch-immer"), "funksionet");
  assert.equal(resolveDashboardPanelTabCore("ANALITIKA"), "analitika");
  assert.equal(resolveDashboardPanelTabCore("opsionet"), "opsionet");
});

test("the tab bar names its three pages and marks exactly one", () => {
  const html = renderDashboardPanelTabs({ activeTab: "analitika", iconFn: (name) => `<i data-lucide="${name}"></i>` });
  ["funksionet", "analitika", "opsionet"].forEach((id) => {
    assert.ok(html.includes(`data-dashboard-panel-tab="${id}"`), id);
  });
  assert.ok(html.includes("Funksionet"));
  assert.ok(html.includes("Analitika"));
  assert.ok(html.includes("Opsionet"));
  // Genau eine Seite ist gewaehlt.
  assert.equal((html.match(/aria-selected="true"/g) || []).length, 1);
  const selected = html.slice(html.indexOf('data-dashboard-panel-tab="analitika"'));
  assert.ok(selected.slice(0, selected.indexOf("</button>")).includes('aria-selected="true"'));
  // Jede Seite traegt ihr Symbol neben dem Wort.
  ["layout-grid", "bar-chart-3", "settings"].forEach((iconName) => {
    assert.ok(html.includes(`data-lucide="${iconName}"`), iconName);
  });
});

test("without a choice the panel opens on funksionet", () => {
  const html = createPanelController({ state: panelState() }).renderDashboardView();
  const funksionet = html.slice(html.indexOf('data-dashboard-panel-tab="funksionet"'));
  assert.ok(funksionet.slice(0, funksionet.indexOf("</button>")).includes('aria-selected="true"'));
  assert.ok(html.includes("data-dashboard-composer-card"), "Funksionet zeigt seine Karten");
});

test("analitika and opsionet put their own view into the bento", () => {
  const viewApi = {
    renderAnalyticsViewFn: () => '<section data-analytics-root>ANALITIKA</section>',
    renderSettingsViewFn: () => '<div data-settings-root>OPSIONET</div>'
  };
  const analitika = createPanelController({
    state: panelState({ dashboardPanelTab: "analitika" }),
    viewApi
  }).renderDashboardView();
  assert.ok(analitika.includes("ANALITIKA"));
  assert.ok(analitika.includes("mnyra-dash__embed"));
  // Die Seite loest Funksionet ab, sie steht nicht darunter.
  assert.equal(analitika.includes("data-dashboard-composer-card"), false);
  // Gruss und Kennzahl-Reihe darueber bleiben - sie gehoeren zur Seite, nicht
  // zu einer ihrer drei Flaechen.
  assert.ok(analitika.includes("data-dashboard-metrics"));
  assert.ok(analitika.includes("mnyra-dash__greet"));

  const opsionet = createPanelController({
    state: panelState({ dashboardPanelTab: "opsionet" }),
    viewApi
  }).renderDashboardView();
  assert.ok(opsionet.includes("OPSIONET"));
  assert.equal(opsionet.includes("ANALITIKA"), false);
  assert.equal(opsionet.includes("data-dashboard-composer-card"), false);
});

test("a panel without those views renders an empty page instead of breaking", () => {
  const html = createPanelController({ state: panelState({ dashboardPanelTab: "analitika" }) }).renderDashboardView();
  assert.ok(html.includes("mnyra-dash__embed"));
  assert.ok(html.includes("data-dashboard-panel-tabs"));
});

// Die Leiste und die Kennzahl-Karten tragen dieselbe Marke. Ein Klick darauf
// wechselt die Seite des Bentos - kein Seitenwechsel, also auch kein Schritt
// im Verlauf des Browsers.
test("clicking a tab or a metric card switches the page of the bento", () => {
  const clickHandlers = [];
  const documentObj = {
    getElementById: () => ({}),
    addEventListener: (type, handler) => { if (type === "click") clickHandlers.push(handler); },
    head: { appendChild: () => {} },
    createElement: () => ({})
  };
  const state = panelState();
  let renders = 0;
  const controller = createDashboardViewController({
    state,
    documentObj,
    renderFn: () => { renders += 1; },
    viewApi: { renderAnalyticsViewFn: () => "<section data-analytics-root></section>" },
    profileApi: {
      getBusinessProfileTypeFn: () => "restaurant",
      isShopCatalogProfileFn: () => false,
      isBusinessOwnerProfileFn: () => true,
      canAccessRestaurantOrdersFn: () => true,
      getRestaurantMetaByIdFn: () => ({ name: "Casa Rita" })
    }
  });
  controller.renderDashboardView();
  assert.equal(clickHandlers.length, 1);

  const clickOn = (value) => clickHandlers[0]({
    preventDefault: () => {},
    target: {
      closest: (selector) => (
        selector === "[data-dashboard-panel-tab]"
          ? { getAttribute: () => value }
          : null
      )
    }
  });

  clickOn("analitika");
  assert.equal(state.dashboardPanelTab, "analitika");
  assert.equal(renders, 1);

  // Derselbe Tab noch einmal: kein Neuaufbau.
  clickOn("analitika");
  assert.equal(renders, 1);

  // Ein unbekannter Wert landet auf funksionet, nie im Leeren.
  clickOn("gibts-nicht");
  assert.equal(state.dashboardPanelTab, "funksionet");
  assert.equal(renders, 2);
});

// ---------------------------------------------------------------------------
// Die Bilder der Kennzahl-Reihe duerfen beim Umschalten der Bento-Seiten nicht
// flackern.
//
// Ein Neuaufbau der App wirft den ganzen Hauptteil weg und setzt frische
// Knoten ein - auch frische <img>, die der Browser neu aufbauen muss. Der
// Rahmen kann die alte Reihe stehen lassen, WENN die neue dasselbe sagt; den
// Vergleich macht ihr Fingerabdruck.
// ---------------------------------------------------------------------------

test("the metric row keeps its fingerprint while only the bento page changes", () => {
  const state = panelState({
    dashboardView: {
      restaurantId: "r1",
      status: "ready",
      error: "",
      loadedSignature: "x",
      paywall: "",
      model: {
        day: "", week: {}, today: { profileViews: 31, menuOpens: 12, qrScans: 7 }, posts: [],
        latestPost: { id: "p1", thumbUrl: "https://img/p.jpg", impressions: 1240 }
      }
    }
  });
  const viewApi = { renderAnalyticsViewFn: () => "<section data-analytics-root></section>" };
  const fingerprint = (html) => {
    const at = html.indexOf("data-dashboard-metrics=");
    assert.ok(at > -1, "die Reihe muss ihren Abdruck tragen");
    return html.slice(at, html.indexOf(">", at));
  };

  const funksionet = fingerprint(createPanelController({ state, viewApi }).renderDashboardView());
  state.dashboardPanelTab = "analitika";
  const analitika = fingerprint(createPanelController({ state, viewApi }).renderDashboardView());
  state.dashboardPanelTab = "opsionet";
  const opsionet = fingerprint(createPanelController({ state, viewApi }).renderDashboardView());

  assert.equal(funksionet, analitika, "der Seitenwechsel darf die Reihe nicht anfassen");
  assert.equal(analitika, opsionet);
  assert.ok(funksionet.length > "data-dashboard-metrics=\"\"".length, "der Abdruck darf nicht leer sein");
});

test("the fingerprint changes as soon as the row says something else", () => {
  const karte = (extra = {}) => [{
    key: "profileViews", label: "Vizitor n'profil", value: "31",
    imageUrl: "https://img/cover.jpg", withEye: true, panelTab: "analitika", ...extra
  }];
  const basis = buildDashboardMetricRowSignatureCore(karte());
  assert.notEqual(basis, buildDashboardMetricRowSignatureCore(karte({ value: "32" })));
  assert.notEqual(basis, buildDashboardMetricRowSignatureCore(karte({ imageUrl: "https://img/neu.jpg" })));
  assert.notEqual(basis, buildDashboardMetricRowSignatureCore(karte({ locked: true })));
  assert.notEqual(basis, buildDashboardMetricRowSignatureCore(karte({ loading: true })));
  assert.notEqual(basis, buildDashboardMetricRowSignatureCore(karte({ label: "Anders" })));
  // Gleiche Karte, gleicher Abdruck - auch als frisch gebautes Objekt.
  assert.equal(basis, buildDashboardMetricRowSignatureCore(karte()));
  // Karten ohne key zaehlen nicht mit, genau wie beim Zeichnen.
  assert.equal(basis, buildDashboardMetricRowSignatureCore([...karte(), { label: "ohne key" }]));
  assert.equal(buildDashboardMetricRowSignatureCore([]), "");
  assert.equal(buildDashboardMetricRowSignatureCore(null), "");
});
