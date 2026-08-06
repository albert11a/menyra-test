import test from "node:test";
import assert from "node:assert/strict";

import {
  normalizeComposerProductCore,
  filterComposerProductsCore,
  canPublishComposerDraftCore,
  BUSINESS_COMPOSER_CSS
} from "../apps/menyra-social/core/composer/business-composer-controller.js";
import {
  renderDashboardComposerCard,
  renderDashboardComposerSplitCards,
  DASHBOARD_CSS
} from "../apps/menyra-social/core/dashboard/dashboard-render-utils.js";

test("composer card offers postim and story with mnyra accent", () => {
  const html = renderDashboardComposerCard({ iconFn: (name) => `<i data-icon="${name}"></i>` });
  // Ueberschrift und Untertitel bleiben Wort fuer Wort, wie sie waren.
  assert.ok(html.includes("Posto n'"));
  assert.ok(html.includes('<span class="mnyra-dash__composer-accent">Zbulo</span>'));
  assert.ok(html.includes("Ndaj një postim ose një story me klientët e tu."));
  assert.ok(html.includes('data-dashboard-composer="post"'));
  assert.ok(html.includes('data-dashboard-composer="story"'));
  assert.ok(html.includes(">Postim<"));
  assert.ok(html.includes(">Story<"));
  // Kein Punkt vor der Ueberschrift, keine "Quick Create"-Pille.
  assert.ok(!html.includes("composer-dot"));
  assert.ok(!html.includes("composer-badge"));
  assert.ok(!html.includes("Quick Create"));
  // Postim ist der ausgefuellte Knopf mit Plus, Story traegt den Ring-Punkt.
  assert.ok(html.includes('class="mnyra-dash__composer-btn mnyra-dash__composer-btn--primary" data-dashboard-composer="post"'));
  assert.equal((html.match(/data-icon="plus"/g) || []).length, 1);
  assert.ok(html.includes('<circle cx="12" cy="12" r="4" fill="currentColor" stroke="none"></circle>'));
});

test("composer card styles keep the mockup layout", () => {
  assert.ok(DASHBOARD_CSS.includes(".mnyra-dash__composer-btn--primary {"));
  // Abstand zur Begruessung darueber, kleinere Knoepfe.
  assert.ok(DASHBOARD_CSS.includes("margin-top: 34px;"));
  assert.ok(DASHBOARD_CSS.includes("min-height: 46px;"));
  // Der ausgefuellte Knopf wirft keinen eigenen Schatten mehr.
  assert.ok(!DASHBOARD_CSS.includes("rgba(79, 70, 229, 0.9)"));
  // Das Logo neben der Begruessung steht flach in der Seite, ohne Schatten.
  const greetLogoBlock = DASHBOARD_CSS.slice(
    DASHBOARD_CSS.indexOf(".mnyra-dash__greet-logo {"),
    DASHBOARD_CSS.indexOf(".mnyra-dash__greet-logo img,")
  );
  assert.ok(!greetLogoBlock.includes("box-shadow"), greetLogoBlock);
  // "Përshëndetje," steht in derselben Farbe wie der Name des Lokals daneben.
  assert.ok(DASHBOARD_CSS.includes(".mnyra-dash__greet-hello { color: var(--dash-ink); }"));
  const titleBlock = DASHBOARD_CSS.slice(DASHBOARD_CSS.indexOf(".mnyra-dash__greet-title {"));
  assert.ok(titleBlock.slice(0, titleBlock.indexOf("}")).includes("color: var(--dash-ink);"));
});

test("every panel card shares one radius, casts no shadow and wears the profile hairline", () => {
  // Eine Zahl fuer alle Karten - aendert man sie, aendern sich alle zugleich.
  assert.ok(DASHBOARD_CSS.includes("--dash-card-radius: 25px;"));
  // Die Haarlinie der Profil-Karten (border-slate-100).
  assert.ok(DASHBOARD_CSS.includes("--dash-hairline: #f1f5f9;"));
  // Im ganzen Panel wirft nichts mehr einen Schatten.
  assert.ok(!DASHBOARD_CSS.includes("box-shadow"), "im Panel darf kein box-shadow stehen");
  const flaechen = ["mnyra-dash__composer {", "mnyra-dash__action {", "mnyra-dash__kpi {", "mnyra-dash__posts {", "mnyra-dash__state {"];
  flaechen.forEach((sel) => {
    const start = DASHBOARD_CSS.indexOf(`.${sel}`);
    assert.ok(start > -1, `${sel} fehlt`);
    const block = DASHBOARD_CSS.slice(start, DASHBOARD_CSS.indexOf("}", start));
    assert.ok(
      block.includes("border-radius: var(--dash-card-radius);"),
      `${sel} nutzt nicht die gemeinsame Rundung: ${block}`
    );
    // Dieselbe Haarlinie wie die Profil-Karten - ausdruecklich gesetzt, weil
    // die Kacheln <button> sind und der Browser sonst seinen eigenen dicken
    // Standardrahmen zeichnet.
    assert.ok(block.includes("border: 1px solid var(--dash-hairline);"), `${sel}: Haarlinie fehlt: ${block}`);
  });
  // Der Lade-Platzhalter hat dieselbe Rundung, damit nichts springt.
  const skel = DASHBOARD_CSS.slice(DASHBOARD_CSS.indexOf(".mnyra-dash__skeleton {"));
  assert.ok(skel.slice(0, skel.indexOf("}")).includes("border-radius: var(--dash-card-radius);"));
  // Die Knoepfe behalten ihren Umriss - sie sind keine Karten.
  const btn = DASHBOARD_CSS.slice(DASHBOARD_CSS.indexOf(".mnyra-dash__composer-btn {"));
  assert.ok(btn.slice(0, btn.indexOf("}")).includes("border: 1px solid var(--dash-border);"));
});

test("two half cards sit under the composer card and share its width", () => {
  const html = renderDashboardComposerSplitCards({ iconFn: (name) => `<i data-icon="${name}"></i>` });
  // Eine Zeile mit zwei Karten - zusammen so breit wie "Posto n'Zbulo".
  assert.ok(html.startsWith('<div class="mnyra-dash__composer-row">'));
  assert.equal((html.match(/mnyra-dash__composer--split/g) || []).length, 2);
  // Links Profil, rechts Meny - Wortbild wie bei "Posto n'Zbulo".
  const left = html.indexOf(">Profil<");
  const right = html.indexOf(">Meny<");
  assert.ok(left > -1 && right > left, `${left}/${right}`);
  assert.ok(html.includes(`Posto n'<span class="mnyra-dash__composer-accent">Profil</span>`));
  assert.ok(html.includes(`Posto n'<span class="mnyra-dash__composer-accent">Meny</span>`));
  assert.ok(html.includes("Postim që shfaqet në profilin tënd."));
  assert.ok(html.includes("Produktet dhe kategoritë e menysë."));
  // Profil oeffnet denselben Composer wie "Postim", Meny fuehrt in den
  // Menue-Editor - beides ueber die schon vorhandenen Handler.
  assert.ok(html.includes('data-dashboard-composer="post"'));
  assert.ok(html.includes('data-nav="menu"'));
  assert.ok(html.includes('data-icon="plus"'));
  assert.ok(html.includes('data-icon="utensils"'));
  // Genau ein Knopf je Karte.
  assert.equal((html.match(/<button/g) || []).length, 2);
});

test("half card styles share the composer surface and stack their button", () => {
  assert.ok(DASHBOARD_CSS.includes(".mnyra-dash__composer-row {"));
  assert.ok(DASHBOARD_CSS.includes(".mnyra-dash__composer--split {"));
  // Eine Spalte statt zwei, Knopf unten buendig.
  assert.ok(DASHBOARD_CSS.includes("grid-template-columns: minmax(0, 1fr);"));
  assert.ok(DASHBOARD_CSS.includes("margin-top: auto;"));
  // Schrift der beiden vorgegebenen Texte bleibt unveraendert.
  assert.ok(DASHBOARD_CSS.includes("font-size: 17px;\n  font-weight: 900;\n  letter-spacing: -0.01em;"));
  assert.ok(DASHBOARD_CSS.includes("margin: 5px 0 0;\n  font-size: 11px;\n  font-weight: 700;\n  line-height: 1.45;"));
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
