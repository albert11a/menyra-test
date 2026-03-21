import {
  clickIfPresent,
  fillIfPresent,
  openPageAndWait,
  openSocialTab,
  waitForText,
  waitForSelectorToDisappear,
  waitForTextToDisappear
} from "../helpers/social-app.mjs";
import { getSocialDefaultTabs } from "../helpers/social-app.mjs";
import {
  hasRequiredConfig,
  markGuarded,
  markSkipped,
  markNotConfigured,
  replaceRunTokens
} from "./common-actions.mjs";

const SOCIAL_TABS = getSocialDefaultTabs();

function isMutationEnabled(env) {
  return !!env.allowLiveMutations && !!env.syntheticIsolationKey;
}

async function runBusinessMutation({
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
  if (!isMutationEnabled(env)) {
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

export async function runBusinessSurfaceChecks({ page, env, heart, persona } = {}) {
  const businessConfig = env.packConfig?.actions?.business || {};
  async function runSurface(moduleKey, action, runner, title) {
    try {
      await runner();
    } catch (error) {
      heart.failModule(moduleKey, error, {
        action,
        title,
        persona: persona.key,
        area: moduleKey
      });
    }
  }
  if (businessConfig.menu?.url) {
    await runSurface("menu", "menu tab open", async () => {
      await openSocialTab(page, persona, heart, SOCIAL_TABS.menu, {
        moduleKey: "menu",
        note: "Business-Menue wurde ueber die konfigurierte URL geoeffnet.",
        absolute: businessConfig.menu.url
      });
    }, "Business-Menue konnte nicht geoeffnet werden");
  } else {
    await runSurface("menu", "menu tab open", async () => {
      await openSocialTab(page, persona, heart, SOCIAL_TABS.menu, {
        moduleKey: "menu",
        note: "Business-Menue wurde geoeffnet."
      });
    }, "Business-Menue konnte nicht geoeffnet werden");
  }

  if (businessConfig.focus?.url) {
    await runSurface("business", "focus tab open", async () => {
      await openPageAndWait(page, businessConfig.focus.url, "body", heart, {
        title: "Business / Open focus tab",
        moduleKey: "business",
        area: "business",
        persona: persona.key
      });
      heart.passModule("business", "Business-Fokus wurde geoeffnet.", {
        action: "focus tab open",
        persona: persona.key,
        area: "business"
      });
    }, "Business-Fokus konnte nicht geoeffnet werden");
  } else {
    heart.notConfiguredModule("business", "Business-Fokus-URL fehlt.", {
      action: "focus tab open",
      persona: persona.key,
      area: "business"
    });
  }
}

export async function runBusinessMutationChecks({ page, env, heart, persona } = {}) {
  const businessConfig = env.packConfig?.actions?.business || {};

  await runBusinessMutation({
    page,
    env,
    heart,
    persona,
    moduleKey: "menu",
    actionLabel: "Product create",
    config: businessConfig.productCreate,
    requiredKeys: ["url", "openSelector", "nameSelector", "saveSelector"],
    perform: async () => {
      await openPageAndWait(page, businessConfig.productCreate.url, "body", heart, {
        title: "Business / Open product create flow",
        moduleKey: "menu",
        area: "menu",
        persona: persona.key
      });
      const productName = replaceRunTokens(
        businessConfig.productCreate.nameTemplate || "TEST_RUN_<runId>_PRODUCT_1",
        env
      );
      await clickIfPresent(page, businessConfig.productCreate.openSelector);
      await fillIfPresent(page, businessConfig.productCreate.nameSelector, productName);
      await clickIfPresent(page, businessConfig.productCreate.saveSelector);
      await waitForSelectorToDisappear(page, "#menuModalClose", 20000).catch(() => undefined);
      await waitForSelectorToDisappear(page, businessConfig.productCreate.nameSelector || "#menuItemName", 20000).catch(() => undefined);
      if (businessConfig.productCreate.verifySelector) {
        await page.locator(businessConfig.productCreate.verifySelector).first().waitFor({ state: "visible", timeout: 15000 });
      }
      await waitForText(page, replaceRunTokens(businessConfig.productCreate.verifyText || productName, env), 20000);
      heart.addCreatedEntity({
        id: productName,
        type: "product",
        label: productName,
        status: "success",
        summary: "Testprodukt wurde erstellt.",
        cleanupStatus: "pending",
        module: "menu",
        persona: persona.key
      });
      heart.passModule("menu", "Produkt wurde erstellt.", {
        action: "product create",
        persona: persona.key,
        area: "menu"
      });
    }
  });

  await runBusinessMutation({
    page,
    env,
    heart,
    persona,
    moduleKey: "menu",
    actionLabel: "Product edit",
    config: businessConfig.productEdit,
    requiredKeys: ["url", "openSelector", "inputSelector", "saveSelector"],
    perform: async () => {
      await openPageAndWait(page, businessConfig.productEdit.url, "body", heart, {
        title: "Business / Open product edit flow",
        moduleKey: "menu",
        area: "menu",
        persona: persona.key
      });
      await clickIfPresent(page, businessConfig.productEdit.openSelector);
      const nextName = replaceRunTokens("TEST_RUN_<runId>_PRODUCT_EDIT", env);
      await fillIfPresent(page, businessConfig.productEdit.inputSelector, nextName);
      await clickIfPresent(page, businessConfig.productEdit.saveSelector);
      await waitForSelectorToDisappear(page, "#menuModalClose", 20000).catch(() => undefined);
      await waitForSelectorToDisappear(page, businessConfig.productEdit.inputSelector || "#menuItemName", 20000).catch(() => undefined);
      await waitForText(page, replaceRunTokens(businessConfig.productEdit.verifyText || nextName, env), 20000);
      heart.passModule("menu", "Produkt wurde bearbeitet.", {
        action: "product edit",
        persona: persona.key,
        area: "menu"
      });
    }
  });

  await runBusinessMutation({
    page,
    env,
    heart,
    persona,
    moduleKey: "menu",
    actionLabel: "Product delete",
    config: businessConfig.productDelete,
    requiredKeys: ["url", "openSelector"],
    perform: async () => {
      await openPageAndWait(page, businessConfig.productDelete.url, "body", heart, {
        title: "Business / Open product delete flow",
        moduleKey: "menu",
        area: "menu",
        persona: persona.key
      });
      await clickIfPresent(page, businessConfig.productDelete.openSelector);
      if (businessConfig.productDelete.confirmSelector) {
        await clickIfPresent(page, businessConfig.productDelete.confirmSelector);
      }
      if (businessConfig.productDelete.removedSelector) {
        await page.locator(businessConfig.productDelete.removedSelector).first().waitFor({ state: "hidden", timeout: 15000 });
      } else if (businessConfig.productDelete.removedText) {
        await waitForTextToDisappear(page, replaceRunTokens(businessConfig.productDelete.removedText, env), 15000);
      }
      heart.passModule("menu", "Produkt wurde geloescht.", {
        action: "product delete",
        persona: persona.key,
        area: "menu"
      });
    }
  });

  markSkipped(heart, "business", "Fokus- oder Spezial-Erstellung wird im Heart-Runner noch nicht separat gefahren.", {
    action: "focus create",
    persona: persona.key,
    area: "business"
  });
  markSkipped(heart, "business", "Zusaetzlicher Medien-Upload wird im Heart-Runner noch nicht separat gefahren.", {
    action: "media upload",
    persona: persona.key,
    area: "business"
  });
}
