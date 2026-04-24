import assert from "node:assert/strict";
import test from "node:test";

import {
  createPublicRouteDocReaderCore
} from "../apps/menyra-social/core/router/public-route-doc-reader.js";

test("public route doc reader normalizes slug and returns document data", async () => {
  const calls = [];
  const reader = createPublicRouteDocReaderCore({
    db: { name: "db" },
    docFn: (db, collectionName, slug) => {
      calls.push({ db, collectionName, slug });
      return { collectionName, slug };
    },
    getDocFn: async (ref) => ({
      id: ref.slug,
      exists: () => true,
      data: () => ({
        canonicalSlug: "moka-coffee",
        restaurantId: "restaurant-moka-123456",
        status: "active"
      })
    })
  });

  const doc = await reader("Moka Coffee");
  assert.equal(calls.length, 1);
  assert.equal(calls[0].collectionName, "publicRoutes");
  assert.equal(calls[0].slug, "moka-coffee");
  assert.equal(doc.id, "moka-coffee");
  assert.equal(doc.restaurantId, "restaurant-moka-123456");
});

test("public route doc reader returns null when firestore deps are missing", async () => {
  const reader = createPublicRouteDocReaderCore({});
  const doc = await reader("casarita");
  assert.equal(doc, null);
});

test("public route doc reader returns null for missing snapshots", async () => {
  const reader = createPublicRouteDocReaderCore({
    db: {},
    docFn: () => ({}),
    getDocFn: async () => ({
      exists: () => false,
      data: () => ({ restaurantId: "should-not-return" })
    })
  });
  const doc = await reader("missing-place");
  assert.equal(doc, null);
});
