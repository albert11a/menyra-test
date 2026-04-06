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
  const factor = Math.max(0, Math.min(1, asNumber(target, 0.5)));
  const index = Math.max(0, Math.min(numeric.length - 1, Math.ceil(factor * numeric.length) - 1));
  return Math.round(numeric[index]);
}

function summarizeMetric(rows = [], selector) {
  const values = rows
    .map((row) => selector(row))
    .map((value) => Number(value))
    .filter((value) => Number.isFinite(value) && value >= 0);
  if (!values.length) {
    return {
      p50: null,
      p95: null
    };
  }
  return {
    p50: percentile(values, 0.5),
    p95: percentile(values, 0.95)
  };
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
  const guestRouteUrl = asText(config?.personas?.guest?.guestRouteUrl, guest.url);
  return {
    guestRouteUrl,
    menuVisibleSelectors: uniqueList(
      guest.menuVisibleSelector,
      "[data-menu-open]",
      "#menuDetailAddToCartBtn",
      "[data-cart-checkout]"
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

function buildRunUrl(baseUrl = "", tableNumber = 1, hb = "") {
  const url = new URL(asText(baseUrl));
  if (!asText(url.searchParams.get("tab"))) {
    url.searchParams.set("tab", "menu");
  }
  if (!asText(url.searchParams.get("src"))) {
    url.searchParams.set("src", "qr");
  }
  url.searchParams.set("table", String(Math.max(1, Math.round(asNumber(tableNumber, 1)))));
  if (hb) url.searchParams.set("hb", hb);
  return url.toString();
}

async function applyNetworkProfile(cdp, profileKey = "wifi") {
  const profile = NETWORK_PROFILES[profileKey] || NETWORK_PROFILES.wifi;
  if (!cdp) {
    return profile;
  }
  if (!profile.emulate) {
    await cdp.send("Network.emulateNetworkConditions", {
      offline: false,
      latency: 0,
      downloadThroughput: -1,
      uploadThroughput: -1,
      connectionType: "none"
    }).catch(() => undefined);
    return profile;
  }
  await cdp.send("Network.emulateNetworkConditions", {
    offline: false,
    latency: profile.latency,
    downloadThroughput: profile.downloadThroughput,
    uploadThroughput: profile.uploadThroughput,
    connectionType: profile.connectionType
  }).catch(() => undefined);
  return profile;
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
    await page.waitForTimeout(120).catch(() => undefined);
  }
  throw new Error(`selector-timeout:${safeSelectors.join(",")}`);
}

async function clickFirstVisible(page, selectors = [], timeoutMs = 10000) {
  const safeSelectors = uniqueList(selectors);
  if (!safeSelectors.length) return "";
  const deadline = Date.now() + Math.max(1000, timeoutMs);
  while (Date.now() < deadline) {
    for (const selector of safeSelectors) {
      const locator = page.locator(selector).first();
      if (!await locator.count()) continue;
      try {
        if (!await locator.isVisible().catch(() => false)) continue;
        await locator.click({ timeout: 1800 });
        return selector;
      } catch {
        // Keep trying while hydration settles.
      }
    }
    await page.waitForTimeout(120).catch(() => undefined);
  }
  return "";
}

async function waitForOutcome(page, {
  successTexts = [],
  failureTexts = [],
  successSelectors = [],
  failureSelectors = [],
  timeoutMs = 25000
} = {}) {
  const safeSuccessTexts = uniqueList(successTexts).map((item) => item.toLowerCase());
  const safeFailureTexts = uniqueList(failureTexts).map((item) => item.toLowerCase());
  const safeSuccessSelectors = uniqueList(successSelectors);
  const safeFailureSelectors = uniqueList(failureSelectors);
  const handle = await page.waitForFunction((payload) => {
    function isVisible(selector) {
      try {
        const node = document.querySelector(selector);
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
    timeout: Math.max(1000, timeoutMs)
  });
  return handle.jsonValue();
}

async function readImageState(page) {
  return page.evaluate(() => {
    function isVisibleNode(node) {
      if (!(node instanceof HTMLElement)) return false;
      const style = window.getComputedStyle(node);
      if (style.display === "none" || style.visibility === "hidden" || Number(style.opacity || "1") === 0) {
        return false;
      }
      const rect = node.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0;
    }
    const images = Array.from(document.images || []).filter((node) => isVisibleNode(node));
    let loaded = 0;
    let pending = 0;
    let broken = 0;
    for (const image of images) {
      if (!(image instanceof HTMLImageElement)) continue;
      if (!image.complete) {
        pending += 1;
        continue;
      }
      if (Number(image.naturalWidth || 0) <= 0 || Number(image.naturalHeight || 0) <= 0) {
        broken += 1;
        continue;
      }
      loaded += 1;
    }
    const total = images.length;
    return {
      totalVisible: total,
      loaded,
      pending,
      broken,
      loadedRatio: total > 0 ? Number((loaded / total).toFixed(3)) : 1
    };
  }).catch(() => ({
    totalVisible: 0,
    loaded: 0,
    pending: 0,
    broken: 0,
    loadedRatio: 1
  }));
}

async function collectPerfMetrics(page) {
  try {
    return await page.evaluate(() => {
      const navEntries = performance.getEntriesByType("navigation");
      const nav = Array.isArray(navEntries) ? navEntries[navEntries.length - 1] : null;
      const paintEntries = performance.getEntriesByType("paint");
      const fcp = (Array.isArray(paintEntries) ? paintEntries : []).find((entry) => entry?.name === "first-contentful-paint");
      return {
        domContentLoadedMs: Number.isFinite(nav?.domContentLoadedEventEnd) ? Math.round(nav.domContentLoadedEventEnd) : null,
        loadMs: Number.isFinite(nav?.loadEventEnd) ? Math.round(nav.loadEventEnd) : null,
        responseStartMs: Number.isFinite(nav?.responseStart) ? Math.round(nav.responseStart) : null,
        fcpMs: Number.isFinite(fcp?.startTime) ? Math.round(fcp.startTime) : null
      };
    });
  } catch {
    return {};
  }
}

async function runSingleOrderFlow({
  browser,
  guestConfig,
  index = 0,
  tableNumber = 1,
  networkProfile = "wifi",
  artifactDir = "",
  timeoutMs = 45000
} = {}) {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 }
  });
  const page = await context.newPage();
  const row = {
    index,
    tableNumber,
    networkProfile,
    url: "",
    pass: false,
    responseStatus: null,
    orderOutcome: "",
    orderMatch: "",
    timings: {
      navigationMs: 0,
      menuVisibleMs: 0,
      productOpenMs: 0,
      addToCartMs: 0,
      orderOutcomeMs: 0,
      totalMs: 0
    },
    images: {
      menuImmediate: null,
      menuAfter1200ms: null,
      detailAfterOpen: null
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

    row.url = buildRunUrl(guestConfig.guestRouteUrl, tableNumber, `${Date.now()}-${index}`);
    const navStart = Date.now();
    const response = await page.goto(row.url, { waitUntil: "domcontentloaded", timeout: Math.max(8000, timeoutMs) });
    row.timings.navigationMs = Date.now() - navStart;
    row.responseStatus = response?.status?.() ?? null;
    if (!response || row.responseStatus >= 400) {
      throw new Error(`bad-response:${row.responseStatus ?? "none"}`);
    }
    await page.waitForSelector("body", { timeout: Math.max(8000, timeoutMs) });

    const menuStart = Date.now();
    await waitForAnySelector(page, guestConfig.menuVisibleSelectors, Math.max(8000, timeoutMs));
    row.timings.menuVisibleMs = Date.now() - menuStart;
    row.images.menuImmediate = await readImageState(page);
    await page.waitForTimeout(1200).catch(() => undefined);
    row.images.menuAfter1200ms = await readImageState(page);

    const openStart = Date.now();
    const openedSelector = await clickFirstVisible(page, guestConfig.productOpenSelectors, 12000);
    if (!openedSelector) {
      throw new Error("product-open-not-found");
    }
    await waitForAnySelector(page, guestConfig.detailVisibleSelectors, 12000);
    row.timings.productOpenMs = Date.now() - openStart;
    row.images.detailAfterOpen = await readImageState(page);

    const addStart = Date.now();
    const addSelector = await clickFirstVisible(page, guestConfig.addToCartSelectors, 12000);
    if (!addSelector) {
      throw new Error("add-to-cart-not-found");
    }
    await waitForAnySelector(page, guestConfig.cartVisibleSelectors, 15000).catch(() => undefined);
    row.timings.addToCartMs = Date.now() - addStart;

    let submitSelector = await clickFirstVisible(page, guestConfig.orderTriggerSelectors, 5000);
    if (!submitSelector) {
      await clickFirstVisible(page, guestConfig.orderOpenSelectors, 10000);
      submitSelector = await clickFirstVisible(page, guestConfig.orderTriggerSelectors, 12000);
    }
    if (!submitSelector) {
      throw new Error("order-submit-not-found");
    }
    const orderStart = Date.now();
    const outcome = await waitForOutcome(page, {
      successTexts: guestConfig.orderSuccessTexts,
      failureTexts: guestConfig.orderFailureTexts,
      successSelectors: guestConfig.orderSuccessSelectors,
      failureSelectors: guestConfig.orderFailureSelectors,
      timeoutMs: 25000
    });
    row.timings.orderOutcomeMs = Date.now() - orderStart;
    row.orderOutcome = asText(outcome?.kind);
    row.orderMatch = asText(outcome?.match);
    if (row.orderOutcome !== "success") {
      throw new Error(`order-failure:${row.orderMatch || "unknown"}`);
    }

    row.pass = true;
  } catch (error) {
    row.pass = false;
    row.notes.push(`error:${asText(error?.message, "unknown-error")}`);
    const screenshotPath = path.resolve(artifactDir, `load-order-fail-user-${index + 1}.png`);
    await page.screenshot({ path: screenshotPath, fullPage: true }).catch(() => undefined);
    row.failureScreenshot = screenshotPath;
  } finally {
    row.timings.totalMs = Date.now() - startedAt;
    row.performance = await collectPerfMetrics(page);
    await context.close().catch(() => undefined);
  }

  return row;
}

function buildRecommendations(report = {}) {
  const rows = Array.isArray(report.rows) ? report.rows : [];
  const passRate = asNumber(report.summary?.passRatePct, 0);
  const recommendations = [];
  const menuHalfLoadedRuns = rows.filter((row) => {
    const menu = row.images?.menuAfter1200ms || row.images?.menuImmediate;
    if (!menu) return false;
    return asNumber(menu.broken, 0) > 0 || asNumber(menu.pending, 0) > 0 || asNumber(menu.loadedRatio, 1) < 0.95;
  });
  const slowAddRuns = rows.filter((row) => asNumber(row.timings?.addToCartMs, 0) >= 2000);
  const slowTotalRuns = rows.filter((row) => asNumber(row.timings?.totalMs, 0) >= 12000);
  const requestFailRuns = rows.filter((row) => asNumber(row.checks?.requestFailures, 0) > 0);
  const consoleErrorRuns = rows.filter((row) => asNumber(row.checks?.consoleErrors, 0) > 0);

  if (passRate < 99) {
    recommendations.push("Bestellstabilitaet unter Last priorisieren: Checkout-Submit und Outcome-Handling idempotent + Retry-safe machen.");
  }
  if (menuHalfLoadedRuns.length) {
    recommendations.push("Bildpfad optimieren: kleinere responsive Bilder, strict lazy-loading fuer unterhalb des First Viewports, priorisierte Hero-Bilder.");
  }
  if (slowAddRuns.length) {
    recommendations.push("Add-to-cart beschleunigen: UI sofort optimistisch aktualisieren, Write-Bestaetigung asynchron und fehlertolerant behandeln.");
  }
  if (slowTotalRuns.length) {
    recommendations.push("Gesamtdauer senken: Menue-/Checkout-Daten frueher vorladen und nicht-kritische Runtime-Arbeit nach hinten schieben.");
  }
  if (requestFailRuns.length) {
    recommendations.push("Request-Failures unter Last mit Backoff/Retry und besserer Netzwerkbehandlung absichern.");
  }
  if (consoleErrorRuns.length) {
    recommendations.push("Console-Errors im Produktionspfad komplett entfernen, vor allem in Menue-/Order-Flow.");
  }
  if (!recommendations.length) {
    recommendations.push("Aktueller Lastlauf stabil; als naechstes mit hoeherer Concurrency und laengerem Dauerlauf wiederholen.");
  }
  return recommendations;
}

async function main() {
  const rootDir = process.cwd();
  const configFile = path.resolve(rootDir, asText(process.env.MNYRA_HEART_PACK_CONFIG_FILE, "config/casarita-prod-config.json"));
  const config = await readOptionalJsonFile(configFile);
  const guestConfig = resolveGuestConfig(config);
  if (!guestConfig.guestRouteUrl) {
    throw new Error(`guestRouteUrl missing in ${configFile}`);
  }

  const totalUsers = Math.max(1, Math.round(asNumber(process.env.LOAD_ORDER_TOTAL_USERS, 200)));
  const concurrency = Math.max(1, Math.min(totalUsers, Math.round(asNumber(process.env.LOAD_ORDER_CONCURRENCY, 25))));
  const tableStart = Math.max(1, Math.round(asNumber(process.env.LOAD_ORDER_TABLE_START, 1000)));
  const timeoutMs = Math.max(12000, Math.round(asNumber(process.env.LOAD_ORDER_TIMEOUT_MS, 45000)));
  const minPassRatePct = Math.max(0, Math.min(100, Math.round(asNumber(process.env.LOAD_ORDER_MIN_PASS_RATE_PCT, 99))));
  const networkProfile = asText(process.env.LOAD_ORDER_NETWORK_PROFILE, "wifi").toLowerCase();
  const validProfile = NETWORK_PROFILES[networkProfile] ? networkProfile : "wifi";
  const headless = asBoolean(process.env.LOAD_ORDER_HEADLESS, true);
  const artifactDir = path.resolve(rootDir, "artifacts", `load-order-${totalUsers}-casarita-${nowStamp()}`);
  await fs.mkdir(artifactDir, { recursive: true });

  const browser = await chromium.launch({ headless });
  const rows = new Array(totalUsers);
  const startedAt = new Date().toISOString();
  const runStart = Date.now();
  let cursor = 0;

  async function worker(workerId = 1) {
    while (true) {
      const current = cursor;
      cursor += 1;
      if (current >= totalUsers) return;
      const tableNumber = tableStart + current;
      const row = await runSingleOrderFlow({
        browser,
        guestConfig,
        index: current,
        tableNumber,
        networkProfile: validProfile,
        artifactDir,
        timeoutMs
      });
      row.workerId = workerId;
      rows[current] = row;
    }
  }

  try {
    const workers = [];
    for (let i = 0; i < concurrency; i += 1) {
      workers.push(worker(i + 1));
    }
    await Promise.all(workers);
  } finally {
    await browser.close().catch(() => undefined);
  }

  const finalizedRows = rows.filter(Boolean);
  const passedRuns = finalizedRows.filter((row) => row.pass).length;
  const failedRuns = finalizedRows.length - passedRuns;
  const passRatePct = Math.round((passedRuns / Math.max(1, finalizedRows.length)) * 100);
  const durationMs = Date.now() - runStart;

  const menuHalfLoadedRuns = finalizedRows.filter((row) => {
    const menu = row.images?.menuAfter1200ms || row.images?.menuImmediate;
    if (!menu) return false;
    return asNumber(menu.broken, 0) > 0 || asNumber(menu.pending, 0) > 0 || asNumber(menu.loadedRatio, 1) < 0.95;
  }).length;

  const summary = {
    totalUsers,
    concurrency,
    durationMs,
    passedRuns,
    failedRuns,
    passRatePct,
    totalPageErrors: finalizedRows.reduce((sum, row) => sum + asNumber(row.checks?.pageErrors, 0), 0),
    totalConsoleErrors: finalizedRows.reduce((sum, row) => sum + asNumber(row.checks?.consoleErrors, 0), 0),
    totalRequestFailures: finalizedRows.reduce((sum, row) => sum + asNumber(row.checks?.requestFailures, 0), 0),
    totalHttpErrors: finalizedRows.reduce((sum, row) => sum + asNumber(row.checks?.httpErrors, 0), 0),
    menuHalfLoadedRuns
  };

  const timingSummary = {
    menuVisibleMs: summarizeMetric(finalizedRows, (row) => row.timings?.menuVisibleMs),
    productOpenMs: summarizeMetric(finalizedRows, (row) => row.timings?.productOpenMs),
    addToCartMs: summarizeMetric(finalizedRows, (row) => row.timings?.addToCartMs),
    orderOutcomeMs: summarizeMetric(finalizedRows, (row) => row.timings?.orderOutcomeMs),
    totalMs: summarizeMetric(finalizedRows, (row) => row.timings?.totalMs)
  };

  const imageSummary = {
    menuLoadedRatioP50: percentile(finalizedRows.map((row) => row.images?.menuAfter1200ms?.loadedRatio), 0.5),
    menuLoadedRatioP95: percentile(finalizedRows.map((row) => row.images?.menuAfter1200ms?.loadedRatio), 0.95),
    menuPendingP50: percentile(finalizedRows.map((row) => row.images?.menuAfter1200ms?.pending), 0.5),
    menuPendingP95: percentile(finalizedRows.map((row) => row.images?.menuAfter1200ms?.pending), 0.95),
    detailLoadedRatioP50: percentile(finalizedRows.map((row) => row.images?.detailAfterOpen?.loadedRatio), 0.5),
    detailLoadedRatioP95: percentile(finalizedRows.map((row) => row.images?.detailAfterOpen?.loadedRatio), 0.95)
  };

  const report = {
    runId: `load-order-${totalUsers}-casarita-${nowStamp()}`,
    startedAt,
    endedAt: new Date().toISOString(),
    configFile,
    urlBase: guestConfig.guestRouteUrl,
    networkProfile: validProfile,
    summary,
    timingSummary,
    imageSummary,
    recommendations: buildRecommendations({
      rows: finalizedRows,
      summary
    }),
    failures: finalizedRows
      .filter((row) => !row.pass)
      .slice(0, 40)
      .map((row) => ({
        index: row.index,
        tableNumber: row.tableNumber,
        notes: row.notes,
        requestFailureSamples: row.requestFailureSamples,
        httpErrorSamples: row.httpErrorSamples
      })),
    rows: finalizedRows
  };

  const reportPath = path.resolve(artifactDir, `load-order-${totalUsers}-casarita-report.json`);
  await fs.writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");

  const stdoutSummary = {
    ok: passRatePct >= minPassRatePct,
    reportPath,
    summary,
    timingSummary,
    imageSummary,
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
