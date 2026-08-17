import assert from "node:assert/strict";
import test from "node:test";

import {
  renderBusinessGoCardCore,
  renderGoAdminBodyCore,
  renderGoAdminNoBusinessStateCore,
  renderGoOfferEditorCore,
  renderGoOfferPreviewCore,
  goCategoryFromIntents,
  goIntentsFromCategory
} from "../apps/menyra-social/core/go/business-go-render-utils.js";
import { createGoAdminDataController } from "../apps/menyra-social/core/go/business-go-runtime-controller.js";
import { createGoAdminViewController } from "../apps/menyra-social/core/go/go-admin-view-controller.js";
import { renderGoOfferCardCore } from "../apps/menyra-social/core/go/go-offer-card-render-utils.js";
import { describeGoPartyRanges, describeGoSchedule, normalizeGoOffer } from "../shared/go/go-offer-core.js";
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

test("the editor wears the same shell as the dish modal", () => {
  // Nicht "ein Modal", sondern DASSELBE Modal: dieselbe Flaeche, derselbe
  // abgedunkelte Hintergrund, derselbe Rahmen, dasselbe Blatt. Ein Editor,
  // der sich anders anfuehlt als der daneben, ist ein zweites Programm.
  const html = renderGoOfferEditorCore({ editor: editor(), businessName: "Casa Rita", deps });
  assert.ok(html.includes("data-go-offer-editor"));
  assert.ok(html.includes("data-go-offer-cancel"));
  assert.ok(html.includes('aria-modal="true"'));

  // Die Huelle des Speisen-Modals, Stueck fuer Stueck.
  assert.ok(html.includes('class="fixed inset-0 z-[75] modal-overlay"'));
  assert.ok(html.includes('data-modal-surface="#ffffff"'));
  assert.ok(html.includes('class="absolute inset-0 bg-black/60"'));
  assert.ok(html.includes('class="modal-frame"'));
  assert.ok(html.includes("rounded-t-[3rem]"));
  assert.ok(html.includes("modal-sheet-85"));
  assert.ok(html.includes("modal-sheet"));
  assert.ok(html.includes("modal-scroll"));
  assert.ok(html.includes("modal-footer-safe"));
});

test("the modal does not travel inside the page markup", () => {
  // Ein `position: fixed` bezieht sich nur so lange auf den Bildschirm, wie
  // kein Vorfahre eine Transformation traegt - und der Seitenrumpf der App
  // traegt eine. Lag der Editor darin, war er kein Modal mehr, sondern ein
  // Kasten im Textfluss, und die Kachelreihe schien mitten hindurch.
  // Deshalb steht er in der Overlay-Flaeche und NICHT in dieser Zeichenkette.
  const state = { userProfile: { restaurantId: "rest-1", name: "Casa Rita" }, user: { uid: "u1" } };
  const controller = createGoAdminViewController({
    state,
    renderFn: () => {},
    documentObj: null,
    helperApi: deps,
    profileApi: {
      resolveOwnRestaurantIdFn: () => "rest-1",
      getRestaurantMetaByIdFn: () => ({ name: "Casa Rita" }),
      isBusinessProfileFn: () => true
    }
  });
  controller.__view().editor = controller.__buildDraft(null);
  const html = controller.renderGoAdminView();
  assert.equal(html.includes("data-go-offer-editor"), false);
  assert.equal(html.includes("modal-overlay"), false);
  // Die Liste dahinter steht weiter da.
  assert.ok(html.includes("data-go-admin"));
});

test("the editor asks four questions and shows the result", () => {
  const html = renderGoOfferEditorCore({ editor: editor(), businessName: "Casa Rita", deps });
  assert.ok(html.includes("Çka po ofron?"));
  assert.ok(html.includes("Prej sa personave vlen kjo ofertë"));
  assert.ok(html.includes("Kur e lshon këtë ofertë"));
  assert.ok(html.includes("Nga çfarë orari vlen oferta"));
  assert.ok(html.includes("Kështu e sheh klienti"));
});

test("four ways to give something, in a 2x2 grid", () => {
  const html = renderGoOfferEditorCore({ editor: editor(), businessName: "Casa Rita", deps });
  assert.ok(html.includes("Zbritje %"));
  assert.ok(html.includes("Paketë GO"));
  assert.ok(html.includes("Falas"));
  assert.ok(html.includes("Çmim special"));
  // Nebeneinander in einer Reihe zu vier waeren die Woerter auf dem Telefon
  // abgeschnitten (Punkt 2).
  assert.ok(html.includes("grid grid-cols-2 gap-2"));
  // Der Satz sagt, was zu tun ist - und die Knoepfe tragen keine Untertitel
  // (Punkt 20).
  assert.ok(html.includes("Zgjidh llojin e ofertës"));
  // Und genau eine Art ist gewaehlt.
  assert.equal(html.split('data-go-benefit-kind="').length - 1, 4);
  assert.equal((html.match(/data-go-benefit-kind="[^"]+"\s+aria-pressed="true"/g) || []).length, 1);
});

test("there is no free text field for the offer itself", () => {
  // Das Lokal liefert strukturierte Daten, den Satz baut Mnyra (Punkt 8).
  // Sonst stehen im Qyteti Angebote wie "SUPER AKSIONNNNN!!!" neben ruhigen.
  const html = renderGoOfferEditorCore({ editor: editor(), businessName: "Casa Rita", deps });
  assert.equal(html.includes("<textarea"), false);
  assert.equal(html.includes("Përshkrimi"), false);
  assert.equal(html.includes("Shkruaj ofertën"), false);
  assert.equal(html.includes("Teksti yt"), false);
});

test("each kind brings its own fields and nothing else", () => {
  const html = (benefit) => renderGoOfferEditorCore({
    editor: editor(normalizeGoOffer({ restaurantId: "rest-1", benefit })),
    businessName: "Casa Rita",
    deps
  });

  // Zbritje %: die schnellen Werte, "Tjetër" und der Bereich (Punkt 4).
  const discount = html({ kind: "percent", percent: 20, scope: "food" });
  assert.ok(discount.includes("Sa zbritje po ofron?"));
  assert.ok(discount.includes('data-go-discount="10"'));
  assert.ok(discount.includes('data-go-discount="other"'));
  assert.ok(discount.includes("Ku vlen zbritja?"));
  assert.ok(discount.includes('data-go-discount-scope="food" aria-pressed="true"'));
  // Solange eine Pille gewaehlt ist, steht kein Eingabefeld da.
  assert.equal(discount.includes("data-go-benefit-percent"), false);
  // Und die Felder der anderen Arten sind nicht auf dem Bildschirm - was
  // nicht dasteht, kann auch nicht leer ausgelesen werden.
  assert.equal(discount.includes("data-go-benefit-regular"), false);
  assert.equal(discount.includes("data-go-benefit-item"), false);

  // "Tjetër": das eigene Feld, mit der Zahlentastatur (Punkt 4.2, 28).
  const custom = renderGoOfferEditorCore({
    editor: { ...editor(normalizeGoOffer({ restaurantId: "rest-1", benefit: { kind: "percent", percent: 35 } })) },
    businessName: "Casa Rita",
    deps
  });
  assert.ok(custom.includes("data-go-benefit-percent"));
  assert.ok(custom.includes("Shkruaj zbritjen"));
  assert.ok(custom.includes('inputmode="numeric"'));
  assert.ok(custom.includes('data-go-discount="other" aria-pressed="true"'));

  // Paketë GO: Inhalt, zwei Preise, und die gerechnete Ersparnis (Punkt 5).
  const bundle = html({ kind: "bundle", itemName: "2 Burger + 2 Pije", regularPrice: "20,00", goPrice: "14,90" });
  assert.ok(bundle.includes("Çka përfshin paketa?"));
  assert.ok(bundle.includes("p.sh. 2 Burger + 2 Pije"));
  assert.ok(bundle.includes("Çmimi normal"));
  assert.ok(bundle.includes("Çmimi GO"));
  assert.ok(bundle.includes('value="20,00"'));
  assert.ok(bundle.includes('value="14,90"'));
  assert.ok(bundle.includes("Kursen 5,10 €"));
  assert.ok(bundle.includes("-26%"));
  // Preise oeffnen die Zahlentastatur, und das € steht schon da (Punkt 5.2).
  assert.ok(bundle.includes('inputmode="decimal"'));
  assert.ok(bundle.includes("go-offer-price__unit"));

  // Falas: was, und unter welcher Bedingung (Punkt 6).
  const free = html({ kind: "freeItem", itemName: "1 Pije", conditionType: "food" });
  assert.ok(free.includes("Çka merr falas?"));
  assert.ok(free.includes("Me çfarë kushti?"));
  assert.ok(free.includes('data-go-benefit-condition="any_order"'));
  assert.ok(free.includes('data-go-benefit-condition="food" aria-pressed="true"'));
  // Das eigene Bedingungsfeld steht nur bei "Tjetër" da (Punkt 6.6).
  assert.equal(free.includes("data-go-benefit-condition-text"), false);
  const freeCustom = html({ kind: "freeItem", itemName: "1 Pije", conditionType: "custom", customCondition: "kur porosit 2 pizza" });
  assert.ok(freeCustom.includes("Shkruaj kushtin"));
  assert.ok(freeCustom.includes("data-go-benefit-condition-text"));
  assert.ok(freeCustom.includes("kur porosit 2 pizza"));

  // Çmim special: ein Produkt, zwei Preise (Punkt 7).
  const special = html({ kind: "specialPrice", itemName: "Pizza Margherita", regularPrice: 8, goPrice: 5.9 });
  assert.ok(special.includes("Cili produkt?"));
  assert.ok(special.includes("p.sh. Pizza Margherita"));
  assert.ok(special.includes("Kursen 2,10 €"));
});

test("the customer preview carries the lines of the chosen kind", () => {
  // Punkt 16: Kein Vorschau-Knopf, keine zweite Rechnung - die Karte liest
  // dasselbe, was der Gast spaeter bekommt (buildGoBenefitView).
  const bundle = renderGoOfferPreviewCore({
    offer: normalizeGoOffer({
      restaurantId: "rest-1",
      benefit: { kind: "bundle", itemName: "2 Burger + 2 Pije", regularPrice: "20,00", goPrice: "14,90" },
      partyRanges: ["2-4"]
    }),
    businessName: "Casa Rita",
    deps
  });
  assert.ok(bundle.includes("Paketë GO"));
  assert.ok(bundle.includes("2 Burger + 2 Pije"));
  // Der normale Preis klein und durchgestrichen, der GO-Preis gross.
  assert.ok(bundle.includes("mnyra-go-page__card-price-was"));
  assert.ok(bundle.includes("20,00 €"));
  assert.ok(bundle.includes("14,90 €"));
  assert.ok(bundle.includes("Kursen 5,10 €"));

  const free = renderGoOfferPreviewCore({
    offer: normalizeGoOffer({
      restaurantId: "rest-1",
      benefit: { kind: "freeItem", itemName: "1 Pije", conditionType: "food" },
      partyRanges: ["2-4"]
    }),
    businessName: "Casa Rita",
    deps
  });
  assert.ok(free.includes("1 PIJE FALAS"));
  assert.ok(free.includes("me porosi ushqimi"));
});

test("the activate button looks disabled while the chosen kind is incomplete", () => {
  // Punkt 29. Antippen kann man ihn trotzdem - dann steht dort, was fehlt.
  // Ein Knopf, der stumm nichts tut, laesst das Lokal suchen.
  const incomplete = renderGoOfferEditorCore({
    editor: editor(normalizeGoOffer({ restaurantId: "rest-1", benefit: { kind: "bundle", itemName: "2 Burger" } }), { intents: ["food"] }),
    businessName: "Casa Rita",
    deps
  });
  assert.ok(/data-go-offer-save[^>]*aria-disabled="true"/.test(incomplete));
  assert.ok(incomplete.includes("opacity-50"));

  const complete = renderGoOfferEditorCore({
    editor: editor(normalizeGoOffer({
      restaurantId: "rest-1",
      benefit: { kind: "bundle", itemName: "2 Burger + 2 Pije", regularPrice: 20, goPrice: 14.9 },
      partyRanges: ["2-4"]
    }), { intents: ["food"] }),
    businessName: "Casa Rita",
    deps
  });
  assert.ok(/data-go-offer-save[^>]*aria-disabled="false"/.test(complete));
});

test("what the venue no longer decides here is not silently reset either", () => {
  // Tavolinë, Kufijet und der Zeitraum stehen nicht mehr im Formular. Das
  // darf nicht heissen, dass ein bestehendes Angebot sie beim naechsten
  // Speichern verliert - deshalb steht hier auch kein Feld dafuer, das leer
  // ausgelesen werden koennte.
  const html = renderGoOfferEditorCore({ editor: editor(), businessName: "Casa Rita", deps });
  assert.equal(html.includes("Kur klienti e zgjedh"), false);
  assert.equal(html.includes("data-go-offer-type"), false);
  assert.equal(html.includes("data-go-offer-limit"), false);
  assert.equal(html.includes("data-go-offer-start"), false);
  assert.equal(html.includes("data-go-offer-end"), false);
});

test("a new offer starts with no discount chosen", () => {
  // Eine vorgesetzte 10 muesste erst weggeloescht werden, bevor jemand seine
  // eigene Zahl schreiben kann - und wer sie stehen laesst, verschenkt sie.
  // Deshalb ist zwar "Zbritje %" die Vorgabe (Punkt 3), aber keine der
  // Prozentpillen ist angetippt.
  const html = renderGoOfferEditorCore({
    editor: {
      mode: "create",
      draft: normalizeGoOffer({ restaurantId: "rest-1", benefit: { kind: "percent", percent: 0 } }),
      errors: []
    },
    businessName: "Casa Rita",
    deps
  });
  assert.ok(html.includes("Sa zbritje po ofron?"));
  assert.equal(/data-go-discount="\d+" aria-pressed="true"/.test(html), false);
  // Und das eigene Feld steht erst da, wenn "Tjetër" angetippt wurde.
  assert.equal(html.includes("data-go-benefit-percent"), false);
  // Krejt fatura ist die Vorgabe (Punkt 4.3).
  assert.ok(html.includes('data-go-discount-scope="all" aria-pressed="true"'));

  // Nach "Tjetër" ist das Feld da und leer.
  const other = renderGoOfferEditorCore({
    editor: {
      mode: "create",
      draft: normalizeGoOffer({ restaurantId: "rest-1", benefit: { kind: "percent", percent: 0 } }),
      percentCustom: true,
      errors: []
    },
    businessName: "Casa Rita",
    deps
  });
  assert.ok(other.includes("Shkruaj zbritjen"));
  assert.ok(/data-go-benefit-percent[^>]*value=""/.test(other));
});

test("the preview is the card the guest will see", () => {
  const html = renderGoOfferPreviewCore({ offer: OFFER, businessName: "Casa Rita", deps });
  assert.ok(html.includes("Casa Rita"));
  assert.ok(html.includes("po ju ofron"));
  assert.ok(html.includes("-10%"));
  assert.ok(html.includes("për grupin tuaj"));
  assert.ok(html.includes("2–4 persona"));
  assert.ok(html.includes("Prano ofertën"));
});

test("the footer carries the one button that does something", () => {
  // Das X oben rechts schliesst. Ein zweiter Knopf "Anulo" im Fuss sagte
  // dasselbe noch einmal - und im Speisen-Modal steht dort auch nur der eine
  // Knopf, der etwas tut, mit der Statuszeile darunter.
  const html = renderGoOfferEditorCore({ editor: editor(), businessName: "Casa Rita", deps });
  assert.equal(html.includes("Anulo"), false);
  assert.ok(html.includes("Mbyll"));
  // Kopf und Fuss haben die Masse des Speisen-Modals.
  assert.ok(html.includes("px-6 pt-6 pb-4 border-b border-slate-100"));
  assert.ok(html.includes("px-6 pb-6 pt-4 border-t border-slate-100 bg-white modal-footer-safe"));
  assert.ok(html.includes("w-11 h-11 rounded-2xl bg-slate-50"));
  // Geschlossen wird weiter ueber denselben Weg: das X und die Flaeche
  // dahinter.
  assert.equal(html.split("data-go-offer-cancel").length - 1, 2);
});

test("a new offer starts with nothing ticked", () => {
  // "Kur e lshon këtë ofertë" stand bei einer neuen Oferta schon auf beiden
  // Antworten, ohne dass jemand sie angetippt hatte - der Entwurf kennt kein
  // "noch nichts gewaehlt" und macht aus einer leeren Kategorie "all".
  const state = { userProfile: { restaurantId: "rest-1", name: "Casa Rita" }, user: { uid: "u1" } };
  const controller = createGoAdminViewController({
    state,
    renderFn: () => {},
    documentObj: null,
    helperApi: deps,
    profileApi: {
      resolveOwnRestaurantIdFn: () => "rest-1",
      getRestaurantMetaByIdFn: () => ({ name: "Casa Rita" }),
      isBusinessProfileFn: () => true
    }
  });

  const fresh = controller.__buildDraft(null);
  assert.deepEqual(fresh.intents, []);
  const freshHtml = renderGoOfferEditorCore({ editor: fresh, businessName: "Casa Rita", deps });
  assert.equal(/data-go-offer-intent="[^"]*" aria-pressed="true"/.test(freshHtml), false);

  // Eine bestehende Oferta zeigt weiter, was sie wirklich traegt.
  const existing = controller.__buildDraft(normalizeGoOffer({ ...OFFER, category: "drinks" }));
  assert.deepEqual(existing.intents, ["drinks"]);
  const existingHtml = renderGoOfferEditorCore({ editor: existing, businessName: "Casa Rita", deps });
  assert.ok(existingHtml.includes('data-go-offer-intent="drinks" aria-pressed="true"'));
  assert.ok(existingHtml.includes('data-go-offer-intent="food" aria-pressed="false"'));
});

test("switching the kind drops the values that are no longer on screen", () => {
  // Sonst rechnet die Karte des Gastes weiter mit einer Zahl, deren Feld gar
  // nicht mehr dasteht: Wer auf "Paketë GO" wechselte und "1 Kafe" schrieb,
  // sah in der Vorschau trotzdem "-10%" - sie schien tot.
  const typed = {};
  const controller = panel(typed);
  const current = controller.__view();
  current.editor = controller.__buildDraft(normalizeGoOffer({
    restaurantId: "rest-1",
    benefit: { kind: "percent", percent: 10 }
  }));

  // Die Paketa faengt leer an - die 10 % gehoeren nicht zu ihr.
  controller.__setBenefitKind("bundle");
  assert.equal(current.editor.draft.benefit.percent, 0);
  assert.equal(current.editor.draft.benefit.kind, "bundle");
  assert.equal(current.editor.draft.benefitLabel, "");

  // Erst was hier getippt wird, steht auf der Karte.
  typed["[data-go-benefit-item]"] = "2 Burger + 2 Pije";
  controller.__patchBenefit({});
  assert.equal(current.editor.draft.benefitLabel, "2 Burger + 2 Pije");
  delete typed["[data-go-benefit-item]"];

  // Und zurueck: der Prozentsatz gilt wieder, der Text der anderen Art nicht.
  controller.__setBenefitKind("percent");
  assert.equal(current.editor.draft.benefit.itemName, "");
  assert.equal(current.editor.draft.benefit.percent, 10);
  assert.equal(current.editor.draft.benefitLabel, "-10%");
});

test("what was typed in another kind is still there when the venue comes back", () => {
  // Punkt 10: Wer die vier Arten ausprobiert, soll dabei nichts verlieren -
  // solange das Modal offen ist, bleibt jede Art so stehen, wie sie verlassen
  // wurde.
  const typed = {};
  const controller = panel(typed);
  const current = controller.__view();
  current.editor = controller.__buildDraft(null);

  // Zbritje: 20 % auf Ushqim.
  controller.__patchBenefit({ percent: 20, scope: "food" });
  assert.equal(current.editor.draft.benefitLabel, "-20% në ushqim");

  // Dann eine Paketa - mit dem, was gerade in den Feldern steht.
  controller.__setBenefitKind("bundle");
  typed["[data-go-benefit-item]"] = "2 Burger + 2 Pije";
  typed["[data-go-benefit-regular]"] = "20,00";
  typed["[data-go-benefit-go]"] = "14,90";
  controller.__patchBenefit({});
  assert.equal(current.editor.draft.benefitLabel, "2 Burger + 2 Pije 14,90 €");

  // Und zurueck zur Zbritje: 20 % auf Ushqim stehen noch da.
  delete typed["[data-go-benefit-item]"];
  delete typed["[data-go-benefit-regular]"];
  delete typed["[data-go-benefit-go]"];
  controller.__setBenefitKind("percent");
  assert.equal(current.editor.draft.benefit.percent, 20);
  assert.equal(current.editor.draft.benefit.scope, "food");
  assert.equal(current.editor.draft.benefitLabel, "-20% në ushqim");

  // Gespeichert wird nur die gewaehlte Art (Punkt 11): Im Entwurf steht die
  // Zbritje - von der Paketa ist darin nichts mehr.
  assert.equal(current.editor.draft.benefit.kind, "percent");
  assert.equal(current.editor.draft.benefit.itemName, "");
  assert.equal(current.editor.draft.benefit.goPriceCents, 0);
  // Gemerkt ist sie trotzdem, solange das Modal offen ist.
  assert.equal(current.editor.benefits.bundle.itemName, "2 Burger + 2 Pije");
});

test("the free item keeps its own condition, the discount its scope", () => {
  const typed = {};
  const controller = panel(typed);
  const current = controller.__view();
  current.editor = controller.__buildDraft(null);

  controller.__setBenefitKind("freeItem");
  typed["[data-go-benefit-item]"] = "1 Pije";
  controller.__patchBenefit({ conditionType: "custom" });
  typed["[data-go-benefit-condition-text]"] = "kur porosit 2 pizza";
  controller.__patchBenefit({});
  assert.equal(current.editor.draft.benefitLabel, "1 Pije FALAS kur porosit 2 pizza");

  // Eine Bedingung aus der Liste ersetzt den eigenen Satz auf der Karte - der
  // Satz selbst bleibt im Entwurf stehen, falls "Tjetër" wieder kommt.
  controller.__patchBenefit({ conditionType: "food" });
  assert.equal(current.editor.draft.benefitLabel, "1 Pije FALAS me porosi ushqimi");
  assert.equal(current.editor.draft.benefit.customCondition, "kur porosit 2 pizza");
});

test("the preview is the very card from the guest page, not a rebuild of it", () => {
  // Nicht "sieht aus wie": Es ist dieselbe Funktion, aus derselben Datei, mit
  // denselben Klassen. Zwei Nachbauten laufen auseinander, und dann verspricht
  // die Vorschau dem Wirt etwas anderes, als der Gast bekommt.
  const html = renderGoOfferPreviewCore({ offer: OFFER, businessName: "Casa Rita", deps });
  const guestCard = renderGoOfferCardCore({
    businessName: "Casa Rita",
    benefitLabel: OFFER.benefitLabel,
    meta: [
      { icon: "users", label: describeGoPartyRanges(OFFER) },
      { icon: "clock", label: describeGoSchedule(OFFER) }
    ]
  });
  assert.ok(html.includes(guestCard.trim()));
  assert.ok(html.includes("mnyra-go-page__card"));
  assert.ok(html.includes("mnyra-go-page__cta"));
  // Der Knoten, den die Vorschau beim Tippen von Hand austauscht, bleibt.
  assert.ok(html.includes("data-go-offer-preview"));
});

test("the modal brings the stylesheet of that card with it", () => {
  // Die Regeln der Karte haengen sonst erst im Kopf des Dokuments, wenn jemand
  // die Gaeste-Seite geoeffnet hat - im Panel hat das niemand.
  const html = renderGoOfferEditorCore({ editor: editor(), businessName: "Casa Rita", deps });
  assert.ok(html.includes(".mnyra-go-page__card {"));
  assert.ok(html.includes(".mnyra-go-page__cta {"));
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

// ===========================================================================
// Der Editor verliert nichts mehr.
//
// Der Grund, aus dem der Editor frueher kein Modal sein durfte, war nicht das
// Modal - es war, dass die getippten Werte nur im DOM standen. Diese Tests
// halten die Reparatur fest.
// ===========================================================================

// Ein Dokument, das genau so viel kann, wie readEditorInputs braucht: zu
// einem Selektor einen Knoten mit einem Wert, oder gar keinen.
function fakeDoc(values = {}) {
  return {
    querySelector: (selector) => (
      Object.prototype.hasOwnProperty.call(values, selector)
        ? { value: values[selector] }
        : null
    ),
    createElement: () => ({ innerHTML: "", firstElementChild: null }),
    addEventListener: () => {}
  };
}

function panel(values = {}) {
  const state = { userProfile: { restaurantId: "rest-1", name: "Casa Rita" }, user: { uid: "u1" } };
  const controller = createGoAdminViewController({
    state,
    renderFn: () => {},
    documentObj: fakeDoc(values),
    helperApi: deps,
    profileApi: {
      resolveOwnRestaurantIdFn: () => "rest-1",
      getRestaurantMetaByIdFn: () => ({ name: "Casa Rita" }),
      isBusinessProfileFn: () => true
    }
  });
  controller.renderGoAdminView();
  return controller;
}

test("typing and then tapping a pill keeps what was typed", () => {
  const controller = panel({
    "[data-go-benefit-item]": "2 Burger + 2 Pije",
    "[data-go-benefit-regular]": "20,00",
    "[data-go-benefit-go]": "14,90"
  });
  const current = controller.__view();
  current.editor = controller.__buildDraft(null);
  current.editor.draft = normalizeGoOffer({
    ...current.editor.draft,
    benefit: { kind: "bundle" }
  });

  // Der Wirt hat getippt (steht im DOM) und tippt jetzt eine Gruppengroesse an.
  controller.__patchDraft({ partyRanges: ["4-6"] });

  const benefit = current.editor.draft.benefit;
  assert.equal(benefit.itemName, "2 Burger + 2 Pije");
  assert.equal(benefit.regularPriceCents, 2000);
  assert.equal(benefit.goPriceCents, 1490);
  // Die Ersparnis rechnet der Editor mit - eingetragen wird sie nie.
  assert.equal(benefit.savingCents, 510);
  assert.deepEqual(current.editor.draft.partyRanges, ["4-6"]);
  // Und die Karte zeigt bereits, was der Gast sehen wird.
  assert.equal(current.editor.draft.benefitLabel, "2 Burger + 2 Pije 14,90 €");
});

test("a field that is not on screen never overwrites what is stored", () => {
  // Kufijet und Zeitraum stehen nicht mehr im Formular. Wuerde readEditorInputs
  // sie trotzdem lesen, kaeme ein leerer Wert zurueck - und jedes Speichern
  // saetze still alles auf 0 zurueck.
  const controller = panel({ "[data-go-benefit-percent]": "25" });
  const current = controller.__view();
  current.editor = controller.__buildDraft(normalizeGoOffer({
    restaurantId: "rest-1",
    benefit: { kind: "percent", percent: 10 },
    limits: { dailyGroups: 20, totalRedemptions: 100, slotGroups: 0, slotGuests: 0 },
    dateRange: { startDate: "2026-08-01", endDate: "2026-08-31" },
    bookingType: "reservation"
  }));

  const patch = controller.__readEditorInputs();
  assert.equal(Object.prototype.hasOwnProperty.call(patch, "limits"), false);
  assert.equal(Object.prototype.hasOwnProperty.call(patch, "dateRange"), false);
  assert.equal(Object.prototype.hasOwnProperty.call(patch, "bookingType"), false);

  controller.__patchDraft({ partyRanges: ["1-2"] });
  const draft = current.editor.draft;
  assert.equal(draft.limits.dailyGroups, 20);
  assert.equal(draft.limits.totalRedemptions, 100);
  assert.equal(draft.dateRange.startDate, "2026-08-01");
  assert.equal(draft.bookingType, "reservation");
  // Das Prozentfeld stand auf dem Bildschirm und wird uebernommen.
  assert.equal(draft.benefit.percent, 25);
});

test("ushqim and pije map onto the categories the engine filters by", () => {
  assert.equal(goCategoryFromIntents(["food"]), "food");
  assert.equal(goCategoryFromIntents(["drinks"]), "drinks");
  assert.equal(goCategoryFromIntents(["food", "drinks"]), "all");
  assert.equal(goCategoryFromIntents([]), "");

  assert.deepEqual(goIntentsFromCategory("food"), ["food"]);
  assert.deepEqual(goIntentsFromCategory("all"), ["food", "drinks"]);
  // Bestehende Angebote tragen noch die feineren Kategorien - alle drei
  // gehoeren zur Antwort "Pije" (siehe GO_INTENTS).
  assert.deepEqual(goIntentsFromCategory("coffee"), ["drinks"]);
  assert.deepEqual(goIntentsFromCategory("drinks"), ["drinks"]);
  assert.deepEqual(goIntentsFromCategory("dessert"), ["drinks"]);
});

test("the last remaining audience cannot be unticked", () => {
  const controller = panel();
  const current = controller.__view();
  current.editor = controller.__buildDraft(null);
  // Start: beide gesetzt ("all"). Ushqim weg -> nur Pije.
  controller.__patchDraft({ category: goCategoryFromIntents(["drinks"]) });
  assert.equal(current.editor.draft.category, "drinks");
  // Und Pije auch noch wegnehmen ist keine gueltige Einstellung.
  assert.equal(goCategoryFromIntents([]), "");
});
