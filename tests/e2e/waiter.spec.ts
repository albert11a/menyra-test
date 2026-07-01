import {
  createForeignRestaurantOrder,
  deleteRestaurantOrder,
  readRestaurantOrder,
  restoreSeedWaiterOrder,
} from "./firebase-emulator-admin";
import { expect, test } from "./firebase-emulator-fixture";

const SEEDED_WAITER_ORDER_PATH =
  "/waiter/?restaurant=pidhi-madh&order=order-demo-001&firebase-emulator=1";
const SEEDED_ORDER_ID = "order-demo-001";

test.describe("seeded waiter order flow", () => {
  test("limits waiter access and allows only status changes", async ({
    page,
  }) => {
    const foreignOrderId = `order-foreign-${Date.now()}`;
    await restoreSeedWaiterOrder();
    await createForeignRestaurantOrder(foreignOrderId);

    try {
      await page.goto(SEEDED_WAITER_ORDER_PATH);
      await page.locator("#loginEmail").fill("waiter.local@example.test");
      await page.locator("#loginPassword").fill("local-test-password");
      await page.locator("#loginForm").press("Enter");

      await expect(page.locator("#logoutBtn")).toBeVisible();
      await expect(page.locator("body")).toContainText("PIDHImadh");
      await expect(
        page.locator(`[data-order-id="${SEEDED_ORDER_ID}"]`).first(),
      ).toBeVisible();
      await expect(page.locator("body")).not.toContainText(
        "Foreign Restaurant Item",
      );

      const deniedWrites = await page.evaluate(
        async ({ orderId, foreignId }) => {
          const appModule =
            await import("/shared/vendor/firebase/11.0.0/firebase-app.js");
          const firestoreModule =
            await import("/shared/vendor/firebase/11.0.0/firebase-firestore.js");
          const waiterApp = appModule
            .getApps()
            .find((entry) => entry.name === "menyra-waiter");
          if (!waiterApp) throw new Error("Waiter Firebase app not found");
          const firestore = firestoreModule.getFirestore(waiterApp);
          const ownOrderRef = firestoreModule.doc(
            firestore,
            "restaurants",
            "pidhi-madh",
            "orders",
            orderId,
          );
          const foreignOrderRef = firestoreModule.doc(
            firestore,
            "restaurants",
            "shop-demo",
            "orders",
            foreignId,
          );
          const attempt = async (operation) => {
            try {
              await operation();
              return "allowed";
            } catch (error) {
              return String(error?.code || error?.message || error);
            }
          };
          return {
            total: await attempt(() =>
              firestoreModule.updateDoc(ownOrderRef, { total: 0 }),
            ),
            items: await attempt(() =>
              firestoreModule.updateDoc(ownOrderRef, { items: [] }),
            ),
            foreignRead: await attempt(() =>
              firestoreModule.getDoc(foreignOrderRef),
            ),
          };
        },
        { orderId: SEEDED_ORDER_ID, foreignId: foreignOrderId },
      );

      expect(deniedWrites.total).toContain("permission-denied");
      expect(deniedWrites.items).toContain("permission-denied");
      expect(deniedWrites.foreignRead).toContain("permission-denied");

      const before = await readRestaurantOrder("pidhi-madh", SEEDED_ORDER_ID);
      expect(before?.total).toBe(13.8);
      expect(before?.items).toHaveLength(1);

      await page
        .locator(
          `[data-order-action="angenommen"][data-order-id="${SEEDED_ORDER_ID}"]`,
        )
        .last()
        .click();
      const finishedButton = page
        .locator(
          `[data-order-action="fertig"][data-order-id="${SEEDED_ORDER_ID}"]`,
        )
        .last();
      await expect(finishedButton).toBeVisible();
      await expect(finishedButton).toBeEnabled();
      await expect
        .poll(async () => {
          const order = await readRestaurantOrder(
            "pidhi-madh",
            SEEDED_ORDER_ID,
          );
          return order?.status;
        })
        .toBe("angenommen");

      const after = await readRestaurantOrder("pidhi-madh", SEEDED_ORDER_ID);
      expect(after?.total).toBe(13.8);
      expect(after?.items).toEqual(before?.items);
    } finally {
      await Promise.allSettled([
        restoreSeedWaiterOrder(),
        deleteRestaurantOrder("shop-demo", foreignOrderId),
      ]);
    }
  });
});
