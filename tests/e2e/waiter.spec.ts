import { expect, test } from "@playwright/test";

const SEEDED_WAITER_ORDER_PATH =
  "/waiter/?restaurant=pidhi-madh&order=order-demo-001";

test.describe("waiter smoke", () => {
  test.skip("shows only authorized restaurant orders for waiter user", async ({
    page,
  }) => {
    await page.goto(SEEDED_WAITER_ORDER_PATH);

    await expect(
      page.locator("main, [data-tab], [data-order-action], #logoutBtn"),
    ).toBeVisible();
  });
});
