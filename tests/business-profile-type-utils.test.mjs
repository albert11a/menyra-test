import test from "node:test";
import assert from "node:assert/strict";

import { getBusinessProfileTypeCore } from "../apps/menyra-social/core/profile/business-profile-type-utils.js";

const normalize = (value) => String(value || "").trim().toLowerCase();

test("resolves type from restaurant meta via restaurantId", () => {
  const type = getBusinessProfileTypeCore({ restaurantId: "rest_1" }, {
    getRestaurantMetaByIdFn: (id) => (id === "rest_1" ? { type: "Hotel" } : null),
    normalizeRestaurantTypeFn: normalize
  });
  assert.equal(type, "hotel");
});

test("resolves type when only canonicalRestaurantId is present", () => {
  // iOS-Resume/Snapshot-Profile tragen oft nur die kanonische ID - der Typ
  // muss trotzdem aufloesbar sein, sonst kippt der Hotel-Details-Tab auf Menu.
  const type = getBusinessProfileTypeCore({ canonicalRestaurantId: "rest_9" }, {
    getRestaurantMetaByIdFn: (id) => (id === "rest_9" ? { type: "motel" } : null),
    normalizeRestaurantTypeFn: normalize
  });
  assert.equal(type, "motel");
});

test("falls back to profile own type fields without meta", () => {
  const type = getBusinessProfileTypeCore(
    { canonicalRestaurantId: "rest_2", type: "hotel" },
    {
      getRestaurantMetaByIdFn: () => null,
      normalizeRestaurantTypeFn: normalize
    }
  );
  assert.equal(type, "hotel");
});

test("returns empty for profiles without any restaurant id", () => {
  const type = getBusinessProfileTypeCore({ type: "hotel" }, {
    getRestaurantMetaByIdFn: () => ({ type: "hotel" }),
    normalizeRestaurantTypeFn: normalize
  });
  assert.equal(type, "");
});

test("prefers restaurantId meta over canonical meta", () => {
  const type = getBusinessProfileTypeCore(
    { restaurantId: "rest_a", canonicalRestaurantId: "rest_b" },
    {
      getRestaurantMetaByIdFn: (id) => (id === "rest_a" ? { type: "restaurant" } : { type: "hotel" }),
      normalizeRestaurantTypeFn: normalize
    }
  );
  assert.equal(type, "restaurant");
});
