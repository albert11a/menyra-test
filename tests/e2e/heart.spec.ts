import {
  createHeartDiagnosticLead,
  deleteHeartDiagnosticLead,
} from "./firebase-emulator-admin";
import { expect, test } from "./firebase-emulator-fixture";

const HEART_LEADS_URL =
  "/apps/mnyra-heart/index.html?firebase-emulator=1&view=crmLeads&sw-reset=1";
const HEART_EMAIL = "heart.local@example.test";
const HEART_PASSWORD = "local-test-password";
const PRODUCTION_HOST_PATTERN =
  /(cloudfunctions\.net|identitytoolkit\.googleapis\.com|firestore\.googleapis\.com|firebasestorage\.googleapis\.com|menyra-c0e68)/i;

function isProductionFirebaseRequest(requestUrl: string) {
  try {
    const { hostname } = new URL(requestUrl);
    if (hostname === "127.0.0.1" || hostname === "localhost") return false;
  } catch {
    return PRODUCTION_HOST_PATTERN.test(requestUrl);
  }
  return PRODUCTION_HOST_PATTERN.test(requestUrl);
}

async function loginToHeartLeads(page) {
  await page.goto(HEART_LEADS_URL, { waitUntil: "domcontentloaded" });
  await expect(page.locator("[data-heart-login]")).toBeVisible({
    timeout: 20_000,
  });
  await page
    .locator('[data-heart-login] input[name="email"]')
    .fill(HEART_EMAIL);
  await page
    .locator('[data-heart-login] input[name="password"]')
    .fill(HEART_PASSWORD);
  await page.locator("[data-heart-login]").press("Enter");
  await expect(page.locator("#leadsView")).toBeVisible({ timeout: 30_000 });
}

async function installHeartLeadDiagnostics(page) {
  await page.evaluate(() => {
    const win = window as any;
    win.__mnyraHeartLeadDiagStop?.();

    const getCards = () =>
      Array.from(document.querySelectorAll("[data-heart-lead-card]"));
    const getAvatarImages = () =>
      Array.from(
        document.querySelectorAll(
          "[data-heart-lead-card] img[data-heart-crm-avatar-image]",
        ),
      ) as HTMLImageElement[];
    const searchInput = () =>
      document.querySelector("#leadsSearchInput") as HTMLInputElement | null;
    const getActiveId = () =>
      document.activeElement instanceof HTMLElement
        ? document.activeElement.id || document.activeElement.tagName
        : "";
    const getAvatarSources = () =>
      getAvatarImages().map((image) => image.currentSrc || image.src || "");

    const diag = {
      initialCardCount: getCards().length,
      cardAdds: 0,
      cardRemoves: 0,
      avatarSrcChanges: 0,
      listEmptyTransitions: 0,
      searchFocusIn: 0,
      searchFocusOut: 0,
      searchFocusLostSamples: 0,
      samples: [] as Array<{
        reason: string;
        cardCount: number;
        avatarSources: string[];
        activeElementId: string;
        searchValue: string;
      }>,
    };

    let wasEmpty = diag.initialCardCount === 0;
    let searchWasFocused = false;
    const sample = (reason: string) => {
      const input = searchInput();
      diag.samples.push({
        reason,
        cardCount: getCards().length,
        avatarSources: getAvatarSources(),
        activeElementId: getActiveId(),
        searchValue: input?.value || "",
      });
    };
    sample("start");

    const observer = new MutationObserver((records) => {
      for (const record of records) {
        if (record.type === "childList") {
          diag.cardAdds += Array.from(record.addedNodes).filter(
            (node) =>
              node instanceof Element &&
              (node.matches("[data-heart-lead-card]") ||
                node.querySelector("[data-heart-lead-card]")),
          ).length;
          diag.cardRemoves += Array.from(record.removedNodes).filter(
            (node) =>
              node instanceof Element &&
              (node.matches("[data-heart-lead-card]") ||
                node.querySelector("[data-heart-lead-card]")),
          ).length;
        } else if (
          record.type === "attributes" &&
          record.target instanceof HTMLImageElement &&
          record.attributeName === "src" &&
          record.target.matches("[data-heart-crm-avatar-image]")
        ) {
          diag.avatarSrcChanges += 1;
        }
      }

      const isEmpty = getCards().length === 0;
      if (isEmpty && !wasEmpty) diag.listEmptyTransitions += 1;
      wasEmpty = isEmpty;
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["src"],
    });

    const focusInHandler = (event: FocusEvent) => {
      if ((event.target as HTMLElement | null)?.id === "leadsSearchInput") {
        diag.searchFocusIn += 1;
        searchWasFocused = true;
      }
    };
    const focusOutHandler = (event: FocusEvent) => {
      if ((event.target as HTMLElement | null)?.id === "leadsSearchInput") {
        diag.searchFocusOut += 1;
      }
    };
    document.addEventListener("focusin", focusInHandler);
    document.addEventListener("focusout", focusOutHandler);

    const focusTimer = window.setInterval(() => {
      const input = searchInput();
      if (
        searchWasFocused &&
        input &&
        input.value &&
        document.activeElement !== input
      ) {
        diag.searchFocusLostSamples += 1;
      }
    }, 50);

    win.__mnyraHeartLeadDiagStop = () => {
      observer.disconnect();
      document.removeEventListener("focusin", focusInHandler);
      document.removeEventListener("focusout", focusOutHandler);
      window.clearInterval(focusTimer);
      sample("stop");
      return diag;
    };
  });
}

async function stopHeartLeadDiagnostics(page) {
  return page.evaluate(() => {
    const win = window as any;
    return win.__mnyraHeartLeadDiagStop?.() || null;
  });
}

async function openHeartDrawer(page) {
  const menuButton = page.locator(".heart-icon-button--menu").first();
  await expect(menuButton).toBeVisible({ timeout: 10_000 });
  await menuButton.click();
}

test.describe("Heart Leads mobile clean-web diagnostics", () => {
  test("records Lead image, card, list and Search focus stability signals", async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name !== "mobile-chrome",
      "Heart Leads flicker diagnosis is mobile-first.",
    );
    test.setTimeout(75_000);

    const leadId = `heart-diagnostic-${Date.now()}`;
    const productionRequests: string[] = [];
    const consoleErrors: string[] = [];
    const permissionErrors: string[] = [];

    page.on("request", (request) => {
      const url = request.url();
      if (isProductionFirebaseRequest(url)) productionRequests.push(url);
    });
    page.on("console", (message) => {
      const text = message.text();
      if (message.type() === "error") consoleErrors.push(text);
      if (/permission-denied|false for '|PERMISSION_DENIED/i.test(text)) {
        permissionErrors.push(text);
      }
    });

    await deleteHeartDiagnosticLead(leadId);
    await createHeartDiagnosticLead(leadId);

    try {
      await loginToHeartLeads(page);
      const diagnosticCard = page.locator(
        `[data-heart-lead-card][data-crm-card-id="${leadId}"]`,
      );
      await expect(diagnosticCard).toBeVisible({ timeout: 30_000 });
      await expect(
        diagnosticCard.locator("[data-heart-crm-avatar-image]"),
      ).toHaveAttribute("src", /heart-diagnostic-logo\.jpg/);

      await installHeartLeadDiagnostics(page);
      const search = page.locator("#leadsSearchInput");
      await search.click();
      await page.keyboard.type("Diagnostic", { delay: 35 });
      await page.waitForTimeout(700);
      const duringSearch = await stopHeartLeadDiagnostics(page);
      const searchState = await page.evaluate(() => {
        const input = document.querySelector(
          "#leadsSearchInput",
        ) as HTMLInputElement | null;
        return {
          value: input?.value || "",
          activeId:
            document.activeElement instanceof HTMLElement
              ? document.activeElement.id
              : "",
          cardCount: document.querySelectorAll("[data-heart-lead-card]").length,
        };
      });

      await openHeartDrawer(page);
      await page.locator('[data-nav-key="crmCustomers"]').click();
      await expect(page.locator("#customersView")).toBeVisible({
        timeout: 20_000,
      });
      await openHeartDrawer(page);
      await page.locator('[data-nav-key="crmLeads"]').click();
      await expect(diagnosticCard).toBeVisible({ timeout: 30_000 });

      await page.reload({ waitUntil: "domcontentloaded" });
      await expect(page.locator("#leadsSearchInput")).toBeVisible({
        timeout: 30_000,
      });
      await expect(diagnosticCard).toBeVisible({ timeout: 30_000 });
      await page.locator("#leadsSearchInput").fill("Cafe");
      const afterReload = await page.evaluate(() => ({
        searchValue:
          (
            document.querySelector(
              "#leadsSearchInput",
            ) as HTMLInputElement | null
          )?.value || "",
        cardCount: document.querySelectorAll("[data-heart-lead-card]").length,
        avatarSources: Array.from(
          document.querySelectorAll(
            "[data-heart-lead-card] img[data-heart-crm-avatar-image]",
          ),
        ).map(
          (image) =>
            (image as HTMLImageElement).currentSrc ||
            (image as HTMLImageElement).src ||
            "",
        ),
      }));

      await testInfo.attach("heart-leads-mobile-diagnostics.json", {
        body: JSON.stringify(
          {
            leadId,
            duringSearch,
            searchState,
            afterReload,
            productionRequests,
            consoleErrors,
            permissionErrors,
          },
          null,
          2,
        ),
        contentType: "application/json",
      });

      expect(productionRequests).toEqual([]);
      expect(permissionErrors).toEqual([]);
      expect(searchState.value).toBe("Diagnostic");
      expect(searchState.activeId).toBe("leadsSearchInput");
      expect(searchState.cardCount).toBeGreaterThan(0);
      expect(afterReload.searchValue).toBe("Cafe");
      expect(afterReload.cardCount).toBeGreaterThan(0);
    } finally {
      await deleteHeartDiagnosticLead(leadId);
    }
  });
});
