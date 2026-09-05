import { defineConfig, devices } from "@playwright/test";

// Der Header-Stabilitaetstest laeuft auf eigenen Geraeten und beiden Engines;
// die uebrigen e2e-Faelle bleiben unveraendert auf ihren beiden Projekten.
const SMART_HEADER_SPEC = /smart-header-stability\.spec\.ts/;

// Der Scroll-Test bringt seine Geraetegroessen selbst mit - fuenf Telefone,
// vom kleinsten aufwaerts. Er darf deshalb nicht zusaetzlich in jedem
// Geraeteprojekt laufen: Das waere dieselbe Messung mehrfach, nur unter
// falschem Namen.
const SCROLL_SPEC = /lifeskin-kein-scrollen\.spec\.ts/;

export default defineConfig({
  testDir: ".",
  timeout: 30_000,
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: process.env.MNYRA_E2E_BASE_URL || "http://127.0.0.1:5173",
    trace: "retain-on-failure",
    // In Umgebungen mit vorinstalliertem Browser (z.B. Claude-Code-Web) zeigt
    // MNYRA_E2E_CHROMIUM auf die Chromium-Binary, statt neu herunterzuladen.
    // Gilt nur fuer Chromium-Projekte; WebKit-Projekte brauchen ihre eigene
    // Installation.
    launchOptions: process.env.MNYRA_E2E_CHROMIUM
      ? { executablePath: process.env.MNYRA_E2E_CHROMIUM }
      : {},
  },
  webServer: process.env.MNYRA_E2E_BASE_URL
    ? undefined
    : {
        command: "node scripts/local-dev-server.mjs",
        url: "http://127.0.0.1:5173/apps/menyra-social/index.html",
        cwd: "../..",
        reuseExistingServer: true,
        timeout: 60_000,
      },
  projects: [
    {
      name: "chromium",
      testIgnore: [SMART_HEADER_SPEC, SCROLL_SPEC],
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "mobile-chrome",
      testIgnore: [SMART_HEADER_SPEC, SCROLL_SPEC],
      use: { ...devices["Pixel 5"] },
    },
    // Die Telefone, auf denen wirklich gescrollt wuerde.
    {
      name: "lifeskin-telefone",
      testMatch: SCROLL_SPEC,
      use: { ...devices["Desktop Chrome"] },
    },
    // Nachgemessen wird auf beiden Engines. WebKit ist dabei nicht optional:
    // die Engine, auf der der Riss auftrat, ist die von jedem iPhone - auch
    // in Chrome.
    {
      name: "webkit-iphone-13",
      testMatch: SMART_HEADER_SPEC,
      use: { ...devices["iPhone 13"] },
    },
    {
      name: "webkit-iphone-14-pro-max",
      testMatch: SMART_HEADER_SPEC,
      use: { ...devices["iPhone 14 Pro Max"] },
    },
    {
      name: "chromium-galaxy-s9",
      testMatch: SMART_HEADER_SPEC,
      use: { ...devices["Galaxy S9+"] },
    },
    {
      name: "chromium-galaxy-tab-s4",
      testMatch: SMART_HEADER_SPEC,
      use: { ...devices["Galaxy Tab S4"] },
    },
  ],
});
