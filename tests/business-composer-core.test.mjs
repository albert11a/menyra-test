import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { readFileSync } from "node:fs";
import path from "node:path";

import {
  normalizeComposerProductCore,
  filterComposerProductsCore,
  canPublishComposerDraftCore,
  normalizeComposerModeCore,
  resolveComposerProductTextCore,
  dedupeComposerProductsCore,
  buildComposerProductsSignatureCore,
  BUSINESS_COMPOSER_CSS
} from "../apps/menyra-social/core/composer/business-composer-controller.js";
import {
  renderDashboardComposerCard,
  resolveDashboardKindCore,
  DASHBOARD_CSS
} from "../apps/menyra-social/core/dashboard/dashboard-render-utils.js";
import * as dashboardRenderUtils from "../apps/menyra-social/core/dashboard/dashboard-render-utils.js";
import { collectHotelRoomsCore } from "../apps/menyra-social/core/profile/hotel-rooms-utils.js";

test("the whole composer card is the button, with the new title", () => {
  const html = renderDashboardComposerCard({ iconFn: (name) => `<i data-icon="${name}"></i>` });
  // Titel: "Posto" traegt die Farbe, "n'Mnyra" steht ruhig daneben.
  assert.ok(html.includes(`<span class="mnyra-dash__composer-accent">Posto</span> n'Mnyra`));
  assert.equal(html.includes("Zbulo"), false);
  // Untertitel bleibt Wort fuer Wort, wie er war.
  assert.ok(html.includes("Ndaj një postim ose një story me klientët e tu."));
  // Genau ein Knopf - und das ist die Karte selbst. Egal wo man tippt, es
  // oeffnet den Beitrag.
  assert.equal((html.match(/<button/g) || []).length, 1);
  assert.ok(html.includes('<button type="button" class="mnyra-dash__composer mnyra-dash__composer--tap" data-dashboard-composer-card data-dashboard-composer="post">'));
  // Kein Knopf mehr im Knopf: das waere weder gueltig noch bedienbar.
  assert.equal(html.includes("mnyra-dash__composer-btn"), false);
  // Kein Plus oben in der Karte - nur unten in der Zeile, mit Pfeil rechts.
  assert.equal((html.match(/data-icon="plus"/g) || []).length, 1);
  assert.equal((html.match(/data-icon="chevron-right"/g) || []).length, 1);
  const plusIndex = html.indexOf('data-icon="plus"');
  assert.ok(html.indexOf("mnyra-dash__composer-sub") < plusIndex, "das Plus steht unter dem Text");
  assert.ok(html.includes(">Posto</span>"));
  // Kein zweiter Knopf fuer Story - dafuer gibt es die Leiste im Modal.
  assert.ok(!html.includes('data-dashboard-composer="story"'));
});

test("the composer card action row is a divided line, not a filled button", () => {
  assert.ok(DASHBOARD_CSS.includes(".mnyra-dash__composer--tap {"));
  const tap = DASHBOARD_CSS.slice(DASHBOARD_CSS.indexOf(".mnyra-dash__composer--tap {"));
  const tapBlock = tap.slice(0, tap.indexOf("}"));
  // Als Knopf braucht die Karte die Textausrichtung und die Breite explizit.
  assert.ok(tapBlock.includes("text-align: left;"));
  assert.ok(tapBlock.includes("width: 100%;"));
  // Die Zeile haengt an einer Haarlinie, der Pfeil steht rechts aussen. Auf
  // der schwarzen Karte ist es die helle Haarlinie - die graue waere dort
  // nicht zu sehen.
  const cta = DASHBOARD_CSS.slice(DASHBOARD_CSS.indexOf(".mnyra-dash__composer-cta {"));
  assert.ok(cta.slice(0, cta.indexOf("}")).includes("border-top: 1px solid var(--dash-black-hairline);"));
  assert.ok(DASHBOARD_CSS.includes(".mnyra-dash__composer-cta-chevron {"));
  const chevron = DASHBOARD_CSS.slice(DASHBOARD_CSS.indexOf(".mnyra-dash__composer-cta-chevron {"));
  assert.ok(chevron.slice(0, chevron.indexOf("}")).includes("margin-left: auto;"));
  // Titel und Untertitel stehen jetzt in <span> - ohne Blockform saessen sie
  // in einer Zeile.
  const title = DASHBOARD_CSS.slice(DASHBOARD_CSS.indexOf(".mnyra-dash__composer-title {"));
  assert.ok(title.slice(0, title.indexOf("}")).includes("display: block;"));
  const sub = DASHBOARD_CSS.slice(DASHBOARD_CSS.indexOf(".mnyra-dash__composer-sub {"));
  assert.ok(sub.slice(0, sub.indexOf("}")).includes("display: block;"));
});

test("composer knows exactly three sides", () => {
  assert.equal(normalizeComposerModeCore("post"), "post");
  assert.equal(normalizeComposerModeCore("story"), "story");
  assert.equal(normalizeComposerModeCore("profile"), "profile");
  assert.equal(normalizeComposerModeCore("PROFILE"), "profile");
  // Alles Unbekannte landet beim Beitrag - nie bei Story oder Profil.
  assert.equal(normalizeComposerModeCore("quatsch"), "post");
  assert.equal(normalizeComposerModeCore(""), "post");
  assert.equal(normalizeComposerModeCore(), "post");
});

test("modal carries its own bottom bar to switch between postim, story and profil", () => {
  // Die Leiste sitzt unten im Modal, ueber der Browserleiste des Telefons.
  assert.ok(BUSINESS_COMPOSER_CSS.includes(".mnyra-bc__foot {"));
  assert.ok(BUSINESS_COMPOSER_CSS.includes("padding: 10px 16px calc(var(--safe-area-bottom, 0px) + 10px);"));
  assert.ok(BUSINESS_COMPOSER_CSS.includes(".mnyra-bc__switch {"));
  // Drei gleich breite Felder, das aktive hebt sich weiss ab.
  const sw = BUSINESS_COMPOSER_CSS.slice(BUSINESS_COMPOSER_CSS.indexOf(".mnyra-bc__switch {"));
  assert.ok(sw.slice(0, sw.indexOf("}")).includes("grid-template-columns: repeat(3, minmax(0, 1fr));"));
  assert.ok(BUSINESS_COMPOSER_CSS.includes(".mnyra-bc__switch-btn[aria-selected=\"true\"] {"));
  // Waehrend des Postens ist die Leiste gesperrt.
  assert.ok(BUSINESS_COMPOSER_CSS.includes('.mnyra-bc[data-busy="1"] .mnyra-bc__foot,'));
});

test("composer card styles keep the mockup layout", () => {
  // Oben im Bento steht die Tab-Leiste; sie braucht keinen eigenen Abstand
  // nach oben - das Polster des Bentos ist ihr Abstand. Alles danach, die
  // Karten eingeschlossen, rueckt gleich weit nach.
  assert.ok(DASHBOARD_CSS.includes(".mnyra-dash__bento > .mnyra-dash__tabs { margin-top: 0; }"));
  assert.ok(DASHBOARD_CSS.includes(".mnyra-dash__bento > .mnyra-dash__composer { margin-top: 22px; }"));
  // Im Panel wirft nichts einen eigenen Schatten.
  assert.ok(!DASHBOARD_CSS.includes("rgba(79, 70, 229, 0.9)"));
  // Das Logo neben der Begruessung steht flach in der Seite, ohne Schatten.
  const greetLogoBlock = DASHBOARD_CSS.slice(
    DASHBOARD_CSS.indexOf(".mnyra-dash__greet-logo {"),
    DASHBOARD_CSS.indexOf(".mnyra-dash__greet-logo img,")
  );
  assert.ok(!greetLogoBlock.includes("box-shadow"), greetLogoBlock);
  // ... und ohne den Indigo-Lila-Ring des Profil-Avatars: es steht klein in
  // der Ueberschrift, nicht als Bild davor.
  assert.ok(!greetLogoBlock.includes("linear-gradient"), greetLogoBlock);
  assert.ok(greetLogoBlock.includes("width: 22px;"), greetLogoBlock);
  // "Përshëndetje," steht in derselben Farbe wie die Ueberschrift, in der es steht.
  assert.ok(DASHBOARD_CSS.includes(".mnyra-dash__greet-hello { color: var(--dash-ink); }"));
  const titleBlock = DASHBOARD_CSS.slice(DASHBOARD_CSS.indexOf(".mnyra-dash__greet-title {"));
  assert.ok(titleBlock.slice(0, titleBlock.indexOf("}")).includes("color: var(--dash-ink);"));
});

// Die Begruessung traegt exakt die Masse der Stadt-Ueberschrift im Feed:
// text-xl / font-black / tracking-tight darueber, 11px halbfett slate-400
// dicht darunter. Aendert sich der Feed, faellt es hier auf.
test("the greeting carries the same sizes as the city headline in the feed", async () => {
  const feed = await readFile(
    new URL("../apps/menyra-social/core/feed/feed-view-orchestration-controller.js", import.meta.url),
    "utf8"
  );
  assert.ok(
    feed.includes('data-feed-city-headline class="text-xl font-black tracking-tight text-slate-900'),
    "Ueberschrift der Stadt im Feed hat sich geaendert"
  );
  assert.ok(
    feed.includes('class="text-[11px] text-slate-400 font-semibold mt-0.5"'),
    "Unterzeile der Stadt im Feed hat sich geaendert"
  );
  const titleBlock = DASHBOARD_CSS.slice(DASHBOARD_CSS.indexOf(".mnyra-dash__greet-title {"));
  const title = titleBlock.slice(0, titleBlock.indexOf("}"));
  // text-xl = 20px, font-black = 900, tracking-tight = -0.025em.
  assert.ok(title.includes("font-size: 20px;"), title);
  assert.ok(title.includes("font-weight: 900;"), title);
  assert.ok(title.includes("letter-spacing: -0.025em;"), title);

  const subBlock = DASHBOARD_CSS.slice(DASHBOARD_CSS.indexOf(".mnyra-dash__greet-sub {"));
  const sub = subBlock.slice(0, subBlock.indexOf("}"));
  // 11px, font-semibold, slate-400 (--dash-muted), mt-0.5 = 2px.
  assert.ok(sub.includes("font-size: 11px;"), sub);
  assert.ok(sub.includes("font-weight: 600;"), sub);
  assert.ok(sub.includes("color: var(--dash-muted);"), sub);
  assert.ok(sub.includes("margin: 2px 0 0;"), sub);
  assert.ok(DASHBOARD_CSS.includes("--dash-muted: #94a3b8;"));
});

// Das Panel kennt genau zwei Rundungen: die Karte auf dem Hintergrund
// (--dash-card-radius) und die Faecher im Bento (--dash-bento-cell-radius).
// Jede Flaeche gehoert zu genau einer davon - aendert man eine Zahl, aendert
// sich die ganze Gruppe zugleich.
test("every panel surface shares one of the two radii, casts no shadow and sets its border", () => {
  assert.ok(DASHBOARD_CSS.includes("--dash-card-radius: 25px;"));
  assert.ok(DASHBOARD_CSS.includes("--dash-bento-cell-radius: 20px;"));
  // Die Haarlinie der Profil-Karten (border-slate-100).
  assert.ok(DASHBOARD_CSS.includes("--dash-hairline: #f1f5f9;"));
  // Im Panel wirft nur noch die obere Kante des Bentos einen Schatten - keine
  // einzelne Karte, keine Kachel. Genau zwei Stellen duerfen ihn nennen: die
  // Marke und das Bento, das sie benutzt.
  const schattenStellen = DASHBOARD_CSS.split("box-shadow").length - 1;
  assert.equal(schattenStellen, 1, "nur das Bento darf einen box-shadow setzen");
  assert.ok(DASHBOARD_CSS.includes("box-shadow: var(--dash-bento-shadow);"));
  // Karte auf dem Hintergrund | Rundung | Rand
  const flaechen = [
    ["mnyra-dash__composer {", "--dash-card-radius", "var(--dash-black)"],
    ["mnyra-dash__state {", "--dash-card-radius", "var(--dash-hairline)"],
    ["mnyra-dash__posts {", "--dash-bento-cell-radius", "var(--dash-hairline)"]
  ];
  flaechen.forEach(([sel, radius, randFarbe]) => {
    const start = DASHBOARD_CSS.indexOf(`.${sel}`);
    assert.ok(start > -1, `${sel} fehlt`);
    const block = DASHBOARD_CSS.slice(start, DASHBOARD_CSS.indexOf("}", start));
    assert.ok(
      block.includes(`border-radius: var(${radius});`),
      `${sel} nutzt nicht ${radius}: ${block}`
    );
    // Jede Flaeche setzt ihren Rand ausdruecklich - die Kacheln sind <button>,
    // und der Browser zeichnet sonst seinen eigenen dicken Standardrahmen.
    // Die hellen Flaechen tragen die Haarlinie der Profil-Karten, die schwarze
    // Karte den Rand in ihrer eigenen Flaechenfarbe.
    assert.ok(block.includes(`border: 1px solid ${randFarbe};`), `${sel}: Rand fehlt: ${block}`);
  });
  // Der Lade-Platzhalter steht dort, wo gleich ein Fach steht - gleiche
  // Rundung, damit beim Erscheinen nichts springt.
  const skel = DASHBOARD_CSS.slice(DASHBOARD_CSS.indexOf(".mnyra-dash__skeleton {"));
  assert.ok(skel.slice(0, skel.indexOf("}")).includes("border-radius: var(--dash-bento-cell-radius);"));
});

// Die Posting-Karte steht schwarz im hellen Panel. Damit sie lesbar bleibt,
// muss JEDE Schrift darauf umgestellt sein - ein vergessenes Indigo oder Grau
// aus der hellen Zeit waere auf Schwarz praktisch unsichtbar.
test("the black posting card carries no leftover colour from its light days", () => {
  assert.ok(DASHBOARD_CSS.includes("--dash-black: #0f172a;"));
  // Nur die Regeln der schwarzen Karte. Die helle Fassung darunter
  // (--plane, die Offerten-Karte) bringt ihre Panel-Farben ausdruecklich mit
  // und wird weiter unten eigens geprueft.
  const composerBlock = DASHBOARD_CSS.slice(
    DASHBOARD_CSS.indexOf(".mnyra-dash__composer {"),
    DASHBOARD_CSS.indexOf(".mnyra-dash__composer--plane {")
  );
  assert.ok(composerBlock.includes("background: var(--dash-black);"), composerBlock);
  // Keine der hellen Marken darf auf der schwarzen Karte noch vorkommen.
  ["var(--dash-ink)", "var(--dash-accent)", "var(--dash-muted)", "var(--dash-hairline)", "var(--dash-border)"]
    .forEach((marke) => {
      assert.equal(
        composerBlock.includes(`: ${marke};`),
        false,
        `helle Marke ${marke} steht noch auf der schwarzen Karte`
      );
    });
  // Und die Schriften tragen die Marken der schwarzen Flaeche.
  assert.ok(composerBlock.includes("color: var(--dash-black-ink);"), composerBlock);
  assert.ok(composerBlock.includes(".mnyra-dash__composer-accent { color: var(--dash-black-accent); }"), composerBlock);
  assert.ok(composerBlock.includes("color: var(--dash-black-muted);"), composerBlock);
});

// Die helle Fassung derselben Karte (die Offerten-Karte) steht in der Farbwelt
// der Kacheln darunter: ruhige Flaeche, Haarlinie, Indigo im Symbol. Bliebe
// auch nur eine Marke der schwarzen Flaeche stehen, waere die Schrift auf
// Hell praktisch unsichtbar - derselbe Fehler, nur andersherum.
test("the light variant of the card carries no leftover colour from the black one", () => {
  const planeBlock = DASHBOARD_CSS.slice(
    DASHBOARD_CSS.indexOf(".mnyra-dash__composer--plane {"),
    DASHBOARD_CSS.indexOf(".mnyra-dash__section {")
  );
  assert.ok(planeBlock.includes("background: var(--dash-plane);"), planeBlock);
  assert.ok(planeBlock.includes("border-color: var(--dash-hairline);"), planeBlock);
  ["var(--dash-black)", "var(--dash-black-ink)", "var(--dash-black-accent)", "var(--dash-black-muted)", "var(--dash-black-hairline)", "var(--dash-black-ring)"]
    .forEach((marke) => {
      assert.equal(
        planeBlock.includes(`: ${marke};`),
        false,
        `dunkle Marke ${marke} steht noch auf der hellen Karte`
      );
    });
  // Dieselben Farben wie die Kacheln: Text, das Indigo im ersten Wort und im
  // Symbol, das Grau im Untertitel.
  assert.ok(planeBlock.includes("color: var(--dash-ink);"), planeBlock);
  assert.ok(planeBlock.includes("color: var(--dash-accent);"), planeBlock);
  assert.ok(planeBlock.includes("color: var(--dash-muted);"), planeBlock);
  assert.ok(planeBlock.includes("background: var(--dash-accent-soft);"), planeBlock);
});

// Das Bento laeuft bis an die Panel-Raender und bis ans Seitenende - deshalb
// sind nur seine oberen Ecken gerundet. Die negative Marge muss dabei genau
// das Polster von .mnyra-dash treffen: seitlich waere sie sonst ein Querlauf,
// unten ein Loch oder ein Ueberstand.
test("the bento reaches the panel edges and the end of the page, rounded on top only", () => {
  const dashBlock = DASHBOARD_CSS.slice(DASHBOARD_CSS.indexOf(".mnyra-dash {"));
  assert.ok(dashBlock.slice(0, dashBlock.indexOf("}")).includes("padding: 16px 28px 0;"));
  // Der Auslauf ist das untere Polster des Bentos - nicht mehr das der Seite:
  // deren Abschluss macht der Fuss der App.
  assert.ok(DASHBOARD_CSS.includes("--dash-bento-tail: 112px;"));

  const start = DASHBOARD_CSS.indexOf(".mnyra-dash__bento {");
  assert.ok(start > -1, "Regel fuer das Bento fehlt");
  const block = DASHBOARD_CSS.slice(start, DASHBOARD_CSS.indexOf("}", start));
  // Seitlich genau das Seitenpolster, unten der Auslauf - und der Abstand zur
  // schwarzen Karte darueber, der bewusst groesser ist als der zwischen
  // Begruessung und Karte: die Flaeche soll als eigener Abschnitt anfangen.
  // Der Auslauf nach unten traegt jetzt zusaetzlich das Polster von <main>
  // (--app-main-tail) - siehe den Test dazu weiter unten.
  // Nach unten polstert das Bento nur noch sich selbst: den Abschluss der
  // Seite macht der Fuss der App, der im Fluss dahinter steht. Eine negative
  // Marge hier zoege ihn nach oben, mitten in die Flaeche hinein.
  assert.ok(block.includes("margin: 72px -28px 0;"), block);
  // Und die obere Kante traegt den Schatten des Headers, nach oben gedreht.
  assert.ok(block.includes("box-shadow: var(--dash-bento-shadow);"), block);
  assert.ok(DASHBOARD_CSS.includes("--dash-bento-shadow: 0 -16px 32px -20px rgb(15 23 42 / 0.16);"));
  // ... und innen wieder aufgeschlagen, damit die Faecher in der Flucht der
  // Karte darueber stehen.
  assert.ok(block.includes("padding: 22px 28px var(--dash-bento-tail);"), block);
  // Nur oben gerundet.
  assert.ok(
    block.includes("border-radius: var(--dash-bento-radius) var(--dash-bento-radius) 0 0;"),
    block
  );
});

// Dieselbe Rundung wie das Bento des Feed-Gates: beide Flaechen der App
// sollen gleich anfangen. Aendert sich die eine, faellt es hier auf.
test("the bento starts with the same rounding as the feed gate bento", async () => {
  const feed = await readFile(
    new URL("../apps/menyra-social/core/feed/feed-view-orchestration-controller.js", import.meta.url),
    "utf8"
  );
  const gateRadius = /--feed-location-gate-bento-radius:\s*([^;]+);/.exec(feed)?.[1]?.trim();
  assert.equal(gateRadius, "2.5rem", "Rundung des Feed-Gate-Bentos hat sich geaendert");
  // 2.5rem sind 40px - dieselbe Zahl, nur in der Einheit des Panels.
  assert.ok(DASHBOARD_CSS.includes("--dash-bento-radius: 40px;"));
});

// Die Kacheln des Schnellzugriffs sind ganz weg - samt ihrem Bauteil und
// ihrer Flaeche. Jeder ihrer vier Wege steht jetzt an genau einer Stelle:
// Katalog und Reklama als Karte im Bento, Stafi und die Einstellungen als
// Seite "Opsionet" darin.
test("the shortcut tiles are gone, code and styles alike", () => {
  assert.equal(typeof dashboardRenderUtils.renderDashboardQuickActions, "undefined");
  assert.equal(typeof dashboardRenderUtils.buildDashboardQuickActionsCore, "undefined");
  assert.equal(DASHBOARD_CSS.includes(".mnyra-dash__action"), false);
  const bento = dashboardRenderUtils.renderDashboardBento("<p>inhalt</p>");
  assert.ok(bento.includes('class="mnyra-dash__bento"'));
  assert.ok(bento.includes("<p>inhalt</p>"));
});

// "Posto n'Profil" und "Posto n'Meny" sind als Karten raus: das Profil ist die
// dritte Seite in der Leiste des Composers, die Menue-Pflege steht im
// Schnellzugriff. Weder Markup noch Stile duerfen davon uebrig bleiben.
test("the two half cards are gone from the panel, markup and styles alike", () => {
  assert.equal(typeof dashboardRenderUtils.renderDashboardComposerSplitCards, "undefined");
  assert.equal(DASHBOARD_CSS.includes("mnyra-dash__composer-row"), false);
  assert.equal(DASHBOARD_CSS.includes("mnyra-dash__composer--split"), false);
  assert.equal(DASHBOARD_CSS.includes("mnyra-dash__composer-actions"), false);
  assert.equal(DASHBOARD_CSS.includes("mnyra-dash__composer-btn"), false);
});

test("publish is only possible with caption and image and never while posting", () => {
  assert.equal(canPublishComposerDraftCore({ caption: "Hallo", hasImage: true }), true);
  assert.equal(canPublishComposerDraftCore({ caption: "   ", hasImage: true }), false);
  assert.equal(canPublishComposerDraftCore({ caption: "Hallo", hasImage: false }), false);
  assert.equal(canPublishComposerDraftCore({ caption: "", hasImage: false }), false);
  // Doppel-Tap-Schutz: waehrend eines laufenden Posts nie erneut freigeben.
  assert.equal(canPublishComposerDraftCore({ caption: "Hallo", hasImage: true, submitting: true }), false);
  assert.equal(canPublishComposerDraftCore({}), false);
});

test("product normalization keeps name, price, image and type", () => {
  const food = normalizeComposerProductCore("m1", {
    name: "  Pizza Napoli  ",
    price: 7.5,
    category: "Pica",
    imageUrl: " https://img/p.jpg ",
    type: "food"
  });
  assert.deepEqual(food, {
    id: "m1",
    name: "Pizza Napoli",
    price: 7.5,
    category: "Pica",
    type: "food",
    imageUrl: "https://img/p.jpg"
  });

  const drink = normalizeComposerProductCore("m2", { title: "Coca Cola", type: "Getränke", images: ["https://img/c.jpg"] });
  assert.equal(drink.name, "Coca Cola");
  assert.equal(drink.type, "drink");
  assert.equal(drink.imageUrl, "https://img/c.jpg");
  assert.equal(drink.price, "");

  // Ohne Namen faellt der Eintrag auf die Id zurueck, ohne Id gibt es keinen Eintrag.
  assert.equal(normalizeComposerProductCore("m3", {}).name, "m3");
  assert.equal(normalizeComposerProductCore("", { name: "X" }), null);
});

test("product search matches name and category, empty term keeps all", () => {
  const products = [
    normalizeComposerProductCore("m1", { name: "Pizza Napoli", category: "Pica" }),
    normalizeComposerProductCore("m2", { name: "Coca Cola", category: "Pije" }),
    normalizeComposerProductCore("m3", { name: "Burger", category: "Fast Food" })
  ];
  assert.equal(filterComposerProductsCore(products, "").length, 3);
  assert.equal(filterComposerProductsCore(products, "   ").length, 3);
  assert.deepEqual(filterComposerProductsCore(products, "cola").map((p) => p.id), ["m2"]);
  assert.deepEqual(filterComposerProductsCore(products, "PIJE").map((p) => p.id), ["m2"]);
  assert.deepEqual(filterComposerProductsCore(products, "pi").map((p) => p.id), ["m1", "m2"]);
  assert.deepEqual(filterComposerProductsCore(products, "xyz"), []);
  assert.deepEqual(filterComposerProductsCore(null, "a"), []);
});

test("composer styles carry the preview stage and the fullscreen sheet", () => {
  // Die Vorschauen bringen kein eigenes Aussehen mit: sie stellen das
  // Original nur auf eine Buehne und skalieren es als Ganzes.
  assert.ok(BUSINESS_COMPOSER_CSS.includes(".mnyra-bc__stage {"));
  assert.ok(BUSINESS_COMPOSER_CSS.includes(".mnyra-bc__stage-inner {"));
  assert.ok(BUSINESS_COMPOSER_CSS.includes("transform-origin: top left;"));
  // Der Feed-Beitrag steht randlos, damit er in Originalbreite passt.
  assert.ok(BUSINESS_COMPOSER_CSS.includes(".mnyra-bc__stage--bleed {"));
  assert.ok(BUSINESS_COMPOSER_CSS.includes("--safe-area-top"));
  // Die Story-Reihe: eine Flex-Reihe mit dem Abstand des Feeds, die zwei
  // fremden Kacheln stehen unscharf daneben.
  assert.ok(BUSINESS_COMPOSER_CSS.includes(".mnyra-bc__story-track {"));
  assert.ok(BUSINESS_COMPOSER_CSS.includes("gap: 10px;"));
  assert.ok(BUSINESS_COMPOSER_CSS.includes(".mnyra-bc__story-track > [data-bc-story-blur] { opacity: 0.6; }"));
  assert.ok(BUSINESS_COMPOSER_CSS.includes("filter: blur(4px) saturate(0.85);"));
});

test("product label follows the kind of business", () => {
  // Lokal mit Essen -> Meny, Shop -> Produkte, Hotel/Motel -> Dhoma.
  assert.equal(resolveComposerProductTextCore("restaurant").tag, "Etiketo nga menuja");
  assert.equal(resolveComposerProductTextCore("shop").tag, "Etiketo nga produktet");
  assert.equal(resolveComposerProductTextCore("hotel").tag, "Etiketo nga dhomat");
  // Die Art kommt aus derselben Zuordnung wie die Dashboard-Kacheln.
  const kindOf = (businessType, isShopCatalog = false) => resolveDashboardKindCore({ businessType, isShopCatalog });
  assert.equal(resolveComposerProductTextCore(kindOf("cafe")).tag, "Etiketo nga menuja");
  assert.equal(resolveComposerProductTextCore(kindOf("bar")).tag, "Etiketo nga menuja");
  assert.equal(resolveComposerProductTextCore(kindOf("fastfood")).tag, "Etiketo nga menuja");
  assert.equal(resolveComposerProductTextCore(kindOf("motel")).tag, "Etiketo nga dhomat");
  assert.equal(resolveComposerProductTextCore(kindOf("hostel")).tag, "Etiketo nga dhomat");
  assert.equal(resolveComposerProductTextCore(kindOf("ecommerce", true)).tag, "Etiketo nga produktet");
  // Auch Popup-Titel, Suchfeld und Leermeldung sprechen dieselbe Sprache.
  assert.equal(resolveComposerProductTextCore("hotel").pickerTitle, "Zgjidh nga dhomat");
  assert.equal(resolveComposerProductTextCore("hotel").pickerSearch, "Kërko dhoma…");
  assert.equal(resolveComposerProductTextCore("hotel").pickerEmpty, "Nuk u gjet asnjë dhomë.");
  assert.equal(resolveComposerProductTextCore("shop").pickerTitle, "Zgjidh nga produktet");
  // Unbekanntes bleibt beim Lokal - nie leer.
  assert.equal(resolveComposerProductTextCore("").tag, "Etiketo nga menuja");
  assert.equal(resolveComposerProductTextCore("quatsch").tag, "Etiketo nga menuja");
  assert.equal(resolveComposerProductTextCore().tag, "Etiketo nga menuja");
});

test("input field and upload buttons are one rounded block", async () => {
  const source = await readFile(
    new URL("../apps/menyra-social/core/composer/business-composer-controller.js", import.meta.url),
    "utf8"
  );
  // Ein Rahmen aussen, die Textflaeche selbst traegt keinen mehr.
  assert.ok(BUSINESS_COMPOSER_CSS.includes(".mnyra-bc__compose {\n  border: 1px solid var(--bc-line);\n  border-radius: 24px;"));
  assert.ok(BUSINESS_COMPOSER_CSS.includes(".mnyra-bc__text {\n  display: block;\n  width: 100%;"));
  assert.ok(BUSINESS_COMPOSER_CSS.includes("  border: 0;\n  border-radius: 0;"));
  // Duenne Trennlinie, darunter die Knopfzeile mit dem Zaehler rechts.
  assert.ok(BUSINESS_COMPOSER_CSS.includes(".mnyra-bc__compose-bar {"));
  assert.ok(BUSINESS_COMPOSER_CSS.includes("  border-top: 1px solid var(--bc-line);\n}"));
  assert.ok(BUSINESS_COMPOSER_CSS.includes(".mnyra-bc__count {"));
  // Die Knoepfe sind Pillen, nicht mehr zwei hohe Kacheln neben dem Feld.
  assert.ok(BUSINESS_COMPOSER_CSS.includes("  border-radius: 999px;\n  background: var(--bc-plane);"));
  assert.ok(!BUSINESS_COMPOSER_CSS.includes("flex: 0 0 100px;"));
  // Der Produkt-Knopf ist in allen drei Modi da - kein hidden mehr.
  assert.ok(source.includes("<button type=\"button\" class=\"mnyra-bc__tool\" data-bc-tag>"));
  assert.ok(!source.includes("nodes.tag.hidden"));
  assert.ok(!source.includes('if (mode !== "story" || submitting) return;'));
  // Zaehler zeigt die echte Grenze, nicht eine erfundene.
  assert.ok(source.includes("`${used}/${CAPTION_MAX_LENGTH}`"));
});

test("hotels tag their rooms, not menu items", async () => {
  const source = await readFile(
    new URL("../apps/menyra-social/core/dashboard/dashboard-view-controller.js", import.meta.url),
    "utf8"
  );
  // Zimmer stehen am Restaurant-Datensatz - kein zweiter Firestore-Lesezugriff.
  assert.ok(source.includes("collectHotelRoomsCore(record)"));
  assert.ok(source.includes('resolveBusinessKind() === "hotel"'));
  // Eine Zuordnung fuer Kacheln, Beschriftung und Datenquelle.
  assert.equal((source.match(/resolveDashboardKindCore\(\{/g) || []).length, 1);
  // Und die Art wandert bis in den Composer.
  assert.ok(source.includes("getBusinessKindFn:"));

  const rooms = collectHotelRoomsCore({
    hotelRooms: [
      { id: "r1", title: "Suita", price: 90, beds: "1 krevat dopio", images: ["https://img/r1.jpg"] },
      { id: "r2", title: "", price: 40 }
    ]
  });
  // Zimmer ohne Namen zaehlen nicht mit.
  assert.deepEqual(rooms.map((room) => room.id), ["r1"]);
  assert.equal(rooms[0].title, "Suita");
  assert.equal(rooms[0].imageUrl, "https://img/r1.jpg");
});

test("a tagged product survives the post, not only the story", async () => {
  const composerSource = await readFile(
    new URL("../apps/menyra-social/core/composer/business-composer-controller.js", import.meta.url),
    "utf8"
  );
  const uploadSource = await readFile(
    new URL("../apps/menyra-social/core/media/media-upload-runtime-controller.js", import.meta.url),
    "utf8"
  );
  // Ein Satz Felder fuer beide Schreibwege - keine zweite Schreibweise.
  assert.ok(composerSource.includes("const productFields = {"));
  assert.ok(composerSource.includes("...productFields"));
  assert.equal((composerSource.match(/\.\.\.productFields/g) || []).length, 2);
  // Der Beitrag speichert sie im Dokument und in der Feed-Spiegelung.
  assert.equal((uploadSource.match(/\.\.\.tagged/g) || []).length, 2);
  assert.ok(uploadSource.includes("menuItemId: String(menuItemId || \"\").trim()"));
});

test("no status sentences under the input field", async () => {
  const source = await readFile(
    new URL("../apps/menyra-social/core/composer/business-composer-controller.js", import.meta.url),
    "utf8"
  );
  // Weder der Hinweis noch die Fertig-Meldung stehen noch irgendwo.
  assert.ok(!source.includes("duhen edhe teksti"));
  assert.ok(!source.includes("Gati për t'u postuar"));
  assert.ok(!source.includes("data-bc-hint"));
  assert.ok(!BUSINESS_COMPOSER_CSS.includes(".mnyra-bc__hint"));
  // Der Posto-Knopf bleibt die einzige Rueckmeldung: er ist scharf oder nicht.
  assert.equal(canPublishComposerDraftCore({ caption: "hi", hasImage: true }), true);
  assert.equal(canPublishComposerDraftCore({ caption: "hi", hasImage: false }), false);
  assert.equal(canPublishComposerDraftCore({ caption: "", hasImage: true }), false);
});

test("preview starts at the same left edge as everything else", async () => {
  const source = await readFile(
    new URL("../apps/menyra-social/core/composer/business-composer-controller.js", import.meta.url),
    "utf8"
  );
  // Beitrag und Profil-Kachel stehen linksbuendig, ohne den leeren Rand der
  // App-Shell - aber in genau der Breite, die sie in der App haben.
  assert.ok(source.includes("const APP_CONTENT_INLINE = 24;"));
  assert.ok(source.includes("const cardWidth = Math.max(1, shellWidth - APP_CONTENT_INLINE * 2);"));
  assert.ok(source.includes("applyBleedStage(nodes.stagePost, nodes.stagePostInner, cardWidth, { centered: false });"));
  assert.ok(source.includes("applyBleedStage(nodes.stageProfile, nodes.stageProfileInner, cardWidth, { centered: false });"));
  assert.ok(!source.includes('`<div class="app-content-inline py-4">'));
  // Die Story-Reihe laeuft in der App von Rand zu Rand - sie bleibt randlos.
  assert.ok(source.includes("applyBleedStage(nodes.stageStory, nodes.stageStoryInner, shellWidth);"));
  assert.ok(source.includes('<div class="mnyra-bc__stage mnyra-bc__stage--bleed" data-bc-stage="story">'));
});

test("the chosen file sits as a thumbnail with an x in the button row", async () => {
  const source = await readFile(
    new URL("../apps/menyra-social/core/composer/business-composer-controller.js", import.meta.url),
    "utf8"
  );
  assert.ok(source.includes("data-bc-thumb-remove"));
  assert.ok(source.includes("clearDraftMedia()"));
  assert.ok(BUSINESS_COMPOSER_CSS.includes(".mnyra-bc__thumb {"));
  assert.ok(BUSINESS_COMPOSER_CSS.includes(".mnyra-bc__thumb-x {"));
  // Das x sitzt auf der oberen Ecke der Miniatur.
  assert.ok(BUSINESS_COMPOSER_CSS.includes("  top: -7px;\n  right: -7px;"));
  // Video bekommt sein Standbild ueber denselben Weg wie beim Posten.
  assert.ok(source.includes("captureThumbForVideo(draft, file)"));
  assert.ok(source.includes("draft.file !== file"));
  // Beide Object-URLs eines Entwurfs werden freigegeben - kein Leck.
  assert.ok(source.includes("function releaseDraftUrls(draft)"));
  assert.ok(!source.includes("releasePreviewUrl(draft.previewUrl);\n    draft.file = null;"));
});

test("the product sheet sits flush at the bottom", () => {
  assert.ok(BUSINESS_COMPOSER_CSS.includes("  background: rgba(15, 23, 42, 0.45);\n  padding: 0;"));
  assert.ok(BUSINESS_COMPOSER_CSS.includes("border-radius: 28px 28px 0 0;"));
  // Der Bestaetigen-Knopf haelt Abstand zur Browserleiste des Telefons.
  assert.ok(BUSINESS_COMPOSER_CSS.includes("padding: 10px 16px calc(var(--safe-area-bottom, 0px) + 16px);"));
});

test("product list is shown at once and never doubled", async () => {
  const loaderSource = await readFile(
    new URL("../apps/menyra-social/core/dashboard/dashboard-view-controller.js", import.meta.url),
    "utf8"
  );
  // Gemerkte Liste sofort, frische Liste still hinterher.
  assert.ok(loaderSource.includes("readComposerProductsCache"));
  assert.ok(loaderSource.includes("writeComposerProductsCache"));
  assert.ok(loaderSource.includes("if (!cached) return pending;"));
  assert.ok(loaderSource.includes("pending.then((items) => onFresh(items)).catch(() => {});"));

  // Jede Id genau einmal - egal aus welcher Quelle.
  const doppelt = [
    { id: "m1", name: "Coca Cola" },
    { id: "m1", name: "Coca Cola" },
    { id: "m2", name: "Uje" },
    { id: "", name: "ohne Id" },
    null
  ];
  assert.deepEqual(dedupeComposerProductsCore(doppelt).map((p) => p.id), ["m1", "m2"]);
  assert.deepEqual(dedupeComposerProductsCore(null), []);
  // Der Fingerabdruck erkennt Aenderungen an Name, Preis und Bild.
  const a = [{ id: "m1", name: "Cola", price: 2, imageUrl: "x" }];
  assert.equal(buildComposerProductsSignatureCore(a), buildComposerProductsSignatureCore([{ id: "m1", name: "Cola", price: 2, imageUrl: "x" }]));
  assert.notEqual(buildComposerProductsSignatureCore(a), buildComposerProductsSignatureCore([{ id: "m1", name: "Cola", price: 3, imageUrl: "x" }]));
  assert.notEqual(buildComposerProductsSignatureCore(a), buildComposerProductsSignatureCore([]));
});

test("the preview stage does not cut the card shadow off at its bottom edge", () => {
  // Die Buehne ist genau so hoch wie ihr Inhalt. Schnitte sie ab, endete der
  // weiche Schatten der Kachel unten mit einer harten Kante - genau so sah es
  // in der Profil-Vorschau aus.
  const stageBlock = BUSINESS_COMPOSER_CSS.slice(
    BUSINESS_COMPOSER_CSS.indexOf(".mnyra-bc__stage {"),
    BUSINESS_COMPOSER_CSS.indexOf(".mnyra-bc__story-track {")
  );
  assert.ok(stageBlock.includes("overflow: visible;"));
  assert.equal(stageBlock.includes("overflow: hidden;"), false);
  // Die randlose Story-Reihe schneidet weiter ab: sie steht absichtlich
  // breiter als die Buehne.
  const bleedBlock = BUSINESS_COMPOSER_CSS.slice(
    BUSINESS_COMPOSER_CSS.indexOf(".mnyra-bc__stage--bleed {"),
    BUSINESS_COMPOSER_CSS.indexOf(".mnyra-bc__picker {")
  );
  assert.ok(bleedBlock.includes("overflow: hidden;"));
});

// Die Leiste im Bento: drei Knoepfe, sonst nichts. Frueher lagen sie in einem
// eigenen Kasten - der schob sie um seine Polsterbreite nach innen und brachte
// sie damit aus der Flucht der Karten darunter.
test("the bento tabs are buttons only, flush with the cards below", () => {
  // Am Zeilenanfang verankert: sonst trifft die Suche die Abstands-Regel
  // ".mnyra-dash__bento > .mnyra-dash__tabs", die denselben Namen enthaelt.
  const leisteAt = DASHBOARD_CSS.indexOf("\n.mnyra-dash__tabs {");
  assert.ok(leisteAt > -1, "die Regel fuer die Leiste fehlt");
  const leiste = DASHBOARD_CSS.slice(leisteAt, DASHBOARD_CSS.indexOf("}", leisteAt));
  // Kein Grund, kein Rahmen, kein Polster um die Knoepfe herum: nur so stehen
  // sie genau dort, wo auch die Karten anfangen und aufhoeren.
  assert.equal(leiste.includes("background:"), false, leiste);
  assert.equal(leiste.includes("border:"), false, leiste);
  assert.equal(leiste.includes("padding:"), false, leiste);
  assert.ok(leiste.includes("grid-template-columns: repeat(3, minmax(0, 1fr));"), leiste);

  const knopfAt = DASHBOARD_CSS.indexOf("\n.mnyra-dash__tab {");
  assert.ok(knopfAt > -1, "die Regel fuer den Knopf fehlt");
  const knopf = DASHBOARD_CSS.slice(knopfAt, DASHBOARD_CSS.indexOf("}", knopfAt));
  // Ganz rund, wie die Zeitraum-Knoepfe der Analitika.
  assert.ok(knopf.includes("border-radius: 999px;"), knopf);
  assert.ok(knopf.includes("background: var(--dash-plane);"), knopf);

  // Der gewaehlte traegt dieselbe Flaeche wie die Posting-Karte.
  const gewaehlt = DASHBOARD_CSS.slice(
    DASHBOARD_CSS.indexOf('.mnyra-dash__tab[aria-selected="true"] {'),
    DASHBOARD_CSS.indexOf("}", DASHBOARD_CSS.indexOf('.mnyra-dash__tab[aria-selected="true"] {'))
  );
  assert.ok(gewaehlt.includes("background: var(--dash-black);"), gewaehlt);
  assert.ok(gewaehlt.includes("color: var(--dash-black-ink);"), gewaehlt);
  const karte = DASHBOARD_CSS.slice(
    DASHBOARD_CSS.indexOf(".mnyra-dash__composer {"),
    DASHBOARD_CSS.indexOf("}", DASHBOARD_CSS.indexOf(".mnyra-dash__composer {"))
  );
  assert.ok(karte.includes("background: var(--dash-black);"), "dieselbe Marke wie die Karte");

  // Und die Leiste haelt mehr Abstand zum Gewaehlten als zwei Karten
  // untereinander: sie waehlt aus, sie ist nicht Teil davon.
  assert.ok(DASHBOARD_CSS.includes(".mnyra-dash__bento > .mnyra-dash__tabs + .mnyra-dash__composer,"));
  assert.ok(DASHBOARD_CSS.includes(".mnyra-dash__bento > .mnyra-dash__tabs + .mnyra-dash__section { margin-top: 32px; }"));
});

// Das weisse Bento endete dort, wo sein Inhalt endete. Darunter kam die
// Flaeche der App (#f8fafc) - und genau diese Kante sah man als
// Farbunterschied, sobald der Inhalt kuerzer war als der Bildschirm.
// Frueher stand hier eine Mindesthoehe auf der Panel-Seite und ein Auslauf am
// Bento, damit dessen Weiss bis ans Seitenende reichte. Beides ist weg: den
// Abschluss macht jetzt der Fuss der App (siehe tests/app-footer.test.mjs).
// Bliebe eines davon stehen, zoege es den Fuss nach oben oder schoebe ihn bei
// kurzem Inhalt unter den Bildschirmrand.
test("the panel leaves the end of the page to the footer", () => {
  const ohneKommentare = (text = "") => text.replace(/\/\*[\s\S]*?\*\//g, "");
  const seite = ohneKommentare(DASHBOARD_CSS.slice(
    DASHBOARD_CSS.indexOf("\n.mnyra-dash {"),
    DASHBOARD_CSS.indexOf("}", DASHBOARD_CSS.indexOf("\n.mnyra-dash {"))
  ));
  assert.equal(seite.includes("min-height"), false, seite);
  assert.equal(seite.includes("display: flex"), false, seite);
  assert.ok(seite.includes("padding: 16px 28px 0;"), seite);
  assert.equal(DASHBOARD_CSS.includes("html.is-standalone .mnyra-dash"), false);

  const bento = ohneKommentare(DASHBOARD_CSS.slice(
    DASHBOARD_CSS.indexOf("\n.mnyra-dash__bento {"),
    DASHBOARD_CSS.indexOf("}", DASHBOARD_CSS.indexOf("\n.mnyra-dash__bento {"))
  ));
  assert.equal(bento.includes("flex:"), false, bento);
  assert.equal(bento.includes("--app-main-tail"), false, bento);
});

test("the page tail is one number, read by both sides", () => {
  const shellCss = readFileSync(
    path.join(path.resolve(import.meta.dirname, ".."), "apps", "menyra-social", "index.html"),
    "utf8"
  );
  assert.ok(shellCss.includes(":root { --app-main-tail: 1rem; }"));
  assert.ok(shellCss.includes(".app-main-scroll { padding-bottom: var(--app-main-tail) !important; }"));
  // Als installierte App kommt der sichere Bereich unten dazu.
  assert.ok(shellCss.includes("html.is-standalone { --app-main-tail: calc(var(--safe-area-bottom) + 1rem); }"));
  assert.ok(shellCss.includes("html.is-standalone .app-main-scroll { padding-bottom: var(--app-main-tail) !important; }"));
});
