import {
  clickIfPresent,
  ensureElementVisible,
  openPageAndWait,
  waitForText
} from "../helpers/social-app.mjs";
import { hasRequiredConfig, markGuarded, markNotConfigured } from "./common-actions.mjs";

function mutationReady(env) {
  return !!env.allowLiveMutations && !!env.syntheticIsolationKey;
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
  await perform();
  return { ok: true };
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
    requiredKeys: ["url", "triggerSelector"],
    perform: async () => {
      await openPageAndWait(page, cartConfig.url, "body", heart, {
        title: `${persona.label} / Open cart flow`,
        moduleKey: "cart",
        area: "cart",
        persona: persona.key
      });
      await clickIfPresent(page, cartConfig.triggerSelector);
      if (cartConfig.verifySelector) {
        await ensureElementVisible(page, cartConfig.verifySelector);
      } else if (cartConfig.verifyText) {
        await waitForText(page, cartConfig.verifyText);
      }
      if (cartConfig.removalSelector) {
        await clickIfPresent(page, cartConfig.removalSelector);
      }
      heart.passModule("cart", "Warenkorb wurde erfolgreich geprueft.", {
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
    requiredKeys: ["url", "triggerSelector"],
    perform: async () => {
      await openPageAndWait(page, orderConfig.url || cartConfig.url, "body", heart, {
        title: `${persona.label} / Open order flow`,
        moduleKey: "orders",
        area: "orders",
        persona: persona.key
      });
      await clickIfPresent(page, orderConfig.triggerSelector);
      if (orderConfig.verifySelector) {
        await ensureElementVisible(page, orderConfig.verifySelector);
      } else if (orderConfig.successText) {
        await waitForText(page, orderConfig.successText);
      }
      heart.passModule("orders", "Bestellung wurde erfolgreich angestossen.", {
        action: "order send",
        persona: persona.key,
        area: "orders"
      });
    }
  });

  heart.notConfiguredModule("cart", "Mengen-Aenderung im Warenkorb braucht noch Selektoren und einen Erfolgsnachweis.", {
    action: "cart quantity update",
    persona: persona.key,
    area: "cart"
  });
}
