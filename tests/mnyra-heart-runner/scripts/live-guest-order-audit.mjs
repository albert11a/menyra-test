import fs from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright";

function asText(value, fallback = "") {
  const text = String(value || "").trim();
  return text || fallback;
}

function asNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function asBoolean(value, fallback = false) {
  if (value === undefined || value === null || value === "") return fallback;
  const safe = String(value).trim().toLowerCase();
  return safe === "1" || safe === "true" || safe === "yes" || safe === "on";
}

function nowStamp() {
  return new Date().toISOString().replace(/[.:TZ-]/g, "").slice(0, 14);
}

function uniqueList(...values) {
  const seen = new Set();
  return values
    .flatMap((value) => Array.isArray(value) ? value : [value])
    .map((item) => asText(item))
    .filter((item) => {
      if (!item) return false;
      const key = item.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

function percentile(values = [], target = 0.5) {
  const numeric = (Array.isArray(values) ? values : [])
    .map((value) => Number(value))
    .filter((value) => Number.isFinite(value) && value >= 0)
    .sort((left, right) => left - right);
  if (!numeric.length) return null;
  const factor = Math.max(0, Math.min(1, Number(target) || 0));
  const rank = Math.max(0, Math.min(numeric.length - 1, Math.ceil(factor * numeric.length) - 1));
  return Math.round(numeric[rank]);
}

function summarizeDurations(rows = [], key = "") {
  const values = rows
    .map((row) => Number(row?.timings?.[key]))
    .filter((value) => Number.isFinite(value) && value >= 0);
  if (!values.length) {
    return {
      p50Ms: null,
      p95Ms: null
    };
  }
  return {
    p50Ms: percentile(values, 0.5),
    p95Ms: percentile(values, 0.95)
  };
}

function buildRunUrl(baseUrl = "", tableNumber = 1, cacheKey = "") {
  const safeBaseUrl = asText(baseUrl);
  const url = new URL(safeBaseUrl);
  if (!asText(url.searchParams.get("src"))) {
    url.searchParams.set("src", "qr");
  }
  if (!asText(url.searchParams.get("tab"))) {
    url.searchParams.set("tab", "menu");
  }
  url.searchParams.set("table", String(Math.max(1, Math.round(asNumber(tableNumber, 1)))));
  if (cacheKey) {
    url.searchParams.set("hb", cacheKey);
  }
  return url.toString();
}

const NETWORK_PROFILES = Object.freeze({
  wifi: {
    label: "WiFi / native",
    emulate: false
  },
  slow4g: {
    label: "Slow 4G",
    emulate: true,
    latency: 180,
    downloadThroughput: Math.round((1.5 * 1024 * 1024) / 8),
    uploadThroughput: Math.round((750 * 1024) / 8),
    connectionType: "cellular3g"
  }
});

function parseNetworkProfiles(value = "") {
  const requested = asText(value)
    .split(",")
    .map((item) => asText(item).toLowerCase())
    .filter(Boolean);
  const selected = [];
  for (const key of (requested.length ? requested : ["wifi"])) {
    if (!NETWORK_PROFILES[key]) continue;
    if (!selected.includes(key)) selected.push(key);
  }
  return selected.length ? selected : ["wifi"];
}

async function applyNetworkProfile(cdp, profileKey = "wifi") {
  const profile = NETWORK_PROFILES[profileKey] || NETWORK_PROFILES.wifi;
  if (!cdp) {
    return {
      key: profileKey,
      ...profile
    };
  }
  if (!profile.emulate) {
    await cdp.send("Network.emulateNetworkConditions", {
      offline: false,
      latency: 0,
      downloadThroughput: -1,
      uploadThroughput: -1,
      connectionType: "none"
    }).catch(() => undefined);
    return {
      key: profileKey,
      ...profile
    };
  }
  await cdp.send("Network.emulateNetworkConditions", {
    offline: false,
    latency: profile.latency,
    downloadThroughput: profile.downloadThroughput,
    uploadThroughput: profile.uploadThroughput,
    connectionType: profile.connectionType
  }).catch(() => undefined);
  return {
    key: profileKey,
    ...profile
  };
}

async function waitForAnySelector(page, selectors = [], timeoutMs = 15000) {
  const safeSelectors = uniqueList(selectors);
  if (!safeSelectors.length) return "";
  const deadline = Date.now() + Math.max(1000, timeoutMs);
  while (Date.now() < deadline) {
    for (const selector of safeSelectors) {
      const locator = page.locator(selector).first();
      if (!await locator.count()) continue;
      if (!await locator.isVisible().catch(() => false)) continue;
      return selector;
    }
    await page.waitForTimeout(140).catch(() => undefined);
  }
  throw new Error(`selector-timeout:${safeSelectors.join(",")}`);
}

async function clickFirstVisible(page, selectors = [], timeoutMs = 8000) {
  const safeSelectors = uniqueList(selectors);
  if (!safeSelectors.length) return "";
  const deadline = Date.now() + Math.max(1000, timeoutMs);
  while (Date.now() < deadline) {
    for (const selector of safeSelectors) {
      const locator = page.locator(selector).first();
      if (!await locator.count()) continue;
      try {
        if (!await locator.isVisible().catch(() => false)) continue;
        await locator.click({ timeout: 2000 });
        return selector;
      } catch {
        // Continue trying while the UI settles.
      }
    }
    await page.waitForTimeout(120).catch(() => undefined);
  }
  return "";
}

async function waitForTextOutcome(page, {
  successTexts = [],
  failureTexts = [],
  successSelectors = [],
  failureSelectors = [],
  timeoutMs = 22000
} = {}) {
  const safeSuccessTexts = uniqueList(successTexts).map((item) => item.toLowerCase());
  const safeFailureTexts = uniqueList(failureTexts).map((item) => item.toLowerCase());
  const safeSuccessSelectors = uniqueList(successSelectors);
  const safeFailureSelectors = uniqueList(failureSelectors);
  const handle = await page.waitForFunction((payload) => {
    function isVisible(selector) {
      try {
        const node = document.querySelector(selector);
        if (!node) return false;
        if (!(node instanceof HTMLElement)) return false;
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

    for (const selector of payload.failureSelectors || []) {
      if (isVisible(selector)) return { kind: "failure", source: "selector", match: selector };
    }
    for (const selector of payload.successSelectors || []) {
      if (isVisible(selector)) return { kind: "success", source: "selector", match: selector };
    }

    const bodyText = String(document.body?.innerText || "").toLowerCase();
    for (const text of payload.failureTexts || []) {
      if (bodyText.includes(text)) return { kind: "failure", source: "text", match: text };
    }
    for (const text of payload.successTexts || []) {
      if (bodyText.includes(text)) return { kind: "success", source: "text", match: text };
    }
    return false;
  }, {
    successTexts: safeSuccessTexts,
    failureTexts: safeFailureTexts,
    successSelectors: safeSuccessSelectors,
    failureSelectors: safeFailureSelectors
  }, {
    timeout: Math.max(1500, timeoutMs)
  });
  return handle.jsonValue();
}

async function collectPerfMetrics(page) {
  try {
    return await page.evaluate(() => {
      const navEntries = performance.getEntriesByType("navigation");
      const nav = Array.isArray(navEntries) ? navEntries[navEntries.length - 1] : null;
      const paintEntries = performance.getEntriesByType("paint");
      const fcpEntry = (Array.isArray(paintEntries) ? paintEntries : []).find((entry) => entry?.name === "first-contentful-paint");
      return {
        domContentLoadedMs: Number.isFinite(nav?.domContentLoadedEventEnd) ? Math.round(nav.domContentLoadedEventEnd) : null,
        loadMs: Number.isFinite(nav?.loadEventEnd) ? Math.round(nav.loadEventEnd) : null,
        responseStartMs: Number.isFinite(nav?.responseStart) ? Math.round(nav.responseStart) : null,
        fcpMs: Number.isFinite(fcpEntry?.startTime) ? Math.round(fcpEntry.startTime) : null
      };
    });
  } catch {
    return {};
  }
}

async function readOptionalJsonFile(filePath = "") {
  const safePath = asText(filePath);
  if (!safePath) return {};
  try {
    const text = await fs.readFile(safePath, "utf8");
    return JSON.parse(text);
  } catch {
    return {};
  }
}

function resolveGuestConfig(config = {}) {
  const guest = config?.actions?.guest?.qrMenu || {};
  const guestRouteUrl = asText(
    config?.personas?.guest?.guestRouteUrl,
    guest.url
  );
  return {
    guestRouteUrl,
    menuVisibleSelectors: uniqueList(
      guest.menuVisibleSelector,
      "[data-menu-open]",
      "#menuDetailAddToCartBtn"
    ),
    productOpenSelectors: uniqueList(
      guest.productOpenSelector,
      "[data-menu-open]"
    ),
    detailVisibleSelectors: uniqueList(
      guest.productDetailVisibleSelector,
      guest.addToCartSelector,
      "#menuDetailAddToCartBtn",
      "#menuModal",
      "[data-menu-detail]"
    ),
    detailCloseSelectors: uniqueList(
      guest.productDetailCloseSelector,
      "#menuModalClose",
      "[data-menu-detail-close]"
    ),
    addToCartSelectors: uniqueList(
      guest.addToCartSelector,
      "#menuDetailAddToCartBtn"
    ),
    cartVisibleSelectors: uniqueList(
      guest.cartVisibleSelector,
      "[data-cart-checkout]",
      "[data-cart-qty]"
    ),
    cartVisibleTexts: uniqueList(
      guest.cartVisibleText,
      "Checkout starten",
      "Bestellung absenden",
      "Tischbestellung absenden",
      "wurde zum Warenkorb hinzugefuegt"
    ),
    orderOpenSelectors: uniqueList(
      guest.orderOpenSelector,
      "[data-cart-checkout='open']"
    ),
    orderTriggerSelectors: uniqueList(
      guest.orderTriggerSelector,
      "[data-cart-checkout='submit']"
    ),
    orderSuccessTexts: uniqueList(
      guest.orderSuccessTexts,
      "Bestellung gesendet",
      "Ihre Bestellung wird zubereitet und in Kuerze serviert."
    ),
    orderFailureTexts: uniqueList(
      guest.orderFailureTexts,
      "Bestellung konnte nicht gesendet werden."
    ),
    orderSuccessSelectors: uniqueList(guest.orderVerifySelector),
    orderFailureSelectors: uniqueList(guest.orderFailureSelector)
  };
}

async function runSingleOrderAttempt({
  browser,
  guestConfig,
  networkProfile = "wifi",
  tableNumber = 1,
  artifactDir = "",
  timeoutMs = 45000,
  delayAfterSubmitMs = 2500
} = {}) {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 }
  });
  const page = await context.newPage();
  const row = {
    tableNumber,
    networkProfile,
    pass: false,
    url: "",
    responseStatus: null,
    orderOutcome: "",
    orderMatch: "",
    timings: {
      navigationMs: 0,
      menuVisibleMs: 0,
      productOpenMs: 0,
      addToCartMs: 0,
      orderOpenMs: 0,
      orderSubmitMs: 0,
      orderOutcomeMs: 0,
      totalMs: 0
    },
    checks: {
      pageErrors: 0,
      consoleErrors: 0,
      requestFailures: 0,
      httpErrors: 0
    },
    requestFailureSamples: [],
    httpErrorSamples: [],
    notes: []
  };
  const startedAt = Date.now();

  page.on("pageerror", (error) => {
    row.checks.pageErrors += 1;
    if (row.notes.length < 8) row.notes.push(`pageerror:${asText(error?.message)}`);
  });
  page.on("console", (msg) => {
    if (msg.type() !== "error") return;
    row.checks.consoleErrors += 1;
    if (row.notes.length < 8) row.notes.push(`console:${msg.text()}`);
  });
  page.on("requestfailed", (request) => {
    const failure = String(request?.failure?.()?.errorText || "").toLowerCase();
    if (failure.includes("err_aborted")) return;
    row.checks.requestFailures += 1;
    if (row.requestFailureSamples.length < 6) {
      row.requestFailureSamples.push(`${request.method()} ${request.url()} :: ${request.failure()?.errorText || "failed"}`);
    }
  });
  page.on("response", (response) => {
    const status = Number(response.status());
    if (!Number.isFinite(status) || status < 400) return;
    row.checks.httpErrors += 1;
    if (row.httpErrorSamples.length < 6) {
      row.httpErrorSamples.push(`${response.request().method()} ${status} ${response.url()}`);
    }
  });

  try {
    const cdp = await context.newCDPSession(page).catch(() => null);
    if (cdp) {
      await cdp.send("Network.enable").catch(() => undefined);
      await cdp.send("Network.setCacheDisabled", { cacheDisabled: true }).catch(() => undefined);
      await applyNetworkProfile(cdp, networkProfile);
    }

    row.url = buildRunUrl(guestConfig.guestRouteUrl, tableNumber, `${Date.now()}`);
    const navigationStart = Date.now();
    const response = await page.goto(row.url, { waitUntil: "domcontentloaded", timeout: Math.max(12000, timeoutMs) });
    row.timings.navigationMs = Date.now() - navigationStart;
    row.responseStatus = response?.status?.() ?? null;
    if (!response || row.responseStatus >= 400) {
      throw new Error(`bad-response:${row.responseStatus ?? "none"}`);
    }
    await page.waitForSelector("body", { timeout: Math.max(8000, timeoutMs) });

    const menuStart = Date.now();
    await waitForAnySelector(page, guestConfig.menuVisibleSelectors, Math.max(8000, timeoutMs));
    row.timings.menuVisibleMs = Date.now() - menuStart;

    const productStart = Date.now();
    const openedProductSelector = await clickFirstVisible(page, guestConfig.productOpenSelectors, 12000);
    if (!openedProductSelector) {
      throw new Error("product-open-not-found");
    }
    await waitForAnySelector(page, guestConfig.detailVisibleSelectors, 12000);
    row.timings.productOpenMs = Date.now() - productStart;

    const addStart = Date.now();
    const addSelector = await clickFirstVisible(page, guestConfig.addToCartSelectors, 10000);
    if (!addSelector) {
      throw new Error("add-to-cart-not-found");
    }
    await waitForAnySelector(page, guestConfig.cartVisibleSelectors, 15000).catch(() => undefined);
    if (guestConfig.cartVisibleTexts.length) {
      await waitForTextOutcome(page, {
        successTexts: guestConfig.cartVisibleTexts,
        timeoutMs: 12000
      }).catch(() => undefined);
    }
    row.timings.addToCartMs = Date.now() - addStart;

    const openCheckoutStart = Date.now();
    let submitSelector = await clickFirstVisible(page, guestConfig.orderTriggerSelectors, 4000);
    if (!submitSelector) {
      await clickFirstVisible(page, guestConfig.orderOpenSelectors, 8000);
      submitSelector = await clickFirstVisible(page, guestConfig.orderTriggerSelectors, 12000);
    }
    row.timings.orderOpenMs = Date.now() - openCheckoutStart;
    if (!submitSelector) {
      throw new Error("order-submit-not-found");
    }

    const submitStart = Date.now();
    row.timings.orderSubmitMs = submitStart - openCheckoutStart;
    const outcome = await waitForTextOutcome(page, {
      successTexts: guestConfig.orderSuccessTexts,
      failureTexts: guestConfig.orderFailureTexts,
      successSelectors: guestConfig.orderSuccessSelectors,
      failureSelectors: guestConfig.orderFailureSelectors,
      timeoutMs: 25000
    }).catch(() => null);
    row.timings.orderOutcomeMs = Date.now() - submitStart;

    if (!outcome) {
      throw new Error("order-outcome-timeout");
    }
    row.orderOutcome = asText(outcome.kind);
    row.orderMatch = asText(outcome.match);
    if (outcome.kind !== "success") {
      throw new Error(`order-failure:${asText(outcome.match, "unknown")}`);
    }

    await page.waitForTimeout(Math.max(0, Math.round(asNumber(delayAfterSubmitMs, 0)))).catch(() => undefined);
    row.pass = true;
  } catch (error) {
    row.pass = false;
    row.notes.push(`error:${asText(error?.message, "unknown-error")}`);
    const fileName = `live-order-table-${tableNumber}-${networkProfile}-fail.png`;
    const screenshotPath = path.resolve(artifactDir, fileName);
    await page.screenshot({ path: screenshotPath, fullPage: true }).catch(() => undefined);
    row.failureScreenshot = screenshotPath;
  } finally {
    row.timings.totalMs = Date.now() - startedAt;
    row.performance = await collectPerfMetrics(page);
    await context.close().catch(() => undefined);
  }

  return row;
}

function buildRecommendations(rows = []) {
  const recommendations = [];
  const total = rows.length;
  const failed = rows.filter((row) => !row.pass);
  const orderTimeouts = rows.filter((row) => (row.notes || []).some((note) => String(note).includes("order-outcome-timeout")));
  const pendingSubmit = rows.filter((row) => (row.notes || []).some((note) => String(note).includes("order-submit-not-found")));
  const slowMenu = rows.filter((row) => Number(row.timings?.menuVisibleMs) >= 6000);
  const httpErrors = rows.filter((row) => Number(row.checks?.httpErrors) > 0);
  const consoleErrors = rows.filter((row) => Number(row.checks?.consoleErrors) > 0);

  if (failed.length) {
    recommendations.push("Bestellfluss robuster machen: Submit/Outcome-Logik im Checkout haerter absichern und doppelte Guardrails fuer Timeouts einfuehren.");
  }
  if (orderTimeouts.length || pendingSubmit.length) {
    recommendations.push("Checkout-CTA Stabilitaet verbessern: Open- und Submit-Buttons eindeutig verankern und nach Add-to-cart konsequent fokussieren.");
  }
  if (slowMenu.length) {
    recommendations.push("Menue-Initialrender beschleunigen: kritische Produktkarten und erste Bilder priorisieren, Rest strikt lazy laden.");
  }
  if (httpErrors.length) {
    recommendations.push("HTTP-Fehlerquellen in API/CDN analysieren und mit Retry/Backoff absichern.");
  }
  if (consoleErrors.length) {
    recommendations.push("Client-Console-Errors im Produktionspfad auf Null bringen (Error-Guard + defensive null checks).");
  }
  if (!recommendations.length && total > 0) {
    recommendations.push("Aktueller Live-Bestellpfad ist stabil; Fokus auf Lastspitzen-Tests mit hoeherer Parallelitaet und langsamen Netzprofilen.");
  }
  return recommendations;
}

async function main() {
  const rootDir = process.cwd();
  const configPath = path.resolve(rootDir, asText(process.env.MNYRA_HEART_PACK_CONFIG_FILE, "config/casarita-prod-config.json"));
  const config = await readOptionalJsonFile(configPath);
  const guestConfig = resolveGuestConfig(config);
  if (!guestConfig.guestRouteUrl) {
    throw new Error(`guestRouteUrl missing in ${configPath}`);
  }

  const iterations = Math.max(1, Math.round(asNumber(process.env.LIVE_ORDER_AUDIT_ITERATIONS, 3)));
  const startTable = Math.max(1, Math.round(asNumber(process.env.LIVE_ORDER_AUDIT_TABLE_START, 901)));
  const headless = asBoolean(process.env.LIVE_ORDER_AUDIT_HEADLESS, true);
  const timeoutMs = Math.max(12000, Math.round(asNumber(process.env.LIVE_ORDER_AUDIT_TIMEOUT_MS, 45000)));
  const minPassRatePct = Math.max(0, Math.min(100, Math.round(asNumber(process.env.LIVE_ORDER_AUDIT_MIN_PASS_RATE_PCT, 100))));
  const delayAfterSubmitMs = Math.max(0, Math.round(asNumber(process.env.LIVE_ORDER_AUDIT_DELAY_AFTER_SUBMIT_MS, 2500)));
  const networkProfiles = parseNetworkProfiles(process.env.LIVE_ORDER_AUDIT_NETWORK_PROFILES);
  const artifactDir = path.resolve(rootDir, "artifacts", `live-guest-order-audit-${nowStamp()}`);
  await fs.mkdir(artifactDir, { recursive: true });

  const browser = await chromium.launch({ headless });
  const rows = [];
  const startedAt = new Date().toISOString();

  try {
    let runIndex = 0;
    for (const profile of networkProfiles) {
      for (let iteration = 0; iteration < iterations; iteration += 1) {
        const tableNumber = startTable + runIndex;
        runIndex += 1;
        const row = await runSingleOrderAttempt({
          browser,
          guestConfig,
          networkProfile: profile,
          tableNumber,
          artifactDir,
          timeoutMs,
          delayAfterSubmitMs
        });
        rows.push(row);
      }
    }
  } finally {
    await browser.close().catch(() => undefined);
  }

  const passed = rows.filter((row) => row.pass).length;
  const failed = rows.length - passed;
  const passRatePct = Math.round((passed / Math.max(1, rows.length)) * 100);

  const byProfile = networkProfiles.map((profile) => {
    const scoped = rows.filter((row) => row.networkProfile === profile);
    const scopedPassed = scoped.filter((row) => row.pass).length;
    return {
      profile,
      label: asText(NETWORK_PROFILES[profile]?.label, profile),
      total: scoped.length,
      passed: scopedPassed,
      failed: scoped.length - scopedPassed,
      passRatePct: Math.round((scopedPassed / Math.max(1, scoped.length)) * 100),
      timings: {
        menuVisible: summarizeDurations(scoped, "menuVisibleMs"),
        addToCart: summarizeDurations(scoped, "addToCartMs"),
        orderOutcome: summarizeDurations(scoped, "orderOutcomeMs"),
        total: summarizeDurations(scoped, "totalMs")
      }
    };
  });

  const report = {
    runId: `live-guest-order-audit-${nowStamp()}`,
    startedAt,
    endedAt: new Date().toISOString(),
    configPath,
    guestRouteUrl: guestConfig.guestRouteUrl,
    iterationsPerProfile: iterations,
    tableStart: startTable,
    networkProfiles,
    timeoutMs,
    minPassRatePct,
    summary: {
      totalRuns: rows.length,
      passedRuns: passed,
      failedRuns: failed,
      passRatePct
    },
    byProfile,
    recommendations: buildRecommendations(rows),
    runs: rows
  };

  const reportPath = path.resolve(artifactDir, "live-guest-order-audit-report.json");
  await fs.writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  const stdoutSummary = {
    ok: passRatePct >= minPassRatePct,
    reportPath,
    summary: report.summary,
    byProfile,
    recommendations: report.recommendations
  };
  console.log(JSON.stringify(stdoutSummary, null, 2));
  if (passRatePct < minPassRatePct) {
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
