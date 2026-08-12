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

// Statt eines Satzes stehen jetzt die Umrisse der spaeteren Karten da.
test("the loading sentences are gone from the marketplace and the offers", () => {
  const marketplace = read(path.join(socialRoot, "core", "marketplace", "marketplace-view-render-utils.js"));
  const boundary = read(path.join(socialRoot, "core", "marketplace", "marketplace-runtime-boundary.js"));
  const vouchers = read(path.join(socialRoot, "core", "vouchers", "voucher-customer-render-utils.js"));
  assert.ok(!marketplace.includes("Te dhenat po ngarkohen"), "the marketplace loading sentence must be gone");
  assert.ok(!boundary.includes("Te dhenat po pergatiten"), "the boundary loading sentence must be gone");
  assert.ok(!vouchers.includes("Ofertat po ngarkohen ..."), "the offers loading sentence must be gone");
});

// Form und Groesse muessen den spaeteren Karten entsprechen, sonst springt das
// Layout beim Eintreffen der Daten.
test("the marketplace skeleton mirrors the real card measurements", () => {
  const markup = renderMarketplaceSkeletonCore();
  const realMarkup = read(path.join(socialRoot, "core", "marketplace", "marketplace-view-render-utils.js"));

  assert.ok(markup.includes('data-marketplace-skeleton="1"'), "the skeleton must be recognisable");
  assert.ok(markup.includes("animate-pulse"), "the skeleton must show it is waiting");
  assert.ok(markup.includes('aria-hidden="true"'), "the skeleton must stay out of the reading order");

  // Reihe oben: w-44 breit, h-28 Bild - genau wie renderBestCard.
  assert.ok(realMarkup.includes('class="shrink-0 w-44 text-left rounded-[2rem]'), "best card width anchor");
  assert.ok(markup.includes("w-44"), "the skeleton best card must keep the real width");
  assert.ok(markup.includes("h-28"), "the skeleton best card must keep the real image height");

  // Liste: h-48 Bild - genau wie renderListCard.
  assert.ok(realMarkup.includes('class="h-48 bg-slate-100 overflow-hidden"'), "list card image anchor");
  assert.ok(markup.includes("h-48"), "the skeleton list card must keep the real image height");
  assert.ok(markup.includes('rounded-[2rem]'), "the skeleton must keep the real corner radius");
});

test("the skeleton count can be tuned and stays valid at zero", () => {
  const none = renderMarketplaceSkeletonCore({ bestCount: 0, listCount: 0 });
  assert.ok(!none.includes("w-44"), "no best cards were asked for");
  assert.ok(!none.includes("h-48"), "no list cards were asked for");
  const one = renderMarketplaceSkeletonCore({ bestCount: 1, listCount: 1 });
  assert.equal(one.split("h-48").length - 1, 1, "exactly one list card");
});

test("the boundary shows the same skeleton inside a section frame", () => {
  const section = renderMarketplaceSkeletonSectionCore();
  assert.ok(section.startsWith("\n    <section"), "the boundary skeleton needs the section frame");
  assert.ok(section.includes('data-marketplace-skeleton="1"'), "it must be the same skeleton");
});

test("the offers skeleton mirrors the real offer card", () => {
  const markup = renderVoucherFeedLoadingState();
  const realMarkup = read(path.join(socialRoot, "core", "vouchers", "voucher-customer-render-utils.js"));
  assert.ok(realMarkup.includes('class="h-44 relative overflow-hidden"'), "offer card image anchor");
  assert.ok(markup.includes("h-44"), "the skeleton must keep the real image height");
  assert.ok(markup.includes("border-radius:28px"), "the skeleton must keep the real corner radius");
  assert.ok(markup.includes('data-voucher-skeleton="1"'), "the skeleton must be recognisable");
});

// Der Baustein hinter den Pills wird vorgeladen, damit der Wechsel nicht erst
// beim Tipp anfaengt zu laden.
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
