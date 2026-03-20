import fs from "node:fs/promises";
import path from "node:path";
import { SOCIAL_SELECTORS } from "../utils/selectors.mjs";

function asText(value, fallback = "") {
  const text = String(value || "").trim();
  return text || fallback;
}

export function buildSocialUrl(baseUrl, {
  tab = "",
  absolute = ""
} = {}) {
  if (absolute) return absolute;
  const url = new URL(baseUrl);
  if (tab) url.searchParams.set("tab", tab);
  return url.toString();
}

export async function captureArtifact(page, env, name) {
  const safeName = String(name || "artifact").replace(/[^a-z0-9_-]+/gi, "-").toLowerCase();
  const filePath = path.resolve(env.artifactDir, `${safeName}.png`);
  await page.screenshot({ path: filePath, fullPage: true });
  return filePath;
}

export async function ensureAuthenticatedShell(page) {
  await page.waitForSelector(SOCIAL_SELECTORS.appShell, { timeout: 30000 });
}

export async function loginAsCeo(page, env, heart) {
  await page.goto(buildSocialUrl(env.socialBaseUrl), { waitUntil: "domcontentloaded" });
  await Promise.race([
    page.waitForSelector(SOCIAL_SELECTORS.authForm, { timeout: 12000 }).catch(() => null),
    page.waitForSelector(SOCIAL_SELECTORS.appShell, { timeout: 12000 }).catch(() => null)
  ]);

  if (await page.locator(SOCIAL_SELECTORS.appShell).count()) {
    heart.passModule("auth", "App shell already authenticated.");
    return;
  }

  await page.fill(SOCIAL_SELECTORS.authEmail, env.ceoEmail);
  await page.fill(SOCIAL_SELECTORS.authPassword, env.ceoPassword);
  heart.addTimeline("Auth / Submit credentials", "running", "Submitting CEO credentials.");
  await Promise.all([
    page.locator(SOCIAL_SELECTORS.authForm).evaluate((form) => form.requestSubmit()),
    page.waitForLoadState("networkidle").catch(() => undefined)
  ]);
  await ensureAuthenticatedShell(page);
  heart.passModule("auth", "CEO login and shell bootstrap succeeded.");
}

export async function openTab(page, env, tabKey, heart, {
  moduleKey,
  note,
  absolute = ""
} = {}) {
  const targetUrl = buildSocialUrl(env.socialBaseUrl, { tab: tabKey, absolute });
  heart.addTimeline(`Open ${moduleKey || tabKey}`, "running", note || `Navigating to ${targetUrl}`);
  await page.goto(targetUrl, { waitUntil: "domcontentloaded" });
  await ensureAuthenticatedShell(page);
  if (moduleKey) {
    heart.passModule(moduleKey, note || `${moduleKey} surface loaded via tab navigation.`);
  }
}

export async function assertPwaPresence(page) {
  const manifestLink = await page.locator(SOCIAL_SELECTORS.manifestLink).count();
  const serviceWorkerSupport = await page.evaluate(() => "serviceWorker" in navigator);
  return {
    manifestLink: manifestLink > 0,
    serviceWorkerSupport
  };
}

export async function writeTextArtifact(env, name, content) {
  const filePath = path.resolve(env.artifactDir, name);
  await fs.writeFile(filePath, content, "utf8");
  return filePath;
}
