import { test } from "@playwright/test";

test.describe("heart smoke", () => {
  test.skip("opens Heart Ads approval surface with seeded CEO account", async ({
    page,
  }) => {
    await page.goto("/apps/mnyra-heart/");
  });
});
