import assert from "node:assert/strict";
import test from "node:test";

import {
  buildCanonicalAppTabPathCore,
  parseSiteRoutePathCore,
  normalizeAppTabRouteCore,
  isReservedPublicRouteSegmentCore
} from "../apps/menyra-social/core/router/public-business-route-utils.js";
import { sanitizeTabForSessionCore } from "../apps/menyra-social/core/auth/session-tab-guards.js";
import { resolveSocialRouteRuntimeKey } from "../apps/menyra-social/core/app-shell/route-runtime-registry.js";
import { renderAdsViewCore } from "../apps/menyra-social/core/ads/ads-view-render-utils.js";

// ===========================================================================
// Mnyra Ads hat einen eigenen Ort - nicht den Menue-Editor.
//
// Ein eigener Tab kostet fast nichts und macht den Weg von Anfang an richtig:
// was in der Seite steht, kann danach wachsen, ohne dass Karte, Adresse oder
// Navigation noch einmal angefasst werden muessen.
// ===========================================================================

test("the ads tab has its own address, both ways", () => {
  assert.equal(buildCanonicalAppTabPathCore("reklama"), "/reklama");
  assert.equal(parseSiteRoutePathCore("/reklama").tab, "reklama");
  assert.equal(normalizeAppTabRouteCore("reklama"), "reklama");
  // Und der Weg fuehrt NICHT mehr in den Menue-Editor.
  assert.notEqual(buildCanonicalAppTabPathCore("reklama"), buildCanonicalAppTabPathCore("menu"));
});

// Sonst koennte ein Lokal den Handle "reklama" belegen und die Seite
// ueberschreiben - so wie es fuer /menu und /ofertat schon gilt.
test("no business can claim the ads segment as its handle", () => {
  assert.equal(isReservedPublicRouteSegmentCore("reklama"), true);
});

test("mnyra ads stays with logged-in accounts", () => {
  assert.equal(sanitizeTabForSessionCore("reklama", { user: { uid: "u1" } }), "reklama");
  // Ein Gast hat kein Lokal zu bewerben und landet im Feed.
  assert.equal(sanitizeTabForSessionCore("reklama", { user: null, guestScopeUid: "guest-1" }), "feed");
});

test("the shell knows which runtime draws the ads tab", () => {
  assert.equal(resolveSocialRouteRuntimeKey({ activeTab: "reklama" }), "reklama");
});

// Die Seite selbst ist noch ein Platzhalter - aber ein ehrlicher, kein leerer
// Rahmen. Und sie sagt Gaesten ohne Lokal etwas anderes als einem Business.
test("the ads page says what it is, with and without a business", () => {
  const mitLokal = renderAdsViewCore({ hasBusiness: true, escapeHtml: (v) => String(v || "") });
  assert.ok(mitLokal.includes("Mnyra Ads"));
  assert.ok(mitLokal.includes("data-ads-root"));

  const ohneLokal = renderAdsViewCore({ hasBusiness: false, escapeHtml: (v) => String(v || "") });
  assert.ok(ohneLokal.includes("Nuk ka profil biznesi te lidhur"));
  assert.equal(ohneLokal.includes("se shpejti"), false);
});
