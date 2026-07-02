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

const OWNER_ENTRY_URL = "/menu?firebase-emulator=1&sw-reset=1";
const OWNER_PASSWORD = "local-test-password";

const PUBLIC_PROFILE_ROUTES = [
  {
    path: "/pidhimadh",
    reload: true,
    expectedText: "PIDHImadh",
  },
  {
    path: "/pidhimadh/posts",
    expectedText: "PIDHImadh",
  },
  {
    path: "/shopdemo",
    reload: true,
    expectedText: "Local Shop Demo",
  },
  {
    path: "/shopdemo/posts",
    expectedText: "Local Shop Demo",
  },
  {
    path: "/hoteldemo",
    reload: true,
    expectedText: "Local Hotel Demo",
  },
  {
    path: "/hoteldemo/posts",
    expectedText: "Local Hotel Demo",
  },
];

function withEmulatorParams(path: string) {
  const separator = path.includes("?") ? "&" : "?";
  return `${path}${separator}firebase-emulator=1&sw-reset=1`;
}

async function loginAtOwnerMenu(page: Page, email: string) {
  await page.goto(OWNER_ENTRY_URL, { waitUntil: "domcontentloaded" });
  await expect(page.locator("#authForm")).toBeVisible({ timeout: 20_000 });
  await page.locator("#authEmail").fill(email);
  await page.locator("#authPassword").fill(OWNER_PASSWORD);
  await page.locator('#authForm button[type="submit"]').click();
  await expect(page.getByText("Editor", { exact: true })).toBeVisible({
    timeout: 20_000,
  });
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

async function expectProfileAvatarFallback(page: Page, routeLabel: string) {
  const avatar = page.locator('img[data-img-key^="avatar:public"]').first();
  if ((await avatar.count()) === 0) return;
  await expect(
    avatar,
    `${routeLabel} public avatar should have an image fallback`,
  ).toHaveAttribute("data-fallback-src", /.+/);
}

async function expectPublicProfileRoute(
  page,
  route: (typeof PUBLIC_PROFILE_ROUTES)[number],
) {
  await page.goto(withEmulatorParams(route.path), {
    waitUntil: "domcontentloaded",
  });
  await expect(page.locator("body")).toContainText(route.expectedText, {
    timeout: 20_000,
  });
  await expectNoPrivateMarkers(page, route.path);
  await expectProfileAvatarFallback(page, route.path);
  await expectNoBrokenLoadedImages(page, route.path);

  if (route.reload) {
    await page.reload({ waitUntil: "domcontentloaded" });
    await expect(page.locator("body")).toContainText(route.expectedText, {
      timeout: 20_000,
    });
    await expectNoPrivateMarkers(page, `${route.path} refresh`);
    await expectProfileAvatarFallback(page, `${route.path} refresh`);
    await expectNoBrokenLoadedImages(page, `${route.path} refresh`);
  }
}

test.describe("public profile launch smoke", () => {
  test("opens seeded public profile and posts routes without private field leaks", async ({
    page,
  }) => {
    for (const route of PUBLIC_PROFILE_ROUTES) {
      await expectPublicProfileRoute(page, route);
    }
  });

  test("does not issue a denied Firestore list during public startup", async ({
    page,
  }) => {
    const deniedListErrors: string[] = [];
    page.on("console", (message) => {
      const text = message.text();
      if (
        message.type() === "error" &&
        (text.includes("false for 'list'") ||
          (text.includes("permission-denied") && text.includes("list")))
      ) {
        deniedListErrors.push(text);
      }
    });

    await page.goto(withEmulatorParams("/pidhimadh"), {
      waitUntil: "domcontentloaded",
    });
    await expect(page.locator("body")).toContainText("PIDHImadh", {
      timeout: 20_000,
    });
    await page.waitForTimeout(4_000);

    expect(deniedListErrors).toEqual([]);
  });

  test("keeps public emulator startup off production Firebase services", async ({
    page,
  }) => {
    const productionRequests: string[] = [];
    const localBootstrapRequests: string[] = [];
    page.on("request", (request) => {
      const url = request.url();
      if (
        /(?:cloudfunctions\.net|firestore\.googleapis\.com|identitytoolkit\.googleapis\.com)/i.test(
          url,
        )
      ) {
        productionRequests.push(url);
      }
      if (
        url.startsWith(
          "http://127.0.0.1:5001/mnyra-local/us-central1/socialBootstrapFeed",
        )
      ) {
        localBootstrapRequests.push(url);
      }
    });

    await page.goto(withEmulatorParams("/pidhimadh"), {
      waitUntil: "domcontentloaded",
    });
    await expect(page.locator("body")).toContainText("PIDHImadh", {
      timeout: 20_000,
    });
    await expect.poll(() => localBootstrapRequests.length).toBeGreaterThan(0);

    await page.goto(withEmulatorParams("/pidhimadh/menu?src=qr&table=2"), {
      waitUntil: "domcontentloaded",
    });
    await expect(page.locator("body")).toContainText("Local Breakfast Plate", {
      timeout: 20_000,
    });
    await page.waitForTimeout(1_000);

    expect(productionRequests).toEqual([]);
  });

  test("business owner returns from public shop menu to own menu/focus context", async ({
    page,
  }) => {
    test.setTimeout(60_000);

    await loginAtOwnerMenu(page, "owner.local@example.test");

    await page.goto(withEmulatorParams("/shopdemo/menu"), {
      waitUntil: "domcontentloaded",
    });
    await expect(page.locator("body")).toContainText("Local Shop Demo", {
      timeout: 20_000,
    });
    await expect(page.locator("body")).toContainText("Local Cotton Shirt", {
      timeout: 20_000,
    });

    await page.goBack({ waitUntil: "domcontentloaded" });
    await expect(page.locator("body")).toContainText("PIDHImadh", {
      timeout: 20_000,
    });
    await expect(page).toHaveURL(/\/menu/);
    await expect(page.locator("body")).toContainText("Local Breakfast Plate", {
      timeout: 20_000,
    });
    await expect(page.locator("body")).toContainText("Lunch Combo", {
      timeout: 20_000,
    });
    await expect(page.locator("body")).not.toContainText("Local Cotton Shirt");
    await expect(page.locator("body")).not.toContainText("Shop Focus");

    await page.reload({ waitUntil: "domcontentloaded" });
    await expect(page.locator("body")).toContainText("PIDHImadh", {
      timeout: 20_000,
    });
    await expect(page.locator("body")).not.toContainText("Local Cotton Shirt");
  });
});
