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

  if (route.reload) {
    await page.reload({ waitUntil: "domcontentloaded" });
    await expect(page.locator("body")).toContainText(route.expectedText, {
      timeout: 20_000,
    });
    await expectNoPrivateMarkers(page, `${route.path} refresh`);
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
});
