import test from "node:test";
import assert from "node:assert/strict";

import {
  normalizeComposerProductCore,
  filterComposerProductsCore,
  canPublishComposerDraftCore,
  resolveStoryFrameRatioCore,
  resolveStoryFrameSizeCore,
  resolveStoryPreviewLayoutCore,
  BUSINESS_COMPOSER_CSS
} from "../apps/menyra-social/core/composer/business-composer-controller.js";
import { renderDashboardComposerCard } from "../apps/menyra-social/core/dashboard/dashboard-render-utils.js";

test("composer card offers postim and story with mnyra accent", () => {
  const html = renderDashboardComposerCard({ iconFn: (name) => `<i data-icon="${name}"></i>` });
  assert.ok(html.includes("Posto n'"));
  assert.ok(html.includes('<span class="mnyra-dash__composer-accent">Zbulo</span>'));
  assert.ok(html.includes('data-dashboard-composer="post"'));
  assert.ok(html.includes('data-dashboard-composer="story"'));
  assert.ok(html.includes(">Postim<"));
  assert.ok(html.includes(">Story<"));
  // Beide Knoepfe tragen ein Plus-Symbol.
  assert.equal((html.match(/data-icon="plus"/g) || []).length, 2);
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
  // Beide Story-Vorschauen stehen in gleich breiten Spalten nebeneinander.
  assert.ok(BUSINESS_COMPOSER_CSS.includes("grid-template-columns: repeat(2, minmax(0, 1fr));"));
  assert.ok(BUSINESS_COMPOSER_CSS.includes(".mnyra-bc__stage--frame {"));
});

test("story frame takes the portrait ratio of the device screen", () => {
  // Telefon im Hochformat und im Querformat ergeben dasselbe Story-Format.
  assert.equal(resolveStoryFrameRatioCore(440, 956).toFixed(4), (440 / 956).toFixed(4));
  assert.equal(resolveStoryFrameRatioCore(956, 440).toFixed(4), (440 / 956).toFixed(4));
  // Ohne brauchbare Bildschirmmasse bleibt das klassische Story-Format 9:16.
  assert.equal(resolveStoryFrameRatioCore(0, 0), 9 / 16);
  assert.equal(resolveStoryFrameRatioCore(1920, 1080), 9 / 16);
  // Ein fast quadratischer Bildschirm ist kein Story-Format.
  assert.equal(resolveStoryFrameRatioCore(1000, 1100), 9 / 16);
});

test("story frame keeps phone dimensions on every screen", () => {
  // Telefon: die echte Geraetebreite, Hoehe aus dem Bildschirmverhaeltnis.
  assert.deepEqual(
    resolveStoryFrameSizeCore({ screenWidth: 440, screenHeight: 956, viewportWidth: 440 }),
    { width: 440, height: 956 }
  );
  // Desktop: die Buehne bleibt telefonbreit statt fensterbreit.
  assert.deepEqual(
    resolveStoryFrameSizeCore({ screenWidth: 1920, screenHeight: 1080, viewportWidth: 1400 }),
    { width: 480, height: 853 }
  );
  // Sehr schmales Fenster: nie schmaler als ein Telefon.
  assert.equal(resolveStoryFrameSizeCore({ viewportWidth: 260 }).width, 320);
});

test("both story previews get exactly the same height", () => {
  const layout = resolveStoryPreviewLayoutCore({
    rowWidth: 408,
    tileWidth: 120,
    tileHeight: 208,
    reelWidth: 440,
    reelHeight: 956
  });
  // Gleich hoch - das ist der Kern: keine ist kleiner als die andere.
  assert.equal(layout.tile.height, layout.height);
  assert.equal(layout.reel.height, layout.height);
  // Und keine ist breiter als ihre Spalte.
  assert.ok(layout.tile.width <= layout.columnWidth + 0.01);
  assert.ok(layout.reel.width <= layout.columnWidth + 0.01);
  // Die Verhaeltnisse bleiben exakt die des Originals.
  assert.equal((layout.tile.width / layout.tile.height).toFixed(4), (120 / 208).toFixed(4));
  assert.equal((layout.reel.width / layout.reel.height).toFixed(4), (440 / 956).toFixed(4));
  // Auf einer breiten Zeile begrenzt die Obergrenze die Hoehe.
  const wide = resolveStoryPreviewLayoutCore({
    rowWidth: 1200,
    tileWidth: 120,
    tileHeight: 208,
    reelWidth: 440,
    reelHeight: 956
  });
  assert.equal(wide.height, 420);
  assert.equal(wide.reel.height, wide.tile.height);
});
