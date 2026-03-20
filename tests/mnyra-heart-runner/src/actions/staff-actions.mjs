import {
  clickIfPresent,
  ensureElementVisible,
  openWaiterSurface,
  waitForText
} from "../helpers/social-app.mjs";
import { hasRequiredConfig, markGuarded, markNotConfigured } from "./common-actions.mjs";

export async function runStaffChecks({ page, env, heart, persona } = {}) {
  const waiterConfig = env.packConfig?.actions?.staff?.waiter || {};
  await openWaiterSurface(page, persona, heart, {
    absolute: waiterConfig.url || persona.baseUrl,
    moduleKey: "orders",
    note: "Waiter surface loaded."
  });

  if (waiterConfig.orderVisibleSelector) {
    await ensureElementVisible(page, waiterConfig.orderVisibleSelector);
    heart.passModule("orders", "Staff order visibility check passed.", {
      action: "order visible",
      persona: persona.key,
      area: "orders"
    });
  } else {
    heart.notConfiguredModule("orders", "Staff order visibility selector is not configured.", {
      action: "order visible",
      persona: persona.key,
      area: "orders"
    });
  }

  if (!env.allowLiveMutations || !env.syntheticIsolationKey) {
    markGuarded(heart, "orders", "Staff status action is guarded until isolated mutation mode is enabled.", {
      action: "order status action",
      persona: persona.key,
      area: "orders"
    });
    return;
  }

  if (!hasRequiredConfig(waiterConfig, ["statusActionSelector"])) {
    markNotConfigured(heart, "orders", "Staff status action selectors are not configured.", {
      action: "order status action",
      persona: persona.key,
      area: "orders"
    });
    return;
  }

  await clickIfPresent(page, waiterConfig.statusActionSelector);
  if (waiterConfig.verifySelector) {
    await ensureElementVisible(page, waiterConfig.verifySelector);
  } else if (waiterConfig.verifyText) {
    await waitForText(page, waiterConfig.verifyText);
  }
  heart.passModule("orders", "Staff status action completed.", {
    action: "order status action",
    persona: persona.key,
    area: "orders"
  });
}
