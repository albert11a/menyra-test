import {
  clickIfPresent,
  fillIfPresent,
  openPageAndWait,
  openSocialTab,
  waitForText
} from "../helpers/social-app.mjs";
import { getSocialDefaultTabs } from "../helpers/social-app.mjs";
import {
  hasRequiredConfig,
  markGuarded,
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
  await perform();
  return { ok: true };
}

export async function runBusinessSurfaceChecks({ page, env, heart, persona } = {}) {
  const businessConfig = env.packConfig?.actions?.business || {};
  if (businessConfig.menu?.url) {
    await openSocialTab(page, persona, heart, SOCIAL_TABS.menu, {
      moduleKey: "menu",
      note: "Business-Menue wurde ueber die konfigurierte URL geoeffnet.",
      absolute: businessConfig.menu.url
    });
  } else {
    await openSocialTab(page, persona, heart, SOCIAL_TABS.menu, {
      moduleKey: "menu",
      note: "Business-Menue wurde geoeffnet."
    });
  }

  if (businessConfig.focus?.url) {
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
      if (businessConfig.productCreate.verifySelector) {
        await page.locator(businessConfig.productCreate.verifySelector).first().waitFor({ state: "visible", timeout: 15000 });
      } else if (businessConfig.productCreate.verifyText) {
        await waitForText(page, replaceRunTokens(businessConfig.productCreate.verifyText, env));
      }
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
      await fillIfPresent(page, businessConfig.productEdit.inputSelector, replaceRunTokens("TEST_RUN_<runId>_PRODUCT_EDIT", env));
      await clickIfPresent(page, businessConfig.productEdit.saveSelector);
      if (businessConfig.productEdit.verifyText) {
        await waitForText(page, replaceRunTokens(businessConfig.productEdit.verifyText, env));
      }
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
    requiredKeys: ["url", "openSelector", "confirmSelector"],
    perform: async () => {
      await openPageAndWait(page, businessConfig.productDelete.url, "body", heart, {
        title: "Business / Open product delete flow",
        moduleKey: "menu",
        area: "menu",
        persona: persona.key
      });
      await clickIfPresent(page, businessConfig.productDelete.openSelector);
      await clickIfPresent(page, businessConfig.productDelete.confirmSelector);
      if (businessConfig.productDelete.removedSelector) {
        await page.locator(businessConfig.productDelete.removedSelector).first().waitFor({ state: "hidden", timeout: 15000 });
      } else if (businessConfig.productDelete.removedText) {
        await waitForText(page, replaceRunTokens(businessConfig.productDelete.removedText, env));
      }
      heart.passModule("menu", "Produkt wurde geloescht.", {
        action: "product delete",
        persona: persona.key,
        area: "menu"
      });
    }
  });

  heart.notConfiguredModule("business", "Fokus- oder Spezial-Erstellung braucht noch genaue Selektoren.", {
    action: "focus create",
    persona: persona.key,
    area: "business"
  });
  heart.notConfiguredModule("business", "Medien-Upload braucht noch sichere Selektoren und einen Erfolgsnachweis.", {
    action: "media upload",
    persona: persona.key,
    area: "business"
  });
}
