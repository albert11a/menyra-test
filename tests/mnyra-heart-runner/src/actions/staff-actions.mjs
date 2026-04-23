import {
  clickIfPresent,
  ensureElementVisible,
  ensureWaiterShell,
  openWaiterSurface,
  waitForText
} from "../helpers/social-app.mjs";
import { hasRequiredConfig, markGuarded, markNotConfigured } from "./common-actions.mjs";

export async function runStaffChecks({ page, env, heart, persona } = {}) {
  const waiterConfig = env.packConfig?.actions?.staff?.waiter || {};
  try {
    try {
      await ensureWaiterShell(page);
      heart.passModule("orders", "Waiter-Oberflaeche war in der aktuellen Sitzung bereits geladen.", {
        action: "waiter open",
        persona: persona.key,
        area: "orders"
      });
    } catch {
      await openWaiterSurface(page, persona, heart, {
        absolute: waiterConfig.url || persona.baseUrl,
        moduleKey: "orders",
        note: "Waiter-Oberflaeche wurde geladen."
      });
    }
  } catch (error) {
    heart.failModule("orders", error, {
      action: "waiter open",
      title: "Waiter-Oberflaeche konnte nicht geladen werden",
      persona: persona.key,
      area: "orders"
    });
    return;
  }

  if (waiterConfig.orderVisibleSelector) {
    try {
      await ensureElementVisible(page, waiterConfig.orderVisibleSelector);
      heart.passModule("orders", "Bestellungen waren fuer den Service sichtbar.", {
        action: "order visible",
        persona: persona.key,
        area: "orders"
      });
    } catch (error) {
      heart.failModule("orders", error, {
        action: "order visible",
        title: "Bestellungen waren im Service nicht sichtbar",
        persona: persona.key,
        area: "orders"
      });
    }
  } else {
    heart.notConfiguredModule("orders", "Selector fuer sichtbare Bestellungen fehlt.", {
      action: "order visible",
      persona: persona.key,
      area: "orders"
    });
  }

  if (!env.allowLiveMutations || !env.syntheticIsolationKey) {
    markGuarded(heart, "orders", "Status-Aenderungen im Service sind im Moment geschuetzt. Aktiviere erst den isolierten Schreibmodus.", {
      action: "order status action",
      persona: persona.key,
      area: "orders"
    });
    return;
  }

  if (!hasRequiredConfig(waiterConfig, ["statusActionSelector"])) {
    markNotConfigured(heart, "orders", "Selektoren fuer Status-Aenderungen fehlen.", {
      action: "order status action",
      persona: persona.key,
      area: "orders"
    });
    return;
  }

  try {
    await clickIfPresent(page, waiterConfig.statusActionSelector);
    if (waiterConfig.verifySelector) {
      await ensureElementVisible(page, waiterConfig.verifySelector);
    } else if (waiterConfig.verifyText) {
      await waitForText(page, waiterConfig.verifyText);
    }
    heart.passModule("orders", "Status-Aktion im Service wurde ausgefuehrt.", {
      action: "order status action",
      persona: persona.key,
      area: "orders"
    });
  } catch (error) {
    heart.failModule("orders", error, {
      action: "order status action",
      title: "Status-Aktion im Service konnte nicht bestaetigt werden",
      persona: persona.key,
      area: "orders"
    });
  }
}
