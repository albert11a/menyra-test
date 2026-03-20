import fs from "node:fs/promises";
import path from "node:path";
import { SOCIAL_SELECTORS } from "../utils/selectors.mjs";

const AUTH_OPEN_SELECTOR = "[data-auth-open]:visible";
const PROFILE_NAV_SELECTOR = '[data-nav="profile"]';
const LOGOUT_SELECTOR = "#logoutBtn";

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

async function waitForShellEntry(page) {
  await Promise.race([
    page.waitForSelector(SOCIAL_SELECTORS.authForm, { timeout: 20000 }).catch(() => null),
    page.waitForSelector(SOCIAL_SELECTORS.appShell, { timeout: 20000 }).catch(() => null)
  ]);
}

async function isAuthenticatedSession(page) {
  const [profileNavCount, logoutCount, authOpenCount] = await Promise.all([
    page.locator(PROFILE_NAV_SELECTOR).count(),
    page.locator(LOGOUT_SELECTOR).count(),
    page.locator(AUTH_OPEN_SELECTOR).count()
  ]);
  return (profileNavCount > 0 || logoutCount > 0) && authOpenCount === 0;
}

async function openAuthFormFromGuestShell(page) {
  const authOpen = page.locator(AUTH_OPEN_SELECTOR).first();
  if (!await authOpen.count()) return false;
  await authOpen.click({ timeout: 10000 });
  await page.waitForSelector(SOCIAL_SELECTORS.authForm, { timeout: 15000 });
  return true;
}

export async function loginAsCeo(page, env, heart) {
  await page.goto(buildSocialUrl(env.socialBaseUrl), { waitUntil: "domcontentloaded" });
  await waitForShellEntry(page);

  if (await isAuthenticatedSession(page)) {
    heart.passModule("auth", "App shell already authenticated.");
    return;
  }

  if (!await page.locator(SOCIAL_SELECTORS.authForm).count()) {
    const opened = await openAuthFormFromGuestShell(page);
    if (!opened) {
      throw new Error("Smoke runner reached app shell without a visible auth entry point.");
    }
  }

  await page.fill(SOCIAL_SELECTORS.authEmail, env.ceoEmail);
  await page.fill(SOCIAL_SELECTORS.authPassword, env.ceoPassword);
  heart.addTimeline("Auth / Submit credentials", "running", "Submitting CEO credentials.");
  await Promise.all([
    page.locator(SOCIAL_SELECTORS.authForm).evaluate((form) => form.requestSubmit()),
    page.waitForLoadState("networkidle").catch(() => undefined)
  ]);
  await ensureAuthenticatedShell(page);
  if (!await isAuthenticatedSession(page)) {
    throw new Error("CEO login completed without authenticated shell state.");
  }
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
