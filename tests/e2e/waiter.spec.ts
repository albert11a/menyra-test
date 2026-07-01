import { test } from "@playwright/test";

test.describe("waiter smoke", () => {
  test.skip("shows only authorized restaurant orders for waiter user", async ({
    page,
  }) => {
    await page.goto("/apps/waiter/");
  });
});
