import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync, readdirSync } from "node:fs";

import {
  GO_TAB_GROUPS,
  goTabGroupIndex,
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
import { buildGoDayKey } from "../shared/go/go-booking-core.js";
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
  // Abschnitten - wie in den Ofertat und im Menue-Editor. Aktivizo traegt
  // seit dem Umbau seine eigene, dunkle Arbeitskarte; die Abschnittsform
  // steht in den Reitern, die Listen zeigen.
  // "Ne pritje" traegt diese Form seit dem Umbau NICHT mehr: Dort stehen die
  // Vorgaenge direkt unter den Pillen, ohne Karte darum. Die Abschnittsform
  // steht weiter in den Reitern, die eine Liste in einer Karte zeigen.
  const listTab = renderGoAdminBodyCore({
    restaurantName: "Casa Rita",
    tab: "finalized",
    bookings: [booking({ status: "finalized" })],
    deps
  });
  assert.ok(listTab.includes("rounded-[2.5rem]"));
  assert.ok(listTab.includes("text-[9px] font-black text-indigo-600 uppercase tracking-widest"));
  assert.ok(listTab.includes("font-black italic tracking-tighter"));
  // Das untere Polster kommt nicht mehr von app-main-content-safe, sondern vom
  // Auslauf des Bentos - genau wie im Paneli. Zwei Polster untereinander waeren
  // ein grauer Streifen unter der weissen Flaeche.
  assert.equal(html.includes("app-main-content-safe"), false);
  assert.ok(html.includes(`<div class="mnyra-work animate-in`));
  assert.ok(html.includes("Casa Rita"));
  // Und kein Overlay: keine feste Flaeche, kein abgedunkelter Hintergrund.
  assert.equal(html.includes("fixed inset-0"), false);
  assert.equal(html.includes("bg-slate-900/50"), false);
  assert.equal(html.includes("aria-modal"), false);
});

test("the page is headed like the Qyteti: the name, and one line under it", () => {
  // Oben stand dreimal, wo das Lokal ist - Marke, Ueberschrift, Name -, bevor
  // einmal stand, was es hier tun kann. Jetzt steht dort dieselbe zweizeilige
  // Ueberschrift wie im Qyteti: der Name, darunter das Lokal in klein und grau.
  const html = renderGoAdminBodyCore({ restaurantName: "Casa Rita", tab: "active", deps });

  // Dieselben Klassen wie die Ueberschrift des Qyteti-Feeds.
  // Die Groesse auf einem breiten Bildschirm und der Abstand der Unterzeile
  // stehen im Stylesheet der Seite (go-title, go-title-sub): md:text-2xl und
  // mt-0.5 gibt es im statischen Tailwind-Blatt nicht.
  assert.ok(html.includes(`<h1 class="go-title text-xl font-black tracking-tight text-slate-900">`));
  assert.ok(html.includes(`<p class="go-title-sub text-[11px] text-slate-400 font-semibold">`));
  // Auf einem breiten Bildschirm wird die Ueberschrift NICHT groesser: im
  // Paneli tut sie das auch nicht, und die Huelle der App ist ueberall gleich
  // breit. Eine Seite, die ab 768px anders aussieht als die andere, war genau
  // der Bruch, der beim Wechsel auffiel.
  assert.equal(html.includes(".go-title { font-size: 1.5rem;"), false);
  // Der Abstand der Unterzeile steht weiter im Blatt der Seite (mt-0.5 gibt es
  // im statischen Tailwind-Blatt nicht).
  assert.ok(html.includes(".go-title-sub { margin-top: 2px; }"));

  // Der Name der Marke steht als ein Wort, das GO darin im Blau der Marke.
  assert.ok(html.includes(`MNYRA<span class="text-indigo-600">GO</span>`));
  // Unter dem Namen steht NUR das Lokal - kein Wort davor, keine Klammern.
  assert.ok(html.includes(`font-semibold">Casa Rita</p>`));
  assert.equal(html.includes("Editori Casa Rita"), false);
  assert.equal(html.includes("Editori (Casa Rita)"), false);

  // Die alte dreizeilige Ueberschrift ist weg.
  assert.equal(html.includes("font-black italic uppercase tracking-tighter"), false);
});

test("without a resolved business the heading carries no leftover subtitle", () => {
  const html = renderGoAdminBodyCore({ restaurantName: "", tab: "active", deps });
  // Steht kein Lokal fest, steht unter dem Namen gar nichts - kein leerer
  // Absatz und kein hängendes Wort, das das Lokal ersetzen soll.
  assert.equal(html.includes(`<p class="go-title-sub`), false);
  assert.equal(html.includes("Editori"), false);
  // Und rechts daneben steht nichts mehr: der runde violette Knopf ist weg.
  assert.equal(html.includes("go-head__plus"), false);
});

test("the settings button is gone from the page content", () => {
  const html = renderGoAdminBodyCore({ restaurantName: "Casa Rita", tab: "active", deps });

  // Die Titelzeile ist jetzt das Gegenstueck zur Begruessung im Paneli: sie
  // traegt die gemeinsame Geometrie und darin nur noch den Namen.
  assert.ok(html.includes(`<div class="mnyra-work__head">`));
  assert.ok(html.includes(`<div class="go-head__brand">`));
  assert.ok(html.includes(".mnyra-work__head {"));

  // Der runde violette Knopf zu den Einstellungen steht nicht mehr im Inhalt.
  // Sein Weg steht jetzt in der globalen Kopfzeile, links neben der Sprache -
  // auf dieser Seite genau wie im Paneli.
  assert.equal(html.includes("go-head__plus"), false);
  assert.equal(html.includes(`data-go-business-tab="options"`), false);
  assert.equal(html.includes("go-head__action-label"), false);
  assert.equal(html.includes(">Krijo ofertë<"), false);

  // Und das Plus fuer eine neue Oferte ist nicht verschwunden, es steht im
  // Reiter Ofertat ueber der Liste, zu der es gehoert.
  assert.equal(html.includes("data-go-offer-new"), false);
  const offersTab = renderGoAdminBodyCore({ restaurantName: "Casa Rita", tab: "offers", deps });
  assert.equal((offersTab.match(/data-go-offer-new/g) || []).length, 1);

  // Die Einstellungen selbst sind unveraendert erreichbar - der Reiter
  // "options" zeichnet dieselbe Seite wie vorher.
  const options = renderGoAdminBodyCore({ restaurantName: "Casa Rita", tab: "options", deps });
  assert.ok(options.includes("data-go-pause="));
});

test("the plus over the offer list opens the editor that already exists", () => {
  // Es gibt genau EINEN Ausloeser fuer den Editor, und er steht dort, wo die
  // Liste steht, zu der eine neue Oferte gehoert.
  const list = renderGoAdminBodyCore({ restaurantName: "Casa Rita", tab: "offers", offers: [OFFER], deps });
  assert.equal(list.split("data-go-offer-new").length - 1, 1);

  // Die Seite zeichnet den Editor NICHT selbst: er steht im Overlay, das der
  // Controller schreibt.
  assert.equal(list.includes("data-go-offer-editor"), false);
});

test("the header row never wraps or overlaps, on a phone as on a desktop", () => {
  const html = renderGoAdminBodyCore({
    restaurantName: "Restorant & Lounge Panorama e Prishtinës",
    tab: "active",
    deps
  });

  // Der Textblock darf schrumpfen - ein langer Lokalname soll die Zeile nicht
  // auseinanderziehen.
  assert.ok(html.includes(".go-head__brand { min-width: 0; }"));
  // Name und Lokal stehen in je einer Zeile.
  assert.ok(html.includes("text-overflow: ellipsis;"));
  assert.ok(html.includes("white-space: nowrap;"));
  // Und die Zeile behandelt Telefon und Schreibtisch gleich: kein eigener
  // Bruch bei 768px mehr, weder hier noch in der Karten-Reihe darunter. Das
  // Paneli macht auch keinen - genau daran lief der Wechsel auseinander.
  assert.equal(html.includes("@media (min-width: 768px) {"), false);
  assert.equal(html.includes(".go-head__action-label { display: none; }"), false);
});

const OVERVIEW = Object.freeze({
  uniqueViewers: 42,
  accepted: 7,
  visits: 3,
  visitors: 11,
  openCents: 450
});

test("the row is the funnel of the day in four numbers, and the bill next to it", () => {
  const html = renderGoAdminBodyCore({
    restaurantName: "Casa Rita",
    tab: "active",
    overview: OVERVIEW,
    deps
  });

  // Die Reihe laeuft ueber das Seitenpolster hinaus und schiebt die erste
  // Karte mit ihrem eigenen Polster wieder hinein. Beides steht seit der
  // Vereinheitlichung mit dem Paneli in der gemeinsamen Geometrie - die Reihe
  // hier ist woertlich dieselbe wie dort.
  assert.ok(html.includes(`<div class="mnyra-work__cards" data-go-kpis>`));
  assert.ok(html.includes("margin: 0 calc(-1 * var(--work-inline)) 0;"));
  assert.ok(html.includes("padding: 0 var(--work-inline);"));
  // Zweieinhalb Karten im Bild - fuenf passen auf kein Telefon nebeneinander.
  assert.ok(html.includes("flex: 0 0 calc((100% + var(--work-inline) - 20px) / 2.5);"));

  // Genau fuenf Karten, in der Reihenfolge des Trichters.
  const order = ["views", "chosen", "visits", "guests", "due"]
    .map((key) => html.indexOf(`data-go-kpi="${key}"`));
  assert.equal(order.every((position) => position > -1), true, JSON.stringify(order));
  assert.deepEqual(order, [...order].sort((a, b) => a - b));
  assert.equal((html.match(/data-go-kpi="/g) || []).length, 5);

  // Jede Karte traegt Zeitraum, Symbol, Zahl, Titel und Beschreibung.
  assert.ok(html.includes(`<span class="go-kpi__period">Sot</span>`));
  assert.ok(html.includes(`<span class="go-kpi__period">Aktuale</span>`));
  ["eye", "ticket", "badge-check", "users", "wallet"].forEach((name) => {
    assert.ok(html.includes(`data-lucide="${name}"`), name);
  });

  // Die vier Zahlen stehen an ihrer Stufe - keine ist eine andere.
  assert.ok(html.includes(`<p class="go-kpi__value">42</p>`));
  assert.ok(html.includes(`<p class="go-kpi__value">7</p>`));
  assert.ok(html.includes(`<p class="go-kpi__value">3</p>`));
  assert.ok(html.includes(`<p class="go-kpi__value">11</p>`));
  assert.ok(html.includes(`<p class="go-kpi__value">4,50 €</p>`));

  [
    "Shikime të ofertave",
    "Sa persona i kanë parë ofertat e tua.",
    "Oferta të zgjedhura",
    "Sa herë klientët kanë zgjedhur ofertën tënde.",
    "Vizita të realizuara",
    "Oferta të përdorura dhe verifikuara në lokal.",
    "Klientë të sjellë",
    "Sa persona kanë ardhur përmes MNYRA GO.",
    "Për pagesë",
    "Shuma aktuale për MNYRA GO."
  ].forEach((text) => assert.ok(html.includes(text), text));

  // Die alte Reihe ist weg - samt dem Handgriff, der nie einen Handler hatte.
  // Nachgesehen wird IN der Reihe: "Aktivizo ofertën" stand dort einmal als
  // Handgriff und ist heute die Ueberschrift der Arbeitskarte darunter.
  const rowStart = html.indexOf("data-go-kpis");
  const rowEnd = html.indexOf("go-kpi__tail", rowStart);
  assert.ok(rowStart > -1 && rowEnd > rowStart);
  const kpiRow = html.slice(rowStart, rowEnd);
  [
    "go-hl__card", "Skano ofertën", "Ofertën e kanë parë sot", "E kanë pranuar sot",
    "Të reja", "Mysafirë", "Aktivizo ofertën"
  ].forEach((gone) => {
    assert.equal(kpiRow.includes(gone), false, gone);
  });
  assert.equal(html.includes("grid grid-cols-2 gap-3"), false);
});

test("the four analytics cards are blue, the bill is not", () => {
  const html = renderGoAdminBodyCore({ restaurantName: "Casa Rita", overview: OVERVIEW, deps });

  // Ganze Flaeche im Blau der Marke, Zahl und Titel weiss, Zeitraum und
  // Beschreibung abgeschwaecht.
  assert.ok(html.includes("background: #4f46e5;"));
  assert.ok(html.includes(".go-kpi__value {"));
  assert.ok(html.includes("color: rgb(255 255 255 / 0.62);"));
  assert.ok(html.includes("color: rgb(255 255 255 / 0.72);"));

  // Die Rechnung traegt ihre eigene Flaeche und einen eigenen Abstand davor -
  // helles Lavendel mit einem Rand im Violett der Marke, nicht die volle
  // Farbe der vier davor.
  assert.ok(html.includes("go-kpi__card go-kpi__card--due"));
  assert.ok(html.includes(".go-kpi__card--due {"));
  assert.ok(html.includes("background: #f5f3ff;"));
  assert.ok(html.includes("border-color: #c7d2fe;"));
  assert.ok(html.includes("margin-left: 8px;"));
  // AKTUALE und das Symbol im Violett der Marke, der Betrag im tiefsten Ton.
  assert.ok(html.includes(".go-kpi__card--due .go-kpi__period { color: #4f46e5; }"));
  assert.ok(html.includes(".go-kpi__card--due .go-kpi__icon { color: #4f46e5; }"));
  assert.ok(html.includes(".go-kpi__card--due .go-kpi__value { color: #1e1b4b; }"));

  // Und weder Rot noch Orange: Ein offener Betrag ist kein Fehler.
  const row = html.slice(html.indexOf(".go-kpi__card {"), html.indexOf(".go-kpi__tail"));
  ["#dc2626", "#ef4444", "#b91c1c", "#fffbeb", "#fde68a", "#d97706", "#b45309", "text-rose", "text-red", "text-amber"]
    .forEach((tone) => assert.equal(row.includes(tone), false, tone));

  // Keine Bildflaeche mehr ueber der Zahl - das Symbol steht klein oben rechts.
  assert.ok(html.includes("width: 16px;"));
  assert.equal(html.includes("height: 140px;"), false);
});

test("nothing due reads as good news, not as a zero", () => {
  const html = renderGoAdminBodyCore({
    restaurantName: "Casa Rita",
    overview: { ...OVERVIEW, openCents: 0 },
    deps
  });
  assert.ok(html.includes(`<p class="go-kpi__value">0,00 €</p>`));
  assert.ok(html.includes("Asgjë për pagesë."));
  assert.equal(html.includes("Shuma aktuale për MNYRA GO."), false);
  assert.ok(html.includes("go-kpi__card--clear"));
  assert.ok(html.includes("background: #f0fdf4;"));
});

test("a number that has not arrived is a bar, not a zero", () => {
  // Von den fuenf Zahlen ist genau eine Null eine schlechte Nachricht - und
  // keine davon darf entstehen, weil der Server noch nicht geantwortet hat.
  const html = renderGoAdminBodyCore({ restaurantName: "Casa Rita", deps });
  assert.equal((html.match(/<span class="go-kpi__skeleton/g) || []).length, 5);
  assert.equal(html.includes(`<p class="go-kpi__value">0</p>`), false);
  assert.equal(html.includes("0,00 €"), false);
  // Und kein Strich mehr: Ein Strich ist ein Zeichen, ein Balken ist eine
  // Stelle, an der etwas fehlt.
  assert.equal(html.includes(`<p class="go-kpi__value">–</p>`), false);
});

test("only the number is a skeleton - the card itself stands complete", () => {
  // Kein Skelett der ganzen Karte: Ein graues Rechteck verspraeche, dass
  // gleich etwas ANDERES kommt, und es kommt nur eine Zahl.
  const html = renderGoAdminBodyCore({ restaurantName: "Casa Rita", deps });

  assert.equal((html.match(/data-go-kpi="/g) || []).length, 5);
  // Zeitraum, Symbol, Titel und Beschreibung stehen von der ersten Zeichnung
  // an da - alle fuenf, vollstaendig.
  assert.equal((html.match(/class="go-kpi__period"/g) || []).length, 5);
  assert.equal((html.match(/class="go-kpi__icon"/g) || []).length, 5);
  assert.equal((html.match(/class="go-kpi__title"/g) || []).length, 5);
  assert.equal((html.match(/class="go-kpi__note"/g) || []).length, 5);
  ["Shikime të ofertave", "Oferta të zgjedhura", "Vizita të realizuara", "Klientë të sjellë", "Për pagesë"]
    .forEach((title) => assert.ok(html.includes(title), title));
  ["eye", "ticket", "badge-check", "users", "wallet"]
    .forEach((name) => assert.ok(html.includes(`data-lucide="${name}"`), name));

  // Und die Karte traegt schon ihre Farbe - auch die der Rechnung.
  assert.ok(html.includes("go-kpi__card go-kpi__card--due"));
  // Solange der Betrag nicht feststeht, steht dort der Satz, der immer
  // stimmt - nicht die gute Nachricht, die noch niemand geben kann.
  assert.ok(html.includes("Shuma aktuale për MNYRA GO."));
  assert.equal(html.includes("Asgjë për pagesë."), false);
  // Der Klassenname steht immer im Stylesheet - gesucht ist die Karte.
  assert.equal(html.includes(`class="go-kpi__card go-kpi__card--due go-kpi__card--clear"`), false);
});

test("the bar sits where the number will sit and holds its height", () => {
  const html = renderGoAdminBodyCore({ restaurantName: "Casa Rita", deps });

  // Der Balken steht IM Absatz der Zahl - deshalb misst der Absatz mit dem
  // Balken dieselbe Zeilenhoehe wie spaeter mit der Zahl.
  assert.ok(html.includes(`<p class="go-kpi__value" role="status"`));
  assert.ok(/<p class="go-kpi__value"[^>]*><span class="go-kpi__skeleton[^"]*"><\/span><\/p>/.test(html));
  // Die Hoehe steht in em und nicht in Pixeln: Auf einem breiten Bildschirm
  // wird die Zahl groesser, der Balken also auch. Er sitzt niedriger als die
  // Zeile und mittig darin - der Rest der Hoehe steht als Rand darum, damit
  // der Absatz genau so hoch bleibt wie mit der Zahl.
  assert.ok(html.includes("height: 0.62em;"));
  assert.ok(html.includes("margin: 0.19em 0;"));
  // Ganz rund und leise.
  assert.ok(html.includes("border-radius: 999px;"));
  assert.ok(html.includes("opacity: 0.22;"));
  // Etwa so breit wie die Zahl, die kommt - und der Betrag ist breiter.
  assert.ok(html.includes("width: 2.4ch;"));
  assert.ok(html.includes(".go-kpi__skeleton--wide { width: 5.2ch; }"));
  assert.ok(html.includes(`class="go-kpi__skeleton go-kpi__skeleton--wide"`));

  // Dezent, mit Puls - und ohne, wenn jemand Bewegung abbestellt hat.
  assert.ok(html.includes("animation: go-kpi-pulse 2s ease-in-out infinite;"));
  assert.ok(html.includes("@keyframes go-kpi-pulse {"));
  assert.ok(html.includes("@media (prefers-reduced-motion: reduce) {"));

  // Ein Balken laesst sich nicht vorlesen - der Satz daneben schon.
  assert.ok(html.includes(`aria-label="Shikime të ofertave: Po ngarkohet"`));
});

test("each number waits for itself, not for the slowest one", () => {
  // Zwei Zahlen sind da, drei noch nicht. Die zwei stehen sofort - sie warten
  // nicht darauf, dass die Reihe vollstaendig wird.
  const html = renderGoAdminBodyCore({
    restaurantName: "Casa Rita",
    overview: { uniqueViewers: 42, accepted: null, visits: null, visitors: null, openCents: 450 },
    deps
  });

  assert.ok(html.includes(`<p class="go-kpi__value">42</p>`));
  assert.ok(html.includes(`<p class="go-kpi__value">4,50 €</p>`));
  assert.equal((html.match(/<span class="go-kpi__skeleton/g) || []).length, 3);

  // Und zwar genau an den drei Stellen, die noch fehlen.
  const cardOf = (key) => {
    const start = html.indexOf(`data-go-kpi="${key}"`);
    return html.slice(start, html.indexOf("</div>", html.indexOf("go-kpi__note", start)));
  };
  assert.equal(cardOf("views").includes("<span class=\"go-kpi__skeleton"), false);
  assert.ok(cardOf("chosen").includes("<span class=\"go-kpi__skeleton"));
  assert.ok(cardOf("visits").includes("<span class=\"go-kpi__skeleton"));
  assert.ok(cardOf("guests").includes("<span class=\"go-kpi__skeleton"));
  assert.equal(cardOf("due").includes("<span class=\"go-kpi__skeleton"), false);
});

test("a real zero from the server is a zero", () => {
  const html = renderGoAdminBodyCore({
    restaurantName: "Casa Rita",
    overview: { uniqueViewers: 0, accepted: 0, visits: 0, visitors: 0, openCents: 0 },
    deps
  });
  assert.equal((html.match(/<p class="go-kpi__value">0<\/p>/g) || []).length, 4);
  assert.ok(html.includes(`<p class="go-kpi__value">0,00 €</p>`));
  // Eine gemessene Null ist eine Zahl und kein Ladezustand.
  assert.equal(html.includes(`<span class="go-kpi__skeleton`), false);
  assert.ok(html.includes("Asgjë për pagesë."));
});

test("the cards say nothing and do nothing - they are not buttons", () => {
  // Die Vorgaengerinnen waren <button> und hatten keinen Handler: Wer auf eine
  // Zahl tippte, sah nichts passieren und hielt die Seite fuer kaputt.
  const html = renderGoAdminBodyCore({ restaurantName: "Casa Rita", overview: OVERVIEW, deps });
  const row = html.slice(html.indexOf(`<div class="go-kpi" data-go-kpis>`), html.indexOf("go-kpi__tail"));
  assert.equal(row.includes("<button"), false);
  assert.equal(html.includes("data-go-scan"), false);
  assert.equal(html.includes("data-go-highlight"), false);
});

test("the row is swiped on every width, phone and desktop alike", () => {
  const html = renderGoAdminBodyCore({ restaurantName: "Casa Rita", overview: OVERVIEW, deps });
  // Hier stand ein Raster fuer breite Bildschirme: ab 768px wurden aus der
  // Wischreihe fuenf Spalten. Es ist weg - die Regel mass die Breite des
  // FENSTERS, waehrend die Huelle der App ueberall hoechstens 28rem breit ist,
  // und das Paneli macht es nicht. Zwei Seiten, die sich ab einer Schwelle
  // verschieden verhalten, laufen genau an dieser Schwelle auseinander.
  assert.equal(html.includes("grid-template-columns: repeat(5, minmax(0, 1fr));"), false);
  assert.equal(html.includes("@media (min-width: 768px) {"), false);
  // Gewischt wird auf jeder Breite: waagerecht, mit Rastpunkten und ohne
  // sichtbare Bildlaufleiste - dieselbe Reihe wie im Paneli.
  assert.ok(html.includes("scroll-snap-type: x mandatory;"));
  assert.ok(html.includes(".mnyra-work__cards::-webkit-scrollbar { display: none; }"));
});

test("under the row stands the bento of the Paneli, with the pills inside it", () => {
  // Ofertat steht in der zweiten Gruppe - die Leiste muss sie zeigen, damit
  // die Pille ueberhaupt gezeichnet wird.
  const html = renderGoAdminBodyCore({ restaurantName: "Casa Rita", tab: "offers", group: 1, deps });

  // WOERTLICH dieselbe Flaeche wie im Paneli: Abstand, Polster, Rundung und
  // Kante stehen einmal in der gemeinsamen Geometrie, das Bento traegt beide
  // Klassen.
  assert.ok(html.includes(`<div class="mnyra-work__bento go-bento" data-go-bento>`));
  assert.ok(html.includes("margin: var(--work-cards-gap) calc(-1 * var(--work-inline)) 0;"));
  assert.ok(html.includes("border-radius: var(--work-bento-radius) var(--work-bento-radius) 0 0;"));
  assert.ok(html.includes("box-shadow: 0 -16px 32px -20px rgb(15 23 42 / 0.16);"));
  assert.ok(html.includes("--work-bento-radius: 40px;"));

  // Die Leiste steht IM Bento, nicht darueber.
  assert.ok(html.indexOf(`class="mnyra-work__bento go-bento"`) < html.indexOf(`class="go-tabs"`));

  // Drei runde Pillen und ein Pfeil, mit Symbol und Wort auf einer Zeile -
  // und zwar die Pillen der gemeinsamen Geometrie, dieselben wie im Paneli.
  assert.ok(html.includes("grid-template-columns: repeat(3, minmax(0, 1fr));"));
  assert.ok(html.includes("border-radius: 999px;"));
  assert.ok(html.includes(`<span class="mnyra-work__pill-label">`));
  assert.ok(html.includes(`aria-selected="true" data-go-business-tab="offers"`));

  // Und die alte Leiste ist weg.
  assert.equal(html.includes("rounded-2xl text-[11px] font-black uppercase tracking-widest"), false);
});

// Die Gruppe, die gerade zu sehen ist - der Rest liegt hinter dem
// Fensterrand und traegt inert.
function shownPane(html) {
  // Ab der ersten Gruppe bis zum Pfeil-KNOPF - der Klassenname steht auch im
  // Stylesheet darueber, und das ist nicht die Leiste.
  const start = html.indexOf(`<div class="mnyra-work__pills go-tabs__pane" role="tablist" data-go-tab-pane`);
  const end = html.indexOf(`<button type="button" class="mnyra-work__pill-turn"`, start);
  const chunk = html.slice(start, end);
  return chunk.split(`<div class="mnyra-work__pills go-tabs__pane"`).find((part) => part.trim() && !part.includes("inert")) || "";
}

test("the bar shows one group of three at a time, in the order of the day", () => {
  const html = renderGoAdminBodyCore({ restaurantName: "Casa Rita", tab: "active", deps });
  const pane = shownPane(html);

  // Gruppe eins: der Weg, den ein Gast nimmt.
  const order = ["pending", "active", "finalized"].map((key) => pane.indexOf(`data-go-business-tab="${key}"`));
  assert.equal(order.every((position) => position > -1), true, JSON.stringify(order));
  assert.deepEqual(order, [...order].sort((a, b) => a - b));
  ["Në pritje", "Aktivizo", "Finalizuar"].forEach((label) => assert.ok(pane.includes(label), label));
  ["zap", "circle-check"].forEach((name) => assert.ok(pane.includes(`data-lucide="${name}"`), name));
  // Die erste Pille trug eine Uhr. An ihrer Stelle steht die Anzahl - und die
  // Uhr steht nirgends mehr.
  assert.equal(pane.includes(`data-lucide="clock-3"`), false);
  assert.ok(pane.includes(`<span class="go-tabs__count" aria-hidden="true">0</span>`));

  // Die zweite Gruppe steht daneben auf dem Band - aber hinter dem
  // Fensterrand, und dort findet sie weder Finger noch Tabulatortaste noch
  // Sprachausgabe.
  ["stats", "payments", "offers"].forEach((key) => {
    assert.equal(pane.includes(`data-go-business-tab="${key}"`), false, key);
  });
  assert.ok(html.includes(`data-go-tab-pane="1" aria-hidden="true" inert`));

  // Drei Pillen in der sichtbaren Gruppe, und Aktivizo ist die offene.
  assert.equal((pane.match(/class="mnyra-work__pill"/g) || []).length, 3);
  assert.ok(pane.includes(`aria-selected="true" data-go-business-tab="active"`));
  assert.ok(html.includes(`data-go-tab-group="0"`));
});

test("the second group carries management, and the arrow turns back", () => {
  const html = renderGoAdminBodyCore({ restaurantName: "Casa Rita", tab: "active", group: 1, deps });
  const pane = shownPane(html);

  const order = ["stats", "payments", "offers"].map((key) => pane.indexOf(`data-go-business-tab="${key}"`));
  assert.equal(order.every((position) => position > -1), true, JSON.stringify(order));
  assert.deepEqual(order, [...order].sort((a, b) => a - b));
  ["Statistikat", "Pagesat", "Ofertat"].forEach((label) => assert.ok(pane.includes(label), label));
  ["bar-chart-3", "wallet", "tag"].forEach((name) => assert.ok(pane.includes(`data-lucide="${name}"`), name));

  // Jetzt liegt die erste Gruppe hinter dem Rand.
  assert.ok(html.includes(`data-go-tab-pane="0" aria-hidden="true" inert`));
  assert.ok(html.includes(`data-go-tab-group="1"`));

  // Beide Zeichen stehen im Knopf - welches zu sehen ist, entscheidet das
  // Stylesheet an der Gruppe. So bleibt der Pfeil derselbe Knoten.
  assert.ok(html.includes(`data-lucide="chevron-left"`));
  assert.ok(html.includes(`data-lucide="chevron-right"`));
  assert.ok(html.includes(`.go-tabs[data-go-tab-group="1"] .go-tabs__turn-icon--back { display: block; }`));
});

test("switching the group moves a band, it does not redraw the page", () => {
  // Das ist die Antwort auf den Sprung der Karten-Reihe: Ein Neuzeichnen
  // ginge durch die Shell, und die ersetzt appEl.innerHTML - damit waere die
  // Reihe darueber neu und ihre Scrollposition weg.
  const html = renderGoAdminBodyCore({ restaurantName: "Casa Rita", tab: "active", deps });

  // Ein Fenster, ein Band, zwei Gruppen darauf.
  assert.ok(html.includes(`<div class="go-tabs__viewport">`));
  assert.ok(html.includes(`<div class="go-tabs__track">`));
  assert.equal((html.match(/data-go-tab-pane="/g) || []).length, 2);

  // Verschoben wird mit transform und nicht gescrollt.
  assert.ok(html.includes(`.go-tabs[data-go-tab-group="1"] .go-tabs__track { transform: translateX(-100%); }`));
  assert.ok(html.includes("transition: transform 210ms ease-out;"));
  // Keine Feder, kein Ueberschwingen.
  assert.equal(/cubic-bezier\([^)]*-/.test(html), false);
  // Und kein natives waagerechtes Scrollen der Leiste.
  const bar = html.slice(html.indexOf(".go-tabs {"), html.indexOf(".go-tabs__viewport {"));
  assert.equal(bar.includes("overflow-x"), false);
  assert.ok(bar.includes("touch-action: pan-y;"));

  // Wer Bewegung abbestellt hat, bekommt den Wechsel ohne sie.
  assert.ok(html.includes("@media (prefers-reduced-motion: reduce) {"));
  assert.ok(html.includes(".go-tabs__track { transition: none; }"));
});

test("the arrow is as quiet as a closed pill", () => {
  const html = renderGoAdminBodyCore({ restaurantName: "Casa Rita", deps });
  const turn = html.slice(html.indexOf(".mnyra-work__pill-turn {"), html.indexOf(".mnyra-work__pill-turn:active"));

  // Weiss mit demselben duennen Rand wie eine Pille, die nicht offen ist -
  // und zwar woertlich aus denselben Marken wie die Pillen daneben.
  assert.ok(turn.includes("background: var(--work-pill-surface);"));
  assert.ok(turn.includes("border: 1px solid var(--work-pill-border);"));
  // Das Zeichen darin traegt das Violett der Marke.
  assert.ok(turn.includes("color: var(--work-pill-active);"));
  assert.ok(html.includes("--work-pill-surface: #ffffff;"));
  assert.ok(html.includes("--work-pill-border: #e2e8f0;"));
  assert.ok(html.includes("--work-pill-active: #4f46e5;"));
  // Der kraeftige Lavendel-Kreis ist weg.
  assert.equal(turn.includes("#eef2ff"), false);
  assert.equal(turn.includes("#e0e7ff"), false);
  // Dieselbe Form und dieselbe Fingerhoehe wie die Pillen.
  assert.ok(turn.includes("border-radius: 999px;"));
  assert.ok(turn.includes("min-height: var(--work-pill-height);"));
  assert.ok(turn.includes("aspect-ratio: 1 / 1;"));
  assert.ok(html.includes("--work-pill-height: 44px;"));
});

test("turning the bar does not open anything", () => {
  // Das ist die ganze Regel hinter dem Pfeil: Wer nachsieht, was daneben
  // liegt, verliert nicht die Liste, an der er gerade arbeitet.
  const shown = renderGoAdminBodyCore({ restaurantName: "Casa Rita", tab: "active", group: 1, bookings: [booking()], deps });

  // Die Leiste zeigt die Verwaltung...
  const pane = shownPane(shown);
  assert.ok(pane.includes(`data-go-business-tab="stats"`));
  // ...und keine der drei sichtbaren ist die offene, weil geoeffnet weiter
  // "Aktivizo" ist. Die Pille dafuer liegt hinter dem Fensterrand - dort darf
  // sie markiert bleiben, gesehen wird sie nicht.
  assert.equal(/aria-selected="true" data-go-business-tab=/.test(pane), false);
  assert.ok(shown.includes(`data-go-tab-pane="0" aria-hidden="true" inert`));
  // Darunter steht weiter der Inhalt von Aktivizo - mit seinem Suchfeld.
  assert.ok(shown.includes("data-go-code-input"));
  assert.ok(shown.includes(">Aktivizo</h3>") || shown.includes("Aktivizo"));

  // Der Pfeil ist kein Reiter: kein role, kein aria-selected, kein
  // data-go-business-tab.
  const turnAt = shown.indexOf(`<button type="button" class="mnyra-work__pill-turn"`);
  const turn = shown.slice(turnAt, turnAt + 260);
  assert.equal(turn.includes("role=\"tab\""), false);
  assert.equal(turn.includes("data-go-business-tab"), false);
});

test("the pills stay one row on a phone, and keep their name when the word goes", () => {
  const html = renderGoAdminBodyCore({ restaurantName: "Casa Rita", tab: "active", deps });

  // Fingerhoehe und ganz runde Form - fuer jede Pille und den Pfeil dieselbe.
  assert.ok(html.includes("--work-pill-height: 44px;"));
  assert.ok(html.includes("min-height: var(--work-pill-height);"));
  assert.ok(html.includes("border-radius: 999px;"));
  // Drei gleiche Spalten fuer die Pillen, der Pfeil daneben nur so breit wie
  // hoch: Keine Pille wird groesser, weil sie offen ist.
  assert.ok(html.includes("grid-template-columns: repeat(3, minmax(0, 1fr));"));
  assert.ok(html.includes("aspect-ratio: 1 / 1;"));
  // Nie umbrechen, nie eine Bildlaufleiste in der Leiste.
  assert.ok(html.includes("white-space: nowrap;"));
  const barAt = html.indexOf(".go-tabs {");
  const barEnd = html.indexOf(".go-tabs__viewport {");
  assert.equal(html.slice(barAt, barEnd).includes("overflow-x"), false);

  // Auf schmalen Telefonen rueckt es enger, auf den schmalsten bleibt nur das
  // Symbol - der Name steht dann im aria-label und im title. Beides steht in
  // der gemeinsamen Geometrie und gilt damit im Paneli genauso.
  assert.ok(html.includes("@media (max-width: 413px) {"));
  assert.ok(html.includes("@media (max-width: 359px) {"));
  assert.ok(html.includes(".mnyra-work__pill-label { display: none; }"));
  assert.ok(html.includes(`aria-label="Aktivizo" title="Aktivizo"`));
});

/**
 * Der Block EINER Regel, gefunden an ihrem eigenen Anfang.
 *
 * ".go-activate__done {" steht zweimal im Blatt: einmal als letzte Zeile der
 * Aufzaehlung, die alle drei Schichten deckungsgleich legt, und einmal als
 * eigene Regel. Gesucht ist die zweite - also die, vor der kein Komma steht.
 */
function ruleBlock(css, selector) {
  const needle = `\n${selector} {`;
  for (let at = css.indexOf(needle); at > -1; at = css.indexOf(needle, at + 1)) {
    if (css.slice(0, at).trimEnd().slice(-1) === ",") continue;
    return css.slice(at, css.indexOf("}", at) + 1);
  }
  return "";
}

// ===========================================================================
// Aktivizo - die Arbeitskarte des Kellners.
//
// Sie ist die ganze Seite dieses Reiters: eine Karte, darin das Codefeld und
// daneben der Weg zur Kamera. Der Code-Flow darunter ist unveraendert - die
// folgenden Tests halten fest, dass er es bleibt.
// ===========================================================================

test("Aktivizo is one card: title, sentence, code field, and the QR button", () => {
  const html = renderGoAdminBodyCore({ restaurantName: "Casa Rita", tab: "active", deps });

  assert.ok(html.includes(`<div class="go-activate" data-go-activate data-go-camera="0"`));
  assert.ok(html.includes("Aktivizo ofertën"));
  assert.ok(html.includes("Shkruaj kodin ose skano QR-në."));

  // Ein helles Feld, und die zwei Knoepfe stehen DARIN.
  const rowAt = html.indexOf(`class="go-activate__row go-code-box"`);
  assert.ok(rowAt > -1, "die Kapsel fehlt");
  const row = html.slice(rowAt, html.indexOf("</div>", rowAt));
  assert.ok(row.includes("data-go-code-input"));
  assert.ok(row.includes("data-go-code-submit"));
  assert.ok(row.includes("data-go-camera-open"));

  // Lucide ScanQrCode - und beide Knoepfe gleich hoch.
  assert.ok(html.includes(`data-lucide="scan-qr-code"`));
  const buttons = html.slice(html.indexOf(".go-activate__go,"), html.indexOf("\n.go-activate__go {"));
  assert.ok(buttons.includes("height: 54px;"), buttons);
  // Der Handgriff im Violett der Marke, der QR-Knopf ruhig daneben.
  assert.ok(html.includes("background: #4f46e5;"));
  assert.ok(html.includes("background: #eef2ff;"));
});

test("the card is a light Mnyra surface, not a dark block", () => {
  // Das Navy machte die Karte zum lautesten Ding der Seite - unter einer
  // weissen Leiste, auf einem weissen Benko. Jetzt traegt sie ihr Gewicht
  // ueber die Groesse: helle Flaeche, Haarlinie, kein Schlagschatten.
  const html = renderGoAdminBodyCore({ tab: "active", deps });
  const card = html.slice(html.indexOf("\n.go-activate {"), html.indexOf(".go-activate__face,"));
  assert.ok(card.includes("--go-activate-surface: #f7f7ff;"), card);
  assert.ok(card.includes("--go-activate-line: #e4e4f4;"), card);
  assert.ok(card.includes("background: var(--go-activate-surface);"), card);
  // Das Navy ist als FLAECHE weg. Als Schriftfarbe bleibt es - die
  // Ueberschrift steht weiter im Navy der Marke.
  assert.equal(/background: #0f172a/.test(card), false, card);
  // Die Linie liegt INNEN und nicht als Rand: Ein Rand umschloesse auch das
  // Kamerabild, ein innerer Schatten wird von den Kindern zugedeckt. Und er
  // aendert nichts am Kastenmodell - beide Zustaende bleiben gleich gross.
  assert.ok(card.includes("box-shadow: inset 0 0 0 1px var(--go-activate-line);"), card);
  assert.equal(/box-shadow: (?!inset)/.test(card), false, card);
  assert.equal(card.includes("border:"), false, card);

  // Die Schrift der Karte: Ueberschrift im Navy der Marke, Satz in ruhigem
  // Slate. Beide nehmen die Marken der Karte und setzen nichts eigenes.
  const title = html.slice(html.indexOf(".go-activate__title {"), html.indexOf(".go-activate__hint {"));
  assert.ok(title.includes("color: var(--go-activate-ink);"), title);
  assert.ok(card.includes("--go-activate-ink: #0f172a;"), card);
  const hint = html.slice(html.indexOf(".go-activate__hint {"), html.indexOf("/* Das Codefeld"));
  assert.ok(hint.includes("color: var(--go-activate-ink-soft);"), hint);
  assert.ok(card.includes("--go-activate-ink-soft: #64748b;"), card);
  // Und die Zeile, die einen Fehler meldet, ist auf hellem Grund lesbar.
  const status = html.slice(html.indexOf(".go-activate__status {"), html.indexOf(".go-activate__cam-view {"));
  assert.ok(status.includes("color: #e11d48;"), status);
});

test("title and sentence stand top left, the field in the middle", () => {
  // Die Karte liest von oben nach unten: erst wer sie ist, dann was zu tun
  // ist. Was danach frei bleibt, bleibt frei - dort erscheint die Zeile, wenn
  // ein Code nichts fand.
  const html = renderGoAdminBodyCore({ tab: "active", deps });
  const face = html.slice(html.indexOf("\n.go-activate__face {"), html.indexOf(".go-activate__title {"));
  assert.ok(face.includes("flex-direction: column;"), face);
  // Nicht mehr alles zusammen in der Mitte: der Block faengt oben an.
  assert.equal(face.includes("justify-content: center;"), false, face);
  assert.ok(face.includes("padding: 20px;"), face);
  // Der Abstand zum Feld steht am Feld und nicht als Luecke am Block - eine
  // Luecke risse sonst auch Titel und Satz auseinander.
  const row = html.slice(html.indexOf("\n.go-activate__row {"), html.indexOf(".go-code-box:focus-within"));
  assert.ok(row.includes("margin-top: 20px;"), row);
  // Und unter dem Feld endet die Schicht. Kein Rest, der auf eine Buchung
  // wartet, die vielleicht nie kommt - die Karte waechst erst, wenn wirklich
  // etwas hineinkommt.
  assert.equal(html.includes(".go-activate__face > :last-child { margin-bottom: auto; }"), false);
});

test("the code field is a command bar, not a squeezed capsule", () => {
  const html = renderGoAdminBodyCore({ tab: "active", deps });
  const row = html.slice(html.indexOf("\n.go-activate__row {"), html.indexOf(".go-code-box:focus-within"));
  // Deutlich hoeher als die 50 Punkte von vorher, weiss, weich gerundet und
  // an beiden Enden gepolstert.
  assert.ok(row.includes("height: 78px;"), row);
  assert.ok(row.includes("background: #ffffff;"), row);
  assert.ok(row.includes("border-radius: 24px;"), row);
  assert.ok(row.includes("padding: 0 10px;"), row);
  // Sie behaelt ihre Hoehe, auch wenn unter ihr eine zweizeilige Meldung
  // steht - sonst waere genau dann gequetscht, was nie gequetscht sein soll.
  assert.ok(row.includes("flex: 0 0 auto;"), row);

  // Das Feld darin ist mitgewachsen, und der Platzhalter heisst wie vorher.
  const input = html.slice(html.indexOf(".go-activate__input {"), html.indexOf(".go-activate__input::placeholder"));
  assert.ok(input.includes("height: 54px;"), input);
  assert.ok(input.includes("padding: 0 4px 0 14px;"), input);
  assert.ok(html.includes(`placeholder="Kodi i klientit"`));

  // Der QR-Knopf ist schmaler als der Handgriff: der zweite Weg liest als der
  // zweite.
  const qr = html.slice(html.indexOf("\n.go-activate__qr {"), html.indexOf(".go-activate__go:active"));
  assert.ok(qr.includes("width: 58px;"), qr);
  assert.ok(qr.includes("background: #eef2ff;"), qr);
  assert.ok(qr.includes("color: #4f46e5;"), qr);

  // Und waehrend gesucht wird, aendert sich am Knopf keine Zahl: kein
  // anderes Wort, kein anderes Polster, keine andere Breite.
  assert.ok(html.includes(".go-activate__go[disabled] { cursor: default; }"));
  assert.equal(html.includes(".go-activate__go[disabled] { opacity: 0.6; cursor: default; padding: 0 8px; }"), false);
  // Und kein Ladetext: Er waere laenger als das Wort, das er ersetzt.
  assert.equal(html.includes("Po kërkoj"), false);
});

test("both handles work while you watch them, and never change size", () => {
  const html = renderGoAdminBodyCore({ tab: "active", deps });
  // Vier Zustaende an EINEM Attribut - und beide Knoepfe tragen dieselben.
  assert.equal((html.match(/data-go-phase="idle"/g) || []).length, 1);
  const found = renderGoAdminBodyCore({
    tab: "active",
    search: { code: "RDHUG", status: "", busy: false, booking: booking({ id: "bk-found" }) },
    deps
  });
  assert.equal((found.match(/data-go-phase="idle"/g) || []).length, 2);

  // Das Wort bleibt im Fluss und wird nur unsichtbar - daran haengt, dass der
  // Knopf seine Breite behaelt. Die Zeichen liegen darueber.
  const label = ruleBlock(html, ".go-sign__label");
  assert.ok(label.includes("display: block;"), label);
  const sign = ruleBlock(html, ".go-sign");
  assert.ok(sign.includes("position: absolute;"), sign);
  assert.ok(sign.includes("inset: 0;"), sign);
  assert.ok(html.includes('[data-go-phase="busy"] > .go-sign__label,'));
  assert.ok(html.includes("transform: translateY(-4px);"));

  // Der Bogen dreht sich gleichmaessig und ist klein.
  const ring = ruleBlock(html, ".go-sign__ring");
  assert.ok(ring.includes("animation: go-sign-spin 720ms linear infinite;"), ring);
  assert.ok(ring.includes("width: 18px;"), ring);
  assert.ok(html.includes("@keyframes go-sign-spin { to { transform: rotate(360deg); } }"));

  // Haken und Kreuz stehen im Aufbau, nicht erst wenn sie gebraucht werden -
  // sonst muesste fuer jeden Zustand neu gezeichnet werden.
  assert.ok(html.includes("go-sign--check"));
  assert.ok(html.includes("go-sign--cross"));
  // Und die Zeichen sind fuer die Sprachausgabe nicht da: Sie sagen nichts,
  // was das Wort im Knopf nicht schon sagt.
  assert.equal((html.match(/class="go-sign go-sign--\w+" aria-hidden="true"/g) || []).length, 3);
});

test("an error keeps everything the waiter already typed or set", () => {
  const controller = readFileSync(
    new URL("../apps/menyra-social/core/go/go-admin-view-controller.js", import.meta.url),
    "utf8"
  );
  // Beide Wege schreiben ihre Meldung an einen lebenden Knoten und zeichnen
  // NICHT neu: Ein Neuaufbau naehme den getippten Code aus dem Feld und die
  // eingestellte Personenzahl aus dem Zaehler.
  const search = controller.slice(controller.indexOf("async function searchByCode()"));
  const searchBody = search.slice(0, search.indexOf("\n  }"));
  assert.ok(searchBody.includes("setNote(failure)"), searchBody);
  assert.ok(searchBody.includes('setPhase(button, "fail")'), searchBody);
  // Zweimal tippen ist einmal.
  assert.ok(searchBody.includes("if (current.search?.busy) return;"), searchBody);

  const fin = controller.slice(controller.indexOf('async function finalizeFoundBooking(bookingId = "")'));
  const finBody = fin.slice(0, fin.indexOf("\n  }"));
  assert.ok(finBody.includes("if (current.search.busy) return;"), finBody);
  assert.ok(finBody.includes("setNote(failure)"), finBody);
  // Im Fehlerfall wird nicht gezeichnet - die Oferta und die Zahl bleiben.
  // Im ganzen Abschluss steht kein einziges render(): Was der Kellner sieht,
  // aendert sich ueber Attribute an lebenden Knoten.
  assert.equal(/(^|[^.\w])render\(\)/.test(finBody), false, finBody);
  // Und in der Suche steht genau eines - der Erfolg, der die Karte aufzieht.
  assert.equal((searchBody.match(/(^|[^.\w])render\(\)/g) || []).length, 1, searchBody);

  // Und die Zahlen daneben werden nachgezogen, ohne dass jemand darauf
  // wartet: Der Abschluss ist bestaetigt, die Kennzahl darf spaeter stimmen.
  assert.ok(finBody.includes("void dataController?.refreshOverview?.({ force: true });"), finBody);

  // Beide Zeilen stehen immer im Aufbau, damit genau das moeglich ist.
  const html = renderGoAdminBodyCore({
    tab: "active",
    search: { code: "RDHUG", status: "", busy: false, booking: booking({ id: "bk-found" }) },
    deps
  });
  assert.ok(html.includes("data-go-code-status"));
  assert.ok(html.includes("data-go-done-status"));
});

test("the camera is only shown once it really runs", () => {
  const html = renderGoAdminBodyCore({ tab: "active", camera: { open: true, error: "" }, deps });
  // Die Flaeche steht sofort in ihrer Endgroesse; das Bild darin ist
  // unsichtbar, bis es Masse hat und laeuft.
  assert.ok(html.includes('data-go-cam-ready="0"'));
  assert.ok(html.includes('.go-activate[data-go-cam-ready="1"] .go-activate__cam-view { opacity: 1; }'));
  const view = ruleBlock(html, ".go-activate__cam-view");
  assert.ok(view.includes("opacity: 0;"), view);
  assert.ok(view.includes("transition: opacity 140ms var(--go-activate-ease);"), view);

  const controller = readFileSync(
    new URL("../apps/menyra-social/core/go/go-admin-view-controller.js", import.meta.url),
    "utf8"
  );
  // Masse UND play() - eines von beiden reicht nicht.
  assert.ok(controller.includes("Number(video.videoWidth) > 0 && Number(video.videoHeight) > 0"));
  assert.ok(controller.includes('video.addEventListener?.("loadedmetadata", settle, { once: true })'));
  // Kommt nichts, wird sauber aufgeraeumt statt ein schwarzes Rechteck stehen
  // zu lassen.
  assert.ok(controller.includes("const CAMERA_READY_TIMEOUT_MS = 4000;"));
  assert.ok(controller.includes("failCamera(BUSINESS_GO_TEXTS.cameraFailed)"));
  // Und zwei Fehler, zwei Saetze.
  assert.ok(controller.includes("denied ? BUSINESS_GO_TEXTS.cameraDenied : BUSINESS_GO_TEXTS.cameraFailed"));
  const denied = renderGoAdminBodyCore({
    tab: "active",
    camera: { open: false, error: "Lejo kamerën për të skanuar QR-në." },
    deps
  });
  assert.ok(denied.includes("Lejo kamerën për të skanuar QR-në."));
  // Und das Codefeld ist sofort wieder da: Es war die ganze Zeit im Aufbau.
  assert.ok(denied.includes("data-go-code-input"));
  assert.ok(denied.includes('data-go-camera="0"'));
});

test("the way to the server is fetched before anyone needs it", () => {
  const controller = readFileSync(
    new URL("../apps/menyra-social/core/go/go-admin-view-controller.js", import.meta.url),
    "utf8"
  );
  // Einmal je Sitzung, still, und ohne irgendetwas aufzurufen.
  assert.ok(controller.includes("function prewarm() {"));
  assert.ok(controller.includes("if (prewarmed || typeof prewarmFn !== \"function\") return;"));
  assert.ok(controller.includes("prewarm();"));

  const app = readFileSync(new URL("../apps/menyra-social/social-app.js", import.meta.url), "utf8");
  const wired = app.slice(app.indexOf("prewarmFn: async () => {"));
  assert.ok(wired.slice(0, 300).includes("goApiInternals.loadCallables()"), wired.slice(0, 300));
});

test("the code field keeps every hook the working flow hangs on", () => {
  // Der Flow ist nicht neu gebaut worden - er hat nur eine andere Huelle.
  // Faellt einer dieser Haken, sucht der Controller ins Leere.
  const html = renderGoAdminBodyCore({
    tab: "active",
    search: { code: "A7K2M", status: "Ky kod nuk u gjet.", busy: false, booking: null },
    deps
  });
  assert.ok(html.includes(`data-go-code-input value="A7K2M"`));
  assert.ok(html.includes("data-go-code-submit"));
  assert.ok(html.includes(`maxlength="8"`));
  assert.ok(html.includes(`autocapitalize="characters"`));
  assert.ok(html.includes("Kodi i klientit"));
  // Die Meldung des Servers steht weiter unter dem Feld.
  assert.ok(html.includes("Ky kod nuk u gjet."));
  // Und waehrend gesucht wird, ist der Knopf zu.
  const busy = renderGoAdminBodyCore({
    tab: "active",
    search: { code: "A7K2M", status: "", busy: true, booking: null },
    deps
  });
  assert.ok(busy.includes("data-go-code-submit disabled"));
  // Aber der Knopf sagt weiter dasselbe Wort: Was arbeitet, liegt darueber
  // und aendert seine Breite nicht.
  assert.ok(busy.includes('<span class="go-sign__label">Aktivizo</span>'));
});

test("the camera state shows the picture and an X, and nothing else", () => {
  const html = renderGoAdminBodyCore({
    tab: "active",
    camera: { open: true, error: "" },
    search: { code: "A7K2M", status: "", busy: false, booking: null },
    deps
  });
  assert.ok(html.includes(`data-go-camera="1"`));

  // Im Kamera-Zustand steht in der Kamera-Schicht nur das Bild und das X.
  const camAt = html.indexOf(`<div class="go-activate__cam" data-go-activate-cam>`);
  assert.ok(camAt > -1);
  const cam = html.slice(camAt, html.indexOf("</div>", html.indexOf("data-go-camera-close", camAt)));
  assert.ok(cam.includes("data-go-camera-video"));
  assert.ok(cam.includes("data-go-camera-close"));
  assert.equal(cam.includes("Aktivizo ofertën"), false);
  assert.equal(cam.includes("data-go-code-input"), false);
  assert.equal(cam.includes("Skano"), false);

  // Auf dem iPhone bleibt das Bild IN der Karte - ohne diese zwei Attribute
  // reisst Safari es in den Vollbildspieler.
  assert.ok(html.includes("playsinline"));
  assert.ok(html.includes("muted"));
  // Kein Vollbild, kein Modal: die Kamera liegt in derselben Karte.
  assert.equal(html.includes("fixed inset-0"), false);
  assert.equal(html.includes("aria-modal"), false);

  // Das Codefeld ist nicht weg, es ist nur nicht zu sehen - der getippte Code
  // ueberlebt den Ausflug zur Kamera.
  assert.ok(html.includes(`data-go-code-input value="A7K2M"`));
});

test("the card has one height per state, and it drives between them", () => {
  // Frueher stand hier EINE Hoehe fuer alle drei Schichten. Sie machte den
  // Wechsel sprungfrei, kostete aber 160 Punkte Leere unter dem Codefeld -
  // die Karte war immer so gross wie ihr groesster Zustand. Jetzt ist sie so
  // gross wie ihr jetziger und faehrt die Aenderung mit.
  const html = renderGoAdminBodyCore({ tab: "active", deps });
  assert.ok(html.includes("--go-activate-h-face: 184px;"));
  assert.ok(html.includes("--go-activate-h-cam: 288px;"));
  assert.ok(html.includes("--go-activate-h-done: 364px;"));
  assert.ok(html.includes("height: var(--go-activate-height);"));
  // Die kleine ist die Voreinstellung: Wer den Reiter oeffnet, sieht die
  // kompakte Karte.
  assert.ok(html.includes("--go-activate-height: var(--go-activate-h-face);"));
  // Und die Hoehe faehrt - zwischen festen Zahlen, nicht nach "auto": "auto"
  // hat keinen Wert, auf den ein Uebergang zielen koennte, und Safari springt
  // dann hart.
  assert.ok(html.includes("transition: height 300ms var(--go-activate-ease);"));
  assert.equal(/height:\s*auto/.test(html.slice(
    html.indexOf("\n.go-activate {"), html.indexOf(".go-activate__face,")
  )), false);

  // Drei Zustaende, drei Hoehen - und sie schliessen einander aus.
  assert.ok(html.includes('.go-activate[data-go-camera="1"] { --go-activate-height: var(--go-activate-h-cam); }'));
  assert.ok(html.includes('.go-activate[data-go-camera="0"][data-go-found="1"] { --go-activate-height: var(--go-activate-h-done); }'));
  // Eine Zeile unter dem Feld kostet genau eine Zeile Hoehe - und nur in der
  // Eingabemaske.
  assert.ok(html.includes('.go-activate[data-go-camera="0"][data-go-found="0"][data-go-note="1"] {'));
  assert.ok(html.includes("calc(var(--go-activate-h-face) + 26px)"));

  // Alle drei Schichten liegen weiter deckungsgleich im selben Rahmen: Die
  // Karte waechst, sie schiebt keine zweite unter sich.
  assert.ok(/\.go-activate__face,\s*\n\.go-activate__cam,\s*\n\.go-activate__done \{[^}]*position: absolute;[^}]*inset: 0;/s.test(html));
  // Die Karte selbst polstert nicht - sonst saesse die Kamera in einem
  // Rahmen statt IN der Karte.
  assert.ok(/\.go-activate \{[^}]*padding: 0;/s.test(html));

  // Und der Controller misst weiter keine Hoehen: Die Zahlen stehen im Blatt,
  // er setzt nur Attribute.
  const controller = readFileSync(
    new URL("../apps/menyra-social/core/go/go-admin-view-controller.js", import.meta.url),
    "utf8"
  );
  assert.equal(controller.includes("morphActivateCard"), false);
  assert.equal(controller.includes("card.style.height"), false);
  assert.equal(controller.includes("scrollHeight"), false);
});

test("the card carries the state of its note, so it can make room for it", () => {
  // Die Marke sitzt an der KARTE und nicht an einer Schicht: An ihr haengt
  // die Hoehe, und die Hoehe gehoert der Karte.
  const withNote = renderGoAdminBodyCore({
    tab: "active",
    search: { code: "XXXX", status: "Ky kod nuk u gjet.", busy: false, booking: null },
    deps
  });
  assert.ok(withNote.includes('data-go-note="1"'));
  const quiet = renderGoAdminBodyCore({ tab: "active", deps });
  assert.ok(quiet.includes('data-go-note="0"'));
  // Im Aufbau steht sie nur einmal, an der Karte - im Blatt darueber stehen
  // die Regeln, die daran haengen.
  const markup = quiet.slice(quiet.indexOf("</style>"));
  assert.equal(markup.includes('data-go-note="1"'), false);
  assert.equal((markup.match(/data-go-note=/g) || []).length, 1);
});

test("the camera fills the whole card, with the card's own rounding", () => {
  const html = renderGoAdminBodyCore({ tab: "active", camera: { open: true, error: "" }, deps });
  const view = html.slice(html.indexOf(".go-activate__cam-view {"), html.indexOf(".go-activate__cam-close {"));
  assert.ok(view.includes("width: 100%;"), view);
  assert.ok(view.includes("height: 100%;"), view);
  assert.ok(view.includes("object-fit: cover;"), view);
  // Keine eigene Rundung und kein eigener Rahmen: Die Karte schneidet das Bild.
  assert.ok(view.includes("border-radius: inherit;"), view);
  assert.ok(/\.go-activate \{[^}]*overflow: hidden;/s.test(html));
  // Nur das X liegt darauf.
  assert.ok(html.includes("data-go-camera-close"));
});

test("the switch to the camera is a quiet cross-fade, and it can be turned off", () => {
  const html = renderGoAdminBodyCore({ tab: "active", deps });
  // Aufmachen: der Inhalt geht in 120ms und sinkt auf 0.985, die Kamera kommt
  // direkt danach (100ms Verzug, 140ms) aus 1.015 heran. Zusammen 240ms.
  const opening = html.slice(
    html.indexOf('.go-activate[data-go-camera="1"] .go-activate__face {'),
    html.indexOf('.go-activate[data-go-camera="0"] .go-activate__cam {')
  );
  assert.ok(opening.includes("transform: scale(0.985);"), opening);
  assert.ok(opening.includes("opacity 120ms var(--go-activate-ease) 0s"), opening);
  assert.ok(opening.includes("opacity 160ms var(--go-activate-ease) 120ms"), opening);

  // Zumachen: dieselbe Bewegung rueckwaerts - die Kamera geht in 120ms und
  // waechst dabei auf 1.015 zurueck, der Inhalt kommt danach. Zusammen 220ms.
  const closing = html.slice(html.indexOf('.go-activate[data-go-camera="0"] .go-activate__cam {'));
  assert.ok(closing.includes("transform: scale(1.015);"), closing.slice(0, 400));
  assert.ok(closing.includes("opacity 160ms var(--go-activate-ease) 120ms"), closing.slice(0, 900));

  // Ruhiges Hinausgleiten, kein Federn: die Kurve ueberschiesst nicht.
  assert.ok(html.includes("--go-activate-ease: cubic-bezier(.2, .8, .2, 1);"));
  assert.equal(/cubic-bezier\([^)]*-/.test(html), false);
  // Kein Slide, kein Vollbildwechsel: Die Kamera wandert nicht, sie blendet.
  // (Die gefundene Buchung hat ihre eigene, kleine Bewegung - siehe unten.)
  const cameraRules = html.slice(
    html.indexOf('.go-activate[data-go-camera="1"] .go-activate__face {'),
    html.indexOf("/* Wer Bewegung abbestellt hat")
  );
  assert.equal(cameraRules.includes("translateY"), false, cameraRules);

  // Wer Bewegung abbestellt hat, bekommt keine. (Die Seite hat zwei solche
  // Bloecke - einer gehoert der Pillen-Leiste; gesucht ist der der Karte.)
  const reducedBlocks = html.split("@media (prefers-reduced-motion: reduce) {").slice(1)
    .map((part) => part.slice(0, part.indexOf("}\n}") + 3));
  assert.ok(
    reducedBlocks.some((block) => block.includes(".go-activate") && block.includes("transition: none")),
    JSON.stringify(reducedBlocks)
  );
  // Und das gilt auch fuer die Hoehe: Wer keine Bewegung will, bekommt den
  // Wechsel sofort und nicht als Fahrt.
  assert.ok(
    reducedBlocks.some((block) => /\.go-activate,\s*\n\s*\.go-activate__face/.test(block)),
    JSON.stringify(reducedBlocks)
  );
});

test("the primary button is a word, not a shouted label", () => {
  const html = renderGoAdminBodyCore({ tab: "active", deps });
  assert.ok(html.includes('<span class="go-sign__label">Aktivizo</span>'));
  const go = html.slice(html.indexOf("\n.go-activate__go {"), html.indexOf(".go-activate__go[disabled]"));
  assert.equal(go.includes("text-transform: uppercase"), false, go);
});

test("the camera says when it did not open, and the code field stays usable", () => {
  const html = renderGoAdminBodyCore({
    tab: "active",
    camera: { open: false, error: "Kamera nuk u hap. Lejo qasjen ose shkruaj kodin." },
    search: { code: "A7K2M", status: "", busy: false, booking: null },
    deps
  });
  assert.ok(html.includes(`data-go-camera="0"`));
  assert.ok(html.includes("Kamera nuk u hap."));
  assert.ok(html.includes(`data-go-code-input value="A7K2M"`));
  assert.equal(html.includes("data-go-code-submit disabled"), false);
});

test("the QR button is a camera and nothing more - no second activation path", () => {
  const controller = readFileSync(
    new URL("../apps/menyra-social/core/go/go-admin-view-controller.js", import.meta.url),
    "utf8"
  );
  // Kamera auf, Kamera zu - und dazwischen wird nichts gelesen und nichts
  // aktiviert. Es gibt weiter genau EINEN Weg zur Buchung: den Code.
  assert.ok(controller.includes("getUserMedia"));
  assert.ok(controller.includes(`facingMode: { ideal: "environment" }`));
  assert.equal(/jsqr|zxing|BarcodeDetector|qr-scanner/i.test(controller), false);
  // Der QR-Knopf ruft die Kamera und nicht die Suche.
  assert.ok(controller.includes(`if (target.closest("[data-go-camera-open]")) {`));
  assert.ok(controller.includes("void openCamera();"));
  // Und die Suche haengt unveraendert am alten Knopf.
  assert.ok(controller.includes(`if (target.closest("[data-go-code-submit]")) {`)
    || controller.includes(`target.closest("[data-go-code-submit]")`));
});

test("the camera is really switched off when it is no longer on screen", () => {
  // Ein Strom, den niemand anhaelt, laesst die Leuchte des Telefons an -
  // waehrend der Kellner laengst woanders ist.
  const controller = readFileSync(
    new URL("../apps/menyra-social/core/go/go-admin-view-controller.js", import.meta.url),
    "utf8"
  );
  assert.ok(controller.includes("track.stop?.()"));
  // Beim X, beim Reiterwechsel und beim Verlassen der Seite.
  assert.ok(controller.includes(`if (target.closest("[data-go-camera-close]")) {`));
  assert.ok(controller.includes("closeCamera({ silent: true });"));
  const disconnectAt = controller.indexOf("disconnect: () => {");
  assert.ok(disconnectAt > -1);
  assert.ok(controller.slice(disconnectAt, disconnectAt + 700).includes("closeCamera("));
  // Und nach jedem Neuzeichnen haengt der laufende Strom wieder am neuen
  // <video> - sonst waere das Bild schwarz, sobald irgendeine Zahl eintrifft.
  assert.ok(controller.includes("attachCameraStream();"));
});

test("the two new tabs say what will be there, instead of showing nothing", () => {
  ["stats", "payments"].forEach((tab) => {
    const html = renderGoAdminBodyCore({ restaurantName: "Casa Rita", tab, group: 1, deps });
    assert.ok(html.includes("Së shpejti"), tab);
    // In der Form jeder anderen Karte - kein leerer Kasten.
    assert.ok(html.includes("rounded-[2.5rem]"), tab);
  });
  assert.ok(renderGoAdminBodyCore({ tab: "stats", deps }).includes("Këtu do të shohësh se si ecën GO"));
  assert.ok(renderGoAdminBodyCore({ tab: "payments", deps }).includes("faturat dhe pagesat"));
});

test("pending shows only what has not been swiped yet", () => {
  // "Ne pritje" ist der Teil der laufenden Buchungen, bei dem der Gast noch
  // nicht da war.
  const bookings = [
    booking({ id: "bk-warten", status: "accepted" }),
    booking({ id: "bk-da", status: "activated" })
  ];
  const pending = renderGoAdminBodyCore({ tab: "pending", bookings, deps });

  assert.ok(pending.includes("bk-warten"));
  assert.equal(pending.includes("bk-da"), false);
});

test("Aktivizo is a workbench, not a list", () => {
  // Unter Aktivizo standen die laufenden Buchungen. Sie sind dort weg: Der
  // Kellner am Tisch hat genau eine Aufgabe, und eine Liste, durch die er
  // scrollt, ist dabei im Weg.
  const bookings = [
    booking({ id: "bk-warten", status: "accepted" }),
    booking({ id: "bk-da", status: "activated" })
  ];
  const active = renderGoAdminBodyCore({ tab: "active", bookings, deps });

  assert.equal(active.includes("bk-warten"), false);
  assert.equal(active.includes("bk-da"), false);
  assert.equal(active.includes("data-go-booking="), false);
  // Auch kein leerer Zustand mehr, wo vorher die Liste stand.
  assert.equal(active.includes("Ende asnjë klient sot."), false);

  // Die Daten sind nicht weg, nur nicht mehr hier: dieselben Buchungen
  // stehen weiter in "Në pritje" und in "Finalizuar".
  assert.ok(renderGoAdminBodyCore({ tab: "pending", bookings, deps }).includes("bk-warten"));
  assert.ok(renderGoAdminBodyCore({
    tab: "finalized",
    bookings: [booking({ id: "bk-fertig", status: "finalized" })],
    deps
  }).includes("bk-fertig"));
});

test("the cards carry no picture window at all any more", () => {
  // Die Vorgaengerinnen trugen ein 140px hohes Bildfenster ueber einer Zahl -
  // eine Flaeche fuer ein Bild, das nie gekommen ist, und darunter kaum Platz
  // fuer das, was die Karte wirklich sagt.
  const html = renderGoAdminBodyCore({ restaurantName: "Casa Rita", tab: "active", overview: OVERVIEW, deps });
  assert.equal(html.includes("go-hl__plate"), false);
  assert.equal(html.includes("go-hl__media"), false);
  assert.equal(html.includes("<img"), false);
});

test("the page opens on the running bookings", () => {
  // Was der Kellner in "Në pritje" braucht - und nur das: wann zugegriffen
  // wurde, dass zugegriffen wurde, wie viele kommen und was zugesagt ist.
  const html = renderGoAdminBodyCore({
    tab: "pending",
    bookings: [booking({ status: "accepted" })],
    summary: { unseen: 1, open: 1, today: 1, guests: 4 },
    deps
  });
  assert.ok(html.includes("4 Mysafirë"));
  assert.ok(html.includes("Rreth"));
  assert.ok(html.includes("–10 %"));
  assert.ok(html.includes("Ka pranuar"));
  assert.ok(html.includes(`data-go-booking="bk-1"`));
});

// ===========================================================================
// "Në pritje": die wartenden Ofertat, direkt unter den Pillen.
//
// Hier stand eine Karte in einer Karte - ein weisser Abschnitt mit Marke,
// Ueberschrift und Anzahl, und darin erst die Vorgaenge. Die folgenden Tests
// halten fest, dass davon nichts uebrig ist: keine Huelle um die Liste, keine
// zweite Anzahl, kein Gastname, keine Emojis - und eine Zahl, die zum Inhalt
// darunter passt.
// ===========================================================================

test("Në pritje has no card around the list and no heading of its own", () => {
  const html = renderGoAdminBodyCore({
    restaurantName: "Casa Rita",
    tab: "pending",
    dayKey: "2026-08-13",
    bookings: [booking({ status: "accepted" })],
    deps
  });
  const bento = html.slice(html.indexOf('data-go-bento'));
  const list = bento.slice(bento.indexOf('class="go-pending"'));

  // Die Liste steht direkt auf der Flaeche - kein Abschnitt, kein Eyebrow,
  // keine kursive Ueberschrift, keine Anzahl darunter.
  assert.ok(bento.includes('<div class="go-pending">'));
  assert.equal(bento.includes("rounded-[2.5rem]"), false);
  assert.equal(bento.includes("font-black italic tracking-tighter"), false);
  assert.equal(bento.includes("text-[9px] font-black text-indigo-600 uppercase tracking-widest"), false);

  // Und in der Karte steht keine zweite Karte.
  assert.equal(list.includes("rounded-2xl"), false);
  assert.equal(list.includes("rounded-[1.6rem]"), false);
  assert.equal((list.match(/go-pending__card/g) || []).length, 1);
});

test("a waiting Oferta shows the waiter's four lines and nothing else", () => {
  const html = renderGoAdminBodyCore({
    tab: "pending",
    dayKey: "2026-08-13",
    bookings: [booking({
      status: "accepted",
      partySizeRequested: 2,
      snapshot: { benefitLabel: "Hamburger + Pomfrita + Cola + 2 sosa · 3,70 €" }
    })],
    deps
  });
  const card = html.slice(html.indexOf('class="go-pending__card"'));

  assert.ok(card.includes('class="go-pending__time">Rreth '));
  assert.ok(card.includes('class="go-pending__status">Ka pranuar<'));
  assert.ok(card.includes("2 Mysafirë"));
  assert.ok(card.includes("Hamburger + Pomfrita + Cola + 2 sosa · 3,70 €"));

  // Der Gastname ist weg: Er stand an jeder Buchung gleich und unterschied nie
  // eine von einer anderen.
  assert.equal(html.includes("Mnyra Guest"), false);
  // Und die Emojis auch - hier wie in der Liste daneben.
  ["\u{1F465}", "\u{1F381}"].forEach((emoji) => assert.equal(html.includes(emoji), false, emoji));
});

test("the icons are Lucide lines in violet, not plates or circles", () => {
  const html = renderGoAdminBodyCore({
    tab: "pending",
    dayKey: "2026-08-13",
    bookings: [booking({ status: "accepted" })],
    deps
  });
  const card = html.slice(html.indexOf('class="go-pending__card"'));
  assert.ok(card.includes(`<span class="go-pending__icon"><i data-lucide="users"></i></span>`));
  assert.ok(card.includes(`<span class="go-pending__icon"><i data-lucide="gift"></i></span>`));

  // Gleiche Groesse fuer beide, das Violett am Zeichen selbst - und kein
  // Hintergrund darunter.
  const css = html.slice(html.indexOf("<style>"), html.indexOf("</style>"));
  assert.ok(css.includes(".go-pending__icon {"));
  assert.ok(/\.go-pending__icon \{[^}]*color: #4f46e5;/.test(css));
  assert.equal(/\.go-pending__icon \{[^}]*background/.test(css), false);
  assert.equal(/\.go-pending__icon \{[^}]*border-radius/.test(css), false);
  // Und das Zeichen steht an der ERSTEN Zeile, nicht in der Mitte des Blocks.
  assert.ok(/\.go-pending__line \{[^}]*align-items: flex-start;/.test(css));
});

test("the long Oferta wraps instead of being cut", () => {
  const css = renderGoAdminBodyCore({ tab: "pending", deps });
  const sheet = css.slice(css.indexOf("<style>"), css.indexOf("</style>"));
  // Keine feste Hoehe, kein Ellipsis, kein waagerechter Ueberlauf.
  assert.equal(/\.go-pending__card \{[^}]*height:/.test(sheet), false);
  assert.equal(/\.go-pending__text \{[^}]*text-overflow/.test(sheet), false);
  assert.ok(/\.go-pending__text \{[^}]*overflow-wrap: anywhere;/.test(sheet));
});

test("the pill counts what stands below it - today, and only today", () => {
  const bookings = [
    booking({ id: "bk-heute-1", status: "accepted", dayKey: "2026-08-13" }),
    booking({ id: "bk-heute-2", status: "accepted", dayKey: "2026-08-13" }),
    // Gestern zugegriffen und nie eingeloest: gehoert nicht in die Arbeit von
    // heute - weder in die Zahl noch in die Liste.
    booking({ id: "bk-gestern", status: "accepted", dayKey: "2026-08-12" }),
    // Und wer schon gewischt hat, wartet nicht mehr.
    booking({ id: "bk-drin", status: "activated", dayKey: "2026-08-13" })
  ];
  const html = renderGoAdminBodyCore({ tab: "pending", dayKey: "2026-08-13", bookings, deps });

  assert.ok(html.includes(`<span class="go-tabs__count" aria-hidden="true">2</span>`));
  assert.ok(html.includes("bk-heute-1"));
  assert.ok(html.includes("bk-heute-2"));
  assert.equal(html.includes("bk-gestern"), false);
  assert.equal(html.includes("bk-drin"), false);

  // Verlaesst eine Oferta "Në pritje", sinkt die Zahl mit ihr - es ist
  // dieselbe Zeile, aus der beide rechnen.
  const after = renderGoAdminBodyCore({
    tab: "pending",
    dayKey: "2026-08-13",
    bookings: bookings.map((entry) => (
      entry.id === "bk-heute-1" ? { ...entry, status: "activated" } : entry
    )),
    deps
  });
  assert.ok(after.includes(`<span class="go-tabs__count" aria-hidden="true">1</span>`));
  assert.equal(after.includes("bk-heute-1"), false);
});

test("with nothing waiting the pill says zero and the area stays quiet", () => {
  const html = renderGoAdminBodyCore({
    tab: "pending",
    dayKey: "2026-08-13",
    bookings: [booking({ id: "bk-gestern", status: "accepted", dayKey: "2026-08-12" })],
    deps
  });
  assert.ok(html.includes(`<span class="go-tabs__count" aria-hidden="true">0</span>`));
  // Ein Satz, keine Karte: Der Bereich darf bei null leer sein.
  assert.ok(html.includes(`<p class="go-pending__note">Ende asnjë klient sot.</p>`));
  const bento = html.slice(html.indexOf('data-go-bento'));
  assert.equal(bento.includes("go-pending__card"), false);
  assert.equal(bento.includes("rounded-[2.5rem]"), false);
});

test("the count rides in the pill, not in a badge beside it", () => {
  const html = renderGoAdminBodyCore({
    tab: "pending",
    dayKey: "2026-08-13",
    bookings: [booking({ status: "accepted", dayKey: "2026-08-13" })],
    deps
  });
  // Dieselbe Pille wie vorher: dieselbe Klasse, derselbe Weg, dieselbe
  // Auswahl. Nur das Symbol ist eine Zahl geworden.
  assert.ok(html.includes(`aria-selected="true" data-go-business-tab="pending"`));
  assert.ok(html.includes(`class="mnyra-work__pill"><span class="go-tabs__count"`));
  // Und die Sprachausgabe liest sie mit - auf 320 Punkten steht kein Wort
  // mehr daneben.
  assert.ok(html.includes(`aria-label="1 Në pritje"`));

  const sheet = html.slice(html.indexOf("<style>"), html.indexOf("</style>"));
  // Kein Kreis, keine Blase, keine zweite Farbe: Die Zahl erbt die der Pille.
  assert.equal(/\.go-tabs__count \{[^}]*background/.test(sheet), false);
  assert.equal(/\.go-tabs__count \{[^}]*border-radius/.test(sheet), false);
  assert.ok(/\.go-tabs__count \{[^}]*color: inherit;/.test(sheet));
  // Und sie nimmt genau den Platz des Symbols, an dessen Stelle sie steht -
  // die Pille wird dadurch nicht hoeher: Ihre Hoehe kommt weiter aus der
  // gemeinsamen Geometrie (--work-pill-height), die Zahl setzt keine eigene.
  assert.ok(/\.go-tabs__count \{[^}]*min-width: var\(--work-pill-icon\);/.test(sheet));
  const countBlock = sheet.slice(sheet.indexOf(".go-tabs__count {")).split("}")[0];
  assert.equal(/[{;]\s*(min-|max-)?height:/.test(countBlock), false, countBlock);
});

test("without a day key nothing is filtered away", () => {
  // Der statische Aufbau und der Test kennen den Tag des Lokals nicht. Dann
  // wird gezeigt, was da ist - eine leere Liste waere die schlechtere Antwort.
  const html = renderGoAdminBodyCore({
    tab: "pending",
    bookings: [booking({ id: "bk-egal", status: "accepted", dayKey: "2019-01-01" })],
    deps
  });
  assert.ok(html.includes("bk-egal"));
  assert.ok(html.includes(`<span class="go-tabs__count" aria-hidden="true">1</span>`));
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
  // Die gefundene Buchung steht genau einmal da.
  assert.equal((html.match(/data-go-booking="bk-found"/g) || []).length, 1);
  // Und sie ist die EINZIGE, die hier steht: Aktivizo listet nichts mehr.
  assert.equal(html.includes(`data-go-booking="bk-other"`), false);
});

test("the found booking stands IN the card, not as a second card below it", () => {
  // Vorher standen zwei Karten untereinander fuer einen einzigen Handgriff,
  // und die Seite wurde laenger, sobald ein Code traf. Jetzt verwandelt sich
  // dieselbe Karte.
  const found = booking({ id: "bk-found" });
  const html = renderGoAdminBodyCore({
    tab: "active",
    bookings: [found],
    search: { code: "X2MWW", status: "", busy: false, booking: found },
    deps
  });
  const cardAt = html.indexOf(`<div class="go-activate"`);
  assert.ok(cardAt > -1);
  // Die Schicht liegt INNERHALB der Karte - vor deren schliessendem Tag.
  const doneAt = html.indexOf(`class="go-activate__done"`);
  assert.ok(doneAt > cardAt, "die Buchung steht nicht in der Karte");
  // Und die Zeile aus der Liste steht nicht mehr darunter: keine zweite Karte,
  // kein eigener Rahmen, kein eigener Grund.
  assert.equal(html.includes("go-booking--found"), false);
  assert.equal(html.includes(`<div class="mt-4">`), false);
  // Die Zeile der Liste traegt selbst keinen Knopf mehr - sie ist eine Zeile.
  const listOnly = renderGoAdminBodyCore({ tab: "pending", bookings: [booking({ status: "accepted" })], deps });
  assert.equal(listOnly.includes("data-go-booking-finalize"), false);
  assert.equal(listOnly.includes("data-go-confirm-party"), false);
});

test("the finalize view says which offer, for how many, and nothing else", () => {
  const found = booking({
    id: "bk-found",
    partySizeRequested: 2,
    snapshot: { benefitLabel: "1 Croissant + 1 Kafe FALAS me porosi ushqimi" }
  });
  const html = renderGoAdminBodyCore({
    tab: "active",
    bookings: [found],
    search: { code: "X2MWW", status: "", busy: false, booking: found },
    deps
  });
  const doneAt = html.indexOf(`class="go-activate__done"`);
  const done = html.slice(doneAt, html.indexOf("</div>\n    </div>", doneAt));

  // Oben links das Schild "Oferta" und darunter der Code, den der Kellner
  // eingetippt hat - zwei Zeilen, nicht mehr eine.
  assert.ok(done.includes(`class="go-activate__done-label">Oferta<`), done);
  assert.ok(done.includes(`class="go-activate__done-code">X2MWW<`), done);
  assert.equal(done.includes("Oferta: X2MWW"), false, done);
  // Oben rechts die Gruppe als Pille - und sie zaehlt richtig.
  assert.ok(done.includes("2 persona"), done);
  // AKTIVIZUAR ist weg: Der Zustand war schon die Bedingung dafuer, dass
  // dieser Bildschirm ueberhaupt so aussieht.
  assert.equal(/Aktivizuar/i.test(done), false, done);
  // In der Mitte der tatsaechliche Inhalt der Oferta - als Text, ohne Kasten.
  assert.ok(done.includes("1 Croissant + 1 Kafe FALAS me porosi ushqimi"), done);
  // Zwischen dem Angebot und dem, was damit zu tun ist, steht eine Linie.
  assert.ok(done.includes(`class="go-activate__rule"`), done);
  assert.ok(done.indexOf("go-activate__deal") < done.indexOf("go-activate__rule"), done);
  // Darunter die Frage und die vorhandene Personenwahl, ganz unten der Knopf.
  assert.ok(done.includes("Sa persona?"), done);
  assert.ok(done.includes("data-go-confirm-party"), done);
  assert.ok(done.indexOf("go-activate__rule") < done.indexOf("data-go-confirm-party"), done);
  assert.ok(done.indexOf("data-go-confirm-party") < done.indexOf("data-go-booking-finalize"), done);
  // Und keine zweite Erklaerung unter der Frage.
  assert.equal(done.includes("go-activate__party-hint"), false, done);
});

test("the offer is the loudest thing on the card, and it sizes itself", () => {
  // Kurz und lang sollen denselben Platz fuellen - das koennen sie nur in
  // verschiedenen Groessen. Die Stufe wird an der Laenge abgelesen, nicht
  // nach dem Zeichnen gemessen.
  const size = (label) => {
    const found = booking({ id: "bk-found", snapshot: { benefitLabel: label } });
    const html = renderGoAdminBodyCore({
      tab: "active",
      search: { code: "X2MWW", status: "", busy: false, booking: found },
      deps
    });
    // Aus dem Aufbau, nicht aus dem Blatt: Dort stehen dieselben Namen in
    // den Regeln, und die stehen weiter oben.
    return (html.match(/<div class="go-activate__deal" data-go-deal="([a-z]+)"/) || [])[1] || "";
  };
  assert.equal(size("-10%"), "xl");
  assert.equal(size("1 Kafe falas"), "lg");
  assert.equal(size("1 Croissant + 1 Kafe falas"), "md");
  assert.equal(size("1 Croissant + 1 Kafe FALAS me porosi ushqimi"), "sm");

  // Und im Blatt steht zu jeder Stufe eine Groesse - die groesste als
  // Voreinstellung, die drei anderen nehmen sie zurueck.
  const html = renderGoAdminBodyCore({ tab: "active", deps });
  assert.ok(ruleBlock(html, ".go-activate__deal-text").includes("font-size: 32px;"));
  ["lg", "md", "sm"].forEach((step) => {
    assert.ok(html.includes(`.go-activate__deal[data-go-deal="${step}"] .go-activate__deal-text {`), step);
  });
  // Mittig, und ohne Kasten drumherum.
  assert.ok(ruleBlock(html, ".go-activate__deal-text").includes("text-align: center;"));
});

test("the question keeps its room, and the stepper drops below it when it must", () => {
  const html = renderGoAdminBodyCore({ tab: "active", deps });
  const party = ruleBlock(html, ".go-activate__party");
  // Die Zeile darf umbrechen - dann steht der Zaehler rechts DARUNTER.
  assert.ok(party.includes("flex-wrap: wrap;"), party);
  assert.ok(ruleBlock(html, ".go-activate__stepper").includes("margin-left: auto;"));
  // Die Frage wird dabei weder abgeschnitten noch in eine Zeile gezwungen.
  const label = ruleBlock(html, ".go-activate__party-label");
  assert.equal(label.includes("white-space: nowrap;"), false, label);
  assert.equal(label.includes("text-overflow: ellipsis;"), false, label);
});

test("the party size is a stepper, and it keeps the field it always had", () => {
  const found = booking({ id: "bk-found", partySizeRequested: 3 });
  const html = renderGoAdminBodyCore({
    tab: "active",
    search: { code: "X2MWW", status: "", busy: false, booking: found },
    deps
  });
  // Dasselbe Feld wie vorher: dieselbe Marke, derselbe Typ, dieselben
  // Grenzen. Nur stehen zwei Griffe daneben.
  assert.ok(html.includes(`min="1" max="10" data-go-confirm-party`));
  assert.ok(html.includes(`value="3"`));
  assert.ok(html.includes(`data-go-party-step="-1"`));
  assert.ok(html.includes(`data-go-party-step="1"`));
  // Fingergross, nicht winzig: 40 Punkte liegen ueber der Schwelle, ab der
  // ein Ziel auf dem Telefon sicher zu treffen ist.
  assert.ok(ruleBlock(html, ".go-activate__step").includes("width: 40px;"));
  assert.ok(ruleBlock(html, ".go-activate__step").includes("height: 40px;"));
  assert.ok(ruleBlock(html, ".go-activate__stepper").includes("height: 52px;"));
  // Und die Griffe kleben weder aneinander noch an der Kante der Kapsel.
  assert.ok(ruleBlock(html, ".go-activate__stepper").includes("padding: 0 6px;"));
  assert.ok(ruleBlock(html, ".go-activate__stepper").includes("gap: 2px;"));
  // Weiss mit einer Haarlinie, stark gerundet - wie die Pille oben.
  const shell = ruleBlock(html, ".go-activate__stepper");
  assert.ok(shell.includes("background: #ffffff;"), shell);
  assert.ok(shell.includes("border-radius: 999px;"), shell);
  assert.ok(shell.includes("border: 1px solid var(--go-activate-line);"), shell);

  // Und der Griff bewegt die Zahl im Feld - ohne neu zu zeichnen, sonst
  // faehrt die Schicht ihre Bewegung von vorne.
  const controller = readFileSync(
    new URL("../apps/menyra-social/core/go/go-admin-view-controller.js", import.meta.url),
    "utf8"
  );
  assert.ok(controller.includes(`target.closest("[data-go-party-step]")`));
  const step = controller.slice(controller.indexOf("function stepPartySize("));
  const body = step.slice(0, step.indexOf("\n  }"));
  // Die Grenzen kommen aus dem Feld und werden hier nicht neu erfunden.
  assert.ok(body.includes("Number(input.min)"), body);
  assert.ok(body.includes("Number(input.max)"), body);
  assert.ok(body.includes("Math.min(max, Math.max(min, now + delta))"), body);
  assert.equal(body.includes("render()"), false, body);
});

test("finalizo is a word in the navy of the brand, not a shouted sign", () => {
  const html = renderGoAdminBodyCore({ tab: "active", deps });
  const finalize = ruleBlock(html, ".go-activate__finalize");
  // Dasselbe Violett, das auch "Aktivizo" traegt - keine neue Farbe.
  assert.ok(finalize.includes("background: var(--go-activate-ink);"), finalize);
  assert.ok(html.includes("--go-activate-ink: #0f172a;"));
  assert.ok(finalize.includes("color: #ffffff;"), finalize);
  // Nicht in Grossbuchstaben, und fingergross ueber die ganze Breite.
  assert.equal(finalize.includes("text-transform: uppercase;"), false, finalize);
  assert.ok(finalize.includes("width: 100%;"), finalize);
  assert.ok(finalize.includes("height: 56px;"), finalize);
  // Und er bleibt unten: Was oben laenger wird, nimmt sich der Platz des
  // Angebots, nicht seiner.
  assert.ok(finalize.includes("flex: 0 0 auto;"), finalize);
});

test("one person is a person, two are persona", () => {
  const one = booking({ id: "bk-1", partySizeRequested: 1 });
  assert.ok(renderGoAdminBodyCore({
    tab: "active", search: { code: "X2MWW", status: "", busy: false, booking: one }, deps
  }).includes("1 person<"));
  const five = booking({ id: "bk-5", partySizeRequested: 5 });
  assert.ok(renderGoAdminBodyCore({
    tab: "active", search: { code: "X2MWW", status: "", busy: false, booking: five }, deps
  }).includes("5 persona"));
});

test("the counted group wins over the one the guest guessed", () => {
  // Dieselbe Zahl in der Zeile der Liste und im Kopf der Karte - sie kommt aus
  // einer Funktion und nicht aus zwei Rechnungen.
  const found = booking({ id: "bk-found", partySizeRequested: 2, partySizeVerified: 4 });
  const html = renderGoAdminBodyCore({
    tab: "active",
    search: { code: "X2MWW", status: "", busy: false, booking: found },
    deps
  });
  assert.ok(html.includes("4 persona"));
  assert.ok(html.includes(`value="4"`));
});

test("the offer keeps its room, so the button below never moves", () => {
  const html = renderGoAdminBodyCore({ tab: "active", deps });
  const deal = ruleBlock(html, ".go-activate__deal");
  // Der Bereich nimmt, was uebrig ist, und mindestens so viel - damit ein
  // kurzes "-10%" und ein langes Paket die Zeilen darunter an derselben
  // Stelle stehen lassen.
  assert.ok(deal.includes("flex: 1 1 auto;"), deal);
  assert.ok(deal.includes("min-height: 72px;"), deal);
  // Und es klebt nicht am Kopf darueber.
  assert.ok(deal.includes("margin-top: 18px;"), deal);
  // Was laenger ist als der Platz, bleibt erreichbar - abgeschnitten wird
  // nichts, und ueberlaufen tut auch nichts.
  assert.ok(deal.includes("overflow-y: auto;"), deal);
  const text = ruleBlock(html, ".go-activate__deal-text");
  assert.ok(text.includes("overflow-wrap: anywhere;"), text);
  assert.equal(text.includes("text-overflow: ellipsis"), false, text);
  assert.equal(text.includes("-webkit-line-clamp"), false, text);
  // Und alles darunter haelt seine Groesse fest.
  ["done-head", "party", "finalize"].forEach((part) => {
    assert.ok(ruleBlock(html, `.go-activate__${part}`).includes("flex: 0 0 auto;"), part);
  });
});

test("the offer sits in the card as text, without a box of its own", () => {
  const html = renderGoAdminBodyCore({ tab: "active", deps });
  // Keine verschachtelte Karte: Die Schicht hat keinen eigenen Grund, keinen
  // Rahmen und keinen Schatten - sie IST die Karte.
  const done = ruleBlock(html, ".go-activate__done");
  assert.ok(done.includes("padding: 24px 18px;"), done);
  assert.equal(/background:/.test(done), false, done);
  assert.equal(/border:/.test(done), false, done);
  assert.equal(/box-shadow:/.test(done), false, done);
  assert.equal(/background:|border:|box-shadow:/.test(ruleBlock(html, ".go-activate__deal")), false);
});

test("the card turns into the finalize view, it does not jump into it", () => {
  const html = renderGoAdminBodyCore({ tab: "active", deps });
  // Die Buchung kommt herein, nachdem die Eingabemaske gegangen ist: ein
  // leichter Fade und eine kleine senkrechte Bewegung, zusammen 240ms.
  const rest = ruleBlock(html, ".go-activate__done");
  assert.ok(rest.includes("transform: translateY(8px);"), rest);
  assert.ok(rest.includes("opacity: 0;"), rest);
  const shown = html.slice(html.indexOf('.go-activate[data-go-camera="0"][data-go-found="1"] .go-activate__done'));
  assert.ok(shown.includes("opacity 160ms var(--go-activate-ease) 120ms"), shown.slice(0, 500));
  assert.ok(shown.includes("transform 160ms var(--go-activate-ease) 120ms"), shown.slice(0, 500));
  // Die Eingabemaske geht dabei nur weg - zwei Schichten, die gleichzeitig
  // wandern, sehen aus wie ein Ruck.
  const face = html.slice(html.indexOf('.go-activate[data-go-camera="0"][data-go-found="1"] .go-activate__face'));
  assert.equal(face.slice(0, face.indexOf("}")).includes("translateY"), false, face.slice(0, 400));
  // Eine offene Kamera bleibt eine offene Kamera - deshalb steht sie im
  // Wahlspruch mit drin.
  assert.ok(html.includes('.go-activate[data-go-camera="0"][data-go-found="1"] .go-activate__done'));
  // Und wer Bewegung abbestellt hat, bekommt keine.
  const reducedBlocks = html.split("@media (prefers-reduced-motion: reduce) {").slice(1)
    .map((part) => part.slice(0, part.indexOf("}\n}") + 3));
  assert.ok(
    reducedBlocks.some((block) => block.includes(".go-activate__done") && block.includes("transition: none")),
    JSON.stringify(reducedBlocks)
  );
});

test("a booking that just arrived is drawn where the card still stands", () => {
  // Ein frisch gezeichneter Knoten bewegt sich nicht. Deshalb zeichnet die
  // Karte die ankommende Buchung noch in der Eingabemaske, und der Controller
  // legt danach um - siehe applyFoundState.
  const found = booking({ id: "bk-found" });
  const search = { code: "X2MWW", status: "", busy: false, booking: found };
  const entering = renderGoAdminBodyCore({ tab: "active", search, bookingEntering: true, deps });
  assert.ok(entering.includes(`data-go-found="0"`));
  // Der Inhalt steht trotzdem schon da - sonst gaebe es nichts, was
  // hereinfahren koennte.
  assert.ok(entering.includes(`class="go-activate__done-code">X2MWW<`));
  // Ohne Controller steht die Buchung sofort da. Das ist die Voreinstellung.
  assert.ok(renderGoAdminBodyCore({ tab: "active", search, deps }).includes(`data-go-found="1"`));
  assert.ok(renderGoAdminBodyCore({ tab: "active", deps }).includes(`data-go-found="0"`));
});

test("a finalize that failed says so where it happened", () => {
  // Die Meldung stand unter dem Codefeld - und das ist in diesem Augenblick
  // nicht zu sehen. Sie gehoert zu dem Knopf, an dem es passiert ist.
  const found = booking({ id: "bk-found" });
  const html = renderGoAdminBodyCore({
    tab: "active",
    search: { code: "X2MWW", status: "Nuk u finalizua. Provo prapë.", busy: false, booking: found },
    deps
  });
  const doneAt = html.indexOf(`class="go-activate__done"`);
  assert.ok(html.slice(doneAt).includes("Nuk u finalizua. Provo prapë."));
  // Und genau einmal: nicht zusaetzlich noch unter dem verdeckten Feld.
  assert.equal((html.match(/Nuk u finalizua/g) || []).length, 1);
  // Ohne Buchung steht sie weiter dort, wo gesucht wird.
  const searching = renderGoAdminBodyCore({
    tab: "active",
    search: { code: "XXXX", status: "Ky kod nuk u gjet.", busy: false, booking: null },
    deps
  });
  assert.ok(searching.slice(searching.indexOf("go-activate__face")).includes("Ky kod nuk u gjet."));
});

test("after a finalize the card drives the same move backwards", () => {
  const controller = readFileSync(
    new URL("../apps/menyra-social/core/go/go-admin-view-controller.js", import.meta.url),
    "utf8"
  );
  // Nach dem Abschluss wird NICHT gezeichnet: Ein Neuzeichnen ersetzte die
  // Schicht, und eine ersetzte Schicht bewegt sich nicht, sie ist weg.
  assert.ok(controller.includes("closeFoundBooking();"));
  const close = controller.slice(controller.indexOf("function closeFoundBooking()"));
  const body = close.slice(0, close.indexOf("\n  }"));
  assert.ok(body.includes(`card.setAttribute("data-go-found", "0")`), body);
  // Das Feld ist leer, bevor es wieder zu sehen ist - der naechste Gast faengt
  // nicht mit dem Code des vorigen an.
  assert.ok(body.includes(`current.search = { code: "", status: "", busy: false, booking: null };`), body);
  assert.ok(body.includes("input.value = \"\""), body);
  // Und aufgeraeumt wird erst, wenn die Bewegung durch ist.
  assert.ok(body.includes("bookingExitTimer = setTimeout("), body);
  assert.ok(controller.includes("const BOOKING_EXIT_MS = 340;"));
  // Und die Meldung von vorhin geht mit: An ihr haengt eine Zeile Hoehe, und
  // die Karte soll sich nicht auf ein Mass zusammenziehen, das eine Zeile zu
  // gross ist.
  assert.ok(body.includes(`card.setAttribute("data-go-note", "0")`), body);
  // Kein Nachlauf, der nach dem Verlassen der Seite noch zeichnet.
  const disconnectAt = controller.indexOf("disconnect: () => {");
  assert.ok(controller.slice(disconnectAt, disconnectAt + 900).includes("clearTimeout(bookingExitTimer)"));
  // Und der Weg zum Server ist unveraendert: derselbe Code, dieselbe Zahl,
  // derselbe Aufruf.
  assert.ok(controller.includes("await finalizeBookingFn({"));
  assert.ok(controller.includes("shortCode: current.search.code,"));
  assert.ok(controller.includes(`doc?.querySelector?.("[data-go-confirm-party]")`));
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
  assert.ok(html.includes("Sa persona?"));
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
  const found = booking({ id: "bk-found" });
  const html = renderGoAdminBodyCore({
    tab: "active",
    bookings: [found],
    search: { code: "A7K2M", status: "", busy: false, booking: found },
    deps
  });
  // In der Karte steht jetzt gar kein Gast mehr - nicht einmal der anonyme
  // Name. Was das Lokal braucht, ist die Oferta, die Gruppe und der Knopf;
  // WER da sitzt, geht es nichts an.
  assert.equal(html.includes("Mnyra Guest"), false);
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
// Die Leiste: zwei Gruppen, ein Pfeil (Navigation, nicht Auswahl).
// ===========================================================================

function tabController(overrides = {}) {
  const state = {};
  const controller = createGoAdminViewController({
    state,
    renderFn: () => {},
    documentObj: null,
    helperApi: deps,
    profileApi: {
      resolveOwnRestaurantIdFn: () => "rest-1",
      getRestaurantMetaByIdFn: () => ({ name: "Casa Rita" }),
      isBusinessProfileFn: () => true
    },
    ...overrides
  });
  return controller;
}

test("GO opens on Aktivizo, in the first group", () => {
  const controller = tabController();
  const view = controller.__view();
  assert.equal(view.tab, "active");
  assert.equal(view.tabGroup, 0);
});

test("the groups carry exactly the six tabs, in the given order", () => {
  assert.deepEqual(GO_TAB_GROUPS.map((group) => group.tabs), [
    ["pending", "active", "finalized"],
    ["stats", "payments", "offers"]
  ]);
  // Und die Einstellungen stehen in keiner: Sie haengen am Knopf oben.
  assert.equal(goTabGroupIndex("options"), -1);
  assert.equal(goTabGroupIndex("active"), 0);
  assert.equal(goTabGroupIndex("offers"), 1);
});

test("turning the bar moves the group and leaves the open tab alone", () => {
  const controller = tabController();
  const view = controller.__view();

  controller.__setTabGroup(1);
  assert.equal(view.tabGroup, 1);
  // Und das ist der Punkt: Was offen war, ist offen geblieben.
  assert.equal(view.tab, "active");

  controller.__setTabGroup(0);
  assert.equal(view.tabGroup, 0);
  assert.equal(view.tab, "active");
});

test("the bar does not turn past its ends", () => {
  const controller = tabController();
  const view = controller.__view();
  controller.__setTabGroup(-1);
  assert.equal(view.tabGroup, 0);
  controller.__setTabGroup(5);
  assert.equal(view.tabGroup, GO_TAB_GROUPS.length - 1);
});

test("opening the settings from the header does not move the bar", () => {
  // Der Knopf oben gehoert zu keiner Gruppe. Wer ihn antippt, soll die Leiste
  // darunter nicht wandern sehen.
  const controller = tabController();
  const view = controller.__view();
  controller.__setTabGroup(1);
  view.tab = "options";
  const belongs = goTabGroupIndex("options");
  assert.equal(belongs, -1);
  // Die Ansicht laesst die Gruppe stehen, weil der Reiter zu keiner gehoert.
  assert.equal(view.tabGroup, 1);
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

test("the day of the venue comes from the venue, not from the phone", () => {
  // Der Tag, nach dem "Në pritje" filtert, ist der des LOKALS. Er wird bei
  // jedem Zeichnen gefragt statt einmal gemerkt - dann stimmt er auch dann
  // noch, wenn seit der letzten Aenderung Mitternacht war.
  const controller = createData({
    // 00:30 UTC am 14. - in Prishtina (UTC+2 im Sommer) ist es 02:30 desselben
    // Tages, in Los Angeles noch der 13. Die Buchungen tragen den Tag des
    // Lokals, also muss die Frage ihn auch geben.
    nowFn: () => Date.parse("2026-08-14T00:30:00.000Z")
  });
  assert.equal(typeof controller.currentDayKey, "function");
  assert.equal(controller.currentDayKey(), "2026-08-14");

  // Steht eine Zeitzone am Lokal, gilt sie.
  controller.data.timeZone = "Pacific/Auckland";
  assert.equal(controller.currentDayKey(), "2026-08-14");
  controller.data.timeZone = "America/Los_Angeles";
  assert.equal(controller.currentDayKey(), "2026-08-13");
});

// Die fuenf Zahlen kommen vom Server. Diese Tests pruefen den Weg dorthin -
// nicht die Rechnung selbst, die steht in tests/go-service.test.mjs.

function serverOverview(overrides = {}) {
  return {
    restaurantId: "rest-1",
    period: "sot",
    reach: { impressions: 120, uniqueViewers: 42 },
    funnel: { accepted: 7, activated: 5, finalized: 3 },
    visitors: { visits: 3, visitors: 11 },
    openCents: 450,
    sources: { bookings: true, ledger: true, stats: true },
    ...overrides
  };
}

// Die Zahlen kommen aus ZWEI Quellen: dem Tagesdokument (sofort, per
// Listener) und dem Server (langsamer, aber vollstaendig). Diese Tests
// pruefen das Zusammensetzen - die Rechnung selbst steht in go-service.test.

function dayStats(overrides = {}) {
  return { impressions: 90, uniqueViewers: 30, accepted: 5, activated: 4, finalized: 2, visitors: 6, commissionCents: 300, ...overrides };
}

// Ein Firestore-Doppel, das nur so viel kann, wie der Datencontroller braucht:
// die drei Listener und die zwei Dokumente beim Verbinden.
function fakeFirestore({ settings = {}, restaurant = {} } = {}) {
  const listeners = {};
  const api = {
    collection: (db, ...parts) => ({ path: parts.join("/") }),
    doc: (db, ...parts) => ({ path: parts.join("/") }),
    query: (ref) => ref,
    where: () => null,
    orderBy: () => null,
    limit: () => null,
    getDoc: async (ref) => {
      const data = ref.path.includes("goSettings") ? settings : restaurant;
      return { exists: () => true, data: () => data };
    },
    onSnapshot: (ref, next) => {
      const key = String(ref.path || "").includes("goStats")
        ? "stats"
        : (String(ref.path || "").includes("goOffers") ? "offers" : "bookings");
      listeners[key] = next;
      if (key !== "stats") next({ forEach: () => {} });
      return () => { listeners[key] = null; };
    },
    serverTimestamp: () => null
  };
  return { firestore: { db: {}, api }, listeners };
}

function memoryStorage(seed = {}) {
  const map = new Map(Object.entries(seed));
  return {
    getItem: (key) => (map.has(key) ? map.get(key) : null),
    setItem: (key, value) => map.set(key, value),
    removeItem: (key) => map.delete(key)
  };
}

test("four of the five numbers come from the day document, not from a call", async () => {
  // Sie lagen dort die ganze Zeit fertig summiert - in genau dem Dokument,
  // das der Controller ohnehin per Listener offen hat. Sie aus bis zu 2000
  // Buchungen neu zu rechnen war der Grund, warum die Karten lange leer
  // standen.
  const { firestore, listeners } = fakeFirestore();
  let calls = 0;
  const controller = createData({
    firestore,
    storageObj: memoryStorage(),
    overviewFn: async () => { calls += 1; return new Promise(() => {}); }
  });
  await controller.connect();
  listeners.stats({ exists: () => true, data: () => dayStats() });

  // Der Aufruf ist noch unterwegs - die vier Zahlen stehen trotzdem schon da.
  assert.equal(calls, 1);
  assert.equal(controller.data.overview.uniqueViewers, 30);
  assert.equal(controller.data.overview.accepted, 5);
  assert.equal(controller.data.overview.visits, 2);
  assert.equal(controller.data.overview.visitors, 6);
  // Nur der offene Betrag nicht: Der steht in keinem Tagesdokument.
  assert.equal(controller.data.overview.openCents, null);
});

test("the remembered amount stands before the first call comes back", async () => {
  const storage = memoryStorage();
  const { firestore } = fakeFirestore();
  const first = createData({
    firestore,
    storageObj: storage,
    overviewFn: async () => serverOverview({ openCents: 725 })
  });
  await first.connect();
  await first.refreshOverview({ force: true });
  assert.equal(first.data.overview.openCents, 725);
  first.disconnect();

  // Beim naechsten Oeffnen steht der Betrag SOFORT, ohne auf den Server zu
  // warten.
  const { firestore: second } = fakeFirestore();
  const again = createData({
    firestore: second,
    storageObj: storage,
    overviewFn: async () => new Promise(() => {})
  });
  await again.connect();
  assert.equal(again.data.overview.openCents, 725);
});

test("the server corrects a day counter that lost a tick, and never lowers it", async () => {
  // Das Tagesdokument wird beilaeufig hochgezaehlt: Es kann eine Zaehlung
  // verlieren, aber nie eine erfinden. Der Server rechnet aus den Buchungen
  // selbst. Also gilt die groessere Zahl - der Server ist der Boden, das
  // Tagesdokument bringt live dazu, was seit seiner Antwort passiert ist.
  const { firestore, listeners } = fakeFirestore();
  const controller = createData({
    firestore,
    storageObj: memoryStorage(),
    overviewFn: async () => serverOverview({ funnel: { accepted: 7 } })
  });
  await controller.connect();

  // Tagesdokument hinkt hinterher (5), Server weiss es besser (7).
  listeners.stats({ exists: () => true, data: () => dayStats({ accepted: 5 }) });
  await controller.refreshOverview({ force: true });
  assert.equal(controller.data.overview.accepted, 7);

  // Jetzt nimmt einer mehr an: Das Tagesdokument zieht auf 8 - und die
  // Anzeige geht sofort mit, ohne auf den naechsten Aufruf zu warten.
  listeners.stats({ exists: () => true, data: () => dayStats({ accepted: 8 }) });
  assert.equal(controller.data.overview.accepted, 8);
});

test("a busy evening does not become an evening of server calls", async () => {
  // Das Tagesdokument geht bei JEDER vorgezeigten Karte hoch. Vorher loeste
  // jede davon einen Nachschlag aus - jedes Mal ueber bis zu 2000 Buchungen
  // und 5000 Zeilen des Finanzbuchs.
  const { firestore, listeners } = fakeFirestore();
  let calls = 0;
  let clock = Date.parse("2026-08-13T18:00:00.000Z");
  const controller = createData({
    firestore,
    storageObj: memoryStorage(),
    nowFn: () => clock,
    overviewFn: async () => { calls += 1; return serverOverview(); }
  });
  await controller.connect();
  await new Promise((resolve) => setImmediate(resolve));
  const afterConnect = calls;

  let impressions = 0;
  let commissionCents = 0;
  for (let i = 0; i < 60; i += 1) {
    impressions += 1;
    // Dreimal entsteht Geld - nur das ist eine Frage an den Server.
    if (i === 20 || i === 40 || i === 55) commissionCents += 150;
    listeners.stats({ exists: () => true, data: () => dayStats({ impressions, commissionCents }) });
    clock += 5000;
    await new Promise((resolve) => setImmediate(resolve));
  }

  assert.equal(afterConnect, 1);
  // 60 Zaehlungen, drei davon mit Geld: drei Aufrufe, nicht sechzig.
  assert.equal(calls - afterConnect, 3);
});

test("after midnight the panel does not read yesterday as today", async () => {
  // Ein Panel, das ueber Nacht offen bleibt, hing sonst am Dokument von
  // gestern - und zeigte am Morgen dessen Zahlen als die des neuen Tages.
  let clock = Date.parse("2026-08-13T20:00:00.000Z");
  const { firestore, listeners } = fakeFirestore({ settings: { timeZone: "UTC" } });
  const controller = createData({
    firestore,
    storageObj: memoryStorage(),
    nowFn: () => clock,
    overviewFn: async () => serverOverview()
  });
  await controller.connect();
  listeners.stats({ exists: () => true, data: () => dayStats({ accepted: 9 }) });
  assert.equal(controller.data.overview.accepted, 9);

  // Mitternacht. Der naechste Snapshot der Buchungen bringt den Wechsel.
  clock = Date.parse("2026-08-14T00:30:00.000Z");
  listeners.bookings({ forEach: () => {} });
  // Der Listener sitzt jetzt auf dem neuen Tag, und der ist leer - keine Zahl
  // von gestern steht mehr als die von heute da.
  assert.equal(controller.data.stats.known, false);
  assert.equal(controller.data.statsDayKey, "2026-08-14");
});

test("the five numbers come from the server, each from its own stage", async () => {
  const calls = [];
  const controller = createData({
    overviewFn: async (payload) => {
      calls.push(payload);
      return serverOverview();
    }
  });

  await controller.refreshOverview({ force: true });

  // Genau das eingeloggte Lokal, und der Tag.
  assert.deepEqual(calls, [{ restaurantId: "rest-1", period: "sot" }]);
  assert.deepEqual(controller.data.overview, {
    // gesehen: PERSONEN, nicht vorgezeigte Karten.
    uniqueViewers: 42,
    // gewaehlt: die Annahmen des Tages.
    accepted: 7,
    // verifiziert: eingeloeste Vorgaenge, nicht Annahmen.
    visits: 3,
    // und die Menschen daraus.
    visitors: 11,
    openCents: 450
  });
  // Die vorgezeigten Karten fliessen NICHT in die Reichweite ein.
  assert.equal(controller.data.overview.uniqueViewers, 42);
});

test("numbers for another venue are dropped, not shown", async () => {
  // Ein Aufruf, der nach einem Wechsel zurueckkommt, darf die Zahlen des
  // einen Lokals nicht in der Ansicht des anderen ablegen.
  const controller = createData({
    overviewFn: async () => serverOverview({ restaurantId: "rest-2" })
  });
  await controller.refreshOverview({ force: true });
  // Nicht "0" und nicht "geladen": Es ist weiter nichts bekannt.
  assert.equal(controller.data.overview.openCents, null);
  assert.equal(controller.data.overview.uniqueViewers, null);
});

test("a failing overview leaves the last known numbers standing", async () => {
  let fail = false;
  const controller = createData({
    overviewFn: async () => {
      if (fail) throw new Error("offline");
      return serverOverview();
    }
  });
  await controller.refreshOverview({ force: true });
  fail = true;
  await controller.refreshOverview({ force: true });
  // Nicht auf null zurueck und nicht auf "nicht geladen" - was zuletzt galt,
  // bleibt stehen.
  assert.equal(controller.data.overview.uniqueViewers, 42);
  assert.equal(controller.data.overview.openCents, 450);
});

test("a source the server could not read stays a skeleton, not a zero", async () => {
  // Der Server sagt, welche seiner drei Quellen er lesen konnte. Was er nicht
  // lesen konnte, ist NICHT null - "wir konnten gerade nicht nachsehen" und
  // "es ist heute nichts passiert" duerfen nicht dieselbe Anzeige haben.
  const controller = createData({
    overviewFn: async () => serverOverview({
      reach: { impressions: 0, uniqueViewers: 0 },
      openCents: 0,
      sources: { bookings: true, ledger: false, stats: false }
    })
  });

  await controller.refreshOverview({ force: true });
  // Die Buchungen kamen an - die drei Zahlen daraus stehen da.
  assert.equal(controller.data.overview.accepted, 7);
  assert.equal(controller.data.overview.visits, 3);
  assert.equal(controller.data.overview.visitors, 11);
  // Die anderen beiden Quellen nicht - dort bleibt es unbekannt.
  assert.equal(controller.data.overview.uniqueViewers, null);
  assert.equal(controller.data.overview.openCents, null);
});

test("a source that fails later does not erase what it delivered before", async () => {
  let sources = { bookings: true, ledger: true, stats: true };
  const controller = createData({
    overviewFn: async () => serverOverview({ sources })
  });
  await controller.refreshOverview({ force: true });
  assert.equal(controller.data.overview.openCents, 450);

  sources = { bookings: true, ledger: false, stats: true };
  await controller.refreshOverview({ force: true });
  // Der letzte bekannte Betrag bleibt stehen - eine Null waere eine Auskunft,
  // die der Server gerade nicht geben konnte.
  assert.equal(controller.data.overview.openCents, 450);
});

test("an older server answer without source flags still counts as complete", async () => {
  const controller = createData({
    overviewFn: async () => {
      const overview = serverOverview();
      delete overview.sources;
      return overview;
    }
  });
  await controller.refreshOverview({ force: true });
  assert.equal(controller.data.overview.uniqueViewers, 42);
  assert.equal(controller.data.overview.openCents, 450);
});

test("without a server function nothing is invented", async () => {
  const controller = createData();
  await controller.refreshOverview({ force: true });
  assert.deepEqual(controller.data.overview, {
    uniqueViewers: null, accepted: null, visits: null, visitors: null, openCents: null
  });
});

test("a busy evening does not turn every impression into a server call", async () => {
  // Das Tagesdokument geht bei JEDER vorgezeigten Karte hoch. Ein Aufruf je
  // Zaehlung waere ein zweites Suchsystem mit der Rechnung des Lokals daran.
  let calls = 0;
  let clock = Date.parse("2026-08-13T14:00:00.000Z");
  const controller = createData({
    nowFn: () => clock,
    overviewFn: async () => {
      calls += 1;
      return serverOverview();
    }
  });

  await controller.refreshOverview({ force: true });
  assert.equal(calls, 1);

  // Fünf weitere Zaehlungen in derselben Sekunde: kein weiterer Aufruf.
  await controller.refreshOverview();
  await controller.refreshOverview();
  await controller.refreshOverview();
  assert.equal(calls, 1);

  // Nach dem Abstand geht wieder einer hinaus.
  clock += 20000;
  await controller.refreshOverview();
  assert.equal(calls, 2);
});

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

test("the view hands the venue's day down to Në pritje", () => {
  // Die Seite filtert nicht selbst nach einem Tag, den sie sich ausdenkt: Sie
  // reicht den Tag des Lokals durch, den der Datenteil rechnet. Ohne diese
  // Verdrahtung stuende gestern noch in der heutigen Zahl.
  const controller = panel();
  const current = controller.__view();
  const today = buildGoDayKey({ atMs: Date.now() });
  const yesterday = buildGoDayKey({ atMs: Date.now() - 24 * 60 * 60 * 1000 });

  current.tab = "pending";
  current.loading = false;
  current.bookings = [
    booking({ id: "bk-heute", status: "accepted", dayKey: today }),
    booking({ id: "bk-gestern", status: "accepted", dayKey: yesterday })
  ];

  const html = controller.renderGoAdminView();
  assert.ok(html.includes("bk-heute"));
  assert.equal(html.includes("bk-gestern"), false);
  assert.ok(html.includes(`<span class="go-tabs__count" aria-hidden="true">1</span>`));
});

test("the two handles move the number, and they stop at the old limits", () => {
  // Ein Feld, wie es in der Karte steht: dieselben Grenzen, derselbe Wert.
  const field = { min: "1", max: "10", value: "2" };
  const controller = panel({}, {
    documentObj: {
      querySelector: (selector) => (selector === "[data-go-confirm-party]" ? field : null),
      createElement: () => ({ innerHTML: "", firstElementChild: null }),
      addEventListener: () => {}
    }
  });

  controller.__stepPartySize(1);
  assert.equal(field.value, "3");
  controller.__stepPartySize(-1);
  assert.equal(field.value, "2");

  // Unter eins geht nichts - die Grenze steht im Feld und wird hier nicht neu
  // erfunden.
  field.value = "1";
  controller.__stepPartySize(-1);
  assert.equal(field.value, "1");
  // Und ueber zehn auch nicht.
  field.value = "10";
  controller.__stepPartySize(1);
  assert.equal(field.value, "10");
});

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

test("an offer with a photo shows its photo in the list of the venue", () => {
  // Hier stand eine schmucklose Zeile: kein Foto, kein durchgestrichener
  // Normalpreis, keine Ersparnis. Wer ein Bild hochgeladen, es in der
  // Vorschau gesehen und gespeichert hatte, fand es hier nicht wieder - und
  // musste schliessen, dass es nicht gespeichert wurde. Gespeichert war es
  // die ganze Zeit; es wurde nur nie wieder gezeigt.
  const html = renderGoAdminBodyCore({
    tab: "offers",
    offers: [normalizeGoOffer({
      id: "o1",
      restaurantId: "rest-1",
      benefit: { kind: "bundle", itemName: "2 Burger + 2 Pije", regularPriceCents: 2000, goPriceCents: 1490 },
      imageUrl: "https://cdn.example/burger.jpg",
      partyRanges: ["1-2"],
      schedule: { mode: "always" }
    })],
    deps
  });
  assert.ok(html.includes("burger.jpg"));
  // Und die Zeilen, die der Gast auch sieht.
  assert.ok(html.includes("20,00"), "der normale Preis fehlt");
  assert.ok(html.includes("14,90"), "der GO-Preis fehlt");
  assert.ok(html.includes("Kursen"), "die Ersparnis fehlt");
  // Die Knoepfe des Wirts bleiben.
  assert.ok(html.includes("data-go-offer-edit"));
});

test("the card stylesheet is on the page, not only inside the modal", () => {
  // Es lag lange nur im Modal - und damit sah dieselbe Karte in der Vorschau
  // richtig aus und in der Liste nach gar nichts.
  const html = renderGoAdminBodyCore({ tab: "offers", offers: [], deps });
  assert.ok(html.includes(".mnyra-go-page__card-photo"), "GO_OFFER_CARD_CSS fehlt auf der Seite");
});
