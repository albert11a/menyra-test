import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync, readdirSync } from "node:fs";

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
import {
  GO_CARD_VARIANT_CLEAN,
  GO_CARD_VARIANT_COMPACT,
  GO_CARD_VARIANT_HERO,
  renderGoOfferCardCore,
  resolveGoCardVariant
} from "../apps/menyra-social/core/go/go-offer-card-render-utils.js";
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
    shortCode: "A7K2M",
    // Aktiviert: Der Gast hat gewischt und steht mit seinem Code da. Nur so
    // traegt die gefundene Buchung ueberhaupt einen FINALIZO-Knopf.
    status: "activated",
    partySizeRequested: 4,
    partySizeVerified: null,
    dayKey: "2026-08-13",
    acceptedAt: "2026-08-13T14:00:00.000Z",
    activationDeadline: "2026-08-14T14:00:00.000Z",
    finalizationDeadline: "2026-08-14T16:00:00.000Z",
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
  // Die Groesse auf einem breiten Bildschirm und der Abstand der Unterzeile
  // stehen im Stylesheet der Seite (go-title, go-title-sub): md:text-2xl und
  // mt-0.5 gibt es im statischen Tailwind-Blatt nicht.
  assert.ok(html.includes(`<h1 class="go-title text-xl font-black tracking-tight text-slate-900">`));
  assert.ok(html.includes(`<p class="go-title-sub text-[11px] text-slate-400 font-semibold">`));
  assert.ok(html.includes(".go-title { font-size: 1.5rem;"));

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
  assert.ok(html.includes("Aktivizuar"));
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

test("without a found booking there is no way to finalize", () => {
  const html = renderGoAdminBodyCore({ tab: "active", bookings: [booking()], deps });
  // Kein Knopf an einer Zeile aus der Liste.
  assert.equal(html.includes("data-go-booking-finalize"), false);
  assert.equal(html.includes(">Finalizo<"), false);
  // Und der alte Weg ueber die Kennung ist zu.
  assert.equal(/data-go-booking-action="checkin"/.test(html), false);
  assert.equal(/data-go-booking-action="finalize"/.test(html), false);
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
  assert.equal((html.match(/data-go-booking-finalize/g) || []).length, 1);
  assert.ok(html.includes(`data-go-booking-id="bk-found"`));
  assert.ok(html.includes("Finalizo"));
  // Die gefundene Buchung steht nicht zweimal da.
  assert.equal((html.match(/data-go-booking="bk-found"/g) || []).length, 1);
  // Die andere ist weiter da - ohne Knopf.
  assert.ok(html.includes(`data-go-booking="bk-other"`));
});

test("the waiter may correct the party size, because he sees the group", () => {
  const found = booking({ id: "bk-found", partySizeRequested: 4 });
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

test("a booking that was never swiped gets a sentence, not a button", () => {
  // Der Gast steht daneben und muss noch aktivieren. Ein stummer Bildschirm
  // schickte den Kellner auf Fehlersuche bei sich selbst.
  const found = booking({ id: "bk-found", status: "accepted" });
  const html = renderGoAdminBodyCore({
    tab: "active",
    bookings: [found],
    search: { code: "A7K2M", status: "", busy: false, booking: found },
    deps
  });
  assert.equal(html.includes("data-go-booking-finalize"), false);
  assert.ok(html.includes("Klienti duhet ta aktivizojë ofertën."));
});

test("a code that found nothing says so and offers no button", () => {
  const html = renderGoAdminBodyCore({
    tab: "active",
    bookings: [booking()],
    search: { code: "XXXX", status: "Ky kod nuk u gjet.", busy: false, booking: null },
    deps
  });
  assert.ok(html.includes("Ky kod nuk u gjet."));
  assert.equal(html.includes("data-go-booking-finalize"), false);
});

test("the venue never needs mail, phone or a full profile of a guest", () => {
  const html = renderGoAdminBodyCore({ tab: "active", bookings: [booking()], deps });
  assert.ok(html.includes("Mnyra Guest"));
  // Ohne das Stylesheet der Seite: Ein @media darin ist kein Mailadresse.
  const body = html.replace(/<style>[\s\S]*?<\/style>/g, "");
  assert.equal(/@|\+383|tel:/.test(body), false);
});

test("the venue has no button that decides whether Mnyra gets paid", () => {
  // Punkt 25. Absagen, abschliessen und "nicht gekommen" gibt es nicht mehr -
  // wer nicht finalisiert wird, laeuft nach 26 Stunden von selbst aus, ohne
  // Strafpunkt fuer den Gast und ohne Knopf fuer das Lokal.
  const html = renderGoAdminBodyCore({ tab: "active", bookings: [booking()], deps });
  assert.equal(html.includes("Nuk erdhën"), false);
  assert.equal(/data-go-booking-action="notArrived"/.test(html), false);
  assert.equal(/data-go-booking-action="cancel"/.test(html), false);
  assert.equal(/data-go-booking-action="complete"/.test(html), false);
  assert.equal(html.includes("Përfundo"), false);
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

test("the editor asks five questions and shows the result", () => {
  const html = renderGoOfferEditorCore({ editor: editor(), businessName: "Casa Rita", deps });
  // Jede Frage ist so gestellt, dass sie beschreibt, was sie wirklich fragt
  // (Punkt 47): nicht "prej sa personave", sondern "für sa persona"; nicht
  // "kur e lshon", sondern "kur të shfaqet".
  assert.ok(html.includes("Çka po ofron?"));
  assert.ok(html.includes("Foto e ofertës"));
  assert.ok(html.includes("Për sa persona vlen?"));
  assert.ok(html.includes("Kur të shfaqet oferta?"));
  assert.ok(html.includes("Kur vlen oferta?"));
  assert.ok(html.includes("Kështu e sheh klienti"));
  // Und die Fragen von damals stehen nirgends mehr.
  assert.equal(html.includes("Prej sa personave"), false);
  assert.equal(html.includes("Kur e lshon"), false);
  assert.equal(html.includes("Nga çfarë orari"), false);
});

test("one sentence in the header says why this form exists", () => {
  // Punkt 2: Ein Wirt, der GO zum ersten Mal oeffnet, liest zuerst, was aus
  // dem Formular wird - und nicht das erste Feld.
  const html = renderGoOfferEditorCore({ editor: editor(), businessName: "Casa Rita", deps });
  assert.ok(html.includes("Krijoje ofertën një herë. Mnyra ua shfaq automatikisht klientëve që përputhen."));
  assert.ok(html.indexOf("Krijoje ofertën një herë") < html.indexOf("Çka po ofron?"));
});

test("each question carries one line of help, no more", () => {
  const html = renderGoOfferEditorCore({ editor: editor(), businessName: "Casa Rita", deps });
  assert.ok(html.includes("Zgjidh çfarë dëshiron t'i ofrosh klientit."));
  assert.ok(html.includes("Zgjidh për çfarë madhësie të grupit vlen oferta."));
  assert.ok(html.includes("Zgjidh kur kjo ofertë i përshtatet kërkimit të klientit."));
  assert.ok(html.includes("Zgjidh kur klientët mund ta përdorin ofertën."));
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
  assert.ok(html.includes("Zgjidh çfarë dëshiron t'i ofrosh klientit."));
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
  // Nicht "Me çfarë kushti?" - gefragt wird nach dem Augenblick im Lokal
  // (Punkt 7).
  assert.ok(free.includes("Kur e merr falas?"));
  assert.equal(free.includes("Me çfarë kushti?"), false);
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
  // "1 Pije FALAS" und nicht "1 PIJE FALAS": Gross ist das Wort, um das es
  // geht, und das ist FALAS (Punkt 33).
  assert.ok(free.includes("1 Pije FALAS"));
  assert.equal(free.includes("1 PIJE FALAS"), false);
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
  // Blasses Lila und kein Schatten, solange etwas fehlt - kraeftiges Violett
  // erst, wenn das Angebot steht (Punkt 42). Die Farben stehen im Stylesheet
  // des Modals, nicht in Tailwind-Klassen: siehe der Test darunter.
  assert.equal(/data-go-offer-save[^>]*go-offer-save--ready/.test(incomplete), false);

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
  assert.ok(/data-go-offer-save[^>]*go-offer-save--ready/.test(complete));
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
    { id: "bk-1", data: booking({ status: "finalized" }) }
  ]);
  assert.equal(controller.data.bookings.length, 1);
  assert.equal(controller.data.bookings[0].status, "finalized");
});

test("the badge counts unseen bookings, the summary counts guests", () => {
  const controller = createData();
  controller.__applyBookingDocs([
    { id: "bk-1", data: booking() },
    { id: "bk-2", data: booking({ id: "bk-2", shortCode: "B3M9N", businessSeenAt: "2026-08-13T14:05:00.000Z", partySizeRequested: 2 }) },
    { id: "bk-3", data: booking({ id: "bk-3", status: "cancelled", partySizeRequested: 9 }) }
  ]);
  const summary = controller.data.summary;
  assert.equal(summary.unseen, 1);
  assert.equal(summary.open, 2);
  // Eine abgesagte Buchung zaehlt weder als offen noch als Gast.
  assert.equal(summary.guests, 6);
});

test("go events ride the existing analytics pipeline", () => {
  assert.equal(isKnownAnalyticsEvent("go_booking_created"), true);
  // Der Wisch und die Finalisierung sind zwei Ereignisse - und nur das
  // zweite kostet etwas.
  assert.equal(isKnownAnalyticsEvent("go_activated"), true);
  assert.equal(isKnownAnalyticsEvent("go_finalized"), true);
  assert.equal(isKnownAnalyticsEvent("go_checkin"), false);
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

function panel(values = {}, options = {}) {
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
    },
    ...options
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
    limits: { dailyGroups: 20, totalRedemptions: 100 },
    dateRange: { startDate: "2026-08-01", endDate: "2026-08-31" }
  }));

  const patch = controller.__readEditorInputs();
  assert.equal(Object.prototype.hasOwnProperty.call(patch, "limits"), false);
  assert.equal(Object.prototype.hasOwnProperty.call(patch, "dateRange"), false);

  controller.__patchDraft({ partyRanges: ["1-2"] });
  const draft = current.editor.draft;
  assert.equal(draft.limits.dailyGroups, 20);
  assert.equal(draft.limits.totalRedemptions, 100);
  assert.equal(draft.dateRange.startDate, "2026-08-01");
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

// ===========================================================================
// Die Gruppengroessen (Punkt 14, 15, 47.1, 47.2).
// ===========================================================================

test("the group sizes no longer overlap, and Të gjithë covers all of them", () => {
  const html = renderGoOfferEditorCore({
    editor: editor(normalizeGoOffer({ restaurantId: "rest-1", partyRanges: ["1-2", "3-4", "5-6", "7+"] })),
    businessName: "Casa Rita",
    deps
  });
  // Person 2 lag vorher in "1–2" UND in "2–4", Person 4 in "2–4" und "4–6".
  // Eine Grenze, die zweimal vorkommt, ist keine Grenze.
  ["1–2", "3–4", "5–6", "7+"].forEach((label) => assert.ok(html.includes(`>\n      ${label}\n    `) || html.includes(label), label));
  assert.equal(html.includes(">2–4<"), false);
  assert.equal(html.includes(">4–6<"), false);
  assert.equal(html.includes(">6+<"), false);
  // "Të gjithë" steht darueber und ist gesetzt, wenn alle vier gesetzt sind.
  assert.ok(/data-go-offer-party="all" aria-pressed="true"/.test(html));
  assert.equal((html.match(/data-go-offer-party="/g) || []).length, 5);

  const some = renderGoOfferEditorCore({
    editor: editor(normalizeGoOffer({ restaurantId: "rest-1", partyRanges: ["3-4"] })),
    businessName: "Casa Rita",
    deps
  });
  assert.ok(/data-go-offer-party="all" aria-pressed="false"/.test(some));
  assert.ok(/data-go-offer-party="3-4" aria-pressed="true"/.test(some));
});

test("a new offer is for every group size, not for two to four", () => {
  // Vorher stand "2-4" da - eine Einschraenkung, die niemand gewaehlt hatte
  // und die ein Paar ausschloss, sobald es zu dritt kam (Punkt 15, 44).
  const controller = panel();
  const draft = controller.__buildDraft(null).draft;
  assert.deepEqual(draft.partyRanges, ["1-2", "3-4", "5-6", "7+"]);
  assert.equal(draft.minParty, 1);
  assert.equal(draft.maxParty, 99);
});

test("an offer from before opens with the ranges of today's form", () => {
  // Ein gespeichertes "2-4" ist im Formular kein Kreuz. Ohne Uebersetzung
  // saehe das Lokal seine Auswahl leer, als haette es nie eine getroffen.
  const controller = panel();
  const draft = controller.__buildDraft(normalizeGoOffer({
    restaurantId: "rest-1",
    benefit: { kind: "percent", percent: 10 },
    partyRanges: ["2-4"]
  })).draft;
  assert.deepEqual(draft.partyRanges, ["1-2", "3-4"]);
  // Und die Grenzen sind die der neuen Bereiche - nicht die alten, die im
  // Dokument standen.
  assert.equal(draft.minParty, 1);
  assert.equal(draft.maxParty, 4);
});

test("Të gjithë sets all four, and the last range cannot be tapped away", () => {
  const controller = panel();
  const current = controller.__view();
  current.editor = controller.__buildDraft(null);

  controller.__patchDraft({ partyRanges: ["3-4"] });
  assert.deepEqual(current.editor.draft.partyRanges, ["3-4"]);
  controller.__patchDraft({ partyRanges: ["1-2", "3-4", "5-6", "7+"] });
  assert.deepEqual(current.editor.draft.partyRanges, ["1-2", "3-4", "5-6", "7+"]);
});

// ===========================================================================
// Die Foto-Section (Punkt 9 bis 13, 40, 41).
// ===========================================================================

test("the photo stands right behind the offer details and says it is optional", () => {
  const html = renderGoOfferEditorCore({ editor: editor(), businessName: "Casa Rita", deps });
  assert.ok(html.includes("Foto e ofertës"));
  assert.ok(html.includes("Shto një foto që klienti ta shohë ofertën menjëherë."));
  assert.ok(html.includes("Opsionale"));
  // Zwischen dem Angebot und der Gruppengroesse - nicht am Ende des Formulars.
  assert.ok(html.indexOf("Çka po ofron?") < html.indexOf("Foto e ofertës"));
  assert.ok(html.indexOf("Foto e ofertës") < html.indexOf("Për sa persona vlen?"));
});

test("without a photo there is one upload area, and it takes camera or library", () => {
  const html = renderGoOfferEditorCore({ editor: editor(), businessName: "Casa Rita", deps });
  assert.ok(html.includes("data-go-offer-photo-pick"));
  assert.ok(html.includes("Shto një foto"));
  assert.ok(html.includes("Nga telefoni ose kamera"));
  // Ein Bild, nicht fuenf - und ohne "capture", das die Mediathek aussperren
  // wuerde (Punkt 11).
  assert.ok(html.includes('<input type="file" accept="image/*" class="hidden" data-go-offer-photo-input />'));
  assert.equal(/<input type="file"[^>]*multiple/.test(html), false);
  assert.equal(/<input type="file"[^>]*capture/.test(html), false);
  // Kein gestrichelter Web-Upload von damals: dieselbe Flaeche wie die Felder
  // daneben (Punkt 10).
  assert.equal(/dashed/.test(html), false);
  assert.ok(html.includes("aspect-ratio: 16 / 9;"));
  // Solange kein Bild dasteht, gibt es auch nichts zu entfernen.
  assert.equal(html.includes("data-go-offer-photo-remove"), false);
});

test("with a photo the area becomes the picture, with Ndrysho and Hiq", () => {
  const html = renderGoOfferEditorCore({
    editor: editor(normalizeGoOffer({ ...OFFER, imageUrl: "https://cdn.mnyra.com/go/pizza.jpg" })),
    businessName: "Casa Rita",
    deps
  });
  assert.ok(html.includes('src="https://cdn.mnyra.com/go/pizza.jpg"'));
  assert.ok(html.includes("go-offer-photo__frame"));
  assert.ok(html.includes("Ndrysho"));
  assert.ok(html.includes("data-go-offer-photo-remove"));
  assert.ok(html.includes("Hiq"));
  // Und die leere Flaeche steht nicht mehr darunter.
  assert.equal(html.includes("Nga telefoni ose kamera"), false);
});

test("the preview carries the photo while it is still uploading", () => {
  // Auf die Antwort des Servers zu warten, bevor ueberhaupt etwas zu sehen
  // ist, fuehlt sich auf einer langsamen Leitung wie ein Fehler an.
  const html = renderGoOfferEditorCore({
    editor: editor(OFFER, { photo: { status: "uploading", previewUrl: "blob:local-1", error: "" } }),
    businessName: "Casa Rita",
    deps
  });
  assert.ok(html.includes('src="blob:local-1"'));
  assert.ok(html.includes("Po ngarkohet..."));
  assert.ok(html.includes("go-offer-photo__frame--busy"));
  // Die Vorschau zeigt dasselbe Bild - in der Fassung mit Bild oben.
  assert.ok(html.includes("mnyra-go-page__card--hero"));
});

test("a photo that did not upload keeps the picture and says what happened", () => {
  const html = renderGoOfferEditorCore({
    editor: editor(OFFER, { photo: { status: "error", previewUrl: "blob:local-1", error: "Maksimumi 15MB per foto." } }),
    businessName: "Casa Rita",
    deps
  });
  assert.ok(html.includes("Maksimumi 15MB per foto."));
  // Der naechste Handgriff ist "noch einmal", nicht "von vorne".
  assert.ok(html.includes("data-go-offer-photo-pick"));
  assert.ok(html.includes('src="blob:local-1"'));
});

test("the chosen photo goes to the server, and only its address into the draft", () => {
  const uploads = [];
  const controller = panel({}, {
    uploadImageFn: async (file, ownerId) => {
      uploads.push({ name: file.name, ownerId });
      return { url: "https://cdn.mnyra.com/raw.jpg", cdnUrl: "https://cdn.mnyra.com/go/pizza.jpg" };
    }
  });
  const current = controller.__view();
  current.editor = controller.__buildDraft(null);

  return controller.__pickOfferPhoto({ name: "pizza.heic", type: "image/heic", size: 4200 }).then(() => {
    assert.deepEqual(uploads, [{ name: "pizza.heic", ownerId: "rest-1" }]);
    // Die Adresse des Servers, nicht die des Telefons.
    assert.equal(current.editor.draft.imageUrl, "https://cdn.mnyra.com/go/pizza.jpg");
    assert.equal(current.editor.photo.status, "idle");
    assert.equal(current.editor.photo.previewUrl, "");
    // Und "Hiq" nimmt sie wieder weg.
    controller.__removeOfferPhoto();
    assert.equal(current.editor.draft.imageUrl, "");
  });
});

test("an upload that failed leaves the draft alone", () => {
  const controller = panel({}, {
    uploadImageFn: async () => { throw new Error("Maksimumi 15MB per foto."); }
  });
  const current = controller.__view();
  current.editor = controller.__buildDraft(null);

  return controller.__pickOfferPhoto({ name: "big.jpg", type: "image/jpeg", size: 99 }).then(() => {
    assert.equal(current.editor.photo.status, "error");
    assert.equal(current.editor.photo.error, "Maksimumi 15MB per foto.");
    // Ein Angebot mit einer Adresse, die niemand ausliefert, waere schlimmer
    // als ein Angebot ohne Foto.
    assert.equal(current.editor.draft.imageUrl, "");
  });
});

test("without an upload service the section says so instead of failing quietly", () => {
  const controller = panel();
  const current = controller.__view();
  current.editor = controller.__buildDraft(null);
  return controller.__pickOfferPhoto({ name: "x.jpg", type: "image/jpeg", size: 1 }).then(() => {
    assert.equal(current.editor.photo.status, "error");
    assert.ok(current.editor.photo.error);
    assert.equal(current.editor.draft.imageUrl, "");
  });
});

// ===========================================================================
// Der Zeitplan (Punkt 21 bis 24, 47.5 bis 47.7).
// ===========================================================================

test("the schedule asks when the offer is valid, in words a landlord uses", () => {
  const html = renderGoOfferEditorCore({ editor: editor(), businessName: "Casa Rita", deps });
  assert.ok(html.includes("Kur vlen oferta?"));
  assert.ok(html.includes("Gjithmonë"));
  assert.ok(html.includes("Orar specifik"));
  // "Nonstop" klang wie eine Aussage ueber die Nacht, "Specifik" allein sagte
  // nicht, worin (Punkt 47.6, 47.7).
  assert.equal(html.includes("Nonstop"), false);
  assert.equal(/>Specifik</.test(html), false);
});

test("Gjithmonë leaves the form alone, Orar specifik brings days and hours", () => {
  const always = renderGoOfferEditorCore({
    editor: editor(normalizeGoOffer({ restaurantId: "rest-1", schedule: { mode: "always" } })),
    businessName: "Casa Rita",
    deps
  });
  // Punkt 22, 44: keine weiteren Felder.
  assert.equal(always.includes("data-go-offer-from"), false);
  assert.equal(always.includes("data-go-offer-day"), false);

  const windows = renderGoOfferEditorCore({ editor: editor(), businessName: "Casa Rita", deps });
  assert.ok(windows.includes("Ditët"));
  assert.ok(windows.includes("Orari"));
  assert.ok(windows.includes(">Nga<") || windows.includes("Nga"));
  assert.ok(windows.includes("Deri"));
  assert.equal((windows.match(/data-go-offer-day="/g) || []).length, 7);
  // Das Angebot gilt Hën bis Enj - genau diese vier Pillen stehen offen.
  assert.ok(/data-go-offer-day="mon" aria-pressed="true"/.test(windows));
  assert.ok(/data-go-offer-day="fri" aria-pressed="false"/.test(windows));
  assert.ok(windows.includes('data-go-offer-from value="14:00"'));
  assert.ok(windows.includes('data-go-offer-to value="18:00"'));
});

test("a schedule without any day never happens, so the last day stays", () => {
  const controller = panel();
  const current = controller.__view();
  current.editor = controller.__buildDraft(normalizeGoOffer({
    restaurantId: "rest-1",
    benefit: { kind: "percent", percent: 10 },
    schedule: { mode: "windows", days: ["mon"], windows: [{ start: "07:00", end: "11:30" }] }
  }));
  controller.__patchDraft({
    schedule: { ...current.editor.draft.schedule, days: [] }
  });
  // normalizeGoSchedule faellt bei leeren Tagen auf alle sieben zurueck - ein
  // Zeitfenster an keinem Tag waere ein Angebot, das es nie gibt.
  assert.deepEqual(current.editor.draft.schedule.days, ["mon", "tue", "wed", "thu", "fri", "sat", "sun"]);
});

// ===========================================================================
// Was fehlt, sagt der Editor an dem Feld, an dem es fehlt (Punkt 43).
// ===========================================================================

test("every message carries the name of its field, so the editor can drive there", () => {
  const html = renderGoOfferEditorCore({
    editor: editor(normalizeGoOffer({ restaurantId: "rest-1", benefit: { kind: "bundle" } }), {
      errors: [
        { field: "benefitItem", message: "Shkruaj çka përfshin paketa." },
        { field: "category", message: "Zgjidh kur duhet të shfaqet oferta." }
      ]
    }),
    businessName: "Casa Rita",
    deps
  });
  assert.ok(html.includes('data-go-error="benefitItem"'));
  assert.ok(html.includes('data-go-error="category"'));
  assert.ok(html.includes("Shkruaj çka përfshin paketa."));
  // Und die Sections tragen ihre Namen, damit die Fahrt dorthin moeglich ist.
  assert.ok(html.includes('data-go-section="benefit"'));
  assert.ok(html.includes('data-go-section="photo"'));
  assert.ok(html.includes('data-go-section="partyRanges"'));
  assert.ok(html.includes('data-go-section="category"'));
  assert.ok(html.includes('data-go-section="schedule"'));
});

// ===========================================================================
// Die drei Fassungen derselben Karte (Punkt 27 bis 32).
// ===========================================================================

test("without a photo there is only the quiet card - whatever was asked for", () => {
  // Eine Karte, die eine Bildflaeche freihaelt, die nie gefuellt wird, ist
  // schlechter als eine ohne Bild (Punkt 13, 27).
  assert.equal(resolveGoCardVariant({ imageUrl: "", variant: GO_CARD_VARIANT_HERO }), GO_CARD_VARIANT_CLEAN);
  assert.equal(resolveGoCardVariant({ imageUrl: "", variant: GO_CARD_VARIANT_COMPACT }), GO_CARD_VARIANT_CLEAN);
  // Mit Foto und ohne Wunsch: das Bild oben.
  assert.equal(resolveGoCardVariant({ imageUrl: "https://cdn/x.jpg" }), GO_CARD_VARIANT_HERO);
  assert.equal(resolveGoCardVariant({ imageUrl: "https://cdn/x.jpg", variant: "nonsense" }), GO_CARD_VARIANT_HERO);

  const clean = renderGoOfferCardCore({ businessName: "Casa Rita", benefitLabel: "-20% në pije", variant: GO_CARD_VARIANT_HERO });
  assert.equal(clean.includes("mnyra-go-page__card-photo"), false);
  assert.equal(clean.includes("mnyra-go-page__card--hero"), false);
  assert.ok(clean.includes("mnyra-go-page__cta"));
});

test("with a photo the picture sits on top, in the format the camera delivers", () => {
  const html = renderGoOfferCardCore({
    businessName: "Casa Rita",
    imageUrl: "https://cdn.mnyra.com/go/pizza.jpg",
    benefitLabel: "-20% në pije",
    meta: [{ icon: "users", label: "Të gjithë" }]
  });
  assert.ok(html.includes("mnyra-go-page__card--hero"));
  assert.ok(html.includes('class="mnyra-go-page__card-photo" src="https://cdn.mnyra.com/go/pizza.jpg"'));
  // Das Bild steht ueber dem Namen des Lokals und dem Vorteil.
  assert.ok(html.indexOf("card-photo") < html.indexOf("card-who"));
  assert.ok(html.indexOf("card-who") < html.indexOf("card-benefit"));
  // Und der Knopf bleibt der letzte.
  assert.ok(html.indexOf("card-only") < html.indexOf("mnyra-go-page__cta"));
});

test("several offers at once get the small picture beside the benefit", () => {
  const html = renderGoOfferCardCore({
    businessName: "Casa Rita",
    imageUrl: "https://cdn.mnyra.com/go/burger.jpg",
    variant: GO_CARD_VARIANT_COMPACT,
    benefitView: {
      eyebrow: "Paketë GO",
      headline: "2 Burger + 2 Pije",
      priceRegular: "20,00 €",
      priceGo: "14,90 €",
      savingLabel: "Kursen 5,10 €"
    },
    meta: [{ icon: "users", label: "3–4 persona" }],
    ctaAttrs: 'data-go-accept="offer-1"'
  });
  assert.ok(html.includes("mnyra-go-page__card--compact"));
  assert.ok(html.includes("mnyra-go-page__card-top"));
  assert.ok(html.includes("2 Burger + 2 Pije"));
  assert.ok(html.includes("14,90 €"));
  // Der Knopf gehoert der Karte, nicht der rechten Spalte - er steht unter
  // beiden.
  assert.ok(html.indexOf("card-top") < html.indexOf("mnyra-go-page__cta"));
  // "për grupin tuaj" faellt in der gedraengten Fassung weg: Die Zeile sagt
  // nichts, was die Gruppengroesse darunter nicht schon sagt.
  assert.equal(html.includes("për grupin tuaj"), false);
  assert.ok(html.includes('data-go-accept="offer-1"'));
});

test("the stylesheet carries all three fassungen, not just the quiet one", () => {
  const html = renderGoOfferEditorCore({ editor: editor(), businessName: "Casa Rita", deps });
  assert.ok(html.includes(".mnyra-go-page__card--hero"));
  assert.ok(html.includes(".mnyra-go-page__card--compact .mnyra-go-page__card-top"));
  assert.ok(html.includes("aspect-ratio: 16 / 9;"));
});

// ===========================================================================
// Eine Klasse, die es nicht gibt, ist keine Klasse.
//
// Das Tailwind-Blatt dieser App wird STATISCH erzeugt: Es enthaelt nur
// Klassen, die zum Zeitpunkt der Erzeugung schon irgendwo standen. Wer eine
// neue schreibt - `bg-indigo-300`, `min-h-[44px]`, `text-white/60` - bekommt
// keine Regel, keinen Fehler und keine Warnung. Er bekommt ein Element ohne die
// Eigenschaft, um die es ihm ging.
//
// Genau so verschwand der AKTIVIZO-Knopf: `bg-indigo-300` fuer den unfertigen
// Zustand, weisse Schrift darauf, und im Telefon stand am Fuss des Modals eine
// leere weisse Flaeche. Ein Knopf, den man nicht sieht, fehlt.
//
// Dieser Test zeichnet das Modal in allen Zustaenden, sammelt jede Klasse aus
// der Ausgabe und verlangt fuer jede eine Regel - im Tailwind-Blatt, in einem
// Stylesheet der App, oder in dem <style>, das das Modal selbst mitbringt.
// ===========================================================================

function goSurfaceHtml() {
  const base = { restaurantId: "rest-1", partyRanges: ["1-2"], schedule: { mode: "always" } };
  const state = (draft, over = {}) => ({
    mode: "create", draft, benefits: {}, percentCustom: false, intents: [],
    photo: { status: "idle", previewUrl: "", error: "" },
    windowFrom: "14:00", windowTo: "18:00", errors: [], status: "", saving: false, ...over
  });
  const editors = [
    // Der Fall aus dem Telefon: eine neue Oferta, in der noch nichts steht.
    state(normalizeGoOffer({ ...base, benefit: { kind: "percent", percent: 0 } })),
    // Und dieselbe, fertig.
    state(normalizeGoOffer({ ...base, benefit: { kind: "percent", percent: 20, scope: "drinks" } }), { intents: ["drinks"] }),
    state(normalizeGoOffer({ ...base, benefit: { kind: "percent", percent: 35 } }), { percentCustom: true }),
    state(normalizeGoOffer({ ...base, benefit: { kind: "bundle", itemName: "2 Burger", regularPrice: 20, goPrice: 14.9 } })),
    state(normalizeGoOffer({ ...base, benefit: { kind: "freeItem", itemName: "1 Pije", conditionType: "custom", customCondition: "x" } })),
    state(normalizeGoOffer({ ...base, benefit: { kind: "specialPrice", itemName: "Pizza", regularPrice: 8, goPrice: 5.9 } })),
    // Eine Angebotsart von damals, die es im Formular nicht mehr gibt.
    state(normalizeGoOffer({ ...base, benefit: { kind: "table" } })),
    // Das Foto: unterwegs, gescheitert, fertig.
    state(normalizeGoOffer({ ...base, benefit: { kind: "percent", percent: 10 } }), { photo: { status: "uploading", previewUrl: "blob:x", error: "" } }),
    state(normalizeGoOffer({ ...base, benefit: { kind: "percent", percent: 10 } }), { photo: { status: "error", previewUrl: "blob:x", error: "E" } }),
    state(normalizeGoOffer({ ...base, benefit: { kind: "percent", percent: 10 }, imageUrl: "https://cdn.mnyra.com/x.jpg" })),
    // Orar specifik, waehrend gespeichert wird, mit jeder Meldung, die es gibt.
    state(normalizeGoOffer({
      ...base,
      benefit: { kind: "bundle" },
      schedule: { mode: "windows", days: ["mon"], windows: [{ start: "07:00", end: "11:30" }] }
    }), {
      saving: true,
      status: "Gabim",
      errors: ["benefit", "benefitItem", "benefitPercent", "benefitScope", "benefitCondition",
        "regularPrice", "goPrice", "partyRanges", "category", "schedule"]
        .map((field) => ({ field, message: "x" }))
    })
  ];
  const offer = normalizeGoOffer({ ...base, id: "o1", benefit: { kind: "percent", percent: 10 } });
  return [
    ...editors.map((editor) => renderGoOfferEditorCore({ editor, businessName: "Casa Rita", deps })),
    // Die Seite selbst dazu, mit jeder ihrer vier Listen - und einmal pausiert.
    ...["active", "offers", "archive", "options"].map((tab) => renderGoAdminBodyCore({
      tab, restaurantName: "Casa Rita", offers: [offer], bookings: [booking()],
      search: { code: "A7K2", status: "Ky kod nuk u gjet.", busy: true, booking: booking() },
      stats: { impressions: 4, accepted: 1 }, settings: { pausedUntil: "2026-08-13T18:00:00.000Z" },
      paused: tab === "options", error: "Gabim", deps
    })),
    renderGoAdminNoBusinessStateCore({ deps }),
    renderGoAdminNoBusinessStateCore({ deps, resolving: true }),
    renderBusinessGoCardCore({ enabled: true, unseenCount: 2, activeOffers: 1, todayBookings: 3, iconFn: deps.icon })
  ].join("");
}

test("every class the GO panel writes has a rule somewhere", () => {
  const html = goSurfaceHtml();

  // Alles, was der Browser an CSS bekommt: das statische Tailwind-Blatt, die
  // eigenen Stylesheets, die Regeln in der Seite selbst - und die <style>, die
  // das Modal mitbringt.
  const dir = new URL("../apps/menyra-social/styles/", import.meta.url);
  let css = readdirSync(dir)
    .filter((name) => name.endsWith(".css"))
    .map((name) => readFileSync(new URL(name, dir), "utf8"))
    .join("");
  css += readFileSync(new URL("../apps/menyra-social/index.html", import.meta.url), "utf8");
  // Die GO-Karte steht im Paneli und traegt dessen Klassen (mnyra-dash__*).
  // Deren Regeln bringt das Paneli selbst mit - also gehoert sein Stylesheet
  // hier dazu.
  css += readFileSync(new URL("../apps/menyra-social/core/dashboard/dashboard-render-utils.js", import.meta.url), "utf8");
  css += (html.match(/<style>[\s\S]*?<\/style>/g) || []).join("");

  const classes = new Set();
  for (const match of html.matchAll(/class="([^"]*)"/g)) {
    match[1].split(/\s+/).forEach((entry) => {
      // Was der Renderer erst einsetzt, ist hier keine Klasse.
      if (entry && !entry.includes("${")) classes.add(entry);
    });
  }
  assert.ok(classes.size > 100, `only ${classes.size} classes seen`);

  // Im Blatt steht ".text-\[9px\]" - die Sonderzeichen tragen dort einen
  // echten Backslash. Er darf stehen, muss aber nicht.
  const hasRule = (name) => new RegExp(
    "\\." + [...name].map((ch) => ("[].:/%()#,".includes(ch) ? "\\\\?\\" + ch : ch.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))).join("") + "(?![\\w-])"
  ).test(css);

  const missing = [...classes].sort().filter((name) => !hasRule(name));
  assert.deepEqual(missing, [], `classes without a rule: ${missing.join(", ")}`);
});

test("the activate button carries its colour in the modal stylesheet", () => {
  // Nicht in einer Tailwind-Klasse: Der Fuss ist weiss, die Schrift des Knopfes
  // ist weiss, und eine Farbe, die fehlt, macht daraus eine leere Flaeche.
  const incomplete = renderGoOfferEditorCore({
    editor: editor(normalizeGoOffer({ restaurantId: "rest-1", benefit: { kind: "bundle" } }), { intents: ["food"] }),
    businessName: "Casa Rita",
    deps
  });
  assert.ok(incomplete.includes(".go-offer-save { background: #a5b4fc;"));
  assert.ok(/data-go-offer-save[^>]*class="[^"]*go-offer-save"/.test(incomplete));
  // Am KNOPF steht der fertige Zustand nicht - im Stylesheet darueber steht
  // seine Regel selbstverstaendlich schon.
  assert.equal(/data-go-offer-save[^>]*go-offer-save--ready/.test(incomplete), false);

  const complete = renderGoOfferEditorCore({
    editor: editor(normalizeGoOffer({
      restaurantId: "rest-1",
      benefit: { kind: "bundle", itemName: "2 Burger + 2 Pije", regularPrice: 20, goPrice: 14.9 }
    }), { intents: ["food"] }),
    businessName: "Casa Rita",
    deps
  });
  assert.ok(complete.includes(".go-offer-save--ready {"));
  assert.ok(/data-go-offer-save[^>]*class="[^"]*go-offer-save go-offer-save--ready"/.test(complete));
});
