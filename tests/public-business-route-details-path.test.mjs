import test from "node:test";
import assert from "node:assert/strict";

import {
  buildCanonicalPublicBusinessPathCore,
  isDetailsCatalogRouteSegmentCore,
  normalizePublicBusinessContentTabCore,
  normalizePublicBusinessTopTabCore,
  parsePublicBusinessRoutePathCore,
  parseSiteRoutePathCore,
  resolveCatalogRouteSegmentForBusinessTypeCore
} from "../apps/menyra-social/core/router/public-business-route-utils.js";

test("parses /slug/details as catalog tab with details segment", () => {
  const route = parseSiteRoutePathCore("/musterhotel/details");
  assert.equal(route.matched, true);
  assert.equal(route.kind, "business");
  assert.equal(route.restaurantId, "musterhotel");
  assert.equal(route.profileTopTab, "menu");
  assert.equal(route.profileContentTab, "menu");
  assert.equal(route.profileCatalogSegment, "details");
  assert.equal(route.canonicalPath, "/musterhotel/details");
});

test("keeps /slug/menu canonical for menu segment", () => {
  const route = parseSiteRoutePathCore("/musterhotel/menu");
  assert.equal(route.matched, true);
  assert.equal(route.profileTopTab, "menu");
  assert.equal(route.profileCatalogSegment, "menu");
  assert.equal(route.canonicalPath, "/musterhotel/menu");
});

test("details aliases normalize to canonical /details path", () => {
  ["detail", "detajet"].forEach((alias) => {
    const route = parseSiteRoutePathCore(`/musterhotel/${alias}`);
    assert.equal(route.matched, true, `alias ${alias} should match`);
    assert.equal(route.profileCatalogSegment, "details");
    assert.equal(route.canonicalPath, "/musterhotel/details");
  });
});

test("legacy /details/slug order parses like /menu/slug", () => {
  const route = parsePublicBusinessRoutePathCore("/details/musterhotel");
  assert.equal(route.matched, true);
  assert.equal(route.topTab, "menu");
  assert.equal(route.contentTab, "menu");
  assert.equal(route.catalogSegment, "details");
});

test("builder emits /details when catalogSegment says so", () => {
  assert.equal(
    buildCanonicalPublicBusinessPathCore({ slug: "musterhotel", topTab: "menu", catalogSegment: "details" }),
    "/musterhotel/details"
  );
  assert.equal(
    buildCanonicalPublicBusinessPathCore({ slug: "musterhotel", topTab: "menu" }),
    "/musterhotel/menu"
  );
  // Posts-Pfad bleibt vom Katalog-Segment unberuehrt.
  assert.equal(
    buildCanonicalPublicBusinessPathCore({ slug: "musterhotel", topTab: "profile", catalogSegment: "details" }),
    "/musterhotel"
  );
});

test("catalog segment resolves from business type", () => {
  assert.equal(resolveCatalogRouteSegmentForBusinessTypeCore("hotel"), "details");
  assert.equal(resolveCatalogRouteSegmentForBusinessTypeCore("Motel"), "details");
  assert.equal(resolveCatalogRouteSegmentForBusinessTypeCore("restaurant"), "menu");
  assert.equal(resolveCatalogRouteSegmentForBusinessTypeCore(""), "menu");
});

test("details segments map onto the internal menu tab", () => {
  assert.equal(normalizePublicBusinessTopTabCore("details"), "menu");
  assert.equal(normalizePublicBusinessContentTabCore("details"), "menu");
  assert.equal(isDetailsCatalogRouteSegmentCore("details"), true);
  assert.equal(isDetailsCatalogRouteSegmentCore("DETAJET"), true);
  assert.equal(isDetailsCatalogRouteSegmentCore("menu"), false);
});

test("details is reserved and never treated as a business slug", () => {
  const route = parseSiteRoutePathCore("/details");
  assert.equal(route.kind === "business" && route.restaurantId === "details", false);
});
