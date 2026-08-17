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
  // Weisse Karten mit 2.5rem, farbiger Eyebrow, kursive Ueberschrift in den
  // Abschnitten - wie in den Ofertat und im Menue-Editor.
  assert.ok(html.includes("rounded-[2.5rem]"));
  assert.ok(html.includes("text-[9px] font-black text-indigo-600 uppercase tracking-widest"));
  assert.ok(html.includes("font-black italic tracking-tighter"));
  assert.ok(html.includes("app-main-content-safe"));
  assert.ok(html.includes("Casa Rita"));
  // Und kein Overlay: keine feste Flaeche, kein abgedunkelter Hintergrund.
  assert.equal(html.includes("fixed inset-0"), false);
  assert.equal(html.includes("bg-slate-900/50"), false);
  assert.equal(html.includes("aria-modal"), false);
});

test("the page is headed like the Qyteti: the name, and one line under it", () => {
  // Oben stand dreimal, wo das Lokal ist - Marke, Ueberschrift, Name -, bevor
  // einmal stand, was es hier tun kann. Jetzt steht dort dieselbe zweizeilige
  // Ueberschrift wie im Qyteti: der Name, darunter ein Satz in klein und grau.
  const html = renderGoAdminBodyCore({ restaurantName: "Casa Rita", tab: "active", deps });

  // Dieselben Klassen wie die Ueberschrift des Qyteti-Feeds.
  assert.ok(html.includes(`<h1 class="text-xl font-black tracking-tight text-slate-900 md:text-2xl">`));
  assert.ok(html.includes(`<p class="text-[11px] text-slate-400 font-semibold mt-0.5">`));

  // Der Name der Marke steht als ein Wort, das GO darin im Blau der Marke.
  assert.ok(html.includes(`MNYRA<span class="text-indigo-600">GO</span>`));
  // Ohne Klammern: der Name steht da, nicht eine Fussnote zu sich selbst.
  assert.ok(html.includes("Editori Casa Rita"));
  assert.equal(html.includes("Editori (Casa Rita)"), false);

  // Die alte dreizeilige Ueberschrift ist weg.
  assert.equal(html.includes("font-black italic uppercase tracking-tighter"), false);
});

test("without a resolved business the heading is just the word", () => {
  const html = renderGoAdminBodyCore({ restaurantName: "", tab: "active", deps });
  assert.ok(html.includes("Editori"));
  // Kein hängender Rest, wo der Name fehlt.
  assert.equal(/Editori\s*<\/p>/.test(html) || html.includes(">Editori<"), true);
});

test("the row is the handle and the two numbers of the day, nothing else", () => {
  // Die Reihe ist die des Panelis: waagerecht, bis an beide Bildschirmraender,
  // aber die erste Karte steht in der Flucht der Seite. Vorne der Handgriff -
  // er ist der Grund, warum das Lokal die Seite im Betrieb offen hat -,
  // dahinter die zwei Zahlen, die zusammen einen Satz ergeben.
  const html = renderGoAdminBodyCore({
    restaurantName: "Casa Rita",
    tab: "active",
    stats: { impressions: 48, accepted: 6 },
    deps
  });

  assert.ok(html.includes(`<div class="go-hl" data-go-highlights>`));
  // Die Reihe laeuft ueber das Seitenpolster hinaus und schiebt die erste
  // Karte mit ihrem eigenen Polster wieder hinein.
  assert.ok(html.includes("margin: 0 -1.5rem 1.5rem;"));
  assert.ok(html.includes("padding: 0 1.5rem;"));
  // Zweieinhalb Karten im Bild.
  assert.ok(html.includes("flex: 0 0 calc((100% + 24px - 20px) / 2.5);"));

  // Genau drei Karten, in dieser Reihenfolge.
  const order = ["scan", "seen", "accepted"].map((key) => html.indexOf(`data-go-highlight="${key}"`));
  assert.equal(order.every((position) => position > -1), true, JSON.stringify(order));
  assert.deepEqual(order, [...order].sort((a, b) => a - b));
  assert.equal((html.match(/data-go-highlight="/g) || []).length, 3);

  // Der Handgriff traegt die Kamera und den Griff fuer den Scan.
  assert.ok(html.includes("data-go-scan"));
  assert.ok(html.includes("Skano ofertën"));
  assert.ok(html.includes(`data-lucide="camera"`));

  // Die zwei Zahlen stehen mit ihrer Beschriftung da.
  assert.ok(html.includes("Ofertën e kanë parë sot"));
  assert.ok(html.includes("E kanë pranuar sot"));
  assert.ok(html.includes(`<span class="go-hl__value">48</span>`));
  assert.ok(html.includes(`<span class="go-hl__value">6</span>`));

  // Was gestrichen wurde, ist auch weg - samt dem alten Raster.
  ["Të reja", "Mysafirë", "Aktivizo ofertën"].forEach((gone) => {
    assert.equal(html.includes(gone), false, gone);
  });
  assert.equal(html.includes("grid grid-cols-2 gap-3"), false);
});

test("the numbers start at zero instead of showing nothing", () => {
  // Ein Lokal, das heute noch nichts vorgezeigt hat, soll eine Null sehen und
  // kein leeres Feld: die Null ist eine Auskunft, das leere Feld ist ein
  // Zweifel an der Seite.
  const html = renderGoAdminBodyCore({ restaurantName: "Casa Rita", tab: "active", deps });
  assert.equal((html.match(/<span class="go-hl__value">0<\/span>/g) || []).length, 2);
});

test("under the row stands the bento of the Paneli, with the pills inside it", () => {
  const html = renderGoAdminBodyCore({ restaurantName: "Casa Rita", tab: "offers", deps });

  // Dieselbe Flaeche wie im Paneli: oben gerundet, bis an beide Raender, und
  // sie laeuft nach unten weiter.
  assert.ok(html.includes(`<div class="go-bento" data-go-bento>`));
  assert.ok(html.includes("margin: 72px -1.5rem 0;"));
  assert.ok(html.includes("border-radius: 40px 40px 0 0;"));
  assert.ok(html.includes("box-shadow: 0 -16px 32px -20px rgb(15 23 42 / 0.16);"));

  // Die Leiste steht IM Bento, nicht darueber.
  assert.ok(html.indexOf(`class="go-bento"`) < html.indexOf(`class="go-tabs"`));

  // Vier runde Knoepfe nebeneinander, mit Symbol und Wort auf einer Zeile.
  assert.ok(html.includes("grid-template-columns: repeat(4, minmax(0, 1fr));"));
  assert.ok(html.includes("border-radius: 999px;"));
  assert.ok(html.includes(`<span class="go-tab-label">`));
  assert.ok(html.includes(`aria-selected="true" data-go-business-tab="offers"`));

  // Und die alte Leiste ist weg.
  assert.equal(html.includes("rounded-2xl text-[11px] font-black uppercase tracking-widest"), false);
});

test("a highlight card without a picture still stands on a surface", () => {
  // Das Bild der ersten Karte kommt spaeter. Bis dahin darf dort kein Loch
  // sein - die ruhige Flaeche mit dem Symbol traegt die Karte.
  const html = renderGoAdminBodyCore({ restaurantName: "Casa Rita", tab: "active", deps });
  assert.ok(html.includes(`class="go-hl__plate`));
  // Die Regel fuer das Bildfenster steht im Stylesheet, aber es haengt noch
  // kein Bild darin.
  assert.equal(html.includes(`<img class="go-hl__media"`), false);
});

test("the page opens on the running bookings", () => {
  const html = renderGoAdminBodyCore({
    tab: "active",
    bookings: [booking()],
    summary: { unseen: 1, open: 1, today: 1, guests: 4 },
    deps
  });
  assert.ok(html.includes("4 Mysafirë"));
  assert.ok(html.includes("Rreth"));
  assert.ok(html.includes("–10 %"));
  assert.ok(html.includes("Po vijnë"));
  // Ein nicht gesehener Vorgang hebt sich ab.
  assert.ok(html.includes("bg-indigo-50/50"));
});

// ===========================================================================
// Der Kurzcode und die Bestaetigung.
//
// An der Bestaetigung haengt Geld: Sie soll nur gelingen, wenn ein Gast
// davorsteht und seinen Code zeigt. Deshalb steht der Code nirgends in der
// Liste, und deshalb traegt nur die Buchung einen Knopf, die ueber das
// Suchfeld gefunden wurde. Die folgenden Tests halten genau das fest - faellt
// einer, ist die Abrechnung angreifbar.
// ===========================================================================

test("the code stands nowhere in the list, not even hidden in the markup", () => {
  const html = renderGoAdminBodyCore({ tab: "active", bookings: [booking()], deps });
  // Der Kurzcode der Buchung ist "A7K2" - und er darf im ganzen Aufbau der
  // Seite nicht vorkommen. Auch nicht in einem Attribut: Wer die
  // Entwicklerwerkzeuge oeffnet, liest Attribute genauso wie Text.
  assert.equal(html.includes("A7K2"), false);
  assert.equal(html.includes("GO #"), false);
});

test("without a found booking there is no way to confirm", () => {
  const html = renderGoAdminBodyCore({ tab: "active", bookings: [booking()], deps });
  // Kein Knopf an einer Zeile aus der Liste.
  assert.equal(html.includes("data-go-booking-confirm"), false);
  assert.equal(html.includes(">Prano<"), false);
  // Und der alte Weg ueber die Kennung ist zu.
  assert.equal(/data-go-booking-action="checkin"/.test(html), false);
  // Stattdessen steht dort das Suchfeld.
  assert.ok(html.includes("data-go-code-input"));
  assert.ok(html.includes("Kodi i klientit"));
});

test("the booking found by the code carries the button, and only it", () => {
  const found = booking({ id: "bk-found" });
  const html = renderGoAdminBodyCore({
    tab: "active",
    bookings: [booking({ id: "bk-other" }), found],
    search: { code: "A7K2", status: "", busy: false, booking: found },
    deps
  });
  // Genau ein Knopf, und er zeigt auf die gefundene Buchung.
  assert.equal((html.match(/data-go-booking-confirm/g) || []).length, 1);
  assert.ok(html.includes(`data-go-booking-id="bk-found"`));
  assert.ok(html.includes("Prano"));
  // Die gefundene Buchung steht nicht zweimal da.
  assert.equal((html.match(/data-go-booking="bk-found"/g) || []).length, 1);
  // Die andere ist weiter da - ohne Knopf.
  assert.ok(html.includes(`data-go-booking="bk-other"`));
});

test("the waiter may correct the party size, because he sees the group", () => {
  const found = booking({ id: "bk-found", partySize: 4 });
  const html = renderGoAdminBodyCore({
    tab: "active",
    bookings: [found],
    search: { code: "A7K2", status: "", busy: false, booking: found },
    deps
  });
  assert.ok(html.includes("data-go-confirm-party"));
  assert.ok(html.includes(`value="4"`));
  assert.ok(html.includes("Sa persona janë"));
});

test("a code that found nothing says so and offers no button", () => {
  const html = renderGoAdminBodyCore({
    tab: "active",
    bookings: [booking()],
    search: { code: "XXXX", status: "Ky kod nuk u gjet.", busy: false, booking: null },
    deps
  });
  assert.ok(html.includes("Ky kod nuk u gjet."));
  assert.equal(html.includes("data-go-booking-confirm"), false);
});

test("the venue never needs mail, phone or a full profile of a guest", () => {
  const html = renderGoAdminBodyCore({ tab: "active", bookings: [booking()], deps });
  assert.ok(html.includes("Mnyra Guest"));
  assert.equal(/@|\+383|tel:/.test(html), false);
});

test("not-arrived is gone: an unconfirmed offer stays the venue's problem", () => {
  // Wer nicht bestaetigt, dessen Oferta bleibt gueltig - der Gast kann
  // wiederkommen oder sie weitergeben. Genau das macht das Bestaetigen fuer
  // das Lokal guenstiger als das Nichtbestaetigen.
  const html = renderGoAdminBodyCore({ tab: "active", bookings: [booking()], deps });
  assert.equal(html.includes("Nuk erdhën"), false);
  assert.equal(/data-go-booking-action="notArrived"/.test(html), false);
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
