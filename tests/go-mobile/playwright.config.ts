import { defineConfig, devices } from "@playwright/test";

// Mnyra GO auf dem Telefon.
//
// Vier Geraete, und jedes steht fuer einen Fall, den es wirklich gibt:
// das kleinste iPhone, das noch verkauft wird; ein neues iPhone mit
// Aussparung; das Samsung, das in Kosovo am haeufigsten in der Hand liegt;
// und ein aelteres Samsung mit 360 Punkten Breite.
//
// Eine Einschraenkung steht am Anfang und nicht im Kleingedruckten: In dieser
// Umgebung gibt es nur Chromium. iPhone heisst hier "Bildschirm, Zeigergeraet
// und Kennung eines iPhones", nicht "WebKit". Alles, was an der Engine haengt,
// gehoert in die Handpruefung auf einem echten Geraet.
const CHROMIUM =
  process.env.MNYRA_E2E_CHROMIUM ||
  "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";

const SAMSUNG_INTERNET_UA =
  "Mozilla/5.0 (Linux; Android 14; SAMSUNG SM-S921B) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/26.0 Chrome/122.0.0.0 Mobile Safari/537.36";

export default defineConfig({
  testDir: ".",
  timeout: 120_000,
  expect: { timeout: 15_000 },
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [
    ["list"],
    ["json", { outputFile: "../../tests/go-mobile/report.json" }],
  ],
  outputDir: "../../tests/go-mobile/artifacts",
  use: {
    baseURL: process.env.MNYRA_E2E_BASE_URL || "http://127.0.0.1:5173",
    trace: "retain-on-failure",
    video: "off",
    locale: "sq-AL",
    timezoneId: "Europe/Belgrade",
    launchOptions: { executablePath: CHROMIUM },
  },
  projects: [
    {
      name: "iphone-13",
      use: { ...devices["iPhone 13"], browserName: "chromium" },
    },
    {
      name: "iphone-se",
      use: { ...devices["iPhone SE"], browserName: "chromium" },
    },
    {
      name: "iphone-17-pro-max",
      use: { ...devices["iPhone 17 Pro Max"], browserName: "chromium" },
    },
    {
      name: "galaxy-s24",
      use: {
        ...devices["Galaxy S24"],
        browserName: "chromium",
        userAgent: SAMSUNG_INTERNET_UA,
      },
    },
    {
      name: "galaxy-s9-plus",
      use: { ...devices["Galaxy S9+"], browserName: "chromium" },
    },
  ],
});
