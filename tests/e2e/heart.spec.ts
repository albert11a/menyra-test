import type { Page } from "@playwright/test";

import { expect, test } from "./firebase-emulator-fixture";

const HEART_LEADS_URL = `/heart?firebase-emulator=1&view=leads&cb=${Date.now()}`;
const HEART_PASSWORD = "local-test-password";
const HEART_EMAIL = "heart.local@example.test";
const OWNER_EMAIL = "owner.local@example.test";
const SEEDED_LEAD_ROW = '[data-heart-crm-row-id="lead-demo-001"]';

function watchBrowserQuality(page: Page) {
  const consoleErrors: string[] = [];
  const pageErrors: string[] = [];
  const productionRequests: string[] = [];

  page.on("console", (message) => {
    if (message.type() === "error") {
      consoleErrors.push(message.text());
    }
  });
  page.on("pageerror", (error) => {
    pageErrors.push(error.message);
  });
  page.on("request", (request) => {
    const url = request.url();
    const host = (() => {
      try {
        return new URL(url).hostname;
      } catch {
        return "";
      }
    })();
    const isLocalHost =
      host === "127.0.0.1" || host === "localhost" || host === "::1";
    if (
      !isLocalHost &&
      (host.endsWith("cloudfunctions.net") ||
        host === "identitytoolkit.googleapis.com" ||
        host === "firestore.googleapis.com")
    ) {
      productionRequests.push(url);
    }
  });

  return {
    assertClean() {
      expect(
        productionRequests,
        "Heart E2E must stay on local emulator endpoints",
      ).toEqual([]);
      expect(pageErrors, "Heart page errors").toEqual([]);
      expect(consoleErrors, "Heart console errors").toEqual([]);
    },
  };
}

async function login(page: Page, email: string) {
  await page.goto(HEART_LEADS_URL, { waitUntil: "domcontentloaded" });
  const loginForm = page.locator("[data-heart-login]");
  await expect(loginForm).toBeVisible({ timeout: 20_000 });
  await loginForm.locator('input[name="email"]').fill(email);
  await loginForm.locator('input[name="password"]').fill(HEART_PASSWORD);
  await loginForm.locator('button[type="submit"]').click();
}

async function openHeartNav(page: Page) {
  const viewportWidth = page.viewportSize()?.width || 1280;
  if (viewportWidth >= 1100) return;
  await page.locator('button[aria-label="Menue oeffnen"]').click();
}

async function clickHeartNav(page: Page, key: string) {
  await openHeartNav(page);
  await page.locator(`[data-nav-key="${key}"]`).click();
}

test.describe("Heart CRM emulator", () => {
  test("denies non-CEO users without showing CRM data", async ({ page }) => {
    test.setTimeout(45_000);
    const quality = watchBrowserQuality(page);

    await login(page, OWNER_EMAIL);

    await expect(page.locator(".heart-auth-card--denied")).toBeVisible({
      timeout: 20_000,
    });
    await expect(page.locator(".heart-auth-help")).toContainText(/CEO|Zugang/i);
    await expect(page.locator("[data-heart-crm-row='leads']")).toHaveCount(0);

    quality.assertClean();
  });

  test("keeps lead search focus and avatar DOM stable while filtering", async ({
    page,
  }) => {
    test.setTimeout(60_000);
    const quality = watchBrowserQuality(page);

    await login(page, HEART_EMAIL);

    await expect(page.locator("#leadsSearchInput")).toBeVisible({
      timeout: 25_000,
    });
    await expect(page.locator(SEEDED_LEAD_ROW)).toBeVisible({
      timeout: 25_000,
    });

    const rows = page.locator('[data-heart-crm-row="leads"]');
    const rowCountBefore = await rows.count();
    expect(rowCountBefore).toBeGreaterThan(0);

    const avatar = page.locator(
      `${SEEDED_LEAD_ROW} img[data-heart-crm-image-key="leads:lead-demo-001"]`,
    );
    await expect(avatar).toBeVisible();
    const avatarSrcBefore = await avatar.getAttribute("src");
    await avatar.evaluate((node) => {
      node.setAttribute("data-e2e-stable-node", "before-search");
    });

    const search = page.locator("#leadsSearchInput");
    await search.click();
    await search.pressSequentially("Local Heart", { delay: 15 });

    await expect(search).toBeFocused();
    await expect(page.locator(SEEDED_LEAD_ROW)).toBeVisible();
    await expect(rows).toHaveCount(rowCountBefore);
    await expect(avatar).toHaveAttribute(
      "data-e2e-stable-node",
      "before-search",
    );
    await expect(avatar).toHaveAttribute("src", avatarSrcBefore || "");
    await expect(
      page.locator('[data-heart-crm-list-stack="leads"]'),
    ).toHaveAttribute("data-heart-crm-search-query", "Local Heart");

    await page
      .locator(`${SEEDED_LEAD_ROW} [data-action="open-crm-editor"]`)
      .click();
    await expect(page.locator("#leadBusinessName")).toHaveValue(
      "Local Heart Lead",
    );
    await expect(page.locator("#leadInlineSaveBtn")).toBeEnabled();
    await page.locator("#leadModalClose").click();
    await expect(page.locator("#leadsSearchInput")).toHaveValue("Local Heart");

    await clickHeartNav(page, "crmCustomers");
    await expect(page.locator("#customersView")).toBeVisible({
      timeout: 20_000,
    });
    await clickHeartNav(page, "crmLeads");
    await expect(page.locator(SEEDED_LEAD_ROW)).toBeVisible({
      timeout: 25_000,
    });
    await expect(page.locator("#leadsSearchInput")).toHaveValue("Local Heart");

    quality.assertClean();
  });
});
