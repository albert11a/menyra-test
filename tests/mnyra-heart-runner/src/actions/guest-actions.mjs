import {
  clickFirstVisible,
  findVisibleSelector,
  waitForAnySelector,
  waitForUiOutcome
} from "../helpers/social-app.mjs";
import { runUiLayoutCheck } from "./ui-actions.mjs";
import { markSkipped } from "./common-actions.mjs";

function mutationReady(env = {}) {
  return !!env.allowLiveMutations && !!env.syntheticIsolationKey;
}

function asText(value, fallback = "") {
  const text = String(value || "").trim();
  return text || fallback;
}

function asNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function toPositiveInt(value, fallback = 0) {
  const numeric = Math.round(asNumber(value, fallback));
  return numeric > 0 ? numeric : Math.max(0, Math.round(asNumber(fallback, 0)));
}

function toList(...values) {
  return values.flatMap((value) => {
    if (Array.isArray(value)) {
      return value.map((item) => asText(item)).filter(Boolean);
    }
    const safeValue = asText(value);
    return safeValue ? [safeValue] : [];
  });
}

function uniqueList(...values) {
  const seen = new Set();
  return toList(...values).filter((item) => {
    const key = item.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function clamp(value, min, max) {
  const safeValue = asNumber(value, min);
  return Math.max(min, Math.min(max, safeValue));
}

function firstSelector(value, fallback = "") {
  const list = uniqueList(value);
  if (!list.length) return asText(fallback);
  const first = list[0];
  if (!first.includes(",")) {
    return first;
  }
  return asText(
    first
      .split(",")
      .map((entry) => asText(entry))
      .find(Boolean),
    fallback
  );
}

function percentile(values = [], factor = 0.5) {
  const sorted = (Array.isArray(values) ? values : [])
    .map((value) => Number(value))
    .filter((value) => Number.isFinite(value) && value >= 0)
    .sort((left, right) => left - right);
  if (!sorted.length) return null;
  const safeFactor = clamp(factor, 0, 1);
  const index = Math.max(0, Math.min(sorted.length - 1, Math.ceil(safeFactor * sorted.length) - 1));
  return Math.round(sorted[index]);
}

function summarizeDurations(samples = []) {
  const numeric = (Array.isArray(samples) ? samples : [])
    .map((value) => Number(value))
    .filter((value) => Number.isFinite(value) && value >= 0);
  if (!numeric.length) {
    return {
      count: 0,
      minMs: null,
      maxMs: null,
      p50Ms: null,
      p95Ms: null
    };
  }
  return {
    count: numeric.length,
    minMs: Math.round(Math.min(...numeric)),
    maxMs: Math.round(Math.max(...numeric)),
    p50Ms: percentile(numeric, 0.5),
    p95Ms: percentile(numeric, 0.95)
  };
}

function resolveGuestDetailConfig(guestConfig = {}) {
  return {
    productOpenSelector: firstSelector(guestConfig.productOpenSelector, "[data-menu-open]"),
    productSampleCount: Math.max(0, toPositiveInt(guestConfig.productOpenSamples, 4)),
    productOpenTimeoutMs: Math.max(2000, toPositiveInt(guestConfig.productOpenTimeoutMs, 12000)),
    productDetailVisibleSelectors: uniqueList(
      guestConfig.productDetailVisibleSelector,
      guestConfig.addToCartSelector,
      "#menuDetailAddToCartBtn",
      "#menuDetailTitle",
      "#menuModal",
      "[data-menu-detail]"
    ),
    productDetailCloseSelectors: uniqueList(
      guestConfig.productDetailCloseSelector,
      "#menuModalClose",
      "[data-menu-detail-close]",
      "[data-overlay-close='menu']",
      "[data-modal-close]"
    ),
    productDetailCloseSettleMs: Math.max(100, toPositiveInt(guestConfig.productDetailCloseSettleMs, 250)),
    menuScanMaxScrollSteps: Math.max(2, toPositiveInt(guestConfig.menuScanMaxScrollSteps, 16)),
    menuScanSettleMs: Math.max(120, toPositiveInt(guestConfig.menuScanSettleMs, 320)),
    menuScanScrollRatio: clamp(guestConfig.menuScanScrollRatio, 0.5, 0.95),
    expectedProductCount: Math.max(0, toPositiveInt(guestConfig.expectedProductCount, 0)),
    strictProductCount: guestConfig.strictProductCount === true,
    maxPendingImages: Math.max(0, toPositiveInt(guestConfig.maxPendingImages, 4)),
    menuVisibleWarnMs: Math.max(0, toPositiveInt(guestConfig.menuVisibleWarnMs, 4500)),
    menuVisibleFailMs: Math.max(0, toPositiveInt(guestConfig.menuVisibleFailMs, 12000)),
    cartReadyWarnMs: Math.max(0, toPositiveInt(guestConfig.cartReadyWarnMs, 5000)),
    cartReadyFailMs: Math.max(0, toPositiveInt(guestConfig.cartReadyFailMs, 15000)),
    productOpenWarnMs: Math.max(0, toPositiveInt(guestConfig.productOpenWarnMs, 2200)),
    productOpenFailMs: Math.max(0, toPositiveInt(guestConfig.productOpenFailMs, 6000))
  };
}

function recordTimingSignal({
  heart,
  label,
  action,
  persona,
  durationMs = 0,
  warnMs = 0,
  failMs = 0
} = {}) {
  const duration = Math.round(asNumber(durationMs, 0));
  if (!duration) return;
  if (failMs > 0 && duration >= failMs) {
    heart.failModule("performance", new Error(`${label} dauerte ${duration}ms (Fail ab ${failMs}ms).`), {
      action,
      title: `${label} war zu langsam`,
      persona,
      area: "performance",
      severity: "failed"
    });
    return;
  }
  if (warnMs > 0 && duration >= warnMs) {
    heart.warnModule("performance", `${label} dauerte ${duration}ms (Warn ab ${warnMs}ms).`, {
      action,
      persona,
      area: "performance"
    });
    return;
  }
  heart.passModule("performance", `${label} dauerte ${duration}ms.`, {
    action,
    persona,
    area: "performance"
  });
}

async function readMenuSurfaceSnapshot(page, {
  productOpenSelector = "[data-menu-open]"
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
    const productKeys = visibleProductNodes.map((node) => toText(
      node.getAttribute("data-menu-open")
      || node.getAttribute("data-menu-item-id")
      || node.getAttribute("data-id")
      || node.getAttribute("aria-label")
      || node.textContent
    )).filter(Boolean);

    const brokenImages = [];
    let visibleImages = 0;
    let pendingImages = 0;
    const imageNodes = Array.from(document.images || []);
    for (const image of imageNodes) {
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
    const viewportHeight = Math.max(Number(window.innerHeight || 0), Number(doc?.clientHeight || 0), Number(body?.clientHeight || 0));
    const scrollTop = Math.max(Number(window.scrollY || 0), Number(window.pageYOffset || 0));
    const scrollHeight = Math.max(Number(doc?.scrollHeight || 0), Number(body?.scrollHeight || 0));
    const atBottom = scrollTop + viewportHeight >= scrollHeight - 4;

    return {
      productTotalCount: productNodes.length,
      productVisibleCount: visibleProductNodes.length,
      productKeys,
      brokenImages,
      visibleImages,
      pendingImages,
      viewportHeight,
      scrollTop,
      scrollHeight,
      atBottom
    };
  }, {
    selector: asText(productOpenSelector, "[data-menu-open]")
  });
}

async function scanGuestMenuSurface(page, guestConfig = {}) {
  const detailConfig = resolveGuestDetailConfig(guestConfig);
  const discoveredProductKeys = new Set();
  const brokenImageSamples = new Set();
  let maxVisibleProductCount = 0;
  let maxTotalProductCount = 0;
  let maxPendingImages = 0;
  let visibleImagesPeak = 0;
  let reachedBottom = false;
  let scrollSteps = 0;
  let previousScrollTop = -1;
  let stagnantSteps = 0;

  for (let step = 0; step < detailConfig.menuScanMaxScrollSteps; step += 1) {
    await page.waitForTimeout(detailConfig.menuScanSettleMs).catch(() => undefined);
    const snapshot = await readMenuSurfaceSnapshot(page, {
      productOpenSelector: detailConfig.productOpenSelector
    }).catch(() => null);
    if (!snapshot) continue;

    scrollSteps = step + 1;
    maxVisibleProductCount = Math.max(maxVisibleProductCount, Number(snapshot.productVisibleCount) || 0);
    maxTotalProductCount = Math.max(maxTotalProductCount, Number(snapshot.productTotalCount) || 0);
    maxPendingImages = Math.max(maxPendingImages, Number(snapshot.pendingImages) || 0);
    visibleImagesPeak = Math.max(visibleImagesPeak, Number(snapshot.visibleImages) || 0);
    (Array.isArray(snapshot.productKeys) ? snapshot.productKeys : []).forEach((key) => {
      const safeKey = asText(key);
      if (safeKey) discoveredProductKeys.add(safeKey);
    });
    (Array.isArray(snapshot.brokenImages) ? snapshot.brokenImages : []).forEach((src) => {
      const safeSrc = asText(src);
      if (safeSrc) brokenImageSamples.add(safeSrc);
    });

    if (snapshot.atBottom) {
      reachedBottom = true;
      break;
    }

    const currentTop = Number(snapshot.scrollTop) || 0;
    if (Math.abs(currentTop - previousScrollTop) < 4) {
      stagnantSteps += 1;
      if (stagnantSteps >= 2) {
        break;
      }
    } else {
      stagnantSteps = 0;
    }
    previousScrollTop = currentTop;

    const delta = Math.max(180, Math.round((Number(snapshot.viewportHeight) || 720) * detailConfig.menuScanScrollRatio));
    await page.mouse.wheel(0, delta).catch(() => undefined);
  }

  await page.evaluate(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }).catch(() => undefined);
  await page.waitForTimeout(Math.min(1200, detailConfig.menuScanSettleMs)).catch(() => undefined);

  const finalSnapshot = await readMenuSurfaceSnapshot(page, {
    productOpenSelector: detailConfig.productOpenSelector
  }).catch(() => null);

  return {
    discoveredProductCount: discoveredProductKeys.size || maxTotalProductCount,
    maxVisibleProductCount,
    maxTotalProductCount,
    visibleImagesPeak,
    pendingImagesPeak: maxPendingImages,
    finalPendingImages: Number(finalSnapshot?.pendingImages) || 0,
    brokenImageCount: brokenImageSamples.size,
    brokenImageSamples: [...brokenImageSamples].slice(0, 8),
    reachedBottom,
    scrollSteps
  };
}

async function clickVisibleGuestProduct(page, selector = "[data-menu-open]", attemptIndex = 0) {
  return page.evaluate(({ productSelector, index }) => {
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

    const nodes = Array.from(document.querySelectorAll(productSelector || "[data-menu-open]"))
      .filter((node) => isVisibleNode(node));
    if (!nodes.length) {
      return null;
    }
    const mode = Math.max(0, Number(index) || 0) % 3;
    const targetIndex = mode === 0
      ? 0
      : mode === 1
        ? Math.floor((nodes.length - 1) / 2)
        : nodes.length - 1;
    const targetNode = nodes[targetIndex];
    if (!(targetNode instanceof HTMLElement)) {
      return null;
    }
    const productKey = toText(
      targetNode.getAttribute("data-menu-open")
      || targetNode.getAttribute("data-menu-item-id")
      || targetNode.getAttribute("aria-label")
      || targetNode.textContent
    );
    targetNode.click();
    return {
      productKey,
      visibleCandidates: nodes.length,
      targetIndex
    };
  }, {
    productSelector: asText(selector, "[data-menu-open]"),
    index: attemptIndex
  });
}

async function readVisibleDetailImageState(page) {
  return page.evaluate(() => {
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

    const containers = [
      "#menuModal",
      "#menuDetail",
      "[data-menu-detail]",
      "[data-menu-detail-modal]"
    ];
    const root = containers
      .map((selector) => document.querySelector(selector))
      .find((node) => isVisibleNode(node)) || document.body;
    const images = Array.from(root.querySelectorAll("img")).filter((node) => isVisibleNode(node));
    const broken = [];
    let pending = 0;
    for (const image of images) {
      if (!(image instanceof HTMLImageElement)) continue;
      const src = toText(image.currentSrc || image.src);
      if (!src) continue;
      if (!image.complete) {
        pending += 1;
        continue;
      }
      if (Number(image.naturalWidth || 0) <= 0 || Number(image.naturalHeight || 0) <= 0) {
        broken.push(src);
      }
    }
    return {
      visibleImageCount: images.length,
      pendingImageCount: pending,
      brokenImageCount: broken.length,
      brokenImageSamples: broken.slice(0, 6)
    };
  }).catch(() => ({
    visibleImageCount: 0,
    pendingImageCount: 0,
    brokenImageCount: 0,
    brokenImageSamples: []
  }));
}

async function runGuestProductDetailSamples(page, guestConfig = {}) {
  const detailConfig = resolveGuestDetailConfig(guestConfig);
  const attempts = detailConfig.productSampleCount;
  if (!attempts) {
    return {
      attempted: 0,
      successCount: 0,
      failedCount: 0,
      openDurations: [],
      durationSummary: summarizeDurations([]),
      brokenImageCount: 0,
      brokenImageSamples: [],
      failures: []
    };
  }

  const failures = [];
  const openDurations = [];
  const brokenImageSamples = new Set();
  let brokenImageCount = 0;
  let successCount = 0;

  for (let index = 0; index < attempts; index += 1) {
    if (index > 0) {
      await page.mouse.wheel(0, Math.round(640 * detailConfig.menuScanScrollRatio)).catch(() => undefined);
      await page.waitForTimeout(Math.min(800, detailConfig.menuScanSettleMs)).catch(() => undefined);
    }
    const clicked = await clickVisibleGuestProduct(page, detailConfig.productOpenSelector, index).catch(() => null);
    if (!clicked) {
      failures.push({
        attempt: index + 1,
        reason: "Kein sichtbarer Produkt-Button gefunden."
      });
      continue;
    }

    const startedAt = Date.now();
    try {
      await waitForAnySelector(page, detailConfig.productDetailVisibleSelectors, detailConfig.productOpenTimeoutMs);
      const openDurationMs = Date.now() - startedAt;
      openDurations.push(openDurationMs);
      successCount += 1;
      const imageState = await readVisibleDetailImageState(page);
      brokenImageCount += Number(imageState.brokenImageCount) || 0;
      (Array.isArray(imageState.brokenImageSamples) ? imageState.brokenImageSamples : []).forEach((sample) => {
        const safeSample = asText(sample);
        if (safeSample) brokenImageSamples.add(safeSample);
      });
    } catch (error) {
      failures.push({
        attempt: index + 1,
        reason: asText(error?.message, "Produktdetail konnte nicht geoeffnet werden."),
        productKey: asText(clicked.productKey)
      });
    } finally {
      const closedBySelector = await clickFirstVisible(page, detailConfig.productDetailCloseSelectors, 4500).catch(() => "");
      if (!closedBySelector) {
        await page.keyboard.press("Escape").catch(() => undefined);
      }
      await page.waitForTimeout(detailConfig.productDetailCloseSettleMs).catch(() => undefined);
    }
  }

  return {
    attempted: attempts,
    successCount,
    failedCount: attempts - successCount,
    openDurations,
    durationSummary: summarizeDurations(openDurations),
    brokenImageCount,
    brokenImageSamples: [...brokenImageSamples].slice(0, 8),
    failures
  };
}

async function ensureGuestCartReady(page, guestConfig = {}) {
  const cartReadySelectors = uniqueList(
    guestConfig.cartVisibleSelector,
    "[data-cart-checkout]",
    "[data-cart-qty]"
  );
  const existingCartSelector = await findVisibleSelector(page, cartReadySelectors);
  const openedSelector = await clickFirstVisible(page, [
    guestConfig.productOpenSelector,
    guestConfig.openSelector,
    "[data-menu-open]"
  ], 8000);
  const addedSelector = await clickFirstVisible(page, [
    guestConfig.addToCartSelector,
    "#menuDetailAddToCartBtn"
  ], openedSelector ? 15000 : 5000);

  if (!addedSelector) {
    if (existingCartSelector) {
      return {
        usedExistingCart: true,
        existingCartSelector
      };
    }
    throw new Error("Heart konnte im Gast-/QR-Menue keinen Artikel fuer den Warenkorb vorbereiten.");
  }

  const outcome = await waitForUiOutcome(page, {
    successSelectors: cartReadySelectors,
    successTexts: uniqueList(
      guestConfig.cartVisibleText,
      "Checkout starten",
      "Bestellung absenden",
      "Tischbestellung absenden",
      "wurde zum Warenkorb hinzugefuegt"
    ),
    timeout: 15000
  }).catch(() => null);

  if (!outcome && existingCartSelector) {
    return {
      usedExistingCart: true,
      existingCartSelector
    };
  }
  if (!outcome) {
    throw new Error("Heart konnte nach dem Hinzufuegen keinen sichtbaren Gast-Warenkorb bestaetigen.");
  }
  return {
    usedExistingCart: false,
    outcome
  };
}

async function submitGuestOrder(page, guestConfig = {}) {
  const submitSelectors = uniqueList(
    guestConfig.orderTriggerSelector,
    "[data-cart-checkout='submit']"
  );
  const openSelectors = uniqueList(
    guestConfig.orderOpenSelector,
    "[data-cart-checkout='open']"
  );
  const outcomeTexts = uniqueList(
    guestConfig.orderSuccessTexts,
    guestConfig.orderSuccessText,
    "Bestellung gesendet",
    "Ihre Bestellung wird zubereitet und in Kuerze serviert."
  );
  const failureTexts = uniqueList(
    guestConfig.orderFailureTexts,
    guestConfig.orderFailureText,
    "Bestellung konnte nicht gesendet werden."
  );

  if (!await findVisibleSelector(page, submitSelectors)) {
    await clickFirstVisible(page, openSelectors, 8000);
  }

  const submittedSelector = await clickFirstVisible(page, submitSelectors, 15000);
  if (!submittedSelector) {
    throw new Error("Heart konnte im Gast-/QR-Flow keinen sichtbaren Bestellbutton finden.");
  }

  const outcome = await waitForUiOutcome(page, {
    successSelectors: uniqueList(guestConfig.orderVerifySelector),
    successTexts: outcomeTexts,
    failureSelectors: uniqueList(guestConfig.orderFailureSelector),
    failureTexts,
    timeout: 20000
  }).catch(() => null);

  if (!outcome) {
    throw new Error("Heart hat nach dem Gast-/QR-Bestellklick keinen Erfolgsnachweis gefunden.");
  }
  if (outcome.kind === "failure") {
    throw new Error(`Die Gast-Bestellung ist sichtbar fehlgeschlagen: ${outcome.match}.`);
  }
  return outcome;
}

export async function runGuestChecks({ page, env, heart, persona } = {}) {
  const guestConfig = env.packConfig?.actions?.guest?.qrMenu || {};
  const guestDetailConfig = resolveGuestDetailConfig(guestConfig);
  if (!persona?.guestRouteUrl) {
    heart.notConfiguredModule("menu", "Gast- / QR-Link ist nicht eingerichtet.", {
      action: "guest route open",
      persona: persona?.key,
      area: "menu"
    });
    return;
  }

  const routeStartedAt = Date.now();
  await page.goto(persona.guestRouteUrl, { waitUntil: "domcontentloaded" });
  await page.waitForSelector("body", { timeout: 30000 });
  const routeLoadedMs = Date.now() - routeStartedAt;
  heart.passModule("menu", "Gast- / QR-Link wurde geladen.", {
    action: "guest route open",
    persona: persona.key,
    area: "menu",
    meta: {
      routeLoadedMs
    }
  });

  let menuVisibleMs = 0;
  try {
    const menuVisibleStartedAt = Date.now();
    await waitForAnySelector(page, uniqueList(
      guestConfig.menuVisibleSelector,
      "[data-menu-open]",
      "[data-cart-checkout]",
      "#menuDetailAddToCartBtn"
    ), 20000);
    menuVisibleMs = Date.now() - menuVisibleStartedAt;
    heart.passModule("menu", "Gast-Menue war sichtbar.", {
      action: "guest menu visible",
      persona: persona.key,
      area: "menu",
      meta: {
        menuVisibleMs
      }
    });
  } catch (error) {
    heart.failModule("menu", error, {
      action: "guest menu visible",
      title: "Gast-Menue war nicht sichtbar",
      persona: persona.key,
      area: "menu"
    });
  }

  recordTimingSignal({
    heart,
    label: "Gast-Menue sichtbar",
    action: "guest menu visible timing",
    persona: persona.key,
    durationMs: menuVisibleMs,
    warnMs: guestDetailConfig.menuVisibleWarnMs,
    failMs: guestDetailConfig.menuVisibleFailMs
  });

  try {
    const menuScan = await scanGuestMenuSurface(page, guestConfig);
    const productCountLabel = `${menuScan.discoveredProductCount} Produkte erkannt (max sichtbar ${menuScan.maxVisibleProductCount})`;
    if (menuScan.brokenImageCount > 0) {
      heart.failModule("menu", new Error(`Im Gast-Menue wurden ${menuScan.brokenImageCount} kaputte Bilder erkannt.`), {
        action: "guest menu image integrity",
        title: "Gast-Menue hat kaputte Bilder",
        persona: persona.key,
        area: "menu",
        severity: "failed"
      });
    } else {
      heart.passModule("menu", `Gast-Menue-Scan abgeschlossen: ${productCountLabel}.`, {
        action: "guest menu deep scan",
        persona: persona.key,
        area: "menu",
        meta: {
          discoveredProductCount: menuScan.discoveredProductCount,
          maxVisibleProductCount: menuScan.maxVisibleProductCount,
          pendingImagesPeak: menuScan.pendingImagesPeak,
          finalPendingImages: menuScan.finalPendingImages,
          scrollSteps: menuScan.scrollSteps,
          reachedBottom: menuScan.reachedBottom
        }
      });
    }

    if (guestDetailConfig.expectedProductCount > 0) {
      if (menuScan.discoveredProductCount < guestDetailConfig.expectedProductCount) {
        const countMessage = `Gast-Menue zeigte ${menuScan.discoveredProductCount}/${guestDetailConfig.expectedProductCount} erwarteten Produkten.`;
        if (guestDetailConfig.strictProductCount) {
          heart.failModule("menu", new Error(countMessage), {
            action: "guest menu product count",
            title: "Gast-Menue Produktanzahl zu niedrig",
            persona: persona.key,
            area: "menu",
            severity: "failed"
          });
        } else {
          heart.warnModule("menu", countMessage, {
            action: "guest menu product count",
            persona: persona.key,
            area: "menu"
          });
        }
      } else {
        heart.passModule("menu", `Gast-Menue Produktanzahl erreicht: ${menuScan.discoveredProductCount}/${guestDetailConfig.expectedProductCount}.`, {
          action: "guest menu product count",
          persona: persona.key,
          area: "menu"
        });
      }
    }

    if (menuScan.finalPendingImages > guestDetailConfig.maxPendingImages) {
      heart.warnModule("menu", `Nach dem Menue-Scan waren noch ${menuScan.finalPendingImages} Bilder nicht fertig geladen.`, {
        action: "guest menu pending images",
        persona: persona.key,
        area: "menu",
        meta: {
          pendingImagesPeak: menuScan.pendingImagesPeak
        }
      });
    }
  } catch (error) {
    heart.failModule("menu", error, {
      action: "guest menu deep scan",
      title: "Gast-Menue-Scan konnte nicht abgeschlossen werden",
      persona: persona.key,
      area: "menu"
    });
  }

  try {
    const detailRun = await runGuestProductDetailSamples(page, guestConfig);
    if (!detailRun.attempted) {
      heart.skipModule("menu", "Produkt-Detail-Samples sind fuer diesen Lauf deaktiviert.", {
        action: "guest menu product detail samples",
        persona: persona.key,
        area: "menu"
      });
    } else if (!detailRun.successCount) {
      heart.failModule("menu", new Error("Kein Produktdetail konnte in den Samples geoeffnet werden."), {
        action: "guest menu product detail samples",
        title: "Gast-Menue Produktdetails nicht erreichbar",
        persona: persona.key,
        area: "menu"
      });
    } else {
      const summary = detailRun.durationSummary;
      const summaryLabel = `${detailRun.successCount}/${detailRun.attempted} Produktdetails geoeffnet`;
      if (detailRun.failedCount > 0) {
        heart.warnModule("menu", `${summaryLabel}. ${detailRun.failedCount} Versuche schlugen fehl.`, {
          action: "guest menu product detail samples",
          persona: persona.key,
          area: "menu",
          meta: {
            durationSummary: summary,
            failureSamples: detailRun.failures.slice(0, 4)
          }
        });
      } else {
        heart.passModule("menu", `${summaryLabel}.`, {
          action: "guest menu product detail samples",
          persona: persona.key,
          area: "menu",
          meta: {
            durationSummary: summary
          }
        });
      }
      if (detailRun.brokenImageCount > 0) {
        heart.failModule("menu", new Error(`In den Produktdetails wurden ${detailRun.brokenImageCount} kaputte Bilder erkannt.`), {
          action: "guest menu detail image integrity",
          title: "Produktdetail-Bilder sind fehlerhaft",
          persona: persona.key,
          area: "menu",
          severity: "failed"
        });
      }
      recordTimingSignal({
        heart,
        label: "Gast-Produktdetail (P95)",
        action: "guest product detail timing",
        persona: persona.key,
        durationMs: summary.p95Ms || summary.maxMs || 0,
        warnMs: guestDetailConfig.productOpenWarnMs,
        failMs: guestDetailConfig.productOpenFailMs
      });
    }
  } catch (error) {
    heart.failModule("menu", error, {
      action: "guest menu product detail samples",
      title: "Produktdetail-Samples fehlgeschlagen",
      persona: persona.key,
      area: "menu"
    });
  }

  await runUiLayoutCheck(page, heart, {
    persona,
    viewLabel: "Gast- / QR-Menue",
    moduleKey: "ui",
    action: "ui guest layout",
    area: "ui"
  });

  let cartReadyMs = 0;
  try {
    const cartStartedAt = Date.now();
    const cartResult = await ensureGuestCartReady(page, guestConfig);
    cartReadyMs = Date.now() - cartStartedAt;
    heart.passModule("cart", cartResult.usedExistingCart
      ? "Gast-Warenkorb war bereits sichtbar."
      : "Gast-Warenkorb wurde ueber das QR-Menue erfolgreich erreicht.", {
      action: "guest cart visible",
      persona: persona.key,
      area: "cart",
      meta: {
        cartReadyMs
      }
    });
  } catch (error) {
    heart.failModule("cart", error, {
      action: "guest cart visible",
      title: "Gast-Warenkorb konnte nicht vorbereitet werden",
      persona: persona.key,
      area: "cart"
    });
  }

  recordTimingSignal({
    heart,
    label: "Gast-Warenkorb bereit",
    action: "guest cart timing",
    persona: persona.key,
    durationMs: cartReadyMs,
    warnMs: guestDetailConfig.cartReadyWarnMs,
    failMs: guestDetailConfig.cartReadyFailMs
  });

  if (!mutationReady(env)) {
    markSkipped(heart, "orders", "Gast-Bestellung wurde bis zum sicheren Vorbereitungsstand geprueft. Im Aenderungs-Guard schickt Heart bewusst keine echte Bestellung ab.", {
      action: "guest order flow",
      persona: persona.key,
      area: "orders"
    });
  } else {
    try {
      await ensureGuestCartReady(page, guestConfig);
      const orderOutcome = await submitGuestOrder(page, guestConfig);
      heart.passModule("orders", "Gast-Bestellung wurde ueber den QR- / Menue-Link erfolgreich angestossen.", {
        action: "guest order flow",
        persona: persona.key,
        area: "orders",
        meta: {
          successSignal: asText(orderOutcome?.match)
        }
      });
    } catch (error) {
      heart.failModule("orders", error, {
        action: "guest order flow",
        title: "Gast-Bestellung konnte nicht bestaetigt werden",
        persona: persona.key,
        area: "orders"
      });
    }
  }

  if (Array.isArray(guestConfig.privilegedSelectors) && guestConfig.privilegedSelectors.length) {
    const privilegedSelector = await findVisibleSelector(page, guestConfig.privilegedSelectors).catch(() => "");
    if (privilegedSelector) {
      heart.failModule("business", "Auf dem Gast- / QR-Link waren geschuetzte Business-Bedienelemente sichtbar.", {
        action: "guest privilege check",
        title: "Gast-Link zeigt geschuetzte Bedienelemente",
        severity: "critical",
        persona: persona.key,
        area: "business",
        meta: {
          selector: privilegedSelector
        }
      });
    } else {
      heart.passModule("business", "Gast- / QR-Link hat geschuetzte Bedienelemente sauber verborgen.", {
        action: "guest privilege check",
        persona: persona.key,
        area: "business"
      });
    }
  } else {
    heart.notConfiguredModule("business", "Selectoren fuer geschuetzte Gast-Bedienelemente fehlen.", {
      action: "guest privilege check",
      persona: persona.key,
      area: "business"
    });
  }
}
