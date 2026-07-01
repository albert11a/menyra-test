import type { Page } from "@playwright/test";

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
});
