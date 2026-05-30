import test from "node:test";
import assert from "node:assert/strict";

import {
  loadCrmBusinessAccountsCore,
  normalizeCrmBusinessAccountEntryCore
} from "../apps/menyra-social/core/crm/crm-business-account-read-loader-core.js";
import {
  loadCrmBusinessAccountsCore as loadCrmBusinessAccountsCoreFromAdminLoader,
  normalizeCrmBusinessAccountEntryCore as normalizeCrmBusinessAccountEntryCoreFromAdminLoader
} from "../apps/menyra-social/core/crm/crm-admin-read-loader-core.js";

test("business account read core normalizes staff access fields", () => {
  assert.deepEqual(
    normalizeCrmBusinessAccountEntryCore({
      uid: "fallback-uid",
      restaurantId: "rest-1",
      firstName: " Ada ",
      lastName: " Lovelace ",
      email: " ada@example.test ",
      staffRole: "manager",
      permissions: {
        businessAccess: true,
        waiterAccess: false
      },
      active: false
    }, "staff-1"),
    {
      uid: "staff-1",
      userId: "fallback-uid",
      restaurantId: "rest-1",
      firstName: "Ada",
      lastName: "Lovelace",
      name: "Ada Lovelace",
      email: "ada@example.test",
      role: "manager",
      businessAccess: true,
      waiterAccess: false,
      active: false,
      status: "disabled",
      createdAt: null,
      updatedAt: null
    }
  );
});

test("business account read core loads and sorts staff rows", async () => {
  const collectionCalls = [];
  const getDocsCalls = [];
  const result = await loadCrmBusinessAccountsCore({
    db: { name: "db" },
    restaurantId: "rest-1",
    collectionFn: (...args) => {
      collectionCalls.push(args);
      return { path: args.slice(1).join("/") };
    },
    getDocsFn: async (ref) => {
      getDocsCalls.push(ref);
      return {
        forEach(callback) {
          [
            ["staff-b", { firstName: "Zoe", lastName: "B" }],
            ["staff-a", { firstName: "Ana", lastName: "A" }]
          ].forEach(([id, data]) => callback({ id, data: () => data }));
        }
      };
    }
  });

  assert.deepEqual(collectionCalls, [[{ name: "db" }, "restaurants", "rest-1", "staff"]]);
  assert.deepEqual(getDocsCalls, [{ path: "restaurants/rest-1/staff" }]);
  assert.deepEqual(result.items.map((item) => item.uid), ["staff-a", "staff-b"]);
  assert.equal(result.knownCount, 2);
  assert.equal(result.restaurantId, "rest-1");
});

test("admin read loader keeps business account core exports compatible", () => {
  assert.equal(loadCrmBusinessAccountsCoreFromAdminLoader, loadCrmBusinessAccountsCore);
  assert.equal(normalizeCrmBusinessAccountEntryCoreFromAdminLoader, normalizeCrmBusinessAccountEntryCore);
});
