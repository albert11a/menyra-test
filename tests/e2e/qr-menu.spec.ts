import { expect, test } from "@playwright/test";

const SEEDED_QR_MENU_PATH = "/pidhimadh/menu?src=qr&table=2";

test.describe("qr menu smoke", () => {
  test.skip("opens QR menu with table context and keeps cart flow available", async ({
    page,
  }) => {
    await page.goto(SEEDED_QR_MENU_PATH);

    await expect(page.locator("body")).toContainText(/PIDHImadh|Local/i);
    await expect(
      page.locator(
        "[data-cart-checkout], [data-cart-qty], #menuDetailAddToCartBtn",
      ),
    ).toBeVisible();
  });
});
