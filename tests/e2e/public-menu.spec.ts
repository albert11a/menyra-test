import { test } from "@playwright/test";

test.describe("public menu smoke", () => {
  test.skip("loads public menu without false empty state", async ({ page }) => {
    await page.goto("/pidhimadh/menu");
  });
});
