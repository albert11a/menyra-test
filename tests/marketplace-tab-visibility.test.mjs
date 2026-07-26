import assert from "node:assert/strict";
import test from "node:test";

import {
  MARKETPLACE_FALLBACK_TAB,
  isHiddenMarketplaceTab,
  isMarketplaceTabEnabled,
  isShoppingTabEnabled,
  isTravelTabEnabled,
  resolveVisibleAppTab
} from "../shared/config/marketplace-tabs.js";
import {
  buildCanonicalAppTabPathCore,
  isReservedPublicRouteSegmentCore,
  normalizeAppTabRouteCore,
  parseSiteRoutePathCore,
  parseSystemRoutePathCore
} from "../apps/menyra-social/core/router/public-business-route-utils.js";
import { normalizeInitialTab } from "../apps/menyra-social/core/auth/route-auth-utils.js";
import { sanitizeTabForSessionCore } from "../apps/menyra-social/core/auth/session-tab-guards.js";

test("travel and shopping are switched off for the restaurant focus", () => {
  assert.equal(isTravelTabEnabled(), false);
  assert.equal(isShoppingTabEnabled(), false);
  assert.equal(isMarketplaceTabEnabled("travel"), false);
  assert.equal(isMarketplaceTabEnabled("shopping"), false);
  assert.equal(isHiddenMarketplaceTab("travel"), true);
  assert.equal(isHiddenMarketplaceTab("shopping"), true);
});

test("tabs outside the flagged marketplace set stay untouched", () => {
  for (const tab of ["feed", "restaurants", "search", "map", "profile", "orders", "businessAccounts"]) {
    assert.equal(isMarketplaceTabEnabled(tab), true, `${tab} must stay enabled`);
    assert.equal(resolveVisibleAppTab(tab), tab, `${tab} must resolve to itself`);
  }
});

test("resolveVisibleAppTab keeps the camelCase spelling of non-marketplace tabs", () => {
  assert.equal(resolveVisibleAppTab("businessAccounts"), "businessAccounts");
});

test("disabled marketplace tabs fall back to restaurants", () => {
  assert.equal(resolveVisibleAppTab("travel"), MARKETPLACE_FALLBACK_TAB);
  assert.equal(resolveVisibleAppTab("shopping"), MARKETPLACE_FALLBACK_TAB);
  assert.equal(resolveVisibleAppTab("Travel"), MARKETPLACE_FALLBACK_TAB);
  assert.equal(resolveVisibleAppTab("  shopping  "), MARKETPLACE_FALLBACK_TAB);
});

test("an empty tab request stays empty instead of becoming restaurants", () => {
  assert.equal(resolveVisibleAppTab(""), "");
});

test("app tab route normalization redirects the disabled tabs", () => {
  assert.equal(normalizeAppTabRouteCore("travel"), "restaurants");
  assert.equal(normalizeAppTabRouteCore("shopping"), "restaurants");
  assert.equal(normalizeAppTabRouteCore("restaurants"), "restaurants");
  assert.equal(normalizeAppTabRouteCore("feed"), "feed");
});

test("unknown tabs still resolve to the given fallback, not to restaurants", () => {
  assert.equal(normalizeAppTabRouteCore("does-not-exist", ""), "");
  assert.equal(normalizeAppTabRouteCore("does-not-exist", "feed"), "feed");
});

test("/travel and /shopping render restaurants and rewrite the url", () => {
  for (const path of ["/travel", "/shopping"]) {
    const route = parseSystemRoutePathCore(path);
    assert.equal(route.matched, true, `${path} must stay a matched system route`);
    assert.equal(route.kind, "system");
    assert.equal(route.tab, "restaurants");
    assert.equal(route.canonicalPath, "/restaurants", `${path} must not keep its old path`);
    assert.equal(route.aliasPath, "/restaurants");
  }
});

test("enabled system routes keep their own path", () => {
  const route = parseSystemRoutePathCore("/restaurants");
  assert.equal(route.tab, "restaurants");
  assert.equal(route.canonicalPath, "/restaurants");
  const feed = parseSystemRoutePathCore("/feed");
  assert.equal(feed.tab, "feed");
  assert.equal(feed.canonicalPath, "/feed");
});

test("travel and shopping stay reserved so they never read as a business slug", () => {
  assert.equal(isReservedPublicRouteSegmentCore("travel"), true);
  assert.equal(isReservedPublicRouteSegmentCore("shopping"), true);
  const route = parseSiteRoutePathCore("/travel");
  assert.equal(route.kind, "system");
  assert.notEqual(route.kind, "business");
});

test("canonical tab paths point at restaurants for the disabled tabs", () => {
  assert.equal(buildCanonicalAppTabPathCore("travel"), "/restaurants");
  assert.equal(buildCanonicalAppTabPathCore("shopping"), "/restaurants");
  assert.equal(buildCanonicalAppTabPathCore("restaurants"), "/restaurants");
});

test("initial tab deep links land on restaurants instead of the disabled tabs", () => {
  assert.equal(normalizeInitialTab("travel"), "restaurants");
  assert.equal(normalizeInitialTab("shopping"), "restaurants");
  assert.equal(normalizeInitialTab("restaurants"), "restaurants");
  assert.equal(normalizeInitialTab("feed"), "feed");
  assert.equal(normalizeInitialTab("nonsense"), "");
});

test("session tab guard blocks the disabled tabs for guests and logged in users", () => {
  const guest = { user: null, hasProfileView: false, guestScopeUid: "guest-1" };
  assert.equal(sanitizeTabForSessionCore("travel", guest), "restaurants");
  assert.equal(sanitizeTabForSessionCore("shopping", guest), "restaurants");

  const member = { user: { uid: "user-1" }, hasProfileView: false };
  assert.equal(sanitizeTabForSessionCore("travel", member), "restaurants");
  assert.equal(sanitizeTabForSessionCore("shopping", member), "restaurants");
});

test("session tab guard keeps its existing behaviour for other tabs", () => {
  const member = { user: { uid: "user-1" }, hasProfileView: false };
  assert.equal(sanitizeTabForSessionCore("restaurants", member), "restaurants");
  assert.equal(sanitizeTabForSessionCore("location", member), "feed");
  assert.equal(sanitizeTabForSessionCore("", member), "feed");
  assert.equal(sanitizeTabForSessionCore("leads", member), "feed");
});
