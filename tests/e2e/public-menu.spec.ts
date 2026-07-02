import type { Page } from "@playwright/test";

import {
  deletePilotRestaurantFixture,
  upsertPilotBrokenMenuRestaurant,
  upsertPilotEmptyMenuRestaurant,
} from "./firebase-emulator-admin";
import { expect, test } from "./firebase-emulator-fixture";

const PRIVATE_MARKERS = [
  "owner.local@example.test",
  "shop-owner.local@example.test",
  "hotel-owner.local@example.test",
  "owner-demo",
  "shop-owner-demo",
  "hotel-owner-demo",
  "billingNote",
  "local-only private fixture",
  "ownerUid",
  "accountEmail",
  "staffIndex",
];

const PUBLIC_MENU_ROUTES = [
  {
    path: "/pidhimadh/menu",
    reload: true,
    expectedText: "Local Breakfast Plate",
    expectNonEmptyMenu: true,
  },
  {
    path: "/pidhimadh/menu?src=qr&table=2",
    reload: true,
    expectedText: "Local Breakfast Plate",
    expectedUrlParts: ["src=qr", "table=2"],
    expectNonEmptyMenu: true,
  },
  {
    path: "/shopdemo/menu",
    reload: true,
    expectedText: "Local Cotton Shirt",
    expectNonEmptyMenu: true,
  },
  {
    path: "/hoteldemo/menu",
    reload: true,
    expectedText: "Local Hotel Demo",
  },
];

function withEmulatorParams(path: string) {
  const separator = path.includes("?") ? "&" : "?";
  return `${path}${separator}firebase-emulator=1&sw-reset=1`;
}

async function expectNoPrivateMarkers(page, routeLabel: string) {
  const bodyText = await page.locator("body").innerText();
  expect(
    bodyText.trim().length,
    `${routeLabel} should render content`,
  ).toBeGreaterThan(40);
  for (const marker of PRIVATE_MARKERS) {
    expect(bodyText, `${routeLabel} leaked ${marker}`).not.toContain(marker);
  }
  await expect(
    page.locator(".vite-error-overlay, #webpack-dev-server-client-overlay"),
  ).toHaveCount(0);
}

async function expectNoBrokenLoadedImages(page: Page, routeLabel: string) {
  const brokenImages = await page
    .locator("img")
    .evaluateAll((images) =>
      images
        .filter((image) => image.complete && image.naturalWidth === 0)
        .map((image) => image.getAttribute("src") || image.currentSrc || ""),
    );
  expect(brokenImages, `${routeLabel} should not render broken images`).toEqual(
    [],
  );
}

async function expectMenuNotPersistentlyEmpty(page: Page, routeLabel: string) {
  await expect(
    page.locator("body"),
    `${routeLabel} should not settle on an empty menu state`,
  ).not.toContainText("Keine Produkte", { timeout: 1_000 });
}

async function expectPublicMenuRoute(
  page,
  route: (typeof PUBLIC_MENU_ROUTES)[number],
) {
  await page.goto(withEmulatorParams(route.path), {
    waitUntil: "domcontentloaded",
  });
  await expect(page.locator("body")).toContainText(route.expectedText, {
    timeout: 20_000,
  });
  for (const expectedUrlPart of route.expectedUrlParts || []) {
    expect(page.url()).toContain(expectedUrlPart);
  }
  await expectNoPrivateMarkers(page, route.path);
  if (route.expectNonEmptyMenu) {
    await expectMenuNotPersistentlyEmpty(page, route.path);
  }
  await expectNoBrokenLoadedImages(page, route.path);

  if (route.reload) {
    await page.reload({ waitUntil: "domcontentloaded" });
    await expect(page.locator("body")).toContainText(route.expectedText, {
      timeout: 20_000,
    });
    await expectNoPrivateMarkers(page, `${route.path} refresh`);
    if (route.expectNonEmptyMenu) {
      await expectMenuNotPersistentlyEmpty(page, `${route.path} refresh`);
    }
    await expectNoBrokenLoadedImages(page, `${route.path} refresh`);
  }
}

test.describe("public menu launch smoke", () => {
  test("opens seeded public menu and QR routes without private field leaks", async ({
    page,
  }) => {
    for (const route of PUBLIC_MENU_ROUTES) {
      await expectPublicMenuRoute(page, route);
    }
  });

  test("shows a clean empty state for a restaurant with no menu items", async ({
    page,
  }, testInfo) => {
    const suffix = testInfo.project.name.replace(/[^a-z0-9]+/gi, "-");
    const restaurantId = `pilot-empty-menu-${suffix}`;
    const slug = `pilot-empty-menu-${suffix}`;
    await deletePilotRestaurantFixture({ restaurantId, slug });
    await upsertPilotEmptyMenuRestaurant({ restaurantId, slug });

    try {
      await page.goto(withEmulatorParams(`/${slug}/menu`), {
        waitUntil: "domcontentloaded",
      });
      await expect(page.locator("body")).toContainText("Pilot Empty Menu", {
        timeout: 20_000,
      });
      await expect(page.locator("body")).toContainText("Keine Produkte", {
        timeout: 20_000,
      });
      await expect(page.locator("body")).not.toContainText(/Fehler|failed/i);
      await expect(page.locator("body")).not.toContainText(
        "Local Breakfast Plate",
      );
      await expectNoBrokenLoadedImages(page, `/${slug}/menu`);
    } finally {
      await deletePilotRestaurantFixture({ restaurantId, slug });
    }
  });

  test("does not show a false menu error while a public menu projection is absent", async ({
    page,
  }, testInfo) => {
    const suffix = testInfo.project.name.replace(/[^a-z0-9]+/gi, "-");
    const restaurantId = `pilot-missing-menu-${suffix}`;
    const slug = `pilot-missing-menu-${suffix}`;
    await deletePilotRestaurantFixture({ restaurantId, slug });
    await upsertPilotBrokenMenuRestaurant({ restaurantId, slug });

    try {
      await page.goto(withEmulatorParams(`/${slug}/menu`), {
        waitUntil: "domcontentloaded",
      });
      await expect(page.locator("body")).toContainText("Pilot Broken Menu", {
        timeout: 20_000,
      });
      await page.waitForTimeout(1_000);
      await expect(page.locator("body")).not.toContainText(/Fehler|failed/i);
      await expect(page.locator("body")).not.toContainText(
        "Local Breakfast Plate",
      );
      await expectNoBrokenLoadedImages(page, `/${slug}/menu`);
    } finally {
      await deletePilotRestaurantFixture({ restaurantId, slug });
    }
  });

  test("keeps QR source stable and avoids invalid table labels", async ({
    page,
  }) => {
    await page.goto(withEmulatorParams("/pidhimadh/menu?src=qr&table=abc"), {
      waitUntil: "domcontentloaded",
    });
    await expect(page.locator("body")).toContainText("Local Breakfast Plate", {
      timeout: 20_000,
    });
    expect(page.url()).toContain("src=qr");
    expect(page.url()).not.toContain("table=abc");
    await expect(page.locator("body")).not.toContainText(/Tisch\s*NaN/i);
    await expect(page.locator("body")).not.toContainText(/table\s*NaN/i);
    await expectNoBrokenLoadedImages(page, "/pidhimadh/menu invalid table");
  });

  test("stops retrying failed responsive menu images and shows fallbacks", async ({
    page,
  }) => {
    let failedImageRequests = 0;
    await page.route(
      /^https:\/\/images\.example\.local(?:\/.*)?$/,
      async (route) => {
        failedImageRequests += 1;
        await route.abort("failed");
      },
    );

    await page.goto(withEmulatorParams("/pidhimadh/menu"), {
      waitUntil: "domcontentloaded",
    });
    await expect(page.locator("body")).toContainText("Local Breakfast Plate", {
      timeout: 20_000,
    });
    await page.waitForTimeout(2_000);

    expect(failedImageRequests).toBeLessThan(30);
    const visibleBrokenImages = await page
      .locator("img:visible")
      .evaluateAll(
        (images) =>
          images.filter((image) => image.complete && image.naturalWidth === 0)
            .length,
      );
    expect(visibleBrokenImages).toBe(0);
  });
});
