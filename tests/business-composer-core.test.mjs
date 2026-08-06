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
  // Abstand zur Begruessung darueber, leiser Schatten, kleinere Knoepfe.
  assert.ok(DASHBOARD_CSS.includes("margin-top: 34px;"));
  assert.ok(DASHBOARD_CSS.includes("box-shadow: 0 6px 16px -14px rgba(15, 23, 42, 0.3);"));
  assert.ok(DASHBOARD_CSS.includes("min-height: 46px;"));
  // Der ausgefuellte Knopf wirft keinen eigenen Schatten mehr.
  assert.ok(!DASHBOARD_CSS.includes("rgba(79, 70, 229, 0.9)"));
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
