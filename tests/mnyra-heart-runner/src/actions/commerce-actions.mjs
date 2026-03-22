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

async function waitForCartSurfaceReady(page, cartConfig = {}, timeout = 20000) {
  return waitForAnySelector(page, uniqueList(
    cartConfig.menuVisibleSelector,
    cartConfig.openSelector,
    cartConfig.triggerSelector,
    cartConfig.verifySelector,
    "[data-menu-open]",
    "[data-cart-checkout]",
    "#menuDetailAddToCartBtn"
  ), timeout);
}

async function ensureCartReady(page, cartConfig = {}) {
  const cartReadySelectors = uniqueList(
    cartConfig.verifySelector,
    "[data-cart-checkout]",
    "[data-cart-qty]"
  );
  const cartReadyTexts = uniqueList(
    cartConfig.verifyText,
    "Checkout starten",
    "Bestellung absenden",
    "Tischbestellung absenden",
    "wurde zum Warenkorb hinzugefuegt"
  );
  await waitForCartSurfaceReady(page, cartConfig, 20000).catch(() => "");
  const existingCartSelector = await findVisibleSelector(page, cartReadySelectors);
  if (existingCartSelector) {
    return {
      usedExistingCart: true,
      existingCartSelector
    };
  }
  const openedSelector = await clickFirstVisible(page, [
    cartConfig.openSelector,
    "[data-menu-open]"
  ], 8000);
  if (openedSelector) {
    await waitForAnySelector(page, uniqueList(
      cartConfig.triggerSelector,
      "#menuDetailAddToCartBtn",
      cartConfig.verifySelector,
      "[data-cart-checkout]"
    ), 15000).catch(() => "");
  }
  const addedSelector = await clickFirstVisible(page, [
    cartConfig.triggerSelector,
    "#menuDetailAddToCartBtn"
  ], openedSelector ? 15000 : 5000);

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

async function submitOrder(page, orderConfig = {}) {
  const submitSelectors = uniqueList(
    orderConfig.triggerSelector,
    "[data-cart-checkout='submit']"
  );
  const openSelectors = uniqueList(
    orderConfig.openSelector,
    "[data-cart-checkout='open']"
  );
  const successSelectors = uniqueList(orderConfig.verifySelector);
  const successTexts = uniqueList(
    orderConfig.successTexts,
    orderConfig.successText,
    "Bestellung gesendet",
    "Ihre Bestellung wird zubereitet und in Kuerze serviert."
  );
  const failureSelectors = uniqueList(orderConfig.failureSelector);
  const failureTexts = uniqueList(
    orderConfig.failureTexts,
    orderConfig.failureText,
    "Bestellung konnte nicht gesendet werden."
  );

  if (!await findVisibleSelector(page, submitSelectors)) {
    await clickFirstVisible(page, openSelectors, 8000);
  }

  const submittedSelector = await clickFirstVisible(page, submitSelectors, 15000);
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
      const cartResult = await ensureCartReady(page, cartConfig);
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
      await ensureCartReady(page, cartConfig);
      const orderOutcome = await submitOrder(page, orderConfig);
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
