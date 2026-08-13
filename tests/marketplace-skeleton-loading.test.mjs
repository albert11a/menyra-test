import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

import {
  renderMarketplaceSkeletonCore,
  renderMarketplaceSkeletonSectionCore
} from "../apps/menyra-social/core/marketplace/marketplace-skeleton-markup.js";
import { renderVoucherFeedLoadingState } from "../apps/menyra-social/core/vouchers/voucher-customer-render-utils.js";

const repoRoot = path.resolve(import.meta.dirname, "..");
const socialRoot = path.join(repoRoot, "apps", "menyra-social");

function read(file) {
  return fs.readFileSync(file, "utf8");
}

// Mnyra liefert ein fest vorgeneriertes Tailwind-CSS aus, das beim Build NICHT
// neu erzeugt wird. Eine Klasse, die dort fehlt, tut lautlos nichts. Genau so
// wurden hier schon einmal Balken unsichtbar (w-2/5, h-2.5, h-48 ...) und ein
// Suchfeld verlor sein Innenmass (pl-5).
const shippedCss = read(path.join(socialRoot, "styles", "tailwind.generated.css"));
const shippedClasses = new Set();
for (const match of shippedCss.matchAll(/\.(-?[A-Za-z0-9_][A-Za-z0-9_:\\/.[\]%#(),-]*)(?=[{,:\s>~+])/g)) {
  shippedClasses.add(match[1].replace(/\\/g, ""));
}

function classesMissingFromShippedCss(markup = "") {
  const missing = new Set();
  for (const match of markup.matchAll(/class="([^"]*)"/g)) {
    for (const raw of match[1].split(/\s+/)) {
      const cls = raw.trim();
      if (!cls) continue;
      const base = cls.replace(/^(hover|focus|active|md|sm|lg|focus-visible|group-hover):/, "");
      if (!shippedClasses.has(cls) && !shippedClasses.has(base)) missing.add(cls);
    }
  }
  return [...missing].sort();
}

// Der eigentliche Waechter: kein Umriss darf sein Aussehen an einer Klasse
// aufhaengen, die im ausgelieferten CSS gar nicht existiert.
test("no skeleton relies on a class the shipped css does not have", () => {
  assert.deepEqual(classesMissingFromShippedCss(renderMarketplaceSkeletonCore()), []);
  assert.deepEqual(classesMissingFromShippedCss(renderMarketplaceSkeletonSectionCore()), []);
  assert.deepEqual(classesMissingFromShippedCss(renderVoucherFeedLoadingState()), []);
});

test("the loading sentences are gone from the marketplace and the offers", () => {
  const marketplace = read(path.join(socialRoot, "core", "marketplace", "marketplace-view-render-utils.js"));
  const boundary = read(path.join(socialRoot, "core", "marketplace", "marketplace-runtime-boundary.js"));
  const vouchers = read(path.join(socialRoot, "core", "vouchers", "voucher-customer-render-utils.js"));
  assert.ok(!marketplace.includes("Te dhenat po ngarkohen"), "the marketplace loading sentence must be gone");
  assert.ok(!boundary.includes("Te dhenat po pergatiten"), "the boundary loading sentence must be gone");
  assert.ok(!vouchers.includes("Ofertat po ngarkohen ..."), "the offers loading sentence must be gone");
});

// Jeder Balken braucht eine Hoehe UND eine Breite, sonst ist er unsichtbar.
test("every skeleton bar carries a real height and width", () => {
  const markups = [renderMarketplaceSkeletonCore(), renderVoucherFeedLoadingState()];
  markups.forEach((markup) => {
    const blocks = [...markup.matchAll(/<div aria-hidden="true"[^>]*style="([^"]*)"/g)].map((m) => m[1]);
    assert.ok(blocks.length >= 4, "there must be several skeleton blocks");
    blocks.forEach((style) => {
      assert.match(style, /height:\s*[\d.]+rem/, `a skeleton block needs a height: ${style}`);
      assert.match(style, /width:\s*(\d+%|[\d.]+rem)/, `a skeleton block needs a width: ${style}`);
    });
  });
});

// Die Masse, die es mit den echten Karten gemeinsam hat, stehen fest.
test("the marketplace skeleton keeps the real card measurements", () => {
  const markup = renderMarketplaceSkeletonCore();
  const realMarkup = read(path.join(socialRoot, "core", "marketplace", "marketplace-view-render-utils.js"));

  assert.ok(markup.includes('data-marketplace-skeleton="1"'), "the skeleton must be recognisable");
  assert.ok(markup.includes("animate-pulse"), "the skeleton must show it is waiting");
  assert.ok(markup.includes('aria-hidden="true"'), "the skeleton must stay out of the reading order");

  // Reihe oben: w-44 = 11rem breit, h-28 = 7rem Bild - beide Klassen gibt es
  // im ausgelieferten CSS wirklich, der Umriss spiegelt ihre Werte.
  assert.ok(shippedClasses.has("w-44") && shippedClasses.has("h-28"), "the anchors must exist in the shipped css");
  assert.ok(realMarkup.includes('class="shrink-0 w-44 text-left rounded-[2rem]'), "best card anchor");
  assert.ok(markup.includes("width:11rem"), "the skeleton best card keeps the real width");
  assert.ok(markup.includes("height:7rem"), "the skeleton best card keeps the real image height");
  assert.ok(markup.includes("border-radius:2rem"), "the skeleton keeps the real corner radius");
});

test("the skeleton count can be tuned and stays valid at zero", () => {
  const none = renderMarketplaceSkeletonCore({ bestCount: 0, listCount: 0 });
  assert.ok(!none.includes("width:11rem"), "no best cards were asked for");
  assert.ok(!none.includes("height:12rem"), "no list cards were asked for");
  const one = renderMarketplaceSkeletonCore({ bestCount: 1, listCount: 1 });
  assert.equal(one.split("height:12rem").length - 1, 1, "exactly one list card");
});

test("the boundary shows the same skeleton inside a section frame", () => {
  const section = renderMarketplaceSkeletonSectionCore();
  assert.ok(section.includes("<section"), "the boundary skeleton needs the section frame");
  assert.ok(section.includes("padding:1.5rem"), "the frame must carry its padding without a class");
  assert.ok(section.includes('data-marketplace-skeleton="1"'), "it must be the same skeleton");
});

test("the offers skeleton mirrors the real offer card", () => {
  const markup = renderVoucherFeedLoadingState();
  const realMarkup = read(path.join(socialRoot, "core", "vouchers", "voucher-customer-render-utils.js"));
  assert.ok(realMarkup.includes('class="h-44 relative overflow-hidden"'), "offer card image anchor");
  assert.ok(shippedClasses.has("h-44"), "h-44 must exist in the shipped css");
  assert.ok(markup.includes("height:11rem"), "the skeleton keeps the real image height (h-44)");
  assert.ok(markup.includes("border-radius:28px"), "the skeleton keeps the real corner radius");
  assert.ok(markup.includes('data-voucher-skeleton="1"'), "the skeleton must be recognisable");
});

test("the marketplace runtime is warmed while the pills are on screen", () => {
  const app = read(path.join(socialRoot, "social-app.js"));
  assert.ok(
    app.includes("function warmMainHeaderTabRuntimes"),
    "there must be a warm up for the header tabs"
  );
  assert.ok(
    app.includes('document.querySelector("[data-main-header-tab]")'),
    "the warm up must wait until the pills are actually on screen"
  );
  assert.ok(
    app.includes("mainHeaderTabRuntimesWarmed = true"),
    "the warm up must only run once per session"
  );
  assert.ok(
    app.includes("warmMainHeaderTabRuntimes();"),
    "the warm up must be called after a render"
  );
});
