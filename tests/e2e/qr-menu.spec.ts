import { test } from "@playwright/test";

test.describe("qr menu smoke", () => {
  test.skip("opens QR menu with table context and keeps cart flow available", async ({
    page,
  }) => {
    await page.goto("/pidhimadh/menu?src=qr&table=table-01");
  });
});
