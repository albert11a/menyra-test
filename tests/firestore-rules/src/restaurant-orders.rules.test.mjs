import { after, before, beforeEach, describe, test } from "node:test";

import {
  assertFails,
  assertSucceeds,
  authedFirestore,
  cleanupRulesTestEnvironment,
  clearRulesTestData,
  getCollectionByPath,
  getDocByPath,
  getRulesTestEnvironment,
  guestFirestore,
  seedWithDisabledRules,
  setDocByPath,
  updateDocByPath
} from "./helpers/test-env.mjs";
import {
  buildOrderDoc,
  buildRestaurantDoc,
  buildRestaurantStaffDoc,
  fixture
} from "./helpers/fixtures.mjs";

let testEnv;

describe("firestore.rules restaurants/*/orders", () => {
  before(async () => {
    testEnv = await getRulesTestEnvironment();
  });

  beforeEach(async () => {
    await clearRulesTestData();
  });

  after(async () => {
    await cleanupRulesTestEnvironment();
  });

  test("allows guest create without buyerUid when restaurantId matches path", async () => {
    await seedWithDisabledRules(async (db) => {
      await setDocByPath(
        db,
        `restaurants/${fixture.restaurants.alpha.id}`,
        buildRestaurantDoc(fixture.restaurants.alpha)
      );
    });

    const db = guestFirestore(testEnv);
    await assertSucceeds(setDocByPath(
      db,
      `restaurants/${fixture.restaurants.alpha.id}/orders/guest-create-ok`,
      buildOrderDoc({
        orderId: "guest-create-ok",
        restaurantId: fixture.restaurants.alpha.id,
        buyerUid: "",
        tableNumber: 12
      })
    ));
  });

  test("allows signed-in buyer create when buyerUid matches actor", async () => {
    await seedWithDisabledRules(async (db) => {
      await setDocByPath(
        db,
        `restaurants/${fixture.restaurants.alpha.id}`,
        buildRestaurantDoc(fixture.restaurants.alpha)
      );
    });

    const db = authedFirestore(testEnv, fixture.personas.user);
    await assertSucceeds(setDocByPath(
      db,
      `restaurants/${fixture.restaurants.alpha.id}/orders/user-create-ok`,
      buildOrderDoc({
        orderId: "user-create-ok",
        restaurantId: fixture.restaurants.alpha.id,
        buyerUid: fixture.personas.user.uid
      })
    ));
  });

  test("denies signed-in create when buyerUid mismatches actor", async () => {
    await seedWithDisabledRules(async (db) => {
      await setDocByPath(
        db,
        `restaurants/${fixture.restaurants.alpha.id}`,
        buildRestaurantDoc(fixture.restaurants.alpha)
      );
    });

    const db = authedFirestore(testEnv, fixture.personas.user);
    await assertFails(setDocByPath(
      db,
      `restaurants/${fixture.restaurants.alpha.id}/orders/user-create-deny`,
      buildOrderDoc({
        orderId: "user-create-deny",
        restaurantId: fixture.restaurants.alpha.id,
        buyerUid: fixture.personas.business.uid
      })
    ));
  });

  test("denies create when payload restaurantId mismatches path", async () => {
    await seedWithDisabledRules(async (db) => {
      await setDocByPath(
        db,
        `restaurants/${fixture.restaurants.alpha.id}`,
        buildRestaurantDoc(fixture.restaurants.alpha)
      );
      await setDocByPath(
        db,
        `restaurants/${fixture.restaurants.beta.id}`,
        buildRestaurantDoc(fixture.restaurants.beta)
      );
    });

    const db = guestFirestore(testEnv);
    await assertFails(setDocByPath(
      db,
      `restaurants/${fixture.restaurants.alpha.id}/orders/guest-create-mismatch`,
      buildOrderDoc({
        orderId: "guest-create-mismatch",
        restaurantId: fixture.restaurants.beta.id,
        buyerUid: ""
      })
    ));
  });

  test("allows waiter-access staff to get, list and update orders in own restaurant", async () => {
    await seedWithDisabledRules(async (db) => {
      await setDocByPath(
        db,
        `restaurants/${fixture.restaurants.alpha.id}`,
        buildRestaurantDoc(fixture.restaurants.alpha)
      );
      await setDocByPath(
        db,
        `restaurants/${fixture.restaurants.alpha.id}/staff/${fixture.personas.staff.uid}`,
        buildRestaurantStaffDoc(fixture.personas.staff, fixture.restaurants.alpha, {
          waiterAccess: true,
          permissions: {
            businessAccess: false,
            waiterAccess: true
          }
        })
      );
      await setDocByPath(
        db,
        `restaurants/${fixture.restaurants.alpha.id}/orders/staff-visible-order`,
        buildOrderDoc({
          orderId: "staff-visible-order",
          restaurantId: fixture.restaurants.alpha.id,
          buyerUid: "",
          tableNumber: 15
        })
      );
    });

    const db = authedFirestore(testEnv, fixture.personas.staff);
    await assertSucceeds(getDocByPath(
      db,
      `restaurants/${fixture.restaurants.alpha.id}/orders/staff-visible-order`
    ));
    await assertSucceeds(getCollectionByPath(
      db,
      `restaurants/${fixture.restaurants.alpha.id}/orders`
    ));
    await assertSucceeds(updateDocByPath(
      db,
      `restaurants/${fixture.restaurants.alpha.id}/orders/staff-visible-order`,
      { status: "Angenommen" }
    ));
  });

  test("denies waiter-access staff on another restaurant", async () => {
    await seedWithDisabledRules(async (db) => {
      await setDocByPath(
        db,
        `restaurants/${fixture.restaurants.alpha.id}`,
        buildRestaurantDoc(fixture.restaurants.alpha)
      );
      await setDocByPath(
        db,
        `restaurants/${fixture.restaurants.beta.id}`,
        buildRestaurantDoc(fixture.restaurants.beta)
      );
      await setDocByPath(
        db,
        `restaurants/${fixture.restaurants.beta.id}/staff/${fixture.personas.staff.uid}`,
        buildRestaurantStaffDoc(fixture.personas.staff, fixture.restaurants.beta, {
          waiterAccess: true,
          permissions: {
            businessAccess: false,
            waiterAccess: true
          }
        })
      );
      await setDocByPath(
        db,
        `restaurants/${fixture.restaurants.alpha.id}/orders/alpha-order-deny`,
        buildOrderDoc({
          orderId: "alpha-order-deny",
          restaurantId: fixture.restaurants.alpha.id,
          buyerUid: "",
          tableNumber: 4
        })
      );
    });

    const db = authedFirestore(testEnv, fixture.personas.staff);
    await assertFails(getDocByPath(
      db,
      `restaurants/${fixture.restaurants.alpha.id}/orders/alpha-order-deny`
    ));
    await assertFails(getCollectionByPath(
      db,
      `restaurants/${fixture.restaurants.alpha.id}/orders`
    ));
  });
});
