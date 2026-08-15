import assert from "node:assert/strict";
import test from "node:test";

import {
  renderBusinessGoCardCore,
  renderBusinessGoPanelCore,
  renderGoOfferEditorCore,
  renderGoOfferPreviewCore
} from "../apps/menyra-social/core/go/business-go-render-utils.js";
import { createBusinessGoRuntimeController } from "../apps/menyra-social/core/go/business-go-runtime-controller.js";
import { normalizeGoOffer } from "../shared/go/go-offer-core.js";
import { ANALYTICS_EVENT_NAMES, isKnownAnalyticsEvent } from "../apps/menyra-social/core/analytics/analytics-event-schema.js";

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
// Die Karte im Panel (Punkt 49, 50, 51, 86).
// ===========================================================================

test("without GO the card stays away entirely", () => {
  assert.equal(renderBusinessGoCardCore({ enabled: false, unseenCount: 3 }), "");
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
// Die GO-Seite (Punkt 58 bis 62).
// ===========================================================================

test("the panel opens on the running bookings", () => {
  const html = renderBusinessGoPanelCore({
    open: true,
    tab: "active",
    bookings: [booking()],
    summary: { unseen: 1, open: 1, today: 1, guests: 4 }
  });
  assert.ok(html.includes("GO #A7K2"));
  assert.ok(html.includes("4 Mysafirë"));
  assert.ok(html.includes("Rreth"));
  assert.ok(html.includes("–10 %"));
  assert.ok(html.includes("Po vijnë"));
  // Ein nicht gesehener Vorgang hebt sich ab.
  assert.ok(html.includes("bg-indigo-50/40"));
});

test("there is no accept button, because the venue already said yes", () => {
  const html = renderBusinessGoPanelCore({ open: true, tab: "active", bookings: [booking()] });
  // Ein "Prano" hier wuerde den Gast wieder warten lassen (Punkt 61).
  assert.equal(html.includes(">Prano<"), false);
  assert.equal(/data-go-booking-action="accept"/.test(html), false);
  // Stattdessen: der Gast ist da, oder er war nicht da.
  assert.ok(html.includes('data-go-booking-action="checkin"'));
  assert.ok(html.includes('data-go-booking-action="notArrived"'));
});

test("the venue never needs mail, phone or a full profile of a guest", () => {
  const html = renderBusinessGoPanelCore({ open: true, tab: "active", bookings: [booking()] });
  assert.ok(html.includes("Mnyra Guest · A7K2"));
  assert.equal(/@|\+383|tel:/.test(html), false);
});

test("pausing keeps the running bookings and says so", () => {
  const html = renderBusinessGoPanelCore({ open: true, tab: "options", settings: {}, paused: false });
  assert.ok(html.includes("30 min"));
  assert.ok(html.includes("1 orë"));
  assert.ok(html.includes("Deri nesër"));
  assert.ok(html.includes("Pa afat"));
  assert.ok(html.includes("Rezervimet ekzistuese mbeten"));
});

test("an offer is archived, never deleted", () => {
  const html = renderBusinessGoPanelCore({ open: true, tab: "offers", offers: [OFFER] });
  assert.ok(html.includes("Arkivo"));
  assert.equal(/fshi|delete/i.test(html), false);
  // Ein archiviertes Angebot steht nicht mehr in der Liste.
  const archived = renderBusinessGoPanelCore({
    open: true,
    tab: "offers",
    offers: [normalizeGoOffer({ ...OFFER, status: "archived" })]
  });
  assert.equal(archived.includes('data-go-offer="offer-1"'), false);
});

// ===========================================================================
// Der Editor und seine Vorschau (Punkt 63 bis 81).
// ===========================================================================

test("the preview is the card the guest will see", () => {
  const html = renderGoOfferPreviewCore({ offer: OFFER, businessName: "Casa Rita" });
  assert.ok(html.includes("Casa Rita"));
  assert.ok(html.includes("po ju ofron"));
  assert.ok(html.includes("–10 %"));
  assert.ok(html.includes("për grupin tuaj"));
  assert.ok(html.includes("2–4 persona"));
  assert.ok(html.includes("Prano ofertën"));
});

test("the editor asks the five questions and shows the result", () => {
  const html = renderGoOfferEditorCore({ draft: OFFER, businessName: "Casa Rita" });
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

test("errors from the domain land under the right field", () => {
  const html = renderGoOfferEditorCore({
    draft: normalizeGoOffer({ restaurantId: "rest-1", benefit: {} }),
    errors: [{ field: "benefit", message: "Shkruaj çka po ofron." }]
  });
  assert.ok(html.includes("Shkruaj çka po ofron."));
});

// ===========================================================================
// Realtime (Punkt 52, 112, 114).
// ===========================================================================

function createController(overrides = {}) {
  const nodes = new Map();
  const doc = {
    body: { appendChild(node) { nodes.set(node.id, node); } },
    getElementById: (id) => nodes.get(id) || null,
    createElement: () => ({ id: "", dataset: {}, innerHTML: "", addEventListener() {}, remove() {} }),
    addEventListener() {}
  };
  return createBusinessGoRuntimeController({
    documentObj: doc,
    restaurantId: "rest-1",
    businessName: "Casa Rita",
    nowFn: () => Date.parse("2026-08-13T14:00:00.000Z"),
    ...overrides
  });
}

test("the same booking arriving twice stays one row", () => {
  const controller = createController();
  controller.__applyBookingDocs([
    { id: "bk-1", data: booking() },
    { id: "bk-1", data: booking({ status: "checked_in" }) }
  ]);
  assert.equal(controller.state.bookings.length, 1);
  assert.equal(controller.state.bookings[0].status, "checked_in");
});

test("the badge counts unseen bookings, the summary counts guests", () => {
  const seen = [];
  const controller = createController({ onBadgeFn: (summary) => seen.push(summary) });
  controller.__applyBookingDocs([
    { id: "bk-1", data: booking() },
    { id: "bk-2", data: booking({ id: "bk-2", shortCode: "B3M9", businessSeenAt: "2026-08-13T14:05:00.000Z", partySize: 2 }) },
    { id: "bk-3", data: booking({ id: "bk-3", status: "cancelled_by_user", partySize: 9 }) }
  ]);
  const summary = controller.state.summary;
  assert.equal(summary.unseen, 1);
  assert.equal(summary.open, 2);
  // Eine abgesagte Buchung zaehlt weder als offen noch als Gast.
  assert.equal(summary.guests, 6);
  assert.equal(seen.length, 1);
});

test("go events ride the existing analytics pipeline", () => {
  assert.equal(isKnownAnalyticsEvent("go_booking_created"), true);
  assert.equal(isKnownAnalyticsEvent("go_checkin"), true);
  // Was keinem Lokal gehoert, wird auch nicht abgelegt.
  assert.equal(isKnownAnalyticsEvent("go_search"), false);
  assert.equal(ANALYTICS_EVENT_NAMES.includes("menu_open"), true);
});
