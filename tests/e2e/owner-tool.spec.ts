import { test } from "@playwright/test";

test.describe("owner tool smoke", () => {
  test.skip("opens owner menu editor with seeded owner account", async ({
    page,
  }) => {
    await page.goto("/apps/menyra-social/");
  });
});
