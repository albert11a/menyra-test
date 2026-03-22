import {
  clickFirstVisible,
  findVisibleSelector,
  openPageAndWait,
  waitForAnySelector,
  waitForUiOutcome
} from "../helpers/social-app.mjs";
import { hasRequiredConfig, markGuarded, markNotConfigured, markSkipped } from "./common-actions.mjs";

function mutationReady(env) {
  return !!env.allowLiveMutations && !!env.syntheticIsolationKey;
}

function asText(value, fallback = "") {
  const text = String(value || "").trim();
  return text || fallback;
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

function describeSignals(values = []) {
  return uniqueList(values).join(" / ");
}

function isQrMenuRoute(url = "", guestConfig = {}) {
  const safeUrl = asText(url);
  const guestUrl = asText(guestConfig?.url);
  if (!safeUrl) return !!guestUrl;
  try {
    const parsed = new URL(safeUrl);
    const source = asText(parsed.searchParams.get("src"), parsed.searchParams.get("source")).toLowerCase();
    const tableNumber = Number(
      parsed.searchParams.get("table")
      || parsed.searchParams.get("tableNumber")
      || parsed.searchParams.get("t")
      || 0
    ) || 0;
    return source === "qr" || tableNumber > 0 || (!!guestUrl && safeUrl === guestUrl);
  } catch {
    return !!guestUrl && safeUrl === guestUrl;
  }
}

async function clickFirstVisibleLocator(page, selectors = [], timeout = 8000) {
  const safeSelectors = uniqueList(selectors);
  if (!safeSelectors.length) return "";
  const deadline = Date.now() + Math.max(250, Number(timeout) || 0);
  while (Date.now() < deadline) {
    for (const selector of safeSelectors) {
      const locator = page.locator(selector).first();
      if (!await locator.count()) continue;
      try {
        await locator.waitFor({ state: "visible", timeout: 300 });
        await locator.click({ timeout: 1500 });
        return selector;
      } catch {
        // Continue with the next selector while the UI is still hydrating.
      }
    }
    await page.waitForTimeout(120).catch(() => undefined);
  }
  return "";
}

async function waitForCartSurfaceReady(page, cartConfig = {}, guestConfig = {}, timeout = 20000) {
  return waitForAnySelector(page, uniqueList(
    guestConfig.menuVisibleSelector,
    cartConfig.menuVisibleSelector,
    guestConfig.productOpenSelector,
    guestConfig.openSelector,
    cartConfig.openSelector,
    cartConfig.triggerSelector,
    guestConfig.addToCartSelector,
    guestConfig.cartVisibleSelector,
    cartConfig.verifySelector,
    "[data-menu-open]",
    "[data-cart-checkout]",
    "#menuDetailAddToCartBtn"
  ), timeout);
}

async function ensureCartMenuTabVisible(page, cartConfig = {}, guestConfig = {}) {
  const menuReadySelectors = uniqueList(
    guestConfig.menuVisibleSelector,
    guestConfig.productOpenSelector,
    guestConfig.openSelector,
    guestConfig.addToCartSelector,
    guestConfig.cartVisibleSelector,
    cartConfig.openSelector,
    cartConfig.triggerSelector,
    cartConfig.verifySelector,
    "[data-menu-open]",
    "#menuDetailAddToCartBtn",
    "[data-cart-checkout]"
  );
  if (await findVisibleSelector(page, menuReadySelectors)) {
    return "";
  }
  const openedMenuTab = await clickFirstVisibleLocator(page, [
    cartConfig.menuTabSelector,
    "[data-profile-top-tab='menu']",
    "[data-business-top-tab='menu']"
  ], 8000) || await clickFirstVisible(page, [
    cartConfig.menuTabSelector,
    "[data-profile-top-tab='menu']",
    "[data-business-top-tab='menu']"
  ], 8000);
  if (!openedMenuTab) {
    return "";
  }
  await waitForAnySelector(page, menuReadySelectors, 15000).catch(() => "");
  return openedMenuTab;
}

async function ensureCartReady(page, cartConfig = {}, guestConfig = {}) {
  const cartReadySelectors = uniqueList(
    guestConfig.cartVisibleSelector,
    cartConfig.verifySelector,
    "[data-cart-checkout]",
    "[data-cart-qty]"
  );
  const cartReadyTexts = uniqueList(
    guestConfig.cartVisibleText,
    cartConfig.verifyText,
    "Checkout starten",
    "Bestellung absenden",
    "Tischbestellung absenden",
    "wurde zum Warenkorb hinzugefuegt"
  );
  let surfaceReadySelector = await waitForCartSurfaceReady(page, cartConfig, guestConfig, 12000).catch(() => "");
  if (!surfaceReadySelector) {
    await ensureCartMenuTabVisible(page, cartConfig, guestConfig);
    surfaceReadySelector = await waitForCartSurfaceReady(page, cartConfig, guestConfig, 15000).catch(() => "");
  }
  if (!surfaceReadySelector && isQrMenuRoute(cartConfig.url, guestConfig)) {
    await page.reload({ waitUntil: "domcontentloaded" }).catch(() => undefined);
    await page.waitForSelector("body", { timeout: 30000 }).catch(() => undefined);
    await ensureCartMenuTabVisible(page, cartConfig, guestConfig);
    surfaceReadySelector = await waitForCartSurfaceReady(page, cartConfig, guestConfig, 20000).catch(() => "");
  }
  const existingCartSelector = await findVisibleSelector(page, cartReadySelectors);
  if (existingCartSelector) {
    return {
      usedExistingCart: true,
      existingCartSelector
    };
  }
  const openSelectors = uniqueList(
    guestConfig.productOpenSelector,
    guestConfig.openSelector,
    cartConfig.openSelector,
    "[data-menu-open]"
  );
  let openedSelector = await clickFirstVisibleLocator(page, openSelectors, 8000);
  if (!openedSelector) {
    openedSelector = await clickFirstVisible(page, openSelectors, 8000);
  }
  if (openedSelector) {
    await waitForAnySelector(page, uniqueList(
      guestConfig.addToCartSelector,
      guestConfig.cartVisibleSelector,
      cartConfig.triggerSelector,
      "#menuDetailAddToCartBtn",
      cartConfig.verifySelector,
      "[data-cart-checkout]"
    ), 15000).catch(() => "");
  }
  const addToCartSelectors = uniqueList(
    guestConfig.addToCartSelector,
    cartConfig.triggerSelector,
    "#menuDetailAddToCartBtn"
  );
  let addedSelector = await clickFirstVisibleLocator(page, addToCartSelectors, openedSelector ? 15000 : 5000);
  if (!addedSelector) {
    await ensureCartMenuTabVisible(page, cartConfig, guestConfig);
    if (!openedSelector) {
      openedSelector = await clickFirstVisibleLocator(page, openSelectors, 5000)
        || await clickFirstVisible(page, openSelectors, 5000);
    }
    addedSelector = await clickFirstVisible(page, addToCartSelectors, 12000);
  }

  if (!addedSelector) {
    if (existingCartSelector) {
      return {
        usedExistingCart: true,
        existingCartSelector
      };
    }
    throw new Error("Heart konnte kein Produkt in den Warenkorb legen. Der Menue- oder Add-to-cart-Button war nicht sichtbar.");
  }

  const outcome = await waitForUiOutcome(page, {
    successSelectors: cartReadySelectors,
    successTexts: cartReadyTexts,
    timeout: 15000
  }).catch(() => null);

  if (!outcome && existingCartSelector) {
    return {
      usedExistingCart: true,
      existingCartSelector
    };
  }
  if (!outcome) {
    throw new Error("Heart konnte nach dem Hinzufuegen keinen sichtbaren Warenkorb bestaetigen.");
  }
  return {
    usedExistingCart: false,
    outcome
  };
}

async function submitOrder(page, orderConfig = {}, guestConfig = {}) {
  const submitSelectors = uniqueList(
    orderConfig.triggerSelector,
    guestConfig.orderTriggerSelector,
    "[data-cart-checkout='submit']"
  );
  const openSelectors = uniqueList(
    orderConfig.openSelector,
    guestConfig.orderOpenSelector,
    "[data-cart-checkout='open']"
  );
  const successSelectors = uniqueList(orderConfig.verifySelector, guestConfig.orderVerifySelector);
  const successTexts = uniqueList(
    orderConfig.successTexts,
    orderConfig.successText,
    guestConfig.orderSuccessTexts,
    guestConfig.orderSuccessText,
    "Bestellung gesendet",
    "Ihre Bestellung wird zubereitet und in Kuerze serviert."
  );
  const failureSelectors = uniqueList(orderConfig.failureSelector, guestConfig.orderFailureSelector);
  const failureTexts = uniqueList(
    orderConfig.failureTexts,
    orderConfig.failureText,
    guestConfig.orderFailureTexts,
    guestConfig.orderFailureText,
    "Bestellung konnte nicht gesendet werden."
  );

  if (!await findVisibleSelector(page, submitSelectors)) {
    await clickFirstVisibleLocator(page, openSelectors, 8000);
    await clickFirstVisible(page, openSelectors, 8000);
  }

  const submittedSelector = await clickFirstVisibleLocator(page, submitSelectors, 15000)
    || await clickFirstVisible(page, submitSelectors, 15000);
  if (!submittedSelector) {
    throw new Error("Heart konnte den Button zum Absenden der Bestellung nicht finden.");
  }

  const outcome = await waitForUiOutcome(page, {
    successSelectors,
    successTexts,
    failureSelectors,
    failureTexts,
    timeout: 20000
  }).catch(() => null);

  if (!outcome) {
    throw new Error(`Heart hat nach dem Absenden keinen Erfolgsnachweis gefunden. Erwartet wurden ${describeSignals(successTexts) || "sichtbare Erfolgsmerkmale"}.`);
  }
  if (outcome.kind === "failure") {
    throw new Error(`Die Bestellung ist sichtbar fehlgeschlagen: ${outcome.match}.`);
  }
  return outcome;
}

async function runCommerceMutation({
  page,
  env,
  heart,
  persona,
  moduleKey,
  actionLabel,
  config = {},
  requiredKeys = [],
  perform
} = {}) {
  if (!mutationReady(env)) {
    markGuarded(heart, moduleKey, `${actionLabel} ist im Moment geschuetzt. Aktiviere erst den isolierten Schreibmodus.`, {
      action: actionLabel,
      persona: persona.key,
      area: moduleKey
    });
    return { ok: false, reason: "guarded" };
  }
  if (!hasRequiredConfig(config, requiredKeys)) {
    markNotConfigured(heart, moduleKey, `${actionLabel} braucht erst eine saubere Einrichtung.`, {
      action: actionLabel,
      persona: persona.key,
      area: moduleKey
    });
    return { ok: false, reason: "not_configured" };
  }
  try {
    await perform();
    return { ok: true };
  } catch (error) {
    heart.failModule(moduleKey, error, {
      action: actionLabel,
      title: `${actionLabel} ist fehlgeschlagen`,
      persona: persona.key,
      area: moduleKey
    });
    return { ok: false, reason: "failed" };
  }
}

export async function runCartAndOrderChecks({ page, env, heart, persona } = {}) {
  const commerce = env.packConfig?.actions?.commerce || {};
  const cartConfig = commerce.cart || {};
  const orderConfig = commerce.order || {};
  const guestQrConfig = env.packConfig?.actions?.guest?.qrMenu || {};

  await runCommerceMutation({
    page,
    env,
    heart,
    persona,
    moduleKey: "cart",
    actionLabel: "Cart add/remove",
    config: cartConfig,
    requiredKeys: ["url"],
    perform: async () => {
      await openPageAndWait(page, cartConfig.url, "body", heart, {
        title: `${persona.label} / Open cart flow`,
        moduleKey: "cart",
        area: "cart",
        persona: persona.key
      });
      const cartResult = await ensureCartReady(page, cartConfig, guestQrConfig);
      if (cartConfig.removalSelector) {
        await clickFirstVisible(page, [
          cartConfig.removalSelector,
          "[data-cart-qty][data-cart-delta='-1']"
        ], 5000);
      }
      heart.passModule("cart", cartResult.usedExistingCart
        ? "Warenkorb war bereits sichtbar und wurde erfolgreich weiterverwendet."
        : "Warenkorb wurde erfolgreich geprueft.", {
        action: "cart add/remove",
        persona: persona.key,
        area: "cart"
      });
    }
  });

  await runCommerceMutation({
    page,
    env,
    heart,
    persona,
    moduleKey: "orders",
    actionLabel: "Order send",
    config: orderConfig,
    requiredKeys: ["url"],
    perform: async () => {
      await openPageAndWait(page, orderConfig.url || cartConfig.url, "body", heart, {
        title: `${persona.label} / Open order flow`,
        moduleKey: "orders",
        area: "orders",
        persona: persona.key
      });
      await ensureCartReady(page, cartConfig, guestQrConfig);
      const orderOutcome = await submitOrder(page, orderConfig, guestQrConfig);
      heart.passModule("orders", "Bestellung wurde erfolgreich angestossen.", {
        action: "order send",
        persona: persona.key,
        area: "orders",
        meta: {
          successSignal: asText(orderOutcome?.match)
        }
      });
    }
  });

  markSkipped(heart, "cart", "Mengen-Aenderung im Warenkorb wird im Heart-Runner noch nicht separat gefahren.", {
    action: "cart quantity update",
    persona: persona.key,
    area: "cart"
  });
}
