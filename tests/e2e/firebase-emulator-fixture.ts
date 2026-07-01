import { expect, test as base, type Page } from "@playwright/test";

async function prepareFirebaseEmulatorPage(page: Page) {
  await page.addInitScript(() => {
    Object.defineProperty(globalThis, "__MENYRA_FIREBASE_EMULATORS__", {
      configurable: true,
      value: {
        enabled: true,
        projectId: "mnyra-local",
        host: "127.0.0.1",
        firestorePort: 8080,
        authPort: 9099,
        functionsPort: 5001,
      },
    });
  });
  await page.route(
    /^https:\/\/cdn\.tailwindcss\.com(?:\/.*)?$/,
    async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "text/javascript",
        body: "globalThis.tailwind = globalThis.tailwind || {};",
      });
    },
  );
  await page.route(
    /^https:\/\/images\.example\.local(?:\/.*)?$/,
    async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "image/svg+xml",
        body: '<svg xmlns="http://www.w3.org/2000/svg" width="120" height="80"><rect width="120" height="80" fill="#eef2f7"/></svg>',
      });
    },
  );
}

export const test = base.extend({
  page: async ({ page }, use) => {
    await prepareFirebaseEmulatorPage(page);
    await use(page);
  },
});

export { expect };
