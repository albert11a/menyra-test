import {
  clickFirstVisible,
  clickIfPresent,
  fillIfPresent,
  openPageAndWait,
  openSocialTab,
  waitForAnySelector,
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

function splitSelectorList(value = "") {
  return String(value || "")
    .split(",")
    .map((entry) => asText(entry))
    .filter(Boolean);
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
  const menuState = await page.waitForFunction(() => {
    const isVisibleNode = (node) => {
      if (!(node instanceof HTMLElement)) return false;
      const style = window.getComputedStyle(node);
      if (style.display === "none" || style.visibility === "hidden" || Number(style.opacity || "1") === 0) {
        return false;
      }
      const rect = node.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0;
    };
    const hasVisibleSelector = (selector) => {
      return Array.from(document.querySelectorAll(selector)).some((entry) => isVisibleNode(entry));
    };
    if (
      hasVisibleSelector("#menuSearchInput")
      || hasVisibleSelector("[data-menu-add]")
      || hasVisibleSelector("[data-menu-add-food]")
      || hasVisibleSelector("[data-menu-add-drink]")
    ) {
      return { kind: "ready" };
    }
    const bodyText = String(document.body?.innerText || "");
    if (bodyText.includes("Bitte zuerst dein Business im Account auswaehlen.")) {
      return { kind: "missing_business" };
    }
    if (bodyText.includes("Diese Funktion ist nur fuer Business-Profile.")) {
      return { kind: "not_business" };
    }
    if (bodyText.includes("Account gesperrt")) {
      return { kind: "blocked" };
    }
    if (bodyText.includes("Nur Waiter-App freigegeben")) {
      return { kind: "waiter_only" };
    }
    return false;
  }, { timeout: 30000 }).then((handle) => handle.jsonValue());

  if (menuState?.kind === "ready") return;
  if (menuState?.kind === "missing_business") {
    throw new Error("Heart ist mit einem Konto eingeloggt, das in Menyra Social noch kein aktives Business im Account geladen hat.");
  }
  if (menuState?.kind === "not_business") {
    throw new Error("Heart ist im Menue nicht als echtes Business-Profil gelandet.");
  }
  if (menuState?.kind === "blocked") {
    throw new Error("Der Business-Account wurde von Menyra Social als gesperrt oder ohne Social-Zugriff geladen.");
  }
  if (menuState?.kind === "waiter_only") {
    throw new Error("Der Business-Account wurde nur als Waiter-/Staff-Zugang geladen, nicht als Business-Owner.");
  }
  await waitForAnySelector(page, [
    "#menuSearchInput",
    "[data-menu-add]",
    "[data-menu-add-food]",
    "[data-menu-add-drink]"
  ], 5000);
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

async function waitForMenuEditorReady(page, timeout = 25000) {
  const handle = await page.waitForFunction(() => {
    const isVisibleNode = (node) => {
      if (!(node instanceof HTMLElement)) return false;
      const style = window.getComputedStyle(node);
      if (style.display === "none" || style.visibility === "hidden" || Number(style.opacity || "1") === 0) {
        return false;
      }
      const rect = node.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0;
    };
    const nameInput = document.getElementById("menuItemName");
    const saveButton = document.getElementById("menuModalSave");
    const closeButton = document.getElementById("menuModalClose");
    if (isVisibleNode(nameInput) && isVisibleNode(saveButton)) {
      return { kind: "ready" };
    }
    if (isVisibleNode(nameInput) || isVisibleNode(saveButton) || isVisibleNode(closeButton)) {
      return { kind: "opening" };
    }
    const bodyText = String(document.body?.innerText || "");
    if (bodyText.includes("Bitte Namen eingeben.")) {
      return { kind: "validation" };
    }
    if (bodyText.includes("Speichern fehlgeschlagen.")) {
      return { kind: "save_failed" };
    }
    return false;
  }, { timeout });
  return handle.jsonValue();
}

async function waitForMenuSaveOutcome(page, timeout = 30000) {
  const handle = await page.waitForFunction(() => {
    const isVisibleNode = (node) => {
      if (!(node instanceof HTMLElement)) return false;
      const style = window.getComputedStyle(node);
      if (style.display === "none" || style.visibility === "hidden" || Number(style.opacity || "1") === 0) {
        return false;
      }
      const rect = node.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0;
    };
    const nameInput = document.getElementById("menuItemName");
    const saveButton = document.getElementById("menuModalSave");
    const bodyText = String(document.body?.innerText || "");
    if (bodyText.includes("Bitte Namen eingeben.")) {
      return { kind: "validation" };
    }
    if (bodyText.includes("Speichern fehlgeschlagen.")) {
      return { kind: "save_failed" };
    }
    if (!isVisibleNode(nameInput) && !isVisibleNode(saveButton)) {
      return { kind: "closed" };
    }
    if (bodyText.includes("Gespeichert.")) {
      return { kind: "saved" };
    }
    return false;
  }, { timeout });
  return handle.jsonValue();
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
      const openedCreateFlow = await clickFirstVisible(
        page,
        [
          ...splitSelectorList(businessConfig.productCreate.openSelector),
          "[data-menu-add-food]",
          "[data-menu-add-drink]",
          "[data-menu-add]"
        ],
        10000
      );
      if (!openedCreateFlow) {
        throw new Error("Heart konnte keinen sichtbaren Produkt-Hinzufuegen-Button im Menue finden.");
      }
      const editorState = await waitForMenuEditorReady(page, 25000);
      if (editorState?.kind !== "ready" && editorState?.kind !== "opening") {
        throw new Error("Heart konnte den Produkt-Editor im Menue nicht sichtbar oeffnen.");
      }
      const filledName = await fillIfPresent(page, businessConfig.productCreate.nameSelector, productName);
      if (!filledName) {
        throw new Error("Heart konnte den Produktnamen im Menue-Editor nicht eintragen.");
      }
      await page.waitForTimeout(250);
      const clickedSave = await clickIfPresent(page, businessConfig.productCreate.saveSelector);
      if (!clickedSave) {
        throw new Error("Heart konnte den Speichern-Button im Menue-Editor nicht klicken.");
      }
      const saveOutcome = await waitForMenuSaveOutcome(page, 30000).catch(() => null);
      if (saveOutcome?.kind === "validation") {
        throw new Error("Heart konnte das Produkt im Menue nicht speichern: Social meldet weiterhin einen ungueltigen Namen.");
      }
      if (saveOutcome?.kind === "save_failed") {
        throw new Error("Heart konnte das Produkt im Menue nicht speichern: Social meldet einen Speicherehler.");
      }
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
        await waitForMenuEditorReady(page, 25000);
        const filledNextName = await fillIfPresent(page, businessConfig.productEdit.inputSelector, nextName);
        if (!filledNextName) {
          throw new Error("Heart konnte den bearbeiteten Produktnamen im Menue-Editor nicht eintragen.");
        }
        await page.waitForTimeout(250);
        const clickedSave = await clickIfPresent(page, businessConfig.productEdit.saveSelector);
        if (!clickedSave) {
          throw new Error("Heart konnte den Speichern-Button fuer die Produktbearbeitung nicht klicken.");
        }
        const saveOutcome = await waitForMenuSaveOutcome(page, 30000).catch(() => null);
        if (saveOutcome?.kind === "validation") {
          throw new Error("Heart konnte die Produktbearbeitung nicht speichern: Social meldet einen ungueltigen Namen.");
        }
        if (saveOutcome?.kind === "save_failed") {
          throw new Error("Heart konnte die Produktbearbeitung nicht speichern: Social meldet einen Speicherehler.");
        }
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
