import fs from "node:fs/promises";
import path from "node:path";
import { SOCIAL_SELECTORS, SOCIAL_TABS, WAITER_SELECTORS } from "../utils/selectors.mjs";

const AUTH_OPEN_SELECTOR = "[data-auth-open]:visible";
const PROFILE_NAV_SELECTOR = '[data-nav="profile"]';
const SOCIAL_LOGOUT_SELECTOR = "#logoutBtn";

function asText(value, fallback = "") {
  const text = String(value || "").trim();
  return text || fallback;
}

function toList(value = []) {
  if (Array.isArray(value)) {
    return value.map((item) => asText(item)).filter(Boolean);
  }
  const safeValue = asText(value);
  return safeValue ? [safeValue] : [];
}

function uniqueList(values = []) {
  const seen = new Set();
  return toList(values).filter((item) => {
    const key = item.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function buildUrl(baseUrl, {
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

export async function writeTextArtifact(env, name, content) {
  const filePath = path.resolve(env.artifactDir, name);
  await fs.writeFile(filePath, content, "utf8");
  return filePath;
}

async function waitForSocialEntry(page) {
  await Promise.race([
    page.waitForSelector(SOCIAL_SELECTORS.authForm, { timeout: 20000 }).catch(() => null),
    page.waitForSelector(SOCIAL_SELECTORS.appShell, { timeout: 20000 }).catch(() => null)
  ]);
}

async function isAuthenticatedSocialSession(page) {
  const [profileNavCount, logoutCount, authOpenCount] = await Promise.all([
    page.locator(PROFILE_NAV_SELECTOR).count(),
    page.locator(SOCIAL_LOGOUT_SELECTOR).count(),
    page.locator(AUTH_OPEN_SELECTOR).count()
  ]);
  return (profileNavCount > 0 || logoutCount > 0) && authOpenCount === 0;
}

async function openSocialAuthForm(page) {
  const authOpen = page.locator(AUTH_OPEN_SELECTOR).first();
  if (!await authOpen.count()) return false;
  await authOpen.click({ timeout: 10000 });
  await page.waitForSelector(SOCIAL_SELECTORS.authForm, { timeout: 15000 });
  return true;
}

export async function ensureSocialShell(page) {
  await page.waitForSelector(SOCIAL_SELECTORS.appShell, { timeout: 30000 });
}

export async function loginSocialPersona(page, persona, heart, {
  moduleKey = "auth",
  notePrefix = ""
} = {}) {
  await page.goto(buildUrl(persona.baseUrl), { waitUntil: "domcontentloaded" });
  await waitForSocialEntry(page);

  if (await isAuthenticatedSocialSession(page)) {
    heart.passModule(moduleKey, `${notePrefix}session already authenticated.`, {
      action: `${moduleKey} login`,
      persona: persona.key,
      area: moduleKey
    });
    return;
  }

  if (!await page.locator(SOCIAL_SELECTORS.authForm).count()) {
    const opened = await openSocialAuthForm(page);
    if (!opened) {
      throw new Error("Social app shell loaded without a visible auth entry point.");
    }
  }

  await page.fill(SOCIAL_SELECTORS.authEmail, persona.email);
  await page.fill(SOCIAL_SELECTORS.authPassword, persona.password);
  heart.addTimeline(`${persona.label} / Submit credentials`, "running", `Submitting credentials for ${persona.label}.`, {
    module: moduleKey,
    area: moduleKey,
    persona: persona.key
  });
  await Promise.all([
    page.locator(SOCIAL_SELECTORS.authForm).evaluate((form) => form.requestSubmit()),
    page.waitForLoadState("networkidle").catch(() => undefined)
  ]);
  await ensureSocialShell(page);
  if (!await isAuthenticatedSocialSession(page)) {
    throw new Error(`${persona.label} login completed without authenticated shell state.`);
  }
  heart.passModule(moduleKey, `${notePrefix}${persona.label} login and shell bootstrap succeeded.`, {
    action: `${moduleKey} login`,
    persona: persona.key,
    area: moduleKey
  });
}

export async function openSocialTab(page, persona, heart, tabKey, {
  moduleKey,
  note,
  absolute = ""
} = {}) {
  const targetUrl = buildUrl(persona.baseUrl, { tab: tabKey, absolute });
  heart.addTimeline(`${persona.label} / Open ${moduleKey || tabKey}`, "running", note || `Navigating to ${targetUrl}`, {
    module: moduleKey || tabKey,
    area: moduleKey || tabKey,
    persona: persona.key
  });
  await page.goto(targetUrl, { waitUntil: "domcontentloaded" });
  await ensureSocialShell(page);
  if (moduleKey) {
    heart.passModule(moduleKey, note || `${moduleKey} surface loaded via tab navigation.`, {
      action: `${moduleKey} surface load`,
      persona: persona.key,
      area: moduleKey
    });
  }
}

export async function openPageAndWait(page, url, selector, heart, {
  title = "Open page",
  moduleKey = "surface",
  area = "",
  persona = "",
  note = ""
} = {}) {
  heart.addTimeline(title, "running", note || `Navigating to ${url}`, {
    module: moduleKey,
    area: area || moduleKey,
    persona
  });
  await page.goto(url, { waitUntil: "domcontentloaded" });
  await page.waitForSelector(selector, { timeout: 30000 });
}

async function findFirstVisibleDomSelector(page, selectors = []) {
  const safeSelectors = uniqueList(selectors);
  if (!safeSelectors.length) return "";
  return page.evaluate((selectorList) => {
    const isVisibleNode = (node) => {
      if (!(node instanceof HTMLElement)) return false;
      const style = window.getComputedStyle(node);
      if (style.display === "none" || style.visibility === "hidden" || Number(style.opacity || "1") === 0) {
        return false;
      }
      const rect = node.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0;
    };
    for (const selector of selectorList) {
      const nodes = Array.from(document.querySelectorAll(selector));
      if (nodes.some((node) => isVisibleNode(node))) {
        return selector;
      }
    }
    return "";
  }, safeSelectors);
}

async function clickFirstVisibleDomSelector(page, selectors = []) {
  const safeSelectors = uniqueList(selectors);
  if (!safeSelectors.length) return "";
  return page.evaluate((selectorList) => {
    const isVisibleNode = (node) => {
      if (!(node instanceof HTMLElement)) return false;
      const style = window.getComputedStyle(node);
      if (style.display === "none" || style.visibility === "hidden" || Number(style.opacity || "1") === 0) {
        return false;
      }
      const rect = node.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0;
    };
    for (const selector of selectorList) {
      const nodes = Array.from(document.querySelectorAll(selector));
      const node = nodes.find((entry) => isVisibleNode(entry));
      if (node instanceof HTMLElement) {
        node.click();
        return selector;
      }
    }
    return "";
  }, safeSelectors);
}

export async function ensureElementVisible(page, selector, timeout = 15000) {
  const matchedSelector = await waitForAnySelector(page, [selector], timeout);
  if (!matchedSelector) {
    throw new Error(`Heart konnte kein sichtbares Element fuer ${selector} finden.`);
  }
}

export async function clickIfPresent(page, selector, timeout = 8000) {
  return !!await clickFirstVisible(page, [selector], timeout);
}

export async function findVisibleSelector(page, selectors = []) {
  return findFirstVisibleDomSelector(page, selectors);
}

export async function clickFirstVisible(page, selectors = [], timeout = 8000) {
  const safeSelectors = uniqueList(selectors);
  if (!safeSelectors.length) return "";
  const deadline = Date.now() + Math.max(250, Number(timeout) || 0);
  while (Date.now() < deadline) {
    const selector = await findVisibleSelector(page, safeSelectors);
    if (selector) {
      const clickedSelector = await clickFirstVisibleDomSelector(page, [selector]);
      if (clickedSelector) return clickedSelector;
    }
    await page.waitForTimeout(120).catch(() => undefined);
  }
  return "";
}

export async function fillIfPresent(page, selector, value, timeout = 8000) {
  const locator = page.locator(selector).first();
  if (!await locator.count()) return false;
  try {
    await locator.fill(value, { timeout });
  } catch {
    await locator.evaluate((node, nextValue) => {
      if (!node) return;
      if ("value" in node) {
        node.value = String(nextValue ?? "");
      }
      node.dispatchEvent(new Event("input", { bubbles: true }));
      node.dispatchEvent(new Event("change", { bubbles: true }));
    }, value);
  }
  return true;
}

export async function setInputFilesIfPresent(page, selector, files) {
  const locator = page.locator(selector).first();
  if (!await locator.count()) return false;
  await locator.setInputFiles(files);
  return true;
}

export async function waitForText(page, text, timeout = 10000) {
  if (!asText(text)) return false;
  await page.getByText(text, { exact: false }).first().waitFor({ state: "visible", timeout });
  return true;
}

export async function waitForTextToDisappear(page, text, timeout = 10000) {
  const safeText = asText(text);
  if (!safeText) return false;
  await page.waitForFunction(
    (expectedText) => {
      const bodyText = String(document.body?.innerText || "");
      return !bodyText.includes(expectedText);
    },
    safeText,
    { timeout }
  );
  return true;
}

export async function waitForSelectorToDisappear(page, selector, timeout = 10000) {
  const safeSelector = asText(selector);
  if (!safeSelector) return false;
  await page.waitForFunction(
    (selectorValue) => {
      const node = document.querySelector(selectorValue);
      if (!node) return true;
      const style = window.getComputedStyle(node);
      if (style.display === "none" || style.visibility === "hidden" || Number(style.opacity || "1") === 0) {
        return true;
      }
      const rect = node.getBoundingClientRect();
      return rect.width === 0 || rect.height === 0;
    },
    safeSelector,
    { timeout }
  );
  return true;
}

export async function waitForAnyText(page, texts = [], timeout = 10000) {
  const safeTexts = uniqueList(texts);
  if (!safeTexts.length) return false;
  await page.waitForFunction(
    (expectedTexts) => {
      const bodyText = String(document.body?.innerText || "").toLowerCase();
      return expectedTexts.some((item) => bodyText.includes(item));
    },
    safeTexts.map((item) => item.toLowerCase()),
    { timeout }
  );
  return true;
}

export async function waitForAnySelector(page, selectors = [], timeout = 15000) {
  const safeSelectors = uniqueList(selectors);
  if (!safeSelectors.length) return false;
  const deadline = Date.now() + Math.max(250, Number(timeout) || 0);
  while (Date.now() < deadline) {
    const selector = await findFirstVisibleDomSelector(page, safeSelectors);
    if (selector) return selector;
    await page.waitForTimeout(120).catch(() => undefined);
  }
  throw new Error(`Heart konnte keinen sichtbaren Selector finden: ${safeSelectors.join(", ")}`);
}

export async function waitForUiOutcome(page, {
  successSelectors = [],
  successTexts = [],
  failureSelectors = [],
  failureTexts = [],
  timeout = 15000
} = {}) {
  const safeSuccessSelectors = uniqueList(successSelectors);
  const safeFailureSelectors = uniqueList(failureSelectors);
  const safeSuccessTexts = uniqueList(successTexts).map((item) => item.toLowerCase());
  const safeFailureTexts = uniqueList(failureTexts).map((item) => item.toLowerCase());
  if (
    !safeSuccessSelectors.length
    && !safeFailureSelectors.length
    && !safeSuccessTexts.length
    && !safeFailureTexts.length
  ) {
    return false;
  }
  const handle = await page.waitForFunction(
    ({
      successSelectorList,
      successTextList,
      failureSelectorList,
      failureTextList
    }) => {
      function isVisible(selector) {
        try {
          const node = document.querySelector(selector);
          if (!node) return false;
          const style = window.getComputedStyle(node);
          if (style.display === "none" || style.visibility === "hidden" || Number(style.opacity || "1") === 0) {
            return false;
          }
          const rect = node.getBoundingClientRect();
          return rect.width > 0 && rect.height > 0;
        } catch {
          return false;
        }
      }

      for (const selector of failureSelectorList) {
        if (isVisible(selector)) {
          return { kind: "failure", source: "selector", match: selector };
        }
      }
      for (const selector of successSelectorList) {
        if (isVisible(selector)) {
          return { kind: "success", source: "selector", match: selector };
        }
      }

      const bodyText = String(document.body?.innerText || "").toLowerCase();
      for (const text of failureTextList) {
        if (bodyText.includes(text)) {
          return { kind: "failure", source: "text", match: text };
        }
      }
      for (const text of successTextList) {
        if (bodyText.includes(text)) {
          return { kind: "success", source: "text", match: text };
        }
      }
      return false;
    },
    {
      successSelectorList: safeSuccessSelectors,
      successTextList: safeSuccessTexts,
      failureSelectorList: safeFailureSelectors,
      failureTextList: safeFailureTexts
    },
    { timeout }
  );
  return handle.jsonValue();
}

export async function readCountValue(page, selector) {
  const safeSelector = asText(selector);
  if (!safeSelector) return null;
  const locator = page.locator(safeSelector).first();
  if (!await locator.count()) return null;
  const text = await locator.textContent().catch(() => "");
  const match = String(text || "").match(/-?\d+/);
  return match ? Number(match[0]) : null;
}

export async function waitForCountChange(page, selector, previousValue, timeout = 10000) {
  if (!selector || previousValue === null || previousValue === undefined) return false;
  await page.waitForFunction(
    ({ selector: selectorValue, previous }) => {
      const node = document.querySelector(selectorValue);
      if (!node) return false;
      const match = String(node.textContent || "").match(/-?\d+/);
      return match && Number(match[0]) !== Number(previous);
    },
    { selector, previous: previousValue },
    { timeout }
  );
  return true;
}

export async function assertPwaPresence(page, manifestSelector = SOCIAL_SELECTORS.manifestLink) {
  const manifestLink = await page.locator(manifestSelector).count();
  const serviceWorkerSupport = await page.evaluate(() => "serviceWorker" in navigator);
  return {
    manifestLink: manifestLink > 0,
    serviceWorkerSupport
  };
}

export async function loginWaiterPersona(page, persona, heart, {
  moduleKey = "auth"
} = {}) {
  await page.goto(persona.baseUrl, { waitUntil: "domcontentloaded" });
  await Promise.race([
    page.waitForSelector(WAITER_SELECTORS.loginForm, { timeout: 20000 }).catch(() => null),
    page.waitForSelector(WAITER_SELECTORS.logoutButton, { timeout: 20000 }).catch(() => null)
  ]);

  if (await page.locator(WAITER_SELECTORS.logoutButton).count()) {
    heart.passModule(moduleKey, `${persona.label} session already authenticated.`, {
      action: `${moduleKey} login`,
      persona: persona.key,
      area: moduleKey
    });
    return;
  }

  await page.fill(WAITER_SELECTORS.loginEmail, persona.email);
  await page.fill(WAITER_SELECTORS.loginPassword, persona.password);
  heart.addTimeline(`${persona.label} / Submit waiter credentials`, "running", `Submitting credentials for ${persona.label}.`, {
    module: moduleKey,
    area: moduleKey,
    persona: persona.key
  });
  await Promise.all([
    page.locator(WAITER_SELECTORS.loginForm).evaluate((form) => form.requestSubmit()),
    page.waitForLoadState("networkidle").catch(() => undefined)
  ]);
  await page.waitForSelector(WAITER_SELECTORS.logoutButton, { timeout: 30000 });
  heart.passModule(moduleKey, `${persona.label} waiter access loaded.`, {
    action: `${moduleKey} login`,
    persona: persona.key,
    area: moduleKey
  });
}

export async function ensureWaiterShell(page) {
  await page.waitForSelector(WAITER_SELECTORS.mainShell, { timeout: 30000 });
}

export async function openWaiterSurface(page, persona, heart, {
  absolute = "",
  moduleKey = "orders",
  note = ""
} = {}) {
  const targetUrl = buildUrl(persona.baseUrl, { absolute });
  heart.addTimeline(`${persona.label} / Open ${moduleKey}`, "running", note || `Navigating to ${targetUrl}`, {
    module: moduleKey,
    area: moduleKey,
    persona: persona.key
  });
  await page.goto(targetUrl, { waitUntil: "domcontentloaded" });
  await ensureWaiterShell(page);
  heart.passModule(moduleKey, note || `${moduleKey} surface loaded.`, {
    action: `${moduleKey} surface load`,
    persona: persona.key,
    area: moduleKey
  });
}

export function getSocialDefaultTabs() {
  return SOCIAL_TABS;
}
