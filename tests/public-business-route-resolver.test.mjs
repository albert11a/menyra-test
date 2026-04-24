import assert from "node:assert/strict";
import test from "node:test";

import {
  resolveLaunchPublicBusinessRouteCore,
  resolvePublicBusinessRouteCore,
  normalizePublicBusinessRouteResolutionCore
} from "../apps/menyra-social/core/router/public-business-route-resolver.js";

const CASARITA_ID = "Lzm6RpNu3ErSDtGCHxpi";

test("launch resolver maps casarita slug to canonical restaurant id", () => {
  const result = resolveLaunchPublicBusinessRouteCore("casarita");
  assert.equal(result.found, true);
  assert.equal(result.restaurantId, CASARITA_ID);
  assert.equal(result.canonicalSlug, "casarita");
  assert.equal(result.source, "launch-alias");
});

test("launch resolver maps casa-rita alias to canonical casarita route", () => {
  const result = resolveLaunchPublicBusinessRouteCore("casa-rita");
  assert.equal(result.found, true);
  assert.equal(result.restaurantId, CASARITA_ID);
  assert.equal(result.canonicalSlug, "casarita");
  assert.equal(result.status, "redirect");
});

test("async resolver prefers publicRoutes document when available", async () => {
  const result = await resolvePublicBusinessRouteCore("demo-cafe", {
    readPublicRouteDoc: async (slug) => ({
      slug,
      canonicalSlug: "demo-cafe",
      restaurantId: "restaurant-demo-123456",
      status: "active"
    })
  });
  assert.equal(result.found, true);
  assert.equal(result.restaurantId, "restaurant-demo-123456");
  assert.equal(result.canonicalSlug, "demo-cafe");
  assert.equal(result.source, "firestore");
});

test("async resolver falls back to launch alias if publicRoutes lookup fails", async () => {
  const result = await resolvePublicBusinessRouteCore("casarita", {
    readPublicRouteDoc: async () => {
      throw new Error("temporary firestore failure");
    }
  });
  assert.equal(result.found, true);
  assert.equal(result.restaurantId, CASARITA_ID);
  assert.equal(result.canonicalSlug, "casarita");
  assert.equal(result.source, "launch-alias");
});

test("resolution normalization rejects inactive route as not found", () => {
  const result = normalizePublicBusinessRouteResolutionCore({
    inputSlug: "closed-place",
    canonicalSlug: "closed-place",
    restaurantId: "restaurant-closed-123456",
    status: "inactive",
    source: "firestore"
  });
  assert.equal(result.found, false);
  assert.equal(result.status, "inactive");
  assert.equal(result.restaurantId, "restaurant-closed-123456");
});
