import test from "node:test";
import assert from "node:assert/strict";

import {
  businessTypeHintKeysCore,
  readBusinessTypeHintCore,
  resolveStableBusinessTypeCore,
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

test("hint round trip resolves hotel on the next (cold) paint", () => {
  // 1. Paint mit bekanntem Live-Typ -> Hinweis wird gespeichert
  const profile = { restaurantId: "rest_9", publicSlug: "hotel-x" };
  const keys = businessTypeHintKeysCore(profile);
  const { store } = writeBusinessTypeHintCore({}, keys, "hotel");
  // 2. Naechster Paint ohne Live-Typ -> Hinweis liefert sofort "hotel"
  const stable = resolveStableBusinessTypeCore("", readBusinessTypeHintCore(store, keys));
  assert.equal(stable, "hotel");
});
