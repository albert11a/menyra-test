import test from "node:test";
import assert from "node:assert/strict";

import {
  businessTypeHintKeysCore,
  profileMatchesBusinessRouteSlugCore,
  readBusinessTypeHintCore,
  resolveStableBusinessTypeCore,
  routePathHasDetailsCatalogSegmentCore,
  writeBusinessTypeHintCore
} from "../apps/menyra-social/core/profile/business-type-hint-utils.js";

test("businessTypeHintKeysCore keys by restaurantId and slug", () => {
  assert.deepEqual(
    businessTypeHintKeysCore({ restaurantId: "rest_1", publicSlug: "Hotel-Vela" }),
    ["r:rest_1", "s:hotel-vela"]
  );
  assert.deepEqual(businessTypeHintKeysCore({ landingRestaurantId: "rest_2" }), ["r:rest_2"]);
  assert.deepEqual(businessTypeHintKeysCore({ landingSlug: "Shengjin" }), ["s:shengjin"]);
  assert.deepEqual(businessTypeHintKeysCore({}), []);
});

test("writeBusinessTypeHintCore records type on all keys and reports change", () => {
  const first = writeBusinessTypeHintCore({}, ["r:rest_1", "s:hotel-vela"], "Hotel");
  assert.equal(first.changed, true);
  assert.deepEqual(first.store, { "r:rest_1": "hotel", "s:hotel-vela": "hotel" });
  const second = writeBusinessTypeHintCore(first.store, ["r:rest_1", "s:hotel-vela"], "hotel");
  assert.equal(second.changed, false);
  const empty = writeBusinessTypeHintCore({}, [], "hotel");
  assert.equal(empty.changed, false);
  const noType = writeBusinessTypeHintCore({}, ["r:rest_1"], "");
  assert.equal(noType.changed, false);
});

test("readBusinessTypeHintCore returns first matching key value", () => {
  const store = { "r:rest_1": "hotel" };
  assert.equal(readBusinessTypeHintCore(store, ["s:missing", "r:rest_1"]), "hotel");
  assert.equal(readBusinessTypeHintCore(store, ["s:missing"]), "");
  assert.equal(readBusinessTypeHintCore({}, ["r:rest_1"]), "");
});

test("resolveStableBusinessTypeCore prefers live type, falls back to hint", () => {
  assert.equal(resolveStableBusinessTypeCore("Hotel", "cafe"), "hotel");
  assert.equal(resolveStableBusinessTypeCore("", "motel"), "motel");
  assert.equal(resolveStableBusinessTypeCore("", ""), "");
});

test("businessTypeHintKeysCore falls back to route slug for empty cold-start profiles", () => {
  // Cold-Start: das frueh gerenderte Profil hat noch keine Identitaetsfelder,
  // nur der Slug aus der URL kann den gespeicherten Hinweis finden.
  assert.deepEqual(
    businessTypeHintKeysCore({}, { extraSlugs: ["Hotel-Vela"] }),
    ["s:hotel-vela"]
  );
  // Profil-Schluessel haben Vorrang, Duplikate werden nicht doppelt gelistet.
  assert.deepEqual(
    businessTypeHintKeysCore({ restaurantId: "rest_1", publicSlug: "hotel-vela" }, { extraSlugs: ["hotel-vela", ""] }),
    ["r:rest_1", "s:hotel-vela"]
  );
});

test("cold-start round trip via route slug resolves hotel without profile identity", () => {
  const loadedProfile = { restaurantId: "rest_9", publicSlug: "hotel-x", handle: "hotel-x" };
  const { store } = writeBusinessTypeHintCore({}, businessTypeHintKeysCore(loadedProfile), "hotel");
  // Naechster Cold Start: leeres Profil, aber URL-Slug /hotel-x
  const coldKeys = businessTypeHintKeysCore({}, { extraSlugs: ["hotel-x"] });
  assert.equal(resolveStableBusinessTypeCore("", readBusinessTypeHintCore(store, coldKeys)), "hotel");
});

test("hint round trip resolves hotel on the next (cold) paint", () => {
  // 1. Paint mit bekanntem Live-Typ -> Hinweis wird gespeichert
  const profile = { restaurantId: "rest_9", publicSlug: "hotel-x" };
  const keys = businessTypeHintKeysCore(profile);
  const { store } = writeBusinessTypeHintCore({}, keys, "hotel");
  // 2. Naechster Paint ohne Live-Typ -> Hinweis liefert sofort "hotel"
  const stable = resolveStableBusinessTypeCore("", readBusinessTypeHintCore(store, keys));
  assert.equal(stable, "hotel");
});

test("routePathHasDetailsCatalogSegmentCore detects details paths", () => {
  assert.equal(routePathHasDetailsCatalogSegmentCore("/musterhotel/details"), true);
  assert.equal(routePathHasDetailsCatalogSegmentCore("/musterhotel/detail"), true);
  assert.equal(routePathHasDetailsCatalogSegmentCore("/musterhotel/detajet"), true);
  assert.equal(routePathHasDetailsCatalogSegmentCore("/b/musterhotel/details?src=qr"), true);
  assert.equal(routePathHasDetailsCatalogSegmentCore("/musterhotel/menu"), false);
  assert.equal(routePathHasDetailsCatalogSegmentCore("/musterhotel"), false);
  assert.equal(routePathHasDetailsCatalogSegmentCore(""), false);
});

test("profileMatchesBusinessRouteSlugCore guards the route signal", () => {
  // Cold-Start-Profil ohne Identitaet gehoert zur Route
  assert.equal(profileMatchesBusinessRouteSlugCore({}, "musterhotel"), true);
  // Slug-Match (case-insensitiv, @-Prefix egal)
  assert.equal(profileMatchesBusinessRouteSlugCore({ publicSlug: "Musterhotel" }, "musterhotel"), true);
  assert.equal(profileMatchesBusinessRouteSlugCore({ handle: "@musterhotel" }, "musterhotel"), true);
  // Anderes Business -> Signal gilt nicht
  assert.equal(profileMatchesBusinessRouteSlugCore({ publicSlug: "resto-x" }, "musterhotel"), false);
  // Ohne Routen-Slug nie
  assert.equal(profileMatchesBusinessRouteSlugCore({}, ""), false);
});

test("cold start on /slug/details resolves hotel without any stored data", () => {
  // Simuliert den ersten Paint: leeres Profil, leerer Hint-Store - nur die URL
  // traegt die Wahrheit. Das Signal ergibt sich aus Pfad + Slug-Guard.
  const pathname = "/musterhotel/details";
  const routeSlug = "musterhotel";
  const signal = routePathHasDetailsCatalogSegmentCore(pathname)
    && profileMatchesBusinessRouteSlugCore({}, routeSlug);
  assert.equal(signal, true);
});
