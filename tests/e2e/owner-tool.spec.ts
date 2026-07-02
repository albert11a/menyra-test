import type { Page } from "@playwright/test";

import {
  createForeignRestaurantOrder,
  deleteRestaurantMenuItemsByNames,
  deleteRestaurantOrder,
  listRestaurantOrders,
  readRestaurantMenuItemByName,
  readRestaurantPublicMenu,
  restoreSeedWaiterOrder,
} from "./firebase-emulator-admin";
import {
  expect,
  prepareFirebaseEmulatorPage,
  test,
} from "./firebase-emulator-fixture";

const OWNER_ENTRY_URL = "/menu?firebase-emulator=1&sw-reset=1";
const OWNER_PASSWORD = "local-test-password";

async function loginAtOwnerMenu(page: Page, email: string) {
  await page.goto(OWNER_ENTRY_URL, { waitUntil: "domcontentloaded" });
  await expect(page).toHaveURL(/\/menu\?/);
  await expect(page.locator("#authForm")).toBeVisible({ timeout: 20_000 });
  await page.locator("#authEmail").fill(email);
  await page.locator("#authPassword").fill(OWNER_PASSWORD);
  await page.locator('#authForm button[type="submit"]').click();
  await expect(page.getByText("Editor", { exact: true })).toBeVisible({
    timeout: 20_000,
  });
}

async function openHiddenMenuAction(page: Page, selector: string) {
  const action = page.locator(selector);
  await expect(action).toHaveCount(1);
  await action.evaluate((element) => {
    const details = element.closest("details");
    if (details) details.open = true;
  });
  await action.click();
}

test.describe("owner tool smoke", () => {
  test("restaurant owner orders stay visible and scoped after refresh", async ({
    page,
  }, testInfo) => {
    testInfo.setTimeout(60_000);
    const suffix = testInfo.project.name.replace(/[^a-z0-9]+/gi, "-");
    const foreignOrderId = `owner-orders-foreign-${suffix}`;

    await restoreSeedWaiterOrder();
    await deleteRestaurantOrder("shop-demo", foreignOrderId);
    await createForeignRestaurantOrder(foreignOrderId);

    try {
      await loginAtOwnerMenu(page, "owner.local@example.test");
      await page.goto("/orders?firebase-emulator=1&sw-reset=1", {
        waitUntil: "domcontentloaded",
      });
      await expect(page.locator("#ordersView")).toBeVisible({
        timeout: 20_000,
      });
      await expect(page.locator("body")).toContainText(
        "Local Breakfast Plate",
        { timeout: 20_000 },
      );
      await expect(page.locator("body")).toContainText("Tisch 2");
      await expect(page.locator("body")).not.toContainText(
        "Foreign Restaurant Item",
      );
      await expect(page.locator("body")).not.toContainText(
        "Noch keine Bestellungen",
      );

      await page.reload({ waitUntil: "domcontentloaded" });
      await expect(page.locator("#ordersView")).toBeVisible({
        timeout: 20_000,
      });
      await expect(page.locator("body")).toContainText(
        "Local Breakfast Plate",
        { timeout: 20_000 },
      );
      await expect(page.locator("body")).not.toContainText(
        "Foreign Restaurant Item",
      );
    } finally {
      await Promise.allSettled([
        restoreSeedWaiterOrder(),
        deleteRestaurantOrder("shop-demo", foreignOrderId),
      ]);
    }
  });

  test("shop owner orders empty state is stable and not cross-filled", async ({
    page,
  }) => {
    const existingShopOrders = await listRestaurantOrders("shop-demo");
    await Promise.allSettled(
      existingShopOrders.map((order) =>
        deleteRestaurantOrder("shop-demo", order.id),
      ),
    );

    await loginAtOwnerMenu(page, "shop-owner.local@example.test");
    await page.goto("/orders?firebase-emulator=1&sw-reset=1", {
      waitUntil: "domcontentloaded",
    });
    await expect(page.locator("#ordersView")).toBeVisible({ timeout: 20_000 });
    await expect(page.locator("body")).toContainText(
      "Noch keine Bestellungen",
      {
        timeout: 20_000,
      },
    );
    await expect(page.locator("body")).not.toContainText(
      "Local Breakfast Plate",
    );
    await expect(page.locator("body")).not.toContainText("PIDHImadh");
  });

  test("restaurant owner creates, edits, publishes and deletes a numeric-price menu item", async ({
    page,
    browser,
  }, testInfo) => {
    testInfo.setTimeout(60_000);
    const suffix = testInfo.project.name.replace(/[^a-z0-9]+/gi, "-");
    const createdName = `Owner Rehearsal Dish ${suffix}`;
    const updatedName = `${createdName} Updated`;
    await deleteRestaurantMenuItemsByNames("pidhi-madh", [
      createdName,
      updatedName,
    ]);

    try {
      await loginAtOwnerMenu(page, "owner.local@example.test");
      await expect(
        page.getByRole("main").getByText("PIDHImadh", { exact: true }).first(),
      ).toBeVisible();
      await expect(page.locator("#tableQrCountInput")).toHaveValue("12");
      await expect(page.getByText("Tisch 1", { exact: true })).toBeVisible();
      await expect(page.getByText("Tisch 12", { exact: true })).toBeVisible();

      const foreignBusinessContext = await browser.newContext();
      try {
        const foreignBusinessPage = await foreignBusinessContext.newPage();
        await prepareFirebaseEmulatorPage(foreignBusinessPage);
        await loginAtOwnerMenu(foreignBusinessPage, "owner.local@example.test");
        await foreignBusinessPage.goto(
          "/shopdemo/menu?firebase-emulator=1&sw-reset=1",
          {
            waitUntil: "domcontentloaded",
          },
        );
        await expect(foreignBusinessPage.locator("body")).toContainText(
          "Local Cotton Shirt",
          {
            timeout: 20_000,
          },
        );
        await expect(
          foreignBusinessPage.locator("[data-menu-edit]"),
        ).toHaveCount(0);
        await expect(
          foreignBusinessPage.locator("[data-menu-add-food]"),
        ).toHaveCount(0);
      } finally {
        await foreignBusinessContext.close();
      }

      await page.locator("[data-menu-add-food]").click();
      await expect(page.locator("#menuItemName")).toBeVisible();
      await page.locator("#menuItemName").fill(createdName);
      await page.locator("#menuItemPrice").fill("12,34 EUR");
      await page.locator("#menuItemCategory").fill("E2E Test");
      await page.locator("#menuModalSave").click();

      let createdItem: Awaited<
        ReturnType<typeof readRestaurantMenuItemByName>
      > = null;
      await expect
        .poll(async () => {
          createdItem = await readRestaurantMenuItemByName(
            "pidhi-madh",
            createdName,
          );
          return createdItem?.data?.price;
        })
        .toBe(12.34);
      expect(typeof createdItem?.data?.price).toBe("number");

      let publicCreatedItem:
        | NonNullable<
            Awaited<ReturnType<typeof readRestaurantPublicMenu>>
          >["items"][number]
        | undefined;
      await expect
        .poll(async () => {
          const publicMenu = await readRestaurantPublicMenu("pidhi-madh");
          publicCreatedItem = publicMenu?.items?.find(
            (item) => item.id === createdItem?.id,
          );
          return Boolean(publicCreatedItem);
        })
        .toBe(true);
      expect(
        publicCreatedItem?.price === null ||
          typeof publicCreatedItem?.price === "number",
      ).toBe(true);

      await openHiddenMenuAction(page, `[data-menu-edit="${createdItem?.id}"]`);
      await page.locator("#menuItemName").fill(updatedName);
      await page.locator("#menuItemPrice").fill("18,75");
      await page.locator("#menuModalSave").click();
      await expect
        .poll(async () => {
          const item = await readRestaurantMenuItemByName(
            "pidhi-madh",
            updatedName,
          );
          return item?.data?.price;
        })
        .toBe(18.75);

      let publicEditedItem:
        | NonNullable<
            Awaited<ReturnType<typeof readRestaurantPublicMenu>>
          >["items"][number]
        | undefined;
      await expect
        .poll(async () => {
          const publicMenu = await readRestaurantPublicMenu("pidhi-madh");
          publicEditedItem = publicMenu?.items?.find(
            (item) => item.id === createdItem?.id,
          );
          return publicEditedItem?.price;
        })
        .toBe(18.75);
      expect(publicEditedItem?.price).toBe(18.75);
      expect(typeof publicEditedItem?.price).toBe("number");

      const publicMenuContext = await browser.newContext();
      try {
        const publicMenuPage = await publicMenuContext.newPage();
        await prepareFirebaseEmulatorPage(publicMenuPage);
        await publicMenuPage.goto(
          "/pidhimadh/menu?firebase-emulator=1&sw-reset=1",
          { waitUntil: "domcontentloaded" },
        );
        await expect(
          publicMenuPage.getByText(updatedName, { exact: true }),
        ).toBeVisible({ timeout: 20_000 });
      } finally {
        await publicMenuContext.close();
      }

      page.once("dialog", (dialog) => dialog.accept());
      await openHiddenMenuAction(
        page,
        `[data-menu-delete="${createdItem?.id}"]`,
      );
      await expect
        .poll(async () =>
          readRestaurantMenuItemByName("pidhi-madh", updatedName),
        )
        .toBeNull();
      await expect
        .poll(async () => {
          const publicMenu = await readRestaurantPublicMenu("pidhi-madh");
          return publicMenu?.items?.some((item) => item.id === createdItem?.id);
        })
        .toBe(false);
    } finally {
      await deleteRestaurantMenuItemsByNames("pidhi-madh", [
        createdName,
        updatedName,
      ]);
    }
  });

  test("shop owner reaches the shop product editor", async ({ page }) => {
    await loginAtOwnerMenu(page, "shop-owner.local@example.test");
    await expect(
      page
        .getByRole("main")
        .getByText("Local Shop Demo", { exact: true })
        .first(),
    ).toBeVisible();
    await expect(page.locator("[data-menu-add-food]")).toBeVisible();
  });

  test("hotel owner reaches hotel details and offer controls", async ({
    page,
  }) => {
    await loginAtOwnerMenu(page, "hotel-owner.local@example.test");
    await expect(
      page
        .getByRole("main")
        .getByText("Local Hotel Demo", { exact: true })
        .first(),
    ).toBeVisible();
    await expect(
      page.getByText("Hotel Details", { exact: true }).first(),
    ).toBeVisible();
    await expect(
      page.locator("[data-hotel-card-details-open]").first(),
    ).toBeVisible();
    await expect(page.getByText("Oferta", { exact: true })).toBeVisible();
  });
});
