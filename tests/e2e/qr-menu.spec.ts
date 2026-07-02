import {
  deleteRestaurantOrder,
  listRestaurantOrders,
} from "./firebase-emulator-admin";
import { expect, test } from "./firebase-emulator-fixture";

const SEEDED_QR_MENU_PATH =
  "/pidhimadh/menu?src=qr&table=2&firebase-emulator=1&sw-reset=1";
const RESTAURANT_ID = "pidhi-madh";
const SEEDED_ITEM_ID = "menu-001";
const SEEDED_ITEM_NAME = "Local Breakfast Plate";
const SEEDED_ITEM_PRICE = 6.9;
const ALLOWED_ORDER_FIELDS = new Set([
  "id",
  "restaurantId",
  "businessName",
  "businessAvatar",
  "buyerUid",
  "buyerName",
  "buyerHandle",
  "buyerAvatar",
  "contact",
  "table",
  "tableId",
  "tableNumber",
  "tableLabel",
  "serviceMode",
  "source",
  "items",
  "itemCount",
  "total",
  "totalCents",
  "status",
  "statusKey",
  "orderSource",
  "pricingSource",
  "pricingVersion",
  "guestScopeUid",
  "guestSessionId",
  "guestLookupToken",
  "orderLookupToken",
  "createdAt",
  "updatedAt",
  "createdAtClient",
  "updatedAtClient",
]);
const ALLOWED_ORDER_ITEM_FIELDS = new Set([
  "id",
  "itemId",
  "name",
  "price",
  "priceCents",
  "quantity",
  "imageUrl",
  "imageUrls",
  "category",
  "comment",
  "cartKey",
  "selectedSize",
  "selectedColor",
  "cropX",
  "cropY",
]);

test.describe("seeded QR menu order flow", () => {
  test("creates a callable table order and exposes it to the waiter", async ({
    page,
  }) => {
    const beforeIds = new Set(
      (await listRestaurantOrders(RESTAURANT_ID)).map((order) => order.id),
    );
    let createdOrderId = "";

    await page.goto(SEEDED_QR_MENU_PATH);

    await expect(page.locator("body")).toContainText("PIDHImadh");
    const menuItem = page
      .locator(`[data-menu-open="${SEEDED_ITEM_ID}"]`)
      .filter({ hasText: SEEDED_ITEM_NAME });
    await expect(menuItem).toContainText(SEEDED_ITEM_NAME);
    await menuItem.click();

    await expect(page.locator("#menuDetailTitle")).toContainText(
      SEEDED_ITEM_NAME,
    );
    await page.locator("#menuDetailAddToCartBtn").click();

    const cartItem = page
      .locator(`[data-cart-qty^="${SEEDED_ITEM_ID}::"]`)
      .first();
    await expect(cartItem).toBeVisible();
    await expect(page.locator("body")).toContainText(SEEDED_ITEM_NAME);
    await expect(page.locator("body")).toContainText(/6[,.]90/);

    const submitButton = page.locator('[data-cart-checkout="submit"]').first();
    await expect(submitButton).toBeVisible();
    await submitButton.evaluate((button: HTMLButtonElement) => {
      button.click();
      button.click();
    });
    await expect(page.locator("body")).toContainText("Bestellung gesendet", {
      timeout: 20_000,
    });

    await expect
      .poll(async () => {
        const orders = await listRestaurantOrders(RESTAURANT_ID);
        const created = orders.filter((order) => !beforeIds.has(order.id));
        createdOrderId = created[0]?.id || "";
        return created.length;
      })
      .toBe(1);

    try {
      const createdOrder = (await listRestaurantOrders(RESTAURANT_ID)).find(
        (order) => order.id === createdOrderId,
      );
      expect(createdOrder).toBeTruthy();
      const payload = createdOrder?.data || {};
      expect(payload.restaurantId).toBe(RESTAURANT_ID);
      expect(["Neu", "new", "bestellung"]).toContain(payload.status);
      expect(payload.tableNumber).toBe(2);
      expect(payload.itemCount).toBe(1);
      expect(payload.total).toBeCloseTo(SEEDED_ITEM_PRICE, 2);
      expect(payload.totalCents).toBe(690);
      expect(payload.orderSource).toBe("serverCallable");
      expect(payload.pricingSource).toBe("server_menu");
      expect(
        Object.keys(payload).every((key) => ALLOWED_ORDER_FIELDS.has(key)),
      ).toBe(true);
      expect(payload.items).toHaveLength(1);
      expect(payload.items[0]).toMatchObject({
        itemId: SEEDED_ITEM_ID,
        name: SEEDED_ITEM_NAME,
        quantity: 1,
        price: SEEDED_ITEM_PRICE,
      });
      expect(
        Object.keys(payload.items[0]).every((key) =>
          ALLOWED_ORDER_ITEM_FIELDS.has(key),
        ),
      ).toBe(true);

      const immutableItems = structuredClone(payload.items);
      const immutableTotal = payload.total;
      await page.goto(
        `/waiter/?restaurant=${RESTAURANT_ID}&order=${createdOrderId}&firebase-emulator=1`,
      );
      await page.locator("#loginEmail").fill("waiter.local@example.test");
      await page.locator("#loginPassword").fill("local-test-password");
      await page.locator("#loginForm").press("Enter");
      await expect(page.locator("#logoutBtn")).toBeVisible();
      await expect(
        page.locator(`[data-order-id="${createdOrderId}"]`).first(),
      ).toBeVisible();
      await expect(page.locator("body")).toContainText(SEEDED_ITEM_NAME);
      await page
        .locator(
          `[data-order-action="angenommen"][data-order-id="${createdOrderId}"]`,
        )
        .last()
        .click();
      await expect
        .poll(async () => {
          const updated = (await listRestaurantOrders(RESTAURANT_ID)).find(
            (order) => order.id === createdOrderId,
          );
          return updated?.data?.status;
        })
        .toBe("angenommen");
      const updatedOrder = (await listRestaurantOrders(RESTAURANT_ID)).find(
        (order) => order.id === createdOrderId,
      );
      expect(updatedOrder?.data?.items).toEqual(immutableItems);
      expect(updatedOrder?.data?.total).toBe(immutableTotal);
    } finally {
      if (createdOrderId) {
        await deleteRestaurantOrder(RESTAURANT_ID, createdOrderId);
      }
    }
  });
});
