import {
  clickIfPresent,
  fillIfPresent,
  openPageAndWait,
  openSocialTab,
  waitForSelectorToDisappear,
  waitForTextToDisappear
} from "../helpers/social-app.mjs";
import { getSocialDefaultTabs } from "../helpers/social-app.mjs";
import { runUiLayoutCheck } from "./ui-actions.mjs";
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

function asText(value, fallback = "") {
  const text = String(value || "").trim();
  return text || fallback;
}

function getBusinessProductNames(env = {}) {
  return {
    original: replaceRunTokens("TEST_RUN_<runId>_PRODUCT_1", env),
    edited: replaceRunTokens("TEST_RUN_<runId>_PRODUCT_EDIT", env)
  };
}

async function openBusinessMenuAdmin(page, heart, persona, url, title) {
  await openPageAndWait(page, url, "body", heart, {
    title,
    moduleKey: "menu",
    area: "menu",
    persona: persona.key
  });
  await page.locator("#menuSearchInput, [data-menu-add], [data-menu-add-food]").first().waitFor({
    state: "visible",
    timeout: 20000
  });
}

async function searchBusinessMenu(page, queryText = "") {
  const safeQueryText = asText(queryText);
  const menuSearchInput = page.locator("#menuSearchInput").first();
  if (!await menuSearchInput.count()) return;
  await menuSearchInput.fill("");
  if (safeQueryText) {
    await menuSearchInput.fill(safeQueryText);
  }
  await page.waitForTimeout(600);
}

async function resolveMenuActionItemId(page, itemText = "", actionAttribute = "") {
  const safeItemText = asText(itemText);
  const safeActionAttribute = asText(actionAttribute);
  if (!safeItemText || !safeActionAttribute) return "";
  return page.evaluate((payload) => {
    const itemLabel = String(payload?.itemText || "").trim();
    const attr = String(payload?.actionAttribute || "").trim();
    if (!itemLabel || !attr) return "";
    const buttons = Array.from(document.querySelectorAll(`[${attr}]`));
    for (const button of buttons) {
      let node = button;
      while (node && node !== document.body) {
        const text = String(node.textContent || "").replace(/\s+/g, " ").trim();
        if (text.includes(itemLabel)) {
          return button.getAttribute(attr) || "";
        }
        node = node.parentElement;
      }
    }
    return "";
  }, {
    itemText: safeItemText,
    actionAttribute: safeActionAttribute
  });
}

async function clickMenuActionByItemId(page, actionAttribute = "", itemId = "") {
  const safeItemId = asText(itemId);
  const safeActionAttribute = asText(actionAttribute);
  if (!safeActionAttribute || !safeItemId) return false;
  return page.evaluate((payload) => {
    const attr = String(payload?.actionAttribute || "").trim();
    const id = String(payload?.itemId || "").trim();
    if (!attr || !id) return false;
    const selector = `[${attr}="${globalThis.CSS?.escape ? globalThis.CSS.escape(id) : id.replace(/"/g, '\\"')}"]`;
    const button = document.querySelector(selector);
    if (!(button instanceof HTMLElement)) return false;
    const details = button.closest("details");
    if (details instanceof HTMLDetailsElement) {
      details.open = true;
    }
    button.click();
    return true;
  }, {
    actionAttribute: safeActionAttribute,
    itemId: safeItemId
  });
}

async function waitForMenuItemByText(page, itemText = "", timeout = 20000) {
  const safeItemText = asText(itemText);
  if (!safeItemText) return;
  await page.waitForFunction(
    (expectedText) => {
      const bodyText = String(document.body?.innerText || "");
      return bodyText.includes(expectedText);
    },
    safeItemText,
    { timeout }
  );
}

async function waitForMenuItemToDisappear(page, itemText = "", timeout = 20000) {
  const safeItemText = asText(itemText);
  if (!safeItemText) return;
  await page.waitForFunction(
    (expectedText) => {
      const bodyText = String(document.body?.innerText || "");
      return !bodyText.includes(expectedText);
    },
    safeItemText,
    { timeout }
  );
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
      await runUiLayoutCheck(page, heart, {
        persona,
        viewLabel: "Business-Menue",
        action: "ui business menu layout"
      });
    }, "Business-Menue konnte nicht geoeffnet werden");
  } else {
    await runSurface("menu", "menu tab open", async () => {
      await openSocialTab(page, persona, heart, SOCIAL_TABS.menu, {
        moduleKey: "menu",
        note: "Business-Menue wurde geoeffnet."
      });
      await runUiLayoutCheck(page, heart, {
        persona,
        viewLabel: "Business-Menue",
        action: "ui business menu layout"
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
      await runUiLayoutCheck(page, heart, {
        persona,
        viewLabel: "Business-Fokus",
        action: "ui business focus layout"
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
  const productNames = getBusinessProductNames(env);

  const createResult = await runBusinessMutation({
    page,
    env,
    heart,
    persona,
    moduleKey: "menu",
    actionLabel: "Product create",
    config: businessConfig.productCreate,
    requiredKeys: ["url", "openSelector", "nameSelector", "saveSelector"],
    perform: async () => {
      const productName = replaceRunTokens(
        businessConfig.productCreate.nameTemplate || productNames.original,
        env
      );
      await openBusinessMenuAdmin(page, heart, persona, businessConfig.productCreate.url, "Business / Open product create flow");
      await clickIfPresent(page, businessConfig.productCreate.openSelector);
      await fillIfPresent(page, businessConfig.productCreate.nameSelector, productName);
      await clickIfPresent(page, businessConfig.productCreate.saveSelector);
      await waitForSelectorToDisappear(page, "#menuModalClose", 20000).catch(() => undefined);
      await waitForSelectorToDisappear(page, businessConfig.productCreate.nameSelector || "#menuItemName", 20000).catch(() => undefined);
      await openBusinessMenuAdmin(page, heart, persona, businessConfig.productCreate.url, "Business / Verify product create");
      await searchBusinessMenu(page, productName);
      await waitForMenuItemByText(page, replaceRunTokens(businessConfig.productCreate.verifyText || productName, env), 20000);
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

  const editResult = createResult.ok
    ? await runBusinessMutation({
      page,
      env,
      heart,
      persona,
      moduleKey: "menu",
      actionLabel: "Product edit",
      config: businessConfig.productEdit,
      requiredKeys: ["url", "inputSelector", "saveSelector"],
      perform: async () => {
        const nextName = replaceRunTokens(
          businessConfig.productEdit.verifyText || productNames.edited,
          env
        );
        await openBusinessMenuAdmin(page, heart, persona, businessConfig.productEdit.url, "Business / Open product edit flow");
        await searchBusinessMenu(page, productNames.original);
        const itemId = await resolveMenuActionItemId(page, productNames.original, "data-menu-edit");
        if (!itemId) {
          throw new Error("Heart konnte das eben erstellte Testprodukt zum Bearbeiten nicht finden.");
        }
        const clickedEdit = await clickMenuActionByItemId(page, "data-menu-edit", itemId);
        if (!clickedEdit) {
          throw new Error("Heart konnte die Bearbeiten-Aktion fuer das Testprodukt nicht ausloesen.");
        }
        await fillIfPresent(page, businessConfig.productEdit.inputSelector, nextName);
        await clickIfPresent(page, businessConfig.productEdit.saveSelector);
        await waitForSelectorToDisappear(page, "#menuModalClose", 20000).catch(() => undefined);
        await waitForSelectorToDisappear(page, businessConfig.productEdit.inputSelector || "#menuItemName", 20000).catch(() => undefined);
        await openBusinessMenuAdmin(page, heart, persona, businessConfig.productEdit.url, "Business / Verify product edit");
        await searchBusinessMenu(page, nextName);
        await waitForMenuItemByText(page, nextName, 20000);
        heart.passModule("menu", "Produkt wurde bearbeitet.", {
          action: "product edit",
          persona: persona.key,
          area: "menu"
        });
      }
    })
    : { ok: false, reason: "create_failed" };

  if (createResult.ok) {
    await runBusinessMutation({
      page,
      env,
      heart,
      persona,
      moduleKey: "menu",
      actionLabel: "Product delete",
      config: businessConfig.productDelete,
      requiredKeys: ["url"],
      perform: async () => {
        const targetName = editResult.ok ? productNames.edited : productNames.original;
        await openBusinessMenuAdmin(page, heart, persona, businessConfig.productDelete.url, "Business / Open product delete flow");
        await searchBusinessMenu(page, targetName);
        const itemId = await resolveMenuActionItemId(page, targetName, "data-menu-delete");
        if (!itemId) {
          throw new Error("Heart konnte das Testprodukt zum Loeschen nicht finden.");
        }
        const clickedDelete = await clickMenuActionByItemId(page, "data-menu-delete", itemId);
        if (!clickedDelete) {
          throw new Error("Heart konnte die Loeschen-Aktion fuer das Testprodukt nicht ausloesen.");
        }
        if (businessConfig.productDelete.confirmSelector) {
          await clickIfPresent(page, businessConfig.productDelete.confirmSelector);
        }
        await waitForTextToDisappear(page, targetName, 20000).catch(async () => {
          await waitForMenuItemToDisappear(page, targetName, 20000);
        });
        heart.passModule("menu", "Produkt wurde geloescht.", {
          action: "product delete",
          persona: persona.key,
          area: "menu"
        });
      }
    });
  }
}
