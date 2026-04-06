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

function clamp(value, min, max) {
  const safeValue = asNumber(value, min);
  return Math.max(min, Math.min(max, safeValue));
}

function nowStamp() {
  return new Date().toISOString().replace(/[.:TZ-]/g, "").slice(0, 14);
}

function percentile(values = [], target = 0.5) {
  const numeric = values
    .map((value) => Number(value))
    .filter((value) => Number.isFinite(value))
    .sort((a, b) => a - b);
  if (!numeric.length) return null;
  const rank = Math.max(0, Math.min(numeric.length - 1, Math.ceil(target * numeric.length) - 1));
  return Math.round(numeric[rank]);
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
  const fallback = ["wifi", "slow4g"];
  const requested = asText(value)
    .split(",")
    .map((item) => asText(item).toLowerCase())
    .filter(Boolean);
  const unique = [];
  for (const key of (requested.length ? requested : fallback)) {
    if (!NETWORK_PROFILES[key]) continue;
    if (!unique.includes(key)) unique.push(key);
  }
  return unique.length ? unique : ["wifi"];
}

async function applyNetworkProfile(cdp, profileKey = "wifi") {
  if (!cdp) return { key: profileKey, ...NETWORK_PROFILES.wifi };
  const profile = NETWORK_PROFILES[profileKey] || NETWORK_PROFILES.wifi;
  if (!profile.emulate) {
    await cdp.send("Network.emulateNetworkConditions", {
      offline: false,
      latency: 0,
      downloadThroughput: -1,
      uploadThroughput: -1,
      connectionType: "none"
    }).catch(() => undefined);
    return {
      key: "wifi",
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

async function collectPerfMetrics(page) {
  try {
    return await page.evaluate(() => {
      const navEntries = performance.getEntriesByType("navigation");
      const nav = Array.isArray(navEntries) ? navEntries[navEntries.length - 1] : null;
      const paintEntries = performance.getEntriesByType("paint");
      const fcpEntry = (Array.isArray(paintEntries) ? paintEntries : []).find((entry) => entry?.name === "first-contentful-paint");
      const fpEntry = (Array.isArray(paintEntries) ? paintEntries : []).find((entry) => entry?.name === "first-paint");
      return {
        navType: String(nav?.type || ""),
        domContentLoadedMs: Number.isFinite(nav?.domContentLoadedEventEnd) ? Math.round(nav.domContentLoadedEventEnd) : null,
        loadMs: Number.isFinite(nav?.loadEventEnd) ? Math.round(nav.loadEventEnd) : null,
        responseStartMs: Number.isFinite(nav?.responseStart) ? Math.round(nav.responseStart) : null,
        firstPaintMs: Number.isFinite(fpEntry?.startTime) ? Math.round(fpEntry.startTime) : null,
        fcpMs: Number.isFinite(fcpEntry?.startTime) ? Math.round(fcpEntry.startTime) : null
      };
    });
  } catch {
    return {};
  }
}

async function waitForAnySelector(page, selectors = [], timeoutMs = 15000) {
  const safeSelectors = (Array.isArray(selectors) ? selectors : [])
    .map((selector) => asText(selector))
    .filter(Boolean);
  if (!safeSelectors.length) return "";
  const deadline = Date.now() + Math.max(1000, timeoutMs);
  while (Date.now() < deadline) {
    for (const selector of safeSelectors) {
      const locator = page.locator(selector).first();
      if (!await locator.count()) continue;
      if (!await locator.isVisible().catch(() => false)) continue;
      return selector;
    }
    await page.waitForTimeout(150).catch(() => undefined);
  }
  throw new Error(`selector-timeout:${safeSelectors.join(",")}`);
}

async function waitForMenuVisible(page, timeoutMs) {
  await waitForAnySelector(page, [
    'button:has-text("Hinzufuegen")',
    'button:has-text("Hinzufügen")',
    "[data-menu-open]",
    "#menuDetailAddToCartBtn"
  ], timeoutMs);
}

async function clickFirstVisible(page, selectors = [], timeoutMs = 8000) {
  const safeSelectors = (Array.isArray(selectors) ? selectors : [])
    .map((selector) => asText(selector))
    .filter(Boolean);
  const deadline = Date.now() + Math.max(1000, timeoutMs);
  while (Date.now() < deadline) {
    for (const selector of safeSelectors) {
      const locator = page.locator(selector).first();
      const count = await locator.count();
      if (!count) continue;
      try {
        if (!await locator.isVisible().catch(() => false)) continue;
        await locator.click({ timeout: 2500 });
        return selector;
      } catch {
        // Continue searching while UI is hydrating.
      }
    }
    await page.waitForTimeout(140).catch(() => undefined);
  }
  return "";
}

async function readMenuSnapshot(page, {
  productSelector = "[data-menu-open]"
} = {}) {
  return page.evaluate(({ selector }) => {
    function toText(value, fallback = "") {
      const text = String(value || "").trim();
      return text || fallback;
    }
    function isVisibleNode(node) {
      if (!(node instanceof HTMLElement)) return false;
      const style = window.getComputedStyle(node);
      if (style.display === "none" || style.visibility === "hidden" || Number(style.opacity || "1") === 0) {
        return false;
      }
      const rect = node.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0;
    }

    const productNodes = Array.from(document.querySelectorAll(selector || "[data-menu-open]"));
    const visibleProductNodes = productNodes.filter((node) => isVisibleNode(node));
    const productKeys = visibleProductNodes
      .map((node) => toText(
        node.getAttribute("data-menu-open")
        || node.getAttribute("data-menu-item-id")
        || node.getAttribute("data-id")
        || node.getAttribute("aria-label")
        || node.textContent
      ))
      .filter(Boolean);

    const brokenImages = [];
    let pendingImages = 0;
    let visibleImages = 0;
    const images = Array.from(document.images || []);
    for (const image of images) {
      if (!(image instanceof HTMLImageElement)) continue;
      if (!isVisibleNode(image)) continue;
      const src = toText(image.currentSrc || image.src);
      if (!src) continue;
      visibleImages += 1;
      if (!image.complete) {
        pendingImages += 1;
        continue;
      }
      if (Number(image.naturalWidth || 0) <= 0 || Number(image.naturalHeight || 0) <= 0) {
        brokenImages.push(src);
      }
      if (brokenImages.length >= 8) break;
    }

    const doc = document.documentElement;
    const body = document.body;
    const viewportWidth = Math.max(Number(window.innerWidth || 0), Number(doc?.clientWidth || 0), Number(body?.clientWidth || 0));
    const scrollWidth = Math.max(Number(doc?.scrollWidth || 0), Number(body?.scrollWidth || 0));
    const overflowPx = Math.max(0, scrollWidth - viewportWidth);
    const viewportHeight = Math.max(Number(window.innerHeight || 0), Number(doc?.clientHeight || 0), Number(body?.clientHeight || 0));
    const scrollTop = Math.max(Number(window.scrollY || 0), Number(window.pageYOffset || 0));
    const scrollHeight = Math.max(Number(doc?.scrollHeight || 0), Number(body?.scrollHeight || 0));
    const atBottom = scrollTop + viewportHeight >= scrollHeight - 4;

    return {
      productTotalCount: productNodes.length,
      productVisibleCount: visibleProductNodes.length,
      productKeys,
      brokenImages,
      pendingImages,
      visibleImages,
      overflowPx,
      viewportHeight,
      scrollTop,
      scrollHeight,
      atBottom
    };
  }, {
    selector: asText(productSelector, "[data-menu-open]")
  });
}

async function scanMenuSurface(page, {
  maxScrollSteps = 16,
  settleMs = 320,
  scrollRatio = 0.82,
  productSelector = "[data-menu-open]"
} = {}) {
  const discoveredProducts = new Set();
  const brokenImages = new Set();
  let maxVisibleProducts = 0;
  let maxTotalProducts = 0;
  let maxPendingImages = 0;
  let maxOverflowPx = 0;
  let scrollSteps = 0;
  let reachedBottom = false;
  let previousScrollTop = -1;
  let stagnantSteps = 0;

  for (let step = 0; step < Math.max(2, maxScrollSteps); step += 1) {
    await page.waitForTimeout(Math.max(100, settleMs)).catch(() => undefined);
    const snapshot = await readMenuSnapshot(page, { productSelector }).catch(() => null);
    if (!snapshot) continue;
    scrollSteps = step + 1;
    maxVisibleProducts = Math.max(maxVisibleProducts, Number(snapshot.productVisibleCount) || 0);
    maxTotalProducts = Math.max(maxTotalProducts, Number(snapshot.productTotalCount) || 0);
    maxPendingImages = Math.max(maxPendingImages, Number(snapshot.pendingImages) || 0);
    maxOverflowPx = Math.max(maxOverflowPx, Number(snapshot.overflowPx) || 0);
    (Array.isArray(snapshot.productKeys) ? snapshot.productKeys : []).forEach((key) => {
      const safeKey = asText(key);
      if (safeKey) discoveredProducts.add(safeKey);
    });
    (Array.isArray(snapshot.brokenImages) ? snapshot.brokenImages : []).forEach((src) => {
      const safeSrc = asText(src);
      if (safeSrc) brokenImages.add(safeSrc);
    });

    if (snapshot.atBottom) {
      reachedBottom = true;
      break;
    }
    const currentTop = Number(snapshot.scrollTop) || 0;
    if (Math.abs(currentTop - previousScrollTop) < 4) {
      stagnantSteps += 1;
      if (stagnantSteps >= 2) break;
    } else {
      stagnantSteps = 0;
    }
    previousScrollTop = currentTop;
    const delta = Math.max(180, Math.round((Number(snapshot.viewportHeight) || 700) * clamp(scrollRatio, 0.45, 0.95)));
    await page.mouse.wheel(0, delta).catch(() => undefined);
  }

  await page.evaluate(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }).catch(() => undefined);
  await page.waitForTimeout(Math.max(120, settleMs)).catch(() => undefined);
  const finalSnapshot = await readMenuSnapshot(page, { productSelector }).catch(() => null);

  return {
    discoveredProductCount: discoveredProducts.size || maxTotalProducts,
    maxVisibleProductCount: maxVisibleProducts,
    maxTotalProductCount: maxTotalProducts,
    brokenImageCount: brokenImages.size,
    brokenImageSamples: [...brokenImages].slice(0, 8),
    pendingImagesPeak: maxPendingImages,
    finalPendingImages: Number(finalSnapshot?.pendingImages) || 0,
    overflowPxPeak: maxOverflowPx,
    reachedBottom,
    scrollSteps
  };
}

async function runScenarioStep(page, scenario, options = {}) {
  const timeoutMs = Math.max(8000, asNumber(options.timeoutMs, 45000));
  const menuScanOptions = options.menuScan || {};
  const expectedProductCount = Math.max(0, Math.round(asNumber(options.expectedProductCount, 0)));
  const strictProductCount = options.strictProductCount === true;
  const maxPendingImages = Math.max(0, Math.round(asNumber(options.maxPendingImages, 10)));

  const stepStartedAt = Date.now();
  if (scenario.id === "home") {
    await page.waitForSelector("main", { timeout: timeoutMs });
    return {
      step: "home-visible",
      stepDurationMs: Date.now() - stepStartedAt
    };
  }
  if (scenario.id === "qr_menu" || scenario.id === "public_menu") {
    await waitForMenuVisible(page, timeoutMs);
    const menuSignals = await scanMenuSurface(page, menuScanOptions);
    if (menuSignals.brokenImageCount > 0) {
      throw new Error(`menu-broken-images:${menuSignals.brokenImageCount}`);
    }
    if (menuSignals.finalPendingImages > maxPendingImages) {
      throw new Error(`menu-pending-images:${menuSignals.finalPendingImages}`);
    }
    if (menuSignals.overflowPxPeak > 8) {
      throw new Error(`menu-overflow:${menuSignals.overflowPxPeak}`);
    }
    if (expectedProductCount > 0 && menuSignals.discoveredProductCount < expectedProductCount) {
      const message = `menu-product-count:${menuSignals.discoveredProductCount}/${expectedProductCount}`;
      if (strictProductCount) {
        throw new Error(message);
      }
      return {
        step: "menu-visible",
        stepDurationMs: Date.now() - stepStartedAt,
        menuSignals,
        warnings: [message]
      };
    }
    return {
      step: "menu-visible",
      stepDurationMs: Date.now() - stepStartedAt,
      menuSignals
    };
  }
  if (scenario.id === "qr_cart_prepare") {
    await waitForMenuVisible(page, timeoutMs);
    const addToCartStartedAt = Date.now();
    const clickedSelector = await clickFirstVisible(page, [
      "#menuDetailAddToCartBtn",
      'button:has-text("Hinzufuegen")',
      'button:has-text("Hinzufügen")',
      "[data-menu-open]"
    ], timeoutMs);
    if (!clickedSelector) {
      throw new Error("no visible add-to-cart trigger found");
    }
    const addToCartClickMs = Date.now() - addToCartStartedAt;
    await waitForAnySelector(page, [
      "[data-cart-checkout]",
      "[data-cart-qty]",
      'button:has-text("In den Warenkorb")',
      'button:has-text("Checkout starten")',
      'button:has-text("Tischbestellung absenden")',
      'button:has-text("Bestellung absenden")'
    ], timeoutMs);
    const menuSignals = await scanMenuSurface(page, menuScanOptions);
    if (menuSignals.brokenImageCount > 0) {
      throw new Error(`cart-menu-broken-images:${menuSignals.brokenImageCount}`);
    }
    if (menuSignals.finalPendingImages > maxPendingImages) {
      throw new Error(`cart-menu-pending-images:${menuSignals.finalPendingImages}`);
    }
    return {
      step: "cart-visible",
      stepDurationMs: Date.now() - stepStartedAt,
      addToCartClickMs,
      clickedSelector,
      menuSignals
    };
  }
  throw new Error(`unknown scenario: ${scenario.id}`);
}

function buildScenarios(baseUrl, restaurantId) {
  const safeBaseUrl = asText(baseUrl, "https://www.mnyra.com/social/");
  const safeRestaurantId = asText(restaurantId, "Lzm6RpNu3ErSDtGCHxpi");
  return [
    {
      id: "home",
      label: "Home cold",
      buildUrl: () => safeBaseUrl
    },
    {
      id: "qr_menu",
      label: "QR menu cold",
      buildUrl: ({ iteration }) => `${safeBaseUrl}?tab=menu&src=qr&r=${safeRestaurantId}&table=${iteration + 1}`
    },
    {
      id: "public_menu",
      label: "Public menu cold",
      buildUrl: () => `${safeBaseUrl}?tab=menu&r=${safeRestaurantId}`
    },
    {
      id: "qr_cart_prepare",
      label: "QR cart prepare cold",
      buildUrl: ({ iteration }) => `${safeBaseUrl}?tab=menu&src=qr&r=${safeRestaurantId}&table=${100 + iteration + 1}`
    }
  ];
}

async function main() {
  const baseUrl = asText(process.env.COLD_AUDIT_BASE_URL, "https://www.mnyra.com/social/");
  const restaurantId = asText(process.env.COLD_AUDIT_RESTAURANT_ID, "Lzm6RpNu3ErSDtGCHxpi");
  const iterations = Math.max(1, Math.round(asNumber(process.env.COLD_AUDIT_ITERATIONS, 5)));
  const timeoutMs = Math.max(8000, Math.round(asNumber(process.env.COLD_AUDIT_TIMEOUT_MS, 45000)));
  const headless = asBoolean(process.env.COLD_AUDIT_HEADLESS, true);
  const expectedProductCount = Math.max(0, Math.round(asNumber(process.env.COLD_AUDIT_EXPECTED_PRODUCTS, 0)));
  const strictProductCount = asBoolean(process.env.COLD_AUDIT_STRICT_PRODUCT_COUNT, false);
  const maxPendingImages = Math.max(0, Math.round(asNumber(process.env.COLD_AUDIT_MAX_PENDING_IMAGES, 10)));
  const failOnRequestFailures = asBoolean(process.env.COLD_AUDIT_FAIL_ON_REQUEST_FAILURES, false);
  const minPassRatePct = Math.max(0, Math.min(100, Math.round(asNumber(process.env.COLD_AUDIT_MIN_PASS_RATE_PCT, 95))));
  const menuScanMaxScrollSteps = Math.max(2, Math.round(asNumber(process.env.COLD_AUDIT_MENU_SCROLL_STEPS, 16)));
  const menuScanSettleMs = Math.max(120, Math.round(asNumber(process.env.COLD_AUDIT_MENU_SETTLE_MS, 320)));
  const menuScanScrollRatio = clamp(process.env.COLD_AUDIT_MENU_SCROLL_RATIO, 0.5, 0.95);
  const networkProfiles = parseNetworkProfiles(process.env.COLD_AUDIT_NETWORK_PROFILES);
  const artifactDir = path.resolve(process.cwd(), "artifacts", `cold-load-audit-${nowStamp()}`);
  await fs.mkdir(artifactDir, { recursive: true });

  const scenarios = buildScenarios(baseUrl, restaurantId);
  const browser = await chromium.launch({ headless });
  const runRows = [];
  const startedAt = new Date().toISOString();

  try {
    for (const scenario of scenarios) {
      for (const networkProfileKey of networkProfiles) {
        for (let iteration = 0; iteration < iterations; iteration += 1) {
          const context = await browser.newContext({
            viewport: { width: 390, height: 844 }
          });
          const page = await context.newPage();
          const row = {
            scenarioId: scenario.id,
            scenarioLabel: scenario.label,
            networkProfile: networkProfileKey,
            networkProfileLabel: asText(NETWORK_PROFILES[networkProfileKey]?.label, networkProfileKey),
            iteration: iteration + 1,
            url: scenario.buildUrl({ iteration }),
            cold: true,
            pass: false,
            responseStatus: null,
            durationMs: 0,
            stepDurationMs: 0,
            metrics: {},
            menuSignals: null,
            checks: {
              pageErrors: 0,
              consoleErrors: 0,
              requestFailures: 0,
              httpErrors: 0
            },
            notes: []
          };
          const runStart = Date.now();
          const requestFailures = [];
          const httpErrors = [];

          page.on("pageerror", () => {
            row.checks.pageErrors += 1;
          });
          page.on("console", (msg) => {
            if (msg.type() !== "error") return;
            row.checks.consoleErrors += 1;
            row.notes.push(`console:${msg.text()}`);
          });
          page.on("requestfailed", (request) => {
            const failure = String(request?.failure?.()?.errorText || "").toLowerCase();
            if (failure.includes("err_aborted")) return;
            row.checks.requestFailures += 1;
            if (requestFailures.length < 6) {
              requestFailures.push(`${request.method()} ${request.url()} :: ${request.failure()?.errorText || "failed"}`);
            }
          });
          page.on("response", (response) => {
            const status = Number(response.status());
            if (!Number.isFinite(status) || status < 400) return;
            row.checks.httpErrors += 1;
            if (httpErrors.length < 6) {
              httpErrors.push(`${response.request().method()} ${status} ${response.url()}`);
            }
          });

          try {
            const cdp = await context.newCDPSession(page).catch(() => null);
            if (cdp) {
              await cdp.send("Network.enable").catch(() => undefined);
              await cdp.send("Network.setCacheDisabled", { cacheDisabled: true }).catch(() => undefined);
              const profile = await applyNetworkProfile(cdp, networkProfileKey);
              row.networkProfile = profile.key;
              row.networkProfileLabel = asText(profile.label, row.networkProfileLabel);
            }

            const response = await page.goto(row.url, { waitUntil: "domcontentloaded", timeout: timeoutMs });
            row.responseStatus = response?.status?.() ?? null;
            if (!response || row.responseStatus >= 400) {
              throw new Error(`bad-response:${row.responseStatus ?? "none"}`);
            }

            const stepInfo = await runScenarioStep(page, scenario, {
              timeoutMs,
              expectedProductCount,
              strictProductCount,
              maxPendingImages,
              menuScan: {
                maxScrollSteps: menuScanMaxScrollSteps,
                settleMs: menuScanSettleMs,
                scrollRatio: menuScanScrollRatio,
                productSelector: "[data-menu-open]"
              }
            });
            row.notes.push(`step:${stepInfo.step}`);
            row.stepDurationMs = Math.round(asNumber(stepInfo.stepDurationMs, 0));
            if (stepInfo.clickedSelector) {
              row.notes.push(`clicked:${stepInfo.clickedSelector}`);
            }
            if (stepInfo.addToCartClickMs) {
              row.notes.push(`add-to-cart-ms:${Math.round(asNumber(stepInfo.addToCartClickMs, 0))}`);
            }
            if (Array.isArray(stepInfo.warnings) && stepInfo.warnings.length) {
              stepInfo.warnings.forEach((item) => row.notes.push(`warn:${item}`));
            }
            if (stepInfo.menuSignals && typeof stepInfo.menuSignals === "object") {
              row.menuSignals = stepInfo.menuSignals;
            }

            row.metrics = await collectPerfMetrics(page);

            if (row.checks.pageErrors > 0) throw new Error(`page-errors:${row.checks.pageErrors}`);
            if (row.checks.consoleErrors > 0) throw new Error(`console-errors:${row.checks.consoleErrors}`);
            if (row.checks.httpErrors > 0) throw new Error(`http-errors:${row.checks.httpErrors}`);
            if (failOnRequestFailures && row.checks.requestFailures > 0) throw new Error(`request-failures:${row.checks.requestFailures}`);
            row.pass = true;
          } catch (error) {
            row.pass = false;
            row.notes.push(`error:${String(error?.message || error)}`);
            const safeScenario = scenario.id.replace(/[^a-z0-9_-]+/gi, "-");
            const safeProfile = networkProfileKey.replace(/[^a-z0-9_-]+/gi, "-");
            const screenshotPath = path.resolve(artifactDir, `${safeScenario}-${safeProfile}-iter${iteration + 1}-fail.png`);
            await page.screenshot({ path: screenshotPath, fullPage: true }).catch(() => undefined);
            row.screenshot = screenshotPath;
          } finally {
            row.durationMs = Date.now() - runStart;
            if (requestFailures.length) row.requestFailureSamples = requestFailures;
            if (httpErrors.length) row.httpErrorSamples = httpErrors;
            runRows.push(row);
            await context.close().catch(() => undefined);
          }
        }
      }
    }
  } finally {
    await browser.close().catch(() => undefined);
  }

  const grouped = {};
  for (const row of runRows) {
    const key = `${row.scenarioId}::${row.networkProfile || "wifi"}`;
    if (!grouped[key]) {
      grouped[key] = {
        scenarioId: row.scenarioId,
        label: row.scenarioLabel,
        networkProfile: asText(row.networkProfile, "wifi"),
        networkProfileLabel: asText(row.networkProfileLabel, "WiFi / native"),
        totalRuns: 0,
        passedRuns: 0,
        failedRuns: 0,
        passRatePct: 0,
        p50DurationMs: null,
        p95DurationMs: null,
        p50StepDurationMs: null,
        p95StepDurationMs: null,
        p50DomContentLoadedMs: null,
        p95DomContentLoadedMs: null,
        p50FcpMs: null,
        p95FcpMs: null,
        maxDiscoveredProducts: 0,
        maxOverflowPx: 0,
        maxPendingImages: 0,
        brokenImageRuns: 0,
        totalPageErrors: 0,
        totalConsoleErrors: 0,
        totalRequestFailures: 0,
        totalHttpErrors: 0
      };
    }
    grouped[key].totalRuns += 1;
    grouped[key].passedRuns += row.pass ? 1 : 0;
    grouped[key].failedRuns += row.pass ? 0 : 1;
    grouped[key].totalPageErrors += row.checks.pageErrors;
    grouped[key].totalConsoleErrors += row.checks.consoleErrors;
    grouped[key].totalRequestFailures += row.checks.requestFailures;
    grouped[key].totalHttpErrors += row.checks.httpErrors;
    grouped[key].maxDiscoveredProducts = Math.max(
      grouped[key].maxDiscoveredProducts,
      Number(row.menuSignals?.discoveredProductCount) || 0
    );
    grouped[key].maxOverflowPx = Math.max(
      grouped[key].maxOverflowPx,
      Number(row.menuSignals?.overflowPxPeak) || 0
    );
    grouped[key].maxPendingImages = Math.max(
      grouped[key].maxPendingImages,
      Number(row.menuSignals?.pendingImagesPeak) || 0
    );
    if (Number(row.menuSignals?.brokenImageCount) > 0) {
      grouped[key].brokenImageRuns += 1;
    }
  }

  const scenarioSummaries = Object.values(grouped).map((summary) => {
    const rows = runRows.filter((row) => row.scenarioId === summary.scenarioId && row.networkProfile === summary.networkProfile);
    summary.passRatePct = Math.round((summary.passedRuns / Math.max(1, summary.totalRuns)) * 100);
    summary.p50DurationMs = percentile(rows.map((row) => row.durationMs), 0.5);
    summary.p95DurationMs = percentile(rows.map((row) => row.durationMs), 0.95);
    summary.p50StepDurationMs = percentile(rows.map((row) => row.stepDurationMs), 0.5);
    summary.p95StepDurationMs = percentile(rows.map((row) => row.stepDurationMs), 0.95);
    summary.p50DomContentLoadedMs = percentile(rows.map((row) => row.metrics?.domContentLoadedMs), 0.5);
    summary.p95DomContentLoadedMs = percentile(rows.map((row) => row.metrics?.domContentLoadedMs), 0.95);
    summary.p50FcpMs = percentile(rows.map((row) => row.metrics?.fcpMs), 0.5);
    summary.p95FcpMs = percentile(rows.map((row) => row.metrics?.fcpMs), 0.95);
    return summary;
  });

  const overall = {
    totalRuns: runRows.length,
    passedRuns: runRows.filter((row) => row.pass).length,
    failedRuns: runRows.filter((row) => !row.pass).length
  };
  overall.passRatePct = Math.round((overall.passedRuns / Math.max(1, overall.totalRuns)) * 100);

  const report = {
    runId: `cold-load-audit-${nowStamp()}`,
    startedAt,
    endedAt: new Date().toISOString(),
    baseUrl,
    restaurantId,
    iterationsPerScenario: iterations,
    networkProfiles,
    timeoutMs,
    expectedProductCount,
    strictProductCount,
    maxPendingImages,
    failOnRequestFailures,
    minPassRatePct,
    allCold: true,
    artifactDir,
    overall,
    scenarioSummaries,
    runs: runRows
  };

  const reportPath = path.resolve(artifactDir, "cold-load-audit-report.json");
  await fs.writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");

  const belowThresholdScenarios = scenarioSummaries.filter((summary) => Number(summary.passRatePct) < minPassRatePct);
  const auditPassed = Number(overall.passRatePct) >= minPassRatePct && !belowThresholdScenarios.length;
  const stdoutSummary = {
    ok: auditPassed,
    reportPath,
    overall,
    scenarioSummaries,
    minPassRatePct,
    failedThresholds: belowThresholdScenarios.map((summary) => ({
      scenarioId: summary.scenarioId,
      networkProfile: summary.networkProfile,
      passRatePct: summary.passRatePct
    }))
  };
  console.log(JSON.stringify(stdoutSummary, null, 2));
  if (!auditPassed) {
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
