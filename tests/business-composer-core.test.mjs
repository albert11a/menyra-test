import test from "node:test";
import assert from "node:assert/strict";

import {
  normalizeComposerProductCore,
  filterComposerProductsCore,
  canPublishComposerDraftCore,
  BUSINESS_COMPOSER_CSS
} from "../apps/menyra-social/core/composer/business-composer-controller.js";
import {
  renderDashboardComposerHeading,
  renderDashboardComposerCards,
  DASHBOARD_CSS
} from "../apps/menyra-social/core/dashboard/dashboard-render-utils.js";

test("heading reads Posto n'MNYRA in the brand's own lettering", () => {
  const html = renderDashboardComposerHeading();
  assert.ok(html.includes("Posto n'"));
  assert.ok(html.includes('<span class="mnyra-dash__brandline-mark">MNYRA</span>'));
  // Die Schrift des Kopfzeilen-Logos: schwarz, kursiv, eng gesetzt.
  const block = DASHBOARD_CSS.slice(DASHBOARD_CSS.indexOf(".mnyra-dash__brandline-mark {"));
  const rules = block.slice(0, block.indexOf("}"));
  assert.ok(rules.includes("font-style: italic;"), rules);
  assert.ok(rules.includes("letter-spacing: -0.05em;"), rules);
  // Und die Zeile selbst steht schwarz, nicht im Akzent.
  const line = DASHBOARD_CSS.slice(DASHBOARD_CSS.indexOf(".mnyra-dash__brandline {"));
  assert.ok(line.slice(0, line.indexOf("}")).includes("color: var(--dash-ink);"));
});

test("greeting says Përshëndetje in black", () => {
  assert.ok(DASHBOARD_CSS.includes(".mnyra-dash__greet-hello { color: var(--dash-ink); }"));
  assert.ok(!DASHBOARD_CSS.includes(".mnyra-dash__greet-hello { color: var(--dash-accent); }"));
});

test("three posting cards sit side by side, each with its own colour", () => {
  const html = renderDashboardComposerCards();
  assert.ok(html.startsWith('<div class="mnyra-dash__post-cards"'));
  // Genau drei Karten, in dieser Reihenfolge.
  assert.equal((html.match(/mnyra-dash__post-card"/g) || []).length, 3);
  // Der Apostroph steht als Entity im Markup - genau so kommt er aus escapeHtml.
  const labels = ["n&#39;Zbulo", "n&#39;Story", "n&#39;Profil"];
  labels.forEach((label, index) => {
    assert.ok(html.includes(`>${label}</span>`), `${label} fehlt`);
    if (index > 0) {
      assert.ok(
        html.indexOf(labels[index - 1]) < html.indexOf(label),
        `${label} steht in der falschen Reihenfolge`
      );
    }
  });
  // Zbulo und Profil oeffnen den Beitrag, Story die Story.
  assert.equal((html.match(/data-dashboard-composer="post"/g) || []).length, 2);
  assert.equal((html.match(/data-dashboard-composer="story"/g) || []).length, 1);
  // Jede Karte hat ihren eigenen Farbton.
  ["zbulo", "story", "profil"].forEach((tone) => {
    assert.ok(html.includes(`data-tone="${tone}"`), tone);
    const block = DASHBOARD_CSS.includes(`[data-tone="${tone}"]`) || tone === "zbulo";
    assert.ok(block, `Farbton ${tone} fehlt in der CSS`);
  });
  assert.ok(DASHBOARD_CSS.includes('--tone: #db2777'));
  assert.ok(DASHBOARD_CSS.includes('--tone: #059669'));
  // Und je ein schlichtes Plus.
  assert.equal((html.match(/mnyra-dash__post-card-plus/g) || []).length, 3);
});

test("card icons are inline svg and can never fail to load", () => {
  const html = renderDashboardComposerCards();
  // Kein <i data-lucide>, kein Nachladen - vier eingebettete SVG je Karte-Satz.
  assert.ok(!html.includes("data-lucide"), "Symbole duerfen nicht nachgeladen werden");
  assert.equal((html.match(/<svg /g) || []).length, 6, "3 Symbole + 3 Plus");
  assert.ok(html.includes('viewBox="0 0 24 24"'));
  // Zbulo traegt das Feed-Blatt, Story den Ring mit Punkt, Profil die Person.
  assert.ok(html.includes('<path d="M18 14h-8"></path>'), "Feed-Symbol fehlt");
  assert.ok(html.includes('<circle cx="12" cy="12" r="4" fill="currentColor" stroke="none"></circle>'), "Story-Symbol fehlt");
  assert.ok(html.includes('<circle cx="12" cy="7" r="4"></circle>'), "Profil-Symbol fehlt");
});

test("every panel card shares one radius, casts no shadow and wears the profile hairline", () => {
  assert.ok(DASHBOARD_CSS.includes("--dash-card-radius: 25px;"));
  // Die Haarlinie der Profil-Karten (border-slate-100).
  assert.ok(DASHBOARD_CSS.includes("--dash-hairline: #f1f5f9;"));
  // Im ganzen Panel wirft nichts einen Schatten.
  assert.ok(!DASHBOARD_CSS.includes("box-shadow"), "im Panel darf kein box-shadow stehen");
  const flaechen = ["mnyra-dash__post-card {", "mnyra-dash__action {", "mnyra-dash__kpi {", "mnyra-dash__posts {", "mnyra-dash__state {"];
  flaechen.forEach((sel) => {
    const start = DASHBOARD_CSS.indexOf(`.${sel}`);
    assert.ok(start > -1, `${sel} fehlt`);
    const block = DASHBOARD_CSS.slice(start, DASHBOARD_CSS.indexOf("}", start));
    assert.ok(block.includes("border-radius: var(--dash-card-radius);"), `${sel}: Rundung ${block}`);
    assert.ok(block.includes("border: 1px solid var(--dash-hairline);"), `${sel}: Haarlinie ${block}`);
  });
  const skel = DASHBOARD_CSS.slice(DASHBOARD_CSS.indexOf(".mnyra-dash__skeleton {"));
  assert.ok(skel.slice(0, skel.indexOf("}")).includes("border-radius: var(--dash-card-radius);"));
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
