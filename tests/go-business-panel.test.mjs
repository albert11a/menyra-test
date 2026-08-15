import assert from "node:assert/strict";
import test from "node:test";

import {
  renderBusinessGoCardCore,
  renderGoAdminBodyCore,
  renderGoAdminNoBusinessStateCore,
  renderGoOfferEditorCore,
  renderGoOfferPreviewCore
} from "../apps/menyra-social/core/go/business-go-render-utils.js";
import { createGoAdminDataController } from "../apps/menyra-social/core/go/business-go-runtime-controller.js";
import { createGoAdminViewController } from "../apps/menyra-social/core/go/go-admin-view-controller.js";
import { normalizeGoOffer } from "../shared/go/go-offer-core.js";
import { normalizeInitialTab } from "../apps/menyra-social/core/auth/route-auth-utils.js";
import { resolveSocialRouteRuntimeKey } from "../apps/menyra-social/core/app-shell/route-runtime-registry.js";
import { ANALYTICS_EVENT_NAMES, isKnownAnalyticsEvent } from "../apps/menyra-social/core/analytics/analytics-event-schema.js";

const deps = { escapeHtml: (value) => String(value ?? ""), icon: (name) => `<i data-lucide="${name}"></i>` };

const OFFER = normalizeGoOffer({
  id: "offer-1",
  restaurantId: "rest-1",
  benefit: { kind: "percent", percent: 10 },
  partyRanges: ["2-4"],
  schedule: { mode: "windows", days: ["mon", "tue", "wed", "thu"], windows: [{ start: "14:00", end: "18:00" }] },
  bookingType: "reservation",
  status: "active"
});

function booking(overrides = {}) {
  return {
    id: "bk-1",
    restaurantId: "rest-1",
    shortCode: "A7K2",
    type: "reservation",
    status: "confirmed",
    partySize: 4,
    expectedArrivalAt: "2026-08-13T17:00:00.000Z",
    dayKey: "2026-08-13",
    createdAt: "2026-08-13T14:00:00.000Z",
    businessSeenAt: "",
    snapshot: { benefitLabel: "–10 %" },
    ...overrides
  };
}

// ===========================================================================
// Die Karte im Panel (Punkt 49, 50, 51, 85, 86).
// ===========================================================================

test("without GO the card stays away entirely", () => {
  assert.equal(renderBusinessGoCardCore({ enabled: false, unseenCount: 3 }), "");
});

test("the card looks like the other cards and takes the same road", () => {
  const html = renderBusinessGoCardCore({ enabled: true, iconFn: deps.icon });
  // Dieselbe Form wie "Lësho ofertë" und "Mnyra Waiter" - und derselbe Weg
  // ueber data-nav, statt eines eigenen Overlays.
  assert.ok(html.includes("mnyra-dash__composer"));
  assert.ok(html.includes('data-nav="gobiznes"'));
  assert.ok(html.includes("mnyra-dash__composer-cta"));
  assert.equal(html.includes("data-go-business-open"), false);
});

test("a venue without offers is invited, not left with an empty page", () => {
  const html = renderBusinessGoCardCore({ enabled: true });
  assert.ok(html.includes("Krijo oferta për klientët që kërkojnë tani."));
  assert.ok(html.includes("Aktivizo ofertën e parë"));
});

test("the badge counts what is unseen, the text what is running", () => {
  const html = renderBusinessGoCardCore({
    enabled: true,
    unseenCount: 2,
    activeOffers: 3,
    todayBookings: 7
  });
  // Das Abzeichen sagt "2" - nicht "7". Es meint das Ungesehene (Punkt 51).
  assert.ok(html.includes(">2</span>"));
  assert.ok(html.includes("3 oferta aktive · 7 rezervime sot"));
  // Und es traegt eine Beschriftung, weil eine rote Blase allein fuer
  // Screenreader nichts sagt (Punkt 142).
  assert.ok(html.includes('aria-label="2 Të reja"'));
});

// ===========================================================================
// Die GO-Seite: eine Seite wie der Ofertat-Editor, kein Overlay.
// ===========================================================================

test("the page wears the language of the other editors", () => {
  const html = renderGoAdminBodyCore({
    restaurantName: "Casa Rita",
    tab: "active",
    bookings: [booking()],
    summary: { unseen: 1, open: 1, today: 1, guests: 4 },
    deps
  });
  // Weisse Karten mit 2.5rem, farbiger Eyebrow, kursive Ueberschrift - wie
  // in den Ofertat und im Menue-Editor.
  assert.ok(html.includes("rounded-[2.5rem]"));
  assert.ok(html.includes("text-[9px] font-black text-indigo-600 uppercase tracking-widest"));
  assert.ok(html.includes("font-black italic uppercase tracking-tighter"));
  assert.ok(html.includes("app-main-content-safe"));
  assert.ok(html.includes("Casa Rita"));
  // Und kein Overlay: keine feste Flaeche, kein abgedunkelter Hintergrund.
  assert.equal(html.includes("fixed inset-0"), false);
  assert.equal(html.includes("bg-slate-900/50"), false);
  assert.equal(html.includes("aria-modal"), false);
});

test("the page opens on the running bookings", () => {
  const html = renderGoAdminBodyCore({
    tab: "active",
    bookings: [booking()],
    summary: { unseen: 1, open: 1, today: 1, guests: 4 },
    deps
  });
  assert.ok(html.includes("GO #A7K2"));
  assert.ok(html.includes("4 Mysafirë"));
  assert.ok(html.includes("Rreth"));
  assert.ok(html.includes("–10 %"));
  assert.ok(html.includes("Po vijnë"));
  // Ein nicht gesehener Vorgang hebt sich ab.
  assert.ok(html.includes("bg-indigo-50/50"));
});

test("there is no accept button, because the venue already said yes", () => {
  const html = renderGoAdminBodyCore({ tab: "active", bookings: [booking()], deps });
  // Ein "Prano" hier wuerde den Gast wieder warten lassen (Punkt 61).
  assert.equal(html.includes(">Prano<"), false);
  assert.equal(/data-go-booking-action="accept"/.test(html), false);
  // Stattdessen: der Gast ist da, oder er war nicht da.
  assert.ok(html.includes('data-go-booking-action="checkin"'));
  assert.ok(html.includes('data-go-booking-action="notArrived"'));
});

test("the venue never needs mail, phone or a full profile of a guest", () => {
  const html = renderGoAdminBodyCore({ tab: "active", bookings: [booking()], deps });
  assert.ok(html.includes("Mnyra Guest · A7K2"));
  assert.equal(/@|\+383|tel:/.test(html), false);
});

test("pausing keeps the running bookings and says so", () => {
  const html = renderGoAdminBodyCore({ tab: "options", settings: {}, paused: false, deps });
  assert.ok(html.includes("30 min"));
  assert.ok(html.includes("1 orë"));
  assert.ok(html.includes("Deri nesër"));
  assert.ok(html.includes("Pa afat"));
  assert.ok(html.includes("Rezervimet ekzistuese mbeten"));
});

test("an offer is archived, never deleted", () => {
  const html = renderGoAdminBodyCore({ tab: "offers", offers: [OFFER], deps });
  assert.ok(html.includes("Arkivo"));
  assert.equal(/fshi|delete/i.test(html), false);
  // Ein archiviertes Angebot steht nicht mehr in der Liste.
  const archived = renderGoAdminBodyCore({
    tab: "offers",
    offers: [normalizeGoOffer({ ...OFFER, status: "archived" })],
    deps
  });
  assert.equal(archived.includes('data-go-offer="offer-1"'), false);
});

test("a profile without a business is told so, not shown an empty editor", () => {
  const html = renderGoAdminNoBusinessStateCore({ deps });
  assert.ok(html.includes("Ky funksion eshte vetem per profile biznesi."));
  assert.ok(renderGoAdminNoBusinessStateCore({ deps, resolving: true }).includes("Biznesi po ngarkohet..."));
});

// ===========================================================================
// Der Editor - ein eigener Bildschirm, kein Modal (Punkt 63 bis 81).
// ===========================================================================

function editor(draft = OFFER, overrides = {}) {
  return { mode: "edit", draft, errors: [], status: "", saving: false, windowFrom: "14:00", windowTo: "18:00", ...overrides };
}

test("the editor is a screen with a way back, not an overlay", () => {
  const html = renderGoOfferEditorCore({ editor: editor(), businessName: "Casa Rita", deps });
  assert.ok(html.includes("data-go-offer-editor"));
  assert.ok(html.includes("data-go-offer-cancel"));
  assert.ok(html.includes("chevron-left"));
  assert.ok(html.includes("app-main-content-safe"));
  assert.equal(html.includes("fixed inset-0"), false);
  assert.equal(html.includes("aria-modal"), false);
});

test("the editor asks the five questions and shows the result", () => {
  const html = renderGoOfferEditorCore({ editor: editor(), businessName: "Casa Rita", deps });
  assert.ok(html.includes("Çka po ofron?"));
  assert.ok(html.includes("Për sa persona?"));
  assert.ok(html.includes("Kur vlen?"));
  assert.ok(html.includes("Kur klienti e zgjedh"));
  assert.ok(html.includes("Vetëm oferta"));
  assert.ok(html.includes("Oferta + tavolinë"));
  // 0 heisst "ohne Grenze" - das muss dastehen, sonst liest es sich als
  // "nichts erlaubt".
  assert.ok(html.includes("0 = pa kufi"));
  assert.ok(html.includes("Kështu e sheh klienti"));
});

test("the preview is the card the guest will see", () => {
  const html = renderGoOfferPreviewCore({ offer: OFFER, businessName: "Casa Rita", deps });
  assert.ok(html.includes("Casa Rita"));
  assert.ok(html.includes("po ju ofron"));
  assert.ok(html.includes("–10 %"));
  assert.ok(html.includes("për grupin tuaj"));
  assert.ok(html.includes("2–4 persona"));
  assert.ok(html.includes("Prano ofertën"));
});

test("errors from the domain land under the right field", () => {
  const html = renderGoOfferEditorCore({
    editor: editor(normalizeGoOffer({ restaurantId: "rest-1", benefit: {} }), {
      errors: [{ field: "benefit", message: "Shkruaj çka po ofron." }]
    }),
    deps
  });
  assert.ok(html.includes("Shkruaj çka po ofron."));
});

// ===========================================================================
// Der Tab (Punkt 58).
// ===========================================================================

test("gobiznes is a route like any other business tab", () => {
  assert.equal(normalizeInitialTab("gobiznes"), "gobiznes");
  assert.equal(normalizeInitialTab("go-biznes"), "gobiznes");
  assert.equal(resolveSocialRouteRuntimeKey({ activeTab: "gobiznes" }), "gobiznes");

  // GO hat zwei Seiten und deshalb zwei Tabs. "mnyra-go" ist der Name, den
  // ein Gast sieht und tippt - er fuehrt auf die Seite des Gastes, nicht in
  // den Arbeitsplatz des Lokals. Dorthin fuehrt "go-biznes".
  assert.equal(normalizeInitialTab("go"), "go");
  assert.equal(normalizeInitialTab("mnyra-go"), "go");
  assert.equal(resolveSocialRouteRuntimeKey({ activeTab: "go" }), "go");

  // Und was es nicht gibt, wird auch nicht erfunden.
  assert.equal(normalizeInitialTab("go-irgendwas"), "");
});

test("the view controller keeps its state where a re-render cannot lose it", () => {
  const state = { userProfile: { restaurantId: "rest-1", name: "Casa Rita" }, user: { uid: "u1" } };
  let renders = 0;
  const controller = createGoAdminViewController({
    state,
    renderFn: () => { renders += 1; },
    documentObj: null,
    helperApi: deps,
    profileApi: {
      resolveOwnRestaurantIdFn: () => "rest-1",
      getRestaurantMetaByIdFn: () => ({ name: "Casa Rita" }),
      isBusinessProfileFn: () => true
    }
  });
  const html = controller.renderGoAdminView();
  assert.ok(html.includes("Casa Rita"));
  // Der Zustand haengt am State der App, nicht am Modul - ein Neuzeichnen
  // der Shell verliert ihn nicht.
  assert.equal(state.goAdmin.tab, "active");
  assert.equal(state.goAdmin.restaurantId, "rest-1");
  assert.equal(renders, 0);

  // Ein Entwurf traegt das Zeitfenster als lesbare Uhrzeit, damit die
  // time-Felder etwas anzuzeigen haben.
  const draft = controller.__buildDraft(OFFER);
  assert.equal(draft.windowFrom, "14:00");
  assert.equal(draft.windowTo, "18:00");
  assert.equal(draft.mode, "edit");
  assert.equal(controller.__buildDraft(null).mode, "create");
});

test("a profile without a business never reaches the editor", () => {
  const state = { userProfile: {}, user: { uid: "u1" } };
  const controller = createGoAdminViewController({
    state,
    documentObj: null,
    helperApi: deps,
    profileApi: { resolveOwnRestaurantIdFn: () => "", isBusinessProfileFn: () => false }
  });
  assert.ok(controller.renderGoAdminView().includes("vetem per profile biznesi"));
});

// ===========================================================================
// Realtime (Punkt 52, 112, 114).
// ===========================================================================

function createData(overrides = {}) {
  return createGoAdminDataController({
    restaurantId: "rest-1",
    nowFn: () => Date.parse("2026-08-13T14:00:00.000Z"),
    ...overrides
  });
}

test("the same booking arriving twice stays one row", () => {
  const controller = createData();
  controller.__applyBookingDocs([
    { id: "bk-1", data: booking() },
    { id: "bk-1", data: booking({ status: "checked_in" }) }
  ]);
  assert.equal(controller.data.bookings.length, 1);
  assert.equal(controller.data.bookings[0].status, "checked_in");
});

test("the badge counts unseen bookings, the summary counts guests", () => {
  const controller = createData();
  controller.__applyBookingDocs([
    { id: "bk-1", data: booking() },
    { id: "bk-2", data: booking({ id: "bk-2", shortCode: "B3M9", businessSeenAt: "2026-08-13T14:05:00.000Z", partySize: 2 }) },
    { id: "bk-3", data: booking({ id: "bk-3", status: "cancelled_by_user", partySize: 9 }) }
  ]);
  const summary = controller.data.summary;
  assert.equal(summary.unseen, 1);
  assert.equal(summary.open, 2);
  // Eine abgesagte Buchung zaehlt weder als offen noch als Gast.
  assert.equal(summary.guests, 6);
});

test("go events ride the existing analytics pipeline", () => {
  assert.equal(isKnownAnalyticsEvent("go_booking_created"), true);
  assert.equal(isKnownAnalyticsEvent("go_checkin"), true);
  // Was keinem Lokal gehoert, wird auch nicht abgelegt.
  assert.equal(isKnownAnalyticsEvent("go_search"), false);
  assert.equal(ANALYTICS_EVENT_NAMES.includes("menu_open"), true);
});
