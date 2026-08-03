import test from "node:test";
import assert from "node:assert/strict";

import {
  normalizeAppTabRouteCore,
  buildCanonicalAppTabPathCore,
  parseSiteRoutePathCore,
  isReservedPublicRouteSegmentCore
} from "../apps/menyra-social/core/router/public-business-route-utils.js";
import { normalizeInitialTab } from "../apps/menyra-social/core/auth/route-auth-utils.js";
import { sanitizeTabForSessionCore } from "../apps/menyra-social/core/auth/session-tab-guards.js";
import { resolveSocialRouteRuntimeKey } from "../apps/menyra-social/core/app-shell/route-runtime-registry.js";

test("ofertat tabs normalize to stable route keys", () => {
  assert.equal(normalizeAppTabRouteCore("ofertat"), "ofertat");
  assert.equal(normalizeAppTabRouteCore("ofertatbiznes"), "ofertatbiznes");
  assert.equal(normalizeAppTabRouteCore("ofertat-biznes"), "ofertatbiznes");
});

test("ofertat tabs map to canonical paths", () => {
  assert.equal(buildCanonicalAppTabPathCore("ofertat"), "/ofertat");
  assert.equal(buildCanonicalAppTabPathCore("ofertatbiznes"), "/ofertat-biznes");
});

test("ofertat paths parse as system routes and stay reserved", () => {
  const customer = parseSiteRoutePathCore("/ofertat");
  assert.equal(customer.kind, "system");
  assert.equal(customer.tab, "ofertat");

  const business = parseSiteRoutePathCore("/ofertat-biznes");
  assert.equal(business.kind, "system");
  assert.equal(business.tab, "ofertatbiznes");

  // Sonst wuerde /ofertat als oeffentlicher Restaurant-Slug interpretiert.
  assert.equal(isReservedPublicRouteSegmentCore("ofertat"), true);
  assert.equal(isReservedPublicRouteSegmentCore("ofertat-biznes"), true);
});

test("deep links into ofertat are accepted as initial tabs", () => {
  assert.equal(normalizeInitialTab("ofertat"), "ofertat");
  assert.equal(normalizeInitialTab("ofertat-biznes"), "ofertatbiznes");
});

test("guests may browse ofertat but not the business editor", () => {
  assert.equal(sanitizeTabForSessionCore("ofertat", { user: null, guestScopeUid: "guest-1" }), "ofertat");
  assert.equal(sanitizeTabForSessionCore("ofertatbiznes", { user: null, guestScopeUid: "guest-1" }), "feed");
  assert.equal(sanitizeTabForSessionCore("ofertatbiznes", { user: { uid: "u1" } }), "ofertatbiznes");
});

test("route runtime registry resolves both ofertat surfaces", () => {
  assert.equal(resolveSocialRouteRuntimeKey({ activeTab: "ofertat" }), "ofertat");
  assert.equal(resolveSocialRouteRuntimeKey({ activeTab: "ofertatbiznes" }), "ofertatbiznes");
});
